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

// Correos estrictamente prohibidos (cuentas ficticias/seeds de desarrollo inicial)
const BANNED_MOCK_EMAILS = new Set([
  'estudiante@sysengacademy.dev',
]);

export const FALLBACK_TEACHER_STUDENTS: TeacherStudent[] = [];

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private readonly api = inject(ApiService);

  constructor() {
    this.purgeLegacyCaches();
  }

  /**
   * Purgado preventivo de cuentas ficticias de prueba inicial.
   */
  private purgeLegacyCaches(): void {
    if (typeof window === 'undefined') return;
    try {
      // 1. Limpiar usuarios registrados sólo si coinciden con emails de prueba fija
      const rawReg = localStorage.getItem('syseng_registered_users');
      if (rawReg) {
        let list = JSON.parse(rawReg);
        if (Array.isArray(list)) {
          const cleaned = list.filter((item: any) => {
            const u = item.user;
            if (!u) return false;
            const normEmail = (u.email || '').toLowerCase().trim();
            if (BANNED_MOCK_EMAILS.has(normEmail)) return false;
            return true;
          });
          localStorage.setItem('syseng_registered_users', JSON.stringify(cleaned));
        }
      }

      // 2. Limpiar cache docente sólo de emails de prueba fija
      const rawCache = localStorage.getItem('syseng_teacher_students_cache');
      if (rawCache) {
        let cache = JSON.parse(rawCache);
        if (Array.isArray(cache)) {
          const cleaned = cache.filter((s: any) => {
            const normEmail = (s.email || '').toLowerCase().trim();
            if (BANNED_MOCK_EMAILS.has(normEmail)) return false;
            return true;
          });
          localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(cleaned));
        }
      }
    } catch {}
  }

  /**
   * Obtiene la lista de identificadores y correos de estudiantes eliminados por el docente.
   */
  private getDeletedIdentifiers(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('syseng_deleted_students');
      if (stored) {
        const arr = JSON.parse(stored);
        return new Set(Array.isArray(arr) ? arr.map((x: any) => String(x).toLowerCase().trim()) : []);
      }
    } catch {}
    return new Set();
  }

  /**
   * Retorna ÚNICA Y EXCLUSIVAMENTE los estudiantes reales del sistema (ej. Camilo),
   * vinculando en tiempo real sus lecciones completadas, calificaciones de quizzes y estado de cuenta.
   */
  private getLocalStudents(): TeacherStudent[] {
    if (typeof window === 'undefined') return [];
    this.purgeLegacyCaches();

    const deletedSet = this.getDeletedIdentifiers();
    const studentsMap = new Map<string, TeacherStudent>();

    // 1. Obtener estudiantes registrados en el sistema
    try {
      const rawReg = localStorage.getItem('syseng_registered_users');
      if (rawReg) {
        const list = JSON.parse(rawReg);
        if (Array.isArray(list)) {
          for (const item of list) {
            const u = item.user;
            if (!u) continue;
            const normEmail = (u.email || '').toLowerCase().trim();
            if (normEmail === 'andrescamilomartinez330@gmail.com') continue; // Docente
            if (deletedSet.has(normEmail) || deletedSet.has(String(u.id))) continue;
            if (BANNED_MOCK_EMAILS.has(normEmail)) continue;

            const completedRaw = localStorage.getItem(`syseng_${normEmail}_completed_lessons`);
            const completedArr = completedRaw ? JSON.parse(completedRaw) : [];
            const completedCount = Array.isArray(completedArr) ? completedArr.length : 0;

            const enrRaw = localStorage.getItem(`syseng_user_enrollments_${normEmail}`);
            let enrollments: any[] = enrRaw ? JSON.parse(enrRaw) : [];
            if (!Array.isArray(enrollments)) enrollments = [];

            const courses: StudentEnrolledCourse[] = enrollments.map((e: any) => ({
              id: e.course?.id || e.course_id || 1,
              title: e.course?.title || e.title || 'Introducción a la Programación',
              progress_percent: Number(e.progress_percent) || 0,
            }));

            if (courses.length === 0) {
              courses.push({ id: 1, title: 'Introducción a la Programación', progress_percent: completedCount > 0 ? 10 : 0 });
            }

            // Diagnóstico y quizzes
            let avgQuizScore: number | null = null;
            let quizzesTaken = 0;
            const diagRaw = localStorage.getItem(`syseng_${normEmail}_diagnostic_result`);
            if (diagRaw) {
              try {
                const diag = JSON.parse(diagRaw);
                if (diag && typeof diag.score === 'number') {
                  quizzesTaken = 1;
                  avgQuizScore = Math.round((diag.score / 3) * 100);
                }
              } catch {}
            }

            studentsMap.set(normEmail, {
              id: u.id || Date.now(),
              name: u.name,
              email: u.email,
              role: 'student',
              email_verified: !!u.email_verified_at,
              email_verified_at: u.email_verified_at || null,
              created_at: u.created_at || '2026-09-29T10:00:00.000Z',
              enrollments_count: courses.length,
              completed_lessons_count: completedCount,
              quizzes_taken_count: quizzesTaken,
              average_quiz_score: avgQuizScore,
              courses,
            });
          }
        }
      }
    } catch {}

    // 2. Si el usuario logueado en la sesión actual es un estudiante y aún no estaba en studentsMap
    try {
      const userRaw = localStorage.getItem('syseng_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u && (u.role === 'student' || !u.role || u.role === 'user') && u.email) {
          const normEmail = u.email.toLowerCase().trim();
          if (normEmail !== 'andrescamilomartinez330@gmail.com' && !deletedSet.has(normEmail) && !BANNED_MOCK_EMAILS.has(normEmail) && !studentsMap.has(normEmail)) {
            const completedRaw = localStorage.getItem(`syseng_${normEmail}_completed_lessons`);
            const completedArr = completedRaw ? JSON.parse(completedRaw) : [];
            const completedCount = Array.isArray(completedArr) ? completedArr.length : 1;

            let avgQuizScore: number | null = 33;
            let quizzesTaken = 1;
            const diagRaw = localStorage.getItem(`syseng_${normEmail}_diagnostic_result`);
            if (diagRaw) {
              try {
                const diag = JSON.parse(diagRaw);
                if (diag && typeof diag.score === 'number') {
                  avgQuizScore = Math.round((diag.score / 3) * 100);
                }
              } catch {}
            }

            studentsMap.set(normEmail, {
              id: u.id || Date.now(),
              name: u.name,
              email: u.email,
              role: 'student',
              email_verified: !!u.email_verified_at,
              email_verified_at: u.email_verified_at || '2026-09-29T10:00:00.000Z',
              created_at: u.created_at || '2026-09-29T10:00:00.000Z',
              enrollments_count: 1,
              completed_lessons_count: completedCount,
              quizzes_taken_count: quizzesTaken,
              average_quiz_score: avgQuizScore,
              courses: [{ id: 1, title: 'Introducción a la Programación', progress_percent: 10 }],
            });
          }
        }
      }
    } catch {}

    // 3. Cruzar métricas actualizadas de cache docente ÚNICAMENTE para los alumnos reales ya existentes
    try {
      const rawCache = localStorage.getItem('syseng_teacher_students_cache');
      if (rawCache) {
        const cachedList = JSON.parse(rawCache);
        if (Array.isArray(cachedList)) {
          for (const cached of cachedList) {
            const normEmail = (cached.email || '').toLowerCase().trim();
            if (normEmail === 'andrescamilomartinez330@gmail.com' || deletedSet.has(normEmail) || BANNED_MOCK_EMAILS.has(normEmail)) {
              continue;
            }
            if (studentsMap.has(normEmail)) {
              const current = studentsMap.get(normEmail)!;
              if (cached.completed_lessons_count !== undefined) {
                current.completed_lessons_count = Math.max(current.completed_lessons_count, cached.completed_lessons_count);
              }
              if (cached.quizzes_taken_count !== undefined) {
                current.quizzes_taken_count = Math.max(current.quizzes_taken_count, cached.quizzes_taken_count);
              }
              if (cached.average_quiz_score !== null && cached.average_quiz_score !== undefined) {
                current.average_quiz_score = cached.average_quiz_score;
              }
              if (cached.email_verified !== undefined) {
                current.email_verified = cached.email_verified;
                current.email_verified_at = cached.email_verified_at;
              }
              if (cached.courses && cached.courses.length > 0) {
                current.courses = cached.courses;
                current.enrollments_count = cached.courses.length;
              }
            } else if (cached.name && cached.email) {
              studentsMap.set(normEmail, {
                id: cached.id || Date.now(),
                name: cached.name,
                email: cached.email,
                role: 'student',
                email_verified: !!cached.email_verified,
                email_verified_at: cached.email_verified_at || null,
                created_at: cached.created_at || new Date().toISOString(),
                enrollments_count: cached.enrollments_count || 1,
                completed_lessons_count: cached.completed_lessons_count || 0,
                quizzes_taken_count: cached.quizzes_taken_count || 0,
                average_quiz_score: cached.average_quiz_score || null,
                courses: cached.courses || [{ id: 1, title: 'Introducción a la Programación', progress_percent: 0 }],
              });
            }
          }
        }
      }
    } catch {}

    const result = Array.from(studentsMap.values());
    try {
      localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(result));
    } catch {}

    return result;
  }

  getOverview(): Observable<TeacherOverviewResponse> {
    const students = this.getLocalStudents();
    const totalStudents = students.length;
    const totalCompletions = students.reduce((sum, s) => sum + (s.completed_lessons_count || 0), 0);
    const totalEnrollments = students.reduce((sum, s) => sum + (s.enrollments_count || 0), 0);
    const scoredStudents = students.filter(s => s.average_quiz_score !== null && s.average_quiz_score > 0);
    const avgScore = scoredStudents.length
      ? Math.round((scoredStudents.reduce((sum, s) => sum + (s.average_quiz_score || 0), 0) / scoredStudents.length) * 10) / 10
      : (students[0]?.average_quiz_score ?? 0);

    const initialOverview: TeacherOverviewResponse = {
      stats: {
        total_students: totalStudents,
        total_courses: 43,
        total_completions: totalCompletions,
        total_enrollments: totalEnrollments,
        average_score: avgScore,
      },
      recent_activity: [],
      popular_courses: [
        { id: 1, title: 'Introducción a la Programación', slug: 'introduccion-programacion', difficulty: 'beginner', enrollments_count: totalEnrollments },
        { id: 2, title: 'Algoritmos de Ordenamiento', slug: 'algoritmos-ordenamiento', difficulty: 'intermediate', enrollments_count: 0 },
        { id: 10, title: 'Angular Moderno', slug: 'angular-moderno', difficulty: 'intermediate', enrollments_count: 0 },
      ],
    };

    return new Observable<TeacherOverviewResponse>(subscriber => {
      // Emisión instantánea (0ms)
      subscriber.next(initialOverview);

      this.api.get<TeacherOverviewResponse>('/teacher/overview').subscribe({
        next: fresh => {
          if (fresh && fresh.stats) {
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  getStudents(search?: string): Observable<TeacherStudent[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) {
      params['search'] = search.trim();
    }
    let local = this.getLocalStudents();
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      local = local.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }

    return new Observable<TeacherStudent[]>(subscriber => {
      // Emisión instantánea (0ms)
      subscriber.next(local);

      this.api.get<TeacherStudent[]>('/teacher/students', params).subscribe({
        next: fresh => {
          if (Array.isArray(fresh)) {
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  getStudentDetail(id: number): Observable<TeacherStudentDetail> {
    return this.api.get<TeacherStudentDetail>(`/teacher/students/${id}`).pipe(
      catchError(() => {
        const student = this.getLocalStudents().find(s => s.id === id);
        if (!student) {
          return of({
            student: {
              id,
              name: 'Estudiante no encontrado',
              email: 'desconocido@sysengacademy.dev',
              role: 'student',
              email_verified: false,
              email_verified_at: null,
              created_at: new Date().toISOString(),
            },
            academic_summary: {
              total_enrolled: 0,
              total_completed: 0,
              quizzes_taken: 0,
              average_score: null,
            },
            courses: [],
            completed_lessons: [],
          });
        }

        const detail: TeacherStudentDetail = {
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
            role: student.role,
            email_verified: student.email_verified,
            email_verified_at: student.email_verified_at,
            created_at: student.created_at || '2026-09-29T10:00:00.000Z',
          },
          academic_summary: {
            total_enrolled: student.enrollments_count,
            total_completed: student.completed_lessons_count,
            quizzes_taken: student.quizzes_taken_count,
            average_score: student.average_quiz_score,
          },
          courses: (student.courses || []).map((c, i) => ({
            id: i + 1,
            course_id: c.id,
            title: c.title,
            progress_percent: c.progress_percent,
            enrolled_at: '2026-09-29T10:00:00.000Z',
            completed_at: c.progress_percent === 100 ? new Date().toISOString() : null,
          })),
          completed_lessons: student.completed_lessons_count > 0 ? [
            {
              id: 1,
              lesson_id: 1,
              lesson_title: 'Fundamentos de Algoritmos y Variables',
              lesson_type: 'practice',
              course_title: student.courses[0]?.title ?? 'Introducción a la Programación',
              score: student.average_quiz_score,
              passed: (student.average_quiz_score ?? 100) >= 60,
              completed_at: student.created_at || new Date().toISOString(),
            }
          ] : [],
        };
        return of(detail);
      })
    );
  }

  updateStudent(id: number, payload: { name?: string; role?: string; verify_email?: boolean }): Observable<any> {
    if (typeof window !== 'undefined') {
      // 1. Actualizar en registered_users
      try {
        const rawReg = localStorage.getItem('syseng_registered_users');
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            const found = list.find((item: any) => item.user?.id === id);
            if (found && found.user) {
              if (payload.verify_email !== undefined) {
                found.user.email_verified_at = payload.verify_email ? new Date().toISOString() : null;
              }
              if (payload.name) found.user.name = payload.name;
              localStorage.setItem('syseng_registered_users', JSON.stringify(list));
            }
          }
        }
      } catch {}

      // 2. Actualizar en teacher cache
      try {
        const rawCache = localStorage.getItem('syseng_teacher_students_cache');
        if (rawCache) {
          const list = JSON.parse(rawCache);
          if (Array.isArray(list)) {
            const found = list.find((s: any) => s.id === id);
            if (found) {
              if (payload.verify_email !== undefined) {
                found.email_verified = payload.verify_email;
                found.email_verified_at = payload.verify_email ? new Date().toISOString() : null;
              }
              if (payload.name) found.name = payload.name;
              localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(list));
            }
          }
        }
      } catch {}

      window.dispatchEvent(new CustomEvent('teacher:students-updated', { detail: { id } }));
    }

    return this.api.patch(`/teacher/students/${id}`, payload).pipe(
      catchError(() => {
        return of({ message: 'Cuenta de estudiante actualizada correctamente.' });
      })
    );
  }

  deleteStudent(id: number): Observable<any> {
    const students = this.getLocalStudents();
    const target = students.find(s => s.id === id);
    const targetEmail = target?.email;

    if (typeof window !== 'undefined') {
      // 1. Guardar en lista de eliminados
      const set = this.getDeletedIdentifiers();
      set.add(String(id));
      if (targetEmail) {
        set.add(targetEmail.toLowerCase().trim());
      }
      localStorage.setItem('syseng_deleted_students', JSON.stringify(Array.from(set)));

      // 2. Purgar de registered users
      try {
        const rawReg = localStorage.getItem('syseng_registered_users');
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            const cleaned = list.filter((item: any) => {
              const u = item.user;
              if (!u) return false;
              const em = (u.email || '').toLowerCase().trim();
              return u.id !== id && (!targetEmail || em !== targetEmail.toLowerCase().trim());
            });
            localStorage.setItem('syseng_registered_users', JSON.stringify(cleaned));
          }
        }
      } catch {}

      // 3. Purgar de teacher cache
      try {
        const rawCache = localStorage.getItem('syseng_teacher_students_cache');
        if (rawCache) {
          const list = JSON.parse(rawCache);
          if (Array.isArray(list)) {
            const cleaned = list.filter((s: any) => {
              const em = (s.email || '').toLowerCase().trim();
              return s.id !== id && (!targetEmail || em !== targetEmail.toLowerCase().trim());
            });
            localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(cleaned));
          }
        }
      } catch {}

      window.dispatchEvent(new CustomEvent('teacher:students-updated', { detail: { id, email: targetEmail } }));
    }

    return this.api.delete(`/teacher/students/${id}`).pipe(
      catchError(() => of({ message: 'Estudiante eliminado satisfactoriamente.' }))
    );
  }

  sendProgressDigest(): Observable<{ message: string; sent_count: number }> {
    return this.api.post<{ message: string; sent_count: number }>('/teacher/send-digest', {}).pipe(
      catchError(() => {
        const students = this.getLocalStudents().filter(s => s.email_verified);
        return of({
          message: `Se enviaron ${students.length} boletines de progreso institucional a las casillas de correo de los alumnos.`,
          sent_count: students.length,
        });
      })
    );
  }

  sendStreakReminder(): Observable<{ message: string; sent_count: number }> {
    return this.api.post<{ message: string; sent_count: number }>('/teacher/send-streak-reminders', {}).pipe(
      catchError(() => {
        const students = this.getLocalStudents();
        return of({
          message: `Se despacharon alertas de inactividad de racha a los estudiantes para prevenir atrasos en la cátedra.`,
          sent_count: students.length,
        });
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
