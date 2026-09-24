import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Course, CourseFilters, PaginatedResponse, Enrollment } from '../models';

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private api = inject(ApiService);

  getAll(filters?: CourseFilters): Observable<PaginatedResponse<Course>> {
    return this.api.get<PaginatedResponse<Course>>('/courses', filters as Record<string, unknown>);
  }

  getBySlug(slug: string): Observable<Course> {
    return this.api.get<Course>(`/courses/${slug}`);
  }

  enroll(courseId: number): Observable<Enrollment> {
    return this.api.post<Enrollment>('/enrollments', { course_id: courseId });
  }

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.api.get<Enrollment[]>('/enrollments');
  }

  completeLesson(lessonId: number, score?: number): Observable<{ progress_percent: number }> {
    return this.api.post<{ progress_percent: number }>(`/lessons/${lessonId}/complete`, { score });
  }
}
