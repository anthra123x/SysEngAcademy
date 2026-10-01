<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    /**
     * Retorna el ranking global de estudiantes en tiempo real según XP,
     * cursos completados, lecciones aprobadas y rendimiento en evaluaciones.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = $request->user()?->id;

        // Estudiantes registrados en el sistema (excluyendo docentes/administradores puros)
        $users = User::where(function ($query) {
            $query->where('role', 'student')
                  ->orWhereNull('role');
        })->get();

        // Si no hay estudiantes con rol explícito de 'student', incluir los usuarios disponibles
        if ($users->isEmpty()) {
            $users = User::all();
        }

        $leaderboard = $users->map(function (User $user) use ($currentUserId) {
            $user->loadMissing([
                'enrollments.course.category',
                'lessonProgress.lesson.module.course',
            ]);

            $enrollments = $user->enrollments;
            $progress = $user->lessonProgress;

            $completedCourses = $enrollments->whereNotNull('completed_at')->count();
            $completedLessons = $progress->count();

            $scores = $progress->pluck('score')->filter()->values();
            $quizzesCount = $scores->count();
            $avgQuizScore = $quizzesCount > 0 ? round($scores->avg(), 1) : 0.0;

            $solvedChallenges = $progress->filter(function ($p) {
                return $p->lesson && in_array($p->lesson->type, ['practice', 'challenge', 'interactive']);
            })->count();

            // Puntos de experiencia (XP) base calculados en tiempo real
            $xp = 50 + ($solvedChallenges * 50) + ($completedCourses * 150) + ($completedLessons * 20) + ($enrollments->count() * 30);
            $level = max(1, (int) floor($xp / 100) + 1);

            $rankTitle = match (true) {
                $level >= 10 => 'Arquitecto Principal',
                $level >= 7  => 'Ingeniero de Software Senior',
                $level >= 4  => 'Desarrollador Junior Avanzado',
                $level >= 2  => 'Desarrollador en Formación',
                default      => 'Cadete de Sistemas',
            };

            $nameParts = explode(' ', trim($user->name));
            $initials = count($nameParts) >= 2
                ? mb_substr($nameParts[0], 0, 1) . mb_substr($nameParts[1], 0, 1)
                : mb_substr($user->name, 0, 2);

            return [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'avatarText'        => mb_strtoupper($initials),
                'level'             => $level,
                'rankTitle'         => $rankTitle,
                'specialization'    => 'Fundamentos Algorítmicos',
                'completedLessons'  => $completedLessons,
                'avgQuizScore'      => $avgQuizScore,
                'xp'                => $xp,
                'isCurrentUser'     => $currentUserId !== null && $user->id === $currentUserId,
                'badgePill'         => '⚡ ACTIVO',
            ];
        })
        ->sortByDesc('xp')
        ->values()
        ->map(function ($entry, $idx) {
            $entry['rank'] = $idx + 1;
            if ($idx === 0) $entry['badgePill'] = '🥇 ORO';
            elseif ($idx === 1) $entry['badgePill'] = '🥈 PLATA';
            elseif ($idx === 2) $entry['badgePill'] = '🥉 BRONCE';
            return $entry;
        });

        return response()->json($leaderboard);
    }
}
