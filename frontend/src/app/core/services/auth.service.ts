import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private router = inject(Router);

  private _user  = signal<User | null>(this.loadUser());
  readonly user  = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin         = computed(() => this._user()?.role === 'admin');
  readonly isInstructor    = computed(() => ['admin','instructor'].includes(this._user()?.role ?? ''));

  private loadUser(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('syseng_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.api.post<{ user: User; token: string; verification_required?: boolean; verification_code?: string }>('/auth/register', data, 25000).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        const errors = err?.error?.errors;
        const firstField = errors ? (Object.values(errors)[0] as string[])?.[0] : null;
        const message = firstField
          || err?.error?.message
          || 'No se pudo completar el registro. Por favor verifica los datos ingresados e intenta de nuevo.';
        return throwError(() => ({
          error: {
            message,
            errors,
          }
        }));
      })
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.api.post<{ user: User; token: string }>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    }, 25000).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        const errors = err?.error?.errors;
        const firstField = errors ? (Object.values(errors)[0] as string[])?.[0] : null;
        const message = firstField
          || err?.error?.message
          || 'Las credenciales no son correctas. Por favor verifica tu correo y contraseña.';
        return throwError(() => ({
          error: {
            message,
            errors,
          }
        }));
      })
    );
  }

  verifyEmail(code: string, email?: string) {
    return this.api
      .post<{ message: string; user?: User; token?: string }>('/auth/verify-email', { code, email })
      .pipe(
        tap(res => {
          if (res.user && res.token) {
            this.setSession({ user: res.user, token: res.token });
          }
        }),
        catchError(err => {
          const message = err?.error?.message
            || 'El código de verificación no es válido o ha expirado.';
          return throwError(() => ({ error: { message } }));
        })
      );
  }

  resendVerification(email?: string) {
    return this.api.post<{ message: string; verification_code?: string }>(
      '/auth/resend-verification',
      { email }
    ).pipe(
      catchError(err => {
        const message = err?.error?.message
          || 'No se pudo reenviar el código de verificación. Intenta de nuevo más tarde.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  logout() {
    this.api.post('/auth/logout').subscribe({
      complete: () => this.clearSession(true),
      error: () => this.clearSession(true),
    });
  }

  fetchMe() {
    return this.api.get<User>('/auth/me').pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem('syseng_user', JSON.stringify(user));
      }),
      catchError(err => {
        // Si el token expiró o es inválido, limpiar la sesión local
        if (err?.status === 401) {
          this.clearSession(false);
        }
        return throwError(() => err);
      })
    );
  }

  private setSession(res: { user: User; token: string }) {
    localStorage.setItem('syseng_token', res.token);
    localStorage.setItem('syseng_user', JSON.stringify(res.user));
    this._user.set(res.user);
  }

  clearSession(redirect = false) {
    localStorage.removeItem('syseng_token');
    localStorage.removeItem('syseng_user');
    this._user.set(null);
    if (redirect) {
      this.router.navigate(['/']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('syseng_token');
  }

  // Diagnóstico onboarding — se mantiene en localStorage porque es estado local del estudiante
  isDiagnosticCompleted(email?: string): boolean {
    if (typeof window === 'undefined') return true;
    const targetEmail = (email || this._user()?.email || '').toLowerCase().trim();
    if (!targetEmail) return true;
    const userKey = `syseng_${targetEmail}_diagnostic_completed`;
    const val = localStorage.getItem(userKey);
    if (val !== null) return val === 'true';
    return false;
  }

  saveDiagnosticResult(result: any, email?: string): void {
    if (typeof window === 'undefined') return;
    const targetEmail = (email || this._user()?.email || '').toLowerCase().trim();
    if (!targetEmail) return;
    localStorage.setItem(`syseng_${targetEmail}_diagnostic_completed`, 'true');
    localStorage.setItem(`syseng_${targetEmail}_diagnostic_result`, JSON.stringify(result));
  }

  getDiagnosticResult(email?: string): any {
    if (typeof window === 'undefined') return null;
    const targetEmail = (email || this._user()?.email || '').toLowerCase().trim();
    try {
      const raw = localStorage.getItem(`syseng_${targetEmail}_diagnostic_result`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
