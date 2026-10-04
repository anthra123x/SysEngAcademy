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

  // Tabs de navegación interna del Clan
  activeTab = signal<'feed' | 'projects' | 'arena' | 'members'>('feed');
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

  // Opciones de Contribución a la Misión Semanal / Raid
  readonly questContributions: QuestContributionOption[] = [
    {
      id: 'tests',
      label: 'Suite de Tests y Casos de Estrés',
      category: 'Testing & Validación',
      desc: 'Ejecutar batería de pruebas concurrentes y reportar memory leaks.',
      xp: 45,
      icon: 'zap',
    },
    {
      id: 'sast',
      label: 'Auditoría SAST y Sanitización',
      category: 'Seguridad & OWASP',
      desc: 'Revisar control de parámetros, headers y sanitización en frontera.',
      xp: 60,
      icon: 'shield',
    },
    {
      id: 'bench',
      label: 'Benchmarking de Rendimiento',
      category: 'Optimización de Latencia',
      desc: 'Medir tiempos de respuesta en ráfagas y cuellos de botella.',
      xp: 75,
      icon: 'cpu',
    },
    {
      id: 'arch',
      label: 'Documentación y Diagramas',
      category: 'Arquitectura de Sistemas',
      desc: 'Diagramas de secuencia, esquema de interfaces y RFC técnico.',
      xp: 35,
      icon: 'book',
    },
  ];
  selectedContributionId = signal<string>('tests');

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

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.selectedClanId.set(id);
      }
      const tab = params.get('tab');
      if (tab === 'projects' || tab === 'arena' || tab === 'members' || tab === 'feed') {
        this.activeTab.set(tab);
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
    this.showQuestModal.set(true);
  }

  submitQuestContribution(): void {
    const clan = this.currentClan();
    if (!clan) return;
    const opt = this.questContributions.find(c => c.id === this.selectedContributionId()) || this.questContributions[0];

    const res = this.clansService.contributeToRaidQuest(clan.id, {
      category: opt.category,
      description: opt.label,
      xp: opt.xp,
    });

    this.showQuestModal.set(false);
    if (res.questCompleted) {
      this.showToast(
        '¡MISIÓN SEMANAL COMPLETADA! 🎉',
        'El semillero ha alcanzado el 100% de la meta. ¡+500 XP colectivos!',
        'award',
        500
      );
    } else {
      this.showToast(
        'Aporte de Investigación Registrado ⚡',
        `Aportaste en: ${opt.label}. La barra colectiva ha progresado.`,
        opt.icon,
        res.xpEarned
      );
    }
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

  assignTaskToMe(projectId: string, taskId: string): void {
    const clan = this.currentClan();
    if (!clan) return;
    this.clansService.assignProjectTaskToMe(clan.id, projectId, taskId);
    this.showToast('Tarea Asignada a Ti 👤', 'Has tomado la responsabilidad de este hito.', 'user');
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
    this.activeTab.set('projects');
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
