import { Component, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CoursesService, isModuleFullyCompleted, isModuleUnlockedForStudent } from '../../../core/services/courses.service';
import { AuthService } from '../../../core/services/auth.service';
import { LessonContentComponent } from './lesson-content.component';
import { CourseCurriculumComponent } from './course-curriculum.component';
import { InteractiveIdeComponent } from './interactive-ide.component';
import {
  CourseModule,
  LessonDetail,
  LessonDocBlock,
  LessonQuizQuestion,
  LessonRef,
  QuizAttemptQuestionResult,
  QuizAttemptResult,
} from '../../../core/models';
import { STUDENT_MINI_AVATARS, TEACHER_MINI_AVATARS, getStoredMiniAvatar } from '../../../core/constants/ascii-avatars';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

@Component({
  selector: 'app-lesson-player',
  imports: [RouterLink, FormsModule, LessonContentComponent, CourseCurriculumComponent, InteractiveIdeComponent, AppIconComponent],
  templateUrl: './lesson-player.component.html',
  styleUrl: './lesson-player.component.scss',
})
export class LessonPlayerComponent implements OnInit, OnDestroy {
  private coursesSvc = inject(CoursesService);
  private route      = inject(ActivatedRoute);
  private router     = inject(Router);
  readonly auth      = inject(AuthService);

  // --- Estado de carga ---
  lesson    = signal<LessonDetail | null>(null);
  course    = signal<{
    id: number;
    slug: string;
    title: string;
    enrolled?: boolean;
    modules?: CourseModule[];
  } | null>(null);
  loading   = signal(true);
  forbidden = signal(false);
  error     = signal<string | null>(null);
  paramSlug = signal<string>('');

  // --- Lección ---
  completed  = signal(false);
  completing = signal(false);

  // --- Quiz ---
  quizAnswers    = signal<Record<number, number[]>>({});
  quizSubmitting = signal(false);
  quizResult     = signal<QuizAttemptResult | null>(null);

  // --- Code challenge & Interactive Practice ---
  @ViewChild('interactiveIde') ideComponent?: InteractiveIdeComponent;
  code            = signal('');
  aiReviewing     = signal(false);
  aiReply         = signal<string | null>(null);
  exerciseApprovedMethod = signal<'tests' | 'ai' | null>(null);

  // --- UI misc & Navigation Slide Bar ---
  sidebarOpen   = signal(false);
  navDrawerOpen = signal(false);
  copiedIndex   = signal<number | null>(null);

  // --- Avatar ASCII Animado ---
  readonly currentFrame = signal<number>(0);
  readonly selectedAvatarId = signal<string>('');
  private frameTimer?: any;
  private avatarListener?: () => void;

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  syncSelectedAvatar(): void {
    const isT = this.isTeacher();
    this.selectedAvatarId.set(getStoredMiniAvatar(isT));
  }

  readonly currentMiniFrame = computed(() => {
    const isT = this.isTeacher();
    const pool = isT ? TEACHER_MINI_AVATARS : STUDENT_MINI_AVATARS;
    const id = this.selectedAvatarId();
    const frames = pool[id] || (isT ? pool['professor_owl'] : pool['cyber_cat']);
    const idx = this.currentFrame() % frames.length;
    return frames[idx];
  });

  readonly initials = computed(() => {
    const name = this.auth.user()?.name ?? '';
    return name.slice(0, 2).toUpperCase() || 'SA';
  });

  logout(): void {
    this.navDrawerOpen.set(false);
    this.auth.logout();
  }

  private paramSub?: Subscription;

  // ===== Computados =====

