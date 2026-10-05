import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { StreakService } from '../../core/services/streak.service';
import { ClansService } from '../../core/services/clans.service';

@Component({
  selector: 'app-mobile-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @if (isVisible()) {
      <nav class="mobile-bottom-nav" aria-label="Navegación móvil principal">
        <!-- 1. Inicio -->
        <a
          routerLink="/"
          routerLinkActive="is-active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="nav-tab-item"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span class="nav-tab-label">Inicio</span>
        </a>

        <!-- 2. Rutas de Aprendizaje -->
        <a
          routerLink="/rutas"
          routerLinkActive="is-active"
          class="nav-tab-item"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
            </svg>
          </div>
          <span class="nav-tab-label">Rutas</span>
        </a>

        <!-- 3. Cursos -->
        <a
          routerLink="/cursos"
          routerLinkActive="is-active"
          class="nav-tab-item"
        >
          <div class="nav-tab-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <span class="nav-tab-label">Cursos</span>
        </a>

        <!-- 4. Clan o Panel Docente -->
        @if (isTeacher()) {
          <a
            routerLink="/docente"
            routerLinkActive="is-active"
            class="nav-tab-item"
          >
            <div class="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span class="nav-tab-label">Docente</span>
          </a>
        } @else if (auth.isAuthenticated()) {
          <a
            routerLink="/clan"
            routerLinkActive="is-active"
            class="nav-tab-item nav-tab-item--clan"
          >
            <div class="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              @if (userClan() && userClan()!.streakDays > 0) {
                <span class="tab-badge-fire" title="Racha grupal activa">🔥</span>
              }
            </div>
            <span class="nav-tab-label">Clan</span>
          </a>
        } @else {
          <a
            routerLink="/asistente"
            routerLinkActive="is-active"
            class="nav-tab-item"
          >
            <div class="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"></path>
              </svg>
            </div>
            <span class="nav-tab-label">Byte IA</span>
          </a>
        }

        <!-- 5. Perfil o Ingreso -->
        @if (auth.isAuthenticated()) {
          <a
            routerLink="/perfil"
            routerLinkActive="is-active"
            class="nav-tab-item nav-tab-item--profile"
          >
            <div class="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              @if (studentStreak() > 0) {
                <span class="tab-badge-streak" [class.is-active]="isStreakActive()">
                  {{ studentStreak() }}d
                </span>
              }
            </div>
            <span class="nav-tab-label">Perfil</span>
          </a>
        } @else {
          <a
            routerLink="/auth/login"
            routerLinkActive="is-active"
            class="nav-tab-item"
          >
            <div class="nav-tab-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <span class="nav-tab-label">Entrar</span>
          </a>
        }
      </nav>
    }
  `,
  styles: [`
    :host {
      display: contents;
    }

    .mobile-bottom-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-bottom-nav {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1100;
        height: calc(58px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background: rgba(8, 10, 15, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.6);
        user-select: none;
        -webkit-user-select: none;
      }

      .nav-tab-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        color: #94A3B8;
        text-decoration: none;
        transition: color 0.15s ease, transform 0.15s ease;
        padding: 6px 2px;
        position: relative;
        -webkit-tap-highlight-color: transparent;

        &:active {
          transform: scale(0.92);
        }

        &.is-active {
          color: var(--primary, #0AE98A);

          .nav-tab-icon {
            transform: translateY(-1px);
            filter: drop-shadow(0 0 8px rgba(10, 233, 138, 0.35));
          }

          .nav-tab-label {
            font-weight: 600;
            color: #F8FAFC;
          }

          &::after {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 24px;
            height: 2px;
            background: var(--primary, #0AE98A);
            border-radius: 0 0 2px 2px;
            box-shadow: 0 0 8px var(--primary, #0AE98A);
          }
        }
      }

      .nav-tab-icon {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);

        svg {
          width: 20px;
          height: 20px;
          stroke-width: 2;
        }
      }

      .nav-tab-label {
        font-size: 10px;
        letter-spacing: 0.02em;
        line-height: 1.1;
        transition: color 0.15s ease, font-weight 0.15s ease;
      }

      /* Badges en iconos */
      .tab-badge-fire {
        position: absolute;
        top: -6px;
        right: -8px;
        font-size: 10px;
        line-height: 1;
        animation: fire-pulse 1.8s infinite ease-in-out;
      }

      .tab-badge-streak {
        position: absolute;
        top: -5px;
        right: -10px;
        background: rgba(245, 158, 11, 0.2);
        border: 1px solid rgba(245, 158, 11, 0.4);
        color: #F59E0B;
        font-size: 8.5px;
        font-weight: 700;
        padding: 0 4px;
        border-radius: 9999px;
        line-height: 12px;
        white-space: nowrap;

        &.is-active {
          background: rgba(10, 233, 138, 0.2);
          border-color: rgba(10, 233, 138, 0.4);
          color: #0AE98A;
        }
      }

      @keyframes fire-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    }
  `]
})
export class MobileBottomNavComponent {
  auth = inject(AuthService);
  router = inject(Router);
  streakService = inject(StreakService);
  clansService = inject(ClansService);

  readonly isVisible = computed(() => {
    const url = this.router.url;
    // Ocultar en aula/lección y pantallas de autenticación limpia
    if (url.includes('/leccion/')) return false;
    if (url.startsWith('/auth/')) return false;
    return true;
  });

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return user?.role === 'admin' || user?.role === 'instructor';
  });

  readonly studentStreak = computed(() => this.streakService.currentStreak());
  readonly isStreakActive = computed(() => this.streakService.isStreakActive());
  readonly userClan = computed(() => this.clansService.userClan());
}
