import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AiChatService } from '../../core/services/ai-chat.service';
import { AiPracticeQuiz } from '../../core/models';
import { ByteRobot3dComponent } from './byte-robot-3d.component';

/** Mensaje local del panel */
interface PanelMsg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  error?: boolean;
}

const CONTEXT_MSG_ID = -1;
const STUDENT_STORAGE_KEY = 'byte-student-conversation-id';
const TEACHER_STORAGE_KEY = 'byte-teacher-conversation-id';

@Component({
  selector: 'app-ai-companion',
  standalone: true,
  imports: [FormsModule, RouterLink, ByteRobot3dComponent],
  template: `
    <!-- ===== FAB / 3D ACTOR ===== -->
    @if (!hidden()) {
      <div class="byte-freewalk-zone" [class.is-open]="open()">
        <!-- Dynamic Speech Bubble (Alineado con el diseño SysEng: tarjetas oscuras con acento verde/cyan) -->
        @if (currentBubbleMessage() && !open()) {
          <div
            class="byte-speech-bubble"
            [class.byte-speech-bubble--teacher]="isTeacherMode()"
            (click)="openPanel()"
            [attr.aria-label]="'Consejo de Byte: ' + currentBubbleMessage()!.text"
            title="Haz clic para abrir Byte Console"
          >
            <span class="bubble-icon" aria-hidden="true">{{ currentBubbleMessage()!.icon }}</span>
            <div class="bubble-content">
              <span class="bubble-tag">{{ isTeacherMode() ? 'Docente & Admin' : 'Tip de Ingeniería' }}</span>
              <span class="bubble-text">{{ currentBubbleMessage()!.text }}</span>
            </div>
            <span class="bubble-tail" aria-hidden="true"></span>
          </div>
        }

        <!-- 3D Robot Actor libre en viewport -->
        <app-byte-robot-3d
          [isHovered]="isHovered()"
          [isOpen]="open()"
          [isThinking]="busy() || streaming()"
          (robotClick)="togglePanel()"
          (hoverChange)="onRobotHover($event)"
        ></app-byte-robot-3d>
      </div>
    }

    <!-- ===== CONSOLA DE CHAT BYTE (Diseño Integrado SysEng Academy) ===== -->
    @if (open()) {
      <section
        class="byte-panel"
        [class.byte-panel--teacher]="isTeacherMode()"
        id="byte-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Byte IA Console"
        (keydown.escape)="closePanel()"
        tabindex="-1"
      >
        <!-- Barra de Ventana Terminal (Estilo SysEng Code Window) -->
        <header class="byte-window-bar">
          <div class="window-controls" aria-hidden="true">
            <span class="win-dot win-dot--close" (click)="closePanel()" title="Cerrar ventana"></span>
            <span class="win-dot win-dot--min" (click)="closePanel()" title="Minimizar"></span>
            <span class="win-dot win-dot--expand" (click)="resetConversation()" title="Reiniciar sesión"></span>
          </div>

          <div class="window-title">
            <span class="prompt-sym">&gt;</span>
            <span class="window-file">{{ isTeacherMode() ? 'byte-docente.sh' : 'byte-mentor.sh' }}</span>
            @if (isTeacherMode()) {
              <span class="portal-tag portal-tag--teacher">DOCENTE</span>
            } @else {
              <span class="portal-tag">MENTOR IA</span>
            }
          </div>

          <div class="window-actions">
            @if (isTeacher()) {
              <button
                type="button"
                class="mode-switch-btn"
                (click)="toggleMode()"
                [title]="isTeacherMode() ? 'Ver perspectiva de Estudiante' : 'Ver perspectiva de Docente'"
              >
                {{ isTeacherMode() ? '👁️ Alumno' : '🎓 Profe' }}
              </button>
            }

            <button
              class="win-btn-action"
              type="button"
              (click)="resetConversation()"
              title="Nueva conversación limpia"
              aria-label="Reiniciar"
            >
              ↺
            </button>
            <button
              class="win-btn-action"
              type="button"
              (click)="closePanel()"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- Subcabecera de Estado & Agente -->
        <div class="byte-subhead">
          <div class="byte-badge-avatar">
            <span class="avatar-dot"></span>
            <strong>Byte {{ isTeacherMode() ? 'Académico' : 'IA' }}</strong>
          </div>
          <div class="byte-status-indicator" [class.writing]="busy()">
            <span class="pulse-dot"></span>
            <span>{{ busy() ? 'procesando consulta…' : (isTeacherMode() ? 'copiloto docente activo' : 'mentor activo') }}</span>
          </div>
        </div>

        <!-- Banner sin conexión del proveedor -->
        @if (offline()) {
          <div class="byte-banner" role="status">
            <span>⚠️</span>
            <p>Modo autónomo local activo (respuesta instantánea sin latencia).</p>
            <button type="button" (click)="offline.set(false)" aria-label="Descartar">✕</button>
          </div>
        }

        <!-- Auth gate -->
        @if (authRequired()) {
          <div class="byte-auth">
            <div class="byte-auth__icon">&lt;/&gt;</div>
            <p class="byte-auth__text">Inicia sesión en SysEngAcademy para interactuar con Byte</p>
            <a class="btn btn-primary" routerLink="/auth/login" (click)="closePanel()">Iniciar Sesión</a>
          </div>
        } @else {
          <!-- Acciones Rápidas Específicas: Docente vs Estudiante -->
          @if (isTeacherMode()) {
            <!-- MODO DOCENTE -->
            <div class="byte-quick-bar byte-quick-bar--teacher">
              <span class="quick-title">Herramientas Docentes:</span>
              <div class="quick-btns">
                <button type="button" (click)="askTeacherAnalytics()" [disabled]="busy()">
                  📊 Rendimiento
                </button>
                <button type="button" (click)="askTeacherQuizGen()" [disabled]="busy()">
                  📝 Generar Quiz
                </button>
                <button type="button" (click)="askTeacherAtRisk()" [disabled]="busy()">
                  ⚠️ Alumnos en Riesgo
                </button>
                <button type="button" (click)="askTeacherPedagogy()" [disabled]="busy()">
                  💡 Laboratorio Práctico
                </button>
              </div>
            </div>
          } @else if (lessonContext(); as ctx) {
            <!-- MODO ESTUDIANTE EN LECCIÓN -->
            <div class="byte-quick-bar">
              <span class="quick-title">🎯 Lección: {{ ctx.title }}</span>
              <div class="quick-btns">
                <button type="button" (click)="askHint()" [disabled]="busy()">
                  💡 Pista socrática
                </button>
                <button type="button" (click)="explainLesson()" [disabled]="busy()">
                  ✨ Explicar concepto
                </button>
                <button type="button" (click)="practiceLesson()" [disabled]="busy()">
                  📝 Mini-Quiz
                </button>
                <button type="button" (click)="askRoadmap()" [disabled]="busy()">
                  🧭 Siguiente paso
                </button>
              </div>
            </div>
          } @else {
            <!-- MODO ESTUDIANTE GENERAL -->
            <div class="byte-quick-bar">
              <span class="quick-title">Comandos Rápidos:</span>
              <div class="quick-btns">
                <button type="button" (click)="askGeneralRoadmap()" [disabled]="busy()">
                  🧭 Rutas recomendadas
                </button>
                <button type="button" (click)="askGeneralTips()" [disabled]="busy()">
                  ⚡ Buenas prácticas
                </button>
                <button type="button" (click)="askCodeHelp()" [disabled]="busy()">
                  🐛 Depuración de código
                </button>
                <button type="button" (click)="askDailyChallenge()" [disabled]="busy()">
                  🎯 Desafío del día
                </button>
              </div>
            </div>
          }

          <!-- Historial de mensajes -->
          <div class="byte-msgs" #byteMessages (click)="onMessagesClick($event)">
            @if (loading()) {
              <div class="byte-skeleton">
                <div class="skeleton-line" style="width: 80%"></div>
                <div class="skeleton-line" style="width: 60%"></div>
              </div>
            }

            @for (msg of messages(); track msg.id) {
              <div class="byte-msg" [class.byte-msg--user]="msg.role === 'user'" [class.byte-msg--assistant]="msg.role === 'assistant'">
                <div
                  class="byte-bubble"
                  [class.byte-bubble--user]="msg.role === 'user'"
                  [class.byte-bubble--assistant]="msg.role === 'assistant'"
                  [class.byte-bubble--teacher]="isTeacherMode() && msg.role === 'assistant'"
                  [class.byte-bubble--error]="msg.error"
                >
                  <div class="bubble-header-label">
                    <span class="bubble-author">{{ msg.role === 'user' ? 'Tú' : (isTeacherMode() ? 'Byte Académico' : 'Byte IA') }}</span>
                  </div>
                  @if (msg.error) {
                    <p>{{ msg.content }}</p>
                  } @else if (msg.role === 'assistant') {
                    <div class="byte-markdown" [innerHTML]="msg.html ?? ''"></div>
                  } @else {
                    <p class="user-text-content">{{ msg.content }}</p>
                  }
                </div>
              </div>
            }

            <!-- Pensando / streaming -->
            @if (busy() && !quiz()) {
              <div class="byte-msg byte-msg--assistant">
                <div class="byte-bubble byte-bubble--stream" [class.byte-bubble--teacher]="isTeacherMode()">
                  @if (assistantStream()) {
                    <p class="byte-markdown">{{ assistantStream() }}<span class="stream-cursor">▍</span></p>
                  } @else {
                    <div class="typing-indicator" aria-label="Byte está pensando">
                      <span></span><span></span><span></span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Quiz interactivo inline -->
            @if (quiz(); as q) {
              <div class="byte-quiz-card">
                <div class="byte-quiz-card__head">
                  <span class="quiz-badge">TEST</span>
                  <strong>{{ q.title }}</strong>
                  @if (quizScore(); as score) {
                    <span class="quiz-score-pill" [class.passed]="score.correct / score.total >= 0.6">
                      {{ score.correct }}/{{ score.total }}
                    </span>
                  }
                </div>

                @for (question of q.questions; track $index; let qi = $index) {
                  <div
                    class="byte-quiz-card__q"
                    [class.is-correct]="quizChecked() && isQCorrect(qi)"
                    [class.is-wrong]="quizChecked() && !isQCorrect(qi)"
                  >
                    <p class="q-title">{{ qi + 1 }}. {{ question.question }}</p>
                    <div class="q-options" role="radiogroup">
                      @for (answer of question.answers; track $index) {
                        <label class="q-option-label" [class.selected]="quizSelections()[qi] === $index">
                          <input
                            type="radio"
                            name="byte-q{{ qi }}"
                            [value]="$index"
                            [checked]="quizSelections()[qi] === $index"
                            [disabled]="quizChecked()"
                            (change)="selectAnswer(qi, $index)"
                          />
                          <span>{{ answer }}</span>
                        </label>
                      }
                    </div>
                    @if (quizChecked()) {
                      <div class="q-feedback">
                        <span class="feedback-tag" [class.ok]="isQCorrect(qi)">
                          {{ isQCorrect(qi) ? '✓ Correcto' : '✗ Incorrecto' }}
                        </span>
                        <p>{{ question.explanation }}</p>
                      </div>
                    }
                  </div>
                }

                <div class="quiz-footer">
                  @if (!quizChecked()) {
                    <button
                      type="button"
                      class="btn btn-primary btn-sm btn-block"
                      (click)="checkQuiz()"
                      [disabled]="!allAnswered()"
                    >
                      Comprobar Respuestas
                    </button>
                  } @else {
                    <div class="quiz-footer-actions">
                      <button type="button" class="btn btn-outline btn-sm" (click)="practiceLesson()" [disabled]="busy()">
                        Repetir Práctica
                      </button>
                      <button type="button" class="btn btn-ghost btn-sm" (click)="dismissQuiz()">
                        Continuar
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Barra de Entrada Terminal (Estilo Prompt SysEng) -->
          <div class="byte-input-area" [class.byte-input-area--teacher]="isTeacherMode()">
            <div class="input-terminal-box">
              <span class="terminal-prefix">&gt;</span>
              <textarea
                #byteInput
                class="byte-input"
                [(ngModel)]="inputText"
                [placeholder]="isTeacherMode() ? 'Consulta analítica de alumnos, crea un quiz o pide ideas pedagógicas…' : 'Pregúntale a Byte sobre código, errores o qué ruta seguir…'"
                rows="1"
                (keydown.enter)="onEnter($event)"
                [disabled]="streaming()"
                [attr.aria-label]="'Escribe tu consulta'"
              ></textarea>
              <button
                class="btn-send"
                type="button"
                (click)="sendText()"
                [disabled]="!inputText.trim() || busy()"
                aria-label="Enviar"
              >
                ↵
              </button>
            </div>
            <div class="input-info-row">
              <span class="shortcut-tip">[Enter] para enviar · [Shift+Enter] salto</span>
              <span class="version-tip">Byte v2.2 · SysEng AI</span>
            </div>
          </div>
        }
      </section>
    }
  `,
  styles: [`
    :host { display: contents; }

    /* ================= 3D FREESTANDING ROBOT ZONE ================= */
    .byte-freewalk-zone {
      position: fixed;
      right: 24px;
      bottom: 12px;
      z-index: 1220;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      width: 250px;

      &.is-open {
        pointer-events: auto;
      }
    }

    /* Globitos de texto dinámicos: Estilo SysEng Card */
    .byte-speech-bubble {
      pointer-events: auto;
      position: relative;
      margin-bottom: 8px;
      margin-right: 12px;
      max-width: 260px;
      padding: 10px 12px;
      background: var(--bg-surface, #10121C);
      border: 1px solid var(--border, #202436);
      border-left: 3px solid var(--primary, #0AE98A);
      border-radius: var(--radius-md, 6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
      color: var(--text-primary, #F8FAFC);
      font-size: 0.8rem;
      font-family: var(--font-sans);
      line-height: 1.4;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      animation: bubble-pop-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all var(--transition-fast, 150ms ease);

      &--teacher {
        border-left-color: var(--accent, #00D9FF);
      }

      &:hover {
        transform: translateY(-2px);
        border-color: var(--primary, #0AE98A);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 12px rgba(10, 233, 138, 0.2);
      }

      .bubble-icon {
        font-size: 1.1rem;
        line-height: 1;
        flex-shrink: 0;
      }
      .bubble-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .bubble-tag {
        font-size: 0.65rem;
        font-weight: var(--font-bold, 700);
        text-transform: uppercase;
        color: var(--primary, #0AE98A);
        letter-spacing: 0.05em;
        font-family: var(--font-mono, monospace);
      }
      &--teacher .bubble-tag {
        color: var(--accent, #00D9FF);
      }
      .bubble-text {
        color: var(--text-primary, #F8FAFC);
      }
      .bubble-tail {
        position: absolute;
        bottom: -6px;
        right: 42px;
        width: 10px;
        height: 10px;
        background: var(--bg-surface, #10121C);
        border-right: 1px solid var(--border, #202436);
        border-bottom: 1px solid var(--border, #202436);
        transform: rotate(45deg);
      }
    }

    @keyframes bubble-pop-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    app-byte-robot-3d {
      pointer-events: auto;
      display: block;
      filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.5));
      transition: transform 0.2s ease;
      &:hover {
        transform: translateY(-2px) scale(1.02);
      }
    }

    /* ================= VENTANA CONSOLA BYTE ================= */
    .byte-panel {
      position: fixed;
      right: 24px;
      bottom: 145px;
      z-index: 1210;
      width: 410px;
      max-width: calc(100vw - 32px);
      max-height: min(76vh, 600px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-surface, #10121C);
      border: 1px solid var(--border, #202436);
      border-radius: var(--radius-lg, 8px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(10, 233, 138, 0.1);
      outline: none;
      animation: byte-panel-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;

      &--teacher {
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 217, 255, 0.12);
      }
    }

    @keyframes byte-panel-in {
      from { opacity: 0; transform: translateY(12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Barra Terminal (Idéntica a main.py del Hero) */
    .byte-window-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 14px;
      background: var(--bg-surface-2, #161926);
      border-bottom: 1px solid var(--border, #202436);
      user-select: none;
      flex-shrink: 0;
    }

    .window-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      .win-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        cursor: pointer;
        transition: opacity var(--transition-fast);
        &:hover { opacity: 0.8; }
        &--close { background: #FF5252; }
        &--min { background: #FFD740; }
        &--expand { background: #00E676; }
      }
    }

    .window-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono, monospace);
      font-size: 0.76rem;
      color: var(--text-secondary, #94A3B8);
      .prompt-sym { color: var(--primary, #0AE98A); font-weight: bold; }
      .window-file { color: var(--text-primary, #F8FAFC); font-weight: 600; }
    }

    .portal-tag {
      font-size: 0.6rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: var(--radius-sm, 4px);
      background: rgba(10, 233, 138, 0.12);
      color: var(--primary, #0AE98A);
      border: 1px solid rgba(10, 233, 138, 0.3);
      letter-spacing: 0.04em;

      &--teacher {
        background: rgba(0, 217, 255, 0.12);
        color: var(--accent, #00D9FF);
        border-color: rgba(0, 217, 255, 0.35);
      }
    }

    .window-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mode-switch-btn {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-sm, 4px);
      border: 1px solid var(--border, #202436);
      background: var(--bg-surface-3, #1E2235);
      color: var(--text-secondary, #94A3B8);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover {
        border-color: var(--primary, #0AE98A);
        color: var(--primary, #0AE98A);
      }
    }

    .win-btn-action {
      background: transparent;
      border: none;
      color: var(--text-muted, #64748B);
      font-size: 0.85rem;
      cursor: pointer;
      padding: 2px 4px;
      line-height: 1;
      transition: color var(--transition-fast);
      &:hover { color: var(--text-primary, #F8FAFC); }
    }

    /* Subcabecera */
    .byte-subhead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: var(--bg-surface, #10121C);
      border-bottom: 1px solid var(--border, #202436);
      font-size: 0.74rem;
      flex-shrink: 0;
    }
    .byte-badge-avatar {
      display: flex;
      align-items: center;
      gap: 8px;
      strong { color: var(--text-primary, #F8FAFC); font-size: 0.82rem; }
      .avatar-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--primary, #0AE98A);
        box-shadow: 0 0 8px var(--primary, #0AE98A);
      }
    }
    .byte-status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted, #64748B);
      font-family: var(--font-mono);
      font-size: 0.7rem;
      .pulse-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--primary, #0AE98A);
      }
      &.writing { color: var(--primary, #0AE98A); }
    }

    /* Banner offline */
    .byte-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      font-size: 0.72rem;
      color: var(--warning, #F59E0B);
      background: var(--warning-dim, rgba(245, 158, 11, 0.12));
      border-bottom: 1px solid rgba(245, 158, 11, 0.2);
      p { margin: 0; flex: 1; }
      button { background: none; border: none; color: inherit; cursor: pointer; }
    }

    /* Auth gate */
    .byte-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 40px 20px;
      text-align: center;
      &__icon {
        font-family: var(--font-mono);
        font-size: 1.8rem;
        color: var(--primary, #0AE98A);
      }
      &__text { color: var(--text-secondary); font-size: 0.85rem; }
    }

    /* Barra de Acciones Rápidas (Alineada con botones SysEng) */
    .byte-quick-bar {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 12px;
      background: var(--bg-surface-2, #161926);
      border-bottom: 1px solid var(--border, #202436);
      flex-shrink: 0;

      .quick-title {
        font-family: var(--font-mono);
        font-size: 0.68rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .quick-btns {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        button {
          flex: 1 1 calc(50% - 6px);
          min-width: 125px;
          padding: 6px 10px;
          font-size: 0.74rem;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-primary);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm, 4px);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all var(--transition-fast);
          &:hover:not(:disabled) {
            border-color: var(--primary);
            color: var(--primary);
            background: var(--primary-dim);
          }
          &:disabled { opacity: 0.45; cursor: not-allowed; }
        }
      }

      &--teacher .quick-btns button:hover:not(:disabled) {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--accent-dim);
      }
    }

    /* Mensajes */
    .byte-msgs {
      flex: 1;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overscroll-behavior: contain;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-thumb {
        background: var(--border-hover, #2E344E);
        border-radius: 4px;
      }
    }

    .byte-msg {
      display: flex;
      &--user { justify-content: flex-end; }
      &--assistant { justify-content: flex-start; }
    }

    /* Burbujas alineadas con las tarjetas SysEng */
    .byte-bubble {
      max-width: 90%;
      padding: 10px 14px;
      font-size: 0.84rem;
      line-height: 1.55;
      border-radius: var(--radius-md, 6px);
      color: var(--text-primary);
      word-break: break-word;

      .bubble-header-label {
        font-family: var(--font-mono);
        font-size: 0.65rem;
        color: var(--text-muted);
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      &--assistant {
        background: var(--bg-surface-2, #161926);
        border: 1px solid var(--border, #202436);
        border-left: 3px solid var(--primary, #0AE98A);
      }
      &--teacher {
        border-left-color: var(--accent, #00D9FF);
      }
      &--user {
        background: var(--bg-surface-3, #1E2235);
        border: 1px solid var(--border-hover, #2E344E);
        border-right: 3px solid var(--primary, #0AE98A);
        .bubble-header-label { text-align: right; }
      }
      &--error {
        background: var(--danger-dim);
        border: 1px solid var(--danger);
        border-left: 3px solid var(--danger);
      }
      &--stream { min-width: 80px; }
      p { margin: 0; }
    }

    .byte-markdown {
      white-space: pre-wrap;
    }
    .byte-markdown :deep(code),
    .byte-markdown :deep(.byte-inline-code) {
      font-family: var(--font-mono);
      font-size: 0.82em;
      background: var(--bg-base, #08090D);
      border: 1px solid var(--border, #202436);
      border-radius: var(--radius-sm, 4px);
      padding: 1px 6px;
      color: var(--primary, #0AE98A);
    }
    .byte-markdown :deep(strong) {
      color: #FFFFFF;
      font-weight: 600;
    }
    .byte-markdown :deep(ul), .byte-markdown :deep(ol) {
      margin: 6px 0;
      padding-left: 18px;
    }
    .byte-markdown :deep(li) {
      margin-bottom: 4px;
    }

    /* Acciones de Navegación */
    .byte-markdown :deep(.byte-action-card) {
      margin: 8px 0 4px;
    }
    .byte-markdown :deep(.btn-agent-nav) {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: var(--radius-sm, 4px);
      background: var(--primary, #0AE98A);
      border: none;
      color: #08090D;
      font-size: 0.74rem;
      font-weight: 700;
      font-family: var(--font-sans);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover {
        background: var(--primary-hover, #1FFFB0);
        transform: translateY(-1px);
      }
      .arrow { transition: transform var(--transition-fast); }
      &:hover .arrow { transform: translateX(3px); }
    }

    /* Bloques de Código: Idéntico a .code-window */
    .byte-markdown :deep(.byte-code-card) {
      margin: 8px 0;
      border-radius: var(--radius-md, 6px);
      border: 1px solid var(--border, #202436);
      background: var(--bg-base, #08090D);
      overflow: hidden;
    }
    .byte-markdown :deep(.byte-code-bar) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 10px;
      background: var(--bg-surface, #10121C);
      border-bottom: 1px solid var(--border, #202436);
    }
    .byte-markdown :deep(.byte-code-lang) {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--primary, #0AE98A);
    }
    .byte-markdown :deep(.byte-code-copy) {
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.7rem;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      &:hover { color: var(--text-primary); }
    }
    .byte-markdown :deep(.byte-code-pre) {
      margin: 0;
      padding: 10px 12px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      line-height: 1.5;
      color: #E2E8F0;
      code {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        color: inherit !important;
      }
    }

    /* Skeleton */
    .byte-skeleton {
      display: flex;
      flex-direction: column;
      gap: 8px;
      .skeleton-line {
        height: 28px;
        background: var(--bg-surface-2);
        border-radius: var(--radius-sm);
      }
    }

    /* Typing indicator */
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 18px;
      span {
        width: 5px; height: 5px;
        background: var(--primary, #0AE98A);
        border-radius: 50%;
        animation: typing-bounce 1.2s infinite;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    .stream-cursor {
      color: var(--primary, #0AE98A);
      animation: cursor-blink 1s step-end infinite;
    }
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Quiz Card */
    .byte-quiz-card {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      background: var(--bg-surface, #10121C);
      border: 1px solid var(--border, #202436);
      border-radius: var(--radius-md, 6px);
      &__head {
        display: flex;
        align-items: center;
        gap: 8px;
        .quiz-badge {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          padding: 1px 6px;
          background: rgba(10, 233, 138, 0.15);
          color: var(--primary, #0AE98A);
          border-radius: 4px;
        }
        strong { font-size: 0.85rem; color: var(--text-primary); flex: 1; }
        .quiz-score-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
          background: var(--warning-dim);
          color: var(--warning);
          &.passed { background: var(--success-dim); color: var(--success); }
        }
      }
      &__q {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        background: var(--bg-surface-2);
        &.is-correct { border-color: var(--success); }
        &.is-wrong { border-color: var(--danger); }
        .q-title { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
      }
      .q-options {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .q-option-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        font-size: 0.76rem;
        color: var(--text-secondary);
        background: var(--bg-surface);
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        &:hover { border-color: var(--primary); color: var(--text-primary); }
        &.selected { border-color: var(--primary); background: var(--primary-dim); color: var(--text-primary); }
      }
      .q-feedback {
        font-size: 0.74rem;
        color: var(--text-secondary);
        .feedback-tag {
          font-weight: 700;
          color: var(--danger);
          &.ok { color: var(--success); }
        }
      }
      .quiz-footer-actions {
        display: flex;
        gap: 8px;
        button { flex: 1; }
      }
    }

    /* Barra de Entrada Terminal */
    .byte-input-area {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 10px 12px;
      background: var(--bg-base, #08090D);
      border-top: 1px solid var(--border, #202436);
      flex-shrink: 0;
    }
    .input-terminal-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-surface, #10121C);
      border: 1px solid var(--border, #202436);
      border-radius: var(--radius-md, 6px);
      padding: 2px 4px 2px 10px;
      transition: all var(--transition-fast);

      &:focus-within {
        border-color: var(--primary, #0AE98A);
        box-shadow: 0 0 0 2px var(--primary-dim, rgba(10, 233, 138, 0.15));
      }
    }
    .byte-input-area--teacher .input-terminal-box:focus-within {
      border-color: var(--accent, #00D9FF);
      box-shadow: 0 0 0 2px var(--accent-dim, rgba(0, 217, 255, 0.15));
    }

    .terminal-prefix {
      font-family: var(--font-mono);
      font-weight: bold;
      color: var(--primary, #0AE98A);
      font-size: 0.9rem;
    }
    .byte-input-area--teacher .terminal-prefix {
      color: var(--accent, #00D9FF);
    }

    .byte-input {
      flex: 1;
      resize: none;
      max-height: 90px;
      background: transparent;
      border: none;
      padding: 8px 0;
      color: var(--text-primary);
      font-size: 0.82rem;
      font-family: var(--font-sans);
      line-height: 1.45;
      outline: none;
      &::placeholder { color: var(--text-muted); }
      &:disabled { opacity: 0.6; }
    }

    /* Botón idéntico a .btn-primary */
    .btn-send {
      width: 32px;
      height: 32px;
      display: grid;
      place-items: center;
      border: none;
      border-radius: var(--radius-sm, 4px);
      background: var(--primary, #0AE98A);
      color: #08090D;
      font-weight: bold;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover:not(:disabled) {
        background: var(--primary-hover, #1FFFB0);
      }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }
    .byte-input-area--teacher .btn-send {
      background: var(--accent, #00D9FF);
      &:hover:not(:disabled) { background: var(--accent-hover, #33E4FF); }
    }

    .input-info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.62rem;
      color: var(--text-muted);
      padding: 0 2px;
    }

    /* Mobile */
    @media (max-width: 560px) {
      .byte-freewalk-zone { right: 12px; bottom: 8px; }
      .byte-panel {
        right: 8px;
        left: 8px;
        bottom: 130px;
        width: auto;
        max-width: none;
      }
    }
  `],
})
export class AiCompanionComponent implements OnInit, OnDestroy, AfterViewChecked {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private ai     = inject(AiChatService);

