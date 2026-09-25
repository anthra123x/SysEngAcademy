<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Interactividad: player de lección (ocultar respuestas correctas,
 * prev/next), evaluación server-side de quizzes e IA contextual bajo demanda.
 *
 * Usa la BD pgsql del entorno (sin RefreshDatabase); los writes se revierten
 * con transacciones. Requiere `php artisan migrate --seed` previo.
 */
class InteractivityTest extends TestCase
{
    use DatabaseTransactions;

    protected function makeCourse(string $suffix)
    {
        return Course::create([
            'slug' => "curso-fixture-{$suffix}",
            'title' => "Curso fixture {$suffix}",
            'description' => 'Fixture de prueba',
            'is_published' => true,
            'is_free' => true,
            'difficulty' => 'beginner',
        ]);
    }

    protected function makeLesson(Module $module, string $slug, int $order, bool $preview = false): Lesson
    {
        return Lesson::create([
            'module_id' => $module->id,
            'title' => ucfirst(str_replace('-', ' ', $slug)),
            'slug' => "{$slug}-{$module->id}",
            'order' => $order,
            'type' => 'article',
            'content' => [
                'type' => 'doc',
                'blocks' => [
                    ['type' => 'paragraph', 'text' => 'Contenido de prueba para la lección.'],
                    ['type' => 'code', 'language' => 'php', 'text' => '<?php echo "hola";'],
                    ['type' => 'list', 'items' => ['Punto uno', 'Punto dos']],
                ],
            ],
            'duration_minutes' => 10,
            'is_preview' => $preview,
        ]);
    }

    protected function makeQuiz(Lesson $lesson): Quiz
    {
        $quiz = Quiz::create(['lesson_id' => $lesson->id, 'title' => 'Comprueba lo aprendido']);

        $q1 = QuizQuestion::create(['quiz_id' => $quiz->id, 'question' => '¿2 + 2?', 'type' => 'single', 'order' => 1]);
        QuizAnswer::create(['question_id' => $q1->id, 'answer_text' => '4', 'is_correct' => true, 'explanation' => '2 + 2 es 4.']);
        QuizAnswer::create(['question_id' => $q1->id, 'answer_text' => '5', 'is_correct' => false, 'explanation' => 'Incorrecto.']);
        QuizAnswer::create(['question_id' => $q1->id, 'answer_text' => '22', 'is_correct' => false, 'explanation' => 'Incorrecto.']);

        $q2 = QuizQuestion::create(['quiz_id' => $quiz->id, 'question' => '¿Qué lenguaje usa Laravel?', 'type' => 'single', 'order' => 2]);
        QuizAnswer::create(['question_id' => $q2->id, 'answer_text' => 'PHP', 'is_correct' => true, 'explanation' => 'Laravel está escrito en PHP.']);
        QuizAnswer::create(['question_id' => $q2->id, 'answer_text' => 'Python', 'is_correct' => false, 'explanation' => 'No.']);
        QuizAnswer::create(['question_id' => $q2->id, 'answer_text' => 'Java', 'is_correct' => false, 'explanation' => 'No.']);

        return $quiz;
    }

    public function test_lesson_show_no_expone_respuestas_correctas_y_anade_navegacion(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = Module::create(['course_id' => $course->id, 'title' => 'Módulo 1', 'order' => 1]);
        $lesson1 = $this->makeLesson($module, "primera-leccion-{$suffix}", 1, preview: true);
        $lesson2 = $this->makeLesson($module, "segunda-leccion-{$suffix}", 2);
        $this->makeQuiz($lesson1);

        $response = $this->getJson("/api/lessons/{$lesson1->slug}");

        $response->assertOk()
            ->assertJsonPath('title', $lesson1->title)
            ->assertJsonPath('is_preview', true)
            ->assertJsonPath('completed', false)
            ->assertJsonPath('prev_lesson', null)
            ->assertJsonPath('next_lesson.slug', $lesson2->slug)
            ->assertJsonStructure([
                'content' => ['type', 'blocks'],
                'quiz' => ['id', 'title', 'questions' => [
                    '*' => ['id', 'question', 'answers' => ['*' => ['id', 'answer_text']]],
                ]],
            ]);

        // Las respuestas NO deben incluir la respuesta correcta ni la explicación
        $payload = $response->json();
        $this->assertArrayNotHasKey('is_correct', $payload['quiz']['questions'][0]['answers'][0]);
        $this->assertArrayNotHasKey('explanation', $payload['quiz']['questions'][0]['answers'][0]);
    }

