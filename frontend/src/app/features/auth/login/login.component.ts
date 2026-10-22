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
      <!-- Background Ambient Glows -->
      <div class="bg-glow bg-glow--cyan"></div>
      <div class="bg-glow bg-glow--emerald"></div>
      <div class="bg-grid-overlay"></div>

      <div class="auth-split-card">
        <!-- Left: Form Column -->
        <div class="auth-form-side">
          <div class="auth-header">
            <a routerLink="/" class="brand-capsule" aria-label="SysEng Academy - Inicio">
              <span class="brand-capsule__icon">&lt;/&gt;</span>
              <span class="brand-capsule__name">SysEng<strong>Academy</strong></span>
            </a>

            <h1 class="auth-title">Iniciar Sesión</h1>
            <p class="auth-subtitle">Accede a tu panel para continuar tus retos y rutas</p>
          </div>

          @if (error()) {
            <div class="alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ error() }}</span>
            </div>
          }

          <div class="social-auth-stack">
            <button
              type="button"
              class="btn-social"
              (click)="loginWithSocial('google')"
              [disabled]="socialLoading() !== null"
            >
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{{ socialLoading() === 'google' ? 'Conectando con Google...' : 'Continuar con Google' }}</span>
            </button>

            <button
              type="button"
              class="btn-social"
              (click)="loginWithSocial('github')"
              [disabled]="socialLoading() !== null"
            >
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>{{ socialLoading() === 'github' ? 'Conectando con GitHub...' : 'Continuar con GitHub' }}</span>
            </button>
          </div>

          <div class="auth-divider">
            <span>o continúa con correo</span>
          </div>

          <form (ngSubmit)="submit()" #form="ngForm" class="auth-form">
            <div class="form-group">
              <label for="login-email">Correo electrónico</label>
              <div class="input-wrapper">
                <input
                  id="login-email"
                  class="input-field"
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="tu@email.com"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <div class="form-group">
              <div class="password-label-row">
                <label for="login-password">Contraseña</label>
                <button type="button" class="btn-forgot-link" (click)="openForgotModal()">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div class="input-wrapper">
                <input
                  id="login-password"
                  class="input-field"
                  type="password"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="••••••••"
                  required
                  autocomplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              class="btn-primary-action"
              [disabled]="loading()"
            >
              @if (loading()) {
                <span class="btn-spinner"></span>
                <span>Iniciando sesión...</span>
              } @else {
                <span>Iniciar Sesión</span>
                <span class="btn-arrow">→</span>
              }
            </button>
          </form>

          <div class="auth-footer">
            <span>¿No tienes una cuenta?</span>
            <a routerLink="/auth/registro" class="auth-switch-link">Crear una cuenta</a>
          </div>
        </div>

        <!-- Right: Dynamic Halftone Visual Column -->
        <div class="auth-visual-side">
          <app-halftone-visual></app-halftone-visual>
        </div>
      </div>

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
              <div class="form-group">
                <label>Correo electrónico</label>
                <input
                  class="input-field"
                  type="email"
                  [(ngModel)]="forgotEmail"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              <button
                type="button"
                class="btn-primary-action"
                style="margin-top: 1rem;"
                [disabled]="forgotLoading()"
                (click)="sendForgotCode()"
              >
                {{ forgotLoading() ? 'Enviando código...' : 'Continuar / Enviar Código' }}
              </button>
            } @else {
              <p class="modal-desc">
                Hemos enviado un código de 6 dígitos desde <strong>noreply&#64;sysengacademy.site</strong> a tu correo electrónico. Ingrésalo a continuación junto con tu nueva contraseña.
              </p>
              <div class="form-group">
                <label>Código de recuperación (6 dígitos)</label>
                <input
                  class="input-field code-input"
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
                  class="input-field"
                  type="password"
                  [(ngModel)]="newPassword"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div class="form-group">
                <label>Confirmar nueva contraseña</label>
                <input
                  class="input-field"
                  type="password"
                  [(ngModel)]="confirmNewPassword"
                  placeholder="Repite tu contraseña"
                  required
                />
              </div>
              <div class="modal-action-row">
                <button
                  type="button"
                  class="btn-secondary"
                  (click)="forgotStep.set(1)"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  class="btn-primary-action"
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
      .auth-page {
        min-height: calc(100vh - var(--header-height, 64px));
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2.5rem 1.5rem;
        background: #08090d;
        overflow: hidden;
      }

      /* Ambient Glows */
      .bg-glow {
        position: absolute;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        filter: blur(140px);
        pointer-events: none;
        opacity: 0.12;

        &--cyan {
          top: 10%;
          left: 15%;
          background: #00d9ff;
        }

        &--emerald {
          bottom: 10%;
          right: 15%;
          background: #0ae98a;
        }
      }

      .bg-grid-overlay {
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        background-size: 48px 48px;
        pointer-events: none;
      }

      /* Floating Split Card */
      .auth-split-card {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 960px;
        min-height: 580px;
        display: grid;
        grid-template-columns: 1.05fr 1fr;
        background: rgba(14, 18, 28, 0.82);
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 24px;
        box-shadow: 0 24px 70px -15px rgba(0, 0, 0, 0.7),
                    0 0 0 1px rgba(255, 255, 255, 0.03),
                    0 0 40px rgba(0, 217, 255, 0.05);
        overflow: hidden;
      }

      /* Left Form Column */
      .auth-form-side {
        padding: clamp(2rem, 3.5vw, 3rem);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .brand-capsule {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px 5px 6px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 9999px;
        text-decoration: none;
        margin-bottom: 1.5rem;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(0, 217, 255, 0.3);
        }

        &__icon {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          font-weight: 700;
          color: #08090d;
          background: #0ae98a;
          padding: 3px 6px;
          border-radius: 9999px;
        }

        &__name {
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;

          strong {
            color: #00d9ff;
          }
        }
      }

      .auth-title {
        font-size: clamp(1.5rem, 2.2vw, 1.85rem);
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #f8fafc;
        margin: 0 0 0.4rem 0;
      }

      .auth-subtitle {
        font-size: 0.88rem;
        color: #94a3b8;
        margin: 0 0 1.5rem 0;
        line-height: 1.5;
      }

      /* Social Buttons */
      .social-auth-stack {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
        margin-bottom: 1.25rem;
      }

      .btn-social {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.72rem 1.2rem;
        background: rgba(255, 255, 255, 0.035);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #f1f5f9;
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.07);
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
        margin-bottom: 1.25rem;

        &::before, &::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        span {
          padding: 0 0.85rem;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      }

      /* Form Fields */
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1.1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #cbd5e1;
        }
      }

      .password-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .btn-forgot-link {
          background: none;
          border: none;
          color: #00d9ff;
          font-size: 0.76rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s ease;

          &:hover {
            color: #38bdf8;
          }
        }
      }

      .input-wrapper {
        position: relative;
        width: 100%;
      }

      .input-field {
        width: 100%;
        background: rgba(6, 9, 15, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 0.75rem 1rem;
        color: #ffffff;
        font-size: 0.88rem;
        outline: none;
        box-sizing: border-box;
        transition: all 0.2s ease;

        &::placeholder {
          color: #475569;
        }

        &:focus {
          border-color: #00d9ff;
          box-shadow: 0 0 0 3px rgba(0, 217, 255, 0.14);
          background: rgba(6, 9, 15, 0.95);
        }

        &.code-input {
          font-family: var(--font-mono, monospace);
          font-size: 1.25rem;
          letter-spacing: 0.35em;
          text-align: center;
          font-weight: 700;
        }
      }

      /* Primary Action Button */
      .btn-primary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        width: 100%;
        padding: 0.8rem 1.4rem;
        margin-top: 0.35rem;
        background: #0ae98a;
        color: #08090d;
        border: none;
        border-radius: 12px;
        font-size: 0.92rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(10, 233, 138, 0.32);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        &:hover:not(:disabled) {
          background: #08d37c;
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(10, 233, 138, 0.42);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-arrow {
          font-size: 1.1rem;
          transition: transform 0.2s ease;
        }

        &:hover .btn-arrow {
          transform: translateX(3px);
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

      /* Footer Link */
      .auth-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        margin-top: 1.5rem;
        font-size: 0.84rem;
        color: #94a3b8;

        .auth-switch-link {
          color: #00d9ff;
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      /* Right Visual Side */
      .auth-visual-side {
        position: relative;
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        overflow: hidden;
        background: #06080e;
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

        .alert-icon {
          flex-shrink: 0;
        }
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

      /* Modal */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 2000;
        animation: fadeIn 0.2s ease;
      }

      .modal-card {
        background: #0f1523;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 20px;
        padding: 2rem;
        width: 100%;
        max-width: 440px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 217, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .modal-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          h3 {
            margin: 0;
            font-size: 1.15rem;
            color: #f8fafc;
            font-weight: 700;
          }
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: all 0.15s ease;

          &:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.12);
          }
        }
      }

      .modal-desc {
        margin: 0;
        font-size: 0.84rem;
        color: #94a3b8;
        line-height: 1.5;

        strong {
          color: #f1f5f9;
        }
      }

      .modal-action-row {
        display: flex;
        gap: 0.65rem;
        margin-top: 0.5rem;
      }

      .btn-secondary {
        flex: 1;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        color: #e2e8f0;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        padding: 0.75rem 1rem;
        transition: all 0.15s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to { opacity: 1; transform: scale(1); }
      }

      /* Responsive Breakpoint */
      @media (max-width: 960px) {
        .auth-split-card {
          grid-template-columns: 1fr;
          max-width: 480px;
          min-height: auto;
        }

        .auth-visual-side {
          display: none;
        }

        .auth-form-side {
          padding: 2rem 1.5rem;
        }
      }
    `
  ]
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

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
      next: (_res: any) => {
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
