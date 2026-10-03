import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, SlicePipe } from '@angular/common';
import { CoursesService, formatRatingCount } from '../../core/services/courses.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Category, Course, CourseFilters, PaginatedResponse } from '../../core/models';
import { AppIconComponent } from '../../shared/components/app-icon.component';

@Component({
  selector: 'app-courses',
  imports: [RouterLink, FormsModule, SlicePipe, DecimalPipe, AppIconComponent],
  template: `
    <div class="courses-page">
      <div class="container">
        <!-- Barra de Cabecera del Catálogo (Nivel superior, ancho completo) -->
        <div class="courses-header-bar">
          <div class="courses-header-left">
            <h1 class="courses-main-title">Catálogo de Cursos</h1>
            <span class="courses-subtitle">Explora cursos y especializaciones técnicas</span>
          </div>
          <span class="results-count">{{ total() }} {{ total() === 1 ? 'curso disponible' : 'cursos disponibles' }}</span>
        </div>

        <div class="courses-layout">
          <!-- Mobile Filters Trigger -->
          <div class="mobile-filters-trigger">
            <button type="button" class="btn btn-outline btn-block" (click)="showMobileFilters.set(!showMobileFilters())">
              <span style="display:inline-flex; align-items:center; gap:8px;">
                <app-icon name="target" [size]="14" color="var(--primary)" />
                {{ showMobileFilters() ? 'Ocultar Filtros' : 'Filtrar Cursos (' + total() + ')' }}
                @if (activeFiltersCount() > 0) {
                  <span class="filter-count-pill">{{ activeFiltersCount() }}</span>
                }
              </span>
              <app-icon [name]="showMobileFilters() ? 'chevron-up' : 'chevron-down'" [size]="14" />
            </button>
          </div>

          <!-- Sidebar de Filtros Moderno (Alineado con el top de los cursos) -->
          <aside class="filters" [class.is-mobile-open]="showMobileFilters()">
            <div class="filters__header">
              <div class="filters-title-wrap">
                <app-icon name="target" [size]="15" color="var(--primary)" />
                <h3>Filtros</h3>
                @if (activeFiltersCount() > 0) {
                  <span class="active-badge">{{ activeFiltersCount() }}</span>
                }
              </div>
              @if (activeFiltersCount() > 0) {
                <button type="button" class="btn btn-ghost btn-sm" (click)="clearFilters()">Limpiar todo</button>
              }
            </div>

            <!-- Búsqueda con debounce y botón de borrado -->
            <div class="filter-group">
              <label class="filter-label">Buscar Curso</label>
              <div class="search-input-wrap">
                <span class="search-icon"><app-icon name="search" [size]="14" color="var(--text-muted)" /></span>
                <input
                  class="search-input"
                  type="text"
                  placeholder="Ej. Python, Docker, SQL..."
                  [ngModel]="filters.search || ''"
                  (input)="onSearchInput($event)"
                />
                @if (filters.search) {
                  <button type="button" class="btn-clear-search" (click)="clearSearch()" title="Borrar búsqueda">✕</button>
                }
              </div>
            </div>

            <!-- Filtro de Nivel de Dificultad -->
            <div class="filter-group">
              <div class="filter-label-row">
                <label class="filter-label">Nivel de Dificultad</label>
                @if (filters.difficulty) {
                  <button type="button" class="filter-clear-link" (click)="selectDifficulty('')">Todos</button>
                }
              </div>
              <div class="difficulty-segmented">
                <button
                  type="button"
                  class="diff-seg-btn"
                  [class.is-active]="!filters.difficulty"
                  (click)="selectDifficulty('')"
                >
                  Todos
                </button>
                <button
                  type="button"
                  class="diff-seg-btn diff-seg-btn--beginner"
                  [class.is-active]="filters.difficulty === 'beginner'"
                  (click)="selectDifficulty('beginner')"
                >
                  Principiante
                </button>
                <button
                  type="button"
                  class="diff-seg-btn diff-seg-btn--intermediate"
                  [class.is-active]="filters.difficulty === 'intermediate'"
                  (click)="selectDifficulty('intermediate')"
                >
                  Intermedio
                </button>
                <button
                  type="button"
                  class="diff-seg-btn diff-seg-btn--advanced"
                  [class.is-active]="filters.difficulty === 'advanced'"
                  (click)="selectDifficulty('advanced')"
                >
                  Avanzado
                </button>
                <button
                  type="button"
                  class="diff-seg-btn diff-seg-btn--expert"
                  [class.is-active]="filters.difficulty === 'expert'"
                  (click)="selectDifficulty('expert')"
                >
                  Experto
                </button>
              </div>
            </div>
          </aside>

          <!-- Course Grid -->
          <main class="courses-main">
            <!-- Active filter chips row -->
            @if (activeFiltersCount() > 0) {
              <div class="active-filters-bar">
                <span class="af-label">Filtros aplicados:</span>
                <div class="af-chips-wrap">
                  @if (filters.search) {
                    <span class="af-chip" (click)="clearSearch()">
                      <span class="af-chip-text">"{{ filters.search }}"</span>
                      <span class="af-close">✕</span>
                    </span>
                  }
                  @if (filters.category) {
                    <span class="af-chip" (click)="selectCategory('')">
                      <span class="af-chip-text">{{ getCategoryName(filters.category) }}</span>
                      <span class="af-close">✕</span>
                    </span>
                  }
                  @if (filters.difficulty) {
                    <span class="af-chip" (click)="selectDifficulty('')">
                      <span class="af-chip-text">{{ diffLabel(filters.difficulty) }}</span>
                      <span class="af-close">✕</span>
                    </span>
                  }
                  <button type="button" class="btn-clear-inline" (click)="clearFilters()">
                    Limpiar todos
                  </button>
                </div>
              </div>
            }

          @if (loading()) {
            <div class="courses-grid">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="course-card skeleton" style="height:280px;"></div>
              }
            </div>
          } @else if (courses().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">
                <app-icon name="search" [size]="44" color="var(--text-muted)" />
              </div>
              <h3>Sin cursos encontrados</h3>
              <p>No se encontraron resultados para los filtros seleccionados.</p>
              <button type="button" class="btn btn-outline btn-sm" style="margin-top: 1rem;" (click)="clearFilters()">
                Restablecer todos los filtros
              </button>
            </div>
          } @else {
            <div class="courses-grid">
              @for (course of courses(); track course.id) {
                <a [routerLink]="['/cursos', course.slug]" class="course-card">
                  <div class="course-card__thumb">
                    <span class="course-thumb__icon">
                      <app-icon [category]="course.category?.slug" [size]="42" [color]="course.category?.color || '#0AE98A'" [strokeWidth]="1.8" />
                    </span>
                  </div>
                  <div class="course-card__body">
                    <div class="card-badges">
                      @if (course.category) {
                        <span class="card-cat-tag">
                          <app-icon [category]="course.category.slug" [size]="12" [strokeWidth]="2" />
                          <span>{{ course.category.name }}</span>
                        </span>
                      }
                      <div [class]="'badge badge-' + course.difficulty">{{ diffLabel(course.difficulty) }}</div>
                      @if ((course.rating_count ?? 0) > 0 && course.rating_avg) {
                        <span class="rating-badge-card" [title]="'Calificación: ' + (course.rating_avg | number:'1.1-1') + ' / 5 (' + course.rating_count + ' opiniones)'">
                          <app-icon name="star" [size]="11" color="#FFB800" />
                          <span>{{ course.rating_avg | number:'1.1-1' }}</span>
                          <small>({{ formatRatingCount(course.rating_count) }})</small>
                        </span>
                      } @else {
                        <span class="rating-badge-card rating-badge-card--new" title="Curso nuevo sin calificaciones todavía">
                          <app-icon name="sparkles" [size]="11" color="#64748B" />
                          <span>Nuevo</span>
                        </span>
                      }
                    </div>
                    <h3>{{ course.title }}</h3>
                    <p>{{ course.description | slice:0:110 }}...</p>
                    <div class="meta">
                      <span><app-icon name="clock" [size]="12" /> {{ course.duration_hours }}h</span>
                      <span>· <app-icon name="book" [size]="12" /> {{ course.lessons_count ?? 0 }} lecciones</span>
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
    .courses-page {
      padding-top: var(--sp-6);
      padding-bottom: var(--sp-12);
    }

    .courses-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #1A1F30;
      gap: 1rem;
      flex-wrap: wrap;

      .courses-header-left {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .courses-main-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #F8FAFC;
        margin: 0;
        letter-spacing: -0.02em;
      }

      .courses-subtitle {
        font-size: 0.84rem;
        color: #94A3B8;
      }
    }

    .courses-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: var(--sp-6);
      align-items: start;
      @media (max-width: 900px) { grid-template-columns: 1fr; gap: var(--sp-4); }
    }

    .mobile-filters-trigger {
      display: none;
      @media (max-width: 900px) {
        display: block;
        margin-bottom: var(--sp-3);
        .btn { width: 100%; justify-content: space-between; }
      }
    }

    .filter-count-pill {
      background: var(--primary);
      color: #08090D;
      font-size: 11px;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 99px;
    }

    /* BARRA LATERAL DE FILTROS (ESTÁTICA Y ALINEADA) */
    .filters {
      background: #0E111A;
      border: 1px solid #202436;
      border-radius: 12px;
      padding: 1.15rem;
      position: relative;
      height: fit-content;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 42px;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #1A1F30;
      }

      .filters-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;

        h3 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #F8FAFC;
          margin: 0;
        }

        .active-badge {
          background: rgba(10, 233, 138, 0.15);
          color: var(--primary);
          border: 1px solid rgba(10, 233, 138, 0.3);
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 99px;
        }
      }

      @media (max-width: 900px) {
        display: none;
        margin-bottom: var(--sp-4);
        &.is-mobile-open {
          display: block;
        }
      }
    }

    .filter-group {
      margin-bottom: 1.25rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .filter-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.45rem;
    }

    .filter-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .filter-clear-link {
      background: none;
      border: none;
      color: var(--primary);
      font-size: 0.72rem;
      cursor: pointer;
      padding: 0;
      &:hover { text-decoration: underline; }
    }

    /* INPUT DE BÚSQUEDA */
    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 10px;
        pointer-events: none;
        display: flex;
        align-items: center;
      }

      .search-input {
        width: 100%;
        background: #08090D;
        border: 1px solid #202436;
        color: #F8FAFC;
        border-radius: 6px;
        padding: 8px 30px 8px 32px;
        font-size: 0.85rem;
        transition: all 0.15s ease;

        &::placeholder {
          color: #64748B;
        }

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(10, 233, 138, 0.15);
        }
      }

      .btn-clear-search {
        position: absolute;
        right: 8px;
        background: none;
        border: none;
        color: #64748B;
        font-size: 11px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 3px;
        &:hover { color: #F8FAFC; }
      }
    }



    /* SEGMENTADO DE DIFICULTAD */
    .difficulty-segmented {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .diff-seg-btn {
      background: #121622;
      border: 1px solid #202436;
      color: #94A3B8;
      font-size: 11px;
      font-weight: 500;
      padding: 6px 8px;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s ease;

      &:hover {
        color: #F8FAFC;
        border-color: #2E344E;
      }

      &.is-active {
        background: #1A2030;
        color: #F8FAFC;
        border-color: #38BDF8;
        font-weight: 600;
      }

      &--beginner.is-active {
        background: rgba(10, 233, 138, 0.12);
        color: #0AE98A;
        border-color: rgba(10, 233, 138, 0.4);
      }

      &--intermediate.is-active {
        background: rgba(56, 189, 248, 0.12);
        color: #38BDF8;
        border-color: rgba(56, 189, 248, 0.4);
      }

      &--advanced.is-active {
        background: rgba(245, 158, 11, 0.12);
        color: #F59E0B;
        border-color: rgba(245, 158, 11, 0.4);
      }

      &--expert.is-active {
        background: rgba(168, 85, 247, 0.12);
        color: #C084FC;
        border-color: rgba(168, 85, 247, 0.4);
      }
    }

    /* BARRA DE FILTROS ACTIVOS */
    .active-filters-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1.25rem;
      padding: 0.65rem 0.85rem;
      background: #0E111A;
      border: 1px solid #202436;
      border-radius: 8px;
      flex-wrap: wrap;

      .af-label {
        font-size: 0.75rem;
        color: #64748B;
        font-weight: 600;
      }

      .af-chips-wrap {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .af-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #161B26;
        border: 1px solid #283048;
        color: #F8FAFC;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          border-color: #EF4444;
          .af-close { color: #EF4444; }
        }

        .af-close {
          color: #94A3B8;
          font-size: 10px;
        }
      }

      .btn-clear-inline {
        background: none;
        border: none;
        color: #94A3B8;
        font-size: 11px;
        cursor: pointer;
        text-decoration: underline;
        padding: 2px 4px;
        &:hover { color: #F8FAFC; }
      }
    }

    .results-count {
      flex: none;
      padding: .3rem .75rem;
      border: 1px solid #202436;
      border-radius: 99px;
      background: #0E111A;
      font-size: 0.75rem;
      font-weight: 600;
      color: #94A3B8;
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 680px) {
        grid-template-columns: 1fr;
      }
    }

    /* TARJETAS DE CURSO */
    .course-card {
      display: flex;
      flex-direction: column;
      background: #0E111A;
      border: 1px solid #202436;
      border-radius: 12px;
      overflow: hidden;
      text-decoration: none;
      position: relative;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;

      &:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }

      &:hover {
        border-color: rgba(10, 233, 138, 0.45);
        box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.5), 0 0 16px rgba(10, 233, 138, 0.12);
        transform: translateY(-2px);

        h3 {
          color: var(--primary);
        }

        .course-thumb__icon {
          transform: scale(1.08);
        }
      }

      &__thumb {
        position: relative;
        height: 112px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, #121622 0%, #0E111A 100%);
        border-bottom: none;
      }

      .course-thumb__icon {
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        transition: transform 0.2s ease;
      }

      &__body {
        flex: 1;
        padding: 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .card-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
          flex-wrap: nowrap;
        }

        .card-cat-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 130px;
        }

        .badge {
          white-space: nowrap;
          flex-shrink: 0;
          font-size: 10px;
          padding: 2px 7px;
        }

        .rating-badge-card {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 700;
          color: #FFB800;
          margin-left: auto;
          white-space: nowrap;
          flex-shrink: 0;

          small {
            color: #64748B;
            font-weight: 500;
          }

          &--new {
            color: #64748B;
            font-weight: 500;
          }
        }

        h3 {
          font-size: 0.96rem;
          font-weight: 600;
          color: #F8FAFC;
          line-height: 1.35;
          margin: 0;
          transition: color 0.15s ease;
        }

        p {
          font-size: 0.78rem;
          color: #94A3B8;
          flex: 1;
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      }

      .meta {
        font-size: 0.72rem;
        color: #64748B;
        display: flex;
        gap: 0.5rem;
        font-family: var(--font-mono);
        align-items: center;
        border-top: 1px solid #161B26;
        padding-top: 0.5rem;
        margin-top: auto;
      }
    }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-4);
      margin-top: var(--sp-8);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      flex-wrap: wrap;

      @media (max-width: 480px) {
        gap: var(--sp-2);
        font-size: var(--text-xs);
        .btn { padding: 6px 12px; }
      }
    }
  `]
})
export class CoursesComponent implements OnInit {
  private coursesSvc    = inject(CoursesService);
  private categoriesSvc = inject(CategoriesService);
  readonly formatRatingCount = formatRatingCount;

