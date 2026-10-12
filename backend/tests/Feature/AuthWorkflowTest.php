<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthWorkflowTest extends TestCase
{
    public function test_user_can_register_successfully(): void
    {
        $email = 'estudiante_' . uniqid() . '@sysengacademy.dev';

        // 1. Paso 1: Solicitar código de activación
        $step1 = $this->postJson('/api/auth/register', [
            'name'                  => 'Estudiante Ejemplo',
            'email'                 => $email,
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'ClaveSegura123',
        ]);

        $step1->assertStatus(200)
            ->assertJsonPath('requires_verification', true)
            ->assertJsonPath('email', strtolower($email));

        // Obtener el código de activación emitido en caché segura (simula el buzón del usuario)
        $code = \Illuminate\Support\Facades\Cache::get("email_verify_code_" . strtolower($email));
        $this->assertNotEmpty($code);
        $this->assertEquals(6, strlen($code));

        // 2. Paso 2: Confirmar código y activar/crear la cuenta
        $response = $this->postJson('/api/auth/register/confirm', [
            'email' => $email,
            'code'  => $code,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => [
                    'id',
                    'name',
                    'email',
                    'role',
                    'email_verified_at',
                    'current_streak',
                    'xp',
                ],
                'token',
                'verification_required',
                'message',
            ])
            ->assertJsonPath('user.role', 'student')
            ->assertJsonPath('user.current_streak', 1)
            ->assertJsonPath('user.xp', 50)
            ->assertJsonPath('verification_required', false);

        $this->assertDatabaseHas('users', [
            'email' => $email,
            'name'  => 'Estudiante Ejemplo',
        ]);

        $createdUser = User::where('email', $email)->firstOrFail();
        $this->assertNotNull($createdUser->email_verified_at, 'El campo email_verified_at debe ser asignado en el registro.');
    }

    public function test_register_normalizes_email_and_prevents_duplicate_collision(): void
    {
        $base = 'usuario_' . uniqid();
        $emailLower = strtolower($base) . '@sysengacademy.dev';
        $emailUpper = strtoupper($base) . '@SYSENGACADEMY.DEV';

        // 1. Registro inicial completado
        $res1 = $this->postJson('/api/auth/register', [
            'name'                  => 'Primer Registro',
            'email'                 => $emailLower,
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'ClaveSegura123',
        ]);
        $res1->assertStatus(200);

        $code = \Illuminate\Support\Facades\Cache::get("email_verify_code_" . $emailLower);
        $confirmRes = $this->postJson('/api/auth/register/confirm', [
            'email' => $emailLower,
            'code'  => $code,
        ]);
        $confirmRes->assertStatus(201);

        // 2. Intento de registro con mayúsculas del mismo correo debe devolver 422 amigable, NO 500
        $res2 = $this->postJson('/api/auth/register', [
            'name'                  => 'Segundo Registro Mismo Correo',
            'email'                 => $emailUpper,
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'ClaveSegura123',
        ]);

        $res2->assertStatus(422);
        $res2->assertJsonValidationErrors(['email']);
        $errorMsg = $res2->json('errors.email.0');
        $this->assertStringContainsString('registrado', strtolower($errorMsg));
        $this->assertStringNotContainsString('validation.unique', $errorMsg, 'No debe retornar la clave cruda validation.unique');
    }

    public function test_register_short_password_returns_friendly_spanish_error(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Prueba Contraseña',
            'email'                 => 'pass_test_' . uniqid() . '@sysengacademy.dev',
            'password'              => '123',
            'password_confirmation' => '123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
        $errorMsg = $response->json('errors.password.0');
        $this->assertStringContainsString('8 caracteres', $errorMsg);
        $this->assertStringNotContainsString('validation.min.string', $errorMsg);
    }

    public function test_register_password_confirmation_mismatch_returns_spanish_error(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Prueba Confirmacion',
            'email'                 => 'mismatch_' . uniqid() . '@sysengacademy.dev',
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'OtraClaveDistinta456',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['password']);
        $errorMsg = $response->json('errors.password.0');
        $this->assertStringContainsString('coinciden', strtolower($errorMsg));
        $this->assertStringNotContainsString('validation.confirmed', $errorMsg);
    }

    public function test_login_flow_with_credentials(): void
    {
        $email = 'login_test_' . uniqid() . '@sysengacademy.dev';

        $user = User::create([
            'name'              => 'Usuario Login',
            'email'             => $email,
            'password'          => 'Password123',
            'role'              => 'student',
            'email_verified_at' => now(),
        ]);

        // Login exitoso
        $response = $this->postJson('/api/auth/login', [
            'email'    => strtoupper($email), // Normalización a minúsculas
            'password' => 'Password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['user', 'token'])
            ->assertJsonPath('user.email', $email);

        // Login con contraseña errónea
        $failResponse = $this->postJson('/api/auth/login', [
            'email'    => $email,
            'password' => 'Incorrecta123',
        ]);

        $failResponse->assertStatus(422);
    }

    public function test_user_can_request_and_confirm_email_delivery_check(): void
    {
        $testEmail = 'test_deliverability_' . uniqid() . '@example.com';

        // 1. Solicitar prueba de entrega de correo
        $response = $this->postJson('/api/auth/test-email', [
            'email' => $testEmail,
        ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('email', strtolower($testEmail))
            ->assertJsonStructure(['success', 'email', 'message']);

        // El código de verificación se envía al correo y se almacena en la caché segura
        $checkCode = \Illuminate\Support\Facades\Cache::get("test_email_check_" . strtolower($testEmail));
        $this->assertNotEmpty($checkCode);
        $this->assertEquals(6, strlen($checkCode));

        // 2. Confirmar código incorrecto
        $failConfirm = $this->postJson('/api/auth/confirm-test-email', [
            'email' => $testEmail,
            'code'  => '000000',
        ]);
        $failConfirm->assertStatus(422);

        // 3. Confirmar con el código generado
        $confirmResponse = $this->postJson('/api/auth/confirm-test-email', [
            'email' => $testEmail,
            'code'  => $checkCode,
        ]);

        $confirmResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('verified', true);
    }
}
