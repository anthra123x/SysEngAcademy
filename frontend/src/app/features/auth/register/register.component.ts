import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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

        @if (step() === 1) {
          <h1>Crea tu cuenta</h1>
          <p class="auth-subtitle">Únete a SysEng Academy y aprende ingeniería práctica.</p>

          @if (error()) {
            <div class="alert-error">{{ error() }}</div>
          }

          <div class="social-auth-grid">
            <button
              type="button"
              class="btn-social btn-google"
              (click)="registerWithSocial('google')"
              [disabled]="socialLoading() !== null"
            >
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{{ socialLoading() === 'google' ? 'Registrando...' : 'Google' }}</span>
            </button>

            <button
              type="button"
              class="btn-social btn-github"
              (click)="registerWithSocial('github')"
              [disabled]="socialLoading() !== null"
            >
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>{{ socialLoading() === 'github' ? 'Registrando...' : 'GitHub' }}</span>
            </button>
          </div>

          <div class="auth-divider">
            <span>o regístrate con correo</span>
          </div>

          <form (ngSubmit)="submitStep1()" #form="ngForm">
            <div class="form-group">
              <label>Nombre completo</label>
              <input
                class="input"
                type="text"
                name="name"
                [(ngModel)]="name"
                placeholder="Tu nombre y apellido"
                required
                autocomplete="name"
              />
            </div>

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
              <label>Contraseña</label>
              <input
                class="input"
                type="password"
                name="password"
                [(ngModel)]="password"
                placeholder="Mínimo 8 caracteres (letras y números)"
                required
                minlength="8"
              />
            </div>

            <div class="form-group">
              <label>Confirmar contraseña</label>
              <input
                class="input"
                type="password"
                name="password_confirmation"
                [(ngModel)]="passwordConfirm"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              style="width: 100%; margin-top: var(--sp-2, 0.5rem);"
              [disabled]="loading()"
            >
              {{ loading() ? 'Enviando código de verificación...' : 'Continuar / Enviar Código' }}
            </button>
          </form>

          <p class="auth-link">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login">Inicia sesión</a>
          </p>
        } @else {
          <div class="verify-step">
            <div class="verify-icon">✉️</div>
            <h1>Verifica tu correo</h1>
            <p class="auth-subtitle">
              Hemos enviado un código de 6 dígitos desde <strong>noreply&#64;sysengacademy.site</strong> a <strong>{{ email }}</strong>.
            </p>

            @if (successMsg()) {
              <div class="alert-success">{{ successMsg() }}</div>
            }

            @if (error()) {
              <div class="alert-error">{{ error() }}</div>
            }

            <form (ngSubmit)="submitStep2()">
              <div class="form-group">
                <label style="text-align: center; display: block; margin-bottom: 4px;">Código de verificación recibido</label>
                <input
                  class="input code-input"
                  type="text"
                  name="code"
                  [(ngModel)]="verificationCode"
                  placeholder="000000"
                  maxlength="6"
                  required
                  autocomplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                style="width: 100%; margin-top: 1rem;"
                [disabled]="loading() || verificationCode.trim().length !== 6"
              >
                {{ loading() ? 'Verificando y creando cuenta...' : 'Verificar y Crear Cuenta' }}
              </button>
            </form>

            <div class="verify-secondary-actions">
              <button
                type="button"
                class="btn-resend"
                [disabled]="resendLoading() || resendCooldown() > 0"
                (click)="resendCode()"
              >
                {{ resendCooldown() > 0 ? ('Reenviar código en ' + resendCooldown() + 's') : (resendLoading() ? 'Reenviando...' : '¿No recibiste el correo? Reenviar código') }}
              </button>

              <button
                type="button"
                class="btn-back"
                (click)="backToStep1()"
              >
                ← Corregir correo o datos
              </button>
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
        background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.06) 0%, transparent 70%);
      }

      .auth-card {
        width: 100%;
        max-width: 440px;
        background: var(--bg-surface, #0f172a);
        border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        border-radius: var(--radius-xl, 16px);
        padding: var(--sp-8, 2rem);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);

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
        line-height: 1.5;

        strong {
          color: #f8fafc;
        }
      }

      .alert-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        padding: var(--sp-3, 0.75rem) var(--sp-4, 1rem);
        border-radius: var(--radius-md, 8px);
        font-size: var(--text-sm, 0.875rem);
        margin-bottom: var(--sp-5, 1.25rem);
      }

      .alert-success {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        padding: var(--sp-4, 1rem);
        border-radius: var(--radius-md, 8px);
        font-size: var(--text-sm, 0.875rem);
        text-align: center;
        margin-bottom: var(--sp-4, 1rem);
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
        padding: 0.7rem 1.25rem;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.15s;
        border: none;
        text-decoration: none;
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

      /* VERIFY STEP */
      .verify-step {
        text-align: center;
      }

      .verify-icon {
        font-size: 2.8rem;
        margin-bottom: 0.25rem;
      }

      .code-input {
        text-align: center;
        font-size: 1.8rem !important;
        letter-spacing: 0.35em;
        font-family: monospace;
        font-weight: 800;
        color: #0ae98a !important;
        background: #06080e !important;
        border: 2px dashed #00d9ff !important;
        padding: 12px 16px !important;
      }

      .verify-secondary-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        margin-top: 1.5rem;
      }

      .btn-resend {
        background: transparent;
        border: none;
        color: #00d9ff;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        transition: opacity 0.15s;

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          text-decoration: none;
        }

        &:hover:not(:disabled) {
          color: #0ae98a;
        }
      }

      .btn-back {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.8125rem;
        cursor: pointer;
        transition: color 0.15s;

        &:hover {
          color: #ffffff;
        }
      }
    `,
  ],
})
export class RegisterComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.auth.warmupBackend();
  }

  step = signal<1 | 2>(1);

  name = '';
  email = '';
  password = '';
  passwordConfirm = '';
  verificationCode = '';

  loading = signal(false);
  resendLoading = signal(false);
  resendCooldown = signal(0);
  error = signal('');
  successMsg = signal('');
  socialLoading = signal<'google' | 'github' | null>(null);

  registerWithSocial(provider: 'google' | 'github') {
    if (this.socialLoading()) return;
    this.socialLoading.set(provider);
    this.error.set('');

    this.auth.loginWithSocial(provider).subscribe({
      next: (res: any) => {
        this.socialLoading.set(null);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.socialLoading.set(null);
        const msg = err?.message || 'Error durante el registro social.';
        if (!msg.includes('cancelada')) {
          this.error.set(msg);
        }
      }
    });
  }

  private cooldownTimer: any = null;

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  submitStep1() {
    if (this.loading()) return;

    const trimmedName = (this.name || '').trim();
    const trimmedEmail = (this.email || '').trim().toLowerCase();
    const trimmedPassword = this.password || '';

    if (!trimmedName || trimmedName.length < 3) {
      this.error.set('Por favor ingresa tu nombre completo (mínimo 3 caracteres).');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      this.error.set('Por favor ingresa un correo electrónico válido y completo (ejemplo: usuario@correo.com).');
      return;
    }

    if (trimmedPassword.length < 8) {
      this.error.set('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    if (!/[A-Za-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword)) {
      this.error.set('Por seguridad, la contraseña debe contener al menos una letra y un número.');
      return;
    }

    if (this.password !== this.passwordConfirm) {
      this.error.set('Las contraseñas no coinciden. Por favor verifica ambos campos.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.successMsg.set('');

    this.auth
      .requestRegisterCode({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        password_confirmation: this.passwordConfirm,
      })
      .subscribe({
        next: (res: any) => {
          this.loading.set(false);
          this.step.set(2);
          this.successMsg.set(res?.message || 'Código de activación enviado a tu correo. Revisa tu buzón o spam.');
          this.startCooldown(30);
        },
        error: err => {
          this.loading.set(false);
          const errors = err.error?.errors;
          const first = errors ? (Object.values(errors)[0] as string[]) : null;
          this.error.set(first?.[0] ?? err.error?.message ?? 'Error al solicitar el código de activación.');
        },
      });
  }

  submitStep2() {
    if (this.loading()) return;

    const code = (this.verificationCode || '').trim();
    if (!code || code.length !== 6) {
      this.error.set('Por favor ingresa el código de activación de 6 dígitos.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.successMsg.set('');

    this.auth
      .confirmRegister({
        email: this.email.trim().toLowerCase(),
        code,
      })
      .subscribe({
        next: (_res: any) => {
          this.loading.set(false);
          this.finishRegistration();
        },
        error: err => {
          this.loading.set(false);
          this.error.set(err.error?.message || 'Código de activación inválido o expirado.');
        },
      });
  }

  resendCode() {
    if (this.resendLoading() || this.resendCooldown() > 0) return;

    this.resendLoading.set(true);
    this.error.set('');
    this.successMsg.set('');

    this.auth.resendRegisterCode(this.email.trim().toLowerCase()).subscribe({
      next: (res: any) => {
        this.resendLoading.set(false);
        this.successMsg.set(res?.message || 'Hemos reenviado el código a tu correo electrónico.');
        this.startCooldown(45);
      },
      error: err => {
        this.resendLoading.set(false);
        this.error.set(err.error?.message || 'No se pudo reenviar el código. Intenta de nuevo más tarde.');
      },
    });
  }

  backToStep1() {
    this.step.set(1);
    this.error.set('');
    this.successMsg.set('');
    this.verificationCode = '';
  }

  private startCooldown(seconds: number) {
    this.resendCooldown.set(seconds);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const cur = this.resendCooldown();
      if (cur <= 1) {
        this.resendCooldown.set(0);
        clearInterval(this.cooldownTimer);
      } else {
        this.resendCooldown.set(cur - 1);
      }
    }, 1000);
  }

  finishRegistration() {
    this.router.navigate(['/perfil']);
  }
}
