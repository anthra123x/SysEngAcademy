<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use App\Models\Category;

class LearningPathSeeder extends Seeder
{
    public function run(): void
    {
        $algoCat = Category::where('slug', 'algoritmos')->first();
        $pooCat  = Category::where('slug', 'poo')->first();

        // Ruta 1: Fundamentos de Programación
        $path1 = LearningPath::firstOrCreate(['slug' => 'fundamentos-programacion'], [
            'title'           => 'Fundamentos de Programación',
            'description'     => 'Aprende a programar desde cero. Esta ruta te lleva desde los conceptos más básicos hasta algoritmos y estructuras de datos fundamentales, preparándote para cualquier lenguaje de programación.',
            'category_id'     => $algoCat?->id,
            'difficulty'      => 'beginner',
            'is_published'    => true,
            'estimated_hours' => 60,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path1->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Pensamiento Lógico',
            'description' => 'Variables, tipos de datos, operadores y estructuras de control básicas.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path1->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Programación Estructurada',
            'description' => 'Funciones, recursión, arrays y manejo de cadenas.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path1->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Algoritmos Básicos',
            'description' => 'Algoritmos de búsqueda, ordenamiento y complejidad computacional.',
        ]);

        // Ruta 2: Desarrollo Orientado a Objetos
        $path2 = LearningPath::firstOrCreate(['slug' => 'desarrollo-orientado-objetos'], [
            'title'           => 'Desarrollo Orientado a Objetos',
            'description'     => 'Domina la Programación Orientada a Objetos con patrones de diseño y buenas prácticas. Aprende a diseñar software escalable y mantenible.',
            'category_id'     => $pooCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 80,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path2->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Conceptos de POO',
            'description' => 'Clases, objetos, encapsulamiento, herencia y polimorfismo.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path2->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Principios SOLID',
            'description' => 'Los 5 principios SOLID para diseño de software robusto.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path2->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Patrones de Diseño',
            'description' => 'Patrones creacionales, estructurales y de comportamiento (GoF).',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path2->id, 'order' => 4], [
            'title'       => 'Nivel 4 — Proyecto Final',
            'description' => 'Aplica todo lo aprendido en un proyecto real.',
        ]);

        // Ruta 3: Desarrollo Backend
        $backendCat = Category::where('slug', 'desarrollo-backend')->first();
        $path3 = LearningPath::firstOrCreate(['slug' => 'desarrollo-backend'], [
            'title'           => 'Desarrollo Backend',
            'description'     => 'Diseña e implementa el motor de las aplicaciones: APIs REST, servidores, bases de datos, autenticación y seguridad. Aprende a construir servicios robustos que escalan y que otros equipos pueden consumir con confianza.',
            'category_id'     => $backendCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 90,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path3->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos de Backend',
            'description' => 'Servidores, HTTP y el modelo cliente-servidor.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path3->id, 'order' => 2], [
            'title'       => 'Nivel 2 — APIs REST',
            'description' => 'Diseño e implementación de APIs REST con buenas prácticas.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path3->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Bases de Datos y ORMs',
            'description' => 'Modelado de datos, migraciones y consultas eficientes.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path3->id, 'order' => 4], [
            'title'       => 'Nivel 4 — Seguridad y Buenas Prácticas',
            'description' => 'Autenticación, autorización y protección de APIs.',
        ]);

        // Ruta 4: Desarrollo Frontend
        $frontCat = Category::where('slug', 'desarrollo-frontend')->first();
        $path4 = LearningPath::firstOrCreate(['slug' => 'desarrollo-frontend'], [
            'title'           => 'Desarrollo Frontend',
            'description'     => 'Construye interfaces modernas, accesibles y rápidas. Desde HTML, CSS y JavaScript hasta frameworks como Angular, con foco en componentes, estado, performance y experiencia de usuario.',
            'category_id'     => $frontCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 100,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path4->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos de la Web',
            'description' => 'HTML semántico, CSS moderno y JavaScript.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path4->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Frameworks Modernos',
            'description' => 'Componentes, estado y enrutado con Angular.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path4->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Calidad Frontend',
            'description' => 'Accesibilidad, rendimiento y buenas prácticas.',
        ]);

        // Ruta 5: Full Stack
        $webCat = Category::where('slug', 'desarrollo-web')->first();
        $path5 = LearningPath::firstOrCreate(['slug' => 'desarrollo-fullstack'], [
            'title'           => 'Desarrollo Full Stack',
            'description'     => 'Domina el ciclo completo de una aplicación web: frontend, backend, base de datos y despliegue. Aprende a integrar todas las piezas y a llevar un producto de la idea a producción.',
            'category_id'     => $webCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 120,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path5->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Integración',
            'description' => 'Conectar frontend y backend sin fricción.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path5->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Identidad',
            'description' => 'Autenticación y autorización de punta a punta.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path5->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Entrega',
            'description' => 'Build, despliegue y monitoreo de la aplicación completa.',
        ]);

        // Ruta 6: DevOps
        $devopsCat = Category::where('slug', 'devops')->first();
        $path6 = LearningPath::firstOrCreate(['slug' => 'devops'], [
            'title'           => 'DevOps',
            'description'     => 'Automatiza el ciclo de vida del software: Linux, contenedores, pipelines de CI/CD y despliegue en la nube. Aprende a entregar software de forma rápida, repetible y segura.',
            'category_id'     => $devopsCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 80,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path6->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos de Sistemas',
            'description' => 'Linux, terminal y gestión de procesos.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path6->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Contenedores y Virtualización',
            'description' => 'Docker, imágenes y orquestación básica.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path6->id, 'order' => 3], [
            'title'       => 'Nivel 3 — CI/CD y Cloud',
            'description' => 'Pipelines, despliegue continuo y observabilidad.',
        ]);

        // Ruta 7: Git y Control de Versiones
        $gitCat = Category::where('slug', 'git')->first();
        $path7 = LearningPath::firstOrCreate(['slug' => 'git-y-control-versiones'], [
            'title'           => 'Git y Control de Versiones',
            'description'     => 'Domina la herramienta más usada por los equipos de desarrollo: commits, ramas, colaboración remota, pull requests y flujos profesionales como Conventional Commits. Imprescindible para cualquier desarrollador.',
            'category_id'     => $gitCat?->id,
            'difficulty'      => 'beginner',
            'is_published'    => true,
            'estimated_hours' => 25,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path7->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos',
            'description' => 'Repositorios, commits y el ciclo básico de Git.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path7->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Colaboración',
            'description' => 'Ramas, remotes y pull requests.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path7->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Flujos Profesionales',
            'description' => 'Git Flow, Conventional Commits y resolución de conflictos.',
        ]);

        // Ruta 8: Ingeniería de Requerimientos
        $reqCat = Category::where('slug', 'ingenieria-software')->first();
        $path8 = LearningPath::firstOrCreate(['slug' => 'ingenieria-de-requerimientos'], [
            'title'           => 'Ingeniería de Requerimientos',
            'description'     => 'Aprende a descubrir, modelar, documentar y gestionar lo que realmente necesita un producto de software. La disciplina que separa los proyectos que fracasan por malentendidos de los que entregan valor.',
            'category_id'     => $reqCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 50,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path8->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos',
            'description' => 'Tipos de requerimientos y el coste de los errores.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path8->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Modelado y Documentación',
            'description' => 'Historias de usuario, casos de uso y criterios de aceptación.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path8->id, 'order' => 3], [
            'title'       => 'Nivel 3 — Gestión',
            'description' => 'Priorización, trazabilidad y gestión del cambio.',
        ]);

        // Ruta 9: Desarrollo con IA
        $aiCat = Category::where('slug', 'ia-desarrollo')->first();
        $path9 = LearningPath::firstOrCreate(['slug' => 'desarrollo-con-ia'], [
            'title'           => 'Desarrollo con IA',
            'description'     => 'Integra modelos de lenguaje en tu flujo de trabajo: entender cómo funcionan los LLMs, dominar el prompt engineering y usar la IA para programar, revisar código y automatizar tareas de desarrollo.',
            'category_id'     => $aiCat?->id,
            'difficulty'      => 'intermediate',
            'is_published'    => true,
            'estimated_hours' => 60,
        ]);

        LearningPathLevel::firstOrCreate(['learning_path_id' => $path9->id, 'order' => 1], [
            'title'       => 'Nivel 1 — Fundamentos de IA',
            'description' => 'Modelos de lenguaje, tokens y APIs de IA.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path9->id, 'order' => 2], [
            'title'       => 'Nivel 2 — Prompt Engineering',
            'description' => 'Técnicas prácticas para guiar a los modelos.',
        ]);
        LearningPathLevel::firstOrCreate(['learning_path_id' => $path9->id, 'order' => 3], [
            'title'       => 'Nivel 3 — IA en el Desarrollo',
            'description' => 'Asistentes de código, code review y automatización.',
        ]);
    }
}
