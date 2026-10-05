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
        $action = $validated['action'] ?? 'pulse';

        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();
        $yesterday = $now->copy()->subDay()->toDateString();

        $lastDate = $user->last_activity_date ? Carbon::parse($user->last_activity_date)->toDateString() : null;

        // 1. Evaluar si la racha previa caducó por inactividad
        if ($lastDate !== null && $lastDate !== $clientToday && $lastDate !== $yesterday) {
            // Pasaron 2 o más días: racha apagada
            if ($user->current_streak > 0) {
                $user->previous_streak = $user->current_streak;
                $user->current_streak = 0;
            }
            $user->today_study_seconds = 0;
        }

        // 2. Procesar progreso del día actual
        if ($lastDate === null) {
            // Usuario nuevo sin historial previo
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->today_study_seconds >= 30 || in_array($action, ['lesson_complete', 'quiz_pass', 'challenge_solve'])) {
                $user->current_streak = 1;
                $user->max_streak = max($user->max_streak ?: 0, 1);
                $user->last_activity_date = $clientToday;
            }
        } elseif ($lastDate === $clientToday) {
            // Ya estudió hoy: acumular segundos
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->current_streak === 0 && $user->previous_streak === 0 && ($user->today_study_seconds >= 30 || $action !== 'pulse')) {
                $user->current_streak = 1;
                $user->max_streak = max($user->max_streak ?: 0, 1);
            }
        } elseif ($lastDate === $yesterday) {
            // Estudió ayer: día consecutivo
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            if ($user->today_study_seconds >= 20 || in_array($action, ['lesson_complete', 'quiz_pass', 'challenge_solve'])) {
                $user->current_streak = max(1, ($user->current_streak ?: 0) + 1);
                $user->max_streak = max($user->max_streak ?: 0, $user->current_streak);
                $user->last_activity_date = $clientToday;
            }
        } else {
            // Estudió hace más de 1 día (racha apagada)
            $user->today_study_seconds = ($user->today_study_seconds ?: 0) + $deltaSeconds;
            // Si completa una acción académica formal, se reactiva
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

        // Bonificaciones de XP por actividad
        if ($action === 'lesson_complete') {
            $user->xp = ($user->xp ?: 50) + 20;
        } elseif ($action === 'quiz_pass') {
            $user->xp = ($user->xp ?: 50) + 35;
        } elseif ($action === 'challenge_solve') {
            $user->xp = ($user->xp ?: 50) + 50;
        }

        $user->save();

        // Registrar o actualizar actividad diaria
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

        $isActiveToday = ($user->last_activity_date === $clientToday && ($user->today_study_seconds >= 30 || $action !== 'pulse'));
        $flameState = $this->resolveFlameState($user, $clientToday, $yesterday);

        return response()->json([
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
        ]);
    }

    /**
     * Consulta el estado de racha y actividad del usuario actual con comprobación exacta.
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

        // Comprobar si la racha expiró por inactividad
        if ($lastDate !== null && $lastDate !== $clientToday && $lastDate !== $yesterday) {
            // El estudiante no estudió ayer ni hoy: racha apagada
            if ($user->current_streak > 0) {
                $user->previous_streak = $user->current_streak;
                $user->current_streak = 0;
            }
            $user->today_study_seconds = 0;
            $user->save();
        } elseif ($lastDate !== $clientToday) {
            // Hoy aún no ha estudiado
            $user->today_study_seconds = 0;
            $user->save();
        }

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);
        $isActiveToday = ($user->last_activity_date === $clientToday && ($user->today_study_seconds >= 30));
        $flameState = $this->resolveFlameState($user, $clientToday, $yesterday);

        return response()->json([
            'current_streak'      => $user->current_streak ?: 0,
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
        ]);
    }

    /**
     * Proporciona un ejercicio sencillo para reactivar o recuperar la racha apagada.
     */
    public function recoveryDrill(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $drills = $this->getRecoveryDrills();
        $excludeId = $request->query('exclude_id');

        $available = array_filter($drills, fn($d) => $d['id'] !== $excludeId);
        if (empty($available)) {
            $available = $drills;
        }

        $drill = $available[array_rand($available)];

        // Ocultar la respuesta correcta al cliente
        return response()->json([
            'id'           => $drill['id'],
            'category'     => $drill['category'],
            'difficulty'   => 'Sencillo',
            'question'     => $drill['question'],
            'code_snippet' => $drill['code_snippet'] ?? null,
            'options'      => $drill['options'],
            'hint'         => $drill['hint'] ?? 'Selecciona la opción técnicamente correcta.',
        ]);
    }

    /**
     * Valida la solución al ejercicio sencillo y restaura la racha apagada del estudiante.
     */
    public function recover(Request $request): JsonResponse
    {
        $user = $this->resolveUser($request);
        if (!$user) {
            return response()->json(['error' => 'No autorizado'], 401);
        }

        $validated = $request->validate([
            'drill_id' => 'required|string|max:50',
            'answer'   => 'required|string|max:100',
            'tz'       => 'nullable|string|max:50',
        ]);

        $drills = $this->getRecoveryDrills();
        $drill = null;
        foreach ($drills as $d) {
            if ($d['id'] === $validated['drill_id']) {
                $drill = $d;
                break;
            }
        }

        if (!$drill) {
            return response()->json([
                'success' => false,
                'message' => 'Ejercicio de recuperación no encontrado o expirado.',
            ], 404);
        }

        $userAnswer = strtolower(trim($validated['answer']));
        $correctAnswer = strtolower(trim($drill['answer']));

        if ($userAnswer !== $correctAnswer) {
            return response()->json([
                'success' => false,
                'message' => 'Respuesta incorrecta. ¡Revisa el concepto e inténtalo nuevamente!',
                'hint'    => $drill['hint'] ?? 'Vuelve a intentarlo.',
            ], 422);
        }

        $tz = $this->resolveTimezone($validated['tz'] ?? null);
        $now = Carbon::now($tz);
        $clientToday = $now->toDateString();

        // Restaurar racha: si tenía racha previa, se recupera y se añade el día de hoy
        $recoveredDays = $user->previous_streak ?: 0;
        $restoredStreak = max(1, $recoveredDays + 1);

        $user->current_streak = $restoredStreak;
        $user->previous_streak = 0;
        $user->max_streak = max($user->max_streak ?: 0, $restoredStreak);
        $user->last_activity_date = $clientToday;
        $user->streak_recovered_at = Carbon::now();
        $user->today_study_seconds = max($user->today_study_seconds ?: 0, 60);
        $user->total_study_seconds = ($user->total_study_seconds ?: 0) + 60;
        $user->xp = ($user->xp ?: 50) + 35; // Bonificación de 35 XP por recuperación
        $user->save();

        // Registrar en UserDailyActivity
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
        $daily->challenges_completed += 1;
        $daily->study_seconds += 60;
        $daily->save();

        $weeklyMatrix = $this->buildWeeklyMatrix($user->id, $tz);

        return response()->json([
            'success'             => true,
            'message'             => '¡Fuego encendido! Racha recuperada exitosamente.',
            'current_streak'      => $user->current_streak,
            'previous_streak'     => 0,
            'recovered_days'      => $recoveredDays,
            'can_recover'         => false,
            'flame_state'         => 'active',
            'is_active_today'     => true,
            'explanation'         => $drill['explanation'] ?? '¡Excelente trabajo técnico!',
            'max_streak'          => $user->max_streak,
            'today_study_seconds' => $user->today_study_seconds,
            'today_study_minutes' => (int) round($user->today_study_seconds / 60),
            'total_study_seconds' => $user->total_study_seconds,
            'total_study_minutes' => (int) round($user->total_study_seconds / 60),
            'weekly_matrix'       => $weeklyMatrix,
            'user_xp'             => $user->xp,
        ]);
    }

    /**
     * Determina el estado visual de la llama de la racha:
     * - 'active': Estudió hoy y la llama está encendida.
     * - 'pending': Estudió ayer, racha viva pero esperando sesión hoy.
     * - 'extinguished': Racha apagada por inactividad (recuperable si tiene días previos).
     */
    private function resolveFlameState(User $user, string $clientToday, string $yesterday): string
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
            $isActive = $studySeconds >= 30 || ($activity && ($activity->lessons_completed > 0 || $activity->quizzes_completed > 0 || $activity->challenges_completed > 0));

            $days[] = [
                'day'           => $dayLabels[$dayOfWeek] ?? 'Día',
                'date'          => $dateStr,
                'active'        => (bool) $isActive,
                'study_seconds' => $studySeconds,
                'study_minutes' => $studyMins,
                'is_today'      => $i === 0,
            ];
        }

        return $days;
    }

    /**
     * Banco de ejercicios sencillos de recuperación de racha para ingeniería de sistemas.
     */
    private function getRecoveryDrills(): array
    {
        return [
            [
                'id'           => 'drill-1',
                'category'     => 'Linux & Terminal',
                'question'     => '¿Qué comando en sistemas Linux se utiliza para listar todos los archivos, incluyendo los ocultos (.dotfiles), con detalles de permisos y tamaño?',
                'code_snippet' => '$ ___ -la',
                'options'      => ['ls', 'cd', 'cat', 'pwd'],
                'answer'       => 'ls',
                'hint'         => 'Es el comando estándar de listado de directorios.',
                'explanation'  => 'El comando ls con las banderas -l (long format) y -a (all, incluidos los que inician con punto) muestra la totalidad de los archivos.',
            ],
            [
                'id'           => 'drill-2',
                'category'     => 'Control de Versiones (Git)',
                'question'     => '¿Qué comando de Git descarga un repositorio remoto existente por primera vez hacia tu entorno de desarrollo local?',
                'code_snippet' => '$ git _____ https://github.com/empresa/proyecto.git',
                'options'      => ['clone', 'pull', 'fetch', 'push'],
                'answer'       => 'clone',
                'hint'         => 'Crea un duplicado exacto del repositorio remoto.',
                'explanation'  => 'git clone inicializa el directorio local y descarga todo el historial de commits y ramas del origen.',
            ],
            [
                'id'           => 'drill-3',
                'category'     => 'Protocolos Web & HTTP',
                'question'     => '¿Cuál es el código de estado HTTP estándar retornado cuando una petición POST crea exitosamente una nueva entidad en el servidor?',
                'code_snippet' => 'HTTP/1.1 ___ Created',
                'options'      => ['201', '200', '204', '301'],
                'answer'       => '201',
                'hint'         => 'Pertenece a la familia de éxito 2xx y significa "Created".',
                'explanation'  => '201 Created es el código estándar REST para confirmar que un nuevo recurso fue generado y almacenado.',
            ],
            [
                'id'           => 'drill-4',
                'category'     => 'Contenedores & Docker',
                'question'     => '¿Qué comando de Docker se utiliza para listar en la consola los contenedores que se encuentran en ejecución?',
                'code_snippet' => '$ docker __',
                'options'      => ['ps', 'run', 'start', 'images'],
                'answer'       => 'ps',
                'hint'         => 'Heredado del comando tradicional de procesos en Unix (process status).',
                'explanation'  => 'docker ps muestra el listado de contenedores corriendo actualmente junto a sus puertos e IDs.',
            ],
            [
                'id'           => 'drill-5',
                'category'     => 'Bases de Datos & SQL',
                'question'     => '¿Qué cláusula SQL se utiliza para filtrar registros antes de su agrupación o devolución?',
                'code_snippet' => 'SELECT * FROM users _____ role = \'student\';',
                'options'      => ['WHERE', 'HAVING', 'GROUP BY', 'JOIN'],
                'answer'       => 'WHERE',
                'hint'         => 'Especifica la condición booleana fila por fila.',
                'explanation'  => 'WHERE filtra los registros en tablas antes de cualquier agregación analítica.',
            ],
            [
                'id'           => 'drill-6',
                'category'     => 'Estructuras de Datos',
                'question'     => '¿Qué estructura de datos opera estrictamente bajo el principio LIFO (Last In, First Out)?',
                'code_snippet' => 'push(x) -> [...] -> pop() == x',
                'options'      => ['Pila (Stack)', 'Cola (Queue)', 'Grafo', 'Árbol Binario'],
                'answer'       => 'Pila (Stack)',
                'hint'         => 'Imagina una pila de platos donde el último plato colocado es el primero en retirarse.',
                'explanation'  => 'La Pila o Stack inserta y remueve elementos únicamente desde la cima o tope (LIFO).',
            ],
            [
                'id'           => 'drill-7',
                'category'     => 'Redes de Computadores',
                'question'     => '¿Cuál es el puerto de red TCP estándar reservado para conexiones web seguras cifradas con HTTPS/TLS?',
                'code_snippet' => 'https://sysengacademy.com:___',
                'options'      => ['443', '80', '22', '3306'],
                'answer'       => '443',
                'hint'         => 'El puerto 80 es HTTP plano; el cifrado seguro usa este puerto.',
                'explanation'  => 'El puerto 443 está asignado internacionalmente por IANA para HTTPS sobre SSL/TLS.',
            ],
            [
                'id'           => 'drill-8',
                'category'     => 'Control de Versiones (Git)',
                'question'     => '¿Qué comando te permite verificar qué ficheros han sido modificados o añadidos al staging area antes de realizar un commit?',
                'code_snippet' => '$ git ______',
                'options'      => ['status', 'log', 'branch', 'reset'],
                'answer'       => 'status',
                'hint'         => 'Muestra el estado actual del árbol de trabajo.',
                'explanation'  => 'git status brinda visibilidad instantánea sobre ramas activas, archivos modificados y pendientes de commit.',
            ],
            [
                'id'           => 'drill-9',
                'category'     => 'Linux & Procesos',
                'question'     => '¿Qué comando se utiliza en sistemas operativos tipo UNIX para enviar una señal de terminación a un proceso mediante su PID?',
                'code_snippet' => '$ ____ -9 4812',
                'options'      => ['kill', 'halt', 'exit', 'break'],
                'answer'       => 'kill',
                'hint'         => 'Envía señales POSIX como SIGTERM o SIGKILL.',
                'explanation'  => 'kill envía señales a los procesos. La bandera -9 corresponde a SIGKILL para terminación inmediata.',
            ],
            [
                'id'           => 'drill-10',
                'category'     => 'Arquitectura de APIs',
                'question'     => '¿Qué método o verbo HTTP está estandarizado para aplicar modificaciones parciales sobre un recurso existente?',
                'code_snippet' => '_____ /api/user/profile HTTP/1.1',
                'options'      => ['PATCH', 'PUT', 'GET', 'DELETE'],
                'answer'       => 'PATCH',
                'hint'         => 'A diferencia de PUT (reemplazo total), este verbo aplica un parche a los campos modificados.',
                'explanation'  => 'PATCH aplica modificaciones parciales a un recurso sin requerir el payload completo de la entidad.',
            ],
        ];
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
