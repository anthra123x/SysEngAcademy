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

/** Mensaje local del panel (el historial del backend se mapea a esta forma). */
interface PanelMsg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  /** HTML markdown-lite pre-calculado para burbujas del asistente. */
  html?: string;
  error?: boolean;
}

/** Marca de burbuja de contexto de lección (id fijo para deduplicar). */
const CONTEXT_MSG_ID = -1;
const STUDENT_STORAGE_KEY = 'byte-student-conversation-id';
const TEACHER_STORAGE_KEY = 'byte-teacher-conversation-id';

@Component({
  selector: 'app-ai-companion',
  standalone: true,
  imports: [FormsModule, RouterLink, ByteRobot3dComponent],
  template: `
    <!-- ===== FAB (se oculta en /asistente y /auth/*) ===== -->
    <!-- ===== FREESTANDING 3D WALKING & WAVING ROBOT (Sin caja ni hover acartonado, libre) ===== -->
    @if (!hidden()) {
      <div class="byte-freewalk-zone" [class.is-open]="open()">
        <!-- Dynamic Programming / Pedagogy Speech Bubble (saltando globitos de texto con tips) -->
        @if (currentBubbleMessage() && !open()) {
          <div
            class="byte-speech-bubble"
            [class.byte-speech-bubble--teacher]="isTeacherMode()"
            (click)="openPanel()"
            [attr.aria-label]="'Consejo de Byte: ' + currentBubbleMessage()!.text"
            title="Haz clic para chatear con Byte"
          >
            <span class="bubble-icon" aria-hidden="true">{{ currentBubbleMessage()!.icon }}</span>
            <div class="bubble-content">
              @if (isTeacherMode()) {
                <span class="bubble-tag">Tip Docente</span>
              }
              <span class="bubble-text">{{ currentBubbleMessage()!.text }}</span>
            </div>
            <span class="bubble-tail" aria-hidden="true"></span>
          </div>
        }

        <!-- Real 3D Autonomous WebGL Robot Character (True 3D, Free on viewport, No border/frame) -->
        <app-byte-robot-3d
          [isHovered]="isHovered()"
          [isOpen]="open()"
          [isThinking]="busy() || streaming()"
          (robotClick)="togglePanel()"
          (hoverChange)="onRobotHover($event)"
        ></app-byte-robot-3d>
      </div>
    }

    <!-- ===== PANEL DE CHAT ULTRA-PREMIUM ===== -->
    @if (open()) {
      <section
        class="byte-panel"
        [class.byte-panel--teacher]="isTeacherMode()"
        id="byte-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Chat con Byte"
        (keydown.escape)="closePanel()"
        tabindex="-1"
      >
        <!-- Cabecera Premium -->
        <header class="byte-panel__head" [class.byte-panel__head--teacher]="isTeacherMode()">
          <div class="byte-avatar-wrap">
            <div class="byte-avatar byte-avatar--head" [class.byte-avatar--teacher]="isTeacherMode()" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="100%" height="100%">
                <line x1="20" y1="10" x2="20" y2="4.5" stroke="#0A0A0F" stroke-width="2" stroke-linecap="round"/>
                <circle cx="20" cy="3.5" r="2.2" [attr.fill]="isTeacherMode() ? '#10B981' : '#00D9FF'"/>
                <rect x="6" y="10" width="28" height="21" rx="6" fill="#0A0A0F" opacity="0.88"/>
                <circle cx="15.5" cy="19" r="3" [attr.fill]="isTeacherMode() ? '#10B981' : '#00D9FF'"/>
                <circle cx="24.5" cy="19" r="3" [attr.fill]="isTeacherMode() ? '#00D9FF' : '#6C63FF'"/>
                <circle cx="15.5" cy="19" r="1.2" fill="#FFFFFF" opacity="0.95"/>
                <circle cx="24.5" cy="19" r="1.2" fill="#FFFFFF" opacity="0.95"/>
                <path d="M14.5 25.5 Q20 29.5 25.5 25.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <span class="byte-online-badge"></span>
          </div>

          <div class="byte-panel__who">
            <div class="byte-panel__title-row">
              <strong>{{ isTeacherMode() ? 'Byte Académico' : 'Byte' }}</strong>
              @if (isTeacherMode()) {
                <span class="byte-agent-badge byte-agent-badge--teacher">🎓 COPILOTO DOCENTE</span>
              } @else {
                <span class="byte-agent-badge">🚀 MENTOR IA</span>
              }
            </div>
            <div class="byte-status" [class.writing]="busy()">
              @if (busy()) {
                <span class="byte-status__dots" aria-hidden="true"><span></span><span></span><span></span></span>
                <span>{{ isTeacherMode() ? 'analizando datos académicos…' : 'analizando…' }}</span>
              } @else {
                <span class="byte-status__dot" [class.byte-status__dot--teacher]="isTeacherMode()" aria-hidden="true"></span>
                <span>{{ isTeacherMode() ? 'asistente pedagógico activo' : 'mentor activo' }}</span>
              }
            </div>
          </div>

          <!-- Acciones de Cabecera -->
          <div class="byte-panel__head-actions">
            <!-- Si es profesor/admin, botón para alternar entre vista Docente y Estudiante -->
            @if (isTeacher()) {
              <button
                type="button"
                class="mode-toggle-btn"
                [class.is-teacher]="isTeacherMode()"
                (click)="toggleMode()"
                [title]="isTeacherMode() ? 'Cambiar a modo Estudiante' : 'Cambiar a modo Docente'"
              >
                <span>{{ isTeacherMode() ? '👁️ Alumno' : '🎓 Profe' }}</span>
              </button>
            }

            <button
              class="byte-head-btn"
              type="button"
              (click)="resetConversation()"
              title="Nueva conversación limpia"
              aria-label="Reiniciar chat"
            >
              ↺
            </button>

            <button
              class="byte-panel__close"
              type="button"
              (click)="closePanel()"
              aria-label="Cerrar chat con Byte"
            >
              ✕
            </button>
          </div>
        </header>

        <!-- Banner sin conexión del proveedor -->
        @if (offline()) {
          <div class="byte-banner" role="status">
            <span>⚠️</span>
            <p>Byte no responde ahora mismo. Revisa tu conexión e inténtalo en un momento.</p>
            <button type="button" (click)="offline.set(false)" aria-label="Descartar aviso">✕</button>
          </div>
        }

        <!-- Auth gate -->
        @if (authRequired()) {
          <div class="byte-auth">
            <div class="byte-avatar byte-avatar--auth" aria-hidden="true">
              <svg viewBox="0 0 40 40" width="100%" height="100%">
                <line x1="20" y1="10" x2="20" y2="4.5" stroke="#0A0A0F" stroke-width="2" stroke-linecap="round"/>
                <circle cx="20" cy="3.5" r="2.2" fill="#0A0A0F"/>
                <rect x="6" y="10" width="28" height="21" rx="6" fill="#0A0A0F" opacity="0.86"/>
                <circle cx="15.5" cy="19" r="3" fill="#00D9FF"/>
                <circle cx="24.5" cy="19" r="3" fill="#6C63FF"/>
                <circle cx="15.5" cy="19" r="1.2" fill="#FFFFFF" opacity="0.9"/>
                <circle cx="24.5" cy="19" r="1.2" fill="#FFFFFF" opacity="0.9"/>
                <path d="M14.5 25.5 Q20 29.5 25.5 25.5" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" fill="none"/>
              </svg>
            </div>
            <p class="byte-auth__text">Inicia sesión para interactuar con Byte 😊</p>
            <a class="btn btn-primary" routerLink="/auth/login" (click)="closePanel()">Iniciar sesión</a>
          </div>
        } @else {
          <!-- Acciones Rápidas Específicas: Docente vs Estudiante -->
          @if (isTeacherMode()) {
            <!-- MODO DOCENTE & ADMINISTRATIVO -->
            <div class="byte-context-row byte-context-row--teacher">
              <div class="teacher-role-header">
                <span class="teacher-badge-icon">🎓</span>
                <span class="teacher-badge-title">Herramientas Docentes & Pedagógicas</span>
              </div>
              <div class="byte-quick byte-quick--teacher">
                <button type="button" (click)="askTeacherAnalytics()" [disabled]="busy()" title="Resumen analítico del progreso">
                  📊 Analizar Rendimiento
                </button>
                <button type="button" (click)="askTeacherQuizGen()" [disabled]="busy()" title="Diseñar examen o quiz técnico">
                  📝 Generar Evaluación
                </button>
                <button type="button" (click)="askTeacherAtRisk()" [disabled]="busy()" title="Estrategias para alumnos rezagados">
                  ⚠️ Alumnos en Riesgo
                </button>
                <button type="button" (click)="askTeacherPedagogy()" [disabled]="busy()" title="Sugerir retos y laboratorios prácticos">
                  💡 Sugerir Laboratorio
                </button>
              </div>
            </div>
          } @else if (lessonContext(); as ctx) {
            <!-- MODO ESTUDIANTE: Contexto de lección específica -->
            <div class="byte-context-row">
              <span class="byte-chip">🎯 Lección: {{ ctx.title }}</span>
              <div class="byte-quick">
                <button type="button" (click)="askHint()" [disabled]="busy()" title="Pista socrática sin dar la respuesta">
                  💡 Pista socrática
                </button>
                <button type="button" (click)="explainLesson()" [disabled]="busy()" title="Explicación conceptual detallada">
                  ✨ Explicar lección
                </button>
                <button type="button" (click)="practiceLesson()" [disabled]="busy()" title="Generar mini-quiz interactivo">
                  📝 Mini-Quiz
                </button>
                <button type="button" (click)="askRoadmap()" [disabled]="busy()" title="Siguiente paso formativo">
                  🧭 Siguiente paso
                </button>
              </div>
            </div>
          } @else {
            <!-- MODO ESTUDIANTE: Contexto general -->
            <div class="byte-context-row byte-context-row--global">
              <div class="byte-quick">
                <button type="button" (click)="askGeneralRoadmap()" [disabled]="busy()">
                  🧭 ¿Qué curso estudiar?
                </button>
                <button type="button" (click)="askGeneralTips()" [disabled]="busy()">
                  ⚡ Consejos de código
                </button>
                <button type="button" (click)="askCodeHelp()" [disabled]="busy()">
                  🐛 Depurar mi lógica
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
              <div class="byte-skeleton" aria-label="Cargando conversación">
                <div class="byte-skeleton__row">
                  <span class="skeleton byte-skeleton__avatar"></span>
                  <span class="skeleton byte-skeleton__line" style="width: 70%"></span>
                </div>
                <div class="byte-skeleton__row byte-skeleton__row--user">
                  <span class="skeleton byte-skeleton__line" style="width: 55%"></span>
                </div>
                <div class="byte-skeleton__row">
                  <span class="skeleton byte-skeleton__avatar"></span>
                  <span class="skeleton byte-skeleton__line" style="width: 80%"></span>
                </div>
              </div>
            }

            @if (loadError()) {
              <div class="byte-msg byte-msg--assistant">
                <div class="byte-bubble byte-bubble--error">
                  <p>No pude cargar tu conversación anterior.</p>
                  <button type="button" class="byte-retry" (click)="loadHistory()">Reintentar</button>
                </div>
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
                    <div class="typing-indicator" aria-label="Byte está escribiendo">
                      <span></span><span></span><span></span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Quiz interactivo inline -->
            @if (quiz(); as q) {
              <div class="byte-quiz">
                <div class="byte-quiz__head">
                  <span class="byte-quiz__icon" aria-hidden="true">📝</span>
                  <strong>{{ q.title }}</strong>
                  @if (quizScore(); as score) {
                    <span
                      class="byte-quiz__score"
                      [class.passed]="score.correct / score.total >= 0.6"
                      [attr.aria-label]="'Puntaje: ' + score.correct + ' de ' + score.total"
                    >{{ score.correct }}/{{ score.total }}</span>
                  }
                </div>

                @for (question of q.questions; track $index; let qi = $index) {
                  <div
                    class="byte-quiz__q"
                    [class.is-correct]="quizChecked() && isQCorrect(qi)"
                    [class.is-wrong]="quizChecked() && !isQCorrect(qi)"
                  >
                    <p class="byte-quiz__q-text">{{ qi + 1 }}. {{ question.question }}</p>
                    <div class="byte-quiz__opts" role="radiogroup" [attr.aria-label]="'Opciones de la pregunta ' + (qi + 1)">
                      @for (answer of question.answers; track $index) {
                        <label class="byte-quiz__opt" [class.selected]="quizSelections()[qi] === $index">
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
                      <div class="byte-quiz__verdict">
                        <span class="byte-quiz__tag" [class.tag-ok]="isQCorrect(qi)" [class.tag-ko]="!isQCorrect(qi)">
                          {{ isQCorrect(qi) ? '✓ Correcto' : '✗ Incorrecto' }}
                        </span>
                        <p>{{ question.explanation }}</p>
                      </div>
                    }
                  </div>
                }

                <div class="byte-quiz__foot">
                  @if (!quizChecked()) {
                    <button
                      type="button"
                      class="btn btn-primary"
                      (click)="checkQuiz()"
                      [disabled]="!allAnswered()"
                    >Comprobar respuestas</button>
                  } @else {
                    @if (quizScore(); as score) {
                      <p class="byte-quiz__final" [class.passed]="score.correct / score.total >= 0.6">
                        {{ score.correct >= score.total * 0.6 ? '¡Buen trabajo! 🎉' : 'Sigue practicando 💪' }}
                        Acertaste {{ score.correct }} de {{ score.total }}.
                      </p>
                    }
                    <div class="byte-quiz__actions">
                      <button type="button" class="btn btn-outline btn-sm" (click)="practiceLesson()" [disabled]="busy()">Más práctica</button>
                      <button type="button" class="btn btn-ghost btn-sm" (click)="dismissQuiz()">Seguir chateando</button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Barra de Entrada Flotante y Estilizada -->
          <div class="byte-input-area" [class.byte-input-area--teacher]="isTeacherMode()">
            <div class="byte-input-container">
              <textarea
                #byteInput
                class="byte-input"
                [(ngModel)]="inputText"
                [placeholder]="isTeacherMode() ? 'Pregunta a Byte sobre evaluaciones, métricas o pedagogía…' : 'Pregúntale a Byte sobre código o tu ruta…'"
                rows="1"
                (keydown.enter)="onEnter($event)"
                [disabled]="streaming()"
                [attr.aria-label]="'Escribe un mensaje a Byte'"
              ></textarea>
              <button
                class="byte-input__send"
                [class.byte-input__send--teacher]="isTeacherMode()"
                type="button"
                (click)="sendText()"
                [disabled]="!inputText.trim() || busy()"
                aria-label="Enviar mensaje"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                  <path d="M3.4 20.6L21.7 12 3.4 3.4l2.4 7.1 9.2 1.5-9.2 1.5-2.4 7.1z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="byte-input-hint">
              <span>Shift + Enter para salto de línea</span>
              @if (isTeacherMode()) {
                <span class="byte-mode-indicator">Modo Académico Activo</span>
              }
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

    /* Popping Speech Bubble (Globitos de texto dinámicos) */
    .byte-speech-bubble {
      pointer-events: auto;
      position: relative;
      margin-bottom: 6px;
      margin-right: 12px;
      max-width: 255px;
      padding: 10px 14px;
      background: rgba(11, 15, 26, 0.96);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(0, 217, 255, 0.45);
      border-radius: 16px;
      box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 18px rgba(0, 217, 255, 0.2);
      color: #E2E8F0;
      font-size: 0.8rem;
      font-weight: 500;
      line-height: 1.35;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      user-select: none;
      animation: bubble-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

      &--teacher {
        border-color: rgba(16, 185, 129, 0.55);
        box-shadow: 0 10px 32px rgba(0, 0, 0, 0.65), 0 0 20px rgba(16, 185, 129, 0.25);
      }

      &:hover {
        transform: translateY(-2px) scale(1.02);
        border-color: #00D9FF;
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.75), 0 0 24px rgba(0, 217, 255, 0.4);
      }

      .bubble-icon {
        font-size: 1.15rem;
        line-height: 1;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .bubble-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .bubble-tag {
        font-size: 0.65rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #10B981;
        letter-spacing: 0.05em;
      }
      .bubble-text {
        color: #F1F5F9;
      }
      .bubble-tail {
        position: absolute;
        bottom: -6px;
        right: 42px;
        width: 10px;
        height: 10px;
        background: rgba(11, 15, 26, 0.96);
        border-right: 1px solid rgba(0, 217, 255, 0.45);
        border-bottom: 1px solid rgba(0, 217, 255, 0.45);
        transform: rotate(45deg);
      }
      &--teacher .bubble-tail {
        border-right-color: rgba(16, 185, 129, 0.55);
        border-bottom-color: rgba(16, 185, 129, 0.55);
      }
    }

    @keyframes bubble-pop-in {
      0% {
        opacity: 0;
        transform: translateY(12px) scale(0.85);
      }
      70% {
        opacity: 1;
        transform: translateY(-3px) scale(1.04);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Freestanding 3D WebGL Actor */
    app-byte-robot-3d {
      pointer-events: auto;
      display: block;
      filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
      transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1);

      &:hover {
        transform: translateY(-2px) scale(1.02);
      }
    }

    /* Avatar reutilizable */
    .byte-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .byte-avatar {
      display: inline-flex;
      border-radius: 50%;
      background: linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%);
      overflow: hidden;
      flex-shrink: 0;
      &--head {
        width: 36px;
        height: 36px;
        box-shadow: 0 0 14px rgba(0, 217, 255, 0.4);
      }
      &--teacher {
        background: linear-gradient(135deg, #10B981 0%, #00D9FF 100%);
        box-shadow: 0 0 14px rgba(16, 185, 129, 0.45);
      }
      &--auth { width: 84px; height: 84px; box-shadow: var(--shadow-primary); }
      svg { display: block; }
    }
    .byte-online-badge {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #0B0F19;
      box-shadow: 0 0 8px #10B981;
    }

    /* ================= PANEL ULTRA-PREMIUM ================= */
    .byte-panel {
      position: fixed;
      right: 24px;
      bottom: 145px;
      z-index: 1210;
      width: 410px;
      max-width: calc(100vw - 32px);
      max-height: min(76vh, 620px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(10, 14, 26, 0.95);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 217, 255, 0.26);
      border-radius: 22px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(0, 217, 255, 0.15);
      outline: none;
      animation: byte-panel-in 260ms cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;

      &--teacher {
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(16, 185, 129, 0.16);
      }
    }

    @keyframes byte-panel-in {
      from { opacity: 0; transform: translateY(16px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    .byte-panel__head {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(18, 24, 42, 0.96) 0%, rgba(12, 16, 30, 0.96) 100%);
      flex-shrink: 0;

      &--teacher {
        background: linear-gradient(180deg, rgba(14, 28, 42, 0.96) 0%, rgba(10, 20, 32, 0.96) 100%);
        border-bottom-color: rgba(16, 185, 129, 0.22);
      }
    }
    .byte-panel__who {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
      strong {
        font-size: 0.96rem;
        font-weight: 700;
        color: #F8FAFC;
        letter-spacing: -0.01em;
      }
    }
    .byte-panel__title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .byte-agent-badge {
      font-size: 0.62rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 2px 7px;
      border-radius: 9999px;
      background: linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(108, 99, 255, 0.2));
      border: 1px solid rgba(0, 217, 255, 0.45);
      color: #00D9FF;

      &--teacher {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0, 217, 255, 0.2));
        border-color: rgba(16, 185, 129, 0.5);
        color: #10B981;
      }
    }

    .byte-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: #94A3B8;
      &__dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #00D9FF;
        box-shadow: 0 0 8px #00D9FF;
        &--teacher {
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }
      }
      &__dots {
        display: inline-flex; gap: 3px; align-items: center;
        span {
          width: 4px; height: 4px; border-radius: 50%;
          background: #00D9FF;
          animation: byte-dot-bounce 1.2s ease-in-out infinite;
          &:nth-child(2) { animation-delay: 0.15s; }
          &:nth-child(3) { animation-delay: 0.3s; }
        }
      }
      &.writing { color: #00D9FF; }
    }
    @keyframes byte-dot-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .byte-panel__head-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .mode-toggle-btn {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.06);
      color: #E2E8F0;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: #00D9FF;
        color: #00D9FF;
        transform: translateY(-1px);
      }
      &.is-teacher {
        border-color: rgba(16, 185, 129, 0.4);
        color: #10B981;
        background: rgba(16, 185, 129, 0.1);
        &:hover {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10B981;
        }
      }
    }

    .byte-head-btn,
    .byte-panel__close {
      width: 28px; height: 28px;
      display: grid; place-items: center;
      border: none; border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: #94A3B8;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s ease;
      &:hover { background: rgba(255, 255, 255, 0.12); color: #FFFFFF; }
      &:focus-visible { outline: 2px solid #00D9FF; outline-offset: 1px; }
    }

    /* Banner offline */
    .byte-banner {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 14px;
      font-size: 0.75rem;
      color: #FCD34D;
      background: rgba(245, 158, 11, 0.12);
      border-bottom: 1px solid rgba(245, 158, 11, 0.25);
      flex-shrink: 0;
      p { flex: 1; line-height: 1.4; margin: 0; }
      button {
        border: none; background: none; color: inherit;
        cursor: pointer; font-size: 0.75rem;
        &:hover { opacity: 0.7; }
      }
    }

    /* Auth gate */
    .byte-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 48px 24px;
      text-align: center;
      &__text { color: #94A3B8; font-size: 0.88rem; }
    }

    /* Contexto de lección & Acciones Rápidas */
    .byte-context-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(14, 20, 36, 0.6);
      flex-shrink: 0;

      &--teacher {
        background: rgba(12, 24, 38, 0.65);
        border-bottom-color: rgba(16, 185, 129, 0.15);
      }
    }
    .teacher-role-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #10B981;
      letter-spacing: 0.03em;
      text-transform: uppercase;
    }
    .byte-chip {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
      padding: 4px 10px;
      font-size: 0.72rem;
      font-weight: 600;
      color: #00D9FF;
      background: rgba(0, 217, 255, 0.1);
      border: 1px solid rgba(0, 217, 255, 0.28);
      border-radius: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .byte-quick {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      button {
        flex: 1 1 calc(50% - 6px);
        min-width: 130px;
        padding: 7px 10px;
        font-size: 0.74rem;
        font-weight: 600;
        font-family: inherit;
        color: #E2E8F0;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
        &:hover:not(:disabled) {
          border-color: #00D9FF;
          color: #00D9FF;
          background: rgba(0, 217, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 217, 255, 0.2);
        }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:focus-visible { outline: 2px solid #00D9FF; outline-offset: 1px; }
      }

      &--teacher button {
        &:hover:not(:disabled) {
          border-color: #10B981;
          color: #10B981;
          background: rgba(16, 185, 129, 0.12);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
      }
    }

    /* Mensajes */
    .byte-msgs {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overscroll-behavior: contain;

      &::-webkit-scrollbar {
        width: 5px;
      }
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(0, 217, 255, 0.25);
        border-radius: 10px;
      }
    }
    .byte-msg {
      display: flex;
      animation: msg-fade-in 0.2s ease-out;
      &--user { justify-content: flex-end; }
      &--assistant { justify-content: flex-start; }
    }
    @keyframes msg-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .byte-bubble {
      max-width: 88%;
      padding: 11px 15px;
      font-size: 0.84rem;
      line-height: 1.6;
      border-radius: 18px;
      color: #F1F5F9;
      word-break: break-word;

      &--assistant {
        background: rgba(18, 24, 40, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 3px solid #00D9FF;
        border-radius: 18px 18px 18px 4px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
      }
      &--teacher {
        border-left-color: #10B981 !important;
      }
      &--user {
        background: linear-gradient(135deg, #00B4D8 0%, #6C63FF 100%);
        color: #FFFFFF;
        font-weight: 500;
        border: none;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 4px 14px rgba(108, 99, 255, 0.3);
      }
      &--error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-left: 3px solid #EF4444;
        display: flex;
        flex-direction: column;
        gap: 8px;
        p { color: #FCA5A5; margin: 0; }
      }
      &--stream { min-width: 80px; }
      p { margin: 0; }
      .user-text-content {
        margin: 0;
        color: #FFFFFF;
        font-weight: 500;
      }
    }
    .byte-markdown {
      white-space: pre-wrap;
    }
    .byte-markdown :deep(code),
    .byte-markdown :deep(.byte-inline-code) {
      font-family: 'JetBrains Mono', monospace, monospace;
      font-size: 0.82em;
      background: rgba(0, 217, 255, 0.08);
      border: 1px solid rgba(0, 217, 255, 0.25);
      border-radius: 5px;
      padding: 1px 6px;
      color: #00D9FF;
    }
    .byte-markdown :deep(strong) { color: #FFFFFF; font-weight: 700; }
    .byte-markdown :deep(ul), .byte-markdown :deep(ol) {
      margin: 6px 0;
      padding-left: 18px;
    }
    .byte-markdown :deep(li) {
      margin-bottom: 4px;
    }

    /* Botones de acción agéntica dentro del chat */
    .byte-markdown :deep(.byte-action-card) {
      margin: 10px 0 6px;
    }
    .byte-markdown :deep(.btn-agent-nav) {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 10px;
      background: linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #080C16;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0, 217, 255, 0.35);
      transition: all 0.2s ease;
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(0, 217, 255, 0.5);
      }
      .arrow { transition: transform 0.2s ease; }
      &:hover .arrow { transform: translateX(3px); }
    }

    /* Bloques de código */
    .byte-markdown :deep(.byte-code-card) {
      margin: 10px 0;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #090C16;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }
    .byte-markdown :deep(.byte-code-bar) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .byte-markdown :deep(.byte-code-lang) {
      font-family: monospace;
      font-size: 0.68rem;
      font-weight: 800;
      color: #00D9FF;
      letter-spacing: 0.06em;
    }
    .byte-markdown :deep(.byte-code-copy) {
      border: none;
      background: transparent;
      color: #94A3B8;
      font-size: 0.72rem;
      cursor: pointer;
      padding: 2px 8px;
      border-radius: 6px;
      transition: all 0.15s ease;
      &:hover {
        color: #FFFFFF;
        background: rgba(255, 255, 255, 0.1);
      }
    }
    .byte-markdown :deep(.byte-code-pre) {
      margin: 0;
      padding: 10px 14px;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      color: #E2E8F0;
      code {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
        color: inherit !important;
        font-family: inherit !important;
      }
    }

    .byte-retry {
      align-self: flex-start;
      padding: 5px 12px;
      font-size: 0.74rem;
      font-weight: 600;
      color: #EF4444;
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      &:hover { background: rgba(239, 68, 68, 0.15); }
    }

    /* Skeleton */
    .byte-skeleton {
      display: flex;
      flex-direction: column;
      gap: 12px;
      &__row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        &--user { justify-content: flex-end; }
      }
      &__avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; background: rgba(255,255,255,0.06); }
      &__line { height: 40px; border-radius: 16px; background: rgba(255,255,255,0.06); }
    }

    /* Typing dots */
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 20px;
      span {
        width: 6px; height: 6px;
        background: #00D9FF;
        border-radius: 50%;
        animation: typing-bounce 1.4s ease-in-out infinite;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }
    @keyframes typing-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    .stream-cursor {
      color: #00D9FF;
      animation: cursor-blink 1s step-end infinite;
    }
    @keyframes cursor-blink {
      0%, 100% { opacity: 1; }
      50%      { opacity: 0; }
    }

    /* ================= QUIZ INLINE ================= */
    .byte-quiz {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px;
      background: rgba(16, 22, 38, 0.9);
      border: 1px solid rgba(0, 217, 255, 0.25);
      border-radius: 16px;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      animation: byte-panel-in 220ms cubic-bezier(0.21, 1.02, 0.73, 1);
    }
    .byte-quiz__head {
      display: flex;
      align-items: center;
      gap: 8px;
      .byte-quiz__icon { font-size: 1.1rem; flex-shrink: 0; }
      strong { font-size: 0.88rem; color: #FFFFFF; flex: 1; }
    }
    .byte-quiz__score {
      font-size: 0.74rem;
      font-weight: 800;
      padding: 2px 10px;
      border-radius: 6px;
      color: #FCD34D;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      &.passed { color: #10B981; background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); }
    }
    .byte-quiz__q {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      background: rgba(24, 32, 54, 0.6);
      transition: border-color 0.2s ease;
      &.is-correct { border-color: rgba(16, 185, 129, 0.5); }
      &.is-wrong   { border-color: rgba(239, 68, 68, 0.5); }
    }
    .byte-quiz__q-text {
      font-size: 0.82rem;
      font-weight: 600;
      color: #F1F5F9;
      line-height: 1.45;
    }
    .byte-quiz__opts {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .byte-quiz__opt {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      font-size: 0.8rem;
      color: #CBD5E1;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      input { accent-color: #00D9FF; cursor: pointer; flex-shrink: 0; }
      &:hover { border-color: #00D9FF; color: #FFFFFF; }
      &.selected {
        border-color: #00D9FF;
        background: rgba(0, 217, 255, 0.12);
        color: #FFFFFF;
      }
      &:has(input:disabled) { cursor: default; opacity: 0.85; }
    }
    .byte-quiz__verdict {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.74rem;
      color: #94A3B8;
      line-height: 1.5;
      .byte-quiz__tag {
        align-self: flex-start;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 6px;
        &.tag-ok { color: #10B981; background: rgba(16, 185, 129, 0.15); }
        &.tag-ko { color: #EF4444; background: rgba(239, 68, 68, 0.15); }
      }
    }
    .byte-quiz__foot {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
      .byte-quiz__final {
        text-align: center;
        font-size: 0.82rem;
        font-weight: 600;
        color: #CBD5E1;
        &.passed { color: #10B981; }
      }
      .byte-quiz__actions {
        display: flex;
        gap: 8px;
        button { flex: 1; justify-content: center; font-size: 0.76rem; }
      }
    }

    /* ================= BARRA DE ENTRADA ULTRA-PREMIUM ================= */
    .byte-input-area {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 12px 16px;
      background: linear-gradient(180deg, rgba(12, 16, 28, 0.95) 0%, rgba(8, 12, 22, 0.98) 100%);
      border-top: 1px solid rgba(255, 255, 255, 0.07);
      flex-shrink: 0;

      &--teacher {
        border-top-color: rgba(16, 185, 129, 0.18);
      }
    }
    .byte-input-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(20, 28, 48, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 4px 6px 4px 12px;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: #00D9FF;
        box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.22);
        background: rgba(24, 34, 58, 0.9);
      }
    }
    .byte-input-area--teacher .byte-input-container:focus-within {
      border-color: #10B981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.22);
    }

    .byte-input {
      flex: 1;
      resize: none;
      max-height: 95px;
      background: transparent;
      border: none;
      padding: 8px 0;
      color: #FFFFFF;
      font-size: 0.84rem;
      font-family: inherit;
      line-height: 1.45;
      outline: none;
      &::placeholder { color: #64748B; }
      &:disabled { opacity: 0.6; }
    }

    .byte-input__send {
      flex-shrink: 0;
      width: 38px; height: 38px;
      display: grid; place-items: center;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #00D9FF 0%, #6C63FF 100%);
      color: #080C16;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 2px 10px rgba(0, 217, 255, 0.35);

      &:hover:not(:disabled) {
        transform: scale(1.06);
        box-shadow: 0 4px 16px rgba(0, 217, 255, 0.55);
      }
      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &:focus-visible { outline: 2px solid #00D9FF; outline-offset: 2px; }

      &--teacher {
        background: linear-gradient(135deg, #10B981 0%, #00D9FF 100%);
        box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
        &:hover:not(:disabled) {
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.55);
        }
      }
    }

    .byte-input-hint {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.65rem;
      color: #64748B;
      padding: 0 4px;
    }
    .byte-mode-indicator {
      color: #10B981;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    /* ================= MOBILE ================= */
    @media (max-width: 560px) {
      .byte-freewalk-zone {
        right: 12px;
        bottom: 8px;
      }
      .byte-panel {
        right: 12px;
        left: 12px;
        bottom: 135px;
        width: auto;
        max-width: none;
        max-height: calc(100dvh - 160px);
      }
    }

    /* ================= REDUCED MOTION ================= */
    @media (prefers-reduced-motion: reduce) {
      .byte-status__dots span,
      .typing-indicator span,
      .stream-cursor { animation: none; }
      .byte-panel { animation: none; }
    }
  `],
})
export class AiCompanionComponent implements OnInit, OnDestroy, AfterViewChecked {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private ai     = inject(AiChatService);

