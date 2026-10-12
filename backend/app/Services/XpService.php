<?php

namespace App\Services;

use App\Models\StudentFeedback;
use App\Models\User;

class XpService
{
    /**
     * Puntos base otorgados a todo estudiante al registrarse en SysEng Academy.
     */
    public const BASE_WELCOME_XP = 50;

    /**
     * Puntos por lección teórica/estándar completada.
     */
    public const LESSON_XP = 25;

    /**
     * Puntos por reto práctico o laboratorio de código interactivo completado.
     */
    public const CHALLENGE_XP = 100;

    /**
     * Puntos por quiz aprobado (mínimo 90%).
     */
    public const QUIZ_PASSED_XP = 50;

    /**
     * Puntos adicionales por quiz perfecto (100% de aciertos).
     */
    public const QUIZ_PERFECT_BONUS_XP = 25;

    /**
     * Puntos por curso completado al 100%.
     */
    public const COURSE_COMPLETED_XP = 250;

    /**
     * Puntos por día de racha activa de estudio.
     */
    public const STREAK_DAY_XP = 20;

    /**
     * Puntos por cada bloque de 10 minutos de estudio efectivo medido por telemetría.
     */
    public const STUDY_10MIN_XP = 5;

    /**
     * Calcula los puntos de experiencia (XP) reales y verificados de un estudiante
     * consolidando su actividad en lecciones, retos, quizzes, cursos, racha y méritos docentes.
     */
    public static function calculateEarnedXp(User $user): int
    {
        $progress = $user->lessonProgress()
            ->with('lesson')
            ->whereNotNull('completed_at')
            ->get();

        $regularLessonsXp = 0;
        $challengesXp = 0;
        $quizzesXp = 0;

        foreach ($progress as $p) {
            $isChallenge = $p->lesson && in_array($p->lesson->type, ['challenge', 'practice', 'interactive']);
            if ($isChallenge) {
                $challengesXp += self::CHALLENGE_XP;
            } else {
                $regularLessonsXp += self::LESSON_XP;
            }

            if ($p->score !== null && $p->score >= 90) {
                $quizzesXp += ($p->score >= 100) ? (self::QUIZ_PASSED_XP + self::QUIZ_PERFECT_BONUS_XP) : self::QUIZ_PASSED_XP;
            }
        }

        // Cursos completados al 100%
        $completedCoursesCount = $user->enrollments()
            ->whereNotNull('completed_at')
            ->count();
        $coursesXp = $completedCoursesCount * self::COURSE_COMPLETED_XP;

        // Bonificación por racha activa
        $streakDays = max(0, (int) ($user->current_streak ?: 0));
        $streakXp = $streakDays * self::STREAK_DAY_XP;

        // Telemetría de tiempo de estudio efectivo (5 XP cada 10 minutos)
        $totalStudyMins = (int) round(((int) ($user->total_study_seconds ?: 0)) / 60);
        $studyXp = (int) floor($totalStudyMins / 10) * self::STUDY_10MIN_XP;

        // Modificadores docentes (elogios o llamados de atención con impacto de XP)
        $feedbackXp = (int) StudentFeedback::where('student_id', $user->id)->sum('xp_impact');

        $total = self::BASE_WELCOME_XP + $regularLessonsXp + $challengesXp + $quizzesXp + $coursesXp + $streakXp + $studyXp + $feedbackXp;

        // El XP nunca debe ser menor al bono de bienvenida base
        return max(self::BASE_WELCOME_XP, $total);
    }

    /**
     * Sincroniza y persiste el XP en la columna `users.xp` de la base de datos.
     */
    public static function syncUserXp(User $user): int
    {
        $earnedXp = self::calculateEarnedXp($user);
        $user->update(['xp' => $earnedXp]);
        return $earnedXp;
    }

    /**
     * Retorna el nivel correspondiente según el puntaje de XP acumulado.
     */
    public static function calculateLevel(int $xp): int
    {
        if ($xp >= 5500) return 7;
        if ($xp >= 3500) return 6;
        if ($xp >= 2000) return 5;
        if ($xp >= 1000) return 4;
        if ($xp >= 500)  return 3;
        if ($xp >= 200)  return 2;
        return 1;
    }

    /**
     * Retorna el título o rango académico de ingeniería según el nivel alcanzado.
     */
    public static function getRankTitle(int $level): string
    {
        return match ($level) {
            7       => 'Master Systems Architect',
            6       => 'Tech Lead & Arquitecto',
            5       => 'Ingeniero de Software Senior',
            4       => 'Desarrollador Mid-Level',
            3       => 'Desarrollador Junior',
            2       => 'Desarrollador Trainee',
            default => 'Cadete de Sistemas',
        };
    }

    /**
     * Retorna los umbrales de XP, progreso porcentual hacia el siguiente nivel y puntos faltantes.
     */
    public static function getLevelProgress(int $xp): array
    {
        $level = self::calculateLevel($xp);
        $rankTitle = self::getRankTitle($level);

        $thresholds = [
            1 => ['min' => 0,    'max' => 200],
            2 => ['min' => 200,  'max' => 500],
            3 => ['min' => 500,  'max' => 1000],
            4 => ['min' => 1000, 'max' => 2000],
            5 => ['min' => 2000, 'max' => 3500],
            6 => ['min' => 3500, 'max' => 5500],
            7 => ['min' => 5500, 'max' => 10000],
        ];

        $range = $thresholds[$level] ?? ['min' => 5500, 'max' => 10000];
        $min = $range['min'];
        $max = $range['max'];

        if ($level >= 7) {
            $progressPercent = 100;
            $xpToNext = 0;
        } else {
            $currentInTier = max(0, $xp - $min);
            $tierSpan = max(1, $max - $min);
            $progressPercent = min(100, (int) round(($currentInTier / $tierSpan) * 100));
            $xpToNext = max(0, $max - $xp);
        }

        return [
            'level'            => $level,
            'rank_title'       => $rankTitle,
            'xp'               => $xp,
            'next_level_xp'    => $max,
            'xp_to_next'       => $xpToNext,
            'progress_percent' => $progressPercent,
        ];
    }
}
