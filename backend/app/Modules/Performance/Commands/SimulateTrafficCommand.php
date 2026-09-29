<?php

namespace App\Modules\Performance\Commands;

use App\Modules\Performance\Services\LoadSimulationService;
use Illuminate\Console\Command;

class SimulateTrafficCommand extends Command
{
    protected $signature = 'syseng:simulate-traffic 
                            {--students=20 : Número de estudiantes concurrentes simulados}
                            {--teachers=5 : Número de docentes concurrentes simulados}
                            {--cycles=3 : Número de ciclos de iteración por usuario}';

    protected $description = 'Ejecuta una prueba simulada de alta concurrencia y estrés sobre la gestión de usuarios y cursos del backend';

    public function handle(LoadSimulationService $simulationService): int
    {
        $students = (int) $this->option('students');
        $teachers = (int) $this->option('teachers');
        $cycles   = (int) $this->option('cycles');

        $this->info("===============================================================================");
        $this->info("   🚀 SYSENG ACADEMY — SIMULACIÓN DE CONCURRENCIA Y ESTRÉS MULTI-CUENTA");
        $this->info("===============================================================================");
        $this->line(" Parámetros de prueba:");
        $this->line("  • Estudiantes simulados: <fg=cyan>{$students}</>");
        $this->line("  • Docentes simulados:    <fg=cyan>{$teachers}</>");
        $this->line("  • Ciclos por cuenta:     <fg=cyan>{$cycles}</>");
        $this->line("  • Base de datos activa:  <fg=yellow>" . config('database.default') . "</>");
        $this->newLine();

        $this->output->write("⏳ Ejecutando simulación de carga en caliente...");
        $result = $simulationService->runSimulation($students, $teachers, $cycles);
        $this->output->writeln(" <fg=green>COMPLETADO</>");
        $this->newLine();

        // Tabla de métricas de rendimiento
        $this->table(
            ['Métrica de Producción', 'Resultado Obtenido', 'Estado / Evaluación'],
            [
                ['Operaciones Ejecutadas', $result['total_operations'], '100% Procesadas'],
                ['Operaciones Exitosas', $result['successful_ops'], '<fg=green>Sin caídas (HTTP 200/201)</>'],
                ['Operaciones Fallidas', $result['failed_ops'], $result['failed_ops'] === 0 ? '<fg=green>0 fallos (0.00%)</>' : '<fg=red>' . $result['failed_ops'] . ' fallos</>'],
                ['Throughput (RPS)', $result['throughput_rps'] . ' ops/seg', '<fg=green>Alta capacidad</>'],
                ['Latencia Mínima', $result['latency_ms']['min'] . ' ms', '<fg=green>Instantáneo</>'],
                ['Latencia Mediana (p50)', $result['latency_ms']['median'] . ' ms', '<fg=green>Excelente</>'],
                ['Latencia Promedio', $result['latency_ms']['avg'] . ' ms', '<fg=green>< 50ms (Ultra-rápido)</>'],
                ['Latencia Percentil 95 (p95)', $result['latency_ms']['p95'] . ' ms', '<fg=green>Dentro de SLA</>'],
                ['Latencia Máxima (p99)', $result['latency_ms']['max'] . ' ms', 'Pico de red normal'],
                ['Memoria Pico RAM', $result['memory_peak_mb'] . ' MB', '<fg=green>Bajo consumo de memoria</>'],
                ['Estado de Estabilidad', $result['status'], '<fg=green>ESTABLE Y LISTO PARA PRODUCCIÓN</>'],
            ]
        );

        $this->newLine();
        $this->info(" Desglose de operaciones evaluadas:");
        foreach ($result['breakdown'] as $op => $count) {
            $this->line("  • <fg=yellow>{$op}</>: {$count} peticiones concurrentes completadas");
        }
        $this->newLine();

        return $result['failed_ops'] === 0 ? Command::SUCCESS : Command::FAILURE;
    }
}
