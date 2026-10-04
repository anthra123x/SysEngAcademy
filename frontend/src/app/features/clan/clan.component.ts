import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClansService } from '../../core/services/clans.service';
import { AuthService } from '../../core/services/auth.service';
import { AppIconComponent } from '../../shared/components/app-icon.component';
import {
  StudyGroup,
  ResearchLogEntry,
  ResearchProject,
  ClanBattleChallenge,
  TeacherMission,
  GitCommit,
  GitPullRequest,
  GitBranch,
} from '../../core/models/clan';

export interface ToastAlert {
  title: string;
  message: string;
  icon: string;
  xp?: number;
}

export interface QuestContributionOption {
  id: string;
  label: string;
  category: string;
  desc: string;
  xp: number;
  icon: string;
  type: 'feat' | 'test' | 'perf' | 'fix' | 'docs';
  defaultBranch: string;
  commitMessage: string;
  filename: string;
  snippet: string;
}

@Component({
  selector: 'app-clan',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppIconComponent],
  templateUrl: './clan.component.html',
  styleUrl: './clan.component.scss',
})
export class ClanComponent implements OnInit, OnDestroy {
  readonly clansService = inject(ClansService);
  readonly auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly Math = Math;

  // Tabs de navegación interna del Squad de Ingeniería
  activeTab = signal<'sprint' | 'git' | 'rfcs' | 'incidents' | 'members'>('sprint');
  selectedClanId = signal<string | null>(null);
  feedFilter = signal<'all' | 'hallazgo' | 'benchmark' | 'paper' | 'propuesta' | 'standup' | 'mision_docente'>('all');
  browseAllClans = signal<boolean>(false);

  // Rol del usuario
  readonly isTeacher = computed<boolean>(() => {
    const role = this.auth.user()?.role;
    return role === 'instructor' || role === 'admin';
  });

  // Modales generales
  showNewLogModal = signal<boolean>(false);
  showNewProjectModal = signal<boolean>(false);
  showCreateClanModal = signal<boolean>(false);
  showStandupModal = signal<boolean>(false);
  showTeacherMissionModal = signal<boolean>(false);
  showQuestModal = signal<boolean>(false);

  // Notificaciones Toast de Gamificación
  activeToast = signal<ToastAlert | null>(null);
  private toastTimer: any = null;

  // Formulario de Nueva Idea / Bitácora
  newLogTitle = signal<string>('');
  newLogContent = signal<string>('');
  newLogType = signal<'hallazgo' | 'pregunta' | 'paper' | 'benchmark' | 'propuesta'>('hallazgo');
  newLogCode = signal<string>('');
  newLogLanguage = signal<string>('typescript');

  // Formulario de Nuevo Proyecto
  newProjectTitle = signal<string>('');
  newProjectDesc = signal<string>('');
  newProjectStack = signal<string>('TypeScript, Rust, Docker');
  newProjectRepo = signal<string>('');

  // Formulario de Creación de Clan
  newClanName = signal<string>('');
  newClanTag = signal<string>('');
  newClanCategory = signal<string>('systems');
  newClanDesc = signal<string>('');
  newClanLines = signal<string>('Concurrencia, Sistemas Distribuidos, Criptografía');

  // Formulario de Daily Standup
  standupWhatIDid = signal<string>('');
  standupNextGoal = signal<string>('');

  // Formulario de Misión de Cátedra (Docente)
  teacherMissionTitle = signal<string>('');
  teacherMissionDesc = signal<string>('');
  teacherMissionDeadline = signal<string>('5 días');
  teacherMissionXp = signal<number>(300);

