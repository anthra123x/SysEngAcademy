<?php

namespace App\Services;

class DiagnosticCatalogService
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
            'desc' => 'Descomposición analítica de problemas, diseño de algoritmos paso a paso y casos de prueba.',
            'hours' => 14,
            'skills' => ['Descomposición de Problemas', 'Invariantes de Bucle', 'Casos de Prueba'],
        ],
        'python-estructurado' => [
            'title' => 'Python estructurado',
            'desc' => 'Sintaxis moderna de Python, funciones puras, manejo de excepciones y colecciones estándar.',
            'hours' => 16,
            'skills' => ['Python 3.12', 'Manejo de Excepciones', 'Funciones de Orden Superior'],
        ],
        'algoritmos-ordenamiento' => [
            'title' => 'Algoritmos y Estructuras Fundamentales',
            'desc' => 'Notación Asintótica Big-O, ordenamiento eficiente (QuickSort, MergeSort) y búsqueda binaria.',
            'hours' => 18,
            'skills' => ['Complejidad Big-O', 'Búsqueda Binaria', 'Recursión'],
        ],
        'estructuras-datos-lineales' => [
            'title' => 'Estructuras de Datos Lineales',
            'desc' => 'Listas enlazadas, pilas (stacks), colas (queues) y tablas hash implementadas paso a paso.',
            'hours' => 20,
            'skills' => ['Listas Enlazadas', 'Stacks y Queues', 'Tablas Hash y Colisiones'],
        ],
        'introduccion-poo' => [
            'title' => 'Introducción a la Programación Orientada a Objetos',
            'desc' => 'Conceptos base de POO: abstracción, estado interno, comportamiento y mensajes entre objetos.',
            'hours' => 12,
            'skills' => ['Abstracción', 'Encapsulamiento', 'Mensajes y Métodos'],
        ],
        'clases-objetos-herencia' => [
            'title' => 'Clases, Objetos y Herencia',
            'desc' => 'Jerarquías de clases, constructores, métodos sobrescritos, polimorfismo dinámico y composición.',
            'hours' => 16,
            'skills' => ['Herencia', 'Polimorfismo Dinámico', 'Composición sobre Herencia'],
        ],
        'programacion-orientada-a-objetos-java' => [
            'title' => 'POO Profesional con Java',
            'desc' => 'Tipado estático seguro, genéricos, interfaces, manejo de excepciones y colecciones avanzadas.',
            'hours' => 22,
            'skills' => ['Java 21', 'Genéricos', 'Colecciones y Streams'],
        ],
        'diseno-modular-interfaces' => [
            'title' => 'Diseño Modular y Contratos con Interfaces',
            'desc' => 'Contratos abstractos, acoplamiento bajo, cohesión alta y patrones de inversión de control.',
            'hours' => 15,
            'skills' => ['Interfaces y Contratos', 'Bajo Acoplamiento', 'Alta Cohesión'],
        ],
        'principios-solid' => [
            'title' => 'Principios SOLID en la Práctica',
            'desc' => 'Los 5 principios SOLID aplicados a refactorización de código real con casos de prueba.',
            'hours' => 18,
            'skills' => ['SRP, OCP, LSP, ISP, DIP', 'Refactorización Limpia', 'Clean Architecture'],
        ],
        'patrones-de-diseno' => [
            'title' => 'Patrones de Diseño de Software',
            'desc' => 'Patrones GoF creacionales, estructurales y de comportamiento implementados en casos reales.',
            'hours' => 20,
            'skills' => ['Factory, Singleton, Strategy', 'Observer, Adapter', 'Patrones GoF'],
        ],
        'arquitectura-proyecto-poo' => [
            'title' => 'Arquitectura de Proyectos Orientados a Objetos',
            'desc' => 'Capas de dominio, infraestructura, servicios y persistencia con Clean Architecture.',
            'hours' => 25,
            'skills' => ['Domain-Driven Design', 'Arquitectura Hexagonal', 'Inversión de Dependencias'],
        ],
        'backend-introduccion' => [
            'title' => 'Introducción al Desarrollo Backend',
            'desc' => 'Fundamentos del protocolo HTTP, arquitectura cliente-servidor, JSON APIs y servidores web.',
            'hours' => 14,
            'skills' => ['Protocolo HTTP', 'APIs RESTful', 'JSON y Serialización'],
        ],
        'sql-desde-cero' => [
            'title' => 'SQL y Modelado de Bases de Datos Relacionales',
            'desc' => 'Diseño ER, normalización hasta 3FN, sentencias DDL/DML, JOINs complejos y transacciones ACID.',
            'hours' => 18,
            'skills' => ['PostgreSQL', 'Modelado ER & 3FN', 'JOINs y Transacciones ACID'],
        ],
        'diseno-apis-restful' => [
            'title' => 'Diseño y Especificación de APIs RESTful',
            'desc' => 'Estándares OpenAPI 3.0, códigos de estado HTTP semánticos, paginación, filtros y HATEOAS.',
            'hours' => 16,
            'skills' => ['OpenAPI / Swagger', 'Semántica HTTP', 'Versionado de APIs'],
        ],
        'apis-rest-con-laravel' => [
            'title' => 'Construcción de APIs REST con Laravel',
            'desc' => 'Eloquent ORM, API Resources, validación mediante Form Requests, middlewares y controladores API.',
            'hours' => 24,
            'skills' => ['Laravel 11', 'Eloquent ORM', 'Form Requests y Middlewares'],
        ],
        'modelos-relaciones-y-consultas' => [
            'title' => 'Modelos, Relaciones Avanzadas y Consultas Eloquent',
            'desc' => 'Relaciones 1:N, N:M polimórficas, prevención del problema N+1 con Eager Loading y Scopes.',
            'hours' => 20,
            'skills' => ['Relaciones Polimórficas', 'Optimización Eager Loading', 'Eloquent Scopes'],
        ],
        'seguridad-en-apis' => [
            'title' => 'Seguridad y Protección Defensiva en APIs',
            'desc' => 'Protección contra OWASP Top 10 API, mitigación de inyecciones, rate limiting y sanitización estricta.',
            'hours' => 18,
            'skills' => ['OWASP API Top 10', 'Mitigación de Inyecciones', 'Rate Limiting y CORS'],
        ],
        'autenticacion-jwt-web' => [
            'title' => 'Autenticación Segura con JWT y OAuth 2.0',
            'desc' => 'Tokens sin estado (Stateless JWT), refresh tokens rotativos, RBAC y federación social Google/GitHub.',
            'hours' => 16,
            'skills' => ['JWT Stateless', 'Refresh Tokens Rotativos', 'RBAC y Permisos'],
        ],
        'intro-desarrollo-web' => [
            'title' => 'Introducción al Desarrollo Web',
            'desc' => 'La arquitectura de la World Wide Web, anatomía del navegador, DNS y renderizado del DOM.',
            'hours' => 10,
            'skills' => ['Arquitectura Web', 'Ciclo de Petición HTTP', 'Renderizado del DOM'],
        ],
        'html-css-javascript' => [
            'title' => 'HTML5 Semántico, CSS Moderno y JavaScript ES6+',
            'desc' => 'Estándares semánticos, manipulación del DOM nativa, eventos asíncronos y Promises/Async-Await.',
            'hours' => 20,
            'skills' => ['HTML5 Semántico', 'JavaScript ES6+', 'Async / Await y Fetch API'],
        ],
        'css-moderno-flexbox-grid' => [
            'title' => 'CSS Avanzado: Flexbox, CSS Grid y Responsive Design',
            'desc' => 'Maquetación fluida y adaptativa, variables CSS personalizadas y diseño responsivo móvil-primero.',
            'hours' => 14,
            'skills' => ['Flexbox & Grid', 'Mobile-First', 'Variables CSS y Temas'],
        ],
        'typescript-profesional-frontend' => [
            'title' => 'TypeScript Profesional para Desarrolladores Frontend',
            'desc' => 'Tipado estricto, interfaces, types discriminados, genéricos avanzados y compilación moderna.',
            'hours' => 18,
            'skills' => ['TypeScript 5.x', 'Genéricos', 'Discriminated Unions'],
        ],
        'angular-moderno' => [
            'title' => 'Angular Moderno: Componentes Standalone y Signals',
            'desc' => 'Angular 19/20: Reactividad declarativa con Signals, control flow `@if`/`@for`, routing e inyección.',
            'hours' => 28,
            'skills' => ['Angular Signals', 'Standalone Components', 'Inyección de Dependencias'],
        ],
        'accesibilidad-y-performance-web' => [
            'title' => 'Accesibilidad Web (a11y) y Optimización de Performance',
            'desc' => 'Estándares WCAG 2.2, atributos ARIA, navegación por teclado y métricas Core Web Vitals.',
            'hours' => 14,
            'skills' => ['WCAG 2.2', 'ARIA y Navegación Teclado', 'Core Web Vitals'],
        ],
        'integracion-frontend-backend' => [
            'title' => 'Integración Full Stack: Frontend Reactivo y APIs REST',
            'desc' => 'Consumo desacoplado de endpoints, interceptores HTTP, gestión de estado reactivo y manejo de errores.',
            'hours' => 22,
            'skills' => ['Interceptores HTTP', 'Gestión de Estado Reactivo', 'Sincronización de Errores'],
        ],
        'despliegue-fullstack' => [
            'title' => 'Despliegue Profesional y CI/CD de Aplicaciones Full Stack',
            'desc' => 'Estrategias de despliegue en la nube, variables de entorno seguras y monitoreo de producción.',
            'hours' => 16,
            'skills' => ['Despliegue Cloud', 'Variables de Entorno', 'Monitoreo de Salud'],
        ],
        'git-desde-cero' => [
            'title' => 'Git desde cero',
            'desc' => 'Control de versiones fundamental: commits atómicos, ramas de trabajo (branches), diffs e historial.',
            'hours' => 10,
            'skills' => ['Commits Atómicos', 'Ramas y Stash', 'Inspección de Diff e Historial'],
        ],
        'git-colaboracion-y-flujos' => [
            'title' => 'Git: Colaboración, Pull Requests y Flujos de Equipo',
            'desc' => 'Flujos de trabajo colaborativos en GitHub, revisión de Pull Requests y resolución de conflictos.',
            'hours' => 12,
            'skills' => ['Pull Requests', 'Code Reviews', 'Resolución de Conflictos'],
        ],
        'git-avanzado-rebase-conflictos' => [
            'title' => 'Git Avanzado: Rebase Interactivo, Bisect y Reflog',
            'desc' => 'Rebase interactivo, recuperación de commits huérfanos con reflog y depuración con git bisect.',
            'hours' => 14,
            'skills' => ['Git Rebase Interactivo', 'Git Reflog', 'Git Bisect'],
        ],
        'linux-y-linea-de-comandos' => [
            'title' => 'Linux y la Línea de Comandos para Desarrolladores',
            'desc' => 'Administración básica de Linux, bash scripting, permisos de archivos, pipes y procesos del sistema.',
            'hours' => 16,
            'skills' => ['Bash Scripting', 'Permisos POSIX', 'Pipes y Filtros'],
        ],
        'docker-y-contenedores' => [
            'title' => 'Docker y Contenedores desde Cero',
            'desc' => 'Imágenes Docker, Dockerfile multi-etapa optimizados, volúmenes, redes y aislamiento de entornos.',
            'hours' => 18,
            'skills' => ['Dockerfiles Multi-Stage', 'Aislamiento de Contenedores', 'Redes y Volúmenes'],
        ],
        'docker-compose-multiservicio' => [
            'title' => 'Docker Compose para Aplicaciones Multiservicio',
            'desc' => 'Orquestación de microservicios locales: backend, base de datos relacional y servidor de desarrollo.',
            'hours' => 14,
            'skills' => ['Docker Compose', 'Orquestación Local', 'Gestión de Secretos'],
        ],
        'ci-cd-github-actions' => [
            'title' => 'Integración Continua con GitHub Actions',
            'desc' => 'Pipelines automatizados de pruebas unitarias, linting, validación de tipos y build de imágenes.',
            'hours' => 16,
            'skills' => ['GitHub Actions', 'Pipelines Automatizados', 'Matriz de Pruebas'],
        ],
        'introduccion-ia-para-desarrolladores' => [
            'title' => 'Introducción a la IA para Desarrolladores de Software',
            'desc' => 'Fundamentos de Modelos de Lenguaje Grande (LLMs), tokens, embeddings y APIs de generación.',
            'hours' => 14,
            'skills' => ['Arquitectura de LLMs', 'Manejo de Tokens', 'APIs de Generación'],
        ],
        'prompt-engineering-practico' => [
            'title' => 'Prompt Engineering Profesional para Programación',
            'desc' => 'Técnicas de Few-shot, Chain of Thought, Structured Output JSON y evaluación de respuestas.',
            'hours' => 16,
            'skills' => ['Few-Shot Prompting', 'Structured Outputs JSON', 'Chain-of-Thought'],
        ],
        'ia-en-el-ciclo-de-desarrollo' => [
            'title' => 'Integración de IA en el Ciclo de Desarrollo de Software',
            'desc' => 'Agentes asistidos, generación automatizada de pruebas y asistentes de depuración en tiempo real.',
            'hours' => 18,
            'skills' => ['Agentes Autónomos', 'Generación de Test Suites', 'Auditoría con IA'],
        ],
        'rag-embeddings-bases-vectoriales' => [
            'title' => 'RAG, Embeddings y Bases de Datos Vectoriales',
            'desc' => 'Generación aumentada por recuperación (RAG), embeddings densos y búsqueda semántica con vectores.',
            'hours' => 22,
            'skills' => ['Arquitectura RAG', 'Bases Vectoriales', 'Búsqueda Semántica'],
        ],
        'fundamentos-requerimientos' => [
            'title' => 'Fundamentos de Ingeniería de Requerimientos',
            'desc' => 'Levantamiento de requerimientos, clasificación funcional vs. no funcional y acuerdos de nivel de servicio.',
            'hours' => 12,
            'skills' => ['Requisitos Funcionales vs RNF', 'Técnicas de Elicitación', 'Matriz de Interesados'],
        ],
        'historias-de-usuario-y-casos-de-uso' => [
            'title' => 'Historias de Usuario y Casos de Uso Formales',
            'desc' => 'Criterios de aceptación INVEST, escenarios Gherkin BDD y especificación formal de casos de uso.',
            'hours' => 14,
            'skills' => ['Criterios INVEST', 'Gherkin / Cucumber BDD', 'Casos de Uso Formales'],
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

    public function getCatalogPaths(): array
    {
        return self::CATALOG_PATHS;
    }

    public function getCourseMeta(): array
    {
        return self::COURSE_META;
    }

    public function getPath(string $key): ?array
    {
        return self::CATALOG_PATHS[$key] ?? null;
    }

    public function getCourse(string $slug): ?array
    {
        return self::COURSE_META[$slug] ?? null;
    }
}
