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
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Las credenciales no son correctas.');
        this.loading.set(false);
      }
    });
  }
}
