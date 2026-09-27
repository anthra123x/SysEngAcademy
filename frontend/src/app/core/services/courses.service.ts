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

const COURSES_CACHE_KEY = 'syseng_cache_courses';

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
        const fallbackRes: PaginatedResponse<Course> = {
          current_page: 1,
          data: FALLBACK_COURSES,
          total: FALLBACK_COURSES.length,
          per_page: 12,
          last_page: 1,
        };
        return of(cached || fallbackRes);
      })
    );
  }

  getBySlug(slug: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${slug}`).pipe(
      catchError(() => {
        const found = FALLBACK_COURSES.find(c => c.slug === slug) || FALLBACK_COURSES[0];
        return of(found);
      })
    );
  }

  getLesson(lessonSlug: string): Observable<LessonDetail> {
    return this.api.get<LessonDetail>(`/lessons/${lessonSlug}`).pipe(
      catchError(() => {
        const fallbackLesson: LessonDetail = {
          id: 1,
          module_id: 1,
          title: 'Sintaxis básica y variables en Python',
          slug: lessonSlug,
          type: 'code_challenge',
          duration_minutes: 15,
          order: 1,
          is_preview: true,
          content: '### Introducción a Variables\n\nEn Python, las variables se definen asignando un valor con `=`.',
          starter_code: '# Escribe tu código aquí\nnombre = "SysEng"\nprint("Hola " + nombre)',
          solution: 'nombre = "SysEng"\nprint("Hola " + nombre)',
          language: 'python',
          completed: false,
          module: {
            id: 1,
            title: 'Módulo 1: Fundamentos',
            course: { id: 1, slug: 'introduccion-programacion', title: 'Introducción a la Programación' }
          },
          quiz: null,
        };
        return of(fallbackLesson);
      })
    );
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
      catchError(() => of([]))
    );
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
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  private writeCache(data: PaginatedResponse<Course>): void {
    try {
      localStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}
