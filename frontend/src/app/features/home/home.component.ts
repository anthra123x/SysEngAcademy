import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, SlicePipe } from '@angular/common';
import { HomeService } from '../../core/services/home.service';
import { LearningPath, Course, Category } from '../../core/models';

interface SnakeStop {
  path: LearningPath;
  color: string;   // color de la categoría (identidad del nodo)
  name: string;    // nombre de la categoría
  emoji: string;
  right: boolean;  // si el stop va del lado derecho del serpentín
  num: number;     // posición en el recorrido (01..09)
  delay: number;   // stagger de entrada (s)
}

interface SnakeRow { stops: SnakeStop[]; }

interface SnakeSeg {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;   // color de la categoría destino
  len: number;     // longitud en px (para draw-in)
  delay: number;   // retardo de dibujado (s)
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, SlicePipe],
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

    <!-- LEARNING PATHS (serpentine por categoría) -->
    <section class="section paths-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>🗺️</span> Línea de Tiempo Profesional
          </div>
          <h2 class="section-title">Rutas de <span>Aprendizaje Interactivas</span></h2>
          <p class="section-subtitle">Sigue la trayectoria paso a paso desde los fundamentos hasta especializaciones avanzadas con retroalimentación en tiempo real.</p>
        </div>

        @if (learningPaths().length === 0) {
          <div class="snake snake--loading" aria-hidden="true">
            @for (i of [0,1,2]; track i) {
              <div class="snake__row">
                @for (j of [0,1]; track j) {
                  <div class="snake__stop" [class.snake__stop--left]="j === 0" [class.snake__stop--right]="j === 1">
                    <div class="snake__node skeleton"></div>
                    <div class="snake__card skeleton" style="height:172px;"></div>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="snake" #snakeWrap [class.snake--visible]="snakeVisible()">
            <svg class="snake__svg" aria-hidden="true">
              @for (seg of snakeSegments(); track $index) {
                <line class="snake__seg"
                  [attr.x1]="seg.x1" [attr.y1]="seg.y1"
                  [attr.x2]="seg.x2" [attr.y2]="seg.y2"
                  [attr.stroke]="seg.color"
                  [style.--len]="seg.len + 'px'"
                  [style.--d]="seg.delay + 's'" />
              }
              <circle class="snake__motion" r="4.5"></circle>
            </svg>

            @for (row of snakeRows(); track $index) {
              <div class="snake__row">
                @for (stop of row.stops; track stop.path.id) {
                  <div class="snake__stop"
                       [class.snake__stop--left]="!stop.right"
                       [class.snake__stop--right]="stop.right"
                       [style.--c]="stop.color"
                       [style.--d]="stop.delay + 's'">
                    <div class="snake__node"
                         [style.background]="getPathGradient(stop.path)"
                         [style.border-color]="stop.color">
                      <span class="snake__emoji">{{ stop.emoji }}</span>
                      <span class="snake__num">{{ ('0' + stop.num).slice(-2) }}</span>
                    </div>
                    <a [routerLink]="['/rutas', stop.path.slug]" class="snake__card">
                      <div class="snake__card-top">
                        <span class="snake__category">{{ stop.name }}</span>
                        <span [class]="'badge badge-' + stop.path.difficulty">{{ difficultyLabel(stop.path.difficulty) }}</span>
                      </div>
                      <h3 class="snake__title">{{ stop.path.title }}</h3>
                      <p class="snake__desc">{{ stop.path.description | slice:0:118 }}{{ stop.path.description.length > 118 ? '…' : '' }}</p>
                      <div class="snake__meta">
                        <span>📚 {{ stop.path.courses_count ?? 0 }} cursos</span>
                        <span>·</span>
                        <span>⏱ {{ stop.path.estimated_hours }}h estimadas</span>
                      </div>
                      <span class="snake__cta">Explorar Ruta →</span>
                    </a>
                  </div>
                }
              </div>
            }
          </div>
        }

        <div class="section-cta">
          <a routerLink="/rutas" class="btn btn-outline">Ver todas las rutas de ingeniería →</a>
        </div>
      </div>
    </section>

    <!-- FEATURED COURSES (Platzi / Udemy Style) -->
    <section class="section courses-section">
      <div class="container">
        <div class="section-header">
          <div class="section-eyebrow">
            <span>⚡</span> Formación Práctica y Flexible
          </div>
          <h2 class="section-title">Catálogo de <span>Cursos Destacados</span></h2>
          <p class="section-subtitle">Aprende tecnologías demandadas con proyectos paso a paso, retos interactivos evaluados por IA y debates comunitarios.</p>
        </div>

        <!-- Filter category pills -->
        <div class="course-filter-strip">
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'all'"
            (click)="setCategoryFilter('all')"
          >
            ⚡ Todos los Cursos
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'programacion-basica'"
            (click)="setCategoryFilter('programacion-basica')"
          >
            💡 Fundamentos
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'poo'"
            (click)="setCategoryFilter('poo')"
          >
            🧩 POO & Python
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'desarrollo-web' || selectedCategory() === 'desarrollo-frontend'"
            (click)="setCategoryFilter('desarrollo-frontend')"
          >
            🌐 Web & Frontend
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'desarrollo-backend'"
            (click)="setCategoryFilter('desarrollo-backend')"
          >
            ⚙️ Backend & APIs
          </button>
          <button
            type="button"
            class="filter-pill"
            [class.is-active]="selectedCategory() === 'bases-de-datos'"
            (click)="setCategoryFilter('bases-de-datos')"
          >
            🗄️ SQL & Datos
          </button>
        </div>

        <!-- Course Cards Grid -->
        <div class="courses-grid-cards">
          @for (course of displayedCourses(); track course.id) {
            <a [routerLink]="['/cursos', course.slug]" class="udemy-course-card">
              <div class="card-thumb">
                <span class="card-thumb__emoji">{{ getCourseEmoji(course) }}</span>
                @if (course.is_free) {
                  <span class="card-thumb__free">GRATIS</span>
                }
                <div class="card-thumb__category">
                  {{ course.category?.name ?? 'Curso' }}
                </div>
              </div>

              <div class="card-body">
                <div class="card-tags-row">
                  <span [class]="'badge badge-' + course.difficulty">{{ difficultyLabel(course.difficulty) }}</span>
                  <span class="rating-badge">★ 4.9 <small>(1.4k+)</small></span>
                </div>

                <h3 class="card-title">{{ course.title }}</h3>
                <p class="card-desc">{{ course.description | slice:0:110 }}...</p>

                <!-- Value features checklist -->
                <div class="card-features">
                  <span>💻 Retos con IA</span>
                  <span>❓ Quizzes</span>
                  <span>💬 Foro activo</span>
                </div>

                <div class="card-footer">
                  <div class="meta-stats">
                    <span>⏱ {{ course.duration_hours }}h</span>
                    <span>·</span>
                    <span>📚 {{ course.modules?.length ?? 3 }} módulos</span>
                  </div>
                  <span class="card-cta">Explorar →</span>
                </div>
              </div>
            </a>
          }

          @if (featuredCourses().length === 0) {
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="udemy-course-card skeleton" style="height: 340px;"></div>
            }
          }
        </div>

        <div class="section-cta">
          <a routerLink="/cursos" class="btn btn-primary btn-lg">Explorar catálogo completo de cursos →</a>
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
      background: radial-gradient(ellipse 80% 60% at 50% -20%, rgba(10,233,138,0.06) 0%, transparent 70%);

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

    /* SNAKE ROADMAP (Rutas de Aprendizaje) */
    .snake {
      position: relative;
      padding: var(--sp-4) 0 var(--sp-2);
      overflow: hidden;
    }

    .snake__svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
      overflow: visible;
    }

    .snake__seg {
      stroke-width: 3;
      stroke-linecap: round;
      opacity: 0.5;
      stroke-dasharray: var(--len, 0);
      stroke-dashoffset: var(--len, 0);
    }

    .snake--visible .snake__seg {
      animation: snake-draw 0.8s ease forwards;
      animation-delay: var(--d, 0s);
    }

    @keyframes snake-draw {
      to { stroke-dashoffset: 0; }
    }

    .snake__motion {
      fill: var(--accent);
      filter: drop-shadow(0 0 6px var(--accent));
      opacity: 0;
    }

    .snake--visible .snake__motion {
      opacity: 1;
      animation: snake-flow 6s linear infinite;
      animation-delay: 1.4s;
    }

    @keyframes snake-flow {
      from { offset-distance: 0%; }
      to   { offset-distance: 100%; }
    }

    .snake__row {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 96px 1fr;
      grid-auto-flow: dense;
      align-items: center;
      padding: var(--sp-6) 0;
    }

    .snake__stop {
      display: flex;
      align-items: center;
      gap: var(--sp-5);
      opacity: 0;
    }

    .snake--visible .snake__stop {
      animation: snake-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
      animation-delay: var(--d, 0s);
    }

    @keyframes snake-rise {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .snake__stop--left {
      grid-column: 1;
      justify-self: end;
      flex-direction: row-reverse;
    }

    .snake__stop--right {
      grid-column: 3;
      justify-self: start;
      flex-direction: row;
    }

    .snake__node {
      position: relative;
      flex: 0 0 auto;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 4px var(--bg-base), 0 8px 20px rgba(0, 0, 0, 0.18);
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      cursor: default;
    }

    .snake__emoji {
      font-size: 1.35rem;
      line-height: 1;
    }

    .snake__num {
      position: absolute;
      top: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%);
      padding: 1px 7px;
      border-radius: 999px;
      background: var(--bg-base);
      border: 1px solid var(--border);
      font-family: var(--font-mono);
      font-size: 10px;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .snake__stop:hover .snake__node {
      transform: scale(1.1);
      box-shadow: 0 0 0 4px var(--bg-base), 0 0 22px color-mix(in srgb, var(--c, var(--primary)) 55%, transparent);
    }

    .snake__card {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      width: min(100%, 480px);
      padding: var(--sp-5) var(--sp-5) var(--sp-4);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      overflow: hidden;
      transition: all var(--transition-base);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--c, var(--primary)), transparent 72%);
        opacity: 0.95;
      }

      &:hover {
        border-color: color-mix(in srgb, var(--c, var(--primary)) 45%, var(--border));
        box-shadow: var(--shadow-primary);
        transform: translateY(-4px);

        .snake__cta { color: var(--c, var(--primary)); gap: 8px; }
      }
    }

    .snake__card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-2);
      margin-bottom: var(--sp-1);
    }

    .snake__category {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;

      &::before {
        content: '';
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--c, var(--primary));
        box-shadow: 0 0 8px var(--c, var(--primary));
      }
    }

    .snake__title {
      font-size: var(--text-lg);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      line-height: 1.25;
    }

    .snake__desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .snake__meta {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--sp-1);
    }

    .snake__cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--text-secondary);
      transition: all var(--transition-fast);
      margin-top: var(--sp-1);
    }

    .snake--loading .snake__row {
      grid-template-columns: 1fr 96px 1fr;
    }

    .snake--loading .snake__stop {
      opacity: 1;
    }

    .snake--loading .snake__node {
      border-color: transparent;
    }

    .snake--loading .snake__card::before {
      display: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .snake__seg { animation: none; stroke-dashoffset: 0; }
      .snake__motion { display: none; }
      .snake__stop { opacity: 1; animation: none; }
    }

    @media (max-width: 920px) {
      .snake__row {
        display: flex;
        flex-direction: column;
        gap: 28px;
        padding: 20px 0;
      }

      .snake__stop,
      .snake__stop--left,
      .snake__stop--right {
        width: 100%;
        grid-column: auto;
        justify-self: auto;
        flex-direction: row;
        gap: var(--sp-4);
      }

      .snake__node { width: 42px; height: 42px; }
      .snake__emoji { font-size: 1.05rem; }
      .snake__card { width: 100%; }
      .snake__num { top: calc(100% + 8px); font-size: 9px; }
    }

    /* FILTER PILLS STRIP (Udemy / Platzi Style) */
    .course-filter-strip {
      display: flex;
      gap: var(--sp-2);
      flex-wrap: wrap;
      margin-bottom: var(--sp-8);
      justify-content: center;
    }

    .filter-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 9999px;
      color: var(--text-secondary);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;

      &:hover {
        color: var(--text-primary);
        border-color: var(--primary);
        background: var(--bg-surface-2);
      }

      &.is-active {
        color: #08090D;
        background: var(--primary);
        border-color: var(--primary);
        box-shadow: 0 4px 16px rgba(10, 233, 138, 0.35);
      }
    }

    /* UDEMY / PLATZI COURSE CARDS GRID */
    .courses-grid-cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--sp-6);
    }

    .udemy-course-card {
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
        transform: translateY(-4px);
        border-color: var(--primary);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(10, 233, 138, 0.15);

        .card-cta {
          color: var(--primary);
          transform: translateX(4px);
        }
      }

      .card-thumb {
        position: relative;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(180deg, var(--bg-surface-2) 0%, var(--bg-surface) 100%);
        border-bottom: 1px solid var(--border);

        &__emoji { font-size: 2.75rem; }

        &__free {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--primary);
          color: #08090D;
          font-size: 10px;
          font-weight: var(--font-bold);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        &__category {
          position: absolute;
          bottom: 8px;
          left: 12px;
          font-size: 10px;
          font-weight: var(--font-semibold);
          color: var(--text-secondary);
          background: rgba(10, 10, 15, 0.7);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          backdrop-filter: blur(4px);
        }
      }

      .card-body {
        padding: var(--sp-4);
        display: flex;
        flex-direction: column;
        flex: 1;

        .card-tags-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--sp-2);

          .rating-badge {
            font-size: var(--text-xs);
            color: #ffb703;
            font-weight: var(--font-bold);
            small { color: var(--text-muted); font-weight: normal; }
          }
        }

        .card-title {
          font-size: var(--text-base);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--sp-2);
          line-height: 1.35;
        }

        .card-desc {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--sp-4);
          flex: 1;
        }

        .card-features {
          display: flex;
          gap: var(--sp-2);
          flex-wrap: wrap;
          padding: var(--sp-2) 0;
          border-top: 1px solid rgba(42, 42, 62, 0.4);
          margin-bottom: var(--sp-3);

          span {
            font-size: 10px;
            color: var(--text-muted);
            background: var(--bg-surface-2);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--sp-2);
          border-top: 1px solid rgba(42, 42, 62, 0.4);

          .meta-stats {
            font-size: 11px;
            color: var(--text-muted);
            display: flex;
            gap: 4px;
          }

          .card-cta {
            font-size: var(--text-xs);
            font-weight: var(--font-semibold);
            color: var(--text-secondary);
            transition: all var(--transition-fast);
          }
        }
      }
    }

    /* SECTION UTILS */
    .section-cta {
      text-align: center;
      margin-top: var(--sp-10);
    }

    .paths-section {
      background: linear-gradient(180deg, transparent, rgba(10,233,138,0.02), transparent);
    }
  `]
})
export class HomeComponent implements OnInit {
  private homeSvc = inject(HomeService);

  learningPaths   = signal<LearningPath[]>([]);
  featuredCourses = signal<Course[]>([]);
  categories      = signal<Category[]>([]);
  selectedCategory = signal<string>('all');

  displayedCourses = computed(() => {
    const cat = this.selectedCategory();
    const courses = this.featuredCourses();
    if (cat === 'all') return courses;
    return courses.filter(c => {
      const cSlug = c.category?.slug ?? '';
      if (cat === 'desarrollo-frontend') {
        return cSlug === 'desarrollo-frontend' || cSlug === 'desarrollo-web';
      }
      return cSlug === cat;
    });
  });

  setCategoryFilter(slug: string) {
    this.selectedCategory.set(slug);
  }

  snakeRows       = signal<SnakeRow[]>([]);
  snakeSegments   = signal<SnakeSeg[]>([]);
  snakeVisible    = signal(false);
  @ViewChild('snakeWrap') snakeWrap?: ElementRef<HTMLElement>;

  private resizeObs?: ResizeObserver;
  private intersectObs?: IntersectionObserver;

  ngOnInit() {
    // Una sola llamada agregada (categorías + rutas + cursos) en vez de 3
    // requests que pagaban cada uno el arranque en frío de la BD.
    this.homeSvc.getHome().subscribe(home => {
      this.categories.set(home.categories);
      this.learningPaths.set(home.learning_paths.data);
      this.featuredCourses.set(home.courses.data);
      this.snakeRows.set(this.buildSnake(home.learning_paths.data));
      // Esperar a que Angular pinte los nodos antes de medir la ruta.
      setTimeout(() => this.measureSnake(), 0);
    });
  }

  /** Agrupa las rutas en filas de 2 alternando el orden por fila: el patrón serpiente clásico
   *  (fila impar L→R, fila par R→L) para que la línea baje en vertical por los laterales. */
  private buildSnake(paths: LearningPath[]): SnakeRow[] {
    const rows: SnakeRow[] = [];
    for (let i = 0; i < paths.length; i += 2) {
      const rowIdx = rows.length;
      const stops: SnakeStop[] = paths.slice(i, i + 2).map((p, li) => {
        const gi = i + li;
        return {
          path: p,
          color: p.category?.color ?? '#6C63FF',
          name: p.category?.name ?? 'Ruta',
          emoji: this.getPathEmoji(p),
          right: rowIdx % 2 === 0 ? li === 1 : li === 0,
          num: gi + 1,
          delay: Math.round(gi * 0.09 * 10) / 10,
        };
      });
      rows.push({ stops });
    }
    return rows;
  }

  /**
   * Mide el centro real de cada nodo (getBoundingClientRect) y genera:
   *  - los segmentos SVG que unen las estaciones en orden (el "snake"),
   *  - la polyline para la partícula animada (offset-path),
   *  - los observers de intersección (dibuja la serpiente al hacer scroll)
   *    y de resize (recalcula al cambiar el viewport).
   */
  private measureSnake() {
    const wrap = this.snakeWrap?.nativeElement;
    if (!wrap || this.snakeRows().length === 0) return;
    const nodes = Array.from(wrap.querySelectorAll<HTMLElement>('.snake__node'));
    if (nodes.length === 0) return;

    const wrapRect = wrap.getBoundingClientRect();
    const pts = nodes.map(n => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - wrapRect.left, y: r.top + r.height / 2 - wrapRect.top };
    });

    const segs: SnakeSeg[] = [];
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    for (let i = 1; i < pts.length; i++) {
      const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segs.push({
        x1: pts[i - 1].x, y1: pts[i - 1].y,
        x2: pts[i].x,     y2: pts[i].y,
        color: getComputedStyle(nodes[i]).getPropertyValue('--c').trim() || '#6C63FF',
        len: Math.round(len * 10) / 10,
        delay: Math.round(i * 0.12 * 10) / 10,
      });
    }
    this.snakeSegments.set(segs);

    const dot = wrap.querySelector<SVGCircleElement>('.snake__motion');
    if (dot && d.length > 2) {
      dot.style.setProperty('offset-path', `path('${d}')`);
    }

    if (!this.resizeObs) {
      this.resizeObs = new ResizeObserver(() => this.measureSnake());
      this.resizeObs.observe(wrap);
      this.intersectObs = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.snakeVisible.set(true);
          this.intersectObs?.disconnect();
        }
      }, { threshold: 0.12 });
      this.intersectObs.observe(wrap);
    }
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
