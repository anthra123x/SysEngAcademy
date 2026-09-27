import { Category, Course, LearningPath, PaginatedResponse } from '../models';
import { HomeData } from './home.service';
import { TeacherOverviewResponse } from './teacher.service';

export const FALLBACK_CATEGORIES: Category[] = [
  { id: 1, name: 'Programación Básica', slug: 'programacion-basica', icon: 'Code', color: '#6C63FF', description: 'Fundamentos de programación y pensamiento lógico' },
  { id: 2, name: 'Algoritmos', slug: 'algoritmos', icon: 'GitBranch', color: '#00D9FF', description: 'Diseño y análisis de algoritmos' },
  { id: 3, name: 'POO', slug: 'poo', icon: 'Boxes', color: '#00E676', description: 'Programación Orientada a Objetos' },
  { id: 4, name: 'Bases de Datos', slug: 'bases-de-datos', icon: 'Database', color: '#FFD740', description: 'SQL, NoSQL y diseño de bases de datos' },
  { id: 5, name: 'Redes', slug: 'redes', icon: 'Network', color: '#FF6D00', description: 'Redes de computadoras y protocolos' },
  { id: 6, name: 'Sistemas Operativos', slug: 'sistemas-operativos', icon: 'Monitor', color: '#FF5252', description: 'Conceptos de sistemas operativos y concurrencia' },
  { id: 7, name: 'Estructuras de Datos', slug: 'estructuras-de-datos', icon: 'TreePine', color: '#AB47BC', description: 'Listas, árboles, grafos y más' },
  { id: 8, name: 'Desarrollo Web', slug: 'desarrollo-web', icon: 'Globe', color: '#26C6DA', description: 'Frontend, backend y fullstack' },
  { id: 9, name: 'Desarrollo Backend', slug: 'desarrollo-backend', icon: 'Server', color: '#64B5F6', description: 'APIs, servidores, bases de datos y lógica' },
  { id: 10, name: 'DevOps', slug: 'devops', icon: 'Container', color: '#81C784', description: 'CI/CD, contenedores, cloud y automatización' },
  { id: 11, name: 'Git y Control de Versiones', slug: 'git', icon: 'GitFork', color: '#FF7043', description: 'Git, ramas, colaboración y flujos' },
  { id: 12, name: 'IA para Desarrollo', slug: 'ia-desarrollo', icon: 'Sparkles', color: '#4DB6AC', description: 'LLMs, prompt engineering y desarrollo asistido' },
];

export const FALLBACK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Introducción a la Programación',
    slug: 'introduccion-programacion',
    description: 'Aprende los fundamentos absolutos de la programación con Python y lógica computacional.',
    difficulty: 'beginner',
    category: FALLBACK_CATEGORIES[0],
    is_published: true,
    is_free: true,
    duration_hours: 10,
    lessons_count: 20,
  },
  {
    id: 2,
    title: 'Algoritmos y Estructuras de Datos',
    slug: 'algoritmos-y-estructuras-de-datos',
    description: 'Domina arrays, listas enlazadas, pilas, colas, árboles y análisis de complejidad Big-O.',
    difficulty: 'intermediate',
    category: FALLBACK_CATEGORIES[1],
    is_published: true,
    is_free: false,
    duration_hours: 18,
    lessons_count: 24,
  },
  {
    id: 3,
    title: 'Programación Orientada a Objetos',
    slug: 'programacion-orientada-a-objetos',
    description: 'Aprende clases, objetos, herencia, polimorfismo, interfaces y principios SOLID.',
    difficulty: 'intermediate',
    category: FALLBACK_CATEGORIES[2],
    is_published: true,
    is_free: true,
    duration_hours: 15,
    lessons_count: 18,
  },
  {
    id: 4,
    title: 'Bases de Datos Relacionales y SQL',
    slug: 'bases-de-datos-relacionales-sql',
    description: 'Diseño entidad-relación, normalización, consultas SQL avanzadas, transacciones e índices.',
    difficulty: 'intermediate',
    category: FALLBACK_CATEGORIES[3],
    is_published: true,
    is_free: false,
    duration_hours: 14,
    lessons_count: 16,
  },
  {
    id: 5,
    title: 'Desarrollo Web Moderno con TypeScript',
    slug: 'desarrollo-web-moderno-typescript',
    description: 'Construye aplicaciones web interactivas con HTML semántico, CSS moderno y TypeScript.',
    difficulty: 'beginner',
    category: FALLBACK_CATEGORIES[7],
    is_published: true,
    is_free: true,
    duration_hours: 20,
    lessons_count: 22,
  },
  {
    id: 6,
    title: 'Git y Flujos de Trabajo en Equipo',
    slug: 'git-control-de-versiones',
    description: 'Manejo de ramas, pull requests, resolución de conflictos y flujos profesionales con Git.',
    difficulty: 'beginner',
    category: FALLBACK_CATEGORIES[10],
    is_published: true,
    is_free: true,
    duration_hours: 8,
    lessons_count: 12,
  }
];

