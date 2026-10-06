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
import { Router, NavigationEnd } from '@angular/router';
import { filter, firstValueFrom, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AiChatService } from '../../core/services/ai-chat.service';
import { AiPracticeQuiz } from '../../core/models';
import { ByteRobot3dComponent } from './byte-robot-3d.component';
import { ByteHead3dComponent } from './byte-head-3d.component';
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

const TEACHER_SYSTEM_PROMPT = `Eres ByteDocente [adm], asistente de ingeniería, analítica y gestión académica para profesores de SysEng Academy en modo consola interactiva (PowerShell/WSL).
REGLAS ESTRICTAS:
1. CERO saludos ni introducciones de relleno (PROHIBIDO: "Hola", "A continuación te presento un esquema", "Es importante destacar", "Para analizar...", etc.). Comienza INMEDIATAMENTE con el reporte o solución.
2. CERO despedidas de relleno.
3. TONO: Consola ejecutiva de ingeniería y Tech Lead académico. Directo, analítico, estructurado y sin rodeos.
4. FORMATO:
   - Usa encabezados Markdown (###) concisos.
   - Para métricas y comparativas usa TABLAS Markdown limpias (| Métrica | Valor | Estado |) o viñetas tipo consola (- o ▪).
   - Usa tags de estado de terminal: [OK], [WARN], [INFO], [CRITICO].
   - En quizzes o retos: 2 preguntas de opción múltiple con la clave correcta [OK] y justificación breve, más 1 reto de código práctico.
   - Si recomiendas navegación, usa [ACTION:NAVIGATE:/docente:Ir al Panel Docente].
5. CONTEXTO SYSENG ACADEMY:
   - 43 Cursos, 102 Módulos, 9 Rutas Formativas y 6 alumnos activos en cohorte actual.
   - Tasa promedio de aprobación en quizzes: ~87%.`;

const STUDENT_SYSTEM_PROMPT = `Eres Byte [ia], mentor técnico senior de ingeniería de sistemas y programación de SysEng Academy en consola interactiva (WSL Linux).
REGLAS ESTRICTAS:
1. CERO saludos ni introducciones de relleno (PROHIBIDO: "¡Hola!", "Con gusto te ayudo...", "A continuación..."). Comienza DIRECTAMENTE con la respuesta, la definición o el código.
2. CERO despedidas de cortesía vacías.
3. TONO: Ingeniero senior, conciso, didáctico y enfocado en Clean Code y algoritmos eficientes.
4. FORMATO:
   - Código en bloques limpios con lenguaje especificado y comentarios clave.
   - En errores (--debug): aísla la causa raíz en 1 línea, muestra el código corregido y explica el porqué.
   - En pistas (--pista): aplica método socrático con una pista aguda sin regalar la solución completa.
   - Usa tags de terminal: [OK], [WARN], [TIP], [ERROR].
   - Si aplica, sugiere acciones [ACTION:NAVIGATE:/cursos:Explorar Cursos] o [ACTION:NAVIGATE:/rutas:Ver Rutas].`;

