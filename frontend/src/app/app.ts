import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { MobileBottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { AiCompanionComponent } from './features/ai-companion/ai-companion.component';
import { GlobalToastComponent } from './shared/components/global-toast.component';

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
      min-height: calc(100vh - 64px);
      min-height: calc(100dvh - 64px);
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
export class App {
  private router = inject(Router);
  readonly isClassroomMode = signal(
    this.checkClassroomMode(this.router.url)
  );
  readonly isAuthPage = signal(
    this.checkAuthPage(this.router.url)
  );

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


