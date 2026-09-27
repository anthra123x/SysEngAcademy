import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { AiConversation, AiMessage, AiAskReply, AiPracticeQuiz } from '../models';

export type AiAskKind = 'question' | 'code_review' | 'explain' | 'practice' | 'hint' | 'roadmap';

export interface AiAskPayload {
  question?: string;
  code?: string;
  lesson_id?: number;
  kind: AiAskKind;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private api  = inject(ApiService);
  private auth = inject(AuthService);

  getConversations(): Observable<AiConversation[]> {
    return this.api.get<AiConversation[]>('/ai/conversations');
  }

  getConversation(id: number): Observable<AiConversation> {
    return this.api.get<AiConversation>(`/ai/conversations/${id}`);
  }

  createConversation(title?: string): Observable<AiConversation> {
    return this.api.post<AiConversation>('/ai/conversations', { title });
  }

  sendMessage(conversationId: number, content: string): Observable<AiMessage> {
    return this.api.post<AiMessage>(`/ai/conversations/${conversationId}/message`, { content });
  }

  /** POST /ai/ask — respuesta puntual (explicación, code review, etc.). */
  askAI(payload: AiAskPayload): Observable<AiAskReply> {
    return this.api.post<AiAskReply>('/ai/ask', payload);
  }

  /** POST /ai/practice — genera un quiz interactivo al vuelo para una lección. */
  practice(lessonId: number, count = 3): Observable<AiPracticeQuiz> {
    return this.api.post<AiPracticeQuiz>('/ai/practice', { lesson_id: lessonId, count });
  }

  /**
   * Envía un mensaje y consume la respuesta en streaming (SSE).
   * `onDelta` se invoca por cada fragmento de texto que llega desde el
   * servidor; la Promise resuelve con el texto completo al terminar.
   */
  streamMessage(conversationId: number, content: string, onDelta: (delta: string) => void): Promise<string> {
    const token = this.auth.getToken();
    const url   = `${this.api.baseUrl}/ai/conversations/${conversationId}/stream`;

    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    }).then(async (res) => {
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          try {
            const event = JSON.parse(trimmed.slice(5).trim());
            if (event.delta) {
              full += event.delta;
              onDelta(event.delta);
            }
            // event.done → la respuesta ya fue persistida en el backend
          } catch {
            // Fragmento SSE incompleto o comentario: se ignora.
          }
        }
      }

      return full;
    });
  }
}