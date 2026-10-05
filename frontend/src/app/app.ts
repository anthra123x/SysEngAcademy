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
    @if (!isClassroomMode()) {
      <app-navbar />
    }
    <main [class.classroom-mode]="isClassroomMode()">
      <router-outlet />
    </main>
    <app-mobile-bottom-nav />
    <app-ai-companion />
    <app-global-toast />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
      min-height: calc(100dvh - 64px);
      &.classroom-mode {
        min-height: 100vh;
        min-height: 100dvh;
        padding-bottom: 0;
      }

      @media (max-width: 768px) {
        &:not(.classroom-mode) {
          padding-bottom: calc(var(--bottom-nav-height, 60px) + env(safe-area-inset-bottom, 0px) + 20px);
        }
      }
    }
  `]
})
export class App {
  private router = inject(Router);
  readonly isClassroomMode = signal(this.router.url.includes('/leccion/'));

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const legacyKeys = ['syseng_cache_paths', 'syseng_cache_courses', 'syseng_cache_home'];
        legacyKeys.forEach(k => localStorage.removeItem(k));
      } catch {}
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isClassroomMode.set(event.urlAfterRedirects.includes('/leccion/'));
      }
    });
  }
}


