import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseModule, Lesson } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';

/** Forma mínima que el panel necesita del curso (el detalle del player es parcial). */
export interface CurriculumCourse {
  id: number;
  slug: string;
  title: string;
  modules?: CourseModule[];
}

/**
 * Panel de contenido del curso, estilo "currriculum" de las plataformas de
 * cursos: cabecera fija con el curso, barra de progreso real y Sections
 * plegables con las lecciones, su tipo, su duración y su estado.
 */
@Component({
  selector: 'app-course-curriculum',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="panel">
      <header class="panel__head">
        <p class="panel__eyebrow">Estás estudiando</p>
        <a class="panel__title" [routerLink]="['/cursos', course()?.slug]">{{ course()?.title ?? 'Curso' }}</a>

        <div class="progress">
          <div class="progress__row">
            <span class="progress__pct">{{ progress() }}% completado</span>
            <span class="progress__count">{{ doneCount() }}/{{ totalCount() }} lecciones</span>
          </div>
          <div
            class="progress__track"
            role="progressbar"
            [attr.aria-valuenow]="progress()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Progreso del curso'"
          >
            <div class="progress__fill" [style.width.%]="progress()"></div>
          </div>
        </div>
      </header>

      @if (lockedMessage()) {
        <div class="lock-toast" role="alert">
          <span class="toast-icon">🔒</span>
          <span class="toast-text">{{ lockedMessage() }}</span>
          <button type="button" class="toast-close" (click)="lockedMessage.set(null)">×</button>
        </div>
      }

      <div class="panel__body">
        @for (section of sections(); track section.id; let si = $index) {
          <section class="section" [class.is-open]="isOpen(section.id)">
            <button
              type="button"
              class="section__head"
              (click)="toggle(section.id)"
              [attr.aria-expanded]="isOpen(section.id)"
            >
              <span class="section__index">{{ si + 1 }}</span>
              <span class="section__titles">
                <span class="section__name">{{ section.title }}</span>
                <span class="section__meta">{{ lessonCount(section) }} lecciones · {{ sectionDone(section) }}/{{ lessonCount(section) }}</span>
              </span>
              <span class="section__chevron" [class.is-open]="isOpen(section.id)" aria-hidden="true">▾</span>
            </button>

            @if (isOpen(section.id)) {
              <ul class="lessons">
                @for (lesson of section.lessons; track lesson.id) {
                  <li>
                    @if (!isLocked(lesson)) {
                      <a
                        class="lesson"
                        [class.is-active]="lesson.id === currentLessonId()"
                        [class.is-done]="lesson.completed"
                        [routerLink]="['/cursos', course()?.slug, 'leccion', lesson.slug]"
                      >
                        <span class="lesson__state" aria-hidden="true">
                          @if (lesson.completed) { ✓ }
                          @else { {{ typeIcon(lesson.type) }} }
                        </span>
                        <span class="lesson__title">{{ lesson.title }}</span>
                        @if (lesson.duration_minutes) {
                          <span class="lesson__time">{{ lesson.duration_minutes }} min</span>
                        }
                      </a>
                    } @else {
                      <div
                        class="lesson is-locked"
                        (click)="showLockedNotice(lesson)"
                        role="button"
                        tabindex="0"
                        title="Lección bloqueada: completa la anterior para avanzar"
                      >
                        <span class="lesson__state is-lock" aria-hidden="true">🔒</span>
                        <span class="lesson__title">{{ lesson.title }}</span>
                        <span class="lesson__lock-pill">Bloqueada</span>
                      </div>
                    }
                  </li>
                }
              </ul>
            }
          </section>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .panel {
      position: sticky; top: 1.5rem;
      display: flex; flex-direction: column;
      max-height: calc(100vh - 3rem);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: var(--bg-surface);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    /* ---------- Cabecera ---------- */
    .panel__head { padding: 1.1rem 1.15rem 1rem; border-bottom: 1px solid var(--border); background: var(--bg-surface-2); }
    .panel__eyebrow { margin: 0 0 .2rem; font-size: .7rem; letter-spacing: .09em; text-transform: uppercase; color: var(--text-muted); }
    .panel__title {
      display: block; font-size: 1.02rem; font-weight: var(--font-semibold);
      color: var(--text-primary); text-decoration: none; line-height: 1.3;
    }
    .panel__title:hover { color: var(--primary); }

    .progress { margin-top: .9rem; }
    .progress__row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: .4rem; }
    .progress__pct { font-size: .78rem; font-weight: var(--font-semibold); color: var(--accent); }
    .progress__count { font-size: .72rem; color: var(--text-muted); }
    .progress__track { height: 5px; border-radius: 99px; background: var(--bg-surface-3); overflow: hidden; }
    .progress__fill {
      height: 100%; border-radius: 99px;
      background: linear-gradient(90deg, var(--primary), var(--accent));
      transition: width .35s ease;
    }

    /* ---------- Secciones ---------- */
    .panel__body { overflow-y: auto; overscroll-behavior: contain; }

    .section { border-bottom: 1px solid var(--border); }
    .section:last-child { border-bottom: 0; }

    .section__head {
      display: flex; align-items: center; gap: .7rem; width: 100%;
      padding: .85rem 1.1rem;
      background: transparent; border: 0; cursor: pointer; text-align: left;
      transition: background var(--transition-fast);
    }
    .section__head:hover { background: var(--bg-surface-2); }

    .section__index {
      display: grid; place-items: center; flex: none;
      width: 1.5rem; height: 1.5rem; border-radius: 50%;
      font-size: .72rem; font-weight: var(--font-bold);
      color: var(--primary); background: color-mix(in srgb, var(--primary) 13%, transparent);
    }
    .section__titles { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
    .section__name { font-size: .875rem; font-weight: var(--font-semibold); color: var(--text-primary); line-height: 1.3; }
    .section__meta { font-size: .72rem; color: var(--text-muted); }
    .section__chevron { margin-left: auto; color: var(--text-muted); font-size: .8rem; transition: transform var(--transition-fast); }
    .section__chevron.is-open { transform: rotate(180deg); }

    /* ---------- Lecciones ---------- */
    .lessons { margin: 0; padding: 0 0 .5rem; list-style: none; }
    .lesson {
      display: flex; align-items: center; gap: .6rem;
      padding: .5rem 1.1rem .5rem 2.6rem;
      color: var(--text-secondary); text-decoration: none;
      border-left: 3px solid transparent;
      transition: background var(--transition-fast), color var(--transition-fast);
    }
    .lesson:hover { background: var(--bg-surface-2); color: var(--text-primary); }
    .lesson.is-active {
      background: color-mix(in srgb, var(--primary) 9%, transparent);
      border-left-color: var(--primary);
      color: var(--text-primary); font-weight: var(--font-medium);
    }
    .lesson__state {
      display: grid; place-items: center; flex: none;
      width: 1.15rem; height: 1.15rem; border-radius: 50%;
      font-size: .62rem;
      color: var(--text-muted); background: var(--bg-surface-3);
    }
    .lesson.is-done .lesson__state { color: var(--bg-base); background: var(--accent); font-weight: var(--font-bold); }
    .lesson.is-active .lesson__state { color: var(--primary); background: color-mix(in srgb, var(--primary) 16%, transparent); }
    .lesson__title { font-size: .82rem; line-height: 1.35; flex: 1; min-width: 0; }
    .lesson__time { font-size: .7rem; color: var(--text-muted); flex: none; }

    /* Lección Bloqueada */
    .lesson.is-locked {
      cursor: not-allowed;
      opacity: 0.55;
      background: rgba(0, 0, 0, 0.15);
      border-left-color: rgba(255, 82, 82, 0.4);

      &:hover {
        background: rgba(255, 82, 82, 0.08);
      }

      .is-lock {
        font-size: 0.72rem;
        background: rgba(255, 82, 82, 0.15);
        color: #ff5252;
      }

      .lesson__lock-pill {
        font-size: 0.62rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #ff5252;
        background: rgba(255, 82, 82, 0.12);
        border: 1px solid rgba(255, 82, 82, 0.25);
        padding: 1px 6px;
        border-radius: 4px;
        flex: none;
      }
    }

    /* Lock Toast */
    .lock-toast {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 12px;
      padding: 8px 12px;
      background: rgba(255, 82, 82, 0.12);
      border: 1px solid rgba(255, 82, 82, 0.35);
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      color: #ff7676;
      animation: fadeIn 0.2s ease;

      .toast-text { flex: 1; line-height: 1.3; }
      .toast-close {
        background: transparent;
        border: none;
        color: #ff7676;
        cursor: pointer;
        font-size: 1rem;
        line-height: 1;
        padding: 0 4px;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 1024px) {
      .panel { position: static; max-height: none; }
    }
  `],
})
export class CourseCurriculumComponent {
  private readonly auth = inject(AuthService);

  readonly course = input<CurriculumCourse | null>(null);
  readonly currentLessonId = input<number | null>(null);

  private readonly collapsed = signal<Set<number>>(new Set());
  readonly lockedMessage = signal<string | null>(null);

  readonly sections = computed<CourseModule[]>(() => this.course()?.modules ?? []);

  readonly allLessons = computed<Lesson[]>(() => {
    return this.sections().flatMap(m => m.lessons ?? []);
  });

  readonly totalCount = computed(() =>
    this.sections().reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0),
  );

  readonly doneCount = computed(() =>
    this.sections().reduce(
      (acc, m) => acc + (m.lessons ?? []).filter((l: Lesson) => l.completed).length,
      0,
    ),
  );

  readonly progress = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  });

  isLocked(lesson: Lesson): boolean {
    if (this.auth.isInstructor() || this.auth.isAdmin()) return false;
    const list = this.allLessons();
    const idx = list.findIndex(l => l.id === lesson.id);
    if (idx <= 0) return false; // La primera lección del curso siempre está disponible
    if (lesson.completed) return false; // Ya completada, se puede repasar libremente
    // Para desbloquear esta lección, la inmediatamente anterior debe estar completada
    return !list[idx - 1]?.completed;
  }

  showLockedNotice(lesson: Lesson): void {
    const list = this.allLessons();
    const idx = list.findIndex(l => l.id === lesson.id);
    const prev = idx > 0 ? list[idx - 1] : null;
    const prevTitle = prev?.title ? `«${prev.title}»` : 'la lección anterior';
    this.lockedMessage.set(`Debes completar primero ${prevTitle} para desbloquear este módulo.`);
    setTimeout(() => this.lockedMessage.set(null), 4500);
  }

  isOpen(id: number): boolean {
    // La sección que contiene la lección actual siempre queda abierta.
    const current = this.currentLessonId();
    if (current != null) {
      const owner = this.sections().find((m) => (m.lessons ?? []).some((l) => l.id === current));
      if (owner && owner.id === id) return true;
    }
    return !this.collapsed().has(id);
  }

  toggle(id: number): void {
    const next = new Set(this.collapsed());
    next.has(id) ? next.delete(id) : next.add(id);
    this.collapsed.set(next);
  }

  lessonCount(section: CourseModule): number {
    return section.lessons?.length ?? 0;
  }

  sectionDone(section: CourseModule): number {
    return (section.lessons ?? []).filter((l: Lesson) => l.completed).length;
  }

  typeIcon(type: string): string {
    switch (type) {
      case 'video': return '▶';
      case 'quiz': return '?';
      case 'code_challenge': return '{ }';
      default: return '▤';
    }
  }
}
