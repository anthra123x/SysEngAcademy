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

const CACHE_KEY = 'syseng_cache_home';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private api = inject(ApiService);

  /**
   * Carga instantánea: Si hay datos en caché, los devuelve inmediatamente (0ms).
   * En segundo plano intenta refrescar la API. Si la API falla (producción/offline),
   * entrega el catálogo fallback inmediatamente sin bloquear la pantalla.
   */
  getHome(): Observable<HomeData> {
    const cached = this.readCache();

    return this.api.get<HomeData>('/home').pipe(
      tap(data => this.writeCache(data)),
      catchError(() => {
        return of(cached || FALLBACK_HOME_DATA);
      })
    );
  }

  private readCache(): HomeData | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  private writeCache(data: HomeData): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }
}