<?php

namespace App\Modules\Performance\Services;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;
use App\Modules\Academics\Services\StudentManagementService;
use App\Modules\Academics\Services\StudentRosterService;
use App\Modules\Academics\Services\TeacherAnalyticsService;
use App\Modules\Auth\DTOs\LoginDTO;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Users\Services\StudentProfileService;
use Illuminate\Support\Facades\DB;

class LoadSimulationService
{
    public function __construct(
        protected AuthService $authService,
        protected TeacherAnalyticsService $analyticsService,
        protected StudentRosterService $rosterService,
        protected StudentManagementService $studentManagement,
        protected StudentProfileService $profileService
    ) {}

    /**
     * Ejecuta una simulación completa de carga multi-usuario y concurrencia.
     */
    public function runSimulation(int $studentsCount = 20, int $teachersCount = 5, int $cycles = 3): array
    {
        $latencies = [];
        $errors = 0;
        $totalOperations = 0;
        $operationCounts = [
            'auth_login'       => 0,
            'teacher_overview' => 0,
            'student_roster'   => 0,
            'student_detail'   => 0,
            'student_profile'  => 0,
            'course_query'     => 0,
            'lesson_progress'  => 0,
        ];

        $startMemory = memory_get_usage(true);
        $globalStartTime = microtime(true);

        $demoStudent = User::where('email', 'estudiante@sysengacademy.dev')->first()
            ?? User::where('role', 'student')->first();
        $demoTeacher = User::where('email', 'andrescamilomartinez330@gmail.com')->first()
            ?? User::where('role', 'admin')->first();

        // 1. Simulación de logins concurrentes (Docentes y Estudiantes)
        for ($c = 0; $c < $cycles; $c++) {
            // Logins de estudiantes
            for ($s = 0; $s < min($studentsCount, 10); $s++) {
                $opStart = microtime(true);
                try {
                    $dto = LoginDTO::fromArray([
                        'email'    => 'estudiante@sysengacademy.dev',
                        'password' => 'estudiante1234',
                    ]);
                    $res = $this->authService->login($dto);
                    if (empty($res['token'])) {
                        $errors++;
                    }
                } catch (\Throwable $e) {
                    $errors++;
                }
                $latencies[] = (microtime(true) - $opStart) * 1000;
                $operationCounts['auth_login']++;
                $totalOperations++;
            }

            // Logins de docentes
            for ($t = 0; $t < min($teachersCount, 5); $t++) {
                $opStart = microtime(true);
                try {
                    $dto = LoginDTO::fromArray([
                        'email'    => 'andrescamilomartinez330@gmail.com',
                        'password' => 'kimetsunoyaiBa1',
                    ]);
                    $res = $this->authService->login($dto);
                    if (empty($res['token'])) {
                        $errors++;
                    }
                } catch (\Throwable $e) {
                    $errors++;
                }
                $latencies[] = (microtime(true) - $opStart) * 1000;
                $operationCounts['auth_login']++;
                $totalOperations++;
            }
        }

        // 2. Simulación de navegación concurrente de cursos y lecciones
        for ($i = 0; $i < ($studentsCount * $cycles); $i++) {
            $opStart = microtime(true);
            try {
                $courses = Course::where('is_published', true)
                    ->with(['category:id,name,slug'])
                    ->take(6)
                    ->get();
                if ($courses->isEmpty()) {
                    $errors++;
                }
            } catch (\Throwable $e) {
                $errors++;
            }
            $latencies[] = (microtime(true) - $opStart) * 1000;
            $operationCounts['course_query']++;
            $totalOperations++;
        }

        // 3. Simulación de carga del expediente del estudiante (Perfil, Insignias, Progreso)
        if ($demoStudent) {
            for ($i = 0; $i < ($studentsCount * $cycles); $i++) {
                $opStart = microtime(true);
                try {
                    $profile = $this->profileService->getProfileSummary($demoStudent);
                    if (empty($profile['stats'])) {
                        $errors++;
                    }
                } catch (\Throwable $e) {
                    $errors++;
                }
                $latencies[] = (microtime(true) - $opStart) * 1000;
                $operationCounts['student_profile']++;
                $totalOperations++;
            }
        }

        // 4. Simulación de carga del panel docente (Overview, Lista de Alumnos, Detalle)
        for ($i = 0; $i < ($teachersCount * $cycles); $i++) {
            // Overview analytics
            $opStart = microtime(true);
            try {
                $overview = $this->analyticsService->getOverview();
                if (empty($overview['stats'])) {
                    $errors++;
                }
            } catch (\Throwable $e) {
                $errors++;
            }
            $latencies[] = (microtime(true) - $opStart) * 1000;
            $operationCounts['teacher_overview']++;
            $totalOperations++;

            // Roster list con búsqueda
            $opStart = microtime(true);
            try {
                $roster = $this->rosterService->getRoster($i % 2 === 0 ? 'Ana' : null);
                if ($roster === null) {
                    $errors++;
                }
            } catch (\Throwable $e) {
                $errors++;
            }
            $latencies[] = (microtime(true) - $opStart) * 1000;
            $operationCounts['student_roster']++;
            $totalOperations++;

            // Student detail inspection
            if ($demoStudent) {
                $opStart = microtime(true);
                try {
                    $detail = $this->studentManagement->getStudentDetail($demoStudent->id);
                    if (empty($detail['student'])) {
                        $errors++;
                    }
                } catch (\Throwable $e) {
                    $errors++;
                }
                $latencies[] = (microtime(true) - $opStart) * 1000;
                $operationCounts['student_detail']++;
                $totalOperations++;
            }
        }

        $globalDuration = microtime(true) - $globalStartTime;
        $peakMemory = memory_get_peak_usage(true) / (1024 * 1024);

        // Cálculos estadísticos de latencia
        sort($latencies);
        $count = count($latencies);
        $avgLatency = $count > 0 ? array_sum($latencies) / $count : 0;
        $minLatency = $count > 0 ? $latencies[0] : 0;
        $medianLatency = $count > 0 ? $latencies[(int) ($count * 0.5)] : 0;
        $p95Latency = $count > 0 ? $latencies[(int) ($count * 0.95)] : 0;
        $maxLatency = $count > 0 ? $latencies[$count - 1] : 0;
        $throughputRps = $globalDuration > 0 ? $totalOperations / $globalDuration : 0;

        return [
            'total_operations' => $totalOperations,
            'successful_ops'   => $totalOperations - $errors,
            'failed_ops'       => $errors,
            'error_rate_pct'   => $totalOperations > 0 ? round(($errors / $totalOperations) * 100, 2) : 0,
            'duration_seconds' => round($globalDuration, 3),
            'throughput_rps'   => round($throughputRps, 1),
            'latency_ms'       => [
                'min'    => round($minLatency, 2),
                'median' => round($medianLatency, 2),
                'avg'    => round($avgLatency, 2),
                'p95'    => round($p95Latency, 2),
                'max'    => round($maxLatency, 2),
            ],
            'memory_peak_mb'   => round($peakMemory, 2),
            'breakdown'        => $operationCounts,
            'status'           => $errors === 0 ? 'HEALTHY' : 'WARNING',
        ];
    }
}
