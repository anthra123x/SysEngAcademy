import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, SlicePipe } from '@angular/common';
import { HomeService } from '../../core/services/home.service';
import { LearningPath, Course, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgIf, SlicePipe],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="hero__bg-grid"></div>
      <div class="container hero__inner">
        <div class="hero__content">
          <h1 class="hero__title">
            Aprende <span>Programación.</span><br>
            Domina tu carrera.
          </h1>
          <p class="hero__subtitle">
            Rutas de aprendizaje estructuradas y cursos interactivos para
            estudiantes de Ingeniería de Sistemas.
          </p>
          <div class="hero__actions">
            <a routerLink="/rutas" class="btn btn-primary btn-lg">
              Explorar Rutas
            </a>
            <a routerLink="/cursos" class="btn btn-outline btn-lg">
              Ver Cursos
            </a>
          </div>
          <div class="hero__stats">
            <div class="stat">
              <span class="stat__num">50+</span>
              <span class="stat__label">Cursos</span>
            </div>
            <div class="stat__divider"></div>
            <div class="stat">
              <span class="stat__num">200+</span>
              <span class="stat__label">Lecciones</span>
            </div>
            <div class="stat__divider"></div>
            <div class="stat">
              <span class="stat__num">10+</span>
              <span class="stat__label">Rutas</span>
            </div>
            <div class="stat__divider"></div>
            <div class="stat">
              <span class="stat__num">100%</span>
              <span class="stat__label">Gratis</span>
            </div>
          </div>
        </div>

        <div class="hero__code" aria-hidden="true">
          <div class="code-window">
            <div class="code-window__bar">
              <span></span><span></span><span></span>
              <span class="code-window__title">main.py</span>
            </div>
            <pre class="code-window__body"><code><span class="c"># SysEng Academy</span>
<span class="k">def</span> <span class="f">aprender_programacion</span>():
    ruta = <span class="s">"Fundamentos → POO"</span>
    <span class="k">for</span> nivel <span class="k">in</span> ruta.niveles:
        completar(nivel.lecciones)
        practicar(nivel.ejercicios)

    <span class="k">return</span> <span class="s">"Ingeniero de Sistemas 🎓"</span>

