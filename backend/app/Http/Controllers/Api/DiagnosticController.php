<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Evalúa las respuestas del test diagnóstico inicial del estudiante usando IA.
 * El agente recibe las respuestas, analiza fortalezas/debilidades y genera
 * una ruta personalizada, nivel y retroalimentación detallada.
 */
class DiagnosticController extends Controller
{
    public function evaluate(Request $request, AiService $ai)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'questions' => 'required|array',
            'student_name' => 'required|string|max:200',
            'student_email' => 'required|string|max:200',
        ]);

        $answers = $validated['answers'];
        $questions = $validated['questions'];
        $studentName = $validated['student_name'];

        // Construir contexto detallado para que la IA evalúe
        $questionsContext = '';
        $totalTechnical = 0;

        foreach ($questions as $q) {
            $qId = $q['id'] ?? '';
            $studentAnswer = $answers[$qId] ?? 'sin_respuesta';
            $correctAnswer = $q['correctAnswer'] ?? null;

            $questionsContext .= "---\n";
            $questionsContext .= "Pregunta [{$qId}]: {$q['title']}\n";
            $questionsContext .= "Categoría: {$q['category']}\n";
            $questionsContext .= "Enunciado: {$q['prompt']}\n";

            if (! empty($q['codeSnippet'])) {
                $questionsContext .= "Código mostrado:\n{$q['codeSnippet']}\n";
            }

            $questionsContext .= "Opciones:\n";
            foreach ($q['options'] as $opt) {
                $questionsContext .= "  [{$opt['id']}] {$opt['label']}\n";
            }

            $questionsContext .= "Respuesta del estudiante: [{$studentAnswer}]\n";

            if ($correctAnswer) {
                $isCorrect = $studentAnswer === $correctAnswer ? 'CORRECTA' : 'INCORRECTA';
                $questionsContext .= "Respuesta correcta: [{$correctAnswer}] — Resultado: {$isCorrect}\n";
                $totalTechnical++;
            } else {
                $questionsContext .= "** Esta pregunta es de preferencia (no tiene respuesta correcta) **\n";
            }
        }

        $systemPrompt = <<<PROMPT
Eres Byte Copilot, el agente evaluador diagnóstico de SysEng Academy (plataforma de formación técnica para ingenieros de software).

Tu tarea: analizar las respuestas del estudiante "{$studentName}" a su evaluación diagnóstica inicial y generar un dictamen personalizado.

INSTRUCCIONES ESTRICTAS:
1. Evalúa cada respuesta técnica individualmente: ¿acertó o falló? ¿Qué demuestra su elección?
2. Identifica fortalezas y debilidades específicas basándote en qué respondió (no solo si acertó).
3. Asigna un nivel de 1 a 4 según rendimiento real.
4. Recomienda una ruta y especialidad basándote en COMBINAR su rendimiento + su preferencia declarada.
5. Si el estudiante falló preguntas, ajusta la ruta para cubrir esas debilidades primero.
6. Genera retroalimentación detallada y personalizada (no genérica).

RESPONDE ÚNICAMENTE con JSON válido (sin markdown, sin bloques de código, sin texto extra):
{
  "score": <número de aciertos técnicos>,
  "totalTechnical": {$totalTechnical},
  "levelNumber": <1|2|3|4>,
  "levelTitle": "<título descriptivo del nivel>",
  "recommendedSpecialty": "<especialidad recomendada>",
  "recommendedPathSlug": "<slug de ruta>",
  "recommendedPathTitle": "<título completo de la ruta>",
  "primaryCourseSlug": "<slug del curso principal>",
  "primaryCourseTitle": "<título del curso principal>",
  "competencyBreakdown": {
    "logic": <0-100>,
    "flow_control": <0-100>,
    "optimization": <0-100>,
    "general": <0-100>
  },
  "syllabus": [
    {
      "phaseNumber": 1,
      "phaseTitle": "<título de fase>",
      "courseTitle": "<curso>",
      "courseSlug": "<slug>",
      "description": "<descripción breve>",
      "estimatedHours": <número>,
      "skillsGained": ["skill1", "skill2", "skill3"]
    }
  ],
  "agentFeedback": "<retroalimentación detallada personalizada del agente, mínimo 3 párrafos, mencionando fortalezas demostradas, áreas a mejorar, y justificación de la ruta asignada>"
}

NIVELES DISPONIBLES:
- Nivel 1: Cadete en Formación (0-1 aciertos) — Necesita fortalecer lógica fundamental
- Nivel 2: Explorador de Sistemas (2 aciertos) — Lógica en desarrollo, estructura intermedia
- Nivel 3: Desarrollador Junior (3 aciertos) — Razonamiento sólido, listo para especialización
- Nivel 4: Ingeniero Promesa (4 aciertos) — Alto rendimiento lógico, ruta avanzada

