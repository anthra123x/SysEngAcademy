<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LearningPath;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LearningPathController extends Controller
{
    private const COMPLEMENTARY_META = [
        // Path 1 (Fundamentos de Programación)
        92 => ['badge' => 'Recomendado', 'reason' => 'Práctica inicial en pseudocódigo y diagramas de flujo previa a codificar en entornos reales.'],
        97 => ['badge' => 'Recomendado', 'reason' => 'Refuerzo de pensamiento algorítmico y modelado sistemático de problemas.'],
        3  => ['badge' => 'Interdisciplinario', 'reason' => 'Introducción transversal del catálogo a persistencia y bases de datos relacionales.'],
        // Path 2 (Desarrollo Orientado a Objetos)
        94 => ['badge' => 'Profundización', 'reason' => 'Casos prácticos de jerarquías de herencia, ligadura dinámica y composición.'],
        100 => ['badge' => 'Profundización', 'reason' => 'Diseño modular, abstracción estricta y contratos desacoplados mediante interfaces.'],
        // Path 3 (Desarrollo Backend)
        102 => ['badge' => 'Recomendado', 'reason' => 'Fundamentos de red, anatomía de paquetes HTTP y ciclo request/response.'],
        103 => ['badge' => 'Recomendado', 'reason' => 'Diseño RESTful profesional, especificación OpenAPI y versionado de endpoints.'],
        // Path 4 (Desarrollo Frontend)
        4  => ['badge' => 'Recomendado', 'reason' => 'Panorama general de la arquitectura web, protocolos y renderizado en clientes.'],
        104 => ['badge' => 'Especialización', 'reason' => 'Maquetación moderna con Flexbox, CSS Grid y diseño adaptativo multidispositivo.'],
        105 => ['badge' => 'Especialización', 'reason' => 'Tipado estricto, interfaces avanzadas y patrones enterprise en TypeScript.'],
        // Path 6 (DevOps)
        107 => ['badge' => 'Recomendado', 'reason' => 'Orquestación local multiservicio de contenedores, redes y volúmenes persistentes.'],
        // Path 8 (Ingeniería de Requerimientos)
        109 => ['badge' => 'Profundización', 'reason' => 'Plantillas de especificación IEEE 830, criterios de aceptación y diagramas formales.'],
        // Path 9 (Desarrollo con IA)
        108 => ['badge' => 'Especialización', 'reason' => 'Arquitectura RAG, bases de datos vectoriales y memoria contextual para LLMs.'],
    ];

    private const PATH_CROSS_RECOMMENDED = [
        1 => [
            ['course_id' => 18, 'reason' => 'Control de versiones esencial con Git para guardar y respaldar tu código desde el primer día.'],
            ['course_id' => 15, 'reason' => 'Comandos y terminal Linux para dominar el entorno de ejecución de tus programas.'],
            ['course_id' => 3,  'reason' => 'Persistencia de datos y consultas SQL para dar soporte a tus programas estructurados.'],
        ],
        2 => [
            ['course_id' => 18, 'reason' => 'Control de versiones con Git en arquitecturas orientadas a objetos y paquetes.'],
            ['course_id' => 20, 'reason' => 'Identificación de entidades y clases a partir de requerimientos de software reales.'],
            ['course_id' => 3,  'reason' => 'Persistencia de datos y diseño relacional para respaldar entidades de dominio.'],
        ],
        3 => [
            ['course_id' => 16, 'reason' => 'Empaqueta tus APIs en contenedores Docker para pruebas locales y despliegue.'],
            ['course_id' => 18, 'reason' => 'Gestión de ramas y colaboración en equipos de desarrollo de servicios backend.'],
            ['course_id' => 15, 'reason' => 'Administración y comandos de Linux para despliegue de servidores backend.'],
        ],
        4 => [
            ['course_id' => 12, 'reason' => 'Conexión de componentes frontend con endpoints y servicios backend reales.'],
            ['course_id' => 18, 'reason' => 'Control de versiones y ramas para trabajar en proyectos frontend colaborativos.'],
            ['course_id' => 105, 'reason' => 'TypeScript profesional para tipado estricto y componentes escalables.'],
        ],
        5 => [
            ['course_id' => 15, 'reason' => 'Administración de servidores Linux donde viven tus aplicaciones Full Stack.'],
            ['course_id' => 16, 'reason' => 'Contenedores Docker para estandarizar el stack en desarrollo y producción.'],
            ['course_id' => 18, 'reason' => 'Estrategia de ramas y despliegue continuo en entornos colaborativos.'],
        ],
        6 => [
            ['course_id' => 18, 'reason' => 'Flujos avanzados de Git para pipelines de integración y entrega continua (GitOps).'],
            ['course_id' => 5,  'reason' => 'Conocimiento de la arquitectura backend para aprovisionar su infraestructura idónea.'],
            ['course_id' => 107, 'reason' => 'Docker Compose para orquestar microservicios en ambientes locales y staging.'],
        ],
        7 => [
            ['course_id' => 15, 'reason' => 'Terminal y scripting Bash para automatizar comandos frecuentes de Git.'],
            ['course_id' => 17, 'reason' => 'Integración continua con GitHub Actions para validar commits y pull requests.'],
            ['course_id' => 20, 'reason' => 'Relación entre especificación de tareas y mensajes de commit profesionales.'],
        ],
        8 => [
            ['course_id' => 18, 'reason' => 'Trazabilidad de requerimientos en repositorios de código y tableros colaborativos.'],
            ['course_id' => 23, 'reason' => 'Herramientas de IA para sintetizar especificaciones y redactar criterios de aceptación.'],
            ['course_id' => 109, 'reason' => 'Plantillas estándar de especificación formal y casos de uso en software empresarial.'],
        ],
        9 => [
            ['course_id' => 98, 'reason' => 'Python estructurado como lenguaje base para scripts de automatización e inteligencia artificial.'],
            ['course_id' => 6,  'reason' => 'Desarrollo de APIs REST para exponer inferencias y servicios de IA a clientes web.'],
            ['course_id' => 108, 'reason' => 'Arquitectura RAG y bases de datos vectoriales para asistentes inteligentes.'],
        ],
    ];

    public function index(Request $request)
    {
        $key = 'api.paths.v1.'.md5(json_encode($request->only(['category', 'difficulty', 'page'])));

        $data = Cache::remember($key, now()->addMinutes(10), function () use ($request) {
            $paths = LearningPath::with(['category'])
                ->withCount('courses')
                ->where('is_published', true)
                ->when($request->category, fn ($q, $cat) => $q->whereHas('category', fn ($q2) => $q2->where('slug', $cat)))
                ->when($request->difficulty, fn ($q, $d) => $q->where('difficulty', $d))
                ->paginate(12);

            return $paths->toArray();
        });

        return response()->json($data);
    }

    public function show(Request $request, string $slug)
    {
        $path = Cache::remember("api.path.v2.{$slug}", now()->addMinutes(10), function () use ($slug) {
            $lp = LearningPath::with([
                'category',
                'levels' => fn ($q) => $q->orderBy('order'),
                'levels.courses' => fn ($q) => $q->where('is_published', true)
                    ->with(['category', 'instructor'])
                    ->withCount('lessons')
                    ->orderBy('order'),
            ])
                ->withCount('courses')
                ->where('slug', $slug)
                ->where('is_published', true)
                ->firstOrFail();

            $data = $lp->toArray();

            // 1. Enriquecer cursos dentro de cada nivel / hito
            if (isset($data['levels']) && is_array($data['levels'])) {
                foreach ($data['levels'] as &$lvl) {
                    $lvlCourses = $lvl['courses'] ?? [];
                    $hasPrimary = false;
                    $enhanced = [];

                    foreach ($lvlCourses as $c) {
                        $cid = (int) $c['id'];
                        $meta = self::COMPLEMENTARY_META[$cid] ?? null;
                        $isComp = $meta !== null || ($hasPrimary && count($lvlCourses) > 1);

                        if (!$isComp && !$hasPrimary) {
                            $hasPrimary = true;
                            $c['is_primary'] = true;
                            $c['is_complementary'] = false;
                        } else {
                            $c['is_primary'] = false;
                            $c['is_complementary'] = true;
                            $c['complementary_badge'] = $meta['badge'] ?? 'Recomendado';
                            $c['complementary_reason'] = $meta['reason'] ?? 'Curso recomendado para complementar competencias técnicas en este hito.';
                        }
                        $enhanced[] = $c;
                    }

                    if (!$hasPrimary && count($enhanced) > 0) {
                        $enhanced[0]['is_primary'] = true;
                        $enhanced[0]['is_complementary'] = false;
                    }

                    $lvl['courses'] = $enhanced;
                }
                unset($lvl);
            }

            // 2. Cursos complementarios recomendados al pie de los hitos (Cross-Recommendations)
            $recConfig = self::PATH_CROSS_RECOMMENDED[$lp->id] ?? [];
            $recIds = array_column($recConfig, 'course_id');
            $recReasonMap = array_column($recConfig, 'reason', 'course_id');

            $crossCourses = [];

            if (!empty($recIds)) {
                $courses = Course::with(['category', 'instructor'])
                    ->withCount('lessons')
                    ->whereIn('id', $recIds)
                    ->where('is_published', true)
                    ->get();

                foreach ($courses as $c) {
                    $item = $c->toArray();
                    $item['reason'] = $recReasonMap[$c->id] ?? 'Habilidad transversal recomendada para complementar tu ruta.';
                    $item['is_complementary'] = true;
                    $item['complementary_badge'] = self::COMPLEMENTARY_META[$c->id]['badge'] ?? 'Recomendación';
                    $crossCourses[] = $item;
                }
            }

            // Fallback preventivo si no hay cursos específicos
            if (empty($crossCourses)) {
                $existingIds = Course::where('learning_path_id', $lp->id)->pluck('id')->toArray();
                $fallbackCourses = Course::with(['category', 'instructor'])
                    ->withCount('lessons')
                    ->where('is_published', true)
                    ->whereNotIn('id', $existingIds)
                    ->limit(3)
                    ->get();

                foreach ($fallbackCourses as $c) {
                    $item = $c->toArray();
                    $item['reason'] = 'Habilidad transversal recomendada por el equipo docente para complementar tu perfil.';
                    $item['is_complementary'] = true;
                    $item['complementary_badge'] = 'Recomendado';
                    $crossCourses[] = $item;
                }
            }

            $data['complementary_courses'] = $crossCourses;

            return $data;
        });

        // Fusión de progreso del usuario por hito y curso en vivo
        if ($user = $request->user('jwt') ?: $request->user('sanctum')) {
            $userEnrollments = $user->enrollments()->get()->keyBy('course_id');
            $totalLevels = count($path['levels'] ?? []);
            $completedLevels = 0;

            if (isset($path['levels']) && is_array($path['levels'])) {
                foreach ($path['levels'] as &$lvl) {
                    $primaryProgress = 0;
                    $primaryCompleted = false;

                    if (isset($lvl['courses']) && is_array($lvl['courses'])) {
                        foreach ($lvl['courses'] as &$c) {
                            $cid = (int) $c['id'];
                            $enr = $userEnrollments->get($cid);
                            $cProg = $enr ? (int) $enr->progress_percent : 0;
                            $cDone = $cProg >= 100 || ($enr && $enr->completed_at !== null);

                            $c['enrolled'] = (bool) $enr;
                            $c['progress_percent'] = $cProg;
                            $c['completed'] = $cDone;

                            if (!empty($c['is_primary'])) {
                                $primaryProgress = $cProg;
                                $primaryCompleted = $cDone;
                            }
                        }
                        unset($c);
                    }

                    $lvl['progress_percent'] = $primaryProgress;
                    $lvl['completed'] = $primaryCompleted;
                    if ($primaryCompleted) {
                        $completedLevels++;
                    }
                }
                unset($lvl);
            }

            $path['user_progress_percent'] = $totalLevels > 0 ? (int) round(($completedLevels / $totalLevels) * 100) : 0;
            $path['completed_levels_count'] = $completedLevels;
            $path['total_levels_count'] = $totalLevels;
        }

        return response()->json($path);
    }
}
