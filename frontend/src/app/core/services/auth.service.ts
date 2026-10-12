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

  requestRegisterCode(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.api.post<{ success: boolean; requires_verification: boolean; email: string; message: string }>('/auth/register/request-code', {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      password_confirmation: data.password_confirmation,
    }, 25000).pipe(
      catchError(err => {
        const errors = err?.error?.errors;
        const firstField = errors ? (Object.values(errors)[0] as string[])?.[0] : null;
        const message = firstField
          || err?.error?.message
          || 'No se pudo enviar el código de verificación. Por favor verifica tus datos.';
        return throwError(() => ({
          error: {
            message,
            errors,
          }
        }));
      })
    );
  }

  confirmRegister(data: { email: string; code: string }) {
    return this.api.post<{ user: User; token: string; message: string }>('/auth/register/confirm', {
      email: data.email.trim().toLowerCase(),
      code: data.code.trim(),
    }, 25000).pipe(
      tap(res => this.setSession(res)),
      catchError(err => {
        const message = err?.error?.message || 'Código de activación inválido o expirado. Por favor intenta de nuevo.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  resendRegisterCode(email: string) {
    return this.api.post<{ success: boolean; message: string }>('/auth/register/resend-code', {
      email: email.trim().toLowerCase(),
    }, 25000).pipe(
      catchError(err => {
        const message = err?.error?.message || 'No se pudo reenviar el código. Intenta de nuevo más tarde.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.requestRegisterCode(data);
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
    return this.api.post<{ message: string }>(
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

  forgotPassword(email: string) {
    return this.api.post<{ message: string; sent?: boolean }>('/auth/forgot-password', {
      email: (email || '').trim().toLowerCase(),
    }).pipe(
      catchError(err => {
        const message = err?.error?.message || 'No se pudo procesar la solicitud de recuperación.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  resetPassword(data: { email: string; code: string; password: string; password_confirmation: string }) {
    return this.api.post<{ message: string; user?: User }>('/auth/reset-password', {
      email: (data.email || '').trim().toLowerCase(),
      code: (data.code || '').trim(),
      password: data.password,
      password_confirmation: data.password_confirmation,
    }).pipe(
      catchError(err => {
        const message = err?.error?.message || 'No se pudo restablecer la contraseña. Verifica el código.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  changePassword(data: { current_password?: string; password: string; password_confirmation: string }) {
    return this.api.post<{ message: string; user?: User }>('/auth/change-password', data).pipe(
      catchError(err => {
        const message = err?.error?.message || 'No se pudo actualizar la contraseña.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  testEmail(email?: string) {
    return this.api.post<{ success: boolean; message: string; sent: boolean; email: string; check_code?: string }>(
      '/auth/test-email',
      { email }
    ).pipe(
      catchError(err => {
        const message = err?.error?.message || 'No se pudo enviar el correo de prueba. Por favor intenta de nuevo.';
        return throwError(() => ({ error: { message } }));
      })
    );
  }

  confirmTestEmail(data: { email?: string; code: string }) {
    return this.api.post<{ success: boolean; verified: boolean; message: string }>(
      '/auth/confirm-test-email',
      data
    ).pipe(
      catchError(err => {
        const message = err?.error?.message || 'Código de comprobación incorrecto o expirado.';
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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('syseng-auth-login', { detail: res }));
    }
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
