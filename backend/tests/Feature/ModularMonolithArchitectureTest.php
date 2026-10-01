<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Users\Services\StudentProfileService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ModularMonolithArchitectureTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        User::updateOrCreate(
            ['email' => 'estudiante@sysengacademy.dev'],
            [
                'name' => 'Estudiante Demo',
                'password' => bcrypt('estudiante1234'),
                'role' => 'student',
            ]
        );
    }

    /**
     * Verifica que el servicio modular AuthService autentica correctamente al docente principal.
     */
    public function test_modular_auth_service_authenticates_teacher(): void
    {
        $authService = app(AuthService::class);
        $dto = LoginDTO::fromArray([
            'email'    => 'andrescamilomartinez330@gmail.com',
            'password' => 'kimetsunoyaiBa1',
        ]);

        $result = $authService->login($dto);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals('andrescamilomartinez330@gmail.com', $result['user']->email);
        $this->assertContains($result['user']->role, ['admin', 'instructor']);
    }

    /**
     * Verifica que el servicio modular AuthService autentica al estudiante demo.
     */
    public function test_modular_auth_service_authenticates_student_demo(): void
    {
        $authService = app(AuthService::class);
        $dto = LoginDTO::fromArray([
            'email'    => 'estudiante@sysengacademy.dev',
            'password' => 'estudiante1234',
        ]);

        $result = $authService->login($dto);

        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('token', $result);
        $this->assertEquals('estudiante@sysengacademy.dev', $result['user']->email);
        $this->assertEquals('student', $result['user']->role);
    }

    /**
     * Verifica que credenciales incorrectas son rechazadas limpiamente.
     */
    public function test_modular_auth_service_rejects_invalid_credentials(): void
    {
        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $authService = app(AuthService::class);
        $dto = LoginDTO::fromArray([
            'email'    => 'estudiante@sysengacademy.dev',
            'password' => 'password_incorrecto_123',
        ]);

        $authService->login($dto);
    }

    /**
     * Verifica el endpoint HTTP /api/auth/login.
     */
    public function test_http_login_endpoint(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'estudiante@sysengacademy.dev',
            'password' => 'estudiante1234',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);
    }

    /**
     * Verifica que un estudiante NO pueda acceder al panel docente (403 Forbidden).
     */
    public function test_student_cannot_access_teacher_overview(): void
    {
        $student = User::where('email', 'estudiante@sysengacademy.dev')->first()
            ?? User::where('role', 'student')->first();

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/teacher/overview');

        $response->assertStatus(403);
    }

    /**
     * Verifica que el docente SÍ pueda acceder al panel docente (200 OK con estadísticas).
     */
    public function test_teacher_can_access_teacher_overview_and_students(): void
    {
        $teacher = User::where('email', 'andrescamilomartinez330@gmail.com')->first()
            ?? User::where('role', 'admin')->first();

        $response = $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/teacher/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['total_students', 'total_courses', 'total_completions', 'total_enrollments'],
                'recent_activity',
                'popular_courses',
            ]);

        $studentsResponse = $this->actingAs($teacher, 'sanctum')
            ->getJson('/api/teacher/students');

        $studentsResponse->assertStatus(200);
    }

    /**
     * Verifica el endpoint /api/profile/summary para el perfil de estudiante.
     */
    public function test_student_profile_summary_endpoint(): void
    {
        $student = User::where('email', 'estudiante@sysengacademy.dev')->first();

        $response = $this->actingAs($student, 'sanctum')
            ->getJson('/api/profile/summary');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'stats' => ['enrolled_courses_count', 'completed_courses_count', 'xp', 'level', 'rank_title'],
                'enrollments',
            ]);
    }
}
