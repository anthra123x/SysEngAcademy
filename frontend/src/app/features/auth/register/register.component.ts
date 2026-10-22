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
    <div class="auth-page">
      <!-- Background Subtle Grid -->
      <div class="grid-lines" aria-hidden="true"></div>

      <!-- Main Fullscreen Split Layout -->
      <main class="auth-main-layout">
        <!-- LEFT SIDE: Clean, Minimalist Registration Form -->
        <div class="auth-form-column">
          <div class="auth-form-container">
            <!-- Brand Badge -->
            <a routerLink="/" class="brand-header" aria-label="SysEng Academy - Inicio">
              <div class="brand-icon">&lt;/&gt;</div>
              <span class="brand-text">SysEng<span class="text-brand">Academy</span></span>
            </a>

            @if (step() === 1) {
              <!-- Step 1 Header -->
              <div class="auth-header-group">
                <h1 class="auth-title">Crea tu cuenta</h1>
                <p class="auth-subtitle">Únete a SysEng Academy y aprende ingeniería práctica</p>
              </div>

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
                  <svg class="social-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.2.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                  </svg>
                  <span>{{ socialLoading() === 'google' ? 'Registrando con Google...' : 'Continuar con Google' }}</span>
                </button>

                <button
                  type="button"
                  class="btn-social"
                  (click)="registerWithSocial('github')"
                  [disabled]="socialLoading() !== null"
                >
                  <svg class="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>{{ socialLoading() === 'github' ? 'Registrando con GitHub...' : 'Continuar con GitHub' }}</span>
                </button>
              </div>

              <!-- Divider -->
              <div class="clean-divider">
                <div class="divider-line"></div>
                <span class="divider-text">o regístrate con correo</span>
                <div class="divider-line"></div>
              </div>

              <!-- Registration Form -->
              <form (ngSubmit)="submitStep1()" #form="ngForm" class="credentials-form">
                <div class="input-group">
                  <label for="reg-name" class="input-label">Nombre completo</label>
                  <input
                    id="reg-name"
                    class="field-input"
                    type="text"
                    name="name"
                    [(ngModel)]="name"
                    placeholder="Tu nombre y apellido"
                    required
                    autocomplete="name"
                  />
                </div>

                <div class="input-group">
                  <label for="reg-email" class="input-label">Correo electrónico</label>
                  <input
                    id="reg-email"
                    class="field-input"
                    type="email"
                    name="email"
                    [(ngModel)]="email"
                    placeholder="tu@syseng.io"
                    required
                    autocomplete="email"
                  />
                </div>

                <div class="inputs-row">
                  <div class="input-group">
                    <label for="reg-password" class="input-label">Contraseña</label>
                    <input
                      id="reg-password"
                      class="field-input input-mono"
                      type="password"
                      name="password"
                      [(ngModel)]="password"
                      placeholder="Mín. 8 caracteres"
                      required
                      minlength="8"
                    />
                  </div>

                  <div class="input-group">
                    <label for="reg-password-confirm" class="input-label">Confirmar</label>
                    <input
                      id="reg-password-confirm"
                      class="field-input input-mono"
                      type="password"
                      name="password_confirmation"
                      [(ngModel)]="passwordConfirm"
                      placeholder="Repite clave"
                      required
                    />
                  </div>
                </div>

                <div class="submit-wrap">
                  <button
                    type="submit"
                    class="btn-stitch-primary"
                    [disabled]="loading()"
                  >
                    @if (loading()) {
                      <span class="btn-spinner"></span>
                      <span>Enviando código...</span>
                    } @else {
                      <span>Continuar / Enviar Código</span>
                      <svg class="arrow-svg" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    }
                  </button>
                </div>
              </form>

              <!-- Footer -->
              <div class="auth-switch-footer">
                <span>¿Ya tienes una cuenta?</span>
                <a routerLink="/auth/login" class="link-brand">Iniciar sesión</a>
              </div>
            } @else {
              <!-- Step 2: Verification Flow -->
              <div class="auth-header-group">
                <h1 class="auth-title">Verifica tu correo</h1>
                <p class="auth-subtitle">
                  Hemos enviado un código de 6 dígitos a <strong>{{ email }}</strong>
                </p>
              </div>

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

              <form (ngSubmit)="submitStep2()" class="credentials-form">
                <div class="input-group">
                  <label for="reg-code" class="input-label" style="text-align: center;">Código de activación recibido</label>
                  <input
                    id="reg-code"
                    class="field-input input-code"
                    type="text"
                    name="code"
                    [(ngModel)]="verificationCode"
                    placeholder="000000"
                    maxlength="6"
                    required
                    autocomplete="one-time-code"
                  />
                </div>

                <div class="submit-wrap">
                  <button
                    type="submit"
                    class="btn-stitch-primary"
                    [disabled]="loading() || verificationCode.trim().length !== 6"
                  >
                    @if (loading()) {
                      <span class="btn-spinner"></span>
                      <span>Verificando y creando cuenta...</span>
                    } @else {
                      <span>Verificar y Crear Cuenta</span>
                      <span class="btn-check">✓</span>
                    }
                  </button>
                </div>
              </form>

              <div class="verify-action-stack">
                <button
                  type="button"
                  class="btn-resend-inline"
                  [disabled]="resendLoading() || resendCooldown() > 0"
                  (click)="resendCode()"
                >
                  {{ resendCooldown() > 0 ? ('Reenviar código en ' + resendCooldown() + 's') : (resendLoading() ? 'Reenviando...' : '¿No recibiste el correo? Reenviar código') }}
                </button>

                <button
                  type="button"
                  class="btn-back-inline"
                  (click)="backToStep1()"
                >
                  ← Corregir correo o datos
                </button>
              </div>
            }
          </div>
        </div>

        <!-- RIGHT SIDE: Fluid Organic Halftone Art Field -->
        <div class="auth-visual-column">
          <app-halftone-visual></app-halftone-visual>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        min-height: 100vh;
        background: #050911;
      }

      .auth-page {
        min-height: 100vh;
        min-height: 100dvh;
        width: 100%;
        background: #050911;
        color: #f8fafc;
        position: relative;
        overflow-x: hidden;
      }

      /* Subtle grid background covering entire screen */
      .grid-lines {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background-size: 48px 48px;
        background-image: 
          linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      }

      /* Fullscreen Split Layout: 50% left, 50% right */
      .auth-main-layout {
        position: relative;
        z-index: 10;
        width: 100%;
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: space-between;
      }

      /* LEFT COLUMN: Clean Minimal Form */
      .auth-form-column {
        width: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 5rem);
        z-index: 20;
        box-sizing: border-box;
      }

      .auth-form-container {
        width: 100%;
        max-width: 420px;
        display: flex;
        flex-direction: column;
      }

      /* Brand Header */
      .brand-header {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        text-decoration: none;
        margin-bottom: 2rem;
        width: fit-content;

        .brand-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #00E599 0%, #14b8a6 100%);
          color: #050911;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 229, 153, 0.25);
          transition: transform 0.2s ease;
        }

        &:hover .brand-icon {
          transform: scale(1.05);
        }

        .brand-text {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #94a3b8;

          .text-brand {
            color: #00E599;
          }
        }
      }

      /* Header Titles */
      .auth-header-group {
        margin-bottom: 2rem;

        .auth-title {
          font-size: clamp(2rem, 3.2vw, 2.45rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 0.5rem 0;
          line-height: 1.15;
        }

        .auth-subtitle {
          font-size: 0.88rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.45;
        }
      }

      /* Social SSO Buttons Stack */
      .social-stack {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .btn-social {
        width: 100%;
        height: 44px;
        padding: 0 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
        color: #e2e8f0;
        font-size: 0.875rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.25);
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .social-icon {
          flex-shrink: 0;
        }
      }

      /* Clean Horizontal Divider */
      .clean-divider {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 1.5rem 0;
        position: relative;

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider-text {
          padding: 0 0.85rem;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          background: #050911;
          flex-shrink: 0;
        }
      }

      /* Credentials Form */
      .credentials-form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;
      }

      .inputs-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }

      .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .input-label {
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: 0.75rem;
        font-weight: 500;
        color: #cbd5e1;
      }

      .field-input {
        width: 100%;
        height: 42px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 0 0.9rem;
        font-size: 0.88rem;
        color: #f8fafc;
        outline: none;
        box-sizing: border-box;
        transition: all 0.15s ease;

        &::placeholder {
          color: #64748b;
        }

        &:focus {
          border-color: #00E599;
          box-shadow: 0 0 0 1px #00E599;
          background: rgba(255, 255, 255, 0.05);
        }

        &.input-mono {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
        }

        &.input-code {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 1.35rem;
          letter-spacing: 0.35em;
          text-align: center;
          font-weight: 700;
        }
      }

      /* Submit Button */
      .submit-wrap {
        padding-top: 0.5rem;
      }

      .btn-stitch-primary {
        width: 100%;
        height: 46px;
        padding: 0 1.25rem;
        border-radius: 12px;
        border: none;
        background: #00E599;
        color: #030712;
        font-size: 0.95rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 229, 153, 0.25);
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          background: #00c985;
          box-shadow: 0 6px 26px rgba(0, 229, 153, 0.38);
          transform: translateY(-1px);

          .arrow-svg {
            transform: translateX(3px);
          }
        }

        &:active:not(:disabled) {
          transform: translateY(0);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .arrow-svg {
          width: 16px;
          height: 16px;
          transition: transform 0.15s ease;
        }

        .btn-check {
          font-weight: 900;
          font-size: 1.1rem;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(5, 9, 17, 0.3);
          border-top-color: #050911;
          border-radius: 50%;
          animation: spin 0.7s infinite linear;
        }
      }

      /* Switch Footer */
      .auth-switch-footer {
        margin-top: 2rem;
        text-align: center;
        font-size: 0.85rem;
        color: #94a3b8;

        .link-brand {
          color: #00E599;
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.35rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      /* Verification actions */
      .verify-action-stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.85rem;
        margin-top: 1.5rem;

        .btn-resend-inline {
          background: none;
          border: none;
          color: #00E599;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;

          &:hover:not(:disabled) {
            text-decoration: underline;
          }

          &:disabled {
            color: #64748b;
            cursor: not-allowed;
          }
        }

        .btn-back-inline {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          cursor: pointer;

          &:hover {
            color: #ffffff;
            text-decoration: underline;
          }
        }
      }

      /* RIGHT COLUMN: Particle Canvas Field */
      .auth-visual-column {
        width: 50%;
        min-height: 100vh;
        min-height: 100dvh;
        position: relative;
        overflow: hidden;
      }

      /* Alert Badges */
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
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #34d399;
        padding: 0.75rem 1rem;
        border-radius: 10px;
        font-size: 0.82rem;
        text-align: center;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Responsive layout for tablet and mobile */
      @media (max-width: 1024px) {
        .auth-main-layout {
          flex-direction: column;
        }

        .auth-form-column {
          width: 100%;
          min-height: 100vh;
          padding: 2.5rem 1.5rem;
        }

        .inputs-row {
          grid-template-columns: 1fr;
        }

        .auth-visual-column {
          display: none;
        }
      }
    `
  ]
})
export class RegisterComponent implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);

  step = signal<1 | 2>(1);
  name = '';
  email = '';
  password = '';
  passwordConfirm = '';
  verificationCode = '';

  loading = signal(false);
  socialLoading = signal<'google' | 'github' | null>(null);
  resendLoading = signal(false);
  resendCooldown = signal(0);
  error = signal<string>('');
  successMsg = signal<string>('');

  registerWithSocial(provider: 'google' | 'github') {
    this.socialLoading.set(provider);
    this.error.set('');

    this.auth.loginWithSocial(provider).subscribe({
      next: () => {
        this.socialLoading.set(null);
        this.router.navigate(['/perfil']);
      },
      error: (err: any) => {
        this.socialLoading.set(null);
        this.error.set(err?.message || 'Error durante la autenticación social.');
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
