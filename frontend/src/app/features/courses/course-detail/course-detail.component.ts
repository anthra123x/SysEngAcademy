import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <div class="container" style="padding: var(--sp-16) 0; text-align: center;">
        <div class="skeleton" style="height:300px; border-radius: var(--radius-lg);"></div>
      </div>
    } @else if (course()) {
      <div class="course-detail">
        <!-- Hero -->
        <div class="detail-hero" [style.background]="heroGradient()">
          <div class="container detail-hero__inner">
            <div class="detail-hero__content">
              <nav class="breadcrumb" aria-label="Migas de pan">
                <a routerLink="/">Inicio</a><span class="breadcrumb__sep">/</span>
                <a routerLink="/cursos">Cursos</a><span class="breadcrumb__sep">/</span>
                <span class="breadcrumb__current">{{ course()!.title }}</span>
              </nav>
              <div class="detail-hero__badges">
                @if (course()!.category) {
                  <span class="badge badge-primary">{{ course()!.category!.name }}</span>
                }
                <span [class]="'badge badge-' + course()!.difficulty">{{ diffLabel(course()!.difficulty) }}</span>
                @if (course()!.is_free) {
                  <span class="badge badge-success">GRATIS</span>
                }
              </div>
              <h1>{{ course()!.title }}</h1>
              <p>{{ course()!.description }}</p>
              @if (course()!.instructor) {
                <div class="instructor-chip">
                  <div class="avatar">{{ initials(course()!.instructor!.name) }}</div>
                  <span>{{ course()!.instructor!.name }}</span>
                </div>
              }
            </div>
            <!-- Enrollment Card -->
            <div class="enroll-card">
              <div class="enroll-card__stats">
                <div class="stat-item">
                  <span class="stat-num">{{ course()!.duration_hours }}h</span>
                  <span class="stat-lbl">Duración</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num">{{ course()!.lessons_count ?? 0 }}</span>
                  <span class="stat-lbl">Lecciones</span>
                </div>
                <div class="stat-item">
                  <span class="stat-num">{{ course()!.modules?.length ?? 0 }}</span>
                  <span class="stat-lbl">Módulos</span>
                </div>
              </div>

              @if (course()!.enrolled) {
                <div class="enrolled-progress">
                  <div class="progress-label">
                    <span>Tu progreso</span>
                    <span>{{ course()!.progress_percent }}%</span>
                  </div>
                  <div class="progress">
                    <div class="progress__fill" [style.width]="course()!.progress_percent + '%'"></div>
                  </div>
                </div>
                <button class="btn btn-primary" style="width:100%">Continuar Curso</button>
              } @else {
                <button class="btn btn-primary" style="width:100%;" (click)="enroll()" [disabled]="enrolling()">
                  {{ enrolling() ? 'Inscribiendo...' : (course()!.is_free ? 'Inscribirse Gratis' : 'Inscribirse') }}
                </button>
                @if (!auth.isAuthenticated()) {
                  <p class="enroll-note">
                    <a routerLink="/auth/login">Inicia sesión</a> para inscribirte
                  </p>
                }
              }
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="container detail-body">
          <div class="modules-section">
            <h2>Contenido del Curso</h2>
            @for (mod of course()!.modules ?? []; track mod.id) {
              <div class="module-card">
                <div class="module-header" (click)="toggleModule(mod.id)">
                  <div>
                    <span class="module-num">Módulo {{ $index + 1 }}</span>
                    <h3>{{ mod.title }}</h3>
                  </div>
                  <span class="module-toggle">{{ openModules().has(mod.id) ? '▲' : '▼' }}</span>
                </div>
                @if (openModules().has(mod.id)) {
                  <div class="module-lessons">
                    @for (lesson of mod.lessons ?? []; track lesson.id) {
                      <a class="lesson-item"
                         [routerLink]="['/cursos', course()!.slug, 'leccion', lesson.slug]">
                        <span class="lesson-icon">{{ lessonIcon(lesson.type) }}</span>
                        <span class="lesson-title">
                          {{ lesson.title }}
                          @if (lesson.is_preview) {
                            <span class="preview-tag">Vista previa</span>
                          }
                        </span>
                        @if (lesson.completed) {
                          <span class="completed-icon">✓</span>
                        }
                        <span class="lesson-duration">{{ lesson.duration_minutes }}min</span>
                      </a>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .detail-hero {
      padding: calc(var(--header-height) + var(--sp-12)) 0 var(--sp-12);
      border-bottom: 1px solid var(--border);

      &__inner {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: var(--sp-10);
        align-items: start;
        @media (max-width: 900px) { grid-template-columns: 1fr; }
      }

      &__badges { display: flex; gap: var(--sp-2); flex-wrap: wrap; margin-bottom: var(--sp-4); margin-top: var(--sp-3); }

      &__content {
        h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-4); line-height: 1.15; text-wrap: balance; }
        p { color: var(--text-secondary); font-size: var(--text-lg); line-height: 1.6; max-width: 62ch; }
      }
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--text-muted);

      a { color: var(--text-muted); &:hover { color: var(--primary); } }
      &__sep { color: var(--border-hover); }
      &__current { color: var(--text-secondary); font-weight: var(--font-medium); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 40ch; }
    }

    .instructor-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      margin-top: var(--sp-5);
      padding: var(--sp-2) var(--sp-4);
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      color: var(--text-secondary);

      .avatar {
        width: 28px; height: 28px; background: var(--primary); color: #fff;
        border-radius: var(--radius-sm); display: flex; align-items: center;
        justify-content: center; font-size: var(--text-xs); font-weight: var(--font-bold);
      }
    }

    .enroll-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-6);
      position: sticky;
      top: calc(var(--header-height) + var(--sp-4));

      &__stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--sp-4);
        margin-bottom: var(--sp-6);
        padding-bottom: var(--sp-6);
        border-bottom: 1px solid var(--border);
        text-align: center;
      }
    }

    .stat-num { display: block; font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--text-primary); font-family: var(--font-mono); }
    .stat-lbl { font-size: var(--text-xs); color: var(--text-muted); }

    .enrolled-progress { margin-bottom: var(--sp-4); }
    .progress-label { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--sp-2); }
    .enroll-note { text-align: center; font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--sp-3); a { color: var(--primary); } }

    .detail-body { padding: var(--sp-12) 0; }
    .modules-section h2 { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-6); }

    .module-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: var(--sp-4);
    }

    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--sp-4) var(--sp-5);
      cursor: pointer;
      transition: background var(--transition-fast);
      &:hover { background: var(--bg-surface-2); }

      .module-num { font-size: var(--text-xs); color: var(--text-muted); display: block; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
      h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
    }

    .module-toggle { color: var(--text-muted); font-size: var(--text-xs); }

    .module-lessons { border-top: 1px solid var(--border); }

    .lesson-item {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-5);
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      text-decoration: none;
      transition: background var(--transition-fast);
      &:last-child { border-bottom: none; }
      &:hover { background: var(--bg-surface-2); }
      &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

      .lesson-icon { font-size: var(--text-base); width: 24px; text-align: center; }
      .lesson-title { flex: 1; font-size: var(--text-sm); color: var(--text-primary); }
      .preview-tag { font-size: 10px; color: var(--accent); background: var(--accent-dim); padding: 1px 6px; border-radius: 3px; margin-left: var(--sp-2); }
      .completed-icon { color: var(--success); font-weight: var(--font-bold); }
      .lesson-duration { font-size: var(--text-xs); color: var(--text-muted); white-space: nowrap; }
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  private coursesSvc = inject(CoursesService);
  private route      = inject(ActivatedRoute);
  auth               = inject(AuthService);

  course    = signal<Course | null>(null);
  loading   = signal(true);
  enrolling = signal(false);
  openModules = signal<Set<number>>(new Set());

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.coursesSvc.getBySlug(slug).subscribe({
      next: (c) => { this.course.set(c); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  enroll() {
    if (!this.auth.isAuthenticated()) return;
    const id = this.course()?.id;
    if (!id) return;
    this.enrolling.set(true);
    this.coursesSvc.enroll(id).subscribe({
      next: () => {
        this.course.update(c => c ? { ...c, enrolled: true, progress_percent: 0 } : c);
        this.enrolling.set(false);
      },
      error: () => this.enrolling.set(false),
    });
  }

  toggleModule(id: number) {
    this.openModules.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  heroGradient(): string {
    const color = this.course()?.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, var(--bg-surface) 0%, ${color}11 100%)`;
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  lessonIcon(type: string): string {
    return { video: '▶️', article: '📄', quiz: '❓', code_challenge: '💻' }[type] ?? '📄';
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
