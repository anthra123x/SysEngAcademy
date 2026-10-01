import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CreateForumPostData, ForumCategory, ForumPost, ForumReply, User } from '../models';

export interface ForumFilters {
  module_id?: number;
  lesson_id?: number;
  category?: string;
  search?: string;
  page?: number;
}

export interface PaginatedForumPosts {
  data: ForumPost[];
  current_page: number;
  last_page: number;
  total: number;
}

const FORUM_TIMEOUT_MS = 12000;

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private readonly storagePrefix = 'syseng_forum_posts_';

  /**
   * Obtiene las publicaciones de un curso aplicando filtros opcionales.
   * Prioriza la API del backend si está disponible y fusiona con publicaciones
   * guardadas localmente. Si no hay conexión o está en modo standalone,
   * sirve desde almacenamiento persistente local con discusiones semilla.
   */
  getCoursePosts(courseSlug: string, filters: ForumFilters = {}): Observable<PaginatedForumPosts> {
    const params: Record<string, unknown> = {};
    if (filters.module_id) params['module_id'] = filters.module_id;
    if (filters.lesson_id) params['lesson_id'] = filters.lesson_id;
    if (filters.category) params['category'] = filters.category;
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page;

    return this.api.get<PaginatedForumPosts>(
      `/courses/${encodeURIComponent(courseSlug)}/forum`,
      params,
      FORUM_TIMEOUT_MS
    ).pipe(
      map(res => {
        const localPosts = this.getLocalPosts(courseSlug);
        // Fusionar posts locales creados recientemente que aún no estén en backend
        const backendIds = new Set((res.data || []).map(p => p.id));
        const missingLocal = localPosts.filter(lp => !backendIds.has(lp.id));
        const allPosts = [...missingLocal, ...(res.data || [])];
        const filtered = this.applyLocalFilters(allPosts, filters);
        return {
          data: filtered,
          current_page: res.current_page || 1,
          last_page: res.last_page || 1,
          total: (res.total || 0) + missingLocal.length,
        };
      }),
      catchError(() => {
        // Fallback local: recuperar o sembrar discusiones iniciales para este curso
        let localPosts = this.getLocalPosts(courseSlug);
        if (localPosts.length === 0) {
          localPosts = this.seedCoursePosts(courseSlug);
          this.setLocalPosts(courseSlug, localPosts);
        }
        const filtered = this.applyLocalFilters(localPosts, filters);
        return of({
          data: filtered,
          current_page: 1,
          last_page: 1,
          total: filtered.length,
        });
      })
    );
  }

  /**
   * Publica un aporte en el foro. Intenta enviar al backend; si el backend
   * responde con error (por ejemplo 401 por cuenta local o sin conexión),
   * persiste inmediatamente en almacenamiento local para no frustrar la interacción.
   */
  createPost(courseSlug: string, data: CreateForumPostData): Observable<ForumPost> {
    return this.api.post<ForumPost>(
      `/courses/${encodeURIComponent(courseSlug)}/forum`,
      data,
      FORUM_TIMEOUT_MS
    ).pipe(
      tap(created => {
        this.saveSingleLocalPost(courseSlug, created);
      }),
      catchError(() => {
        const u = this.auth.user();
        const currentUser: User = u ? u : {
          id: 3,
          name: 'Estudiante SysEng',
          email: 'estudiante@sysengacademy.dev',
          role: 'student',
        };

        const fallbackPost: ForumPost = {
          id: Date.now(),
          user_id: currentUser.id,
          course_id: 1,
          module_id: data.module_id ?? undefined,
          lesson_id: data.lesson_id ?? undefined,
          title: data.title.trim(),
          content: data.content.trim(),
          category: (data.category as ForumCategory) || 'question',
          upvotes: 0,
          is_solved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: currentUser,
          replies_count: 0,
          replies: [],
        };

        this.saveSingleLocalPost(courseSlug, fallbackPost);
        return of(fallbackPost);
      })
    );
  }

  /**
   * Obtiene el detalle de una publicación con sus respuestas.
   */
  getPost(id: number): Observable<ForumPost> {
    return this.api.get<ForumPost>(`/forum/posts/${id}`, undefined, FORUM_TIMEOUT_MS).pipe(
      catchError(() => {
        const found = this.findLocalPostById(id);
        if (found) return of(found);
        const fallback: ForumPost = {
          id,
          user_id: 3,
          course_id: 1,
          title: 'Publicación de la comunidad',
          content: 'Detalle de la consulta en el foro.',
          category: 'question',
          upvotes: 1,
          is_solved: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          replies: [],
          replies_count: 0,
        };
        return of(fallback);
      })
    );
  }

  /**
   * Agrega una respuesta a una publicación existente.
   */
  addReply(postId: number, content: string): Observable<ForumReply> {
    return this.api.post<ForumReply>(
      `/forum/posts/${postId}/replies`,
      { content },
      FORUM_TIMEOUT_MS
    ).pipe(
      tap(reply => this.appendLocalReply(postId, reply)),
      catchError(() => {
        const u = this.auth.user();
        const currentUser: User = u ? u : {
          id: 3,
          name: 'Estudiante SysEng',
          email: 'estudiante@sysengacademy.dev',
          role: 'student',
        };

        const newReply: ForumReply = {
          id: Date.now(),
          post_id: postId,
          user_id: currentUser.id,
          content: content.trim(),
          is_solution: false,
          upvotes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: currentUser,
        };

        this.appendLocalReply(postId, newReply);
        return of(newReply);
      })
    );
  }

  /**
   * Vota positivamente por una publicación.
   */
  upvotePost(postId: number): Observable<{ upvotes: number }> {
    return this.api.post<{ upvotes: number }>(
      `/forum/posts/${postId}/upvote`,
      {},
      FORUM_TIMEOUT_MS
    ).pipe(
      catchError(() => {
        const updated = this.incrementLocalUpvote(postId);
        return of({ upvotes: updated });
      })
    );
  }

  /**
   * Marca una respuesta como la solución aceptada del debate.
   */
  markSolution(replyId: number): Observable<ForumReply> {
    return this.api.post<ForumReply>(
      `/forum/replies/${replyId}/solution`,
      {},
      FORUM_TIMEOUT_MS
    ).pipe(
      catchError(() => {
        const reply = this.markLocalSolution(replyId);
        return of(reply);
      })
    );
  }

  // ==========================================
  // Métodos de Persistencia Local & Fallback
  // ==========================================

  private getLocalPosts(courseSlug: string): ForumPost[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.storagePrefix + courseSlug);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private setLocalPosts(courseSlug: string, posts: ForumPost[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storagePrefix + courseSlug, JSON.stringify(posts));
    } catch {}
  }

  private saveSingleLocalPost(courseSlug: string, post: ForumPost): void {
    const list = this.getLocalPosts(courseSlug);
    const existingIndex = list.findIndex(p => p.id === post.id);
    if (existingIndex >= 0) {
      list[existingIndex] = post;
    } else {
      list.unshift(post);
    }
    this.setLocalPosts(courseSlug, list);
  }

  private appendLocalReply(postId: number, reply: ForumReply): void {
    if (typeof window === 'undefined') return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const posts: ForumPost[] = JSON.parse(raw);
            const target = posts.find(p => p.id === postId);
            if (target) {
              target.replies = target.replies || [];
              target.replies.push(reply);
              target.replies_count = target.replies.length;
              localStorage.setItem(key, JSON.stringify(posts));
              return;
            }
          }
        }
      }
    } catch {}
  }

  private incrementLocalUpvote(postId: number): number {
    if (typeof window === 'undefined') return 1;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const posts: ForumPost[] = JSON.parse(raw);
            const target = posts.find(p => p.id === postId);
            if (target) {
              target.upvotes = (target.upvotes || 0) + 1;
              localStorage.setItem(key, JSON.stringify(posts));
              return target.upvotes;
            }
          }
        }
      }
    } catch {}
    return 1;
  }

  private markLocalSolution(replyId: number): ForumReply {
    const defaultReply: ForumReply = {
      id: replyId,
      post_id: 1,
      user_id: 3,
      content: 'Solución verificada',
      is_solution: true,
      upvotes: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window === 'undefined') return defaultReply;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const posts: ForumPost[] = JSON.parse(raw);
            for (const post of posts) {
              if (post.replies) {
                const rep = post.replies.find(r => r.id === replyId);
                if (rep) {
                  post.replies.forEach(r => (r.is_solution = false));
                  rep.is_solution = true;
                  post.is_solved = true;
                  localStorage.setItem(key, JSON.stringify(posts));
                  return rep;
                }
              }
            }
          }
        }
      }
    } catch {}
    return defaultReply;
  }

  private findLocalPostById(id: number): ForumPost | null {
    if (typeof window === 'undefined') return null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const posts: ForumPost[] = JSON.parse(raw);
            const target = posts.find(p => p.id === id);
            if (target) return target;
          }
        }
      }
    } catch {}
    return null;
  }

  private applyLocalFilters(posts: ForumPost[], filters: ForumFilters): ForumPost[] {
    return posts.filter(p => {
      if (filters.category && filters.category !== '' && p.category !== filters.category) {
        return false;
      }
      if (filters.module_id && Number(p.module_id) !== Number(filters.module_id)) {
        return false;
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(s);
        const inContent = p.content.toLowerCase().includes(s);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });
  }

  /**
   * Genera publicaciones iniciales realistas para que ningún foro de curso
   * o módulo empiece en un estado vacío desolador.
   */
  private seedCoursePosts(courseSlug: string): ForumPost[] {
    const now = new Date();
    const dateStr = now.toISOString();

    if (courseSlug.includes('programacion') || courseSlug.includes('python')) {
      return [
        {
          id: 101,
          user_id: 2,
          course_id: 1,
          module_id: 1,
          title: '¿Cuál es la diferencia fundamental entre declarar, inicializar y reasignar una variable?',
          content: 'En lenguajes como C++ o Java se declara con tipo explícito, pero en Python las variables se crean en tiempo de asignación. ¿Cómo maneja el recolector de basura la reasignación de memoria?',
          category: 'question',
          upvotes: 6,
          is_solved: true,
          created_at: dateStr,
          updated_at: dateStr,
          user: { id: 2, name: 'Prof. Carlos Instructor', email: 'carlos@sysengacademy.dev', role: 'instructor' },
          replies_count: 1,
          replies: [
            {
              id: 201,
              post_id: 101,
              user_id: 1,
              content: 'En Python las variables son referencias (punteros a objetos en memoria dinámica heap). Si reasignas `x = 10` y luego `x = "hola"`, el entero 10 queda huérfano si no hay más referencias y es recolectado.',
              is_solution: true,
              upvotes: 4,
              created_at: dateStr,
              updated_at: dateStr,
              user: { id: 1, name: 'Admin SysEng', email: 'admin@sysengacademy.dev', role: 'admin' },
            },
          ],
        },
        {
          id: 102,
          user_id: 3,
          course_id: 1,
          module_id: 2,
          title: 'Consejo para depurar bucles while con condiciones compuestas',
          content: 'Siempre inicialicen la variable centinela justo antes del bucle y usen aserciones o logs para verificar que la variable de paso avanza hacia la condición de parada y no causa bucles infinitos.',
          category: 'solution',
          upvotes: 4,
          is_solved: false,
          created_at: dateStr,
          updated_at: dateStr,
          user: { id: 3, name: 'Ana Estudiante', email: 'ana@sysengacademy.dev', role: 'student' },
          replies_count: 1,
          replies: [
            {
              id: 202,
              post_id: 102,
              user_id: 2,
              content: 'Excelente recomendación técnica, es la base de las invariantes de bucle en análisis de algoritmos.',
              is_solution: false,
              upvotes: 2,
              created_at: dateStr,
              updated_at: dateStr,
              user: { id: 2, name: 'Prof. Carlos Instructor', email: 'carlos@sysengacademy.dev', role: 'instructor' },
            },
          ],
        },
      ];
    }

    if (courseSlug.includes('algoritmo') || courseSlug.includes('ordenamiento')) {
      return [
        {
          id: 301,
          user_id: 3,
          course_id: 2,
          module_id: 1,
          title: '¿Cómo mitigar el peor caso O(n²) en QuickSort?',
          content: 'Cuando el arreglo ya está ordenado y elegimos el primer o último elemento como pivote, QuickSort degenera a O(n²). ¿Conviene usar la mediana de tres o un pivote aleatorio?',
          category: 'question',
          upvotes: 8,
          is_solved: true,
          created_at: dateStr,
          updated_at: dateStr,
          user: { id: 3, name: 'David Cadete', email: 'david@sysengacademy.dev', role: 'student' },
          replies_count: 1,
          replies: [
            {
              id: 401,
              post_id: 301,
              user_id: 2,
              content: 'La mediana de tres (primero, medio y último) es la estrategia estándar en arquitecturas de producción (como IntroSort en la STL de C++).',
              is_solution: true,
              upvotes: 5,
              created_at: dateStr,
              updated_at: dateStr,
              user: { id: 2, name: 'Carlos Instructor', email: 'carlos@sysengacademy.dev', role: 'instructor' },
            },
          ],
        },
      ];
    }

    // Curso general por defecto
    return [
      {
        id: 501,
        user_id: 2,
        course_id: 1,
        module_id: 1,
        title: 'Espacio de discusión y preguntas técnicas del curso',
        content: '¡Bienvenidos al foro de discusión! Comparte tus soluciones de código, dudas sobre los retos prácticos o debates de diseño técnico con tus compañeros.',
        category: 'discussion',
        upvotes: 5,
        is_solved: false,
        created_at: dateStr,
        updated_at: dateStr,
        user: { id: 2, name: 'Carlos Instructor', email: 'carlos@sysengacademy.dev', role: 'instructor' },
        replies_count: 0,
        replies: [],
      },
    ];
  }
}
