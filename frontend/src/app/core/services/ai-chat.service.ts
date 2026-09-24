import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AiConversation, AiMessage } from '../models';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private api = inject(ApiService);

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
}
