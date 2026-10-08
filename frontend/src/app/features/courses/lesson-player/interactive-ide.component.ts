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
import { AppIconComponent } from '../../../shared/components/app-icon.component';
import {
  EDITOR_LANGUAGES,
  EditorLanguageDefinition,
  getAllSupportedLanguages,
  resolveEditorLanguage,
  detectLanguageFromContext,
} from '../../../core/config/editor-languages.config';

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
  'retornar', 'borrar', 'pantalla', 'esperar', 'sinsaltar',
]);
const pseintTypes = new Set([
  'entero', 'enteros', 'real', 'reales', 'caracter', 'caracteres',
  'cadena', 'cadenas', 'texto', 'logico', 'logicos', 'booleano',
  'numero', 'numerico', 'char', 'string', 'float', 'double',
]);

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

// Lexer para Go (Golang)
const goKeywords = new Set([
  'package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface',
  'return', 'if', 'else', 'for', 'range', 'switch', 'case', 'default',
  'go', 'select', 'chan', 'defer', 'make', 'new', 'len', 'cap', 'append',
  'true', 'false', 'nil',
]);
const goTypes = new Set(['string', 'int', 'int64', 'int32', 'float64', 'float32', 'bool', 'byte', 'error', 'rune']);
const goLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match(/^\/\*[\s\S]*?\*\//)) return 'comment';
    if (stream.match(/^"([^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/^`[^`]*`/)) return 'string';
    if (stream.match(/^'([^'\\]|\\.)*'/)) return 'string';
    if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return 'number';
    if (stream.match(/^[+\-*\/%=<>!&|~^]+/)) return 'operator';
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const w = stream.current();
      if (goKeywords.has(w)) return 'keyword';
      if (goTypes.has(w)) return 'typeName';
      return 'variableName';
    }
    stream.next();
    return null;
  },
});

