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
        // El contenido base es común y se cachea. Los quizzes se aleatorizan
        // por cuenta y los datos de progreso se calculan en vivo fuera de la caché.
        $lesson = Cache::remember("api.lesson.v8.{$slug}", now()->addMinutes(10), function () use ($slug) {
            $lesson = Lesson::with(['module.course', 'quiz.questions.answers'])
                ->where('slug', $slug)
                ->firstOrFail()
                ->toArray();

            // Inferir el lenguaje de ejecución del editor según el módulo, problema o código si no está asignado
            if (empty($lesson['language'])) {
                $lesson['language'] = $this->inferLessonLanguage($lesson);
            }

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

        // Aleatorización de preguntas y opciones por cuenta de usuario
        if (!empty($lesson['quiz']['questions'])) {
            $lesson['quiz']['questions'] = $this->randomizeQuizForUser(
                $lesson['quiz']['questions'],
                $user ? (int) $user->id : null,
                (int) ($lesson['quiz']['id'] ?? $lesson['id'])
            );
        }

        [$prev, $next] = $this->siblings($lesson);
        $lesson['prev_lesson'] = $prev;
        $lesson['next_lesson'] = $next;

        return response()->json($lesson);
    }

    /**
     * Aleatoriza determinísticamente el orden de preguntas y opciones
     * según el ID de cuenta del usuario, garantizando variabilidad entre estudiantes.
     */
    protected function randomizeQuizForUser(array $questions, ?int $userId, int $quizId): array
    {
        $seed = $userId
            ? crc32("account:{$userId}:quiz:{$quizId}")
            : crc32(request()->ip() . ":quiz:{$quizId}");

        // 1. Barajar preguntas según la cuenta
        $questions = $this->seededShuffle($questions, $seed);

        // 2. Barajar opciones de cada pregunta eliminando respuestas correctas
        foreach ($questions as $qIndex => &$question) {
            $answers = $question['answers'] ?? [];
            $qSeed = crc32("{$seed}:q:{$question['id']}:{$qIndex}");
            $shuffledAnswers = $this->seededShuffle($answers, $qSeed);

            foreach ($shuffledAnswers as &$ans) {
                unset($ans['is_correct'], $ans['explanation']);
            }
            unset($ans);

            $question['answers'] = $shuffledAnswers;
        }
        unset($question);

        return $questions;
    }

    /**
     * Fisher-Yates shuffle determinista basado en generador LCG
     * sin alterar el estado global de números aleatorios de PHP.
     */
    protected function seededShuffle(array $items, int $seed): array
    {
        $count = count($items);
        if ($count <= 1) {
            return $items;
        }

        $state = $seed;
        for ($i = $count - 1; $i > 0; $i--) {
            $state = ($state * 1103515245 + 12345) & 0x7fffffff;
            $j = $state % ($i + 1);
            $temp = $items[$i];
            $items[$i] = $items[$j];
            $items[$j] = $temp;
        }

        return array_values($items);
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
            $correctAnswers = $question->answers->where('is_correct', true);
            $correctIds = $correctAnswers
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

            // Explicación puntual y contextual
            $explanation = '';
            if ($isCorrect) {
                $explanation = $correctAnswers->first()?->explanation
                    ?? '¡Correcto! Excelente comprensión del concepto.';
            } else {
                if (empty($selectedIds)) {
                    $explanation = 'No seleccionaste ninguna opción para esta pregunta.';
                } else {
                    $selectedAnswers = $question->answers->whereIn('id', $selectedIds);
                    $selectedExplanations = $selectedAnswers
                        ->pluck('explanation')
                        ->filter()
                        ->values()
                        ->all();

                    if (!empty($selectedExplanations)) {
                        $explanation = implode(' ', $selectedExplanations);
                    } else {
                        $correctExpl = $correctAnswers->first()?->explanation;
                        $explanation = $correctExpl
                            ? "Tu selección no es la adecuada. Ten en cuenta: {$correctExpl}"
                            : 'Opción incorrecta. Revisa el contenido de la lección y vuelve a intentarlo.';
                    }
                }
            }

            $results[] = [
                'question_id' => $question->id,
                'correct' => $isCorrect,
                'correct_answer_ids' => $correctIds,
                'selected_ids' => $selectedIds,
                'explanation' => $explanation,
            ];
        }

        $score = $total > 0 ? (int) round(($correct / $total) * 100) : 0;
        $passed = $score >= 60;

        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
        $courseProgress = null;

        if ($user) {
            $courseId = $lesson->module->course_id;

            // Asegurar enrollment automático si el usuario empieza a estudiar
            $enrollment = Enrollment::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $courseId],
                ['enrolled_at' => now(), 'progress_percent' => 0]
            );

            $existing = LessonProgress::where('user_id', $user->id)->where('lesson_id', $lesson->id)->first();

            if ($passed) {
                LessonProgress::updateOrCreate(
                    ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                    [
                        'score' => max($score, (int) ($existing?->score ?? 0)),
                        'completed_at' => $existing?->completed_at ?? now(),
                    ]
                );
            } else {
                if (!$existing || $score > ($existing->score ?? 0)) {
                    LessonProgress::updateOrCreate(
                        ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                        ['score' => $score]
                    );
                }
            }

            $courseProgress = $this->recalculateCourseProgress($user->id, $courseId, $enrollment);
        }

        $isCompleted = (bool) (
            $passed ||
            ($user && LessonProgress::where('user_id', $user->id)->where('lesson_id', $lesson->id)->whereNotNull('completed_at')->exists())
        );

        return response()->json([
            'score' => $score,
            'correct' => $correct,
            'total' => $total,
            'passed' => $passed,
            'completed' => $isCompleted,
            'course_progress_percent' => $courseProgress,
            'results' => $results,
        ]);
    }

    public function complete(Request $request, string $lesson)
    {
        $lesson = $this->resolveLesson($lesson);

        $request->validate(['score' => 'nullable|integer|min:0|max:100']);

        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
        if (!$user) {
            return response()->json(['message' => 'Debes iniciar sesión para registrar tu progreso.'], 401);
        }

        $courseId = $lesson->module->course_id;

        $enrollment = Enrollment::firstOrCreate(
            ['user_id' => $user->id, 'course_id' => $courseId],
            ['enrolled_at' => now(), 'progress_percent' => 0]
        );

        $existing = LessonProgress::where('user_id', $user->id)->where('lesson_id', $lesson->id)->first();
        $submittedScore = $request->score !== null ? (int) $request->score : null;
        $finalScore = $submittedScore !== null
            ? max($submittedScore, (int) ($existing?->score ?? 0))
            : ($existing?->score ?? 100);

        LessonProgress::updateOrCreate(
            ['user_id' => $user->id, 'lesson_id' => $lesson->id],
            [
                'completed_at' => $existing?->completed_at ?? now(),
                'score' => $finalScore,
            ]
        );

        $progress = $this->recalculateCourseProgress($user->id, $courseId, $enrollment);

        return response()->json([
            'progress_percent' => $progress,
            'completed' => true,
            'message' => 'Lección completada con éxito.',
        ]);
    }

    public function syncGuestProgress(Request $request)
    {
        $request->validate([
            'lesson_ids' => 'nullable|array',
            'lesson_ids.*' => 'integer',
            'lesson_slugs' => 'nullable|array',
            'lesson_slugs.*' => 'string',
        ]);

        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();
        if (!$user) {
            return response()->json(['message' => 'No autorizado.'], 401);
        }

        $lessonIds = collect($request->input('lesson_ids', []));
        $lessonSlugs = $request->input('lesson_slugs', []);

        if (!empty($lessonSlugs)) {
            $slugIds = Lesson::whereIn('slug', $lessonSlugs)->pluck('id');
            $lessonIds = $lessonIds->merge($slugIds)->unique();
        }

        if ($lessonIds->isEmpty()) {
            return response()->json(['synced' => 0, 'message' => 'No hay lecciones para sincronizar.']);
        }

        $lessons = Lesson::with('module')->whereIn('id', $lessonIds)->get();
        $syncedCount = 0;
        $affectedCourseIds = [];

        foreach ($lessons as $lesson) {
            if (!$lesson->module || !$lesson->module->course_id) {
                continue;
            }

            $courseId = $lesson->module->course_id;
            $affectedCourseIds[$courseId] = true;

            $enrollment = Enrollment::firstOrCreate(
                ['user_id' => $user->id, 'course_id' => $courseId],
                ['enrolled_at' => now(), 'progress_percent' => 0]
            );

            $existing = LessonProgress::where('user_id', $user->id)->where('lesson_id', $lesson->id)->first();
            LessonProgress::updateOrCreate(
                ['user_id' => $user->id, 'lesson_id' => $lesson->id],
                [
                    'completed_at' => $existing?->completed_at ?? now(),
                    'score' => max(100, (int) ($existing?->score ?? 0)),
                ]
            );
            $syncedCount++;
        }

        foreach (array_keys($affectedCourseIds) as $cId) {
            $enr = Enrollment::where('user_id', $user->id)->where('course_id', $cId)->first();
            if ($enr) {
                $this->recalculateCourseProgress($user->id, $cId, $enr);
            }
        }

        return response()->json([
            'synced' => $syncedCount,
            'message' => "Progreso sincronizado exitosamente ({$syncedCount} lecciones).",
        ]);
    }

    protected function recalculateCourseProgress(int $userId, int $courseId, Enrollment $enrollment): int
    {
        $totalLessons = DB::table('lessons')
            ->join('modules', 'lessons.module_id', '=', 'modules.id')
            ->where('modules.course_id', $courseId)
            ->count();

        $completedLessons = LessonProgress::where('user_id', $userId)
            ->whereHas('lesson', fn ($q) => $q->whereHas('module', fn ($q2) => $q2->where('course_id', $courseId)))
            ->whereNotNull('completed_at')
            ->count();

        $progress = $totalLessons > 0 ? (int) round(($completedLessons / $totalLessons) * 100) : 0;

        $enrollment->update([
            'progress_percent' => $progress,
            'completed_at' => $progress >= 100 ? ($enrollment->completed_at ?? now()) : null,
        ]);

        return $progress;
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