    public function test_quiz_attempt_evalua_y_devuelve_feedback_server_side(): void
    {
        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = Module::create(['course_id' => $course->id, 'title' => 'Módulo 1', 'order' => 1]);
        $lesson = $this->makeLesson($module, "leccion-quiz-{$suffix}", 1, preview: true);
        $quiz = $this->makeQuiz($lesson);

        $q1 = $quiz->questions()->orderBy('order')->get()[0];
        $q2 = $quiz->questions()->orderBy('order')->get()[1];
        $good1 = $q1->answers->firstWhere('is_correct', true);
        $bad2 = $q2->answers->firstWhere('is_correct', false);

        Sanctum::actingAs(User::where('email', 'estudiante@sysengacademy.dev')->firstOrFail());

        $response = $this->postJson("/api/lessons/{$lesson->slug}/quiz/attempt", [
            'answers' => [
                $q1->id => [$good1->id],
                $q2->id => [$bad2->id],
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('score', 50)
            ->assertJsonPath('correct', 1)
            ->assertJsonPath('total', 2)
            ->assertJsonPath('passed', false)
            ->assertJsonPath('results.0.correct', true)
            ->assertJsonPath('results.0.correct_answer_ids.0', $good1->id)
            ->assertJsonPath('results.0.explanation', '2 + 2 es 4.')
            ->assertJsonPath('results.1.correct', false)
            ->assertJsonPath('results.1.correct_answer_ids.0', $q2->answers->firstWhere('is_correct', true)->id)
            ->assertJsonPath('results.1.selected_ids.0', $bad2->id);
    }

    public function test_quiz_attempt_requiere_autenticacion(): void
    {
        $this->postJson('/api/lessons/cualquiera/quiz/attempt', ['answers' => []])
            ->assertUnauthorized();
    }

    public function test_ai_ask_requiere_autenticacion(): void
    {
        $this->postJson('/api/ai/ask', ['question' => 'Hola'])
            ->assertUnauthorized();

        $this->postJson('/api/ai/practice', ['lesson_id' => 1])
            ->assertUnauthorized();
    }

    public function test_ai_ask_responde_con_contexto_de_leccion(): void
    {
        Http::fake([
            'openrouter.ai/*' => Http::response([
                'choices' => [['message' => ['content' => '¡Hola! Soy Byte. Claro, te explico el contenido de la lección.']]],
            ]),
        ]);
        config(['ai.provider' => 'openrouter']);

        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = Module::create(['course_id' => $course->id, 'title' => 'Módulo 1', 'order' => 1]);
        $lesson = $this->makeLesson($module, "leccion-ia-{$suffix}", 1);

        Sanctum::actingAs(User::where('email', 'estudiante@sysengacademy.dev')->firstOrFail());

        $response = $this->postJson('/api/ai/ask', [
            'lesson_id' => $lesson->id,
            'kind' => 'explain',
            'question' => 'Explícame esta lección',
        ]);

        $response->assertOk()
            ->assertJsonPath('reply', '¡Hola! Soy Byte. Claro, te explico el contenido de la lección.');

        Http::assertSent(fn ($request) => str_contains($request->url(), 'openrouter.ai')
            && str_contains($request['messages'][0]['content'] ?? '', 'asistente experto'));
    }

    public function test_ai_practice_genera_quiz_json_valido(): void
    {
        $raw = "Aquí tienes tu práctica:\n```json\n"
            . '{"title":"Práctica de variables","questions":['
            . '{"question":"¿Qué es una variable?","type":"single","answers":["Un espacio en memoria","Un bucle","Una función","Un archivo"],"correct_index":0,"explanation":"Una variable guarda un valor."},'
            . '{"question":"¿Cuál es el tipo de 3.14?","type":"single","answers":["int","float","string","bool"],"correct_index":1,"explanation":"3.14 es un decimal, float."}'
            . ']}'
            . "\n```\n";

        Http::fake([
            'openrouter.ai/*' => Http::response([
                'choices' => [['message' => ['content' => $raw]]],
            ]),
        ]);
        config(['ai.provider' => 'openrouter']);

        $suffix = uniqid();
        $course = $this->makeCourse($suffix);
        $module = Module::create(['course_id' => $course->id, 'title' => 'Módulo 1', 'order' => 1]);
        $lesson = $this->makeLesson($module, "leccion-practice-{$suffix}", 1);

        Sanctum::actingAs(User::where('email', 'estudiante@sysengacademy.dev')->firstOrFail());

        $response = $this->postJson('/api/ai/practice', [
            'lesson_id' => $lesson->id,
            'count' => 2,
        ]);

        $response->assertOk()
            ->assertJsonPath('lesson_id', $lesson->id)
            ->assertJsonPath('quiz.title', 'Práctica de variables')
            ->assertJsonCount(2, 'quiz.questions')
            ->assertJsonPath('quiz.questions.0.correct_index', 0)
            ->assertJsonPath('quiz.questions.1.correct_index', 1)
            ->assertJsonPath('quiz.questions.0.explanation', 'Una variable guarda un valor.');
    }
}