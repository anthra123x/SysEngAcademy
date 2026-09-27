import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getCoursePosts(courseSlug: string, filters: ForumFilters = {}): Observable<PaginatedForumPosts> {
    let params = new HttpParams();
    if (filters.module_id) params = params.set('module_id', filters.module_id);
    if (filters.lesson_id) params = params.set('lesson_id', filters.lesson_id);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page);

    return this.http.get<PaginatedForumPosts>(`${this.apiUrl}/courses/${courseSlug}/forum`, { params });
  }

  createPost(courseSlug: string, data: CreateForumPostData): Observable<ForumPost> {
    return this.http.post<ForumPost>(`${this.apiUrl}/courses/${courseSlug}/forum`, data);
  }

  getPost(id: number): Observable<ForumPost> {
    return this.http.get<ForumPost>(`${this.apiUrl}/forum/posts/${id}`);
  }

  addReply(postId: number, content: string): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.apiUrl}/forum/posts/${postId}/replies`, { content });
  }

  upvotePost(postId: number): Observable<{ upvotes: number }> {
    return this.http.post<{ upvotes: number }>(`${this.apiUrl}/forum/posts/${postId}/upvote`, {});
  }

  markSolution(replyId: number): Observable<ForumReply> {
    return this.http.post<ForumReply>(`${this.apiUrl}/forum/replies/${replyId}/solution`, {});
  }
}
