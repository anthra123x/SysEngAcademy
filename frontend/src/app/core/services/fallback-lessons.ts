import { LessonDetail } from '../models';

export const FALLBACK_LESSONS: Record<string, LessonDetail> = {
    "que-es-backend": {
        "id": 8,
        "module_id": 5,
        "title": "¿Qué es el Backend?",
        "slug": "que-es-backend",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es el Backend?"
                },
                {
                    "type": "paragraph",
                    "text": "El backend es la parte de una aplicación que corre en el servidor: procesa peticiones, consulta bases de datos, aplica reglas de negocio y devuelve respuestas. Mientras el frontend se encarga de lo que el usuario ve, el backend garantiza que los datos lleguen de forma segura y consistente."
                },
                {
                    "type": "paragraph",
                    "text": "Un backend típico incluye un servidor web, la aplicación con la lógica de negocio y una base de datos. Además suele sumar caché, colas de trabajo y autenticación."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// El backend recibe una petición y devuelve una respuesta\nRoute::get('/api/usuarios', function () {\n    $usuarios = DB::table('usuarios')->get();\n\n    return response()->json([\n        'data' => $usuarios,\n    ]);\n});"
                },
                {
                    "type": "diagram",
                    "diagram_type": "architecture",
                    "title": "🏛️ Arquitectura Cliente-Servidor Multi-Capa",
                    "caption": "El cliente frontend delega en el backend el almacenamiento seguro y el procesamiento de reglas de negocio, comunicándose exclusivamente a través de protocolos estandarizados (HTTPS / JSON).",
                    "steps": [
                        {
                            "step": 1,
                            "label": "Cliente / Frontend",
                            "desc": "Navegador Web / App Móvil que renderiza la interfaz y genera peticiones",
                            "icon": "🌐",
                            "tone": "accent",
                            "codeSnippet": "fetch('GET /api/v1/cursos')"
                        },
                        {
                            "step": 2,
                            "label": "API Gateway & Router",
                            "desc": "Recibe la solicitud HTTP, valida tokens Bearer y aplica rate limiting",
                            "icon": "🛡️",
                            "tone": "primary",
                            "codeSnippet": "Route::middleware('auth:sanctum')"
                        },
                        {
                            "step": 3,
                            "label": "Lógica de Negocio",
                            "desc": "Aplica reglas de dominio, cálculo de precios, roles y validaciones",
                            "icon": "⚙️",
                            "tone": "purple",
                            "codeSnippet": "CourseService::enrollStudent()"
                        },
                        {
                            "step": 4,
                            "label": "Base de Datos & Cache",
                            "desc": "PostgreSQL / Redis para persistencia transaccional y consultas de alta velocidad",
                            "icon": "🗄️",
                            "tone": "warning",
                            "codeSnippet": "SELECT * FROM enrollments"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Responsabilidades del backend"
                },
                {
                    "type": "list",
                    "items": [
                        "Procesar peticiones HTTP de los clientes",
                        "Validar datos antes de guardarlos",
                        "Consultar y persistir en bases de datos",
                        "Aplicar reglas de negocio y seguridad"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Separar el backend del frontend permite escalar cada parte por separado, cambiar la interfaz sin tocar la lógica y exponer la misma API a web, móvil y otros servicios."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El backend vive en el servidor",
                        "Procesa peticiones y devuelve respuestas",
                        "Incluye lógica, datos y seguridad",
                        "La separación frontend/backend permite escalar y reutilizar"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 5,
            "title": "El Mundo del Backend",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "principios-rest": {
        "id": 11,
        "module_id": 6,
        "title": "Principios de diseño REST",
        "slug": "principios-rest",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Principios de diseño REST"
                },
                {
                    "type": "paragraph",
                    "text": "REST es un estilo arquitectónico basado en recursos identificados por URLs y operados con métodos HTTP. Una API REST bien diseñada usa plurales para los recursos, respeta la semántica de los métodos y devuelve códigos de estado adecuados."
                },
                {
                    "type": "paragraph",
                    "text": "También aprovecha el cacheo HTTP y versiona la API para no romper a los consumidores cuando evoluciona."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Recursos en plural y verbos HTTP explícitos\nGET    /api/usuarios        -> listar\nPOST   /api/usuarios        -> crear\nGET    /api/usuarios/1      -> ver uno\nPUT    /api/usuarios/1      -> reemplazar\nPATCH  /api/usuarios/1      -> actualizar parcial\nDELETE /api/usuarios/1      -> borrar"
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Semántica de Verbos HTTP: Idempotencia y Seguridad",
                    "caption": "Un método es idempotente si ejecutarlo 1 vez o 100 veces produce el mismo estado final en el servidor. Comprender esto evita errores de duplicación de cobros o registros.",
                    "leftLabel": "Lectura y Creación (GET / POST)",
                    "leftItems": [
                        "GET: Seguro e Idempotente. Solo lee recursos sin alterar el estado. Cacheable.",
                        "POST: NO Seguro y NO Idempotente. Cada llamada crea un nuevo recurso secundario.",
                        "Códigos de éxito: 200 OK (GET con datos), 201 Created (POST con cabecera Location)."
                    ],
                    "rightLabel": "Mutación y Borrado (PUT / PATCH / DELETE)",
                    "rightItems": [
                        "PUT: Idempotente. Reemplaza el recurso completo en la URI objetivo.",
                        "PATCH: Modificación parcial. Solo actualiza los campos enviados en el payload JSON.",
                        "DELETE: Idempotente. Eliminar un recurso 1 vez o 5 veces deja el recurso inexistente (200 o 204 No Content)."
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Ciclo de Vida de una Petición HTTP REST",
                    "caption": "El cliente envía el verbo y cabeceras de negociación (Accept: application/json). El servidor valida, procesa y devuelve el recurso estructurado con el código de estado correspondiente.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "Cliente emite Request",
                            "desc": "Petición con Verbo HTTP, URI de recurso y Token Bearer en cabecera Authorization",
                            "codeSnippet": "GET /api/v1/usuarios/42",
                            "icon": "📤",
                            "tone": "accent"
                        },
                        {
                            "step": 2,
                            "label": "Middleware & Router",
                            "desc": "Inspecciona URI, valida autenticación, CORS y descodifica el token",
                            "codeSnippet": "AuthMiddleware -> UserController@show",
                            "icon": "🚦",
                            "tone": "primary"
                        },
                        {
                            "step": 3,
                            "label": "Controlador & Modelo",
                            "desc": "Ejecuta consulta a la base de datos y serializa a JSON Resource",
                            "codeSnippet": "User::findOrFail(42) -> UserResource",
                            "icon": "💾",
                            "tone": "purple"
                        },
                        {
                            "step": 4,
                            "label": "Respuesta HTTP",
                            "desc": "Devuelve código HTTP exacto, cabeceras Content-Type y payload JSON",
                            "codeSnippet": "200 OK { id: 42, name: 'Ada' }",
                            "icon": "📥",
                            "tone": "accent"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas REST básicas"
                },
                {
                    "type": "list",
                    "items": [
                        "Recursos en plural: /usuarios, /pedidos",
                        "Métodos HTTP con su semántica",
                        "Códigos de estado correctos",
                        "Versionado: /api/v1/usuarios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "REST es un estilo, no una norma escrita: lo importante es la coherencia. Si defines convenciones claras y las mantienes, tus consumidores te lo agradecerán."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los recursos se nombran en plural",
                        "Cada método HTTP tiene su significado",
                        "Los códigos de estado son parte del contrato",
                        "Versionar permite evolucionar sin romper"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 6,
            "title": "Principios REST",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "modelos-y-migraciones": {
        "id": 16,
        "module_id": 8,
        "title": "Modelos y migraciones en Eloquent",
        "slug": "modelos-y-migraciones",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Modelos y migraciones en Eloquent"
                },
                {
                    "type": "paragraph",
                    "text": "Las migraciones versionan el esquema de la base de datos y los modelos Eloquent representan tablas en código, mapeando cada fila a un objeto PHP con una sintaxis fluida."
                },
                {
                    "type": "paragraph",
                    "text": "Las migraciones se ejecutan en orden y se pueden revertir, lo que convierte el esquema en parte del repositorio y permite reproducir la BD en cualquier entorno."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Migración: define el esquema de forma versionada\nSchema::create('cursos', function (Blueprint $table) {\n    $table->id();\n    $table->string('slug')->unique();\n    $table->string('title');\n    $table->timestamps();\n});\n\n// Modelo: representa la tabla\nclass Curso extends Model\n{\n    protected $fillable = ['slug', 'title'];\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Por qué migrar"
                },
                {
                    "type": "list",
                    "items": [
                        "El esquema queda versionado en Git",
                        "Se reproduce en cualquier entorno",
                        "Se revierte con rollback",
                        "El equipo comparte los mismos cambios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Nunca edites la base de datos a mano en producción: cada cambio pasa por una migración revisada como cualquier otra pieza de código."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Las migraciones versionan el esquema",
                        "Los modelos mapean tablas a objetos",
                        "El esquema viaja con el repositorio",
                        "Los cambios de BD se revisan como código"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 8,
            "title": "Eloquent y el Modelo de Datos",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "autenticacion-con-tokens": {
        "id": 19,
        "module_id": 9,
        "title": "Autenticación con tokens (Sanctum)",
        "slug": "autenticacion-con-tokens",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Autenticación con tokens (Sanctum)"
                },
                {
                    "type": "paragraph",
                    "text": "Laravel Sanctum ofrece un sistema de tokens para SPAs y clientes móviles: el usuario inicia sesión, recibe un token y lo envía en el header Authorization: Bearer."
                },
                {
                    "type": "paragraph",
                    "text": "Los tokens pueden tener habilidades (abilities), expirar y revocarse individualmente. Es la forma estándar de autenticar APIs sin estado en Laravel."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Emitir un token al iniciar sesión\npublic function login(Request $request)\n{\n    $credenciales = $request->validate([\n        'email' => 'required|email',\n        'password' => 'required',\n    ]);\n\n    if (! Auth::attempt($credenciales)) {\n        throw ValidationException::withMessages([\n            'email' => 'Credenciales incorrectas',\n        ]);\n    }\n\n    $token = $request->user()->createToken('app', ['pedidos:leer']);\n\n    return response()->json(['token' => $token->plainTextToken]);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de tokens"
                },
                {
                    "type": "list",
                    "items": [
                        "Enviar siempre por HTTPS",
                        "Limitar habilidades al mínimo",
                        "Revocar tokens al cerrar sesión",
                        "Nunca guardar tokens en logs"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un token es una llave de acceso: si se filtra, quien lo tenga actúa como el usuario. Por eso viaja cifrado, expira y se revoca al menor indicio de fuga."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El token viaja en Authorization: Bearer",
                        "Las habilidades limitan lo que puede hacer",
                        "Los tokens se revocan individualmente",
                        "HTTPS es obligatorio para tokens"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 9,
            "title": "Autenticación y Protección",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "como-funciona-jwt": {
        "id": 34,
        "module_id": 15,
        "title": "¿Cómo funciona un JWT?",
        "slug": "como-funciona-jwt",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Cómo funciona un JWT?"
                },
                {
                    "type": "paragraph",
                    "text": "Un JWT es un token firmado con tres partes: header, payload y firma. El servidor lo firma y el cliente lo envía en cada petición, de modo que no hace falta sesión en el servidor: la API es sin estado."
                },
                {
                    "type": "paragraph",
                    "text": "Debe tener expiración, viajar siempre por HTTPS y nunca contener datos sensibles en el payload, porque el payload solo se codifica, no se cifra."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Un JWT se ve así: tres partes separadas por puntos\nHEADER.PAYLOAD.FIRMA\n\n# El payload es legible: solo está codificado en base64\necho \"eyJzdWIiOiIxIn0\" | base64 -d\n# {\"sub\":\"1\"}"
                },
                {
                    "type": "diagram",
                    "diagram_type": "architecture",
                    "title": "🏛️ Anatomía Estructural de un JSON Web Token (JWT)",
                    "caption": "Un JWT consta de 3 secciones separadas por puntos (header.payload.signature). El payload es público y legible; la firma criptográfica garantiza que ningún atacante altere los datos.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "1. Header (Encabezado)",
                            "desc": "Define el algoritmo de firma criptográfica y el tipo de token",
                            "icon": "🔴",
                            "tone": "danger",
                            "codeSnippet": "{ \"alg\": \"HS256\", \"typ\": \"JWT\" }"
                        },
                        {
                            "step": 2,
                            "label": "2. Payload (Carga de Datos)",
                            "desc": "Claims o atributos públicos del usuario (sub, role, exp). ¡Codificado en Base64Url, NO cifrado!",
                            "icon": "🟣",
                            "tone": "purple",
                            "codeSnippet": "{ \"sub\": 1, \"role\": \"student\", \"exp\": 1750000000 }"
                        },
                        {
                            "step": 3,
                            "label": "3. Signature (Firma Digital)",
                            "desc": "Hash generado con la clave secreta del servidor. Si un byte cambia, la firma queda invalidada",
                            "icon": "🔵",
                            "tone": "accent",
                            "codeSnippet": "HMACSHA256(header + '.' + payload, SECRET_KEY)"
                        }
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Flujo de Autenticación Stateless (Sin Estado)",
                    "caption": "El servidor no almacena sesiones en disco o memoria; valida el token matemáticamente mediante su clave secreta en cada petición entrante.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "POST /api/login",
                            "desc": "El usuario envía credenciales (email y contraseña) validadas por el backend",
                            "icon": "🔑",
                            "codeSnippet": "Auth::attempt(['email' => $email, 'password' => $pass])"
                        },
                        {
                            "step": 2,
                            "label": "Emisión del JWT",
                            "desc": "El servidor firma el token con su clave secreta y lo devuelve en la respuesta",
                            "icon": "🎟️",
                            "tone": "accent",
                            "codeSnippet": "return response()->json(['token' => $jwt])"
                        },
                        {
                            "step": 3,
                            "label": "Petición Protegida",
                            "desc": "El cliente adjunta el token en la cabecera en cada solicitud subsecuente",
                            "icon": "🚀",
                            "codeSnippet": "Authorization: Bearer eyJhbGciOi..."
                        },
                        {
                            "step": 4,
                            "label": "Verificación Criptográfica",
                            "desc": "El servidor recalcula la firma. Si coincide, autoriza la petición instantáneamente",
                            "icon": "✅",
                            "tone": "primary",
                            "codeSnippet": "JWT::verify($token, $secretKey)"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Propiedades del JWT"
                },
                {
                    "type": "list",
                    "items": [
                        "Header: algoritmo y tipo de token",
                        "Payload: claims como exp, sub, rol",
                        "Firma: garantiza que nadie lo alteró",
                        "Sin estado: el servidor no guarda sesión"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La firma se verifica con la clave secreta: si alguien modifica el payload, la firma deja de ser válida. Por eso el servidor confía en el token sin consultar una sesión."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "JWT = header + payload + firma",
                        "El payload se codifica, no se cifra",
                        "Expiraciones cortas reducen el riesgo",
                        "Sin estado: la API no guarda sesión"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 15,
            "title": "Tokens y Sesiones",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "componentes-y-templates": {
        "id": 25,
        "module_id": 11,
        "title": "Componentes y templates",
        "slug": "componentes-y-templates",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Componentes y templates"
                },
                {
                    "type": "paragraph",
                    "text": "Angular organiza la UI en componentes: cada uno tiene template, estilos y clase. Con las standalone components ya no hace falta NgModule para la mayoría de los casos."
                },
                {
                    "type": "paragraph",
                    "text": "La interpolación {{ }} y el data binding conectan el estado de la clase con el template de forma reactiva: cuando cambia la propiedad, la vista se actualiza."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Component } from \"@angular/core\";\n\n@Component({\n    selector: \"app-saludo\",\n    standalone: true,\n    template: `\n        <h2>{{ titulo }}</h2>\n        <p>Bienvenido, {{ usuario }}</p>\n    `,\n})\nexport class SaludoComponent {\n    titulo = \"Hola desde Angular\";\n    usuario = \"Ana\";\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Partes de un componente"
                },
                {
                    "type": "list",
                    "items": [
                        "Decorador @Component con metadatos",
                        "Clase con estado y lógica",
                        "Template con binding e interpolación",
                        "Estilos propios opcionales"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La propiedad standalone elimina la ceremonia de módulos: el componente declara en imports lo que necesita. Es el estilo recomendado en Angular moderno."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Un componente = template + clase + metadatos",
                        "La interpolación {{ }} muestra el estado",
                        "standalone simplifica la estructura",
                        "La reactividad actualiza la vista sola"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 11,
            "title": "Fundamentos de Angular",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "accesibilidad-wcag": {
        "id": 30,
        "module_id": 13,
        "title": "Accesibilidad: WCAG en la práctica",
        "slug": "accesibilidad-wcag",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Accesibilidad: WCAG en la práctica"
                },
                {
                    "type": "paragraph",
                    "text": "WCAG define criterios para que la web sea usable por todas las personas: contraste suficiente, alternativas de texto, navegación por teclado y roles ARIA. La accesibilidad no es opcional: es calidad."
                },
                {
                    "type": "paragraph",
                    "text": "Los criterios se organizan en niveles A, AA y AAA. El nivel AA es el objetivo habitual para sitios públicos y el requerido por muchas normativas."
                },
                {
                    "type": "code",
                    "language": "css",
                    "text": "/* Contraste AA: texto gris claro sobre blanco no pasa */\n.enlace {\n    color: #2563eb;      /* contraste suficiente vs blanco */\n}\n\n.texto-bajo {\n    color: #999999;      /* evita: contraste insuficiente */\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Criterios que más se incumplen"
                },
                {
                    "type": "list",
                    "items": [
                        "Contraste de texto insuficiente",
                        "Imágenes sin alternativa textual",
                        "Elementos no operables por teclado",
                        "Formularios sin labels"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla práctica: si solo usas el ratón o solo ves los colores para entender tu interfaz, otras personas no podrán usarla. Probar con teclado y con lectores de pantalla lo revela."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "WCAG define niveles A, AA y AAA",
                        "AA es el objetivo estándar",
                        "Contraste, alt y teclado son los básicos",
                        "La accesibilidad beneficia a todas las personas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 13,
            "title": "Accesibilidad",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "secretos-y-variables-de-entorno": {
        "id": 21,
        "module_id": 9,
        "title": "Secretos y variables de entorno",
        "slug": "secretos-y-variables-de-entorno",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Secretos y variables de entorno"
                },
                {
                    "type": "paragraph",
                    "text": "Nunca se deben commitear claves ni credenciales: se guardan en .env (fuera de Git) y en producción se inyectan mediante el gestor de secretos del proveedor."
                },
                {
                    "type": "paragraph",
                    "text": "Mantener el código libre de datos sensibles, rotar las claves periódicamente y auditar los repositorios evita fugas que son difíciles de revertir."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# .env (NO se sube a Git)\nDB_PASSWORD=supersecreta\nAPI_KEY=sk_live_1234\n\n# .env.example (sí se sube, con valores vacíos)\nDB_PASSWORD=\nAPI_KEY="
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de oro de los secretos"
                },
                {
                    "type": "list",
                    "items": [
                        "El .env nunca entra al repositorio",
                        "Los secretos de producción se inyectan por el proveedor",
                        "Rota las claves filtradas de inmediato",
                        "Audita el historial de Git tras una filtración"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Si un secreto se filtra, asume que está comprometido: revócalo, rota la clave y elimina el archivo del historial de Git con herramientas como git-filter-repo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Secretos fuera del repositorio, siempre",
                        "Los gestores de secretos inyectan en producción",
                        "Rota cualquier clave comprometida",
                        "Auditar el historial evita fugas persistentes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 9,
            "title": "Autenticación y Protección",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "que-es-un-contenedor": {
        "id": 40,
        "module_id": 18,
        "title": "¿Qué es un contenedor?",
        "slug": "que-es-un-contenedor",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es un contenedor?"
                },
                {
                    "type": "paragraph",
                    "text": "Un contenedor empaqueta tu aplicación con sus dependencias y las aísla del resto del sistema con cgroups y namespaces. El resultado: la misma imagen corre igual en tu portátil, en el servidor de staging y en producción."
                },
                {
                    "type": "paragraph",
                    "text": "A diferencia de una máquina virtual, el contenedor comparte el kernel del host y arranca en segundos. Eso lo hace ligero y perfecto para microservicios, pero significa que el host y el contenedor están más acoplados: un kernel vulnerable afecta a todos."
                },
                {
                    "type": "code",
                    "language": "dockerfile",
                    "text": "# Dockerfile mínimo\nFROM php:8.3-cli\nWORKDIR /app\nCOPY . .\nCMD [\"php\", \"artisan\", \"serve\"]"
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Máquina Virtual (VM) vs Contenedor Docker",
                    "caption": "Las máquinas virtuales virtualizan el hardware completo a través de un hipervisor; los contenedores virtualizan a nivel de sistema operativo compartiendo el kernel del host de forma ultra ligera.",
                    "leftLabel": "Máquina Virtual (VM)",
                    "leftItems": [
                        "Incluye un Sistema Operativo completo e independiente (Guest OS) por VM",
                        "Hipervisor emula procesador, memoria RAM, discos y tarjetas de red virtuales",
                        "Tamaño pesado: de varios Gigabytes (GB) por cada imagen",
                        "Tiempo de arranque prolongado: de 1 a varios minutos",
                        "Aislamiento a nivel de hardware mediante virtualización"
                    ],
                    "rightLabel": "Contenedor Docker",
                    "rightItems": [
                        "Sin Guest OS: comparte directamente el Kernel del Sistema Operativo anfitrión",
                        "Aislamiento por namespaces (procesos, red, usuarios) y cgroups (CPU, RAM)",
                        "Tamaño ultra ligero: decenas de Megabytes (MB)",
                        "Arranque casi instantáneo: milisegundos o segundos",
                        "Densidad extrema: decenas de contenedores en el mismo servidor físico"
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Ciclo de Vida Docker: De Código a Producción",
                    "caption": "El flujo canónico de Docker garantiza que la imagen construida y probada sea exactamente la misma que corre en producción.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "1. Dockerfile",
                            "desc": "Archivo de instrucciones declarativas paso a paso (FROM, COPY, RUN, CMD)",
                            "icon": "📄",
                            "codeSnippet": "docker build -t mi-app:v1 ."
                        },
                        {
                            "step": 2,
                            "label": "2. Docker Image",
                            "desc": "Empaquetado binario inmutable compuesto por capas de sólo lectura con suma de verificación SHA",
                            "icon": "📦",
                            "tone": "accent",
                            "codeSnippet": "docker images"
                        },
                        {
                            "step": 3,
                            "label": "3. Container Registry",
                            "desc": "Repositorio remoto seguro en la nube (Docker Hub, GitHub Packages, AWS ECR)",
                            "icon": "☁️",
                            "tone": "purple",
                            "codeSnippet": "docker push mi-org/mi-app:v1"
                        },
                        {
                            "step": 4,
                            "label": "4. Contenedor en Ejecución",
                            "desc": "Instancia viva y aislada del proceso con capa escribible superior",
                            "icon": "🐳",
                            "tone": "primary",
                            "codeSnippet": "docker run -d -p 8080:80 mi-app:v1"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diferencias clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Contenedor: comparte kernel, arranca en segundos, ligero",
                        "Máquina virtual: kernel propio, arranque lento, aislada",
                        "Imagen: plantilla de solo lectura para crear contenedores",
                        "Registro: almacén de imágenes (Docker Hub, GHCR)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En la práctica, un contenedor es un proceso con su propio sistema de archivos y red. Docker añade capas de comodidad: construye la imagen con un Dockerfile, la ejecuta con docker run y la versiona en un registro para compartirla con tu equipo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El contenedor aísla proceso, archivos y red",
                        "Comparte el kernel: ligero pero acoplado al host",
                        "La imagen es la plantilla; el contenedor, la instancia",
                        "Contenedor no es máquina virtual"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 18,
            "title": "Contenedores",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "que-es-git": {
        "id": 44,
        "module_id": 20,
        "title": "¿Qué es Git y por qué usarlo?",
        "slug": "que-es-git",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es Git y por qué usarlo?"
                },
                {
                    "type": "paragraph",
                    "text": "Git es un sistema de control de versiones distribuido: guarda el historial completo de tu proyecto en cada copia del repositorio. Cada cambio queda registrado con autor, fecha y mensaje, y puedes volver a cualquier punto de la historia."
                },
                {
                    "type": "paragraph",
                    "text": "A diferencia de sistemas centralizados (SVN), Git funciona offline y cada clon es un respaldo completo. Es el estándar de la industria: GitHub, GitLab y Bitbucket lo usan de base para colaborar, revisar código y desplegar."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Configuración inicial (una sola vez)\ngit config --global user.name \"Ada Lovelace\"\ngit config --global user.email \"ada@example.com\"\n\n# Crear un repositorio\ncd mi-proyecto\ngit init"
                },
                {
                    "type": "diagram",
                    "diagram_type": "svg",
                    "title": "📐 Mapa de las 4 Áreas de Trabajo en Git",
                    "caption": "Git separa los cambios en fases estrictas: editas en el Working Directory, preparas tu selección con git add en el Staging Area, sellas el snapshot con git commit en tu repositorio local y finalmente sincronizas con el servidor remoto (GitHub) vía git push.",
                    "svg_content": "<svg viewBox=\"0 0 760 210\" xmlns=\"http://www.w3.org/2000/svg\" style=\"font-family: system-ui, sans-serif;\"><defs><marker id=\"gitArrCyan\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#00D9FF\"/></marker><marker id=\"gitArrGreen\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#0AE98A\"/></marker><marker id=\"gitArrPurple\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#A855F7\"/></marker></defs><rect x=\"15\" y=\"45\" width=\"150\" height=\"120\" rx=\"10\" fill=\"#161926\" stroke=\"#EF4444\" stroke-width=\"1.8\"/><rect x=\"25\" y=\"55\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#EF4444\" fill-opacity=\"0.15\"/><text x=\"90\" y=\"71\" fill=\"#EF4444\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">WORKING DIRECTORY</text><text x=\"90\" y=\"105\" fill=\"#F8FAFC\" font-size=\"13\" font-weight=\"bold\" text-anchor=\"middle\">📁 Tu Editor / IDE</text><text x=\"90\" y=\"130\" fill=\"#94A3B8\" font-size=\"11\" text-anchor=\"middle\">Archivos sin seguimiento</text><text x=\"90\" y=\"148\" fill=\"#EF4444\" font-family=\"monospace\" font-size=\"10\" text-anchor=\"middle\">Untracked / Modified</text><line x1=\"165\" y1=\"105\" x2=\"215\" y2=\"105\" stroke=\"#00D9FF\" stroke-width=\"2\" marker-end=\"url(#gitArrCyan)\"/><rect x=\"167\" y=\"80\" width=\"48\" height=\"18\" rx=\"4\" fill=\"#00D9FF\" fill-opacity=\"0.2\"/><text x=\"191\" y=\"93\" fill=\"#00D9FF\" font-family=\"monospace\" font-size=\"10\" font-weight=\"bold\" text-anchor=\"middle\">git add</text><rect x=\"220\" y=\"45\" width=\"150\" height=\"120\" rx=\"10\" fill=\"#161926\" stroke=\"#00D9FF\" stroke-width=\"1.8\"/><rect x=\"230\" y=\"55\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#00D9FF\" fill-opacity=\"0.15\"/><text x=\"295\" y=\"71\" fill=\"#00D9FF\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">STAGING AREA</text><text x=\"295\" y=\"105\" fill=\"#F8FAFC\" font-size=\"13\" font-weight=\"bold\" text-anchor=\"middle\">📋 Preparación</text><text x=\"295\" y=\"130\" fill=\"#94A3B8\" font-size=\"11\" text-anchor=\"middle\">Snapshot provisional</text><text x=\"295\" y=\"148\" fill=\"#00D9FF\" font-family=\"monospace\" font-size=\"10\" text-anchor=\"middle\">Staged for commit</text><line x1=\"370\" y1=\"105\" x2=\"420\" y2=\"105\" stroke=\"#0AE98A\" stroke-width=\"2\" marker-end=\"url(#gitArrGreen)\"/><rect x=\"368\" y=\"80\" width=\"58\" height=\"18\" rx=\"4\" fill=\"#0AE98A\" fill-opacity=\"0.2\"/><text x=\"397\" y=\"93\" fill=\"#0AE98A\" font-family=\"monospace\" font-size=\"9\" font-weight=\"bold\" text-anchor=\"middle\">git commit</text><rect x=\"425\" y=\"45\" width=\"150\" height=\"120\" rx=\"10\" fill=\"#161926\" stroke=\"#0AE98A\" stroke-width=\"1.8\"/><rect x=\"435\" y=\"55\" width=\"130\" height=\"24\" rx=\"5\" fill=\"#0AE98A\" fill-opacity=\"0.15\"/><text x=\"500\" y=\"71\" fill=\"#0AE98A\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">LOCAL REPO</text><text x=\"500\" y=\"105\" fill=\"#F8FAFC\" font-size=\"13\" font-weight=\"bold\" text-anchor=\"middle\">💾 Base .git Local</text><text x=\"500\" y=\"130\" fill=\"#94A3B8\" font-size=\"11\" text-anchor=\"middle\">Commits con SHA inmutable</text><text x=\"500\" y=\"148\" fill=\"#0AE98A\" font-family=\"monospace\" font-size=\"10\" text-anchor=\"middle\">HEAD -&gt; main (local)</text><line x1=\"575\" y1=\"105\" x2=\"625\" y2=\"105\" stroke=\"#A855F7\" stroke-width=\"2\" marker-end=\"url(#gitArrPurple)\"/><rect x=\"576\" y=\"80\" width=\"52\" height=\"18\" rx=\"4\" fill=\"#A855F7\" fill-opacity=\"0.2\"/><text x=\"602\" y=\"93\" fill=\"#A855F7\" font-family=\"monospace\" font-size=\"9\" font-weight=\"bold\" text-anchor=\"middle\">git push</text><rect x=\"630\" y=\"45\" width=\"115\" height=\"120\" rx=\"10\" fill=\"#161926\" stroke=\"#A855F7\" stroke-width=\"1.8\"/><rect x=\"638\" y=\"55\" width=\"99\" height=\"24\" rx=\"5\" fill=\"#A855F7\" fill-opacity=\"0.15\"/><text x=\"687\" y=\"71\" fill=\"#A855F7\" font-size=\"10\" font-weight=\"bold\" text-anchor=\"middle\">REMOTE REPO</text><text x=\"687\" y=\"105\" fill=\"#F8FAFC\" font-size=\"13\" font-weight=\"bold\" text-anchor=\"middle\">☁️ GitHub</text><text x=\"687\" y=\"130\" fill=\"#94A3B8\" font-size=\"10\" text-anchor=\"middle\">Colaboración</text><text x=\"687\" y=\"148\" fill=\"#A855F7\" font-family=\"monospace\" font-size=\"10\" text-anchor=\"middle\">origin/main</text></svg>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué aporta Git"
                },
                {
                    "type": "list",
                    "items": [
                        "Historial completo y versionado de cada cambio",
                        "Trabajo offline y repositorios respaldados en cada clon",
                        "Ramas para experimentar sin romper lo estable",
                        "Colaboración con revisión de código en plataformas",
                        "Rollback a cualquier punto de la historia"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Git no es solo guardar versiones: es la base de los flujos modernos. Pull requests, code review, despliegues por rama y trazabilidad de bugs dependen de un historial limpio y bien comunicado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Git es distribuido: cada clon es un respaldo",
                        "Registra autor, fecha y mensaje por cambio",
                        "Los repositorios locales te dejan trabajar sin red",
                        "git config prepara tu identidad para los commits"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 20,
            "title": "Primeros pasos",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "requerimientos-funcionales-y-no": {
        "id": 48,
        "module_id": 22,
        "title": "Requerimientos funcionales y no funcionales",
        "slug": "requerimientos-funcionales-y-no",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requerimientos funcionales y no funcionales"
                },
                {
                    "type": "paragraph",
                    "text": "Un requerimiento es una capacidad o condición que el sistema debe cumplir. Los funcionales describen qué hace el sistema: acciones, reglas de negocio, respuestas. Los no funcionales describen cómo lo hace: rendimiento, seguridad, usabilidad, disponibilidad."
                },
                {
                    "type": "paragraph",
                    "text": "Separarlos importa porque se prueban distinto y se diseñan distinto: el funcional define la lógica; el no funcional, la arquitectura. Olvidar un requerimiento no funcional (p. ej. soportar 1000 usuarios concurrentes) puede tirar abajo un diseño completo."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Requerimiento FUNCIONAL (qué hace)\n// RF-01: El sistema debe permitir a un estudiante\n//        inscribirse en un curso con un clic.\n\n// Requerimiento NO FUNCIONAL (cómo lo hace)\n// RNF-01: La inscripción debe confirmarse en menos\n//         de 2 segundos con 1 000 usuarios concurrentes.\n$inscripcion = (new InscripcionService())->inscribir($cursoId, $usuarioId);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Clasificación práctica"
                },
                {
                    "type": "list",
                    "items": [
                        "Funcional: acciones, reglas, lógica de negocio",
                        "No funcional: rendimiento, seguridad, usabilidad",
                        "Ambos deben ser medibles y verificables",
                        "Solo los medibles se pueden testear y aceptar",
                        "Los no funcionales son los que rompen la arquitectura"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Al escribir, usa lenguaje verificable: \"más de 2 segundos\" o \"el 99,9 % de disponibilidad\" se pueden medir; \"rápido\" o \"seguro\" no. Un requerimiento que no se puede verificar no es un requerimiento, es una opinión."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Funcionales: qué hace el sistema",
                        "No funcionales: cómo y con qué calidad",
                        "Todo requerimiento debe ser verificable",
                        "Los no funcionales condicionan la arquitectura"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 22,
            "title": "Conceptos clave",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "historias-de-usuario": {
        "id": 50,
        "module_id": 23,
        "title": "Historias de usuario con criterios de aceptación",
        "slug": "historias-de-usuario",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Historias de usuario con criterios de aceptación"
                },
                {
                    "type": "paragraph",
                    "text": "Una historia de usuario describe una funcionalidad desde la perspectiva de quien la usa, en una frase: Como [rol], quiero [acción] para [beneficio]. La plantilla fuerza tres decisiones: quién, qué y por qué."
                },
                {
                    "type": "paragraph",
                    "text": "Los criterios de aceptación son la parte que se prueba: condiciones concretas que determinan si la historia está terminada. Se escriben en formato Given/When/Then (Gherkin) o como lista de condiciones verificables."
                },
                {
                    "type": "code",
                    "language": "gherkin",
                    "text": "Historia:\n  Como estudiante,\n  quiero inscribirme en un curso con un clic,\n  para empezar a aprender de inmediato.\n\nCriterios de aceptación:\n  Dado que soy un usuario autenticado\n  y el curso tiene plazas disponibles,\n  cuando hago clic en \"Inscribirme\",\n  entonces se crea mi matrícula\n  y recibo un correo de confirmación."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de historias"
                },
                {
                    "type": "list",
                    "items": [
                        "Háblalas desde el rol, no desde el sistema",
                        "Mantén el beneficio explícito",
                        "Criterios de aceptación verificables y específicos",
                        "Historias pequeñas: una semana o menos de trabajo",
                        "Divide antes de implementar, no durante"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Una historia sin criterios es una conversación pendiente: el equipo no sabe cuándo estará lista. Los criterios convierten la historia en un contrato de prueba y son la base de los tests de aceptación automatizados."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Plantilla: como / quiero / para",
                        "Los criterios de aceptación definen \"terminado\"",
                        "Given/When/Then hace los criterios automatizables",
                        "Historias pequeñas y verificables"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 23,
            "title": "Técnicas de modelado",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "manejo-seguro-de-errores": {
        "id": 505,
        "module_id": 199,
        "title": "Manejo seguro de errores y logging",
        "slug": "manejo-seguro-de-errores",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Manejo seguro de errores y logging"
                },
                {
                    "type": "paragraph",
                    "text": "Los errores filtran información: una excepción con stack trace completo, una consulta SQL expuesta o un mensaje que revela qué archivo interno existe son mapas para el atacante. El principio es claro: detalles técnicos al log, mensajes genéricos al usuario."
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel, los mensajes de validación y las respuestas de error deben ser útiles pero opacos: \"Credenciales incorrectas\" en vez de \"el usuario admin no existe\". Y los logs nunca deben contener secretos ni datos personales sensibles."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Support\\Facades\\Log;\n\n// No filtres detalles internos al cliente\nif (! $usuario || ! Hash::check($password, $usuario->password)) {\n    Log::warning('Login fallido', ['email' => $request->email]);\n    throw ValidationException::withMessages([\n        'email' => 'Credenciales incorrectas.', // genérico\n    ]);\n}\n\n// Asegúrate de no loguear secretos\nLog::info('Pago procesado', ['pago_id' => $pago->id]); // no tokens"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de errores seguros"
                },
                {
                    "type": "list",
                    "items": [
                        "Mensajes genéricos al usuario, detalle al log",
                        "Nunca expongas stack traces en producción",
                        "No loguees contraseñas, tokens ni datos sensibles",
                        "Oculta la existencia de recursos (mismo mensaje 404/403)",
                        "Reporta errores (Sentry, Bugsnag) con contexto sanitizado"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un atacante automatiza: probar usuarios con mensajes distintos es el método para enumerar cuentas. Mensajes idénticos para \"usuario no existe\" y \"contraseña incorrecta\" cierran esa puerta, y el log detallado te da a ti la visibilidad que el usuario no necesita."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Detalle al log, opacidad al cliente",
                        "Los stacks y secretos no salen de producción",
                        "Logs sanitizados sin datos sensibles",
                        "Mensajes uniformes evitan enumeración"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 199,
            "title": "Defensa en profundidad",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "rate-limiting-y-proteccion-de-abuso": {
        "id": 506,
        "module_id": 199,
        "title": "Rate limiting y protección contra abuso",
        "slug": "rate-limiting-y-proteccion-de-abuso",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Rate limiting y protección contra abuso"
                },
                {
                    "type": "paragraph",
                    "text": "Las APIs públicas reciben abuso: fuerza bruta en login, scraping, spam en formularios. El rate limiting limita cuántas peticiones acepta un cliente por ventana de tiempo y responde 429 cuando se excede. Es la primera línea contra el abuso."
                },
                {
                    "type": "paragraph",
                    "text": "Laravel trae throttle integrado: puedes limitar por usuario, por IP o globalmente, y responder con la cabecera Retry-After. Para acciones sensibles (login, registro, envío de emails) usa límites estrictos y específicos, no solo uno global."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Cache\\RateLimiter;\nuse Illuminate\\Support\\Facades\\RateLimiter as Limiter;\n\n// Definir un limitador por email+IP en AppServiceProvider\nLimiter::for('login', function ($request) {\n    return Limiter::limit(5)->perMinutes(1)->by(\n        $request->input('email').'|'.$request->ip()\n    );\n});\n\n// En la ruta\nRoute::post('/login', [AuthController::class, 'login'])\n    ->middleware('throttle:login');"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dónde aplicar límites"
                },
                {
                    "type": "list",
                    "items": [
                        "Login y registro: límites estrictos",
                        "Endpoints de scraping sensible (cursos, precios)",
                        "Envío de emails y acciones destructivas",
                        "Límite global más límites específicos",
                        "Respuesta 429 con Retry-After"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El rate limiting no para a un atacante decidido, pero encarece el ataque y frena el abuso casual. Combínalo con captchas en puntos críticos, bloqueo tras N intentos fallidos y monitoreo de picos anómalos por IP."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Limita por ventana de tiempo y por cliente",
                        "Límites específicos para login y acciones sensibles",
                        "429 + Retry-After informan al cliente",
                        "El rate limiting encarece, no detiene del todo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 199,
            "title": "Defensa en profundidad",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "que-es-un-llm": {
        "id": 54,
        "module_id": 25,
        "title": "¿Qué es un modelo de lenguaje grande (LLM)?",
        "slug": "que-es-un-llm",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es un modelo de lenguaje grande (LLM)?"
                },
                {
                    "type": "paragraph",
                    "text": "Un LLM es un modelo estadístico entrenado con enormes cantidades de texto para predecir la siguiente palabra (token) probable. Esa habilidad, repetida a gran escala, produce textos coherentes, resúmenes, código y respuestas a preguntas."
                },
                {
                    "type": "paragraph",
                    "text": "No es un buscador ni una base de datos: no \"recuerda\" tu conversación ni sabe los hechos actuales salvo lo que su entrenamiento y el contexto que le des contengan. Por eso hay que tratarlo como un motor estadístico, potente pero falible."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Lo mínimo que debes saber\n$llm = [\n    'entrada' => 'tokens (fragmentos de texto)',\n    'salida'  => 'tokens predichos de forma estadística',\n    'memoria' => 'limitada al contexto que le envías',\n    'riesgo'  => 'puede inventar hechos (alucinaciones)',\n    'fuerza'  => 'resúmenes, código, borradores, traducciones',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Propiedades de los LLMs"
                },
                {
                    "type": "list",
                    "items": [
                        "Predicen el siguiente token con probabilidades",
                        "Generalizan patrones aprendidos del texto",
                        "Su conocimiento se congela al terminar el entrenamiento",
                        "Responden según el contexto que reciben (prompt)",
                        "Pueden equivocarse con total seguridad aparente"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En la práctica, un LLM es el primer componente que \"habla\" tu idioma sin programación explícita. Tu trabajo como desarrollador es darle contexto claro, validar sus salidas y acotar sus errores con diseño: ni fe ciega, ni desprecio."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Predicción estadística de tokens, no inteligencia mágica",
                        "El conocimiento se congela tras el entrenamiento",
                        "Todo lo que sabe entra por el contexto que le das",
                        "Alucina: valida siempre sus salidas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 25,
            "title": "Conceptos",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "prompts-claros-y-rol": {
        "id": 56,
        "module_id": 26,
        "title": "Contexto, rol y formato en los prompts",
        "slug": "prompts-claros-y-rol",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Contexto, rol y formato en los prompts"
                },
                {
                    "type": "paragraph",
                    "text": "Un buen prompt es un brief de trabajo: contexto (en qué proyecto, con qué restricciones), rol (eres un revisor de seguridad) y formato (responde en JSON, en lista, con 3 ideas). El modelo no adivina: aprovecha todo lo que le expliques."
                },
                {
                    "type": "paragraph",
                    "text": "Los prompts buenos se escriben como especificaciones: primero el objetivo, luego las restricciones y por último el formato esperado. Instrucciones vagas producen respuestas genéricas; contexto concreto produce respuestas accionables."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "Mal prompt:\n\"Explícame middleware de Laravel.\"\n\nBuen prompt:\n\"Actúa como un mentor de Laravel para un desarrollador júnior.\nExplica qué es un middleware en Laravel 12, cuándo se usa y\nmuestra un ejemplo de middleware de autenticación.\nResponde en español, en 3 párrafos y con un bloque de código.\""
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Elementos de un prompt completo"
                },
                {
                    "type": "list",
                    "items": [
                        "Rol: en qué posición quieres que responda",
                        "Contexto: proyecto, stack, audiencia",
                        "Tarea: qué resultado quieres exactamente",
                        "Formato: JSON, lista, tabla, extensión",
                        "Restricciones: tono, longitud, idioma, exclusiones"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El formato es la parte más fácil de medir: si necesitas JSON, pídelo explícito y valida el resultado. En código, pedir \"solo PHP, sin explicaciones\" ahorra tokens y ruido. Explicitar el formato convierte la magia en contrato."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Rol + contexto + tarea + formato = prompt completo",
                        "El contexto concreto produce respuestas accionables",
                        "Pide el formato y valídalo",
                        "Especifica restricciones para ahorrar tokens"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 26,
            "title": "Técnicas de prompting",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "git-avanzado-rebase-conflictos-diferencia-real-entre-git-merge-y-git-rebase": {
        "id": 614,
        "module_id": 232,
        "title": "Diferencia real entre Git Merge y Git Rebase",
        "slug": "git-avanzado-rebase-conflictos-diferencia-real-entre-git-merge-y-git-rebase",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": "## Diferencia Real entre Git Merge y Git Rebase\n\nTanto `git merge` como `git rebase` integran cambios de una rama en otra, pero con filosofías de historial completamente distintas.\n\n### Git Merge (Integración No Destructiva)\n* Crea un nuevo **commit de unión (Merge Commit)** con dos padres.\n* Preserva la historia exacta y cronológica de cuándo se desarrollaron los commits.\n* **Desventaja:** Historial en forma de telaraña (*railroad tracks*) cuando muchos desarrolladores integran ramas.\n\n### Git Rebase (Historia Lineal y Limpia)\n* Toma los commits de tu rama de funcionalidad y los *reaplica uno a uno* sobre la punta de la rama base (ej. `main`).\n* Crea nuevos hashes SHA-1 para cada commit reubicado.\n* **Ventaja:** Historial completamente plano y legible (ideal para `git bisect` y auditoría).\n\n```diagram\n{\n  \"diagram_type\": \"comparison\",\n  \"title\": \"⚖️ Git Merge vs Git Rebase: Arquitectura del Historial\",\n  \"caption\": \"El merge conserva la cronología real mediante un commit de integración con 2 padres; el rebase traslada los commits a la punta de main creando una secuencia 100% lineal sin ruido.\",\n  \"leftLabel\": \"git merge (Unión No Destructiva)\",\n  \"leftItems\": [\n    \"Crea un commit adicional de merge con 2 hashes padres\",\n    \"Preserva la verdad cronológica exacta del desarrollo\",\n    \"100% seguro en ramas públicas y colaborativas\",\n    \"Ramas con múltiples cruces en el grafo (historial en telaraña)\"\n  ],\n  \"rightLabel\": \"git rebase (Reescritura Lineal)\",\n  \"rightItems\": [\n    \"Reaplica tus commits en la cima de main sin commit de merge\",\n    \"Reescribe el historial generando nuevos hashes SHA-1\",\n    \"Ideal para limpiar ramas de funcionalidad antes de abrir el Pull Request\",\n    \"Historial plano, secuencial y óptimo para git bisect\"\n  ]\n}\n```\n\n> **La Regla de Oro del Rebase:** **NUNCA** hagas rebase sobre una rama pública compartida (como `main` en producción). Solo haz rebase en tus ramas locales de trabajo antes de abrir el Pull Request.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 232,
            "title": "Rebase y Limpieza del Historial",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "cifrado-y-privacidad-de-datos": {
        "id": 507,
        "module_id": 199,
        "title": "Cifrado, cabeceras de seguridad y privacidad",
        "slug": "cifrado-y-privacidad-de-datos",
        "type": "article",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cifrado, cabeceras de seguridad y privacidad"
                },
                {
                    "type": "paragraph",
                    "text": "La seguridad de datos tiene tres frentes: en tránsito (HTTPS obligatorio), en reposo (cifrado de campos sensibles en la BD) y en uso (mínimo acceso posible). Laravel cifra con el comando encrypt() datos como tarjetas o direcciones, y las cabeceras HTTP endurecen el navegador contra ataques."
                },
                {
                    "type": "paragraph",
                    "text": "Las cabeceras de seguridad (HSTS, X-Content-Type-Options, CSP, X-Frame-Options) se configuran en el middleware o el servidor. CSP limita qué scripts y orígenes ejecuta tu página, cortando XSS y exfiltración de datos."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Support\\Facades\\Crypt;\n\n// Cifrar en reposo\n$usuario->tarjeta = Crypt::encryptString($request->tarjeta);\n$usuario->save();\n\n// Cabeceras de seguridad en Laravel\n// (middleware o nginx)\nheader('Strict-Transport-Security: max-age=31536000');\nheader('X-Content-Type-Options: nosniff');\nheader('X-Frame-Options: DENY');\n// Content-Security-Policy restringe scripts y orígenes\nheader(\"Content-Security-Policy: default-src 'self'\");"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Frentes de protección"
                },
                {
                    "type": "list",
                    "items": [
                        "En tránsito: HTTPS con HSTS",
                        "En reposo: cifrar campos sensibles",
                        "En uso: permisos mínimos y auditoría",
                        "Cabeceras: CSP, nosniff, frame options",
                        "Privacidad: no recojas lo que no necesitas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La privacidad es parte de la seguridad: si no guardas datos que no necesitas, no puedes filtrarlos. Aplica minimización de datos, plazos de retención y anonimización. Cada campo en tu BD es un pasivo de seguridad que mantienes para siempre."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "HTTPS, cifrado en reposo y mínimo acceso",
                        "CSP corta XSS y exfiltración",
                        "Menos datos guardados = menos riesgo",
                        "La privacidad se diseña, no se añade al final"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 199,
            "title": "Defensa en profundidad",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "api-como-contrato": {
        "id": 32,
        "module_id": 14,
        "title": "La API como contrato entre equipos",
        "slug": "api-como-contrato",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "La API como contrato entre equipos"
                },
                {
                    "type": "paragraph",
                    "text": "En una aplicación fullstack, la API es el contrato entre frontend y backend. Definir endpoints, esquemas de respuesta y códigos de error por adelantado evita fricción entre equipos."
                },
                {
                    "type": "paragraph",
                    "text": "Herramientas como OpenAPI documentan el contrato y permiten generar clientes tipados y mocks para desarrollar en paralelo."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "openapi: 3.0.0\ninfo:\n  title: API de Cursos\n  version: 1.0.0\npaths:\n  /api/cursos:\n    get:\n      summary: Lista los cursos publicados\n      responses:\n        \"200\":\n          description: Lista de cursos\n          content:\n            application/json:\n              schema:\n                type: object\n                properties:\n                  data:\n                    type: array"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué define un contrato de API"
                },
                {
                    "type": "list",
                    "items": [
                        "Endpoints y métodos disponibles",
                        "Formato de petición y respuesta",
                        "Códigos de error y su significado",
                        "Autenticación requerida"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando el contrato está documentado, frontend y backend avanzan en paralelo con mocks y clients generados, y las discrepancias se detectan en integración, no en producción."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La API es un contrato entre equipos",
                        "OpenAPI documenta endpoints y esquemas",
                        "Los mocks permiten desarrollar en paralelo",
                        "Un contrato claro reduce fricción y malentendidos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 14,
            "title": "La API como Contrato",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "consumiendo-la-api-desde-el-frontend": {
        "id": 508,
        "module_id": 14,
        "title": "Consumiendo la API desde el frontend",
        "slug": "consumiendo-la-api-desde-el-frontend",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Consumiendo la API desde el frontend"
                },
                {
                    "type": "paragraph",
                    "text": "El frontend consume la API con fetch o un cliente HTTP (axios, HttpClient de Angular). La clave es manejar estados: cargando, éxito, error y vacío."
                },
                {
                    "type": "paragraph",
                    "text": "Un servicio o hook centraliza las llamadas y expone estados tipados; los errores se muestran con mensajes útiles y las cargas con indicadores."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "async function cargarCursos() {\n    const estado = document.querySelector(\"#estado\");\n\n    try {\n        estado.textContent = \"Cargando...\";\n        const respuesta = await fetch(\"/api/cursos\");\n\n        if (!respuesta.ok) {\n            throw new Error(`Error ${respuesta.status}`);\n        }\n\n        const { data } = await respuesta.json();\n        renderizar(data);\n        estado.textContent = \"\";\n    } catch (error) {\n        estado.textContent = \"No se pudieron cargar los cursos\";\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de consumo"
                },
                {
                    "type": "list",
                    "items": [
                        "Centralizar llamadas en servicios o hooks",
                        "Gestionar cargando, éxito y error",
                        "Tipar las respuestas",
                        "Mostrar mensajes útiles al usuario"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un frontend robusto nunca asume que la API responde: la red falla, el servidor tarda y los datos cambian. Manejar esos estados es la diferencia entre una app frágil y una sólida."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "fetch o HttpClient consumen la API",
                        "Cada llamada tiene cargando, éxito y error",
                        "Centralizar evita duplicar lógica de red",
                        "Los errores se comunican al usuario"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 14,
            "title": "La API como Contrato",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "despliegue-continuo": {
        "id": 537,
        "module_id": 209,
        "title": "Deploy continuo con Actions",
        "slug": "despliegue-continuo",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Deploy continuo con Actions"
                },
                {
                    "type": "paragraph",
                    "text": "El despliegue continuo lleva la versión validada a un entorno. Con GitHub Actions puedes publicar una imagen Docker, sincronizar archivos a un servidor por SSH o desplegar a plataformas que exponen su propia acción (Vercel, Fly.io, AWS)."
                },
                {
                    "type": "paragraph",
                    "text": "El patrón seguro: construir y versionar en CI, validar contra staging, y solo en main o una release etiquetada disparar el deploy a producción. Los secretos del entorno (token del registro, claves SSH) viven en Settings, nunca en el YAML."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "name: Deploy\non:\n  push:\n    tags: [\"v*\"]\n\njobs:\n  build-and-push:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with:\n          registry: ghcr.io\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      - run: docker build -t ghcr.io/me/app:${{ github.ref_name }} .\n      - run: docker push ghcr.io/me/app:${{ github.ref_name }}\n\n  deploy:\n    needs: build-and-push\n    runs-on: ubuntu-latest\n    steps:\n      - uses: appleboy/ssh-action@v1\n        with:\n          host: ${{ secrets.HOST }}\n          username: deploy\n          key: ${{ secrets.SSH_KEY }}\n          script: |\n            docker pull ghcr.io/me/app:${{ github.ref_name }}\n            docker compose up -d"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Patrones de deploy"
                },
                {
                    "type": "list",
                    "items": [
                        "Etiquetas v1.2.3 como versión de release",
                        "Imagen inmutable por etiqueta para rollback",
                        "Staging valida antes de producción",
                        "Secretos de entorno cifrados en Settings",
                        "Rollback = redeploy de la etiqueta anterior"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un buen deploy es aburrido: la etiqueta sube, el servidor descarga y reinicia, el healthcheck confirma. Si algo falla, vuelves a la etiqueta anterior. La automatización reduce la ventana de error humano y da a cada release una ruta de vuelta clara."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Deploy solo desde un evento de confianza (main o tag)",
                        "Imágenes etiquetadas e inmutables",
                        "Secretos fuera del YAML, en Settings",
                        "Rollback a la etiqueta anterior"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 209,
            "title": "Calidad y despliegue",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "pseint-estructura-y-salida": {
        "id": 439,
        "module_id": 174,
        "title": "La estructura de un algoritmo y la salida",
        "slug": "pseint-estructura-y-salida",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Todo empieza con Algoritmo y termina con FinAlgoritmo"
                },
                {
                    "type": "paragraph",
                    "text": "En PSeInt, un programa es un bloque delimitado por las palabras clave Algoritmo y FinAlgoritmo, o por Proceso y FinProceso, que son equivalentes. Dentro viven las instrucciones, una por línea. Esa pausa entre paréntesis, el punto y coma, no se escribe: PSeInt ya entiende que cada línea es una instrucción completa."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo saludo\n    Escribir \"Hola, mundo!\"\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Escribir: mostrar resultados en pantalla"
                },
                {
                    "type": "paragraph",
                    "text": "La instrucción Escribir muestra valores en la salida. Admite varios valores separados por comas, y los concatena sin añadir nada entre ellos. Si necesitas espacios para separar, los escribes tú dentro de las cadenas. Es un detalle pequeño que cambia por completo cómo se ve el resultado."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo imprimir\n    Definir nombre Cadena\n    Definir edad Enter\n    Leer nombre\n    Leer edad\n    Escribir nombre, \" tiene \", edad, \" años\"\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comentarios: el código también se explica"
                },
                {
                    "type": "paragraph",
                    "text": "Un comentario es texto que la máquina ignora y que sirve para las personas. En PSeInt se abre con dos barras y se cierra al final de la línea; también existen los comentarios de bloque, entre barras y asterisco. Documenta la intención, no la mecánica: es más útil escribir por qué haces algo que repetir lo que ya se ve."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Algoritmo y FinAlgoritmo delimitan el programa; no se cierra con punto y coma",
                        "Escribir acepta varios valores separados por comas y los une sin separador",
                        "Los comentarios empiezan con // y no afectan a la ejecución"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 174,
            "title": "Primeros pasos con PSeInt",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "errores-y-debug-de-integracion": {
        "id": 509,
        "module_id": 14,
        "title": "Errores típicos y debugging de integración",
        "slug": "errores-y-debug-de-integracion",
        "type": "article",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Errores típicos y debugging de integración"
                },
                {
                    "type": "paragraph",
                    "text": "Los problemas de integración suelen repetir patrones: CORS bloqueado, formato de respuesta distinto al esperado, campos que cambian de nombre y errores 401/403 por tokens."
                },
                {
                    "type": "paragraph",
                    "text": "La pestaña Network de DevTools muestra cada petición, su estado y su cuerpo: es la primera parada ante cualquier fallo de integración."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Ver el estado real de una petición\ncurl -i http://localhost:8000/api/cursos\n\n# Revisar cabeceras CORS en la respuesta\ncurl -sI http://localhost:8000/api/cursos | grep -i access-control"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diagnóstico rápido"
                },
                {
                    "type": "list",
                    "items": [
                        "Network de DevTools: estado y cuerpo real",
                        "Comparar el JSON esperado con el recibido",
                        "Revisar cabeceras CORS si el navegador bloquea",
                        "Verificar el token en cada petición protegida"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando el navegador bloquea una petición por CORS, el backend debe permitir el origen: no es un problema del frontend. La consola del navegador lo dice con claridad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Network muestra peticiones, estados y cuerpos",
                        "CORS se configura en el backend",
                        "El JSON real debe compararse con el esperado",
                        "401/403 apuntan a autenticación o permisos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 14,
            "title": "La API como Contrato",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "cors-y-token-bearer": {
        "id": 33,
        "module_id": 200,
        "title": "CORS y tokens Bearer desde el frontend",
        "slug": "cors-y-token-bearer",
        "type": "article",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "CORS y tokens Bearer desde el frontend"
                },
                {
                    "type": "paragraph",
                    "text": "El navegador aplica CORS para proteger al usuario: el backend debe permitir el origen del frontend y los métodos y cabeceras usados."
                },
                {
                    "type": "paragraph",
                    "text": "En el frontend, el token se envía en cada petición mediante un interceptor HTTP y los errores 401 se manejan globalmente para redirigir a login. Este patrón es el corazón de las SPAs autenticadas."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// config/cors.php en Laravel\nreturn [\n    'paths' => ['api/*'],\n    'allowed_methods' => ['*'],\n    'allowed_origins' => [\n        env('FRONTEND_URL', 'http://localhost:4200'),\n    ],\n    'allowed_headers' => ['*'],\n    'supports_credentials' => true,\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo típico con token"
                },
                {
                    "type": "list",
                    "items": [
                        "Login: el usuario envia credenciales",
                        "El backend devuelve un token",
                        "El frontend lo guarda y lo adjunta en Authorization",
                        "Un 401 global redirige a login"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los interceptores centralizan la cabecera Authorization: una sola pieza de código añade el token a todas las peticiones y reacciona a los 401."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "CORS se configura en el backend",
                        "El token viaja en Authorization: Bearer",
                        "Los interceptores añaden el token a cada petición",
                        "El 401 global limpia sesión y redirige"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 200,
            "title": "CORS y Autenticación en el Cliente",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "gestion-de-sesion-en-el-cliente": {
        "id": 510,
        "module_id": 200,
        "title": "Gestión de sesión en el cliente",
        "slug": "gestion-de-sesion-en-el-cliente",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Gestión de sesión en el cliente"
                },
                {
                    "type": "paragraph",
                    "text": "El frontend decide dónde guardar el token: localStorage persiste entre pestañas, sessionStorage vive solo en la pestaña y las cookies httpOnly añaden protección extra contra XSS."
                },
                {
                    "type": "paragraph",
                    "text": "La elección cambia la seguridad: XSS puede leer localStorage, pero no una cookie httpOnly. Guardar el token en memoria o cookie httpOnly es la opción más segura en SPAs."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Guardar el token tras el login\nfunction guardarSesion(token, usuario) {\n    sessionStorage.setItem(\"token\", token);\n    sessionStorage.setItem(\"usuario\", JSON.stringify(usuario));\n}\n\n// Leer el token para adjuntarlo\nfunction obtenerToken() {\n    return sessionStorage.getItem(\"token\");\n}\n\n// Cerrar sesión limpiando todo\nfunction cerrarSesion() {\n    sessionStorage.clear();\n    window.location.href = \"/login\";\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Opciones de almacenamiento"
                },
                {
                    "type": "list",
                    "items": [
                        "localStorage: persiste entre pestañas y reinicios",
                        "sessionStorage: solo la pestaña actual",
                        "Cookie httpOnly: invisible para JavaScript",
                        "Memoria: se pierde al recargar, ideal para máxima seguridad"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La práctica más segura en SPAs: token en memoria + refresh token en cookie httpOnly. El equilibrio entre comodidad y seguridad depende de tu amenaza."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "localStorage es accesible desde XSS",
                        "sessionStorage limita la vida a la pestaña",
                        "Las cookies httpOnly no las lee JavaScript",
                        "Memoria = máxima seguridad, mínima persistencia"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 200,
            "title": "CORS y Autenticación en el Cliente",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "flujo-de-datos-completo": {
        "id": 511,
        "module_id": 200,
        "title": "Flujo de datos completo: del clic a la respuesta",
        "slug": "flujo-de-datos-completo",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo de datos completo: del clic a la respuesta"
                },
                {
                    "type": "paragraph",
                    "text": "Integrar todo: el usuario hace clic, el frontend construye la petición con el token, el backend valida y responde, y la UI refleja el resultado. Seguir el flujo paso a paso es la mejor forma de depurar."
                },
                {
                    "type": "paragraph",
                    "text": "Cada capa tiene su responsabilidad: la vista captura la acción, el servicio la traduce a HTTP, el backend valida y persiste, y la respuesta vuelve por el mismo camino."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// 1. El usuario hace clic en \"Guardar\"\nformulario.addEventListener(\"submit\", async (evento) => {\n    evento.preventDefault();\n\n    // 2. El servicio construye la petición con token\n    const respuesta = await api.post(\"/api/pedidos\", {\n        producto: selectProducto.value,\n        cantidad: Number(inputCantidad.value),\n    });\n\n    // 3. La UI refleja el resultado\n    if (respuesta.ok) {\n        mostrarExito(\"Pedido creado\");\n    } else {\n        mostrarError(respuesta.error);\n    }\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos de control del flujo"
                },
                {
                    "type": "list",
                    "items": [
                        "La petición lleva el token correcto",
                        "El body coincide con lo que espera la API",
                        "El backend valida y responde con el código justo",
                        "La UI maneja éxito y error"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando algo falla, recorre el flujo hacia atrás: ¿llegó la petición?, ¿qué respondió el backend?, ¿qué hizo la UI con esa respuesta? El eslabón roto aparece en uno de esos tres puntos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El clic se traduce en una petición HTTP",
                        "El token y el body deben ser correctos",
                        "El backend responde con estado y datos",
                        "La UI maneja ambos desenlaces"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 200,
            "title": "CORS y Autenticación en el Cliente",
            "course_id": 12,
            "course_slug": "integracion-frontend-backend",
            "course_title": "Integración Frontend ↔ Backend",
            "course": {
                "id": 12,
                "slug": "integracion-frontend-backend",
                "title": "Integración Frontend ↔ Backend"
            }
        }
    },
    "seguridad-y-buenas-practicas-cicd": {
        "id": 538,
        "module_id": 209,
        "title": "Seguridad y buenas prácticas en CI/CD",
        "slug": "seguridad-y-buenas-practicas-cicd",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Seguridad y buenas prácticas en CI/CD"
                },
                {
                    "type": "paragraph",
                    "text": "Un pipeline con acceso a producción es un objetivo de ataque: si un atacante modifica el YAML o un paso inseguro filtra secretos, tiene las llaves de tu sistema. La seguridad del pipeline merece el mismo cuidado que el código de la aplicación."
                },
                {
                    "type": "paragraph",
                    "text": "Regla de oro: los secretos solo van a los jobs que los necesitan, con permisos mínimos. OTA (principio de menor privilegio) aplica también al GITHUB_TOKEN: ajusta permissions por job y evita acciones de terceros sin las versiones etiquetadas."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "name: Seguro\non: pull_request\n\npermissions:\n  contents: read   # mínimo necesario\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm test\n        env:\n          # solo el secret que este job necesita\n          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de seguridad"
                },
                {
                    "type": "list",
                    "items": [
                        "GITHUB_TOKEN con permisos mínimos",
                        "Acciones de terceros con versión fija y revisada",
                        "Secretos por job, solo los imprescindibles",
                        "No imprimir secretos en logs ni artefactos",
                        "Dependabot para dependencias y acciones",
                        "Revisión humana en pull requests (no auto-merge)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Además, valida las entradas: en eventos pull_request desde forks, no ejecutes pasos con secretos de producción sin aprobación explícita (workflow_run o review). Automatizar es bueno; automatizar sin control, un riesgo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Permisos mínimos en GITHUB_TOKEN y acciones",
                        "Secretos solo donde se necesitan",
                        "Versiones de acciones fijas y auditadas",
                        "Dependabot y review humano cierran el circuito"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 209,
            "title": "Calidad y despliegue",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "emitiendo-y-verificando-jwt": {
        "id": 512,
        "module_id": 15,
        "title": "Emisión y verificación de JWT en Laravel",
        "slug": "emitiendo-y-verificando-jwt",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Emisión y verificación de JWT en Laravel"
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel emites un JWT tras validar credenciales y lo verificas con middleware en las rutas protegidas. La librería tymondesigns/jwt-auth y el middleware auth:jwt son las piezas habituales."
                },
                {
                    "type": "paragraph",
                    "text": "Las rutas protegidas exigen un token válido en Authorization: Bearer; si expira o es inválido, la API responde 401."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Emitir el token tras el login\npublic function login(Request $request)\n{\n    $credenciales = $request->validate([\n        'email' => 'required|email',\n        'password' => 'required',\n    ]);\n\n    if (! $token = auth('api')->attempt($credenciales)) {\n        return response()->json(['message' => 'Credenciales incorrectas'], 401);\n    }\n\n    return response()->json(['token' => $token]);\n}\n\n// Proteger rutas\nRoute::middleware('auth:jwt')->group(function () {\n    Route::get('/perfil', [PerfilController::class, 'show']);\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo de verificación"
                },
                {
                    "type": "list",
                    "items": [
                        "El cliente envía Authorization: Bearer token",
                        "El middleware valida firma y expiración",
                        "El usuario se resuelve desde el payload",
                        "Token inválido o expirado => 401"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La verificación es local: sin consultas a la BD, lo que hace el pipeline rápido y escalable. La revocación inmediata es la contrapartida de ese diseño."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El login emite el token tras validar credenciales",
                        "auth:jwt protege rutas",
                        "La verificación es local y rápida",
                        "401 cuando el token no es válido"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 15,
            "title": "Tokens y Sesiones",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "refresh-tokens": {
        "id": 513,
        "module_id": 15,
        "title": "Refresh tokens: renueva sesiones sin pedir el password",
        "slug": "refresh-tokens",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Refresh tokens: renueva sesiones sin pedir el password"
                },
                {
                    "type": "paragraph",
                    "text": "Un access token con expiración corta (15-30 min) reduce el riesgo si se filtra. El refresh token, de vida más larga y guardado en cookie httpOnly, permite renovar el access token sin volver a pedir credenciales."
                },
                {
                    "type": "paragraph",
                    "text": "El flujo: el access token expira, el cliente llama a /refresh con el refresh token, el backend valida y emite un access token nuevo. Si el refresh token se revoca, la sesión muere."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Endpoint de refresh\npublic function refresh(Request $request)\n{\n    $refreshToken = $request->cookie('refresh_token');\n\n    $nuevoAccess = Auth::guard('api')\n        ->setToken($refreshToken)\n        ->refresh();\n\n    return response()->json([\n        'token' => $nuevoAccess,\n    ]);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas con refresh tokens"
                },
                {
                    "type": "list",
                    "items": [
                        "Access token corto y en memoria",
                        "Refresh token largo y en cookie httpOnly",
                        "Revocar refresh tokens al cerrar sesión",
                        "El endpoint de refresh se protege contra reuso"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El balance: access corto limita el daño de una fuga; refresh largo mantiene la experiencia sin fricción. La rotación de refresh tokens (emitir uno nuevo en cada refresh) eleva la seguridad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Access corto: menos riesgo si se filtra",
                        "Refresh en cookie httpOnly: invisible para XSS",
                        "Cerrar sesión revoca el refresh",
                        "Rotar refresh tokens reduce el reuso"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 15,
            "title": "Tokens y Sesiones",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "login-registro-y-guards": {
        "id": 35,
        "module_id": 201,
        "title": "Flujo login/registro y guards de ruta",
        "slug": "login-registro-y-guards",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo login/registro y guards de ruta"
                },
                {
                    "type": "paragraph",
                    "text": "El flujo típico: el usuario se registra o inicia sesión, el backend devuelve token y datos del usuario, el frontend lo guarda (localStorage o SessionStorage) y los guards de ruta protegen las páginas privadas."
                },
                {
                    "type": "paragraph",
                    "text": "Al cerrar sesión se invalida el token en el backend y se limpia el estado local del navegador."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "// Guard de Angular: solo deja pasar si hay sesión\nexport const requiereLogin: CanActivateFn = () => {\n    const auth = inject(AuthService);\n\n    if (auth.estaAutenticado()) {\n        return true;\n    }\n\n    return inject(Router).createUrlTree([\"/login\"]);\n};\n\n// Configuración de la ruta protegida\n{\n    path: \"perfil\",\n    component: PerfilComponent,\n    canActivate: [requiereLogin],\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Elementos del flujo"
                },
                {
                    "type": "list",
                    "items": [
                        "Registro y login contra la API",
                        "Guardar token y datos de sesión",
                        "Guards que protegen rutas privadas",
                        "Logout que revoca y limpia"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los guards son experiencia de usuario; la autorización real vive en el backend. Cada endpoint protegido debe verificar el token por su cuenta."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Login devuelve token y datos",
                        "El token se persiste en el cliente",
                        "Los guards bloquean rutas privadas",
                        "Logout limpia local y revoca en backend"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 201,
            "title": "Protección en el Frontend",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "interceptores-y-estado-de-sesion": {
        "id": 514,
        "module_id": 201,
        "title": "Interceptores y estado de sesión",
        "slug": "interceptores-y-estado-de-sesion",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Interceptores y estado de sesión"
                },
                {
                    "type": "paragraph",
                    "text": "Los interceptores HTTP añaden el token automáticamente a cada petición y gestionan los 401 de forma global: limpian sesión y redirigen a login sin repetir lógica en cada llamada."
                },
                {
                    "type": "paragraph",
                    "text": "El estado de sesión vive en un servicio observado por toda la app: al cambiar, los guards, el navbar y las vistas reaccionan."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Injectable, inject, signal } from \"@angular/core\";\n\n@Injectable({ providedIn: \"root\" })\nexport class AuthService {\n    private usuario = signal<Usuario | null>(null);\n\n    estaAutenticado() {\n        return this.usuario() !== null;\n    }\n\n    setSesion(usuario: Usuario) {\n        this.usuario.set(usuario);\n    }\n\n    logout() {\n        this.usuario.set(null);\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ventajas de centralizar"
                },
                {
                    "type": "list",
                    "items": [
                        "El token se adjunta en un solo lugar",
                        "Los 401 se manejan globalmente",
                        "El estado de sesión es una única fuente de verdad",
                        "Las vistas reaccionan a los cambios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Centralizar la autenticación hace el código consistente: no hay llamadas que olviden el token ni vistas con estado de sesión desactualizado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El interceptor añade el token a todas las peticiones",
                        "Los 401 se tratan de forma global",
                        "El estado de sesión es una fuente de verdad",
                        "La UI reacciona a los cambios de sesión"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 201,
            "title": "Protección en el Frontend",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "protegiendo-tu-pila-completa": {
        "id": 515,
        "module_id": 201,
        "title": "Errores comunes al proteger la pila completa",
        "slug": "protegiendo-tu-pila-completa",
        "type": "article",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Errores comunes al proteger la pila completa"
                },
                {
                    "type": "paragraph",
                    "text": "Los patrones que más aparecen en integraciones JWT: token en localStorage expuesto a XSS, expiración mal configurada, CORS que no permite la cabecera Authorization y rutas frontend no protegidas que muestran pantallas sin datos."
                },
                {
                    "type": "paragraph",
                    "text": "También es frecuente olvidar la verificación en el backend: proteger solo la UI no protege los datos."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Comprobar que CORS permite la cabecera Authorization\ncurl -sI -X OPTIONS http://localhost:8000/api/usuarios \\\n  -H \"Origin: http://localhost:4200\" \\\n  -H \"Access-Control-Request-Headers: authorization\" \\\n  | grep -i access-control-allow"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Checklist de seguridad"
                },
                {
                    "type": "list",
                    "items": [
                        "Tokens nunca en URLs ni logs",
                        "HTTPS en todo el tráfico",
                        "Expiración corta del access token",
                        "Cada endpoint del backend verifica el token"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Recorre la lista al terminar la integración: muchas filtraciones reales empiezan por un token en localStorage y una consola abierta."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "localStorage expone tokens a XSS",
                        "CORS debe permitir Authorization",
                        "La UI protegida no basta: el backend verifica",
                        "HTTPS y expiración corta reducen el riesgo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 201,
            "title": "Protección en el Frontend",
            "course_id": 13,
            "course_slug": "autenticacion-jwt-web",
            "course_title": "Autenticación JWT de punta a punta",
            "course": {
                "id": 13,
                "slug": "autenticacion-jwt-web",
                "title": "Autenticación JWT de punta a punta"
            }
        }
    },
    "build-y-variables-de-produccion": {
        "id": 36,
        "module_id": 16,
        "title": "Build de producción y variables de entorno",
        "slug": "build-y-variables-de-produccion",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Build de producción y variables de entorno"
                },
                {
                    "type": "paragraph",
                    "text": "El build de producción minifica y optimiza los assets del frontend; las variables de entorno (URL de la API, claves públicas) se inyectan en tiempo de build o en el servidor."
                },
                {
                    "type": "paragraph",
                    "text": "Nunca hardcodees URLs de desarrollo: un mismo código debe desplegarse en staging o producción cambiando solo la configuración."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Frontend: build de producción\nnpm run build   # genera dist/\n\n# Backend Laravel: preparar producción\nphp artisan config:cache\nphp artisan route:cache\nphp artisan migrate --force"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de entorno"
                },
                {
                    "type": "list",
                    "items": [
                        "Un build por entorno (staging, producción)",
                        "Variables para URLs y claves públicas",
                        "Secretos inyectados por el proveedor",
                        "Configurar cachés después del deploy"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El artefacto de build debe ser reproducible: mismo código fuente, mismo resultado. Las variables de entorno se inyectan en el momento de construir o desplegar."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El build optimiza y minifica",
                        "Las URLs varían por entorno vía variables",
                        "Los secretos se inyectan, no se escriben",
                        "Cachés de config y rutas se regeneran en producción"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 16,
            "title": "Producción",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "estaticos-y-reverse-proxy": {
        "id": 37,
        "module_id": 16,
        "title": "Servir estáticos con un reverse proxy",
        "slug": "estaticos-y-reverse-proxy",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Servir estáticos con un reverse proxy"
                },
                {
                    "type": "paragraph",
                    "text": "En producción el frontend se sirve como estático (NGINX, Vercel, Netlify) y el backend queda detrás de un reverse proxy que gestiona TLS, compresión y balanceo."
                },
                {
                    "type": "paragraph",
                    "text": "El proxy redirige /api/* al backend y el resto de rutas a la SPA, permitiendo compartir dominio y evitar problemas de CORS."
                },
                {
                    "type": "code",
                    "language": "nginx",
                    "text": "server {\n    listen 80;\n    server_name app.example.com;\n\n    root /var/www/app/dist;\n\n    location /api/ {\n        proxy_pass http://127.0.0.1:8000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n\n    location / {\n        try_files $uri $uri/ /index.html;\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué aporta el reverse proxy"
                },
                {
                    "type": "list",
                    "items": [
                        "TLS y HTTP/2 en un solo dominio",
                        "Redirección /api al backend",
                        "Servir estáticos a máxima velocidad",
                        "Compresión y caché de assets"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Compartir dominio elimina la mayor parte de los problemas de CORS y simplifica cookies y certificados: una sola entrada para todo el sistema."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Estáticos primero, API detrás del proxy",
                        "/api/* se delega al backend",
                        "Un solo dominio: menos CORS y un solo TLS",
                        "try_files devuelve index.html en rutas SPA"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 16,
            "title": "Producción",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "monitoreo-post-deploy": {
        "id": 516,
        "module_id": 16,
        "title": "Monitoreo y rollback tras el despliegue",
        "slug": "monitoreo-post-deploy",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Monitoreo y rollback tras el despliegue"
                },
                {
                    "type": "paragraph",
                    "text": "Desplegar no es el final: hay que vigilar logs, errores y métricas. Un buen monitoreo detecta regresiones antes que los usuarios."
                },
                {
                    "type": "paragraph",
                    "text": "El rollback debe ser un procedimiento probado: si el nuevo release falla, se restaura el anterior en minutos, no en horas."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Vigilar logs del backend\ntail -f storage/logs/laravel.log\n\n# Verificar salud del servicio\ncurl -f http://localhost:8000/api/health\n\n# Rollback rápido con el release anterior\n./deploy.sh rollback"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué vigilar"
                },
                {
                    "type": "list",
                    "items": [
                        "Errores 5xx y excepciones",
                        "Latencia de peticiones",
                        "Uso de memoria y CPU",
                        "Estado de colas y workers"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Define un endpoint de salud que verifique BD y dependencias: los balanceadores lo usan y tú lo usas para confirmar que el deploy está sano."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Monitorear errores y latencia",
                        "Un health check verifica dependencias",
                        "El rollback se practica antes de necesitarlo",
                        "Vigilar tras el deploy detecta regresiones pronto"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 16,
            "title": "Producción",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "estrategias-blue-green-y-canary": {
        "id": 517,
        "module_id": 202,
        "title": "Estrategias: blue-green, canary y rolling",
        "slug": "estrategias-blue-green-y-canary",
        "type": "article",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estrategias: blue-green, canary y rolling"
                },
                {
                    "type": "paragraph",
                    "text": "Desplegar sin cortar el servicio es una disciplina con estrategias probadas. En blue-green mantienes dos entornos idénticos (azul y verde): despliegas la nueva versión en el inactivo, validas y cambias el trafico. El rollback es volver a cambiar el tráfico: instantáneo."
                },
                {
                    "type": "paragraph",
                    "text": "El canary envía un porcentaje pequeño del tráfico a la nueva versión (5 %, 25 %...) y lo aumenta si las métricas son buenas. El rolling reemplaza instancias de a poco en un cluster. Cuanto menor el riesgo aceptado, más lento el despliegue."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Blue-green en esencia\ndocker compose -f compose.blue.yml up -d   # versión nueva (inactiva)\ncurl -f https://stag.blue.internal/health  # validar\n# Cambiar el tráfico: balanceador -> blue\n# Rollback: balanceador -> green (segundos)\n\n# Canary en esencia\n# 5% del tráfico a canary, medir errores/latencia\n# 25% -> 100% si las métricas aguantan"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Elegir estrategia"
                },
                {
                    "type": "list",
                    "items": [
                        "Blue-green: rollback instantáneo, doble infraestructura",
                        "Canary: riesgo controlado con tráfico real",
                        "Rolling: sin duplicar infra, más exposición por etapas",
                        "Depende de: riesgo del cambio, infraestructura y equipo",
                        "Todas necesitan health checks fiables"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla que une las tres: nunca asumas que un deploy funcionó; verifica con health checks y métricas antes de ampliar el tráfico. La estrategia correcta depende del cambio: una migración de BD no se resuelve solo con blue-green."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Blue-green = rollback por cambio de tráfico",
                        "Canary = riesgo controlado por porcentajes",
                        "Rolling = reemplazo gradual de instancias",
                        "Health checks fiables antes de ampliar tráfico"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 202,
            "title": "Estrategias de despliegue",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "que-es-un-ide-vs-editor-de-codigo": {
        "id": 629,
        "module_id": 237,
        "title": "¿Qué es un IDE vs un Editor de Código? Principios y Arquitectura",
        "slug": "que-es-un-ide-vs-editor-de-codigo",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El Taller del Programador: Más Allá del Bloc de Notas"
                },
                {
                    "type": "paragraph",
                    "text": "Todo programa no es más que texto plano almacenado en archivos con extensiones específicas (.py, .js, .php, .cpp). En teoría, podrías programar en el Bloc de Notas de Windows o en TextEdit de Mac. Sin embargo, en la ingeniería de software moderna, la productividad y la calidad dependen críticamente de las herramientas que asisten al desarrollador en cada pulsación de tecla."
                },
                {
                    "type": "callout",
                    "tone": "info",
                    "title": "Principio Fundamental",
                    "text": "Un código fuente no es solo texto: es una estructura sintáctica rigurosa. Las herramientas modernas comprenden esa estructura y transforman la experiencia de programar mediante análisis estático en tiempo real."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "La Escala de Herramientas: De Editores Simples a IDEs Completos"
                },
                {
                    "type": "paragraph",
                    "text": "En la industria distinguimos tres grandes categorías de entornos para escribir código:"
                },
                {
                    "type": "list",
                    "items": [
                        "Editor de Texto Plano (Notepad, TextEdit): No analiza sintaxis, no compila, no detecta errores. Inadecuado para desarrollo profesional.",
                        "Editor de Código Modular (VS Code, Sublime Text): Ultraligero, altamente extensible mediante plugins. Ofrece resaltado sintáctico, autocompletado inteligente y terminal.",
                        "Entorno de Desarrollo Integrado o IDE (JetBrains IntelliJ, PyCharm, Visual Studio Enterprise): Una suite completa \"todo en uno\" que integra compilador, depurador de memoria, analizador de dependencias, base de datos y herramientas de testing nativas."
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Los Componentes Esenciales de un Entorno Moderno"
                },
                {
                    "type": "paragraph",
                    "text": "¿Qué hace que un editor sea \"inteligente\"? Los entornos modernos integran estos pilares arquitectónicos:"
                },
                {
                    "type": "list",
                    "items": [
                        "LSP (Language Server Protocol): Estándar creado por Microsoft que separa el editor visual del motor que analiza el lenguaje. Permite que el mismo motor de Python o TypeScript funcione en VS Code, Neovim o Emacs.",
                        "IntelliSense y Autocompletado: Sugerencias contextuales de métodos, variables y tipos mientras escribes.",
                        "Analizador de Sintaxis y AST (Abstract Syntax Tree): Convierte tu texto en un árbol jerárquico para marcar errores en rojo antes de que ejecutes el programa.",
                        "Motor de Depuración (Debugger): Permite pausar la ejecución en una línea (breakpoint), examinar variables vivas en la memoria RAM y avanzar paso a paso.",
                        "Control de Versiones Integrado: Detección instantánea de cambios en Git con visualización de diffs línea por línea."
                    ]
                },
                {
                    "type": "code",
                    "language": "json",
                    "text": "{\n  \"nombre_herramienta\": \"Visual Studio Code\",\n  \"tipo\": \"Editor de Código Extensible\",\n  \"arquitectura\": \"Electron + TypeScript + LSP\",\n  \"ventajas\": [\"Rápido\", \"Miles de extensiones\", \"Ecosistema masivo\", \"Gratuito\"]\n}"
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "configuracion-y-secretos-en-produccion": {
        "id": 518,
        "module_id": 202,
        "title": "Configuración y secretos en producción",
        "slug": "configuracion-y-secretos-en-produccion",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Configuración y secretos en producción"
                },
                {
                    "type": "paragraph",
                    "text": "Tu aplicación necesita configuración por entorno: BD, URLs, claves. El artefacto desplegado debe ser idéntico en todas partes; solo cambia la configuración. Por eso los secretos se inyectan en el despliegue, nunca se compilan dentro de la imagen ni se versionan."
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel, config/ agrupa la configuración y las variables de entorno alimentan cada entorno. En producción puedes inyectarlas por el orquestador (docker secret, Kubernetes secrets) o un gestor (AWS Secrets Manager, Vault) y cachear la configuración con config:cache."
                },
                {
                    "type": "code",
                    "language": "dockerfile",
                    "text": "# Dockerfile: sin secretos compilados\nFROM php:8.3-fpm-alpine AS runtime\nWORKDIR /app\nCOPY --from=build /app . \nRUN php artisan config:cache && php artisan route:cache\n\n# Ejecución: secrets por variables de entorno (docker secret / env)\n# docker run -e APP_KEY=... -e DB_PASSWORD=... mi-app"
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "# docker-compose.yml (producción)\nservices:\n  app:\n    image: ghcr.io/me/app:1.4.0\n    env_file:\n      - .env.production        # no versionado\n    secrets:\n      - db_password\nsecrets:\n  db_password:\n    file: ./secrets/db_password"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de configuración"
                },
                {
                    "type": "list",
                    "items": [
                        "Código idéntico; configuración por entorno",
                        "Secretos inyectados, nunca en la imagen",
                        ".env.production fuera del repositorio",
                        "config:cache y route:cache al desplegar",
                        "Rotación de secretos sin redeploy si es posible"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La configuración también se versiona como política: cada entorno tiene su .env correspondiente, y el despliegue falla rápido si falta una variable crítica (APP_KEY, DB_PASSWORD). Un checklist de variables evita el \"funciona en mi máquina\" más caro."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Artefacto idéntico + configuración externa",
                        "Secretos por inyección, no por compilación",
                        "Cachear config y rutas al desplegar",
                        "Fallar rápido si falta una variable crítica"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 202,
            "title": "Estrategias de despliegue",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "observabilidad-logs-y-alertas": {
        "id": 519,
        "module_id": 202,
        "title": "Observabilidad: logs, métricas y alertas",
        "slug": "observabilidad-logs-y-alertas",
        "type": "article",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Observabilidad: logs, métricas y alertas"
                },
                {
                    "type": "paragraph",
                    "text": "La observabilidad responde tres preguntas: qué pasó (logs), cuánto y a qué ritmo (métricas) y dónde tarda o falla (trazas). Un sistema observable se opera con datos; uno opaco se opera con oraciones y adivinanzas."
                },
                {
                    "type": "paragraph",
                    "text": "Los logs estructurados (JSON) se envían a un agregador (Loki, ELK); las métricas (latencia p95, tasa de errores, CPU) se pintan en dashboards y disparan alertas. En Laravel, los logs estructurados y la telemetría se integran en el pipeline con poco esfuerzo."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Support\\Facades\\Log;\n\n// Log estructurado: máquina legible, contexto rico\nLog::info('Inscripción creada', [\n    'curso_id' => $curso->id,\n    'metodo'   => $request->method(),\n    'duracion_ms' => $tiempoMs,\n]);\n\n// Alertas que valen la pena\n// - Tasa de 5xx > 1% en 5 minutos\n// - Latencia p95 > 3s\n// - Colas atascadas > 10 min"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué observar"
                },
                {
                    "type": "list",
                    "items": [
                        "Logs estructurados con contexto",
                        "Métricas: latencia, errores, saturación",
                        "Alertas sobre métricas, no sobre ruido",
                        "Resumen del deploy: qué cambió y cuándo",
                        "Traza de petición para correlacionar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla de las alertas: cada alerta debe tener dueño y acción. Una alerta que nadie lee o que suena siempre se ignora; entonces el sistema ya no está observado. Empieza con pocas alertas significativas y añade conforme el sistema evoluciona."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Logs: qué pasó; métricas: cuánto; trazas: dónde",
                        "Logs estructurados para máquinas y contexto",
                        "Alertas con dueño y acción",
                        "Pocas alertas buenas > muchas ignoradas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 202,
            "title": "Estrategias de despliegue",
            "course_id": 14,
            "course_slug": "despliegue-fullstack",
            "course_title": "Despliegue Full Stack",
            "course": {
                "id": 14,
                "slug": "despliegue-fullstack",
                "title": "Despliegue Full Stack"
            }
        }
    },
    "comandos-esenciales-linux": {
        "id": 38,
        "module_id": 17,
        "title": "Comandos esenciales de Linux",
        "slug": "comandos-esenciales-linux",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comandos esenciales de Linux"
                },
                {
                    "type": "paragraph",
                    "text": "La terminal es el taller del desarrollador y del administrador de sistemas. A diferencia de una interfaz gráfica, cada comando es una pieza pequeña y combinable: mover archivos, explorar directorios o inspeccionar procesos se convierte en texto repetible y documentable."
                },
                {
                    "type": "paragraph",
                    "text": "Empieza con la navegación: pwd muestra dónde estás, ls lista el contenido, cd cambia de directorio y touch o mkdir crean archivos o carpetas. Para ver contenido, cat imprime archivos pequeños y less permite paginar archivos grandes sin cargarlos completos."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Navegación y exploración\npwd                 # ruta del directorio actual\nls -la              # lista con permisos y archivos ocultos\ncd ~/proyecto       # cambia al directorio proyecto\nmkdir -p src/utils  # crea carpetas anidadas\ntouch README.md     # crea un archivo vacío\n\n# Contenido de archivos\ncat config.php      # imprime el archivo completo\nless error.log      # paginador: q para salir, / para buscar\nhead -20 access.log # primeras 20 líneas\ntail -f app.log     # sigue el final del log en vivo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comandos que se combinan"
                },
                {
                    "type": "list",
                    "items": [
                        "pwd, ls, cd para navegar",
                        "mkdir, touch, cp, mv, rm para gestionar archivos",
                        "cat, less, head, tail para leer contenido",
                        "grep filtra, wc cuenta y sort ordena"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La filosofía Unix dice que cada comando hace una cosa bien y se comunica con los demás por texto. Por eso grep, wc, sort y awk se encadenan con pipes (|) para resolver consultas complejas sobre logs o listados sin salir de la terminal."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La terminal es repetible y documentable",
                        "ls -la revela permisos y ocultos",
                        "less y tail -f son ideales para logs",
                        "Los pipes combinan comandos pequeños en soluciones potentes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 17,
            "title": "La terminal",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "permisos-y-procesos": {
        "id": 39,
        "module_id": 17,
        "title": "Permisos, usuarios y procesos",
        "slug": "permisos-y-procesos",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Permisos, usuarios y procesos"
                },
                {
                    "type": "paragraph",
                    "text": "Linux distingue usuarios y grupos, y la seguridad se apoya en permisos por archivo. Cada archivo tiene tres tríos: dueño (u), grupo (g) y otros (o), con lectura (r=4), escritura (w=2) y ejecución (x=1). El número es la suma: 755 significa dueño con todo y el resto solo lectura y ejecución."
                },
                {
                    "type": "paragraph",
                    "text": "Cambiar permisos se hace con chmod y el dueño o grupo con chown. Un ejecutable necesita el bit x; un servicio web, normalmente, debe leer sin escribir. Menos privilegios es siempre mejor: el principio de mínimo privilegio evita que un error de un proceso se convierta en un problema de todo el sistema."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Permisos\nchmod 755 deploy.sh     # rwxr-xr-x: dueño todo, resto lectura+ejec\nchmod 600 clave.pem     # rw-------: solo el dueño lee/escribe\nchown www-data:www app/ # cambia dueño y grupo\n\n# Procesos\nps aux                  # lista procesos con usuario y CPU\ntop                     # monitor en vivo (htop lo mejora)\nkill -9 1234            # mata el proceso 1234 a la fuerza\nsystemctl status nginx  # estado de un servicio"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dónde se aplican"
                },
                {
                    "type": "list",
                    "items": [
                        "pwd, ls, cd para navegar",
                        "mkdir, touch, cp, mv, rm para gestionar archivos",
                        "cat, less, head, tail para leer contenido",
                        "grep filtra, wc cuenta y sort ordena"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los procesos también tienen dueño y prioridad. ps aux muestra quién ejecuta cada proceso; si un servicio consume demasiada CPU, puedes encontrar el culpable y reiniciarlo o matarlo. systemctl integra el arranque con systemd, el gestor estándar de servicios de las distros modernas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Permisos rwx en tríos: dueño, grupo y otros",
                        "chmod con números (755, 600) es lo más preciso",
                        "Menos privilegios reduce el impacto de errores",
                        "ps, top y systemctl son tu panel de procesos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 17,
            "title": "La terminal",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "gestion-de-archivos-y-pipes": {
        "id": 522,
        "module_id": 17,
        "title": "Gestión de archivos, pipes y redirección",
        "slug": "gestion-de-archivos-y-pipes",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Gestión de archivos, pipes y redirección"
                },
                {
                    "type": "paragraph",
                    "text": "La terminal brilla al tratar archivos y flujos de texto. Mover, copiar, renombrar y buscar son operaciones de un solo comando, y la redirección con > y >> guarda la salida en archivos, mientras los pipes (|) conectan la salida de un comando con la entrada del siguiente."
                },
                {
                    "type": "paragraph",
                    "text": "Esta composición permite responder preguntas sobre los datos sin abrirlos: contar líneas de un log, filtrar errores, quedarse con las diez IPs más repetidas o montar un reporte con una sola línea. El secreto es pensar en flujos: texto entra, texto sale, texto se transforma."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Redirección\nls -la > salida.txt      # guarda la salida (sobrescribe)\necho \"nueva\" >> log.txt  # añade al final sin borrar\ncomando 2> errores.txt   # redirige solo stderr\n\n# Pipes en acción\ngrep \"ERROR\" app.log | wc -l          # cuántos errores hay\ncat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10\n# las 10 IPs más frecuentes en un log de acceso"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Combinaciones clásicas"
                },
                {
                    "type": "list",
                    "items": [
                        "grep filtra líneas por patrón",
                        "wc -l cuenta líneas",
                        "sort ordena y uniq -c agrupa contando",
                        "awk extrae columnas con $1, $2...",
                        "head y tail recortan el flujo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En una operación de despliegue típica, verás estas piezas encadenadas: verificar que el build existe, filtrar el log del servicio, contar los errores y guardar un resumen. Dominar el flujo de texto es lo que separa a quien usa la terminal de quien la sufre."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "> sobrescribe, >> añade y 2> captura errores",
                        "Los pipes encadenan comandos sin archivos intermedios",
                        "grep + sort + uniq + head resuelven análisis de logs",
                        "awk extrae columnas y wc cuenta líneas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 17,
            "title": "La terminal",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "arrays-y-listas-en-memoria": {
        "id": 520,
        "module_id": 203,
        "title": "Arreglos y listas en memoria",
        "slug": "arrays-y-listas-en-memoria",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Arreglos y representación en memoria contigua"
                },
                {
                    "type": "paragraph",
                    "text": "Un arreglo (o array) es una colección ordenada de elementos almacenados en posiciones contiguas de memoria. Cada elemento tiene asignado un número llamado índice (index), que por convención universal comienza en 0."
                },
                {
                    "type": "paragraph",
                    "text": "La gran ventaja de la indexación contigua es el acceso aleatorio O(1): la computadora calcula la dirección de memoria exacta multiplicando el índice por el tamaño de bytes del dato."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Declaración e inicialización de un array\n$lenguajes = [\"Python\", \"PHP\", \"JavaScript\", \"TypeScript\"];\n\n// Acceso directo por índice (base 0)\necho $lenguajes[0]; // Imprime: Python\necho $lenguajes[2]; // Imprime: JavaScript\n\n// Longitud del array\necho \"Total de tecnologías: \" . count($lenguajes);"
                },
                {
                    "type": "diagram",
                    "diagram_type": "memory",
                    "title": "🧠 Disposición en Celdas Contiguas de Memoria RAM",
                    "caption": "Fórmula de Indexación Instantánea: Dirección_Física = Base (0x1000) + (Índice * Tamaño). Gracias a este cálculo aritmético simple, el procesador accede a cualquier elemento en complejidad constante O(1) sin tener que recorrer los anteriores.",
                    "cells": [
                        {
                            "address": "0x1000",
                            "label": "$lenguajes[0]",
                            "type": "offset +0",
                            "value": "\"Python\"",
                            "color": "#0AE98A"
                        },
                        {
                            "address": "0x1004",
                            "label": "$lenguajes[1]",
                            "type": "offset +4",
                            "value": "\"PHP\"",
                            "color": "#00D9FF"
                        },
                        {
                            "address": "0x1008",
                            "label": "$lenguajes[2]",
                            "type": "offset +8",
                            "value": "\"JavaScript\"",
                            "color": "#A855F7"
                        },
                        {
                            "address": "0x100C",
                            "label": "$lenguajes[3]",
                            "type": "offset +12",
                            "value": "\"TypeScript\"",
                            "color": "#F59E0B"
                        }
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Array Contiguo vs Lista Enlazada (Linked List)",
                    "caption": "Los arrays priorizan lectura rápida por índice; las listas enlazadas facilitan inserciones intermedias a costa de mayor consumo en punteros y pérdida de localidad espacial.",
                    "leftLabel": "Array / Arreglo Contiguo",
                    "leftItems": [
                        "Acceso aleatorio por índice en O(1) tiempo constante",
                        "Excelente localidad de caché CPU (elementos vecinos juntos)",
                        "Inserción/Borrado al inicio o medio en O(n) por desplazamiento",
                        "Memoria fija o costo de realocación al crecer"
                    ],
                    "rightLabel": "Lista Enlazada (Linked List)",
                    "rightItems": [
                        "Acceso secuencial por recorrido O(n): sin índice directo",
                        "Nodos dispersos en la memoria Heap conectados por punteros 'next'",
                        "Inserción/Borrado O(1) conocido el nodo previo",
                        "Sobrecarga de memoria por punteros adicionales"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Operaciones comunes sobre arrays"
                },
                {
                    "type": "list",
                    "items": [
                        "Acceso directo por índice: tiempo constante O(1)",
                        "Búsqueda secuencial (Linear Search): recorre elemento por elemento en O(n)",
                        "Inserción al final: rápida y directa",
                        "Modificación de elementos: asignando un nuevo valor a $array[indice]"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los índices inician siempre en 0",
                        "Acceder fuera de los límites genera errores de tipo IndexOutOfBounds o Undefined index",
                        "Son la base para construir estructuras más complejas como pilas, colas y tablas hash"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 203,
            "title": "Estructuras de Datos: Arrays y Colecciones",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "recorrido-y-transformacion-de-arrays": {
        "id": 521,
        "module_id": 203,
        "title": "Recorrido y transformación de datos",
        "slug": "recorrido-y-transformacion-de-arrays",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Iteración y filtrado de datos"
                },
                {
                    "type": "paragraph",
                    "text": "En el desarrollo profesional rara vez trabajamos con datos aislados. Casi todas las aplicaciones procesan listas: listas de estudiantes, productos en un carrito, transacciones financieras o registros de bases de datos."
                },
                {
                    "type": "paragraph",
                    "text": "Para procesar estas listas combinamos bucles for / foreach con condicionales para filtrar o calcular acumulados."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n$calificaciones = [85, 92, 58, 74, 99, 45, 88];\n$aprobados = [];\n$sumaTotal = 0;\n\nforeach ($calificaciones as $nota) {\n    $sumaTotal += $nota;\n    if ($nota >= 60) {\n        $aprobados[] = $nota; // Agregar al nuevo array\n    }\n}\n\n$promedio = $sumaTotal / count($calificaciones);\necho \"Promedio general: \" . round($promedio, 2);\necho \"Aprobados: \" . count($aprobados);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas al manipular colecciones"
                },
                {
                    "type": "list",
                    "items": [
                        "Evita modificar el tamaño de un array mientras lo estás iterando",
                        "Usa nombres en plural para colecciones y en singular para el elemento actual: foreach ($usuarios as $usuario)",
                        "Prefiere generar nuevos arreglos limpios en vez de mutar destructivamente los datos originales"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 203,
            "title": "Estructuras de Datos: Arrays y Colecciones",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "pensamiento-computacional-y-descomposicion": {
        "id": 523,
        "module_id": 204,
        "title": "Pensamiento computacional y descomposición",
        "slug": "pensamiento-computacional-y-descomposicion",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Las cuatro fases del pensamiento computacional"
                },
                {
                    "type": "paragraph",
                    "text": "Aprender a programar no se trata de memorizar sintaxis, sino de aprender a resolver problemas de forma sistemática. La metodología estándar de la ingeniería consta de 4 fases:"
                },
                {
                    "type": "list",
                    "items": [
                        "1. Descomposición: dividir un problema gigante en subproblemas pequeños e independientes.",
                        "2. Reconocimiento de patrones: identificar qué partes del problema se parecen a otros problemas ya resueltos anteriormente.",
                        "3. Abstracción: filtrar los detalles irrelevantes y concentrarse únicamente en la información necesaria.",
                        "4. Diseño de algoritmos: escribir las instrucciones paso a paso (pseudocódigo) para llegar a la solución."
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ejemplo: Diseñar un sistema de validación de contraseñas"
                },
                {
                    "type": "paragraph",
                    "text": "En vez de intentar resolver todo con una expresión gigante e incomprensible, descomponemos las reglas en funciones atómicas:"
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nfunction tieneLongitudMinima(string $clave, int $min = 8): bool {\n    return strlen($clave) >= $min;\n}\n\nfunction tieneNumero(string $clave): bool {\n    return preg_match('/[0-9]/', $clave) === 1;\n}\n\nfunction tieneMayuscula(string $clave): bool {\n    return preg_match('/[A-Z]/', $clave) === 1;\n}\n\nfunction esContrasenaSegura(string $clave): bool {\n    return tieneLongitudMinima($clave) \n        && tieneNumero($clave) \n        && tieneMayuscula($clave);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Divide y vencerás: cada función debe tener una sola responsabilidad (Principio SRP)",
                        "El código limpio se explica por sí mismo a través del nombre de sus componentes",
                        "Siempre prueba los valores límite (cadenas vacías, números negativos, valores máximos)"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 204,
            "title": "Algoritmia y Resolución de Problemas",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "evaluacion-final-fundamentos": {
        "id": 524,
        "module_id": 204,
        "title": "Evaluación Integradora de Fundamentos",
        "slug": "evaluacion-final-fundamentos",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Evaluación final del curso"
                },
                {
                    "type": "paragraph",
                    "text": "Has llegado al final de Introducción a la Programación. Este cuestionario valida que comprendes los conceptos troncales de variables, control de flujo, funciones y estructuras de datos antes de avanzar a la ruta de Programación Orientada a Objetos o Desarrollo Web."
                },
                {
                    "type": "paragraph",
                    "text": "Tómate tu tiempo para analizar cada pregunta y las posibles trampas de tipos y orden de ejecución."
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 204,
            "title": "Algoritmia y Resolución de Problemas",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "poo-ejercicio-srp": {
        "id": 479,
        "module_id": 189,
        "title": "Ejercicio: separa responsabilidades",
        "slug": "poo-ejercicio-srp",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Refactoriza esta clase para que cada responsabilidad\n# quede en su propia clase, manteniendo el mismo resultado.\n# inventario() debe devolver la lista de productos\n# guardar() persiste cada producto\n# Las utilidades imprimen el reporte\n#\n# class Almacen:\n#     def __init__(self): self.productos = []\n\n",
        "solution": "class Almacen:\n    def __init__(self):\n        self.productos = []\n\n    def agregar(self, producto):\n        self.productos.append(producto)\n\n    def inventario(self):\n        return list(self.productos)\n\n    def guardar(self, persistencia):\n        for p in self.inventario():\n            persistencia(p)\n\nclass Reporte:\n    def __init__(self, productos):\n        self.productos = productos\n\n    def imprimir(self):\n        for p in self.productos:\n            print(p)",
        "test_cases": [
            [
                "str(len(Almacen().inventario()))",
                "0"
            ],
            [
                "Almacen().productos == []",
                "True"
            ]
        ],
        "hint": "Separa el almacenamiento, el listado y la presentacion.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 189,
            "title": "SRP — Responsabilidad Única",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "scripts-bash-y-automatizacion": {
        "id": 525,
        "module_id": 205,
        "title": "Scripts en Bash y automatización",
        "slug": "scripts-bash-y-automatizacion",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Scripts en Bash y automatización"
                },
                {
                    "type": "paragraph",
                    "text": "Un script Bash es una secuencia de comandos guardada en un archivo con shebang (#!/bin/bash) que se puede ejecutar una y otra vez. Automatizar tareas repetitivas —subir una release, limpiar temporales, hacer backup— reduce errores humanos y documenta el proceso."
                },
                {
                    "type": "paragraph",
                    "text": "Las variables guardan valores, los condicionales deciden y los bucles repiten. La clave es que el script falle rápido: set -e detiene la ejecución ante el primer error y set -u avisa si usas una variable sin definir."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "#!/bin/bash\nset -euo pipefail   # falla ante errores y variables vacías\n\nAPP=\"mi-api\"\nFECHA=$(date +%Y%m%d)\n\nif [ ! -d \"dist\" ]; then\n    echo \"El build no existe. Compilando...\"\n    npm run build\nfi\n\ntar -czf \"backup-$FECHA.tar.gz\" dist/\necho \"Backup completado: backup-$FECHA.tar.gz\"\n\nfor archivo in *.log; do\n    [ \"$archivo\" = \"*.log\" ] && continue\n    gzip \"$archivo\"\ndone"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de scripts"
                },
                {
                    "type": "list",
                    "items": [
                        "Empieza con #!/bin/bash y set -euo pipefail",
                        "Usa variables descriptivas y ${VAR} explícito",
                        "Comprueba condiciones antes de acciones destructivas",
                        "Muestra mensajes claros de progreso y error",
                        "Haz pruebas en un entorno seguro antes de producción"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La automatización no termina en el script: el cron del sistema (o systemd timers) lo ejecuta en horarios fijos, y los pipelines de CI/CD lo disparan en cada cambio. Un script bien hecho es la unidad mínima de infraestructura como código."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El shebang y los permisos de ejecución hacen correr un script",
                        "set -euo pipefail endurece el script",
                        "Condicionales y bucles permiten lógica real",
                        "cron o CI/CD ejecutan los scripts sin intervención"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 205,
            "title": "Automatización y red",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "redes-y-conectividad-linux": {
        "id": 526,
        "module_id": 205,
        "title": "Redes y conectividad en Linux",
        "slug": "redes-y-conectividad-linux",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Redes y conectividad en Linux"
                },
                {
                    "type": "paragraph",
                    "text": "Todo desarrollo termina en una red: tu máquina, un contenedor o un servidor se comunican por IP y puertos. Saber diagnosticar conectividad en Linux es imprescindible: si el frontend no llega al backend, la respuesta suele estar en ping, ss, curl o los logs del firewall."
                },
                {
                    "type": "paragraph",
                    "text": "La familia de herramientas incluye ip para configurar interfaces, ss para ver puertos en escucha, curl para probar HTTP y ping o traceroute para medir el camino de red. Los puertos 80 (HTTP) y 443 (HTTPS) son los estándar para servicios web."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Diagnóstico\nping -c 4 api.ejemplo.com   # ¿responde el host?\ncurl -I https://api.ejemplo.com  # cabeceras HTTP\nss -tlnp                   # puertos en escucha y procesos\nip addr                   # interfaces y direcciones IP\n\n# Firewall\nsudo ufw status\nsudo ufw allow 443/tcp    # permite HTTPS"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos que necesitas"
                },
                {
                    "type": "list",
                    "items": [
                        "IP: dirección de la máquina en la red",
                        "Puerto: puerta lógica de un servicio",
                        "DNS: traduce nombres a direcciones IP",
                        "Firewall: filtro de tráfico entrante y saliente",
                        "Proxy inverso: distribuye y protege servicios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un flujo típico de diagnóstico: curl -I contra el dominio para ver si responde, ss -tlnp en el servidor para confirmar que el servicio escucha, y ufw status para descartar que el firewall bloquee. Con esas tres piezas resuelves la mayoría de problemas de conectividad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "IP + puerto localizan un servicio en la red",
                        "curl -I prueba el servicio HTTP sin abrir navegador",
                        "ss -tlnp muestra qué proceso escucha en qué puerto",
                        "El firewall filtra y suele ser el culpable silencioso"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 205,
            "title": "Automatización y red",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "entorno-de-desarrollo-linux": {
        "id": 527,
        "module_id": 205,
        "title": "El terminal como entorno de desarrollo",
        "slug": "entorno-de-desarrollo-linux",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El terminal como entorno de desarrollo"
                },
                {
                    "type": "paragraph",
                    "text": "Tu productividad como desarrollador crece cuando el terminal es una extensión natural: un prompt informativo, aliases para lo repetitivo y un gestor de versiones para Node, PHP o Python convierten cada proyecto en algo reproducible en cualquier máquina."
                },
                {
                    "type": "paragraph",
                    "text": "Los dotfiles (archivos que empiezan por punto en tu home) guardan tu configuración: .bashrc o .zshrc cargan aliases, funciones y variables. Versionarlos en Git te permite reproducir tu entorno en minutos."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# .bashrc — aliases útiles\nalias ll='ls -lah'\nalias gs='git status'\nalias gc='git commit -m'\nalias art='php artisan'\n\n# Gestión de versiones\ncurl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash\nnvm install 22\nnvm use 22\n\n# Prompt informativo\nexport PS1='\\u@\\h:\\w\\n\\$ '"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué configura un buen entorno"
                },
                {
                    "type": "list",
                    "items": [
                        "Aliases para comandos repetitivos",
                        "Gestor de versiones por lenguaje (nvm, pyenv, phpenv)",
                        "Prompt con usuario, host y ruta",
                        "Dotfiles versionados en Git",
                        "Editores que se lanzan desde la terminal (code, vim, nano)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El objetivo no es abandonar tu editor, sino que el terminal sea el punto de entrada: abrir el proyecto, instalar dependencias, correr tests y desplegar sin cambiar de contexto. Cada minuto que ahorras en configuración es tiempo real de desarrollo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Aliases y funciones reducen fricción diaria",
                        "Los gestores de versiones evitan conflictos entre proyectos",
                        "Versionar dotfiles hace tu entorno reproducible",
                        "El terminal es la puerta de entrada a todo el flujo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 205,
            "title": "Automatización y red",
            "course_id": 15,
            "course_slug": "linux-y-linea-de-comandos",
            "course_title": "Linux y línea de comandos",
            "course": {
                "id": 15,
                "slug": "linux-y-linea-de-comandos",
                "title": "Linux y línea de comandos"
            }
        }
    },
    "dockerfile-y-compose": {
        "id": 41,
        "module_id": 18,
        "title": "Dockerfile y Docker Compose",
        "slug": "dockerfile-y-compose",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dockerfile y Docker Compose"
                },
                {
                    "type": "paragraph",
                    "text": "El Dockerfile describe cómo se construye la imagen paso a paso, y Docker Compose describe cómo se relacionan varios contenedores: la app, la base de datos, el caché. Un buen Dockerfile usa construcción por etapas (multi-stage) para que la imagen final solo contenga lo necesario."
                },
                {
                    "type": "paragraph",
                    "text": "Con Compose defines servicios, volúmenes y redes en un archivo YAML, y con un solo comando levantas todo el entorno. Ese archivo versionado es tu entorno de desarrollo reproducible para cualquier persona del equipo."
                },
                {
                    "type": "code",
                    "language": "dockerfile",
                    "text": "# Multi-stage: compila con todo y ejecuta con lo mínimo\nFROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:alpine\nCOPY --from=build /app/dist /usr/share/nginx/html\nEXPOSE 80"
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "# docker-compose.yml\nservices:\n  app:\n    build: .\n    ports:\n      - \"8080:80\"\n    depends_on:\n      - db\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n    volumes:\n      - pgdata:/var/lib/postgresql/data\nvolumes:\n  pgdata:"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de oro"
                },
                {
                    "type": "list",
                    "items": [
                        "Una imagen por servicio, sin procesos extra",
                        "Multi-stage para recortar el tamaño final",
                        "Pin versiones: node:22, no node:latest",
                        "No ejecutes como root dentro del contenedor",
                        "Compose define dependencias y volúmenes con claridad"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "docker compose up -d levanta todo; docker compose down apaga y limpia. Si cambias el Dockerfile, rebuild con docker compose build. El flujo completo se parece a trabajar con scripts, pero con garantías de reproducibilidad mucho mayores."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El Dockerfile construye la imagen; Compose orquesta servicios",
                        "Multi-stage deja fuera herramientas de compilación",
                        "Los volúmenes dan persistencia a la base de datos",
                        "Versiona el Compose: es tu entorno reproducible"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 18,
            "title": "Contenedores",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "imagenes-y-registries": {
        "id": 528,
        "module_id": 18,
        "title": "Imágenes, capas y registries",
        "slug": "imagenes-y-registries",
        "type": "article",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Imágenes, capas y registries"
                },
                {
                    "type": "paragraph",
                    "text": "Una imagen Docker se compone de capas: cada instrucción del Dockerfile (COPY, RUN, ...) añade una capa de solo lectura. Docker reutiliza capas sin cambios, por eso ordenar las instrucciones de menos a más cambiantes acelera los builds: copia primero package.json, haz npm ci y solo después copia el código fuente."
                },
                {
                    "type": "paragraph",
                    "text": "Las imágenes se distribuyen desde registries. Docker Hub es el público más usado y GHCR (GitHub Container Registry) integra imágenes con tus repositorios. No uses imágenes sin pinear: una versión concreta es reproducible; latest no lo es."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Inspeccionar imágenes\ndocker history php:8.3-cli      # capas de la imagen\ndocker image inspect node:22     # metadatos detallados\n\n# Publicar en un registry\ndocker tag mi-app ghcr.io/usuario/mi-app:1.0.0\ndocker push ghcr.io/usuario/mi-app:1.0.0\ndocker pull ghcr.io/usuario/mi-app:1.0.0"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Decisiones de imagen"
                },
                {
                    "type": "list",
                    "items": [
                        "Base ligera: alpine u otras variantes slim",
                        "Versión pinchada en vez de latest",
                        "Etiquetas semánticas: 1.0.0, no solo latest",
                        "Registro privado para código interno",
                        "Escaneo de vulnerabilidades (docker scout)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cada capa se cachea y se comparte entre imágenes, lo que ahorra espacio y ancho de banda. Entender capas explica por qué un cambio de una línea en el código de tu app solo reconstruye las últimas capas, mientras cambia la base... y todo se reconstruye."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cada instrucción crea una capa reutilizable",
                        "Ordena el Dockerfile: dependencias antes que código",
                        "Pin versiones y usa registries confiables",
                        "Escanea vulnerabilidades antes de publicar"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 18,
            "title": "Contenedores",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "event-loop-y-concurrencia-js": {
        "id": 529,
        "module_id": 206,
        "title": "El Event Loop y el modelo de concurrencia",
        "slug": "event-loop-y-concurrencia-js",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El modelo de concurrencia de JavaScript (MDN)"
                },
                {
                    "type": "paragraph",
                    "text": "JavaScript tiene un modelo de ejecución basado en un Event Loop de hilo único (single-threaded). Esto significa que ejecuta una sola instrucción a la vez en el Call Stack (pila de llamadas). Sin embargo, puede realizar tareas pesadas en segundo plano (como peticiones de red o temporizadores) delegándolas a las Web APIs del navegador."
                },
                {
                    "type": "paragraph",
                    "text": "Cuando una tarea asíncrona termina, su callback se coloca en la Task Queue o Microtask Queue. El Event Loop monitorea constantemente el Call Stack: tan pronto como queda vacío, transfiere la siguiente tarea en espera."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "console.log(\"1. Inicio sincronico\");\n\nsetTimeout(() => {\n    console.log(\"3. Tarea asincrona en Task Queue\");\n}, 0);\n\nPromise.resolve().then(() => {\n    console.log(\"2. Microtarea de Promesa (prioridad)\");\n});\n\nconsole.log(\"1. Fin sincronico\");\n// Salida: 1. Inicio sincronico -> 1. Fin sincronico -> 2. Microtarea -> 3. Tarea asincrona"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Call Stack vs. Task Queue"
                },
                {
                    "type": "list",
                    "items": [
                        "Call Stack: Ejecuta el código sincrónico en orden LIFO (Last In, First Out)",
                        "Web APIs: Temporizadores (setTimeout), DOM events y peticiones de red manejadas por el navegador",
                        "Microtasks (Promesas): Tienen prioridad absoluta sobre la cola de tareas estándar"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 206,
            "title": "JavaScript Asíncrono, Promesas y Fetch API",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "promesas-async-await-y-fetch": {
        "id": 530,
        "module_id": 206,
        "title": "Promesas, Async/Await y la Fetch API",
        "slug": "promesas-async-await-y-fetch",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "De Callbacks a Async/Await moderno (MDN Web Docs)"
                },
                {
                    "type": "paragraph",
                    "text": "Una Promise es un objeto que representa la terminación o el fracaso eventual de una operación asíncrona. Tiene tres estados posibles: Pending (pendiente), Fulfilled (resuelta con éxito) o Rejected (rechazada con error)."
                },
                {
                    "type": "paragraph",
                    "text": "La sintaxis async/await es azúcar sintáctica moderna sobre las promesas, permitiendo escribir código asíncrono que se lee secuencialmente como código sincrónico."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Funcion asincrona moderna para consultar una API\nasync function obtenerUsuarios() {\n    try {\n        const respuesta = await fetch(\"https://api.ejemplo.com/usuarios\");\n        \n        // Importante segun MDN: fetch NO rechaza en errores HTTP 404 o 500\n        if (!respuesta.ok) {\n            throw new Error(`Error HTTP: ${respuesta.status}`);\n        }\n\n        const datos = await respuesta.json();\n        console.log(\"Usuarios cargados:\", datos);\n        return datos;\n    } catch (error) {\n        console.error(\"Fallo al conectar con el servidor:\", error.message);\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Regla de oro de Fetch segun MDN"
                },
                {
                    "type": "list",
                    "items": [
                        "fetch() solo rechaza una promesa si hay un fallo de red o la petición no pudo completarse",
                        "Las respuestas HTTP 404 Not Found o 500 Server Error resuelven la promesa normalmente",
                        "Siempre debes verificar if (!response.ok) antes de parsear con .json()"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 206,
            "title": "JavaScript Asíncrono, Promesas y Fetch API",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "que-es-una-variable": {
        "id": 1,
        "module_id": 1,
        "title": "¿Qué es una variable?",
        "slug": "que-es-una-variable",
        "type": "article",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es una variable?"
                },
                {
                    "type": "paragraph",
                    "text": "Una variable es un espacio en la memoria del ordenador que tiene un nombre y guarda un valor que puede cambiar durante la ejecución del programa. Piensa en ella como una caja etiquetada: la etiqueta es el nombre y el contenido es el dato."
                },
                {
                    "type": "paragraph",
                    "text": "Al crear una variable estás reservando memoria para guardar información. La ventaja de usar variables es que puedes reutilizar ese dato muchas veces sin repetirlo y puedes modificarlo cuando el programa lo necesite."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Declarar y asignar una variable\n$nombre = \"Ada\";\n$edad = 36;\n\n// Usar la variable más tarde\necho \"Hola, \" . $nombre;\necho \"Tienes \" . $edad . \" años.\";"
                },
                {
                    "type": "diagram",
                    "diagram_type": "memory",
                    "title": "🧠 Asignación de Variables en Memoria RAM",
                    "caption": "La memoria RAM funciona como una cuadrícula de casilleros contiguos numerados en hexadecimal (direcciones físicas). El identificador ($nombre) es el puntero simbólico que asocia tu código con el casillero físico donde se alojan los bytes de información.",
                    "cells": [
                        {
                            "address": "0x7FFE0410",
                            "label": "$nombre",
                            "type": "string [4B]",
                            "value": "\"Ada\"",
                            "color": "#0AE98A"
                        },
                        {
                            "address": "0x7FFE0414",
                            "label": "$edad",
                            "type": "int [4B]",
                            "value": "36",
                            "color": "#00D9FF"
                        },
                        {
                            "address": "0x7FFE0418",
                            "label": "$esEstudiante",
                            "type": "bool [1B]",
                            "value": "true",
                            "color": "#A855F7"
                        },
                        {
                            "address": "0x7FFE041C",
                            "label": "$promedio",
                            "type": "float [8B]",
                            "value": "9.85",
                            "color": "#F59E0B"
                        }
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Variable vs Constante: Mutabilidad y Propósito",
                    "caption": "Escoger adecuadamente entre mutabilidad e inmutabilidad reduce drásticamente los efectos secundarios en la ejecución del software.",
                    "leftLabel": "Variable ($variable / let)",
                    "leftItems": [
                        "Valor dinámico: puede reasignarse en cualquier punto del ciclo de vida",
                        "Ideal para acumuladores, contadores, banderas y estado de la aplicación",
                        "Ocupa un casillero cuyo contenido se sobreescribe durante el runtime",
                        "Mayor flexibilidad para algoritmos iterativos"
                    ],
                    "rightLabel": "Constante (const / define)",
                    "rightItems": [
                        "Valor inmutable: se fija en tiempo de inicialización y queda sellado",
                        "Ideal para URLs de API, configuraciones maestras, factores matemáticos (PI)",
                        "Previene bugs graves provocados por mutaciones accidentales en el flujo",
                        "Permite al compilador optimizar referencias directamente en memoria"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas para nombrar variables"
                },
                {
                    "type": "paragraph",
                    "text": "Los nombres de variables deben ser descriptivos para que el código se lea como una frase. Un buen nombre explica qué contiene la variable sin necesidad de comentarios."
                },
                {
                    "type": "list",
                    "items": [
                        "Usa nombres descriptivos: $totalCarrito en vez de $x",
                        "Mantén un estilo consistente: camelCase o snake_case",
                        "Evita palabras reservadas del lenguaje",
                        "No uses nombres demasiado cortos ni ambiguos"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Una variable tiene nombre, tipo y valor",
                        "Se puede reasignar su valor durante la ejecución",
                        "Los nombres descriptivos mejoran la legibilidad",
                        "Cada lenguaje tiene su propia sintaxis para declararlas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Saber declarar y usar variables es el primer paso para escribir cualquier programa. En la siguiente lección verás qué tipos de datos puedes guardar en ellas."
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 1,
            "title": "Variables y Tipos de Datos",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "tipos-de-datos-basicos": {
        "id": 2,
        "module_id": 1,
        "title": "Tipos de datos básicos",
        "slug": "tipos-de-datos-basicos",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de datos básicos"
                },
                {
                    "type": "paragraph",
                    "text": "Los tipos de datos dicen qué clase de información guarda una variable y qué operaciones se pueden hacer con ella. Los más comunes son enteros, decimales, texto y booleanos."
                },
                {
                    "type": "paragraph",
                    "text": "Elegir el tipo correcto evita errores sutiles: sumar números no es lo mismo que concatenar texto, y comparar valores de tipos distintos suele dar resultados inesperados."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n$entero = 42;          // int\n$precio = 19.99;       // float\n$nombre = \"Ada\";       // string\n$activo = true;        // bool\n\nvar_dump($entero, $precio, $nombre, $activo);"
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Tipos Primitivos (Escalares) vs Tipos Compuestos",
                    "caption": "Los primitivos almacenan directamente el valor numérico o literal en la pila (Stack); los tipos compuestos almacenan una referencia a una estructura dinámica alojada en la memoria Heap.",
                    "leftLabel": "Tipos Primitivos / Escalares",
                    "leftItems": [
                        "Enteros (int): 4 o 8 bytes de representación binaria con signo",
                        "Decimales (float/double): IEEE 754 con mantisa y exponente",
                        "Booleanos (bool): 1 byte (0 para false, 1 para true)",
                        "Caracteres y Strings cortos: secuencias inmutables de bytes",
                        "Paso por valor por defecto en la mayoría de lenguajes"
                    ],
                    "rightLabel": "Tipos Compuestos / Referenciales",
                    "rightItems": [
                        "Arrays / Listas: secuencias de múltiples valores indexados",
                        "Objetos / Clases: entidades con estado (atributos) y comportamiento",
                        "Mapas / Diccionarios: asociaciones clave-valor tipo hash",
                        "Punteros / Referencias: guardan la dirección de memoria de otro dato",
                        "Paso por referencia o puntero con recolección de basura (GC)"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos más usados"
                },
                {
                    "type": "list",
                    "items": [
                        "int: números enteros, como 42 o -7",
                        "float: números decimales, como 3.14",
                        "string: cadenas de texto, como \"hola\"",
                        "bool: verdadero o falso (true / false)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Muchos lenguajes son de tipado fuerte y detectan errores al mezclar tipos; otros convierten automáticamente. Conocer el sistema de tipos de tu lenguaje te ahorra depuraciones largas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El tipo define qué valores y operaciones son válidos",
                        "Texto y números se comportan de forma distinta",
                        "Los booleanos representan condiciones verdaderas o falsas",
                        "Cada lenguaje implementa los tipos con sus propias reglas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 1,
            "title": "Variables y Tipos de Datos",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "operadores-y-expresiones": {
        "id": 418,
        "module_id": 1,
        "title": "Operadores y expresiones",
        "slug": "operadores-y-expresiones",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Operadores y expresiones"
                },
                {
                    "type": "paragraph",
                    "text": "Los operadores son símbolos que combinan valores para producir resultados nuevos. Una expresión es cualquier combinación de valores y operadores que se puede evaluar."
                },
                {
                    "type": "paragraph",
                    "text": "Existen operadores aritméticos para calcular, de comparación para decidir y lógicos para combinar condiciones. Dominarlos te permite expresar cualquier regla de negocio."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n$a = 10;\n$b = 3;\n\necho $a + $b;    // 13 suma\necho $a % $b;    // 1 módulo (resto)\necho $a > $b;    // true comparación\necho ($a > 5) && ($b < 5); // true lógico"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Familias de operadores"
                },
                {
                    "type": "list",
                    "items": [
                        "Aritméticos: +, -, *, /, %",
                        "Comparación: ==, !=, <, >, <=, >=",
                        "Lógicos: && (y), || (o), ! (no)",
                        "Asignación: =, +=, -="
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El orden de evaluación importa: primero se resuelven paréntesis, luego multiplicaciones y divisiones, después sumas y restas. Usa paréntesis para que la intención sea explícita."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Una expresión siempre produce un valor",
                        "Los operadores lógicos combinan condiciones",
                        "El orden de precedencia determina el resultado",
                        "Los paréntesis hacen explícita la prioridad"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 1,
            "title": "Variables y Tipos de Datos",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "condicionales-if-else": {
        "id": 3,
        "module_id": 2,
        "title": "Condicionales: if, else, elif",
        "slug": "condicionales-if-else",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Condicionales: if, else, elif"
                },
                {
                    "type": "paragraph",
                    "text": "Los condicionales permiten que el programa tome decisiones: ejecuta un bloque de código solo cuando se cumple una condición. Son el mecanismo básico para expresar reglas en código."
                },
                {
                    "type": "paragraph",
                    "text": "La condición se evalúa como verdadera o falsa; si es verdadera se ejecuta el bloque del if, si no, el del else cuando existe. Los else if encadenan varias alternativas."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n$edad = 17;\n\nif ($edad >= 18) {\n    echo \"Eres mayor de edad\";\n} elseif ($edad >= 13) {\n    echo \"Eres adolescente\";\n} else {\n    echo \"Eres niño\";\n}"
                },
                {
                    "type": "diagram",
                    "diagram_type": "svg",
                    "title": "📐 Diagrama de Flujo: Bifurcación Condicional if-elseif-else",
                    "caption": "El flujo de ejecución llega a un rombo de decisión. Si la condición booleana es verdadera, toma la rama TRUE y salta directo al fin, ignorando todas las ramas restantes.",
                    "svg_content": "<svg viewBox=\"0 0 680 290\" xmlns=\"http://www.w3.org/2000/svg\" style=\"font-family: system-ui, sans-serif;\"><defs><marker id=\"arrCyan\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#00D9FF\"/></marker><marker id=\"arrGreen\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#0AE98A\"/></marker><marker id=\"arrRed\" viewBox=\"0 0 10 10\" refX=\"6\" refY=\"5\" markerWidth=\"6\" markerHeight=\"6\" orient=\"auto-start-reverse\"><path d=\"M 0 1 L 8 5 L 0 9 z\" fill=\"#EF4444\"/></marker></defs><rect x=\"20\" y=\"120\" width=\"100\" height=\"40\" rx=\"20\" fill=\"#1E2235\" stroke=\"#00D9FF\" stroke-width=\"1.8\"/><text x=\"70\" y=\"145\" fill=\"#F8FAFC\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\">Leer $edad</text><line x1=\"120\" y1=\"140\" x2=\"175\" y2=\"140\" stroke=\"#00D9FF\" stroke-width=\"2\" marker-end=\"url(#arrCyan)\"/><polygon points=\"245,100 315,140 245,180 175,140\" fill=\"#161926\" stroke=\"#F59E0B\" stroke-width=\"2\"/><text x=\"245\" y=\"136\" fill=\"#F8FAFC\" font-size=\"11\" font-weight=\"bold\" text-anchor=\"middle\">¿edad &gt;= 18?</text><text x=\"245\" y=\"152\" fill=\"#94A3B8\" font-size=\"9\" text-anchor=\"middle\">Condición if</text><path d=\"M 245 100 L 245 50 L 375 50\" fill=\"none\" stroke=\"#0AE98A\" stroke-width=\"2\" marker-end=\"url(#arrGreen)\"/><rect x=\"255\" y=\"65\" width=\"42\" height=\"16\" rx=\"4\" fill=\"#0AE98A\" fill-opacity=\"0.2\"/><text x=\"276\" y=\"77\" fill=\"#0AE98A\" font-size=\"10\" font-weight=\"bold\" text-anchor=\"middle\">SÍ (True)</text><rect x=\"380\" y=\"30\" width=\"145\" height=\"40\" rx=\"8\" fill=\"#161926\" stroke=\"#0AE98A\" stroke-width=\"1.5\"/><text x=\"452\" y=\"55\" fill=\"#0AE98A\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\">\"Mayor de edad\"</text><path d=\"M 245 180 L 245 230 L 375 230\" fill=\"none\" stroke=\"#EF4444\" stroke-width=\"2\" marker-end=\"url(#arrRed)\"/><rect x=\"255\" y=\"195\" width=\"44\" height=\"16\" rx=\"4\" fill=\"#EF4444\" fill-opacity=\"0.2\"/><text x=\"277\" y=\"207\" fill=\"#EF4444\" font-size=\"10\" font-weight=\"bold\" text-anchor=\"middle\">NO (False)</text><rect x=\"380\" y=\"210\" width=\"145\" height=\"40\" rx=\"8\" fill=\"#161926\" stroke=\"#EF4444\" stroke-width=\"1.5\"/><text x=\"452\" y=\"235\" fill=\"#EF4444\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\">\"Menor de edad\"</text><path d=\"M 525 50 L 590 50 L 590 120\" fill=\"none\" stroke=\"#64748B\" stroke-width=\"2\"/><path d=\"M 525 230 L 590 230 L 590 160\" fill=\"none\" stroke=\"#64748B\" stroke-width=\"2\"/><rect x=\"550\" y=\"120\" width=\"80\" height=\"40\" rx=\"20\" fill=\"#1E2235\" stroke=\"#00D9FF\" stroke-width=\"1.8\"/><text x=\"590\" y=\"145\" fill=\"#F8FAFC\" font-size=\"12\" font-weight=\"bold\" text-anchor=\"middle\">Fin if/else</text></svg>"
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Las 3 Fases del Mecanismo de Salto Condicional",
                    "caption": "A nivel de procesador, el if se traduce en una instrucción CMP (comparar) seguida de un salto condicional (JMP / BNE).",
                    "steps": [
                        {
                            "step": 1,
                            "label": "1. Evaluación Booleana",
                            "desc": "El procesador evalúa la expresión relacional ($edad >= 18) y activa las banderas de estado (Zero Flag)",
                            "icon": "⚖️",
                            "codeSnippet": "17 >= 18 -> false"
                        },
                        {
                            "step": 2,
                            "label": "2. Salto Exclusivo de Rama",
                            "desc": "Al ser falso, el program counter salta la etiqueta del bloque if e ingresa al bloque alternativo",
                            "icon": "🔀",
                            "tone": "accent",
                            "codeSnippet": "goto etiqueta_else"
                        },
                        {
                            "step": 3,
                            "label": "3. Convergencia Inmediata",
                            "desc": "Tras ejecutar el bloque seleccionado, el programa salta más allá de todas las demás alternativas",
                            "icon": "🎯",
                            "tone": "primary",
                            "codeSnippet": "continúa ejecución lineal"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Consejos para condicionales limpios"
                },
                {
                    "type": "list",
                    "items": [
                        "Ordena las condiciones de la más específica a la más general",
                        "Evita condiciones anidadas muy profundas: extrae funciones",
                        "Considera return temprano para salir antes de anidar",
                        "Usa nombres de variables que hagan la condición legible"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un error común es confundir asignación con comparación. En muchos lenguajes una sola igualdad asigna y una doble compara, así que revisa siempre el símbolo usado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "if ejecuta un bloque cuando la condición es verdadera",
                        "else cubre el caso contrario",
                        "elseif permite múltiples alternativas",
                        "La legibilidad de las condiciones importa tanto como su lógica"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 2,
            "title": "Flujo y Funciones",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "dominio-de-visual-studio-code-atajos-y-productividad": {
        "id": 630,
        "module_id": 237,
        "title": "Dominio de Visual Studio Code: Anatomía, Atajos Esenciales y Productividad Pro",
        "slug": "dominio-de-visual-studio-code-atajos-y-productividad",
        "type": "article",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El Editor Más Popular del Mundo: Visual Studio Code"
                },
                {
                    "type": "paragraph",
                    "text": "Creado por Microsoft y de código abierto (en su núcleo Code - OSS), VS Code se convirtió en el estándar indiscutible de la industria con más del 70% de cuota de mercado entre desarrolladores de todo el planeta. Su éxito radica en su equilibrio: se siente tan rápido como un editor de texto, pero cuenta con la potencia de un IDE."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Anatomía Visual de la Interfaz"
                },
                {
                    "type": "list",
                    "items": [
                        "Activity Bar (Barra de Actividad Izquierda): Accesos rápidos al Explorador de Archivos, Búsqueda Global, Git (Control de Código Fuente), Depurador y Tienda de Extensiones.",
                        "Side Bar (Barra Lateral): Muestra el árbol de carpetas de tu proyecto actual.",
                        "Editor Groups (Área de Edición): Permite dividir pantallas en 2, 3 o 4 columnas o filas para comparar código simultáneamente.",
                        "Panel Inferior (Terminal / Problemas / Output / Consola de Depuración): El centro neurálgico de ejecución.",
                        "Status Bar (Barra de Estado Inferior): Muestra la rama de Git actual, errores de sintaxis, codificación UTF-8 e indentación (espacios o tabs)."
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Los Atajos de Teclado que Separan a Principiantes de Expertos"
                },
                {
                    "type": "paragraph",
                    "text": "La velocidad de un desarrollador no se mide en palabras por minuto, sino en cuánto tiempo pasa con las manos en el teclado sin tocar el mouse. Grábate estos atajos en la memoria muscular:"
                },
                {
                    "type": "list",
                    "items": [
                        "Ctrl + Shift + P (Cmd+Shift+P en Mac): La Paleta de Comandos. Es el corazón de VS Code. Cualquier acción, configuración o comando se busca y ejecuta desde aquí.",
                        "Ctrl + P (Cmd+P): Quick Open. Permite saltar a cualquier archivo del proyecto escribiendo parte de su nombre en milisegundos.",
                        "Alt + Click: Multi-cursor manual. Escribe en varias líneas a la vez.",
                        "Ctrl + D (Cmd+D): Seleccionar la siguiente ocurrencia de la palabra seleccionada para renombrar en masa rápidamente.",
                        "Alt + Flecha Arriba / Abajo: Mueve la línea de código actual hacia arriba o abajo sin necesidad de cortar y pegar.",
                        "Shift + Alt + Flecha Abajo: Duplica la línea de código actual inmediatamente debajo.",
                        "Ctrl + / (Cmd+/): Comenta o descomenta instantáneamente la línea o bloque seleccionado.",
                        "Ctrl + ` (Cmd+`): Abre o cierra la terminal integrada al instante."
                    ]
                },
                {
                    "type": "callout",
                    "tone": "tip",
                    "title": "Configuración de Proyecto (.vscode)",
                    "text": "Puedes guardar las configuraciones de tu equipo en la carpeta oculta .vscode/settings.json en la raíz del proyecto para que todos compartan la misma indentación y formateo automáticamente."
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "ciclos-for-while": {
        "id": 4,
        "module_id": 2,
        "title": "Ciclos: for y while",
        "slug": "ciclos-for-while",
        "type": "article",
        "duration_minutes": 13,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ciclos: for y while"
                },
                {
                    "type": "paragraph",
                    "text": "Los ciclos repiten un bloque de código mientras se cumple una condición. Son la herramienta perfecta para recorrer listas, contar elementos o esperar a que algo cambie."
                },
                {
                    "type": "paragraph",
                    "text": "El for se usa cuando sabes cuántas veces repetir; el while cuando la repetición depende de una condición que puede cambiar dentro del bloque. Elegir el correcto hace el código más natural."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// for: número fijo de repeticiones\nfor ($i = 0; $i < 5; $i++) {\n    echo $i;\n}\n\n// while: repite mientras la condición sea verdadera\n$turnos = 0;\nwhile ($turnos < 3) {\n    echo \"Turno \" . $turnos;\n    $turnos++;\n}"
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ for vs while: ¿Cuándo elegir cada estructura?",
                    "caption": "Utiliza for cuando el número de iteraciones es finito y conocido de antemano; utiliza while cuando la parada depende de un evento externo o condición dinámica.",
                    "leftLabel": "Ciclo Determinado (for)",
                    "leftItems": [
                        "Número de repeticiones conocido previamente (ej. recorrer un array de 10 elementos)",
                        "La inicialización ($i = 0), condición ($i < 10) e incremento ($i++) conviven en una sola línea",
                        "Menor riesgo de ciclo infinito accidental",
                        "Ideal para secuencias numéricas, matrices y rangos finitos"
                    ],
                    "rightLabel": "Ciclo Indeterminado (while)",
                    "rightItems": [
                        "Número de repeticiones variable o dependiente del estado del sistema",
                        "La variable de control debe mutar obligatoriamente dentro del bloque",
                        "Ideal para leer streams de red, esperar entrada de usuario o procesar colas",
                        "Riesgo de ciclo infinito si se omite el paso de avance"
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Las 4 Fases del Ciclo Iterativo",
                    "caption": "El bucle se ejecuta en un círculo virtuoso: si la condición se cumple, ejecuta el cuerpo y aplica el incremento antes de volver a evaluar.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "1. Inicialización (una sola vez)",
                            "desc": "Se declara la variable contadora o de control en memoria",
                            "icon": "🏁",
                            "codeSnippet": "$i = 0"
                        },
                        {
                            "step": 2,
                            "label": "2. Evaluación de Parada",
                            "desc": "Si la condición devuelve true, continúa; si devuelve false, rompe el bucle de inmediato",
                            "icon": "🔍",
                            "tone": "accent",
                            "codeSnippet": "$i < 5 -> true"
                        },
                        {
                            "step": 3,
                            "label": "3. Ejecución del Cuerpo",
                            "desc": "Se ejecutan las instrucciones principales de la iteración actual",
                            "icon": "⚙️",
                            "tone": "primary",
                            "codeSnippet": "echo $i"
                        },
                        {
                            "step": 4,
                            "label": "4. Paso / Incremento",
                            "desc": "Se actualiza el contador y el puntero regresa a la fase 2 para re-evaluar",
                            "icon": "🔄",
                            "tone": "purple",
                            "codeSnippet": "$i++ (ahora $i = 1)"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Riesgo principal: ciclos infinitos"
                },
                {
                    "type": "paragraph",
                    "text": "Un ciclo infinito ocurre cuando la condición nunca se vuelve falsa. En el while debes asegurarte de que algo dentro del bloque modifique la variable de control; de lo contrario el programa no termina."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "for es ideal cuando el número de repeticiones es conocido",
                        "while se usa cuando la condición cambia dentro del bloque",
                        "Siempre debe haber una forma de salir del ciclo",
                        "Recorrer colecciones es el uso más frecuente de los ciclos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 2,
            "title": "Flujo y Funciones",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "funciones-y-parametros": {
        "id": 419,
        "module_id": 2,
        "title": "Funciones y parámetros",
        "slug": "funciones-y-parametros",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Funciones y parámetros"
                },
                {
                    "type": "paragraph",
                    "text": "Una función es un bloque de código con nombre que recibe entradas, las procesa y devuelve un resultado. Permite escribir una vez y reutilizar muchas veces, además de dividir el problema en piezas pequeñas."
                },
                {
                    "type": "paragraph",
                    "text": "Los parámetros son los valores que la función recibe; los argumentos son los valores concretos que pasas al llamarla. Definir funciones pequeñas y con una sola responsabilidad mejora enormemente la calidad del código."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nfunction calcularPrecioConIva(float $precio, float $iva = 0.21): float\n{\n    return $precio * (1 + $iva);\n}\n\necho calcularPrecioConIva(100);      // 121.0\necho calcularPrecioConIva(100, 0.10); // 110.0"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ventajas de usar funciones"
                },
                {
                    "type": "list",
                    "items": [
                        "Evitan duplicar código: escribe la lógica una sola vez",
                        "Aíslan errores: cada función se prueba por separado",
                        "Dan nombre a las operaciones y documentan la intención",
                        "Facilitan los tests automáticos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un buen ejercicio es refactorizar: cuando repites el mismo cálculo tres veces, conviértelo en función. El código resultante es más corto y más fácil de mantener."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Una función recibe parámetros y devuelve un resultado",
                        "Los parámetros opcionales tienen valores por defecto",
                        "La responsabilidad única hace las funciones más fiables",
                        "Llamar una función ejecuta su bloque cuantas veces quieras"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo funciones_y_parametros\n    // Declara un procedimiento Saludar(nombre) que imprima un saludo,\n    // y un algoritmo que lo invoque con \"Ana\".\nFinAlgoritmo",
        "solution": "Algoritmo funciones_y_parametros\n    Procedimiento Saludar(nombre)\n        Escribir \"Hola, \", nombre, \"!\"\n    FinProcedimiento\n\n    Definir nombre Cadena\n    Leer nombre\n    Saludar(nombre)\nFinAlgoritmo",
        "test_cases": [
            [
                "Ana",
                "Hola, Ana!"
            ],
            [
                "Carlos",
                "Hola, Carlos!"
            ]
        ],
        "hint": "Un procedimiento se declara con Procedimiento y termina en FinProcedimiento. Para concatenar se escriben los valores separados por comas.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 2,
            "title": "Flujo y Funciones",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "que-es-un-programa": {
        "id": 420,
        "module_id": 169,
        "title": "¿Qué es un programa?",
        "slug": "que-es-un-programa",
        "type": "article",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es un programa?"
                },
                {
                    "type": "paragraph",
                    "text": "Un programa es una secuencia de instrucciones que un ordenador ejecuta para resolver una tarea. El código fuente es el texto que escribes; el compilador o intérprete lo convierte en acciones reales."
                },
                {
                    "type": "paragraph",
                    "text": "Todo programa sigue un ciclo: recibe una entrada, la procesa siguiendo la lógica que definiste y produce una salida. Incluso los sistemas más complejos son esa idea con muchas capas."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Entrada\n$nombre = \"Ana\";\n\n// Proceso\n$saludo = \"Hola, \" . $nombre;\n\n// Salida\necho $saludo;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Partes de un programa"
                },
                {
                    "type": "list",
                    "items": [
                        "Entrada: datos que llegan del usuario, archivos o sensores",
                        "Proceso: la lógica que transforma esos datos",
                        "Salida: resultado mostrado, guardado o enviado",
                        "Errores: casos inesperados que el programa debe manejar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Antes de escribir código, describe el flujo en papel o con comentarios. Esta práctica, llamada diseño del algoritmo, evita reescribir y hace visible la solución antes de programarla."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Un programa traduce instrucciones en acciones",
                        "El ciclo entrada-proceso-salida está en casi todo software",
                        "Diseñar antes de codificar ahorra tiempo",
                        "El manejo de errores es parte del programa"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 169,
            "title": "Primeros Programas",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "depurando-tu-codigo": {
        "id": 421,
        "module_id": 169,
        "title": "Depurando tu código",
        "slug": "depurando-tu-codigo",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Depurando tu código"
                },
                {
                    "type": "paragraph",
                    "text": "Depurar es encontrar y corregir errores. Los errores de sintaxis impiden ejecutar; los de lógica producen resultados incorrectos sin romper el programa. Aprender a depurar es tan importante como escribir código."
                },
                {
                    "type": "paragraph",
                    "text": "La estrategia básica consiste en localizar la zona sospechosa, observar los valores de las variables y comprobar si coinciden con lo esperado. Los depuradores permiten pausar la ejecución e inspeccionar el estado."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nfunction dividir($a, $b) {\n    if ($b === 0) {\n        throw new InvalidArgumentException(\"No dividas entre cero\");\n    }\n    return $a / $b;\n}\n\necho dividir(10, 2); // 5"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de errores comunes"
                },
                {
                    "type": "list",
                    "items": [
                        "Sintaxis: faltan símbolos o el orden es inválido",
                        "Lógica: el programa corre pero el resultado es incorrecto",
                        "Tiempo de ejecución: falla con ciertos datos (división entre cero)",
                        "Estado: una variable tiene un valor inesperado en un momento dado"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Lee el mensaje de error completo: casi siempre indica archivo y línea. Después, reproduce el fallo con la entrada mínima y aísla cada variable hasta encontrar la que no coincide con lo esperado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los errores de lógica no rompen el programa pero dan malos resultados",
                        "Inspeccionar variables es la técnica principal de depuración",
                        "El mensaje de error indica archivo y línea: empieza por ahí",
                        "Reproducir el fallo con una entrada mínima acelera el diagnóstico"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 169,
            "title": "Primeros Programas",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "primeros-pasos-en-poo": {
        "id": 422,
        "module_id": 169,
        "title": "Primeros pasos en Programación Orientada a Objetos",
        "slug": "primeros-pasos-en-poo",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Primeros pasos en Programación Orientada a Objetos"
                },
                {
                    "type": "paragraph",
                    "text": "La Programación Orientada a Objetos (POO) organiza el código alrededor de objetos: estructuras que combinan datos (propiedades) y comportamiento (métodos). Una clase es la receta; un objeto es la instancia concreta."
                },
                {
                    "type": "paragraph",
                    "text": "La POO favorece el modelado del mundo real: un Usuario, un Pedido o un Carrito se convierten en clases con atributos y acciones. Esto mejora la organización en proyectos grandes."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nclass Usuario {\n    public function __construct(\n        public string $nombre,\n        public int $edad\n    ) {}\n\n    public function saludar(): string {\n        return \"Hola, soy \" . $this->nombre;\n    }\n}\n\n$ada = new Usuario(\"Ada\", 36);\necho $ada->saludar();"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos esenciales"
                },
                {
                    "type": "list",
                    "items": [
                        "Clase: definición de tipo con propiedades y métodos",
                        "Objeto (instancia): un ejemplar concreto creado con new",
                        "Propiedades: datos que guarda cada objeto",
                        "Métodos: funciones que el objeto puede ejecutar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Tres pilares acompañan a la POO: encapsulación (proteger los datos), herencia (reutilizar comportamiento) y polimorfismo (mismos métodos, comportamientos distintos). Conocerlos llega después de dominar la sintaxis básica."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La clase define el molde; el objeto es la instancia",
                        "Las propiedades guardan estado y los métodos comportamiento",
                        "Encapsulación, herencia y polimorfismo son los pilares",
                        "La POO destaca en proyectos grandes y colaborativos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 169,
            "title": "Primeros Programas",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "notacion-big-o": {
        "id": 5,
        "module_id": 3,
        "title": "Notación Big-O",
        "slug": "notacion-big-o",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Notación Big-O"
                },
                {
                    "type": "paragraph",
                    "text": "La notación Big-O describe cómo crece el tiempo de ejecución de un algoritmo cuando crece la entrada. No mide segundos: mide la tasa de crecimiento en el peor caso, lo que permite comparar algoritmos de forma independiente de la máquina."
                },
                {
                    "type": "paragraph",
                    "text": "O(1) significa tiempo constante, O(n) tiempo proporcional a la entrada y O(n²) tiempo cuadrático. La misma máquina puede tardar milisegundos u horas según el algoritmo elegido."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# O(n): el tiempo crece linealmente con la entrada\ndef buscar_maximo(datos):\n    maximo = datos[0]\n    for valor in datos:\n        if valor > maximo:\n            maximo = valor\n    return maximo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Complejidades comunes"
                },
                {
                    "type": "list",
                    "items": [
                        "O(1): constante, no depende del tamaño (acceder a un array)",
                        "O(log n): logarítmica, crece muy lento (búsqueda binaria)",
                        "O(n): lineal, recorre la entrada una vez",
                        "O(n log n): casi lineal, típico de ordenamientos eficientes",
                        "O(n²): cuadrática, recorre en pares (algoritmos básicos)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando la entrada es pequeña, todas las complejidades son rápidas. La diferencia se nota con miles o millones de elementos: ahí O(n log n) vence claramente a O(n²)."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Big-O describe la tasa de crecimiento, no tiempo real",
                        "El peor caso es la referencia habitual",
                        "Las constantes y los casos pequeños importan menos que el orden de crecimiento",
                        "Elegir el algoritmo correcto marca una diferencia enorme en datos grandes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 3,
            "title": "Análisis de Algoritmos",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "comparando-algoritmos": {
        "id": 423,
        "module_id": 3,
        "title": "Comparando algoritmos en la práctica",
        "slug": "comparando-algoritmos",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comparando algoritmos en la práctica"
                },
                {
                    "type": "paragraph",
                    "text": "La complejidad teórica es el punto de partida, pero la práctica añade matices: el tamaño real de los datos, el caso promedio y las constantes de cada implementación también importan."
                },
                {
                    "type": "paragraph",
                    "text": "Un algoritmo O(n log n) con constantes altas puede perder contra uno O(n²) con constantes bajas si la entrada es pequeña. Por eso se miden ambas cosas: análisis asintótico y benchmarks reales."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "import time\n\ndef medir(funcion, datos):\n    inicio = time.perf_counter()\n    funcion(datos)\n    return time.perf_counter() - inicio\n\n# Comparar implementaciones reales con la misma entrada"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Criterios de comparación"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad temporal en el peor y mejor caso",
                        "Complejidad espacial (memoria adicional usada)",
                        "Estabilidad: si preserva el orden de elementos iguales",
                        "Comportamiento con datos casi ordenados o con duplicados"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Ningún algoritmo es el mejor en todo: Merge Sort es estable y predecible; Quick Sort es rapidísimo en promedio pero puede degradarse; Insertion Sort brilla con listas pequeñas o casi ordenadas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Big-O guía, pero el benchmark confirma",
                        "Los datos reales (casi ordenados, duplicados) cambian el resultado",
                        "La estabilidad importa cuando ordenas por varios criterios",
                        "Elige según el caso de uso, no solo por la fama del algoritmo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 3,
            "title": "Análisis de Algoritmos",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "complejidad-espacial": {
        "id": 424,
        "module_id": 3,
        "title": "Complejidad espacial",
        "slug": "complejidad-espacial",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Complejidad espacial"
                },
                {
                    "type": "paragraph",
                    "text": "La complejidad espacial mide cuánta memoria adicional consume un algoritmo según crece la entrada. Un algoritmo puede ser rapidísimo en tiempo pero inviable por la memoria que requiere."
                },
                {
                    "type": "paragraph",
                    "text": "Los algoritmos in-place ordenan dentro del propio array sin copias grandes; otros, como Merge Sort, construyen arreglos auxiliares. La elección depende de los recursos del sistema."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# In-place: sin copias adicionales (memoria O(1) extra)\ndef invertir(lista):\n    izq, der = 0, len(lista) - 1\n    while izq < der:\n        lista[izq], lista[der] = lista[der], lista[izq]\n        izq += 1\n        der -= 1"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comparación típica"
                },
                {
                    "type": "list",
                    "items": [
                        "Bubble Sort y Selection Sort: O(1) extra, in-place",
                        "Insertion Sort: O(1) extra, in-place y estable",
                        "Merge Sort: O(n) extra por los arrays auxiliares",
                        "Quick Sort: O(log n) extra por la pila de recursión"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Recuerda que Big-O espacial excluye la memoria de la propia entrada; mide lo adicional. En sistemas con límites de memoria estrictos, la complejidad espacial puede ser el factor decisivo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad espacial: memoria adicional según n",
                        "In-place usa O(1) memoria extra",
                        "Menos tiempo suele costar más memoria y viceversa",
                        "Evalúa ambos ejes antes de elegir algoritmo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 3,
            "title": "Análisis de Algoritmos",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "bubble-sort": {
        "id": 425,
        "module_id": 170,
        "title": "Bubble Sort",
        "slug": "bubble-sort",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Bubble Sort"
                },
                {
                    "type": "paragraph",
                    "text": "Bubble Sort compara elementos adyacentes y los intercambia si están en el orden incorrecto. En cada pasada, el elemento más grande \"flota\" hasta su posición final, de ahí el nombre de burbuja."
                },
                {
                    "type": "paragraph",
                    "text": "Su complejidad es O(n²) en el peor caso, pero si hacemos una pasada sin intercambios podemos terminar antes: el mejor caso es O(n) con una lista ya ordenada."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def bubble_sort(lista):\n    n = len(lista)\n    for i in range(n):\n        intercambios = False\n        for j in range(n - i - 1):\n            if lista[j] > lista[j + 1]:\n                lista[j], lista[j + 1] = lista[j + 1], lista[j]\n                intercambios = True\n        if not intercambios:\n            break\n    return lista\n\nprint(bubble_sort([5, 2, 9, 1]))"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad: O(n²) peor caso, O(n) mejor caso",
                        "Memoria: O(1), ordena in-place",
                        "Estable: preserva el orden de elementos iguales",
                        "Ideal para aprender, no para listas grandes"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La bandera intercambios es una optimización sencilla: si en una pasada no hubo cambios, la lista ya está ordenada y se evita trabajo innecesario."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Compara pares adyacentes y los intercambia",
                        "Cada pasada coloca el mayor elemento en su sitio",
                        "O(n²) en el peor caso, O(n) con lista ordenada",
                        "Es estable y usa memoria O(1)"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo bubble_sort\n    // Lee 5 numeros, ordenalos de menor a mayor con bubble sort\n    // y muestra el arreglo resultado.\nFinAlgoritmo",
        "solution": "Algoritmo bubble_sort\n    Dimension 5\n    Real a[5], aux\n    Enter i, j\n\n    Para i <- 0 Hasta 4\n        Leer a[i]\n    FinPara\n\n    Para i <- 0 Hasta 3\n        Para j <- 0 Hasta 3 - i\n            Si a[j] > a[j + 1]\n                aux <- a[j]\n                a[j] <- a[j + 1]\n                a[j + 1] <- aux\n            FinSi\n        FinPara\n    FinPara\n\n    Para i <- 0 Hasta 4\n        Escribir a[i], \" \"\n    FinPara",
        "test_cases": [
            [
                "5 3 8 1 9",
                "1\n3\n5\n8\n9"
            ],
            [
                "9 7 6 5 4",
                "4\n5\n6\n7\n9"
            ]
        ],
        "hint": "El bubble sort compara pares vecinos y los intercambia si están desordenados. En cada pasada quedan fijados los elementos más grandes.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 170,
            "title": "Ordenamiento Básico",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "selection-sort": {
        "id": 426,
        "module_id": 170,
        "title": "Selection Sort",
        "slug": "selection-sort",
        "type": "code_challenge",
        "duration_minutes": 13,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Selection Sort"
                },
                {
                    "type": "paragraph",
                    "text": "Selection Sort busca el elemento mínimo de la porción no ordenada y lo intercambia con la primera posición de esa porción. Así construye la lista ordenada de izquierda a derecha."
                },
                {
                    "type": "paragraph",
                    "text": "Siempre hace el mismo número de comparaciones, sin importar el orden de entrada: O(n²) en todos los casos. Es simple, in-place y con pocos intercambios."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def selection_sort(lista):\n    n = len(lista)\n    for i in range(n):\n        minimo = i\n        for j in range(i + 1, n):\n            if lista[j] < lista[minimo]:\n                minimo = j\n        lista[i], lista[minimo] = lista[minimo], lista[i]\n    return lista\n\nprint(selection_sort([5, 2, 9, 1]))"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad: O(n²) siempre, mejor, peor y promedio",
                        "Memoria: O(1), in-place",
                        "No es estable: puede saltar elementos iguales",
                        "Hace pocos intercambios: a lo sumo n - 1"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Al hacer a lo sumo n-1 intercambios, Selection Sort puede ser útil cuando escribir en memoria es caro, aunque las comparaciones sean muchas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Selecciona el mínimo y lo coloca al inicio de la zona no ordenada",
                        "O(n²) en todos los casos",
                        "In-place con O(1) memoria extra",
                        "Pocos intercambios, pero muchas comparaciones"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo selection_sort\n    // Lee 5 numeros y ordenalos de menor a mayor con selection sort.\nFinAlgoritmo",
        "solution": "Algoritmo selection_sort\n    Dimension 5\n    Real a[5], aux\n    Enter i, j, min\n\n    Para i <- 0 Hasta 4\n        Leer a[i]\n    FinPara\n\n    Para i <- 0 Hasta 3\n        min <- i\n        Para j <- i + 1 Hasta 4\n            Si a[j] < a[min]\n                min <- j\n            FinSi\n        FinPara\n        Si min <> i\n            aux <- a[i]\n            a[i] <- a[min]\n            a[min] <- aux\n        FinSi\n    FinPara\n\n    Para i <- 0 Hasta 4\n        Escribir a[i], \" \"\n    FinPara",
        "test_cases": [
            [
                "5 3 8 1 9",
                "1\n3\n5\n8\n9"
            ],
            [
                "2 2 7 0 4",
                "0\n2\n2\n4\n7"
            ]
        ],
        "hint": "Selection sort busca el menor del tramo restante y lo coloca en su posición definitiva.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 170,
            "title": "Ordenamiento Básico",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "insertion-sort": {
        "id": 427,
        "module_id": 170,
        "title": "Insertion Sort",
        "slug": "insertion-sort",
        "type": "code_challenge",
        "duration_minutes": 13,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Insertion Sort"
                },
                {
                    "type": "paragraph",
                    "text": "Insertion Sort construye la lista ordenada elemento a elemento: toma cada nuevo elemento y lo inserta en la posición correcta dentro de la parte ya ordenada, desplazando los mayores a la derecha."
                },
                {
                    "type": "paragraph",
                    "text": "Es el algoritmo que usamos de forma natural al ordenar cartas en la mano. Su mejor caso es O(n) con datos casi ordenados, lo que lo hace muy útil como ordenamiento adaptativo o híbrido."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def insertion_sort(lista):\n    for i in range(1, len(lista)):\n        actual = lista[i]\n        j = i - 1\n        while j >= 0 and lista[j] > actual:\n            lista[j + 1] = lista[j]\n            j -= 1\n        lista[j + 1] = actual\n    return lista\n\nprint(insertion_sort([5, 2, 9, 1]))"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad: O(n²) peor caso, O(n) mejor caso",
                        "Memoria: O(1), in-place",
                        "Estable: preserva el orden de los iguales",
                        "Excelente para listas pequeñas o casi ordenadas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Muchos ordenamientos avanzados lo usan como base: cuando la recursión deja particiones pequeñas, Insertion Sort las remata más rápido que seguir dividiendo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Inserta cada elemento en su lugar dentro de lo ya ordenado",
                        "O(n) con datos casi ordenados: es adaptativo",
                        "Estable e in-place",
                        "Base de los híbridos de ordenamiento eficientes"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo insertion_sort\n    // Lee 5 numeros y ordenalos de menor a mayor con insertion sort.\nFinAlgoritmo",
        "solution": "Algoritmo insertion_sort\n    Dimension 5\n    Real a[5], aux\n    Enter i, j\n\n    Para i <- 0 Hasta 4\n        Leer a[i]\n    FinPara\n\n    Para i <- 1 Hasta 4\n        aux <- a[i]\n        j <- i - 1\n        Mientras j >= 0 Y a[j] > aux\n            a[j + 1] <- a[j]\n            j <- j - 1\n        FinMientras\n        a[j + 1] <- aux\n    FinPara\n\n    Para i <- 0 Hasta 4\n        Escribir a[i], \" \"\n    FinPara",
        "test_cases": [
            [
                "5 3 8 1 9",
                "1\n3\n5\n8\n9"
            ],
            [
                "10 4 6 2 8",
                "2\n4\n6\n8\n10"
            ]
        ],
        "hint": "Insertion sort toma cada elemento y lo inserta en el lugar correcto dentro del tramo ya ordenado.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 170,
            "title": "Ordenamiento Básico",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "merge-sort": {
        "id": 428,
        "module_id": 171,
        "title": "Merge Sort",
        "slug": "merge-sort",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Merge Sort"
                },
                {
                    "type": "paragraph",
                    "text": "Merge Sort aplica divide y vencerás: divide la lista en mitades, las ordena por separado y luego las combina. Su complejidad garantizada es O(n log n) en todos los casos."
                },
                {
                    "type": "paragraph",
                    "text": "La operación de mezcla compara los primeros elementos de cada mitad y toma el menor, construyendo una lista ordenada. Requiere O(n) de memoria extra para las copias temporales."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def merge_sort(lista):\n    if len(lista) <= 1:\n        return lista\n    medio = len(lista) // 2\n    izq = merge_sort(lista[:medio])\n    der = merge_sort(lista[medio:])\n    return mezclar(izq, der)\n\ndef mezclar(izq, der):\n    resultado = []\n    i = j = 0\n    while i < len(izq) and j < len(der):\n        if izq[i] <= der[j]:\n            resultado.append(izq[i]); i += 1\n        else:\n            resultado.append(der[j]); j += 1\n    return resultado + izq[i:] + der[j:]"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características"
                },
                {
                    "type": "list",
                    "items": [
                        "Complejidad: O(n log n) garantizado en todos los casos",
                        "Memoria: O(n) extra por las copias temporales",
                        "Estable: la comparación <= preserva el orden de iguales",
                        "Determinista: el rendimiento no depende de los datos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Por su estabilidad y comportamiento predecible, Merge Sort es la base del ordenamiento por defecto de Python y Java para objetos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Divide, ordena mitades y mezcla",
                        "O(n log n) garantizado",
                        "Estable, pero con O(n) de memoria extra",
                        "Ideal cuando el peor caso debe estar acotado"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo merge_sort\n    // Lee 5 numeros y ordenalos de menor a mayor con merge sort\n    // (divide y vence: ordena mitades y fusiona).\nFinAlgoritmo",
        "solution": "SubProceso Fusionar(izq, mid, der, a, aux)\n    Enter i, j, k\n    i <- izq\n    j <- mid + 1\n    k <- izq\n    Mientras i <= mid Y j <= der\n        Si a[i] <= a[j]\n            aux[k] <- a[i]\n            i <- i + 1\n        Sino\n            aux[k] <- a[j]\n            j <- j + 1\n        FinSi\n        k <- k + 1\n    FinMientras\n    Mientras i <= mid\n        aux[k] <- a[i]\n        i <- i + 1\n        k <- k + 1\n    FinMientras\n    Mientras j <= der\n        aux[k] <- a[j]\n        j <- j + 1\n        k <- k + 1\n    FinMientras\n    Para i <- izq Hasta der\n        a[i] <- aux[i]\n    FinPara\nFinSubProceso\n\nAlgoritmo merge_sort\n    Dimension 5\n    Real a[5], aux[5]\n    Enter izq, der, mid\n\n    Para i <- 0 Hasta 4\n        Leer a[i]\n    FinPara\n\n    Fusionar(0, 2, 4, a, aux)\n    Fusionar(0, 0, 2, a, aux)\n    Fusionar(3, 3, 4, a, aux)\n    Fusionar(0, 1, 3, a, aux)\n    Fusionar(2, 2, 4, a, aux)\n    Fusionar(0, 0, 4, a, aux)\n\n    Para i <- 0 Hasta 4\n        Escribir a[i], \" \"\n    FinPara\nFinAlgoritmo",
        "test_cases": [
            [
                "5 3 8 1 9",
                "1\n3\n5\n8\n9"
            ],
            [
                "4 4 1 1 0",
                "0\n1\n1\n4\n4"
            ]
        ],
        "hint": "Merge sort divide el arreglo hasta llegar a sublistas de un elemento y luego fusiona comparando. La fusión va en un arreglo auxiliar.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 171,
            "title": "Ordenamiento Avanzado y Búsqueda",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "quick-sort": {
        "id": 429,
        "module_id": 171,
        "title": "Quick Sort",
        "slug": "quick-sort",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Quick Sort"
                },
                {
                    "type": "paragraph",
                    "text": "Quick Sort elige un pivote, particiona la lista en menores y mayores que el pivote, y ordena cada partición de forma recursiva. Es uno de los algoritmos más rápidos en la práctica."
                },
                {
                    "type": "paragraph",
                    "text": "Su promedio es O(n log n), pero con un mal pivote (por ejemplo, el primero en una lista ya ordenada) se degrada a O(n²). Elegir el pivote aleatorio o la mediana de tres reduce ese riesgo."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def quick_sort(lista):\n    if len(lista) <= 1:\n        return lista\n    pivote = lista[len(lista) // 2]\n    menores = [x for x in lista if x < pivote]\n    iguales = [x for x in lista if x == pivote]\n    mayores = [x for x in lista if x > pivote]\n    return quick_sort(menores) + iguales + quick_sort(mayores)\n\nprint(quick_sort([5, 2, 9, 1]))"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características"
                },
                {
                    "type": "list",
                    "items": [
                        "Promedio: O(n log n); peor caso: O(n²)",
                        "Memoria extra: O(log n) por la pila de recursión",
                        "In-place en la versión clásica con partición de Lomuto o Hoare",
                        "El pivote determina en gran medida el rendimiento"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La elección del pivote es la clave: pivotes que dividen la lista en mitades balanceadas producen el comportamiento óptimo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Particiona alrededor de un pivote y recursiona",
                        "Promedio O(n log n), peor caso O(n²)",
                        "El peor caso aparece con pivotes desbalanceados",
                        "Aleatorizar o tomar mediana de tres protege el rendimiento"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo quick_sort\n    // Lee 5 numeros y ordenalos de menor a mayor con quicksort\n    // (pivot y partición).\nFinAlgoritmo",
        "solution": "SubProceso Particionar(izq, der, a, pivote)\n    Enter i, j, aux\n    pivote <- a[der]\n    i <- izq - 1\n    Para j <- izq Hasta der - 1\n        Si a[j] <= pivote\n            i <- i + 1\n            aux <- a[i]\n            a[i] <- a[j]\n            a[j] <- aux\n        FinSi\n    FinPara\n    aux <- a[i + 1]\n    a[i + 1] <- a[der]\n    a[der] <- aux\n    Devolver i + 1\nFinSubProceso\n\nSubProceso Quicksort(izq, der, a)\n    Enter p\n    Si izq < der\n        p <- Particionar(izq, der, a, 0)\n        Quicksort(izq, p - 1, a)\n        Quicksort(p + 1, der, a)\n    FinSi\nFinSubProceso\n\nAlgoritmo quick_sort\n    Dimension 5\n    Real a[5]\n    Enter i\n\n    Para i <- 0 Hasta 4\n        Leer a[i]\n    FinPara\n\n    Quicksort(0, 4, a)\n\n    Para i <- 0 Hasta 4\n        Escribir a[i], \" \"\n    FinPara\nFinAlgoritmo",
        "test_cases": [
            [
                "5 3 8 1 9",
                "1\n3\n5\n8\n9"
            ],
            [
                "7 1 6 2 8",
                "1\n2\n6\n7\n8"
            ]
        ],
        "hint": "Quicksort elige un pivote y reordena para que a su izquierda queden los menores y a su derecha los mayores. Luego repite sobre cada mitad.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 171,
            "title": "Ordenamiento Avanzado y Búsqueda",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "busqueda-binaria": {
        "id": 430,
        "module_id": 171,
        "title": "Búsqueda binaria",
        "slug": "busqueda-binaria",
        "type": "code_challenge",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Búsqueda binaria"
                },
                {
                    "type": "paragraph",
                    "text": "La búsqueda binaria encuentra un elemento en una lista ordenada descartando la mitad de las opciones en cada paso: compara con el centro y decide si seguir a la izquierda o a la derecha."
                },
                {
                    "type": "paragraph",
                    "text": "Su complejidad es O(log n): con un millón de elementos basta con unas veinte comparaciones. Es uno de los mejores ejemplos del poder de reducir el espacio de búsqueda."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def busqueda_binaria(lista, objetivo):\n    izq, der = 0, len(lista) - 1\n    while izq <= der:\n        medio = (izq + der) // 2\n        if lista[medio] == objetivo:\n            return medio\n        elif lista[medio] < objetivo:\n            izq = medio + 1\n        else:\n            der = medio - 1\n    return -1\n\ndatos = [1, 3, 5, 7, 9, 11]\nprint(busqueda_binaria(datos, 7))  # índice 3"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requisitos y variantes"
                },
                {
                    "type": "list",
                    "items": [
                        "La lista debe estar ordenada de antemano",
                        "O(log n) en el peor caso",
                        "Variantes: primer/último elemento igual, inserción ordenada",
                        "Se implementa iterativa o recursivamente"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Si la lista no está ordenada, la búsqueda binaria no funciona: devuelve resultados incorrectos. Por eso primero ordenas, y el coste de ordenar se compensa con búsquedas posteriores rapidísimas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Descarta la mitad del espacio en cada paso",
                        "Requiere datos ordenados",
                        "O(log n): crecimiento de tiempo casi plano",
                        "Base de muchas estructuras como los árboles de búsqueda"
                    ]
                }
            ]
        },
        "starter_code": "Algoritmo busqueda_binaria\n    // El arreglo 1..100 esta ordenado. Pide un numero y responde\n    // con \"Encontrado en posicion N\" o \"No existe\".\nFinAlgoritmo",
        "solution": "Algoritmo busqueda_binaria\n    Dimension 100\n    Enter a[100]\n    Enter i, objetivo, izq, der, medio, pos\n\n    Para i <- 0 Hasta 99\n        a[i] <- i + 1\n    FinPara\n\n    Leer objetivo\n    izq <- 0\n    der <- 99\n    pos <- -1\n    Mientras izq <= der\n        medio <- (izq + der) / 2\n        Si a[medio] = objetivo\n            pos <- medio + 1\n            izq <- der + 1\n        Sino\n            Si a[medio] < objetivo\n                izq <- medio + 1\n            Sino\n                der <- medio - 1\n            FinSi\n        FinSi\n    FinMientras\n\n    Si pos > 0\n        Escribir \"Encontrado en posicion \", pos\n    Sino\n        Escribir \"No existe\"\n    FinSi\nFinAlgoritmo",
        "test_cases": [
            [
                "50",
                "Encontrado en posicion 50"
            ],
            [
                "101",
                "No existe"
            ]
        ],
        "hint": "En cada paso reduces el rango a la mitad: si el objetivo es mayor que el medio, buscas solo a la derecha.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 171,
            "title": "Ordenamiento Avanzado y Búsqueda",
            "course_id": 2,
            "course_slug": "algoritmos-ordenamiento",
            "course_title": "Algoritmos de Ordenamiento",
            "course": {
                "id": 2,
                "slug": "algoritmos-ordenamiento",
                "title": "Algoritmos de Ordenamiento"
            }
        }
    },
    "que-es-sql-y-bases-de-datos": {
        "id": 6,
        "module_id": 4,
        "title": "¿Qué es SQL y las bases de datos relacionales?",
        "slug": "que-es-sql-y-bases-de-datos",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es SQL y las bases de datos relacionales?"
                },
                {
                    "type": "paragraph",
                    "text": "SQL (Structured Query Language) es el lenguaje estándar para trabajar con bases de datos relacionales. Con él consultas, insertas, actualizas y borras datos de forma declarativa: describes qué quieres, no cómo hacerlo."
                },
                {
                    "type": "paragraph",
                    "text": "Las bases de datos relacionales organizan la información en tablas con filas y columnas, y conectan las tablas mediante claves. Es el modelo detrás de PostgreSQL, MySQL y SQLite."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Una tabla típica con columnas y filas\nCREATE TABLE usuarios (\n    id SERIAL PRIMARY KEY,\n    nombre VARCHAR(100) NOT NULL,\n    email VARCHAR(255) UNIQUE NOT NULL,\n    creado_en TIMESTAMP DEFAULT NOW()\n);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Tabla: conjunto de filas con la misma estructura",
                        "Columna: un atributo con nombre y tipo",
                        "Fila (registro): una entrada concreta de datos",
                        "Clave primaria: identificador único de cada fila"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "SQL se divide en subconjuntos: DDL define la estructura (CREATE, ALTER), DML manipula los datos (SELECT, INSERT, UPDATE, DELETE) y DCL controla permisos. El resto del curso se centrará en DML."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "SQL es declarativo: describes el resultado deseado",
                        "Las tablas guardan datos con filas y columnas",
                        "Las claves conectan tablas entre sí",
                        "DDL, DML y DCL son las familias de sentencias"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 4,
            "title": "SELECT y Filtros",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "primer-select": {
        "id": 7,
        "module_id": 4,
        "title": "Tu primer SELECT",
        "slug": "primer-select",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tu primer SELECT"
                },
                {
                    "type": "paragraph",
                    "text": "SELECT es la sentencia más usada de SQL: elige columnas de una o más tablas y devuelve las filas que cumplen las condiciones. Su forma básica es SELECT columnas FROM tabla."
                },
                {
                    "type": "paragraph",
                    "text": "Puedes seleccionar todas las columnas con el comodín *, columnas concretas separadas por comas, y columnas calculadas con expresiones. Los alias con AS hacen los resultados más legibles."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Todas las columnas\nSELECT * FROM usuarios;\n\n-- Columnas concretas con alias\nSELECT nombre, email AS correo FROM usuarios;\n\n-- Columna calculada\nSELECT nombre, LENGTH(email) AS longitud_email FROM usuarios;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Evita SELECT * en producción: trae columnas innecesarias",
                        "Usa alias claros para columnas calculadas",
                        "Escribe los nombres en minúsculas y consistentes",
                        "Revisa primero la estructura con \\d tabla en psql"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuanto más precisa sea tu consulta, menos datos viajan por la red y más rápido responde la base. Seleccionar solo lo necesario es una disciplina de rendimiento."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "SELECT elige columnas; FROM indica la tabla",
                        "El comodín * trae todas las columnas",
                        "Los alias con AS mejoran la legibilidad",
                        "Seleccionar solo lo necesario mejora el rendimiento"
                    ]
                }
            ]
        },
        "starter_code": "-- Selecciona el nombre y el email de todos los usuarios\nSELECT nombre, email\nFROM usuarios\n-- ORDER BY nombre;",
        "solution": "SELECT nombre, email\nFROM usuarios\nORDER BY nombre;",
        "test_cases": [
            [
                "consulta",
                "SELECT nombre, email FROM usuarios ORDER BY nombre"
            ]
        ],
        "hint": "Con SELECT nombras las columnas; con FROM indicas la tabla. ORDER BY ordena el resultado.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 4,
            "title": "SELECT y Filtros",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "filtros-where-y-operadores": {
        "id": 431,
        "module_id": 4,
        "title": "Filtros con WHERE y operadores",
        "slug": "filtros-where-y-operadores",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Filtros con WHERE y operadores"
                },
                {
                    "type": "paragraph",
                    "text": "WHERE filtra las filas que cumplan una condición. Sin él, SELECT devuelve toda la tabla; con él, la consulta se centra en el subconjunto relevante."
                },
                {
                    "type": "paragraph",
                    "text": "Los operadores de comparación (=, !=, <, >, <=, >=) y los lógicos (AND, OR, NOT) se combinan para expresar condiciones complejas. ILIKE busca texto sin distinguir mayúsculas."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "SELECT nombre, precio\nFROM productos\nWHERE precio > 100\n  AND categoria_id = 3\n  AND nombre ILIKE '%pro%';"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Operadores útiles"
                },
                {
                    "type": "list",
                    "items": [
                        "= != < > <= >= para comparar valores",
                        "AND, OR, NOT para combinar condiciones",
                        "ILIKE / LIKE para búsquedas de texto con % y _",
                        "IN, BETWEEN, IS NULL para casos frecuentes"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Ten cuidado con NULL: comparar con = nunca da verdadero frente a NULL; se usa IS NULL o IS NOT NULL. Este detalle causa muchos errores en consultas reales."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "WHERE filtra antes de devolver resultados",
                        "AND y OR combinan condiciones con precedencia clara",
                        "NULL no se compara con =; se usa IS NULL",
                        "ILIJE(LIKE) permite búsquedas flexibles de texto"
                    ]
                }
            ]
        },
        "starter_code": "-- Muestra los cursos de nivel principiante que sean gratuitos\nSELECT *\nFROM cursos\n-- WHERE ...;",
        "solution": "SELECT *\nFROM cursos\nWHERE nivel = 'principiante' AND gratuito = TRUE;",
        "test_cases": [
            [
                "consulta",
                "WHERE nivel = 'principiante' AND gratuito = TRUE"
            ]
        ],
        "hint": "WHERE filtra filas. Combina condiciones con AND y OR; BETWEEN y IN acortan las expresiones.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 4,
            "title": "SELECT y Filtros",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "llaves-primarias-y-foraneas": {
        "id": 432,
        "module_id": 172,
        "title": "Llaves primarias y foráneas",
        "slug": "llaves-primarias-y-foraneas",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Llaves primarias y foráneas"
                },
                {
                    "type": "paragraph",
                    "text": "La llave primaria identifica de forma única cada fila de una tabla. La llave foránea es una columna que apunta a la primaria de otra tabla, creando la relación entre ambas."
                },
                {
                    "type": "paragraph",
                    "text": "Gracias a las llaves foráneas no duplicas datos: un pedido guarda el id del cliente en vez de copiar sus datos. Esto se llama normalización y evita inconsistencias."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "CREATE TABLE clientes (\n    id SERIAL PRIMARY KEY,\n    nombre VARCHAR(100) NOT NULL\n);\n\nCREATE TABLE pedidos (\n    id SERIAL PRIMARY KEY,\n    cliente_id INT REFERENCES clientes(id),\n    total NUMERIC(10,2) NOT NULL\n);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de relaciones"
                },
                {
                    "type": "list",
                    "items": [
                        "Uno a muchos: un cliente tiene muchos pedidos",
                        "Muchos a muchos: estudiantes y cursos, vía tabla puente",
                        "Uno a uno: un perfil por usuario"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las restricciones de integridad referencial protegen los datos: no puedes crear un pedido de un cliente inexistente, y borrar un cliente con pedidos requiere decidir qué hacer con ellos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La primaria identifica; la foránea relaciona",
                        "Las foráneas evitan duplicar información",
                        "Existen relaciones 1:N, N:M y 1:1",
                        "La integridad referencial protege la consistencia"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 172,
            "title": "Relaciones y JOINs",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "joins-inner-y-left": {
        "id": 433,
        "module_id": 172,
        "title": "JOINs: INNER y LEFT",
        "slug": "joins-inner-y-left",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "JOINs: INNER y LEFT"
                },
                {
                    "type": "paragraph",
                    "text": "Los JOIN combinan filas de dos tablas según una condición de relación. INNER JOIN devuelve solo las filas que coinciden en ambas; LEFT JOIN devuelve todas las de la izquierda y las coincidencias de la derecha, con NULL si no hay."
                },
                {
                    "type": "paragraph",
                    "text": "Elegir el JOIN correcto cambia el resultado: si quieres clientes aunque no tengan pedidos, necesitas LEFT JOIN; si solo clientes con pedidos, INNER JOIN."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Solo clientes con al menos un pedido\nSELECT c.nombre, p.total\nFROM clientes c\nINNER JOIN pedidos p ON p.cliente_id = c.id;\n\n-- Todos los clientes, con o sin pedidos\nSELECT c.nombre, p.total\nFROM clientes c\nLEFT JOIN pedidos p ON p.cliente_id = c.id;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo se lee un JOIN"
                },
                {
                    "type": "list",
                    "items": [
                        "ON define la condición de emparejamiento",
                        "INNER: solo coincidencias en ambas tablas",
                        "LEFT: conserva todas las filas de la tabla izquierda",
                        "Los alias de tabla (c, p) acortan la escritura"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un error típico es olvidar la condición ON o usar condiciones amplias que multiplican filas. Revisa siempre cuántas filas esperas devolver."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "INNER JOIN excluye filas sin coincidencia",
                        "LEFT JOIN conserva la tabla izquierda completa",
                        "ON establece la condición de relación",
                        "El JOIN correcto depende del resultado que necesitas"
                    ]
                }
            ]
        },
        "starter_code": "-- Lista los pedidos con el nombre del cliente (LEFT JOIN:\n-- incluye pedidos sin cliente)\nSELECT p.id, p.fecha, c.nombre\nFROM pedidos p\n-- JOIN clientes c ON ...;",
        "solution": "SELECT p.id, p.fecha, c.nombre\nFROM pedidos p\nLEFT JOIN clientes c ON c.id = p.cliente_id;",
        "test_cases": [
            [
                "consulta",
                "LEFT JOIN clientes c ON c.id = p.cliente_id"
            ]
        ],
        "hint": "INNER JOIN solo devuelve filas que coinciden en ambos lados; LEFT JOIN mantiene las de la izquierda aunque no haya coincidencia.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 172,
            "title": "Relaciones y JOINs",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "joins-multiples-y-self": {
        "id": 434,
        "module_id": 172,
        "title": "JOINs múltiples y self JOIN",
        "slug": "joins-multiples-y-self",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "JOINs múltiples y self JOIN"
                },
                {
                    "type": "paragraph",
                    "text": "Puedes encadenar varios JOIN para combinar tres o más tablas, conectando cada una por su relación. También puedes unir una tabla consigo misma (self JOIN) para comparar filas dentro de ella."
                },
                {
                    "type": "paragraph",
                    "text": "Un ejemplo clásico de self JOIN es una tabla de empleados donde cada uno tiene un jefe que también es empleado. Con dos alias de la misma tabla se obtiene la jerarquía."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Tres tablas: pedidos -> clientes -> paises\nSELECT p.id, c.nombre, pa.nombre AS pais\nFROM pedidos p\nINNER JOIN clientes c ON c.id = p.cliente_id\nINNER JOIN paises pa ON pa.id = c.pais_id;\n\n-- Self JOIN: empleados y su jefe\nSELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleados e\nLEFT JOIN empleados j ON j.id = e.jefe_id;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Consejos con varios JOIN"
                },
                {
                    "type": "list",
                    "items": [
                        "Aliasa cada tabla para evitar ambigüedades",
                        "Une paso a paso: verifica cada JOIN por separado",
                        "Cuidado con la multiplicación de filas (producto cartesiano)",
                        "Usa LEFT JOIN para conservar la tabla principal"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cada JOIN mal planteado puede multiplicar filas de forma silenciosa. Antes de ejecutar, piensa cuántas filas esperas; si el resultado es enorme, revisa la condición ON."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los JOIN se encadenan con la condición correspondiente",
                        "El self JOIN usa dos alias de la misma tabla",
                        "Los alias evitan columnas ambiguas",
                        "Verifica el conteo de filas para detectar productos cartesianos"
                    ]
                }
            ]
        },
        "starter_code": "-- Muestra cada empleado junto a su jefe (self JOIN)\nSELECT e.nombre, j.nombre AS jefe\nFROM empleados e\n-- JOIN empleados j ON ...;",
        "solution": "SELECT e.nombre AS empleado, j.nombre AS jefe\nFROM empleados e\nLEFT JOIN empleados j ON j.id = e.jefe_id;",
        "test_cases": [
            [
                "consulta",
                "LEFT JOIN empleados j ON j.id = e.jefe_id"
            ]
        ],
        "hint": "Un self JOIN usa la misma tabla dos veces con alias distintos; la condición de unión apunta al superior.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 172,
            "title": "Relaciones y JOINs",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "pseint-ciclos": {
        "id": 445,
        "module_id": 176,
        "title": "Repetir con While y Para",
        "slug": "pseint-ciclos",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El bucle Para: cuando conoces las repeticiones"
                },
                {
                    "type": "paragraph",
                    "text": "El bucle Para repite un bloque un número determinado de veces usando una variable contador. Su estructura es Para, una asignación con la flecha, el límite, la palabra Hasta y el cierre FinPara. Si el límite inicial es mayor que el final, el recorrido va hacia atrás, y por eso no hace falta indicar un paso negativo."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo contar\n    Para i <- 1 Hasta 5\n        Escribir \"Número \", i\n    FinPara\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El bucle Mientras: mientras la condición se cumpla"
                },
                {
                    "type": "paragraph",
                    "text": "El bucle Mientras repite el bloque mientras una condición siga siendo verdadera, y termina en cuanto se vuelve falsa. Es la herramienta adecuada cuando no sabes de antemano cuántas veces hay que repetir, por ejemplo al pedir números hasta que el usuario escriba un cero."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo suma_hasta_cero\n    Definir n Enter\n    Definir suma Enter\n    Leer n\n    Mientras n <> 0\n        suma <- suma + n\n        Leer n\n    FinMientras\n    Escribir \"La suma es \", suma\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuidado con los bucles infinitos"
                },
                {
                    "type": "paragraph",
                    "text": "Un error frecuente es olvidar actualizar la condición dentro del bucle. Si el While comprueba siempre la misma variable sin cambiarla, el programa nunca terminará. La regla práctica es que dentro del cuerpo del bucle debe haber siempre una instrucción que modifique el valor de la condición, en este caso la lectura del siguiente número."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Para repite un número conocido de veces y usa un contador",
                        "Para i <- 3 Hasta 1 recorre hacia atrás sin más explicación",
                        "Mientras repite mientras la condición sea verdadera",
                        "Dentro del bucle hay que modificar lo que evalúa la condición"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 176,
            "title": "Condicionales y ciclos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "order-by-y-limit": {
        "id": 435,
        "module_id": 173,
        "title": "ORDER BY y LIMIT",
        "slug": "order-by-y-limit",
        "type": "code_challenge",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "ORDER BY y LIMIT"
                },
                {
                    "type": "paragraph",
                    "text": "ORDER BY ordena los resultados por una o más columnas, en orden ascendente (ASC) o descendente (DESC). LIMIT recorta la cantidad de filas devueltas, ideal para paginar o ver lo primero de una lista."
                },
                {
                    "type": "paragraph",
                    "text": "La combinación clásica es ordenar y luego limitar: los 5 productos más caros, los últimos pedidos, la página 2 de resultados."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Los 5 productos más caros\nSELECT nombre, precio\nFROM productos\nORDER BY precio DESC\nLIMIT 5;\n\n-- Paginación: página 2 con 10 por página\nSELECT * FROM productos\nORDER BY id\nLIMIT 10 OFFSET 10;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Detalles importantes"
                },
                {
                    "type": "list",
                    "items": [
                        "ASC es el orden por defecto; DESC invierte",
                        "Puedes ordenar por varias columnas: ORDER BY a, b DESC",
                        "LIMIT sin OFFSET devuelve las primeras filas",
                        "OFFSET salta filas para paginar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Sin ORDER BY, el orden de las filas no está garantizado: la base devuelve lo que quiera. Si el resultado debe ser estable, ordena siempre de forma explícita."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "ORDER BY fija el orden de los resultados",
                        "DESC para mayor a menor; ASC para menor a mayor",
                        "LIMIT limita filas; OFFSET salta filas",
                        "Sin ORDER BY el orden no está garantizado"
                    ]
                }
            ]
        },
        "starter_code": "-- Muestra los 5 cursos mejor valorados, de mayor a menor\nSELECT id, titulo, valoracion\nFROM cursos\n-- ORDER BY ... LIMIT ...;",
        "solution": "SELECT id, titulo, valoracion\nFROM cursos\nORDER BY valoracion DESC\nLIMIT 5;",
        "test_cases": [
            [
                "consulta",
                "ORDER BY valoracion DESC LIMIT 5"
            ]
        ],
        "hint": "ORDER BY ordena (ASC por defecto, DESC paraDescending) y LIMIT recorta el resultado. Aplica LIMIT siempre después de ORDER BY.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 173,
            "title": "Agregaciones y Orden",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "funciones-de-agregacion": {
        "id": 436,
        "module_id": 173,
        "title": "Funciones de agregación",
        "slug": "funciones-de-agregacion",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Funciones de agregación"
                },
                {
                    "type": "paragraph",
                    "text": "Las funciones de agregación resumen muchas filas en un solo valor: COUNT cuenta, SUM suma, AVG promedia, MAX y MIN encuentran extremos. Son la base de las estadísticas sobre datos."
                },
                {
                    "type": "paragraph",
                    "text": "COUNT(*) cuenta filas; COUNT(columna) cuenta valores no nulos. SUM y AVG ignoran NULL por defecto, lo que evita sesgos en los totales."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "SELECT COUNT(*)          AS total_pedidos,\n       SUM(total)        AS ingresos_totales,\n       AVG(total)        AS ticket_promedio,\n       MAX(total)        AS pedido_mas_alto,\n       MIN(total)        AS pedido_mas_bajo\nFROM pedidos;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Detalles prácticos"
                },
                {
                    "type": "list",
                    "items": [
                        "COUNT(*) cuenta todas las filas",
                        "SUM y AVG ignoran los NULL",
                        "Los alias dan nombres legibles a los totales",
                        "Las agregaciones sin GROUP BY resumen toda la tabla"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando combinas agregaciones con columnas normales sin GROUP BY, la consulta es inválida en la mayoría de los motores. Ese es el tema de la siguiente lección."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "COUNT, SUM, AVG, MAX y MIN resumen datos",
                        "COUNT(*) cuenta filas; COUNT(col) cuenta no nulos",
                        "SUM y AVG ignoran NULL",
                        "Sin GROUP BY, la agregación cubre toda la tabla"
                    ]
                }
            ]
        },
        "starter_code": "-- Calcula el precio medio, el maximo y el minimo de los productos\nSELECT AVG(precio), MAX(precio), MIN(precio)\nFROM productos\n-- ;",
        "solution": "SELECT AVG(precio) AS precio_medio,\n       MAX(precio) AS precio_max,\n       MIN(precio) AS precio_min\nFROM productos;",
        "test_cases": [
            [
                "consulta",
                "AVG(precio) AS precio_medio, MAX(precio) AS precio_max, MIN(precio) AS precio_min"
            ]
        ],
        "hint": "AVG, MAX, MIN, SUM y COUNT colapsan varias filas en un único valor agregado.",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 173,
            "title": "Agregaciones y Orden",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "group-by-y-having": {
        "id": 437,
        "module_id": 173,
        "title": "GROUP BY y HAVING",
        "slug": "group-by-y-having",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "GROUP BY y HAVING"
                },
                {
                    "type": "paragraph",
                    "text": "GROUP BY agrupa las filas por los valores de una o más columnas y permite calcular agregaciones por grupo: total por cliente, promedio por categoría, cantidad por año."
                },
                {
                    "type": "paragraph",
                    "text": "HAVING filtra los grupos ya agregados, igual que WHERE filtra filas individuales. La diferencia es clave: WHERE se aplica antes del agrupamiento y HAVING después."
                },
                {
                    "type": "code",
                    "language": "sql",
                    "text": "-- Total gastado por cliente, solo los que superan 500\nSELECT cliente_id, SUM(total) AS gasto\nFROM pedidos\nGROUP BY cliente_id\nHAVING SUM(total) > 500\nORDER BY gasto DESC;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Errores frecuentes"
                },
                {
                    "type": "list",
                    "items": [
                        "Seleccionar columnas normales sin agruparlas",
                        "Filtrar agregados con WHERE en vez de HAVING",
                        "Olvidar que HAVING puede usar funciones agregadas",
                        "Agrupar por más columnas de las necesarias"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla de oro: las columnas del SELECT que no son agregaciones deben aparecer en el GROUP BY. Violarla genera resultados inválidos o impredecibles según el motor."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "GROUP BY crea grupos para agregar",
                        "HAVING filtra grupos; WHERE filtra filas",
                        "Las columnas del SELECT deben agruparse o agregarse",
                        "Con GROUP BY se abre la puerta a reportes potentes"
                    ]
                }
            ]
        },
        "starter_code": "-- Muestra las categorias con mas de 10 productos\nSELECT categoria_id, COUNT(*) AS total\nFROM productos\n-- GROUP BY ...;",
        "solution": "SELECT categoria_id, COUNT(*) AS total\nFROM productos\nGROUP BY categoria_id\nHAVING COUNT(*) > 10;",
        "test_cases": [
            [
                "consulta",
                "GROUP BY categoria_id HAVING COUNT(*) > 10"
            ]
        ],
        "hint": "GROUP BY agrupa filas; HAVING filtra sobre los grupos ya agregados (WHERE filtra antes de agrupar).",
        "language": "sql",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 173,
            "title": "Agregaciones y Orden",
            "course_id": 3,
            "course_slug": "sql-desde-cero",
            "course_title": "SQL desde Cero",
            "course": {
                "id": 3,
                "slug": "sql-desde-cero",
                "title": "SQL desde Cero"
            }
        }
    },
    "pseint-que-es-algoritmo": {
        "id": 438,
        "module_id": 174,
        "title": "¿Qué es un algoritmo?",
        "slug": "pseint-que-es-algoritmo",
        "type": "article",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Un algoritmo es una receta precisa"
                },
                {
                    "type": "paragraph",
                    "text": "Un algoritmo es una secuencia ordenada y finita de pasos que resuelve un problema. La clave es que no puede tener ambigüedades: si dos personas lo siguen, deben obtener exactamente el mismo resultado. Por eso la computación es tan estricta con la lógica: un paso mal especificado produce una respuesta incorrecta sin avisar."
                },
                {
                    "type": "paragraph",
                    "text": "Piensa en una receta de cocina. \"Agrega sal\" no es un algoritmo porque no dice cuánta sal. \"Agrega 5 gramos de sal\" sí lo es. En programación ocurre lo mismo: las entradas deben estar clairement definidas, los pasos deben ser verificables y el resultado debe ser comprobable. Esa propiedad es lo que hace que un programa sea reutilizable y que otros puedan construir sobre él."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Entradas, proceso y salida"
                },
                {
                    "type": "list",
                    "items": [
                        "Entradas: los datos que recibe el algoritmo y que hay que declarar (números, texto, arreglos)",
                        "Proceso: la lógica, las operaciones que se realizan con esos datos",
                        "Salida: el resultado que se produce al terminar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Todo programa, por pequeño que sea, sigue esta estructura. Cuando escribas código, tenerlas presentes evita el error más común: declarar variables que nunca usas o olvidar imprimir lo que pediste."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo ejemplo\n    // Entrada\n    Definir nombre Cadena\n    Leer nombre\n    // Proceso y salida\n    Escribir \"Hola, \", nombre\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Un algoritmo debe ser finito: termina en algún momento",
                        "Cada paso debe ser preciso y sin ambigüedad",
                        "Estructura mínima: entradas, proceso, salida"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 174,
            "title": "Primeros pasos con PSeInt",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "poo-ejercicio-contador": {
        "id": 469,
        "module_id": 184,
        "title": "Ejercicio: un contador con estado",
        "slug": "poo-ejercicio-contador",
        "type": "code_challenge",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea la clase Contador con un atributo valor inicializado a 0\n# y los metodos incrementar() y decrementar() que devuelven el nuevo valor.\n# El metodo reiniciar() pone el valor a 0 y lo devuelve.\n\n",
        "solution": "class Contador:\n    def __init__(self):\n        self.valor = 0\n\n    def incrementar(self):\n        self.valor += 1\n        return self.valor\n\n    def decrementar(self):\n        self.valor -= 1\n        return self.valor\n\n    def reiniciar(self):\n        self.valor = 0\n        return self.valor",
        "test_cases": [
            [
                "str(Contador().incrementar())",
                "1"
            ],
            [
                "str(Contador().incrementar() + Contador().incrementar())",
                "2"
            ]
        ],
        "hint": "Modifica el atributo con self.valor y luego devuelvelo.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 184,
            "title": "Atributos y métodos",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "pseint-ejercicio-hola-mundo": {
        "id": 440,
        "module_id": 174,
        "title": "Ejercicio: tu primer algoritmo",
        "slug": "pseint-ejercicio-hola-mundo",
        "type": "code_challenge",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué tienes que hacer"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe un algoritmo que pida el nombre de una persona y la salude por su nombre. El enunciado es sencillo a propósito: la meta es que uses por primera vez la estructura completa de un programa, es decir, la cabecera Algoritmo, la lectura de una variable y la salida con Escribir, respetando además el punto y coma y la escritura en mayúsculas que PSeInt exige."
                },
                {
                    "type": "paragraph",
                    "text": "La salida esperada tiene dos palabras separadas por un espacio y un signo de exclamación. Cuando tu código coincida, el ejercicio se marcará como superado."
                }
            ]
        },
        "starter_code": "Algoritmo hola_mundo\n    // 1) Declara la variable que guardará el nombre (Cadena)\n    // 2) Lee el nombre con Leer\n    // 3) Imprime \"Hola, \" seguido del nombre y un \"!\"\n    //    Ojo: Escribir concatena sin espacios, ponlos en las cadenas.\n\n\nFinAlgoritmo",
        "solution": "Algoritmo hola_mundo\n    Definir nombre Cadena\n    Leer nombre\n    Escribir \"Hola, \", nombre, \"!\"\nFinAlgoritmo",
        "test_cases": [
            [
                "Ana",
                "Hola, Ana!"
            ],
            [
                "Carlos",
                "Hola, Carlos!"
            ]
        ],
        "hint": "Declara la variable antes de usarla: \"Definir nombre Cadena\". Para imprimir el espacio, escríbelo dentro de las comillas.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 174,
            "title": "Primeros pasos con PSeInt",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "pseint-definir-y-leer": {
        "id": 441,
        "module_id": 175,
        "title": "Definir, Leer y usar: las variables",
        "slug": "pseint-definir-y-leer",
        "type": "article",
        "duration_minutes": 13,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Una variable es una caja con nombre"
                },
                {
                    "type": "paragraph",
                    "text": "Para usar un dato dentro de un algoritmo primero hay que declararlo. En PSeInt la instrucción Definir crea la variable y declara su tipo: Enter para números enteros, Real para decimales, Cadena para texto, Caracter para una letra y Logico para verdadeiro o falso. Declarar el tipo correcto no es un detalle menor: determina cómo se comporta el resto de las operaciones."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo variables\n    Definir edad Enter\n    Definir altura Real\n    Definir nombre Cadena\n    Definir activo Logico\n\n    edad <- 36\n    altura <- 1.78\n    nombre <- \"Ada\"\n    activo <- Verdadero\n\n    Escribir nombre, \" tiene \", edad, \" años y mide \", altura, \" metros\"\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Leer pide el dato al usuario"
                },
                {
                    "type": "paragraph",
                    "text": "La instrucción Leer detiene el programa, muestra una ventana de entrada y guarda lo que la persona escriba en la variable indicada. Puedes leer varias variables en una sola línea separándolas con comas, y PSeInt irá pidiendo un valor por cada una, en orden."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo lectura\n    Definir nombre Cadena\n    Definir edad Enter\n    Leer nombre, edad\n    Escribir \"Hola \", nombre, \", tienes \", edad, \" años\"\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Asignación con el operador flecha"
                },
                {
                    "type": "paragraph",
                    "text": "El símbolo de asignación es una flecha con guion, se escribe <- y significa \"guarda este valor en esta variable\". No es lo mismo que el signo igual: el igual compara y la flecha almacena. Confundirlos es el error más habitual entre principiantes, así que conviene leer la flecha como \"pon esto aquí dentro\"."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Toda variable debe declararse con Definir antes de usarse",
                        "El tipo determina cómo se almacena y compara el dato",
                        "Leer puede pedir varios datos separados por comas",
                        "Se asigna con la flecha <-, nunca con el signo igual"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 175,
            "title": "Variables y lectura de datos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "pseint-tipos-y-operaciones": {
        "id": 442,
        "module_id": 175,
        "title": "Tipos de datos y operaciones básicas",
        "slug": "pseint-tipos-y-operaciones",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Operaciones con cada tipo"
                },
                {
                    "type": "paragraph",
                    "text": "Los números Enter y Real se suman, restan, multiplican y dividen con los operadores habituales. El asterisco multiplica, la barra divide y el asterisco seguido de igual eleva a una potencia. PSeInt incluye además el operador mod, que devuelve el resto de una división entera y resulta imprescindible al trabajar con múltiplos y números pares."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo operaciones\n    Definir a Enter\n    Definir b Enter\n    Leer a, b\n    Escribir \"Suma: \", a + b\n    Escribir \"Resta: \", a - b\n    Escribir \"Producto: \", a * b\n    Escribir \"División: \", a / b\n    Escribir \"Resto: \", a mod b\n    Escribir \"Potencia: \", a ^ 2\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ojo con la división entera"
                },
                {
                    "type": "paragraph",
                    "text": "Cuando ambos operandos son Enter, la división se trunca: 7 / 2 vale 3, no 3.5. Es el comportamiento de PSeInt y coincide con la división entera de la mayoría de lenguajes. Si necesitas decimales, declara Real la variable o divide entre un valor con parte decimal. Ignorar esta regla provoca errores difíciles de detectar, porque el resultado parece correcto a simple vista."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cadenas de texto"
                },
                {
                    "type": "paragraph",
                    "text": "Las cadenas se escriben entre comillas dobles y se concatenan con el operador + o simplemente escribiéndolas una tras otra en Escribir. Los números se convierten a texto automáticamente al mezclarlos con cadenas, lo que resulta muy cómodo para construir mensajes."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo textos\n    Definir nombre Cadena\n    Leer nombre\n    Escribir \"Hola \", nombre, \", te saludamos\"\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La división entre dos Enter se trunca: 7 / 2 es 3",
                        "El operador mod devuelve el resto de la división",
                        "El caret ^ eleva a una potencia",
                        "Las cadenas van entre comillas y se concatenan al escribirlas seguidas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 175,
            "title": "Variables y lectura de datos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "pseint-ejercicio-promedio-edad": {
        "id": 443,
        "module_id": 175,
        "title": "Ejercicio: calcula el promedio de edad",
        "slug": "pseint-ejercicio-promedio-edad",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué tienes que hacer"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe un algoritmo que pida tres edades y muestre su promedio. El ejercicio combina tres conceptos que acabas de ver: declarar varias variables de tipo Enter, leerlas en una sola instrucción y calcular una división."
                },
                {
                    "type": "paragraph",
                    "text": "Cuidado con la división: si declaras las edades como Enter, el promedio también se trunca. Para mostrar un resultado con decimales tienes que declarar una variable Real para el promedio y convertir la suma, por ejemplo dividiendo entre 2.0 o declarando uno de los operandos como Real."
                },
                {
                    "type": "paragraph",
                    "text": "El formato de salida esperado es un número seguido de la palabra años, sin decimales cuando el resultado sea entero."
                }
            ]
        },
        "starter_code": "Algoritmo promedio_edad\n    // 1) Declara las tres edades (Enter) y el promedio\n    // 2) Lee las tres edades en una sola instruccion Leer\n    // 3) Calcula el promedio\n    // 4) Muestra el resultado\n\n\nFinAlgoritmo",
        "solution": "Algoritmo promedio_edad\n    Definir e1, e2, e3 Enter\n    Definir promedio Real\n    Leer e1, e2, e3\n    promedio <- (e1 + e2 + e3) / 3.0\n    Escribir promedio, \" años\"\nFinAlgoritmo",
        "test_cases": [
            [
                "20 30 40",
                "30 años"
            ],
            [
                "18 24 30",
                "24 años"
            ]
        ],
        "hint": "Para que la división no se trunque, divide entre 3.0 en lugar de 3. Al declarar promedio como Real puedes imprimir el valor con decimales.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 175,
            "title": "Variables y lectura de datos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "pseint-condicionales": {
        "id": 444,
        "module_id": 176,
        "title": "Si, Entonces y Sino",
        "slug": "pseint-condicionales",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Decidir según una condición"
                },
                {
                    "type": "paragraph",
                    "text": "Hasta ahora nuestros algoritmos siempre ejecutaban lo mismo. La estructura Si permite ejecutar un bloque de código solo cuando una condición es verdadera, y otro distinto cuando es falsa. La condición es una expresión que se evalúa a verdadero o falso usando comparaciones como mayor que, menor que, igual o distinto, y se combinan con y y o."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo decision\n    Definir edad Enter\n    Leer edad\n    Si edad >= 18\n        Escribir \"Eres mayor de edad\"\n    Sino\n        Escribir \"Eres menor de edad\"\n    FinSi\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "La sintaxis importa"
                },
                {
                    "type": "paragraph",
                    "text": "El condicional se cierra con FinSi, y la palabra Entonces separa la condición del bloque. Las dos formas de desigualdad que debes recordar son mayor o igual, con el signo igual pegado, y distinto, que se escribe con el signo menor seguido del mayor. Cualquier olvido de estas reglas produce un error de sintaxis que PSeInt señala con el número de línea."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Condiciones complejas"
                },
                {
                    "type": "paragraph",
                    "text": "Puedes anidar condiciones para tomar decisiones más precisas, y combinar varias con y u o. Cuando la condición sea larga, conviene usar paréntesis: la prioridad de y es mayor que la de o, así que el paréntesis evita sorpresas como evaluar true or false and false de forma distinta a lo que esperabas."
                },
                {
                    "type": "code",
                    "language": "pseint",
                    "text": "Algoritmo acceso\n    Definir edad Enter\n    Definir tiene_boleta Logico\n    Leer edad, tiene_boleta\n    Si edad >= 18 Y tiene_boleta\n        Escribir \"Acceso permitido\"\n    Sino\n        Escribir \"Acceso denegado\"\n    FinSi\nFinAlgoritmo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Si abre la estructura y FinSi la cierra; Entonces separa la condición",
                        "Sino ejecuta el bloque alternativo cuando la condición es falsa",
                        "Las condiciones se combinan con y y o, y se agrupan con paréntesis"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 176,
            "title": "Condicionales y ciclos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "pseint-ejercicio-par-impar": {
        "id": 446,
        "module_id": 176,
        "title": "Ejercicio: par o impar",
        "slug": "pseint-ejercicio-par-impar",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué tienes que hacer"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe un algoritmo que pida un número entero y muestre, uno por línea, todos los números pares que hay entre 0 y ese número, sin incluir el propio número. El ejercicio combina un bucle Para con un condicional: el bucle recorre los valores y la condición decide cuáles se imprimen."
                },
                {
                    "type": "paragraph",
                    "text": "Recuerda que un número es par cuando su resto al dividir entre 2 es cero, y que ese resto se obtiene con el operador mod. La salida esperada tiene un número por línea, en orden ascendente."
                }
            ]
        },
        "starter_code": "Algoritmo pares_hasta\n    // 1) Declara el limite (Enter)\n    // 2) Leelo\n    // 3) Recorre con Para desde 0 hasta el limite - 1\n    // 4) Si el numero es par, muestralo\n    //    Pista: un numero es par si (numero mod 2) = 0\n\n\nFinAlgoritmo",
        "solution": "Algoritmo pares_hasta\n    Definir limite Enter\n    Definir i Enter\n    Leer limite\n    Para i <- 0 Hasta limite - 1\n        Si i mod 2 = 0\n            Escribir i\n        FinSi\n    FinPara\nFinAlgoritmo",
        "test_cases": [
            [
                "6",
                "0\n2\n4"
            ],
            [
                "3",
                "0\n2"
            ]
        ],
        "hint": "La condición del Si es \"i mod 2 = 0\". Recuerda cerrar con FinPara y FinSi en el orden correcto.",
        "language": "pseint",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 176,
            "title": "Condicionales y ciclos",
            "course_id": 92,
            "course_slug": "pseint-desde-cero",
            "course_title": "PSeInt desde cero",
            "course": {
                "id": 92,
                "slug": "pseint-desde-cero",
                "title": "PSeInt desde cero"
            }
        }
    },
    "como-funciona-la-web-http": {
        "id": 447,
        "module_id": 177,
        "title": "Cómo funciona la web: HTTP",
        "slug": "como-funciona-la-web-http",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo funciona la web: HTTP"
                },
                {
                    "type": "paragraph",
                    "text": "Cuando escribes una dirección en el navegador, se produce una petición HTTP hacia un servidor, que responde con un documento. HTTP es el protocolo de comunicación entre cliente y servidor en la web."
                },
                {
                    "type": "paragraph",
                    "text": "Cada petición tiene un método (GET para leer, POST para enviar datos), una URL, cabeceras y opcionalmente un cuerpo. La respuesta incluye un código de estado: 200 éxito, 404 no encontrado, 500 error del servidor."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Ver las cabeceras de una petición real\ncurl -I https://example.com\n\n# Resultado típico\n# HTTP/2 200\n# content-type: text/html; charset=UTF-8"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cliente: navegador o app que solicita recursos",
                        "Servidor: máquina que aloja y sirve los recursos",
                        "Métodos: GET lee, POST crea, PUT actualiza, DELETE borra",
                        "Códigos 2xx éxito, 3xx redirección, 4xx error cliente, 5xx error servidor"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "No necesitas memorizar todo HTTP para empezar, pero entender el ciclo petición-respuesta te ahorra horas de confusión cuando algo no carga o una API no responde."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "HTTP es el idioma entre navegador y servidor",
                        "Cada petición declara método, URL y cabeceras",
                        "Los códigos de estado resumen el resultado",
                        "El ciclo petición-respuesta está en cada carga de página"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 177,
            "title": "Cómo Funciona la Web",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "dns-y-urls": {
        "id": 448,
        "module_id": 177,
        "title": "DNS y URLs",
        "slug": "dns-y-urls",
        "type": "article",
        "duration_minutes": 10,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "DNS y URLs"
                },
                {
                    "type": "paragraph",
                    "text": "Las personas recordamos nombres como ejemplo.com; las máquinas usan direcciones IP. El DNS (Domain Name System) traduce unos a otras, como una agenda telefónica de internet."
                },
                {
                    "type": "paragraph",
                    "text": "Una URL tiene partes: protocolo, dominio, puerto (opcional), ruta y parámetros. Cada parte indica al servidor qué pedir y cómo."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Ver la IP de un dominio (consulta DNS)\ndig ejemplo.com +short\n# Ejemplo de salida: 93.184.216.34"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Anatomía de una URL"
                },
                {
                    "type": "list",
                    "items": [
                        "https:// protocolo de comunicación",
                        "ejemplo.com dominio legible por humanos",
                        "/ruta recurso dentro del sitio",
                        "?clave=valor parámetros de la petición"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando el DNS falla, el navegador no puede encontrar el servidor y muestra un error de resolución. Es un diagnóstico distinto a un 404: el dominio no se traduce vs. el recurso no existe."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El DNS traduce nombres de dominio a IP",
                        "Una URL combina protocolo, dominio, ruta y parámetros",
                        "La ruta indica qué recurso pedir",
                        "Errores de DNS y 404 son problemas distintos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 177,
            "title": "Cómo Funciona la Web",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "navegadores-y-herramientas": {
        "id": 449,
        "module_id": 177,
        "title": "Navegadores y herramientas de desarrollo",
        "slug": "navegadores-y-herramientas",
        "type": "article",
        "duration_minutes": 8,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Navegadores y herramientas de desarrollo"
                },
                {
                    "type": "paragraph",
                    "text": "El navegador renderiza HTML, aplica CSS y ejecuta JavaScript. Las DevTools integradas son el mejor amigo del desarrollador: inspeccionan el DOM, los estilos, la red y la consola."
                },
                {
                    "type": "paragraph",
                    "text": "Desde DevTools puedes ver cada petición de red, su estado y su tiempo, probar CSS en vivo y depurar JavaScript con puntos de interrupción."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Herramientas imprescindibles para empezar\n# 1. DevTools del navegador (F12)\n# 2. Editor de código (VS Code, etc.)\n# 3. Servidor local para desarrollo\nphp -S localhost:8000"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo de trabajo básico"
                },
                {
                    "type": "list",
                    "items": [
                        "Escribe el código en un editor",
                        "Recarga la página para ver los cambios",
                        "Inspecciona el resultado con DevTools",
                        "Itera: cambia, recarga, verifica"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Domina primero la pestaña Elements y la consola: ahí verás la estructura real renderizada y los errores de JavaScript con su línea exacta."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "DevTools inspecciona DOM, red, estilos y consola",
                        "La consola muestra errores de JavaScript con archivo y línea",
                        "El ciclo editar-recargar-inspeccionar es el pan de cada día",
                        "Un servidor local evita abrir los archivos con file://"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 177,
            "title": "Cómo Funciona la Web",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "estructura-basica-html": {
        "id": 450,
        "module_id": 178,
        "title": "Estructura básica de HTML",
        "slug": "estructura-basica-html",
        "type": "code_challenge",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estructura básica de HTML"
                },
                {
                    "type": "paragraph",
                    "text": "HTML no es un lenguaje de programación: es un lenguaje de marcado que estructura el contenido con etiquetas. El navegador lee esas etiquetas y muestra el contenido con su jerarquía."
                },
                {
                    "type": "paragraph",
                    "text": "Todo documento comienza con el doctype, la etiqueta html, y dentro head (metadatos) y body (contenido visible). Las etiquetas se abren y se cierran, anidando los elementos."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Mi primera página</title>\n</head>\n<body>\n    <h1>Hola, mundo</h1>\n    <p>Este es mi primer párrafo.</p>\n</body>\n</html>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas del marcado"
                },
                {
                    "type": "list",
                    "items": [
                        "Cada etiqueta se abre <p> y se cierra </p>",
                        "Los elementos se anidan sin cruzarse",
                        "El atributo lang declara el idioma de la página",
                        "head lleva metadatos; body lleva el contenido visible"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un HTML válido y bien anidado es más fácil de estilizar, de leer y de mantener. Los validadores automáticos ayudan a encontrar errores estructurales."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "HTML estructura, no programa",
                        "doctype, html, head y body forman la base",
                        "Las etiquetas se abren y cierran anidadas",
                        "head para metadatos, body para contenido"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 178,
            "title": "HTML: el Esqueleto",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "etiquetas-y-contenido": {
        "id": 451,
        "module_id": 178,
        "title": "Etiquetas de contenido",
        "slug": "etiquetas-y-contenido",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Etiquetas de contenido"
                },
                {
                    "type": "paragraph",
                    "text": "HTML ofrece etiquetas para cada tipo de contenido: títulos, párrafos, listas, enlaces, imágenes y tablas. Elegir la correcta comunica significado y mejora la accesibilidad."
                },
                {
                    "type": "paragraph",
                    "text": "Los títulos van de h1 a h6 en orden jerárquico; las listas pueden ser ordenadas (ol) o no (ul); los enlaces usan a con href y las imágenes img con src y alt."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<h1>Título principal</h1>\n<p>Texto con un <a href=\"https://example.com\">enlace</a>.</p>\n\n<ul>\n    <li>Primer elemento</li>\n    <li>Segundo elemento</li>\n</ul>\n\n<img src=\"foto.jpg\" alt=\"Descripción de la foto\">"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Usa un solo h1 por página",
                        "El alt de las imágenes describe su contenido",
                        "Los enlaces llevan texto que explique su destino",
                        "Las listas solo para listas, no para maquetar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El HTML semántico no solo le gusta a los navegadores: los motores de búsqueda y los lectores de pantalla dependen de él para entender la página."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cada etiqueta aporta un significado",
                        "h1 a h6 organizan la jerarquía de títulos",
                        "ul/ol listas, a enlaces, img imágenes",
                        "El alt describe imágenes para quien no puede verlas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 178,
            "title": "HTML: el Esqueleto",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "formularios-html": {
        "id": 452,
        "module_id": 178,
        "title": "Formularios HTML",
        "slug": "formularios-html",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Formularios HTML"
                },
                {
                    "type": "paragraph",
                    "text": "Los formularios son la puerta de entrada de datos del usuario: textos, correos, contraseñas, selecciones y botones. La etiqueta form los agrupa y define a dónde van los datos."
                },
                {
                    "type": "paragraph",
                    "text": "Cada campo lleva name, que es la clave con la que viaja su valor. El atributo required marca campos obligatorios y los tipos de input validan el formato de forma nativa."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<form action=\"/registro\" method=\"POST\">\n    <label for=\"nombre\">Nombre:</label>\n    <input type=\"text\" id=\"nombre\" name=\"nombre\" required>\n\n    <label for=\"email\">Correo:</label>\n    <input type=\"email\" id=\"email\" name=\"email\" required>\n\n    <button type=\"submit\">Registrarme</button>\n</form>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Campos frecuentes"
                },
                {
                    "type": "list",
                    "items": [
                        "input type=text, email, password, number",
                        "select con opciones para elegir de una lista",
                        "textarea para texto largo",
                        "checkbox y radio para opciones múltiples o exclusivas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los labels asociados con for hacen clicable el texto y mejoran la accesibilidad. La validación nativa del navegador es una primera barrera, pero el servidor siempre debe validar de nuevo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "form define el contenedor y el destino de los datos",
                        "name es la clave con la que viaja cada valor",
                        "Los tipos de input validan el formato en el cliente",
                        "label + for conecta el texto con su campo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 178,
            "title": "HTML: el Esqueleto",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "primeros-estilos-css": {
        "id": 453,
        "module_id": 179,
        "title": "Primeros estilos con CSS",
        "slug": "primeros-estilos-css",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Primeros estilos con CSS"
                },
                {
                    "type": "paragraph",
                    "text": "CSS da estilo al HTML: colores, fuentes, márgenes y disposición. Se escribe con reglas formadas por un selector, propiedades y valores, y se aplica con la etiqueta link o la regla style."
                },
                {
                    "type": "paragraph",
                    "text": "Una regla puede apuntar a etiquetas (p), clases (.tarjeta) o ids (#header). Las clases son lo más reutilizable y se usan en la mayoría de los proyectos."
                },
                {
                    "type": "code",
                    "language": "css",
                    "text": "body {\n    font-family: system-ui, sans-serif;\n    margin: 0;\n    background: #f5f5f5;\n}\n\n.tarjeta {\n    background: white;\n    border-radius: 8px;\n    padding: 16px;\n    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);\n}\n\nh1 { color: #1a1a1a; }"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Selector y cascada"
                },
                {
                    "type": "list",
                    "items": [
                        "Etiquetas: p { ... } afecta a todos los p",
                        "Clases: .tarjeta { ... } afecta a class=tarjeta",
                        "Ids: #header { ... } afecta al id header",
                        "La cascada resuelve qué regla gana cuando hay conflictos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La especificidad decide cuál regla manda: los id ganan a las clases, y las clases a las etiquetas. Entenderla evita el clásico \"por qué no se aplica mi estilo\"."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "CSS es reglas de selector + propiedades",
                        "Las clases son el selector más reutilizable",
                        "La cascada y la especificidad deciden qué gana",
                        "Siempre piensa en móvil y escritorio"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 179,
            "title": "CSS y JavaScript",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "introduccion-a-javascript": {
        "id": 454,
        "module_id": 179,
        "title": "Introducción a JavaScript",
        "slug": "introduccion-a-javascript",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Introducción a JavaScript"
                },
                {
                    "type": "paragraph",
                    "text": "JavaScript es el lenguaje de la web: da interactividad a las páginas, se ejecuta en el navegador y también en servidores con Node.js. Sin él, la web sería solo documentos estáticos."
                },
                {
                    "type": "paragraph",
                    "text": "El lenguaje tiene variables, funciones, condicionales y ciclos como cualquier otro, más un superpoder: acceder y modificar el DOM, el modelo del documento."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Variables y función\nconst saludo = (nombre) => {\n    return `Hola, ${nombre}`;\n};\n\nconsole.log(saludo(\"Ana\"));"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos básicos"
                },
                {
                    "type": "list",
                    "items": [
                        "const declara constantes; let variables",
                        "Las funciones encapsulan lógica reutilizable",
                        "console.log imprime en la consola para depurar",
                        "Los eventos conectan el código con las acciones del usuario"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Empieza escribiendo pequeños scripts en la consola del navegador: declara variables, prueba funciones y observa los resultados. La retroalimentación inmediata acelera el aprendizaje."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "JavaScript da interactividad a la web",
                        "Corre en navegadores y en Node.js",
                        "const y let declaran valores",
                        "El DOM es su puente hacia la página"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 179,
            "title": "CSS y JavaScript",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "poo-constructores": {
        "id": 470,
        "module_id": 185,
        "title": "Constructores y formas de crear objetos",
        "slug": "poo-constructores",
        "type": "article",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El constructor"
                },
                {
                    "type": "paragraph",
                    "text": "En Python el metodo __init__ se ejecuta automaticamente al crear el objeto con la sintaxis Clase(...). Es el lugar correcto para validar y transformar los datos de entrada."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "class Producto:\n    def __init__(self, nombre, precio, stock=0):\n        if precio < 0:\n            raise ValueError(\"El precio no puede ser negativo\")\n        self.nombre = nombre\n        self.precio = precio\n        self.stock = stock\n\n# Con valor por defecto\np1 = Producto(\"Teclado\", 45.90)\n# Indicando el valor\np2 = Producto(\"Raton\", 19.90, stock=12)"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "classmethod ystaticmethod"
                },
                {
                    "type": "paragraph",
                    "text": "Un metodo de instancia recibe self y trabaja con un objeto concreto. Un classmethod recibe cls y sirve para constructores alternativos. Un staticmethod no recibe nada y agrupa utilidades relacionadas con la clase."
                },
                {
                    "type": "list",
                    "items": [
                        "__init__: inicializa cada instancia",
                        "@classmethod: metodos alternativos que crean objetos (parsear, factory)",
                        "@staticmethod: funciones auxiliares sin dependencia del estado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 185,
            "title": "Constructores y múltiples formas de crear objetos",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "primer-proyecto-web": {
        "id": 455,
        "module_id": 179,
        "title": "Tu primer proyecto web",
        "slug": "primer-proyecto-web",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tu primer proyecto web"
                },
                {
                    "type": "paragraph",
                    "text": "Es hora de unir todo: una página HTML con estilos CSS y un toque de JavaScript. Construye una tarjeta de presentación personal: estructura, estilo e interacción en un solo archivo."
                },
                {
                    "type": "paragraph",
                    "text": "El objetivo no es la perfección, sino cerrar el ciclo completo: marcar contenido, darle estilo y añadir un comportamiento con eventos."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n    <meta charset=\"UTF-8\">\n    <title>Mi tarjeta</title>\n    <style>\n        body { font-family: system-ui; background: #eef2f7; display: grid; place-items: center; height: 100vh; }\n        .tarjeta { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,.1); text-align: center; }\n        button { padding: 10px 18px; border: 0; border-radius: 8px; background: #2563eb; color: white; cursor: pointer; }\n    </style>\n</head>\n<body>\n    <div class=\"tarjeta\">\n        <h1 id=\"titulo\">Hola, soy Ana</h1>\n        <p id=\"mensaje\">Aprendo desarrollo web.</p>\n        <button id=\"boton\">Cambiar mensaje</button>\n    </div>\n    <script>\n        const boton = document.getElementById(\"boton\");\n        const mensaje = document.getElementById(\"mensaje\");\n        boton.addEventListener(\"click\", () => {\n            mensaje.textContent = \"¡Ya sé HTML, CSS y JavaScript!\";\n        });\n    </script>\n</body>\n</html>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué revisar al finalizar"
                },
                {
                    "type": "list",
                    "items": [
                        "La estructura es semántica y válida",
                        "Los estilos se aplican por clases o etiquetas",
                        "El botón cambia el mensaje al hacer click",
                        "La página funciona en móvil y escritorio"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Guarda el archivo, ábrelo con un servidor local y experimenta: cambia colores, añade otra interacción. Cada iteración refuerza el aprendizaje."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "HTML estructura, CSS estiliza, JS interactúa",
                        "getElementById conecta el código con elementos",
                        "addEventListener reacciona a las acciones del usuario",
                        "Proyectos pequeños y completos enseñan más que teoría aislada"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 179,
            "title": "CSS y JavaScript",
            "course_id": 4,
            "course_slug": "intro-desarrollo-web",
            "course_title": "Introducción al Desarrollo Web",
            "course": {
                "id": 4,
                "slug": "intro-desarrollo-web",
                "title": "Introducción al Desarrollo Web"
            }
        }
    },
    "estructura-de-una-pagina-html": {
        "id": 22,
        "module_id": 10,
        "title": "Estructura semántica de una página HTML",
        "slug": "estructura-de-una-pagina-html",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estructura semántica de una página HTML"
                },
                {
                    "type": "paragraph",
                    "text": "HTML describe la estructura: header, nav, main, section, article y footer son etiquetas semánticas que comunican significado a navegadores y lectores de pantalla."
                },
                {
                    "type": "paragraph",
                    "text": "Una buena estructura mejora la accesibilidad, el SEO y el mantenimiento del código, y evita el uso excesivo de divs genéricos."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<body>\n  <header>\n    <nav>\n      <ul>\n        <li><a href=\"/\">Inicio</a></li>\n        <li><a href=\"/blog\">Blog</a></li>\n      </ul>\n    </nav>\n  </header>\n  <main>\n    <article>\n      <h1>Semántica web</h1>\n      <p>El contenido principal vive aquí.</p>\n    </article>\n  </main>\n  <footer>© 2026</footer>\n</body>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Etiquetas semánticas más usadas"
                },
                {
                    "type": "list",
                    "items": [
                        "header: cabecera de página o sección",
                        "nav: navegación principal",
                        "main: contenido único y principal",
                        "article y section: unidades de contenido",
                        "footer: pie de página"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando una etiqueta semántica describe el contenido, el navegador y las tecnologías de asistencia saben qué esperar. Los divs quedan para agrupar sin significado, solo cuando no hay alternativa."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La semántica comunica significado",
                        "main contiene el contenido principal",
                        "nav marca la navegación",
                        "Menos divs y más etiquetas descriptivas = mejor página"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 10,
            "title": "HTML Semántico",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "etiquetas-semanticas-y-accesibilidad": {
        "id": 456,
        "module_id": 10,
        "title": "Etiquetas semánticas y accesibilidad",
        "slug": "etiquetas-semanticas-y-accesibilidad",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Etiquetas semánticas y accesibilidad"
                },
                {
                    "type": "paragraph",
                    "text": "La accesibilidad comienza en el HTML: encabezados jerárquicos, textos de enlace descriptivos, alternativas para imágenes y formularios con labels. Son decisiones de marcado, no de diseño."
                },
                {
                    "type": "paragraph",
                    "text": "Los lectores de pantalla navegan por encabezados, listas y landmarks. Si tu estructura es semántica, quien no puede ver la pantalla entiende igualmente la página."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<nav aria-label=\"Principal\">\n  <ul>\n    <li><a href=\"/\">Inicio</a></li>\n    <li><a href=\"/precios\">Ver precios</a></li>\n  </ul>\n</nav>\n\n<label for=\"ciudad\">Ciudad:</label>\n<input id=\"ciudad\" name=\"ciudad\" type=\"text\">"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cheat list accesible"
                },
                {
                    "type": "list",
                    "items": [
                        "Un solo h1 y jerarquía sin saltos",
                        "Texto de enlace que describe el destino",
                        "alt descriptivo en cada imagen",
                        "label asociado a cada campo de formulario"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla de oro: si la información solo se entiende por el color, la forma o el sonido, estás dejando fuera a usuarios. El HTML semántico es la primera línea de defensa."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La accesibilidad empieza en el marcado",
                        "Los encabezados jerárquicos guían la navegación",
                        "Los labels conectan texto y campos",
                        "El alt da sentido a las imágenes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 10,
            "title": "HTML Semántico",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "formularios-y-media": {
        "id": 457,
        "module_id": 10,
        "title": "Formularios y contenido multimedia",
        "slug": "formularios-y-media",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Formularios y contenido multimedia"
                },
                {
                    "type": "paragraph",
                    "text": "Los formularios recogen datos del usuario con campos tipados (texto, correo, número, fecha) y el contenido multimedia se incorpora con img, video y audio, siempre con alternativas accesibles."
                },
                {
                    "type": "paragraph",
                    "text": "Cada campo debe tener label, y cada recurso multimedia, un texto o pista alternativa: alt en imágenes, track de subtítulos en vídeos."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<form>\n  <label for=\"email\">Correo:</label>\n  <input type=\"email\" id=\"email\" name=\"email\" required>\n\n  <label for=\"nacimiento\">Fecha de nacimiento:</label>\n  <input type=\"date\" id=\"nacimiento\" name=\"nacimiento\">\n\n  <fieldset>\n    <legend>Intereses</legend>\n    <label><input type=\"checkbox\" name=\"interes\" value=\"css\"> CSS</label>\n    <label><input type=\"checkbox\" name=\"interes\" value=\"js\"> JavaScript</label>\n  </fieldset>\n</form>\n\n<video controls>\n  <source src=\"intro.mp4\" type=\"video/mp4\">\n  <track kind=\"subtitles\" src=\"intro.vtt\" srclang=\"es\" label=\"Español\">\n</video>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Usa el type correcto: email, url, date, number",
                        "Agrupa opciones relacionadas con fieldset y legend",
                        "Añade subtítulos y descripción a los medios",
                        "Valida en el cliente, pero confirma en el servidor"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los tipos de input modernos dan teclados y validaciones adecuadas en móvil casi gratis. Aprovéchalos antes de escribir JavaScript de validación."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los tipos de input aportan validación nativa",
                        "fieldset agrupa opciones relacionadas",
                        "Los medios necesitan alternativas accesibles",
                        "La validación del cliente nunca es la última barrera"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 10,
            "title": "HTML Semántico",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "poo-ejercicio-validacion": {
        "id": 471,
        "module_id": 185,
        "title": "Ejercicio: valida en el constructor",
        "slug": "poo-ejercicio-validacion",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea la clase Producto con __init__(nombre, precio, stock=0)\n# que lance ValueError si el precio es negativo.\n# Añade el metodo valor_total() que devuelva precio * stock\n\n",
        "solution": "class Producto:\n    def __init__(self, nombre, precio, stock=0):\n        if precio < 0:\n            raise ValueError(\"precio negativo\")\n        self.nombre = nombre\n        self.precio = precio\n        self.stock = stock\n\n    def valor_total(self):\n        return self.precio * self.stock",
        "test_cases": [
            [
                "str(Producto(\"Teclado\", 45.9, 3).valor_total())",
                "137.7"
            ],
            [
                "Producto(\"X\", -1)",
                "error:precio negativo"
            ]
        ],
        "hint": "Usa \"if ...: raise ValueError(...)\" dentro de __init__ antes de asignar.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 185,
            "title": "Constructores y múltiples formas de crear objetos",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "css-flexbox-y-grid": {
        "id": 23,
        "module_id": 180,
        "title": "Flexbox y Grid: maquetación moderna",
        "slug": "css-flexbox-y-grid",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flexbox y Grid: maquetación moderna"
                },
                {
                    "type": "paragraph",
                    "text": "Flexbox organiza elementos en una dimensión (fila o columna) y Grid en dos dimensiones (filas y columnas). Con display:flex y display:grid se resuelven la mayoría de los layouts sin floats ni trucos."
                },
                {
                    "type": "paragraph",
                    "text": "La clave está en dominar los ejes: en Flexbox, justify-content alinea en el eje principal y align-items en el secundario; en Grid, grid-template-columns define la plantilla."
                },
                {
                    "type": "code",
                    "language": "css",
                    "text": "/* Centrar vertical y horizontalmente */\n.contenedor {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    height: 100vh;\n}\n\n/* Rejilla de tres columnas */\n.galeria {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 16px;\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar cada uno"
                },
                {
                    "type": "list",
                    "items": [
                        "Flexbox: alinear una fila o columna de elementos",
                        "Grid: layouts en dos dimensiones con plantilla",
                        "gap separa elementos sin márgenes extra",
                        "Combinar ambos da layouts potentes y limpios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Una regla práctica: usa Grid para la estructura general de la página y Flexbox para alinear elementos dentro de un bloque. Pero ambos son flexibles y se solapan."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Flexbox: 1D; Grid: 2D",
                        "justify-content y align-items alinean en flex",
                        "grid-template-columns define las columnas",
                        "gap sustituye a los márgenes entre elementos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 180,
            "title": "Layout con CSS",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "colores-tipografia-y-box-model": {
        "id": 458,
        "module_id": 180,
        "title": "Colores, tipografía y modelo de caja",
        "slug": "colores-tipografia-y-box-model",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Colores, tipografía y modelo de caja"
                },
                {
                    "type": "paragraph",
                    "text": "El modelo de caja explica cómo se calcula el tamaño de cada elemento: contenido, padding, borde y margen. Sin entenderlo, los layouts se rompen sin explicación aparente."
                },
                {
                    "type": "paragraph",
                    "text": "Con box-sizing: border-box el ancho declarado incluye padding y borde, lo que hace los tamaños predecibles. La tipografía y el color definen la personalidad visual y la legibilidad."
                },
                {
                    "type": "code",
                    "language": "css",
                    "text": "* { box-sizing: border-box; }\n\n.tarjeta {\n    width: 300px;\n    padding: 16px;       /* dentro del borde */\n    border: 1px solid #ddd;\n    margin: 12px;        /* fuera del borde */\n    font-family: system-ui, sans-serif;\n    line-height: 1.5;\n    color: #1a1a1a;\n    background: #ffffff;\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Partes de la caja"
                },
                {
                    "type": "list",
                    "items": [
                        "content: el contenido real",
                        "padding: espacio interno alrededor del contenido",
                        "border: el borde visible",
                        "margin: separación externa entre cajas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Una buena base tipográfica usa tamaños relativos (rem) y un line-height cómodo. Los colores con contraste suficiente garantizan que el texto se lea en cualquier pantalla."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La caja = content + padding + border + margin",
                        "box-sizing: border-box simplifica los tamaños",
                        "Margen externo, padding interno",
                        "Contraste y legibilidad definen la calidad visual"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 180,
            "title": "Layout con CSS",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "responsive-design": {
        "id": 459,
        "module_id": 180,
        "title": "Diseño responsive",
        "slug": "responsive-design",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diseño responsive"
                },
                {
                    "type": "paragraph",
                    "text": "El diseño responsive adapta la página a cualquier pantalla: móvil, tableta o escritorio. Se construye con unidades flexibles, media queries y layouts que fluyen en vez de fijarse."
                },
                {
                    "type": "paragraph",
                    "text": "La estrategia mobile-first escribe primero los estilos del móvil y añade reglas para pantallas mayores con min-width. Es más simple y cubre el caso más restringido."
                },
                {
                    "type": "code",
                    "language": "css",
                    "text": "/* Mobile-first: base para móvil */\n.grid {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 12px;\n}\n\n/* A partir de 768px: dos columnas */\n@media (min-width: 768px) {\n    .grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n/* A partir de 1024px: tres columnas */\n@media (min-width: 1024px) {\n    .grid { grid-template-columns: repeat(3, 1fr); }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Principios responsive"
                },
                {
                    "type": "list",
                    "items": [
                        "Layouts fluidos con %, fr o flex",
                        "Media queries con min-width escalonadas",
                        "Imágenes con max-width: 100%",
                        "Probar en tamaños reales, no solo en teoría"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El enfoque mobile-first obliga a decidir qué es esencial y evita diseñar para un escritorio y después encoger. Prueba siempre con las DevTools en modo dispositivo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Responsive = adaptarse a cada pantalla",
                        "Mobile-first escribe primero para móvil",
                        "Las media queries ajustan el layout por tamaño",
                        "Las imágenes fluidas nunca desbordan"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 180,
            "title": "Layout con CSS",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "javascript-dom-y-eventos": {
        "id": 24,
        "module_id": 181,
        "title": "JavaScript: el DOM y los eventos",
        "slug": "javascript-dom-y-eventos",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "JavaScript: el DOM y los eventos"
                },
                {
                    "type": "paragraph",
                    "text": "JavaScript da interactividad: selecciona elementos con querySelector, escucha eventos con addEventListener y modifica el DOM. Entender el flujo de eventos (captura y burbuja) evita bugs sutiles."
                },
                {
                    "type": "paragraph",
                    "text": "Los eventos viajan desde el documento hasta el elemento (captura) y vuelven hacia arriba (burbuja). Saberlo explica por qué a veces un clic dispara varios handlers."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "const boton = document.querySelector(\"#enviar\");\nconst lista = document.querySelector(\"#tareas\");\n\nboton.addEventListener(\"click\", (evento) => {\n    evento.preventDefault();\n    const item = document.createElement(\"li\");\n    item.textContent = \"Nueva tarea\";\n    lista.appendChild(item);\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Operaciones DOM frecuentes"
                },
                {
                    "type": "list",
                    "items": [
                        "querySelector / querySelectorAll para seleccionar",
                        "addEventListener para reaccionar",
                        "createElement + appendChild para crear nodos",
                        "textContent y classList para modificar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La manipulación directa del DOM es la base; después conocerás frameworks que lo automatizan. Pero el DOM puro te da el conocimiento fundamental que cualquier framework asume."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "querySelector selecciona elementos por selector CSS",
                        "addEventListener conecta eventos con funciones",
                        "El flujo de eventos tiene captura y burbuja",
                        "Crear y añadir nodos construye interfaces dinámicas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 181,
            "title": "JavaScript y el DOM",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "manipulando-el-dom": {
        "id": 460,
        "module_id": 181,
        "title": "Manipulando el DOM en la práctica",
        "slug": "manipulando-el-dom",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Manipulando el DOM en la práctica"
                },
                {
                    "type": "paragraph",
                    "text": "Construir una lista dinámica ejercita lo esencial: leer un input, crear un elemento, añadirlo y actualizar contadores. Es el patrón que repiten las aplicaciones reales."
                },
                {
                    "type": "paragraph",
                    "text": "Además de añadir nodos, aprenderás a borrarlos y a alternar clases CSS, dos operaciones que aparecen en casi todas las interfaces."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "const input = document.querySelector(\"#tarea\");\nconst boton = document.querySelector(\"#agregar\");\nconst lista = document.querySelector(\"#lista\");\nconst contador = document.querySelector(\"#total\");\n\nboton.addEventListener(\"click\", () => {\n    const texto = input.value.trim();\n    if (!texto) return;\n\n    const li = document.createElement(\"li\");\n    li.textContent = texto;\n\n    li.addEventListener(\"click\", () => {\n        li.classList.toggle(\"hecha\");\n    });\n\n    lista.appendChild(li);\n    contador.textContent = lista.children.length;\n    input.value = \"\";\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Patrón crear-añadir-actualizar"
                },
                {
                    "type": "list",
                    "items": [
                        "Leer y limpiar la entrada (trim)",
                        "Crear el nodo con createElement",
                        "Asignar contenido y comportamiento",
                        "Añadirlo y actualizar el estado visible"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La separación entre datos y presentación llegará con frameworks; por ahora, que cada acción del usuario actualice de forma coherente lo que se ve en pantalla."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "trim limpia la entrada antes de procesar",
                        "createElement y appendChild construyen la lista",
                        "classList.toggle alterna clases sin tocar otras",
                        "Actualizar contadores mantiene la UI coherente"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 181,
            "title": "JavaScript y el DOM",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "proyecto-interactivo": {
        "id": 461,
        "module_id": 181,
        "title": "Proyecto: galería interactiva",
        "slug": "proyecto-interactivo",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Proyecto: galería interactiva"
                },
                {
                    "type": "paragraph",
                    "text": "Cierra el curso con una mini galería: una cuadrícula de tarjetas que se filtra al hacer clic en botones. Combinará HTML semántico, Grid responsive y eventos de JavaScript."
                },
                {
                    "type": "paragraph",
                    "text": "Los datos de las tarjetas viven en un array de JavaScript; al filtrar, se regenera la lista visible. Así practicas separar los datos de la presentación."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "const proyectos = [\n    { nombre: \"Portafolio\", categoria: \"web\" },\n    { nombre: \"Dashboard\", categoria: \"app\" },\n    { nombre: \"Blog\", categoria: \"web\" },\n];\n\nfunction renderizar(filtro = \"todos\") {\n    const contenedor = document.querySelector(\"#galeria\");\n    contenedor.innerHTML = \"\";\n\n    proyectos\n        .filter((p) => filtro === \"todos\" || p.categoria === filtro)\n        .forEach((p) => {\n            const tarjeta = document.createElement(\"div\");\n            tarjeta.className = \"tarjeta\";\n            tarjeta.textContent = p.nombre;\n            contenedor.appendChild(tarjeta);\n        });\n}\n\ndocument.querySelectorAll(\"[data-filtro]\").forEach((boton) => {\n    boton.addEventListener(\"click\", () => renderizar(boton.dataset.filtro));\n});\n\nrenderizar();"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué incorpora el proyecto"
                },
                {
                    "type": "list",
                    "items": [
                        "Semántica HTML con section y nav",
                        "Grid responsive con media queries",
                        "Datos en arrays y renderizado dinámico",
                        "Filtros con dataset y events"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Al terminar, tendrás una pieza completa que demuestra los tres pilares trabajando juntos. Refinarla con estilos propios es la mejor forma de consolidar el aprendizaje."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los datos separados del DOM permiten filtrar y ordenar",
                        "dataset.read attributes data-* de forma sencilla",
                        "Regenerar la lista es un patrón de renderizado válido",
                        "Los proyectos pequeños validan el dominio del trío"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 181,
            "title": "JavaScript y el DOM",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "contenedores-en-practica": {
        "id": 531,
        "module_id": 207,
        "title": "Ciclo de vida de contenedores en la práctica",
        "slug": "contenedores-en-practica",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ciclo de vida de contenedores en la práctica"
                },
                {
                    "type": "paragraph",
                    "text": "Docker gestiona el ciclo de vida completo: crear, iniciar, pausar, detener y eliminar contenedores. Aprender los comandos y sus diferencias evita sorpresas: detener un contenedor conserva su estado; eliminarlo borra sus capas de escritura y, sin volumen, sus datos."
                },
                {
                    "type": "paragraph",
                    "text": "Para depurar, docker logs muestra la salida del proceso y docker exec permite entrar en un contenedor en marcha. Los nombres y etiquetas ordenan el caos cuando tienes decenas de contenedores."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "docker build -t mi-app:1.0.0 .       # construir\ndocker run -d -p 8080:80 --name web mi-app:1.0.0\ndocker ps                           # contenedores activos\ndocker ps -a                        # incluye detenidos\ndocker logs -f web                  # seguir los logs\ndocker exec -it web sh              # entrar al contenedor\ndocker stop web && docker rm web    # detener y eliminar\ndocker system prune -f              # limpiar recursos huérfanos"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Mapear conceptos"
                },
                {
                    "type": "list",
                    "items": [
                        "docker build crea la imagen",
                        "docker run crea y arranca el contenedor",
                        "docker ps -a lista todos, incluso parados",
                        "docker exec entra a un contenedor corriendo",
                        "docker logs sigue la salida del proceso"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En el día a día usarás poco docker run directo: Compose lo envuelve. Pero entenderlo a fondo te permite leer logs, diagnosticar puertos en conflicto y responder con calma cuando algo no arranca. La depuración empieza por los logs y el estado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "stop conserva el contenedor; rm lo elimina",
                        "Sin volúmenes, los datos mueren con el contenedor",
                        "docker logs -f es tu primera herramienta de depuración",
                        "docker system prune limpia recursos huérfanos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 207,
            "title": "Flujo de trabajo con Docker",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "redes-y-volumenes": {
        "id": 532,
        "module_id": 207,
        "title": "Redes y volúmenes entre contenedores",
        "slug": "redes-y-volumenes",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Redes y volúmenes entre contenedores"
                },
                {
                    "type": "paragraph",
                    "text": "En Docker, cada contenedor vive en una red virtual. Los contenedores de una misma red se encuentran por nombre de servicio, sin necesidad de IPs fijas; los puertos solo se publican al host cuando hace falta, con la sintaxis host:contenedor."
                },
                {
                    "type": "paragraph",
                    "text": "Los volúmenes desacoplan los datos del ciclo de vida del contenedor: la base de datos escribe en un volumen y sobrevive a reinicios y recreaciones. Un bind mount, en cambio, conecta un directorio del host para desarrollo con recarga en caliente."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "services:\n  api:\n    build: .\n    networks: [appnet]\n    volumes:\n      - ./src:/app          # bind mount para desarrollo\n    depends_on:\n      - db\n  db:\n    image: postgres:16-alpine\n    networks: [appnet]\n    volumes:\n      - dbdata:/var/lib/postgresql/data\nnetworks:\n  appnet:\nvolumes:\n  dbdata:"
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Diagnóstico de red entre contenedores\ndocker compose exec api ping db\ndocker network inspect appnet"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos de red y datos"
                },
                {
                    "type": "list",
                    "items": [
                        "Red bridge por defecto para contenedores locales",
                        "DNS interno: los servicios se llaman por su nombre",
                        "Publicar puertos con \"host:contenedor\"",
                        "Volumen nombrado: datos persistentes",
                        "Bind mount: directorio compartido con el host"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El patrón típico: la API se conecta a db por el nombre de servicio; el navegador del usuario llega por el puerto publicado. Si un contenedor no encuentra a otro, revisa que compartan red y que el nombre de servicio sea exacto."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El DNS interno resuelve nombres de servicio",
                        "Publica solo los puertos que deben ser accesibles",
                        "Volúmenes nombrados para datos que deben persistir",
                        "Bind mounts para desarrollo con recarga en caliente"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 207,
            "title": "Flujo de trabajo con Docker",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "docker-en-produccion": {
        "id": 533,
        "module_id": 207,
        "title": "Docker en entornos de producción",
        "slug": "docker-en-produccion",
        "type": "article",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Docker en entornos de producción"
                },
                {
                    "type": "paragraph",
                    "text": "Producir con Docker va más allá de docker run: imágenes ligeras con usuario no root, secretos fuera de la imagen, healthchecks que el orquestador usa para decidir, y actualizaciones por nueva etiqueta sin perder datos."
                },
                {
                    "type": "paragraph",
                    "text": "Un contenedor productivo debe fallar ruidosamente, no esconderse: healthcheck indica si el proceso está sano; restart policies (unless-stopped, on-failure) recuperan caídas; y los límites de recursos (mem_limit, cpus) evitan que un contenedor devore el host."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "services:\n  app:\n    build: .\n    restart: unless-stopped\n    ports:\n      - \"8080:80\"\n    environment:\n      - APP_ENV=production        # secretos reales vía secret manager\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost/health\"]\n      interval: 30s\n      timeout: 5s\n      retries: 3\n    mem_limit: 512m\n    cpus: 1.0"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Checklist de producción"
                },
                {
                    "type": "list",
                    "items": [
                        "Usuario no root dentro del contenedor",
                        "Secretos por variables de entorno, nunca en la imagen",
                        "Healthcheck definido por servicio",
                        "Política de reinicio y límites de recursos",
                        "Logs a stdout para el agregador del host",
                        "Etiquetas de versión inmutables para rollback"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El healthcheck es la base: el orquestador (Docker, Kubernetes o tu plataforma cloud) reinicia contenedores no sanos. Si tu app expone /health, el despliegue sabe cuándo es seguro cortar el tráfico. Ese endpoint debe validar dependencias críticas sin fingir."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "No root, secretos externos y healthchecks",
                        "restart y límites de recursos protegen el host",
                        "El healthcheck decide la salud real del servicio",
                        "Etiquetas inmutables permiten rollback limpio"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 207,
            "title": "Flujo de trabajo con Docker",
            "course_id": 16,
            "course_slug": "docker-y-contenedores",
            "course_title": "Docker y contenedores",
            "course": {
                "id": 16,
                "slug": "docker-y-contenedores",
                "title": "Docker y contenedores"
            }
        }
    },
    "que-es-ci-cd": {
        "id": 42,
        "module_id": 19,
        "title": "Integración y despliegue continuos",
        "slug": "que-es-ci-cd",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Integración y despliegue continuos"
                },
                {
                    "type": "paragraph",
                    "text": "La integración continua (CI) ejecuta verificaciones de forma automática en cada cambio: tests, lint, análisis de tipos y build. El despliegue continuo (CD) lleva esos cambios validados a un entorno, idealmente producción, con el mismo pipeline."
                },
                {
                    "type": "paragraph",
                    "text": "El beneficio central es la detección temprana: un error que rompe la rama main se descubre minutos después del push, cuando el contexto está fresco, no en la víspera de una release. CI/CD convierte la calidad en un proceso, no en una ceremonia manual."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "# Flujo CI básico (esquema)\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - checkout\n      - instalar dependencias\n      - ejecutar tests\n      - subir reportes"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Piezas del pipeline"
                },
                {
                    "type": "list",
                    "items": [
                        "Evento: push, pull_request, schedule",
                        "Workflow: archivo YAML que define el pipeline",
                        "Job: conjunto de pasos en una misma máquina",
                        "Step: unidad mínima (instalar, test, deploy)",
                        "Artefacto: resultado que se conserva (cobertura, build)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "CI/CD no es solo velocidad: es confianza. Si cada cambio pasa por las mismas verificaciones, los despliegues dejan de ser momentos de miedo y se vuelven actos rutinarios. La automatización también documenta qué se verificó antes de cada release."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "CI verifica cada cambio automáticamente",
                        "CD despliega los cambios validados",
                        "Detección temprana = contexto fresco para corregir",
                        "Calidad como proceso automatizado, no manual"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 19,
            "title": "Pipelines",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "github-actions-en-practica": {
        "id": 43,
        "module_id": 19,
        "title": "GitHub Actions en la práctica",
        "slug": "github-actions-en-practica",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "GitHub Actions en la práctica"
                },
                {
                    "type": "paragraph",
                    "text": "GitHub Actions ejecuta workflows en respuesta a eventos del repositorio. Un workflow vive en .github/workflows, se dispara con on: push o pull_request y define jobs que corren en runners (máquinas efímeras Ubuntu, Windows o macOS)."
                },
                {
                    "type": "paragraph",
                    "text": "Cada job tiene steps; cada step usa una acción (un paso reutilizable publicado en marketplace) o un comando shell. Las acciones oficiales checkout, setup-node o upload-artifact forman la base de casi cualquier pipeline."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n          cache: npm\n      - run: npm ci\n      - run: npm test\n      - run: npm run build"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Sintaxis mínima"
                },
                {
                    "type": "list",
                    "items": [
                        "name: nombre visible del workflow",
                        "on: eventos que lo disparan",
                        "jobs: lista de trabajos",
                        "runs-on: sistema del runner",
                        "steps -> uses: acción reutilizable",
                        "steps -> run: comando directo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los cambios en el YAML se prueban con un push: el runner ejecuta el workflow y GitHub muestra cada step con su salida. Empieza simple (checkout + tests) y añade pasos solo cuando fallen: cada paso extra es tiempo de ejecución y superficie de fallo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Workflows en .github/workflows/*.yml",
                        "on define los disparadores",
                        "los jobs corren en runners efímeros",
                        "acciones del marketplace reutilizan pasos probados"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 19,
            "title": "Pipelines",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "workflows-y-jobs": {
        "id": 534,
        "module_id": 19,
        "title": "Workflows, jobs y steps en profundidad",
        "slug": "workflows-y-jobs",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Workflows, jobs y steps en profundidad"
                },
                {
                    "type": "paragraph",
                    "text": "Un workflow con varios jobs puede correrlos en paralelo o encadenarlos con needs: el job de despliegue espera a que termine el de tests. Las matrices (strategy.matrix) repiten un job con varias versiones, p. ej. Node 20 y 22, multiplicando cobertura sin duplicar YAML."
                },
                {
                    "type": "paragraph",
                    "text": "Los secretos van en Settings del repositorio y se referencian como ${{ secrets.NOMBRE }}; nunca se ven en los logs. Las variables (vars) sirven para configuración no sensible. Los caches (actions/cache) aceleran dependencias reutilizables."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "name: Pipeline completo\non:\n  push:\n    branches: [main]\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    strategy:\n      matrix:\n        node: [20, 22]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: ${{ matrix.node }}\n      - run: npm ci\n      - run: npm test\n        env:\n          API_KEY: ${{ secrets.API_KEY }}\n\n  deploy:\n    needs: test\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo \"Desplegando versión validada\""
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Controles útiles"
                },
                {
                    "type": "list",
                    "items": [
                        "needs: ordena jobs dependientes",
                        "strategy.matrix: repite con variaciones",
                        "secrets: credenciales cifradas por repo",
                        "env: variables por job o step",
                        "if: condiciones (solo main, solo etiqueta)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El pipeline completo se vuelve un contrato: nadie despliega sin que el job de tests haya pasado. Los logs de cada step son la evidencia. Si un job falla intermitentemente, revisa si es flakiness (lo verás en revisión) antes de aplazar el mecanismo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "needs crea dependencias entre jobs",
                        "Las matrices prueban varias versiones con un solo YAML",
                        "Secretos fuera del código, referenciados por nombre",
                        "if y env condicionan el comportamiento por job"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 19,
            "title": "Pipelines",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "casos-de-uso": {
        "id": 51,
        "module_id": 23,
        "title": "Casos de uso: actores y flujos",
        "slug": "casos-de-uso",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Casos de uso: actores y flujos"
                },
                {
                    "type": "paragraph",
                    "text": "Un caso de uso describe una interacción completa entre un actor y el sistema para lograr un objetivo: \"Inscribirse en un curso\" o \"Recuperar contraseña\". El actor no es un usuario concreto, sino un rol: Estudiante, Administrador, Pasarela de pago."
                },
                {
                    "type": "paragraph",
                    "text": "Cada caso de uso tiene un flujo principal (el camino feliz) y flujos alternativos (errores, excepciones, variantes). Documentar las alternativas es donde se esconden las reglas de negocio y los casos límite que rompen las demos."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "Caso de uso: Inscribirse en un curso\nActor: Estudiante autenticado\n\nFlujo principal:\n  1. El estudiante abre el curso.\n  2. El sistema muestra el botón Inscribirse.\n  3. El estudiante hace clic.\n  4. El sistema crea la matrícula.\n  5. El sistema envía el correo de confirmación.\n\nFlujo alternativo 3a: Sin plazas\n  3a1. El sistema muestra \"Curso completo\".\n  3a2. El sistema ofrece lista de espera."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Partes de un caso de uso"
                },
                {
                    "type": "list",
                    "items": [
                        "Actor: rol que interactúa con el sistema",
                        "Objetivo: resultado que el actor busca",
                        "Flujo principal: camino feliz paso a paso",
                        "Flujos alternativos: excepciones y variantes",
                        "Precondiciones y poscondiciones"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los casos de uso brillan con flujos complejos y actores variados; las historias de usuario brillan con conversación y priorización en iteraciones cortas. Muchos equipos los combinan: casos de uso para el alcance general y historias para el detalle iterativo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El actor es un rol, no una persona",
                        "Flujo principal + alternativos = visión completa",
                        "Las alternativas contienen las reglas de negocio",
                        "Casos de uso para alcance; historias para iterar"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 23,
            "title": "Técnicas de modelado",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "poo-srp": {
        "id": 478,
        "module_id": 189,
        "title": "SRP: una sola causa para cambiar",
        "slug": "poo-srp",
        "type": "article",
        "duration_minutes": 10,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El principio"
                },
                {
                    "type": "paragraph",
                    "text": "Una clase debe tener una unica responsabilidad, y por tanto una sola causa para cambiar. Si tu clase valida entrada, guarda en base de datos y formatea la salida, cada uno de esos cambios te obliga a editar la misma clase."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# Mal: tres razones para cambiar en una sola clase\nclass Usuario:\n    def registrar(self, datos):\n        validar(datos)\n        guardar_en_bd(datos)\n        return formatear_bienvenida(datos)\n\n# Bien: cada pieza tiene su responsabilidad\nclass ValidadorUsuario:\n    def validar(self, datos): ...\n\nclass RepositorioUsuarios:\n    def guardar(self, usuario): ...\n\nclass GeneradorBienvenida:\n    def generar(self, usuario): ..."
                },
                {
                    "type": "diagram",
                    "diagram_type": "comparison",
                    "title": "⚖️ Anti-patrón Clase Dios vs Principio de Responsabilidad Única (SRP)",
                    "caption": "Cuando una clase mezcla validación, persistencia SQL y formateo, cualquier cambio en la base de datos o en el diseño de emails arriesga romper toda la entidad de usuario.",
                    "leftLabel": "Clase Monolítica / Dios (Violación SRP)",
                    "leftItems": [
                        "Clase 'Usuario' hace validación, persistencia SQL, envío de emails y hashing",
                        "Múltiples razones para cambiar: cambio de reglas, cambio de ORM, cambio de plantilla",
                        "Imposible de testear de forma aislada sin levantar la base de datos real",
                        "Alto acoplamiento: un cambio en SQL puede romper la lógica de bienvenida"
                    ],
                    "rightLabel": "Arquitectura Desacoplada (Cumple SRP)",
                    "rightItems": [
                        "ValidadorUsuario: se encarga exclusivamente de verificar inputs (1 razón de cambio)",
                        "RepositorioUsuarios: se encarga exclusivamente del acceso a BD/SQL (1 razón de cambio)",
                        "NotificadorBienvenida: se encarga exclusivamente de despachar emails (1 razón de cambio)",
                        "100% testeable con Unit Tests puros y mocks independientes"
                    ]
                },
                {
                    "type": "diagram",
                    "diagram_type": "flow",
                    "title": "⚡ Flujo de Colaboración Desacoplada",
                    "caption": "Cada clase actúa como un eslabón autónomo y especializado dentro del pipeline de registro.",
                    "steps": [
                        {
                            "step": 1,
                            "label": "1. ValidadorUsuario",
                            "desc": "Comprueba formato de email, longitud de clave y campos obligatorios",
                            "icon": "🛡️",
                            "codeSnippet": "validador.validar(datos)"
                        },
                        {
                            "step": 2,
                            "label": "2. RepositorioUsuarios",
                            "desc": "Inserta el registro en la base de datos PostgreSQL de forma transaccional",
                            "icon": "💾",
                            "tone": "accent",
                            "codeSnippet": "repositorio.guardar(usuario)"
                        },
                        {
                            "step": 3,
                            "label": "3. NotificadorBienvenida",
                            "desc": "Encola el evento y envía el correo electrónico de bienvenida al usuario",
                            "icon": "📧",
                            "tone": "primary",
                            "codeSnippet": "notificador.enviar(usuario)"
                        }
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Como se aplica"
                },
                {
                    "type": "list",
                    "items": [
                        "Nombra las clases por lo que hacen, no por el sustantivo generico",
                        "Si el nombre de la clase lleva \"y\" (\"ReportePDFyEmail\"), tienes dos clases",
                        "Los metodos cortos no garantizan SRP: importa la responsabilidad, no el tamaño"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 189,
            "title": "SRP — Responsabilidad Única",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "localstorage-persistencia-cliente": {
        "id": 535,
        "module_id": 208,
        "title": "Persistencia en el navegador con LocalStorage",
        "slug": "localstorage-persistencia-cliente",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "API de Almacenamiento Web (MDN)"
                },
                {
                    "type": "paragraph",
                    "text": "LocalStorage permite guardar pares clave-valor de tipo cadena en el navegador del usuario. A diferencia de las cookies, los datos persisten indefinidamente incluso después de cerrar la pestaña o reiniciar el navegador, y no se envían al servidor en cada petición HTTP."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Guardar objetos complejos serializando a JSON\nconst preferencias = {\n    temaOscuro: true,\n    idioma: \"es\",\n    cursosGuardados: [1, 4, 7]\n};\n\nlocalStorage.setItem(\"user_prefs\", JSON.stringify(preferencias));\n\n// Recuperar y deserializar los datos\nconst guardado = localStorage.getItem(\"user_prefs\");\nif (guardado) {\n    const prefs = JSON.parse(guardado);\n    console.log(\"Tema oscuro activado:\", prefs.temaOscuro);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diferencias clave entre LocalStorage y SessionStorage"
                },
                {
                    "type": "list",
                    "items": [
                        "LocalStorage: Los datos persisten hasta que el usuario o el código los elimina",
                        "SessionStorage: Los datos se eliminan automáticamente al cerrar la pestaña actual",
                        "Capacidad: Aproximadamente 5MB a 10MB por dominio",
                        "Solo admite texto: Cualquier objeto debe convertirse con JSON.stringify() y JSON.parse()"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 208,
            "title": "Almacenamiento Local, Persistencia y Proyecto Final",
            "course_id": 9,
            "course_slug": "html-css-javascript",
            "course_title": "HTML, CSS y JavaScript",
            "course": {
                "id": 9,
                "slug": "html-css-javascript",
                "title": "HTML, CSS y JavaScript"
            }
        }
    },
    "poo-paradigma-vs-imperativo": {
        "id": 466,
        "module_id": 183,
        "title": "Paradigma imperativo vs. orientado a objetos",
        "slug": "poo-paradigma-vs-imperativo",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dos formas de organizar un programa"
                },
                {
                    "type": "paragraph",
                    "text": "En el paradigma imperativo escribes una secuencia de instrucciones que manipulan datos sueltos. Es directo y funciona bien para problemas pequeños. El problema aparece cuando el proyecto crece: los datos y las operaciones que los usan quedan dispersos por todo el archivo."
                },
                {
                    "type": "paragraph",
                    "text": "La programación orientada a objetos propone otra organización: una clase agrupa los datos (atributos) y las operaciones que trabajan con esos datos (métodos). Un objeto es una instancia concreta de esa clase."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# Imperativo: datos y lógica sueltos\nnombre = \"Ada\"\nedad = 36\nprint(f\"{nombre} tiene {edad} años\")\n\n# Orientado a objetos: datos y lógica juntos\nclass Persona:\n    def __init__(self, nombre, edad):\n        self.nombre = nombre\n        self.edad = edad\n\n    def presentar(self):\n        return f\"{self.nombre} tiene {self.edad} años\"\n\nprint(Persona(\"Ada\", 36).presentar())"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo conviene cada uno"
                },
                {
                    "type": "list",
                    "items": [
                        "Imperativo: scripts cortos, cálculo puntual, prototipos rápidos",
                        "Orientado a objetos: sistemas con entidades del dominio (usuarios, pedidos, cursos)",
                        "Los dos estilos conviven: una función libre puede llamar a un método sin problema"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ideas clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Clase = plantilla que define atributos y métodos",
                        "Objeto = instancia concreta creada a partir de la clase",
                        "El constructor (__init__) prepara el estado inicial del objeto",
                        "self dentro de un método referencia al propio objeto"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 183,
            "title": "Del imperativo a las clases",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "poo-ejercicio-primera-clase": {
        "id": 467,
        "module_id": 183,
        "title": "Ejercicio: diseña tu primera clase",
        "slug": "poo-ejercicio-primera-clase",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea una clase Libro con:\n# -titulo (string) y autor (string) como atributos\n# -un metodo __init__ que los asigne\n# -un metodo mostrar() que devuelva \"Titulo - Autor\"\n\n",
        "solution": "class Libro:\n    def __init__(self, titulo, autor):\n        self.titulo = titulo\n        self.autor = autor\n\n    def mostrar(self):\n        return f\"{self.titulo} - {self.autor}\"",
        "test_cases": [
            [
                "Libro(\"El principito\", \"Saint-Exupery\").mostrar()",
                "El principito - Saint-Exupery"
            ],
            [
                "Libro(\"Dune\", \"Herbert\").mostrar()",
                "Dune - Herbert"
            ]
        ],
        "hint": "Recuerda que self se escribe como primer parametro de cada metodo (self, ...).",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 183,
            "title": "Del imperativo a las clases",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "poo-atributos-y-metodos": {
        "id": 468,
        "module_id": 184,
        "title": "Atributos, métodos y el papel de self",
        "slug": "poo-atributos-y-metodos",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estado y comportamiento"
                },
                {
                    "type": "paragraph",
                    "text": "Un objeto se comporta como una entidad con dos caras: los atributos guardan su estado y los métodos operan sobre ese estado. La convención de Python coloca el prefijo guion bajo para indicar que un atributo es interno."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "class Coche:\n    def __init__(self, marca, km):\n        self.marca = marca\n        self.km = km\n\n    def avanzar(self, distancia):\n        self.km += distancia\n        return self.km\n\nmi_coche = Coche(\"Seat\", 0)\nprint(mi_coche.avanzar(120))  # 120\nprint(mi_coche.km)            # 120"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "self no es opcional"
                },
                {
                    "type": "paragraph",
                    "text": "Cuando llamas a mi_coche.avanzar(120), Python pasa el objeto como primer argumento. Tu metodo debe declararlo: por eso aparece self. Olvidarlo produce el error \"takes 1 positional argument but 2 were given\"."
                },
                {
                    "type": "list",
                    "items": [
                        "self es el objeto actual; no lo pases al llamar, Python lo hace por ti",
                        "Un metodo que no usa self podria ser una funcion suelta: reconsidera el diseño",
                        "Los atributos con guion bajo se consideran privados por convencion"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 184,
            "title": "Atributos y métodos",
            "course_id": 93,
            "course_slug": "introduccion-poo",
            "course_title": "Introducción a la Programación Orientada a Objetos",
            "course": {
                "id": 93,
                "slug": "introduccion-poo",
                "title": "Introducción a la Programación Orientada a Objetos"
            }
        }
    },
    "poo-herencia": {
        "id": 472,
        "module_id": 186,
        "title": "Herencia: reutilizar lo que ya funciona",
        "slug": "poo-herencia",
        "type": "article",
        "duration_minutes": 13,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Especializar un concepto general"
                },
                {
                    "type": "paragraph",
                    "text": "La herencia permite que una clase derive de otra y aproveche sus metodos. La subclase puede anadir comportamiento nuevo o cambiar el existente."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "class Animal:\n    def __init__(self, nombre):\n        self.nombre = nombre\n\n    def hablar(self):\n        return f\"{self.nombre} hace un sonido\"\n\nclass Perro(Animal):\n    def hablar(self):          # sobrescribe el metodo del padre\n        return f\"{self.nombre} ladra\"\n\nclass Gato(Animal):\n    def hablar(self):\n        return f\"{self.nombre} maulla\"\n\nfor animal in [Perro(\"Rex\"), Gato(\"Michi\")]:\n    print(animal.hablar())"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Polimorfismo"
                },
                {
                    "type": "paragraph",
                    "text": "El polimorfismo es la capacidad de tratar distintos objetos de forma uniforme. El bucle anterior llama a hablar() en un Perro y en un Gato, y cada uno responde con su propia version. Ese es el principio abierto/cerrado en accion: el codigo nuevo no requiere modificar el existente."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "super()"
                },
                {
                    "type": "paragraph",
                    "text": "Cuando la subclase necesita la logica del padre, llama a super().metodo() para no duplicar codigo."
                },
                {
                    "type": "list",
                    "items": [
                        "Herencia \"es un\": un Perro es un Animal",
                        "super() delega en la clase padre",
                        "Sobrescribir metodos es polimorfismo",
                        "No todo se resuelve con herencia: prefiere composicion cuando la relacion es \"tiene un\""
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 186,
            "title": "Herencia y polimorfismo",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-ejercicio-herencia": {
        "id": 473,
        "module_id": 186,
        "title": "Ejercicio: jerarquía de figuras",
        "slug": "poo-ejercicio-herencia",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea la clase Figura con metodo area() que devuelva 0\n# Cuadrado( lado ) y Circulo( radio ) heredan de Figura\n# y sobrescriben area() con su propia formula\n# Usa 3.14159 como valor de pi\n\n",
        "solution": "class Figura:\n    def area(self):\n        return 0\n\nclass Cuadrado(Figura):\n    def __init__(self, lado):\n        self.lado = lado\n\n    def area(self):\n        return self.lado * self.lado\n\nclass Circulo(Figura):\n    def __init__(self, radio):\n        self.radio = radio\n\n    def area(self):\n        return 3.14159 * self.radio * self.radio",
        "test_cases": [
            [
                "str(Cuadrado(3).area())",
                "9"
            ],
            [
                "str(Cuadro = Circulo(1).area())[:5]",
                "3.141"
            ]
        ],
        "hint": "La clase padre define area(); cada subclase la sobrescribe.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 186,
            "title": "Herencia y polimorfismo",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-encapsulamiento": {
        "id": 474,
        "module_id": 187,
        "title": "Encapsulamiento: proteger el estado",
        "slug": "poo-encapsulamiento",
        "type": "article",
        "duration_minutes": 11,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "No todo es publico"
                },
                {
                    "type": "paragraph",
                    "text": "Si expones un atributo directamente, cualquier parte del programa puede dejar el objeto en un estado invalido. El encapsulamiento ofrece una forma de modificarlo que garantiza las reglas."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "class CuentaBancaria:\n    def __init__(self, saldo):\n        self._saldo = saldo      # convencionalmente privado\n\n    @property\n    def saldo(self):            # getter de solo lectura\n        return self._saldo\n\n    def depositar(self, monto):\n        if monto <= 0:\n            raise ValueError(\"monto invalido\")\n        self._saldo += monto\n        return self._saldo\n\ncuenta = CuentaBancaria(100)\nprint(cuenta.saldo)     # 100 (leido)\ncuenta.depositar(50)\nprint(cuenta.saldo)     # 150"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Convenciones de Python"
                },
                {
                    "type": "list",
                    "items": [
                        "Guion bajo inicial: uso interno del objeto",
                        "@property: expone lectura controlada",
                        "@valor.setter: controla la escritura y valida",
                        "Las excepciones launched dentro del metodo son parte del contrato"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 187,
            "title": "Encapsulamiento",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-ejercicio-encapsulamiento": {
        "id": 475,
        "module_id": 187,
        "title": "Ejercicio: cuenta con saldo protegido",
        "slug": "poo-ejercicio-encapsulamiento",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea CuentaBancaria con atributo interno _saldo\n# - saldo como @property de solo lectura\n# - depositar(monto) suma si monto > 0, y devuelve el saldo\n# - retirar(monto) lanza ValueError si no hay saldo suficiente\n#   y devuelve el saldo en caso contrario\n\n",
        "solution": "class CuentaBancaria:\n    def __init__(self, saldo=0):\n        self._saldo = saldo\n\n    @property\n    def saldo(self):\n        return self._saldo\n\n    def depositar(self, monto):\n        if monto <= 0:\n            raise ValueError(\"monto invalido\")\n        self._saldo += monto\n        return self._saldo\n\n    def retirar(self, monto):\n        if monto > self._saldo:\n            raise ValueError(\"saldo insuficiente\")\n        self._saldo -= monto\n        return self._saldo",
        "test_cases": [
            [
                "str(CuentaBancaria(100).depositar(50).saldo)",
                "150"
            ],
            [
                "CuentaBancaria(10).retirar(50)",
                "error:saldo insuficiente"
            ]
        ],
        "hint": "Usa @property para el getter y self._saldo dentro de los metodos.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 187,
            "title": "Encapsulamiento",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-composicion-vs-herencia": {
        "id": 476,
        "module_id": 188,
        "title": "Composición o herencia: cómo decidir",
        "slug": "poo-composicion-vs-herencia",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dos relaciones distintas"
                },
                {
                    "type": "list",
                    "items": [
                        "Herencia para \"es un\": un Gato es un Animal",
                        "Composición para \"tiene un\": un Coche tiene un Motor"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Heredar cuando la relacion es \"tiene un\" produce acoplamiento inutil: si Coche hereda de Motor, cualquier cambio en Motor afecta a Coche y a todos los que heredan de el. La composicion permite cambiar el motor sin tocar el coche."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# Composicion: el Coche CONTIENE un Motor\nclass Motor:\n    def __init__(self, potencia):\n        self.potencia = potencia\n\n    def descripcion(self):\n        return f\"motor de {self.potencia}cv\"\n\nclass Coche:\n    def __init__(self, motor):\n        self.motor = motor          # <- composicion\n\n    def descripcion(self):\n        return f\"coche con {self.motor.descripcion()}\"\n\nprint(Coche(Motor(90)).descripcion())"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Regla practica"
                },
                {
                    "type": "paragraph",
                    "text": "Empieza por composicion. Hereda solo cuando exista una relacion \"es un\" genuina y estable. El profundo es un buen punto de partida."
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 188,
            "title": "Composición vs. herencia",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-ejercicio-composicion": {
        "id": 477,
        "module_id": 188,
        "title": "Ejercicio: pedido compuesto",
        "slug": "poo-ejercicio-composicion",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea la clase Producto(nombre, precio)\n# y la clase Pedido que RECIBA productos por composicion\n# Pedido(productos) guarda la lista\n# Pedido.total() suma los precios\n# Pedido.num_items() devuelve la cantidad\n\n",
        "solution": "class Producto:\n    def __init__(self, nombre, precio):\n        self.nombre = nombre\n        self.precio = precio\n\nclass Pedido:\n    def __init__(self, productos):\n        self.productos = productos\n\n    def total(self):\n        return sum(p.precio for p in self.productos)\n\n    def num_items(self):\n        return len(self.productos)",
        "test_cases": [
            [
                "str(Pedido([Producto(\"A\", 10), Producto(\"B\", 5)]).total())",
                "15"
            ],
            [
                "str(Pedido([Producto(\"A\", 10)]).num_items())",
                "1"
            ]
        ],
        "hint": "El Pedido recibe una lista ya construida; no la crea internamente.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 188,
            "title": "Composición vs. herencia",
            "course_id": 94,
            "course_slug": "clases-objetos-herencia",
            "course_title": "Clases, Objetos y Herencia",
            "course": {
                "id": 94,
                "slug": "clases-objetos-herencia",
                "title": "Clases, Objetos y Herencia"
            }
        }
    },
    "poo-ocp-lsp": {
        "id": 480,
        "module_id": 190,
        "title": "OCP y LSP: extensibilidad y substitutabilidad",
        "slug": "poo-ocp-lsp",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "OCP: abierto/cerrado"
                },
                {
                    "type": "paragraph",
                    "text": "El software debe ser extensible sin modificar el codigo existente. Si cada vez que anades un metodo de pago tienes que tocar la clase que procesa pedidos, el principio esta roto."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# Mal: hay que modificar la clase en cada nuevo metodo\nclass ProcesadorPago:\n    def cobrar(self, pedido, metodo):\n        if metodo == \"tarjeta\": ...\n        elif metodo == \"paypal\": ...\n        elif metodo == \"bizum\": ...   # <- nuevo metodo, nuevo condicional\n\n# Bien: cada metodo es su propia clase (ver tema ISP/DIP)"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "LSP: la sustitutibilidad"
                },
                {
                    "type": "paragraph",
                    "text": "Toda subclase debe poder reemplazar a su clase padre sin romper el codigo que la usa. Si tu clase padre declara un metodo calcular() y la subclase lo lanza con NotImplementedError, ya no es sustituible."
                },
                {
                    "type": "list",
                    "items": [
                        "OCP: prefieres nuevas clases a nuevas condiciones if/else",
                        "LSP: si el cliente usa el tipo padre, cualquier hijo debe funcionar",
                        "Violar LSP suelemiknotaise por Exception",
                        "Prefiere composicion cuando la jerarquia no representa el dominio real"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 190,
            "title": "OCP y LSP",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "poo-ejercicio-ocp": {
        "id": 481,
        "module_id": 190,
        "title": "Ejercicio:.shape sin if/else",
        "slug": "poo-ejercicio-ocp",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea un sistema de envios extensible sin condicionales:\n# cada metodo de envio es una clase con __init__(destino)\n# y enviar() que devuelva un texto con el destino\n# y la clase Envio que recibe una estrategia y la delega\n\n",
        "solution": "class EnvioEstandar:\n    def __init__(self, destino):\n        self.destino = destino\n\n    def enviar(self):\n        return f\"enviado por correo a {self.destino}\"\n\nclass EnvioUrgente:\n    def __init__(self, destino):\n        self.destino = destino\n\n    def enviar(self):\n        return f\"enviado urgente a {self.destino}\"\n\nclass Envio:\n    def __init__(self, estrategia):\n        self.estrategia = estrategia\n\n    def enviar(self, destino):\n        return self.estrategia.__class__(destino).enviar()",
        "test_cases": [
            [
                "Envio(EnvioUrgente).enviar(\"Madrid\")",
                "enviado urgente a Madrid"
            ],
            [
                "Envio(EnvioEstandar).enviar(\"Lima\")",
                "enviado por correo a Lima"
            ]
        ],
        "hint": "Anadir un nuevo metodo = anadir una clase, sin tocar las existentes.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 190,
            "title": "OCP y LSP",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "poo-isp-dip": {
        "id": 482,
        "module_id": 191,
        "title": "ISP y DIP: interfaces mínimas y dependencias invertidas",
        "slug": "poo-isp-dip",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "ISP: interfaz segregada"
                },
                {
                    "type": "paragraph",
                    "text": "No fuerces a tus clientes a depender de metodos que no usan. Una interfaz enorme es mas difficult de implementar y mas fragil que varias interfaces pequenas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "DIP: dependencia de las abstracciones"
                },
                {
                    "type": "paragraph",
                    "text": "Los modulos de alto nivel no deben depender de los de bajo nivel; ambos deben depender de abstracciones. En la practica, el codigo de negocio recibe sus colaboradores por constructor en vez de instanciarlos."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# DIP: el servicio depende de una interfaz, no de un motor concreto\nclass ServicioNotificacion:\n    def __init__(self, motor):     # <- recibe la dependencia\n        self.motor = motor\n\n    def avisar(self, mensaje):\n        return self.motor.enviar(mensaje)\n\n# La eleccion del motor ocurre fuera, en el punto de entrada\nServicioNotificacion(EnvioCorreo()).avisar(\"Hola\")"
                },
                {
                    "type": "list",
                    "items": [
                        "ISP: divide interfaces grandes en interfaces cohesionadas",
                        "DIP: pasa las dependencias por constructor",
                        "Un test puede inyectar un doble sin tocar el codigo de produccion",
                        "Esto es lo que hace testeable el codico, no el porcentaje de cobertura de tests"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 191,
            "title": "ISP y DIP",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "poo-ejercicio-dip": {
        "id": 483,
        "module_id": 191,
        "title": "Ejercicio: inyección de dependencias",
        "slug": "poo-ejercicio-dip",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Calculadora que recibe un motor de precios por constructor\n# __init__(precio_base) — precio_base es un objeto con .get(origen)\n# calcular(destino) — usa motor.get(destino) + 10 de envio\n# Calculadora(PreciosFijos()).calcular(\"Lima\") -> 15\n\n",
        "solution": "class PreciosFijos:\n    def __init__(self, precios):\n        self.precios = precios\n\n    def get(self, destino):\n        return self.precios[destino]\n\nclass Calculadora:\n    def __init__(self, precio_base):\n        self.precio_base = precio_base\n\n    def calcular(self, destino):\n        return self.precio_base.get(destino) + 10",
        "test_cases": [
            [
                "str(Calculadora(PreciosFijos({\"Lima\": 5})).calcular(\"Lima\"))",
                "15"
            ],
            [
                "str(Calculadora(PreciosFijos({\"Madrid\": 3})).calcular(\"Madrid\"))",
                "13"
            ]
        ],
        "hint": "No llames a un motor concreto dentro de la calculadora.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 191,
            "title": "ISP y DIP",
            "course_id": 95,
            "course_slug": "principios-solid",
            "course_title": "Principios SOLID en la práctica",
            "course": {
                "id": 95,
                "slug": "principios-solid",
                "title": "Principios SOLID en la práctica"
            }
        }
    },
    "poo-patrones-creacionales": {
        "id": 484,
        "module_id": 192,
        "title": "Creacionales: Factory y Singleton",
        "slug": "poo-patrones-creacionales",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Que resuelven"
                },
                {
                    "type": "paragraph",
                    "text": "Los patrones creacionales abstraen la creacion de objetos, de modo que el cliente no dependa de la clase concreta. Factory centraliza la decision; Singleton garantiza una unica instancia."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# Factory: el cliente pide un producto, no una clase concreta\nclass FabricaNotificaciones:\n    @staticmethod\n    def crear(tipo, destino):\n        if tipo == \"email\":\n            return NotificacionEmail(destino)\n        if tipo == \"sms\":\n            return NotificacionSMS(destino)\n        raise ValueError(f\"tipo desconocido: {tipo}\")\n\nnotif = FabricaNotificaciones.crear(\"email\", \"ana@correo.com\")\nprint(notif.enviar(\"Hola\"))\n\n# Singleton: una sola instancia compartida\nclass Configuracion:\n    _instancia = None\n\n    def __new__(cls):\n        if cls._instancia is None:\n            cls._instancia = super().__new__(cls)\n        return cls._instancia"
                },
                {
                    "type": "list",
                    "items": [
                        "Factory: el cliente pide \"algo que envia\", no \"un NotificacionEmail\"",
                        "Singleton: util para configuración o cachés, usalo con moderacion",
                        "El enum de Python suele ser mejor Singleton para configuraciones"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 192,
            "title": "Patrones creacionales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "poo-ejercicio-factory": {
        "id": 485,
        "module_id": 192,
        "title": "Ejercicio: fábrica de vehículos",
        "slug": "poo-ejercicio-factory",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea Auto(ruedas) y Moto(ruedas) con Wheels() \n# que devuelva el numero de ruedas\n# y Fabrica.crear(tipo) que devuelva la instancia correcta\n# o lance ValueError si el tipo no existe\n\n",
        "solution": "class Auto:\n    def __init__(self, ruedas=4):\n        self.ruedas = ruedas\n\n    def wheels(self):\n        return self.ruedas\n\nclass Moto:\n    def __init__(self, ruedas=2):\n        self.ruedas = ruedas\n\n    def wheels(self):\n        return self.ruedas\n\nclass Fabrica:\n    @staticmethod\n    def crear(tipo):\n        if tipo == \"auto\":\n            return Auto()\n        if tipo == \"moto\":\n            return Moto()\n        raise ValueError(f\"tipo desconocido: {tipo}\")",
        "test_cases": [
            [
                "str(Fabrica.crear(\"auto\").wheels())",
                "4"
            ],
            [
                "str(Fabrica.crear(\"moto\").wheels())",
                "2"
            ]
        ],
        "hint": "La fabrica decide; el cliente solo pide por nombre.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 192,
            "title": "Patrones creacionales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "poo-patrones-estructurales": {
        "id": 486,
        "module_id": 193,
        "title": "Estructurales: Adapter y Decorator",
        "slug": "poo-patrones-estructurales",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Adapter: hacer compatibles interfaces distintas"
                },
                {
                    "type": "paragraph",
                    "text": "Adapter envuelve una interfaz que no encaja con la que espera el cliente, y traduce la llamada. Se usa al integrar librerias de terceros o legado."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "# El cliente espera .calcular()\n# La libreria ofrece .compute() -> necesita un Adapter\nclass Calculador legacy:\n    def compute(self, a, b):\n        return a + b\n\nclass Adapter:\n    def __init__(self, legado):\n        self.legado = legado\n\n    def calcular(self, a, b):\n        return self.legado.compute(a, b)"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Decorator: envolver comportamiento sin herencia"
                },
                {
                    "type": "paragraph",
                    "text": "Decorator anade funcionalidad a un objeto envolverlo con mas objetos del mismo tipo, en cadena. Es la alternativa flexible a la herencia para ampliar comportamiento."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "def registrar(funcion):\n    def envoltorio(*args, **kwargs):\n        print(f\"Llamando a {funcion.__name__}\")\n        return funcion(*args, **kwargs)\n    return envoltorio\n\n@registrar\ndef saludar(nombre):\n    return f\"Hola {nombre}\""
                },
                {
                    "type": "list",
                    "items": [
                        "Adapter: traduce, no anade comportamiento",
                        "Decorator: anade comportamiento manteniendo la firma",
                        "Los decoradores de Python son el patron Decorator ya estandarizado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 193,
            "title": "Patrones estructurales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "poo-ejercicio-decorator": {
        "id": 487,
        "module_id": 193,
        "title": "Ejercicio: deco contador de llamadas",
        "slug": "poo-ejercicio-decorator",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Crea un decorador contar_llamadas que imprima \"Ejecutando fn: ...\"\n# cada vez que se invoque la funcion decorada,\n# y luego aplicalo a una funcion saludar(nombre)\n\n",
        "solution": "def contar_llamadas(fn):\n    def envoltorio(*args, **kwargs):\n        print(f\"Ejecutando fn: {fn.__name__}\")\n        return fn(*args, **kwargs)\n    return envoltorio\n\n@contar_llamadas\ndef saludar(nombre):\n    return f\"Hola {nombre}\"",
        "test_cases": [
            [
                "contar_llamadas(lambda: \"ok\")()",
                "Ejecutando fn: <lambda>\nok"
            ],
            [
                "str(contar_llamadas(lambda a, b=2: a + b)(3))",
                "Ejecutando fn: <lambda>\n5"
            ]
        ],
        "hint": "Un decorador recibe una funcion y devuelve otra que la envuelve.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 193,
            "title": "Patrones estructurales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "poo-patrones-comportamentales": {
        "id": 488,
        "module_id": 194,
        "title": "Comportamentales: Strategy y Observer",
        "slug": "poo-patrones-comportamentales",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Strategy: cambiar el algoritmo en caliente"
                },
                {
                    "type": "paragraph",
                    "text": "Strategy encapsula una familia de algoritmos intercambiables. El contexto recibe la estrategia y delega; cambiar de algoritmo no requiere tocar el contexto. Es el patron detras de las funciones de orden superior de Python."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Observer: notificar cambios"
                },
                {
                    "type": "paragraph",
                    "text": "Observer define una relacion uno-a-muchos: cuando el sujeto cambia, notifica a todos los suscriptores registrados. Sin acoplamiento entre sujeto y observador."
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "class Sujeto:\n    def __init__(self):\n        self._observadores = []\n\n    def suscribir(self, obs):\n        self._observadores.append(obs)\n\n    def notificar(self, evento):\n        for obs in self._observadores:\n            obs(evento)\n\nclass Logger:\n    def __call__(self, evento):\n        print(f\"[log] {evento}\")\n\ns = Sujeto()\ns.suscribir(Logger())\ns.notificar(\"nueva venta\")   # imprime: [log] nueva venta"
                },
                {
                    "type": "list",
                    "items": [
                        "Strategy: elige el algoritmo, no el codigo que lo usa",
                        "Observer: difunde el cambio sin que el sujeto conozca a quien avisa",
                        "Ambos favorecen el principio abierto/cerrado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 194,
            "title": "Patrones comportamentales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "poo-ejercicio-strategy": {
        "id": 489,
        "module_id": 194,
        "title": "Ejercicio: strategy de compresión",
        "slug": "poo-ejercicio-strategy",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": []
        },
        "starter_code": "# Compresion con strategy: Compresor recibe una estrategia\n# en su constructor y la usa en comprimir(datos)\n# Usa SinCompression y compresion simple (quitar espacios)\n\n",
        "solution": "class SinCompresion:\n    def comprimir(self, datos):\n        return datos\n\nclass SinEspacios:\n    def comprimir(self, datos):\n        return datos.replace(\" \", \"\")\n\nclass Compresor:\n    def __init__(self, estrategia):\n        self.estrategia = estrategia\n\n    def comprimir(self, datos):\n        return self.estrategia.comprimir(datos)",
        "test_cases": [
            [
                "Compresor(SinCompresion()).comprimir(\"a b c\")",
                "a b c"
            ],
            [
                "Compresor(SinEspacios()).comprimir(\"a b c\")",
                "abc"
            ]
        ],
        "hint": "El compresor no sabe que algoritmo usa, solo lo delega.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 194,
            "title": "Patrones comportamentales",
            "course_id": 96,
            "course_slug": "patrones-de-diseno",
            "course_title": "Patrones de Diseño",
            "course": {
                "id": 96,
                "slug": "patrones-de-diseno",
                "title": "Patrones de Diseño"
            }
        }
    },
    "control-flow-y-comunicacion": {
        "id": 26,
        "module_id": 11,
        "title": "Control flow, inputs y outputs",
        "slug": "control-flow-y-comunicacion",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Control flow, inputs y outputs"
                },
                {
                    "type": "paragraph",
                    "text": "Los bloques @if, @for y @switch sustituyen a *ngIf y *ngFor con una sintaxis más legible y mejor rendimiento. La comunicación padre-hijo se hace con @Input y @Output."
                },
                {
                    "type": "paragraph",
                    "text": "El padre pasa datos con @Input; el hijo notifica eventos con @Output y EventEmitter. Este flujo unidireccional mantiene el estado predecible."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "// En el hijo\n@Component({\n    selector: \"app-item\",\n    standalone: true,\n    template: `\n        @if (item) {\n            <p>{{ item.nombre }}</p>\n        }\n        <button (click)=\"comprar.emit(item)\">Comprar</button>\n    `,\n})\nexport class ItemComponent {\n    @Input({ required: true }) item: Producto | null = null;\n    @Output() comprar = new EventEmitter<Producto>();\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Nuevos bloques de control"
                },
                {
                    "type": "list",
                    "items": [
                        "@if / @else condiciona el renderizado",
                        "@for recorre listas con track",
                        "@switch sustituye a ngSwitch",
                        "Comunicación: @Input entra, @Output sale"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Con @for usas track para identificar cada elemento y mejorar el rendimiento de las actualizaciones. La comunicación explícita padre-hijo hace el flujo de datos fácil de seguir."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "@if y @for modernizan el template",
                        "@Input permite al padre pasar datos",
                        "@Output permite al hijo emitir eventos",
                        "El flujo unidireccional simplifica el estado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 11,
            "title": "Fundamentos de Angular",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "testing-de-accesibilidad": {
        "id": 495,
        "module_id": 13,
        "title": "Herramientas para evaluar accesibilidad",
        "slug": "testing-de-accesibilidad",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Herramientas para evaluar accesibilidad"
                },
                {
                    "type": "paragraph",
                    "text": "Las herramientas automatizadas detectan una parte de los problemas: contraste, alt faltantes, labels ausentes y roles incorrectos. El resto requiere pruebas manuales con teclado y lectores de pantalla."
                },
                {
                    "type": "paragraph",
                    "text": "Lighthouse y axe devuelven informes accionables desde el navegador. Ninguna herramienta sustituye a probar con usuarios reales."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Instalar axe-core y correr análisis en Node\nnpm install --save-dev @axe-core/cli\nnpx @axe-core/cli https://example.com\n\n# En DevTools: panel Lighthouse -> Accessibility"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo de verificación"
                },
                {
                    "type": "list",
                    "items": [
                        "Auditoría automática con Lighthouse o axe",
                        "Navegación solo con teclado",
                        "Prueba con lector de pantalla",
                        "Revisión de contraste y foco visible"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Integra las auditorías al pipeline: un test que falle cuando la accesibilidad empeora es la única forma de que no se deteriore con el tiempo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La automatización cubre una parte de los problemas",
                        "axe y Lighthouse dan informes accionables",
                        "Teclado y lector de pantalla son imprescindibles",
                        "Automatizar en CI evita regresiones"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 13,
            "title": "Accesibilidad",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "estilos-y-ciclo-de-vida": {
        "id": 490,
        "module_id": 11,
        "title": "Estilos y ciclo de vida",
        "slug": "estilos-y-ciclo-de-vida",
        "type": "article",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estilos y ciclo de vida"
                },
                {
                    "type": "paragraph",
                    "text": "Los componentes encapsulan sus estilos por defecto: los CSS de un componente no afectan a otros. Angular implementa esto aislando los selectores con atributos generados."
                },
                {
                    "type": "paragraph",
                    "text": "El ciclo de vida ofrece ganchos como ngOnInit para inicializar datos y ngOnDestroy para limpiar suscripciones. Conocerlos evita fugas de memoria y errores de orden."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Component, OnInit, OnDestroy } from \"@angular/core\";\n\n@Component({\n    selector: \"app-datos\",\n    standalone: true,\n    template: `<p>{{ mensaje }}</p>`,\n    styles: [`p { color: #2563eb; }`],\n})\nexport class DatosComponent implements OnInit, OnDestroy {\n    mensaje = \"Cargando...\";\n\n    ngOnInit() {\n        this.mensaje = \"Datos listos\";\n    }\n\n    ngOnDestroy() {\n        // Limpiar suscripciones, timers, etc.\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ganchos más usados"
                },
                {
                    "type": "list",
                    "items": [
                        "ngOnInit: inicializar datos al montar",
                        "ngOnChanges: reaccionar a cambios de @Input",
                        "ngOnDestroy: liberar recursos al desmontar",
                        "ngAfterViewInit: cuando la vista está lista"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla práctica: ngOnInit para lógica de arranque y ngOnDestroy para limpiar. Olvidar ngOnDestroy con suscripciones es la causa típica de fugas de memoria en Angular."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los estilos se encapsulan por componente",
                        "ngOnInit inicializa al montar",
                        "ngOnDestroy libera recursos",
                        "El ciclo de vida organiza cuándo ocurre cada cosa"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 11,
            "title": "Fundamentos de Angular",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "estado-con-signals": {
        "id": 27,
        "module_id": 12,
        "title": "Estado con Signals",
        "slug": "estado-con-signals",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estado con Signals"
                },
                {
                    "type": "paragraph",
                    "text": "Las señales son la forma reactiva de gestionar estado en Angular: signal() declara, .set() y .update() modifican, y computed() deriva valores que se recalculan automáticamente."
                },
                {
                    "type": "paragraph",
                    "text": "El framework detecta los cambios con precisión y eficiencia, reduciendo la dependencia de Zone.js y haciendo las actualizaciones más predecibles."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Component, computed, signal } from \"@angular/core\";\n\n@Component({\n    selector: \"app-carrito\",\n    standalone: true,\n    template: `\n        <p>Artículos: {{ total() }}</p>\n        <button (click)=\"agregar()\">Agregar</button>\n    `,\n})\nexport class CarritoComponent {\n    cantidad = signal(0);\n    total = computed(() => this.cantidad() * 10);\n\n    agregar() {\n        this.cantidad.update((c) => c + 1);\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "API de signals"
                },
                {
                    "type": "list",
                    "items": [
                        "signal(valor) crea una señal",
                        ".set(nuevo) reemplaza el valor",
                        ".update(fn) calcula a partir del anterior",
                        "computed(fn) deriva valores reactivos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En el template las señales se usan como funciones: {{ total() }}. Angular las lee y sabe exactamente qué depende de qué, actualizando solo lo necesario."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "signal declara estado reactivo",
                        "set y update modifican señales",
                        "computed deriva valores que se recalculan solos",
                        "La detección de cambios es más precisa que antes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 12,
            "title": "Estado y Datos",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "http-client-y-servicios": {
        "id": 28,
        "module_id": 12,
        "title": "HttpClient y servicios",
        "slug": "http-client-y-servicios",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "HttpClient y servicios"
                },
                {
                    "type": "paragraph",
                    "text": "Los servicios encapsulan la lógica de negocio y las llamadas al backend: HttpClient devuelve Observables de RxJS que se componen con operadores como map, catchError y switchMap."
                },
                {
                    "type": "paragraph",
                    "text": "Inyectarlos mediante dependency injection mantiene los componentes limpios y las peticiones centralizadas en un solo lugar."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Injectable, inject } from \"@angular/core\";\nimport { HttpClient } from \"@angular/common/http\";\nimport { Observable } from \"rxjs\";\n\n@Injectable({ providedIn: \"root\" })\nexport class ProductoService {\n    private http = inject(HttpClient);\n\n    listar(): Observable<Producto[]> {\n        return this.http.get<Producto[]>(\"/api/productos\");\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Patrones con HttpClient"
                },
                {
                    "type": "list",
                    "items": [
                        "Servicios con providedIn: root para inyectar en todo",
                        "Tipar las respuestas con genéricos",
                        "Componer con map y catchError",
                        "Centralizar URLs y cabeceras en un solo lugar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los componentes llaman al servicio y se suscriben o usan la nueva sintaxis con async pipe. El servicio es el único que conoce la API, facilitando tests y cambios."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "HttpClient hace peticiones HTTP tipadas",
                        "Los servicios centralizan el acceso a la API",
                        "RxJS compone respuestas de forma declarativa",
                        "La inyección de dependencias mantiene todo testeable"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 12,
            "title": "Estado y Datos",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "formularios-reactivos": {
        "id": 491,
        "module_id": 12,
        "title": "Formularios reactivos",
        "slug": "formularios-reactivos",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Formularios reactivos"
                },
                {
                    "type": "paragraph",
                    "text": "Los formularios reactivos modelan el estado del formulario como un objeto FormGroup con validadores. Son la opción recomendada en Angular moderno por su potencia y testabilidad."
                },
                {
                    "type": "paragraph",
                    "text": "Cada control se valida con reglas declarativas (required, minLength, custom). Los errores se muestran con valid (touched) preserving feedback al usuario sin sobrecargar."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Component } from \"@angular/core\";\nimport { FormControl, FormGroup, ReactiveFormsModule, Validators } from \"@angular/forms\";\n\n@Component({\n    selector: \"app-registro\",\n    standalone: true,\n    imports: [ReactiveFormsModule],\n    template: `\n        <form [formGroup]=\"formulario\" (ngSubmit)=\"enviar()\">\n            <input formControlName=\"email\" type=\"email\" placeholder=\"Correo\">\n            <button type=\"submit\">Registrar</button>\n        </form>\n    `,\n})\nexport class RegistroComponent {\n    formulario = new FormGroup({\n        email: new FormControl(\"\", [Validators.required, Validators.email]),\n    });\n\n    enviar() {\n        if (this.formulario.valid) {\n            console.log(this.formulario.value);\n        }\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "FormGroup agrupa controles",
                        "FormControl guarda valor y validación",
                        "Validators declaran reglas",
                        "formControlName conecta el template con el modelo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Al contrario que los template-driven, los formularios reactivos se definen en la clase: puedes validarlos, probarlos y transformarlos sin depender de la vista."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "FormGroup + FormControl modelan el formulario",
                        "Los validadores son declarativos",
                        "formControlName vincula el template",
                        "comprobar .valid antes de enviar evita datos rotos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 12,
            "title": "Estado y Datos",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "primeros-commits": {
        "id": 45,
        "module_id": 20,
        "title": "Tus primeros commits",
        "slug": "primeros-commits",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tus primeros commits"
                },
                {
                    "type": "paragraph",
                    "text": "Un commit es un punto de control: una foto del estado de tus archivos con un mensaje que explique qué y por qué. Cuanto más atómico y claro sea el mensaje, más fácil será leer el historial meses después."
                },
                {
                    "type": "paragraph",
                    "text": "El flujo básico es git add para preparar archivos, git commit para sellar el punto de control y git status para ver en qué punto estás. git log muestra la historia y git diff las diferencias pendientes."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Primer commit\ngit status                 # ¿qué ha cambiado?\ngit add index.html         # prepara un archivo\ngit add src/               # o toda una carpeta\ngit commit -m \"feat: página inicial con tarjeta de curso\"\n\n# Revisar la historia y cambios\ngit log --oneline          # lista resumida de commits\ngit diff                   # cambios aún sin preparar\ngit diff --staged          # cambios ya en el staging"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de commits"
                },
                {
                    "type": "list",
                    "items": [
                        "Mensajes claros: qué y por qué, no solo qué",
                        "Commits atómicos: un cambio lógico por commit",
                        "No versionar archivos generados ni secretos (.gitignore)",
                        "Revisar git status y git diff antes de commitear",
                        "Mensaje imperativo: \"add\", \"fix\", \"refactor\""
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un buen mensaje de commit es el dif más valioso del proyecto: responde por qué se tomó una decisión. El formato Conventional Commits (feat, fix, refactor, docs...) hace esa lectura consistente y habilita changelogs y releases automáticas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "git add prepara; git commit sella",
                        "git status y git diff te muestran el terreno",
                        "git log cuenta la historia resumida",
                        "Mensajes atómicos y claros = historial útil"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 20,
            "title": "Primeros pasos",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "router-y-lazy-loading": {
        "id": 29,
        "module_id": 195,
        "title": "Router y lazy loading",
        "slug": "router-y-lazy-loading",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Router y lazy loading"
                },
                {
                    "type": "paragraph",
                    "text": "El router enruta URLs a componentes y habilita el lazy loading: cada ruta carga su módulo o componente bajo demanda, reduciendo el bundle inicial."
                },
                {
                    "type": "paragraph",
                    "text": "Con loadComponent, el navegador descarga el código de una vista solo cuando el usuario navega a ella. Es una de las optimizaciones de rendimiento más efectivas en SPAs."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { Routes } from \"@angular/router\";\n\nexport const rutas: Routes = [\n    { path: \"\", component: HomeComponent },\n    {\n        path: \"productos\",\n        loadComponent: () =>\n            import(\"./productos/productos.component\").then(\n                (m) => m.ProductosComponent\n            ),\n    },\n    { path: \"**\", redirectTo: \"\" },\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Elementos del router"
                },
                {
                    "type": "list",
                    "items": [
                        "router-outlet: el hueco donde se renderiza la ruta",
                        "RouterLink: navegación declarativa en templates",
                        "loadComponent: carga diferida de componentes",
                        "wildcard ** : captura rutas desconocidas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Organizar las rutas en archivos separados y cargar las vistas bajo demanda mantiene la aplicación ágil aunque crezca en tamaño."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El router mapea URLs a componentes",
                        "loadComponent activa el lazy loading",
                        "router-outlet marca dónde renderizar",
                        "Rutas desconocidas se manejan con el wildcard"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 195,
            "title": "Rutas y Producción",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "guards-y-resolvers": {
        "id": 492,
        "module_id": 195,
        "title": "Guards y resolvers",
        "slug": "guards-y-resolvers",
        "type": "article",
        "duration_minutes": 13,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Guards y resolvers"
                },
                {
                    "type": "paragraph",
                    "text": "Los guards protegen rutas según autenticación o roles, y los resolvers preparan datos antes de renderizar la vista. Ambos se ejecutan durante la navegación."
                },
                {
                    "type": "paragraph",
                    "text": "Un guard canActivate devuelve true y deja pasar, o false y redirige a login. Un resolver carga datos y los entrega al componente ya resueltos."
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "import { inject } from \"@angular/core\";\nimport { CanActivateFn, Router } from \"@angular/router\";\nimport { AuthService } from \"./auth.service\";\n\nexport const requiereLogin: CanActivateFn = () => {\n    const auth = inject(AuthService);\n    const router = inject(Router);\n\n    if (auth.estaAutenticado()) {\n        return true;\n    }\n    return router.createUrlTree([\"/login\"]);\n};"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de guards"
                },
                {
                    "type": "list",
                    "items": [
                        "canActivate: permite o bloquea entrar a una ruta",
                        "canDeactivate: permite o bloquea salir",
                        "canLoad: controla la carga diferida",
                        "Resolvers: entregan datos antes de pintar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La seguridad real siempre vive en el backend; los guards son UX y organización: evitan que el usuario vea pantallas para las que no tiene permiso."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los guards controlan el acceso a rutas",
                        "canActivate bloquea o redirige",
                        "Los resolvers preparan datos antes de renderizar",
                        "El backend siempre debe validar de nuevo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 195,
            "title": "Rutas y Producción",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "despliegue-angular": {
        "id": 493,
        "module_id": 195,
        "title": "Build de producción y despliegue",
        "slug": "despliegue-angular",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Build de producción y despliegue"
                },
                {
                    "type": "paragraph",
                    "text": "ng build genera los archivos estáticos optimizados: minificados, con hash en los nombres para cachear y listos para cualquier hosting estático."
                },
                {
                    "type": "paragraph",
                    "text": "En producción hay que configurar el rewrite del servidor para que todas las rutas de la SPA apunten a index.html, y ajustar la URL de la API con environments o variables."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Build de producción\nng build --configuration production\n\n# Se generan en dist/ archivos estáticos listos para servir\n# Ejemplo con un servidor estático simple\nnpx http-server dist/browser -p 8080"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Checklist de despliegue"
                },
                {
                    "type": "list",
                    "items": [
                        "Build con configuración de producción",
                        "Serve los estáticos con CDN o hosting",
                        "Rewrite de todas las rutas a index.html",
                        "Variables de entorno para la API"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Como el routing lo gestiona Angular en el cliente, el servidor debe devolver index.html para cualquier ruta; si devuelve 404, refrescar /productos romperá la app."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "ng build produce estáticos optimizados",
                        "El hosting debe hacer fallback a index.html",
                        "La URL de la API se configura por entorno",
                        "Probar el build final antes de publicar"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 195,
            "title": "Rutas y Producción",
            "course_id": 10,
            "course_slug": "angular-moderno",
            "course_title": "Angular Moderno",
            "course": {
                "id": 10,
                "slug": "angular-moderno",
                "title": "Angular Moderno"
            }
        }
    },
    "html-accesible-y-aria": {
        "id": 494,
        "module_id": 13,
        "title": "HTML accesible y ARIA",
        "slug": "html-accesible-y-aria",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "HTML accesible y ARIA"
                },
                {
                    "type": "paragraph",
                    "text": "Antes de ARIA, el HTML semántico resuelve la mayoría de los casos: botones reales, labels, encabezados jerárquicos y landmarks. ARIA complementa donde el HTML nativo no alcanza."
                },
                {
                    "type": "paragraph",
                    "text": "La regla de oro de ARIA: no usarlo si el HTML nativo ya lo resuelve. Un div con role=button no sustituye a un botón real, que trae teclado y focus gratis."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<!-- Mal: un div que parece botón -->\n<div class=\"btn\" onclick=\"guardar()\">Guardar</div>\n\n<!-- Bien: botón nativo -->\n<button class=\"btn\" onclick=\"guardar()\">Guardar</button>\n\n<!-- ARIA para estados que el HTML no expresa -->\n<button aria-expanded=\"false\" aria-controls=\"menu\">Menú</button>\n<div id=\"menu\" role=\"menu\">...</div>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Principios ARIA"
                },
                {
                    "type": "list",
                    "items": [
                        "Prefiere HTML semántico siempre",
                        "aria-label nombra elementos sin texto visible",
                        "aria-expanded comunica estado de acordeones",
                        "aria-label overrides el texto visible si cambia"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Usar ARIA bien exige conocer lo que hace cada atributo; un uso incorrecto puede confundir más que ayudar a los lectores de pantalla."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El HTML semántico es la primera accesibilidad",
                        "ARIA complementa, no sustituye",
                        "aria-expanded y aria-controls para menús",
                        "Los botones reales traen comportamiento gratis"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 13,
            "title": "Accesibilidad",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "estados-y-staging": {
        "id": 543,
        "module_id": 20,
        "title": "Los tres estados: working, staging y commit",
        "slug": "estados-y-staging",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Los tres estados: working, staging y commit"
                },
                {
                    "type": "paragraph",
                    "text": "Git divide tu trabajo en tres áreas: el working directory (tus archivos editados), el staging area (cambios preparados) y el repositorio (commits sellados). Cada archivo puede estar modificado, preparado o confirmado."
                },
                {
                    "type": "paragraph",
                    "text": "Entender las áreas explica comandos que parecen mágicos: git add mueve de working a staging; git commit mueve de staging al repositorio; git restore devuelve archivos al estado de un commit."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Flujo entre áreas\necho \"cambio\" >> README.md\ngit status                # README modificado (working)\ngit add README.md\ngit status                # README en staging\ngit commit -m \"docs: mejora el README\"\ngit log --oneline         # nuevo commit en el repositorio\n\n# Moverse hacia atrás\ngit restore README.md         # descarta cambios del working\ngit restore --staged README.md  # saca del staging sin borrar"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Las tres áreas"
                },
                {
                    "type": "list",
                    "items": [
                        "Working directory: archivos que editas",
                        "Staging area: cambios preparados, aún no sellados",
                        "Repositorio: historial de commits",
                        "git status te dice en qué área está cada archivo",
                        "git restore regresa archivos de un área a otra"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El staging permite construir commits con precisión: puedes preparar solo una parte de los cambios de un archivo (git add -p) y dejar el resto fuera. Es la herramienta clave para commits atómicos aunque hayas tocado varias cosas a la vez."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Working, staging y repositorio: el modelo mental de Git",
                        "add prepara, commit sella",
                        "git restore descarta o saca del staging",
                        "git status narra el estado completo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 20,
            "title": "Primeros pasos",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "core-web-vitals": {
        "id": 31,
        "module_id": 196,
        "title": "Core Web Vitals y performance",
        "slug": "core-web-vitals",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Core Web Vitals y performance"
                },
                {
                    "type": "paragraph",
                    "text": "LCP, INP y CLS son las métricas que evalúan la experiencia real: cuánto tarda en cargar el contenido principal, la latencia de interacción y la estabilidad visual."
                },
                {
                    "type": "paragraph",
                    "text": "LCP mide la carga del contenido más grande; INP la respuesta a las interacciones; CLS los saltos de layout. Optimizarlas impacta directamente en la satisfacción y en el SEO."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Observar Core Web Vitals en producción\nconst vitals = new PerformanceObserver((lista) => {\n    for (const entrada of lista.getEntries()) {\n        console.log(entrada.name, entrada.value);\n    }\n});\nvitals.observe({ type: \"largest-contentful-paint\", buffered: true });"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Objetivos recomendados"
                },
                {
                    "type": "list",
                    "items": [
                        "LCP menor de 2.5 segundos",
                        "INP menor de 200 milisegundos",
                        "CLS menor de 0.1",
                        "Medir en campo con usuarios reales"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las métricas de laboratorio (Lighthouse) y las de campo (CrUX) se complementan: el laboratorio detecta regresiones y el campo muestra la experiencia real de los usuarios."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "LCP: carga del contenido principal",
                        "INP: latencia de interacción",
                        "CLS: estabilidad visual",
                        "Medir en campo es la verdad final"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 196,
            "title": "Performance",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "optimizacion-de-recursos": {
        "id": 496,
        "module_id": 196,
        "title": "Optimización de recursos",
        "slug": "optimizacion-de-recursos",
        "type": "code_challenge",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Optimización de recursos"
                },
                {
                    "type": "paragraph",
                    "text": "Las imágenes dominan el peso de la mayoría de las páginas. Servirlas en formatos modernos, con el tamaño correcto y lazy loading reduce drásticamente los bytes transferidos."
                },
                {
                    "type": "paragraph",
                    "text": "El JavaScript también se optimiza: elimina lo que no se usa, difiere la carga no crítica y carga bajo demanda las rutas secundarias."
                },
                {
                    "type": "code",
                    "language": "html",
                    "text": "<!-- Imagen responsive con formatos modernos -->\n<img\n    src=\"foto.avif\"\n    srcset=\"foto-400.avif 400w, foto-800.avif 800w\"\n    sizes=\"(max-width: 768px) 100vw, 800px\"\n    width=\"800\" height=\"600\"\n    loading=\"lazy\"\n    alt=\"Descripción\">\n\n<!-- Cargar scripts sin bloquear el render -->\n<script src=\"app.js\" defer></script>"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Palancas de optimización"
                },
                {
                    "type": "list",
                    "items": [
                        "Formatos modernos: WebP/AVIF en vez de JPEG/PNG",
                        "Tamaño correcto: nunca servir 2000px donde caben 400",
                        "loading=lazy en imágenes fuera del viewport",
                        "defer/async para scripts no críticos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Declarar width y height evita el CLS por imágenes; el lazy loading retrasa descargas que el usuario aún no ve. Combinadas, estas dos prácticas son de las más rentables."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Las imágenes son el mayor peso típico",
                        "Formato y tamaño correctos ahorran megabytes",
                        "lazy loading descarga solo lo visible",
                        "width y height evitan saltos de layout"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 196,
            "title": "Performance",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "medicion-y-presupuestos": {
        "id": 497,
        "module_id": 196,
        "title": "Medición y presupuestos de rendimiento",
        "slug": "medicion-y-presupuestos",
        "type": "article",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Medición y presupuestos de rendimiento"
                },
                {
                    "type": "paragraph",
                    "text": "Un presupuesto de rendimiento fija límites: máximo de kilobytes por página, máximo de peticiones, tiempo máximo de LCP. Lo que no se mide, se degrada sin aviso."
                },
                {
                    "type": "paragraph",
                    "text": "Herramientas como Lighthouse CI comparan cada cambio con el presupuesto y bloquean si se excede. Así el rendimiento se trata como una característica más."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Ejemplo de presupuesto con Lighthouse CI en package.json\n# \"budgets\": [{ \"path\": \"/*\", \"resourceSizes\": [\n#   { \"resourceType\": \"script\", \"budget\": 150 },\n#   { \"resourceType\": \"image\", \"budget\": 300 }\n# ]}]"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué incluir en el presupuesto"
                },
                {
                    "type": "list",
                    "items": [
                        "Peso total de la página",
                        "Peso de JavaScript por ruta",
                        "Número de peticiones",
                        "Core Web Vitals objetivo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Empieza midiendo el estado actual: sin línea de base no hay presupuesto realista. Después fija límites ligeramente mejores y revisa cada semana."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Sin medición no hay mejora sostenida",
                        "El presupuesto convierte el rendimiento en requisito",
                        "Lighthouse CI automatiza el control",
                        "La línea de base precede al presupuesto"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 196,
            "title": "Performance",
            "course_id": 11,
            "course_slug": "accesibilidad-y-performance-web",
            "course_title": "Accesibilidad y Performance Web",
            "course": {
                "id": 11,
                "slug": "accesibilidad-y-performance-web",
                "title": "Accesibilidad y Performance Web"
            }
        }
    },
    "modelo-cliente-servidor": {
        "id": 9,
        "module_id": 5,
        "title": "El modelo Cliente-Servidor",
        "slug": "modelo-cliente-servidor",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El modelo Cliente-Servidor"
                },
                {
                    "type": "paragraph",
                    "text": "En el modelo cliente-servidor, el cliente (navegador, app móvil u otro servicio) envía peticiones y el servidor responde. Este desacople separa la presentación de la lógica de negocio y permite escalar cada parte por separado."
                },
                {
                    "type": "paragraph",
                    "text": "Las variantes como el cliente grueso procesan parte de la lógica localmente, reduciendo la carga del servidor. La mayoría de las aplicaciones modernas combinan ambos enfoques."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// El cliente pide datos; el servidor decide qué devolver\n// Petición: GET /api/pedidos?estado=pendiente\nRoute::get('/api/pedidos', function (Request $request) {\n    return Pedido::where('estado', $request->query('estado'))->get();\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características del modelo"
                },
                {
                    "type": "list",
                    "items": [
                        "El cliente inicia la comunicación",
                        "El servidor espera y responde peticiones",
                        "Puede haber muchos clientes contra un servidor",
                        "La responsabilidad de cada parte está definida"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un servidor puede ser cliente de otro servicio: por ejemplo, tu backend consulta una pasarela de pagos. El rol depende del contexto, no de la máquina."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El cliente pide, el servidor responde",
                        "El desacople permite escalar por separado",
                        "Los clientes pueden ser web, móvil u otros servidores",
                        "Una API puede ser cliente de otra API"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 5,
            "title": "El Mundo del Backend",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "estructuras-datos-lineales-quiz-big-o-y-estructuras-lineales": {
        "id": 595,
        "module_id": 225,
        "title": "Quiz: Big-O y Estructuras Lineales",
        "slug": "estructuras-datos-lineales-quiz-big-o-y-estructuras-lineales",
        "type": "quiz",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": "## Quiz: Big-O y Estructuras Lineales\n\nComprueba tus conocimientos sobre análisis de algoritmos, complejidad asintótica y estructuras LIFO/FIFO.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 225,
            "title": "Pilas y Colas (LIFO vs FIFO)",
            "course_id": 99,
            "course_slug": "estructuras-datos-lineales",
            "course_title": "Estructuras de Datos Lineales y Complejidad",
            "course": {
                "id": 99,
                "slug": "estructuras-datos-lineales",
                "title": "Estructuras de Datos Lineales y Complejidad"
            }
        }
    },
    "http-y-sus-metodos": {
        "id": 10,
        "module_id": 5,
        "title": "HTTP y sus métodos",
        "slug": "http-y-sus-metodos",
        "type": "article",
        "duration_minutes": 20,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "HTTP y sus métodos"
                },
                {
                    "type": "paragraph",
                    "text": "HTTP define cómo se comunican cliente y servidor. Cada petición tiene un método (GET, POST, PUT, DELETE, PATCH), una URL, cabeceras y opcionalmente un cuerpo."
                },
                {
                    "type": "paragraph",
                    "text": "Los códigos de estado resumen el resultado: 2xx éxito, 3xx redirección, 4xx error del cliente y 5xx error del servidor. Comprender bien HTTP es el primer paso para diseñar APIs correctas y debugar servicios."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# GET: leer un recurso\ncurl https://api.example.com/usuarios/1\n\n# POST: crear (envía datos en el cuerpo)\ncurl -X POST https://api.example.com/usuarios \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"nombre\": \"Ana\"}'\n\n# DELETE: borrar\ncurl -X DELETE https://api.example.com/usuarios/1"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Métodos y semántica"
                },
                {
                    "type": "list",
                    "items": [
                        "GET: leer sin efectos secundarios",
                        "POST: crear o enviar datos",
                        "PUT: reemplazar un recurso completo",
                        "PATCH: actualizar parcialmente",
                        "DELETE: borrar un recurso"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cada método tiene una semántica clara; respetarla hace las APIs predecibles y permite a las herramientas y cachés optimizar por ti."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "GET es para leer; POST para crear o enviar",
                        "PUT reemplaza; PATCH actualiza parcialmente",
                        "DELETE borra recursos",
                        "Los códigos 2xx, 4xx y 5xx comunican el resultado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 5,
            "title": "El Mundo del Backend",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "que-es-un-servidor-web": {
        "id": 498,
        "module_id": 197,
        "title": "¿Qué es un servidor web?",
        "slug": "que-es-un-servidor-web",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es un servidor web?"
                },
                {
                    "type": "paragraph",
                    "text": "Un servidor web es un software que escucha peticiones HTTP y devuelve respuestas: archivos estáticos (HTML, CSS, JS) o contenido dinámico generado por tu aplicación."
                },
                {
                    "type": "paragraph",
                    "text": "NGINX y Apache son los más usados. Pueden servir estáticos directamente y delegar lo dinámico a PHP, Python o Node mediante proxies o interfaces como PHP-FPM."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Servidor de desarrollo de PHP para probar en local\nphp -S localhost:8000 -t public\n\n# En producción: NGINX + PHP-FPM gestionan la app\n# Este comando solo simula lo que hace un servidor real"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué hace un servidor web"
                },
                {
                    "type": "list",
                    "items": [
                        "Escuchar en un puerto las peticiones HTTP",
                        "Servir archivos estáticos",
                        "Ejecutar o delegar la aplicación dinámica",
                        "Gestionar TLS, logs y compresión"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "No necesitas montar NGINX para desarrollar: el servidor embebido de PHP o artisan serve bastan. Pero saber qué ocurre en producción te evita sorpresas al desplegar."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El servidor web responde peticiones HTTP",
                        "Sirve estáticos y delega lo dinámico",
                        "NGINX y Apache dominan la producción",
                        "En local se usa un servidor de desarrollo simple"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 197,
            "title": "Servidores y APIs",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "que-es-una-api": {
        "id": 499,
        "module_id": 197,
        "title": "¿Qué es una API?",
        "slug": "que-es-una-api",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "¿Qué es una API?"
                },
                {
                    "type": "paragraph",
                    "text": "Una API (Interfaz de Programación de Aplicaciones) es el contrato por el que un programa habla con otro. En la web, las APIs HTTP exponen recursos mediante URLs y métodos."
                },
                {
                    "type": "paragraph",
                    "text": "El frontend no consulta la base de datos directamente: consume la API, recibe JSON y decide cómo mostrarlo. Ese contrato define qué puede pedir cada cliente y qué recibe."
                },
                {
                    "type": "code",
                    "language": "javascript",
                    "text": "// Un cliente (frontend) consumiendo una API\nconst respuesta = await fetch(\"/api/productos\");\nconst productos = await respuesta.json();\n\nconsole.log(productos.data[0].nombre);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Características de una buena API"
                },
                {
                    "type": "list",
                    "items": [
                        "Contrato claro: endpoints, métodos y formatos",
                        "Respuestas JSON consistentes",
                        "Errores descriptivos con códigos correctos",
                        "Documentación para quien la consume"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Diseñar una API es diseñar un contrato público: los cambios rompen a los consumidores. Por eso versionas y documentas antes de publicar."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La API es el contrato entre programas",
                        "HTTP + JSON es la base de las APIs web",
                        "El frontend consume la API, no la BD",
                        "Documentar y versionar protege a los consumidores"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 197,
            "title": "Servidores y APIs",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "arquitectura-de-un-backend": {
        "id": 500,
        "module_id": 197,
        "title": "Arquitectura típica de un backend",
        "slug": "arquitectura-de-un-backend",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Arquitectura típica de un backend"
                },
                {
                    "type": "paragraph",
                    "text": "Un backend bien organizado separa responsabilidades en capas: rutas que reciben peticiones, controladores que orquestan, servicios con la lógica, repositorios o modelos que acceden a datos."
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel, las rutas apuntan a controladores, los modelos Eloquent representan tablas y los servicios encapsulan reglas de negocio que no pertenecen a ninguna de las capas anteriores."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Capa de ruta: define el endpoint\nRoute::get('/api/pedidos/{pedido}', [PedidoController::class, 'show']);\n\n// Capa de controlador: orquesta\npublic function show(Pedido $pedido)\n{\n    return PedidoResource::make($pedido->load('items'));\n}\n\n// La lógica compleja vive en servicios o modelos, no en la ruta"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Capas típicas"
                },
                {
                    "type": "list",
                    "items": [
                        "Rutas: mapa URL -> acción",
                        "Controladores: orquestan la petición",
                        "Servicios: reglas de negocio reutilizables",
                        "Modelos/Repositorios: acceso a datos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla práctica: las rutas deben ser delgadas, los controladores ordenados y la lógica de negocio testeable en servicios. Así cada pieza se prueba por separado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Separar capas mejora el mantenimiento",
                        "Las rutas son el mapa de entrada",
                        "La lógica compleja vive en servicios",
                        "Cada capa debe poder probarse por separado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 197,
            "title": "Servidores y APIs",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "coste-de-los-errores": {
        "id": 49,
        "module_id": 22,
        "title": "El coste de los errores de requerimientos",
        "slug": "coste-de-los-errores",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El coste de los errores de requerimientos"
                },
                {
                    "type": "paragraph",
                    "text": "El error más caro en software no es un bug de código: es construir la funcionalidad equivocada. Corregir un requerimiento mal entendido durante el análisis cuesta poco; corregirlo en producción puede costar decenas de veces más, porque ya hay código, tests y despliegues construidos sobre la idea errónea."
                },
                {
                    "type": "paragraph",
                    "text": "Cuanto más tarde se detecta un error, más caro se corrige. Por eso la ingeniería de requerimientos invierte donde el coste es mínimo: entender y validar antes de construir, con prototipos, conversaciones y criterios de aceptación."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Coste relativo de corregir un error de requerimientos\n$fases = [\n    'Análisis'           => 1,   // 1x : se corrige el documento\n    'Diseño'             => 5,   // 5x : se corrige el diseño\n    'Implementación'     => 10,  // 10x: se reescribe código y tests\n    'Pruebas'            => 20,  // 20x: se rehacen pruebas y casos\n    'Producción'         => 100, // 100x: parche, release y soporte\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Lecciones prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "El error más caro es construir lo equivocado",
                        "Detectar tarde multiplica el coste por decenas",
                        "Invertir en análisis es el mejor retorno",
                        "Preguntar antes de construir no es perder tiempo",
                        "Criterios de aceptación validan el entendimiento"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La herramienta más barata del proyecto es una pregunta bien hecha en la fase correcta. Convertir suposiciones en conversaciones, y conversaciones en criterios verificables, es la esencia de un buen análisis de requerimientos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Errores de requerimientos = los más caros",
                        "El coste crece con cada fase que avanza",
                        "Validar temprano sale barato",
                        "Preguntas y criterios de aceptación evitan construir mal"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 22,
            "title": "Conceptos clave",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "rutas-y-controladores": {
        "id": 12,
        "module_id": 6,
        "title": "Rutas y controladores",
        "slug": "rutas-y-controladores",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Rutas y controladores"
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel las rutas se registran en routes/api.php y delegan en controladores. Los controladores agrupan la lógica de un recurso y usan Request y Response tipados."
                },
                {
                    "type": "paragraph",
                    "text": "Con resource controllers obtienes las acciones REST estándar: index, store, show, update y destroy, listas para personalizar."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// routes/api.php\nRoute::apiResource('usuarios', UsuarioController::class);\n\n// app/Http/Controllers/Api/UsuarioController.php\npublic function store(StoreUsuarioRequest $request)\n{\n    $usuario = Usuario::create($request->validated());\n\n    return UsuarioResource::make($usuario)\n        ->response()\n        ->setStatusCode(201);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Acciones del resource controller"
                },
                {
                    "type": "list",
                    "items": [
                        "index: listar recursos",
                        "store: crear",
                        "show: mostrar uno",
                        "update: actualizar",
                        "destroy: borrar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las Form Requests (StoreUsuarioRequest) mueven la validación fuera del controlador, dejándolo limpio y la regla reutilizable."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "apiResource registra el CRUD completo",
                        "El controlador orquesta cada acción",
                        "Las Form Requests aíslan la validación",
                        "Devolver 201 al crear es señal de una API cuidada"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 6,
            "title": "Principios REST",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "validacion-y-respuestas-json": {
        "id": 13,
        "module_id": 6,
        "title": "Validación y respuestas JSON",
        "slug": "validacion-y-respuestas-json",
        "type": "article",
        "duration_minutes": 20,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Validación y respuestas JSON"
                },
                {
                    "type": "paragraph",
                    "text": "Toda entrada del usuario debe validarse antes de tocar la base de datos. Laravel ofrece reglas declarativas (required, email, unique, max...) y devuelve errores en JSON automáticamente."
                },
                {
                    "type": "paragraph",
                    "text": "Las respuestas deben tener forma consistente: datos bajo una clave data, errores con su mensaje y siempre Content-Type application/json."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\npublic function store(StoreUsuarioRequest $request)\n{\n    $validado = $request->validated();\n\n    return response()->json([\n        'data' => Usuario::create($validado),\n    ], 201);\n}\n\n// Reglas en StoreUsuarioRequest\npublic function rules(): array\n{\n    return [\n        'email' => ['required', 'email', 'unique:usuarios,email'],\n        'password' => ['required', 'min:8'],\n    ];\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de respuestas"
                },
                {
                    "type": "list",
                    "items": [
                        "Envolver datos en data para estructuras estables",
                        "Usar los códigos HTTP adecuados",
                        "Errores con mensajes útiles y claves de campo",
                        "Nunca exponer trazas internas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La consistencia es el contrato: si siempre devuelves {data: ...} y los errores {message, errors}, el frontend puede construir clientes genéricos y robustos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Validar antes de persistir, siempre",
                        "Las reglas declarativas cubren la mayoría de los casos",
                        "Un formato de respuesta consistente simplifica al cliente",
                        "Los errores útiles aceleran la integración"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 6,
            "title": "Principios REST",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "eloquent-en-apis": {
        "id": 501,
        "module_id": 7,
        "title": "Eloquent en tus APIs",
        "slug": "eloquent-en-apis",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Eloquent en tus APIs"
                },
                {
                    "type": "paragraph",
                    "text": "Eloquent es el ORM de Laravel: cada modelo representa una tabla y cada instancia una fila. En las APIs lo usas constantemente, pero debes controlar qué se expone."
                },
                {
                    "type": "paragraph",
                    "text": "Con $hidden ocultas campos sensibles, con append añades atributos calculados y con Resources controlas exactamente la forma JSON de la respuesta."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nclass Usuario extends Model\n{\n    protected $hidden = ['password', 'remember_token'];\n\n    public function pedidos()\n    {\n        return $this->hasMany(Pedido::class);\n    }\n}\n\n// En el controlador\nreturn UsuarioResource::collection(\n    Usuario::with('pedidos')->paginate(15)\n);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas con Eloquent"
                },
                {
                    "type": "list",
                    "items": [
                        "Ocultar credenciales con $hidden",
                        "Cargar relaciones con with para evitar N+1",
                        "Usar Resources para dar forma a la respuesta",
                        "Paginación para listas grandes"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Nunca devuelvas el modelo crudo con toArray si contiene campos sensibles: define qué sale por la API con Resources y $hidden."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Eloquent mapea tablas a modelos",
                        "$hidden protege campos sensibles",
                        "with() carga relaciones de una vez",
                        "Los Resources definen el JSON de la API"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 7,
            "title": "Eloquent y Seguridad",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "manejo-de-errores": {
        "id": 14,
        "module_id": 7,
        "title": "Manejo de errores 4xx y 5xx",
        "slug": "manejo-de-errores",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Manejo de errores 4xx y 5xx"
                },
                {
                    "type": "paragraph",
                    "text": "Una API debe responder errores con información útil: 404 cuando el recurso no existe, 422 cuando la validación falla y 500 para fallos inesperados (sin exponer detalles internos)."
                },
                {
                    "type": "paragraph",
                    "text": "Define una estructura común para errores, por ejemplo {message, errors}, y documenta los códigos posibles para cada endpoint."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Excepción personalizada para recursos no encontrados\nclass RecursoNoEncontradoException extends Exception {}\n\n// En el handler de excepciones\npublic function render($request, Throwable $e)\n{\n    if ($e instanceof RecursoNoEncontradoException) {\n        return response()->json([\n            'message' => 'El recurso no existe',\n        ], 404);\n    }\n\n    return parent::render($request, $e);\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Errores típicos de una API"
                },
                {
                    "type": "list",
                    "items": [
                        "400: petición malformada",
                        "401: no autenticado",
                        "403: autenticado pero sin permiso",
                        "404: recurso inexistente",
                        "422: validación fallida"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El 500 jamás debe revelar trazas, consultas o archivos internos: el cliente solo necesita saber que algo falló y, si procede, un identificador para reportarlo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cada error usa su código HTTP correcto",
                        "Estructura de error consistente",
                        "Nunca exponer detalles internos en 5xx",
                        "Documentar los errores por endpoint"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 7,
            "title": "Eloquent y Seguridad",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "probando-apis-con-curl": {
        "id": 15,
        "module_id": 7,
        "title": "Probando APIs con curl",
        "slug": "probando-apis-con-curl",
        "type": "code_challenge",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Probando APIs con curl"
                },
                {
                    "type": "paragraph",
                    "text": "curl es la herramienta esencial para probar endpoints: -X para el método, -H para cabeceras y -d para el cuerpo. Con --max-time evitas peticiones colgadas y con -w puedes medir tiempos."
                },
                {
                    "type": "paragraph",
                    "text": "Postman o Thunder Client añaden interfaz visual, colecciones reutilizables y pruebas automatizadas sobre la misma API."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Crear un usuario y ver el código de estado\ncurl -s -o /dev/null -w \"%{http_code}\\n\" \\\n  -X POST http://localhost:8000/api/usuarios \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Accept: application/json\" \\\n  -d '{\"nombre\": \"Ana\", \"email\": \"ana@example.com\"}'\n\n# Con autenticación\ncurl -H \"Authorization: Bearer TOKEN\" \\\n  http://localhost:8000/api/usuarios"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Patrones de prueba útiles"
                },
                {
                    "type": "list",
                    "items": [
                        "-s silencia el progreso; -o /dev/null descarta el cuerpo",
                        "-w %{http_code} imprime solo el código de estado",
                        "-H establece cabeceras como Content-Type y Authorization",
                        "--max-time evita peticiones colgadas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Tener una colección de curl o de Postman por endpoint es documentación ejecutable: cualquiera puede reproducir la petición y ver la respuesta real."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "curl prueba métodos, cabeceras y cuerpos",
                        "-w %{http_code} verifica el estado",
                        "La cabecera Accept: application/json pide JSON",
                        "Las colecciones son documentación viva"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 7,
            "title": "Eloquent y Seguridad",
            "course_id": 6,
            "course_slug": "apis-rest-con-laravel",
            "course_title": "APIs REST con Laravel",
            "course": {
                "id": 6,
                "slug": "apis-rest-con-laravel",
                "title": "APIs REST con Laravel"
            }
        }
    },
    "relaciones-uno-a-muchos": {
        "id": 17,
        "module_id": 8,
        "title": "Relaciones uno a muchos y muchos a muchos",
        "slug": "relaciones-uno-a-muchos",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Relaciones uno a muchos y muchos a muchos"
                },
                {
                    "type": "paragraph",
                    "text": "Las relaciones definen cómo se conectan las tablas: hasMany/belongsTo para uno a muchos, belongsToMany para muchos a muchos. Declararlas en el modelo permite encadenar consultas como course->lessons."
                },
                {
                    "type": "paragraph",
                    "text": "Cargar relaciones con with() evita el problema N+1: una consulta por el recurso y otra por cada relación, en vez de una por fila."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nclass Curso extends Model\n{\n    // Uno a muchos: un curso tiene muchas lecciones\n    public function lecciones()\n    {\n        return $this->hasMany(Leccion::class);\n    }\n\n    // Muchos a muchos: curso <-> estudiante vía tabla pivote\n    public function estudiantes()\n    {\n        return $this->belongsToMany(Estudiante::class);\n    }\n}\n\n// Evitar N+1: cargar en una sola consulta\n$cursos = Curso::with('lecciones')->get();"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de relaciones"
                },
                {
                    "type": "list",
                    "items": [
                        "hasMany/belongsTo: uno a muchos",
                        "belongsToMany: muchos a muchos con tabla pivote",
                        "hasOne: uno a uno",
                        "with() carga eager para evitar N+1"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La clave está en declarar las relaciones en el modelo y cargarlas con with cuando las necesites; cargar siempre todas las relaciones que no usas también desperdicia recursos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "hasMany va del padre al hijo; belongsTo del hijo al padre",
                        "belongsToMany conecta muchos a muchos",
                        "with() elimina las consultas repetidas",
                        "Carga solo las relaciones que necesitas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 8,
            "title": "Eloquent y el Modelo de Datos",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "consultas-e-indices": {
        "id": 18,
        "module_id": 8,
        "title": "Consultas eficientes e índices",
        "slug": "consultas-e-indices",
        "type": "article",
        "duration_minutes": 20,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Consultas eficientes e índices"
                },
                {
                    "type": "paragraph",
                    "text": "Una consulta eficiente nace de un buen índice y de seleccionar solo lo necesario: usa select() para no traer columnas extra, paginate() para listas grandes y agrega índices a las columnas que filtras con where u ordenas."
                },
                {
                    "type": "paragraph",
                    "text": "Evita consultas dentro de bucles y revisa las queries generadas con toSql() o un logger de queries."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Migración con índice en la columna filtrada\nSchema::table('pedidos', function (Blueprint $table) {\n    $table->index('estado');\n});\n\n// Consulta eficiente: columnas justas + paginación\n$pedidos = Pedido::select('id', 'total', 'estado')\n    ->where('estado', 'pendiente')\n    ->orderBy('created_at')\n    ->paginate(20);"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Señales de consulta lenta"
                },
                {
                    "type": "list",
                    "items": [
                        "Filtros por columnas sin índice",
                        "SELECT * en tablas anchas",
                        "Consultas dentro de bucles (N+1)",
                        "Falta de paginación en listas grandes"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El planificador de PostgreSQL usa índices cuando el beneficio supera el coste; los índices aceleran lecturas, pero cada índice añade coste en escritura. Índices justos, no índices por si acaso."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Índices en columnas de where y orderBy",
                        "select() trae solo lo necesario",
                        "paginate() controla listas grandes",
                        "Consultas en bucles = red flag"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 8,
            "title": "Eloquent y el Modelo de Datos",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "scopes-y-consultas-reutilizables": {
        "id": 502,
        "module_id": 198,
        "title": "Scopes y consultas reutilizables",
        "slug": "scopes-y-consultas-reutilizables",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Scopes y consultas reutilizables"
                },
                {
                    "type": "paragraph",
                    "text": "Los scopes encapsulan filtros comunes del modelo en métodos reutilizables: en vez de repetir where('estado', 'pendiente') por todas partes, defines un scope activo() que hace lo mismo."
                },
                {
                    "type": "paragraph",
                    "text": "Los scopes locales se declaran con prefijo scope y se llaman como if (sin el prefijo): Curso::publicado()->latest()->get()."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nclass Curso extends Model\n{\n    public function scopePublicado($query)\n    {\n        return $query->where('is_published', true);\n    }\n\n    public function scopeDificultad($query, string $nivel)\n    {\n        return $query->where('difficulty', $nivel);\n    }\n}\n\n// Uso: encadenable y legible\n$cursos = Curso::publicado()->dificultad('beginner')->get();"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Beneficios de los scopes"
                },
                {
                    "type": "list",
                    "items": [
                        "Evitan repetir condiciones",
                        "Centralizan reglas de consulta",
                        "Se encadenan con otros métodos",
                        "Documentan la intención de la consulta"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cada condición de negocio repetida es candidata a scope: si cambia la regla, cambias un solo lugar y toda la app se beneficia."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "scopeNombre define un filtro reutilizable",
                        "Se llaman sin el prefijo scope",
                        "Se encadenan con otras cláusulas",
                        "Centralizan las reglas de negocio de consulta"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 198,
            "title": "Consultas Avanzadas",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "agregaciones-y-consultas-complejas": {
        "id": 503,
        "module_id": 198,
        "title": "Agregaciones y consultas complejas",
        "slug": "agregaciones-y-consultas-complejas",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Agregaciones y consultas complejas"
                },
                {
                    "type": "paragraph",
                    "text": "Eloquent expone count, sum, avg, max y min para agregar datos, y withCount para traer contadores de relaciones sin cargarlas completas."
                },
                {
                    "type": "paragraph",
                    "text": "Para reportes avanzados puedes usar selectRaw y groupBy, pero cuando la consulta crece, considera una vista o un query builder más fino."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Contador sin cargar las filas\n$cursos = Curso::withCount('lecciones')->get();\n// $curso->lecciones_count\n\n// Agregación simple\n$total = Pedido::where('estado', 'pagado')->sum('total');\n\n// Agrupación para reportes\n$porEstado = Pedido::selectRaw('estado, count(*) as total')\n    ->groupBy('estado')\n    ->get();"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar cada herramienta"
                },
                {
                    "type": "list",
                    "items": [
                        "withCount: contadores de relaciones",
                        "sum/avg/max/min: agregaciones directas",
                        "selectRaw: expresiones SQL específicas",
                        "groupBy: reportes por categoría"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Trae del servidor solo el número que necesitas: si solo quieres cuántas lecciones tiene un curso, withCount evita cargar cientos de filas para contarlas en PHP."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "withCount añade contadores sin cargar relaciones",
                        "Las agregaciones se resuelven en la BD, no en PHP",
                        "groupBy arma reportes",
                        "Cuenta y suma en SQL evita transferencias pesadas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 198,
            "title": "Consultas Avanzadas",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "transacciones-y-consistencia": {
        "id": 504,
        "module_id": 198,
        "title": "Transacciones y consistencia",
        "slug": "transacciones-y-consistencia",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Transacciones y consistencia"
                },
                {
                    "type": "paragraph",
                    "text": "Una transacción agrupa varias operaciones de base de datos en una unidad atómica: si una falla, todas se revierten. Sin ella, un fallo a mitad de camino deja datos a medias."
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel, DB::transaction ejecuta un cierre y hace commit si termina bien o rollback si lanza una excepción."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\nuse Illuminate\\Support\\Facades\\DB;\n\nDB::transaction(function () {\n    $pedido = Pedido::create($datos);\n    $pedido->items()->createMany($items);\n\n    // Si esto falla, se revierte todo lo anterior\n    $inventario = Inventario::where('id', $items[0]['producto_id']);\n    $inventario->decrement('stock', 1);\n});"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar transacciones"
                },
                {
                    "type": "list",
                    "items": [
                        "Crear registros con hijos dependientes",
                        "Movimientos que deben ser atómicos (pagos, stock)",
                        "Actualizaciones que tocan varias tablas",
                        "Cualquier operación que no puede quedar a medias"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las transacciones protegen la consistencia, pero no sustituyen a las validaciones ni a los índices: son una capa más del diseño correcto."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Transacción = todo o nada",
                        "DB::transaction revierte ante excepciones",
                        "Ideal para crear hijos dependientes",
                        "Las operaciones atómicas protegen la integridad"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 198,
            "title": "Consultas Avanzadas",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "owasp-para-desarrolladores": {
        "id": 20,
        "module_id": 9,
        "title": "OWASP Top 10 para desarrolladores",
        "slug": "owasp-para-desarrolladores",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "OWASP Top 10 para desarrolladores"
                },
                {
                    "type": "paragraph",
                    "text": "El OWASP Top 10 agrupa los riesgos más comunes: inyección SQL, XSS, rotura de autenticación, exposición de datos sensibles, control de acceso roto y más."
                },
                {
                    "type": "paragraph",
                    "text": "Prevenirlos es cuestión de buenas prácticas: sentencias preparadas, escape de salida, rate limiting y no confiar nunca en la entrada del usuario."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "<?php\n// Eloquent usa prepared statements: previene inyección SQL\n$usuario = Usuario::where('email', $request->email)->first();\n\n// Nunca concatenar SQL crudo con entrada del usuario\n// Mal: DB::select(\"SELECT * FROM usuarios WHERE email = '$email'\");"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Riesgos que más debes cuidar"
                },
                {
                    "type": "list",
                    "items": [
                        "Inyección SQL: nunca concatenar entradas en SQL",
                        "XSS: escapar la salida que llega al navegador",
                        "Broken Access Control: validar permisos en cada recurso",
                        "Exposición de datos: ocultar campos sensibles"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla general: toda entrada es hostil hasta que se valida, toda salida se escapa, y cada recurso comprueba si el usuario tiene permiso."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Las sentencias preparadas evitan inyección",
                        "El escape de salida neutraliza XSS",
                        "El control de acceso se valida por recurso",
                        "Nunca confíes en la entrada del usuario"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 9,
            "title": "Autenticación y Protección",
            "course_id": 8,
            "course_slug": "seguridad-en-apis",
            "course_title": "Seguridad en APIs",
            "course": {
                "id": 8,
                "slug": "seguridad-en-apis",
                "title": "Seguridad en APIs"
            }
        }
    },
    "tests-y-calidad-en-ci": {
        "id": 536,
        "module_id": 209,
        "title": "Tests, lint y calidad en CI",
        "slug": "tests-y-calidad-en-ci",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tests, lint y calidad en CI"
                },
                {
                    "type": "paragraph",
                    "text": "El pipeline de CI es el portero de la calidad: si los tests fallan, el lint detecta inconsistencias o la cobertura baja del umbral, el cambio no se integra. Automatizar estas barreras convierte las reglas del equipo en hechos verificables."
                },
                {
                    "type": "paragraph",
                    "text": "Un pipeline equilibrado ejecuta tests unitarios, tests de integración, lint/format, chequeo de tipos y build. La cobertura se sube como artefacto y Quality Gate la compara con un umbral, p. ej. 80 %, para bloquear regresiones silenciosas."
                },
                {
                    "type": "code",
                    "language": "yaml",
                    "text": "name: Calidad\non: pull_request\n\njobs:\n  quality:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n      - run: npm ci\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm test -- --coverage\n      - name: Subir cobertura\n        uses: actions/upload-artifact@v4\n        with:\n          name: coverage\n          path: coverage/"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Barreras de calidad típicas"
                },
                {
                    "type": "list",
                    "items": [
                        "Lint y formato: estilo y errores comunes",
                        "Chequeo de tipos: contratos en tiempo estático",
                        "Tests unitarios: lógica aislada",
                        "Tests de integración: flujos con dependencias reales",
                        "Cobertura mínima y reportes como artefacto"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El objetivo no es acumular checks, sino que cada barrera aporte señal: un check que nunca falla no protege nada. Si el equipo tarda mucho en los checks, se paralelizan jobs o se recorta la matriz. La CI debe ser rápida y confiable para que el equipo la respete."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El pipeline automatiza las reglas de calidad",
                        "Lint + tipos + tests + build cubren el frente habitual",
                        "La cobertura se mide y se exige sobre un umbral",
                        "Checks rápidos y confiables se respetan; lentos, se esquivan"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 209,
            "title": "Calidad y despliegue",
            "course_id": 17,
            "course_slug": "ci-cd-github-actions",
            "course_title": "CI/CD con GitHub Actions",
            "course": {
                "id": 17,
                "slug": "ci-cd-github-actions",
                "title": "CI/CD con GitHub Actions"
            }
        }
    },
    "tipos-de-requerimientos": {
        "id": 551,
        "module_id": 22,
        "title": "Tipos de requerimientos y su ciclo de vida",
        "slug": "tipos-de-requerimientos",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de requerimientos y su ciclo de vida"
                },
                {
                    "type": "paragraph",
                    "text": "Además de funcionales y no funcionales, los requerimientos se clasifican por origen y nivel: de negocio (objetivos de la organización), de usuario (qué necesita el usuario) y de sistema (qué implementa el software). Un mismo objetivo de negocio baja hasta varios requerimientos de sistema."
                },
                {
                    "type": "paragraph",
                    "text": "Ese despliegue en niveles forma la cadena de trazabilidad: desde el objetivo hasta la línea de código que lo cumple. El ciclo de vida de un requerimiento —identificado, analizado, aprobado, implementado, verificado, retirado— te dice en qué punto está cada uno."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Niveles de requerimientos\n$niveles = [\n    'Negocio' => 'Aumentar un 20 % las inscripciones online',\n    'Usuario' => 'El alumno puede darse de alta en 2 minutos',\n    'Sistema' => 'POST /api/inscripciones crea la matrícula y envía el email',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Clasificación útil"
                },
                {
                    "type": "list",
                    "items": [
                        "De negocio: objetivos de la organización",
                        "De usuario: necesidades y tareas de las personas",
                        "De sistema: comportamiento concreto del software",
                        "Estado del ciclo: identificado → aprobado → implementado → verificado",
                        "Trazabilidad: cada nivel conecta con el siguiente"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Entender los niveles evita el error clásico: saltar del objetivo de negocio a la solución técnica sin validar con el usuario. Cada nivel es una oportunidad de preguntar y corregir antes de que el malentendido se vuelva código."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Negocio, usuario y sistema: tres lentes del requerimiento",
                        "El ciclo de vida dice en qué fase está cada uno",
                        "La trazabilidad conecta objetivo con código",
                        "Validar en cada nivel evita soluciones equivocadas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 22,
            "title": "Conceptos clave",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "ramas-y-merge": {
        "id": 544,
        "module_id": 211,
        "title": "Ramas y merge",
        "slug": "ramas-y-merge",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ramas y merge"
                },
                {
                    "type": "paragraph",
                    "text": "Una rama es un puntero a un commit que se mueve con tus nuevos commits. Crear una rama te permite experimentar sin tocar la línea principal; cuando el trabajo está listo, la integras con merge de vuelta a main."
                },
                {
                    "type": "paragraph",
                    "text": "El merge combina historias: si los cambios no se pisan, Git crea un merge automático; si tocan las mismas líneas, aparecen conflictos que resuelves a mano. Los conflictos no son un fracaso: son el momento de decidir qué versión gana."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Crear y cambiar de rama\ngit checkout -b feature/pagos   # crea y se posiciona\ngit branch                      # lista ramas\n\n# Trabajar y volver\ngit add . && git commit -m \"feat: flujo de pagos\"\ngit checkout main\ngit merge feature/pagos         # integra la rama\n\n# Si hay conflicto\n# 1. edita los archivos marcados por Git\n# 2. git add archivo-resuelto\n# 3. git commit"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo pensar en ramas"
                },
                {
                    "type": "list",
                    "items": [
                        "main: línea estable, siempre desplegable",
                        "Ramas cortas por feature o fix",
                        "Merge integra historias divergentes",
                        "El conflicto se resuelve conservando ambas intenciones",
                        "Borra la rama tras integrarla"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las ramas son baratas: crear una no copia nada, solo apunta a un commit. Por eso los flujos modernos crean una rama por tarea, integran pronto y evitan ramas longevas que divergen demasiado y multiplican los conflictos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Una rama es un puntero a commits",
                        "checkout -b crea y cambia en un paso",
                        "merge integra; el conflicto se resuelve a mano",
                        "Ramas cortas y merges frecuentes evitan dolores"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 211,
            "title": "Ramas e historia",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "historia-y-revert": {
        "id": 545,
        "module_id": 211,
        "title": "Viajar por la historia: log, diff y revert",
        "slug": "historia-y-revert",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Viajar por la historia: log, diff y revert"
                },
                {
                    "type": "paragraph",
                    "text": "Git es una máquina del tiempo: puedes leer la historia, comparar versiones y deshacer cambios con precisión. git log cuenta la historia, git diff compara versiones y git revert deshace un commit creando otro que lo compensa."
                },
                {
                    "type": "paragraph",
                    "text": "Revert es la forma segura de deshacer en equipos: en vez de borrar historia (lo que haría un reset), añade un commit inverso y mantiene el historial íntegro y sincronizable con el remoto."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Leer la historia\ngit log --oneline --graph      # historia con grafo de ramas\ngit show abc123                # detalle de un commit\ngit diff main..feature         # diferencias entre ramas\ngit diff HEAD~2 HEAD           # cambios entre dos puntos\n\n# Deshacer con seguridad\ngit revert abc123              # nuevo commit que deshace abc123\ngit revert --no-commit abc123  # prepara sin commitear (varios juntos)"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comandos de la máquina del tiempo"
                },
                {
                    "type": "list",
                    "items": [
                        "git log: historia con mensajes y hashes",
                        "git show: desglose de un commit concreto",
                        "git diff: comparación entre dos puntos",
                        "git revert: deshace creando un commit inverso",
                        "git reset: peligroso en compartido; evítalo en remoto"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El hash (abc123) identifica cada commit de forma única. Con él puedes comparar, inspeccionar o revertir cualquier punto. Aprender a leer git log --graph te da el mapa mental de cómo evolucionó el proyecto."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "log narra, diff compara, revert deshace",
                        "El hash localiza cualquier commit",
                        "revert es seguro en ramas compartidas",
                        "reset reescribe historia: solo en local y con cuidado"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 211,
            "title": "Ramas e historia",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "gitignore-y-estrategias": {
        "id": 546,
        "module_id": 211,
        "title": ".gitignore, aliases y estrategias de commit",
        "slug": "gitignore-y-estrategias",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": ".gitignore, aliases y estrategias de commit"
                },
                {
                    "type": "paragraph",
                    "text": "Un repositorio limpio no versiona lo generado: node_modules, vendor, .env, build/. El archivo .gitignore dice a Git qué ignorar, evitando repos hinchados y secretos filtrados."
                },
                {
                    "type": "paragraph",
                    "text": "Los aliases personalizan Git para tu flujo diario: gl para un log bonito, co para checkout... Además, decidir una estrategia de commits (Conventional Commits, commits atómicos) mantiene la historia legible y habilita releases automáticas."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# .gitignore\nnode_modules/\nvendor/\n.env\ndist/\n*.log\n\n# Aliases útiles\ngit config --global alias.gl \"log --oneline --graph --all\"\ngit config --global alias.co checkout\ngit config --global alias.st status\n\n# Uso\ngit gl       # historia bonita en un vistazo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué tener en el radar"
                },
                {
                    "type": "list",
                    "items": [
                        "Ignora dependencias, builds y secretos",
                        "Aliases para comandos que repites",
                        "Conventional Commits: feat, fix, refactor, docs, chore",
                        "Commits atómicos por responsabilidad",
                        "Commit temprano y seguido: checkpoints pequeños"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un patrón sólido: commits convencionales + ramas cortas + revisión en PR. La historia resulta un relato coherente de decisiones, y herramientas como changelogs automáticos o semver funcionan sin esfuerzo extra."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        ".gitignore mantiene el repo limpio y seguro",
                        "Los aliases aceleran tu flujo diario",
                        "Conventional Commits estandariza el historial",
                        "Commits pequeños y frecuentes = checkpoints útiles"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 211,
            "title": "Ramas e historia",
            "course_id": 18,
            "course_slug": "git-desde-cero",
            "course_title": "Git desde cero",
            "course": {
                "id": 18,
                "slug": "git-desde-cero",
                "title": "Git desde cero"
            }
        }
    },
    "ramas-y-pull-requests": {
        "id": 46,
        "module_id": 21,
        "title": "Ramas, merge y pull requests",
        "slug": "ramas-y-pull-requests",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ramas, merge y pull requests"
                },
                {
                    "type": "paragraph",
                    "text": "En equipo, nadie empuja directo a main: cada cambio viaja en una rama y se integra mediante un pull request (PR). El PR es el punto de revisión: la plataforma muestra el diff, discutes, ajustas y, cuando todo está verde, lo fusionas."
                },
                {
                    "type": "paragraph",
                    "text": "El flujo típico: git pull para actualizar, creas la rama de tu tarea, haces commits pequeños y claros, la subes con git push -u origin rama, abres el PR y tras la revisión lo mergeas. La integración con CI corre tests automáticos en cada PR."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Comenzar una tarea\ngit checkout -b feat/nueva-tarjeta\ngit push -u origin feat/nueva-tarjeta   # sube y vincula la rama\n\n# Mantener la rama al día\ngit fetch origin\ngit merge origin/main\n\n# Tras la revisión, main avanza\ngit checkout main\ngit pull\ngit branch -d feat/nueva-tarjeta        # borra la rama integrada"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas de PR"
                },
                {
                    "type": "list",
                    "items": [
                        "PR pequeños y con un único propósito",
                        "Título y descripción que cuenten el porqué",
                        "Tests y CI verdes antes de fusionar",
                        "Revisión de otro par de ojos",
                        "Resolver conflictos antes del merge"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El PR convierte el trabajo individual en discusión de equipo: las decisiones quedan documentadas en la conversación, y el historial refleja qué se revisó. Fusiona pronto y mantén los PR vivos menos de un día de trabajo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Nunca se empuja directo a main en equipo",
                        "El PR es el punto de revisión y discusión",
                        "push -u vincula la rama con su remota",
                        "PR pequeños y CI verde aceleran la integración"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 21,
            "title": "Trabajo en equipo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "tecnicas-de-recoleccion": {
        "id": 552,
        "module_id": 213,
        "title": "Técnicas de recolección de requerimientos",
        "slug": "tecnicas-de-recoleccion",
        "type": "article",
        "duration_minutes": 17,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Técnicas de recolección de requerimientos"
                },
                {
                    "type": "paragraph",
                    "text": "Los requerimientos no se inventan: se descubren. Entrevistas, talleres, observación, cuestionarios y análisis de datos existentes son las técnicas clásicas. Cada una encaja con un contexto: entrevista para profundizar, taller para alinear grupos, observación para captar lo que nadie verbaliza."
                },
                {
                    "type": "paragraph",
                    "text": "La escucha activa es la habilidad clave: preguntar por qué, distinguir deseos de necesidades reales y detectar suposiciones. \"El informe debe ser bonito\" es un deseo; \"necesito ver la tendencia de ventas por trimestre\" es una necesidad que se traduce a gráfico concreto."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Plan rápido de descubrimiento\n$plan = [\n    '1. Identificar interesados'   => 'quién usa, paga y decide',\n    '2. Elegir técnica'            => 'entrevista, taller, observación...',\n    '3. Preparar preguntas'        => 'abiertas, centradas en el porqué',\n    '4. Registrar y resumir'       => 'acta con decisiones y pendientes',\n    '5. Validar con el interesado' => 'confirmar el entendimiento',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Técnicas que funcionan"
                },
                {
                    "type": "list",
                    "items": [
                        "Entrevistas: profundidad y contexto",
                        "Talleres: alinear varios interesados a la vez",
                        "Observación: ver lo que no se verbaliza",
                        "Cuestionarios: alcance amplio con poco presupuesto",
                        "Análisis de datos y sistemas existentes"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Ninguna técnica es suficiente sola: el buen analista combina entrevista (qué dice), observación (qué hace) y revisión de datos (qué hay). Cada fuente valida a las otras y reduce el riesgo de construir sobre una única opinión."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Los requerimientos se descubren, no se inventan",
                        "Cada técnica sirve a un contexto",
                        "La escucha activa separa deseos de necesidades",
                        "Combinar fuentes reduce el sesgo de una sola visión"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 213,
            "title": "Descubrimiento",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "conventional-commits-y-conflictos": {
        "id": 47,
        "module_id": 21,
        "title": "Conventional Commits y resolución de conflictos",
        "slug": "conventional-commits-y-conflictos",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conventional Commits y resolución de conflictos"
                },
                {
                    "type": "paragraph",
                    "text": "Conventional Commits da un formato fijo a los mensajes: tipo (feat, fix, refactor...), alcance opcional y descripción. Ese formato estandariza el historial, habilita changelogs automáticos y permite releases semánticas calculadas desde los mensajes."
                },
                {
                    "type": "paragraph",
                    "text": "Los conflictos aparecen cuando dos ramas cambian las mismas líneas. Git marca los archivos con <<<<<<< ======= >>>>>>> y tú decides qué combinación conservar. Resolver bien es entender ambas intenciones, no borrar una versión a la ligera."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Formatos válidos\nfeat: añadir pago con tarjeta\nfix(api): corregir error 500 en login\nrefactor: extraer servicio de notificaciones\ndocs: explicar variables de entorno\nchore: actualizar dependencias\n\n# Resolver conflicto\ngit merge feature/pagos\n# archivo con marcadores:\n# <<<<<<< HEAD  (tu rama)\n#   vieja: $precio\n# =======\n#   nueva: $precio + $iva\n# >>>>>>> feature/pagos\n# editas, luego:\ngit add archivo.php\ngit commit"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tips para conflictos"
                },
                {
                    "type": "list",
                    "items": [
                        "Actualiza tu rama seguido (merge origin/main)",
                        "Los conflictos se resuelven leyendo ambas versiones",
                        "Después de resolver: add + commit",
                        "No uses force push sobre ramas compartidas",
                        "PR pequeños = conflictos pequeños"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La mayoría de conflictos son mecánicos, pero algunos requieren conversación: si el significado ha cambiado (renombres, reglas de negocio), pregunta al autor original. La herramienta favores (git merge, rebase) son solo intermediarios: la decisión final es humana."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Conventional Commits: tipo + descripción",
                        "Habilita changelogs y versionado semántico automático",
                        "El conflicto se resuelve combinando intenciones",
                        "Actualizar la rama a menudo reduce conflictos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 21,
            "title": "Trabajo en equipo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "rebase-y-reescritura": {
        "id": 547,
        "module_id": 21,
        "title": "Rebase, squash y reescritura segura de historia",
        "slug": "rebase-y-reescritura",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Rebase, squash y reescritura segura de historia"
                },
                {
                    "type": "paragraph",
                    "text": "El rebase reaplica tus commits sobre otra base, produciendo una historia lineal: tu rama parece haber empezado después de la última actualización de main. Es especialmente útil en PRs para integrar cambios y evitar merges enmarañados."
                },
                {
                    "type": "paragraph",
                    "text": "El squash (habitualmente con git rebase -i) agrupa varios commits en uno solo: convierte el proceso de trabajo (wip, fix, oops) en un resultado limpio. Regla de seguridad: nunca reescribas historia que ya compartiste con el equipo."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Rebase simple: integra main bajo tus commits\ngit checkout feature/pagos\ngit fetch origin\ngit rebase origin/main\n\n# Interactivo: squash y reescribe mensajes\ngit rebase -i HEAD~4\n# pick aaa111 feat: pago\n# squash bbb222 wip\n# squash ccc333 fix tipografia\n\n# Tras rebase en una rama ya publicada\ngit push --force-with-lease"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar cada técnica"
                },
                {
                    "type": "list",
                    "items": [
                        "rebase: rama local al día con main, historial lineal",
                        "squash: agrupar el proceso de trabajo en un commit",
                        "--force-with-lease: publicar historia reescrita sin pisar a otros",
                        "Nunca reescribas historia compartida sin avisar",
                        "merge conserva el contexto; rebase, la linealidad"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "git pull --rebase es la opción preferida en muchos equipos: en vez de crear commits de merge por cada actualización, reaplica tu trabajo sobre lo nuevo. La historia queda plana y los PRs se revisan mejor."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "rebase reaplica commits sobre otra base",
                        "squash agrupa trabajo suelto en un commit final",
                        "reescribir historia compartida es peligroso",
                        "--force-with-lease protege el trabajo de otros"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 21,
            "title": "Trabajo en equipo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "flujos-de-trabajo-git-flow": {
        "id": 548,
        "module_id": 212,
        "title": "Git Flow y flujos basados en trunk",
        "slug": "flujos-de-trabajo-git-flow",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Git Flow y flujos basados en trunk"
                },
                {
                    "type": "paragraph",
                    "text": "Git Flow organiza ramas por propósito: main para releases, develop para integración, feature/* para tareas, release/* para preparar versiones y hotfix/* para urgencias. Es robusto, pero pesado para equipos que despliegan continuamente."
                },
                {
                    "type": "paragraph",
                    "text": "Los flujos basados en trunk simplifican: todos integran en main en fragmentos pequeños (a diario o varias veces al día) protegidos por CI y feature flags. Menos ramas, menos merges y despliegues frecuentes."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Git Flow (esquema)\ngit flow feature start login      # crea feature/login desde develop\ngit flow release start 1.4.0      # rama release desde develop\ngit flow hotfix start sev-1       # rama de urgencia desde main\n\n# Trunk-based (esquema)\nmain (protegida, siempre desplegable)\n  └── ramas de tarea (1-2 días)\n      └── PR -> main -> CD"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comparativa rápida"
                },
                {
                    "type": "list",
                    "items": [
                        "Git Flow: muchas ramas, releases planificadas",
                        "Trunk-based: main integra todo, deploys frecuentes",
                        "Feature flags desacoplan despliegue de activación",
                        "CI fuerte es requisito del trunk-based",
                        "Elige el flujo según tu cadencia de releases"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "No hay flujo perfecto: los equipos de producto con releases mensuales disfrutan Git Flow; los que despliegan varias veces al día prefieren trunk-based. Lo importante es que el flujo refleje tu cadencia y que todos lo sigan con disciplina."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Git Flow separa features, releases y hotfixes",
                        "Trunk-based integra en main continuamente",
                        "Feature flags permiten activar sin desplegar",
                        "El flujo debe ajustarse a tu cadencia de releases"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 212,
            "title": "Flujos de trabajo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "code-review-con-git": {
        "id": 549,
        "module_id": 212,
        "title": "Code review efectivo con pull requests",
        "slug": "code-review-con-git",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Code review efectivo con pull requests"
                },
                {
                    "type": "paragraph",
                    "text": "El code review es la práctica de mayor retorno por hora en ingeniería: atrapa bugs, difunde conocimiento y eleva el estándar del equipo. Un PR bien preparado hace la revisión rápida; una revisión constructiva hace al autor mejor."
                },
                {
                    "type": "paragraph",
                    "text": "Revisa con intención: lee los tests tanto como el código, verifica que la lógica cubre los casos límite y pregunta antes de asumir que algo es un error. Los comentarios describen el problema y sugieren, no ordenan."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Del autor\ngit checkout -b fix/validacion-email\ngit commit -m \"fix: validar email antes de enviar\"\ngit push -u origin fix/validacion-email\n# Abre PR con: qué, por qué, cómo probarlo\n\n# Del revisor\ngit fetch origin\ngit checkout fix/validacion-email   # probar localmente\ngit diff origin/main..HEAD          # revisar el diff completo"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Guía de revisión"
                },
                {
                    "type": "list",
                    "items": [
                        "PR pequeño: menos de 400 líneas es buena señal",
                        "Revisa tests y casos límite, no solo el código feliz",
                        "Comenta el qué y el porqué, no la persona",
                        "Señala fortalezas también, no solo errores",
                        "Automatiza lo mecánico (lint, format) para enfocarte en lo lógico"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un buen equipo de revisión divide el trabajo: los linters y CI atrapan lo mecánico, y los humanos se concentran en diseño, lógica de negocio y mantenibilidad. El resultado: código que cualquiera del equipo puede mantener."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El review atrapa bugs y difunde conocimiento",
                        "PR pequeños y descriptivos agilizan la revisión",
                        "Comentarios sobre código, no sobre personas",
                        "Automatiza lo mecánico; reserva el review para lo lógico"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 212,
            "title": "Flujos de trabajo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "open-source-y-forks": {
        "id": 550,
        "module_id": 212,
        "title": "Contribuir a proyectos open source",
        "slug": "open-source-y-forks",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Contribuir a proyectos open source"
                },
                {
                    "type": "paragraph",
                    "text": "Contribuir a open source es el mejor máster de Git real: lees código de otros, adaptas tu trabajo a sus convenciones y colaboras con personas de todo el mundo. El flujo estándar es fork + rama + PR, porque no tienes permiso de escritura en el repo original."
                },
                {
                    "type": "paragraph",
                    "text": "Un fork es una copia del repositorio en tu cuenta. Trabajas en él, y tu pull request propone cambios al original (upstream). Las buenas contribuciones empiezan pequeñas: documentación, un bug claro o un issue etiquetado como good first issue."
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# 1. Fork en GitHub, luego clona el tuyo\ngit clone https://github.com/TU-CUENTA/proyecto.git\ncd proyecto\n\n# 2. Vincula el original como upstream\ngit remote add upstream https://github.com/original/proyecto.git\ngit remote -v\n\n# 3. Trabaja en una rama\ngit checkout -b fix/enlace-roto\ngit commit -m \"fix: corregir enlace roto en docs\"\ngit push origin fix/enlace-roto\n\n# 4. Mantente al día con upstream\ngit fetch upstream\ngit rebase upstream/main"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Etiqueta de la contribución"
                },
                {
                    "type": "list",
                    "items": [
                        "Lee CONTRIBUTING.md antes de tocar nada",
                        "Busca issues marcados para empezar (good first issue)",
                        "Un cambio pequeño y bien probado por PR",
                        "Responde a los comentarios del mantenedor",
                        "Nunca hagas PRs gigantes sin avisar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El flujo de fork+PR entrena exactamente lo que usarás en el trabajo: leer bases de código ajenas, respetar convenciones, escribir mensajes claros y perseverar en una revisión. La comunidad valora contribuciones de calidad, no cantidad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Fork para trabajar sin permisos del original",
                        "upstream es el repo original; el tuyo, origin",
                        "Empieza por cambios pequeños y documentados",
                        "CONTRIBUTING.md define las reglas del proyecto"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 212,
            "title": "Flujos de trabajo",
            "course_id": 19,
            "course_slug": "git-colaboracion-y-flujos",
            "course_title": "Git colaboración y flujos",
            "course": {
                "id": 19,
                "slug": "git-colaboracion-y-flujos",
                "title": "Git colaboración y flujos"
            }
        }
    },
    "requerimientos-ambiguos": {
        "id": 553,
        "module_id": 213,
        "title": "Escribir requerimientos sin ambigüedad",
        "slug": "requerimientos-ambiguos",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Escribir requerimientos sin ambigüedad"
                },
                {
                    "type": "paragraph",
                    "text": "Un requerimiento ambiguo se interpreta de formas distintas en cada fase del proyecto: el analista lo entiende de una manera, el desarrollador de otra y el cliente de una tercera. El remedio es escribir con verbos concretos, números y condiciones explícitas."
                },
                {
                    "type": "paragraph",
                    "text": "Evita palabras como \"rápido\", \"fácil\", \"adecuado\" o \"etcétera\". Usa criterios verificables: 2 segundos, 99,9 %, roles definidos y reglas de negocio cerradas. Cada requerimiento debe poder responderse con sí o no cuando se pruebe."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Ambiguo\n$mal = 'El sistema debe ser rápido y mostrar la información adecuada.';\n\n// Verificable\n$bien = [\n    'REQ-15: El panel debe cargar el resumen en menos de 2 segundos',\n    'con 1 000 suscriptores y un ancho de banda de 50 Mbps.',\n    'REQ-16: El panel debe mostrar ventas, clientes nuevos y tasa',\n    'de conversión del trimestre seleccionado.',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Plantilla de un buen requerimiento"
                },
                {
                    "type": "list",
                    "items": [
                        "Identificador único (REQ-15)",
                        "Sujeto y verbo concreto (\"el panel debe mostrar\")",
                        "Cantidad y condiciones medibles",
                        "Excepciones y reglas de negocio explícitas",
                        "Criterio de aceptación: cómo se comprueba"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Revisa cada requerimiento con dos preguntas: ¿lo entendería igual alguien sin mi contexto? ¿Puedo demostrar con una prueba que se cumple? Si alguna respuesta es no, vuelve a redactarlo. La inversión en redacción se paga en menos malentendidos y menos retrabajo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Ambiguo = versiones distintas en cada fase",
                        "Verbos concretos y cifras verificables",
                        "Identificador único y criterio de aceptación",
                        "Dos preguntas: ¿se entiende solo? ¿se puede probar?"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 213,
            "title": "Descubrimiento",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "validacion-de-requerimientos": {
        "id": 554,
        "module_id": 213,
        "title": "Validación y aprobación de requerimientos",
        "slug": "validacion-de-requerimientos",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Validación y aprobación de requerimientos"
                },
                {
                    "type": "paragraph",
                    "text": "Validar es comprobar que los requerimientos son correctos, completos y factibles antes de construir. Se revisa con los interesados, se prototipa lo dudoso y se confirma que cada requerimiento es trazable, consistente y verificable."
                },
                {
                    "type": "paragraph",
                    "text": "La aprobación formal cierra el ciclo de análisis: el interesado confirma que el documento refleja lo que necesita. Es un acta de compromiso, no un trámite: a partir de ahí los cambios entran por gestión de cambios, con su coste explícito."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Checklist de validación\n$checklist = [\n    'Completitud'   => '¿cubrimos todos los casos y usuarios?',\n    'Consistencia'  => '¿ningún requerimiento contradice a otro?',\n    'Factibilidad'  => '¿es técnicamente posible y con qué coste?',\n    'Verificabilidad' => '¿cada uno tiene prueba de cumplimiento?',\n    'Trazabilidad'  => '¿cada nivel conecta con el siguiente?',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Pasos para aprobar"
                },
                {
                    "type": "list",
                    "items": [
                        "Revisión conjunta con los interesados",
                        "Prototipo o maqueta para lo dudoso",
                        "Checklist de calidad (completitud, consistencia...)",
                        "Firma o aceptación formal del documento",
                        "Dejar claro el proceso de cambios posterior"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Validar no es pedir permiso: es eliminar sorpresas. El prototipo convierte el \"me refiero a...\". En conversación, y la firma convierte el entendimiento en compromiso. Así, cuando más tarde alguien pida \"otra cosa\", el cambio se gestiona con su coste, no con sorpresa."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Validar = correctos, completos y factibles",
                        "El prototipo detecta malentendidos barato",
                        "La aprobación formal es un acta de compromiso",
                        "Después de aprobar, los cambios se gestionan formalmente"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 213,
            "title": "Descubrimiento",
            "course_id": 20,
            "course_slug": "fundamentos-requerimientos",
            "course_title": "Fundamentos de requerimientos",
            "course": {
                "id": 20,
                "slug": "fundamentos-requerimientos",
                "title": "Fundamentos de requerimientos"
            }
        }
    },
    "epicas-historias-y-tareas": {
        "id": 559,
        "module_id": 23,
        "title": "Épicas, historias y tareas: del nivel estratégico al táctico",
        "slug": "epicas-historias-y-tareas",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Épicas, historias y tareas: del nivel estratégico al táctico"
                },
                {
                    "type": "paragraph",
                    "text": "No todo lo que pide el negocio es una historia. Las épicas agrupan funcionalidades amplias (\"facturación\"), las historias convierten fragmentos en trabajo concreto (\"el cliente puede descargar su factura en PDF\") y las tareas son las unidades técnicas de implementación."
                },
                {
                    "type": "paragraph",
                    "text": "La jerarquía no es un trámite: cada nivel responde una pregunta distinta. La épica dice qué problema grande resolvemos; la historia, qué valor entregamos y a quién; la tarea, qué hay que hacer y en cuántas horas. Mantener los tres niveles actualizados conserva la visibilidad del proyecto."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "ÉPICA: Sistema de facturación\n├── Historia: El cliente descarga su factura en PDF\n│   ├── Tarea: Crear endpoint GET /api/facturas/{id}/pdf\n│   ├── Tarea: Generar PDF con la plantilla de la empresa\n│   └── Tarea: Test de descarga con factura de prueba\n└── Historia: El admin ve el estado de pagos"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo partir bien"
                },
                {
                    "type": "list",
                    "items": [
                        "Épica = problema grande, dividido después",
                        "Historia = valor verificable para un rol",
                        "Tarea = unidad técnica accionable",
                        "Divide hasta que la historia sea de ≤1 semana",
                        "La inversión (INVEST) guía la división"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Un buen criterio para dejar de dividir: la historia cabe en un sprint y se puede verificar con sus criterios de aceptación. Seguir partiendo crea micro-tareas sin valor; no partir genera historias eternas que nunca se pueden decir \"terminadas\"."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Épica → historia → tarea: de estrategia a ejecución",
                        "Cada nivel responde una pregunta distinta",
                        "Historias de ≤1 semana con criterios verificables",
                        "INVEST guía cuándo parar de dividir"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 23,
            "title": "Técnicas de modelado",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "criterios-de-aceptacion-gherkin": {
        "id": 560,
        "module_id": 215,
        "title": "Criterios de aceptación con Gherkin",
        "slug": "criterios-de-aceptacion-gherkin",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Criterios de aceptación con Gherkin"
                },
                {
                    "type": "paragraph",
                    "text": "Gherkin expresa criterios de aceptación como ejemplos ejecutables: Dado un contexto, Cuando ocurre la acción, Entonces se produce el resultado, y además Y/Pero encadenan condiciones. Es el formato de BDD y la base de herramientas como Behat en PHP o Cucumber."
                },
                {
                    "type": "paragraph",
                    "text": "Escribir criterios en Gherkin obliga a pensar en ejemplos, no en generalidades. Un ejemplo concreto (\"con 0 plazas\") revela reglas que una frase abstracta esconde. Por eso los criterios Gherkin son la mejor especificación ejecutable."
                },
                {
                    "type": "code",
                    "language": "gherkin",
                    "text": "Característica: Inscripción en cursos\n\n  Escenario: Inscribirse con plazas disponibles\n    Dado que el curso \"Laravel 12\" tiene 5 plazas libres\n    Y soy un estudiante autenticado\n    Cuando hago clic en \"Inscribirme\"\n    Entonces veo la confirmación \"¡Inscrito!\"\n    Y recibo un correo de bienvenida\n\n  Escenario: Curso completo\n    Dado que el curso \"Laravel 12\" tiene 0 plazas libres\n    Cuando hago clic en \"Inscribirme\"\n    Entonces veo el aviso \"Curso completo\"\n    Y veo la opción de lista de espera"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas para buenos escenarios"
                },
                {
                    "type": "list",
                    "items": [
                        "Un escenario por comportamiento",
                        "Contexto en Dado, acción en Cuando, resultado en Entonces",
                        "Ejemplos concretos, nunca valores vagos",
                        "Cubre el camino feliz y al menos un alternativo",
                        "El lenguaje es legible para negocio y técnico"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Los escenarios Gherkin no reemplazan los tests técnicos, pero sí conectan negocio y código: cada escenario se convierte en una prueba de aceptación que el equipo automatiza o ejecuta al menos en cada release. Todos hablan el mismo lenguaje."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Gherkin = ejemplos ejecutables Dado/Cuando/Entonces",
                        "Los ejemplos concretos revelan reglas ocultas",
                        "Un escenario por comportamiento",
                        "Especificación legible para negocio y técnicos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 215,
            "title": "Aplicación",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "diagramas-de-casos-de-uso": {
        "id": 561,
        "module_id": 215,
        "title": "Diagramas y especificaciones de casos de uso",
        "slug": "diagramas-de-casos-de-uso",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diagramas y especificaciones de casos de uso"
                },
                {
                    "type": "paragraph",
                    "text": "El diagrama de casos de uso (UML) muestra el sistema como una caja, sus actores fuera y las elipses de funcionalidad dentro. Es la foto de quién puede hacer qué; la especificación escrita describe el flujo con detalle."
                },
                {
                    "type": "paragraph",
                    "text": "El diagrama es excelente para comunicar alcance en una reunión: se ve rápido qué actores existen y qué funcionalidades tocan. Pero se queda corto para el detalle; por eso se acompaña de especificaciones con flujo principal, alternativos, precondiciones y reglas."
                },
                {
                    "type": "code",
                    "language": "mermaid",
                    "text": "graph LR\n    A[Estudiante] --> CU1(Inscribirse en curso)\n    A --> CU2(Descargar certificado)\n    AD[Administrador] --> CU3(Gestionar cursos)\n    AD --> CU1\n    P[Pasarela de pago] --> CU1"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué debe tener la especificación"
                },
                {
                    "type": "list",
                    "items": [
                        "Nombre y objetivo del caso de uso",
                        "Actor principal y actores secundarios",
                        "Precondiciones y poscondiciones",
                        "Flujo principal numerado paso a paso",
                        "Flujos alternativos con referencias cruzadas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Regla importante: el diagrama y la especificación deben estar sincronizados. Un diagrama sin especificación es una promesa; una especificación sin diagrama es invisible para la reunión. Mantener ambos al día es parte del trabajo de análisis."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El diagrama comunica alcance de un vistazo",
                        "La especificación aporta el detalle ejecutable",
                        "Actores, flujos y precondiciones forman el mínimo",
                        "Diagrama y texto deben estar sincronizados"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 215,
            "title": "Aplicación",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "product-backlog-y-estimar": {
        "id": 562,
        "module_id": 215,
        "title": "Product Backlog y estimación de historias",
        "slug": "product-backlog-y-estimar",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Product Backlog y estimación de historias"
                },
                {
                    "type": "paragraph",
                    "text": "El Product Backlog es la lista ordenada de todo lo que el producto podría ser: historias, épicas, mejoras y correcciones. La priorización y la estimación deciden qué se construye primero; una historia que no está en el backlog no existe para el equipo."
                },
                {
                    "type": "paragraph",
                    "text": "Estimar no es comprometer una fecha exacta: es comparar complejidad entre historias. Por eso se usan puntos de historia o tallas (S, M, L) con técnicas como Planning Poker, midiendo la incertidumbre, no el reloj."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "Backlog (ordenado por valor/riesgo):\n  1. [HIST] Estudiante se inscribe (8 pt)\n  2. [HIST] Admin publica un curso (5 pt)\n  3. [HIST] Estudiante descarga certificado (13 pt) ← incierta\n  4. [BUG]  Correo de bienvenida cae en spam (3 pt)\n  5. [ÉPICA] Facturación online (dividir)"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Una sola lista priorizada, visible para todos",
                        "Prioriza por valor, riesgo y dependencias",
                        "Estima por comparación relativa, no por horas",
                        "Las historias inciertas se dividen, no se inflan",
                        "La estimación mejora con datos históricos (velocidad)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La estimación más valiosa no es el número, sino la conversación que lo produce: el equipo descubre suposiciones, riesgos y diseño. Por eso se estima en equipo y se revisa con el paso de los sprints para calibrar la velocidad real."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El backlog es la lista priorizada del producto",
                        "Se prioriza por valor, riesgo y dependencias",
                        "Estimación relativa: puntos o tallas, no horas",
                        "La conversación al estimar vale más que el número"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 215,
            "title": "Aplicación",
            "course_id": 21,
            "course_slug": "historias-de-usuario-y-casos-de-uso",
            "course_title": "Historias de usuario y casos de uso",
            "course": {
                "id": 21,
                "slug": "historias-de-usuario-y-casos-de-uso",
                "title": "Historias de usuario y casos de uso"
            }
        }
    },
    "priorizacion-moscow": {
        "id": 52,
        "module_id": 24,
        "title": "Priorización con MoSCoW",
        "slug": "priorizacion-moscow",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Priorización con MoSCoW"
                },
                {
                    "type": "paragraph",
                    "text": "MoSCoW clasifica los requerimientos en cuatro categorías: Must have (imprescindibles), Should have (importantes), Could have (deseables) y Won't have (fuera de alcance por ahora). Es rápido, compartible y obliga a decir no con claridad."
                },
                {
                    "type": "paragraph",
                    "text": "La clave no es clasificar sola, sino la conversación que la acompaña: ¿qué pasa si no llevamos este requerimiento? Si el producto pierde sentido, es Must; si duele pero no destruye, Should; si es adorno, Could. Y los Won't son decisiones de alcance que deben ser explícitas."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$moscow = [\n    'Must'   => 'Estudiante se inscribe y paga con tarjeta',\n    'Should' => 'Recibir correo de confirmación en < 5 min',\n    'Could'  => 'Comparador de cursos lado a lado',\n    'Won\\'t' => 'App móvil nativa en el primer release',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de oro"
                },
                {
                    "type": "list",
                    "items": [
                        "Los Must no se negocian: si falta uno, no hay release",
                        "Should y Could se intercambian según el tiempo",
                        "Los Won't se dicen en voz alta y se anotan",
                        "Revisar la clasificación en cada hito",
                        "La conversación de \"qué pasa si no\" guía la decisión"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El mayor beneficio de MoSCoW es que saca del territorio de los deseos: en cada revisión se pregunta si la clasificación sigue siendo verdadera. Un Should puede convertirse en Must cuando cambia el contexto, y el proyecto gana porque la decisión fue consciente."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Must, Should, Could y Won't: cuatro cestas claras",
                        "La conversación de impacto guía la clasificación",
                        "Los Won't son decisiones explícitas de alcance",
                        "Reclasificar en cada hito mantiene el backlog honesto"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 24,
            "title": "Gestión del cambio",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "trazabilidad-y-gestion-del-cambio": {
        "id": 53,
        "module_id": 24,
        "title": "Trazabilidad y gestión del cambio",
        "slug": "trazabilidad-y-gestion-del-cambio",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Trazabilidad y gestión del cambio"
                },
                {
                    "type": "paragraph",
                    "text": "La trazabilidad conecta cada requerimiento con su origen, su implementación y su prueba. Es el hilo que permite responder \"¿qué código cumple REQ-15?\" o \"si cambia esta regla, ¿qué requerimientos toco?\" sin adivinar."
                },
                {
                    "type": "paragraph",
                    "text": "La gestión del cambio es el proceso formal para modificar requerimientos aprobados: cualquiera puede proponer un cambio, pero se evalúa impacto, coste y riesgo antes de aprobarlo. El objetivo no es frenar el cambio, es decidirlo con información."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Matriz de trazabilidad simplificada\n$traza = [\n    'REQ-15' => [\n        'origen'    => 'Entrevista con Ana (pagos)',\n        'diseno'    => 'Pasarela de pago',\n        'codigo'    => 'app/Services/PagoService.php',\n        'tests'     => 'tests/Feature/PagoTest.php',\n        'estado'    => 'Implementado',\n    ],\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Flujo de un cambio"
                },
                {
                    "type": "list",
                    "items": [
                        "Solicitud escrita (qué, por qué, impacto esperado)",
                        "Análisis de impacto: cuáles requerimientos se tocan",
                        "Estimación de coste, tiempo y riesgo",
                        "Decisión informada (aprobar, ajustar o rechazar)",
                        "Actualizar trazabilidad y comunicar a todos"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La trazabilidad también protege al equipo: un cambio que llega sin análisis de impacto termina rompiendo funcionalidades que nadie previó. El proceso de cambio es la memoria de por qué se decidió cada modificación."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Trazabilidad: origen → diseño → código → prueba",
                        "El cambio aprobado se gestiona, no se improvisa",
                        "Todo cambio pasa por análisis de impacto",
                        "El proceso documenta la memoria de decisiones"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 24,
            "title": "Gestión del cambio",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "matrices-de-trazabilidad": {
        "id": 563,
        "module_id": 24,
        "title": "Matrices de trazabilidad y su mantenimiento",
        "slug": "matrices-de-trazabilidad",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Matrices de trazabilidad y su mantenimiento"
                },
                {
                    "type": "paragraph",
                    "text": "La matriz de trazabilidad es la tabla que cruza requerimientos con orígenes, diseño, código, pruebas y estados. Bien mantenida, contesta al instante: cobertura de pruebas, impacto de un cambio, requerimientos huérfanos o pendientes de verificar."
                },
                {
                    "type": "paragraph",
                    "text": "La dificultad no es crearla, es mantenerla: una matriz obsoleta miente peor que no tener matriz. La regla es integrarla en el flujo: cada PR actualiza los enlaces de sus requerimientos, y cada revisión de release comprueba la cobertura."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Estado de la matriz: cobertura por requerimiento\n$matriz = [\n    'REQ-15' => ['origen' => 'ok', 'codigo' => 'ok', 'tests' => 'ok'],\n    'REQ-16' => ['origen' => 'ok', 'codigo' => 'ok', 'tests' => 'pendiente'],\n    'REQ-17' => ['origen' => 'ok', 'codigo' => 'pendiente', 'tests' => 'pendiente'],\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Mantener la matriz viva"
                },
                {
                    "type": "list",
                    "items": [
                        "Una matriz obsoleta es peor que ninguna",
                        "Actualizar en el momento del PR, no al final",
                        "Cada requerimiento conduce a su prueba",
                        "Revisar huérfanos: requerimientos sin código o sin test",
                        "Automáticar en lo posible (IDs en tests, análisis estático)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Las herramientas modernas ayudan: IDs de requerimientos en los nombres de tests, enlaces en los commits y dashboards que calculan cobertura. Pero la cultura del equipo decide si la matriz se actualiza de verdad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cruza requerimiento con origen, código, test y estado",
                        "Mantenerla al día vale más que crearla",
                        "Los huérfanos denuncian trabajo sin cobertura",
                        "Automatización + disciplina del equipo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 24,
            "title": "Gestión del cambio",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "solicitudes-de-cambio": {
        "id": 564,
        "module_id": 216,
        "title": "Solicitudes de cambio y control de versiones de requerimientos",
        "slug": "solicitudes-de-cambio",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Solicitudes de cambio y control de versiones de requerimientos"
                },
                {
                    "type": "paragraph",
                    "text": "Una solicitud de cambio (SCR) formaliza la petición de modificar algo aprobado: quién la pide, qué cambia, por qué y qué impacto estima. El control de versiones del documento de requerimientos permite ver qué versión se aprobó, qué cambió y cuándo."
                },
                {
                    "type": "paragraph",
                    "text": "Versionar requerimientos no es burocracia: es historia. Cuando un problema aparece meses después, saber qué versión del alcance estaba vigente en cada release permite atribuir decisiones y entender el sistema actual."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$solicitud = [\n    'id'      => 'SCR-007',\n    'fecha'   => '2026-09-24',\n    'solicita'=> 'Producto (María)',\n    'cambio'  => 'Permitir pago con PayPal en el checkout',\n    'impacto' => 'Toca REQ-15 (pagos); +3 días; riesgo bajo',\n    'estado'  => 'En evaluación',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Componentes de una SCR"
                },
                {
                    "type": "list",
                    "items": [
                        "Identificador y fecha",
                        "Descripción clara del cambio",
                        "Motivo o caso de negocio",
                        "Impacto en requerimientos, código y pruebas",
                        "Estimación de coste y riesgo",
                        "Decisión y trazabilidad posterior"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Convención sana: los cambios se versionan como el código. El documento de requerimientos con etiquetas (v1.2) y changelog indica qué cambió en cada versión. La combinación SCR + versionado da la respuesta completa a \"¿por qué es así?\"."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La SCR formaliza qué, por qué e impacto",
                        "Versionar requerimientos guarda la historia de decisiones",
                        "El changelog del documento acompaña cada versión",
                        "SCR + versionado = respuesta al \"¿por qué es así?\""
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 216,
            "title": "Comunicación y herramientas",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "comunicacion-con-stakeholders": {
        "id": 565,
        "module_id": 216,
        "title": "Comunicación efectiva con stakeholders",
        "slug": "comunicacion-con-stakeholders",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comunicación efectiva con stakeholders"
                },
                {
                    "type": "paragraph",
                    "text": "Los stakeholders son las personas con interés o influencia en el proyecto: clientes, usuarios, dirección, operaciones. Cada grupo habla un idioma distinto —negocio, producto, tecnología— y el analista traduce entre ellos sin perder la esencia."
                },
                {
                    "type": "paragraph",
                    "text": "La comunicación efectiva no es informar más, sino alinear expectativas: qué se entrega, qué no, cuándo y cómo se decidirá. Un stakeholder bien informado aprueba con criterio; uno sorprendido bloquea en el peor momento."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Matriz de comunicación simple\n$comunicacion = [\n    'Dirección'    => ['frecuencia' => 'Mensual', 'formato' => 'Resumen ejecutivo'],\n    'Producto'     => ['frecuencia' => 'Semanal', 'formato' => 'Backlog y demos'],\n    'Operaciones'  => ['frecuencia' => 'Por hito', 'formato' => 'Plan de despliegue'],\n    'Usuarios'     => ['frecuencia' => 'Iteración', 'formato' => 'Demos y encuestas'],\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Buenas prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Mapear stakeholders y su interés/influencia",
                        "Adaptar el formato a la audiencia",
                        "Reportar avances, riesgos y decisiones",
                        "Decir lo que NO se hará, también cuenta",
                        "Confirmar acuerdos por escrito tras las reuniones"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla que más conflictos evita: los acuerdos importantes se confirman por escrito (acta, correo, herramienta). No por desconfianza, sino porque la memoria humana reinterpreta; el documento fija la versión oficial del acuerdo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Cada stakeholder habla su idioma: traduce, no repitas",
                        "Alinear expectativas vale más que informar",
                        "Los no-acuerdos también se comunican",
                        "Confirmar acuerdos por escrito evita reinterpretaciones"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 216,
            "title": "Comunicación y herramientas",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "herramientas-de-gestion": {
        "id": 566,
        "module_id": 216,
        "title": "Herramientas y métricas en gestión de requerimientos",
        "slug": "herramientas-de-gestion",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Herramientas y métricas en gestión de requerimientos"
                },
                {
                    "type": "paragraph",
                    "text": "Las herramientas —Jira, Linear, Azure DevOps, Notion— guardan el backlog, los estados y la trazabilidad de cada requerimiento. La buena herramienta no sustituye el proceso: lo hace visible. Si nadie actualiza estados, cualquier herramienta es un cementerio de tickets."
                },
                {
                    "type": "paragraph",
                    "text": "Las métricas de gestión convierten el proceso en aprendizaje: velocidad del equipo, ratio de cambios aprobados, tiempo medio de revisión o porcentaje de requerimientos verificados en cada release. Mete pocas métricas, pero que se usen para decidir."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$metricas = [\n    'Velocidad por sprint'      => 'puntos completados / sprint',\n    'Ratio de cambios'          => 'SCR aprobadas / requerimientos',\n    'Tiempo medio de aprobación'=> 'días entre solicitud y decisión',\n    'Cobertura de trazabilidad' => '% requerimientos con test asociado',\n    'Requerimientos por release'=> 'entregados y verificados',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Qué mirar (y qué no)"
                },
                {
                    "type": "list",
                    "items": [
                        "Velocidad real para planificar con datos",
                        "Ratio de cambios para detectar alcance inestable",
                        "Tiempo de aprobación para agilizar decisiones",
                        "Cobertura de trazabilidad para calidad del proceso",
                        "Evita métricas de actividad (tickets cerrados) sin contexto"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La métrica más peligrosa es la que se convierte en objetivo sin matices: \"cerrar X tickets\" incentiva tickets pequeños e inútiles. Mejor métricas de resultado: ¿cuánto del valor planificado llegó a los usuarios y se verificó?"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La herramienta hace visible el proceso, no lo sustituye",
                        "Pocas métricas, pero que se usen para decidir",
                        "Mide resultado, no actividad vacía",
                        "Velocidad real > estimaciones optimistas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 216,
            "title": "Comunicación y herramientas",
            "course_id": 22,
            "course_slug": "gestion-de-requerimientos",
            "course_title": "Gestión de requerimientos",
            "course": {
                "id": 22,
                "slug": "gestion-de-requerimientos",
                "title": "Gestión de requerimientos"
            }
        }
    },
    "asistentes-de-codigo": {
        "id": 58,
        "module_id": 27,
        "title": "Asistentes de código y pair programming con IA",
        "slug": "asistentes-de-codigo",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Asistentes de código y pair programming con IA"
                },
                {
                    "type": "paragraph",
                    "text": "Los asistentes de IA (Copilot, Cursor, Codeium) completan código, explican fragmentos y responden preguntas sobre tu base de código. Bien usados, eliminan el trabajo mecánico; mal usados, generan código que nadie entiende."
                },
                {
                    "type": "paragraph",
                    "text": "Funcionan mejor con contexto: abre los archivos implicados, describe el contrato y da el stack. El asistente es un par programador con memoria de pez: recuerda el prompt, no el proyecto. Tú aportas la arquitectura y las decisiones."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "Buen uso del asistente:\n1. Describe el problema y el contrato antes de pedir código.\n2. Pide el fragmento pequeño y léelo antes de integrarlo.\n3. Usa autocompletado para lo repetitivo, no para el diseño.\n4. Pide explicaciones del código que no entiendes.\n5. Haz que genere los tests, no que los evite."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Roles en el pair programming con IA"
                },
                {
                    "type": "list",
                    "items": [
                        "Tú: arquitectura, decisiones, validación",
                        "IA: autocompletado, borradores, explicaciones",
                        "IA: conversión entre formatos y refactor simple",
                        "Tú: revisión final línea a línea",
                        "Nunca: aceptar código sin entenderlo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La métrica de un buen uso no es cuánto código genera, sino cuánto entiende el equipo del resultado. Si el asistente produce código que nadie puede explicar, has cambiado deuda técnica por deuda de comprensión."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "El asistente es un par júnior veloz, no el arquitecto",
                        "Contexto claro = resultados útiles",
                        "Entender antes de integrar, siempre",
                        "Que genere tests junto con el código"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 27,
            "title": "Flujo de trabajo aumentado",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "apis-de-ia-y-tokens": {
        "id": 55,
        "module_id": 25,
        "title": "APIs de IA y tokens",
        "slug": "apis-de-ia-y-tokens",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "APIs de IA y tokens"
                },
                {
                    "type": "paragraph",
                    "text": "Integrar IA en tu aplicación es, en su forma más simple, una llamada HTTP: envías un prompt a la API de un proveedor (OpenAI, Anthropic, Google, Mistral...) y recibes una respuesta. La unidad de coste y de medición es el token."
                },
                {
                    "type": "paragraph",
                    "text": "Los tokens son fragmentos de palabras; un texto de 1 000 palabras puede ser ~1 300 tokens según idioma. Pagas por tokens de entrada (tu prompt + contexto) y de salida (la respuesta). Por eso prompts largos cuestan más y hay que diseñarlos con intención."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Support\\Facades\\Http;\n\n$respuesta = Http::withToken(config('services.openai.key'))\n    ->post('https://api.openai.com/v1/chat/completions', [\n        'model'    => 'gpt-4o-mini',\n        'messages' => [\n            ['role' => 'system', 'content' => 'Eres un tutor de Laravel conciso.'],\n            ['role' => 'user', 'content' => 'Explica qué es un middleware en 2 líneas.'],\n        ],\n        'temperature' => 0.3,\n    ]);\n\n$texto = $respuesta->json('choices.0.message.content');\n$usage = $respuesta->json('usage'); // tokens de entrada y salida"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Conceptos de API"
                },
                {
                    "type": "list",
                    "items": [
                        "Token: unidad de texto y de coste",
                        "Entrada (prompt) y salida (respuesta) se cobran por separado",
                        "temperature: controla creatividad (0-1)",
                        "max_tokens: limita la longitud de la respuesta",
                        "Cada proveedor tiene su API y su SDK"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "En Laravel, encapsula la llamada en un servicio (AiService) con timeout, reintentos y validación de respuesta. Así el resto de la aplicación no sabe ni le importa qué proveedor hay detrás: hoy OpenAI, mañana otro."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Integrar IA = llamada HTTP con prompt y respuesta",
                        "Pagar por tokens de entrada y salida",
                        "temperature y max_tokens controlan el resultado",
                        "Encapsula el proveedor en un servicio propio"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 25,
            "title": "Conceptos",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "tipos-de-modelos-y-capacidades": {
        "id": 567,
        "module_id": 25,
        "title": "Tipos de modelos y sus capacidades",
        "slug": "tipos-de-modelos-y-capacidades",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Tipos de modelos y sus capacidades"
                },
                {
                    "type": "paragraph",
                    "text": "Los modelos se clasifican por tamaño (small, medium, large), modalidad (texto, imagen, audio, multimodal) y propósito (chat, instrucción, embedding, visión). Elegir el modelo correcto es una decisión de producto: no necesitas el más grande para tareas simples."
                },
                {
                    "type": "paragraph",
                    "text": "Los modelos pequeños (mini, flash, haiku) responden más rápido y más barato, y se quedan cortos en razonamiento complejo. Los grandes (opus, pro, sonnet) razonan mejor, pero cuestan más. Los embeddings convierten texto en vectores para búsqueda semántica."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Tabla mental de elección\n$eleccion = [\n    'Tarea simple (resumir, clasificar)' => 'modelo pequeño y barato',\n    'Código y razonamiento complejo'     => 'modelo grande',\n    'Búsqueda semántica'                 => 'modelo de embeddings',\n    'Imágenes'                           => 'modelo multimodal/visión',\n    'Audio'                              => 'modelo de voz (STT/TTS)',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dimensiones para elegir"
                },
                {
                    "type": "list",
                    "items": [
                        "Tamaño: coste, latencia y capacidad de razonamiento",
                        "Modalidad: texto, imagen, audio, multimodal",
                        "Contexto: cuántos tokens admite (8k, 128k, 1M...)",
                        "Precio: entrada, salida y caché",
                        "Latencia: crítica en UX en tiempo real"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Comienza con el modelo más pequeño que cumpla la tarea y sube solo si la calidad no alcanza. Mide con ejemplos reales, no con impresiones: un conjunto fijo de prompts de prueba te dirá cuándo el pequeño no da la talla."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Tamaño, modalidad, contexto y precio guían la elección",
                        "El modelo pequeño bien medido ahorra coste y latencia",
                        "Embeddings para búsqueda semántica",
                        "Evalúa con un set fijo de prompts, no con impresiones"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 25,
            "title": "Conceptos",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "integrar-ia-en-aplicaciones": {
        "id": 568,
        "module_id": 217,
        "title": "Integrar IA en tus aplicaciones",
        "slug": "integrar-ia-en-aplicaciones",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Integrar IA en tus aplicaciones"
                },
                {
                    "type": "paragraph",
                    "text": "Integrar un LLM en una aplicación real exige más que una llamada HTTP: manejar errores, timeouts y respuestas inválidas; aplicar rate limits; y diseñar una UX que comunique procesamiento y fallos. La IA es un servicio externo más, con sus particularidades."
                },
                {
                    "type": "paragraph",
                    "text": "Patrón recomendado: un servicio (AiClient) con timeout y reintentos, una capa de orquestación (que arma el prompt y valida la salida), y una respuesta tipada para el resto de la app. Así la IA puede fallar sin tumbar la aplicación."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "use Illuminate\\Support\\Facades\\Http;\nuse Illuminate\\Support\\Facades\\Log;\n\nclass AiService\n{\n    public function completar(string $system, string $usuario): string\n    {\n        $respuesta = Http::timeout(30)\n            ->retry(2, 1000)\n            ->withToken(config('services.ia.key'))\n            ->post(config('services.ia.url'), [\n                'model'    => config('services.ia.model'),\n                'messages' => [\n                    ['role' => 'system', 'content' => $system],\n                    ['role' => 'user', 'content' => $usuario],\n                ],\n            ]);\n\n        if ($respuesta->failed()) {\n            Log::error('IA falló', ['status' => $respuesta->status()]);\n            throw new AiException('No se pudo generar el contenido.');\n        }\n\n        return $respuesta->json('choices.0.message.content');\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Consideraciones de integración"
                },
                {
                    "type": "list",
                    "items": [
                        "Timeout y reintentos en cada llamada",
                        "Manejar errores tipados (AiException)",
                        "Rate limits del proveedor y backoff",
                        "Validar la estructura de la respuesta",
                        "UX honesta: indicador de procesamiento y fallo"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Si la respuesta alimenta un flujo crítico (generar un quiz, resumir un documento), valida contra un esquema: JSON con campos esperados, longitud mínima, contenido sin palabras prohibidas. Nunca insertes la salida del modelo en tu base de datos sin validar."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La IA es un servicio externo: timeout, retry, errores",
                        "Separa cliente, orquestación y respuesta tipada",
                        "Valida siempre la salida del modelo",
                        "La UX debe comunicar procesamiento y fallos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 217,
            "title": "Aplicación práctica",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "limites-y-alucinaciones": {
        "id": 569,
        "module_id": 217,
        "title": "Límites, sesgos y alucinaciones",
        "slug": "limites-y-alucinaciones",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Límites, sesgos y alucinaciones"
                },
                {
                    "type": "paragraph",
                    "text": "Los LLMs no saben lo que no saben: producen respuestas plausibles incluso cuando son falsas (alucinaciones) y reflejan sesgos presentes en su entrenamiento. Conocer estos límites define qué tareas delegarles y con qué salvaguardas."
                },
                {
                    "type": "paragraph",
                    "text": "Un modelo no distingue entre hecho aprendido y contexto previo; si le hablas de un \"documento adjunto\" que no existe, puede actuar como si existiera. Por eso los sistemas serios anclan la IA a fuentes verificadas (RAG) y exigen citas cuando el contenido se usa como hecho."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$salvaguardas = [\n    'Anclar a fuentes'        => 'RAG: dar contexto verificado en el prompt',\n    'Pedir citas'             => 'solicitar referencias del contenido',\n    'Confianza escalonada'    => 'revisión humana para outputs críticos',\n    'Pruebas de sesgo'        => 'evaluar respuestas con casos diversos',\n    'Prompt de límites'       => 'decir \"si no lo sabes, dilo\"',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Límites que debes gestionar"
                },
                {
                    "type": "list",
                    "items": [
                        "Alucinaciones: hechos inventados con seguridad",
                        "Sesgos: prejuicios heredados del entrenamiento",
                        "Conocimiento congelado: desactualización",
                        "Contexto finito: caben pocas páginas en el prompt",
                        "Sin verdad ni creencia: todo es predicción"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La regla de diseño: cuanto más grave es el error, más supervisión humana. Un resumen interno puede automatizarse al 100 %; un diagnóstico médico o una decisión legal, nunca sin revisión. La IA acelera, pero la responsabilidad sigue siendo humana."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Las alucinaciones son inevitables: diseña la validación",
                        "Los sesgos del entrenamiento se filtran a las respuestas",
                        "Ancla a fuentes verificadas para hechos",
                        "Gravedad alta = supervisión humana obligatoria"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 217,
            "title": "Aplicación práctica",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "etica-y-uso-responsable": {
        "id": 570,
        "module_id": 217,
        "title": "Ética y uso responsable de la IA",
        "slug": "etica-y-uso-responsable",
        "type": "article",
        "duration_minutes": 14,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ética y uso responsable de la IA"
                },
                {
                    "type": "paragraph",
                    "text": "Usar IA con responsabilidad significa decidir conscientemente qué tareas automatizamos, con qué datos y con qué transparencia. No todo lo técnicamente posible es deseable: la opacidad, el sesgo y la pérdida de privacidad son costes reales."
                },
                {
                    "type": "paragraph",
                    "text": "Tres preguntas guían cada decisión: ¿qué datos alimentan el modelo y de dónde vienen? ¿Puede la respuesta dañar o engañar a alguien? ¿El usuario sabe que interactúa con una IA y cuándo interviene un humano?"
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$checklistEtica = [\n    'Privacidad'     => '¿Enviamos solo los datos imprescindibles?',\n    'Transparencia'  => '¿El usuario sabe que hay IA y su límite?',\n    'Sesgo'          => '¿Probamos con casos diversos?',\n    'Supervisión'    => '¿Dónde está la revisión humana?',\n    'Retención'      => '¿Cuánto guarda el proveedor y dónde?',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Principios prácticos"
                },
                {
                    "type": "list",
                    "items": [
                        "Envía el mínimo de datos: menos superficie de riesgo",
                        "Anonimiza antes de enviar a un proveedor externo",
                        "Informa al usuario de que hay IA generativa",
                        "Evalúa sesgo con pruebas sobre grupos diversos",
                        "Define retención de datos con el proveedor"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La ética no es un freno, es un requisito de producto: usuarios que confían usan más el sistema, y datos que proteges evitan sanciones. Una política de IA escrita —qué sí, qué no, cómo se audita— convierte el criterio individual en cultura de equipo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Automatizar ≠ automatizar sin criterio",
                        "Mínimo de datos y anonimización con proveedores",
                        "Transparencia sobre la presencia de IA",
                        "La política escrita convierte la ética en cultura"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 217,
            "title": "Aplicación práctica",
            "course_id": 23,
            "course_slug": "introduccion-ia-para-desarrolladores",
            "course_title": "Introducción a la IA para desarrolladores",
            "course": {
                "id": 23,
                "slug": "introduccion-ia-para-desarrolladores",
                "title": "Introducción a la IA para desarrolladores"
            }
        }
    },
    "few-shot-y-cadena-de-pensamiento": {
        "id": 57,
        "module_id": 26,
        "title": "Few-shot y cadena de pensamiento",
        "slug": "few-shot-y-cadena-de-pensamiento",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Few-shot y cadena de pensamiento"
                },
                {
                    "type": "paragraph",
                    "text": "Few-shot significa enseñar con ejemplos: en lugar de describir la tarea, le das 2-3 ejemplos resueltos y el modelo imita el patrón. Es la técnica más fiable para lograr un formato o estilo consistente."
                },
                {
                    "type": "paragraph",
                    "text": "Cadena de pensamiento (chain-of-thought) pide al modelo razonar paso a paso antes de responder. Para problemas de lógica, matemáticas o código, razonar en voz alta mejora la precisión; el resultado final va después de los pasos."
                },
                {
                    "type": "code",
                    "language": "text",
                    "text": "Few-shot (clasificación):\n\"Clasifica el sentimiento del comentario: POSITIVO o NEGATIVO.\nEjemplo 1: 'El curso resuelve todas mis dudas' -> POSITIVO\nEjemplo 2: 'Instalar el entorno fue un infierno' -> NEGATIVO\nAhora: 'La documentación viene incompleta' ->\"\n\nCadena de pensamiento:\n\"Razona paso a paso cuántos tokens cuesta un prompt de\n300 palabras. Luego responde solo con el número final.\""
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar cada técnica"
                },
                {
                    "type": "list",
                    "items": [
                        "Few-shot: formato y estilo consistentes",
                        "Zero-shot: tareas simples sin ejemplos",
                        "Cadena de pensamiento: razonamiento y lógica",
                        "Ejemplos de calidad > cantidad de ejemplos",
                        "Combínalos: ejemplos + paso a paso"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Elige ejemplos representativos, incluido algún caso límite: si solo enseñas el caso fácil, el modelo fallará en el difícil. La cadena de pensamiento cuesta más tokens (pide razonar), pero falla menos en problemas que exigen varios pasos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Few-shot enseña con ejemplos; imita el patrón",
                        "Cadena de pensamiento razona antes de responder",
                        "Ejemplos con casos límite enseñan más",
                        "COT mejora lógica a coste de más tokens"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 26,
            "title": "Técnicas de prompting",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "patrones-avanzados-rag": {
        "id": 571,
        "module_id": 26,
        "title": "Patrones avanzados: RAG y herramientas",
        "slug": "patrones-avanzados-rag",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Patrones avanzados: RAG y herramientas"
                },
                {
                    "type": "paragraph",
                    "text": "RAG (Retrieval-Augmented Generation) conecta el modelo con tus documentos: trocea el contenido, lo indexa como embeddings y, al preguntar, recupera los fragmentos relevantes y los inyecta en el prompt. El modelo responde con base real y citable."
                },
                {
                    "type": "paragraph",
                    "text": "Las herramientas (function calling) dan al modelo la capacidad de ejecutar acciones: consultar una BD, llamar a una API, calcular. El modelo decide qué función llamar con qué argumentos, y tu código la ejecuta y devuelve el resultado (agente)."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Esquema RAG\n// 1. Indexar: dividir y embedizar documentos\n//    $vectores[] = EmbeddingService::crear($fragmento);\n// 2. Guardar: tabla con texto + vector (pgvector)\n// 3. Consultar: embedizar la pregunta y buscar cercanos\n// 4. Responder: inyectar fragmentos en el prompt\n\n// Esquema function calling\n$herramientas = [\n    ['type' => 'function', 'function' => [\n        'name'        => 'buscar_curso',\n        'description' => 'Busca cursos en la BD por término.',\n        'parameters'  => ['term' => 'string'],\n    ]],\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cuándo usar RAG y herramientas"
                },
                {
                    "type": "list",
                    "items": [
                        "RAG: hechos de tus documentos y dominio privado",
                        "RAG: respuestas con citas verificables",
                        "Herramientas: datos en vivo (BD, APIs)",
                        "Herramientas: acciones (enviar, crear, calcular)",
                        "Agente: modelo + herramientas + bucle de decisión"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "RAG resuelve el conocimiento congelado; las herramientas resuelven la acción. Ambos patrones convierten al LLM en un componente de tu sistema, no en un oráculo: la fuente la pones tú, y la validación final sigue en tu código."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "RAG inyecta documentos relevantes en el prompt",
                        "Embeddings + búsqueda por similitud",
                        "Function calling deja que el modelo invoque tus APIs",
                        "RAG = conocimiento; herramientas = acción"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 26,
            "title": "Técnicas de prompting",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "prompts-para-codigo": {
        "id": 572,
        "module_id": 218,
        "title": "Prompts efectivos para generar código",
        "slug": "prompts-para-codigo",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Prompts efectivos para generar código"
                },
                {
                    "type": "paragraph",
                    "text": "Generar código con IA funciona mejor cuando describes el contrato, no la implementación: entrada, salida, casos límite y restricciones. Pedir \"una función que valide emails\" es vago; especificar entrada, formato, reglas y errores produce código reutilizable."
                },
                {
                    "type": "paragraph",
                    "text": "Incluye tu stack y convenciones: \"Laravel 12, PHP 8.3, respeta el estilo PSR-12, usa validación de FormRequest\". Cuanto más contexto del proyecto, más código que encaja sin reescrituras."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Prompt de código efectivo\n$prompt = <<<'TXT'\nGenera un FormRequest de Laravel 12 para crear inscripciones.\n- Entrada: course_id (int), user_id (int), coupon (opcional string)\n- Reglas: course_id debe existir y tener plazas;\n         coupon, si existe, debe ser válido y no usado.\n- Mensajes en español.\n- Respóndeme solo PHP, sin explicaciones.\nTXT;"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Receta para prompts de código"
                },
                {
                    "type": "list",
                    "items": [
                        "Contrato: entrada, salida y casos límite",
                        "Stack y versiones concretas",
                        "Reglas de negocio explícitas",
                        "Formato de salida: solo código, con tests, con comentarios",
                        "Convenciones del equipo (estilo, naming)"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El código generado nunca se usa a ciegas: se revisa, se testea y se integra como cualquier otra contribución. La IA acelera el borrador; la calidad la pone tu revisión. Exige tests en el prompt y valida que los cumplen."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Describe contrato, no implementación",
                        "Da stack, versiones y convenciones",
                        "Explicita reglas de negocio y casos límite",
                        "Revisar y testear el código generado es obligatorio"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 218,
            "title": "Uso profesional",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "refinamiento-y-evaluacion": {
        "id": 573,
        "module_id": 218,
        "title": "Refinar y evaluar prompts: iteración sistemática",
        "slug": "refinamiento-y-evaluacion",
        "type": "code_challenge",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Refinar y evaluar prompts: iteración sistemática"
                },
                {
                    "type": "paragraph",
                    "text": "El prompt engineering se mejora con datos, no con intuición: defines un conjunto fijo de casos de prueba (golden set), ejecutas el prompt actual, anotas fallos y ajustas. Cada iteración mide si el prompt mejoró realmente."
                },
                {
                    "type": "paragraph",
                    "text": "Herramientas como evals, planillas o simples scripts comparan salidas: exactitud de formato, precisión de contenido, consistencia. El prompt es un artefacto de software: versionado, probado y con dueño."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Mini-eval de prompts\n$casos = [\n    ['input' => 'Explica middleware a un júnior', 'esperado' => 'incluye ejemplo'],\n    ['input' => '¿Qué es un trait?',            'esperado' => 'no alucina'],\n    ['input' => 'Código de validación',         'esperado' => 'solo PHP'],\n];\n\nfunction evaluar(string $prompt, array $casos): array\n{\n    $resultados = [];\n    foreach ($casos as $caso) {\n        $salida = AiService::completar('system', $prompt . \"\\n\" . $caso['input']);\n        $resultados[] = ['input' => $caso['input'], 'ok' => verificar($salida, $caso['esperado'])];\n    }\n    return $resultados;\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ciclo de refinamiento"
                },
                {
                    "type": "list",
                    "items": [
                        "Definir golden set: casos representativos",
                        "Criterios de evaluación: formato, contenido, sesgo",
                        "Ejecutar y anotar fallos",
                        "Ajustar prompt (más contexto, ejemplos, restricciones)",
                        "Re-ejecutar y comparar"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El refinamiento tiene rendimientos decrecientes: si el prompt falla por conocimiento (hechos), añade RAG en lugar de insistir con palabras. Distinguir entre problemas de instrucción y problemas de conocimiento te ahorra horas de tuning."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Evalúa con un golden set fijo, no con impresiones",
                        "El prompt se versiona y testea como código",
                        "Anota fallos y ajusta con evidencia",
                        "Instrucción ≠ conocimiento: RAG para hechos"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 218,
            "title": "Uso profesional",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "del-prompt-a-la-funcion": {
        "id": 574,
        "module_id": 218,
        "title": "Del prompt a la función: automatizar tareas con LLMs",
        "slug": "del-prompt-a-la-funcion",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Del prompt a la función: automatizar tareas con LLMs"
                },
                {
                    "type": "paragraph",
                    "text": "El salto profesional es convertir un prompt suelto en una función del sistema: entrada tipada, prompt estable versionado, salida validada y llamada invocable desde cualquier parte de la app (un job, un comando, un endpoint)."
                },
                {
                    "type": "paragraph",
                    "text": "Un pipeline de automatización típico: entrada (archivo, texto, evento) → prompt con contexto → llamada al modelo → validación y transformación → salida (resumen, clasificación, dataset). El prompt vive en un archivo, no incrustado en el código."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "class ResumenService\n{\n    public function __construct(private AiService $ia) {}\n\n    public function resumir(string $texto, int $maxPalabras): array\n    {\n        $prompt = sprintf(\n            file_get_contents(resource_path('prompts/resumen.txt')),\n            $maxPalabras,\n            $texto\n        );\n\n        $respuesta = $this->ia->completar(\n            'Eres un editor técnico que resume con precisión.',\n            $prompt\n        );\n\n        return [\n            'resumen' => $respuesta,\n            'palabras' => str_word_count($respuesta),\n        ];\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Diseño de una función de IA"
                },
                {
                    "type": "list",
                    "items": [
                        "Entrada tipada y validada",
                        "Prompt versionado en archivo (no incrustado)",
                        "Llamada con timeout, retry y errores tipados",
                        "Validación de la salida (esquema, longitud)",
                        "Uso desde jobs, comandos y endpoints"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Cuando el prompt se versiona, el fallo se testea y la salida se valida, la automatización con IA se vuelve mantenible: otro dev puede leer, probar y modificar el pipeline sin ser un experto en prompting."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "De prompt suelto a función con contrato",
                        "Prompts en archivos versionados",
                        "Entrada y salida validadas",
                        "Automatización mantenible = testeable"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 218,
            "title": "Uso profesional",
            "course_id": 24,
            "course_slug": "prompt-engineering-practico",
            "course_title": "Prompt Engineering práctico",
            "course": {
                "id": 24,
                "slug": "prompt-engineering-practico",
                "title": "Prompt Engineering práctico"
            }
        }
    },
    "ia-en-code-review-y-tests": {
        "id": 59,
        "module_id": 27,
        "title": "IA en code review, tests y documentación",
        "slug": "ia-en-code-review-y-tests",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "IA en code review, tests y documentación"
                },
                {
                    "type": "paragraph",
                    "text": "La IA destaca en las tareas de calidad que requieren leer mucho y decidir poco: detectar estilos inconsistentes, pedir tests faltantes, resumir un diff, generar casos de prueba o redactar documentación del cambio."
                },
                {
                    "type": "paragraph",
                    "text": "El flujo sano: la IA prepara el resumen y las alertas; el humano decide. Un revisor humano valida la lógica y las decisiones; la IA aporta exhaustividad donde la atención humana se cansa."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// IA como segunda opinión en review\n$preguntas = [\n    '¿Hay tests para este cambio? Señala rutas sin cubrir.',\n    '¿Hay errores comunes de seguridad (SQLi, XSS, authz)?',\n    '¿El estilo respeta el del proyecto?',\n    'Resume el diff en 3 frases para el contexto del PR.',\n    '¿Hay código muerto o duplicado introducido?',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Dónde aporta valor"
                },
                {
                    "type": "list",
                    "items": [
                        "Resumen de diffs para PRs",
                        "Detección de caminos sin tests",
                        "Patrones de seguridad comunes",
                        "Generación de casos de prueba bordes",
                        "Documentación de funciones y cambios"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La clave es posicionar la IA como asistente del revisor, no como revisor final: sus alertas se verifican, su resumen se corrige si hace falta, y las decisiones de aprobar o rechazar siguen siendo humanas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "IA lee mucho y decide poco: ideal para review preliminar",
                        "La decisión final es humana",
                        "Genera tests y documentación junto al código",
                        "Las alertas se verifican, no se aceptan a ciegas"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 27,
            "title": "Flujo de trabajo aumentado",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "ia-en-diseno-y-arquitectura": {
        "id": 575,
        "module_id": 27,
        "title": "IA para diseño y arquitectura de soluciones",
        "slug": "ia-en-diseno-y-arquitectura",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "IA para diseño y arquitectura de soluciones"
                },
                {
                    "type": "paragraph",
                    "text": "La IA puede ser una caja de resonancia en diseño: explicar trade-offs, recordar patrones, comparar alternativas o criticar un diseño propuesto. Pero la arquitectura es una decisión de contexto —tu dominio, tu equipo, tu escala— que la IA solo conoce si se la das."
                },
                {
                    "type": "paragraph",
                    "text": "Úsala como revisor temprano: describe tu diseño y pide que lo ataque, que liste riesgos y supuestos, o que compare con la alternativa. Es un consejo experto barato; la validación real vendrá del código y de la operación."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$preguntasDeArquitectura = [\n    '¿Qué riesgos ves en este diseño de microservicios?',\n    '¿Cómo escalaría esta cola en 10x la carga actual?',\n    '¿Qué patrón de Laravel encaja mejor para este módulo?',\n    'Compara caché en Redis vs base de datos para este caso.',\n    '¿Qué supuestos estoy dando por ciertos?',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo sacarle partido"
                },
                {
                    "type": "list",
                    "items": [
                        "Dale contexto completo: dominio, tráfico, equipo",
                        "Pide listas de riesgos y supuestos",
                        "Usa comparaciones explícitas de alternativas",
                        "Pide que critique tu diseño, no que lo apruebe",
                        "La decisión final se valida con datos, no con opiniones"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "El peligro es el sesgo de confirmación: si le pides \"¿está bien mi diseño?\", tiende a decir que sí. Pide explícitamente \"ataca este diseño\", \"dame 5 razones para no hacer esto\" y descubrirás supuestos que tú mismo no veías."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "La IA es caja de resonancia, no arquitecta",
                        "El contexto de dominio es tuyo: dáselo",
                        "Pide críticas y riesgos, no aprobaciones",
                        "Decisión final con datos, no con opinión del modelo"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 27,
            "title": "Flujo de trabajo aumentado",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "ia-generativa-en-produccion": {
        "id": 576,
        "module_id": 219,
        "title": "Llevar IA generativa a producción",
        "slug": "ia-generativa-en-produccion",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Llevar IA generativa a producción"
                },
                {
                    "type": "paragraph",
                    "text": "Un prototipo con IA funciona con un prompt; un sistema en producción requiere observabilidad, coste controlado, latencia predecible y plan de fallos. Las preguntas cambian: ¿cuánto cuesta cada llamada? ¿qué pasa si el proveedor cae? ¿podemos volver a una versión anterior?"
                },
                {
                    "type": "paragraph",
                    "text": "El flujo productivo: caché de respuestas repetibles, monitoreo de tokens y errores, alerts de latencia, detección de respuestas vacías o malformadas, y un fallback (respuesta plantilla o servicio alternativo) cuando el modelo no responde."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "// Servicio productivo con caché y fallback\nclass AiProduccion\n{\n    public function resumir(string $texto): string\n    {\n        $clave = 'iai:' . md5($texto);\n\n        return Cache::remember($clave, 3600, function () use ($texto) {\n            try {\n                $r = $this->ia->completar('...', $texto);\n                Log::info('IA ok', ['tokens' => $this->ia->ultimoUso()]);\n                return $r;\n            } catch (AiException $e) {\n                Log::error('IA caída', ['error' => $e->getMessage()]);\n                return 'Resumen no disponible. Inténtalo de nuevo.';\n            }\n        });\n    }\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Checklist de producción"
                },
                {
                    "type": "list",
                    "items": [
                        "Caché para respuestas repetibles",
                        "Métricas de tokens, coste y latencia",
                        "Alerts ante errores y malformados",
                        "Fallback ante caídas del proveedor",
                        "Versionado de prompts y evaluación continua",
                        "Retención de datos definida y comunicada"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "Trata la IA como un servicio externo más: con SLOs, alertas y plan de degradación. La parte más descuidada suele ser la evaluación continua: un prompt que funcionaba puede dejar de hacerlo cuando el proveedor actualiza el modelo."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Producción = observabilidad + coste + fallback",
                        "Caché y métricas de tokens desde el día uno",
                        "Evaluación continua ante cambios del proveedor",
                        "La caída del modelo no puede tumbar tu app"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 219,
            "title": "Integración avanzada",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "evaluacion-y-metricas-de-ia": {
        "id": 577,
        "module_id": 219,
        "title": "Evaluación y métricas de calidad en sistemas con IA",
        "slug": "evaluacion-y-metricas-de-ia",
        "type": "code_challenge",
        "duration_minutes": 17,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Evaluación y métricas de calidad en sistemas con IA"
                },
                {
                    "type": "paragraph",
                    "text": "La calidad de la IA no es binaria: se mide por tarea. Para clasificación, precisión y recall; para generación de texto, relevancia, fidelidad y ausencia de alucinaciones; para código, que compile, pase tests y cumpla el contrato."
                },
                {
                    "type": "paragraph",
                    "text": "El sistema de evaluación: un conjunto de casos (golden set), criterios por tarea y ejecución periódica (CI, cron). Los cambios de prompt, modelo o datos se miden contra la línea base antes de pasar a producción."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$metricas = [\n    'Clasificación'   => ['precisión', 'recall', 'F1'],\n    'Generación'      => ['relevancia (1-5)', 'fidelidad al contexto', 'alucinaciones'],\n    'Código generado' => ['compila', 'tests pasan', 'cumple contrato'],\n    'Conversacional'  => ['utilidad', 'tono', 'seguridad'],\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Cómo montar la evaluación"
                },
                {
                    "type": "list",
                    "items": [
                        "Golden set curado por humanos",
                        "Criterios específicos por tipo de tarea",
                        "Evaluación automática (reglas) + muestreo humano",
                        "Ejecutar en cada cambio de prompt o modelo",
                        "Guardar histórico para detectar regresiones"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "No hace falta un lab: empieza con 30-50 casos curados y una planilla. La evaluación automática marca sospechosos y un humano revisa una muestra. Con el tiempo, el golden set se amplía con los fallos reales que llegan de producción."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Métrica adecuada según la tarea",
                        "Golden set + ejecución periódica = línea base",
                        "Automático + muestreo humano",
                        "Los fallos de producción engordan el golden set"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 219,
            "title": "Integración avanzada",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "seguridad-y-privacidad-con-ia": {
        "id": 578,
        "module_id": 219,
        "title": "Seguridad y privacidad al usar IA en el desarrollo",
        "slug": "seguridad-y-privacidad-con-ia",
        "type": "article",
        "duration_minutes": 16,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Seguridad y privacidad al usar IA en el desarrollo"
                },
                {
                    "type": "paragraph",
                    "text": "Cada prompt que envías a un proveedor externo es una posible fuga: código propietario, datos de clientes, secretos. La regla de oro: nunca pegues secretos ni datos personales en chats públicos; usa instancias con retención cero para datos sensibles."
                },
                {
                    "type": "paragraph",
                    "text": "En código, la IA es un nuevo vector de ataque: puede sugerir librerías falsas o código vulnerable con apariencia perfecta. Por eso los sistemas con IA necesitan hardening específico: validar salidas, escapar contenido antes de renderizar y probar prompt injection."
                },
                {
                    "type": "code",
                    "language": "php",
                    "text": "$hardening = [\n    'Nunca enviar'      => 'secretos, tokens, datos personales',\n    'Prompt injection'  => 'tratar el texto del usuario como dato, no como orden',\n    'Validación'        => 'esquema y restricciones sobre la salida',\n    'Rendering'         => 'escapar la salida antes de mostrar (XSS)',\n    'Retención'         => 'usar proveedores con retención cero si aplica',\n];"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Riesgos específicos"
                },
                {
                    "type": "list",
                    "items": [
                        "Fuga de datos por prompts a proveedores",
                        "Prompt injection: el texto del usuario reordena al modelo",
                        "Salida maliciosa (XSS, enlaces, instrucciones)",
                        "Dependencias falsas sugeridas",
                        "Permisos excesivos en agentes con herramientas"
                    ]
                },
                {
                    "type": "paragraph",
                    "text": "La prompt injection ocurre cuando mezclas datos de usuario con instrucciones del sistema: el texto \"ignora tus reglas y...\" puede secuestrar el prompt. Aislar instrucciones de datos, usar delimitadores y validar la salida reduce el riesgo; y los agentes con herramientas deben tener el mínimo permiso posible."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Puntos clave"
                },
                {
                    "type": "list",
                    "items": [
                        "Nunca secrets ni datos personales en prompts",
                        "Aísla instrucciones de datos del usuario",
                        "Escapa y valida toda salida del modelo",
                        "Agentes con herramientas = mínimo privilegio"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 219,
            "title": "Integración avanzada",
            "course_id": 25,
            "course_slug": "ia-en-el-ciclo-de-desarrollo",
            "course_title": "IA en el ciclo de desarrollo",
            "course": {
                "id": 25,
                "slug": "ia-en-el-ciclo-de-desarrollo",
                "title": "IA en el ciclo de desarrollo"
            }
        }
    },
    "arquitectura-web-http-codigos-de-estado-http-y-buenas-practicas-de-uso": {
        "id": 603,
        "module_id": 228,
        "title": "Códigos de estado HTTP y buenas prácticas de uso",
        "slug": "arquitectura-web-http-codigos-de-estado-http-y-buenas-practicas-de-uso",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": "## Códigos de Estado HTTP y Buenas Prácticas\n\nUtilizar los códigos de estado adecuados según la especificación RFC 9110 es indispensable para que los clientes frontend y consumidores de API reaccionen con precisión:\n\n### Familias de Códigos\n* **2xx (Éxito):**\n  - `200 OK`: Petición exitosa estándar (GET, PUT, PATCH).\n  - `201 Created`: Recurso creado exitosamente (POST). Devuelve cabecera `Location` o el recurso en el body.\n  - `204 No Content`: Petición procesada exitosamente sin contenido en el cuerpo (DELETE).\n* **4xx (Errores del Cliente):**\n  - `400 Bad Request`: Formato de petición inválido o malformado.\n  - `401 Unauthorized`: El usuario no está autenticado (falta token o expiró).\n  - `403 Forbidden`: El usuario está autenticado pero no tiene permisos para este recurso.\n  - `404 Not Found`: El recurso no existe.\n  - `422 Unprocessable Entity`: La petición es legible pero falla validaciones de negocio.\n* **5xx (Errores del Servidor):**\n  - `500 Internal Server Error`: Excepción no controlada en el backend.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 228,
            "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "diseno-apis-restful-nomenclatura-restful-y-recursos-anidados-vs-independientes": {
        "id": 605,
        "module_id": 229,
        "title": "Nomenclatura RESTful y recursos anidados vs independientes",
        "slug": "diseno-apis-restful-nomenclatura-restful-y-recursos-anidados-vs-independientes",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": "## Nomenclatura RESTful y Recursos Anidados\n\nEl diseño de APIs RESTful se basa en **Recursos** modelados con sustantivos en plural, nunca verbos:\n\n```\nBIEN: GET    /api/v1/cursos              (Listar cursos)\nBIEN: POST   /api/v1/cursos              (Crear curso)\nBIEN: GET    /api/v1/cursos/12           (Ver detalle del curso 12)\nBIEN: DELETE /api/v1/cursos/12           (Eliminar curso 12)\n\nMAL:  POST   /api/v1/crearCurso          (Antipatrón RPC)\nMAL:  GET    /api/v1/obtenerCursos       (Antipatrón RPC)\n```\n\n### Recursos Anidados vs Independientes\n* **Anidado (Relación de pertenencia estricta):** `/api/v1/cursos/{id}/lecciones` (las lecciones solo existen en el contexto de un curso).\n* **Independiente:** Si la profundidad de anidamiento supera 2 niveles, rompe a un endpoint plano: `/api/v1/lecciones/{id}/comentarios`.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 229,
            "title": "Estándares de Diseño de APIs",
            "course_id": 103,
            "course_slug": "diseno-apis-restful",
            "course_title": "Diseño y Versionado de APIs RESTful",
            "course": {
                "id": 103,
                "slug": "diseno-apis-restful",
                "title": "Diseño y Versionado de APIs RESTful"
            }
        }
    },
    "css-moderno-flexbox-grid-flexbox-a-fondo-alineacion-distribucion-y-wrapping": {
        "id": 608,
        "module_id": 230,
        "title": "Flexbox a fondo: alineación, distribución y wrapping",
        "slug": "css-moderno-flexbox-grid-flexbox-a-fondo-alineacion-distribucion-y-wrapping",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## Flexbox a Fondo: Alineación, Distribución y Wrapping\n\nFlexbox (CSS Flexible Box Layout) es el estándar unidimensional para alinear y distribuir espacio entre elementos en una fila o columna.\n\n```css\n.contenedor-flex {\n  display: flex;\n  flex-direction: row;            /* row | column */\n  justify-content: space-between; /* Eje principal: flex-start, center, space-between */\n  align-items: center;            /* Eje transversal: stretch, center, flex-start */\n  gap: 1.5rem;                    /* Espacio moderno entre elementos */\n  flex-wrap: wrap;                /* Permite saltar a la siguiente línea si no hay espacio */\n}\n```\n\n```diagram\n{\n  \"diagram_type\": \"comparison\",\n  \"title\": \"📐 Los Dos Ejes de Flexbox: Eje Principal vs Eje Transversal\",\n  \"caption\": \"La regla de oro de Flexbox: el valor de flex-direction determina cuál es el Main Axis. Si es row, el Main Axis es horizontal (X). Si es column, el Main Axis es vertical (Y).\",\n  \"leftLabel\": \"Eje Principal (Main Axis) -> justify-content\",\n  \"leftItems\": [\n    \"Controla la distribución a lo largo de la dirección de flujo\",\n    \"Valores clave: flex-start, center, flex-end, space-between, space-around\",\n    \"Afecta al espaciado horizontal si flex-direction es row\",\n    \"Determina cómo se reparte el espacio sobrante en la fila/columna\"\n  ],\n  \"rightLabel\": \"Eje Transversal (Cross Axis) -> align-items\",\n  \"rightItems\": [\n    \"Controla la alineación perpendicular al flujo principal\",\n    \"Valores clave: stretch (por defecto), center, flex-start, flex-end, baseline\",\n    \"Afecta a la altura/verticalidad si flex-direction es row\",\n    \"align-self permite sobreescribir este alineamiento en un hijo específico\"\n  ]\n}\n```\n\n### Propiedades de los Hijos (Flex Items)\n* `flex-grow: 1`: El elemento se expande para ocupar el espacio libre disponible.\n* `flex-shrink: 0`: Evita que el elemento se comprima si falta espacio.\n* `flex-basis: 300px`: Tamaño base ideal antes de aplicar grow o shrink.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 230,
            "title": "Sistemas de Layout Moderno",
            "course_id": 104,
            "course_slug": "css-moderno-flexbox-grid",
            "course_title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
            "course": {
                "id": 104,
                "slug": "css-moderno-flexbox-grid",
                "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design"
            }
        }
    },
    "css-moderno-flexbox-grid-css-grid-areas-columnas-implicitas-y-minmax": {
        "id": 609,
        "module_id": 230,
        "title": "CSS Grid: áreas, columnas implícitas y minmax()",
        "slug": "css-moderno-flexbox-grid-css-grid-areas-columnas-implicitas-y-minmax",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## CSS Grid: Áreas, Columnas Implícitas y minmax()\n\nA diferencia de Flexbox (unidimensional), **CSS Grid** es un sistema bidimensional (filas y columnas simultáneas) diseñado para layouts de página completos.\n\n### El Patrón Responsivo Definitivo sin Media Queries\n```css\n.grid-auto-responsive {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}\n```\n* `auto-fit`: Llena el ancho de pantalla creando tantas columnas como quepan.\n* `minmax(280px, 1fr)`: Cada tarjeta mide como mínimo 280px y se estira equitativamente (`1fr`) si sobra espacio.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 230,
            "title": "Sistemas de Layout Moderno",
            "course_id": 104,
            "course_slug": "css-moderno-flexbox-grid",
            "course_title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
            "course": {
                "id": 104,
                "slug": "css-moderno-flexbox-grid",
                "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design"
            }
        }
    },
    "typescript-profesional-frontend-uniones-discriminadas-tipos-mapeados-y-keyof": {
        "id": 611,
        "module_id": 231,
        "title": "Uniones discriminadas, tipos mapeados y keyof",
        "slug": "typescript-profesional-frontend-uniones-discriminadas-tipos-mapeados-y-keyof",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## Uniones Discriminadas, Tipos Mapeados y keyof en TypeScript\n\nTypeScript permite modelar estados complejos de forma segura mediante **Discriminated Unions (Uniones Etiquetadas)**:\n\n```typescript\ntype EstadoPeticion<T> =\n  | { estado: 'inactivo' }\n  | { estado: 'cargando' }\n  | { estado: 'exito'; datos: T }\n  | { estado: 'error'; mensaje: string };\n\nfunction renderizar(res: EstadoPeticion<string[]>) {\n  switch (res.estado) {\n    case 'inactivo': return 'Listo';\n    case 'cargando': return 'Cargando...';\n    case 'exito':    return res.datos.join(', '); // Autocompletado garantizado\n    case 'error':    return `Error: ${res.mensaje}`;\n  }\n}\n```\n\n> **Garantía del Compilador:** Al usar un campo discriminador (`estado`), el compilador sabe exactamente qué propiedades existen dentro de cada rama del `switch` sin casteos inseguros.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 231,
            "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "typescript-profesional-frontend-genericos-reutilizables-para-clientes-http-y-estados": {
        "id": 612,
        "module_id": 231,
        "title": "Genéricos reutilizables para clientes HTTP y estados",
        "slug": "typescript-profesional-frontend-genericos-reutilizables-para-clientes-http-y-estados",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## Genéricos Reutilizables para Clientes HTTP y Estados\n\nLos tipos genéricos permiten escribir componentes, funciones y servicios que operan sobre múltiples tipos de datos preservando la seguridad de tipos estricta:\n\n```typescript\nexport interface ApiResponse<T> {\n  data: T;\n  message?: string;\n  status: number;\n}\n\nexport interface Paginado<T> {\n  items: T[];\n  total: number;\n  pagina: number;\n}\n\nasync function fetchJson<T>(url: string): Promise<ApiResponse<T>> {\n  const res = await fetch(url);\n  return res.json();\n}\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 231,
            "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "git-avanzado-rebase-conflictos-recuperacion-de-commits-perdidos-con-git-reflog": {
        "id": 617,
        "module_id": 233,
        "title": "Recuperación de commits perdidos con Git Reflog",
        "slug": "git-avanzado-rebase-conflictos-recuperacion-de-commits-perdidos-con-git-reflog",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": "## Recuperación de Commits Perdidos con Git Reflog\n\n`git reflog` (Reference Log) es el salvavidas de todo desarrollador. Registra cada vez que la punta de `HEAD` cambia en tu repositorio local (por commit, checkout, rebase, merge o reset).\n\n```bash\n# Ver el historial de todos los movimientos de HEAD\ngit reflog\n\n# Salida típica:\n# a1b2c3d HEAD@{0}: reset: moving to HEAD~1\n# f4e5d6c HEAD@{1}: commit: feat: módulo de pagos\n# 7a8b9c0 HEAD@{2}: checkout: moving from main to feature/pagos\n```\n\n### ¿Cómo Recuperar un Commit Borrado accidentalmente?\nSi hiciste un `git reset --hard` no deseado:\n```bash\n# 1. Identifica el hash del commit en el reflog (ej. f4e5d6c)\n# 2. Restaura el estado de tu rama a ese commit:\ngit reset --hard f4e5d6c\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 233,
            "title": "Herramientas de Rescate y Depuración",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "git-avanzado-rebase-conflictos-depuracion-binaria-de-regresiones-con-git-bisect": {
        "id": 618,
        "module_id": 233,
        "title": "Depuración binaria de regresiones con Git Bisect",
        "slug": "git-avanzado-rebase-conflictos-depuracion-binaria-de-regresiones-con-git-bisect",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": "## Depuración Binaria de Regresiones con Git Bisect\n\nCuando un bug aparece en producción y no sabes qué commit lo causó entre cientos de cambios, `git bisect` realiza una **búsqueda binaria** en el historial para encontrar el commit culpable en tiempo `O(log n)`.\n\n```bash\n# 1. Iniciar la sesión de búsqueda binaria\ngit bisect start\n\n# 2. Marcar la versión actual como rota (bad)\ngit bisect bad\n\n# 3. Indicar el último commit o tag conocido donde todo funcionaba bien\ngit bisect good v1.4.0\n\n# 4. Git ubica automáticamente el commit intermedio; ejecutas tus pruebas\n# Si falla:\ngit bisect bad\n# Si pasa:\ngit bisect good\n\n# 5. Git te informa el commit exacto que introdujo el error. Al finalizar:\ngit bisect reset\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 233,
            "title": "Herramientas de Rescate y Depuración",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "git-avanzado-rebase-conflictos-evaluacion-final-estrategias-avanzadas-en-git": {
        "id": 619,
        "module_id": 233,
        "title": "Evaluación final: Estrategias avanzadas en Git",
        "slug": "git-avanzado-rebase-conflictos-evaluacion-final-estrategias-avanzadas-en-git",
        "type": "quiz",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": "## Evaluación Final: Estrategias Avanzadas en Git\n\nPon a prueba tu dominio de Rebase, Reflog, Bisect y resolución de conflictos complejos en equipos distribuidos.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 233,
            "title": "Herramientas de Rescate y Depuración",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-estrategias-de-chunking-y-preprocesamiento-de-textos-tecnicos": {
        "id": 624,
        "module_id": 235,
        "title": "Estrategias de chunking y preprocesamiento de textos técnicos",
        "slug": "rag-embeddings-bases-vectoriales-estrategias-de-chunking-y-preprocesamiento-de-textos-tecnicos",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## Estrategias de Chunking y Preprocesamiento\n\nLos modelos de lenguaje tienen una ventana de contexto limitada y recuperan mejor fragmentos de texto específicos que documentos enteros de 100 páginas. El proceso de dividir documentos se denomina **Chunking**.\n\n### Estrategias de Partición\n* **Fixed-size con Overlap:** Divide el texto en fragmentos de tamaño fijo (ej. 500 caracteres) con solapamiento (ej. 100 caracteres) para no cortar ideas a la mitad.\n* **Semantic Chunking:** Divide el texto respetando los límites de párrafos, títulos markdown y bloques de código.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 235,
            "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "docker-compose-multiservicio-estructura-del-archivo-composeyaml-y-directivas-esenciales": {
        "id": 620,
        "module_id": 234,
        "title": "Estructura del archivo compose.yaml y directivas esenciales",
        "slug": "docker-compose-multiservicio-estructura-del-archivo-composeyaml-y-directivas-esenciales",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": "## Estructura del Archivo compose.yaml y Directivas Esenciales\n\nDocker Compose define y ejecuta aplicaciones multicontenedor mediante un único manifiesto declarativo en formato YAML.\n\n```yaml\nservices:\n  api:\n    build: .\n    ports:\n      - \"8000:8000\"\n    environment:\n      - DB_HOST=postgres\n      - DB_PORT=5432\n    depends_on:\n      postgres:\n        condition: service_healthy\n    networks:\n      - backend-net\n\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_DB: syseng_db\n      POSTGRES_USER: postgres\n      POSTGRES_PASSWORD: secretpassword\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U postgres\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n    networks:\n      - backend-net\n\nvolumes:\n  pgdata:\n\nnetworks:\n  backend-net:\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 234,
            "title": "Módulo 1: Orquestación Local y Redes Aisladas",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "docker-compose-multiservicio-persistencia-con-volumenes-y-variables-de-entorno-seguras": {
        "id": 621,
        "module_id": 234,
        "title": "Persistencia con volúmenes y variables de entorno seguras",
        "slug": "docker-compose-multiservicio-persistencia-con-volumenes-y-variables-de-entorno-seguras",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": "## Persistencia con Volúmenes y Variables de Entorno Seguras\n\nLos contenedores son efímeros por naturaleza: al eliminarse un contenedor, todos los archivos modificados dentro de su capa de escritura se destruyen.\n\n### Tipos de Volúmenes en Docker\n* **Named Volumes (`pgdata:/var/lib/...`):** Administrados directamente por el motor de Docker en `/var/lib/docker/volumes/`. Ideales para bases de datos en producción por su rendimiento y aislamiento.\n* **Bind Mounts (`./src:/app`):** Mapean directamente una carpeta de tu sistema host dentro del contenedor. Ideales para recarga en caliente (*Hot Reloading*) en entornos de desarrollo local.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 234,
            "title": "Módulo 1: Orquestación Local y Redes Aisladas",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "especificacion-srs-diagramas-estructura-de-una-especificacion-de-requisitos-de-software-srs": {
        "id": 626,
        "module_id": 236,
        "title": "Estructura de una Especificación de Requisitos de Software (SRS)",
        "slug": "especificacion-srs-diagramas-estructura-de-una-especificacion-de-requisitos-de-software-srs",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## Estructura de una Especificación de Requisitos de Software (SRS)\n\nLa **Especificación de Requisitos de Software (SRS)** según el estándar IEEE 830 / ISO/IEC/IEEE 29148 formaliza el acuerdo entre clientes, usuarios y el equipo de ingeniería de software.\n\n### Clasificación FURPS+ de Requisitos\n* **F - Funcionalidad (Functional):** Capacidades, características, flujos y seguridad de la aplicación.\n* **U - Usabilidad (Usability):** Ergonomía, diseño centrado en el usuario, estética, accesibilidad (WCAG).\n* **R - Confiabilidad (Reliability):** Tolerancia a fallos, frecuencia de caídas, capacidad de recuperación (MTTR).\n* **P - Rendimiento (Performance):** Tiempos de respuesta, concurrencia, rendimiento transaccional (*throughput*).\n* **S - Soporte y Mantenibilidad (Supportability):** Facilidad de prueba, escalabilidad, portabilidad.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 236,
            "title": "Modelado y Documentación Formal",
            "course_id": 109,
            "course_slug": "especificacion-srs-diagramas",
            "course_title": "Especificación Formal (SRS) y Casos de Uso",
            "course": {
                "id": 109,
                "slug": "especificacion-srs-diagramas",
                "title": "Especificación Formal (SRS) y Casos de Uso"
            }
        }
    },
    "especificacion-srs-diagramas-quiz-analisis-de-ambiguedades-en-requerimientos": {
        "id": 628,
        "module_id": 236,
        "title": "Quiz: Análisis de ambigüedades en requerimientos",
        "slug": "especificacion-srs-diagramas-quiz-analisis-de-ambiguedades-en-requerimientos",
        "type": "quiz",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": "## Quiz: Análisis de Ambigüedades en Requerimientos\n\nEvalúa tu capacidad para detectar requisitos ambiguos, no medibles o contradictorios en especificaciones de software.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 236,
            "title": "Modelado y Documentación Formal",
            "course_id": 109,
            "course_slug": "especificacion-srs-diagramas",
            "course_title": "Especificación Formal (SRS) y Casos de Uso",
            "course": {
                "id": 109,
                "slug": "especificacion-srs-diagramas",
                "title": "Especificación Formal (SRS) y Casos de Uso"
            }
        }
    },
    "linters-formateadores-y-buenas-practicas": {
        "id": 631,
        "module_id": 237,
        "title": "Linters, Formateadores Automáticos (Prettier/ESLint) y Buenas Prácticas",
        "slug": "linters-formateadores-y-buenas-practicas",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Formateadores vs Linters: No Son lo Mismo"
                },
                {
                    "type": "paragraph",
                    "text": "Uno de los errores más comunes de los programadores novatos es confundir un formateador de código con un linter. Ambos analizan tu código, pero resuelven problemas completamente distintos:"
                },
                {
                    "type": "list",
                    "items": [
                        "Formateador (ej. Prettier): Se ocupa EXCLUSIVAMENTE de la estética visual: espaciado, longitud máxima de línea, comillas dobles vs simples, punto y coma final, saltos de línea consistentes.",
                        "Linter (ej. ESLint, Ruff, PHP CS Fixer): Se ocupa de la CALIDAD del código y posibles bugs: variables declaradas pero nunca usadas, imports rotos, funciones con complejidad ciclomática excesiva o tipos incompatibles."
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Automatización con \"Format on Save\""
                },
                {
                    "type": "paragraph",
                    "text": "Nunca pierdas tiempo alineando llaves o indentando espacios manualmente. Con la configuración adecuada en tu editor, cada vez que presionas Ctrl+S (guardar), el código se auto-ordena con precisión milimétrica."
                },
                {
                    "type": "code",
                    "language": "json",
                    "text": "// Configuración recomendada en settings.json\n{\n  \"editor.formatOnSave\": true,\n  \"editor.defaultFormatter\": \"esbenp.prettier-vscode\",\n  \"editor.codeActionsOnSave\": {\n    \"source.fixAll.eslint\": \"explicit\"\n  },\n  \"editor.tabSize\": 2\n}"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Top Extensiones Esenciales que Todo Desarrollador Debe Instalar"
                },
                {
                    "type": "list",
                    "items": [
                        "Prettier - Code Formatter: El estándar de oro para formateo automático en JS, TS, HTML, CSS, JSON.",
                        "Error Lens: Resalta los errores de compilación y linter directamente en la línea donde ocurren, sin tener que posar el mouse encima.",
                        "GitLens: Muestra quién escribió cada línea de código, cuándo y en qué commit (git blame interactivo).",
                        "Path Intellisense: Autocompleta nombres de carpetas y archivos cuando haces imports.",
                        "Auto Rename Tag: Si cambias una etiqueta HTML de apertura (ej. <div -> <section), renombra la de cierre automáticamente."
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "terminal-integrada-y-flujo-de-comandos": {
        "id": 632,
        "module_id": 237,
        "title": "La Terminal Integrada y Flujo de Trabajo en Línea de Comandos",
        "slug": "terminal-integrada-y-flujo-de-comandos",
        "type": "article",
        "duration_minutes": 15,
        "order": 4,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Por Qué el Programador Profesional Vive en la Terminal"
                },
                {
                    "type": "paragraph",
                    "text": "En el cine muestran a los hackers escribiendo en pantallas negras con letras verdes. Aunque en la realidad no hackeamos a la NASA en 10 segundos, la terminal (CLI o Command Line Interface) es la herramienta más veloz y poderosa del desarrollador de software. Permite automatizar tareas, levantar servidores, correr migraciones y desplegar a la nube."
                },
                {
                    "type": "callout",
                    "tone": "tip",
                    "title": "Terminal Integrada en el Editor",
                    "text": "En vez de alternar ventanas entre tu editor y la consola de tu sistema operativo, presiona Ctrl + ` (backtick) para abrir la terminal integrada en la carpeta exacta de tu proyecto."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comandos Esenciales de Navegación y Archivos"
                },
                {
                    "type": "list",
                    "items": [
                        "pwd (Print Working Directory): Muestra en qué ruta del disco duro te encuentras parado.",
                        "ls (o dir en Windows): Lista todos los archivos y carpetas del directorio actual. Usa \"ls -la\" para ver archivos ocultos.",
                        "cd <carpeta> (Change Directory): Entra a una carpeta. Usa \"cd ..\" para retroceder un nivel.",
                        "mkdir <nombre> (Make Directory): Crea una carpeta nueva.",
                        "touch <archivo> (o New-Item en PowerShell): Crea un archivo nuevo vacío.",
                        "rm <archivo> (Remove): Elimina un archivo. ¡Cuidado: en terminal no hay papelera de reciclaje!"
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ejecutando tus Programas desde la Terminal"
                },
                {
                    "type": "paragraph",
                    "text": "Aprender cómo invocar los intérpretes y compiladores directamente es fundamental para no depender de botones mágicos:"
                },
                {
                    "type": "code",
                    "language": "bash",
                    "text": "# Ejecutar un script de Python:\npython3 main.py\n\n# Ejecutar un script de Node.js / JavaScript:\nnode app.js\n\n# Ejecutar un script con Bun (TypeScript directo):\nbun run index.ts\n\n# Compilar y ejecutar C++:\ng++ -O2 main.cpp -o programa\n./programa"
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "ecosistema-profesional-jetbrains-neovim-jupyter": {
        "id": 633,
        "module_id": 237,
        "title": "Ecosistema Profesional: JetBrains, Neovim, Jupyter y Cuándo Elegir Cada Uno",
        "slug": "ecosistema-profesional-jetbrains-neovim-jupyter",
        "type": "article",
        "duration_minutes": 15,
        "order": 5,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El Panorama Profesional: No Existe la Herramienta Única"
                },
                {
                    "type": "paragraph",
                    "text": "Aunque VS Code domina en la web y proyectos generales, la industria utiliza herramientas altamente especializadas para diferentes perfiles de ingeniería de software:"
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "1. La Suite de JetBrains (PyCharm, IntelliJ IDEA, WebStorm, PhpStorm)"
                },
                {
                    "type": "paragraph",
                    "text": "JetBrains crea los IDEs más potentes del planeta. A diferencia de editores modulares, sus IDEs indexan todo el proyecto en segundo plano y construyen un mapa semántico completo de clases, tipos y llamadas en memoria."
                },
                {
                    "type": "list",
                    "items": [
                        "IntelliJ IDEA: El estándar supremo en el desarrollo Java y Kotlin empresarial.",
                        "PyCharm: El IDE más avanzado para Python profesional, con inspección profunda de datos y análisis de Django/FastAPI.",
                        "PhpStorm: El favorito indiscutible de los ingenieros backend que trabajan con Laravel y Symfony.",
                        "Cuándo usarlos: En proyectos grandes donde la refactorización segura y el análisis de tipos son críticos, y tu equipo tiene al menos 16 GB de RAM."
                    ]
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "2. Neovim y Vim: La Velocidad Modal de la Terminal"
                },
                {
                    "type": "paragraph",
                    "text": "Neovim no se usa con ratón. Opera mediante \"modos\" (Normal, Insertar, Visual, Comando). Una vez dominado, permite editar código a la velocidad del pensamiento. Es ultraligero (pesa menos de 30 MB) y corre directamente dentro de servidores remotos por SSH."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "3. Jupyter Notebooks y Google Colab: Ciencia de Datos e IA"
                },
                {
                    "type": "paragraph",
                    "text": "En Inteligencia Artificial y Machine Learning, el código no siempre se ejecuta como un script continuo de inicio a fin. Los Notebooks permiten dividir el código en \"celdas\" ejecutables independientes, mezclando código Python, tablas interactivas y gráficos visuales."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Matriz de Decisión para Tu Carrera"
                },
                {
                    "type": "list",
                    "items": [
                        "Principiante / Full-Stack / Web: VS Code (Fácil de configurar, liviano, gratuito, universal).",
                        "Backend Empresarial (Java, Laravel, C#): JetBrains IntelliJ / PhpStorm / Visual Studio.",
                        "Data Science / Machine Learning: Jupyter Notebook + VS Code.",
                        "DevOps / SysAdmin / Entornos Remotos: Neovim / Vim."
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "taller-practico-depuracion-y-resolucion-de-bugs": {
        "id": 634,
        "module_id": 237,
        "title": "Taller Práctico y Desafío: Depuración de Código y Resolución de Bugs",
        "slug": "taller-practico-depuracion-y-resolucion-de-bugs",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 6,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Taller de Depuración Interactiva en el Entorno Simulado"
                },
                {
                    "type": "paragraph",
                    "text": "¡A programar se aprende programando! En este desafío pondrás a prueba tus habilidades de depuración. Utiliza el editor simulado a continuación para escribir, ejecutar y verificar tu solución en tiempo real con el Sandbox de SysEngAcademy."
                },
                {
                    "type": "callout",
                    "tone": "tip",
                    "title": "Herramientas a tu Disposición",
                    "text": "Puedes ejecutar el código cuantas veces quieras con el botón ▶ \"Ejecutar Código\", ver la salida exacta en la terminal integrada y consultar a Byte IA para recibir orientación socrática si te quedas atascado."
                }
            ]
        },
        "starter_code": "# DESAFÍO: Depura la función de cálculo de estadísticas\n# El siguiente código tiene 2 bugs lógicos que debes resolver:\n# 1. Cuando la lista de números está vacía, debe retornar {\"promedio\": 0.0, \"maximo\": 0, \"minimo\": 0}\n#    en lugar de fallar por división entre cero.\n# 2. El promedio calculado no está redondeando a 2 decimales y a veces calcula mal la suma.\n# 3. Corre el código en el Sandbox y valida todos los casos de prueba con el runner.\n\ndef calcular_estadisticas(numeros: list[int]) -> dict:\n    # Corrige los bugs aquí:\n    if not numeros:\n        return {\"promedio\": 0.0, \"maximo\": 0, \"minimo\": 0}\n    \n    total = sum(numeros)\n    promedio = round(total / len(numeros), 2)\n    maximo = max(numeros)\n    minimo = min(numeros)\n    \n    return {\n        \"promedio\": promedio,\n        \"maximo\": maximo,\n        \"minimo\": minimo\n    }\n\n# Prueba local:\nprint(calcular_estadisticas([10, 20, 30, 40, 50]))\nprint(calcular_estadisticas([]))\n",
        "solution": "def calcular_estadisticas(numeros: list[int]) -> dict:\n    if not numeros:\n        return {\"promedio\": 0.0, \"maximo\": 0, \"minimo\": 0}\n    return {\n        \"promedio\": round(sum(numeros) / len(numeros), 2),\n        \"maximo\": max(numeros),\n        \"minimo\": min(numeros)\n    }\n",
        "test_cases": [
            {
                "input": "",
                "expected": "{'promedio': 30.0, 'maximo': 50, 'minimo': 10}\n{'promedio': 0.0, 'maximo': 0, 'minimo': 0}"
            }
        ],
        "hint": "Revisa cómo se comporta la función cuando la lista está vacía con `if not numeros:` y utiliza `round(..., 2)` para redondear a 2 decimales.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 237,
            "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
            "course_id": 1,
            "course_slug": "introduccion-programacion",
            "course_title": "Introducción a la Programación",
            "course": {
                "id": 1,
                "slug": "introduccion-programacion",
                "title": "Introducción a la Programación"
            }
        }
    },
    "docker-compose-multiservicio-reto-practico-generador-de-string-de-conexion-docker": {
        "id": 655,
        "module_id": 234,
        "title": "Reto Práctico: Generador de String de Conexión Docker",
        "slug": "docker-compose-multiservicio-reto-practico-generador-de-string-de-conexion-docker",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Validador de URL de Conexión Interna"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str` que ensamble de forma segura el DSN sin exponer errores."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Formato"
                },
                {
                    "type": "paragraph",
                    "text": "\"{driver}://{usuario}:{password}@{host}:{puerto}/{db}\""
                }
            ]
        },
        "starter_code": "def construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str:\n    # TODO: ensamblar DSN\n    pass\n",
        "solution": "def construir_url_db(driver: str, usuario: str, password: str, host: str, puerto: int, db: str) -> str:\n    return f\"{driver}://{usuario}:{password}@{host}:{puerto}/{db}\"\n",
        "test_cases": [
            {
                "input": "construir_url_db(\"postgresql\", \"app_user\", \"sec123\", \"db_postgres\", 5432, \"syseng_prod\")",
                "expected": "postgresql://app_user:sec123@db_postgres:5432/syseng_prod"
            }
        ],
        "hint": "Usa f-strings de Python con los nombres de variables correspondientes.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 234,
            "title": "Módulo 1: Orquestación Local y Redes Aisladas",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "diseno-modular-interfaces-contratos-de-software-con-interfaces-vs-clases-abstractas": {
        "id": 638,
        "module_id": 226,
        "title": "Contratos de Software con Interfaces vs Clases Abstractas",
        "slug": "diseno-modular-interfaces-contratos-de-software-con-interfaces-vs-clases-abstractas",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Contratos de Software con Interfaces vs Clases Abstractas"
                },
                {
                    "type": "paragraph",
                    "text": "En la ingeniería de software profesional, acoplarse a clases concretas es la causa #1 de código frágil. Una interfaz define un contrato público inmutable que cualquier clase puede satisfacer."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "El Principio de Segregación de Interfaces (ISP)"
                },
                {
                    "type": "paragraph",
                    "text": "Como enseña Robert C. Martin en Clean Code: \"Ningún cliente debe ser forzado a depender de métodos que no utiliza\". Las interfaces deben ser pequeñas y enfocadas en una sola responsabilidad."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ejemplo Didáctico en Python"
                },
                {
                    "type": "code",
                    "language": "python",
                    "text": "from abc import ABC, abstractmethod\n\nclass Notificador(ABC):\n    @abstractmethod\n    def enviar(self, destinatario: str, mensaje: str) -> bool:\n        pass\n\nclass EmailNotificador(Notificador):\n    def enviar(self, destinatario: str, mensaje: str) -> bool:\n        print(f\"Enviando email a {destinatario}: {mensaje}\")\n        return True\n"
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Las interfaces definen el QUÉ, no el CÓMO",
                        "Facilitan enormemente la creación de dobles de prueba (Mocks)",
                        "Permiten intercambiar implementaciones sin romper el cliente"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 226,
            "title": "Módulo 1: Contratos y Desacoplamiento de Software",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "diseno-modular-interfaces-reto-practico-pasarela-de-pago-polimorfica": {
        "id": 639,
        "module_id": 226,
        "title": "Reto Práctico: Pasarela de Pago Polimórfica",
        "slug": "diseno-modular-interfaces-reto-practico-pasarela-de-pago-polimorfica",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Pasarela de Pago Polimórfica"
                },
                {
                    "type": "paragraph",
                    "text": "Tu misión es implementar una arquitectura de pagos desacoplada. Diseña la interfaz IPago y dos implementaciones (PagoTarjeta y PagoCrypto) que calculen la comisión correspondiente."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas del Reto"
                },
                {
                    "type": "list",
                    "items": [
                        "PagoTarjeta: cobra el monto + 3% de comisión",
                        "PagoCrypto: cobra el monto + $1.50 de tarifa fija de red",
                        "Ambas deben implementar el método procesar(monto: float) -> float retornando el total cobrado redondeado a 2 decimales."
                    ]
                }
            ]
        },
        "starter_code": "# === RETO DIDÁCTICO: PASARELA POLIMÓRFICA ===\nfrom abc import ABC, abstractmethod\n\nclass IPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> float:\n        pass\n\nclass PagoTarjeta(IPago):\n    def procesar(self, monto: float) -> float:\n        # TODO: Implementar (monto + 3%)\n        pass\n\nclass PagoCrypto(IPago):\n    def procesar(self, monto: float) -> float:\n        # TODO: Implementar (monto + 1.50)\n        pass\n",
        "solution": "from abc import ABC, abstractmethod\n\nclass IPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> float:\n        pass\n\nclass PagoTarjeta(IPago):\n    def procesar(self, monto: float) -> float:\n        return round(monto * 1.03, 2)\n\nclass PagoCrypto(IPago):\n    def procesar(self, monto: float) -> float:\n        return round(monto + 1.50, 2)\n",
        "test_cases": [
            {
                "input": "PagoTarjeta().procesar(100.0)",
                "expected": "103.0"
            },
            {
                "input": "PagoCrypto().procesar(100.0)",
                "expected": "101.5"
            }
        ],
        "hint": "Multiplica por 1.03 para el 3% adicional y suma 1.50 para la tarifa fija.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 226,
            "title": "Módulo 1: Contratos y Desacoplamiento de Software",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-constructores": {
        "id": 640,
        "module_id": 240,
        "title": "Inyección de Dependencias a través de Constructores",
        "slug": "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-constructores",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Inyección de Dependencias a través de Constructores"
                },
                {
                    "type": "paragraph",
                    "text": "No uses `new Servicio()` dentro de tus clases de negocio. Pasa las dependencias por parámetro en el constructor para mantener la clase pura y desacoplada del entorno exterior."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Por qué nunca instanciar directamente"
                },
                {
                    "type": "paragraph",
                    "text": "Cuando una clase hace `this.logger = new FileLogger()`, queda permanentemente amarrada al sistema de archivos local, impidiendo testearla en memoria o cambiar a un logger cloud."
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Favorece la inyección por constructor sobre la inyección por método o propiedad",
                        "Mantiene las clases abiertas a la extensión pero cerradas a la modificación (OCP)"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 240,
            "title": "Módulo 2: Inversión de Control e Inyección de Dependencias",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "diseno-modular-interfaces-reto-practico-servicio-de-facturacion-desacoplado": {
        "id": 641,
        "module_id": 240,
        "title": "Reto Práctico: Servicio de Facturación Desacoplado",
        "slug": "diseno-modular-interfaces-reto-practico-servicio-de-facturacion-desacoplado",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Facturador con Notificador Inyectado"
                },
                {
                    "type": "paragraph",
                    "text": "Construye la clase Facturador que reciba cualquier Notificador por constructor y emita el recibo formateado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requisitos"
                },
                {
                    "type": "list",
                    "items": [
                        "La clase Facturador recibe un notificador en __init__",
                        "El método emitir(cliente, total) debe llamar a notificador.notificar(cliente, total) y retornar el string de confirmación"
                    ]
                }
            ]
        },
        "starter_code": "class Facturador:\n    def __init__(self, notificador):\n        # TODO: guardar dependencia\n        pass\n\n    def emitir(self, cliente: str, total: float) -> str:\n        # TODO: delegar al notificador y retornar confirmacion\n        pass\n",
        "solution": "class Facturador:\n    def __init__(self, notificador):\n        self.notificador = notificador\n\n    def emitir(self, cliente: str, total: float) -> str:\n        return self.notificador.notificar(cliente, total)\n",
        "test_cases": [
            {
                "input": "class MockN: notificar = lambda s, c, t: f\"OK:{c}:{t}\"; Facturador(MockN()).emitir(\"Carlos\", 50.0)",
                "expected": "OK:Carlos:50.0"
            }
        ],
        "hint": "Guarda self.notificador y delega la llamada a self.notificador.notificar().",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 240,
            "title": "Módulo 2: Inversión de Control e Inyección de Dependencias",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "arquitectura-web-http-anatomia-de-una-peticion-http-y-metodos-idempotentes": {
        "id": 642,
        "module_id": 228,
        "title": "Anatomía de una Petición HTTP y Métodos Idempotentes",
        "slug": "arquitectura-web-http-anatomia-de-una-peticion-http-y-metodos-idempotentes",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Anatomía de una Petición HTTP y Métodos Idempotentes"
                },
                {
                    "type": "paragraph",
                    "text": "Una petición HTTP consta de línea de inicio (Método + URI + Versión), cabeceras clave-valor y cuerpo opcional. Comprender la idempotencia es vital para construir APIs robustas."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Idempotencia: La regla de oro"
                },
                {
                    "type": "paragraph",
                    "text": "Una operación es idempotente si ejecutarla N veces produce el mismo estado en el servidor que ejecutarla una sola vez. GET, PUT, DELETE son idempotentes; POST NO lo es."
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "GET nunca debe mutar estado en el servidor",
                        "PUT reemplaza por completo el recurso; PATCH actualiza parcialmente",
                        "POST se reserva para operaciones no idempotentes (creación)"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 228,
            "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "docker-compose-multiservicio-el-patron-multi-stage-build": {
        "id": 656,
        "module_id": 244,
        "title": "El Patrón Multi-stage Build",
        "slug": "docker-compose-multiservicio-el-patron-multi-stage-build",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Patrón Multi-stage Build"
                },
                {
                    "type": "paragraph",
                    "text": "En un solo Dockerfile puedes tener múltiples instrucciones `FROM`. La primera etapa instala compiladores y dependencias pesadas; la segunda etapa solo copia los artefactos finales (dist/) a una imagen alpine limpia."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ventajas de Seguridad y Despliegue"
                },
                {
                    "type": "list",
                    "items": [
                        "Imágenes finales de menos de 50MB en vez de 1.5GB",
                        "Cero herramientas de compilación o código fuente en producción",
                        "Menor superficie de ataque frente a vulnerabilidades CVE"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 244,
            "title": "Módulo 2: Optimización con Multi-stage Builds",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "arquitectura-web-http-reto-practico-parser-y-validador-de-headers-http": {
        "id": 643,
        "module_id": 228,
        "title": "Reto Práctico: Parser y Validador de Headers HTTP",
        "slug": "arquitectura-web-http-reto-practico-parser-y-validador-de-headers-http",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Extractor Seguro de Token Bearer"
                },
                {
                    "type": "paragraph",
                    "text": "En muchas APIs los clientes envían cabeceras mal formadas. Escribe una función pura `extraer_bearer_token(headers: dict) -> str | None` que valide que la cabecera Authorization exista y comience exactamente con \"Bearer \"."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requisitos"
                },
                {
                    "type": "list",
                    "items": [
                        "Si headers tiene \"Authorization\" o \"authorization\" con \"Bearer <token>\", retorna el token limpio sin espacios",
                        "Si no existe o no tiene el prefijo \"Bearer \", retorna None"
                    ]
                }
            ]
        },
        "starter_code": "def extraer_bearer_token(headers: dict) -> str | None:\n    # TODO: Implementar búsqueda case-insensitive y extracción del token\n    pass\n",
        "solution": "def extraer_bearer_token(headers: dict) -> str | None:\n    auth = None\n    for k, v in headers.items():\n        if k.lower() == 'authorization':\n            auth = v.strip()\n            break\n    if auth and auth.startswith('Bearer '):\n        token = auth[7:].strip()\n        return token if token else None\n    return None\n",
        "test_cases": [
            {
                "input": "extraer_bearer_token({\"Authorization\": \"Bearer token_xyz_123\"})",
                "expected": "token_xyz_123"
            },
            {
                "input": "extraer_bearer_token({\"authorization\": \"Basic user:pass\"})",
                "expected": "None"
            },
            {
                "input": "extraer_bearer_token({\"Content-Type\": \"application/json\"})",
                "expected": "None"
            }
        ],
        "hint": "Revisa headers.items() convirtiendo la clave a minúsculas y verifica que empiece con \"Bearer \".",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 228,
            "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "arquitectura-web-http-codigos-de-estado-2xx-4xx-y-5xx-en-la-practica": {
        "id": 644,
        "module_id": 241,
        "title": "Códigos de Estado: 2xx, 4xx y 5xx en la Práctica",
        "slug": "arquitectura-web-http-codigos-de-estado-2xx-4xx-y-5xx-en-la-practica",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Códigos de Estado Semánticos"
                },
                {
                    "type": "paragraph",
                    "text": "Nunca devuelvas HTTP 200 OK con un `{ \"error\": true }` en el cuerpo. Los clientes, proxies y gateways dependen del status code real para tomar decisiones de reintento y caché."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Los Códigos Fundamentales"
                },
                {
                    "type": "list",
                    "items": [
                        "200 OK: Solicitud completada exitosamente",
                        "201 Created: Nuevo recurso creado (incluir cabecera Location)",
                        "204 No Content: Éxito sin cuerpo de respuesta (ej: DELETE)",
                        "400 Bad Request: Sintaxis o parámetros inválidos",
                        "401 Unauthorized: Falta autenticación o token inválido",
                        "403 Forbidden: Autenticado pero sin permisos para este recurso",
                        "404 Not Found: El recurso solicitado no existe",
                        "422 Unprocessable Entity: Error de validación de reglas de negocio",
                        "500 Internal Server Error: Fallo inesperado en el servidor"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 241,
            "title": "Módulo 2: Códigos de Estado y Manejo Semántico de Errores",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "arquitectura-web-http-reto-practico-despachador-de-status-code-rest": {
        "id": 645,
        "module_id": 241,
        "title": "Reto Práctico: Despachador de Status Code REST",
        "slug": "arquitectura-web-http-reto-practico-despachador-de-status-code-rest",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Clasificador de Respuestas HTTP"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `determinar_status(accion: str, encontrado: bool, valido: bool) -> int` que retorne el código de estado HTTP correcto según la situación."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas"
                },
                {
                    "type": "list",
                    "items": [
                        "Si encontrado es False -> retorna 404",
                        "Si valido es False -> retorna 422",
                        "Si accion es \"crear\" -> retorna 201",
                        "Si accion es \"eliminar\" -> retorna 204",
                        "Cualquier otro caso exitoso -> retorna 200"
                    ]
                }
            ]
        },
        "starter_code": "def determinar_status(accion: str, encontrado: bool, valido: bool) -> int:\n    # TODO: implementar la logica semantica\n    pass\n",
        "solution": "def determinar_status(accion: str, encontrado: bool, valido: bool) -> int:\n    if not encontrado:\n        return 404\n    if not valido:\n        return 422\n    if accion == 'crear':\n        return 201\n    if accion == 'eliminar':\n        return 204\n    return 200\n",
        "test_cases": [
            {
                "input": "determinar_status(\"crear\", True, True)",
                "expected": "201"
            },
            {
                "input": "determinar_status(\"consultar\", False, True)",
                "expected": "404"
            },
            {
                "input": "determinar_status(\"actualizar\", True, False)",
                "expected": "422"
            },
            {
                "input": "determinar_status(\"eliminar\", True, True)",
                "expected": "204"
            }
        ],
        "hint": "Aplica las comprobaciones en orden: no encontrado (404), inválido (422), crear (201), eliminar (204).",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 241,
            "title": "Módulo 2: Códigos de Estado y Manejo Semántico de Errores",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "typescript-profesional-frontend-genericos-reutilizables-y-narrowing-de-tipos": {
        "id": 646,
        "module_id": 231,
        "title": "Genéricos Reutilizables y Narrowing de Tipos",
        "slug": "typescript-profesional-frontend-genericos-reutilizables-y-narrowing-de-tipos",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Genéricos Reutilizables en TypeScript"
                },
                {
                    "type": "paragraph",
                    "text": "Los genéricos permiten escribir componentes y funciones que funcionan con múltiples tipos sin perder la seguridad en tiempo de compilación. Son la base de los clientes HTTP modernos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Ejemplo de Wrapper de Respuesta"
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "interface ApiResponse<T> {\n  data: T;\n  status: number;\n  timestamp: string;\n}\n\nfunction envolver<T>(payload: T, status = 200): ApiResponse<T> {\n  return { data: payload, status, timestamp: new Date().toISOString() };\n}\n"
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "Evita usar `any`; prefiere `unknown` si el tipo es verdaderamente desconocido",
                        "Usa type guards (`is`) para verificar estructuras en tiempo de ejecución"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 231,
            "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "typescript-profesional-frontend-reto-practico-filtro-generico-fuertemente-tipado": {
        "id": 647,
        "module_id": 231,
        "title": "Reto Práctico: Filtro Genérico Fuertemente Tipado",
        "slug": "typescript-profesional-frontend-reto-practico-filtro-generico-fuertemente-tipado",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Función de Filtrado por Propiedad"
                },
                {
                    "type": "paragraph",
                    "text": "Crea una función genérica `filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[]` que filtre de forma segura colecciones de objetos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requisitos"
                },
                {
                    "type": "list",
                    "items": [
                        "La función debe retornar solo los elementos donde item[clave] === valor",
                        "No debe mutar el arreglo original"
                    ]
                }
            ]
        },
        "starter_code": "function filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[] {\n  // TODO: Implementar filtrado inmutable\n  return [];\n}\n",
        "solution": "function filtrarPorPropiedad<T>(items: T[], clave: keyof T, valor: any): T[] {\n  return items.filter(item => item[clave] === valor);\n}\n",
        "test_cases": [
            {
                "input": "JSON.stringify(filtrarPorPropiedad([{id:1,rol:\"admin\"},{id:2,rol:\"dev\"}], \"rol\", \"admin\"))",
                "expected": "[{\"id\":1,\"rol\":\"admin\"}]"
            }
        ],
        "hint": "Usa el método items.filter() comparando item[clave] === valor.",
        "language": "typescript",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 231,
            "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "typescript-profesional-frontend-uniones-discriminadas-para-estados-de-interfaz": {
        "id": 648,
        "module_id": 242,
        "title": "Uniones Discriminadas para Estados de Interfaz",
        "slug": "typescript-profesional-frontend-uniones-discriminadas-para-estados-de-interfaz",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Hacer Estados Imposibles Irrepresentables"
                },
                {
                    "type": "paragraph",
                    "text": "En lugar de tener `{ loading: boolean, error: string | null, data: T | null }`, una unión discriminada define explícitamente cada estado válido con una propiedad tag común."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Modelado Elegante"
                },
                {
                    "type": "code",
                    "language": "typescript",
                    "text": "type AsyncState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; message: string };\n"
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "TypeScript infiere automáticamente las propiedades dentro de cada bloque switch/case",
                        "Elimina flags booleanos redundantes"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 242,
            "title": "Módulo 2: Uniones Discriminadas y Pattern Matching",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "typescript-profesional-frontend-reto-practico-reductor-de-estado-con-union-discriminada": {
        "id": 649,
        "module_id": 242,
        "title": "Reto Práctico: Reductor de Estado con Unión Discriminada",
        "slug": "typescript-profesional-frontend-reto-practico-reductor-de-estado-con-union-discriminada",
        "type": "code_challenge",
        "duration_minutes": 22,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Extractor de Mensaje de Estado"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string` que formatee el mensaje según el estado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Comportamiento"
                },
                {
                    "type": "list",
                    "items": [
                        "Si status === \"cargando\" -> \"Cargando recursos...\"",
                        "Si status === \"exito\" -> `Datos recibidos: ${estado.data}`",
                        "Si status === \"error\" -> `Error crítico: ${estado.error}`",
                        "Cualquier otro -> \"Estado desconocido\""
                    ]
                }
            ]
        },
        "starter_code": "function obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string {\n  // TODO: implementar pattern matching\n  return '';\n}\n",
        "solution": "function obtenerMensajeEstado(estado: { status: string; data?: any; error?: string }): string {\n  switch (estado.status) {\n    case 'cargando': return 'Cargando recursos...';\n    case 'exito': return `Datos recibidos: \\${estado.data}`;\n    case 'error': return `Error crítico: \\${estado.error}`;\n    default: return 'Estado desconocido';\n  }\n}\n",
        "test_cases": [
            {
                "input": "obtenerMensajeEstado({status: \"cargando\"})",
                "expected": "Cargando recursos..."
            },
            {
                "input": "obtenerMensajeEstado({status: \"exito\", data: 42})",
                "expected": "Datos recibidos: 42"
            },
            {
                "input": "obtenerMensajeEstado({status: \"error\", error: \"404\"})",
                "expected": "Error crítico: 404"
            }
        ],
        "hint": "Usa una sentencia switch evaluando estado.status.",
        "language": "typescript",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 242,
            "title": "Módulo 2: Uniones Discriminadas y Pattern Matching",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-que-es-un-embedding-y-estrategias-de-chunking": {
        "id": 650,
        "module_id": 235,
        "title": "Qué es un Embedding y Estrategias de Chunking",
        "slug": "rag-embeddings-bases-vectoriales-que-es-un-embedding-y-estrategias-de-chunking",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Qué es un Embedding y Estrategias de Chunking"
                },
                {
                    "type": "paragraph",
                    "text": "Los modelos de lenguaje no leen palabras como los humanos; las procesan como vectores en un espacio multidimensional donde conceptos semánticamente afines quedan cerca entre sí."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Chunking Inteligente"
                },
                {
                    "type": "paragraph",
                    "text": "Dividir un libro o documentación técnica por párrafos o tokens con un porcentaje de solapamiento (overlap del 10-15%) evita que una idea quede truncada entre dos fragmentos."
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "El tamaño del chunk afecta la precisión: chunks muy grandes diluyen la semántica",
                        "El solapamiento mantiene el hilo conductor"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 235,
            "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-reto-practico-algoritmo-de-chunking-con-solapamiento": {
        "id": 651,
        "module_id": 235,
        "title": "Reto Práctico: Algoritmo de Chunking con Solapamiento",
        "slug": "rag-embeddings-bases-vectoriales-reto-practico-algoritmo-de-chunking-con-solapamiento",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Segmentador de Documentos RAG"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]` que divida un texto en palabras con el solapamiento especificado."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Requisitos"
                },
                {
                    "type": "list",
                    "items": [
                        "Divide el texto en palabras separadas por espacios",
                        "Cada chunk debe contener hasta `tamano` palabras",
                        "El siguiente chunk comienza `tamano - solapamiento` palabras después del inicio del anterior",
                        "Retorna la lista de chunks como cadenas unidas por espacios"
                    ]
                }
            ]
        },
        "starter_code": "def chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]:\n    # TODO: implementar segmentacion con overlap\n    pass\n",
        "solution": "def chunk_texto(texto: str, tamano: int, solapamiento: int) -> list[str]:\n    palabras = texto.split()\n    if not palabras:\n        return []\n    paso = max(1, tamano - solapamiento)\n    chunks = []\n    for i in range(0, len(palabras), paso):\n        fragmento = palabras[i:i + tamano]\n        chunks.append(' '.join(fragmento))\n        if i + tamano >= len(palabras):\n            break\n    return chunks\n",
        "test_cases": [
            {
                "input": "chunk_texto(\"uno dos tres cuatro cinco seis siete\", 4, 1)",
                "expected": "['uno dos tres cuatro', 'cuatro cinco seis siete']"
            }
        ],
        "hint": "Calcula el paso como tamano - solapamiento y usa rebanadas de lista palabras[i:i+tamano].",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 235,
            "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-similitud-coseno-vs-distancia-euclidiana": {
        "id": 652,
        "module_id": 243,
        "title": "Similitud Coseno vs Distancia Euclidiana",
        "slug": "rag-embeddings-bases-vectoriales-similitud-coseno-vs-distancia-euclidiana",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Similitud Coseno en Espacios Vectoriales"
                },
                {
                    "type": "paragraph",
                    "text": "La similitud coseno mide el ángulo entre dos vectores normalizados, ignorando su magnitud. Es la métrica estándar en búsqueda semántica de documentos técnicos."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Fórmula Matemática"
                },
                {
                    "type": "paragraph",
                    "text": "cos(θ) = (A · B) / (||A|| * ||B||). Un valor de 1.0 significa significado idéntico; 0.0 significa ortogonalidad/sin relación."
                },
                {
                    "type": "heading",
                    "level": 3,
                    "text": "Puntos Clave y Buenas Prácticas"
                },
                {
                    "type": "list",
                    "items": [
                        "La similitud coseno es invariante a la longitud del vector",
                        "Permite encontrar sinónimos y conceptos afines sin coincidencias exactas de palabras"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 243,
            "title": "Módulo 2: Búsqueda Semántica con Similitud Coseno",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-reto-practico-buscador-semantico-top-k": {
        "id": 653,
        "module_id": 243,
        "title": "Reto Práctico: Buscador Semántico Top-K",
        "slug": "rag-embeddings-bases-vectoriales-reto-practico-buscador-semantico-top-k",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Recuperador Top-1 por Similitud Coseno"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str` que calcule el producto punto (asumiendo vectores ya normalizados) y retorne el texto del documento más afín."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Estructura de documentos"
                },
                {
                    "type": "paragraph",
                    "text": "Cada documento es un dict: `{\"texto\": str, \"vector\": list[float]}`. Retorna el texto con el mayor producto punto."
                }
            ]
        },
        "starter_code": "def buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str:\n    # TODO: calcular producto punto suma(a * b) y encontrar el mejor\n    pass\n",
        "solution": "def buscar_mas_similar(vector_consulta: list[float], documentos: list[dict]) -> str:\n    mejor_score = -float('inf')\n    mejor_texto = ''\n    for doc in documentos:\n        score = sum(a * b for a, b in zip(vector_consulta, doc['vector']))\n        if score > mejor_score:\n            mejor_score = score\n            mejor_texto = doc['texto']\n    return mejor_texto\n",
        "test_cases": [
            {
                "input": "buscar_mas_similar([1.0, 0.0], [{\"texto\": \"Doc A\", \"vector\": [0.2, 0.9]}, {\"texto\": \"Doc B\", \"vector\": [0.95, 0.1]}])",
                "expected": "Doc B"
            }
        ],
        "hint": "Usa sum(a * b for a, b in zip(vector_consulta, doc[\"vector\"])) para el producto punto.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 243,
            "title": "Módulo 2: Búsqueda Semántica con Similitud Coseno",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "docker-compose-multiservicio-estructura-limpia-de-un-archivo-compose": {
        "id": 654,
        "module_id": 234,
        "title": "Estructura Limpia de un Archivo Compose",
        "slug": "docker-compose-multiservicio-estructura-limpia-de-un-archivo-compose",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Estructura Limpia de Compose"
                },
                {
                    "type": "paragraph",
                    "text": "Un compose.yaml profesional no expone puertos innecesarios al host. Usa redes bridge privadas para que los contenedores se comuniquen por nombre de servicio (DNS interno de Docker)."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Reglas de Producción"
                },
                {
                    "type": "list",
                    "items": [
                        "Nunca hardcodear contraseñas en compose.yaml; usar archivos .env",
                        "Usar volúmenes nombrados para persistencia de bases de datos",
                        "Definir healthchecks en la BD antes de levantar el backend"
                    ]
                }
            ]
        },
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 234,
            "title": "Módulo 1: Orquestación Local y Redes Aisladas",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "docker-compose-multiservicio-reto-practico-estimador-de-ahorro-multi-stage": {
        "id": 657,
        "module_id": 244,
        "title": "Reto Práctico: Estimador de Ahorro Multi-stage",
        "slug": "docker-compose-multiservicio-reto-practico-estimador-de-ahorro-multi-stage",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": {
            "type": "doc",
            "blocks": [
                {
                    "type": "heading",
                    "level": 1,
                    "text": "Reto: Calculadora de Reducción de Tamaño"
                },
                {
                    "type": "paragraph",
                    "text": "Escribe una función `calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str` que calcule el porcentaje de reducción redondeado a 1 decimal."
                },
                {
                    "type": "heading",
                    "level": 2,
                    "text": "Fórmula y Formato"
                },
                {
                    "type": "paragraph",
                    "text": "Reducción = ((dev - prod) / dev) * 100. Formato retornado: \"Reducción del X.X%\""
                }
            ]
        },
        "starter_code": "def calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str:\n    # TODO: calcular porcentaje y formatear\n    pass\n",
        "solution": "def calcular_ahorro_imagen(tamano_dev_mb: float, tamano_prod_mb: float) -> str:\n    porcentaje = ((tamano_dev_mb - tamano_prod_mb) / tamano_dev_mb) * 100\n    return f\"Reducción del {round(porcentaje, 1)}%\"\n",
        "test_cases": [
            {
                "input": "calcular_ahorro_imagen(1200.0, 60.0)",
                "expected": "Reducción del 95.0%"
            },
            {
                "input": "calcular_ahorro_imagen(500.0, 100.0)",
                "expected": "Reducción del 80.0%"
            }
        ],
        "hint": "Aplica la fórmula ((dev - prod) / dev) * 100 y usa round(porcentaje, 1).",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 244,
            "title": "Módulo 2: Optimización con Multi-stage Builds",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "backend-introduccion-reto-validador-http": {
        "id": 667,
        "module_id": 5,
        "title": "Reto Práctico: Validador de Métodos y Verbos HTTP",
        "slug": "backend-introduccion-reto-validador-http",
        "type": "code_challenge",
        "duration_minutes": 15,
        "order": 4,
        "is_preview": false,
        "content": "### Reto: Validación de Solicitudes HTTP en el Servidor\n\nEn todo servidor backend, la primera línea de defensa antes de procesar una petición es comprobar que el método HTTP recibido sea compatible con la ruta solicitada.\n\n#### Especificación del Reto\n\nEscribe una función `es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool` que valide si un verbo HTTP es aceptado. Debe ser insensible a mayúsculas/minúsculas y descartar espacios en blanco.\n\n#### Reglas\n\n- Convierte el método recibido a mayúsculas limpias sin espacios.\n- Compara contra la lista de métodos permitidos (también normalizados en mayúsculas).\n- Retorna True si es válido, False de lo contrario.\n\n",
        "starter_code": "def es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool:\n    # TODO: implementar validacion normalizada\n    pass\n",
        "solution": "def es_metodo_permitido(metodo: str, metodos_permitidos: list[str]) -> bool:\n    m = metodo.strip().upper()\n    permitidos = [p.strip().upper() for p in metodos_permitidos]\n    return m in permitidos\n",
        "test_cases": [
            {
                "input": "es_metodo_permitido(\"get\", [\"GET\", \"POST\"])",
                "expected": "True"
            },
            {
                "input": "es_metodo_permitido(\"DELETE\", [\"GET\", \"POST\"])",
                "expected": "False"
            },
            {
                "input": "es_metodo_permitido(\" post \", [\"GET\", \"POST\"])",
                "expected": "True"
            }
        ],
        "hint": "Usa metodo.strip().upper() y comprueba pertenencia con el operador `in`.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 5,
            "title": "El Mundo del Backend",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "backend-introduccion-reto-enrutador-basico": {
        "id": 668,
        "module_id": 197,
        "title": "Reto Práctico: Despachador de Rutas REST",
        "slug": "backend-introduccion-reto-enrutador-basico",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 4,
        "is_preview": false,
        "content": "### Reto: Enrutador Básico de Peticiones\n\nLos frameworks web como Laravel, Express o FastAPI utilizan una tabla de rutas para dirigir las peticiones al controlador adecuado.\n\n#### Objetivo\n\nEscribe una función `resolver_ruta(rutas: dict, metodo: str, path: str) -> str` que busque en un diccionario `{ \"METODO PATH\": \"Controlador@metodo\" }` y retorne el controlador correspondiente o `\"404 Not Found\"`.\n\n",
        "starter_code": "def resolver_ruta(rutas: dict, metodo: str, path: str) -> str:\n    # TODO: buscar la clave \"{metodo.upper()} {path}\" en rutas\n    pass\n",
        "solution": "def resolver_ruta(rutas: dict, metodo: str, path: str) -> str:\n    clave = f\"{metodo.strip().upper()} {path.strip()}\"\n    return rutas.get(clave, \"404 Not Found\")\n",
        "test_cases": [
            {
                "input": "resolver_ruta({\"GET /usuarios\": \"UserController@index\"}, \"GET\", \"/usuarios\")",
                "expected": "UserController@index"
            },
            {
                "input": "resolver_ruta({\"POST /login\": \"AuthController@login\"}, \"POST\", \"/login\")",
                "expected": "AuthController@login"
            },
            {
                "input": "resolver_ruta({\"GET /items\": \"ItemController@all\"}, \"DELETE\", \"/items\")",
                "expected": "404 Not Found"
            }
        ],
        "hint": "Construye la clave f\"{metodo.strip().upper()} {path.strip()}\" y usa rutas.get(clave, \"404 Not Found\").",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 197,
            "title": "Servidores y APIs",
            "course_id": 5,
            "course_slug": "backend-introduccion",
            "course_title": "Introducción al Backend",
            "course": {
                "id": 5,
                "slug": "backend-introduccion",
                "title": "Introducción al Backend"
            }
        }
    },
    "modelos-relaciones-reto-filtrado-relacional": {
        "id": 669,
        "module_id": 8,
        "title": "Reto Práctico: Simulación de Eager Loading y Filtrado Relacional",
        "slug": "modelos-relaciones-reto-filtrado-relacional",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 4,
        "is_preview": false,
        "content": "### Reto: Evitar el Problema N+1 en Memoria\n\nEl problema N+1 ocurre cuando consultamos N registros y luego ejecutamos N consultas adicionales para traer sus relaciones.\n\n#### Misión\n\nDada una lista de usuarios y una lista de posts con clave `usuario_id`, escribe `unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]` que agrupe todos los posts en un campo `posts` en cada usuario en tiempo lineal O(N+M) usando un mapa auxiliar.\n\n",
        "starter_code": "def unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]:\n    # TODO: agrupar posts por usuario_id y asignarlos a cada usuario\n    pass\n",
        "solution": "def unir_usuarios_con_posts(usuarios: list[dict], posts: list[dict]) -> list[dict]:\n    mapa_posts = {}\n    for p in posts:\n        uid = p.get('usuario_id')\n        if uid not in mapa_posts:\n            mapa_posts[uid] = []\n        mapa_posts[uid].append(p['titulo'])\n    \n    resultado = []\n    for u in usuarios:\n        nuevo_u = dict(u)\n        nuevo_u['posts'] = mapa_posts.get(u['id'], [])\n        resultado.append(nuevo_u)\n    return resultado\n",
        "test_cases": [
            {
                "input": "unir_usuarios_con_posts([{\"id\": 1, \"nombre\": \"Ana\"}], [{\"usuario_id\": 1, \"titulo\": \"Post 1\"}, {\"usuario_id\": 1, \"titulo\": \"Post 2\"}])",
                "expected": "[{\"id\": 1, \"nombre\": \"Ana\", \"posts\": [\"Post 1\", \"Post 2\"]}]"
            }
        ],
        "hint": "Crea un diccionario donde la clave sea usuario_id y el valor sea la lista de títulos de posts.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 8,
            "title": "Eloquent y el Modelo de Datos",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "modelos-relaciones-reto-calculo-agregaciones": {
        "id": 670,
        "module_id": 198,
        "title": "Reto Práctico: Agregaciones Puras y Reducción de Totales",
        "slug": "modelos-relaciones-reto-calculo-agregaciones",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 4,
        "is_preview": false,
        "content": "### Reto: Agregaciones y Métricas de Facturación\n\nEn bases de datos relacionales calculamos SUM, AVG y COUNT. En la capa de servicios a veces necesitamos realizar estas agregaciones de manera pura.\n\n#### Objetivo\n\nEscribe una función `calcular_resumen_ventas(pedidos: list[dict]) -> dict` que retorne `{\"total\": float, \"promedio\": float, \"cantidad\": int}`. Si la lista está vacía, retorna total 0.0, promedio 0.0 y cantidad 0.\n\n",
        "starter_code": "def calcular_resumen_ventas(pedidos: list[dict]) -> dict:\n    # TODO: calcular metricas\n    pass\n",
        "solution": "def calcular_resumen_ventas(pedidos: list[dict]) -> dict:\n    if not pedidos:\n        return {'total': 0.0, 'promedio': 0.0, 'cantidad': 0}\n    cant = len(pedidos)\n    total = sum(p['monto'] for p in pedidos)\n    return {'total': round(total, 2), 'promedio': round(total / cant, 2), 'cantidad': cant}\n",
        "test_cases": [
            {
                "input": "calcular_resumen_ventas([{\"monto\": 100.0}, {\"monto\": 200.0}])",
                "expected": "{\"total\": 300.0, \"promedio\": 150.0, \"cantidad\": 2}"
            },
            {
                "input": "calcular_resumen_ventas([])",
                "expected": "{\"total\": 0.0, \"promedio\": 0.0, \"cantidad\": 0}"
            }
        ],
        "hint": "Calcula sum() de montos y divide entre len() para el promedio cuando len > 0.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 198,
            "title": "Consultas Avanzadas",
            "course_id": 7,
            "course_slug": "modelos-relaciones-y-consultas",
            "course_title": "Modelos, Relaciones y Consultas",
            "course": {
                "id": 7,
                "slug": "modelos-relaciones-y-consultas",
                "title": "Modelos, Relaciones y Consultas"
            }
        }
    },
    "arquitectura-proyecto-poo-patron-decorator": {
        "id": 671,
        "module_id": 248,
        "title": "El Patrón Decorator y Principio Abierto/Cerrado (OCP)",
        "slug": "arquitectura-proyecto-poo-patron-decorator",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": "### Patrón Decorator en Sistemas Reales\n\nEl patrón Decorator permite añadir responsabilidades adicionales a un objeto de forma dinámica sin recurrir a la herencia masiva.\n\n#### Cita de The Pragmatic Programmer\n\n\"Diseña código que sea fácil de cambiar (ETC: Easier To Change). La composición vence a la herencia cuando los requerimientos evolucionan rápidamente.\"\n\n#### Casos de Uso Típicos\n\n- Logging transparente en servicios de negocio\n- Mecanismos de caché en repositorios de datos\n- Encriptación y firma de mensajes al vuelo\n\n",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 248,
            "title": "Módulo 2: Patrones GoF y Refactorización Limpia",
            "course_id": 101,
            "course_slug": "arquitectura-proyecto-poo",
            "course_title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
            "course": {
                "id": 101,
                "slug": "arquitectura-proyecto-poo",
                "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos"
            }
        }
    },
    "arquitectura-proyecto-poo-reto-patron-decorator": {
        "id": 672,
        "module_id": 248,
        "title": "Reto Práctico: Implementación del Patrón Decorator de Logging",
        "slug": "arquitectura-proyecto-poo-reto-patron-decorator",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": "### Reto: Decorator para Servicios de Mensajería\n\nImplementa una clase `NotificadorConLog` que envuelva a cualquier objeto con método `enviar(msg: str) -> str` y agregue el prefijo `[LOG] ` antes de llamar al método interno.\n\n#### Comportamiento esperado\n\n`NotificadorConLog(servicio).enviar(\"hola\")` debe retornar `\"[LOG] \" + servicio.enviar(\"hola\")`\n\n",
        "starter_code": "class NotificadorConLog:\n    def __init__(self, decorado):\n        # TODO: guardar referencia\n        pass\n    def enviar(self, msg: str) -> str:\n        # TODO: envolver llamada agregando [LOG] \n        pass\n",
        "solution": "class NotificadorConLog:\n    def __init__(self, decorado):\n        self.decorado = decorado\n    def enviar(self, msg: str) -> str:\n        return f\"[LOG] {self.decorado.enviar(msg)}\"\n",
        "test_cases": [
            {
                "input": "class MockS: enviar = lambda s, m: f\"SMS: {m}\"; NotificadorConLog(MockS()).enviar(\"Alerta\")",
                "expected": "[LOG] SMS: Alerta"
            }
        ],
        "hint": "Guarda self.decorado = decorado y en enviar retorna f\"[LOG] {self.decorado.enviar(msg)}\".",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 248,
            "title": "Módulo 2: Patrones GoF y Refactorización Limpia",
            "course_id": 101,
            "course_slug": "arquitectura-proyecto-poo",
            "course_title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
            "course": {
                "id": 101,
                "slug": "arquitectura-proyecto-poo",
                "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos"
            }
        }
    },
    "diseno-apis-restful-estandar-rfc-7807": {
        "id": 673,
        "module_id": 249,
        "title": "El Estándar RFC 7807: Problem Details",
        "slug": "diseno-apis-restful-estandar-rfc-7807",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": false,
        "content": "### Problem Details for HTTP APIs (RFC 7807)\n\nEn lugar de formatos de error inventados en cada proyecto, la IETF formalizó RFC 7807 con campos estándar: `type`, `title`, `status`, `detail`, `instance`.\n\n#### Beneficios\n\n- Clientes frontend y móviles pueden deserializar errores de manera universal\n- Códigos HTTP semánticos alineados con el cuerpo de error\n- Facilidad para debugging en logs de producción\n\n",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 249,
            "title": "Módulo 2: Manejo de Errores RFC 7807 y Contratos OpenAPI",
            "course_id": 103,
            "course_slug": "diseno-apis-restful",
            "course_title": "Diseño y Versionado de APIs RESTful",
            "course": {
                "id": 103,
                "slug": "diseno-apis-restful",
                "title": "Diseño y Versionado de APIs RESTful"
            }
        }
    },
    "diseno-apis-restful-reto-rfc-7807": {
        "id": 674,
        "module_id": 249,
        "title": "Reto Práctico: Generador de Respuestas de Error RFC 7807",
        "slug": "diseno-apis-restful-reto-rfc-7807",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "### Reto: Serializador de Error Estándar\n\nEscribe una función `crear_error_rfc7807(status: int, title: str, detail: str) -> dict` que retorne el diccionario formateado exactamente según RFC 7807 con `type: \"about:blank\"`.\n\n#### Campos requeridos\n\n- type: \"about:blank\"\n- title: string\n- status: int\n- detail: string\n\n",
        "starter_code": "def crear_error_rfc7807(status: int, title: str, detail: str) -> dict:\n    # TODO: retornar dict rfc7807\n    pass\n",
        "solution": "def crear_error_rfc7807(status: int, title: str, detail: str) -> dict:\n    return {\n        'type': 'about:blank',\n        'title': title,\n        'status': status,\n        'detail': detail\n    }\n",
        "test_cases": [
            {
                "input": "crear_error_rfc7807(404, \"Recurso no encontrado\", \"El usuario con ID 99 no existe.\")",
                "expected": "{\"type\": \"about:blank\", \"title\": \"Recurso no encontrado\", \"status\": 404, \"detail\": \"El usuario con ID 99 no existe.\"}"
            }
        ],
        "hint": "Crea un dict con type \"about:blank\", title, status y detail.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 249,
            "title": "Módulo 2: Manejo de Errores RFC 7807 y Contratos OpenAPI",
            "course_id": 103,
            "course_slug": "diseno-apis-restful",
            "course_title": "Diseño y Versionado de APIs RESTful",
            "course": {
                "id": 103,
                "slug": "diseno-apis-restful",
                "title": "Diseño y Versionado de APIs RESTful"
            }
        }
    },
    "css-moderno-flexbox-grid-diseno-fluido-clamp": {
        "id": 675,
        "module_id": 250,
        "title": "Tipografía y Espaciado Fluido con clamp()",
        "slug": "css-moderno-flexbox-grid-diseno-fluido-clamp",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": false,
        "content": "### Diseño Fluido sin Media Queries Excesivas\n\nLa función `clamp(MIN, VALOR_IDEAL, MAX)` permite que los tamaños de fuente y espaciados escalen suavemente según el viewport sin necesidad de decenas de breakpoints.\n\n#### Sintaxis\n\n```css\nfont-size: clamp(1rem, 2.5vw + 0.5rem, 2.5rem);\n```\n\n#### Ventajas de Rendimiento\n\n- Menor tamaño de CSS final\n- Transición continua entre dispositivos móviles y pantallas ultrawide\n- Mantenimiento centralizado en tokens\n\n",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 250,
            "title": "Módulo 2: Diseño Fluido y Sistemas de Espaciado con Variables CSS",
            "course_id": 104,
            "course_slug": "css-moderno-flexbox-grid",
            "course_title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
            "course": {
                "id": 104,
                "slug": "css-moderno-flexbox-grid",
                "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design"
            }
        }
    },
    "css-moderno-flexbox-grid-reto-generador-grid": {
        "id": 676,
        "module_id": 250,
        "title": "Reto Práctico: Generador de Propiedad CSS Grid Auto-fit",
        "slug": "css-moderno-flexbox-grid-reto-generador-grid",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "### Reto: Calculadora de Grid Responsivo sin Breakpoints\n\nEscribe una función `generarTemplateGrid(minAnchoPx: number): string` que retorne la propiedad CSS `repeat(auto-fit, minmax(${minAnchoPx}px, 1fr))`.\n\n#### Ejemplo\n\n`generarTemplateGrid(280)` retorna `\"repeat(auto-fit, minmax(280px, 1fr))\"`\n\n",
        "starter_code": "function generarTemplateGrid(minAnchoPx: number): string {\n  // TODO: retornar el template string\n  return '';\n}\n",
        "solution": "function generarTemplateGrid(minAnchoPx: number): string {\n  return `repeat(auto-fit, minmax(${minAnchoPx}px, 1fr))`;\n}\n",
        "test_cases": [
            {
                "input": "generarTemplateGrid(280)",
                "expected": "repeat(auto-fit, minmax(280px, 1fr))"
            },
            {
                "input": "generarTemplateGrid(320)",
                "expected": "repeat(auto-fit, minmax(320px, 1fr))"
            }
        ],
        "hint": "Usa un template literal de JS/TS: `repeat(auto-fit, minmax(${minAnchoPx}px, 1fr))`",
        "language": "typescript",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 250,
            "title": "Módulo 2: Diseño Fluido y Sistemas de Espaciado con Variables CSS",
            "course_id": 104,
            "course_slug": "css-moderno-flexbox-grid",
            "course_title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
            "course": {
                "id": 104,
                "slug": "css-moderno-flexbox-grid",
                "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design"
            }
        }
    },
    "especificacion-srs-diagramas-bdd-gherkin": {
        "id": 677,
        "module_id": 251,
        "title": "Sintaxis Gherkin: El Puente entre Negocio e Ingeniería",
        "slug": "especificacion-srs-diagramas-bdd-gherkin",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": false,
        "content": "### Especificación por Ejemplo y BDD\n\nComo explican Martin Fowler y Dan North en Behavior-Driven Development, los requerimientos escritos en lenguaje natural ambiguo son la causa número uno de bugs en software.\n\n#### La Estructura Gherkin\n\n- Dado (Given): El contexto inicial del sistema y sus precondiciones\n- Cuando (When): La acción ejecutada por el usuario o evento desencadenante\n- Entonces (Then): El resultado observable esperado\n\n",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 251,
            "title": "Módulo 2: Criterios de Aceptación con BDD y Gherkin",
            "course_id": 109,
            "course_slug": "especificacion-srs-diagramas",
            "course_title": "Especificación Formal (SRS) y Casos de Uso",
            "course": {
                "id": 109,
                "slug": "especificacion-srs-diagramas",
                "title": "Especificación Formal (SRS) y Casos de Uso"
            }
        }
    },
    "especificacion-srs-diagramas-reto-parser-bdd": {
        "id": 678,
        "module_id": 251,
        "title": "Reto Práctico: Validador de Estructura de Escenarios BDD",
        "slug": "especificacion-srs-diagramas-reto-parser-bdd",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": "### Reto: Validador de Criterios de Aceptación\n\nEscribe una función `es_escenario_bdd_valido(lineas: list[str]) -> bool` que verifique que el escenario contenga al menos una cláusula con \"dado\", al menos una con \"cuando\" y al menos una con \"entonces\" (insensible a mayúsculas).\n\n#### Criterio\n\nRetorna True solo si las 3 palabras clave están presentes en el conjunto de líneas.\n\n",
        "starter_code": "def es_escenario_bdd_valido(lineas: list[str]) -> bool:\n    # TODO: verificar presencia de \"dado\", \"cuando\", \"entonces\"\n    pass\n",
        "solution": "def es_escenario_bdd_valido(lineas: list[str]) -> bool:\n    texto = ' '.join(lineas).lower()\n    tiene_dado = 'dado' in texto or 'given' in texto\n    tiene_cuando = 'cuando' in texto or 'when' in texto\n    tiene_entonces = 'entonces' in texto or 'then' in texto\n    return tiene_dado and tiene_cuando and tiene_entonces\n",
        "test_cases": [
            {
                "input": "es_escenario_bdd_valido([\"Dado un usuario autenticado\", \"Cuando hace clic en pagar\", \"Entonces se emite factura\"])",
                "expected": "True"
            },
            {
                "input": "es_escenario_bdd_valido([\"Cuando hace clic en pagar\", \"Entonces se emite factura\"])",
                "expected": "False"
            }
        ],
        "hint": "Une las líneas en un solo string en minúsculas y verifica que \"dado\" (o \"given\"), \"cuando\" (o \"when\") y \"entonces\" (o \"then\") estén presentes.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 251,
            "title": "Módulo 2: Criterios de Aceptación con BDD y Gherkin",
            "course_id": 109,
            "course_slug": "especificacion-srs-diagramas",
            "course_title": "Especificación Formal (SRS) y Casos de Uso",
            "course": {
                "id": 109,
                "slug": "especificacion-srs-diagramas",
                "title": "Especificación Formal (SRS) y Casos de Uso"
            }
        }
    },
    "logica-pensamiento-computacional-que-es-un-algoritmo-y-propiedades-de-una-solucion": {
        "id": 579,
        "module_id": 220,
        "title": "Qué es un algoritmo y propiedades de una solución",
        "slug": "logica-pensamiento-computacional-que-es-un-algoritmo-y-propiedades-de-una-solucion",
        "type": "article",
        "duration_minutes": 12,
        "order": 1,
        "is_preview": true,
        "content": "## ¿Qué es un Algoritmo?\n\nUn algoritmo es una secuencia finita, ordenada y no ambigua de pasos e instrucciones que resuelven un problema o ejecutan una tarea computacional.\n\n```\nEntrada (Input) ──> [ Procesamiento Algorítmico ] ──> Salida (Output)\n```\n\n### Propiedades Fundamentales de todo Algoritmo\n1. **Finitud:** Debe terminar después de un número finito de pasos. Un bucle infinito no es un algoritmo válido.\n2. **Definición y Precisión:** Cada paso debe estar definido sin ambigüedades. Las operaciones deben ser exactas.\n3. **Entrada definida:** Cero o más datos proporcionados al inicio.\n4. **Salida comprobable:** Uno o más resultados directamente relacionados con las entradas.\n5. **Efectividad:** Cada instrucción debe ser lo suficientemente básica para que una computadora pueda ejecutarla en un tiempo finito.\n\n> **Regla de oro de ingeniería:** Antes de escribir una sola línea de código, debes ser capaz de explicar la solución paso a paso en lenguaje natural (pseudocódigo). Si no puedes explicarlo paso a paso, no puedes programarlo.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 220,
            "title": "Fundamentos del Pensamiento Lógico",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "logica-pensamiento-computacional-diagramas-de-flujo-y-representacion-grafica-de-decisiones": {
        "id": 580,
        "module_id": 220,
        "title": "Diagramas de flujo y representación gráfica de decisiones",
        "slug": "logica-pensamiento-computacional-diagramas-de-flujo-y-representacion-grafica-de-decisiones",
        "type": "article",
        "duration_minutes": 15,
        "order": 2,
        "is_preview": false,
        "content": "## Diagramas de Flujo y Representación Gráfica\n\nLos diagramas de flujo permiten visualizar la arquitectura lógica de un algoritmo antes de codificarlo, identificando bifurcaciones complejas y bucles redundantes.\n\n### Simbología Estándar (ISO 5807)\n* **Óvalo / Rectángulo redondeado:** Inicio o Fin del algoritmo.\n* **Rectángulo:** Proceso u operación (asignación, cálculo matemático).\n* **Rombo:** Decisión condicional (pregunta lógica que bifurca en ramas *Sí* o *No*).\n* **Paralelogramo:** Entrada o Salida de datos (lectura de teclado o impresión en pantalla).\n* **Líneas de flujo:** Flechas que indican el orden estricto de ejecución.\n\n### Buenas Prácticas al Diseñar Flujos\n1. Todo flujo debe iniciar arriba o a la izquierda y fluir hacia abajo o a la derecha.\n2. Cada rombo de decisión debe tener etiquetadas claramente sus salidas (`True` / `False`).\n3. Evita cruce de líneas; usa conectores circulares si la lógica se ramifica demasiado.\n4. Mantén los bloques con una única responsabilidad clara.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 220,
            "title": "Fundamentos del Pensamiento Lógico",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "logica-pensamiento-computacional-operadores-booleanos-y-tablas-de-verdad": {
        "id": 581,
        "module_id": 220,
        "title": "Operadores booleanos y tablas de verdad",
        "slug": "logica-pensamiento-computacional-operadores-booleanos-y-tablas-de-verdad",
        "type": "code_challenge",
        "duration_minutes": 18,
        "order": 3,
        "is_preview": false,
        "content": "## Operadores Booleanos y Tablas de Verdad\n\nLa lógica computacional se fundamenta en el álgebra de Boole: evaluar proposiciones que solo pueden ser `True` (Verdadero, 1) o `False` (Falso, 0).\n\n### Operadores Fundamentales\n* **AND (Conjunción):** `A and B` es verdadero **únicamente** si ambos operandos son verdaderos.\n* **OR (Disyunción):** `A or B` es verdadero si **al menos uno** de los operandos es verdadero.\n* **NOT (Negación):** `not A` invierte el valor de verdad.\n\n### Reto Práctico\nImplementa la función `puede_acceder(edad, tiene_pase, es_vip)` que determine si un usuario puede ingresar a una zona restringida:\n* Si es VIP, puede entrar sin importar su edad ni su pase.\n* Si no es VIP, debe ser mayor de edad (>= 18) **Y** tener pase activo.",
        "starter_code": "def puede_acceder(edad: int, tiene_pase: bool, es_vip: bool) -> bool:\n    \"\"\"\n    Determina si un usuario tiene autorización de acceso.\n    \"\"\"\n    # TODO: Retorna True o False aplicando lógica booleana\n    pass\n\n# Pruebas manuales:\nprint(puede_acceder(20, True, False))   # True\nprint(puede_acceder(16, True, False))   # False\nprint(puede_acceder(15, False, True))   # True (es VIP)\n",
        "solution": "def puede_acceder(edad: int, tiene_pase: bool, es_vip: bool) -> bool:\n    return es_vip or (edad >= 18 and tiene_pase)\n",
        "test_cases": [
            {
                "input": "20, True, False",
                "expected": "True"
            },
            {
                "input": "16, True, False",
                "expected": "False"
            },
            {
                "input": "15, False, True",
                "expected": "True"
            },
            {
                "input": "18, True, False",
                "expected": "True"
            },
            {
                "input": "18, False, False",
                "expected": "False"
            }
        ],
        "hint": "Usa el operador 'or' para el caso VIP y agrupa con paréntesis '(edad >= 18 and tiene_pase)'.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 220,
            "title": "Fundamentos del Pensamiento Lógico",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "logica-pensamiento-computacional-condicionales-anidados-y-multiples-caminos-logicos": {
        "id": 582,
        "module_id": 221,
        "title": "Condicionales anidados y múltiples caminos lógicos",
        "slug": "logica-pensamiento-computacional-condicionales-anidados-y-multiples-caminos-logicos",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": "## Condicionales Anidados y Múltiples Caminos Lógicos\n\nEl exceso de condicionales anidados (`if` dentro de `if` dentro de `if`) genera el antipatrón conocido como **Código Piramidal (Arrow Anti-pattern)**, que dificulta la lectura y aumenta la complejidad ciclomática.\n\n### La Técnica de Cláusulas de Guarda (Guard Clauses)\nEn lugar de anidar niveles profundos, valida las condiciones de error o salida rápida al inicio de la función (Early Return):\n\n```python\n# ANTIPATRÓN: Pirámide de anidamiento\ndef procesar_pago_malo(usuario, monto):\n    if usuario is not None:\n        if usuario.activo:\n            if usuario.saldo >= monto:\n                return ejecutar_cobro(usuario, monto)\n            else:\n                return 'Saldo insuficiente'\n        else:\n            return 'Usuario inactivo'\n    return 'Usuario nulo'\n\n# BUENA PRÁCTICA: Guard Clauses\ndef procesar_pago_limpio(usuario, monto):\n    if not usuario:\n        return 'Usuario nulo'\n    if not usuario.activo:\n        return 'Usuario inactivo'\n    if usuario.saldo < monto:\n        return 'Saldo insuficiente'\n    \n    return ejecutar_cobro(usuario, monto)\n```\n\n> **Beneficio:** Cada nivel de indentación eliminado reduce la carga cognitiva para entender y depurar la lógica.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 221,
            "title": "Estructuración de Algoritmos",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "logica-pensamiento-computacional-bucles-de-control-mientras-vs-para": {
        "id": 583,
        "module_id": 221,
        "title": "Bucles de control: mientras vs para",
        "slug": "logica-pensamiento-computacional-bucles-de-control-mientras-vs-para",
        "type": "code_challenge",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": "## Bucles de Control: Mientras vs Para\n\nLos bucles permiten repetir un bloque de código. La elección correcta depende de la condición de parada:\n* **Bucle `for`:** Se utiliza cuando se conoce de antemano el número de iteraciones o se recorre una colección finita.\n* **Bucle `while`:** Se utiliza cuando la repetición depende de una condición dinámica que cambia durante la ejecución.\n\n### Reto Práctico\nImplementa la función `serie_fibonacci(n)` que retorne una lista con los primeros `n` números de la serie de Fibonacci: `[0, 1, 1, 2, 3, 5, 8, ...]`\n* Si `n <= 0`, retorna `[]`.\n* Si `n == 1`, retorna `[0]`.\n* Si `n == 2`, retorna `[0, 1]`.",
        "starter_code": "def serie_fibonacci(n: int) -> list[int]:\n    \"\"\"\n    Genera los primeros n números de Fibonacci usando un bucle iterativo.\n    \"\"\"\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    \n    secuencia = [0, 1]\n    # TODO: Usa un bucle for o while para completar hasta n números\n    \n    return secuencia\n\n# Prueba:\nprint(serie_fibonacci(7)) # [0, 1, 1, 2, 3, 5, 8]\n",
        "solution": "def serie_fibonacci(n: int) -> list[int]:\n    if n <= 0:\n        return []\n    if n == 1:\n        return [0]\n    secuencia = [0, 1]\n    for _ in range(2, n):\n        secuencia.append(secuencia[-1] + secuencia[-2])\n    return secuencia\n",
        "test_cases": [
            {
                "input": "1",
                "expected": "[0]"
            },
            {
                "input": "2",
                "expected": "[0, 1]"
            },
            {
                "input": "5",
                "expected": "[0, 1, 1, 2, 3]"
            },
            {
                "input": "7",
                "expected": "[0, 1, 1, 2, 3, 5, 8]"
            }
        ],
        "hint": "En cada iteración, el nuevo número es la suma de los dos últimos: secuencia[-1] + secuencia[-2].",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 221,
            "title": "Estructuración de Algoritmos",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "logica-pensamiento-computacional-quiz-formativo-pensamiento-logico": {
        "id": 584,
        "module_id": 221,
        "title": "Quiz formativo: Pensamiento Lógico",
        "slug": "logica-pensamiento-computacional-quiz-formativo-pensamiento-logico",
        "type": "quiz",
        "duration_minutes": 10,
        "order": 3,
        "is_preview": false,
        "content": "## Quiz Formativo: Pensamiento Lógico\n\nPon a prueba tu comprensión de estructuras de control, álgebra booleana y diseño de algoritmos eficaces.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 221,
            "title": "Estructuración de Algoritmos",
            "course_id": 97,
            "course_slug": "logica-pensamiento-computacional",
            "course_title": "Lógica y Pensamiento Computacional",
            "course": {
                "id": 97,
                "slug": "logica-pensamiento-computacional",
                "title": "Lógica y Pensamiento Computacional"
            }
        }
    },
    "python-estructurado-definicion-de-funciones-parametros-y-retornos": {
        "id": 585,
        "module_id": 222,
        "title": "Definición de funciones, parámetros y retornos",
        "slug": "python-estructurado-definicion-de-funciones-parametros-y-retornos",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": "## Definición de Funciones, Parámetros y Retornos\n\nEn desarrollo profesional con Python, las funciones deben tener **una única responsabilidad**, documentación clara y tipado estático opcional (`Type Hints`).\n\n```python\ndef calcular_descuento(precio: float, porcentaje: float = 0.10) -> float:\n    \"\"\"\n    Calcula el precio final aplicando un porcentaje de descuento.\n\n    Args:\n        precio: Precio original del producto en COP o USD.\n        porcentaje: Fracción de descuento (por defecto 10%).\n\n    Returns:\n        Precio con descuento aplicado.\n    \"\"\"\n    if precio < 0 or not (0 <= porcentaje <= 1):\n        raise ValueError('Valores de precio o descuento inválidos.')\n    return round(precio * (1 - porcentaje), 2)\n```\n\n### Reglas de Diseño Limpio\n1. **Funciones puras:** Con los mismos argumentos de entrada, siempre devuelven la misma salida y no producen efectos secundarios en variables externas.\n2. **Número de parámetros:** Procura mantener un máximo de 3 a 4 parámetros. Si requieres más, agrúpalos en un diccionario o `dataclass`.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 222,
            "title": "Modularidad y Funciones en Python",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "python-estructurado-alcance-de-variables-local-vs-global-y-closures": {
        "id": 586,
        "module_id": 222,
        "title": "Alcance de variables: local vs global y closures",
        "slug": "python-estructurado-alcance-de-variables-local-vs-global-y-closures",
        "type": "article",
        "duration_minutes": 12,
        "order": 2,
        "is_preview": false,
        "content": "## Alcance de Variables: Local vs Global y Closures\n\nEl alcance (*Scope*) define en qué partes del programa es accesible un identificador. Python resuelve las variables usando la regla **LEGB**:\n1. **L (Local):** Nombres asignados dentro de una función o lambda.\n2. **E (Enclosing):** Nombres en funciones contenedoras (cierres o *closures*).\n3. **G (Global):** Nombres asignados en el nivel superior del módulo o con la palabra clave `global`.\n4. **B (Built-in):** Nombres predefinidos en Python (`print`, `len`, `range`).\n\n### ¿Qué es un Closure?\nUna función interna que recuerda y conserva acceso al entorno donde fue creada, incluso después de que la función externa haya finalizado:\n\n```python\ndef crear_multiplicador(factor: int):\n    def multiplicador(numero: int) -> int:\n        return numero * factor  # 'factor' proviene del scope exterior\n    return multiplicador\n\ndoble = crear_multiplicador(2)\nprint(doble(15)) # 30\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 222,
            "title": "Modularidad y Funciones en Python",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "estructuras-datos-lineales-implementacion-de-pilas-con-punteros-en-memoria": {
        "id": 593,
        "module_id": 225,
        "title": "Implementación de Pilas con punteros en memoria",
        "slug": "estructuras-datos-lineales-implementacion-de-pilas-con-punteros-en-memoria",
        "type": "article",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": true,
        "content": "## Implementación de Pilas (Stack - LIFO) con Punteros\n\nUna **Pila (Stack)** es una estructura de datos lineal que sigue el principio **LIFO** (*Last In, First Out*: el último elemento en entrar es el primero en salir).\n\n```\n       Push (Insertar)\n            |\n            v\n     +--------------+\n     |   Dato C     | <--- Tope (Top)\n     +--------------+\n     |   Dato B     |\n     +--------------+\n     |   Dato A     | <--- Fondo (Base)\n     +--------------+\n```\n\n### Operaciones Fundamentales\n* `push(elemento)`: Inserta un elemento en el tope (`O(1)`).\n* `pop()`: Remueve y retorna el elemento en el tope (`O(1)`).\n* `peek()` o `top()`: Consulta el elemento del tope sin removerlo (`O(1)`).\n* `is_empty()`: Comprueba si la pila no tiene elementos (`O(1)`).\n\n### Casos de Uso en Ingeniería de Software\n* Mecanismos de deshacer/rehacer (*Undo/Redo*) en editores de texto.\n* Evaluación de expresiones matemáticas y análisis sintáctico en compiladores.\n* Historial de navegación en navegadores web.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 225,
            "title": "Pilas y Colas (LIFO vs FIFO)",
            "course_id": 99,
            "course_slug": "estructuras-datos-lineales",
            "course_title": "Estructuras de Datos Lineales y Complejidad",
            "course": {
                "id": 99,
                "slug": "estructuras-datos-lineales",
                "title": "Estructuras de Datos Lineales y Complejidad"
            }
        }
    },
    "python-estructurado-reto-practico-refactorizacion-modular-de-scripts": {
        "id": 587,
        "module_id": 222,
        "title": "Reto práctico: Refactorización modular de scripts",
        "slug": "python-estructurado-reto-practico-refactorizacion-modular-de-scripts",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Refactorización Modular de Scripts\n\nUn error común al iniciar es escribir scripts planos donde los datos, la lógica de cálculo y la presentación están mezclados en el script global.\n\n### Objetivo del Reto\nImplementa una función `analizar_temperaturas(registros)` que reciba una lista de temperaturas en grados Celsius y retorne un diccionario con:\n* `\"promedio\"`: La media aritmética redondeada a 2 decimales.\n* `\"maxima\"`: La temperatura más alta.\n* `\"minima\"`: La temperatura más baja.\n* Si la lista está vacía, retorna `None`.",
        "starter_code": "def analizar_temperaturas(registros: list[float]) -> dict | None:\n    \"\"\"\n    Calcula estadísticas básicas de una serie de temperaturas.\n    \"\"\"\n    if not registros:\n        return None\n    \n    # TODO: Calcula promedio, máxima y mínima\n    promedio = round(sum(registros) / len(registros), 2)\n    maxima = max(registros)\n    minima = min(registros)\n    \n    return {\n        \"promedio\": promedio,\n        \"maxima\": maxima,\n        \"minima\": minima\n    }\n\n# Prueba:\nprint(analizar_temperaturas([22.5, 25.0, 19.5, 31.0]))\n",
        "solution": "def analizar_temperaturas(registros: list[float]) -> dict | None:\n    if not registros:\n        return None\n    return {\n        \"promedio\": round(sum(registros) / len(registros), 2),\n        \"maxima\": max(registros),\n        \"minima\": min(registros)\n    }\n",
        "test_cases": [
            {
                "input": "[20.0, 20.0, 20.0]",
                "expected": "{'promedio': 20.0, 'maxima': 20.0, 'minima': 20.0}"
            },
            {
                "input": "[10.0, 20.0, 30.0]",
                "expected": "{'promedio': 20.0, 'maxima': 30.0, 'minima': 10.0}"
            },
            {
                "input": "[]",
                "expected": "None"
            }
        ],
        "hint": "Recuerda validar si la lista está vacía al principio con 'if not registros: return None'.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 222,
            "title": "Modularidad y Funciones en Python",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "python-estructurado-colecciones-indexadas-listas-y-sus-metodos-clave": {
        "id": 588,
        "module_id": 223,
        "title": "Colecciones indexadas: listas y sus métodos clave",
        "slug": "python-estructurado-colecciones-indexadas-listas-y-sus-metodos-clave",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## Colecciones Indexadas: Listas y Comprensiones\n\nLas listas en Python son arreglos dinámicos en memoria contigua que ofrecen acceso por índice en tiempo constante `O(1)`.\n\n### List Comprehensions (Comprensiones de Lista)\nSintaxis idiomática y rápida para transformar y filtrar elementos:\n\n```python\n# Sintaxis tradicional\ncuadrados_pares = []\nfor x in range(10):\n    if x % 2 == 0:\n        cuadrados_pares.append(x ** 2)\n\n# Pythonico con List Comprehension\ncuadrados_pares = [x ** 2 for x in range(10) if x % 2 == 0]\n```\n\n### Operaciones Clave y Complejidad\n* `lista[i]` (Acceso por índice): `O(1)`\n* `lista.append(x)` (Inserción al final amortizada): `O(1)`\n* `lista.insert(0, x)` (Inserción al inicio, requiere desplazar): `O(n)`\n* `x in lista` (Búsqueda lineal): `O(n)`",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 223,
            "title": "Estructuras de Datos Nativas",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "python-estructurado-mapeos-asociativos-diccionarios-para-modelar-entidades": {
        "id": 589,
        "module_id": 223,
        "title": "Mapeos asociativos: diccionarios para modelar entidades",
        "slug": "python-estructurado-mapeos-asociativos-diccionarios-para-modelar-entidades",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## Mapeos Asociativos: Diccionarios para Modelar Entidades\n\nLos diccionarios en Python son tablas hash (*Hash Maps*) que asocian claves únicas con valores. Ofrecen búsquedas e inserciones promedio en tiempo `O(1)`.\n\n### Métodos Esenciales\n* `dict.get(key, default)`: Evita `KeyError` si la clave no existe.\n* `dict.setdefault(key, default)`: Inserta un valor si la clave no existe y la retorna.\n* `dict.items()`: Itera tuplas `(clave, valor)` eficientemente.\n\n```python\nestudiantes = [\n    {\"nombre\": \"Lucía\", \"materia\": \"Algoritmos\", \"nota\": 4.5},\n    {\"nombre\": \"Carlos\", \"materia\": \"Algoritmos\", \"nota\": 3.8},\n    {\"nombre\": \"Ana\", \"materia\": \"Bases de Datos\", \"nota\": 4.9}\n]\n\n# Agrupar notas por materia\nnotas_por_materia = {}\nfor e in estudiantes:\n    notas_por_materia.setdefault(e[\"materia\"], []).append(e[\"nota\"])\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 223,
            "title": "Estructuras de Datos Nativas",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "python-estructurado-evaluacion-de-estructuras-compuestas": {
        "id": 590,
        "module_id": 223,
        "title": "Evaluación de estructuras compuestas",
        "slug": "python-estructurado-evaluacion-de-estructuras-compuestas",
        "type": "quiz",
        "duration_minutes": 12,
        "order": 3,
        "is_preview": false,
        "content": "## Evaluación de Estructuras Compuestas\n\nValida tus conocimientos sobre listas, tuplas, conjuntos (`set`) y diccionarios en Python.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 223,
            "title": "Estructuras de Datos Nativas",
            "course_id": 98,
            "course_slug": "python-estructurado",
            "course_title": "Programación Estructurada con Python",
            "course": {
                "id": 98,
                "slug": "python-estructurado",
                "title": "Programación Estructurada con Python"
            }
        }
    },
    "estructuras-datos-lineales-complejidad-temporal-o1-on-olog-n-y-on2": {
        "id": 591,
        "module_id": 224,
        "title": "Complejidad temporal O(1), O(n), O(log n) y O(n²)",
        "slug": "estructuras-datos-lineales-complejidad-temporal-o1-on-olog-n-y-on2",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## Complejidad Temporal: Notación Big-O\n\nLa notación Big-O describe cómo escala el tiempo de ejecución de un algoritmo conforme el tamaño de la entrada `n` crece hacia el infinito.\n\n```\nOperaciones\n ^\n |             O(n!)  O(2^n)    O(n²)\n |               |      |        /\n |               |      |       /     O(n log n)\n |               |      |      /     /\n |               |      |     /     /    O(n)\n |               |      |    /     /    /\n |               |      |   /     /    /    O(log n)\n |               |      |  /     /    /    /\n |               |      | /     /    /    /  O(1)\n +-------------------------------------------------> Entrada (n)\n```\n\n### Clasificación de Complejidades\n* **O(1) Constante:** El tiempo no varía con la entrada (ej. acceder a un índice de array).\n* **O(log n) Logarítmica:** El problema se divide a la mitad en cada paso (ej. Búsqueda binaria).\n* **O(n) Lineal:** El tiempo crece proporcionalmente a la entrada (ej. recorrer una lista).\n* **O(n log n) Casi-lineal:** Común en algoritmos de ordenamiento óptimos (MergeSort, QuickSort promedio).\n* **O(n²) Cuadrática:** Bucles anidados sobre la misma entrada (ej. BubbleSort). Evitar en producción con grandes volúmenes de datos.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 224,
            "title": "Notación Asintótica y Big-O",
            "course_id": 99,
            "course_slug": "estructuras-datos-lineales",
            "course_title": "Estructuras de Datos Lineales y Complejidad",
            "course": {
                "id": 99,
                "slug": "estructuras-datos-lineales",
                "title": "Estructuras de Datos Lineales y Complejidad"
            }
        }
    },
    "estructuras-datos-lineales-comparacion-de-algoritmos-por-consumo-de-memoria": {
        "id": 592,
        "module_id": 224,
        "title": "Comparación de algoritmos por consumo de memoria",
        "slug": "estructuras-datos-lineales-comparacion-de-algoritmos-por-consumo-de-memoria",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": "## Comparación de Algoritmos por Consumo de Memoria\n\nAsí como medimos el tiempo, la **Complejidad Espacial** mide cuánta memoria adicional requiere un algoritmo para resolver un problema.\n\n### Memoria Auxiliar vs Espacio de Entrada\n* **Algoritmos In-Place (Espacio O(1)):** Modifican la estructura existente sin crear copias (ej. invertir un array intercambiando punteros izquierda/derecha).\n* **Algoritmos con Espacio O(n):** Crean nuevas estructuras proporcionales a la entrada (ej. `list(filter(...))` o duplicación de datos).\n\n### El Costo Oculto de la Recursión\nCada llamada recursiva apila un nuevo marco de ejecución (*Stack Frame*) en la memoria de la pila de llamadas (Call Stack). Una recursión profunda de `n` niveles consume `O(n)` de memoria en el stack, arriesgando un desbordamiento de pila (*Stack Overflow*).",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 224,
            "title": "Notación Asintótica y Big-O",
            "course_id": 99,
            "course_slug": "estructuras-datos-lineales",
            "course_title": "Estructuras de Datos Lineales y Complejidad",
            "course": {
                "id": 99,
                "slug": "estructuras-datos-lineales",
                "title": "Estructuras de Datos Lineales y Complejidad"
            }
        }
    },
    "estructuras-datos-lineales-reto-algoritmo-de-balanceo-de-parentesis-con-stack": {
        "id": 594,
        "module_id": 225,
        "title": "Reto: Algoritmo de balanceo de paréntesis con Stack",
        "slug": "estructuras-datos-lineales-reto-algoritmo-de-balanceo-de-parentesis-con-stack",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 2,
        "is_preview": false,
        "content": "## Reto: Algoritmo de Balanceo de Paréntesis con Stack\n\nEl problema de balanceo de paréntesis (LeetCode #20: Valid Parentheses) es uno de los problemas clásicos de entrevistas técnicas y parsing de código.\n\n### Enunciado\nDada una cadena de texto compuesta por caracteres `'('`, `')'`, `'{'`, `'}'`, `'['` y `']'`, determina si la cadena de entrada es válida:\n1. Los corchetes abiertos deben cerrarse con el mismo tipo de corchetes.\n2. Los corchetes abiertos deben cerrarse en el orden correcto.\n3. Cada corchete de cierre tiene su correspondiente corchete de apertura previo.\n\n### Estrategia Algorítmica con Stack\n* Recorre cada carácter de la cadena.\n* Si encuentras apertura (`(`, `[`, `{`), haz `push` al stack.\n* Si encuentras cierre (`)`, `]`, `}`):\n  - Si el stack está vacío, es inválido (cierre sin apertura).\n  - Si el tope del stack no coincide con la apertura esperada, es inválido.\n  - Si coincide, haz `pop()`.\n* Al finalizar el recorrido, si el stack está vacío retorna `True`, de lo contrario `False`.",
        "starter_code": "def esta_balanceado(cadena: str) -> bool:\n    \"\"\"\n    Retorna True si los parentesis, corchetes y llaves estan balanceados,\n    False en caso contrario.\n    \"\"\"\n    stack = []\n    mapa = {')': '(', ']': '[', '}': '{'}\n    \n    for char in cadena:\n        if char in mapa.values():\n            stack.append(char)\n        elif char in mapa:\n            if not stack or stack.pop() != mapa[char]:\n                return False\n                \n    return len(stack) == 0\n\n# Casos de prueba:\nprint(esta_balanceado(\"({[]})\")) # True\nprint(esta_balanceado(\"([)]\"))   # False\nprint(esta_balanceado(\"()[]{}\")) # True\n",
        "solution": "def esta_balanceado(cadena: str) -> bool:\n    stack = []\n    mapa = {')': '(', ']': '[', '}': '{'}\n    for char in cadena:\n        if char in mapa.values():\n            stack.append(char)\n        elif char in mapa:\n            if not stack or stack.pop() != mapa[char]:\n                return False\n    return len(stack) == 0\n",
        "test_cases": [
            {
                "input": "\"({[]})\"",
                "expected": "True"
            },
            {
                "input": "\"([)]\"",
                "expected": "False"
            },
            {
                "input": "\"()[]{}\"",
                "expected": "True"
            },
            {
                "input": "\"(((\"",
                "expected": "False"
            },
            {
                "input": "\"\"",
                "expected": "True"
            }
        ],
        "hint": "Usa una lista de Python como stack con .append() y .pop(). Compara los cierres con un diccionario clave:valor.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 225,
            "title": "Pilas y Colas (LIFO vs FIFO)",
            "course_id": 99,
            "course_slug": "estructuras-datos-lineales",
            "course_title": "Estructuras de Datos Lineales y Complejidad",
            "course": {
                "id": 99,
                "slug": "estructuras-datos-lineales",
                "title": "Estructuras de Datos Lineales y Complejidad"
            }
        }
    },
    "diseno-modular-interfaces-definicion-de-contratos-con-interfaces-vs-clases-abstractas": {
        "id": 596,
        "module_id": 226,
        "title": "Definición de contratos con Interfaces vs Clases Abstractas",
        "slug": "diseno-modular-interfaces-definicion-de-contratos-con-interfaces-vs-clases-abstractas",
        "type": "article",
        "duration_minutes": 15,
        "order": 1,
        "is_preview": true,
        "content": "## Contratos con Interfaces vs Clases Abstractas\n\nEn diseño orientado a objetos y Clean Architecture, desacoplar implementaciones concretas mediante **contratos abstractos** es la base de la mantenibilidad.\n\n### Interfaz vs Clase Abstracta\n* **Interfaz (Interface / Protocol):** Define *QUÉ* debe hacer un objeto (métodos y firmas públicas), sin proveer ninguna implementación ni estado.\n* **Clase Abstracta (Abstract Base Class):** Puede definir tanto contratos obligatorios (`@abstractmethod`) como código común reutilizable por las subclases.\n\n```python\nfrom abc import ABC, abstractmethod\n\nclass Notificador(ABC):\n    \"\"\"Contrato abstracto: cualquier canal de notificación debe implementarlo.\"\"\"\n    @abstractmethod\n    def enviar(self, destinatario: str, mensaje: str) -> bool:\n        pass\n```",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 226,
            "title": "Módulo 1: Contratos y Desacoplamiento de Software",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-interfaces": {
        "id": 597,
        "module_id": 226,
        "title": "Inyección de dependencias a través de interfaces",
        "slug": "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-interfaces",
        "type": "article",
        "duration_minutes": 16,
        "order": 2,
        "is_preview": false,
        "content": "## Inyección de Dependencias a través de Interfaces\n\nEl **Principio de Inversión de Dependencias (DIP)** establece que:\n1. Los módulos de alto nivel no deben depender de módulos de bajo nivel; ambos deben depender de abstracciones.\n2. Las abstracciones no deben depender de los detalles; los detalles deben depender de abstracciones.\n\n```python\n# Módulo de Alto Nivel dependiente solo de la abstracción Notificador\nclass ServicioRegistro:\n    def __init__(self, notificador: Notificador):\n        self.notificador = notificador  # Inyección por constructor\n\n    def registrar_usuario(self, email: str):\n        # ... lógica de negocio ...\n        self.notificador.enviar(email, '¡Bienvenido a SysEngAcademy!')\n```\n\n> **Ventaja en Pruebas Unitarias:** Podemos inyectar un `MockNotificador` en los tests automatizados sin enviar correos reales ni depender de APIs de terceros.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 226,
            "title": "Módulo 1: Contratos y Desacoplamiento de Software",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "diseno-modular-interfaces-reto-implementacion-de-pasarela-de-pago-polimorfica": {
        "id": 598,
        "module_id": 226,
        "title": "Reto: Implementación de pasarela de pago polimórfica",
        "slug": "diseno-modular-interfaces-reto-implementacion-de-pasarela-de-pago-polimorfica",
        "type": "code_challenge",
        "duration_minutes": 22,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Implementación de Pasarela de Pago Polimórfica\n\n### Objetivo\nCrea un sistema polimórfico de pagos donde el servicio de cobro pueda operar indistintamente con Stripe o PayPal mediante un contrato común.\n\nImplementa:\n1. La clase abstracta `PasarelaPago` con el método abstracto `procesar(monto: float) -> str`.\n2. Las clases concretas `StripeGateway` y `PayPalGateway` que retornen:\n   - `Stripe: Cobro exitoso de $monto`\n   - `PayPal: Cobro exitoso de $monto`\n3. La función `ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str`.",
        "starter_code": "from abc import ABC, abstractmethod\n\nclass PasarelaPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> str:\n        pass\n\nclass StripeGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        # TODO: Implementa retorno de Stripe\n        return f\"Stripe: Cobro exitoso de ${monto}\"\n\nclass PayPalGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        # TODO: Implementa retorno de PayPal\n        return f\"PayPal: Cobro exitoso de ${monto}\"\n\ndef ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str:\n    return pasarela.procesar(monto)\n\n# Prueba:\nprint(ejecutar_transaccion(StripeGateway(), 150.0))\nprint(ejecutar_transaccion(PayPalGateway(), 80.0))\n",
        "solution": "from abc import ABC, abstractmethod\n\nclass PasarelaPago(ABC):\n    @abstractmethod\n    def procesar(self, monto: float) -> str:\n        pass\n\nclass StripeGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        return f\"Stripe: Cobro exitoso de ${monto}\"\n\nclass PayPalGateway(PasarelaPago):\n    def procesar(self, monto: float) -> str:\n        return f\"PayPal: Cobro exitoso de ${monto}\"\n\ndef ejecutar_transaccion(pasarela: PasarelaPago, monto: float) -> str:\n    return pasarela.procesar(monto)\n",
        "test_cases": [
            {
                "input": "ejecutar_transaccion(StripeGateway(), 100.0)",
                "expected": "Stripe: Cobro exitoso de $100.0"
            },
            {
                "input": "ejecutar_transaccion(PayPalGateway(), 50.0)",
                "expected": "PayPal: Cobro exitoso de $50.0"
            }
        ],
        "hint": "Asegúrate de que ambas clases hereden de PasarelaPago e implementen el método procesar exactamente con la misma firma.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 226,
            "title": "Módulo 1: Contratos y Desacoplamiento de Software",
            "course_id": 100,
            "course_slug": "diseno-modular-interfaces",
            "course_title": "Diseño Modular, Interfaces y Contratos",
            "course": {
                "id": 100,
                "slug": "diseno-modular-interfaces",
                "title": "Diseño Modular, Interfaces y Contratos"
            }
        }
    },
    "arquitectura-proyecto-poo-separacion-de-logica-de-negocio-y-framework": {
        "id": 599,
        "module_id": 227,
        "title": "Separación de lógica de negocio y framework",
        "slug": "arquitectura-proyecto-poo-separacion-de-logica-de-negocio-y-framework",
        "type": "article",
        "duration_minutes": 18,
        "order": 1,
        "is_preview": true,
        "content": "## Separación de Lógica de Negocio y Framework\n\nUno de los postulados principales de **Clean Architecture** (Robert C. Martin) y **Arquitectura Hexagonal** (Alistair Cockburn) es:\n> *\"La lógica de negocio de tu aplicación no debe saber nada sobre Laravel, Django, FastAPI o PostgreSQL. Tu framework es solo un detalle de entrega, no tu aplicación.\"*\n\n```\n               [ Controladores HTTP / CLI ]\n                           |\n                           v\n               [ Casos de Uso / Servicios ]\n                           |\n                           v\n                [ Entidades de Dominio ] <--- Núcleo Puro (Reglas de Negocio)\n                           ^\n                           |\n               [ Adaptadores de BD / ORM ]\n```\n\n### Reglas para mantener el Dominio Puro\n1. Las entidades de negocio deben ser clases planas sin heredar del ORM (ActiveRecord).\n2. Las operaciones de cálculo y validación de reglas viven en métodos de dominio, no en controladores HTTP.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 227,
            "title": "Modelado del Dominio",
            "course_id": 101,
            "course_slug": "arquitectura-proyecto-poo",
            "course_title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
            "course": {
                "id": 101,
                "slug": "arquitectura-proyecto-poo",
                "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos"
            }
        }
    },
    "arquitectura-proyecto-poo-implementacion-del-patron-repository-y-data-transfer-objects": {
        "id": 600,
        "module_id": 227,
        "title": "Implementación del patrón Repository y Data Transfer Objects",
        "slug": "arquitectura-proyecto-poo-implementacion-del-patron-repository-y-data-transfer-objects",
        "type": "article",
        "duration_minutes": 20,
        "order": 2,
        "is_preview": false,
        "content": "## Patrón Repository y Data Transfer Objects (DTOs)\n\n### El Patrón Repository\nActúa como una colección en memoria de objetos de dominio, aislando el resto de la aplicación de los detalles específicos de persistencia (SQL, NoSQL, APIs externas).\n\n### ¿Por qué usar DTOs?\nUn **Data Transfer Object (DTO)** es un objeto simple cuya única responsabilidad es transportar datos estructurados e inmutables entre capas (por ejemplo, desde el request HTTP hacia el servicio de dominio):\n\n```python\nfrom dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass CrearCursoDTO:\n    titulo: str\n    categoria_id: int\n    precio: float\n    duracion_horas: int\n```\n\n> **Beneficios:** Tipado fuerte estricto, autocompletado en IDEs y garantía de que los datos no sufrirán mutaciones accidentales.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 227,
            "title": "Modelado del Dominio",
            "course_id": 101,
            "course_slug": "arquitectura-proyecto-poo",
            "course_title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
            "course": {
                "id": 101,
                "slug": "arquitectura-proyecto-poo",
                "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos"
            }
        }
    },
    "arquitectura-proyecto-poo-reto-construccion-del-nucleo-de-gestion-de-pedidos": {
        "id": 601,
        "module_id": 227,
        "title": "Reto: Construcción del núcleo de gestión de pedidos",
        "slug": "arquitectura-proyecto-poo-reto-construccion-del-nucleo-de-gestion-de-pedidos",
        "type": "code_challenge",
        "duration_minutes": 30,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Núcleo de Gestión de Pedidos\n\n### Objetivo\nDiseña una entidad de dominio `Pedido` con reglas de negocio independientes:\n* Cada pedido tiene una lista de ítems: `{\"nombre\": str, \"precio\": float, \"cantidad\": int}`.\n* Método `agregar_item(nombre, precio, cantidad)`: Si el precio es <= 0 o cantidad <= 0, debe lanzar `ValueError`.\n* Método `calcular_total(tasa_impuesto=0.19)`: Calcula el subtotal sumando `precio * cantidad`, aplica el porcentaje de impuesto y retorna el total redondeado a 2 decimales.",
        "starter_code": "class Pedido:\n    def __init__(self):\n        self.items = []\n\n    def agregar_item(self, nombre: str, precio: float, cantidad: int) -> None:\n        if precio <= 0 or cantidad <= 0:\n            raise ValueError(\"Precio y cantidad deben ser positivos.\")\n        self.items.append({\"nombre\": nombre, \"precio\": precio, \"cantidad\": cantidad})\n\n    def calcular_total(self, tasa_impuesto: float = 0.19) -> float:\n        subtotal = sum(i[\"precio\"] * i[\"cantidad\"] for i in self.items)\n        return round(subtotal * (1 + tasa_impuesto), 2)\n\n# Prueba:\np = Pedido()\np.agregar_item(\"Laptop\", 1000.0, 1)\np.agregar_item(\"Mouse\", 50.0, 2)\nprint(\"Total con IVA:\", p.calcular_total(0.19)) # 1100 * 1.19 = 1309.0\n",
        "solution": "class Pedido:\n    def __init__(self):\n        self.items = []\n    def agregar_item(self, nombre: str, precio: float, cantidad: int) -> None:\n        if precio <= 0 or cantidad <= 0:\n            raise ValueError('Precio y cantidad deben ser positivos.')\n        self.items.append({'nombre': nombre, 'precio': precio, 'cantidad': cantidad})\n    def calcular_total(self, tasa_impuesto: float = 0.19) -> float:\n        subtotal = sum(i['precio'] * i['cantidad'] for i in self.items)\n        return round(subtotal * (1 + tasa_impuesto), 2)\n",
        "test_cases": [
            {
                "input": "p = Pedido(); p.agregar_item(\"A\", 100.0, 1); p.calcular_total(0.19)",
                "expected": "119.0"
            },
            {
                "input": "p = Pedido(); p.agregar_item(\"A\", 200.0, 2); p.calcular_total(0.0)",
                "expected": "400.0"
            }
        ],
        "hint": "Multiplica precio por cantidad para cada ítem en una comprensión o generador sum(...).",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 227,
            "title": "Modelado del Dominio",
            "course_id": 101,
            "course_slug": "arquitectura-proyecto-poo",
            "course_title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
            "course": {
                "id": 101,
                "slug": "arquitectura-proyecto-poo",
                "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos"
            }
        }
    },
    "git-avanzado-rebase-conflictos-git-rebase-interactivo-squash-reword-drop-y-fixup": {
        "id": 615,
        "module_id": 232,
        "title": "Git Rebase Interactivo: squash, reword, drop y fixup",
        "slug": "git-avanzado-rebase-conflictos-git-rebase-interactivo-squash-reword-drop-y-fixup",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## Git Rebase Interactivo: Squash, Reword, Drop y Fixup\n\nEl rebase interactivo (`git rebase -i`) es la herramienta para limpiar tu historial local antes de enviar tu código a revisión.\n\n```bash\n# Iniciar rebase interactivo sobre los últimos 4 commits\ngit rebase -i HEAD~4\n```\n\n### Comandos Clave en el Editor\n* `pick`: Conservar el commit tal como está.\n* `reword`: Conservar el commit pero modificar el mensaje de commit.\n* `squash`: Fusionar este commit con el commit anterior e integrar sus mensajes.\n* `fixup`: Igual que `squash`, pero descarta el mensaje de este commit (ideal para commits tipo \"fix typo\").\n* `drop`: Eliminar por completo el commit.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 232,
            "title": "Rebase y Limpieza del Historial",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "git-avanzado-rebase-conflictos-reto-reestructurar-una-rama-caotica-antes-del-pull-request": {
        "id": 616,
        "module_id": 232,
        "title": "Reto: Reestructurar una rama caótica antes del Pull Request",
        "slug": "git-avanzado-rebase-conflictos-reto-reestructurar-una-rama-caotica-antes-del-pull-request",
        "type": "code_challenge",
        "duration_minutes": 22,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Reestructurar una Rama Caótica antes del Pull Request\n\nEn este ejercicio aprenderás a planificar y ejecutar la consolidación de un historial de desarrollo desordenado en un conjunto atómico de commits profesionales.",
        "starter_code": "# Simulación interactiva de comandos Git\ndef verificar_estrategia_pr(commits: list[str]) -> bool:\n    \"\"\"\n    Verifica que no existan mensajes de commit de baja calidad como 'fix', 'wip' o 'typo'.\n    \"\"\"\n    mensajes_invalidos = ['wip', 'fix', 'prueba', 'arreglos', 'temp']\n    for c in commits:\n        if any(inv in c.lower() for inv in mensajes_invalidos):\n            return False\n    return True\n\n# Prueba:\nprint(verificar_estrategia_pr(['feat: agregar autenticacion JWT', 'test: pruebas unitarias'])) # True\n",
        "solution": "def verificar_estrategia_pr(commits: list[str]) -> bool:\n    mensajes_invalidos = ['wip', 'fix', 'prueba', 'arreglos', 'temp']\n    for c in commits:\n        if any(inv in c.lower() for inv in mensajes_invalidos):\n            return False\n    return True\n",
        "test_cases": [
            {
                "input": "['feat: login', 'wip commit']",
                "expected": "False"
            },
            {
                "input": "['feat: login', 'test: login tests']",
                "expected": "True"
            }
        ],
        "hint": "Valida que los mensajes sigan la convención de Conventional Commits (feat, fix, docs, refactor).",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 232,
            "title": "Rebase y Limpieza del Historial",
            "course_id": 106,
            "course_slug": "git-avanzado-rebase-conflictos",
            "course_title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
            "course": {
                "id": 106,
                "slug": "git-avanzado-rebase-conflictos",
                "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-que-es-un-vector-embedding-y-como-cuantifica-el-significado": {
        "id": 623,
        "module_id": 235,
        "title": "Qué es un vector embedding y cómo cuantifica el significado",
        "slug": "rag-embeddings-bases-vectoriales-que-es-un-vector-embedding-y-como-cuantifica-el-significado",
        "type": "article",
        "duration_minutes": 16,
        "order": 1,
        "is_preview": true,
        "content": "## ¿Qué es un Vector Embedding y Cómo Cuantifica el Significado?\n\nUn **Vector Embedding** es una representación numérica densa de un texto (o imagen) en un espacio matemático vectorial multidimensional (frecuentemente de 1536 o 3072 dimensiones).\n\n```\nConceptos Similares ──> Vectores Cercanos en el Espacio\n'Rey' - 'Hombre' + 'Mujer' ≈ 'Reina'\n```\n\n### Propiedades Clave\n1. **Semántica en Distancias:** Palabras o frases con significados similares tienen vectores que apuntan en direcciones muy cercanas.\n2. **Independencia del léxico exacto:** Permite encontrar que *\"error de memoria\"* se relaciona con *\"out of memory crash\"*, aunque no compartan ninguna palabra exacta.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 235,
            "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "rag-embeddings-bases-vectoriales-reto-implementacion-de-busqueda-semantica-con-similitud-coseno": {
        "id": 625,
        "module_id": 235,
        "title": "Reto: Implementación de búsqueda semántica con similitud coseno",
        "slug": "rag-embeddings-bases-vectoriales-reto-implementacion-de-busqueda-semantica-con-similitud-coseno",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Implementación de Similitud Coseno\n\nLa **Similitud Coseno** mide el coseno del ángulo entre dos vectores. Varía entre -1 y 1 (o 0 y 1 para vectores de embedding normalizados), donde 1 indica vectores idénticos en dirección.\n\n$$\\text{similitud}(u, v) = \\frac{u \\cdot v}{\\|u\\| \\|v\\|} = \\frac{\\sum u_i v_i}{\\sqrt{\\sum u_i^2} \\sqrt{\\sum v_i^2}}$$\n\n### Objetivo\nImplementa la función `similitud_coseno(v1, v2)` que calcule la similitud entre dos listas de números de igual longitud. Redondea a 4 decimales.",
        "starter_code": "import math\n\ndef similitud_coseno(v1: list[float], v2: list[float]) -> float:\n    \"\"\"\n    Calcula la similitud coseno entre dos vectores numericos.\n    \"\"\"\n    if len(v1) != len(v2) or not v1:\n        raise ValueError(\"Los vectores deben tener la misma longitud y no estar vacios.\")\n    \n    producto_punto = sum(a * b for a, b in zip(v1, v2))\n    norma_v1 = math.sqrt(sum(a * a for a in v1))\n    norma_v2 = math.sqrt(sum(b * b for b in v2))\n    \n    if norma_v1 == 0 or norma_v2 == 0:\n        return 0.0\n        \n    return round(producto_punto / (norma_v1 * norma_v2), 4)\n\n# Prueba con vectores identicos (debe dar 1.0):\nprint(similitud_coseno([1.0, 2.0, 3.0], [1.0, 2.0, 3.0]))\n# Prueba con ortogonales (debe dar 0.0):\nprint(similitud_coseno([1.0, 0.0], [0.0, 1.0]))\n",
        "solution": "import math\ndef similitud_coseno(v1: list[float], v2: list[float]) -> float:\n    producto_punto = sum(a * b for a, b in zip(v1, v2))\n    norma_v1 = math.sqrt(sum(a * a for a in v1))\n    norma_v2 = math.sqrt(sum(b * b for b in v2))\n    if norma_v1 == 0 or norma_v2 == 0:\n        return 0.0\n    return round(producto_punto / (norma_v1 * norma_v2), 4)\n",
        "test_cases": [
            {
                "input": "similitud_coseno([1.0, 0.0], [1.0, 0.0])",
                "expected": "1.0"
            },
            {
                "input": "similitud_coseno([1.0, 0.0], [0.0, 1.0])",
                "expected": "0.0"
            }
        ],
        "hint": "Usa sum(a * b for a, b in zip(v1, v2)) para el producto punto.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 235,
            "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
            "course_id": 108,
            "course_slug": "rag-embeddings-bases-vectoriales",
            "course_title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
            "course": {
                "id": 108,
                "slug": "rag-embeddings-bases-vectoriales",
                "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales"
            }
        }
    },
    "docker-compose-multiservicio-reto-levantar-stack-php-postgres-redis-con-compose": {
        "id": 622,
        "module_id": 234,
        "title": "Reto: Levantar stack PHP + Postgres + Redis con Compose",
        "slug": "docker-compose-multiservicio-reto-levantar-stack-php-postgres-redis-con-compose",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Levantar Stack PHP + Postgres + Redis con Compose\n\nEn este reto validarás la sintaxis y dependencias necesarias para orquestar un backend completo con base de datos relacional y caché en memoria.",
        "starter_code": "def validar_servicios_compose(config: dict) -> list[str]:\n    \"\"\"\n    Verifica que los servicios requeridos (app, db, redis) esten declarados.\n    \"\"\"\n    requeridos = {'app', 'db', 'redis'}\n    declarados = set(config.get('services', {}).keys())\n    faltantes = list(requeridos - declarados)\n    return sorted(faltantes)\n\n# Prueba:\nprint(validar_servicios_compose({'services': {'app': {}, 'db': {}, 'redis': {}}})) # []\n",
        "solution": "def validar_servicios_compose(config: dict) -> list[str]:\n    requeridos = {'app', 'db', 'redis'}\n    declarados = set(config.get('services', {}).keys())\n    return sorted(list(requeridos - declarados))\n",
        "test_cases": [
            {
                "input": "{'services': {'app': {}, 'db': {}, 'redis': {}}}",
                "expected": "[]"
            },
            {
                "input": "{'services': {'app': {}}}",
                "expected": "['db', 'redis']"
            }
        ],
        "hint": "Usa operaciones de conjuntos (set) en Python para comparar los servicios requeridos con los declarados.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 234,
            "title": "Módulo 1: Orquestación Local y Redes Aisladas",
            "course_id": 107,
            "course_slug": "docker-compose-multiservicio",
            "course_title": "Docker Compose y Arquitecturas Multiservicio",
            "course": {
                "id": 107,
                "slug": "docker-compose-multiservicio",
                "title": "Docker Compose y Arquitecturas Multiservicio"
            }
        }
    },
    "especificacion-srs-diagramas-diagramas-de-casos-de-uso-y-diagramas-de-secuencia-uml": {
        "id": 627,
        "module_id": 236,
        "title": "Diagramas de casos de uso y diagramas de secuencia UML",
        "slug": "especificacion-srs-diagramas-diagramas-de-casos-de-uso-y-diagramas-de-secuencia-uml",
        "type": "article",
        "duration_minutes": 18,
        "order": 2,
        "is_preview": false,
        "content": "## Diagramas de Casos de Uso y Diagramas de Secuencia UML\n\n### Diagrama de Casos de Uso\nRepresenta las interacciones entre los **Actores** (usuarios externos o sistemas) y las funcionalidades del sistema (Casos de Uso).\n* `<<include>>`: El caso de uso base no puede completarse sin el incluido (ej. *Realizar Pago* incluye *Validar Fondos*).\n* `<<extend>>`: Comportamiento opcional que se ejecuta bajo ciertas condiciones (ej. *Comprar* extendido por *Aplicar Cupón de Descuento*).\n\n### Diagrama de Secuencia\nMuestra el intercambio de mensajes entre objetos a lo largo del tiempo:\n* **Líneas de vida (Lifelines):** Representan la existencia del objeto.\n* **Mensajes síncronos (Flecha sólida):** El emisor espera respuesta antes de continuar.\n* **Mensajes asíncronos (Flecha abierta):** Comunicación sin bloqueo.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 236,
            "title": "Modelado y Documentación Formal",
            "course_id": 109,
            "course_slug": "especificacion-srs-diagramas",
            "course_title": "Especificación Formal (SRS) y Casos de Uso",
            "course": {
                "id": 109,
                "slug": "especificacion-srs-diagramas",
                "title": "Especificación Formal (SRS) y Casos de Uso"
            }
        }
    },
    "arquitectura-web-http-estructura-de-peticiones-y-respuestas-headers-y-body": {
        "id": 602,
        "module_id": 228,
        "title": "Estructura de peticiones y respuestas: Headers y Body",
        "slug": "arquitectura-web-http-estructura-de-peticiones-y-respuestas-headers-y-body",
        "type": "article",
        "duration_minutes": 14,
        "order": 1,
        "is_preview": true,
        "content": "## Estructura de Peticiones y Respuestas HTTP: Headers y Body\n\nEl protocolo HTTP/1.1 y HTTP/2 es la columna vertebral de la web moderna. Cada comunicación entre cliente y servidor se compone de dos mensajes fundamentales:\n\n### Anatomía de una Petición (Request)\n* **Start Line:** Método (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), URI (`/api/v1/cursos`) y versión (`HTTP/1.1`).\n* **Headers clave:**\n  - `Content-Type: application/json` (formato del cuerpo enviado).\n  - `Accept: application/json` (formato esperado en la respuesta).\n  - `Authorization: Bearer <token_jwt>` (credenciales de autenticación sin estado).\n* **Body (Cuerpo):** Payload de datos enviados al servidor (JSON, FormData, binario).\n\n### Anatomía de una Respuesta (Response)\n* **Status Line:** Código de estado y mensaje (`HTTP/1.1 200 OK`).\n* **Headers de respuesta:** `Cache-Control`, `Set-Cookie`, `Access-Control-Allow-Origin`.\n* **Body:** Datos JSON serializados solicitados.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 228,
            "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "arquitectura-web-http-cors-cookies-y-manejo-de-sesiones-sin-estado": {
        "id": 604,
        "module_id": 228,
        "title": "CORS, Cookies y manejo de sesiones sin estado",
        "slug": "arquitectura-web-http-cors-cookies-y-manejo-de-sesiones-sin-estado",
        "type": "article",
        "duration_minutes": 15,
        "order": 3,
        "is_preview": false,
        "content": "## CORS, Cookies y Manejo de Sesiones sin Estado\n\n### ¿Qué es CORS (Cross-Origin Resource Sharing)?\nMecanismo de seguridad del navegador que bloquea peticiones HTTP cross-origin a menos que el servidor devuelva las cabeceras `Access-Control-Allow-Origin` apropiadas.\n* Para peticiones no simples (ej. con método `PUT` o cabecera `Authorization`), el navegador envía una petición previa de prueba (**Preflight**) con método `OPTIONS`.\n\n### Cookies Seguras vs Tokens Bearer\n* **Cookies HttpOnly & SameSite=Lax/Strict:** Mitigan ataques XSS porque JavaScript no puede acceder al token almacenado en `document.cookie`.\n* **Tokens Bearer (JWT):** Ideales para aplicaciones móviles y arquitecturas desacopladas donde el cliente envía el token explícitamente en el header `Authorization`.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 228,
            "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
            "course_id": 102,
            "course_slug": "arquitectura-web-http",
            "course_title": "Protocolo HTTP y Arquitectura Web",
            "course": {
                "id": 102,
                "slug": "arquitectura-web-http",
                "title": "Protocolo HTTP y Arquitectura Web"
            }
        }
    },
    "diseno-apis-restful-estrategias-de-versionado-y-retrocompatibilidad": {
        "id": 606,
        "module_id": 229,
        "title": "Estrategias de versionado y retrocompatibilidad",
        "slug": "diseno-apis-restful-estrategias-de-versionado-y-retrocompatibilidad",
        "type": "article",
        "duration_minutes": 14,
        "order": 2,
        "is_preview": false,
        "content": "## Estrategias de Versionado y Retrocompatibilidad\n\nEl cambio es inevitable en una API en producción. El objetivo del versionado es permitir la evolución sin romper las aplicaciones existentes de los usuarios.\n\n### Estrategias de Versionado\n1. **Versionado por URI (Recomendado):** `/api/v1/cursos` y `/api/v2/cursos`. Fácil de inspeccionar, compatible con caches HTTP y CDNs.\n2. **Versionado por Headers (Content Negotiation):** `Accept: application/vnd.syseng.v2+json`. URLs limpias pero más complejo de probar en navegador.\n\n### Principios de Retrocompatibilidad\n* **Cambio No Destructivo:** Agregar un nuevo campo al JSON de respuesta.\n* **Cambio Destructivo (Breaking Change):** Renombrar o eliminar un campo existente, o cambiar su tipo de dato.",
        "starter_code": null,
        "solution": null,
        "test_cases": null,
        "hint": null,
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 229,
            "title": "Estándares de Diseño de APIs",
            "course_id": 103,
            "course_slug": "diseno-apis-restful",
            "course_title": "Diseño y Versionado de APIs RESTful",
            "course": {
                "id": 103,
                "slug": "diseno-apis-restful",
                "title": "Diseño y Versionado de APIs RESTful"
            }
        }
    },
    "diseno-apis-restful-paginacion-eficiente-y-transformadores-de-datos-api-resources": {
        "id": 607,
        "module_id": 229,
        "title": "Paginación eficiente y transformadores de datos (API Resources)",
        "slug": "diseno-apis-restful-paginacion-eficiente-y-transformadores-de-datos-api-resources",
        "type": "code_challenge",
        "duration_minutes": 24,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Paginación Eficiente y Transformadores de Datos\n\n### Objetivo\nImplementa la función `transformar_y_paginar(usuarios, pagina, por_pagina)` que:\n1. Oculte el campo sensible `\"password_hash\"` de cada usuario.\n2. Divida la lista en páginas según `pagina` (1-indexed) y `por_pagina`.\n3. Retorne un diccionario con:\n   - `\"data\"`: La lista de usuarios transformados para la página solicitada.\n   - `\"meta\"`: `{\"pagina_actual\": pagina, \"total\": len(usuarios), \"total_paginas\": ceil(...) }`.",
        "starter_code": "import math\n\ndef transformar_y_paginar(usuarios: list[dict], pagina: int = 1, por_pagina: int = 2) -> dict:\n    \"\"\"\n    Oculta password_hash y pagina la lista de usuarios.\n    \"\"\"\n    # 1. Transformar limpiando password_hash\n    limpios = [{k: v for k, v in u.items() if k != 'password_hash'} for u in usuarios]\n    \n    # 2. Calcular índices de slicing\n    inicio = (pagina - 1) * por_pagina\n    fin = inicio + por_pagina\n    pagina_data = limpios[inicio:fin]\n    \n    total_paginas = max(1, math.ceil(len(usuarios) / por_pagina))\n    \n    return {\n        \"data\": pagina_data,\n        \"meta\": {\n            \"pagina_actual\": pagina,\n            \"total\": len(usuarios),\n            \"total_paginas\": total_paginas\n        }\n    }\n\n# Prueba:\nusuarios_test = [\n    {\"id\": 1, \"nombre\": \"Ana\", \"password_hash\": \"\\$2y\\$10\\$abc\"},\n    {\"id\": 2, \"nombre\": \"Beto\", \"password_hash\": \"\\$2y\\$10\\$def\"},\n    {\"id\": 3, \"nombre\": \"Carlos\", \"password_hash\": \"\\$2y\\$10\\$ghi\"}\n]\nprint(transformar_y_paginar(usuarios_test, 1, 2))\n",
        "solution": "import math\ndef transformar_y_paginar(usuarios: list[dict], pagina: int = 1, por_pagina: int = 2) -> dict:\n    limpios = [{k: v for k, v in u.items() if k != 'password_hash'} for u in usuarios]\n    inicio = (pagina - 1) * por_pagina\n    fin = inicio + por_pagina\n    return {\n        'data': limpios[inicio:fin],\n        'meta': {\n            'pagina_actual': pagina,\n            'total': len(usuarios),\n            'total_paginas': max(1, math.ceil(len(usuarios) / por_pagina))\n        }\n    }\n",
        "test_cases": [
            {
                "input": "transformar_y_paginar([{'id': 1, 'password_hash': 'x'}], 1, 10)['data'][0].get('password_hash')",
                "expected": "None"
            }
        ],
        "hint": "Usa comprensión de diccionarios para filtrar la clave password_hash y slicing [inicio:fin] para paginar.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 229,
            "title": "Estándares de Diseño de APIs",
            "course_id": 103,
            "course_slug": "diseno-apis-restful",
            "course_title": "Diseño y Versionado de APIs RESTful",
            "course": {
                "id": 103,
                "slug": "diseno-apis-restful",
                "title": "Diseño y Versionado de APIs RESTful"
            }
        }
    },
    "css-moderno-flexbox-grid-reto-construccion-de-una-interfaz-tipo-dashboard-responsiva": {
        "id": 610,
        "module_id": 230,
        "title": "Reto: Construcción de una interfaz tipo dashboard responsiva",
        "slug": "css-moderno-flexbox-grid-reto-construccion-de-una-interfaz-tipo-dashboard-responsiva",
        "type": "code_challenge",
        "duration_minutes": 25,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Construcción de una Interfaz Tipo Dashboard Responsiva\n\nImplementa la estructura de cálculo de layout para un dashboard interactivo que distribuya métricas en columnas dinámicas.",
        "starter_code": "def calcular_columnas_dashboard(ancho_pantalla: int, ancho_minimo_tarjeta: int = 280) -> int:\n    \"\"\"\n    Calcula el numero maximo de columnas responsivas que caben en pantalla.\n    \"\"\"\n    if ancho_pantalla <= 0:\n        return 1\n    columnas = ancho_pantalla // ancho_minimo_tarjeta\n    return max(1, columnas)\n\n# Prueba:\nprint(calcular_columnas_dashboard(1200)) # 4 columnas\nprint(calcular_columnas_dashboard(360))  # 1 columna\n",
        "solution": "def calcular_columnas_dashboard(ancho_pantalla: int, ancho_minimo_tarjeta: int = 280) -> int:\n    if ancho_pantalla <= 0: return 1\n    return max(1, ancho_pantalla // ancho_minimo_tarjeta)\n",
        "test_cases": [
            {
                "input": "calcular_columnas_dashboard(1200, 280)",
                "expected": "4"
            },
            {
                "input": "calcular_columnas_dashboard(320, 280)",
                "expected": "1"
            }
        ],
        "hint": "Usa división entera // entre el ancho de pantalla y el ancho mínimo de tarjeta.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 230,
            "title": "Sistemas de Layout Moderno",
            "course_id": 104,
            "course_slug": "css-moderno-flexbox-grid",
            "course_title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
            "course": {
                "id": 104,
                "slug": "css-moderno-flexbox-grid",
                "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design"
            }
        }
    },
    "typescript-profesional-frontend-reto-modelado-con-tipado-estricto-de-una-api-compleja": {
        "id": 613,
        "module_id": 231,
        "title": "Reto: Modelado con tipado estricto de una API compleja",
        "slug": "typescript-profesional-frontend-reto-modelado-con-tipado-estricto-de-una-api-compleja",
        "type": "code_challenge",
        "duration_minutes": 22,
        "order": 3,
        "is_preview": false,
        "content": "## Reto: Modelado con Tipado Estricto de una API Compleja\n\nEn este reto validarás la estructura de tipos discriminados para eventos de webhook en una pasarela de pagos.",
        "starter_code": "def validar_evento_webhook(evento: dict) -> bool:\n    \"\"\"\n    Valida que el evento tenga un tipo valido y su correspondiente payload obligatorio.\n    Tipos validos: 'pago.completado' (requiere monto y transaccion_id)\n                   'pago.fallido' (requiere motivo)\n    \"\"\"\n    tipo = evento.get('tipo')\n    if tipo == 'pago.completado':\n        return 'monto' in evento and 'transaccion_id' in evento\n    elif tipo == 'pago.fallido':\n        return 'motivo' in evento\n    return False\n\n# Prueba:\nprint(validar_evento_webhook({'tipo': 'pago.completado', 'monto': 99.0, 'transaccion_id': 'tx_123'})) # True\n",
        "solution": "def validar_evento_webhook(evento: dict) -> bool:\n    tipo = evento.get('tipo')\n    if tipo == 'pago.completado':\n        return 'monto' in evento and 'transaccion_id' in evento\n    elif tipo == 'pago.fallido':\n        return 'motivo' in evento\n    return False\n",
        "test_cases": [
            {
                "input": "{'tipo': 'pago.completado', 'monto': 10, 'transaccion_id': 'tx_1'}",
                "expected": "True"
            },
            {
                "input": "{'tipo': 'pago.fallido', 'motivo': 'fondos insuficientes'}",
                "expected": "True"
            },
            {
                "input": "{'tipo': 'desconocido'}",
                "expected": "False"
            }
        ],
        "hint": "Usa sentencias if/elif evaluando la clave 'tipo' y verificando la presencia de campos obligatorios.",
        "language": "python",
        "completed": false,
        "quiz": null,
        "module": {
            "id": 231,
            "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
            "course_id": 105,
            "course_slug": "typescript-profesional-frontend",
            "course_title": "TypeScript Profesional para Aplicaciones Frontend",
            "course": {
                "id": 105,
                "slug": "typescript-profesional-frontend",
                "title": "TypeScript Profesional para Aplicaciones Frontend"
            }
        }
    }
};
