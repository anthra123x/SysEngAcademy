import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CoursesService } from '../../../core/services/courses.service';
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
  imports: [RouterLink, FormsModule],
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
          <p>Debes inscribirte en el curso para poder acceder a esta lección.</p>
          <a class="btn btn-primary" [routerLink]="['/cursos', paramSlug()]">Ver curso e inscribirme</a>
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
      <div class="container player">
        <!-- Cabecera -->
        <header class="player-header">
          <nav class="breadcrumb" aria-label="Migas de pan">
            <a [routerLink]="['/cursos']">Cursos</a>
            <span class="crumb-sep">/</span>
            <a [routerLink]="['/cursos', courseSlug()]">{{ courseTitle() }}</a>
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{{ l.module.title }}</span>
          </nav>

          <h1 class="player-title">{{ l.title }}</h1>

          <div class="player-meta">
            <span class="badge badge-primary">{{ typeLabel(l.type) }}</span>
            <span class="meta-item">⏱ {{ l.duration_minutes }} min</span>
            @if (l.is_preview) {
              <span class="badge badge-accent">Vista previa</span>
            }
            @if (completed()) {
              <span class="badge badge-success">✓ Completada</span>
            }
          </div>
        </header>

        <div class="player-layout">
          <!-- Contenido -->
          <main class="player-main">
            <button
              class="side-toggle"
              (click)="sidebarOpen.set(!sidebarOpen())"
              [attr.aria-expanded]="sidebarOpen()"
              aria-controls="player-side"
            >
              {{ sidebarOpen() ? 'Ocultar índice ✕' : '☰ Índice del curso' }}
            </button>

            @if (contentBlocks().length > 0) {
              <div class="lesson-content">
                @for (block of contentBlocks(); track $index) {
                  @switch (block.type) {
                    @case ('heading') {
                      @switch (block.level ?? 2) {
                        @case (1) { <h2 class="content-h content-h--1">{{ block.text }}</h2> }
                        @case (2) { <h2 class="content-h content-h--2">{{ block.text }}</h2> }
                        @case (3) { <h3 class="content-h content-h--3">{{ block.text }}</h3> }
                        @default  { <h4 class="content-h content-h--4">{{ block.text }}</h4> }
                      }
                    }
                    @case ('paragraph') {
                      <p class="content-p">{{ block.text }}</p>
                    }
                    @case ('list') {
                      <ul class="content-list">
                        @for (item of block.items ?? []; track $index) {
                          <li>{{ item }}</li>
                        }
                      </ul>
                    }
                    @case ('code') {
                      <div class="code-block">
                        <div class="code-block__bar">
                          <span class="code-block__lang">{{ block.language ?? 'code' }}</span>
                          <button
                            class="code-block__copy"
                            (click)="copyCode(block.text ?? '', $index)"
                            [attr.aria-label]="'Copiar código'"
                          >
                            {{ copiedIndex() === $index ? '✓ Copiado' : 'Copiar' }}
                          </button>
                        </div>
                        <pre><code>{{ block.text }}</code></pre>
                      </div>
                    }
                    @default {
                      @if (block.text) {
                        <p class="content-p">{{ block.text }}</p>
                      }
                    }
                  }
                }
              </div>
            }

            <!-- CODE CHALLENGE -->
            @if (isCodeChallenge()) {
              <section class="challenge" aria-label="Desafío de código">
                <div class="challenge__head">
                  <h2>💻 Tu solución</h2>
                  <p>Pega tu código aquí y recibe una revisión de la IA.</p>
                </div>
                <textarea
                  class="challenge__editor"
                  [ngModel]="code()"
                  (ngModelChange)="code.set($event)"
                  rows="12"
                  spellcheck="false"
                  placeholder="// Escribe tu código aquí..."
                  [attr.aria-label]="'Editor de código de tu solución'"
                ></textarea>
                <div class="challenge__actions">
                  <button
                    class="btn btn-accent"
                    (click)="evaluateCode()"
                    [disabled]="aiReviewing() || !code().trim()"
                  >
                    {{ aiReviewing() ? 'Evaluando…' : '🤖 Evaluar con IA' }}
                  </button>
                  @if (aiReviewing()) {
                    <span class="challenge__hint">La IA está revisando tu solución, un momento…</span>
                  }
                </div>
                @if (aiReply()) {
                  <div class="ai-reply" role="status">
                    <div class="ai-reply__bar">🤖 Feedback de Byte</div>
                    <div class="ai-reply__body" [innerHTML]="renderAiReply(aiReply()!)"></div>
                  </div>
                }
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
          </main>

          <!-- Sidebar: lecciones del curso -->
          <aside id="player-side" class="player-side" [class.open]="sidebarOpen()" aria-label="Lecciones del curso">
            @if (course()) {
              <div class="side-head">
                <h2>{{ course()!.title }}</h2>
                <span>{{ totalLessons() }} lecciones</span>
              </div>
              <nav class="side-modules">
                @for (mod of course()!.modules ?? []; track mod.id) {
                  <div class="side-module">
                    <p class="side-module__title">Módulo {{ $index + 1 }} · {{ mod.title }}</p>
                    @for (lesson of mod.lessons ?? []; track lesson.id) {
                      <a
                        class="side-lesson"
                        [class.active]="lesson.id === l.id"
                        [routerLink]="['/cursos', courseSlug(), 'leccion', lesson.slug]"
                      >
                        <span class="side-lesson__icon">{{ lessonIcon(lesson.type) }}</span>
                        <span class="side-lesson__title">{{ lesson.title }}</span>
                        @if (lesson.completed) {
                          <span class="side-lesson__done">✓</span>
                        }
                      </a>
                    }
                  </div>
                }
              </nav>
            } @else {
              <div class="skeleton side-sk"></div>
              <div class="skeleton side-sk"></div>
              <div class="skeleton side-sk"></div>
            }
          </aside>
        </div>
      </div>
    }
  `,
  styles: [`
    .player {
      padding: var(--sp-8) 0 var(--sp-16);

      .breadcrumb-sk { height: 20px; width: 38%; }
      .title-sk      { height: 40px; width: 62%; margin-top: var(--sp-5); }
      .meta-sk       { height: 18px; width: 30%; margin-top: var(--sp-4); }
      .body-sk       { height: 320px; margin-top: var(--sp-8); }
    }

    // === Cabecera ===
    .player-header {
      animation: fade-up 0.4s ease both;

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        flex-wrap: wrap;
        font-size: var(--text-xs);
        color: var(--text-muted);
        margin-bottom: var(--sp-4);

        a { color: var(--text-secondary); &:hover { color: var(--primary); } }
        .crumb-sep { color: var(--text-muted); opacity: 0.7; }
        .crumb-current { color: var(--text-muted); }
      }

      .player-title {
        font-size: var(--text-3xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        line-height: 1.2;
        margin-bottom: var(--sp-3);
      }

      .player-meta {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        flex-wrap: wrap;
        margin-bottom: var(--sp-8);

        .meta-item { font-size: var(--text-sm); color: var(--text-secondary); }
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

    // === Code challenge ===
    .challenge {
      margin-top: var(--sp-10);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-6);

      &__head {
        margin-bottom: var(--sp-4);
        h2 { font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--text-primary); }
        p { font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px; }
      }

      &__editor {
        width: 100%;
        background: #0D0D16;
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        padding: var(--sp-4);
        color: #D8D8EC;
        font-family: var(--font-mono);
        font-size: var(--text-sm);
        line-height: 1.7;
        resize: vertical;
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        &:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-dim); }
        &::placeholder { color: var(--text-muted); }
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--sp-4);
        margin-top: var(--sp-4);
        flex-wrap: wrap;
      }

      &__hint { font-size: var(--text-xs); color: var(--text-muted); }
    }

    .ai-reply {
      margin-top: var(--sp-5);
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

  // --- Code challenge ---
  code        = signal('');
  aiReviewing = signal(false);
  aiReply     = signal<string | null>(null);

  // --- UI misc ---
  sidebarOpen  = signal(false);
  copiedIndex  = signal<number | null>(null);

  private paramSub?: Subscription;

  // ===== Computados =====

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
        return this.textToParagraphs(doc['text']);
      }
    }

    // Formato 2 (defensivo): string plano
    if (typeof content === 'string' && content.trim()) {
      return this.textToParagraphs(content);
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

  private textToParagraphs(text: string): LessonDocBlock[] {
    return text
      .split(/\n{2,}/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => ({ type: 'paragraph', text: t }));
  }

  readonly isCodeChallenge = computed(() => this.lesson()?.type === 'code_challenge');

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
        this.code.set(firstCode);
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
    if (err.status === 401) {
      // La sesión expiró / no autenticado: el interceptor limpia la sesión.
      this.router.navigate(['/auth/login']);
      return;
    }
    if (err.status === 403) {
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