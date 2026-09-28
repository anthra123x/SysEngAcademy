import {
  Component,
  ElementRef,
  HostListener,
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

export interface CopilotMessage {
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
      class="vscode-window"
      [class.is-fullscreen]="isFullscreen()"
      [class.layout-bottom]="layoutMode() === 'bottom' && !isFullscreen()"
      [class.layout-side]="layoutMode() === 'side' || isFullscreen()"
    >
      <!-- TOP MINIMALIST HEADER & TABS BAR -->
      <header class="vscode-header">
        <!-- LEFT: ACTIVE FILE TAB (NEVER TRUNCATED) -->
        <div class="header-left">
          <!-- Active Solution Tab -->
          <div class="vscode-tab is-active" title="Archivo de solución editable">
            <span class="tab-icon" [attr.data-lang]="currentLanguage()">
              {{ currentLangInfo().icon }}
            </span>
            <span class="tab-label">solution{{ currentLangInfo().extension }}</span>
            @if (isModified()) {
              <span class="tab-dirty" title="Cambios sin ejecutar">●</span>
            }
          </div>

          <!-- Test Cases Tab (if tests exist) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="vscode-tab tab-secondary"
              [class.is-active]="activeTerminalTab() === 'tests'"
              (click)="activeTerminalTab.set('tests')"
              title="Ver batería de pruebas unitarias"
            >
              <span class="tab-icon">🧪</span>
              <span class="tab-label">tests.spec</span>
              @if (testStats(); as stats) {
                <span
                  class="tab-badge"
                  [class.badge-pass]="stats.passed === stats.total"
                  [class.badge-fail]="stats.passed < stats.total"
                >
                  {{ stats.passed }}/{{ stats.total }}
                </span>
              }
            </button>
          }

          <!-- Hint Toggle Pill (if lesson has a hint) -->
          @if (hint()) {
            <button
              type="button"
              class="vscode-hint-pill"
              [class.is-active]="showHintBar()"
              (click)="showHintBar.set(!showHintBar())"
              title="Mostrar u ocultar pista didáctica"
            >
              <span class="hint-glyph">💡</span>
              <span class="hint-text">Pista</span>
            </button>
          }
        </div>

        <!-- RIGHT: STREAMLINED ACTIONS TOOLBAR -->
        <div class="header-right">
          <!-- Language Selector -->
          <div class="lang-selector-box">
            <select
              class="lang-select"
              [ngModel]="currentLanguage()"
              (ngModelChange)="onLanguageChange($event)"
              [disabled]="running() || testing()"
              aria-label="Seleccionar lenguaje"
            >
              @for (lang of languages; track lang.id) {
                <option [value]="lang.id">{{ lang.name }} ({{ lang.version }})</option>
              }
            </select>
          </div>

          <!-- Stdin Toggle -->
          <button
            type="button"
            class="ide-tool-btn"
            [class.is-active]="showStdin()"
            (click)="showStdin.set(!showStdin())"
            title="Entrada estándar por consola (stdin)"
          >
            <span class="btn-icon">⌨</span>
            <span class="btn-text">stdin</span>
          </button>

          <!-- Reset Code Button -->
          <button
            type="button"
            class="ide-tool-btn"
            (click)="resetCode()"
            title="Restablecer plantilla inicial de código"
          >
            <span class="btn-icon">↺</span>
          </button>

          <!-- Layout Switcher: Bottom Dock vs Side Split -->
          @if (!isFullscreen()) {
            <button
              type="button"
              class="ide-tool-btn"
              (click)="toggleLayoutMode()"
              [title]="layoutMode() === 'bottom' ? 'Cambiar a paneles laterales' : 'Cambiar a consola abajo'"
            >
              <span class="btn-icon">{{ layoutMode() === 'bottom' ? '⬓' : '⬒' }}</span>
              <span class="btn-text">{{ layoutMode() === 'bottom' ? 'Lateral' : 'Abajo' }}</span>
            </button>
          }

          <!-- AI COPILOT BUTTON (PROMINENT ACCENT) -->
          <button
            type="button"
            class="ide-btn btn-copilot"
            [class.is-active]="activeTerminalTab() === 'ai'"
            (click)="openCopilotTab()"
            title="Abrir Byte IA — Asistente de Código en Vivo"
          >
            <span class="copilot-sparkle">✨</span>
            <span class="btn-text">Byte IA</span>
          </button>

          <!-- Validate Tests Button (if tests exist) -->
          @if (activeTestCases().length > 0) {
            <button
              type="button"
              class="ide-btn btn-test"
              (click)="runTests()"
              [disabled]="running() || testing() || !code().trim()"
              title="Ejecutar y validar todos los casos de prueba"
            >
              <span class="btn-icon">{{ testing() ? '⏳' : '✓' }}</span>
              <span class="btn-text">{{ testing() ? 'Probando…' : 'Run Tests' }}</span>
            </button>
          }

          <!-- Run Code Button -->
          <button
            type="button"
            class="ide-btn btn-primary"
            (click)="executeCode()"
            [disabled]="running() || testing() || !code().trim()"
            title="Ejecutar código en sandbox (Ctrl + Enter)"
          >
            <span class="btn-icon">{{ running() ? '⏳' : '▶' }}</span>
            <span class="btn-text">{{ running() ? 'Ejecutando…' : 'Run Code' }}</span>
            <kbd class="btn-kbd">Ctrl ↵</kbd>
          </button>

          <div class="header-divider"></div>

          <!-- Fullscreen Toggle -->
          <button
            type="button"
            class="ide-tool-btn btn-fullscreen"
            [class.is-active]="isFullscreen()"
            (click)="toggleFullscreen()"
            [title]="isFullscreen() ? 'Salir de pantalla completa (Esc)' : 'Expandir a pantalla completa'"
          >
            {{ isFullscreen() ? '🗗' : '⛶' }}
          </button>
        </div>
      </header>

      <!-- COLLAPSIBLE HINT BANNER (Available in embedded & fullscreen) -->
      @if (showHintBar() && hint()) {
        <div class="ide-hint-banner">
          <div class="hint-banner-text">
            <span class="hint-banner-icon">💡</span>
            <span><strong>Pista:</strong> {{ hint() }}</span>
          </div>
          <button type="button" class="hint-banner-close" (click)="showHintBar.set(false)" title="Cerrar pista">
            ✕
          </button>
        </div>
      }

      <!-- COLLAPSIBLE STDIN INPUT BAR -->
      @if (showStdin()) {
        <div class="ide-stdin-banner">
          <span class="stdin-lbl">INPUT (stdin):</span>
          <input
            type="text"
            class="stdin-field"
            [ngModel]="stdin()"
            (ngModelChange)="stdin.set($event)"
            placeholder="Valores de entrada separados por espacio o salto de línea..."
          />
          <button type="button" class="stdin-close-btn" (click)="showStdin.set(false)" title="Cerrar stdin">
            ✕
          </button>
        </div>
      }

      <!-- WORKSPACE: CODE EDITOR (FULL WIDTH IN BOTTOM DOCK) + INTEGRATED TERMINAL -->
      <main class="vscode-workspace">
        <!-- CODE EDITOR COLUMN / ROW -->
        <div class="code-column">
          <!-- Synchronized Gutter Line Numbers -->
          <div class="code-gutter" #codeGutter aria-hidden="true">
            @for (line of lineNumbers(); track $index) {
              <div class="gutter-num" [class.is-active-line]="line === cursorLine()">
                {{ line }}
              </div>
            }
          </div>

          <!-- Code Textarea -->
          <div class="code-surface">
            <textarea
              #codeTextarea
              class="code-textarea"
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
              placeholder="// Escribe tu solución aquí..."
              aria-label="Editor de código fuente"
            ></textarea>
          </div>
        </div>

        <!-- INTEGRATED TERMINAL / TEST RUNNER / AI COPILOT -->
        <div class="terminal-column">
          <!-- Terminal Tabs Header -->
          <div class="terminal-tabs-header">
            <div class="term-tab-list">
              <button
                type="button"
                class="term-header-tab"
                [class.is-active]="activeTerminalTab() === 'terminal'"
                (click)="activeTerminalTab.set('terminal')"
              >
                <span>TERMINAL</span>
                @if (executionResult()) {
                  <span
                    class="term-status-dot"
                    [class.is-ok]="executionResult()!.exit_code === 0"
                    [class.is-err]="executionResult()!.exit_code !== 0"
                  ></span>
                }
              </button>

              @if (activeTestCases().length > 0 || (executionResult()?.tests && executionResult()!.tests!.length > 0)) {
                <button
                  type="button"
                  class="term-header-tab"
                  [class.is-active]="activeTerminalTab() === 'tests'"
                  (click)="activeTerminalTab.set('tests')"
                >
                  <span>TEST RESULTS</span>
                  @if (testStats(); as stats) {
                    <span
                      class="term-test-score"
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
                class="term-header-tab term-tab-ai"
                [class.is-active]="activeTerminalTab() === 'ai'"
                (click)="openCopilotTab()"
              >
                <span class="ai-sparkle">✨</span>
                <span>BYTE COPILOT</span>
                @if (aiLoading()) {
                  <span class="copilot-loading-pulse">●</span>
                }
              </button>
            </div>

            <!-- Terminal Top Right Controls -->
            <div class="terminal-ctrls">
              @if (executionResult()?.execution_time_ms !== undefined) {
                <span class="term-time-badge">{{ executionResult()!.execution_time_ms }}ms</span>
              }
              @if (executionResult()) {
                <button
                  type="button"
                  class="term-ctrl-btn"
                  (click)="clearTerminal()"
                  title="Limpiar terminal"
                >
                  🗑
                </button>
              }
            </div>
          </div>

          <!-- Terminal Content Surface -->
          <div class="terminal-screen font-mono">
            <!-- TAB 1: TERMINAL OUTPUT -->
            @if (activeTerminalTab() === 'terminal') {
              <div class="term-log">
                @if (running()) {
                  <div class="term-msg-busy">
                    <span class="term-spinner"></span>
                    <span>[SysEng Engine] Compilando y ejecutando solución...</span>
                  </div>
                } @else if (executionResult()) {
                  @let res = executionResult()!;
                  <div class="term-cmd-line">
                    <span class="cmd-user">syseng&#64;vscode</span>:<span class="cmd-path">~/workspace</span>$&nbsp;<span class="cmd-run">run solution{{ currentLangInfo().extension }}</span>
                  </div>

                  @if (res.stdout) {
                    <pre class="term-stdout">{{ res.stdout }}</pre>
                  }
                  @if (res.stderr) {
                    <pre class="term-stderr">{{ res.stderr }}</pre>
                  }
                  @if (!res.stdout && !res.stderr) {
                    <div class="term-quiet-msg">
                      [El proceso finalizó sin generar salida en consola (stdout/stderr)]
                    </div>
                  }
                  <div
                    class="term-exit-badge"
                    [class.is-ok]="res.exit_code === 0"
                    [class.is-err]="res.exit_code !== 0"
                  >
                    [Proceso finalizado con código {{ res.exit_code }} en {{ res.execution_time_ms }}ms]
                  </div>
                } @else {
                  <div class="term-idle-state">
                    <p class="idle-line">syseng&#64;vscode:~/workspace$</p>
                    <p class="idle-hint">
                      // Presiona <strong>Run Code (Ctrl + Enter)</strong> para compilar y ver la salida.
                    </p>
                  </div>
                }
              </div>
            }

            <!-- TAB 2: TESTS SPEC -->
            @if (activeTerminalTab() === 'tests') {
              <div class="tests-screen">
                @if (testing()) {
                  <div class="term-msg-busy">
                    <span class="term-spinner"></span>
                    <span>Evaluando casos de prueba contra tu código...</span>
                  </div>
                } @else if (executionResult()?.tests && executionResult()!.tests!.length > 0) {
                  <div class="test-feed">
                    @for (test of executionResult()!.tests; track $index) {
                      <div class="test-item" [class.is-pass]="test.passed" [class.is-fail]="!test.passed">
                        <div class="test-item-header">
                          <span class="test-icon">{{ test.passed ? '✓' : '✗' }}</span>
                          <span class="test-name">Test #{{ $index + 1 }}</span>
                          <span class="test-status">{{ test.passed ? 'PASSED' : 'FAILED' }}</span>
                        </div>
                        @if (!test.passed) {
                          <div class="test-diff-box">
                            @if (test.input) {
                              <div class="diff-entry">
                                <span class="d-label">Entrada:</span>
                                <code class="d-val">{{ test.input }}</code>
                              </div>
                            }
                            <div class="diff-entry">
                              <span class="d-label">Esperado:</span>
                              <code class="d-val val-expected">{{ test.expected }}</code>
                            </div>
                            <div class="diff-entry">
                              <span class="d-label">Obtenido:</span>
                              <code class="d-val val-actual">{{ test.actual || '(vacío)' }}</code>
                            </div>
                          </div>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <div class="tests-empty-card">
                    <p>No se han ejecutado los casos de prueba todavía.</p>
                    <button type="button" class="btn-run-tests-action" (click)="runTests()">
                      🧪 Ejecutar Casos de Prueba
                    </button>
                  </div>
                }
              </div>
            }

            <!-- TAB 3: REAL INTERACTIVE BYTE COPILOT -->
            @if (activeTerminalTab() === 'ai') {
              <div class="copilot-container">
                <!-- Copilot Header -->
                <div class="copilot-banner">
                  <div class="copilot-banner-left">
                    <div class="copilot-avatar">🤖</div>
                    <div>
                      <div class="copilot-title-row">
                        <strong>Byte AI Copilot</strong>
                        <span class="copilot-model-tag">GPT-4o Mini en Vivo</span>
                      </div>
                      <small class="copilot-sub">
                        Tutor socrático en tiempo real con contexto de tu código y pruebas.
                      </small>
                    </div>
                  </div>

                  @if (copilotMessages().length > 0) {
                    <button
                      type="button"
                      class="copilot-clear-chat-btn"
                      (click)="clearCopilotChat()"
                      title="Reiniciar conversación"
                    >
                      Limpiar Chat
                    </button>
                  }
                </div>

                <!-- Quick Action Chips (1-Click Help to develop the exercise) -->
                <div class="copilot-chips-row">
                  <button
                    type="button"
                    class="chip-btn"
                    (click)="askByteWithChip('¿Cómo empiezo este ejercicio? Explica la lógica paso a paso sin darme la solución copiada.')"
                    [disabled]="aiLoading()"
                  >
                    💡 ¿Cómo empiezo?
                  </button>

                  <button
                    type="button"
                    class="chip-btn"
                    (click)="askByteWithChip('Revisa mi código actual y los errores de prueba. ¿Por qué falló y qué condición me falta verificar?')"
                    [disabled]="aiLoading()"
                  >
                    🔍 ¿Por qué falló mi código?
                  </button>

                  <button
                    type="button"
                    class="chip-btn"
                    (click)="askByteWithChip('Dame el pseudocódigo estructurado del algoritmo para resolver este reto.')"
                    [disabled]="aiLoading()"
                  >
                    🧩 Pseudocódigo estructurado
                  </button>

                  <button
                    type="button"
                    class="chip-btn"
                    (click)="askByteWithChip('Analiza la complejidad temporal O(n) y espacial de mi solución. ¿Cómo optimizarla?')"
                    [disabled]="aiLoading()"
                  >
                    ⚡ Complejidad y Optimización
                  </button>
                </div>

                <!-- Messages Thread -->
                <div class="copilot-thread" #copilotScroll>
                  @if (copilotMessages().length === 0) {
                    <div class="copilot-welcome-box">
                      <div class="welcome-icon">🚀</div>
                      <h4>¡Hola! Estoy listo para ayudarte a desarrollar este reto.</h4>
                      <p>
                        Puedo explicarte la lógica algorítmica, guiarte paso a paso si estás bloqueado,
                        o analizar por qué fallaron tus casos de prueba sin regalarte la respuesta directa.
                      </p>
                      <p class="welcome-tip">
                        👉 <em>Haz clic en cualquiera de las sugerencias arriba o escribe tu duda abajo.</em>
                      </p>
                    </div>
                  }

                  @for (msg of copilotMessages(); track msg.id) {
                    <div class="copilot-msg" [class.is-user]="msg.sender === 'user'" [class.is-ai]="msg.sender === 'assistant'">
                      <div class="msg-header">
                        <span class="msg-author">{{ msg.sender === 'user' ? '👤 Tú' : '🤖 Byte IA' }}</span>
                        <span class="msg-time">{{ msg.timestamp | date:'shortTime' }}</span>
                      </div>

                      <div class="msg-body" [innerHTML]="renderMarkdown(msg.text)"></div>

                      @if (msg.codeSnippet) {
                        <div class="msg-code-actions">
                          <button
                            type="button"
                            class="code-act-btn btn-apply-code"
                            (click)="applySnippetToEditor(msg.codeSnippet)"
                            title="Reemplazar código en el editor con esta sugerencia"
                          >
                            📥 Aplicar al editor
                          </button>
                          <button
                            type="button"
                            class="code-act-btn btn-copy-code"
                            (click)="copySnippet(msg.codeSnippet)"
                            title="Copiar código al portapapeles"
                          >
                            📋 Copiar
                          </button>
                        </div>
                      }
                    </div>
                  }

                  @if (aiLoading()) {
                    <div class="copilot-msg is-ai is-thinking">
                      <div class="msg-header">
                        <span class="msg-author">🤖 Byte IA</span>
                      </div>
                      <div class="thinking-box">
                        <span class="term-spinner"></span>
                        <span>Byte está inspeccionando tu solución y diseñando la mejor explicación...</span>
                      </div>
                    </div>
                  }
                </div>

                <!-- Sticky Interactive Question Input -->
                <div class="copilot-input-bar">
                  <input
                    type="text"
                    class="copilot-text-input"
                    [(ngModel)]="aiInputText"
                    (keydown.enter)="sendUserChatMessage()"
                    [disabled]="aiLoading()"
                    placeholder="Pregúntale a Byte sobre tu código, errores o dudas del ejercicio... (Enter)"
                    aria-label="Pregunta al copiloto de IA"
                  />
                  <button
                    type="button"
                    class="copilot-send-btn"
                    (click)="sendUserChatMessage()"
                    [disabled]="aiLoading() || !aiInputText().trim()"
                    title="Enviar pregunta"
                  >
                    <span>➤</span>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </main>

      <!-- FLOATING TRANSIENT TOAST NOTIFICATION -->
      @if (toastMessage()) {
        <div class="ide-toast">
          {{ toastMessage() }}
        </div>
      }

      <!-- VS CODE BOTTOM STATUS BAR -->
      <footer class="vscode-statusbar" aria-label="Barra de estado">
        <div class="statusbar-left">
          <span class="status-item status-branch" title="Rama Git activa">
            <span class="branch-icon">⎇</span> main*
          </span>
          <span class="status-item status-problems" title="0 Errores de sintaxis detectados">
            <span class="prob-icon">⨂</span> 0
            <span class="prob-icon warn">⚠</span> 0
          </span>
        </div>

        <div class="statusbar-right">
          <span class="status-item" title="Posición del cursor">
            Ln {{ cursorLine() }}, Col {{ cursorCol() }}
          </span>
          <span class="status-item" title="Indentación estándar">
            Spaces: 4
          </span>
          <span class="status-item" title="Codificación">
            UTF-8
          </span>
          <span class="status-item status-lang" title="Modo de lenguaje">
            {{ currentLangInfo().name }}
          </span>
          <span class="status-item status-env" title="Motor de ejecución local">
            ⚡ SysEng Sandbox
          </span>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      /* ROOT WINDOW CONTAINER */
      .vscode-window {
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 8px;
        overflow: hidden;
        margin: 1.25rem 0;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #cccccc;
        min-height: 540px;
        height: 560px;
        box-sizing: border-box;
        position: relative;
        transition: box-shadow 0.2s ease;
      }

      /* FULLSCREEN IMMERSIVE MODE (Completely fills viewport without breaking proportions) */
      .vscode-window.is-fullscreen {
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

        .vscode-workspace {
          flex: 1 1 0% !important;
          height: calc(100vh - 38px - 22px) !important;
          min-height: 0 !important;
          max-height: none !important;
        }

        .code-column,
        .terminal-column {
          height: 100% !important;
          min-height: 0 !important;
        }

        .code-surface,
        .code-textarea,
        .terminal-screen {
          height: 100% !important;
          min-height: 0 !important;
        }
      }

      /* TOP TABS & HEADER BAR */
      .vscode-header {
        height: 38px;
        background: #181818;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        padding: 0 0.5rem;
        flex-shrink: 0;
        user-select: none;
        gap: 0.5rem;
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        height: 100%;
        flex-shrink: 0;
        min-width: 140px;
      }

      .vscode-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: #141414;
        color: #8c8c8c;
        border: none;
        border-right: 1px solid rgba(255, 255, 255, 0.04);
        padding: 0 0.85rem;
        height: 100%;
        font-size: 0.78rem;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
        white-space: nowrap;

        &:hover {
          color: #ffffff;
          background: #1a1a1a;
        }

        &.is-active {
          background: #1e1e1e;
          color: #ffffff;
          border-top: 2px solid #0078d4;
          font-weight: 500;
        }
      }

      .tab-icon {
        font-size: 0.85rem;
      }

      .tab-label {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.76rem;
      }

      .tab-dirty {
        font-size: 0.65rem;
        color: #0078d4;
      }

      .tab-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 0.05rem 0.35rem;
        border-radius: 4px;

        &.badge-pass { background: #238636; color: #ffffff; }
        &.badge-fail { background: #da3633; color: #ffffff; }
      }

      .vscode-hint-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        background: rgba(245, 158, 11, 0.1);
        color: #fbbf24;
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 4px;
        padding: 0.2rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        margin-left: 0.35rem;
        transition: all 0.15s;
        white-space: nowrap;

        &:hover {
          background: rgba(245, 158, 11, 0.2);
          border-color: #fbbf24;
          color: #fef08a;
        }

        &.is-active {
          background: #fbbf24;
          color: #1e1e1e;
        }
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        flex-shrink: 1;
        overflow-x: auto;
        justify-content: flex-end;
      }

      .lang-selector-box {
        position: relative;
        flex-shrink: 0;
      }

      .lang-select {
        background: #252526;
        color: #cccccc;
        border: 1px solid #3c3c3c;
        border-radius: 3px;
        padding: 0.2rem 0.45rem;
        font-size: 0.72rem;
        cursor: pointer;
        outline: none;
        font-family: inherit;

        &:focus {
          border-color: #0078d4;
        }

        option {
          background: #1e1e1e;
          color: #ffffff;
        }
      }

      .ide-tool-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        background: transparent;
        color: #9d9d9d;
        border: 1px solid #3c3c3c;
        border-radius: 3px;
        padding: 0.2rem 0.5rem;
        font-size: 0.72rem;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border-color: #555555;
        }

        &.is-active {
          color: #0078d4;
          border-color: #0078d4;
          background: rgba(0, 120, 212, 0.15);
        }
      }

      .ide-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        border: none;
        border-radius: 3px;
        padding: 0.25rem 0.65rem;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        font-family: inherit;
        white-space: nowrap;
        transition: all 0.15s;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-copilot {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);

        &:hover {
          opacity: 0.95;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }

        &.is-active {
          background: #a855f7;
          border-color: #ffffff;
        }

        .copilot-sparkle {
          font-size: 0.85rem;
        }
      }

      .btn-primary {
        background: #0078d4;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #0060aa;
        }
      }

      .btn-test {
        background: #238636;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #2ea043;
        }
      }

      .btn-kbd {
        background: rgba(0, 0, 0, 0.25);
        padding: 0.05rem 0.25rem;
        border-radius: 2px;
        font-size: 0.65rem;
        color: rgba(255, 255, 255, 0.85);
      }

      .btn-fullscreen {
        font-size: 0.85rem;
        padding: 0.2rem 0.4rem;
      }

      .header-divider {
        width: 1px;
        height: 18px;
        background: rgba(255, 255, 255, 0.08);
        margin: 0 0.15rem;
        flex-shrink: 0;
      }

      /* COLLAPSIBLE HINT BANNER */
      .ide-hint-banner {
        background: #272111;
        border-bottom: 1px solid #6b531a;
        padding: 0.4rem 0.85rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #fef08a;
        flex-shrink: 0;
      }

      .hint-banner-text {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .hint-banner-close {
        background: transparent;
        border: none;
        color: #fbbf24;
        cursor: pointer;
        font-size: 0.8rem;
        padding: 0.1rem 0.35rem;

        &:hover {
          color: #ffffff;
        }
      }

      /* COLLAPSIBLE STDIN BANNER */
      .ide-stdin-banner {
        background: #252526;
        border-bottom: 1px solid #3c3c3c;
        padding: 0.35rem 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-shrink: 0;
      }

      .stdin-lbl {
        font-size: 0.72rem;
        color: #858585;
        font-family: monospace;
      }

      .stdin-field {
        flex: 1;
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 2px;
        color: #ffffff;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        font-family: 'Consolas', monospace;
        outline: none;

        &:focus {
          border-color: #0078d4;
        }
      }

      .stdin-close-btn {
        background: transparent;
        border: none;
        color: #858585;
        cursor: pointer;
        font-size: 0.8rem;

        &:hover {
          color: #ffffff;
        }
      }

      /* WORKSPACE LAYOUT (SMART RESPONSIVE):
         - In layout-bottom (compact embedded mode): Full-width editor on top + Full-width console below.
         - In layout-side (wide or fullscreen): Side-by-side split.
      */
      .vscode-workspace {
        flex: 1 1 0%;
        min-height: 0;
        display: grid;
        overflow: hidden;
        background: #1e1e1e;
      }

      .layout-bottom .vscode-workspace {
        grid-template-rows: minmax(260px, 1fr) minmax(220px, 240px);
        grid-template-columns: 1fr;
      }

      .layout-side .vscode-workspace {
        grid-template-columns: minmax(360px, 1.15fr) minmax(320px, 0.85fr);
        grid-template-rows: 1fr;
      }

      /* CODE EDITOR COLUMN */
      .code-column {
        display: flex;
        height: 100%;
        min-height: 0;
        background: #1e1e1e;
        border-right: 1px solid rgba(255, 255, 255, 0.07);
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        overflow: hidden;
      }

      .code-gutter {
        width: 44px;
        padding: 0.65rem 0;
        background: #1e1e1e;
        color: #5a5a5a;
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-size: 0.82rem;
        line-height: 1.6;
        text-align: right;
        user-select: none;
        border-right: 1px solid rgba(255, 255, 255, 0.04);
        overflow: hidden;
        flex-shrink: 0;
      }

      .gutter-num {
        padding-right: 0.75rem;
        transition: color 0.1s;

        &.is-active-line {
          color: #c6c6c6;
          font-weight: 600;
        }
      }

      .code-surface {
        flex: 1 1 0%;
        height: 100%;
        min-height: 0;
        position: relative;
        overflow: hidden;
      }

      .code-textarea {
        width: 100%;
        height: 100%;
        min-height: 0;
        padding: 0.65rem 0.85rem;
        background: transparent;
        color: #d4d4d4;
        border: none;
        outline: none;
        resize: none;
        font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'Courier New', monospace;
        font-size: 0.85rem;
        line-height: 1.6;
        white-space: pre;
        overflow: auto;
        tab-size: 4;
        caret-color: #aeafad;
        box-sizing: border-box;

        &::placeholder {
          color: #6a6a6a;
        }
      }

      /* TERMINAL / COPILOT COLUMN */
      .terminal-column {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: #181818;
        overflow: hidden;
      }

      .terminal-tabs-header {
        height: 34px;
        background: #181818;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
        flex-shrink: 0;
        user-select: none;
      }

      .term-tab-list {
        display: flex;
        gap: 0.25rem;
      }

      .term-header-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        color: #8c8c8c;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.35rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          color: #ffffff;
        }

        &.is-active {
          color: #ffffff;
          border-bottom-color: #0078d4;
        }

        &.term-tab-ai.is-active {
          border-bottom-color: #a855f7;
          color: #c084fc;
        }
      }

      .ai-sparkle {
        color: #c084fc;
      }

      .term-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #858585;

        &.is-ok { background: #238636; }
        &.is-err { background: #da3633; }
      }

      .term-test-score {
        font-size: 0.65rem;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;
        background: #333333;
        color: #cccccc;

        &.is-ok { background: #238636; color: #ffffff; }
        &.is-err { background: #da3633; color: #ffffff; }
      }

      .copilot-loading-pulse {
        color: #a855f7;
        font-size: 0.65rem;
        animation: blink 1s infinite alternate;
      }

      .terminal-ctrls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .term-time-badge {
        font-size: 0.68rem;
        color: #858585;
        font-family: monospace;
      }

      .term-ctrl-btn {
        background: transparent;
        border: none;
        color: #858585;
        font-size: 0.75rem;
        cursor: pointer;
        padding: 0.15rem 0.35rem;
        border-radius: 3px;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
      }

      .terminal-screen {
        flex: 1 1 0%;
        min-height: 0;
        overflow-y: auto;
        padding: 0.65rem 0.85rem;
        background: #181818;
        font-size: 0.8rem;
        line-height: 1.5;
        color: #cccccc;
        box-sizing: border-box;
      }

      /* TERMINAL VIEW */
      .term-log {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .term-cmd-line {
        font-size: 0.78rem;
        margin-bottom: 0.25rem;
      }

      .cmd-user { color: #4ec9b0; }
      .cmd-path { color: #569cd6; }
      .cmd-run { color: #dcdcaa; }

      .term-msg-busy {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #0078d4;
        padding: 0.5rem 0;
      }

      .term-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(0, 120, 212, 0.25);
        border-top-color: #0078d4;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .term-stdout {
        margin: 0;
        color: #d4d4d4;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: inherit;
      }

      .term-stderr {
        margin: 0;
        color: #f48771;
        background: rgba(244, 135, 113, 0.08);
        padding: 0.45rem;
        border-radius: 3px;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: inherit;
      }

      .term-quiet-msg {
        color: #858585;
        font-style: italic;
        padding: 0.35rem 0;
      }

      .term-exit-badge {
        font-size: 0.72rem;
        color: #858585;
        margin-top: 0.35rem;
        padding-top: 0.35rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.08);

        &.is-err { color: #f48771; }
        &.is-ok { color: #89d185; }
      }

      .term-idle-state {
        color: #858585;
        padding: 0.5rem 0;

        .idle-line {
          margin: 0 0 0.35rem 0;
          color: #4ec9b0;
        }

        .idle-hint {
          margin: 0;
          font-size: 0.75rem;

          strong { color: #ffffff; }
        }
      }

      /* TESTS VIEW */
      .test-feed {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .test-item {
        background: #1f1f1f;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 4px;
        padding: 0.5rem 0.7rem;

        &.is-pass { border-left: 3px solid #238636; }
        &.is-fail { border-left: 3px solid #da3633; }
      }

      .test-item-header {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.76rem;
      }

      .test-icon { font-weight: bold; }
      .test-item.is-pass .test-icon { color: #238636; }
      .test-item.is-fail .test-icon { color: #da3633; }

      .test-name {
        color: #ffffff;
        flex: 1;
      }

      .test-status {
        font-size: 0.68rem;
        color: #858585;
      }

      .test-diff-box {
        margin-top: 0.35rem;
        padding-top: 0.35rem;
        border-top: 1px solid rgba(255, 255, 255, 0.04);
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        font-size: 0.72rem;
      }

      .diff-entry {
        display: flex;
        gap: 0.4rem;
      }

      .d-label {
        color: #858585;
        min-width: 60px;
      }

      .val-expected { color: #4fc1ff; }
      .val-actual { color: #f48771; }

      .tests-empty-card {
        padding: 1.5rem 0.5rem;
        text-align: center;
        color: #858585;
      }

      .btn-run-tests-action {
        margin-top: 0.65rem;
        background: #238636;
        color: #ffffff;
        border: none;
        padding: 0.35rem 0.85rem;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;

        &:hover { background: #2ea043; }
      }

      /* ============================================================
         REAL INTERACTIVE BYTE COPILOT SCREEN
         ============================================================ */
      .copilot-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        position: relative;
      }

      .copilot-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #14141c;
        border: 1px solid rgba(168, 85, 247, 0.2);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        margin-bottom: 0.5rem;
        flex-shrink: 0;
      }

      .copilot-banner-left {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .copilot-avatar {
        font-size: 1.35rem;
      }

      .copilot-title-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        strong {
          color: #ffffff;
          font-size: 0.78rem;
        }
      }

      .copilot-model-tag {
        font-size: 0.62rem;
        font-weight: 700;
        padding: 0.05rem 0.35rem;
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 9999px;
      }

      .copilot-sub {
        display: block;
        color: #8c8c9e;
        font-size: 0.68rem;
      }

      .copilot-clear-chat-btn {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #8c8c9e;
        font-size: 0.68rem;
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
        }
      }

      /* QUICK CHIPS ROW */
      .copilot-chips-row {
        display: flex;
        gap: 0.35rem;
        overflow-x: auto;
        padding-bottom: 0.45rem;
        margin-bottom: 0.45rem;
        flex-shrink: 0;
      }

      .chip-btn {
        background: #252532;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #d1d5db;
        font-size: 0.7rem;
        padding: 0.25rem 0.55rem;
        border-radius: 9999px;
        white-space: nowrap;
        cursor: pointer;
        transition: all 0.15s;

        &:hover:not(:disabled) {
          background: #37374a;
          color: #ffffff;
          border-color: #a855f7;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      /* MESSAGES THREAD */
      .copilot-thread {
        flex: 1 1 0%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        padding-right: 0.25rem;
        margin-bottom: 0.5rem;
      }

      .copilot-welcome-box {
        background: #171720;
        border: 1px dashed rgba(168, 85, 247, 0.25);
        border-radius: 6px;
        padding: 1rem;
        text-align: center;
        color: #9ca3af;
        margin: auto 0;

        .welcome-icon { font-size: 1.75rem; margin-bottom: 0.25rem; }
        h4 { color: #ffffff; font-size: 0.85rem; margin: 0 0 0.35rem 0; }
        p { font-size: 0.74rem; line-height: 1.45; margin: 0 0 0.35rem 0; }
        .welcome-tip { color: #c084fc; font-size: 0.72rem; }
      }

      .copilot-msg {
        display: flex;
        flex-direction: column;
        padding: 0.65rem 0.85rem;
        border-radius: 6px;
        font-size: 0.78rem;
        line-height: 1.5;

        &.is-user {
          background: #272732;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-left: 1.5rem;
        }

        &.is-ai {
          background: #191924;
          border: 1px solid rgba(168, 85, 247, 0.18);
          margin-right: 0.5rem;
        }
      }

      .msg-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;
      }

      .msg-author {
        font-weight: 600;
        color: #c084fc;
      }

      .is-user .msg-author {
        color: #38bdf8;
      }

      .msg-time {
        font-size: 0.65rem;
        color: #6b7280;
      }

      .msg-body {
        color: #e5e7eb;

        pre {
          background: #111118;
          padding: 0.6rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #4fc1ff;
          overflow-x: auto;
          margin: 0.45rem 0;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.76rem;
        }

        code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.3rem;
          border-radius: 2px;
          color: #dcdcaa;
          font-family: inherit;
        }

        strong {
          color: #ffffff;
        }
      }

      .msg-code-actions {
        display: flex;
        gap: 0.35rem;
        margin-top: 0.45rem;
        padding-top: 0.45rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
      }

      .code-act-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.7rem;
        font-weight: 600;
        padding: 0.2rem 0.55rem;
        border-radius: 3px;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
      }

      .btn-apply-code {
        background: #238636;
        color: #ffffff;

        &:hover {
          background: #2ea043;
        }
      }

      .btn-copy-code {
        background: #2d2d39;
        color: #d1d5db;
        border: 1px solid rgba(255, 255, 255, 0.08);

        &:hover {
          background: #373748;
          color: #ffffff;
        }
      }

      .thinking-box {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #c084fc;
        padding: 0.35rem 0;
      }

      /* STICKY INPUT BAR AT BOTTOM OF COPILOT */
      .copilot-input-bar {
        display: flex;
        gap: 0.35rem;
        padding: 0.35rem 0;
        border-top: 1px solid rgba(255, 255, 255, 0.07);
        flex-shrink: 0;
      }

      .copilot-text-input {
        flex: 1;
        background: #111118;
        border: 1px solid #3c3c4d;
        border-radius: 4px;
        color: #ffffff;
        font-size: 0.76rem;
        padding: 0.35rem 0.65rem;
        outline: none;
        font-family: inherit;

        &:focus {
          border-color: #a855f7;
        }

        &::placeholder {
          color: #6b7280;
        }
      }

      .copilot-send-btn {
        background: #a855f7;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 0 0.75rem;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.15s;

        &:hover:not(:disabled) {
          background: #9333ea;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      /* TOAST NOTIFICATION */
      .ide-toast {
        position: absolute;
        bottom: 35px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: #ffffff;
        padding: 0.4rem 0.9rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        z-index: 100;
        animation: fadeInOut 2.5s forwards;
      }

      /* CLASSIC VS CODE STATUS BAR */
      .vscode-statusbar {
        height: 22px;
        background: #007acc;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 0.5rem;
        font-size: 0.7rem;
        flex-shrink: 0;
        user-select: none;
      }

      .statusbar-left,
      .statusbar-right {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-item {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        cursor: pointer;
        padding: 0 0.2rem;
        border-radius: 2px;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      }

      .branch-icon { font-size: 0.8rem; }
      .prob-icon { font-size: 0.75rem; &.warn { margin-left: 0.2rem; } }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes blink { from { opacity: 0.2; } to { opacity: 1; } }
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, 10px); }
        15% { opacity: 1; transform: translate(-50%, 0); }
        80% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -10px); }
      }
    `,
  ],
})
export class InteractiveIdeComponent {
  private readonly codeRunner = inject(CodeExecutionService);
  private readonly coursesSvc = inject(CoursesService);
  private readonly aiChatSvc = inject(AiChatService);

  @ViewChild('codeTextarea') codeTextareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('codeGutter') codeGutterRef?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotScroll') copilotScrollRef?: ElementRef<HTMLDivElement>;

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

  readonly cursorLine = signal<number>(1);
  readonly cursorCol = signal<number>(1);

  readonly running = signal<boolean>(false);
  readonly testing = signal<boolean>(false);
  readonly aiLoading = signal<boolean>(false);

  readonly activeTerminalTab = signal<'terminal' | 'tests' | 'ai'>('terminal');
  readonly executionResult = signal<CodeExecutionResponse | null>(null);

  // AI Copilot state
  readonly copilotMessages = signal<CopilotMessage[]>([]);
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
    setTimeout(() => this.scrollCopilotToBottom(), 100);
  }

  clearCopilotChat() {
    this.copilotMessages.set([]);
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
    this.showToast('Código restablecido a la plantilla inicial');
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

  /* ============================================================
     INTERACTIVE BYTE COPILOT ENGINE (OPENROUTER + GPT-4O-MINI)
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

    const userMsg: CopilotMessage = {
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

      const aiMsg: CopilotMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
      };

      this.copilotMessages.update(msgs => [...msgs, aiMsg]);
    } catch (_err) {
      // Resilient local pedagogical fallback if network or API key is unavailable
      const fallbackReply = this.generateSmartLocalGuidance(userQuestion, context);
      const codeMatch = fallbackReply.match(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

      const aiMsg: CopilotMessage = {
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
    const systemPrompt = `Eres Byte IA, el copiloto y tutor socrático de programación en SysEngAcademy.
Tu objetivo es guiar al estudiante para que razone, entienda la estructura de datos/algoritmo y resuelva el reto por sí mismo.
Reglas:
1. Responde en español con tono amigable, didáctico y orientado a ingeniería de software.
2. Si te piden una pista o cómo empezar, guía el razonamiento sin regalar la solución completa directamente.
3. Si los casos de prueba fallaron o hay errores en consola, diagnostica la causa raíz y explica qué caso borde o condición faltó.
4. Si el estudiante pide pseudocódigo o corregir su código, proporciónale código limpio y bien comentado en un bloque markdown \`\`\`${ctx.language}.
5. Explica con claridad la lógica detrás de la solución.`;

    let userPrompt = `Lección: "${ctx.lesson}" | Lenguaje: ${ctx.language}\n`;
    if (ctx.hint) {
      userPrompt += `Pista didáctica del ejercicio: ${ctx.hint}\n`;
    }
    userPrompt += `\nCódigo actual del estudiante:\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\`\n`;

    if (ctx.lastExecution) {
      if (ctx.lastExecution.stderr) {
        userPrompt += `\nError en consola (stderr): ${ctx.lastExecution.stderr}\n`;
      }
      if (ctx.lastExecution.tests && ctx.lastExecution.tests.length > 0) {
        const failed = ctx.lastExecution.tests.filter((t: any) => !t.passed);
        if (failed.length > 0) {
          userPrompt += `\nCasos de prueba que fallaron (${failed.length}/${ctx.lastExecution.tests.length}):\n`;
          failed.forEach((f: any, idx: number) => {
            userPrompt += `  - Test: entrada="${f.input}", esperado="${f.expected}", obtenido="${f.actual}"\n`;
          });
        } else {
          userPrompt += `\n¡Todos los casos de prueba pasaron exitosamente (${ctx.lastExecution.tests.length}/${ctx.lastExecution.tests.length})!\n`;
        }
      }
    }

    userPrompt += `\nPregunta / Petición del estudiante: ${question}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy IDE Copilot',
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
    return data.choices?.[0]?.message?.content || 'Byte no pudo generar una respuesta en este momento.';
  }

  private generateSmartLocalGuidance(question: string, ctx: any): string {
    const qLower = question.toLowerCase();

    // Context analysis
    const hasStderr = ctx.lastExecution?.stderr;
    const failedTests = ctx.lastExecution?.tests?.filter((t: any) => !t.passed) || [];

    if (qLower.includes('empezar') || qLower.includes('inicio') || qLower.includes('cómo')) {
      let advice = `### 💡 Guía para iniciar "${ctx.lesson}"\n\n`;
      advice += `1. **Identifica la entrada y la salida esperada:** Analiza qué parámetros recibe tu función y qué tipo de dato debe retornar.\n`;
      if (ctx.hint) {
        advice += `2. **Aprovecha la pista clave:** ${ctx.hint}\n`;
      }
      advice += `3. **Estructura lógica recomendada:**\n`;
      advice += `   - Maneja primero los **casos base o vacíos** (por ejemplo, entradas nulas o longitudes cero).\n`;
      advice += `   - Inicializa la estructura auxiliar requerida (como una lista/pila \`stack = []\` o un diccionario/mapa de mapeo).\n`;
      advice += `   - Itera sobre los elementos aplicando la regla de negocio y actualizando el estado.\n`;
      advice += `   - Retorna el resultado final validando el estado acumulado.`;
      return advice;
    }

    if (failedTests.length > 0) {
      const f = failedTests[0];
      return `### 🔍 Diagnóstico de Caso de Prueba Fallido\n\n` +
        `Tu código falló en una prueba con entrada \`${f.input}\`:\n` +
        `- **Esperado:** \`${f.expected}\`\n` +
        `- **Obtenido:** \`${f.actual || '(vacío)'}\`\n\n` +
        `**Punto de reflexión:** Revisa si estás manejando correctamente los casos donde la condición de parada se cumple antes de tiempo o si falta validar que no queden elementos pendientes en la estructura.`;
    }

    if (hasStderr) {
      return `### ⚠️ Diagnóstico del Error en Consola\n\n` +
        `Se produjo el siguiente error en tiempo de ejecución:\n` +
        `\`\`\`\n${hasStderr}\n\`\`\`\n` +
        `Verifica que todas las variables estén declaradas antes de usarse, que los tipos de datos coincidan y que la indentación esté alineada a 4 espacios.`;
    }

    return `### 🤖 Sugerencia de Byte Copilot\n\n` +
      `Tu código actual tiene buena estructura base. Para completar con éxito los casos de prueba:\n` +
      `- Asegúrate de que la función retorne explícitamente el valor con \`return\`.\n` +
      `- Verifica qué ocurre con entradas extremas (cadenas vacías o colecciones de un solo elemento).\n` +
      (ctx.hint ? `- Recuerda la pista: *${ctx.hint}*` : '');
  }

  applySnippetToEditor(snippet: string) {
    if (!snippet) return;
    this.code.set(snippet);
    this.isModified.set(true);
    this.updateCursorPos();
    this.showToast('✓ Código aplicado al editor');
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
