<?php

namespace App\Services;

use App\Models\AiConversation;
use Illuminate\Support\Facades\Http;

class AiService
{
    protected string $provider;

    public function __construct()
    {
        $this->provider = config('ai.provider') ?: 'placeholder';
    }

    public function chat(AiConversation $conversation, string $userMessage): string
    {
        return $this->requestCompletion($this->buildMessageHistory($conversation, $userMessage));
    }

    /**
     * Respuesta contextual de un solo turno: inyecta el contexto actual del
     * estudiante (lección/curso) y un "modo" opcional (revisión de código,
     * explicación, pregunta general). No persiste mensajes; es el chat rápido
     * del compañero dentro de la página.
     */
    public function contextual(string $userMessage, array $context = [], ?string $kind = null): string
    {
        $messages = [$this->systemMessage()];

        if ($context !== []) {
            $ctx = "Contexto actual del estudiante:\n";
            foreach ($context as $label => $value) {
                $ctx .= "- {$label}: {$value}\n";
            }
            $messages[] = ['role' => 'system', 'content' => trim($ctx)];
        }

        if ($kind === 'code_review') {
            $messages[] = ['role' => 'system', 'content' => 'El estudiante te envía código para revisar. Señala errores y aciertos, sugiere mejoras concretas y termina con un consejo breve. Sé alentador y responde en español.'];
        } elseif ($kind === 'explain') {
            $messages[] = ['role' => 'system', 'content' => 'Explica el concepto de forma clara, con un ejemplo breve de código si aplica, y termina con una pregunta corta para comprobar que se entendió. Responde en español.'];
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $this->requestCompletion($messages);
    }

    /**
     * Genera un mini-quiz de práctica personalizado (bajo demanda) para la
     * lección actual. La IA devuelve JSON; aquí se valida y normaliza para
     * que el frontend pueda renderizarlo sin sorpresas.
     */
    public function practiceQuiz(array $context, int $count = 3): array
    {
        $system = 'Eres un docente de programación que genera ejercicios de práctica. Responde ÚNICAMENTE con JSON válido, sin texto adicional, sin bloques de código ni markdown.';
        $user = "Genera un mini-quiz de práctica para el tema:\n"
            . ($context['tema'] ?? 'programación') . "\n\n"
            . "Formato JSON exacto (sin nada más):\n"
            . '{"title":"Título","questions":[{"question":"Pregunta","type":"single","answers":["opción A","opción B","opción C","opción D"],"correct_index":0,"explanation":"Explicación breve"}]}' . "\n\n"
            . "Reglas:\n"
            . "- {$count} preguntas.\n"
            . "- Cada pregunta con 4 respuestas.\n"
            . "- correct_index apunta a la posición de la respuesta correcta.\n"
            . "- explanation didáctica de 1-2 frases.\n"
            . "- Todo en español.";

        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $user],
        ];

        $raw = $this->requestCompletion($messages);
        $data = $this->extractJson($raw);

        if ($data === null) {
            return ['title' => 'Práctica', 'questions' => [], 'raw' => $raw];
        }

        $questions = [];
        foreach (($data['questions'] ?? []) as $q) {
            if (! is_array($q) || empty($q['question']) || ! is_array($q['answers'] ?? null) || count($q['answers']) < 2) {
                continue;
            }

            $answers = array_values(array_map('strval', $q['answers']));
            $idx = (int) ($q['correct_index'] ?? 0);
            if ($idx < 0 || $idx >= count($answers)) {
                $idx = 0;
            }

            $questions[] = [
                'question' => (string) $q['question'],
                'type' => 'single',
                'answers' => $answers,
                'correct_index' => $idx,
                'explanation' => (string) ($q['explanation'] ?? ''),
            ];

            if (count($questions) >= $count) {
                break;
            }
        }

