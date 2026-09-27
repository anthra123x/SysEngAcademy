import { Component, OnInit, inject, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { ForumService, ForumFilters } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';
import { CourseModule, ForumCategory, ForumPost, ForumReply } from '../../../core/models';

@Component({
  selector: 'app-course-forum',
  imports: [FormsModule, RouterLink, DatePipe, SlicePipe],
  template: `
    <div class="course-forum">
      <!-- Forum Top Bar -->
      <div class="forum-topbar">
        <div class="forum-topbar__titles">
          <h3>💬 Foro y Discusión de la Comunidad</h3>
          <p>Comparte soluciones, haz preguntas sobre el temario o exámenes y colabora con estudiantes e instructores.</p>
        </div>

        <button class="btn btn-primary" (click)="toggleComposer()">
          {{ showComposer() ? '✕ Cancelar' : '+ Nueva Pregunta o Solución' }}
        </button>
      </div>

      <!-- New Post Composer Modal/Inline -->
      @if (showComposer()) {
        <div class="forum-composer">
          <div class="composer-header">
            <h4>Publicar en el Foro</h4>
            <span class="composer-hint">Selecciona la categoría adecuada para que otros puedan ayudarte rápido</span>
          </div>

          @if (!auth.isAuthenticated()) {
            <div class="auth-required-box">
              <p>Debes iniciar sesión para publicar una duda o compartir tu solución en el foro.</p>
              <a routerLink="/auth/login" class="btn btn-primary btn-sm">Iniciar Sesión</a>
            </div>
          } @else {
            <form (ngSubmit)="submitPost()" class="composer-form">
              <div class="composer-row">
                <div class="form-group flex-1">
                  <label>Título</label>
                  <input
                    type="text"
                    class="input"
                    placeholder="Ej: ¿Cómo evitar O(n²) en el peor caso de QuickSort?"
                    [(ngModel)]="newPost.title"
                    name="postTitle"
                    required
                  />
                </div>

                <div class="form-group w-auto">
                  <label>Categoría</label>
                  <select class="input" [(ngModel)]="newPost.category" name="postCategory">
                    <option value="question">❓ Pregunta / Duda</option>
                    <option value="solution">💻 Solución Compartida</option>
                    <option value="exam">📝 Duda de Examen / Quiz</option>
                    <option value="discussion">💬 Debate General</option>
                  </select>
                </div>

                <div class="form-group w-auto">
                  <label>Módulo Relacionado</label>
                  <select class="input" [(ngModel)]="newPost.module_id" name="postModule">
                    <option [ngValue]="undefined">General (Todo el curso)</option>
                    @for (mod of modules(); track mod.id) {
                      <option [ngValue]="mod.id">Módulo {{ $index + 1 }}: {{ mod.title }}</option>
                    }
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Descripción detallada o Código</label>
                <textarea
                  class="input textarea-code"
                  rows="5"
                  placeholder="Describe tu pregunta, error o pega tu solución con explicación..."
                  [(ngModel)]="newPost.content"
                  name="postContent"
                  required
                ></textarea>
              </div>

              <div class="composer-actions">
                <button type="button" class="btn btn-ghost btn-sm" (click)="toggleComposer()">Cancelar</button>
                <button type="submit" class="btn btn-primary btn-sm" [disabled]="submitting() || !newPost.title || !newPost.content">
                  {{ submitting() ? 'Publicando…' : 'Publicar Aporte' }}
                </button>
              </div>
            </form>
          }
        </div>
      }

      <!-- Filters Strip -->
      <div class="forum-filters">
        <div class="category-tabs">
          <button
            type="button"
            class="cat-tab"
            [class.is-active]="selectedCategory() === ''"
            (click)="setCategory('')"
          >
            Todos ({{ totalPosts() }})
          </button>
          <button
            type="button"
            class="cat-tab"
            [class.is-active]="selectedCategory() === 'question'"
            (click)="setCategory('question')"
          >
            ❓ Preguntas
          </button>
          <button
            type="button"
            class="cat-tab"
            [class.is-active]="selectedCategory() === 'solution'"
            (click)="setCategory('solution')"
          >
            💻 Soluciones
          </button>
          <button
            type="button"
            class="cat-tab"
            [class.is-active]="selectedCategory() === 'exam'"
            (click)="setCategory('exam')"
          >
            📝 Exámenes / Quizzes
          </button>
          <button
            type="button"
            class="cat-tab"
            [class.is-active]="selectedCategory() === 'discussion'"
            (click)="setCategory('discussion')"
          >
            💬 Debates
          </button>
        </div>

        <div class="filter-controls">
          <select class="input input-sm" [ngModel]="selectedModuleId()" (ngModelChange)="setModule($event)">
            <option value="">Todos los módulos</option>
            @for (mod of modules(); track mod.id) {
              <option [value]="mod.id">Módulo {{ $index + 1 }}: {{ mod.title }}</option>
            }
          </select>

          <input
            type="text"
            class="input input-sm search-input"
            placeholder="Buscar en el foro..."
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
          />
        </div>
      </div>

      <!-- Posts List -->
      @if (loading()) {
        <div class="forum-loading">
          <div class="skeleton" style="height: 120px; border-radius: var(--radius-lg); margin-bottom: var(--sp-3);"></div>
          <div class="skeleton" style="height: 120px; border-radius: var(--radius-lg); margin-bottom: var(--sp-3);"></div>
          <div class="skeleton" style="height: 120px; border-radius: var(--radius-lg);"></div>
        </div>
      } @else if (posts().length === 0) {
        <div class="forum-empty">
          <div class="empty-icon">💡</div>
          <h4>No hay discusiones en este filtro todavía</h4>
          <p>Sé el primero en hacer una pregunta, compartir tu enfoque o debatir una solución para este curso.</p>
          <button class="btn btn-outline btn-sm" (click)="showComposer.set(true)">Crear la primera publicación</button>
        </div>
      } @else {
        <div class="posts-list">
          @for (post of posts(); track post.id) {
            <div class="post-card" [class.is-solved]="post.is_solved">
              <div class="post-card__left">
                <button
                  type="button"
                  class="upvote-btn"
                  (click)="upvote(post)"
                  [title]="'Votar positivo (' + post.upvotes + ')'"
                >
                  <span class="upvote-arrow">▲</span>
                  <span class="upvote-count">{{ post.upvotes }}</span>
                </button>
              </div>

              <div class="post-card__main">
                <!-- Eyebrow Tag Row -->
                <div class="post-eyebrow">
                  <span class="post-cat-badge" [class]="'cat-badge--' + post.category">
                    {{ categoryLabel(post.category) }}
                  </span>

                  @if (post.module) {
                    <span class="post-module-tag">
                      Módulo {{ post.module.order }}: {{ post.module.title | slice:0:30 }}
                    </span>
                  }

                  @if (post.is_solved) {
                    <span class="solved-pill">✓ Solución Aceptada</span>
                  }
                </div>

                <!-- Post Title -->
                <h4 class="post-title" (click)="toggleThread(post.id)">
                  {{ post.title }}
                </h4>

                <!-- Post Content Preview -->
                <p class="post-snippet">{{ post.content }}</p>

                <!-- Post Footer Meta -->
                <div class="post-footer">
                  <div class="post-author">
                    <div class="author-avatar">{{ initials(post.user?.name ?? 'U') }}</div>
                    <span class="author-name">{{ post.user?.name ?? 'Usuario' }}</span>
                    @if (post.user?.role === 'instructor') {
                      <span class="role-badge role-instructor">Instructor</span>
                    }
                    <span class="post-date">· {{ post.created_at | date:'dd MMM yyyy' }}</span>
                  </div>

                  <button type="button" class="thread-toggle-btn" (click)="toggleThread(post.id)">
                    💬 {{ post.replies_count ?? 0 }} {{ (post.replies_count === 1) ? 'respuesta' : 'respuestas' }}
                    <span class="chevron" [class.is-rotated]="openThreadId() === post.id">▾</span>
                  </button>
                </div>

                <!-- In-place Thread Discussion -->
                @if (openThreadId() === post.id) {
                  <div class="thread-replies">
                    <div class="replies-header">
                      <span>Respuestas de la comunidad ({{ activeThreadReplies().length }})</span>
                    </div>

                    @if (loadingThread()) {
                      <div class="skeleton" style="height: 60px; margin: 8px 0; border-radius: var(--radius-md);"></div>
                    } @else {
                      <div class="replies-list">
                        @for (reply of activeThreadReplies(); track reply.id) {
                          <div class="reply-card" [class.is-solution]="reply.is_solution">
                            @if (reply.is_solution) {
                              <div class="solution-banner">
                                <span>✓ Solución verificada</span>
                              </div>
                            }

                            <div class="reply-head">
                              <div class="reply-author">
                                <div class="avatar-sm">{{ initials(reply.user?.name ?? 'U') }}</div>
                                <span class="author-sm-name">{{ reply.user?.name ?? 'Usuario' }}</span>
                                @if (reply.user?.role === 'instructor') {
                                  <span class="role-badge role-instructor">Instructor</span>
                                }
                              </div>
                              <span class="reply-date">{{ reply.created_at | date:'dd/MM/yyyy HH:mm' }}</span>
                            </div>

                            <div class="reply-body">
                              {{ reply.content }}
                            </div>

                            @if (!reply.is_solution && (isPostOwner(post) || isStaff())) {
                              <div class="reply-actions">
                                <button type="button" class="btn-solution" (click)="markAsSolution(reply.id)">
                                  ✓ Marcar como solución
                                </button>
                              </div>
                            }
                          </div>
                        }

                        @if (activeThreadReplies().length === 0) {
                          <p class="no-replies-yet">Aún no hay respuestas en este tema. ¡Sé el primero en responder!</p>
                        }
                      </div>

                      <!-- New Reply Composer -->
                      <div class="reply-composer">
                        @if (auth.isAuthenticated()) {
                          <div class="reply-box">
                            <textarea
                              class="input input-sm"
                              rows="2"
                              placeholder="Escribe tu respuesta o comparte una solución alternativa..."
                              [(ngModel)]="newReplyContent"
                            ></textarea>
                            <button
                              type="button"
                              class="btn btn-primary btn-sm"
                              (click)="sendReply(post.id)"
                              [disabled]="replying() || !newReplyContent.trim()"
                            >
                              {{ replying() ? 'Enviando…' : 'Responder' }}
                            </button>
                          </div>
                        } @else {
                          <div class="reply-auth-hint">
                            <a routerLink="/auth/login">Inicia sesión</a> para responder a esta pregunta.
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .course-forum {
      margin-top: var(--sp-8);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-6);
    }

    /* Top bar */
    .forum-topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--sp-4);
      padding-bottom: var(--sp-5);
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;

      &__titles {
        flex: 1;
        min-width: 260px;

        h3 {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        p {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          line-height: 1.5;
        }
      }
    }

    /* Composer */
    .forum-composer {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      margin: var(--sp-5) 0;

      .composer-header {
        margin-bottom: var(--sp-4);
        h4 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); }
        .composer-hint { font-size: var(--text-xs); color: var(--text-muted); }
      }
    }

    .composer-form {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }

    .composer-row {
      display: flex;
      gap: var(--sp-3);
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.72rem;
        font-weight: var(--font-bold);
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }
    }

    .flex-1 { flex: 1; min-width: 220px; }
    .w-auto { min-width: 180px; }

    .textarea-code {
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      line-height: 1.5;
      resize: vertical;
    }

    .composer-actions {
      display: flex;
      justify-content: flex-end;
      gap: var(--sp-2);
      margin-top: var(--sp-2);
    }

    .auth-required-box {
      text-align: center;
      padding: var(--sp-4);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-2);
    }

    /* Filters Strip */
    .forum-filters {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--sp-4);
      margin: var(--sp-5) 0 var(--sp-6);
      flex-wrap: wrap;
    }

    .category-tabs {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .cat-tab {
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: var(--font-medium);
      padding: 6px 12px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-surface-3);
        color: var(--text-primary);
      }

      &.is-active {
        background: var(--primary);
        border-color: var(--primary);
        color: #fff;
        font-weight: var(--font-semibold);
      }
    }

    .filter-controls {
      display: flex;
      gap: var(--sp-2);
      flex-wrap: wrap;
    }

    .input-sm {
      padding: 6px 10px;
      font-size: 0.75rem;
    }

    .search-input {
      width: 180px;
    }

    /* Posts List */
    .posts-list {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }

    .post-card {
      display: flex;
      gap: var(--sp-4);
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-4) var(--sp-5);
      transition: border-color var(--transition-fast);

      &:hover {
        border-color: var(--border-hover);
      }

      &.is-solved {
        border-left: 3px solid var(--success);
      }
    }

    .post-card__left {
      flex-shrink: 0;
    }

    .upvote-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 38px;
      padding: 6px 2px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      color: var(--text-muted);
      transition: all var(--transition-fast);

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
      }

      .upvote-arrow {
        font-size: 0.75rem;
        line-height: 1;
      }

      .upvote-count {
        font-size: 0.75rem;
        font-weight: var(--font-bold);
        font-family: var(--font-mono);
        margin-top: 2px;
      }
    }

    .post-card__main {
      flex: 1;
      min-width: 0;
    }

    .post-eyebrow {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .post-cat-badge {
      font-size: 11px;
      font-weight: var(--font-semibold);
      padding: 1px 7px;
      border-radius: var(--radius-sm);

      &.cat-badge--question {
        background: rgba(255, 215, 64, 0.12);
        color: var(--warning);
        border: 1px solid rgba(255, 215, 64, 0.25);
      }

      &.cat-badge--solution {
        background: rgba(108, 99, 255, 0.15);
        color: #A78BFA;
        border: 1px solid rgba(108, 99, 255, 0.35);
      }

      &.cat-badge--exam {
        background: rgba(0, 217, 255, 0.12);
        color: var(--accent);
        border: 1px solid rgba(0, 217, 255, 0.25);
      }

      &.cat-badge--discussion {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-secondary);
        border: 1px solid var(--border);
      }
    }

    .post-module-tag {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--bg-surface);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
      border: 1px solid rgba(42, 42, 62, 0.6);
    }

    .solved-pill {
      font-size: 10px;
      font-weight: var(--font-bold);
      color: var(--success);
      background: rgba(0, 230, 118, 0.12);
      border: 1px solid rgba(0, 230, 118, 0.3);
      padding: 1px 6px;
      border-radius: 99px;
    }

    .post-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      cursor: pointer;
      line-height: 1.35;
      margin-bottom: 4px;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--primary);
      }
    }

    .post-snippet {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: var(--sp-3);
      white-space: pre-line;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      font-size: var(--text-xs);
    }

    .post-author {
      display: flex;
      align-items: center;
      gap: 6px;

      .author-avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--primary-dim);
        color: var(--primary);
        font-size: 10px;
        font-weight: var(--font-bold);
        display: grid;
        place-items: center;
      }

      .author-name {
        color: var(--text-secondary);
        font-weight: var(--font-medium);
      }

      .post-date {
        color: var(--text-muted);
      }
    }

    .role-badge {
      font-size: 9px;
      padding: 1px 5px;
      border-radius: 3px;
      text-transform: uppercase;
      font-weight: var(--font-bold);

      &.role-instructor {
        background: rgba(108, 99, 255, 0.2);
        color: #A78BFA;
        border: 1px solid rgba(108, 99, 255, 0.4);
      }
    }

    .thread-toggle-btn {
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      font-size: 0.72rem;
      padding: 3px 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--bg-surface-3);
        color: var(--text-primary);
        border-color: var(--border-hover);
      }

      .chevron {
        transition: transform var(--transition-fast);
        &.is-rotated { transform: rotate(180deg); color: var(--primary); }
      }
    }

    /* Thread Replies Section */
    .thread-replies {
      margin-top: var(--sp-4);
      padding-top: var(--sp-4);
      border-top: 1px solid var(--border);
      background: rgba(10, 10, 15, 0.3);
      padding: var(--sp-4);
      border-radius: var(--radius-md);

      .replies-header {
        font-size: 0.72rem;
        font-weight: var(--font-bold);
        text-transform: uppercase;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        margin-bottom: var(--sp-3);
      }
    }

    .replies-list {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
      margin-bottom: var(--sp-4);
    }

    .reply-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--sp-3) var(--sp-4);
      font-size: var(--text-xs);

      &.is-solution {
        border-color: var(--success);
        background: rgba(0, 230, 118, 0.05);
      }

      .solution-banner {
        color: var(--success);
        font-size: 10px;
        font-weight: var(--font-bold);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 6px;
      }

      .reply-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .reply-author {
        display: flex;
        align-items: center;
        gap: 6px;

        .avatar-sm {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-surface-3);
          color: var(--text-secondary);
          font-size: 9px;
          font-weight: var(--font-bold);
          display: grid;
          place-items: center;
        }

        .author-sm-name {
          font-weight: var(--font-medium);
          color: var(--text-primary);
        }
      }

      .reply-date {
        color: var(--text-muted);
        font-size: 10px;
      }

      .reply-body {
        color: var(--text-secondary);
        line-height: 1.5;
        white-space: pre-line;
      }

      .reply-actions {
        margin-top: 6px;
        display: flex;
        justify-content: flex-end;

        .btn-solution {
          background: transparent;
          border: 1px solid var(--success);
          color: var(--success);
          font-size: 10px;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background var(--transition-fast);

          &:hover {
            background: var(--success);
            color: #000;
          }
        }
      }
    }

    .no-replies-yet {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-style: italic;
      text-align: center;
      padding: var(--sp-2) 0;
    }

    .reply-box {
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
      align-items: flex-end;

      textarea { width: 100%; }
    }

    .reply-auth-hint {
      text-align: center;
      font-size: var(--text-xs);
      color: var(--text-muted);
      padding: var(--sp-2) 0;
      a { color: var(--primary); }
    }

    .forum-empty {
      text-align: center;
      padding: var(--sp-10) var(--sp-4);
      background: var(--bg-surface-2);
      border-radius: var(--radius-lg);

      .empty-icon { font-size: 2.5rem; margin-bottom: var(--sp-2); }
      h4 { font-size: var(--text-base); font-weight: var(--font-semibold); color: var(--text-primary); margin-bottom: 4px; }
      p { font-size: var(--text-xs); color: var(--text-secondary); max-width: 48ch; margin: 0 auto var(--sp-4); }
    }
  `]
})
export class CourseForumComponent implements OnInit {
  courseSlug = input.required<string>();
  modules    = input<CourseModule[]>([]);

