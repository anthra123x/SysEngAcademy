<?php

namespace App\Modules\Academics\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentManagementService
{
    /**
     * Obtiene el expediente académico exhaustivo de un estudiante.
     */
    public function getStudentDetail(int $id): array
    {
        $student = User::with([
            'enrollments.course.modules.lessons',
            'lessonProgress.lesson.module.course',
        ])->findOrFail($id);

        $completedProgress = $student->lessonProgress->map(function ($lp) {
            return [
                'id'           => $lp->id,
                'lesson_id'    => $lp->lesson_id,
                'lesson_title' => $lp->lesson?->title ?? 'Lección',
                'lesson_type'  => $lp->lesson?->type ?? 'article',
                'course_title' => $lp->lesson?->module?->course?->title ?? 'General',
                'score'        => $lp->score,
                'passed'       => $lp->score !== null ? $lp->score >= 60 : null,
                'completed_at' => $lp->completed_at ? $lp->completed_at->toIso8601String() : null,
            ];
        });

        $enrolledCourses = $student->enrollments->map(function ($e) use ($student) {
            $totalLessons = $e->course?->modules?->flatMap->lessons?->count() ?? 0;
            $completedInCourse = $student->lessonProgress->filter(function ($lp) use ($e) {
                return $lp->lesson?->module?->course_id === $e->course_id;
            })->count();

            return [
                'id'                => $e->id,
                'course_id'         => $e->course_id,
                'title'             => $e->course?->title ?? 'Curso',
                'difficulty'        => $e->course?->difficulty ?? 'Principiante',
                'total_lessons'     => $totalLessons,
                'completed_lessons' => $completedInCourse,
                'progress_percent'  => (int) ($e->progress_percent ?? 0),
                'enrolled_at'       => $e->enrolled_at ? $e->enrolled_at->toIso8601String() : null,
                'completed_at'      => $e->completed_at ? $e->completed_at->toIso8601String() : null,
            ];
        });

        $scores = $student->lessonProgress->pluck('score')->filter()->values();
        $challengesCount = $completedProgress->where('lesson_type', 'code_challenge')->count();
        $theoryCount = $completedProgress->whereIn('lesson_type', ['article', 'video'])->count();
        $passedCount = $completedProgress->where('passed', true)->count();
        $passRate = $completedProgress->count() > 0 ? (int) round(($passedCount / $completedProgress->count()) * 100) : 100;

        $lastProgress = $student->lessonProgress->sortByDesc('completed_at')->first();
        $lastActiveAt = $lastProgress?->completed_at
            ? $lastProgress->completed_at->toIso8601String()
            : ($student->created_at ? $student->created_at->toIso8601String() : null);

        $avgScore = $scores->count() > 0 ? round($scores->avg(), 1) : null;
        $status = 'optimal';
        $riskLevel = 'Bajo Riesgo';
        if (empty($student->email_verified_at)) {
            $status = 'critical';
            $riskLevel = 'Alto Riesgo';
            $diagnostic = 'Cuenta institucional pendiente de activación de correo. Se recomienda instar al estudiante a verificar su cuenta.';
        } elseif ($avgScore !== null && $avgScore < 60) {
            $status = 'critical';
            $riskLevel = 'Alto Riesgo';
            $diagnostic = 'Rendimiento crítico en evaluaciones (promedio inferior al 60%). Requiere tutoría pedagógica y refuerzo urgente.';
        } elseif ($completedProgress->count() === 0) {
            $status = 'warning';
            $riskLevel = 'Riesgo Moderado';
            $diagnostic = 'Estudiante matriculado sin entregas completadas aún. Recomendado asignar reto inicial guiado.';
        } elseif ($avgScore !== null && $avgScore < 80) {
            $status = 'warning';
            $riskLevel = 'Riesgo Moderado';
            $diagnostic = 'Progreso constante aunque con margen de mejora en quizzes evaluativos (promedio ' . $avgScore . '%).';
        } else {
            $status = 'optimal';
            $riskLevel = 'Bajo Riesgo';
            $diagnostic = 'Excelente rendimiento académico. Comprende con solidez los conceptos prácticos y teóricos del plan curricular.';
        }

        return [
            'student' => [
                'id'                => $student->id,
                'name'              => $student->name,
                'email'             => $student->email,
                'role'              => $student->role,
                'email_verified'    => !empty($student->email_verified_at),
                'email_verified_at' => $student->email_verified_at ? $student->email_verified_at->toIso8601String() : null,
                'created_at'        => $student->created_at ? $student->created_at->toIso8601String() : null,
            ],
            'academic_summary' => [
                'total_enrolled'            => $enrolledCourses->count(),
                'total_completed'           => $completedProgress->count(),
                'quizzes_taken'             => $scores->count(),
                'average_score'             => $avgScore,
                'challenges_count'          => $challengesCount,
                'theory_count'              => $theoryCount,
                'pass_rate'                 => $passRate,
                'last_active_at'            => $lastActiveAt,
                'status'                    => $status,
                'retention_risk_level'      => $riskLevel,
                'ai_pedagogical_diagnostic' => $diagnostic,
            ],
            'courses'           => $enrolledCourses,
            'completed_lessons' => $completedProgress,
        ];
    }

    /**
     * Actualiza el perfil o estado de un estudiante (rol, verificación de email).
     */
    public function updateStudent(int $id, array $data): User
    {
        $student = User::findOrFail($id);

        if (isset($data['name'])) {
            $student->name = trim($data['name']);
        }

        if (isset($data['role']) && in_array($data['role'], ['student', 'instructor', 'admin'])) {
            $student->role = $data['role'];
        }

        if (isset($data['verify_email'])) {
            $student->email_verified_at = $data['verify_email'] ? now() : null;
        }

        if (!empty($data['password'])) {
            $student->password = Hash::make(trim($data['password']));
        }

        $student->save();

        return $student;
    }

    /**
     * Elimina la cuenta de un estudiante y sus progresos asociados dentro de una transacción.
     */
    public function deleteStudent(int $id): bool
    {
        $student = User::findOrFail($id);

        // Protección de cuenta principal
        if ($student->email === 'andrescamilomartinez330@gmail.com') {
            abort(403, 'No es posible eliminar la cuenta principal del docente.');
        }

        DB::transaction(function () use ($student) {
            $student->lessonProgress()->delete();
            $student->enrollments()->delete();
            $student->delete();
        });

        return true;
    }
}
