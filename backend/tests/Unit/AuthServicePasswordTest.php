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
}
