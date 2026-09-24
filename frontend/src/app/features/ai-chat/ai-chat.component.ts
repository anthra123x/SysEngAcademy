import { Component, OnInit, inject, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AiChatService } from '../../core/services/ai-chat.service';
import { AiConversation, AiMessage } from '../../core/models';

@Component({
  selector: 'app-ai-chat',
  imports: [FormsModule],
  template: `
    <div class="ai-chat-layout">
      <!-- Sidebar -->
      <aside class="chat-sidebar">
        <div class="chat-sidebar__header">
          <h2>Asistente IA</h2>
          <button class="btn btn-primary btn-sm" (click)="newConversation()">+ Nueva</button>
        </div>

        <div class="conversations-list">
          @for (conv of conversations(); track conv.id) {
            <button class="conv-item" [class.active]="activeConv()?.id === conv.id" (click)="loadConversation(conv)">
              <span class="conv-icon">💬</span>
              <span class="conv-title">{{ conv.title }}</span>
            </button>
          }
          @if (conversations().length === 0 && !loadingConvs()) {
            <div class="conv-empty">No hay conversaciones aún</div>
          }
        </div>
      </aside>

      <!-- Chat Area -->
      <main class="chat-main">
        @if (!activeConv()) {
          <div class="chat-welcome">
            <div class="welcome-icon">🤖</div>
            <h2>Asistente de IA</h2>
            <p>Soy tu asistente especializado en programación para Ingeniería de Sistemas. Puedo ayudarte con:</p>
            <div class="welcome-chips">
              <span (click)="quickAsk('¿Qué es la complejidad algorítmica Big-O?')">Complejidad algorítmica</span>
              <span (click)="quickAsk('Explícame qué es la herencia en POO')">Herencia en POO</span>
              <span (click)="quickAsk('¿Cuál es la diferencia entre SQL y NoSQL?')">SQL vs NoSQL</span>
              <span (click)="quickAsk('¿Qué son los punteros en C?')">Punteros en C</span>
            </div>
            <button class="btn btn-primary" (click)="newConversation()">Iniciar Conversación</button>
          </div>
        } @else {
          <div class="chat-header">
            <h3>{{ activeConv()!.title }}</h3>
          </div>

          <div class="messages-container" #messagesContainer>
            @for (msg of messages(); track msg.id) {
              <div [class]="'message message--' + msg.role">
                @if (msg.role === 'assistant') {
                  <div class="message__avatar">🤖</div>
                }
                <div class="message__bubble">
                  <div class="message__content">{{ msg.content }}</div>
                  <div class="message__time">{{ formatTime(msg.created_at) }}</div>
                </div>
              </div>
            }

            @if (thinking()) {
              <div class="message message--assistant">
                <div class="message__avatar">🤖</div>
                <div class="message__bubble">
                  @if (assistantStream()) {
                    <div class="message__content">{{ assistantStream() }}<span class="stream-cursor">▍</span></div>
                  } @else {
                    <div class="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="chat-input-area">
            <textarea class="chat-input" [(ngModel)]="inputText" placeholder="Escribe tu pregunta..."
              (keydown.enter)="onEnter($event)" rows="1" [disabled]="thinking()"></textarea>
            <button class="btn btn-primary send-btn" (click)="sendMessage()" [disabled]="!inputText.trim() || thinking()">
              ➤
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .ai-chat-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      height: calc(100vh - var(--header-height));
      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }

    .chat-sidebar {
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--sp-5);
        border-bottom: 1px solid var(--border);
        h2 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
      }
    }

    .conversations-list { flex: 1; overflow-y: auto; padding: var(--sp-3); }

    .conv-item {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      width: 100%;
      padding: var(--sp-3) var(--sp-4);
      background: none;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      color: var(--text-secondary);
      font-size: var(--text-sm);
      text-align: left;
      transition: all var(--transition-fast);
      margin-bottom: var(--sp-1);

      &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
      &.active { background: var(--primary-dim); color: var(--primary); border: 1px solid rgba(108,99,255,0.2); }

      .conv-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    }

    .conv-empty { padding: var(--sp-4); font-size: var(--text-sm); color: var(--text-muted); text-align: center; }

    .chat-main {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--bg-base);
    }

    .chat-header {
      padding: var(--sp-4) var(--sp-6);
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      h3 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
    }

    .chat-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--sp-8);
      gap: var(--sp-5);

      .welcome-icon { font-size: 4rem; }
      h2 { font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); }
      p { color: var(--text-secondary); max-width: 400px; }
    }

    .welcome-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      justify-content: center;

      span {
        padding: 8px 16px;
        background: var(--bg-surface-2);
        border: 1px solid var(--border);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        &:hover { border-color: var(--primary); color: var(--primary); }
      }
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: var(--sp-6);
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
    }

    .message {
      display: flex;
      gap: var(--sp-3);
      align-items: flex-start;

      &--user {
        flex-direction: row-reverse;
        .message__bubble { background: var(--primary); color: #fff; border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg); }
        .message__time { color: rgba(255,255,255,0.6); }
      }

      &--assistant {
        .message__bubble { background: var(--bg-surface-2); border: 1px solid var(--border); border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm); }
      }

      &__avatar { font-size: 1.5rem; flex-shrink: 0; margin-top: 4px; }

      &__bubble { padding: var(--sp-4); max-width: 70%; }

      &__content { font-size: var(--text-sm); line-height: 1.7; white-space: pre-wrap; }

      &__time { font-size: 10px; color: var(--text-muted); margin-top: var(--sp-2); }
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      align-items: center;
      height: 20px;

      span {
        width: 6px; height: 6px;
        background: var(--text-muted);
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

    .chat-input-area {
      display: flex;
      gap: var(--sp-3);
      padding: var(--sp-4) var(--sp-6);
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
    }

    .chat-input {
      flex: 1;
      resize: none;
      max-height: 120px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: var(--text-sm);
      font-family: var(--font-sans);
      outline: none;
      transition: border-color var(--transition-fast);
      &::placeholder { color: var(--text-muted); }
      &:focus { border-color: var(--primary); }
    }

    .send-btn { flex-shrink: 0; width: 44px; height: 44px; padding: 0; justify-content: center; font-size: 1rem; }
  `]
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  private aiChatSvc    = inject(AiChatService);
  auth                 = inject(AuthService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  conversations  = signal<AiConversation[]>([]);
  activeConv     = signal<AiConversation | null>(null);
  messages       = signal<AiMessage[]>([]);
  loadingConvs   = signal(true);
  thinking       = signal(false);
  assistantStream = signal('');
  inputText      = '';

  ngOnInit() {
    this.loadConversations();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  loadConversations() {
    this.aiChatSvc.getConversations().subscribe(convs => {
      this.conversations.set(convs);
      this.loadingConvs.set(false);
    });
  }

  loadConversation(conv: AiConversation) {
    this.activeConv.set(conv);
    this.assistantStream.set('');
    this.aiChatSvc.getConversation(conv.id).subscribe(full => {
      this.messages.set(full.messages ?? []);
    });
  }

  newConversation() {
    this.aiChatSvc.createConversation().subscribe(conv => {
      this.conversations.update(list => [conv, ...list]);
      this.activeConv.set(conv);
      this.messages.set([]);
      this.assistantStream.set('');
    });
  }

  sendMessage() {
    const content = this.inputText.trim();
    if (!content || this.thinking()) return;

    const tempMsg: AiMessage = {
      id: Date.now(), conversation_id: this.activeConv()!.id,
      role: 'user', content, created_at: new Date().toISOString(),
    };
    this.messages.update(m => [...m, tempMsg]);
    this.inputText = '';
    this.thinking.set(true);
    this.assistantStream.set('');

    // Streaming SSE: la respuesta del asistente crece token a token.
    this.aiChatSvc.streamMessage(this.activeConv()!.id, content, delta => {
      this.assistantStream.update(t => t + delta);
    }).then(full => {
      if (full) {
        const assistantMsg: AiMessage = {
          id: Date.now() + 1, conversation_id: this.activeConv()!.id,
          role: 'assistant', content: full, created_at: new Date().toISOString(),
        };
        this.messages.update(m => [...m, assistantMsg]);
      }
      this.thinking.set(false);
      this.assistantStream.set('');
      this.loadConversations();
    }).catch(() => {
      this.thinking.set(false);
      this.assistantStream.set('');
    });
  }

  quickAsk(text: string) {
    this.newConversation();
    setTimeout(() => {
      this.inputText = text;
      this.sendMessage();
    }, 300);
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
}
