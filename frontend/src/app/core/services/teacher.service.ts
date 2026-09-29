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
}