export const FALLBACK_LEARNING_PATHS: LearningPath[] = [
  {
    id: 1,
    title: 'Fundamentos de Ingeniería de Software',
    slug: 'fundamentos-ingenieria-software',
    description: 'La ruta base imprescindible para todo estudiante de Ingeniería de Sistemas.',
    category: FALLBACK_CATEGORIES[0],
    category_id: 1,
    difficulty: 'beginner',
    is_published: true,
    estimated_hours: 45,
    courses_count: 4,
    levels: [
      { id: 1, learning_path_id: 1, title: 'Nivel 1: Conceptos Básicos', order: 1, courses: [FALLBACK_COURSES[0]] },
      { id: 2, learning_path_id: 1, title: 'Nivel 2: Algoritmos', order: 2, courses: [FALLBACK_COURSES[1]] },
      { id: 3, learning_path_id: 1, title: 'Nivel 3: POO', order: 3, courses: [FALLBACK_COURSES[2]] },
    ],
  },
  {
    id: 2,
    title: 'Desarrollador Backend Profesional',
    slug: 'desarrollador-backend-profesional',
    description: 'Arquitectura de servidores, APIs RESTful, bases de datos y seguridad.',
    category: FALLBACK_CATEGORIES[8],
    category_id: 9,
    difficulty: 'intermediate',
    is_published: true,
    estimated_hours: 60,
    courses_count: 5,
    levels: [
      { id: 4, learning_path_id: 2, title: 'Nivel 1: Bases de Datos', order: 1, courses: [FALLBACK_COURSES[3]] },
      { id: 5, learning_path_id: 2, title: 'Nivel 2: Git y DevOps', order: 2, courses: [FALLBACK_COURSES[5]] },
    ],
  },
  {
    id: 3,
    title: 'Desarrollador Fullstack & Web',
    slug: 'desarrollador-fullstack-web',
    description: 'De cero a desplegar aplicaciones completas interactivas en la nube.',
    category: FALLBACK_CATEGORIES[7],
    category_id: 8,
    difficulty: 'intermediate',
    is_published: true,
    estimated_hours: 75,
    courses_count: 6,
    levels: [
      { id: 6, learning_path_id: 3, title: 'Nivel 1: Web Frontend', order: 1, courses: [FALLBACK_COURSES[4]] },
    ],
  }
];

export const FALLBACK_HOME_DATA: HomeData = {
  categories: FALLBACK_CATEGORIES,
  learning_paths: {
    current_page: 1,
    data: FALLBACK_LEARNING_PATHS,
    total: FALLBACK_LEARNING_PATHS.length,
    per_page: 10,
    last_page: 1,
  },
  courses: {
    current_page: 1,
    data: FALLBACK_COURSES,
    total: FALLBACK_COURSES.length,
    per_page: 12,
    last_page: 1,
  }
};

export const FALLBACK_TEACHER_OVERVIEW: TeacherOverviewResponse = {
  stats: {
    total_students: 24,
    total_courses: 43,
    total_completions: 182,
    total_enrollments: 115,
    average_score: 84.5,
  },
  recent_activity: [
    {
      id: 1,
      user_name: 'Carlos Prueba',
      user_email: 'carlos_test@gmail.com',
      lesson_title: 'Sintaxis básica y variables en Python',
      lesson_type: 'code_challenge',
      score: 100,
      passed: true,
      completed_at: '2026-09-27T14:30:00Z',
    },
    {
      id: 2,
      user_name: 'Ana Estudiante',
      user_email: 'estudiante@sysengacademy.dev',
      lesson_title: 'Estructuras de control condicional',
      lesson_type: 'quiz',
      score: 80,
      passed: true,
      completed_at: '2026-09-27T13:15:00Z',
    },
    {
      id: 3,
      user_name: 'Mateo Gómez',
      user_email: 'mateo.g@sysengacademy.dev',
      lesson_title: 'Bucles While y For en algoritmos',
      lesson_type: 'theory',
      score: null,
      passed: true,
      completed_at: '2026-09-27T11:45:00Z',
    }
  ],
  popular_courses: [
    { id: 1, title: 'Introducción a la Programación', slug: 'introduccion-programacion', difficulty: 'beginner', enrollments_count: 48 },
    { id: 2, title: 'Algoritmos y Estructuras de Datos', slug: 'algoritmos-y-estructuras-de-datos', difficulty: 'intermediate', enrollments_count: 36 },
    { id: 3, title: 'Programación Orientada a Objetos', slug: 'programacion-orientada-a-objetos', difficulty: 'intermediate', enrollments_count: 42 }
  ]
};
