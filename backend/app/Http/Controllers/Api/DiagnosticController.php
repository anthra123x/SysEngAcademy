<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Controlador de Evaluación Diagnóstica y Calibración de Ruta de Aprendizaje.
 * Evalúa críticamente el nivel técnico real, desglosa competencias en 4 ejes,
 * define la especialidad y genera una ruta adaptativa basada estrictamente
 * en el catálogo de cursos real de SysEngAcademy.
 */
class DiagnosticController extends Controller
{
    /**
     * Mapeo canónico de rutas de aprendizaje y secuencias de cursos por nivel.
     * Slugs 100% verificados contra la base de datos de producción.
     */
    public const CATALOG_PATHS = [
        'desarrollo-backend' => [
            'slug' => 'desarrollo-backend',
            'title' => 'Ruta de Desarrollo Backend & Arquitectura de APIs',
            'specialty' => 'Desarrollo Backend & APIs Distribuidas',
            'levels' => [
                1 => ['introduccion-programacion', 'python-estructurado', 'backend-introduccion'],
                2 => ['backend-introduccion', 'sql-desde-cero', 'diseno-apis-restful'],
                3 => ['diseno-apis-restful', 'apis-rest-con-laravel', 'modelos-relaciones-y-consultas'],
                4 => ['modelos-relaciones-y-consultas', 'seguridad-en-apis', 'arquitectura-proyecto-poo'],
            ],
        ],
        'desarrollo-frontend' => [
            'slug' => 'desarrollo-frontend',
            'title' => 'Ruta de Desarrollo Frontend & Experiencia de Usuario',
            'specialty' => 'Desarrollo Frontend & Interfaces Reactivas',
            'levels' => [
                1 => ['introduccion-programacion', 'intro-desarrollo-web', 'html-css-javascript'],
                2 => ['html-css-javascript', 'css-moderno-flexbox-grid', 'typescript-profesional-frontend'],
                3 => ['typescript-profesional-frontend', 'angular-moderno', 'accesibilidad-y-performance-web'],
                4 => ['angular-moderno', 'accesibilidad-y-performance-web', 'integracion-frontend-backend'],
            ],
        ],
        'desarrollo-fullstack' => [
            'slug' => 'desarrollo-fullstack',
            'title' => 'Ruta de Desarrollo Full Stack Integral',
            'specialty' => 'Desarrollo Full Stack de Punta a Punta',
            'levels' => [
                1 => ['introduccion-programacion', 'html-css-javascript', 'backend-introduccion'],
                2 => ['intro-desarrollo-web', 'backend-introduccion', 'integracion-frontend-backend'],
                3 => ['integracion-frontend-backend', 'autenticacion-jwt-web', 'despliegue-fullstack'],
                4 => ['autenticacion-jwt-web', 'despliegue-fullstack', 'seguridad-en-apis'],
            ],
        ],
        'desarrollo-orientado-objetos' => [
            'slug' => 'desarrollo-orientado-objetos',
            'title' => 'Ruta de Arquitectura y Programación Orientada a Objetos',
            'specialty' => 'Arquitectura Orientada a Objetos & SOLID',
            'levels' => [
                1 => ['introduccion-programacion', 'introduccion-poo', 'clases-objetos-herencia'],
                2 => ['clases-objetos-herencia', 'programacion-orientada-a-objetos-java', 'diseno-modular-interfaces'],
                3 => ['diseno-modular-interfaces', 'principios-solid', 'patrones-de-diseno'],
                4 => ['principios-solid', 'patrones-de-diseno', 'arquitectura-proyecto-poo'],
            ],
        ],
        'devops' => [
            'slug' => 'devops',
            'title' => 'Ruta de DevOps, Contenedores & Automatización Cloud',
            'specialty' => 'DevOps & Infraestructura como Código',
            'levels' => [
                1 => ['introduccion-programacion', 'linux-y-linea-de-comandos', 'git-desde-cero'],
                2 => ['linux-y-linea-de-comandos', 'git-colaboracion-y-flujos', 'docker-y-contenedores'],
                3 => ['docker-y-contenedores', 'docker-compose-multiservicio', 'ci-cd-github-actions'],
                4 => ['docker-compose-multiservicio', 'ci-cd-github-actions', 'despliegue-fullstack'],
            ],
        ],
        'desarrollo-con-ia' => [
            'slug' => 'desarrollo-con-ia',
            'title' => 'Ruta de Desarrollo con Inteligencia Artificial & Agentes',
            'specialty' => 'Inteligencia Artificial Aplicada & Prompt Engineering',
            'levels' => [
                1 => ['introduccion-programacion', 'python-estructurado', 'introduccion-ia-para-desarrolladores'],
                2 => ['python-estructurado', 'introduccion-ia-para-desarrolladores', 'prompt-engineering-practico'],
                3 => ['introduccion-ia-para-desarrolladores', 'prompt-engineering-practico', 'ia-en-el-ciclo-de-desarrollo'],
                4 => ['prompt-engineering-practico', 'ia-en-el-ciclo-de-desarrollo', 'rag-embeddings-bases-vectoriales'],
            ],
        ],
        'fundamentos-programacion' => [
            'slug' => 'fundamentos-programacion',
            'title' => 'Ruta de Fundamentos de Programación y Pensamiento Algorítmico',
            'specialty' => 'Lógica Algorítmica & Ciencias de la Computación',
            'levels' => [
                1 => ['introduccion-programacion', 'pseint-desde-cero', 'logica-pensamiento-computacional'],
                2 => ['logica-pensamiento-computacional', 'python-estructurado', 'algoritmos-ordenamiento'],
                3 => ['algoritmos-ordenamiento', 'estructuras-datos-lineales', 'clases-objetos-herencia'],
                4 => ['estructuras-datos-lineales', 'diseno-modular-interfaces', 'patrones-de-diseno'],
            ],
        ],
        'git-y-control-versiones' => [
            'slug' => 'git-y-control-versiones',
            'title' => 'Ruta de Git y Control de Versiones Profesional',
            'specialty' => 'Control de Versiones & Flujos Colaborativos',
            'levels' => [
                1 => ['git-desde-cero', 'linux-y-linea-de-comandos', 'git-colaboracion-y-flujos'],
                2 => ['git-colaboracion-y-flujos', 'git-avanzado-rebase-conflictos', 'ci-cd-github-actions'],
                3 => ['git-avanzado-rebase-conflictos', 'ci-cd-github-actions', 'docker-y-contenedores'],
                4 => ['git-avanzado-rebase-conflictos', 'ci-cd-github-actions', 'despliegue-fullstack'],
            ],
        ],
        'ingenieria-de-requerimientos' => [
            'slug' => 'ingenieria-de-requerimientos',
            'title' => 'Ruta de Ingeniería de Requerimientos & Análisis de Software',
            'specialty' => 'Ingeniería de Requerimientos & Gestión del Alcance',
            'levels' => [
                1 => ['fundamentos-requerimientos', 'historias-de-usuario-y-casos-de-uso', 'introduccion-programacion'],
                2 => ['fundamentos-requerimientos', 'historias-de-usuario-y-casos-de-uso', 'gestion-de-requerimientos'],
                3 => ['historias-de-usuario-y-casos-de-uso', 'gestion-de-requerimientos', 'especificacion-srs-diagramas'],
                4 => ['gestion-de-requerimientos', 'especificacion-srs-diagramas', 'diseno-modular-interfaces'],
            ],
        ],
    ];

