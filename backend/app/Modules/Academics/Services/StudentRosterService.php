<?php

namespace App\Modules\Academics\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class StudentRosterService
{
    /**
     * Retorna el listado de estudiantes con métricas de rendimiento y cursos inscritos,
     * optimizado con consultas eager para evitar el problema N+1.
     */
    public function getRoster(?string $search = null, int $limit = 50): Collection
    {
        $query = User::where('role', 'student')
            ->where('email', 'not like', '%@example.com')
            ->where('email', 'not like', '%@sysengacademy.dev')
            ->withCount(['enrollments', 'lessonProgress'])
            ->with(['enrollments.course:id,title', 'lessonProgress']);

        if ($search && trim($search) !== '') {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('name', 'ilike', "%{$term}%")
                  ->orWhere('email', 'ilike', "%{$term}%");
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->take($limit)
            ->get()
            ->map(function ($u) {
                $scores = $u->lessonProgress->pluck('score')->filter()->values();
                $avgScore = $scores->count() > 0 ? round($scores->avg(), 1) : null;

                return [
                    'id'                      => $u->id,
                    'name'                    => $u->name,
                    'email'                   => $u->email,
                    'role'                    => $u->role,
                    'email_verified'          => !empty($u->email_verified_at),
                    'email_verified_at'       => $u->email_verified_at ? $u->email_verified_at->toIso8601String() : null,
                    'created_at'              => $u->created_at ? $u->created_at->toIso8601String() : null,
                    'enrollments_count'       => $u->enrollments_count,
                    'completed_lessons_count' => $u->lesson_progress_count,
                    'quizzes_taken_count'     => $scores->count(),
                    'average_quiz_score'      => $avgScore,
                    'courses'                 => $u->enrollments->map(fn($e) => [
                        'id'               => $e->course_id,
                        'title'            => $e->course?->title ?? 'Curso',
                        'progress_percent' => (int) ($e->progress_percent ?? 0),
                    ]),
                ];
            });
    }
}
