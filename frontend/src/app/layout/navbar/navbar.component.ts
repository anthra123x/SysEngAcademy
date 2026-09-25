import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container navbar__inner">
        <!-- Logo -->
        <a routerLink="/" class="navbar__logo">
          <span class="navbar__logo-icon">&lt;/&gt;</span>
          <span class="navbar__logo-text">SysEng<span>Academy</span></span>
        </a>

        <!-- Desktop Nav -->
        <nav class="navbar__nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Inicio</a>
          <a routerLink="/rutas" routerLinkActive="active">Rutas</a>
          <a routerLink="/cursos" routerLinkActive="active">Cursos</a>
        </nav>

        <!-- Auth Actions -->
        <div class="navbar__actions">
          @if (auth.isAuthenticated()) {
            <div class="user-menu" (click)="toggleDropdown()">
              <div class="user-avatar">{{ initials() }}</div>
              <span class="user-name">{{ auth.user()?.name }}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              @if (dropdownOpen()) {
                <div class="user-dropdown">
                  <a routerLink="/perfil" (click)="dropdownOpen.set(false)">Mi Perfil</a>
                  <hr>
                  <button (click)="logout()">Cerrar Sesión</button>
                </div>
              }
            </div>
          } @else {
            <a routerLink="/auth/login" class="btn btn-ghost btn-sm">Iniciar Sesión</a>
            <a routerLink="/auth/registro" class="btn btn-primary btn-sm">Registrarse</a>
          }
        </div>

        <!-- Mobile Hamburger -->
        <button class="hamburger" (click)="toggleMobile()" aria-label="Menu">
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileOpen()) {
        <div class="mobile-menu">
          <a routerLink="/" (click)="mobileOpen.set(false)">Inicio</a>
          <a routerLink="/rutas" (click)="mobileOpen.set(false)">Rutas de Aprendizaje</a>
          <a routerLink="/cursos" (click)="mobileOpen.set(false)">Cursos</a>
          <div class="mobile-auth">
            @if (auth.isAuthenticated()) {
              <a routerLink="/perfil" (click)="mobileOpen.set(false)">Mi Perfil</a>
              <button (click)="logout()">Cerrar Sesión</button>
            } @else {
              <a routerLink="/auth/login" class="btn btn-outline" (click)="mobileOpen.set(false)">Iniciar Sesión</a>
              <a routerLink="/auth/registro" class="btn btn-primary" (click)="mobileOpen.set(false)">Registrarse</a>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      height: var(--header-height);

      &__inner {
        display: flex;
        align-items: center;
        gap: var(--sp-8);
        height: 100%;
      }

      &__logo {
        display: flex;
        align-items: center;
        gap: var(--sp-2);
        text-decoration: none;
        flex-shrink: 0;

        &-icon {
          font-family: var(--font-mono);
          font-size: var(--text-lg);
          font-weight: var(--font-bold);
          color: var(--accent);
          background: var(--accent-dim);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(0,217,255,0.3);
        }

        &-text {
          font-size: var(--text-base);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          span { color: var(--primary); }
        }
      }

      &__nav {
        display: flex;
        align-items: center;
        gap: var(--sp-1);
        flex: 1;

        a {
          padding: 6px 12px;
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);

          &:hover { color: var(--text-primary); background: var(--bg-surface-2); }
          &.active { color: var(--text-primary); }
        }
      }

      &__actions {
        display: flex;
        align-items: center;
        gap: var(--sp-3);
        margin-left: auto;
      }
    }

    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      padding: 6px 12px 6px 6px;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      color: var(--text-primary);
      font-size: var(--text-sm);
      transition: border-color var(--transition-fast);

      &:hover { border-color: var(--primary); }
    }

    .user-avatar {
      width: 28px;
      height: 28px;
      background: var(--primary);
      color: #fff;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: var(--font-bold);
    }

    .user-name { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--sp-2);
      min-width: 160px;
      box-shadow: var(--shadow-md);
      z-index: 200;

      a, button {
        display: block;
        width: 100%;
        padding: 8px 12px;
        font-size: var(--text-sm);
        color: var(--text-secondary);
        text-decoration: none;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: var(--radius-sm);
        text-align: left;
        transition: all var(--transition-fast);

        &:hover { background: var(--bg-surface-3); color: var(--text-primary); }
      }

      hr { border-color: var(--border); margin: var(--sp-2) 0; }
    }

    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;

      span {
        display: block;
        width: 22px;
        height: 2px;
        background: var(--text-primary);
        transition: all var(--transition-base);
      }
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      padding: var(--sp-4) var(--sp-6);
      border-top: 1px solid var(--border);
      gap: var(--sp-1);
      background: var(--bg-surface);

      a {
        padding: 10px 12px;
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: var(--radius-md);
        &:hover { background: var(--bg-surface-2); color: var(--text-primary); }
      }

      .mobile-auth {
        display: flex;
        flex-direction: column;
        gap: var(--sp-3);
        padding-top: var(--sp-4);
        border-top: 1px solid var(--border);
        margin-top: var(--sp-3);
      }
    }

    @media (max-width: 768px) {
      .navbar__nav, .navbar__actions { display: none; }
      .hamburger { display: flex; margin-left: auto; }
      .mobile-menu { display: flex; }
    }
  `]
})
export class NavbarComponent {
  auth         = inject(AuthService);
  dropdownOpen = signal(false);
  mobileOpen   = signal(false);

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
    if (!target.closest('.user-menu')) {
      this.dropdownOpen.set(false);
    }
  }
}
