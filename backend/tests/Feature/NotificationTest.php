<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    public function test_user_can_fetch_notifications_and_sync_achievements()
    {
        $user = User::factory()->create(['current_streak' => 3, 'xp' => 500]);

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'notifications',
            'unread_count',
        ]);

        $this->assertGreaterThan(0, $response->json('unread_count'));
    }

    public function test_user_can_mark_notification_as_read()
    {
        $user = User::factory()->create();
        $notif = Notification::create([
            'user_id' => $user->id,
            'type'    => 'achievement',
            'title'   => 'Test',
            'message' => 'Test message',
        ]);

        $response = $this->actingAs($user)->patchJson("/api/notifications/{$notif->id}/read");

        $response->assertStatus(200);
        $this->assertNotNull($notif->fresh()->read_at);
    }

    public function test_user_can_mark_all_notifications_as_read()
    {
        $user = User::factory()->create();
        Notification::create([
            'user_id' => $user->id,
            'type'    => 'achievement',
            'title'   => 'Test 1',
            'message' => 'Message 1',
        ]);
        Notification::create([
            'user_id' => $user->id,
            'type'    => 'achievement',
            'title'   => 'Test 2',
            'message' => 'Message 2',
        ]);

        $response = $this->actingAs($user)->postJson('/api/notifications/mark-all-read');

        $response->assertStatus(200);
        $response->assertJson(['unread_count' => 0]);
        $this->assertEquals(0, $user->appNotifications()->unread()->count());
    }
}
