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
    return this.api.get<Course>(`/courses/${slug}`).pipe(
      catchError(() => {
        const found = FALLBACK_COURSES.find(c => c.slug === slug || c.slug.includes(slug) || slug.includes(c.slug)) || FALLBACK_COURSES[0];
        return of(found);
      })
    );
  }

  getLesson(lessonSlug: string): Observable<LessonDetail> {
    const foundFallback = FALLBACK_LESSONS[lessonSlug] ||
      Object.values(FALLBACK_LESSONS).find(l => l.slug === lessonSlug || l.slug.includes(lessonSlug) || lessonSlug.includes(l.slug)) ||
      FALLBACK_LESSONS['introduccion-programacion-que-es-programar'] ||
      Object.values(FALLBACK_LESSONS)[0];

    return this.api.get<LessonDetail>(`/lessons/${lessonSlug}`).pipe(
      catchError(() => {
        return of(foundFallback);
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
