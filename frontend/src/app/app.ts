import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AiCompanionComponent } from './features/ai-companion/ai-companion.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, AiCompanionComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <app-footer />
    <app-ai-companion />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px - 200px);
    }
  `]
})
export class App {}
