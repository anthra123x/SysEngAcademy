import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { LearningPathsService } from '../../core/services/learning-paths.service';
import { LearningPath } from '../../core/models';

@Component({
  selector: 'app-learning-paths',
  imports: [RouterLink, SlicePipe],
  template: `
    <div class="paths-page">
      <div class="page-header">
        <div class="container">
          <h1>Rutas de <span>Aprendizaje</span></h1>
          <p>Sigue un camino guiado de nivel en nivel. Cada ruta fue diseñada por expertos para llevarte de cero a dominar un área completa.</p>
        </div>
      </div>

      <div class="container" style="padding: var(--sp-10) var(--sp-6);">
        @if (loading()) {
          <div class="grid-3">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="path-card skeleton" style="height: 300px;"></div>
            }
          </div>
        } @else if (paths().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">🗺️</div>
            <h3>Próximamente</h3>
            <p>Las rutas de aprendizaje están siendo preparadas. ¡Vuelve pronto!</p>
          </div>
        } @else {
          <div class="grid-3">
            @for (path of paths(); track path.id) {
              <a [routerLink]="['/rutas', path.slug]" class="path-card">
                <div class="path-card__header" [style.background]="gradient(path)">
                  <div [class]="'badge badge-' + path.difficulty">{{ diffLabel(path.difficulty) }}</div>
                  @if (path.category) {
                    <span class="cat-tag">{{ path.category.name }}</span>
                  }
                </div>
                <div class="path-card__body">
                  <h3>{{ path.title }}</h3>
                  <p>{{ path.description | slice:0:120 }}{{ path.description.length > 120 ? '...' : '' }}</p>
                  <div class="path-meta">
                    <span>📚 {{ path.courses_count ?? 0 }} cursos</span>
                    <span>⏱ {{ path.estimated_hours }}h</span>
                    <span>🏆 {{ path.levels?.length ?? 0 }} niveles</span>
                  </div>
                </div>
                <div class="path-card__footer">
                  <span class="btn btn-outline btn-sm">Explorar Ruta →</span>
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
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      padding: var(--sp-12) 0;
      background: radial-gradient(ellipse at top, rgba(108,99,255,0.06), transparent 60%);
      h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--text-primary); span { color: var(--primary); } }
      p { color: var(--text-secondary); margin-top: var(--sp-3); max-width: 600px; }
    }
    .path-card {
      display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; transition: all var(--transition-base);
      &:hover { border-color: var(--primary); box-shadow: var(--shadow-primary); transform: translateY(-2px); }
      &__header { height: 90px; padding: var(--sp-4); display: flex; justify-content: space-between; align-items: flex-start; }
      &__body { flex: 1; padding: var(--sp-5);
        h3 { font-size: var(--text-xl); font-weight: var(--font-semibold); color: var(--text-primary); margin-bottom: var(--sp-2); }
        p { font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--sp-4); }
      }
      &__footer { padding: var(--sp-4) var(--sp-5); border-top: 1px solid var(--border); }
    }
    .cat-tag { font-size: var(--text-xs); font-weight: var(--font-semibold); color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 0.06em; }
    .path-meta { display: flex; flex-wrap: wrap; gap: var(--sp-4); font-size: var(--text-xs); color: var(--text-muted); }
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

  gradient(path: LearningPath): string {
    const c = path.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, ${c}55, ${c}22)`;
  }
}
