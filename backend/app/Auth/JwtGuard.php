<?php

namespace App\Auth;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Auth\GuardHelpers;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Contracts\Auth\UserProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Guard de autenticación stateless basada en JWT (HS256).
 *
 * Ventajas frente a tokens en BD (Sanctum):
 *  - No consulta personal_access_tokens por petición: clave para entornos
 *    con bases de datos frías/lentas (Neon) donde cada query paga arranque.
 *  - El usuario se resuelve con cache-aside (5 min) para no pegar a BD
 *    salvo la primera vez tras emitir el token.
 */
class JwtGuard implements Guard
{
    use GuardHelpers;

    protected Request $request;

    protected ?string $token = null;

    protected ?object $payload = null;

    public function __construct(UserProvider $provider, Request $request)
    {
        $this->provider = $provider;
        $this->request = $request;
    }

    /**
     * Guard stateless: el token se revalida en CADA llamada.
     *
     * No se puede confiar en $this->user entre requests: en workers
     * persistentes (test suite, Octane, RoadRunner) el mismo proceso
     * atiende varios requests y un usuario cacheado en instancia haría
     * que un token revocado (blacklist tras logout) siguiera pasando.
     */
    public function user()
    {
        $token = $this->getTokenForRequest();

        if (! $token || ! $this->isValid($this->decode($token))) {
            return $this->user = null;
        }

        $this->token = $token;

        // Cache-aside del perfil como ARRAY plano (el file cache no
        // deserializa objetos Eloquent) + hidratación sin consultar BD.
        // El cache por clave sub evita repetir la query dentro del mismo
        // request; la validez del token NO depende de esta caché.
        $data = Cache::remember("jwt.user.{$this->payload->sub}", 300, function () {
            return User::find($this->payload->sub)?->toArray();
        });

        return $this->user = $data
            ? User::hydrate([$data])->first()
            : null;
    }

    /**
     * Devuelve el token JWT actual (null si no hay/ no es válido).
     */
    public function token(): ?string
    {
        $this->user();

        return $this->token;
    }

    public function validate(array $credentials = []): bool
    {
        return false; // la emisión real ocurre en AuthController::login
    }

    protected function getTokenForRequest(): ?string
    {
        $header = $this->request->header('Authorization', '');

        if (preg_match('/Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }

    protected function decode(string $token): ?object
    {
        try {
            return JWT::decode($token, new Key($this->secret(), 'HS256'));
        } catch (\Throwable) {
            return null;
        }
    }

    protected function isValid(?object $payload): bool
    {
        if (! $payload || ! isset($payload->sub, $payload->exp, $payload->jti)) {
            return false;
        }

        if ($payload->exp < time()) {
            return false;
        }

        // Blacklist tras logout
        if (Cache::has("jwt.blacklist.{$payload->jti}")) {
            return false;
        }

        $this->payload = $payload;

        return true;
    }

    protected function secret(): string
    {
        return config('auth.jwt_secret') ?: (string) config('app.key');
    }
}
