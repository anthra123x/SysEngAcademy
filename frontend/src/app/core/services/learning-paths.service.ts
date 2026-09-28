import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LearningPath, PaginatedResponse } from '../models';
import { FALLBACK_LEARNING_PATHS } from './fallback-data';

const PATHS_CACHE_KEY = 'syseng_cache_paths_v3';

@Injectable({ providedIn: 'root' })
export class LearningPathsService {
  private api = inject(ApiService);

  getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<LearningPath>> {
    const cached = this.readCache();

    let filtered = [...FALLBACK_LEARNING_PATHS];
    if (params && params['category']) {
      filtered = filtered.filter(p => p.category?.slug === params['category']);
    }
    if (params && params['difficulty']) {
      filtered = filtered.filter(p => p.difficulty === params['difficulty']);
    }

    const fallbackRes: PaginatedResponse<LearningPath> = {
      current_page: 1,
      data: filtered,
      total: filtered.length,
      per_page: 12,
      last_page: 1,
    };

    return new Observable<PaginatedResponse<LearningPath>>(subscriber => {
      // 0ms instant emission
      subscriber.next((!params || Object.keys(params).length === 0) && cached ? cached : fallbackRes);

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
    const fallback = FALLBACK_LEARNING_PATHS.find(p => p.slug === slug || slug.includes(p.slug) || p.slug.includes(slug)) ||
      FALLBACK_LEARNING_PATHS[0];

    return new Observable<LearningPath>(subscriber => {
      // Emisión instantánea (0ms) de la ruta completa con sus hitos, niveles y cursos asignados
      subscriber.next(fallback);

      // Revalidación en segundo plano si la API remota responde con niveles válidos
      this.api.get<LearningPath>(`/learning-paths/${slug}`).subscribe({
        next: fresh => {
          if (fresh && fresh.levels && fresh.levels.length > 0) {
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: () => subscriber.complete(),
      });
    });
  }

  private readCache(): PaginatedResponse<LearningPath> | null {
    try {
      const raw = localStorage.getItem(PATHS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const hasLevels = parsed?.data?.some((p: any) => p.levels && p.levels.length > 0);
        if (hasLevels && parsed?.data?.length >= FALLBACK_LEARNING_PATHS.length) {
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
