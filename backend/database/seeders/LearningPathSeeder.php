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
    }
}
