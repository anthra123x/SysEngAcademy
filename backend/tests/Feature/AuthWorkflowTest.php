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

        $response = $this->postJson('/api/auth/register', [
            'name'                  => 'Estudiante Ejemplo',
            'email'                 => $email,
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'ClaveSegura123',
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

        // 1. Registro inicial con minúsculas
        $res1 = $this->postJson('/api/auth/register', [
            'name'                  => 'Primer Registro',
            'email'                 => $emailLower,
            'password'              => 'ClaveSegura123',
            'password_confirmation' => 'ClaveSegura123',
        ]);
        $res1->assertStatus(201);

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
}
