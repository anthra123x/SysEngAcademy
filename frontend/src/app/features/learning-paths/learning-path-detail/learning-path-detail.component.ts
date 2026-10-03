import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LearningPathsService } from '../../../core/services/learning-paths.service';
import { LearningPath, LearningPathLevel, Course } from '../../../core/models';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

@Component({
  selector: 'app-learning-path-detail',
  imports: [RouterLink, AppIconComponent],
  template: `
    @if (loading()) {
      <div class="container" style="padding-top: var(--sp-16); padding-bottom: var(--sp-16);">
        <div class="skeleton" style="height: 320px; border-radius: var(--radius-xl); margin-bottom: var(--sp-8);"></div>
        <div class="skeleton" style="height: 500px; border-radius: var(--radius-xl);"></div>
      </div>
    } @else if (path()) {
      <div class="path-detail">
        <!-- Hero Section -->
        <div class="path-hero">
          <div class="container path-hero__inner">
            <div class="path-hero__content">
              <div class="path-hero__badges">
                @if (path()!.category) {
                  <span class="badge badge-primary">
                    {{ path()!.category!.name }}
                  </span>
                }
                <span [class]="'badge badge-' + path()!.difficulty">{{ diffLabel(path()!.difficulty) }}</span>
                <span class="badge badge-accent">Itinerario Guiado</span>
              </div>

              <h1 class="path-title">{{ path()!.title }}</h1>
              <p class="path-desc">{{ path()!.description }}</p>

              <!-- Roadmap summary stats -->
              <div class="path-stats-bar">
                <div class="stat-box">
                  <span class="stat-box__val">{{ totalCourses() }}</span>
                  <span class="stat-box__lbl">Cursos</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">{{ path()!.estimated_hours }}h</span>
                  <span class="stat-box__lbl">Horas estimadas</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">{{ path()!.levels?.length ?? 0 }}</span>
                  <span class="stat-box__lbl">Niveles / Hitos</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">100%</span>
                  <span class="stat-box__lbl">Práctica guiada</span>
                </div>
              </div>

              <!-- Direct Path Actions (Clean, high-impact CTA) -->
              <div class="path-hero__actions">
                @if (firstCourseSlug()) {
                  <a [routerLink]="['/cursos', firstCourseSlug()]" class="btn btn-primary btn-lg">
                    Comenzar Ruta: Primer Curso →
                  </a>
                } @else {
                  <a routerLink="/cursos" class="btn btn-primary btn-lg">
                    Explorar Catálogo de Cursos →
                  </a>
                }
                <a href="#roadmap-stations" class="btn btn-secondary btn-lg">
                  Ver Estaciones del Mapa ↓
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Levels / Roadmap Milestones -->
        <div id="roadmap-stations" class="container levels-section">
          <div class="levels-header">
            <div class="section-tag">Mapa de ruta interactivo</div>
            <h2>Estaciones de Aprendizaje de la Ruta</h2>
            <p class="section-desc">Sigue el hilo conductor de la ruta: cada estación representa un hito en tu formación profesional.</p>
          </div>

          <div class="roadmap-spine-container">
            @for (level of path()!.levels ?? []; track level.id; let idx = $index; let isLast = $last) {
              <div class="milestone-station" [class.is-last]="isLast">
                <!-- Spine on the Left -->
                <div class="station-spine">
                  <div class="station-node">
                    <span class="station-num">{{ formatOrder(level.order) }}</span>
                  </div>
                  @if (!isLast) {
                    <div class="station-line"></div>
                  }
                </div>

                <!-- Station Card Content -->
                <div class="station-content">
                  <div class="station-card">
                    <!-- Station Header -->
                    <header class="station-card__header">
                      <div class="station-tag-row">
                        <span class="station-pill">
                          Hito 0{{ level.order }}
                        </span>
                        <span class="station-courses-count">
                          {{ level.courses?.length ?? 0 }} {{ (level.courses?.length === 1) ? 'curso' : 'cursos' }}
                        </span>
                      </div>
                      <h3 class="station-title">{{ level.title }}</h3>
                      @if (level.description) {
                        <p class="station-desc">{{ level.description }}</p>
                      }
                    </header>

                    <!-- Courses Grid within Milestone -->
                    @if (level.courses && level.courses.length > 0) {
                      <div class="station-courses-grid">
                        @for (course of level.courses; track course.id) {
                          <a [routerLink]="['/cursos', course.slug]" class="path-course-card">
                            <div class="pcc-header">
                              <div class="pcc-icon">
                                <app-icon [category]="course.category?.slug" [size]="20" [color]="path()?.category?.color || '#0AE98A'" [strokeWidth]="2" />
                              </div>
                              <div class="pcc-badge-wrap">
                                <span [class]="'badge badge-' + course.difficulty">{{ diffLabel(course.difficulty) }}</span>
                              </div>
                            </div>

                            <div class="pcc-body">
                              <h4 class="pcc-title">{{ course.title }}</h4>
                              <p class="pcc-desc">{{ course.description }}</p>
                            </div>

                            <div class="pcc-footer">
                              <div class="pcc-meta">
                                <span class="pcc-time"><app-icon name="clock" [size]="12" /> {{ course.duration_hours }}h</span>
                                <span class="pcc-lessons">· <app-icon name="book" [size]="12" /> {{ course.lessons_count ?? 0 }} lecciones</span>
                              </div>
                              <span class="pcc-action">Ir al curso →</span>
                            </div>
                          </a>
                        }
                      </div>
                    } @else {
                      <div class="station-empty">
                        <div class="empty-icon">
                          <app-icon name="construction" [size]="36" color="#FFB800" />
                        </div>
                        <div class="empty-content">
                          <h4>Contenido en preparación para este hito</h4>
                          <p>Los módulos y proyectos avanzados de esta etapa se están actualizando para la mejor experiencia interactiva.</p>
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Connector Bridge to Next Milestone -->
                  @if (!isLast) {
                    <div class="milestone-bridge">
                      <div class="bridge-arrow">
                        <span>↓</span> Requisito para desbloquear el Nivel {{ level.order + 1 }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="container" style="padding: var(--sp-20) var(--sp-4); text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--sp-12); max-width: 520px; width: 100%; box-shadow: var(--shadow-xl);">
          <div style="margin-bottom: var(--sp-4); display: flex; justify-content: center;">
            <app-icon name="map" [size]="52" color="var(--text-muted)" />
          </div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-3);">Ruta no encontrada</h2>
          <p style="color: var(--text-secondary); margin-bottom: var(--sp-6); line-height: 1.6;">La ruta de aprendizaje a la que intentas acceder no existe o está en proceso de diseño.</p>
          <div style="display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap;">
            <a routerLink="/rutas" class="btn btn-primary">Ver todas las Rutas</a>
            <a routerLink="/cursos" class="btn btn-outline">Explorar Cursos</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .path-detail {
      padding-bottom: var(--sp-20);
    }

    /* ---------- HERO SECTION ---------- */
    .path-hero {
      padding: var(--sp-6) 0 var(--sp-4);
      position: relative;
      background: transparent;

      &__inner {
        display: block;
        max-width: 900px;
      }

      &__content {
        min-width: 0;
      }

      &__badges {
        display: flex;
        gap: var(--sp-2);
        flex-wrap: wrap;
        margin: var(--sp-4) 0 var(--sp-3);
      }
    }

    .path-hero__actions {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      margin-top: var(--sp-6);
      flex-wrap: wrap;

      @media (max-width: 540px) {
        flex-direction: column;
        width: 100%;

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .path-title {
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: var(--sp-4);
      text-wrap: balance;
    }

    .path-desc {
      color: var(--text-secondary);
      font-size: var(--text-base);
      line-height: 1.65;
      max-width: 68ch;
      margin-bottom: var(--sp-6);
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--text-muted);
      flex-wrap: wrap;

      a { color: var(--text-muted); transition: color var(--transition-fast); &:hover { color: var(--primary); } }
      &__sep { color: var(--border-hover); user-select: none; }
      &__current { color: var(--text-secondary); font-weight: var(--font-medium); }
    }

    /* Path Stats Bar */
    .path-stats-bar {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-3) var(--sp-5);
      flex-wrap: wrap;

      @media (max-width: 640px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 12px 14px;

        .stat-divider {
          display: none;
        }
      }
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 2px;

      &__val {
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        font-family: var(--font-mono);
      }

      &__lbl {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }

    .stat-divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    /* ---------- ROADMAP LEVELS SECTION ---------- */
    .levels-section {
      padding: var(--sp-4) 0 var(--sp-16);
    }

    .levels-header {
      margin-bottom: var(--sp-10);

      .section-tag {
        font-size: var(--text-xs);
        font-weight: var(--font-bold);
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--sp-1);
      }

      h2 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-top: 4px;
        max-width: 62ch;
      }
    }

    /* Roadmap Spine Container */
    .roadmap-spine-container {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .milestone-station {
      display: flex;
      gap: var(--sp-6);
      position: relative;

      @media (max-width: 640px) {
        gap: var(--sp-3);
      }
    }

    .station-spine {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 48px;

      @media (max-width: 640px) {
        width: 36px;
      }
    }

    .station-node {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-surface-2);
      border: 2px solid var(--primary);
      box-shadow: 0 0 16px rgba(10, 233, 138, 0.2);
      display: grid;
      place-items: center;
      z-index: 2;
      transition: all var(--transition-base);

      .station-num {
        font-size: 0.85rem;
        font-weight: var(--font-bold);
        font-family: var(--font-mono);
        color: var(--primary);
      }

      @media (max-width: 640px) {
        width: 36px;
        height: 36px;
        .station-num {
          font-size: 0.72rem;
        }
      }
    }

    .station-line {
      flex: 1;
      width: 2px;
      background: linear-gradient(180deg, rgba(10, 233, 138, 0.4), var(--border));
      min-height: 60px;
      margin: 4px 0;
    }

    .station-content {
      flex: 1;
      min-width: 0;
      padding-bottom: var(--sp-6);
    }

    .station-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-md);

      &__header {
        padding: var(--sp-6);
        border-bottom: 1px solid var(--border);

        @media (max-width: 640px) {
          padding: var(--sp-4);
        }
      }
    }

    .station-tag-row {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-bottom: var(--sp-2);
    }

    .station-pill {
      font-size: 0.72rem;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      background: var(--primary-dim);
      color: var(--primary);
      border: 1px solid rgba(10, 233, 138, 0.25);
    }

    .station-courses-count {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    .station-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: var(--sp-1);
    }

    .station-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.55;
    }

    /* Station Courses Grid */
    .station-courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--sp-4);
      padding: var(--sp-6);

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        padding: var(--sp-4);
      }
    }

    .path-course-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      text-decoration: none;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-primary);
        transform: translateY(-2px);

        .pcc-action {
          color: var(--primary);
          transform: translateX(3px);
        }
      }
    }

    .pcc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-3);
    }

    .pcc-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-3);
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 1.25rem;
    }

    .pcc-badge-wrap {
      display: flex;
      gap: var(--sp-1);
    }

    .pcc-body {
      flex: 1;
      margin-bottom: var(--sp-4);
    }

    .pcc-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--sp-1);
      line-height: 1.35;
    }

    .pcc-desc {
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .pcc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--sp-3);
      border-top: 1px solid rgba(42, 42, 62, 0.6);
      font-size: var(--text-xs);
    }

    .pcc-meta {
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .pcc-action {
      color: var(--text-secondary);
      font-weight: var(--font-semibold);
      transition: all var(--transition-fast);
    }

    /* Empty state inside milestone */
    .station-empty {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-6);
      background: rgba(10, 10, 15, 0.3);

      .empty-icon {
        font-size: 2rem;
      }

      .empty-content {
        h4 { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-primary); }
        p { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
      }
    }

    /* Milestone Bridge */
    .milestone-bridge {
      display: flex;
      align-items: center;
      padding: var(--sp-4) var(--sp-6) 0;

      .bridge-arrow {
        font-size: 0.75rem;
        font-weight: var(--font-semibold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 6px;

        span {
          font-size: 1rem;
        }
      }
    }

    @media (max-width: 640px) {
      .path-stats-bar {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sp-3);
        padding: var(--sp-4);

        .stat-divider { display: none; }
      }

      .path-hero__actions {
        flex-direction: column;
        align-items: stretch;
        .btn { width: 100%; justify-content: center; }
      }
    }
  `]
})
export class LearningPathDetailComponent implements OnInit {
  private pathsSvc = inject(LearningPathsService);
  private route    = inject(ActivatedRoute);

  path    = signal<LearningPath | null>(null);
  loading = signal(true);

  totalCourses = computed(() => {
    const p = this.path();
    if (!p) return 0;
    if (p.courses_count) return p.courses_count;
    let count = 0;
    for (const lvl of p.levels ?? []) {
      count += lvl.courses?.length ?? 0;
    }
    return count;
  });

  firstCourseSlug = computed(() => {
    const p = this.path();
    if (!p?.levels) return null;
    for (const lvl of p.levels) {
      if (lvl.courses && lvl.courses.length > 0) {
        return lvl.courses[0].slug;
      }
    }
    return null;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading.set(true);
        this.pathsSvc.getBySlug(slug).subscribe({
          next: (p) => { this.path.set(p); this.loading.set(false); },
          error: () => { this.path.set(null); this.loading.set(false); },
        });
      }
    });
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  formatOrder(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
