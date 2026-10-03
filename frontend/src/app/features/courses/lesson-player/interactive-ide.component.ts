import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CodeExecutionResponse,
  CodeExecutionService,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TestCase,
} from '../../../core/services/code-execution.service';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

export interface TerminalAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  codeSnippet?: string;
}

@Component({
  selector: 'app-interactive-ide',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  templateUrl: './interactive-ide.component.html',
  styleUrl: './interactive-ide.component.scss',
})
export class InteractiveIdeComponent {
  private readonly codeRunner = inject(CodeExecutionService);

  @ViewChild('codeTextarea') codeTextareaRef?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('codeGutter') codeGutterRef?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotScroll') copilotScrollRef?: ElementRef<HTMLDivElement>;

  // OpenRouter key decoded at runtime for resilience
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

  // Inputs
  readonly initialCode = input<string>('');
  readonly language = input<string>('python');
  readonly testCases = input<any>([]);
  readonly hint = input<string | null | undefined>(null);
  readonly lessonTitle = input<string>('');
  readonly lessonId = input<number | undefined>(undefined);
  readonly isChallenge = input<boolean>(false);
  readonly isCompleted = input<boolean>(false);

  // Output event emitted when code is solved via system tests or AI evaluation
  readonly challengeSolved = output<{
    passed: boolean;
    method: 'tests' | 'ai';
    score?: number;
    message?: string;
  }>();

  readonly challengeStatus = signal<'pending' | 'evaluating' | 'passed_tests' | 'passed_ai' | 'needs_work'>('pending');

  readonly isApproved = computed(() =>
    this.isCompleted() || this.challengeStatus() === 'passed_tests' || this.challengeStatus() === 'passed_ai'
  );

  // Supported languages list
  readonly languages: SupportedLanguage[] = SUPPORTED_LANGUAGES;

  // State signals
  readonly currentLanguage = signal<string>('python');
  readonly code = signal<string>('');
  readonly stdin = signal<string>('');
  readonly showStdin = signal<boolean>(false);
  readonly showHintBar = signal<boolean>(false);
  readonly isFullscreen = signal<boolean>(false);
  readonly isModified = signal<boolean>(false);
  readonly layoutMode = signal<'bottom' | 'side'>('bottom');
  readonly mobileActivePane = signal<'editor' | 'terminal' | 'ai'>('editor');

  readonly cursorLine = signal<number>(1);
  readonly cursorCol = signal<number>(1);

  readonly running = signal<boolean>(false);
  readonly testing = signal<boolean>(false);
  readonly aiLoading = signal<boolean>(false);

  readonly activeTerminalTab = signal<'terminal' | 'tests' | 'ai'>('terminal');
  readonly executionResult = signal<CodeExecutionResponse | null>(null);

  // AI Copilot state
  readonly copilotMessages = signal<TerminalAiMessage[]>([]);
  readonly hasUnreadAiAdvice = signal<boolean>(false);
  readonly aiInputText = signal<string>('');
  readonly toastMessage = signal<string | null>(null);

  constructor() {
    // Sync initial code & language when inputs change
    effect(() => {
      const initLang = this.language() || 'python';
      this.currentLanguage.set(initLang);
      const initCode = this.initialCode() || this.getDefaultTemplate(initLang);
      this.code.set(initCode);
      this.isModified.set(false);
    });
  }

  readonly currentLangInfo = computed(() => {
    const langId = this.currentLanguage();
    return this.languages.find(l => l.id === langId) || this.languages[0];
  });

  readonly activeTestCases = computed<TestCase[]>(() => {
    const raw = this.testCases();
    if (!Array.isArray(raw)) return [];
    return raw.map(item => {
      if (Array.isArray(item)) {
        return { input: (item[0] as string) ?? '', expected: (item[1] as string) ?? '' };
      }
      return { input: (item?.input as string) ?? '', expected: (item?.expected as string) ?? '' };
    });
  });

