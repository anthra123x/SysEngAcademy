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
            $messages[] = ['role' => 'system', 'content' => 'MODO AGENTE: Revisión de código profesional. Evalúa sintaxis, corrección algorítmica, complejidad Big-O y clean code. Si hay errores, diagnostica la causa raíz y muestra la corrección comentada con brevedad didáctica. Responde en español.'];
        } elseif ($kind === 'explain') {
            $messages[] = ['role' => 'system', 'content' => 'MODO AGENTE: Explicación pedagógica y conceptual. Explica con claridad, proporciona un ejemplo mínimo de código ejecutable y finaliza con una pregunta corta para comprobar que se comprendió. Responde en español.'];
        } elseif ($kind === 'hint') {
            $messages[] = ['role' => 'system', 'content' => 'MODO AGENTE: Pista socrática. NO des la solución completa ni el código final. Orienta al estudiante señalando el concepto clave o la condición que debe verificar para que él mismo lo resuelva. Responde en español.'];
        } elseif ($kind === 'roadmap') {
            $messages[] = ['role' => 'system', 'content' => 'MODO AGENTE: Orientación de carrera y rutas en SysEngAcademy. Recomienda el siguiente paso o curso más adecuado y finaliza con una acción interactiva con el formato [ACTION:NAVIGATE:/cursos/slug:Ver Curso] o [ACTION:NAVIGATE:/rutas:Explorar Rutas]. Responde en español.'];
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
     * Evalúa con precisión técnica y criterio académico un reto de código de estudiante.
     * Retorna veredicto, puntaje numérico (0-100), retroalimentación puntual
     * y sugerencias específicas. Nota mínima de aprobación: 90%.
     */
    public function evaluateCodeChallenge(array $challengeContext, string $studentCode): array
    {
        $title = $challengeContext['title'] ?? 'Reto de Programación';
        $lang = $challengeContext['language'] ?? 'código';
        $instructions = $challengeContext['description'] ?? 'Implementa la solución requerida.';
        $tests = json_encode($challengeContext['test_cases'] ?? [], JSON_UNESCAPED_UNICODE);
        $solutionRef = $challengeContext['solution'] ?? null;

        $system = "Eres el Agente Evaluador Senior y Tutor Inteligente de SysEng Academy. "
            . "Tu función es evaluar con precisión técnica y rigor académico las soluciones de código enviadas por los estudiantes. "
            . "Debes responder ÚNICAMENTE con un objeto JSON válido, sin bloques de código markdown externos, sin texto previo ni posterior.";

        $prompt = "EVALUACIÓN DEL RETO DE PROGRAMACIÓN:\n"
            . "- Reto: {$title}\n"
            . "- Lenguaje: {$lang}\n"
            . "- Instrucciones / Requisitos: {$instructions}\n"
            . ($solutionRef ? "- Solución de referencia esperada: {$solutionRef}\n" : "")
            . ($tests !== '[]' && $tests !== 'null' ? "- Casos de prueba previstos: {$tests}\n" : "")
            . "\nCÓDIGO DEL ESTUDIANTE A EVALUAR:\n"
            . "```{$lang}\n{$studentCode}\n```\n\n"
            . "Formato JSON estricto:\n"
            . "{\n"
            . '  "passed": true,' . "\n"
            . '  "score": 95,' . "\n"
            . '  "summary": "Resumen conciso del veredicto en una sola línea",' . "\n"
            . '  "feedback": "Retroalimentación técnica puntual en español. Analiza el código del estudiante con exactitud, explicando aciertos y fallos concretos.",' . "\n"
            . '  "improvements": ["Punto de mejora específico 1", "Punto de mejora específico 2"],' . "\n"
            . '  "key_strengths": ["Buena práctica o acierto 1"]' . "\n"
            . "}\n\n"
            . "CRITERIOS ESTRICTOS:\n"
            . "1. La nota mínima para passed = true es 90. Si el código tiene errores sintácticos, no resuelve el problema o falla casos de borde, califica con menos de 90 y passed = false.\n"
            . "2. Si el código está completo, correcto y resuelve el problema eficientemente, califica entre 90 y 100 y passed = true.\n"
            . "3. Sé MUY PUNTUAL: cita variables, condiciones y lógica concreta del código del estudiante, no des respuestas genéricas.";

        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $prompt],
        ];

        $raw = $this->requestCompletion($messages);
        $data = $this->extractJson($raw);

        if (!$data || !isset($data['score'])) {
            // Heurística de respaldo si el LLM no envió JSON exacto
            $cleanRaw = trim(strip_tags($raw));
            $isPositive = (stripos($cleanRaw, 'aprobado') !== false || stripos($cleanRaw, 'correcto') !== false || stripos($cleanRaw, 'excelente') !== false);
            $score = $isPositive ? 92 : 65;
            $passed = $score >= 90;

            return [
                'passed'        => $passed,
                'score'         => $score,
                'summary'       => $passed ? 'Solución validada y conforme a los requisitos.' : 'La solución requiere ajustes antes de alcanzar la nota mínima del 90%.',
                'feedback'      => $cleanRaw ?: 'Evaluación completada. Revisa los casos de prueba y las condiciones del reto.',
                'improvements'  => $passed ? [] : ['Ajusta la lógica del ejercicio para cumplir con todos los requerimientos.'],
                'key_strengths' => ['Estructura base del código implementada.'],
            ];
        }

        $score = max(0, min(100, (int) $data['score']));
        $passed = $score >= 90;

        return [
            'passed'        => $passed,
            'score'         => $score,
            'summary'       => (string) ($data['summary'] ?? ($passed ? 'Reto superado con excelencia.' : 'Reto pendiente de ajustes.')),
            'feedback'      => (string) ($data['feedback'] ?? ''),
            'improvements'  => (array) ($data['improvements'] ?? []),
            'key_strengths' => (array) ($data['key_strengths'] ?? []),
        ];
    }

    /**
     * Genera retroalimentación puntual sobre los errores cometidos en un quiz.
     */
    public function evaluateQuizMistakes(string $quizTitle, array $wrongQuestions): string
    {
        $system = "Eres el Tutor Pedagógico de SysEng Academy. Tu labor es explicar con claridad y puntualidad los conceptos detrás de las preguntas erradas en un quiz, sin tecnicismos excesivos y orientando al estudiante para que aprenda y logre el 90% en su siguiente intento. Responde en español.";

        $prompt = "El estudiante presentó el quiz '{$quizTitle}' y falló en las siguientes preguntas:\n\n";
        foreach ($wrongQuestions as $idx => $wq) {
            $qText = $wq['question'] ?? 'Pregunta';
            $sel = $wq['selected'] ?? 'Opción incorrecta';
            $corr = $wq['correct'] ?? 'Respuesta correcta';
            $expl = $wq['explanation'] ?? '';
            $prompt .= ($idx + 1) . ". Pregunta: {$qText}\n   - Lo que eligió: {$sel}\n   - Lo correcto: {$corr}\n   - Explicación base: {$expl}\n\n";
        }
        $prompt .= "Dame una retroalimentación puntual (máximo 3 párrafos concisos) explicando los principios conceptuales que debe repasar para tener éxito en su siguiente intento y alcanzar el 90%.";

        $messages = [
            ['role' => 'system', 'content' => $system],
            ['role' => 'user', 'content' => $prompt],
        ];

        return $this->requestCompletion($messages);
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
            'model' => config('ai.model', 'openrouter/free'),
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
            'model' => config('ai.model', 'openrouter/free'),
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