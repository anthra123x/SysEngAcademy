import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CreateForumPostData, ForumPost, ForumReply } from '../models';

export interface ForumFilters {
  module_id?: number;
  lesson_id?: number;
  category?: string;
  search?: string;
  page?: number;
}

export interface PaginatedForumPosts {
  data: ForumPost[];
  current_page: number;
  last_page: number;
  total: number;
}

/**
 * El foro sí es una funcionalidad que exige backend real (persistencia
 * multiusuario), a diferencia del resto de la app que opera en modo
 * standalone. Por eso no puede fallar en silencio: si la API no responde el
 * usuario debe saberlo.
 *
 * Presupuesto de tiempo holgado a propósito: la BD es Neon y una conexión
 * en cold start puede tardar 4–20 s (ver README), muy por encima de los
 * 2.8 s por defecto de ApiService. Con 2.8 s el foro fallaría de forma
 * intermitente y parecería "no funcionar".
 */
const FORUM_TIMEOUT_MS = 20000;

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private api = inject(ApiService);

  getCoursePosts(courseSlug: string, filters: ForumFilters = {}): Observable<PaginatedForumPosts> {
    const params: Record<string, unknown> = {};
    if (filters.module_id) params['module_id'] = filters.module_id;
    if (filters.lesson_id) params['lesson_id'] = filters.lesson_id;
    if (filters.category) params['category'] = filters.category;
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page;

    return this.api.get<PaginatedForumPosts>(
      `/courses/${encodeURIComponent(courseSlug)}/forum`,
      params,
      FORUM_TIMEOUT_MS
    );
  }

  createPost(courseSlug: string, data: CreateForumPostData): Observable<ForumPost> {
    return this.api.post<ForumPost>(
      `/courses/${encodeURIComponent(courseSlug)}/forum`,
      data,
      FORUM_TIMEOUT_MS
    );
  }

  getPost(id: number): Observable<ForumPost> {
    return this.api.get<ForumPost>(`/forum/posts/${id}`, undefined, FORUM_TIMEOUT_MS);
  }

  addReply(postId: number, content: string): Observable<ForumReply> {
    return this.api.post<ForumReply>(
      `/forum/posts/${postId}/replies`,
      { content },
      FORUM_TIMEOUT_MS
    );
  }

  upvotePost(postId: number): Observable<{ upvotes: number }> {
    return this.api.post<{ upvotes: number }>(
      `/forum/posts/${postId}/upvote`,
      {},
      FORUM_TIMEOUT_MS
    );
  }

  markSolution(replyId: number): Observable<ForumReply> {
    return this.api.post<ForumReply>(
      `/forum/replies/${replyId}/solution`,
      {},
      FORUM_TIMEOUT_MS
    );
  }
}
