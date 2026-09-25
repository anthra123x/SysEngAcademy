import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LearningPathsService } from '../../../core/services/learning-paths.service';
import { LearningPath, LearningPathLevel } from '../../../core/models';

@Component({
  selector: 'app-learning-path-detail',
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <div class="container" style="padding: var(--sp-16) 0;">
        <div class="skeleton" style="height: 300px; border-radius: var(--radius-lg);"></div>
      </div>
    } @else if (path()) {
      <div class="path-detail">
        <!-- Hero -->
        <div class="path-hero" [style.background]="heroGradient()">
          <div class="container path-hero__inner">
            <div>
              <nav class="breadcrumb" aria-label="Migas de pan">
                <a routerLink="/">Inicio</a><span class="breadcrumb__sep">/</span>
                <a routerLink="/rutas">Rutas</a><span class="breadcrumb__sep">/</span>
                <span class="breadcrumb__current">{{ path()!.title }}</span>
              </nav>
              @if (path()!.category) {
                <span class="badge badge-primary">{{ path()!.category!.name }}</span>
              }
              <h1>{{ path()!.title }}</h1>
              <p>{{ path()!.description }}</p>
              <div class="path-stats">
                <div class="stat-pill">📚 {{ path()!.courses_count ?? 0 }} cursos</div>
                <div class="stat-pill">⏱ {{ path()!.estimated_hours }}h estimadas</div>
                <div class="stat-pill">🏆 {{ path()!.levels?.length ?? 0 }} niveles</div>
                <div [class]="'badge badge-' + path()!.difficulty">{{ diffLabel(path()!.difficulty) }}</div>
              </div>
            </div>
            <a routerLink="/auth/registro" class="btn btn-primary btn-lg">Comenzar Ruta</a>
          </div>
        </div>

        <!-- Levels -->
        <div class="container levels-section">
          <h2>Niveles de la Ruta</h2>

          @for (level of path()!.levels ?? []; track level.id) {
            <div class="level-card">
              <div class="level-header">
                <div class="level-badge">Nivel {{ level.order }}</div>
                <div>
                  <h3>{{ level.title }}</h3>
                  @if (level.description) {
                    <p>{{ level.description }}</p>
                  }
                </div>
              </div>

              @if (level.courses && level.courses.length > 0) {
                <div class="level-courses">
                  @for (course of level.courses; track course.id) {
                    <a [routerLink]="['/cursos', course.slug]" class="level-course-item">
                      <div class="lci-icon" [style.background]="course.category?.color + '33'">
                        {{ courseEmoji(course) }}
                      </div>
                      <div class="lci-info">
                        <span class="lci-title">{{ course.title }}</span>
                        <span class="lci-meta">{{ course.duration_hours }}h · {{ course.lessons_count ?? 0 }} lecciones</span>
                      </div>
                      <span class="lci-arrow">→</span>
                    </a>
                  }
                </div>
              } @else {
                <div class="level-empty">Cursos próximamente</div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .path-hero {
      padding: calc(var(--header-height) + var(--sp-12)) 0 var(--sp-12);
      border-bottom: 1px solid var(--border);

      &__inner {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: var(--sp-8);
        @media (max-width: 768px) { flex-direction: column; }
      }

      .badge { margin-top: var(--sp-3); }

      h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--text-primary); margin: var(--sp-4) 0; line-height: 1.15; text-wrap: balance; }
      p { color: var(--text-secondary); max-width: 62ch; line-height: 1.6; margin-bottom: var(--sp-6); }
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

    .path-stats { display: flex; flex-wrap: wrap; gap: var(--sp-3); }
    .stat-pill { background: var(--bg-surface-2); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 4px 12px; font-size: var(--text-sm); color: var(--text-secondary); }

    .levels-section { padding: var(--sp-12) 0; h2 { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-8); } }

    .level-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: var(--sp-6);
    }

    .level-header {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-5);
      padding: var(--sp-5) var(--sp-6);
      border-bottom: 1px solid var(--border);

      h3 { font-size: var(--text-lg); font-weight: var(--font-semibold); color: var(--text-primary); }
      p { font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--sp-1); }
    }

    .level-badge {
      flex-shrink: 0;
      width: 44px; height: 44px;
      background: var(--primary-dim);
      color: var(--primary);
      border: 1px solid rgba(108,99,255,0.3);
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      font-size: var(--text-sm); font-weight: var(--font-bold);
    }

    .level-courses { padding: var(--sp-3); }

    .level-course-item {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-3) var(--sp-4);
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: background var(--transition-fast);

      &:hover { background: var(--bg-surface-2); }

      .lci-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0; }
      .lci-info { flex: 1; }
      .lci-title { display: block; font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-primary); }
      .lci-meta { display: block; font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
      .lci-arrow { color: var(--text-muted); }
    }

    .level-empty { padding: var(--sp-5) var(--sp-6); font-size: var(--text-sm); color: var(--text-muted); font-style: italic; }
  `]
})
export class LearningPathDetailComponent implements OnInit {
  private pathsSvc = inject(LearningPathsService);
  private route    = inject(ActivatedRoute);

  path    = signal<LearningPath | null>(null);
  loading = signal(true);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.pathsSvc.getBySlug(slug).subscribe({
      next: (p) => { this.path.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  heroGradient(): string {
    const c = this.path()?.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, var(--bg-surface), ${c}15)`;
  }

  courseEmoji(course: { category?: { slug?: string } }): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡', 'algoritmos': '⚡', 'poo': '🧩',
      'bases-de-datos': '🗄️', 'redes': '🌐', 'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳', 'desarrollo-web': '🕸️',
    };
    return map[course.category?.slug ?? ''] ?? '📚';
  }
}
