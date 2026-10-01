import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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
          @case ('diagram') {
            <figure class="diagram-figure" [attr.data-diagram-type]="block.diagram_type || 'flow'">
              @if (block.title) {
                <div class="diagram-figure__header">
                  <div class="diagram-figure__header-left">
                    <span class="diagram-figure__icon" aria-hidden="true">{{ diagramIcon(block.diagram_type) }}</span>
                    <h4 class="diagram-figure__title">{{ block.title }}</h4>
                  </div>
                  @if (block.diagram_type) {
                    <span class="diagram-figure__badge">{{ diagramTypeLabel(block.diagram_type) }}</span>
                  }
                </div>
              }

              <div class="diagram-figure__body">
                @switch (block.diagram_type) {
                  @case ('memory') {
                    <!-- REPRESENTACIÓN DE MEMORIA RAM -->
                    <div class="memory-board">
                      <div class="memory-board__header">
                        <span class="mem-col mem-col--addr">Dirección Fís.</span>
                        <span class="mem-col mem-col--var">Identificador</span>
                        <span class="mem-col mem-col--type">Tipo</span>
                        <span class="mem-col mem-col--val">Valor en Memoria</span>
                      </div>
                      <div class="memory-board__grid">
                        @for (cell of block.cells ?? []; track $index) {
                          <div class="memory-board__row" [style.--row-accent]="cell.color || 'var(--primary)'">
                            <span class="mem-cell mem-cell--addr">
                              <code>{{ cell.address || ('0x7FFF0' + ($index * 4)) }}</code>
                            </span>
                            <span class="mem-cell mem-cell--var">
                              <span class="mem-badge-var">{{ cell.label }}</span>
                            </span>
                            <span class="mem-cell mem-cell--type">
                              <span class="mem-badge-type">{{ cell.type || 'auto' }}</span>
                            </span>
                            <span class="mem-cell mem-cell--val">
                              <div class="mem-val-box">
                                <span class="mem-val-text">{{ cell.value }}</span>
                              </div>
                            </span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                  @case ('flow') {
                    <!-- FLUJO DE EJECUCIÓN SECUENCIAL -->
                    <div class="flow-pipeline">
                      @for (st of block.steps ?? []; track $index) {
                        <div class="flow-step" [attr.data-tone]="st.tone || 'primary'">
                          <div class="flow-step__indicator">
                            <span class="flow-step__num">{{ st.step || ($index + 1) }}</span>
                            @if (st.icon) {
                              <span class="flow-step__icon">{{ st.icon }}</span>
                            }
                          </div>
                          <div class="flow-step__card">
                            <h5 class="flow-step__title">{{ st.label }}</h5>
                            <p class="flow-step__desc">{{ st.desc }}</p>
                            @if (st.codeSnippet) {
                              <code class="flow-step__code">{{ st.codeSnippet }}</code>
                            }
                          </div>
                        </div>
                        @if ($index < (block.steps?.length ?? 0) - 1) {
                          <div class="flow-connector" aria-hidden="true">
                            <svg class="flow-connector__arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <line x1="12" y1="4" x2="12" y2="20"></line>
                              <polyline points="18 14 12 20 6 14"></polyline>
                            </svg>
                          </div>
                        }
                      }
                    </div>
                  }
                  @case ('comparison') {
                    <!-- MATRIZ COMPARATIVA -->
                    <div class="comparison-grid">
                      <div class="comparison-panel comparison-panel--left">
                        <div class="comparison-panel__header">
                          <span class="comparison-panel__tag">A</span>
                          <h5 class="comparison-panel__title">{{ block.leftLabel || 'Opción 1' }}</h5>
                        </div>
                        <ul class="comparison-panel__list">
                          @for (item of block.leftItems ?? []; track $index) {
                            <li>
                              <span class="comp-bullet comp-bullet--left">✓</span>
                              <span class="comp-text">{{ item }}</span>
                            </li>
                          }
                        </ul>
                      </div>

                      <div class="comparison-panel comparison-panel--right">
                        <div class="comparison-panel__header">
                          <span class="comparison-panel__tag">B</span>
                          <h5 class="comparison-panel__title">{{ block.rightLabel || 'Opción 2' }}</h5>
                        </div>
                        <ul class="comparison-panel__list">
                          @for (item of block.rightItems ?? []; track $index) {
                            <li>
                              <span class="comp-bullet comp-bullet--right">✦</span>
                              <span class="comp-text">{{ item }}</span>
                            </li>
                          }
                        </ul>
                      </div>
                    </div>
                  }
                  @case ('architecture') {
                    <!-- ARQUITECTURA / NODOS DE SISTEMA -->
                    <div class="arch-pipeline">
                      @for (st of block.steps ?? []; track $index) {
                        <div class="arch-node" [attr.data-tone]="st.tone || 'primary'">
                          <div class="arch-node__icon">{{ st.icon || '📦' }}</div>
                          <div class="arch-node__body">
                            <span class="arch-node__label">{{ st.label }}</span>
                            <span class="arch-node__desc">{{ st.desc }}</span>
                            @if (st.codeSnippet) {
                              <span class="arch-node__subpill">{{ st.codeSnippet }}</span>
                            }
                          </div>
                        </div>
                        @if ($index < (block.steps?.length ?? 0) - 1) {
                          <div class="arch-link">
                            <span class="arch-link__label">{{ st.tone === 'accent' ? 'JSON / HTTPS' : 'Data Bus' }}</span>
                            <div class="arch-link__ray"></div>
                          </div>
                        }
                      }
                    </div>
                  }
                  @case ('svg') {
                    <!-- GRÁFICO / DIBUJO VECTORIAL SVG -->
                    <div class="svg-drawing-container" [innerHTML]="safeSvg(block.svg_content)"></div>
                  }
                  @default {
                    @if (block.svg_content) {
                      <div class="svg-drawing-container" [innerHTML]="safeSvg(block.svg_content)"></div>
                    } @else if (block.text) {
                      <p class="diagram-plain-text">{{ block.text }}</p>
                    }
                  }
                }
              </div>

              @if (block.caption) {
                <figcaption class="diagram-figure__caption">
                  <span class="caption-light" aria-hidden="true">💡</span>
                  <span class="caption-text">{{ block.caption }}</span>
                </figcaption>
              }
            </figure>
          }
          @case ('graphic') {
            <!-- ALIAS A DIAGRAMA -->
            <figure class="diagram-figure" data-diagram-type="svg">
              @if (block.title) {
                <div class="diagram-figure__header">
                  <div class="diagram-figure__header-left">
                    <span class="diagram-figure__icon" aria-hidden="true">📐</span>
                    <h4 class="diagram-figure__title">{{ block.title }}</h4>
                  </div>
                  <span class="diagram-figure__badge">Ilustración Técnica</span>
                </div>
              }
              <div class="diagram-figure__body">
                @if (block.svg_content) {
                  <div class="svg-drawing-container" [innerHTML]="safeSvg(block.svg_content)"></div>
                } @else if (block.text) {
                  <p class="diagram-plain-text">{{ block.text }}</p>
                }
              </div>
              @if (block.caption) {
                <figcaption class="diagram-figure__caption">
                  <span class="caption-light" aria-hidden="true">💡</span>
                  <span class="caption-text">{{ block.caption }}</span>
                </figcaption>
              }
            </figure>
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

    /* ---------- DIAGRAMAS DIDÁCTICOS Y GRÁFICOS ---------- */
    .diagram-figure {
      margin: 2.25rem 0 2.5rem;
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg-surface-2) 90%, transparent), var(--bg-surface));
      box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.45);
      overflow: hidden;
    }
    .diagram-figure__header {
      display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex-wrap: wrap;
      padding: .85rem 1.25rem;
      background: var(--bg-surface-3);
      border-bottom: 1px solid var(--border);
    }
    .diagram-figure__header-left {
      display: flex; align-items: center; gap: .65rem;
    }
    .diagram-figure__icon { font-size: 1.2rem; line-height: 1; }
    .diagram-figure__title {
      margin: 0; font-size: 1rem; font-weight: var(--font-bold);
      color: var(--text-primary); letter-spacing: -0.01em;
    }
    .diagram-figure__badge {
      font-size: .72rem; font-weight: var(--font-semibold);
      color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);
      border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
      border-radius: 99px; padding: .2rem .7rem; text-transform: uppercase; letter-spacing: .05em;
    }
    .diagram-figure__body {
      padding: 1.35rem 1.25rem;
      overflow-x: auto;
    }
    .diagram-figure__caption {
      display: flex; align-items: flex-start; gap: .6rem;
      padding: .8rem 1.25rem;
      background: color-mix(in srgb, var(--bg-surface-3) 45%, var(--bg-base));
      border-top: 1px solid var(--border);
      font-size: .875rem; color: var(--text-secondary); line-height: 1.5;
    }
    .caption-light { font-size: 1.05rem; flex: none; line-height: 1.4; }
    .caption-text { margin: 0; }

    /* --- Memoria RAM --- */
    .memory-board {
      display: flex; flex-direction: column; gap: .55rem;
      min-width: 320px;
    }
    .memory-board__header {
      display: grid; grid-template-columns: 120px 150px 110px 1fr; gap: .75rem;
      padding: .4rem .75rem; font-size: .75rem; font-weight: var(--font-bold);
      text-transform: uppercase; letter-spacing: .06em; color: var(--text-muted);
      border-bottom: 1px dashed var(--border-hover);
    }
    .memory-board__grid {
      display: flex; flex-direction: column; gap: .45rem;
    }
    .memory-board__row {
      display: grid; grid-template-columns: 120px 150px 110px 1fr; gap: .75rem;
      align-items: center; padding: .65rem .75rem;
      border-radius: var(--radius-md); background: var(--bg-surface-2);
      border: 1px solid var(--border);
      transition: border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast);
    }
    .memory-board__row:hover {
      border-color: var(--row-accent);
      background: color-mix(in srgb, var(--row-accent) 7%, var(--bg-surface-2));
      transform: translateX(2px);
    }
    .mem-cell--addr code {
      font-family: var(--font-mono); font-size: .8rem;
      color: var(--accent); background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: .2rem .5rem; border-radius: 4px; border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .mem-badge-var {
      font-family: var(--font-mono); font-size: .85rem; font-weight: var(--font-bold);
      color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, transparent);
      padding: .25rem .6rem; border-radius: 4px; border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
      display: inline-block;
    }
    .mem-badge-type {
      font-size: .75rem; font-family: var(--font-mono);
      color: #c084fc; background: rgba(192, 132, 252, 0.12);
      padding: .2rem .5rem; border-radius: 4px; border: 1px solid rgba(192, 132, 252, 0.25);
      display: inline-block;
    }
    .mem-val-box {
      display: inline-flex; align-items: center;
      padding: .35rem .75rem; border-radius: var(--radius-sm);
      background: var(--bg-surface-3); border: 1px solid var(--border-hover);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .mem-val-text {
      font-family: var(--font-mono); font-size: .875rem; font-weight: var(--font-semibold);
      color: #f8fafc;
    }

    /* --- Flow Pipeline --- */
    .flow-pipeline {
      display: flex; flex-direction: column; gap: .4rem;
    }
    .flow-step {
      display: flex; gap: 1rem; align-items: flex-start;
    }
    .flow-step__indicator {
      display: flex; flex-direction: column; align-items: center; gap: .25rem;
      flex: none; width: 2.4rem;
    }
    .flow-step__num {
      width: 2.2rem; height: 2.2rem; border-radius: 50%;
      display: grid; place-items: center;
      font-size: .875rem; font-weight: var(--font-bold);
      color: var(--bg-base); background: var(--primary);
      box-shadow: 0 0 14px color-mix(in srgb, var(--primary) 45%, transparent);
    }
    .flow-step[data-tone='accent'] .flow-step__num {
      background: var(--accent);
      box-shadow: 0 0 14px color-mix(in srgb, var(--accent) 45%, transparent);
    }
    .flow-step[data-tone='warning'] .flow-step__num {
      background: #f59e0b;
      box-shadow: 0 0 14px rgba(245, 158, 11, 0.45);
    }
    .flow-step[data-tone='purple'] .flow-step__num {
      background: #a855f7;
      box-shadow: 0 0 14px rgba(168, 85, 247, 0.45);
    }
    .flow-step__icon { font-size: .85rem; }
    .flow-step__card {
      flex: 1; padding: .85rem 1.15rem;
      border-radius: var(--radius-md); background: var(--bg-surface-2);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
    .flow-step__title {
      margin: 0 0 .3rem; font-size: .95rem; font-weight: var(--font-bold);
      color: var(--text-primary);
    }
    .flow-step__desc {
      margin: 0; font-size: .875rem; color: var(--text-secondary); line-height: 1.5;
    }
    .flow-step__code {
      display: inline-block; margin-top: .5rem;
      font-family: var(--font-mono); font-size: .8rem;
      padding: .2rem .6rem; border-radius: 4px;
      color: var(--accent); background: var(--bg-surface-3);
      border: 1px solid var(--border-hover);
    }
    .flow-connector {
      display: flex; justify-content: flex-start;
      margin-left: 1.05rem; padding: .2rem 0;
      color: var(--accent); opacity: .85;
    }

    /* --- Matriz Comparativa --- */
    .comparison-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem;
    }
    .comparison-panel {
      padding: 1.15rem 1.25rem; border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }
    .comparison-panel--left {
      background: color-mix(in srgb, var(--primary) 5%, var(--bg-surface-2));
      border-color: color-mix(in srgb, var(--primary) 30%, var(--border));
    }
    .comparison-panel--right {
      background: color-mix(in srgb, #a855f7 6%, var(--bg-surface-2));
      border-color: color-mix(in srgb, #a855f7 32%, var(--border));
    }
    .comparison-panel__header {
      display: flex; align-items: center; gap: .65rem; margin-bottom: .95rem;
    }
    .comparison-panel__tag {
      width: 1.6rem; height: 1.6rem; border-radius: 6px;
      display: grid; place-items: center;
      font-size: .75rem; font-weight: var(--font-bold);
    }
    .comparison-panel--left .comparison-panel__tag { background: var(--primary); color: var(--bg-base); }
    .comparison-panel--right .comparison-panel__tag { background: #a855f7; color: var(--bg-base); }
    .comparison-panel__title {
      margin: 0; font-size: 1rem; font-weight: var(--font-bold); color: var(--text-primary);
    }
    .comparison-panel__list {
      list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: .55rem;
    }
    .comparison-panel__list li {
      display: flex; align-items: flex-start; gap: .6rem;
      font-size: .875rem; color: var(--text-secondary); line-height: 1.45;
    }
    .comp-bullet { flex: none; font-weight: var(--font-bold); }
    .comp-bullet--left { color: var(--primary); }
    .comp-bullet--right { color: #c084fc; }

    /* --- Arquitectura --- */
    .arch-pipeline {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
      gap: .85rem;
    }
    .arch-node {
      display: flex; align-items: center; gap: .8rem;
      padding: .85rem 1.15rem; border-radius: var(--radius-md);
      background: var(--bg-surface-2); border: 1px solid var(--border);
      min-width: 190px; flex: 1 1 190px;
      box-shadow: var(--shadow-sm);
    }
    .arch-node__icon { font-size: 1.6rem; flex: none; }
    .arch-node__body { display: flex; flex-direction: column; gap: .2rem; }
    .arch-node__label { font-size: .92rem; font-weight: var(--font-bold); color: var(--text-primary); }
    .arch-node__desc { font-size: .78rem; color: var(--text-muted); line-height: 1.35; }
    .arch-node__subpill {
      font-family: var(--font-mono); font-size: .72rem; color: var(--accent);
      background: color-mix(in srgb, var(--accent) 10%, transparent);
      padding: .15rem .45rem; border-radius: 4px; display: inline-block; width: fit-content;
    }
    .arch-link {
      display: flex; flex-direction: column; align-items: center; gap: .3rem; flex: none;
    }
    .arch-link__label {
      font-size: .68rem; font-weight: var(--font-semibold);
      color: var(--accent); letter-spacing: .06em; text-transform: uppercase;
    }
    .arch-link__ray {
      width: 38px; height: 2px;
      background: linear-gradient(90deg, var(--border), var(--accent), var(--border));
    }

    /* --- SVG Container --- */
    .svg-drawing-container {
      display: flex; justify-content: center; align-items: center;
      width: 100%; border-radius: var(--radius-md);
      background: #090b12; padding: 1.25rem 1rem;
      border: 1px solid var(--border); overflow-x: auto;
    }
    .svg-drawing-container ::ng-deep svg {
      max-width: 100%; height: auto; display: block;
      border-radius: 6px;
    }
    .diagram-plain-text {
      margin: 0; font-family: var(--font-mono); font-size: .85rem;
      color: var(--text-secondary); background: var(--bg-surface-3);
      padding: 1rem; border-radius: var(--radius-md);
    }

    /* --- Adaptabilidad Móvil --- */
    @media (max-width: 640px) {
      .memory-board__header {
        grid-template-columns: 85px 105px 75px 1fr;
        font-size: .68rem; gap: .4rem; padding: .3rem .4rem;
      }
      .memory-board__row {
        grid-template-columns: 85px 105px 75px 1fr;
        gap: .4rem; padding: .5rem .4rem;
      }
      .mem-cell--addr code { font-size: .7rem; padding: .15rem .3rem; }
      .mem-badge-var { font-size: .75rem; padding: .15rem .4rem; }
      .mem-badge-type { font-size: .7rem; padding: .15rem .35rem; }
      .mem-val-text { font-size: .75rem; }
      .comparison-grid { grid-template-columns: 1fr; }
      .arch-pipeline { flex-direction: column; align-items: stretch; }
      .arch-link__ray { width: 2px; height: 20px; background: linear-gradient(180deg, var(--border), var(--accent), var(--border)); }
      .arch-node { min-width: 100%; }
    }
  `],
})
export class LessonContentComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly blocks = input.required<LessonDocBlock[]>();
  readonly copied = signal<number | null>(null);
  readonly copyEvent = output<string>();

  private timer: ReturnType<typeof setTimeout> | null = null;

  safeSvg(svg?: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg || '');
  }

  diagramIcon(type?: string): string {
    switch (type) {
      case 'memory': return '🧠';
      case 'flow': return '⚡';
      case 'comparison': return '⚖️';
      case 'architecture': return '🏛️';
      case 'svg': return '📐';
      default: return '📊';
    }
  }

  diagramTypeLabel(type?: string): string {
    switch (type) {
      case 'memory': return 'Esquema de Memoria RAM';
      case 'flow': return 'Flujo de Ejecución';
      case 'comparison': return 'Matriz Comparativa';
      case 'architecture': return 'Arquitectura del Sistema';
      case 'svg': return 'Diagrama Vectorial';
      default: return 'Diagrama Didáctico';
    }
  }

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
