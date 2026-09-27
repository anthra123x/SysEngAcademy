<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\Lesson;
use App\Services\AiService;
use Illuminate\Http\Request;

class AiChatController extends Controller
{
    public function conversations(Request $request)
    {
        $conversations = $request->user()
            ->aiConversations()
            ->latest()
            ->get();

        return response()->json($conversations);
    }

    public function show(Request $request, AiConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        return response()->json($conversation->load('messages'));
    }

    public function store(Request $request)
    {
        $request->validate(['title' => 'nullable|string|max:255']);

        $conversation = $request->user()->aiConversations()->create([
            'title' => $request->title ?? 'Nueva conversación',
        ]);

        return response()->json($conversation, 201);
    }

    public function message(Request $request, AiConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $request->validate(['content' => 'required|string|max:4000']);

        // Guardar mensaje del usuario
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->content,
        ]);

        // Llamar al servicio de IA
        $aiService = app(AiService::class);
        $reply = $aiService->chat($conversation, $request->content);

        // Guardar respuesta del asistente
        $assistantMessage = AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $reply,
        ]);

        // Actualizar título si es el primer mensaje
        if ($conversation->messages()->count() <= 2) {
            $conversation->update([
                'title' => mb_substr($request->content, 0, 60),
            ]);
        }

        return response()->json($assistantMessage);
    }

    /**
     * Variante en streaming (SSE) de message(): el frontend recibe la
     * respuesta token a token en lugar de esperar toda la generación.
     */
    public function streamMessage(Request $request, AiConversation $conversation)
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $request->validate(['content' => 'required|string|max:4000']);

        // Guardar mensaje del usuario
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $request->content,
        ]);

        if ($conversation->messages()->count() <= 2) {
            $conversation->update([
                'title' => mb_substr($request->content, 0, 60),
            ]);
        }

        $aiService = app(AiService::class);

        return response()->stream(function () use ($aiService, $conversation, $request) {
            $full = $aiService->streamChat($conversation, $request->content,
                function (string $delta) {
                    echo 'data: '.json_encode(['delta' => $delta])."\n\n";
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                },
                function (string $errorBody) {
                    echo 'event: error'.PHP_EOL;
                    echo 'data: '.json_encode(['message' => 'El proveedor de IA no respondió. Reintentá en unos segundos.'])."\n\n";
                    flush();
                }
            );

            $assistantMessage = AiMessage::create([
                'conversation_id' => $conversation->id,
                'role' => 'assistant',
                'content' => $full,
            ]);

            echo 'data: '.json_encode(['done' => true, 'message_id' => $assistantMessage->id])."\n\n";
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Pregunta contextual de un solo turno (chat rápido del compañero):
     * opcionalmente recibe lesson_id para inyectar el contexto de la lección
     * y kind para afinar el comportamiento (code_review, explain, question).
     */
    public function ask(Request $request)
    {
        $request->validate([
            'question' => 'required_without:code|string|max:4000',
            'code' => 'nullable|string|max:20000',
            'lesson_id' => 'nullable|integer|exists:lessons,id',
            'kind' => 'nullable|in:question,code_review,explain,practice,hint,roadmap',
        ]);

        $context = [];
        $lesson = null;

        if ($request->filled('lesson_id')) {
            $lesson = Lesson::with('module.course')->find($request->integer('lesson_id'));

            if ($lesson) {
                $context = [
                    'Lección' => $lesson->title,
                    'Curso' => $lesson->module?->course?->title ?? '—',
                    'Contenido de la lección' => $this->lessonExcerpt($lesson),
                ];
            }
        }

        if ($request->filled('code')) {
            $question = "Este es el código que escribí:\n```\n".$request->code."\n```\n\n"
                . ($request->question ?? 'Revísalo y dame feedback para mejorar.');
        } else {
            $question = $request->question;
        }

        $aiService = app(AiService::class);
        $reply = $aiService->contextual($question, $context, $request->kind);

        return response()->json(['reply' => $reply]);
    }

    /**
     * Genera un mini-quiz de práctica personalizado (bajo demanda) para una
     * lección. La IA devuelve JSON validado y normalizado por AiService.
     */
    public function practice(Request $request)
    {
        $request->validate([
            'lesson_id' => 'required|integer|exists:lessons,id',
            'count' => 'nullable|integer|min:1|max:5',
        ]);

        $lesson = Lesson::with('module.course')->findOrFail($request->integer('lesson_id'));

        $aiService = app(AiService::class);
        $quiz = $aiService->practiceQuiz([
            'tema' => $lesson->title,
            'curso' => $lesson->module?->course?->title ?? 'Curso',
        ], $request->integer('count', 3) ?: 3);

        return response()->json(['lesson_id' => $lesson->id, 'quiz' => $quiz]);
    }

    /**
     * Resumen plano del contenido de la lección para el contexto del agente.
     */
    protected function lessonExcerpt(Lesson $lesson): string
    {
        $blocks = $lesson->content['blocks'] ?? [];
        $parts = [];

        foreach ($blocks as $block) {
            if (! empty($block['text'])) {
                $parts[] = $block['text'];
            } elseif (! empty($block['items']) && is_array($block['items'])) {
                $parts[] = implode('; ', $block['items']);
            }
        }

        return mb_substr(implode("\n", $parts), 0, 1500);
    }
}
