import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly baseUrl = this.resolveBaseUrl();
  readonly isStandalone = this.checkIsStandalone();
  private http = inject(HttpClient);

  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const custom = (window as any).__API_URL__ || localStorage.getItem('syseng_api_url');
      if (custom) return custom;
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isLocal) {
        return '/api';
      }
    }
    return 'http://localhost:8000/api';
  }

  private checkIsStandalone(): boolean {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const custom = (window as any).__API_URL__ || localStorage.getItem('syseng_api_url');
      return !isLocal && !custom;
    }
    return false;
  }

  get<T>(path: string, params?: Record<string, unknown>, timeoutMs: number = 3200): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams }).pipe(
      timeout(timeoutMs)
    );
  }

  post<T>(path: string, body?: unknown, timeoutMs: number = 4200): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(timeoutMs)
    );
  }

  put<T>(path: string, body?: unknown, timeoutMs: number = 3500): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(timeoutMs)
    );
  }

  patch<T>(path: string, body?: unknown, timeoutMs: number = 3500): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(timeoutMs)
    );
  }

  delete<T>(path: string, timeoutMs: number = 3500): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(
      timeout(timeoutMs)
    );
  }
}
