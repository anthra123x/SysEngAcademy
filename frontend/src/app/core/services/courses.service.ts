import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Course,
  CourseFilters,
  PaginatedResponse,
  Enrollment,
  LessonDetail,
  QuizAttemptResult,
} from '../models';
import { FALLBACK_COURSES } from './fallback-data';
import { FALLBACK_LESSONS } from './fallback-lessons';

const COURSES_CACHE_KEY = 'syseng_cache_courses_v3';

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
    const found = FALLBACK_COURSES.find(c => c.slug === slug || c.slug.includes(slug) || slug.includes(c.slug)) || FALLBACK_COURSES[0];

    return new Observable<Course>(subscriber => {
      // Emisión instantánea (0ms) con todos sus módulos y lecciones
      subscriber.next(found);

      this.api.get<Course>(`/courses/${slug}`).subscribe({
        next: fresh => {
          if (fresh && fresh.modules && fresh.modules.length > 0) {
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  getLesson(lessonSlug: string): Observable<LessonDetail> {
    const foundFallback = FALLBACK_LESSONS[lessonSlug] ||
      Object.values(FALLBACK_LESSONS).find(l => l.slug === lessonSlug || l.slug.includes(lessonSlug) || lessonSlug.includes(l.slug)) ||
      FALLBACK_LESSONS['introduccion-programacion-que-es-programar'] ||
      Object.values(FALLBACK_LESSONS)[0];

    return new Observable<LessonDetail>(subscriber => {
      // Emisión instantánea (0ms) de la lección didáctica con IDE interactivo
      subscriber.next(foundFallback);

      this.api.get<LessonDetail>(`/lessons/${lessonSlug}`).subscribe({
        next: fresh => {
          if (fresh && fresh.title) {
            subscriber.next(fresh);
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

  completeLesson(lessonId: number, score?: number): Observable<{ progress_percent: number }> {
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