  private forumSvc = inject(ForumService);
  auth             = inject(AuthService);

  posts        = signal<ForumPost[]>([]);
  totalPosts   = signal(0);
  loading      = signal(true);
  submitting   = signal(false);
  showComposer = signal(false);

  selectedCategory = signal<string>('');
  selectedModuleId = signal<number | ''>('');
  searchQuery      = signal<string>('');

  // Active expanded thread state
  openThreadId         = signal<number | null>(null);
  activeThreadReplies  = signal<ForumReply[]>([]);
  loadingThread        = signal(false);
  newReplyContent      = '';
  replying             = signal(false);

  initialModuleId = input<number>();
  initialCategory = input<string>();

  // New Post Form Model
  newPost: {
    title: string;
    content: string;
    category: ForumCategory;
    module_id?: number;
  } = {
    title: '',
    content: '',
    category: 'question',
  };

  ngOnInit() {
    if (this.initialModuleId()) {
      this.selectedModuleId.set(this.initialModuleId()!);
      this.newPost.module_id = this.initialModuleId()!;
    }
    if (this.initialCategory()) {
      this.selectedCategory.set(this.initialCategory()!);
      this.newPost.category = this.initialCategory() as ForumCategory;
    }
    this.loadPosts();
  }

  loadPosts() {
    this.loading.set(true);
    const filters: ForumFilters = {};
    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.selectedModuleId()) filters.module_id = Number(this.selectedModuleId());
    if (this.searchQuery().trim()) filters.search = this.searchQuery().trim();

