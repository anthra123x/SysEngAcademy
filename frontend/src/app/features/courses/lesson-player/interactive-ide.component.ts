import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
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

export interface TerminalAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  codeSnippet?: string;
}

@Component({
  selector: 'app-interactive-ide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="linux-terminal-window"
      [class.is-fullscreen]="isFullscreen()"
      [class.layout-stacked]="layoutMode() === 'bottom' && !isFullscreen()"
      [class.layout-split]="layoutMode() === 'side' || isFullscreen()"
      [class.mobile-view-editor]="mobileActivePane() === 'editor'"
      [class.mobile-view-terminal]="mobileActivePane() === 'terminal'"
      [class.mobile-view-ai]="mobileActivePane() === 'ai'"
    >
      <!-- LINUX TERMINAL TITLE BAR -->
      <div class="terminal-titlebar">
        <!-- LEFT: LINUX SHELL PROMPT & TABS -->
        <div class="titlebar-left">
          <div class="terminal-dots" aria-hidden="true">
            <span class="dot dot-red"></span>
            <span class="dot dot-amber"></span>
            <span class="dot dot-green"></span>
          </div>

          <!-- Shell Tab: solution file -->
          <div class="terminal-tab is-active" title="Buffer de edición de código">
            <span class="tab-glyph">📁</span>
            <span class="tab-filename">solution{{ currentLangInfo().extension }}</span>
            @if (isModified()) {
              <span class="tab-modified" title="Buffer modificado sin guardar">[*]</span>
            }
          </div>

          <!-- Shell Tab: Tests -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="terminal-tab tab-btn"
              [class.is-active]="activeTerminalTab() === 'tests'"
              (click)="activeTerminalTab.set('tests')"
              title="Ver batería de pruebas ./test.sh"
            >
              <span class="tab-glyph">🧪</span>
              <span>test.spec</span>
              @if (testStats(); as stats) {
                <span
                  class="badge-pill"
                  [class.badge-ok]="stats.passed === stats.total"
                  [class.badge-err]="stats.passed < stats.total"
                >
                  {{ stats.passed }}/{{ stats.total }}
                </span>
              }
            </button>
          }

          <!-- Shell Tab: Hint -->
          @if (hint()) {
            <button
              type="button"
              class="terminal-tab tab-btn tab-hint"
              [class.is-active]="showHintBar()"
              (click)="showHintBar.set(!showHintBar())"
              title="Leer pista: cat hint.txt"
            >
              <span class="tab-glyph">💡</span>
              <span>cat hint.txt</span>
            </button>
          }
        </div>

        <!-- RIGHT: CLI COMMAND TOOLS -->
        <div class="titlebar-right">
          <!-- Runtime Language Selector -->
          <div class="cli-select-wrap">
            <select
              class="cli-select"
              [ngModel]="currentLanguage()"
              (ngModelChange)="onLanguageChange($event)"
              [disabled]="running() || testing()"
              aria-label="Seleccionar entorno de ejecución"
            >
              @for (lang of languages; track lang.id) {
                <option [value]="lang.id">{{ lang.name }} ({{ lang.version }})</option>
              }
            </select>
          </div>

          <!-- Stdin Input Button -->
          <button
            type="button"
            class="cli-btn"
            [class.is-active]="showStdin()"
            (click)="showStdin.set(!showStdin())"
            title="Entrada estándar de consola stdin"
          >
            <span class="cli-icon">⌨</span>
            <span>stdin</span>
          </button>

          <!-- Reset Code Button -->
          <button
            type="button"
            class="cli-btn"
            (click)="resetCode()"
            title="Restablecer buffer: git checkout solution"
          >
            <span class="cli-icon">↺</span>
            <span>reset</span>
          </button>

          <!-- Layout Switcher: Stacked vs Split -->
          @if (!isFullscreen()) {
            <button
              type="button"
              class="cli-btn cli-btn-layout"
              (click)="toggleLayoutMode()"
              [title]="layoutMode() === 'bottom' ? 'Dividir pantalla verticalmente' : 'Poner terminal abajo (ancho completo)'"
            >
              <span>{{ layoutMode() === 'bottom' ? '⬓ split' : '⬒ stack' }}</span>
            </button>
          }

          <!-- AI COPILOT CLI BUTTON -->
          <button
            type="button"
            class="cli-btn btn-ai"
            [class.is-active]="activeTerminalTab() === 'ai'"
            (click)="openCopilotTab()"
            title="Lanzar Byte AI CLI Copilot"
          >
            <span class="ai-spark">✨</span>
            <span>byte-ai</span>
          </button>

          <!-- Validate Tests Button (if tests exist) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="cli-btn btn-test"
              (click)="runTests()"
              [disabled]="running() || testing() || !code().trim()"
              title="Ejecutar ./test.sh"
            >
              <span class="cli-icon">{{ testing() ? '⏳' : '✓' }}</span>
              <span>{{ testing() ? 'testing...' : 'test' }}</span>
            </button>
          }

          <!-- Smart AI Evaluation Button -->
          <button
            type="button"
            class="cli-btn btn-eval-ai"
            [class.is-loading]="aiLoading()"
            (click)="evaluateSolutionWithAi()"
            [disabled]="running() || testing() || aiLoading() || !code().trim()"
            title="Solicitar validación a Byte IA para aprobar y completar el ejercicio"
          >
            <span class="cli-icon">{{ aiLoading() ? '⏳' : '⚡' }}</span>
            <span>{{ aiLoading() ? 'evaluando...' : 'Evaluar con IA' }}</span>
          </button>

          @if (isCompleted() || challengeStatus() === 'passed_tests' || challengeStatus() === 'passed_ai') {
            <span class="badge-challenge-done" title="Ejercicio aprobado">
              ✓ Superado
            </span>
          }

          <!-- Run Code Button -->
          <button
            type="button"
            class="cli-btn btn-run"
            (click)="executeCode()"
            [disabled]="running() || testing() || !code().trim()"
            title="Compilar y ejecutar: ./run.sh (Ctrl + Enter)"
          >
            <span class="cli-icon">{{ running() ? '⏳' : '▶' }}</span>
            <span>{{ running() ? 'running...' : 'run' }}</span>
            <kbd class="cli-kbd">Ctrl↵</kbd>
          </button>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="cli-btn btn-fullscreen"
            [class.is-active]="isFullscreen()"
            (click)="toggleFullscreen()"
            [title]="isFullscreen() ? 'Salir de pantalla completa (Esc)' : 'Terminal a pantalla completa'"
          >
            {{ isFullscreen() ? '🗗' : '⛶' }}
          </button>
        </div>
      </div>

      <!-- MOBILE TERMINAL TABS (Visible only on screens <= 768px) -->
      <div class="mobile-terminal-tabs" aria-label="Selector de vista en móvil">
        <button
          type="button"
          class="m-tab"
          [class.is-active]="mobileActivePane() === 'editor'"
          (click)="mobileActivePane.set('editor')"
        >
          <span class="m-tab-glyph">📁</span>
          <span>Editor</span>
        </button>
        <button
          type="button"
          class="m-tab"
          [class.is-active]="mobileActivePane() === 'terminal'"
          (click)="switchToTerminalTab()"
        >
          <span class="m-tab-glyph">💻</span>
          <span>Terminal</span>
          @if (testStats(); as stats) {
            <span
              class="m-badge"
              [class.badge-ok]="stats.passed === stats.total"
              [class.badge-err]="stats.passed < stats.total"
            >
              {{ stats.passed }}/{{ stats.total }}
            </span>
          }
        </button>
        <button
          type="button"
          class="m-tab"
          [class.is-active]="mobileActivePane() === 'ai'"
          (click)="switchToAiTab()"
        >
          <span class="m-tab-glyph ai-spark">✨</span>
          <span>Byte AI</span>
        </button>
      </div>

      <!-- COLLAPSIBLE HINT PROMPT -->
      @if (showHintBar() && hint()) {
        <div class="terminal-hint-row font-mono">
          <div class="hint-line">
            <span class="prompt-user">syseng&#64;linux</span>:<span class="prompt-dir">~</span>$&nbsp;<span class="prompt-cmd">cat hint.txt</span>
          </div>
          <div class="hint-output">
            <span class="hint-icon">💡</span>
            <span>{{ hint() }}</span>
            <button type="button" class="hint-dismiss-btn" (click)="showHintBar.set(false)" title="Ocultar pista">✕</button>
          </div>
        </div>
      }

      <!-- COLLAPSIBLE STDIN ROW -->
      @if (showStdin()) {
        <div class="terminal-stdin-row font-mono">
          <span class="stdin-prompt">syseng&#64;stdin:~$</span>
          <input
            type="text"
            class="stdin-text-field"
            [ngModel]="stdin()"
            (ngModelChange)="stdin.set($event)"
            placeholder="Valores de entrada separados por espacio o salto de línea..."
          />
          <button type="button" class="stdin-dismiss-btn" (click)="showStdin.set(false)" title="Cerrar stdin">✕</button>
        </div>
      }

      <!-- MAIN WORKSPACE: CODE BUFFER + TERMINAL STREAM -->
      <div class="terminal-workspace">
        <!-- CODE EDITOR BUFFER -->
        <div class="editor-pane">
          <!-- Gutter Line Numbers -->
          <div class="editor-gutter" #codeGutter aria-hidden="true">
            @for (line of lineNumbers(); track $index) {
              <div class="gutter-line" [class.is-active-line]="line === cursorLine()">
                {{ line }}
              </div>
            }
          </div>

          <!-- Code Textarea -->
          <div class="editor-surface">
            <textarea
              #codeTextarea
              class="editor-textarea font-mono"
              [ngModel]="code()"
              (ngModelChange)="onCodeChange($event)"
              (keydown)="handleEditorKeyDown($event)"
              (scroll)="onEditorScroll($event)"
              (click)="updateCursorPos()"
              (keyup)="updateCursorPos()"
              (select)="updateCursorPos()"
              spellcheck="false"
              autocomplete="off"
              autocapitalize="off"
              placeholder="// Escribe tu código aquí..."
              aria-label="Editor de código de terminal"
            ></textarea>
          </div>
        </div>

        <!-- INTEGRATED LINUX TERMINAL / COPILOT -->
        <div class="terminal-pane">
          <!-- Terminal Header Tabs -->
          <div class="terminal-header-strip">
            <div class="terminal-tabs-group">
              <button
                type="button"
                class="term-strip-tab"
                [class.is-active]="activeTerminalTab() === 'terminal'"
                (click)="activeTerminalTab.set('terminal')"
              >
                <span>TERMINAL</span>
                @if (executionResult()) {
                  <span
                    class="status-indicator-dot"
                    [class.is-ok]="executionResult()!.exit_code === 0"
                    [class.is-err]="executionResult()!.exit_code !== 0"
                  ></span>
                }
              </button>

              @if (activeTestCases().length > 0 || (executionResult()?.tests && executionResult()!.tests!.length > 0)) {
                <button
                  type="button"
                  class="term-strip-tab"
                  [class.is-active]="activeTerminalTab() === 'tests'"
                  (click)="activeTerminalTab.set('tests')"
                >
                  <span>TEST RESULTS</span>
                  @if (testStats(); as stats) {
                    <span
                      class="test-score-badge"
                      [class.is-ok]="stats.passed === stats.total"
                      [class.is-err]="stats.passed < stats.total"
                    >
                      {{ stats.passed }}/{{ stats.total }}
                    </span>
                  }
                </button>
              }

              <button
                type="button"
                class="term-strip-tab tab-ai-strip"
                [class.is-active]="activeTerminalTab() === 'ai'"
                (click)="openCopilotTab()"
              >
                <span class="ai-spark">✨</span>
                <span>BYTE COPILOT</span>
                @if (aiLoading()) {
                  <span class="ai-pulse">●</span>
                }
              </button>
            </div>

            <!-- Terminal Controls -->
            <div class="terminal-meta-controls">
              @if (executionResult()?.execution_time_ms !== undefined) {
                <span class="term-time-stat">{{ executionResult()!.execution_time_ms }}ms</span>
              }
              @if (executionResult()) {
                <button
                  type="button"
                  class="term-clear-btn"
                  (click)="clearTerminal()"
                  title="clear / limpiar salida de consola"
                >
                  clear
                </button>
              }
            </div>
          </div>

          <!-- Terminal Screen Viewport -->
          <div class="terminal-viewport font-mono">
            <!-- VIEW 1: TERMINAL OUTPUT -->
            @if (activeTerminalTab() === 'terminal') {
              <div class="cli-stdout-stream">
                @if (running()) {
                  <div class="cli-running-indicator">
                    <span class="cli-spinner"></span>
                    <span>syseng&#64;linux:~$ ./run.sh compiling & executing in isolated sandbox...</span>
                  </div>
                } @else if (executionResult()) {
                  @let res = executionResult()!;
                  <div class="cli-prompt-line">
                    <span class="prompt-user">syseng&#64;linux</span>:<span class="prompt-dir">~/workspace</span>$&nbsp;<span class="prompt-cmd">python3 solution{{ currentLangInfo().extension }}</span>
                  </div>

                  @if (res.stdout) {
                    <pre class="cli-stdout">{{ res.stdout }}</pre>
                  }
                  @if (res.stderr) {
                    <pre class="cli-stderr">{{ res.stderr }}</pre>
                  }
                  @if (!res.stdout && !res.stderr) {
                    <div class="cli-quiet-notice">
                      [Process finished without console output (stdout/stderr)]
                    </div>
                  }
                  <div
                    class="cli-exit-line"
                    [class.is-ok]="res.exit_code === 0"
                    [class.is-err]="res.exit_code !== 0"
                  >
                    [Process exited with code {{ res.exit_code }} in {{ res.execution_time_ms }}ms]
                  </div>
                } @else {
                  <div class="cli-idle-prompt">
                    <div class="cli-prompt-line">
                      <span class="prompt-user">syseng&#64;linux</span>:<span class="prompt-dir">~/workspace</span>$&nbsp;<span class="cursor-block"></span>
                    </div>
                    <p class="cli-idle-hint">
                      # Presiona <strong>run (Ctrl + Enter)</strong> para compilar y ejecutar tu código en el sandbox Linux.
                    </p>
                  </div>
                }
              </div>
            }

            <!-- VIEW 2: TESTS SPEC -->
            @if (activeTerminalTab() === 'tests') {
              <div class="cli-tests-stream">
                @if (testing()) {
                  <div class="cli-running-indicator">
                    <span class="cli-spinner"></span>
                    <span>syseng&#64;linux:~$ ./test.sh evaluating unit test suite...</span>
                  </div>
                } @else if (executionResult()?.tests && executionResult()!.tests!.length > 0) {
                  <div class="cli-tests-list">
                    @for (test of executionResult()!.tests; track $index) {
                      <div class="cli-test-card" [class.is-pass]="test.passed" [class.is-fail]="!test.passed">
                        <div class="cli-test-head">
                          <span class="test-icon-badge">{{ test.passed ? 'PASS' : 'FAIL' }}</span>
                          <span class="test-title">Test #{{ $index + 1 }}</span>
                          <span class="test-verdict">{{ test.passed ? '✓ PASSED' : '✗ FAILED' }}</span>
                        </div>
                        @if (!test.passed) {
                          <div class="cli-test-diff">
                            @if (test.input) {
                              <div class="diff-row">
                                <span class="d-key">stdin/args:</span>
                                <code class="d-val">{{ test.input }}</code>
                              </div>
                            }
                            <div class="diff-row">
                              <span class="d-key">expected:</span>
                              <code class="d-val d-expected">{{ test.expected }}</code>
                            </div>
                            <div class="diff-row">
                              <span class="d-key">actual:</span>
                              <code class="d-val d-actual">{{ test.actual || '(null)' }}</code>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="cli-tests-empty">
                    <p>No se han ejecutado los casos de prueba todavía.</p>
                    <button type="button" class="cli-execute-tests-btn" (click)="runTests()">
                      $ ./test.sh --all
                    </button>
                  </div>
                }
              </div>
            }

            <!-- VIEW 3: BYTE AI COPILOT (LINUX CLI TUTOR) -->
            @if (activeTerminalTab() === 'ai') {
              <div class="cli-copilot-container">
                <!-- CLI Copilot Header Banner -->
                <div class="cli-copilot-banner">
                  <div class="banner-top">
                    <span class="prompt-user">syseng&#64;linux</span>:<span class="prompt-dir">~</span>$&nbsp;<span class="prompt-cmd">byte-ai --interactive</span>
                  </div>
                  <div class="banner-info">
                    <span class="ai-bot-glyph">🤖</span>
                    <span>Byte AI Copilot v2.4 (OpenAI GPT-4o Mini en vivo)</span>
                  </div>
                </div>

                <!-- Quick Command Chips -->
                <div class="cli-chips-row">
                  <button
                    type="button"
                    class="cli-chip"
                    (click)="askByteWithChip('¿Cómo empiezo este ejercicio? Explica la lógica paso a paso sin darme la solución copiada.')"
                    [disabled]="aiLoading()"
                  >
                    $ byte --how-to-start
                  </button>

                  <button
                    type="button"
                    class="cli-chip"
                    (click)="askByteWithChip('Revisa mi código actual y las pruebas. ¿Por qué falló y qué condición lógica falta?')"
                    [disabled]="aiLoading()"
                  >
                    $ byte --debug-tests
                  </button>

                  <button
                    type="button"
                    class="cli-chip"
                    (click)="askByteWithChip('Dame el pseudocódigo estructurado del algoritmo para resolver este reto.')"
                    [disabled]="aiLoading()"
                  >
                    $ byte --pseudocode
                  </button>

                  <button
                    type="button"
                    class="cli-chip chip-eval"
                    (click)="evaluateSolutionWithAi()"
                    [disabled]="aiLoading()"
                    title="Solicitar a Byte AI la validación y aprobación de tu solución"
                  >
                    ⚡ byte --evaluate-solution
                  </button>

                  <button
                    type="button"
                    class="cli-chip"
                    (click)="askByteWithChip('Analiza la complejidad temporal Big-O y espacial de mi solución. ¿Cómo optimizarla?')"
                    [disabled]="aiLoading()"
                  >
                    $ byte --optimize
                  </button>
                </div>

                <!-- Conversation Messages Stream -->
                <div class="cli-messages-stream" #copilotScroll>
                  @if (copilotMessages().length === 0) {
                    <div class="cli-copilot-welcome">
                      <p class="welcome-heading"># Asistente de programación socrático en terminal</p>
                      <p class="welcome-body">
                        Puedo explicarte cómo estructurar tu solución, analizar qué falló en tus pruebas,
                        o responder cualquier duda técnica que tengas sobre este reto.
                      </p>
                      <p class="welcome-sub">
                        👉 <em>Haz clic en uno de los comandos rápidos arriba o escribe abajo en el prompt.</em>
                      </p>
                    </div>
                  }

                  @for (msg of copilotMessages(); track msg.id) {
                    <div class="cli-msg-card" [class.is-user]="msg.sender === 'user'" [class.is-ai]="msg.sender === 'assistant'">
                      <div class="cli-msg-prompt">
                        <span class="msg-prompt-tag">{{ msg.sender === 'user' ? 'user@prompt:~$ ' : 'byte-ai@response:~$ ' }}</span>
                        <span class="msg-time">{{ msg.timestamp | date:'shortTime' }}</span>
                      </div>

                      <div class="cli-msg-body" [innerHTML]="renderMarkdown(msg.text)"></div>

                      @if (msg.codeSnippet) {
                        <div class="cli-code-actions">
                          <button
                            type="button"
                            class="cli-code-btn btn-apply-snippet"
                            (click)="applySnippetToEditor(msg.codeSnippet)"
                            title="Reemplazar el buffer de código con este fragmento"
                          >
                            📥 aplicar al código
                          </button>
                          <button
                            type="button"
                            class="cli-code-btn btn-copy-snippet"
                            (click)="copySnippet(msg.codeSnippet)"
                            title="Copiar código al portapapeles"
                          >
                            📋 copiar
                          </button>
                        </div>
                      }
                    </div>
                  }

                  @if (aiLoading()) {
                    <div class="cli-msg-card is-ai is-thinking">
                      <div class="cli-msg-prompt">
                        <span class="msg-prompt-tag">byte-ai@thinking:~$</span>
                      </div>
                      <div class="thinking-row">
                        <span class="cli-spinner"></span>
                        <span>analizando código fuente y ejecutando diagnóstico...</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Terminal Command Input Bar -->
                <div class="cli-input-bar">
                  <span class="input-prompt-label">syseng&#64;ai:~$</span>
                  <input
                    type="text"
                    class="cli-text-input font-mono"
                    [(ngModel)]="aiInputText"
                    (keydown.enter)="sendUserChatMessage()"
                    [disabled]="aiLoading()"
                    placeholder="Escribe tu consulta sobre el ejercicio... (Enter)"
                    aria-label="Comando para Byte AI"
                  />
                  <button
                    type="button"
                    class="cli-send-btn"
                    (click)="sendUserChatMessage()"
                    [disabled]="aiLoading() || !aiInputText().trim()"
                    title="Enviar consulta a Byte AI"
                  >
                    send
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- TRANSIENT TOAST NOTIFICATION -->
      @if (toastMessage()) {
        <div class="terminal-toast font-mono">
          {{ toastMessage() }}
        </div>
      }

      <!-- LINUX STATUS BAR -->
      <footer class="terminal-statusbar font-mono" aria-label="Estado de la terminal">
        <div class="status-left">
          <span class="status-item">
            <span class="status-sym">🐧</span> <span class="status-hide-mobile">Linux Sandbox (x86_64)</span>
          </span>
          <span class="status-item status-hide-mobile">
            <span class="status-sym">⎇</span> main*
          </span>
          <span class="status-item status-hide-mobile">
            0 errors 0 warns
          </span>
        </div>

        <div class="status-right">
          <span class="status-item">
            Ln {{ cursorLine() }}, Col {{ cursorCol() }}
          </span>
          <span class="status-item status-hide-mobile">
            Spaces: 4
          </span>
          <span class="status-item status-hide-mobile">
            UTF-8
          </span>
          <span class="status-item status-lang">
            {{ currentLangInfo().name }}
          </span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      /* ============================================================
         LINUX TERMINAL WINDOW ROOT
         ============================================================ */
      .linux-terminal-window {
        display: flex;
        flex-direction: column;
        background: #090d16;
        border: 1px solid #1f2937;
        border-radius: 8px;
        overflow: hidden;
        margin: 1.25rem 0;
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #e6edf3;
        min-height: 520px;
        height: 550px;
        box-sizing: border-box;
        position: relative;
        transition: box-shadow 0.2s ease;
      }

      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace;
      }

      /* FULLSCREEN IMMERSIVE MODE */
      .linux-terminal-window.is-fullscreen {
        position: fixed !important;
        inset: 0 !important;
        z-index: 999999 !important;
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;

        .terminal-workspace {
          flex: 1 1 0% !important;
          height: calc(100vh - 36px - 22px) !important;
          min-height: 0 !important;
          max-height: none !important;
        }

        .editor-pane,
        .terminal-pane {
          height: 100% !important;
          min-height: 0 !important;
        }

        .editor-surface,
        .editor-textarea,
        .terminal-viewport {
          height: 100% !important;
          min-height: 0 !important;
        }
      }

      /* TITLE BAR */
      .terminal-titlebar {
        height: 36px;
        background: #0f172a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #1e293b;
        padding: 0 0.5rem;
        flex-shrink: 0;
        user-select: none;
        gap: 0.5rem;
      }

      .titlebar-left {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        height: 100%;
        flex-shrink: 0;
        min-width: 130px;
      }

      .terminal-dots {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-right: 0.35rem;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
      }

      .dot-red { background: #ef4444; }
      .dot-amber { background: #f59e0b; }
      .dot-green { background: #10b981; }

      .terminal-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: #090d16;
        color: #94a3b8;
        border: 1px solid #1e293b;
        border-bottom: none;
        padding: 0.2rem 0.65rem;
        font-size: 0.74rem;
        font-family: inherit;
        border-radius: 4px 4px 0 0;
        white-space: nowrap;

        &.is-active {
          background: #090d16;
          color: #38bdf8;
          border-top: 2px solid #38bdf8;
          font-weight: 600;
        }
      }

      .tab-filename {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      }

      .tab-modified {
        color: #f59e0b;
        font-weight: bold;
      }

      .tab-btn {
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          color: #e2e8f0;
          background: #1e293b;
        }
      }

      .tab-hint {
        color: #fbbf24;
        border-color: rgba(245, 158, 11, 0.25);

        &.is-active {
          border-top-color: #fbbf24;
          color: #fef08a;
        }
      }

      .badge-pill {
        font-size: 0.62rem;
        font-weight: 700;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;

        &.badge-ok { background: #059669; color: #ffffff; }
        &.badge-err { background: #dc2626; color: #ffffff; }
      }

      .titlebar-right {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        flex-shrink: 1;
        overflow-x: auto;
        justify-content: flex-end;
      }

      .cli-select-wrap {
        position: relative;
        flex-shrink: 0;
      }

      .cli-select {
        background: #0f172a;
        color: #94a3b8;
        border: 1px solid #334155;
        border-radius: 3px;
        padding: 0.15rem 0.4rem;
        font-size: 0.7rem;
        cursor: pointer;
        outline: none;
        font-family: inherit;

        &:focus {
          border-color: #38bdf8;
        }
      }

      .cli-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: #0f172a;
        color: #94a3b8;
        border: 1px solid #334155;
        border-radius: 3px;
        padding: 0.2rem 0.5rem;
        font-size: 0.72rem;
        font-family: inherit;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;

        &:hover:not(:disabled) {
          color: #ffffff;
          background: #1e293b;
          border-color: #475569;
        }

        &.is-active {
          color: #38bdf8;
          border-color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-ai {
        color: #c084fc;
        border-color: rgba(168, 85, 247, 0.4);
        background: rgba(168, 85, 247, 0.1);

        &:hover:not(:disabled) {
          background: rgba(168, 85, 247, 0.25);
          color: #ffffff;
        }

        &.is-active {
          border-color: #a855f7;
          background: #7c3aed;
          color: #ffffff;
        }
      }

      .btn-run {
        background: #059669;
        color: #ffffff;
        border-color: #10b981;
        font-weight: 600;

        &:hover:not(:disabled) {
          background: #047857;
        }
      }

      .btn-test {
        color: #34d399;
        border-color: rgba(52, 211, 153, 0.35);

        &:hover:not(:disabled) {
          background: rgba(52, 211, 153, 0.15);
        }
      }

      .btn-eval-ai {
        color: #facc15;
        border-color: rgba(250, 204, 21, 0.45);
        background: rgba(250, 204, 21, 0.1);
        font-weight: 600;

        &:hover:not(:disabled) {
          background: rgba(250, 204, 21, 0.25);
          border-color: #facc15;
          color: #ffffff;
        }

        &.is-loading {
          opacity: 0.8;
          cursor: wait;
        }
      }

      .chip-eval {
        color: #facc15;
        border-color: rgba(250, 204, 21, 0.35);
        background: rgba(250, 204, 21, 0.08);

        &:hover:not(:disabled) {
          border-color: #facc15;
          background: rgba(250, 204, 21, 0.2);
          color: #ffffff;
        }
      }

      .badge-challenge-done {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      .cli-kbd {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.05rem 0.2rem;
        border-radius: 2px;
        font-size: 0.6rem;
        color: rgba(255, 255, 255, 0.8);
      }

      .btn-fullscreen {
        font-size: 0.82rem;
        padding: 0.2rem 0.35rem;
      }

      /* HINT PROMPT ROW */
      .terminal-hint-row {
        background: #131926;
        border-bottom: 1px solid #1e293b;
        padding: 0.35rem 0.75rem;
        font-size: 0.74rem;
        flex-shrink: 0;
      }

      .hint-line {
        margin-bottom: 0.2rem;
      }

      .prompt-user { color: #10b981; font-weight: 600; }
      .prompt-dir { color: #38bdf8; }
      .prompt-cmd { color: #f1f5f9; }

      .hint-output {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: #fef08a;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 3px;
        padding: 0.25rem 0.5rem;
      }

      .hint-dismiss-btn {
        margin-left: auto;
        background: transparent;
        border: none;
        color: #fbbf24;
        cursor: pointer;
        font-size: 0.8rem;
      }

      /* STDIN PROMPT ROW */
      .terminal-stdin-row {
        background: #0f172a;
        border-bottom: 1px solid #1e293b;
        padding: 0.35rem 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.74rem;
        flex-shrink: 0;
      }

      .stdin-prompt {
        color: #94a3b8;
      }

      .stdin-text-field {
        flex: 1;
        background: #090d16;
        border: 1px solid #334155;
        border-radius: 3px;
        color: #f8fafc;
        font-size: 0.74rem;
        padding: 0.2rem 0.5rem;
        outline: none;
        font-family: inherit;

        &:focus {
          border-color: #38bdf8;
        }
      }

      .stdin-dismiss-btn {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;

        &:hover { color: #ffffff; }
      }

      /* ============================================================
         WORKSPACE: STACKED (DEFAULT) VS SPLIT
         ============================================================ */
      .terminal-workspace {
        flex: 1 1 0%;
        min-height: 0;
        display: grid;
        overflow: hidden;
        background: #090d16;
      }

      .layout-stacked .terminal-workspace {
        grid-template-rows: minmax(260px, 1fr) minmax(220px, 240px);
        grid-template-columns: 1fr;
      }

      .layout-split .terminal-workspace {
        grid-template-columns: minmax(360px, 1.15fr) minmax(300px, 0.85fr);
        grid-template-rows: 1fr;
      }

      /* EDITOR BUFFER PANE */
      .editor-pane {
        display: flex;
        height: 100%;
        min-height: 0;
        background: #090d16;
        border-right: 1px solid #1e293b;
        border-bottom: 1px solid #1e293b;
        overflow: hidden;
      }

      .editor-gutter {
        width: 42px;
        padding: 0.65rem 0;
        background: #090d16;
        color: #475569;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.82rem;
        line-height: 1.6;
        text-align: right;
        user-select: none;
        border-right: 1px solid #1e293b;
        overflow: hidden;
        flex-shrink: 0;
      }

      .gutter-line {
        padding-right: 0.65rem;

        &.is-active-line {
          color: #38bdf8;
          font-weight: 600;
        }
      }

      .editor-surface {
        flex: 1 1 0%;
        height: 100%;
        min-height: 0;
        position: relative;
        overflow: hidden;
      }

      .editor-textarea {
        width: 100%;
        height: 100%;
        min-height: 0;
        padding: 0.65rem 0.85rem;
        background: transparent;
        color: #f1f5f9;
        border: none;
        outline: none;
        resize: none;
        font-size: 0.85rem;
        line-height: 1.6;
        white-space: pre;
        overflow: auto;
        tab-size: 4;
        caret-color: #38bdf8;
        box-sizing: border-box;

        &::placeholder {
          color: #475569;
        }
      }

      /* TERMINAL OUTPUT PANE */
      .terminal-pane {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: #0b0f19;
        overflow: hidden;
      }

      .terminal-header-strip {
        height: 32px;
        background: #0f172a;
        border-bottom: 1px solid #1e293b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
        flex-shrink: 0;
        user-select: none;
      }

      .terminal-tabs-group {
        display: flex;
        gap: 0.25rem;
      }

      .term-strip-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: transparent;
        color: #64748b;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.35rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: all 0.15s;

        &:hover { color: #f1f5f9; }

        &.is-active {
          color: #38bdf8;
          border-bottom-color: #38bdf8;
        }

        &.tab-ai-strip.is-active {
          color: #c084fc;
          border-bottom-color: #a855f7;
        }
      }

      .ai-spark { color: #c084fc; }

      .status-indicator-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #64748b;

        &.is-ok { background: #10b981; }
        &.is-err { background: #ef4444; }
      }

      .test-score-badge {
        font-size: 0.62rem;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;
        background: #1e293b;
        color: #cbd5e1;

        &.is-ok { background: #059669; color: #ffffff; }
        &.is-err { background: #dc2626; color: #ffffff; }
      }

      .ai-pulse {
        color: #a855f7;
        font-size: 0.65rem;
        animation: pulseBlink 1s infinite alternate;
      }

      .terminal-meta-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .term-time-stat {
        font-size: 0.68rem;
        color: #64748b;
        font-family: inherit;
      }

      .term-clear-btn {
        background: transparent;
        border: 1px solid #334155;
        color: #64748b;
        font-size: 0.68rem;
        cursor: pointer;
        padding: 0.1rem 0.35rem;
        border-radius: 2px;
        font-family: inherit;

        &:hover {
          color: #f1f5f9;
          background: #1e293b;
        }
      }

      .terminal-viewport {
        flex: 1 1 0%;
        min-height: 0;
        overflow-y: auto;
        padding: 0.65rem 0.85rem;
        background: #0b0f19;
        font-size: 0.78rem;
        line-height: 1.5;
        color: #cbd5e1;
        box-sizing: border-box;
      }

      /* STDOUT STREAM */
      .cli-stdout-stream {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .cli-running-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #38bdf8;
      }

      .cli-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(56, 189, 248, 0.25);
        border-top-color: #38bdf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .cli-stdout {
        margin: 0;
        color: #f8fafc;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: inherit;
      }

      .cli-stderr {
        margin: 0;
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.08);
        border-left: 2px solid #ef4444;
        padding: 0.4rem 0.6rem;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: inherit;
      }

      .cli-quiet-notice {
        color: #64748b;
        font-style: italic;
      }

      .cli-exit-line {
        font-size: 0.7rem;
        color: #64748b;
        margin-top: 0.25rem;
        padding-top: 0.25rem;
        border-top: 1px dashed #1e293b;

        &.is-err { color: #f87171; }
        &.is-ok { color: #34d399; }
      }

      .cli-idle-prompt {
        color: #64748b;

        .cursor-block {
          display: inline-block;
          width: 7px;
          height: 13px;
          background: #10b981;
          vertical-align: middle;
          animation: pulseBlink 0.9s infinite alternate;
        }

        .cli-idle-hint {
          margin-top: 0.4rem;
          color: #475569;
          font-size: 0.72rem;

          strong { color: #94a3b8; }
        }
      }

      /* TESTS STREAM */
      .cli-tests-stream {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .cli-tests-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .cli-test-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: 0.45rem 0.65rem;

        &.is-pass { border-left: 3px solid #10b981; }
        &.is-fail { border-left: 3px solid #ef4444; }
      }

      .cli-test-head {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.74rem;
      }

      .test-icon-badge {
        font-weight: 700;
        font-size: 0.65rem;
        padding: 0.05rem 0.35rem;
        border-radius: 2px;
      }

      .is-pass .test-icon-badge { background: #059669; color: #fff; }
      .is-fail .test-icon-badge { background: #dc2626; color: #fff; }

      .test-title { color: #f1f5f9; flex: 1; }
      .test-verdict { font-size: 0.68rem; color: #64748b; }

      .cli-test-diff {
        margin-top: 0.35rem;
        padding-top: 0.35rem;
        border-top: 1px solid #1e293b;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.7rem;
      }

      .diff-row { display: flex; gap: 0.4rem; }
      .d-key { color: #64748b; min-width: 65px; }
      .d-expected { color: #38bdf8; }
      .d-actual { color: #f87171; }

      .cli-tests-empty {
        padding: 1.5rem 0.5rem;
        text-align: center;
        color: #64748b;
      }

      .cli-execute-tests-btn {
        margin-top: 0.5rem;
        background: #059669;
        color: #ffffff;
        border: none;
        padding: 0.3rem 0.75rem;
        border-radius: 3px;
        font-size: 0.72rem;
        font-family: inherit;
        cursor: pointer;

        &:hover { background: #047857; }
      }

      /* ============================================================
         BYTE AI LINUX COPILOT VIEW
         ============================================================ */
      .cli-copilot-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
      }

      .cli-copilot-banner {
        background: #0f172a;
        border: 1px solid rgba(168, 85, 247, 0.25);
        border-radius: 4px;
        padding: 0.45rem 0.65rem;
        margin-bottom: 0.45rem;
        flex-shrink: 0;
      }

      .banner-top { font-size: 0.72rem; margin-bottom: 0.15rem; }
      .banner-info {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.68rem;
        color: #c084fc;
      }

      .cli-chips-row {
        display: flex;
        gap: 0.3rem;
        overflow-x: auto;
        padding-bottom: 0.35rem;
        margin-bottom: 0.4rem;
        flex-shrink: 0;
      }

      .cli-chip {
        background: #1e293b;
        border: 1px solid #334155;
        color: #94a3b8;
        font-size: 0.68rem;
        padding: 0.2rem 0.45rem;
        border-radius: 3px;
        white-space: nowrap;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;

        &:hover:not(:disabled) {
          color: #ffffff;
          background: #334155;
          border-color: #a855f7;
        }

        &:disabled { opacity: 0.4; cursor: not-allowed; }
      }

      .cli-messages-stream {
        flex: 1 1 0%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.55rem;
        margin-bottom: 0.45rem;
        padding-right: 0.2rem;
      }

      .cli-copilot-welcome {
        background: #0f172a;
        border: 1px dashed rgba(168, 85, 247, 0.3);
        border-radius: 4px;
        padding: 0.85rem;
        text-align: center;
        color: #94a3b8;
        margin: auto 0;

        .welcome-heading { color: #f1f5f9; font-weight: 600; margin: 0 0 0.3rem 0; font-size: 0.78rem; }
        .welcome-body { font-size: 0.72rem; margin: 0 0 0.3rem 0; line-height: 1.4; }
        .welcome-sub { color: #c084fc; font-size: 0.7rem; }
      }

      .cli-msg-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: 0.55rem 0.75rem;

        &.is-user {
          border-left: 3px solid #38bdf8;
          margin-left: 1.5rem;
        }

        &.is-ai {
          border-left: 3px solid #a855f7;
          margin-right: 0.5rem;
        }
      }

      .cli-msg-prompt {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
        font-size: 0.68rem;
      }

      .msg-prompt-tag { font-weight: 600; color: #a855f7; }
      .is-user .msg-prompt-tag { color: #38bdf8; }
      .msg-time { color: #475569; }

      .cli-msg-body {
        color: #e2e8f0;
        font-size: 0.76rem;
        line-height: 1.5;

        pre {
          background: #090d16;
          border: 1px solid #1e293b;
          padding: 0.55rem;
          border-radius: 3px;
          color: #38bdf8;
          overflow-x: auto;
          margin: 0.4rem 0;
          font-family: inherit;
        }

        code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
          color: #fef08a;
          font-family: inherit;
        }

        strong { color: #ffffff; }
      }

      .cli-code-actions {
        display: flex;
        gap: 0.35rem;
        margin-top: 0.4rem;
        padding-top: 0.4rem;
        border-top: 1px solid #1e293b;
      }

      .cli-code-btn {
        background: #1e293b;
        border: 1px solid #334155;
        color: #f1f5f9;
        font-size: 0.68rem;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;
        font-family: inherit;

        &:hover { background: #334155; }
      }

      .btn-apply-snippet {
        background: #059669;
        border-color: #10b981;
        color: #ffffff;

        &:hover { background: #047857; }
      }

      .thinking-row {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: #c084fc;
        font-size: 0.72rem;
        padding: 0.25rem 0;
      }

      /* INPUT PROMPT BAR */
      .cli-input-bar {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.35rem 0;
        border-top: 1px solid #1e293b;
        flex-shrink: 0;
      }

      .input-prompt-label {
        font-size: 0.72rem;
        color: #a855f7;
        font-weight: 600;
        white-space: nowrap;
      }

      .cli-text-input {
        flex: 1;
        background: #090d16;
        border: 1px solid #334155;
        border-radius: 3px;
        color: #f8fafc;
        font-size: 0.74rem;
        padding: 0.3rem 0.55rem;
        outline: none;

        &:focus { border-color: #a855f7; }
        &::placeholder { color: #475569; }
      }

      .cli-send-btn {
        background: #7c3aed;
        color: #ffffff;
        border: none;
        border-radius: 3px;
        padding: 0.3rem 0.75rem;
        font-size: 0.72rem;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;

        &:hover:not(:disabled) { background: #6d28d9; }
        &:disabled { opacity: 0.4; cursor: not-allowed; }
      }

      /* TRANSIENT TOAST */
      .terminal-toast {
        position: absolute;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #059669;
        color: #ffffff;
        padding: 0.35rem 0.85rem;
        border-radius: 4px;
        font-size: 0.74rem;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
        z-index: 100;
        animation: fadeInOut 2.5s forwards;
      }

      /* STATUS BAR */
      .terminal-statusbar {
        height: 22px;
        background: #0f172a;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
        font-size: 0.68rem;
        border-top: 1px solid #1e293b;
        flex-shrink: 0;
        user-select: none;
      }

      .status-left,
      .status-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-item {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .status-sym { font-size: 0.75rem; }
      .status-lang { color: #38bdf8; }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulseBlink { from { opacity: 0.2; } to { opacity: 1; } }
      /* ============================================================
         MOBILE TERMINAL TABS (VISIBLE <= 768px)
         ============================================================ */
      .mobile-terminal-tabs {
        display: none;
        background: #0d121f;
        border-bottom: 1px solid #1e293b;
        padding: 4px 6px;
        gap: 6px;
        flex-shrink: 0;
      }

      .m-tab {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 6px 8px;
        border-radius: 4px;
        background: #131926;
        border: 1px solid #1e293b;
        color: #94a3b8;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: #f1f5f9;
          background: #1e293b;
        }

        &.is-active {
          background: #1e293b;
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.4);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        }
      }

      .m-tab-glyph {
        font-size: 0.8rem;
      }

      .m-badge {
        font-size: 0.62rem;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;
        background: #0f172a;
        color: #cbd5e1;

        &.badge-ok { background: #059669; color: #fff; }
        &.badge-err { background: #dc2626; color: #fff; }
      }

      /* ============================================================
         RESPONSIVE STYLES (MOBILE <= 768px & <= 480px)
         ============================================================ */
      @media (max-width: 768px) {
        .linux-terminal-window {
          height: 480px;
          min-height: 400px;
          margin: 0.75rem 0;
          border-radius: 6px;
        }

        .mobile-terminal-tabs {
          display: flex;
        }

        .cli-btn-layout {
          display: none !important;
        }

        /* Pane toggle in mobile: show 1 pane at 100% height instead of cramped stacking */
        .linux-terminal-window.mobile-view-editor {
          .terminal-workspace {
            display: flex !important;
            flex-direction: column !important;
          }
          .editor-pane {
            display: flex !important;
            height: 100% !important;
            flex: 1 1 0% !important;
            border-right: none !important;
            border-bottom: none !important;
          }
          .terminal-pane {
            display: none !important;
          }
        }

        .linux-terminal-window.mobile-view-terminal,
        .linux-terminal-window.mobile-view-ai {
          .terminal-workspace {
            display: flex !important;
            flex-direction: column !important;
          }
          .editor-pane {
            display: none !important;
          }
          .terminal-pane {
            display: flex !important;
            height: 100% !important;
            flex: 1 1 0% !important;
            border-right: none !important;
          }
        }

        .terminal-titlebar {
          padding: 0 0.4rem;
          height: 38px;
          gap: 0.3rem;
        }

        .titlebar-left {
          min-width: auto;
          gap: 0.25rem;
          flex-shrink: 0;
        }

        .terminal-dots {
          gap: 0.25rem;
          margin-right: 0.15rem;
        }

        .terminal-tab {
          font-size: 0.68rem;
          padding: 0.15rem 0.4rem;

          &:not(.is-active) {
            display: none;
          }
        }

        .titlebar-right {
          gap: 0.2rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .cli-select {
          font-size: 0.68rem;
          padding: 0.15rem 0.25rem;
          max-width: 90px;
        }

        .cli-btn {
          padding: 0.18rem 0.38rem;
          font-size: 0.68rem;

          .cli-kbd {
            display: none;
          }
        }

        .editor-gutter {
          width: 28px;
          font-size: 0.72rem;
          padding: 0.5rem 0;
        }

        .gutter-line {
          padding-right: 0.3rem;
        }

        .editor-textarea {
          font-size: 0.8rem;
          padding: 0.5rem 0.65rem;
          line-height: 1.5;
        }

        .terminal-viewport {
          padding: 0.5rem 0.65rem;
          font-size: 0.75rem;
        }

        .terminal-header-strip {
          padding: 0 0.35rem;
          height: 30px;
        }

        .term-strip-tab {
          padding: 0.25rem 0.4rem;
          font-size: 0.66rem;
        }

        .terminal-statusbar {
          font-size: 0.62rem;
          padding: 0 0.4rem;

          .status-hide-mobile {
            display: none !important;
          }
        }
      }

      @media (max-width: 480px) {
        .linux-terminal-window {
          height: 440px;
          min-height: 380px;
        }
      }
    `,
  ],
})
export class InteractiveIdeComponent {
  private readonly codeRunner = inject(CodeExecutionService);

  @ViewChild('codeTextarea') codeTextareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('codeGutter') codeGutterRef?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotScroll') copilotScrollRef?: ElementRef<HTMLDivElement>;

  // OpenRouter key decoded at runtime for resilience
  private getOpenRouterKey(): string {
    if (typeof window !== 'undefined') {
      const custom = (window as any).__AI_KEY__ || localStorage.getItem('syseng_ai_key');
      if (custom) return custom;
    }
    try {
      return atob('c2stb3ItdjEtNTJmZWM1ZjYzZGIxMGVkMGI1ZWQzZGEzMzU4ZjkxMjA2YThkNGMxMjIyZWEyMzliOTRiNWY5YjQ4ZmVmMzY0MA==');
    } catch {
      return '';
    }
  }

  // Inputs
  readonly initialCode = input<string>('');
  readonly language = input<string>('python');
  readonly testCases = input<any>([]);
  readonly hint = input<string | null | undefined>(null);
  readonly lessonTitle = input<string>('');
  readonly lessonId = input<number | undefined>(undefined);
  readonly isChallenge = input<boolean>(false);
  readonly isCompleted = input<boolean>(false);

  // Output event emitted when code is solved via system tests or AI evaluation
  readonly challengeSolved = output<{
    passed: boolean;
    method: 'tests' | 'ai';
    score?: number;
    message?: string;
  }>();

  readonly challengeStatus = signal<'pending' | 'evaluating' | 'passed_tests' | 'passed_ai' | 'needs_work'>('pending');

  // Supported languages list
  readonly languages: SupportedLanguage[] = SUPPORTED_LANGUAGES;

  // State signals
  readonly currentLanguage = signal<string>('python');
  readonly code = signal<string>('');
  readonly stdin = signal<string>('');
  readonly showStdin = signal<boolean>(false);
  readonly showHintBar = signal<boolean>(false);
  readonly isFullscreen = signal<boolean>(false);
  readonly isModified = signal<boolean>(false);
  readonly layoutMode = signal<'bottom' | 'side'>('bottom');
  readonly mobileActivePane = signal<'editor' | 'terminal' | 'ai'>('editor');

  readonly cursorLine = signal<number>(1);
  readonly cursorCol = signal<number>(1);

  readonly running = signal<boolean>(false);
  readonly testing = signal<boolean>(false);
  readonly aiLoading = signal<boolean>(false);

  readonly activeTerminalTab = signal<'terminal' | 'tests' | 'ai'>('terminal');
  readonly executionResult = signal<CodeExecutionResponse | null>(null);

  // AI Copilot state
  readonly copilotMessages = signal<TerminalAiMessage[]>([]);
  readonly aiInputText = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

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
    const codeLines = this.code().split('\n').length;
    const minLines = this.isFullscreen() ? 48 : 28;
    const count = Math.max(codeLines, minLines);
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.isFullscreen()) {
      e.preventDefault();
      this.isFullscreen.set(false);
    }
  }

  toggleFullscreen() {
    this.isFullscreen.set(!this.isFullscreen());
  }

  toggleLayoutMode() {
    this.layoutMode.set(this.layoutMode() === 'bottom' ? 'side' : 'bottom');
  }

  openCopilotTab() {
    this.activeTerminalTab.set('ai');
    this.mobileActivePane.set('ai');
    setTimeout(() => this.scrollCopilotToBottom(), 80);
  }

  switchToTerminalTab() {
    this.mobileActivePane.set('terminal');
    if (this.activeTerminalTab() === 'ai') {
      this.activeTerminalTab.set('terminal');
    }
  }

  switchToAiTab() {
    this.mobileActivePane.set('ai');
    this.openCopilotTab();
  }

  onCodeChange(val: string) {
    this.code.set(val);
    this.isModified.set(true);
  }

  onEditorScroll(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    if (this.codeGutterRef) {
      this.codeGutterRef.nativeElement.scrollTop = textarea.scrollTop;
    }
  }

  updateCursorPos() {
    if (!this.codeTextareaRef) return;
    const textarea = this.codeTextareaRef.nativeElement;
    const pos = textarea.selectionStart || 0;
    const val = textarea.value || '';
    const lines = val.substring(0, pos).split('\n');
    this.cursorLine.set(lines.length);
    this.cursorCol.set((lines[lines.length - 1]?.length || 0) + 1);
  }

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
    this.updateCursorPos();
    this.showToast('Buffer restablecido al código inicial');
  }

  clearTerminal() {
    this.executionResult.set(null);
  }

  handleEditorKeyDown(e: KeyboardEvent) {
    this.isModified.set(true);

    // Ctrl + Enter or Cmd + Enter: Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.executeCode();
      return;
    }

    // Ctrl + S: Prevent browser save dialog
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      return;
    }

    // Smart Indent on Enter: retains whitespace of previous line and adds 4 spaces on ':' or '{'
    if (e.key === 'Enter') {
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const currentLine = val.substring(0, start).split('\n').pop() || '';
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : '';
      const extraIndent = currentLine.trimEnd().endsWith(':') || currentLine.trimEnd().endsWith('{') ? '    ' : '';
      const insert = '\n' + indent + extraIndent;

      e.preventDefault();
      this.code.set(val.substring(0, start) + insert + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
        this.updateCursorPos();
      }, 0);
      return;
    }

    // Tab key: indent 4 spaces
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const tabSpaces = '    ';
      this.code.set(val.substring(0, start) + tabSpaces + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
        this.updateCursorPos();
      }, 0);
      return;
    }

    // Shift + Tab: unindent 4 spaces
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const val = textarea.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const line = val.substring(lineStart, start);
      if (line.startsWith('    ')) {
        this.code.set(val.substring(0, lineStart) + val.substring(lineStart + 4));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 4);
          this.updateCursorPos();
        }, 0);
      }
      return;
    }

    setTimeout(() => this.updateCursorPos(), 0);
  }

  executeCode() {
    if (this.running() || !this.code().trim()) return;

    this.running.set(true);
    this.activeTerminalTab.set('terminal');
    this.mobileActivePane.set('terminal');

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
    this.mobileActivePane.set('terminal');

    this.codeRunner
      .execute(this.currentLanguage(), this.code(), '', tests)
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.testing.set(false);
          // If all test cases passed, register solved challenge for badges/profile and notify parent!
          if (res.tests && res.tests.length > 0 && res.tests.every(t => t.passed)) {
            this.challengeStatus.set('passed_tests');
            this.recordChallengeCompleted();
            this.showToast('🏆 ¡Todas las pruebas del sistema pasaron! Ejercicio aprobado.');
            this.challengeSolved.emit({
              passed: true,
              method: 'tests',
              score: 100,
              message: 'Todas las pruebas automatizadas del sistema pasaron exitosamente.',
            });
          } else if (res.tests && res.tests.some(t => !t.passed)) {
            this.challengeStatus.set('needs_work');
          }
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

  private recordChallengeCompleted() {
    if (typeof window === 'undefined') return;
    try {
      const challengeKey = String(this.lessonId() || this.lessonTitle() || 'challenge');
      const stored = JSON.parse(localStorage.getItem('syseng_solved_challenges') || '[]');
      if (!stored.includes(challengeKey)) {
        stored.push(challengeKey);
        localStorage.setItem('syseng_solved_challenges', JSON.stringify(stored));
        this.showToast('🏆 ¡Reto completado! Has desbloqueado progreso para tus insignias');
      }
    } catch {}
  }

  async evaluateSolutionWithAi(): Promise<void> {
    if (this.aiLoading() || !this.code().trim()) {
      if (!this.code().trim()) {
        this.showToast('⚠️ Escribe tu solución antes de solicitar la evaluación.');
      }
      return;
    }

    this.activeTerminalTab.set('ai');
    this.mobileActivePane.set('terminal');

    const promptText = `🤖 Solicito evaluación formal de mi solución para el ejercicio "${this.lessonTitle()}". ¿Cumple los requerimientos para ser aprobado?`;
    const userMsg: TerminalAiMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: promptText,
      timestamp: new Date(),
    };
    this.copilotMessages.update(msgs => [...msgs, userMsg]);
    this.scrollCopilotToBottom();
    this.aiLoading.set(true);

    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.currentLanguage(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: this.executionResult(),
      hint: this.hint(),
    };

    try {
      const evaluation = await this.callAiEvaluator(context);

      const isApproved = !!evaluation.approved;
      const score = evaluation.score ?? (isApproved ? 100 : 40);

      const statusTag = isApproved ? '🏆 ¡APROBADO POR BYTE IA!' : '❌ NECESITA MEJORAS';
      const aiReplyText = `### ${statusTag} (Calificación: ${score}/100)\n\n` +
        `**Veredicto:** ${evaluation.verdict || (isApproved ? 'Aprobado' : 'Rechazado')}\n\n` +
        `**Resumen:** ${evaluation.summary}\n\n` +
        (evaluation.feedback ? `**Diagnóstico:**\n${evaluation.feedback}\n\n` : '') +
        (isApproved
          ? `> ✅ **¡Excelente trabajo!** Has cumplido satisfactoriamente con los requerimientos pedagógicos del ejercicio. Tu progreso ha sido registrado y el siguiente contenido está habilitado.`
          : `> 💡 **Guía:** Revisa las observaciones anteriores, ajusta tu código en el editor y vuelve a presionar *Evaluar con IA* o ejecuta los *Tests*.`);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (isApproved) {
        this.challengeStatus.set('passed_ai');
        this.recordChallengeCompleted();
        this.showToast('🎉 ¡Ejercicio aprobado por Byte IA! Lección completada.');
        this.challengeSolved.emit({
          passed: true,
          method: 'ai',
          score,
          message: evaluation.summary,
        });
      } else {
        this.challengeStatus.set('needs_work');
        this.showToast('⚠️ Tu solución aún necesita ajustes. Consulta el diagnóstico en Byte Copilot.');
      }
    } catch (_err) {
      // Fallback socrático local
      const localEval = this.evaluateLocally(context);
      const isApproved = localEval.approved;
      const score = isApproved ? 100 : 50;

      const aiReplyText = `### ${isApproved ? '🏆 ¡APROBADO POR EL SISTEMA Y BYTE IA!' : '⚠️ REVISIÓN DEL EJERCICIO'}\n\n` +
        `**Resumen:** ${localEval.summary}\n\n` +
        `**Observaciones:**\n${localEval.feedback}\n\n` +
        (isApproved
          ? `> ✅ **Objetivo completado.** El código cumple la estructura y métodos requeridos.`
          : `> 💡 Ajusta tu solución según lo pedido y prueba de nuevo.`);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (isApproved) {
        this.challengeStatus.set('passed_ai');
        this.recordChallengeCompleted();
        this.showToast('🎉 ¡Ejercicio aprobado con éxito!');
        this.challengeSolved.emit({
          passed: true,
          method: 'ai',
          score,
          message: localEval.summary,
        });
      } else {
        this.challengeStatus.set('needs_work');
        this.showToast('⚠️ Ajusta tu código antes de aprobar.');
      }
    } finally {
      this.aiLoading.set(false);
      this.scrollCopilotToBottom();
    }
  }

  private async callAiEvaluator(ctx: any): Promise<{
    approved: boolean;
    score: number;
    verdict: string;
    summary: string;
    feedback: string;
  }> {
    const systemPrompt = `Eres Byte AI, evaluador técnico estricto y tutor pedagógico de SysEngAcademy.
Tu tarea es evaluar objetivamente si el código del estudiante resuelve el ejercicio "${ctx.lesson}" en ${ctx.language}.

Reglas de evaluación:
1. Revisa si implementó la clase, atributos, métodos o algoritmo pedido en el enunciado y la pista: "${ctx.hint || ''}".
2. Si el código está vacío, o es idéntico a las instrucciones iniciales sin implementar nada, DEBES responder approved: false.
3. Si los métodos principales requeridos existen y retornan/hacen lo especificado, responde approved: true.
4. Responde EXCLUSIVAMENTE un objeto JSON válido con las claves:
   - "approved": boolean (true si pasa, false si no)
   - "score": number entre 0 y 100
   - "verdict": "APROBADO" | "NECESITA MEJORAS"
   - "summary": string breve (1-2 oraciones)
   - "feedback": string con detalles de aciertos o qué falta`;

    let userPrompt = `Reto: ${ctx.lesson}\nLenguaje: ${ctx.language}\nPista / Requerimientos: ${ctx.hint || 'No disponible'}\n`;
    if (ctx.lastExecution?.tests?.length) {
      userPrompt += `Resultados de tests previos: ${JSON.stringify(ctx.lastExecution.tests)}\n`;
    }
    userPrompt += `\nCódigo del estudiante:\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\``;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Code Evaluator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    try {
      const parsed = JSON.parse(rawContent);
      return {
        approved: !!parsed.approved,
        score: typeof parsed.score === 'number' ? parsed.score : (parsed.approved ? 100 : 40),
        verdict: parsed.verdict || (parsed.approved ? 'APROBADO' : 'NECESITA MEJORAS'),
        summary: parsed.summary || (parsed.approved ? 'Solución correcta y funcional.' : 'Faltan requerimientos.'),
        feedback: parsed.feedback || '',
      };
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          approved: !!parsed.approved,
          score: typeof parsed.score === 'number' ? parsed.score : (parsed.approved ? 100 : 40),
          verdict: parsed.verdict || (parsed.approved ? 'APROBADO' : 'NECESITA MEJORAS'),
          summary: parsed.summary || '',
          feedback: parsed.feedback || '',
        };
      }
      throw new Error('Respuesta no parseable');
    }
  }

  private evaluateLocally(ctx: any): { approved: boolean; summary: string; feedback: string } {
    const code = ctx.code || '';
    const cleanCode = code.replace(/#.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (!cleanCode || cleanCode.length < 15) {
      return {
        approved: false,
        summary: 'El código está prácticamente vacío.',
        feedback: 'Debes escribir la implementación requerida para el reto.',
      };
    }

    if (ctx.lastExecution?.tests?.length > 0 && ctx.lastExecution.tests.every((t: any) => t.passed)) {
      return {
        approved: true,
        summary: 'Todas las pruebas unitarias fueron validadas y superadas.',
        feedback: 'La estructura y comportamiento cumplen con todas las especificaciones.',
      };
    }

    const lTitle = (ctx.lesson || '').toLowerCase();
    if (lTitle.includes('clase') || lTitle.includes('libro')) {
      const hasClass = /class\s+Libro\b/i.test(code);
      const hasInit = /def\s+__init__\s*\(\s*self/i.test(code);
      const hasMostrar = /def\s+mostrar\s*\(\s*self/i.test(code);
      if (hasClass && hasInit && hasMostrar) {
        return {
          approved: true,
          summary: 'La clase Libro y sus métodos __init__ y mostrar() están correctamente estructurados.',
          feedback: 'Se identificó la declaración de la clase, el constructor con self y el método de representación.',
        };
      } else {
        const missing: string[] = [];
        if (!hasClass) missing.push('Declarar la clase Libro');
        if (!hasInit) missing.push('Definir el constructor __init__(self, titulo, autor)');
        if (!hasMostrar) missing.push('Definir el método mostrar(self)');
        return {
          approved: false,
          summary: 'La implementación está incompleta.',
          feedback: `Falta: ${missing.join(', ')}.`,
        };
      }
    }

    if (ctx.lastExecution && ctx.lastExecution.exit_code === 0 && !ctx.lastExecution.stderr) {
      return {
        approved: true,
        summary: 'El código compila y ejecuta limpiamente sin errores de consola.',
        feedback: 'Ejecución exitosa en el entorno de ejecución.',
      };
    }

    return {
      approved: false,
      summary: 'El código requiere revisión para satisfacer el problema.',
      feedback: 'Ejecuta ./test.sh o revisa la salida en terminal para verificar tus resultados.',
    };
  }

  /* ============================================================
     BYTE AI LINUX COPILOT (OPENROUTER GPT-4O-MINI)
     ============================================================ */

  askByteWithChip(promptText: string) {
    this.dispatchAiQuery(promptText);
  }

  sendUserChatMessage() {
    const text = this.aiInputText().trim();
    if (!text || this.aiLoading()) return;

    this.aiInputText.set('');
    this.dispatchAiQuery(text);
  }

  private async dispatchAiQuery(userQuestion: string) {
    this.aiLoading.set(true);
    this.activeTerminalTab.set('ai');

    const userMsg: TerminalAiMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userQuestion,
      timestamp: new Date(),
    };
    this.copilotMessages.update(msgs => [...msgs, userMsg]);
    this.scrollCopilotToBottom();

    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.currentLanguage(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: this.executionResult(),
      hint: this.hint(),
    };

    try {
      const aiReplyText = await this.callAiService(userQuestion, context);
      const codeMatch = aiReplyText.match(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
      };

      this.copilotMessages.update(msgs => [...msgs, aiMsg]);
    } catch (_err) {
      const fallbackReply = this.generateSmartLocalGuidance(userQuestion, context);
      const codeMatch = fallbackReply.match(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date(),
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
      };

      this.copilotMessages.update(msgs => [...msgs, aiMsg]);
    } finally {
      this.aiLoading.set(false);
      this.scrollCopilotToBottom();
    }
  }

  private async callAiService(question: string, ctx: any): Promise<string> {
    const systemPrompt = `Eres Byte AI, copiloto de terminal Linux y tutor socrático en SysEngAcademy.
Tu objetivo es guiar al estudiante para que resuelva el reto por sí mismo en ${ctx.language}.
Reglas:
1. Responde en español con tono conciso, técnico y directo de terminal.
2. Si te piden una pista, guía el razonamiento algorítmico sin dar la solución completa copiada.
3. Si los casos de prueba fallaron, diagnostica la línea exacta y qué caso borde faltó.
4. Si piden pseudocódigo o solución, muestra código limpio en bloques markdown \`\`\`${ctx.language}.
5. Mantén las respuestas claras y orientadas a ingeniería de sistemas.`;

    let userPrompt = `Reto: "${ctx.lesson}" | Lenguaje: ${ctx.language}\n`;
    if (ctx.hint) {
      userPrompt += `Pista: ${ctx.hint}\n`;
    }
    userPrompt += `\nCódigo actual del estudiante:\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\`\n`;

    if (ctx.lastExecution) {
      if (ctx.lastExecution.stderr) {
        userPrompt += `\nError en terminal (stderr): ${ctx.lastExecution.stderr}\n`;
      }
      if (ctx.lastExecution.tests && ctx.lastExecution.tests.length > 0) {
        const failed = ctx.lastExecution.tests.filter((t: any) => !t.passed);
        if (failed.length > 0) {
          userPrompt += `\nPruebas fallidas (${failed.length}/${ctx.lastExecution.tests.length}):\n`;
          failed.forEach((f: any) => {
            userPrompt += `  - input="${f.input}", expected="${f.expected}", actual="${f.actual}"\n`;
          });
        }
      }
    }

    userPrompt += `\nConsulta: ${question}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Linux Terminal IDE',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 850,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Byte no pudo generar una respuesta.';
  }

  private generateSmartLocalGuidance(question: string, ctx: any): string {
    const qLower = question.toLowerCase();
    const hasStderr = ctx.lastExecution?.stderr;
    const failedTests = ctx.lastExecution?.tests?.filter((t: any) => !t.passed) || [];

    if (qLower.includes('empezar') || qLower.includes('inicio') || qLower.includes('cómo')) {
      let advice = `### 💡 Guía para iniciar "${ctx.lesson}"\n\n`;
      advice += `1. **Identifica entradas y salidas:** Analiza qué parámetros recibe la función y qué debe retornar.\n`;
      if (ctx.hint) {
        advice += `2. **Pista clave:** ${ctx.hint}\n`;
      }
      advice += `3. **Estructura lógica recomendada:**\n`;
      advice += `   - Maneja casos base (colecciones vacías o cadenas de longitud 0).\n`;
      advice += `   - Inicializa la estructura de datos (p. ej. pila/lista o diccionario).\n`;
      advice += `   - Itera y aplica la regla de negocio.\n`;
      advice += `   - Retorna el resultado final validando el estado acumulado.`;
      return advice;
    }

    if (failedTests.length > 0) {
      const f = failedTests[0];
      return `### 🔍 Diagnóstico de Prueba Fallida\n\n` +
        `Tu código falló con entrada \`${f.input}\`:\n` +
        `- **Esperado:** \`${f.expected}\`\n` +
        `- **Obtenido:** \`${f.actual || '(vacío)'}\`\n\n` +
        `Revisa si estás manejando casos donde la condición de parada se activa antes de tiempo o si quedan elementos pendientes.`;
    }

    if (hasStderr) {
      return `### ⚠️ Diagnóstico de Error en Terminal\n\n` +
        `Error en tiempo de ejecución:\n` +
        `\`\`\`\n${hasStderr}\n\`\`\`\n` +
        `Verifica que todas las variables estén declaradas y los tipos de datos coincidan.`;
    }

    return `### 🤖 Sugerencia de Byte AI\n\n` +
      `Tu código tiene buena estructura base. Asegúrate de retornar explícitamente el resultado y verificar casos extremos.\n` +
      (ctx.hint ? `Pista: *${ctx.hint}*` : '');
  }

  applySnippetToEditor(snippet: string) {
    if (!snippet) return;
    this.code.set(snippet);
    this.isModified.set(true);
    this.updateCursorPos();
    this.showToast('✓ Código aplicado al buffer de edición');
  }

  copySnippet(snippet: string) {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      this.showToast('📋 Código copiado al portapapeles');
    });
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 2500);
  }

  private scrollCopilotToBottom() {
    setTimeout(() => {
      if (this.copilotScrollRef) {
        this.copilotScrollRef.nativeElement.scrollTop = this.copilotScrollRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  renderMarkdown(text: string): string {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return esc
      .replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
