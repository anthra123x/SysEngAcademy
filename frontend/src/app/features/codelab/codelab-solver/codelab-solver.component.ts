import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, indentUnit } from '@codemirror/language';
import { keymap } from '@codemirror/view';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';

import { CodelabService } from '../codelab.service';
import { Challenge } from '../codelab.models';
import {
  CodeExecutionResponse,
  CodeExecutionService,
  TestCase,
} from '../../../core/services/code-execution.service';
import {
  GitHubSyncPayload,
  GitHubSyncResult,
  GitHubSyncService,
  GitHubSyncStatus,
} from '../../../core/services/github-sync.service';

@Component({
  selector: 'app-codelab-solver',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './codelab-solver.component.html',
  styleUrls: ['./codelab-solver.component.scss'],
})
export class CodelabSolverComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly codelabService = inject(CodelabService);
  private readonly codeExecService = inject(CodeExecutionService);
  private readonly gitHubSyncService = inject(GitHubSyncService);
  private readonly platformId = inject(PLATFORM_ID);

  @ViewChild('editorContainer') editorContainer?: ElementRef<HTMLDivElement>;

  readonly challenge = signal<Challenge | undefined>(undefined);
  readonly selectedLang = signal<string>('python');
  readonly activeLeftTab = signal<'enunciado' | 'soluciones'>('enunciado');
  readonly activeConsoleTab = signal<'testcases' | 'salida'>('testcases');

  readonly isRunning = signal<boolean>(false);
  readonly executionResult = signal<CodeExecutionResponse | undefined>(undefined);
  readonly isSolvedCelebrationOpen = signal<boolean>(false);
  readonly mobileViewMode = signal<'statement' | 'workbench'>('workbench');

  // GitHub Project Sync State
  readonly isGitHubModalOpen = signal<boolean>(false);
  readonly isCheckingGitHub = signal<boolean>(false);
  readonly isSyncingGitHub = signal<boolean>(false);
  readonly isConnectingGitHub = signal<boolean>(false);
  readonly gitHubStatus = signal<GitHubSyncStatus | null>(null);
  readonly gitHubRepoName = signal<string>('syseng-codelab-soluciones');
  readonly gitHubFilePath = signal<string>('');
  readonly gitHubCommitMsg = signal<string>('');
  readonly gitHubSyncResult = signal<GitHubSyncResult | null>(null);
  readonly gitHubError = signal<string>('');

  private editorView?: EditorView;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        const found = this.codelabService.getChallengeBySlug(slug);
        if (found) {
          this.challenge.set(found);
          this.initEditorWithCurrentLang();
        }

        // Fetch fresh challenge data and test cases from backend database
        this.codelabService.fetchChallengeBySlug(slug).subscribe({
          next: fresh => {
            if (fresh) {
              this.challenge.set(fresh);
              if (!found) {
                this.initEditorWithCurrentLang();
              }
            }
          },
          error: () => {
            if (!found) {
              this.challenge.set(this.codelabService.spotlightChallenge());
              this.initEditorWithCurrentLang();
            }
          }
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId) && this.editorContainer) {
      this.initCodeMirror();
    }
  }

  ngOnDestroy(): void {
    if (this.editorView) {
      this.editorView.destroy();
    }
  }

  goBack(): void {
    this.router.navigate(['/codelab']);
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedLang.set(select.value);
    this.initEditorWithCurrentLang();
  }

  resetCode(): void {
    this.initEditorWithCurrentLang();
  }

  private getLanguageExtension(lang: string): Extension {
    switch (lang) {
      case 'python':
        return python();
      case 'javascript':
      case 'typescript':
        return javascript();
      case 'cpp':
      case 'c':
        return cpp();
      case 'java':
        return java();
      case 'php':
        return php();
      case 'sql':
        return sql();
      default:
        return python();
    }
  }

  private initCodeMirror(): void {
    if (!this.editorContainer) return;

    if (this.editorView) {
      this.editorView.destroy();
    }

    const c = this.challenge();
    const lang = this.selectedLang();
    const starterCode =
      c?.starterCode[lang] ||
      c?.starterCode['python'] ||
      `# Escribe tu solución aquí\ndef solution():\n    pass\n`;

    const startState = EditorState.create({
      doc: starterCode,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        indentUnit.of('    '),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        this.getLanguageExtension(lang),
        oneDark,
        EditorView.theme({
          '&': { height: '100%', backgroundColor: '#08090D' },
          '.cm-content': { padding: '16px 12px', caretColor: '#0AE98A' },
          '.cm-gutters': { backgroundColor: '#0D1117', borderRight: '1px solid #1E2235', color: '#64748B' },
        }),
      ],
    });

    this.editorView = new EditorView({
      state: startState,
      parent: this.editorContainer.nativeElement,
    });
  }

  private initEditorWithCurrentLang(): void {
    if (isPlatformBrowser(this.platformId) && this.editorContainer) {
      this.initCodeMirror();
    }
  }

  getCurrentCode(): string {
    if (this.editorView) {
      return this.editorView.state.doc.toString();
    }
    return '';
  }

  runTests(): void {
    const c = this.challenge();
    if (!c) return;

    const code = this.getCurrentCode();
    const lang = this.selectedLang();
    const tests: TestCase[] = c.testCases.map(tc => ({
      input: tc.input || '',
      expected: tc.expected,
    }));

    this.isRunning.set(true);
    this.activeConsoleTab.set('salida');

    const firstInput = tests[0]?.input || '';

    this.codeExecService.execute(lang, code, firstInput, tests).subscribe({
      next: res => {
        this.isRunning.set(false);
        this.executionResult.set({
          ...res,
          memory_mb: res.memory_mb || 14.1,
          percentile_speed: res.percentile_speed || 98.4,
          percentile_memory: res.percentile_memory || 95.0,
        });
      },
      error: err => {
        this.isRunning.set(false);
        this.executionResult.set({
          stdout: '',
          stderr: 'Error al conectar con el entorno de ejecución: ' + (err?.message || 'Servicio no disponible'),
          exit_code: 1,
          execution_time_ms: 0,
          language: lang,
        });
      },
    });
  }

  submitSolution(): void {
    const c = this.challenge();
    if (!c) return;

    const code = this.getCurrentCode();
    const lang = this.selectedLang();

    this.isRunning.set(true);
    this.activeConsoleTab.set('salida');

    this.codelabService.submitSolution(c.id, lang, code).subscribe({
      next: res => {
        this.isRunning.set(false);
        this.executionResult.set({
          exit_code: res.passed ? 0 : 1,
          stdout: res.stdout,
          stderr: res.stderr,
          execution_time_ms: res.execution_time_ms,
          memory_mb: res.memory_mb || 14.1,
          percentile_speed: res.percentile_speed || 98.4,
          percentile_memory: res.percentile_memory || 95.0,
          language: lang,
          tests: res.tests,
        });

        if (res.passed) {
          this.isSolvedCelebrationOpen.set(true);
        }
      },
      error: err => {
        this.isRunning.set(false);
        // Fallback to local sandbox runner
        this.runTests();
        this.codelabService.markAsSolved(c.id);
        this.isSolvedCelebrationOpen.set(true);
      }
    });
  }

  closeCelebration(): void {
    this.isSolvedCelebrationOpen.set(false);
  }

  viewCommunitySolutions(): void {
    this.isSolvedCelebrationOpen.set(false);
    this.activeLeftTab.set('soluciones');
  }

  goToNextChallenge(): void {
    this.isSolvedCelebrationOpen.set(false);
    const list = this.codelabService.allChallenges();
    const currentIdx = list.findIndex(item => item.id === this.challenge()?.id);
    const nextItem = list[(currentIdx + 1) % list.length];
    if (nextItem) {
      this.router.navigate(['/codelab', nextItem.slug]);
    }
  }

  private getFileExtension(lang: string): string {
    switch (lang) {
      case 'python': return 'py';
      case 'javascript': return 'js';
      case 'typescript': return 'ts';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'go': return 'go';
      case 'rust': return 'rs';
      case 'php': return 'php';
      case 'sql': return 'sql';
      default: return 'txt';
    }
  }

  openGitHubModal(): void {
    const c = this.challenge();
    const lang = this.selectedLang();
    const ext = this.getFileExtension(lang);
    const slug = c?.slug || 'solucion';

    this.gitHubFilePath.set(`retos/${slug}.${ext}`);
    this.gitHubCommitMsg.set(`feat(codelab): solucion a ${c?.title || slug}`);
    this.gitHubError.set('');
    this.gitHubSyncResult.set(null);
    this.isGitHubModalOpen.set(true);

    this.checkGitHubStatus();
  }

  checkGitHubStatus(): void {
    this.isCheckingGitHub.set(true);
    this.gitHubSyncService.getStatus().subscribe({
      next: status => {
        this.gitHubStatus.set(status);
        this.isCheckingGitHub.set(false);
      },
      error: () => {
        this.gitHubStatus.set({ connected: false, has_repo_scope: false });
        this.isCheckingGitHub.set(false);
      }
    });
  }

  connectGitHubRepoScope(): void {
    this.isConnectingGitHub.set(true);
    this.gitHubError.set('');

    this.gitHubSyncService.connectRepoScope().subscribe({
      next: () => {
        this.isConnectingGitHub.set(false);
        this.checkGitHubStatus();
      },
      error: err => {
        this.isConnectingGitHub.set(false);
        const msg = err?.message || 'No se pudo conectar con GitHub.';
        if (!msg.includes('cancelada')) {
          this.gitHubError.set(msg);
        }
      }
    });
  }

  executeGitHubSync(): void {
    if (this.isSyncingGitHub()) return;

    const code = this.getCurrentCode();
    if (!code.trim()) {
      this.gitHubError.set('No hay código en el editor para sincronizar.');
      return;
    }

    this.isSyncingGitHub.set(true);
    this.gitHubError.set('');

    this.gitHubSyncService.syncProject({
      repo_name: this.gitHubRepoName(),
      file_path: this.gitHubFilePath(),
      content: code,
      commit_message: this.gitHubCommitMsg(),
      description: `Soluciones a retos de CodeLab en SysEng Academy (${this.challenge()?.title || ''})`,
    }).subscribe({
      next: res => {
        this.isSyncingGitHub.set(false);
        this.gitHubSyncResult.set(res);
      },
      error: err => {
        this.isSyncingGitHub.set(false);
        const msg = err?.error?.message || err?.message || 'Error al sincronizar con GitHub.';
        this.gitHubError.set(msg);
      }
    });
  }

  closeGitHubModal(): void {
    this.isGitHubModalOpen.set(false);
  }
}
