import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LearningPath, PaginatedResponse } from '../models';
import { FALLBACK_LEARNING_PATHS } from './fallback-data';

const PATHS_CACHE_KEY = 'syseng_cache_paths';

@Injectable({ providedIn: 'root' })
export class LearningPathsService {
  private api = inject(ApiService);

  getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<LearningPath>> {
    const cached = this.readCache();
    const fallbackRes: PaginatedResponse<LearningPath> = cached || {
      current_page: 1,
      data: FALLBACK_LEARNING_PATHS,
      total: FALLBACK_LEARNING_PATHS.length,
      per_page: 10,
      last_page: 1,
    };

    return new Observable<PaginatedResponse<LearningPath>>(subscriber => {
      // 0ms instant emission
      subscriber.next(fallbackRes);

      // Revalidate in background without blocking UI
      this.api.get<PaginatedResponse<LearningPath>>('/learning-paths', params).subscribe({
        next: fresh => {
          if (!params || Object.keys(params).length === 0) {
            this.writeCache(fresh);
          }
          subscriber.next(fresh);
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  getBySlug(slug: string): Observable<LearningPath> {
    const cached = this.readCache()?.data.find(p => p.slug === slug);
    const fallback = cached ||
      FALLBACK_LEARNING_PATHS.find(p => p.slug === slug || slug.includes(p.slug) || p.slug.includes(slug)) ||
      FALLBACK_LEARNING_PATHS[0];

    return new Observable<LearningPath>(subscriber => {
      // 0ms instant emission
      subscriber.next(fallback);

      // Revalidate in background
      this.api.get<LearningPath>(`/learning-paths/${slug}`).subscribe({
        next: fresh => {
          subscriber.next(fresh);
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  private readCache(): PaginatedResponse<LearningPath> | null {
    try {
      const raw = localStorage.getItem(PATHS_CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  private writeCache(data: PaginatedResponse<LearningPath>): void {
    try {
      localStorage.setItem(PATHS_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}