    this.forumSvc.getCoursePosts(this.courseSlug(), filters).subscribe({
      next: (res) => {
        this.posts.set(res.data ?? []);
        this.totalPosts.set(res.total ?? (res.data?.length ?? 0));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.loadPosts();
  }

  setModule(mid: number | '') {
    this.selectedModuleId.set(mid);
    this.loadPosts();
  }

  onSearchChange(q: string) {
    this.searchQuery.set(q);
    this.loadPosts();
  }

  toggleComposer() {
    this.showComposer.update(v => !v);
  }

  submitPost() {
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) return;
    this.submitting.set(true);

    this.forumSvc.createPost(this.courseSlug(), {
      title: this.newPost.title.trim(),
      content: this.newPost.content.trim(),
      category: this.newPost.category,
      module_id: this.newPost.module_id ? Number(this.newPost.module_id) : undefined,
    }).subscribe({
      next: (post) => {
        this.posts.update(list => [post, ...list]);
        this.totalPosts.update(t => t + 1);
        this.showComposer.set(false);
        this.submitting.set(false);
        this.newPost = { title: '', content: '', category: 'question' };
      },
      error: () => this.submitting.set(false),
    });
  }

  upvote(post: ForumPost) {
    if (!this.auth.isAuthenticated()) return;
    this.forumSvc.upvotePost(post.id).subscribe({
      next: (res) => {
        post.upvotes = res.upvotes;
      }
    });
  }

  toggleThread(postId: number) {
    if (this.openThreadId() === postId) {
      this.openThreadId.set(null);
      this.activeThreadReplies.set([]);
      return;
    }

    this.openThreadId.set(postId);
    this.loadingThread.set(true);
    this.forumSvc.getPost(postId).subscribe({
      next: (post) => {
        this.activeThreadReplies.set(post.replies ?? []);
        this.loadingThread.set(false);
      },
      error: () => this.loadingThread.set(false),
    });
  }

  sendReply(postId: number) {
    if (!this.newReplyContent.trim()) return;
    this.replying.set(true);

    this.forumSvc.addReply(postId, this.newReplyContent.trim()).subscribe({
      next: (reply) => {
        this.activeThreadReplies.update(list => [...list, reply]);
        this.posts.update(list =>
          list.map(p => p.id === postId ? { ...p, replies_count: (p.replies_count ?? 0) + 1 } : p)
        );
        this.newReplyContent = '';
        this.replying.set(false);
      },
      error: () => this.replying.set(false),
    });
  }

  markAsSolution(replyId: number) {
    this.forumSvc.markSolution(replyId).subscribe({
      next: (updatedReply) => {
        this.activeThreadReplies.update(list =>
          list.map(r => ({ ...r, is_solution: r.id === updatedReply.id }))
        );
        const currPostId = this.openThreadId();
        if (currPostId) {
          this.posts.update(list =>
            list.map(p => p.id === currPostId ? { ...p, is_solved: true } : p)
          );
        }
      }
    });
  }

  categoryLabel(cat: ForumCategory): string {
    switch (cat) {
      case 'question': return '❓ Pregunta';
      case 'solution': return '💻 Solución';
      case 'exam': return '📝 Examen / Quiz';
      case 'discussion': return '💬 Debate';
      default: return '💬 Discusión';
    }
  }

  initials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  isPostOwner(post: ForumPost): boolean {
    return this.auth.user()?.id === post.user_id;
  }

  isStaff(): boolean {
    const role = this.auth.user()?.role;
    return role === 'instructor' || role === 'admin';
  }
}
