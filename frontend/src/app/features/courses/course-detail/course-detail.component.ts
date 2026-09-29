import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course, CourseModule, Lesson } from '../../../core/models';
import { CourseForumComponent } from '../course-forum/course-forum.component';

@Component({
  selector: 'app-course-detail',
  imports: [RouterLink, CourseForumComponent],
  template: `
    @if (loading()) {
      <div class="container" style="padding: var(--sp-16) 0; text-align: center;">
        <div class="skeleton" style="height:320px; border-radius: var(--radius-lg); margin-bottom: var(--sp-8);"></div>
        <div class="skeleton" style="height:500px; border-radius: var(--radius-lg);"></div>
      </div>
    } @else if (course()) {
      <div class="course-detail">
        <div class="container course-layout">
          <!-- Main Content Column -->
          <main class="course-main-content">
            <!-- Breadcrumb Navigation -->
            <nav class="course-breadcrumb" aria-label="Navegación del curso">
              <a routerLink="/cursos">Cursos</a>
              <span class="sep">/</span>
              @if (course()!.category) {
                <span class="category-tag">
                  {{ course()!.category!.name }}
                </span>
                <span class="sep">/</span>
              }
              <span class="current">{{ course()!.title }}</span>
            </nav>

            <!-- Course Header (Platzi-inspired metadata & clear hierarchy) -->
            <header class="course-header">
              <div class="course-header__badges">
                @if (course()!.category) {
                  <span class="badge badge-primary">
                    {{ course()!.category!.name }}
                  </span>
                }
                <span [class]="'badge badge-' + course()!.difficulty">{{ diffLabel(course()!.difficulty) }}</span>
                <span class="badge badge-docs">100% Práctico</span>
              </div>

              <h1 class="course-title">{{ course()!.title }}</h1>

              <!-- Platzi-inspired Metrics & Ratings Strip -->
              <div class="course-metrics-strip">
                <div class="metric-item metric-rating">
                  <span class="star-icon">★</span>
                  <span class="rating-score">4.9</span>
                  <span class="rating-count">({{ ratingCount() }} opiniones)</span>
                </div>
                <span class="metric-divider">·</span>
                <div class="metric-item">
                  <span class="metric-icon">📚</span>
                  <span><strong>{{ course()!.modules?.length ?? 0 }}</strong> módulos</span>
                </div>
                <span class="metric-divider">·</span>
                <div class="metric-item">
                  <span class="metric-icon">📖</span>
                  <span><strong>{{ course()!.lessons_count ?? 0 }}</strong> lecciones</span>
                </div>
                <span class="metric-divider">·</span>
                <div class="metric-item">
                  <span class="metric-icon">⏱</span>
                  <span><strong>{{ course()!.duration_hours }}h</strong> de práctica</span>
                </div>
                @if (totalChallenges() > 0) {
                  <span class="metric-divider">·</span>
                  <div class="metric-item">
                    <span class="metric-icon">💻</span>
                    <span><strong>{{ totalChallenges() }}</strong> retos en vivo</span>
                  </div>
                }
              </div>

              <p class="course-desc">{{ course()!.description }}</p>
            </header>

            <!-- Navigation Tabs: Temario & Foro -->
            <div class="content-nav-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                class="content-tab-btn"
                [class.is-active]="activeTab() === 'curriculum'"
                [attr.aria-selected]="activeTab() === 'curriculum'"
                (click)="setTab('curriculum')"
              >
                <span class="tab-btn__icon">📚</span>
                <span class="tab-btn__text">Temario y Contenido</span>
                <span class="tab-btn__badge">{{ course()!.modules?.length ?? 0 }}</span>
              </button>
              <button
                type="button"
                role="tab"
                class="content-tab-btn"
                [class.is-active]="activeTab() === 'forum'"
                [attr.aria-selected]="activeTab() === 'forum'"
                (click)="setTab('forum')"
              >
                <span class="tab-btn__icon">💬</span>
                <span class="tab-btn__text">Foro y Discusiones</span>
                <span class="tab-btn__pill">Comunidad & Soluciones</span>
              </button>
            </div>

            @if (activeTab() === 'curriculum') {
              <!-- Learning Objectives Highlights -->
              <section class="highlights-card">
                <div class="highlights-card__head">
                  <span class="highlights-icon">🎯</span>
                  <div>
                    <h2>Lo que dominarás en este curso</h2>
                    <p>Metodología autodidacta guiada: lectura técnica exhaustiva, práctica interactiva y asistencia IA.</p>
                  </div>
                </div>
                <div class="highlights-grid">
                  <div class="highlight-item">
                    <span class="hi-check">✓</span>
                    <span>Documentación técnica detallada con ejemplos prácticos y sintaxis explicada a fondo.</span>
                  </div>
                  <div class="highlight-item">
                    <span class="hi-check">✓</span>
                    <span>Retos de programación con consola y evaluación automática en servidores SysEng.</span>
                  </div>
                  <div class="highlight-item">
                    <span class="hi-check">✓</span>
                    <span>Evaluaciones formativas (quizzes) por módulo para afianzar conceptos clave.</span>
                  </div>
                  <div class="highlight-item">
                    <span class="hi-check">✓</span>
                    <span>Asistencia con Inteligencia Artificial (Byte) para resolver dudas en cada tema.</span>
                  </div>
                </div>
              </section>

              <!-- Platzi-inspired Syllabus Section -->
              <section class="syllabus-section">
                <div class="syllabus-header">
                  <div class="syllabus-header__info">
                    <span class="section-tag">Contenido del Curso</span>
                    <h2>Temario Detallado</h2>
                    <p class="syllabus-subtitle">
                      {{ course()!.modules?.length ?? 0 }} módulos estructurados en orden secuencial · {{ course()!.lessons_count ?? 0 }} clases prácticas
                    </p>
                  </div>

                  <div class="syllabus-header__actions">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="toggleAllModules()">
                      {{ allExpanded() ? 'Colapsar módulos' : 'Expandir todos' }}
                    </button>
                  </div>
                </div>

                <!-- Syllabus Modules List -->
                <div class="syllabus-modules">
                  @for (mod of course()!.modules ?? []; track mod.id; let idx = $index) {
                    <div class="syllabus-module" [class.is-open]="isModuleOpen(mod.id)">
                      <!-- Module Head -->
                      <header class="syllabus-module__head" (click)="toggleModule(mod.id)">
                        <div class="sm-head__left">
                          <span class="sm-index-badge">Módulo {{ idx + 1 }}</span>
                          <div class="sm-title-group">
                            <h3 class="sm-title">{{ mod.title }}</h3>
                            <span class="sm-meta">
                              {{ mod.lessons?.length ?? 0 }} clases · {{ moduleDuration(mod) }} min de práctica
                              @if (isModuleCompleted(mod)) {
                                <span class="sm-completed-tag">· Completado ✓</span>
                              }
                            </span>
                          </div>
                        </div>

                        <div class="sm-head__right">
                          <span class="chevron" [class.is-rotated]="isModuleOpen(mod.id)">▾</span>
                        </div>
                      </header>

                      <!-- Lessons List (Clean Platzi rows) -->
                      @if (isModuleOpen(mod.id)) {
                        <div class="syllabus-lessons">
                          @for (lesson of mod.lessons ?? []; track lesson.id; let lIdx = $index) {
                            <a [routerLink]="auth.isAuthenticated() ? ['/cursos', course()!.slug, 'leccion', lesson.slug] : null"
                               (click)="onLessonClick($event, lesson)"
                               class="syllabus-lesson"
                               [class.is-completed]="lesson.completed"
                               [class.is-locked-guest]="!auth.isAuthenticated()">
                              <div class="sl-left">
                                <span class="sl-num" [class.is-completed]="lesson.completed">
                                  @if (!auth.isAuthenticated()) {
                                    🔒
                                  } @else if (lesson.completed) {
                                    ✓
                                  } @else {
                                    {{ lIdx + 1 }}
                                  }
                                </span>
                                <div class="sl-info">
                                  <h4 class="sl-title">{{ lesson.title }}</h4>
                                  <div class="sl-tags">
                                    <span class="sl-type-badge" [class]="'type--' + lesson.type">
                                      {{ lessonTypeBadge(lesson.type) }}
                                    </span>
                                    @if (!auth.isAuthenticated()) {
                                      <span class="sl-free-tag sl-lock-tag">Requiere Cuenta</span>
                                    } @else if (lesson.is_preview) {
                                      <span class="sl-free-tag">Acceso libre</span>
                                    }
                                  </div>
                                </div>
                              </div>

                              <div class="sl-right">
                                <span class="sl-duration">⏱ {{ lesson.duration_minutes || 10 }} min</span>
                                <span class="sl-arrow">{{ auth.isAuthenticated() ? '→' : '🔒' }}</span>
                              </div>
                            </a>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              </section>
            } @else {
              <app-course-forum
                [courseSlug]="course()!.slug"
                [modules]="course()!.modules ?? []"
                [initialModuleId]="forumModuleId()"
              />
            }
          </main>

          <!-- RIGHT STICKY SIDEBAR (Platzi-inspired Action & Methodology Card) -->
          <aside class="course-sidebar">
            <div class="sidebar-sticky-wrapper">
              <!-- Primary Action / Access Card -->
              <div class="action-card">
                @if (!auth.isAuthenticated()) {
                  <div class="auth-gate-box">
                    <div class="gate-icon-wrap">🔒</div>
                    <h3 class="gate-title">Contenido Exclusivo</h3>
                    <p class="gate-desc">
                      Inicia sesión o regístrate para acceder al reproductor interactivo, terminal Linux en la nube y retos de código.
                    </p>
                    <a routerLink="/auth/registro" class="btn btn-primary btn-block btn-lg">
                      Crear Cuenta Gratuita →
                    </a>
                    <a routerLink="/auth/login" class="btn btn-outline btn-block" style="margin-top: 8px;">
                      Iniciar Sesión
                    </a>
                  </div>
                } @else if (course()!.enrolled) {
                  <div class="enrolled-progress">
                    <div class="progress-label">
                      <span class="progress-title">Tu progreso en el curso</span>
                      <span class="progress-value">{{ course()!.progress_percent ?? 0 }}%</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress-bar__fill" [style.width]="(course()!.progress_percent ?? 0) + '%'"></div>
                    </div>
                    <span class="progress-sub">
                      {{ completedLessonsCount() }} de {{ course()!.lessons_count ?? 0 }} lecciones completadas
                    </span>
                  </div>

                  @if (continueLessonSlug()) {
                    <a [routerLink]="['/cursos', course()!.slug, 'leccion', continueLessonSlug()]" class="btn btn-primary btn-block btn-lg">
                      Continuar Curso →
                    </a>
                  } @else {
                    <button class="btn btn-primary btn-block btn-lg" (click)="goToFirstLesson()">
                      Ir a la primera lección →
                    </button>
                  }
                } @else {
                  <button class="btn btn-primary btn-block btn-lg" (click)="goToFirstLesson()">
                    Empezar a Aprender →
                  </button>
                }
              </div>

              <!-- Methodology Card (Documentation-first) -->
              <div class="methodology-card">
                <div class="methodology-card__header">
                  <span class="m-icon">⚡</span>
                  <div>
                    <h3 class="m-title">Metodología SysEng</h3>
                    <p class="m-sub">Aprendizaje guiado por documentación técnica y práctica activa</p>
                  </div>
                </div>

                <ul class="methodology-list">
                  <li class="m-item">
                    <span class="m-item__icon">📖</span>
                    <div class="m-item__content">
                      <strong>Documentación Profunda</strong>
                      <p>Lecturas técnicas estructuradas y detalladas, sin videos pasivos que te quiten tiempo.</p>
                    </div>
                  </li>
                  <li class="m-item">
                    <span class="m-item__icon">🤖</span>
                    <div class="m-item__content">
                      <strong>Tutor IA (Byte)</strong>
                      <p>Explicaciones en streaming y asistencia adaptativa a tus dudas en cada lección.</p>
                    </div>
                  </li>
                  <li class="m-item">
                    <span class="m-item__icon">💻</span>
                    <div class="m-item__content">
                      <strong>Retos de Código</strong>
                      <p>Entorno interactivo con terminal y evaluación automatizada en servidor.</p>
                    </div>
                  </li>
                  <li class="m-item">
                    <span class="m-item__icon">❓</span>
                    <div class="m-item__content">
                      <strong>Quizzes de Consolidación</strong>
                      <p>Preguntas al final de cada módulo para certificar tu comprensión técnica.</p>
                    </div>
                  </li>
                  <li class="m-item">
                    <span class="m-item__icon">🏆</span>
                    <div class="m-item__content">
                      <strong>Certificado de Finalización</strong>
                      <p>Acreditación al aprobar todos los módulos y retos del curso.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Course Skills / Topics Card -->
              @if (courseSkills().length > 0) {
                <div class="skills-card">
                  <h4 class="skills-card__title">Conceptos que dominarás</h4>
                  <div class="skills-tags">
                    @for (skill of courseSkills(); track skill) {
                      <span class="skill-tag">{{ skill }}</span>
                    }
                  </div>
                </div>
              }

            </div>
          </aside>
        </div>
      </div>

      <!-- Auth Gate Modal -->
      @if (showAuthModal()) {
        <div class="modal-backdrop" (click)="showAuthModal.set(false)">
          <div class="auth-gate-modal" (click)="$event.stopPropagation()">
            <button type="button" class="modal-close-btn" (click)="showAuthModal.set(false)">✕</button>
            <div class="gate-modal-icon">🔐</div>
            <h2>Acceso exclusivo para estudiantes</h2>
            <p>
              Para acceder a las lecciones prácticas, terminal interactiva en la nube, retos de código con evaluación automática y guardar tu progreso con insignias, necesitas una cuenta en <strong>SysEng Academy</strong>.
            </p>
            <div class="modal-gate-actions">
              <a routerLink="/auth/registro" class="btn btn-primary btn-block btn-lg" (click)="showAuthModal.set(false)">
                Crear Cuenta Gratuita →
              </a>
              <a routerLink="/auth/login" class="btn btn-outline btn-block" (click)="showAuthModal.set(false)">
                Ya tengo cuenta, Iniciar Sesión
              </a>
            </div>
          </div>
        </div>
      }
    } @else {
      <div class="container" style="padding: var(--sp-20) var(--sp-4); text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--sp-12); max-width: 520px; width: 100%; box-shadow: var(--shadow-xl);">
          <div style="font-size: 3.5rem; margin-bottom: var(--sp-4);">🔍</div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-3);">Curso no encontrado</h2>
          <p style="color: var(--text-secondary); margin-bottom: var(--sp-6); line-height: 1.6;">El curso al que intentas acceder no existe o no está disponible en este momento.</p>
          <div style="display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap;">
            <a routerLink="/cursos" class="btn btn-primary">Ver Catálogo de Cursos</a>
            <a routerLink="/rutas" class="btn btn-outline">Explorar Rutas</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .course-detail {
      padding-top: var(--sp-6);
      padding-bottom: var(--sp-20);
    }

    .course-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 360px;
      gap: var(--sp-10);
      align-items: start;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: var(--sp-8);
      }
    }

    .course-main-content {
      min-width: 0;
    }

    /* Course Breadcrumb */
    .course-breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      color: var(--text-muted);
      margin-bottom: var(--sp-4);
      flex-wrap: wrap;

      a {
        color: var(--text-muted);
        text-decoration: none;
        transition: color var(--transition-fast);
        &:hover { color: var(--primary); }
      }
      .sep { color: var(--border-hover); user-select: none; }
      .category-tag { font-weight: var(--font-semibold); }
      .current {
        color: var(--text-secondary);
        font-weight: var(--font-medium);
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    /* Course Header */
    .course-header {
      margin-bottom: var(--sp-8);

      &__badges {
        display: flex;
        gap: var(--sp-2);
        flex-wrap: wrap;
        margin-bottom: var(--sp-3);
      }
    }

    .badge-docs {
      background: rgba(0, 217, 255, 0.12);
      border: 1px solid rgba(0, 217, 255, 0.35);
      color: #00D9FF;
      font-weight: var(--font-medium);
    }

    .badge-free {
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.35);
      color: #00E676;
      font-weight: var(--font-bold);
    }

    .course-title {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.18;
      letter-spacing: -0.025em;
      margin-bottom: var(--sp-4);
      text-wrap: balance;
    }

    /* Platzi-inspired Metrics & Ratings Strip */
    .course-metrics-strip {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      padding: var(--sp-3) var(--sp-4);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      margin-bottom: var(--sp-5);

      .metric-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;

        strong {
          color: var(--text-primary);
          font-weight: var(--font-semibold);
        }
      }

      .metric-rating {
        color: #FFB800;
        font-weight: var(--font-bold);

        .star-icon {
          font-size: 1.05rem;
        }
        .rating-score {
          color: #FFB800;
          font-weight: var(--font-bold);
        }
        .rating-count {
          color: var(--text-muted);
          font-size: var(--text-xs);
          font-weight: var(--font-normal);
        }
      }

      .metric-divider {
        color: var(--border-hover);
        user-select: none;
      }
    }

    .course-desc {
      color: var(--text-secondary);
      font-size: var(--text-base);
      line-height: 1.7;
      margin-bottom: var(--sp-6);
    }

    .path-card-chip {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-4);
      background: linear-gradient(135deg, rgba(108, 99, 255, 0.08), rgba(0, 217, 255, 0.04));
      border: 1px solid rgba(108, 99, 255, 0.25);
      border-radius: var(--radius-lg);
      margin-bottom: var(--sp-6);

      .path-chip__icon {
        font-size: 1.4rem;
        flex-shrink: 0;
      }
      .path-chip__details {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .path-chip__subtitle {
        font-size: 0.72rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .path-chip__title {
        font-size: var(--text-sm);
        font-weight: var(--font-semibold);
        color: var(--accent);
        text-decoration: none;
        &:hover { text-decoration: underline; }
      }
    }

    /* ---------- SIDEBAR & ACTION CARDS ---------- */
    .course-sidebar {
      min-width: 0;
    }

    .sidebar-sticky-wrapper {
      position: sticky;
      top: calc(var(--header-height) + var(--sp-4));
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
    }

    .action-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-6);
      box-shadow: var(--shadow-lg), 0 0 24px rgba(108, 99, 255, 0.06);

      &__status {
        margin-bottom: var(--sp-4);

        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          letter-spacing: 0.04em;
          text-transform: uppercase;

          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          &.is-free {
            color: var(--success);
            .status-dot {
              background: var(--success);
              box-shadow: 0 0 8px var(--success);
            }
          }

          &.is-active {
            color: var(--accent);
            .status-dot {
              background: var(--accent);
              box-shadow: 0 0 8px var(--accent);
            }
          }
        }
      }
    }

    .btn-block {
      width: 100%;
      justify-content: center;
      display: flex;
      align-items: center;
    }

    .btn-lg {
      padding: 13px 20px;
      font-size: 0.95rem;
      font-weight: var(--font-bold);
      border-radius: var(--radius-lg);
    }

    .enrolled-progress {
      margin-bottom: var(--sp-4);

      .progress-label {
        display: flex;
        justify-content: space-between;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        margin-bottom: var(--sp-2);
      }

      .progress-title { font-weight: var(--font-medium); }
      .progress-value { font-family: var(--font-mono); color: var(--accent); font-weight: var(--font-bold); }

      .progress-bar {
        height: 6px;
        background: var(--bg-surface-3);
        border-radius: 99px;
        overflow: hidden;

        &__fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--accent));
          border-radius: 99px;
          transition: width 0.4s ease;
        }
      }

      .progress-sub {
        display: block;
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-top: 6px;
      }
    }

    .enroll-note {
      text-align: center;
      font-size: var(--text-xs);
      color: var(--text-muted);
      margin-top: var(--sp-3);
      line-height: 1.4;

      a { color: var(--primary); text-decoration: underline; }
    }

    .path-action-btn {
      margin-top: var(--sp-3);
      text-align: center;
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      padding: 8px 12px;
    }

    /* Methodology Card */
    .methodology-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-5) var(--sp-5);

      &__header {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-4);
        padding-bottom: var(--sp-3);
        border-bottom: 1px solid var(--border);

        .m-icon {
          font-size: 1.3rem;
        }
        .m-title {
          font-size: var(--text-sm);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }
        .m-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.3;
        }
      }
    }

    .methodology-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      margin: 0;
      padding: 0;

      .m-item {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-3);

        &__icon {
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 1px;
        }
        &__content {
          strong {
            display: block;
            font-size: var(--text-xs);
            font-weight: var(--font-semibold);
            color: var(--text-primary);
            line-height: 1.3;
          }
          p {
            font-size: 0.74rem;
            color: var(--text-muted);
            line-height: 1.35;
            margin-top: 1px;
          }
        }
      }
    }

    /* Skills Card */
    .skills-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-4) var(--sp-5);

      &__title {
        font-size: var(--text-xs);
        font-weight: var(--font-bold);
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: var(--sp-3);
      }

      .skills-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--sp-2);

        .skill-tag {
          font-size: 0.72rem;
          padding: 4px 8px;
          background: var(--bg-surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: var(--font-mono);
        }
      }
    }

    /* Community Card */
    .community-card {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4);
      background: var(--bg-surface-2);
      border: 1px dashed var(--border-hover);
      border-radius: var(--radius-lg);

      .comm-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
      }
      .comm-text {
        flex: 1;
        min-width: 0;
        strong {
          display: block;
          font-size: var(--text-xs);
          color: var(--text-primary);
        }
        p {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.3;
        }
      }
      .comm-btn {
        flex-shrink: 0;
        font-size: var(--text-xs);
        padding: 4px 10px;
      }
    }

    /* Content Nav Tabs */
    .content-nav-tabs {
      display: inline-flex;
      gap: var(--sp-2);
      padding: 6px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      margin-bottom: var(--sp-8);

      @media (max-width: 640px) {
        display: flex;
        width: 100%;
      }
    }

    .content-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-6);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-lg);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      user-select: none;

      @media (max-width: 640px) {
        flex: 1;
        justify-content: center;
        padding: var(--sp-3) var(--sp-3);
      }

      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.04);
      }

      &.is-active {
        background: var(--bg-surface);
        border-color: rgba(108, 99, 255, 0.45);
        color: var(--text-primary);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);

        .tab-btn__badge {
          background: rgba(108, 99, 255, 0.2);
          border-color: rgba(108, 99, 255, 0.35);
          color: var(--primary-hover);
        }
      }

      .tab-btn__icon {
        font-size: 1.15rem;
      }

      .tab-btn__badge {
        font-size: 0.72rem;
        font-family: var(--font-mono);
        padding: 2px 8px;
        background: var(--bg-surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-full);
        color: var(--text-muted);
        transition: all var(--transition-fast);
      }

      .tab-btn__pill {
        font-size: 0.68rem;
        font-weight: var(--font-semibold);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 8px;
        background: rgba(0, 217, 255, 0.12);
        color: var(--accent);
        border: 1px solid rgba(0, 217, 255, 0.28);
        border-radius: var(--radius-full);
      }
    }

    /* Highlights Card */
    .highlights-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-6);
      margin-bottom: var(--sp-10);

      &__head {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        margin-bottom: var(--sp-5);

        .highlights-icon { font-size: 1.8rem; }
        h2 { font-size: var(--text-lg); font-weight: var(--font-bold); color: var(--text-primary); }
        p { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
      }

      .highlights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: var(--sp-3);
      }

      .highlight-item {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-3);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.4;

        .hi-check {
          color: var(--success);
          font-weight: var(--font-bold);
          flex-shrink: 0;
        }
      }
    }

    /* ---------- PLATZI-INSPIRED SYLLABUS SECTION ---------- */
    .syllabus-section {
      margin-top: var(--sp-6);
    }

    .syllabus-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: var(--sp-4);
      margin-bottom: var(--sp-6);
      flex-wrap: wrap;

      &__info {
        .section-tag {
          display: inline-block;
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: var(--sp-1);
        }

        h2 {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin: 0;
        }

        .syllabus-subtitle {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-top: 4px;
        }
      }

      &__actions {
        display: flex;
        align-items: center;
      }
    }

    .syllabus-modules {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }

    .syllabus-module {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        border-color: rgba(255, 255, 255, 0.15);
      }

      &.is-open {
        border-color: rgba(10, 233, 138, 0.35);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      }

      &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--sp-4) var(--sp-5);
        cursor: pointer;
        user-select: none;
        transition: background var(--transition-fast);

        &:hover {
          background: var(--bg-surface-2);
        }
      }
    }

    .sm-head__left {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      min-width: 0;
    }

    .sm-index-badge {
      font-size: 0.72rem;
      font-weight: var(--font-bold);
      font-family: var(--font-mono);
      color: var(--primary);
      background: var(--primary-dim);
      border: 1px solid rgba(10, 233, 138, 0.25);
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      white-space: nowrap;
    }

    .sm-title-group {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }

    .sm-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
      line-height: 1.35;
    }

    .sm-meta {
      font-size: var(--text-xs);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sm-completed-tag {
      color: var(--primary);
      font-weight: var(--font-semibold);
    }

    .sm-head__right {
      display: flex;
      align-items: center;
      padding-left: var(--sp-3);

      .chevron {
        font-size: 0.95rem;
        color: var(--text-muted);
        transition: transform var(--transition-fast), color var(--transition-fast);
        display: inline-block;

        &.is-rotated {
          transform: rotate(180deg);
          color: var(--primary);
        }
      }
    }

    .syllabus-lessons {
      border-top: 1px solid var(--border);
      background: var(--bg-base);
      display: flex;
      flex-direction: column;
    }

    .syllabus-lesson {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--sp-3) var(--sp-5);
      border-bottom: 1px solid rgba(32, 36, 54, 0.6);
      text-decoration: none;
      color: var(--text-primary);
      transition: background var(--transition-fast);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background: var(--bg-surface-2);

        .sl-title {
          color: var(--primary);
        }

        .sl-arrow {
          transform: translateX(4px);
          color: var(--primary);
        }
      }

      &.is-completed {
        .sl-num {
          background: var(--primary-dim);
          color: var(--primary);
          border-color: var(--primary);
        }
      }
    }

    .sl-left {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      min-width: 0;
    }

    .sl-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 0.72rem;
      font-weight: var(--font-bold);
      color: var(--text-muted);
      font-family: var(--font-mono);
      flex-shrink: 0;
    }

    .sl-info {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      min-width: 0;
      flex-wrap: wrap;
    }

    .sl-title {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-secondary);
      margin: 0;
      transition: color var(--transition-fast);
    }

    .sl-tags {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .sl-type-badge {
      font-size: 11px;
      padding: 1px 7px;
      border-radius: var(--radius-sm);
      font-weight: var(--font-medium);
      background: var(--badge-bg);
      border: 1px solid var(--badge-border);
      color: var(--text-secondary);

      &.type--article {
        color: var(--accent);
        border-color: rgba(0, 217, 255, 0.25);
      }

      &.type--code_challenge {
        color: var(--primary);
        border-color: rgba(10, 233, 138, 0.25);
      }

      &.type--quiz {
        color: #FCD34D;
        border-color: rgba(252, 211, 77, 0.25);
      }
    }

    .sl-free-tag {
      font-size: 10px;
      font-weight: var(--font-semibold);
      color: var(--primary);
      background: var(--primary-dim);
      border: 1px solid rgba(10, 233, 138, 0.2);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .sl-right {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-shrink: 0;
      margin-left: auto;
    }

    .sl-duration {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .sl-arrow {
      color: var(--text-muted);
      font-size: 0.85rem;
      transition: transform var(--transition-fast), color var(--transition-fast);
    }

    .is-locked-guest {
      opacity: 0.75;
      cursor: pointer;
      &:hover {
        border-color: rgba(239, 68, 68, 0.4);
      }
    }

    .sl-lock-tag {
      background: rgba(239, 68, 68, 0.15) !important;
      color: #f87171 !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
    }

    /* Auth Gate Box in Sidebar */
    .auth-gate-box {
      text-align: center;
      padding: var(--sp-2) 0;

      .gate-icon-wrap {
        font-size: 2.2rem;
        margin-bottom: var(--sp-2);
      }

      .gate-title {
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin-bottom: var(--sp-2);
      }

      .gate-desc {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: 1.5;
        margin-bottom: var(--sp-4);
      }
    }

    /* Auth Gate Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--sp-4);
    }

    .auth-gate-modal {
      position: relative;
      width: 100%;
      max-width: 480px;
      background: #0f141f;
      border: 1px solid rgba(0, 217, 255, 0.3);
      border-radius: var(--radius-xl);
      padding: var(--sp-8);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 217, 255, 0.1);
      text-align: center;

      .modal-close-btn {
        position: absolute;
        top: 14px;
        right: 16px;
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 1.1rem;
        cursor: pointer;
        &:hover { color: #fff; }
      }

      .gate-modal-icon {
        font-size: 3rem;
        margin-bottom: var(--sp-3);
      }

      h2 {
        font-size: var(--text-xl);
        font-weight: 800;
        color: #fff;
        margin-bottom: var(--sp-2);
      }

      p {
        font-size: var(--text-sm);
        color: #94a3b8;
        line-height: 1.55;
        margin-bottom: var(--sp-6);
        strong { color: #00d9ff; }
      }

      .modal-gate-actions {
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
      }
    }
  `]
})
export class CourseDetailComponent implements OnInit {
  private coursesSvc = inject(CoursesService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  auth               = inject(AuthService);

  course        = signal<Course | null>(null);
  loading       = signal(true);
  enrolling     = signal(false);
  openModules   = signal<Set<number>>(new Set());
  activeTab     = signal<'curriculum' | 'forum'>('curriculum');
  forumModuleId = signal<number | undefined>(undefined);
  showAuthModal = signal(false);

  allExpanded = computed(() => {
    const c = this.course();
    if (!c?.modules || c.modules.length === 0) return false;
    const open = this.openModules();
    return c.modules.every(m => open.has(m.id));
  });

  totalChallenges = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.type === 'code_challenge') count++;
      }
    }
    return count;
  });

  totalQuizzes = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.type === 'quiz') count++;
      }
    }
    return count;
  });

  continueLessonSlug = computed(() => {
    const c = this.course();
    if (!c?.modules) return null;
    for (const mod of c.modules) {
      for (const lesson of mod.lessons ?? []) {
        if (!lesson.completed) {
          return lesson.slug;
        }
      }
    }
    return c.modules[0]?.lessons?.[0]?.slug ?? null;
  });

  ratingCount = computed(() => {
    const c = this.course();
    if (!c) return 48;
    return 32 + ((c.id * 19) % 87);
  });

  completedLessonsCount = computed(() => {
    let count = 0;
    for (const mod of this.course()?.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        if (lesson.completed) count++;
      }
    }
    return count;
  });

  courseSkills = computed(() => {
    const c = this.course();
    if (!c?.modules) return [];
    const skills: string[] = [];
    for (const mod of c.modules) {
      const clean = mod.title.replace(/^Módulo\s+\d+[:\s\-]*/i, '').trim();
      if (clean && !skills.includes(clean)) {
        skills.push(clean);
      }
    }
    return skills.slice(0, 6);
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading.set(true);
        this.coursesSvc.getBySlug(slug).subscribe({
          next: (c) => {
            this.course.set(c);
            this.loading.set(false);
            // Abrir todos los módulos por defecto para que el estudiante vea todo el temario y lecciones inmediatamente
            if (c?.modules && c.modules.length > 0) {
              this.openModules.set(new Set<number>(c.modules.map(m => m.id)));
            }
          },
          error: () => {
            this.course.set(null);
            this.loading.set(false);
          },
        });
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab');
      if (tab === 'forum') {
        this.activeTab.set('forum');
      } else if (tab === 'curriculum') {
        this.activeTab.set('curriculum');
      }
      const modId = params.get('moduleId');
      if (modId) {
        this.forumModuleId.set(Number(modId));
        this.activeTab.set('forum');
      }
    });
  }

  setTab(tab: 'curriculum' | 'forum') {
    this.activeTab.set(tab);
  }

  enroll() {
    if (!this.auth.isAuthenticated()) return;
    const id = this.course()?.id;
    if (!id) return;
    this.enrolling.set(true);
    this.coursesSvc.enroll(id).subscribe({
      next: () => {
        this.course.update(c => c ? { ...c, enrolled: true, progress_percent: 0 } : c);
        this.enrolling.set(false);
      },
      error: () => this.enrolling.set(false),
    });
  }

  isModuleOpen(id: number): boolean {
    return this.openModules().has(id);
  }

  toggleModule(id: number) {
    this.openModules.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  toggleAllModules() {
    const c = this.course();
    if (!c?.modules) return;
    if (this.allExpanded()) {
      this.openModules.set(new Set());
    } else {
      this.openModules.set(new Set(c.modules.map(m => m.id)));
    }
  }

  isModuleCompleted(mod: CourseModule): boolean {
    if (!mod.lessons || mod.lessons.length === 0) return false;
    return mod.lessons.every(l => l.completed);
  }

  completedCountInModule(mod: CourseModule): number {
    return (mod.lessons ?? []).filter(l => l.completed).length;
  }

  moduleDuration(mod: CourseModule): number {
    return (mod.lessons ?? []).reduce((acc, l) => acc + (l.duration_minutes ?? 10), 0);
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  lessonTypeBadge(type: string): string {
    return {
      code_challenge: '💻 Reto de Código',
      quiz: '❓ Quiz',
      article: '📖 Lectura',
      video: '🎥 Video'
    }[type] ?? '📖 Lectura';
  }

  goToFirstLesson() {
    if (!this.auth.isAuthenticated()) {
      this.showAuthModal.set(true);
      return;
    }
    const firstLesson = this.course()?.modules?.[0]?.lessons?.[0];
    if (firstLesson) {
      this.router.navigate(['/cursos', this.course()!.slug, 'leccion', firstLesson.slug]);
    }
  }

  onLessonClick(event: Event, lesson: Lesson) {
    if (!this.auth.isAuthenticated()) {
      event.preventDefault();
      event.stopPropagation();
      this.showAuthModal.set(true);
    }
  }
}