        return [
            'title' => (string) ($data['title'] ?? 'Práctica generada'),
            'questions' => $questions,
        ];
    }

    /**
     * Variante en streaming (SSE) del chat con OpenRouter.
     *
     * Lee los eventos del proveedor y llama a $onDelta por cada fragmento
     * de texto; devuelve el texto completo acumulado (o el placeholder si
     * el proveedor falló y $onError fue invocado).
     */
    public function streamChat(AiConversation $conversation, string $userMessage, callable $onDelta, callable $onError): string
    {
        $messages = $this->buildMessageHistory($conversation, $userMessage);

        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('ai.api_key'),
            'X-Title' => 'SysEng Academy',
            'HTTP-Referer' => config('app.url', 'http://localhost:4200'),
        ])->withOptions(['stream' => true, 'timeout' => 300])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => config('ai.model', 'openai/gpt-4o-mini'),
            'messages' => $messages,
            'stream' => true,
        ]);

        if ($response->failed()) {
            $onError($response->body());

            return $this->placeholder();
        }

        $stream = $response->toPsrResponse()->getBody()->detach();
        $full = '';

        if (is_resource($stream)) {
            while (! feof($stream)) {
                $line = fgets($stream);

                if ($line === false) {
                    break;
                }

                $line = trim($line);

                if (! str_starts_with($line, 'data:')) {
                    continue;
                }

                $data = trim(substr($line, 5));

                if ($data === '[DONE]') {
                    break;
                }

                $json = json_decode($data, true);
                $delta = $json['choices'][0]['delta']['content'] ?? null;

                if ($delta !== null && $delta !== '') {
                    $full .= $delta;
                    $onDelta($delta);
                }
            }

            fclose($stream);
        }

        return $full !== '' ? $full : $this->placeholder();
    }

    /**
     * Ejecuta la petición de completado contra el proveedor configurado
     * (único punto de salida HTTP para respuestas no-streaming).
     */
    protected function requestCompletion(array $messages): string
    {
        return match ($this->provider) {
            'openai' => $this->completeWithOpenAI($messages),
            'openrouter' => $this->completeWithOpenRouter($messages),
            'gemini' => $this->completeWithGemini($messages),
            'anthropic' => $this->completeWithAnthropic($messages),
            default => $this->placeholder(),
        };
    }

    protected function completeWithOpenAI(array $messages): string
    {
        $response = Http::withToken(config('ai.api_key'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('ai.model', 'gpt-4o-mini'),
                'messages' => $messages,
            ]);

        return $response->json('choices.0.message.content', $this->placeholder());
    }

    protected function completeWithOpenRouter(array $messages): string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer '.config('ai.api_key'),
            'X-Title' => 'SysEng Academy',
            'HTTP-Referer' => config('app.url', 'http://localhost:4200'),
        ])->post('https://openrouter.ai/api/v1/chat/completions', [
            'model' => config('ai.model', 'openai/gpt-4o-mini'),
            'messages' => $messages,
        ]);

        return $response->json('choices.0.message.content', $this->placeholder());
    }

    protected function completeWithGemini(array $messages): string
    {
        $model = config('ai.model', 'gemini-2.0-flash');
        $apiKey = config('ai.api_key');

        $contents = collect($messages)->filter(fn ($m) => $m['role'] !== 'system')->map(fn ($m) => [
            'role' => $m['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $m['content']]],
        ])->values()->toArray();

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}",
            ['contents' => $contents]
        );

        return $response->json('candidates.0.content.parts.0.text', $this->placeholder());
    }

    protected function completeWithAnthropic(array $messages): string
    {
        $system = collect($messages)->firstWhere('role', 'system')['content'] ?? '';
        $msgs = collect($messages)->filter(fn ($m) => $m['role'] !== 'system')->values()->toArray();

        $response = Http::withHeaders([
            'x-api-key' => config('ai.api_key'),
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => config('ai.model', 'claude-3-5-haiku-latest'),
            'max_tokens' => 1024,
            'system' => $system,
            'messages' => $msgs,
        ]);

        return $response->json('content.0.text', $this->placeholder());
    }

    protected function systemMessage(): array
    {
        return [
            'role' => 'system',
            'content' => config('ai.system_prompt',
                'Eres un asistente experto en programación para estudiantes de Ingeniería de Sistemas. Responde siempre en español.'
            ),
        ];
    }

    protected function buildMessageHistory(AiConversation $conversation, string $newMessage): array
    {
        $messages = [$this->systemMessage()];

        // Últimos 10 mensajes para contexto
        foreach ($conversation->messages()->latest()->take(10)->get()->reverse() as $msg) {
            $messages[] = ['role' => $msg->role, 'content' => $msg->content];
        }

        $messages[] = ['role' => 'user', 'content' => $newMessage];

        return $messages;
    }

    /**
     * Extrae el primer objeto JSON que encuentre en la respuesta (tolera
     * que el modelo envuelva el JSON en bloques ```json o con texto extra).
     */
    protected function extractJson(string $raw): ?array
    {
        $text = trim($raw);

        if (preg_match('/```(?:json)?\s*(.*?)```/s', $text, $m)) {
            $text = trim($m[1]);
        }

        $start = strpos($text, '{');
        $end = strrpos($text, '}');

        if ($start !== false && $end !== false && $end > $start) {
            $text = substr($text, $start, $end - $start + 1);
        }

        $decoded = json_decode($text, true);

        return is_array($decoded) ? $decoded : null;
    }

    protected function placeholder(): string
    {
        return '🤖 El agente de IA está siendo configurado. Próximamente podrás hacerme preguntas sobre programación, algoritmos, estructuras de datos y más. ¡Pronto estaré disponible!';
    }
}