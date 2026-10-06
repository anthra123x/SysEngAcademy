import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LearningPathsService } from '../../core/services/learning-paths.service';
import { LearningPath } from '../../core/models';
import { AppIconComponent } from '../../shared/components/app-icon.component';

@Component({
  selector: 'app-learning-paths',
  imports: [RouterLink, AppIconComponent],
  template: `
    <div class="paths-page">
      <!-- Main Paths Content -->
      <div class="container paths-container">
        @if (loading()) {
          <div class="paths-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="path-card skeleton" style="height: 340px;"></div>
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
          <div class="paths-grid">
            @for (path of paths(); track path.id) {
              <a [routerLink]="['/rutas', path.slug]" class="path-card" [style.--c]="path.category?.color || '#0AE98A'">
                <!-- Top Accent Line & Header -->
                <div class="path-card__header">
                  <div class="cat-pill">
                    <span class="cat-icon" [style.background]="getCategoryBg(path.category?.color)">
                      <app-icon [category]="path.category?.slug" [size]="16" [color]="path.category?.color || '#0AE98A'" [strokeWidth]="2" />
                    </span>
                    <span class="cat-name">{{ path.category?.name ?? 'Ingeniería' }}</span>
                  </div>
                  <span [class]="'badge badge-' + path.difficulty">{{ diffLabel(path.difficulty) }}</span>
                </div>

                <!-- Card Body -->
                <div class="path-card__body">
                  <h2 class="path-card__title">{{ path.title }}</h2>
                  <p class="path-card__desc">{{ path.description }}</p>
                  
                  <div class="path-meta">
                    <span class="meta-item">
                      <app-icon name="book" [size]="13" />
                      <span>{{ path.courses_count ?? (path.levels ? countCourses(path) : 0) }} cursos</span>
                    </span>
                    <span class="meta-item">
                      <app-icon name="clock" [size]="13" />
                      <span>{{ path.estimated_hours }}h estimadas</span>
                    </span>
                    <span class="meta-item">
                      <app-icon name="trophy" [size]="13" />
                      <span>{{ path.levels?.length ?? 0 }} hitos</span>
                    </span>
                  </div>
                </div>

                <!-- Card Footer CTA -->
                <div class="path-card__footer">
                  <span class="explore-btn">
                    <span>Explorar Ruta Completa</span>
                    <span class="arrow" aria-hidden="true">→</span>
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
    .paths-page {
      min-height: calc(100vh - var(--header-height, 64px));
      background: var(--bg-base);
    }

    .paths-container {
      padding-top: var(--sp-8);
      padding-bottom: var(--sp-20);

      @media (max-width: 640px) {
        padding-top: var(--sp-4);
        padding-bottom: calc(var(--bottom-nav-height, 60px) + 36px);
      }
    }

    .paths-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--sp-6);

      @media (max-width: 1024px) {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sp-5);
      }

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
        gap: var(--sp-4);
      }
    }

    .path-card {
      display: flex;
      flex-direction: column;
      background: rgba(16, 20, 32, 0.88);
      border: 1.5px dashed color-mix(in srgb, var(--c, var(--primary)) 35%, rgba(255, 255, 255, 0.14));
      border-radius: var(--radius-xl);
      overflow: hidden;
      text-decoration: none;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: all var(--transition-base);
      position: relative;

      &:hover {
        border-color: var(--c, var(--primary));
        border-style: dashed;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.45), 0 0 24px color-mix(in srgb, var(--c, var(--primary)) 22%, transparent);
        transform: translateY(-4px);

        .arrow {
          transform: translateX(6px);
          color: var(--c, var(--primary));
        }

        .cat-icon {
          border-color: var(--c, var(--primary));
          background: color-mix(in srgb, var(--c, var(--primary)) 14%, transparent) !important;
          transform: scale(1.08);
        }
      }

      &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-3);
        padding: var(--sp-4) var(--sp-5);
        background: linear-gradient(180deg, rgba(22, 25, 38, 0.6) 0%, transparent 100%);
      }

      .cat-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-width: 0;

        .cat-icon {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1.5px dashed color-mix(in srgb, var(--c, var(--primary)) 50%, rgba(255, 255, 255, 0.18));
          transition: all var(--transition-fast);
        }

        .cat-name {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      &__body {
        flex: 1;
        padding: var(--sp-3) var(--sp-5) var(--sp-4);
        display: flex;
        flex-direction: column;

        .path-card__title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.35;
          margin-bottom: var(--sp-2);
          /* Bloquea la altura a 2 líneas exactas para que todas las descripciones inicien en la misma línea */
          min-height: 3.1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .path-card__desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--sp-5);
          /* Bloquea la altura a 2 líneas exactas para que los metadatos mantengan la misma línea base */
          min-height: 3.2rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .path-meta {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          padding-top: var(--sp-3);
          border-top: 1px solid rgba(255, 255, 255, 0.05);

          .meta-item {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-muted);
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            padding: 3px 8px;
            border-radius: var(--radius-sm);
            white-space: nowrap;
          }
        }
      }

      &__footer {
        padding: var(--sp-3) var(--sp-5);
        border-top: 1px solid var(--border);
        background: rgba(10, 12, 20, 0.4);

        .explore-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
          transition: color var(--transition-fast);

          .arrow {
            color: var(--text-muted);
            font-size: 1rem;
            transition: transform var(--transition-fast), color var(--transition-fast);
          }
        }
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

  getCategoryBg(color: string | undefined): string {
    if (!color) return 'rgba(10, 233, 138, 0.12)';
    if (color.startsWith('#') && color.length === 7) {
      return `${color}18`;
    }
    return 'rgba(10, 233, 138, 0.12)';
  }

  countCourses(path: LearningPath): number {
    let count = 0;
    for (const lvl of path.levels ?? []) {
      count += lvl.courses?.length ?? 0;
    }
    return count;
  }
}
