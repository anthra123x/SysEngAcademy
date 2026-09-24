<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Category;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use App\Models\User;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role', 'instructor')->first();
        $basicCat   = Category::where('slug', 'programacion-basica')->first();
        $algoCat    = Category::where('slug', 'algoritmos')->first();
        $dbCat      = Category::where('slug', 'bases-de-datos')->first();
        $webCat     = Category::where('slug', 'desarrollo-web')->first();

        $path1      = LearningPath::where('slug', 'fundamentos-programacion')->first();
        $path1Lvl1  = LearningPathLevel::where('learning_path_id', $path1?->id)->where('order', 1)->first();

        // Curso 1: Introducción a la Programación (dentro de la ruta)
        $course1 = Course::firstOrCreate(['slug' => 'introduccion-programacion'], [
            'title'                  => 'Introducción a la Programación',
            'description'            => 'Aprende los fundamentos absolutos de la programación. Sin experiencia previa requerida. Cubriremos variables, tipos de datos, estructuras de control y funciones básicas con ejemplos prácticos.',
            'category_id'            => $basicCat?->id,
            'instructor_id'          => $instructor?->id,
            'is_published'           => true,
            'is_free'                => true,
            'duration_hours'         => 12,
            'difficulty'             => 'beginner',
            'learning_path_id'       => $path1?->id,
            'learning_path_level_id' => $path1Lvl1?->id,
            'order'                  => 1,
        ]);

        $mod1 = Module::firstOrCreate(['course_id' => $course1->id, 'order' => 1], [
            'title'       => 'Variables y Tipos de Datos',
            'description' => 'Todo lo que necesitas saber sobre cómo almacenar información.',
        ]);
        Lesson::firstOrCreate(['slug' => 'que-es-una-variable'], [
            'module_id'        => $mod1->id,
            'title'            => '¿Qué es una variable?',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 10,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'Una variable es un espacio en memoria con un nombre que almacena un valor que puede cambiar durante la ejecución del programa...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'tipos-de-datos-basicos'], [
            'module_id'        => $mod1->id,
            'title'            => 'Tipos de datos básicos',
            'order'            => 2,
            'type'             => 'article',
            'duration_minutes' => 15,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'Los tipos de datos fundamentales son: enteros (int), decimales (float), cadenas (string) y booleanos (bool)...'],
        ]);

        $mod2 = Module::firstOrCreate(['course_id' => $course1->id, 'order' => 2], [
            'title'       => 'Estructuras de Control',
            'description' => 'Condicionales y ciclos para controlar el flujo de tu programa.',
        ]);
        Lesson::firstOrCreate(['slug' => 'condicionales-if-else'], [
            'module_id'        => $mod2->id,
            'title'            => 'Condicionales: if, else, elif',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 20,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'Los condicionales permiten ejecutar bloques de código solo cuando se cumple una condición...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'ciclos-for-while'], [
            'module_id'        => $mod2->id,
            'title'            => 'Ciclos: for y while',
            'order'            => 2,
            'type'             => 'article',
            'duration_minutes' => 25,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'Los ciclos permiten repetir un bloque de código múltiples veces...'],
        ]);

        // Curso 2: Algoritmos de Ordenamiento (curso independiente)
        $course2 = Course::firstOrCreate(['slug' => 'algoritmos-ordenamiento'], [
            'title'          => 'Algoritmos de Ordenamiento',
            'description'    => 'Estudia los algoritmos de ordenamiento más importantes: Bubble Sort, Selection Sort, Merge Sort, Quick Sort. Aprende a analizar su complejidad temporal y espacial con Big-O notation.',
            'category_id'    => $algoCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 8,
            'difficulty'     => 'intermediate',
        ]);

        $mod3 = Module::firstOrCreate(['course_id' => $course2->id, 'order' => 1], [
            'title' => 'Introducción a la Complejidad',
        ]);
        Lesson::firstOrCreate(['slug' => 'notacion-big-o'], [
            'module_id'        => $mod3->id,
            'title'            => 'Notación Big-O',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 20,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'La notación Big-O describe el comportamiento asintótico de un algoritmo...'],
        ]);

        // Curso 3: SQL desde Cero
        $course3 = Course::firstOrCreate(['slug' => 'sql-desde-cero'], [
            'title'          => 'SQL desde Cero',
            'description'    => 'Aprende SQL de manera práctica. Desde SELECT básicos hasta JOINs complejos, subconsultas, índices y optimización de consultas. Ideal para cualquier estudiante de ingeniería.',
            'category_id'    => $dbCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 10,
            'difficulty'     => 'beginner',
        ]);

        $mod4 = Module::firstOrCreate(['course_id' => $course3->id, 'order' => 1], [
            'title' => 'Fundamentos de SQL',
        ]);
        Lesson::firstOrCreate(['slug' => 'que-es-sql-y-bases-de-datos'], [
            'module_id'        => $mod4->id,
            'title'            => '¿Qué es SQL y las bases de datos relacionales?',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 15,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'SQL (Structured Query Language) es el lenguaje estándar para gestionar bases de datos relacionales...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'primer-select'], [
            'module_id'        => $mod4->id,
            'title'            => 'Tu primer SELECT',
            'order'            => 2,
            'type'             => 'code_challenge',
            'duration_minutes' => 20,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'La sentencia SELECT es la más usada en SQL y permite consultar datos de una tabla...'],
        ]);

        // Curso 4: Introducción al Desarrollo Web
        Course::firstOrCreate(['slug' => 'intro-desarrollo-web'], [
            'title'          => 'Introducción al Desarrollo Web',
            'description'    => 'Aprende los fundamentos del desarrollo web: HTML, CSS y JavaScript. Crea tus primeras páginas web interactivas desde cero hasta un proyecto personal funcional.',
            'category_id'    => $webCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 15,
            'difficulty'     => 'beginner',
        ]);
    }
}
