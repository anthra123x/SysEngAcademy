import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface GitHubRecentSync {
  title: string;
  created_at: string;
  repo_url?: string;
  commit_url?: string;
  file_url?: string;
  repo_name?: string;
}

export interface GitHubSyncStatus {
  connected: boolean;
  username?: string;
  avatar_url?: string;
  has_repo_scope: boolean;
  syncs_count?: number;
  xp_earned?: number;
  recent_syncs?: GitHubRecentSync[];
}

export interface GitHubSyncPayload {
  repo_name: string;
  file_path: string;
  content: string;
  commit_message?: string;
  description?: string;
  is_private?: boolean;
}

export interface GitHubSyncResult {
  success: boolean;
  owner: string;
  repo_name: string;
  repo_url: string;
  file_url: string;
  commit_url: string;
  commit_sha?: string;
  xp_earned: number;
  total_xp?: number;
  level?: number;
  streak?: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class GitHubSyncService {
  private api = inject(ApiService);
  private authService = inject(AuthService);

  /**
   * Consulta el estado de vinculación de GitHub y si cuenta con permisos de repositorio.
   */
  getStatus(): Observable<GitHubSyncStatus> {
    return this.api.get<GitHubSyncStatus>('/github/status');
  }

  /**
   * Solicita permisos de repositorio (public_repo) mediante OAuth interactivo.
   */
  connectRepoScope(): Observable<any> {
    return this.authService.loginWithSocial('github', 'public_repo');
  }

  /**
   * Sube un reto o proyecto directamente a la cuenta de GitHub del estudiante.
   */
  syncProject(payload: GitHubSyncPayload): Observable<GitHubSyncResult> {
    return this.api.post<GitHubSyncResult>('/github/sync', payload, 35000);
  }
}
