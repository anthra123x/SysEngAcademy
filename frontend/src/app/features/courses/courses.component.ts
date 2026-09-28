import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { CoursesService } from '../../core/services/courses.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Category, Course, CourseFilters, PaginatedResponse } from '../../core/models';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, FormsModule, SlicePipe],
  template: `
    <div class="courses-page">
      <!-- Introducción: se integra con el contenido, sin banda que duplique el navbar -->
      <div class="page-header">
        <div class="container">
          <div class="page-header__row">
            <div>
              <h1>Todos los <span>Cursos</span></h1>
              <p>Aprende a tu ritmo con cursos diseñados para ingenieros de sistemas</p>
            </div>
            <span class="results-count">{{ total() }} {{ total() === 1 ? 'curso' : 'cursos' }}</span>
          </div>
        </div>
      </div>

      <div class="container courses-layout">
        <!-- Sidebar Filters -->
        <aside class="filters">
          <div class="filters__header">
            <h3>Filtros</h3>
            <button class="btn btn-ghost btn-sm" (click)="clearFilters()">Limpiar</button>
          </div>

          <div class="filter-group">
            <label>Buscar</label>
            <input class="input" type="text" placeholder="Buscar cursos..." [(ngModel)]="filters.search"
              (input)="onFilter()">
          </div>

          <div class="filter-group">
            <label>Categoría</label>
            <select class="input" [(ngModel)]="filters.category" (change)="onFilter()">
              <option value="">Todas las categorías</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.slug">{{ cat.name }}</option>
              }
            </select>
          </div>

          <div class="filter-group">
            <label>Dificultad</label>
            <select class="input" [(ngModel)]="filters.difficulty" (change)="onFilter()">
              <option value="">Cualquier nivel</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="expert">Experto</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="onlyFree" (change)="onFilter()">
              Solo cursos gratis
            </label>
          </div>
        </aside>

        <!-- Course Grid -->
        <main class="courses-main">
          @if (loading()) {
            <div class="grid-4">
              @for (i of [1,2,3,4,5,6,7,8]; track i) {
                <div class="course-card skeleton" style="height:260px;"></div>
              }
            </div>
          } @else if (courses().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>Sin resultados</h3>
              <p>No hay cursos que coincidan con tu búsqueda. Intenta con otros filtros.</p>
            </div>
          } @else {
            <div class="grid-4">
              @for (course of courses(); track course.id) {
                <a [routerLink]="['/cursos', course.slug]" class="course-card">
                  <div class="course-card__thumb">
                    <span class="emoji">{{ emoji(course) }}</span>
                    @if (course.is_free) {
                      <span class="free-tag">GRATIS</span>
                    }
                  </div>
                  <div class="course-card__body">
                    <div class="card-badges">
                      @if (course.category) {
                        <span class="card-cat-tag">
                          {{ course.category.name }}
                        </span>
                      }
                      <div [class]="'badge badge-' + course.difficulty">{{ diffLabel(course.difficulty) }}</div>
                    </div>
                    <h3>{{ course.title }}</h3>
                    <p>{{ course.description | slice:0:85 }}...</p>
                    <div class="meta">
                      <span>⏱ {{ course.duration_hours }}h</span>
                      <span>· 📚 {{ course.lessons_count ?? 0 }} lecciones</span>
                    </div>
                  </div>
                </a>
              }
            </div>

            <!-- Pagination -->
            @if (lastPage() > 1) {
              <div class="pagination">
                <button class="btn btn-outline btn-sm" [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">← Anterior</button>
                <span>Página {{ currentPage() }} de {{ lastPage() }}</span>
                <button class="btn btn-outline btn-sm" [disabled]="currentPage() >= lastPage()" (click)="goToPage(currentPage() + 1)">Siguiente →</button>
              </div>
            }
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      padding: var(--sp-8) 0 var(--sp-6);
      h1 { font-size: var(--text-3xl); font-weight: var(--font-bold); color: var(--text-primary); letter-spacing: -0.02em; span { color: var(--primary); } }
      p { color: var(--text-secondary); margin-top: var(--sp-2); max-width: 60ch; }
      &__row {
        display: flex; align-items: flex-end; justify-content: space-between;
        gap: var(--sp-4); flex-wrap: wrap;
      }
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: var(--sp-3);

      a { color: var(--text-muted); &:hover { color: var(--primary); } }
      &__sep { color: var(--border-hover); }
      &__current { color: var(--text-secondary); font-weight: var(--font-medium); }
    }
    .courses-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: var(--sp-8);
      padding-top: var(--sp-6);
      padding-bottom: var(--sp-12);
      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .filters {
      &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--sp-5); h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); } }
    }
    .filter-group {
      margin-bottom: var(--sp-5);
      label { display: block; font-size: var(--text-sm); font-weight: var(--font-medium); color: var(--text-secondary); margin-bottom: var(--sp-2); }
    }
    .checkbox-label { display: flex !important; align-items: center; gap: var(--sp-2); cursor: pointer; input { width: 16px; height: 16px; accent-color: var(--primary); } }
    .results-count {
      flex: none;
      padding: .3rem .7rem;
      border: 1px solid var(--border);
      border-radius: 99px;
      background: var(--bg-surface);
      font-size: var(--text-xs); font-weight: var(--font-medium);
      color: var(--text-secondary);
    }
    .course-card {
      display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-xl); overflow: hidden; text-decoration: none; transition: all var(--transition-base);
      &:hover { border-color: var(--primary); box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(10, 233, 138, 0.15); transform: translateY(-3px); }
      &__thumb {
        position: relative;
        height: 110px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%);
        border-bottom: 1px solid var(--border);
      }
      .emoji { font-size: 2.6rem; transition: transform var(--transition-fast); }
      &:hover .emoji { transform: scale(1.1); }
      .free-tag {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--primary);
        color: #08090D;
        font-size: 10px;
        font-weight: var(--font-bold);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
      }
      &__body { flex: 1; padding: var(--sp-5); display: flex; flex-direction: column; gap: var(--sp-2);
        .card-badges { display: flex; align-items: center; justify-content: space-between; gap: var(--sp-2); margin-bottom: 2px; }
        .card-cat-tag {
          font-size: 0.7rem;
          font-weight: var(--font-bold);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--primary);
        }
        h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); line-height: 1.35; }
        p { font-size: var(--text-xs); color: var(--text-secondary); flex: 1; line-height: 1.55; }
      }
      .meta { font-size: var(--text-xs); color: var(--text-muted); display: flex; gap: var(--sp-2); font-family: var(--font-mono); }
    }
    .pagination { display: flex; align-items: center; justify-content: center; gap: var(--sp-4); margin-top: var(--sp-8); font-size: var(--text-sm); color: var(--text-secondary); }
  `]
})
export class CoursesComponent implements OnInit {
  private coursesSvc    = inject(CoursesService);
  private categoriesSvc = inject(CategoriesService);

