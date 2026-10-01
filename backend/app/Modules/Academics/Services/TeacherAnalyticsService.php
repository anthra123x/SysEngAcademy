<?php

namespace App\Modules\Academics\Services;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

class TeacherAnalyticsService
{
    /**
     * Retorna estadísticas académicas globales con caché inteligente de 30 segundos
     * para evitar saturación de BD ante accesos concurrentes de múltiples docentes.
     */
    public function getOverview(): array
    {
        return Cache::remember('teacher_overview_stats', 30, function () {
            $totalStudents = User::where('role', 'student')->count();
            $totalCourses = Course::count();
            $totalCompletions = LessonProgress::whereHas('user')->count();
            $totalEnrollments = Enrollment::whereHas('user')->count();

            // Promedio global de quizzes
            $avgScore = (float) (LessonProgress::whereHas('user')->whereNotNull('score')->avg('score') ?? 0.0);

            // Actividad reciente de los alumnos (últimas 10 lecciones/quizzes de usuarios activos)
            $recentActivity = LessonProgress::whereHas('user')
                ->with(['user:id,name,email', 'lesson:id,title,type'])
                ->orderBy('completed_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($p) {
                    return [
                        'id'           => $p->id,
                        'user_name'    => $p->user?->name ?? 'Estudiante',
                        'user_email'   => $p->user?->email ?? '',
                        'lesson_title' => $p->lesson?->title ?? 'Lección',
                        'lesson_type'  => $p->lesson?->type ?? 'article',
                        'score'        => $p->score,
                        'passed'       => $p->score !== null ? $p->score >= 60 : true,
                        'completed_at' => $p->completed_at ? $p->completed_at->toIso8601String() : null,
                    ];
                });

            // Top cursos más demandados
            $popularCourses = Course::withCount('enrollments')
                ->orderBy('enrollments_count', 'desc')
                ->take(5)
                ->get(['id', 'title', 'slug', 'difficulty', 'enrollments_count']);

            return [
                'stats' => [
                    'total_students'    => $totalStudents,
                    'total_courses'     => $totalCourses,
                    'total_completions' => $totalCompletions,
                    'total_enrollments' => $totalEnrollments,
                    'average_score'     => round($avgScore, 1),
                ],
                'recent_activity' => $recentActivity,
                'popular_courses' => $popularCourses,
            ];
        });
    }

    /**
     * Invalida el caché cuando hay una nueva matrícula o finalización de lección.
     */
    public function invalidateCache(): void
    {
        Cache::forget('teacher_overview_stats');
    }
}