<span class="f">aprender_programacion</span>()</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">Áreas de Estudio</div>
          <h2 class="section-title">¿Qué quieres <span>aprender hoy?</span></h2>
        </div>
        <div class="categories-grid">
          @for (cat of categories(); track cat.id) {
            <a [routerLink]="['/cursos']" [queryParams]="{category: cat.slug}" class="category-card">
              <div class="category-card__icon" [style.background]="cat.color + '22'" [style.border-color]="cat.color + '44'">
                <span [style.color]="cat.color">{{ getCategoryEmoji(cat.slug) }}</span>
              </div>
              <span class="category-card__name">{{ cat.name }}</span>
            </a>
          }
          @if (categories().length === 0) {
            @for (i of [1,2,3,4,5,6,7,8]; track i) {
              <div class="category-card skeleton" style="height:90px;"></div>
            }
          }
        </div>
      </div>
    </section>

    <!-- LEARNING PATHS -->
    <section class="section paths-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>⚡</span> Aprendizaje Estructurado
          </div>
          <h2 class="section-title">Rutas de <span>Aprendizaje</span></h2>
          <p class="section-subtitle">Sigue un camino guiado por niveles. Cada ruta está diseñada para llevarte de cero a experto de forma progresiva.</p>
        </div>

        <div class="timeline">
          @for (path of learningPaths(); track path.id; let i = $index) {
            <div class="timeline__item" [class.timeline__item--right]="i % 2 === 1" [style.--i]="i">
              <div class="timeline__node" [style.background]="getPathGradient(path)" [style.border-color]="path.category?.color ?? '#6C63FF'">
                <span>{{ getPathEmoji(path) }}</span>
              </div>
              <a [routerLink]="['/rutas', path.slug]" class="timeline__card">
                <div class="timeline__card-top">
                  <span class="timeline__category" *ngIf="path.category">{{ path.category.name }}</span>
                  <span [class]="'badge badge-' + path.difficulty">{{ difficultyLabel(path.difficulty) }}</span>
                </div>
                <h3 class="timeline__title">{{ path.title }}</h3>
                <p class="timeline__desc">{{ path.description | slice:0:110 }}{{ path.description.length > 110 ? '…' : '' }}</p>
                <div class="timeline__meta">
                  <span>📚 {{ path.courses_count ?? 0 }} cursos</span>
                  <span>⏱ {{ path.estimated_hours }}h estimadas</span>
                  <span>{{ (path.levels?.length ?? 0) }} niveles</span>
                </div>
                <span class="timeline__cta">Ver Ruta →</span>
              </a>
            </div>
          }

          @if (learningPaths().length === 0) {
            @for (i of [0,1,2]; track i) {
              <div class="timeline__item">
                <div class="timeline__node skeleton"></div>
                <div class="timeline__card skeleton" style="height:150px;"></div>
              </div>
            }
          }
        </div>

        <div class="section-cta">
          <a routerLink="/rutas" class="btn btn-outline">Ver todas las rutas →</a>
        </div>
      </div>
    </section>

    <!-- FEATURED COURSES -->
    <section class="section courses-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>📖</span> Aprende a tu ritmo
          </div>
          <h2 class="section-title">Cursos <span>Independientes</span></h2>
          <p class="section-subtitle">Elige el tema que quieres estudiar y comienza cuando quieras. Sin orden ni requisitos previos.</p>
        </div>

        <div class="grid-4">
          @for (course of featuredCourses(); track course.id) {
            <a [routerLink]="['/cursos', course.slug]" class="course-card">
              <div class="course-card__thumb" [style.background]="course.category ? course.category.color + '33' : 'var(--bg-surface-3)'">
                <div class="course-card__emoji">{{ getCourseEmoji(course) }}</div>
                @if (course.is_free) {
                  <span class="course-card__free">GRATIS</span>
                }
              </div>
              <div class="course-card__body">
                <div [class]="'badge badge-' + course.difficulty" style="margin-bottom: var(--sp-2);">
                  {{ difficultyLabel(course.difficulty) }}
                </div>
                <h3>{{ course.title }}</h3>
                <p>{{ course.description | slice:0:80 }}...</p>
                <div class="course-card__meta">
                  <span>{{ course.duration_hours }}h</span>
                  <span>·</span>
                  <span>{{ course.lessons_count ?? 0 }} lecciones</span>
                </div>
              </div>
            </a>
          }

          @if (featuredCourses().length === 0) {
            @for (i of [1,2,3,4]; track i) {
              <div class="course-card skeleton" style="height: 260px;"></div>
            }
          }
        </div>

        <div class="section-cta">
          <a routerLink="/cursos" class="btn btn-outline">Ver todos los cursos →</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* HERO */
    .hero {
      position: relative;
      padding: var(--sp-20) 0 var(--sp-16);
      overflow: hidden;
      background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(108,99,255,0.08) 0%, transparent 70%);

      &__bg-grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px);
        background-size: 40px 40px;
        opacity: 0.3;
        mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
      }

      &__inner {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--sp-16);
        align-items: center;
        position: relative;
        z-index: 1;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
          .hero__code { display: none; }
        }
      }

      &__title {
        font-size: clamp(2.5rem, 5vw, 3.5rem);
        font-weight: var(--font-bold);
        line-height: 1.1;
        color: var(--text-primary);
        margin-bottom: var(--sp-5);

        span { color: var(--primary); }
      }

      &__subtitle {
        font-size: var(--text-lg);
        color: var(--text-secondary);
        line-height: 1.7;
        margin-bottom: var(--sp-8);
        max-width: 520px;
      }

      &__actions {
        display: flex;
        gap: var(--sp-4);
        margin-bottom: var(--sp-10);

        @media (max-width: 480px) { flex-direction: column; }
      }

      &__stats {
        display: flex;
        align-items: center;
        gap: var(--sp-6);
        padding-top: var(--sp-8);
        border-top: 1px solid var(--border);
      }
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;

      &__num {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        font-family: var(--font-mono);
      }

      &__label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      &__divider {
        width: 1px;
        height: 40px;
        background: var(--border);
      }
    }

    /* CODE WINDOW */
    .code-window {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);

      &__bar {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 16px;
        background: var(--bg-surface-2);
        border-bottom: 1px solid var(--border);

        span {
          width: 12px; height: 12px; border-radius: 50%;
          &:nth-child(1) { background: #FF5F57; }
          &:nth-child(2) { background: #FFBD2E; }
          &:nth-child(3) { background: #28CA41; }
        }
      }

      &__title {
        width: auto !important;
        height: auto !important;
        border-radius: 0 !important;
        background: none !important;
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-left: var(--sp-2);
      }

      &__body {
        padding: var(--sp-5);
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        line-height: 1.8;
        color: var(--text-primary);
        margin: 0;

        .c { color: var(--text-muted); }
        .k { color: var(--primary); }
        .f { color: var(--accent); }
        .s { color: var(--success); }
      }
    }

    /* CATEGORIES */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--sp-4);

      @media (max-width: 1024px) { grid-template-columns: repeat(4, 1fr); }
      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }

    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-5);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-base);
      text-align: center;

      &:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);
      }

      &__icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        border: 1px solid;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      &__name {
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        color: var(--text-primary);
      }
    }

    /* TIMELINE (Rutas de Aprendizaje) */
    .timeline {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--sp-10);
      padding: var(--sp-6) 0;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 2px;
        background: linear-gradient(180deg,
          transparent 0%,
          var(--primary) 8%,
          var(--accent) 92%,
          transparent 100%);
        opacity: 0.35;
      }
    }

    .timeline__item {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 72px 1fr;
      align-items: start;
      opacity: 0;
      animation: timeline-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(var(--i, 0) * 0.09s);

      &--right .timeline__card { grid-column: 3; }
    }

    .timeline__node {
      grid-column: 2;
      grid-row: 1;
      justify-self: center;
      width: 48px;
      height: 48px;
      margin-top: 4px;
      border-radius: 50%;
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 0 0 4px var(--bg-base), 0 8px 20px rgba(0,0,0,0.18);
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      .timeline__item:hover & {
        transform: scale(1.12);
        box-shadow: 0 0 0 4px var(--bg-base), 0 0 24px rgba(108,99,255,0.35);
      }
    }

    .timeline__card {
      grid-column: 1;
      grid-row: 1;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      padding: var(--sp-5);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-base);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 18px;
        width: 18px;
        height: 2px;
        background: var(--primary);
        opacity: 0.4;
      }

      .timeline__item:not(.timeline__item--right) &::after { right: -19px; }
      .timeline__item--right &::after { left: -19px; }

      &:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-primary);
        transform: translateY(-3px);

        .timeline__cta { color: var(--primary); gap: 8px; }
      }
    }

    .timeline__card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-2);
      margin-bottom: var(--sp-1);
    }

    .timeline__category {
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .timeline__title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      line-height: 1.25;
    }

    .timeline__desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .timeline__meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--sp-1);
    }

    .timeline__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--text-secondary);
      transition: all var(--transition-fast);
      margin-top: var(--sp-1);
    }

    @keyframes timeline-rise {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .timeline {
        gap: var(--sp-8);
        &::before { left: 27px; }
      }

      .timeline__item {
        grid-template-columns: 54px 1fr;
      }

      .timeline__node {
        grid-column: 1;
        width: 40px;
        height: 40px;
        font-size: 1rem;
      }

      .timeline__card {
        grid-column: 2;
        &::after { display: none; }
      }

      .timeline__item--right .timeline__card { grid-column: 2; }
    }

    @media (prefers-reduced-motion: reduce) {
      .timeline__item { animation: none; opacity: 1; }
    }

    /* COURSE CARDS */
    .course-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      text-decoration: none;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-primary);
        transform: translateY(-2px);
      }

      &__thumb {
        position: relative;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &__emoji { font-size: 2.5rem; }

      &__free {
        position: absolute;
        top: 10px;
        right: 10px;
        background: var(--success);
        color: #000;
        font-size: 10px;
        font-weight: var(--font-bold);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
      }

      &__body {
        flex: 1;
        padding: var(--sp-4);

        h3 {
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--sp-2);
          line-height: 1.3;
        }

        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--sp-4);
        }
      }

      &__meta {
        display: flex;
        gap: var(--sp-2);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }
    }

    /* SECTION UTILS */
    .section-cta {
      text-align: center;
      margin-top: var(--sp-10);
    }

    .paths-section {
      background: linear-gradient(180deg, transparent, rgba(108,99,255,0.03), transparent);
    }
  `]
})
export class HomeComponent implements OnInit {
  private homeSvc = inject(HomeService);

  learningPaths  = signal<LearningPath[]>([]);
  featuredCourses = signal<Course[]>([]);
  categories     = signal<Category[]>([]);

  ngOnInit() {
    // Una sola llamada agregada (categorías + rutas + cursos) en vez de 3
    // requests que pagaban cada uno el arranque en frío de la BD.
    this.homeSvc.getHome().subscribe(home => {
      this.categories.set(home.categories);
      this.learningPaths.set(home.learning_paths.data);
      this.featuredCourses.set(home.courses.data);
    });
  }

  difficultyLabel(d: string): string {
    const map: Record<string, string> = {
      beginner: 'Principiante', intermediate: 'Intermedio',
      advanced: 'Avanzado', expert: 'Experto',
    };
    return map[d] ?? d;
  }

  getCategoryEmoji(slug: string): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡', 'algoritmos': '⚡',
      'poo': '🧩', 'bases-de-datos': '🗄️',
      'redes': '🌐', 'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳', 'desarrollo-web': '🕸️',
      'desarrollo-backend': '⚙️', 'desarrollo-frontend': '🎨',
      'devops': '🐳', 'git': '🌿',
      'ingenieria-software': '📋', 'ia-desarrollo': '🤖',
    };
    return map[slug] ?? '📚';
  }

  getCourseEmoji(course: Course): string {
    return this.getCategoryEmoji(course.category?.slug ?? '');
  }

  getPathEmoji(path: LearningPath): string {
    return this.getCategoryEmoji(path.category?.slug ?? '');
  }

  getPathGradient(path: LearningPath): string {
    const color = path.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, ${color}44, ${color}22)`;
  }
}
