import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { LearningPathsService } from '../../core/services/learning-paths.service';
import { LearningPath } from '../../core/models';
import { AppIconComponent } from '../../shared/components/app-icon.component';

@Component({
  selector: 'app-learning-paths',
  imports: [RouterLink, SlicePipe, AppIconComponent],
  template: `
    <div class="paths-page">
      <div class="page-header">
        <div class="container">
          <h1>Rutas de <span>Aprendizaje</span></h1>
          <p>Sigue un camino estructurado de estación en estación. Diseñado para llevarte desde fundamentos hasta el dominio completo de cada área técnica.</p>
        </div>
      </div>

      <div class="container" style="padding: var(--sp-12) 0;">
        @if (loading()) {
          <div class="grid-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="path-card skeleton" style="height: 320px;"></div>
            }
          </div>
        } @else if (paths().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <app-icon name="map" [size]="48" color="var(--text-muted)" />
            </div>
            <h3>Próximamente</h3>
            <p>Las rutas de aprendizaje están siendo preparadas. ¡Vuelve pronto!</p>
          </div>
        } @else {
          <div class="grid-3">
            @for (path of paths(); track path.id) {
              <a [routerLink]="['/rutas', path.slug]" class="path-card">
                <div class="path-card__header">
                  <div class="header-top">
                    <span class="path-card__icon">
                      <app-icon [category]="path.category?.slug" [size]="28" [color]="path.category?.color || '#0AE98A'" [strokeWidth]="2" />
                    </span>
                    <div [class]="'badge badge-' + path.difficulty">{{ diffLabel(path.difficulty) }}</div>
                  </div>
                  @if (path.category) {
                    <span class="cat-tag">
                      <app-icon [category]="path.category.slug" [size]="12" [strokeWidth]="2" />
                      <span>{{ path.category.name }}</span>
                    </span>
                  }
                </div>
                <div class="path-card__body">
                  <h3>{{ path.title }}</h3>
                  <p>{{ path.description | slice:0:110 }}{{ path.description.length > 110 ? '...' : '' }}</p>
                  <div class="path-meta">
                    <span class="meta-item"><app-icon name="book" [size]="13" /> {{ path.courses_count ?? (path.levels ? countCourses(path) : 0) }} cursos</span>
                    <span class="meta-item"><app-icon name="clock" [size]="13" /> {{ path.estimated_hours }}h</span>
                    <span class="meta-item"><app-icon name="trophy" [size]="13" /> {{ path.levels?.length ?? 0 }} niveles</span>
                  </div>
                </div>
                <div class="path-card__footer">
                  <span class="explore-btn">
                    Explorar Ruta Completa <span class="arrow">→</span>
                  </span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      padding: var(--sp-8) 0 var(--sp-6);
      background: radial-gradient(ellipse at top, rgba(108,99,255,0.08), transparent 65%);
      h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--text-primary); letter-spacing: -0.02em; span { color: var(--primary); } }
      p { color: var(--text-secondary); margin-top: var(--sp-2); max-width: 62ch; line-height: 1.6; }
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: var(--sp-3);

      a { color: var(--text-muted); transition: color var(--transition-fast); &:hover { color: var(--primary); } }
      &__sep { color: var(--border-hover); }
      &__current { color: var(--text-secondary); font-weight: var(--font-medium); }
    }
    .path-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      text-decoration: none;
      transition: all var(--transition-base);
      position: relative;

      &:hover {
        border-color: var(--primary);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(10, 233, 138, 0.15);
        transform: translateY(-3px);

        .arrow {
          transform: translateX(4px);
        }
      }

      &__header {
        height: 100px;
        padding: var(--sp-4) var(--sp-5);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        background: linear-gradient(135deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%);
        border-bottom: 1px solid var(--border);
      }

      .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .path-card__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform var(--transition-fast);
      }

      &:hover .path-card__icon {
        transform: scale(1.1);
      }

      &__body {
        flex: 1;
        padding: var(--sp-5);
        display: flex;
        flex-direction: column;

        h3 {
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: var(--sp-2);
          line-height: 1.3;
        }

        p {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: var(--sp-4);
          flex: 1;
        }
      }

      &__footer {
        padding: var(--sp-3) var(--sp-5);
        border-top: 1px solid var(--border);
        background: rgba(10, 10, 15, 0.3);
      }
    }

    .cat-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      font-weight: var(--font-bold);
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }

    .path-meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      font-size: 0.72rem;
      color: var(--text-muted);
      font-family: var(--font-mono);

      .meta-item {
        background: var(--bg-surface-2);
        padding: 2px 7px;
        border-radius: var(--radius-sm);
        border: 1px solid rgba(42, 42, 62, 0.6);
      }
    }

    .explore-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      color: var(--text-primary);

      .arrow {
        color: var(--primary);
        font-size: 1rem;
        transition: transform var(--transition-fast);
      }
    }
  `]
})
export class LearningPathsComponent implements OnInit {
  private pathsSvc = inject(LearningPathsService);

  paths   = signal<LearningPath[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.pathsSvc.getAll().subscribe(res => {
      this.paths.set(res.data);
      this.loading.set(false);
    });
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  countCourses(path: LearningPath): number {
    let count = 0;
    for (const lvl of path.levels ?? []) {
      count += lvl.courses?.length ?? 0;
    }
    return count;
  }
}