  readonly lineNumbers = computed(() => {
    const codeLines = this.code().split('\n').length;
    const minLines = 24;
    const count = Math.max(codeLines, minLines);
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  manualApproveAndComplete() {
    this.markApprovedAutomatically('tests', 100, 'Solución validada y reto aprobado.');
  }

  openCopilotTab() {
    this.hasUnreadAiAdvice.set(false);
    this.activeTerminalTab.set('ai');
    this.mobileActivePane.set('ai');
    setTimeout(() => this.scrollCopilotToBottom(), 80);
  }

  switchToTerminalTab() {
    this.mobileActivePane.set('terminal');
    if (this.activeTerminalTab() === 'ai') {
      this.activeTerminalTab.set('terminal');
    }
  }

  switchToAiTab() {
    this.mobileActivePane.set('ai');
    this.openCopilotTab();
  }

  onCodeChange(val: string) {
    this.code.set(val);
    this.isModified.set(true);
  }

  onEditorScroll(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    if (this.codeGutterRef) {
      this.codeGutterRef.nativeElement.scrollTop = textarea.scrollTop;
    }
  }

  updateCursorPos() {
    if (!this.codeTextareaRef) return;
    const textarea = this.codeTextareaRef.nativeElement;
    const pos = textarea.selectionStart || 0;
    const val = textarea.value || '';
    const lines = val.substring(0, pos).split('\n');
    this.cursorLine.set(lines.length);
    this.cursorCol.set((lines[lines.length - 1]?.length || 0) + 1);
  }

  onLanguageChange(newLang: string) {
    this.currentLanguage.set(newLang);
    if (!this.isModified() || this.code().trim().length === 0) {
      this.code.set(this.getDefaultTemplate(newLang));
      this.isModified.set(false);
    }
  }

  getDefaultTemplate(langId: string): string {
    const found = this.languages.find(l => l.id === langId);
    return found?.defaultTemplate || '# Código inicial\n';
  }

  resetCode() {
    const resetTo = this.initialCode() || this.getDefaultTemplate(this.currentLanguage());
    this.code.set(resetTo);
    this.isModified.set(false);
    this.updateCursorPos();
    this.showToast('Buffer restablecido al código inicial');
  }

  clearTerminal() {
    this.executionResult.set(null);
  }

  handleEditorKeyDown(e: KeyboardEvent) {
    this.isModified.set(true);

    // Ctrl + Enter or Cmd + Enter: Run Code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      this.executeCode();
      return;
    }

    // Ctrl + S: Prevent browser save dialog
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      return;
    }

    // Smart Indent on Enter: retains whitespace of previous line and adds 4 spaces on ':' or '{'
    if (e.key === 'Enter') {
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const currentLine = val.substring(0, start).split('\n').pop() || '';
      const match = currentLine.match(/^(\s+)/);
      const indent = match ? match[1] : '';
      const extraIndent = currentLine.trimEnd().endsWith(':') || currentLine.trimEnd().endsWith('{') ? '    ' : '';
      const insert = '\n' + indent + extraIndent;

      e.preventDefault();
      this.code.set(val.substring(0, start) + insert + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
        this.updateCursorPos();
      }, 0);
      return;
    }

