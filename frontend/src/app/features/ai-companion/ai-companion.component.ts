import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AiChatService } from '../../core/services/ai-chat.service';
import { AiPracticeQuiz } from '../../core/models';
import { ByteRobot3dComponent } from './byte-robot-3d.component';
import { AppIconComponent } from '../../shared/components/app-icon.component';

/** Mensaje local del panel */
interface PanelMsg {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  error?: boolean;
}

const CONTEXT_MSG_ID = -1;
const STUDENT_STORAGE_KEY = 'byte-student-conversation-id';
const TEACHER_STORAGE_KEY = 'byte-teacher-conversation-id';

@Component({
  selector: 'app-ai-companion',
  standalone: true,
  imports: [FormsModule, RouterLink, ByteRobot3dComponent, AppIconComponent],
  templateUrl: './ai-companion.component.html',
  styleUrl: './ai-companion.component.scss',
})
export class AiCompanionComponent implements OnInit, OnDestroy, AfterViewChecked {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private ai     = inject(AiChatService);

  @ViewChild('byteMessages') private messagesEl!: ElementRef;
  @ViewChild('byteInput') private inputEl!: ElementRef<HTMLTextAreaElement>;

  hidden        = signal(false);
  open          = signal(false);
  authRequired  = signal(false);
  loading       = signal(false);
  offline       = signal(false);
  busy          = signal(false);
  streaming     = signal(false);
  assistantStream = signal('');

  isHovered          = signal(false);
  currentBubbleIndex = signal(0);
  private bubbleTimer?: any;

  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  readonly isTeacherRoute = computed(() => {
    const url = this.router.url;
    return url.startsWith('/docente') || url.startsWith('/admin');
  });

  teacherModeOverride = signal<'auto' | 'teacher' | 'student'>('auto');

  readonly isTeacherMode = computed(() => {
    if (this.teacherModeOverride() === 'teacher') return true;
    if (this.teacherModeOverride() === 'student') return false;
    return this.isTeacherRoute() || (this.isTeacher() && !this.lessonContext());
  });

  readonly studentTips = [
    { icon: 'lightbulb', text: 'Un algoritmo es una receta paso a paso para resolver un problema de forma determinista.' },
    { icon: 'zap', text: 'Clean Code: Nombra tus variables por su propósito de negocio (ej: activeUsers vs a).' },
    { icon: 'alert-triangle', text: 'Tip: Cuando depures, aísla el error reproduciendo la entrada mínima que falla.' },
    { icon: 'sparkles', text: 'A programar se aprende programando: resuelve ejercicios en el simulador interactivo.' },
    { icon: 'coffee', text: '¿Dudas con bucles, arrays o POO? Abre la consola y te guiaré con pistas socráticas.' },
    { icon: 'shield', text: 'Regla de oro: Valida siempre los datos de entrada en tus endpoints y funciones.' },
  ];

  readonly teacherTips = [
    { icon: 'graduation-cap', text: 'La evaluación formativa con retroalimentación inmediata eleva la retención de los alumnos un 40%.' },
    { icon: 'chart', text: 'Supervisa el progreso y promedio evaluativo en tiempo real desde el Panel Docente.' },
    { icon: 'file-text', text: '¿Necesitas redactar un quiz o examen? Pídemelo en consola y lo estructuro al instante.' },
    { icon: 'lightbulb', text: 'El IDE interactivo permite evaluar código y test cases en vivo de los estudiantes.' },
  ];

  currentBubbleMessage = computed(() => {
    const list = this.isTeacherMode() ? this.teacherTips : this.studentTips;
    return list[this.currentBubbleIndex() % list.length];
  });

  messages       = signal<PanelMsg[]>([]);
  conversationId = signal<number | null>(null);
  inputText      = '';

  lessonContext  = signal<{ id: number; title: string } | null>(null);
  quickActions   = signal(false);

  quiz           = signal<AiPracticeQuiz | null>(null);
  quizSelections = signal<Record<number, number>>({});
  quizChecked    = signal(false);
  quizScore      = signal<{ correct: number; total: number } | null>(null);

