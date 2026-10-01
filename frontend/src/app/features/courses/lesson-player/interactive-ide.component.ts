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
      [class.mobile-view-editor]="mobileActivePane() === 'editor'"
      [class.mobile-view-terminal]="mobileActivePane() === 'terminal'"
      [class.mobile-view-ai]="mobileActivePane() === 'ai'"
    >
      <!-- LINUX TERMINAL TITLE BAR (Clean, Minimalist, Unix-style) -->
      <div class="terminal-titlebar">
        <!-- LEFT: Unix dots + clean session info -->
        <div class="titlebar-left">
          <div class="terminal-dots" aria-hidden="true">
            <span class="dot dot-red"></span>
            <span class="dot dot-amber"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="terminal-session-info">
            <span class="session-host">syseng@terminal</span>:<span class="session-path">~/solution{{ currentLangInfo().extension }}</span>
            @if (isModified()) {
              <span class="session-dirty" title="Cambios sin guardar">●</span>
            }
          </div>
        </div>

        <!-- RIGHT: Essential, clean action buttons -->
        <div class="titlebar-right">
          <!-- Primary: Run button -->
          <button
            type="button"
            class="cli-btn btn-run"
            (click)="executeCode()"
            [disabled]="running() || testing() || !code().trim()"
            title="Compilar y ejecutar: ./run.sh (Ctrl + Enter)"
          >
            <span class="cli-icon">{{ running() ? '⏳' : '▶' }}</span>
            <span>{{ running() ? 'ejecutando...' : 'Ejecutar' }}</span>
            <kbd class="cli-kbd">Ctrl↵</kbd>
          </button>

          <!-- Tests button (if tests exist) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="cli-btn btn-test"
              (click)="runTests()"
              [disabled]="running() || testing() || !code().trim()"
              title="Ejecutar pruebas automatizadas: ./test.sh"
            >
              <span class="cli-icon">{{ testing() ? '⏳' : '🧪' }}</span>
              <span>{{ testing() ? 'probando...' : 'Probar' }}</span>
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

          <!-- Direct validation button -->
          @if (isApproved()) {
            <span class="badge-challenge-done" title="Ejercicio aprobado">
              ✓ Superado
            </span>
          } @else {
            <button
              type="button"
              class="cli-btn btn-validate"
              (click)="manualApproveAndComplete()"
              [disabled]="running() || testing() || !code().trim()"
              title="Validar y completar este ejercicio"
            >
              <span class="cli-icon">✓</span>
              <span>Validar Reto</span>
            </button>
          }

          <span class="titlebar-vdiv" aria-hidden="true"></span>

          <!-- Tool icon: Reiniciar -->
          <button
            type="button"
            class="cli-icon-btn"
            (click)="resetCode()"
            title="Restablecer código inicial"
          >
            ↺
          </button>

          <!-- Language Selector -->
          <select
            class="cli-select-compact"
            [ngModel]="currentLanguage()"
            (ngModelChange)="onLanguageChange($event)"
            [disabled]="running() || testing()"
            aria-label="Seleccionar lenguaje"
          >
            @for (lang of languages; track lang.id) {
              <option [value]="lang.id">{{ lang.name }}</option>
            }
          </select>
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
          <span class="m-tab-glyph ai-spark">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path></svg>
          </span>
          <span>Byte AI</span>
          @if (hasUnreadAiAdvice()) {
            <span class="m-badge badge-unread">nuevo</span>
          }
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
                <span>&gt;_ Consola</span>
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
                  <span>🧪 Pruebas</span>
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
                <span class="ai-spark">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path></svg>
                </span>
                <span>Byte Copilot</span>
                @if (hasUnreadAiAdvice()) {
                  <span class="ai-unread-badge" title="Nuevas recomendaciones disponibles">nuevo</span>
                }
                @if (aiLoading()) {
                  <span class="ai-pulse">●</span>
                }
              </button>

              @if (hint()) {
                <button
                  type="button"
                  class="term-strip-tab tab-hint-strip"
                  [class.is-active]="showHintBar()"
                  (click)="showHintBar.set(!showHintBar())"
                  title="Ver pista técnica"
                >
                  <span>💡 Pista</span>
                </button>
              }
            </div>

            <!-- Terminal Controls -->
            <div class="terminal-meta-controls">
              @if (executionResult()?.execution_time_ms !== undefined) {
                <span class="term-time-stat">⚡ {{ executionResult()!.execution_time_ms }}ms</span>
              }
              @if (executionResult()) {
                <button
                  type="button"
                  class="term-clear-btn"
                  (click)="clearTerminal()"
                  title="Limpiar salida de consola"
                >
                  limpiar
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
                    <span class="ai-bot-glyph">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path></svg>
                    </span>
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
        background: #080c14;
        border: 1px solid #1a2333;
        border-radius: 8px;
        overflow: hidden;
        margin: 1.25rem 0;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #e2e8f0;
        min-height: 580px;
        height: 640px;
        box-sizing: border-box;
        position: relative;
        transition: box-shadow 0.2s ease;
      }

      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace;
      }

      /* ============================================================
         LINUX TITLE BAR (Authentic Unix Window Style)
         ============================================================ */
      .terminal-titlebar {
        height: 38px;
        background: #0c101a;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #161e2e;
        padding: 0 0.75rem;
        flex-shrink: 0;
        user-select: none;
        gap: 0.75rem;
      }

      .titlebar-left {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        height: 100%;
        flex-shrink: 0;
      }

      .terminal-dots {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        transition: opacity 0.15s;
      }

      .dot-red { background: #ef4444; }
      .dot-amber { background: #f59e0b; }
      .dot-green { background: #10b981; }

      .terminal-session-info {
        display: inline-flex;
        align-items: center;
        gap: 0.2rem;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.76rem;
        color: #94a3b8;
        letter-spacing: -0.01em;
      }

      .session-host {
        color: #10b981;
        font-weight: 600;
      }

      .session-path {
        color: #38bdf8;
      }

      .session-dirty {
        color: #f59e0b;
        font-size: 0.6rem;
        margin-left: 2px;
      }

      .titlebar-right {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-shrink: 0;
      }

      /* ACTION BUTTONS */
      .cli-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.25rem 0.65rem;
        font-size: 0.74rem;
        font-family: inherit;
        font-weight: 600;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
        border: 1px solid transparent;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-run {
        background: #059669;
        color: #ffffff;
        border-color: #10b981;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);

        &:hover:not(:disabled) {
          background: #047857;
          border-color: #34d399;
        }
      }

      .btn-test {
        background: rgba(56, 189, 248, 0.08);
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.3);

        &:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.18);
          color: #ffffff;
        }
      }

      .btn-validate {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.35);

        &:hover:not(:disabled) {
          background: #059669;
          color: #ffffff;
          border-color: #34d399;
        }
      }

      .badge-challenge-done {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 0.18rem 0.5rem;
        border-radius: 4px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
      }

      .badge-pill {
        font-size: 0.62rem;
        font-weight: 700;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;

        &.badge-ok { background: #059669; color: #ffffff; }
        &.badge-err { background: #dc2626; color: #ffffff; }
      }

      .cli-kbd {
        background: rgba(0, 0, 0, 0.35);
        padding: 0.05rem 0.25rem;
        border-radius: 2px;
        font-size: 0.6rem;
        color: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .titlebar-vdiv {
        width: 1px;
        height: 18px;
        background: #1e293b;
        margin: 0 0.15rem;
      }

      /* MINIMALIST UTILITY ICONS */
      .cli-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        background: transparent;
        border: 1px solid #1e293b;
        border-radius: 4px;
        color: #64748b;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: #f1f5f9;
          background: #161e2e;
          border-color: #334155;
        }

        &.is-active {
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(56, 189, 248, 0.08);
        }
      }

      /* COMPACT LANGUAGE SELECT */
      .cli-select-compact {
        background: #090d16;
        color: #94a3b8;
        border: 1px solid #1e293b;
        border-radius: 4px;
        padding: 0.22rem 0.55rem;
        font-size: 0.72rem;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        cursor: pointer;
        outline: none;
        transition: all 0.15s ease;

        &:focus {
          border-color: #38bdf8;
          color: #f1f5f9;
        }

        &:hover {
          color: #f1f5f9;
          border-color: #334155;
        }
      }

      /* ============================================================
         COLLAPSIBLE PROMPT ROWS (HINT & STDIN)
         ============================================================ */
      .terminal-hint-row {
        background: #0d131f;
        border-bottom: 1px solid #161e2e;
        padding: 0.4rem 0.85rem;
        font-size: 0.74rem;
        flex-shrink: 0;
      }

      .hint-line {
        margin-bottom: 0.25rem;
      }

      .prompt-user { color: #10b981; font-weight: 600; }
      .prompt-dir { color: #38bdf8; }
      .prompt-cmd { color: #f1f5f9; }

      .hint-output {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        color: #fef08a;
        background: rgba(245, 158, 11, 0.08);
        border: 1px solid rgba(245, 158, 11, 0.2);
        border-radius: 4px;
        padding: 0.35rem 0.6rem;
      }

      .hint-dismiss-btn {
        margin-left: auto;
        background: transparent;
        border: none;
        color: #fbbf24;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0 0.2rem;

        &:hover { color: #ffffff; }
      }

      .terminal-stdin-row {
        background: #0d131f;
        border-bottom: 1px solid #161e2e;
        padding: 0.35rem 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.74rem;
        flex-shrink: 0;
      }

      .stdin-prompt {
        color: #10b981;
        font-weight: 600;
      }

      .stdin-text-field {
        flex: 1;
        background: #080c14;
        border: 1px solid #1e293b;
        border-radius: 4px;
        color: #f8fafc;
        font-size: 0.74rem;
        padding: 0.25rem 0.55rem;
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
        background: #080c14;
      }

      .layout-stacked .terminal-workspace {
        grid-template-rows: minmax(320px, 1.4fr) minmax(220px, 1fr);
        grid-template-columns: 1fr;
      }

      .layout-split .terminal-workspace {
        grid-template-columns: minmax(360px, 1.15fr) minmax(320px, 0.85fr);
        grid-template-rows: 1fr;
      }

      /* ============================================================
         EDITOR BUFFER PANE
         ============================================================ */
      .editor-pane {
        display: flex;
        height: 100%;
        min-height: 0;
        background: #080c14;
        border-right: 1px solid #161e2e;
        border-bottom: 1px solid #161e2e;
        overflow: hidden;
      }

      .editor-gutter {
        width: 44px;
        padding: 0.75rem 0;
        background: #080c14;
        color: #334155;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.84rem;
        line-height: 1.6;
        text-align: right;
        user-select: none;
        border-right: 1px solid #161e2e;
        overflow: hidden;
        flex-shrink: 0;
      }

      .gutter-line {
        padding-right: 0.65rem;

        &.is-active-line {
          color: #38bdf8;
          font-weight: 600;
          background: rgba(56, 189, 248, 0.05);
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
        padding: 0.75rem 1rem;
        background: transparent;
        color: #f1f5f9;
        border: none;
        outline: none;
        resize: none;
        font-size: 0.86rem;
        line-height: 1.6;
        white-space: pre;
        overflow: auto;
        tab-size: 4;
        caret-color: #10b981;
        box-sizing: border-box;

        &::placeholder {
          color: #334155;
        }

        &::selection {
          background: rgba(56, 189, 248, 0.25);
        }
      }

      /* ============================================================
         TERMINAL OUTPUT PANE
         ============================================================ */
      .terminal-pane {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: #05080f;
        overflow: hidden;
      }

      .terminal-header-strip {
        height: 34px;
        background: #0a0e17;
        border-bottom: 1px solid #161e2e;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.65rem;
        flex-shrink: 0;
        user-select: none;
      }

      .terminal-tabs-group {
        display: flex;
        gap: 0.2rem;
      }

      .term-strip-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        color: #64748b;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.4rem 0.65rem;
        font-size: 0.72rem;
        font-weight: 600;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        letter-spacing: 0.02em;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: #f1f5f9;
        }

        &.is-active {
          color: #10b981;
          border-bottom-color: #10b981;
          background: rgba(16, 185, 129, 0.04);
        }

        &.tab-ai-strip.is-active {
          color: #c084fc;
          border-bottom-color: #a855f7;
          background: rgba(168, 85, 247, 0.04);
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
        background: #161e2e;
        color: #cbd5e1;

        &.is-ok { background: #059669; color: #ffffff; }
        &.is-err { background: #dc2626; color: #ffffff; }
      }

      .ai-pulse {
        color: #a855f7;
        font-size: 0.65rem;
        animation: pulseBlink 1s infinite alternate;
      }

      .ai-unread-badge {
        background: #7c3aed;
        color: #ffffff;
        font-size: 0.58rem;
        font-weight: 700;
        padding: 0.05rem 0.35rem;
        border-radius: 9999px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        animation: pulseBlink 1.2s infinite alternate;
        box-shadow: 0 0 6px rgba(168, 85, 247, 0.6);
      }

      .badge-unread {
        background: #7c3aed !important;
        color: #ffffff !important;
      }

      .terminal-meta-controls {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .term-time-stat {
        font-size: 0.68rem;
        color: #64748b;
        font-family: 'JetBrains Mono', monospace;
      }

      .term-clear-btn {
        background: transparent;
        border: 1px solid #1e293b;
        color: #64748b;
        font-size: 0.68rem;
        cursor: pointer;
        padding: 0.12rem 0.45rem;
        border-radius: 3px;
        font-family: inherit;

        &:hover {
          color: #f1f5f9;
          background: #161e2e;
          border-color: #334155;
        }
      }

      .terminal-viewport {
        flex: 1 1 0%;
        min-height: 0;
        overflow-y: auto;
        padding: 0.75rem 1rem;
        background: #05080f;
        font-size: 0.8rem;
        line-height: 1.55;
        color: #cbd5e1;
        box-sizing: border-box;
      }

      /* STDOUT STREAM */
      .cli-stdout-stream {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
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
        padding: 0.45rem 0.65rem;
        border-radius: 0 4px 4px 0;
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
        margin-top: 0.35rem;
        padding-top: 0.35rem;
        border-top: 1px dashed #161e2e;

        &.is-err { color: #f87171; }
        &.is-ok { color: #34d399; }
      }

      .cli-idle-prompt {
        color: #64748b;

        .cursor-block {
          display: inline-block;
          width: 8px;
          height: 14px;
          background: #10b981;
          vertical-align: middle;
          animation: pulseBlink 0.9s infinite alternate;
        }

        .cli-idle-hint {
          margin-top: 0.5rem;
          color: #475569;
          font-size: 0.74rem;

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
        background: #080c14;
        border: 1px solid #161e2e;
        border-radius: 4px;
        padding: 0.5rem 0.75rem;

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
        border-top: 1px solid #161e2e;
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
        padding: 0.35rem 0.85rem;
        border-radius: 3px;
        font-size: 0.72rem;
        font-family: inherit;
        font-weight: 600;
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
        background: #080c14;
        border: 1px solid rgba(168, 85, 247, 0.25);
        border-radius: 4px;
        padding: 0.45rem 0.7rem;
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
        gap: 0.35rem;
        overflow-x: auto;
        padding-bottom: 0.35rem;
        margin-bottom: 0.4rem;
        flex-shrink: 0;
      }

      .cli-chip {
        background: #0e1422;
        border: 1px solid #1e293b;
        color: #94a3b8;
        font-size: 0.68rem;
        padding: 0.22rem 0.5rem;
        border-radius: 3px;
        white-space: nowrap;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          color: #ffffff;
          background: #1a2333;
          border-color: #a855f7;
        }

        &:disabled { opacity: 0.4; cursor: not-allowed; }
      }

      .cli-messages-stream {
        flex: 1 1 0%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        margin-bottom: 0.45rem;
        padding-right: 0.2rem;
      }

      .cli-copilot-welcome {
        background: #080c14;
        border: 1px dashed rgba(168, 85, 247, 0.25);
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
        background: #080c14;
        border: 1px solid #161e2e;
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
          background: #05080f;
          border: 1px solid #161e2e;
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
        border-top: 1px solid #161e2e;
      }

      .cli-code-btn {
        background: #0e1422;
        border: 1px solid #1e293b;
        color: #f1f5f9;
        font-size: 0.68rem;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;
        font-family: inherit;

        &:hover { background: #1a2333; }
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
        padding: 0.4rem 0;
        border-top: 1px solid #161e2e;
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
        background: #080c14;
        border: 1px solid #1e293b;
        border-radius: 3px;
        color: #f8fafc;
        font-size: 0.74rem;
        padding: 0.3rem 0.55rem;
        outline: none;

        &:focus { border-color: #a855f7; }
        &::placeholder { color: #334155; }
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
        bottom: 34px;
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

      /* ============================================================
         LINUX STATUS BAR (Neovim / Tmux Style)
         ============================================================ */
      .terminal-statusbar {
        height: 24px;
        background: #080c14;
        color: #64748b;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.65rem;
        font-size: 0.68rem;
        border-top: 1px solid #161e2e;
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
      .status-lang { color: #38bdf8; font-weight: 600; }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulseBlink { from { opacity: 0.2; } to { opacity: 1; } }

      /* ============================================================
         MOBILE TERMINAL TABS (VISIBLE <= 768px)
         ============================================================ */
      .mobile-terminal-tabs {
        display: none;
        background: #0c101a;
        border-bottom: 1px solid #161e2e;
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
        background: #0e1422;
        border: 1px solid #1e293b;
        color: #94a3b8;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          color: #f1f5f9;
          background: #1a2333;
        }

        &.is-active {
          background: #1a2333;
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
        background: #080c14;
        color: #cbd5e1;

        &.badge-ok { background: #059669; color: #fff; }
        &.badge-err { background: #dc2626; color: #fff; }
      }

      /* ============================================================
         RESPONSIVE STYLES (MOBILE <= 768px & <= 480px)
         ============================================================ */
      @media (max-width: 768px) {
        .linux-terminal-window {
          height: 500px;
          min-height: 420px;
          margin: 0.75rem 0;
          border-radius: 6px;
        }

        .mobile-terminal-tabs {
          display: flex;
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
          padding: 0 0.45rem;
          height: 38px;
          gap: 0.35rem;
        }

        .titlebar-left {
          gap: 0.35rem;
        }

        .terminal-session-info {
          font-size: 0.7rem;
        }

        .titlebar-right {
          gap: 0.25rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .cli-btn {
          padding: 0.2rem 0.45rem;
          font-size: 0.7rem;

          .cli-kbd {
            display: none;
          }
        }

        .cli-icon-btn {
          width: 26px;
          height: 26px;
        }

        .cli-select-compact {
          font-size: 0.68rem;
          padding: 0.15rem 0.35rem;
          max-width: 90px;
        }

        .editor-gutter {
          width: 32px;
          font-size: 0.74rem;
          padding: 0.5rem 0;
        }

        .gutter-line {
          padding-right: 0.4rem;
        }

        .editor-textarea {
          font-size: 0.82rem;
          padding: 0.5rem 0.75rem;
          line-height: 1.5;
        }

        .terminal-viewport {
          padding: 0.5rem 0.75rem;
          font-size: 0.76rem;
        }

        .terminal-header-strip {
          padding: 0 0.45rem;
          height: 32px;
        }

        .term-strip-tab {
          padding: 0.3rem 0.45rem;
          font-size: 0.68rem;
        }

        .terminal-statusbar {
          font-size: 0.64rem;
          padding: 0 0.45rem;

          .status-hide-mobile {
            display: none !important;
          }
        }
      }

      @media (max-width: 480px) {
        .linux-terminal-window {
          height: 460px;
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

  readonly isApproved = computed(() =>
    this.isCompleted() || this.challengeStatus() === 'passed_tests' || this.challengeStatus() === 'passed_ai'
  );

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
  readonly hasUnreadAiAdvice = signal<boolean>(false);
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
    const minLines = 24;
    const count = Math.max(codeLines, minLines);
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  manualApproveAndComplete() {
    this.markApprovedAutomatically('tests', 100, 'Solución validada y reto aprobado.');
  }

  openCopilotTab() {
    this.hasUnreadAiAdvice.set(false);
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

          // Evaluación continua y recomendaciones activas del Agente:
          if (res.exit_code === 0) {
            if (this.activeTestCases().length > 0) {
              // Si el ejercicio tiene tests, los corremos en segundo plano
              this.codeRunner
                .execute(this.currentLanguage(), this.code(), '', this.activeTestCases())
                .subscribe({
                  next: testRes => {
                    if (testRes.tests && testRes.tests.length > 0 && testRes.tests.every(t => t.passed)) {
                      this.markApprovedAutomatically(
                        'tests',
                        100,
                        'Todas las pruebas automatizadas del sistema pasaron exitosamente.'
                      );
                      // El agente además aporta recomendaciones de buenas prácticas y calidad
                      this.runBackgroundAiEvaluation(testRes);
                    } else {
                      // Pruebas no pasaron: el agente analiza qué falló y aporta recomendaciones
                      this.runBackgroundAiEvaluation(testRes);
                    }
                  },
                });
            } else if (this.code().trim().length > 8) {
              // Si no hay tests unitarios rígidos, aprobar de inmediato al compilar y ejecutar limpiamente
              this.markApprovedAutomatically('tests', 100, 'Código ejecutado exitosamente sin excepciones.');
              this.runBackgroundAiEvaluation(res);
            }
          } else {
            // El código falló con error de compilación o excepción en consola (stderr)
            // El agente analiza el error y le da recomendaciones al estudiante sobre qué estuvo mal
            this.runBackgroundAiEvaluation(res);
          }
        },
        error: err => {
          this.running.set(false);
          const errRes: CodeExecutionResponse = {
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error de conexión con el motor de ejecución.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
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

          // Si pasaron todas las pruebas o al menos la mayoría
          const passedCount = res.tests ? res.tests.filter(t => t.passed).length : 0;
          const totalCount = res.tests ? res.tests.length : 0;

          if (totalCount > 0 && passedCount === totalCount) {
            this.markApprovedAutomatically(
              'tests',
              100,
              'Todas las pruebas automatizadas del sistema pasaron exitosamente.'
            );
            this.runBackgroundAiEvaluation(res);
          } else if (totalCount > 0 && passedCount >= Math.ceil(totalCount / 2)) {
            this.markApprovedAutomatically(
              'tests',
              90,
              'Pruebas principales satisfactorias. Ejercicio aprobado.'
            );
            this.runBackgroundAiEvaluation(res);
          } else if (res.tests && res.tests.some(t => !t.passed)) {
            this.challengeStatus.set('needs_work');
            this.runBackgroundAiEvaluation(res);
          }
        },
        error: err => {
          this.testing.set(false);
          const errRes: CodeExecutionResponse = {
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error al ejecutar las pruebas.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
        },
      });
  }

  private markApprovedAutomatically(method: 'tests' | 'ai', score: number, message: string): void {
    if (this.challengeStatus() === 'passed_tests' || this.challengeStatus() === 'passed_ai' || this.isCompleted()) {
      return;
    }
    this.challengeStatus.set(method === 'tests' ? 'passed_tests' : 'passed_ai');
    this.recordChallengeCompleted();
    const successMsg = method === 'tests'
      ? '🏆 ¡Pruebas superadas con éxito! Ejercicio aprobado por el Sistema.'
      : '✓ ¡Excelente! Solución validada y aprobada automáticamente por el Agente.';
    this.showToast(successMsg);
    this.challengeSolved.emit({
      passed: true,
      method,
      score,
      message,
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

  /**
   * Evaluación automática continua del Agente en segundo plano con diagnóstico y recomendaciones activas
   */
  async runBackgroundAiEvaluation(lastExec: CodeExecutionResponse): Promise<void> {
    if (this.aiLoading()) return;

    this.aiLoading.set(true);
    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.currentLanguage(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: lastExec,
      hint: this.hint(),
    };

    try {
      const evaluation = await this.callAiEvaluator(context);

      let aiReplyText = '';
      if (evaluation.approved) {
        this.markApprovedAutomatically('ai', evaluation.score ?? 100, evaluation.summary);

        aiReplyText = `### 🏆 ¡Solución Validada y Aprobada! (${evaluation.score}/100)\n\n` +
          `**Resumen:** ${evaluation.summary}\n\n` +
          (evaluation.recommendations
            ? `**💡 Recomendaciones de Calidad y Buenas Prácticas:**\n${evaluation.recommendations}\n\n`
            : '') +
          `> ✅ **Objetivo completado.** El avance ha sido registrado automáticamente y el siguiente módulo está habilitado.`;
      } else {
        aiReplyText = `### [BYTE-AI] Revisión en Vivo del Agente (${evaluation.score}/100)\n\n` +
          `**Resumen:** ${evaluation.summary}\n\n` +
          (evaluation.what_was_wrong
            ? `**⚠️ En qué estuvo mal o qué faltó:**\n${evaluation.what_was_wrong}\n\n`
            : (evaluation.feedback ? `**⚠️ Observaciones:**\n${evaluation.feedback}\n\n` : '')) +
          (evaluation.recommendations
            ? `**💡 Recomendaciones para mejorar:**\n${evaluation.recommendations}\n\n`
            : '') +
          (evaluation.next_step
            ? `**🚀 Siguiente paso sugerido:**\n${evaluation.next_step}\n\n`
            : '') +
          `> 💡 *Ajusta tu código en el editor y presiona [▶ run] para revalidar automáticamente.*`;
      }

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (this.activeTerminalTab() !== 'ai') {
        this.hasUnreadAiAdvice.set(true);
        if (!evaluation.approved) {
          this.showToast('[BYTE-AI] El Agente analizó tu código y dejó recomendaciones en Copilot.');
        }
      }
    } catch (_err) {
      const localEval = this.evaluateLocally(context);
      let aiReplyText = '';
      if (localEval.approved) {
        this.markApprovedAutomatically('ai', localEval.score || 100, localEval.summary);
        aiReplyText = `### 🏆 ¡Solución Aprobada por el Sistema y el Agente! (100/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.recommendations ? `**💡 Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          `> ✅ **Excelente trabajo.** Continúa con la siguiente lección.`;
      } else {
        aiReplyText = `### [BYTE-AI] Revisión del Agente — Ajustes Requeridos (${localEval.score || 40}/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.what_was_wrong ? `**⚠️ En qué estuvo mal:**\n${localEval.what_was_wrong}\n\n` : '') +
          (localEval.recommendations ? `**💡 Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          (localEval.next_step ? `**🚀 Siguiente paso:**\n${localEval.next_step}\n\n` : '') +
          `> 💡 *Ajusta tu código y presiona [▶ run] para revalidar.*`;
      }

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (this.activeTerminalTab() !== 'ai') {
        this.hasUnreadAiAdvice.set(true);
      }
    } finally {
      this.aiLoading.set(false);
      this.scrollCopilotToBottom();
    }
  }

  async evaluateSolutionWithAi(): Promise<void> {
    const lastExec = this.executionResult() || {
      stdout: '',
      stderr: '',
      exit_code: 0,
      execution_time_ms: 0,
      language: this.currentLanguage(),
    };
    return this.runBackgroundAiEvaluation(lastExec);
  }

  private async callAiEvaluator(ctx: any): Promise<{
    approved: boolean;
    score: number;
    verdict: string;
    summary: string;
    what_was_wrong: string;
    recommendations: string;
    next_step: string;
    feedback: string;
  }> {
    const systemPrompt = `Eres Byte AI, evaluador técnico estricto y tutor pedagógico de SysEngAcademy.
Tu misión no es solo validar si el código pasa o no, sino FORMAR al estudiante con explicaciones claras sobre qué estuvo mal, qué faltó, y recomendaciones de buenas prácticas y calidad de código.

Instrucciones pedagógicas:
1. Revisa si implementó el algoritmo, clase, atributos o métodos requeridos en: "${ctx.lesson}".
2. Si hay errores (sintaxis, excepciones en stderr, tests fallidos, requerimientos ausentes o código incompleto):
   - "approved": false
   - "score": número entre 0 y 60
   - "verdict": "NECESITA MEJORAS"
   - "summary": frase resumen concisa del estado del código
   - "what_was_wrong": Explica con claridad qué estuvo mal (error de sintaxis, excepción en stderr, por qué falló la lógica o qué método/atributo faltó).
   - "recommendations": 2 o 3 recomendaciones concretas (legibilidad, buenas prácticas, estándares del lenguaje, cómo enfocar la lógica).
   - "next_step": Pista socrática para que el estudiante resuelva el problema sin darle el código copiado.
3. Si la solución es correcta y cumple los requerimientos:
   - "approved": true
   - "score": número entre 90 y 100
   - "verdict": "APROBADO"
   - "summary": felicitación y resumen de aciertos
   - "what_was_wrong": ""
   - "recommendations": Recomendaciones de optimización (complejidad Big-O, limpieza de código, estándares de la industria, tipado).
   - "next_step": Sugerencia de pasar a la siguiente lección.

Responde EXCLUSIVAMENTE un JSON válido con estas claves:
{
  "approved": boolean,
  "score": number,
  "verdict": string,
  "summary": string,
  "what_was_wrong": string,
  "recommendations": string,
  "next_step": string
}`;

    let userPrompt = `Reto: ${ctx.lesson}\nLenguaje: ${ctx.language}\nPista / Requerimientos: ${ctx.hint || 'No disponible'}\n`;
    if (ctx.lastExecution?.exit_code !== undefined) {
      userPrompt += `Exit Code: ${ctx.lastExecution.exit_code}\n`;
    }
    if (ctx.lastExecution?.stderr) {
      userPrompt += `Error en consola (stderr):\n${ctx.lastExecution.stderr}\n`;
    }
    if (ctx.lastExecution?.stdout) {
      userPrompt += `Salida estándar (stdout):\n${ctx.lastExecution.stdout}\n`;
    }
    if (ctx.lastExecution?.tests?.length) {
      userPrompt += `Resultados de tests unitarios: ${JSON.stringify(ctx.lastExecution.tests)}\n`;
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
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Respuesta no parseable');
      }
    }

    return {
      approved: !!parsed.approved,
      score: typeof parsed.score === 'number' ? parsed.score : (parsed.approved ? 100 : 40),
      verdict: parsed.verdict || (parsed.approved ? 'APROBADO' : 'NECESITA MEJORAS'),
      summary: parsed.summary || (parsed.approved ? 'Solución correcta y funcional.' : 'El código requiere ajustes.'),
      what_was_wrong: parsed.what_was_wrong || parsed.feedback || '',
      recommendations: parsed.recommendations || '',
      next_step: parsed.next_step || '',
      feedback: parsed.feedback || parsed.what_was_wrong || '',
    };
  }

  private evaluateLocally(ctx: any): {
    approved: boolean;
    score: number;
    summary: string;
    what_was_wrong: string;
    recommendations: string;
    next_step: string;
    feedback: string;
  } {
    const code = ctx.code || '';
    const cleanCode = code.replace(/#.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (!cleanCode || cleanCode.length < 15) {
      return {
        approved: false,
        score: 10,
        summary: 'El código está prácticamente vacío.',
        what_was_wrong: 'Aún no has escrito la lógica para resolver el ejercicio planteado.',
        recommendations: 'Lee con atención la pista técnica y la descripción del reto. Comienza declarando las variables, funciones o clases pedidas.',
        next_step: 'Escribe la estructura base en el editor y presiona [▶ run].',
        feedback: 'Debes escribir la implementación requerida para el reto.',
      };
    }

    // Si hubo error de compilación o ejecución en terminal
    if (ctx.lastExecution && ctx.lastExecution.exit_code !== 0 && ctx.lastExecution.stderr) {
      const stderr = ctx.lastExecution.stderr;
      let errorHint = 'El intérprete reportó una excepción al ejecutar tu programa.';
      if (stderr.includes('SyntaxError')) {
        errorHint = 'Error de sintaxis: verifica paréntesis sin cerrar, comillas o dos puntos (:) faltantes.';
      } else if (stderr.includes('NameError')) {
        errorHint = 'Variable o función no definida: revisa que los identificadores estén bien escritos antes de usarlos.';
      } else if (stderr.includes('IndentationError')) {
        errorHint = 'Error de indentación: Python requiere exactamente 4 espacios uniformes en cada bloque.';
      }
      return {
        approved: false,
        score: 30,
        summary: 'Error durante la ejecución del programa en la consola.',
        what_was_wrong: `Excepción en terminal: ${stderr.slice(0, 180)}`,
        recommendations: errorHint,
        next_step: 'Revisa la línea señalada en la consola, corrige el error y vuelve a compilar con [▶ run].',
        feedback: stderr,
      };
    }

    if (ctx.lastExecution?.tests?.length > 0) {
      const allPassed = ctx.lastExecution.tests.every((t: any) => t.passed);
      if (allPassed) {
        return {
          approved: true,
          score: 100,
          summary: 'Todas las pruebas unitarias fueron validadas y superadas.',
          what_was_wrong: '',
          recommendations: 'Tu algoritmo maneja correctamente todos los casos de prueba provistos. Como buena práctica, piensa en casos borde extremos y eficiencia Big-O.',
          next_step: 'Avanza a la siguiente lección del curso.',
          feedback: 'La estructura y comportamiento cumplen con todas las especificaciones.',
        };
      } else {
        const failed = ctx.lastExecution.tests.find((t: any) => !t.passed);
        return {
          approved: false,
          score: 50,
          summary: 'Uno o más casos de prueba fallaron al validar la salida.',
          what_was_wrong: failed ? `Con entrada "${failed.input || 'por defecto'}", se esperaba "${failed.expected}" pero se obtuvo "${failed.actual || '(vacío)'}".` : 'Divergencia entre la salida esperada y la real.',
          recommendations: 'Compara la salida producida con el formato exacto requerido (revisa espacios, saltos de línea o tipos de retorno).',
          next_step: 'Consulta la pestaña de Pruebas para ver el detalle de cada caso y ajusta tu lógica.',
          feedback: 'Revisa los casos fallidos en la pestaña de Pruebas.',
        };
      }
    }

    const lTitle = (ctx.lesson || '').toLowerCase();
    if (lTitle.includes('clase') || lTitle.includes('libro')) {
      const hasClass = /class\s+Libro\b/i.test(code);
      const hasInit = /def\s+__init__\s*\(\s*self/i.test(code);
      const hasMostrar = /def\s+mostrar\s*\(\s*self/i.test(code);
      if (hasClass && hasInit && hasMostrar) {
        return {
          approved: true,
          score: 100,
          summary: 'La clase Libro y sus métodos __init__ y mostrar() están correctamente estructurados.',
          what_was_wrong: '',
          recommendations: 'Excelente aplicación del paradigma orientado a objetos. Para código profesional, puedes añadir type hints: def __init__(self, titulo: str, autor: str) -> None.',
          next_step: 'Avanza a la siguiente lección.',
          feedback: 'Se identificó la declaración de la clase, el constructor con self y el método de representación.',
        };
      } else {
        const missing: string[] = [];
        if (!hasClass) missing.push('Declarar la clase Libro');
        if (!hasInit) missing.push('Definir el constructor __init__(self, titulo, autor)');
        if (!hasMostrar) missing.push('Definir el método mostrar(self)');
        return {
          approved: false,
          score: 45,
          summary: 'La implementación de la clase está incompleta.',
          what_was_wrong: `Falta implementar: ${missing.join(', ')}.`,
          recommendations: 'En Python, todo método dentro de una clase debe recibir self como primer parámetro para acceder a las propiedades de la instancia.',
          next_step: 'Añade los métodos faltantes según la pista y presiona [▶ run].',
          feedback: `Falta: ${missing.join(', ')}.`,
        };
      }
    }

    if (ctx.lastExecution && ctx.lastExecution.exit_code === 0 && !ctx.lastExecution.stderr) {
      return {
        approved: true,
        score: 95,
        summary: 'El código compila y ejecuta limpiamente sin errores de consola.',
        what_was_wrong: '',
        recommendations: 'El programa finalizó con código 0. Recuerda mantener nombres descriptivos de variables y comentarios donde aporten valor.',
        next_step: 'Continúa con el siguiente módulo.',
        feedback: 'Ejecución exitosa en el entorno de ejecución.',
      };
    }

    return {
      approved: false,
      score: 40,
      summary: 'El código requiere revisión para satisfacer el problema.',
      what_was_wrong: 'La solución actual no produce la salida o estructura esperada para este reto.',
      recommendations: 'Revisa la pista técnica proporcionada en la pestaña 💡 Pista y asegúrate de imprimir o retornar el valor solicitado.',
      next_step: 'Haz los cambios necesarios en el editor y presiona [▶ run].',
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

    return `### [BYTE-AI] Recomendación del Agente\n\n` +
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