  @ViewChild('byteMessages') private messagesEl!: ElementRef;
  @ViewChild('byteInput') private inputEl!: ElementRef<HTMLTextAreaElement>;

  // UI state
  hidden        = signal(false);
  open          = signal(false);
  authRequired  = signal(false);
  loading       = signal(false);
  loadError     = signal(false);
  offline       = signal(false);
  busy          = signal(false);
  streaming     = signal(false);
  assistantStream = signal('');
  status        = signal<'online' | 'writing'>('online');

  // Robot 3D Actor State & Dynamic Speech Bubbles
  isHovered          = signal(false);
  currentBubbleIndex = signal(0);
  private bubbleTimer?: any;

  // Teacher / Student Role & Mode Detection
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

  // Manual Mode Switcher (para que el docente pueda alternar vista en el chat)
  teacherModeOverride = signal<'auto' | 'teacher' | 'student'>('auto');

  readonly isTeacherMode = computed(() => {
    if (this.teacherModeOverride() === 'teacher') return true;
    if (this.teacherModeOverride() === 'student') return false;
    // Auto: Si está en la ruta docente o es profesor fuera de una lección particular
    return this.isTeacherRoute() || (this.isTeacher() && !this.lessonContext());
  });

  // Tips Específicos para Estudiantes
  readonly studentTips = [
    { icon: '💡', text: '¡Un algoritmo es una receta paso a paso para resolver un problema!' },
    { icon: '⚡', text: 'Tip: Usa nombres claros en tus variables (ej: userScore vs x).' },
    { icon: '🐛', text: '¿Sabías que el primer "bug" de la historia fue una polilla real en 1947?' },
    { icon: '🚀', text: '¡Aprender a programar es desbloquear un superpoder! Pregúntame lo que sea.' },
    { icon: '☕', text: '¿Dudas con bucles, arrays o POO? ¡Haz clic en mí y practicamos!' },
    { icon: '🎯', text: 'La práctica constante hace al maestro: a programar se aprende programando.' },
    { icon: '🛡️', text: 'Regla de oro: valida siempre los datos de entrada en tus sistemas.' },
    { icon: '🧠', text: 'Divide y vencerás: descompón problemas complejos en funciones limpias.' },
  ];