    /**
     * Metadatos enriquecidos de cursos reales de la plataforma.
     */
    public const COURSE_META = [
        'introduccion-programacion' => [
            'title' => 'Introducción a la Programación',
            'desc' => 'Fundamentos de control de flujo, variables, tablas de verdad y lógica algorítmica.',
            'hours' => 12,
            'skills' => ['Lógica Booleana', 'Estructuras de Control', 'Pensamiento Algorítmico'],
        ],
        'pseint-desde-cero' => [
            'title' => 'PSeInt desde cero',
            'desc' => 'Pseudocódigo guiado, diagramas de flujo y resolución procedimental.',
            'hours' => 10,
            'skills' => ['Pseudocódigo', 'Diagramación de Flujo', 'Trazabilidad de Variables'],
        ],
        'logica-pensamiento-computacional' => [
            'title' => 'Lógica y Pensamiento Computacional',
            'desc' => 'Descomposición analítica, patrones lógicos y resolución estructurada de problemas.',
            'hours' => 14,
            'skills' => ['Descomposición Lógica', 'Abstracción', 'Patrones Computacionales'],
        ],
        'python-estructurado' => [
            'title' => 'Programación Estructurada con Python',
            'desc' => 'Sintaxis limpia, funciones puras, manejo de excepciones y colecciones en Python.',
            'hours' => 14,
            'skills' => ['Python Moderno', 'Funciones & Scope', 'Manipulación de Datos'],
        ],
        'algoritmos-ordenamiento' => [
            'title' => 'Algoritmos de Ordenamiento',
            'desc' => 'Búsquedas eficientes, algoritmos de ordenación y análisis de complejidad Big-O.',
            'hours' => 16,
            'skills' => ['Búsqueda Binaria', 'QuickSort/MergeSort', 'Complejidad Temporal O(N)'],
        ],
        'estructuras-datos-lineales' => [
            'title' => 'Estructuras de Datos Lineales y Complejidad',
            'desc' => 'Pilas, colas, listas enlazadas, mapas hash y optimización de memoria.',
            'hours' => 18,
            'skills' => ['Tablas Hash', 'Estructuras Lineales', 'Eficiencia Asintótica'],
        ],
        'backend-introduccion' => [
            'title' => 'Introducción al Backend',
            'desc' => 'Conceptos esenciales del lado servidor: peticiones, respuestas, rutas y controladores.',
            'hours' => 14,
            'skills' => ['Arquitectura Cliente-Servidor', 'Controladores', 'Procesamiento de Requests'],
        ],
        'arquitectura-web-http' => [
            'title' => 'Protocolo HTTP y Arquitectura Web',
            'desc' => 'Cabeceras, métodos semánticos, códigos de estado, statelessness y ciclo de vida de peticiones.',
            'hours' => 12,
            'skills' => ['Protocolo HTTP/1.1 y HTTP/2', 'Semántica REST', 'Cabeceras & Caché'],
        ],
        'sql-desde-cero' => [
            'title' => 'SQL desde Cero',
            'desc' => 'Modelado relacional, claves foráneas, consultas SELECT, JOINs y agregaciones.',
            'hours' => 15,
            'skills' => ['Consultas Relacionales', 'JOINs & Agrupaciones', 'Integridad Referencial'],
        ],
        'diseno-apis-restful' => [
            'title' => 'Diseño y Versionado de APIs RESTful',
            'desc' => 'Estándares OpenAPI, contratos DTO tipados, respuestas predecibles y versionado de endpoints.',
            'hours' => 16,
            'skills' => ['Diseño de Contratos', 'REST Best Practices', 'Paginación & Filtrado'],
        ],
        'apis-rest-con-laravel' => [
            'title' => 'APIs REST con Laravel',
            'desc' => 'Construcción de APIs profesionales con validación de Requests, Resource Collections y middlewares.',
            'hours' => 18,
            'skills' => ['Laravel Framework', 'API Resources', 'Inyección de Dependencias'],
        ],
        'modelos-relaciones-y-consultas' => [
            'title' => 'Modelos, Relaciones y Consultas',
            'desc' => 'ORM Eloquent avanzado, optimización de consultas, prevención de N+1 e índices.',
            'hours' => 18,
            'skills' => ['Eloquent ORM', 'Optimización SQL', 'Prevención N+1'],
        ],
        'seguridad-en-apis' => [
            'title' => 'Seguridad en APIs',
            'desc' => 'Hardening de endpoints, sanitización OWASP, rate limiting, CORS y autorización granular.',
            'hours' => 18,
            'skills' => ['OWASP API Security', 'Rate Limiting', 'Sanitización Defensiva'],
        ],
        'intro-desarrollo-web' => [
            'title' => 'Introducción al Desarrollo Web',
            'desc' => 'Fundamentos de la web: navegador, DOM, inspectores DevTools y estructura de documentos.',
            'hours' => 12,
            'skills' => ['Arquitectura Web', 'Árbol DOM', 'DevTools'],
        ],
        'html-css-javascript' => [
            'title' => 'HTML, CSS y JavaScript',
            'desc' => 'Maquetación semántica, estilos visuales y primeros scripts interactivos.',
            'hours' => 14,
            'skills' => ['HTML5 Semántico', 'CSS3 Básico', 'JavaScript Vanilla'],
        ],
        'css-moderno-flexbox-grid' => [
            'title' => 'CSS Moderno: Flexbox, CSS Grid y Responsive Design',
            'desc' => 'Diseño adaptativo para móviles y escritorio con Flexbox, Grid y tokens CSS.',
            'hours' => 16,
            'skills' => ['Flexbox & Grid', 'Responsive Design', 'Tokens de Diseño'],
        ],
        'typescript-profesional-frontend' => [
            'title' => 'TypeScript Profesional para Aplicaciones Frontend',
            'desc' => 'Tipado estricto, interfaces, genéricos, decoradores y manejo seguro de estados.',
            'hours' => 16,
            'skills' => ['Tipado Estático', 'Interfaces & Tipos DTO', 'Genéricos en TS'],
        ],
        'angular-moderno' => [
            'title' => 'Angular Moderno',
            'desc' => 'Componentes standalone, signals reactivas, control flow (@if/@for) y servicios singleton.',
            'hours' => 20,
            'skills' => ['Signals & Reactividad', 'Standalone Components', 'Enrutamiento Client-Side'],
        ],
        'accesibilidad-y-performance-web' => [
            'title' => 'Accesibilidad y Performance Web',
            'desc' => 'Core Web Vitals, accesibilidad WCAG/ARIA, lazy loading y auditorías de rendimiento.',
            'hours' => 18,
            'skills' => ['Core Web Vitals', 'Accesibilidad ARIA', 'Optimización de Carga'],
        ],
        'integracion-frontend-backend' => [
            'title' => 'Integración Frontend ↔ Backend',
            'desc' => 'Consumo de APIs desde el cliente, interceptores HTTP, sincronización de estado y feedback reactivo.',
            'hours' => 18,
            'skills' => ['Interceptores HTTP', 'Gestión de Errores', 'Sincronización Asíncrona'],
        ],
        'autenticacion-jwt-web' => [
            'title' => 'Autenticación JWT de punta a punta',
            'desc' => 'Tokens JWT, refresh tokens, guards de navegación, headers de autorización y sesiones seguras.',
            'hours' => 20,
            'skills' => ['Autenticación JWT', 'Guards de Navegación', 'Almacenamiento Seguro'],
        ],
        'despliegue-fullstack' => [
            'title' => 'Despliegue Full Stack',
            'desc' => 'Configuración de variables de entorno, pipelines en Render/Vercel y bases de datos cloud Neon.',
            'hours' => 22,
            'skills' => ['Deploy en la Nube', 'Gestión de Secretos', 'PostgreSQL Cloud'],
        ],
        'introduccion-poo' => [
            'title' => 'Introducción a la Programación Orientada a Objetos',
            'desc' => 'Conceptos base: clases, instancias, atributos, métodos y estado interno.',
            'hours' => 14,
            'skills' => ['Clases & Objetos', 'Métodos & Atributos', 'Abstracción'],
        ],
        'clases-objetos-herencia' => [
            'title' => 'Clases, Objetos y Herencia',
            'desc' => 'Jerarquías de clases, reutilización mediante herencia, constructores y polimorfismo básico.',
            'hours' => 16,
            'skills' => ['Herencia', 'Polimorfismo', 'Sobrecarga de Métodos'],
        ],
        'programacion-orientada-a-objetos-java' => [
            'title' => 'Programación Orientada a Objetos con Java',
            'desc' => 'POO tipada estricta, paquetes, excepciones y manipulación de memoria con Java.',
            'hours' => 18,
            'skills' => ['Java OOP', 'Manejo de Excepciones', 'Colecciones Tipadas'],
        ],
        'diseno-modular-interfaces' => [
            'title' => 'Diseño Modular, Interfaces y Contratos',
            'desc' => 'Interfaces, clases abstractas, desacoplamiento y contratos de software profesionales.',
            'hours' => 18,
            'skills' => ['Interfaces & Contratos', 'Desacoplamiento', 'Clases Abstractas'],
        ],
        'principios-solid' => [
            'title' => 'Principios SOLID en la práctica',
            'desc' => 'Single Responsibility, Open/Closed, Liskov, Interface Segregation y Dependency Inversion.',
            'hours' => 18,
            'skills' => ['Principios SOLID', 'Refactorización', 'Inversión de Control'],
        ],
        'patrones-de-diseno' => [
            'title' => 'Patrones de Diseño',
            'desc' => 'Patrones creacionales, estructurales y de comportamiento (Factory, Strategy, Observer, Singleton).',
            'hours' => 22,
            'skills' => ['Patrones GoF', 'Arquitectura Limpia', 'Mantenibilidad'],
        ],
        'arquitectura-proyecto-poo' => [
            'title' => 'Proyecto Final: Arquitectura de Software Orientada a Objetos',
            'desc' => 'Construcción de un sistema modular completo con capas, DTOs, repositorios y pruebas.',
            'hours' => 24,
            'skills' => ['Arquitectura en Capas', 'Patrón Repositorio', 'Clean Architecture'],
        ],
        'linux-y-linea-de-comandos' => [
            'title' => 'Linux y línea de comandos',
            'desc' => 'Terminal Bash, navegación en sistema de archivos, permisos, pipes, grep y automatización con scripts.',
            'hours' => 16,
            'skills' => ['Terminal Linux & Bash', 'Permisos & Procesos', 'Pipes & Redirecciones'],
        ],
        'git-desde-cero' => [
            'title' => 'Git desde cero',
            'desc' => 'Control de versiones esencial: init, add, commit, log, ramas locales y repositorios remotos.',
            'hours' => 12,
            'skills' => ['Git Básico', 'Ramas & Commits', 'Repositorios Remotos'],
        ],
        'git-colaboracion-y-flujos' => [
            'title' => 'Git colaboración y flujos',
            'desc' => 'Flujos colaborativos, pull requests, resolución de conflictos de fusión y conventional commits.',
            'hours' => 14,
            'skills' => ['Git Flow & Pull Requests', 'Resolución de Conflictos', 'Conventional Commits'],
        ],
        'git-avanzado-rebase-conflictos' => [
            'title' => 'Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos',
            'desc' => 'Rebase interactivo, cherry-pick, reflog, bisect y recuperación de estados perdidos.',
            'hours' => 16,
            'skills' => ['Git Rebase Interactivo', 'Cherry-Pick & Reflog', 'Bisect Debugging'],
        ],
        'docker-y-contenedores' => [
            'title' => 'Docker y contenedores',
            'desc' => 'Creación de imágenes con Dockerfile, ejecución de contenedores, mapeo de puertos y volúmenes persistentes.',
            'hours' => 18,
            'skills' => ['Dockerfiles', 'Gestión de Contenedores', 'Volúmenes & Redes Docker'],
        ],
        'docker-compose-multiservicio' => [
            'title' => 'Docker Compose y Arquitecturas Multiservicio',
            'desc' => 'Orquestación local de aplicaciones con backend, base de datos y cache en contenedores coordinados.',
            'hours' => 18,
            'skills' => ['Docker Compose', 'Orquestación Local', 'Variables de Entorno en Contenedores'],
        ],
        'ci-cd-github-actions' => [
            'title' => 'CI/CD con GitHub Actions',
            'desc' => 'Pipelines de integración y despliegue continuo con pruebas automáticas y entrega en la nube.',
            'hours' => 20,
            'skills' => ['GitHub Actions', 'Pipelines de CI/CD', 'Automatización de Tests'],
        ],
        'introduccion-ia-para-desarrolladores' => [
            'title' => 'Introducción a la IA para desarrolladores',
            'desc' => 'Conceptos base de LLMs, tokens, contexto, inferencia y consumo de APIs de IA generativa.',
            'hours' => 14,
            'skills' => ['Fundamentos de LLMs', 'Llamadas a APIs de IA', 'Manejo de Contexto'],
        ],
        'prompt-engineering-practico' => [
            'title' => 'Prompt Engineering práctico',
            'desc' => 'Prompting estructurado, Few-Shot, Chain-of-Thought, salida en JSON tipado y validación de esquemas.',
            'hours' => 16,
            'skills' => ['Prompting Estructurado', 'Few-Shot & CoT', 'Generación de JSON Controlado'],
        ],
        'ia-en-el-ciclo-de-desarrollo' => [
            'title' => 'IA en el ciclo de desarrollo',
            'desc' => 'Pair programming asistido, generación de pruebas unitarias, refactorización y depuración con agentes.',
            'hours' => 18,
            'skills' => ['Pair Programming con IA', 'Generación de Tests', 'Depuración Asistida'],
        ],
        'rag-embeddings-bases-vectoriales' => [
            'title' => 'RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales',
            'desc' => 'Embeddings semánticos, bases vectoriales, búsqueda por similitud de cosenos y arquitecturas RAG.',
            'hours' => 22,
            'skills' => ['Bases de Datos Vectoriales', 'Arquitecturas RAG', 'Búsqueda Semántica'],
        ],
        'fundamentos-requerimientos' => [
            'title' => 'Fundamentos de requerimientos',
            'desc' => 'Ingeniería de requerimientos, clasificación funcional y no funcional, stakeholders y ciclo de vida.',
            'hours' => 12,
            'skills' => ['Requisitos Funcionales', 'Requisitos No Funcionales', 'Levantamiento de Información'],
        ],
        'historias-de-usuario-y-casos-de-uso' => [
            'title' => 'Historias de usuario y casos de uso',
            'desc' => 'Metodologías ágiles, criterios de aceptación INVEST, especificación de casos de uso y diagramas UML.',
            'hours' => 13,
            'skills' => ['Historias de Usuario (INVEST)', 'Criterios de Aceptación', 'Casos de Uso UML'],
        ],
        'gestion-de-requerimientos' => [
            'title' => 'Gestión de requerimientos',
            'desc' => 'Trazabilidad de requisitos, priorización con MoSCoW/Kano, control de cambios y matrices de trazabilidad.',
            'hours' => 11,
            'skills' => ['Matriz de Trazabilidad', 'Priorización MoSCoW', 'Gestión del Alcance'],
        ],
        'especificacion-srs-diagramas' => [
            'title' => 'Especificación Formal (SRS) y Casos de Uso',
            'desc' => 'Estándar IEEE 830 / ISO 29148 para especificación de requisitos de software (SRS) y modelado formal.',
            'hours' => 12,
            'skills' => ['Estándar IEEE 830', 'Documentación SRS', 'Validación Formal'],
        ],
    ];

