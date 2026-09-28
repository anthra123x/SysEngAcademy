import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CoursesService } from '../../../core/services/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { LessonContentComponent } from './lesson-content.component';
import { CourseCurriculumComponent } from './course-curriculum.component';
import { InteractiveIdeComponent } from './interactive-ide.component';
import {
  CourseModule,
  LessonDetail,
  LessonDocBlock,
  LessonQuizQuestion,
  LessonRef,
  QuizAttemptQuestionResult,
  QuizAttemptResult,
} from '../../../core/models';

@Component({
  selector: 'app-lesson-player',
  imports: [RouterLink, FormsModule, LessonContentComponent, CourseCurriculumComponent, InteractiveIdeComponent],
  template: `
    @if (loading()) {
      <div class="container player">
        <div class="skeleton breadcrumb-sk"></div>
        <div class="skeleton title-sk"></div>
        <div class="skeleton meta-sk"></div>
        <div class="skeleton body-sk"></div>
      </div>
    } @else if (forbidden()) {
      <div class="container player">
        <div class="status-card">
          <div class="status-card__icon">🔒</div>
          <h2>Esta lección requiere inscripción</h2>
          <p>Debes inscribirte en el curso o iniciar sesión para poder acceder al contenido completo de esta lección.</p>
          <div style="display: flex; gap: var(--sp-3); justify-content: center; margin-top: var(--sp-4); flex-wrap: wrap;">
            <a class="btn btn-primary" [routerLink]="['/cursos', paramSlug()]">Ver curso e inscribirme</a>
            <a class="btn btn-outline" routerLink="/auth/login">Iniciar sesión</a>
          </div>
        </div>
      </div>
    } @else if (error()) {
      <div class="container player">
        <div class="status-card status-card--error">
          <div class="status-card__icon">⚠️</div>
          <h2>No pudimos cargar la lección</h2>
          <p>{{ error() }}</p>
          <a class="btn btn-outline" [routerLink]="['/cursos', paramSlug()]">Volver al curso</a>
        </div>
      </div>
    } @else if (lesson()) {
      @let l = lesson()!;
      <!-- ========================================================
           UNIFIED CLASSROOM HEADER (Navbar + Header merged)
           ======================================================== -->
      <header class="classroom-unified-header">
        <div class="header-left">
          <!-- Slide Bar Drawer Toggle Button -->
          <button
            type="button"
            class="btn-slidebar-toggle"
            (click)="navDrawerOpen.set(true)"
            title="Abrir menú de navegación"
            aria-label="Abrir menú de navegación"
          >
            <span class="ham-icon">☰</span>
            <span class="ham-label">Menú</span>
          </button>

          <!-- Brand Logo -->
          <a routerLink="/" class="unified-logo" aria-label="SysEng Academy - Inicio">
            <div class="logo-icon-wrap">
              <span class="logo-icon">&lt;/&gt;</span>
            </div>
            <span class="logo-title">SysEng<strong>Academy</strong></span>
          </a>

          <div class="unified-divider" aria-hidden="true"></div>

          <!-- Breadcrumbs -->
          <nav class="unified-breadcrumbs" aria-label="Navegación de la lección">
            <a routerLink="/cursos" class="crumb-link">Cursos</a>
            <span class="crumb-sep">/</span>
            <a [routerLink]="['/cursos', courseSlug()]" class="crumb-link crumb-course" [title]="courseTitle()">{{ courseTitle() }}</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-module">Módulo {{ l.module.order ?? 1 }}</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-current" [title]="l.title">{{ l.title }}</span>
          </nav>
        </div>

        <div class="header-right">
          <!-- Progress Capsule -->
          <div class="progress-capsule" title="Progreso del curso">
            <div class="progress-mini-track">
              <div class="progress-mini-fill" [style.width.%]="courseProgressPercent()"></div>
            </div>
            <span class="progress-mini-text">{{ completedLessonsCount() }}/{{ totalLessonsCount() }} ({{ courseProgressPercent() }}%)</span>
          </div>

          <!-- Temario Drawer Toggle -->
          <button
            type="button"
            class="btn-curriculum-pill"
            (click)="sidebarOpen.set(!sidebarOpen())"
            [class.is-active]="sidebarOpen()"
            [attr.aria-expanded]="sidebarOpen()"
            title="Mostrar u ocultar temario"
          >
            <span class="icon">📚</span>
            <span>{{ sidebarOpen() ? 'Ocultar Temario' : 'Temario' }}</span>
          </button>

          <!-- User Avatar or Login -->
          @if (auth.isAuthenticated()) {
            <a routerLink="/perfil" class="unified-avatar" [title]="auth.user()?.name ?? 'Mi Perfil'">
              {{ initials() }}
            </a>
          } @else {
            <a routerLink="/auth/login" class="btn-login-unified">Iniciar Sesión</a>
          }
        </div>
      </header>

      <!-- ========================================================
           NAVIGATION SLIDE BAR (Drawer)
           ======================================================== -->
      @if (navDrawerOpen()) {
        <div class="nav-slidebar-overlay" (click)="navDrawerOpen.set(false)" role="dialog" aria-modal="true" aria-label="Menú de Navegación">
          <aside class="nav-slidebar-panel" (click)="$event.stopPropagation()">
            <div class="slidebar-header">
              <a routerLink="/" (click)="navDrawerOpen.set(false)" class="slidebar-logo">
                <div class="logo-icon-wrap">
                  <span class="logo-icon">&lt;/&gt;</span>
                </div>
                <span class="logo-title">SysEng<strong>Academy</strong></span>
              </a>
              <button type="button" class="slidebar-close-btn" (click)="navDrawerOpen.set(false)" aria-label="Cerrar menú">✕</button>
            </div>

            <!-- Current Course Context -->
            <div class="slidebar-course-card">
              <span class="scc-tag">Estás aprendiendo</span>
              <h4 class="scc-title">{{ courseTitle() }}</h4>
              <div class="scc-progress">
                <div class="scc-progress-bar">
                  <div class="scc-progress-fill" [style.width.%]="courseProgressPercent()"></div>
                </div>
                <span class="scc-percent">{{ courseProgressPercent() }}% completado</span>
              </div>
              <a [routerLink]="['/cursos', courseSlug()]" (click)="navDrawerOpen.set(false)" class="scc-link">
                ← Volver a la portada del curso
              </a>
            </div>

            <!-- Main Platform Links -->
            <nav class="slidebar-nav">
              <span class="slidebar-section-title">Plataforma</span>
              <a routerLink="/" (click)="navDrawerOpen.set(false)" class="slidebar-link">
                <span class="link-icon">🏠</span>
                <span class="link-text">Inicio</span>
              </a>
              <a routerLink="/rutas" (click)="navDrawerOpen.set(false)" class="slidebar-link">
                <span class="link-icon">🗺️</span>
                <span class="link-text">Rutas de Aprendizaje</span>
              </a>
              <a routerLink="/cursos" (click)="navDrawerOpen.set(false)" class="slidebar-link">
                <span class="link-icon">📚</span>
                <span class="link-text">Catálogo de Cursos</span>
              </a>
            </nav>

            <div class="slidebar-divider"></div>

            <!-- User Profile / Auth Area -->
            <div class="slidebar-footer">
              @if (auth.isAuthenticated()) {
                <div class="slidebar-user-info">
                  <div class="avatar-circle">{{ initials() }}</div>
                  <div class="user-meta">
                    <strong class="user-name">{{ auth.user()?.name }}</strong>
                    <span class="user-email">{{ auth.user()?.email }}</span>
                  </div>
                </div>
                <a routerLink="/perfil" (click)="navDrawerOpen.set(false)" class="slidebar-link">
                  <span class="link-icon">👤</span>
                  <span class="link-text">Mi Perfil y Progreso</span>
                </a>
                <button type="button" (click)="logout()" class="slidebar-link slidebar-link--danger">
                  <span class="link-icon">🚪</span>
                  <span class="link-text">Cerrar Sesión</span>
                </button>
              } @else {
                <div class="slidebar-auth-cta">
                  <p>Inicia sesión para guardar tu progreso en la plataforma.</p>
                  <a routerLink="/auth/login" (click)="navDrawerOpen.set(false)" class="btn btn-outline btn-block">Iniciar Sesión</a>
                  <a routerLink="/auth/registro" (click)="navDrawerOpen.set(false)" class="btn btn-primary btn-block">Registrarse</a>
                </div>
              }
            </div>
          </aside>
        </div>
      }

      <div class="lesson-player-page">
        <div class="container player-body-wrap">
          <div class="player-layout">
            <!-- Main Content -->
            <main class="player-main">
              <!-- Lesson Header inside content -->
              <div class="lesson-header-card">
                <div class="lesson-meta-row">
                  <span class="badge badge-primary">{{ typeLabel(l.type) }}</span>
                  <span class="meta-item">⏱ {{ l.duration_minutes }} min</span>
                  @if (l.is_preview) {
                    <span class="badge badge-accent">Vista previa libre</span>
                  }
                  @if (completed()) {
                    <span class="badge badge-success">✓ Completada</span>
                  }
                </div>
                <h1 class="lesson-headline">{{ l.title }}</h1>
              </div>

              @if (contentBlocks().length > 0) {
                <app-lesson-content class="lesson-content" [blocks]="contentBlocks()" />
              }

            <!-- INTERACTIVE CODE PRACTICE (Only shown in lessons/modules where practice is required) -->
            @if (hasPractice()) {
              <section class="practice-section" aria-label="Zona de práctica de programación">
                <div class="practice-header">
                  <div class="practice-header__info">
                    <span class="practice-tag">💻 Práctica Guiada</span>
                    @if (l.hint) {
                      <div class="practice-hint">
                        <span class="hint-icon">💡</span>
                        <span class="hint-text"><strong>Pista:</strong> {{ l.hint }}</span>
                      </div>
                    }
                  </div>
                </div>

                <app-interactive-ide
                  [initialCode]="l.starter_code || code()"
                  [language]="l.language || 'python'"
                  [testCases]="l.test_cases || []"
                  [hint]="l.hint"
                  [lessonTitle]="l.title"
                  [lessonId]="l.id"
                  [isChallenge]="isCodeChallenge()"
                />
              </section>
            }

            <!-- QUIZ -->
            @if (l.quiz && l.quiz.questions.length > 0) {
              <section class="quiz" aria-label="Quiz de la lección">
                <div class="quiz-head">
                  <h2>❓ Quiz: {{ l.quiz.title ?? 'Comprueba lo aprendido' }}</h2>
                  <p>Selecciona tus respuestas y compruébalas al final.</p>
                </div>

                @for (q of l.quiz.questions; track q.id) {
                  @let res = resultFor(q.id);
                  <div class="quiz-card" [class.is-correct]="res?.correct" [class.is-wrong]="res && !res.correct">
                    <h3 class="quiz-card__q">{{ $index + 1 }}. {{ q.question }}</h3>

                    <div class="quiz-options" role="group" [attr.aria-label]="'Opciones de respuesta'">
                      @for (a of q.answers; track a.id) {
                        <label
                          class="quiz-option"
                          [class.is-selected]="isSelected(q.id, a.id)"
                          [class.is-correct]="isCorrectAnswer(q.id, a.id)"
                          [class.is-wrong]="isWrongAnswer(q.id, a.id)"
                        >
                          <input
                            [type]="isMultiple(q) ? 'checkbox' : 'radio'"
                            [name]="'q-' + q.id"
                            [checked]="isSelected(q.id, a.id)"
                            [disabled]="!!quizResult() || quizSubmitting()"
                            (change)="toggleAnswer(q.id, a.id, isMultiple(q))"
                          />
                          <span class="quiz-option__text">{{ a.answer_text }}</span>
                        </label>
                      }
                    </div>

                    @if (res) {
                      <div class="quiz-feedback">
                        <div class="quiz-feedback__head">
                          <span [class]="'quiz-feedback__tag ' + (res.correct ? 'ok' : 'ko')">
                            {{ res.correct ? '✓ Correcta' : '✗ Incorrecta' }}
                          </span>
                          @if (!res.correct && res.correct_answer_ids?.length) {
                            <span class="quiz-feedback__correct">
                              Correcta: {{ correctAnswersText(q, res) }}
                            </span>
                          }
                        </div>
                        @if (res.explanation) {
                          <p class="quiz-feedback__explanation">{{ res.explanation }}</p>
                        }
                      </div>
                    }
                  </div>
                }

                @if (!quizResult()) {
                  <button
                    class="btn btn-primary quiz-submit"
                    (click)="submitQuiz()"
                    [disabled]="quizSubmitting() || !hasAnyAnswer()"
                  >
                    {{ quizSubmitting() ? 'Comprobando…' : 'Comprobar respuestas' }}
                  </button>
                  @if (!hasAnyAnswer()) {
                    <p class="quiz-hint">Selecciona al menos una respuesta para comprobar.</p>
                  }
                } @else {
                  @let result = quizResult()!;
                  <div class="quiz-result">
                    <div
                      class="score-ring"
                      [style.--score]="result.score + '%'"
                      role="img"
                      [attr.aria-label]="'Puntaje: ' + result.score + ' por ciento'"
                    >
                      <span class="score-ring__inner">{{ result.score }}%</span>
                    </div>
                    <div class="quiz-result__info">
                      <h3>{{ scoreTitle(result.score) }}</h3>
                      <p>Acertaste <strong>{{ result.correct }}</strong> de {{ result.total }} preguntas.</p>
                      <p class="quiz-result__msg">{{ scoreMessage(result.score) }}</p>
                      @if ((result.passed ?? result.score >= 60) && !completed()) {
                        <button class="btn btn-success-outline" (click)="markComplete(result.score)" [disabled]="completing()">
                          {{ completing() ? 'Guardando…' : '✓ Marcar lección como completada' }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </section>
            }

            <!-- Acciones -->
            <div class="player-actions">
              <button class="btn btn-outline" (click)="askByte()" title="Pregunta a nuestro asistente IA">
                🤖 Preguntar a Byte
              </button>

              <div class="player-actions__right">
                @if (!completed()) {
                  <button
                    class="btn btn-primary"
                    (click)="markComplete()"
                    [disabled]="completing() || !canComplete()"
                  >
                    {{ completing() ? 'Guardando…' : '✓ Marcar como completada' }}
                  </button>
                } @else {
                  <span class="done-chip">✓ Lección completada</span>
                  @if (nextLesson()) {
                    <a class="btn btn-primary" [routerLink]="['/cursos', courseSlug(), 'leccion', nextLesson()!.slug]">
                      Siguiente lección →
                    </a>
                  }
                }
              </div>
            </div>

            @if (!canComplete() && !completed()) {
              <p class="enroll-hint">
                <a [routerLink]="['/cursos', courseSlug()]">Inscríbete al curso</a> para guardar tu progreso y completar lecciones.
              </p>
            }

            <!-- Prev / Next -->
            <nav class="lesson-nav" aria-label="Navegación entre lecciones">
              @if (prevLesson()) {
                <a class="lesson-nav__item lesson-nav__item--prev" [routerLink]="['/cursos', courseSlug(), 'leccion', prevLesson()!.slug]">
                  <span class="lesson-nav__dir">← Anterior</span>
                  <span class="lesson-nav__title">{{ prevLesson()!.title ?? 'Lección anterior' }}</span>
                </a>
              } @else {
                <span class="lesson-nav__spacer"></span>
              }
              @if (nextLesson()) {
                <a class="lesson-nav__item lesson-nav__item--next" [routerLink]="['/cursos', courseSlug(), 'leccion', nextLesson()!.slug]">
                  <span class="lesson-nav__dir">Siguiente →</span>
                  <span class="lesson-nav__title">{{ nextLesson()!.title ?? 'Próxima lección' }}</span>
                </a>
              } @else {
                <span class="lesson-nav__spacer"></span>
              }
            </nav>

            @if (officialResources().length > 0) {
              <section class="lesson-docs-refs" aria-label="Documentación Oficial de Referencia">
                <div class="lesson-docs-refs__head">
                  <span class="refs-icon">📚</span>
                  <div>
                    <h3 class="refs-title">Documentación Oficial & Referencias</h3>
                    <p class="refs-subtitle">Fuentes técnicas canónicas para profundizar en los conceptos de esta lección.</p>
                  </div>
                </div>
                <div class="resources-grid-list">
                  @for (res of officialResources(); track res.title) {
                    <a [href]="res.url" target="_blank" rel="noopener noreferrer" class="doc-resource-card">
                      <div class="drc-icon">{{ res.icon }}</div>
                      <div class="drc-body">
                        <span class="drc-source">{{ res.source }}</span>
                        <h4 class="drc-title">{{ res.title }}</h4>
                        <p class="drc-desc">{{ res.description }}</p>
                      </div>
                      <span class="drc-arrow">↗</span>
                    </a>
                  }
                </div>
              </section>
            }
          </main>

          <!-- Sidebar: lecciones del curso -->
          <aside id="player-side" class="player-side" [class.open]="sidebarOpen()" aria-label="Contenido del curso">
            @if (course()) {
              <app-course-curriculum [course]="course()" [currentLessonId]="l.id" />
            } @else {
              <div class="skeleton side-sk"></div>
              <div class="skeleton side-sk"></div>
              <div class="skeleton side-sk"></div>
            }
          </aside>
        </div>
      </div>
    </div>
  }
  `,
  styles: [`
    .player {
      padding: calc(var(--header-height) + var(--sp-6)) 0 var(--sp-16);

      .breadcrumb-sk { height: 20px; width: 38%; }
      .title-sk      { height: 40px; width: 62%; margin-top: var(--sp-5); }
      .meta-sk       { height: 18px; width: 30%; margin-top: var(--sp-4); }
      .body-sk       { height: 320px; margin-top: var(--sp-8); }
    }

    /* ========================================================
       UNIFIED CLASSROOM HEADER (Navbar + Header merged)
       ======================================================== */
    .classroom-unified-header {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 60px;
      background: rgba(14, 16, 26, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 0 var(--sp-4);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);

      @media (min-width: 1400px) {
        padding: 0 var(--sp-8);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      min-width: 0;
      flex: 1;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-shrink: 0;
    }

    /* Slide Bar Toggle Button */
    .btn-slidebar-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 36px;
      padding: 0 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--bg-surface-2);
        border-color: var(--primary);
        color: var(--primary);
      }

      .ham-icon {
        font-size: 1rem;
      }
    }

    /* Logo inside Unified Header */
    .unified-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-primary);
      flex-shrink: 0;

      .logo-icon-wrap {
        width: 28px;
        height: 28px;
        border-radius: 7px;
        background: rgba(10, 233, 138, 0.12);
        border: 1px solid rgba(10, 233, 138, 0.3);
        display: grid;
        place-items: center;

        .logo-icon {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: var(--font-bold);
          color: var(--primary);
        }
      }

      .logo-title {
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        letter-spacing: -0.01em;

        strong {
          color: var(--primary);
          font-weight: var(--font-bold);
        }
      }

      @media (max-width: 640px) {
        .logo-title { display: none; }
      }
    }

    .unified-divider {
      width: 1px;
      height: 20px;
      background: var(--border);
      flex-shrink: 0;
      @media (max-width: 768px) { display: none; }
    }

    /* Breadcrumbs */
    .unified-breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-xs);
      color: var(--text-muted);
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;

      .crumb-link {
        color: var(--text-muted);
        text-decoration: none;
        transition: color var(--transition-fast);
        &:hover { color: var(--primary); }
      }

      .crumb-course {
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .crumb-sep {
        color: var(--border-hover);
        user-select: none;
      }

      .crumb-module {
        color: var(--text-secondary);
        font-weight: var(--font-medium);
        background: rgba(108, 99, 255, 0.12);
        border: 1px solid rgba(108, 99, 255, 0.25);
        padding: 1px 8px;
        border-radius: var(--radius-full);
        font-size: 0.7rem;
        flex-shrink: 0;
      }

      .crumb-current {
        color: var(--text-primary);
        font-weight: var(--font-medium);
        max-width: 280px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 900px) {
        .crumb-course, .crumb-sep:nth-of-type(2) { display: none; }
      }
      @media (max-width: 768px) {
        display: none;
      }
    }

    /* Progress Capsule */
    .progress-capsule {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      padding: 4px 12px;
      font-size: var(--text-xs);

      .progress-mini-track {
        width: 50px;
        height: 5px;
        background: var(--bg-surface-3);
        border-radius: 99px;
        overflow: hidden;
      }

      .progress-mini-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--accent));
        transition: width var(--transition-base);
      }

      .progress-mini-text {
        color: var(--text-muted);
        font-family: var(--font-mono);
      }

      @media (max-width: 768px) { display: none; }
    }

    .btn-curriculum-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      color: var(--text-primary);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover, &.is-active {
        border-color: var(--primary);
        color: var(--primary);
        background: var(--bg-surface-2);
      }
    }

    /* Unified Header Avatar & Auth */
    .unified-avatar {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--primary), var(--accent));
      color: #08090D;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      display: grid;
      place-items: center;
      text-decoration: none;
      flex-shrink: 0;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        transform: scale(1.06);
        box-shadow: 0 0 12px rgba(10, 233, 138, 0.4);
      }
    }

    .btn-login-unified {
      display: inline-flex;
      align-items: center;
      height: 34px;
      padding: 0 14px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: #08090D;
      font-size: var(--text-xs);
      font-weight: var(--font-semibold);
      text-decoration: none;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover {
        background: var(--primary-hover);
        box-shadow: var(--shadow-primary);
      }
    }

    /* ========================================================
       NAVIGATION SLIDE BAR (Drawer)
       ======================================================== */
    .nav-slidebar-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      animation: fade-overlay 0.22s ease both;
    }

    @keyframes fade-overlay {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .nav-slidebar-panel {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 340px;
      max-width: 88vw;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: var(--sp-6);
      box-shadow: 16px 0 40px rgba(0, 0, 0, 0.65);
      animation: slide-panel 0.26s cubic-bezier(0.16, 1, 0.3, 1) both;
      overflow-y: auto;
    }

    @keyframes slide-panel {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    .slidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-6);

      .slidebar-logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--text-primary);

        .logo-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(10, 233, 138, 0.12);
          border: 1px solid rgba(10, 233, 138, 0.3);
          display: grid;
          place-items: center;
          .logo-icon {
            font-family: var(--font-mono);
            font-size: 0.8rem;
            font-weight: var(--font-bold);
            color: var(--primary);
          }
        }

        .logo-title {
          font-size: var(--text-base);
          font-weight: var(--font-medium);
          strong { color: var(--primary); font-weight: var(--font-bold); }
        }
      }

      .slidebar-close-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-md);
        background: var(--bg-surface-2);
        border: 1px solid var(--border);
        color: var(--text-secondary);
        font-size: 1rem;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--text-primary);
          border-color: var(--danger);
          background: var(--danger-dim);
        }
      }
    }

    .slidebar-course-card {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-4);
      margin-bottom: var(--sp-5);

      .scc-tag {
        font-size: 0.68rem;
        font-weight: var(--font-bold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent);
        display: block;
        margin-bottom: 4px;
      }

      .scc-title {
        font-size: var(--text-sm);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin-bottom: var(--sp-3);
        line-height: 1.35;
      }

      .scc-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: var(--sp-3);

        .scc-progress-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-surface-3);
          border-radius: 99px;
          overflow: hidden;

          .scc-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--accent));
          }
        }

        .scc-percent {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
      }

      .scc-link {
        display: inline-block;
        font-size: var(--text-xs);
        color: var(--primary);
        text-decoration: none;
        font-weight: var(--font-medium);
        transition: color var(--transition-fast);
        &:hover { text-decoration: underline; color: var(--primary-hover); }
      }
    }

    .slidebar-nav {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
      flex: 1;

      .slidebar-section-title {
        font-size: 0.7rem;
        font-weight: var(--font-bold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--text-muted);
        padding: var(--sp-2) var(--sp-3);
      }

      .slidebar-link {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: 10px 14px;
        border-radius: var(--radius-md);
        text-decoration: none;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        transition: all var(--transition-fast);
        background: transparent;
        border: none;
        width: 100%;
        text-align: left;
        cursor: pointer;

        &:hover {
          background: var(--bg-surface-2);
          color: var(--text-primary);
        }

        .link-icon {
          font-size: 1.1rem;
        }

        &--danger:hover {
          color: var(--danger);
          background: var(--danger-dim);
        }
      }
    }

    .slidebar-divider {
      height: 1px;
      background: var(--border);
      margin: var(--sp-4) 0;
    }

    .slidebar-footer {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);

      .slidebar-user-info {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        padding: var(--sp-2) var(--sp-3);
        margin-bottom: var(--sp-2);

        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #08090D;
          font-size: var(--text-xs);
          font-weight: var(--font-bold);
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .user-meta {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .user-name {
            font-size: var(--text-sm);
            color: var(--text-primary);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .user-email {
            font-size: var(--text-xs);
            color: var(--text-muted);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .slidebar-auth-cta {
        p {
          font-size: var(--text-xs);
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: var(--sp-3);
        }

        .btn {
          margin-bottom: var(--sp-2);
          width: 100%;
        }
      }
    }

    .lesson-player-page {
      padding-top: var(--sp-6);
      padding-bottom: var(--sp-20);
    }

    .player-body-wrap {
      padding-bottom: var(--sp-16);
    }

    /* Lesson Title Card inside Content */
    .lesson-header-card {
      margin-bottom: var(--sp-6);
      animation: fade-up 0.35s ease both;
    }

    .lesson-meta-row {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      margin-bottom: var(--sp-3);
      .meta-item { font-size: var(--text-xs); color: var(--text-muted); }
    }

    .lesson-headline {
      font-size: clamp(1.6rem, 2.5vw, 2.25rem);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.25;
      letter-spacing: -0.015em;
    }

    /* Official Documentation & Reference Section */
    .lesson-docs-refs {
      margin-top: var(--sp-10);
      padding-top: var(--sp-8);
      border-top: 1px solid var(--border);

      &__head {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-bottom: var(--sp-6);

        .refs-icon {
          font-size: 1.75rem;
        }

        .refs-title {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        .refs-subtitle {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin: 0;
        }
      }
    }

    /* Official Documentation Cards Grid */
    .resources-grid-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--sp-4);
    }

    .doc-resource-card {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-4);
      padding: var(--sp-5);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary);
        background: var(--bg-surface-2);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

        .drc-arrow {
          color: var(--accent);
          transform: translate(2px, -2px);
        }
      }

      .drc-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        background: rgba(108, 99, 255, 0.12);
        border: 1px solid rgba(108, 99, 255, 0.25);
        display: grid;
        place-items: center;
        font-size: 1.35rem;
        flex-shrink: 0;
      }

      .drc-body {
        flex: 1;
        min-width: 0;
      }

      .drc-source {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: var(--font-semibold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--accent);
        margin-bottom: 2px;
      }

      .drc-title {
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin-bottom: 4px;
        line-height: 1.3;
      }

      .drc-desc {
        font-size: var(--text-xs);
        color: var(--text-secondary);
        line-height: 1.55;
        margin: 0;
      }

      .drc-arrow {
        color: var(--text-muted);
        font-size: 1.1rem;
        transition: transform var(--transition-fast), color var(--transition-fast);
        flex-shrink: 0;
      }
    }

    // === Layout ===
    .player-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      gap: var(--sp-8);
      align-items: start;
      animation: fade-up 0.4s 0.05s ease both;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        gap: var(--sp-5);
      }
    }

    .side-toggle {
      display: none;
      width: 100%;
      margin-bottom: var(--sp-4);
      padding: var(--sp-3);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      cursor: pointer;
      transition: border-color var(--transition-fast), color var(--transition-fast);
      &:hover { border-color: var(--primary); color: var(--primary); }
      @media (max-width: 1024px) { display: block; }
    }

    // === Contenido ===
    .player-main { min-width: 0; max-width: 780px; }

    .lesson-content {
      .content-h {
        color: var(--text-primary);
        font-weight: var(--font-bold);
        line-height: 1.25;
        margin: var(--sp-8) 0 var(--sp-3);
        &--1 { font-size: var(--text-2xl); }
        &--2 { font-size: var(--text-xl); }
        &--3 { font-size: var(--text-lg); }
        &--4 { font-size: var(--text-base); font-weight: var(--font-semibold); }
        &:first-child { margin-top: 0; }
      }

      .content-p {
        color: var(--text-secondary);
        font-size: var(--text-base);
        line-height: 1.7;
        margin-bottom: var(--sp-4);
      }

      .content-list {
        margin: var(--sp-4) 0 var(--sp-5) var(--sp-5);
        color: var(--text-secondary);
        line-height: 1.7;
        li { margin-bottom: var(--sp-2); padding-left: var(--sp-2); &::marker { color: var(--accent); } }
      }
    }

    // === Bloques de código ===
    .code-block {
      background: #0D0D16;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin: var(--sp-5) 0;

      &__bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--sp-2) var(--sp-4);
        background: var(--bg-surface-2);
        border-bottom: 1px solid var(--border);
      }

      &__lang {
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--accent);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      &__copy {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: transparent;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        color: var(--text-secondary);
        font-size: var(--text-xs);
        font-family: var(--font-sans);
        padding: 4px 10px;
        cursor: pointer;
        transition: all var(--transition-fast);
        &:hover { border-color: var(--primary); color: var(--primary); }
        &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
      }

      pre {
        padding: var(--sp-4) var(--sp-5);
        overflow-x: auto;
      }
      code {
        color: #D8D8EC;
        font-size: var(--text-sm);
        line-height: 1.7;
      }
    }

    // === Interactive Simulated IDE & Sandbox ===
    // === Interactive Code Practice (Only shown when lesson requires practice) ===
    .practice-section {
      margin-top: var(--sp-6);
      margin-bottom: var(--sp-6);
    }

    .practice-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-2);

      &__info {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        flex-wrap: wrap;
      }
    }

    .practice-tag {
      display: inline-flex;
      align-items: center;
      font-size: var(--text-xs);
      font-weight: 600;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
    }

    .practice-hint {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: var(--text-xs);
      color: #fcd34d;
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-md);
    }

    .ai-reply {
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-surface-2);

      &__bar {
        padding: var(--sp-2) var(--sp-4);
        background: var(--primary-dim);
        color: var(--primary);
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        border-bottom: 1px solid var(--border);
      }

      &__body {
        padding: var(--sp-4) var(--sp-5);
        color: var(--text-secondary);
        font-size: var(--text-sm);
        line-height: 1.8;
        white-space: normal;

        :deep(strong) { color: var(--text-primary); }
        :deep(code) {
          font-family: var(--font-mono);
          font-size: 0.85em;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 1px 6px;
          color: var(--accent);
        }
      }
    }

    // === Quiz ===
    .quiz {
      margin-top: var(--sp-10);

      &-head {
        margin-bottom: var(--sp-5);
        h2 { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--text-primary); }
        p { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
      }
    }

    .quiz-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      margin-bottom: var(--sp-5);
      transition: border-color var(--transition-base), box-shadow var(--transition-base);

      &.is-correct { border-color: var(--success); box-shadow: 0 0 0 1px var(--success-dim); }
      &.is-wrong   { border-color: var(--danger);  box-shadow: 0 0 0 1px var(--danger-dim); }

      &__q {
        font-size: var(--text-base);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin-bottom: var(--sp-4);
        line-height: 1.5;
      }
    }

    .quiz-options { display: flex; flex-direction: column; gap: var(--sp-2); }

    .quiz-option {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      background: var(--bg-surface);
      transition: border-color var(--transition-fast), background var(--transition-fast);

      &:hover { border-color: var(--primary); background: var(--bg-surface-2); }
      &:has(input:focus-visible) { outline: 2px solid var(--primary); outline-offset: 2px; }

      input {
        accent-color: var(--primary);
        width: 16px; height: 16px;
        flex-shrink: 0;
        cursor: pointer;
        &:disabled { cursor: default; }
      }

      &.is-selected { border-color: var(--primary); background: var(--primary-dim); }

      &.is-correct {
        border-color: var(--success);
        background: var(--success-dim);
        .quiz-option__text { color: var(--success); }
      }
      &.is-wrong {
        border-color: var(--danger);
        background: var(--danger-dim);
        .quiz-option__text { color: var(--danger); }
      }

      &__text { font-size: var(--text-sm); color: var(--text-primary); line-height: 1.5; }
    }

    .quiz-feedback {
      margin-top: var(--sp-4);
      padding: var(--sp-3) var(--sp-4);
      background: var(--bg-surface-2);
      border-radius: var(--radius-md);
      border-left: 3px solid var(--border);

      &__head { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; margin-bottom: var(--sp-2); }

      &__tag {
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        padding: 3px 10px;
        border-radius: var(--radius-sm);
        &.ok { color: var(--success); background: var(--success-dim); }
        &.ko { color: var(--danger);  background: var(--danger-dim); }
      }

      &__correct { font-size: var(--text-xs); color: var(--text-secondary); }

      &__explanation {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.6;
      }
    }

    .quiz-submit { margin-top: var(--sp-2); }
    .quiz-hint { font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--sp-2); }

    .quiz-result {
      display: flex;
      align-items: center;
      gap: var(--sp-6);
      margin-top: var(--sp-6);
      padding: var(--sp-6);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      flex-wrap: wrap;

      .score-ring {
        --score: 0%;
        width: 100px; height: 100px;
        border-radius: 50%;
        background: conic-gradient(var(--primary) var(--score), var(--bg-surface-3) 0);
        display: grid;
        place-items: center;
        flex-shrink: 0;

        &__inner {
          width: 76px; height: 76px;
          border-radius: 50%;
          background: var(--bg-surface);
          display: grid;
          place-items: center;
          font-family: var(--font-mono);
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
        }
      }

      &__info {
        flex: 1;
        min-width: 220px;
        h3 { font-size: var(--text-lg); font-weight: var(--font-semibold); color: var(--text-primary); margin-bottom: 4px; }
        p { font-size: var(--text-sm); color: var(--text-secondary); }
        .quiz-result__msg { margin-top: var(--sp-2); }
      }
    }

    // === Acciones ===
    .player-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      flex-wrap: wrap;
      margin-top: var(--sp-10);
      padding-top: var(--sp-6);
      border-top: 1px solid var(--border);

      &__right { display: flex; align-items: center; gap: var(--sp-3); flex-wrap: wrap; }
    }

    .done-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      font-size: var(--text-sm);
      font-weight: var(--font-semibold);
      color: var(--success);
      background: var(--success-dim);
      border: 1px solid rgba(0, 230, 118, 0.3);
      border-radius: var(--radius-md);
      padding: var(--sp-2) var(--sp-4);
    }

    .btn-success-outline {
      background: transparent;
      border: 1px solid rgba(0, 230, 118, 0.4);
      color: var(--success);
      &:hover:not(:disabled) {
        background: var(--success-dim);
        border-color: var(--success);
      }
    }

    .enroll-hint {
      margin-top: var(--sp-4);
      font-size: var(--text-xs);
      color: var(--text-muted);
      a { color: var(--primary); &:hover { text-decoration: underline; } }
    }

    // === Navegación prev/next ===
    .lesson-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--sp-4);
      margin-top: var(--sp-8);

      @media (max-width: 640px) { grid-template-columns: 1fr; }

      &__item {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--sp-4) var(--sp-5);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        text-decoration: none;
        transition: border-color var(--transition-fast), background var(--transition-fast), box-shadow var(--transition-fast);

        &:hover {
          border-color: var(--primary);
          background: var(--bg-surface-2);
          box-shadow: var(--shadow-primary);
        }
        &:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

        &--next { text-align: right; }

        .lesson-nav__dir { font-size: var(--text-xs); color: var(--text-muted); }
        .lesson-nav__title {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &__spacer { visibility: hidden; }
    }

    // === Sidebar ===
    .player-side {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: sticky;
      top: calc(var(--header-height) + var(--sp-4));
      max-height: calc(100vh - var(--header-height) - var(--sp-8));
      display: flex;
      flex-direction: column;

      @media (max-width: 1024px) {
        position: static;
        max-height: none;
        display: none;
        &.open { display: block; }
      }

      .side-head {
        padding: var(--sp-4) var(--sp-5);
        border-bottom: 1px solid var(--border);
        h2 {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          line-height: 1.4;
        }
        span { font-size: var(--text-xs); color: var(--text-muted); }
      }

      .side-modules {
        overflow-y: auto;
        padding: var(--sp-3);
      }

      .side-module {
        margin-bottom: var(--sp-4);
        &__title {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: var(--sp-2) var(--sp-2) var(--sp-2);
        }
      }

      .side-lesson {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        padding: var(--sp-2) var(--sp-3);
        border-radius: var(--radius-md);
        text-decoration: none;
        color: var(--text-secondary);
        font-size: var(--text-sm);
        transition: background var(--transition-fast), color var(--transition-fast);

        &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
        &:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

        &.active {
          background: var(--primary-dim);
          color: var(--text-primary);
          .side-lesson__icon { color: var(--primary); }
        }

        &__icon { font-size: var(--text-sm); width: 20px; text-align: center; flex-shrink: 0; }
        &__title {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.4;
        }
        &__done { color: var(--success); font-weight: var(--font-bold); flex-shrink: 0; }
      }

      .side-sk { height: 28px; margin: var(--sp-2) var(--sp-4); }
    }

    // === Estados (403 / error) ===
    .status-card {
      max-width: 520px;
      margin: var(--sp-12) auto;
      text-align: center;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-10) var(--sp-8);
      animation: fade-up 0.4s ease both;

      &--error { border-color: var(--danger-dim); }

      &__icon { font-size: 3rem; margin-bottom: var(--sp-4); }
      h2 { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-3); }
      p { color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--sp-6); line-height: 1.6; }
    }

    // === Micro-animaciones ===
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `]
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  private coursesSvc = inject(CoursesService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  readonly auth      = inject(AuthService);

  // --- Estado de carga ---
  lesson    = signal<LessonDetail | null>(null);
  course    = signal<{
    id: number;
    slug: string;
    title: string;
    enrolled?: boolean;
    modules?: CourseModule[];
  } | null>(null);
  loading   = signal(true);
  forbidden = signal(false);
  error     = signal<string | null>(null);
  paramSlug = signal<string>('');

  // --- Lección ---
  completed  = signal(false);
  completing = signal(false);

  // --- Quiz ---
  quizAnswers    = signal<Record<number, number[]>>({});
  quizSubmitting = signal(false);
  quizResult     = signal<QuizAttemptResult | null>(null);

  // --- Code challenge & Interactive Practice ---
  code            = signal('');
  aiReviewing     = signal(false);
  aiReply         = signal<string | null>(null);

  // --- UI misc & Navigation Slide Bar ---
  sidebarOpen   = signal(false);
  navDrawerOpen = signal(false);
  copiedIndex   = signal<number | null>(null);

  readonly initials = computed(() => {
    const name = this.auth.user()?.name ?? '';
    return name.slice(0, 2).toUpperCase() || 'SA';
  });

  logout(): void {
    this.navDrawerOpen.set(false);
    this.auth.logout();
  }

  private paramSub?: Subscription;

  // ===== Computados =====

  readonly totalLessonsCount = computed(() =>
    (this.course()?.modules ?? []).reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0)
  );

  readonly completedLessonsCount = computed(() =>
    (this.course()?.modules ?? []).reduce(
      (acc, m) => acc + (m.lessons ?? []).filter(l => l.completed).length,
      0
    )
  );

  readonly courseProgressPercent = computed(() => {
    const total = this.totalLessonsCount();
    return total > 0 ? Math.round((this.completedLessonsCount() / total) * 100) : 0;
  });

  readonly officialResources = computed(() => {
    const slug = (this.courseSlug() || '').toLowerCase();
    const lang = (this.lesson()?.language || '').toLowerCase();

    if (slug.includes('html') || slug.includes('css') || slug.includes('web') || lang === 'javascript' || lang === 'html' || lang === 'css') {
      return [
        {
          icon: '🌐',
          source: 'MDN Web Docs (Mozilla)',
          title: 'JavaScript Reference & Guía de APIs Web',
          description: 'Documentación canónica sobre sintaxis, Promesas, async/await, Fetch API y manipulación del DOM con el estándar ECMAScript.',
          url: 'https://developer.mozilla.org/es/docs/Web/JavaScript'
        },
        {
          icon: '🎨',
          source: 'MDN Web Docs',
          title: 'Guía de CSS Moderno, Flexbox y Grid',
          description: 'Aprende los modelos de maquetación estándar, selectores avanzados, variables CSS y diseño responsive accesible.',
          url: 'https://developer.mozilla.org/es/docs/Learn/CSS'
        },
        {
          icon: '⚡',
          source: 'JavaScript.info',
          title: 'El Tutorial Moderno de JavaScript',
          description: 'Explicaciones profundas desde lo básico hasta el Event Loop, microtasks vs macrotasks, closures y prototipos.',
          url: 'https://es.javascript.info/'
        },
        {
          icon: '🛡️',
          source: 'W3C / Web Accessibility Initiative',
          title: 'Estándares Web y Accesibilidad WCAG',
          description: 'Pautas oficiales para construir interfaces semánticas, accesibles con teclado y lectores de pantalla.',
          url: 'https://www.w3.org/WAI/standards-guidelines/'
        }
      ];
    }

    if (slug.includes('poo') || slug.includes('python') || lang === 'python') {
      return [
        {
          icon: '🐍',
          source: 'Python Software Foundation',
          title: 'Documentación Oficial de Python 3',
          description: 'Manual de referencia oficial del lenguaje Python, biblioteca estándar, estructuras de datos y buenas prácticas.',
          url: 'https://docs.python.org/es/3/'
        },
        {
          icon: '🧩',
          source: 'Python Docs',
          title: 'Tutorial de Clases, Herencia y Métodos',
          description: 'Capítulo oficial dedicado a clases, encapsulamiento, polimorfismo, decoradores e iteradores en Python.',
          url: 'https://docs.python.org/es/3/tutorial/classes.html'
        },
        {
          icon: '📐',
          source: 'Refactoring Guru',
          title: 'Catálogo de Patrones de Diseño',
          description: 'Guía visual completa con diagramas y código en Python de patrones creacionales, estructurales y comportamentales.',
          url: 'https://refactoring.guru/es/design-patterns'
        },
        {
          icon: '✨',
          source: 'Python PEPs',
          title: 'PEP 8 — Guía de Estilo Oficial para Python',
          description: 'El estándar de convenciones adoptado universalmente en la industria de desarrollo de software con Python.',
          url: 'https://peps.python.org/pep-0008/'
        }
      ];
    }

    if (slug.includes('backend') || slug.includes('laravel') || lang === 'php') {
      return [
        {
          icon: '⚙️',
          source: 'Laravel Documentation',
          title: 'Documentación Oficial de Laravel',
          description: 'Manual oficial del framework backend líder: Enrutamiento, Middleware, Controladores, Eloquent ORM y APIs REST.',
          url: 'https://laravel.com/docs'
        },
        {
          icon: '🐘',
          source: 'PHP The Right Way',
          title: 'PHP The Right Way (Estándares PSR)',
          description: 'Guía comunitaria de referencia sobre buenas prácticas, inyección de dependencias y arquitectura moderna en PHP.',
          url: 'https://phptherightway.com/'
        },
        {
          icon: '📡',
          source: 'IETF / RFC 7231',
          title: 'Especificación HTTP/1.1 y Códigos de Estado',
          description: 'Definición formal de los verbos HTTP (GET, POST, PUT, DELETE), headers y códigos de respuesta en APIs.',
          url: 'https://httpwg.org/specs/rfc7231.html'
        },
        {
          icon: '🔒',
          source: 'OWASP Foundation',
          title: 'OWASP Top 10 API Security Risks',
          description: 'Estándar global sobre las vulnerabilidades de seguridad más críticas en APIs REST y cómo prevenirlas.',
          url: 'https://owasp.org/API-Security/'
        }
      ];
    }

    return [
      {
        icon: '💡',
        source: 'Harvard OpenCourseWare / CS50',
        title: 'Fundamentos de Ciencias de la Computación',
        description: 'Material de referencia gratuito sobre algoritmos, memoria, tipos de datos y resolución analítica de problemas.',
        url: 'https://cs50.harvard.edu/x/'
      },
      {
        icon: '🗄️',
        source: 'PostgreSQL Global Development Group',
        title: 'Manual Oficial de PostgreSQL',
        description: 'Documentación técnica completa sobre el motor de base de datos relacional estándar en la industria.',
        url: 'https://www.postgresql.org/docs/'
      },
      {
        icon: '⚡',
        source: 'SQLBolt',
        title: 'Tutoriales Interactivos de SQL',
        description: 'Ejercicios paso a paso en el navegador para dominar consultas relacionales, JOINs, agrupaciones y filtrado.',
        url: 'https://sqlbolt.com/'
      },
      {
        icon: '🤖',
        source: 'Roadmap.sh',
        title: 'Developer Roadmaps & Computer Science Guides',
        description: 'Árboles de habilidades y mapas de aprendizaje visuales recomendados por ingenieros de software senior.',
        url: 'https://roadmap.sh/'
      }
    ];
  });

  readonly courseSlug = computed(() =>
    this.lesson()?.module?.course?.slug || this.course()?.slug || this.paramSlug()
  );

  readonly courseTitle = computed(() =>
    this.lesson()?.module?.course?.title || this.course()?.title || this.paramSlug()
  );

  readonly contentBlocks = computed<LessonDocBlock[]>(() => {
    const content = this.lesson()?.content;
    if (content == null) return [];

    // Formato 1 (spec / backend actual): { type: 'doc', blocks: [...] } o { type: 'doc', text: '...' }
    if (typeof content === 'object') {
      const doc = content as Record<string, unknown>;
      if (Array.isArray(doc['blocks'])) return this.normalizeBlocks(doc['blocks'] as unknown[]);
      if (typeof doc['text'] === 'string' && doc['text'].trim()) {
        return this.parseMarkdownToBlocks(doc['text']);
      }
    }

    // Formato 2 (defensivo): string plano o markdown
    if (typeof content === 'string' && content.trim()) {
      return this.parseMarkdownToBlocks(content);
    }

    return [];
  });

  /**
   * Normaliza los bloques a la forma { type, ... } del contrato.
   * Acepta también el formato compacto del seed: ['h', text], ['p', text],
   * ['code', lang, text], ['list', items].
   */
  private normalizeBlocks(raw: unknown[]): LessonDocBlock[] {
    const out: LessonDocBlock[] = [];
    for (const entry of raw) {
      if (Array.isArray(entry)) {
        const [tag, ...rest] = entry as unknown[];
        switch (tag) {
          case 'h':
          case 'heading': {
            const [text, level] = rest as [string, number?];
            out.push({ type: 'heading', text: String(text ?? ''), level: level ?? 2 });
            break;
          }
          case 'p':
          case 'paragraph':
            out.push({ type: 'paragraph', text: String(rest[0] ?? '') });
            break;
          case 'code': {
            const [lang, text] = rest as [string, string];
            out.push({
              type: 'code',
              language: lang ? String(lang) : undefined,
              text: String(text ?? ''),
            });
            break;
          }
          case 'list':
            out.push({
              type: 'list',
              items: Array.isArray(rest[0]) ? (rest[0] as string[]) : [],
            });
            break;
          default:
            if (rest[0] != null) out.push({ type: 'paragraph', text: String(rest[0]) });
        }
      } else if (entry && typeof entry === 'object') {
        const block = entry as Partial<LessonDocBlock>;
        if (block.type) out.push(block as LessonDocBlock);
      }
    }
    return out;
  }

  private parseMarkdownToBlocks(text: string): LessonDocBlock[] {
    const blocks: LessonDocBlock[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const parseTextChunks = (chunk: string) => {
      const paragraphs = chunk.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        if (p.startsWith('### ')) {
          blocks.push({ type: 'heading', level: 3, text: p.replace(/^###\s+/, '') });
        } else if (p.startsWith('## ')) {
          blocks.push({ type: 'heading', level: 2, text: p.replace(/^##\s+/, '') });
        } else if (p.startsWith('# ')) {
          blocks.push({ type: 'heading', level: 1, text: p.replace(/^#\s+/, '') });
        } else if (p.startsWith('> ')) {
          blocks.push({ type: 'callout', text: p.replace(/^>\s+/, '').replace(/\n>\s*/g, ' '), tone: 'info' });
        } else if (/^[-*]\s+/.test(p)) {
          const items = p.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          blocks.push({ type: 'list', items, ordered: false });
        } else if (/^\d+\.\s+/.test(p)) {
          const items = p.split('\n').map(l => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          blocks.push({ type: 'list', items, ordered: true });
        } else {
          blocks.push({ type: 'paragraph', text: p });
        }
      }
    };

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const preText = text.substring(lastIndex, match.index);
      if (preText.trim()) parseTextChunks(preText);

      const lang = match[1]?.trim() || 'python';
      const code = match[2]?.trimEnd() || '';
      blocks.push({ type: 'code', language: lang, text: code });

      lastIndex = match.index + match[0].length;
    }

    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) parseTextChunks(remainingText);

    return blocks;
  }

  readonly isCodeChallenge = computed(() => this.lesson()?.type === 'code_challenge');

  readonly hasPractice = computed(() => {
    const l = this.lesson();
    if (!l) return false;
    return (
      l.type === 'code_challenge' ||
      (typeof l.starter_code === 'string' && l.starter_code.trim().length > 0) ||
      (Array.isArray(l.test_cases) && l.test_cases.length > 0)
    );
  });

  readonly canComplete = computed(() => this.course()?.enrolled !== false);

  readonly totalLessons = computed(() =>
    this.course()?.modules?.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) ?? 0
  );

  /** Lista plana de lecciones del curso (para prev/next) */
  private readonly flatLessons = computed<LessonRef[]>(() => {
    const modules = this.course()?.modules ?? [];
    const out: LessonRef[] = [];
    for (const mod of modules) {
      for (const l of mod.lessons ?? []) out.push({ slug: l.slug, title: l.title });
    }
    return out;
  });

  readonly prevLesson = computed<LessonRef | null>(() => {
    const current = this.lesson();
    if (!current) return null;
    const list = this.flatLessons();
    const idx = list.findIndex(l => l.slug === current.slug);
    if (idx > 0) return list[idx - 1];
    return current.prev_lesson ?? null;
  });

  readonly nextLesson = computed<LessonRef | null>(() => {
    const current = this.lesson();
    if (!current) return null;
    const list = this.flatLessons();
    const idx = list.findIndex(l => l.slug === current.slug);
    if (idx !== -1 && idx < list.length - 1) return list[idx + 1];
    return current.next_lesson ?? null;
  });

  // ===== Lifecycle =====

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const lessonSlug = params.get('lessonSlug') ?? '';
      const courseSlug = params.get('slug') ?? '';
      this.loadLesson(lessonSlug, courseSlug);
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
  }

  // ===== Carga =====

  private loadLesson(lessonSlug: string, courseSlug: string) {
    this.paramSlug.set(courseSlug);
    this.lesson.set(null);
    this.loading.set(true);
    this.forbidden.set(false);
    this.error.set(null);
    this.completed.set(false);
    this.quizAnswers.set({});
    this.quizResult.set(null);
    this.quizSubmitting.set(false);
    this.completing.set(false);
    this.code.set('');
    this.aiReply.set(null);
    this.aiReviewing.set(false);
    this.copiedIndex.set(null);
    this.sidebarOpen.set(false);
    window.scrollTo(0, 0);

    if (courseSlug) this.loadCourse(courseSlug);

    this.coursesSvc.getLesson(lessonSlug).subscribe({
      next: detail => {
        this.lesson.set(detail);
        this.completed.set(!!detail.completed);
        this.loading.set(false);
        const firstCode = this.contentBlocks().find(b => b.type === 'code')?.text ?? '';
        this.code.set(detail.starter_code || firstCode);
        if (!this.course() && detail.module?.course?.slug) {
          this.loadCourse(detail.module.course.slug);
        }
      },
      error: (err: HttpErrorResponse) => this.handleApiError(err),
    });
  }

  private loadCourse(slug: string) {
    this.coursesSvc.getBySlug(slug).subscribe({
      next: course => this.course.set({
        id: course.id,
        slug: course.slug,
        title: course.title,
        enrolled: course.enrolled,
        modules: course.modules,
      }),
      error: () => { /* El sidebar es opcional; la lección ya está cargada */ },
    });
  }

  private handleApiError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      this.forbidden.set(true);
      this.loading.set(false);
      return;
    }
    this.error.set(
      err.status === 404
        ? 'La lección no existe o fue movida.'
        : 'Ocurrió un error inesperado. Intenta de nuevo en unos momentos.'
    );
    this.loading.set(false);
  }

  // ===== Acciones de la lección =====

  markComplete(score?: number) {
    const lesson = this.lesson();
    if (!lesson || this.completing()) return;
    this.completing.set(true);
    this.coursesSvc.completeLesson(lesson.id, score).subscribe({
      next: () => {
        this.completed.set(true);
        this.completing.set(false);
        this.markLessonCompletedInCourse(lesson.id);
        this.course.update(c => (c ? { ...c, enrolled: true } : c));
      },
      error: (err: HttpErrorResponse) => {
        this.completing.set(false);
        this.handleApiError(err);
      },
    });
  }

  private markLessonCompletedInCourse(lessonId: number) {
    this.course.update(c => {
      if (!c?.modules) return c;
      return {
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          lessons: (m.lessons ?? []).map(l =>
            l.id === lessonId ? { ...l, completed: true } : l
          ),
        })),
      };
    });
  }

  askByte() {
    const lesson = this.lesson();
    if (!lesson) return;
    window.dispatchEvent(new CustomEvent('ai-companion:open', { detail: { lesson_id: lesson.id, lesson_title: lesson.title } }));
  }

  // ===== Copy =====

  copyCode(text: string, index: number) {
    const done = () => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  }

  // ===== Quiz =====

  isMultiple(q: LessonQuizQuestion): boolean {
    return q.type === 'multiple';
  }

  selectedIds(qid: number): number[] {
    return this.quizAnswers()[qid] ?? [];
  }

  isSelected(qid: number, aid: number): boolean {
    return this.selectedIds(qid).includes(aid);
  }

  toggleAnswer(qid: number, aid: number, multiple: boolean) {
    if (this.quizResult() || this.quizSubmitting()) return;
    this.quizAnswers.update(map => {
      const current = map[qid] ?? [];
      if (!multiple) return { ...map, [qid]: [aid] };
      const next = current.includes(aid)
        ? current.filter(x => x !== aid)
        : [...current, aid];
      return { ...map, [qid]: next };
    });
  }

  hasAnyAnswer(): boolean {
    return Object.values(this.quizAnswers()).some(arr => arr.length > 0);
  }

  resultFor(qid: number): QuizAttemptQuestionResult | null {
    return this.quizResult()?.results.find(r => r.question_id === qid) ?? null;
  }

  isCorrectAnswer(qid: number, aid: number): boolean {
    const res = this.resultFor(qid);
    return !!res && res.correct_answer_ids.includes(aid);
  }

  isWrongAnswer(qid: number, aid: number): boolean {
    const res = this.resultFor(qid);
    return !!res && res.selected_ids.includes(aid) && !res.correct_answer_ids.includes(aid);
  }

  correctAnswersText(q: LessonQuizQuestion, res: QuizAttemptQuestionResult): string {
    return q.answers
      .filter(a => res.correct_answer_ids.includes(a.id))
      .map(a => a.answer_text)
      .join(', ');
  }

  submitQuiz() {
    const lesson = this.lesson();
    if (!lesson || !lesson.quiz || lesson.quiz.questions.length === 0 || this.quizSubmitting()) return;

    const answers: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(this.quizAnswers())) {
      answers[k] = v;
    }

    this.quizSubmitting.set(true);
    this.coursesSvc.submitQuizAttempt(lesson.slug, answers).subscribe({
      next: result => {
        this.quizResult.set(result);
        this.quizSubmitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.quizSubmitting.set(false);
        this.handleApiError(err);
      },
    });
  }

  scoreTitle(score: number): string {
    if (score === 100) return '¡Perfecto! 🏆';
    if (score >= 80) return '¡Excelente trabajo! 🎉';
    if (score >= 60) return '¡Bien hecho! ✅';
    if (score >= 40) return 'Vas por buen camino';
    return 'Sigue practicando';
  }

  scoreMessage(score: number): string {
    if (score === 100) return 'Dominas este tema por completo.';
    if (score >= 80) return 'Tienes un dominio sólido del tema.';
    if (score >= 60) return 'Tienes una buena base; revisa las explicaciones para afianzar.';
    if (score >= 40) return 'Repasa el contenido y vuelve a intentarlo.';
    return 'El aprendizaje es un proceso: relee la lección y reintenta cuando estés listo. 🌱';
  }

  // ===== Code challenge =====

  evaluateCode() {
    const lesson = this.lesson();
    if (!lesson || this.aiReviewing()) return;
    this.aiReviewing.set(true);
    this.aiReply.set(null);
    this.coursesSvc.askAi(lesson.id, this.code()).subscribe({
      next: res => {
        this.aiReply.set(res.reply);
        this.aiReviewing.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.aiReviewing.set(false);
        this.handleApiError(err);
      },
    });
  }

  /** Markdown-lite: **negrita**, `código` y saltos de línea (con escape previo de HTML). */
  renderAiReply(text: string): string {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return esc
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // ===== Helpers =====

  typeLabel(type: string): string {
    return {
      video: '📹 Video',
      article: '📄 Artículo',
      quiz: '❓ Quiz',
      code_challenge: '💻 Desafío de código',
    }[type] ?? '📄 Lección';
  }

  lessonIcon(type: string): string {
    return { video: '▶️', article: '📄', quiz: '❓', code_challenge: '💻' }[type] ?? '📄';
  }
}