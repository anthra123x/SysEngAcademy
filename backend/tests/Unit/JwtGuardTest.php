<?php

namespace Tests\Unit;

use App\Auth\JwtGuard;
use Firebase\JWT\JWT;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Mockery;
use Tests\TestCase;

/**
 * Tests del guard JWT stateless. No requieren BD: cubren la validación
 * de firma, la blacklist de logout y la regresión del singleton (un guard
 * reutilizado en el mismo proceso debe revalidar el token en cada llamada).
 */
class JwtGuardTest extends TestCase
{
    protected function makeToken(int $userId = 999): array
    {
        $now = time();

        $payload = [
            'iss' => config('app.url'),
            'sub' => $userId,
            'role' => 'student',
            'name' => 'Estudiante Test',
            'email' => 'test@example.com',
            'iat' => $now,
            'exp' => $now + 3600,
            'jti' => 'test-jti-'.uniqid(),
        ];

        return [JWT::encode($payload, (string) config('app.key'), 'HS256'), $payload];
    }

    protected function makeGuard(string $authorizationHeader): JwtGuard
    {
        $request = Request::create('/api/test', 'GET', [], [], [], [
            'HTTP_AUTHORIZATION' => $authorizationHeader,
        ]);

        return new JwtGuard(Mockery::mock(UserProvider::class), $request);
    }

    public function test_sin_token_no_autentica(): void
    {
        $guard = $this->makeGuard('');

        $this->assertNull($guard->user());
        $this->assertFalse($guard->check());
    }

    public function test_token_blacklisteado_tras_logout_no_autentica(): void
    {
        Cache::flush();

        [$token, $payload] = $this->makeToken();

        Cache::put("jwt.blacklist.{$payload['jti']}", true, 3600);

        $guard = $this->makeGuard("Bearer {$token}");

        // La blacklist se valida ANTES de resolver el usuario → no toca BD.
        $this->assertNull($guard->user());
        $this->assertFalse($guard->check());
    }

    public function test_token_expirado_no_autentica(): void
    {
        Cache::flush();

        $now = time();
        $payload = [
            'iss' => config('app.url'),
            'sub' => 999,
            'role' => 'student',
            'name' => 'Test',
            'email' => 'test@example.com',
            'iat' => $now - 7200,
            'exp' => $now - 3600,
            'jti' => 'test-jti-expired',
        ];
        $token = JWT::encode($payload, (string) config('app.key'), 'HS256');

        $guard = $this->makeGuard("Bearer {$token}");

        $this->assertNull($guard->user());
        $this->assertFalse($guard->check());
    }

    /**
     * Regresión: un guard singleton reutilizado en el mismo proceso (test
     * suite, Octane, RoadRunner) no debe autenticar un token revocado.
     * Antes del fix, user() devolvía el usuario cacheado en instancia y el
     * logout no tenía efecto en el siguiente request del mismo proceso.
     */
    public function test_el_guard_revalida_el_token_en_cada_llamada(): void
    {
        Cache::flush();

        [$token, $payload] = $this->makeToken();

        // Perfil ya cacheado de un request anterior del mismo proceso
        Cache::put('jwt.user.999', [
            'id' => 999, 'name' => 'Test', 'email' => 'test@example.com', 'role' => 'student',
        ], 300);

        $guard = $this->makeGuard("Bearer {$token}");

        // Request 1: token válido → autentica (sin consultar BD, perfil en caché)
        $this->assertNotNull($guard->user());
        $this->assertTrue($guard->check());

        // Logout revoca el token en el mismo proceso
        Cache::put("jwt.blacklist.{$payload['jti']}", true, 3600);

        // Request 2 con el MISMO guard: debe revalidar y rechazar
        $this->assertNull($guard->user());
        $this->assertFalse($guard->check());
    }
}
