import { Category, Course, LearningPath, PaginatedResponse } from '../models';
import { HomeData } from './home.service';
import { TeacherOverviewResponse } from './teacher.service';

export const FALLBACK_CATEGORIES: Category[] = [
    {
        "id": 1,
        "name": "Programación Básica",
        "slug": "programacion-basica",
        "icon": "Code",
        "color": "#6C63FF",
        "description": "Fundamentos de programación y pensamiento lógico",
        "courses_count": 4
    },
    {
        "id": 2,
        "name": "Algoritmos",
        "slug": "algoritmos",
        "icon": "GitBranch",
        "color": "#00D9FF",
        "description": "Diseño y análisis de algoritmos",
        "courses_count": 2
    },
    {
        "id": 3,
        "name": "POO",
        "slug": "poo",
        "icon": "Boxes",
        "color": "#00E676",
        "description": "Programación Orientada a Objetos",
        "courses_count": 6
    },
    {
        "id": 4,
        "name": "Bases de Datos",
        "slug": "bases-de-datos",
        "icon": "Database",
        "color": "#FFD740",
        "description": "SQL, NoSQL y diseño de bases de datos",
        "courses_count": 1
    },
    {
        "id": 5,
        "name": "Redes",
        "slug": "redes",
        "icon": "Network",
        "color": "#FF6D00",
        "description": "Redes de computadoras y protocolos",
        "courses_count": 0
    },
    {
        "id": 6,
        "name": "Sistemas Operativos",
        "slug": "sistemas-operativos",
        "icon": "Monitor",
        "color": "#FF5252",
        "description": "Conceptos de sistemas operativos y concurrencia",
        "courses_count": 0
    },
    {
        "id": 7,
        "name": "Estructuras de Datos",
        "slug": "estructuras-de-datos",
        "icon": "TreePine",
        "color": "#AB47BC",
        "description": "Listas, árboles, grafos y más",
        "courses_count": 0
    },
    {
        "id": 8,
        "name": "Desarrollo Web",
        "slug": "desarrollo-web",
        "icon": "Globe",
        "color": "#26C6DA",
        "description": "Frontend, backend y fullstack",
        "courses_count": 3
    },
    {
        "id": 9,
        "name": "Desarrollo Backend",
        "slug": "desarrollo-backend",
        "icon": "Server",
        "color": "#64B5F6",
        "description": "APIs, servidores, bases de datos y lógica de negocio",
        "courses_count": 6
    },
    {
        "id": 10,
        "name": "Desarrollo Frontend",
        "slug": "desarrollo-frontend",
        "icon": "Palette",
        "color": "#F06292",
        "description": "Interfaces, componentes, frameworks y experiencia de usuario",
        "courses_count": 5
    },
    {
        "id": 11,
        "name": "DevOps",
        "slug": "devops",
        "icon": "Container",
        "color": "#81C784",
        "description": "CI/CD, contenedores, cloud y automatización",
        "courses_count": 5
    },
    {
        "id": 12,
        "name": "Git y Control de Versiones",
        "slug": "git",
        "icon": "GitFork",
        "color": "#FF7043",
        "description": "Git, ramas, colaboración y flujos de trabajo",
        "courses_count": 3
    },
    {
        "id": 13,
        "name": "Ingeniería de Software",
        "slug": "ingenieria-software",
        "icon": "ClipboardList",
        "color": "#9575CD",
        "description": "Requerimientos, diseño, arquitectura y gestión de proyectos",
        "courses_count": 4
    },
    {
        "id": 14,
        "name": "IA para Desarrollo",
        "slug": "ia-desarrollo",
        "icon": "Sparkles",
        "color": "#4DB6AC",
        "description": "LLMs, prompt engineering y desarrollo asistido por IA",
        "courses_count": 4
    }
];

