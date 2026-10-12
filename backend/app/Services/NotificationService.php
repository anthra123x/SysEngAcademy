<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\Course;
use Illuminate\Support\Collection;

class NotificationService
{
    /**
     * Crea y persiste una notificación en la bandeja del usuario.
     */
    public function createNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null
    ): Notification {
        return Notification::create([
            'user_id' => $user->id,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'data'    => $data,
        ]);
    }

    /**
     * Sincroniza y premia de forma idempotente los logros alcanzados por el estudiante.
     * Genera notificaciones para insignias desbloqueadas sin duplicar registros.
     */
    public function syncAchievements(User $user): void
    {
        // 1. Obtener métricas reales consolidadas
        $enrollments = $user->enrollments()->with('course')->get();
        $progress = $user->lessonProgress()->with('lesson')->get();

        $enrolledCount   = $enrollments->count();
        $completedCourses = $enrollments->whereNotNull('completed_at')->count();
        $completedLessons = $progress->count();

        $scores = $progress->pluck('score')->filter()->values();
        $quizzesCount = $scores->count();
        $avgQuizScore = $quizzesCount > 0 ? (float) $scores->avg() : 0.0;
        $hasPerfectQuiz = $scores->contains(100);

        $solvedChallenges = $progress->filter(function ($p) {
            return $p->completed_at && $p->lesson && in_array($p->lesson->type, ['practice', 'challenge', 'interactive']);
        })->count();

        // Métricas exclusivas de CodeLab & Sandbox Comunitario
        $codelabSolvedCount = \App\Models\CodelabSubmission::where('user_id', $user->id)
            ->where('status', 'passed')
            ->distinct('challenge_id')
            ->count('challenge_id');

        $codelabCreatedCount = \App\Models\CodelabChallenge::where('user_id', $user->id)->count();

        $codelabFastest = \App\Models\CodelabSubmission::where('user_id', $user->id)
            ->where('status', 'passed')
            ->min('execution_time_ms');

        $codelabLanguagesCount = \App\Models\CodelabSubmission::where('user_id', $user->id)
            ->where('status', 'passed')
            ->distinct('language')
            ->count('language');

        $streak = (int) ($user->current_streak ?? 0);
        $xp = (int) ($user->xp ?? 0);
        $studyMins = (int) round(($user->today_study_seconds ?? 0) / 60);
        $totalStudyMins = (int) round(($user->total_study_seconds ?? 0) / 60);

        $levelProg = XpService::getLevelProgress($xp);
        $userLevel = $levelProg['level'];

        // 2. Notificación de Bienvenida inicial si no existe
        $hasWelcome = $user->appNotifications()
            ->where('type', 'welcome')
            ->exists();

        if (! $hasWelcome) {
            $this->createNotification(
                $user,
                'welcome',
                '🚀 ¡Bienvenido a SysEng Academy!',
                'Tu entorno de ingeniería está listo. Explora tus rutas de estudio, compila retos en la terminal y mantén tu racha activa.',
                ['route' => '/rutas', 'icon' => 'terminal']
            );
        }

        // 3. Reglas de logros del sistema
        $achievementRules = [
            // Cursos y Cátedras
            [
                'id'          => 'welcome_cadet',
                'title'       => 'Bienvenido a la Academia',
                'description' => 'Activaste tu cuenta y credenciales oficiales en SysEng.',
                'icon'        => 'graduation-cap',
                'unlocked'    => true,
            ],
            [
                'id'          => 'course_explorer',
                'title'       => 'Explorador Técnico',
                'description' => 'Te matriculaste en al menos 2 cursos de formación especializada.',
                'icon'        => 'book-open',
                'unlocked'    => $enrolledCount >= 2,
            ],
            [
                'id'          => 'course_first_step',
                'title'       => 'Primera Conquista',
                'description' => 'Completaste con éxito tu primera lección académica.',
                'icon'        => 'check-circle',
                'unlocked'    => $completedLessons >= 1,
            ],
            [
                'id'          => 'course_master',
                'title'       => 'Graduado de Cátedra',
                'description' => 'Completaste al 100% tu primer curso oficial en la plataforma.',
                'icon'        => 'trophy',
                'unlocked'    => $completedCourses >= 1,
            ],
            [
                'id'          => 'course_polymath',
                'title'       => 'Ingeniero Polímata',
                'description' => 'Completaste 3 cursos completos en distintas áreas de la computación.',
                'icon'        => 'award',
                'unlocked'    => $completedCourses >= 3,
            ],
            [
                'id'          => 'lesson_marathon_10',
                'title'       => 'Cadete Constante',
                'description' => 'Superaste 10 lecciones técnicas en tu trayectoria formativa.',
                'icon'        => 'layers',
                'unlocked'    => $completedLessons >= 10,
            ],
            [
                'id'          => 'lesson_marathon_25',
                'title'       => 'Desarrollador Imparable',
                'description' => 'Superaste 25 lecciones técnicas con código y teoría asimilada.',
                'icon'        => 'cpu',
                'unlocked'    => $completedLessons >= 25,
            ],

            // Retos Prácticos y Algoritmos
            [
                'id'          => 'challenge_1',
                'title'       => 'Primer Algoritmo CLI',
                'description' => 'Compilaste y validaste tu primer reto interactivo en la terminal.',
                'icon'        => 'code',
                'unlocked'    => $solvedChallenges >= 1,
            ],
            [
                'id'          => 'challenge_master',
                'title'       => 'Maestro de Algoritmos',
                'description' => 'Superaste 3 retos interactivos con lógica y complejidad optimizada.',
                'icon'        => 'target',
                'unlocked'    => $solvedChallenges >= 3,
            ],
            [
                'id'          => 'terminal_veteran',
                'title'       => 'Veterano de Terminal',
                'description' => 'Superaste 5 retos de código en el sandbox interactivo.',
                'icon'        => 'terminal',
                'unlocked'    => $solvedChallenges >= 5,
            ],
            [
                'id'          => 'challenge_grandmaster',
                'title'       => 'Hacker Algorítmico',
                'description' => 'Superaste 10 retos prácticos de código y algoritmos.',
                'icon'        => 'brain-circuit',
                'unlocked'    => $solvedChallenges >= 10,
            ],

            // CodeLab & Sandbox de la Facultad (Logros Exclusivos)
            [
                'id'          => 'codelab_first_solve',
                'title'       => 'Primer AC en CodeLab',
                'description' => 'Compilaste y superaste el 100% de casos de prueba en tu primer reto de CodeLab.',
                'icon'        => 'terminal',
                'unlocked'    => $codelabSolvedCount >= 1,
            ],
            [
                'id'          => 'codelab_triad',
                'title'       => 'Tríada de Algoritmos',
                'description' => 'Resolviste con éxito 3 retos de algoritmos y estructuras de datos en CodeLab.',
                'icon'        => 'cpu',
                'unlocked'    => $codelabSolvedCount >= 3,
            ],
            [
                'id'          => 'codelab_architect',
                'title'       => 'Arquitecto de Parciales',
                'description' => 'Diseñaste y publicaste tu propio reto con casos de prueba para la facultad en CodeLab.',
                'icon'        => 'code',
                'unlocked'    => $codelabCreatedCount >= 1,
            ],
            [
                'id'          => 'codelab_speed_demon',
                'title'       => 'Algoritmo Relámpago',
                'description' => 'Optimizaste una solución en CodeLab alcanzando un tiempo de ejecución ultrarrápido (< 25ms).',
                'icon'        => 'zap',
                'unlocked'    => ($codelabFastest !== null && $codelabFastest <= 25),
            ],
            [
                'id'          => 'codelab_polyglot',
                'title'       => 'Políglota del Sandbox',
                'description' => 'Superaste retos de CodeLab utilizando al menos 2 lenguajes de programación distintos.',
                'icon'        => 'layers',
                'unlocked'    => $codelabLanguagesCount >= 2,
            ],
            [
                'id'          => 'codelab_veteran',
                'title'       => 'Hacker de Sistemas',
                'description' => 'Superaste 5 o más retos en CodeLab demostrando maestría en resolución de problemas.',
                'icon'        => 'award',
                'unlocked'    => $codelabSolvedCount >= 5,
            ],

            // Quizzes & Precisión
            [
                'id'          => 'quiz_first',
                'title'       => 'Primer Diagnóstico',
                'description' => 'Presentaste y superaste tu primer quiz evaluativo.',
                'icon'        => 'file-text',
                'unlocked'    => $quizzesCount >= 1,
            ],
            [
                'id'          => 'quiz_expert',
                'title'       => 'Mente Analítica',
                'description' => 'Superaste 5 evaluaciones de conocimientos en tus módulos.',
                'icon'        => 'check',
                'unlocked'    => $quizzesCount >= 5,
            ],
            [
                'id'          => 'quiz_perfect',
                'title'       => 'Precisión Absoluta',
                'description' => 'Alcanzaste una calificación perfecta (100%) en un quiz técnico.',
                'icon'        => 'star',
                'unlocked'    => $hasPerfectQuiz,
            ],
            [
                'id'          => 'quiz_master',
                'title'       => 'Cerebro de Oro',
                'description' => 'Mantienes un promedio sobresaliente igual o superior al 90% en quizzes.',
                'icon'        => 'medal',
                'unlocked'    => $quizzesCount >= 3 && $avgQuizScore >= 90.0,
            ],

            // Rachas & Constancia
            [
                'id'          => 'streak_3',
                'title'       => 'Hábito de Código',
                'description' => 'Estudiaste durante 3 días consecutivos sin perder el ritmo.',
                'icon'        => 'flame',
                'unlocked'    => $streak >= 3,
            ],
            [
                'id'          => 'streak_fire',
                'title'       => 'Disciplina de Fuego',
                'description' => 'Mantuviste una racha de estudio ininterrumpida de al menos 5 días.',
                'icon'        => 'flame',
                'unlocked'    => $streak >= 5,
            ],
            [
                'id'          => 'streak_week',
                'title'       => 'Semana Implacable',
                'description' => 'Completaste 7 días seguidos de actividad técnica y código.',
                'icon'        => 'flame',
                'unlocked'    => $streak >= 7,
            ],

            // Niveles y XP
            [
                'id'          => 'level_up_3',
                'title'       => 'Ascenso Técnico',
                'description' => 'Alcanzaste el Nivel 3 (Desarrollador Junior Avanzado).',
                'icon'        => 'zap',
                'unlocked'    => $userLevel >= 3,
            ],
            [
                'id'          => 'level_up_5',
                'title'       => 'Ingeniero Consagrado',
                'description' => 'Alcanzaste el Nivel 5 (Ingeniero de Software Senior).',
                'icon'        => 'shield',
                'unlocked'    => $userLevel >= 5,
            ],
            [
                'id'          => 'xp_collector_1000',
                'title'       => 'Potencia de Cómputo',
                'description' => 'Acumulaste más de 1,000 XP en tu expediente académico.',
                'icon'        => 'sparkles',
                'unlocked'    => $xp >= 1000,
            ],

            // Tiempo de Enfoque
            [
                'id'          => 'study_marathon',
                'title'       => 'Enfoque Profundo',
                'description' => 'Dedicaste más de 15 minutos continuos de estudio y práctica.',
                'icon'        => 'clock',
                'unlocked'    => ($studyMins >= 15 || $totalStudyMins >= 15),
            ],
            [
                'id'          => 'study_deep_work',
                'title'       => 'Sesión Deep Work',
                'description' => 'Acumulaste más de 60 minutos de estudio efectivo y terminal.',
                'icon'        => 'clock',
                'unlocked'    => ($studyMins >= 60 || $totalStudyMins >= 60),
            ],
        ];

        // 4. Obtener identificadores de logros ya notificados previamente
        $existingNotifBadgeIds = $user->appNotifications()
            ->where('type', 'achievement')
            ->get()
            ->map(function ($n) {
                return $n->data['badge_id'] ?? null;
            })
            ->filter()
            ->values()
            ->all();

        // 5. Crear notificaciones para los nuevos logros desbloqueados
        foreach ($achievementRules as $ach) {
            if ($ach['unlocked'] && ! in_array($ach['id'], $existingNotifBadgeIds)) {
                $this->createNotification(
                    $user,
                    'achievement',
                    "🏆 ¡Logro Desbloqueado: {$ach['title']}!",
                    "Has obtenido una nueva insignia en tu perfil: {$ach['description']}",
                    [
                        'badge_id' => $ach['id'],
                        'title'    => $ach['title'],
                        'icon'     => $ach['icon'],
                        'route'    => '/perfil',
                        'tab'      => 'badges',
                    ]
                );
            }
        }
    }
}
