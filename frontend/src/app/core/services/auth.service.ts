import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService);
  private router = inject(Router);

  private _user  = signal<User | null>(this.loadUser());
  readonly user  = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin         = computed(() => this._user()?.role === 'admin');
  readonly isInstructor    = computed(() => ['admin','instructor'].includes(this._user()?.role ?? ''));

  private loadUser(): User | null {
    const stored = localStorage.getItem('syseng_user');
    return stored ? JSON.parse(stored) : null;
  }

  register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    return this.api.post<{ user: User; token: string }>('/auth/register', data).pipe(
      tap(res => this.setSession(res))
    );
  }

  login(credentials: { email: string; password: string }) {
    return this.api.post<{ user: User; token: string }>('/auth/login', credentials).pipe(
      tap(res => this.setSession(res))
    );
  }

  logout() {
    this.api.post('/auth/logout').subscribe({
      complete: () => this.clearSession(),
      error:    () => this.clearSession(),
    });
  }

  fetchMe() {
    return this.api.get<User>('/auth/me').pipe(
      tap(user => {
        this._user.set(user);
        localStorage.setItem('syseng_user', JSON.stringify(user));
      })
    );
  }

  private setSession(res: { user: User; token: string }) {
    localStorage.setItem('syseng_token', res.token);
    localStorage.setItem('syseng_user', JSON.stringify(res.user));
    this._user.set(res.user);
  }

  private clearSession() {
    localStorage.removeItem('syseng_token');
    localStorage.removeItem('syseng_user');
    this._user.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('syseng_token');
  }
}
