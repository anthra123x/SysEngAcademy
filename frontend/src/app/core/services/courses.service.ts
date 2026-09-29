import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Course,
  CourseFilters,
  CourseModule,
  PaginatedResponse,
  Enrollment,
  Lesson,
  LessonDetail,
  QuizAttemptResult,
} from '../models';
import { FALLBACK_COURSES } from './fallback-data';
import { FALLBACK_LESSONS } from './fallback-lessons';

const COURSES_CACHE_KEY = 'syseng_cache_courses_v3';

/**
 * Determina si todas las lecciones de un módulo están completadas por el estudiante.
 * Si un módulo no tiene lecciones, se considera completado para no bloquear el flujo.
 */
export function isModuleFullyCompleted(mod: CourseModule | null | undefined): boolean {
  if (!mod || !mod.lessons || mod.lessons.length === 0) return true;
  return mod.lessons.every(l => l.completed);
}

/**
 * Determina si un módulo está desbloqueado para el estudiante:
 * - El Módulo 0 (primer módulo del curso) siempre está desbloqueado.
 * - Docentes y administradores siempre tienen acceso irrestricto.
 * - Un módulo posterior (índice > 0) sólo está desbloqueado si TODOS los módulos anteriores
 *   (desde 0 hasta moduleIndex - 1) están completados al 100%.
 */
