import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category, Course, LearningPath, PaginatedResponse } from '../models';
import { FALLBACK_HOME_DATA } from './fallback-data';

export interface HomeData {
  categories: Category[];
  learning_paths: PaginatedResponse<LearningPath>;
  courses: PaginatedResponse<Course>;
}

const CACHE_KEY = 'syseng_cache_home_v4';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private api = inject(ApiService);

  /**
   * Carga instantánea: Emite inmediatamente (0ms) datos de caché o fallback para que
   * la UI no espere a la red ni muestre pantalla vacía. En segundo plano consulta la API
   * y emite los datos actualizados cuando lleguen.
   */
  getHome(): Observable<HomeData> {
    const cached = this.readCache();
    const initial = cached || FALLBACK_HOME_DATA;

    return new Observable<HomeData>(subscriber => {
      // 1. Emisión instantánea (0ms)
      subscriber.next(initial);

      // 2. Revalidación en segundo plano desde Edge CDN / backend
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
        error: () => subscriber.complete(),
      });
    });
  }

  private readCache(): HomeData | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const hasLevels = parsed?.learning_paths?.data?.some((p: any) => p.levels && p.levels.length > 0);
        if (
          hasLevels &&
          parsed?.learning_paths?.data?.length >= FALLBACK_HOME_DATA.learning_paths.data.length &&
          parsed?.courses?.data?.length >= 6
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