import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="verify-page">
      <div class="verify-card">
        <!-- Logo -->
        <div class="brand-logo">
          <a routerLink="/" class="logo-link">
            <span class="logo-icon">&lt;/&gt;</span>
            <span class="logo-text">SysEng<span>Academy</span></span>
          </a>
        </div>

        @if (status() === 'loading') {
          <div class="state-container">
            <div class="spinner-pulse"></div>
            <h1 class="state-title">Verificando tu cuenta...</h1>
            <p class="state-desc">
              Estamos activando tu perfil de estudiante y configurando tu espacio de aprendizaje.
            </p>
            <div class="status-badge">Validando credenciales seguras</div>
          </div>
        }

        @if (status() === 'success') {
          <div class="state-container success-state">
            <div class="icon-circle success-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 class="state-title">¡Cuenta Verificada con Éxito!</h1>
            <p class="state-desc">
              Tu correo ha sido confirmado correctamente. Te estamos redirigiendo directamente a tu perfil...
            </p>
            <div class="action-row">
              <a routerLink="/perfil" class="btn btn-primary">
                Ir a mi Perfil Ahora →
              </a>
            </div>
          </div>
        }

        @if (status() === 'error') {
          <div class="state-container error-state">
            <div class="icon-circle error-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h1 class="state-title">No pudimos verificar la cuenta</h1>
            <p class="state-desc error-text">
              {{ errorMessage() }}
            </p>

            <div class="form-container">
              <p class="form-instruction">
                Puedes reintentar introduciendo tu código de 6 dígitos recibido por correo:
              </p>
              
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  class="input" 
                  [(ngModel)]="manualEmail" 
                  placeholder="tu@email.com"
                />
              </div>

              <div class="form-group">
                <label>Código de 6 dígitos</label>
                <input 
                  type="text" 
                  class="input code-input" 
                  [(ngModel)]="manualCode" 
                  maxlength="6"
                  placeholder="Ej: 738006"
                />
              </div>

              <button 
                type="button" 
                class="btn btn-primary" 
                (click)="retryManualVerification()"
                [disabled]="isRetrying()"
              >
                {{ isRetrying() ? 'Verificando...' : 'Verificar y Acceder' }}
              </button>

              <div class="action-links">
                <button type="button" class="btn-text-link" (click)="requestNewCode()">
                  Solicitar un nuevo código
                </button>
                <span class="sep">•</span>
                <a routerLink="/auth/login" class="btn-text-link">
                  Iniciar Sesión
                </a>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: calc(100vh - 4rem);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--sp-6, 1.5rem) var(--sp-4, 1rem);
      background: radial-gradient(circle at top center, rgba(10, 233, 138, 0.05) 0%, rgba(6, 8, 14, 0.98) 100%), #06080E;
    }

    .verify-card {
      width: 100%;
      max-width: 480px;
      background: #0C101A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: var(--sp-8, 2rem) var(--sp-6, 1.5rem);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
      text-align: center;
    }

    .brand-logo {
      margin-bottom: var(--sp-6, 1.5rem);
    }

    .logo-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .logo-icon {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
      color: #0AE98A;
      background: rgba(10, 233, 138, 0.12);
      border: 1px solid rgba(10, 233, 138, 0.3);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .logo-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.5px;
    }

    .logo-text span {
      color: #00D9FF;
    }

    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--sp-4, 1rem) 0;
    }

    .state-title {
      font-size: 1.45rem;
      font-weight: 700;
      color: #F8FAFC;
      margin: 1rem 0 0.5rem;
    }

    .state-desc {
      font-size: 0.92rem;
      color: #94A3B8;
      line-height: 1.55;
      margin-bottom: 1.25rem;
      max-width: 380px;
    }

    .error-text {
      color: #F87171;
    }

    .spinner-pulse {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 3px solid rgba(0, 217, 255, 0.2);
      border-top-color: #00D9FF;
      border-right-color: #0AE98A;
      animation: spin 0.9s linear infinite;
      margin-bottom: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .status-badge {
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.75rem;
      color: #00D9FF;
      background: rgba(0, 217, 255, 0.08);
      border: 1px solid rgba(0, 217, 255, 0.2);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      letter-spacing: 0.5px;
    }

    .icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .icon-circle svg {
      width: 32px;
      height: 32px;
    }

    .success-circle {
      background: rgba(10, 233, 138, 0.12);
      border: 2px solid #0AE98A;
      color: #0AE98A;
      box-shadow: 0 0 24px rgba(10, 233, 138, 0.25);
    }

    .error-circle {
      background: rgba(239, 68, 68, 0.12);
      border: 2px solid #EF4444;
      color: #EF4444;
      box-shadow: 0 0 24px rgba(239, 68, 68, 0.25);
    }

    .action-row {
      margin-top: 1rem;
      width: 100%;
    }

    .form-container {
      width: 100%;
      margin-top: 1rem;
      text-align: left;
    }

    .form-instruction {
      font-size: 0.85rem;
      color: #94A3B8;
      text-align: center;
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #CBD5E1;
      margin-bottom: 0.35rem;
    }

    .input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: #080A10;
      border: 1px solid #1E293B;
      border-radius: 8px;
      color: #F8FAFC;
      font-size: 0.95rem;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }

    .input:focus {
      outline: none;
      border-color: #00D9FF;
    }

    .code-input {
      text-align: center;
      font-family: 'Courier New', Courier, monospace;
      font-size: 1.4rem;
      letter-spacing: 6px;
      font-weight: 800;
      color: #0AE98A;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      width: 100%;
      box-sizing: border-box;
    }

    .btn-primary {
      background: #00D9FF;
      color: #030712;
      box-shadow: 0 4px 15px rgba(0, 217, 255, 0.25);
    }

    .btn-primary:hover:not(:disabled) {
      background: #38E1FF;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .action-links {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 1.25rem;
      font-size: 0.85rem;
    }

    .sep {
      color: #475569;
    }

    .btn-text-link {
      background: none;
      border: none;
      color: #00D9FF;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      padding: 0;
    }

    .btn-text-link:hover {
      text-decoration: underline;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal('');
  isRetrying = signal(false);

  manualEmail = '';
  manualCode = '';

  ngOnInit() {
    // Si ya está autenticado con sesión activa, redirigir directamente al perfil
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/perfil']);
      return;
    }

    const email = (this.route.snapshot.queryParamMap.get('email') || '').trim();
    const code = (this.route.snapshot.queryParamMap.get('code') || '').trim();

    this.manualEmail = email;
    this.manualCode = code;

    if (email && code && code.length === 6) {
      this.executeVerification(email, code);
    } else {
      this.status.set('error');
      this.errorMessage.set(
        code
          ? 'El enlace de activación requiere la dirección de correo asociada.'
          : 'Por favor ingresa tu correo y el código de 6 dígitos recibido para verificar tu cuenta.'
      );
    }
  }

  private executeVerification(email: string, code: string) {
    this.status.set('loading');
    this.errorMessage.set('');

    this.auth.confirmRegister({ email, code }).subscribe({
      next: (_res: any) => {
        this.status.set('success');
        // Redirige al perfil del estudiante directamente
        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 1200);
      },
      error: err => {
        this.status.set('error');
        this.errorMessage.set(
          err?.error?.message ||
          'El código de activación es inválido o ha expirado. Por favor ingresa el código más reciente.'
        );
      }
    });
  }

  retryManualVerification() {
    const email = this.manualEmail.trim().toLowerCase();
    const code = this.manualCode.trim();

    if (!email || !code || code.length !== 6) {
      this.errorMessage.set('Por favor ingresa un correo válido y el código completo de 6 dígitos.');
      return;
    }

    this.isRetrying.set(true);
    this.auth.confirmRegister({ email, code }).subscribe({
      next: (_res: any) => {
        this.isRetrying.set(false);
        this.status.set('success');
        setTimeout(() => {
          this.router.navigate(['/perfil']);
        }, 1000);
      },
      error: err => {
        this.isRetrying.set(false);
        this.status.set('error');
        this.errorMessage.set(
          err?.error?.message || 'Código inválido o expirado. Revisa tu bandeja de entrada o solicita uno nuevo.'
        );
      }
    });
  }

  requestNewCode() {
    const email = this.manualEmail.trim().toLowerCase();
    if (!email) {
      this.errorMessage.set('Por favor ingresa tu correo electrónico para enviarte un nuevo código.');
      return;
    }

    this.isRetrying.set(true);
    this.auth.resendRegisterCode(email).subscribe({
      next: (res: any) => {
        this.isRetrying.set(false);
        this.errorMessage.set(
          res?.message || 'Hemos enviado un nuevo código a tu correo. Revisa tu bandeja de entrada e ingrésalo.'
        );
      },
      error: err => {
        this.isRetrying.set(false);
        this.errorMessage.set(
          err?.error?.message || 'No se pudo enviar un nuevo código. Intenta registrarte nuevamente.'
        );
      }
    });
  }
}
