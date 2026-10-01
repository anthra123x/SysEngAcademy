<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserDailyActivity;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StreakController extends Controller
{
    /**
     * Heartbeat en tiempo real: registra el tiempo activo de trabajo/estudio en la plataforma
     * y actualiza de manera matemáticamente exacta la racha diaria del estudiante.
     */
    public function ping(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'delta_seconds' => 'nullable|integer|min:1|max:180',
            'tz'            => 'nullable|string|max:50',
            'action'        => 'nullable|string|in:pulse,lesson_complete,quiz_pass,challenge_solve',
        ]);

        $deltaSeconds = min(120, max(5, (int) ($validated['delta_seconds'] ?? 30)));
        $tz = $this->resolveTimezone($validated['tz'] ?? null);

        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $yesterday = $now->copy()->subDay()->toDateString();

        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        $currentStreak = $user->current_streak ?: 1;
        $maxStreak = $user->max_streak ?: 1;

        if ($lastDate === null) {
            // Primer día de actividad
            $currentStreak = 1;
            $maxStreak = max($maxStreak, 1);
            $user->today_study_seconds = $deltaSeconds;
        } elseif ($lastDate === $clientToday) {
            // Actividad continua en el mismo día
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
        } elseif ($lastDate === $yesterday) {
            // Día consecutivo exacto
            $currentStreak += 1;
            $maxStreak = max($maxStreak, $currentStreak);
            $user->today_study_seconds = $deltaSeconds;
        } else {
            // Pasaron 2 o más días: la racha se reinicia a 1 día
            $currentStreak = 1;
            $user->today_study_seconds = $deltaSeconds;
        }

        $user->current_streak = $currentStreak;
        $user->max_streak = $maxStreak;
        $user->last_activity_date = $clientToday;
        $user->total_study_seconds = ($user->total_study_seconds ?: 0) + $deltaSeconds;

        $action = $validated['action'] ?? 'pulse';
        if ($action === 'lesson_complete') {
            $user->xp = ($user->xp ?: 50) + 20;
        } elseif ($action === 'quiz_pass') {
            $user->xp = ($user->xp ?: 50) + 35;
        } elseif ($action === 'challenge_solve') {
            $user->xp = ($user->xp ?: 50) + 50;
        }

        $user->save();

        // Registrar actividad diaria
        $daily = UserDailyActivity::firstOrCreate(
            [
                'user_id'       => $user->id,
                'activity_date' => $clientToday,
            ],
            [
                'study_seconds'       => 0,
                'lessons_completed'   => 0,
                'quizzes_completed'   => 0,
                'challenges_completed'=> 0,
            ]
        );

        $daily->study_seconds += $deltaSeconds;
        if ($action === 'lesson_complete') $daily->lessons_completed += 1;
        if ($action === 'quiz_pass') $daily->quizzes_completed += 1;
        if ($action === 'challenge_solve') $daily->challenges_completed += 1;
        $daily->save();

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);

        return response()->json([
            'success'             => true,
            'current_streak'      => $user->current_streak,
            'max_streak'          => $user->max_streak,
            'today_study_seconds' => $user->today_study_seconds,
            'today_study_minutes' => (int) round($user->today_study_seconds / 60),
            'total_study_seconds' => $user->total_study_seconds,
            'total_study_minutes' => (int) round($user->total_study_seconds / 60),
            'last_activity_date'  => $user->last_activity_date,
            'weekly_matrix'       => $weeklyMatrix,
            'user_xp'             => $user->xp,
        ]);
    }

    /**
     * Consulta el estado de racha y actividad del usuario actual.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $tz = $this->resolveTimezone($request->query('tz'));
        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $yesterday = $now->copy()->subDay()->toDateString();
        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        $currentStreak = $user->current_streak ?: 1;

        // Si no ha ingresado hoy y tampoco ayer, la racha ya expiró
        if ($lastDate !== null && $lastDate !== $clientToday && $lastDate !== $yesterday) {
            $currentStreak = 0;
            $user->current_streak = 0;
            $user->today_study_seconds = 0;
            $user->save();
        } elseif ($lastDate !== $clientToday) {
            $user->today_study_seconds = 0;
            $user->save();
        }

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);

        return response()->json([
            'current_streak'      => $user->current_streak,
            'max_streak'          => $user->max_streak ?: 1,
            'today_study_seconds' => $user->today_study_seconds ?: 0,
            'today_study_minutes' => (int) round(($user->today_study_seconds ?: 0) / 60),
            'total_study_seconds' => $user->total_study_seconds ?: 0,
            'total_study_minutes' => (int) round(($user->total_study_seconds ?: 0) / 60),
            'last_activity_date'  => $user->last_activity_date,
            'weekly_matrix'       => $weeklyMatrix,
            'user_xp'             => $user->xp ?: 50,
        ]);
    }

    /**
     * Genera la matriz de actividad de los últimos 7 días con días en español.
     */
    private function buildWeeklyMatrix(int $userId, string $tz): array
    {
        $dayLabels = [
            1 => 'Lun',
            2 => 'Mar',
            3 => 'Mié',
            4 => 'Jue',
            5 => 'Vie',
            6 => 'Sáb',
            7 => 'Dom',
        ];

        $now = Carbon::now($tz);
        $days = [];

        // Generar desde hace 6 días hasta hoy
        for ($i = 6; $i >= 0; $i--) {
            $dateObj = $now->copy()->subDays($i);
            $dateStr = $dateObj->toDateString();
            $dayOfWeek = $dateObj->dayOfWeekIso; // 1 = Lunes, 7 = Domingo

            $activity = UserDailyActivity::where('user_id', $userId)
                ->where('activity_date', $dateStr)
                ->first();

            $studySeconds = $activity ? $activity->study_seconds : 0;
            $studyMins = (int) round($studySeconds / 60);
            $isActive = $studySeconds >= 30 || ($activity && ($activity->lessons_completed > 0 || $activity->quizzes_completed > 0)) || ($i === 0 && $studySeconds > 0);

            $days[] = [
                'day'           => $dayLabels[$dayOfWeek] ?? 'Día',
                'date'          => $dateStr,
                'active'        => $isActive,
                'study_seconds' => $studySeconds,
                'study_minutes' => $studyMins,
                'is_today'      => $i === 0,
            ];
        }

        return $days;
    }

    private function resolveUser(Request $request): ?User
    {
        if ($user = $request->user()) {
            return $user;
        }

        $email = $request->input('email') ?: $request->query('email');
        if ($email) {
            return User::where('email', strtolower(trim($email)))->first();
        }

        return User::first();
    }

    private function resolveTimezone(?string $tz): string
    {
        if ($tz && in_array($tz, \DateTimeZone::listIdentifiers(), true)) {
            return $tz;
        }
        return 'America/Bogota';
    }
}