RUTAS DISPONIBLES (slugs):
- fundamentos-programacion (Lógica & Algoritmos)
- desarrollo-frontend (Frontend & UI)
- desarrollo-backend (Backend & APIs)
- devops (DevOps & Cloud)
- desarrollo-con-ia (IA Aplicada)
- desarrollo-orientado-objetos (POO & SOLID)

CURSOS INICIALES DISPONIBLES (slugs):
- introduccion-programacion
- desarrollo-web-fundamentos
- backend-introduccion
- algoritmos-ordenamiento
- desarrollo-con-ia
- introduccion-poo
- terminal-linux-scripting
- clases-objetos-herencia

Genera exactamente 3 fases en el syllabus, ajustadas al nivel y especialidad del estudiante.
Todo en español.
PROMPT;

        $userMsg = "Evaluación diagnóstica del estudiante {$studentName}:\n\n{$questionsContext}";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $userMsg],
        ];

        try {
            $raw = $this->requestAiCompletion($ai, $messages);
            $result = $this->extractJson($raw);

            if (! $result || ! isset($result['levelNumber'])) {
                // Fallback: evaluación local determinística
                Log::warning('DiagnosticController: IA no devolvió JSON válido, usando fallback local', [
                    'raw' => substr($raw, 0, 500),
                ]);

                return response()->json([
                    'success' => false,
                    'fallback' => true,
                    'message' => 'La IA no pudo generar la evaluación. Usando evaluación local.',
                ]);
            }

            // Validar y normalizar campos obligatorios
            $result['score'] = max(0, min($totalTechnical, (int) ($result['score'] ?? 0)));
            $result['totalTechnical'] = $totalTechnical;
            $result['levelNumber'] = max(1, min(4, (int) ($result['levelNumber'] ?? 1)));
            $result['completedAt'] = now()->toISOString();

            // Asegurar que el competencyBreakdown tenga las claves esperadas por el frontend
            $breakdown = $result['competencyBreakdown'] ?? [];
            $result['competencyBreakdown'] = [
                'logic' => max(0, min(100, (int) ($breakdown['logic'] ?? 50))),
                'oop' => max(0, min(100, (int) ($breakdown['flow_control'] ?? $breakdown['oop'] ?? 50))),
                'database' => max(0, min(100, (int) ($breakdown['optimization'] ?? $breakdown['database'] ?? 50))),
                'architecture' => max(0, min(100, (int) ($breakdown['general'] ?? $breakdown['architecture'] ?? 50))),
            ];

            // Asegurar que el syllabus tenga la estructura correcta
            if (! empty($result['syllabus']) && is_array($result['syllabus'])) {
                $result['syllabus'] = array_map(function ($phase) {
                    return [
                        'phaseNumber' => (int) ($phase['phaseNumber'] ?? 1),
                        'phaseTitle' => (string) ($phase['phaseTitle'] ?? ''),
                        'courseTitle' => (string) ($phase['courseTitle'] ?? ''),
                        'courseSlug' => (string) ($phase['courseSlug'] ?? 'introduccion-programacion'),
                        'description' => (string) ($phase['description'] ?? ''),
                        'estimatedHours' => (int) ($phase['estimatedHours'] ?? 12),
                        'skillsGained' => array_map('strval', (array) ($phase['skillsGained'] ?? [])),
                    ];
                }, array_values($result['syllabus']));
            }

            return response()->json([
                'success' => true,
                'result' => $result,
            ]);
        } catch (\Throwable $e) {
            Log::error('DiagnosticController: Error al evaluar diagnóstico', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'fallback' => true,
                'message' => 'Error de evaluación IA: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Invoca la IA usando el método de completions del AiService.
     * Usa reflexión para acceder al método protegido requestCompletion.
     */
    private function requestAiCompletion(AiService $ai, array $messages): string
    {
        // Usamos el método contextual con un enfoque directo
        $ref = new \ReflectionMethod($ai, 'requestCompletion');
        $ref->setAccessible(true);

        return $ref->invoke($ai, $messages);
    }

    /**
     * Extrae JSON de una respuesta que puede contener texto extra o bloques de código.
     */
    private function extractJson(string $raw): ?array
    {
        // Intentar parsear directamente
        $decoded = json_decode(trim($raw), true);
        if ($decoded !== null) {
            return $decoded;
        }

        // Buscar JSON dentro de bloques de código markdown
        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $raw, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        // Buscar el primer bloque JSON (entre llaves)
        if (preg_match('/\{[\s\S]*\}/', $raw, $matches)) {
            $decoded = json_decode(trim($matches[0]), true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        return null;
    }
}
