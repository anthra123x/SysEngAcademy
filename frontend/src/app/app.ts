import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { MobileBottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { AiCompanionComponent } from './features/ai-companion/ai-companion.component';
import { GlobalToastComponent } from './shared/components/global-toast.component';
import { AuthService } from './core/services/auth.service';
import { SeoService } from './core/services/seo.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, MobileBottomNavComponent, AiCompanionComponent, GlobalToastComponent],
  template: `
    @if (!isClassroomMode() && !isAuthPage()) {
      <app-navbar />
    }
    <main [class.classroom-mode]="isClassroomMode()" [class.auth-mode]="isAuthPage()">
      <router-outlet />
    </main>
    @if (!isClassroomMode() && !isAuthPage()) {
      <app-mobile-bottom-nav />
      <app-ai-companion />
    }
    <app-global-toast />
  `,
  styles: [`
    main {
      min-height: 100vh;
      min-height: 100dvh;
      &.classroom-mode,
      &.auth-mode {
        min-height: 100vh;
        min-height: 100dvh;
        padding-bottom: 0;
      }

      @media (max-width: 768px) {
        &:not(.classroom-mode):not(.auth-mode) {
          padding-bottom: calc(var(--bottom-nav-height, 60px) + env(safe-area-inset-bottom, 0px) + 20px);
        }
      }
    }
  `]
})
export class App implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private seo = inject(SeoService);
  private analytics = inject(AnalyticsService);
  readonly isClassroomMode = signal(
    this.checkClassroomMode(this.router.url)
  );
  readonly isAuthPage = signal(
    this.checkAuthPage(this.router.url)
  );

  ngOnInit(): void {
    // Ingestar sesión OAuth de inmediato si proviene de redirección directa (Google / GitHub)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('syseng_token', token);
        urlParams.delete('token');
        urlParams.delete('provider');
        const remaining = urlParams.toString();
        const cleanUrl = window.location.pathname + (remaining ? `?${remaining}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        this.auth.fetchMe().subscribe({
          next: (user) => {
            window.dispatchEvent(new CustomEvent('syseng-auth-login', { detail: { user, token } }));
            if (window.location.pathname.startsWith('/auth/login') || window.location.pathname.startsWith('/auth/registro')) {
              this.router.navigate(['/']);
            }
          }
        });
      }
    }

    // Calentamiento asíncrono y silencioso del backend (aprovecha la carga inicial para evitar arranques en frío)
    this.auth.warmupBackend();
  }

  private checkClassroomMode(url: string): boolean {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    return cleanUrl.includes('/leccion/') ||
      (cleanUrl.startsWith('/codelab/') && cleanUrl !== '/codelab' && cleanUrl !== '/codelab/') ||
      (cleanUrl.startsWith('/arena/') && cleanUrl !== '/arena' && cleanUrl !== '/arena/');
  }

  private checkAuthPage(url: string): boolean {
    const cleanUrl = (url || '').split('?')[0].split('#')[0];
    return cleanUrl.startsWith('/auth/login') ||
      cleanUrl.startsWith('/auth/registro') ||
      cleanUrl.startsWith('/auth/verificar');
  }

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const legacyKeys = ['syseng_cache_paths', 'syseng_cache_courses', 'syseng_cache_home'];
        legacyKeys.forEach(k => localStorage.removeItem(k));
      } catch {}
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isClassroomMode.set(this.checkClassroomMode(event.urlAfterRedirects));
        this.isAuthPage.set(this.checkAuthPage(event.urlAfterRedirects));
      }
    });
  }
}


