<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\XpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    /**
     * Retorna el ranking global de estudiantes reales en tiempo real según XP,
     * cursos completados, lecciones aprobadas, racha y telemetría de estudio.
     * Excluye cuentas administrativas, docentes y usuarios fantasma/pruebas.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = $request->user('jwt')?->id
            ?: $request->user('sanctum')?->id
            ?: $request->user()?->id;

        $requestedEmail = strtolower(trim($request->query('email', '')));

        // Filtro estricto: Únicamente estudiantes reales verificados
        $query = User::query()
            ->where('role', 'student')
            ->whereNotNull('email_verified_at')
            ->where('email', 'not like', '%example.com%')
            ->where('email', 'not like', '%@sysengacademy.dev%')
            ->where('email', 'not like', '%sysengacademy.site%')
            ->where('email', 'not like', 'test_%')
            ->where('email', 'not like', 'reset_test_%')
            ->where('email', 'not like', 'fallback_test_%')
            ->where('email', 'not like', 'change_test_%')
            ->where('email', 'not like', 'change_ok_%')
            ->where('email', 'not like', 'login_test_%')
            ->where('email', 'not like', 'usuario_6ac%')
            ->where('email', 'not like', 'estudiante_6ac%')
            ->where('name', 'not like', 'Test %')
            ->where('name', 'not like', 'Fallback %');

        $users = $query->with([
            'enrollments.course.category',
            'lessonProgress.lesson.module.course',
        ])->get();

        $leaderboard = $users->map(function (User $user) use ($currentUserId, $requestedEmail) {
            $enrollments = $user->enrollments;
            $progress = $user->lessonProgress;

            $completedCourses = $enrollments->whereNotNull('completed_at')->count();
            $completedLessons = $progress->whereNotNull('completed_at')->count();

            $scores = $progress->pluck('score')->filter()->values();
            $quizzesCount = $scores->count();
            $avgQuizScore = $quizzesCount > 0 ? round($scores->avg(), 1) : 0.0;

            $solvedChallenges = $progress->filter(function ($p) {
                return $p->completed_at && $p->lesson && in_array($p->lesson->type, ['practice', 'challenge', 'interactive']);
            })->count();

            $streak = max(0, $user->current_streak ?: 0);
            $totalStudyMins = (int) round(((int) ($user->total_study_seconds ?: 0)) / 60);

            // Cálculo unificado canónico mediante XpService
            $xp = XpService::calculateEarnedXp($user);
            if ($user->xp !== $xp) {
                $user->update(['xp' => $xp]);
            }

            $levelProg = XpService::getLevelProgress($xp);
            $level = $levelProg['level'];
            $rankTitle = $levelProg['rank_title'];

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
                'progressPercent'   => $levelProg['progress_percent'],
                'xpToNextLevel'     => $levelProg['xp_to_next'],
                'nextLevelXp'       => $levelProg['next_level_xp'],
                'specialization'    => $user->specialization ?: 'Fundamentos Algorítmicos & Arquitectura',
                'completedLessons'  => $completedLessons,
                'completedCourses'  => $completedCourses,
                'solvedChallenges'  => $solvedChallenges,
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
            if ($idx === 0) {
                $entry['badgePill'] = '🥇 ORO';
            } elseif ($idx === 1) {
                $entry['badgePill'] = '🥈 PLATA';
            } elseif ($idx === 2) {
                $entry['badgePill'] = '🥉 BRONCE';
            }
            return $entry;
        });

        return response()->json($leaderboard);
    }
}

