import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { AppIconComponent } from './app-icon.component';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <div class="syseng-toast-stack" aria-live="polite">
      @for (toast of notificationSvc.notifications(); track toast.id) {
        <div
          class="syseng-toast-card animate-slide-down"
          [class.is-success]="toast.type === 'success'"
          [class.is-error]="toast.type === 'error'"
          [class.is-warning]="toast.type === 'warning'"
          [class.is-info]="toast.type === 'info'"
        >
          <div class="syseng-toast-icon">
            <app-icon
              [name]="toast.icon || (toast.type === 'error' ? 'alert-circle' : toast.type === 'warning' ? 'alert-triangle' : 'check-circle')"
              [size]="20"
              [color]="toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#0AE98A'"
            />
          </div>

          <div class="syseng-toast-content">
            <span class="syseng-toast-title">{{ toast.title }}</span>
            <span class="syseng-toast-desc">{{ toast.message }}</span>
          </div>

          @if (toast.xp) {
            <div class="syseng-toast-xp font-mono">+{{ toast.xp }} XP</div>
          }

          <button
            type="button"
            class="syseng-toast-close"
            (click)="notificationSvc.dismiss(toast.id)"
            title="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .syseng-toast-stack {
      position: fixed;
      top: 80px;
      right: 24px;
      z-index: 99999;
      max-width: 420px;
      width: calc(100vw - 48px);
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .syseng-toast-card {
      pointer-events: auto;
      background: rgba(16, 18, 28, 0.95);
      border: 1px solid rgba(10, 233, 138, 0.35);
      backdrop-filter: blur(16px);
      border-radius: var(--radius-lg, 12px);
      padding: 14px 18px;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(10, 233, 138, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s ease;

      &.is-error {
        border-color: rgba(239, 68, 68, 0.4);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.15);

        .syseng-toast-icon {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
        }
      }

      &.is-warning {
        border-color: rgba(245, 158, 11, 0.4);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 158, 11, 0.15);

        .syseng-toast-icon {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
        }
      }

      &.is-info {
        border-color: rgba(0, 217, 255, 0.4);
        box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 217, 255, 0.15);

        .syseng-toast-icon {
          background: rgba(0, 217, 255, 0.12);
          border-color: rgba(0, 217, 255, 0.3);
        }
      }
    }

    .syseng-toast-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(10, 233, 138, 0.12);
      border: 1px solid rgba(10, 233, 138, 0.3);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .syseng-toast-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .syseng-toast-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #ffffff;
    }

    .syseng-toast-desc {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.35;
      word-break: break-word;
    }

    .syseng-toast-xp {
      font-size: 0.8rem;
      font-weight: 800;
      color: #0AE98A;
      background: rgba(10, 233, 138, 0.15);
      border: 1px solid rgba(10, 233, 138, 0.35);
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .syseng-toast-close {
      background: transparent;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      font-size: 0.85rem;
      flex-shrink: 0;
      transition: color 0.15s ease;

      &:hover {
        color: #ffffff;
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-16px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .animate-slide-down {
      animation: slideDown 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `],
})
export class GlobalToastComponent {
  readonly notificationSvc = inject(NotificationService);
}
