<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

echo "=== Organizando Cursos en Niveles de Rutas de Aprendizaje ===\n";

DB::beginTransaction();

try {
    // 1. Eliminar niveles sobrantes sin cursos (Fullstack Nivel 4 y Git Nivel 4)
    LearningPathLevel::whereIn('id', [41, 43])->delete();
    echo "  ✓ Niveles redundantes eliminados.\n";

    // 2. Mapeo exacto de Curso -> (Ruta, Nivel)
    $assignments = [
        // RUTA 1: Fundamentos de Programación (ID: 1)
        'introduccion-programacion'       => ['path_id' => 1, 'level_id' => 1],   // Nivel 1: Pensamiento Lógico
        'pseint-desde-cero'               => ['path_id' => 1, 'level_id' => 1],   // Nivel 1: Pensamiento Lógico
        'logica-pensamiento-computacional'=> ['path_id' => 1, 'level_id' => 2],   // Nivel 2: Programación Estructurada
        'python-estructurado'             => ['path_id' => 1, 'level_id' => 2],   // Nivel 2: Programación Estructurada
        'sql-desde-cero'                  => ['path_id' => 1, 'level_id' => 3],   // Nivel 3: Algoritmos Básicos
        'algoritmos-ordenamiento'         => ['path_id' => 1, 'level_id' => 3],   // Nivel 3: Algoritmos Básicos
        'estructuras-datos-lineales'      => ['path_id' => 1, 'level_id' => 38],  // Nivel 4: Clean Code y Estructuras

        // RUTA 2: Desarrollo Orientado a Objetos (ID: 2)
        'introduccion-poo'                => ['path_id' => 2, 'level_id' => 4],   // Nivel 1: Conceptos de POO
        'clases-objetos-herencia'         => ['path_id' => 2, 'level_id' => 4],   // Nivel 1: Conceptos de POO
        'diseno-modular-interfaces'       => ['path_id' => 2, 'level_id' => 5],   // Nivel 2: Principios SOLID
        'principios-solid'                => ['path_id' => 2, 'level_id' => 5],   // Nivel 2: Principios SOLID
        'patrones-de-diseno'              => ['path_id' => 2, 'level_id' => 6],   // Nivel 3: Patrones de Diseño
        'arquitectura-proyecto-poo'       => ['path_id' => 2, 'level_id' => 7],   // Nivel 4: Proyecto Final

        // RUTA 3: Desarrollo Backend (ID: 3)
        'backend-introduccion'            => ['path_id' => 3, 'level_id' => 8],   // Nivel 1: Fundamentos de Backend
        'arquitectura-web-http'           => ['path_id' => 3, 'level_id' => 9],   // Nivel 2: APIs REST y Protocolo Web
        'apis-rest-con-laravel'           => ['path_id' => 3, 'level_id' => 9],   // Nivel 2: APIs REST
        'diseno-apis-restful'             => ['path_id' => 3, 'level_id' => 9],   // Nivel 2: APIs REST
        'modelos-relaciones-y-consultas'  => ['path_id' => 3, 'level_id' => 10],  // Nivel 3: Bases de Datos y ORMs
        'seguridad-en-apis'               => ['path_id' => 3, 'level_id' => 40],  // Nivel 5: Arquitectura Limpia y Seguridad

        // RUTA 4: Desarrollo Frontend (ID: 4)
        'html-css-javascript'             => ['path_id' => 4, 'level_id' => 12],  // Nivel 1: Fundamentos de la Web
        'intro-desarrollo-web'            => ['path_id' => 4, 'level_id' => 12],  // Nivel 1: Fundamentos de la Web
        'css-moderno-flexbox-grid'        => ['path_id' => 4, 'level_id' => 12],  // Nivel 1: Fundamentos de la Web
        'angular-moderno'                 => ['path_id' => 4, 'level_id' => 13],  // Nivel 2: Frameworks Modernos
        'typescript-profesional-frontend' => ['path_id' => 4, 'level_id' => 13],  // Nivel 2: Frameworks Modernos
        'accesibilidad-y-performance-web' => ['path_id' => 4, 'level_id' => 39],  // Nivel 4: Testing y Rendimiento Web

        // RUTA 5: Desarrollo Full Stack (ID: 5)
        'integracion-frontend-backend'    => ['path_id' => 5, 'level_id' => 15],  // Nivel 1: Integración
        'autenticacion-jwt-web'           => ['path_id' => 5, 'level_id' => 16],  // Nivel 2: Identidad
        'despliegue-fullstack'            => ['path_id' => 5, 'level_id' => 17],  // Nivel 3: Entrega y Producción

        // RUTA 6: DevOps (ID: 6)
        'linux-y-linea-de-comandos'       => ['path_id' => 6, 'level_id' => 18],  // Nivel 1: Fundamentos de Sistemas
        'docker-y-contenedores'           => ['path_id' => 6, 'level_id' => 19],  // Nivel 2: Contenedores
        'docker-compose-multiservicio'    => ['path_id' => 6, 'level_id' => 19],  // Nivel 2: Contenedores y Multiservicio
        'ci-cd-github-actions'            => ['path_id' => 6, 'level_id' => 42],  // Nivel 4: Infraestructura y DevSecOps

        // RUTA 7: Git y Control de Versiones (ID: 7)
        'git-desde-cero'                  => ['path_id' => 7, 'level_id' => 21],  // Nivel 1: Fundamentos
        'git-colaboracion-y-flujos'       => ['path_id' => 7, 'level_id' => 22],  // Nivel 2: Colaboración
        'git-avanzado-rebase-conflictos'  => ['path_id' => 7, 'level_id' => 23],  // Nivel 3: Flujos Profesionales

        // RUTA 8: Ingeniería de Requerimientos (ID: 8)
        'fundamentos-requerimientos'      => ['path_id' => 8, 'level_id' => 24],  // Nivel 1: Fundamentos
        'historias-de-usuario-y-casos-de-uso' => ['path_id' => 8, 'level_id' => 25], // Nivel 2: Modelado
        'especificacion-srs-diagramas'    => ['path_id' => 8, 'level_id' => 25], // Nivel 2: Modelado Formal
        'gestion-de-requerimientos'       => ['path_id' => 8, 'level_id' => 44], // Nivel 4: Arquitectura Ágil

        // RUTA 9: Desarrollo con IA (ID: 9)
        'introduccion-ia-para-desarrolladores' => ['path_id' => 9, 'level_id' => 27], // Nivel 1: Fundamentos
        'prompt-engineering-practico'     => ['path_id' => 9, 'level_id' => 28], // Nivel 2: Prompt Engineering
        'rag-embeddings-bases-vectoriales'=> ['path_id' => 9, 'level_id' => 28], // Nivel 2: Embeddings y RAG
        'ia-en-el-ciclo-de-desarrollo'    => ['path_id' => 9, 'level_id' => 45], // Nivel 4: LLMOps y Ciclo de Vida
    ];

    foreach ($assignments as $slug => $data) {
        $c = Course::where('slug', $slug)->first();
        if ($c) {
            $c->update([
                'learning_path_id' => $data['path_id'],
                'learning_path_level_id' => $data['level_id'],
            ]);
            echo "  ✓ Asignado: {$c->title} -> Ruta {$data['path_id']}, Nivel {$data['level_id']}\n";
        }
    }

    // Asegurar títulos descriptivos
    LearningPathLevel::where('id', 38)->update([
        'title' => 'Nivel 4 — Clean Code, Refactorización y Estructuras de Datos',
        'description' => 'Aplica principios de Robert C. Martin y Martin Fowler: complejidad asintótica, estructuras lineales y código mantenible.'
    ]);

    LearningPathLevel::where('id', 40)->update([
        'title' => 'Nivel 4 — Seguridad en APIs, Resiliencia y Buenas Prácticas',
        'description' => 'Protege endpoints con OAuth2, rate limiting, validación criptográfica y tolerancia a fallos.'
    ]);

    // En backend, Nivel 11 lo reordenamos si Nivel 40 es Nivel 4
    LearningPathLevel::where('id', 11)->delete(); // El anterior nivel 4 redundante

    LearningPathLevel::where('id', 14)->delete(); // En frontend, consolidar en 12, 13 y 39
    LearningPathLevel::where('id', 39)->update([
        'order' => 3,
        'title' => 'Nivel 3 — Calidad, Accesibilidad y Rendimiento Web',
        'description' => 'Métricas Core Web Vitals, testing unitario y accesibilidad WCAG 2.1.'
    ]);

    LearningPathLevel::where('id', 20)->delete(); // En DevOps, consolidar en 18, 19 y 42
    LearningPathLevel::where('id', 42)->update([
        'order' => 3,
        'title' => 'Nivel 3 — Automatización CI/CD y DevSecOps',
        'description' => 'Pipelines continuos con GitHub Actions, escaneo de dependencias y despliegue seguro.'
    ]);

    LearningPathLevel::where('id', 26)->delete(); // En Requerimientos, consolidar en 24, 25 y 44
    LearningPathLevel::where('id', 44)->update([
        'order' => 3,
        'title' => 'Nivel 3 — Gestión del Cambio y Domain-Driven Design',
        'description' => 'Trazabilidad, priorización MoSCoW y modelado estratégico del dominio.'
    ]);

    LearningPathLevel::where('id', 29)->delete(); // En IA, consolidar en 27, 28 y 45
    LearningPathLevel::where('id', 45)->update([
        'order' => 3,
        'title' => 'Nivel 3 — Agentes Autónomos y Ciclo de Vida con IA',
        'description' => 'Integración de asistentes en CI/CD, evaluación cuantitativa de prompts y observabilidad.'
    ]);

    DB::commit();
    Cache::flush();
    echo "\n=== Organización Completada con Éxito ===\n";

} catch (\Throwable $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
