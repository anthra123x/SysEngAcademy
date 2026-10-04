import { Injectable, signal } from '@angular/core';

export interface AppToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  icon?: string;
  xp?: number;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  readonly notifications = signal<AppToastNotification[]>([]);
  private timers = new Map<string, any>();

  show(notification: Omit<AppToastNotification, 'id'>): string {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const duration = notification.duration ?? 4000;
    const item: AppToastNotification = { ...notification, id };

    // Mantener máximo 3 toasts visibles para evitar saturar la pantalla
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
