import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, Course, LearningPath, PaginatedResponse } from '../models';

export interface HomeData {
  categories: Category[];
  learning_paths: PaginatedResponse<LearningPath>;
  courses: PaginatedResponse<Course>;
}

const CACHE_KEY = 'syseng_cache_home_v5';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private api = inject(ApiService);

  /**
   * Carga optimizada: Si existe caché local, la emite de inmediato para evitar layout shifts.
   * Siempre consulta la API en segundo plano para obtener datos actualizados.
   */
  getHome(): Observable<HomeData> {
    const cached = this.readCache();

    return new Observable<HomeData>(subscriber => {
      if (cached) {
        subscriber.next(cached);
      }

      this.api.get<HomeData>('/home').subscribe({
        next: fresh => {
          if (
            fresh &&
            Array.isArray(fresh.categories) &&
            fresh.learning_paths?.data &&
            fresh.courses?.data
          ) {
            this.writeCache(fresh);
            subscriber.next(fresh);
          }
          subscriber.complete();
        },
        error: err => {
          if (!cached) {
            subscriber.error(err);
          } else {
            subscriber.complete();
          }
        },
      });
    });
  }

  private readCache(): HomeData | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed?.categories) &&
          parsed?.learning_paths?.data?.length > 0 &&
          parsed?.courses?.data?.length > 0
        ) {
          return parsed;
        }
      }
    } catch {}
    return null;
  }

  private writeCache(data: HomeData): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}