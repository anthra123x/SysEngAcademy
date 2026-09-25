import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  inject,
  signal,
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
const STORAGE_KEY = 'byte-conversation-id';
const CONVERSATION_TITLE = 'Compañero';

@Component({
  selector: 'app-ai-companion',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <!-- ===== FAB (se oculta en /asistente y /auth/*) ===== -->
    @if (!hidden()) {
      <button
        class="byte-fab"
        type="button"
        [attr.aria-expanded]="open()"
        aria-haspopup="dialog"
        (click)="togglePanel()"
      >
        <span class="byte-fab__ping" aria-hidden="true"></span>
        <span class="byte-avatar byte-avatar--fab" aria-hidden="true">
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
        </span>
        <span class="byte-fab__tooltip" role="tooltip">Byte, tu compañero IA</span>
      </button>
    }

    <!-- ===== PANEL DE CHAT ===== -->
    @if (open()) {
      <section
        class="byte-panel"
        id="byte-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Chat con Byte"
        (keydown.escape)="closePanel()"
        tabindex="-1"
      >
        <!-- Cabecera -->
        <header class="byte-panel__head">
          <div class="byte-avatar byte-avatar--head" aria-hidden="true">
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
          <div class="byte-panel__who">
            <strong>Byte</strong>
            <div class="byte-status" [class.writing]="busy()">
              @if (busy()) {
                <span class="byte-status__dots" aria-hidden="true"><span></span><span></span><span></span></span>
                <span>escribiendo…</span>
              } @else {
                <span class="byte-status__dot" aria-hidden="true"></span>
                <span>en línea</span>
              }
            </div>
          </div>
          <button class="byte-panel__close" type="button" (click)="closePanel()" aria-label="Cerrar chat con Byte">✕</button>
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
            <p class="byte-auth__text">Inicia sesión para chatear conmigo 😊</p>
            <a class="btn btn-primary" routerLink="/auth/login" (click)="closePanel()">Iniciar sesión</a>
          </div>
        } @else {
          <!-- Contexto de lección: chip + acciones rápidas -->
          @if (lessonContext(); as ctx) {
            <div class="byte-context-row">
              <span class="byte-chip">📖 Lección: {{ ctx.title }}</span>
              @if (quickActions()) {
                <div class="byte-quick">
                  <button type="button" (click)="explainLesson()" [disabled]="busy()">✨ Explícame</button>
                  <button type="button" (click)="practiceLesson()" [disabled]="busy()">📝 Genera práctica</button>
                </div>
              }
            </div>
          }

          <!-- Historial / burbujas -->
          <div class="byte-msgs" #byteMessages>
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
                <div class="byte-bubble" [class.byte-bubble--user]="msg.role === 'user'" [class.byte-bubble--error]="msg.error">
                  @if (msg.error) {
                    <p>{{ msg.content }}</p>
                  } @else if (msg.role === 'assistant') {
                    <div class="byte-markdown" [innerHTML]="msg.html ?? ''"></div>
                  } @else {
                    <p>{{ msg.content }}</p>
                  }
                </div>
              </div>
            }

            <!-- Pensando / streaming -->
            @if (busy() && !quiz()) {
              <div class="byte-msg byte-msg--assistant">
                <div class="byte-bubble byte-bubble--stream">
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

          <!-- Input -->
          <div class="byte-input-area">
            <textarea
              #byteInput
              class="byte-input"
              [(ngModel)]="inputText"
              placeholder="Escribe tu pregunta…"
              rows="1"
              (keydown.enter)="onEnter($event)"
              [disabled]="streaming()"
              [attr.aria-label]="'Escribe un mensaje a Byte'"
            ></textarea>
            <button
              class="byte-input__send"
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
        }
      </section>
    }
  `,
  styles: [`
    :host { display: contents; }

    /* ================= FAB ================= */
    .byte-fab {
      position: fixed;
      right: var(--sp-6);
      bottom: var(--sp-6);
      z-index: 1200;
      width: 58px;
      height: 58px;
      padding: 0;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      background: linear-gradient(135deg, var(--primary) 0%, #8B5CF6 48%, var(--accent) 100%);
      box-shadow: var(--shadow-lg), 0 0 28px rgba(108, 99, 255, 0.35);
      display: grid;
      place-items: center;
      transition: transform var(--transition-base), box-shadow var(--transition-base);
      outline: none;

      &:hover, &:focus-visible {
        transform: translateY(-3px) scale(1.04);
        box-shadow: var(--shadow-lg), 0 0 34px rgba(0, 217, 255, 0.35);
      }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
      &:active { transform: translateY(0) scale(0.97); }
    }

    .byte-fab__ping {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: var(--primary);
      opacity: 0;
      animation: byte-ping 2.6s cubic-bezier(0, 0, 0.2, 1) infinite;
      pointer-events: none;
    }

    @keyframes byte-ping {
      0%   { transform: scale(1);    opacity: 0.5; }
      75%, 100% { transform: scale(1.7); opacity: 0; }
    }

    .byte-fab__tooltip {
      position: absolute;
      right: calc(100% + 14px);
      top: 50%;
      transform: translateY(-50%) translateX(6px);
      padding: 6px 12px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      font-family: var(--font-sans);
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
      box-shadow: var(--shadow-md);
      &::after {
        content: '';
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        border: 5px solid transparent;
        border-left-color: var(--border-hover);
      }
    }
    .byte-fab:hover .byte-fab__tooltip,
    .byte-fab:focus-visible .byte-fab__tooltip {
      opacity: 1;
      transform: translateY(-50%) translateX(0);
    }

    /* Avatar reutilizable (FAB, cabecera, auth) */
    .byte-avatar {
      display: inline-flex;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, #8B5CF6 48%, var(--accent) 100%);
      overflow: hidden;
      flex-shrink: 0;
      &--fab  { width: 58px; height: 58px; }
      &--head { width: 34px; height: 34px; box-shadow: 0 0 14px rgba(108, 99, 255, 0.45); }
      &--auth { width: 84px; height: 84px; box-shadow: var(--shadow-primary); }
      svg { display: block; }
    }

    /* ================= PANEL ================= */
    .byte-panel {
      position: fixed;
      right: var(--sp-6);
      bottom: calc(var(--sp-6) + 74px);
      z-index: 1210;
      width: 380px;
      max-width: calc(100vw - 24px);
      max-height: min(70vh, 640px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: rgba(18, 18, 26, 0.92);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg), 0 0 44px rgba(108, 99, 255, 0.14);
      outline: none;
      animation: byte-panel-in 240ms cubic-bezier(0.21, 1.02, 0.73, 1);
      transform-origin: bottom right;
    }

    @keyframes byte-panel-in {
      from { opacity: 0; transform: translateY(14px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0)    scale(1); }
    }

    .byte-panel__head {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-4);
      border-bottom: 1px solid var(--border);
      background: var(--bg-surface);
      flex-shrink: 0;
    }
    .byte-panel__who {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
      flex: 1;
      strong { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
    }

    .byte-status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-xs);
      color: var(--text-muted);
      &__dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--success);
        box-shadow: 0 0 8px var(--success);
      }
      &__dots { display: inline-flex; gap: 3px; align-items: center;
        span {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--accent);
          animation: byte-dot-bounce 1.2s ease-in-out infinite;
          &:nth-child(2) { animation-delay: 0.15s; }
          &:nth-child(3) { animation-delay: 0.3s; }
        }
      }
      &.writing { color: var(--accent); }
    }
    @keyframes byte-dot-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .byte-panel__close {
      width: 30px; height: 30px;
      display: grid; place-items: center;
      border: none; border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
    }

    /* Banner offline */
    .byte-banner {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      font-size: var(--text-xs);
      color: var(--warning);
      background: var(--warning-dim);
      border-bottom: 1px solid rgba(255, 215, 64, 0.25);
      flex-shrink: 0;
      p { flex: 1; line-height: 1.5; }
      button {
        border: none; background: none; color: inherit;
        cursor: pointer; font-size: var(--text-xs);
        &:hover { opacity: 0.7; }
      }
    }

    /* Auth gate */
    .byte-auth {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--sp-4);
      padding: var(--sp-12) var(--sp-6);
      text-align: center;
      &__text { color: var(--text-secondary); font-size: var(--text-sm); }
    }

    /* Contexto de lección */
    .byte-context-row {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-3) var(--sp-4);
      border-bottom: 1px solid var(--border);
      background: var(--bg-surface);
      flex-shrink: 0;
    }
    .byte-chip {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
      padding: 4px 12px;
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      color: var(--accent);
      background: var(--accent-dim);
      border: 1px solid rgba(0, 217, 255, 0.3);
      border-radius: var(--radius-sm);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .byte-quick {
      display: flex;
      gap: var(--sp-2);
      button {
        flex: 1;
        padding: 8px 12px;
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        font-family: var(--font-sans);
        color: var(--text-primary);
        background: var(--bg-surface-2);
        border: 1px solid var(--border-hover);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        &:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-dim);
        }
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
      }
    }

    /* Mensajes */
    .byte-msgs {
      flex: 1;
      overflow-y: auto;
      padding: var(--sp-4);
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      overscroll-behavior: contain;
    }
    .byte-msg {
      display: flex;
      &--user { justify-content: flex-end; }
      &--assistant { justify-content: flex-start; }
    }
    .byte-bubble {
      max-width: 86%;
      padding: 10px 14px;
      font-size: var(--text-sm);
      line-height: 1.65;
      border-radius: var(--radius-lg);
      color: var(--text-primary);
      word-break: break-word;

      &--assistant {
        background: var(--bg-surface-2); border: 1px solid var(--border);
        border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
      }
      &--user {
        background: linear-gradient(135deg, var(--primary), #5A4BE0);
        color: #fff;
        border: none;
        border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg);
        box-shadow: 0 2px 10px rgba(108, 99, 255, 0.25);
      }
      &--error {
        background: var(--danger-dim);
        border: 1px solid rgba(255, 82, 82, 0.35);
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        gap: var(--sp-2);
        p { color: var(--text-secondary); }
      }
      &--stream { min-width: 80px; }
      p { margin: 0; }
    }
    .byte-markdown { white-space: pre-wrap; }
    .byte-markdown :deep(code),
    .byte-markdown :deep(.byte-inline-code) {
      font-family: var(--font-mono);
      font-size: 0.82em;
      background: var(--bg-surface-3);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-sm);
      padding: 1px 5px;
      color: var(--accent);
    }
    .byte-markdown :deep(strong) { color: #fff; font-weight: var(--font-semibold); }

    .byte-retry {
      align-self: flex-start;
      padding: 6px 14px;
      font-size: var(--text-xs);
      font-weight: var(--font-medium);
      font-family: var(--font-sans);
      color: var(--danger);
      background: transparent;
      border: 1px solid rgba(255, 82, 82, 0.4);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      &:hover { background: var(--danger-dim); }
    }

    /* Skeleton */
    .byte-skeleton {
      display: flex;
      flex-direction: column;
      gap: var(--sp-4);
      &__row {
        display: flex;
        align-items: flex-start;
        gap: var(--sp-3);
        &--user { justify-content: flex-end; }
      }
      &__avatar { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; }
      &__line { height: 42px; border-radius: var(--radius-lg); }
    }

    /* Typing dots (patrón de ai-chat) */
    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 20px;
      span {
        width: 6px; height: 6px;
        background: var(--accent);
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
      color: var(--accent);
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
      gap: var(--sp-4);
      padding: var(--sp-4);
      background: var(--bg-surface);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      animation: byte-panel-in 220ms cubic-bezier(0.21, 1.02, 0.73, 1);
    }
    .byte-quiz__head {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      .byte-quiz__icon { font-size: 1rem; flex-shrink: 0; }
      strong { font-size: var(--text-sm); color: var(--text-primary); flex: 1; }
    }
    .byte-quiz__score {
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
      padding: 2px 10px;
      border-radius: var(--radius-sm);
      color: var(--warning);
      background: var(--warning-dim);
      border: 1px solid rgba(255, 215, 64, 0.3);
      &.passed { color: var(--success); background: var(--success-dim); border-color: rgba(0, 230, 118, 0.3); }
    }
    .byte-quiz__q {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      padding: var(--sp-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      background: var(--bg-surface-2);
      transition: border-color var(--transition-fast);
      &.is-correct { border-color: rgba(0, 230, 118, 0.5); }
      &.is-wrong   { border-color: rgba(255, 82, 82, 0.5); }
    }
    .byte-quiz__q-text {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      line-height: 1.5;
    }
    .byte-quiz__opts {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
    }
    .byte-quiz__opt {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 8px 12px;
      font-size: var(--text-sm);
      color: var(--text-secondary);
      background: var(--bg-surface-3);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);
      input { accent-color: var(--primary); cursor: pointer; flex-shrink: 0; }
      &:hover { border-color: var(--primary); color: var(--text-primary); }
      &.selected {
        border-color: var(--primary);
        background: var(--primary-dim);
        color: var(--text-primary);
      }
      &:has(input:disabled) { cursor: default; opacity: 0.85; }
    }
    .byte-quiz__verdict {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.55;
      .byte-quiz__tag {
        align-self: flex-start;
        font-weight: var(--font-semibold);
        padding: 2px 10px;
        border-radius: var(--radius-sm);
        &.tag-ok { color: var(--success); background: var(--success-dim); }
        &.tag-ko { color: var(--danger);  background: var(--danger-dim); }
      }
    }
    .byte-quiz__foot {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      align-items: stretch;
      .byte-quiz__final {
        text-align: center;
        font-size: var(--text-sm);
        font-weight: var(--font-medium);
        color: var(--text-secondary);
        &.passed { color: var(--success); }
      }
      .byte-quiz__actions {
        display: flex;
        gap: var(--sp-2);
        button { flex: 1; justify-content: center; }
      }
    }

    /* ================= INPUT ================= */
    .byte-input-area {
      display: flex;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .byte-input {
      flex: 1;
      resize: none;
      max-height: 110px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border-hover);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-family: var(--font-sans);
      line-height: 1.5;
      outline: none;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      &::placeholder { color: var(--text-muted); }
      &:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-dim); }
      &:disabled { opacity: 0.6; }
    }
    .byte-input__send {
      flex-shrink: 0;
      width: 42px; height: 42px;
      display: grid; place-items: center;
      border: none;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--primary), #5A4BE0);
      color: #fff;
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 8px rgba(108, 99, 255, 0.3);
      &:hover:not(:disabled) { background: linear-gradient(135deg, var(--primary-hover), var(--primary)); transform: translateY(-1px); }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
      &:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    }

    /* ================= MOBILE ================= */
    @media (max-width: 560px) {
      .byte-fab {
        right: var(--sp-4);
        bottom: var(--sp-4);
        width: 54px; height: 54px;
      }
      .byte-avatar--fab { width: 54px; height: 54px; }
      .byte-panel {
        right: var(--sp-3);
        left: var(--sp-3);
        bottom: calc(var(--sp-4) + 68px);
        width: auto;
        max-width: none;
        max-height: calc(100dvh - 140px);
      }
      .byte-fab__tooltip { display: none; }
    }

    /* ================= REDUCED MOTION ================= */
    @media (prefers-reduced-motion: reduce) {
      .byte-fab__ping,
      .byte-status__dots span,
      .typing-indicator span,
      .stream-cursor { animation: none; }
      .byte-panel { animation: none; }
      .byte-fab, .byte-fab__tooltip { transition: none; }
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
  busy          = signal(false);      // cualquier petición pendiente (send, explain, practice…)
  streaming     = signal(false);      // SSE activo (controla el cursor y el botón enviar)
  assistantStream = signal('');
  status        = signal<'online' | 'writing'>('online');

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
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    window.removeEventListener('ai-companion:open', this.companionHandler);
  }

  ngAfterViewChecked() {
    if (this.open()) this.scrollToBottom();
  }

  /** Oculta el FAB en /asistente y /auth/*; en cualquier navegación limpia el contexto de lección. */
  private syncRoute() {
    const url = this.router.url;
    const shouldHide = url.startsWith('/asistente') || url.startsWith('/auth');
    this.hidden.set(shouldHide);
    if (shouldHide) this.closePanel();
    // El contexto de lección es transitorio: se re-establece con el CustomEvent del player.
    this.lessonContext.set(null);
    this.quickActions.set(false);
  }

  // ================= Apertura / cierre =================
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

  /** Carga el historial si existe id persistido; si no, deja lista una conversación nueva. */
  private ensureConversationLoaded() {
    const stored = localStorage.getItem(STORAGE_KEY);
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
            // id huérfano (conversación eliminada) → empezar de cero
            localStorage.removeItem(STORAGE_KEY);
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

  private loadHistory() {
    this.loadError.set(false);
    this.ensureConversationLoaded();
  }

  private maybeGreet() {
    if (this.messages().length === 0) {
      this.pushMessage('assistant', '¡Hola! Soy Byte, tu compañero de estudio 🚀 ¿En qué te ayudo?');
    }
  }

  // ================= Evento del player =================
  private onCompanionOpen(detail: { lesson_id?: number; lesson_title?: string }) {
    const lessonId = detail.lesson_id;
    if (!lessonId) return;
    this.lessonContext.set({ id: lessonId, title: detail.lesson_title?.trim() || 'esta lección' });
    this.quickActions.set(true);
    this.openPanel();
    this.ensureContextBubble();
    this.focusInput();
  }

  /** Burbuja local "Estamos en «…»" con id fijo (reemplaza la previa si la hubiera). */
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
        // Creación perezosa: solo en el primer envío.
        const conv = await firstValueFrom(this.ai.createConversation(CONVERSATION_TITLE));
        convId = conv.id;
        this.conversationId.set(convId);
        localStorage.setItem(STORAGE_KEY, String(convId));
      }

      this.pushMessage('user', content);
      this.inputText = '';
      this.streaming.set(true);
      this.assistantStream.set('');

      try {
        const full = await this.ai.streamMessage(convId, content, delta =>
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

  // ================= Acciones rápidas de lección =================
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

  /** Markdown-lite: escapa HTML primero y luego **negrita** + `código`. Los saltos los respeta white-space: pre-wrap. */
  private renderMarkdown(text: string): string {
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    return escaped
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="byte-inline-code">$1</code>');
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