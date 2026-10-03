import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
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
            <label>Contraseña</label>
            <input
              class="input"
              type="password"
              name="password"
              [(ngModel)]="password"
              placeholder="••••••••"
              required
              minlength="8"
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
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
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
