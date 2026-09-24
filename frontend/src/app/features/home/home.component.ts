import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, SlicePipe } from '@angular/common';
import { LearningPathsService } from '../../core/services/learning-paths.service';
import { CoursesService } from '../../core/services/courses.service';
import { CategoriesService } from '../../core/services/categories.service';
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
          <div class="hero__badge">
            <span class="badge badge-accent">🚀 Plataforma de Programación</span>
          </div>
          <h1 class="hero__title">
            Aprende <span>Programación.</span><br>
            Domina tu carrera.
          </h1>
          <p class="hero__subtitle">
            Rutas de aprendizaje estructuradas y cursos interactivos para
            estudiantes de Ingeniería de Sistemas. Con un asistente de IA
            disponible en todo momento.
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

        <div class="grid-3">
          @for (path of learningPaths(); track path.id) {
            <a [routerLink]="['/rutas', path.slug]" class="path-card">
              <div class="path-card__header" [style.background]="getPathGradient(path)">
                <div class="path-card__category" *ngIf="path.category">{{ path.category.name }}</div>
                <div [class]="'badge badge-' + path.difficulty" style="align-self:flex-start;">
                  {{ difficultyLabel(path.difficulty) }}
                </div>
              </div>
              <div class="path-card__body">
                <h3>{{ path.title }}</h3>
                <p>{{ path.description | slice:0:100 }}{{ path.description.length > 100 ? '...' : '' }}</p>
                <div class="path-card__meta">
                  <span>📚 {{ path.courses_count ?? 0 }} cursos</span>
                  <span>⏱ {{ path.estimated_hours }}h estimadas</span>
                  <span>{{ (path.levels?.length ?? 0) }} niveles</span>
                </div>
              </div>
              <div class="path-card__footer">
                <span class="btn btn-outline btn-sm">Ver Ruta →</span>
              </div>
            </a>
          }

          @if (learningPaths().length === 0) {
            @for (i of [1,2,3]; track i) {
              <div class="path-card skeleton" style="height: 280px;"></div>
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

    <!-- AI BANNER -->
    <section class="ai-banner">
      <div class="container">
        <div class="ai-banner__inner">
          <div class="ai-banner__content">
            <div class="ai-banner__icon">🤖</div>
            <div>
              <h2>Tu Asistente de IA personal</h2>
              <p>Pregunta cualquier duda de programación, pide que te expliquen un concepto, pide ayuda para debuggear tu código, o simplemente conversa sobre tecnología.</p>
            </div>
          </div>
          <a routerLink="/asistente" class="btn btn-accent btn-lg">
            Hablar con el Asistente →
          </a>
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

      &__badge { margin-bottom: var(--sp-5); }

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

    /* PATH CARDS */
    .path-card {
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

      &__header {
        height: 80px;
        padding: var(--sp-4);
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      &__category {
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        color: rgba(255,255,255,0.7);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      &__body {
        flex: 1;
        padding: var(--sp-5);

        h3 {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--sp-2);
        }

        p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--sp-4);
        }
      }

      &__meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-3);
        font-size: var(--text-xs);
        color: var(--text-muted);
      }

      &__footer {
        padding: var(--sp-4) var(--sp-5);
        border-top: 1px solid var(--border);
      }
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

    /* AI BANNER */
    .ai-banner {
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: var(--sp-12) 0;

      &__inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--sp-8);
        padding: var(--sp-8);
        background: linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,217,255,0.05));
        border: 1px solid rgba(108,99,255,0.2);
        border-radius: var(--radius-xl);

        @media (max-width: 768px) {
          flex-direction: column;
          text-align: center;
        }
      }

      &__content {
        display: flex;
        align-items: center;
        gap: var(--sp-6);
      }

      &__icon {
        font-size: 3rem;
        flex-shrink: 0;
      }

      h2 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin-bottom: var(--sp-2);
      }

      p {
        color: var(--text-secondary);
        max-width: 500px;
        line-height: 1.6;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private learningPathsSvc = inject(LearningPathsService);
  private coursesSvc       = inject(CoursesService);
  private categoriesSvc    = inject(CategoriesService);

  learningPaths  = signal<LearningPath[]>([]);
  featuredCourses = signal<Course[]>([]);
  categories     = signal<Category[]>([]);

  ngOnInit() {
    this.categoriesSvc.getAll().subscribe(cats => this.categories.set(cats));

    this.learningPathsSvc.getAll({ per_page: 3 } as never).subscribe(res =>
      this.learningPaths.set(res.data)
    );

    this.coursesSvc.getAll({ independent: true, per_page: 4 } as never).subscribe(res =>
      this.featuredCourses.set(res.data)
    );
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
    };
    return map[slug] ?? '📚';
  }

  getCourseEmoji(course: Course): string {
    return this.getCategoryEmoji(course.category?.slug ?? '');
  }

  getPathGradient(path: LearningPath): string {
    const color = path.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, ${color}44, ${color}22)`;
  }
}
