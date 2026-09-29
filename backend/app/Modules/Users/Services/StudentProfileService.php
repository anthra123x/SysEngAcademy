<?php

namespace App\Modules\Users\Services;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class StudentProfileService
{
    /**
     * Retorna el expediente académico, métricas de progreso y logros de un estudiante.
     */
    public function getProfileSummary(User $user): array
    {
        $cacheKey = "student_profile_{$user->id}";

        return Cache::remember($cacheKey, 60, function () use ($user) {
            $user->loadMissing([
                'enrollments.course.category',
                'lessonProgress.lesson.module.course',
            ]);

            $enrollments = $user->enrollments;
            $progress = $user->lessonProgress;

            $totalEnrolled = $enrollments->count();
            $completedCourses = $enrollments->where('completed_at', '!=', null)->count();
            $completedLessons = $progress->count();

            $scores = $progress->pluck('score')->filter()->values();
            $quizzesCount = $scores->count();
            $avgQuizScore = $quizzesCount > 0 ? round($scores->avg(), 1) : 0.0;

            // Retos resueltos estimados a partir de lecciones de tipo reto/práctica
            $solvedChallenges = $progress->filter(function ($p) {
                return $p->lesson && in_array($p->lesson->type, ['practice', 'challenge', 'interactive']);
            })->count();

            // Puntos de experiencia (XP) y cálculo de nivel
            $xp = ($solvedChallenges * 50) + ($completedCourses * 150) + ($completedLessons * 20);
            $level = max(1, (int) floor($xp / 100) + 1);

            $rankTitle = match (true) {
                $level >= 10 => 'Arquitecto Principal',
                $level >= 7  => 'Ingeniero de Software Senior',
                $level >= 4  => 'Desarrollador FullStack',
                $level >= 2  => 'Explorador Algorítmico',
                default      => 'Cadete de Sistemas',
            };

            return [
                'user' => [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'role'           => $user->role,
                    'avatar'         => $user->avatar,
                    'email_verified' => !empty($user->email_verified_at),
                ],
                'stats' => [
                    'enrolled_courses_count'  => $totalEnrolled,
                    'completed_courses_count' => $completedCourses,
                    'completed_lessons_count' => $completedLessons,
                    'solved_challenges_count' => max($solvedChallenges, 1),
                    'quizzes_taken_count'     => $quizzesCount,
                    'average_quiz_score'      => $avgQuizScore,
                    'xp'                      => $xp,
                    'level'                   => $level,
                    'rank_title'              => $rankTitle,
                ],
                'enrollments' => $enrollments->map(function ($e) {
                    return [
                        'id'               => $e->id,
                        'course_id'        => $e->course_id,
                        'title'            => $e->course?->title ?? 'Curso',
                        'slug'             => $e->course?->slug ?? '',
                        'category'         => $e->course?->category?->name ?? 'General',
                        'progress_percent' => (int) ($e->progress_percent ?? 0),
                        'enrolled_at'      => $e->enrolled_at ? $e->enrolled_at->toIso8601String() : null,
                        'completed_at'     => $e->completed_at ? $e->completed_at->toIso8601String() : null,
                    ];
                })->values(),
            ];
        });
    }

    /**
     * Invalida el caché de perfil cuando el estudiante completa una lección o se matricula.
     */
    public function invalidateProfileCache(int $userId): void
    {
        Cache::forget("student_profile_{$userId}");
    }
}
