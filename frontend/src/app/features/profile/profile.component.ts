import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { Enrollment } from '../../core/models';

@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  template: `
    <div class="profile-page">
      <div class="container">
        <!-- Header -->
        <div class="profile-header">
          <div class="profile-avatar">{{ initials() }}</div>
          <div>
            <h1>{{ auth.user()?.name }}</h1>
            <p>{{ auth.user()?.email }}</p>
            <span [class]="'badge badge-primary'">{{ roleLabel() }}</span>
          </div>
        </div>

        <!-- Stats -->
        <div class="profile-stats">
          <div class="stat-card">
            <span class="stat-num">{{ enrollments().length }}</span>
            <span class="stat-lbl">Cursos Inscritos</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ completedCount() }}</span>
            <span class="stat-lbl">Completados</span>
          </div>
          <div class="stat-card">
            <span class="stat-num">{{ avgProgress() }}%</span>
            <span class="stat-lbl">Progreso Promedio</span>
          </div>
        </div>

        <!-- Enrolled Courses -->
        <div class="profile-section">
          <h2>Mis Cursos</h2>
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
              <p>Explora el catálogo y empieza tu primera ruta de aprendizaje.</p>
              <a routerLink="/cursos" class="btn btn-primary">Explorar Cursos</a>
            </div>
          } @else {
            <div class="grid-3">
              @for (enr of enrollments(); track enr.id) {
                <div class="enrolled-card">
                  <div class="enrolled-card__top" [style.background]="enr.course?.category?.color + '22'">
                    <span class="enrolled-emoji">{{ emoji(enr) }}</span>
                    @if (enr.completed_at) {
                      <span class="badge badge-success">Completado</span>
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
                      {{ enr.progress_percent > 0 ? 'Continuar' : 'Empezar' }}
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
    .profile-page { padding: var(--sp-10) 0 var(--sp-16); }

    .profile-header {
      display: flex;
      align-items: center;
      gap: var(--sp-6);
      padding-bottom: var(--sp-8);
      border-bottom: 1px solid var(--border);
      margin-bottom: var(--sp-8);

      h1 { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); }
      p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--sp-2); }
    }

    .profile-avatar {
      width: 72px; height: 72px;
      background: var(--primary);
      color: #fff;
      border-radius: var(--radius-lg);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--text-2xl); font-weight: var(--font-bold);
      flex-shrink: 0;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-5);
      margin-bottom: var(--sp-10);
      @media (max-width: 640px) { grid-template-columns: 1fr; }
    }

    .stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      text-align: center;
    }
    .stat-num { display: block; font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--text-primary); font-family: var(--font-mono); }
    .stat-lbl { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--sp-1); display: block; }

    .profile-section { h2 { font-size: var(--text-xl); font-weight: var(--font-semibold); color: var(--text-primary); margin-bottom: var(--sp-6); } }

    .enrolled-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: border-color var(--transition-base);
      &:hover { border-color: var(--primary); }

      &__top { height: 80px; display: flex; align-items: center; justify-content: space-between; padding: var(--sp-4); }
      .enrolled-emoji { font-size: 2rem; }

      &__body { padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-3);
        h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); line-height: 1.3; }
      }

      &__progress .progress-label { display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-muted); margin-bottom: var(--sp-2); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  auth          = inject(AuthService);
  private coursesSvc = inject(CoursesService);

  enrollments = signal<Enrollment[]>([]);
  loading     = signal(true);

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });
  }

  initials(): string {
    return (this.auth.user()?.name ?? '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  roleLabel(): string {
    const roles: Record<string, string> = {
      student: 'Estudiante',
      instructor: 'Instructor',
      admin: 'Administrador',
    };
    return roles[this.auth.user()?.role ?? ''] ?? '';
  }

  completedCount(): number {
    return this.enrollments().filter(e => e.completed_at !== null).length;
  }

  avgProgress(): number {
    const enrs = this.enrollments();
    if (!enrs.length) return 0;
    return Math.round(enrs.reduce((sum, e) => sum + e.progress_percent, 0) / enrs.length);
  }

  emoji(enr: Enrollment): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡', 'algoritmos': '⚡', 'poo': '🧩',
      'bases-de-datos': '🗄️', 'redes': '🌐', 'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳', 'desarrollo-web': '🕸️',
    };
    return map[enr.course?.category?.slug ?? ''] ?? '📚';
  }
}
