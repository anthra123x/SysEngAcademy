import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { CoursesService } from '../../core/services/courses.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Course, Category, CourseFilters } from '../../core/models';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, FormsModule, SlicePipe],
  template: `
    <div class="courses-page">
      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <nav class="breadcrumb" aria-label="Migas de pan">
            <a routerLink="/">Inicio</a><span class="breadcrumb__sep">/</span>
            <span class="breadcrumb__current">Cursos</span>
          </nav>
          <h1>Todos los <span>Cursos</span></h1>
          <p>Aprende a tu ritmo con cursos diseñados para ingenieros de sistemas</p>
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
          <div class="courses-main__top">
            <span class="results-count">{{ total() }} cursos encontrados</span>
          </div>

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
                  <div class="course-card__thumb" [style.background]="course.category ? course.category.color + '33' : 'var(--bg-surface-3)'">
                    <span class="emoji">{{ emoji(course) }}</span>
                    @if (course.is_free) {
                      <span class="free-tag">GRATIS</span>
                    }
                  </div>
                  <div class="course-card__body">
                    <div [class]="'badge badge-' + course.difficulty">{{ diffLabel(course.difficulty) }}</div>
                    <h3>{{ course.title }}</h3>
                    <p>{{ course.description | slice:0:80 }}...</p>
                    <div class="meta">
                      <span>⏱ {{ course.duration_hours }}h</span>
                      <span>· {{ course.lessons_count ?? 0 }} lecciones</span>
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
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      padding: calc(var(--header-height) + var(--sp-10)) 0 var(--sp-10);
      h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); color: var(--text-primary); span { color: var(--primary); } }
      p { color: var(--text-secondary); margin-top: var(--sp-3); }
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
      padding-top: var(--sp-8);
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
    .courses-main__top { margin-bottom: var(--sp-5); }
    .results-count { font-size: var(--text-sm); color: var(--text-muted); }
    .course-card {
      display: flex; flex-direction: column; background: var(--bg-surface); border: 1px solid var(--border);
      border-radius: var(--radius-lg); overflow: hidden; text-decoration: none; transition: all var(--transition-base);
      &:hover { border-color: var(--primary); box-shadow: var(--shadow-primary); transform: translateY(-2px); }
      &__thumb { position: relative; height: 100px; display: flex; align-items: center; justify-content: center; }
      .emoji { font-size: 2.5rem; }
      .free-tag { position: absolute; top: 8px; right: 8px; background: var(--success); color: #000; font-size: 10px; font-weight: var(--font-bold); padding: 2px 8px; border-radius: var(--radius-sm); }
      &__body { flex: 1; padding: var(--sp-4); display: flex; flex-direction: column; gap: var(--sp-2);
        h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); line-height: 1.3; }
        p { font-size: var(--text-sm); color: var(--text-secondary); flex: 1; line-height: 1.5; }
      }
      .meta { font-size: var(--text-xs); color: var(--text-muted); display: flex; gap: var(--sp-1); }
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

    this.coursesSvc.getAll(params).subscribe(res => {
      this.courses.set(res.data);
      this.total.set(res.meta.total);
      this.lastPage.set(res.meta.last_page);
      this.loading.set(false);
    });
  }

  onFilter() { this.currentPage.set(1); this.load(); }

  clearFilters() {
    this.filters = {};
    this.onlyFree = false;
    this.onFilter();
  }

  goToPage(page: number) { this.currentPage.set(page); this.load(); }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  emoji(course: Course): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡', 'algoritmos': '⚡', 'poo': '🧩',
      'bases-de-datos': '🗄️', 'redes': '🌐', 'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳', 'desarrollo-web': '🕸️',
    };
    return map[course.category?.slug ?? ''] ?? '📚';
  }
}
