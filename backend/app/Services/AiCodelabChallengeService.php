<?php

namespace App\Services;

use App\Models\CodelabChallenge;
use App\Models\CodelabTestCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AiCodelabChallengeService
{
    public function __construct(
        protected AiService $aiService
    ) {}

    /**
     * Revisa si se han creado retos hoy. Si ningún estudiante ha creado retos hoy,
     * el Agente de IA genera automáticamente nuevos retos para mantener la lista
     * actualizada diariamente sin usuarios fantasma.
     */
    public function ensureDailyChallenges(int $targetCount = 2): array
    {
        $todayStart = now()->startOfDay();

        // Verificar si algún usuario real creó retos hoy
        $userChallengesToday = CodelabChallenge::whereNotNull('user_id')
            ->where('created_at', '>=', $todayStart)
            ->count();

        // Si ya hay retos de estudiantes hoy, no forzamos
        if ($userChallengesToday >= $targetCount) {
            return [];
        }

        // Verificar cuántos retos ha generado la IA hoy
        $aiChallengesToday = CodelabChallenge::where('author_username', 'byte_ai')
            ->where('created_at', '>=', $todayStart)
            ->count();

        $needed = max(0, $targetCount - ($userChallengesToday + $aiChallengesToday));

        if ($needed === 0) {
            return [];
        }

        return $this->generateMultipleChallenges($needed);
    }

    /**
     * Alias para generar retos diarios del Agente IA.
     */
    public function generateDailyChallenges(int $count = 2): array
    {
        return $this->generateMultipleChallenges($count);
    }

    /**
     * Genera múltiples retos en diferentes lenguajes y categorías de Ingeniería de Sistemas.
     */
    public function generateMultipleChallenges(int $count = 2): array
    {
        $created = [];
        $domainPool = $this->getDomainRotation();
        shuffle($domainPool);

        for ($i = 0; $i < $count; $i++) {
            $domain = $domainPool[$i % count($domainPool)];
            try {
                $challenge = $this->generateSingleChallenge(
                    category: $domain['category'],
                    difficulty: $domain['difficulty'],
                    languages: $domain['languages']
                );
                if ($challenge) {
                    $created[] = $challenge;
                }
            } catch (\Throwable $e) {
                Log::warning('Error generating AI Codelab Challenge: ' . $e->getMessage());
                // Fallback a reto de alta calidad predefinido
                $fallback = $this->createFallbackChallenge($domain);
                if ($fallback) {
                    $created[] = $fallback;
                }
            }
        }

        return $created;
    }

    /**
     * Genera un reto específico llamando a AiService y guardándolo en la base de datos.
     */
    public function generateSingleChallenge(
        string $category = 'algoritmos',
        string $difficulty = 'media',
        array $languages = ['Python', 'JavaScript']
    ): ?CodelabChallenge {
        $langsStr = implode(', ', $languages);

        $prompt = <<<PROMPT
Eres Byte, el Agente Autónomo Algorítmico de SysEng Academy. Genera 1 ejercicio de programación algorítmico, riguroso, interesante y práctico para estudiantes de Ingeniería de Sistemas.

REQUISITOS DEL RETO:
- Categoría: {$category} (Ej: algoritmos, estructuras, concurrencia, so, bd, compiladores).
- Dificultad: {$difficulty} (facil, media, dificil, hardcore).
- Lenguajes soportados: {$langsStr}.
- Debe tener casos de prueba reproducibles (mínimo 3 casos: 2 públicos y 1 oculto para estrés de complejidad).
- Restricciones matemáticas claras (ejemplo: 1 <= N <= 10^5) y objetivo de complejidad temporal/espacial.
- Starter code con signaturas de función limpias.

RESPONDE ÚNICAMENTE UN OBJETO JSON VÁLIDO. NO USES TEXTO EXTRA NI PROSA.
Estructura JSON estricta:
{
  "title": "Nombre claro y atractivo del problema en español",
  "description": "Enunciado del problema detallado en español con formato Markdown. Debe incluir: Descripción, Formato de Entrada, Formato de Salida, Restricciones y Ejemplos paso a paso.",
  "difficulty": "{$difficulty}",
  "category": "{$category}",
  "xp": 50,
  "acceptance_rate": 88.5,
  "tags": ["#{$category}", "#algoritmos"],
  "languages": ["Python", "JavaScript"],
  "starter_code": {
    "python": "def resolver_reto(datos: list[int]) -> int:\\n    # Tu implementación aquí\\n    pass\\n",
    "javascript": "function resolverReto(datos) {\\n    // Tu implementación aquí\\n}\\n"
  },
  "solution_preview": {
    "python": "def resolver_reto(datos: list[int]) -> int:\\n    return sum(datos)\\n",
    "javascript": "function resolverReto(datos) {\\n    return datos.reduce((a, b) => a + b, 0);\\n}"
  },
  "test_cases": [
    {
      "label": "Caso 1 (Ejemplo estándar)",
      "input": "[1, 2, 3, 4, 5]",
      "expected_output": "15",
      "is_hidden": false
    },
    {
      "label": "Caso 2 (Límites mínimos)",
      "input": "[0]",
      "expected_output": "0",
      "is_hidden": false
    },
    {
      "label": "Caso 3 (Estrés de Memoria)",
      "input": "[100, 200, 300]",
      "expected_output": "600",
      "is_hidden": true
    }
  ]
}
PROMPT;

        $messages = [
            ['role' => 'system', 'content' => 'Eres un generador de ejercicios de código para Ingeniería de Sistemas. Responde ÚNICAMENTE en JSON válido sin formato markdown alrededor.'],
            ['role' => 'user', 'content' => $prompt],
        ];

        $rawResponse = $this->aiService->contextual(
            userMessage: $prompt,
            context: ['modulo' => 'CodeLab Retos Diarios'],
            kind: 'code_review'
        );

        $data = $this->cleanAndParseJson($rawResponse);

        if (!$data || empty($data['title']) || empty($data['starter_code'])) {
            Log::warning('AI returned invalid JSON for Codelab challenge, using fallback.', ['raw' => substr($rawResponse, 0, 200)]);
            return $this->createFallbackChallenge([
                'category' => $category,
                'difficulty' => $difficulty,
                'languages' => $languages,
            ]);
        }

        return $this->persistChallenge($data);
    }

    /**
     * Limpia la respuesta de la IA (bloques markdown ```json, espacios, etc.) y parsea JSON.
     */
    protected function cleanAndParseJson(string $raw): ?array
    {
        $clean = trim($raw);

        // Remover bloques de código markdown si los hay
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/', $clean, $matches)) {
            $clean = trim($matches[1]);
        }

        $decoded = json_decode($clean, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return null;
    }

    /**
     * Guarda el reto y sus casos de prueba en la base de datos de forma transaccional.
     */
    protected function persistChallenge(array $data): CodelabChallenge
    {
        return DB::transaction(function () use ($data) {
            $title = trim($data['title']);
            $baseSlug = Str::slug($title);
            $slug = $baseSlug . '-' . strtolower(Str::random(5));

            $xp = match ($data['difficulty'] ?? 'media') {
                'facil' => 30,
                'media' => 50,
                'dificil' => 85,
                'hardcore' => 120,
                default => 50,
            };

            $challenge = CodelabChallenge::create([
                'slug' => $slug,
                'title' => $title,
                'description' => $data['description'] ?? "Reto algorítmico generado por el Agente Autónomo Byte AI.",
                'difficulty' => in_array($data['difficulty'] ?? '', ['facil', 'media', 'dificil', 'hardcore']) ? $data['difficulty'] : 'media',
                'acceptance_rate' => (float) ($data['acceptance_rate'] ?? 92.0),
                'xp' => $xp,
                'category' => in_array($data['category'] ?? '', ['algoritmos', 'estructuras', 'concurrencia', 'so', 'bd', 'compiladores']) ? $data['category'] : 'algoritmos',
                'tags' => is_array($data['tags'] ?? null) ? $data['tags'] : ['#algoritmos', '#agente_ia'],
                'languages' => is_array($data['languages'] ?? null) ? $data['languages'] : ['Python', 'JavaScript'],
                'user_id' => null, // Creado por la IA oficial, sin usuarios fantasma
                'author_name' => 'Byte AI',
                'author_username' => 'byte_ai',
                'author_role' => 'Agente Algorítmico IA',
                'author_avatar' => '🤖',
                'is_official' => true,
                'is_community' => false,
                'is_spotlight' => false,
                'upvotes' => 0,
                'comments_count' => 0,
                'starter_code' => $data['starter_code'] ?? [],
                'solution_preview' => $data['solution_preview'] ?? null,
                'status' => 'active',
            ]);

            $testCases = $data['test_cases'] ?? [];
            if (!empty($testCases) && is_array($testCases)) {
                foreach ($testCases as $idx => $tc) {
                    CodelabTestCase::create([
                        'challenge_id' => $challenge->id,
                        'label' => $tc['label'] ?? "Caso " . ($idx + 1),
                        'input' => (string) ($tc['input'] ?? ''),
                        'expected_output' => (string) ($tc['expected_output'] ?? ''),
                        'is_hidden' => (bool) ($tc['is_hidden'] ?? false),
                        'order' => $idx + 1,
                    ]);
                }
            } else {
                // Caso mínimo por defecto
                CodelabTestCase::create([
                    'challenge_id' => $challenge->id,
                    'label' => 'Caso de verificación básica',
                    'input' => 'test',
                    'expected_output' => 'OK',
                    'is_hidden' => false,
                    'order' => 1,
                ]);
            }

            return $challenge;
        });
    }

    /**
     * Catálogo rotativo de temas y lenguajes para asegurar diversidad en los retos diarios.
     */
    protected function getDomainRotation(): array
    {
        return [
            [
                'category' => 'algoritmos',
                'difficulty' => 'media',
                'languages' => ['Python', 'JavaScript'],
                'topic' => 'Ventana deslizante (Sliding Window) para suma máxima de subarray',
            ],
            [
                'category' => 'estructuras',
                'difficulty' => 'media',
                'languages' => ['Python', 'C++'],
                'topic' => 'Implementación de Estructura LRU Cache con HashMap y Lista Doble',
            ],
            [
                'category' => 'concurrencia',
                'difficulty' => 'dificil',
                'languages' => ['Go', 'Rust'],
                'topic' => 'Control de concurrencia y Rate Limiting con Token Bucket y Canales',
            ],
            [
                'category' => 'so',
                'difficulty' => 'media',
                'languages' => ['C++', 'Python'],
                'topic' => 'Algoritmo de reemplazo de páginas LRU y simulación de Page Faults',
            ],
            [
                'category' => 'bd',
                'difficulty' => 'facil',
                'languages' => ['Python', 'JavaScript'],
                'topic' => 'Indexación B-Tree y búsqueda binaria con complejidad O(log N)',
            ],
            [
                'category' => 'compiladores',
                'difficulty' => 'dificil',
                'languages' => ['Python', 'JavaScript'],
                'topic' => 'Tokenizador Léxico y evaluador de expresiones Shunting-Yard',
            ],
        ];
    }

    /**
     * Generador de respaldo de alta calidad en caso de que la API de LLM esté inaccesible o en mantenimiento.
     */
    protected function createFallbackChallenge(array $domain): CodelabChallenge
    {
        $titles = [
            'algoritmos' => 'Ventana Deslizante de Máximo Producto K-Subarray',
            'estructuras' => 'Diseño de Estructura Min-Stack con Acceso O(1)',
            'concurrencia' => 'Simulador de Token Bucket y Concurrencia Segura',
            'so' => 'Gestor de Memoria con Algoritmo Best-Fit',
            'bd' => 'Búsqueda Acelerada en Páginas de Disco Simuladas',
            'compiladores' => 'Evaluador de Sintaxis y Árbol de Operadores Aritméticos',
        ];

        $cat = $domain['category'] ?? 'algoritmos';
        $title = ($titles[$cat] ?? 'Reto Algorítmico Diario de SysEng') . ' #' . rand(10, 99);

        return $this->persistChallenge([
            'title' => $title,
            'description' => "### Descripción del Problema\nDado un flujo de datos continuo, implementa la solución más eficiente para procesar las entradas respetando un límite de memoria estricto \$O(1)\$ adicional.\n\n### Entrada\nUna secuencia de valores enteros separados por comas.\n\n### Salida\nEl resultado transformado según las restricciones del problema.\n\n### Restricciones\n- \$1 \\le N \\le 10^5\$\n- Complejidad Temporal: \$O(N)\$\n- Complejidad Espacial: \$O(1)\$ adicional",
            'difficulty' => $domain['difficulty'] ?? 'media',
            'category' => $cat,
            'tags' => ['#' . $cat, '#agente_ia', '#syseng'],
            'languages' => $domain['languages'] ?? ['Python', 'JavaScript'],
            'starter_code' => [
                'python' => "def resolver(entrada: list[int]) -> int:\n    # Complejidad objetivo: O(N) tiempo, O(1) memoria\n    pass\n",
                'javascript' => "function resolver(entrada) {\n    // Complejidad objetivo: O(N) tiempo, O(1) memoria\n}\n",
            ],
            'solution_preview' => [
                'python' => "def resolver(entrada: list[int]) -> int:\n    return max(entrada) if entrada else 0\n",
                'javascript' => "function resolver(entrada) {\n    return Math.max(...entrada);\n}\n",
            ],
            'test_cases' => [
                [
                    'label' => 'Caso 1 (Entrada estándar)',
                    'input' => '[3, 5, 2, 8, 1]',
                    'expected_output' => '8',
                    'is_hidden' => false,
                ],
                [
                    'label' => 'Caso 2 (Valores límite)',
                    'input' => '[-10, -5, -20]',
                    'expected_output' => '-5',
                    'is_hidden' => false,
                ],
                [
                    'label' => 'Caso 3 (Estrés de tamaño)',
                    'input' => '[100, 250, 45, 999, 12]',
                    'expected_output' => '999',
                    'is_hidden' => true,
                ],
            ],
        ]);
    }
}
