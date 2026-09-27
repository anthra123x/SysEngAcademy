<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\ForumPost;
use App\Models\ForumReply;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    public function run(): void
    {
        $student = User::where('email', 'estudiante@sysengacademy.dev')->first()
            ?? User::where('role', 'student')->first();
        $instructor = User::where('email', 'instructor@sysengacademy.dev')->first()
            ?? User::where('role', 'instructor')->first();

        if (! $student || ! $instructor) {
            return;
        }

        $course1 = Course::where('slug', 'introduccion-programacion')->first();
        if ($course1) {
            $mod1 = Module::where('course_id', $course1->id)->orderBy('order')->first();
            $lesson1 = $mod1 ? Lesson::where('module_id', $mod1->id)->first() : null;

            $post1 = ForumPost::firstOrCreate(
                ['title' => '¿Cuál es la diferencia entre declarar, inicializar y reasignar una variable?', 'course_id' => $course1->id],
                [
                    'user_id'   => $student->id,
                    'module_id' => $mod1?->id,
                    'lesson_id' => $lesson1?->id,
                    'content'   => "¿Hola a todos! Estoy empezando el curso y a veces me confundo cuando en algunos lenguajes se habla de 'declarar' una variable vs 'asignarle' valor o 'reasignar'. ¿Cuál es la diferencia exacta a nivel de ejecución?",
                    'category'  => 'question',
                    'upvotes'   => 4,
                    'is_solved' => true,
                ]
            );

            ForumReply::firstOrCreate(
                ['post_id' => $post1->id, 'user_id' => $instructor->id],
                [
                    'content'     => "¡Hola! Es una excelente duda para empezar con bases sólidas:\n\n1. **Declaración:** Le reservas un nombre y espacio en la tabla de símbolos del lenguaje (por ejemplo, `let total;` en JavaScript o `\$total;`).\n2. **Inicialización:** Es la **primera vez** que le das un valor (`\$total = 0;`).\n3. **Reasignación:** Cambias el valor que ya tenía guardado por uno nuevo más adelante (`\$total = \$total + 10;`).\n\nEn Python o PHP la declaración y la inicialización ocurren en la misma sentencia la primera vez que asignas.",
                    'is_solution' => true,
                    'upvotes'     => 6,
                ]
            );

            // Segundo post: debate sobre buenas prácticas
            $post2 = ForumPost::firstOrCreate(
                ['title' => '¿Es preferible usar switch/match o múltiples bloques if-else en código limpio?', 'course_id' => $course1->id],
                [
                    'user_id'   => $student->id,
                    'module_id' => $mod1?->id,
                    'content'   => 'Al evaluar múltiples condiciones sobre una misma variable de estado, ¿cuándo conviene pasar de if-else a un switch o match? ¿Hay diferencia de rendimiento o es solo legibilidad?',
                    'category'  => 'discussion',
                    'upvotes'   => 2,
                    'is_solved' => false,
                ]
            );

            ForumReply::firstOrCreate(
                ['post_id' => $post2->id, 'user_id' => $instructor->id],
                [
                    'content'     => "Principalmente es legibilidad e intención: cuando tienes 3 o más ramas comparando un mismo valor discreto, `match` (en PHP 8 o Python 3.10+) o `switch` expresan claramente la tabla de decisión y evitan errores tipográficos. Además, `match` es exhaustivo y devuelve un valor directamente como expresión.",
                    'is_solution' => false,
                    'upvotes'     => 3,
                ]
            );
        }

        // Post en Algoritmos de Ordenamiento
        $course2 = Course::where('slug', 'algoritmos-ordenamiento')->first();
        if ($course2) {
            $postAlgo = ForumPost::firstOrCreate(
                ['title' => 'Mi solución y análisis para evitar el peor caso de QuickSort con pivote aleatorio', 'course_id' => $course2->id],
                [
                    'user_id'   => $student->id,
                    'content'   => "En el análisis de QuickSort vimos que si el array ya viene ordenado y elegimos siempre el primer elemento como pivote, caemos en O(n²).\n\nMi solución fue seleccionar el pivote con una función aleatoria o con la técnica de la 'mediana de tres' (primer, medio y último elemento). Con esto garantizamos un promedio O(n log n) prácticamente siempre.",
                    'category'  => 'solution',
                    'upvotes'   => 8,
                    'is_solved' => true,
                ]
            );

            ForumReply::firstOrCreate(
                ['post_id' => $postAlgo->id, 'user_id' => $instructor->id],
                [
                    'content'     => '¡Impecable solución! La técnica de la mediana de tres es exactamente lo que implementan los algoritmos híbridos de producción (como Introsort en la biblioteca estándar de C++ o Timsort en Python). ¡Sigue así!',
                    'is_solution' => true,
                    'upvotes'     => 7,
                ]
            );
        }

        // Post en SQL
        $course3 = Course::where('slug', 'sql-desde-cero')->first();
        if ($course3) {
            $postSql = ForumPost::firstOrCreate(
                ['title' => 'Duda conceptual del examen: ¿Por qué WHERE se evalúa antes que HAVING?', 'course_id' => $course3->id],
                [
                    'user_id'   => $student->id,
                    'content'   => 'En una de las preguntas de la evaluación se pregunta sobre el orden lógico de ejecución en SQL. Me costó entender por qué el motor ejecuta WHERE antes de GROUP BY y HAVING.',
                    'category'  => 'exam',
                    'upvotes'   => 5,
                    'is_solved' => true,
                ]
            );

            ForumReply::firstOrCreate(
                ['post_id' => $postSql->id, 'user_id' => $instructor->id],
                [
                    'content'     => "El orden lógico de ejecución de SQL es:\n1. **FROM / JOIN** (obtiene el conjunto de datos base)\n2. **WHERE** (filtra filas individuales **antes** de agrupar)\n3. **GROUP BY** (colapsa las filas supervivientes en grupos)\n4. **HAVING** (filtra grupos usando agregaciones como `COUNT(*) > 5`)\n5. **SELECT** (proyecta columnas)\n6. **ORDER BY** y **LIMIT**\n\nPor eso no puedes usar funciones de agregación en el `WHERE`, porque los grupos aún no existen.",
                    'is_solution' => true,
                    'upvotes'     => 9,
                ]
            );
        }
    }
}
