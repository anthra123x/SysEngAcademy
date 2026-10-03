import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LearningPath, PaginatedResponse } from '../models';

const PATHS_CACHE_KEY = 'syseng_cache_paths_v3';

@Injectable({ providedIn: 'root' })
export class LearningPathsService {
  private api = inject(ApiService);

  getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<LearningPath>> {
    const cached = this.readCache();
    const hasParams = params && Object.keys(params).length > 0;

    return new Observable<PaginatedResponse<LearningPath>>(subscriber => {
      if (!hasParams && cached) {
        subscriber.next(cached);
      }

      this.api.get<PaginatedResponse<LearningPath>>('/learning-paths', params).subscribe({
        next: fresh => {
          if (fresh && Array.isArray(fresh.data)) {
            if (!hasParams) {
              this.writeCache(fresh);
            }
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: err => {
          if (!cached || hasParams) {
            subscriber.error(err);
          } else {
            subscriber.complete();
          }
        },
      });
    });
  }

  getBySlug(slug: string): Observable<LearningPath> {
    return this.api.get<LearningPath>(`/learning-paths/${slug}`);
  }

  private readCache(): PaginatedResponse<LearningPath> | null {
    try {
      const raw = localStorage.getItem(PATHS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.data) && parsed.data.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }

  private writeCache(data: PaginatedResponse<LearningPath>): void {
    try {
      localStorage.setItem(PATHS_CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}
