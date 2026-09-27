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

    return this.api.get<PaginatedResponse<LearningPath>>('/learning-paths', params).pipe(
      tap(res => {
        if (!params || Object.keys(params).length === 0) {
          this.writeCache(res);
        }
      }),
      catchError(() => {
        const fallbackRes: PaginatedResponse<LearningPath> = {
          current_page: 1,
          data: FALLBACK_LEARNING_PATHS,
          total: FALLBACK_LEARNING_PATHS.length,
          per_page: 10,
          last_page: 1,
        };
        return of(cached || fallbackRes);
      })
    );
  }

  getBySlug(slug: string): Observable<LearningPath> {
    return this.api.get<LearningPath>(`/learning-paths/${slug}`).pipe(
      catchError(() => {
        const found = FALLBACK_LEARNING_PATHS.find(p => p.slug === slug) || FALLBACK_LEARNING_PATHS[0];
        return of(found);
      })
    );
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
