import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
        <p class="auth-subtitle">Ingresa tus credenciales para continuar</p>

        @if (error()) {
          <div class="alert-error">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-group">
            <label>Correo electrónico</label>
            <input class="input" type="email" name="email" [(ngModel)]="email"
              placeholder="tu@email.com" required autocomplete="email">
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input class="input" type="password" name="password" [(ngModel)]="password"
              placeholder="••••••••" required minlength="8" autocomplete="current-password">
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%; margin-top: var(--sp-4);" [disabled]="loading()">
            {{ loading() ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <!-- Accesos rápidos de prueba para Docente y Estudiante -->
        <div class="test-accounts-section">
          <span class="test-accounts-label">Accesos rápidos de prueba:</span>
          <div class="test-accounts-buttons">
            <button type="button" class="btn-account-pill" (click)="fillDocente()">
              👨‍🏫 Docente Principal
            </button>
            <button type="button" class="btn-account-pill" (click)="fillEstudiante()">
              🎓 Estudiante Demo
            </button>
          </div>
        </div>

        <p class="auth-link">
          ¿No tienes cuenta?
          <a routerLink="/auth/registro">Regístrate</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - var(--header-height));
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--sp-8) var(--sp-4);
      background: radial-gradient(ellipse at center, rgba(108,99,255,0.05) 0%, transparent 70%);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-8);

      h1 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        margin: var(--sp-6) 0 var(--sp-2);
      }
    }

    .auth-logo {
      .logo-link {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        text-decoration: none;
        font-size: var(--text-base);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        span:last-child span { color: var(--primary); }
      }

      .logo-icon {
        font-family: var(--font-mono);
        font-weight: var(--font-bold);
        color: var(--accent);
        background: var(--accent-dim);
        padding: 3px 7px;
        border-radius: var(--radius-sm);
        font-size: var(--text-sm);
      }
    }

    .auth-subtitle {
      color: var(--text-secondary);
      font-size: var(--text-sm);
      margin-bottom: var(--sp-6);
    }

    .alert-error {
      background: var(--danger-dim);
      border: 1px solid rgba(255,82,82,0.3);
      color: var(--danger);
      padding: var(--sp-3) var(--sp-4);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      margin-bottom: var(--sp-5);
    }

    form { display: flex; flex-direction: column; gap: var(--sp-4); }

    .test-accounts-section {
      margin-top: var(--sp-4);
      padding: var(--sp-3);
      background: rgba(255, 255, 255, 0.02);
      border: 1px dashed var(--border);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .test-accounts-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
    }

    .test-accounts-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-account-pill {
      flex: 1;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary);
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-surface);
        border-color: var(--primary);
        color: var(--primary);
      }
    }

    .auth-link {
      text-align: center;
      margin-top: var(--sp-5);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      a { color: var(--primary); }
    }
  `]
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  fillDocente() {
    this.email = 'andrescamilomartinez330@gmail.com';
    this.password = 'kimetsunoyaiBa1';
    this.error.set('');
  }

  fillEstudiante() {
    this.email = 'estudiante@sysengacademy.dev';
    this.password = 'estudiante1234';
    this.error.set('');
  }

  submit() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        const user = res?.user || this.auth.user();
        if (
          user?.email === 'andrescamilomartinez330@gmail.com' ||
          user?.role === 'admin' ||
          user?.role === 'instructor'
        ) {
          this.router.navigate(['/docente']);
        } else {
          const isDiagDone = typeof window !== 'undefined' ? localStorage.getItem('syseng_diagnostic_completed') : 'true';
          if (!isDiagDone) {
            this.router.navigate(['/perfil'], { queryParams: { onboarding: 'true' } });
          } else {
            this.router.navigate(['/perfil']);
          }
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Las credenciales no son correctas.');
        this.loading.set(false);
      }
    });
  }
}
