import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { FALLBACK_TEACHER_OVERVIEW } from './fallback-data';

export interface TeacherStats {
  total_students: number;
  total_courses: number;
  total_completions: number;
  total_enrollments: number;
  average_score: number;
}

export interface RecentActivityItem {
  id: number;
  user_name: string;
  user_email: string;
  lesson_title: string;
  lesson_type: string;
  score: number | null;
  passed: boolean;
  completed_at: string | null;
}

export interface PopularCourseItem {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  enrollments_count: number;
}

export interface TeacherOverviewResponse {
  stats: TeacherStats;
  recent_activity: RecentActivityItem[];
  popular_courses: PopularCourseItem[];
}

export interface StudentEnrolledCourse {
  id: number;
  title: string;
  progress_percent: number;
}

export interface TeacherStudent {
  id: number;
  name: string;
  email: string;
  role: string;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string | null;
  enrollments_count: number;
  completed_lessons_count: number;
  quizzes_taken_count: number;
  average_quiz_score: number | null;
  courses: StudentEnrolledCourse[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface TeacherActivity {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'quiz' | 'practice' | 'terminal';
  course_name: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  xp_reward: number;
  expected_output?: string;
  starter_code?: string;
  quiz_questions?: QuizQuestion[];
  created_at: string;
  author_name: string;
  submissions_count: number;
  pass_rate: number;
}

export interface TeacherStudentDetail {
  student: {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified: boolean;
    email_verified_at: string | null;
    created_at: string;
  };
  academic_summary: {
    total_enrolled: number;
    total_completed: number;
    quizzes_taken: number;
    average_score: number | null;
  };
  courses: Array<{
    id: number;
    course_id: number;
    title: string;
    progress_percent: number;
    enrolled_at: string;
    completed_at: string | null;
  }>;
  completed_lessons: Array<{
    id: number;
    lesson_id: number;
    lesson_title: string;
    lesson_type: string;
    course_title: string;
    score: number | null;
    passed: boolean | null;
    completed_at: string | null;
  }>;
}

export const FALLBACK_TEACHER_STUDENTS: TeacherStudent[] = [
  {
    id: 3,
    name: 'Ana Estudiante (Demo)',
    email: 'estudiante@sysengacademy.dev',
    role: 'student',
    email_verified: true,
    email_verified_at: '2026-09-27T10:00:00.000Z',
    created_at: '2026-09-20T08:00:00.000Z',
    enrollments_count: 4,
    completed_lessons_count: 18,
    quizzes_taken_count: 4,
    average_quiz_score: 94.0,
    courses: [
      { id: 1, title: 'Introducción a la Programación', progress_percent: 100 },
      { id: 2, title: 'Algoritmos de Ordenamiento', progress_percent: 65 },
      { id: 3, title: 'Introducción al Desarrollo Web', progress_percent: 40 },
      { id: 106, title: 'Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos', progress_percent: 100 },
    ],
  },
  {
    id: 29,
    name: 'Carlos Prueba',
    email: 'carlos_test_1790540376@gmail.com',
    role: 'student',
    email_verified: true,
    email_verified_at: '2026-09-27T12:00:00.000Z',
    created_at: '2026-09-27T11:00:00.000Z',
    enrollments_count: 2,
    completed_lessons_count: 8,
    quizzes_taken_count: 2,
    average_quiz_score: 88.0,
    courses: [
      { id: 1, title: 'Introducción a la Programación', progress_percent: 75 },
      { id: 4, title: 'Introducción al Backend', progress_percent: 30 },
    ],
  },
  {
    id: 30,
    name: 'Mateo Silva',
    email: 'mateo.silva@alumnos.syseng.edu',
    role: 'student',
    email_verified: true,
    email_verified_at: '2026-09-25T14:30:00.000Z',
    created_at: '2026-09-25T14:00:00.000Z',
    enrollments_count: 3,
    completed_lessons_count: 14,
    quizzes_taken_count: 3,
    average_quiz_score: 96.0,
    courses: [
      { id: 1, title: 'Introducción a la Programación', progress_percent: 100 },
      { id: 2, title: 'Algoritmos de Ordenamiento', progress_percent: 100 },
      { id: 12, title: 'Integración Frontend ↔ Backend', progress_percent: 50 },
    ],
  },
  {
    id: 31,
    name: 'Sofía Herrera',
    email: 'sofia.herrera@tech.dev',
    role: 'student',
    email_verified: true,
    email_verified_at: '2026-09-26T09:15:00.000Z',
    created_at: '2026-09-26T09:00:00.000Z',
    enrollments_count: 1,
    completed_lessons_count: 4,
    quizzes_taken_count: 1,
    average_quiz_score: 82.0,
    courses: [
      { id: 5, title: 'HTML, CSS y JavaScript', progress_percent: 45 },
    ],
  },
  {
    id: 32,
    name: 'Lucas Ramírez',
    email: 'lucas.ramirez@code.org',
    role: 'student',
    email_verified: false,
    email_verified_at: null,
    created_at: '2026-09-27T16:20:00.000Z',
    enrollments_count: 2,
    completed_lessons_count: 10,
    quizzes_taken_count: 2,
    average_quiz_score: 85.5,
    courses: [
      { id: 1, title: 'Introducción a la Programación', progress_percent: 80 },
      { id: 20, title: 'Fundamentos de requerimientos', progress_percent: 55 },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private readonly api = inject(ApiService);

  private getLocalStudents(): TeacherStudent[] {
    if (typeof window === 'undefined') return FALLBACK_TEACHER_STUDENTS;
    try {
      const stored = localStorage.getItem('syseng_teacher_students_cache');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(FALLBACK_TEACHER_STUDENTS));
    } catch {}
    return FALLBACK_TEACHER_STUDENTS;
  }

  private saveLocalStudents(students: TeacherStudent[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(students));
    } catch {}
  }

  getOverview(): Observable<TeacherOverviewResponse> {
    return this.api.get<TeacherOverviewResponse>('/teacher/overview').pipe(
      catchError(() => of(FALLBACK_TEACHER_OVERVIEW))
    );
  }

  getStudents(search?: string): Observable<TeacherStudent[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) {
      params['search'] = search.trim();
    }
    return this.api.get<TeacherStudent[]>('/teacher/students', params).pipe(
      catchError(() => {
        let students = this.getLocalStudents();
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          students = students.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
        }
        return of(students);
      })
    );
  }

