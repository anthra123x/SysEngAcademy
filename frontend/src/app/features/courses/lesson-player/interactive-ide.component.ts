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

  // Output event emitted when code is solved via system tests
  readonly challengeSolved = output<{
    passed: boolean;
    method: 'tests' | 'ai';
    score?: number;
    message?: string;
  }>();

  readonly challengeStatus = signal<'pending' | 'evaluating' | 'passed_tests' | 'needs_work'>('pending');

  readonly isApproved = computed(() =>
    this.isCompleted() || this.challengeStatus() === 'passed_tests'
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

  readonly activeTerminalTab = signal<'terminal' | 'tests'>('terminal');
  readonly executionResult = signal<CodeExecutionResponse | null>(null);
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
                    }
                  },
                });
            } else if (this.code().trim().length > 8) {
              this.markApprovedAutomatically('tests', 100, 'Código ejecutado exitosamente sin excepciones.');
            }
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
        },
      });
  }

  manualApproveAndComplete(): void {
    this.markApprovedAutomatically('tests', 100, 'Solución validada y reto aprobado.');
  }

  private markApprovedAutomatically(method: 'tests', score: number, message: string): void {
    if (this.challengeStatus() === 'passed_tests' || this.isCompleted()) {
      return;
    }
    this.challengeStatus.set('passed_tests');
    this.recordChallengeCompleted();
    const successMsg = '¡Pruebas superadas con éxito! Ejercicio aprobado por el Sistema.';
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

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 2500);
  }
}
