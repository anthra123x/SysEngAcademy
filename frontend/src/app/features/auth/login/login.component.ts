import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { HalftoneVisualComponent } from '../halftone-visual/halftone-visual.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, HalftoneVisualComponent],
  template: `
    <div class="auth-page">
      <!-- Background Subtle Grid -->
      <div class="grid-lines" aria-hidden="true"></div>

      <!-- Main Fullscreen Split Layout -->
      <main class="auth-main-layout">
        <!-- LEFT SIDE: Clean, Minimalist Login Form (Matches Stitch reference) -->
        <div class="auth-form-column">
          <div class="auth-form-container">
            <!-- Brand Badge -->
            <a routerLink="/" class="brand-header" aria-label="SysEng Academy - Inicio">
              <div class="brand-icon">&lt;/&gt;</div>
              <span class="brand-text">SysEng<span class="text-brand">Academy</span></span>
            </a>

            <!-- Header Titles -->
            <div class="auth-header-group">
              <h1 class="auth-title">Iniciar Sesión</h1>
              <p class="auth-subtitle">Accede a tu cuenta para continuar</p>
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

            <!-- Social SSO Buttons -->
            <div class="social-stack">
              <!-- Google Auth Button -->
              <button
                type="button"
                class="btn-social"
                (click)="loginWithSocial('google')"
                [disabled]="socialLoading() !== null"
              >
                <svg class="social-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8 0-1.2.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                </svg>
                <span>{{ socialLoading() === 'google' ? 'Conectando con Google...' : 'Continuar con Google' }}</span>
              </button>

              <!-- GitHub Auth Button -->
              <button
                type="button"
                class="btn-social"
                (click)="loginWithSocial('github')"
                [disabled]="socialLoading() !== null"
              >
                <svg class="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>{{ socialLoading() === 'github' ? 'Conectando con GitHub...' : 'Continuar con GitHub' }}</span>
              </button>
            </div>

            <!-- Clean Horizontal Divider -->
            <div class="clean-divider">
              <div class="divider-line"></div>
              <span class="divider-text">o continúa con correo</span>
              <div class="divider-line"></div>
            </div>

            <!-- Credentials Form -->
            <form (ngSubmit)="submit()" #form="ngForm" class="credentials-form">
              <!-- Email field -->
              <div class="input-group">
                <label for="login-email" class="input-label">Correo electrónico</label>
                <input
                  id="login-email"
                  class="field-input"
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="tu@syseng.io"
                  required
                  autocomplete="email"
                />
              </div>

              <!-- Password field -->
              <div class="input-group">
                <div class="password-label-bar">
                  <label for="login-password" class="input-label">Contraseña</label>
                  <button type="button" class="btn-forgot-inline" (click)="openForgotModal()">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  id="login-password"
                  class="field-input input-mono"
                  type="password"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="••••••••••••"
                  required
                  autocomplete="current-password"
                />
              </div>

              <!-- Submit Button -->
              <div class="submit-wrap">
                <button
                  type="submit"
                  class="btn-stitch-primary"
                  [disabled]="loading()"
                >
                  @if (loading()) {
                    <span class="btn-spinner"></span>
                    <span>Iniciando sesión...</span>
                  } @else {
                    <span>Iniciar Sesión</span>
                    <svg class="arrow-svg" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  }
                </button>
              </div>
            </form>

            <!-- Footer Switch Link -->
            <div class="auth-switch-footer">
              <span>¿No tienes una cuenta aún?</span>
              <a routerLink="/auth/registro" class="link-brand">Crear una cuenta</a>
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: Fluid Organic Halftone Art Field -->
        <div class="auth-visual-column">
          <app-halftone-visual></app-halftone-visual>
        </div>
      </main>

      <!-- Forgot Password Modal -->
      @if (showForgotModal()) {
        <div class="modal-backdrop" (click)="closeForgotModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-group">
                <span class="modal-icon">🔐</span>
                <h3>Recuperar Contraseña</h3>
              </div>
              <button type="button" class="btn-close" (click)="closeForgotModal()" aria-label="Cerrar modal">✕</button>
            </div>

            @if (forgotSuccess()) {
              <div class="alert-success">{{ forgotSuccess() }}</div>
            }
            @if (forgotError()) {
              <div class="alert-error">{{ forgotError() }}</div>
            }

            @if (forgotStep() === 1) {
              <p class="modal-desc">
                Ingresa tu correo registrado para recibir un código de restablecimiento de 6 dígitos.
              </p>
              <div class="input-group">
                <label class="input-label">Correo electrónico</label>
                <input
                  class="field-input"
                  type="email"
                  [(ngModel)]="forgotEmail"
                  placeholder="tu@syseng.io"
                  required
                />
              </div>
              <button
                type="button"
                class="btn-stitch-primary"
                style="margin-top: 1rem; width: 100%;"
                [disabled]="forgotLoading()"
                (click)="sendForgotCode()"
              >
                {{ forgotLoading() ? 'Enviando código...' : 'Continuar / Enviar Código' }}
              </button>
            } @else {
              <p class="modal-desc">
                Hemos enviado un código de 6 dígitos desde <strong>noreply&#64;sysengacademy.site</strong> a tu correo electrónico. Ingrésalo a continuación junto con tu nueva contraseña.
              </p>
              <div class="input-group">
                <label class="input-label">Código de recuperación (6 dígitos)</label>
                <input
                  class="field-input input-code"
                  type="text"
                  [(ngModel)]="resetCode"
                  placeholder="000000"
                  maxlength="6"
                  required
                />
              </div>
              <div class="input-group" style="margin-top: 0.75rem;">
                <label class="input-label">Nueva contraseña</label>
                <input
                  class="field-input"
                  type="password"
                  [(ngModel)]="newPassword"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div class="input-group" style="margin-top: 0.75rem;">
                <label class="input-label">Confirmar nueva contraseña</label>
                <input
                  class="field-input"
                  type="password"
                  [(ngModel)]="confirmNewPassword"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
              <div class="modal-action-row" style="margin-top: 1.25rem;">
                <button
                  type="button"
                  class="btn-modal-back"
                  (click)="forgotStep.set(1)"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  class="btn-stitch-primary"
                  style="flex: 2;"
                  [disabled]="forgotLoading()"
                  (click)="executeResetPassword()"
                >
                  {{ forgotLoading() ? 'Actualizando...' : 'Restablecer Contraseña' }}
                </button>
              </div>
            }
          </div>
        </div>
      }
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

      .password-label-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .btn-forgot-inline {
          background: none;
          border: none;
          padding: 0;
          color: #94a3b8;
          font-size: 0.75rem;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.15s ease;

          &:hover {
            color: #00E599;
            text-decoration: underline;
          }
        }
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

      /* Modal for Password Recovery */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 2000;
      }

      .modal-card {
        background: #09101d;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        padding: 1.75rem;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        color: #e2e8f0;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          h3 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 700;
            color: #ffffff;
          }
        }

        .btn-close {
          background: none;
          border: none;
          color: #64748b;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;

          &:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.05);
          }
        }
      }

      .modal-desc {
        font-size: 0.85rem;
        color: #94a3b8;
        line-height: 1.5;
        margin-bottom: 1.25rem;
      }

      .modal-action-row {
        display: flex;
        gap: 0.75rem;
      }

      .btn-modal-back {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #cbd5e1;
        padding: 0 1.25rem;
        font-size: 0.88rem;
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
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

        .auth-visual-column {
          display: none;
        }
      }
    `
  ]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal(false);
  socialLoading = signal<'google' | 'github' | null>(null);
  error = signal<string | null>(null);

  // Forgot password state
  showForgotModal = signal(false);
  forgotStep = signal<1 | 2>(1);
  forgotEmail = '';
  resetCode = '';
  newPassword = '';
  confirmNewPassword = '';
  forgotLoading = signal(false);
  forgotError = signal<string | null>(null);
  forgotSuccess = signal<string | null>(null);

  ngOnInit(): void {
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    if (errorParam) {
      if (errorParam === 'oauth_cancelled') {
        this.error.set('Inicio de sesión cancelado.');
      } else if (errorParam === 'oauth_failed') {
        this.error.set('No se pudo autenticar con el proveedor social. Inténtalo de nuevo.');
      } else {
        this.error.set(decodeURIComponent(errorParam));
      }
    }
  }

  submit(): void {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.error?.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.'
        );
      }
    });
  }

  loginWithSocial(provider: 'google' | 'github'): void {
    this.socialLoading.set(provider);
    this.error.set(null);

    this.authService.loginWithSocial(provider).subscribe({
      next: () => {
        this.socialLoading.set(null);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.socialLoading.set(null);
        this.error.set(err?.message || 'Error durante la autenticación social.');
      }
    });
  }

  openForgotModal(): void {
    this.forgotEmail = this.email || '';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.forgotStep.set(1);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.showForgotModal.set(true);
  }

  closeForgotModal(): void {
    this.showForgotModal.set(false);
  }

  sendForgotCode(): void {
    if (!this.forgotEmail) {
      this.forgotError.set('Ingresa tu correo electrónico.');
      return;
    }
    this.forgotLoading.set(true);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: (res: any) => {
        this.forgotLoading.set(false);
        this.forgotSuccess.set(res?.message || 'Código de recuperación enviado. Revisa tu bandeja de entrada.');
        this.forgotStep.set(2);
      },
      error: (err: any) => {
        this.forgotLoading.set(false);
        this.forgotError.set(err.error?.message || 'Error al solicitar recuperación. Verifica el correo.');
      }
    });
  }

  executeResetPassword(): void {
    if (!this.resetCode || !this.newPassword) {
      this.forgotError.set('Completa el código y tu nueva contraseña.');
      return;
    }
    if (this.newPassword.length < 6) {
      this.forgotError.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.forgotError.set('Las contraseñas no coinciden.');
      return;
    }

    this.forgotLoading.set(true);
    this.forgotError.set(null);
    this.forgotSuccess.set(null);

    this.authService.resetPassword({
      email: this.forgotEmail,
      code: this.resetCode,
      password: this.newPassword,
      password_confirmation: this.confirmNewPassword
    }).subscribe({
      next: (res: any) => {
        this.forgotLoading.set(false);
        this.forgotSuccess.set('¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.');
        setTimeout(() => {
          this.showForgotModal.set(false);
          this.email = this.forgotEmail;
          this.password = '';
        }, 1800);
      },
      error: (err: any) => {
        this.forgotLoading.set(false);
        this.forgotError.set(err.error?.message || 'Código inválido o expirado.');
      }
    });
  }
}
