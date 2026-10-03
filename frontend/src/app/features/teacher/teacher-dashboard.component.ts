import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  TeacherOverviewResponse,
  TeacherService,
  TeacherStudent,
  TeacherStudentDetail,
  TeacherActivity,
  QuizQuestion,
} from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';
import { AppIconComponent } from '../../shared/components/app-icon.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  private readonly teacherSvc = inject(TeacherService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);

  private routeSub?: Subscription;

  // Estados reactivos principales
  readonly loading = signal<boolean>(false);
  readonly overview = signal<TeacherOverviewResponse | null>(null);
  readonly students = signal<TeacherStudent[]>([]);
  readonly activities = signal<TeacherActivity[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'verified' | 'unverified'>('all');
  readonly activityTypeFilter = signal<'all' | 'challenge' | 'quiz' | 'terminal'>('all');
  readonly activeTab = signal<'students' | 'activities' | 'activity' | 'ai'>('students');

  readonly selectedStudentDetail = signal<TeacherStudentDetail | null>(null);

  // Estados para modal de creación
  readonly showCreateModal = signal<boolean>(false);
  readonly modalType = signal<'challenge' | 'quiz'>('challenge');
  readonly newActivityTitle = signal<string>('');
  readonly newActivityCourse = signal<string>('Introducción a la Programación');
  readonly newActivityDifficulty = signal<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  readonly newActivityXp = signal<number>(100);
  readonly newActivityDescription = signal<string>('');
  readonly newActivityStarterCode = signal<string>('');
  readonly newActivityExpectedOutput = signal<string>('');
  readonly quizQuestionsList = signal<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
    },
  ]);

  // Estados para asistente IA
  readonly aiTopic = signal<string>('Docker y Contenedores');
  readonly aiDifficulty = signal<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  readonly aiTargetCourse = signal<string>('Sistemas Operativos y Linux');
  readonly aiGenerating = signal<boolean>(false);
  readonly aiGeneratedQuestions = signal<QuizQuestion[]>([]);

  readonly sendingDigest = signal(false);
  readonly sendingStreak = signal(false);
  readonly actionNotification = signal('');

  private studentsUpdateListener = () => {
    this.loadAllData();
  };

  ngOnInit() {
    this.loadAllData();

    if (typeof window !== 'undefined') {
      window.addEventListener('teacher:students-updated', this.studentsUpdateListener);
      window.addEventListener('storage', this.studentsUpdateListener);
    }

    // Sincronización reactiva con queryParams de la URL (navbar pills)
    this.routeSub = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'students' || tab === 'activities' || tab === 'activity' || tab === 'ai') {
        this.activeTab.set(tab);
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    if (typeof window !== 'undefined') {
      window.removeEventListener('teacher:students-updated', this.studentsUpdateListener);
      window.removeEventListener('storage', this.studentsUpdateListener);
    }
  }

  triggerProgressDigest() {
    this.sendingDigest.set(true);
    this.teacherSvc.sendProgressDigest().subscribe({
      next: res => {
        this.sendingDigest.set(false);
        this.actionNotification.set(res.message);
        setTimeout(() => this.actionNotification.set(''), 6000);
      },
      error: () => this.sendingDigest.set(false),
    });
  }

  triggerStreakReminder() {
    this.sendingStreak.set(true);
    this.teacherSvc.sendStreakReminder().subscribe({
      next: res => {
        this.sendingStreak.set(false);
        this.actionNotification.set(res.message);
        setTimeout(() => this.actionNotification.set(''), 6000);
      },
      error: () => this.sendingStreak.set(false),
    });
  }

  setTab(tab: 'students' | 'activities' | 'activity' | 'ai') {
    this.activeTab.set(tab);
  }

  loadAllData() {
    this.loading.set(true);

    this.teacherSvc.getOverview().subscribe({
      next: data => this.overview.set(data),
    });

    this.teacherSvc.getStudents().subscribe({
      next: data => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.teacherSvc.getActivities().subscribe({
      next: acts => this.activities.set(acts),
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  readonly filteredStudents = computed(() => {
    let list = this.students();
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();

    if (query) {
      list = list.filter(
        s => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
      );
    }

    if (filter === 'verified') {
      list = list.filter(s => s.email_verified);
    } else if (filter === 'unverified') {
      list = list.filter(s => !s.email_verified);
    }

    return list;
  });

  readonly filteredActivities = computed(() => {
    let list = this.activities();
    const type = this.activityTypeFilter();
    if (type !== 'all') {
      list = list.filter(a => a.type === type);
    }
    return list;
  });

  readonly totalStudentsCount = computed(() => {
    return this.students().length;
  });

  readonly totalLessonsCompleted = computed(() => {
    return this.students().reduce((acc, s) => acc + (s.completed_lessons_count || 0), 0);
  });

  readonly averageQuizScore = computed(() => {
    const scored = this.students().filter(s => s.average_quiz_score !== null && s.average_quiz_score > 0);
    if (scored.length > 0) {
      const avg = scored.reduce((acc, s) => acc + (s.average_quiz_score || 0), 0) / scored.length;
      return Math.round(avg * 10) / 10;
    }
    return 0;
  });

  readonly studentsAtRisk = computed(() => {
    const list = this.students();
    return list.filter(s => {
      const lowQuizzes = s.quizzes_taken_count > 0 && (s.average_quiz_score ?? 100) < 70;
      const noProgress = s.completed_lessons_count === 0 && s.enrollments_count > 0;
      const unverified = !s.email_verified;
      return lowQuizzes || noProgress || unverified;
    }).slice(0, 5);
  });

  viewStudentDossier(id: number) {
    this.teacherSvc.getStudentDetail(id).subscribe({
      next: detail => this.selectedStudentDetail.set(detail),
    });
  }

  verifyStudentAccount(st: TeacherStudent) {
    if (!confirm(`¿Deseas verificar manualmente la cuenta de ${st.name}?`)) return;

    this.teacherSvc.updateStudent(st.id, { verify_email: true }).subscribe({
      next: () => {
        st.email_verified = true;
        this.students.update(all => [...all]);
      },
    });
  }

  deleteStudentAccount(st: TeacherStudent) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al estudiante "${st.name}" (${st.email}) y todo su progreso? Esta acción no se puede deshacer.`)) return;

    this.teacherSvc.deleteStudent(st.id).subscribe({
      next: () => {
        this.students.update(all => all.filter(item => item.id !== st.id && item.email?.toLowerCase().trim() !== st.email?.toLowerCase().trim()));
        this.overview.update(ov => {
          if (!ov) return null;
          return {
            ...ov,
            stats: {
              ...ov.stats,
              total_students: Math.max(0, this.students().length),
            },
          };
        });
        this.actionNotification.set(`Estudiante "${st.name}" eliminado de la cátedra.`);
        setTimeout(() => this.actionNotification.set(''), 4000);
      },
    });
  }

  openCreateModal(type: 'challenge' | 'quiz') {
    this.modalType.set(type);
    this.newActivityTitle.set('');
    this.newActivityDescription.set('');
    this.newActivityStarterCode.set('');
    this.newActivityExpectedOutput.set('');
    this.newActivityXp.set(type === 'quiz' ? 100 : 150);
    this.quizQuestionsList.set([
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: '',
      },
    ]);
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  addQuestionToDraft() {
    this.quizQuestionsList.update(qList => [
      ...qList,
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: '',
      },
    ]);
  }

  removeQuestionFromDraft(index: number) {
    this.quizQuestionsList.update(qList => qList.filter((_, i) => i !== index));
  }

  saveNewActivity() {
    const isQuiz = this.modalType() === 'quiz';
    const author = this.auth.user()?.name || 'Prof. Andrés';

    this.teacherSvc
      .createActivity({
        title: this.newActivityTitle().trim(),
        description: this.newActivityDescription().trim(),
        type: isQuiz ? 'quiz' : 'challenge',
        course_name: this.newActivityCourse(),
        difficulty: this.newActivityDifficulty(),
        xp_reward: Number(this.newActivityXp()) || 100,
        author_name: author,
        starter_code: isQuiz ? undefined : this.newActivityStarterCode(),
        expected_output: isQuiz ? undefined : this.newActivityExpectedOutput(),
        quiz_questions: isQuiz ? this.quizQuestionsList() : undefined,
      })
      .subscribe({
        next: newAct => {
          this.activities.update(all => [newAct, ...all]);
          this.closeCreateModal();
          this.activeTab.set('activities');
        },
      });
  }

  deleteActivity(id: string) {
    if (!confirm('¿Deseas eliminar esta actividad del catálogo de cátedra?')) return;
    this.teacherSvc.deleteActivity(id).subscribe({
      next: () => {
        this.activities.update(all => all.filter(a => a.id !== id));
      },
    });
  }

  generateQuizWithAi() {
    const topic = this.aiTopic().trim();
    if (!topic) return;

    this.aiGenerating.set(true);
    this.teacherSvc.generateAiQuiz(topic, this.aiDifficulty()).subscribe({
      next: questions => {
        this.aiGeneratedQuestions.set(questions);
        this.aiGenerating.set(false);
      },
      error: () => this.aiGenerating.set(false),
    });
  }

  saveAiQuizToActivities() {
    const questions = this.aiGeneratedQuestions();
    if (questions.length === 0) return;

    const topic = this.aiTopic().trim();
    const author = this.auth.user()?.name || 'Prof. Andrés';

    this.teacherSvc
      .createActivity({
        title: `Evaluación Evaluativa: ${topic}`,
        description: `Quiz de evaluación estructurado por Byte IA sobre conceptos críticos de ${topic}.`,
        type: 'quiz',
        course_name: this.aiTargetCourse(),
        difficulty: this.aiDifficulty(),
        xp_reward: 120,
        author_name: `${author} (Asistido por Byte IA)`,
        quiz_questions: questions,
      })
      .subscribe({
        next: newAct => {
          this.activities.update(all => [newAct, ...all]);
          this.activeTab.set('activities');
        },
      });
  }

  getInitials(name: string): string {
    return (
      name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST'
    );
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }

  timeAgo(dateStr: string | null | undefined): string {
    if (!dateStr) return 'Sin actividad';
    const now = Date.now();
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 'Sin actividad';
    const diffSec = Math.floor((now - time) / 1000);
    if (diffSec < 60) return 'Hace unos segundos';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return this.formatDate(dateStr);
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'optimal': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'critical': return 'badge-danger';
      default: return 'badge-subtle';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'optimal': return 'Al Día';
      case 'warning': return 'En Observación';
      case 'critical': return 'En Riesgo';
      default: return 'Activo';
    }
  }

  getCourseDemandPercent(enrollmentsCount: number): number {
    const total = this.totalStudentsCount();
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((enrollmentsCount / total) * 100));
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'code_challenge': return 'Reto de Código';
      case 'quiz': return 'Quiz Evaluativo';
      case 'article': return 'Lectura Técnica';
      case 'video': return 'Video Interactivo';
      default: return type ? type.toUpperCase() : 'Lección';
    }
  }

  getLessonTypeBadgeClass(type: string): string {
    switch (type) {
      case 'code_challenge': return 'badge-challenge';
      case 'quiz': return 'badge-quiz';
      case 'article': return 'badge-neutral';
      default: return 'badge-subtle';
    }
  }

  contactStudent(email: string) {
    if (typeof window !== 'undefined') {
      window.location.href = `mailto:${email}?subject=Seguimiento Académico - SysEng Academy`;
    }
  }
}