  // Tips Específicos para Docentes
  readonly teacherTips = [
    { icon: '🎓', text: 'La retroalimentación formativa inmediata eleva la retención de los alumnos un 40%.' },
    { icon: '📊', text: 'Supervisa el progreso y promedio evaluativo en tiempo real desde el Panel Docente.' },
    { icon: '📝', text: '¿Necesitas redactar un quiz o examen? Haz clic en mí y lo genero al instante.' },
    { icon: '💡', text: 'Fomenta el aprendizaje práctico: el IDE interactivo permite evaluar código en vivo.' },
    { icon: '🎯', text: 'Supervisa a los estudiantes con pendientes de verificación en el Directorio.' },
    { icon: '🚀', text: '¡Hola Profesor! Estoy listo para apoyarte con analítica y diseño pedagógico.' },
  ];

  currentBubbleMessage = computed(() => {
    const list = this.isTeacherMode() ? this.teacherTips : this.studentTips;
    return list[this.currentBubbleIndex() % list.length];
  });

  // Chat
  messages       = signal<PanelMsg[]>([]);
  conversationId = signal<number | null>(null);
  inputText      = '';

  // Contexto de lección
  lessonContext  = signal<{ id: number; title: string } | null>(null);
  quickActions   = signal(false);

  // Quiz
  quiz           = signal<AiPracticeQuiz | null>(null);
  quizSelections = signal<Record<number, number>>({});
  quizChecked    = signal(false);
  quizScore      = signal<{ correct: number; total: number } | null>(null);

