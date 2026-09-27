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
    <div class="simulated-ide" [class.is-fullscreen]="isFullscreen()">
      <!-- IDE HEADER TOOLBAR -->
      <div class="ide-toolbar">
        <div class="ide-toolbar__left">
          <!-- File Tab -->
          <div class="file-tab">
            <span class="file-tab__icon">{{ currentLangInfo().icon }}</span>
            <span class="file-tab__name">main{{ currentLangInfo().extension }}</span>
            <span class="file-tab__status-dot" [class.is-dirty]="isModified()"></span>
          </div>

          <!-- Language Selector -->
          <div class="lang-selector-wrap">
            <label for="lang-select" class="sr-only">Seleccionar Lenguaje</label>
            <select
              id="lang-select"
              class="lang-select"
              [ngModel]="currentLanguage()"
              (ngModelChange)="onLanguageChange($event)"
              [disabled]="running() || testing()"
            >
              @for (lang of languages; track lang.id) {
                <option [value]="lang.id">
                  {{ lang.icon }} {{ lang.name }} ({{ lang.version }})
                </option>
              }
            </select>
          </div>
        </div>

        <div class="ide-toolbar__right">
          <!-- Stdin Input Toggle -->
          <button
            type="button"
            class="ide-btn ide-btn--ghost"
            (click)="showStdin.set(!showStdin())"
            [class.is-active]="showStdin()"
            title="Ingresar datos de entrada estándar (stdin)"
          >
            <span class="btn-icon">📥</span>
            <span class="btn-text">stdin</span>
          </button>

          <!-- Reset Code -->
          <button
            type="button"
            class="ide-btn ide-btn--ghost"
            (click)="resetCode()"
            title="Reiniciar código inicial"
            [disabled]="running() || testing()"
          >
            <span class="btn-icon">↺</span>
            <span class="btn-text">Reiniciar</span>
          </button>

          <!-- Run Tests (if available) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="ide-btn ide-btn--test"
              (click)="runTests()"
              [disabled]="running() || testing() || !code().trim()"
              title="Ejecutar y validar todos los casos de prueba"
            >
              <span class="btn-icon">{{ testing() ? '⏳' : '🧪' }}</span>
              <span class="btn-text">{{ testing() ? 'Validando…' : 'Validar Reto' }}</span>
            </button>
          }

          <!-- Ask AI Socratic Help -->
          <button
            type="button"
            class="ide-btn ide-btn--ai"
            (click)="diagnoseWithAi()"
            [disabled]="aiLoading() || !code().trim()"
            title="Pedir diagnóstico y orientación socrática a Byte IA"
          >
            <span class="btn-icon">{{ aiLoading() ? '⚙️' : '🤖' }}</span>
            <span class="btn-text">{{ aiLoading() ? 'Analizando…' : 'Diagnosticar con Byte' }}</span>
          </button>

          <!-- Execute Code Primary Button -->
          <button
            type="button"
            class="ide-btn ide-btn--run"
            (click)="executeCode()"
            [disabled]="running() || testing() || !code().trim()"
            title="Ejecutar código en el sandbox local (Ctrl + Enter)"
          >
            <span class="btn-icon">{{ running() ? '⏳' : '▶' }}</span>
            <span class="btn-text">{{ running() ? 'Ejecutando…' : 'Ejecutar' }}</span>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="ide-btn ide-btn--icon"
            (click)="isFullscreen.set(!isFullscreen())"
            [title]="isFullscreen() ? 'Salir de pantalla completa' : 'Pantalla completa'"
          >
            {{ isFullscreen() ? '🗗' : '🗖' }}
          </button>
        </div>
      </div>

      <!-- STDIN DRAWER -->
      @if (showStdin()) {
        <div class="stdin-drawer">
          <div class="stdin-drawer__label">
            <span>📥 Entrada estándar (stdin)</span>
            <small>Los datos que leerá tu código con input(), readline, etc.</small>
          </div>
          <textarea
            class="stdin-drawer__input"
            rows="2"
            [ngModel]="stdin()"
            (ngModelChange)="stdin.set($event)"
            placeholder="Escribe aquí los datos de entrada por línea..."
          ></textarea>
        </div>
      }

      <!-- EDITOR WORKSPACE -->
      <div class="ide-workspace">
        <!-- CODE EDITOR PANEL -->
        <div class="editor-pane">
          <div class="editor-container">
            <!-- Line numbers gutter -->
            <div class="editor-gutter" aria-hidden="true">
              @for (line of lineNumbers(); track $index) {
                <div class="gutter-number">{{ line }}</div>
              }
            </div>

            <!-- Code input area -->
            <div class="editor-area">
              <textarea
                #codeTextarea
                class="editor-textarea"
                [ngModel]="code()"
                (ngModelChange)="code.set($event)"
                (keydown)="handleEditorKeyDown($event)"
                spellcheck="false"
                autocomplete="off"
                autocapitalize="off"
                placeholder="// Escribe o pega tu código aquí para experimentar..."
                aria-label="Editor de código de programación"
              ></textarea>
            </div>
          </div>

          <!-- Editor Footer Status Bar -->
          <div class="editor-statusbar">
            <div class="statusbar-left">
              <span class="status-item">
                <span class="status-indicator" [class.is-ok]="executionResult()?.exit_code === 0" [class.is-err]="executionResult() && executionResult()!.exit_code !== 0"></span>
                {{ currentLangInfo().name }} ({{ currentLangInfo().version }})
              </span>
              <span class="status-item">Líneas: {{ lineNumbers().length }}</span>
              <span class="status-item">Caracteres: {{ code().length }}</span>
            </div>
            <div class="statusbar-right">
              <span class="status-item">UTF-8</span>
              <span class="status-item">Espacios: 2</span>
              <span class="status-badge" [class.badge--local]="isLocalEngine()">
                {{ isLocalEngine() ? '⚡ Sandbox Local' : '🌐 Browser Native' }}
              </span>
            </div>
          </div>
        </div>

        <!-- TERMINAL & RESULTS PANEL -->
        <div class="terminal-pane">
          <!-- Terminal Tabs Bar -->
          <div class="terminal-nav">
            <div class="terminal-tabs">
              <button
                type="button"
                class="term-tab"
                [class.is-active]="activeTerminalTab() === 'terminal'"
                (click)="activeTerminalTab.set('terminal')"
              >
                <span class="tab-icon">🖥️</span>
                <span>Terminal</span>
                @if (executionResult()) {
                  <span
                    class="tab-pill"
                    [class.pill-success]="executionResult()!.exit_code === 0"
                    [class.pill-danger]="executionResult()!.exit_code !== 0"
                  >
                    exit {{ executionResult()!.exit_code }}
                  </span>
                }
              </button>

              @if (activeTestCases().length > 0 || (executionResult()?.tests && executionResult()!.tests!.length > 0)) {
                <button
                  type="button"
                  class="term-tab"
                  [class.is-active]="activeTerminalTab() === 'tests'"
                  (click)="activeTerminalTab.set('tests')"
                >
                  <span class="tab-icon">🧪</span>
                  <span>Casos de Prueba</span>
                  @if (testStats(); as stats) {
                    <span
                      class="tab-pill"
                      [class.pill-success]="stats.passed === stats.total"
                      [class.pill-danger]="stats.passed < stats.total"
                    >
                      {{ stats.passed }}/{{ stats.total }}
                    </span>
                  }
                </button>
              }

              @if (aiReply() || aiLoading()) {
                <button
                  type="button"
                  class="term-tab"
                  [class.is-active]="activeTerminalTab() === 'ai'"
                  (click)="activeTerminalTab.set('ai')"
                >
                  <span class="tab-icon">🤖</span>
                  <span>Byte Mentor</span>
                  @if (aiLoading()) {
                    <span class="tab-spinner">●</span>
                  }
                </button>
              }
            </div>

            <div class="terminal-actions">
              @if (executionResult()?.execution_time_ms !== undefined) {
                <span class="exec-time" title="Tiempo de ejecución del proceso">
                  ⚡ {{ executionResult()!.execution_time_ms }} ms
                </span>
              }
              <button
                type="button"
                class="term-action-btn"
                (click)="clearTerminal()"
                title="Limpiar la salida de la terminal"
              >
                🗑 Limpiar
              </button>
            </div>
          </div>

          <!-- Terminal Content Area -->
          <div class="terminal-viewport">
            <!-- TAB 1: TERMINAL (STDOUT / STDERR) -->
            @if (activeTerminalTab() === 'terminal') {
              <div class="terminal-body font-mono">
                <div class="term-line term-prompt">
                  <span class="prompt-user">syseng&#64;sandbox</span>:<span class="prompt-path">~/workspace</span>$
                  <span class="prompt-cmd">syseng-runner exec {{ currentLangInfo().extension }}</span>
                </div>

                @if (running()) {
                  <div class="term-loading">
                    <span class="term-spinner"></span>
                    <span>Compilando y ejecutando en entorno aislado...</span>
                  </div>
                } @else if (executionResult()) {
                  @let res = executionResult()!;
                  @if (res.stdout) {
                    <pre class="term-stdout">{{ res.stdout }}</pre>
                  }
                  @if (res.stderr) {
                    <pre class="term-stderr">{{ res.stderr }}</pre>
                  }
                  @if (!res.stdout && !res.stderr) {
                    <div class="term-empty">
                      El programa se ejecutó sin generar salida en stdout o stderr. (Código de salida: {{ res.exit_code }})
                    </div>
                  }
                  <div class="term-line term-exit" [class.term-exit--ok]="res.exit_code === 0" [class.term-exit--err]="res.exit_code !== 0">
                    <span>[Proceso finalizado con código {{ res.exit_code }} en {{ res.execution_time_ms }}ms]</span>
                  </div>
                } @else {
                  <div class="term-intro">
                    <p class="intro-title">💡 Entorno de Simulación Interactivo SysEngAcademy</p>
                    <p class="intro-desc">
                      Escribe tu código en el editor y presiona <strong class="key-combo">▶ Ejecutar</strong> o <strong class="key-combo">Ctrl + Enter</strong> para ver los resultados en esta consola en tiempo real.
                    </p>
                    <ul class="intro-tips">
                      <li>• Ejecución local nativa con Python 3.12, Node.js, Bun (TypeScript), PHP 8.3 y GCC C++.</li>
                      <li>• Si necesitas pasar valores a <code>input()</code>, haz clic en el botón <strong>📥 stdin</strong>.</li>
                      <li>• Si te surge una duda o bug, presiona <strong>🤖 Diagnosticar con Byte</strong> para orientación paso a paso.</li>
                    </ul>
                  </div>
                }
              </div>
            }

            <!-- TAB 2: TEST CASES -->
            @if (activeTerminalTab() === 'tests') {
              <div class="tests-body">
                @if (testing()) {
                  <div class="term-loading">
                    <span class="term-spinner"></span>
                    <span>Evaluando todos los casos de prueba...</span>
                  </div>
                } @else if (executionResult()?.tests && executionResult()!.tests!.length > 0) {
                  <div class="tests-header">
                    <h4>Resultados de Validación de Casos</h4>
                    @let stats = testStats()!;
                    <div class="tests-summary" [class.is-all-passed]="stats.passed === stats.total">
                      {{ stats.passed }} de {{ stats.total }} pruebas superadas
                    </div>
                  </div>

                  <div class="tests-list">
                    @for (test of executionResult()!.tests; track $index) {
                      <div class="test-item" [class.test-passed]="test.passed" [class.test-failed]="!test.passed">
                        <div class="test-item__head">
                          <span class="test-badge">{{ test.passed ? '✓ PASÓ' : '✗ FALLÓ' }}</span>
                          <span class="test-title">Prueba #{{ $index + 1 }}</span>
                        </div>
                        <div class="test-item__details font-mono">
                          @if (test.input) {
                            <div class="test-row">
                              <span class="test-label">Entrada (stdin):</span>
                              <pre class="test-val">{{ test.input }}</pre>
                            </div>
                          }
                          <div class="test-row">
                            <span class="test-label">Esperado:</span>
                            <pre class="test-val test-val--expected">{{ test.expected }}</pre>
                          </div>
                          <div class="test-row">
                            <span class="test-label">Obtenido:</span>
                            <pre class="test-val" [class.test-val--error]="!test.passed">{{ test.actual || '(vacío)' }}</pre>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="tests-empty">
                    <p>No se han ejecutado los casos de prueba todavía.</p>
                    <button type="button" class="ide-btn ide-btn--test" (click)="runTests()">
                      🧪 Validar Casos de Prueba Ahora
                    </button>
                  </div>
                }
              </div>
            }

            <!-- TAB 3: BYTE IA DIAGNOSIS -->
            @if (activeTerminalTab() === 'ai') {
              <div class="ai-body">
                <div class="ai-chat-header">
                  <div class="ai-avatar">🤖</div>
                  <div>
                    <h4>Byte IA - Asistente y Mentor Socrático</h4>
                    <small>Analizo tu código sin revelarte la solución directa para que aprendas programando.</small>
                  </div>
                </div>

                @if (aiLoading()) {
                  <div class="ai-loading-box">
                    <div class="ai-pulse-robot">🤖</div>
                    <p>Byte está analizando la estructura, sintaxis y complejidad de tu código…</p>
                  </div>
                } @else if (aiReply()) {
                  <div class="ai-response-content" [innerHTML]="renderMarkdown(aiReply()!)"></div>
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
      .simulated-ide {
        display: flex;
        flex-direction: column;
        background: #090d16;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        overflow: hidden;
        margin: var(--sp-4, 1.25rem) 0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        font-family: inherit;
        transition: all 0.25s ease;
      }

      .simulated-ide.is-fullscreen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        margin: 0;
        border-radius: 0;
        width: 100vw;
        height: 100vh;
      }

      /* TOOLBAR */
      .ide-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0f172a;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .ide-toolbar__left,
      .ide-toolbar__right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .file-tab {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: #1e293b;
        color: #f1f5f9;
        font-size: 0.8125rem;
        font-weight: 600;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .file-tab__status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
      }

      .file-tab__status-dot.is-dirty {
        background: #f59e0b;
      }

      .lang-select {
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        transition: border-color 0.15s;
      }

      .lang-select:focus {
        border-color: #06b6d4;
      }

      /* BUTTONS */
      .ide-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.8125rem;
        font-weight: 600;
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        line-height: 1;
      }

      .ide-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .ide-btn--ghost {
        background: rgba(255, 255, 255, 0.05);
        color: #cbd5e1;
        border-color: rgba(255, 255, 255, 0.08);
      }

      .ide-btn--ghost:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .ide-btn--ghost.is-active {
        background: rgba(6, 182, 212, 0.2);
        border-color: #06b6d4;
        color: #06b6d4;
      }

      .ide-btn--run {
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        font-weight: 700;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }

      .ide-btn--run:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }

      .ide-btn--test {
        background: #0ea5e9;
        color: #ffffff;
      }

      .ide-btn--test:hover:not(:disabled) {
        background: #0284c7;
      }

      .ide-btn--ai {
        background: rgba(99, 102, 241, 0.15);
        color: #a5b4fc;
        border-color: rgba(99, 102, 241, 0.4);
      }

      .ide-btn--ai:hover:not(:disabled) {
        background: rgba(99, 102, 241, 0.25);
        color: #fff;
        border-color: #818cf8;
      }

      .ide-btn--icon {
        background: transparent;
        color: #94a3b8;
        padding: 0.4rem 0.5rem;
      }

      .ide-btn--icon:hover {
        color: #fff;
      }

      /* STDIN DRAWER */
      .stdin-drawer {
        background: #111827;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0.65rem 0.85rem;
      }

      .stdin-drawer__label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #94a3b8;
        margin-bottom: 0.35rem;
      }

      .stdin-drawer__input {
        width: 100%;
        background: #030712;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: #f1f5f9;
        padding: 0.45rem 0.65rem;
        font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', monospace;
        font-size: 0.8125rem;
        resize: vertical;
        outline: none;
      }

      .stdin-drawer__input:focus {
        border-color: #06b6d4;
      }

      /* WORKSPACE LAYOUT (EDITOR + TERMINAL) */
      .ide-workspace {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 440px;
        max-height: 700px;
        background: #030712;
      }

      @media (max-width: 900px) {
        .ide-workspace {
          grid-template-columns: 1fr;
          max-height: none;
        }
      }

      /* EDITOR PANE */
      .editor-pane {
        display: flex;
        flex-direction: column;
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        background: #050914;
        position: relative;
        overflow: hidden;
      }

      .editor-container {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .editor-gutter {
        width: 44px;
        padding: 0.75rem 0;
        background: #070c1a;
        color: #475569;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 0.8125rem;
        line-height: 1.5;
        text-align: right;
        user-select: none;
        border-right: 1px solid rgba(255, 255, 255, 0.04);
      }

      .gutter-number {
        padding-right: 0.65rem;
      }

      .editor-area {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .editor-textarea {
        width: 100%;
        height: 100%;
        padding: 0.75rem;
        background: transparent;
        color: #f8fafc;
        border: none;
        outline: none;
        resize: none;
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
        font-size: 0.84rem;
        line-height: 1.5;
        white-space: pre;
        overflow-wrap: normal;
        overflow-x: auto;
        tab-size: 2;
      }

      .editor-statusbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #070c1a;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding: 0.25rem 0.75rem;
        font-size: 0.72rem;
        color: #64748b;
        user-select: none;
      }

      .statusbar-left,
      .statusbar-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-indicator {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #64748b;
        margin-right: 0.25rem;
      }

      .status-indicator.is-ok {
        background: #10b981;
      }

      .status-indicator.is-err {
        background: #ef4444;
      }

      .status-badge {
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
      }

      .status-badge.badge--local {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }

      /* TERMINAL PANE */
      .terminal-pane {
        display: flex;
        flex-direction: column;
        background: #020617;
        overflow: hidden;
      }

      .terminal-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0b1120;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0 0.5rem;
      }

      .terminal-tabs {
        display: flex;
        gap: 0.25rem;
      }

      .term-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        color: #94a3b8;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.5rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }

      .term-tab:hover {
        color: #f1f5f9;
      }

      .term-tab.is-active {
        color: #38bdf8;
        border-bottom-color: #38bdf8;
        background: rgba(56, 189, 248, 0.05);
      }

      .tab-pill {
        font-size: 0.68rem;
        padding: 0.08rem 0.35rem;
        border-radius: 4px;
        background: #1e293b;
      }

      .tab-pill.pill-success {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }

      .tab-pill.pill-danger {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }

      .tab-spinner {
        display: inline-block;
        animation: blink 1s infinite alternate;
        color: #818cf8;
      }

      .terminal-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .exec-time {
        font-size: 0.72rem;
        color: #10b981;
        font-weight: 600;
      }

      .term-action-btn {
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 0.72rem;
        cursor: pointer;
        padding: 0.25rem 0.4rem;
        border-radius: 4px;
      }

      .term-action-btn:hover {
        color: #f1f5f9;
        background: rgba(255, 255, 255, 0.05);
      }

      .terminal-viewport {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
        min-height: 280px;
      }

      /* TERMINAL VIEWPORT DETAILS */
      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      }

      .terminal-body {
        font-size: 0.8125rem;
        line-height: 1.5;
        color: #e2e8f0;
      }

      .term-line {
        margin-bottom: 0.5rem;
      }

      .prompt-user {
        color: #34d399;
      }

      .prompt-path {
        color: #38bdf8;
      }

      .prompt-cmd {
        color: #f1f5f9;
        font-weight: 600;
      }

      .term-loading {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem 0;
        color: #38bdf8;
        font-size: 0.8125rem;
      }

      .term-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(56, 189, 248, 0.3);
        border-top-color: #38bdf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .term-stdout {
        margin: 0;
        color: #f8fafc;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .term-stderr {
        margin: 0.5rem 0;
        padding: 0.5rem 0.75rem;
        background: rgba(239, 68, 68, 0.1);
        border-left: 3px solid #ef4444;
        color: #fca5a5;
        white-space: pre-wrap;
        word-break: break-word;
        border-radius: 0 4px 4px 0;
      }

      .term-empty {
        color: #64748b;
        font-style: italic;
        padding: 0.5rem 0;
      }

      .term-exit {
        margin-top: 0.75rem;
        font-size: 0.75rem;
        color: #64748b;
      }

      .term-exit--ok {
        color: #10b981;
      }

      .term-exit--err {
        color: #ef4444;
      }

      .term-intro {
        color: #94a3b8;
        font-size: 0.8125rem;
      }

      .intro-title {
        color: #f1f5f9;
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }

      .intro-desc {
        line-height: 1.5;
        margin-bottom: 0.75rem;
      }

      .key-combo {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.1);
        padding: 0.1rem 0.3rem;
        border-radius: 4px;
      }

      .intro-tips {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        font-size: 0.75rem;
        color: #64748b;
      }

      /* TESTS VIEW */
      .tests-body {
        padding: 0.25rem 0;
      }

      .tests-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .tests-header h4 {
        margin: 0;
        font-size: 0.875rem;
        color: #f1f5f9;
      }

      .tests-summary {
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
      }

      .tests-summary.is-all-passed {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }

      .tests-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .test-item {
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
      }

      .test-item.test-passed {
        border-left: 3px solid #10b981;
      }

      .test-item.test-failed {
        border-left: 3px solid #ef4444;
      }

      .test-item__head {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.65rem;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      }

      .test-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.1rem 0.35rem;
        border-radius: 4px;
      }

      .test-passed .test-badge {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
      }

      .test-failed .test-badge {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }

      .test-title {
        font-size: 0.78rem;
        font-weight: 600;
        color: #e2e8f0;
      }

      .test-item__details {
        padding: 0.5rem 0.65rem;
        font-size: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .test-row {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .test-label {
        color: #64748b;
        font-size: 0.68rem;
      }

      .test-val {
        margin: 0;
        padding: 0.25rem 0.45rem;
        border-radius: 4px;
        background: #030712;
        color: #f1f5f9;
        white-space: pre-wrap;
      }

      .test-val--expected {
        color: #38bdf8;
      }

      .test-val--error {
        color: #f87171;
        background: rgba(239, 68, 68, 0.1);
      }

      .tests-empty {
        text-align: center;
        padding: 2rem 1rem;
        color: #94a3b8;
      }

      /* AI CHAT VIEW */
      .ai-body {
        padding: 0.25rem 0;
      }

      .ai-chat-header {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 0.75rem;
      }

      .ai-avatar {
        font-size: 1.5rem;
      }

      .ai-chat-header h4 {
        margin: 0;
        font-size: 0.875rem;
        color: #f1f5f9;
      }

      .ai-chat-header small {
        color: #94a3b8;
        font-size: 0.72rem;
      }

      .ai-loading-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.65rem;
        padding: 2rem 1rem;
        text-align: center;
        color: #a5b4fc;
        font-size: 0.8125rem;
      }

      .ai-pulse-robot {
        font-size: 2rem;
        animation: pulse 1.5s infinite;
      }

      .ai-response-content {
        background: #0f172a;
        border: 1px solid rgba(99, 102, 241, 0.25);
        border-radius: 8px;
        padding: 0.85rem;
        color: #e2e8f0;
        font-size: 0.84rem;
        line-height: 1.6;
      }

      .ai-response-content pre {
        background: #020617;
        padding: 0.65rem;
        border-radius: 6px;
        overflow-x: auto;
        color: #38bdf8;
      }

      .ai-response-content code {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.15rem 0.35rem;
        border-radius: 4px;
        font-size: 0.78rem;
      }

      /* ANIMATIONS */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.15);
          opacity: 0.7;
        }
      }

      @keyframes blink {
        from {
          opacity: 0.3;
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
    return Array.from({ length: Math.max(lines, 12) }, (_, i) => i + 1);
  });

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  onLanguageChange(newLang: string) {
    this.currentLanguage.set(newLang);
    // If code is empty or untouched, switch template
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

    // Tab key handling: indent with 2 spaces instead of changing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const tabSpaces = '  ';
      this.code.set(val.substring(0, start) + tabSpaces + val.substring(end));

      // Restore cursor position after Angular re-renders
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
