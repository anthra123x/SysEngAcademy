import { Injectable, inject, signal, effect } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface AppToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  icon?: string;
  xp?: number;
  duration?: number;
}

export interface InboxNotification {
  id: number;
  type: 'achievement' | 'github_sync' | 'course' | 'quiz' | 'streak' | 'level' | 'welcome' | 'system';
  title: string;
  message: string;
  data?: {
    badge_id?: string;
    title?: string;
    icon?: string;
    route?: string;
    tab?: string;
    xp?: number;
    [key: string]: any;
  } | null;
  read_at: string | null;
  created_at: string;
}

interface NotificationsApiResponse {
  notifications: InboxNotification[];
  unread_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  // === ESTADO DE TOASTS EFÍMEROS ===
  readonly notifications = signal<AppToastNotification[]>([]);
  private timers = new Map<string, any>();

  // === ESTADO DE BANDEJA PERSISTENTE (CAMPANITA) ===
  readonly inboxNotifications = signal<InboxNotification[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly inboxLoading = signal<boolean>(false);

  private pollIntervalId: any = null;

  constructor() {
    // Si el usuario se autentica, cargar de inmediato sus notificaciones
    effect(() => {
      const isAuth = this.auth.isAuthenticated();
      if (isAuth) {
        this.loadInbox();
        this.startPolling();
      } else {
        this.inboxNotifications.set([]);
        this.unreadCount.set(0);
        this.stopPolling();
      }
    });
  }

  // ==========================================
  // BANDEJA DE NOTIFICACIONES (INBOX)
  // ==========================================

  loadInbox(): void {
    if (!this.auth.isAuthenticated()) return;

    this.inboxLoading.set(true);
    this.api.get<NotificationsApiResponse>('/notifications').subscribe({
      next: (res) => {
        this.inboxLoading.set(false);
        if (res) {
          this.inboxNotifications.set(res.notifications || []);
          this.unreadCount.set(res.unread_count || 0);
        }
      },
      error: () => {
        this.inboxLoading.set(false);
      },
    });
  }

  markAsRead(id: number): void {
    // Optimistic UI update
    this.inboxNotifications.update((items) =>
      items.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
    this.unreadCount.update((count) => Math.max(0, count - 1));

    this.api.patch<{ success: boolean; unread_count: number }>(`/notifications/${id}/read`).subscribe({
      next: (res) => {
        if (typeof res?.unread_count === 'number') {
          this.unreadCount.set(res.unread_count);
        }
      },
      error: () => {
        // En caso de fallo silencioso recargar estado
        this.loadInbox();
      },
    });
  }

  markAllAsRead(): void {
    // Optimistic UI update
    this.inboxNotifications.update((items) =>
      items.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    this.unreadCount.set(0);

    this.api.post<{ success: boolean; unread_count: number }>('/notifications/mark-all-read').subscribe({
      next: (res) => {
        if (typeof res?.unread_count === 'number') {
          this.unreadCount.set(res.unread_count);
        }
      },
      error: () => {
        this.loadInbox();
      },
    });
  }

  deleteNotification(id: number): void {
    const wasUnread = this.inboxNotifications().find((n) => n.id === id && !n.read_at);
    this.inboxNotifications.update((items) => items.filter((n) => n.id !== id));
    if (wasUnread) {
      this.unreadCount.update((c) => Math.max(0, c - 1));
    }

    this.api.delete<{ success: boolean; unread_count: number }>(`/notifications/${id}`).subscribe({
      next: (res) => {
        if (typeof res?.unread_count === 'number') {
          this.unreadCount.set(res.unread_count);
        }
      },
      error: () => {
        this.loadInbox();
      },
    });
  }

  private startPolling(): void {
    this.stopPolling();
    // Sondeo periódico liviano cada 60 segundos
    if (typeof window !== 'undefined') {
      this.pollIntervalId = setInterval(() => {
        if (this.auth.isAuthenticated()) {
          this.loadInbox();
        }
      }, 60000);
    }
  }

  private stopPolling(): void {
    if (this.pollIntervalId) {
      clearInterval(this.pollIntervalId);
      this.pollIntervalId = null;
    }
  }

  // ==========================================
  // TOASTS EFÍMEROS (GLOBAL TOASTS)
  // ==========================================

  show(notification: Omit<AppToastNotification, 'id'>): string {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const duration = notification.duration ?? 4000;
    const item: AppToastNotification = { ...notification, id };

    this.notifications.update((current) => {
      const next = [item, ...current];
      return next.slice(0, 3);
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(title: string, message: string, xp?: number, icon = 'check-circle'): string {
    return this.show({
      type: 'success',
      title,
      message,
      xp,
      icon,
    });
  }

  info(title: string, message: string, icon = 'zap'): string {
    return this.show({
      type: 'info',
      title,
      message,
      icon,
    });
  }

  warning(title: string, message: string, icon = 'alert-triangle'): string {
    return this.show({
      type: 'warning',
      title,
      message,
      icon,
    });
  }

  error(title: string, message: string, icon = 'alert-circle'): string {
    return this.show({
      type: 'error',
      title,
      message,
      icon,
      duration: 6000,
    });
  }

  dismiss(id: string): void {
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
    this.notifications.update((current) => current.filter((t) => t.id !== id));
  }
}