  private routerSub?: Subscription;
  private companionHandler: EventListener = (event: Event) => {
    const detail = (event as CustomEvent<{ lesson_id?: number; lesson_title?: string }>).detail ?? {};
    this.onCompanionOpen(detail);
  };

  // ================= Lifecycle =================
  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncRoute());
    window.addEventListener('ai-companion:open', this.companionHandler);
    this.syncRoute();

    // Ciclo dinámico de globitos de texto
    this.bubbleTimer = setInterval(() => {
      this.currentBubbleIndex.update(idx => idx + 1);
    }, 7500);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    window.removeEventListener('ai-companion:open', this.companionHandler);
    if (this.bubbleTimer) {
      clearInterval(this.bubbleTimer);
    }
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

  // ================= Alternar Modo Docente / Alumno =================
  toggleMode() {
    const current = this.isTeacherMode();
    this.teacherModeOverride.set(current ? 'student' : 'teacher');
    this.conversationId.set(null);
    this.messages.set([]);
    this.ensureConversationLoaded();
  }

  // ================= Apertura / Cierre =================
  togglePanel() {
    if (this.open()) this.closePanel();
    else this.openPanel();
  }

  openPanel() {
    this.open.set(true);
    if (!this.auth.getToken()) {
      this.authRequired.set(true);
      return;
    }
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

  private getConversationTitle(): string {
    return this.isTeacherMode() ? 'Asistente Académico Docente' : 'Compañero Estudiante';
  }

  resetConversation() {
    localStorage.removeItem(this.getStorageKey());
    this.conversationId.set(null);
    this.messages.set([]);
    this.maybeGreet();
  }

  /** Carga el historial si existe id persistido; si no, deja lista una conversación nueva. */
  private ensureConversationLoaded() {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored && !this.conversationId()) {
      this.loading.set(true);
      this.loadError.set(false);
      this.ai.getConversation(Number(stored)).subscribe({
        next: conv => {
          this.conversationId.set(conv.id);
          this.messages.set((conv.messages ?? []).map(m => this.toPanelMsg(m)));
          this.loading.set(false);
          this.ensureContextBubble();
          this.maybeGreet();
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          if (err.status === 401 || !this.auth.getToken()) {
            this.authRequired.set(true);
          } else {
            localStorage.removeItem(key);
            this.conversationId.set(null);
            this.loadError.set(true);
          }
        },
      });
    } else {
      this.loading.set(false);
      this.maybeGreet();
    }
  }

  loadHistory() {
    this.loadError.set(false);
    this.ensureConversationLoaded();
  }

  private maybeGreet() {
    if (this.messages().length === 0) {
      if (this.isTeacherMode()) {
        this.pushMessage(
          'assistant',
          '¡Bienvenido, **Profesor**! 🎓 Soy **Byte Académico**, tu asistente pedagógico en SysEngAcademy.\n\nPuedo apoyarte con analítica de tus estudiantes, redacción de evaluaciones técnicas y quizzes, planificación didáctica o diseño de lecciones de programación prácticas. ¿Qué gestión académica deseas realizar hoy?'
        );
      } else {
        this.pushMessage(
          'assistant',
          '¡Hola! Soy **Byte**, tu Mentor IA en SysEngAcademy 🚀.\n\nPuedo guiarte con **pistas socráticas**, diagnosticar fallos en tu código, explicarte conceptos en profundidad o sugerirte el siguiente paso en tu ruta formativa. ¿En qué te ayudo hoy?'
        );
      }
    }
  }

  // ================= Evento del Player =================
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
    const text = `Estamos en «${ctx.title}». ¿Cómo te ayudo?`;
    this.messages.update(msgs => {
      const cleaned = msgs.filter(m => m.id !== CONTEXT_MSG_ID);
      return [...cleaned, { id: CONTEXT_MSG_ID, role: 'assistant' as const, content: text, html: this.renderMarkdown(text) }];
    });
  }

  // ================= Envío (streaming) =================
  async sendText() {
    const content = this.inputText.trim();
    if (!content || this.busy()) return;
    if (!this.auth.getToken()) { this.authRequired.set(true); return; }

    this.busy.set(true);
    this.offline.set(false);

    try {
      let convId = this.conversationId();
      if (!convId) {
        const conv = await firstValueFrom(this.ai.createConversation(this.getConversationTitle()));
        convId = conv.id;
        this.conversationId.set(convId);
        localStorage.setItem(this.getStorageKey(), String(convId));
      }

      this.pushMessage('user', content);
      this.inputText = '';
      this.streaming.set(true);
      this.assistantStream.set('');

      try {
        // En modo docente enriquecemos la consulta si es relevante
        const queryPayload = this.isTeacherMode() && !content.toLowerCase().startsWith('como profesor')
          ? `[Rol: Docente/Instructor de SysEngAcademy] ${content}`
          : content;

        const full = await this.ai.streamMessage(convId, queryPayload, delta =>
          this.assistantStream.update(t => t + delta)
        );
        if (full) this.pushMessage('assistant', full);
      } catch (streamErr) {
        this.handleSendError(streamErr);
      }
    } catch (createErr) {
      this.handleSendError(createErr);
    } finally {
      this.streaming.set(false);
      this.busy.set(false);
      this.assistantStream.set('');
    }
  }

  private handleSendError(err: unknown) {
    if (this.isUnauthorized(err)) {
      this.authRequired.set(true);
    } else if (this.isNetworkError(err)) {
      this.offline.set(true);
    } else {
      this.pushMessage('assistant', 'Ups, algo salió mal y Byte no pudo responder. Inténtalo de nuevo.', { error: true });
    }
  }

  // ================= Acciones Rápidas para Docentes =================
  askTeacherAnalytics() {
    if (this.busy()) return;
    this.inputText = 'Como asistente académico, analiza el rendimiento general de los estudiantes en la plataforma (promedio de quizzes, avance en cursos y métricas clave) y dame 3 recomendaciones pedagógicas prioritarias.';
    this.sendText();
  }

  askTeacherQuizGen() {
    if (this.busy()) return;
    this.inputText = 'Ayúdame a redactar una evaluación técnica para mis estudiantes sobre Fundamentos de Algoritmos y Estructuras de Datos. Proponme 3 preguntas teóricas con opciones múltiples y 2 ejercicios prácticos de lógica de programación.';
    this.sendText();
  }

  askTeacherAtRisk() {
    if (this.busy()) return;
    this.inputText = '¿Qué estrategias didácticas y de acompañamiento me recomiendas aplicar para identificar y motivar a estudiantes con bajo rendimiento o inactividad en la academia?';
    this.sendText();
  }

  askTeacherPedagogy() {
    if (this.busy()) return;
    this.inputText = 'Propón 2 laboratorios prácticos basados en problemas de la industria real (ej: desarrollo web, APIs o algoritmos) para integrar en las lecciones interactivas.';
    this.sendText();
  }

  // ================= Acciones Rápidas de Lección / Estudiantes =================
  explainLesson() {
    const ctx = this.lessonContext();
    if (!ctx || this.busy()) return;
    this.quickActions.set(false);
    this.pushMessage('user', 'Explícame esta lección con ejemplos');
    this.busy.set(true);
    this.offline.set(false);
    this.ai.askAI({
      lesson_id: ctx.id,
      kind: 'explain',
      question: 'Explícame esta lección con ejemplos',
    }).subscribe({
      next: res => {
        const text = res.reply?.trim() || 'No obtuve una explicación. Inténtalo de nuevo.';
        this.pushMessage('assistant', text);
      },
      error: err => this.handleActionError(err),
    }).add(() => this.endBusy());
  }

  practiceLesson() {
    const ctx = this.lessonContext();
    if (!ctx || this.busy()) return;
    this.quickActions.set(false);
    this.pushMessage('user', 'Genera práctica para esta lección');
    this.busy.set(true);
    this.offline.set(false);
    this.ai.practice(ctx.id, 3).subscribe({
      next: quiz => {
        this.quiz.set(quiz);
        this.quizSelections.set({});
        this.quizChecked.set(false);
        this.quizScore.set(null);
      },
      error: err => this.handleActionError(err),
    }).add(() => this.endBusy());
  }

  askHint() {
    const ctx = this.lessonContext();
    if (!ctx || this.busy()) return;
    this.pushMessage('user', '💡 Dame una pista socrática para entender mejor');
    this.busy.set(true);
    this.offline.set(false);
    this.ai.askAI({
      lesson_id: ctx.id,
      kind: 'hint',
      question: 'Dame una pista socrática para avanzar en esta lección sin darme la solución completa.',
    }).subscribe({
      next: res => {
        const text = res.reply?.trim() || 'Analiza el flujo de ejecución paso a paso.';
        this.pushMessage('assistant', text);
      },
      error: err => this.handleActionError(err),
    }).add(() => this.endBusy());
  }

  askRoadmap() {
    const ctx = this.lessonContext();
    if (!ctx || this.busy()) return;
    this.pushMessage('user', '🧭 ¿Cuál es el siguiente paso en mi formación?');
    this.busy.set(true);
    this.offline.set(false);
    this.ai.askAI({
      lesson_id: ctx.id,
      kind: 'roadmap',
      question: 'Indícame qué temas o lecciones complementan lo aprendido y cuál es el siguiente paso.',
    }).subscribe({
      next: res => {
        const text = res.reply?.trim() || 'Sigue con la siguiente lección para consolidar tus conocimientos.';
        this.pushMessage('assistant', text);
      },
      error: err => this.handleActionError(err),
    }).add(() => this.endBusy());
  }

  askGeneralRoadmap() {
    if (this.busy()) return;
    this.inputText = '¿Qué ruta o curso me recomiendas para comenzar en SysEngAcademy?';
    this.sendText();
  }

  askGeneralTips() {
    if (this.busy()) return;
    this.inputText = 'Dame 3 consejos clave de ingeniería de software para programar con mejores prácticas.';
    this.sendText();
  }

  askCodeHelp() {
    if (this.busy()) return;
    this.inputText = '¿Cuáles son los errores de código más frecuentes en programación y qué técnica recomiendas para depurarlos paso a paso?';
    this.sendText();
  }

  askDailyChallenge() {
    if (this.busy()) return;
    this.inputText = '¡Plantea un desafío de código del día para poner a prueba mi lógica de programación!';
    this.sendText();
  }

  onMessagesClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    // Acción de navegación agéntica [data-action-nav]
    const navBtn = target.closest<HTMLButtonElement>('[data-action-nav]');
    if (navBtn) {
      const url = navBtn.getAttribute('data-action-nav');
      if (url) {
        this.router.navigateByUrl(url);
        this.closePanel();
      }
      return;
    }

    // Botón copiar código [data-copy]
    const copyBtn = target.closest<HTMLButtonElement>('[data-copy]');
    if (copyBtn) {
      const rawCode = copyBtn.getAttribute('data-copy') || '';
      try {
        const parser = new DOMParser();
        const decoded = parser.parseFromString(rawCode, 'text/html').body.textContent || rawCode;
        navigator.clipboard?.writeText(decoded);
      } catch {
        navigator.clipboard?.writeText(rawCode);
      }
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '¡Copiado! ✓';
      setTimeout(() => { copyBtn.textContent = originalText; }, 1800);
      return;
    }
  }

  private handleActionError(err: unknown) {
    if (this.isUnauthorized(err)) this.authRequired.set(true);
    else if (this.isNetworkError(err)) this.offline.set(true);
    else this.pushMessage('assistant', 'No pude completar esa acción. Inténtalo de nuevo.', { error: true });
  }

  private endBusy() {
    this.busy.set(false);
  }

  // ================= Quiz =================
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

  // ================= Utilidades =================
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

    // Formatear acciones de navegación del agente: [ACTION:NAVIGATE:/path:Label]
    processed = processed.replace(
      /\[ACTION:NAVIGATE:([^:]+):([^\]]+)\]/g,
      '<div class="byte-action-card"><button type="button" class="btn-agent-nav" data-action-nav="$1"><span>$2</span> <span class="arrow">→</span></button></div>'
    );

    // Negritas y código en línea
    processed = processed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="byte-inline-code">$1</code>');

    // Restaurar bloques de código
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

  private isUnauthorized(err: unknown): boolean {
    if (err instanceof HttpErrorResponse) return err.status === 401;
    return /401/.test(err instanceof Error ? err.message : String(err));
  }

  private isNetworkError(err: unknown): boolean {
    if (err instanceof TypeError) return true;
    if (err instanceof HttpErrorResponse) return err.status === 0;
    return false;
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
    }, 90);
  }
}