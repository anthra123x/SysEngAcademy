import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Course,
  CourseFilters,
  CourseModule,
  PaginatedResponse,
  Enrollment,
  LessonDetail,
  QuizAttemptResult,
} from '../models';

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
    const hasFilters = filters && Object.keys(filters).length > 0;

    return new Observable<PaginatedResponse<Course>>(subscriber => {
      // Si no hay filtros y existe caché local, emitir de inmediato para mejorar FCP
      if (!hasFilters && cached) {
        subscriber.next(cached);
      }

      this.api.get<PaginatedResponse<Course>>('/courses', filters as Record<string, unknown>).subscribe({
        next: fresh => {
          if (fresh && Array.isArray(fresh.data)) {
            if (!hasFilters) {
              this.writeCache(fresh);
            }
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: err => {
          if (!cached || hasFilters) {
            subscriber.error(err);
          } else {
            subscriber.complete();
          }
        },
      });
    });
  }

  getBySlug(slug: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${slug}`).pipe(
      map(course => this.enrichCourseWithCompletions(course))
    );
  }

  getLesson(lessonSlug: string): Observable<LessonDetail> {
    return this.api.get<LessonDetail>(`/lessons/${lessonSlug}`).pipe(
      map(lesson => this.enrichLessonWithCompletions(lesson))
    );
  }

  enroll(courseId: number, checkoutToken?: string): Observable<Enrollment> {
    return this.api.post<Enrollment>('/enrollments', { course_id: courseId, checkout_token: checkoutToken });
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>('/enrollments');
  }

  getUserEmail(): string {
    if (typeof window === 'undefined') return 'guest';
    try {
      const userStr = localStorage.getItem('syseng_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        return (u.email || 'guest').toLowerCase().trim();
      }
    } catch (e) {
      console.warn('Error reading syseng_user from localStorage', e);
    }
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
        if (Array.isArray(arr)) return new Set(arr.map(Number));
      }
    } catch (e) {
      console.warn('Error reading completed lessons from localStorage', e);
    }
    return new Set();
  }

  isLessonCompleted(lessonId: number, lessonSlug?: string): boolean {
    const ids = this.getCompletedLessonIds();
    if (ids.has(Number(lessonId))) return true;
    if (lessonSlug && typeof window !== 'undefined') {
      const email = this.getUserEmail();
      const slugKey = `syseng_${email}_completed_lesson_slugs`;
      try {
        const slugRaw = JSON.parse(localStorage.getItem(slugKey) || '[]');
        if (Array.isArray(slugRaw) && slugRaw.includes(lessonSlug)) return true;
      } catch (e) {
        console.warn('Error checking completed lesson slug', e);
      }
    }
    return false;
  }

  saveCompletedLesson(lessonId: number, lessonSlug?: string): void {
    if (typeof window === 'undefined') return;
    const email = this.getUserEmail();
    const key = `syseng_${email}_completed_lessons`;
    const set = this.getCompletedLessonIds();
    set.add(Number(lessonId));
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
      window.dispatchEvent(new CustomEvent('lesson-completed-updated', { detail: { lessonId: Number(lessonId), lessonSlug, email } }));
    } catch (e) {
      console.warn('Error saving completed lesson to localStorage', e);
    }
  }

  enrichCourseWithCompletions(course: Course): Course {
    if (!course || !course.modules) return course;
    const completedIds = this.getCompletedLessonIds();

    // Sincronizar en localStorage cualquier progreso proveniente de PostgreSQL
    for (const mod of course.modules) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.completed) {
          completedIds.add(Number(lesson.id));
          this.saveCompletedLesson(Number(lesson.id), lesson.slug);
        }
      }
    }

    const allLessons = course.modules.flatMap(mod => mod.lessons ?? []);
    const doneCount = allLessons.filter(l => !!l.completed || completedIds.has(Number(l.id)) || this.isLessonCompleted(Number(l.id), l.slug)).length;
    const realProgress = allLessons.length > 0 ? Math.min(100, Math.round((doneCount / allLessons.length) * 100)) : 0;

    return {
      ...course,
      id: Number(course.id),
      progress_percent: realProgress,
      modules: course.modules.map(mod => ({
        ...mod,
        id: Number(mod.id),
        course_id: Number(mod.course_id),
        lessons: (mod.lessons ?? []).map(lesson => {
          const isDone = !!lesson.completed || completedIds.has(Number(lesson.id)) || this.isLessonCompleted(Number(lesson.id), lesson.slug);
          return {
            ...lesson,
            id: Number(lesson.id),
            module_id: Number(lesson.module_id),
            completed: isDone,
          };
        }),
      })),
    };
  }

  enrichLessonWithCompletions(lesson: LessonDetail): LessonDetail {
    if (!lesson) return lesson;
    const numId = Number(lesson.id);
    if (lesson.completed) {
      this.saveCompletedLesson(numId, lesson.slug);
    }
    const isComp = !!lesson.completed || this.isLessonCompleted(numId, lesson.slug);
    return {
      ...lesson,
      id: numId,
      completed: isComp,
    };
  }

  syncEnrollmentProgress(courseSlug?: string, lessonId?: number): void {
    if (typeof window === 'undefined') return;
    const email = this.getUserEmail();
    if (email === 'guest') return;

    try {
      const enrKey = `syseng_user_enrollments_${email}`;
      const enrollments: Enrollment[] = JSON.parse(localStorage.getItem(enrKey) || '[]');
      const cachedCourses = this.readCache()?.data || [];

      let targetCourse = cachedCourses.find(c => c.slug === courseSlug);
      if (!targetCourse && lessonId) {
        targetCourse = cachedCourses.find(c =>
          (c.modules ?? []).some(m => (m.lessons ?? []).some(l => l.id === lessonId))
        );
      }
      if (!targetCourse && enrollments.length > 0) {
        targetCourse = cachedCourses.find(c => c.id === enrollments[0].course_id);
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
      }
      localStorage.setItem(enrKey, JSON.stringify(enrollments));
    } catch (e) {
      console.warn('Error syncing enrollment progress', e);
    }
  }

  completeLesson(lessonId: number, score?: number, lessonSlug?: string, courseSlug?: string): Observable<{ progress_percent: number }> {
    this.saveCompletedLesson(lessonId, lessonSlug);
    this.syncEnrollmentProgress(courseSlug, lessonId);

    return this.api.post<{ progress_percent: number }>(`/lessons/${lessonId}/complete`, { score });
  }

  submitQuizAttempt(
    lessonSlug: string,
    answers: Record<string, number[]>
  ): Observable<QuizAttemptResult> {
    return this.api.post<QuizAttemptResult>(`/lessons/${lessonSlug}/quiz/attempt`, { answers });
  }

  askAi(lessonId: number, code: string): Observable<{ reply: string }> {
    return this.api.post<{ reply: string }>('/ai/ask', {
      lesson_id: lessonId,
      kind: 'code_review',
      code,
    });
  }

  private readCache(): PaginatedResponse<Course> | null {
    try {
      const raw = localStorage.getItem(COURSES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading courses cache from localStorage', e);
    }
    return null;
  }

  private writeCache(data: PaginatedResponse<Course>): void {
    try {
      localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Error writing courses cache to localStorage', e);
    }
  }
}

