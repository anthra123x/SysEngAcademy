<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class DiagnosticService
{
    public function __construct(
        protected AiService $aiService,
        protected DiagnosticCatalogService $catalogService
    ) {}

    /**
     * Procesa y evalúa las respuestas de la prueba diagnóstica.
     */
    public function evaluate(User $user, array $answers, array $questions, string $studentName): array
    {
        $score = 0;
        $totalTechnical = 0;
        $evalDetails = [];

        foreach ($questions as $q) {
            $qId = $q['id'] ?? '';
            $cat = $q['category'] ?? 'logic';
            $ans = $answers[$qId] ?? null;
            $correct = $q['correctAnswer'] ?? null;

            if ($correct !== null) {
                $totalTechnical++;
                $isOk = ($ans === $correct);
                if ($isOk) {
                    $score++;
                }
                $evalDetails[$qId] = [
                    'category' => $cat,
                    'title' => $q['title'] ?? $qId,
                    'answered' => $ans,
                    'correct' => $correct,
                    'is_correct' => $isOk,
                ];
            } else {
                $evalDetails[$qId] = [
                    'category' => $cat,
                    'title' => $q['title'] ?? $qId,
                    'answered' => $ans,
                    'is_preference' => true,
                ];
            }
        }

        $specialtyPref = $answers['q_specialty'] ?? $answers['q5'] ?? 'backend';
        $backgroundExp = $answers['q_background'] ?? 'exp_basics';

        // 1. Cálculo determinístico de alta precisión
        $deterministicResult = $this->computeDeterministicDiagnostic(
            $score,
            $totalTechnical,
            $evalDetails,
            $specialtyPref,
            $backgroundExp,
            $studentName
        );

        // 2. Refinamiento pedagógico con IA
        $aiResult = null;
        try {
            $systemPrompt = $this->buildAgentSystemPrompt($studentName, $totalTechnical);
            $userMsg = $this->buildEvaluationUserMessage($studentName, $evalDetails, $specialtyPref, $backgroundExp);

            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMsg],
            ];

            $raw = $this->aiService->generateRawCompletion($messages);
            $parsed = $this->extractJson($raw);

            if ($parsed && isset($parsed['levelNumber']) && !empty($parsed['syllabus'])) {
                $aiResult = $this->sanitizeAiResult($parsed, $deterministicResult, $totalTechnical);
            }
        } catch (\Throwable $e) {
            Log::warning('DiagnosticService: Fallback a motor determinístico debido a error de IA', [
                'error' => $e->getMessage(),
            ]);
        }

        $finalResult = $aiResult ?: $deterministicResult;

        // 3. Persistir dictamen en el expediente del estudiante
        $user->diagnostic_result = $finalResult;
        $user->specialization = $finalResult['recommendedSpecialty'];
        $user->save();

        return $finalResult;
    }

    /**
     * Motor determinístico crítico que garantiza un nivel y ruta 100% realistas.
     */
    public function computeDeterministicDiagnostic(
        int $score,
        int $totalTechnical,
        array $evalDetails,
        string $specialtyPref,
        string $backgroundExp,
        string $studentName
    ): array {
        $logicOk = ($evalDetails['q_logic']['is_correct'] ?? false);
        $optOk = ($evalDetails['q_optimization']['is_correct'] ?? false);
        $oopOk = ($evalDetails['q_oop']['is_correct'] ?? false);
        $dbOk = ($evalDetails['q_database']['is_correct'] ?? false);
        $archOk = ($evalDetails['q_architecture']['is_correct'] ?? false);

        if (!isset($evalDetails['q_logic'])) {
            $logicOk = ($evalDetails['q1']['is_correct'] ?? false) && ($evalDetails['q2']['is_correct'] ?? false);
            $optOk = ($evalDetails['q4']['is_correct'] ?? false);
            $oopOk = ($evalDetails['q3']['is_correct'] ?? false);
            $dbOk = $score >= 3;
            $archOk = $score >= 4;
        }

        $logicScore = ($logicOk ? 50 : 15) + ($optOk ? 50 : 15);
        $oopScore = $oopOk ? 95 : 25;
        $dbScore = $dbOk ? 95 : 20;
        $archScore = $archOk ? 95 : 20;

        $levelNumber = 1;
        $levelTitle = 'Nivel 1: Cadete en Formación · Fundamentos & Pensamiento Computacional';

        if ($score >= 5 && in_array($backgroundExp, ['exp_academic', 'exp_practicing'])) {
            $levelNumber = 4;
            $levelTitle = 'Nivel 4: Desarrollador Junior Avanzado · Pensamiento Sistémico & Arquitectura';
        } elseif ($score >= 4) {
            $levelNumber = 3;
            $levelTitle = 'Nivel 3: Desarrollador Junior · Autonomía Técnica & Construcción de Módulos';
        } elseif ($score >= 2 && $backgroundExp !== 'exp_zero') {
            $levelNumber = 2;
            $levelTitle = 'Nivel 2: Desarrollador Trainee · Lógica Estructurada & Bases Consolidadas';
        } else {
            $levelNumber = 1;
            $levelTitle = 'Nivel 1: Cadete en Formación · Fundamentos & Pensamiento Computacional';
        }

        $normPref = strtolower(trim((string) $specialtyPref));
        if (str_contains($normPref, 'front')) {
            $pathKey = 'desarrollo-frontend';
        } elseif (str_contains($normPref, 'full')) {
            $pathKey = 'desarrollo-fullstack';
        } elseif (str_contains($normPref, 'poo') || str_contains($normPref, 'objeto')) {
            $pathKey = 'desarrollo-orientado-objetos';
        } elseif (str_contains($normPref, 'devop') || str_contains($normPref, 'cloud')) {
            $pathKey = 'devops';
        } elseif (str_contains($normPref, 'ia') || str_contains($normPref, 'intel')) {
            $pathKey = 'desarrollo-con-ia';
        } elseif (str_contains($normPref, 'git') || str_contains($normPref, 'version')) {
            $pathKey = 'git-y-control-versiones';
        } elseif (str_contains($normPref, 'requer') || str_contains($normPref, 'analis') || str_contains($normPref, 'srs')) {
            $pathKey = 'ingenieria-de-requerimientos';
        } elseif (str_contains($normPref, 'algo') || str_contains($normPref, 'ciencia') || str_contains($normPref, 'fundam')) {
            $pathKey = 'fundamentos-programacion';
        } else {
            $pathKey = 'desarrollo-backend';
        }

        $paths = $this->catalogService->getCatalogPaths();
        $courseMeta = $this->catalogService->getCourseMeta();

        $pathDef = $paths[$pathKey] ?? $paths['desarrollo-backend'];
        $courseSlugs = $pathDef['levels'][$levelNumber] ?? $pathDef['levels'][1];

        $syllabus = [];
        foreach ($courseSlugs as $idx => $cSlug) {
            $meta = $courseMeta[$cSlug] ?? [
                'title' => ucwords(str_replace('-', ' ', $cSlug)),
                'desc' => 'Módulo formativo estructurado.',
                'hours' => 15,
                'skills' => ['Ingeniería de Software'],
            ];

            $phaseNum = $idx + 1;
            $syllabus[] = [
                'phaseNumber' => $phaseNum,
                'phaseTitle' => "Fase 0{$phaseNum}: {$meta['title']}",
                'courseTitle' => $meta['title'],
                'courseSlug' => $cSlug,
                'description' => $meta['desc'],
                'estimatedHours' => $meta['hours'],
                'skillsGained' => $meta['skills'],
            ];
        }

        $primaryCourseSlug = $syllabus[0]['courseSlug'];
        $primaryCourseTitle = $syllabus[0]['courseTitle'];

        $feedback = $this->generatePedagogicalFeedback(
            $studentName,
            $levelNumber,
            $score,
            $totalTechnical,
            $pathDef['title'],
            $primaryCourseTitle,
            $logicOk,
            $oopOk,
            $dbOk,
            $archOk,
            $backgroundExp
        );

        return [
            'score' => $score,
            'totalTechnical' => $totalTechnical,
            'levelNumber' => $levelNumber,
            'levelTitle' => $levelTitle,
            'recommendedSpecialty' => $pathDef['specialty'],
            'recommendedPathSlug' => $pathDef['slug'],
            'recommendedPathTitle' => $pathDef['title'],
            'primaryCourseSlug' => $primaryCourseSlug,
            'primaryCourseTitle' => $primaryCourseTitle,
            'competencyBreakdown' => [
                'logic' => min(100, $logicScore),
                'oop' => min(100, $oopScore),
                'database' => min(100, $dbScore),
                'architecture' => min(100, $archScore),
            ],
            'syllabus' => $syllabus,
            'agentFeedback' => $feedback,
            'completedAt' => now()->toISOString(),
        ];
    }

    /**
     * Genera un dictamen pedagógico realista y crítico con fundamentación técnica en 3 párrafos.
     */
    public function generatePedagogicalFeedback(
        string $name,
        int $level,
        int $score,
        int $total,
        string $pathTitle,
        string $firstCourseTitle,
        bool $logicOk,
        bool $oopOk,
        bool $dbOk,
        bool $archOk,
        string $exp
    ): string {
        $p1 = "Hola, {$name}. Tras analizar con detenimiento tu prueba diagnóstica de razonamiento técnico y punto de partida, he calibrado tu estado formativo actual en **Nivel 0{$level}** ({$score} de {$total} aciertos técnicos validados). Mi evaluación como tutor de ingeniería es estrictamente realista: no buscamos adular ni inflar rangos ficticios, sino situarte exactamente donde cada hora de estudio maximice tu comprensión y evite la deserción por vacíos conceptuales.";

        $strengths = [];
        $gaps = [];

        if ($logicOk) {
            $strengths[] = 'trazabilidad algorítmica y control de flujo condicional';
        } else {
            $gaps[] = 'seguimiento mental de variables de estado y bucles acumuladores';
        }

        if ($oopOk) {
            $strengths[] = 'diferenciación de identidades y mutación de referencias en memoria';
        } else {
            $gaps[] = 'comprensión del paso por referencia y encapsulamiento en objetos';
        }

        if ($dbOk) {
            $strengths[] = 'relaciones y consultas relacionales SQL con agregaciones';
        } else {
            $gaps[] = 'modelado relacional e integridad referencial en persistencia';
        }

        if ($archOk) {
            $strengths[] = 'estándares semánticos del protocolo HTTP y diseño REST';
        } else {
            $gaps[] = 'códigos de estado y métodos semánticos en el ciclo de vida web';
        }

        $strText = !empty($strengths)
            ? 'Has demostrado destreza concreta en ' . implode(', ', $strengths) . '.'
            : 'Tu evaluación refleja que estás en una etapa formativa inicial donde aún debes adquirir las herramientas básicas de deducción algorítmica.';

        $gapText = !empty($gaps)
            ? ' No obstante, he detectado brechas prioritarias en ' . implode(', además de ', $gaps) . ', áreas indispensables para construir software profesional robusto.'
            : ' Has evidenciado una base sólida y equilibrada en los cuatro pilares fundamentales examinados.';

        $p2 = "{$strText}{$gapText}";

        $p3 = "Para atender tu perfil con precisión, he definido tu hoja de ruta personalizada en la **{$pathTitle}**, estructurada en 3 fases secuenciales. Tu punto de partida inmediato es el curso **{$firstCourseTitle}**. En lugar de saltar apresuradamente a temas avanzados sin cimientos firmes, completar esta fase te otorgará el rigor técnico para codificar con autonomía y seguridad.";

        return "{$p1}\n\n{$p2}\n\n{$p3}";
    }

    /**
     * Construye el prompt de sistema para que la IA actúe como evaluador riguroso y crítico.
     */
    public function buildAgentSystemPrompt(string $studentName, int $totalTechnical): string
    {
        $courses = $this->catalogService->getCourseMeta();
        $paths = $this->catalogService->getCatalogPaths();

        $coursesList = implode("\n", array_map(function ($slug, $meta) {
            return "- {$slug}: {$meta['title']}";
        }, array_keys($courses), $courses));

        $pathsList = implode("\n", array_map(function ($slug, $path) {
            return "- {$slug} ({$path['title']})";
        }, array_keys($paths), $paths));

        return <<<PROMPT
Eres Byte Copilot, el evaluador diagnóstico pedagógico y tutor crítico de SysEng Academy (plataforma de formación técnica para ingenieros de software).

Tu tarea: analizar con máximo rigor técnico y realismo las respuestas de la evaluación diagnóstica del estudiante "{$studentName}" y generar su dictamen oficial y temario personalizado.

PRINCIPIOS DE EVALUACIÓN CRÍTICA Y REALISTA:
1. SÉ REALISTA: Un estudiante novato o con fallas en lógica básica NUNCA debe ser asignado a Nivel 3 o 4. No infles calificaciones ni uses títulos grandilocuentes. Sé honesto, constructivo y fundamentado.
2. NIVELES OFICIALES:
   - Nivel 1: Cadete en Formación (0-1 aciertos o novato) -> Debe iniciar con fundamentos puros de programación y algoritmos.
   - Nivel 2: Desarrollador Trainee (2-3 aciertos) -> Lógica estructurada y bases en consolidación.
   - Nivel 3: Desarrollador Junior (4 aciertos) -> Autonomía técnica y construcción de módulos.
   - Nivel 4: Desarrollador Junior Avanzado (5 aciertos / 100% impecable) -> Pensamiento sistémico y arquitectura.
3. CURSOS 100% REALES: Las 3 fases del syllabus DEBEN usar EXCLUSIVAMENTE los slugs y títulos existentes del catálogo de SysEngAcademy listados abajo. Jamás inventes cursos inexistentes.
4. FEEDBACK EN 3 PÁRRAFOS: Escribe un informe pedagógico minucioso de al menos 3 párrafos explicando (1) calibración del nivel, (2) análisis específico de fortalezas y debilidades demostradas en sus respuestas, y (3) justificación de la ruta asignada.

RUTAS DISPONIBLES (slugs):
{$pathsList}

CATÁLOGO DE CURSOS VERIFICADOS (slugs y títulos exactos):
{$coursesList}

RESPONDE ÚNICAMENTE con JSON válido (sin markdown, sin bloques ```json, sin texto antes ni después):
{
  "score": <aciertos_tecnicos>,
  "totalTechnical": {$totalTechnical},
  "levelNumber": <1|2|3|4>,
  "levelTitle": "<título_oficial_del_nivel>",
  "recommendedSpecialty": "<especialidad_oficial>",
  "recommendedPathSlug": "<slug_de_ruta_valido>",
  "recommendedPathTitle": "<título_de_ruta_valido>",
  "primaryCourseSlug": "<slug_del_curso_en_fase_1>",
  "primaryCourseTitle": "<título_del_curso_en_fase_1>",
  "competencyBreakdown": {
    "logic": <0-100>,
    "oop": <0-100>,
    "database": <0-100>,
    "architecture": <0-100>
  },
  "syllabus": [
    {
      "phaseNumber": 1,
      "phaseTitle": "<Fase 01: Título del Curso 1>",
      "courseTitle": "<Título Exacto del Curso 1>",
      "courseSlug": "<slug_exacto_del_curso_1>",
      "description": "<descripción enfocada a sus debilidades>",
      "estimatedHours": <horas>,
      "skillsGained": ["skill1", "skill2", "skill3"]
    },
    {
      "phaseNumber": 2,
      "phaseTitle": "<Fase 02: Título del Curso 2>",
      "courseTitle": "<Título Exacto del Curso 2>",
      "courseSlug": "<slug_exacto_del_curso_2>",
      "description": "<descripción formativa>",
      "estimatedHours": <horas>,
      "skillsGained": ["skill1", "skill2"]
    },
    {
      "phaseNumber": 3,
      "phaseTitle": "<Fase 03: Título del Curso 3>",
      "courseTitle": "<Título Exacto del Curso 3>",
      "courseSlug": "<slug_exacto_del_curso_3>",
      "description": "<descripción de consolidación>",
      "estimatedHours": <horas>,
      "skillsGained": ["skill1", "skill2"]
    }
  ],
  "agentFeedback": "<informe pedagógico crítico y realista de 3 párrafos en español>"
}
PROMPT;
    }

    /**
     * Construye el mensaje del usuario con la trazabilidad detallada de respuestas.
     */
    public function buildEvaluationUserMessage(
        string $name,
        array $evalDetails,
        string $specialtyPref,
        string $backgroundExp
    ): string {
        $msg = "DATOS DE LA EVALUACIÓN DEL ESTUDIANTE: {$name}\n";
        $msg .= "Antecedente declarado: {$backgroundExp}\n";
        $msg .= "Preferencia técnica: {$specialtyPref}\n\n";
        $msg .= "RESPUESTAS DETALLADAS:\n";

        foreach ($evalDetails as $qId => $detail) {
            $cat = $detail['category'] ?? 'general';
            $title = $detail['title'] ?? $qId;
            $answered = $detail['answered'] ?? 'sin_respuesta';

            if (!empty($detail['is_preference'])) {
                $msg .= "- [{$qId}] ({$cat}) {$title}: Eligió [{$answered}]\n";
            } else {
                $isOk = !empty($detail['is_correct']) ? 'CORRECTO (Demuestra dominio)' : 'INCORRECTO (Brecha detectada)';
                $correct = $detail['correct'] ?? '';
                $msg .= "- [{$qId}] ({$cat}) {$title}: Marcó [{$answered}], Correcto [{$correct}] -> {$isOk}\n";
            }
        }

        return $msg;
    }

    /**
     * Sanea y valida la salida generada por el LLM contra el catálogo auténtico.
     */
    public function sanitizeAiResult(array $aiData, array $deterministic, int $totalTechnical): array
    {
        $paths = $this->catalogService->getCatalogPaths();
        $courseMeta = $this->catalogService->getCourseMeta();

        $levelNumber = max(1, min(4, (int) ($aiData['levelNumber'] ?? $deterministic['levelNumber'])));
        $score = max(0, min($totalTechnical, (int) ($aiData['score'] ?? $deterministic['score'])));

        $pathSlug = (string) ($aiData['recommendedPathSlug'] ?? $deterministic['recommendedPathSlug']);
        if (!isset($paths[$pathSlug])) {
            $pathSlug = $deterministic['recommendedPathSlug'];
        }
        $pathDef = $paths[$pathSlug];

        $syllabus = [];
        $rawPhases = is_array($aiData['syllabus'] ?? null) ? $aiData['syllabus'] : $deterministic['syllabus'];

        foreach (array_values($rawPhases) as $idx => $phase) {
            $phaseNum = $idx + 1;
            if ($phaseNum > 3) break;

            $slug = (string) ($phase['courseSlug'] ?? '');
            if (!isset($courseMeta[$slug])) {
                $slug = $deterministic['syllabus'][$idx]['courseSlug'] ?? 'introduccion-programacion';
            }
            $meta = $courseMeta[$slug];

            $syllabus[] = [
                'phaseNumber' => $phaseNum,
                'phaseTitle' => (string) ($phase['phaseTitle'] ?? "Fase 0{$phaseNum}: {$meta['title']}"),
                'courseTitle' => $meta['title'],
                'courseSlug' => $slug,
                'description' => (string) ($phase['description'] ?? $meta['desc']),
                'estimatedHours' => (int) ($phase['estimatedHours'] ?? $meta['hours']),
                'skillsGained' => !empty($phase['skillsGained']) && is_array($phase['skillsGained'])
                    ? array_map('strval', $phase['skillsGained'])
                    : $meta['skills'],
            ];
        }

        if (count($syllabus) < 3) {
            $syllabus = $deterministic['syllabus'];
        }

        $breakdown = is_array($aiData['competencyBreakdown'] ?? null) ? $aiData['competencyBreakdown'] : [];

        return [
            'score' => $score,
            'totalTechnical' => $totalTechnical,
            'levelNumber' => $levelNumber,
            'levelTitle' => (string) ($aiData['levelTitle'] ?? $deterministic['levelTitle']),
            'recommendedSpecialty' => (string) ($aiData['recommendedSpecialty'] ?? $pathDef['specialty']),
            'recommendedPathSlug' => $pathDef['slug'],
            'recommendedPathTitle' => $pathDef['title'],
            'primaryCourseSlug' => $syllabus[0]['courseSlug'],
            'primaryCourseTitle' => $syllabus[0]['courseTitle'],
            'competencyBreakdown' => [
                'logic' => max(0, min(100, (int) ($breakdown['logic'] ?? $deterministic['competencyBreakdown']['logic']))),
                'oop' => max(0, min(100, (int) ($breakdown['oop'] ?? $deterministic['competencyBreakdown']['oop']))),
                'database' => max(0, min(100, (int) ($breakdown['database'] ?? $deterministic['competencyBreakdown']['database']))),
                'architecture' => max(0, min(100, (int) ($breakdown['architecture'] ?? $deterministic['competencyBreakdown']['architecture']))),
            ],
            'syllabus' => $syllabus,
            'agentFeedback' => (string) ($aiData['agentFeedback'] ?? $deterministic['agentFeedback']),
            'completedAt' => now()->toISOString(),
        ];
    }

    /**
     * Extrae JSON limpio de una cadena de respuesta del modelo.
     */
    protected function extractJson(string $raw): ?array
    {
        $trimmed = trim($raw);
        $decoded = json_decode($trimmed, true);
        if ($decoded !== null) {
            return $decoded;
        }

        if (preg_match('/```(?:json)?\s*([\s\S]*?)```/', $raw, $matches)) {
            $decoded = json_decode(trim($matches[1]), true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        if (preg_match('/\{[\s\S]*\}/', $raw, $matches)) {
            $decoded = json_decode(trim($matches[0]), true);
            if ($decoded !== null) {
                return $decoded;
            }
        }

        return null;
    }
}
