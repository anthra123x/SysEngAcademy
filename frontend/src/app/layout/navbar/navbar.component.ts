import { Component, inject, signal, computed, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="navbar-wrapper" [class.is-docente-zone]="isDocenteRoute()">
      <header class="navbar">
        <!-- Logo -->
        <a routerLink="/" class="navbar__logo" aria-label="SysEng Academy - Inicio">
          <div class="logo-icon-wrap">
            <span class="logo-icon">&lt;/&gt;</span>
          </div>
          <div class="logo-text-group">
            <span class="logo-title">SysEng<strong>Academy</strong></span>
            @if (isDocenteRoute()) {
              <span class="portal-badge portal-badge--teacher">Docente</span>
            }
          </div>
        </a>

        <!-- Desktop Navigation Pills (Centered) -->
        <nav class="navbar__nav" aria-label="Navegación principal">
          @if (isDocenteRoute()) {
            <a routerLink="/docente" routerLinkActive="active" class="nav-pill nav-pill--docente">
              <span class="nav-pill__icon">🎓</span>
              <span class="nav-pill__text">Panel Docente</span>
            </a>
            <a routerLink="/cursos" routerLinkActive="active" class="nav-pill">
              <span class="nav-pill__icon">📚</span>
              <span class="nav-pill__text">Catálogo Cursos</span>
            </a>
            <a routerLink="/" class="nav-pill nav-pill--switch" title="Explorar la plataforma como estudiante">
              <span class="nav-pill__icon">👁️</span>
              <span class="nav-pill__text">Vista Estudiante</span>
            </a>
          } @else {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-pill">
              <span class="nav-pill__text">Inicio</span>
            </a>
            <a routerLink="/rutas" routerLinkActive="active" class="nav-pill">
              <span class="nav-pill__icon">🗺️</span>
              <span class="nav-pill__text">Rutas</span>
            </a>
            <a routerLink="/cursos" routerLinkActive="active" class="nav-pill">
              <span class="nav-pill__icon">📚</span>
              <span class="nav-pill__text">Cursos</span>
            </a>
            @if (isTeacher()) {
              <a routerLink="/docente" routerLinkActive="active" class="nav-pill nav-pill--teacher-badge">
                <span class="nav-pill__icon">🎓</span>
                <span class="nav-pill__text">Panel Docente</span>
              </a>
            }
          }
        </nav>

        <!-- Auth & Actions -->
        <div class="navbar__actions">
          @if (auth.isAuthenticated()) {
            <div class="user-chip" (click)="toggleDropdown()" [class.is-open]="dropdownOpen()" [class.user-chip--teacher]="isTeacher()">
              <div class="avatar-circle" [class.avatar-circle--teacher]="isTeacher()">{{ initials() }}</div>
              <div class="user-meta">
                <span class="user-meta__name">{{ auth.user()?.name }}</span>
                <span class="user-meta__role" [class.user-meta__role--teacher]="isTeacher()">
                  {{ roleLabel() }}
                </span>
              </div>
              <span class="chevron-arrow">▾</span>

              @if (dropdownOpen()) {
                <div class="user-dropdown">
                  <div class="dropdown-header">
                    <div class="dropdown-user-row">
                      <strong>{{ auth.user()?.name }}</strong>
                      @if (isTeacher()) {
                        <span class="badge-teacher-tag">DOCENTE</span>
                      }
                    </div>
                    <span class="dropdown-email">{{ auth.user()?.email }}</span>
                  </div>
                  <hr>
                  @if (isTeacher()) {
                    <a routerLink="/docente" (click)="dropdownOpen.set(false)" class="dropdown-item dropdown-item--teacher">
                      <span>🎓</span> Panel Docente & Alumnos
                    </a>
                  }
                  <a routerLink="/perfil" (click)="dropdownOpen.set(false)" class="dropdown-item">
                    <span>👤</span> Mi Perfil
                  </a>
                  <a routerLink="/rutas" (click)="dropdownOpen.set(false)" class="dropdown-item">
                    <span>🗺️</span> Rutas de Aprendizaje
                  </a>
                  <hr>
                  <button type="button" (click)="logout()" class="dropdown-item dropdown-item--danger">
                    <span>🚪</span> Cerrar Sesión
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="auth-buttons">
              <a routerLink="/auth/login" class="btn-login">Iniciar Sesión</a>
              <a routerLink="/auth/registro" class="btn-register">Registrarse</a>
            </div>
          }

          <!-- Mobile Hamburger -->
          <button class="hamburger-btn" (click)="toggleMobile()" aria-label="Abrir menú de navegación">
            <span class="ham-line" [class.open]="mobileOpen()"></span>
            <span class="ham-line" [class.open]="mobileOpen()"></span>
            <span class="ham-line" [class.open]="mobileOpen()"></span>
          </button>
        </div>
      </header>
    </div>

    <!-- Mobile Drawer -->
    @if (mobileOpen()) {
      <div class="mobile-drawer" (click)="mobileOpen.set(false)">
        <div class="mobile-drawer__panel" (click)="$event.stopPropagation()">
          <div class="mobile-drawer__head">
            <span class="logo-title">SysEng<strong>Academy</strong></span>
            <button class="close-btn" (click)="mobileOpen.set(false)">✕</button>
          </div>

          <nav class="mobile-nav-links">
            @if (isTeacher()) {
              <a routerLink="/docente" (click)="mobileOpen.set(false)" style="color: #00d9ff; font-weight: 700;">🎓 Panel Docente</a>
            }
            <a routerLink="/" (click)="mobileOpen.set(false)">🏠 Inicio</a>
            <a routerLink="/rutas" (click)="mobileOpen.set(false)">🗺️ Rutas de Aprendizaje</a>
            <a routerLink="/cursos" (click)="mobileOpen.set(false)">📚 Catálogo de Cursos</a>
          </nav>

          <div class="mobile-auth-section">
            @if (auth.isAuthenticated()) {
              <a routerLink="/perfil" class="btn btn-outline btn-block" (click)="mobileOpen.set(false)">Mi Perfil</a>
              <button class="btn btn-danger btn-block" (click)="logout()">Cerrar Sesión</button>
            } @else {
              <a routerLink="/auth/login" class="btn btn-outline btn-block" (click)="mobileOpen.set(false)">Iniciar Sesión</a>
              <a routerLink="/auth/registro" class="btn btn-primary btn-block" (click)="mobileOpen.set(false)">Registrarse</a>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .navbar-wrapper {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      width: 100%;
      height: var(--header-height, 64px);
      background: rgba(14, 16, 26, 0.94);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      transition: all var(--transition-base);
    }

    .navbar {
      width: 100%;
      max-width: var(--container-max);
      height: 100%;
      margin: 0 auto;
      padding: 0 clamp(var(--sp-4), 3vw, 56px);
      border: none;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      transition: border-color var(--transition-fast);

      &__logo {
        justify-self: start;
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        text-decoration: none;
        flex-shrink: 0;

        .logo-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--primary-dim);
          border: 1px solid rgba(10, 233, 138, 0.35);
          display: grid;
          place-items: center;
        }

        .logo-icon {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: var(--font-bold);
          color: var(--primary);
        }

        .logo-text-group {
          display: flex;
          align-items: center;
        }

        .logo-title {
          font-size: 0.95rem;
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          letter-spacing: -0.01em;

          strong {
            color: var(--primary);
            font-weight: var(--font-bold);
          }
        }
      }

      /* Desktop Navigation Pills Centered */
      &__nav {
        justify-self: center;
        display: flex;
        align-items: center;
        gap: 6px;

        .nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: 9999px;
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);

          &:hover {
            color: var(--text-primary);
            background: rgba(255, 255, 255, 0.06);
          }

          &.active {
            color: #08090D;
            background: var(--primary);
            font-weight: var(--font-semibold);
            box-shadow: 0 0 16px var(--primary-dim);
          }

          &__icon {
            font-size: 0.85rem;
          }
        }

        @media (max-width: 768px) {
          display: none;
        }
      }

      /* Right actions */
      &__actions {
        justify-self: end;
        display: flex;
        align-items: center;
        gap: var(--sp-2);
      }

      @media (max-width: 768px) {
        display: flex;
        justify-content: space-between;
      }
    }

    /* Auth Buttons */
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 6px;

      .btn-login {
        padding: 6px 14px;
        font-size: var(--text-xs);
        font-weight: var(--font-medium);
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: 9999px;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }
      }

      .btn-register {
        padding: 6px 18px;
        font-size: var(--text-xs);
        font-weight: var(--font-semibold);
        color: #08090D;
        text-decoration: none;
        background: var(--primary);
        border-radius: 9999px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 2px 10px var(--primary-dim);
        transition: all var(--transition-fast);

        &:hover {
          transform: translateY(-1px);
          background: var(--primary-hover);
          box-shadow: 0 4px 14px var(--primary-dim);
        }
      }

      @media (max-width: 768px) {
        display: none;
      }
    }

    /* User Chip (Logged In) */
    .user-chip {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      background: rgba(26, 26, 40, 0.85);
      border: 1px solid var(--border);
      border-radius: 9999px;
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover, &.is-open {
        border-color: var(--primary);
        background: rgba(34, 34, 58, 0.9);
      }

      .avatar-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: #fff;
        font-size: 0.72rem;
        font-weight: var(--font-bold);
        display: grid;
        place-items: center;
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        line-height: 1.1;

        &__name {
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          color: var(--text-primary);
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        &__role {
          font-size: 9px;
          color: var(--text-muted);
        }
      }

      .chevron-arrow {
        font-size: 0.65rem;
        color: var(--text-muted);
      }

      @media (max-width: 500px) {
        padding: 3px 6px 3px 3px;
        gap: 0;

        .user-meta {
          display: none;
        }

        .chevron-arrow {
          display: none;
        }
      }
    }

    /* Dropdown */
    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 230px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-2);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      z-index: 100;
      animation: fade-drop 0.15s ease-out;

      .dropdown-header {
        padding: var(--sp-2) var(--sp-3);
        display: flex;
        flex-direction: column;
        strong { font-size: var(--text-xs); color: var(--text-primary); }
        .dropdown-email { font-size: 10px; color: var(--text-muted); }
      }

      hr { border-color: rgba(42, 42, 62, 0.5); margin: 4px 0; }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: var(--text-xs);
        color: var(--text-secondary);
        text-decoration: none;
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--text-primary);
          background: var(--bg-surface-2);
        }

        &--danger {
          color: var(--danger);
          &:hover {
            background: rgba(255, 82, 82, 0.1);
            color: var(--danger);
          }
        }
      }
    }

    @keyframes fade-drop {
      from { opacity: 0; transform: translateY(-6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* Mobile Hamburger */
    .hamburger-btn {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      width: 32px;
      height: 32px;
      padding: 6px;
      background: transparent;
      border: none;
      cursor: pointer;

      .ham-line {
        display: block;
        width: 18px;
        height: 2px;
        background: var(--text-primary);
        border-radius: 2px;
        transition: all 0.2s ease;
      }

      @media (max-width: 768px) {
        display: flex;
      }
    }

    /* Mobile Drawer */
    .mobile-drawer {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      justify-content: flex-end;

      &__panel {
        width: min(320px, 85vw);
        height: 100%;
        background: var(--bg-surface);
        border-left: 1px solid var(--border);
        padding: var(--sp-6);
        display: flex;
        flex-direction: column;
        gap: var(--sp-4);
      }

      &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: var(--sp-4);
        border-bottom: 1px solid var(--border);

        .close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
        }
      }

      .mobile-search {
        display: flex;
        gap: var(--sp-2);
        input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: var(--text-xs);
        }
      }

      .mobile-nav-links {
        display: flex;
        flex-direction: column;
        gap: 6px;

        a {
          padding: 10px 14px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);

          &:hover {
            background: var(--bg-surface-2);
            color: var(--text-primary);
          }
        }
      }

      .mobile-auth-section {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        padding-top: var(--sp-4);
        border-top: 1px solid var(--border);
      }
    }

    /* Teacher Portal Header Distinctions */
    .portal-badge--teacher {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 9999px;
      background: linear-gradient(135deg, rgba(0, 217, 255, 0.22), rgba(108, 99, 255, 0.22));
      border: 1px solid rgba(0, 217, 255, 0.5);
      color: #00D9FF;
      margin-left: 8px;
      vertical-align: middle;
    }

    .nav-pill--docente {
      background: rgba(0, 217, 255, 0.16) !important;
      border: 1px solid rgba(0, 217, 255, 0.4) !important;
      color: #00D9FF !important;
      font-weight: var(--font-semibold) !important;
      box-shadow: 0 0 14px rgba(0, 217, 255, 0.25);
    }

    .nav-pill--teacher-badge {
      background: rgba(0, 217, 255, 0.1) !important;
      border: 1px solid rgba(0, 217, 255, 0.3) !important;
      color: #00D9FF !important;
    }

    .nav-pill--switch {
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(255, 255, 255, 0.22);
      color: var(--text-secondary);
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-color: rgba(255, 255, 255, 0.4);
      }
    }

    .user-meta__role--teacher {
      color: #00D9FF !important;
      font-weight: 700 !important;
      text-shadow: 0 0 8px rgba(0, 217, 255, 0.35);
    }

    .avatar-circle--teacher {
      background: linear-gradient(135deg, #00D9FF, #6C63FF) !important;
      box-shadow: 0 0 10px rgba(0, 217, 255, 0.45);
    }

    .dropdown-user-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .badge-teacher-tag {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.05em;
      background: rgba(0, 217, 255, 0.2);
      border: 1px solid rgba(0, 217, 255, 0.5);
      color: #00D9FF;
      border-radius: 4px;
      padding: 1px 5px;
    }

    .dropdown-item--teacher {
      color: #00D9FF !important;
      font-weight: 600;
      &:hover {
        background: rgba(0, 217, 255, 0.12) !important;
      }
    }
  `]
})
export class NavbarComponent {
  auth = inject(AuthService);
  router = inject(Router);

  dropdownOpen = signal(false);
  mobileOpen   = signal(false);

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.email === 'andrescamilomartinez330@gmail.com' ||
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  readonly isDocenteRoute = computed(() => {
    const url = this.router.url;
    return url.startsWith('/docente') || url.startsWith('/admin');
  });

  readonly roleLabel = computed(() => {
    if (this.isTeacher()) return 'Docente & Admin';
    return 'Estudiante';
  });

  initials() {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  toggleDropdown() { this.dropdownOpen.update(v => !v); }
  toggleMobile()   { this.mobileOpen.update(v => !v); }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
    this.mobileOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-chip')) {
      this.dropdownOpen.set(false);
    }
  }
}