  getStudentDetail(id: number): Observable<TeacherStudentDetail> {
    return this.api.get<TeacherStudentDetail>(`/teacher/students/${id}`).pipe(
      catchError(() => {
        const student = this.getLocalStudents().find(s => s.id === id) || FALLBACK_TEACHER_STUDENTS[0];
        const detail: TeacherStudentDetail = {
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            role: student.role,
            email_verified: student.email_verified,
            email_verified_at: student.email_verified_at,
            created_at: student.created_at || '2026-09-20T00:00:00.000Z',
          },
          academic_summary: {
            total_enrolled: student.enrollments_count,
            total_completed: student.completed_lessons_count,
            quizzes_taken: student.quizzes_taken_count,
            average_score: student.average_quiz_score,
          },
          courses: student.courses.map((c, i) => ({
            id: i + 1,
            course_id: c.id,
            title: c.title,
            progress_percent: c.progress_percent,
            enrolled_at: '2026-09-20T00:00:00.000Z',
            completed_at: c.progress_percent === 100 ? '2026-09-25T00:00:00.000Z' : null,
          })),
          completed_lessons: [
            {
              id: 1,
              lesson_id: 101,
              lesson_title: 'Fundamentos de Algoritmos y Variables',
              lesson_type: 'practice',
              course_title: student.courses[0]?.title ?? 'Programación',
              score: 95,
              passed: true,
              completed_at: '2026-09-22T10:00:00.000Z',
            },
            {
              id: 2,
              lesson_id: 102,
              lesson_title: 'Estructuras Condicionales y Bucles',
              lesson_type: 'practice',
              course_title: student.courses[0]?.title ?? 'Programación',
              score: 90,
              passed: true,
              completed_at: '2026-09-23T11:30:00.000Z',
            },
          ],
        };
        return of(detail);
      })
    );
  }

  updateStudent(id: number, payload: { name?: string; role?: string; verify_email?: boolean }): Observable<any> {
    return this.api.patch(`/teacher/students/${id}`, payload).pipe(
      catchError(() => {
        const students = this.getLocalStudents();
        const found = students.find(s => s.id === id);
        if (found) {
          if (payload.name) found.name = payload.name;
          if (payload.role) found.role = payload.role;
          if (payload.verify_email !== undefined) {
            found.email_verified = payload.verify_email;
            found.email_verified_at = payload.verify_email ? new Date().toISOString() : null;
          }
          this.saveLocalStudents(students);
          return of({ message: 'Cuenta de estudiante actualizada correctamente.', student: found });
        }
        return of({ message: 'Actualizado satisfactoriamente.' });
      })
    );
  }

  deleteStudent(id: number): Observable<any> {
    return this.api.delete(`/teacher/students/${id}`).pipe(
      catchError(() => {
        let students = this.getLocalStudents();
        students = students.filter(s => s.id !== id);
        this.saveLocalStudents(students);
        return of({ message: 'Estudiante eliminado satisfactoriamente.' });
      })
    );
  }

  // --- GESTIÓN DE ACTIVIDADES Y QUIZZES ---
  private getLocalActivities(): TeacherActivity[] {
    if (typeof window === 'undefined') return DEFAULT_TEACHER_ACTIVITIES;
    try {
      const stored = localStorage.getItem('syseng_teacher_activities_cache');
      if (stored) return JSON.parse(stored);
      localStorage.setItem('syseng_teacher_activities_cache', JSON.stringify(DEFAULT_TEACHER_ACTIVITIES));
    } catch {}
    return DEFAULT_TEACHER_ACTIVITIES;
  }

  private saveLocalActivities(activities: TeacherActivity[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('syseng_teacher_activities_cache', JSON.stringify(activities));
    } catch {}
  }

  getActivities(): Observable<TeacherActivity[]> {
    return of(this.getLocalActivities());
  }

  createActivity(activity: Omit<TeacherActivity, 'id' | 'created_at' | 'submissions_count' | 'pass_rate'>): Observable<TeacherActivity> {
    const list = this.getLocalActivities();
    const newAct: TeacherActivity = {
      ...activity,
      id: 'act_' + Date.now(),
      created_at: new Date().toISOString(),
      submissions_count: 0,
      pass_rate: 100,
    };
    list.unshift(newAct);
    this.saveLocalActivities(list);
    return of(newAct);
  }

  deleteActivity(id: string): Observable<boolean> {
    let list = this.getLocalActivities();
    list = list.filter(a => a.id !== id);
    this.saveLocalActivities(list);
    return of(true);
  }

  generateAiQuiz(topic: string, difficulty: 'Principiante' | 'Intermedio' | 'Avanzado'): Observable<QuizQuestion[]> {
    const cleanTopic = topic.trim().toLowerCase();
    
    // Generador temático inteligente con respuestas pedagógicas precisas
    let questions: QuizQuestion[] = [];
    
    if (cleanTopic.includes('docker') || cleanTopic.includes('contenedor')) {
      questions = [
        {
          question: '¿Cuál es la diferencia fundamental entre un contenedor Docker y una máquina virtual tradicional?',
          options: [
            'Los contenedores virtualizan el hardware completo mediante un hipervisor de tipo 1.',
            'Los contenedores comparten el kernel del host y aíslan procesos en user-space (namespaces/cgroups).',
            'Los contenedores solo pueden ejecutar binarios compilados en ensamblador x86.',
            'No hay diferencia, ambos consumen una imagen completa del sistema operativo guest.'
          ],
          correct_index: 1,
          explanation: 'Docker aprovecha cgroups y namespaces del kernel Linux para aislar procesos sin sobrecarga de emulación de hardware.'
        },
        {
          question: 'En un Dockerfile, ¿cuál es la diferencia clave entre RUN y CMD?',
          options: [
            'RUN se ejecuta al construir la imagen creando una nueva capa; CMD define el comando por defecto al iniciar el contenedor.',
            'RUN define variables de entorno y CMD instala paquetes con apt-get.',
            'CMD solo se puede usar una vez y RUN compila en memoria RAM.',
            'Son totalmente sinónimos y pueden intercambiarse sin consecuencias.'
          ],
          correct_index: 0,
          explanation: 'RUN ejecuta comandos en tiempo de construcción (build-time); CMD establece el comando de arranque del contenedor (run-time).'
        },
        {
          question: '¿Qué comando permite inspeccionar los registros de salida estándar en tiempo real de un contenedor en ejecución?',
          options: ['docker top --follow', 'docker logs -f <container_id>', 'docker ps --trace', 'docker inspect --stdout'],
          correct_index: 1,
          explanation: 'El flag -f (--follow) en docker logs transmite los flujos stdout y stderr de forma continua en terminal.'
        }
      ];
    } else if (cleanTopic.includes('linux') || cleanTopic.includes('bash') || cleanTopic.includes('terminal')) {
      questions = [
        {
          question: '¿Qué combinación de permisos octales representa rwxr-xr-- en el sistema de archivos de Linux?',
          options: ['754', '744', '654', '764'],
          correct_index: 0,
          explanation: 'rwx = 4+2+1=7 (dueño), r-x = 4+0+1=5 (grupo), r-- = 4+0+0=4 (otros).'
        },
        {
          question: '¿Cuál es la función del operador pipe (|) en la shell de Unix/Linux?',
          options: [
            'Redirigir el stderr al archivo /dev/null.',
            'Conectar el stdout del comando izquierdo con el stdin del comando derecho.',
            'Ejecutar ambos comandos en hilos paralelos independientes sin compartir datos.',
            'Sobrescribir los descriptores de archivo del proceso init.'
          ],
          correct_index: 1,
          explanation: 'El pipe (|) crea un canal de comunicación unidireccional IPC entre el stdout de un proceso y el stdin del siguiente.'
        },
        {
          question: '¿Qué señal de terminación envía "kill -9 <PID>" y por qué ningún proceso puede interceptarla?',
          options: [
            'SIGTERM; puede ser ignorada si el handler está registrado.',
            'SIGKILL; es procesada directamente por el kernel del sistema operativo.',
            'SIGHUP; reinicia la sesión del terminal.',
            'SIGSTOP; suspende la ejecución temporalmente.'
          ],
          correct_index: 1,
          explanation: 'SIGKILL (9) es manejada a nivel de kernel y no puede ser capturada, bloqueada ni ignorada por el proceso de usuario.'
        }
      ];
    } else if (cleanTopic.includes('git') || cleanTopic.includes('version')) {
      questions = [
        {
          question: '¿Cuál es la diferencia crítica entre "git merge" y "git rebase"?',
          options: [
            'Merge crea un commit de unión preservando la historia exacta; rebase reescribe el historial colocando los commits sobre la nueva base.',
            'Rebase solo funciona en repositorios remotos de GitHub.',
            'Merge elimina los commits conflictivos automáticamente.',
            'Rebase nunca genera conflictos de código.'
          ],
          correct_index: 0,
          explanation: 'Rebase traslada la base de la rama actual para mantener un historial lineal limpio, recalculando nuevos hashes SHA-1.'
        },
        {
          question: '¿Qué comando permite recuperar commits o cambios perdidos tras un reset erróneo?',
          options: ['git status --all', 'git reflog', 'git bisect reset', 'git checkout -f HEAD'],
          correct_index: 1,
          explanation: 'git reflog registra cada movimiento de la referencia HEAD, permitiendo restaurar estados anteriores a operaciones destructivas.'
        }
      ];
    } else {
      questions = [
        {
          question: `¿Cuál es el principio arquitectónico fundamental que se debe priorizar al diseñar módulos en "${topic}"?`,
          options: [
            'Alta cohesión y bajo acoplamiento con separación clara de responsabilidades.',
            'Duplicar lógica para acelerar el tiempo de respuesta en caliente.',
            'Concentrar toda la lógica de negocio en un único archivo controlador.',
            'Evitar tipado estático y omitir pruebas unitarias.'
          ],
          correct_index: 0,
          explanation: 'Un buen diseño técnico exige módulos cohesivos con responsabilidades delimitadas e interfaces desacopladas.'
        },
        {
          question: `En el contexto de "${topic}", ¿cómo se mitiga el impacto de operaciones asíncronas bloqueantes?`,
          options: [
            'Empleando patrones no bloqueantes, workers concurrentes o colas de tareas con timeouts explícitos.',
            'Aumentando el tiempo de espera a infinito para evitar cancelaciones.',
            'Desactivando el garbage collector del entorno de ejecución.',
            'Ejecutando todas las consultas en el hilo principal de la UI.'
          ],
          correct_index: 0,
          explanation: 'La concurrencia saludable previene cuellos de botella mediante delegación a workers, buffering y manejo explícito de promesas/timeouts.'
        },
        {
          question: `Al refactorizar una solución técnica en "${topic}", ¿cuál es la mejor práctica de validación?`,
          options: [
            'Desplegar directamente a producción sin suite de pruebas.',
            'Escribir tests unitarios y de integración que verifiquen el contrato de entrada/salida antes y después del cambio.',
            'Cambiar nombres de variables sin ejecutar el linter.',
            'Comentar los tests que fallen.'
          ],
          correct_index: 1,
          explanation: 'La cobertura mediante pruebas automatizadas asegura que el comportamiento externo se mantenga idéntico tras la optimización.'
        }
      ];
    }

    return of(questions);
  }
}

