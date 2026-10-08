<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class StreakAndRankingTest extends TestCase
{
    /**
     * Verifica que el endpoint de leaderboard funcione en tiempo real
     * y devuelva los usuarios reales registrados en el sistema.
     */
    public function test_leaderboard_returns_real_registered_users(): void
    {
        $response = $this->getJson('/api/leaderboard');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        // El primer usuario debe tener rank 1 y badge de Oro
        $first = $data[0];
        $this->assertEquals(1, $first['rank']);
        $this->assertEquals('🥇 ORO', $first['badgePill']);
        $this->assertArrayHasKey('xp', $first);
        $this->assertArrayHasKey('streak', $first);
        $this->assertArrayHasKey('completedLessons', $first);
        $this->assertArrayHasKey('level', $first);
    }

    /**
     * Verifica que el endpoint de activity-ping registre el tiempo de estudio
     * y devuelva la telemetría exacta de racha.
     */
    public function test_streak_activity_ping_records_time_and_returns_telemetry(): void
    {
        $user = User::first();
        $this->assertNotNull($user);

        $tz = 'America/Bogota';
        $user->last_activity_date = Carbon::now($tz)->toDateString();
        $user->current_streak = 3;
        $user->previous_streak = 0;
        $user->save();

        $response = $this->postJson('/api/user/activity-ping', [
            'email'         => $user->email,
            'delta_seconds' => 30,
            'tz'            => $tz,
            'action'        => 'pulse',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'current_streak',
            'max_streak',
            'today_study_seconds',
            'today_study_minutes',
            'total_study_seconds',
            'last_activity_date',
            'weekly_matrix',
            'user_xp',
        ]);

        $data = $response->json();
        $this->assertTrue($data['success']);
        $this->assertGreaterThanOrEqual(1, $data['current_streak']);
        $this->assertCount(7, $data['weekly_matrix']);
    }

    /**
     * Verifica que el endpoint de clanes devuelva clanes reales con miembros reales.
     */
    public function test_clans_returns_real_clans_and_members(): void
    {
        $this->markTestSkipped('Módulo de clanes retirado temporalmente.');
    }

    /**
     * Verifica que si el estudiante no trabaja en días previos, su racha se apague
     * y pase a estado 'extinguished' con can_recover en true.
     */
    public function test_streak_extinguishes_when_student_does_not_work(): void
    {
        $user = User::first();
        $this->assertNotNull($user);

        // Simular que el estudiante tuvo actividad hace 3 días
        $user->last_activity_date = now()->subDays(3)->toDateString();
        $user->current_streak = 4;
        $user->previous_streak = 0;
        $user->save();

        $response = $this->getJson('/api/user/streak?email=' . urlencode($user->email));

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertEquals(0, $data['current_streak']);
        $this->assertEquals(4, $data['previous_streak']);
        $this->assertTrue($data['can_recover']);
        $this->assertEquals('extinguished', $data['flame_state']);
        $this->assertFalse($data['is_active_today']);
    }

    /**
     * Verifica que el endpoint de recovery-drill devuelva un ejercicio sencillo
     * con opciones y sin revelar la respuesta en el payload del cliente.
     */
    public function test_recovery_drill_endpoint_returns_exercise_without_plain_answer(): void
    {
        $response = $this->getJson('/api/user/streak/recovery-drill');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'id',
            'category',
            'difficulty',
            'question',
            'options',
            'hint',
        ]);

        $data = $response->json();
        $this->assertArrayNotHasKey('answer', $data);
        $this->assertNotEmpty($data['options']);
    }

    /**
     * Verifica que al resolver correctamente el ejercicio sencillo,
     * la racha apagada se recupere a (previous_streak + 1) y la llama se encienda.
     */
    public function test_streak_recovers_after_solving_simple_drill(): void
    {
        $user = User::first();
        $this->assertNotNull($user);

        $user->last_activity_date = now()->subDays(2)->toDateString();
        $user->current_streak = 0;
        $user->previous_streak = 5;
        $user->save();

        // drill-1 tiene como respuesta correcta "ls"
        $response = $this->postJson('/api/user/streak/recover', [
            'email'    => $user->email,
            'drill_id' => 'drill-1',
            'answer'   => 'ls',
        ]);

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertTrue($data['success']);
        $this->assertEquals(6, $data['current_streak']); // 5 + 1
        $this->assertEquals(0, $data['previous_streak']);
        $this->assertEquals(5, $data['recovered_days']);
        $this->assertEquals('active', $data['flame_state']);
        $this->assertTrue($data['is_active_today']);
        $this->assertFalse($data['can_recover']);

        // Verificar persistencia en base de datos
        $user->refresh();
        $this->assertEquals(6, $user->current_streak);
        $this->assertEquals(0, $user->previous_streak);
        $this->assertNotNull($user->streak_recovered_at);
    }

    /**
     * Verifica que una respuesta incorrecta al ejercicio no recupere la racha
     * y devuelva código de error con pista.
     */
    public function test_incorrect_drill_answer_does_not_recover_streak(): void
    {
        $user = User::first();
        $this->assertNotNull($user);

        $user->current_streak = 0;
        $user->previous_streak = 3;
        $user->save();

        $response = $this->postJson('/api/user/streak/recover', [
            'email'    => $user->email,
            'drill_id' => 'drill-1',
            'answer'   => 'comando_invalido',
        ]);

        $response->assertStatus(422);
        $data = $response->json();

        $this->assertFalse($data['success']);
        $this->assertArrayHasKey('hint', $data);

        // El usuario debe permanecer con racha apagada
        $user->refresh();
        $this->assertEquals(0, $user->current_streak);
        $this->assertEquals(3, $user->previous_streak);
    }
}
