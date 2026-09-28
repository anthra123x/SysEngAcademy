import {
  Component,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CodeExecutionResponse,
  CodeExecutionService,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TestCase,
} from '../../../core/services/code-execution.service';
import { CoursesService } from '../../../core/services/courses.service';
import { AiChatService } from '../../../core/services/ai-chat.service';

@Component({
  selector: 'app-interactive-ide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mini-ide" [class.is-fullscreen]="isFullscreen()">
      <!-- COMPACT HEADER BAR -->
      <div class="ide-bar">
        <div class="ide-bar__left">
          <!-- File Indicator -->
          <div class="file-pill">
            <span class="file-dot" [class.is-dirty]="isModified()"></span>
            <span class="file-name">solution{{ currentLangInfo().extension }}</span>
          </div>

          <!-- Language Selector -->
          <div class="lang-picker">
            <label for="lang-select" class="sr-only">Lenguaje</label>
            <select
              id="lang-select"
              class="lang-select"
              [ngModel]="currentLanguage()"
              (ngModelChange)="onLanguageChange($event)"
              [disabled]="running() || testing()"
            >
              @for (lang of languages; track lang.id) {
                <option [value]="lang.id">
                  {{ lang.name }}
                </option>
              }
            </select>
          </div>
        </div>

        <div class="ide-bar__right">
          <!-- Reset Code -->
          <button
            type="button"
            class="tool-btn"
            (click)="resetCode()"
            title="Reiniciar al código base"
            [disabled]="running() || testing()"
            aria-label="Reiniciar código"
          >
            <span>↺</span>
          </button>

          <!-- Stdin Input Toggle -->
          <button
            type="button"
            class="tool-btn tool-btn--text"
            [class.is-active]="showStdin()"
            (click)="showStdin.set(!showStdin())"
            title="Entrada estándar por teclado (stdin)"
          >
            <span>stdin</span>
          </button>

          <!-- Ask AI Socratic Help -->
          <button
            type="button"
            class="tool-btn tool-btn--ai"
            (click)="diagnoseWithAi()"
            [disabled]="aiLoading() || !code().trim()"
            title="Pedir orientación conceptual a Byte IA"
          >
            <span class="ai-icon">{{ aiLoading() ? '⚙️' : '🤖' }}</span>
            <span class="ai-label">{{ aiLoading() ? 'Byte…' : 'Byte IA' }}</span>
          </button>

          <!-- Run Tests (if challenge has test cases) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="action-btn action-btn--test"
              (click)="runTests()"
              [disabled]="running() || testing() || !code().trim()"
              title="Validar casos de prueba del reto"
            >
              <span class="btn-icon">{{ testing() ? '⏳' : '✓' }}</span>
              <span>{{ testing() ? 'Validando…' : 'Validar Reto' }}</span>
            </button>
          }

          <!-- Execute Code Primary Button -->
          <button
            type="button"
            class="action-btn action-btn--run"
            (click)="executeCode()"
            [disabled]="running() || testing() || !code().trim()"
            title="Ejecutar código (Ctrl + Enter)"
          >
            <span class="btn-icon">{{ running() ? '⏳' : '▶' }}</span>
            <span>{{ running() ? 'Ejecutando…' : 'Ejecutar' }}</span>
            <kbd class="key-hint">Ctrl ↵</kbd>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="tool-btn"
            (click)="isFullscreen.set(!isFullscreen())"
            [title]="isFullscreen() ? 'Salir de pantalla completa' : 'Pantalla completa'"
            aria-label="Pantalla completa"
          >
            <span>{{ isFullscreen() ? '✕' : '⛶' }}</span>
          </button>
        </div>
      </div>

      <!-- INLINE STDIN ROW (when toggled) -->
      @if (showStdin()) {
        <div class="stdin-bar">
          <label for="stdin-input" class="stdin-label">&gt; stdin:</label>
          <input
            id="stdin-input"
            type="text"
            class="stdin-input"
            [ngModel]="stdin()"
            (ngModelChange)="stdin.set($event)"
            placeholder="Valores de entrada separados por espacio o salto de línea..."
          />
        </div>
      }

      <!-- WORKSPACE: CODE EDITOR + CONSOLE -->
      <div class="ide-workspace">
        <!-- CODE EDITOR PANEL -->
        <div class="editor-pane">
          <div class="editor-gutter" aria-hidden="true">
            @for (line of lineNumbers(); track $index) {
              <div class="gutter-num">{{ line }}</div>
            }
          </div>

          <div class="editor-body">
            <textarea
              #codeTextarea
              class="editor-input"
              [ngModel]="code()"
              (ngModelChange)="code.set($event)"
              (keydown)="handleEditorKeyDown($event)"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              placeholder="// Escribe aquí tu solución..."
              aria-label="Editor de código"
            ></textarea>
          </div>
        </div>

        <!-- CONSOLE / OUTPUT PANEL -->
        <div class="console-pane">
          <!-- Console Tabs Header -->
          <div class="console-nav">
            <div class="console-tabs">
              <button
                type="button"
                class="tab-item"
                [class.is-active]="activeTerminalTab() === 'terminal'"
                (click)="activeTerminalTab.set('terminal')"
              >
                <span>Consola</span>
                @if (executionResult()) {
                  <span
                    class="status-dot"
                    [class.is-ok]="executionResult()!.exit_code === 0"
                    [class.is-err]="executionResult()!.exit_code !== 0"
                  ></span>
                }
              </button>

              @if (activeTestCases().length > 0 || (executionResult()?.tests && executionResult()!.tests!.length > 0)) {
                <button
                  type="button"
                  class="tab-item"
                  [class.is-active]="activeTerminalTab() === 'tests'"
                  (click)="activeTerminalTab.set('tests')"
                >
                  <span>Tests</span>
                  @if (testStats(); as stats) {
                    <span
                      class="score-pill"
                      [class.is-passed]="stats.passed === stats.total"
                      [class.is-failed]="stats.passed < stats.total"
                    >
                      {{ stats.passed }}/{{ stats.total }}
                    </span>
                  }
                </button>
              }

              @if (aiReply() || aiLoading()) {
                <button
                  type="button"
                  class="tab-item"
                  [class.is-active]="activeTerminalTab() === 'ai'"
                  (click)="activeTerminalTab.set('ai')"
                >
                  <span>Byte IA</span>
                  @if (aiLoading()) {
                    <span class="tab-pulse">●</span>
                  }
                </button>
              }
            </div>

            <div class="console-actions">
              @if (executionResult()?.execution_time_ms !== undefined) {
                <span class="time-tag">{{ executionResult()!.execution_time_ms }}ms</span>
              }
              @if (executionResult()) {
                <button
                  type="button"
                  class="btn-clear"
                  (click)="clearTerminal()"
                  title="Limpiar consola"
                >
                  Limpiar
                </button>
              }
            </div>
          </div>

          <!-- Console Viewport -->
          <div class="console-viewport font-mono">
            <!-- TAB: TERMINAL / STDOUT -->
            @if (activeTerminalTab() === 'terminal') {
              <div class="output-flow">
                @if (running()) {
                  <div class="output-state output-state--running">
                    <span class="spinner"></span>
                    <span>Ejecutando en entorno aislado...</span>
                  </div>
                } @else if (executionResult()) {
                  @let res = executionResult()!;
                  @if (res.stdout) {
                    <pre class="stdout-block">{{ res.stdout }}</pre>
                  }
                  @if (res.stderr) {
                    <pre class="stderr-block">{{ res.stderr }}</pre>
                  }
                  @if (!res.stdout && !res.stderr) {
                    <div class="output-quiet">
                      <span>Proceso finalizado sin generar salida (stdout/stderr).</span>
                    </div>
                  }
                  <div
                    class="exit-line"
                    [class.is-ok]="res.exit_code === 0"
                    [class.is-err]="res.exit_code !== 0"
                  >
                    <span>[Finalizado con código {{ res.exit_code }} · {{ res.execution_time_ms }}ms]</span>
                  </div>
                } @else {
                  <div class="output-placeholder">
                    <p class="placeholder-main">// Salida de la consola...</p>
                    <p class="placeholder-sub">Presiona <strong>Ejecutar</strong> o <strong>Ctrl + Enter</strong> para ver los resultados.</p>
                  </div>
                }
              </div>
            }

            <!-- TAB: TESTS -->
            @if (activeTerminalTab() === 'tests') {
              <div class="tests-flow">
                @if (testing()) {
                  <div class="output-state output-state--running">
                    <span class="spinner"></span>
                    <span>Validando casos de prueba...</span>
                  </div>
                } @else if (executionResult()?.tests && executionResult()!.tests!.length > 0) {
                  <div class="tests-list">
                    @for (test of executionResult()!.tests; track $index) {
                      <div class="test-item" [class.is-ok]="test.passed" [class.is-fail]="!test.passed">
                        <div class="test-item__head">
                          <span class="test-icon">{{ test.passed ? '✓' : '✗' }}</span>
                          <span class="test-title">Prueba #{{ $index + 1 }}</span>
                          <span class="test-state">{{ test.passed ? 'Aprobada' : 'Fallida' }}</span>
                        </div>
                        @if (!test.passed) {
                          <div class="test-item__diff">
                            @if (test.input) {
                              <div class="diff-row">
                                <span class="diff-lbl">Entrada:</span>
                                <code>{{ test.input }}</code>
                              </div>
                            }
                            <div class="diff-row">
                              <span class="diff-lbl">Esperado:</span>
                              <code class="diff-exp">{{ test.expected }}</code>
                            </div>
                            <div class="diff-row">
                              <span class="diff-lbl">Obtenido:</span>
                              <code class="diff-act">{{ test.actual || '(vacío)' }}</code>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="output-placeholder">
                    <p class="placeholder-main">// Casos de prueba sin ejecutar</p>
                    <button type="button" class="btn-run-tests" (click)="runTests()">
                      Validar Casos de Prueba
                    </button>
                  </div>
                }
              </div>
            }

            <!-- TAB: BYTE IA -->
            @if (activeTerminalTab() === 'ai') {
              <div class="ai-flow">
                @if (aiLoading()) {
                  <div class="output-state output-state--running">
                    <span class="spinner"></span>
                    <span>Byte IA está analizando tu código…</span>
                  </div>
                } @else if (aiReply()) {
                  <div class="ai-bubble" [innerHTML]="renderMarkdown(aiReply()!)"></div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .mini-ide {
        display: flex;
        flex-direction: column;
        background: #090d16;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        overflow: hidden;
        margin: 1.25rem 0;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        font-family: inherit;
        transition: all 0.2s ease;
      }

      .mini-ide.is-fullscreen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        margin: 0;
        border-radius: 0;
        width: 100vw;
        height: 100vh;
      }

      /* HEADER TOOLBAR */
      .ide-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0d131f;
        padding: 0.4rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .ide-bar__left,
      .ide-bar__right {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .file-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        font-size: 0.78rem;
        color: #e2e8f0;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }

      .file-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
      }

      .file-dot.is-dirty {
        background: #f59e0b;
      }

      .lang-select {
        background: transparent;
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0.25rem 0.45rem;
        border-radius: 6px;
        font-size: 0.76rem;
        cursor: pointer;
        outline: none;
        transition: color 0.15s, border-color 0.15s;

        &:hover,
        &:focus {
          color: #f1f5f9;
          border-color: rgba(255, 255, 255, 0.2);
        }

        option {
          background: #0d131f;
          color: #f1f5f9;
        }
      }

      /* BUTTONS */
      .tool-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        color: #94a3b8;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          color: #f1f5f9;
          background: rgba(255, 255, 255, 0.05);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.is-active {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.25);
        }
      }

      .tool-btn--text {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.55rem;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .tool-btn--ai {
        gap: 0.3rem;
        background: rgba(99, 102, 241, 0.12);
        color: #a5b4fc;
        border: 1px solid rgba(99, 102, 241, 0.25);
        font-size: 0.76rem;
        font-weight: 600;
        padding: 0.25rem 0.6rem;

        &:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.22);
          color: #ffffff;
        }
      }

      .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.3rem 0.7rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .action-btn--run {
        background: #10b981;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #059669;
        }

        .key-hint {
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.68rem;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          margin-left: 0.25rem;
          font-family: inherit;
        }
      }

      .action-btn--test {
        background: #0284c7;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #0369a1;
        }
      }

      /* STDIN BAR */
      .stdin-bar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #0a0e17;
        padding: 0.35rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .stdin-label {
        font-size: 0.75rem;
        color: #64748b;
        font-family: monospace;
      }

      .stdin-input {
        flex: 1;
        background: #03060c;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 4px;
        color: #f1f5f9;
        font-size: 0.78rem;
        padding: 0.2rem 0.5rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        outline: none;

        &:focus {
          border-color: #38bdf8;
        }
      }

      /* WORKSPACE LAYOUT */
      .ide-workspace {
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        min-height: 380px;
        max-height: 520px;
        background: #050811;
      }

      @media (max-width: 860px) {
        .ide-workspace {
          grid-template-columns: 1fr;
          max-height: none;
        }
      }

      /* EDITOR COLUMN */
      .editor-pane {
        display: flex;
        border-right: 1px solid rgba(255, 255, 255, 0.07);
        background: #060913;
        overflow: hidden;
      }

      .editor-gutter {
        width: 38px;
        padding: 0.75rem 0;
        background: #080d1a;
        color: #475569;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.78rem;
        line-height: 1.55;
        text-align: right;
        user-select: none;
        border-right: 1px solid rgba(255, 255, 255, 0.04);
      }

      .gutter-num {
        padding-right: 0.5rem;
      }

      .editor-body {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .editor-input {
        width: 100%;
        height: 100%;
        padding: 0.75rem;
        background: transparent;
        color: #f8fafc;
        border: none;
        outline: none;
        resize: none;
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        font-size: 0.83rem;
        line-height: 1.55;
        white-space: pre;
        overflow-x: auto;
        tab-size: 2;
        caret-color: #38bdf8;
      }

      /* CONSOLE COLUMN */
      .console-pane {
        display: flex;
        flex-direction: column;
        background: #03060c;
        overflow: hidden;
      }

      .console-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0a0f1c;
        padding: 0 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        min-height: 32px;
      }

      .console-tabs {
        display: flex;
        gap: 0.25rem;
      }

      .tab-item {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        color: #94a3b8;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.35rem 0.55rem;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          color: #f1f5f9;
        }

        &.is-active {
          color: #38bdf8;
          border-bottom-color: #38bdf8;
        }
      }

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #64748b;

        &.is-ok {
          background: #10b981;
        }

        &.is-err {
          background: #ef4444;
        }
      }

      .score-pill {
        font-size: 0.68rem;
        padding: 0.05rem 0.35rem;
        border-radius: 4px;
        background: #1e293b;
        color: #94a3b8;

        &.is-passed {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
        }

        &.is-failed {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
      }

      .tab-pulse {
        display: inline-block;
        color: #818cf8;
        font-size: 0.6rem;
        animation: blink 1s infinite alternate;
      }

      .console-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .time-tag {
        font-size: 0.7rem;
        color: #64748b;
        font-family: monospace;
      }

      .btn-clear {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 0.72rem;
        cursor: pointer;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;

        &:hover {
          color: #e2e8f0;
          background: rgba(255, 255, 255, 0.05);
        }
      }

      /* CONSOLE VIEWPORT */
      .console-viewport {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
        font-size: 0.8rem;
        line-height: 1.5;
        background: #03060c;
      }

      .output-placeholder {
        padding: 1.5rem 0.5rem;
        color: #475569;

        .placeholder-main {
          margin: 0 0 0.35rem 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #64748b;
        }

        .placeholder-sub {
          margin: 0;
          font-size: 0.75rem;
          color: #475569;
          font-family: inherit;

          strong {
            color: #94a3b8;
          }
        }
      }

      .output-state--running {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 0;
        color: #38bdf8;
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(56, 189, 248, 0.2);
        border-top-color: #38bdf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .stdout-block {
        margin: 0 0 0.5rem 0;
        color: #f1f5f9;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .stderr-block {
        margin: 0 0 0.5rem 0;
        color: #f87171;
        background: rgba(239, 68, 68, 0.08);
        padding: 0.5rem;
        border-radius: 4px;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .output-quiet {
        color: #64748b;
        font-style: italic;
        padding: 0.5rem 0;
      }

      .exit-line {
        font-size: 0.72rem;
        color: #64748b;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.06);

        &.is-err {
          color: #f87171;
        }
      }

      /* TESTS TAB */
      .tests-list {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .test-item {
        background: #080d19;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 6px;
        padding: 0.4rem 0.6rem;

        &.is-ok {
          border-left: 3px solid #10b981;
        }

        &.is-fail {
          border-left: 3px solid #ef4444;
        }
      }

      .test-item__head {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
      }

      .test-icon {
        font-weight: bold;
      }

      .test-item.is-ok .test-icon {
        color: #10b981;
      }

      .test-item.is-fail .test-icon {
        color: #ef4444;
      }

      .test-title {
        font-weight: 600;
        color: #e2e8f0;
        flex: 1;
      }

      .test-state {
        font-size: 0.7rem;
        color: #94a3b8;
      }

      .test-item__diff {
        margin-top: 0.35rem;
        padding-top: 0.35rem;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.72rem;
      }

      .diff-row {
        display: flex;
        gap: 0.35rem;
        align-items: baseline;
      }

      .diff-lbl {
        color: #64748b;
        min-width: 55px;
      }

      .diff-exp {
        color: #38bdf8;
      }

      .diff-act {
        color: #f87171;
      }

      .btn-run-tests {
        margin-top: 0.75rem;
        background: #0284c7;
        color: #fff;
        border: none;
        padding: 0.35rem 0.75rem;
        border-radius: 4px;
        font-size: 0.75rem;
        cursor: pointer;

        &:hover {
          background: #0369a1;
        }
      }

      /* AI TAB */
      .ai-bubble {
        background: #090e1c;
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 6px;
        padding: 0.75rem;
        color: #cbd5e1;
        font-size: 0.8rem;
        line-height: 1.55;
        font-family: inherit;

        pre {
          background: #02050b;
          padding: 0.5rem;
          border-radius: 4px;
          color: #38bdf8;
          overflow-x: auto;
          margin: 0.5rem 0;
        }

        code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
        }
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes blink {
        from {
          opacity: 0.2;
        }
        to {
          opacity: 1;
        }
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `
  ]
})
export class InteractiveIdeComponent {
  private readonly codeRunner = inject(CodeExecutionService);
  private readonly coursesSvc = inject(CoursesService);
  private readonly aiChatSvc = inject(AiChatService);

  @ViewChild('codeTextarea') codeTextareaRef?: ElementRef<HTMLTextAreaElement>;

  // Inputs
  readonly initialCode = input<string>('');
  readonly language = input<string>('python');
  readonly testCases = input<any>([]);
  readonly hint = input<string | null | undefined>(null);
  readonly lessonTitle = input<string>('');
  readonly lessonId = input<number | undefined>(undefined);
  readonly isChallenge = input<boolean>(false);

  // Supported languages list
  readonly languages: SupportedLanguage[] = SUPPORTED_LANGUAGES;

  // State signals
  readonly currentLanguage = signal<string>('python');
  readonly code = signal<string>('');
  readonly stdin = signal<string>('');
  readonly showStdin = signal<boolean>(false);
  readonly isFullscreen = signal<boolean>(false);
  readonly isModified = signal<boolean>(false);

  readonly running = signal<boolean>(false);
  readonly testing = signal<boolean>(false);
  readonly aiLoading = signal<boolean>(false);

  readonly activeTerminalTab = signal<'terminal' | 'tests' | 'ai'>('terminal');
  readonly executionResult = signal<CodeExecutionResponse | null>(null);
  readonly aiReply = signal<string | null>(null);

  constructor() {
    // Sync initial code & language when inputs change
    effect(() => {
      const initLang = this.language() || 'python';
      this.currentLanguage.set(initLang);
      const initCode = this.initialCode() || this.getDefaultTemplate(initLang);
      this.code.set(initCode);
      this.isModified.set(false);
    });
  }

  readonly currentLangInfo = computed(() => {
    const langId = this.currentLanguage();
    return this.languages.find(l => l.id === langId) || this.languages[0];
  });

  readonly isLocalEngine = computed(() => {
    return this.currentLanguage() !== 'pseint';
  });

  readonly activeTestCases = computed<TestCase[]>(() => {
    const raw = this.testCases();
    if (!Array.isArray(raw)) return [];
    return raw.map(item => {
      if (Array.isArray(item)) {
        return { input: (item[0] as string) ?? '', expected: (item[1] as string) ?? '' };
      }
      return { input: (item?.input as string) ?? '', expected: (item?.expected as string) ?? '' };
    });
  });

  readonly lineNumbers = computed(() => {
    const lines = this.code().split('\n').length;
    return Array.from({ length: Math.max(lines, 10) }, (_, i) => i + 1);
  });

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  onLanguageChange(newLang: string) {
    this.currentLanguage.set(newLang);
    if (!this.isModified() || this.code().trim().length === 0) {
      this.code.set(this.getDefaultTemplate(newLang));
      this.isModified.set(false);
    }
  }

  getDefaultTemplate(langId: string): string {
    const found = this.languages.find(l => l.id === langId);
    return found?.defaultTemplate || '# Código inicial\n';
  }

  resetCode() {
    const resetTo = this.initialCode() || this.getDefaultTemplate(this.currentLanguage());
    this.code.set(resetTo);
    this.isModified.set(false);
  }

  clearTerminal() {
    this.executionResult.set(null);
  }

  handleEditorKeyDown(e: KeyboardEvent) {
    this.isModified.set(true);

    // Ctrl + Enter or Cmd + Enter to Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.executeCode();
      return;
    }

    // Tab key: indent with 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const tabSpaces = '  ';
      this.code.set(val.substring(0, start) + tabSpaces + val.substring(end));

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
      }, 0);
    }
  }

  executeCode() {
    if (this.running() || !this.code().trim()) return;

    this.running.set(true);
    this.activeTerminalTab.set('terminal');

    this.codeRunner
      .execute(this.currentLanguage(), this.code(), this.stdin(), [])
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.running.set(false);
        },
        error: err => {
          this.running.set(false);
          this.executionResult.set({
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error de conexión con el motor de ejecución.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          });
        },
      });
  }

  runTests() {
    const tests = this.activeTestCases();
    if (this.testing() || tests.length === 0 || !this.code().trim()) return;

    this.testing.set(true);
    this.activeTerminalTab.set('tests');

    this.codeRunner
      .execute(this.currentLanguage(), this.code(), '', tests)
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.testing.set(false);
        },
        error: err => {
          this.testing.set(false);
          this.executionResult.set({
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error al ejecutar las pruebas.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          });
        },
      });
  }

  diagnoseWithAi() {
    if (this.aiLoading() || !this.code().trim()) return;

    this.aiLoading.set(true);
    this.activeTerminalTab.set('ai');
    this.aiReply.set(null);

    const lessonId = this.lessonId();
    if (lessonId) {
      this.coursesSvc.askAi(lessonId, this.code()).subscribe({
        next: res => {
          this.aiReply.set(res.reply);
          this.aiLoading.set(false);
        },
        error: () => {
          this.askAiViaGlobalAssistant();
        },
      });
    } else {
      this.askAiViaGlobalAssistant();
    }
  }

  private askAiViaGlobalAssistant() {
    const prompt = `Como asistente de programación socrático Byte IA en SysEngAcademy, analiza el siguiente código en ${this.currentLanguage()} para la lección "${this.lessonTitle()}":
\`\`\`${this.currentLanguage()}
${this.code()}
\`\`\`
${this.hint() ? `Pistas del reto: ${this.hint()}` : ''}

Por favor, proporciona retroalimentación constructiva:
1. Explica si la lógica es correcta o dónde puede haber un bug / error de sintaxis sin dar la solución regalada directamente.
2. Da 1 o 2 pistas para que el estudiante reflexione y lo solucione.
3. Menciona una buena práctica o convención relevante.`;

    this.aiChatSvc
      .askAI({
        kind: 'code_review',
        code: this.code(),
        question: prompt,
        lesson_id: this.lessonId(),
      })
      .subscribe({
        next: (res: { reply: string }) => {
          this.aiReply.set(res.reply);
          this.aiLoading.set(false);
        },
        error: (_err: unknown) => {
          this.aiLoading.set(false);
          this.aiReply.set(
            'Byte está experimentando alta demanda en este momento. Revisa tu sintaxis, verifica que los tipos de datos coincidan y prueba agregando prints intermedios.'
          );
        },
      });
  }

  renderMarkdown(text: string): string {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return esc
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