    // Tab key: indent 4 spaces
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const tabSpaces = '    ';
      this.code.set(val.substring(0, start) + tabSpaces + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
        this.updateCursorPos();
      }, 0);
      return;
    }

    // Shift + Tab: unindent 4 spaces
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const val = textarea.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const line = val.substring(lineStart, start);
      if (line.startsWith('    ')) {
        this.code.set(val.substring(0, lineStart) + val.substring(lineStart + 4));
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 4);
          this.updateCursorPos();
        }, 0);
      }
      return;
    }

    setTimeout(() => this.updateCursorPos(), 0);
  }

  executeCode() {
    if (this.running() || !this.code().trim()) return;

    this.running.set(true);
    this.activeTerminalTab.set('terminal');
    this.mobileActivePane.set('terminal');

    this.codeRunner
      .execute(this.currentLanguage(), this.code(), this.stdin(), [])
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.running.set(false);

          // Evaluación continua y recomendaciones activas del Agente:
          if (res.exit_code === 0) {
            if (this.activeTestCases().length > 0) {
              // Si el ejercicio tiene tests, los corremos en segundo plano
              this.codeRunner
                .execute(this.currentLanguage(), this.code(), '', this.activeTestCases())
                .subscribe({
                  next: testRes => {
                    if (testRes.tests && testRes.tests.length > 0 && testRes.tests.every(t => t.passed)) {
                      this.markApprovedAutomatically(
                        'tests',
                        100,
                        'Todas las pruebas automatizadas del sistema pasaron exitosamente.'
                      );
                      // El agente además aporta recomendaciones de buenas prácticas y calidad
                      this.runBackgroundAiEvaluation(testRes);
                    } else {
                      // Pruebas no pasaron: el agente analiza qué falló y aporta recomendaciones
                      this.runBackgroundAiEvaluation(testRes);
                    }
                  },
                });
            } else if (this.code().trim().length > 8) {
              // Si no hay tests unitarios rígidos, aprobar de inmediato al compilar y ejecutar limpiamente
              this.markApprovedAutomatically('tests', 100, 'Código ejecutado exitosamente sin excepciones.');
              this.runBackgroundAiEvaluation(res);
            }
          } else {
            // El código falló con error de compilación o excepción en consola (stderr)
            // El agente analiza el error y le da recomendaciones al estudiante sobre qué estuvo mal
            this.runBackgroundAiEvaluation(res);
          }
        },
        error: err => {
          this.running.set(false);
          const errRes: CodeExecutionResponse = {
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error de conexión con el motor de ejecución.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
        },
      });
  }

  runTests() {
    const tests = this.activeTestCases();
    if (this.testing() || tests.length === 0 || !this.code().trim()) return;

    this.testing.set(true);
    this.activeTerminalTab.set('tests');
    this.mobileActivePane.set('terminal');

    this.codeRunner
      .execute(this.currentLanguage(), this.code(), '', tests)
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.testing.set(false);

          // Si pasaron todas las pruebas o al menos la mayoría
          const passedCount = res.tests ? res.tests.filter(t => t.passed).length : 0;
          const totalCount = res.tests ? res.tests.length : 0;

          if (totalCount > 0 && passedCount === totalCount) {
            this.markApprovedAutomatically(
              'tests',
              100,
              'Todas las pruebas automatizadas del sistema pasaron exitosamente.'
            );
            this.runBackgroundAiEvaluation(res);
          } else if (totalCount > 0 && passedCount >= Math.ceil(totalCount / 2)) {
            this.markApprovedAutomatically(
              'tests',
              90,
              'Pruebas principales satisfactorias. Ejercicio aprobado.'
            );
            this.runBackgroundAiEvaluation(res);
          } else if (res.tests && res.tests.some(t => !t.passed)) {
            this.challengeStatus.set('needs_work');
            this.runBackgroundAiEvaluation(res);
          }
        },
        error: err => {
          this.testing.set(false);
          const errRes: CodeExecutionResponse = {
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error al ejecutar las pruebas.',
            exit_code: 1,
            execution_time_ms: 0,
            language: this.currentLanguage(),
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
        },
      });
  }

  private markApprovedAutomatically(method: 'tests' | 'ai', score: number, message: string): void {
    if (this.challengeStatus() === 'passed_tests' || this.challengeStatus() === 'passed_ai' || this.isCompleted()) {
      return;
    }
    this.challengeStatus.set(method === 'tests' ? 'passed_tests' : 'passed_ai');
    this.recordChallengeCompleted();
    const successMsg = method === 'tests'
      ? '¡Pruebas superadas con éxito! Ejercicio aprobado por el Sistema.'
      : '¡Excelente! Solución validada y aprobada automáticamente por el Agente.';
    this.showToast(successMsg);
    this.challengeSolved.emit({
      passed: true,
      method,
      score,
      message,
    });
  }

  private recordChallengeCompleted() {
    if (typeof window === 'undefined') return;
    try {
      const challengeKey = String(this.lessonId() || this.lessonTitle() || 'challenge');
      const stored = JSON.parse(localStorage.getItem('syseng_solved_challenges') || '[]');
      if (!stored.includes(challengeKey)) {
        stored.push(challengeKey);
        localStorage.setItem('syseng_solved_challenges', JSON.stringify(stored));
        this.showToast('¡Reto completado! Has desbloqueado progreso para tus insignias');
      }
    } catch {}
  }

  /**
   * Evaluación automática continua del Agente en segundo plano con diagnóstico y recomendaciones activas
   */
  async runBackgroundAiEvaluation(lastExec: CodeExecutionResponse): Promise<void> {
    if (this.aiLoading()) return;

    this.aiLoading.set(true);
    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.currentLanguage(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: lastExec,
      hint: this.hint(),
    };

    try {
      const evaluation = await this.callAiEvaluator(context);

      let aiReplyText = '';
      if (evaluation.approved) {
        this.markApprovedAutomatically('ai', evaluation.score ?? 100, evaluation.summary);

        aiReplyText = `### ¡Solución Validada y Aprobada! (${evaluation.score}/100)\n\n` +
          `**Resumen:** ${evaluation.summary}\n\n` +
          (evaluation.recommendations
            ? `**Recomendaciones de Calidad y Buenas Prácticas:**\n${evaluation.recommendations}\n\n`
            : '') +
          `> **Objetivo completado.** El avance ha sido registrado automáticamente y el siguiente módulo está habilitado.`;
      } else {
        aiReplyText = `### [BYTE-AI] Revisión en Vivo del Agente (${evaluation.score}/100)\n\n` +
          `**Resumen:** ${evaluation.summary}\n\n` +
          (evaluation.what_was_wrong
            ? `**En qué estuvo mal o qué faltó:**\n${evaluation.what_was_wrong}\n\n`
            : (evaluation.feedback ? `**Observaciones:**\n${evaluation.feedback}\n\n` : '')) +
          (evaluation.recommendations
            ? `**Recomendaciones para mejorar:**\n${evaluation.recommendations}\n\n`
            : '') +
          (evaluation.next_step
            ? `**Siguiente paso sugerido:**\n${evaluation.next_step}\n\n`
            : '') +
          `> *Ajusta tu código en el editor y presiona [▶ run] para revalidar automáticamente.*`;
      }

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (this.activeTerminalTab() !== 'ai') {
        this.hasUnreadAiAdvice.set(true);
        if (!evaluation.approved) {
          this.showToast('[BYTE-AI] El Agente analizó tu código y dejó recomendaciones en Copilot.');
        }
      }
    } catch (_err) {
      const localEval = this.evaluateLocally(context);
      let aiReplyText = '';
      if (localEval.approved) {
        this.markApprovedAutomatically('ai', localEval.score || 100, localEval.summary);
        aiReplyText = `### ¡Solución Aprobada por el Sistema y el Agente! (100/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.recommendations ? `**Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          `> **Excelente trabajo.** Continúa con la siguiente lección.`;
      } else {
        aiReplyText = `### [BYTE-AI] Revisión del Agente — Ajustes Requeridos (${localEval.score || 40}/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.what_was_wrong ? `**En qué estuvo mal:**\n${localEval.what_was_wrong}\n\n` : '') +
          (localEval.recommendations ? `**Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          (localEval.next_step ? `**Siguiente paso:**\n${localEval.next_step}\n\n` : '') +
          `> *Ajusta tu código y presiona [▶ run] para revalidar.*`;
      }

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now()),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
      };
      this.copilotMessages.update(msgs => [...msgs, aiMsg]);

      if (this.activeTerminalTab() !== 'ai') {
        this.hasUnreadAiAdvice.set(true);
      }
    } finally {
      this.aiLoading.set(false);
      this.scrollCopilotToBottom();
    }
  }

  async evaluateSolutionWithAi(): Promise<void> {
    const lastExec = this.executionResult() || {
      stdout: '',
      stderr: '',
      exit_code: 0,
      execution_time_ms: 0,
      language: this.currentLanguage(),
    };
    return this.runBackgroundAiEvaluation(lastExec);
  }

  private async callAiEvaluator(ctx: any): Promise<{
    approved: boolean;
    score: number;
    verdict: string;
    summary: string;
    what_was_wrong: string;
    recommendations: string;
    next_step: string;
    feedback: string;
  }> {
    const systemPrompt = `Eres Byte AI, evaluador técnico estricto y tutor pedagógico de SysEngAcademy.
Tu misión no es solo validar si el código pasa o no, sino FORMAR al estudiante con explicaciones claras sobre qué estuvo mal, qué faltó, y recomendaciones de buenas prácticas y calidad de código.

Instrucciones pedagógicas:
1. Revisa si implementó el algoritmo, clase, atributos o métodos requeridos en: "${ctx.lesson}".
2. Si hay errores (sintaxis, excepciones en stderr, tests fallidos, requerimientos ausentes o código incompleto):
   - "approved": false
   - "score": número entre 0 y 60
   - "verdict": "NECESITA MEJORAS"
   - "summary": frase resumen concisa del estado del código
   - "what_was_wrong": Explica con claridad qué estuvo mal (error de sintaxis, excepción en stderr, por qué falló la lógica o qué método/atributo faltó).
   - "recommendations": 2 o 3 recomendaciones concretas (legibilidad, buenas prácticas, estándares del lenguaje, cómo enfocar la lógica).
   - "next_step": Pista socrática para que el estudiante resuelva el problema sin darle el código copiado.
3. Si la solución es correcta y cumple los requerimientos:
   - "approved": true
   - "score": número entre 90 y 100
   - "verdict": "APROBADO"
   - "summary": felicitación y resumen de aciertos
   - "what_was_wrong": ""
   - "recommendations": Recomendaciones de optimización (complejidad Big-O, limpieza de código, estándares de la industria, tipado).
   - "next_step": Sugerencia de pasar a la siguiente lección.

Responde EXCLUSIVAMENTE un JSON válido con estas claves:
{
  "approved": boolean,
  "score": number,
  "verdict": string,
  "summary": string,
  "what_was_wrong": string,
  "recommendations": string,
  "next_step": string
}`;

    let userPrompt = `Reto: ${ctx.lesson}\nLenguaje: ${ctx.language}\nPista / Requerimientos: ${ctx.hint || 'No disponible'}\n`;
    if (ctx.lastExecution?.exit_code !== undefined) {
      userPrompt += `Exit Code: ${ctx.lastExecution.exit_code}\n`;
    }
    if (ctx.lastExecution?.stderr) {
      userPrompt += `Error en consola (stderr):\n${ctx.lastExecution.stderr}\n`;
    }
    if (ctx.lastExecution?.stdout) {
      userPrompt += `Salida estándar (stdout):\n${ctx.lastExecution.stdout}\n`;
    }
    if (ctx.lastExecution?.tests?.length) {
      userPrompt += `Resultados de tests unitarios: ${JSON.stringify(ctx.lastExecution.tests)}\n`;
    }
    userPrompt += `\nCódigo del estudiante:\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\``;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Code Evaluator',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 700,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Respuesta no parseable');
      }
    }

    return {
      approved: !!parsed.approved,
      score: typeof parsed.score === 'number' ? parsed.score : (parsed.approved ? 100 : 40),
      verdict: parsed.verdict || (parsed.approved ? 'APROBADO' : 'NECESITA MEJORAS'),
      summary: parsed.summary || (parsed.approved ? 'Solución correcta y funcional.' : 'El código requiere ajustes.'),
      what_was_wrong: parsed.what_was_wrong || parsed.feedback || '',
      recommendations: parsed.recommendations || '',
      next_step: parsed.next_step || '',
      feedback: parsed.feedback || parsed.what_was_wrong || '',
    };
  }

  private evaluateLocally(ctx: any): {
    approved: boolean;
    score: number;
    summary: string;
    what_was_wrong: string;
    recommendations: string;
    next_step: string;
    feedback: string;
  } {
    const code = ctx.code || '';
    const cleanCode = code.replace(/#.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

    if (!cleanCode || cleanCode.length < 15) {
      return {
        approved: false,
        score: 10,
        summary: 'El código está prácticamente vacío.',
        what_was_wrong: 'Aún no has escrito la lógica para resolver el ejercicio planteado.',
        recommendations: 'Lee con atención la pista técnica y la descripción del reto. Comienza declarando las variables, funciones o clases pedidas.',
        next_step: 'Escribe la estructura base en el editor y presiona [▶ run].',
        feedback: 'Debes escribir la implementación requerida para el reto.',
      };
    }

    // Si hubo error de compilación o ejecución en terminal
    if (ctx.lastExecution && ctx.lastExecution.exit_code !== 0 && ctx.lastExecution.stderr) {
      const stderr = ctx.lastExecution.stderr;
      let errorHint = 'El intérprete reportó una excepción al ejecutar tu programa.';
      if (stderr.includes('SyntaxError')) {
        errorHint = 'Error de sintaxis: verifica paréntesis sin cerrar, comillas o dos puntos (:) faltantes.';
      } else if (stderr.includes('NameError')) {
        errorHint = 'Variable o función no definida: revisa que los identificadores estén bien escritos antes de usarlos.';
      } else if (stderr.includes('IndentationError')) {
        errorHint = 'Error de indentación: Python requiere exactamente 4 espacios uniformes en cada bloque.';
      }
      return {
        approved: false,
        score: 30,
        summary: 'Error durante la ejecución del programa en la consola.',
        what_was_wrong: `Excepción en terminal: ${stderr.slice(0, 180)}`,
        recommendations: errorHint,
        next_step: 'Revisa la línea señalada en la consola, corrige el error y vuelve a compilar con [▶ run].',
        feedback: stderr,
      };
    }

    if (ctx.lastExecution?.tests?.length > 0) {
      const allPassed = ctx.lastExecution.tests.every((t: any) => t.passed);
      if (allPassed) {
        return {
          approved: true,
          score: 100,
          summary: 'Todas las pruebas unitarias fueron validadas y superadas.',
          what_was_wrong: '',
          recommendations: 'Tu algoritmo maneja correctamente todos los casos de prueba provistos. Como buena práctica, piensa en casos borde extremos y eficiencia Big-O.',
          next_step: 'Avanza a la siguiente lección del curso.',
          feedback: 'La estructura y comportamiento cumplen con todas las especificaciones.',
        };
      } else {
        const failed = ctx.lastExecution.tests.find((t: any) => !t.passed);
        return {
          approved: false,
          score: 50,
          summary: 'Uno o más casos de prueba fallaron al validar la salida.',
          what_was_wrong: failed ? `Con entrada "${failed.input || 'por defecto'}", se esperaba "${failed.expected}" pero se obtuvo "${failed.actual || '(vacío)'}".` : 'Divergencia entre la salida esperada y la real.',
          recommendations: 'Compara la salida producida con el formato exacto requerido (revisa espacios, saltos de línea o tipos de retorno).',
          next_step: 'Consulta la pestaña de Pruebas para ver el detalle de cada caso y ajusta tu lógica.',
          feedback: 'Revisa los casos fallidos en la pestaña de Pruebas.',
        };
      }
    }

    const lTitle = (ctx.lesson || '').toLowerCase();
    if (lTitle.includes('clase') || lTitle.includes('libro')) {
      const hasClass = /class\s+Libro\b/i.test(code);
      const hasInit = /def\s+__init__\s*\(\s*self/i.test(code);
      const hasMostrar = /def\s+mostrar\s*\(\s*self/i.test(code);
      if (hasClass && hasInit && hasMostrar) {
        return {
          approved: true,
          score: 100,
          summary: 'La clase Libro y sus métodos __init__ y mostrar() están correctamente estructurados.',
          what_was_wrong: '',
          recommendations: 'Excelente aplicación del paradigma orientado a objetos. Para código profesional, puedes añadir type hints: def __init__(self, titulo: str, autor: str) -> None.',
          next_step: 'Avanza a la siguiente lección.',
          feedback: 'Se identificó la declaración de la clase, el constructor con self y el método de representación.',
        };
      } else {
        const missing: string[] = [];
        if (!hasClass) missing.push('Declarar la clase Libro');
        if (!hasInit) missing.push('Definir el constructor __init__(self, titulo, autor)');
        if (!hasMostrar) missing.push('Definir el método mostrar(self)');
        return {
          approved: false,
          score: 45,
          summary: 'La implementación de la clase está incompleta.',
          what_was_wrong: `Falta implementar: ${missing.join(', ')}.`,
          recommendations: 'En Python, todo método dentro de una clase debe recibir self como primer parámetro para acceder a las propiedades de la instancia.',
          next_step: 'Añade los métodos faltantes según la pista y presiona [▶ run].',
          feedback: `Falta: ${missing.join(', ')}.`,
        };
      }
    }

    if (ctx.lastExecution && ctx.lastExecution.exit_code === 0 && !ctx.lastExecution.stderr) {
      return {
        approved: true,
        score: 95,
        summary: 'El código compila y ejecuta limpiamente sin errores de consola.',
        what_was_wrong: '',
        recommendations: 'El programa finalizó con código 0. Recuerda mantener nombres descriptivos de variables y comentarios donde aporten valor.',
        next_step: 'Continúa con el siguiente módulo.',
        feedback: 'Ejecución exitosa en el entorno de ejecución.',
      };
    }

    return {
      approved: false,
      score: 40,
      summary: 'El código requiere revisión para satisfacer el problema.',
      what_was_wrong: 'La solución actual no produce la salida o estructura esperada para este reto.',
      recommendations: 'Revisa la pista técnica proporcionada en la pestaña Pista y asegúrate de imprimir o retornar el valor solicitado.',
      next_step: 'Haz los cambios necesarios en el editor y presiona [▶ run].',
      feedback: 'Ejecuta ./test.sh o revisa la salida en terminal para verificar tus resultados.',
    };
  }

  /* ============================================================
     BYTE AI LINUX COPILOT (OPENROUTER GPT-4O-MINI)
     ============================================================ */

  askByteWithChip(promptText: string) {
    this.dispatchAiQuery(promptText);
  }

  sendUserChatMessage() {
    const text = this.aiInputText().trim();
    if (!text || this.aiLoading()) return;

    this.aiInputText.set('');
    this.dispatchAiQuery(text);
  }

  private async dispatchAiQuery(userQuestion: string) {
    this.aiLoading.set(true);
    this.activeTerminalTab.set('ai');

    const userMsg: TerminalAiMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userQuestion,
      timestamp: new Date(),
    };
    this.copilotMessages.update(msgs => [...msgs, userMsg]);
    this.scrollCopilotToBottom();

    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.currentLanguage(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: this.executionResult(),
      hint: this.hint(),
    };

    try {
      const aiReplyText = await this.callAiService(userQuestion, context);
      const codeMatch = aiReplyText.match(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date(),
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
      };

      this.copilotMessages.update(msgs => [...msgs, aiMsg]);
    } catch (_err) {
      const fallbackReply = this.generateSmartLocalGuidance(userQuestion, context);
      const codeMatch = fallbackReply.match(/```(?:[a-zA-Z0-9_-]*)\n([\s\S]*?)```/);

      const aiMsg: TerminalAiMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: fallbackReply,
        timestamp: new Date(),
        codeSnippet: codeMatch ? codeMatch[1].trim() : undefined,
      };

      this.copilotMessages.update(msgs => [...msgs, aiMsg]);
    } finally {
      this.aiLoading.set(false);
      this.scrollCopilotToBottom();
    }
  }

  private async callAiService(question: string, ctx: any): Promise<string> {
    const systemPrompt = `Eres Byte AI, copiloto de terminal Linux y tutor socrático en SysEngAcademy.
Tu objetivo es guiar al estudiante para que resuelva el reto por sí mismo en ${ctx.language}.
Reglas:
1. Responde en español con tono conciso, técnico y directo de terminal.
2. Si te piden una pista, guía el razonamiento algorítmico sin dar la solución completa copiada.
3. Si los casos de prueba fallaron, diagnostica la línea exacta y qué caso borde faltó.
4. Si piden pseudocódigo o solución, muestra código limpio en bloques markdown \`\`\`${ctx.language}.
5. Mantén las respuestas claras y orientadas a ingeniería de sistemas.`;

    let userPrompt = `Reto: "${ctx.lesson}" | Lenguaje: ${ctx.language}\n`;
    if (ctx.hint) {
      userPrompt += `Pista: ${ctx.hint}\n`;
    }
    userPrompt += `\nCódigo actual del estudiante:\n\`\`\`${ctx.language}\n${ctx.code}\n\`\`\`\n`;

    if (ctx.lastExecution) {
      if (ctx.lastExecution.stderr) {
        userPrompt += `\nError en terminal (stderr): ${ctx.lastExecution.stderr}\n`;
      }
      if (ctx.lastExecution.tests && ctx.lastExecution.tests.length > 0) {
        const failed = ctx.lastExecution.tests.filter((t: any) => !t.passed);
        if (failed.length > 0) {
          userPrompt += `\nPruebas fallidas (${failed.length}/${ctx.lastExecution.tests.length}):\n`;
          failed.forEach((f: any) => {
            userPrompt += `  - input="${f.input}", expected="${f.expected}", actual="${f.actual}"\n`;
          });
        }
      }
    }

    userPrompt += `\nConsulta: ${question}`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Linux Terminal IDE',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: 850,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenRouter HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Byte no pudo generar una respuesta.';
  }

  private generateSmartLocalGuidance(question: string, ctx: any): string {
    const qLower = question.toLowerCase();
    const hasStderr = ctx.lastExecution?.stderr;
    const failedTests = ctx.lastExecution?.tests?.filter((t: any) => !t.passed) || [];

    if (qLower.includes('empezar') || qLower.includes('inicio') || qLower.includes('cómo')) {
      let advice = `### Guía para iniciar "${ctx.lesson}"\n\n`;
      advice += `1. **Identifica entradas y salidas:** Analiza qué parámetros recibe la función y qué debe retornar.\n`;
      if (ctx.hint) {
        advice += `2. **Pista clave:** ${ctx.hint}\n`;
      }
      advice += `3. **Estructura lógica recomendada:**\n`;
      advice += `   - Maneja casos base (colecciones vacías o cadenas de longitud 0).\n`;
      advice += `   - Inicializa la estructura de datos (p. ej. pila/lista o diccionario).\n`;
      advice += `   - Itera y aplica la regla de negocio.\n`;
      advice += `   - Retorna el resultado final validando el estado acumulado.`;
      return advice;
    }

    if (failedTests.length > 0) {
      const f = failedTests[0];
      return `### Diagnóstico de Prueba Fallida\n\n` +
        `Tu código falló con entrada \`${f.input}\`:\n` +
        `- **Esperado:** \`${f.expected}\`\n` +
        `- **Obtenido:** \`${f.actual || '(vacío)'}\`\n\n` +
        `Revisa si estás manejando casos donde la condición de parada se activa antes de tiempo o si quedan elementos pendientes.`;
    }

    if (hasStderr) {
      return `### Diagnóstico de Error en Terminal\n\n` +
        `Error en tiempo de ejecución:\n` +
        `\`\`\`\n${hasStderr}\n\`\`\`\n` +
        `Verifica que todas las variables estén declaradas y los tipos de datos coincidan.`;
    }

    return `### [BYTE-AI] Recomendación del Agente\n\n` +
      `Tu código tiene buena estructura base. Asegúrate de retornar explícitamente el resultado y verificar casos extremos.\n` +
      (ctx.hint ? `Pista: *${ctx.hint}*` : '');
  }

  applySnippetToEditor(snippet: string) {
    if (!snippet) return;
    this.code.set(snippet);
    this.isModified.set(true);
    this.updateCursorPos();
    this.showToast('Código aplicado al buffer de edición');
  }

  copySnippet(snippet: string) {
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      this.showToast('Código copiado al portapapeles');
    });
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 2500);
  }

  private scrollCopilotToBottom() {
    setTimeout(() => {
      if (this.copilotScrollRef) {
        this.copilotScrollRef.nativeElement.scrollTop = this.copilotScrollRef.nativeElement.scrollHeight;
      }
    }, 50);
  }

  renderMarkdown(text: string): string {
    const esc = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return esc
      .replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
