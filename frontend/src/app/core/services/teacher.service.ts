import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

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

@Injectable({
  providedIn: 'root',
})
export class TeacherService {
  private readonly api = inject(ApiService);

  getOverview(): Observable<TeacherOverviewResponse> {
    return this.api.get<TeacherOverviewResponse>('/teacher/overview');
  }

  getStudents(search?: string): Observable<TeacherStudent[]> {
    const params: Record<string, string> = {};
    if (search && search.trim()) {
      params['search'] = search.trim();
    }
    return this.api.get<TeacherStudent[]>('/teacher/students', params);
  }

  getStudentDetail(id: number): Observable<TeacherStudentDetail> {
    return this.api.get<TeacherStudentDetail>(`/teacher/students/${id}`);
  }

  updateStudent(id: number, payload: { name?: string; role?: string; verify_email?: boolean }): Observable<any> {
    return this.api.patch(`/teacher/students/${id}`, payload);
  }

  deleteStudent(id: number): Observable<any> {
    return this.api.delete(`/teacher/students/${id}`);
  }
}
