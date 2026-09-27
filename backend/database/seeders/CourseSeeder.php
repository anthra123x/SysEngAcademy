<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseSeeder extends Seeder
{
    /**
     * Mapea el hint de categoría de los archivos de datos al slug real en la DB.
     * Solo se usa como valor por defecto al CREAR cursos nuevos; los cursos
     * existentes conservan su category_id real vía firstOrCreate.
     */
    private const CATEGORY_SLUGS = [
        'programacion-basica' => 'programacion-basica',
        'algoritmos' => 'algoritmos',
        'poo' => 'poo',
        'bases-de-datos' => 'bases-de-datos',
        'desarrollo-web' => 'desarrollo-web',
        'desarrollo-backend' => 'desarrollo-backend',
        'desarrollo-frontend' => 'desarrollo-frontend',
        'devops' => 'devops',
        'git' => 'git',
        'requerimientos' => 'ingenieria-software',
        'ia' => 'ia-desarrollo',
    ];

    /** Archivos de datos, en orden de carga. */
    private const DATA_FILES = [
        'poo', 'fundamentos', 'fundamentos-pseint', 'web', 'backend', 'fullstack', 'devops', 'git', 'requisitos', 'ia',
    ];

    /**
     * Payloads de ejecución por slug de lección (lenguaje, starter, solución y
     * casos de prueba). Se cargan una vez y se fusionan con las lecciones de
     * tipo code_challenge, de modo que la parte ejecutable del ejercicio
     * evoluciona separada del enunciado pedagógico del curso.
     *
     * @var array<string, array<string, mixed>>|null
     */
    private static ?array $exercisePayloads = null;

    /**
     * @return array<string, array<string, mixed>>
     */
    private static function exercisePayloads(): array
    {
        if (self::$exercisePayloads === null) {
            $path = database_path('seeders/exercise_payloads.php');
            self::$exercisePayloads = is_file($path) ? (array) require $path : [];
        }

        return self::$exercisePayloads;
    }

    public function run(): void
    {
        foreach (self::DATA_FILES as $file) {
            $courses = require database_path("seeders/data/{$file}.php");
            foreach ($courses as $course) {
                try {
                    DB::transaction(function () use ($course) {
                        $this->seedCourse($course);
                    });
                } catch (\Throwable $e) {
                    $slug = $course['slug'] ?? 'unknown';
                    $this->command?->error("  ✗ Error en curso {$slug}: {$e->getMessage()}");
                    DB::reconnect();
                    try {
                        DB::transaction(function () use ($course) {
                            $this->seedCourse($course);
                        });
                        $this->command?->info("  ✓ Reintento exitoso para {$slug}");
                    } catch (\Throwable $e2) {
                        $this->command?->error("  ✗ Falló reintento para {$slug}: {$e2->getMessage()}");
                    }
                }
            }
        }
    }

    public function seedCourse(array $course): void
    {
        $slug = $course['slug'] ?? '';

        $instructorId = User::where('role', 'instructor')->value('id');

        $categorySlug = self::CATEGORY_SLUGS[$course['category'] ?? ''] ?? null;
        $categoryId = $categorySlug ? Category::where('slug', $categorySlug)->value('id') : null;

        $pathId = null;
        $levelId = null;
        if (! empty($course['learning_path'])) {
            $pathId = LearningPath::where('slug', $course['learning_path'])->value('id');
            if ($pathId && ! empty($course['learning_path_level'])) {
                $levelId = LearningPathLevel::where('learning_path_id', $pathId)
                    ->where('order', $course['learning_path_level'])
                    ->value('id');
            }
        }

        $courseData = [
            'title' => $course['title'] ?? $slug,
            'description' => $course['description'] ?? null,
            'is_published' => true,
            'is_free' => $course['is_free'] ?? true,
            'duration_hours' => $course['duration_hours'] ?? 8,
            'difficulty' => $course['difficulty'] ?? 'beginner',
            'learning_path_id' => $pathId,
            'learning_path_level_id' => $levelId,
            'order' => $course['order'] ?? 0,
        ];
        if ($categoryId) {
            $courseData['category_id'] = $categoryId;
        }
        if ($instructorId) {
            $courseData['instructor_id'] = $instructorId;
        }

        $courseModel = Course::updateOrCreate(['slug' => $slug], $courseData);

        $this->command?->info("  • Curso: {$courseModel->title} [{$slug}]");

        foreach (array_values($course['modules'] ?? []) as $mi => $module) {
            $mod = Module::updateOrCreate(
                ['course_id' => $courseModel->id, 'order' => $mi + 1],
                [
                    'title' => $module['title'] ?? 'Módulo '.($mi + 1),
                    'description' => $module['description'] ?? null,
                ]
            );

            foreach (array_values($module['lessons'] ?? []) as $li => $lesson) {
                $isExercise = ($lesson['type'] ?? 'article') === 'code_challenge';

                // La parte ejecutable puede venir en el propio archivo de curso
                // o, más habitual, en exercise_payloads.php (fusionado por slug).
                $payload = $isExercise
                    ? (self::exercisePayloads()[$lesson['slug']] ?? [])
                    : [];

                $lessonModel = Lesson::updateOrCreate(['slug' => $lesson['slug']], [
                    'module_id' => $mod->id,
                    'title' => $lesson['title'] ?? $lesson['slug'],
                    'order' => $li + 1,
                    'type' => $lesson['type'] ?? 'article',
                    'duration_minutes' => $lesson['duration'] ?? 10,
                    'is_preview' => $lesson['preview'] ?? false,
                    'content' => $this->buildDoc($lesson['blocks'] ?? []),
                    'language' => $isExercise
                        ? ($payload['language'] ?? $lesson['language'] ?? $course['language'] ?? null)
                        : ($lesson['language'] ?? null),
                    'starter_code' => $isExercise
                        ? ($payload['starter'] ?? $lesson['starter'] ?? null)
                        : null,
                    'solution' => $isExercise
                        ? ($payload['solution'] ?? $lesson['solution'] ?? null)
                        : null,
                    'test_cases' => $isExercise
                        ? ($payload['tests'] ?? $lesson['tests'] ?? null)
                        : null,
                    'hint' => $isExercise
                        ? ($payload['hint'] ?? $lesson['hint'] ?? null)
                        : null,
                ]);

                $this->seedQuiz($lessonModel, $lesson['quiz'] ?? []);
            }
        }
    }

    private function seedQuiz(Lesson $lesson, array $quiz): void
    {
        if (empty($quiz['questions'])) {
            return;
        }

        $quizModel = Quiz::updateOrCreate(
            ['lesson_id' => $lesson->id],
            ['title' => $quiz['title'] ?? 'Comprueba lo aprendido']
        );

        foreach (array_values($quiz['questions']) as $qi => $question) {
            $q = QuizQuestion::updateOrCreate(
                ['quiz_id' => $quizModel->id, 'order' => $qi + 1],
                [
                    'question' => $question['q'] ?? '',
                    'type' => $question['type'] ?? 'single',
                ]
            );

            foreach ($question['answers'] ?? [] as $answer) {
                QuizAnswer::updateOrCreate(
                    ['question_id' => $q->id, 'answer_text' => (string) $answer[0]],
                    [
                        'is_correct' => (bool) ($answer[1] ?? false),
                        'explanation' => $answer[2] ?? null,
                    ]
                );
            }
        }
    }

    /**
     * Convierte el DSL compacto de bloques a la forma canónica de contenido:
     * ['h', texto] | ['p', texto] | ['code', lang, texto] | ['list', items]
     * → { type: 'doc', blocks: [{ type, level?, language?, text|items }] }
     */
    private function buildDoc(array $blocks): array
    {
        $doc = [];

        foreach ($blocks as $raw) {
            $rest = $raw;
            $tag = array_shift($rest);

            switch ($tag) {
                case 'h':
                    $doc[] = ['type' => 'heading', 'level' => 2, 'text' => (string) ($rest[0] ?? '')];
                    break;

                case 'p':
                    $doc[] = ['type' => 'paragraph', 'text' => (string) ($rest[0] ?? '')];
                    break;

                case 'code':
                    $doc[] = [
                        'type' => 'code',
                        'language' => (string) ($rest[0] ?? 'text'),
                        'text' => (string) ($rest[1] ?? ''),
                    ];
                    break;

                case 'list':
                    $doc[] = ['type' => 'list', 'items' => array_values((array) ($rest[0] ?? []))];
                    break;
            }
        }

        return ['type' => 'doc', 'blocks' => $doc];
    }
}