  courses     = signal<Course[]>([]);
  categories  = signal<Category[]>([]);
  loading     = signal(true);
  total       = signal(0);
  currentPage = signal(1);
  lastPage    = signal(1);
  showMobileFilters = signal(false);

  filters: CourseFilters = {};

  private searchDebounce?: any;

  activeFiltersCount = computed(() => {
    let count = 0;
    if (this.filters.search && this.filters.search.trim().length > 0) count++;
    if (this.filters.category && this.filters.category.trim().length > 0) count++;
    if (this.filters.difficulty && this.filters.difficulty.trim().length > 0) count++;
    return count;
  });

  ngOnInit() {
    this.categoriesSvc.getAll().subscribe(cats => this.categories.set(cats));
    this.load();
  }

  load() {
    this.loading.set(true);
    const params: CourseFilters = { ...this.filters, page: this.currentPage() };

    this.coursesSvc.getAll(params).subscribe({
      next: (res: PaginatedResponse<Course> & { meta?: { total: number; last_page: number } }) => {
        this.courses.set(res.data ?? []);
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

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.filters.search = val;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.onFilter();
    }, 280);
  }

  clearSearch() {
    this.filters.search = '';
    this.onFilter();
  }

  selectCategory(slug: string) {
    this.filters.category = slug || undefined;
    this.onFilter();
  }

  selectDifficulty(diff: string) {
    this.filters.difficulty = diff || undefined;
    this.onFilter();
  }

  getCategoryName(slug: string): string {
    const found = this.categories().find(c => c.slug === slug);
    return found ? found.name : slug;
  }

  onFilter() {
    this.currentPage.set(1);
    this.load();
  }

  clearFilters() {
    this.filters = {};
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
}
