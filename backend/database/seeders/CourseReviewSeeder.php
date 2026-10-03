<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseReviewSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $courses = Course::where('is_published', true)->get();

        $comments = [
            5 => [
                'Excelente curso. Los retos prácticos en el IDE integrado realmente ayudan a consolidar la arquitectura.',
                'Muy claro y directo al punto. La profundidad técnica es de primer nivel para ingeniería de software.',
                'El mejor contenido que he visto en español sobre esta especialidad. 100% recomendado.',
                'Explicación impecable de los conceptos. Los módulos avanzan de forma natural y sin vacíos.',
                'Los ejercicios interactivos y la retroalimentación en tiempo real hacen que aprender sea muy fluido.',
            ],
            4 => [
                'Muy buen material y ejercicios desafiantes. Gran complemento para la carrera.',
                'Excelente estructuración del temario, los ejemplos con código real aportan mucho valor.',
                'Buen ritmo de aprendizaje y lecciones concisas pero completas.',
            ],
        ];

        foreach ($courses as $index => $course) {
            // Asignar entre 2 y 4 reseñas de usuarios existentes
            $sampleUsers = $users->shuffle()->take(min(4, $users->count()));
            foreach ($sampleUsers as $uIndex => $user) {
                $rating = ($uIndex === 0 && $index % 3 === 0) ? 4 : 5;
                $commentPool = $comments[$rating];
                $comment = $commentPool[($course->id + $user->id) % count($commentPool)];

                CourseReview::updateOrCreate(
                    [
                        'course_id' => $course->id,
                        'user_id' => $user->id,
                    ],
                    [
                        'rating' => $rating,
                        'comment' => $comment,
                    ]
                );
            }

            // Recalcular métrica real con conteo estricto
            $course->recalculateRating();
        }
    }
}
