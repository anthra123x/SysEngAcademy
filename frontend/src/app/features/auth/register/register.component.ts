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
    const user = this.auth.user();
    if (user?.role === 'admin' || user?.role === 'instructor') {
      this.router.navigate(['/docente']);
    } else {
      this.router.navigate(['/onboarding']);
    }
  }
}
