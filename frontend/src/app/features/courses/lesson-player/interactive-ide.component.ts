import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EditorView,
  lineNumbers,
  highlightActiveLineGutter,
  highlightActiveLine,
  keymap,
} from '@codemirror/view';
import { EditorState, Compartment, Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { HighlightStyle, syntaxHighlighting, indentUnit, StreamLanguage } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import {
  CodeExecutionResponse,
  CodeExecutionService,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
  TestCase,
} from '../../../core/services/code-execution.service';

export interface TerminalAiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  codeSnippet?: string;
}

export interface LanguageMeta {
  id: string;
  name: string;
  filename: string;
  runCommand: string;
  extension: string;
  badge: string;
}

/* ==========================================================================
   CODEMIRROR 6 THEME & HIGHLIGHTING (Aesthetic Developer Dark Window)
   ========================================================================== */

const macEditorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#11121d',
      color: '#f1f5f9',
      height: '100%',
      fontSize: '14px',
      fontFamily: '"JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
      lineHeight: '1.65',
    },
    '.cm-content': {
      padding: '16px 14px 28px 14px',
      caretColor: '#a855f7',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#a855f7',
      borderLeftWidth: '2px',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: 'rgba(168, 85, 247, 0.25) !important',
    },
    '.cm-gutters': {
      backgroundColor: '#11121d',
      color: '#4e536e',
      border: 'none',
      borderRight: '1px solid rgba(255, 255, 255, 0.04)',
      paddingLeft: '10px',
      paddingRight: '10px',
      userSelect: 'none',
    },
    '.cm-gutterElement': {
      padding: '0 4px',
      minWidth: '28px',
      textAlign: 'right',
      fontFamily: 'inherit',
      fontSize: '13px',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(255, 255, 255, 0.035)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent',
      color: '#94a3b8',
      fontWeight: '600',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'inherit',
    },
    '.cm-line': {
      padding: '0 4px',
    },
  },
  { dark: true }
);

const macHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#c084fc', fontWeight: '600' },
  { tag: [tags.name, tags.deleted, tags.character, tags.macroName], color: '#fde047' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#60a5fa' },
  { tag: [tags.typeName, tags.className, tags.labelName], color: '#38bdf8' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#facc15' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#e2e8f0' },
  { tag: [tags.angleBracket, tags.bracket], color: '#94a3b8' },
  { tag: [tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: '#fb923c' },
  { tag: [tags.string, tags.special(tags.string)], color: '#4ade80' },
  { tag: [tags.meta, tags.comment], color: '#64748b', fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.link, color: '#60a5fa', textDecoration: 'underline' },
  { tag: tags.atom, color: '#c084fc' },
  { tag: tags.bool, color: '#c084fc', fontWeight: '600' },
  { tag: tags.null, color: '#c084fc', fontWeight: '600' },
  { tag: tags.operator, color: '#e2e8f0' },
  { tag: tags.invalid, color: '#f87171' },
]);

// Intérprete léxico de PSeInt para coloreado de pseudocódigo en español
const pseintKeywords = new Set([
  'algoritmo', 'finalgoritmo', 'proceso', 'finproceso',
  'subproceso', 'finsubproceso', 'subalgoritmo', 'finsubalgoritmo',
  'funcion', 'finfuncion', 'definir', 'como',
  'escribir', 'leer', 'si', 'entonces', 'sino', 'finsi',
  'para', 'hasta', 'con', 'paso', 'hacer', 'finpara',
  'mientras', 'finmientras', 'repetir', 'que',
  'segun', 'de', 'otro', 'modo', 'finsegun',
  'retornar', 'borrar', 'pantalla', 'esperar'
]);
const pseintTypes = new Set(['entero', 'real', 'caracter', 'texto', 'logico', 'numero', 'numerico']);

const pseintLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match('//')) {
      stream.skipToEnd();
      return 'comment';
    }
    if (stream.match(/^"([^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/^'([^'\\]|\\.)*'/)) return 'string';
    if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return 'number';
    if (stream.match(/^<-|:=|<=|>=|<>|!=|==|=|\+|-|\*|\/|\^|mod/i)) return 'operator';
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current().toLowerCase();
      if (pseintKeywords.has(word)) return 'keyword';
      if (pseintTypes.has(word)) return 'typeName';
      return 'variableName';
    }
    stream.next();
    return null;
  },
});

