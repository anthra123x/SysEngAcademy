<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDailyActivity;
use Carbon\Carbon;

class StreakService
{
    /**
     * Procesa el heartbeat de actividad de estudio y actualiza la racha del usuario.
     */
    public function processPing(User $user, int $deltaSeconds, string $action, string $tz): array
    {
        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $yesterday = $now->copy()->subDay()->toDateString();

        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        // 1. Evaluar si la racha previa caducó por inactividad
        if ($lastDate !== null && $lastDate !== $clientToday && $lastDate !== $yesterday) {
            if ($user->current_streak > 0) {
                $user->previous_streak = $user->current_streak;
                $user->current_streak = 0;
            }
            $user->today_study_seconds = 0;
        }

        // 2. Procesar progreso del día actual
        if ($lastDate === null) {
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->today_study_seconds >= 30 || in_array($action, ['lesson_complete', 'quiz_pass', 'challenge_solve'])) {
                $user->current_streak = 1;
                $user->max_streak = max($user->max_streak ?: 0, 1);
                $user->last_activity_date = $clientToday;
            }
        } elseif ($lastDate === $clientToday) {
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->current_streak === 0 && $user->previous_streak === 0 && ($user->today_study_seconds >= 30 || $action !== 'pulse')) {
                $user->current_streak = 1;
                $user->max_streak = max($user->max_streak ?: 0, 1);
            }
        } elseif ($lastDate === $yesterday) {
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->today_study_seconds >= 20 || in_array($action, ['lesson_complete', 'quiz_pass', 'challenge_solve'])) {
                $user->current_streak = max(1, ($user->current_streak ?: 0) + 1);
                $user->max_streak = max($user->max_streak ?: 0, $user->current_streak);
                $user->last_activity_date = $clientToday;
            }
        } else {
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if (in_array($action, ['lesson_complete', 'quiz_pass', 'challenge_solve'])) {
                if ($user->previous_streak > 0) {
                    $user->current_streak = $user->previous_streak + 1;
                    $user->previous_streak = 0;
                    $user->streak_recovered_at = Carbon::now();
                } else {
                    $user->current_streak = 1;
                }
                $user->max_streak = max($user->max_streak ?: 0, $user->current_streak);
                $user->last_activity_date = $clientToday;
            }
        }

        $user->total_study_seconds = ($user->total_study_seconds ?: 0) + $deltaSeconds;

        if ($action === 'lesson_complete') {
            $user->xp = ($user->xp ?: 50) + 20;
        } elseif ($action === 'quiz_pass') {
            $user->xp = ($user->xp ?: 50) + 35;
        } elseif ($action === 'challenge_solve') {
            $user->xp = ($user->xp ?: 50) + 50;
        }

        $user->save();

        $daily = UserDailyActivity::firstOrCreate(
            [
                'user_id'       => $user->id,
                'activity_date' => $clientToday,
            ],
            [
                'study_seconds'        => 0,
                'lessons_completed'    => 0,
                'quizzes_completed'    => 0,
                'challenges_completed' => 0,
            ]
        );

        $daily->study_seconds += $deltaSeconds;
        if ($action === 'lesson_complete') $daily->lessons_completed += 1;
        if ($action === 'quiz_pass') $daily->quizzes_completed += 1;
        if ($action === 'challenge_solve') $daily->challenges_completed += 1;
        $daily->save();

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);
        $isActiveToday = ($user->last_activity_date === $clientToday && ($user->today_study_seconds >= 30 || $action !== 'pulse'));
        $flameState = $this->resolveFlameState($user, $clientToday, $yesterday);

        return [
            'success'             => true,
            'current_streak'      => $user->current_streak,
            'previous_streak'     => $user->previous_streak ?: 0,
            'can_recover'         => ($user->previous_streak > 0 && $user->current_streak === 0),
            'flame_state'         => $flameState,
            'is_active_today'     => $isActiveToday,
            'max_streak'          => $user->max_streak ?: 1,
            'today_study_seconds' => $user->today_study_seconds ?: 0,
            'today_study_minutes' => (int) round(($user->today_study_seconds ?: 0) / 60),
            'total_study_seconds' => $user->total_study_seconds ?: 0,
            'total_study_minutes' => (int) round(($user->total_study_seconds ?: 0) / 60),
            'last_activity_date'  => $user->last_activity_date,
            'weekly_matrix'       => $weeklyMatrix,
            'user_xp'             => $user->xp ?: 50,
        ];
    }

    /**
     * Consulta el estado de racha y actividad actual del usuario.
     */
    public function getStatus(User $user, string $tz): array
    {
        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $yesterday = $now->copy()->subDay()->toDateString();
        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        if ($lastDate !== null && $lastDate !== $clientToday && $lastDate !== $yesterday) {
            if ($user->current_streak > 0) {
                $user->previous_streak = $user->current_streak;
                $user->current_streak = 0;
                $user->today_study_seconds = 0;
                $user->save();
            }
        }

        $canRecover = ($user->previous_streak > 0 && $user->current_streak === 0);
        $flameState = $this->resolveFlameState($user, $clientToday, $yesterday);
        $isActiveToday = ($user->last_activity_date === $clientToday && ($user->today_study_seconds >= 30));
        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);

        return [
            'success'             => true,
            'current_streak'      => $user->current_streak,
            'previous_streak'     => $user->previous_streak ?: 0,
            'can_recover'         => $canRecover,
            'flame_state'         => $flameState,
            'is_active_today'     => $isActiveToday,
            'max_streak'          => $user->max_streak ?: 1,
            'today_study_seconds' => $user->today_study_seconds ?: 0,
            'today_study_minutes' => (int) round(($user->today_study_seconds ?: 0) / 60),
            'total_study_seconds' => $user->total_study_seconds ?: 0,
            'total_study_minutes' => (int) round(($user->total_study_seconds ?: 0) / 60),
            'last_activity_date'  => $user->last_activity_date,
            'weekly_matrix'       => $weeklyMatrix,
            'user_xp'             => $user->xp ?: 50,
        ];
    }

    /**
     * Valida y recupera la racha apagada mediante resolución de ejercicio.
     */
    public function recoverStreak(User $user, string $drillId, string $userAnswer, string $tz): array
    {
        $drills = $this->getRecoveryDrills();
        $drill = null;
        foreach ($drills as $d) {
            if ($d['id'] === $drillId) {
                $drill = $d;
                break;
            }
        }

        if (!$drill) {
            return [
                'status'  => 404,
                'payload' => [
                    'success' => false,
                    'message' => 'Ejercicio de recuperación no encontrado o expirado.',
                ],
            ];
        }

        $cleanUserAnswer = strtolower(trim($userAnswer));
        $correctAnswer = strtolower(trim($drill['answer']));

        if ($cleanUserAnswer !== $correctAnswer) {
            return [
                'status'  => 422,
                'payload' => [
                    'success' => false,
                    'message' => 'Respuesta incorrecta. ¡Revisa el concepto e inténtalo nuevamente!',
                    'hint'    => $drill['hint'] ?? null,
                ],
            ];
        }

        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $recoveredDays = max(1, $user->previous_streak ?: 1);

        $user->current_streak = $recoveredDays + 1;
        $user->previous_streak = 0;
        $user->last_activity_date = $clientToday;
        $user->streak_recovered_at = Carbon::now();
        $user->xp = ($user->xp ?: 50) + 40;
        $user->save();

        $daily = UserDailyActivity::firstOrCreate(
            ['user_id' => $user->id, 'activity_date' => $clientToday],
            ['study_seconds' => 0, 'lessons_completed' => 0, 'quizzes_completed' => 0, 'challenges_completed' => 0]
        );
        $daily->study_seconds += 120;
        $daily->quizzes_completed += 1;
        $daily->save();

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);

        return [
            'status'  => 200,
            'payload' => [
                'success'             => true,
                'message'             => "¡Racha de {$recoveredDays} días restituida exitosamente! La llama vuelve a estar encendida 🔥",
                'current_streak'      => $user->current_streak,
                'previous_streak'     => 0,
                'recovered_days'      => $recoveredDays,
                'can_recover'         => false,
                'flame_state'         => 'active',
                'is_active_today'     => true,
                'today_study_seconds' => $user->today_study_seconds ?: 0,
                'today_study_minutes' => (int) round(($user->today_study_seconds ?: 0) / 60),
                'total_study_seconds' => $user->total_study_seconds ?: 0,
                'total_study_minutes' => (int) round(($user->total_study_seconds ?: 0) / 60),
                'weekly_matrix'       => $weeklyMatrix,
                'user_xp'             => $user->xp,
                'explanation'         => $drill['explanation'] ?? '',
            ],
        ];
    }

    public function resolveFlameState(User $user, string $clientToday, string $yesterday): string
    {
        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        if ($user->current_streak > 0) {
            if ($lastDate === $clientToday) {
                return 'active';
            }
            if ($lastDate === $yesterday) {
                return 'pending';
            }
        }

        return 'extinguished';
    }

    public function buildWeeklyMatrix(int $userId, string $tz): array
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
        $clientToday = $now->toDateString();
        $startDate = $now->copy()->subDays(6)->toDateString();

        $activities = UserDailyActivity::where('user_id', $userId)
            ->whereBetween('activity_date', [$startDate, $clientToday])
            ->get()
            ->keyBy(fn ($item) => Carbon::parse($item->activity_date)->toDateString());

        $matrix = [];
        for ($i = 6; $i >= 0; $i--) {
            $dayDate = $now->copy()->subDays($i);
            $dayStr = $dayDate->toDateString();
            $dayOfWeek = (int) $dayDate->isoFormat('E');
            $record = $activities->get($dayStr);

            $studySecs = $record ? (int) $record->study_seconds : 0;
            $isActive = $studySecs >= 30
                || ($record && ($record->lessons_completed > 0 || $record->quizzes_completed > 0 || $record->challenges_completed > 0));

            $matrix[] = [
                'day'           => $dayLabels[$dayOfWeek] ?? $dayDate->format('D'),
                'date'          => $dayStr,
                'active'        => $isActive,
                'study_seconds' => $studySecs,
                'study_minutes' => (int) round($studySecs / 60),
                'is_today'      => ($dayStr === $clientToday),
            ];
        }

        return $matrix;
    }

    public function getRecoveryDrills(): array
    {
        return [
            [
                'id'           => 'drill-1',
                'category'     => 'Comandos del Sistema (Linux)',
                'difficulty'   => 'Básico',
                'question'     => '¿Qué comando en la terminal de Linux lista los archivos y directorios de la carpeta actual?',
                'code_snippet' => "$ usuario@syseng:~$ ____ -la\ntotal 24\ndrwxr-xr-x 4 usuario usuario 4096 oct 8\n-rw-r--r-- 1 usuario usuario  220 oct 8 index.html",
                'options'      => ['ls', 'cd', 'pwd', 'mkdir'],
                'answer'       => 'ls',
                'hint'         => 'Es la abreviatura de "list". Se usa a diario para inspeccionar el directorio.',
                'explanation'  => 'El comando "ls" (list) muestra el contenido de directorios en sistemas tipo Unix/POSIX.',
            ],
            [
                'id'           => 'drill-2',
                'category'     => 'Estructuras de Control',
                'difficulty'   => 'Básico',
                'question'     => '¿Cuál es el valor final de la variable `contador` tras ejecutarse este ciclo?',
                'code_snippet' => "contador = 0\nfor i in range(1, 4):\n    contador += i",
                'options'      => ['6', '4', '10', '3'],
                'answer'       => '6',
                'hint'         => 'range(1, 4) produce los números 1, 2 y 3. Suma: 1 + 2 + 3.',
                'explanation'  => 'En Python range(1, 4) itera sobre [1, 2, 3]. La suma acumulada es 1 + 2 + 3 = 6.',
            ],
            [
                'id'           => 'drill-3',
                'category'     => 'Bases de Datos (SQL)',
                'difficulty'   => 'Básico',
                'question'     => '¿Cuál es la cláusula SQL obligatoria para filtrar filas específicas en una consulta SELECT?',
                'code_snippet' => "SELECT id, nombre, email\nFROM estudiantes\n_____ rol = 'estudiante';",
                'options'      => ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
                'answer'       => 'WHERE',
                'hint'         => 'Significa "donde" en inglés. Condiciona la selección de registros antes de agrupar.',
                'explanation'  => 'La cláusula WHERE define el predicado lógico para filtrar registros en tablas relacionales.',
            ],
            [
                'id'           => 'drill-4',
                'category'     => 'Control de Versiones (Git)',
                'difficulty'   => 'Básico',
                'question'     => '¿Qué comando de Git prepara todos los archivos modificados para el siguiente commit?',
                'code_snippet' => "$ git _____ .\n$ git commit -m \"feat: racha\"",
                'options'      => ['add', 'push', 'pull', 'stage'],
                'answer'       => 'add',
                'hint'         => 'Es el verbo en inglés para "añadir" o poner cambios en el área de preparación (staging).',
                'explanation'  => 'git add coloca los cambios del directorio de trabajo en el área de preparación (staging area).',
            ],
            [
                'id'           => 'drill-5',
                'category'     => 'Protocolo HTTP & REST',
                'difficulty'   => 'Básico',
                'question'     => '¿Qué verbo HTTP es el estándar semántico para aplicar modificaciones parciales a un recurso existente?',
                'code_snippet' => "_____ /api/estudiantes/42 HTTP/1.1\nContent-Type: application/json\n\n{\"xp\": 150}",
                'options'      => ['PATCH', 'PUT', 'GET', 'DELETE'],
                'answer'       => 'PATCH',
                'hint'         => 'A diferencia de PUT (reemplazo total), este verbo aplica un parche a los campos modificados.',
                'explanation'  => 'PATCH aplica modificaciones parciales a un recurso sin requerir el payload completo de la entidad.',
            ],
        ];
    }
}
