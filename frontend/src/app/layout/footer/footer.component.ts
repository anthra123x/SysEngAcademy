import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="container footer__container">
        <div class="footer__grid">
          <!-- Columna Marca -->
          <div class="footer__brand">
            <a routerLink="/" class="footer__logo">
              <span class="logo-icon">&lt;/&gt;</span>
              <span class="logo-text">SysEng<strong>Academy</strong></span>
            </a>
            <p class="brand-desc">
              Plataforma integral de formación para estudiantes y profesionales de Ingeniería de Sistemas. 
              Aprende arquitectura, desarrollo de software y algoritmos de forma práctica y estructurada.
            </p>
            <div class="brand-status">
              <span class="status-indicator"></span>
              <span class="status-text">Servidores SysEng Operativos v2.4</span>
            </div>
          </div>

          <!-- Columna Rutas -->
          <div class="footer__col">
            <h4 class="col-title">Rutas de Especialización</h4>
            <ul class="col-links">
              <li><a routerLink="/rutas/fundamentos-programacion">Fundamentos de Programación</a></li>
              <li><a routerLink="/rutas/desarrollo-backend">Desarrollo Backend &amp; APIs</a></li>
              <li><a routerLink="/rutas/desarrollo-frontend">Desarrollo Frontend &amp; Web</a></li>
              <li><a routerLink="/rutas/devops">DevOps &amp; Cloud Computing</a></li>
              <li><a routerLink="/rutas/desarrollo-con-ia">Desarrollo Asistido por IA</a></li>
            </ul>
          </div>

          <!-- Columna Cursos y Práctica -->
          <div class="footer__col">
            <h4 class="col-title">Catálogo &amp; Aprendizaje</h4>
            <ul class="col-links">
              <li><a routerLink="/cursos">Catálogo Completo (43 Cursos)</a></li>
              <li><a routerLink="/rutas">9 Rutas de Carrera</a></li>
              <li><a routerLink="/cursos" [queryParams]="{ is_free: true }">Cursos Gratuitos</a></li>
              <li><a routerLink="/docente">Panel Docente</a></li>
            </ul>
          </div>

          <!-- Columna Cuenta y Soporte -->
          <div class="footer__col">
            <h4 class="col-title">Acceso &amp; Comunidad</h4>
            <ul class="col-links">
              <li><a routerLink="/auth/login">Iniciar Sesión</a></li>
              <li><a routerLink="/auth/registro">Crear Cuenta</a></li>
              <li><a routerLink="/perfil">Mi Perfil &amp; Progreso</a></li>
              <li><span class="copilot-hint">💡 Consulta a Byte en la terminal</span></li>
            </ul>
          </div>
        </div>

        <!-- Barra Inferior (Sub-footer) -->
        <div class="footer__bottom">
          <div class="bottom-legal">
            <p>&copy; 2026 SysEng Academy. Todos los derechos reservados. Diseñado para futuros Ingenieros de Sistemas.</p>
          </div>
          <div class="bottom-badges">
            <span class="tech-badge">Angular 22</span>
            <span class="tech-badge">Laravel 13</span>
            <span class="tech-badge">Byte AI Companion</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%);
      border-top: 1px solid var(--border);
      position: relative;
      margin-top: auto;
      z-index: 10;
      /* Zona segura a la derecha para no chocar con el robot Byte 3D */
      @media (min-width: 1024px) {
        padding-right: 220px;
      }

      &__container {
        padding-top: var(--sp-12);
        padding-bottom: var(--sp-6);
      }

      &__grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr 1fr 1fr;
        gap: var(--sp-8);
        margin-bottom: var(--sp-10);

        @media (max-width: 1200px) {
          grid-template-columns: 1.2fr 1fr 1fr;
        }

        @media (max-width: 860px) {
          grid-template-columns: 1fr 1fr;
          gap: var(--sp-6);
        }

        @media (max-width: 540px) {
          grid-template-columns: 1fr;
          gap: var(--sp-6);
        }
      }

      &__brand {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        max-width: 360px;

        .brand-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-top: var(--sp-1);
        }

        .brand-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: var(--sp-2);
          padding: 4px 10px;
          border-radius: var(--radius-full, 9999px);
          background: rgba(10, 233, 138, 0.06);
          border: 1px solid rgba(10, 233, 138, 0.2);
          width: fit-content;

          .status-indicator {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--primary, #0AE98A);
            box-shadow: 0 0 8px var(--primary, #0AE98A);
            animation: pulse-dot 2s infinite ease-in-out;
          }

          .status-text {
            font-family: var(--font-mono);
            font-size: 0.68rem;
            color: var(--primary, #0AE98A);
            font-weight: 600;
          }
        }
      }

      &__logo {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--text-primary);

        .logo-icon {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--primary, #0AE98A);
          background: rgba(10, 233, 138, 0.12);
          border: 1px solid rgba(10, 233, 138, 0.25);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .logo-text {
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          strong {
            color: var(--primary, #0AE98A);
            font-weight: 700;
          }
        }
      }

      &__col {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);

        .col-title {
          font-family: var(--font-mono);
          font-size: 0.76rem;
          font-weight: 700;
          color: #E2E8F0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: var(--sp-1);
        }

        .col-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;

          li a {
            font-size: 0.82rem;
            color: var(--text-secondary);
            text-decoration: none;
            transition: all var(--transition-fast);
            display: inline-block;

            &:hover {
              color: var(--primary, #0AE98A);
              transform: translateX(3px);
            }
          }

          .copilot-hint {
            font-size: 0.74rem;
            color: var(--text-muted);
            font-style: italic;
          }
        }
      }

      &__bottom {
        padding-top: var(--sp-6);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--sp-4);

        .bottom-legal p {
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .bottom-badges {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;

          .tech-badge {
            font-family: var(--font-mono);
            font-size: 0.65rem;
            color: #94A3B8;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 2px 7px;
            border-radius: 3px;
          }
        }
      }
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 0.5; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.15); }
    }
  `]
})
export class FooterComponent {}
