<?php

/*
 * Cursos fullstack: integración frontend/backend, JWT y despliegue.
 */

return [
    // =====================================================================
    // 12. Integración Frontend ↔ Backend
    // =====================================================================
    [
        'slug' => 'integracion-frontend-backend',
        'title' => 'Integración Frontend ↔ Backend',
        'description' => 'Convierte la API en un contrato vivo entre equipos: documentación, manejo de CORS y tokens desde el frontend, y un flujo de datos sin fricción.',
        'category' => 'desarrollo-web',
        'difficulty' => 'intermediate',
        'duration_hours' => 12,
        'is_free' => true,
        'learning_path' => 'desarrollo-fullstack',
        'learning_path_level' => 1,
        'order' => 1,
        'modules' => [
            [
                'title' => 'La API como Contrato',
                'description' => 'Documentación, consumo y errores bien comunicados entre equipos.',
                'lessons' => [
                    [
                        'slug' => 'api-como-contrato',
                        'title' => 'La API como contrato entre equipos',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'La API como contrato entre equipos'],
                            ['p', 'En una aplicación fullstack, la API es el contrato entre frontend y backend. Definir endpoints, esquemas de respuesta y códigos de error por adelantado evita fricción entre equipos.'],
                            ['p', 'Herramientas como OpenAPI documentan el contrato y permiten generar clientes tipados y mocks para desarrollar en paralelo.'],
                            ['code', 'yaml', <<<'YAML'
openapi: 3.0.0
info:
  title: API de Cursos
  version: 1.0.0
paths:
  /api/cursos:
    get:
      summary: Lista los cursos publicados
      responses:
        "200":
          description: Lista de cursos
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
YAML],
                            ['h', 'Qué define un contrato de API'],
                            ['list', [
                                'Endpoints y métodos disponibles',
                                'Formato de petición y respuesta',
                                'Códigos de error y su significado',
                                'Autenticación requerida',
                            ]],
                            ['p', 'Cuando el contrato está documentado, frontend y backend avanzan en paralelo con mocks y clients generados, y las discrepancias se detectan en integración, no en producción.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'La API es un contrato entre equipos',
                                'OpenAPI documenta endpoints y esquemas',
                                'Los mocks permiten desarrollar en paralelo',
                                'Un contrato claro reduce fricción y malentendidos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué papel juega la API en un equipo fullstack?', 'type' => 'single', 'answers' => [
                                    ['Es el contrato que acuerda cómo se comunican frontend y backend', true, 'Define qué pide cada lado y qué responde el otro.'],
                                    ['Es la base de datos compartida', false, 'La BD está detrás del backend.'],
                                    ['Es el diseño de la interfaz', false, 'El diseño es del frontend.'],
                                    ['Es el servidor de correo', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Para qué sirve la especificación OpenAPI?', 'type' => 'single', 'answers' => [
                                    ['Documentar la API y generar clientes y mocks', true, 'Es la fuente de verdad del contrato.'],
                                    ['Compilar el frontend', false, 'No compila nada.'],
                                    ['Crear la base de datos', false, 'No crea BD.'],
                                    ['Cifrar las peticiones', false, 'El cifrado es HTTPS.'],
                                ]],
                                ['q' => '¿Qué beneficio da desarrollar con mocks?', 'type' => 'single', 'answers' => [
                                    ['Frontend y backend avanzan en paralelo sin bloquearse', true, 'El mock simula la API antes de que exista.'],
                                    ['Elimina la necesidad de backend', false, 'El mock es temporal, el backend real llega después.'],
                                    ['Acelera el servidor real', false, 'No acelera nada real.'],
                                    ['Evita escribir CSS', false, 'No tiene relación con estilos.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'consumiendo-la-api-desde-el-frontend',
                        'title' => 'Consumiendo la API desde el frontend',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Consumiendo la API desde el frontend'],
                            ['p', 'El frontend consume la API con fetch o un cliente HTTP (axios, HttpClient de Angular). La clave es manejar estados: cargando, éxito, error y vacío.'],
                            ['p', 'Un servicio o hook centraliza las llamadas y expone estados tipados; los errores se muestran con mensajes útiles y las cargas con indicadores.'],
                            ['code', 'javascript', <<<'JS'
async function cargarCursos() {
    const estado = document.querySelector("#estado");

    try {
        estado.textContent = "Cargando...";
        const respuesta = await fetch("/api/cursos");

        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}`);
        }

        const { data } = await respuesta.json();
        renderizar(data);
        estado.textContent = "";
    } catch (error) {
        estado.textContent = "No se pudieron cargar los cursos";
    }
}
JS],
                            ['h', 'Buenas prácticas de consumo'],
                            ['list', [
                                'Centralizar llamadas en servicios o hooks',
                                'Gestionar cargando, éxito y error',
                                'Tipar las respuestas',
                                'Mostrar mensajes útiles al usuario',
                            ]],
                            ['p', 'Un frontend robusto nunca asume que la API responde: la red falla, el servidor tarda y los datos cambian. Manejar esos estados es la diferencia entre una app frágil y una sólida.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'fetch o HttpClient consumen la API',
                                'Cada llamada tiene cargando, éxito y error',
                                'Centralizar evita duplicar lógica de red',
                                'Los errores se comunican al usuario',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué estados debería manejar una llamada a la API?', 'type' => 'single', 'answers' => [
                                    ['Cargando, éxito, error y vacío', true, 'La UI debe reflejar cada momento del ciclo.'],
                                    ['Solo éxito', false, 'La red falla: sin manejo de errores la app se rompe.'],
                                    ['Solo error', false, 'También hay que mostrar datos cuando llegan.'],
                                    ['Ninguno, la API nunca falla', false, 'Asumir eso es una receta para bugs.'],
                                ]],
                                ['q' => '¿Qué hace !respuesta.ok en el ejemplo?', 'type' => 'single', 'answers' => [
                                    ['Detecta respuestas HTTP que no son 2xx', true, 'fetch no lanza error en 4xx/5xx; hay que comprobarlo tú.'],
                                    ['Comprueba que el cuerpo sea JSON', false, 'Eso es respuesta.json().'],
                                    ['Cancela la petición', false, 'No cancela nada.'],
                                    ['Valida el token', false, 'No valida autenticación.'],
                                ]],
                                ['q' => '¿Por qué centralizar las llamadas en un servicio?', 'type' => 'single', 'answers' => [
                                    ['Para reutilizar URLs, cabeceras y manejo de errores en un lugar', true, 'Un solo punto de cambio cuando la API evoluciona.'],
                                    ['Porque fetch no funciona en componentes', false, 'Sí funciona; el servicio organiza mejor.'],
                                    ['Para evitar TypeScript', false, 'Los servicios también usan TypeScript.'],
                                    ['Para hacerlas más rápidas', false, 'No cambia la velocidad de red.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'errores-y-debug-de-integracion',
                        'title' => 'Errores típicos y debugging de integración',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Errores típicos y debugging de integración'],
                            ['p', 'Los problemas de integración suelen repetir patrones: CORS bloqueado, formato de respuesta distinto al esperado, campos que cambian de nombre y errores 401/403 por tokens.'],
                            ['p', 'La pestaña Network de DevTools muestra cada petición, su estado y su cuerpo: es la primera parada ante cualquier fallo de integración.'],
                            ['code', 'bash', <<<'BASH'
# Ver el estado real de una petición
curl -i http://localhost:8000/api/cursos

# Revisar cabeceras CORS en la respuesta
curl -sI http://localhost:8000/api/cursos | grep -i access-control
BASH],
                            ['h', 'Diagnóstico rápido'],
                            ['list', [
                                'Network de DevTools: estado y cuerpo real',
                                'Comparar el JSON esperado con el recibido',
                                'Revisar cabeceras CORS si el navegador bloquea',
                                'Verificar el token en cada petición protegida',
                            ]],
                            ['p', 'Cuando el navegador bloquea una petición por CORS, el backend debe permitir el origen: no es un problema del frontend. La consola del navegador lo dice con claridad.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Network muestra peticiones, estados y cuerpos',
                                'CORS se configura en el backend',
                                'El JSON real debe compararse con el esperado',
                                '401/403 apuntan a autenticación o permisos',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde miras primero si una petición falla en el navegador?', 'type' => 'single', 'answers' => [
                                    ['La pestaña Network de DevTools', true, 'Muestra el estado real y el cuerpo de la respuesta.'],
                                    ['El código fuente del backend', false, 'Puede ayudar, pero Network es el diagnóstico directo.'],
                                    ['La consola del servidor de BD', false, 'La BD no participa si la petición ni sale.'],
                                    ['El archivo .env', false, 'No es el lugar para depurar esta petición.'],
                                ]],
                                ['q' => '¿De qué lado se configura CORS?', 'type' => 'single', 'answers' => [
                                    ['Del lado del backend', true, 'El servidor decide qué orígenes puede servir.'],
                                    ['Del lado del navegador', false, 'El navegador solo aplica la política; no la configura.'],
                                    ['Del proveedor de internet', false, 'No tiene relación.'],
                                    ['De la base de datos', false, 'La BD no participa en CORS.'],
                                ]],
                                ['q' => '¿Qué sugiere un 401 en cada petición autenticada?', 'type' => 'single', 'answers' => [
                                    ['Que el token falta, expiró o es inválido', true, 'La autenticación no está pasando.'],
                                    ['Que el recurso no existe', false, 'Eso sería 404.'],
                                    ['Que la validación falló', false, 'Eso sería 422.'],
                                    ['Que el servidor explotó', false, 'Eso sería 500.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'CORS y Autenticación en el Cliente',
                'description' => 'Configura CORS, envía tokens Bearer y gestiona sesiones desde el frontend.',
                'lessons' => [
                    [
                        'slug' => 'cors-y-token-bearer',
                        'title' => 'CORS y tokens Bearer desde el frontend',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'CORS y tokens Bearer desde el frontend'],
                            ['p', 'El navegador aplica CORS para proteger al usuario: el backend debe permitir el origen del frontend y los métodos y cabeceras usados.'],
                            ['p', 'En el frontend, el token se envía en cada petición mediante un interceptor HTTP y los errores 401 se manejan globalmente para redirigir a login. Este patrón es el corazón de las SPAs autenticadas.'],
                            ['code', 'php', <<<'PHP'
<?php
// config/cors.php en Laravel
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:4200'),
    ],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
PHP],
                            ['h', 'Flujo típico con token'],
                            ['list', [
                                'Login: el usuario envia credenciales',
                                'El backend devuelve un token',
                                'El frontend lo guarda y lo adjunta en Authorization',
                                'Un 401 global redirige a login',
                            ]],
                            ['p', 'Los interceptores centralizan la cabecera Authorization: una sola pieza de código añade el token a todas las peticiones y reacciona a los 401.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'CORS se configura en el backend',
                                'El token viaja en Authorization: Bearer',
                                'Los interceptores añaden el token a cada petición',
                                'El 401 global limpia sesión y redirige',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Quién decide qué orígenes pueden llamar a la API?', 'type' => 'single', 'answers' => [
                                    ['El backend con la configuración CORS', true, 'El servidor autoriza orígenes y métodos.'],
                                    ['El frontend', false, 'El frontend solo sufre o disfruta la política.'],
                                    ['El usuario en el navegador', false, 'El usuario no configura CORS.'],
                                    ['El proveedor DNS', false, 'El DNS no interviene.'],
                                ]],
                                ['q' => '¿Qué hace un interceptor HTTP de autenticación?', 'type' => 'single', 'answers' => [
                                    ['Añade el token a cada petición y reacciona a 401', true, 'Centraliza la autenticación en una pieza de código.'],
                                    ['Compila el CSS', false, 'No tiene relación.'],
                                    ['Guarda datos en la BD', false, 'La BD queda del backend.'],
                                    ['Diseña la interfaz', false, 'No diseña.'],
                                ]],
                                ['q' => '¿Qué debería ocurrir al recibir un 401 en una SPA?', 'type' => 'single', 'answers' => [
                                    ['Limpiar la sesión y redirigir a login', true, 'El token ya no es válido; el usuario debe autenticarse de nuevo.'],
                                    ['Reintentar la petición 100 veces', false, 'Si el token es inválido, reintentar no ayuda.'],
                                    ['Mostrar un error sin contexto', false, 'La respuesta correcta es gestionar la sesión.'],
                                    ['Cambiar el color del tema', false, 'No es una respuesta funcional.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'gestion-de-sesion-en-el-cliente',
                        'title' => 'Gestión de sesión en el cliente',
                        'type' => 'article',
                        'duration' => 14,
                        'blocks' => [
                            ['h', 'Gestión de sesión en el cliente'],
                            ['p', 'El frontend decide dónde guardar el token: localStorage persiste entre pestañas, sessionStorage vive solo en la pestaña y las cookies httpOnly añaden protección extra contra XSS.'],
                            ['p', 'La elección cambia la seguridad: XSS puede leer localStorage, pero no una cookie httpOnly. Guardar el token en memoria o cookie httpOnly es la opción más segura en SPAs.'],
                            ['code', 'javascript', <<<'JS'
// Guardar el token tras el login
function guardarSesion(token, usuario) {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("usuario", JSON.stringify(usuario));
}

// Leer el token para adjuntarlo
function obtenerToken() {
    return sessionStorage.getItem("token");
}

// Cerrar sesión limpiando todo
function cerrarSesion() {
    sessionStorage.clear();
    window.location.href = "/login";
}
JS],
                            ['h', 'Opciones de almacenamiento'],
                            ['list', [
                                'localStorage: persiste entre pestañas y reinicios',
                                'sessionStorage: solo la pestaña actual',
                                'Cookie httpOnly: invisible para JavaScript',
                                'Memoria: se pierde al recargar, ideal para máxima seguridad',
                            ]],
                            ['p', 'La práctica más segura en SPAs: token en memoria + refresh token en cookie httpOnly. El equilibrio entre comodidad y seguridad depende de tu amenaza.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'localStorage es accesible desde XSS',
                                'sessionStorage limita la vida a la pestaña',
                                'Las cookies httpOnly no las lee JavaScript',
                                'Memoria = máxima seguridad, mínima persistencia',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué riesgo principal tiene localStorage para guardar tokens?', 'type' => 'single', 'answers' => [
                                    ['Que un XSS pueda leerlo', true, 'Cualquier script inyectado accede a localStorage.'],
                                    ['Que ocupe demasiado disco', false, 'El espacio no es el riesgo principal.'],
                                    ['Que el token se borre al recargar', false, 'localStorage persiste; ese es sessionStorage.'],
                                    ['Que el navegador lo cifre mal', false, 'No es un riesgo de cifrado.'],
                                ]],
                                ['q' => '¿Qué ventaja tiene una cookie httpOnly?', 'type' => 'single', 'answers' => [
                                    ['JavaScript no puede leerla, mitigando XSS', true, 'Solo viaja al servidor en las peticiones.'],
                                    ['Se puede leer desde la consola', false, 'Justo lo contrario: invisible para JS.'],
                                    ['Guarda más datos', false, 'Las cookies tienen límites pequeños.'],
                                    ['No expira nunca', false, 'Las cookies tienen expiración.'],
                                ]],
                                ['q' => '¿Qué hace sessionStorage con el token?', 'type' => 'single', 'answers' => [
                                    ['Lo mantiene solo en la pestaña actual', true, 'Se borra al cerrar esa pestaña.'],
                                    ['Lo comparte entre pestañas', false, 'localStorage comparte; sessionStorage no.'],
                                    ['Lo borra al recargar', false, 'Persiste con recargas; muere con la pestaña.'],
                                    ['Lo envía automáticamente en cada petición', false, 'Debes adjuntarlo tú.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'flujo-de-datos-completo',
                        'title' => 'Flujo de datos completo: del clic a la respuesta',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Flujo de datos completo: del clic a la respuesta'],
                            ['p', 'Integrar todo: el usuario hace clic, el frontend construye la petición con el token, el backend valida y responde, y la UI refleja el resultado. Seguir el flujo paso a paso es la mejor forma de depurar.'],
                            ['p', 'Cada capa tiene su responsabilidad: la vista captura la acción, el servicio la traduce a HTTP, el backend valida y persiste, y la respuesta vuelve por el mismo camino.'],
                            ['code', 'javascript', <<<'JS'
// 1. El usuario hace clic en "Guardar"
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // 2. El servicio construye la petición con token
    const respuesta = await api.post("/api/pedidos", {
        producto: selectProducto.value,
        cantidad: Number(inputCantidad.value),
    });

    // 3. La UI refleja el resultado
    if (respuesta.ok) {
        mostrarExito("Pedido creado");
    } else {
        mostrarError(respuesta.error);
    }
});
JS],
                            ['h', 'Puntos de control del flujo'],
                            ['list', [
                                'La petición lleva el token correcto',
                                'El body coincide con lo que espera la API',
                                'El backend valida y responde con el código justo',
                                'La UI maneja éxito y error',
                            ]],
                            ['p', 'Cuando algo falla, recorre el flujo hacia atrás: ¿llegó la petición?, ¿qué respondió el backend?, ¿qué hizo la UI con esa respuesta? El eslabón roto aparece en uno de esos tres puntos.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El clic se traduce en una petición HTTP',
                                'El token y el body deben ser correctos',
                                'El backend responde con estado y datos',
                                'La UI maneja ambos desenlaces',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Cuál es el primer paso del flujo al hacer clic en Guardar?', 'type' => 'single', 'answers' => [
                                    ['Capturar la acción y construir la petición', true, 'El frontend traduce la acción en HTTP.'],
                                    ['Actualizar la base de datos', false, 'La BD la toca el backend, no el clic directo.'],
                                    ['Borrar el formulario', false, 'Eso ocurre después del éxito.'],
                                    ['Recargar la página', false, 'Una SPA no recarga.'],
                                ]],
                                ['q' => '¿Qué compruebas primero si una acción no funciona?', 'type' => 'single', 'answers' => [
                                    ['Si la petición salió y qué respondió el backend', true, 'Network muestra si el eslabón está roto.'],
                                    ['Si el CSS es bonito', false, 'El estilo no arregla la lógica.'],
                                    ['Si el usuario tiene internet', false, 'La app debe manejar ese caso, pero no es lo primero.'],
                                    ['Si el monitor está encendido', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Dónde se valida definitivamente la entrada?', 'type' => 'single', 'answers' => [
                                    ['En el backend', true, 'La validación del servidor es la frontera de confianza.'],
                                    ['Solo en el formulario HTML', false, 'El cliente se puede saltar.'],
                                    ['En el CSS', false, 'El CSS no valida datos.'],
                                    ['En el DNS', false, 'El DNS no participa.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 13. Autenticación JWT de punta a punta
    // =====================================================================
    [
        'slug' => 'autenticacion-jwt-web',
        'title' => 'Autenticación JWT de punta a punta',
        'description' => 'Implementa login, registro y rutas protegidas en toda la pila: cómo funciona un JWT, dónde guardarlo y cómo proteger el frontend con guards.',
        'category' => 'desarrollo-web',
        'difficulty' => 'intermediate',
        'duration_hours' => 10,
        'is_free' => true,
        'learning_path' => 'desarrollo-fullstack',
        'learning_path_level' => 2,
        'order' => 2,
        'modules' => [
            [
                'title' => 'Tokens y Sesiones',
                'description' => 'Qué es un JWT, su estructura y cómo se emite y verifica.',
                'lessons' => [
                    [
                        'slug' => 'como-funciona-jwt',
                        'title' => '¿Cómo funciona un JWT?',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', '¿Cómo funciona un JWT?'],
                            ['p', 'Un JWT es un token firmado con tres partes: header, payload y firma. El servidor lo firma y el cliente lo envía en cada petición, de modo que no hace falta sesión en el servidor: la API es sin estado.'],
                            ['p', 'Debe tener expiración, viajar siempre por HTTPS y nunca contener datos sensibles en el payload, porque el payload solo se codifica, no se cifra.'],
                            ['code', 'bash', <<<'BASH'
# Un JWT se ve así: tres partes separadas por puntos
HEADER.PAYLOAD.FIRMA

# El payload es legible: solo está codificado en base64
echo "eyJzdWIiOiIxIn0" | base64 -d
# {"sub":"1"}
BASH],
                            ['h', 'Propiedades del JWT'],
                            ['list', [
                                'Header: algoritmo y tipo de token',
                                'Payload: claims como exp, sub, rol',
                                'Firma: garantiza que nadie lo alteró',
                                'Sin estado: el servidor no guarda sesión',
                            ]],
                            ['p', 'La firma se verifica con la clave secreta: si alguien modifica el payload, la firma deja de ser válida. Por eso el servidor confía en el token sin consultar una sesión.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'JWT = header + payload + firma',
                                'El payload se codifica, no se cifra',
                                'Expiraciones cortas reducen el riesgo',
                                'Sin estado: la API no guarda sesión',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué garantiza la firma de un JWT?', 'type' => 'single', 'answers' => [
                                    ['Que el token no fue alterado desde su emisión', true, 'Cualquier cambio rompe la firma.'],
                                    ['Que el payload esté cifrado', false, 'El payload solo está codificado, no cifrado.'],
                                    ['Que el usuario esté en la BD', false, 'La firma no consulta la BD.'],
                                    ['Que el token no expire', false, 'La expiración está en el payload, no en la firma.'],
                                ]],
                                ['q' => '¿Por qué no se deben poner datos sensibles en el payload?', 'type' => 'single', 'answers' => [
                                    ['Porque cualquiera puede decodificar el payload', true, 'Base64 no es cifrado; es legible para todos.'],
                                    ['Porque el payload se borra', false, 'No se borra.'],
                                    ['Porque la firma lo oculta', false, 'La firma no oculta el contenido.'],
                                    ['Porque pesa más', false, 'El peso no es el motivo de seguridad.'],
                                ]],
                                ['q' => '¿Qué significa que la API sea sin estado con JWT?', 'type' => 'single', 'answers' => [
                                    ['Que el servidor no guarda la sesión del usuario', true, 'El token transporta la identidad en cada petición.'],
                                    ['Que la API no usa base de datos', false, 'La BD se sigue usando para otros datos.'],
                                    ['Que el servidor nunca se reinicia', false, 'Eso es otra cosa.'],
                                    ['Que no hay servidor', false, 'Sigue habiendo servidor.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'emitiendo-y-verificando-jwt',
                        'title' => 'Emisión y verificación de JWT en Laravel',
                        'type' => 'code_challenge',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Emisión y verificación de JWT en Laravel'],
                            ['p', 'En Laravel emites un JWT tras validar credenciales y lo verificas con middleware en las rutas protegidas. La librería tymondesigns/jwt-auth y el middleware auth:jwt son las piezas habituales.'],
                            ['p', 'Las rutas protegidas exigen un token válido en Authorization: Bearer; si expira o es inválido, la API responde 401.'],
                            ['code', 'php', <<<'PHP'
<?php
// Emitir el token tras el login
public function login(Request $request)
{
    $credenciales = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (! $token = auth('api')->attempt($credenciales)) {
        return response()->json(['message' => 'Credenciales incorrectas'], 401);
    }

    return response()->json(['token' => $token]);
}

// Proteger rutas
Route::middleware('auth:jwt')->group(function () {
    Route::get('/perfil', [PerfilController::class, 'show']);
});
PHP],
                            ['h', 'Flujo de verificación'],
                            ['list', [
                                'El cliente envía Authorization: Bearer token',
                                'El middleware valida firma y expiración',
                                'El usuario se resuelve desde el payload',
                                'Token inválido o expirado => 401',
                            ]],
                            ['p', 'La verificación es local: sin consultas a la BD, lo que hace el pipeline rápido y escalable. La revocación inmediata es la contrapartida de ese diseño.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El login emite el token tras validar credenciales',
                                'auth:jwt protege rutas',
                                'La verificación es local y rápida',
                                '401 cuando el token no es válido',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué devuelve auth(\'api\')->attempt() si las credenciales son correctas?', 'type' => 'single', 'answers' => [
                                    ['El token JWT del usuario', true, 'Attempt valida y emite el token.'],
                                    ['La contraseña cifrada', false, 'Nunca devuelve contraseñas.'],
                                    ['Un 404', false, 'Con credenciales correctas no falla.'],
                                    ['Los datos de la BD completa', false, 'Solo emite el token.'],
                                ]],
                                ['q' => '¿Qué hace el middleware auth:jwt?', 'type' => 'single', 'answers' => [
                                    ['Verifica el token de cada petición entrante', true, 'Firma, expiración y usuario.'],
                                    ['Crea el token', false, 'El token se crea en el login.'],
                                    ['Guarda la sesión en la BD', false, 'Sin estado: no guarda.'],
                                    ['Formatea el JSON', false, 'No formatea.'],
                                ]],
                                ['q' => '¿Cuál es la contrapartida de una API sin estado?', 'type' => 'single', 'answers' => [
                                    ['No puedes revocar tokens al instante', true, 'Un token válido sigue funcionando hasta expirar.'],
                                    ['Es más lenta', false, 'Es más rápida al no consultar sesiones.'],
                                    ['No soporta HTTPS', false, 'HTTPS es independiente.'],
                                    ['No permite login', false, 'El login es justo quien emite el token.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'refresh-tokens',
                        'title' => 'Refresh tokens: renueva sesiones sin pedir el password',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Refresh tokens: renueva sesiones sin pedir el password'],
                            ['p', 'Un access token con expiración corta (15-30 min) reduce el riesgo si se filtra. El refresh token, de vida más larga y guardado en cookie httpOnly, permite renovar el access token sin volver a pedir credenciales.'],
                            ['p', 'El flujo: el access token expira, el cliente llama a /refresh con el refresh token, el backend valida y emite un access token nuevo. Si el refresh token se revoca, la sesión muere.'],
                            ['code', 'php', <<<'PHP'
<?php
// Endpoint de refresh
public function refresh(Request $request)
{
    $refreshToken = $request->cookie('refresh_token');

    $nuevoAccess = Auth::guard('api')
        ->setToken($refreshToken)
        ->refresh();

    return response()->json([
        'token' => $nuevoAccess,
    ]);
}
PHP],
                            ['h', 'Buenas prácticas con refresh tokens'],
                            ['list', [
                                'Access token corto y en memoria',
                                'Refresh token largo y en cookie httpOnly',
                                'Revocar refresh tokens al cerrar sesión',
                                'El endpoint de refresh se protege contra reuso',
                            ]],
                            ['p', 'El balance: access corto limita el daño de una fuga; refresh largo mantiene la experiencia sin fricción. La rotación de refresh tokens (emitir uno nuevo en cada refresh) eleva la seguridad.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Access corto: menos riesgo si se filtra',
                                'Refresh en cookie httpOnly: invisible para XSS',
                                'Cerrar sesión revoca el refresh',
                                'Rotar refresh tokens reduce el reuso',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve el refresh token?', 'type' => 'single', 'answers' => [
                                    ['Obtener un access token nuevo sin pedir credenciales', true, 'Renueva la sesión cuando el access expira.'],
                                    ['Verificar la contraseña', false, 'El login ya verifica.'],
                                    ['Cifrar los datos del usuario', false, 'No cifra.'],
                                    ['Guardar el carrito', false, 'No guarda datos de negocio.'],
                                ]],
                                ['q' => '¿Por qué el access token debe ser de vida corta?', 'type' => 'single', 'answers' => [
                                    ['Para limitar el daño si se filtra', true, 'Menos tiempo válido, menos ventana de abuso.'],
                                    ['Porque el login es lento', false, 'La duración no depende de la velocidad del login.'],
                                    ['Porque los tokens pesan', false, 'El peso no depende de la duración.'],
                                    ['Porque la firma caduca sola', false, 'La expiración la decides tú.'],
                                ]],
                                ['q' => '¿Dónde se guarda idealmente el refresh token en el cliente?', 'type' => 'single', 'answers' => [
                                    ['En una cookie httpOnly', true, 'JavaScript no puede leerla, mitigando XSS.'],
                                    ['En localStorage', false, 'Es accesible para XSS.'],
                                    ['En la URL', false, 'Nunca tokens en URLs.'],
                                    ['En el HTML', false, 'Quedaría visible en el fuente.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Protección en el Frontend',
                'description' => 'Guards, estado de sesión y cierre de sesión en el cliente.',
                'lessons' => [
                    [
                        'slug' => 'login-registro-y-guards',
                        'title' => 'Flujo login/registro y guards de ruta',
                        'type' => 'code_challenge',
                        'duration' => 20,
                        'blocks' => [
                            ['h', 'Flujo login/registro y guards de ruta'],
                            ['p', 'El flujo típico: el usuario se registra o inicia sesión, el backend devuelve token y datos del usuario, el frontend lo guarda (localStorage o SessionStorage) y los guards de ruta protegen las páginas privadas.'],
                            ['p', 'Al cerrar sesión se invalida el token en el backend y se limpia el estado local del navegador.'],
                            ['code', 'typescript', <<<'TS'
// Guard de Angular: solo deja pasar si hay sesión
export const requiereLogin: CanActivateFn = () => {
    const auth = inject(AuthService);

    if (auth.estaAutenticado()) {
        return true;
    }

    return inject(Router).createUrlTree(["/login"]);
};

// Configuración de la ruta protegida
{
    path: "perfil",
    component: PerfilComponent,
    canActivate: [requiereLogin],
}
TS],
                            ['h', 'Elementos del flujo'],
                            ['list', [
                                'Registro y login contra la API',
                                'Guardar token y datos de sesión',
                                'Guards que protegen rutas privadas',
                                'Logout que revoca y limpia',
                            ]],
                            ['p', 'Los guards son experiencia de usuario; la autorización real vive en el backend. Cada endpoint protegido debe verificar el token por su cuenta.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Login devuelve token y datos',
                                'El token se persiste en el cliente',
                                'Los guards bloquean rutas privadas',
                                'Logout limpia local y revoca en backend',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace un guard de ruta?', 'type' => 'single', 'answers' => [
                                    ['Bloquea o permite el acceso a una ruta según la sesión', true, 'Si no hay sesión, redirige a login.'],
                                    ['Cifra el token', false, 'El guard no cifra.'],
                                    ['Descarga la página más rápido', false, 'No optimiza carga.'],
                                    ['Guarda el formulario', false, 'No guarda formularios.'],
                                ]],
                                ['q' => '¿Qué debe ocurrir al cerrar sesión?', 'type' => 'single', 'answers' => [
                                    ['Revocar el token en el backend y limpiar el estado local', true, 'Ambas cosas: servidor y cliente.'],
                                    ['Solo cerrar la pestaña del navegador', false, 'La sesión seguiría válida.'],
                                    ['Borrar la base de datos del cliente', false, 'No existe tal cosa.'],
                                    ['Cambiar la contraseña', false, 'No es necesario al cerrar sesión.'],
                                ]],
                                ['q' => '¿Por qué el backend debe verificar el token en cada endpoint?', 'type' => 'single', 'answers' => [
                                    ['Porque el frontend se puede manipular', true, 'La confianza vive en el servidor.'],
                                    ['Porque el guard es lento', false, 'La velocidad no es la razón.'],
                                    ['Porque los guards no funcionan', false, 'Funcionan; no son la frontera de seguridad.'],
                                    ['Porque la API lo exige por diseño', false, 'Es una buena práctica, no requisito de diseño.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'interceptores-y-estado-de-sesion',
                        'title' => 'Interceptores y estado de sesión',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Interceptores y estado de sesión'],
                            ['p', 'Los interceptores HTTP añaden el token automáticamente a cada petición y gestionan los 401 de forma global: limpian sesión y redirigen a login sin repetir lógica en cada llamada.'],
                            ['p', 'El estado de sesión vive en un servicio observado por toda la app: al cambiar, los guards, el navbar y las vistas reaccionan.'],
                            ['code', 'typescript', <<<'TS'
import { Injectable, inject, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class AuthService {
    private usuario = signal<Usuario | null>(null);

    estaAutenticado() {
        return this.usuario() !== null;
    }

    setSesion(usuario: Usuario) {
        this.usuario.set(usuario);
    }

    logout() {
        this.usuario.set(null);
    }
}
TS],
                            ['h', 'Ventajas de centralizar'],
                            ['list', [
                                'El token se adjunta en un solo lugar',
                                'Los 401 se manejan globalmente',
                                'El estado de sesión es una única fuente de verdad',
                                'Las vistas reaccionan a los cambios',
                            ]],
                            ['p', 'Centralizar la autenticación hace el código consistente: no hay llamadas que olviden el token ni vistas con estado de sesión desactualizado.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El interceptor añade el token a todas las peticiones',
                                'Los 401 se tratan de forma global',
                                'El estado de sesión es una fuente de verdad',
                                'La UI reacciona a los cambios de sesión',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué ventaja tiene un interceptor de autenticación?', 'type' => 'single', 'answers' => [
                                    ['Añadir el token y manejar 401 en un solo lugar', true, 'Consistencia y menos código duplicado.'],
                                    ['Eliminar el CSS', false, 'No tiene relación.'],
                                    ['Crear la base de datos', false, 'No crea BD.'],
                                    ['Hacer el backend más rápido', false, 'El interceptor es del cliente.'],
                                ]],
                                ['q' => '¿Qué hace un 401 global al detectarse?', 'type' => 'single', 'answers' => [
                                    ['Limpiar la sesión y redirigir a login', true, 'El usuario debe volver a autenticarse.'],
                                    ['Reintentar con otro token inventado', false, 'No se inventan tokens.'],
                                    ['Mostrar un modal de error solo', false, 'Debe además gestionar la sesión.'],
                                    ['Recargar la página infinitamente', false, 'Eso sería un bucle.'],
                                ]],
                                ['q' => '¿Por qué la app necesita saber el estado de sesión en muchos lugares?', 'type' => 'single', 'answers' => [
                                    ['Porque navbar, guards y vistas dependen de él', true, 'Un servicio central evita inconsistencias.'],
                                    ['Porque cada componente debe tener su copia', false, 'Copias dispersas generan bugs.'],
                                    ['Porque el servidor lo pide en cada clic', false, 'No es así.'],
                                    ['Porque el estado es estático', false, 'El estado cambia con login/logout.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'protegiendo-tu-pila-completa',
                        'title' => 'Errores comunes al proteger la pila completa',
                        'type' => 'article',
                        'duration' => 12,
                        'blocks' => [
                            ['h', 'Errores comunes al proteger la pila completa'],
                            ['p', 'Los patrones que más aparecen en integraciones JWT: token en localStorage expuesto a XSS, expiración mal configurada, CORS que no permite la cabecera Authorization y rutas frontend no protegidas que muestran pantallas sin datos.'],
                            ['p', 'También es frecuente olvidar la verificación en el backend: proteger solo la UI no protege los datos.'],
                            ['code', 'bash', <<<'BASH'
# Comprobar que CORS permite la cabecera Authorization
curl -sI -X OPTIONS http://localhost:8000/api/usuarios \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Headers: authorization" \
  | grep -i access-control-allow
BASH],
                            ['h', 'Checklist de seguridad'],
                            ['list', [
                                'Tokens nunca en URLs ni logs',
                                'HTTPS en todo el tráfico',
                                'Expiración corta del access token',
                                'Cada endpoint del backend verifica el token',
                            ]],
                            ['p', 'Recorre la lista al terminar la integración: muchas filtraciones reales empiezan por un token en localStorage y una consola abierta.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'localStorage expone tokens a XSS',
                                'CORS debe permitir Authorization',
                                'La UI protegida no basta: el backend verifica',
                                'HTTPS y expiración corta reducen el riesgo',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué error deja los datos expuestos aunque la UI tenga guards?', 'type' => 'single', 'answers' => [
                                    ['No verificar el token en el backend', true, 'Cualquiera puede llamar a la API directamente.'],
                                    ['Usar TypeScript', false, 'TypeScript no es un error.'],
                                    ['Tener botones con estilo', false, 'El estilo no es seguridad.'],
                                    ['Usar componentes', false, 'Los componentes son normales.'],
                                ]],
                                ['q' => '¿Qué debe permitir CORS para que el token Bearer funcione?', 'type' => 'single', 'answers' => [
                                    ['La cabecera Authorization y el origen del frontend', true, 'Sin ello, el navegador bloquea la petición.'],
                                    ['Solo GET', false, 'Debe permitir los métodos usados.'],
                                    ['Solo el origen del backend', false, 'Debe permitir el origen del frontend.'],
                                    ['Nada, CORS no afecta', false, 'CORS afecta directamente.'],
                                ]],
                                ['q' => '¿Por qué guardar el token en localStorage multiplica el riesgo?', 'type' => 'single', 'answers' => [
                                    ['Cualquier script XSS puede leerlo sin permisos extra', true, 'localStorage es accesible desde JavaScript, así que un XSS lo roba.'],
                                    ['Porque localStorage no tiene cifrado', false, 'Sesión y cookies tampoco cifran; el punto es el acceso de scripts.'],
                                    ['Porque ralentiza el renderizado', false, 'No afecta al rendimiento.'],
                                    ['Porque el navegador lo borra al recargar', false, 'localStorage persiste entre recargas.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],

    // =====================================================================
    // 14. Despliegue Full Stack
    // =====================================================================
    [
        'slug' => 'despliegue-fullstack',
        'title' => 'Despliegue Full Stack',
        'description' => 'Lleva tu aplicación a producción: build optimizado, variables de entorno y servir estáticos y API detrás de un reverse proxy.',
        'category' => 'devops',
        'difficulty' => 'advanced',
        'duration_hours' => 8,
        'is_free' => true,
        'learning_path' => 'desarrollo-fullstack',
        'learning_path_level' => 3,
        'order' => 3,
        'modules' => [
            [
                'title' => 'Producción',
                'description' => 'Builds, variables de entorno y servidores estáticos.',
                'lessons' => [
                    [
                        'slug' => 'build-y-variables-de-produccion',
                        'title' => 'Build de producción y variables de entorno',
                        'type' => 'article',
                        'duration' => 15,
                        'preview' => true,
                        'blocks' => [
                            ['h', 'Build de producción y variables de entorno'],
                            ['p', 'El build de producción minifica y optimiza los assets del frontend; las variables de entorno (URL de la API, claves públicas) se inyectan en tiempo de build o en el servidor.'],
                            ['p', 'Nunca hardcodees URLs de desarrollo: un mismo código debe desplegarse en staging o producción cambiando solo la configuración.'],
                            ['code', 'bash', <<<'BASH'
# Frontend: build de producción
npm run build   # genera dist/

# Backend Laravel: preparar producción
php artisan config:cache
php artisan route:cache
php artisan migrate --force
BASH],
                            ['h', 'Buenas prácticas de entorno'],
                            ['list', [
                                'Un build por entorno (staging, producción)',
                                'Variables para URLs y claves públicas',
                                'Secretos inyectados por el proveedor',
                                'Configurar cachés después del deploy',
                            ]],
                            ['p', 'El artefacto de build debe ser reproducible: mismo código fuente, mismo resultado. Las variables de entorno se inyectan en el momento de construir o desplegar.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'El build optimiza y minifica',
                                'Las URLs varían por entorno vía variables',
                                'Los secretos se inyectan, no se escriben',
                                'Cachés de config y rutas se regeneran en producción',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Por qué no se deben hardcodear las URLs de la API?', 'type' => 'single', 'answers' => [
                                    ['Para que el mismo código sirva en staging y producción', true, 'La diferencia de entorno va en configuración.'],
                                    ['Porque ocupan más memoria', false, 'No es cuestión de memoria.'],
                                    ['Porque el navegador lo prohíbe', false, 'El navegador no lo prohíbe.'],
                                    ['Porque son secretas', false, 'Las URLs públicas no son secretas.'],
                                ]],
                                ['q' => '¿Qué hace php artisan config:cache?', 'type' => 'single', 'answers' => [
                                    ['Compila la configuración para producción', true, 'Acelera y congela la config en un archivo.'],
                                    ['Borra la base de datos', false, 'No borra nada.'],
                                    ['Reinicia el servidor', false, 'No reinicia nada.'],
                                    ['Envía correos', false, 'No envía.'],
                                ]],
                                ['q' => '¿Dónde se inyectan los secretos en producción?', 'type' => 'single', 'answers' => [
                                    ['En el entorno del servidor o el proveedor', true, 'El gestor de secretos los inyecta.'],
                                    ['En el código fuente', false, 'El código se versiona y cualquiera con acceso al repo lo leería.'],
                                    ['En el README', false, 'La documentación es visible para todo el equipo y externos.'],
                                    ['En el frontend público', false, 'Todo lo que llega al navegador es visible para el usuario.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'estaticos-y-reverse-proxy',
                        'title' => 'Servir estáticos con un reverse proxy',
                        'type' => 'article',
                        'duration' => 15,
                        'blocks' => [
                            ['h', 'Servir estáticos con un reverse proxy'],
                            ['p', 'En producción el frontend se sirve como estático (NGINX, Vercel, Netlify) y el backend queda detrás de un reverse proxy que gestiona TLS, compresión y balanceo.'],
                            ['p', 'El proxy redirige /api/* al backend y el resto de rutas a la SPA, permitiendo compartir dominio y evitar problemas de CORS.'],
                            ['code', 'nginx', <<<'NGINX'
server {
    listen 80;
    server_name app.example.com;

    root /var/www/app/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX],
                            ['h', 'Qué aporta el reverse proxy'],
                            ['list', [
                                'TLS y HTTP/2 en un solo dominio',
                                'Redirección /api al backend',
                                'Servir estáticos a máxima velocidad',
                                'Compresión y caché de assets',
                            ]],
                            ['p', 'Compartir dominio elimina la mayor parte de los problemas de CORS y simplifica cookies y certificados: una sola entrada para todo el sistema.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Estáticos primero, API detrás del proxy',
                                '/api/* se delega al backend',
                                'Un solo dominio: menos CORS y un solo TLS',
                                'try_files devuelve index.html en rutas SPA',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace el reverse proxy con /api/*?', 'type' => 'single', 'answers' => [
                                    ['Reenviar esas peticiones al backend', true, 'El proxy actúa como puerta hacia la API.'],
                                    ['Servirlas como estáticos', false, 'Los estáticos son para el frontend.'],
                                    ['Bloquearlas siempre', false, 'Debe pasarlas al backend.'],
                                    ['Convertirlas en HTML', false, 'No convierte.'],
                                ]],
                                ['q' => '¿Para qué sirve try_files $uri $uri/ /index.html?', 'type' => 'single', 'answers' => [
                                    ['Devolver index.html para las rutas de la SPA', true, 'El router del cliente decide qué renderizar.'],
                                    ['Comprimir los assets', false, 'La compresión es gzip/brotli.'],
                                    ['Bloquear la API', false, 'Eso es otro bloque.'],
                                    ['Cargar la base de datos', false, 'No toca la BD.'],
                                ]],
                                ['q' => '¿Qué ventaja trae compartir dominio entre frontend y API?', 'type' => 'single', 'answers' => [
                                    ['Evita la mayoría de los problemas de CORS', true, 'Mismo origen, sin bloqueos de navegador.'],
                                    ['Elimina el servidor web', false, 'Sigue habiendo servidor.'],
                                    ['Hace el código más corto', false, 'El código no cambia.'],
                                    ['Cifra las contraseñas', false, 'El cifrado es de la app, no del dominio.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'monitoreo-post-deploy',
                        'title' => 'Monitoreo y rollback tras el despliegue',
                        'type' => 'article',
                        'duration' => 10,
                        'blocks' => [
                            ['h', 'Monitoreo y rollback tras el despliegue'],
                            ['p', 'Desplegar no es el final: hay que vigilar logs, errores y métricas. Un buen monitoreo detecta regresiones antes que los usuarios.'],
                            ['p', 'El rollback debe ser un procedimiento probado: si el nuevo release falla, se restaura el anterior en minutos, no en horas.'],
                            ['code', 'bash', <<<'BASH'
# Vigilar logs del backend
tail -f storage/logs/laravel.log

# Verificar salud del servicio
curl -f http://localhost:8000/api/health

# Rollback rápido con el release anterior
./deploy.sh rollback
BASH],
                            ['h', 'Qué vigilar'],
                            ['list', [
                                'Errores 5xx y excepciones',
                                'Latencia de peticiones',
                                'Uso de memoria y CPU',
                                'Estado de colas y workers',
                            ]],
                            ['p', 'Define un endpoint de salud que verifique BD y dependencias: los balanceadores lo usan y tú lo usas para confirmar que el deploy está sano.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Monitorear errores y latencia',
                                'Un health check verifica dependencias',
                                'El rollback se practica antes de necesitarlo',
                                'Vigilar tras el deploy detecta regresiones pronto',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Para qué sirve un endpoint de salud?', 'type' => 'single', 'answers' => [
                                    ['Verificar que la app y sus dependencias responden', true, 'Es el termómetro del sistema.'],
                                    ['Guardar las contraseñas', false, 'No guarda nada.'],
                                    ['Mostrar la página de inicio', false, 'No es una página.'],
                                    ['Enviar correos masivos', false, 'No envía.'],
                                ]],
                                ['q' => '¿Qué se debe hacer antes de necesitar un rollback?', 'type' => 'single', 'answers' => [
                                    ['Practicar el procedimiento en staging', true, 'Un rollback no probado falla en el peor momento.'],
                                    ['Borrar los backups', false, 'Justo lo contrario.'],
                                    ['Desactivar el monitoreo', false, 'El monitoreo es tu aliado.'],
                                    ['Esperar a producción', false, 'Hay que probarlo antes.'],
                                ]],
                                ['q' => '¿Qué métrica indica un problema de capacidad del servidor?', 'type' => 'single', 'answers' => [
                                    ['Uso de memoria y CPU', true, 'Saturación de recursos suele preceder caídas.'],
                                    ['La cantidad de commits', false, 'No indica capacidad.'],
                                    ['Los colores del logo', false, 'Irrelevante.'],
                                    ['El número de desarrolladores', false, 'Irrelevante.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
            [
                'title' => 'Estrategias de despliegue',
                'description' => 'Más allá del deploy: estrategias sin corte, configuración y observabilidad.',
                'lessons' => [
                    [
                        'slug' => 'estrategias-blue-green-y-canary',
                        'title' => 'Estrategias: blue-green, canary y rolling',
                        'type' => 'article',
                        'duration' => 18,
                        'blocks' => [
                            ['h', 'Estrategias: blue-green, canary y rolling'],
                            ['p', 'Desplegar sin cortar el servicio es una disciplina con estrategias probadas. En blue-green mantienes dos entornos idénticos (azul y verde): despliegas la nueva versión en el inactivo, validas y cambias el trafico. El rollback es volver a cambiar el tráfico: instantáneo.'],
                            ['p', 'El canary envía un porcentaje pequeño del tráfico a la nueva versión (5 %, 25 %...) y lo aumenta si las métricas son buenas. El rolling reemplaza instancias de a poco en un cluster. Cuanto menor el riesgo aceptado, más lento el despliegue.'],
                            ['code', 'bash', <<<'BASH'
# Blue-green en esencia
docker compose -f compose.blue.yml up -d   # versión nueva (inactiva)
curl -f https://stag.blue.internal/health  # validar
# Cambiar el tráfico: balanceador -> blue
# Rollback: balanceador -> green (segundos)

# Canary en esencia
# 5% del tráfico a canary, medir errores/latencia
# 25% -> 100% si las métricas aguantan
BASH],
                            ['h', 'Elegir estrategia'],
                            ['list', [
                                'Blue-green: rollback instantáneo, doble infraestructura',
                                'Canary: riesgo controlado con tráfico real',
                                'Rolling: sin duplicar infra, más exposición por etapas',
                                'Depende de: riesgo del cambio, infraestructura y equipo',
                                'Todas necesitan health checks fiables',
                            ]],
                            ['p', 'La regla que une las tres: nunca asumas que un deploy funcionó; verifica con health checks y métricas antes de ampliar el tráfico. La estrategia correcta depende del cambio: una migración de BD no se resuelve solo con blue-green.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Blue-green = rollback por cambio de tráfico',
                                'Canary = riesgo controlado por porcentajes',
                                'Rolling = reemplazo gradual de instancias',
                                'Health checks fiables antes de ampliar tráfico',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué hace el rollback en un despliegue blue-green?', 'type' => 'single', 'answers' => [
                                    ['Volver a dirigir el tráfico al entorno anterior', true, 'El entorno anterior sigue vivo y validado.'],
                                    ['Reinstalar todo desde cero', false, 'No se reinstala nada.'],
                                    ['Borrar la base de datos', false, 'Nada que ver.'],
                                    ['Recompilar el frontend', false, 'El rollback no recompila.'],
                                ]],
                                ['q' => '¿Qué caracteriza al despliegue canary?', 'type' => 'multiple', 'answers' => [
                                    ['Enviar un porcentaje pequeño del tráfico a la versión nueva', true, '5 % primero, más si las métricas aguantan.'],
                                    ['Medir errores y latencia antes de ampliar', true, 'Los datos deciden la progresión.'],
                                    ['Cambiar todo el tráfico de golpe', false, 'Eso es lo que el canary evita.'],
                                    ['Usar dos entornos idénticos siempre', false, 'Eso es blue-green.'],
                                ]],
                                ['q' => '¿Cuál es el requisito común de las tres estrategias?', 'type' => 'single', 'answers' => [
                                    ['Un health check fiable para decidir', true, 'Sin verificación no sabes si ampliar o revertir.'],
                                    ['Un clúster de al menos 20 nodos', false, 'No depende del tamaño.'],
                                    ['Infraestructura duplicada', false, 'Eso es específico de blue-green.'],
                                    ['Una IA que lo decida', false, 'No hay requisito de IA.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'configuracion-y-secretos-en-produccion',
                        'title' => 'Configuración y secretos en producción',
                        'type' => 'code_challenge',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Configuración y secretos en producción'],
                            ['p', 'Tu aplicación necesita configuración por entorno: BD, URLs, claves. El artefacto desplegado debe ser idéntico en todas partes; solo cambia la configuración. Por eso los secretos se inyectan en el despliegue, nunca se compilan dentro de la imagen ni se versionan.'],
                            ['p', 'En Laravel, config/ agrupa la configuración y las variables de entorno alimentan cada entorno. En producción puedes inyectarlas por el orquestador (docker secret, Kubernetes secrets) o un gestor (AWS Secrets Manager, Vault) y cachear la configuración con config:cache.'],
                            ['code', 'dockerfile', <<<'DOCKER'
# Dockerfile: sin secretos compilados
FROM php:8.3-fpm-alpine AS runtime
WORKDIR /app
COPY --from=build /app . 
RUN php artisan config:cache && php artisan route:cache

# Ejecución: secrets por variables de entorno (docker secret / env)
# docker run -e APP_KEY=... -e DB_PASSWORD=... mi-app
DOCKER],
                            ['code', 'yaml', <<<'YAML'
# docker-compose.yml (producción)
services:
  app:
    image: ghcr.io/me/app:1.4.0
    env_file:
      - .env.production        # no versionado
    secrets:
      - db_password
secrets:
  db_password:
    file: ./secrets/db_password
YAML],
                            ['h', 'Reglas de configuración'],
                            ['list', [
                                'Código idéntico; configuración por entorno',
                                'Secretos inyectados, nunca en la imagen',
                                '.env.production fuera del repositorio',
                                'config:cache y route:cache al desplegar',
                                'Rotación de secretos sin redeploy si es posible',
                            ]],
                            ['p', 'La configuración también se versiona como política: cada entorno tiene su .env correspondiente, y el despliegue falla rápido si falta una variable crítica (APP_KEY, DB_PASSWORD). Un checklist de variables evita el "funciona en mi máquina" más caro.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Artefacto idéntico + configuración externa',
                                'Secretos por inyección, no por compilación',
                                'Cachear config y rutas al desplegar',
                                'Fallar rápido si falta una variable crítica',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Dónde deben vivir los secretos en un despliegue?', 'type' => 'single', 'answers' => [
                                    ['En variables de entorno o gestores de secretos, inyectados al ejecutar', true, 'Nunca dentro de la imagen ni del repositorio.'],
                                    ['En el Dockerfile', false, 'La imagen se comparte: el secreto viajaría con ella.'],
                                    ['En el repositorio Git', false, 'Versionar secretos es la fuga garantizada.'],
                                    ['En el código fuente', false, 'Igual que versionarlo: fuga.'],
                                ]],
                                ['q' => '¿Por qué conviene cachear config en producción?', 'type' => 'multiple', 'answers' => [
                                    ['Reduce lecturas de archivos en cada petición', true, 'config:cache acelera la app.'],
                                    ['Las rutas se resuelven más rápido', true, 'route:cache es parte del checklist.'],
                                    ['Evita variables de entorno', false, 'La config cacheada sigue usando variables.'],
                                    ['Protege del XSS', false, 'No tiene relación.'],
                                ]],
                                ['q' => '¿Qué error evita el checklist de variables críticas?', 'type' => 'single', 'answers' => [
                                    ['Desplegar una app que falla por configuración incompleta', true, 'Fallar rápido en el deploy, no en producción.'],
                                    ['Que la imagen sea grande', false, 'No tiene relación.'],
                                    ['Que el código sea feo', false, 'No aplica.'],
                                    ['Que los tests fallen', false, 'Los tests se ejecutan antes del deploy.'],
                                ]],
                            ],
                        ],
                    ],
                    [
                        'slug' => 'observabilidad-logs-y-alertas',
                        'title' => 'Observabilidad: logs, métricas y alertas',
                        'type' => 'article',
                        'duration' => 16,
                        'blocks' => [
                            ['h', 'Observabilidad: logs, métricas y alertas'],
                            ['p', 'La observabilidad responde tres preguntas: qué pasó (logs), cuánto y a qué ritmo (métricas) y dónde tarda o falla (trazas). Un sistema observable se opera con datos; uno opaco se opera con oraciones y adivinanzas.'],
                            ['p', 'Los logs estructurados (JSON) se envían a un agregador (Loki, ELK); las métricas (latencia p95, tasa de errores, CPU) se pintan en dashboards y disparan alertas. En Laravel, los logs estructurados y la telemetría se integran en el pipeline con poco esfuerzo.'],
                            ['code', 'php', <<<'PHP'
use Illuminate\Support\Facades\Log;

// Log estructurado: máquina legible, contexto rico
Log::info('Inscripción creada', [
    'curso_id' => $curso->id,
    'metodo'   => $request->method(),
    'duracion_ms' => $tiempoMs,
]);

// Alertas que valen la pena
// - Tasa de 5xx > 1% en 5 minutos
// - Latencia p95 > 3s
// - Colas atascadas > 10 min
PHP],
                            ['h', 'Qué observar'],
                            ['list', [
                                'Logs estructurados con contexto',
                                'Métricas: latencia, errores, saturación',
                                'Alertas sobre métricas, no sobre ruido',
                                'Resumen del deploy: qué cambió y cuándo',
                                'Traza de petición para correlacionar',
                            ]],
                            ['p', 'La regla de las alertas: cada alerta debe tener dueño y acción. Una alerta que nadie lee o que suena siempre se ignora; entonces el sistema ya no está observado. Empieza con pocas alertas significativas y añade conforme el sistema evoluciona.'],
                            ['h', 'Puntos clave'],
                            ['list', [
                                'Logs: qué pasó; métricas: cuánto; trazas: dónde',
                                'Logs estructurados para máquinas y contexto',
                                'Alertas con dueño y acción',
                                'Pocas alertas buenas > muchas ignoradas',
                            ]],
                        ],
                        'quiz' => [
                            'title' => 'Comprueba lo aprendido',
                            'questions' => [
                                ['q' => '¿Qué responde cada pilar de la observabilidad?', 'type' => 'single', 'answers' => [
                                    ['Logs: qué pasó. Métricas: cuánto. Trazas: dónde', true, 'La triada responde incidentes completos.'],
                                    ['Logs: dónde. Métricas: qué. Trazas: por qué', false, 'Está invertido.'],
                                    ['Logs: velocidad. Métricas: color. Trazas: precio', false, 'No tiene sentido.'],
                                    ['Nada, son decoración', false, 'Son la base de operar sistemas.'],
                                ]],
                                ['q' => '¿Por qué logs estructurados (JSON) en producción?', 'type' => 'multiple', 'answers' => [
                                    ['Las máquinas los filtran y agregan fácil', true, 'El JSON se consulta con queries.'],
                                    ['Aportan contexto (ID, duración) en cada línea', true, 'Ricos en datos útiles.'],
                                    ['Son más bonitos de leer a mano', false, 'Se leen con herramientas, no a mano.'],
                                    ['Ahorran almacenamiento siempre', false, 'JSON suele ocupar más que texto plano.'],
                                ]],
                                ['q' => '¿Qué convierte una alerta en algo útil?', 'type' => 'single', 'answers' => [
                                    ['Tener dueño, umbral significativo y acción asociada', true, 'Si suena, alguien sabe qué hacer.'],
                                    ['Que suene muy a menudo', false, 'Las alertas ruidosas se ignoran.'],
                                    ['Que no tenga destinatario', false, 'Sin dueño no hay acción.'],
                                    ['Que dependa del clima', false, 'Irrelevante.'],
                                ]],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ],
];
