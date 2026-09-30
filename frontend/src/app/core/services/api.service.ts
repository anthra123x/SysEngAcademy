import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
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
    }
    return 'http://localhost:8000/api';
  }

  private checkIsStandalone(): boolean {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const custom = (window as any).__API_URL__ || localStorage.getItem('syseng_api_url');
      // En producción en Vercel, si no hay backend remoto configurado, operamos en modo standalone de 0ms
      return !isLocal && !custom;
    }
    return false;
  }

  get<T>(path: string, params?: Record<string, unknown>, timeoutMs: number = 2800): Observable<T> {
    if (this.isStandalone) {
      return throwError(() => new Error('SysEng: Standalone mode (zero-latency fallback active)'));
    }

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

  post<T>(path: string, body?: unknown, timeoutMs: number = 3800): Observable<T> {
    if (this.isStandalone) {
      return throwError(() => new Error('SysEng: Standalone mode (zero-latency fallback active)'));
    }

    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(timeoutMs)
    );
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    if (this.isStandalone) {
      return throwError(() => new Error('SysEng: Standalone mode (zero-latency fallback active)'));
    }

    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(3500)
    );
  }

  patch<T>(path: string, body?: unknown): Observable<T> {
    if (this.isStandalone) {
      return throwError(() => new Error('SysEng: Standalone mode (zero-latency fallback active)'));
    }

    return this.http.patch<T>(`${this.baseUrl}${path}`, body).pipe(
      timeout(3500)
    );
  }

  delete<T>(path: string): Observable<T> {
    if (this.isStandalone) {
      return throwError(() => new Error('SysEng: Standalone mode (zero-latency fallback active)'));
    }

    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(
      timeout(3500)
    );
  }
}
