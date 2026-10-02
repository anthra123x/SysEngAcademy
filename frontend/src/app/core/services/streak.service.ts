import { Injectable, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface WeeklyDayActivity {
  day: string;
  date: string;
  active: boolean;
  study_seconds: number;
  study_minutes: number;
  is_today: boolean;
}

export interface StreakTelemetryResponse {
  success?: boolean;
  current_streak: number;
  max_streak: number;
  today_study_seconds: number;
  today_study_minutes: number;
  total_study_seconds: number;
  total_study_minutes: number;
  last_activity_date: string;
  weekly_matrix: WeeklyDayActivity[];
  user_xp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class StreakService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly currentStreak = signal<number>(1);
  readonly maxStreak = signal<number>(1);
  readonly todayStudyMinutes = signal<number>(1);
  readonly todayStudySeconds = signal<number>(30);
  readonly totalStudyMinutes = signal<number>(1);
  readonly weeklyMatrix = signal<WeeklyDayActivity[]>(this.getInitialWeeklyMatrix());
  readonly isTracking = signal<boolean>(false);

  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private readonly PING_INTERVAL_MS = 30000; // Cada 30 segundos de estudio activo
  private lastPingTimestamp = Date.now();
  private lastPulseSentAt = 0;
  private readonly MIN_PULSE_INTERVAL_MS = 25000; // Mínimo 25 segundos entre pulsos rutinarios

  constructor() {
    this.restoreLocalCache();

    // Reaccionar al estado de autenticación
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.loadStatus();
        this.startHeartbeat();
      } else {
        this.stopHeartbeat();
      }
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', this.onVisibilityChange);
      window.addEventListener('focus', this.onWindowFocus);
    }
  }

  ngOnDestroy(): void {
    this.stopHeartbeat();
    if (typeof window !== 'undefined') {
      window.removeEventListener('visibilitychange', this.onVisibilityChange);
      window.removeEventListener('focus', this.onWindowFocus);
    }
  }

  private onVisibilityChange = () => {
    if (typeof document !== 'undefined' && !document.hidden && this.auth.isAuthenticated()) {
      this.sendPulse('pulse');
    }
  };

  private onWindowFocus = () => {
    if (this.auth.isAuthenticated()) {
      this.sendPulse('pulse');
    }
  };

  /**
   * Inicia el ciclo de telemetría en tiempo real
   */
  startHeartbeat(): void {
    if (this.pingTimer || typeof window === 'undefined') return;

    this.isTracking.set(true);
    this.lastPingTimestamp = Date.now();

    // Enviar primer ping tras 5s
    setTimeout(() => {
      if (this.auth.isAuthenticated()) {
        this.sendPulse('pulse');
      }
    }, 5000);

    this.pingTimer = setInterval(() => {
      if (this.auth.isAuthenticated() && !document.hidden) {
        this.sendPulse('pulse');
      }
    }, this.PING_INTERVAL_MS);
  }

  stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    this.isTracking.set(false);
  }

  /**
   * Carga el estado actual de racha y telemetría desde el backend
   */
  loadStatus(): void {
    const email = this.auth.user()?.email;
    const tz = this.getClientTimezone();
    const query = email ? `?email=${encodeURIComponent(email)}&tz=${encodeURIComponent(tz)}` : `?tz=${encodeURIComponent(tz)}`;

    this.api.get<StreakTelemetryResponse>(`/user/streak${query}`).subscribe({
      next: (res) => {
        if (res) {
          this.applyTelemetry(res);
        }
      },
      error: () => {
        // En caso de fallo de red, mantener caché local
      },
    });
  }

  /**
   * Envía un pulso de actividad al backend
   */
  sendPulse(action: 'pulse' | 'lesson_complete' | 'quiz_pass' | 'challenge_solve' = 'pulse'): void {
    const now = Date.now();
    // Throttling: evitar tormentas de peticiones por eventos continuos de tab/focus
    if (action === 'pulse' && (now - this.lastPulseSentAt) < this.MIN_PULSE_INTERVAL_MS) {
      return;
    }
    this.lastPulseSentAt = now;
    const elapsedSeconds = Math.min(120, Math.max(5, Math.round((now - this.lastPingTimestamp) / 1000)));
    this.lastPingTimestamp = now;

    const payload = {
      delta_seconds: elapsedSeconds,
      tz: this.getClientTimezone(),
      action,
      email: this.auth.user()?.email,
    };

    this.api.post<StreakTelemetryResponse>('/user/activity-ping', payload).subscribe({
      next: (res) => {
        if (res) {
          this.applyTelemetry(res);
        }
      },
      error: () => {
        // Fallback optimista local si no hay conexión
        this.todayStudySeconds.update((s) => s + elapsedSeconds);
        this.todayStudyMinutes.set(Math.max(1, Math.round(this.todayStudySeconds() / 60)));
      },
    });
  }

  /**
   * Notifica que el usuario completó una lección, reto, quiz o pulso activo
   */
  recordActivity(action: 'pulse' | 'lesson_complete' | 'quiz_pass' | 'challenge_solve' = 'pulse'): void {
    this.sendPulse(action);
  }

  private applyTelemetry(data: StreakTelemetryResponse): void {
    this.currentStreak.set(Math.max(1, data.current_streak || 1));
    this.maxStreak.set(Math.max(data.max_streak || 1, this.currentStreak()));
    this.todayStudyMinutes.set(Math.max(1, data.today_study_minutes || 1));
    this.todayStudySeconds.set(data.today_study_seconds || 60);
    this.totalStudyMinutes.set(Math.max(1, data.total_study_minutes || 1));

    if (data.weekly_matrix && data.weekly_matrix.length > 0) {
      this.weeklyMatrix.set(data.weekly_matrix);
    }

    this.saveLocalCache(data);
  }

  private getClientTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
    } catch {
      return 'America/Bogota';
    }
  }

  private saveLocalCache(data: StreakTelemetryResponse): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const email = this.auth.user()?.email || 'guest';
      const key = `syseng_${email}_streak_telemetry`;
      localStorage.setItem(
        key,
        JSON.stringify({
          current_streak: data.current_streak,
          max_streak: data.max_streak,
          today_study_minutes: data.today_study_minutes,
          last_activity_date: data.last_activity_date,
          saved_at: Date.now(),
        })
      );
    } catch {}
  }

  private restoreLocalCache(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const email = this.auth.user()?.email || 'guest';
      const key = `syseng_${email}_streak_telemetry`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.current_streak) this.currentStreak.set(cached.current_streak);
        if (cached.max_streak) this.maxStreak.set(cached.max_streak);
        if (cached.today_study_minutes) this.todayStudyMinutes.set(cached.today_study_minutes);
      }
    } catch {}
  }

  private getInitialWeeklyMatrix(): WeeklyDayActivity[] {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date().toISOString().slice(0, 10);
    return days.map((day, idx) => ({
      day,
      date: today,
      active: idx === 3, // Jueves por defecto activo
      study_seconds: 60,
      study_minutes: 1,
      is_today: idx === 3,
    }));
  }
}