    /**
     * Consulta el dictamen diagnóstico almacenado previamente para el usuario.
     */
    public function getSavedDiagnostic(Request $request)
    {
        $user = $this->resolveUser($request);

        if ($user && !empty($user->diagnostic_result)) {
            return response()->json([
                'success' => true,
                'result' => $user->diagnostic_result,
            ]);
        }

        return response()->json([
            'success' => false,
            'result' => null,
        ]);
    }

    /**
     * Procesa y evalúa las respuestas diagnósticas con análisis crítico y realista.
     */
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
        $studentName = trim($validated['student_name']);
        $user = $this->resolveUser($request, $validated['student_email']);

        // 1. Análisis riguroso por ejes de competencia técnica
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

        // 2. Cálculo determinístico de alta precisión (garantía de consistencia)
        $deterministicResult = $this->computeDeterministicDiagnostic(
            $score,
            $totalTechnical,
            $evalDetails,
            $specialtyPref,
            $backgroundExp,
            $studentName
        );

        // 3. Intento de refinamiento pedagógico con el modelo de IA
        $aiResult = null;
        try {
            $systemPrompt = $this->buildAgentSystemPrompt($studentName, $totalTechnical);
            $userMsg = $this->buildEvaluationUserMessage($studentName, $evalDetails, $specialtyPref, $backgroundExp);

            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMsg],
            ];

            $raw = $this->requestAiCompletion($ai, $messages);
            $parsed = $this->extractJson($raw);

            if ($parsed && isset($parsed['levelNumber']) && !empty($parsed['syllabus'])) {
                $aiResult = $this->sanitizeAiResult($parsed, $deterministicResult, $totalTechnical);
            }
        } catch (\Throwable $e) {
            Log::warning('DiagnosticController: Fallback automático a motor determinístico debido a error de IA', [
                'error' => $e->getMessage(),
            ]);
        }

        $finalResult = $aiResult ?: $deterministicResult;

        // 4. Persistir resultado en la cuenta del usuario para evitar pérdida de estado
        if ($user) {
            $user->diagnostic_result = $finalResult;
            $user->specialization = $finalResult['recommendedSpecialty'];
            $user->save();
        }

        return response()->json([
            'success' => true,
            'result' => $finalResult,
        ]);
    }

    /**
     * Motor determinístico crítico que garantiza un nivel y ruta 100% realistas
     * según el desempeño por categoría y el catálogo auténtico.
     */
    protected function computeDeterministicDiagnostic(
        int $score,
        int $totalTechnical,
        array $evalDetails,
        string $specialtyPref,
        string $backgroundExp,
        string $studentName
    ): array {
        // Ejes de competencia específicos (0-100)
        $logicOk = ($evalDetails['q_logic']['is_correct'] ?? false);
        $optOk = ($evalDetails['q_optimization']['is_correct'] ?? false);
        $oopOk = ($evalDetails['q_oop']['is_correct'] ?? false);
        $dbOk = ($evalDetails['q_database']['is_correct'] ?? false);
        $archOk = ($evalDetails['q_architecture']['is_correct'] ?? false);

        // Si es el formato legacy (q1-q4)
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

        // Determinación crítica de Nivel:
        // Criterio exigente: Para Nivel 3 o 4 se requiere no solo acertar lógica, sino POO y arquitectura/BD.
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

        // Selección de Ruta y Cursos con coincidencia robusta
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

        $pathDef = self::CATALOG_PATHS[$pathKey] ?? self::CATALOG_PATHS['desarrollo-backend'];
        $courseSlugs = $pathDef['levels'][$levelNumber] ?? $pathDef['levels'][1];

        $syllabus = [];
        foreach ($courseSlugs as $idx => $cSlug) {
            $meta = self::COURSE_META[$cSlug] ?? [
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

        // Redacción de Dictamen Crítico y Realista de Byte IA
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
    protected function generatePedagogicalFeedback(
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
    protected function buildAgentSystemPrompt(string $studentName, int $totalTechnical): string
    {
        $coursesList = implode("\n", array_map(function ($slug, $meta) {
            return "- {$slug}: {$meta['title']}";
        }, array_keys(self::COURSE_META), self::COURSE_META));

        $pathsList = implode("\n", array_map(function ($slug, $path) {
            return "- {$slug} ({$path['title']})";
        }, array_keys(self::CATALOG_PATHS), self::CATALOG_PATHS));

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
    protected function buildEvaluationUserMessage(
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
    protected function sanitizeAiResult(array $aiData, array $deterministic, int $totalTechnical): array
    {
        $levelNumber = max(1, min(4, (int) ($aiData['levelNumber'] ?? $deterministic['levelNumber'])));
        $score = max(0, min($totalTechnical, (int) ($aiData['score'] ?? $deterministic['score'])));

        $pathSlug = (string) ($aiData['recommendedPathSlug'] ?? $deterministic['recommendedPathSlug']);
        if (!isset(self::CATALOG_PATHS[$pathSlug])) {
            $pathSlug = $deterministic['recommendedPathSlug'];
        }
        $pathDef = self::CATALOG_PATHS[$pathSlug];

        $syllabus = [];
        $rawPhases = is_array($aiData['syllabus'] ?? null) ? $aiData['syllabus'] : $deterministic['syllabus'];

        foreach (array_values($rawPhases) as $idx => $phase) {
            $phaseNum = $idx + 1;
            if ($phaseNum > 3) break;

            $slug = (string) ($phase['courseSlug'] ?? '');
            if (!isset(self::COURSE_META[$slug])) {
                $slug = $deterministic['syllabus'][$idx]['courseSlug'] ?? 'introduccion-programacion';
            }
            $meta = self::COURSE_META[$slug];

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
     * Resuelve el usuario autenticado o busca por email proporcionado.
     */
    protected function resolveUser(Request $request, ?string $fallbackEmail = null): ?User
    {
        $user = $request->user('jwt') ?: $request->user('sanctum') ?: $request->user();

        if (!$user && $request->hasHeader('X-User-Email')) {
            $email = strtolower(trim((string) $request->header('X-User-Email')));
            $user = User::where('email', $email)->first();
        }

        if (!$user && $request->filled('student_email')) {
            $email = strtolower(trim((string) $request->input('student_email')));
            $user = User::where('email', $email)->first();
        }

        if (!$user && !empty($fallbackEmail)) {
            $email = strtolower(trim($fallbackEmail));
            $user = User::where('email', $email)->first();
        }

        return $user;
    }

    /**
     * Invoca al servicio AiService con reflexión para el completado no-streaming.
     */
    protected function requestAiCompletion(AiService $ai, array $messages): string
    {
        $ref = new \ReflectionMethod($ai, 'requestCompletion');
        $ref->setAccessible(true);

        return $ref->invoke($ai, $messages);
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
