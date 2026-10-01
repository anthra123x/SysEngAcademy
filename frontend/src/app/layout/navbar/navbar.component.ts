import { Component, inject, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { StreakService } from '../../core/services/streak.service';
import { STUDENT_MINI_AVATARS, TEACHER_MINI_AVATARS, getStoredMiniAvatar } from '../../core/constants/ascii-avatars';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="navbar-wrapper" [class.is-docente-zone]="isTeacherDocenteZone()">
      <header class="navbar">
        <!-- Logo -->
        <a routerLink="/" class="navbar__logo" aria-label="SysEng Academy - Inicio">
          <div class="logo-icon-wrap">
            <span class="logo-icon">&lt;/&gt;</span>
          </div>
          <div class="logo-text-group">
            <span class="logo-title">SysEng<strong>Academy</strong></span>
            @if (isTeacherDocenteZone()) {
              <span class="portal-badge portal-badge--teacher">Docente</span>
            }
          </div>
        </a>

        <!-- Desktop Navigation (Centered) -->
        <nav class="navbar__nav" aria-label="Navegación principal">
          @if (isTeacherDocenteZone()) {
            <!-- Navegación exclusiva para el Docente en su panel y perfil -->
            @if (isDocenteRoute()) {
              <a [routerLink]="['/docente']" [queryParams]="{ tab: 'students' }" class="nav-pill nav-pill--doc-neutral" [class.active]="currentTeacherTab() === 'students'">
                <span class="nav-pill__text">Alumnos</span>
              </a>
              <a [routerLink]="['/docente']" [queryParams]="{ tab: 'activities' }" class="nav-pill nav-pill--doc-neutral" [class.active]="currentTeacherTab() === 'activities'">
                <span class="nav-pill__text">Actividades &amp; Quizzes</span>
              </a>
              <a [routerLink]="['/docente']" [queryParams]="{ tab: 'activity' }" class="nav-pill nav-pill--doc-neutral" [class.active]="currentTeacherTab() === 'activity'">
                <span class="nav-pill__text">Rendimiento</span>
              </a>
              <a [routerLink]="['/docente']" [queryParams]="{ tab: 'ai' }" class="nav-pill nav-pill--doc-neutral" [class.active]="currentTeacherTab() === 'ai'">
                <span class="nav-pill__text">Byte Asistente IA</span>
              </a>
            } @else {
              <a routerLink="/docente" class="nav-pill nav-pill--doc-neutral">
                <span class="nav-pill__text">Panel Docente</span>
              </a>
              <a routerLink="/perfil" class="nav-pill nav-pill--doc-neutral active">
                <span class="nav-pill__text">Mi Perfil</span>
              </a>
            }
          } @else {
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" class="nav-pill">
              <span class="nav-pill__text">Inicio</span>
            </a>
            <a routerLink="/rutas" routerLinkActive="active" class="nav-pill">
              <span class="nav-pill__text">Rutas</span>
            </a>
            <a routerLink="/cursos" routerLinkActive="active" class="nav-pill">
              <span class="nav-pill__text">Cursos</span>
            </a>
            @if (isTeacher()) {
              <a routerLink="/docente" routerLinkActive="active" class="nav-pill nav-pill--teacher-badge">
                <span class="nav-pill__text">Panel Docente</span>
              </a>
            }
          }
        </nav>

        <!-- Auth & Actions -->
        <div class="navbar__actions">
          @if (auth.isAuthenticated()) {
            @if (isTeacherDocenteZone()) {
              <a routerLink="/" class="btn-switch-view" title="Explorar la plataforma como estudiante">
                <span>Vista Estudiante</span>
              </a>
            }
            <a routerLink="/perfil" [queryParams]="{ tab: 'streak' }" class="streak-nav-pill" title="Racha activa de estudio consecutivo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-.61-.22-1.17-.59-1.61L12 11.83l-.91 1.06c-.37.44-.59 1-.59 1.61z"/><path d="M12 23c-4.97 0-9-4.03-9-9 0-4.14 2.8-7.63 6.64-8.66.42-.11.84.14.94.56.05.2.01.41-.1.58C9.56 7.82 9 9.35 9 11c0 .28.04.55.11.81.08.31.35.53.67.53h.08c.32-.04.57-.29.62-.61.32-2.14 1.76-3.87 3.73-4.57.41-.15.86.05 1.01.46.07.19.05.41-.05.58-.69 1.18-1.07 2.55-1.07 4 0 .38.07.75.2 1.09.12.31.42.51.75.51.11 0 .22-.02.32-.07.3-.15.48-.46.48-.8 0-1.02.3-1.99.82-2.81.25-.4.76-.53 1.16-.28.18.11.31.29.36.49 1.15 4.34-.35 9.07-3.79 11.67-.93.7-2.02 1.1-3.15 1.1z"/></svg>
              <span class="streak-nav-count">{{ studentStreak() }}d</span>
            </a>
            <div class="user-chip" (click)="toggleDropdown()" [class.is-open]="dropdownOpen()" [class.user-chip--teacher]="isTeacher()">
              <div class="avatar-ascii-badge" [class.avatar-ascii-badge--teacher]="isTeacher()" title="Firma ASCII animada de tu perfil">
                <pre class="mini-ascii-pre">{{ currentMiniFrame() }}</pre>
              </div>
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
                      <div class="dropdown-avatar-mini" [class.dropdown-avatar-mini--teacher]="isTeacher()">
                        <pre class="dropdown-ascii-pre">{{ currentMiniFrame() }}</pre>
                      </div>
                      <div class="dropdown-user-info">
                        <div class="dropdown-name-row">
                          <strong>{{ auth.user()?.name }}</strong>
                          @if (isTeacher()) {
                            <span class="badge-teacher-tag">DOCENTE</span>
                          }
                        </div>
                        <span class="dropdown-email">{{ auth.user()?.email }}</span>
                      </div>
                    </div>
                  </div>
                  <hr>
                  @if (isTeacher()) {
                    <!-- SOLAMENTE MI PERFIL PARA EL DOCENTE -->
                    <a routerLink="/perfil" (click)="dropdownOpen.set(false)" class="dropdown-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Mi Perfil
                    </a>
                  } @else {
                    <a routerLink="/perfil" (click)="dropdownOpen.set(false)" class="dropdown-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Mi Perfil
                    </a>
                    <a routerLink="/rutas" (click)="dropdownOpen.set(false)" class="dropdown-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                      Rutas de Aprendizaje
                    </a>
                  }
                  <hr>
                  <button type="button" (click)="logout()" class="dropdown-item dropdown-item--danger">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Cerrar Sesión
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
            @if (isTeacherDocenteZone()) {
              @if (isDocenteRoute()) {
                <a [routerLink]="['/docente']" [queryParams]="{ tab: 'students' }" (click)="mobileOpen.set(false)">Alumnos</a>
                <a [routerLink]="['/docente']" [queryParams]="{ tab: 'activities' }" (click)="mobileOpen.set(false)">Actividades &amp; Quizzes</a>
                <a [routerLink]="['/docente']" [queryParams]="{ tab: 'activity' }" (click)="mobileOpen.set(false)">Rendimiento</a>
                <a [routerLink]="['/docente']" [queryParams]="{ tab: 'ai' }" (click)="mobileOpen.set(false)">Byte Asistente IA</a>
              } @else {
                <a routerLink="/docente" (click)="mobileOpen.set(false)">Panel Docente</a>
              }
              <a routerLink="/perfil" (click)="mobileOpen.set(false)">Mi Perfil</a>
              <a routerLink="/" (click)="mobileOpen.set(false)" class="mobile-switch-link">Vista Estudiante</a>
            } @else {
              @if (isTeacher()) {
                <a routerLink="/docente" (click)="mobileOpen.set(false)">Panel Docente</a>
              }
              <a routerLink="/" (click)="mobileOpen.set(false)">Inicio</a>
              <a routerLink="/rutas" (click)="mobileOpen.set(false)">Rutas de Aprendizaje</a>
              <a routerLink="/cursos" (click)="mobileOpen.set(false)">Cursos</a>
            }
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

      &.is-docente-zone {
        background: #08090D !important;
        border-bottom: 1px solid #1E2235 !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.6) !important;
      }
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

    /* User Chip (Logged In) - Sleek neutral terminal hover */
    .user-chip {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 3px 11px 3px 3px;
      background: #0B0E14;
      border: 1px solid #1A2232;
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;

      &:hover, &.is-open {
        background: #111520;
        border-color: #2D3A52;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);

        .avatar-ascii-badge {
          border-color: #0AE98A;
          box-shadow: 0 0 10px rgba(10, 233, 138, 0.25);
        }

        .chevron-arrow {
          color: #E2E8F0;
        }
      }

      &--teacher {
        background: #0A0D16;
        border-color: #1A2338;

        &:hover, &.is-open {
          background: #101524;
          border-color: #2B3854;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);

          .avatar-ascii-badge {
            border-color: #38BDF8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
          }
        }
      }

      .avatar-ascii-badge {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #06080E;
        border: 1px solid #1A2234;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        flex: none;
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.6);
        transition: all 0.2s ease;

        .mini-ascii-pre {
          margin: 0;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 5.5px;
          line-height: 1.05;
          color: #0AE98A;
          text-align: center;
          white-space: pre;
          letter-spacing: -0.25px;
          user-select: none;
          display: block;
        }

        &--teacher {
          background: #080A14;
          border-color: #1A243D;
          .mini-ascii-pre {
            color: #38BDF8;
          }
        }
      }

      .user-meta {
        display: flex;
        flex-direction: column;
        line-height: 1.1;

        &__name {
          font-size: var(--text-xs);
          font-weight: 600;
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
        transition: transform 0.15s ease, color 0.15s ease;
      }

      @media (max-width: 500px) {
        padding: 3px;
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
        padding: 10px 12px;
        .dropdown-user-row {
          display: flex;
          align-items: center;
          gap: 10px;

          .dropdown-avatar-mini {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: #080A10;
            border: 1px solid #1E273A;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            flex: none;

            .dropdown-ascii-pre {
              margin: 0;
              padding: 0;
              font-family: var(--font-mono);
              font-size: 5.5px;
              line-height: 1.05;
              color: #0AE98A;
              text-align: center;
              white-space: pre;
              letter-spacing: -0.2px;
            }

            &--teacher {
              background: #0A0D18;
              border-color: #1F2B44;
              .dropdown-ascii-pre {
                color: #38BDF8;
              }
            }
          }

          .dropdown-user-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;

            .dropdown-name-row {
              display: flex;
              align-items: center;
              gap: 6px;
              strong {
                font-size: 12px;
                color: var(--text-primary);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }

            .dropdown-email {
              font-size: 10.5px;
              color: var(--text-muted);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
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

    .portal-badge--teacher {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: var(--radius-sm, 4px);
      background: var(--bg-surface-2, #161926);
      border: 1px solid var(--border, #202436);
      color: var(--text-secondary, #94A3B8);
      margin-left: 8px;
      vertical-align: middle;
    }

    .nav-pill--doc-neutral {
      background: transparent !important;
      border: 1px solid transparent !important;
      color: var(--text-secondary, #94A3B8) !important;
      font-weight: 500 !important;
      box-shadow: none !important;

      &:hover {
        color: var(--text-primary, #F8FAFC) !important;
        background: var(--bg-surface, #10121C) !important;
      }

      &.active {
        background: var(--bg-surface-2, #161926) !important;
        border: 1px solid var(--border, #202436) !important;
        color: var(--text-primary, #F8FAFC) !important;
      }
    }

    .btn-switch-view {
      font-size: var(--text-xs, 0.75rem);
      font-weight: 500;
      color: var(--text-secondary, #94A3B8);
      background: var(--bg-surface, #10121C);
      border: 1px solid var(--border, #202436);
      border-radius: var(--radius-md, 6px);
      padding: 5px 11px;
      text-decoration: none;
      transition: all var(--transition-fast, 150ms ease);

      &:hover {
        color: var(--text-primary, #F8FAFC);
        background: var(--bg-surface-2, #161926);
        border-color: var(--border-hover, #2E344E);
      }
    }

    .user-meta__role--teacher {
      color: var(--text-muted, #64748B) !important;
      font-weight: 500 !important;
      text-shadow: none !important;
    }

    .avatar-circle--teacher {
      background: var(--bg-surface-3, #1E2235) !important;
      color: var(--text-primary, #F8FAFC) !important;
      border: 1px solid var(--border, #202436) !important;
      box-shadow: none !important;
    }

    .badge-teacher-tag {
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.05em;
      background: var(--bg-surface-2, #161926);
      border: 1px solid var(--border, #202436);
      color: var(--text-secondary, #94A3B8);
      border-radius: 4px;
      padding: 1px 5px;
    }

    .dropdown-item--teacher {
      color: var(--text-secondary, #94A3B8) !important;
      font-weight: 500;
      &:hover {
        background: var(--bg-surface-2, #161926) !important;
        color: var(--text-primary, #F8FAFC) !important;
      }
    }

    .streak-nav-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      background: rgba(255, 136, 0, 0.12);
      border: 1px solid rgba(255, 136, 0, 0.35);
      border-radius: 9999px;
      text-decoration: none;
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      color: #ff9d33;
      transition: all var(--transition-fast, 0.15s ease);

      &:hover {
        background: rgba(255, 136, 0, 0.22);
        border-color: #ff9d33;
        transform: translateY(-1px);
      }

      @media (max-width: 500px) {
        padding: 2px 7px;
        font-size: 10px;
        svg { width: 10px; height: 10px; }
      }
    }
  `]
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  streakService = inject(StreakService);

  dropdownOpen = signal(false);
  mobileOpen   = signal(false);
  readonly currentUrl = signal<string>(this.router.url);

  // Estados del avatar ASCII animado
  readonly currentFrame = signal<number>(0);
  readonly selectedAvatarId = signal<string>('');
  private frameTimer?: any;
  private avatarListener?: () => void;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      });
  }

  ngOnInit() {
    this.syncSelectedAvatar();

    if (typeof window !== 'undefined') {
      this.frameTimer = setInterval(() => {
        this.currentFrame.update(f => f + 1);
      }, 750);

      this.avatarListener = () => this.syncSelectedAvatar();
      window.addEventListener('ascii-avatar:changed', this.avatarListener);
      window.addEventListener('storage', this.avatarListener);
    }
  }

  ngOnDestroy() {
    if (this.frameTimer) clearInterval(this.frameTimer);
    if (typeof window !== 'undefined' && this.avatarListener) {
      window.removeEventListener('ascii-avatar:changed', this.avatarListener);
      window.removeEventListener('storage', this.avatarListener);
    }
  }

  syncSelectedAvatar() {
    if (typeof window === 'undefined') return;
    const isT = this.isTeacher();
    const storageKey = isT ? 'syseng_selected_teacher_ascii_avatar' : 'syseng_selected_ascii_avatar';
    const saved = localStorage.getItem(storageKey);
    const pool = isT ? TEACHER_MINI_AVATARS : STUDENT_MINI_AVATARS;
    if (saved && pool[saved]) {
      this.selectedAvatarId.set(saved);
    } else {
      const defaultId = isT ? 'professor_owl' : 'cyber_cat';
      this.selectedAvatarId.set(defaultId);
    }
  }

  readonly currentMiniFrame = computed(() => {
    const isT = this.isTeacher();
    const pool = isT ? TEACHER_MINI_AVATARS : STUDENT_MINI_AVATARS;
    const id = this.selectedAvatarId();
    const frames = pool[id] || (isT ? pool['professor_owl'] : pool['cyber_cat']);
    const idx = this.currentFrame() % frames.length;
    return frames[idx];
  });

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.email === 'andrescamilomartinez330@gmail.com' ||
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  readonly isDocenteRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/docente') || url.startsWith('/admin');
  });

  readonly isProfileRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/perfil');
  });

  readonly isTeacherDocenteZone = computed(() => {
    return this.isTeacher() && (this.isDocenteRoute() || this.isProfileRoute());
  });

  readonly currentTeacherTab = computed(() => {
    const url = this.currentUrl();
    if (url.includes('tab=activities')) return 'activities';
    if (url.includes('tab=activity')) return 'activity';
    if (url.includes('tab=ai')) return 'ai';
    return 'students';
  });

  readonly roleLabel = computed(() => {
    if (this.isTeacher()) return 'Docente & Admin';
    return 'Estudiante';
  });

  readonly studentStreak = computed(() => {
    return this.streakService.currentStreak();
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
