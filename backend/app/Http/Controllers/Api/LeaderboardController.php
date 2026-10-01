<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    /**
     * Retorna el ranking global de estudiantes y miembros en tiempo real según XP,
     * cursos completados, lecciones aprobadas, racha y telemetría de estudio.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = $request->user()?->id;
        $requestedEmail = strtolower(trim($request->query('email', '')));

        // Todos los usuarios registrados en el sistema
        $users = User::all();

        $leaderboard = $users->map(function (User $user) use ($currentUserId, $requestedEmail) {
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

            $streak = max(1, $user->current_streak ?: 1);
            $totalStudyMins = (int) round(($user->total_study_seconds ?: 0) / 60);

            // Fórmula de XP unificada y matemáticamente exacta
            $xp = 50 
                + ($solvedChallenges * 50) 
                + ($completedCourses * 150) 
                + ($completedLessons * 20) 
                + ($enrollments->count() * 30) 
                + (($streak - 1) * 25) 
                + ((int) floor($totalStudyMins / 10) * 5);

            $level = max(1, (int) floor($xp / 100) + 1);

            $rankTitle = match (true) {
                $level >= 10 => 'Arquitecto Principal',
                $level >= 7  => 'Ingeniero de Software Senior',
                $level >= 4  => 'Desarrollador Junior Avanzado',
                $level >= 2  => 'Desarrollador en Formación',
                default      => 'Cadete de Sistemas',
            };

            $nameParts = preg_split('/\s+/', trim($user->name));
            $initials = count($nameParts) >= 2
                ? mb_substr($nameParts[0], 0, 1) . mb_substr($nameParts[1], 0, 1)
                : mb_substr($user->name, 0, 2);

            $isCurrent = false;
            if ($currentUserId && $user->id === $currentUserId) {
                $isCurrent = true;
            } elseif ($requestedEmail && strtolower(trim($user->email)) === $requestedEmail) {
                $isCurrent = true;
            }

            return [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'avatarText'        => mb_strtoupper($initials),
                'level'             => $level,
                'rankTitle'         => $rankTitle,
                'specialization'    => $user->specialization ?: 'Fundamentos Algorítmicos & Arquitectura',
                'completedLessons'  => $completedLessons,
                'completedCourses'  => $completedCourses,
                'avgQuizScore'      => $avgQuizScore,
                'streak'            => $streak,
                'studyMinutes'      => $totalStudyMins,
                'xp'                => $xp,
                'isCurrentUser'     => $isCurrent,
                'badgePill'         => '⚡ ACTIVO',
            ];
        })
        ->sort(function ($a, $b) {
            // Ordenar por XP desc, luego por promedio quiz desc, luego por lecciones desc
            if ($b['xp'] !== $a['xp']) {
                return $b['xp'] <=> $a['xp'];
            }
            if ($b['avgQuizScore'] !== $a['avgQuizScore']) {
                return $b['avgQuizScore'] <=> $a['avgQuizScore'];
            }
            return $b['completedLessons'] <=> $a['completedLessons'];
        })
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
