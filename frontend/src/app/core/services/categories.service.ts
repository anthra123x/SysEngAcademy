import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private api = inject(ApiService);

  getAll(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }
}

