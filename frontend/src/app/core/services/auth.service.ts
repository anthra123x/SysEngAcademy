import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Observer, throwError } from 'rxjs';
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

  handleSocialCallback(res: { user: User; token: string }) {
    this.setSession(res);
  }

  warmupBackend(): void {
    if (typeof window !== 'undefined') {
      try {
        fetch(`${this.api.baseUrl}/health`, {
          method: 'GET',
          cache: 'no-store',
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }
  }

  loginWithSocial(provider: 'google' | 'github', scopeType?: 'repo' | 'public_repo'): Observable<{ user: User; token: string; has_repo_scope?: boolean }> {
    return new Observable((observer: Observer<{ user: User; token: string; has_repo_scope?: boolean }>) => {
      if (typeof window === 'undefined') {
        observer.error(new Error('Entorno no disponible.'));
        return;
      }

      // Despertar el backend en Render silenciosamente en segundo plano
      this.warmupBackend();

      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const callbackUrl = isLocal
        ? 'http://localhost:8000/api/auth/' + provider + '/callback'
        : 'https://www.sysengacademy.site/api/auth/' + provider + '/callback';

      // Empaquetar estado para no depender del arranque síncrono del backend en Render
      const statePayload = {
        provider,
        user_id: this._user()?.id || null,
        scope_type: scopeType || null,
        ts: Date.now(),
        nonce: Math.random().toString(36).substring(2, 12),
      };
      const state = btoa(JSON.stringify(statePayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      let directAuthUrl = '';
      if (provider === 'google') {
        const googleClientId = '314182861423-0bodo7ijvgl1eno6h6ff8mnn0t4rfi4t.apps.googleusercontent.com';
        const params = new URLSearchParams({
          client_id: googleClientId,
          redirect_uri: callbackUrl,
          scope: 'openid profile email',
          response_type: 'code',
          state: state,
        });
        directAuthUrl = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
      } else if (provider === 'github') {
        const githubClientId = 'Ov23liaGFMbw7ABOai7u';
        const scopes = scopeType === 'repo' || scopeType === 'public_repo'
          ? 'read:user user:email public_repo'
          : 'read:user user:email';
        const params = new URLSearchParams({
          client_id: githubClientId,
          redirect_uri: callbackUrl,
          scope: scopes,
          response_type: 'code',
          state: state,
        });
        directAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
      } else {
        const params = scopeType ? `?scope_type=${scopeType}` : '';
        directAuthUrl = `${this.api.baseUrl}/auth/${provider}/redirect${params}`;
      }

      // Configurar dimensiones de la ventana centrada
      const width = 540;
      const height = 680;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const windowFeatures = `toolbar=no, menubar=no, width=${width}, height=${height}, top=${top}, left=${left}`;

      let popup: Window | null = null;
      try {
        // Abrir inmediatamente la ventana en 'about:blank' para respuesta instantánea (0ms de latencia de click)
        popup = window.open('about:blank', `syseng_oauth_${provider}`, windowFeatures);
        if (popup && !popup.closed) {
          const providerName = provider === 'google' ? 'Google' : 'GitHub';
          const brandColor = provider === 'google' ? '#4285F4' : '#00E599';
          try {
            popup.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Conectando con ${providerName} — SysEng Academy</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #08090D;
      color: #F8FAFC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid rgba(255, 255, 255, 0.08);
      border-top-color: ${brandColor};
      border-radius: 50%;
      animation: spin 0.65s linear infinite;
      margin-bottom: 16px;
    }
    .title { font-size: 14px; font-weight: 600; color: #F8FAFC; margin-bottom: 6px; }
    .subtitle { font-size: 12px; color: #94A3B8; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <div class="title">Conectando con ${providerName}...</div>
  <div class="subtitle">Abriendo autenticación segura</div>
</body>
</html>`);
            popup.document.close();
          } catch {}
          // Redirigir de inmediato al endpoint de OAuth
          popup.location.replace(directAuthUrl);
        }
      } catch {
        popup = null;
      }

      // Si el navegador bloqueó la ventana emergente, redirigir navegación completa
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        window.location.href = directAuthUrl;
        return;
      }

      const messageListener = (event: MessageEvent) => {
        if (event.data?.type === 'SYSENG_OAUTH_SUCCESS') {
          cleanup();
          const { user, token, has_repo_scope } = event.data;
          this.setSession({ user, token });
          observer.next({ user, token, has_repo_scope });
          observer.complete();
        } else if (event.data?.type === 'SYSENG_OAUTH_ERROR') {
          cleanup();
          observer.error(new Error(event.data.message || 'Error durante la autenticación social.'));
        }
      };

      const checkInterval = setInterval(() => {
        if (popup && popup.closed) {
          cleanup();
          // No emitir error si ya completó
        }
      }, 800);

      const cleanup = () => {
        window.removeEventListener('message', messageListener);
        clearInterval(checkInterval);
      };

      window.addEventListener('message', messageListener);
    });
  }

  getSocialStatus(): Observable<{
    google: { connected: boolean; nickname?: string; avatar_url?: string };
    github: {
      connected: boolean;
      nickname?: string;
      avatar_url?: string;
      has_repo_scope: boolean;
      syncs_count?: number;
      xp_earned?: number;
      recent_syncs?: {
        title: string;
        created_at: string;
        repo_url?: string;
        commit_url?: string;
        file_url?: string;
        repo_name?: string;
      }[];
    };
  }> {
    return this.api.get('/auth/social/status');
  }

  disconnectSocial(provider: 'google' | 'github'): Observable<{ success: boolean; message: string }> {
    return this.api.delete(`/auth/social/${provider}`);
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
