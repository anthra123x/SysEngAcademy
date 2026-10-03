import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, isModuleFullyCompleted, isModuleUnlockedForStudent, formatRatingCount } from '../../../core/services/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course, CourseModule, Lesson, CourseReview, CourseRatingStats } from '../../../core/models';
import { CourseForumComponent } from '../course-forum/course-forum.component';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, FormsModule, DecimalPipe, DatePipe, SlicePipe, CourseForumComponent, AppIconComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss',
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  private coursesSvc = inject(CoursesService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  auth               = inject(AuthService);

  course        = signal<Course | null>(null);
  loading       = signal(true);
  enrolling     = signal(false);
  openModules   = signal<Set<number>>(new Set());
  activeTab     = signal<'curriculum' | 'forum' | 'reviews'>('curriculum');
  forumModuleId = signal<number | undefined>(undefined);
  showAuthModal = signal(false);
  readonly lockedToast = signal<string | null>(null);

  // Sistema de Calificaciones y Reseñas
  reviews            = signal<CourseReview[]>([]);
  reviewsStats       = signal<CourseRatingStats | null>(null);
  userReview         = signal<CourseReview | null>(null);
  loadingReviews     = signal(false);
  submittingRating   = signal(false);
  selectedRating     = signal<number>(5);
  hoveredRating      = signal<number>(0);
  reviewComment      = signal<string>('');
  ratingFeedbackMsg  = signal<string | null>(null);
  ratingFeedbackType = signal<'success' | 'error' | null>(null);
  readonly formatRatingCount = formatRatingCount;

  private readonly progressListener = () => {
    this.verifyProgressRealtime();
  };

  allExpanded = computed(() => {
    const c = this.course();
    if (!c?.modules || c.modules.length === 0) return false;
    const open = this.openModules();
    return c.modules.every(m => open.has(m.id));
  });

  totalChallenges = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.type === 'code_challenge') count++;
      }
    }
    return count;
  });

  totalQuizzes = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.type === 'quiz') count++;
      }
    }
    return count;
  });

  totalLessonsCount = computed(() => {
    const c = this.course();
    if (!c) return 0;
    if (c.lessons_count && c.lessons_count > 0) return c.lessons_count;
    let count = 0;
    for (const mod of c.modules ?? []) {
      count += (mod.lessons ?? []).length;
    }
    return count;
  });

  completedLessonsCount = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.completed) count++;
      }
    }
    return count;
  });

  courseProgressPercent = computed(() => {
    const c = this.course();
    if (!c) return 0;
    const total = this.totalLessonsCount();
    if (total === 0) return 0;
    const completed = this.completedLessonsCount();
    return Math.min(100, Math.round((completed / total) * 100));
  });

  firstLessonSlug = computed(() => {
    const c = this.course();
    return c?.modules?.[0]?.lessons?.[0]?.slug ?? null;
  });

  continueLessonSlug = computed(() => {
    const c = this.course();
    if (!c?.modules) return null;
    for (const mod of c.modules) {
      for (const lesson of mod.lessons ?? []) {
        if (!lesson.completed) {
          return lesson.slug;
        }
      }
    }
    return c.modules[0]?.lessons?.[0]?.slug ?? null;
  });

  courseSkills = computed(() => {
    const c = this.course();
    if (!c?.modules) return [];
    const skills: string[] = [];
    for (const mod of c.modules) {
      const clean = mod.title.replace(/^Módulo\s+\d+[:\s\-]*/i, '').trim();
      if (clean && !skills.includes(clean)) {
        skills.push(clean);
      }
    }
    return skills.slice(0, 6);
  });

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.addEventListener('lesson-completed-updated', this.progressListener);
      window.addEventListener('storage', this.progressListener);
      window.addEventListener('focus', this.progressListener);
      window.addEventListener('teacher:students-updated', this.progressListener);
    }

    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading.set(true);
        this.loadReviews(slug);
        this.coursesSvc.getBySlug(slug).subscribe({
          next: (c) => {
            this.course.set(c);
            if (c?.user_review) {
              this.userReview.set(c.user_review);
              this.selectedRating.set(c.user_review.rating);
              this.reviewComment.set(c.user_review.comment || '');
            }
            this.loading.set(false);
            // Abrir todos los módulos por defecto para que el estudiante vea todo el temario y lecciones inmediatamente
            if (c?.modules && c.modules.length > 0) {
              this.openModules.set(new Set<number>(c.modules.map(m => Number(m.id))));
            }
          },
          error: () => {
            this.course.set(null);
            this.loading.set(false);
          },
        });
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'forum') {
        this.activeTab.set('forum');
      } else if (tab === 'curriculum') {
        this.activeTab.set('curriculum');
      } else if (tab === 'reviews') {
        this.activeTab.set('reviews');
      }
      const modId = params.get('moduleId');
      if (modId) {
        this.forumModuleId.set(Number(modId));
        this.activeTab.set('forum');
      }
    });
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('lesson-completed-updated', this.progressListener);
      window.removeEventListener('storage', this.progressListener);
      window.removeEventListener('focus', this.progressListener);
      window.removeEventListener('teacher:students-updated', this.progressListener);
    }
  }

  verifyProgressRealtime() {
    const current = this.course();
    if (!current) return;

    // 1. Re-enriquecer inmediatamente con el estado local de lecciones para respuesta instantánea (0ms)
    const enriched = this.coursesSvc.enrichCourseWithCompletions(current);
    this.course.set(enriched);

    // 2. Si el usuario está autenticado, sincronizar con el backend en segundo plano
    if (this.auth.isAuthenticated() && current.slug) {
      this.coursesSvc.getBySlug(current.slug).subscribe({
        next: (fresh) => {
          if (fresh) {
            this.course.set(fresh);
          }
        },
      });
    }
  }

  setTab(tab: 'curriculum' | 'forum' | 'reviews') {
    this.activeTab.set(tab);
    if (tab === 'reviews' && this.course()?.slug && this.reviews().length === 0) {
      this.loadReviews(this.course()!.slug);
    }
  }

  loadReviews(slug: string) {
    this.loadingReviews.set(true);
    this.coursesSvc.getCourseReviews(slug).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews?.data ?? []);
        this.reviewsStats.set(res.stats ?? null);
        if (res.user_review) {
          this.userReview.set(res.user_review);
          this.selectedRating.set(res.user_review.rating);
          this.reviewComment.set(res.user_review.comment || '');
        }
        this.loadingReviews.set(false);
      },
      error: () => {
        this.loadingReviews.set(false);
      }
    });
  }

  onRatingHover(stars: number) {
    this.hoveredRating.set(stars);
  }

  onRatingLeave() {
    this.hoveredRating.set(0);
  }

  setRatingScore(stars: number) {
    this.selectedRating.set(stars);
  }

  getRatingLabel(stars: number): string {
    const map: Record<number, string> = {
      1: '1 de 5 - Deficiente',
      2: '2 de 5 - Regular',
      3: '3 de 5 - Bueno',
      4: '4 de 5 - Muy Bueno',
      5: '5 de 5 - ¡Excelente contenido!',
    };
    return map[stars] ?? `${stars} de 5`;
  }

  getBreakdownPercent(stars: number): number {
    const stats = this.reviewsStats();
    if (!stats || stats.total <= 0) {
      return 0;
    }
    const count = stats.breakdown?.[stars] ?? 0;
    return Math.round((count / stats.total) * 100);
  }

  submitRating() {
    if (!this.auth.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    const slug = this.course()?.slug;
    if (!slug) return;
    const rating = this.selectedRating();
    const comment = this.reviewComment().trim();

    this.submittingRating.set(true);
    this.ratingFeedbackMsg.set(null);

    this.coursesSvc.rateCourse(slug, rating, comment).subscribe({
      next: (res) => {
        this.submittingRating.set(false);
        this.userReview.set(res.review);
        this.course.update(c => c ? { ...c, rating_avg: res.rating_avg, rating_count: res.rating_count, user_review: res.review } : c);
        this.ratingFeedbackMsg.set(res.message || '¡Tu calificación ha sido guardada exitosamente!');
        this.ratingFeedbackType.set('success');
        this.loadReviews(slug);
        setTimeout(() => this.ratingFeedbackMsg.set(null), 5000);
      },
      error: (err) => {
        this.submittingRating.set(false);
        const msg = err?.error?.message || 'Error al guardar la calificación. Por favor intenta de nuevo.';
        this.ratingFeedbackMsg.set(msg);
        this.ratingFeedbackType.set('error');
      }
    });
  }

  deleteRating() {
    const slug = this.course()?.slug;
    if (!slug) return;
    this.submittingRating.set(true);
    this.coursesSvc.deleteCourseReview(slug).subscribe({
      next: (res) => {
        this.submittingRating.set(false);
        this.userReview.set(null);
        this.reviewComment.set('');
        this.selectedRating.set(5);
        this.course.update(c => c ? { ...c, rating_avg: res.rating_avg, rating_count: res.rating_count, user_review: null } : c);
        this.ratingFeedbackMsg.set('Calificación eliminada.');
        this.ratingFeedbackType.set('success');
        this.loadReviews(slug);
        setTimeout(() => this.ratingFeedbackMsg.set(null), 4000);
      },
      error: () => {
        this.submittingRating.set(false);
      }
    });
  }

  openModuleForum(event: Event, modId: number) {
    event.stopPropagation();
    this.forumModuleId.set(modId);
    this.activeTab.set('forum');
  }

  enroll() {
    if (!this.auth.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    const id = this.course()?.id;
    if (!id) return;
    this.enrolling.set(true);
    this.coursesSvc.enroll(id).subscribe({
      next: () => {
        this.course.update(c => c ? { ...c, enrolled: true, progress_percent: 0 } : c);
        this.enrolling.set(false);
      },
      error: (err) => {
        this.enrolling.set(false);
        if (err?.status === 402) {
          this.lockedToast.set('Este curso es de nivel profesional y requiere suscripción activa o confirmación de matrícula.');
          setTimeout(() => this.lockedToast.set(null), 5500);
        } else if (err?.status === 401) {
          this.showAuthModal.set(true);
        }
      },
    });
  }

  isModuleOpen(id: number): boolean {
    return this.openModules().has(Number(id));
  }

  toggleModule(id: number) {
    const numId = Number(id);
    this.openModules.update(set => {
      const next = new Set(set);
      if (next.has(numId)) next.delete(numId); else next.add(numId);
      return next;
    });
  }

  toggleAllModules() {
    const c = this.course();
    if (!c?.modules) return;
    if (this.allExpanded()) {
      this.openModules.set(new Set());
    } else {
      this.openModules.set(new Set(c.modules.map(m => Number(m.id))));
    }
  }

  isModuleCompleted(mod: CourseModule): boolean {
    return isModuleFullyCompleted(mod);
  }

  isModuleUnlocked(idx: number): boolean {
    const modules = this.course()?.modules ?? [];
    return isModuleUnlockedForStudent(idx, modules, this.auth.isInstructor() || this.auth.isAdmin());
  }

  isModuleLocked(idx: number): boolean {
    return !this.isModuleUnlocked(idx);
  }

  completedCountInModule(mod: CourseModule): number {
    return (mod.lessons ?? []).filter(l => l.completed).length;
  }

  moduleDuration(mod: CourseModule): number {
    return (mod.lessons ?? []).reduce((acc, l) => acc + (l.duration_minutes ?? 10), 0);
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  lessonTypeBadge(type: string): string {
    return {
      code_challenge: 'Reto de Código',
      quiz: 'Quiz Evaluativo',
      article: 'Lectura Técnica',
      video: 'Video Explicativo'
    }[type] ?? 'Lectura Técnica';
  }

  goToFirstLesson() {
    if (!this.auth.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    const slug = this.continueLessonSlug();
    if (slug) {
      this.router.navigate(['/cursos', this.course()!.slug, 'leccion', slug]);
    } else {
      const firstLesson = this.course()?.modules?.[0]?.lessons?.[0];
      if (firstLesson) {
        this.router.navigate(['/cursos', this.course()!.slug, 'leccion', firstLesson.slug]);
      }
    }
  }

  onLessonClick(event: Event, lesson: Lesson, moduleIndex: number) {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.showAuthModal.set(true);
      return;
    }

    if (this.isModuleLocked(moduleIndex)) {
      event.preventDefault();
      event.stopPropagation();
      const prevIdx = moduleIndex > 0 ? moduleIndex - 1 : 0;
      const prevTitle = this.course()?.modules?.[prevIdx]?.title ? `«${this.course()!.modules![prevIdx].title}»` : `Módulo ${prevIdx + 1}`;
      this.lockedToast.set(`Módulo Bloqueado: Para acceder al Módulo ${moduleIndex + 1} («${this.course()?.modules?.[moduleIndex]?.title || ''}»), debes completar primero todas las clases del Módulo ${prevIdx + 1}: ${prevTitle}.`);
      setTimeout(() => this.lockedToast.set(null), 5500);
    }
  }
}