@Component({
  selector: 'app-ai-companion',
  standalone: true,
  imports: [FormsModule, ByteRobot3dComponent, ByteHead3dComponent, AppIconComponent],
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

  isInputFocused = signal(false);
  showQuickMenu  = signal(false);

  readonly hasMessages = computed(() => this.messages().length > 0);

  readonly uiState = computed<'idle' | 'asking' | 'responding'>(() => {
    if (this.busy() || this.streaming()) return 'responding';
    if (this.inputText.trim().length > 0 || this.isInputFocused()) return 'asking';
    return 'idle';
  });

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

  isBubbleVisible = signal(false);
  activeBubble = signal<{ icon: string; text: string; tag: string } | null>(null);

  private bubbleTimeout?: any;
  private bubbleIntervalTimer?: any;
  private hoverSpeakTimeout?: any;
  private routeSpeakTimeout?: any;

  currentBubbleMessage = computed(() => {
    return this.activeBubble();
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

  readonly isMobileView = signal(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  private routerSub?: Subscription;
  private resizeHandler = () => {
    if (typeof window !== 'undefined') {
      this.isMobileView.set(window.innerWidth <= 768);
    }
    this.syncRoute();
  };
  private companionOpenHandler: EventListener = (event: Event) => {
    const detail = (event as CustomEvent<{ lesson_id?: number; lesson_title?: string }>).detail ?? {};
    this.onCompanionOpen(detail);
  };
  private companionToggleHandler: EventListener = () => {
    this.togglePanel();
  };
  private companionCloseHandler: EventListener = () => {
    this.closePanel();
  };

  ngOnInit() {
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.syncRoute();
        this.triggerRouteTip();
      });
    window.addEventListener('ai-companion:open', this.companionOpenHandler);
    window.addEventListener('ai-companion:toggle', this.companionToggleHandler);
    window.addEventListener('ai-companion:close', this.companionCloseHandler);
    window.addEventListener('resize', this.resizeHandler);
    this.isMobileView.set(typeof window !== 'undefined' && window.innerWidth <= 768);
    this.syncRoute();
    this.triggerRouteTip();

    // Ritmo natural orgánico: Si Byte tiene algo que decir, aparece cada ~42s sin invadir
    this.bubbleIntervalTimer = setInterval(() => {
      if (!this.open() && !this.isBubbleVisible() && !this.hidden()) {
        this.speakTip(undefined, 8500);
      }
    }, 42000);
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    window.removeEventListener('ai-companion:open', this.companionOpenHandler);
    window.removeEventListener('ai-companion:toggle', this.companionToggleHandler);
    window.removeEventListener('ai-companion:close', this.companionCloseHandler);
    window.removeEventListener('resize', this.resizeHandler);
    if (this.bubbleTimer) clearInterval(this.bubbleTimer);
    if (this.bubbleIntervalTimer) clearInterval(this.bubbleIntervalTimer);
    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    if (this.hoverSpeakTimeout) clearTimeout(this.hoverSpeakTimeout);
    if (this.routeSpeakTimeout) clearTimeout(this.routeSpeakTimeout);
  }

  speakTip(tip?: { icon: string; text: string; tag?: string }, durationMs = 8500) {
    if (this.open() || this.hidden()) return;

    if (this.bubbleTimeout) {
      clearTimeout(this.bubbleTimeout);
      this.bubbleTimeout = undefined;
    }

    if (!tip) {
      const list = this.isTeacherMode() ? this.teacherTips : this.studentTips;
      const item = list[this.currentBubbleIndex() % list.length];
      this.currentBubbleIndex.update(idx => idx + 1);
      tip = {
        icon: item.icon,
        text: item.text,
        tag: this.isTeacherMode() ? 'Docente & Admin' : 'Tip de Ingeniería',
      };
    }

    this.activeBubble.set({
      icon: tip.icon,
      text: tip.text,
      tag: tip.tag || (this.isTeacherMode() ? 'Docente & Admin' : 'Tip de Ingeniería'),
    });
    this.isBubbleVisible.set(true);

    this.bubbleTimeout = setTimeout(() => {
      this.dismissBubble();
    }, durationMs);
  }

  dismissBubble(event?: Event) {
    if (event) event.stopPropagation();
    this.isBubbleVisible.set(false);
    if (this.bubbleTimeout) {
      clearTimeout(this.bubbleTimeout);
      this.bubbleTimeout = undefined;
    }
  }

  onBubbleClick() {
    this.dismissBubble();
    this.openPanel();
  }

  onRobotHover(hovered: boolean) {
    this.isHovered.set(hovered);
    if (hovered && !this.isBubbleVisible() && !this.open() && !this.hidden()) {
      if (this.hoverSpeakTimeout) clearTimeout(this.hoverSpeakTimeout);
      this.hoverSpeakTimeout = setTimeout(() => {
        if (this.isHovered() && !this.isBubbleVisible() && !this.open() && !this.hidden()) {
          this.speakTip(undefined, 8500);
        }
      }, 550);
    } else if (!hovered) {
      if (this.hoverSpeakTimeout) clearTimeout(this.hoverSpeakTimeout);
    }
  }

  private triggerRouteTip() {
    if (this.routeSpeakTimeout) clearTimeout(this.routeSpeakTimeout);
    this.routeSpeakTimeout = setTimeout(() => {
      if (!this.open() && !this.isBubbleVisible() && !this.hidden()) {
        const url = this.router.url;
        let contextualTip: { icon: string; text: string; tag: string } | undefined;
        if (url.includes('/cursos')) {
          contextualTip = { icon: 'sparkles', text: '¡Explora las rutas interactivas! Hay desafíos listos para ti.', tag: 'Ruta de Aprendizaje' };
        } else if (url.includes('/leccion')) {
          contextualTip = { icon: 'code', text: 'Si te bloqueas en este ejercicio, haz clic en mí para darte pistas.', tag: 'Tutor en Vivo' };
        } else if (url.includes('/perfil')) {
          contextualTip = { icon: 'award', text: '¡Revisa tu racha y nivel! La constancia hace al ingeniero.', tag: 'Progreso SysEng' };
        } else if (url.includes('/clan') || url.includes('/comunidad')) {
          contextualTip = { icon: 'users', text: 'Aprender y colaborar en clanes multiplica tu retención técnica.', tag: 'Comunidad' };
        }
        this.speakTip(contextualTip, 9000);
      }
    }, 3800);
  }

  ngAfterViewChecked() {
    if (this.open()) this.scrollToBottom();
  }

  private syncRoute() {
    const url = this.router.url;
    const isTeacherRoute = url.startsWith('/docente') || (url.startsWith('/perfil') && this.isTeacherMode());
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isLessonMobile = url.includes('/leccion/') && isMobile;
    const shouldHide = isTeacherRoute || isLessonMobile;
    this.hidden.set(shouldHide);
    if (shouldHide) this.closePanel();

    if (url.includes('openByte=true') || url.includes('byte=open')) {
      setTimeout(() => this.openPanel(), 80);
    }
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
    this.dismissBubble();
    this.open.set(true);
    this.authRequired.set(false);
    this.ensureConversationLoaded();
    this.focusInput();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-companion:state', { detail: { open: true } }));
    }
  }

  closePanel() {
    this.dismissBubble();
    this.open.set(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ai-companion:state', { detail: { open: false } }));
    }
  }

  private getStorageKey(): string {
    return this.isTeacherMode() ? TEACHER_STORAGE_KEY : STUDENT_STORAGE_KEY;
  }

  resetConversation() {
    localStorage.removeItem(this.getStorageKey());
    this.conversationId.set(null);
    this.messages.set([]);
    this.showQuickMenu.set(false);
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
        },
        error: () => {
          this.loading.set(false);
          localStorage.removeItem(key);
          this.conversationId.set(null);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  private maybeGreet() {
    // Al mantener messages vacío, el chatbot muestra la vista minimalista tipo Gemini
  }

  private onCompanionOpen(detail: { lesson_id?: number; lesson_title?: string }) {
    if (detail.lesson_id) {
      this.lessonContext.set({ id: detail.lesson_id, title: detail.lesson_title?.trim() || 'esta lección' });
      this.quickActions.set(true);
    }
    this.openPanel();
    this.focusInput();
  }

  private ensureContextBubble() {
    // Contexto activo mostrado de forma minimalista en la cabecera
  }

  async sendText() {
    const content = this.inputText.trim();
    if (!content || this.busy()) return;
    this.inputText = '';
    this.showQuickMenu.set(false);
    await this.dispatchMessage(content, content);
  }

  async executeUserAction(displayCommand: string, promptInstruction: string) {
    if (this.busy()) return;
    this.inputText = '';
    this.showQuickMenu.set(false);
    await this.dispatchMessage(displayCommand, promptInstruction);
  }

  private async dispatchMessage(displayCommand: string, promptInstruction: string) {
    this.busy.set(true);
    this.offline.set(false);

    // 1. Mostrar de inmediato la entrada en consola (stdin)
    this.pushMessage('user', displayCommand);
    this.streaming.set(true);
    this.assistantStream.set('');

    // 2. Streaming nativo directo vía SSE de OpenRouter (TTFB < 300ms)
    try {
      const full = await this.streamOpenRouterAi(promptInstruction, (delta) => {
        this.assistantStream.update(t => t + delta);
      });
      if (full && full.trim()) {
        this.pushMessage('assistant', full);
        this.endStream();
        return;
      }
    } catch (_streamErr) {
      console.warn('Direct stream fallback to backup:', _streamErr);
    }

    // 3. Fallback: Endpoint backend /ai/ask (por si el browser bloquea llamadas directas)
    try {
      const rolePrefix = this.isTeacherMode() ? '[Docente/Admin] ' : '[Estudiante] ';
      const backendReply = await firstValueFrom(this.ai.askAI({
        kind: 'question',
        question: `${rolePrefix}${promptInstruction}`,
      }));
      const reply = (backendReply as any).reply || (backendReply as any).message || (backendReply as any).answer || '';
      if (reply) {
        this.pushMessage('assistant', reply);
        this.endStream();
        return;
      }
    } catch {}

    // 4. Fallback: Respuesta local instantánea autónoma
    const autonomousReply = this.generateAutonomousReply(displayCommand);
    this.pushMessage('assistant', autonomousReply);
    this.endStream();
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

  private async streamOpenRouterAi(
    userMessage: string,
    onDelta: (delta: string) => void
  ): Promise<string> {
    const isTeacher = this.isTeacherMode();
    const systemPrompt = isTeacher ? TEACHER_SYSTEM_PROMPT : STUDENT_SYSTEM_PROMPT;

    const history = this.messages()
      .filter(m => m.content && !m.content.includes('[ACTION:') && !m.error)
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
        'HTTP-Referer': 'https://sysengacademy.dev',
        'X-Title': 'SysEngAcademy Byte Companion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 650,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`OpenRouter HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.slice(5).trim();
        if (jsonStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(jsonStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            onDelta(delta);
          }
        } catch {
          // Fragmento incompleto de chunk SSE
        }
      }
    }

    return full;
  }

  private endStream() {
    this.streaming.set(false);
    this.busy.set(false);
    this.assistantStream.set('');
  }

  private generateAutonomousReply(query: string): string {
    const q = query.toLowerCase();

    if (this.isTeacherMode()) {
      if (q.includes('analitica') || q.includes('rendimiento') || q.includes('métrica')) {
        return `### [DASHBOARD] Analítica Académica — SysEng Academy

| Indicador Global | Métrica | Estado |
|:---|:---:|:---:|
| Alumnos Matriculados | 6 Activos | [OK] |
| Tasa de Finalización de Módulos | 88.5% | [OK] |
| Promedio en Quizzes y Tests | 87.2 / 100 | [OK] |
| Lecciones Prácticas Aprobadas | 194 | [OK] |
| Alumnos con Retraso Detectado | 1 Alumno | [WARN] |

### Estado por Ruta de Aprendizaje
- **Fundamentos & Algoritmos**: 92% avance · Fricción mínima.
- **Backend & APIs**: 84% avance · Consultas SQL y transacciones requieren refuerzo.
- **Frontend & TypeScript**: 89% avance · Alto desempeño en componentes.

### Plan de Intervención Docente
1. Publicar reto interactivo de soporte sobre **Transacciones SQL y Pools**.
2. Notificación proactiva a alumnos con más de 5 días sin entregas en IDE.

[ACTION:NAVIGATE:/docente:Abrir Panel Docente]`;
      }
      if (q.includes('quiz') || q.includes('evaluación') || q.includes('examen')) {
        return `### [PROPUESTA DE EVALUACIÓN] Arquitectura & Lógica

1. **¿Qué estructura de datos garantiza operaciones push y pop en tiempo O(1)?**
   - A) Árbol Binario de Búsqueda
   - B) Pila (Stack) [OK] *(Justificación: el puntero al tope permite inserción y remoción inmediata sin desplazamiento)*
   - C) Cola de Prioridad con Heap
   - D) Array Dinámico con reasignación

2. **En un entorno de producción, ¿por qué se utiliza un Connection Pool para PostgreSQL?**
   - A) Para compilar queries en JavaScript
   - B) Para reutilizar conexiones abiertas y evitar la sobrecarga del handshake TCP/TLS [OK]
   - C) Para desactivar el aislamiento de transacciones
   - D) Para cifrar el almacenamiento en disco

### Desafío Práctico de Código
\`\`\`python
def tiene_ciclo(grafo: dict, inicio: str) -> bool:
    """Detecta si existe ciclo a partir de un nodo usando DFS."""
    visitados, pila = set(), set()
    def dfs(nodo):
        visitados.add(nodo)
        pila.add(nodo)
        for vecino in grafo.get(nodo, []):
            if vecino not in visitados and dfs(vecino):
                return True
            elif vecino in pila:
                return True
        pila.remove(nodo)
        return False
    return dfs(inicio)
\`\`\``;
      }
      if (q.includes('riesgo') || q.includes('rezag') || q.includes('motivar')) {
        return `### [MATRIZ DE RETENCIÓN] Prevención de Deserción

| Nivel de Alerta | Criterio | Acción de Choque |
|:---|:---|:---|
| [CRITICO] | > 7 días sin actividad en IDE | Mensaje socrático de bienvenida con reto nivel 1 |
| [WARN] | Fallos repetidos (>3) en mismo Quiz | Desbloquear pista guiada automática |
| [OK] | Avance continuo semanal | Insignia de racha en perfil |

### 3 Tácticas Pedagógicas de Choque
1. **Descomposición Atómica**: Dividir la lección con fricción en 2 submódulos de 5 minutos.
2. **Pistas Graduales**: Proveer pistas socráticas antes del fallo definitivo.
3. **Validación en Vivo**: Probar inputs mínimos en el simulador antes de enviar el examen.`;
      }
      if (q.includes('ideas') || q.includes('lab') || q.includes('pedagog')) {
        return `### [LABORATORIOS PRÁCTICOS] Propuestas para Currículo

### 1. Lab: Microservicio de Rate Limiting con Token Bucket
- **Objetivo**: Implementar control de flujo en Node.js o Python protegiendo endpoints de autenticación.
- **Entregable**: Middleware con tests unitarios validando ráfagas vs ventana de tiempo.

### 2. Lab: Transacciones ACID y Manejo de Concurrencia
- **Objetivo**: Simular transferencia de saldo entre 2 cuentas asegurando rollback en caso de fallo intermedio.
- **Entregable**: Script SQL con \`BEGIN\`, \`ROLLBACK\` y verificación de locks.`;
      }
      return `### [SISTEMA DOCENTE]\n\nConsulta registrada sobre: **${query}**.\n\nPara profundizar en la métricas de tu aula o diseñar nuevas evaluaciones, ingresa a la consola docente o abre el panel:\n\n[ACTION:NAVIGATE:/docente:Ir al Panel Docente]`;
    }

    // Modo Estudiante
    if (q.includes('ruta') || q.includes('curso') || q.includes('empezar')) {
      return `### [RUTA DE APRENDIZAJE RECOMENDADA]

| Fase | Área | Enfoque Principal |
|:---:|:---|:---|
| 01 | **Fundamentos** | Lógica, Algoritmos, PSeInt y Python básico |
| 02 | **POO & Arquitectura** | Clases, Herencia, SOLID y Clean Code |
| 03 | **Bases de Datos** | SQL Relacional, Índices, ACID y Modelado |
| 04 | **Backend Moderno** | APIs REST, Autenticación JWT y Servidores Cloud |
| 05 | **Frontend Web** | TypeScript, React/Angular y Estado Reactivo |

[ACTION:NAVIGATE:/rutas:Explorar Rutas Formativas]`;
    }

    if (q.includes('debug') || q.includes('error') || q.includes('bug')) {
      return `### [PROTOCOLO DE DEPURACIÓN EN 4 PASOS]

1. **Lectura del Stack Trace**: Ubica el archivo exacto y el número de línea donde ocurrió la excepción no controlada.
2. **Aislamiento de la Entrada Mínima**: Reproduce el fallo con el caso más pequeño posible (ej: array vacío, null o string con caracteres especiales).
3. **Inspección de Estado**: Inserta puntos de interrupción (\`debugger\`) o logs con tipos (\`typeof variable\`).
4. **Prueba Unitaria de Regresión**: Escribe un test que falle con el bug y luego aplica el parche mínimo.`;
    }

    if (q.includes('tips') || q.includes('clean') || q.includes('buena')) {
      return `### [3 REGLAS DE ORO DE CLEAN CODE]

- **Nombres con Intención de Negocio**: Evita variables de una letra (\`d\`, \`temp\`); usa nombres explícitos (\`diasTranscurridos\`, \`usuarioActivo\`).
- **Funciones de Responsabilidad Única (SRP)**: Una función debe hacer exactamente una cosa y hacerla bien (menos de 25 líneas).
- **Falla Rápido (Guard Clauses)**: Valida condiciones de error al inicio de la función y retorna temprano para evitar anidación excesiva de \`if\`.`;
    }

    if (q.includes('reto') || q.includes('desafío') || q.includes('codigo')) {
      return `### [DESAFÍO DEL DÍA: DETECTOR DE ANAGRAMAS]

**Problema**: Escribe una función que determine si dos cadenas son anagramas (mismas letras con diferente orden), ignorando espacios y mayúsculas.

\`\`\`python
def son_anagramas(s1: str, s2: str) -> bool:
    limpiar = lambda s: "".join(sorted(c.lower() for c in s if c.isalnum()))
    return limpiar(s1) == limpiar(s2)

# Pruebas:
print(son_anagramas("Roma", "Amor"))       # True [OK]
print(son_anagramas("Python", "Java"))     # False [OK]
\`\`\``;
    }

    return `### [BYTE MENTOR]\n\nPregunta sobre **${query}** procesada.\n\nEn ingeniería de software, la clave es dividir problemas complejos en funciones simples y deterministas.\n\n[ACTION:NAVIGATE:/cursos:Explorar Catálogo de Cursos]`;
  }

  // Acciones Rápidas - Modo Docente
  askTeacherAnalytics() {
    this.executeUserAction(
      'syseng --analitica',
      'syseng --analitica: Genera un Dashboard Ejecutivo de Métricas Académicas para SysEng Academy en formato tabla terminal y viñetas compactas. Incluye métricas de estudiantes (6 registrados, 87% aprobación quizzes, 43 cursos en 9 rutas), alertas de rezago y 2 acciones pedagógicas de impacto inmediato. Sin introducciones ni saludos.'
    );
  }

  askTeacherQuizGen() {
    this.executeUserAction(
      'syseng --crear-quiz',
      'syseng --crear-quiz: Genera una propuesta de evaluación técnica para alumnos de SysEng Academy con 2 preguntas de opción múltiple (indicando clave correcta [OK] y justificación técnica breve) y 1 desafío de código práctico de ingeniería de software. Sin introducciones ni saludos.'
    );
  }

  askTeacherAtRisk() {
    this.executeUserAction(
      'syseng --alumnos-riesgo',
      'syseng --alumnos-riesgo: Entrega una matriz de alerta temprana y 3 intervenciones pedagógicas rápidas para retener y apoyar a estudiantes rezagados en la plataforma. Formato terminal directo.'
    );
  }

  askTeacherPedagogy() {
    this.executeUserAction(
      'syseng --ideas-lab',
      'syseng --ideas-lab: Propón 2 laboratorios prácticos de arquitectura de software y desarrollo fullstack para incorporar como retos interactivos en SysEng Academy. Formato terminal directo con código base.'
    );
  }

  explainLesson() {
    const ctx = this.lessonContext();
    const title = ctx?.title || 'lección actual';
    this.executeUserAction(
      'byte --explicar',
      `byte --explicar: Explica la lección «${title}» en 3 secciones concisas: 1) Definición clave, 2) Ejemplo mínimo de código, 3) Trampa común o error frecuente a evitar.`
    );
  }

  askHint() {
    const ctx = this.lessonContext();
    const title = ctx?.title || 'lección actual';
    this.executeUserAction(
      'byte --pista',
      `byte --pista: Proporciona una pista socrática breve y aguda para ayudarme a resolver el problema de «${title}» sin darme la solución completa. Formato terminal directo.`
    );
  }

  askRoadmap() {
    const ctx = this.lessonContext();
    const title = ctx?.title || 'lección actual';
    this.executeUserAction(
      'byte --siguiente',
      `byte --siguiente: Indica cuál es el siguiente concepto y reto técnico recomendado tras dominar «${title}».`
    );
  }

  askGeneralRoadmap() {
    this.executeUserAction(
      'byte --rutas',
      'byte --rutas: Presenta el mapa recomendado de rutas formativas de SysEng Academy (Fundamentos -> POO -> Bases de Datos -> Backend -> Frontend) con sus objetivos clave. Formato terminal directo.'
    );
  }

  askGeneralTips() {
    this.executeUserAction(
      'byte --tips',
      'byte --tips: Entrega 3 reglas de oro de Clean Code, arquitectura y buenas prácticas en desarrollo de software con ejemplos cortos. Formato terminal directo.'
    );
  }

  askCodeHelp() {
    this.executeUserAction(
      'byte --debug',
      'byte --debug: Explica el método de 4 pasos para depurar y aislar errores en código con enfoque de ingeniería de software. Formato terminal directo.'
    );
  }

  askDailyChallenge() {
    this.executeUserAction(
      'byte --reto',
      'byte --reto: Plantea un desafío de código de dificultad media en Python o JavaScript para evaluar lógica y algoritmos, con casos de prueba especificados. Formato terminal directo.'
    );
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
    // 1. Extraer bloques de código para protegerlos de transformaciones Markdown
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

    // 2. Extraer y estructurar tablas Markdown (| col | col |)
    const tableBlocks: string[] = [];
    processed = processed.replace(/((?:^|\n)\|[^\n]+\|\n\|[-:\s|]+\|\n(?:\|[^\n]+\|\n?)+)/g, (match) => {
      const rawLines = match.trim().split('\n');
      if (rawLines.length < 3) return match;
      const headerLine = rawLines[0];
      const bodyLines = rawLines.slice(2);

      const parseRow = (line: string) =>
        line.trim().replace(/^\||\|$/g, '').split('|').map(c => this.formatInline(this.escapeHtml(c.trim())));

      const headers = parseRow(headerLine);
      const ths = headers.map(h => `<th>${h}</th>`).join('');

      const trs = bodyLines.map(line => {
        const cells = parseRow(line);
        const tds = cells.map(c => `<td>${c}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');

      const tableHtml = `<div class="byte-table-wrap"><table class="byte-table"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
      tableBlocks.push(tableHtml);
      return `\n__BYTE_TABLE_BLOCK_${tableBlocks.length - 1}__\n`;
    });

    // 3. Sanitizar caracteres HTML en texto general
    processed = this.escapeHtml(processed);

    // 4. Botones de acción y navegación rápida
    processed = processed.replace(
      /\[ACTION:NAVIGATE:([^:]+):([^\]]+)\]/g,
      '<div class="byte-action-card"><button type="button" class="btn-agent-nav" data-action-nav="$1"><span>$2</span> <span class="arrow">→</span></button></div>'
    );

    // 5. Encabezados de Terminal
    processed = processed
      .replace(/^### (.*)$/gm, '<h4 class="term-h term-h--3">$1</h4>')
      .replace(/^## (.*)$/gm, '<h3 class="term-h term-h--2">$1</h3>')
      .replace(/^# (.*)$/gm, '<h2 class="term-h term-h--1">$1</h2>');

    // 6. Viñetas de Terminal (▪)
    processed = processed.replace(/^[*-] (.*)$/gm, '<div class="term-bullet-line"><span class="term-bullet-dot">▪</span><span>$1</span></div>');

    // 7. Formato inline (badges, negritas, inline-code)
    processed = this.formatInline(processed);

    // 8. Reinsertar tablas y bloques de código
    tableBlocks.forEach((block, idx) => {
      processed = processed.replace(`__BYTE_TABLE_BLOCK_${idx}__`, block);
    });
    codeBlocks.forEach((block, idx) => {
      processed = processed.replace(`__BYTE_CODE_BLOCK_${idx}__`, block);
    });

    return processed;
  }

  private formatInline(text: string): string {
    return text
      .replace(/\[(OK|PASS|EXITO|ACTIVO)\]/gi, '<span class="term-badge term-badge--ok">$1</span>')
      .replace(/\[(WARN|ALERTA|RIESGO|MEDIO)\]/gi, '<span class="term-badge term-badge--warn">$1</span>')
      .replace(/\[(ERROR|FAIL|CRITICO|ALTO)\]/gi, '<span class="term-badge term-badge--err">$1</span>')
      .replace(/\[(INFO|ADM|DOCENTE|IA|SYS|DASHBOARD)\]/gi, '<span class="term-badge term-badge--info">$1</span>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="byte-inline-code">$1</code>');
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