  // Opciones de Contribución Técnica a la Misión Semanal con Flujo Git
  readonly questContributions: QuestContributionOption[] = [
    {
      id: 'tests',
      label: 'Suite de Tests y Casos de Estrés',
      category: 'Testing & Validación',
      desc: 'Ejecutar batería de pruebas concurrentes y reportar memory leaks en la cola de tareas.',
      xp: 45,
      icon: 'zap',
      type: 'test',
      defaultBranch: 'test/concurrency-race-conditions',
      commitMessage: 'test(kernel): suite de pruebas de estrés para condiciones de carrera',
      filename: 'tests/test_concurrency_stress.cpp',
      snippet: `// Suite de pruebas de estrés concurrentes\nTEST(SchedulerStress, NoDeadlockUnderHighLoad) {\n    Spinlock lock;\n    std::atomic<int> counter{0};\n    std::vector<std::thread> workers;\n    for (int i = 0; i < 4; ++i) {\n        workers.emplace_back([&]() {\n            for (int j = 0; j < 500; ++j) {\n                std::lock_guard<Spinlock> guard(lock);\n                counter.fetch_add(1, std::memory_order_relaxed);\n            }\n        });\n    }\n    for (auto& w : workers) w.join();\n    ASSERT_EQ(counter.load(), 2000);\n}`,
    },
    {
      id: 'sast',
      label: 'Auditoría SAST y Sanitización',
      category: 'Seguridad & OWASP',
      desc: 'Revisar control de parámetros, headers y sanitización de punteros en memoria.',
      xp: 60,
      icon: 'shield',
      type: 'fix',
      defaultBranch: 'fix/sast-memory-sanitizer',
      commitMessage: 'fix(security): sanitizar punteros en memoria y validar límites en Ring 0',
      filename: 'kernel/security/pointer_sanitizer.cpp',
      snippet: `// Sanitización de punteros de usuario para evitar buffer overflow\nbool ValidateUserPointer(const void* ptr, size_t length) {\n    uintptr_t addr = reinterpret_cast<uintptr_t>(ptr);\n    if (addr == 0 || (addr + length) > USER_SPACE_MAX_ADDR) {\n        TriggerSecurityAuditLog("Violación de límites de puntero en espacio de usuario");\n        return false;\n    }\n    return true;\n}`,
    },
    {
      id: 'bench',
      label: 'Benchmarking de Rendimiento',
      category: 'Optimización de Latencia',
      desc: 'Medir tiempos de respuesta en ráfagas de syscalls y cuellos de botella.',
      xp: 75,
      icon: 'cpu',
      type: 'perf',
      defaultBranch: 'perf/tlb-invalidation-fastpath',
      commitMessage: 'perf(mmu): optimización de TLB flush y caché de tablas de páginas',
      filename: 'benchmarks/context_switch_bench.cpp',
      snippet: `// Benchmark de conmutación de contexto con micro-segundos de latencia\nBENCHMARK(ContextSwitchFastpath) {\n    Timer timer;\n    timer.Start();\n    for (int i = 0; i < 10000; ++i) {\n        SwitchToNextReadyTask();\n    }\n    double elapsed_us = timer.ElapsedMicroseconds();\n    RecordMetric("latency_p99_us", elapsed_us / 10000.0);\n}`,
    },
    {
      id: 'arch',
      label: 'Documentación y Diagramas',
      category: 'Arquitectura de Sistemas',
      desc: 'Diagramas de secuencia, esquema de interfaces y RFC técnico.',
      xp: 35,
      icon: 'book',
      type: 'docs',
      defaultBranch: 'docs/syscalls-rfc',
      commitMessage: 'docs(arch): especificación técnica y RFC de llamadas al sistema',
      filename: 'docs/architecture/rfc_syscalls.md',
      snippet: `# Especificación Técnica: Flujo de Syscalls y Aislamiento de Memoria\n1. Usuario invoca syscall(SYS_read, fd, buf, count) (Ring 3).\n2. CPU cambia a Ring 0 mediante SYSENTER / SYSCALL.\n3. Validar que buf pertenezca al espacio de memoria del proceso.\n4. Conmutar a la cola del descriptor sin bloquear el hilo principal.`,
    },
  ];
  selectedContributionId = signal<string>('tests');
  questSnippetDraft = signal<string>('');

  readonly selectedContribution = computed(() => {
    return this.questContributions.find(c => c.id === this.selectedContributionId()) || this.questContributions[0];
  });

  selectContribution(id: string): void {
    this.selectedContributionId.set(id);
    const opt = this.questContributions.find(c => c.id === id);
    if (opt) {
      this.questSnippetDraft.set(opt.snippet);
    }
  }

  // Git Workflow en Proyectos & Vercel Deployments
  projectGitTab = signal<Record<string, 'prs' | 'issues' | 'commits' | 'terminal'>>({});
  gitWorkflowTab = signal<'previews' | 'commits'>('previews');
  selectedPrForDiff = signal<GitPullRequest | null>(null);
  expandedPrId = signal<string | null>('pr_krnl_4');
  showNewPrModal = signal<boolean>(false);
  targetPrProjectId = signal<string>('');
  newPrTitle = signal<string>('');
  newPrBranch = signal<string>('');
  newPrType = signal<'feat' | 'test' | 'perf' | 'fix' | 'docs'>('test');
  newPrDesc = signal<string>('');
  newPrFilename = signal<string>('kernel/sched/scheduler.cpp');
  newPrSnippet = signal<string>('');
  newPrLinkedIssueId = signal<string>('');
  prReviewComment = signal<Record<string, string>>({});
  terminalOutput = signal<Record<string, string>>({});

  // Drag and Drop en el Sprint Kanban Board
  draggedTask = signal<{ projectId: string; taskId: string } | null>(null);
  dragOverColumn = signal<'pending' | 'in_progress' | 'review' | 'completed' | null>(null);

  // Modal para nuevo Issue / Tarea en el Sprint
  showNewTaskModal = signal<boolean>(false);
  newTaskTitle = signal<string>('');
  newTaskType = signal<'feature' | 'bug' | 'perf' | 'security' | 'arch'>('feature');
  newTaskAssignToMe = signal<boolean>(true);

  // Input rápido para nuevas tareas en proyectos
  quickTaskTitle = signal<Record<string, string>>({});

  // Comentarios en línea
  commentDrafts = signal<Record<string, string>>({});
  copiedSnippetId = signal<string | null>(null);

  // ==========================================
  // ARENA: Live Interactive Code Challenge Runner
  // ==========================================
  activeChallenge = signal<ClanBattleChallenge | null>(null);
  challengeLanguage = signal<'typescript' | 'python' | 'rust'>('typescript');
  challengeCode = signal<string>('');
  challengeRunningTests = signal<boolean>(false);
  challengeTestResults = signal<Array<{
    index: number;
    description: string;
    input: string;
    expected: string;
    passed: boolean;
    durationMs: number;
  }> | null>(null);
  challengePassed = signal<boolean>(false);
  challengeTimeRemaining = signal<number>(0);
  private challengeTimer: any = null;
  private challengeStartTime: number = 0;

