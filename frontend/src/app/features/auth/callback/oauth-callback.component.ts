import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        @if (!errorMessage()) {
          <div class="brand-badge">
            <span class="pulse-dot"></span>
            SYSENG ACADEMY AUTH
          </div>

          <div class="spinner-container">
            <div class="spinner-ring"></div>
            <div class="spinner-core">
              @if (provider() === 'google') {
                <svg class="provider-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
                </svg>
              } @else if (provider() === 'github') {
                <svg class="provider-icon" viewBox="0 0 24 24" width="24" height="24" fill="#00E599">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              } @else {
                <div class="dot-indicator"></div>
              }
            </div>
          </div>

          <h2 class="title">{{ statusTitle() }}</h2>
          <p class="subtitle">{{ statusSubtitle() }}</p>

          <div class="progress-track">
            <div class="progress-bar" [style.width.%]="progressPercent()"></div>
          </div>

          @if (isSlowWakeup()) {
            <div class="warmup-note">
              <span class="note-icon">⚡</span>
              <span>Iniciando instancia segura de alta disponibilidad. Por favor no cierres esta ventana.</span>
            </div>
          }
        } @else {
          <div class="error-badge">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#F87171" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 class="error-title">No se pudo iniciar sesión</h2>
          <p class="error-desc">{{ errorMessage() }}</p>

          <button class="retry-btn" (click)="returnToLogin()">
            Volver a Iniciar Sesión
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 25%, #18192a 0%, #08090d 100%);
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .callback-card {
      background: rgba(17, 18, 29, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 44px 36px;
      text-align: center;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 30px rgba(168, 85, 247, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.25);
      color: #C084FC;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 6px 14px;
      border-radius: 999px;
      margin-bottom: 28px;
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #A855F7;
      box-shadow: 0 0 8px #A855F7;
      animation: pulse 1.8s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.4; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .spinner-container {
      position: relative;
      width: 80px;
      height: 80px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.06);
      border-top-color: #A855F7;
      border-right-color: #38BDF8;
      animation: spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite;
    }

    .spinner-core {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .provider-icon {
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4));
    }

    .dot-indicator {
      width: 14px;
      height: 14px;
      background: #A855F7;
      border-radius: 50%;
      box-shadow: 0 0 12px #A855F7;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .title {
      color: #F8FAFC;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
      letter-spacing: -0.01em;
    }

    .subtitle {
      color: #94A3B8;
      font-size: 13.5px;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .progress-track {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 18px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #A855F7, #38BDF8, #00E599);
      border-radius: 999px;
      transition: width 0.4s ease-out;
    }

    .warmup-note {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.2);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #BAE6FD;
      text-align: left;
      line-height: 1.4;
      animation: fadeIn 0.4s ease-out;
    }

    .note-icon {
      font-size: 15px;
      flex-shrink: 0;
    }

    .error-badge {
      margin-bottom: 16px;
    }

    .error-title {
      color: #F87171;
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .error-desc {
      color: #94A3B8;
      font-size: 13.5px;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .retry-btn {
      background: linear-gradient(135deg, #A855F7 0%, #7E22CE 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s ease, opacity 0.15s ease;
      box-shadow: 0 4px 15px rgba(168, 85, 247, 0.35);
    }

    .retry-btn:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class OAuthCallbackComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly provider = signal<'google' | 'github' | 'social'>('google');
  readonly statusTitle = signal<string>('Autenticando...');
  readonly statusSubtitle = signal<string>('Conectando con SysEng Academy de forma segura.');
  readonly errorMessage = signal<string>('');
  readonly progressPercent = signal<number>(20);
  readonly isSlowWakeup = signal<boolean>(false);

  private timerId: any = null;
  private progressInterval: any = null;

  ngOnInit(): void {
    const query = this.route.snapshot.queryParamMap;
    const params = this.route.snapshot.paramMap;

    const code = query.get('code');
    const state = query.get('state');
    const token = query.get('token');
    const error = query.get('error') || query.get('error_description');

    // 1. Determinar el proveedor
    let detectedProvider = (params.get('provider') || query.get('provider') || '').toLowerCase();
    let stateRedirectUri: string | null = null;

    if (state) {
      try {
        const normalized = state.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
        const parsed = JSON.parse(atob(padded));
        if (parsed.provider) detectedProvider = parsed.provider;
        if (parsed.redirect_uri) stateRedirectUri = parsed.redirect_uri;
      } catch {}
    }

    if (detectedProvider === 'github') {
      this.provider.set('github');
      this.statusTitle.set('Autenticando con GitHub...');
    } else {
      this.provider.set('google');
      this.statusTitle.set('Autenticando con Google...');
    }

    // 2. Manejar error explícito del proveedor
    if (error) {
      this.handleError(this.formatErrorMessage(error));
      return;
    }

    // Iniciar animación suave de progreso
    this.startProgressAnimation();

    // 3. Caso: Retorno con Token directo (Legacy o puente HTML previo)
    if (token) {
      this.progressPercent.set(80);
      this.completeWithToken(token);
      return;
    }

    // 4. Caso: Retorno con Código de Autorización OAuth
    if (code) {
      const redirectUri = stateRedirectUri || (typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : undefined);

      this.exchangeCode(detectedProvider || 'google', code, state, redirectUri);
      return;
    }

    // Si no hay código ni token, regresar a login
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    if (this.timerId) clearTimeout(this.timerId);
    if (this.progressInterval) clearInterval(this.progressInterval);
  }

  private startProgressAnimation(): void {
    let current = 25;
    this.progressInterval = setInterval(() => {
      if (current < 85) {
        current += 5;
        this.progressPercent.set(current);
      }
    }, 700);

    // Si tarda más de 3.5 segundos, el backend está despertando en Render
    this.timerId = setTimeout(() => {
      this.isSlowWakeup.set(true);
      this.statusSubtitle.set('Iniciando entorno seguro en la nube. Un momento por favor...');
    }, 3500);
  }

  private exchangeCode(
    provider: string,
    code: string,
    state?: string | null,
    redirectUri?: string | null,
    retryCount = 0
  ): void {
    this.authService.exchangeSocialCode(provider, code, state, redirectUri).subscribe({
      next: (res) => {
        this.progressPercent.set(100);
        this.statusTitle.set('¡Autenticación completada!');
        this.statusSubtitle.set('Accediendo a tu cuenta...');

        this.finishAuth({
          token: res.token,
          user: res.user,
          has_repo_scope: res.has_repo_scope,
          provider,
        });
      },
      error: (err) => {
        // En caso de que el proxy de Vercel corte la conexión mientras Render arranca (502/504), reintentar 2 veces
        const isNetworkTimeout = err?.status === 502 || err?.status === 504 || err?.status === 0;
        if (isNetworkTimeout && retryCount < 2) {
          setTimeout(() => {
            this.exchangeCode(provider, code, state, redirectUri, retryCount + 1);
          }, 3000);
          return;
        }

        const msg = err?.error?.message || err?.message || 'Error al autenticar con el proveedor.';
        this.handleError(msg);
      }
    });
  }

  private completeWithToken(token: string): void {
    localStorage.setItem('syseng_token', token);
    this.authService.fetchMe().subscribe({
      next: (user) => {
        this.finishAuth({ token, user, provider: this.provider() });
      },
      error: () => {
        this.handleError('Sesión expirada o inválida.');
      }
    });
  }

  private finishAuth(payload: { token: string; user: any; has_repo_scope?: boolean; provider: string }): void {
    // Si fue abierto en ventana popup (Desktop), comunicar vía postMessage
    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'SYSENG_OAUTH_SUCCESS',
          ...payload,
        }, '*');
        setTimeout(() => window.close(), 250);
        return;
      } catch {}
    }

    // Si fue redirección directa (Mobile), establecer sesión y navegar
    this.authService.handleSocialCallback({ user: payload.user, token: payload.token });
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 300);
  }

  private handleError(msg: string): void {
    this.errorMessage.set(msg);
    if (this.progressInterval) clearInterval(this.progressInterval);

    if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'SYSENG_OAUTH_ERROR',
          message: msg,
        }, '*');
        setTimeout(() => window.close(), 2000);
      } catch {}
    }
  }

  private formatErrorMessage(err: string): string {
    if (err === 'access_denied') return 'Has cancelado el inicio de sesión con el proveedor.';
    return err;
  }

  returnToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