  courses     = signal<Course[]>([]);
  categories  = signal<Category[]>([]);
  loading     = signal(true);
  total       = signal(0);
  currentPage = signal(1);
  lastPage    = signal(1);
  onlyFree    = false;

  filters: CourseFilters = {};

  ngOnInit() {
    this.categoriesSvc.getAll().subscribe(cats => this.categories.set(cats));
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: CourseFilters = { ...this.filters, page: this.currentPage() };
    if (this.onlyFree) params.is_free = true;

    this.coursesSvc.getAll(params).subscribe({
      next: (res: PaginatedResponse<Course> & { meta?: { total: number; last_page: number } }) => {
        this.courses.set(res.data ?? []);
        // Laravel devuelve la paginación en la raíz; toleratemos también `meta`
        // por si el backend la encapsula en el futuro.
        const meta = (res as { meta?: { total: number; last_page: number } }).meta;
        this.total.set(meta?.total ?? res.total ?? (res.data?.length ?? 0));
        this.lastPage.set(meta?.last_page ?? res.last_page ?? 1);
        this.loading.set(false);
      },
      error: () => {
        this.courses.set([]);
        this.total.set(0);
        this.loading.set(false);
      },
    });
  }

  onFilter() { this.currentPage.set(1); this.load(); }

  clearFilters() {
    this.filters = {};
    this.onlyFree = false;
    this.onFilter();
  }

  goToPage(page: number) {
    this.currentPage.set(page);
    this.load();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  emoji(course: Course): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡',
      'algoritmos': '⚡',
      'poo': '🧩',
      'bases-de-datos': '🗄️',
      'redes': '🌐',
      'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳',
      'desarrollo-web': '🕸️',
      'desarrollo-backend': '⚙️',
      'desarrollo-frontend': '🎨',
      'devops': '🚀',
      'git': '🐙',
      'ingenieria-software': '📐',
      'ia-desarrollo': '🤖',
    };
    return map[course.category?.slug ?? ''] ?? '📚';
  }
}
