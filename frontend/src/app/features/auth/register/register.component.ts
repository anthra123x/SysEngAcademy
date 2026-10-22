import { Component, inject, signal, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HalftoneVisualComponent } from '../halftone-visual/halftone-visual.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, HalftoneVisualComponent],
  template: `
    <div class="auth-viewport-wrapper">
      <div class="auth-portal-card">
        <!-- Left: Form Column -->
        <div class="form-column">
          <div class="form-content">
            <!-- Brand Badge -->
            <a routerLink="/" class="brand-badge" aria-label="SysEng Academy - Inicio">
              <span class="badge-icon">&lt;/&gt;</span>
              <span class="badge-title">SYSENG<span class="badge-accent">ACADEMY</span></span>
            </a>

            @if (step() === 1) {
              <!-- Step 1 Header -->
              <h1 class="portal-title">Crea tu cuenta</h1>
              <p class="portal-subtitle">Únete a SysEng Academy y aprende ingeniería práctica</p>

              @if (error()) {
                <div class="alert-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ error() }}</span>
                </div>
              }

              <!-- Social Stack -->
              <div class="social-stack">
                <button
                  type="button"
                  class="btn-social"
                  (click)="registerWithSocial('google')"
                  [disabled]="socialLoading() !== null"
                >
                  <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{{ socialLoading() === 'google' ? 'Registrando con Google...' : 'Continuar con Google' }}</span>
                </button>

                <button
                  type="button"
                  class="btn-social"
                  (click)="registerWithSocial('github')"
                  [disabled]="socialLoading() !== null"
                >
                  <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>{{ socialLoading() === 'github' ? 'Registrando con GitHub...' : 'Continuar con GitHub' }}</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="auth-divider">
                <span>O regístrate con correo</span>
              </div>

              <!-- Registration Form -->
              <form (ngSubmit)="submitStep1()" #form="ngForm" class="portal-form">
                <div class="form-group">
                  <label for="reg-name">Nombre completo</label>
                  <input
                    id="reg-name"
                    class="form-input"
                    type="text"
                    name="name"
                    [(ngModel)]="name"
                    placeholder="Tu nombre y apellido"
                    required
                    autocomplete="name"
                  />
                </div>

                <div class="form-group">
                  <label for="reg-email">Correo electrónico</label>
                  <input
                    id="reg-email"
                    class="form-input"
                    type="email"
                    name="email"
                    [(ngModel)]="email"
                    placeholder="tu@syseng.io"
                    required
                    autocomplete="email"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="reg-password">Contraseña</label>
                    <input
                      id="reg-password"
                      class="form-input"
                      type="password"
                      name="password"
                      [(ngModel)]="password"
                      placeholder="Mín. 8 caracteres"
                      required
                      minlength="8"
                    />
                  </div>

                  <div class="form-group">
                    <label for="reg-password-confirm">Confirmar</label>
                    <input
                      id="reg-password-confirm"
                      class="form-input"
                      type="password"
                      name="password_confirmation"
                      [(ngModel)]="passwordConfirm"
                      placeholder="Repite clave"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn-portal-submit"
                  [disabled]="loading()"
                >
                  @if (loading()) {
                    <span class="btn-spinner"></span>
                    <span>Enviando código...</span>
                  } @else {
                    <span>Continuar / Enviar Código</span>
                    <span class="btn-arrow">→</span>
                  }
                </button>
              </form>

              <!-- Footer -->
              <div class="portal-footer">
                <span>¿Ya tienes una cuenta?</span>
                <a routerLink="/auth/login" class="switch-link">Iniciar sesión</a>
              </div>
            } @else {
              <!-- Step 2: Verification Flow -->
              <h1 class="portal-title">Verifica tu correo</h1>
              <p class="portal-subtitle">
                Hemos enviado un código de 6 dígitos a <strong>{{ email }}</strong>
              </p>

              @if (successMsg()) {
                <div class="alert-success" role="status">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{{ successMsg() }}</span>
                </div>
              }

              @if (error()) {
                <div class="alert-error" role="alert">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>{{ error() }}</span>
                </div>
              }

              <form (ngSubmit)="submitStep2()" class="portal-form">
                <div class="form-group">
                  <label for="reg-code" class="text-center">Código de activación recibido</label>
                  <input
                    id="reg-code"
                    class="form-input code-input"
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
                  class="btn-portal-submit"
                  [disabled]="loading() || verificationCode.trim().length !== 6"
                >
                  @if (loading()) {
                    <span class="btn-spinner"></span>
                    <span>Verificando y creando cuenta...</span>
                  } @else {
                    <span>Verificar y Crear Cuenta</span>
                    <span class="btn-arrow">✓</span>
                  }
                </button>
              </form>

              <div class="verify-actions">
                <button
                  type="button"
                  class="btn-resend-link"
                  [disabled]="resendLoading() || resendCooldown() > 0"
                  (click)="resendCode()"
                >
                  {{ resendCooldown() > 0 ? ('Reenviar código en ' + resendCooldown() + 's') : (resendLoading() ? 'Reenviando...' : '¿No recibiste el correo? Reenviar código') }}
                </button>

                <button
                  type="button"
                  class="btn-back-link"
                  (click)="backToStep1()"
                >
                  ← Corregir correo o datos
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Right: Dynamic Particle & Wave Field -->
        <div class="visual-column">
          <app-halftone-visual></app-halftone-visual>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
        background: #02040a;
      }

      .auth-viewport-wrapper {
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        align-items: stretch;
        padding: 12px;
        background: #02040a;
        box-sizing: border-box;
      }

      /* Full Viewport Card with glowing violet border */
      .auth-portal-card {
        position: relative;
        width: 100%;
        min-height: calc(100vh - 24px);
        display: grid;
        grid-template-columns: minmax(420px, 490px) 1fr;
        background: #030712;
        border: 2px solid #6366f1;
        border-radius: 18px;
        box-shadow: 0 0 24px rgba(99, 102, 241, 0.16),
                    inset 0 0 20px rgba(99, 102, 241, 0.04);
        overflow: hidden;

        /* Subtle grid background */
        background-image: linear-gradient(rgba(255, 255, 255, 0.016) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.016) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* Left Form Column */
      .form-column {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(2rem, 5vw, 4rem) clamp(2rem, 4vw, 3.5rem);
        z-index: 2;
      }

      .form-content {
        width: 100%;
        max-width: 380px;
        display: flex;
        flex-direction: column;
      }

      /* Brand Badge */
      .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        margin-bottom: 2rem;
        width: fit-content;

        .badge-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #0ae98a;
          color: #030712;
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 900;
          padding: 3px 6px;
          border-radius: 6px;
          letter-spacing: -0.05em;
        }

        .badge-title {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #e2e8f0;

          .badge-accent {
            color: #0ae98a;
          }
        }
      }

      /* Title & Subtitle */
      .portal-title {
        font-size: clamp(2rem, 2.6vw, 2.35rem);
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.025em;
        margin: 0 0 0.5rem 0;
        line-height: 1.15;
      }

      .portal-subtitle {
        font-size: 0.88rem;
        color: #94a3b8;
        margin: 0 0 1.85rem 0;
        line-height: 1.45;

        strong {
          color: #f1f5f9;
        }
      }

      /* Social Stack */
      .social-stack {
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        margin-bottom: 1.5rem;
      }

      .btn-social {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.78rem 1.2rem;
        background: rgba(255, 255, 255, 0.025);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #f1f5f9;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.22);
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

      /* Divider */
      .auth-divider {
        display: flex;
        align-items: center;
        text-align: center;
        margin-bottom: 1.5rem;

        &::before, &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        span {
          padding: 0 0.85rem;
          color: #64748b;
          font-family: var(--font-mono, monospace);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
      }

      /* Form Controls */
      .portal-form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        label {
          font-family: var(--font-mono, monospace);
          font-size: 0.76rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.03em;

          &.text-center {
            text-align: center;
            display: block;
          }
        }
      }

      .form-input {
        width: 100%;
        background: #080c16;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 10px;
        padding: 0.82rem 1rem;
        color: #ffffff;
        font-size: 0.9rem;
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s ease;

        &::placeholder {
          color: #334155;
        }

        &:focus {
          border-color: #00d9ff;
          box-shadow: 0 0 0 2px rgba(0, 217, 255, 0.16);
          background: #0a0f1c;
        }

        &.code-input {
          font-family: var(--font-mono, monospace);
          font-size: 1.35rem;
          letter-spacing: 0.35em;
          text-align: center;
          font-weight: 700;
        }
      }

      /* Submit Button */
      .btn-portal-submit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        width: 100%;
        padding: 0.85rem 1.4rem;
        margin-top: 0.35rem;
        background: #0ae98a;
        color: #030712;
        border: none;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 4px 22px rgba(10, 233, 138, 0.4);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover:not(:disabled) {
          background: #00f59b;
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(10, 233, 138, 0.52);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-arrow {
          font-size: 1.15rem;
          transition: transform 0.2s ease;
        }

        &:hover .btn-arrow {
          transform: translateX(4px);
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(8, 9, 13, 0.3);
          border-top-color: #08090d;
          border-radius: 50%;
          animation: spin 0.7s infinite linear;
        }
      }

      /* Footer */
      .portal-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 1.85rem;
        font-size: 0.85rem;
        color: #94a3b8;

        .switch-link {
          color: #0ae98a;
          font-weight: 700;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      /* Step 2 Actions */
      .verify-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.75rem;
      }

      .btn-resend-link {
        background: none;
        border: none;
        color: #00d9ff;
        font-family: var(--font-mono, monospace);
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        padding: 4px;
        text-decoration: underline;
        text-underline-offset: 3px;
        transition: color 0.15s ease;

        &:hover:not(:disabled) {
          color: #38bdf8;
        }

        &:disabled {
          color: #64748b;
          cursor: not-allowed;
          text-decoration: none;
        }
      }

      .btn-back-link {
        background: none;
        border: none;
        color: #94a3b8;
        font-family: var(--font-mono, monospace);
        font-size: 0.76rem;
        cursor: pointer;
        padding: 4px;
        transition: color 0.15s ease;

        &:hover {
          color: #f1f5f9;
        }
      }

      /* Right Visual Column */
      .visual-column {
        position: relative;
        overflow: hidden;
        background: #030712;
        border-left: 1px solid rgba(255, 255, 255, 0.05);
      }

      /* Alerts */
      .alert-error {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #f87171;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.82rem;
        margin-bottom: 1.25rem;
        line-height: 1.45;
      }

      .alert-success {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.82rem;
        margin-bottom: 1.25rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Mobile Breakpoint */
      @media (max-width: 960px) {
        .auth-viewport-wrapper {
          padding: 6px;
        }

        .auth-portal-card {
          grid-template-columns: 1fr;
          min-height: calc(100vh - 12px);
          border-radius: 14px;
        }

        .visual-column {
          display: none;
        }

        .form-column {
          padding: 2rem 1.5rem;
        }

        .form-content {
          max-width: 100%;
        }
      }
    `
  ]
})
export class RegisterComponent implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  passwordConfirm = '';
  verificationCode = '';

  step = signal<1 | 2>(1);
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
      next: (_res: any) => {
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

    this.auth
      .resendRegisterCode(this.email.trim().toLowerCase())
      .subscribe({
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