export function isModuleUnlockedForStudent(
  moduleIndex: number,
  modules: CourseModule[] | null | undefined,
  isPrivileged: boolean = false
): boolean {
  if (isPrivileged) return true;
  if (!modules || moduleIndex <= 0) return true;
  for (let i = 0; i < moduleIndex; i++) {
    const prevMod = modules[i];
    if (prevMod && !isModuleFullyCompleted(prevMod)) {
      return false;
    }
  }
  return true;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private api = inject(ApiService);

  getAll(filters?: CourseFilters): Observable<PaginatedResponse<Course>> {
    const cached = this.readCache();

    return this.api.get<PaginatedResponse<Course>>('/courses', filters as Record<string, unknown>).pipe(
      tap(res => {
        if (!filters || Object.keys(filters).length === 0) {
          this.writeCache(res);
        }
      }),
      catchError(() => {
        let filtered = [...FALLBACK_COURSES];
        if (filters?.search) {
          const q = filters.search.toLowerCase().trim();
          filtered = filtered.filter(c =>
            c.title.toLowerCase().includes(q) ||
            (c.description && c.description.toLowerCase().includes(q))
          );
        }
        if (filters?.category) {
          filtered = filtered.filter(c => c.category?.slug === filters.category);
        }
        if (filters?.difficulty) {
          filtered = filtered.filter(c => c.difficulty === filters.difficulty);
        }
        if (filters?.is_free !== undefined && filters?.is_free !== null && (filters?.is_free as any) !== '') {
          const isFreeBool = String(filters.is_free) === 'true' || filters.is_free === true;
          filtered = filtered.filter(c => c.is_free === isFreeBool);
        }
        if (filters?.learning_path_id) {
          filtered = filtered.filter(c => (c as any).learning_path_id === Number(filters.learning_path_id));
        }

        const page = Number(filters?.page) || 1;
        const perPage = 16;
        const total = filtered.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        const start = (page - 1) * perPage;
        const paginatedData = filtered.slice(start, start + perPage);

        const fallbackRes: PaginatedResponse<Course> = {
          current_page: page,
          data: paginatedData,
          total: total,
          per_page: perPage,
          last_page: lastPage,
        };
        return of(cached && (!filters || Object.keys(filters).length === 0) ? cached : fallbackRes);
      })
    );
  }

  getBySlug(slug: string): Observable<Course> {
    const raw = FALLBACK_COURSES.find(c => c.slug === slug || c.slug.includes(slug) || slug.includes(c.slug)) || FALLBACK_COURSES[0];
    const found = this.enrichCourseWithCompletions(raw);

    return new Observable<Course>(subscriber => {
      // Emisión instantánea (0ms) con todos sus módulos y lecciones enriquecidas con progreso real
      subscriber.next(found);

      this.api.get<Course>(`/courses/${slug}`).subscribe({
        next: fresh => {
          if (fresh && fresh.modules && fresh.modules.length > 0) {
            subscriber.next(this.enrichCourseWithCompletions(fresh));
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  getLesson(lessonSlug: string): Observable<LessonDetail> {
    const rawFallback = FALLBACK_LESSONS[lessonSlug] ||
      Object.values(FALLBACK_LESSONS).find(l => l.slug === lessonSlug || l.slug.includes(lessonSlug) || lessonSlug.includes(l.slug)) ||
      FALLBACK_LESSONS['introduccion-programacion-que-es-programar'] ||
      Object.values(FALLBACK_LESSONS)[0];
    const foundFallback = this.enrichLessonWithCompletions(rawFallback);

    return new Observable<LessonDetail>(subscriber => {
      // Emisión instantánea (0ms) de la lección didáctica con IDE interactivo
      subscriber.next(foundFallback);

      this.api.get<LessonDetail>(`/lessons/${lessonSlug}`).subscribe({
        next: fresh => {
          if (fresh && fresh.title) {
            subscriber.next(this.enrichLessonWithCompletions(fresh));
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  enroll(courseId: number): Observable<Enrollment> {
    return this.api.post<Enrollment>('/enrollments', { course_id: courseId }).pipe(
      catchError(() => {
        const fakeEnrollment: Enrollment = {
          id: Date.now(),
          user_id: 1,
          course_id: courseId,
          progress_percent: 0,
          enrolled_at: new Date().toISOString(),
        };
        return of(fakeEnrollment);
      })
    );
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>('/enrollments').pipe(
      catchError(() => {
        // En entornos sin backend o fallback, verificar si es el alumno demo o un nuevo usuario
        if (typeof window !== 'undefined') {
          try {
            const userStr = localStorage.getItem('syseng_user');
            if (userStr) {
              const u = JSON.parse(userStr);
              if (u.email?.toLowerCase() === 'estudiante@sysengacademy.dev') {
                return of(this.getDemoEnrollments());
              }
              const userKey = 'syseng_user_enrollments_' + (u.email?.toLowerCase().trim() || u.id);
              const stored = localStorage.getItem(userKey);
              if (stored) {
                return of(JSON.parse(stored));
              }
              return of([]);
            }
          } catch {}
        }
        return of([]);
      })
    );
  }

  private getDemoEnrollments(): Enrollment[] {
    return [
      {
        id: 1,
        user_id: 3,
        course_id: 1,
        enrolled_at: '2026-09-15T10:00:00.000Z',
        completed_at: '2026-09-20T18:30:00.000Z',
        progress_percent: 100,
        course: {
          id: 1,
          title: 'Introducción a la Programación',
          slug: 'introduccion-programacion',
          description: 'Fundamentos de algoritmos, variables, estructuras de control y lógica computacional.',
          duration_hours: 12,
          difficulty: 'beginner',
          is_free: true,
          category: { id: 1, name: 'Fundamentos', slug: 'programacion-basica' },
        } as any,
      },
      {
        id: 2,
        user_id: 3,
        course_id: 2,
        enrolled_at: '2026-09-18T14:00:00.000Z',
        completed_at: undefined,
        progress_percent: 65,
        course: {
          id: 2,
          title: 'Algoritmos de Ordenamiento',
          slug: 'algoritmos-ordenamiento',
          description: 'BubbleSort, InsertionSort, MergeSort y QuickSort con análisis de complejidad.',
          duration_hours: 15,
          difficulty: 'intermediate',
          is_free: false,
          category: { id: 2, name: 'Algoritmos', slug: 'algoritmos' },
        } as any,
      },
      {
        id: 3,
        user_id: 3,
        course_id: 3,
        enrolled_at: '2026-09-22T09:00:00.000Z',
        completed_at: undefined,
        progress_percent: 40,
        course: {
          id: 3,
          title: 'Introducción al Desarrollo Web',
          slug: 'introduccion-desarrollo-web',
          description: 'HTML semántico, arquitectura cliente-servidor y estilos CSS modernos.',
          duration_hours: 18,
          difficulty: 'beginner',
          is_free: true,
          category: { id: 3, name: 'Web', slug: 'desarrollo-web' },
        } as any,
      },
      {
        id: 4,
        user_id: 3,
        course_id: 106,
        enrolled_at: '2026-09-23T11:00:00.000Z',
        completed_at: '2026-09-26T16:00:00.000Z',
        progress_percent: 100,
        course: {
          id: 106,
          title: 'Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos',
          slug: 'git-avanzado-rebase-cherry-pick-conflictos-complejos',
          description: 'Flujos profesionales en equipo, ramas efímeras y resolución quirúrgica de merge conflicts.',
          duration_hours: 10,
          difficulty: 'intermediate',
          is_free: false,
          category: { id: 4, name: 'Herramientas', slug: 'programacion-basica' },
        } as any,
      },
    ];
  }

  getUserEmail(): string {
    if (typeof window === 'undefined') return 'guest';
    try {
      const userStr = localStorage.getItem('syseng_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return (u.email || 'guest').toLowerCase().trim();
      }
    } catch {}
    return 'guest';
  }

  getCompletedLessonIds(): Set<number> {
    if (typeof window === 'undefined') return new Set();
    const email = this.getUserEmail();
    const key = `syseng_${email}_completed_lessons`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {}
    if (email === 'estudiante@sysengacademy.dev') {
      return new Set([1, 2, 418, 3, 4]);
    }
    return new Set();
  }

  isLessonCompleted(lessonId: number, lessonSlug?: string): boolean {
    const ids = this.getCompletedLessonIds();
    if (ids.has(lessonId)) return true;
    if (lessonSlug && typeof window !== 'undefined') {
      const email = this.getUserEmail();
      const slugKey = `syseng_${email}_completed_lesson_slugs`;
      try {
        const slugRaw = JSON.parse(localStorage.getItem(slugKey) || '[]');
        if (Array.isArray(slugRaw) && slugRaw.includes(lessonSlug)) return true;
      } catch {}
    }
    return false;
  }

  saveCompletedLesson(lessonId: number, lessonSlug?: string): void {
    if (typeof window === 'undefined') return;
    const email = this.getUserEmail();
    const key = `syseng_${email}_completed_lessons`;
    const set = this.getCompletedLessonIds();
    set.add(lessonId);
    try {
      localStorage.setItem(key, JSON.stringify(Array.from(set)));
      if (lessonSlug) {
        const slugKey = `syseng_${email}_completed_lesson_slugs`;
        const slugRaw = JSON.parse(localStorage.getItem(slugKey) || '[]');
        if (!slugRaw.includes(lessonSlug)) {
          slugRaw.push(lessonSlug);
          localStorage.setItem(slugKey, JSON.stringify(slugRaw));
        }
      }
      window.dispatchEvent(new CustomEvent('lesson-completed-updated', { detail: { lessonId, lessonSlug, email } }));
    } catch {}
  }

  enrichCourseWithCompletions(course: Course): Course {
    if (!course || !course.modules) return course;
    const completedIds = this.getCompletedLessonIds();
    return {
      ...course,
      modules: course.modules.map(mod => ({
        ...mod,
        lessons: (mod.lessons ?? []).map(lesson => ({
          ...lesson,
          completed: !!lesson.completed || completedIds.has(lesson.id) || this.isLessonCompleted(lesson.id, lesson.slug),
        })),
      })),
    };
  }

  enrichLessonWithCompletions(lesson: LessonDetail): LessonDetail {
    if (!lesson) return lesson;
    const isComp = this.isLessonCompleted(lesson.id, lesson.slug);
    return {
      ...lesson,
      completed: !!lesson.completed || isComp,
    };
  }

  syncEnrollmentProgress(courseSlug?: string, lessonId?: number): void {
    if (typeof window === 'undefined') return;
    const email = this.getUserEmail();
    if (email === 'guest') return;

    try {
      const enrKey = `syseng_user_enrollments_${email}`;
      const enrollments: Enrollment[] = JSON.parse(localStorage.getItem(enrKey) || '[]');

      // Encontrar el curso relevante
      let targetCourse = FALLBACK_COURSES.find(c => c.slug === courseSlug);
      if (!targetCourse && lessonId) {
        targetCourse = FALLBACK_COURSES.find(c =>
          (c.modules ?? []).some(m => (m.lessons ?? []).some(l => l.id === lessonId))
        );
      }
      if (!targetCourse && enrollments.length > 0) {
        targetCourse = targetCourse || FALLBACK_COURSES.find(c => c.id === enrollments[0].course_id);
      }
      if (!targetCourse) return;

      const allLessons = (targetCourse.modules ?? []).flatMap(m => m.lessons ?? []);
      const totalCount = allLessons.length;
      if (totalCount === 0) return;

      const completedIds = this.getCompletedLessonIds();
      const doneCount = allLessons.filter(l => completedIds.has(l.id) || this.isLessonCompleted(l.id, l.slug)).length;
      const progressPercent = Math.min(100, Math.round((doneCount / totalCount) * 100));

      const existingIdx = enrollments.findIndex(e => e.course_id === targetCourse!.id || e.course?.slug === targetCourse!.slug);
      if (existingIdx >= 0) {
        enrollments[existingIdx].progress_percent = progressPercent;
        if (progressPercent === 100 && !enrollments[existingIdx].completed_at) {
          enrollments[existingIdx].completed_at = new Date().toISOString();
        }
      } else {
        enrollments.push({
          id: Date.now(),
          user_id: 1,
          course_id: targetCourse.id,
          enrolled_at: new Date().toISOString(),
          completed_at: progressPercent === 100 ? new Date().toISOString() : undefined,
          progress_percent: progressPercent,
          course: targetCourse,
        });
      }
      localStorage.setItem(enrKey, JSON.stringify(enrollments));

      // Sincronizar con la caché del panel docente
      const teacherCache = JSON.parse(localStorage.getItem('syseng_teacher_students_cache') || '[]');
      const stIdx = teacherCache.findIndex((s: any) => s.email?.toLowerCase() === email);
      if (stIdx >= 0) {
        teacherCache[stIdx].completed_lessons_count = Math.max(teacherCache[stIdx].completed_lessons_count || 0, doneCount);
        teacherCache[stIdx].courses = [{ id: targetCourse.id, title: targetCourse.title, progress_percent: progressPercent }];
        localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(teacherCache));
        window.dispatchEvent(new CustomEvent('teacher:students-updated', { detail: { email, progressPercent } }));
      }
    } catch {}
  }

  completeLesson(lessonId: number, score?: number, lessonSlug?: string, courseSlug?: string): Observable<{ progress_percent: number }> {
    this.saveCompletedLesson(lessonId, lessonSlug);
    this.syncEnrollmentProgress(courseSlug, lessonId);

    return this.api.post<{ progress_percent: number }>(`/lessons/${lessonId}/complete`, { score }).pipe(
      catchError(() => of({ progress_percent: 100 }))
    );
  }

  submitQuizAttempt(
    lessonSlug: string,
    answers: Record<string, number[]>
  ): Observable<QuizAttemptResult> {
    return this.api.post<QuizAttemptResult>(`/lessons/${lessonSlug}/quiz/attempt`, { answers }).pipe(
      catchError(() => of({
        passed: true,
        score: 100,
        total: 3,
        correct: 3,
        results: [],
      }))
    );
  }

  askAi(lessonId: number, code: string): Observable<{ reply: string }> {
    return this.api.post<{ reply: string }>('/ai/ask', {
      lesson_id: lessonId,
      kind: 'code_review',
      code,
    }).pipe(
      catchError(() => of({
        reply: 'Buen trabajo con la lógica. Recuerda revisar la indentación y nombrar las variables con claridad.',
      }))
    );
  }

  private readCache(): PaginatedResponse<Course> | null {
    try {
      const raw = localStorage.getItem(COURSES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data?.length >= FALLBACK_COURSES.length) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }

  private writeCache(data: PaginatedResponse<Course>): void {
    try {
      localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}
