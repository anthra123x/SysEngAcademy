<?php

/*
 * Cursos de desarrollo web: fundamentos, trío HTML/CSS/JS, Angular y accesibilidad/performance.
 */

return [
    // =====================================================================
    // 4. Introducción al Desarrollo Web
    // =====================================================================
    [
        'slug' => 'intro-desarrollo-web',
        'title' => 'Introducción al Desarrollo Web',
        'description' => 'Aprende los fundamentos del desarrollo web: HTML, CSS y JavaScript. Crea tus primeras páginas web interactivas desde cero hasta un proyecto personal funcional.',
        'category' => 'desarrollo-web',
        'difficulty' => 'beginner',
        'duration_hours' => 15,
        'is_free' => true,
        'learning_path' => 'desarrollo-frontend',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'Cómo Funciona la Web',
                'description' => 'Entiende HTTP, DNS y el papel de los navegadores antes de escribir tu primera línea de HTML.',
                'lessons' => [
                    [
                        'slug' => 'como-funciona-la-web-http',
                        'title' => 'Cómo funciona la web: HTTP',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Cómo funciona la web: HTTP'],
                            ['p', 'Cuando escribes una dirección en el navegador, se produce una petición HTTP hacia un servidor, que responde con un documento. HTTP es el protocolo de comunicación entre cliente y servidor en la web.'],
                            ['p', 'Cada petición tiene un método (GET para leer, POST para enviar datos), una URL, cabeceras y opcionalmente un cuerpo. La respuesta incluye un código de estado: 200 éxito, 404 no encontrado, 500 error del servidor.'],
                            ['code', 'bash', <<<'BASH'
# Ver las cabeceras de una petición real
curl -I https://example.com

# Resultado típico
# HTTP/2 200
# content-type: text/html; charset=UTF-8
BASH],
                            ['h', 'Conceptos clave'],
                            ['list', [
                                'Cliente: navegador o app que solicita recursos',
                                'Servidor: máquina que aloja y sirve los recursos',
                                'Métodos: GET lee, POST crea, PUT actualiza, DELETE borra',
                                'Códigos 2xx éxito, 3xx redirección, 4xx error cliente, 5xx error servidor',
                            ]],
                            ['p', 'No necesitas memorizar todo HTTP para empezar, pero entender el ciclo petición-respuesta te ahorra horas de confusión cuando algo no carga o una API no responde.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'HTTP es el idioma entre navegador y servidor',
                                'Cada petición declara método, URL y cabeceras',
                                'Los códigos de estado resumen el resultado',
                                'El ciclo petición-respuesta está en cada carga de página',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel juega el servidor en la web?', 'type' => 'single', 'answers' => [
                                    ['Recibe peticiones y responde con recursos o datos', true, 'El servidor atiende cada petición HTTP.'],
                                    ['Muestra las páginas al usuario', false, 'Eso lo hace el navegador del cliente.'],
                                    ['Inventa el contenido que ve el usuario', false, 'Sirve contenido real, no lo inventa.'],
                                    ['Traduce el HTML a imágenes', false, 'El navegador renderiza; el servidor entrega.'],
                                ]],
                                ['q' => '¿Qué método HTTP usarías para enviar los datos de un formulario de registro?', 'type' => 'single', 'answers' => [
                                    ['POST', true, 'POST envía datos al servidor para crear un recurso.'],
                                    ['GET', false, 'GET sirve para leer, y meter datos en la URL es mala práctica.'],
                                    ['DELETE', false, 'DELETE borra recursos.'],
                                    ['OPTIONS', false, 'OPTIONS consulta capacidades; no envía datos de registro.'],
                                ]],
                                ['q' => '¿Qué significa un código 404 en la respuesta?', 'type' => 'single', 'answers' => [
                                    ['El recurso solicitado no existe', true, 'El cliente pidió algo que el servidor no encontró.'],
                                    ['La petición fue exitosa', false, 'El éxito es 200.'],
                                    ['El servidor tuvo un error interno', false, 'Eso sería 500.'],
                                    ['El recurso se movió de sitio', false, 'Eso sería una redirección 3xx.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'dns-y-urls',
                        'title' => 'DNS y URLs',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'DNS y URLs'],
                            ['p', 'Las personas recordamos nombres como ejemplo.com; las máquinas usan direcciones IP. El DNS (Domain Name System) traduce unos a otras, como una agenda telefónica de internet.'],
                            ['p', 'Una URL tiene partes: protocolo, dominio, puerto (opcional), ruta y parámetros. Cada parte indica al servidor qué pedir y cómo.'],
                            ['code', 'bash', <<<'BASH'
# Ver la IP de un dominio (consulta DNS)
dig ejemplo.com +short
# Ejemplo de salida: 93.184.216.34
BASH],
                            ['h', 'Anatomía de una URL'],
                            ['list', [
                                'https:// protocolo de comunicación',
                                'ejemplo.com dominio legible por humanos',
                                '/ruta recurso dentro del sitio',
                                '?clave=valor parámetros de la petición',
                            ]],
                            ['p', 'Cuando el DNS falla, el navegador no puede encontrar el servidor y muestra un error de resolución. Es un diagnóstico distinto a un 404: el dominio no se traduce vs. el recurso no existe.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El DNS traduce nombres de dominio a IP',
                                'Una URL combina protocolo, dominio, ruta y parámetros',
                                'La ruta indica qué recurso pedir',
                                'Errores de DNS y 404 son problemas distintos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es la función principal del DNS?', 'type' => 'single', 'answers' => [
                                    ['Traducir nombres de dominio a direcciones IP', true, 'Convierte algo legible para humanos en algo usable por máquinas.'],
                                    ['Almacenar las páginas web', false, 'Las páginas viven en servidores, no en el DNS.'],
                                    ['Cifrar las comunicaciones', false, 'Cifrar es HTTPS/TLS.'],
                                    ['Diseñar las URLs', false, 'Las URLs las decide quien publica el sitio.'],
                                ]],
                                ['q' => '¿Qué indica la ruta en una URL como https://ejemplo.com/contacto?', 'type' => 'single', 'answers' => [
                                    ['El recurso concreto dentro del sitio', true, '/contacto apunta a la página de contacto.'],
                                    ['La dirección IP del servidor', false, 'La IP se obtiene por DNS, no por la ruta.'],
                                    ['El protocolo usado', false, 'El protocolo es https://.'],
                                    ['El puerto de conexión', false, 'El puerto es opcional y va antes de la ruta.'],
                                ]],
                                ['q' => '¿Qué diferencia hay entre un error de DNS y un 404?', 'type' => 'single', 'answers' => [
                                    ['DNS no encuentra el dominio; 404 es que el recurso no existe en el servidor', true, 'Son fallos en etapas distintas del viaje de la petición.'],
                                    ['Son exactamente el mismo error', false, 'Uno falla antes de conectar; el otro con servidor ya localizado.'],
                                    ['DNS ocurre solo en redes privadas', false, 'El DNS opera en toda internet.'],
                                    ['404 impide resolver el dominio', false, '404 ocurre después de resolverlo.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'navegadores-y-herramientas',
                        'title' => 'Navegadores y herramientas de desarrollo',
                        'type' => 'article',
                        'duration' => 8,
                        'blocks' => [
                            ['h', 'Navegadores y herramientas de desarrollo'],
                            ['p', 'El navegador renderiza HTML, aplica CSS y ejecuta JavaScript. Las DevTools integradas son el mejor amigo del desarrollador: inspeccionan el DOM, los estilos, la red y la consola.'],
                            ['p', 'Desde DevTools puedes ver cada petición de red, su estado y su tiempo, probar CSS en vivo y depurar JavaScript con puntos de interrupción.'],
                            ['code', 'bash', <<<'BASH'
# Herramientas imprescindibles para empezar
# 1. DevTools del navegador (F12)
# 2. Editor de código (VS Code, etc.)
# 3. Servidor local para desarrollo
php -S localhost:8000
BASH],
                            ['h', 'Flujo de trabajo básico'],
                            ['list', [
                                'Escribe el código en un editor',
                                'Recarga la página para ver los cambios',
                                'Inspecciona el resultado con DevTools',
                                'Itera: cambia, recarga, verifica',
                            ]],
                            ['p', 'Domina primero la pestaña Elements y la consola: ahí verás la estructura real renderizada y los errores de JavaScript con su línea exacta.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'DevTools inspecciona DOM, red, estilos y consola',
                                'La consola muestra errores de JavaScript con archivo y línea',
                                'El ciclo editar-recargar-inspeccionar es el pan de cada día',
                                'Un servidor local evita abrir los archivos con file://',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve la pestaña Network de DevTools?', 'type' => 'single', 'answers' => [
                                    ['Ver las peticiones HTTP, su estado y sus tiempos', true, 'Permite diagnosticar qué pide la página y qué responde el servidor.'],
                                    ['Escribir CSS en vivo', false, 'Eso es más propio del panel de estilos.'],
                                    ['Ver los archivos del servidor', false, 'No explora el servidor; observa la red del cliente.'],
                                    ['Diseñar la base de datos', false, 'No tiene relación con la BD.'],
                                ]],
                                ['q' => '¿Qué muestra la consola de DevTools?', 'type' => 'single', 'answers' => [
                                    ['Errores de JavaScript y mensajes del código', true, 'Incluye el archivo y la línea donde ocurre el error.'],
                                    ['Las contraseñas guardadas', false, 'No expone credenciales.'],
                                    ['El tráfico de red completo', false, 'Eso es Network.'],
                                    ['El código fuente del servidor', false, 'El servidor no se ve desde la consola del cliente.'],
                                ]],
                                ['q' => '¿Cuál es el flujo de trabajo típico al desarrollar una página?', 'type' => 'single', 'answers' => [
                                    ['Editar, recargar e inspeccionar con DevTools', true, 'Iteración rápida entre código y resultado visible.'],
                                    ['Compilar a binarios y ejecutar', false, 'El navegador interpreta, no compila binarios.'],
                                    ['Diseñar primero la base de datos', false, 'La BD no es necesaria para una página estática simple.'],
                                    ['Apagar el servidor cada vez', false, 'Eso rompería el ciclo de trabajo.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'HTML: el Esqueleto',
                'description' => 'Crea la estructura de tus páginas con HTML y sus etiquetas.',
                'lessons' => [
                    [
                        'slug' => 'estructura-basica-html',
                        'title' => 'Estructura básica de HTML',
                        'type' => 'code_challenge',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Estructura básica de HTML'],
                            ['p', 'HTML no es un lenguaje de programación: es un lenguaje de marcado que estructura el contenido con etiquetas. El navegador lee esas etiquetas y muestra el contenido con su jerarquía.'],
                            ['p', 'Todo documento comienza con el doctype, la etiqueta html, y dentro head (metadatos) y body (contenido visible). Las etiquetas se abren y se cierran, anidando los elementos.'],
                            ['code', 'html', <<<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi primera página</title>
</head>
<body>
    <h1>Hola, mundo</h1>
    <p>Este es mi primer párrafo.</p>
</body>
</html>
HTML],
                            ['h', 'Reglas del marcado'],
                            ['list', [
                                'Cada etiqueta se abre <p> y se cierra </p>',
                                'Los elementos se anidan sin cruzarse',
                                'El atributo lang declara el idioma de la página',
                                'head lleva metadatos; body lleva el contenido visible',
                            ]],
                            ['p', 'Un HTML válido y bien anidado es más fácil de estilizar, de leer y de mantener. Los validadores automáticos ayudan a encontrar errores estructurales.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'HTML estructura, no programa',
                                'doctype, html, head y body forman la base',
                                'Las etiquetas se abren y cierran anidadas',
                                'head para metadatos, body para contenido',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde se coloca el contenido visible de la página?', 'type' => 'single', 'answers' => [
                                    ['Dentro del body', true, 'El body contiene todo lo que ve el usuario.'],
                                    ['Dentro del head', false, 'El head lleva metadatos, no contenido visible.'],
                                    ['Antes del doctype', false, 'El doctype es la primera línea del documento.'],
                                    ['Fuera del html', false, 'Todo el documento vive dentro de html.'],
                                ]],
                                ['q' => '¿Qué función tiene el atributo lang en la etiqueta html?', 'type' => 'single', 'answers' => [
                                    ['Declarar el idioma principal del documento', true, 'Ayuda a lectores de pantalla y motores de búsqueda.'],
                                    ['Definir el color de fondo', false, 'Los colores van en CSS, no en lang.'],
                                    ['Conectar una hoja de estilos', false, 'Eso es la etiqueta link.'],
                                    ['Activar JavaScript', false, 'Eso es la etiqueta script.'],
                                ]],
                                ['q' => '¿Cuál de estos marcados es correcto?', 'type' => 'single', 'answers' => [
                                    ['<p><strong>Texto</strong></p>', true, 'Las etiquetas se abren y cierran en orden inverso correcto.'],
                                    ['<p><strong>Texto</p></strong>', false, 'Se cruzan: strong se cierra después de p.'],
                                    ['<p><strong>Texto</p>', false, 'Falta cerrar strong.'],
                                    ['<p><strong>Texto</strong>', false, 'Falta cerrar p.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'etiquetas-y-contenido',
                        'title' => 'Etiquetas de contenido',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Etiquetas de contenido'],
                            ['p', 'HTML ofrece etiquetas para cada tipo de contenido: títulos, párrafos, listas, enlaces, imágenes y tablas. Elegir la correcta comunica significado y mejora la accesibilidad.'],
                            ['p', 'Los títulos van de h1 a h6 en orden jerárquico; las listas pueden ser ordenadas (ol) o no (ul); los enlaces usan a con href y las imágenes img con src y alt.'],
                            ['code', 'html', <<<'HTML'
<h1>Título principal</h1>
<p>Texto con un <a href="https://example.com">enlace</a>.</p>

<ul>
    <li>Primer elemento</li>
    <li>Segundo elemento</li>
</ul>

<img src="foto.jpg" alt="Descripción de la foto">
HTML],
                            ['h', 'Buenas prácticas'],
                            ['list', [
                                'Usa un solo h1 por página',
                                'El alt de las imágenes describe su contenido',
                                'Los enlaces llevan texto que explique su destino',
                                'Las listas solo para listas, no para maquetar',
                            ]],
                            ['p', 'El HTML semántico no solo le gusta a los navegadores: los motores de búsqueda y los lectores de pantalla dependen de él para entender la página.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Cada etiqueta aporta un significado',
                                'h1 a h6 organizan la jerarquía de títulos',
                                'ul/ol listas, a enlaces, img imágenes',
                                'El alt describe imágenes para quien no puede verlas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve el atributo alt de una imagen?', 'type' => 'single', 'answers' => [
                                    ['Describir el contenido de la imagen si no puede verse', true, 'Lectores de pantalla y fallos de carga usan ese texto.'],
                                    ['Definir el tamaño de la imagen', false, 'El tamaño va con width/height o CSS.'],
                                    ['Indicar el formato de archivo', false, 'El formato lo reconoce el navegador.'],
                                    ['Enlazar a otra página', false, 'Eso es href en un enlace.'],
                                ]],
                                ['q' => '¿Cuántos h1 se recomienda tener por página?', 'type' => 'single', 'answers' => [
                                    ['Uno', true, 'Un único título principal da estructura clara al documento.'],
                                    ['Uno por cada sección', false, 'Sobran; las secciones usan h2 y siguientes.'],
                                    ['Ninguno', false, 'El h1 marca el título de la página; es recomendable.'],
                                    ['Al menos diez', false, 'Eso destroza la jerarquía de encabezados.'],
                                ]],
                                ['q' => '¿Qué etiqueta crea una lista ordenada?', 'type' => 'single', 'answers' => [
                                    ['ol', true, 'Ordered list numera sus elementos.'],
                                    ['ul', false, 'ul es lista sin orden.'],
                                    ['li', false, 'li define cada elemento, pero la lista necesita ul u ol.'],
                                    ['dl', false, 'dl es lista de definiciones.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'formularios-html',
                        'title' => 'Formularios HTML',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Formularios HTML'],
                            ['p', 'Los formularios son la puerta de entrada de datos del usuario: textos, correos, contraseñas, selecciones y botones. La etiqueta form los agrupa y define a dónde van los datos.'],
                            ['p', 'Cada campo lleva name, que es la clave con la que viaja su valor. El atributo required marca campos obligatorios y los tipos de input validan el formato de forma nativa.'],
                            ['code', 'html', <<<'HTML'
<form action="/registro" method="POST">
    <label for="nombre">Nombre:</label>
    <input type="text" id="nombre" name="nombre" required>

    <label for="email">Correo:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">Registrarme</button>
</form>
HTML],
                            ['h', 'Campos frecuentes'],
                            ['list', [
                                'input type=text, email, password, number',
                                'select con opciones para elegir de una lista',
                                'textarea para texto largo',
                                'checkbox y radio para opciones múltiples o exclusivas',
                            ]],
                            ['p', 'Los labels asociados con for hacen clicable el texto y mejoran la accesibilidad. La validación nativa del navegador es una primera barrera, pero el servidor siempre debe validar de nuevo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'form define el contenedor y el destino de los datos',
                                'name es la clave con la que viaja cada valor',
                                'Los tipos de input validan el formato en el cliente',
                                'label + for conecta el texto con su campo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué atributo del input define la clave con la que se envía su valor?', 'type' => 'single', 'answers' => [
                                    ['name', true, 'El valor viaja como name=valor en la petición.'],
                                    ['id', false, 'id sirve para CSS y labels, no para enviar datos.'],
                                    ['type', false, 'type define el tipo de campo, no la clave.'],
                                    ['value', false, 'value es el valor inicial, no la clave.'],
                                ]],
                                ['q' => '¿Qué hace el atributo required en un campo?', 'type' => 'single', 'answers' => [
                                    ['Impedir enviar el formulario si el campo está vacío', true, 'El navegador bloquea el envío y muestra un aviso.'],
                                    ['Rellenar el campo con un valor por defecto', false, 'Eso es value.'],
                                    ['Ocultar el campo', false, 'Eso es hidden o CSS.'],
                                    ['Enviar el formulario automáticamente', false, 'No tiene ese efecto.'],
                                ]],
                                ['q' => '¿Por qué el servidor debe validar aunque el navegador ya valide?', 'type' => 'single', 'answers' => [
                                    ['Porque la validación del cliente puede saltarse fácilmente', true, 'Cualquiera puede enviar peticiones sin pasar por el formulario.'],
                                    ['Porque el navegador es poco fiable', false, 'No es fiabilidad; es que el cliente no es la frontera de confianza.'],
                                    ['Porque es más rápido', false, 'La razón no es velocidad, es seguridad.'],
                                    ['Porque los labels lo exigen', false, 'Los labels son accesibilidad, no validación.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'CSS y JavaScript',
                'description' => 'Da estilo con CSS y vida con JavaScript para cerrar tu primer proyecto.',
                'lessons' => [
                    [
                        'slug' => 'primeros-estilos-css',
                        'title' => 'Primeros estilos con CSS',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Primeros estilos con CSS'],
                            ['p', 'CSS da estilo al HTML: colores, fuentes, márgenes y disposición. Se escribe con reglas formadas por un selector, propiedades y valores, y se aplica con la etiqueta link o la regla style.'],
                            ['p', 'Una regla puede apuntar a etiquetas (p), clases (.tarjeta) o ids (#header). Las clases son lo más reutilizable y se usan en la mayoría de los proyectos.'],
                            ['code', 'css', <<<'CSS'
body {
    font-family: system-ui, sans-serif;
    margin: 0;
    background: #f5f5f5;
}

.tarjeta {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

h1 { color: #1a1a1a; }
CSS],
                            ['h', 'Selector y cascada'],
                            ['list', [
                                'Etiquetas: p { ... } afecta a todos los p',
                                'Clases: .tarjeta { ... } afecta a class=tarjeta',
                                'Ids: #header { ... } afecta al id header',
                                'La cascada resuelve qué regla gana cuando hay conflictos',
                            ]],
                            ['p', 'La especificidad decide cuál regla manda: los id ganan a las clases, y las clases a las etiquetas. Entenderla evita el clásico "por qué no se aplica mi estilo".'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'CSS es reglas de selector + propiedades',
                                'Las clases son el selector más reutilizable',
                                'La cascada y la especificidad deciden qué gana',
                                'Siempre piensa en móvil y escritorio',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué selector golpea a todos los elementos con class="tarjeta"?', 'type' => 'single', 'answers' => [
                                    ['.tarjeta', true, 'El punto indica clase.'],
                                    ['#tarjeta', false, 'El # indica id, no clase.'],
                                    ['tarjeta', false, 'Sin prefijo apunta a la etiqueta tarjeta, que no existe.'],
                                    ['*tarjeta', false, 'El comodín * no se combina así.'],
                                ]],
                                ['q' => '¿Qué resuelve la especificidad en CSS?', 'type' => 'single', 'answers' => [
                                    ['Qué regla gana cuando varias coinciden', true, 'Id > clase > etiqueta en la escala de especificidad.'],
                                    ['Qué navegador renderiza mejor', false, 'Los navegadores siguen el estándar, no una escala propia.'],
                                    ['Qué colores se ven mejor juntos', false, 'Eso es diseño visual, no especificidad.'],
                                    ['Cuánto tarda en cargar la página', false, 'Eso es rendimiento, no especificidad.'],
                                ]],
                                ['q' => '¿Con qué etiqueta se enlaza una hoja de estilos externa?', 'type' => 'single', 'answers' => [
                                    ['link con rel=stylesheet', true, 'Es la forma estándar de cargar un CSS externo.'],
                                    ['script', false, 'script carga JavaScript, no CSS.'],
                                    ['style', false, 'style define estilos embebidos, no enlaza archivos.'],
                                    ['meta', false, 'meta aporta metadatos, no estilos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'introduccion-a-javascript',
                        'title' => 'Introducción a JavaScript',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Introducción a JavaScript'],
                            ['p', 'JavaScript es el lenguaje de la web: da interactividad a las páginas, se ejecuta en el navegador y también en servidores con Node.js. Sin él, la web sería solo documentos estáticos.'],
                            ['p', 'El lenguaje tiene variables, funciones, condicionales y ciclos como cualquier otro, más un superpoder: acceder y modificar el DOM, el modelo del documento.'],
                            ['code', 'javascript', <<<'JS'
// Variables y función
const saludo = (nombre) => {
    return `Hola, ${nombre}`;
};

console.log(saludo("Ana"));
JS],
                            ['h', 'Conceptos básicos'],
                            ['list', [
                                'const declara constantes; let variables',
                                'Las funciones encapsulan lógica reutilizable',
                                'console.log imprime en la consola para depurar',
                                'Los eventos conectan el código con las acciones del usuario',
                            ]],
                            ['p', 'Empieza escribiendo pequeños scripts en la consola del navegador: declara variables, prueba funciones y observa los resultados. La retroalimentación inmediata acelera el aprendizaje.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'JavaScript da interactividad a la web',
                                'Corre en navegadores y en Node.js',
                                'const y let declaran valores',
                                'El DOM es su puente hacia la página',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde se ejecuta JavaScript en el navegador?', 'type' => 'single', 'answers' => [
                                    ['En el motor JavaScript del navegador, en el lado del cliente', true, 'Interpreta el script y manipula la página en la máquina del usuario.'],
                                    ['En el servidor, siempre', false, 'Puede correr en servidores con Node, pero en el navegador corre en el cliente.'],
                                    ['En la base de datos', false, 'Las bases de datos no ejecutan JS del navegador.'],
                                    ['En una máquina virtual aparte', false, 'El motor del navegador es donde se ejecuta.'],
                                ]],
                                ['q' => '¿Qué es el DOM?', 'type' => 'single', 'answers' => [
                                    ['El modelo del documento que JavaScript puede leer y modificar', true, 'El navegador expone la página como un árbol manipulable.'],
                                    ['Un lenguaje de estilos', false, 'Eso es CSS.'],
                                    ['Una base de datos del navegador', false, 'Existen almacenes como IndexedDB, pero el DOM es otra cosa.'],
                                    ['El componente visual del navegador', false, 'Es la representación del documento, no la interfaz del navegador.'],
                                ]],
                                ['q' => '¿Cuál es la diferencia entre const y let en JavaScript?', 'type' => 'single', 'answers' => [
                                    ['const no se puede reasignar; let sí', true, 'const fija la referencia, let permite reasignar.'],
                                    ['let es para texto y const para números', false, 'La diferencia es de reasignación, no de tipo.'],
                                    ['const es más rápida', false, 'No hay diferencia de rendimiento relevante.'],
                                    ['Son exactamente iguales', false, 'Se comportan distinto ante la reasignación.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'primer-proyecto-web',
                        'title' => 'Tu primer proyecto web',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Tu primer proyecto web'],
                            ['p', 'Es hora de unir todo: una página HTML con estilos CSS y un toque de JavaScript. Construye una tarjeta de presentación personal: estructura, estilo e interacción en un solo archivo.'],
                            ['p', 'El objetivo no es la perfección, sino cerrar el ciclo completo: marcar contenido, darle estilo y añadir un comportamiento con eventos.'],
                            ['code', 'html', <<<'HTML'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Mi tarjeta</title>
    <style>
        body { font-family: system-ui; background: #eef2f7; display: grid; place-items: center; height: 100vh; }
        .tarjeta { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,.1); text-align: center; }
        button { padding: 10px 18px; border: 0; border-radius: 8px; background: #2563eb; color: white; cursor: pointer; }
    </style>
</head>
<body>
    <div class="tarjeta">
        <h1 id="titulo">Hola, soy Ana</h1>
        <p id="mensaje">Aprendo desarrollo web.</p>
        <button id="boton">Cambiar mensaje</button>
    </div>
    <script>
        const boton = document.getElementById("boton");
        const mensaje = document.getElementById("mensaje");
        boton.addEventListener("click", () => {
            mensaje.textContent = "¡Ya sé HTML, CSS y JavaScript!";
        });
    </script>
</body>
</html>
HTML],
                            ['h', 'Qué revisar al finalizar'],
                            ['list', [
                                'La estructura es semántica y válida',
                                'Los estilos se aplican por clases o etiquetas',
                                'El botón cambia el mensaje al hacer click',
                                'La página funciona en móvil y escritorio',
                            ]],
                            ['p', 'Guarda el archivo, ábrelo con un servidor local y experimenta: cambia colores, añade otra interacción. Cada iteración refuerza el aprendizaje.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'HTML estructura, CSS estiliza, JS interactúa',
                                'getElementById conecta el código con elementos',
                                'addEventListener reacciona a las acciones del usuario',
                                'Proyectos pequeños y completos enseñan más que teoría aislada',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace addEventListener en el ejemplo?', 'type' => 'single', 'answers' => [
                                    ['Ejecuta una función cuando ocurre el evento indicado', true, 'Enlaza el click del botón con la función que cambia el mensaje.'],
                                    ['Aplica estilos al elemento', false, 'Los estilos van en CSS.'],
                                    ['Carga una página nueva', false, 'Para navegar se usa location o enlaces.'],
                                    ['Compila el HTML', false, 'El HTML no se compila.'],
                                ]],
                                ['q' => '¿Qué propiedad cambia el texto de un elemento?', 'type' => 'single', 'answers' => [
                                    ['textContent', true, 'textContent asigna el texto visible del nodo.'],
                                    ['innerHTML', false, 'También cambia contenido, pero textContent es más seguro para texto plano.'],
                                    ['style', false, 'style cambia estilos, no texto.'],
                                    ['src', false, 'src apunta a recursos como imágenes.'],
                                ]],
                                ['q' => '¿Por qué conviene servir el archivo con un servidor local?', 'type' => 'single', 'answers' => [
                                    ['Porque algunos comportamientos y recursos requieren HTTP real', true, 'file:// limita ciertas APIs y recursos.'],
                                    ['Porque el navegador no abre archivos .html', false, 'Sí los abre; el servidor local evita otras limitaciones.'],
                                    ['Porque sin servidor no hay colores', false, 'Los CSS se aplican igual con file://.'],
                                    ['Porque es obligatorio publicarlo', false, 'No hace falta publicar para probar localmente.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 5. HTML, CSS y JavaScript
    // =====================================================================
    [
        'slug' => 'html-css-javascript',
        'title' => 'HTML, CSS y JavaScript',
        'description' => 'Los tres pilares de la web: estructura semántica, maquetación moderna con Flexbox y Grid, e interactividad con el DOM. Construye tus primeras interfaces desde cero.',
        'category' => 'desarrollo-frontend',
        'difficulty' => 'beginner',
        'duration_hours' => 15,
        'is_free' => true,
        'learning_path' => 'desarrollo-frontend',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'HTML Semántico',
                'description' => 'Estructura significativa, formularios y contenido multimedia.',
                'lessons' => [
                    [
                        'slug' => 'estructura-de-una-pagina-html',
                        'title' => 'Estructura semántica de una página HTML',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Estructura semántica de una página HTML'],
                            ['p', 'HTML describe la estructura: header, nav, main, section, article y footer son etiquetas semánticas que comunican significado a navegadores y lectores de pantalla.'],
                            ['p', 'Una buena estructura mejora la accesibilidad, el SEO y el mantenimiento del código, y evita el uso excesivo de divs genéricos.'],
                            ['code', 'html', <<<'HTML'
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Inicio</a></li>
        <li><a href="/blog">Blog</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h1>Semántica web</h1>
      <p>El contenido principal vive aquí.</p>
    </article>
  </main>
  <footer>© 2026</footer>
</body>
HTML],
                            ['h', 'Etiquetas semánticas más usadas'],
                            ['list', [
                                'header: cabecera de página o sección',
                                'nav: navegación principal',
                                'main: contenido único y principal',
                                'article y section: unidades de contenido',
                                'footer: pie de página',
                            ]],
                            ['p', 'Cuando una etiqueta semántica describe el contenido, el navegador y las tecnologías de asistencia saben qué esperar. Los divs quedan para agrupar sin significado, solo cuando no hay alternativa.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La semántica comunica significado',
                                'main contiene el contenido principal',
                                'nav marca la navegación',
                                'Menos divs y más etiquetas descriptivas = mejor página',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué etiqueta envuelve el contenido principal y único de la página?', 'type' => 'single', 'answers' => [
                                    ['main', true, 'main agrupa el contenido central del documento.'],
                                    ['header', false, 'header es la cabecera, no el contenido principal.'],
                                    ['footer', false, 'footer es el pie.'],
                                    ['nav', false, 'nav es para la navegación.'],
                                ]],
                                ['q' => '¿Qué beneficio aporta el HTML semántico?', 'type' => 'single', 'answers' => [
                                    ['Mejora accesibilidad, SEO y mantenimiento', true, 'El significado ayuda a lectores de pantalla y buscadores.'],
                                    ['Hace el sitio más rápido sin excepciones', false, 'Puede ayudar indirectamente, pero su beneficio es semántico.'],
                                    ['Permite programar en JavaScript', false, 'La semántica no habilita JavaScript.'],
                                    ['Reduce automáticamente el CSS', false, 'No reduce CSS.'],
                                ]],
                                ['q' => '¿Cuándo tiene sentido usar un div?', 'type' => 'single', 'answers' => [
                                    ['Cuando solo necesitas agrupar sin significado semántico', true, 'El div es el contenedor neutro.'],
                                    ['Para el contenido principal', false, 'Eso es main.'],
                                    ['Para la navegación', false, 'Eso es nav.'],
                                    ['Para el pie de página', false, 'Eso es footer.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'etiquetas-semanticas-y-accesibilidad',
                        'title' => 'Etiquetas semánticas y accesibilidad',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Etiquetas semánticas y accesibilidad'],
                            ['p', 'La accesibilidad comienza en el HTML: encabezados jerárquicos, textos de enlace descriptivos, alternativas para imágenes y formularios con labels. Son decisiones de marcado, no de diseño.'],
                            ['p', 'Los lectores de pantalla navegan por encabezados, listas y landmarks. Si tu estructura es semántica, quien no puede ver la pantalla entiende igualmente la página.'],
                            ['code', 'html', <<<'HTML'
<nav aria-label="Principal">
  <ul>
    <li><a href="/">Inicio</a></li>
    <li><a href="/precios">Ver precios</a></li>
  </ul>
</nav>

<label for="ciudad">Ciudad:</label>
<input id="ciudad" name="ciudad" type="text">
HTML],
                            ['h', 'Cheat list accesible'],
                            ['list', [
                                'Un solo h1 y jerarquía sin saltos',
                                'Texto de enlace que describe el destino',
                                'alt descriptivo en cada imagen',
                                'label asociado a cada campo de formulario',
                            ]],
                            ['p', 'La regla de oro: si la información solo se entiende por el color, la forma o el sonido, estás dejando fuera a usuarios. El HTML semántico es la primera línea de defensa.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La accesibilidad empieza en el marcado',
                                'Los encabezados jerárquicos guían la navegación',
                                'Los labels conectan texto y campos',
                                'El alt da sentido a las imágenes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo navega un lector de pantalla por una página bien estructurada?', 'type' => 'single', 'answers' => [
                                    ['Usando encabezados, listas y landmarks semánticos', true, 'Estructuras como nav, main y h1-h6 son puntos de navegación.'],
                                    ['Leyendo el código fuente completo', false, 'Lee el contenido renderizado siguiendo la estructura, no el fuente crudo.'],
                                    ['Usando solo las imágenes', false, 'Las imágenes necesitan alt para tener sentido.'],
                                    ['No puede navegar', false, 'Puede navegar si el HTML es semántico.'],
                                ]],
                                ['q' => '¿Qué hace el atributo for de un label?', 'type' => 'single', 'answers' => [
                                    ['Asocia el label con su campo mediante el id', true, 'Click en el label enfoca el campo y el lector los agrupa.'],
                                    ['Define el color del texto', false, 'Los colores van en CSS.'],
                                    ['Envía el formulario', false, 'Eso lo hace el botón submit.'],
                                    ['Oculta el campo', false, 'Eso es CSS o type=hidden.'],
                                ]],
                                ['q' => '¿Cuál es un buen texto de enlace accesible?', 'type' => 'single', 'answers' => [
                                    ['Ver precios', true, 'Describe el destino del enlace.'],
                                    ['Haz clic aquí', false, 'No dice a dónde lleva; inútil fuera de contexto.'],
                                    ['Más', false, 'Demasiado ambiguo.'],
                                    ['Pulsa este botón', false, 'No describe el destino.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'formularios-y-media',
                        'title' => 'Formularios y contenido multimedia',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Formularios y contenido multimedia'],
                            ['p', 'Los formularios recogen datos del usuario con campos tipados (texto, correo, número, fecha) y el contenido multimedia se incorpora con img, video y audio, siempre con alternativas accesibles.'],
                            ['p', 'Cada campo debe tener label, y cada recurso multimedia, un texto o pista alternativa: alt en imágenes, track de subtítulos en vídeos.'],
                            ['code', 'html', <<<'HTML'
<form>
  <label for="email">Correo:</label>
  <input type="email" id="email" name="email" required>

  <label for="nacimiento">Fecha de nacimiento:</label>
  <input type="date" id="nacimiento" name="nacimiento">

  <fieldset>
    <legend>Intereses</legend>
    <label><input type="checkbox" name="interes" value="css"> CSS</label>
    <label><input type="checkbox" name="interes" value="js"> JavaScript</label>
  </fieldset>
</form>

<video controls>
  <source src="intro.mp4" type="video/mp4">
  <track kind="subtitles" src="intro.vtt" srclang="es" label="Español">
</video>
HTML],
                            ['h', 'Buenas prácticas'],
                            ['list', [
                                'Usa el type correcto: email, url, date, number',
                                'Agrupa opciones relacionadas con fieldset y legend',
                                'Añade subtítulos y descripción a los medios',
                                'Valida en el cliente, pero confirma en el servidor',
                            ]],
                            ['p', 'Los tipos de input modernos dan teclados y validaciones adecuadas en móvil casi gratis. Aprovéchalos antes de escribir JavaScript de validación.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los tipos de input aportan validación nativa',
                                'fieldset agrupa opciones relacionadas',
                                'Los medios necesitan alternativas accesibles',
                                'La validación del cliente nunca es la última barrera',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ventaja tiene usar type=email en un input?', 'type' => 'single', 'answers' => [
                                    ['El navegador valida el formato y móvil muestra teclado adecuado', true, 'Comprobación automática y mejor UX en dispositivos táctiles.'],
                                    ['Cifra el correo', false, 'El cifrado lo maneja HTTPS, no el tipo de input.'],
                                    ['Guarda el correo en la base de datos', false, 'El guardado lo hace el servidor.'],
                                    ['Envía el formulario al cargar', false, 'No tiene ese comportamiento.'],
                                ]],
                                ['q' => '¿Para qué sirve la etiqueta fieldset?', 'type' => 'single', 'answers' => [
                                    ['Agrupar campos relacionados y darles un legend', true, 'Organiza visual y semánticamente grupos de opciones.'],
                                    ['Crear un enlace', false, 'Eso es a.'],
                                    ['Insertar una imagen', false, 'Eso es img.'],
                                    ['Aplicar estilos globales', false, 'Eso es CSS.'],
                                ]],
                                ['q' => '¿Qué alternativa accesible debe tener un vídeo?', 'type' => 'single', 'answers' => [
                                    ['Subtítulos mediante track y descripción del contenido', true, 'Las pistas de subtítulos y texto alternativo hacen el medio accesible.'],
                                    ['Un color de fondo bonito', false, 'El color no comunica el contenido del vídeo.'],
                                    ['Un enlace al mismo vídeo', false, 'Eso no añade alternativa.'],
                                    ['Ninguna, el vídeo es suficiente', false, 'Sin pistas, personas sordas o con baja visión pierden información.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Layout con CSS',
                'description' => 'Flexbox, Grid, modelo de caja y diseño responsive.',
                'lessons' => [
                    [
                        'slug' => 'css-flexbox-y-grid',
                        'title' => 'Flexbox y Grid: maquetación moderna',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Flexbox y Grid: maquetación moderna'],
                            ['p', 'Flexbox organiza elementos en una dimensión (fila o columna) y Grid en dos dimensiones (filas y columnas). Con display:flex y display:grid se resuelven la mayoría de los layouts sin floats ni trucos.'],
                            ['p', 'La clave está en dominar los ejes: en Flexbox, justify-content alinea en el eje principal y align-items en el secundario; en Grid, grid-template-columns define la plantilla.'],
                            ['code', 'css', <<<'CSS'
/* Centrar vertical y horizontalmente */
.contenedor {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

/* Rejilla de tres columnas */
.galeria {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}
CSS],
                            ['h', 'Cuándo usar cada uno'],
                            ['list', [
                                'Flexbox: alinear una fila o columna de elementos',
                                'Grid: layouts en dos dimensiones con plantilla',
                                'gap separa elementos sin márgenes extra',
                                'Combinar ambos da layouts potentes y limpios',
                            ]],
                            ['p', 'Una regla práctica: usa Grid para la estructura general de la página y Flexbox para alinear elementos dentro de un bloque. Pero ambos son flexibles y se solapan.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Flexbox: 1D; Grid: 2D',
                                'justify-content y align-items alinean en flex',
                                'grid-template-columns define las columnas',
                                'gap sustituye a los márgenes entre elementos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuándo conviene Grid por encima de Flexbox?', 'type' => 'single', 'answers' => [
                                    ['Cuando el layout necesita filas y columnas a la vez', true, 'Grid brilla en dos dimensiones con plantilla definida.'],
                                    ['Cuando hay un solo elemento que centrar', false, 'Para centrar un elemento basta Flexbox.'],
                                    ['Cuando se alinean varios botones en fila', false, 'Flexbox es ideal para esa tarea 1D.'],
                                    ['Cuando no quieres usar CSS', false, 'No es una opción; ambos son CSS.'],
                                ]],
                                ['q' => '¿Qué propiedad define las columnas de una rejilla?', 'type' => 'single', 'answers' => [
                                    ['grid-template-columns', true, 'Define la plantilla de columnas, por ejemplo repeat(3, 1fr).'],
                                    ['display: flex', false, 'Eso activa flexbox, no una rejilla.'],
                                    ['align-items', false, 'Alinea en el eje cruzado, no define columnas.'],
                                    ['gap', false, 'gap solo separa, no define la estructura.'],
                                ]],
                                ['q' => 'En un contenedor flex, ¿qué hace justify-content: center?', 'type' => 'single', 'answers' => [
                                    ['Centra los elementos en el eje principal', true, 'El eje principal depende de flex-direction.'],
                                    ['Centra los elementos en el eje cruzado', false, 'Eso es align-items.'],
                                    ['Distribuye el espacio entre líneas', false, 'Eso es más propio de Grid.'],
                                    ['Añade un margen interno', false, 'Eso es padding.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'colores-tipografia-y-box-model',
                        'title' => 'Colores, tipografía y modelo de caja',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Colores, tipografía y modelo de caja'],
                            ['p', 'El modelo de caja explica cómo se calcula el tamaño de cada elemento: contenido, padding, borde y margen. Sin entenderlo, los layouts se rompen sin explicación aparente.'],
                            ['p', 'Con box-sizing: border-box el ancho declarado incluye padding y borde, lo que hace los tamaños predecibles. La tipografía y el color definen la personalidad visual y la legibilidad.'],
                            ['code', 'css', <<<'CSS'
* { box-sizing: border-box; }

.tarjeta {
    width: 300px;
    padding: 16px;       /* dentro del borde */
    border: 1px solid #ddd;
    margin: 12px;        /* fuera del borde */
    font-family: system-ui, sans-serif;
    line-height: 1.5;
    color: #1a1a1a;
    background: #ffffff;
}
CSS],
                            ['h', 'Partes de la caja'],
                            ['list', [
                                'content: el contenido real',
                                'padding: espacio interno alrededor del contenido',
                                'border: el borde visible',
                                'margin: separación externa entre cajas',
                            ]],
                            ['p', 'Una buena base tipográfica usa tamaños relativos (rem) y un line-height cómodo. Los colores con contraste suficiente garantizan que el texto se lea en cualquier pantalla.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La caja = content + padding + border + margin',
                                'box-sizing: border-box simplifica los tamaños',
                                'Margen externo, padding interno',
                                'Contraste y legibilidad definen la calidad visual',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué incluye el ancho total de una caja con box-sizing: border-box?', 'type' => 'single', 'answers' => [
                                    ['Contenido, padding y borde dentro del ancho declarado', true, 'El ancho declarado ya incluye ambas cosas.'],
                                    ['Solo el contenido', false, 'Eso es sin box-sizing en el modelo clásico.'],
                                    ['Contenido y margen', false, 'El margen siempre queda fuera del ancho.'],
                                    ['Contenido y tipografía', false, 'La tipografía no suma al ancho.'],
                                ]],
                                ['q' => '¿Qué propiedad crea espacio interno dentro del borde?', 'type' => 'single', 'answers' => [
                                    ['padding', true, 'El padding separa el contenido del borde.'],
                                    ['margin', false, 'El margen separa la caja de otras externas.'],
                                    ['border-width', false, 'El borde es el límite, no el espacio interno.'],
                                    ['gap', false, 'gap separa elementos de flex/grid, no es interno.'],
                                ]],
                                ['q' => '¿Por qué conviene usar unidades relativas como rem para tipografía?', 'type' => 'single', 'answers' => [
                                    ['Porque respetan el tamaño base del usuario y escalan mejor', true, 'rem escala con el tamaño raíz, mejorando accesibilidad.'],
                                    ['Porque siempre ocupan menos espacio', false, 'El tamaño depende del valor, no de la unidad.'],
                                    ['Porque los píxeles están prohibidos', false, 'Los px siguen siendo válidos.'],
                                    ['Porque aceleran el renderizado', false, 'No hay ganancia de renderizado por la unidad.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'responsive-design',
                        'title' => 'Diseño responsive',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Diseño responsive'],
                            ['p', 'El diseño responsive adapta la página a cualquier pantalla: móvil, tableta o escritorio. Se construye con unidades flexibles, media queries y layouts que fluyen en vez de fijarse.'],
                            ['p', 'La estrategia mobile-first escribe primero los estilos del móvil y añade reglas para pantallas mayores con min-width. Es más simple y cubre el caso más restringido.'],
                            ['code', 'css', <<<'CSS'
/* Mobile-first: base para móvil */
.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

/* A partir de 768px: dos columnas */
@media (min-width: 768px) {
    .grid { grid-template-columns: repeat(2, 1fr); }
}

/* A partir de 1024px: tres columnas */
@media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(3, 1fr); }
}
CSS],
                            ['h', 'Principios responsive'],
                            ['list', [
                                'Layouts fluidos con %, fr o flex',
                                'Media queries con min-width escalonadas',
                                'Imágenes con max-width: 100%',
                                'Probar en tamaños reales, no solo en teoría',
                            ]],
                            ['p', 'El enfoque mobile-first obliga a decidir qué es esencial y evita diseñar para un escritorio y después encoger. Prueba siempre con las DevTools en modo dispositivo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Responsive = adaptarse a cada pantalla',
                                'Mobile-first escribe primero para móvil',
                                'Las media queries ajustan el layout por tamaño',
                                'Las imágenes fluidas nunca desbordan',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué estrategia escribe primero los estilos del móvil?', 'type' => 'single', 'answers' => [
                                    ['Mobile-first', true, 'Empieza por la pantalla más pequeña y escala hacia arriba.'],
                                    ['Desktop-first', false, 'Eso empieza por escritorio, lo contrario.'],
                                    ['Print-first', false, 'Primero impresión, no es lo habitual para web.'],
                                    ['Responsive-last', false, 'No existe como estrategia.'],
                                ]],
                                ['q' => '¿Qué hace una media query con min-width: 768px?', 'type' => 'single', 'answers' => [
                                    ['Aplica sus reglas a pantallas de 768px o más', true, 'Escalona los estilos hacia pantallas mayores.'],
                                    ['Aplica sus reglas solo a móviles', false, 'Justo lo contrario: aplica desde 768 en adelante.'],
                                    ['Oculta la página en tablets', false, 'No oculta nada.'],
                                    ['Acelera la carga en pantallas pequeñas', false, 'No tiene efecto sobre rendimiento.'],
                                ]],
                                ['q' => '¿Qué propiedad evita que una imagen desborde su contenedor?', 'type' => 'single', 'answers' => [
                                    ['max-width: 100%', true, 'La imagen nunca supera el ancho de su contenedor.'],
                                    ['height: 100vh', false, 'Eso fija altura de pantalla, no limita el ancho.'],
                                    ['display: none', false, 'Oculta la imagen, no la adapta.'],
                                    ['float: left', false, 'El float no controla el desbordamiento.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'JavaScript y el DOM',
                'description' => 'Interactividad real: eventos, manipulación del DOM y un proyecto interactivo.',
                'lessons' => [
                    [
                        'slug' => 'javascript-dom-y-eventos',
                        'title' => 'JavaScript: el DOM y los eventos',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'JavaScript: el DOM y los eventos'],
                            ['p', 'JavaScript da interactividad: selecciona elementos con querySelector, escucha eventos con addEventListener y modifica el DOM. Entender el flujo de eventos (captura y burbuja) evita bugs sutiles.'],
                            ['p', 'Los eventos viajan desde el documento hasta el elemento (captura) y vuelven hacia arriba (burbuja). Saberlo explica por qué a veces un clic dispara varios handlers.'],
                            ['code', 'javascript', <<<'JS'
const boton = document.querySelector("#enviar");
const lista = document.querySelector("#tareas");

boton.addEventListener("click", (evento) => {
    evento.preventDefault();
    const item = document.createElement("li");
    item.textContent = "Nueva tarea";
    lista.appendChild(item);
});
JS],
                            ['h', 'Operaciones DOM frecuentes'],
                            ['list', [
                                'querySelector / querySelectorAll para seleccionar',
                                'addEventListener para reaccionar',
                                'createElement + appendChild para crear nodos',
                                'textContent y classList para modificar',
                            ]],
                            ['p', 'La manipulación directa del DOM es la base; después conocerás frameworks que lo automatizan. Pero el DOM puro te da el conocimiento fundamental que cualquier framework asume.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'querySelector selecciona elementos por selector CSS',
                                'addEventListener conecta eventos con funciones',
                                'El flujo de eventos tiene captura y burbuja',
                                'Crear y añadir nodos construye interfaces dinámicas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace querySelector("#enviar")?', 'type' => 'single', 'answers' => [
                                    ['Devuelve el primer elemento con id enviar', true, 'Acepta selectores CSS y devuelve el primero que coincide.'],
                                    ['Devuelve todos los botones de la página', false, 'Para todos se usa querySelectorAll.'],
                                    ['Crea un botón nuevo', false, 'Crear requiere createElement.'],
                                    ['Ejecuta una función en el servidor', false, 'Es una operación del lado del cliente.'],
                                ]],
                                ['q' => '¿Qué hace addEventListener("click", fn)?', 'type' => 'single', 'answers' => [
                                    ['Ejecuta fn cuando ocurre un click sobre el elemento', true, 'Registra un handler para el evento click.'],
                                    ['Ejecuta fn al cargar la página', false, 'Eso sería el evento DOMContentLoaded.'],
                                    ['Envía un click al servidor', false, 'No envía nada por sí solo.'],
                                    ['Bloquea el click del usuario', false, 'No bloquea; reacciona.'],
                                ]],
                                ['q' => '¿Qué describe la fase de burbuja del flujo de eventos?', 'type' => 'single', 'answers' => [
                                    ['El evento sube desde el elemento hacia los ancestros', true, 'Después del target, el evento asciende por la jerarquía.'],
                                    ['El evento baja desde el documento al elemento', false, 'Esa es la fase de captura.'],
                                    ['El evento se cancela automáticamente', false, 'La burbuja no cancela nada.'],
                                    ['El evento se envía al servidor', false, 'Es un mecanismo del navegador, no de red.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'manipulando-el-dom',
                        'title' => 'Manipulando el DOM en la práctica',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Manipulando el DOM en la práctica'],
                            ['p', 'Construir una lista dinámica ejercita lo esencial: leer un input, crear un elemento, añadirlo y actualizar contadores. Es el patrón que repiten las aplicaciones reales.'],
                            ['p', 'Además de añadir nodos, aprenderás a borrarlos y a alternar clases CSS, dos operaciones que aparecen en casi todas las interfaces.'],
                            ['code', 'javascript', <<<'JS'
const input = document.querySelector("#tarea");
const boton = document.querySelector("#agregar");
const lista = document.querySelector("#lista");
const contador = document.querySelector("#total");

boton.addEventListener("click", () => {
    const texto = input.value.trim();
    if (!texto) return;

    const li = document.createElement("li");
    li.textContent = texto;

    li.addEventListener("click", () => {
        li.classList.toggle("hecha");
    });

    lista.appendChild(li);
    contador.textContent = lista.children.length;
    input.value = "";
});
JS],
                            ['h', 'Patrón crear-añadir-actualizar'],
                            ['list', [
                                'Leer y limpiar la entrada (trim)',
                                'Crear el nodo con createElement',
                                'Asignar contenido y comportamiento',
                                'Añadirlo y actualizar el estado visible',
                            ]],
                            ['p', 'La separación entre datos y presentación llegará con frameworks; por ahora, que cada acción del usuario actualice de forma coherente lo que se ve en pantalla.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'trim limpia la entrada antes de procesar',
                                'createElement y appendChild construyen la lista',
                                'classList.toggle alterna clases sin tocar otras',
                                'Actualizar contadores mantiene la UI coherente',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué se usa input.value.trim() antes de crear la tarea?', 'type' => 'single', 'answers' => [
                                    ['Para quitar espacios sobrantes y validar que no esté vacía', true, 'Evita entradas en blanco o con solo espacios.'],
                                    ['Para cifrar el texto', false, 'trim no cifra nada.'],
                                    ['Para convertir el texto a número', false, 'trim solo quita espacios.'],
                                    ['Para enviar el texto al servidor', false, 'No envía nada.'],
                                ]],
                                ['q' => '¿Qué hace classList.toggle("hecha")?', 'type' => 'single', 'answers' => [
                                    ['Añade la clase si no existe y la quita si existe', true, 'Alterna el estado de la clase.'],
                                    ['Siempre añade la clase', false, 'Eso sería classList.add.'],
                                    ['Siempre quita la clase', false, 'Eso sería classList.remove.'],
                                    ['Reemplaza el texto del elemento', false, 'Eso es textContent.'],
                                ]],
                                ['q' => '¿Qué operación crea un nuevo elemento sin insertarlo?', 'type' => 'single', 'answers' => [
                                    ['document.createElement("li")', true, 'Crea el nodo en memoria; appendChild lo inserta después.'],
                                    ['lista.appendChild(nodo)', false, 'Eso inserta, no crea.'],
                                    ['querySelector', false, 'Eso selecciona elementos existentes.'],
                                    ['classList.add', false, 'Eso modifica clases.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'proyecto-interactivo',
                        'title' => 'Proyecto: galería interactiva',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Proyecto: galería interactiva'],
                            ['p', 'Cierra el curso con una mini galería: una cuadrícula de tarjetas que se filtra al hacer clic en botones. Combinará HTML semántico, Grid responsive y eventos de JavaScript.'],
                            ['p', 'Los datos de las tarjetas viven en un array de JavaScript; al filtrar, se regenera la lista visible. Así practicas separar los datos de la presentación.'],
                            ['code', 'javascript', <<<'JS'
const proyectos = [
    { nombre: "Portafolio", categoria: "web" },
    { nombre: "Dashboard", categoria: "app" },
    { nombre: "Blog", categoria: "web" },
];

function renderizar(filtro = "todos") {
    const contenedor = document.querySelector("#galeria");
    contenedor.innerHTML = "";

    proyectos
        .filter((p) => filtro === "todos" || p.categoria === filtro)
        .forEach((p) => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta";
            tarjeta.textContent = p.nombre;
            contenedor.appendChild(tarjeta);
        });
}

document.querySelectorAll("[data-filtro]").forEach((boton) => {
    boton.addEventListener("click", () => renderizar(boton.dataset.filtro));
});

renderizar();
JS],
                            ['h', 'Qué incorpora el proyecto'],
                            ['list', [
                                'Semántica HTML con section y nav',
                                'Grid responsive con media queries',
                                'Datos en arrays y renderizado dinámico',
                                'Filtros con dataset y events',
                            ]],
                            ['p', 'Al terminar, tendrás una pieza completa que demuestra los tres pilares trabajando juntos. Refinarla con estilos propios es la mejor forma de consolidar el aprendizaje.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los datos separados del DOM permiten filtrar y ordenar',
                                'dataset.read attributes data-* de forma sencilla',
                                'Regenerar la lista es un patrón de renderizado válido',
                                'Los proyectos pequeños validan el dominio del trío',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ventaja tiene guardar los datos en un array y renderizar?', 'type' => 'single', 'answers' => [
                                    ['Poder filtrar, ordenar y actualizar sin tocar el HTML', true, 'Los datos son la fuente de verdad y la vista se regenera.'],
                                    ['Hace el código siempre más corto', false, 'No siempre; pero sí más mantenible.'],
                                    ['Evita usar CSS', false, 'El renderizado no elimina la necesidad de estilos.'],
                                    ['Permite programar sin variables', false, 'Necesitas variables para guardar los datos.'],
                                ]],
                                ['q' => '¿Qué es dataset en un elemento?', 'type' => 'single', 'answers' => [
                                    ['El acceso a los atributos data-* del elemento', true, 'data-filtro se lee como dataset.filtro.'],
                                    ['Una copia del DOM', false, 'Es solo el acceso a atributos data.'],
                                    ['La base de datos del navegador', false, 'IndexedDB es la BD del navegador.'],
                                    ['El conjunto de estilos aplicados', false, 'Eso es la parte de CSS, no dataset.'],
                                ]],
                                ['q' => '¿Qué hace el método filter del array en el proyecto?', 'type' => 'single', 'answers' => [
                                    ['Devuelve solo los elementos que cumplen la condición', true, 'Genera un nuevo array con los proyectos que coinciden con el filtro.'],
                                    ['Elimina elementos del array original', false, 'filter no muta el original; devuelve uno nuevo.'],
                                    ['Ordena los elementos', false, 'Ordenar es sort.'],
                                    ['Convierte el array en texto', false, 'Eso es join o JSON.stringify.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'JavaScript Asíncrono, Promesas y Fetch API',
                'description' => 'Domina el Event Loop, la programación asíncrona no bloqueante, Promesas y el consumo de APIs remotas según la documentación oficial de MDN.',
                'lessons' => [
                    [
                        'slug' => 'event-loop-y-concurrencia-js',
                        'title' => 'El Event Loop y el modelo de concurrencia',
                        'type' => 'article',
                        'duration' => 14,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'El modelo de concurrencia de JavaScript (MDN)'],
                            ['p', 'JavaScript tiene un modelo de ejecución basado en un Event Loop de hilo único (single-threaded). Esto significa que ejecuta una sola instrucción a la vez en el Call Stack (pila de llamadas). Sin embargo, puede realizar tareas pesadas en segundo plano (como peticiones de red o temporizadores) delegándolas a las Web APIs del navegador.'],
                            ['p', 'Cuando una tarea asíncrona termina, su callback se coloca en la Task Queue o Microtask Queue. El Event Loop monitorea constantemente el Call Stack: tan pronto como queda vacío, transfiere la siguiente tarea en espera.'],
                            ['code', 'javascript', <<<'JS'
console.log("1. Inicio sincronico");

setTimeout(() => {
    console.log("3. Tarea asincrona en Task Queue");
}, 0);

Promise.resolve().then(() => {
    console.log("2. Microtarea de Promesa (prioridad)");
});

console.log("1. Fin sincronico");
// Salida: 1. Inicio sincronico -> 1. Fin sincronico -> 2. Microtarea -> 3. Tarea asincrona
JS],
                            ['h', 'Call Stack vs. Task Queue'],
                            ['list', [
                                'Call Stack: Ejecuta el código sincrónico en orden LIFO (Last In, First Out)',
                                'Web APIs: Temporizadores (setTimeout), DOM events y peticiones de red manejadas por el navegador',
                                'Microtasks (Promesas): Tienen prioridad absoluta sobre la cola de tareas estándar',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué un setTimeout con 0 milisegundos se ejecuta después del código sincrónico?', 'type' => 'single', 'answers' => [
                                    ['Porque el callback debe esperar a que el Call Stack esté completamente vacío', true, 'El Event Loop solo procesa tareas de la cola cuando la pila principal termina.'],
                                    ['Porque el navegador se congela 1 segundo', false, 'El navegador no se congela.'],
                                    ['Porque 0 milisegundos es un error de sintaxis', false, '0ms es completamente válido.'],
                                    ['Porque JavaScript tiene 8 hilos ejecutando código', false, 'El motor de JS es monohilo.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'promesas-async-await-y-fetch',
                        'title' => 'Promesas, Async/Await y la Fetch API',
                        'type' => 'article',
                        'duration' => 16,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'De Callbacks a Async/Await moderno (MDN Web Docs)'],
                            ['p', 'Una Promise es un objeto que representa la terminación o el fracaso eventual de una operación asíncrona. Tiene tres estados posibles: Pending (pendiente), Fulfilled (resuelta con éxito) o Rejected (rechazada con error).'],
                            ['p', 'La sintaxis async/await es azúcar sintáctica moderna sobre las promesas, permitiendo escribir código asíncrono que se lee secuencialmente como código sincrónico.'],
                            ['code', 'javascript', <<<'JS'
// Funcion asincrona moderna para consultar una API
async function obtenerUsuarios() {
    try {
        const respuesta = await fetch("https://api.ejemplo.com/usuarios");
        
        // Importante segun MDN: fetch NO rechaza en errores HTTP 404 o 500
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        console.log("Usuarios cargados:", datos);
        return datos;
    } catch (error) {
        console.error("Fallo al conectar con el servidor:", error.message);
    }
}
JS],
                            ['h', 'Regla de oro de Fetch segun MDN'],
                            ['list', [
                                'fetch() solo rechaza una promesa si hay un fallo de red o la petición no pudo completarse',
                                'Las respuestas HTTP 404 Not Found o 500 Server Error resuelven la promesa normalmente',
                                'Siempre debes verificar if (!response.ok) antes de parsear con .json()',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => 'Según la documentación de MDN, ¿cuándo rechaza fetch() una promesa automáticamente?', 'type' => 'single', 'answers' => [
                                    ['Solo cuando ocurre un fallo de red o el servidor es inalcanzable', true, 'Los códigos 404 o 500 no rechazan la promesa; devuelven response.ok = false.'],
                                    ['Siempre que el servidor devuelve un código 404', false, 'El 404 resuelve la promesa con status 404.'],
                                    ['Cuando el archivo JSON está vacío', false, 'Eso fallaría en .json(), no en el fetch inicial.'],
                                    ['Cuando la petición tarda más de 2 segundos', false, 'A menos que uses AbortSignal, no tiene timeout por defecto.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Almacenamiento Local, Persistencia y Proyecto Final',
                'description' => 'Aprende a guardar el estado de las aplicaciones en el cliente con LocalStorage y SessionStorage, y consolida tus habilidades en un proyecto interactivo.',
                'lessons' => [
                    [
                        'slug' => 'localstorage-persistencia-cliente',
                        'title' => 'Persistencia en el navegador con LocalStorage',
                        'type' => 'article',
                        'duration' => 12,
                        'preview' => false,
                        'blocks' => [
                            ['h', 'API de Almacenamiento Web (MDN)'],
                            ['p', 'LocalStorage permite guardar pares clave-valor de tipo cadena en el navegador del usuario. A diferencia de las cookies, los datos persisten indefinidamente incluso después de cerrar la pestaña o reiniciar el navegador, y no se envían al servidor en cada petición HTTP.'],
                            ['code', 'javascript', <<<'JS'
// Guardar objetos complejos serializando a JSON
const preferencias = {
    temaOscuro: true,
    idioma: "es",
    cursosGuardados: [1, 4, 7]
};

localStorage.setItem("user_prefs", JSON.stringify(preferencias));

// Recuperar y deserializar los datos
const guardado = localStorage.getItem("user_prefs");
if (guardado) {
    const prefs = JSON.parse(guardado);
    console.log("Tema oscuro activado:", prefs.temaOscuro);
}
JS],
                            ['h', 'Diferencias clave entre LocalStorage y SessionStorage'],
                            ['list', [
                                'LocalStorage: Los datos persisten hasta que el usuario o el código los elimina',
                                'SessionStorage: Los datos se eliminan automáticamente al cerrar la pestaña actual',
                                'Capacidad: Aproximadamente 5MB a 10MB por dominio',
                                'Solo admite texto: Cualquier objeto debe convertirse con JSON.stringify() y JSON.parse()',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué método se usa para convertir un objeto de JavaScript en una cadena de texto para LocalStorage?', 'type' => 'single', 'answers' => [
                                    ['JSON.stringify(objeto)', true, 'Convierte cualquier objeto o array en una representación JSON válida.'],
                                    ['objeto.toString()', false, 'Devolvería "[object Object]", perdiendo los datos.'],
                                    ['localStorage.saveObject()', false, 'Ese método no existe en la Web API.'],
                                    ['JSON.parse(objeto)', false, 'JSON.parse hace lo inverso: convierte texto en objeto.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 6. Angular Moderno
    // =====================================================================
    [
        'slug' => 'angular-moderno',
        'title' => 'Angular Moderno',
        'description' => 'Frameworks para apps reales: componentes standalone, control flow y Signals. Aprende a estructurar una aplicación Angular con servicios HTTP, routing y lazy loading.',
        'category' => 'desarrollo-frontend',
        'difficulty' => 'intermediate',
        'duration_hours' => 18,
        'is_free' => true,
        'learning_path' => 'desarrollo-frontend',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Fundamentos de Angular',
                'description' => 'Componentes, control flow, comunicación y ciclo de vida.',
                'lessons' => [
                    [
                        'slug' => 'componentes-y-templates',
                        'title' => 'Componentes y templates',
                        'type' => 'article',
                        'duration' => 14,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Componentes y templates'],
                            ['p', 'Angular organiza la UI en componentes: cada uno tiene template, estilos y clase. Con las standalone components ya no hace falta NgModule para la mayoría de los casos.'],
                            ['p', 'La interpolación {{ }} y el data binding conectan el estado de la clase con el template de forma reactiva: cuando cambia la propiedad, la vista se actualiza.'],
                            ['code', 'typescript', <<<'TS'
import { Component } from "@angular/core";

@Component({
    selector: "app-saludo",
    standalone: true,
    template: `
        <h2>{{ titulo }}</h2>
        <p>Bienvenido, {{ usuario }}</p>
    `,
})
export class SaludoComponent {
    titulo = "Hola desde Angular";
    usuario = "Ana";
}
TS],
                            ['h', 'Partes de un componente'],
                            ['list', [
                                'Decorador @Component con metadatos',
                                'Clase con estado y lógica',
                                'Template con binding e interpolación',
                                'Estilos propios opcionales',
                            ]],
                            ['p', 'La propiedad standalone elimina la ceremonia de módulos: el componente declara en imports lo que necesita. Es el estilo recomendado en Angular moderno.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Un componente = template + clase + metadatos',
                                'La interpolación {{ }} muestra el estado',
                                'standalone simplifica la estructura',
                                'La reactividad actualiza la vista sola',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace la interpolación {{ titulo }} en el template?', 'type' => 'single', 'answers' => [
                                    ['Muestra el valor de la propiedad titulo de la clase', true, 'El template lee el estado de la clase y lo renderiza.'],
                                    ['Define una variable nueva', false, 'Interpola un valor existente, no declara variables.'],
                                    ['Carga un archivo externo', false, 'Eso es otra cosa, no interpolación.'],
                                    ['Ejecuta un método del servidor', false, 'Todo ocurre en el cliente.'],
                                ]],
                                ['q' => '¿Qué significa que un componente sea standalone?', 'type' => 'single', 'answers' => [
                                    ['Que no necesita un NgModule para declararse', true, 'Declara sus imports directamente en el decorador.'],
                                    ['Que no puede usar estilos', false, 'Sí puede usar estilos.'],
                                    ['Que solo funciona fuera de Angular', false, 'Es una característica de Angular.'],
                                    ['Que no tiene template', false, 'Todo componente tiene template.'],
                                ]],
                                ['q' => '¿Dónde vive la lógica del componente?', 'type' => 'single', 'answers' => [
                                    ['En la clase TypeScript', true, 'Propiedades y métodos están en la clase.'],
                                    ['En el template HTML', false, 'El template solo presenta el estado.'],
                                    ['En los estilos CSS', false, 'Los estilos no llevan lógica.'],
                                    ['En el archivo de configuración', false, 'La config no contiene la lógica del componente.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'control-flow-y-comunicacion',
                        'title' => 'Control flow, inputs y outputs',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Control flow, inputs y outputs'],
                            ['p', 'Los bloques @if, @for y @switch sustituyen a *ngIf y *ngFor con una sintaxis más legible y mejor rendimiento. La comunicación padre-hijo se hace con @Input y @Output.'],
                            ['p', 'El padre pasa datos con @Input; el hijo notifica eventos con @Output y EventEmitter. Este flujo unidireccional mantiene el estado predecible.'],
                            ['code', 'typescript', <<<'TS'
// En el hijo
@Component({
    selector: "app-item",
    standalone: true,
    template: `
        @if (item) {
            <p>{{ item.nombre }}</p>
        }
        <button (click)="comprar.emit(item)">Comprar</button>
    `,
})
export class ItemComponent {
    @Input({ required: true }) item: Producto | null = null;
    @Output() comprar = new EventEmitter<Producto>();
}
TS],
                            ['h', 'Nuevos bloques de control'],
                            ['list', [
                                '@if / @else condiciona el renderizado',
                                '@for recorre listas con track',
                                '@switch sustituye a ngSwitch',
                                'Comunicación: @Input entra, @Output sale',
                            ]],
                            ['p', 'Con @for usas track para identificar cada elemento y mejorar el rendimiento de las actualizaciones. La comunicación explícita padre-hijo hace el flujo de datos fácil de seguir.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                '@if y @for modernizan el template',
                                '@Input permite al padre pasar datos',
                                '@Output permite al hijo emitir eventos',
                                'El flujo unidireccional simplifica el estado',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo recibe un componente hijo datos del padre?', 'type' => 'single', 'answers' => [
                                    ['Con @Input', true, 'El padre enlaza valores a las propiedades declaradas con @Input.'],
                                    ['Con @Output', false, '@Output emite eventos hacia el padre.'],
                                    ['Con EventEmitter', false, 'Eso se usa junto a @Output para emitir.'],
                                    ['Con el router', false, 'El router navega; no comunica datos padre-hijo.'],
                                ]],
                                ['q' => '¿Qué bloque de control recorre una lista en Angular moderno?', 'type' => 'single', 'answers' => [
                                    ['@for', true, 'Sustituye a *ngFor con mejor rendimiento.'],
                                    ['@if', false, '@if condiciona; no recorre.'],
                                    ['@switch', false, '@switch elige entre casos; no recorre listas.'],
                                    ['@while', false, 'No existe @while en Angular.'],
                                ]],
                                ['q' => '¿Para qué sirve track en @for?', 'type' => 'single', 'answers' => [
                                    ['Identificar cada elemento y optimizar las actualizaciones', true, 'Angular sabe qué elementos cambiaron en vez de reconstruir todo.'],
                                    ['Ordenar la lista', false, 'El track no ordena.'],
                                    ['Agrupar los elementos', false, 'Eso es GROUP BY en SQL, no Angular.'],
                                    ['Filtrar elementos', false, 'Filtrar se hace antes de recorrer.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'estilos-y-ciclo-de-vida',
                        'title' => 'Estilos y ciclo de vida',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Estilos y ciclo de vida'],
                            ['p', 'Los componentes encapsulan sus estilos por defecto: los CSS de un componente no afectan a otros. Angular implementa esto aislando los selectores con atributos generados.'],
                            ['p', 'El ciclo de vida ofrece ganchos como ngOnInit para inicializar datos y ngOnDestroy para limpiar suscripciones. Conocerlos evita fugas de memoria y errores de orden.'],
                            ['code', 'typescript', <<<'TS'
import { Component, OnInit, OnDestroy } from "@angular/core";

@Component({
    selector: "app-datos",
    standalone: true,
    template: `<p>{{ mensaje }}</p>`,
    styles: [`p { color: #2563eb; }`],
})
export class DatosComponent implements OnInit, OnDestroy {
    mensaje = "Cargando...";

    ngOnInit() {
        this.mensaje = "Datos listos";
    }

    ngOnDestroy() {
        // Limpiar suscripciones, timers, etc.
    }
}
TS],
                            ['h', 'Ganchos más usados'],
                            ['list', [
                                'ngOnInit: inicializar datos al montar',
                                'ngOnChanges: reaccionar a cambios de @Input',
                                'ngOnDestroy: liberar recursos al desmontar',
                                'ngAfterViewInit: cuando la vista está lista',
                            ]],
                            ['p', 'La regla práctica: ngOnInit para lógica de arranque y ngOnDestroy para limpiar. Olvidar ngOnDestroy con suscripciones es la causa típica de fugas de memoria en Angular.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los estilos se encapsulan por componente',
                                'ngOnInit inicializa al montar',
                                'ngOnDestroy libera recursos',
                                'El ciclo de vida organiza cuándo ocurre cada cosa',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué se usa ngOnDestroy?', 'type' => 'single', 'answers' => [
                                    ['Limpiar suscripciones y recursos al destruir el componente', true, 'Evita fugas de memoria y callbacks colgados.'],
                                    ['Inicializar datos al montar', false, 'Eso es ngOnInit.'],
                                    ['Recargar estilos', false, 'Los estilos no se recargan con el ciclo de vida.'],
                                    ['Navegar a otra ruta', false, 'Eso es el router.'],
                                ]],
                                ['q' => '¿Cómo encapsula Angular los estilos de un componente?', 'type' => 'single', 'answers' => [
                                    ['Aislando los selectores con atributos únicos', true, 'Los estilos del componente solo aplican a su template.'],
                                    ['Guardando los CSS en el servidor', false, 'La encapsulación es del cliente, no del servidor.'],
                                    ['Eliminando el CSS global', false, 'El CSS global sigue existiendo.'],
                                    ['Convirtiendo el CSS a JavaScript', false, 'No convierte; emula el aislamiento.'],
                                ]],
                                ['q' => '¿Cuándo se ejecuta ngOnInit?', 'type' => 'single', 'answers' => [
                                    ['Una vez, cuando el componente se inicializa', true, 'Es el momento de arrancar la lógica del componente.'],
                                    ['En cada cambio de estado', false, 'Eso sería un efecto o ngOnChanges.'],
                                    ['Al destruir el componente', false, 'Eso es ngOnDestroy.'],
                                    ['Solo en modo producción', false, 'Corre siempre en ambos modos.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Estado y Datos',
                'description' => 'Signals, consumo de APIs con HttpClient y formularios reactivos.',
                'lessons' => [
                    [
                        'slug' => 'estado-con-signals',
                        'title' => 'Estado con Signals',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Estado con Signals'],
                            ['p', 'Las señales son la forma reactiva de gestionar estado en Angular: signal() declara, .set() y .update() modifican, y computed() deriva valores que se recalculan automáticamente.'],
                            ['p', 'El framework detecta los cambios con precisión y eficiencia, reduciendo la dependencia de Zone.js y haciendo las actualizaciones más predecibles.'],
                            ['code', 'typescript', <<<'TS'
import { Component, computed, signal } from "@angular/core";

@Component({
    selector: "app-carrito",
    standalone: true,
    template: `
        <p>Artículos: {{ total() }}</p>
        <button (click)="agregar()">Agregar</button>
    `,
})
export class CarritoComponent {
    cantidad = signal(0);
    total = computed(() => this.cantidad() * 10);

    agregar() {
        this.cantidad.update((c) => c + 1);
    }
}
TS],
                            ['h', 'API de signals'],
                            ['list', [
                                'signal(valor) crea una señal',
                                '.set(nuevo) reemplaza el valor',
                                '.update(fn) calcula a partir del anterior',
                                'computed(fn) deriva valores reactivos',
                            ]],
                            ['p', 'En el template las señales se usan como funciones: {{ total() }}. Angular las lee y sabe exactamente qué depende de qué, actualizando solo lo necesario.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'signal declara estado reactivo',
                                'set y update modifican señales',
                                'computed deriva valores que se recalculan solos',
                                'La detección de cambios es más precisa que antes',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cómo se crea una señal en Angular?', 'type' => 'single', 'answers' => [
                                    ['signal(valorInicial)', true, 'La función signal devuelve una señal con acceso de lectura.'],
                                    ['@var(valor)', false, 'No existe esa sintaxis en Angular.'],
                                    ['new Signal(valor)', false, 'La API es signal(), no un constructor clásico.'],
                                    ['useState(valor)', false, 'Eso es React, no Angular.'],
                                ]],
                                ['q' => '¿Qué hace computed()?', 'type' => 'single', 'answers' => [
                                    ['Deriva un valor que se recalcula cuando cambian sus dependencias', true, 'Computed reacciona automáticamente a las señales que lee.'],
                                    ['Convierte el estado en fijo', false, 'Justo lo contrario: reactivo.'],
                                    ['Envía datos al servidor', false, 'No tiene relación con la red.'],
                                    ['Crea una señal sin valor', false, 'Computed deriva, no declara estado base.'],
                                ]],
                                ['q' => '¿Por qué en el template se escribe total() con paréntesis?', 'type' => 'single', 'answers' => [
                                    ['Porque la señal es una función que se lee invocándola', true, 'Angular lee la señal como función para registrar la dependencia.'],
                                    ['Porque es un método del servidor', false, 'Es local, no del servidor.'],
                                    ['Porque total es una constante', false, 'Si fuera constante no llevaría paréntesis.'],
                                    ['Por error de sintaxis', false, 'Es la sintaxis correcta de las señales.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'http-client-y-servicios',
                        'title' => 'HttpClient y servicios',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'HttpClient y servicios'],
                            ['p', 'Los servicios encapsulan la lógica de negocio y las llamadas al backend: HttpClient devuelve Observables de RxJS que se componen con operadores como map, catchError y switchMap.'],
                            ['p', 'Inyectarlos mediante dependency injection mantiene los componentes limpios y las peticiones centralizadas en un solo lugar.'],
                            ['code', 'typescript', <<<'TS'
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ProductoService {
    private http = inject(HttpClient);

    listar(): Observable<Producto[]> {
        return this.http.get<Producto[]>("/api/productos");
    }
}
TS],
                            ['h', 'Patrones con HttpClient'],
                            ['list', [
                                'Servicios con providedIn: root para inyectar en todo',
                                'Tipar las respuestas con genéricos',
                                'Componer con map y catchError',
                                'Centralizar URLs y cabeceras en un solo lugar',
                            ]],
                            ['p', 'Los componentes llaman al servicio y se suscriben o usan la nueva sintaxis con async pipe. El servicio es el único que conoce la API, facilitando tests y cambios.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'HttpClient hace peticiones HTTP tipadas',
                                'Los servicios centralizan el acceso a la API',
                                'RxJS compone respuestas de forma declarativa',
                                'La inyección de dependencias mantiene todo testeable',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué devuelve http.get<Producto[]>(url)?', 'type' => 'single', 'answers' => [
                                    ['Un Observable que emite la lista de productos', true, 'HttpClient trabaja con Observables de RxJS.'],
                                    ['La lista de productos directamente', false, 'Devuelve el Observable; hay que suscribirse o usar async.'],
                                    ['Una Promise resuelta', false, 'Angular usa Observables, no Promises por defecto.'],
                                    ['Un error siempre', false, 'Devuelve el Observable aunque la petición pueda fallar después.'],
                                ]],
                                ['q' => '¿Por qué conviene usar servicios para las llamadas HTTP?', 'type' => 'single', 'answers' => [
                                    ['Para centralizar la lógica de API y poder testearla', true, 'Los componentes quedan limpios y el acceso se reutiliza.'],
                                    ['Porque los componentes no pueden usar HttpClient', false, 'Sí pueden; pero el servicio organiza mejor.'],
                                    ['Porque es obligatorio por el framework', false, 'Es una buena práctica, no una obligación.'],
                                    ['Para acelerar la red', false, 'No cambia la velocidad de red.'],
                                ]],
                                ['q' => '¿Qué hace providedIn: root en @Injectable?', 'type' => 'single', 'answers' => [
                                    ['Registra el servicio disponible en toda la aplicación', true, 'Se inyecta sin declararlo manualmente en cada módulo.'],
                                    ['Lo limita a un componente', false, 'providesIn: root lo hace global, no local.'],
                                    ['Lo cifra', false, 'No tiene relación con seguridad de datos.'],
                                    ['Lo convierte en standalone', false, 'Es una opción de inyección, no de empaquetado.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'formularios-reactivos',
                        'title' => 'Formularios reactivos',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Formularios reactivos'],
                            ['p', 'Los formularios reactivos modelan el estado del formulario como un objeto FormGroup con validadores. Son la opción recomendada en Angular moderno por su potencia y testabilidad.'],
                            ['p', 'Cada control se valida con reglas declarativas (required, minLength, custom). Los errores se muestran con valid (touched) preserving feedback al usuario sin sobrecargar.'],
                            ['code', 'typescript', <<<'TS'
import { Component } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: "app-registro",
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <form [formGroup]="formulario" (ngSubmit)="enviar()">
            <input formControlName="email" type="email" placeholder="Correo">
            <button type="submit">Registrar</button>
        </form>
    `,
})
export class RegistroComponent {
    formulario = new FormGroup({
        email: new FormControl("", [Validators.required, Validators.email]),
    });

    enviar() {
        if (this.formulario.valid) {
            console.log(this.formulario.value);
        }
    }
}
TS],
                            ['h', 'Conceptos clave'],
                            ['list', [
                                'FormGroup agrupa controles',
                                'FormControl guarda valor y validación',
                                'Validators declaran reglas',
                                'formControlName conecta el template con el modelo',
                            ]],
                            ['p', 'Al contrario que los template-driven, los formularios reactivos se definen en la clase: puedes validarlos, probarlos y transformarlos sin depender de la vista.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'FormGroup + FormControl modelan el formulario',
                                'Los validadores son declarativos',
                                'formControlName vincula el template',
                                'comprobar .valid antes de enviar evita datos rotos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un FormGroup?', 'type' => 'single', 'answers' => [
                                    ['Un grupo de controles que modela el formulario', true, 'Agrupa FormControls y su estado de validación.'],
                                    ['Un componente visual de Angular', false, 'Es un modelo de datos, no un componente visual.'],
                                    ['Una etiqueta HTML', false, 'Es una clase de Angular Forms.'],
                                    ['Una base de datos', false, 'No guarda datos persistentes.'],
                                ]],
                                ['q' => '¿Cómo se conecta un input con su control en el template?', 'type' => 'single', 'answers' => [
                                    ['Con la directiva formControlName', true, 'Enlaza el campo HTML con el control del modelo.'],
                                    ['Con la interpolación {{ }}', false, 'Interpolar muestra valores; no conecta entradas.'],
                                    ['Con el operador de señal', false, 'Los formularios reactivos no usan señales para conectarse.'],
                                    ['Con ngIf', false, 'ngIf condiciona elementos, no los conecta.'],
                                ]],
                                ['q' => '¿Qué hace Validators.email?', 'type' => 'single', 'answers' => [
                                    ['Valida que el valor tenga formato de correo', true, 'Añade la regla de formato al control.'],
                                    ['Envía el correo al servidor', false, 'No envía nada.'],
                                    ['Cifra el correo', false, 'La validación no cifra.'],
                                    ['Guarda el correo en localStorage', false, 'No guarda nada.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Rutas y Producción',
                'description' => 'Routing con lazy loading, guards y el build de producción.',
                'lessons' => [
                    [
                        'slug' => 'router-y-lazy-loading',
                        'title' => 'Router y lazy loading',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Router y lazy loading'],
                            ['p', 'El router enruta URLs a componentes y habilita el lazy loading: cada ruta carga su módulo o componente bajo demanda, reduciendo el bundle inicial.'],
                            ['p', 'Con loadComponent, el navegador descarga el código de una vista solo cuando el usuario navega a ella. Es una de las optimizaciones de rendimiento más efectivas en SPAs.'],
                            ['code', 'typescript', <<<'TS'
import { Routes } from "@angular/router";

export const rutas: Routes = [
    { path: "", component: HomeComponent },
    {
        path: "productos",
        loadComponent: () =>
            import("./productos/productos.component").then(
                (m) => m.ProductosComponent
            ),
    },
    { path: "**", redirectTo: "" },
];
TS],
                            ['h', 'Elementos del router'],
                            ['list', [
                                'router-outlet: el hueco donde se renderiza la ruta',
                                'RouterLink: navegación declarativa en templates',
                                'loadComponent: carga diferida de componentes',
                                'wildcard ** : captura rutas desconocidas',
                            ]],
                            ['p', 'Organizar las rutas en archivos separados y cargar las vistas bajo demanda mantiene la aplicación ágil aunque crezca en tamaño.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El router mapea URLs a componentes',
                                'loadComponent activa el lazy loading',
                                'router-outlet marca dónde renderizar',
                                'Rutas desconocidas se manejan con el wildcard',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace loadComponent en una ruta?', 'type' => 'single', 'answers' => [
                                    ['Carga el componente de forma diferida al navegar', true, 'El código de la vista se descarga solo cuando se necesita.'],
                                    ['Carga todos los componentes al iniciar', false, 'Justo lo contrario: difiere la carga.'],
                                    ['Recarga la página', false, 'Es carga de módulos, no recarga de página.'],
                                    ['Descarga datos de la API', false, 'Carga código, no datos.'],
                                ]],
                                ['q' => '¿Dónde se renderiza el componente de la ruta activa?', 'type' => 'single', 'answers' => [
                                    ['En la etiqueta router-outlet', true, 'La vista activa se inserta en ese hueco.'],
                                    ['En cualquier div', false, 'Sin router-outlet, el router no tiene dónde pintar.'],
                                    ['En el body del index.html', false, 'El router-outlet vive dentro de un componente raíz.'],
                                    ['En una iframe', false, 'No usa iframes.'],
                                ]],
                                ['q' => '¿Qué beneficio principal aporta el lazy loading?', 'type' => 'single', 'answers' => [
                                    ['Reduce el bundle inicial y acelera el arranque', true, 'El usuario solo descarga lo que va a usar.'],
                                    ['Elimina el router', false, 'El router es quien lo habilita.'],
                                    ['Cifra las rutas', false, 'No cifra nada.'],
                                    ['Convierte la app en estática', false, 'Sigue siendo una SPA.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'guards-y-resolvers',
                        'title' => 'Guards y resolvers',
                        'type' => 'article',
                        'duration' => 13,
                        'blocks' => [
                            ['h', 'Guards y resolvers'],
                            ['p', 'Los guards protegen rutas según autenticación o roles, y los resolvers preparan datos antes de renderizar la vista. Ambos se ejecutan durante la navegación.'],
                            ['p', 'Un guard canActivate devuelve true y deja pasar, o false y redirige a login. Un resolver carga datos y los entrega al componente ya resueltos.'],
                            ['code', 'typescript', <<<'TS'
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const requiereLogin: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.estaAutenticado()) {
        return true;
    }
    return router.createUrlTree(["/login"]);
};
TS],
                            ['h', 'Tipos de guards'],
                            ['list', [
                                'canActivate: permite o bloquea entrar a una ruta',
                                'canDeactivate: permite o bloquea salir',
                                'canLoad: controla la carga diferida',
                                'Resolvers: entregan datos antes de pintar',
                            ]],
                            ['p', 'La seguridad real siempre vive en el backend; los guards son UX y organización: evitan que el usuario vea pantallas para las que no tiene permiso.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Los guards controlan el acceso a rutas',
                                'canActivate bloquea o redirige',
                                'Los resolvers preparan datos antes de renderizar',
                                'El backend siempre debe validar de nuevo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace un guard canActivate?', 'type' => 'single', 'answers' => [
                                    ['Decide si el usuario puede entrar a la ruta', true, 'Devuelve true para permitir o false/redirección para bloquear.'],
                                    ['Carga los estilos de la ruta', false, 'Los estilos no se gestionan con guards.'],
                                    ['Envía el formulario', false, 'Eso es del formulario, no del router.'],
                                    ['Optimiza el bundle', false, 'Eso es lazy loading, no guards.'],
                                ]],
                                ['q' => '¿Qué entrega un resolver antes de renderizar la vista?', 'type' => 'single', 'answers' => [
                                    ['Los datos que el componente necesita, ya cargados', true, 'El componente recibe los datos resueltos al activarse.'],
                                    ['El CSS compilado', false, 'El CSS no viaja en resolvers.'],
                                    ['Las credenciales del servidor', false, 'Los resolvers no manejan secretos.'],
                                    ['El bundle de la ruta', false, 'Eso es lazy loading.'],
                                ]],
                                ['q' => '¿Por qué los guards no son suficiente seguridad?', 'type' => 'single', 'answers' => [
                                    ['Porque el backend debe proteger los datos por su cuenta', true, 'El cliente es controlable; la autorización real vive en el servidor.'],
                                    ['Porque son lentos', false, 'La velocidad no es la razón.'],
                                    ['Porque se pueden eliminar del bundle', false, 'Aunque se eliminen, el backend debe proteger.'],
                                    ['Porque no funcionan en producción', false, 'Funcionan; no son la frontera de confianza.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'despliegue-angular',
                        'title' => 'Build de producción y despliegue',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Build de producción y despliegue'],
                            ['p', 'ng build genera los archivos estáticos optimizados: minificados, con hash en los nombres para cachear y listos para cualquier hosting estático.'],
                            ['p', 'En producción hay que configurar el rewrite del servidor para que todas las rutas de la SPA apunten a index.html, y ajustar la URL de la API con environments o variables.'],
                            ['code', 'bash', <<<'BASH'
# Build de producción
ng build --configuration production

# Se generan en dist/ archivos estáticos listos para servir
# Ejemplo con un servidor estático simple
npx http-server dist/browser -p 8080
BASH],
                            ['h', 'Checklist de despliegue'],
                            ['list', [
                                'Build con configuración de producción',
                                'Serve los estáticos con CDN o hosting',
                                'Rewrite de todas las rutas a index.html',
                                'Variables de entorno para la API',
                            ]],
                            ['p', 'Como el routing lo gestiona Angular en el cliente, el servidor debe devolver index.html para cualquier ruta; si devuelve 404, refrescar /productos romperá la app.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'ng build produce estáticos optimizados',
                                'El hosting debe hacer fallback a index.html',
                                'La URL de la API se configura por entorno',
                                'Probar el build final antes de publicar',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué genera ng build --configuration production?', 'type' => 'single', 'answers' => [
                                    ['Archivos estáticos optimizados y minificados', true, 'El resultado es servible por cualquier hosting estático.'],
                                    ['Un binario de escritorio', false, 'Angular genera web estática, no binarios de escritorio.'],
                                    ['Un backup de la base de datos', false, 'No toca la base de datos.'],
                                    ['El código fuente comprimido', false, 'Genera el bundle, no el fuente.'],
                                ]],
                                ['q' => '¿Por qué el servidor debe redirigir todas las rutas a index.html?', 'type' => 'single', 'answers' => [
                                    ['Porque el router de Angular maneja las rutas en el cliente', true, 'Al refrescar /productos, el servidor debe devolver la SPA.'],
                                    ['Porque index.html es el único archivo', false, 'Hay muchos assets; index.html es la entrada.'],
                                    ['Porque sin ello el build falla', false, 'El build no se ve afectado por el servidor.'],
                                    ['Porque el servidor no puede servir estáticos', false, 'Sí puede; el rewrite es para las rutas SPA.'],
                                ]],
                                ['q' => '¿Dónde se configura la URL de la API para producción?', 'type' => 'single', 'answers' => [
                                    ['En environments o variables de entorno del build', true, 'Los entornos de Angular separan dev y prod.'],
                                    ['Dentro del HTML de cada componente', false, 'No se hardcodea en componentes.'],
                                    ['En el router', false, 'El router navega; no guarda URLs de API.'],
                                    ['En el CSS', false, 'No tiene relación.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 7. Accesibilidad y Performance Web
    // =====================================================================
    [
        'slug' => 'accesibilidad-y-performance-web',
        'title' => 'Accesibilidad y Performance Web',
        'description' => 'Haz tu interfaz usable para todas las personas y rápida para todos los dispositivos: criterios WCAG y métricas Core Web Vitals en la práctica.',
        'category' => 'desarrollo-frontend',
        'difficulty' => 'intermediate',
        'duration_hours' => 8,
        'is_free' => true,
        'learning_path' => 'desarrollo-frontend',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Accesibilidad',
                'description' => 'WCAG, HTML accesible, ARIA y herramientas de verificación.',
                'lessons' => [
                    [
                        'slug' => 'accesibilidad-wcag',
                        'title' => 'Accesibilidad: WCAG en la práctica',
                        'type' => 'article',
                        'duration' => 14,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Accesibilidad: WCAG en la práctica'],
                            ['p', 'WCAG define criterios para que la web sea usable por todas las personas: contraste suficiente, alternativas de texto, navegación por teclado y roles ARIA. La accesibilidad no es opcional: es calidad.'],
                            ['p', 'Los criterios se organizan en niveles A, AA y AAA. El nivel AA es el objetivo habitual para sitios públicos y el requerido por muchas normativas.'],
                            ['code', 'css', <<<'CSS'
/* Contraste AA: texto gris claro sobre blanco no pasa */
.enlace {
    color: #2563eb;      /* contraste suficiente vs blanco */
}

.texto-bajo {
    color: #999999;      /* evita: contraste insuficiente */
}
CSS],
                            ['h', 'Criterios que más se incumplen'],
                            ['list', [
                                'Contraste de texto insuficiente',
                                'Imágenes sin alternativa textual',
                                'Elementos no operables por teclado',
                                'Formularios sin labels',
                            ]],
                            ['p', 'La regla práctica: si solo usas el ratón o solo ves los colores para entender tu interfaz, otras personas no podrán usarla. Probar con teclado y con lectores de pantalla lo revela.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'WCAG define niveles A, AA y AAA',
                                'AA es el objetivo estándar',
                                'Contraste, alt y teclado son los básicos',
                                'La accesibilidad beneficia a todas las personas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué nivel de WCAG es el objetivo habitual para sitios públicos?', 'type' => 'single', 'answers' => [
                                    ['AA', true, 'Es el nivel estándar exigido por normativas y buenas prácticas.'],
                                    ['A', false, 'A es el mínimo básico, suele ser insuficiente.'],
                                    ['AAA', false, 'AAA es deseable pero difícil de lograr en todo el sitio.'],
                                    ['No hay niveles', false, 'Sí hay niveles A, AA y AAA.'],
                                ]],
                                ['q' => '¿Qué problema tiene un texto gris claro sobre fondo blanco?', 'type' => 'single', 'answers' => [
                                    ['Contraste insuficiente que dificulta la lectura', true, 'El contraste debe cumplir la relación mínima del criterio.'],
                                    ['Que ocupa más espacio', false, 'El color no cambia el tamaño.'],
                                    ['Que el navegador no lo renderiza', false, 'Se renderiza; el problema es legibilidad.'],
                                    ['Que no se puede seleccionar', false, 'Se puede seleccionar.'],
                                ]],
                                ['q' => '¿Qué significa que un elemento sea operable por teclado?', 'type' => 'single', 'answers' => [
                                    ['Que se puede usar con Tab y Enter sin ratón', true, 'Toda funcionalidad debe ser alcanzable por teclado.'],
                                    ['Que solo funciona con atajos avanzados', false, 'Lo básico es tabulación y activación estándar.'],
                                    ['Que no necesita foco visible', false, 'El foco visible es parte de la operabilidad.'],
                                    ['Que se usa solo en portátiles', false, 'No tiene relación con el dispositivo.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'html-accesible-y-aria',
                        'title' => 'HTML accesible y ARIA',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'HTML accesible y ARIA'],
                            ['p', 'Antes de ARIA, el HTML semántico resuelve la mayoría de los casos: botones reales, labels, encabezados jerárquicos y landmarks. ARIA complementa donde el HTML nativo no alcanza.'],
                            ['p', 'La regla de oro de ARIA: no usarlo si el HTML nativo ya lo resuelve. Un div con role=button no sustituye a un botón real, que trae teclado y focus gratis.'],
                            ['code', 'html', <<<'HTML'
<!-- Mal: un div que parece botón -->
<div class="btn" onclick="guardar()">Guardar</div>

<!-- Bien: botón nativo -->
<button class="btn" onclick="guardar()">Guardar</button>

<!-- ARIA para estados que el HTML no expresa -->
<button aria-expanded="false" aria-controls="menu">Menú</button>
<div id="menu" role="menu">...</div>
HTML],
                            ['h', 'Principios ARIA'],
                            ['list', [
                                'Prefiere HTML semántico siempre',
                                'aria-label nombra elementos sin texto visible',
                                'aria-expanded comunica estado de acordeones',
                                'aria-label overrides el texto visible si cambia',
                            ]],
                            ['p', 'Usar ARIA bien exige conocer lo que hace cada atributo; un uso incorrecto puede confundir más que ayudar a los lectores de pantalla.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El HTML semántico es la primera accesibilidad',
                                'ARIA complementa, no sustituye',
                                'aria-expanded y aria-controls para menús',
                                'Los botones reales traen comportamiento gratis',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué es mejor un button real que un div con role=button?', 'type' => 'single', 'answers' => [
                                    ['Porque el botón nativo trae teclado, foco y comportamiento', true, 'El HTML nativo incluye lo que ARIA debe imitar.'],
                                    ['Porque el div no puede tener estilos', false, 'El div sí puede estilizarse.'],
                                    ['Porque el button ocupa menos memoria', false, 'No hay diferencia relevante de memoria.'],
                                    ['Porque el div no admite onclick', false, 'Sí admite, pero pierde semántica.'],
                                ]],
                                ['q' => '¿Qué comunica aria-expanded="false"?', 'type' => 'single', 'answers' => [
                                    ['Que el control está cerrado y su contenido oculto', true, 'Los lectores de pantalla anuncian el estado del acordeón.'],
                                    ['Que el botón está deshabilitado', false, 'Eso es disabled.'],
                                    ['Que el elemento está fuera de la página', false, 'Eso es aria-hidden u ocultar.'],
                                    ['Que el campo es obligatorio', false, 'Eso es required.'],
                                ]],
                                ['q' => '¿Cuál es la primera opción antes de usar ARIA?', 'type' => 'single', 'answers' => [
                                    ['Comprobar si el HTML nativo resuelve el caso', true, 'ARIA solo donde el nativo no llega.'],
                                    ['Añadir roles a todos los divs', false, 'Es justo el anti-patrón que se debe evitar.'],
                                    ['Quitar los labels', false, 'Los labels son necesarios.'],
                                    ['Ignorar la accesibilidad', false, 'ARIA existe para mejorarla, no para ignorarla.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'testing-de-accesibilidad',
                        'title' => 'Herramientas para evaluar accesibilidad',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Herramientas para evaluar accesibilidad'],
                            ['p', 'Las herramientas automatizadas detectan una parte de los problemas: contraste, alt faltantes, labels ausentes y roles incorrectos. El resto requiere pruebas manuales con teclado y lectores de pantalla.'],
                            ['p', 'Lighthouse y axe devuelven informes accionables desde el navegador. Ninguna herramienta sustituye a probar con usuarios reales.'],
                            ['code', 'bash', <<<'BASH'
# Instalar axe-core y correr análisis en Node
npm install --save-dev @axe-core/cli
npx @axe-core/cli https://example.com

# En DevTools: panel Lighthouse -> Accessibility
BASH],
                            ['h', 'Flujo de verificación'],
                            ['list', [
                                'Auditoría automática con Lighthouse o axe',
                                'Navegación solo con teclado',
                                'Prueba con lector de pantalla',
                                'Revisión de contraste y foco visible',
                            ]],
                            ['p', 'Integra las auditorías al pipeline: un test que falle cuando la accesibilidad empeora es la única forma de que no se deteriore con el tiempo.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La automatización cubre una parte de los problemas',
                                'axe y Lighthouse dan informes accionables',
                                'Teclado y lector de pantalla son imprescindibles',
                                'Automatizar en CI evita regresiones',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué detectan las herramientas automáticas de accesibilidad?', 'type' => 'single', 'answers' => [
                                    ['Problemas objetivos como contraste y alt faltante', true, 'Reglas verificables programáticamente.'],
                                    ['Todos los problemas posibles', false, 'Hay problemas que solo se ven con uso real.'],
                                    ['La intención del diseñador', false, 'Eso no es verificable por máquina.'],
                                    ['La calidad del código backend', false, 'Se centran en el frontend accesible.'],
                                ]],
                                ['q' => '¿Qué prueba manual no puede sustituir ninguna herramienta?', 'type' => 'single', 'answers' => [
                                    ['Probar con un lector de pantalla real', true, 'La experiencia real de usuario es insustituible.'],
                                    ['Medir los milisegundos de carga', false, 'Eso es automatizable.'],
                                    ['Contar las líneas de código', false, 'No es una prueba de accesibilidad.'],
                                    ['Revisar los commits', false, 'Eso es historia, no accesibilidad.'],
                                ]],
                                ['q' => '¿Por qué conviene integrar la auditoría en CI?', 'type' => 'single', 'answers' => [
                                    ['Para que cualquier regresión de accesibilidad bloquee el merge', true, 'El test actúa como red de seguridad continua.'],
                                    ['Para acelerar el build', false, 'Añade tiempo de ejecución, no lo acelera.'],
                                    ['Para sustituir a los desarrolladores', false, 'Complementa, no sustituye.'],
                                    ['Para publicar sin revisar', false, 'Sigue haciendo falta revisión humana.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Performance',
                'description' => 'Core Web Vitals, optimización de recursos y métricas en producción.',
                'lessons' => [
                    [
                        'slug' => 'core-web-vitals',
                        'title' => 'Core Web Vitals y performance',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Core Web Vitals y performance'],
                            ['p', 'LCP, INP y CLS son las métricas que evalúan la experiencia real: cuánto tarda en cargar el contenido principal, la latencia de interacción y la estabilidad visual.'],
                            ['p', 'LCP mide la carga del contenido más grande; INP la respuesta a las interacciones; CLS los saltos de layout. Optimizarlas impacta directamente en la satisfacción y en el SEO.'],
                            ['code', 'javascript', <<<'JS'
// Observar Core Web Vitals en producción
const vitals = new PerformanceObserver((lista) => {
    for (const entrada of lista.getEntries()) {
        console.log(entrada.name, entrada.value);
    }
});
vitals.observe({ type: "largest-contentful-paint", buffered: true });
JS],
                            ['h', 'Objetivos recomendados'],
                            ['list', [
                                'LCP menor de 2.5 segundos',
                                'INP menor de 200 milisegundos',
                                'CLS menor de 0.1',
                                'Medir en campo con usuarios reales',
                            ]],
                            ['p', 'Las métricas de laboratorio (Lighthouse) y las de campo (CrUX) se complementan: el laboratorio detecta regresiones y el campo muestra la experiencia real de los usuarios.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'LCP: carga del contenido principal',
                                'INP: latencia de interacción',
                                'CLS: estabilidad visual',
                                'Medir en campo es la verdad final',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué mide LCP?', 'type' => 'single', 'answers' => [
                                    ['El tiempo de carga del contenido principal más grande', true, 'Largest Contentful Paint marca lo que el usuario ve primero.'],
                                    ['La estabilidad visual', false, 'Eso es CLS.'],
                                    ['La respuesta a los clics', false, 'Eso es INP.'],
                                    ['El número de peticiones', false, 'No es una métrica Core Web Vital.'],
                                ]],
                                ['q' => '¿Cuál es el objetivo recomendado de INP?', 'type' => 'single', 'answers' => [
                                    ['Menos de 200 milisegundos', true, 'Interacciones que responden rápido se sienten instantáneas.'],
                                    ['Menos de 2.5 segundos', false, 'Ese es el objetivo de LCP.'],
                                    ['Menos de 10 segundos', false, 'Sería demasiado lento para INP.'],
                                    ['Exactamente 0', false, 'Imposible y innecesario.'],
                                ]],
                                ['q' => '¿Qué causa un CLS alto?', 'type' => 'single', 'answers' => [
                                    ['Elementos que se mueven después de cargar sin espacio reservado', true, 'Imágenes sin dimensiones o contenido inyectado tarde.'],
                                    ['Scripts demasiado largos', false, 'Eso afecta a INP o TBT.'],
                                    ['Muchos colores', false, 'Los colores no mueven el layout.'],
                                    ['Un servidor lento', false, 'Eso afecta a la carga, no a los saltos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'optimizacion-de-recursos',
                        'title' => 'Optimización de recursos',
                        'type' => 'code_challenge',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Optimización de recursos'],
                            ['p', 'Las imágenes dominan el peso de la mayoría de las páginas. Servirlas en formatos modernos, con el tamaño correcto y lazy loading reduce drásticamente los bytes transferidos.'],
                            ['p', 'El JavaScript también se optimiza: elimina lo que no se usa, difiere la carga no crítica y carga bajo demanda las rutas secundarias.'],
                            ['code', 'html', <<<'HTML'
<!-- Imagen responsive con formatos modernos -->
<img
    src="foto.avif"
    srcset="foto-400.avif 400w, foto-800.avif 800w"
    sizes="(max-width: 768px) 100vw, 800px"
    width="800" height="600"
    loading="lazy"
    alt="Descripción">

<!-- Cargar scripts sin bloquear el render -->
<script src="app.js" defer></script>
HTML],
                            ['h', 'Palancas de optimización'],
                            ['list', [
                                'Formatos modernos: WebP/AVIF en vez de JPEG/PNG',
                                'Tamaño correcto: nunca servir 2000px donde caben 400',
                                'loading=lazy en imágenes fuera del viewport',
                                'defer/async para scripts no críticos',
                            ]],
                            ['p', 'Declarar width y height evita el CLS por imágenes; el lazy loading retrasa descargas que el usuario aún no ve. Combinadas, estas dos prácticas son de las más rentables.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Las imágenes son el mayor peso típico',
                                'Formato y tamaño correctos ahorran megabytes',
                                'lazy loading descarga solo lo visible',
                                'width y height evitan saltos de layout',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace loading="lazy" en una imagen?', 'type' => 'single', 'answers' => [
                                    ['Aplaza la descarga hasta que la imagen se acerca al viewport', true, 'No se descarga lo que aún no se ve.'],
                                    ['Comprime la imagen en el servidor', false, 'La carga diferida no comprime.'],
                                    ['La hace más nítida', false, 'No cambia la calidad.'],
                                    ['La oculta para siempre', false, 'La carga cuando toca.'],
                                ]],
                                ['q' => '¿Por qué declarar width y height en las imágenes?', 'type' => 'single', 'answers' => [
                                    ['Para reservar el espacio y evitar CLS', true, 'El navegador conoce el tamaño antes de descargar.'],
                                    ['Para que se vean más grandes', false, 'Eso depende de CSS, no solo de los atributos.'],
                                    ['Para cifrar la imagen', false, 'No cifra nada.'],
                                    ['Para hacerlas responsive automáticamente', false, 'Responsive se logra con srcset y sizes.'],
                                ]],
                                ['q' => '¿Qué ventaja tiene AVIF sobre JPEG?', 'type' => 'single', 'answers' => [
                                    ['Mejor compresión a calidad similar', true, 'Menos bytes con calidad comparable, soportado en navegadores modernos.'],
                                    ['Se carga siempre más rápido por red', false, 'Depende de infraestructura, no del formato.'],
                                    ['Permite programar en el navegador', false, 'Es un formato de imagen, no de código.'],
                                    ['No necesita atributo alt', false, 'El alt sigue siendo obligatorio.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'medicion-y-presupuestos',
                        'title' => 'Medición y presupuestos de rendimiento',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Medición y presupuestos de rendimiento'],
                            ['p', 'Un presupuesto de rendimiento fija límites: máximo de kilobytes por página, máximo de peticiones, tiempo máximo de LCP. Lo que no se mide, se degrada sin aviso.'],
                            ['p', 'Herramientas como Lighthouse CI comparan cada cambio con el presupuesto y bloquean si se excede. Así el rendimiento se trata como una característica más.'],
                            ['code', 'bash', <<<'BASH'
# Ejemplo de presupuesto con Lighthouse CI en package.json
# "budgets": [{ "path": "/*", "resourceSizes": [
#   { "resourceType": "script", "budget": 150 },
#   { "resourceType": "image", "budget": 300 }
# ]}]
BASH],
                            ['h', 'Qué incluir en el presupuesto'],
                            ['list', [
                                'Peso total de la página',
                                'Peso de JavaScript por ruta',
                                'Número de peticiones',
                                'Core Web Vitals objetivo',
                            ]],
                            ['p', 'Empieza midiendo el estado actual: sin línea de base no hay presupuesto realista. Después fija límites ligeramente mejores y revisa cada semana.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Sin medición no hay mejora sostenida',
                                'El presupuesto convierte el rendimiento en requisito',
                                'Lighthouse CI automatiza el control',
                                'La línea de base precede al presupuesto',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué es un presupuesto de rendimiento?', 'type' => 'single', 'answers' => [
                                    ['Un límite de recursos o métricas que la página no debe superar', true, 'Convierte el rendimiento en un requisito verificable.'],
                                    ['El presupuesto económico del proyecto', false, 'Es técnico, no económico.'],
                                    ['El número de desarrolladores', false, 'No tiene relación.'],
                                    ['Una lista de colores permitidos', false, 'Eso es una guía visual.'],
                                ]],
                                ['q' => '¿Por qué medir el estado actual antes de fijar el presupuesto?', 'type' => 'single', 'answers' => [
                                    ['Porque sin línea de base los límites son arbitrarios', true, 'La realidad actual marca límites alcanzables.'],
                                    ['Porque la medición descarga la página', false, 'Medir no descarga.'],
                                    ['Porque los usuarios lo exigen', false, 'Es una buena ingeniería, no una exigencia.'],
                                    ['Porque el servidor lo necesita', false, 'No es un requisito del servidor.'],
                                ]],
                                ['q' => '¿Qué hace Lighthouse CI en el pipeline?', 'type' => 'single', 'answers' => [
                                    ['Mide y compara cada cambio contra el presupuesto', true, 'Bloquea el merge si se superan los límites.'],
                                    ['Despliega la aplicación', false, 'Eso es CI/CD de despliegue.'],
                                    ['Escribe los tests', false, 'Solo mide rendimiento.'],
                                    ['Diseña la interfaz', false, 'No diseña.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