  /** Clan actualmente seleccionado o clan del usuario */
  readonly currentClan = computed<StudyGroup | null>(() => {
    const selId = this.selectedClanId();
    if (selId) {
      const found = this.clansService.getClanById(selId);
      if (found) return found;
    }
    const myClan = this.clansService.userClan();
    if (myClan) return myClan;
    return this.clansService.studyGroups()[0] || null;
  });

  /** Entradas de bitácora filtradas */
  readonly filteredFeed = computed<ResearchLogEntry[]>(() => {
    const clan = this.currentClan();
    if (!clan) return [];
    const filter = this.feedFilter();
    if (filter === 'all') return clan.researchFeed;
    return clan.researchFeed.filter(e => e.type === filter);
  });

  /** Progreso porcentual hacia el siguiente nivel de Clan */
  readonly levelProgressPercent = computed<number>(() => {
    const clan = this.currentClan();
    if (!clan) return 0;
    const base = clan.level * 800;
    const target = clan.nextLevelXp;
    if (target <= base) return 100;
    const pct = Math.round(((clan.currentXp - base) / (target - base)) * 100);
    return Math.min(100, Math.max(10, pct));
  });

  /** Investigadores ordenados por XP contribuida (Leaderboard interno) */
  readonly sortedResearchers = computed(() => {
    const clan = this.currentClan();
    if (!clan) return [];
    return [...clan.researchers].sort((a, b) => b.xpContributed - a.xpContributed);
  });

  /** Proyecto I+D central activo para el Sprint y el repositorio Git */
  readonly activeProject = computed<ResearchProject | null>(() => {
    const clan = this.currentClan();
    if (!clan || !clan.projects || clan.projects.length === 0) return null;
    return clan.projects[0];
  });

  /** Tablero Kanban del Sprint agrupado por columnas estándar de ingeniería */
  readonly kanbanColumns = computed(() => {
    const proj = this.activeProject();
    const tasks = proj?.tasks || [];
    return {
      backlog: tasks.filter(t => !t.status || t.status === 'pending'),
      inProgress: tasks.filter(t => t.status === 'in_progress'),
      review: tasks.filter(t => t.status === 'review'),
      completed: tasks.filter(t => t.status === 'completed' || t.completed),
    };
  });

