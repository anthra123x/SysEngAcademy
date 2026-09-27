import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AiCompanionComponent } from './features/ai-companion/ai-companion.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AiCompanionComponent],
  template: `
    @if (!isClassroomMode()) {
      <app-navbar />
    }
    <main [class.classroom-mode]="isClassroomMode()">
      <router-outlet />
    </main>
    @if (!isClassroomMode()) {
      <app-footer />
    }
    <app-ai-companion />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px - 200px);
      &.classroom-mode {
        min-height: 100vh;
      }
    }
  `]
})
export class App {
  private router = inject(Router);
  readonly isClassroomMode = signal(this.router.url.includes('/leccion/'));

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isClassroomMode.set(event.urlAfterRedirects.includes('/leccion/'));
      }
    });
  }
}