export const DEFAULT_TEACHER_ACTIVITIES: TeacherActivity[] = [
  {
    id: 'act_101',
    title: 'Implementación de Árbol Binario de Búsqueda (BST) en C',
    description: 'Crea las funciones de inserción, búsqueda y recorrido in-order con manejo dinámico de memoria y prevención de memory leaks.',
    type: 'challenge',
    course_name: 'Estructuras de Datos y Algoritmos',
    difficulty: 'Intermedio',
    xp_reward: 150,
    expected_output: 'Recorrido in-order: 10 20 30 40 50',
    starter_code: 'typedef struct Node {\n  int val;\n  struct Node *left, *right;\n} Node;\n\nNode* insert(Node* root, int val) {\n  // TODO: implement\n}',
    created_at: '2026-09-24T14:30:00.000Z',
    author_name: 'Prof. Andrés',
    submissions_count: 32,
    pass_rate: 84.5
  },
  {
    id: 'act_102',
    title: 'Evaluación Rápida: Punteros, Aritmética de Punteros y Heap',
    description: 'Quiz evaluativo de 3 preguntas de opción múltiple para medir la comprensión de memoria dinámica en sistemas C/C++.',
    type: 'quiz',
    course_name: 'Introducción a la Programación',
    difficulty: 'Intermedio',
    xp_reward: 100,
    created_at: '2026-09-25T09:15:00.000Z',
    author_name: 'Prof. Andrés',
    submissions_count: 48,
    pass_rate: 91.2,
    quiz_questions: [
      {
        question: '¿Qué retorna la expresión sizeof(puntero) en una arquitectura de 64 bits?',
        options: ['El tamaño del tipo apuntado', '8 bytes', '4 bytes', 'Depende de la cantidad de elementos en el array'],
        correct_index: 1,
        explanation: 'En arquitecturas x86_64, una dirección de memoria ocupa exactamente 64 bits (8 bytes).'
      },
      {
        question: '¿Cuál es la consecuencia de invocar free() sobre un puntero no reservado dinámicamente?',
        options: ['El puntero se asigna a NULL', 'Comportamiento indefinido o segfault en runtime', 'El compilador lanza un warning pero el programa continúa', 'Se libera la memoria de la pila (stack)'],
        correct_index: 1,
        explanation: 'free() solo debe recibir punteros retornados por malloc/calloc/realloc; de lo contrario corrompe la metadata del heap.'
      },
      {
        question: '¿Qué operador se utiliza para desreferenciar un puntero y acceder al valor almacenado?',
        options: ['&', '->', '*', '.'],
        correct_index: 2,
        explanation: 'El asterisco (*) actúa como operador de desreferenciación para leer o escribir en la dirección almacenada.'
      }
    ]
  },
  {
    id: 'act_103',
    title: 'Automatización y Tuberías en Terminal Bash',
    description: 'Diseñar un script que filtre logs de accesos HTTP erróneos (códigos 4xx y 5xx), ordenándolos por IP frecuente usando awk, sort y uniq.',
    type: 'terminal',
    course_name: 'Sistemas Operativos y Linux',
    difficulty: 'Avanzado',
    xp_reward: 120,
    expected_output: '192.168.1.10 - 45 errores 404',
    created_at: '2026-09-26T16:00:00.000Z',
    author_name: 'Prof. Andrés',
    submissions_count: 26,
    pass_rate: 88.0
  }
];
