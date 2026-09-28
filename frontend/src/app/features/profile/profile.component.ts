import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { Enrollment } from '../../core/models';

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'challenges' | 'courses' | 'special';
  icon: string;
  description: string;
  requirement: string;
  targetCount: number;
  currentCount: number;
  progressPercent: number;
  unlocked: boolean;
  level: 'bronze' | 'silver' | 'gold' | 'diamond';
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-page">
      <div class="container">
        <!-- Header -->
        <div class="profile-header">
          <div class="profile-avatar">{{ initials() }}</div>
          <div class="profile-header-info">
            <h1>{{ auth.user()?.name }}</h1>
            <p>{{ auth.user()?.email }}</p>
            <div class="profile-badges-row">
              <span class="badge badge-primary">{{ roleLabel() }}</span>
              <span class="badge badge-rank">Nivel {{ userLevel() }}: {{ rankTitle() }}</span>
            </div>
          </div>
        </div>

        <!-- Stats Overview -->
        <div class="profile-stats">
          <div class="stat-card">
            <span class="stat-num">{{ enrollments().length }}</span>
            <span class="stat-lbl">Cursos Inscritos</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ completedCount() }}</span>
            <span class="stat-lbl">Cursos Completados</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ solvedChallengesCount() }}</span>
            <span class="stat-lbl">Retos de Código Resueltos</span>
          </div>
          <div class="stat-card stat-card--highlight">
            <span class="stat-num">{{ unlockedBadgesCount() }}/{{ badges().length }}</span>
            <span class="stat-lbl">Insignias y Logros</span>
          </div>
        </div>

        <!-- ========================================================
             ACHIEVEMENTS & BADGES (INSIGNIAS Y LOGROS)
             ======================================================== -->
        <section class="profile-section achievements-section" aria-label="Insignias y Logros">
          <div class="section-title-row">
            <div>
              <h2 class="section-title">🏆 Insignias y Logros Técnicos</h2>
              <p class="section-subtitle">
                Recompensas obtenidas al resolver problemas algorítmicos en la terminal y finalizar cursos.
              </p>
            </div>
            <div class="badges-summary-capsule">
              <span class="capsule-num">{{ unlockedBadgesCount() }} de {{ badges().length }}</span>
              <span class="capsule-lbl">Desbloqueadas</span>
            </div>
          </div>

          <!-- Filter Navigation Tabs -->
          <div class="badge-filter-bar">
            <button
              type="button"
              class="badge-filter-btn"
              [class.is-active]="selectedFilter() === 'all'"
              (click)="selectedFilter.set('all')"
            >
              Todas ({{ badges().length }})
            </button>
            <button
              type="button"
              class="badge-filter-btn"
              [class.is-active]="selectedFilter() === 'unlocked'"
              (click)="selectedFilter.set('unlocked')"
            >
              ✓ Desbloqueadas ({{ unlockedBadgesCount() }})
            </button>
            <button
              type="button"
              class="badge-filter-btn"
              [class.is-active]="selectedFilter() === 'challenges'"
              (click)="selectedFilter.set('challenges')"
            >
              💻 Retos de Código
            </button>
            <button
              type="button"
              class="badge-filter-btn"
              [class.is-active]="selectedFilter() === 'courses'"
              (click)="selectedFilter.set('courses')"
            >
              🎓 Cursos y Rutas
            </button>
          </div>

          <!-- Badges Grid -->
          <div class="badges-grid">
            @for (badge of filteredBadges(); track badge.id) {
              <div
                class="badge-card"
                [class.is-unlocked]="badge.unlocked"
                [class.is-locked]="!badge.unlocked"
                [attr.data-level]="badge.level"
              >
                <div class="badge-card__icon-wrap">
                  <span class="badge-card__icon">{{ badge.icon }}</span>
                  @if (badge.unlocked) {
                    <span class="badge-glow-ring"></span>
                  }
                </div>

                <div class="badge-card__content">
                  <div class="badge-card__header">
                    <span class="badge-level-pill level-{{ badge.level }}">
                      {{ badge.level.toUpperCase() }}
                    </span>
                    @if (badge.unlocked) {
                      <span class="badge-status-tag tag-unlocked">✓ Conseguida</span>
                    } @else {
                      <span class="badge-status-tag tag-locked">🔒 En progreso</span>
                    }
                  </div>

                  <h3 class="badge-card__title">{{ badge.title }}</h3>
                  <p class="badge-card__desc">{{ badge.description }}</p>

                  <!-- Progress Indicator -->
                  <div class="badge-progress-wrap">
                    <div class="badge-progress-header">
                      <span class="prog-req">{{ badge.requirement }}</span>
                      <span class="prog-stat">{{ badge.currentCount }}/{{ badge.targetCount }}</span>
                    </div>
                    <div class="badge-progress-track">
                      <div class="badge-progress-bar" [style.width.%]="badge.progressPercent"></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Enrolled Courses Section -->
        <div class="profile-section">
          <h2>Mis Cursos Inscritos</h2>
          @if (loading()) {
            <div class="grid-3">
              @for (i of [1,2,3]; track i) {
                <div class="skeleton" style="height:160px; border-radius: var(--radius-lg);"></div>
              }
            </div>
          } @else if (enrollments().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">📚</div>
              <h3>Sin cursos inscritos</h3>
              <p>Explora el catálogo y empieza tu primera ruta de aprendizaje para comenzar a ganar insignias.</p>
              <a routerLink="/cursos" class="btn btn-primary">Explorar Cursos</a>
            </div>
          } @else {
            <div class="grid-3">
              @for (enr of enrollments(); track enr.id) {
                <div class="enrolled-card">
                  <div class="enrolled-card__top" [style.background]="enr.course?.category?.color + '22'">
                    <span class="enrolled-emoji">{{ emoji(enr) }}</span>
                    @if (enr.completed_at) {
                      <span class="badge badge-success">✓ Completado</span>
                    }
                  </div>
                  <div class="enrolled-card__body">
                    <h3>{{ enr.course?.title }}</h3>
                    <div class="enrolled-card__progress">
                      <div class="progress-label">
                        <span>Progreso</span>
                        <span>{{ enr.progress_percent }}%</span>
                      </div>
                      <div class="progress">
                        <div class="progress__fill" [style.width]="enr.progress_percent + '%'"></div>
                      </div>
                    </div>
                    <a [routerLink]="['/cursos', enr.course?.slug]" class="btn btn-outline btn-sm" style="width:100%;">
                      {{ enr.progress_percent > 0 ? 'Continuar Lección' : 'Empezar Curso' }}
                    </a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--sp-10) 0 var(--sp-16);
      min-height: calc(100vh - 72px);
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--sp-6);
      padding-bottom: var(--sp-8);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-8);

      h1 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin: 0 0 var(--sp-1) 0;
      }

      p {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-bottom: var(--sp-3);
      }
    }

    .profile-badges-row {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      flex-wrap: wrap;
    }

    .badge-rank {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .profile-avatar {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #08090D;
      border-radius: var(--radius-xl);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-2xl);
      font-weight: var(--font-bold);
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(10, 233, 138, 0.25);
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--sp-4);
      margin-bottom: var(--sp-10);

      @media (max-width: 900px) {
        grid-template-columns: repeat(2, 1fr);
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      text-align: center;
      transition: all var(--transition-fast);

      &:hover {
        border-color: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      &--highlight {
        border-color: rgba(168, 85, 247, 0.4);
        background: linear-gradient(180deg, rgba(168, 85, 247, 0.08) 0%, var(--bg-surface) 100%);
      }
    }

    .stat-num {
      display: block;
      font-size: var(--text-3xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      font-family: var(--font-mono);
    }

    .stat-lbl {
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--sp-1);
      display: block;
      font-weight: 500;
    }

    /* ========================================================
       ACHIEVEMENTS & BADGES STYLES
       ======================================================== */
    .achievements-section {
      background: #11141c;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-xl);
      padding: var(--sp-8);
      margin-bottom: var(--sp-10);
    }

    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      margin-bottom: var(--sp-6);
      flex-wrap: wrap;
    }

    .section-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin: 0 0 var(--sp-1) 0;
    }

    .section-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
    }

    .badges-summary-capsule {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      background: rgba(168, 85, 247, 0.12);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: var(--radius-lg);
      padding: 0.45rem 1rem;
    }

    .capsule-num {
      font-size: var(--text-base);
      font-weight: 700;
      color: #c084fc;
      font-family: var(--font-mono);
    }

    .capsule-lbl {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* Filter Bar */
    .badge-filter-bar {
      display: flex;
      gap: var(--sp-2);
      overflow-x: auto;
      padding-bottom: var(--sp-3);
      margin-bottom: var(--sp-6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .badge-filter-btn {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid transparent;
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
      }

      &.is-active {
        background: rgba(10, 233, 138, 0.12);
        color: var(--primary);
        border-color: rgba(10, 233, 138, 0.3);
      }
    }

    /* Badges Grid */
    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: var(--sp-4);
    }

    .badge-card {
      display: flex;
      gap: var(--sp-4);
      background: #171b26;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      position: relative;
      overflow: hidden;
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-2px);
      }

      &.is-unlocked {
        background: linear-gradient(145deg, #182030 0%, #131722 100%);
        border-color: rgba(10, 233, 138, 0.3);

        &[data-level='gold'] {
          border-color: rgba(245, 158, 11, 0.4);
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
        }

        &[data-level='diamond'] {
          border-color: rgba(56, 189, 248, 0.5);
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);
        }
      }

      &.is-locked {
        opacity: 0.65;
        filter: grayscale(0.5);

        &:hover {
          opacity: 0.85;
          filter: grayscale(0.2);
        }
      }
    }

    .badge-card__icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #202636;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
      position: relative;
    }

    .badge-glow-ring {
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 2px solid var(--primary);
      opacity: 0.6;
      animation: pulseGlow 2s infinite alternate;
    }

    .badge-card__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .badge-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-1);
    }

    .badge-level-pill {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;

      &.level-bronze { background: rgba(205, 127, 50, 0.2); color: #f59e0b; }
      &.level-silver { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }
      &.level-gold { background: rgba(245, 158, 11, 0.25); color: #fbbf24; }
      &.level-diamond { background: rgba(56, 189, 248, 0.25); color: #38bdf8; }
    }

    .badge-status-tag {
      font-size: 0.65rem;
      font-weight: 600;

      &.tag-unlocked { color: #10b981; }
      &.tag-locked { color: #94a3b8; }
    }

    .badge-card__title {
      font-size: var(--text-sm);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin: 0 0 var(--sp-1) 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge-card__desc {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin: 0 0 var(--sp-3) 0;
      line-height: 1.35;
    }

    .badge-progress-wrap {
      margin-top: auto;
    }

    .badge-progress-header {
      display: flex;
      justify-content: space-between;
      font-size: 0.68rem;
      color: var(--text-muted);
      margin-bottom: 0.25rem;
    }

    .badge-progress-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 9999px;
      overflow: hidden;
    }

    .badge-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      border-radius: 9999px;
      transition: width 0.3s ease;
    }

    /* Enrolled Courses */
    .enrolled-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: border-color var(--transition-base);

      &:hover {
        border-color: var(--primary);
      }

      &__top {
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--sp-4);
      }

      .enrolled-emoji {
        font-size: 2rem;
      }

      &__body {
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);

        h3 {
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          line-height: 1.3;
        }
      }

      &__progress .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-bottom: var(--sp-2);
      }
    }

    @keyframes pulseGlow {
      from { transform: scale(0.96); opacity: 0.4; }
      to { transform: scale(1.04); opacity: 0.8; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private coursesSvc = inject(CoursesService);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);
  selectedFilter = signal<'all' | 'unlocked' | 'challenges' | 'courses'>('all');

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });
  }

  initials(): string {
    return (this.auth.user()?.name ?? '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'SA';
  }

  roleLabel(): string {
    const roles: Record<string, string> = {
      student: 'Estudiante',
      instructor: 'Docente / Instructor',
      admin: 'Administrador',
    };
    return roles[this.auth.user()?.role ?? ''] ?? 'Estudiante';
  }

  completedCount(): number {
    return this.enrollments().filter(e => e.completed_at !== null).length;
  }

  avgProgress(): number {
    const enrs = this.enrollments();
    if (!enrs.length) return 0;
    return Math.round(enrs.reduce((sum, e) => sum + e.progress_percent, 0) / enrs.length);
  }

  readonly solvedChallengesCount = computed(() => {
    let count = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('syseng_solved_challenges') || '[]');
        if (Array.isArray(stored)) count += stored.length;
      } catch {}
    }
    // Also reward progress from enrolled courses
    const fromCourses = this.completedCount() * 2;
    return Math.max(count, fromCourses, 1); // at least 1 starter practice milestone
  });

  readonly userLevel = computed(() => {
    const pts = (this.solvedChallengesCount() * 50) + (this.completedCount() * 150);
    return Math.max(1, Math.floor(pts / 100) + 1);
  });

  readonly rankTitle = computed(() => {
    const lvl = this.userLevel();
    if (lvl >= 10) return 'Arquitecto Principal';
    if (lvl >= 7) return 'Ingeniero de Software Senior';
    if (lvl >= 4) return 'Desarrollador FullStack';
    if (lvl >= 2) return 'Explorador Algorítmico';
    return 'Cadete de Sistemas';
  });

  readonly badges = computed<AchievementBadge[]>(() => {
    const solved = this.solvedChallengesCount();
    const completedCourses = this.completedCount();
    const enrolled = this.enrollments().length;
    const avgProg = this.avgProgress();

    const catalog: AchievementBadge[] = [
      {
        id: 'challenge_1',
        title: 'Primer Algoritmo CLI',
        category: 'challenges',
        icon: '🥉',
        description: 'Compilaste y validaste tu primer reto de código con éxito.',
        requirement: 'Resuelve 1 reto interactivo',
        targetCount: 1,
        currentCount: Math.min(solved, 1),
        progressPercent: Math.min(100, (solved / 1) * 100),
        unlocked: solved >= 1,
        level: 'bronze',
      },
      {
        id: 'challenge_3',
        title: 'Pensamiento Computacional',
        category: 'challenges',
        icon: '🥈',
        description: 'Superaste 3 retos interactivos verificados por casos de prueba.',
        requirement: 'Resuelve 3 retos de código',
        targetCount: 3,
        currentCount: Math.min(solved, 3),
        progressPercent: Math.min(100, Math.round((solved / 3) * 100)),
        unlocked: solved >= 3,
        level: 'silver',
      },
      {
        id: 'challenge_5',
        title: 'Maestro de Estructuras (Stack & Queues)',
        category: 'challenges',
        icon: '🥇',
        description: 'Dominaste los retos de balanceo de paréntesis y estructuras fundamentales.',
        requirement: 'Resuelve 5 retos de código',
        targetCount: 5,
        currentCount: Math.min(solved, 5),
        progressPercent: Math.min(100, Math.round((solved / 5) * 100)),
        unlocked: solved >= 5,
        level: 'gold',
      },
      {
        id: 'challenge_10',
        title: 'Hacker de Sistemas',
        category: 'challenges',
        icon: '🏆',
        description: 'Completaste 10 retos técnicos avanzados sin errores de ejecución.',
        requirement: 'Resuelve 10 retos de código',
        targetCount: 10,
        currentCount: Math.min(solved, 10),
        progressPercent: Math.min(100, Math.round((solved / 10) * 100)),
        unlocked: solved >= 10,
        level: 'gold',
      },
      {
        id: 'challenge_20',
        title: 'Ingeniero de Software Senior',
        category: 'challenges',
        icon: '💎',
        description: 'Resolviste 20 retos de código en múltiples lenguajes de programación.',
        requirement: 'Resuelve 20 retos de código',
        targetCount: 20,
        currentCount: Math.min(solved, 20),
        progressPercent: Math.min(100, Math.round((solved / 20) * 100)),
        unlocked: solved >= 20,
        level: 'diamond',
      },
      {
        id: 'course_start',
        title: 'Iniciación SysEng',
        category: 'courses',
        icon: '🚀',
        description: 'Te inscribiste a tu primer curso oficial en la academia.',
        requirement: 'Inscríbete en 1 curso',
        targetCount: 1,
        currentCount: Math.min(enrolled, 1),
        progressPercent: Math.min(100, (enrolled / 1) * 100),
        unlocked: enrolled >= 1,
        level: 'bronze',
      },
      {
        id: 'course_grad_1',
        title: 'Graduado de Curso',
        category: 'courses',
        icon: '🎓',
        description: 'Completaste el 100% de los módulos y lecciones de un curso.',
        requirement: 'Completa 1 curso técnico',
        targetCount: 1,
        currentCount: Math.min(completedCourses, 1),
        progressPercent: Math.min(100, (completedCourses / 1) * 100),
        unlocked: completedCourses >= 1,
        level: 'silver',
      },
      {
        id: 'courses_3',
        title: 'Arquitecto de Software',
        category: 'courses',
        icon: '🛡️',
        description: 'Completaste 3 cursos completos de ingeniería y buenas prácticas.',
        requirement: 'Completa 3 cursos técnicos',
        targetCount: 3,
        currentCount: Math.min(completedCourses, 3),
        progressPercent: Math.min(100, Math.round((completedCourses / 3) * 100)),
        unlocked: completedCourses >= 3,
        level: 'gold',
      },
      {
        id: 'high_progress',
        title: 'Dedicación y Disciplina',
        category: 'courses',
        icon: '⚡',
        description: 'Mantuviste un progreso promedio superior al 70% en tus cursos.',
        requirement: 'Progreso promedio >= 70%',
        targetCount: 70,
        currentCount: Math.min(avgProg, 70),
        progressPercent: Math.min(100, Math.round((avgProg / 70) * 100)),
        unlocked: avgProg >= 70,
        level: 'gold',
      },
      {
        id: 'copilot_partner',
        title: 'Sinergia con Byte IA',
        category: 'special',
        icon: '🤖',
        description: 'Utilizaste el copiloto de IA interactivo para razonar tu lógica.',
        requirement: 'Consulta al copiloto en un reto',
        targetCount: 1,
        currentCount: 1,
        progressPercent: 100,
        unlocked: true,
        level: 'silver',
      },
      {
        id: 'terminal_master',
        title: 'Terminal Linux Sandbox',
        category: 'special',
        icon: '🐧',
        description: 'Ejecutaste código directamente en el entorno aislado de Linux.',
        requirement: 'Usa la terminal de Linux',
        targetCount: 1,
        currentCount: 1,
        progressPercent: 100,
        unlocked: true,
        level: 'bronze',
      },
    ];

    return catalog;
  });

  readonly unlockedBadgesCount = computed(() => {
    return this.badges().filter(b => b.unlocked).length;
  });

  readonly filteredBadges = computed(() => {
    const filter = this.selectedFilter();
    const all = this.badges();

    if (filter === 'unlocked') {
      return all.filter(b => b.unlocked);
    }
    if (filter === 'challenges') {
      return all.filter(b => b.category === 'challenges');
    }
    if (filter === 'courses') {
      return all.filter(b => b.category === 'courses');
    }
    return all;
  });

  emoji(enr: Enrollment): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡',
      algoritmos: '⚡',
      poo: '🧩',
      'bases-de-datos': '🗄️',
      redes: '🌐',
      'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳',
      'desarrollo-web': '🕸️',
    };
    return map[enr.course?.category?.slug ?? ''] ?? '📚';
  }
}
