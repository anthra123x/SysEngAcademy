<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Module;
use App\Models\Lesson;
use App\Models\Category;
use App\Models\LearningPath;
use App\Models\LearningPathLevel;
use App\Models\User;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $instructor = User::where('role', 'instructor')->first();
        $basicCat   = Category::where('slug', 'programacion-basica')->first();
        $algoCat    = Category::where('slug', 'algoritmos')->first();
        $dbCat      = Category::where('slug', 'bases-de-datos')->first();
        $webCat     = Category::where('slug', 'desarrollo-web')->first();

        $path1      = LearningPath::where('slug', 'fundamentos-programacion')->first();
        $path1Lvl1  = LearningPathLevel::where('learning_path_id', $path1?->id)->where('order', 1)->first();

        // Curso 1: Introducción a la Programación (dentro de la ruta)
        $course1 = Course::firstOrCreate(['slug' => 'introduccion-programacion'], [
            'title'                  => 'Introducción a la Programación',
            'description'            => 'Aprende los fundamentos absolutos de la programación. Sin experiencia previa requerida. Cubriremos variables, tipos de datos, estructuras de control y funciones básicas con ejemplos prácticos.',
            'category_id'            => $basicCat?->id,
            'instructor_id'          => $instructor?->id,
            'is_published'           => true,
            'is_free'                => true,
            'duration_hours'         => 12,
            'difficulty'             => 'beginner',
            'learning_path_id'       => $path1?->id,
            'learning_path_level_id' => $path1Lvl1?->id,
            'order'                  => 1,
        ]);

        $mod1 = Module::firstOrCreate(['course_id' => $course1->id, 'order' => 1], [
            'title'       => 'Variables y Tipos de Datos',
            'description' => 'Todo lo que necesitas saber sobre cómo almacenar información.',
        ]);
        Lesson::firstOrCreate(['slug' => 'que-es-una-variable'], [
            'module_id'        => $mod1->id,
            'title'            => '¿Qué es una variable?',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 10,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'Una variable es un espacio en memoria con un nombre que almacena un valor que puede cambiar durante la ejecución del programa...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'tipos-de-datos-basicos'], [
            'module_id'        => $mod1->id,
            'title'            => 'Tipos de datos básicos',
            'order'            => 2,
            'type'             => 'article',
            'duration_minutes' => 15,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'Los tipos de datos fundamentales son: enteros (int), decimales (float), cadenas (string) y booleanos (bool)...'],
        ]);

        $mod2 = Module::firstOrCreate(['course_id' => $course1->id, 'order' => 2], [
            'title'       => 'Estructuras de Control',
            'description' => 'Condicionales y ciclos para controlar el flujo de tu programa.',
        ]);
        Lesson::firstOrCreate(['slug' => 'condicionales-if-else'], [
            'module_id'        => $mod2->id,
            'title'            => 'Condicionales: if, else, elif',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 20,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'Los condicionales permiten ejecutar bloques de código solo cuando se cumple una condición...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'ciclos-for-while'], [
            'module_id'        => $mod2->id,
            'title'            => 'Ciclos: for y while',
            'order'            => 2,
            'type'             => 'article',
            'duration_minutes' => 25,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'Los ciclos permiten repetir un bloque de código múltiples veces...'],
        ]);

        // Curso 2: Algoritmos de Ordenamiento (curso independiente)
        $course2 = Course::firstOrCreate(['slug' => 'algoritmos-ordenamiento'], [
            'title'          => 'Algoritmos de Ordenamiento',
            'description'    => 'Estudia los algoritmos de ordenamiento más importantes: Bubble Sort, Selection Sort, Merge Sort, Quick Sort. Aprende a analizar su complejidad temporal y espacial con Big-O notation.',
            'category_id'    => $algoCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 8,
            'difficulty'     => 'intermediate',
        ]);

        $mod3 = Module::firstOrCreate(['course_id' => $course2->id, 'order' => 1], [
            'title' => 'Introducción a la Complejidad',
        ]);
        Lesson::firstOrCreate(['slug' => 'notacion-big-o'], [
            'module_id'        => $mod3->id,
            'title'            => 'Notación Big-O',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 20,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'La notación Big-O describe el comportamiento asintótico de un algoritmo...'],
        ]);

        // Curso 3: SQL desde Cero
        $course3 = Course::firstOrCreate(['slug' => 'sql-desde-cero'], [
            'title'          => 'SQL desde Cero',
            'description'    => 'Aprende SQL de manera práctica. Desde SELECT básicos hasta JOINs complejos, subconsultas, índices y optimización de consultas. Ideal para cualquier estudiante de ingeniería.',
            'category_id'    => $dbCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 10,
            'difficulty'     => 'beginner',
        ]);

        $mod4 = Module::firstOrCreate(['course_id' => $course3->id, 'order' => 1], [
            'title' => 'Fundamentos de SQL',
        ]);
        Lesson::firstOrCreate(['slug' => 'que-es-sql-y-bases-de-datos'], [
            'module_id'        => $mod4->id,
            'title'            => '¿Qué es SQL y las bases de datos relacionales?',
            'order'            => 1,
            'type'             => 'article',
            'duration_minutes' => 15,
            'is_preview'       => true,
            'content'          => ['type' => 'doc', 'text' => 'SQL (Structured Query Language) es el lenguaje estándar para gestionar bases de datos relacionales...'],
        ]);
        Lesson::firstOrCreate(['slug' => 'primer-select'], [
            'module_id'        => $mod4->id,
            'title'            => 'Tu primer SELECT',
            'order'            => 2,
            'type'             => 'code_challenge',
            'duration_minutes' => 20,
            'is_preview'       => false,
            'content'          => ['type' => 'doc', 'text' => 'La sentencia SELECT es la más usada en SQL y permite consultar datos de una tabla...'],
        ]);

        // Curso 4: Introducción al Desarrollo Web
        Course::firstOrCreate(['slug' => 'intro-desarrollo-web'], [
            'title'          => 'Introducción al Desarrollo Web',
            'description'    => 'Aprende los fundamentos del desarrollo web: HTML, CSS y JavaScript. Crea tus primeras páginas web interactivas desde cero hasta un proyecto personal funcional.',
            'category_id'    => $webCat?->id,
            'instructor_id'  => $instructor?->id,
            'is_published'   => true,
            'is_free'        => true,
            'duration_hours' => 15,
            'difficulty'     => 'beginner',
        ]);

        // =====================================================================
        // CONTENIDO NUEVO: rutas especializadas
        // =====================================================================

        $backendCat = Category::where('slug', 'desarrollo-backend')->first();
        $frontCat   = Category::where('slug', 'desarrollo-frontend')->first();
        $webCat     = Category::where('slug', 'desarrollo-web')->first();
        $devopsCat  = Category::where('slug', 'devops')->first();
        $gitCat     = Category::where('slug', 'git')->first();
        $reqCat     = Category::where('slug', 'ingenieria-software')->first();
        $aiCat      = Category::where('slug', 'ia-desarrollo')->first();

        $paths = [
            'backend'  => LearningPath::where('slug', 'desarrollo-backend')->first(),
            'frontend' => LearningPath::where('slug', 'desarrollo-frontend')->first(),
            'fullstack'=> LearningPath::where('slug', 'desarrollo-fullstack')->first(),
            'devops'   => LearningPath::where('slug', 'devops')->first(),
            'git'      => LearningPath::where('slug', 'git-y-control-versiones')->first(),
            'req'      => LearningPath::where('slug', 'ingenieria-de-requerimientos')->first(),
            'ia'       => LearningPath::where('slug', 'desarrollo-con-ia')->first(),
        ];

        $lvl = fn (?LearningPath $p, int $o): ?int => $p
            ? LearningPathLevel::where('learning_path_id', $p->id)->where('order', $o)->value('id')
            : null;

        // --- Ruta Desarrollo Backend ---
        $this->makeFullCourse([
            'slug' => 'backend-introduccion', 'title' => 'Introducción al Backend',
            'description' => 'Descubre qué pasa del lado del servidor: el modelo cliente-servidor, HTTP y el rol del backend en una aplicación moderna. La base para diseñar cualquier API.',
            'category_id' => $backendCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 10, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['backend']?->id, 'learning_path_level_id' => $lvl($paths['backend'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'El mundo del Backend', 'lessons' => [
                ['slug' => 'que-es-backend', 'title' => '¿Qué es el Backend?', 'order' => 1, 'duration' => 12, 'preview' => true,
                 'content' => 'El backend es la parte de una aplicación que corre en el servidor: procesa peticiones, consulta bases de datos, aplica reglas de negocio y devuelve respuestas. Mientras el frontend se encarga de lo que el usuario ve, el backend garantiza que los datos lleguen de forma segura y consistente. Un backend típico incluye un servidor web, la aplicación con la lógica de negocio y una base de datos.'],
                ['slug' => 'modelo-cliente-servidor', 'title' => 'El modelo Cliente-Servidor', 'order' => 2, 'duration' => 15,
                 'content' => 'En el modelo cliente-servidor, el cliente (navegador, app móvil u otro servicio) envía peticiones y el servidor responde. Este desacople separa la presentación de la lógica de negocio, permite escalar cada parte por separado y es la base de casi todas las aplicaciones web modernas. Las variantes como el cliente grueso procesan parte de la lógica localmente, reduciendo la carga del servidor.'],
                ['slug' => 'http-y-sus-metodos', 'title' => 'HTTP y sus métodos', 'order' => 3, 'duration' => 20,
                 'content' => 'HTTP define cómo se comunican cliente y servidor. Cada petición tiene un método (GET, POST, PUT, DELETE, PATCH), una URL, cabeceras y opcionalmente un cuerpo. Los códigos de estado resumen el resultado: 2xx éxito, 3xx redirección, 4xx error del cliente y 5xx error del servidor. Comprender bien HTTP es el primer paso para diseñar APIs correctas y debugar servicios.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'apis-rest-con-laravel', 'title' => 'APIs REST con Laravel',
            'description' => 'Diseña e implementa APIs REST profesionales con Laravel: recursos, validación, respuestas JSON consistentes y manejo de errores. Todo lo necesario para exponer tu lógica de negocio.',
            'category_id' => $backendCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 15, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['backend']?->id, 'learning_path_level_id' => $lvl($paths['backend'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Principios REST', 'lessons' => [
                ['slug' => 'principios-rest', 'title' => 'Principios de diseño REST', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'REST es un estilo arquitectónico basado en recursos identificados por URLs y operados con métodos HTTP. Una API REST bien diseñada usa plurales para los recursos, respeta la semántica de los métodos y devuelve códigos de estado adecuados. También aprovecha el cacheo HTTP y versiona la API para no romper a los consumidores cuando evoluciona.'],
                ['slug' => 'rutas-y-controladores', 'title' => 'Rutas y controladores', 'order' => 2, 'duration' => 18,
                 'content' => 'En Laravel las rutas se registran en routes/api.php y delegan en controladores. Los controladores agrupan la lógica de un recurso y usan Request y Response tipados. Con resource controllers obtienes las acciones REST estándar: index, store, show, update y destroy, listas para personalizar.'],
                ['slug' => 'validacion-y-respuestas-json', 'title' => 'Validación y respuestas JSON', 'order' => 3, 'duration' => 20,
                 'content' => 'Toda entrada del usuario debe validarse antes de tocar la base de datos. Laravel ofrece reglas declarativas (required, email, unique, max...) y devuelve errores en JSON automáticamente. Las respuestas deben tener forma consistente: datos bajo una clave data, errores con su mensaje y siempre Content-Type application/json.'],
            ]],
            ['order' => 2, 'title' => 'REST en la práctica', 'lessons' => [
                ['slug' => 'manejo-de-errores', 'title' => 'Manejo de errores 4xx y 5xx', 'order' => 1, 'duration' => 15,
                 'content' => 'Una API debe responder errores con información útil: 404 cuando el recurso no existe, 422 cuando la validación falla y 500 para fallos inesperados (sin exponer detalles internos). Define una estructura común para errores, por ejemplo {message, errors}, y documenta los códigos posibles para cada endpoint.'],
                ['slug' => 'probando-apis-con-curl', 'title' => 'Probando APIs con curl', 'order' => 2, 'duration' => 12,
                 'content' => 'curl es la herramienta esencial para probar endpoints: -X para el método, -H para cabeceras y -d para el cuerpo. Con --max-time evitas peticiones colgadas y con -w puedes medir tiempos. Postman o Thunder Client añaden interfaz visual, colecciones reutilizables y pruebas automatizadas sobre la misma API.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'modelos-relaciones-y-consultas', 'title' => 'Modelos, Relaciones y Consultas',
            'description' => 'Domina Eloquent: migraciones que versionan el esquema, relaciones que conectan tablas y consultas eficientes que evitan el problema N+1.',
            'category_id' => $backendCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 12, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['backend']?->id, 'learning_path_level_id' => $lvl($paths['backend'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'Eloquent y el modelo de datos', 'lessons' => [
                ['slug' => 'modelos-y-migraciones', 'title' => 'Modelos y migraciones en Eloquent', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Las migraciones versionan el esquema de la base de datos y los modelos Eloquent representan tablas en código, mapeando cada fila a un objeto PHP con una sintaxis fluida. Las migraciones se ejecutan en orden y se pueden revertir, lo que convierte el esquema en parte del repositorio y permite reproducir la BD en cualquier entorno.'],
                ['slug' => 'relaciones-uno-a-muchos', 'title' => 'Relaciones uno a muchos y muchos a muchos', 'order' => 2, 'duration' => 18,
                 'content' => 'Las relaciones definen cómo se conectan las tablas: hasMany/belongsTo para uno a muchos, belongsToMany para muchos a muchos. Declararlas en el modelo permite encadenar consultas como course->lessons y cargar relaciones con with() para evitar el problema N+1: una consulta por el recurso y otra por cada relación, en vez de una por fila.'],
                ['slug' => 'consultas-e-indices', 'title' => 'Consultas eficientes e índices', 'order' => 3, 'duration' => 20,
                 'content' => 'Una consulta eficiente nace de un buen índice y de seleccionar solo lo necesario: usa select() para no traer columnas extra, paginate() para listas grandes y agrega índices a las columnas que filtras con where u ordenas. Evita consultas dentro de bucles y revisa las queries generadas con toSql() o un logger de queries.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'seguridad-en-apis', 'title' => 'Seguridad en APIs',
            'description' => 'Protege tus servicios: autenticación con tokens, vulnerabilidades OWASP más comunes y manejo seguro de secretos. La seguridad no es un extra, es parte del diseño.',
            'category_id' => $backendCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['backend']?->id, 'learning_path_level_id' => $lvl($paths['backend'], 4), 'order' => 4,
        ], [
            ['order' => 1, 'title' => 'Autenticación y protección', 'lessons' => [
                ['slug' => 'autenticacion-con-tokens', 'title' => 'Autenticación con tokens (Sanctum)', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Laravel Sanctum ofrece un sistema de tokens para SPAs y clientes móviles: el usuario inicia sesión, recibe un token y lo envía en el header Authorization: Bearer. Los tokens pueden tener habilidades (abilities), expirar y revocarse individualmente. Es la forma estándar de autenticar APIs sin estado en Laravel.'],
                ['slug' => 'owasp-para-desarrolladores', 'title' => 'OWASP Top 10 para desarrolladores', 'order' => 2, 'duration' => 18,
                 'content' => 'El OWASP Top 10 agrupa los riesgos más comunes: inyección SQL, XSS, rotura de autenticación, exposición de datos sensibles, control de acceso roto y más. Prevenirlos es cuestión de buenas prácticas: sentencias preparadas, escape de salida, rate limiting y no confiar nunca en la entrada del usuario. Revisar esta lista al diseñar cada endpoint ahorra incidentes graves.'],
                ['slug' => 'secretos-y-variables-de-entorno', 'title' => 'Secretos y variables de entorno', 'order' => 3, 'duration' => 10,
                 'content' => 'Nunca se deben commitear claves ni credenciales: se guardan en .env (fuera de Git) y en producción se inyectan mediante el gestor de secretos del proveedor (Vault, secretos de la nube, CI). Mantener el código libre de datos sensibles, rotar las claves periódicamente y auditar los repositorios evita fugas que son difíciles de revertir.'],
            ]],
        ]);

        // --- Ruta Desarrollo Frontend ---
        $this->makeFullCourse([
            'slug' => 'html-css-javascript', 'title' => 'HTML, CSS y JavaScript',
            'description' => 'Los tres pilares de la web: estructura semántica, maquetación moderna con Flexbox y Grid, e interactividad con el DOM. Construye tus primeras interfaces desde cero.',
            'category_id' => $frontCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 15, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['frontend']?->id, 'learning_path_level_id' => $lvl($paths['frontend'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'Semántica y estilos', 'lessons' => [
                ['slug' => 'estructura-de-una-pagina-html', 'title' => 'Estructura semántica de una página HTML', 'order' => 1, 'duration' => 12, 'preview' => true,
                 'content' => 'HTML describe la estructura: header, nav, main, section, article y footer son etiquetas semánticas que comunican significado a navegadores y lectores de pantalla. Una buena estructura mejora la accesibilidad, el SEO y el mantenimiento del código, y evita el uso excesivo de divs genéricos.'],
                ['slug' => 'css-flexbox-y-grid', 'title' => 'Flexbox y Grid: maquetación moderna', 'order' => 2, 'duration' => 20,
                 'content' => 'Flexbox organiza elementos en una dimensión (fila o columna) y Grid en dos. Con display:flex y display:grid se resuelven la mayoría de los layouts sin floats ni trucos. La clave está en dominar los ejes (justify-content, align-items) y las plantillas (grid-template-columns, áreas nombradas).'],
                ['slug' => 'javascript-dom-y-eventos', 'title' => 'JavaScript: el DOM y los eventos', 'order' => 3, 'duration' => 25,
                 'content' => 'JavaScript da interactividad: selecciona elementos con querySelector, escucha eventos con addEventListener y modifica el DOM. Entender el flujo de eventos (captura y burbuja) evita bugs sutiles, y conocer el render del navegador ayuda a escribir interfaces fluidas. Solo con manipulación del DOM puedes construir aplicaciones dinámicas completas.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'angular-moderno', 'title' => 'Angular Moderno',
            'description' => 'Frameworks para apps reales: componentes standalone, control flow y Signals. Aprende a estructurar una aplicación Angular con servicios HTTP, routing y lazy loading.',
            'category_id' => $frontCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 18, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['frontend']?->id, 'learning_path_level_id' => $lvl($paths['frontend'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Fundamentos de Angular', 'lessons' => [
                ['slug' => 'componentes-y-templates', 'title' => 'Componentes y templates', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Angular organiza la UI en componentes: cada uno tiene template, estilos y clase. Con las standalone components, declaradas en la propiedad imports, ya no hace falta NgModule para la mayoría de los casos. La interpolación {{ }} y el data binding conectan el estado de la clase con el template de forma reactiva.'],
                ['slug' => 'control-flow-y-comunicacion', 'title' => 'Control flow, inputs y outputs', 'order' => 2, 'duration' => 18,
                 'content' => 'Los bloques @if, @for y @switch sustituyen a *ngIf y *ngFor con una sintaxis más legible y mejor rendimiento. La comunicación padre-hijo se hace con @Input y @Output: el padre pasa datos y el hijo notifica eventos, manteniendo el flujo de datos predecible.'],
                ['slug' => 'estado-con-signals', 'title' => 'Estado con Signals', 'order' => 3, 'duration' => 20,
                 'content' => 'Las señales son la forma reactiva de gestionar estado en Angular: signal() declara, .set() y .update() modifican, y computed() deriva valores que se recalculan automáticamente. El framework detecta los cambios con precisión y eficiencia, reduciendo la dependencia de Zone.js.'],
            ]],
            ['order' => 2, 'title' => 'Apps reales', 'lessons' => [
                ['slug' => 'http-client-y-servicios', 'title' => 'HTTP Client y servicios', 'order' => 1, 'duration' => 18,
                 'content' => 'Los servicios encapsulan la lógica de negocio y las llamadas al backend: HttpClient devuelve Observables de RxJS que se componen con operadores como map, catchError y switchMap. Inyectarlos mediante dependency injection mantiene los componentes limpios y las peticiones centralizadas en un solo lugar.'],
                ['slug' => 'router-y-lazy-loading', 'title' => 'Router y lazy loading', 'order' => 2, 'duration' => 15,
                 'content' => 'El router enruta URLs a componentes y habilita el lazy loading: cada ruta carga su módulo o componente bajo demanda, reduciendo el bundle inicial. Guards y resolvers protegen rutas según autenticación o roles y preparan datos antes de renderizar la vista.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'accesibilidad-y-performance-web', 'title' => 'Accesibilidad y Performance Web',
            'description' => 'Haz tu interfaz usable para todas las personas y rápida para todos los dispositivos: criterios WCAG y métricas Core Web Vitals en la práctica.',
            'category_id' => $frontCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['frontend']?->id, 'learning_path_level_id' => $lvl($paths['frontend'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'Buenas prácticas', 'lessons' => [
                ['slug' => 'accesibilidad-wcag', 'title' => 'Accesibilidad: WCAG en la práctica', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'WCAG define criterios para que la web sea usable por todas las personas: contraste suficiente, alternativas de texto, navegación por teclado y roles ARIA. La accesibilidad no es opcional: es una característica de calidad que beneficia a todos los usuarios, incluidos los de tecnologías de asistencia.'],
                ['slug' => 'core-web-vitals', 'title' => 'Core Web Vitals y performance', 'order' => 2, 'duration' => 18,
                 'content' => 'LCP, INP y CLS son las métricas que evalúan la experiencia real: cuánto tarda en cargar el contenido principal, la latencia de interacción y la estabilidad visual. Optimizar imágenes, minificar el JavaScript crítico y usar lazy loading son palancas directas para mejorar estas métricas.'],
            ]],
        ]);

        // --- Ruta Full Stack ---
        $this->makeFullCourse([
            'slug' => 'integracion-frontend-backend', 'title' => 'Integración Frontend ↔ Backend',
            'description' => 'Convierte la API en un contrato vivo entre equipos: documentación, manejo de CORS y tokens desde el frontend, y un flujo de datos sin fricción.',
            'category_id' => $webCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 12, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['fullstack']?->id, 'learning_path_level_id' => $lvl($paths['fullstack'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'La API como contrato', 'lessons' => [
                ['slug' => 'api-como-contrato', 'title' => 'La API como contrato entre equipos', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'En una aplicación fullstack, la API es el contrato entre frontend y backend. Definir endpoints, esquemas de respuesta y códigos de error por adelantado evita fricción entre equipos. Herramientas como OpenAPI documentan el contrato y permiten generar clientes tipados y mocks para desarrollar en paralelo.'],
                ['slug' => 'cors-y-token-bearer', 'title' => 'CORS y tokens Bearer desde el frontend', 'order' => 2, 'duration' => 18,
                 'content' => 'El navegador aplica CORS para proteger al usuario: el backend debe permitir el origen del frontend y los métodos y cabeceras usados. En el frontend, el token se envía en cada petición mediante un interceptor HTTP y los errores 401 se manejan globalmente para redirigir a login. Este patrón es el corazón de las SPAs autenticadas.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'autenticacion-jwt-web', 'title' => 'Autenticación JWT de punta a punta',
            'description' => 'Implementa login, registro y rutas protegidas en toda la pila: cómo funciona un JWT, dónde guardarlo y cómo proteger el frontend con guards.',
            'category_id' => $webCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 10, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['fullstack']?->id, 'learning_path_level_id' => $lvl($paths['fullstack'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Sesión y tokens', 'lessons' => [
                ['slug' => 'como-funciona-jwt', 'title' => '¿Cómo funciona un JWT?', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Un JWT es un token firmado con tres partes: header, payload y firma. El servidor lo firma y el cliente lo envía en cada petición, de modo que no hace falta sesión en el servidor: la API es sin estado. Debe tener expiración, viajar siempre por HTTPS y nunca contener datos sensibles en el payload.'],
                ['slug' => 'login-registro-y-guards', 'title' => 'Flujo login/registro y guards de ruta', 'order' => 2, 'duration' => 20,
                 'content' => 'El flujo típico: el usuario se registra o inicia sesión, el backend devuelve token y datos del usuario, el frontend lo guarda (localStorage o SessionStorage) y los guards de ruta protegen las páginas privadas. Al cerrar sesión se invalida el token en el backend y se limpia el estado local del navegador.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'despliegue-fullstack', 'title' => 'Despliegue Full Stack',
            'description' => 'Lleva tu aplicación a producción: build optimizado, variables de entorno y servir estáticos y API detrás de un reverse proxy.',
            'category_id' => $devopsCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'advanced',
            'learning_path_id' => $paths['fullstack']?->id, 'learning_path_level_id' => $lvl($paths['fullstack'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'De producción', 'lessons' => [
                ['slug' => 'build-y-variables-de-produccion', 'title' => 'Build de producción y variables de entorno', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'El build de producción minifica y optimiza los assets del frontend; las variables de entorno (URL de la API, claves públicas) se inyectan en tiempo de build o en el servidor. Nunca "hardcodees" URLs de desarrollo: un mismo código debe desplegarse en staging o producción cambiando solo la configuración.'],
                ['slug' => 'estaticos-y-reverse-proxy', 'title' => 'Servir estáticos con un reverse proxy', 'order' => 2, 'duration' => 15,
                 'content' => 'En producción el frontend se sirve como estático (NGINX, Vercel, Netlify) y el backend queda detrás de un reverse proxy que gestiona TLS, compresión y balanceo. El proxy redirige /api/* al backend y el resto de rutas a la SPA, permitiendo compartir dominio y evitar problemas de CORS.'],
            ]],
        ]);

        // --- Ruta DevOps ---
        $this->makeFullCourse([
            'slug' => 'linux-y-linea-de-comandos', 'title' => 'Linux y Línea de Comandos',
            'description' => 'La terminal es el hogar del devops: comandos esenciales, pipes, permisos y gestión de procesos. La base para operar servidores reales.',
            'category_id' => $devopsCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 10, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['devops']?->id, 'learning_path_level_id' => $lvl($paths['devops'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'La terminal', 'lessons' => [
                ['slug' => 'comandos-esenciales-linux', 'title' => 'Comandos esenciales de Linux', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'ls, cd, grep, awk, find y sed resuelven la mayoría de las tareas cotidianas en Linux. Aprender a encadenarlos con pipes convierte comandos simples en herramientas potentes, y herramientas como jq hacen lo mismo con JSON. La terminal sigue siendo el entorno más rápido y universal para operar sistemas.'],
                ['slug' => 'permisos-y-procesos', 'title' => 'Permisos, usuarios y procesos', 'order' => 2, 'duration' => 18,
                 'content' => 'Linux protege los archivos con permisos rwx por usuario, grupo y otros. ps, top y systemctl permiten ver y gestionar procesos y servicios; kill y systemctl stop controlan su ciclo de vida. Entender usuarios, grupos y procesos es imprescindible para administrar servidores con seguridad.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'docker-y-contenedores', 'title' => 'Docker y Contenedores',
            'description' => 'Empaqueta tu aplicación con sus dependencias: imágenes, Dockerfile, Docker Compose y por qué los contenedores cambiaron el despliegue de software.',
            'category_id' => $devopsCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 12, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['devops']?->id, 'learning_path_level_id' => $lvl($paths['devops'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Contenedores', 'lessons' => [
                ['slug' => 'que-es-un-contenedor', 'title' => '¿Qué es un contenedor?', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Un contenedor empaqueta la aplicación con sus dependencias para que corra igual en cualquier máquina. A diferencia de una máquina virtual, comparte el kernel del host, por lo que es ligero, arranca en segundos y consume menos recursos. La inmutabilidad de la imagen garantiza que lo que pruebas localmente es lo que se despliega.'],
                ['slug' => 'dockerfile-y-compose', 'title' => 'Dockerfile y Docker Compose', 'order' => 2, 'duration' => 20,
                 'content' => 'El Dockerfile describe la imagen paso a paso: imagen base, dependencias, código y comando de arranque. Compose orquesta varios servicios (app, base de datos, caché) con un solo archivo YAML, ideal para desarrollo local y pruebas. Con multi-stage builds se obtienen imágenes finales mínimas y seguras.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'ci-cd-github-actions', 'title' => 'CI/CD con GitHub Actions',
            'description' => 'Automatiza tests, builds y despliegues en cada cambio: conceptos de integración y despliegue continuos y workflows prácticos con GitHub Actions.',
            'category_id' => $devopsCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['devops']?->id, 'learning_path_level_id' => $lvl($paths['devops'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'Pipelines', 'lessons' => [
                ['slug' => 'que-es-ci-cd', 'title' => 'Integración y despliegue continuos', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'CI ejecuta tests y builds automáticamente en cada cambio; CD despliega a producción cuando el pipeline pasa. Esto acelera las entregas y reduce errores humanos: si el pipeline falla, el código no llega a producción. La disciplina de CI/CD convierte el despliegue en algo rutinario y reversible en lugar de un evento de riesgo.'],
                ['slug' => 'github-actions-en-practica', 'title' => 'GitHub Actions en la práctica', 'order' => 2, 'duration' => 20,
                 'content' => 'Un workflow de GitHub Actions se define en .github/workflows con jobs (test, build, deploy) y steps reutilizables. Los secretos se guardan en los ajustes del repositorio, los artefactos pasan resultados entre jobs y los triggers (push, pull_request, schedule) disparan los pipelines automáticamente.'],
            ]],
        ]);

        // --- Ruta Git ---
        $this->makeFullCourse([
            'slug' => 'git-desde-cero', 'title' => 'Git desde Cero',
            'description' => 'El control de versiones que usan todos los equipos: repositorios, commits y el ciclo básico de trabajo con Git.',
            'category_id' => $gitCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 6, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['git']?->id, 'learning_path_level_id' => $lvl($paths['git'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'Primeros pasos', 'lessons' => [
                ['slug' => 'que-es-git', 'title' => '¿Qué es Git y por qué usarlo?', 'order' => 1, 'duration' => 10, 'preview' => true,
                 'content' => 'Git es un sistema de control de versiones distribuido: cada copia del repositorio contiene toda la historia. Permite experimentar sin miedo porque los cambios son reversibles, y colaborar en paralelo sin pisarse gracias a las ramas. El 90% de las empresas de software usa Git, por lo que es una habilidad imprescindible.'],
                ['slug' => 'primeros-commits', 'title' => 'Tus primeros commits', 'order' => 2, 'duration' => 15,
                 'content' => 'El ciclo básico es: git init o git clone, git add para preparar los cambios en el área de staging, y git commit para guardarlos con un mensaje descriptivo. git status muestra el estado del repositorio y git log la historia de commits. Un commit pequeño y atómico es más fácil de revisar y revertir.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'git-colaboracion-y-flujos', 'title' => 'Colaboración y Flujos de Trabajo',
            'description' => 'Trabaja en equipo de forma profesional: ramas, pull requests, Conventional Commits y resolución de conflictos.',
            'category_id' => $gitCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 6, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['git']?->id, 'learning_path_level_id' => $lvl($paths['git'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Trabajo en equipo', 'lessons' => [
                ['slug' => 'ramas-y-pull-requests', 'title' => 'Ramas, merge y pull requests', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Las ramas aíslan el trabajo: feature/x se crea desde main, se desarrolla y se integra con merge o pull request. La PR es el momento de revisión de código, discusión y tests automáticos antes de integrar. Mantener las ramas cortas y enfocadas acelera la revisión y reduce los conflictos.'],
                ['slug' => 'conventional-commits-y-conflictos', 'title' => 'Conventional Commits y resolución de conflictos', 'order' => 2, 'duration' => 18,
                 'content' => 'Conventional Commits (feat, fix, chore, docs...) da estructura a los mensajes y habilita changelogs y versionado semántico automáticos. Los conflictos aparecen cuando dos ramas tocan las mismas líneas: se resuelven editando el archivo (marcadores <<<<<<< ======= >>>>>>>), probando y completando el merge.'],
            ]],
        ]);

        // --- Ruta Ingeniería de Requerimientos ---
        $this->makeFullCourse([
            'slug' => 'fundamentos-requerimientos', 'title' => 'Fundamentos de Ingeniería de Requerimientos',
            'description' => 'Qué son los requerimientos, sus tipos y por qué los errores en esta fase son los más caros de corregir. La base de todo proyecto de software.',
            'category_id' => $reqCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 6, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['req']?->id, 'learning_path_level_id' => $lvl($paths['req'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'Conceptos clave', 'lessons' => [
                ['slug' => 'requerimientos-funcionales-y-no', 'title' => 'Requerimientos funcionales y no funcionales', 'order' => 1, 'duration' => 12, 'preview' => true,
                 'content' => 'Un requerimiento funcional describe qué debe hacer el sistema; uno no funcional, cómo debe hacerlo: rendimiento, seguridad, usabilidad, disponibilidad. Ambos son necesarios: una app rápida que no hace lo pedido y una que lo hace pero es lenta son igual de fallidas. Documentar ambos evita malentendidos con el cliente y malas decisiones técnicas.'],
                ['slug' => 'coste-de-los-errores', 'title' => 'El coste de los errores de requerimientos', 'order' => 2, 'duration' => 10,
                 'content' => 'Un error de requerimientos es el más caro de corregir: detectado en la fase de análisis cuesta unidades, en desarrollo decenas y en producción cientos. La buena noticia: es el más fácil de evitar con elicitación cuidadosa, validación temprana y prototipos. Invertir tiempo en entender el problema antes de codificar es la decisión más rentable del proyecto.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'historias-de-usuario-y-casos-de-uso', 'title' => 'Historias de Usuario y Casos de Uso',
            'description' => 'Modela lo que el usuario necesita: historias de usuario con criterios de aceptación y casos de uso con actores y flujos.',
            'category_id' => $reqCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['req']?->id, 'learning_path_level_id' => $lvl($paths['req'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Técnicas de modelado', 'lessons' => [
                ['slug' => 'historias-de-usuario', 'title' => 'Historias de usuario con criterios de aceptación', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Las historias de usuario son descripciones cortas desde la perspectiva del usuario: "Como [rol], quiero [capacidad], para [beneficio]". Los criterios de aceptación definen cuándo está terminada y la convierten en algo testeable. Historias pequeñas y con valor claro permiten priorizar y entregar incrementos frecuentes.'],
                ['slug' => 'casos-de-uso', 'title' => 'Casos de uso: actores y flujos', 'order' => 2, 'duration' => 18,
                 'content' => 'El caso de uso describe una interacción entre actores y sistema: flujo principal, alternativas y excepciones. Es ideal para sistemas con procesos complejos donde hace falta detalle secuencial. Combinado con diagramas de secuencia, permite validar el comportamiento completo antes de escribir código.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'gestion-de-requerimientos', 'title' => 'Gestión y Trazabilidad de Requerimientos',
            'description' => 'Prioriza con MoSCoW, mantén la trazabilidad entre requisito y código, y gestiona el cambio sin que el proyecto colapse.',
            'category_id' => $reqCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 6, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['req']?->id, 'learning_path_level_id' => $lvl($paths['req'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'Gestión del cambio', 'lessons' => [
                ['slug' => 'priorizacion-moscow', 'title' => 'Priorización con MoSCoW', 'order' => 1, 'duration' => 12, 'preview' => true,
                 'content' => 'MoSCoW clasifica los requerimientos en Must, Should, Could y Won\'t. Priorizar es gestionar el alcance: los Must definen el mínimo viable y el resto se entrega si hay capacidad. Sin priorización, todo es urgente y nada se termina; con ella, el equipo siempre sabe qué recortar cuando el tiempo se agota.'],
                ['slug' => 'trazabilidad-y-gestion-del-cambio', 'title' => 'Trazabilidad y gestión del cambio', 'order' => 2, 'duration' => 15,
                 'content' => 'La trazabilidad conecta cada requerimiento con su origen y su implementación: si cambia un requisito, sabes qué código, tests y documentos toca. Los requerimientos cambian inevitablemente; la disciplina de gestión del cambio (baselines, control de versiones, evaluación de impacto) es lo que evita que el proyecto colapse ante esas variaciones.'],
            ]],
        ]);

        // --- Ruta Desarrollo con IA ---
        $this->makeFullCourse([
            'slug' => 'introduccion-ia-para-desarrolladores', 'title' => 'Introducción a la IA para Desarrolladores',
            'description' => 'Entiende qué son los modelos de lenguaje, cómo funcionan los tokens y cómo consumir APIs de IA desde tu código.',
            'category_id' => $aiCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'beginner',
            'learning_path_id' => $paths['ia']?->id, 'learning_path_level_id' => $lvl($paths['ia'], 1), 'order' => 1,
        ], [
            ['order' => 1, 'title' => 'Conceptos', 'lessons' => [
                ['slug' => 'que-es-un-llm', 'title' => '¿Qué es un modelo de lenguaje grande (LLM)?', 'order' => 1, 'duration' => 12, 'preview' => true,
                 'content' => 'Un LLM es un modelo entrenado con enormes cantidades de texto que predice la siguiente palabra; de esa capacidad emergen respuestas útiles: resumir, explicar, escribir y generar código. No piensa como una persona: completa patrones estadísticamente, por eso toda salida debe verificarse. Conocer este límite es la clave para usarlo bien.'],
                ['slug' => 'apis-de-ia-y-tokens', 'title' => 'APIs de IA y tokens', 'order' => 2, 'duration' => 15,
                 'content' => 'Los proveedores exponen los modelos como APIs: envías mensajes y recibes una respuesta; el coste depende de los tokens de entrada y salida. Elegir el modelo (rápido vs. capaz) y controlar el contexto son decisiones de coste y latencia. Plataformas como OpenRouter unifican muchos modelos tras una sola API compatible con OpenAI.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'prompt-engineering-practico', 'title' => 'Prompt Engineering Práctico',
            'description' => 'Técnicas concretas para guiar a los modelos: rol, contexto y formato, few-shot y cadena de pensamiento.',
            'category_id' => $aiCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 10, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['ia']?->id, 'learning_path_level_id' => $lvl($paths['ia'], 2), 'order' => 2,
        ], [
            ['order' => 1, 'title' => 'Técnicas de prompting', 'lessons' => [
                ['slug' => 'prompts-claros-y-rol', 'title' => 'Contexto, rol y formato en los prompts', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Un buen prompt define rol, contexto, tarea y formato de salida. "Eres un revisor de código senior..." produce respuestas muy distintas a una petición vaga. Pedir un formato concreto (tabla, JSON, viñetas) hace las respuestas reutilizables y fáciles de integrar con código.'],
                ['slug' => 'few-shot-y-cadena-de-pensamiento', 'title' => 'Few-shot y cadena de pensamiento', 'order' => 2, 'duration' => 18,
                 'content' => 'Few-shot incluye ejemplos en el prompt para fijar el estilo y la estructura de la respuesta; la cadena de pensamiento, pedir razonar paso a paso, mejora la exactitud en problemas lógicos y matemáticos. Con estas técnicas, los modelos pequeños compiten con modelos grandes en tareas concretas y a menor coste.'],
            ]],
        ]);

        $this->makeFullCourse([
            'slug' => 'ia-en-el-ciclo-de-desarrollo', 'title' => 'IA en el Ciclo de Desarrollo',
            'description' => 'Integra la IA en tu flujo real de trabajo: asistentes de código, generación de tests, code review y documentación.',
            'category_id' => $aiCat?->id, 'instructor_id' => $instructor?->id,
            'is_published' => true, 'is_free' => true, 'duration_hours' => 8, 'difficulty' => 'intermediate',
            'learning_path_id' => $paths['ia']?->id, 'learning_path_level_id' => $lvl($paths['ia'], 3), 'order' => 3,
        ], [
            ['order' => 1, 'title' => 'Flujo de trabajo aumentado', 'lessons' => [
                ['slug' => 'asistentes-de-codigo', 'title' => 'Asistentes de código y pair programming con IA', 'order' => 1, 'duration' => 15, 'preview' => true,
                 'content' => 'Los asistentes (autocompletado, chat en el editor) aceleran la escritura de código, pero el desarrollador sigue siendo responsable de la calidad: revisar, testear y refactorizar lo generado. La IA es un copiloto: propone, tú decides. El código generado sin comprensión se convierte en deuda técnica.'],
                ['slug' => 'ia-en-code-review-y-tests', 'title' => 'IA en code review, tests y documentación', 'order' => 2, 'duration' => 18,
                 'content' => 'La IA ayuda a generar tests (incluidos casos borde), detectar bugs en la revisión y redactar documentación y resúmenes de PR. El mayor valor aparece cuando se integra en el pipeline: análisis estático con modelos, generación de fixtures y resúmenes automáticos de cambios. Siembre con verificación humana y tests reales.'],
            ]],
        ]);
    }

    /**
     * Crea un curso con sus módulos y lecciones de forma idempotente.
     */
    private function makeFullCourse(array $course, array $modules): void
    {
        $courseModel = Course::firstOrCreate(['slug' => $course['slug']], $course);

        foreach ($modules as $module) {
            $mod = Module::firstOrCreate(
                ['course_id' => $courseModel->id, 'order' => $module['order']],
                ['title' => $module['title'], 'description' => $module['description'] ?? null],
            );

            foreach ($module['lessons'] as $lesson) {
                Lesson::firstOrCreate(['slug' => $lesson['slug']], [
                    'module_id'        => $mod->id,
                    'title'            => $lesson['title'],
                    'order'            => $lesson['order'],
                    'type'             => $lesson['type'] ?? 'article',
                    'duration_minutes' => $lesson['duration'] ?? 10,
                    'is_preview'       => $lesson['preview'] ?? false,
                    'content'          => ['type' => 'doc', 'text' => $lesson['content']],
                ]);
            }
        }
    }
}
