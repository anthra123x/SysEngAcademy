<?php

require __DIR__ . '/../../vendor/autoload.php';

$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

function createDoc(string $title, string $intro, array $sections = []): string {
    $out = "### {$title}\n\n{$intro}\n\n";
    foreach ($sections as $s) {
        $out .= "#### {$s['title']}\n\n";
        if (isset($s['text'])) $out .= "{$s['text']}\n\n";
        if (isset($s['list'])) {
            foreach ($s['list'] as $li) $out .= "- {$li}\n";
            $out .= "\n";
        }
        if (isset($s['code'])) {
            $lang = $s['lang'] ?? '';
            $out .= "```{$lang}\n{$s['code']}\n```\n\n";
        }
    }
    return $out;
}

echo "=== Enriqueciendo Cursos Secundarios con Retos Didácticos ===\n";

DB::beginTransaction();

try {
    // 1. backend-introduccion: Agregar retos prácticos en módulo 1 y 2
    $cBackendIntro = Course::where('slug', 'backend-introduccion')->first();
    if ($cBackendIntro) {
        $m1 = Module::where('course_id', $cBackendIntro->id)->where('order', 1)->first();
        if ($m1) {
            $lesson = Lesson::updateOrCreate(
                ['slug' => 'backend-introduccion-reto-validador-http'],
                [
                    'module_id' => $m1->id,
                    'title' => 'Reto Práctico: Validador de Métodos y Verbos HTTP',
                    'order' => 4,
                    'type' => 'code_challenge',
                    'duration_minutes' => 15,
                    'is_preview' => false,
                    'language' => 'python',
                    'content' => createDoc(
                        'Reto: Validación de Solicitudes HTTP en el Servidor',
                        'En todo servidor backend, la primera línea de defensa antes de procesar una petición es comprobar que el método HTTP recibido sea compatible con la ruta solicitada.',
                        [
                            ['title' => 'Especificación del Reto', 'text' => 'Escribe una función `es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool` que valide si un verbo HTTP es aceptado. Debe ser insensible a mayúsculas/minúsculas y descartar espacios en blanco.'],
                            ['title' => 'Reglas', 'list' => [
                                'Convierte el método recibido a mayúsculas limpias sin espacios.',
                                'Compara contra la lista de métodos permitidos (también normalizados en mayúsculas).',
                                'Retorna True si es válido, False de lo contrario.'
                            ]]
                        ]
                    ),
                    'starter_code' => "def es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool:\n    # TODO: implementar validacion normalizada\n    pass\n",
                    'solution' => "def es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool:\n    m = metodo.strip().upper()\n    permitidos = [p.strip().upper() for p in metodos_permitidos]\n    return m in permitidos\n",
                    'test_cases' => [
                        ['input' => 'es_metodo_permitido("get", ["GET", "POST"])', 'expected' => 'True'],
                        ['input' => 'es_metodo_permitido("DELETE", ["GET", "POST"])', 'expected' => 'False'],
                        ['input' => 'es_metodo_permitido(" post ", ["GET", "POST"])', 'expected' => 'True'],
                    ],
                    'hint' => 'Usa metodo.strip().upper() y comprueba pertenencia con el operador `in`.',
                ]
            );
            echo "  ✓ Guardado: {$lesson->title}\n";
        }

        $m2 = Module::where('course_id', $cBackendIntro->id)->where('order', 2)->first();
        if ($m2) {
            $lesson = Lesson::updateOrCreate(
                ['slug' => 'backend-introduccion-reto-enrutador-basico'],
                [
                    'module_id' => $m2->id,
                    'title' => 'Reto Práctico: Despachador de Rutas REST',
                    'order' => 4,
                    'type' => 'code_challenge',
                    'duration_minutes' => 18,
                    'is_preview' => false,
                    'language' => 'python',
                    'content' => createDoc(
                        'Reto: Enrutador Básico de Peticiones',
                        'Los frameworks web como Laravel, Express o FastAPI utilizan una tabla de rutas para dirigir las peticiones al controlador adecuado.',
                        [
                            ['title' => 'Objetivo', 'text' => 'Escribe una función `resolver_ruta(rutas: dict, metodo: str, path: str) -> str` que busque en un diccionario `{ "METODO PATH": "Controlador@metodo" }` y retorne el controlador correspondiente o `"404 Not Found"`.']
                        ]
                    ),
                    'starter_code' => "def resolver_ruta(rutas: dict, metodo: str, path: str) -> str:\n    # TODO: buscar la clave \"{metodo.upper()} {path}\" en rutas\n    pass\n",
                    'solution' => "def resolver_ruta(rutas: dict, metodo: str, path: str) -> str:\n    clave = f\"{metodo.strip().upper()} {path.strip()}\"\n    return rutas.get(clave, \"404 Not Found\")\n",
                    'test_cases' => [
                        ['input' => 'resolver_ruta({"GET /usuarios": "UserController@index"}, "GET", "/usuarios")', 'expected' => 'UserController@index'],
                        ['input' => 'resolver_ruta({"POST /login": "AuthController@login"}, "POST", "/login")', 'expected' => 'AuthController@login'],
                        ['input' => 'resolver_ruta({"GET /items": "ItemController@all"}, "DELETE", "/items")', 'expected' => '404 Not Found'],
                    ],
                    'hint' => 'Construye la clave f"{metodo.strip().upper()} {path.strip()}" y usa rutas.get(clave, "404 Not Found").',
                ]
            );
            echo "  ✓ Guardado: {$lesson->title}\n";
        }
    }

    // 2. modelos-relaciones-y-consultas: Agregar retos de filtrado y agregación
    $cModelos = Course::where('slug', 'modelos-relaciones-y-consultas')->first();
    if ($cModelos) {
        $m1 = Module::where('course_id', $cModelos->id)->where('order', 1)->first();
        if ($m1) {
            $lesson = Lesson::updateOrCreate(
                ['slug' => 'modelos-relaciones-reto-filtrado-relacional'],
                [
                    'module_id' => $m1->id,
                    'title' => 'Reto Práctico: Simulación de Eager Loading y Filtrado Relacional',
                    'order' => 4,
                    'type' => 'code_challenge',
                    'duration_minutes' => 20,
                    'is_preview' => false,
                    'language' => 'python',
                    'content' => createDoc(
                        'Reto: Evitar el Problema N+1 en Memoria',
                        'El problema N+1 ocurre cuando consultamos N registros y luego ejecutamos N consultas adicionales para traer sus relaciones.',
                        [
                            ['title' => 'Misión', 'text' => 'Dada una lista de usuarios y una lista de posts con clave `usuario_id`, escribe `unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]` que agrupe todos los posts en un campo `posts` en cada usuario en tiempo lineal O(N+M) usando un mapa auxiliar.']
                        ]
                    ),
                    'starter_code' => "def unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]:\n    # TODO: agrupar posts por usuario_id y asignarlos a cada usuario\n    pass\n",
                    'solution' => "def unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]:\n    mapa_posts = {}\n    for p in posts:\n        uid = p.get('usuario_id')\n        if uid not in mapa_posts:\n            mapa_posts[uid] = []\n        mapa_posts[uid].append(p['titulo'])\n    \n    resultado = []\n    for u in usuarios:\n        nuevo_u = dict(u)\n        nuevo_u['posts'] = mapa_posts.get(u['id'], [])\n        resultado.append(nuevo_u)\n    return resultado\n",
                    'test_cases' => [
                        ['input' => 'unir_usuarios_con_posts([{"id": 1, "nombre": "Ana"}], [{"usuario_id": 1, "titulo": "Post 1"}, {"usuario_id": 1, "titulo": "Post 2"}])', 'expected' => '[{"id": 1, "nombre": "Ana", "posts": ["Post 1", "Post 2"]}]'],
                    ],
                    'hint' => 'Crea un diccionario donde la clave sea usuario_id y el valor sea la lista de títulos de posts.',
                ]
            );
            echo "  ✓ Guardado: {$lesson->title}\n";
        }

        $m2 = Module::where('course_id', $cModelos->id)->where('order', 2)->first();
        if ($m2) {
            $lesson = Lesson::updateOrCreate(
                ['slug' => 'modelos-relaciones-reto-calculo-agregaciones'],
                [
                    'module_id' => $m2->id,
                    'title' => 'Reto Práctico: Agregaciones Puras y Reducción de Totales',
                    'order' => 4,
                    'type' => 'code_challenge',
                    'duration_minutes' => 18,
                    'is_preview' => false,
                    'language' => 'python',
                    'content' => createDoc(
                        'Reto: Agregaciones y Métricas de Facturación',
                        'En bases de datos relacionales calculamos SUM, AVG y COUNT. En la capa de servicios a veces necesitamos realizar estas agregaciones de manera pura.',
                        [
                            ['title' => 'Objetivo', 'text' => 'Escribe una función `calcular_resumen_ventas(pedidos: list[dict]) -> dict` que retorne `{"total": float, "promedio": float, "cantidad": int}`. Si la lista está vacía, retorna total 0.0, promedio 0.0 y cantidad 0.']
                        ]
                    ),
                    'starter_code' => "def calcular_resumen_ventas(pedidos: list[dict]) -> dict:\n    # TODO: calcular metricas\n    pass\n",
                    'solution' => "def calcular_resumen_ventas(pedidos: list[dict]) -> dict:\n    if not pedidos:\n        return {'total': 0.0, 'promedio': 0.0, 'cantidad': 0}\n    cant = len(pedidos)\n    total = sum(p['monto'] for p in pedidos)\n    return {'total': round(total, 2), 'promedio': round(total / cant, 2), 'cantidad': cant}\n",
                    'test_cases' => [
                        ['input' => 'calcular_resumen_ventas([{"monto": 100.0}, {"monto": 200.0}])', 'expected' => '{"total": 300.0, "promedio": 150.0, "cantidad": 2}'],
                        ['input' => 'calcular_resumen_ventas([])', 'expected' => '{"total": 0.0, "promedio": 0.0, "cantidad": 0}'],
                    ],
                    'hint' => 'Calcula sum() de montos y divide entre len() para el promedio cuando len > 0.',
                ]
            );
            echo "  ✓ Guardado: {$lesson->title}\n";
        }
    }

    // 3. arquitectura-proyecto-poo: Módulo 2 de Patrones GoF y Refactorización
    $cArqPoo = Course::where('slug', 'arquitectura-proyecto-poo')->first();
    if ($cArqPoo) {
        $m2 = Module::updateOrCreate(
            ['course_id' => $cArqPoo->id, 'order' => 2],
            [
                'title' => 'Módulo 2: Patrones GoF y Refactorización Limpia',
                'description' => 'Aplica los principios de Martin Fowler y GoF para desacoplar componentes y extender funcionalidad sin modificar código existente.'
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'arquitectura-proyecto-poo-patron-decorator'],
            [
                'module_id' => $m2->id,
                'title' => 'El Patrón Decorator y Principio Abierto/Cerrado (OCP)',
                'order' => 1,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => false,
                'content' => createDoc(
                    'Patrón Decorator en Sistemas Reales',
                    'El patrón Decorator permite añadir responsabilidades adicionales a un objeto de forma dinámica sin recurrir a la herencia masiva.',
                    [
                        ['title' => 'Cita de The Pragmatic Programmer', 'text' => '"Diseña código que sea fácil de cambiar (ETC: Easier To Change). La composición vence a la herencia cuando los requerimientos evolucionan rápidamente."'],
                        ['title' => 'Casos de Uso Típicos', 'list' => [
                            'Logging transparente en servicios de negocio',
                            'Mecanismos de caché en repositorios de datos',
                            'Encriptación y firma de mensajes al vuelo'
                        ]]
                    ]
                )
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'arquitectura-proyecto-poo-reto-patron-decorator'],
            [
                'module_id' => $m2->id,
                'title' => 'Reto Práctico: Implementación del Patrón Decorator de Logging',
                'order' => 2,
                'type' => 'code_challenge',
                'duration_minutes' => 20,
                'is_preview' => false,
                'language' => 'python',
                'content' => createDoc(
                    'Reto: Decorator para Servicios de Mensajería',
                    'Implementa una clase `NotificadorConLog` que envuelva a cualquier objeto con método `enviar(msg: str) -> str` y agregue el prefijo `[LOG] ` antes de llamar al método interno.',
                    [
                        ['title' => 'Comportamiento esperado', 'text' => '`NotificadorConLog(servicio).enviar("hola")` debe retornar `"[LOG] " + servicio.enviar("hola")`']
                    ]
                ),
                'starter_code' => "class NotificadorConLog:\n    def __init__(self, decorado):\n        # TODO: guardar referencia\n        pass\n    def enviar(self, msg: str) -> str:\n        # TODO: envolver llamada agregando [LOG] \n        pass\n",
                'solution' => "class NotificadorConLog:\n    def __init__(self, decorado):\n        self.decorado = decorado\n    def enviar(self, msg: str) -> str:\n        return f\"[LOG] {self.decorado.enviar(msg)}\"\n",
                'test_cases' => [
                    ['input' => 'class MockS: enviar = lambda s, m: f"SMS: {m}"; NotificadorConLog(MockS()).enviar("Alerta")', 'expected' => '[LOG] SMS: Alerta'],
                ],
                'hint' => 'Guarda self.decorado = decorado y en enviar retorna f"[LOG] {self.decorado.enviar(msg)}".',
            ]
        );
        echo "  ✓ Guardado: Módulo 2 y reto en arquitectura-proyecto-poo\n";
    }

    // 4. diseno-apis-restful: Módulo 2 Contratos OpenAPI y Manejo de Errores
    $cApiRest = Course::where('slug', 'diseno-apis-restful')->first();
    if ($cApiRest) {
        $m2 = Module::updateOrCreate(
            ['course_id' => $cApiRest->id, 'order' => 2],
            [
                'title' => 'Módulo 2: Manejo de Errores RFC 7807 y Contratos OpenAPI',
                'description' => 'Aprende el estándar Problem Details for HTTP APIs (RFC 7807) para comunicar errores de forma estructurada a tus consumidores.'
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'diseno-apis-restful-estandar-rfc-7807'],
            [
                'module_id' => $m2->id,
                'title' => 'El Estándar RFC 7807: Problem Details',
                'order' => 1,
                'type' => 'article',
                'duration_minutes' => 14,
                'is_preview' => false,
                'content' => createDoc(
                    'Problem Details for HTTP APIs (RFC 7807)',
                    'En lugar de formatos de error inventados en cada proyecto, la IETF formalizó RFC 7807 con campos estándar: `type`, `title`, `status`, `detail`, `instance`.',
                    [
                        ['title' => 'Beneficios', 'list' => [
                            'Clientes frontend y móviles pueden deserializar errores de manera universal',
                            'Códigos HTTP semánticos alineados con el cuerpo de error',
                            'Facilidad para debugging en logs de producción'
                        ]]
                    ]
                )
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'diseno-apis-restful-reto-rfc-7807'],
            [
                'module_id' => $m2->id,
                'title' => 'Reto Práctico: Generador de Respuestas de Error RFC 7807',
                'order' => 2,
                'type' => 'code_challenge',
                'duration_minutes' => 18,
                'is_preview' => false,
                'language' => 'python',
                'content' => createDoc(
                    'Reto: Serializador de Error Estándar',
                    'Escribe una función `crear_error_rfc7807(status: int, title: str, detail: str) -> dict` que retorne el diccionario formateado exactamente según RFC 7807 con `type: "about:blank"`.',
                    [
                        ['title' => 'Campos requeridos', 'list' => [
                            'type: "about:blank"',
                            'title: string',
                            'status: int',
                            'detail: string'
                        ]]
                    ]
                ),
                'starter_code' => "def crear_error_rfc7807(status: int, title: str, detail: str) -> dict:\n    # TODO: retornar dict rfc7807\n    pass\n",
                'solution' => "def crear_error_rfc7807(status: int, title: str, detail: str) -> dict:\n    return {\n        'type': 'about:blank',\n        'title': title,\n        'status': status,\n        'detail': detail\n    }\n",
                'test_cases' => [
                    ['input' => 'crear_error_rfc7807(404, "Recurso no encontrado", "El usuario con ID 99 no existe.")', 'expected' => '{"type": "about:blank", "title": "Recurso no encontrado", "status": 404, "detail": "El usuario con ID 99 no existe."}'],
                ],
                'hint' => 'Crea un dict con type "about:blank", title, status y detail.',
            ]
        );
        echo "  ✓ Guardado: Módulo 2 y reto en diseno-apis-restful\n";
    }

    // 5. css-moderno-flexbox-grid: Módulo 2 Diseño Fluido y Variables CSS
    $cCss = Course::where('slug', 'css-moderno-flexbox-grid')->first();
    if ($cCss) {
        $m2 = Module::updateOrCreate(
            ['course_id' => $cCss->id, 'order' => 2],
            [
                'title' => 'Módulo 2: Diseño Fluido y Sistemas de Espaciado con Variables CSS',
                'description' => 'Aprende a diseñar sistemas de diseño escalables con funciones matemáticas de CSS como clamp() y calc().'
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'css-moderno-flexbox-grid-diseno-fluido-clamp'],
            [
                'module_id' => $m2->id,
                'title' => 'Tipografía y Espaciado Fluido con clamp()',
                'order' => 1,
                'type' => 'article',
                'duration_minutes' => 15,
                'is_preview' => false,
                'content' => createDoc(
                    'Diseño Fluido sin Media Queries Excesivas',
                    'La función `clamp(MIN, VALOR_IDEAL, MAX)` permite que los tamaños de fuente y espaciados escalen suavemente según el viewport sin necesidad de decenas de breakpoints.',
                    [
                        ['title' => 'Sintaxis', 'code' => "font-size: clamp(1rem, 2.5vw + 0.5rem, 2.5rem);", 'lang' => 'css'],
                        ['title' => 'Ventajas de Rendimiento', 'list' => [
                            'Menor tamaño de CSS final',
                            'Transición continua entre dispositivos móviles y pantallas ultrawide',
                            'Mantenimiento centralizado en tokens'
                        ]]
                    ]
                )
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'css-moderno-flexbox-grid-reto-generador-grid'],
            [
                'module_id' => $m2->id,
                'title' => 'Reto Práctico: Generador de Propiedad CSS Grid Auto-fit',
                'order' => 2,
                'type' => 'code_challenge',
                'duration_minutes' => 18,
                'is_preview' => false,
                'language' => 'typescript',
                'content' => createDoc(
                    'Reto: Calculadora de Grid Responsivo sin Breakpoints',
                    'Escribe una función `generarTemplateGrid(minAnchoPx: number): string` que retorne la propiedad CSS `repeat(auto-fit, minmax(${minAnchoPx}px, 1fr))`.',
                    [
                        ['title' => 'Ejemplo', 'text' => '`generarTemplateGrid(280)` retorna `"repeat(auto-fit, minmax(280px, 1fr))"`']
                    ]
                ),
                'starter_code' => "function generarTemplateGrid(minAnchoPx: number): string {\n  // TODO: retornar el template string\n  return '';\n}\n",
                'solution' => "function generarTemplateGrid(minAnchoPx: number): string {\n  return `repeat(auto-fit, minmax(\${minAnchoPx}px, 1fr))`;\n}\n",
                'test_cases' => [
                    ['input' => 'generarTemplateGrid(280)', 'expected' => 'repeat(auto-fit, minmax(280px, 1fr))'],
                    ['input' => 'generarTemplateGrid(320)', 'expected' => 'repeat(auto-fit, minmax(320px, 1fr))'],
                ],
                'hint' => 'Usa un template literal de JS/TS: `repeat(auto-fit, minmax(${minAnchoPx}px, 1fr))`',
            ]
        );
        echo "  ✓ Guardado: Módulo 2 y reto en css-moderno-flexbox-grid\n";
    }

    // 6. especificacion-srs-diagramas: Módulo 2 BDD y Criterios de Aceptación
    $cReq = Course::where('slug', 'especificacion-srs-diagramas')->first();
    if ($cReq) {
        $m2 = Module::updateOrCreate(
            ['course_id' => $cReq->id, 'order' => 2],
            [
                'title' => 'Módulo 2: Criterios de Aceptación con BDD y Gherkin',
                'description' => 'Traduce requerimientos ambiguos en pruebas ejecutables con la sintaxis Given / When / Then de Gherkin.'
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'especificacion-srs-diagramas-bdd-gherkin'],
            [
                'module_id' => $m2->id,
                'title' => 'Sintaxis Gherkin: El Puente entre Negocio e Ingeniería',
                'order' => 1,
                'type' => 'article',
                'duration_minutes' => 16,
                'is_preview' => false,
                'content' => createDoc(
                    'Especificación por Ejemplo y BDD',
                    'Como explican Martin Fowler y Dan North en Behavior-Driven Development, los requerimientos escritos en lenguaje natural ambiguo son la causa número uno de bugs en software.',
                    [
                        ['title' => 'La Estructura Gherkin', 'list' => [
                            'Dado (Given): El contexto inicial del sistema y sus precondiciones',
                            'Cuando (When): La acción ejecutada por el usuario o evento desencadenante',
                            'Entonces (Then): El resultado observable esperado'
                        ]]
                    ]
                )
            ]
        );

        Lesson::updateOrCreate(
            ['slug' => 'especificacion-srs-diagramas-reto-parser-bdd'],
            [
                'module_id' => $m2->id,
                'title' => 'Reto Práctico: Validador de Estructura de Escenarios BDD',
                'order' => 2,
                'type' => 'code_challenge',
                'duration_minutes' => 20,
                'is_preview' => false,
                'language' => 'python',
                'content' => createDoc(
                    'Reto: Validador de Criterios de Aceptación',
                    'Escribe una función `es_escenario_bdd_valido(lineas: list[str]) -> bool` que verifique que el escenario contenga al menos una cláusula con "dado", al menos una con "cuando" y al menos una con "entonces" (insensible a mayúsculas).',
                    [
                        ['title' => 'Criterio', 'text' => 'Retorna True solo si las 3 palabras clave están presentes en el conjunto de líneas.']
                    ]
                ),
                'starter_code' => "def es_escenario_bdd_valido(lineas: list[str]) -> bool:\n    # TODO: verificar presencia de \"dado\", \"cuando\", \"entonces\"\n    pass\n",
                'solution' => "def es_escenario_bdd_valido(lineas: list[str]) -> bool:\n    texto = ' '.join(lineas).lower()\n    tiene_dado = 'dado' in texto or 'given' in texto\n    tiene_cuando = 'cuando' in texto or 'when' in texto\n    tiene_entonces = 'entonces' in texto or 'then' in texto\n    return tiene_dado and tiene_cuando and tiene_entonces\n",
                'test_cases' => [
                    ['input' => 'es_escenario_bdd_valido(["Dado un usuario autenticado", "Cuando hace clic en pagar", "Entonces se emite factura"])', 'expected' => 'True'],
                    ['input' => 'es_escenario_bdd_valido(["Cuando hace clic en pagar", "Entonces se emite factura"])', 'expected' => 'False'],
                ],
                'hint' => 'Une las líneas en un solo string en minúsculas y verifica que "dado" (o "given"), "cuando" (o "when") y "entonces" (o "then") estén presentes.',
            ]
        );
        echo "  ✓ Guardado: Módulo 2 y reto en especificacion-srs-diagramas\n";
    }

    DB::commit();
    Cache::flush();
    echo "\n=== Enriquecimiento Secundario Completado con Éxito ===\n";

} catch (\Throwable $e) {
    DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
