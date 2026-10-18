import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth-callback',
  standalone: true,
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <div class="spinner"></div>
        <h2>Autenticando con {{ providerName() }}...</h2>
        <p class="subtitle">Conectando con SysEng Academy de forma segura.</p>
        @if (errorMessage()) {
          <div class="alert-error">{{ errorMessage() }}</div>
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
      background: radial-gradient(circle at 50% 20%, #161828 0%, #08090d 100%);
      padding: 20px;
    }
    .callback-card {
      background: #11121d;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(168, 85, 247, 0.2);
      border-top-color: #a855f7;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 {
      color: #f1f5f9;
      font-size: 20px;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin: 0;
    }
    .alert-error {
      margin-top: 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
    }
  `],
})
export class OAuthCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly providerName = signal<string>('tu cuenta');
  readonly errorMessage = signal<string>('');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    const provider = this.route.snapshot.queryParamMap.get('provider') || '';
    const error = this.route.snapshot.queryParamMap.get('error');

    if (provider === 'google') {
      this.providerName.set('Google');
    } else if (provider === 'github') {
      this.providerName.set('GitHub');
    }

    if (error) {
      this.errorMessage.set(error);
      setTimeout(() => this.router.navigate(['/auth/login'], { queryParams: { error } }), 2000);
      return;
    }

    if (token) {
      localStorage.setItem('syseng_token', token);
      this.authService.fetchMe().subscribe({
        next: (user) => {
          this.authService.handleSocialCallback({ user, token });
          this.router.navigate(['/']);
        },
        error: () => {
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
