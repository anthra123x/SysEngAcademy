<?php

namespace Tests\Unit;

use App\Models\User;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\Services\AuthService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServicePasswordTest extends TestCase
{
    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService();
    }

    public function test_can_authenticate_with_2b_hash_variant(): void
    {
        $plain = 'SecretPassword123!';
        // Generar hash estándar $2y$ y convertirlo a variante $2b$ (estilo Node.js/OpenBSD)
        $standardHash = password_hash($plain, PASSWORD_BCRYPT);
        $nodeHash = '$2b$' . substr($standardHash, 4);

        $user = new User([
            'name' => 'Test User',
            'email' => 'node_hash@test.com',
            'role' => 'student',
        ]);
        // Asignar el hash directamente sin rehashear
        $user->setRawAttributes(['password' => $nodeHash], true);

        // Invocar el método protegido mediante reflexión
        $ref = new \ReflectionClass(AuthService::class);
        $method = $ref->getMethod('verifyUserPassword');
        $method->setAccessible(true);

        $result = $method->invoke($this->authService, $plain, $user);
        $this->assertTrue($result, 'El hash $2b$ debe autenticarse exitosamente.');

        $wrongResult = $method->invoke($this->authService, 'WrongPassword', $user);
        $this->assertFalse($wrongResult, 'Una contraseña incorrecta debe retornar false.');
    }

    public function test_can_authenticate_with_standard_2y_hash(): void
    {
        $plain = 'MySecurePass!';
        $standardHash = password_hash($plain, PASSWORD_BCRYPT);

        $user = new User();
        $user->setRawAttributes(['password' => $standardHash], true);

        $ref = new \ReflectionClass(AuthService::class);
        $method = $ref->getMethod('verifyUserPassword');
        $method->setAccessible(true);

        $result = $method->invoke($this->authService, $plain, $user);
        $this->assertTrue($result);
    }

    public function test_can_authenticate_with_legacy_plaintext(): void
    {
        $plain = 'PlainPassword123';

        $user = new User();
        $user->setRawAttributes(['password' => $plain], true);

        $ref = new \ReflectionClass(AuthService::class);
        $method = $ref->getMethod('verifyUserPassword');
        $method->setAccessible(true);

        $result = $method->invoke($this->authService, $plain, $user);
        $this->assertTrue($result, 'Contraseña legacy en texto plano debe ser aceptada como fallback.');
    }

    public function test_can_authenticate_with_trailing_whitespace_tolerance(): void
    {
        $plain = 'MyPassword123';
        $standardHash = password_hash($plain, PASSWORD_BCRYPT);

        $user = new User();
        $user->setRawAttributes(['password' => $standardHash], true);

        $ref = new \ReflectionClass(AuthService::class);
        $method = $ref->getMethod('verifyUserPassword');
        $method->setAccessible(true);

        // Entrada con espacio accidental al final (típico en teclados móviles)
        $result = $method->invoke($this->authService, $plain . ' ', $user);
        $this->assertTrue($result, 'Contraseña con espacio trailing accidental debe ser aceptada.');

        // Entrada con espacio accidental al inicio
        $resultLeading = $method->invoke($this->authService, ' ' . $plain, $user);
        $this->assertTrue($resultLeading, 'Contraseña con espacio leading accidental debe ser aceptada.');
    }

    public function test_forgot_password_generates_code_for_existing_user(): void
    {
        $user = User::factory()->create([
            'email' => 'reset_test_' . uniqid() . '@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $response = $this->authService->forgotPassword($user->email);

        $this->assertTrue($response['sent']);
        $this->assertArrayNotHasKey('recovery_code', $response, 'No debe filtrar el código de recuperación en la respuesta JSON');

        // El código debe estar almacenado en la caché segura
        $cachedCode = \Illuminate\Support\Facades\Cache::get("password_reset_code_{$user->id}");
        $this->assertNotEmpty($cachedCode);
        $this->assertEquals(6, strlen($cachedCode));

        // Test reset password with the real generated code
        $resetResult = $this->authService->resetPassword(
            $user->email,
            $cachedCode,
            'NewBrandPassword123!'
        );

        $this->assertStringContainsString('exitosa', $resetResult['message']);

        // Check user can authenticate with the new password
        $user->refresh();
        $this->assertTrue(Hash::check('NewBrandPassword123!', $user->password));
    }

    public function test_reset_password_rejects_invalid_or_fake_code(): void
    {
        $user = User::factory()->create([
            'email' => 'fallback_test_' . uniqid() . '@example.com',
            'password' => Hash::make('OldPassword123!'),
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->authService->resetPassword(
            $user->email,
            '000000',
            'NewPassword777!'
        );
    }

    public function test_change_password_for_authenticated_user(): void
    {
        $user = User::factory()->create([
            'email' => 'change_test_' . uniqid() . '@example.com',
            'password' => Hash::make('CurrentSecret123!'),
        ]);

        // Wrong current password should fail
        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->authService->changePassword($user, 'NewValidSecret123!', 'WrongSecret');
    }

    public function test_change_password_success_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'email' => 'change_ok_' . uniqid() . '@example.com',
            'password' => Hash::make('CurrentSecret123!'),
        ]);

        $result = $this->authService->changePassword($user, 'NewValidSecret123!', 'CurrentSecret123!');
        $this->assertStringContainsString('exitosa', $result['message']);

        $user->refresh();
        $this->assertTrue(Hash::check('NewValidSecret123!', $user->password));
    }
}
