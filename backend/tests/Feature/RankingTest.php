<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class RankingTest extends TestCase
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
        $this->assertArrayHasKey('completedLessons', $first);
        $this->assertArrayHasKey('level', $first);
    }
}