// Lexer para Rust
const rustKeywords = new Set([
  'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn', 'else',
  'enum', 'extern', 'false', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop',
  'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self', 'static',
  'struct', 'super', 'trait', 'true', 'type', 'unsafe', 'use', 'where', 'while',
]);
const rustTypes = new Set(['i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64', 'bool', 'char', 'str', 'String', 'Vec', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err']);
const rustLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match('//')) { stream.skipToEnd(); return 'comment'; }
    if (stream.match(/^\/\*[\s\S]*?\*\//)) return 'comment';
    if (stream.match(/^"([^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/^'([^'\\]|\\.)*'/)) return 'string';
    if (stream.match(/^[0-9]+(\.[0-9]+)?/)) return 'number';
    if (stream.match(/^[+\-*\/%=<>!&|~^]+/)) return 'operator';
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const w = stream.current();
      if (rustKeywords.has(w)) return 'keyword';
      if (rustTypes.has(w)) return 'typeName';
      return 'variableName';
    }
    stream.next();
    return null;
  },
});

// Lexer para Bash / Shell
const bashKeywords = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until',
  'do', 'done', 'in', 'function', 'select', 'time', 'echo', 'exit', 'export', 'local',
]);
const bashLanguage = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/^#.*/)) { stream.skipToEnd(); return 'comment'; }
    if (stream.match(/^"([^"\\]|\\.)*"/)) return 'string';
    if (stream.match(/^'[^']*'/)) return 'string';
    if (stream.match(/^\$[a-zA-Z_0-9]+/)) return 'variableName';
    if (stream.match(/^[0-9]+/)) return 'number';
    if (stream.match(/^[|&;<>()`]+/)) return 'operator';
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_-]*/)) {
      const w = stream.current();
      if (bashKeywords.has(w)) return 'keyword';
      return 'variableName';
    }
    stream.next();
    return null;
  },
});

@Component({
  selector: 'app-interactive-ide',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
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
  readonly moduleTitle = input<string | undefined>(undefined);
  readonly courseTitle = input<string | undefined>(undefined);
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

  // Catálogo completo de lenguajes configurados globalmente
  readonly allLanguages: EditorLanguageDefinition[] = getAllSupportedLanguages();
  readonly languages: SupportedLanguage[] = SUPPORTED_LANGUAGES;

  // Estado del selector y anulación de lenguaje por el usuario
  readonly langDropdownOpen = signal<boolean>(false);
  readonly userSelectedLangId = signal<string | null>(null);

  /**
   * Resuelve automáticamente el lenguaje y entorno recomendado para este
   * ejercicio, módulo y curso específico.
   */
  readonly recommendedLangDef = computed<EditorLanguageDefinition>(() => {
    return detectLanguageFromContext({
      language: this.language(),
      starter_code: this.initialCode(),
      title: this.lessonTitle(),
      moduleTitle: this.moduleTitle(),
      courseTitle: this.courseTitle(),
    });
  });

  /**
   * Lenguaje activo actual del IDE (el recomendado por defecto o el
   * anulado manualmente por el usuario en el selector).
   */
  readonly activeLangDef = computed<EditorLanguageDefinition>(() => {
    const manual = this.userSelectedLangId();
    if (manual) {
      return resolveEditorLanguage(manual);
    }
    return this.recommendedLangDef();
  });

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
   * Adapta automáticamente el editor al lenguaje activo:
   * nombre de archivo (ej. main.py, algoritmo.psc), comando y badge.
   */
  readonly langMeta = computed<LanguageMeta>(() => {
    const def = this.activeLangDef();
    return {
      id: def.id,
      name: def.name,
      filename: def.defaultFilename,
      runCommand: def.runCommand,
      extension: def.extension,
      badge: def.badge,
    };
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
    // Sincroniza el código inicial y el lenguaje cuando cambian los inputs de la lección
    effect(() => {
      // Al cambiar de lección o ejercicio, reiniciar la anulación manual y adaptarse al recomendado
      this.userSelectedLangId.set(null);
      this.langDropdownOpen.set(false);

      const activeDef = this.recommendedLangDef();
      const initCode = this.initialCode() || activeDef.defaultTemplate;
      this.code.set(initCode);
      this.isModified.set(false);

      if (this.editorView) {
        this.syncEditorDocument(initCode);
        this.reconfigureEditorLanguage(activeDef.id);
      }
    });
  }

  toggleLangDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.langDropdownOpen.update(v => !v);
  }

  selectLanguage(langId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.userSelectedLangId.set(langId);
    this.langDropdownOpen.set(false);

    const langDef = resolveEditorLanguage(langId);
    this.reconfigureEditorLanguage(langDef.id);

    // Si el buffer de código está vacío o es un template por defecto, cambiar al template del nuevo lenguaje
    const currentCode = this.code().trim();
    const isTemplate = !currentCode || Object.values(EDITOR_LANGUAGES).some(l => l.defaultTemplate.trim() === currentCode);
    if (isTemplate) {
      this.code.set(langDef.defaultTemplate);
      this.syncEditorDocument(langDef.defaultTemplate);
      this.isModified.set(false);
    }

    this.showToast(`Entorno adaptado a ${langDef.name}`);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.langDropdownOpen()) {
      this.langDropdownOpen.set(false);
    }
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

    const activeDef = this.activeLangDef();
    const currentLang = activeDef.id;
    const startCode = this.code() || this.initialCode() || activeDef.defaultTemplate;

    const isIndented4 = ['python', 'py', 'cpp', 'c', 'java', 'php', 'csharp', 'go', 'rust', 'pseint'].includes(currentLang);

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
      case 'python3':
        return python();
      case 'javascript':
      case 'js':
      case 'node':
      case 'nodejs':
        return javascript();
      case 'typescript':
      case 'ts':
        return javascript({ typescript: true });
      case 'cpp':
      case 'c++':
      case 'c':
      case 'cxx':
        return cpp();
      case 'java':
      case 'openjdk':
        return java();
      case 'csharp':
      case 'cs':
      case 'c#':
      case 'dotnet':
        return java();
      case 'go':
      case 'golang':
        return goLanguage;
      case 'rust':
      case 'rs':
        return rustLanguage;
      case 'bash':
      case 'sh':
      case 'shell':
      case 'zsh':
        return bashLanguage;
      case 'sql':
      case 'postgresql':
      case 'postgres':
        return sql();
      case 'php':
      case 'php8':
      case 'laravel':
        return php();
      case 'pseint':
      case 'psc':
      case 'pseudocodigo':
      case 'pseudocódigo':
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
    return resolveEditorLanguage(langId).defaultTemplate;
  }

  resetCode(): void {
    const activeDef = this.activeLangDef();
    const resetTo = this.initialCode() || activeDef.defaultTemplate;
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

    const activeLang = this.activeLangDef().id;

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

    const activeLang = this.activeLangDef().id;

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