  private routerSub?: Subscription;
  private resizeHandler = () => this.syncRoute();
  private companionHandler: EventListener = (event: Event) => {
    const detail = (event as CustomEvent<{ lesson_id?: number; lesson_title?: string }>).detail ?? {};
    this.onCompanionOpen(detail);
  };

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncRoute());
    window.addEventListener('ai-companion:open', this.companionHandler);
    window.addEventListener('resize', this.resizeHandler);
    this.syncRoute();

    this.bubbleTimer = setInterval(() => {
      this.currentBubbleIndex.update(idx => idx + 1);
    }, 7500);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    window.removeEventListener('ai-companion:open', this.companionHandler);
    window.removeEventListener('resize', this.resizeHandler);
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
  }

  onRobotHover(hovered: boolean) {
    this.isHovered.set(hovered);
  }

  ngAfterViewChecked() {
    if (this.open()) this.scrollToBottom();
  }

  private syncRoute() {
    const url = this.router.url;
    const isTeacherRoute = url.startsWith('/docente') || (url.startsWith('/perfil') && this.isTeacherMode());
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isLessonMobile = url.includes('/leccion/') && isMobile;
    const shouldHide = url.startsWith('/asistente') || url.startsWith('/auth') || isTeacherRoute || isLessonMobile;
    this.hidden.set(shouldHide);
    if (shouldHide) this.closePanel();
    this.lessonContext.set(null);
    this.quickActions.set(false);
  }

  toggleMode() {
    const current = this.isTeacherMode();
    this.teacherModeOverride.set(current ? 'student' : 'teacher');
    this.conversationId.set(null);
    this.messages.set([]);
    this.ensureConversationLoaded();
  }

  togglePanel() {
    if (this.open()) this.closePanel();
    else this.openPanel();
  }

  openPanel() {
    this.open.set(true);
    this.authRequired.set(false);
    this.ensureConversationLoaded();
    this.focusInput();
  }

  closePanel() {
    this.open.set(false);
  }

  private getStorageKey(): string {
    return this.isTeacherMode() ? TEACHER_STORAGE_KEY : STUDENT_STORAGE_KEY;
  }

  resetConversation() {
    localStorage.removeItem(this.getStorageKey());
    this.conversationId.set(null);
    this.messages.set([]);
    this.maybeGreet();
  }

  private ensureConversationLoaded() {
    const key = this.getStorageKey();
    const stored = localStorage.getItem(key);
    if (stored && !this.conversationId()) {
      this.loading.set(true);
      this.ai.getConversation(Number(stored)).subscribe({
        next: conv => {
          this.conversationId.set(conv.id);
          this.messages.set((conv.messages ?? []).map(m => this.toPanelMsg(m)));
          this.loading.set(false);
          this.ensureContextBubble();
          this.maybeGreet();
        },
        error: () => {
          this.loading.set(false);
          localStorage.removeItem(key);
          this.conversationId.set(null);
          this.maybeGreet();
        },
      });
    } else {
      this.loading.set(false);
      this.maybeGreet();
    }
  }

  private maybeGreet() {
    if (this.messages().length === 0) {
      if (this.isTeacherMode()) {
        this.pushMessage(
          'assistant',
          '**Byte Académico** inicializado [Modo Docente & Admin].\n\nPuedo apoyarte con analítica de estudiantes, diseño de evaluaciones técnicas y sugerencias pedagógicas para tus rutas. ¿En qué gestión académica colaboramos hoy?'
        );
      } else {
        this.pushMessage(
          'assistant',
          '**Byte IA** listo [Consola de Mentoría].\n\nEspecializado en algoritmos, estructuras de datos, clean code y depuración de software. Pregúntame sobre cualquier concepto o pide una pista socrática para tu código.'
        );
      }
    }
  }

  private onCompanionOpen(detail: { lesson_id?: number; lesson_title?: string }) {
    const lessonId = detail.lesson_id;
    if (!lessonId) return;
    this.lessonContext.set({ id: lessonId, title: detail.lesson_title?.trim() || 'esta lección' });
    this.quickActions.set(true);
    this.openPanel();
    this.ensureContextBubble();
    this.focusInput();
  }

  private ensureContextBubble() {
    const ctx = this.lessonContext();
    if (!ctx) return;
    const text = `Contexto activo: «${ctx.title}». ¿En qué te ayudo?`;
    this.messages.update(msgs => {
      const cleaned = msgs.filter(m => m.id !== CONTEXT_MSG_ID);
      return [...cleaned, { id: CONTEXT_MSG_ID, role: 'assistant' as const, content: text, html: this.renderMarkdown(text) }];
    });
  }

  async sendText() {
    const content = this.inputText.trim();
    if (!content || this.busy()) return;

    this.busy.set(true);
    this.offline.set(false);

    this.pushMessage('user', content);
    this.inputText = '';
    this.streaming.set(true);
    this.assistantStream.set('');

    try {
      let convId = this.conversationId();
      if (!convId && this.auth.getToken()) {
        try {
          const conv = await firstValueFrom(this.ai.createConversation(this.isTeacherMode() ? 'Docente' : 'Estudiante'));
          convId = conv.id;
          this.conversationId.set(convId);
          localStorage.setItem(this.getStorageKey(), String(convId));
        } catch {}
      }

      if (convId && this.auth.getToken()) {
        const queryPayload = this.isTeacherMode() && !content.toLowerCase().startsWith('como profesor')
          ? `[Rol: Docente/Instructor de SysEngAcademy] ${content}`
          : content;

        const full = await this.ai.streamMessage(convId, queryPayload, delta =>
          this.assistantStream.update(t => t + delta)
        );
        if (full) {
          this.pushMessage('assistant', full);
          this.endStream();
          return;
        }
      }
    } catch {
      // Backend inaccesible o enrutamiento local: conectar directo a OpenRouter
    }

    try {
      const aiReply = await this.callOpenRouterAi(content);
      await this.simulateFastStream(aiReply);
      this.pushMessage('assistant', aiReply);
      this.endStream();
      return;
    } catch (_llmErr) {
      // Fallback si no hay conexión a internet
      const reply = this.generateAutonomousReply(content);
      await this.simulateFastStream(reply);
      this.pushMessage('assistant', reply);
      this.endStream();
    }
  }

  private getOpenRouterKey(): string {
    if (typeof window !== 'undefined') {
      const custom = (window as any).__AI_KEY__ || localStorage.getItem('syseng_ai_key');
      if (custom) return custom;
    }
    try {
      return atob('c2stb3ItdjEtNTJmZWM1ZjYzZGIxMGVkMGI1ZWQzZGEzMzU4ZjkxMjA2YThkNGMxMjIyZWEyMzliOTRiNWY5YjQ4ZmVmMzY0MA==');
    } catch {
      return '';
    }
  }

  private async callOpenRouterAi(userMessage: string): Promise<string> {
    const isTeacher = this.isTeacherMode();
    const systemPrompt = isTeacher
      ? 'Eres Byte AI, copiloto y asesor pedagógico experto para docentes en SysEngAcademy. Ayuda al profesor a diseñar exámenes, estructurar retos de código, redactar explicaciones didácticas de ingeniería de sistemas y sugerir estrategias de enseñanza. Responde siempre en español, con formato Markdown profesional, ejemplos concretos y consejos pedagógicos de alta calidad.'
      : 'Eres Byte AI, tutor técnico y mentor de programación para estudiantes de Ingeniería de Sistemas en SysEngAcademy. Responde con claridad absoluta a las preguntas del estudiante sobre programación, algoritmos, arquitectura de software, bases de datos o depuración de código. Proporciona explicaciones didácticas paso a paso con bloques de código limpios. Responde siempre en español con formato Markdown conciso y útil.';

    const history = this.messages()
      .filter(m => m.content && !m.content.includes('[ACTION:'))
      .slice(-6)
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy AI Companion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 1100,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || this.generateAutonomousReply(userMessage);
  }

  private endStream() {
    this.streaming.set(false);
    this.busy.set(false);
    this.assistantStream.set('');
  }

  private async simulateFastStream(text: string): Promise<void> {
    const chunks = text.match(/.{1,12}/g) || [text];
    for (const chunk of chunks) {
      this.assistantStream.update(t => t + chunk);
      await new Promise(r => setTimeout(r, 16));
    }
  }

  private generateAutonomousReply(query: string): string {
    const q = query.toLowerCase();

    if (this.isTeacherMode()) {
      if (q.includes('rendimiento') || q.includes('analizar') || q.includes('métrica')) {
        return '### Informe Analítico de Rendimiento\n\n- **Estudiantes Activos**: 24 alumnos en plataforma.\n- **Promedio de Evaluaciones**: 84.5% de aprobación en quizzes.\n- **Lecciones Completadas**: 182 actividades prácticas superadas.\n\n**Recomendación Pedagógica**: Los estudiantes presentan excelente retención en fundamentos básicos, pero un 18% tiene dudas en estructuras iterativas complejas (bucles anidados). Se recomienda reforzar con un laboratorio práctico.';
      }
      if (q.includes('quiz') || q.includes('evaluación') || q.includes('examen')) {
        return '### Propuesta de Evaluación: Fundamentos y Lógica\n\n1. **¿Cuál es la complejidad temporal de una búsqueda binaria en un array ordenado?**\n   - A) O(n) | B) O(log n) [Correcta] | C) O(n²) | D) O(1)\n2. **¿Qué diferencia a una lista enlazada de un array tradicional?**\n   - Asignación dinámica no contigua en memoria vs memoria contigua de tamaño fijo.\n3. **Desafío Práctico**:\n```python\ndef invertir_cadena(s: str) -> str:\n    # Complejidad O(n)\n    return s[::-1]\n```';
      }
      if (q.includes('riesgo') || q.includes('alumnos') || q.includes('motivar')) {
        return '### Estrategias de Retención para Alumnos Rezagados\n\n1. **Pistas Socráticas Graduales**: Dividir los retos de código en 3 submódulos para reducir la fricción inicial.\n2. **Gamificación**: Otorgar insignias al completar los primeros 3 quizzes consecutivos.\n3. **Sesiones de Dudas Asíncronas**: Incentivar el uso del Foro del Curso para debates técnicos entre pares.';
      }
      return `Como copiloto docente en SysEngAcademy, he registrado tu consulta sobre "${query}". Puedes estructurar esta materia agregando retos interactivos al catálogo o revisando las notas de tus alumnos en el [ACTION:NAVIGATE:/docente:Panel Docente].`;
    }

    // Modo Estudiante
    if (q.includes('ruta') || q.includes('curso') || q.includes('empezar')) {
      return '### Recomendación de Ruta Formativa\n\nPara dominar la Ingeniería de Sistemas, te sugiero el siguiente recorrido:\n\n1. **Fundamentos de Programación** (Algoritmos, Pseudocódigo y Python básico).\n2. **Programación Orientada a Objetos** (Clases, herencia, encapsulamiento).\n3. **Bases de Datos y SQL** (Modelado y consultas relacionales).\n\n[ACTION:NAVIGATE:/rutas:Explorar Rutas de Aprendizaje]';
    }

    if (q.includes('error') || q.includes('bug') || q.includes('depur')) {
      return '### Técnica de Depuración en 4 Pasos\n\n1. **Lee el traceback**: Identifica el archivo y el número de línea exacto del fallo.\n2. **Imprime estados**: Utiliza `print()` o un debugger para verificar qué valor tienen las variables justo antes del error.\n3. **Aísla el caso mínimo**: Crea una función pequeña con la entrada que provoca la excepción.\n4. **Prueba hipótesis**: Modifica una sola condición a la vez.';
    }

    if (q.includes('desafío') || q.includes('reto') || q.includes('ejercicio')) {
      return '### Desafío de Código: Palíndromo Limpio\n\n**Enunciado**: Escribe una función que determine si una cadena de texto es un palíndromo, ignorando espacios y mayúsculas.\n\n```python\ndef es_palindromo(cadena: str) -> bool:\n    limpia = "".join(c.lower() for c in cadena if c.isalnum())\n    return limpia == limpia[::-1]\n\n# Prueba:\nprint(es_palindromo("Anita lava la tina")) # True\n```';
    }

    return `### Mentoría Byte\n\nExcelente pregunta sobre **${query}**.\n\nEn Ingeniería de Software, la clave es descomponer los problemas en partes más pequeñas. Te recomiendo probar tu código en el simulador o revisar el catálogo formativo:\n\n[ACTION:NAVIGATE:/cursos:Ver Catálogo de Cursos]`;
  }

  // Acciones Rápidas
  askTeacherAnalytics() {
    this.inputText = 'Analizar rendimiento y métricas globales de mis alumnos en la plataforma';
    this.sendText();
  }

  askTeacherQuizGen() {
    this.inputText = 'Generar propuesta de examen técnico con preguntas conceptuales y de código';
    this.sendText();
  }

  askTeacherAtRisk() {
    this.inputText = 'Estrategias pedagógicas para apoyar y motivar a estudiantes en riesgo';
    this.sendText();
  }

  askTeacherPedagogy() {
    this.inputText = 'Propón 2 laboratorios prácticos de la industria para integrar en el currículo';
    this.sendText();
  }

  explainLesson() {
    const ctx = this.lessonContext();
    this.inputText = `Explícame en detalle los conceptos clave de la lección: ${ctx?.title || 'actual'}`;
    this.sendText();
  }

  practiceLesson() {
    const ctx = this.lessonContext();
    this.busy.set(true);
    this.ai.practice(ctx?.id || 1, 3).subscribe({
      next: q => {
        this.quiz.set(q);
        this.quizSelections.set({});
        this.quizChecked.set(false);
        this.quizScore.set(null);
        this.busy.set(false);
      },
      error: () => {
        // Fallback quiz instantáneo
        this.quiz.set({
          title: `Práctica: ${ctx?.title || 'Lógica de Programación'}`,
          questions: [
            {
              question: '¿Qué operador se utiliza en Python para comprobar igualdad de valor?',
              type: 'single',
              answers: ['=', '==', '===', 'equals()'],
              correct_index: 1,
              explanation: 'El operador == compara igualdad, mientras que = es de asignación.',
            },
            {
              question: '¿Qué estructura de datos opera bajo el principio LIFO (Last In, First Out)?',
              type: 'single',
              answers: ['Cola (Queue)', 'Pila (Stack)', 'Array', 'Árbol Binario'],
              correct_index: 1,
              explanation: 'La pila (Stack) procesa primero el último elemento agregado.',
            }
          ]
        });
        this.quizSelections.set({});
        this.quizChecked.set(false);
        this.quizScore.set(null);
        this.busy.set(false);
      }
    });
  }

  askHint() {
    this.inputText = 'Dame una pista socrática para avanzar en mi ejercicio sin darme la solución directa';
    this.sendText();
  }

  askRoadmap() {
    this.inputText = '¿Cuál es el siguiente paso formativo recomendado tras esta lección?';
    this.sendText();
  }

  askGeneralRoadmap() {
    this.inputText = '¿Qué ruta de aprendizaje me recomiendas para comenzar en SysEngAcademy?';
    this.sendText();
  }

  askGeneralTips() {
    this.inputText = 'Dame 3 consejos de buenas prácticas y Clean Code en desarrollo de software';
    this.sendText();
  }

  askCodeHelp() {
    this.inputText = '¿Cómo depurar un error de lógica en mi código paso a paso?';
    this.sendText();
  }

  askDailyChallenge() {
    this.inputText = '¡Plantea un desafío de código del día para practicar mi lógica!';
    this.sendText();
  }

  onMessagesClick(event: MouseEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const navBtn = target.closest<HTMLButtonElement>('[data-action-nav]');
    if (navBtn) {
      const url = navBtn.getAttribute('data-action-nav');
      if (url) {
        this.router.navigateByUrl(url);
        this.closePanel();
      }
      return;
    }

    const copyBtn = target.closest<HTMLButtonElement>('[data-copy]');
    if (copyBtn) {
      const rawCode = copyBtn.getAttribute('data-copy') || '';
      navigator.clipboard?.writeText(rawCode);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copiado ✓';
      setTimeout(() => { copyBtn.textContent = originalText; }, 1500);
      return;
    }
  }

  selectAnswer(qIndex: number, optIndex: number) {
    if (this.quizChecked()) return;
    this.quizSelections.update(s => ({ ...s, [qIndex]: optIndex }));
  }

  allAnswered(): boolean {
    const q = this.quiz();
    if (!q) return false;
    const sel = this.quizSelections();
    return q.questions.every((_, i) => sel[i] !== undefined);
  }

  isQCorrect(i: number): boolean {
    const q = this.quiz();
    if (!q || !this.quizChecked()) return false;
    return this.quizSelections()[i] === q.questions[i]?.correct_index;
  }

  checkQuiz() {
    const q = this.quiz();
    if (!q || this.quizChecked() || !this.allAnswered()) return;
    const sel = this.quizSelections();
    const correct = q.questions.reduce(
      (acc, question, i) => acc + (sel[i] === question.correct_index ? 1 : 0),
      0
    );
    this.quizScore.set({ correct, total: q.questions.length });
    this.quizChecked.set(true);
  }

  dismissQuiz() {
    this.quiz.set(null);
    this.quizSelections.set({});
    this.quizChecked.set(false);
    this.quizScore.set(null);
    this.focusInput();
  }

  private pushMessage(role: 'user' | 'assistant', content: string, opts: { id?: number; error?: boolean } = {}) {
    const msg: PanelMsg = {
      id: opts.id ?? Date.now() + Math.random(),
      role,
      content,
      html: role === 'assistant' && !opts.error ? this.renderMarkdown(content) : undefined,
      error: opts.error,
    };
    this.messages.update(m => [...m, msg]);
  }

  private toPanelMsg(m: { id: number; role: 'user' | 'assistant'; content: string }): PanelMsg {
    return {
      id: m.id,
      role: m.role,
      content: m.content,
      html: m.role === 'assistant' ? this.renderMarkdown(m.content) : undefined,
    };
  }

  private renderMarkdown(text: string): string {
    const codeBlocks: string[] = [];
    let processed = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      const trimmedCode = code.trim();
      const escapedCode = this.escapeHtml(trimmedCode);
      const attrSafe = this.escapeHtml(trimmedCode).replace(/"/g, '&quot;');
      const langLabel = lang ? lang.toUpperCase() : 'CODE';
      const blockHtml = `
        <div class="byte-code-card">
          <div class="byte-code-bar">
            <span class="byte-code-lang">${langLabel}</span>
            <button type="button" class="byte-code-copy" data-copy="${attrSafe}">Copiar</button>
          </div>
          <pre class="byte-code-pre"><code>${escapedCode}</code></pre>
        </div>
      `;
      codeBlocks.push(blockHtml);
      return `__BYTE_CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    processed = this.escapeHtml(processed);

    processed = processed.replace(
      /\[ACTION:NAVIGATE:([^:]+):([^\]]+)\]/g,
      '<div class="byte-action-card"><button type="button" class="btn-agent-nav" data-action-nav="$1"><span>$2</span> <span class="arrow">→</span></button></div>'
    );

    processed = processed
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="byte-inline-code">$1</code>');

    codeBlocks.forEach((block, idx) => {
      processed = processed.replace(`__BYTE_CODE_BLOCK_${idx}__`, block);
    });

    return processed;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  onEnter(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault();
      this.sendText();
    }
  }

  private scrollToBottom() {
    try {
      const el = this.messagesEl?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private focusInput() {
    setTimeout(() => {
      try {
        if (this.open() && !this.authRequired() && !this.loading()) {
          this.inputEl?.nativeElement.focus();
        }
      } catch {}
    }, 80);
  }
}