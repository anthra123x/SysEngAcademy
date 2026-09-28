<?php

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

echo "=== Iniciando Enriquecimiento Maestro del Currículum (SysEng Academy) ===\n";

DB::beginTransaction();

try {
    // =========================================================================
    // 1. EXTENDER HITOS (NIVELES) EN LAS 9 RUTAS DE APRENDIZAJE
    // =========================================================================
    $hitosToAdd = [
        'fundamentos-programacion' => [
            'order' => 4,
            'title' => 'Nivel 4 — Clean Code, Refactorización y Proyecto de Consola',
            'description' => 'Aplica los principios de Robert C. Martin (Clean Code) y Martin Fowler: nombres expresivos, funciones pequeñas y desarrollo de un proyecto integrador sin dependencias.',
        ],
        'desarrollo-frontend' => [
            'order' => 4,
            'title' => 'Nivel 4 — Testing, Tipado Avanzado y Rendimiento Web',
            'description' => 'Pruebas unitarias de componentes, modelado estricto con TypeScript profesional y optimización de métricas Core Web Vitals.',
        ],
        'desarrollo-backend' => [
            'order' => 5,
            'title' => 'Nivel 5 — Arquitectura Limpia, Microservicios y Resiliencia',
            'description' => 'Separación de capas según Clean Architecture, diseño de APIs desacopladas, rate limiting y contratos seguros.',
        ],
        'desarrollo-fullstack' => [
            'order' => 4,
            'title' => 'Nivel 4 — Arquitectura de Producción y Monitoreo Cloud',
            'description' => 'Despliegue automatizado, manejo de estados distribuidos y observabilidad de punta a punta.',
        ],
        'devops' => [
            'order' => 4,
            'title' => 'Nivel 4 — Infraestructura como Código y DevSecOps',
            'description' => 'Automatización con Compose avanzado, escaneo de vulnerabilidades en imágenes y observabilidad de contenedores.',
        ],
        'git-y-control-versiones' => [
            'order' => 4,
            'title' => 'Nivel 4 — GitOps, Automatización y Trunk-Based Development',
            'description' => 'Hooks de Git automatizados, protección criptográfica de commits y flujos de alta velocidad en equipos de ingeniería.',
        ],
        'ingenieria-de-requerimientos' => [
            'order' => 4,
            'title' => 'Nivel 4 — Arquitectura Ágil y Domain-Driven Design (DDD)',
            'description' => 'Descubrimiento del dominio con Event Storming, Lenguaje Ubicuo y especificaciones ejecutables BDD.',
        ],
        'desarrollo-con-ia' => [
            'order' => 4,
            'title' => 'Nivel 4 — Agentes Autónomos, Model Context Protocol y LLMOps',
            'description' => 'Arquitectura de agentes con herramientas externas, MCP y evaluación cuantitativa de sistemas RAG.',
        ],
    ];

    foreach ($hitosToAdd as $pathSlug => $info) {
        $path = LearningPath::where('slug', $pathSlug)->first();
        if ($path) {
            $level = LearningPathLevel::updateOrCreate(
                ['learning_path_id' => $path->id, 'order' => $info['order']],
                ['title' => $info['title'], 'description' => $info['description']]
            );
            echo "  ✓ Hito asegurado: {$path->title} -> {$level->title}\n";
        }
    }

    // =========================================================================
    // 2. ENRIQUECER CURSOS CON MÓDULOS MULTI-NIVEL Y CODE CHALLENGES DIDÁCTICOS
    // =========================================================================

    function createDoc(string $title, string $intro, array $sections, array $keypoints = []): array {
        $blocks = [
            ['type' => 'heading', 'level' => 1, 'text' => $title],
            ['type' => 'paragraph', 'text' => $intro],
        ];

        foreach ($sections as $s) {
            if (!empty($s['title'])) {
                $blocks[] = ['type' => 'heading', 'level' => 2, 'text' => $s['title']];
            }
            if (!empty($s['text'])) {
                $blocks[] = ['type' => 'paragraph', 'text' => $s['text']];
            }
            if (!empty($s['code'])) {
                $blocks[] = ['type' => 'code', 'language' => $s['lang'] ?? 'python', 'text' => $s['code']];
            }
            if (!empty($s['list'])) {
                $blocks[] = ['type' => 'list', 'items' => $s['list']];
            }
        }

        if (!empty($keypoints)) {
            $blocks[] = ['type' => 'heading', 'level' => 3, 'text' => 'Puntos Clave y Buenas Prácticas'];
            $blocks[] = ['type' => 'list', 'items' => $keypoints];
        }

        return ['type' => 'doc', 'blocks' => $blocks];
    }

    $curriculumExtensions = [
        // ---------------------------------------------------------------------
        // 1. DISEÑO MODULAR, INTERFACES Y CONTRATOS (POO)
        // ---------------------------------------------------------------------
        'diseno-modular-interfaces' => [
            'modules' => [
                [
                    'title' => 'Módulo 1: Contratos y Desacoplamiento de Software',
                    'description' => 'Aprende a programar hacia interfaces y no hacia implementaciones concretas (GoF & Clean Code).',
                    'lessons' => [
                        [
                            'title' => 'Contratos de Software con Interfaces vs Clases Abstractas',
                            'type' => 'article',
                            'duration' => 14,
                            'content' => createDoc(
                                'Contratos de Software con Interfaces vs Clases Abstractas',
                                'En la ingeniería de software profesional, acoplarse a clases concretas es la causa #1 de código frágil. Una interfaz define un contrato público inmutable que cualquier clase puede satisfacer.',
                                [
                                    ['title' => 'El Principio de Segregación de Interfaces (ISP)', 'text' => 'Como enseña Robert C. Martin en Clean Code: "Ningún cliente debe ser forzado a depender de métodos que no utiliza". Las interfaces deben ser pequeñas y enfocadas en una sola responsabilidad.'],
                                    ['title' => 'Ejemplo Didáctico en Python', 'lang' => 'python', 'code' => "from abc import ABC, abstractmethod\n\nclass Notificador(ABC):\n    @abstractmethod\n    def enviar(self, destinatario: str, mensaje: str) -> bool:\n        pass\n\nclass EmailNotificador(Notificador):\n    def enviar(self, destinatario: str, mensaje: str) -> bool:\n        print(f\"Enviando email a {destinatario}: {mensaje}\")\n        return True\n"],
                                ],
                                ['Las interfaces definen el QUÉ, no el CÓMO', 'Facilitan enormemente la creación de dobles de prueba (Mocks)', 'Permiten intercambiar implementaciones sin romper el cliente']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Pasarela de Pago Polimórfica',
                            'type' => 'code_challenge',
                            'duration' => 25,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Pasarela de Pago Polimórfica',
                                'Tu misión es implementar una arquitectura de pagos desacoplada. Diseña la interfaz IPago y dos implementaciones (PagoTarjeta y PagoCrypto) que calculen la comisión correspondiente.',
                                [
                                    ['title' => 'Reglas del Reto', 'list' => [
                                        'PagoTarjeta: cobra el monto + 3% de comisión',
                                        'PagoCrypto: cobra el monto + $1.50 de tarifa fija de red',
                                        'Ambas deben implementar el método procesar(monto: float) -> float retornando el total cobrado redondeado a 2 decimales.'
                                    ]]
                                ]
                            ),
                            'starter_code' => "# === RETO DIDÁCTICO: PASARELA POLIMÓRFICA ===\nfrom abc import ABC, abstractmethod\n\nclass IPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> float:\n        pass\n\nclass PagoTarjeta(IPago):\n    def procesar(self, monto: float) -> float:\n        # TODO: Implementar (monto + 3%)\n        pass\n\nclass PagoCrypto(IPago):\n    def procesar(self, monto: float) -> float:\n        # TODO: Implementar (monto + 1.50)\n        pass\n",
                            'solution' => "from abc import ABC, abstractmethod\n\nclass IPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> float:\n        pass\n\nclass PagoTarjeta(IPago):\n    def procesar(self, monto: float) -> float:\n        return round(monto * 1.03, 2)\n\nclass PagoCrypto(IPago):\n    def procesar(self, monto: float) -> float:\n        return round(monto + 1.50, 2)\n",
                            'test_cases' => [
                                ['input' => 'PagoTarjeta().procesar(100.0)', 'expected' => '103.0'],
                                ['input' => 'PagoCrypto().procesar(100.0)', 'expected' => '101.5'],
                            ],
                            'hint' => 'Multiplica por 1.03 para el 3% adicional y suma 1.50 para la tarifa fija.',
                        ],
                    ]
                ],
                [
                    'title' => 'Módulo 2: Inversión de Control e Inyección de Dependencias',
                    'description' => 'Aplica el principio DIP para construir arquitecturas limpias y altamente testeables.',
                    'lessons' => [
                        [
                            'title' => 'Inyección de Dependencias a través de Constructores',
                            'type' => 'article',
                            'duration' => 15,
                            'content' => createDoc(
                                'Inyección de Dependencias a través de Constructores',
                                'No uses `new Servicio()` dentro de tus clases de negocio. Pasa las dependencias por parámetro en el constructor para mantener la clase pura y desacoplada del entorno exterior.',
                                [
                                    ['title' => 'Por qué nunca instanciar directamente', 'text' => 'Cuando una clase hace `this.logger = new FileLogger()`, queda permanentemente amarrada al sistema de archivos local, impidiendo testearla en memoria o cambiar a un logger cloud.'],
                                ],
                                ['Favorece la inyección por constructor sobre la inyección por método o propiedad', 'Mantiene las clases abiertas a la extensión pero cerradas a la modificación (OCP)']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Servicio de Facturación Desacoplado',
                            'type' => 'code_challenge',
                            'duration' => 25,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Facturador con Notificador Inyectado',
                                'Construye la clase Facturador que reciba cualquier Notificador por constructor y emita el recibo formateado.',
                                [
                                    ['title' => 'Requisitos', 'list' => [
                                        'La clase Facturador recibe un notificador en __init__',
                                        'El método emitir(cliente, total) debe llamar a notificador.notificar(cliente, total) y retornar el string de confirmación'
                                    ]]
                                ]
                            ),
                            'starter_code' => "class Facturador:\n    def __init__(self, notificador):\n        # TODO: guardar dependencia\n        pass\n\n    def emitir(self, cliente: str, total: float) -> str:\n        # TODO: delegar al notificador y retornar confirmacion\n        pass\n",
                            'solution' => "class Facturador:\n    def __init__(self, notificador):\n        self.notificador = notificador\n\n    def emitir(self, cliente: str, total: float) -> str:\n        return self.notificador.notificar(cliente, total)\n",
                            'test_cases' => [
                                ['input' => 'class MockN: notificar = lambda s, c, t: f"OK:{c}:{t}"; Facturador(MockN()).emitir("Carlos", 50.0)', 'expected' => 'OK:Carlos:50.0'],
                            ],
                            'hint' => 'Guarda self.notificador y delega la llamada a self.notificador.notificar().',
                        ]
                    ]
                ]
            ]
        ],

        // ---------------------------------------------------------------------
        // 2. PROTOCOLO HTTP Y ARQUITECTURA WEB (BACKEND)
        // ---------------------------------------------------------------------
        'arquitectura-web-http' => [
            'modules' => [
                [
                    'title' => 'Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP',
                    'description' => 'Aprende los fundamentos del protocolo que sostiene la web moderna: métodos idempotentes, cabeceras y negociación de contenido.',
                    'lessons' => [
                        [
                            'title' => 'Anatomía de una Petición HTTP y Métodos Idempotentes',
                            'type' => 'article',
                            'duration' => 15,
                            'content' => createDoc(
                                'Anatomía de una Petición HTTP y Métodos Idempotentes',
                                'Una petición HTTP consta de línea de inicio (Método + URI + Versión), cabeceras clave-valor y cuerpo opcional. Comprender la idempotencia es vital para construir APIs robustas.',
                                [
                                    ['title' => 'Idempotencia: La regla de oro', 'text' => 'Una operación es idempotente si ejecutarla N veces produce el mismo estado en el servidor que ejecutarla una sola vez. GET, PUT, DELETE son idempotentes; POST NO lo es.'],
                                ],
                                ['GET nunca debe mutar estado en el servidor', 'PUT reemplaza por completo el recurso; PATCH actualiza parcialmente', 'POST se reserva para operaciones no idempotentes (creación)']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Parser y Validador de Headers HTTP',
                            'type' => 'code_challenge',
                            'duration' => 20,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Extractor Seguro de Token Bearer',
                                'En muchas APIs los clientes envían cabeceras mal formadas. Escribe una función pura `extraer_bearer_token(headers: dict) -> str | None` que valide que la cabecera Authorization exista y comience exactamente con "Bearer ".',
                                [
                                    ['title' => 'Requisitos', 'list' => [
                                        'Si headers tiene "Authorization" o "authorization" con "Bearer <token>", retorna el token limpio sin espacios',
                                        'Si no existe o no tiene el prefijo "Bearer ", retorna None'
                                    ]]
                                ]
                            ),
                            'starter_code' => "def extraer_bearer_token(headers: dict) -> str | None:\n    # TODO: Implementar búsqueda case-insensitive y extracción del token\n    pass\n",
                            'solution' => "def extraer_bearer_token(headers: dict) -> str | None:\n    auth = None\n    for k, v in headers.items():\n        if k.lower() == 'authorization':\n            auth = v.strip()\n            break\n    if auth and auth.startswith('Bearer '):\n        token = auth[7:].strip()\n        return token if token else None\n    return None\n",
                            'test_cases' => [
                                ['input' => 'extraer_bearer_token({"Authorization": "Bearer token_xyz_123"})', 'expected' => 'token_xyz_123'],
                                ['input' => 'extraer_bearer_token({"authorization": "Basic user:pass"})', 'expected' => 'None'],
                                ['input' => 'extraer_bearer_token({"Content-Type": "application/json"})', 'expected' => 'None'],
                            ],
                            'hint' => 'Revisa headers.items() convirtiendo la clave a minúsculas y verifica que empiece con "Bearer ".',
                        ]
                    ]
                ],
                [
                    'title' => 'Módulo 2: Códigos de Estado y Manejo Semántico de Errores',
                    'description' => 'Aprende a comunicar el estado exacto de una operación sin ambigüedades.',
                    'lessons' => [
                        [
                            'title' => 'Códigos de Estado: 2xx, 4xx y 5xx en la Práctica',
                            'type' => 'article',
                            'duration' => 14,
                            'content' => createDoc(
                                'Códigos de Estado Semánticos',
                                'Nunca devuelvas HTTP 200 OK con un `{ "error": true }` en el cuerpo. Los clientes, proxies y gateways dependen del status code real para tomar decisiones de reintento y caché.',
                                [
                                    ['title' => 'Los Códigos Fundamentales', 'list' => [
                                        '200 OK: Solicitud completada exitosamente',
                                        '201 Created: Nuevo recurso creado (incluir cabecera Location)',
                                        '204 No Content: Éxito sin cuerpo de respuesta (ej: DELETE)',
                                        '400 Bad Request: Sintaxis o parámetros inválidos',
                                        '401 Unauthorized: Falta autenticación o token inválido',
                                        '403 Forbidden: Autenticado pero sin permisos para este recurso',
                                        '404 Not Found: El recurso solicitado no existe',
                                        '422 Unprocessable Entity: Error de validación de reglas de negocio',
                                        '500 Internal Server Error: Fallo inesperado en el servidor'
                                    ]]
                                ]
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Despachador de Status Code REST',
                            'type' => 'code_challenge',
                            'duration' => 20,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Clasificador de Respuestas HTTP',
                                'Escribe una función `determinar_status(accion: str, encontrado: bool, valido: bool) -> int` que retorne el código de estado HTTP correcto según la situación.',
                                [
                                    ['title' => 'Reglas', 'list' => [
                                        'Si encontrado es False -> retorna 404',
                                        'Si valido es False -> retorna 422',
                                        'Si accion es "crear" -> retorna 201',
                                        'Si accion es "eliminar" -> retorna 204',
                                        'Cualquier otro caso exitoso -> retorna 200'
                                    ]]
                                ]
                            ),
                            'starter_code' => "def determinar_status(accion: str, encontrado: bool, valido: bool) -> int:\n    # TODO: implementar la logica semantica\n    pass\n",
                            'solution' => "def determinar_status(accion: str, encontrado: bool, valido: bool) -> int:\n    if not encontrado:\n        return 404\n    if not valido:\n        return 422\n    if accion == 'crear':\n        return 201\n    if accion == 'eliminar':\n        return 204\n    return 200\n",
                            'test_cases' => [
                                ['input' => 'determinar_status("crear", True, True)', 'expected' => '201'],
                                ['input' => 'determinar_status("consultar", False, True)', 'expected' => '404'],
                                ['input' => 'determinar_status("actualizar", True, False)', 'expected' => '422'],
                                ['input' => 'determinar_status("eliminar", True, True)', 'expected' => '204'],
                            ],
                            'hint' => 'Aplica las comprobaciones en orden: no encontrado (404), inválido (422), crear (201), eliminar (204).',
                        ]
                    ]
                ]
            ]
        ],

        // ---------------------------------------------------------------------
        // 3. TYPESCRIPT PROFESIONAL PARA FRONTEND (FRONTEND)
        // ---------------------------------------------------------------------
        'typescript-profesional-frontend' => [
            'modules' => [
                [
                    'title' => 'Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime',
                    'description' => 'Domina el tipado de TypeScript para prevenir bugs antes de ejecutar el código.',
                    'lessons' => [
                        [
                            'title' => 'Genéricos Reutilizables y Narrowing de Tipos',
                            'type' => 'article',
                            'duration' => 15,
                            'content' => createDoc(
                                'Genéricos Reutilizables en TypeScript',
                                'Los genéricos permiten escribir componentes y funciones que funcionan con múltiples tipos sin perder la seguridad en tiempo de compilación. Son la base de los clientes HTTP modernos.',
                                [
                                    ['title' => 'Ejemplo de Wrapper de Respuesta', 'lang' => 'typescript', 'code' => "interface ApiResponse<T> {\n  data: T;\n  status: number;\n  timestamp: string;\n}\n\nfunction envolver<T>(payload: T, status = 200): ApiResponse<T> {\n  return { data: payload, status, timestamp: new Date().toISOString() };\n}\n"],
                                ],
                                ['Evita usar `any`; prefiere `unknown` si el tipo es verdaderamente desconocido', 'Usa type guards (`is`) para verificar estructuras en tiempo de ejecución']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Filtro Genérico Fuertemente Tipado',
                            'type' => 'code_challenge',
                            'duration' => 20,
                            'language' => 'typescript',
                            'content' => createDoc(
                                'Reto: Función de Filtrado por Propiedad',
                                'Crea una función genérica `filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[]` que filtre de forma segura colecciones de objetos.',
                                [
                                    ['title' => 'Requisitos', 'list' => [
                                        'La función debe retornar solo los elementos donde item[clave] === valor',
                                        'No debe mutar el arreglo original'
                                    ]]
                                ]
                            ),
                            'starter_code' => "function filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[] {\n  // TODO: Implementar filtrado inmutable\n  return [];\n}\n",
                            'solution' => "function filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[] {\n  return items.filter(item => item[clave] === valor);\n}\n",
                            'test_cases' => [
                                ['input' => 'JSON.stringify(filtrarPorPropiedad([{id:1,rol:"admin"},{id:2,rol:"dev"}], "rol", "admin"))', 'expected' => '[{"id":1,"rol":"admin"}]'],
                            ],
                            'hint' => 'Usa el método items.filter() comparando item[clave] === valor.',
                        ]
                    ]
                ],
                [
                    'title' => 'Módulo 2: Uniones Discriminadas y Pattern Matching',
                    'description' => 'Estructura estados de UI que hacen que los estados imposibles sean imposibles de representar.',
                    'lessons' => [
                        [
                            'title' => 'Uniones Discriminadas para Estados de Interfaz',
                            'type' => 'article',
                            'duration' => 14,
                            'content' => createDoc(
                                'Hacer Estados Imposibles Irrepresentables',
                                'En lugar de tener `{ loading: boolean, error: string | null, data: T | null }`, una unión discriminada define explícitamente cada estado válido con una propiedad tag común.',
                                [
                                    ['title' => 'Modelado Elegante', 'lang' => 'typescript', 'code' => "type AsyncState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; message: string };\n"],
                                ],
                                ['TypeScript infiere automáticamente las propiedades dentro de cada bloque switch/case', 'Elimina flags booleanos redundantes']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Reductor de Estado con Unión Discriminada',
                            'type' => 'code_challenge',
                            'duration' => 22,
                            'language' => 'typescript',
                            'content' => createDoc(
                                'Reto: Extractor de Mensaje de Estado',
                                'Escribe una función `obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string` que formatee el mensaje según el estado.',
                                [
                                    ['title' => 'Comportamiento', 'list' => [
                                        'Si status === "cargando" -> "Cargando recursos..."',
                                        'Si status === "exito" -> `Datos recibidos: ${estado.data}`',
                                        'Si status === "error" -> `Error crítico: ${estado.error}`',
                                        'Cualquier otro -> "Estado desconocido"'
                                    ]]
                                ]
                            ),
                            'starter_code' => "function obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string {\n  // TODO: implementar pattern matching\n  return '';\n}\n",
                            'solution' => "function obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string {\n  switch (estado.status) {\n    case 'cargando': return 'Cargando recursos...';\n    case 'exito': return `Datos recibidos: \\\${estado.data}`;\n    case 'error': return `Error crítico: \\\${estado.error}`;\n    default: return 'Estado desconocido';\n  }\n}\n",
                            'test_cases' => [
                                ['input' => 'obtenerMensajeEstado({status: "cargando"})', 'expected' => 'Cargando recursos...'],
                                ['input' => 'obtenerMensajeEstado({status: "exito", data: 42})', 'expected' => 'Datos recibidos: 42'],
                                ['input' => 'obtenerMensajeEstado({status: "error", error: "404"})', 'expected' => 'Error crítico: 404'],
                            ],
                            'hint' => 'Usa una sentencia switch evaluando estado.status.',
                        ]
                    ]
                ]
            ]
        ],

        // ---------------------------------------------------------------------
        // 4. RAG Y BASES DE DATOS VECTORIALES (IA)
        // ---------------------------------------------------------------------
        'rag-embeddings-bases-vectoriales' => [
            'modules' => [
                [
                    'title' => 'Módulo 1: Fundamentos de Embeddings y Segmentación de Texto',
                    'description' => 'Aprende a transformar texto técnico en representaciones numéricas de alta dimensión.',
                    'lessons' => [
                        [
                            'title' => 'Qué es un Embedding y Estrategias de Chunking',
                            'type' => 'article',
                            'duration' => 16,
                            'content' => createDoc(
                                'Qué es un Embedding y Estrategias de Chunking',
                                'Los modelos de lenguaje no leen palabras como los humanos; las procesan como vectores en un espacio multidimensional donde conceptos semánticamente afines quedan cerca entre sí.',
                                [
                                    ['title' => 'Chunking Inteligente', 'text' => 'Dividir un libro o documentación técnica por párrafos o tokens con un porcentaje de solapamiento (overlap del 10-15%) evita que una idea quede truncada entre dos fragmentos.'],
                                ],
                                ['El tamaño del chunk afecta la precisión: chunks muy grandes diluyen la semántica', 'El solapamiento mantiene el hilo conductor']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Algoritmo de Chunking con Solapamiento',
                            'type' => 'code_challenge',
                            'duration' => 25,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Segmentador de Documentos RAG',
                                'Escribe una función `chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]` que divida un texto en palabras con el solapamiento especificado.',
                                [
                                    ['title' => 'Requisitos', 'list' => [
                                        'Divide el texto en palabras separadas por espacios',
                                        'Cada chunk debe contener hasta `tamano` palabras',
                                        'El siguiente chunk comienza `tamano - solapamiento` palabras después del inicio del anterior',
                                        'Retorna la lista de chunks como cadenas unidas por espacios'
                                    ]]
                                ]
                            ),
                            'starter_code' => "def chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]:\n    # TODO: implementar segmentacion con overlap\n    pass\n",
                            'solution' => "def chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]:\n    palabras = texto.split()\n    if not palabras:\n        return []\n    paso = max(1, tamano - solapamiento)\n    chunks = []\n    for i in range(0, len(palabras), paso):\n        fragmento = palabras[i:i + tamano]\n        chunks.append(' '.join(fragmento))\n        if i + tamano >= len(palabras):\n            break\n    return chunks\n",
                            'test_cases' => [
                                ['input' => 'chunk_texto("uno dos tres cuatro cinco seis siete", 4, 1)', 'expected' => "['uno dos tres cuatro', 'cuatro cinco seis siete']"],
                            ],
                            'hint' => 'Calcula el paso como tamano - solapamiento y usa rebanadas de lista palabras[i:i+tamano].',
                        ]
                    ]
                ],
                [
                    'title' => 'Módulo 2: Búsqueda Semántica con Similitud Coseno',
                    'description' => 'Construye el motor de recuperación que conecta tus documentos con el LLM.',
                    'lessons' => [
                        [
                            'title' => 'Similitud Coseno vs Distancia Euclidiana',
                            'type' => 'article',
                            'duration' => 15,
                            'content' => createDoc(
                                'Similitud Coseno en Espacios Vectoriales',
                                'La similitud coseno mide el ángulo entre dos vectores normalizados, ignorando su magnitud. Es la métrica estándar en búsqueda semántica de documentos técnicos.',
                                [
                                    ['title' => 'Fórmula Matemática', 'text' => 'cos(θ) = (A · B) / (||A|| * ||B||). Un valor de 1.0 significa significado idéntico; 0.0 significa ortogonalidad/sin relación.'],
                                ],
                                ['La similitud coseno es invariante a la longitud del vector', 'Permite encontrar sinónimos y conceptos afines sin coincidencias exactas de palabras']
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Buscador Semántico Top-K',
                            'type' => 'code_challenge',
                            'duration' => 25,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Recuperador Top-1 por Similitud Coseno',
                                'Escribe una función `buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str` que calcule el producto punto (asumiendo vectores ya normalizados) y retorne el texto del documento más afín.',
                                [
                                    ['title' => 'Estructura de documentos', 'text' => 'Cada documento es un dict: `{"texto": str, "vector": list[float]}`. Retorna el texto con el mayor producto punto.']
                                ]
                            ),
                            'starter_code' => "def buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str:\n    # TODO: calcular producto punto suma(a * b) y encontrar el mejor\n    pass\n",
                            'solution' => "def buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str:\n    mejor_score = -float('inf')\n    mejor_texto = ''\n    for doc in documentos:\n        score = sum(a * b for a, b in zip(vector_consulta, doc['vector']))\n        if score > mejor_score:\n            mejor_score = score\n            mejor_texto = doc['texto']\n    return mejor_texto\n",
                            'test_cases' => [
                                ['input' => 'buscar_mas_similar([1.0, 0.0], [{"texto": "Doc A", "vector": [0.2, 0.9]}, {"texto": "Doc B", "vector": [0.95, 0.1]}])', 'expected' => 'Doc B'],
                            ],
                            'hint' => 'Usa sum(a * b for a, b in zip(vector_consulta, doc["vector"])) para el producto punto.',
                        ]
                    ]
                ]
            ]
        ],

        // ---------------------------------------------------------------------
        // 5. DOCKER COMPOSE Y ARQUITECTURAS MULTISERVICIO (DEVOPS)
        // ---------------------------------------------------------------------
        'docker-compose-multiservicio' => [
            'modules' => [
                [
                    'title' => 'Módulo 1: Orquestación Local y Redes Aisladas',
                    'description' => 'Define entornos reproducibles de backend, base de datos y caché con compose.yaml.',
                    'lessons' => [
                        [
                            'title' => 'Estructura Limpia de un Archivo Compose',
                            'type' => 'article',
                            'duration' => 15,
                            'content' => createDoc(
                                'Estructura Limpia de Compose',
                                'Un compose.yaml profesional no expone puertos innecesarios al host. Usa redes bridge privadas para que los contenedores se comuniquen por nombre de servicio (DNS interno de Docker).',
                                [
                                    ['title' => 'Reglas de Producción', 'list' => [
                                        'Nunca hardcodear contraseñas en compose.yaml; usar archivos .env',
                                        'Usar volúmenes nombrados para persistencia de bases de datos',
                                        'Definir healthchecks en la BD antes de levantar el backend'
                                    ]]
                                ]
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Generador de String de Conexión Docker',
                            'type' => 'code_challenge',
                            'duration' => 20,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Validador de URL de Conexión Interna',
                                'Escribe una función `construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str` que ensamble de forma segura el DSN sin exponer errores.',
                                [
                                    ['title' => 'Formato', 'text' => '"{driver}://{usuario}:{password}@{host}:{puerto}/{db}"']
                                ]
                            ),
                            'starter_code' => "def construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str:\n    # TODO: ensamblar DSN\n    pass\n",
                            'solution' => "def construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str:\n    return f\"{driver}://{usuario}:{password}@{host}:{puerto}/{db}\"\n",
                            'test_cases' => [
                                ['input' => 'construir_url_db("postgresql", "app_user", "sec123", "db_postgres", 5432, "syseng_prod")', 'expected' => 'postgresql://app_user:sec123@db_postgres:5432/syseng_prod'],
                            ],
                            'hint' => 'Usa f-strings de Python con los nombres de variables correspondientes.',
                        ]
                    ]
                ],
                [
                    'title' => 'Módulo 2: Optimización con Multi-stage Builds',
                    'description' => 'Reduce el tamaño de tus imágenes de producción hasta en un 80% usando constructores temporales.',
                    'lessons' => [
                        [
                            'title' => 'El Patrón Multi-stage Build',
                            'type' => 'article',
                            'duration' => 14,
                            'content' => createDoc(
                                'Patrón Multi-stage Build',
                                'En un solo Dockerfile puedes tener múltiples instrucciones `FROM`. La primera etapa instala compiladores y dependencias pesadas; la segunda etapa solo copia los artefactos finales (dist/) a una imagen alpine limpia.',
                                [
                                    ['title' => 'Ventajas de Seguridad y Despliegue', 'list' => [
                                        'Imágenes finales de menos de 50MB en vez de 1.5GB',
                                        'Cero herramientas de compilación o código fuente en producción',
                                        'Menor superficie de ataque frente a vulnerabilidades CVE'
                                    ]]
                                ]
                            )
                        ],
                        [
                            'title' => 'Reto Práctico: Estimador de Ahorro Multi-stage',
                            'type' => 'code_challenge',
                            'duration' => 18,
                            'language' => 'python',
                            'content' => createDoc(
                                'Reto: Calculadora de Reducción de Tamaño',
                                'Escribe una función `calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str` que calcule el porcentaje de reducción redondeado a 1 decimal.',
                                [
                                    ['title' => 'Fórmula y Formato', 'text' => 'Reducción = ((dev - prod) / dev) * 100. Formato retornado: "Reducción del X.X%"']
                                ]
                            ),
                            'starter_code' => "def calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str:\n    # TODO: calcular porcentaje y formatear\n    pass\n",
                            'solution' => "def calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str:\n    porcentaje = ((tamano_dev_mb - tamano_prod_mb) / tamano_dev_mb) * 100\n    return f\"Reducción del {round(porcentaje, 1)}%\"\n",
                            'test_cases' => [
                                ['input' => 'calcular_ahorro_imagen(1200.0, 60.0)', 'expected' => 'Reducción del 95.0%'],
                                ['input' => 'calcular_ahorro_imagen(500.0, 100.0)', 'expected' => 'Reducción del 80.0%'],
                            ],
                            'hint' => 'Aplica la fórmula ((dev - prod) / dev) * 100 y usa round(porcentaje, 1).',
                        ]
                    ]
                ]
            ]
        ],
    ];

    foreach ($curriculumExtensions as $courseSlug => $extData) {
        $course = Course::where('slug', $courseSlug)->first();
        if (!$course) {
            echo "  ! Curso no encontrado para enriquecer: {$courseSlug}\n";
            continue;
        }

        echo "  -> Enriqueciendo curso: {$course->title} ({$courseSlug})\n";

        foreach ($extData['modules'] as $mIdx => $mInfo) {
            $module = Module::updateOrCreate(
                ['course_id' => $course->id, 'order' => $mIdx + 1],
                [
                    'title' => $mInfo['title'],
                    'description' => $mInfo['description'] ?? null,
                ]
            );

            foreach ($mInfo['lessons'] as $lIdx => $lInfo) {
                $lessonSlug = "{$course->slug}-" . \Illuminate\Support\Str::slug($lInfo['title']);
                $lesson = Lesson::updateOrCreate(
                    ['slug' => $lessonSlug],
                    [
                        'module_id' => $module->id,
                        'title' => $lInfo['title'],
                        'order' => $lIdx + 1,
                        'type' => $lInfo['type'],
                        'duration_minutes' => $lInfo['duration'],
                        'is_preview' => ($mIdx === 0 && $lIdx === 0),
                        'content' => $lInfo['content'],
                        'language' => $lInfo['language'] ?? null,
                        'starter_code' => $lInfo['starter_code'] ?? null,
                        'solution' => $lInfo['solution'] ?? null,
                        'test_cases' => $lInfo['test_cases'] ?? null,
                        'hint' => $lInfo['hint'] ?? null,
                    ]
                );
                echo "     * Lección guardada [{$lesson->type}]: {$lesson->title}\n";
            }
        }
    }

    DB::commit();
    Cache::flush();
    echo "\n=== Enriquecimiento de Base de Datos completado con éxito! ===\n";

} catch (\Throwable $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
