<?php

namespace Tests\Feature;

use App\Models\StudentFeedback;
use App\Models\User;
use Tests\TestCase;

class StudentFeedbackTest extends TestCase
{
    public function test_teacher_can_send_warning_with_xp_deduction_and_affects_student(): void
    {
        $teacher = User::where('role', 'instructor')->first();
        if (!$teacher) {
            $teacher = User::factory()->create(['role' => 'instructor', 'email' => 'teacher_test_' . uniqid() . '@sysengacademy.dev']);
        }

        $student = User::where('role', 'student')->first();
        if (!$student) {
            $student = User::factory()->create(['role' => 'student', 'email' => 'student_test_' . uniqid() . '@sysengacademy.dev', 'xp' => 500]);
        } else {
            $student->update(['xp' => 500]);
        }

        $initialXp = $student->fresh()->xp;

        // Docente envía llamado de atención estricto con deducción de 100 XP
        $response = $this->actingAs($teacher)->postJson("/api/teacher/students/{$student->id}/feedback", [
            'type'               => 'warning_strict',
            'title'              => 'Llamado de atención por bajo rendimiento',
            'message'            => 'Has presentado dificultades y retraso en las entregas de algoritmos.',
            'ai_context_summary' => 'Dificultad en evaluaciones técnicas (55%). Se sugiere reforzar conceptos.',
            'xp_deduction'       => 100,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('xp_impact', -100);

        // Verificar que el estudiante perdió exactamente 100 XP
        $this->assertEquals($initialXp - 100, $student->fresh()->xp);

        // Verificar que quedó registrado en la tabla student_feedbacks
        $this->assertDatabaseHas('student_feedbacks', [
            'student_id'   => $student->id,
            'type'         => 'warning_strict',
            'title'        => 'Llamado de atención por bajo rendimiento',
            'xp_impact'    => -100,
        ]);

        // Verificar que el estudiante puede consultar sus retroalimentaciones
        $feedbacksResponse = $this->actingAs($student)->getJson('/api/profile/feedbacks');
        $feedbacksResponse->assertStatus(200);
        $feedbacksData = $feedbacksResponse->json();
        $this->assertNotEmpty($feedbacksData);
        $this->assertEquals('warning_strict', $feedbacksData[0]['type']);
    }

    public function test_teacher_can_send_praise_with_bonus_xp(): void
    {
        $teacher = User::where('role', 'instructor')->first()
            ?: User::factory()->create(['role' => 'instructor', 'email' => 'teacher_test2_' . uniqid() . '@sysengacademy.dev']);

        $student = User::where('role', 'student')->first()
            ?: User::factory()->create(['role' => 'student', 'email' => 'student_test2_' . uniqid() . '@sysengacademy.dev', 'xp' => 200]);

        $student->update(['xp' => 200]);

        $response = $this->actingAs($teacher)->postJson("/api/teacher/students/{$student->id}/feedback", [
            'type'     => 'praise',
            'title'    => '¡Excelente rendimiento en el laboratorio!',
            'message'  => 'Completaste todos los retos con puntaje perfecto.',
            'xp_bonus' => 50,
        ]);

        $response->assertStatus(201);
        $response->assertJsonPath('xp_impact', 50);
        $this->assertEquals(250, $student->fresh()->xp);
    }
}
