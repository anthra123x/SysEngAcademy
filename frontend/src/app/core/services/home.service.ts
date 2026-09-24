import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, Course, LearningPath, PaginatedResponse } from '../models';

export interface HomeData {
  categories: Category[];
  learning_paths: PaginatedResponse<LearningPath>;
  courses: PaginatedResponse<Course>;
}

/**
 * Endpoint agregado del inicio: una sola llamada trae categorías,
 * rutas y cursos destacados (cacheado en el backend).
 */
@Injectable({ providedIn: 'root' })
export class HomeService {
  private api = inject(ApiService);

  getHome(): Observable<HomeData> {
    return this.api.get<HomeData>('/home');
  }
}