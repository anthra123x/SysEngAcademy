import { Injectable, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
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

export interface StreakDrill {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  code_snippet?: string;
  options: string[];
  hint?: string;
}

export interface StreakTelemetryResponse {
  success?: boolean;
  message?: string;
  current_streak: number;
  previous_streak?: number;
  can_recover?: boolean;
  flame_state?: 'active' | 'pending' | 'extinguished';
  is_active_today?: boolean;
  max_streak: number;
  today_study_seconds: number;
  today_study_minutes: number;
  total_study_seconds: number;
  total_study_minutes: number;
  last_activity_date: string;
  weekly_matrix: WeeklyDayActivity[];
  user_xp?: number;
  explanation?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StreakService implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly currentStreak = signal<number>(0);
  readonly previousStreak = signal<number>(0);
  readonly canRecoverStreak = signal<boolean>(false);
  readonly flameState = signal<'active' | 'pending' | 'extinguished'>('extinguished');
  readonly isActiveToday = signal<boolean>(false);

  readonly maxStreak = signal<number>(1);
  readonly todayStudyMinutes = signal<number>(0);
  readonly todayStudySeconds = signal<number>(0);
  readonly totalStudyMinutes = signal<number>(0);
  readonly weeklyMatrix = signal<WeeklyDayActivity[]>(this.getInitialWeeklyMatrix());
  readonly isTracking = signal<boolean>(false);

  // Ejercicio de recuperación
  readonly recoveryDrill = signal<StreakDrill | null>(null);
  readonly isRecovering = signal<boolean>(false);
  readonly recoverySuccessMessage = signal<string | null>(null);
  readonly recoveryErrorMessage = signal<string | null>(null);

  // Estados computados
  readonly isStreakActive = computed(() => this.flameState() === 'active');
  readonly isStreakPending = computed(() => this.flameState() === 'pending');
  readonly isStreakExtinguished = computed(() => this.flameState() === 'extinguished' || this.currentStreak() === 0);

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
          // Si la racha está apagada o se puede recuperar, cargar ejercicio previo
          if (this.canRecoverStreak() || this.isStreakExtinguished()) {
            this.fetchRecoveryDrill();
          }
        }
      },
      error: () => {
        // En caso de fallo de red, mantener caché local
      },
    });
  }

  /**
   * Obtiene un reto sencillo para recuperar o encender la racha
   */
  fetchRecoveryDrill(excludeId?: string): void {
    const email = this.auth.user()?.email;
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (excludeId) params.set('exclude_id', excludeId);

    const query = params.toString() ? `?${params.toString()}` : '';
    this.api.get<StreakDrill>(`/user/streak/recovery-drill${query}`).subscribe({
      next: (drill) => {
        if (drill) {
          this.recoveryDrill.set(drill);
          this.recoveryErrorMessage.set(null);
        }
      },
      error: () => {},
    });
  }

  /**
   * Resuelve el ejercicio de recuperación para reactivar la racha
   */
  recoverStreak(drillId: string, answer: string): Observable<StreakTelemetryResponse> {
    this.isRecovering.set(true);
    this.recoveryErrorMessage.set(null);
    this.recoverySuccessMessage.set(null);

    const payload = {
      drill_id: drillId,
      answer,
      tz: this.getClientTimezone(),
      email: this.auth.user()?.email,
    };

    return new Observable((subscriber) => {
      this.api.post<StreakTelemetryResponse>('/user/streak/recover', payload).subscribe({
        next: (res) => {
          this.isRecovering.set(false);
          if (res && res.success) {
            this.applyTelemetry(res);
            this.recoverySuccessMessage.set(res.message || '¡Racha recuperada exitosamente!');
            subscriber.next(res);
            subscriber.complete();
          } else {
            const err = res.message || 'Respuesta incorrecta.';
            this.recoveryErrorMessage.set(err);
            subscriber.error(new Error(err));
          }
        },
        error: (err) => {
          this.isRecovering.set(false);
          const msg = err.error?.message || 'Respuesta incorrecta. Revisa el concepto e inténtalo de nuevo.';
          this.recoveryErrorMessage.set(msg);
          subscriber.error(err);
        },
      });
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
        this.todayStudyMinutes.set(Math.round(this.todayStudySeconds() / 60));
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
    const streak = typeof data.current_streak === 'number' ? data.current_streak : 0;
    const prevStreak = typeof data.previous_streak === 'number' ? data.previous_streak : 0;

    this.currentStreak.set(streak);
    this.previousStreak.set(prevStreak);
    this.canRecoverStreak.set(!!data.can_recover || (prevStreak > 0 && streak === 0));
    this.flameState.set(data.flame_state ?? (streak > 0 ? (data.is_active_today ? 'active' : 'pending') : 'extinguished'));
    this.isActiveToday.set(!!data.is_active_today);

    this.maxStreak.set(Math.max(data.max_streak || 1, streak, prevStreak));
    this.todayStudyMinutes.set(data.today_study_minutes ?? 0);
    this.todayStudySeconds.set(data.today_study_seconds ?? 0);
    this.totalStudyMinutes.set(data.total_study_minutes ?? 0);

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
          previous_streak: data.previous_streak ?? 0,
          can_recover: data.can_recover ?? false,
          flame_state: data.flame_state ?? 'extinguished',
          is_active_today: data.is_active_today ?? false,
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
        if (typeof cached.current_streak === 'number') this.currentStreak.set(cached.current_streak);
        if (typeof cached.previous_streak === 'number') this.previousStreak.set(cached.previous_streak);
        if (typeof cached.can_recover === 'boolean') this.canRecoverStreak.set(cached.can_recover);
        if (cached.flame_state) this.flameState.set(cached.flame_state);
        if (typeof cached.is_active_today === 'boolean') this.isActiveToday.set(cached.is_active_today);
        if (typeof cached.max_streak === 'number') this.maxStreak.set(cached.max_streak);
        if (typeof cached.today_study_minutes === 'number') this.todayStudyMinutes.set(cached.today_study_minutes);
      }
    } catch {}
  }

  private getInitialWeeklyMatrix(): WeeklyDayActivity[] {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const today = new Date().toISOString().slice(0, 10);
    return days.map((day) => ({
      day,
      date: today,
      active: false,
      study_seconds: 0,
      study_minutes: 0,
      is_today: false,
    }));
  }
}