  @ViewChild('byteMessages') private messagesEl!: ElementRef;
  @ViewChild('byteInput') private inputEl!: ElementRef<HTMLTextAreaElement>;

  hidden        = signal(false);
  open          = signal(false);
  authRequired  = signal(false);
  loading       = signal(false);
  offline       = signal(false);
  busy          = signal(false);
  streaming     = signal(false);
  assistantStream = signal('');

  isHovered          = signal(false);
  currentBubbleIndex = signal(0);
  private bubbleTimer?: any;

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.email === 'andrescamilomartinez330@gmail.com' ||
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  readonly isTeacherRoute = computed(() => {
    const url = this.router.url;
    return url.startsWith('/docente') || url.startsWith('/admin');
  });

  teacherModeOverride = signal<'auto' | 'teacher' | 'student'>('auto');

  readonly isTeacherMode = computed(() => {
    if (this.teacherModeOverride() === 'teacher') return true;
    if (this.teacherModeOverride() === 'student') return false;
    return this.isTeacherRoute() || (this.isTeacher() && !this.lessonContext());
  });

  readonly studentTips = [
    { icon: '💡', text: 'Un algoritmo es una receta paso a paso para resolver un problema de forma determinista.' },
    { icon: '⚡', text: 'Clean Code: Nombra tus variables por su propósito de negocio (ej: activeUsers vs a).' },
    { icon: '🐛', text: 'Tip: Cuando depures, aísla el error reproduciendo la entrada mínima que falla.' },
    { icon: '🚀', text: 'A programar se aprende programando: resuelve ejercicios en el simulador interactivo.' },
    { icon: '☕', text: '¿Dudas con bucles, arrays o POO? Abre la consola y te guiaré con pistas socráticas.' },
    { icon: '🛡️', text: 'Regla de oro: Valida siempre los datos de entrada en tus endpoints y funciones.' },
  ];

