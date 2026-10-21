import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <a routerLink="/" class="logo-link">
            <span class="logo-icon">&lt;/&gt;</span>
            <span>SysEng<span>Academy</span></span>
          </a>
        </div>

        <h1>Bienvenido de vuelta</h1>
        <p class="auth-subtitle">Ingresa tus credenciales para acceder a la plataforma</p>

        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }

        <div class="social-auth-grid">
          <button
            type="button"
            class="btn-social btn-google"
            (click)="loginWithSocial('google')"
            [disabled]="socialLoading() !== null"
          >
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{{ socialLoading() === 'google' ? 'Conectando...' : 'Google' }}</span>
          </button>

          <button
            type="button"
            class="btn-social btn-github"
            (click)="loginWithSocial('github')"
            [disabled]="socialLoading() !== null"
          >
            <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>{{ socialLoading() === 'github' ? 'Conectando...' : 'GitHub' }}</span>
          </button>
        </div>

        <div class="auth-divider">
          <span>o continúa con correo</span>
        </div>

        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              class="input"
              type="email"
              name="email"
              [(ngModel)]="email"
              placeholder="tu@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <div class="password-label-row">
              <label>Contraseña</label>
              <button type="button" class="btn-forgot-link" (click)="openForgotModal()">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input
              class="input"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-submit"
            [disabled]="loading()"
          >
            {{ loading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <p class="auth-link">
          ¿No tienes cuenta?
          <a routerLink="/auth/registro">Regístrate aquí</a>
        </p>

        @if (showForgotModal()) {
          <div class="modal-backdrop" (click)="closeForgotModal()">
            <div class="modal-card" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h3>Recuperar Contraseña</h3>
                <button type="button" class="btn-close" (click)="closeForgotModal()">✕</button>
              </div>

              @if (forgotSuccess()) {
                <div class="alert-success">{{ forgotSuccess() }}</div>
              }
              @if (forgotError()) {
                <div class="alert-error">{{ forgotError() }}</div>
              }

              @if (forgotStep() === 1) {
                <p class="modal-desc">Ingresa tu correo registrado para recibir un código de restablecimiento de contraseña.</p>
                <div class="form-group">
                  <label>Correo electrónico</label>
                  <input
                    class="input"
                    type="email"
                    [(ngModel)]="forgotEmail"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <button
                  type="button"
                  class="btn btn-primary"
                  style="width: 100%; margin-top: 1rem;"
                  [disabled]="forgotLoading()"
                  (click)="sendForgotCode()"
                >
                  {{ forgotLoading() ? 'Enviando código...' : 'Continuar' }}
                </button>
              } @else {
                <p class="modal-desc">Hemos enviado un código de 6 dígitos desde <strong>noreply&#64;sysengacademy.site</strong> a tu correo electrónico. Ingrésalo a continuación junto con tu nueva contraseña.</p>
                <div class="form-group">
                  <label>Código de recuperación (6 dígitos)</label>
                  <input
                    class="input"
                    type="text"
                    [(ngModel)]="resetCode"
                    placeholder="000000"
                    maxlength="6"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Nueva contraseña</label>
                  <input
                    class="input"
                    type="password"
                    [(ngModel)]="newPassword"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Confirmar nueva contraseña</label>
                  <input
                    class="input"
                    type="password"
                    [(ngModel)]="confirmNewPassword"
                    placeholder="Repite tu contraseña"
                    required
                  />
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    style="flex: 1;"
                    (click)="forgotStep.set(1)"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    style="flex: 2;"
                    [disabled]="forgotLoading()"
                    (click)="executeResetPassword()"
                  >
                    {{ forgotLoading() ? 'Actualizando...' : 'Restablecer' }}
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: calc(100vh - var(--header-height, 65px));
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--sp-8, 2rem) var(--sp-4, 1rem);
        background: radial-gradient(ellipse at center, rgba(0, 217, 255, 0.05) 0%, transparent 70%);
      }

      .auth-card {
        width: 100%;
        max-width: 440px;
        background: var(--bg-surface, #0f172a);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        border-radius: var(--radius-xl, 16px);
        padding: var(--sp-8, 2rem);
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.45);

        h1 {
          font-size: var(--text-2xl, 1.5rem);
          font-weight: var(--font-bold, 700);
          color: var(--text-primary, #ffffff);
          margin: var(--sp-6, 1.5rem) 0 var(--sp-2, 0.5rem);
        }
      }

      .auth-logo .logo-link {
        display: flex;
        align-items: center;
        gap: var(--sp-2, 0.5rem);
        text-decoration: none;
        font-size: var(--text-base, 1rem);
        font-weight: var(--font-bold, 700);
        color: var(--text-primary, #ffffff);
        span:last-child span {
          color: var(--primary, #00d9ff);
        }
      }

      .logo-icon {
        font-family: var(--font-mono, monospace);
        font-weight: var(--font-bold, 700);
        color: #030712;
        background: #00d9ff;
        padding: 3px 7px;
        border-radius: var(--radius-sm, 4px);
        font-size: var(--text-sm, 0.875rem);
      }

      .auth-subtitle {
        color: var(--text-secondary, #94a3b8);
        font-size: var(--text-sm, 0.875rem);
        margin-bottom: var(--sp-6, 1.5rem);
      }

      .alert-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        border-radius: var(--radius-md, 8px);
        font-size: var(--text-sm, 0.875rem);
        margin-bottom: var(--sp-5, 1.25rem);
        line-height: 1.45;
      }

      .social-auth-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }

      .btn-social {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1rem;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        color: #f1f5f9;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .social-icon {
          flex-shrink: 0;
        }
      }

      .btn-github {
        color: #ffffff;
      }

      .btn-google {
        color: #ffffff;
      }

      .auth-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin-bottom: 1.25rem;

        &::before, &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        span {
          padding: 0 0.75rem;
          color: #64748b;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      /* UNVERIFIED BLOCK */
      .unverified-card {
        background: rgba(255, 136, 0, 0.08);
        border: 1px solid rgba(255, 136, 0, 0.3);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1.25rem;
      }

      .unverified-header {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-bottom: 0.75rem;

        .unverified-icon {
          font-size: 1.25rem;
          line-height: 1;
        }

        strong {
          color: #ff9d33;
          font-size: 0.875rem;
          display: block;
        }

        p {
          margin: 0.2rem 0 0;
          font-size: 0.775rem;
          color: #cbd5e1;
          line-height: 1.4;
        }
      }

      .dev-hint-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(0, 217, 255, 0.1);
        border: 1px dashed rgba(0, 217, 255, 0.3);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        color: #94a3b8;
        margin-bottom: 0.75rem;

        code {
          color: #00d9ff;
          font-family: monospace;
          font-weight: 700;
          font-size: 0.85rem;
        }
      }

      .unverified-input-group {
        display: flex;
        gap: 8px;
      }

      .code-inline-input {
        flex: 1;
        font-family: monospace;
        letter-spacing: 0.15em;
        text-align: center;
        font-weight: 700;
      }

      .btn-sm {
        padding: 0.5rem 0.9rem;
        font-size: 0.8rem;
        white-space: nowrap;
      }

      .unverified-err-msg {
        display: block;
        color: #f87171;
        font-size: 0.75rem;
        margin-top: 0.4rem;
      }

      .unverified-actions {
        margin-top: 0.65rem;
        text-align: right;
      }

      .btn-link {
        background: transparent;
        border: none;
        color: #00d9ff;
        font-size: 0.75rem;
        cursor: pointer;
        text-decoration: underline;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      form {
        display: flex;
        flex-direction: column;
        gap: var(--sp-4, 1rem);
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary, #cbd5e1);
        }
      }

      .input {
        background: rgba(3, 7, 18, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        color: #ffffff;
        font-size: 0.875rem;
        outline: none;
        transition: border-color 0.15s;

        &:focus {
          border-color: #00d9ff;
        }
      }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
      }

      .btn-primary {
        background: #00d9ff;
        color: #030712;

        &:hover:not(:disabled) {
          background: #0ae98a;
          transform: translateY(-1px);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      .btn-submit {
        width: 100%;
        margin-top: var(--sp-2, 0.5rem);
        padding: 0.75rem 1.25rem;
        font-size: 0.875rem;
      }

      .auth-link {
        text-align: center;
        margin-top: var(--sp-5, 1.25rem);
        font-size: var(--text-sm, 0.875rem);
        color: var(--text-secondary, #94a3b8);
        a {
          color: #00d9ff;
          text-decoration: none;
          font-weight: 600;
          &:hover {
            text-decoration: underline;
          }
        }
      }

      .password-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--sp-1, 0.25rem);

        label {
          margin-bottom: 0 !important;
        }

        .btn-forgot-link {
          background: none;
          border: none;
          color: var(--primary, #00d9ff);
          font-size: var(--text-xs, 0.75rem);
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.2s ease;

          &:hover {
            color: #38bdf8;
          }
        }
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-card {
        width: 100%;
        max-width: 420px;
        background: var(--bg-surface, #0f172a);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.12));
        border-radius: var(--radius-xl, 16px);
        padding: 1.75rem;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          h3 {
            margin: 0;
            font-size: 1.25rem;
            color: #ffffff;
            font-weight: 700;
          }

          .btn-close {
            background: none;
            border: none;
            color: var(--text-muted, #94a3b8);
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0.25rem;
            line-height: 1;

            &:hover {
              color: #ffffff;
            }
          }
        }

        .modal-desc {
          font-size: 0.875rem;
          color: var(--text-muted, #94a3b8);
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }
      }

      .alert-success {
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.35);
        color: #4ade80;
        padding: 0.75rem;
        border-radius: var(--radius-md, 8px);
        font-size: 0.875rem;
        margin-bottom: 1rem;
      }

      .animate-fade-in {
        animation: fadeIn 0.25s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  socialLoading = signal<'google' | 'github' | null>(null);

  loginWithSocial(provider: 'google' | 'github') {
    if (this.socialLoading()) return;
    this.socialLoading.set(provider);
    this.error.set('');

    this.auth.loginWithSocial(provider).subscribe({
      next: (res: any) => {
        this.socialLoading.set(null);
        this.redirectAfterAuth(res.user);
      },
      error: (err: any) => {
        this.socialLoading.set(null);
        const msg = err?.message || 'Error durante la autenticación social.';
        if (!msg.includes('cancelada')) {
          this.error.set(msg);
        }
      }
    });
  }

  // Estados de recuperación de contraseña
  showForgotModal = signal(false);
  forgotStep = signal<1 | 2>(1);
  forgotEmail = '';
  resetCode = '';
  newPassword = '';
  confirmNewPassword = '';
  forgotLoading = signal(false);
  forgotError = signal('');
  forgotSuccess = signal('');

  ngOnInit() {
    this.auth.warmupBackend();
    const params = this.route.snapshot.queryParamMap;
    const mode = params.get('mode');
    const email = params.get('email');
    const code = params.get('code');

    if (mode === 'reset' || (email && code)) {
      if (email) this.forgotEmail = email.trim();
      if (code) this.resetCode = code.trim();
      this.showForgotModal.set(true);
      this.forgotStep.set(2);
    }
  }

  submit() {
    if (this.loading()) return;
    this.error.set('');

    const cleanEmail = (this.email || '').trim().toLowerCase();
    const cleanPassword = this.password || '';

    if (!cleanEmail) {
      this.error.set('Por favor ingresa tu correo electrónico.');
      return;
    }
    if (!cleanPassword) {
      this.error.set('Por favor ingresa tu contraseña.');
      return;
    }

    this.loading.set(true);

    this.auth.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: res => {
        const user = res?.user || this.auth.user();
        this.loading.set(false);
        this.redirectAfterAuth(user);
      },
      error: err => {
        this.loading.set(false);
        const errMsg = err.error?.message ?? 'Las credenciales no son correctas.';
        this.error.set(errMsg);
      },
    });
  }

  openForgotModal() {
    this.forgotEmail = this.email.trim();
    this.resetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.forgotError.set('');
    this.forgotSuccess.set('');
    this.forgotStep.set(1);
    this.showForgotModal.set(true);
  }

  closeForgotModal() {
    this.showForgotModal.set(false);
  }

  sendForgotCode() {
    const email = this.forgotEmail.trim().toLowerCase();
    if (!email) {
      this.forgotError.set('Por favor ingresa tu correo electrónico.');
      return;
    }
    this.forgotLoading.set(true);
    this.forgotError.set('');
    this.forgotSuccess.set('');

    this.auth.forgotPassword(email).subscribe({
      next: (res: any) => {
        this.forgotLoading.set(false);
        this.resetCode = '';
        this.forgotSuccess.set(res?.message || 'Código de recuperación enviado desde noreply@sysengacademy.site. Revisa tu correo o carpeta de spam.');
        this.forgotStep.set(2);
      },
      error: (err: any) => {
        this.forgotLoading.set(false);
        this.forgotError.set(err.error?.message || 'Error al solicitar el código.');
      }
    });
  }

  executeResetPassword() {
    const email = this.forgotEmail.trim().toLowerCase();
    const code = this.resetCode.trim();
    if (!code || code.length < 6) {
      this.forgotError.set('Por favor ingresa el código de 6 dígitos.');
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.forgotError.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.forgotError.set('Las contraseñas no coinciden.');
      return;
    }

    this.forgotLoading.set(true);
    this.forgotError.set('');
    this.forgotSuccess.set('');

    this.auth.resetPassword({
      email,
      code,
      password: this.newPassword,
      password_confirmation: this.confirmNewPassword,
    }).subscribe({
      next: (res: any) => {
        this.forgotLoading.set(false);
        this.email = email;
        this.password = this.newPassword;
        this.closeForgotModal();
        this.error.set('');
        this.submit();
      },
      error: (err: any) => {
        this.forgotLoading.set(false);
        this.forgotError.set(err.error?.message || 'Código inválido o expirado.');
      }
    });
  }

  private redirectAfterAuth(user: any) {
    if (
      user?.role === 'admin' ||
      user?.role === 'instructor'
    ) {
      this.router.navigate(['/docente']);
    } else {
      // Para estudiantes: si no ha completado el diagnóstico inicial ir a onboarding
      const isDiagDone = this.auth.isDiagnosticCompleted(user?.email);

      if (!isDiagDone) {
        this.router.navigate(['/onboarding']);
      } else {
        this.router.navigate(['/perfil']);
      }
    }
  }
}
