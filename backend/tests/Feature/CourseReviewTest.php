<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseReviewTest extends TestCase
{
    public function test_can_list_course_reviews_and_stats(): void
    {
        $course = Course::where('is_published', true)->first();
        $this->assertNotNull($course);

        $response = $this->getJson("/api/courses/{$course->slug}/reviews");
        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['average', 'total', 'breakdown'],
                'reviews',
            ]);
    }

    public function test_unauthenticated_user_cannot_rate_course(): void
    {
        $course = Course::where('is_published', true)->first();
        $response = $this->postJson("/api/courses/{$course->slug}/reviews", [
            'rating' => 5,
            'comment' => 'Excelente',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_student_can_rate_and_update_course(): void
    {
        $user = User::first();
        $course = Course::where('is_published', true)->first();

        // 1. Calificar con 5
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/courses/{$course->slug}/reviews", [
            'rating' => 5,
            'comment' => 'Contenido sumamente enriquecedor para ingeniería.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('rating_avg', fn ($avg) => is_numeric($avg))
            ->assertJsonPath('review.rating', 5);

        // 2. Actualizar calificación a 4
        $updateResponse = $this->actingAs($user, 'sanctum')->postJson("/api/courses/{$course->slug}/reviews", [
            'rating' => 4,
            'comment' => 'Actualicé mi opinión, excelente material.',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('review.rating', 4);
    }
}