@Component({
  selector: 'app-interactive-ide',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interactive-ide.component.html',
  styleUrl: './interactive-ide.component.scss',
})
export class InteractiveIdeComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly codeRunner = inject(CodeExecutionService);

  @ViewChild('editorContainer') editorContainerRef?: ElementRef<HTMLDivElement>;
  @ViewChild('copilotScroll') copilotScrollRef?: ElementRef<HTMLDivElement>;

  private editorView?: EditorView;
  private readonly langCompartment = new Compartment();

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
  readonly code = signal<string>('');
  readonly stdin = signal<string>('');
  readonly showStdin = signal<boolean>(false);
  readonly isModified = signal<boolean>(false);

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

  /**
   * Adapta automáticamente el editor al lenguaje del ejercicio:
   * nombre de archivo (ej. main.py), comando de ejecución y badge.
   */
  readonly langMeta = computed<LanguageMeta>(() => {
    const raw = (this.language() || 'python').toLowerCase().trim();
    switch (raw) {
      case 'python':
      case 'py':
        return {
          id: 'python',
          name: 'Python',
          filename: 'main.py',
          runCommand: 'python main.py',
          extension: '.py',
          badge: 'Python 3.12',
        };
      case 'javascript':
      case 'js':
      case 'node':
        return {
          id: 'javascript',
          name: 'JavaScript',
          filename: 'index.js',
          runCommand: 'node index.js',
          extension: '.js',
          badge: 'Node.js',
        };
      case 'typescript':
      case 'ts':
        return {
          id: 'typescript',
          name: 'TypeScript',
          filename: 'index.ts',
          runCommand: 'ts-node index.ts',
          extension: '.ts',
          badge: 'TypeScript 5',
        };
      case 'cpp':
      case 'c++':
      case 'c':
        return {
          id: 'cpp',
          name: 'C++',
          filename: 'main.cpp',
          runCommand: 'g++ -O2 main.cpp && ./a.out',
          extension: '.cpp',
          badge: 'GCC 13',
        };
      case 'java':
        return {
          id: 'java',
          name: 'Java',
          filename: 'Main.java',
          runCommand: 'javac Main.java && java Main',
          extension: '.java',
          badge: 'Java 21',
        };
      case 'sql':
      case 'postgresql':
      case 'postgres':
        return {
          id: 'sql',
          name: 'PostgreSQL',
          filename: 'query.sql',
          runCommand: 'psql -f query.sql',
          extension: '.sql',
          badge: 'PostgreSQL 16',
        };
      case 'php':
        return {
          id: 'php',
          name: 'PHP',
          filename: 'script.php',
          runCommand: 'php script.php',
          extension: '.php',
          badge: 'PHP 8.3',
        };
      case 'pseint':
        return {
          id: 'pseint',
          name: 'PSeInt',
          filename: 'algoritmo.psc',
          runCommand: 'pseint algoritmo.psc',
          extension: '.psc',
          badge: 'Pseudocódigo',
        };
      case 'go':
      case 'golang':
        return {
          id: 'go',
          name: 'Go',
          filename: 'main.go',
          runCommand: 'go run main.go',
          extension: '.go',
          badge: 'Go 1.22',
        };
      case 'rust':
      case 'rs':
        return {
          id: 'rust',
          name: 'Rust',
          filename: 'main.rs',
          runCommand: 'rustc main.rs && ./main',
          extension: '.rs',
          badge: 'Rust 1.78',
        };
      default:
        return {
          id: raw,
          name: raw.toUpperCase(),
          filename: `solution.${raw}`,
          runCommand: `./run.sh`,
          extension: `.${raw}`,
          badge: raw.toUpperCase(),
        };
    }
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

  readonly testStats = computed(() => {
    const res = this.executionResult();
    if (!res || !res.tests || res.tests.length === 0) return null;
    const passed = res.tests.filter(t => t.passed).length;
    return { passed, total: res.tests.length };
  });

  constructor() {
    // Sincroniza el código inicial cuando cambian los inputs
    effect(() => {
      const initLang = this.language() || 'python';
      const initCode = this.initialCode() || this.getDefaultTemplate(initLang);
      this.code.set(initCode);
      this.isModified.set(false);

      if (this.editorView) {
        this.syncEditorDocument(initCode);
        this.reconfigureEditorLanguage(initLang);
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.editorContainerRef) {
      this.initCodeMirror();
    }
  }

  ngOnDestroy(): void {
    if (this.editorView) {
      this.editorView.destroy();
      this.editorView = undefined;
    }
  }

  /* ==========================================================================
     CODEMIRROR INITIALIZATION & LIFECYCLE
     ========================================================================== */

  private initCodeMirror(): void {
    const container = this.editorContainerRef?.nativeElement;
    if (!container) return;

    const currentLang = this.language() || 'python';
    const startCode = this.code() || this.initialCode() || this.getDefaultTemplate(currentLang);

    const isIndented4 = ['python', 'py', 'cpp', 'c', 'java', 'php'].includes(currentLang);

    const extensions: Extension[] = [
      macEditorTheme,
      syntaxHighlighting(macHighlightStyle),
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      closeBrackets(),
      indentUnit.of(isIndented4 ? '    ' : '  '),
      this.langCompartment.of(this.resolveLanguageExtension(currentLang)),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        ...closeBracketsKeymap,
        indentWithTab,
        {
          key: 'Mod-Enter',
          run: () => {
            this.executeCode();
            return true;
          },
        },
      ]),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          const docStr = update.state.doc.toString();
          this.code.set(docStr);
          this.isModified.set(true);
        }
      }),
    ];

    const state = EditorState.create({
      doc: startCode,
      extensions,
    });

    this.editorView = new EditorView({
      state,
      parent: container,
    });
  }

  private resolveLanguageExtension(langId: string): Extension {
    const norm = (langId || 'python').toLowerCase().trim();
    switch (norm) {
      case 'python':
      case 'py':
        return python();
      case 'javascript':
      case 'js':
      case 'node':
        return javascript();
      case 'typescript':
      case 'ts':
        return javascript({ typescript: true });
      case 'cpp':
      case 'c++':
      case 'c':
        return cpp();
      case 'java':
        return java();
      case 'sql':
      case 'postgresql':
      case 'postgres':
        return sql();
      case 'php':
        return php();
      case 'pseint':
        return pseintLanguage;
      default:
        return python();
    }
  }

  private reconfigureEditorLanguage(langId: string): void {
    if (!this.editorView) return;
    this.editorView.dispatch({
      effects: this.langCompartment.reconfigure(this.resolveLanguageExtension(langId)),
    });
  }

  private syncEditorDocument(newCode: string): void {
    if (!this.editorView) return;
    const currentDoc = this.editorView.state.doc.toString();
    if (currentDoc !== newCode) {
      this.editorView.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: newCode },
      });
    }
  }

  getDefaultTemplate(langId: string): string {
    const found = this.languages.find(l => l.id === langId);
    return found?.defaultTemplate || '# Código inicial\n';
  }

  resetCode(): void {
    const resetTo = this.initialCode() || this.getDefaultTemplate(this.language());
    this.code.set(resetTo);
    this.isModified.set(false);
    this.syncEditorDocument(resetTo);
    this.showToast('Buffer restablecido al código inicial');
  }

  clearTerminal(): void {
    this.executionResult.set(null);
  }

  /* ==========================================================================
     CODE EXECUTION & EVALUATION WORKFLOW
     ========================================================================== */

  executeCode(): void {
    if (this.running() || !this.code().trim()) return;

    this.running.set(true);
    this.activeTerminalTab.set('terminal');

    const activeLang = this.language() || 'python';

    this.codeRunner
      .execute(activeLang, this.code(), this.stdin(), [])
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.running.set(false);

          if (res.exit_code === 0) {
            if (this.activeTestCases().length > 0) {
              // Si el ejercicio tiene tests, ejecutarlos de inmediato
              this.codeRunner
                .execute(activeLang, this.code(), '', this.activeTestCases())
                .subscribe({
                  next: testRes => {
                    this.executionResult.set(testRes);
                    if (testRes.tests && testRes.tests.length > 0 && testRes.tests.every(t => t.passed)) {
                      this.markApprovedAutomatically(
                        'tests',
                        100,
                        'Todas las pruebas automatizadas del sistema pasaron exitosamente.'
                      );
                      this.runBackgroundAiEvaluation(testRes);
                    } else {
                      this.runBackgroundAiEvaluation(testRes);
                    }
                  },
                });
            } else if (this.code().trim().length > 8) {
              this.markApprovedAutomatically('tests', 100, 'Código ejecutado exitosamente sin excepciones.');
              this.runBackgroundAiEvaluation(res);
            }
          } else {
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
            language: activeLang,
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
        },
      });
  }

  runTests(): void {
    if (this.testing() || !this.code().trim() || this.activeTestCases().length === 0) return;

    this.testing.set(true);
    this.activeTerminalTab.set('tests');

    const activeLang = this.language() || 'python';

    this.codeRunner
      .execute(activeLang, this.code(), '', this.activeTestCases())
      .subscribe({
        next: res => {
          this.executionResult.set(res);
          this.testing.set(false);

          if (res.tests && res.tests.length > 0 && res.tests.every(t => t.passed)) {
            this.markApprovedAutomatically(
              'tests',
              100,
              'Todas las pruebas automatizadas pasaron exitosamente.'
            );
          }
          this.runBackgroundAiEvaluation(res);
        },
        error: err => {
          this.testing.set(false);
          const errRes: CodeExecutionResponse = {
            stdout: '',
            stderr: err?.error?.message || err?.message || 'Error al ejecutar las pruebas.',
            exit_code: 1,
            execution_time_ms: 0,
            language: activeLang,
          };
          this.executionResult.set(errRes);
          this.runBackgroundAiEvaluation(errRes);
        },
      });
  }

  manualApproveAndComplete(): void {
    this.markApprovedAutomatically('tests', 100, 'Solución validada y reto aprobado.');
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

  private recordChallengeCompleted(): void {
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

  /* ==========================================================================
     BACKGROUND AI EVALUATION & COPILOT
     ========================================================================== */

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

  async runBackgroundAiEvaluation(lastExec: CodeExecutionResponse): Promise<void> {
    if (this.aiLoading()) return;

    this.aiLoading.set(true);
    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.language(),
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
          `> *Ajusta tu código en el editor y presiona [▶ Run Script] para revalidar automáticamente.*`;
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
          this.showToast('[BYTE-AI] El Agente analizó tu código y dejó recomendaciones.');
        }
      }
    } catch (_err) {
      const localEval = this.evaluateLocally(context);
      let aiReplyText = '';
      if (localEval.approved) {
        this.markApprovedAutomatically('ai', localEval.score || 100, localEval.summary);
        aiReplyText = `### ¡Solución Aprobada por el Sistema! (100/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.recommendations ? `**Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          `> **Excelente trabajo.** Continúa con la siguiente lección.`;
      } else {
        aiReplyText = `### [BYTE-AI] Revisión del Agente — Ajustes Requeridos (${localEval.score || 40}/100)\n\n` +
          `**Resumen:** ${localEval.summary}\n\n` +
          (localEval.what_was_wrong ? `**En qué estuvo mal:**\n${localEval.what_was_wrong}\n\n` : '') +
          (localEval.recommendations ? `**Recomendaciones:**\n${localEval.recommendations}\n\n` : '') +
          (localEval.next_step ? `**Siguiente paso:**\n${localEval.next_step}\n\n` : '') +
          `> *Ajusta tu código y presiona [▶ Run Script] para revalidar.*`;
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
Tu misión es FORMAR al estudiante con explicaciones claras sobre qué estuvo mal, qué faltó, y recomendaciones de buenas prácticas y calidad de código.
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
    userPrompt += `Código:\n${ctx.code}\n`;

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Code Editor',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 650,
      }),
    });

    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON output from evaluator');
    return JSON.parse(jsonMatch[0]);
  }

  private evaluateLocally(ctx: any): any {
    const code = ctx.code || '';
    if (ctx.lastExecution?.tests?.length > 0) {
      const allPassed = ctx.lastExecution.tests.every((t: any) => t.passed);
      if (allPassed) {
        return {
          approved: true,
          score: 100,
          summary: 'Todas las pruebas unitarias fueron validadas y superadas.',
          what_was_wrong: '',
          recommendations: 'Tu algoritmo maneja correctamente todos los casos de prueba provistos.',
          next_step: 'Avanza a la siguiente lección del curso.',
          feedback: 'Validación completada.',
        };
      } else {
        const failed = ctx.lastExecution.tests.find((t: any) => !t.passed);
        return {
          approved: false,
          score: 50,
          summary: 'Uno o más casos de prueba fallaron al validar la salida.',
          what_was_wrong: failed ? `Con entrada "${failed.input || 'por defecto'}", se esperaba "${failed.expected}" pero se obtuvo "${failed.actual || '(vacío)'}".` : 'Divergencia en salida.',
          recommendations: 'Compara la salida producida con el formato exacto requerido.',
          next_step: 'Revisa la pestaña de Pruebas y ajusta tu lógica.',
          feedback: 'Revisa los casos fallidos.',
        };
      }
    }

    if (ctx.lastExecution && ctx.lastExecution.exit_code === 0 && !ctx.lastExecution.stderr) {
      return {
        approved: true,
        score: 95,
        summary: 'El código compila y ejecuta limpiamente sin errores de consola.',
        what_was_wrong: '',
        recommendations: 'El programa finalizó con código 0.',
        next_step: 'Continúa con el siguiente módulo.',
        feedback: 'Ejecución exitosa.',
      };
    }

    return {
      approved: false,
      score: 40,
      summary: 'El código requiere revisión para satisfacer el problema.',
      what_was_wrong: 'La solución actual no produce la salida esperada o generó excepciones.',
      recommendations: 'Verifica la consola de salida y revisa la pista técnica del ejercicio.',
      next_step: 'Haz los cambios necesarios en el editor y presiona [▶ Run Script].',
      feedback: 'Revisa los errores en la terminal.',
    };
  }

  openCopilotTab(): void {
    this.hasUnreadAiAdvice.set(false);
    this.activeTerminalTab.set('ai');
    setTimeout(() => this.scrollCopilotToBottom(), 80);
  }

  sendUserChatMessage(): void {
    const text = this.aiInputText().trim();
    if (!text || this.aiLoading()) return;

    this.aiInputText.set('');
    this.aiLoading.set(true);
    this.activeTerminalTab.set('ai');

    const userMsg: TerminalAiMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    this.copilotMessages.update(msgs => [...msgs, userMsg]);
    this.scrollCopilotToBottom();

    const context = {
      lesson: this.lessonTitle() || 'Reto de Programación',
      language: this.language(),
      code: this.code(),
      testCases: this.activeTestCases(),
      lastExecution: this.executionResult(),
      hint: this.hint(),
    };

    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getOpenRouterKey()}`,
        'Content-Type': 'application/json',
        'X-Title': 'SysEngAcademy Code Editor',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          { role: 'system', content: `Eres Byte AI, tutor técnico en SysEngAcademy. Responde brevemente y en español sobre el código de ${context.language}.` },
          { role: 'user', content: `Reto: ${context.lesson}\nCódigo:\n\`\`\`${context.language}\n${context.code}\n\`\`\`\nPregunta: ${text}` },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })
      .then(r => r.json())
      .then(data => {
        const reply = data.choices?.[0]?.message?.content || 'Sin respuesta.';
        this.copilotMessages.update(msgs => [
          ...msgs,
          { id: String(Date.now()), sender: 'assistant', text: reply, timestamp: new Date() },
        ]);
      })
      .catch(() => {
        this.copilotMessages.update(msgs => [
          ...msgs,
          { id: String(Date.now()), sender: 'assistant', text: 'No se pudo conectar con el asistente AI.', timestamp: new Date() },
        ]);
      })
      .finally(() => {
        this.aiLoading.set(false);
        this.scrollCopilotToBottom();
      });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 2500);
  }

  private scrollCopilotToBottom(): void {
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
