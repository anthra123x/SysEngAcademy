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
    <div class="vscode-window" [class.is-fullscreen]="isFullscreen()">
      <!-- TOP MENU TITLE BAR -->
      <div class="vscode-titlebar">
        <div class="titlebar-left">
          <span class="window-dot dot-close"></span>
          <span class="window-dot dot-minimize"></span>
          <span class="window-dot dot-maximize"></span>
          <span class="titlebar-app-name">Visual Studio Code</span>
        </div>
        <div class="titlebar-center">
          <span class="titlebar-file">solution{{ currentLangInfo().extension }} — {{ lessonTitle() || 'SysEngAcademy' }} [Workspace]</span>
        </div>
        <div class="titlebar-right">
          <!-- Fullscreen toggle -->
          <button
            type="button"
            class="titlebar-btn"
            (click)="isFullscreen.set(!isFullscreen())"
            [title]="isFullscreen() ? 'Salir de pantalla completa' : 'Pantalla completa'"
          >
            {{ isFullscreen() ? '🗗' : '🗖' }}
          </button>
        </div>
      </div>

      <!-- MAIN CONTAINER: ACTIVITY BAR + WORKSPACE -->
      <div class="vscode-main">
        <!-- LEFT ACTIVITY BAR -->
        <aside class="activity-bar" aria-label="Barra de actividades">
          <div class="activity-bar__top">
            <!-- Explorer Tab -->
            <button
              type="button"
              class="activity-icon"
              [class.is-active]="activeSidebarTab() === 'explorer'"
              (click)="toggleSidebar('explorer')"
              title="Explorador de Archivos (Ctrl+Shift+E)"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            </button>

            <!-- Testing Tab -->
            @if (activeTestCases().length > 0) {
              <button
                type="button"
                class="activity-icon"
                [class.is-active]="activeSidebarTab() === 'tests'"
                (click)="toggleSidebar('tests')"
                title="Casos de Prueba y Validación"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M10 2v7.5l-4 6.5A3 3 0 0 0 8.5 20h7a3 3 0 0 0 2.5-4L14 9.5V2"></path>
                  <line x1="8.5" y1="2" x2="15.5" y2="2"></line>
                </svg>
                @if (testStats(); as stats) {
                  <span
                    class="activity-badge"
                    [class.badge-ok]="stats.passed === stats.total"
                    [class.badge-err]="stats.passed < stats.total"
                  >
                    {{ stats.passed }}/{{ stats.total }}
                  </span>
                }
              </button>
            }

            <!-- Byte Copilot Tab -->
            <button
              type="button"
              class="activity-icon"
              [class.is-active]="activeSidebarTab() === 'ai'"
              (click)="toggleSidebar('ai')"
              title="Byte IA — Asistente Socrático Copilot"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
                <line x1="8" y1="16" x2="8" y2="16"></line>
                <line x1="16" y1="16" x2="16" y2="16"></line>
              </svg>
            </button>
          </div>

          <div class="activity-bar__bottom">
            <button
              type="button"
              class="activity-icon"
              (click)="resetCode()"
              title="Restaurar código base inicial"
            >
              <span class="icon-glyph">↺</span>
            </button>
          </div>
        </aside>

        <!-- CENTER & RIGHT: EDITOR WORKSPACE -->
        <div class="workspace-area">
          <!-- VS CODE TABS BAR -->
          <div class="editor-tabs-bar">
            <div class="tabs-list">
              <!-- Active Solution Tab -->
              <div class="editor-tab is-active">
                <span class="tab-lang-icon" [attr.data-lang]="currentLanguage()">
                  {{ currentLangInfo().icon }}
                </span>
                <span class="tab-title">solution{{ currentLangInfo().extension }}</span>
                @if (isModified()) {
                  <span class="tab-dirty-dot" title="Modificado">●</span>
                } @else {
                  <span class="tab-close-icon">✕</span>
                }
              </div>

              <!-- Read-only Problem Description Tab (optional) -->
              @if (activeTestCases().length > 0) {
                <div
                  class="editor-tab tab-secondary"
                  (click)="toggleSidebar('tests')"
                  [class.is-active]="activeSidebarTab() === 'tests'"
                >
                  <span class="tab-lang-icon">🧪</span>
                  <span class="tab-title">tests.spec{{ currentLangInfo().extension }}</span>
                </div>
              }
            </div>

            <!-- Toolbar actions at right of tabs -->
            <div class="editor-actions">
              <!-- Language Selector -->
              <div class="vscode-select-wrap">
                <select
                  class="vscode-select"
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
                class="vscode-tool-btn"
                [class.is-active]="showStdin()"
                (click)="showStdin.set(!showStdin())"
                title="Configurar entrada estándar stdin"
              >
                stdin
              </button>

              <!-- Validate Tests Button (if tests exist) -->
              @if (activeTestCases().length > 0) {
                <button
                  type="button"
                  class="vscode-run-btn btn-test"
                  (click)="runTests()"
                  [disabled]="running() || testing() || !code().trim()"
                  title="Ejecutar y validar todos los casos de prueba"
                >
                  <span>{{ testing() ? '⏳' : '✓' }}</span>
                  <span>{{ testing() ? 'Validando…' : 'Run Tests' }}</span>
                </button>
              }

              <!-- Run Code Button -->
              <button
                type="button"
                class="vscode-run-btn btn-run"
                (click)="executeCode()"
                [disabled]="running() || testing() || !code().trim()"
                title="Ejecutar código en el entorno aislado (Ctrl + Enter)"
              >
                <span>{{ running() ? '⏳' : '▶' }}</span>
                <span>{{ running() ? 'Ejecutando…' : 'Run Code' }}</span>
                <kbd class="key-shortcut">Ctrl ↵</kbd>
              </button>
            </div>
          </div>

          <!-- BREADCRUMBS BAR -->
          <div class="breadcrumbs-bar">
            <span class="crumb">workspace</span>
            <span class="crumb-sep">&gt;</span>
            <span class="crumb">src</span>
            <span class="crumb-sep">&gt;</span>
            <span class="crumb crumb-active">solution{{ currentLangInfo().extension }}</span>
            <span class="crumb-sep">&gt;</span>
            <span class="crumb crumb-symbol">main</span>
          </div>

          <!-- OPTIONAL STDIN INPUT DRAWER -->
          @if (showStdin()) {
            <div class="stdin-tray">
              <span class="stdin-prompt">INPUT (stdin):</span>
              <input
                type="text"
                class="stdin-textbox"
                [ngModel]="stdin()"
                (ngModelChange)="stdin.set($event)"
                placeholder="Ingresa valores de entrada para input() o cin..."
              />
            </div>
          }

          <!-- SPLIT WORKSPACE: CODE EDITOR (LEFT) + TERMINAL (RIGHT) -->
          <div class="editor-split">
            <!-- CODE PANE -->
            <div class="editor-column">
              <div class="editor-gutter" aria-hidden="true">
                @for (line of lineNumbers(); track $index) {
                  <div class="line-num">{{ line }}</div>
                }
              </div>
              <div class="editor-surface">
                <textarea
                  #codeTextarea
                  class="monaco-textarea"
                  [ngModel]="code()"
                  (ngModelChange)="code.set($event)"
                  (keydown)="handleEditorKeyDown($event)"
                  spellcheck="false"
                  autocomplete="off"
                  autocapitalize="off"
                  placeholder="// Escribe tu solución aquí..."
                  aria-label="Editor de código fuente"
                ></textarea>
              </div>
            </div>

            <!-- VS CODE INTEGRATED TERMINAL (RIGHT) -->
            <div class="terminal-column">
              <!-- Terminal Tabs -->
              <div class="terminal-header">
                <div class="term-tabs-group">
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
                          class="term-score"
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
                    class="term-header-tab"
                    [class.is-active]="activeTerminalTab() === 'ai'"
                    (click)="activeTerminalTab.set('ai')"
                  >
                    <span>BYTE COPILOT</span>
                    @if (aiLoading()) {
                      <span class="copilot-pulse">●</span>
                    }
                  </button>
                </div>

                <div class="term-controls">
                  @if (executionResult()?.execution_time_ms !== undefined) {
                    <span class="time-metric">{{ executionResult()!.execution_time_ms }}ms</span>
                  }
                  @if (executionResult()) {
                    <button
                      type="button"
                      class="term-btn"
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
                <!-- VIEW 1: TERMINAL OUTPUT -->
                @if (activeTerminalTab() === 'terminal') {
                  <div class="term-log">
                    @if (running()) {
                      <div class="term-msg-running">
                        <span class="term-spinner"></span>
                        <span>[SysEng Engine] Compilando y ejecutando solución...</span>
                      </div>
                    } @else if (executionResult()) {
                      @let res = executionResult()!;
                      <div class="term-command-line">
                        <span class="cmd-prompt">syseng&#64;vscode:~/workspace$</span>
                        <span class="cmd-text">run solution{{ currentLangInfo().extension }}</span>
                      </div>

                      @if (res.stdout) {
                        <pre class="term-stdout">{{ res.stdout }}</pre>
                      }
                      @if (res.stderr) {
                        <pre class="term-stderr">{{ res.stderr }}</pre>
                      }
                      @if (!res.stdout && !res.stderr) {
                        <div class="term-quiet">
                          [El proceso finalizó sin generar salida en consola (stdout/stderr)]
                        </div>
                      }
                      <div
                        class="term-exit-status"
                        [class.is-ok]="res.exit_code === 0"
                        [class.is-err]="res.exit_code !== 0"
                      >
                        [Proceso finalizado con código {{ res.exit_code }} en {{ res.execution_time_ms }}ms]
                      </div>
                    } @else {
                      <div class="term-idle-state">
                        <p class="idle-line">syseng&#64;vscode:~/workspace$</p>
                        <p class="idle-hint">// Presiona <strong>Run Code (Ctrl + Enter)</strong> para compilar y ver la salida.</p>
                      </div>
                    }
                  </div>
                }

                <!-- VIEW 2: TESTS SPEC -->
                @if (activeTerminalTab() === 'tests') {
                  <div class="tests-screen">
                    @if (testing()) {
                      <div class="term-msg-running">
                        <span class="term-spinner"></span>
                        <span>Evaluando casos de prueba contra tu código...</span>
                      </div>
                    } @else if (executionResult()?.tests && executionResult()!.tests!.length > 0) {
                      <div class="test-results-feed">
                        @for (test of executionResult()!.tests; track $index) {
                          <div class="test-card" [class.is-passed]="test.passed" [class.is-failed]="!test.passed">
                            <div class="test-card__head">
                              <span class="test-status-icon">{{ test.passed ? '✓' : '✗' }}</span>
                              <span class="test-card__name">Test #{{ $index + 1 }}</span>
                              <span class="test-card__result">{{ test.passed ? 'PASSED' : 'FAILED' }}</span>
                            </div>
                            @if (!test.passed) {
                              <div class="test-card__diff">
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

                <!-- VIEW 3: BYTE COPILOT -->
                @if (activeTerminalTab() === 'ai') {
                  <div class="copilot-screen">
                    <div class="copilot-header">
                      <div class="copilot-avatar">🤖</div>
                      <div>
                        <strong>Byte AI — Asistente de Código Socrático</strong>
                        <small>Analizo tu lógica para guiarte sin darte la solución copiada.</small>
                      </div>
                    </div>

                    @if (aiLoading()) {
                      <div class="term-msg-running">
                        <span class="term-spinner"></span>
                        <span>Byte está inspeccionando la sintaxis y estructura de tu código…</span>
                      </div>
                    } @else if (aiReply()) {
                      <div class="copilot-reply-box" [innerHTML]="renderMarkdown(aiReply()!)"></div>
                    } @else {
                      <div class="copilot-prompt-card">
                        <p>¿Tienes dudas con algún bug, sintaxis o quieres validar tu lógica antes de enviar?</p>
                        <button type="button" class="btn-ask-byte" (click)="diagnoseWithAi()">
                          Pedir Asistencia a Byte IA
                        </button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VS CODE BOTTOM STATUS BAR -->
      <footer class="vscode-statusbar" aria-label="Barra de estado">
        <div class="statusbar-left">
          <span class="status-item status-branch" title="Rama Git activa">
            <span class="branch-icon">⎇</span> main*
          </span>
          <span class="status-item status-problems" title="0 Errores, 0 Advertencias">
            <span class="prob-icon">⨂</span> 0
            <span class="prob-icon warn">⚠</span> 0
          </span>
        </div>

        <div class="statusbar-right">
          <span class="status-item" title="Línea y Columna">
            Ln {{ lineNumbers().length }}, Col 1
          </span>
          <span class="status-item" title="Indentación">
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
      /* VS CODE WINDOW CONTAINER */
      .vscode-window {
        display: flex;
        flex-direction: column;
        background: #181818;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        overflow: hidden;
        margin: 1.25rem 0;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #cccccc;
        transition: all 0.2s ease;
      }

      .vscode-window.is-fullscreen {
        position: fixed;
        inset: 0;
        z-index: 99999;
        margin: 0;
        border-radius: 0;
        width: 100vw;
        height: 100vh;
      }

      /* TITLE BAR (Classic window controls & file header) */
      .vscode-titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #1f1f1f;
        padding: 0.35rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.75rem;
        user-select: none;
      }

      .titlebar-left {
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }

      .window-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        display: inline-block;
      }

      .dot-close { background: #ff5f56; }
      .dot-minimize { background: #ffbd2e; }
      .dot-maximize { background: #27c93f; }

      .titlebar-app-name {
        margin-left: 0.5rem;
        color: #858585;
        font-weight: 500;
        font-size: 0.72rem;
      }

      .titlebar-center {
        flex: 1;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 1rem;
        color: #9d9d9d;
        font-size: 0.74rem;
      }

      .titlebar-btn {
        background: transparent;
        border: none;
        color: #858585;
        font-size: 0.8rem;
        cursor: pointer;
        padding: 0.15rem 0.4rem;
        border-radius: 3px;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
      }

      /* MAIN LAYOUT: ACTIVITY BAR + WORKSPACE */
      .vscode-main {
        display: flex;
        flex: 1;
        min-height: 440px;
        max-height: 560px;
        overflow: hidden;
      }

      /* LEFT ACTIVITY BAR */
      .activity-bar {
        width: 46px;
        background: #181818;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        flex-shrink: 0;
        user-select: none;
      }

      .activity-bar__top,
      .activity-bar__bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
      }

      .activity-icon {
        background: transparent;
        border: none;
        color: #858585;
        cursor: pointer;
        width: 100%;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }

        &.is-active {
          color: #ffffff;
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 6px;
            bottom: 6px;
            width: 2px;
            background: #0078d4;
          }
        }

        .icon-glyph {
          font-size: 1.2rem;
          font-weight: bold;
        }
      }

      .activity-badge {
        position: absolute;
        bottom: 4px;
        right: 4px;
        font-size: 0.55rem;
        font-weight: 700;
        padding: 0.05rem 0.25rem;
        border-radius: 4px;
        background: #333333;
        color: #ffffff;

        &.badge-ok { background: #10b981; }
        &.badge-err { background: #ef4444; }
      }

      /* WORKSPACE AREA */
      .workspace-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        background: #1e1e1e;
        overflow: hidden;
      }

      /* TABS BAR */
      .editor-tabs-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #181818;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        min-height: 35px;
      }

      .tabs-list {
        display: flex;
        align-items: stretch;
        overflow-x: auto;
      }

      .editor-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: #141414;
        color: #969696;
        padding: 0.45rem 0.85rem;
        font-size: 0.78rem;
        cursor: pointer;
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        user-select: none;
        transition: background 0.15s, color 0.15s;

        &:hover {
          color: #ffffff;
          background: #1a1a1a;
        }

        &.is-active {
          background: #1e1e1e;
          color: #ffffff;
          border-top: 2px solid #0078d4;
        }
      }

      .tab-lang-icon {
        font-size: 0.85rem;
      }

      .tab-title {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      }

      .tab-dirty-dot {
        font-size: 0.75rem;
        color: #0078d4;
      }

      .tab-close-icon {
        font-size: 0.65rem;
        color: #666666;
        padding: 0.1rem;
        border-radius: 2px;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
      }

      /* TOOLBAR ACTIONS (RUN, TESTS, SELECT) */
      .editor-actions {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        padding-right: 0.65rem;
      }

      .vscode-select-wrap {
        position: relative;
      }

      .vscode-select {
        background: #252526;
        color: #cccccc;
        border: 1px solid #3c3c3c;
        border-radius: 3px;
        padding: 0.2rem 0.45rem;
        font-size: 0.73rem;
        cursor: pointer;
        outline: none;

        &:focus {
          border-color: #0078d4;
        }

        option {
          background: #1e1e1e;
          color: #ffffff;
        }
      }

      .vscode-tool-btn {
        background: transparent;
        color: #9d9d9d;
        border: 1px solid #3c3c3c;
        border-radius: 3px;
        padding: 0.2rem 0.5rem;
        font-size: 0.72rem;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
        }

        &.is-active {
          color: #0078d4;
          border-color: #0078d4;
          background: rgba(0, 120, 212, 0.15);
        }
      }

      .vscode-run-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        border: none;
        border-radius: 3px;
        padding: 0.25rem 0.65rem;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 0.15s;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-run {
        background: #0078d4;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #0060aa;
        }

        .key-shortcut {
          background: rgba(0, 0, 0, 0.25);
          padding: 0.05rem 0.25rem;
          border-radius: 2px;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.85);
          font-family: inherit;
        }
      }

      .btn-test {
        background: #238636;
        color: #ffffff;

        &:hover:not(:disabled) {
          background: #2ea043;
        }
      }

      /* BREADCRUMBS BAR */
      .breadcrumbs-bar {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        background: #1e1e1e;
        padding: 0.2rem 0.85rem;
        font-size: 0.7rem;
        color: #858585;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        user-select: none;
      }

      .crumb-sep {
        font-size: 0.65rem;
        color: #555555;
      }

      .crumb-active {
        color: #cccccc;
      }

      .crumb-symbol {
        color: #4ec9b0;
      }

      /* STDIN TRAY */
      .stdin-tray {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #252526;
        padding: 0.3rem 0.85rem;
        border-bottom: 1px solid #3c3c3c;
      }

      .stdin-prompt {
        font-size: 0.72rem;
        color: #858585;
        font-family: monospace;
      }

      .stdin-textbox {
        flex: 1;
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 2px;
        color: #ffffff;
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        font-family: 'Consolas', monospace;
        outline: none;

        &:focus {
          border-color: #0078d4;
        }
      }

      /* SPLIT WORKSPACE: EDITOR + TERMINAL */
      .editor-split {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        flex: 1;
        overflow: hidden;
      }

      @media (max-width: 900px) {
        .editor-split {
          grid-template-columns: 1fr;
          overflow-y: auto;
        }
      }

      /* CODE PANE */
      .editor-column {
        display: flex;
        background: #1e1e1e;
        border-right: 1px solid rgba(255, 255, 255, 0.06);
        overflow: hidden;
      }

      .editor-gutter {
        width: 42px;
        padding: 0.75rem 0;
        background: #1e1e1e;
        color: #858585;
        font-family: 'Consolas', 'Cascadia Code', 'Fira Code', monospace;
        font-size: 0.8rem;
        line-height: 1.55;
        text-align: right;
        user-select: none;
        border-right: 1px solid rgba(255, 255, 255, 0.04);
      }

      .line-num {
        padding-right: 0.65rem;
      }

      .editor-surface {
        flex: 1;
        position: relative;
        overflow: hidden;
      }

      .monaco-textarea {
        width: 100%;
        height: 100%;
        padding: 0.75rem 0.85rem;
        background: transparent;
        color: #d4d4d4;
        border: none;
        outline: none;
        resize: none;
        font-family: 'Consolas', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
        font-size: 0.84rem;
        line-height: 1.55;
        white-space: pre;
        overflow-x: auto;
        tab-size: 4;
        caret-color: #aeafad;
      }

      /* TERMINAL PANE (VS CODE INTEGRATED TERMINAL) */
      .terminal-column {
        display: flex;
        flex-direction: column;
        background: #181818;
        overflow: hidden;
      }

      .terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #181818;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding: 0 0.5rem;
        min-height: 32px;
        user-select: none;
      }

      .term-tabs-group {
        display: flex;
        gap: 0.25rem;
      }

      .term-header-tab {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: transparent;
        color: #969696;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.4rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        cursor: pointer;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }

        &.is-active {
          color: #ffffff;
          border-bottom-color: #0078d4;
        }
      }

      .term-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #858585;

        &.is-ok { background: #10b981; }
        &.is-err { background: #ef4444; }
      }

      .term-score {
        font-size: 0.65rem;
        padding: 0.05rem 0.3rem;
        border-radius: 3px;
        background: #333333;
        color: #cccccc;

        &.is-ok { background: #238636; color: #ffffff; }
        &.is-err { background: #da3633; color: #ffffff; }
      }

      .copilot-pulse {
        color: #0078d4;
        font-size: 0.65rem;
        animation: blink 1s infinite alternate;
      }

      .term-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .time-metric {
        font-size: 0.68rem;
        color: #858585;
        font-family: monospace;
      }

      .term-btn {
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

      /* TERMINAL VIEWPORT */
      .terminal-screen {
        flex: 1;
        overflow-y: auto;
        padding: 0.75rem;
        background: #181818;
        font-size: 0.8rem;
        line-height: 1.5;
        color: #cccccc;
      }

      .term-command-line {
        display: flex;
        gap: 0.45rem;
        margin-bottom: 0.45rem;
        font-size: 0.78rem;
      }

      .cmd-prompt {
        color: #4ec9b0;
      }

      .cmd-text {
        color: #dcdcaa;
      }

      .term-msg-running {
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
        margin: 0 0 0.5rem 0;
        color: #d4d4d4;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .term-stderr {
        margin: 0 0 0.5rem 0;
        color: #f48771;
        background: rgba(244, 135, 113, 0.08);
        padding: 0.45rem;
        border-radius: 3px;
        white-space: pre-wrap;
        word-break: break-all;
      }

      .term-quiet {
        color: #858585;
        font-style: italic;
        padding: 0.35rem 0;
      }

      .term-exit-status {
        font-size: 0.72rem;
        color: #858585;
        margin-top: 0.5rem;
        padding-top: 0.45rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.08);

        &.is-err {
          color: #f48771;
        }
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

          strong {
            color: #ffffff;
          }
        }
      }

      /* TESTS RESULTS IN TERMINAL */
      .test-results-feed {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .test-card {
        background: #1f1f1f;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 4px;
        padding: 0.45rem 0.65rem;

        &.is-passed {
          border-left: 3px solid #238636;
        }

        &.is-failed {
          border-left: 3px solid #da3633;
        }
      }

      .test-card__head {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.76rem;
      }

      .test-status-icon {
        font-weight: bold;
      }

      .test-card.is-passed .test-status-icon { color: #238636; }
      .test-card.is-failed .test-status-icon { color: #da3633; }

      .test-card__name {
        font-weight: 600;
        color: #ffffff;
        flex: 1;
      }

      .test-card__result {
        font-size: 0.68rem;
        color: #858585;
      }

      .test-card__diff {
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

        &:hover {
          background: #2ea043;
        }
      }

      /* BYTE COPILOT SCREEN */
      .copilot-screen {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .copilot-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);

        strong {
          color: #ffffff;
          font-size: 0.78rem;
          display: block;
        }

        small {
          color: #858585;
          font-size: 0.7rem;
        }
      }

      .copilot-reply-box {
        background: #1f1f1f;
        border: 1px solid #3c3c3c;
        border-radius: 4px;
        padding: 0.75rem;
        color: #d4d4d4;
        font-size: 0.8rem;
        line-height: 1.55;
        font-family: inherit;

        pre {
          background: #141414;
          padding: 0.5rem;
          border-radius: 3px;
          color: #4fc1ff;
          overflow-x: auto;
          margin: 0.5rem 0;
        }

        code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.3rem;
          border-radius: 2px;
          color: #dcdcaa;
        }
      }

      .copilot-prompt-card {
        padding: 1rem 0;
        color: #858585;
      }

      .btn-ask-byte {
        margin-top: 0.5rem;
        background: #0078d4;
        color: #ffffff;
        border: none;
        padding: 0.35rem 0.85rem;
        border-radius: 3px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          background: #0060aa;
        }
      }

      /* CLASSIC VS CODE BOTTOM STATUS BAR */
      .vscode-statusbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #007acc;
        color: #ffffff;
        padding: 0 0.5rem;
        height: 22px;
        font-size: 0.7rem;
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

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          padding: 0 0.2rem;
          margin: 0 -0.2rem;
        }
      }

      .branch-icon {
        font-size: 0.8rem;
      }

      .prob-icon {
        font-size: 0.75rem;
        &.warn { margin-left: 0.2rem; }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes blink {
        from { opacity: 0.2; }
        to { opacity: 1; }
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

  readonly activeSidebarTab = signal<'explorer' | 'tests' | 'ai'>('explorer');
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

  toggleSidebar(tab: 'explorer' | 'tests' | 'ai') {
    this.activeSidebarTab.set(tab);
    if (tab === 'tests') {
      this.activeTerminalTab.set('tests');
    } else if (tab === 'ai') {
      this.activeTerminalTab.set('ai');
      if (!this.aiReply() && !this.aiLoading()) {
        this.diagnoseWithAi();
      }
    } else {
      this.activeTerminalTab.set('terminal');
    }
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

    // Tab key handling: indent with 4 spaces (standard in VS Code Python)
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      const tabSpaces = '    ';
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
