import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Category } from '../models';
import { FALLBACK_CATEGORIES } from './fallback-data';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private api = inject(ApiService);

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories').pipe(
      catchError(() => of(FALLBACK_CATEGORIES))
    );
  }
}