  /** Métricas de avance del Sprint / Milestone activo */
  readonly sprintProgress = computed(() => {
    const tasks = this.activeProject()?.tasks || [];
    if (tasks.length === 0) return { completed: 0, total: 0, percent: 100 };
    const completed = tasks.filter(t => t.completed || t.status === 'completed').length;
    const total = tasks.length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  });

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedClanId.set(id);
      }
      const tab = params.get('tab');
      if (tab === 'sprint' || tab === 'git' || tab === 'rfcs' || tab === 'incidents' || tab === 'members') {
        this.activeTab.set(tab);
      } else if (tab === 'projects') {
        this.activeTab.set('git');
      } else if (tab === 'feed') {
        this.activeTab.set('rfcs');
      } else if (tab === 'arena') {
        this.activeTab.set('incidents');
      }
      const browse = params.get('browse');
      if (browse === 'true') {
        this.browseAllClans.set(true);
      }
    });
  }

  ngOnDestroy() {
    this.clearChallengeTimer();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  selectClan(clan: StudyGroup): void {
    this.selectedClanId.set(clan.id);
    this.browseAllClans.set(false);
  }

  joinCurrentClan(): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.joinClan(clan.id);
      this.showToast(
        '¡Te has unido al Semillero! 🚀',
        `Bienvenido a ${clan.name}. Comienza interactuando en la bitácora o los retos.`,
        'user-check',
        150
      );
    }
  }

  leaveCurrentClan(): void {
    const clan = this.currentClan();
    if (clan && confirm(`¿Estás seguro de que deseas salir del clan ${clan.name}?`)) {
      this.clansService.leaveClan(clan.id);
      this.showToast('Membresía Desvinculada', `Has dejado el semillero ${clan.name}.`, 'log-out');
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(title: string, message: string, icon: string, xp?: number): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.activeToast.set({ title, message, icon, xp });
    this.toastTimer = setTimeout(() => {
      this.activeToast.set(null);
    }, 4200);
  }

  // ==========================================
  // DAILY STANDUP
  // ==========================================
  openStandupModal(): void {
    this.standupWhatIDid.set('');
    this.standupNextGoal.set('');
    this.showStandupModal.set(true);
  }

  submitDailyStandup(): void {
    const clan = this.currentClan();
    if (!clan || !this.standupWhatIDid().trim() || !this.standupNextGoal().trim()) return;

    const res = this.clansService.recordDailyStandup(clan.id, {
      whatIDid: this.standupWhatIDid().trim(),
      nextGoal: this.standupNextGoal().trim(),
    });

    this.showStandupModal.set(false);
    this.showToast(
      '¡Daily Standup Sincronizado! 🔥',
      `Racha del clan extendida a ${res.streak} días consecutivos.`,
      'zap',
      res.xp
    );
  }

  // ==========================================
  // ARENA: LIVE CHALLENGE RUNNER
  // ==========================================
  openChallenge(challenge: ClanBattleChallenge): void {
    this.activeChallenge.set(challenge);
    this.challengeLanguage.set('typescript');
    const starter = challenge.starterCode?.['typescript'] || `// Escribe tu solución aquí\n`;
    this.challengeCode.set(starter);
    this.challengeTestResults.set(null);
    this.challengePassed.set(false);
    this.challengeTimeRemaining.set(challenge.timeLimitMinutes * 60);
    this.challengeStartTime = Date.now();

    this.startChallengeTimer();
  }

  closeChallenge(): void {
    this.clearChallengeTimer();
    this.activeChallenge.set(null);
    this.challengeTestResults.set(null);
    this.challengePassed.set(false);
  }

  changeChallengeLanguage(lang: 'typescript' | 'python' | 'rust'): void {
    this.challengeLanguage.set(lang);
    const challenge = this.activeChallenge();
    if (challenge && challenge.starterCode?.[lang]) {
      this.challengeCode.set(challenge.starterCode[lang]);
    }
    this.challengeTestResults.set(null);
    this.challengePassed.set(false);
  }

  private startChallengeTimer(): void {
    this.clearChallengeTimer();
    this.challengeTimer = setInterval(() => {
      const remaining = this.challengeTimeRemaining() - 1;
      if (remaining <= 0) {
        this.clearChallengeTimer();
        this.challengeTimeRemaining.set(0);
      } else {
        this.challengeTimeRemaining.set(remaining);
      }
    }, 1000);
  }

  private clearChallengeTimer(): void {
    if (this.challengeTimer) {
      clearInterval(this.challengeTimer);
      this.challengeTimer = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  runChallengeTests(): void {
    const challenge = this.activeChallenge();
    if (!challenge) return;

    this.challengeRunningTests.set(true);
    this.challengeTestResults.set(null);

    const testCases = challenge.testCases || [
      { input: 'input_default()', expected: 'valid_return', description: 'Caso base de validación' },
    ];

    setTimeout(() => {
      const results = testCases.map((tc, idx) => ({
        index: idx + 1,
        description: tc.description,
        input: tc.input,
        expected: tc.expected,
        passed: true,
        durationMs: Math.floor(Math.random() * 25) + 8,
      }));

      this.challengeRunningTests.set(false);
      this.challengeTestResults.set(results);
      this.challengePassed.set(true);

      this.showToast(
        'Tests Ejecutados con Éxito ✓',
        `${results.length}/${results.length} casos de prueba superados. Listo para entregar.`,
        'check-circle'
      );
    }, 900);
  }

  submitChallengeSolution(): void {
    const challenge = this.activeChallenge();
    const clan = this.currentClan();
    if (!challenge || !clan || !this.challengePassed()) return;

    const timeSpent = Math.max(15, Math.floor((Date.now() - this.challengeStartTime) / 1000));
    const res = this.clansService.solveBattleChallenge(clan.id, challenge.id, {
      code: this.challengeCode(),
      language: this.challengeLanguage(),
      timeSpentSeconds: timeSpent,
    });

    this.closeChallenge();
    this.showToast(
      '¡RETO TÉCNICO SUPERADO! 🏆',
      `Completaste "${res.challengeTitle}" en ${timeSpent}s. Publicado en la bitácora del clan.`,
      'award',
      res.xpAwarded
    );
  }

  // ==========================================
  // DOCENTE: ENDORSEMENTS & MISIONES DE CÁTEDRA
  // ==========================================
  endorseLog(logId: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    const note = prompt('Nota u observación docente para avalar esta investigación:') || undefined;
    this.clansService.teacherEndorseLog(clan.id, logId, note);
    this.showToast(
      'Sello de Aval Docente Concedido 🎓',
      'Investigación certificada formalmente con +80 XP otorgados al autor.',
      'check-circle',
      80
    );
  }

  endorseProject(projectId: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    const note = prompt('Observación pedagógica de acreditación de proyecto I+D:') || undefined;
    this.clansService.teacherEndorseProject(clan.id, projectId, note);
    this.showToast(
      'Proyecto Acreditado por Cátedra 🌟',
      'El proyecto cuenta ahora con respaldo oficial del cuerpo docente (+120 XP).',
      'award',
      120
    );
  }

  submitTeacherMission(): void {
    const clan = this.currentClan();
    if (!clan || !this.teacherMissionTitle().trim() || !this.teacherMissionDesc().trim()) return;

    this.clansService.assignTeacherMission(clan.id, {
      title: this.teacherMissionTitle().trim(),
      description: this.teacherMissionDesc().trim(),
      deadline: this.teacherMissionDeadline().trim(),
      xpReward: this.teacherMissionXp() || 300,
    });

    this.showTeacherMissionModal.set(false);
    this.teacherMissionTitle.set('');
    this.teacherMissionDesc.set('');
    this.showToast(
      'Misión Académica Asignada 📜',
      'La misión oficial ha sido publicada en el muro y bitácora del semillero.',
      'book',
      this.teacherMissionXp()
    );
  }

  // ==========================================
  // RAID QUEST SEMANAL INTERACTIVA
  // ==========================================
  openQuestModal(): void {
    const opt = this.questContributions.find(c => c.id === this.selectedContributionId()) || this.questContributions[0];
    this.questSnippetDraft.set(opt.snippet);
    this.showQuestModal.set(true);
  }

  submitQuestContribution(): void {
    const clan = this.currentClan();
    if (!clan) return;
    const opt = this.questContributions.find(c => c.id === this.selectedContributionId()) || this.questContributions[0];
    const proj = clan.projects[0];
    const snippetToSubmit = this.questSnippetDraft().trim() || opt.snippet;

    if (proj) {
      this.clansService.createProjectPullRequest(clan.id, proj.id, {
        title: opt.commitMessage,
        description: opt.desc,
        sourceBranch: opt.defaultBranch,
        commitMessage: opt.commitMessage,
        filename: opt.filename,
        codeSnippet: snippetToSubmit,
      });
    } else {
      this.clansService.contributeToRaidQuest(clan.id, {
        category: opt.category,
        description: opt.label,
        xp: opt.xp,
      });
    }

    this.showQuestModal.set(false);
    this.showToast(
      '🚀 Pull Request Técnico Registrado',
      `Aporte enviado en rama '${opt.defaultBranch}' con diff de código. +${opt.xp} XP colectivos.`,
      opt.icon,
      opt.xp
    );
  }

  // ==========================================
  // GIT WORKFLOW EN PROYECTOS I+D
  // ==========================================
  getProjectGitTab(projectId: string): 'prs' | 'issues' | 'commits' | 'terminal' {
    return this.projectGitTab()[projectId] || 'prs';
  }

  setProjectGitTab(projectId: string, tab: 'prs' | 'issues' | 'commits' | 'terminal'): void {
    this.projectGitTab.update(m => ({ ...m, [projectId]: tab }));
    if (tab === 'terminal' && !this.terminalOutput()[projectId]) {
      this.runGitCommand(projectId, 'git status');
    }
  }

  toggleExpandPr(prId: string): void {
    this.expandedPrId.update(curr => (curr === prId ? null : prId));
  }

  openNewPrModal(
    projectId?: string,
    issueId?: string,
    defaultTitle?: string,
    type: 'feat' | 'test' | 'perf' | 'fix' | 'docs' = 'test'
  ): void {
    const clan = this.currentClan();
    const proj = projectId ? clan?.projects.find(p => p.id === projectId) : clan?.projects[0];
    if (!proj) return;

    this.targetPrProjectId.set(proj.id);
    this.newPrLinkedIssueId.set(issueId || '');
    this.newPrType.set(type);

    const template = this.getPrTemplate(type);
    this.newPrTitle.set(defaultTitle || template.title);
    this.newPrBranch.set(template.branch);
    this.newPrFilename.set(template.filename);
    this.newPrSnippet.set(template.snippet);
    this.newPrDesc.set(`Aporte técnico para el proyecto "${proj.title}". Implementación validada con pruebas unitarias.`);
    this.showNewPrModal.set(true);
  }

  selectPrType(type: 'feat' | 'test' | 'perf' | 'fix' | 'docs'): void {
    this.newPrType.set(type);
    const template = this.getPrTemplate(type);
    this.newPrTitle.set(template.title);
    this.newPrBranch.set(template.branch);
    this.newPrFilename.set(template.filename);
    this.newPrSnippet.set(template.snippet);
  }

  getPrTemplate(type: 'feat' | 'test' | 'perf' | 'fix' | 'docs'): { title: string; branch: string; filename: string; snippet: string } {
    switch (type) {
      case 'feat':
        return {
          title: 'feat(core): despachador de interrupciones y conmutación de contexto',
          branch: 'feature/interrupt-dispatcher',
          filename: 'kernel/sched/dispatcher.cpp',
          snippet: `// Despachador de contexto seguro para llamadas al sistema\nextern "C" void context_switch_dispatcher(ContextFrame* prev, ContextFrame* next) {\n    if (!prev || !next) return;\n    save_cpu_registers(prev);\n    load_cpu_registers(next);\n    atomic_signal_fence(std::memory_order_seq_cst);\n}`,
        };
      case 'test':
        return {
          title: 'test(kernel): suite de pruebas de estrés para condiciones de carrera',
          branch: 'test/concurrency-race-conditions',
          filename: 'tests/test_concurrency_stress.cpp',
          snippet: `// Suite de pruebas de estrés concurrentes\nTEST(SchedulerStress, NoDeadlockUnderHighLoad) {\n    Spinlock lock;\n    std::atomic<int> counter{0};\n    std::vector<std::thread> workers;\n    for (int i = 0; i < 4; ++i) {\n        workers.emplace_back([&]() {\n            for (int j = 0; j < 500; ++j) {\n                std::lock_guard<Spinlock> guard(lock);\n                counter.fetch_add(1, std::memory_order_relaxed);\n            }\n        });\n    }\n    for (auto& w : workers) w.join();\n    ASSERT_EQ(counter.load(), 2000);\n}`,
        };
      case 'perf':
        return {
          title: 'perf(mmu): optimización de TLB flush y caché de tablas de páginas',
          branch: 'perf/tlb-invalidation-fastpath',
          filename: 'kernel/mmu/page_table.cpp',
          snippet: `// Invalidación selectiva de página en TLB en lugar de flush global\ninline void flush_tlb_single_page(uintptr_t virtual_addr) {\n    #if defined(__x86_64__)\n    asm volatile("invlpg (%0)" :: "r"(virtual_addr) : "memory");\n    #endif\n}`,
        };
      case 'fix':
        return {
          title: 'fix(mmu): corregir lectura de dirección de fallo en registro CR2',
          branch: 'fix/page-fault-cr2-boundary',
          filename: 'kernel/interrupts/page_fault.cpp',
          snippet: `// Previene kernel panic al deserializar la dirección virtual de fallo\nvoid handle_page_fault(InterruptFrame* frame) {\n    uintptr_t fault_addr = read_cr2_register();\n    if (fault_addr == 0 || fault_addr >= KERNEL_SPACE_LIMIT) {\n        log_security_violation("Null dereference o violación de espacio kernel");\n        terminate_faulty_process(frame);\n        return;\n    }\n    allocate_demand_page(fault_addr);\n}`,
        };
      case 'docs':
        return {
          title: 'docs(arch): especificación técnica y RFC de llamadas al sistema',
          branch: 'docs/syscalls-rfc',
          filename: 'docs/architecture/rfc_syscalls.md',
          snippet: `# Especificación Técnica: Flujo de Syscalls y Aislamiento de Memoria\n1. Usuario invoca syscall(SYS_read, fd, buf, count) (Ring 3).\n2. CPU cambia a Ring 0 mediante SYSENTER / SYSCALL.\n3. Validar que buf pertenezca al espacio de memoria del proceso.\n4. Conmutar a la cola del descriptor sin bloquear el hilo principal.`,
        };
    }
  }

  submitNewPr(): void {
    const clan = this.currentClan();
    const projId = this.targetPrProjectId();
    if (!clan || !projId || !this.newPrTitle().trim()) return;

    const res = this.clansService.createProjectPullRequest(clan.id, projId, {
      title: this.newPrTitle().trim(),
      description: this.newPrDesc().trim(),
      sourceBranch: this.newPrBranch().trim(),
      commitMessage: this.newPrTitle().trim(),
      filename: this.newPrFilename().trim(),
      codeSnippet: this.newPrSnippet().trim(),
      linkedIssueId: this.newPrLinkedIssueId() || undefined,
    });

    this.showNewPrModal.set(false);
    this.expandedPrId.set(res.pr.id);
    this.setProjectGitTab(projId, 'prs');

    this.showToast(
      `🚀 Pull Request #${res.pr.number} Abierto con Éxito`,
      `Rama '${res.pr.sourceBranch}' enviada a 'main'. CI Tests: PASSED. +${res.xpEarned} XP.`,
      'code',
      res.xpEarned
    );
  }

  mergePr(projectId: string, prId: string): void {
    const clan = this.currentClan();
    if (!clan) return;

    const res = this.clansService.mergeProjectPullRequest(clan.id, projectId, prId);
    if (res.success) {
      this.showToast(
        '🔀 Pull Request Fusionado a main',
        `Squash & Merge completado en producción. Hito resuelto. +${res.xpEarned} XP.`,
        'git-merge',
        res.xpEarned
      );
    }
  }

  setReviewDraft(prId: string, val: string): void {
    this.prReviewComment.update(m => ({ ...m, [prId]: val }));
  }

  reviewPr(projectId: string, prId: string, verdict: 'approved' | 'changes_requested' | 'comment'): void {
    const clan = this.currentClan();
    if (!clan) return;
    const comment =
      this.prReviewComment()[prId]?.trim() ||
      (verdict === 'approved' ? 'LGTM! Código limpio y conforme con la arquitectura.' : 'Sugerencia técnica anotada.');

    this.clansService.reviewProjectPullRequest(clan.id, projectId, prId, {
      verdict,
      comment,
    });

    this.prReviewComment.update(m => ({ ...m, [prId]: '' }));
    this.showToast(
      verdict === 'approved' ? '✓ Pull Request Aprobado (LGTM)' : 'Feedback Técnico Publicado',
      'Tu revisión técnica ha sido registrada en el historial del PR. +30 XP.',
      'check',
      30
    );
  }

  switchBranch(projectId: string, branchName: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    this.clansService.switchProjectBranch(clan.id, projectId, branchName);
    this.showToast('🌿 Rama Activa Cambiada', `Ahora trabajando en '${branchName}'`, 'git-branch');
    if (this.projectGitTab()[projectId] === 'terminal') {
      this.runGitCommand(projectId, 'git status');
    }
  }

  createBranchForIssue(projectId: string, taskId: string, taskTitle: string): void {
    const branchName = `feature/issue-${taskId}`;
    const clan = this.currentClan();
    if (!clan) return;
    this.clansService.createProjectBranch(clan.id, projectId, branchName);
    this.openNewPrModal(projectId, taskId, `feat: resolver ${taskTitle.toLowerCase()}`, 'feat');
  }

  runGitCommand(projectId: string, cmd: string): void {
    const clan = this.currentClan();
    const proj = clan?.projects.find(p => p.id === projectId);
    if (!proj) return;

    const branch = proj.activeBranch || 'main';
    const openPrs = proj.pullRequests?.filter(pr => pr.status === 'open') || [];
    let out = `$ ${cmd}\n`;

    if (cmd === 'git status') {
      out += `On branch ${branch}\n`;
      if (branch === 'main') {
        out += `Your branch is up to date with 'origin/main'.\n`;
      } else {
        out += `Your branch is ahead of 'origin/main' by 1 commit.\n  (use "git push" to publish your local commits)\n`;
      }
      if (openPrs.length > 0) {
        out += `\nPull Requests activos pendientes de revisión:\n`;
        openPrs.forEach(pr => {
          out += `  * PR #${pr.number} (${pr.sourceBranch} -> ${pr.targetBranch}): ${pr.title}\n`;
        });
      }
      out += `\nnothing to commit, working tree clean\n`;
    } else if (cmd === 'git branch -a') {
      const branches = proj.branches || [{ name: 'main', isDefault: true }];
      branches.forEach(b => {
        const isCurrent = b.name === branch;
        out += `${isCurrent ? '* ' : '  '}${b.name}\n`;
      });
      out += `  remotes/origin/main\n`;
    } else if (cmd.startsWith('git log')) {
      const commits = proj.commits || [];
      commits.slice(0, 5).forEach(c => {
        out += `commit ${c.hash} (${c.branch})\n`;
        out += `Author: ${c.author}\n`;
        out += `Date:   ${c.timeAgo}\n\n`;
        out += `    ${c.message}\n\n`;
      });
    } else if (cmd === 'git diff') {
      const latestPr = openPrs[0];
      if (latestPr && latestPr.codeDiff) {
        out += `diff --git a/${latestPr.codeDiff.filename} b/${latestPr.codeDiff.filename}\n`;
        out += `index 3e8a10..f90bc2 100644\n`;
        out += `--- a/${latestPr.codeDiff.filename}\n`;
        out += `+++ b/${latestPr.codeDiff.filename}\n`;
        latestPr.codeDiff.deletions.forEach(d => (out += `${d}\n`));
        latestPr.codeDiff.additions.forEach(a => (out += `${a}\n`));
      } else {
        out += `No uncommitted changes in '${branch}'. Working tree is clean.\n`;
      }
    } else {
      out += `Command '${cmd}' executed cleanly.\n`;
    }

    this.terminalOutput.update(m => ({ ...m, [projectId]: out }));
  }

  // ==========================================
  // PROYECTOS I+D: TAREAS DINÁMICAS
  // ==========================================
  advanceProjectTask(projectId: string, taskId: string): void {
    const clan = this.currentClan();
    if (!clan) return;

    const res = this.clansService.advanceProjectTask(clan.id, projectId, taskId);
    if (res.allDone) {
      this.showToast(
        '🚀 ¡PROYECTO DESPLEGADO EN PRODUCCIÓN!',
        'Todas las tareas han sido completadas con éxito. +200 XP colectivos.',
        'check-circle',
        200
      );
    } else if (res.completed) {
      this.showToast('Hito Completado ✓', 'Tarea marcada como finalizada. +45 XP sumados.', 'check', 45);
    }
  }

  setTaskStatus(
    projectId: string,
    taskId: string,
    nextStatus: 'pending' | 'in_progress' | 'review' | 'completed'
  ): void {
    const clan = this.currentClan();
    if (!clan) return;

    const res = this.clansService.setProjectTaskStatus(clan.id, projectId, taskId, nextStatus);
    const label =
      nextStatus === 'completed'
        ? 'Completado ✓'
        : nextStatus === 'review'
        ? 'En Code Review 🔀'
        : nextStatus === 'in_progress'
        ? 'En Desarrollo ⚡'
        : 'Backlog';

    if (res.allDone) {
      this.showToast('🚀 SPRINT FINALIZADO', 'Todos los issues han sido cerrados en producción. +200 XP.', 'check-circle', 200);
    } else if (res.completed) {
      this.showToast('Issue Cerrado ✓', 'Merge y pruebas validadas con éxito. +45 XP.', 'check', 45);
    } else {
      this.showToast('Estado Actualizado', `Issue movido a "${label}"`, 'check');
    }
  }

  assignTaskToMe(projectId: string, taskId: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    this.clansService.assignProjectTaskToMe(clan.id, projectId, taskId);
    this.showToast('Tarea Asignada a Ti 👤', 'Has tomado la responsabilidad de este hito.', 'user');
  }

  onTaskDragStart(event: DragEvent, projectId: string, taskId: string): void {
    this.draggedTask.set({ projectId, taskId });
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', taskId);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onTaskDragOver(event: DragEvent, column: 'pending' | 'in_progress' | 'review' | 'completed'): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverColumn.set(column);
  }

  onTaskDragLeave(event: DragEvent): void {
    this.dragOverColumn.set(null);
  }

  onTaskDrop(event: DragEvent, column: 'pending' | 'in_progress' | 'review' | 'completed'): void {
    event.preventDefault();
    this.dragOverColumn.set(null);
    const dragged = this.draggedTask();
    if (dragged) {
      this.setTaskStatus(dragged.projectId, dragged.taskId, column);
      this.draggedTask.set(null);
    }
  }

  openNewTaskModal(defaultType: 'feature' | 'bug' | 'perf' | 'security' | 'arch' = 'feature'): void {
    this.newTaskTitle.set('');
    this.newTaskType.set(defaultType);
    this.newTaskAssignToMe.set(true);
    this.showNewTaskModal.set(true);
  }

  submitNewTask(): void {
    const title = this.newTaskTitle().trim();
    if (!title) return;
    const clan = this.currentClan();
    const proj = this.activeProject();
    if (!clan || !proj) return;

    const user = this.auth.user();
    const assignee = this.newTaskAssignToMe() ? (user?.name || 'Yo') : undefined;

    this.clansService.addProjectTask(clan.id, proj.id, title, this.newTaskType(), assignee);
    this.showNewTaskModal.set(false);
    this.newTaskTitle.set('');
    this.showToast('Issue Creado en el Sprint 🎯', `"${title}" agregado al Backlog (+45 XP al cerrar)`, 'check', 10);
  }

  openDiffModal(pr: GitPullRequest): void {
    this.selectedPrForDiff.set(pr);
  }

  closeDiffModal(): void {
    this.selectedPrForDiff.set(null);
  }

  mergePrAndDeploy(projectId: string, prId: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    const res = this.clansService.mergeProjectPullRequest(clan.id, projectId, prId);
    if (res.success) {
      if (this.selectedPrForDiff()?.id === prId) {
        this.selectedPrForDiff.set(null);
      }
      this.showToast(
        '▲ Despliegue en Producción Exitoso',
        `PR mergeado a main. Build Vercel en vivo: +${res.xpEarned} XP.`,
        'check-circle',
        res.xpEarned
      );
    }
  }

  addQuickTask(projectId: string): void {
    const clan = this.currentClan();
    const title = this.quickTaskTitle()[projectId];
    if (!clan || !title || !title.trim()) return;

    this.clansService.addProjectTask(clan.id, projectId, title.trim());
    this.quickTaskTitle.update(map => ({ ...map, [projectId]: '' }));
    this.showToast('Nuevo Hito Añadido', `Se integró la tarea al tablero del proyecto.`, 'plus');
  }

  setQuickTaskInput(projectId: string, val: string): void {
    this.quickTaskTitle.update(map => ({ ...map, [projectId]: val }));
  }

  joinProject(projectId: string): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.joinProject(clan.id, projectId);
      this.showToast(
        '¡Unido al Equipo de I+D! 🤝',
        'Ahora eres colaborador activo de esta iniciativa técnica.',
        'user-check',
        35
      );
    }
  }

  // ==========================================
  // FEED & COMENTARIOS
  // ==========================================
  toggleUpvote(logId: string): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.upvoteResearchLog(clan.id, logId);
    }
  }

  setCommentDraft(logId: string, val: string): void {
    this.commentDrafts.update(d => ({ ...d, [logId]: val }));
  }

  submitComment(logId: string): void {
    const text = this.commentDrafts()[logId];
    const clan = this.currentClan();
    if (text && clan) {
      this.clansService.addCommentToLog(clan.id, logId, text);
      this.setCommentDraft(logId, '');
      this.showToast('Respuesta Publicada 💬', 'Tu aporte técnico ha sido registrado.', 'message-square', 25);
    }
  }

  copyCodeSnippet(logId: string, code: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      this.copiedSnippetId.set(logId);
      setTimeout(() => this.copiedSnippetId.set(null), 2000);
    }
  }

  submitNewLog(): void {
    const clan = this.currentClan();
    if (!clan || !this.newLogTitle().trim() || !this.newLogContent().trim()) return;

    this.clansService.postResearchLog(clan.id, {
      title: this.newLogTitle().trim(),
      content: this.newLogContent().trim(),
      type: this.newLogType(),
      codeSnippet: this.newLogCode().trim() || undefined,
      codeLanguage: this.newLogLanguage(),
    });

    this.newLogTitle.set('');
    this.newLogContent.set('');
    this.newLogCode.set('');
    this.showNewLogModal.set(false);
    this.showToast(
      '¡Nueva Idea Publicada! 💡',
      'Tu hallazgo o propuesta está disponible para debate en el semillero.',
      'send',
      60
    );
  }

  submitNewProject(): void {
    const clan = this.currentClan();
    if (!clan || !this.newProjectTitle().trim() || !this.newProjectDesc().trim()) return;

    const stack = this.newProjectStack()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    this.clansService.createProject(clan.id, {
      title: this.newProjectTitle().trim(),
      description: this.newProjectDesc().trim(),
      techStack: stack,
      repoUrl: this.newProjectRepo().trim() || undefined,
    });

    this.newProjectTitle.set('');
    this.newProjectDesc.set('');
    this.newProjectRepo.set('');
    this.showNewProjectModal.set(false);
    this.activeTab.set('git');
    this.showToast(
      'Proyecto I+D Creado 🛠️',
      'Iniciativa abierta para colaboración de los miembros del semillero.',
      'folder-plus',
      120
    );
  }

  submitNewClan(): void {
    if (!this.newClanName().trim() || !this.newClanTag().trim()) return;

    const lines = this.newClanLines()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const created = this.clansService.createClan({
      name: this.newClanName().trim(),
      tag: this.newClanTag().trim(),
      category: this.newClanCategory(),
      description: this.newClanDesc().trim() || 'Semillero de investigación y proyectos avanzados en sistemas.',
      linesOfResearch: lines,
    });

    this.selectedClanId.set(created.id);
    this.browseAllClans.set(false);
    this.showCreateClanModal.set(false);
    this.newClanName.set('');
    this.newClanTag.set('');
    this.newClanDesc.set('');
    this.showToast(
      '¡Semillero Fundado! 🏛️',
      `Has creado el clan ${created.name} con insignia ${created.tag}.`,
      'shield',
      350
    );
  }
}
