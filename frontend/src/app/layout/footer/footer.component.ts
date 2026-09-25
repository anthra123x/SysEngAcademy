import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__brand">
          <a routerLink="/" class="footer__logo">
            <span class="logo-icon">&lt;/&gt;</span>
            <span>SysEng<span>Academy</span></span>
          </a>
          <p>Plataforma de aprendizaje para estudiantes de Ingeniería de Sistemas. Aprende programación de forma estructurada e interactiva.</p>
        </div>

        <div class="footer__links">
          <div class="footer__col">
            <h4>Aprendizaje</h4>
            <a routerLink="/rutas">Rutas de Aprendizaje</a>
            <a routerLink="/cursos">Todos los Cursos</a>
          </div>
          <div class="footer__col">
            <h4>Cuenta</h4>
            <a routerLink="/auth/login">Iniciar Sesión</a>
            <a routerLink="/auth/registro">Registrarse</a>
            <a routerLink="/perfil">Mi Perfil</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
      margin-top: auto;

      &__inner {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--sp-16);
        padding: var(--sp-12) var(--sp-6);

        @media (max-width: 768px) {
          grid-template-columns: 1fr;
          gap: var(--sp-8);
        }
      }

      &__brand {
        max-width: 340px;
        p {
          margin-top: var(--sp-3);
          font-size: var(--text-sm);
          color: var(--text-muted);
          line-height: 1.7;
        }
      }

      &__logo {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        text-decoration: none;
        font-size: var(--text-base);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        span { color: var(--primary); }

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

      &__links {
        display: flex;
        gap: var(--sp-16);
      }

      &__col {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);

        h4 {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          margin-bottom: var(--sp-1);
        }

        a {
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--transition-fast);
          &:hover { color: var(--text-primary); }
        }
      }
    }
  `]
})
export class FooterComponent {}
