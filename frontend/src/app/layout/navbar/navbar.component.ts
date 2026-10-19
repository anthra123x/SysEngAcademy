import { Component, inject, signal, computed, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { StreakService } from '../../core/services/streak.service';
import { NotificationService, InboxNotification } from '../../core/services/notification.service';
import { AppIconComponent } from '../../shared/components/app-icon.component';
import { STUDENT_MINI_AVATARS, TEACHER_MINI_AVATARS, getStoredMiniAvatar } from '../../core/constants/ascii-avatars';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  router = inject(Router);
  streakService = inject(StreakService);
  notificationService = inject(NotificationService);

  dropdownOpen = signal(false);
  notificationsOpen = signal(false);
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
    return this.isTeacher() && this.isDocenteRoute();
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


  readonly unreadNotificationsCount = computed(() => this.notificationService.unreadCount());
  readonly notifications = computed(() => this.notificationService.inboxNotifications());

  toggleNotifications(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.dropdownOpen.set(false);
    this.notificationsOpen.update(v => !v);
  }

  markAllNotificationsAsRead() {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(item: InboxNotification) {
    if (!item.read_at) {
      this.notificationService.markAsRead(item.id);
    }
    this.notificationsOpen.set(false);

    if (item.data?.route) {
      const qp = item.data.tab ? { tab: item.data.tab } : undefined;
      this.router.navigate([item.data.route], { queryParams: qp });
    } else if (item.type === 'github_sync') {
      this.router.navigate(['/perfil'], { queryParams: { tab: 'achievements' } });
    }
  }

  getNotificationIcon(item: InboxNotification): string {
    if (item.data?.icon) return item.data.icon;
    switch (item.type) {
      case 'achievement': return 'trophy';
      case 'github_sync': return 'git-commit';
      case 'course': return 'book-open';
      case 'quiz': return 'file-text';
      case 'streak': return 'flame';
      case 'level': return 'zap';
      case 'welcome': return 'sparkles';
      default: return 'bell';
    }
  }

  timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'ahora';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `hace ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  }

  initials() {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  onUserChipClick() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.router.navigate(['/perfil']);
      this.dropdownOpen.set(false);
      this.notificationsOpen.set(false);
    } else {
      this.notificationsOpen.set(false);
      this.toggleDropdown();
    }
  }

  toggleDropdown() { this.dropdownOpen.update(v => !v); }

  logout() {
    this.auth.logout();
    this.dropdownOpen.set(false);
    this.notificationsOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-chip')) {
      this.dropdownOpen.set(false);
    }
    if (!target.closest('.notifications-nav-wrap')) {
      this.notificationsOpen.set(false);
    }
  }
}
