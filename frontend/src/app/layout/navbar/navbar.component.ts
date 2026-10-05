import { Component, inject, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { StreakService } from '../../core/services/streak.service';
import { ClansService } from '../../core/services/clans.service';
import { STUDENT_MINI_AVATARS, TEACHER_MINI_AVATARS, getStoredMiniAvatar } from '../../core/constants/ascii-avatars';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  streakService = inject(StreakService);
  clansService = inject(ClansService);

  dropdownOpen = signal(false);
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

  readonly isStreakActive = computed(() => this.streakService.isStreakActive());
  readonly isStreakPending = computed(() => this.streakService.isStreakPending());
  readonly isStreakExtinguished = computed(() => this.streakService.isStreakExtinguished());
  readonly canRecoverStreak = computed(() => this.streakService.canRecoverStreak());
  readonly previousStreak = computed(() => this.streakService.previousStreak());

  readonly streakNavTooltip = computed(() => {
    if (this.canRecoverStreak()) {
      return `¡Racha apagada! Perdiste ${this.previousStreak()}d. Haz clic para recuperarla con un ejercicio sencillo.`;
    }
    if (this.isStreakExtinguished()) {
      return 'Racha apagada (0 días). Realiza un reto o estudia para encenderla.';
    }
    if (this.isStreakPending()) {
      return `Racha de ${this.studentStreak()}d en pausa. ¡Estudia hoy para mantenerla!`;
    }
    return `🔥 Racha de ${this.studentStreak()}d activa hoy. ¡Excelente constancia!`;
  });

  readonly userClan = computed(() => {
    return this.clansService.userClan();
  });

  initials() {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  onUserChipClick() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.router.navigate(['/perfil']);
      this.dropdownOpen.set(false);
    } else {
      this.toggleDropdown();
    }
  }

  toggleDropdown() { this.dropdownOpen.update(v => !v); }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-chip')) {
      this.dropdownOpen.set(false);
    }
  }
}
