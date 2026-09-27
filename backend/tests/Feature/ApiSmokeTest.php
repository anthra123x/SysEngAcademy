<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Smoke tests de regresión para la API pública y autenticación.
 *
 * Nota: usan la BD pgsql del entorno (sin RefreshDatabase) para no
 * destruir los datos sembrados. Los writes se revierten con transacciones.
 * Requiere haber ejecutado `php artisan migrate --seed` previamente.
 */
class ApiSmokeTest extends TestCase
{
    use DatabaseTransactions;

    public function test_endpoints_publicos_responden(): void
    {
        $this->getJson('/api/categories')->assertOk();
        $this->getJson('/api/courses')->assertOk();
        $this->getJson('/api/learning-paths')->assertOk();
    }

    public function test_detalle_curso_expone_contenido(): void
    {
        $response = $this->getJson('/api/courses/introduccion-programacion');

        $response->assertOk()
            ->assertJsonPath('title', 'Introducción a la Programación')
            ->assertJsonPath('is_published', true);
    }

    public function test_rutas_protegidas_requieren_autenticacion(): void
    {
        $this->getJson('/api/enrollments')->assertUnauthorized();
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->getJson('/api/ai/conversations')->assertUnauthorized();
    }

    public function test_login_devuelve_token_y_usuario(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'estudiante@sysengacademy.dev',
            'password' => 'estudiante1234',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']])
            ->assertJsonPath('user.email', 'estudiante@sysengacademy.dev');
    }

    public function test_registro_crea_usuario_y_token(): void
    {
        $email = 'nuevo'.uniqid().'@sysengacademy.dev';

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Nuevo Estudiante',
            'email' => $email,
            'password' => 'secret1234',
            'password_confirmation' => 'secret1234',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']])
            ->assertJsonPath('user.role', 'student');

        $this->assertDatabaseHas('users', ['email' => $email]);
    }

    public function test_inscripcion_y_progreso_flujo_completo(): void
    {
        $user = User::where('email', 'estudiante@sysengacademy.dev')->firstOrFail();
        $courseId = 1; // Introducción a la Programación (sembrado)

        // Inscribirse
        Sanctum::actingAs($user);
        $this->postJson('/api/enrollments', ['course_id' => $courseId])
            ->assertCreated();

        // Completar una lección y comprobar progreso
        $lessonId = 1;
        $this->postJson("/api/lessons/{$lessonId}/complete")
            ->assertOk()
            ->assertJsonPath('progress_percent', fn ($val) => $val > 0);
    }

    public function test_home_agrega_contenido_publico_en_una_llamada(): void
    {
        $this->getJson('/api/home')
            ->assertOk()
            ->assertJsonStructure([
                'categories',
                'learning_paths' => ['data'],
                'courses' => ['data'],
            ]);
    }

    public function test_jwt_permite_rutas_protegidas_y_logout_lo_revoca(): void
    {
        $login = $this->postJson('/api/auth/login', [
            'email' => 'estudiante@sysengacademy.dev',
            'password' => 'estudiante1234',
        ])->assertOk();

        $token = $login->json('token');

        // El token es un JWT (3 segmentos separados por punto)
        $this->assertSame(3, count(explode('.', $token)));

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('role', 'student');

        // Logout revoca el JWT (blacklist) → el mismo token ya no sirve
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertUnauthorized();
    }
}