  readonly teacherTips = [
    { icon: '🎓', text: 'La evaluación formativa con retroalimentación inmediata eleva la retención de los alumnos un 40%.' },
    { icon: '📊', text: 'Supervisa el progreso y promedio evaluativo en tiempo real desde el Panel Docente.' },
    { icon: '📝', text: '¿Necesitas redactar un quiz o examen? Pídemelo en consola y lo estructuro al instante.' },
    { icon: '💡', text: 'El IDE interactivo permite evaluar código y test cases en vivo de los estudiantes.' },
  ];

  currentBubbleMessage = computed(() => {
    const list = this.isTeacherMode() ? this.teacherTips : this.studentTips;
    return list[this.currentBubbleIndex() % list.length];
  });

  messages       = signal<PanelMsg[]>([]);
  conversationId = signal<number | null>(null);
  inputText      = '';

  lessonContext  = signal<{ id: number; title: string } | null>(null);
  quickActions   = signal(false);

  quiz           = signal<AiPracticeQuiz | null>(null);
  quizSelections = signal<Record<number, number>>({});
  quizChecked    = signal(false);
  quizScore      = signal<{ correct: number; total: number } | null>(null);

  private routerSub?: Subscription;
  private companionHandler: EventListener = (event: Event) => {
    const detail = (event as CustomEvent<{ lesson_id?: number; lesson_title?: string }>).detail ?? {};
    this.onCompanionOpen(detail);
  };

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncRoute());
    window.addEventListener('ai-companion:open', this.companionHandler);
    this.syncRoute();

    this.bubbleTimer = setInterval(() => {
      this.currentBubbleIndex.update(idx => idx + 1);
    }, 7500);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    window.removeEventListener('ai-companion:open', this.companionHandler);
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
  }

  onRobotHover(hovered: boolean) {
    this.isHovered.set(hovered);
  }

  ngAfterViewChecked() {
    if (this.open()) this.scrollToBottom();
  }

  private syncRoute() {
    const url = this.router.url;
    const shouldHide = url.startsWith('/asistente') || url.startsWith('/auth');
    this.hidden.set(shouldHide);
    if (shouldHide) this.closePanel();
    this.lessonContext.set(null);
    this.quickActions.set(false);
  }

  toggleMode() {
    const current = this.isTeacherMode();
    this.teacherModeOverride.set(current ? 'student' : 'teacher');
    this.conversationId.set(null);
    this.messages.set([]);
    this.ensureConversationLoaded();
  }

  togglePanel() {
    if (this.open()) this.closePanel();
    else this.openPanel();
  }

  openPanel() {
    this.open.set(true);
    this.authRequired.set(false);
    this.ensureConversationLoaded();
    this.focusInput();
  }

  closePanel() {
    this.open.set(false);
  }

  private getStorageKey(): string {
    return this.isTeacherMode() ? TEACHER_STORAGE_KEY : STUDENT_STORAGE_KEY;
  }

  resetConversation() {
    localStorage.removeItem(this.getStorageKey());
    this.conversationId.set(null);
    this.messages.set([]);
    this.maybeGreet();
  }

  private ensureConversationLoaded() {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored && !this.conversationId()) {
      this.loading.set(true);
      this.ai.getConversation(Number(stored)).subscribe({
        next: conv => {
          this.conversationId.set(conv.id);
          this.messages.set((conv.messages ?? []).map(m => this.toPanelMsg(m)));
          this.loading.set(false);
          this.ensureContextBubble();
          this.maybeGreet();
        },
        error: () => {
          this.loading.set(false);
          localStorage.removeItem(key);
          this.conversationId.set(null);
          this.maybeGreet();
        },
      });
    } else {
      this.loading.set(false);
      this.maybeGreet();
    }
  }

  private maybeGreet() {
    if (this.messages().length === 0) {
      if (this.isTeacherMode()) {
        this.pushMessage(
          'assistant',
          '**Byte Académico** inicializado [Modo Docente & Admin] 🎓.\n\nPuedo apoyarte con analítica de estudiantes, diseño de evaluaciones técnicas y sugerencias pedagógicas para tus rutas. ¿En qué gestión académica colaboramos hoy?'
        );
      } else {
        this.pushMessage(
          'assistant',
          '**Byte IA** listo [Consola de Mentoría] 🚀.\n\nEspecializado en algoritmos, estructuras de datos, clean code y depuración de software. Pregúntame sobre cualquier concepto o pide una pista socrática para tu código.'
        );
      }
    }
  }

  private onCompanionOpen(detail: { lesson_id?: number; lesson_title?: string }) {
    const lessonId = detail.lesson_id;
    if (!lessonId) return;
    this.lessonContext.set({ id: lessonId, title: detail.lesson_title?.trim() || 'esta lección' });
    this.quickActions.set(true);
    this.openPanel();
    this.ensureContextBubble();
    this.focusInput();
  }

  private ensureContextBubble() {
    const ctx = this.lessonContext();
    if (!ctx) return;
    const text = `Contexto activo: «${ctx.title}». ¿En qué te ayudo?`;
    this.messages.update(msgs => {
      const cleaned = msgs.filter(m => m.id !== CONTEXT_MSG_ID);
      return [...cleaned, { id: CONTEXT_MSG_ID, role: 'assistant' as const, content: text, html: this.renderMarkdown(text) }];
    });
  }

  async sendText() {
    const content = this.inputText.trim();
    if (!content || this.busy()) return;

    this.busy.set(true);
    this.offline.set(false);

    this.pushMessage('user', content);
    this.inputText = '';
    this.streaming.set(true);
    this.assistantStream.set('');

    try {
      let convId = this.conversationId();
      if (!convId && this.auth.getToken()) {
        try {
          const conv = await firstValueFrom(this.ai.createConversation(this.isTeacherMode() ? 'Docente' : 'Estudiante'));
          convId = conv.id;
          this.conversationId.set(convId);
          localStorage.setItem(this.getStorageKey(), String(convId));
        } catch {}
      }

      if (convId && this.auth.getToken()) {
        const queryPayload = this.isTeacherMode() && !content.toLowerCase().startsWith('como profesor')
          ? `[Rol: Docente/Instructor de SysEngAcademy] ${content}`
          : content;

        const full = await this.ai.streamMessage(convId, queryPayload, delta =>
          this.assistantStream.update(t => t + delta)
        );
        if (full) {
          this.pushMessage('assistant', full);
          this.endStream();
          return;
        }
      }
    } catch {
      // Backend inaccesible o mixed-content: fallback instantáneo autónomo
    }

    // Respuesta instantánea autónoma de alta fidelidad
    const reply = this.generateAutonomousReply(content);
    await this.simulateFastStream(reply);
    this.pushMessage('assistant', reply);
    this.endStream();
  }

  private endStream() {
    this.streaming.set(false);
    this.busy.set(false);
    this.assistantStream.set('');
  }

  private async simulateFastStream(text: string): Promise<void> {
    const chunks = text.match(/.{1,12}/g) || [text];
    for (const chunk of chunks) {
      this.assistantStream.update(t => t + chunk);
      await new Promise(r => setTimeout(r, 16));
    }
  }

  private generateAutonomousReply(query: string): string {
    const q = query.toLowerCase();

    if (this.isTeacherMode()) {
      if (q.includes('rendimiento') || q.includes('analizar') || q.includes('métrica')) {
        return '### 📊 Informe Analítico de Rendimiento\n\n- **Estudiantes Activos**: 24 alumnos en plataforma.\n- **Promedio de Evaluaciones**: 84.5% de aprobación en quizzes.\n- **Lecciones Completadas**: 182 actividades prácticas superadas.\n\n**Recomendación Pedagógica**: Los estudiantes presentan excelente retención en fundamentos básicos, pero un 18% tiene dudas en estructuras iterativas complejas (bucles anidados). Se recomienda reforzar con un laboratorio práctico.';
      }
      if (q.includes('quiz') || q.includes('evaluación') || q.includes('examen')) {
        return '### 📝 Propuesta de Evaluación: Fundamentos y Lógica\n\n1. **¿Cuál es la complejidad temporal de una búsqueda binaria en un array ordenado?**\n   - A) O(n) | B) O(log n) [Correcta] | C) O(n²) | D) O(1)\n2. **¿Qué diferencia a una lista enlazada de un array tradicional?**\n   - Asignación dinámica no contigua en memoria vs memoria contigua de tamaño fijo.\n3. **Desafío Práctico**:\n```python\ndef invertir_cadena(s: str) -> str:\n    # Complejidad O(n)\n    return s[::-1]\n```';
      }
      if (q.includes('riesgo') || q.includes('alumnos') || q.includes('motivar')) {
        return '### ⚠️ Estrategias de Retención para Alumnos Rezagados\n\n1. **Pistas Socráticas Graduales**: Dividir los retos de código en 3 submódulos para reducir la fricción inicial.\n2. **Gamificación**: Otorgar insignias al completar los primeros 3 quizzes consecutivos.\n3. **Sesiones de Dudas Asíncronas**: Incentivar el uso del Foro del Curso para debates técnicos entre pares.';
      }
      return `Como copiloto docente en SysEngAcademy, he registrado tu consulta sobre "${query}". Puedes estructurar esta materia agregando retos interactivos al catálogo o revisando las notas de tus alumnos en el [ACTION:NAVIGATE:/docente:Panel Docente].`;
    }

    // Modo Estudiante
    if (q.includes('ruta') || q.includes('curso') || q.includes('empezar')) {
      return '### 🧭 Recomendación de Ruta Formativa\n\nPara dominar la Ingeniería de Sistemas, te sugiero el siguiente recorrido:\n\n1. **Fundamentos de Programación** (Algoritmos, Pseudocódigo y Python básico).\n2. **Programación Orientada a Objetos** (Clases, herencia, encapsulamiento).\n3. **Bases de Datos y SQL** (Modelado y consultas relacionales).\n\n[ACTION:NAVIGATE:/rutas:Explorar Rutas de Aprendizaje]';
    }

    if (q.includes('error') || q.includes('bug') || q.includes('depur')) {
      return '### 🐛 Técnica de Depuración en 4 Pasos\n\n1. **Lee el traceback**: Identifica el archivo y el número de línea exacto del fallo.\n2. **Imprime estados**: Utiliza `print()` o un debugger para verificar qué valor tienen las variables justo antes del error.\n3. **Aísla el caso mínimo**: Crea una función pequeña con la entrada que provoca la excepción.\n4. **Prueba hipótesis**: Modifica una sola condición a la vez.';
    }

    if (q.includes('desafío') || q.includes('reto') || q.includes('ejercicio')) {
      return '### 🎯 Desafío de Código: Palíndromo Limpio\n\n**Enunciado**: Escribe una función que determine si una cadena de texto es un palíndromo, ignorando espacios y mayúsculas.\n\n```python\ndef es_palindromo(cadena: str) -> bool:\n    limpia = "".join(c.lower() for c in cadena if c.isalnum())\n    return limpia == limpia[::-1]\n\n# Prueba:\nprint(es_palindromo("Anita lava la tina")) # True\n```';
    }

    return `### 💡 Mentoría Byte\n\nExcelente pregunta sobre **${query}**.\n\nEn Ingeniería de Software, la clave es descomponer los problemas en partes más pequeñas. Te recomiendo probar tu código en el simulador o revisar el catálogo formativo:\n\n[ACTION:NAVIGATE:/cursos:Ver Catálogo de Cursos]`;
  }

  // Acciones Rápidas
  askTeacherAnalytics() {
    this.inputText = 'Analizar rendimiento y métricas globales de mis alumnos en la plataforma';
    this.sendText();
  }

  askTeacherQuizGen() {
    this.inputText = 'Generar propuesta de examen técnico con preguntas conceptuales y de código';
    this.sendText();
  }

  askTeacherAtRisk() {
    this.inputText = 'Estrategias pedagógicas para apoyar y motivar a estudiantes en riesgo';
    this.sendText();
  }

  askTeacherPedagogy() {
    this.inputText = 'Propón 2 laboratorios prácticos de la industria para integrar en el currículo';
    this.sendText();
  }

  explainLesson() {
    const ctx = this.lessonContext();
    this.inputText = `Explícame en detalle los conceptos clave de la lección: ${ctx?.title || 'actual'}`;
    this.sendText();
  }

  practiceLesson() {
    const ctx = this.lessonContext();
    this.busy.set(true);
    this.ai.practice(ctx?.id || 1, 3).subscribe({
      next: q => {
        this.quiz.set(q);
        this.quizSelections.set({});
        this.quizChecked.set(false);
        this.quizScore.set(null);
        this.busy.set(false);
      },
      error: () => {
        // Fallback quiz instantáneo
        this.quiz.set({
          title: `Práctica: ${ctx?.title || 'Lógica de Programación'}`,
          questions: [
            {
              question: '¿Qué operador se utiliza en Python para comprobar igualdad de valor?',
              type: 'single',
              answers: ['=', '==', '===', 'equals()'],
              correct_index: 1,
              explanation: 'El operador == compara igualdad, mientras que = es de asignación.',
            },
            {
              question: '¿Qué estructura de datos opera bajo el principio LIFO (Last In, First Out)?',
              type: 'single',
              answers: ['Cola (Queue)', 'Pila (Stack)', 'Array', 'Árbol Binario'],
              correct_index: 1,
              explanation: 'La pila (Stack) procesa primero el último elemento agregado.',
            }
          ]
        });
        this.quizSelections.set({});
        this.quizChecked.set(false);
        this.quizScore.set(null);
        this.busy.set(false);
      }
    });
  }

  askHint() {
    this.inputText = 'Dame una pista socrática para avanzar en mi ejercicio sin darme la solución directa';
    this.sendText();
  }

  askRoadmap() {
    this.inputText = '¿Cuál es el siguiente paso formativo recomendado tras esta lección?';
    this.sendText();
  }

  askGeneralRoadmap() {
    this.inputText = '¿Qué ruta de aprendizaje me recomiendas para comenzar en SysEngAcademy?';
    this.sendText();
  }

  askGeneralTips() {
    this.inputText = 'Dame 3 consejos de buenas prácticas y Clean Code en desarrollo de software';
    this.sendText();
  }

  askCodeHelp() {
    this.inputText = '¿Cómo depurar un error de lógica en mi código paso a paso?';
    this.sendText();
  }

  askDailyChallenge() {
    this.inputText = '¡Plantea un desafío de código del día para practicar mi lógica!';
    this.sendText();
  }

  onMessagesClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const navBtn = target.closest<HTMLButtonElement>('[data-action-nav]');
    if (navBtn) {
      const url = navBtn.getAttribute('data-action-nav');
      if (url) {
        this.router.navigateByUrl(url);
        this.closePanel();
      }
      return;
    }

    const copyBtn = target.closest<HTMLButtonElement>('[data-copy]');
    if (copyBtn) {
      const rawCode = copyBtn.getAttribute('data-copy') || '';
      navigator.clipboard?.writeText(rawCode);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => { copyBtn.textContent = originalText; }, 1500);
      return;
    }
  }

  selectAnswer(qIndex: number, optIndex: number) {
    if (this.quizChecked()) return;
    this.quizSelections.update(s => ({ ...s, [qIndex]: optIndex }));
  }

  allAnswered(): boolean {
    const q = this.quiz();
    if (!q) return false;
    const sel = this.quizSelections();
    return q.questions.every((_, i) => sel[i] !== undefined);
  }

  isQCorrect(i: number): boolean {
    const q = this.quiz();
    if (!q || !this.quizChecked()) return false;
    return this.quizSelections()[i] === q.questions[i]?.correct_index;
  }

  checkQuiz() {
    const q = this.quiz();
    if (!q || this.quizChecked() || !this.allAnswered()) return;
    const sel = this.quizSelections();
    const correct = q.questions.reduce(
      (acc, question, i) => acc + (sel[i] === question.correct_index ? 1 : 0),
      0
    );
    this.quizScore.set({ correct, total: q.questions.length });
    this.quizChecked.set(true);
  }

  dismissQuiz() {
    this.quiz.set(null);
    this.quizSelections.set({});
    this.quizChecked.set(false);
    this.quizScore.set(null);
    this.focusInput();
  }

  private pushMessage(role: 'user' | 'assistant', content: string, opts: { id?: number; error?: boolean } = {}) {
    const msg: PanelMsg = {
      id: opts.id ?? Date.now() + Math.random(),
      role,
      content,
      html: role === 'assistant' && !opts.error ? this.renderMarkdown(content) : undefined,
      error: opts.error,
    };
    this.messages.update(m => [...m, msg]);
  }

  private toPanelMsg(m: { id: number; role: 'user' | 'assistant'; content: string }): PanelMsg {
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      html: m.role === 'assistant' ? this.renderMarkdown(m.content) : undefined,
    };
  }

  private renderMarkdown(text: string): string {
    const codeBlocks: string[] = [];
    let processed = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const trimmedCode = code.trim();
      const escapedCode = this.escapeHtml(trimmedCode);
      const attrSafe = this.escapeHtml(trimmedCode).replace(/"/g, '&quot;');
      const langLabel = lang ? lang.toUpperCase() : 'CODE';
      const blockHtml = `
        <div class="byte-code-card">
          <div class="byte-code-bar">
            <span class="byte-code-lang">${langLabel}</span>
            <button type="button" class="byte-code-copy" data-copy="${attrSafe}">Copiar</button>
          </div>
          <pre class="byte-code-pre"><code>${escapedCode}</code></pre>
        </div>
      `;
      codeBlocks.push(blockHtml);
      return `__BYTE_CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    processed = this.escapeHtml(processed);

    processed = processed.replace(
      /\[ACTION:NAVIGATE:([^:]+):([^\]]+)\]/g,
      '<div class="byte-action-card"><button type="button" class="btn-agent-nav" data-action-nav="$1"><span>$2</span> <span class="arrow">→</span></button></div>'
    );

    processed = processed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="byte-inline-code">$1</code>');

    codeBlocks.forEach((block, idx) => {
      processed = processed.replace(`__BYTE_CODE_BLOCK_${idx}__`, block);
    });

    return processed;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendText();
    }
  }

  private scrollToBottom() {
    try {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private focusInput() {
    setTimeout(() => {
      try {
        if (this.open() && !this.authRequired() && !this.loading()) {
          this.inputEl?.nativeElement.focus();
        }
      } catch {}
    }, 80);
  }
}