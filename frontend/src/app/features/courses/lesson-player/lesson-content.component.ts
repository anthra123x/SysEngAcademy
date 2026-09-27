import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { LessonDocBlock } from '../../../core/models';

/**
 * Lector de contenido de lección — experiencia de lectura editorial.
 *
 * Renderiza los bloques del documento (encabezados, párrafos, listas, código)
 * y añade los tipos/compose más usados en material didáctico:
 *   - callout : aviso destacado (info / tip / warning / danger)
 *   - keypoints : cuadro de puntos clave
 *   - quote  : cita
 *   - list   : soporta listas ordenadas con `ordered: true`
 */
@Component({
  selector: 'app-lesson-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="prose">
      @for (block of blocks(); track $index) {
        @switch (block.type) {
          @case ('heading') {
            @switch (block.level ?? 2) {
              @case (1) { <h1 class="h h1">{{ block.text }}</h1> }
              @case (2) { <h2 class="h h2"><span class="h__bar"></span>{{ block.text }}</h2> }
              @case (3) { <h3 class="h h3">{{ block.text }}</h3> }
              @default  { <h4 class="h h4">{{ block.text }}</h4> }
            }
          }
          @case ('paragraph') {
            <p class="p">{{ block.text }}</p>
          }
          @case ('list') {
            @if (isOrdered(block)) {
              <ol class="list list--ordered">
                @for (item of block.items ?? []; track $index) {
                  <li>{{ item }}</li>
                }
              </ol>
            } @else {
              <ul class="list">
                @for (item of block.items ?? []; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            }
          }
          @case ('code') {
            <figure class="code" [attr.data-lang]="block.language ?? 'texto'">
              <figcaption class="code__bar">
                <span class="code__dots" aria-hidden="true"><i></i><i></i><i></i></span>
                <span class="code__lang">{{ block.language ?? 'code' }}</span>
                <button
                  type="button"
                  class="code__copy"
                  (click)="copy(block.text ?? '', $index)"
                  [attr.aria-label]="'Copiar código del bloque ' + ($index + 1)"
                >
                  @if (copied() === $index) { <span class="ok">✓ Copiado</span> }
                  @else { <span>Copiar</span> }
                </button>
              </figcaption>
              <pre class="code__pre"><code>{{ block.text }}</code></pre>
            </figure>
          }
          @case ('callout') {
            @let tone = toneOf(block);
            <aside class="callout" [attr.data-tone]="tone">
              <span class="callout__icon" aria-hidden="true">{{ iconOf(tone) }}</span>
              <div class="callout__body">
                @if (block.title) { <p class="callout__title">{{ block.title }}</p> }
                <p class="callout__text">{{ block.text }}</p>
              </div>
            </aside>
          }
          @case ('keypoints') {
            <section class="keypoints">
              <p class="keypoints__title">
                <span class="keypoints__badge" aria-hidden="true">✓</span>
                {{ block.title ?? 'Puntos clave' }}
              </p>
              <ul class="keypoints__list">
                @for (item of block.items ?? []; track $index) {
                  <li>{{ item }}</li>
                }
              </ul>
            </section>
          }
          @case ('quote') {
            <blockquote class="quote">
              <p>{{ block.text }}</p>
              @if (block.title) { <cite>{{ block.title }}</cite> }
            </blockquote>
          }
          @default {
            @if (block.text) { <p class="p">{{ block.text }}</p> }
          }
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .prose {
      --measure: 70ch;
      color: var(--text-primary);
      font-size: 1.0625rem;
      line-height: 1.75;
    }

    /* ---------- Encabezados ---------- */
    .h { color: var(--text-primary); letter-spacing: -0.015em; scroll-margin-top: 5rem; }
    .h1 { font-size: 2rem; font-weight: var(--font-bold); line-height: 1.2; margin: 0 0 1.1rem; }
    .h2 {
      display: flex; align-items: center; gap: .75rem;
      font-size: 1.5rem; font-weight: var(--font-bold); line-height: 1.25;
      margin: 2.75rem 0 1rem;
    }
    .h2:first-child { margin-top: 0; }
    .h2 .h__bar {
      width: 4px; height: 1.15em; flex: none; border-radius: 99px;
      background: linear-gradient(180deg, var(--primary), var(--accent));
    }
    .h3 { font-size: 1.2rem; font-weight: var(--font-semibold); margin: 2rem 0 .75rem; }
    .h4 { font-size: 1.05rem; font-weight: var(--font-semibold); margin: 1.5rem 0 .6rem; color: var(--text-secondary); }

    /* ---------- Párrafos ---------- */
    .p { max-width: var(--measure); margin: 0 0 1.1rem; color: var(--text-secondary); }
    .p strong { color: var(--text-primary); font-weight: var(--font-semibold); }

    /* ---------- Listas ---------- */
    .list { max-width: var(--measure); margin: 0 0 1.25rem; padding: 0; list-style: none; }
    .list li { position: relative; padding-left: 1.6rem; margin-bottom: .55rem; color: var(--text-secondary); }
    .list li::before {
      content: ''; position: absolute; left: .3rem; top: .68em;
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--primary); opacity: .75;
    }
    .list--ordered { counter-reset: item; }
    .list--ordered li { counter-increment: item; }
    .list--ordered li::before {
      content: counter(item); top: 0; left: 0;
      width: 1.15rem; height: 1.15rem; border-radius: 50%;
      display: grid; place-items: center;
      font-size: .72rem; font-weight: var(--font-bold);
      color: var(--primary); background: color-mix(in srgb, var(--primary) 14%, transparent);
      opacity: 1;
    }

    /* ---------- Código ---------- */
    .code {
      margin: 1.5rem 0 1.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--bg-surface-2);
      box-shadow: var(--shadow-sm);
    }
    .code__bar {
      display: flex; align-items: center; gap: .75rem;
      padding: .55rem .85rem;
      background: var(--bg-surface-3);
      border-bottom: 1px solid var(--border);
    }
    .code__dots { display: inline-flex; gap: .3rem; }
    .code__dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--border-hover); }
    .code__lang {
      font-family: var(--font-mono); font-size: .72rem; letter-spacing: .06em;
      text-transform: uppercase; color: var(--text-muted);
    }
    .code__copy {
      margin-left: auto; padding: .3rem .7rem;
      font-size: .75rem; font-weight: var(--font-medium);
      color: var(--text-secondary);
      background: transparent; border: 1px solid var(--border);
      border-radius: var(--radius-sm); cursor: pointer;
      transition: color var(--transition-fast), border-color var(--transition-fast);
    }
    .code__copy:hover { color: var(--primary); border-color: var(--primary); }
    .code__copy .ok { color: var(--accent); }
    .code__pre {
      margin: 0; padding: 1.1rem 1.25rem;
      overflow-x: auto;
      font-family: var(--font-mono); font-size: .875rem; line-height: 1.65;
      color: var(--text-primary);
      tab-size: 2;
    }
    .code__pre code { font: inherit; white-space: pre; }

    /* ---------- Callout ---------- */
    .callout {
      display: flex; gap: .9rem;
      max-width: var(--measure);
      margin: 1.5rem 0; padding: 1rem 1.15rem;
      border: 1px solid var(--border); border-left: 3px solid var(--primary);
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--primary) 6%, var(--bg-surface));
    }
    .callout__icon { font-size: 1.1rem; line-height: 1.4; }
    .callout__title { margin: 0 0 .25rem; font-weight: var(--font-semibold); color: var(--text-primary); }
    .callout__text { margin: 0; color: var(--text-secondary); }
    .callout[data-tone='tip']     { border-left-color: var(--accent); background: color-mix(in srgb, var(--accent) 7%, var(--bg-surface)); }
    .callout[data-tone='warning'] { border-left-color: #f59e0b; background: color-mix(in srgb, #f59e0b 8%, var(--bg-surface)); }
    .callout[data-tone='danger']  { border-left-color: #ef4444; background: color-mix(in srgb, #ef4444 7%, var(--bg-surface)); }

    /* ---------- Puntos clave ---------- */
    .keypoints {
      max-width: var(--measure);
      margin: 1.75rem 0; padding: 1.15rem 1.35rem;
      border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--border));
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--accent) 7%, var(--bg-surface));
    }
    .keypoints__title { display: flex; align-items: center; gap: .55rem; margin: 0 0 .7rem; font-weight: var(--font-semibold); color: var(--text-primary); }
    .keypoints__badge {
      display: grid; place-items: center; width: 1.35rem; height: 1.35rem; flex: none;
      border-radius: 50%; font-size: .75rem;
      color: var(--bg-base); background: var(--accent);
    }
    .keypoints__list { margin: 0; padding: 0; list-style: none; }
    .keypoints__list li { position: relative; padding-left: 1.35rem; margin-bottom: .45rem; color: var(--text-secondary); }
    .keypoints__list li::before { content: '→'; position: absolute; left: 0; color: var(--accent); font-weight: var(--font-bold); }
    .keypoints__list li:last-child { margin-bottom: 0; }

    /* ---------- Cita ---------- */
    .quote {
      max-width: var(--measure);
      margin: 1.5rem 0; padding: .25rem 0 .25rem 1.25rem;
      border-left: 3px solid var(--border-hover);
      color: var(--text-secondary); font-style: italic;
    }
    .quote p { margin: 0 0 .35rem; }
    .quote cite { font-size: .85rem; font-style: normal; color: var(--text-muted); }
  `],
})
export class LessonContentComponent {
  readonly blocks = input.required<LessonDocBlock[]>();
  readonly copied = signal<number | null>(null);
  readonly copyEvent = output<string>();

  private timer: ReturnType<typeof setTimeout> | null = null;

  isOrdered(block: LessonDocBlock): boolean {
    return (block as { ordered?: boolean }).ordered === true;
  }

  toneOf(block: LessonDocBlock): string {
    const t = (block.text ?? '').toLowerCase();
    if (t.startsWith('peligro') || t.startsWith('error') || t.startsWith('cuidado')) return 'danger';
    if (t.startsWith('aviso') || t.startsWith('atención') || t.startsWith('atencion')) return 'warning';
    if (t.startsWith('tip') || t.startsWith('consejo') || t.startsWith('truco')) return 'tip';
    return (block as { tone?: string }).tone ?? 'info';
  }

  iconOf(tone: string): string {
    switch (tone) {
      case 'danger': return '⚠️';
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  }

  copy(text: string, index: number): void {
    void navigator.clipboard?.writeText(text);
    this.copied.set(index);
    this.copyEvent.emit(text);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(null), 1800);
  }
}
