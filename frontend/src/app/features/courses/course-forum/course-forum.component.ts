import { Component, OnInit, inject, signal, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { ForumService, ForumFilters } from '../../../core/services/forum.service';
import { AuthService } from '../../../core/services/auth.service';
import { CourseModule, ForumCategory, ForumPost, ForumReply } from '../../../core/models';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

@Component({
  selector: 'app-course-forum',
  imports: [FormsModule, RouterLink, DatePipe, SlicePipe, AppIconComponent],
  templateUrl: './course-forum.component.html',
  styleUrl: './course-forum.component.scss',
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

  /** Fallo al listar publicaciones: se distingue del "aun no hay posts" real. */
  loadError   = signal<string | null>(null);
  /** Fallo al publicar/responder/votar/marcar solucion. */
  actionError = signal<string | null>(null);

  selectedCategory = signal<string>('');
  selectedModuleId = signal<number | null>(null);
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
    module_id: number | null;
  } = {
    title: '',
    content: '',
    category: 'question',
    module_id: null,
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
    this.loadError.set(null);
    const filters: ForumFilters = {};
    if (this.selectedCategory()) filters.category = this.selectedCategory();
    if (this.selectedModuleId()) filters.module_id = Number(this.selectedModuleId());
    if (this.searchQuery().trim()) filters.search = this.searchQuery().trim();

    this.forumSvc.getCoursePosts(this.courseSlug(), filters).subscribe({
      next: (res) => {
        const enriched = (res.data ?? []).map(p => {
          if (!p.module && p.module_id) {
            p.module = this.modules().find(m => m.id === p.module_id);
          }
          return p;
        });
        this.posts.set(enriched);
        this.totalPosts.set(res.total ?? enriched.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.posts.set([]);
        this.totalPosts.set(0);
        this.loadError.set(this.readableError(err, 'No se pudo conectar con el servidor del foro.'));
        this.loading.set(false);
      },
    });
  }

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.loadPosts();
  }

  setModule(mid: number | string) {
    this.selectedModuleId.set(mid === '' || mid === null ? null : Number(mid));
    this.loadPosts();
  }

  onSearchChange(q: string) {
    this.searchQuery.set(q);
    this.loadPosts();
  }

  toggleComposer() {
    this.actionError.set(null);
    this.showComposer.update(v => !v);
  }

  submitPost() {
    if (!this.newPost.title.trim() || !this.newPost.content.trim()) return;
    this.submitting.set(true);
    this.actionError.set(null);

    this.forumSvc.createPost(this.courseSlug(), {
      title: this.newPost.title.trim(),
      content: this.newPost.content.trim(),
      category: this.newPost.category,
      module_id: this.newPost.module_id ?? undefined,
    }).subscribe({
      next: (post) => {
        if (!post.module && post.module_id) {
          post.module = this.modules().find(m => m.id === post.module_id);
        }
        this.posts.update(list => [post, ...list]);
        this.totalPosts.update(t => t + 1);
        this.showComposer.set(false);
        this.submitting.set(false);
        this.newPost = { title: '', content: '', category: 'question', module_id: this.newPost.module_id };
      },
      error: (err) => {
        this.actionError.set(this.readableError(err, 'No se pudo publicar tu aporte. Inténtalo de nuevo.'));
        this.submitting.set(false);
      },
    });
  }

  upvote(post: ForumPost) {
    if (!this.auth.isAuthenticated()) {
      this.actionError.set('Inicia sesión para votar las publicaciones de la comunidad.');
      return;
    }
    this.actionError.set(null);
    this.forumSvc.upvotePost(post.id).subscribe({
      next: (res) => {
        this.posts.update(list =>
          list.map(p => (p.id === post.id ? { ...p, upvotes: res.upvotes } : p))
        );
      },
      error: (err) =>
        this.actionError.set(this.readableError(err, 'No se pudo registrar tu voto.')),
    });
  }

  toggleThread(postId: number) {
    if (this.openThreadId() === postId) {
      this.openThreadId.set(null);
      this.activeThreadReplies.set([]);
      return;
    }

    this.openThreadId.set(postId);
    this.activeThreadReplies.set([]);
    this.loadingThread.set(true);
    this.forumSvc.getPost(postId).subscribe({
      next: (post) => {
        this.activeThreadReplies.set(post.replies ?? []);
        this.loadingThread.set(false);
      },
      error: (err) => {
        this.actionError.set(this.readableError(err, 'No se pudieron cargar las respuestas.'));
        this.loadingThread.set(false);
      },
    });
  }

  sendReply(postId: number) {
    if (!this.newReplyContent.trim()) return;
    this.replying.set(true);
    this.actionError.set(null);

    this.forumSvc.addReply(postId, this.newReplyContent.trim()).subscribe({
      next: (reply) => {
        this.activeThreadReplies.update(list => [...list, reply]);
        this.posts.update(list =>
          list.map(p => p.id === postId ? { ...p, replies_count: (p.replies_count ?? 0) + 1 } : p)
        );
        this.newReplyContent = '';
        this.replying.set(false);
      },
      error: (err) => {
        this.actionError.set(this.readableError(err, 'No se pudo enviar tu respuesta.'));
        this.replying.set(false);
      },
    });
  }

  markAsSolution(replyId: number) {
    this.actionError.set(null);
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
      },
      error: (err) =>
        this.actionError.set(this.readableError(err, 'No se pudo marcar la respuesta como solución.')),
    });
  }

  /**
   * Traduce la respuesta de Laravel a un mensaje util para el estudiante.
   * Antes los errores se descartaban y el foro aparentaba estar vacio.
   */
  private readableError(err: unknown, fallback: string): string {
    const anyErr = err as { error?: unknown; status?: number; message?: string } | null;
    const payload = anyErr?.error as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (payload?.errors) {
      const first = Object.values(payload.errors)[0]?.[0];
      if (first) return first;
    }
    if (payload?.message && !payload.message.includes('Unauthenticated')) {
      return payload.message;
    }
    if (anyErr?.status === 401) return 'Tu sesión expiró. Inicia sesión para continuar.';
    if (anyErr?.status === 0) return 'Sin conexión con el servidor del foro.';
    return fallback;
  }

  categoryLabel(cat: ForumCategory): string {
    switch (cat) {
      case 'question': return 'Pregunta';
      case 'solution': return 'Solución';
      case 'exam': return 'Examen / Quiz';
      case 'discussion': return 'Debate';
      default: return 'Discusión';
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