  readonly totalLessonsCount = computed(() =>
    (this.course()?.modules ?? []).reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0)
  );

  readonly completedLessonsCount = computed(() =>
    (this.course()?.modules ?? []).reduce(
      (acc, m) => acc + (m.lessons ?? []).filter(l => l.completed).length,
      0
    )
  );

  readonly courseProgressPercent = computed(() => {
    const total = this.totalLessonsCount();
    return total > 0 ? Math.round((this.completedLessonsCount() / total) * 100) : 0;
  });

  readonly officialResources = computed(() => {
    const slug = (this.courseSlug() || '').toLowerCase();
    const lang = (this.lesson()?.language || '').toLowerCase();

    if (slug.includes('html') || slug.includes('css') || slug.includes('web') || lang === 'javascript' || lang === 'html' || lang === 'css') {
      return [
        {
          icon: 'globe',
          source: 'MDN Web Docs (Mozilla)',
          title: 'JavaScript Reference & Guía de APIs Web',
          description: 'Documentación canónica sobre sintaxis, Promesas, async/await, Fetch API y manipulación del DOM con el estándar ECMAScript.',
          url: 'https://developer.mozilla.org/es/docs/Web/JavaScript'
        },
        {
          icon: 'palette',
          source: 'MDN Web Docs',
          title: 'Guía de CSS Moderno, Flexbox y Grid',
          description: 'Aprende los modelos de maquetación estándar, selectores avanzados, variables CSS y diseño responsive accesible.',
          url: 'https://developer.mozilla.org/es/docs/Learn/CSS'
        },
        {
          icon: 'zap',
          source: 'JavaScript.info',
          title: 'El Tutorial Moderno de JavaScript',
          description: 'Explicaciones profundas desde lo básico hasta el Event Loop, microtasks vs macrotasks, closures y prototipos.',
          url: 'https://es.javascript.info/'
        },
        {
          icon: 'shield',
          source: 'W3C / Web Accessibility Initiative',
          title: 'Estándares Web y Accesibilidad WCAG',
          description: 'Pautas oficiales para construir interfaces semánticas, accesibles con teclado y lectores de pantalla.',
          url: 'https://www.w3.org/WAI/standards-guidelines/'
        }
      ];
    }

    if (slug.includes('poo') || slug.includes('python') || lang === 'python') {
      return [
        {
          icon: 'code',
          source: 'Python Software Foundation',
          title: 'Documentación Oficial de Python 3',
          description: 'Manual de referencia oficial del lenguaje Python, biblioteca estándar, estructuras de datos y buenas prácticas.',
          url: 'https://docs.python.org/es/3/'
        },
        {
          icon: 'boxes',
          source: 'Python Docs',
          title: 'Tutorial de Clases, Herencia y Métodos',
          description: 'Capítulo oficial dedicado a clases, encapsulamiento, polimorfismo, decoradores e iteradores en Python.',
          url: 'https://docs.python.org/es/3/tutorial/classes.html'
        },
        {
          icon: 'layout',
          source: 'Refactoring Guru',
          title: 'Catálogo de Patrones de Diseño',
          description: 'Guía visual completa con diagramas y código en Python de patrones creacionales, estructurales y comportamentales.',
          url: 'https://refactoring.guru/es/design-patterns'
        },
        {
          icon: 'sparkles',
          source: 'Python PEPs',
          title: 'PEP 8 — Guía de Estilo Oficial para Python',
          description: 'El estándar de convenciones adoptado universalmente en la industria de desarrollo de software con Python.',
          url: 'https://peps.python.org/pep-0008/'
        }
      ];
    }

    if (slug.includes('backend') || slug.includes('laravel') || lang === 'php') {
      return [
        {
          icon: 'settings',
          source: 'Laravel Documentation',
          title: 'Documentación Oficial de Laravel',
          description: 'Manual oficial del framework backend líder: Enrutamiento, Middleware, Controladores, Eloquent ORM y APIs REST.',
          url: 'https://laravel.com/docs'
        },
        {
          icon: 'server',
          source: 'PHP The Right Way',
          title: 'PHP The Right Way (Estándares PSR)',
          description: 'Guía comunitaria de referencia sobre buenas prácticas, inyección de dependencias y arquitectura moderna en PHP.',
          url: 'https://phptherightway.com/'
        },
        {
          icon: 'network',
          source: 'IETF / RFC 7231',
          title: 'Especificación HTTP/1.1 y Códigos de Estado',
          description: 'Definición formal de los verbos HTTP (GET, POST, PUT, DELETE), headers y códigos de respuesta en APIs.',
          url: 'https://httpwg.org/specs/rfc7231.html'
        },
        {
          icon: 'lock',
          source: 'OWASP Foundation',
          title: 'OWASP Top 10 API Security Risks',
          description: 'Estándar global sobre las vulnerabilidades de seguridad más críticas en APIs REST y cómo prevenirlas.',
          url: 'https://owasp.org/API-Security/'
        }
      ];
    }

    return [
      {
        icon: 'lightbulb',
        source: 'Harvard OpenCourseWare / CS50',
        title: 'Fundamentos de Ciencias de la Computación',
        description: 'Material de referencia gratuito sobre algoritmos, memoria, tipos de datos y resolución analítica de problemas.',
        url: 'https://cs50.harvard.edu/x/'
      },
      {
        icon: 'database',
        source: 'PostgreSQL Global Development Group',
        title: 'Manual Oficial de PostgreSQL',
        description: 'Documentación técnica completa sobre el motor de base de datos relacional estándar en la industria.',
        url: 'https://www.postgresql.org/docs/'
      },
      {
        icon: 'zap',
        source: 'SQLBolt',
        title: 'Tutoriales Interactivos de SQL',
        description: 'Ejercicios paso a paso en el navegador para dominar consultas relacionales, JOINs, agrupaciones y filtrado.',
        url: 'https://sqlbolt.com/'
      },
      {
        icon: 'compass',
        source: 'Roadmap.sh',
        title: 'Developer Roadmaps & Computer Science Guides',
        description: 'Árboles de habilidades y mapas de aprendizaje visuales recomendados por ingenieros de software senior.',
        url: 'https://roadmap.sh/'
      }
    ];
  });

  readonly courseSlug = computed(() =>
    this.lesson()?.module?.course?.slug || this.course()?.slug || this.paramSlug()
  );

  readonly courseTitle = computed(() =>
    this.lesson()?.module?.course?.title || this.course()?.title || this.paramSlug()
  );

  readonly contentBlocks = computed<LessonDocBlock[]>(() => {
    const content = this.lesson()?.content;
    if (content == null) return [];

    // Formato 1 (spec / backend actual): { type: 'doc', blocks: [...] } o { type: 'doc', text: '...' }
    if (typeof content === 'object') {
      const doc = content as Record<string, unknown>;
      if (Array.isArray(doc['blocks'])) return this.normalizeBlocks(doc['blocks'] as unknown[]);
      if (typeof doc['text'] === 'string' && doc['text'].trim()) {
        return this.parseMarkdownToBlocks(doc['text']);
      }
    }

    // Formato 2 (defensivo): string plano o markdown
    if (typeof content === 'string' && content.trim()) {
      return this.parseMarkdownToBlocks(content);
    }

    return [];
  });

  /**
   * Normaliza los bloques a la forma { type, ... } del contrato.
   * Acepta también el formato compacto del seed: ['h', text], ['p', text],
   * ['code', lang, text], ['list', items].
   */
  private normalizeBlocks(raw: unknown[]): LessonDocBlock[] {
    const out: LessonDocBlock[] = [];
    for (const entry of raw) {
      if (Array.isArray(entry)) {
        const [tag, ...rest] = entry as unknown[];
        switch (tag) {
          case 'h':
          case 'heading': {
            const [text, level] = rest as [string, number?];
            out.push({ type: 'heading', text: String(text ?? ''), level: level ?? 2 });
            break;
          }
          case 'p':
          case 'paragraph':
            out.push({ type: 'paragraph', text: String(rest[0] ?? '') });
            break;
          case 'code': {
            const [lang, text] = rest as [string, string];
            out.push({
              type: 'code',
              language: lang ? String(lang) : undefined,
              text: String(text ?? ''),
            });
            break;
          }
          case 'list':
            out.push({
              type: 'list',
              items: Array.isArray(rest[0]) ? (rest[0] as string[]) : [],
            });
            break;
          default:
            if (rest[0] != null) out.push({ type: 'paragraph', text: String(rest[0]) });
        }
      } else if (entry && typeof entry === 'object') {
        const block = entry as Partial<LessonDocBlock>;
        if (block.type) out.push(block as LessonDocBlock);
      }
    }
    return out;
  }

  private parseMarkdownToBlocks(text: string): LessonDocBlock[] {
    const blocks: LessonDocBlock[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    const parseTextChunks = (chunk: string) => {
      const paragraphs = chunk.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        if (p.startsWith('### ')) {
          blocks.push({ type: 'heading', level: 3, text: p.replace(/^###\s+/, '') });
        } else if (p.startsWith('## ')) {
          blocks.push({ type: 'heading', level: 2, text: p.replace(/^##\s+/, '') });
        } else if (p.startsWith('# ')) {
          blocks.push({ type: 'heading', level: 1, text: p.replace(/^#\s+/, '') });
        } else if (p.startsWith('> ')) {
          blocks.push({ type: 'callout', text: p.replace(/^>\s+/, '').replace(/\n>\s*/g, ' '), tone: 'info' });
        } else if (/^[-*]\s+/.test(p)) {
          const items = p.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
          blocks.push({ type: 'list', items, ordered: false });
        } else if (/^\d+\.\s+/.test(p)) {
          const items = p.split('\n').map(l => l.replace(/^\d+\.\s+/, '').trim()).filter(Boolean);
          blocks.push({ type: 'list', items, ordered: true });
        } else {
          blocks.push({ type: 'paragraph', text: p });
        }
      }
    };

    while ((match = codeBlockRegex.exec(text)) !== null) {
      const preText = text.substring(lastIndex, match.index);
      if (preText.trim()) parseTextChunks(preText);

      const lang = match[1]?.trim() || 'python';
      const code = match[2]?.trimEnd() || '';

      if (lang === 'diagram' || lang === 'diagram-json') {
        try {
          const parsed = JSON.parse(code);
          if (parsed && typeof parsed === 'object') {
            blocks.push({ type: 'diagram', ...parsed });
            lastIndex = match.index + match[0].length;
            continue;
          }
        } catch {
          // Si no es JSON válido, continua como bloque de código estándar
        }
      } else if (lang === 'diagram-svg' || lang === 'svg') {
        blocks.push({
          type: 'diagram',
          diagram_type: 'svg',
          svg_content: code,
          caption: 'Diagrama técnico explicativo',
        });
        lastIndex = match.index + match[0].length;
        continue;
      }

      blocks.push({ type: 'code', language: lang, text: code });

      lastIndex = match.index + match[0].length;
    }

    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) parseTextChunks(remainingText);

    return blocks;
  }

  readonly isCodeChallenge = computed(() => this.lesson()?.type === 'code_challenge');

  readonly hasPractice = computed(() => {
    const l = this.lesson();
    if (!l) return false;
    return (
      l.type === 'code_challenge' ||
      (typeof l.starter_code === 'string' && l.starter_code.trim().length > 0) ||
      (Array.isArray(l.test_cases) && l.test_cases.length > 0)
    );
  });

  readonly hasTestCases = computed<boolean>(() => {
    const l = this.lesson();
    return Array.isArray(l?.test_cases) && l.test_cases.length > 0;
  });

  onChallengeSolved(event: { passed: boolean; method: 'tests' | 'ai'; score?: number; message?: string }): void {
    if (!event.passed) return;
    const lesson = this.lesson();
    if (!lesson) return;
    this.exerciseApprovedMethod.set(event.method);
    const score = event.score ?? 100;
    this.markComplete(score);
  }

  readonly canComplete = computed(() => this.course()?.enrolled !== false);

  readonly totalLessons = computed(() =>
    this.course()?.modules?.reduce((n, m) => n + (m.lessons?.length ?? 0), 0) ?? 0
  );

  /** Lista plana de lecciones del curso (para prev/next) */
  private readonly flatLessons = computed<LessonRef[]>(() => {
    const modules = this.course()?.modules ?? [];
    const out: LessonRef[] = [];
    for (const mod of modules) {
      for (const l of mod.lessons ?? []) out.push({ slug: l.slug, title: l.title });
    }
    return out;
  });

  // --- Módulos y desbloqueo secuencial ---
  readonly currentModuleIndex = computed<number>(() => {
    const l = this.lesson();
    const modules = this.course()?.modules ?? [];
    if (!l || modules.length === 0) return 0;
    const idx = modules.findIndex(m => (m.lessons ?? []).some(less => less.id === l.id || less.slug === l.slug));
    return idx >= 0 ? idx : 0;
  });

  readonly currentModule = computed<CourseModule | null>(() => {
    const modules = this.course()?.modules ?? [];
    const idx = this.currentModuleIndex();
    return modules[idx] ?? null;
  });

  readonly previousModule = computed<CourseModule | null>(() => {
    const modules = this.course()?.modules ?? [];
    const idx = this.currentModuleIndex();
    return idx > 0 ? modules[idx - 1] : null;
  });

  readonly isCurrentModuleLocked = computed<boolean>(() => {
    const modules = this.course()?.modules ?? [];
    if (modules.length === 0) return false;
    const isPrivileged = this.isTeacher() || this.auth.isInstructor() || this.auth.isAdmin();
    return !isModuleUnlockedForStudent(this.currentModuleIndex(), modules, isPrivileged);
  });

  readonly isNextLessonAccessible = computed<boolean>(() => {
    const next = this.nextLesson();
    if (!next) return false;
    // Si la lección actual ya fue completada, siempre habilitar el avance a la siguiente lección
    if (this.completed()) return true;

    const modules = this.course()?.modules ?? [];
    if (modules.length === 0) return true;
    const isPrivileged = this.isTeacher() || this.auth.isInstructor() || this.auth.isAdmin();
    if (isPrivileged) return true;

    // Buscar en qué módulo se encuentra la siguiente lección
    const nextModIndex = modules.findIndex(m => (m.lessons ?? []).some(l => l.slug === next.slug));
    if (nextModIndex === -1) return true;

    return isModuleUnlockedForStudent(nextModIndex, modules, isPrivileged);
  });

  readonly nextLessonLockedReason = computed<string>(() => {
    const next = this.nextLesson();
    if (!next) return '';
    const modules = this.course()?.modules ?? [];
    const nextModIndex = modules.findIndex(m => (m.lessons ?? []).some(l => l.slug === next.slug));
    if (nextModIndex > 0) {
      const prevMod = modules[nextModIndex - 1];
      return `Completa todas las clases del Módulo ${nextModIndex} («${prevMod?.title ?? ''}») para desbloquear.`;
    }
    return 'Completa el módulo previo para continuar.';
  });

  goToActiveModuleLesson(): void {
    const modules = this.course()?.modules ?? [];
    const slug = this.courseSlug();
    if (modules.length === 0 || !slug) return;

    // Buscar el primer módulo desbloqueado que tenga alguna lección incompleta
    for (let i = 0; i < modules.length; i++) {
      const mod = modules[i];
      if (isModuleUnlockedForStudent(i, modules, false)) {
        const pending = (mod.lessons ?? []).find(l => !l.completed);
        if (pending) {
          this.router.navigate(['/cursos', slug, 'leccion', pending.slug]);
          return;
        }
      }
    }
    const firstLesson = modules[0]?.lessons?.[0];
    if (firstLesson) {
      this.router.navigate(['/cursos', slug, 'leccion', firstLesson.slug]);
    }
  }

  readonly prevLesson = computed<LessonRef | null>(() => {
    const current = this.lesson();
    if (!current) return null;
    const list = this.flatLessons();
    const idx = list.findIndex(l => l.slug === current.slug);
    if (idx > 0) return list[idx - 1];
    return current.prev_lesson ?? null;
  });

  readonly nextLesson = computed<LessonRef | null>(() => {
    const current = this.lesson();
    if (!current) return null;
    const list = this.flatLessons();
    const idx = list.findIndex(l => l.slug === current.slug);
    if (idx !== -1 && idx < list.length - 1) return list[idx + 1];
    return current.next_lesson ?? null;
  });

  triggerLockedNotice(): void {
    const reason = this.nextLessonLockedReason();
    alert(`Módulo Bloqueado: ${reason}`);
  }

  // ===== Lifecycle =====

  ngOnInit() {
    this.syncSelectedAvatar();
    if (typeof window !== 'undefined') {
      this.frameTimer = setInterval(() => {
        this.currentFrame.update(f => f + 1);
      }, 750);
      this.avatarListener = () => this.syncSelectedAvatar();
      window.addEventListener('ascii-avatar:changed', this.avatarListener);
      window.addEventListener('storage', this.avatarListener);
    }

    this.paramSub = this.route.paramMap.subscribe(params => {
      const lessonSlug = params.get('lessonSlug') ?? '';
      const courseSlug = params.get('slug') ?? '';
      this.loadLesson(lessonSlug, courseSlug);
    });
  }

  ngOnDestroy() {
    this.paramSub?.unsubscribe();
    if (this.frameTimer) clearInterval(this.frameTimer);
    if (typeof window !== 'undefined' && this.avatarListener) {
      window.removeEventListener('ascii-avatar:changed', this.avatarListener);
      window.removeEventListener('storage', this.avatarListener);
    }
  }

  // ===== Carga =====

  private loadLesson(lessonSlug: string, courseSlug: string) {
    this.paramSlug.set(courseSlug);
    this.lesson.set(null);
    this.loading.set(true);
    this.forbidden.set(false);
    this.error.set(null);
    this.completed.set(false);
    this.quizAnswers.set({});
    this.quizResult.set(null);
    this.quizSubmitting.set(false);
    this.completing.set(false);
    this.code.set('');
    this.aiReply.set(null);
    this.aiReviewing.set(false);
    this.copiedIndex.set(null);
    this.sidebarOpen.set(false);
    window.scrollTo(0, 0);

    if (courseSlug) this.loadCourse(courseSlug);

    this.coursesSvc.getLesson(lessonSlug).subscribe({
      next: detail => {
        this.lesson.set(detail);
        this.completed.set(!!detail.completed);
        this.loading.set(false);
        const firstCode = this.contentBlocks().find(b => b.type === 'code')?.text ?? '';
        this.code.set(detail.starter_code || firstCode);
        if (!this.course() && detail.module?.course?.slug) {
          this.loadCourse(detail.module.course.slug);
        }
      },
      error: (err: HttpErrorResponse) => this.handleApiError(err),
    });
  }

  private loadCourse(slug: string) {
    this.coursesSvc.getBySlug(slug).subscribe({
      next: course => this.course.set({
        id: course.id,
        slug: course.slug,
        title: course.title,
        enrolled: course.enrolled,
        modules: course.modules,
      }),
      error: () => { /* El sidebar es opcional; la lección ya está cargada */ },
    });
  }

  private handleApiError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      this.forbidden.set(true);
      this.loading.set(false);
      return;
    }
    this.error.set(
      err.status === 404
        ? 'La lección no existe o fue movida.'
        : 'Ocurrió un error inesperado. Intenta de nuevo en unos momentos.'
    );
    this.loading.set(false);
  }

  // ===== Acciones de la lección =====

  markComplete(score?: number) {
    const lesson = this.lesson();
    if (!lesson || this.completing()) return;
    this.completing.set(true);
    this.coursesSvc.completeLesson(lesson.id, score, lesson.slug, this.courseSlug()).subscribe({
      next: () => {
        this.completed.set(true);
        this.completing.set(false);
        this.markLessonCompletedInCourse(lesson.id);
        this.course.update(c => (c ? { ...c, enrolled: true } : c));
      },
      error: (err: HttpErrorResponse) => {
        this.completing.set(false);
        this.handleApiError(err);
      },
    });
  }

  private markLessonCompletedInCourse(lessonId: number) {
    this.course.update(c => {
      if (!c?.modules) return c;
      return {
        ...c,
        modules: c.modules.map(m => ({
          ...m,
          lessons: (m.lessons ?? []).map(l =>
            l.id === lessonId ? { ...l, completed: true } : l
          ),
        })),
      };
    });
  }

  askByte() {
    const lesson = this.lesson();
    if (!lesson) return;
    window.dispatchEvent(new CustomEvent('ai-companion:open', { detail: { lesson_id: lesson.id, lesson_title: lesson.title } }));
  }

  // ===== Copy =====

  copyCode(text: string, index: number) {
    const done = () => {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 1600);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  }

  // ===== Quiz =====

  isMultiple(q: LessonQuizQuestion): boolean {
    return q.type === 'multiple';
  }

  selectedIds(qid: number): number[] {
    return this.quizAnswers()[qid] ?? [];
  }

  isSelected(qid: number, aid: number): boolean {
    return this.selectedIds(qid).includes(aid);
  }

  toggleAnswer(qid: number, aid: number, multiple: boolean) {
    if (this.quizResult() || this.quizSubmitting()) return;
    this.quizAnswers.update(map => {
      const current = map[qid] ?? [];
      if (!multiple) return { ...map, [qid]: [aid] };
      const next = current.includes(aid)
        ? current.filter(x => x !== aid)
        : [...current, aid];
      return { ...map, [qid]: next };
    });
  }

  hasAnyAnswer(): boolean {
    return Object.values(this.quizAnswers()).some(arr => arr.length > 0);
  }

  resultFor(qid: number): QuizAttemptQuestionResult | null {
    return this.quizResult()?.results.find(r => r.question_id === qid) ?? null;
  }

  isCorrectAnswer(qid: number, aid: number): boolean {
    const res = this.resultFor(qid);
    return !!res && res.correct_answer_ids.includes(aid);
  }

  isWrongAnswer(qid: number, aid: number): boolean {
    const res = this.resultFor(qid);
    return !!res && res.selected_ids.includes(aid) && !res.correct_answer_ids.includes(aid);
  }

  correctAnswersText(q: LessonQuizQuestion, res: QuizAttemptQuestionResult): string {
    return q.answers
      .filter(a => res.correct_answer_ids.includes(a.id))
      .map(a => a.answer_text || a.answer || '')
      .join(', ');
  }

  submitQuiz() {
    const lesson = this.lesson();
    if (!lesson || !lesson.quiz || lesson.quiz.questions.length === 0 || this.quizSubmitting()) return;

    const answers: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(this.quizAnswers())) {
      answers[k] = v;
    }

    this.quizSubmitting.set(true);
    this.coursesSvc.submitQuizAttempt(lesson.slug, answers).subscribe({
      next: result => {
        this.quizResult.set(result);
        this.quizSubmitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.quizSubmitting.set(false);
        this.handleApiError(err);
      },
    });
  }

  scoreTitle(score: number): string {
    if (score === 100) return '¡Perfecto!';
    if (score >= 80) return '¡Excelente trabajo!';
    if (score >= 60) return '¡Bien hecho!';
    if (score >= 40) return 'Vas por buen camino';
    return 'Sigue practicando';
  }

  scoreMessage(score: number): string {
    if (score === 100) return 'Dominas este tema por completo.';
    if (score >= 80) return 'Tienes un dominio sólido del tema.';
    if (score >= 60) return 'Tienes una buena base; revisa las explicaciones para afianzar.';
    if (score >= 40) return 'Repasa el contenido y vuelve a intentarlo.';
    return 'El aprendizaje es un proceso: relee la lección y reintenta cuando estés listo.';
  }

  // ===== Code challenge =====

  evaluateCode() {
    const lesson = this.lesson();
    if (!lesson || this.aiReviewing()) return;
    this.aiReviewing.set(true);
    this.aiReply.set(null);
    this.coursesSvc.askAi(lesson.id, this.code()).subscribe({
      next: res => {
        this.aiReply.set(res.reply);
        this.aiReviewing.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.aiReviewing.set(false);
        this.handleApiError(err);
      },
    });
  }

  /** Markdown-lite: **negrita**, `código` y saltos de línea (con escape previo de HTML). */
  renderAiReply(text: string): string {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    return esc
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // ===== Helpers =====

  typeLabel(type: string): string {
    return {
      video: 'Video',
      article: 'Artículo',
      quiz: 'Quiz',
      code_challenge: 'Desafío de código',
    }[type] ?? 'Lección';
  }

  lessonIcon(type: string): string {
    return { video: 'video', article: 'file-text', quiz: 'help-circle', code_challenge: 'code' }[type] ?? 'book';
  }
}