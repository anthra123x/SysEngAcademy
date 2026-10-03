import { Component, inject, signal } from '@angular/core';
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

        <h1>Crea tu cuenta</h1>
        <p class="auth-subtitle">Únete a SysEngAcademy y aprende programando.</p>

        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-group">
            <label>Nombre completo</label>
            <input
              class="input"
              type="text"
              name="name"
              [(ngModel)]="name"
              placeholder="Tu nombre completo"
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
              placeholder="Mínimo 8 caracteres"
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
            style="width:100%; margin-top: var(--sp-2);"
            [disabled]="loading()"
          >
            {{ loading() ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>

        <p class="auth-link">
          ¿Ya tienes cuenta?
          <a routerLink="/auth/login">Inicia sesión</a>
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

      .btn-block {
        width: 100%;
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
        font-size: 3rem;
        margin-bottom: 0.5rem;
      }

      .btn-email-preview-trigger {
        background: rgba(0, 217, 255, 0.12);
        border: 1px solid rgba(0, 217, 255, 0.35);
        color: #00d9ff;
        border-radius: 8px;
        padding: 8px 14px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 1rem;
        transition: all 0.15s;

        &:hover {
          background: rgba(0, 217, 255, 0.22);
          transform: translateY(-1px);
        }
      }

      .dev-hint-box {
        background: rgba(10, 233, 138, 0.08);
        border: 1px dashed rgba(10, 233, 138, 0.35);
        border-radius: 8px;
        padding: 0.65rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      .hint-code {
        color: #0ae98a;
        font-size: 1.15rem;
        letter-spacing: 0.2em;
        font-family: monospace;
        font-weight: 800;
      }

      .code-input {
        text-align: center;
        font-size: 1.6rem !important;
        letter-spacing: 0.25em;
        font-family: monospace;
        font-weight: 800;
      }

      .verify-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }

      .btn-resend {
        background: transparent;
        border: none;
        color: #00d9ff;
        font-size: 0.8125rem;
        cursor: pointer;
        text-decoration: underline;

        &:disabled {
          opacity: 0.5;
        }
      }

      /* EMAIL MODAL SIMULATOR */
      .email-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .email-modal-card {
        background: #0e131f;
        border: 1px solid #1e293b;
        border-radius: 12px;
        max-width: 540px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
      }

      .email-modal-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        background: #08090d;
        border-bottom: 1px solid #1e293b;

        .email-badge-client {
          font-size: 11px;
          color: #94a3b8;
          font-family: monospace;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 16px;
          cursor: pointer;
          &:hover {
            color: #ffffff;
          }
        }
      }

      .email-preview-container {
        padding: 0;
      }

      .email-preview-header {
        background: linear-gradient(180deg, #141b2d 0%, #0e131f 100%);
        padding: 20px 24px;
        text-align: center;
        border-bottom: 1px solid #1e293b;

        .preview-logo-badge {
          display: inline-block;
          background: #00d9ff;
          color: #030712;
          font-family: monospace;
          font-weight: 800;
          font-size: 13px;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .preview-logo-title {
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          span {
            color: #00d9ff;
          }
        }
      }

      .email-preview-body {
        padding: 24px;

        .preview-subject-line {
          font-size: 12px;
          color: #94a3b8;
          background: #08090d;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 16px;
          border-left: 3px solid #00d9ff;
          strong {
            color: #e2e8f0;
          }
        }

        .preview-greeting {
          font-size: 16px;
          color: #f8fafc;
          margin: 0 0 10px;
        }

        .preview-text {
          font-size: 13px;
          line-height: 1.6;
          color: #94a3b8;
          margin: 0 0 20px;
        }
      }

      .preview-code-box {
        background-color: #06080e;
        border: 2px dashed #0ae98a;
        border-radius: 10px;
        padding: 18px 15px;
        text-align: center;
        margin: 18px 0;
        box-shadow: inset 0 0 16px rgba(10, 233, 138, 0.08);

        .preview-code-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #0ae98a;
          display: block;
          margin-bottom: 6px;
          font-family: monospace;
        }

        .preview-code-value {
          font-family: monospace;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 10px;
          color: #0ae98a;
          display: block;
          text-shadow: 0 0 12px rgba(10, 233, 138, 0.4);
        }
      }

      .preview-security-note {
        background-color: #121826;
        border-left: 3px solid #00d9ff;
        padding: 10px 14px;
        border-radius: 0 6px 6px 0;
        font-size: 11px;
        color: #94a3b8;
        margin-bottom: 18px;
        line-height: 1.5;
      }

      .btn-copy-code {
        display: block;
        width: 100%;
        background: #00d9ff;
        color: #030712;
        border: none;
        font-weight: 700;
        font-size: 13px;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: #0ae98a;
        }
      }

      .email-preview-footer {
        background-color: #090c14;
        border-top: 1px solid #161f2e;
        padding: 14px 20px;
        text-align: center;
        font-size: 11px;
        color: #64748b;
        line-height: 1.4;
      }

      .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
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
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  name = '';
  email = '';
  password = '';
  passwordConfirm = '';

  loading = signal(false);
  error = signal('');

  submit() {
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

    this.auth
      .register({
        name: trimmedName,
        email: trimmedEmail,
        password: trimmedPassword,
        password_confirmation: this.passwordConfirm,
      })
      .subscribe({
        next: (_res: any) => {
          this.loading.set(false);
          this.finishRegistration();
        },
        error: err => {
          const errors = err.error?.errors;
          const first = errors ? (Object.values(errors)[0] as string[]) : null;
          this.error.set(first?.[0] ?? err.error?.message ?? 'Error al crear la cuenta.');
          this.loading.set(false);
        },
      });
  }

  finishRegistration() {
    const user = this.auth.user();
    if (
      user?.role === 'admin' ||
      user?.role === 'instructor'
    ) {
      this.router.navigate(['/docente']);
    } else {
      // Redirige directamente al onboarding y diagnóstico del estudiante
      this.router.navigate(['/onboarding']);
    }
  }
}
