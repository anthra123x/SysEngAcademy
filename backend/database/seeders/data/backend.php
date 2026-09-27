<?php

/*
 * Cursos de backend: introducción, APIs REST con Laravel, Eloquent y seguridad.
 */

return [
    // =====================================================================
    // 8. Introducción al Backend
    // =====================================================================
    [
        'slug' => 'backend-introduccion',
        'title' => 'Introducción al Backend',
        'description' => 'Descubre qué pasa del lado del servidor: el modelo cliente-servidor, HTTP y el rol del backend en una aplicación moderna. La base para diseñar cualquier API.',
        'category' => 'desarrollo-backend',
        'difficulty' => 'beginner',
        'duration_hours' => 10,
        'is_free' => true,
        'learning_path' => 'desarrollo-backend',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'El Mundo del Backend',
                'description' => 'Qué es el backend y sobre qué cimientos se apoya: cliente-servidor y HTTP.',
                'lessons' => [
                    [
                        'slug' => 'que-es-backend',
                        'title' => '¿Qué es el Backend?',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Qué es el Backend?'],
                            ['p', 'El backend es la parte de una aplicación que corre en el servidor: procesa peticiones, consulta bases de datos, aplica reglas de negocio y devuelve respuestas. Mientras el frontend se encarga de lo que el usuario ve, el backend garantiza que los datos lleguen de forma segura y consistente.'],
                            ['p', 'Un backend típico incluye un servidor web, la aplicación con la lógica de negocio y una base de datos. Además suele sumar caché, colas de trabajo y autenticación.'],
                            ['code', 'php', <<<'PHP'
<?php
// El backend recibe una petición y devuelve una respuesta
Route::get('/api/usuarios', function () {
    $usuarios = DB::table('usuarios')->get();

    return response()->json([
        'data' => $usuarios,
    ]);
});
PHP],
                            ['h', 'Responsabilidades del backend'],
                            ['list', [
                                'Procesar peticiones HTTP de los clientes',
                                'Validar datos antes de guardarlos',
                                'Consultar y persistir en bases de datos',
                                'Aplicar reglas de negocio y seguridad',
                            ]],
                            ['p', 'Separar el backend del frontend permite escalar cada parte por separado, cambiar la interfaz sin tocar la lógica y exponer la misma API a web, móvil y otros servicios.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El backend vive en el servidor',
                                'Procesa peticiones y devuelve respuestas',
                                'Incluye lógica, datos y seguridad',
                                'La separación frontend/backend permite escalar y reutilizar',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es la función principal del backend?', 'type' => 'single', 'answers' => [
                                    ['Procesar peticiones, aplicar lógica y gestionar datos', true, 'El backend es la capa de servidor que da sentido a la aplicación.'],
                                    ['Pintar los botones de la interfaz', false, 'Eso es responsabilidad del frontend.'],
                                    ['Estilizar las páginas con CSS', false, 'Los estilos son del frontend.'],
                                    ['Traducir el idioma de la interfaz', false, 'La traducción es contenido, no backend.'],
                                ]],
                                ['q' => '¿Qué componentes suele incluir un backend típico?', 'type' => 'single', 'answers' => [
                                    ['Servidor, lógica de negocio y base de datos', true, 'Es la triada básica del lado servidor.'],
                                    ['HTML, CSS y JavaScript', false, 'Esos son los tres pilares del frontend.'],
                                    ['Figma, Photoshop e Illustrator', false, 'Son herramientas de diseño.'],
                                    ['Router, switch y cableado', false, 'Eso es infraestructura de red física.'],
                                ]],
                                ['q' => '¿Qué ventaja da separar backend y frontend?', 'type' => 'single', 'answers' => [
                                    ['Escalar por separado y reutilizar la misma API en varios clientes', true, 'Web, móvil y servicios comparten la misma lógica.'],
                                    ['Eliminar el uso de bases de datos', false, 'La BD sigue siendo necesaria.'],
                                    ['Hacer que el navegador procese todo', false, 'El navegador no puede sustituir la lógica del servidor.'],
                                    ['Evitar usar HTTP', false, 'HTTP es el puente entre ambas partes.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'modelo-cliente-servidor',
                        'title' => 'El modelo Cliente-Servidor',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'El modelo Cliente-Servidor'],
                            ['p', 'En el modelo cliente-servidor, el cliente (navegador, app móvil u otro servicio) envía peticiones y el servidor responde. Este desacople separa la presentación de la lógica de negocio y permite escalar cada parte por separado.'],
                            ['p', 'Las variantes como el cliente grueso procesan parte de la lógica localmente, reduciendo la carga del servidor. La mayoría de las aplicaciones modernas combinan ambos enfoques.'],
                            ['code', 'php', <<<'PHP'
<?php
// El cliente pide datos; el servidor decide qué devolver
// Petición: GET /api/pedidos?estado=pendiente
Route::get('/api/pedidos', function (Request $request) {
    return Pedido::where('estado', $request->query('estado'))->get();
});
PHP],
                            ['h', 'Características del modelo'],
                            ['list', [
                                'El cliente inicia la comunicación',
                                'El servidor espera y responde peticiones',
                                'Puede haber muchos clientes contra un servidor',
                                'La responsabilidad de cada parte está definida',
                            ]],
                            ['p', 'Un servidor puede ser cliente de otro servicio: por ejemplo, tu backend consulta una pasarela de pagos. El rol depende del contexto, no de la máquina.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El cliente pide, el servidor responde',
                                'El desacople permite escalar por separado',
                                'Los clientes pueden ser web, móvil u otros servidores',
                                'Una API puede ser cliente de otra API',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Quién inicia la comunicación en el modelo cliente-servidor?', 'type' => 'single', 'answers' => [
                                    ['El cliente', true, 'El cliente envía la petición y el servidor responde.'],
                                    ['El servidor', false, 'El servidor espera peticiones; no las inicia.'],
                                    ['La base de datos', false, 'La BD responde consultas del servidor, no inicia la conversación.'],
                                    ['Ambos a la vez', false, 'Es una conversación iniciada por el cliente.'],
                                ]],
                                ['q' => '¿Qué es un cliente grueso?', 'type' => 'single', 'answers' => [
                                    ['Un cliente que procesa parte de la lógica localmente', true, 'Reduce la carga del servidor moviendo trabajo al cliente.'],
                                    ['Un servidor con más memoria', false, 'No describe clientes.'],
                                    ['Un navegador sin JavaScript', false, 'Un cliente grueso suele tener más lógica, no menos.'],
                                    ['Una base de datos centralizada', false, 'La BD no es un cliente.'],
                                ]],
                                ['q' => '¿Puede un servidor ser cliente de otro servicio?', 'type' => 'single', 'answers' => [
                                    ['Sí, por ejemplo al consultar una pasarela de pagos', true, 'Los roles dependen de quién inicia la petición.'],
                                    ['No, los roles son fijos', false, 'El rol depende del contexto de la comunicación.'],
                                    ['Solo si usan el mismo lenguaje', false, 'El lenguaje no define el rol.'],
                                    ['Solo en horario nocturno', false, 'No depende del horario.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'http-y-sus-metodos',
                        'title' => 'HTTP y sus métodos',
                        'type' => 'article',
                        'duration' => 20,
                        'blocks' => [
                            ['h', 'HTTP y sus métodos'],
                            ['p', 'HTTP define cómo se comunican cliente y servidor. Cada petición tiene un método (GET, POST, PUT, DELETE, PATCH), una URL, cabeceras y opcionalmente un cuerpo.'],
                            ['p', 'Los códigos de estado resumen el resultado: 2xx éxito, 3xx redirección, 4xx error del cliente y 5xx error del servidor. Comprender bien HTTP es el primer paso para diseñar APIs correctas y debugar servicios.'],
                            ['code', 'bash', <<<'BASH'
# GET: leer un recurso
curl https://api.example.com/usuarios/1

# POST: crear (envía datos en el cuerpo)
curl -X POST https://api.example.com/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Ana"}'

# DELETE: borrar
curl -X DELETE https://api.example.com/usuarios/1
BASH],
                            ['h', 'Métodos y semántica'],
                            ['list', [
                                'GET: leer sin efectos secundarios',
                                'POST: crear o enviar datos',
                                'PUT: reemplazar un recurso completo',
                                'PATCH: actualizar parcialmente',
                                'DELETE: borrar un recurso',
                            ]],
                            ['p', 'Cada método tiene una semántica clara; respetarla hace las APIs predecibles y permite a las herramientas y cachés optimizar por ti.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'GET es para leer; POST para crear o enviar',
                                'PUT reemplaza; PATCH actualiza parcialmente',
                                'DELETE borra recursos',
                                'Los códigos 2xx, 4xx y 5xx comunican el resultado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué método usarías para leer un recurso sin efectos secundarios?', 'type' => 'single', 'answers' => [
                                    ['GET', true, 'GET solo lee y no debe modificar nada.'],
                                    ['POST', false, 'POST crea o envía datos.'],
                                    ['DELETE', false, 'DELETE borra.'],
                                    ['PATCH', false, 'PATCH actualiza parcialmente.'],
                                ]],
                                ['q' => '¿Qué indica un código 422?', 'type' => 'single', 'answers' => [
                                    ['Un error del cliente: la validación de los datos falló', true, '422 "Unprocessable Entity" informa que los datos no pasan la validación.'],
                                    ['Un éxito total', false, 'El éxito es 2xx.'],
                                    ['Una redirección', false, 'Las redirecciones son 3xx.'],
                                    ['Un error interno del servidor', false, 'Eso es 5xx.'],
                                ]],
                                ['q' => '¿Cuál es la diferencia entre PUT y PATCH?', 'type' => 'single', 'answers' => [
                                    ['PUT reemplaza el recurso completo; PATCH actualiza solo lo enviado', true, 'PATCH es parcial; PUT exige el recurso entero.'],
                                    ['Son exactamente iguales', false, 'Tienen semánticas distintas.'],
                                    ['PUT es más rápido', false, 'La semántica no define la velocidad.'],
                                    ['PATCH solo sirve para texto', false, 'Aplica a cualquier representación.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Servidores y APIs',
                'description' => 'Del servidor web a la API: los bloques con los que construyes servicios reales.',
                'lessons' => [
                    [
                        'slug' => 'que-es-un-servidor-web',
                        'title' => '¿Qué es un servidor web?',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', '¿Qué es un servidor web?'],
                            ['p', 'Un servidor web es un software que escucha peticiones HTTP y devuelve respuestas: archivos estáticos (HTML, CSS, JS) o contenido dinámico generado por tu aplicación.'],
                            ['p', 'NGINX y Apache son los más usados. Pueden servir estáticos directamente y delegar lo dinámico a PHP, Python o Node mediante proxies o interfaces como PHP-FPM.'],
                            ['code', 'bash', <<<'BASH'
# Servidor de desarrollo de PHP para probar en local
php -S localhost:8000 -t public

# En producción: NGINX + PHP-FPM gestionan la app
# Este comando solo simula lo que hace un servidor real
BASH],
                            ['h', 'Qué hace un servidor web'],
                            ['list', [
                                'Escuchar en un puerto las peticiones HTTP',
                                'Servir archivos estáticos',
                                'Ejecutar o delegar la aplicación dinámica',
                                'Gestionar TLS, logs y compresión',
                            ]],
                            ['p', 'No necesitas montar NGINX para desarrollar: el servidor embebido de PHP o artisan serve bastan. Pero saber qué ocurre en producción te evita sorpresas al desplegar.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El servidor web responde peticiones HTTP',
                                'Sirve estáticos y delega lo dinámico',
                                'NGINX y Apache dominan la producción',
                                'En local se usa un servidor de desarrollo simple',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace un servidor web con una petición dinámica?', 'type' => 'single', 'answers' => [
                                    ['La delega a la aplicación (PHP, Python, Node) y devuelve su respuesta', true, 'El servidor web orquesta; la app genera el contenido.'],
                                    ['La guarda en un log y la ignora', false, 'Debe responder, no ignorar.'],
                                    ['La envía a otro usuario', false, 'No redistribuye peticiones entre usuarios.'],
                                    ['La convierte en imagen', false, 'No transforma la petición.'],
                                ]],
                                ['q' => '¿Para qué sirve php -S localhost:8000?', 'type' => 'single', 'answers' => [
                                    ['Levantar un servidor de desarrollo local', true, 'Facilita probar la app sin instalar NGINX.'],
                                    ['Desplegar a producción', false, 'Es solo para desarrollo local.'],
                                    ['Crear la base de datos', false, 'No crea BD.'],
                                    ['Compilar el código', false, 'PHP se interpreta; no se compila así.'],
                                ]],
                                ['q' => '¿Cuál es un servidor web muy usado en producción?', 'type' => 'single', 'answers' => [
                                    ['NGINX', true, 'Junto a Apache, domina el mercado de servidores web.'],
                                    ['phpMyAdmin', false, 'Es una herramienta de BD, no un servidor web.'],
                                    ['Composer', false, 'Es gestor de dependencias PHP.'],
                                    ['Docker Desktop', false, 'Es una herramienta de contenedores.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'que-es-una-api',
                        'title' => '¿Qué es una API?',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', '¿Qué es una API?'],
                            ['p', 'Una API (Interfaz de Programación de Aplicaciones) es el contrato por el que un programa habla con otro. En la web, las APIs HTTP exponen recursos mediante URLs y métodos.'],
                            ['p', 'El frontend no consulta la base de datos directamente: consume la API, recibe JSON y decide cómo mostrarlo. Ese contrato define qué puede pedir cada cliente y qué recibe.'],
                            ['code', 'javascript', <<<'JS'
// Un cliente (frontend) consumiendo una API
const respuesta = await fetch("/api/productos");
const productos = await respuesta.json();

console.log(productos.data[0].nombre);
JS],
                            ['h', 'Características de una buena API'],
                            ['list', [
                                'Contrato claro: endpoints, métodos y formatos',
                                'Respuestas JSON consistentes',
                                'Errores descriptivos con códigos correctos',
                                'Documentación para quien la consume',
                            ]],
                            ['p', 'Diseñar una API es diseñar un contrato público: los cambios rompen a los consumidores. Por eso versionas y documentas antes de publicar.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La API es el contrato entre programas',
                                'HTTP + JSON es la base de las APIs web',
                                'El frontend consume la API, no la BD',
                                'Documentar y versionar protege a los consumidores',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel juega la API entre frontend y backend?', 'type' => 'single', 'answers' => [
                                    ['Es el contrato que define cómo se comunican', true, 'Define endpoints, formatos y errores.'],
                                    ['Es la base de datos del backend', false, 'La BD está detrás de la API.'],
                                    ['Es el diseño visual de la interfaz', false, 'El diseño es del frontend.'],
                                    ['Es el servidor web', false, 'El servidor web sirve la API, pero no es la API.'],
                                ]],
                                ['q' => '¿En qué formato responden habitualmente las APIs web?', 'type' => 'single', 'answers' => [
                                    ['JSON', true, 'Es el formato estándar de intercambio de datos.'],
                                    ['CSS', false, 'CSS es para estilos.'],
                                    ['SQL', false, 'SQL es para bases de datos.'],
                                    ['Bash', false, 'Bash es un shell de comandos.'],
                                ]],
                                ['q' => '¿Por qué se versionan las APIs?', 'type' => 'single', 'answers' => [
                                    ['Porque los cambios pueden romper a los consumidores', true, 'Versionar permite evolucionar sin romper a quien ya integra.'],
                                    ['Para hacerlas más rápidas', false, 'El versionado no acelera.'],
                                    ['Porque HTTP lo exige', false, 'HTTP no obliga a versionar.'],
                                    ['Para ocultar los endpoints', false, 'Versionar documenta, no oculta.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'arquitectura-de-un-backend',
                        'title' => 'Arquitectura típica de un backend',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Arquitectura típica de un backend'],
                            ['p', 'Un backend bien organizado separa responsabilidades en capas: rutas que reciben peticiones, controladores que orquestan, servicios con la lógica, repositorios o modelos que acceden a datos.'],
                            ['p', 'En Laravel, las rutas apuntan a controladores, los modelos Eloquent representan tablas y los servicios encapsulan reglas de negocio que no pertenecen a ninguna de las capas anteriores.'],
                            ['code', 'php', <<<'PHP'
<?php
// Capa de ruta: define el endpoint
Route::get('/api/pedidos/{pedido}', [PedidoController::class, 'show']);

// Capa de controlador: orquesta
public function show(Pedido $pedido)
{
    return PedidoResource::make($pedido->load('items'));
}

// La lógica compleja vive en servicios o modelos, no en la ruta
PHP],
                            ['h', 'Capas típicas'],
                            ['list', [
                                'Rutas: mapa URL -> acción',
                                'Controladores: orquestan la petición',
                                'Servicios: reglas de negocio reutilizables',
                                'Modelos/Repositorios: acceso a datos',
                            ]],
                            ['p', 'La regla práctica: las rutas deben ser delgadas, los controladores ordenados y la lógica de negocio testeable en servicios. Así cada pieza se prueba por separado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Separar capas mejora el mantenimiento',
                                'Las rutas son el mapa de entrada',
                                'La lógica compleja vive en servicios',
                                'Cada capa debe poder probarse por separado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde debería vivir una regla de negocio compleja y reutilizable?', 'type' => 'single', 'answers' => [
                                    ['En un servicio dedicado', true, 'Aislarla la hace testeable y reutilizable.'],
                                    ['Dentro del archivo de rutas', false, 'Las rutas deben ser delgadas, no contener lógica.'],
                                    ['En el template HTML', false, 'El HTML pertenece al frontend.'],
                                    ['En un comentario del código', false, 'La lógica se ejecuta, no se comenta.'],
                                ]],
                                ['q' => '¿Qué hace el controlador en la arquitectura por capas?', 'type' => 'single', 'answers' => [
                                    ['Orquesta la petición: valida, llama servicios y responde', true, 'Es el coordinador entre HTTP y la lógica.'],
                                    ['Guarda los datos en la base', false, 'La persistencia la hacen modelos o repositorios.'],
                                    ['Renderiza el HTML final', false, 'En APIs devuelve JSON; en web delega vistas.'],
                                    ['Configura el servidor', false, 'Eso es infraestructura.'],
                                ]],
                                ['q' => '¿Qué representa un modelo Eloquent?', 'type' => 'single', 'answers' => [
                                    ['Una tabla de la base de datos', true, 'Cada modelo mapea una tabla y sus relaciones.'],
                                    ['Un endpoint de la API', false, 'Los endpoints los definen las rutas.'],
                                    ['Una vista HTML', false, 'Las vistas son del frontend.'],
                                    ['Un archivo de configuración', false, 'Los modelos no son configuración.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 9. APIs REST con Laravel
    // =====================================================================
    [
        'slug' => 'apis-rest-con-laravel',
        'title' => 'APIs REST con Laravel',
        'description' => 'Diseña e implementa APIs REST profesionales con Laravel: recursos, validación, respuestas JSON consistentes y manejo de errores. Todo lo necesario para exponer tu lógica de negocio.',
        'category' => 'desarrollo-backend',
        'difficulty' => 'intermediate',
        'duration_hours' => 15,
        'is_free' => true,
        'learning_path' => 'desarrollo-backend',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Principios REST',
                'description' => 'El estilo arquitectónico y cómo se traduce a rutas y controladores.',
                'lessons' => [
                    [
                        'slug' => 'principios-rest',
                        'title' => 'Principios de diseño REST',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Principios de diseño REST'],
                            ['p', 'REST es un estilo arquitectónico basado en recursos identificados por URLs y operados con métodos HTTP. Una API REST bien diseñada usa plurales para los recursos, respeta la semántica de los métodos y devuelve códigos de estado adecuados.'],
                            ['p', 'También aprovecha el cacheo HTTP y versiona la API para no romper a los consumidores cuando evoluciona.'],
                            ['code', 'bash', <<<'BASH'
# Recursos en plural y verbos HTTP explícitos
GET    /api/usuarios        -> listar
POST   /api/usuarios        -> crear
GET    /api/usuarios/1      -> ver uno
PUT    /api/usuarios/1      -> reemplazar
PATCH  /api/usuarios/1      -> actualizar parcial
DELETE /api/usuarios/1      -> borrar
BASH],
                            ['h', 'Reglas REST básicas'],
                            ['list', [
                                'Recursos en plural: /usuarios, /pedidos',
                                'Métodos HTTP con su semántica',
                                'Códigos de estado correctos',
                                'Versionado: /api/v1/usuarios',
                            ]],
                            ['p', 'REST es un estilo, no una norma escrita: lo importante es la coherencia. Si defines convenciones claras y las mantienes, tus consumidores te lo agradecerán.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los recursos se nombran en plural',
                                'Cada método HTTP tiene su significado',
                                'Los códigos de estado son parte del contrato',
                                'Versionar permite evolucionar sin romper',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es una URL REST adecuada para crear un pedido?', 'type' => 'single', 'answers' => [
                                    ['POST /api/pedidos', true, 'Recurso en plural con POST para crear.'],
                                    ['GET /api/crear-pedido', false, 'Usa verbo en la URL y método GET; ambos pasan de la convención REST.'],
                                    ['POST /api/pedido/crear', false, 'El verbo crear sobra y el singular rompe la coherencia.'],
                                    ['DELETE /api/pedidos', false, 'DELETE borra; no crea.'],
                                ]],
                                ['q' => '¿Por qué se versionan las APIs REST?', 'type' => 'single', 'answers' => [
                                    ['Para evolucionar sin romper a los consumidores existentes', true, 'La versión protege el contrato ya publicado.'],
                                    ['Para ocultar los endpoints', false, 'Versionar no oculta nada.'],
                                    ['Para evitar usar HTTPS', false, 'El versionado no tiene relación con TLS.'],
                                    ['Para aumentar la velocidad de red', false, 'No es un tema de velocidad.'],
                                ]],
                                ['q' => '¿Qué método y ruta actualizaría solo el email de un usuario?', 'type' => 'single', 'answers' => [
                                    ['PATCH /api/usuarios/1', true, 'PATCH actualiza parcialmente un recurso concreto.'],
                                    ['POST /api/usuarios', false, 'POST crea; faltaría indicar el recurso.'],
                                    ['PUT /api/usuarios/1', false, 'PUT reemplaza el recurso completo, no solo el email.'],
                                    ['GET /api/usuarios/1', false, 'GET lee, no actualiza.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'rutas-y-controladores',
                        'title' => 'Rutas y controladores',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Rutas y controladores'],
                            ['p', 'En Laravel las rutas se registran en routes/api.php y delegan en controladores. Los controladores agrupan la lógica de un recurso y usan Request y Response tipados.'],
                            ['p', 'Con resource controllers obtienes las acciones REST estándar: index, store, show, update y destroy, listas para personalizar.'],
                            ['code', 'php', <<<'PHP'
<?php
// routes/api.php
Route::apiResource('usuarios', UsuarioController::class);

// app/Http/Controllers/Api/UsuarioController.php
public function store(StoreUsuarioRequest $request)
{
    $usuario = Usuario::create($request->validated());

    return UsuarioResource::make($usuario)
        ->response()
        ->setStatusCode(201);
}
PHP],
                            ['h', 'Acciones del resource controller'],
                            ['list', [
                                'index: listar recursos',
                                'store: crear',
                                'show: mostrar uno',
                                'update: actualizar',
                                'destroy: borrar',
                            ]],
                            ['p', 'Las Form Requests (StoreUsuarioRequest) mueven la validación fuera del controlador, dejándolo limpio y la regla reutilizable.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'apiResource registra el CRUD completo',
                                'El controlador orquesta cada acción',
                                'Las Form Requests aíslan la validación',
                                'Devolver 201 al crear es señal de una API cuidada',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué genera Route::apiResource(\'usuarios\', ...)?', 'type' => 'single', 'answers' => [
                                    ['Las rutas REST estándar para el recurso usuarios', true, 'index, store, show, update y destroy en un solo registro.'],
                                    ['Una tabla nueva en la BD', false, 'No crea tablas.'],
                                    ['Un controlador con lógica completa', false, 'Crea rutas; el controlador lo escribes tú.'],
                                    ['Una migración automática', false, 'No genera migraciones.'],
                                ]],
                                ['q' => '¿Qué acción del controlador responde a POST /usuarios?', 'type' => 'single', 'answers' => [
                                    ['store', true, 'POST se mapea a store, que crea el recurso.'],
                                    ['index', false, 'index responde a GET para listar.'],
                                    ['destroy', false, 'destroy responde a DELETE.'],
                                    ['show', false, 'show responde a GET con un id.'],
                                ]],
                                ['q' => '¿Por qué usar una Form Request?', 'type' => 'single', 'answers' => [
                                    ['Para sacar la validación del controlador y reutilizarla', true, 'Mantiene el controlador limpio y la regla centralizada.'],
                                    ['Para acelerar la base de datos', false, 'La validación no acelera la BD.'],
                                    ['Para evitar escribir el controlador', false, 'El controlador sigue siendo necesario.'],
                                    ['Para ocultar los campos del modelo', false, 'No oculta nada.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'validacion-y-respuestas-json',
                        'title' => 'Validación y respuestas JSON',
                        'type' => 'article',
                        'duration' => 20,
                        'blocks' => [
                            ['h', 'Validación y respuestas JSON'],
                            ['p', 'Toda entrada del usuario debe validarse antes de tocar la base de datos. Laravel ofrece reglas declarativas (required, email, unique, max...) y devuelve errores en JSON automáticamente.'],
                            ['p', 'Las respuestas deben tener forma consistente: datos bajo una clave data, errores con su mensaje y siempre Content-Type application/json.'],
                            ['code', 'php', <<<'PHP'
<?php
public function store(StoreUsuarioRequest $request)
{
    $validado = $request->validated();

    return response()->json([
        'data' => Usuario::create($validado),
    ], 201);
}

// Reglas en StoreUsuarioRequest
public function rules(): array
{
    return [
        'email' => ['required', 'email', 'unique:usuarios,email'],
        'password' => ['required', 'min:8'],
    ];
}
PHP],
                            ['h', 'Buenas prácticas de respuestas'],
                            ['list', [
                                'Envolver datos en data para estructuras estables',
                                'Usar los códigos HTTP adecuados',
                                'Errores con mensajes útiles y claves de campo',
                                'Nunca exponer trazas internas',
                            ]],
                            ['p', 'La consistencia es el contrato: si siempre devuelves {data: ...} y los errores {message, errors}, el frontend puede construir clientes genéricos y robustos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Validar antes de persistir, siempre',
                                'Las reglas declarativas cubren la mayoría de los casos',
                                'Un formato de respuesta consistente simplifica al cliente',
                                'Los errores útiles aceleran la integración',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué respuesta devuelve Laravel cuando falla una validación en una API?', 'type' => 'single', 'answers' => [
                                    ['422 con los errores en JSON', true, 'Unprocessable Entity con el detalle de cada campo.'],
                                    ['200 con los datos guardados', false, 'No guarda nada si la validación falla.'],
                                    ['500 con una traza completa', false, 'Nunca debe exponer trazas.'],
                                    ['301 redirigiendo a login', false, 'Es un error de validación, no de sesión.'],
                                ]],
                                ['q' => '¿Por qué envolver las respuestas en una clave data?', 'type' => 'single', 'answers' => [
                                    ['Para que la estructura sea estable y extensible', true, 'Permite añadir metadatos sin romper al cliente.'],
                                    ['Porque HTTP lo exige', false, 'HTTP no exige esa forma.'],
                                    ['Para que el JSON pese menos', false, 'Añade una clave, no reduce el peso.'],
                                    ['Para ocultar los datos', false, 'Los datos siguen visibles dentro de data.'],
                                ]],
                                ['q' => '¿Cuál es el código correcto al crear un recurso?', 'type' => 'single', 'answers' => [
                                    ['201 Created', true, 'Indica que el recurso se creó correctamente.'],
                                    ['200 OK', false, 'Se usa también, pero 201 es más preciso para creación.'],
                                    ['404 Not Found', false, 'Eso significa que no existe.'],
                                    ['204 No Content', false, '204 se usa para borrados sin cuerpo.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Eloquent y Seguridad',
                'description' => 'Modelos, consultas y protección de tu API.',
                'lessons' => [
                    [
                        'slug' => 'eloquent-en-apis',
                        'title' => 'Eloquent en tus APIs',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Eloquent en tus APIs'],
                            ['p', 'Eloquent es el ORM de Laravel: cada modelo representa una tabla y cada instancia una fila. En las APIs lo usas constantemente, pero debes controlar qué se expone.'],
                            ['p', 'Con $hidden ocultas campos sensibles, con append añades atributos calculados y con Resources controlas exactamente la forma JSON de la respuesta.'],
                            ['code', 'php', <<<'PHP'
<?php
class Usuario extends Model
{
    protected $hidden = ['password', 'remember_token'];

    public function pedidos()
    {
        return $this->hasMany(Pedido::class);
    }
}

// En el controlador
return UsuarioResource::collection(
    Usuario::with('pedidos')->paginate(15)
);
PHP],
                            ['h', 'Buenas prácticas con Eloquent'],
                            ['list', [
                                'Ocultar credenciales con $hidden',
                                'Cargar relaciones con with para evitar N+1',
                                'Usar Resources para dar forma a la respuesta',
                                'Paginación para listas grandes',
                            ]],
                            ['p', 'Nunca devuelvas el modelo crudo con toArray si contiene campos sensibles: define qué sale por la API con Resources y $hidden.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Eloquent mapea tablas a modelos',
                                '$hidden protege campos sensibles',
                                'with() carga relaciones de una vez',
                                'Los Resources definen el JSON de la API',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace la propiedad $hidden de un modelo?', 'type' => 'single', 'answers' => [
                                    ['Oculta los campos listados en las serializaciones', true, 'El password nunca llega al JSON.'],
                                    ['Borra los campos de la base de datos', false, 'No borra nada; solo oculta en salida.'],
                                    ['Los hace obligatorios', false, 'No regula validación.'],
                                    ['Los cifra automáticamente', false, 'No cifra.'],
                                ]],
                                ['q' => '¿Qué problema resuelve with(\'pedidos\')?', 'type' => 'single', 'answers' => [
                                    ['El problema N+1 de consultas repetidas', true, 'Carga la relación en una consulta en vez de una por fila.'],
                                    ['El almacenamiento de contraseñas', false, 'No tiene relación.'],
                                    ['La validación de la entrada', false, 'La validación es otra capa.'],
                                    ['El cacheo de respuestas', false, 'No cachea.'],
                                ]],
                                ['q' => '¿Para qué sirve un Resource en Laravel?', 'type' => 'single', 'answers' => [
                                    ['Dar forma al JSON que expone el modelo', true, 'Controlas campos, formatos y estructura.'],
                                    ['Crear tablas nuevas', false, 'Eso son migraciones.'],
                                    ['Ejecutar jobs en cola', false, 'Eso son jobs.'],
                                    ['Enviar correos', false, 'Eso son mails.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'manejo-de-errores',
                        'title' => 'Manejo de errores 4xx y 5xx',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Manejo de errores 4xx y 5xx'],
                            ['p', 'Una API debe responder errores con información útil: 404 cuando el recurso no existe, 422 cuando la validación falla y 500 para fallos inesperados (sin exponer detalles internos).'],
                            ['p', 'Define una estructura común para errores, por ejemplo {message, errors}, y documenta los códigos posibles para cada endpoint.'],
                            ['code', 'php', <<<'PHP'
<?php
// Excepción personalizada para recursos no encontrados
class RecursoNoEncontradoException extends Exception {}

// En el handler de excepciones
public function render($request, Throwable $e)
{
    if ($e instanceof RecursoNoEncontradoException) {
        return response()->json([
            'message' => 'El recurso no existe',
        ], 404);
    }

    return parent::render($request, $e);
}
PHP],
                            ['h', 'Errores típicos de una API'],
                            ['list', [
                                '400: petición malformada',
                                '401: no autenticado',
                                '403: autenticado pero sin permiso',
                                '404: recurso inexistente',
                                '422: validación fallida',
                            ]],
                            ['p', 'El 500 jamás debe revelar trazas, consultas o archivos internos: el cliente solo necesita saber que algo falló y, si procede, un identificador para reportarlo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Cada error usa su código HTTP correcto',
                                'Estructura de error consistente',
                                'Nunca exponer detalles internos en 5xx',
                                'Documentar los errores por endpoint',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué diferencia hay entre 401 y 403?', 'type' => 'single', 'answers' => [
                                    ['401 es no autenticado; 403 es sin permisos', true, 'Uno falta identidad; el otro falta autorización.'],
                                    ['Son iguales', false, 'Matizan problemas distintos.'],
                                    ['401 es del servidor y 403 del cliente', false, 'Ambos son errores del cliente (4xx).'],
                                    ['403 es éxito y 401 error', false, 'Ninguno es éxito.'],
                                ]],
                                ['q' => '¿Cuándo devolver 422?', 'type' => 'single', 'answers' => [
                                    ['Cuando los datos enviados no pasan la validación', true, 'Unprocessable Entity es el código de validación.'],
                                    ['Cuando el usuario no existe', false, 'Eso es 404 o 401 según contexto.'],
                                    ['Cuando el servidor se cae', false, 'Eso es 5xx.'],
                                    ['Cuando el recurso se creó', false, 'Eso es 201.'],
                                ]],
                                ['q' => '¿Qué debe contener la respuesta de un 500?', 'type' => 'single', 'answers' => [
                                    ['Un mensaje genérico sin detalles internos', true, 'Nunca trazas ni rutas del servidor.'],
                                    ['El stack trace completo de PHP', false, 'Expone el interior del servidor, prohibido.'],
                                    ['Las consultas SQL ejecutadas', false, 'Fuga de información sensible.'],
                                    ['Las credenciales de conexión', false, 'Nunca, bajo ninguna circunstancia.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'probando-apis-con-curl',
                        'title' => 'Probando APIs con curl',
                        'type' => 'code_challenge',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Probando APIs con curl'],
                            ['p', 'curl es la herramienta esencial para probar endpoints: -X para el método, -H para cabeceras y -d para el cuerpo. Con --max-time evitas peticiones colgadas y con -w puedes medir tiempos.'],
                            ['p', 'Postman o Thunder Client añaden interfaz visual, colecciones reutilizables y pruebas automatizadas sobre la misma API.'],
                            ['code', 'bash', <<<'BASH'
# Crear un usuario y ver el código de estado
curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST http://localhost:8000/api/usuarios \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"nombre": "Ana", "email": "ana@example.com"}'

# Con autenticación
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/usuarios
BASH],
                            ['h', 'Patrones de prueba útiles'],
                            ['list', [
                                '-s silencia el progreso; -o /dev/null descarta el cuerpo',
                                '-w %{http_code} imprime solo el código de estado',
                                '-H establece cabeceras como Content-Type y Authorization',
                                '--max-time evita peticiones colgadas',
                            ]],
                            ['p', 'Tener una colección de curl o de Postman por endpoint es documentación ejecutable: cualquiera puede reproducir la petición y ver la respuesta real.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'curl prueba métodos, cabeceras y cuerpos',
                                '-w %{http_code} verifica el estado',
                                'La cabecera Accept: application/json pide JSON',
                                'Las colecciones son documentación viva',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace -w "%{http_code}" en curl?', 'type' => 'single', 'answers' => [
                                    ['Imprime el código de estado de la respuesta', true, 'Permite verificar el código sin ver todo el cuerpo.'],
                                    ['Descarga el archivo', false, 'Descargar es -O o -o.'],
                                    ['Muestra el tiempo transcurrido', false, 'Eso sería %{time_total}.'],
                                    ['Envía una cabecera', false, 'Las cabeceras se envían con -H.'],
                                ]],
                                ['q' => '¿Qué cabecera indica que el cliente acepta JSON?', 'type' => 'single', 'answers' => [
                                    ['Accept: application/json', true, 'Negocia el formato de respuesta.'],
                                    ['Content-Type: application/json', false, 'Esa indica el formato del cuerpo enviado.'],
                                    ['Authorization: Bearer x', false, 'Esa aporta autenticación.'],
                                    ['User-Agent: curl', false, 'Eso identifica el cliente.'],
                                ]],
                                ['q' => '¿Qué flag evita que una petición quede colgada para siempre?', 'type' => 'single', 'answers' => [
                                    ['--max-time', true, 'Corta la petición tras los segundos indicados.'],
                                    ['-X', false, '-X define el método.'],
                                    ['-d', false, '-d envía el cuerpo.'],
                                    ['-i', false, '-i muestra las cabeceras de respuesta.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 10. Modelos, Relaciones y Consultas
    // =====================================================================
    [
        'slug' => 'modelos-relaciones-y-consultas',
        'title' => 'Modelos, Relaciones y Consultas',
        'description' => 'Domina Eloquent: migraciones que versionan el esquema, relaciones que conectan tablas y consultas eficientes que evitan el problema N+1.',
        'category' => 'desarrollo-backend',
        'difficulty' => 'intermediate',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'desarrollo-backend',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Eloquent y el Modelo de Datos',
                'description' => 'Migraciones, modelos y atributos para modelar la base de datos.',
                'lessons' => [
                    [
                        'slug' => 'modelos-y-migraciones',
                        'title' => 'Modelos y migraciones en Eloquent',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Modelos y migraciones en Eloquent'],
                            ['p', 'Las migraciones versionan el esquema de la base de datos y los modelos Eloquent representan tablas en código, mapeando cada fila a un objeto PHP con una sintaxis fluida.'],
                            ['p', 'Las migraciones se ejecutan en orden y se pueden revertir, lo que convierte el esquema en parte del repositorio y permite reproducir la BD en cualquier entorno.'],
                            ['code', 'php', <<<'PHP'
<?php
// Migración: define el esquema de forma versionada
Schema::create('cursos', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->string('title');
    $table->timestamps();
});

// Modelo: representa la tabla
class Curso extends Model
{
    protected $fillable = ['slug', 'title'];
}
PHP],
                            ['h', 'Por qué migrar'],
                            ['list', [
                                'El esquema queda versionado en Git',
                                'Se reproduce en cualquier entorno',
                                'Se revierte con rollback',
                                'El equipo comparte los mismos cambios',
                            ]],
                            ['p', 'Nunca edites la base de datos a mano en producción: cada cambio pasa por una migración revisada como cualquier otra pieza de código.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Las migraciones versionan el esquema',
                                'Los modelos mapean tablas a objetos',
                                'El esquema viaja con el repositorio',
                                'Los cambios de BD se revisan como código',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ventaja principal aportan las migraciones?', 'type' => 'single', 'answers' => [
                                    ['Versionar el esquema y reproducirlo en cualquier entorno', true, 'El esquema es código revisable y reproducible.'],
                                    ['Acelerar las consultas', false, 'Las migraciones no optimizan consultas.'],
                                    ['Ocultar las contraseñas', false, 'No gestiona secretos.'],
                                    ['Evitar usar SQL', false, 'Las migraciones generan SQL internamente.'],
                                ]],
                                ['q' => '¿Qué representa un modelo Eloquent?', 'type' => 'single', 'answers' => [
                                    ['Una tabla de la base de datos', true, 'Cada instancia es una fila de esa tabla.'],
                                    ['Una ruta de la API', false, 'Las rutas se declaran aparte.'],
                                    ['Un job de cola', false, 'Eso es otra clase.'],
                                    ['Una vista del frontend', false, 'El modelo no es visual.'],
                                ]],
                                ['q' => '¿Qué hace $fillable en un modelo?', 'type' => 'single', 'answers' => [
                                    ['Permitir la asignación masiva solo de esos campos', true, 'Protege contra asignación masiva peligrosa.'],
                                    ['Ocultar campos de la BD', false, 'Eso es $hidden.'],
                                    ['Definir las reglas de validación', false, 'Eso va en Form Requests o validators.'],
                                    ['Crear las tablas', false, 'Eso son migraciones.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'relaciones-uno-a-muchos',
                        'title' => 'Relaciones uno a muchos y muchos a muchos',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Relaciones uno a muchos y muchos a muchos'],
                            ['p', 'Las relaciones definen cómo se conectan las tablas: hasMany/belongsTo para uno a muchos, belongsToMany para muchos a muchos. Declararlas en el modelo permite encadenar consultas como course->lessons.'],
                            ['p', 'Cargar relaciones con with() evita el problema N+1: una consulta por el recurso y otra por cada relación, en vez de una por fila.'],
                            ['code', 'php', <<<'PHP'
<?php
class Curso extends Model
{
    // Uno a muchos: un curso tiene muchas lecciones
    public function lecciones()
    {
        return $this->hasMany(Leccion::class);
    }

    // Muchos a muchos: curso <-> estudiante vía tabla pivote
    public function estudiantes()
    {
        return $this->belongsToMany(Estudiante::class);
    }
}

// Evitar N+1: cargar en una sola consulta
$cursos = Curso::with('lecciones')->get();
PHP],
                            ['h', 'Tipos de relaciones'],
                            ['list', [
                                'hasMany/belongsTo: uno a muchos',
                                'belongsToMany: muchos a muchos con tabla pivote',
                                'hasOne: uno a uno',
                                'with() carga eager para evitar N+1',
                            ]],
                            ['p', 'La clave está en declarar las relaciones en el modelo y cargarlas con with cuando las necesites; cargar siempre todas las relaciones que no usas también desperdicia recursos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'hasMany va del padre al hijo; belongsTo del hijo al padre',
                                'belongsToMany conecta muchos a muchos',
                                'with() elimina las consultas repetidas',
                                'Carga solo las relaciones que necesitas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué método crea una relación uno a muchos desde el curso hacia sus lecciones?', 'type' => 'single', 'answers' => [
                                    ['hasMany(Leccion::class)', true, 'Un curso tiene muchas lecciones.'],
                                    ['belongsTo(Leccion::class)', false, 'belongsTo se usa en el lado hijo.'],
                                    ['belongsToMany(Leccion::class)', false, 'Eso sería muchos a muchos.'],
                                    ['hasOne(Leccion::class)', false, 'hasOne es para uno a uno.'],
                                ]],
                                ['q' => '¿Qué es el problema N+1?', 'type' => 'single', 'answers' => [
                                    ['Hacer una consulta extra por cada fila para cargar relaciones', true, 'Con with se convierte en una o dos consultas totales.'],
                                    ['Tener más de 100 columnas en una tabla', false, 'No es un problema de consultas.'],
                                    ['Usar demasiados índices', false, 'Los índices no causan N+1.'],
                                    ['Que la BD devuelva nulos', false, 'No es eso.'],
                                ]],
                                ['q' => '¿Qué estructura usa belongsToMany por debajo?', 'type' => 'single', 'answers' => [
                                    ['Una tabla pivote con los ids de ambas tablas', true, 'La tabla pivote guarda la relación N:M.'],
                                    ['Una columna extra en una de las tablas', false, 'Eso es para 1:N con foreign key.'],
                                    ['Una tabla duplicada', false, 'No duplica tablas.'],
                                    ['Una vista materializada', false, 'No usa vistas.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'consultas-e-indices',
                        'title' => 'Consultas eficientes e índices',
                        'type' => 'article',
                        'duration' => 20,
                        'blocks' => [
                            ['h', 'Consultas eficientes e índices'],
                            ['p', 'Una consulta eficiente nace de un buen índice y de seleccionar solo lo necesario: usa select() para no traer columnas extra, paginate() para listas grandes y agrega índices a las columnas que filtras con where u ordenas.'],
                            ['p', 'Evita consultas dentro de bucles y revisa las queries generadas con toSql() o un logger de queries.'],
                            ['code', 'php', <<<'PHP'
<?php
// Migración con índice en la columna filtrada
Schema::table('pedidos', function (Blueprint $table) {
    $table->index('estado');
});

// Consulta eficiente: columnas justas + paginación
$pedidos = Pedido::select('id', 'total', 'estado')
    ->where('estado', 'pendiente')
    ->orderBy('created_at')
    ->paginate(20);
PHP],
                            ['h', 'Señales de consulta lenta'],
                            ['list', [
                                'Filtros por columnas sin índice',
                                'SELECT * en tablas anchas',
                                'Consultas dentro de bucles (N+1)',
                                'Falta de paginación en listas grandes',
                            ]],
                            ['p', 'El planificador de PostgreSQL usa índices cuando el beneficio supera el coste; los índices aceleran lecturas, pero cada índice añade coste en escritura. Índices justos, no índices por si acaso.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Índices en columnas de where y orderBy',
                                'select() trae solo lo necesario',
                                'paginate() controla listas grandes',
                                'Consultas en bucles = red flag',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde conviene crear un índice?', 'type' => 'single', 'answers' => [
                                    ['En las columnas que filtran o ordenan consultas frecuentes', true, 'El índice acelera el acceso por esa columna.'],
                                    ['En todas las columnas posibles', false, 'Cada índice encarece las escrituras.'],
                                    ['Solo en las columnas de texto', false, 'Los números también se indexan.'],
                                    ['En las tablas pequeñas siempre', false, 'En tablas diminutas el índice puede no aportar nada.'],
                                ]],
                                ['q' => '¿Qué hace paginate(20)?', 'type' => 'single', 'answers' => [
                                    ['Devuelve 20 filas por página con metadatos de paginación', true, 'Además de cortar, informa de página actual y total.'],
                                    ['Elimina las filas de más', false, 'No borra nada.'],
                                    ['Combina 20 tablas', false, 'No combina tablas.'],
                                    ['Recarga la página del navegador', false, 'Es una consulta, no una navegación.'],
                                ]],
                                ['q' => '¿Cuál es un síntoma clásico de N+1?', 'type' => 'single', 'answers' => [
                                    ['Una consulta dentro de un bucle que carga relaciones', true, 'Se ejecuta una query por cada fila del bucle.'],
                                    ['Muchos índices en una tabla', false, 'Eso no es N+1.'],
                                    ['Una tabla sin clave primaria', false, 'Es un problema de diseño, no de N+1.'],
                                    ['Un JOIN muy grande', false, 'Un JOIN grande es otra cosa.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Consultas Avanzadas',
                'description' => 'Scope, agregaciones y transacciones para casos reales.',
                'lessons' => [
                    [
                        'slug' => 'scopes-y-consultas-reutilizables',
                        'title' => 'Scopes y consultas reutilizables',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Scopes y consultas reutilizables'],
                            ['p', 'Los scopes encapsulan filtros comunes del modelo en métodos reutilizables: en vez de repetir where(\'estado\', \'pendiente\') por todas partes, defines un scope activo() que hace lo mismo.'],
                            ['p', 'Los scopes locales se declaran con prefijo scope y se llaman como if (sin el prefijo): Curso::publicado()->latest()->get().'],
                            ['code', 'php', <<<'PHP'
<?php
class Curso extends Model
{
    public function scopePublicado($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeDificultad($query, string $nivel)
    {
        return $query->where('difficulty', $nivel);
    }
}

// Uso: encadenable y legible
$cursos = Curso::publicado()->dificultad('beginner')->get();
PHP],
                            ['h', 'Beneficios de los scopes'],
                            ['list', [
                                'Evitan repetir condiciones',
                                'Centralizan reglas de consulta',
                                'Se encadenan con otros métodos',
                                'Documentan la intención de la consulta',
                            ]],
                            ['p', 'Cada condición de negocio repetida es candidata a scope: si cambia la regla, cambias un solo lugar y toda la app se beneficia.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'scopeNombre define un filtro reutilizable',
                                'Se llaman sin el prefijo scope',
                                'Se encadenan con otras cláusulas',
                                'Centralizan las reglas de negocio de consulta',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo se define un scope local en Eloquent?', 'type' => 'single', 'answers' => [
                                    ['Con un método que empieza por scope', true, 'scopePublicado() se llama como publicado().'],
                                    ['Con una migración', false, 'Los scopes son código, no esquema.'],
                                    ['Con un evento', false, 'No son eventos.'],
                                    ['Con una ruta', false, 'Las rutas no definen scopes.'],
                                ]],
                                ['q' => '¿Qué ventaja tiene centralizar los filtros en scopes?', 'type' => 'single', 'answers' => [
                                    ['Si cambia la regla, cambia en un solo lugar', true, 'Mantenimiento y consistencia en toda la app.'],
                                    ['Acelera la base de datos', false, 'El scope no optimiza el plan de ejecución por sí solo.'],
                                    ['Oculta las tablas', false, 'No oculta.'],
                                    ['Evita escribir SQL', false, 'Eloquent sigue generando SQL.'],
                                ]],
                                ['q' => '¿Qué hace Curso::publicado()->get()?', 'type' => 'single', 'answers' => [
                                    ['Ejecuta el scope publicado y devuelve los cursos visibles', true, 'Aplica el filtro y recupera los resultados.'],
                                    ['Publica los cursos automáticamente', false, 'El scope solo filtra, no actualiza.'],
                                    ['Crea un curso nuevo', false, 'No crea.'],
                                    ['Borra los cursos', false, 'No borra.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'agregaciones-y-consultas-complejas',
                        'title' => 'Agregaciones y consultas complejas',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Agregaciones y consultas complejas'],
                            ['p', 'Eloquent expone count, sum, avg, max y min para agregar datos, y withCount para traer contadores de relaciones sin cargarlas completas.'],
                            ['p', 'Para reportes avanzados puedes usar selectRaw y groupBy, pero cuando la consulta crece, considera una vista o un query builder más fino.'],
                            ['code', 'php', <<<'PHP'
<?php
// Contador sin cargar las filas
$cursos = Curso::withCount('lecciones')->get();
// $curso->lecciones_count

// Agregación simple
$total = Pedido::where('estado', 'pagado')->sum('total');

// Agrupación para reportes
$porEstado = Pedido::selectRaw('estado, count(*) as total')
    ->groupBy('estado')
    ->get();
PHP],
                            ['h', 'Cuándo usar cada herramienta'],
                            ['list', [
                                'withCount: contadores de relaciones',
                                'sum/avg/max/min: agregaciones directas',
                                'selectRaw: expresiones SQL específicas',
                                'groupBy: reportes por categoría',
                            ]],
                            ['p', 'Trae del servidor solo el número que necesitas: si solo quieres cuántas lecciones tiene un curso, withCount evita cargar cientos de filas para contarlas en PHP.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'withCount añade contadores sin cargar relaciones',
                                'Las agregaciones se resuelven en la BD, no en PHP',
                                'groupBy arma reportes',
                                'Cuenta y suma en SQL evita transferencias pesadas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace withCount(\'lecciones\')?', 'type' => 'single', 'answers' => [
                                    ['Añade un contador lecciones_count a cada curso', true, 'Cuenta la relación sin cargar las filas.'],
                                    ['Carga todas las lecciones', false, 'Justo lo contrario: no las carga.'],
                                    ['Borra las lecciones contadas', false, 'No borra.'],
                                    ['Crea la tabla lecciones', false, 'No crea tablas.'],
                                ]],
                                ['q' => '¿Dónde se resuelven sum, avg y count?', 'type' => 'single', 'answers' => [
                                    ['En la base de datos', true, 'El SQL agregado evita mover datos a PHP.'],
                                    ['En el navegador', false, 'El navegador no participa.'],
                                    ['En el servidor web', false, 'El servidor web solo entrega la respuesta final.'],
                                    ['En el modelo PHP', false, 'Eloquent traduce a SQL; la agregación la hace el motor.'],
                                ]],
                                ['q' => '¿Qué devuelve Pedido::where(\'estado\', \'pagado\')->sum(\'total\')?', 'type' => 'single', 'answers' => [
                                    ['La suma de los totales de pedidos pagados', true, 'Suma en SQL solo las filas filtradas.'],
                                    ['El pedido pagado más caro', false, 'Eso sería max.'],
                                    ['La lista de pedidos pagados', false, 'Eso sería get.'],
                                    ['El número de pedidos', false, 'Eso sería count.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'transacciones-y-consistencia',
                        'title' => 'Transacciones y consistencia',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Transacciones y consistencia'],
                            ['p', 'Una transacción agrupa varias operaciones de base de datos en una unidad atómica: si una falla, todas se revierten. Sin ella, un fallo a mitad de camino deja datos a medias.'],
                            ['p', 'En Laravel, DB::transaction ejecuta un cierre y hace commit si termina bien o rollback si lanza una excepción.'],
                            ['code', 'php', <<<'PHP'
<?php
use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    $pedido = Pedido::create($datos);
    $pedido->items()->createMany($items);

    // Si esto falla, se revierte todo lo anterior
    $inventario = Inventario::where('id', $items[0]['producto_id']);
    $inventario->decrement('stock', 1);
});
PHP],
                            ['h', 'Cuándo usar transacciones'],
                            ['list', [
                                'Crear registros con hijos dependientes',
                                'Movimientos que deben ser atómicos (pagos, stock)',
                                'Actualizaciones que tocan varias tablas',
                                'Cualquier operación que no puede quedar a medias',
                            ]],
                            ['p', 'Las transacciones protegen la consistencia, pero no sustituyen a las validaciones ni a los índices: son una capa más del diseño correcto.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Transacción = todo o nada',
                                'DB::transaction revierte ante excepciones',
                                'Ideal para crear hijos dependientes',
                                'Las operaciones atómicas protegen la integridad',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué garantiza una transacción?', 'type' => 'single', 'answers' => [
                                    ['Que todas las operaciones se apliquen o ninguna', true, 'Es la propiedad de atomicidad.'],
                                    ['Que las consultas sean rápidas', false, 'Las transacciones no garantizan velocidad.'],
                                    ['Que las contraseñas estén cifradas', false, 'No es un tema de cifrado.'],
                                    ['Que las tablas se borren', false, 'No borra nada por defecto.'],
                                ]],
                                ['q' => '¿Qué hace DB::transaction si el cierre lanza una excepción?', 'type' => 'single', 'answers' => [
                                    ['Revierte todos los cambios (rollback)', true, 'Nada de lo de dentro queda aplicado.'],
                                    ['Aplica los cambios igualmente', false, 'La excepción fuerza el rollback.'],
                                    ['Reintenta la operación', false, 'No reintenta por defecto.'],
                                    ['Guarda un backup', false, 'No hace backups.'],
                                ]],
                                ['q' => '¿Cuándo conviene envolver varias operaciones en una transacción?', 'type' => 'single', 'answers' => [
                                    ['Al crear un pedido junto a sus ítems y descontar stock', true, 'Tres cambios que deben ser atómicos: se aplican juntos o no se aplican.'],
                                    ['Al leer una lista de cursos', false, 'Las lecturas simples no necesitan transacción.'],
                                    ['Al cambiar el título de un curso', false, 'Es una sola escritura, no requiere agrupar nada.'],
                                    ['Al renderizar una vista', false, 'El renderizado es frontend, no toca la base de datos.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 11. Seguridad en APIs
    // =====================================================================
    [
        'slug' => 'seguridad-en-apis',
        'title' => 'Seguridad en APIs',
        'description' => 'Protege tus servicios: autenticación con tokens, vulnerabilidades OWASP más comunes y manejo seguro de secretos. La seguridad no es un extra, es parte del diseño.',
        'category' => 'desarrollo-backend',
        'difficulty' => 'intermediate',
        'duration_hours' => 8,
        'is_free' => true,
        'learning_path' => 'desarrollo-backend',
        'learning_path_level' => 4,
        'order' => 4,
        'modules' => [
            [
                'title' => 'Autenticación y Protección',
                'description' => 'Tokens, middleware y control de acceso en tus APIs.',
                'lessons' => [
                    [
                        'slug' => 'autenticacion-con-tokens',
                        'title' => 'Autenticación con tokens (Sanctum)',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Autenticación con tokens (Sanctum)'],
                            ['p', 'Laravel Sanctum ofrece un sistema de tokens para SPAs y clientes móviles: el usuario inicia sesión, recibe un token y lo envía en el header Authorization: Bearer.'],
                            ['p', 'Los tokens pueden tener habilidades (abilities), expirar y revocarse individualmente. Es la forma estándar de autenticar APIs sin estado en Laravel.'],
                            ['code', 'php', <<<'PHP'
<?php
// Emitir un token al iniciar sesión
public function login(Request $request)
{
    $credenciales = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (! Auth::attempt($credenciales)) {
        throw ValidationException::withMessages([
            'email' => 'Credenciales incorrectas',
        ]);
    }

    $token = $request->user()->createToken('app', ['pedidos:leer']);

    return response()->json(['token' => $token->plainTextToken]);
}
PHP],
                            ['h', 'Buenas prácticas de tokens'],
                            ['list', [
                                'Enviar siempre por HTTPS',
                                'Limitar habilidades al mínimo',
                                'Revocar tokens al cerrar sesión',
                                'Nunca guardar tokens en logs',
                            ]],
                            ['p', 'Un token es una llave de acceso: si se filtra, quien lo tenga actúa como el usuario. Por eso viaja cifrado, expira y se revoca al menor indicio de fuga.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El token viaja en Authorization: Bearer',
                                'Las habilidades limitan lo que puede hacer',
                                'Los tokens se revocan individualmente',
                                'HTTPS es obligatorio para tokens',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde se envía el token en cada petición?', 'type' => 'single', 'answers' => [
                                    ['En la cabecera Authorization: Bearer', true, 'Es la convención estándar para tokens.'],
                                    ['En la URL siempre', false, 'Nunca se ponen tokens en URLs, quedan en logs.'],
                                    ['En el body de cada DELETE', false, 'No es la convención.'],
                                    ['En una cookie de sesión', false, 'Los tokens Bearer no van en cookies.'],
                                ]],
                                ['q' => '¿Para qué sirven las habilidades (abilities) de un token?', 'type' => 'single', 'answers' => [
                                    ['Limitar qué acciones puede realizar el token', true, 'Acceso con privilegios mínimos.'],
                                    ['Acelerar la autenticación', false, 'No afecta la velocidad.'],
                                    ['Ocultar la contraseña del usuario', false, 'Las contraseñas se guardan con hash aparte.'],
                                    ['Definir el color del tema', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Por qué los tokens deben viajar por HTTPS?', 'type' => 'single', 'answers' => [
                                    ['Porque en texto plano podrían interceptarse', true, 'El cifrado protege la llave de acceso.'],
                                    ['Porque son demasiado largos', false, 'El largo no es el motivo.'],
                                    ['Porque el navegador lo exige para todo', false, 'HTTPS es por seguridad, no por longitud.'],
                                    ['Porque sin HTTPS no se generan', false, 'Se generan igual; el riesgo es la fuga.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'owasp-para-desarrolladores',
                        'title' => 'OWASP Top 10 para desarrolladores',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'OWASP Top 10 para desarrolladores'],
                            ['p', 'El OWASP Top 10 agrupa los riesgos más comunes: inyección SQL, XSS, rotura de autenticación, exposición de datos sensibles, control de acceso roto y más.'],
                            ['p', 'Prevenirlos es cuestión de buenas prácticas: sentencias preparadas, escape de salida, rate limiting y no confiar nunca en la entrada del usuario.'],
                            ['code', 'php', <<<'PHP'
<?php
// Eloquent usa prepared statements: previene inyección SQL
$usuario = Usuario::where('email', $request->email)->first();

// Nunca concatenar SQL crudo con entrada del usuario
// Mal: DB::select("SELECT * FROM usuarios WHERE email = '$email'");
PHP],
                            ['h', 'Riesgos que más debes cuidar'],
                            ['list', [
                                'Inyección SQL: nunca concatenar entradas en SQL',
                                'XSS: escapar la salida que llega al navegador',
                                'Broken Access Control: validar permisos en cada recurso',
                                'Exposición de datos: ocultar campos sensibles',
                            ]],
                            ['p', 'La regla general: toda entrada es hostil hasta que se valida, toda salida se escapa, y cada recurso comprueba si el usuario tiene permiso.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Las sentencias preparadas evitan inyección',
                                'El escape de salida neutraliza XSS',
                                'El control de acceso se valida por recurso',
                                'Nunca confíes en la entrada del usuario',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué práctica previene la inyección SQL?', 'type' => 'single', 'answers' => [
                                    ['Usar sentencias preparadas o un ORM', true, 'Los valores se parametrizan y no se interpretan como SQL.'],
                                    ['Validar con regex', false, 'La validación no sustituye a la parametrización.'],
                                    ['Eliminar las comillas del input', false, 'Sanear comillas es frágil; las paramétricas son la solución real.'],
                                    ['Ocultar el error al usuario', false, 'Ocultarlo no evita el ataque.'],
                                ]],
                                ['q' => '¿Qué tipo de ataque se mitiga escapando la salida?', 'type' => 'single', 'answers' => [
                                    ['XSS (Cross-Site Scripting)', true, 'El navegador no interpreta el texto inyectado como HTML.'],
                                    ['Inyección SQL', false, 'Eso se mitiga con sentencias preparadas en la entrada.'],
                                    ['DDoS', false, 'Eso es infraestructura, no escape.'],
                                    ['Robo de sesión por fuerza bruta', false, 'Eso se combate con rate limiting.'],
                                ]],
                                ['q' => '¿Qué es el Broken Access Control?', 'type' => 'single', 'answers' => [
                                    ['Que un usuario acceda a recursos que no le corresponden', true, 'Falta de validación de permisos por recurso.'],
                                    ['Que el servidor esté caído', false, 'Eso es disponibilidad.'],
                                    ['Que la conexión sea insegura', false, 'Eso es transporte sin TLS.'],
                                    ['Que se usen contraseñas débiles', false, 'Eso es gestión de credenciales.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'secretos-y-variables-de-entorno',
                        'title' => 'Secretos y variables de entorno',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Secretos y variables de entorno'],
                            ['p', 'Nunca se deben commitear claves ni credenciales: se guardan en .env (fuera de Git) y en producción se inyectan mediante el gestor de secretos del proveedor.'],
                            ['p', 'Mantener el código libre de datos sensibles, rotar las claves periódicamente y auditar los repositorios evita fugas que son difíciles de revertir.'],
                            ['code', 'bash', <<<'BASH'
# .env (NO se sube a Git)
DB_PASSWORD=supersecreta
API_KEY=sk_live_1234

# .env.example (sí se sube, con valores vacíos)
DB_PASSWORD=
API_KEY=
BASH],
                            ['h', 'Reglas de oro de los secretos'],
                            ['list', [
                                'El .env nunca entra al repositorio',
                                'Los secretos de producción se inyectan por el proveedor',
                                'Rota las claves filtradas de inmediato',
                                'Audita el historial de Git tras una filtración',
                            ]],
                            ['p', 'Si un secreto se filtra, asume que está comprometido: revócalo, rota la clave y elimina el archivo del historial de Git con herramientas como git-filter-repo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Secretos fuera del repositorio, siempre',
                                'Los gestores de secretos inyectan en producción',
                                'Rota cualquier clave comprometida',
                                'Auditar el historial evita fugas persistentes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde deben vivir las credenciales de producción?', 'type' => 'single', 'answers' => [
                                    ['En el gestor de secretos del proveedor', true, 'Se inyectan al entorno, no se escriben en código.'],
                                    ['En el código fuente', false, 'Vía directa a la fuga.'],
                                    ['En la documentación del repo', false, 'Igual de peligroso que el código.'],
                                    ['En un archivo público', false, 'Accesible para cualquiera.'],
                                ]],
                                ['q' => '¿Qué hacer primero si un secreto se filtra?', 'type' => 'single', 'answers' => [
                                    ['Revocarlo y rotarlo de inmediato', true, 'Asume compromiso y cambia la clave ya.'],
                                    ['Esperar a ver si alguien lo usa', false, 'Nunca se espera ante una fuga.'],
                                    ['Borrar el repositorio entero', false, 'Es excesivo; se rota y se limpia el historial.'],
                                    ['Cambiar la contraseña del correo', false, 'No es la acción prioritaria.'],
                                ]],
                                ['q' => '¿Para qué sirve .env.example?', 'type' => 'single', 'answers' => [
                                    ['Documentar qué variables necesita la app, sin valores reales', true, 'Es la plantilla segura para nuevos entornos.'],
                                    ['Guardar las claves reales', false, 'Jamás valores reales ahí.'],
                                    ['Ejecutar los tests', false, 'No ejecuta nada.'],
                                    ['Sustituir a la configuración', false, 'Es solo referencia.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Defensa en profundidad',
                'description' => 'Seguridad más allá de la autenticación: errores, abuso y datos.',
                'lessons' => [
                    [
                        'slug' => 'manejo-seguro-de-errores',
                        'title' => 'Manejo seguro de errores y logging',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Manejo seguro de errores y logging'],
                            ['p', 'Los errores filtran información: una excepción con stack trace completo, una consulta SQL expuesta o un mensaje que revela qué archivo interno existe son mapas para el atacante. El principio es claro: detalles técnicos al log, mensajes genéricos al usuario.'],
                            ['p', 'En Laravel, los mensajes de validación y las respuestas de error deben ser útiles pero opacos: "Credenciales incorrectas" en vez de "el usuario admin no existe". Y los logs nunca deben contener secretos ni datos personales sensibles.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Support\Facades\Log;

// No filtres detalles internos al cliente
if (! $usuario || ! Hash::check($password, $usuario->password)) {
    Log::warning('Login fallido', ['email' => $request->email]);
    throw ValidationException::withMessages([
        'email' => 'Credenciales incorrectas.', // genérico
    ]);
}

// Asegúrate de no loguear secretos
Log::info('Pago procesado', ['pago_id' => $pago->id]); // no tokens
PHP],
                            ['h', 'Reglas de errores seguros'],
                            ['list', [
                                'Mensajes genéricos al usuario, detalle al log',
                                'Nunca expongas stack traces en producción',
                                'No loguees contraseñas, tokens ni datos sensibles',
                                'Oculta la existencia de recursos (mismo mensaje 404/403)',
                                'Reporta errores (Sentry, Bugsnag) con contexto sanitizado',
                            ]],
                            ['p', 'Un atacante automatiza: probar usuarios con mensajes distintos es el método para enumerar cuentas. Mensajes idénticos para "usuario no existe" y "contraseña incorrecta" cierran esa puerta, y el log detallado te da a ti la visibilidad que el usuario no necesita.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Detalle al log, opacidad al cliente',
                                'Los stacks y secretos no salen de producción',
                                'Logs sanitizados sin datos sensibles',
                                'Mensajes uniformes evitan enumeración',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué debe mostrar tu API ante una excepción en producción?', 'type' => 'single', 'answers' => [
                                    ['Un mensaje genérico y un log detallado', true, 'El detalle técnico queda interno.'],
                                    ['El stack trace completo', false, 'Revela estructura interna y ayuda al atacante.'],
                                    ['La consulta SQL ejecutada', false, 'Filtra esquema y datos.'],
                                    ['Nada en absoluto', false, 'Una respuesta de error mínima sigue siendo necesaria.'],
                                ]],
                                ['q' => '¿Por qué usar el mismo mensaje para "usuario no existe" y "contraseña incorrecta"?', 'type' => 'multiple', 'answers' => [
                                    ['Evita enumerar usuarios válidos', true, 'El atacante no distingue qué existe.'],
                                    ['Reduce la información filtrada', true, 'Menos diferencias = menos información.'],
                                    ['Mejora la experiencia de todos', false, 'La UX pierde detalle, gana seguridad.'],
                                    ['Acelera el login', false, 'No hay diferencia de rendimiento.'],
                                ]],
                                ['q' => '¿Qué nunca debe aparecer en tus logs?', 'type' => 'multiple', 'answers' => [
                                    ['Contraseñas', true, 'Secreto absoluto.'],
                                    ['Tokens de sesión o API', true, 'Dan acceso directo.'],
                                    ['Datos personales innecesarios', true, 'Privacidad y normativa.'],
                                    ['El ID de la transacción', false, 'Es útil para trazar sin ser sensible.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'rate-limiting-y-proteccion-de-abuso',
                        'title' => 'Rate limiting y protección contra abuso',
                        'type' => 'code_challenge',
                        'duration' => 17,
                        'blocks' => [
                            ['h', 'Rate limiting y protección contra abuso'],
                            ['p', 'Las APIs públicas reciben abuso: fuerza bruta en login, scraping, spam en formularios. El rate limiting limita cuántas peticiones acepta un cliente por ventana de tiempo y responde 429 cuando se excede. Es la primera línea contra el abuso.'],
                            ['p', 'Laravel trae throttle integrado: puedes limitar por usuario, por IP o globalmente, y responder con la cabecera Retry-After. Para acciones sensibles (login, registro, envío de emails) usa límites estrictos y específicos, no solo uno global.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\RateLimiter as Limiter;

// Definir un limitador por email+IP en AppServiceProvider
Limiter::for('login', function ($request) {
    return Limiter::limit(5)->perMinutes(1)->by(
        $request->input('email').'|'.$request->ip()
    );
});

// En la ruta
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');
PHP],
                            ['h', 'Dónde aplicar límites'],
                            ['list', [
                                'Login y registro: límites estrictos',
                                'Endpoints de scraping sensible (cursos, precios)',
                                'Envío de emails y acciones destructivas',
                                'Límite global más límites específicos',
                                'Respuesta 429 con Retry-After',
                            ]],
                            ['p', 'El rate limiting no para a un atacante decidido, pero encarece el ataque y frena el abuso casual. Combínalo con captchas en puntos críticos, bloqueo tras N intentos fallidos y monitoreo de picos anómalos por IP.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Limita por ventana de tiempo y por cliente',
                                'Límites específicos para login y acciones sensibles',
                                '429 + Retry-After informan al cliente',
                                'El rate limiting encarece, no detiene del todo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué responde el servidor cuando se excede el límite de peticiones?', 'type' => 'single', 'answers' => [
                                    ['HTTP 429 Too Many Requests', true, 'Estado estándar de rate limiting.'],
                                    ['HTTP 500', false, '500 es error de servidor.'],
                                    ['HTTP 200', false, '200 es éxito.'],
                                    ['HTTP 301', false, '301 es redirección.'],
                                ]],
                                ['q' => '¿Por qué usar un limitador específico para login?', 'type' => 'multiple', 'answers' => [
                                    ['Frena la fuerza bruta con más severidad que el global', true, 'Las credenciales se atacan con cientos de intentos.'],
                                    ['Por cliente (email+IP) aísla a los abusadores', true, 'Un bot no tumba el límite general.'],
                                    ['Protege a usuarios legítimos del bloqueo global', true, 'El abuso de uno no penaliza a todos.'],
                                    ['Porque el login es el endpoint más rápido', false, 'La velocidad no es el motivo.'],
                                ]],
                                ['q' => '¿Qué combinación protege mejor un formulario de contacto?', 'type' => 'multiple', 'answers' => [
                                    ['Límite por IP + email', true, 'Ataques de spam automatizados por IP.'],
                                    ['Captcha en el formulario', true, 'Distingue humano de script.'],
                                    ['Límite muy alto global', false, 'Un límite alto no protege.'],
                                    ['Ninguna protección', false, 'El spam saturaría el buzón.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'cifrado-y-privacidad-de-datos',
                        'title' => 'Cifrado, cabeceras de seguridad y privacidad',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Cifrado, cabeceras de seguridad y privacidad'],
                            ['p', 'La seguridad de datos tiene tres frentes: en tránsito (HTTPS obligatorio), en reposo (cifrado de campos sensibles en la BD) y en uso (mínimo acceso posible). Laravel cifra con el comando encrypt() datos como tarjetas o direcciones, y las cabeceras HTTP endurecen el navegador contra ataques.'],
                            ['p', 'Las cabeceras de seguridad (HSTS, X-Content-Type-Options, CSP, X-Frame-Options) se configuran en el middleware o el servidor. CSP limita qué scripts y orígenes ejecuta tu página, cortando XSS y exfiltración de datos.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Support\Facades\Crypt;

// Cifrar en reposo
$usuario->tarjeta = Crypt::encryptString($request->tarjeta);
$usuario->save();

// Cabeceras de seguridad en Laravel
// (middleware o nginx)
header('Strict-Transport-Security: max-age=31536000');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
// Content-Security-Policy restringe scripts y orígenes
header("Content-Security-Policy: default-src 'self'");
PHP],
                            ['h', 'Frentes de protección'],
                            ['list', [
                                'En tránsito: HTTPS con HSTS',
                                'En reposo: cifrar campos sensibles',
                                'En uso: permisos mínimos y auditoría',
                                'Cabeceras: CSP, nosniff, frame options',
                                'Privacidad: no recojas lo que no necesitas',
                            ]],
                            ['p', 'La privacidad es parte de la seguridad: si no guardas datos que no necesitas, no puedes filtrarlos. Aplica minimización de datos, plazos de retención y anonimización. Cada campo en tu BD es un pasivo de seguridad que mantienes para siempre.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'HTTPS, cifrado en reposo y mínimo acceso',
                                'CSP corta XSS y exfiltración',
                                'Menos datos guardados = menos riesgo',
                                'La privacidad se diseña, no se añade al final',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué protege cifrar un campo en la base de datos?', 'type' => 'single', 'answers' => [
                                    ['Los datos en reposo si alguien accede a la BD', true, 'Sin la clave, el contenido es ilegible.'],
                                    ['Los datos en tránsito', false, 'Eso es HTTPS/TLS.'],
                                    ['El acceso de usuarios legítimos', false, 'El cifrado no gestiona permisos.'],
                                    ['El rendimiento del servidor', false, 'Cifrar no acelera nada.'],
                                ]],
                                ['q' => '¿Qué hace la cabecera Content-Security-Policy?', 'type' => 'multiple', 'answers' => [
                                    ['Limita qué scripts y orígenes puede cargar la página', true, 'Reduce XSS al bloquear código no autorizado.'],
                                    ['Restringe exfiltración de datos a dominios externos', true, 'El navegador bloquea conexiones fuera de la política.'],
                                    ['Acelera la carga del sitio', false, 'No es su función.'],
                                    ['Cifra las cookies', false, 'Eso es Secure de cookies.'],
                                ]],
                                ['q' => '¿Por qué la minimización de datos es una práctica de seguridad?', 'type' => 'single', 'answers' => [
                                    ['Lo que no guardas no puede filtrarse', true, 'Cada dato es un pasivo de seguridad.'],
                                    ['Porque las BD se llenan rápido', false, 'El espacio no es el motivo principal.'],
                                    ['Porque los atacantes odian los datos pocos', false, 'No es un factor.'],
                                    ['Porque la ley obliga a borrar listas', false, 'Hay normativa, pero el argumento técnico es el filtrado.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
