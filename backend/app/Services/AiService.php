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
        return match ($this->provider) {
            'openai' => $this->chatWithOpenAI($conversation, $userMessage),
            'openrouter' => $this->chatWithOpenRouter($conversation, $userMessage),
            'gemini' => $this->chatWithGemini($conversation, $userMessage),
            'anthropic' => $this->chatWithAnthropic($conversation, $userMessage),
            default => $this->placeholder(),
        };
    }

    protected function placeholder(): string
    {
        return '🤖 El agente de IA está siendo configurado. Próximamente podrás hacerme preguntas sobre programación, algoritmos, estructuras de datos y más. ¡Pronto estaré disponible!';
    }

    protected function chatWithOpenAI(AiConversation $conversation, string $userMessage): string
    {
        $messages = $this->buildMessageHistory($conversation, $userMessage);

        $response = Http::withToken(config('ai.api_key'))
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('ai.model', 'gpt-4o-mini'),
                'messages' => $messages,
            ]);

        return $response->json('choices.0.message.content', $this->placeholder());
    }

    protected function chatWithOpenRouter(AiConversation $conversation, string $userMessage): string
    {
        $messages = $this->buildMessageHistory($conversation, $userMessage);

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

    protected function chatWithGemini(AiConversation $conversation, string $userMessage): string
    {
        $messages = $this->buildMessageHistory($conversation, $userMessage);
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

    protected function chatWithAnthropic(AiConversation $conversation, string $userMessage): string
    {
        $messages = $this->buildMessageHistory($conversation, $userMessage);
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

    protected function buildMessageHistory(AiConversation $conversation, string $newMessage): array
    {
        $systemPrompt = config('ai.system_prompt',
            'Eres un asistente experto en programación para estudiantes de Ingeniería de Sistemas. Responde siempre en español.'
        );

        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        // Últimos 10 mensajes para contexto
        foreach ($conversation->messages()->latest()->take(10)->get()->reverse() as $msg) {
            $messages[] = ['role' => $msg->role, 'content' => $msg->content];
        }

        $messages[] = ['role' => 'user', 'content' => $newMessage];

        return $messages;
    }
}
