import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LearningPath, PaginatedResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class LearningPathsService {
  private api = inject(ApiService);

  getAll(params?: Record<string, unknown>): Observable<PaginatedResponse<LearningPath>> {
    return this.api.get<PaginatedResponse<LearningPath>>('/learning-paths', params);
  }

  getBySlug(slug: string): Observable<LearningPath> {
    return this.api.get<LearningPath>(`/learning-paths/${slug}`);
  }
}