export const FALLBACK_COURSES: Course[] = [
    {
        "id": 2,
        "title": "Algoritmos de Ordenamiento",
        "slug": "algoritmos-ordenamiento",
        "description": "Estudia los algoritmos de ordenamiento más importantes: Bubble Sort, Selection Sort, Merge Sort, Quick Sort. Aprende a analizar su complejidad temporal y espacial con Big-O notation.",
        "category_id": 2,
        "learning_path_id": 1,
        "learning_path_level_id": 3,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 8,
        "order": 1,
        "lessons_count": 9,
        "category": {
            "id": 2,
            "name": "Algoritmos",
            "slug": "algoritmos",
            "icon": "GitBranch",
            "color": "#00D9FF",
            "description": "Diseño y análisis de algoritmos"
        },
        "modules": [
            {
                "id": 3,
                "course_id": 2,
                "title": "Análisis de Algoritmos",
                "description": "Aprende a medir y comparar la eficiencia de los algoritmos con la notación Big-O.",
                "order": 1,
                "lessons": [
                    {
                        "id": 5,
                        "module_id": 3,
                        "title": "Notación Big-O",
                        "slug": "notacion-big-o",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 423,
                        "module_id": 3,
                        "title": "Comparando algoritmos en la práctica",
                        "slug": "comparando-algoritmos",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 424,
                        "module_id": 3,
                        "title": "Complejidad espacial",
                        "slug": "complejidad-espacial",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 170,
                "course_id": 2,
                "title": "Ordenamiento Básico",
                "description": "Los algoritmos cuadráticos clásicos: fáciles de entender e implementar, útiles para listas pequeñas.",
                "order": 2,
                "lessons": [
                    {
                        "id": 425,
                        "module_id": 170,
                        "title": "Bubble Sort",
                        "slug": "bubble-sort",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 426,
                        "module_id": 170,
                        "title": "Selection Sort",
                        "slug": "selection-sort",
                        "type": "code_challenge",
                        "duration_minutes": 13,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 427,
                        "module_id": 170,
                        "title": "Insertion Sort",
                        "slug": "insertion-sort",
                        "type": "code_challenge",
                        "duration_minutes": 13,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 171,
                "course_id": 2,
                "title": "Ordenamiento Avanzado y Búsqueda",
                "description": "Divide y vencerás: Merge Sort, Quick Sort y la búsqueda binaria.",
                "order": 3,
                "lessons": [
                    {
                        "id": 428,
                        "module_id": 171,
                        "title": "Merge Sort",
                        "slug": "merge-sort",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 429,
                        "module_id": 171,
                        "title": "Quick Sort",
                        "slug": "quick-sort",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 430,
                        "module_id": 171,
                        "title": "Búsqueda binaria",
                        "slug": "busqueda-binaria",
                        "type": "code_challenge",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 18,
        "title": "Git desde cero",
        "slug": "git-desde-cero",
        "description": "Instala Git, haz tus primeros commits y domina los tres estados, las ramas y el viaje por la historia sin miedo.",
        "category_id": 12,
        "learning_path_id": 7,
        "learning_path_level_id": 21,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 12,
            "name": "Git y Control de Versiones",
            "slug": "git",
            "icon": "GitFork",
            "color": "#FF7043",
            "description": "Git, ramas, colaboración y flujos de trabajo"
        },
        "modules": [
            {
                "id": 20,
                "course_id": 18,
                "title": "Primeros pasos",
                "description": "Instalación, commits y el modelo de estados de Git.",
                "order": 1,
                "lessons": [
                    {
                        "id": 44,
                        "module_id": 20,
                        "title": "¿Qué es Git y por qué usarlo?",
                        "slug": "que-es-git",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 45,
                        "module_id": 20,
                        "title": "Tus primeros commits",
                        "slug": "primeros-commits",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 543,
                        "module_id": 20,
                        "title": "Los tres estados: working, staging y commit",
                        "slug": "estados-y-staging",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 211,
                "course_id": 18,
                "title": "Ramas e historia",
                "description": "Ramas, viaje por el historial y estrategias de organización.",
                "order": 2,
                "lessons": [
                    {
                        "id": 544,
                        "module_id": 211,
                        "title": "Ramas y merge",
                        "slug": "ramas-y-merge",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 545,
                        "module_id": 211,
                        "title": "Viajar por la historia: log, diff y revert",
                        "slug": "historia-y-revert",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 546,
                        "module_id": 211,
                        "title": ".gitignore, aliases y estrategias de commit",
                        "slug": "gitignore-y-estrategias",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 9,
        "title": "HTML, CSS y JavaScript",
        "slug": "html-css-javascript",
        "description": "Los tres pilares de la web: estructura semántica, maquetación moderna con Flexbox y Grid, e interactividad con el DOM. Construye tus primeras interfaces desde cero.",
        "category_id": 10,
        "learning_path_id": 4,
        "learning_path_level_id": 12,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 15,
        "order": 1,
        "lessons_count": 12,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "modules": [
            {
                "id": 10,
                "course_id": 9,
                "title": "HTML Semántico",
                "description": "Estructura significativa, formularios y contenido multimedia.",
                "order": 1,
                "lessons": [
                    {
                        "id": 22,
                        "module_id": 10,
                        "title": "Estructura semántica de una página HTML",
                        "slug": "estructura-de-una-pagina-html",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 456,
                        "module_id": 10,
                        "title": "Etiquetas semánticas y accesibilidad",
                        "slug": "etiquetas-semanticas-y-accesibilidad",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 457,
                        "module_id": 10,
                        "title": "Formularios y contenido multimedia",
                        "slug": "formularios-y-media",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 180,
                "course_id": 9,
                "title": "Layout con CSS",
                "description": "Flexbox, Grid, modelo de caja y diseño responsive.",
                "order": 2,
                "lessons": [
                    {
                        "id": 23,
                        "module_id": 180,
                        "title": "Flexbox y Grid: maquetación moderna",
                        "slug": "css-flexbox-y-grid",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 458,
                        "module_id": 180,
                        "title": "Colores, tipografía y modelo de caja",
                        "slug": "colores-tipografia-y-box-model",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 459,
                        "module_id": 180,
                        "title": "Diseño responsive",
                        "slug": "responsive-design",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 181,
                "course_id": 9,
                "title": "JavaScript y el DOM",
                "description": "Interactividad real: eventos, manipulación del DOM y un proyecto interactivo.",
                "order": 3,
                "lessons": [
                    {
                        "id": 24,
                        "module_id": 181,
                        "title": "JavaScript: el DOM y los eventos",
                        "slug": "javascript-dom-y-eventos",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 460,
                        "module_id": 181,
                        "title": "Manipulando el DOM en la práctica",
                        "slug": "manipulando-el-dom",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 461,
                        "module_id": 181,
                        "title": "Proyecto: galería interactiva",
                        "slug": "proyecto-interactivo",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 206,
                "course_id": 9,
                "title": "JavaScript Asíncrono, Promesas y Fetch API",
                "description": "Domina el Event Loop, la programación asíncrona no bloqueante, Promesas y el consumo de APIs remotas según la documentación oficial de MDN.",
                "order": 4,
                "lessons": [
                    {
                        "id": 529,
                        "module_id": 206,
                        "title": "El Event Loop y el modelo de concurrencia",
                        "slug": "event-loop-y-concurrencia-js",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 530,
                        "module_id": 206,
                        "title": "Promesas, Async/Await y la Fetch API",
                        "slug": "promesas-async-await-y-fetch",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 208,
                "course_id": 9,
                "title": "Almacenamiento Local, Persistencia y Proyecto Final",
                "description": "Aprende a guardar el estado de las aplicaciones en el cliente con LocalStorage y SessionStorage, y consolida tus habilidades en un proyecto interactivo.",
                "order": 5,
                "lessons": [
                    {
                        "id": 535,
                        "module_id": 208,
                        "title": "Persistencia en el navegador con LocalStorage",
                        "slug": "localstorage-persistencia-cliente",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 20,
        "title": "Fundamentos de requerimientos",
        "slug": "fundamentos-requerimientos",
        "description": "Aprende qué es un requerimiento, por qué sus errores son los más caros y cómo descubrirlos, escribirlos y validarlos sin ambigüedad.",
        "category_id": 13,
        "learning_path_id": 8,
        "learning_path_level_id": 24,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 13,
            "name": "Ingeniería de Software",
            "slug": "ingenieria-software",
            "icon": "ClipboardList",
            "color": "#9575CD",
            "description": "Requerimientos, diseño, arquitectura y gestión de proyectos"
        },
        "modules": [
            {
                "id": 22,
                "course_id": 20,
                "title": "Conceptos clave",
                "description": "Tipos de requerimientos y el coste de los errores.",
                "order": 1,
                "lessons": [
                    {
                        "id": 48,
                        "module_id": 22,
                        "title": "Requerimientos funcionales y no funcionales",
                        "slug": "requerimientos-funcionales-y-no",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 49,
                        "module_id": 22,
                        "title": "El coste de los errores de requerimientos",
                        "slug": "coste-de-los-errores",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 551,
                        "module_id": 22,
                        "title": "Tipos de requerimientos y su ciclo de vida",
                        "slug": "tipos-de-requerimientos",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 213,
                "course_id": 20,
                "title": "Descubrimiento",
                "description": "Técnicas para descubrir, escribir y validar requerimientos.",
                "order": 2,
                "lessons": [
                    {
                        "id": 552,
                        "module_id": 213,
                        "title": "Técnicas de recolección de requerimientos",
                        "slug": "tecnicas-de-recoleccion",
                        "type": "article",
                        "duration_minutes": 17,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 553,
                        "module_id": 213,
                        "title": "Escribir requerimientos sin ambigüedad",
                        "slug": "requerimientos-ambiguos",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 554,
                        "module_id": 213,
                        "title": "Validación y aprobación de requerimientos",
                        "slug": "validacion-de-requerimientos",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 5,
        "title": "Introducción al Backend",
        "slug": "backend-introduccion",
        "description": "Descubre qué pasa del lado del servidor: el modelo cliente-servidor, HTTP y el rol del backend en una aplicación moderna. La base para diseñar cualquier API.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 8,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 1,
        "lessons_count": 8,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 5,
                "course_id": 5,
                "title": "El Mundo del Backend",
                "description": "Qué es el backend y sobre qué cimientos se apoya: cliente-servidor y HTTP.",
                "order": 1,
                "lessons": [
                    {
                        "id": 8,
                        "module_id": 5,
                        "title": "¿Qué es el Backend?",
                        "slug": "que-es-backend",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 9,
                        "module_id": 5,
                        "title": "El modelo Cliente-Servidor",
                        "slug": "modelo-cliente-servidor",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 10,
                        "module_id": 5,
                        "title": "HTTP y sus métodos",
                        "slug": "http-y-sus-metodos",
                        "type": "article",
                        "duration_minutes": 20,
                        "order": 3,
                        "is_preview": false
                    },
                    {
                        "id": 667,
                        "module_id": 5,
                        "title": "Reto Práctico: Validador de Métodos y Verbos HTTP",
                        "slug": "backend-introduccion-reto-validador-http",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 4,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 197,
                "course_id": 5,
                "title": "Servidores y APIs",
                "description": "Del servidor web a la API: los bloques con los que construyes servicios reales.",
                "order": 2,
                "lessons": [
                    {
                        "id": 498,
                        "module_id": 197,
                        "title": "¿Qué es un servidor web?",
                        "slug": "que-es-un-servidor-web",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 499,
                        "module_id": 197,
                        "title": "¿Qué es una API?",
                        "slug": "que-es-una-api",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 500,
                        "module_id": 197,
                        "title": "Arquitectura típica de un backend",
                        "slug": "arquitectura-de-un-backend",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    },
                    {
                        "id": 668,
                        "module_id": 197,
                        "title": "Reto Práctico: Despachador de Rutas REST",
                        "slug": "backend-introduccion-reto-enrutador-basico",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 4,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 93,
        "title": "Introducción a la Programación Orientada a Objetos",
        "slug": "introduccion-poo",
        "description": "Da el salto del código imperativo a las clases y objetos. Entiende por qué agrupar datos y comportamiento en un mismo lugar hace que los sistemas resulten más fáciles de mantener.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 4,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 14,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 183,
                "course_id": 93,
                "title": "Del imperativo a las clases",
                "description": "Qué cambia cuando agrupamos datos y funciones.",
                "order": 1,
                "lessons": [
                    {
                        "id": 466,
                        "module_id": 183,
                        "title": "Paradigma imperativo vs. orientado a objetos",
                        "slug": "poo-paradigma-vs-imperativo",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 467,
                        "module_id": 183,
                        "title": "Ejercicio: diseña tu primera clase",
                        "slug": "poo-ejercicio-primera-clase",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 184,
                "course_id": 93,
                "title": "Atributos y métodos",
                "description": "Estado interno de un objeto y las operaciones sobre ese estado.",
                "order": 2,
                "lessons": [
                    {
                        "id": 468,
                        "module_id": 184,
                        "title": "Atributos, métodos y el papel de self",
                        "slug": "poo-atributos-y-metodos",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 469,
                        "module_id": 184,
                        "title": "Ejercicio: un contador con estado",
                        "slug": "poo-ejercicio-contador",
                        "type": "code_challenge",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 185,
                "course_id": 93,
                "title": "Constructores y múltiples formas de crear objetos",
                "description": "init, valores por defecto yclassmethod.",
                "order": 3,
                "lessons": [
                    {
                        "id": 470,
                        "module_id": 185,
                        "title": "Constructores y formas de crear objetos",
                        "slug": "poo-constructores",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 471,
                        "module_id": 185,
                        "title": "Ejercicio: valida en el constructor",
                        "slug": "poo-ejercicio-validacion",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 23,
        "title": "Introducción a la IA para desarrolladores",
        "slug": "introduccion-ia-para-desarrolladores",
        "description": "Entiende qué son los modelos de lenguaje, cómo funcionan las APIs de IA y los tokens, y cómo integrarlos con límites y responsabilidad.",
        "category_id": 14,
        "learning_path_id": 9,
        "learning_path_level_id": 27,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 14,
            "name": "IA para Desarrollo",
            "slug": "ia-desarrollo",
            "icon": "Sparkles",
            "color": "#4DB6AC",
            "description": "LLMs, prompt engineering y desarrollo asistido por IA"
        },
        "modules": [
            {
                "id": 25,
                "course_id": 23,
                "title": "Conceptos",
                "description": "Qué son los LLMs, los tokens y las capacidades de cada modelo.",
                "order": 1,
                "lessons": [
                    {
                        "id": 54,
                        "module_id": 25,
                        "title": "¿Qué es un modelo de lenguaje grande (LLM)?",
                        "slug": "que-es-un-llm",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 55,
                        "module_id": 25,
                        "title": "APIs de IA y tokens",
                        "slug": "apis-de-ia-y-tokens",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 567,
                        "module_id": 25,
                        "title": "Tipos de modelos y sus capacidades",
                        "slug": "tipos-de-modelos-y-capacidades",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 217,
                "course_id": 23,
                "title": "Aplicación práctica",
                "description": "Integración, límites y ética del uso de IA.",
                "order": 2,
                "lessons": [
                    {
                        "id": 568,
                        "module_id": 217,
                        "title": "Integrar IA en tus aplicaciones",
                        "slug": "integrar-ia-en-aplicaciones",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 569,
                        "module_id": 217,
                        "title": "Límites, sesgos y alucinaciones",
                        "slug": "limites-y-alucinaciones",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 570,
                        "module_id": 217,
                        "title": "Ética y uso responsable de la IA",
                        "slug": "etica-y-uso-responsable",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 101,
        "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
        "slug": "arquitectura-proyecto-poo",
        "description": "Construye un sistema completo aplicando arquitectura en capas, entidades ricas, repositorios y patrones de diseño integrados.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 7,
        "difficulty": "advanced",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 16,
        "order": 1,
        "lessons_count": 5,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 227,
                "course_id": 101,
                "title": "Modelado del Dominio",
                "description": "Diseño de entidades, objetos de valor y reglas de negocio.",
                "order": 1,
                "lessons": [
                    {
                        "id": 599,
                        "module_id": 227,
                        "title": "Separación de lógica de negocio y framework",
                        "slug": "arquitectura-proyecto-poo-separacion-de-logica-de-negocio-y-framework",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 600,
                        "module_id": 227,
                        "title": "Implementación del patrón Repository y Data Transfer Objects",
                        "slug": "arquitectura-proyecto-poo-implementacion-del-patron-repository-y-data-transfer-objects",
                        "type": "article",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 601,
                        "module_id": 227,
                        "title": "Reto: Construcción del núcleo de gestión de pedidos",
                        "slug": "arquitectura-proyecto-poo-reto-construccion-del-nucleo-de-gestion-de-pedidos",
                        "type": "code_challenge",
                        "duration_minutes": 30,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 248,
                "course_id": 101,
                "title": "Módulo 2: Patrones GoF y Refactorización Limpia",
                "description": "Aplica los principios de Martin Fowler y GoF para desacoplar componentes y extender funcionalidad sin modificar código existente.",
                "order": 2,
                "lessons": [
                    {
                        "id": 671,
                        "module_id": 248,
                        "title": "El Patrón Decorator y Principio Abierto/Cerrado (OCP)",
                        "slug": "arquitectura-proyecto-poo-patron-decorator",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 672,
                        "module_id": 248,
                        "title": "Reto Práctico: Implementación del Patrón Decorator de Logging",
                        "slug": "arquitectura-proyecto-poo-reto-patron-decorator",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 12,
        "title": "Integración Frontend ↔ Backend",
        "slug": "integracion-frontend-backend",
        "description": "Convierte la API en un contrato vivo entre equipos: documentación, manejo de CORS y tokens desde el frontend, y un flujo de datos sin fricción.",
        "category_id": 8,
        "learning_path_id": 5,
        "learning_path_level_id": 15,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 8,
            "name": "Desarrollo Web",
            "slug": "desarrollo-web",
            "icon": "Globe",
            "color": "#26C6DA",
            "description": "Frontend, backend y fullstack"
        },
        "modules": [
            {
                "id": 14,
                "course_id": 12,
                "title": "La API como Contrato",
                "description": "Documentación, consumo y errores bien comunicados entre equipos.",
                "order": 1,
                "lessons": [
                    {
                        "id": 32,
                        "module_id": 14,
                        "title": "La API como contrato entre equipos",
                        "slug": "api-como-contrato",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 508,
                        "module_id": 14,
                        "title": "Consumiendo la API desde el frontend",
                        "slug": "consumiendo-la-api-desde-el-frontend",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 509,
                        "module_id": 14,
                        "title": "Errores típicos y debugging de integración",
                        "slug": "errores-y-debug-de-integracion",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 200,
                "course_id": 12,
                "title": "CORS y Autenticación en el Cliente",
                "description": "Configura CORS, envía tokens Bearer y gestiona sesiones desde el frontend.",
                "order": 2,
                "lessons": [
                    {
                        "id": 33,
                        "module_id": 200,
                        "title": "CORS y tokens Bearer desde el frontend",
                        "slug": "cors-y-token-bearer",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 510,
                        "module_id": 200,
                        "title": "Gestión de sesión en el cliente",
                        "slug": "gestion-de-sesion-en-el-cliente",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 511,
                        "module_id": 200,
                        "title": "Flujo de datos completo: del clic a la respuesta",
                        "slug": "flujo-de-datos-completo",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 1,
        "title": "Introducción a la Programación",
        "slug": "introduccion-programacion",
        "description": "Aprende los fundamentos absolutos de la programación. Sin experiencia previa requerida. Cubriremos variables, tipos de datos, estructuras de control y funciones básicas con ejemplos prácticos.",
        "category_id": 1,
        "learning_path_id": 1,
        "learning_path_level_id": 1,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 1,
        "lessons_count": 19,
        "category": {
            "id": 1,
            "name": "Programación Básica",
            "slug": "programacion-basica",
            "icon": "Code",
            "color": "#6C63FF",
            "description": "Fundamentos de programación y pensamiento lógico"
        },
        "modules": [
            {
                "id": 1,
                "course_id": 1,
                "title": "Variables y Tipos de Datos",
                "description": "Todo lo que necesitas saber sobre cómo almacenar información en un programa.",
                "order": 1,
                "lessons": [
                    {
                        "id": 1,
                        "module_id": 1,
                        "title": "¿Qué es una variable?",
                        "slug": "que-es-una-variable",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 2,
                        "module_id": 1,
                        "title": "Tipos de datos básicos",
                        "slug": "tipos-de-datos-basicos",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 418,
                        "module_id": 1,
                        "title": "Operadores y expresiones",
                        "slug": "operadores-y-expresiones",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 2,
                "course_id": 1,
                "title": "Flujo y Funciones",
                "description": "Controla el orden de ejecución con condicionales y ciclos, y reutiliza lógica con funciones.",
                "order": 2,
                "lessons": [
                    {
                        "id": 3,
                        "module_id": 2,
                        "title": "Condicionales: if, else, elif",
                        "slug": "condicionales-if-else",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 4,
                        "module_id": 2,
                        "title": "Ciclos: for y while",
                        "slug": "ciclos-for-while",
                        "type": "article",
                        "duration_minutes": 13,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 419,
                        "module_id": 2,
                        "title": "Funciones y parámetros",
                        "slug": "funciones-y-parametros",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 169,
                "course_id": 1,
                "title": "Primeros Programas",
                "description": "Pon en práctica lo aprendido: estructura de un programa, depuración y una primera mirada a la POO.",
                "order": 3,
                "lessons": [
                    {
                        "id": 420,
                        "module_id": 169,
                        "title": "¿Qué es un programa?",
                        "slug": "que-es-un-programa",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 421,
                        "module_id": 169,
                        "title": "Depurando tu código",
                        "slug": "depurando-tu-codigo",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 422,
                        "module_id": 169,
                        "title": "Primeros pasos en Programación Orientada a Objetos",
                        "slug": "primeros-pasos-en-poo",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 203,
                "course_id": 1,
                "title": "Estructuras de Datos: Arrays y Colecciones",
                "description": "Aprende cómo organizar colecciones de datos en memoria, indexación 0-based y operaciones de recorrido según los estándares de la computación.",
                "order": 4,
                "lessons": [
                    {
                        "id": 520,
                        "module_id": 203,
                        "title": "Arreglos y listas en memoria",
                        "slug": "arrays-y-listas-en-memoria",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 521,
                        "module_id": 203,
                        "title": "Recorrido y transformación de datos",
                        "slug": "recorrido-y-transformacion-de-arrays",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 204,
                "course_id": 1,
                "title": "Algoritmia y Resolución de Problemas",
                "description": "Desarrolla el pensamiento computacional: aprende a descomponer problemas complejos, identificar casos borde y diseñar soluciones robustas antes de escribir código.",
                "order": 5,
                "lessons": [
                    {
                        "id": 523,
                        "module_id": 204,
                        "title": "Pensamiento computacional y descomposición",
                        "slug": "pensamiento-computacional-y-descomposicion",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 524,
                        "module_id": 204,
                        "title": "Evaluación Integradora de Fundamentos",
                        "slug": "evaluacion-final-fundamentos",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 237,
                "course_id": 1,
                "title": "Entornos de Desarrollo y Editores de Código (IDEs, VS Code y Terminal)",
                "description": "Domina las herramientas profesionales donde se escribe el software real: editores de código modernos, Visual Studio Code a fondo, linters, formateadores automáticos, la terminal integrada y el ecosistema de IDEs en la industria.",
                "order": 6,
                "lessons": [
                    {
                        "id": 629,
                        "module_id": 237,
                        "title": "¿Qué es un IDE vs un Editor de Código? Principios y Arquitectura",
                        "slug": "que-es-un-ide-vs-editor-de-codigo",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 630,
                        "module_id": 237,
                        "title": "Dominio de Visual Studio Code: Anatomía, Atajos Esenciales y Productividad Pro",
                        "slug": "dominio-de-visual-studio-code-atajos-y-productividad",
                        "type": "article",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 631,
                        "module_id": 237,
                        "title": "Linters, Formateadores Automáticos (Prettier/ESLint) y Buenas Prácticas",
                        "slug": "linters-formateadores-y-buenas-practicas",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    },
                    {
                        "id": 632,
                        "module_id": 237,
                        "title": "La Terminal Integrada y Flujo de Trabajo en Línea de Comandos",
                        "slug": "terminal-integrada-y-flujo-de-comandos",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 4,
                        "is_preview": false
                    },
                    {
                        "id": 633,
                        "module_id": 237,
                        "title": "Ecosistema Profesional: JetBrains, Neovim, Jupyter y Cuándo Elegir Cada Uno",
                        "slug": "ecosistema-profesional-jetbrains-neovim-jupyter",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 5,
                        "is_preview": false
                    },
                    {
                        "id": 634,
                        "module_id": 237,
                        "title": "Taller Práctico y Desafío: Depuración de Código y Resolución de Bugs",
                        "slug": "taller-practico-depuracion-y-resolucion-de-bugs",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 6,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 98,
        "title": "Programación Estructurada con Python",
        "slug": "python-estructurado",
        "description": "Implementa soluciones modulares utilizando el lenguaje más versátil del mercado. Funciones, ámbito de variables, estructuras compuestas y manejo de excepciones.",
        "category_id": 1,
        "learning_path_id": 1,
        "learning_path_level_id": 2,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 14,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 1,
            "name": "Programación Básica",
            "slug": "programacion-basica",
            "icon": "Code",
            "color": "#6C63FF",
            "description": "Fundamentos de programación y pensamiento lógico"
        },
        "modules": [
            {
                "id": 222,
                "course_id": 98,
                "title": "Modularidad y Funciones en Python",
                "description": "Creación de código reutilizable y mantenible.",
                "order": 1,
                "lessons": [
                    {
                        "id": 585,
                        "module_id": 222,
                        "title": "Definición de funciones, parámetros y retornos",
                        "slug": "python-estructurado-definicion-de-funciones-parametros-y-retornos",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 586,
                        "module_id": 222,
                        "title": "Alcance de variables: local vs global y closures",
                        "slug": "python-estructurado-alcance-de-variables-local-vs-global-y-closures",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 587,
                        "module_id": 222,
                        "title": "Reto práctico: Refactorización modular de scripts",
                        "slug": "python-estructurado-reto-practico-refactorizacion-modular-de-scripts",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 223,
                "course_id": 98,
                "title": "Estructuras de Datos Nativas",
                "description": "Listas, tuplas, diccionarios y conjuntos.",
                "order": 2,
                "lessons": [
                    {
                        "id": 588,
                        "module_id": 223,
                        "title": "Colecciones indexadas: listas y sus métodos clave",
                        "slug": "python-estructurado-colecciones-indexadas-listas-y-sus-metodos-clave",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 589,
                        "module_id": 223,
                        "title": "Mapeos asociativos: diccionarios para modelar entidades",
                        "slug": "python-estructurado-mapeos-asociativos-diccionarios-para-modelar-entidades",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 590,
                        "module_id": 223,
                        "title": "Evaluación de estructuras compuestas",
                        "slug": "python-estructurado-evaluacion-de-estructuras-compuestas",
                        "type": "quiz",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 4,
        "title": "Introducción al Desarrollo Web",
        "slug": "intro-desarrollo-web",
        "description": "Aprende los fundamentos del desarrollo web: HTML, CSS y JavaScript. Crea tus primeras páginas web interactivas desde cero hasta un proyecto personal funcional.",
        "category_id": 8,
        "learning_path_id": 4,
        "learning_path_level_id": 12,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 15,
        "order": 1,
        "lessons_count": 9,
        "category": {
            "id": 8,
            "name": "Desarrollo Web",
            "slug": "desarrollo-web",
            "icon": "Globe",
            "color": "#26C6DA",
            "description": "Frontend, backend y fullstack"
        },
        "modules": [
            {
                "id": 177,
                "course_id": 4,
                "title": "Cómo Funciona la Web",
                "description": "Entiende HTTP, DNS y el papel de los navegadores antes de escribir tu primera línea de HTML.",
                "order": 1,
                "lessons": [
                    {
                        "id": 447,
                        "module_id": 177,
                        "title": "Cómo funciona la web: HTTP",
                        "slug": "como-funciona-la-web-http",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 448,
                        "module_id": 177,
                        "title": "DNS y URLs",
                        "slug": "dns-y-urls",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 449,
                        "module_id": 177,
                        "title": "Navegadores y herramientas de desarrollo",
                        "slug": "navegadores-y-herramientas",
                        "type": "article",
                        "duration_minutes": 8,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 178,
                "course_id": 4,
                "title": "HTML: el Esqueleto",
                "description": "Crea la estructura de tus páginas con HTML y sus etiquetas.",
                "order": 2,
                "lessons": [
                    {
                        "id": 450,
                        "module_id": 178,
                        "title": "Estructura básica de HTML",
                        "slug": "estructura-basica-html",
                        "type": "code_challenge",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 451,
                        "module_id": 178,
                        "title": "Etiquetas de contenido",
                        "slug": "etiquetas-y-contenido",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 452,
                        "module_id": 178,
                        "title": "Formularios HTML",
                        "slug": "formularios-html",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 179,
                "course_id": 4,
                "title": "CSS y JavaScript",
                "description": "Da estilo con CSS y vida con JavaScript para cerrar tu primer proyecto.",
                "order": 3,
                "lessons": [
                    {
                        "id": 453,
                        "module_id": 179,
                        "title": "Primeros estilos con CSS",
                        "slug": "primeros-estilos-css",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 454,
                        "module_id": 179,
                        "title": "Introducción a JavaScript",
                        "slug": "introduccion-a-javascript",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 455,
                        "module_id": 179,
                        "title": "Tu primer proyecto web",
                        "slug": "primer-proyecto-web",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 15,
        "title": "Linux y línea de comandos",
        "slug": "linux-y-linea-de-comandos",
        "description": "Domina la terminal como tu herramienta principal: archivos, permisos, procesos, scripts y conectividad para operar cualquier servidor.",
        "category_id": 11,
        "learning_path_id": 6,
        "learning_path_level_id": 18,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 14,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "modules": [
            {
                "id": 17,
                "course_id": 15,
                "title": "La terminal",
                "description": "Fundamentos sólidos para moverte con velocidad y seguridad en el shell.",
                "order": 1,
                "lessons": [
                    {
                        "id": 38,
                        "module_id": 17,
                        "title": "Comandos esenciales de Linux",
                        "slug": "comandos-esenciales-linux",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 39,
                        "module_id": 17,
                        "title": "Permisos, usuarios y procesos",
                        "slug": "permisos-y-procesos",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 522,
                        "module_id": 17,
                        "title": "Gestión de archivos, pipes y redirección",
                        "slug": "gestion-de-archivos-y-pipes",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 205,
                "course_id": 15,
                "title": "Automatización y red",
                "description": "Bash, scripts y conectividad para operar servidores con confianza.",
                "order": 2,
                "lessons": [
                    {
                        "id": 525,
                        "module_id": 205,
                        "title": "Scripts en Bash y automatización",
                        "slug": "scripts-bash-y-automatizacion",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 526,
                        "module_id": 205,
                        "title": "Redes y conectividad en Linux",
                        "slug": "redes-y-conectividad-linux",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 527,
                        "module_id": 205,
                        "title": "El terminal como entorno de desarrollo",
                        "slug": "entorno-de-desarrollo-linux",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 106,
        "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
        "slug": "git-avanzado-rebase-conflictos",
        "description": "Conviértete en un experto en control de versiones. Domina rebase interactivo, git bisect para encontrar bugs, cherry-pick selectivo, reflog para recuperar commits y resolución de merge conflicts.",
        "category_id": 12,
        "learning_path_id": 7,
        "learning_path_level_id": 23,
        "difficulty": "advanced",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 1,
        "lessons_count": 6,
        "category": {
            "id": 12,
            "name": "Git y Control de Versiones",
            "slug": "git",
            "icon": "GitFork",
            "color": "#FF7043",
            "description": "Git, ramas, colaboración y flujos de trabajo"
        },
        "modules": [
            {
                "id": 232,
                "course_id": 106,
                "title": "Rebase y Limpieza del Historial",
                "description": "Historial lineal y commits atómicos con rebase interactivo.",
                "order": 1,
                "lessons": [
                    {
                        "id": 614,
                        "module_id": 232,
                        "title": "Diferencia real entre Git Merge y Git Rebase",
                        "slug": "git-avanzado-rebase-conflictos-diferencia-real-entre-git-merge-y-git-rebase",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 615,
                        "module_id": 232,
                        "title": "Git Rebase Interactivo: squash, reword, drop y fixup",
                        "slug": "git-avanzado-rebase-conflictos-git-rebase-interactivo-squash-reword-drop-y-fixup",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 616,
                        "module_id": 232,
                        "title": "Reto: Reestructurar una rama caótica antes del Pull Request",
                        "slug": "git-avanzado-rebase-conflictos-reto-reestructurar-una-rama-caotica-antes-del-pull-request",
                        "type": "code_challenge",
                        "duration_minutes": 22,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 233,
                "course_id": 106,
                "title": "Herramientas de Rescate y Depuración",
                "description": "Git reflog, git bisect y cherry-picking.",
                "order": 2,
                "lessons": [
                    {
                        "id": 617,
                        "module_id": 233,
                        "title": "Recuperación de commits perdidos con Git Reflog",
                        "slug": "git-avanzado-rebase-conflictos-recuperacion-de-commits-perdidos-con-git-reflog",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 618,
                        "module_id": 233,
                        "title": "Depuración binaria de regresiones con Git Bisect",
                        "slug": "git-avanzado-rebase-conflictos-depuracion-binaria-de-regresiones-con-git-bisect",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 619,
                        "module_id": 233,
                        "title": "Evaluación final: Estrategias avanzadas en Git",
                        "slug": "git-avanzado-rebase-conflictos-evaluacion-final-estrategias-avanzadas-en-git",
                        "type": "quiz",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 109,
        "title": "Especificación Formal (SRS) y Casos de Uso",
        "slug": "especificacion-srs-diagramas",
        "description": "Aprende a documentar software según el estándar IEEE 830. Diagramas de casos de uso UML, especificación de flujos principales, alternativos y de excepción.",
        "category_id": 13,
        "learning_path_id": 8,
        "learning_path_level_id": 25,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 5,
        "category": {
            "id": 13,
            "name": "Ingeniería de Software",
            "slug": "ingenieria-software",
            "icon": "ClipboardList",
            "color": "#9575CD",
            "description": "Requerimientos, diseño, arquitectura y gestión de proyectos"
        },
        "modules": [
            {
                "id": 236,
                "course_id": 109,
                "title": "Modelado y Documentación Formal",
                "description": "Creación de especificaciones de requerimientos claras y no ambiguas.",
                "order": 1,
                "lessons": [
                    {
                        "id": 626,
                        "module_id": 236,
                        "title": "Estructura de una Especificación de Requisitos de Software (SRS)",
                        "slug": "especificacion-srs-diagramas-estructura-de-una-especificacion-de-requisitos-de-software-srs",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 627,
                        "module_id": 236,
                        "title": "Diagramas de casos de uso y diagramas de secuencia UML",
                        "slug": "especificacion-srs-diagramas-diagramas-de-casos-de-uso-y-diagramas-de-secuencia-uml",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 628,
                        "module_id": 236,
                        "title": "Quiz: Análisis de ambigüedades en requerimientos",
                        "slug": "especificacion-srs-diagramas-quiz-analisis-de-ambiguedades-en-requerimientos",
                        "type": "quiz",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 251,
                "course_id": 109,
                "title": "Módulo 2: Criterios de Aceptación con BDD y Gherkin",
                "description": "Traduce requerimientos ambiguos en pruebas ejecutables con la sintaxis Given / When / Then de Gherkin.",
                "order": 2,
                "lessons": [
                    {
                        "id": 677,
                        "module_id": 251,
                        "title": "Sintaxis Gherkin: El Puente entre Negocio e Ingeniería",
                        "slug": "especificacion-srs-diagramas-bdd-gherkin",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 678,
                        "module_id": 251,
                        "title": "Reto Práctico: Validador de Estructura de Escenarios BDD",
                        "slug": "especificacion-srs-diagramas-reto-parser-bdd",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 6,
        "title": "APIs REST con Laravel",
        "slug": "apis-rest-con-laravel",
        "description": "Diseña e implementa APIs REST profesionales con Laravel: recursos, validación, respuestas JSON consistentes y manejo de errores. Todo lo necesario para exponer tu lógica de negocio.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 9,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 15,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 6,
                "course_id": 6,
                "title": "Principios REST",
                "description": "El estilo arquitectónico y cómo se traduce a rutas y controladores.",
                "order": 1,
                "lessons": [
                    {
                        "id": 11,
                        "module_id": 6,
                        "title": "Principios de diseño REST",
                        "slug": "principios-rest",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 12,
                        "module_id": 6,
                        "title": "Rutas y controladores",
                        "slug": "rutas-y-controladores",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 13,
                        "module_id": 6,
                        "title": "Validación y respuestas JSON",
                        "slug": "validacion-y-respuestas-json",
                        "type": "article",
                        "duration_minutes": 20,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 7,
                "course_id": 6,
                "title": "Eloquent y Seguridad",
                "description": "Modelos, consultas y protección de tu API.",
                "order": 2,
                "lessons": [
                    {
                        "id": 501,
                        "module_id": 7,
                        "title": "Eloquent en tus APIs",
                        "slug": "eloquent-en-apis",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 14,
                        "module_id": 7,
                        "title": "Manejo de errores 4xx y 5xx",
                        "slug": "manejo-de-errores",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 15,
                        "module_id": 7,
                        "title": "Probando APIs con curl",
                        "slug": "probando-apis-con-curl",
                        "type": "code_challenge",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 10,
        "title": "Angular Moderno",
        "slug": "angular-moderno",
        "description": "Frameworks para apps reales: componentes standalone, control flow y Signals. Aprende a estructurar una aplicación Angular con servicios HTTP, routing y lazy loading.",
        "category_id": 10,
        "learning_path_id": 4,
        "learning_path_level_id": 13,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 18,
        "order": 2,
        "lessons_count": 9,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "modules": [
            {
                "id": 11,
                "course_id": 10,
                "title": "Fundamentos de Angular",
                "description": "Componentes, control flow, comunicación y ciclo de vida.",
                "order": 1,
                "lessons": [
                    {
                        "id": 25,
                        "module_id": 11,
                        "title": "Componentes y templates",
                        "slug": "componentes-y-templates",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 26,
                        "module_id": 11,
                        "title": "Control flow, inputs y outputs",
                        "slug": "control-flow-y-comunicacion",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 490,
                        "module_id": 11,
                        "title": "Estilos y ciclo de vida",
                        "slug": "estilos-y-ciclo-de-vida",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 12,
                "course_id": 10,
                "title": "Estado y Datos",
                "description": "Signals, consumo de APIs con HttpClient y formularios reactivos.",
                "order": 2,
                "lessons": [
                    {
                        "id": 27,
                        "module_id": 12,
                        "title": "Estado con Signals",
                        "slug": "estado-con-signals",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 28,
                        "module_id": 12,
                        "title": "HttpClient y servicios",
                        "slug": "http-client-y-servicios",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 491,
                        "module_id": 12,
                        "title": "Formularios reactivos",
                        "slug": "formularios-reactivos",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 195,
                "course_id": 10,
                "title": "Rutas y Producción",
                "description": "Routing con lazy loading, guards y el build de producción.",
                "order": 3,
                "lessons": [
                    {
                        "id": 29,
                        "module_id": 195,
                        "title": "Router y lazy loading",
                        "slug": "router-y-lazy-loading",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 492,
                        "module_id": 195,
                        "title": "Guards y resolvers",
                        "slug": "guards-y-resolvers",
                        "type": "article",
                        "duration_minutes": 13,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 493,
                        "module_id": 195,
                        "title": "Build de producción y despliegue",
                        "slug": "despliegue-angular",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 13,
        "title": "Autenticación JWT de punta a punta",
        "slug": "autenticacion-jwt-web",
        "description": "Implementa login, registro y rutas protegidas en toda la pila: cómo funciona un JWT, dónde guardarlo y cómo proteger el frontend con guards.",
        "category_id": 8,
        "learning_path_id": 5,
        "learning_path_level_id": 16,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 8,
            "name": "Desarrollo Web",
            "slug": "desarrollo-web",
            "icon": "Globe",
            "color": "#26C6DA",
            "description": "Frontend, backend y fullstack"
        },
        "modules": [
            {
                "id": 15,
                "course_id": 13,
                "title": "Tokens y Sesiones",
                "description": "Qué es un JWT, su estructura y cómo se emite y verifica.",
                "order": 1,
                "lessons": [
                    {
                        "id": 34,
                        "module_id": 15,
                        "title": "¿Cómo funciona un JWT?",
                        "slug": "como-funciona-jwt",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 512,
                        "module_id": 15,
                        "title": "Emisión y verificación de JWT en Laravel",
                        "slug": "emitiendo-y-verificando-jwt",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 513,
                        "module_id": 15,
                        "title": "Refresh tokens: renueva sesiones sin pedir el password",
                        "slug": "refresh-tokens",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 201,
                "course_id": 13,
                "title": "Protección en el Frontend",
                "description": "Guards, estado de sesión y cierre de sesión en el cliente.",
                "order": 2,
                "lessons": [
                    {
                        "id": 35,
                        "module_id": 201,
                        "title": "Flujo login/registro y guards de ruta",
                        "slug": "login-registro-y-guards",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 514,
                        "module_id": 201,
                        "title": "Interceptores y estado de sesión",
                        "slug": "interceptores-y-estado-de-sesion",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 515,
                        "module_id": 201,
                        "title": "Errores comunes al proteger la pila completa",
                        "slug": "protegiendo-tu-pila-completa",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 16,
        "title": "Docker y contenedores",
        "slug": "docker-y-contenedores",
        "description": "Empaqueta aplicaciones con imágenes ligeras, orquesta servicios con Compose y despliega contenedores robustos en producción.",
        "category_id": 11,
        "learning_path_id": 6,
        "learning_path_level_id": 19,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 15,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "modules": [
            {
                "id": 18,
                "course_id": 16,
                "title": "Contenedores",
                "description": "Qué son, cómo se construyen y cómo se distribuyen las imágenes.",
                "order": 1,
                "lessons": [
                    {
                        "id": 40,
                        "module_id": 18,
                        "title": "¿Qué es un contenedor?",
                        "slug": "que-es-un-contenedor",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 41,
                        "module_id": 18,
                        "title": "Dockerfile y Docker Compose",
                        "slug": "dockerfile-y-compose",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 528,
                        "module_id": 18,
                        "title": "Imágenes, capas y registries",
                        "slug": "imagenes-y-registries",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 207,
                "course_id": 16,
                "title": "Flujo de trabajo con Docker",
                "description": "Ciclo de vida, redes, volúmenes y producción.",
                "order": 2,
                "lessons": [
                    {
                        "id": 531,
                        "module_id": 207,
                        "title": "Ciclo de vida de contenedores en la práctica",
                        "slug": "contenedores-en-practica",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 532,
                        "module_id": 207,
                        "title": "Redes y volúmenes entre contenedores",
                        "slug": "redes-y-volumenes",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 533,
                        "module_id": 207,
                        "title": "Docker en entornos de producción",
                        "slug": "docker-en-produccion",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 19,
        "title": "Git colaboración y flujos",
        "slug": "git-colaboracion-y-flujos",
        "description": "Trabaja en equipo con pull requests, resuelve conflictos, domina rebase y elige el flujo de ramas adecuado.",
        "category_id": 12,
        "learning_path_id": 7,
        "learning_path_level_id": 22,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 12,
            "name": "Git y Control de Versiones",
            "slug": "git",
            "icon": "GitFork",
            "color": "#FF7043",
            "description": "Git, ramas, colaboración y flujos de trabajo"
        },
        "modules": [
            {
                "id": 21,
                "course_id": 19,
                "title": "Trabajo en equipo",
                "description": "Pull requests, conflictos y reescritura segura de historia.",
                "order": 1,
                "lessons": [
                    {
                        "id": 46,
                        "module_id": 21,
                        "title": "Ramas, merge y pull requests",
                        "slug": "ramas-y-pull-requests",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 47,
                        "module_id": 21,
                        "title": "Conventional Commits y resolución de conflictos",
                        "slug": "conventional-commits-y-conflictos",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 547,
                        "module_id": 21,
                        "title": "Rebase, squash y reescritura segura de historia",
                        "slug": "rebase-y-reescritura",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 212,
                "course_id": 19,
                "title": "Flujos de trabajo",
                "description": "Estrategias de ramas, code review y colaboración abierta.",
                "order": 2,
                "lessons": [
                    {
                        "id": 548,
                        "module_id": 212,
                        "title": "Git Flow y flujos basados en trunk",
                        "slug": "flujos-de-trabajo-git-flow",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 549,
                        "module_id": 212,
                        "title": "Code review efectivo con pull requests",
                        "slug": "code-review-con-git",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 550,
                        "module_id": 212,
                        "title": "Contribuir a proyectos open source",
                        "slug": "open-source-y-forks",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 21,
        "title": "Historias de usuario y casos de uso",
        "slug": "historias-de-usuario-y-casos-de-uso",
        "description": "Modela funcionalidades desde la perspectiva del usuario: historias con criterios de aceptación, épicas y casos de uso con actores y flujos.",
        "category_id": 13,
        "learning_path_id": 8,
        "learning_path_level_id": 25,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 13,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 13,
            "name": "Ingeniería de Software",
            "slug": "ingenieria-software",
            "icon": "ClipboardList",
            "color": "#9575CD",
            "description": "Requerimientos, diseño, arquitectura y gestión de proyectos"
        },
        "modules": [
            {
                "id": 23,
                "course_id": 21,
                "title": "Técnicas de modelado",
                "description": "Historias de usuario, épicas y casos de uso.",
                "order": 1,
                "lessons": [
                    {
                        "id": 50,
                        "module_id": 23,
                        "title": "Historias de usuario con criterios de aceptación",
                        "slug": "historias-de-usuario",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 51,
                        "module_id": 23,
                        "title": "Casos de uso: actores y flujos",
                        "slug": "casos-de-uso",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 559,
                        "module_id": 23,
                        "title": "Épicas, historias y tareas: del nivel estratégico al táctico",
                        "slug": "epicas-historias-y-tareas",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 215,
                "course_id": 21,
                "title": "Aplicación",
                "description": "Criterios con Gherkin, diagramas y backlog.",
                "order": 2,
                "lessons": [
                    {
                        "id": 560,
                        "module_id": 215,
                        "title": "Criterios de aceptación con Gherkin",
                        "slug": "criterios-de-aceptacion-gherkin",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 561,
                        "module_id": 215,
                        "title": "Diagramas y especificaciones de casos de uso",
                        "slug": "diagramas-de-casos-de-uso",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 562,
                        "module_id": 215,
                        "title": "Product Backlog y estimación de historias",
                        "slug": "product-backlog-y-estimar",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 24,
        "title": "Prompt Engineering práctico",
        "slug": "prompt-engineering-practico",
        "description": "Diseña prompts claros, aplica few-shot y cadena de pensamiento, y construye sistemas de prompting sólidos para código y automatización.",
        "category_id": 14,
        "learning_path_id": 9,
        "learning_path_level_id": 28,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 13,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 14,
            "name": "IA para Desarrollo",
            "slug": "ia-desarrollo",
            "icon": "Sparkles",
            "color": "#4DB6AC",
            "description": "LLMs, prompt engineering y desarrollo asistido por IA"
        },
        "modules": [
            {
                "id": 26,
                "course_id": 24,
                "title": "Técnicas de prompting",
                "description": "Prompts claros, few-shot, cadena de pensamiento y RAG.",
                "order": 1,
                "lessons": [
                    {
                        "id": 56,
                        "module_id": 26,
                        "title": "Contexto, rol y formato en los prompts",
                        "slug": "prompts-claros-y-rol",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 57,
                        "module_id": 26,
                        "title": "Few-shot y cadena de pensamiento",
                        "slug": "few-shot-y-cadena-de-pensamiento",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 571,
                        "module_id": 26,
                        "title": "Patrones avanzados: RAG y herramientas",
                        "slug": "patrones-avanzados-rag",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 218,
                "course_id": 24,
                "title": "Uso profesional",
                "description": "Prompts para código, refinamiento y automatización.",
                "order": 2,
                "lessons": [
                    {
                        "id": 572,
                        "module_id": 218,
                        "title": "Prompts efectivos para generar código",
                        "slug": "prompts-para-codigo",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 573,
                        "module_id": 218,
                        "title": "Refinar y evaluar prompts: iteración sistemática",
                        "slug": "refinamiento-y-evaluacion",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 574,
                        "module_id": 218,
                        "title": "Del prompt a la función: automatizar tareas con LLMs",
                        "slug": "del-prompt-a-la-funcion",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 3,
        "title": "SQL desde Cero",
        "slug": "sql-desde-cero",
        "description": "Aprende SQL de manera práctica. Desde SELECT básicos hasta JOINs complejos, subconsultas, índices y optimización de consultas. Ideal para cualquier estudiante de ingeniería.",
        "category_id": 4,
        "learning_path_id": 1,
        "learning_path_level_id": 2,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 2,
        "lessons_count": 9,
        "category": {
            "id": 4,
            "name": "Bases de Datos",
            "slug": "bases-de-datos",
            "icon": "Database",
            "color": "#FFD740",
            "description": "SQL, NoSQL y diseño de bases de datos"
        },
        "modules": [
            {
                "id": 4,
                "course_id": 3,
                "title": "SELECT y Filtros",
                "description": "Consulta los datos con SELECT, filtralos con WHERE y domina los operadores.",
                "order": 1,
                "lessons": [
                    {
                        "id": 6,
                        "module_id": 4,
                        "title": "¿Qué es SQL y las bases de datos relacionales?",
                        "slug": "que-es-sql-y-bases-de-datos",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 7,
                        "module_id": 4,
                        "title": "Tu primer SELECT",
                        "slug": "primer-select",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 431,
                        "module_id": 4,
                        "title": "Filtros con WHERE y operadores",
                        "slug": "filtros-where-y-operadores",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 172,
                "course_id": 3,
                "title": "Relaciones y JOINs",
                "description": "Conecta tablas con claves foráneas y combina sus datos con JOIN.",
                "order": 2,
                "lessons": [
                    {
                        "id": 432,
                        "module_id": 172,
                        "title": "Llaves primarias y foráneas",
                        "slug": "llaves-primarias-y-foraneas",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 433,
                        "module_id": 172,
                        "title": "JOINs: INNER y LEFT",
                        "slug": "joins-inner-y-left",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 434,
                        "module_id": 172,
                        "title": "JOINs múltiples y self JOIN",
                        "slug": "joins-multiples-y-self",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 173,
                "course_id": 3,
                "title": "Agregaciones y Orden",
                "description": "Ordena, limita y resume datos con funciones de agregación, GROUP BY y HAVING.",
                "order": 3,
                "lessons": [
                    {
                        "id": 435,
                        "module_id": 173,
                        "title": "ORDER BY y LIMIT",
                        "slug": "order-by-y-limit",
                        "type": "code_challenge",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 436,
                        "module_id": 173,
                        "title": "Funciones de agregación",
                        "slug": "funciones-de-agregacion",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 437,
                        "module_id": 173,
                        "title": "GROUP BY y HAVING",
                        "slug": "group-by-y-having",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 94,
        "title": "Clases, Objetos y Herencia",
        "slug": "clases-objetos-herencia",
        "description": "Herencia, polimorfismo, encapsulamiento y el criterio para elegir entre composicion e herencia.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 4,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 16,
        "order": 2,
        "lessons_count": 6,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 186,
                "course_id": 94,
                "title": "Herencia y polimorfismo",
                "description": "Reutilizar y especializar comportamiento.",
                "order": 1,
                "lessons": [
                    {
                        "id": 472,
                        "module_id": 186,
                        "title": "Herencia: reutilizar lo que ya funciona",
                        "slug": "poo-herencia",
                        "type": "article",
                        "duration_minutes": 13,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 473,
                        "module_id": 186,
                        "title": "Ejercicio: jerarquía de figuras",
                        "slug": "poo-ejercicio-herencia",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 187,
                "course_id": 94,
                "title": "Encapsulamiento",
                "description": "Ocultar el estado interno y proteger sus invariantes.",
                "order": 2,
                "lessons": [
                    {
                        "id": 474,
                        "module_id": 187,
                        "title": "Encapsulamiento: proteger el estado",
                        "slug": "poo-encapsulamiento",
                        "type": "article",
                        "duration_minutes": 11,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 475,
                        "module_id": 187,
                        "title": "Ejercicio: cuenta con saldo protegido",
                        "slug": "poo-ejercicio-encapsulamiento",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 188,
                "course_id": 94,
                "title": "Composición vs. herencia",
                "description": "El criterio de decisión más importante del diseño OO.",
                "order": 3,
                "lessons": [
                    {
                        "id": 476,
                        "module_id": 188,
                        "title": "Composición o herencia: cómo decidir",
                        "slug": "poo-composicion-vs-herencia",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 477,
                        "module_id": 188,
                        "title": "Ejercicio: pedido compuesto",
                        "slug": "poo-ejercicio-composicion",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 99,
        "title": "Estructuras de Datos Lineales y Complejidad",
        "slug": "estructuras-datos-lineales",
        "description": "Aprende cómo organizar la información en memoria eficientemente. Implementa listas enlazadas, pilas (stacks) y colas (queues), analizando su costo con notación Big-O.",
        "category_id": 2,
        "learning_path_id": 1,
        "learning_path_level_id": 3,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 5,
        "category": {
            "id": 2,
            "name": "Algoritmos",
            "slug": "algoritmos",
            "icon": "GitBranch",
            "color": "#00D9FF",
            "description": "Diseño y análisis de algoritmos"
        },
        "modules": [
            {
                "id": 224,
                "course_id": 99,
                "title": "Notación Asintótica y Big-O",
                "description": "Medición de tiempo y espacio en algoritmos.",
                "order": 1,
                "lessons": [
                    {
                        "id": 591,
                        "module_id": 224,
                        "title": "Complejidad temporal O(1), O(n), O(log n) y O(n²)",
                        "slug": "estructuras-datos-lineales-complejidad-temporal-o1-on-olog-n-y-on2",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 592,
                        "module_id": 224,
                        "title": "Comparación de algoritmos por consumo de memoria",
                        "slug": "estructuras-datos-lineales-comparacion-de-algoritmos-por-consumo-de-memoria",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 225,
                "course_id": 99,
                "title": "Pilas y Colas (LIFO vs FIFO)",
                "description": "Casos de uso reales y construcción paso a paso.",
                "order": 2,
                "lessons": [
                    {
                        "id": 593,
                        "module_id": 225,
                        "title": "Implementación de Pilas con punteros en memoria",
                        "slug": "estructuras-datos-lineales-implementacion-de-pilas-con-punteros-en-memoria",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 594,
                        "module_id": 225,
                        "title": "Reto: Algoritmo de balanceo de paréntesis con Stack",
                        "slug": "estructuras-datos-lineales-reto-algoritmo-de-balanceo-de-parentesis-con-stack",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 595,
                        "module_id": 225,
                        "title": "Quiz: Big-O y Estructuras Lineales",
                        "slug": "estructuras-datos-lineales-quiz-big-o-y-estructuras-lineales",
                        "type": "quiz",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 100,
        "title": "Diseño Modular, Interfaces y Contratos",
        "slug": "diseno-modular-interfaces",
        "description": "Domina el desacoplamiento mediante contratos de interfaz, tipado estricto y polimorfismo. Evita dependencias rígidas y construye código extensible.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 5,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 7,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 226,
                "course_id": 100,
                "title": "Módulo 1: Contratos y Desacoplamiento de Software",
                "description": "Aprende a programar hacia interfaces y no hacia implementaciones concretas (GoF & Clean Code).",
                "order": 1,
                "lessons": [
                    {
                        "id": 596,
                        "module_id": 226,
                        "title": "Definición de contratos con Interfaces vs Clases Abstractas",
                        "slug": "diseno-modular-interfaces-definicion-de-contratos-con-interfaces-vs-clases-abstractas",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 638,
                        "module_id": 226,
                        "title": "Contratos de Software con Interfaces vs Clases Abstractas",
                        "slug": "diseno-modular-interfaces-contratos-de-software-con-interfaces-vs-clases-abstractas",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 597,
                        "module_id": 226,
                        "title": "Inyección de dependencias a través de interfaces",
                        "slug": "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-interfaces",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 639,
                        "module_id": 226,
                        "title": "Reto Práctico: Pasarela de Pago Polimórfica",
                        "slug": "diseno-modular-interfaces-reto-practico-pasarela-de-pago-polimorfica",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 598,
                        "module_id": 226,
                        "title": "Reto: Implementación de pasarela de pago polimórfica",
                        "slug": "diseno-modular-interfaces-reto-implementacion-de-pasarela-de-pago-polimorfica",
                        "type": "code_challenge",
                        "duration_minutes": 22,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 240,
                "course_id": 100,
                "title": "Módulo 2: Inversión de Control e Inyección de Dependencias",
                "description": "Aplica el principio DIP para construir arquitecturas limpias y altamente testeables.",
                "order": 2,
                "lessons": [
                    {
                        "id": 640,
                        "module_id": 240,
                        "title": "Inyección de Dependencias a través de Constructores",
                        "slug": "diseno-modular-interfaces-inyeccion-de-dependencias-a-traves-de-constructores",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 641,
                        "module_id": 240,
                        "title": "Reto Práctico: Servicio de Facturación Desacoplado",
                        "slug": "diseno-modular-interfaces-reto-practico-servicio-de-facturacion-desacoplado",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 102,
        "title": "Protocolo HTTP y Arquitectura Web",
        "slug": "arquitectura-web-http",
        "description": "Comprende el funcionamiento del protocolo que mueve Internet: cabeceras, códigos de estado, métodos idempotentes, CORS, cookies y ciclos de vida Request/Response.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 8,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 2,
        "lessons_count": 7,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 228,
                "course_id": 102,
                "title": "Módulo 1: El Ciclo de Vida Request-Response y Semántica HTTP",
                "description": "Aprende los fundamentos del protocolo que sostiene la web moderna: métodos idempotentes, cabeceras y negociación de contenido.",
                "order": 1,
                "lessons": [
                    {
                        "id": 642,
                        "module_id": 228,
                        "title": "Anatomía de una Petición HTTP y Métodos Idempotentes",
                        "slug": "arquitectura-web-http-anatomia-de-una-peticion-http-y-metodos-idempotentes",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 602,
                        "module_id": 228,
                        "title": "Estructura de peticiones y respuestas: Headers y Body",
                        "slug": "arquitectura-web-http-estructura-de-peticiones-y-respuestas-headers-y-body",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 603,
                        "module_id": 228,
                        "title": "Códigos de estado HTTP y buenas prácticas de uso",
                        "slug": "arquitectura-web-http-codigos-de-estado-http-y-buenas-practicas-de-uso",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 643,
                        "module_id": 228,
                        "title": "Reto Práctico: Parser y Validador de Headers HTTP",
                        "slug": "arquitectura-web-http-reto-practico-parser-y-validador-de-headers-http",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 604,
                        "module_id": 228,
                        "title": "CORS, Cookies y manejo de sesiones sin estado",
                        "slug": "arquitectura-web-http-cors-cookies-y-manejo-de-sesiones-sin-estado",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 241,
                "course_id": 102,
                "title": "Módulo 2: Códigos de Estado y Manejo Semántico de Errores",
                "description": "Aprende a comunicar el estado exacto de una operación sin ambigüedades.",
                "order": 2,
                "lessons": [
                    {
                        "id": 644,
                        "module_id": 241,
                        "title": "Códigos de Estado: 2xx, 4xx y 5xx en la Práctica",
                        "slug": "arquitectura-web-http-codigos-de-estado-2xx-4xx-y-5xx-en-la-practica",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 645,
                        "module_id": 241,
                        "title": "Reto Práctico: Despachador de Status Code REST",
                        "slug": "arquitectura-web-http-reto-practico-despachador-de-status-code-rest",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 103,
        "title": "Diseño y Versionado de APIs RESTful",
        "slug": "diseno-apis-restful",
        "description": "Estandariza tus servicios backend con especificaciones internacionales: versionado por URI/header, paginación con cursor, filtrado dinámico y documentación OpenAPI.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 9,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 5,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 229,
                "course_id": 103,
                "title": "Estándares de Diseño de APIs",
                "description": "Convenciones REST, nombres de recursos y status codes.",
                "order": 1,
                "lessons": [
                    {
                        "id": 605,
                        "module_id": 229,
                        "title": "Nomenclatura RESTful y recursos anidados vs independientes",
                        "slug": "diseno-apis-restful-nomenclatura-restful-y-recursos-anidados-vs-independientes",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 606,
                        "module_id": 229,
                        "title": "Estrategias de versionado y retrocompatibilidad",
                        "slug": "diseno-apis-restful-estrategias-de-versionado-y-retrocompatibilidad",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 607,
                        "module_id": 229,
                        "title": "Paginación eficiente y transformadores de datos (API Resources)",
                        "slug": "diseno-apis-restful-paginacion-eficiente-y-transformadores-de-datos-api-resources",
                        "type": "code_challenge",
                        "duration_minutes": 24,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 249,
                "course_id": 103,
                "title": "Módulo 2: Manejo de Errores RFC 7807 y Contratos OpenAPI",
                "description": "Aprende el estándar Problem Details for HTTP APIs (RFC 7807) para comunicar errores de forma estructurada a tus consumidores.",
                "order": 2,
                "lessons": [
                    {
                        "id": 673,
                        "module_id": 249,
                        "title": "El Estándar RFC 7807: Problem Details",
                        "slug": "diseno-apis-restful-estandar-rfc-7807",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 674,
                        "module_id": 249,
                        "title": "Reto Práctico: Generador de Respuestas de Error RFC 7807",
                        "slug": "diseno-apis-restful-reto-rfc-7807",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 105,
        "title": "TypeScript Profesional para Aplicaciones Frontend",
        "slug": "typescript-profesional-frontend",
        "description": "Desarrolla código robusto y libre de errores en tiempo de ejecución. Tipos avanzados, genéricos, interfaces, type guards y tipado de APIs.",
        "category_id": 10,
        "learning_path_id": 4,
        "learning_path_level_id": 13,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 14,
        "order": 2,
        "lessons_count": 7,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "modules": [
            {
                "id": 231,
                "course_id": 105,
                "title": "Módulo 1: Tipado Estricto, Genéricos y Seguridad en Runtime",
                "description": "Domina el tipado de TypeScript para prevenir bugs antes de ejecutar el código.",
                "order": 1,
                "lessons": [
                    {
                        "id": 646,
                        "module_id": 231,
                        "title": "Genéricos Reutilizables y Narrowing de Tipos",
                        "slug": "typescript-profesional-frontend-genericos-reutilizables-y-narrowing-de-tipos",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 611,
                        "module_id": 231,
                        "title": "Uniones discriminadas, tipos mapeados y keyof",
                        "slug": "typescript-profesional-frontend-uniones-discriminadas-tipos-mapeados-y-keyof",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 612,
                        "module_id": 231,
                        "title": "Genéricos reutilizables para clientes HTTP y estados",
                        "slug": "typescript-profesional-frontend-genericos-reutilizables-para-clientes-http-y-estados",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 647,
                        "module_id": 231,
                        "title": "Reto Práctico: Filtro Genérico Fuertemente Tipado",
                        "slug": "typescript-profesional-frontend-reto-practico-filtro-generico-fuertemente-tipado",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 613,
                        "module_id": 231,
                        "title": "Reto: Modelado con tipado estricto de una API compleja",
                        "slug": "typescript-profesional-frontend-reto-modelado-con-tipado-estricto-de-una-api-compleja",
                        "type": "code_challenge",
                        "duration_minutes": 22,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 242,
                "course_id": 105,
                "title": "Módulo 2: Uniones Discriminadas y Pattern Matching",
                "description": "Estructura estados de UI que hacen que los estados imposibles sean imposibles de representar.",
                "order": 2,
                "lessons": [
                    {
                        "id": 648,
                        "module_id": 242,
                        "title": "Uniones Discriminadas para Estados de Interfaz",
                        "slug": "typescript-profesional-frontend-uniones-discriminadas-para-estados-de-interfaz",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 649,
                        "module_id": 242,
                        "title": "Reto Práctico: Reductor de Estado con Unión Discriminada",
                        "slug": "typescript-profesional-frontend-reto-practico-reductor-de-estado-con-union-discriminada",
                        "type": "code_challenge",
                        "duration_minutes": 22,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 107,
        "title": "Docker Compose y Arquitecturas Multiservicio",
        "slug": "docker-compose-multiservicio",
        "description": "Orquesta entornos completos de desarrollo y producción con bases de datos, caché Redis, servidores web y workers integrados en redes aisladas.",
        "category_id": 11,
        "learning_path_id": 6,
        "learning_path_level_id": 19,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 2,
        "lessons_count": 7,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "modules": [
            {
                "id": 234,
                "course_id": 107,
                "title": "Módulo 1: Orquestación Local y Redes Aisladas",
                "description": "Define entornos reproducibles de backend, base de datos y caché con compose.yaml.",
                "order": 1,
                "lessons": [
                    {
                        "id": 620,
                        "module_id": 234,
                        "title": "Estructura del archivo compose.yaml y directivas esenciales",
                        "slug": "docker-compose-multiservicio-estructura-del-archivo-composeyaml-y-directivas-esenciales",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 654,
                        "module_id": 234,
                        "title": "Estructura Limpia de un Archivo Compose",
                        "slug": "docker-compose-multiservicio-estructura-limpia-de-un-archivo-compose",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 621,
                        "module_id": 234,
                        "title": "Persistencia con volúmenes y variables de entorno seguras",
                        "slug": "docker-compose-multiservicio-persistencia-con-volumenes-y-variables-de-entorno-seguras",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 655,
                        "module_id": 234,
                        "title": "Reto Práctico: Generador de String de Conexión Docker",
                        "slug": "docker-compose-multiservicio-reto-practico-generador-de-string-de-conexion-docker",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 622,
                        "module_id": 234,
                        "title": "Reto: Levantar stack PHP + Postgres + Redis con Compose",
                        "slug": "docker-compose-multiservicio-reto-levantar-stack-php-postgres-redis-con-compose",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 244,
                "course_id": 107,
                "title": "Módulo 2: Optimización con Multi-stage Builds",
                "description": "Reduce el tamaño de tus imágenes de producción hasta en un 80% usando constructores temporales.",
                "order": 2,
                "lessons": [
                    {
                        "id": 656,
                        "module_id": 244,
                        "title": "El Patrón Multi-stage Build",
                        "slug": "docker-compose-multiservicio-el-patron-multi-stage-build",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 657,
                        "module_id": 244,
                        "title": "Reto Práctico: Estimador de Ahorro Multi-stage",
                        "slug": "docker-compose-multiservicio-reto-practico-estimador-de-ahorro-multi-stage",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 92,
        "title": "PSeInt desde cero",
        "slug": "pseint-desde-cero",
        "description": "Aprende a pensar como programador sin ahogarte en sintaxis. PSeInt es un lenguaje de pseudocódigo en español: describes el algoritmo con palabras como \"Leer\", \"Escribir\" y \"Si\", y la máquina lo ejecuta. Es el mejor punto de partida para aprender lógica de programación.",
        "category_id": 1,
        "learning_path_id": 1,
        "learning_path_level_id": 1,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 2,
        "lessons_count": 9,
        "category": {
            "id": 1,
            "name": "Programación Básica",
            "slug": "programacion-basica",
            "icon": "Code",
            "color": "#6C63FF",
            "description": "Fundamentos de programación y pensamiento lógico"
        },
        "modules": [
            {
                "id": 174,
                "course_id": 92,
                "title": "Primeros pasos con PSeInt",
                "description": "La estructura de un algoritmo y las dos únicas instrucciones que necesitas para empezar.",
                "order": 1,
                "lessons": [
                    {
                        "id": 438,
                        "module_id": 174,
                        "title": "¿Qué es un algoritmo?",
                        "slug": "pseint-que-es-algoritmo",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 439,
                        "module_id": 174,
                        "title": "La estructura de un algoritmo y la salida",
                        "slug": "pseint-estructura-y-salida",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 440,
                        "module_id": 174,
                        "title": "Ejercicio: tu primer algoritmo",
                        "slug": "pseint-ejercicio-hola-mundo",
                        "type": "code_challenge",
                        "duration_minutes": 12,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 175,
                "course_id": 92,
                "title": "Variables y lectura de datos",
                "description": "Declarar, leer y usar los datos que recibe el programa.",
                "order": 2,
                "lessons": [
                    {
                        "id": 441,
                        "module_id": 175,
                        "title": "Definir, Leer y usar: las variables",
                        "slug": "pseint-definir-y-leer",
                        "type": "article",
                        "duration_minutes": 13,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 442,
                        "module_id": 175,
                        "title": "Tipos de datos y operaciones básicas",
                        "slug": "pseint-tipos-y-operaciones",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 443,
                        "module_id": 175,
                        "title": "Ejercicio: calcula el promedio de edad",
                        "slug": "pseint-ejercicio-promedio-edad",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 176,
                "course_id": 92,
                "title": "Condicionales y ciclos",
                "description": "Tomar decisiones y repetir tareas: el corazón de cualquier algoritmo.",
                "order": 3,
                "lessons": [
                    {
                        "id": 444,
                        "module_id": 176,
                        "title": "Si, Entonces y Sino",
                        "slug": "pseint-condicionales",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 445,
                        "module_id": 176,
                        "title": "Repetir con While y Para",
                        "slug": "pseint-ciclos",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 446,
                        "module_id": 176,
                        "title": "Ejercicio: par o impar",
                        "slug": "pseint-ejercicio-par-impar",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 108,
        "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
        "slug": "rag-embeddings-bases-vectoriales",
        "description": "Aprende a conectar Modelos de Lenguaje con tu propia base de conocimiento privada. Embeddings de texto, fragmentación de documentos, cálculo de similitud coseno y búsqueda semántica con PgVector.",
        "category_id": 14,
        "learning_path_id": 9,
        "learning_path_level_id": 28,
        "difficulty": "advanced",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 14,
        "order": 2,
        "lessons_count": 7,
        "category": {
            "id": 14,
            "name": "IA para Desarrollo",
            "slug": "ia-desarrollo",
            "icon": "Sparkles",
            "color": "#4DB6AC",
            "description": "LLMs, prompt engineering y desarrollo asistido por IA"
        },
        "modules": [
            {
                "id": 235,
                "course_id": 108,
                "title": "Módulo 1: Fundamentos de Embeddings y Segmentación de Texto",
                "description": "Aprende a transformar texto técnico en representaciones numéricas de alta dimensión.",
                "order": 1,
                "lessons": [
                    {
                        "id": 623,
                        "module_id": 235,
                        "title": "Qué es un vector embedding y cómo cuantifica el significado",
                        "slug": "rag-embeddings-bases-vectoriales-que-es-un-vector-embedding-y-como-cuantifica-el-significado",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 650,
                        "module_id": 235,
                        "title": "Qué es un Embedding y Estrategias de Chunking",
                        "slug": "rag-embeddings-bases-vectoriales-que-es-un-embedding-y-estrategias-de-chunking",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 624,
                        "module_id": 235,
                        "title": "Estrategias de chunking y preprocesamiento de textos técnicos",
                        "slug": "rag-embeddings-bases-vectoriales-estrategias-de-chunking-y-preprocesamiento-de-textos-tecnicos",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 651,
                        "module_id": 235,
                        "title": "Reto Práctico: Algoritmo de Chunking con Solapamiento",
                        "slug": "rag-embeddings-bases-vectoriales-reto-practico-algoritmo-de-chunking-con-solapamiento",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 625,
                        "module_id": 235,
                        "title": "Reto: Implementación de búsqueda semántica con similitud coseno",
                        "slug": "rag-embeddings-bases-vectoriales-reto-implementacion-de-busqueda-semantica-con-similitud-coseno",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 243,
                "course_id": 108,
                "title": "Módulo 2: Búsqueda Semántica con Similitud Coseno",
                "description": "Construye el motor de recuperación que conecta tus documentos con el LLM.",
                "order": 2,
                "lessons": [
                    {
                        "id": 652,
                        "module_id": 243,
                        "title": "Similitud Coseno vs Distancia Euclidiana",
                        "slug": "rag-embeddings-bases-vectoriales-similitud-coseno-vs-distancia-euclidiana",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 653,
                        "module_id": 243,
                        "title": "Reto Práctico: Buscador Semántico Top-K",
                        "slug": "rag-embeddings-bases-vectoriales-reto-practico-buscador-semantico-top-k",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 14,
        "title": "Despliegue Full Stack",
        "slug": "despliegue-fullstack",
        "description": "Lleva tu aplicación a producción: build optimizado, variables de entorno y servir estáticos y API detrás de un reverse proxy.",
        "category_id": 11,
        "learning_path_id": 5,
        "learning_path_level_id": 17,
        "difficulty": "advanced",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 8,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "modules": [
            {
                "id": 16,
                "course_id": 14,
                "title": "Producción",
                "description": "Builds, variables de entorno y servidores estáticos.",
                "order": 1,
                "lessons": [
                    {
                        "id": 36,
                        "module_id": 16,
                        "title": "Build de producción y variables de entorno",
                        "slug": "build-y-variables-de-produccion",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 37,
                        "module_id": 16,
                        "title": "Servir estáticos con un reverse proxy",
                        "slug": "estaticos-y-reverse-proxy",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 516,
                        "module_id": 16,
                        "title": "Monitoreo y rollback tras el despliegue",
                        "slug": "monitoreo-post-deploy",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 202,
                "course_id": 14,
                "title": "Estrategias de despliegue",
                "description": "Más allá del deploy: estrategias sin corte, configuración y observabilidad.",
                "order": 2,
                "lessons": [
                    {
                        "id": 517,
                        "module_id": 202,
                        "title": "Estrategias: blue-green, canary y rolling",
                        "slug": "estrategias-blue-green-y-canary",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 518,
                        "module_id": 202,
                        "title": "Configuración y secretos en producción",
                        "slug": "configuracion-y-secretos-en-produccion",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 519,
                        "module_id": 202,
                        "title": "Observabilidad: logs, métricas y alertas",
                        "slug": "observabilidad-logs-y-alertas",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 104,
        "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
        "slug": "css-moderno-flexbox-grid",
        "description": "Domina el diseño web profesional sin depender de librerías externas. Layouts fluidos, diseño adaptativo, variables nativas CSS y técnicas modernas de maquetación.",
        "category_id": 10,
        "learning_path_id": 4,
        "learning_path_level_id": 12,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 3,
        "lessons_count": 5,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "modules": [
            {
                "id": 230,
                "course_id": 104,
                "title": "Sistemas de Layout Moderno",
                "description": "Flexbox para ejes y CSS Grid para estructuras bidimensionales.",
                "order": 1,
                "lessons": [
                    {
                        "id": 608,
                        "module_id": 230,
                        "title": "Flexbox a fondo: alineación, distribución y wrapping",
                        "slug": "css-moderno-flexbox-grid-flexbox-a-fondo-alineacion-distribucion-y-wrapping",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 609,
                        "module_id": 230,
                        "title": "CSS Grid: áreas, columnas implícitas y minmax()",
                        "slug": "css-moderno-flexbox-grid-css-grid-areas-columnas-implicitas-y-minmax",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 610,
                        "module_id": 230,
                        "title": "Reto: Construcción de una interfaz tipo dashboard responsiva",
                        "slug": "css-moderno-flexbox-grid-reto-construccion-de-una-interfaz-tipo-dashboard-responsiva",
                        "type": "code_challenge",
                        "duration_minutes": 25,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 250,
                "course_id": 104,
                "title": "Módulo 2: Diseño Fluido y Sistemas de Espaciado con Variables CSS",
                "description": "Aprende a diseñar sistemas de diseño escalables con funciones matemáticas de CSS como clamp() y calc().",
                "order": 2,
                "lessons": [
                    {
                        "id": 675,
                        "module_id": 250,
                        "title": "Tipografía y Espaciado Fluido con clamp()",
                        "slug": "css-moderno-flexbox-grid-diseno-fluido-clamp",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 676,
                        "module_id": 250,
                        "title": "Reto Práctico: Generador de Propiedad CSS Grid Auto-fit",
                        "slug": "css-moderno-flexbox-grid-reto-generador-grid",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 22,
        "title": "Gestión de requerimientos",
        "slug": "gestion-de-requerimientos",
        "description": "Prioriza con MoSCoW, gestiona el cambio con trazabilidad y comunica con stakeholders como un profesional.",
        "category_id": 13,
        "learning_path_id": 8,
        "learning_path_level_id": 26,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": false,
        "price": 0,
        "duration_hours": 11,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 13,
            "name": "Ingeniería de Software",
            "slug": "ingenieria-software",
            "icon": "ClipboardList",
            "color": "#9575CD",
            "description": "Requerimientos, diseño, arquitectura y gestión de proyectos"
        },
        "modules": [
            {
                "id": 24,
                "course_id": 22,
                "title": "Gestión del cambio",
                "description": "Priorización, trazabilidad y control de cambios.",
                "order": 1,
                "lessons": [
                    {
                        "id": 52,
                        "module_id": 24,
                        "title": "Priorización con MoSCoW",
                        "slug": "priorizacion-moscow",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 53,
                        "module_id": 24,
                        "title": "Trazabilidad y gestión del cambio",
                        "slug": "trazabilidad-y-gestion-del-cambio",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 563,
                        "module_id": 24,
                        "title": "Matrices de trazabilidad y su mantenimiento",
                        "slug": "matrices-de-trazabilidad",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 216,
                "course_id": 22,
                "title": "Comunicación y herramientas",
                "description": "Solicitudes de cambio, stakeholders y herramientas de gestión.",
                "order": 2,
                "lessons": [
                    {
                        "id": 564,
                        "module_id": 216,
                        "title": "Solicitudes de cambio y control de versiones de requerimientos",
                        "slug": "solicitudes-de-cambio",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 565,
                        "module_id": 216,
                        "title": "Comunicación efectiva con stakeholders",
                        "slug": "comunicacion-con-stakeholders",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 566,
                        "module_id": 216,
                        "title": "Herramientas y métricas en gestión de requerimientos",
                        "slug": "herramientas-de-gestion",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 7,
        "title": "Modelos, Relaciones y Consultas",
        "slug": "modelos-relaciones-y-consultas",
        "description": "Domina Eloquent: migraciones que versionan el esquema, relaciones que conectan tablas y consultas eficientes que evitan el problema N+1.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 10,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 12,
        "order": 3,
        "lessons_count": 8,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 8,
                "course_id": 7,
                "title": "Eloquent y el Modelo de Datos",
                "description": "Migraciones, modelos y atributos para modelar la base de datos.",
                "order": 1,
                "lessons": [
                    {
                        "id": 16,
                        "module_id": 8,
                        "title": "Modelos y migraciones en Eloquent",
                        "slug": "modelos-y-migraciones",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 17,
                        "module_id": 8,
                        "title": "Relaciones uno a muchos y muchos a muchos",
                        "slug": "relaciones-uno-a-muchos",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 18,
                        "module_id": 8,
                        "title": "Consultas eficientes e índices",
                        "slug": "consultas-e-indices",
                        "type": "article",
                        "duration_minutes": 20,
                        "order": 3,
                        "is_preview": false
                    },
                    {
                        "id": 669,
                        "module_id": 8,
                        "title": "Reto Práctico: Simulación de Eager Loading y Filtrado Relacional",
                        "slug": "modelos-relaciones-reto-filtrado-relacional",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 4,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 198,
                "course_id": 7,
                "title": "Consultas Avanzadas",
                "description": "Scope, agregaciones y transacciones para casos reales.",
                "order": 2,
                "lessons": [
                    {
                        "id": 502,
                        "module_id": 198,
                        "title": "Scopes y consultas reutilizables",
                        "slug": "scopes-y-consultas-reutilizables",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 503,
                        "module_id": 198,
                        "title": "Agregaciones y consultas complejas",
                        "slug": "agregaciones-y-consultas-complejas",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 504,
                        "module_id": 198,
                        "title": "Transacciones y consistencia",
                        "slug": "transacciones-y-consistencia",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    },
                    {
                        "id": 670,
                        "module_id": 198,
                        "title": "Reto Práctico: Agregaciones Puras y Reducción de Totales",
                        "slug": "modelos-relaciones-reto-calculo-agregaciones",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 4,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 95,
        "title": "Principios SOLID en la práctica",
        "slug": "principios-solid",
        "description": "Los cinco principios que hacen que el software sea ampliable y mantenible, con ejemplos de Python y refactorizaciones paso a paso.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 5,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 18,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 189,
                "course_id": 95,
                "title": "SRP — Responsabilidad Única",
                "description": "Una causa para cambiar.",
                "order": 1,
                "lessons": [
                    {
                        "id": 478,
                        "module_id": 189,
                        "title": "SRP: una sola causa para cambiar",
                        "slug": "poo-srp",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 479,
                        "module_id": 189,
                        "title": "Ejercicio: separa responsabilidades",
                        "slug": "poo-ejercicio-srp",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 190,
                "course_id": 95,
                "title": "OCP y LSP",
                "description": "Abierto/cerrado y sustitución de tipos.",
                "order": 2,
                "lessons": [
                    {
                        "id": 480,
                        "module_id": 190,
                        "title": "OCP y LSP: extensibilidad y substitutabilidad",
                        "slug": "poo-ocp-lsp",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 481,
                        "module_id": 190,
                        "title": "Ejercicio:.shape sin if/else",
                        "slug": "poo-ejercicio-ocp",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 191,
                "course_id": 95,
                "title": "ISP y DIP",
                "description": "Interfaces pequeñas y dependencias hacia las abstracciones.",
                "order": 3,
                "lessons": [
                    {
                        "id": 482,
                        "module_id": 191,
                        "title": "ISP y DIP: interfaces mínimas y dependencias invertidas",
                        "slug": "poo-isp-dip",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 483,
                        "module_id": 191,
                        "title": "Ejercicio: inyección de dependencias",
                        "slug": "poo-ejercicio-dip",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 11,
        "title": "Accesibilidad y Performance Web",
        "slug": "accesibilidad-y-performance-web",
        "description": "Haz tu interfaz usable para todas las personas y rápida para todos los dispositivos: criterios WCAG y métricas Core Web Vitals en la práctica.",
        "category_id": 10,
        "learning_path_id": 4,
        "learning_path_level_id": 14,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 8,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "modules": [
            {
                "id": 13,
                "course_id": 11,
                "title": "Accesibilidad",
                "description": "WCAG, HTML accesible, ARIA y herramientas de verificación.",
                "order": 1,
                "lessons": [
                    {
                        "id": 30,
                        "module_id": 13,
                        "title": "Accesibilidad: WCAG en la práctica",
                        "slug": "accesibilidad-wcag",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 494,
                        "module_id": 13,
                        "title": "HTML accesible y ARIA",
                        "slug": "html-accesible-y-aria",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 495,
                        "module_id": 13,
                        "title": "Herramientas para evaluar accesibilidad",
                        "slug": "testing-de-accesibilidad",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 196,
                "course_id": 11,
                "title": "Performance",
                "description": "Core Web Vitals, optimización de recursos y métricas en producción.",
                "order": 2,
                "lessons": [
                    {
                        "id": 31,
                        "module_id": 196,
                        "title": "Core Web Vitals y performance",
                        "slug": "core-web-vitals",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 496,
                        "module_id": 196,
                        "title": "Optimización de recursos",
                        "slug": "optimizacion-de-recursos",
                        "type": "code_challenge",
                        "duration_minutes": 14,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 497,
                        "module_id": 196,
                        "title": "Medición y presupuestos de rendimiento",
                        "slug": "medicion-y-presupuestos",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 17,
        "title": "CI/CD con GitHub Actions",
        "slug": "ci-cd-github-actions",
        "description": "Automatiza pruebas, calidad y despliegues con pipelines que se ejecutan en cada cambio de tu repositorio.",
        "category_id": 11,
        "learning_path_id": 6,
        "learning_path_level_id": 20,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": false,
        "price": 0,
        "duration_hours": 13,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "modules": [
            {
                "id": 19,
                "course_id": 17,
                "title": "Pipelines",
                "description": "Fundamentos de integración y despliegue continuos con Actions.",
                "order": 1,
                "lessons": [
                    {
                        "id": 42,
                        "module_id": 19,
                        "title": "Integración y despliegue continuos",
                        "slug": "que-es-ci-cd",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 43,
                        "module_id": 19,
                        "title": "GitHub Actions en la práctica",
                        "slug": "github-actions-en-practica",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 534,
                        "module_id": 19,
                        "title": "Workflows, jobs y steps en profundidad",
                        "slug": "workflows-y-jobs",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 209,
                "course_id": 17,
                "title": "Calidad y despliegue",
                "description": "Tests, calidad, despliegue continuo y seguridad del pipeline.",
                "order": 2,
                "lessons": [
                    {
                        "id": 536,
                        "module_id": 209,
                        "title": "Tests, lint y calidad en CI",
                        "slug": "tests-y-calidad-en-ci",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 537,
                        "module_id": 209,
                        "title": "Deploy continuo con Actions",
                        "slug": "despliegue-continuo",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 538,
                        "module_id": 209,
                        "title": "Seguridad y buenas prácticas en CI/CD",
                        "slug": "seguridad-y-buenas-practicas-cicd",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 25,
        "title": "IA en el ciclo de desarrollo",
        "slug": "ia-en-el-ciclo-de-desarrollo",
        "description": "Aprovecha asistentes de código, usa IA en review y tests, y lleva sistemas generativos a producción con evaluación y seguridad.",
        "category_id": 14,
        "learning_path_id": 9,
        "learning_path_level_id": 29,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": false,
        "price": 0,
        "duration_hours": 12,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 14,
            "name": "IA para Desarrollo",
            "slug": "ia-desarrollo",
            "icon": "Sparkles",
            "color": "#4DB6AC",
            "description": "LLMs, prompt engineering y desarrollo asistido por IA"
        },
        "modules": [
            {
                "id": 27,
                "course_id": 25,
                "title": "Flujo de trabajo aumentado",
                "description": "Asistentes de código, IA en review y en diseño.",
                "order": 1,
                "lessons": [
                    {
                        "id": 58,
                        "module_id": 27,
                        "title": "Asistentes de código y pair programming con IA",
                        "slug": "asistentes-de-codigo",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 59,
                        "module_id": 27,
                        "title": "IA en code review, tests y documentación",
                        "slug": "ia-en-code-review-y-tests",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 575,
                        "module_id": 27,
                        "title": "IA para diseño y arquitectura de soluciones",
                        "slug": "ia-en-diseno-y-arquitectura",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 219,
                "course_id": 25,
                "title": "Integración avanzada",
                "description": "Producción, evaluación y seguridad de sistemas con IA.",
                "order": 2,
                "lessons": [
                    {
                        "id": 576,
                        "module_id": 219,
                        "title": "Llevar IA generativa a producción",
                        "slug": "ia-generativa-en-produccion",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 577,
                        "module_id": 219,
                        "title": "Evaluación y métricas de calidad en sistemas con IA",
                        "slug": "evaluacion-y-metricas-de-ia",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 578,
                        "module_id": 219,
                        "title": "Seguridad y privacidad al usar IA en el desarrollo",
                        "slug": "seguridad-y-privacidad-con-ia",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 97,
        "title": "Lógica y Pensamiento Computacional",
        "slug": "logica-pensamiento-computacional",
        "description": "Aprende a descomponer problemas complejos en pasos lógicos ejecutables. Domina diagramas de flujo, tablas de verdad, pseudocódigo y resolución estructurada de problemas.",
        "category_id": 1,
        "learning_path_id": 1,
        "learning_path_level_id": 1,
        "difficulty": "beginner",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 10,
        "order": 3,
        "lessons_count": 6,
        "category": {
            "id": 1,
            "name": "Programación Básica",
            "slug": "programacion-basica",
            "icon": "Code",
            "color": "#6C63FF",
            "description": "Fundamentos de programación y pensamiento lógico"
        },
        "modules": [
            {
                "id": 220,
                "course_id": 97,
                "title": "Fundamentos del Pensamiento Lógico",
                "description": "Descomposición algorítmica y abstracción.",
                "order": 1,
                "lessons": [
                    {
                        "id": 579,
                        "module_id": 220,
                        "title": "Qué es un algoritmo y propiedades de una solución",
                        "slug": "logica-pensamiento-computacional-que-es-un-algoritmo-y-propiedades-de-una-solucion",
                        "type": "article",
                        "duration_minutes": 12,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 580,
                        "module_id": 220,
                        "title": "Diagramas de flujo y representación gráfica de decisiones",
                        "slug": "logica-pensamiento-computacional-diagramas-de-flujo-y-representacion-grafica-de-decisiones",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 581,
                        "module_id": 220,
                        "title": "Operadores booleanos y tablas de verdad",
                        "slug": "logica-pensamiento-computacional-operadores-booleanos-y-tablas-de-verdad",
                        "type": "code_challenge",
                        "duration_minutes": 18,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 221,
                "course_id": 97,
                "title": "Estructuración de Algoritmos",
                "description": "Estructuras de decisión y repetición.",
                "order": 2,
                "lessons": [
                    {
                        "id": 582,
                        "module_id": 221,
                        "title": "Condicionales anidados y múltiples caminos lógicos",
                        "slug": "logica-pensamiento-computacional-condicionales-anidados-y-multiples-caminos-logicos",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 583,
                        "module_id": 221,
                        "title": "Bucles de control: mientras vs para",
                        "slug": "logica-pensamiento-computacional-bucles-de-control-mientras-vs-para",
                        "type": "code_challenge",
                        "duration_minutes": 20,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 584,
                        "module_id": 221,
                        "title": "Quiz formativo: Pensamiento Lógico",
                        "slug": "logica-pensamiento-computacional-quiz-formativo-pensamiento-logico",
                        "type": "quiz",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 8,
        "title": "Seguridad en APIs",
        "slug": "seguridad-en-apis",
        "description": "Protege tus servicios: autenticación con tokens, vulnerabilidades OWASP más comunes y manejo seguro de secretos. La seguridad no es un extra, es parte del diseño.",
        "category_id": 9,
        "learning_path_id": 3,
        "learning_path_level_id": 11,
        "difficulty": "intermediate",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 8,
        "order": 4,
        "lessons_count": 6,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "modules": [
            {
                "id": 9,
                "course_id": 8,
                "title": "Autenticación y Protección",
                "description": "Tokens, middleware y control de acceso en tus APIs.",
                "order": 1,
                "lessons": [
                    {
                        "id": 19,
                        "module_id": 9,
                        "title": "Autenticación con tokens (Sanctum)",
                        "slug": "autenticacion-con-tokens",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": true
                    },
                    {
                        "id": 20,
                        "module_id": 9,
                        "title": "OWASP Top 10 para desarrolladores",
                        "slug": "owasp-para-desarrolladores",
                        "type": "article",
                        "duration_minutes": 18,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 21,
                        "module_id": 9,
                        "title": "Secretos y variables de entorno",
                        "slug": "secretos-y-variables-de-entorno",
                        "type": "article",
                        "duration_minutes": 10,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 199,
                "course_id": 8,
                "title": "Defensa en profundidad",
                "description": "Seguridad más allá de la autenticación: errores, abuso y datos.",
                "order": 2,
                "lessons": [
                    {
                        "id": 505,
                        "module_id": 199,
                        "title": "Manejo seguro de errores y logging",
                        "slug": "manejo-seguro-de-errores",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 506,
                        "module_id": 199,
                        "title": "Rate limiting y protección contra abuso",
                        "slug": "rate-limiting-y-proteccion-de-abuso",
                        "type": "code_challenge",
                        "duration_minutes": 17,
                        "order": 2,
                        "is_preview": false
                    },
                    {
                        "id": 507,
                        "module_id": 199,
                        "title": "Cifrado, cabeceras de seguridad y privacidad",
                        "slug": "cifrado-y-privacidad-de-datos",
                        "type": "article",
                        "duration_minutes": 16,
                        "order": 3,
                        "is_preview": false
                    }
                ]
            }
        ]
    },
    {
        "id": 96,
        "title": "Patrones de Diseño",
        "slug": "patrones-de-diseno",
        "description": "Soluciones reutilizables a problemas recurrentes del diseño de software: creacionales, estructurales y comportamentales con implementaciones en Python.",
        "category_id": 3,
        "learning_path_id": 2,
        "learning_path_level_id": 6,
        "difficulty": "advanced",
        "thumbnail": null,
        "is_published": true,
        "is_free": true,
        "price": 0,
        "duration_hours": 20,
        "order": 4,
        "lessons_count": 6,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "modules": [
            {
                "id": 192,
                "course_id": 96,
                "title": "Patrones creacionales",
                "description": "Factory y Singleton.",
                "order": 1,
                "lessons": [
                    {
                        "id": 484,
                        "module_id": 192,
                        "title": "Creacionales: Factory y Singleton",
                        "slug": "poo-patrones-creacionales",
                        "type": "article",
                        "duration_minutes": 14,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 485,
                        "module_id": 192,
                        "title": "Ejercicio: fábrica de vehículos",
                        "slug": "poo-ejercicio-factory",
                        "type": "code_challenge",
                        "duration_minutes": 16,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 193,
                "course_id": 96,
                "title": "Patrones estructurales",
                "description": "Adapter y Decorator.",
                "order": 2,
                "lessons": [
                    {
                        "id": 486,
                        "module_id": 193,
                        "title": "Estructurales: Adapter y Decorator",
                        "slug": "poo-patrones-estructurales",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 487,
                        "module_id": 193,
                        "title": "Ejercicio: deco contador de llamadas",
                        "slug": "poo-ejercicio-decorator",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            },
            {
                "id": 194,
                "course_id": 96,
                "title": "Patrones comportamentales",
                "description": "Strategy y Observer.",
                "order": 3,
                "lessons": [
                    {
                        "id": 488,
                        "module_id": 194,
                        "title": "Comportamentales: Strategy y Observer",
                        "slug": "poo-patrones-comportamentales",
                        "type": "article",
                        "duration_minutes": 15,
                        "order": 1,
                        "is_preview": false
                    },
                    {
                        "id": 489,
                        "module_id": 194,
                        "title": "Ejercicio: strategy de compresión",
                        "slug": "poo-ejercicio-strategy",
                        "type": "code_challenge",
                        "duration_minutes": 15,
                        "order": 2,
                        "is_preview": false
                    }
                ]
            }
        ]
    }
];

export const FALLBACK_LEARNING_PATHS: LearningPath[] = [
    {
        "id": 1,
        "title": "Fundamentos de Programación",
        "slug": "fundamentos-programacion",
        "description": "Aprende a programar desde cero. Esta ruta te lleva desde los conceptos más básicos hasta algoritmos y estructuras de datos fundamentales, preparándote para cualquier lenguaje de programación.",
        "difficulty": "beginner",
        "is_published": true,
        "estimated_hours": 60,
        "courses_count": 7,
        "category_id": 2,
        "category": {
            "id": 2,
            "name": "Algoritmos",
            "slug": "algoritmos",
            "icon": "GitBranch",
            "color": "#00D9FF",
            "description": "Diseño y análisis de algoritmos"
        },
        "levels": [
            {
                "id": 1,
                "learning_path_id": 1,
                "title": "Nivel 1 — Pensamiento Lógico",
                "description": "Variables, tipos de datos, operadores y estructuras de control básicas.",
                "order": 1,
                "courses": [
                    {
                        "id": 1,
                        "title": "Introducción a la Programación",
                        "slug": "introduccion-programacion",
                        "description": "Aprende los fundamentos absolutos de la programación. Sin experiencia previa requerida. Cubriremos variables, tipos de datos, estructuras de control y funciones básicas con ejemplos prácticos.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 19,
                        "category": {
                            "id": 1,
                            "name": "Programación Básica",
                            "slug": "programacion-basica",
                            "icon": "Code",
                            "color": "#6C63FF"
                        }
                    },
                    {
                        "id": 92,
                        "title": "PSeInt desde cero",
                        "slug": "pseint-desde-cero",
                        "description": "Aprende a pensar como programador sin ahogarte en sintaxis. PSeInt es un lenguaje de pseudocódigo en español: describes el algoritmo con palabras como \"Leer\", \"Escribir\" y \"Si\", y la máquina lo ejecuta. Es el mejor punto de partida para aprender lógica de programación.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 9,
                        "category": {
                            "id": 1,
                            "name": "Programación Básica",
                            "slug": "programacion-basica",
                            "icon": "Code",
                            "color": "#6C63FF"
                        }
                    },
                    {
                        "id": 97,
                        "title": "Lógica y Pensamiento Computacional",
                        "slug": "logica-pensamiento-computacional",
                        "description": "Aprende a descomponer problemas complejos en pasos lógicos ejecutables. Domina diagramas de flujo, tablas de verdad, pseudocódigo y resolución estructurada de problemas.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 6,
                        "category": {
                            "id": 1,
                            "name": "Programación Básica",
                            "slug": "programacion-basica",
                            "icon": "Code",
                            "color": "#6C63FF"
                        }
                    }
                ]
            },
            {
                "id": 2,
                "learning_path_id": 1,
                "title": "Nivel 2 — Programación Estructurada",
                "description": "Funciones, recursión, arrays y manejo de cadenas.",
                "order": 2,
                "courses": [
                    {
                        "id": 98,
                        "title": "Programación Estructurada con Python",
                        "slug": "python-estructurado",
                        "description": "Implementa soluciones modulares utilizando el lenguaje más versátil del mercado. Funciones, ámbito de variables, estructuras compuestas y manejo de excepciones.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 14,
                        "lessons_count": 6,
                        "category": {
                            "id": 1,
                            "name": "Programación Básica",
                            "slug": "programacion-basica",
                            "icon": "Code",
                            "color": "#6C63FF"
                        }
                    },
                    {
                        "id": 3,
                        "title": "SQL desde Cero",
                        "slug": "sql-desde-cero",
                        "description": "Aprende SQL de manera práctica. Desde SELECT básicos hasta JOINs complejos, subconsultas, índices y optimización de consultas. Ideal para cualquier estudiante de ingeniería.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 9,
                        "category": {
                            "id": 4,
                            "name": "Bases de Datos",
                            "slug": "bases-de-datos",
                            "icon": "Database",
                            "color": "#FFD740"
                        }
                    }
                ]
            },
            {
                "id": 3,
                "learning_path_id": 1,
                "title": "Nivel 3 — Algoritmos Básicos",
                "description": "Algoritmos de búsqueda, ordenamiento y complejidad computacional.",
                "order": 3,
                "courses": [
                    {
                        "id": 2,
                        "title": "Algoritmos de Ordenamiento",
                        "slug": "algoritmos-ordenamiento",
                        "description": "Estudia los algoritmos de ordenamiento más importantes: Bubble Sort, Selection Sort, Merge Sort, Quick Sort. Aprende a analizar su complejidad temporal y espacial con Big-O notation.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 8,
                        "lessons_count": 9,
                        "category": {
                            "id": 2,
                            "name": "Algoritmos",
                            "slug": "algoritmos",
                            "icon": "GitBranch",
                            "color": "#00D9FF"
                        }
                    },
                    {
                        "id": 99,
                        "title": "Estructuras de Datos Lineales y Complejidad",
                        "slug": "estructuras-datos-lineales",
                        "description": "Aprende cómo organizar la información en memoria eficientemente. Implementa listas enlazadas, pilas (stacks) y colas (queues), analizando su costo con notación Big-O.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 5,
                        "category": {
                            "id": 2,
                            "name": "Algoritmos",
                            "slug": "algoritmos",
                            "icon": "GitBranch",
                            "color": "#00D9FF"
                        }
                    }
                ]
            },
            {
                "id": 38,
                "learning_path_id": 1,
                "title": "Nivel 4 — Clean Code, Refactorización y Proyecto de Consola",
                "description": "Aplica los principios de Robert C. Martin (Clean Code) y Martin Fowler: nombres expresivos, funciones pequeñas y desarrollo de un proyecto integrador sin dependencias.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 2,
        "title": "Desarrollo Orientado a Objetos",
        "slug": "desarrollo-orientado-objetos",
        "description": "Domina la Programación Orientada a Objetos con patrones de diseño y buenas prácticas. Aprende a diseñar software escalable y mantenible.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 80,
        "courses_count": 6,
        "category_id": 3,
        "category": {
            "id": 3,
            "name": "POO",
            "slug": "poo",
            "icon": "Boxes",
            "color": "#00E676",
            "description": "Programación Orientada a Objetos"
        },
        "levels": [
            {
                "id": 4,
                "learning_path_id": 2,
                "title": "Nivel 1 — Conceptos de POO",
                "description": "Clases, objetos, encapsulamiento, herencia y polimorfismo.",
                "order": 1,
                "courses": [
                    {
                        "id": 93,
                        "title": "Introducción a la Programación Orientada a Objetos",
                        "slug": "introduccion-poo",
                        "description": "Da el salto del código imperativo a las clases y objetos. Entiende por qué agrupar datos y comportamiento en un mismo lugar hace que los sistemas resulten más fáciles de mantener.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 14,
                        "lessons_count": 6,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    },
                    {
                        "id": 94,
                        "title": "Clases, Objetos y Herencia",
                        "slug": "clases-objetos-herencia",
                        "description": "Herencia, polimorfismo, encapsulamiento y el criterio para elegir entre composicion e herencia.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 16,
                        "lessons_count": 6,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    }
                ]
            },
            {
                "id": 5,
                "learning_path_id": 2,
                "title": "Nivel 2 — Principios SOLID",
                "description": "Los 5 principios SOLID para diseño de software robusto.",
                "order": 2,
                "courses": [
                    {
                        "id": 100,
                        "title": "Diseño Modular, Interfaces y Contratos",
                        "slug": "diseno-modular-interfaces",
                        "description": "Domina el desacoplamiento mediante contratos de interfaz, tipado estricto y polimorfismo. Evita dependencias rígidas y construye código extensible.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 7,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    },
                    {
                        "id": 95,
                        "title": "Principios SOLID en la práctica",
                        "slug": "principios-solid",
                        "description": "Los cinco principios que hacen que el software sea ampliable y mantenible, con ejemplos de Python y refactorizaciones paso a paso.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 18,
                        "lessons_count": 6,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    }
                ]
            },
            {
                "id": 6,
                "learning_path_id": 2,
                "title": "Nivel 3 — Patrones de Diseño",
                "description": "Patrones creacionales, estructurales y de comportamiento (GoF).",
                "order": 3,
                "courses": [
                    {
                        "id": 96,
                        "title": "Patrones de Diseño",
                        "slug": "patrones-de-diseno",
                        "description": "Soluciones reutilizables a problemas recurrentes del diseño de software: creacionales, estructurales y comportamentales con implementaciones en Python.",
                        "difficulty": "advanced",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 20,
                        "lessons_count": 6,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    }
                ]
            },
            {
                "id": 7,
                "learning_path_id": 2,
                "title": "Nivel 4 — Proyecto Final",
                "description": "Aplica todo lo aprendido en un proyecto real.",
                "order": 4,
                "courses": [
                    {
                        "id": 101,
                        "title": "Proyecto Final: Arquitectura de Software Orientada a Objetos",
                        "slug": "arquitectura-proyecto-poo",
                        "description": "Construye un sistema completo aplicando arquitectura en capas, entidades ricas, repositorios y patrones de diseño integrados.",
                        "difficulty": "advanced",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 16,
                        "lessons_count": 5,
                        "category": {
                            "id": 3,
                            "name": "POO",
                            "slug": "poo",
                            "icon": "Boxes",
                            "color": "#00E676"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": 3,
        "title": "Desarrollo Backend",
        "slug": "desarrollo-backend",
        "description": "Diseña e implementa el motor de las aplicaciones: APIs REST, servidores, bases de datos, autenticación y seguridad. Aprende a construir servicios robustos que escalan y que otros equipos pueden consumir con confianza.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 90,
        "courses_count": 6,
        "category_id": 9,
        "category": {
            "id": 9,
            "name": "Desarrollo Backend",
            "slug": "desarrollo-backend",
            "icon": "Server",
            "color": "#64B5F6",
            "description": "APIs, servidores, bases de datos y lógica de negocio"
        },
        "levels": [
            {
                "id": 8,
                "learning_path_id": 3,
                "title": "Nivel 1 — Fundamentos de Backend",
                "description": "Servidores, HTTP y el modelo cliente-servidor.",
                "order": 1,
                "courses": [
                    {
                        "id": 5,
                        "title": "Introducción al Backend",
                        "slug": "backend-introduccion",
                        "description": "Descubre qué pasa del lado del servidor: el modelo cliente-servidor, HTTP y el rol del backend en una aplicación moderna. La base para diseñar cualquier API.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 8,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    },
                    {
                        "id": 102,
                        "title": "Protocolo HTTP y Arquitectura Web",
                        "slug": "arquitectura-web-http",
                        "description": "Comprende el funcionamiento del protocolo que mueve Internet: cabeceras, códigos de estado, métodos idempotentes, CORS, cookies y ciclos de vida Request/Response.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 7,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    }
                ]
            },
            {
                "id": 9,
                "learning_path_id": 3,
                "title": "Nivel 2 — APIs REST",
                "description": "Diseño e implementación de APIs REST con buenas prácticas.",
                "order": 2,
                "courses": [
                    {
                        "id": 6,
                        "title": "APIs REST con Laravel",
                        "slug": "apis-rest-con-laravel",
                        "description": "Diseña e implementa APIs REST profesionales con Laravel: recursos, validación, respuestas JSON consistentes y manejo de errores. Todo lo necesario para exponer tu lógica de negocio.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 15,
                        "lessons_count": 6,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    },
                    {
                        "id": 103,
                        "title": "Diseño y Versionado de APIs RESTful",
                        "slug": "diseno-apis-restful",
                        "description": "Estandariza tus servicios backend con especificaciones internacionales: versionado por URI/header, paginación con cursor, filtrado dinámico y documentación OpenAPI.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 5,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    }
                ]
            },
            {
                "id": 10,
                "learning_path_id": 3,
                "title": "Nivel 3 — Bases de Datos y ORMs",
                "description": "Modelado de datos, migraciones y consultas eficientes.",
                "order": 3,
                "courses": [
                    {
                        "id": 7,
                        "title": "Modelos, Relaciones y Consultas",
                        "slug": "modelos-relaciones-y-consultas",
                        "description": "Domina Eloquent: migraciones que versionan el esquema, relaciones que conectan tablas y consultas eficientes que evitan el problema N+1.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 8,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    }
                ]
            },
            {
                "id": 11,
                "learning_path_id": 3,
                "title": "Nivel 4 — Seguridad y Buenas Prácticas",
                "description": "Autenticación, autorización y protección de APIs.",
                "order": 4,
                "courses": [
                    {
                        "id": 8,
                        "title": "Seguridad en APIs",
                        "slug": "seguridad-en-apis",
                        "description": "Protege tus servicios: autenticación con tokens, vulnerabilidades OWASP más comunes y manejo seguro de secretos. La seguridad no es un extra, es parte del diseño.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 8,
                        "lessons_count": 6,
                        "category": {
                            "id": 9,
                            "name": "Desarrollo Backend",
                            "slug": "desarrollo-backend",
                            "icon": "Server",
                            "color": "#64B5F6"
                        }
                    }
                ]
            },
            {
                "id": 40,
                "learning_path_id": 3,
                "title": "Nivel 5 — Arquitectura Limpia, Microservicios y Resiliencia",
                "description": "Separación de capas según Clean Architecture, diseño de APIs desacopladas, rate limiting y contratos seguros.",
                "order": 5,
                "courses": []
            }
        ]
    },
    {
        "id": 4,
        "title": "Desarrollo Frontend",
        "slug": "desarrollo-frontend",
        "description": "Construye interfaces modernas, accesibles y rápidas. Desde HTML, CSS y JavaScript hasta frameworks como Angular, con foco en componentes, estado, performance y experiencia de usuario.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 100,
        "courses_count": 6,
        "category_id": 10,
        "category": {
            "id": 10,
            "name": "Desarrollo Frontend",
            "slug": "desarrollo-frontend",
            "icon": "Palette",
            "color": "#F06292",
            "description": "Interfaces, componentes, frameworks y experiencia de usuario"
        },
        "levels": [
            {
                "id": 12,
                "learning_path_id": 4,
                "title": "Nivel 1 — Fundamentos de la Web",
                "description": "HTML semántico, CSS moderno y JavaScript.",
                "order": 1,
                "courses": [
                    {
                        "id": 9,
                        "title": "HTML, CSS y JavaScript",
                        "slug": "html-css-javascript",
                        "description": "Los tres pilares de la web: estructura semántica, maquetación moderna con Flexbox y Grid, e interactividad con el DOM. Construye tus primeras interfaces desde cero.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 15,
                        "lessons_count": 12,
                        "category": {
                            "id": 10,
                            "name": "Desarrollo Frontend",
                            "slug": "desarrollo-frontend",
                            "icon": "Palette",
                            "color": "#F06292"
                        }
                    },
                    {
                        "id": 4,
                        "title": "Introducción al Desarrollo Web",
                        "slug": "intro-desarrollo-web",
                        "description": "Aprende los fundamentos del desarrollo web: HTML, CSS y JavaScript. Crea tus primeras páginas web interactivas desde cero hasta un proyecto personal funcional.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 15,
                        "lessons_count": 9,
                        "category": {
                            "id": 8,
                            "name": "Desarrollo Web",
                            "slug": "desarrollo-web",
                            "icon": "Globe",
                            "color": "#26C6DA"
                        }
                    },
                    {
                        "id": 104,
                        "title": "CSS Moderno: Flexbox, CSS Grid y Responsive Design",
                        "slug": "css-moderno-flexbox-grid",
                        "description": "Domina el diseño web profesional sin depender de librerías externas. Layouts fluidos, diseño adaptativo, variables nativas CSS y técnicas modernas de maquetación.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 5,
                        "category": {
                            "id": 10,
                            "name": "Desarrollo Frontend",
                            "slug": "desarrollo-frontend",
                            "icon": "Palette",
                            "color": "#F06292"
                        }
                    }
                ]
            },
            {
                "id": 13,
                "learning_path_id": 4,
                "title": "Nivel 2 — Frameworks Modernos",
                "description": "Componentes, estado y enrutado con Angular.",
                "order": 2,
                "courses": [
                    {
                        "id": 10,
                        "title": "Angular Moderno",
                        "slug": "angular-moderno",
                        "description": "Frameworks para apps reales: componentes standalone, control flow y Signals. Aprende a estructurar una aplicación Angular con servicios HTTP, routing y lazy loading.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 18,
                        "lessons_count": 9,
                        "category": {
                            "id": 10,
                            "name": "Desarrollo Frontend",
                            "slug": "desarrollo-frontend",
                            "icon": "Palette",
                            "color": "#F06292"
                        }
                    },
                    {
                        "id": 105,
                        "title": "TypeScript Profesional para Aplicaciones Frontend",
                        "slug": "typescript-profesional-frontend",
                        "description": "Desarrolla código robusto y libre de errores en tiempo de ejecución. Tipos avanzados, genéricos, interfaces, type guards y tipado de APIs.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 14,
                        "lessons_count": 7,
                        "category": {
                            "id": 10,
                            "name": "Desarrollo Frontend",
                            "slug": "desarrollo-frontend",
                            "icon": "Palette",
                            "color": "#F06292"
                        }
                    }
                ]
            },
            {
                "id": 14,
                "learning_path_id": 4,
                "title": "Nivel 3 — Calidad Frontend",
                "description": "Accesibilidad, rendimiento y buenas prácticas.",
                "order": 3,
                "courses": [
                    {
                        "id": 11,
                        "title": "Accesibilidad y Performance Web",
                        "slug": "accesibilidad-y-performance-web",
                        "description": "Haz tu interfaz usable para todas las personas y rápida para todos los dispositivos: criterios WCAG y métricas Core Web Vitals en la práctica.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 8,
                        "lessons_count": 6,
                        "category": {
                            "id": 10,
                            "name": "Desarrollo Frontend",
                            "slug": "desarrollo-frontend",
                            "icon": "Palette",
                            "color": "#F06292"
                        }
                    }
                ]
            },
            {
                "id": 39,
                "learning_path_id": 4,
                "title": "Nivel 4 — Testing, Tipado Avanzado y Rendimiento Web",
                "description": "Pruebas unitarias de componentes, modelado estricto con TypeScript profesional y optimización de métricas Core Web Vitals.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 5,
        "title": "Desarrollo Full Stack",
        "slug": "desarrollo-fullstack",
        "description": "Domina el ciclo completo de una aplicación web: frontend, backend, base de datos y despliegue. Aprende a integrar todas las piezas y a llevar un producto de la idea a producción.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 120,
        "courses_count": 3,
        "category_id": 8,
        "category": {
            "id": 8,
            "name": "Desarrollo Web",
            "slug": "desarrollo-web",
            "icon": "Globe",
            "color": "#26C6DA",
            "description": "Frontend, backend y fullstack"
        },
        "levels": [
            {
                "id": 15,
                "learning_path_id": 5,
                "title": "Nivel 1 — Integración",
                "description": "Conectar frontend y backend sin fricción.",
                "order": 1,
                "courses": [
                    {
                        "id": 12,
                        "title": "Integración Frontend ↔ Backend",
                        "slug": "integracion-frontend-backend",
                        "description": "Convierte la API en un contrato vivo entre equipos: documentación, manejo de CORS y tokens desde el frontend, y un flujo de datos sin fricción.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 8,
                            "name": "Desarrollo Web",
                            "slug": "desarrollo-web",
                            "icon": "Globe",
                            "color": "#26C6DA"
                        }
                    }
                ]
            },
            {
                "id": 16,
                "learning_path_id": 5,
                "title": "Nivel 2 — Identidad",
                "description": "Autenticación y autorización de punta a punta.",
                "order": 2,
                "courses": [
                    {
                        "id": 13,
                        "title": "Autenticación JWT de punta a punta",
                        "slug": "autenticacion-jwt-web",
                        "description": "Implementa login, registro y rutas protegidas en toda la pila: cómo funciona un JWT, dónde guardarlo y cómo proteger el frontend con guards.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 6,
                        "category": {
                            "id": 8,
                            "name": "Desarrollo Web",
                            "slug": "desarrollo-web",
                            "icon": "Globe",
                            "color": "#26C6DA"
                        }
                    }
                ]
            },
            {
                "id": 17,
                "learning_path_id": 5,
                "title": "Nivel 3 — Entrega",
                "description": "Build, despliegue y monitoreo de la aplicación completa.",
                "order": 3,
                "courses": [
                    {
                        "id": 14,
                        "title": "Despliegue Full Stack",
                        "slug": "despliegue-fullstack",
                        "description": "Lleva tu aplicación a producción: build optimizado, variables de entorno y servir estáticos y API detrás de un reverse proxy.",
                        "difficulty": "advanced",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 8,
                        "lessons_count": 6,
                        "category": {
                            "id": 11,
                            "name": "DevOps",
                            "slug": "devops",
                            "icon": "Container",
                            "color": "#81C784"
                        }
                    }
                ]
            },
            {
                "id": 41,
                "learning_path_id": 5,
                "title": "Nivel 4 — Arquitectura de Producción y Monitoreo Cloud",
                "description": "Despliegue automatizado, manejo de estados distribuidos y observabilidad de punta a punta.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 6,
        "title": "DevOps",
        "slug": "devops",
        "description": "Automatiza el ciclo de vida del software: Linux, contenedores, pipelines de CI/CD y despliegue en la nube. Aprende a entregar software de forma rápida, repetible y segura.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 80,
        "courses_count": 4,
        "category_id": 11,
        "category": {
            "id": 11,
            "name": "DevOps",
            "slug": "devops",
            "icon": "Container",
            "color": "#81C784",
            "description": "CI/CD, contenedores, cloud y automatización"
        },
        "levels": [
            {
                "id": 18,
                "learning_path_id": 6,
                "title": "Nivel 1 — Fundamentos de Sistemas",
                "description": "Linux, terminal y gestión de procesos.",
                "order": 1,
                "courses": [
                    {
                        "id": 15,
                        "title": "Linux y línea de comandos",
                        "slug": "linux-y-linea-de-comandos",
                        "description": "Domina la terminal como tu herramienta principal: archivos, permisos, procesos, scripts y conectividad para operar cualquier servidor.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 14,
                        "lessons_count": 6,
                        "category": {
                            "id": 11,
                            "name": "DevOps",
                            "slug": "devops",
                            "icon": "Container",
                            "color": "#81C784"
                        }
                    }
                ]
            },
            {
                "id": 19,
                "learning_path_id": 6,
                "title": "Nivel 2 — Contenedores y Virtualización",
                "description": "Docker, imágenes y orquestación básica.",
                "order": 2,
                "courses": [
                    {
                        "id": 16,
                        "title": "Docker y contenedores",
                        "slug": "docker-y-contenedores",
                        "description": "Empaqueta aplicaciones con imágenes ligeras, orquesta servicios con Compose y despliega contenedores robustos en producción.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 15,
                        "lessons_count": 6,
                        "category": {
                            "id": 11,
                            "name": "DevOps",
                            "slug": "devops",
                            "icon": "Container",
                            "color": "#81C784"
                        }
                    },
                    {
                        "id": 107,
                        "title": "Docker Compose y Arquitecturas Multiservicio",
                        "slug": "docker-compose-multiservicio",
                        "description": "Orquesta entornos completos de desarrollo y producción con bases de datos, caché Redis, servidores web y workers integrados en redes aisladas.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 7,
                        "category": {
                            "id": 11,
                            "name": "DevOps",
                            "slug": "devops",
                            "icon": "Container",
                            "color": "#81C784"
                        }
                    }
                ]
            },
            {
                "id": 20,
                "learning_path_id": 6,
                "title": "Nivel 3 — CI/CD y Cloud",
                "description": "Pipelines, despliegue continuo y observabilidad.",
                "order": 3,
                "courses": [
                    {
                        "id": 17,
                        "title": "CI/CD con GitHub Actions",
                        "slug": "ci-cd-github-actions",
                        "description": "Automatiza pruebas, calidad y despliegues con pipelines que se ejecutan en cada cambio de tu repositorio.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": false,
                        "duration_hours": 13,
                        "lessons_count": 6,
                        "category": {
                            "id": 11,
                            "name": "DevOps",
                            "slug": "devops",
                            "icon": "Container",
                            "color": "#81C784"
                        }
                    }
                ]
            },
            {
                "id": 42,
                "learning_path_id": 6,
                "title": "Nivel 4 — Infraestructura como Código y DevSecOps",
                "description": "Automatización con Compose avanzado, escaneo de vulnerabilidades en imágenes y observabilidad de contenedores.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 7,
        "title": "Git y Control de Versiones",
        "slug": "git-y-control-versiones",
        "description": "Domina la herramienta más usada por los equipos de desarrollo: commits, ramas, colaboración remota, pull requests y flujos profesionales como Conventional Commits. Imprescindible para cualquier desarrollador.",
        "difficulty": "beginner",
        "is_published": true,
        "estimated_hours": 25,
        "courses_count": 3,
        "category_id": 12,
        "category": {
            "id": 12,
            "name": "Git y Control de Versiones",
            "slug": "git",
            "icon": "GitFork",
            "color": "#FF7043",
            "description": "Git, ramas, colaboración y flujos de trabajo"
        },
        "levels": [
            {
                "id": 21,
                "learning_path_id": 7,
                "title": "Nivel 1 — Fundamentos",
                "description": "Repositorios, commits y el ciclo básico de Git.",
                "order": 1,
                "courses": [
                    {
                        "id": 18,
                        "title": "Git desde cero",
                        "slug": "git-desde-cero",
                        "description": "Instala Git, haz tus primeros commits y domina los tres estados, las ramas y el viaje por la historia sin miedo.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 10,
                        "lessons_count": 6,
                        "category": {
                            "id": 12,
                            "name": "Git y Control de Versiones",
                            "slug": "git",
                            "icon": "GitFork",
                            "color": "#FF7043"
                        }
                    }
                ]
            },
            {
                "id": 22,
                "learning_path_id": 7,
                "title": "Nivel 2 — Colaboración",
                "description": "Ramas, remotes y pull requests.",
                "order": 2,
                "courses": [
                    {
                        "id": 19,
                        "title": "Git colaboración y flujos",
                        "slug": "git-colaboracion-y-flujos",
                        "description": "Trabaja en equipo con pull requests, resuelve conflictos, domina rebase y elige el flujo de ramas adecuado.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 12,
                            "name": "Git y Control de Versiones",
                            "slug": "git",
                            "icon": "GitFork",
                            "color": "#FF7043"
                        }
                    }
                ]
            },
            {
                "id": 23,
                "learning_path_id": 7,
                "title": "Nivel 3 — Flujos Profesionales",
                "description": "Git Flow, Conventional Commits y resolución de conflictos.",
                "order": 3,
                "courses": [
                    {
                        "id": 106,
                        "title": "Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos",
                        "slug": "git-avanzado-rebase-conflictos",
                        "description": "Conviértete en un experto en control de versiones. Domina rebase interactivo, git bisect para encontrar bugs, cherry-pick selectivo, reflog para recuperar commits y resolución de merge conflicts.",
                        "difficulty": "advanced",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 12,
                            "name": "Git y Control de Versiones",
                            "slug": "git",
                            "icon": "GitFork",
                            "color": "#FF7043"
                        }
                    }
                ]
            },
            {
                "id": 43,
                "learning_path_id": 7,
                "title": "Nivel 4 — GitOps, Automatización y Trunk-Based Development",
                "description": "Hooks de Git automatizados, protección criptográfica de commits y flujos de alta velocidad en equipos de ingeniería.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 8,
        "title": "Ingeniería de Requerimientos",
        "slug": "ingenieria-de-requerimientos",
        "description": "Aprende a descubrir, modelar, documentar y gestionar lo que realmente necesita un producto de software. La disciplina que separa los proyectos que fracasan por malentendidos de los que entregan valor.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 50,
        "courses_count": 4,
        "category_id": 13,
        "category": {
            "id": 13,
            "name": "Ingeniería de Software",
            "slug": "ingenieria-software",
            "icon": "ClipboardList",
            "color": "#9575CD",
            "description": "Requerimientos, diseño, arquitectura y gestión de proyectos"
        },
        "levels": [
            {
                "id": 24,
                "learning_path_id": 8,
                "title": "Nivel 1 — Fundamentos",
                "description": "Tipos de requerimientos y el coste de los errores.",
                "order": 1,
                "courses": [
                    {
                        "id": 20,
                        "title": "Fundamentos de requerimientos",
                        "slug": "fundamentos-requerimientos",
                        "description": "Aprende qué es un requerimiento, por qué sus errores son los más caros y cómo descubrirlos, escribirlos y validarlos sin ambigüedad.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 13,
                            "name": "Ingeniería de Software",
                            "slug": "ingenieria-software",
                            "icon": "ClipboardList",
                            "color": "#9575CD"
                        }
                    }
                ]
            },
            {
                "id": 25,
                "learning_path_id": 8,
                "title": "Nivel 2 — Modelado y Documentación",
                "description": "Historias de usuario, casos de uso y criterios de aceptación.",
                "order": 2,
                "courses": [
                    {
                        "id": 109,
                        "title": "Especificación Formal (SRS) y Casos de Uso",
                        "slug": "especificacion-srs-diagramas",
                        "description": "Aprende a documentar software según el estándar IEEE 830. Diagramas de casos de uso UML, especificación de flujos principales, alternativos y de excepción.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 5,
                        "category": {
                            "id": 13,
                            "name": "Ingeniería de Software",
                            "slug": "ingenieria-software",
                            "icon": "ClipboardList",
                            "color": "#9575CD"
                        }
                    },
                    {
                        "id": 21,
                        "title": "Historias de usuario y casos de uso",
                        "slug": "historias-de-usuario-y-casos-de-uso",
                        "description": "Modela funcionalidades desde la perspectiva del usuario: historias con criterios de aceptación, épicas y casos de uso con actores y flujos.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 13,
                        "lessons_count": 6,
                        "category": {
                            "id": 13,
                            "name": "Ingeniería de Software",
                            "slug": "ingenieria-software",
                            "icon": "ClipboardList",
                            "color": "#9575CD"
                        }
                    }
                ]
            },
            {
                "id": 26,
                "learning_path_id": 8,
                "title": "Nivel 3 — Gestión",
                "description": "Priorización, trazabilidad y gestión del cambio.",
                "order": 3,
                "courses": [
                    {
                        "id": 22,
                        "title": "Gestión de requerimientos",
                        "slug": "gestion-de-requerimientos",
                        "description": "Prioriza con MoSCoW, gestiona el cambio con trazabilidad y comunica con stakeholders como un profesional.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": false,
                        "duration_hours": 11,
                        "lessons_count": 6,
                        "category": {
                            "id": 13,
                            "name": "Ingeniería de Software",
                            "slug": "ingenieria-software",
                            "icon": "ClipboardList",
                            "color": "#9575CD"
                        }
                    }
                ]
            },
            {
                "id": 44,
                "learning_path_id": 8,
                "title": "Nivel 4 — Arquitectura Ágil y Domain-Driven Design (DDD)",
                "description": "Descubrimiento del dominio con Event Storming, Lenguaje Ubicuo y especificaciones ejecutables BDD.",
                "order": 4,
                "courses": []
            }
        ]
    },
    {
        "id": 9,
        "title": "Desarrollo con IA",
        "slug": "desarrollo-con-ia",
        "description": "Integra modelos de lenguaje en tu flujo de trabajo: entender cómo funcionan los LLMs, dominar el prompt engineering y usar la IA para programar, revisar código y automatizar tareas de desarrollo.",
        "difficulty": "intermediate",
        "is_published": true,
        "estimated_hours": 60,
        "courses_count": 4,
        "category_id": 14,
        "category": {
            "id": 14,
            "name": "IA para Desarrollo",
            "slug": "ia-desarrollo",
            "icon": "Sparkles",
            "color": "#4DB6AC",
            "description": "LLMs, prompt engineering y desarrollo asistido por IA"
        },
        "levels": [
            {
                "id": 27,
                "learning_path_id": 9,
                "title": "Nivel 1 — Fundamentos de IA",
                "description": "Modelos de lenguaje, tokens y APIs de IA.",
                "order": 1,
                "courses": [
                    {
                        "id": 23,
                        "title": "Introducción a la IA para desarrolladores",
                        "slug": "introduccion-ia-para-desarrolladores",
                        "description": "Entiende qué son los modelos de lenguaje, cómo funcionan las APIs de IA y los tokens, y cómo integrarlos con límites y responsabilidad.",
                        "difficulty": "beginner",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 14,
                            "name": "IA para Desarrollo",
                            "slug": "ia-desarrollo",
                            "icon": "Sparkles",
                            "color": "#4DB6AC"
                        }
                    }
                ]
            },
            {
                "id": 28,
                "learning_path_id": 9,
                "title": "Nivel 2 — Prompt Engineering",
                "description": "Técnicas prácticas para guiar a los modelos.",
                "order": 2,
                "courses": [
                    {
                        "id": 24,
                        "title": "Prompt Engineering práctico",
                        "slug": "prompt-engineering-practico",
                        "description": "Diseña prompts claros, aplica few-shot y cadena de pensamiento, y construye sistemas de prompting sólidos para código y automatización.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 13,
                        "lessons_count": 6,
                        "category": {
                            "id": 14,
                            "name": "IA para Desarrollo",
                            "slug": "ia-desarrollo",
                            "icon": "Sparkles",
                            "color": "#4DB6AC"
                        }
                    },
                    {
                        "id": 108,
                        "title": "RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales",
                        "slug": "rag-embeddings-bases-vectoriales",
                        "description": "Aprende a conectar Modelos de Lenguaje con tu propia base de conocimiento privada. Embeddings de texto, fragmentación de documentos, cálculo de similitud coseno y búsqueda semántica con PgVector.",
                        "difficulty": "advanced",
                        "is_published": true,
                        "is_free": true,
                        "duration_hours": 14,
                        "lessons_count": 7,
                        "category": {
                            "id": 14,
                            "name": "IA para Desarrollo",
                            "slug": "ia-desarrollo",
                            "icon": "Sparkles",
                            "color": "#4DB6AC"
                        }
                    }
                ]
            },
            {
                "id": 29,
                "learning_path_id": 9,
                "title": "Nivel 3 — IA en el Desarrollo",
                "description": "Asistentes de código, code review y automatización.",
                "order": 3,
                "courses": [
                    {
                        "id": 25,
                        "title": "IA en el ciclo de desarrollo",
                        "slug": "ia-en-el-ciclo-de-desarrollo",
                        "description": "Aprovecha asistentes de código, usa IA en review y tests, y lleva sistemas generativos a producción con evaluación y seguridad.",
                        "difficulty": "intermediate",
                        "is_published": true,
                        "is_free": false,
                        "duration_hours": 12,
                        "lessons_count": 6,
                        "category": {
                            "id": 14,
                            "name": "IA para Desarrollo",
                            "slug": "ia-desarrollo",
                            "icon": "Sparkles",
                            "color": "#4DB6AC"
                        }
                    }
                ]
            },
            {
                "id": 45,
                "learning_path_id": 9,
                "title": "Nivel 4 — Agentes Autónomos, Model Context Protocol y LLMOps",
                "description": "Arquitectura de agentes con herramientas externas, MCP y evaluación cuantitativa de sistemas RAG.",
                "order": 4,
                "courses": []
            }
        ]
    }
];

export const FALLBACK_HOME_DATA: HomeData = {
    categories: FALLBACK_CATEGORIES,
    learning_paths: {
        current_page: 1,
        data: FALLBACK_LEARNING_PATHS,
        total: 9,
        per_page: 12,
        last_page: 1
    },
    courses: {
        current_page: 1,
        data: FALLBACK_COURSES,
        total: 43,
        per_page: 16,
        last_page: 3
    }
};

export const FALLBACK_TEACHER_OVERVIEW: TeacherOverviewResponse = {
    stats: {
        total_students: 1248,
        total_courses: 43,
        total_completions: 3412,
        total_enrollments: 2540,
        average_score: 94.5
    },
    recent_activity: [],
    popular_courses: [
    {
        "id": 2,
        "title": "Algoritmos de Ordenamiento",
        "slug": "algoritmos-ordenamiento",
        "difficulty": "intermediate",
        "enrollments_count": 84
    },
    {
        "id": 18,
        "title": "Git desde cero",
        "slug": "git-desde-cero",
        "difficulty": "beginner",
        "enrollments_count": 84
    },
    {
        "id": 9,
        "title": "HTML, CSS y JavaScript",
        "slug": "html-css-javascript",
        "difficulty": "beginner",
        "enrollments_count": 84
    },
    {
        "id": 20,
        "title": "Fundamentos de requerimientos",
        "slug": "fundamentos-requerimientos",
        "difficulty": "beginner",
        "enrollments_count": 84
    },
    {
        "id": 5,
        "title": "Introducción al Backend",
        "slug": "backend-introduccion",
        "difficulty": "beginner",
        "enrollments_count": 84
    }
]
};
