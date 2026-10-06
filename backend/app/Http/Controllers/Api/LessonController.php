<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
    public function show(Request $request, string $slug)
    {
        // El contenido base (y el quiz sin respuestas correctas) es común a
        // todos los usuarios: se cachea. Los datos por usuario (completed,
        // prev/next) se calculan fuera del caché.
        $lesson = Cache::remember("api.lesson.v6.{$slug}", now()->addMinutes(10), function () use ($slug) {
            $lesson = Lesson::with(['module.course', 'quiz.questions.answers'])
                ->where('slug', $slug)
                ->firstOrFail()
                ->toArray();

            // Inferir el lenguaje de ejecución del editor según el módulo, problema o código si no está asignado
            if (empty($lesson['language'])) {
                $lesson['language'] = $this->inferLessonLanguage($lesson);
            }

            // Nunca exponer la respuesta correcta: la evaluación es server-side.
            // Mezclamos las respuestas (shuffle) para evitar que la opción correcta siempre sea la primera.
            $questions = $lesson['quiz']['questions'] ?? [];
            foreach ($questions as &$question) {
                $answers = $question['answers'] ?? [];
                shuffle($answers);
                foreach ($answers as &$answer) {
                    unset($answer['is_correct'], $answer['explanation']);
                }
                unset($answer);
                $question['answers'] = $answers;
            }
            unset($question);
            $lesson['quiz']['questions'] = $questions;

            // Nunca exponer la solución de referencia de un ejercicio: el
            // alumno debe resolverlo. Se conserva solo en el seeder.
            unset($lesson['solution']);

            return $lesson;
        });

        // Acceso libre si es preview o si el curso es gratuito, de lo contrario requiere inscripción
        $course = $lesson['module']['course'] ?? null;
        $isFreeCourse = $course && !empty($course['is_free']);

        if (! $lesson['is_preview'] && ! $isFreeCourse) {
            $user = $request->user('jwt') ?: $request->user('sanctum');

            if (! $user) {
                return response()->json(['message' => 'Debes iniciar sesión para acceder a esta lección.'], 403);
            }

            $courseId = $lesson['module']['course_id'];
            $enrolled = $user->enrollments()
                ->where('course_id', $courseId)->exists();

            if (! $enrolled) {
                return response()->json(['message' => 'Debes inscribirte en el curso para acceder a esta lección.'], 403);
            }
        }

        // Datos por usuario
        $user = $request->user('jwt') ?: $request->user('sanctum');
        $lesson['completed'] = $user
            ? LessonProgress::where('user_id', $user->id)
                ->where('lesson_id', $lesson['id'])
                ->whereNotNull('completed_at')
                ->exists()
            : false;

        [$prev, $next] = $this->siblings($lesson);
        $lesson['prev_lesson'] = $prev;
        $lesson['next_lesson'] = $next;

        return response()->json($lesson);
    }

    /**
     * Evalúa un intento de quiz de forma server-side: recibe las respuestas
     * del alumno y devuelve puntaje + feedback por pregunta. Las respuestas
     * correctas nunca viajan al cliente.
     */
    public function attempt(Request $request, string $lesson)
    {
        $lesson = $this->resolveLesson($lesson);
        $this->authorizeAccess($request, $lesson);

        $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'array',
            'answers.*.*' => 'integer',
        ]);

        $quiz = $lesson->quiz;

        if (! $quiz) {
            return response()->json(['message' => 'Esta lección no tiene quiz.'], 422);
        }

        $submitted = $request->input('answers', []);
        $correct = 0;
        $total = $quiz->questions->count();
        $results = [];

        foreach ($quiz->questions as $question) {
            $correctIds = $question->answers
                ->where('is_correct', true)
                ->pluck('id')
                ->map(fn ($id) => (int) $id)
                ->sort()
                ->values()
                ->all();

            $selectedIds = array_map('intval', (array) ($submitted[$question->id] ?? []));
            sort($selectedIds);

            $isCorrect = $correctIds === $selectedIds;
            if ($isCorrect) {
                $correct++;
            }

            $results[] = [
                'question_id' => $question->id,
                'correct' => $isCorrect,
                'correct_answer_ids' => $correctIds,
                'selected_ids' => $selectedIds,
                'explanation' => $question->answers->firstWhere('is_correct', true)?->explanation
                    ?? 'Revisa el contenido de la lección y vuelve a intentarlo.',
            ];
        }

        $score = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

        return response()->json([
            'score' => $score,
            'correct' => $correct,
            'total' => $total,
            'passed' => $score >= 60,
            'results' => $results,
        ]);
    }

    public function complete(Request $request, string $lesson)
    {
        $lesson = $this->resolveLesson($lesson);

        $request->validate(['score' => 'nullable|integer|min:0|max:100']);

        $courseId = $lesson->module->course_id;

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $courseId)
            ->firstOrFail();

        LessonProgress::updateOrCreate(
            ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id],
            ['completed_at' => now(), 'score' => $request->score]
        );

        // Recalcular progreso del curso
        $totalLessons = DB::table('lessons')
            ->join('modules', 'lessons.module_id', '=', 'modules.id')
            ->where('modules.course_id', $courseId)
            ->count();

        $completedLessons = LessonProgress::where('user_id', $request->user()->id)
            ->whereHas('lesson', fn ($q) => $q->whereHas('module', fn ($q2) => $q2->where('course_id', $courseId)))
            ->whereNotNull('completed_at')
            ->count();

        $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

        $enrollment->update([
            'progress_percent' => $progress,
            'completed_at' => $progress >= 100 ? now() : null,
        ]);

        return response()->json(['progress_percent' => $progress, 'message' => 'Lección completada.']);
    }

    /**
     * Acepta tanto el id numérico (compatibilidad con clientes existentes)
     * como el slug de la lección (contrato nuevo del player).
     */
    protected function resolveLesson(string $idOrSlug): Lesson
    {
        $lesson = ctype_digit($idOrSlug)
            ? Lesson::find($idOrSlug)
            : Lesson::where('slug', $idOrSlug)->first();

        if (! $lesson) {
            abort(404, 'Lección no encontrada.');
        }

        return $lesson;
    }

    protected function authorizeAccess(Request $request, Lesson $lesson): void
    {
        if ($lesson->is_preview) {
            return;
        }

        $courseId = $lesson->module->course_id;

        if (! $request->user()->enrollments()->where('course_id', $courseId)->exists()) {
            abort(403, 'Debes inscribirte en el curso para acceder a esta lección.');
        }
    }

    /**
     * Lección anterior/siguiente dentro del curso, ordenadas por módulo y orden.
     */
    protected function siblings(array $lesson): array
    {
        $map = DB::table('lessons')
            ->join('modules', 'lessons.module_id', '=', 'modules.id')
            ->where('modules.course_id', $lesson['module']['course_id'])
            ->orderBy('modules.order')
            ->orderBy('lessons.order')
            ->orderBy('lessons.id')
            ->pluck('lessons.title', 'lessons.slug')
            ->all();

        $slugs = array_keys($map);
        $idx = array_search($lesson['slug'], $slugs, true);

        if ($idx === false) {
            return [null, null];
        }

        $prev = $idx > 0 ? ['slug' => $slugs[$idx - 1], 'title' => $map[$slugs[$idx - 1]]] : null;
        $next = $idx < count($slugs) - 1 ? ['slug' => $slugs[$idx + 1], 'title' => $map[$slugs[$idx + 1]]] : null;

        return [$prev, $next];
    }

    /**
     * Infiere el lenguaje de programación adecuado para el editor interactivo
     * a partir del código inicial, bloques de código, módulo y curso.
     */
    protected function inferLessonLanguage(array $lesson): string
    {
        if (! empty($lesson['language'])) {
            return $lesson['language'];
        }

        // 1. Revisar bloques de código dentro del contenido
        $blocks = $lesson['content']['blocks'] ?? [];
        foreach ($blocks as $block) {
            $lang = strtolower(trim($block['language'] ?? ''));
            if (($block['type'] ?? '') === 'code' && ! empty($lang) && $lang !== 'text') {
                return $lang === 'c++' ? 'cpp' : $lang;
            }
        }

        // 2. Revisar código inicial o fragmento
        $starter = $lesson['starter_code'] ?? '';
        if (str_contains($starter, 'Algoritmo') || str_contains($starter, 'FinAlgoritmo') || str_contains($starter, '<-')) {
            return 'pseint';
        }
        if (str_contains($starter, '#include') || str_contains($starter, 'std::') || str_contains($starter, 'cout <<')) {
            return 'cpp';
        }
        if (preg_match('/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i', $starter)) {
            return 'sql';
        }
        if (str_contains($starter, '<?php') || str_contains($starter, 'Route::')) {
            return 'php';
        }

        // 3. Revisar título/slug del curso y del módulo
        $courseSlug  = strtolower($lesson['module']['course']['slug'] ?? '');
        $courseTitle = strtolower($lesson['module']['course']['title'] ?? '');
        $moduleTitle = strtolower($lesson['module']['title'] ?? '');
        $combined    = "{$courseSlug} {$courseTitle} {$moduleTitle}";

        if (str_contains($combined, 'pseint') || str_contains($combined, 'pseudocodigo') || str_contains($combined, 'pseudocódigo')) {
            return 'pseint';
        }
        if (str_contains($combined, 'c++') || str_contains($combined, 'cpp')) {
            return 'cpp';
        }
        if (str_contains($combined, 'sql') || str_contains($combined, 'postgres') || str_contains($combined, 'base-de-datos') || str_contains($combined, 'bases de datos')) {
            return 'sql';
        }
        if (str_contains($combined, 'php') || str_contains($combined, 'laravel') || str_contains($combined, 'backend')) {
            return 'php';
        }
        if (str_contains($combined, 'java') && ! str_contains($combined, 'javascript')) {
            return 'java';
        }
        if (str_contains($combined, 'typescript') || str_contains($combined, 'angular')) {
            return 'typescript';
        }
        if (str_contains($combined, 'javascript') || str_contains($combined, 'frontend') || str_contains($combined, 'web')) {
            return 'javascript';
        }

        return 'python';
    }
}