<?php

namespace Tests\Feature;

use App\Models\User;
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

        $response = $this->postJson('/api/user/activity-ping', [
            'email'         => $user->email,
            'delta_seconds' => 30,
            'tz'            => 'America/Bogota',
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
        $response = $this->getJson('/api/clans');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertIsArray($data);
        $this->assertNotEmpty($data);

        $first = $data[0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('name', $first);
        $this->assertArrayHasKey('membersCount', $first);
        $this->assertArrayHasKey('researchers', $first);
        $this->assertArrayHasKey('researchFeed', $first);
    }
}
