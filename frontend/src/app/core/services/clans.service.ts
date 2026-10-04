import { Injectable, inject, signal, computed } from '@angular/core';
import { AuthService } from './auth.service';
import {
  StudyGroup,
  ResearchLogEntry,
  ResearchProject,
  ResearchComment,
  ResearchMember,
  ClanBattleChallenge,
} from '../models/clan';

const CLANS_STORAGE_PREFIX = 'syseng_study_groups_v3_';

@Injectable({ providedIn: 'root' })
export class ClansService {
  private auth = inject(AuthService);

  readonly studyGroups = signal<StudyGroup[]>([]);
  readonly initialized = signal<boolean>(false);

  /** Clan al que pertenece el usuario actualmente autenticado (computado en tiempo real) */
  readonly userClan = computed<StudyGroup | null>(() => {
    return this.studyGroups().find(g => g.isMember) || null;
  });

  /** Si el usuario tiene membresía activa en algún clan */
  readonly hasClan = computed<boolean>(() => {
    return this.userClan() !== null;
  });

  constructor() {
    this.loadClans();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('syseng_study_groups_')) {
          this.loadClans();
        }
      });
    }
  }

  private getStorageKey(): string {
    const user = this.auth.user();
    const id = user?.id ?? user?.email ?? 'guest';
    return `${CLANS_STORAGE_PREFIX}${id}`;
  }

  loadClans(): void {
    if (typeof window === 'undefined') return;
    try {
      const key = this.getStorageKey();
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.studyGroups.set(this.normalizeClans(parsed));
          this.initialized.set(true);
          return;
        }
      }
    } catch {
      // fallback
    }

    const defaults = this.getDefaultStudyGroups();
    this.studyGroups.set(defaults);
    this.saveToStorage(defaults);
    this.initialized.set(true);
  }

  private saveToStorage(groups: StudyGroup[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(groups));
      window.dispatchEvent(new CustomEvent('clan:changed', { detail: { count: groups.length } }));
    } catch (e) {
      console.warn('[ClansService] Error saving to localStorage', e);
    }
  }

  getClanById(id: string): StudyGroup | undefined {
    return this.studyGroups().find(g => g.id === id);
  }

  joinClan(clanId: string): void {
    const user = this.auth.user();
    const userName = user?.name || 'Estudiante';
    const updated = this.studyGroups().map(group => {
      if (group.id === clanId) {
        const alreadyMember = group.researchers.some(r => r.name === userName || r.isCurrentUser);
        const researchers = alreadyMember
          ? group.researchers.map(r => (r.name === userName ? { ...r, isCurrentUser: true } : r))
          : [
              ...group.researchers,
              {
                id: `u_${Date.now()}`,
                name: userName,
                role: 'Investigador Junior',
                level: 3,
                contributionsCount: 1,
                xpContributed: 120,
                isCurrentUser: true,
              },
            ];

        const newXp = group.currentXp + 150;
        const streak = group.streakDays === 0 ? 1 : group.streakDays;

        return {
          ...group,
          isMember: true,
          membersCount: group.membersCount + (alreadyMember ? 0 : 1),
          researchers,
          streakDays: streak,
          currentXp: newXp,
          recentLogs: [
            {
              author: userName,
              message: 'Se unió formalmente al semillero de investigación.',
              timeAgo: 'hace un momento',
            },
            ...group.recentLogs,
          ].slice(0, 8),
        };
      } else {
        // En este modelo, el usuario solo pertenece a 1 clan a la vez (eje principal)
        return {
          ...group,
          isMember: false,
          researchers: group.researchers.map(r => ({ ...r, isCurrentUser: false })),
        };
      }
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  leaveClan(clanId: string): void {
    const user = this.auth.user();
    const userName = user?.name || 'Estudiante';
    const updated = this.studyGroups().map(group => {
      if (group.id === clanId) {
        return {
          ...group,
          isMember: false,
          membersCount: Math.max(1, group.membersCount - 1),
          researchers: group.researchers.filter(r => r.name !== userName && !r.isCurrentUser),
        };
      }
      return group;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  createClan(data: {
    name: string;
    tag: string;
    category: string;
    description: string;
    linesOfResearch: string[];
  }): StudyGroup {
    const user = this.auth.user();
    const userName = user?.name || 'Director Fundador';
    const id = data.tag.toLowerCase().replace(/[^a-z0-9]/g, '') || `clan_${Date.now()}`;
    const cleanTag = data.tag.startsWith('[') ? data.tag : `[${data.tag.toUpperCase()}]`;

    const newClan: StudyGroup = {
      id,
      name: data.name,
      tag: cleanTag,
      category: data.category,
      description: data.description,
      linesOfResearch: data.linesOfResearch.length > 0 ? data.linesOfResearch : ['Investigación y Desarrollo de Sistemas'],
      membersCount: 1,
      streakDays: 1,
      level: 1,
      levelTitle: 'Semillero Inicial',
      currentXp: 350,
      nextLevelXp: 1000,
      weeklyChallenge: {
        title: 'Completar 3 lecciones técnicas y publicar la primera idea',
        xpReward: 300,
        completed: false,
      },
      weeklyQuest: {
        title: 'Ronda de Calibración de Clan',
        description: 'Superar 10 retos o lecciones acumuladas entre los miembros.',
        targetCount: 10,
        currentCount: 1,
        xpReward: 500,
        completed: false,
      },
      clanPerks: ['+5% Multiplicador de XP', 'Firma [TAG] en el Ranking Global'],
      recentLogs: [
        {
          author: userName,
          message: 'Fundó el semillero de investigación.',
          timeAgo: 'hace un momento',
        },
      ],
      projects: [],
      researchFeed: [
        {
          id: `feed_${Date.now()}`,
          author: userName,
          authorRole: 'Director de Semillero',
          type: 'propuesta',
          title: `Líneas de investigación abiertas en ${cleanTag}`,
          content: data.description,
          upvotes: 1,
          comments: [],
          timeAgo: 'hace un momento',
          isCurrentUser: true,
        },
      ],
      libraryPapers: [],
      upcomingSessions: [],
      researchers: [
        {
          id: `lead_${Date.now()}`,
          name: userName,
          role: 'Director de Semillero',
          level: 5,
          contributionsCount: 1,
          xpContributed: 350,
          isCurrentUser: true,
        },
      ],
      battleChallenges: [
        {
          id: 'bat_1',
          title: 'Optimización de Memoria en Estructuras Dinámicas',
          difficulty: 'medium',
          category: 'C++ / Algoritmos',
          description: 'Diseñar una cola de prioridad con costo de inserción en O(log n) y memoria compacta.',
          timeLimitMinutes: 45,
          xpReward: 250,
          completedCount: 0,
        },
      ],
      isMember: true,
      userRole: 'founder',
    };

    // Al crear un clan, se convierte en el clan activo del usuario
    const updated = [
      newClan,
      ...this.studyGroups().map(g => ({ ...g, isMember: false })),
    ];

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
    return newClan;
  }

  postResearchLog(clanId: string, log: {
    title: string;
    content: string;
    type: 'hallazgo' | 'pregunta' | 'paper' | 'benchmark' | 'propuesta';
    codeSnippet?: string;
    codeLanguage?: string;
  }): void {
    const user = this.auth.user();
    const userName = user?.name || 'Investigador';

    const newEntry: ResearchLogEntry = {
      id: `entry_${Date.now()}`,
      author: userName,
      authorRole: 'Investigador Activo',
      type: log.type,
      title: log.title,
      content: log.content,
      codeSnippet: log.codeSnippet,
      codeLanguage: log.codeLanguage || 'typescript',
      upvotes: 1,
      hasUpvoted: true,
      comments: [],
      timeAgo: 'hace un momento',
      isCurrentUser: true,
    };

    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const nextXp = g.currentXp + 60;
        return {
          ...g,
          currentXp: nextXp,
          researchFeed: [newEntry, ...g.researchFeed],
          recentLogs: [
            { author: userName, message: `Publicó una nueva idea: "${log.title.slice(0, 30)}..."`, timeAgo: 'hace un momento' },
            ...g.recentLogs,
          ].slice(0, 8),
          researchers: g.researchers.map(r =>
            r.isCurrentUser || r.name === userName
              ? { ...r, contributionsCount: r.contributionsCount + 1, xpContributed: r.xpContributed + 60 }
              : r
          ),
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  upvoteResearchLog(clanId: string, logId: string): void {
    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const feed = g.researchFeed.map(entry => {
          if (entry.id === logId) {
            const up = entry.hasUpvoted ? entry.upvotes - 1 : entry.upvotes + 1;
            return {
              ...entry,
              upvotes: Math.max(0, up),
              hasUpvoted: !entry.hasUpvoted,
            };
          }
          return entry;
        });
        return {
          ...g,
          currentXp: g.currentXp + 10,
          researchFeed: feed,
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  addCommentToLog(clanId: string, logId: string, commentText: string): void {
    if (!commentText.trim()) return;
    const user = this.auth.user();
    const userName = user?.name || 'Compañero';

    const newComment: ResearchComment = {
      id: `c_${Date.now()}`,
      author: userName,
      text: commentText.trim(),
      timeAgo: 'hace un momento',
      isCurrentUser: true,
    };

    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const feed = g.researchFeed.map(entry => {
          if (entry.id === logId) {
            return {
              ...entry,
              comments: [...entry.comments, newComment],
            };
          }
          return entry;
        });
        return {
          ...g,
          currentXp: g.currentXp + 20,
          researchFeed: feed,
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  createProject(clanId: string, data: {
    title: string;
    description: string;
    techStack: string[];
    repoUrl?: string;
  }): void {
    const user = this.auth.user();
    const userName = user?.name || 'Líder del Proyecto';

    const newProj: ResearchProject = {
      id: `proj_${Date.now()}`,
      title: data.title,
      description: data.description,
      leadResearcher: userName,
      status: 'propuesta',
      techStack: data.techStack.length > 0 ? data.techStack : ['TypeScript', 'Node.js'],
      repoUrl: data.repoUrl,
      membersJoined: [userName],
      tasks: [
        { id: 't1', title: 'Diseñar arquitectura modular y diagrama de componentes', completed: false, assignedTo: userName },
        { id: 't2', title: 'Configurar entorno de desarrollo y pipeline CI/CD', completed: false },
        { id: 't3', title: 'Implementar prueba de concepto (PoC)', completed: false },
      ],
      createdAt: 'hace un momento',
    };

    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        return {
          ...g,
          currentXp: g.currentXp + 120,
          projects: [newProj, ...g.projects],
          recentLogs: [
            { author: userName, message: `Creó el proyecto de I+D: "${data.title}"`, timeAgo: 'hace un momento' },
            ...g.recentLogs,
          ].slice(0, 8),
          researchers: g.researchers.map(r =>
            r.isCurrentUser || r.name === userName
              ? { ...r, contributionsCount: r.contributionsCount + 1, xpContributed: r.xpContributed + 120 }
              : r
          ),
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  toggleProjectTask(clanId: string, projectId: string, taskId: string): void {
    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const projs = g.projects.map(p => {
          if (p.id === projectId && p.tasks) {
            const tasks = p.tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
            const allDone = tasks.every(t => t.completed);
            return {
              ...p,
              tasks,
              status: allDone ? ('concluido' as const) : ('en_progreso' as const),
            };
          }
          return p;
        });
        return { ...g, currentXp: g.currentXp + 40, projects: projs };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  joinProject(clanId: string, projectId: string): void {
    const user = this.auth.user();
    const userName = user?.name || 'Colaborador';

    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const projs = g.projects.map(p => {
          if (p.id === projectId && !p.membersJoined.includes(userName)) {
            return {
              ...p,
              status: p.status === 'propuesta' ? ('en_progreso' as const) : p.status,
              membersJoined: [...p.membersJoined, userName],
            };
          }
          return p;
        });
        return {
          ...g,
          projects: projs,
          currentXp: g.currentXp + 30,
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  completeQuestContribution(clanId: string, amount: number = 1): void {
    const updated = this.studyGroups().map(g => {
      if (g.id === clanId) {
        const quest = g.weeklyQuest;
        const next = Math.min(quest.targetCount, quest.currentCount + amount);
        const justFinished = next >= quest.targetCount && !quest.completed;
        return {
          ...g,
          currentXp: g.currentXp + (justFinished ? quest.xpReward : amount * 25),
          weeklyQuest: {
            ...quest,
            currentCount: next,
            completed: next >= quest.targetCount,
          },
        };
      }
      return g;
    });

    this.studyGroups.set(updated);
    this.saveToStorage(updated);
  }

  private normalizeClans(groups: any[]): StudyGroup[] {
    const defaults = this.getDefaultStudyGroups();
    const defaultMap = new Map(defaults.map(d => [d.id, d]));

    return groups.map(g => {
      const fallback = defaultMap.get(g.id);
      return {
        id: g.id || fallback?.id || 'clan',
        name: g.name || fallback?.name || 'Clan',
        tag: g.tag || fallback?.tag || '[CLAN]',
        category: g.category || fallback?.category || 'general',
        description: g.description || fallback?.description || '',
        linesOfResearch: Array.isArray(g.linesOfResearch) ? g.linesOfResearch : (fallback?.linesOfResearch || []),
        membersCount: typeof g.membersCount === 'number' ? g.membersCount : (fallback?.membersCount || 1),
        streakDays: typeof g.streakDays === 'number' ? g.streakDays : (fallback?.streakDays || 1),
        level: typeof g.level === 'number' ? g.level : (fallback?.level || 1),
        levelTitle: g.levelTitle || fallback?.levelTitle || 'Semillero Inicial',
        currentXp: typeof g.currentXp === 'number' ? g.currentXp : (fallback?.currentXp || 350),
        nextLevelXp: typeof g.nextLevelXp === 'number' ? g.nextLevelXp : (fallback?.nextLevelXp || 1000),
        weeklyChallenge: g.weeklyChallenge || fallback?.weeklyChallenge || {
          title: 'Superar reto de código semanal',
          xpReward: 300,
          completed: false,
        },
        weeklyQuest: g.weeklyQuest || fallback?.weeklyQuest || {
          title: 'Meta Semanal de Cátedra',
          description: 'Resolver 10 lecciones y retos entre los miembros del clan.',
          targetCount: 10,
          currentCount: 4,
          xpReward: 500,
          completed: false,
        },
        clanPerks: Array.isArray(g.clanPerks) ? g.clanPerks : (fallback?.clanPerks || []),
        recentLogs: Array.isArray(g.recentLogs) ? g.recentLogs : (fallback?.recentLogs || []),
        projects: Array.isArray(g.projects) ? g.projects : (fallback?.projects || []),
        researchFeed: Array.isArray(g.researchFeed) ? g.researchFeed : (fallback?.researchFeed || []),
        libraryPapers: Array.isArray(g.libraryPapers) ? g.libraryPapers : (fallback?.libraryPapers || []),
        upcomingSessions: Array.isArray(g.upcomingSessions) ? g.upcomingSessions : (fallback?.upcomingSessions || []),
        researchers: Array.isArray(g.researchers) ? g.researchers : (fallback?.researchers || []),
        battleChallenges: Array.isArray(g.battleChallenges) ? g.battleChallenges : (fallback?.battleChallenges || []),
        isMember: Boolean(g.isMember),
        userRole: g.userRole || fallback?.userRole || 'researcher',
      };
    });
  }

  getDefaultStudyGroups(): StudyGroup[] {
    return [
      {
        id: 'krnl',
        name: 'Kernel & C++ Systems Hackers',
        tag: '[KRNL]',
        category: 'systems',
        description: 'Estudio intensivo de llamadas POSIX, memoria virtual, concurrencia de bajo nivel y arquitectura de micro-kernels.',
        linesOfResearch: ['Gestión de Memoria y Paginación x86_64', 'Concurrencia Lock-Free & Atomics', 'Llamadas POSIX & Observabilidad eBPF'],
        membersCount: 4,
        streakDays: 4,
        level: 3,
        levelTitle: 'Laboratorio I+D de Sistemas',
        currentXp: 3450,
        nextLevelXp: 5000,
        weeklyChallenge: { title: 'Implementar un Thread Pool en C++20 con mutex POSIX', xpReward: 350, completed: false },
        weeklyQuest: {
          title: 'Operación Núcleo Seguro',
          description: 'Resolver 8 retos de llamadas al sistema o bajo nivel en la plataforma.',
          targetCount: 8,
          currentCount: 5,
          xpReward: 600,
          completed: false,
        },
        clanPerks: [
          '+15% XP en cursos de Sistemas Operativos',
          'Insignia de Clan Dorada [KRNL] en el Leaderboard',
          'Hasta 5 Proyectos Concurrentes de I+D',
        ],
        recentLogs: [
          { author: 'Director Cátedra Sistemas (Lvl 16)', message: 'Abrió la convocatoria de investigación del clan.', timeAgo: 'hace 1d' },
          { author: 'Alex Torres', message: 'Completó el benchmark de Mutex vs Spinlock.', timeAgo: 'hace 6h' },
        ],
        projects: [
          {
            id: 'krnl_p1',
            title: 'Micro-Kernel Modular y Planificador Round-Robin',
            description: 'Desarrollo de un núcleo básico modular en C++20 con soporte para interrupciones de temporizador y conmutación de contexto.',
            techStack: ['C++20', 'Assembly x86', 'QEMU', 'CMake'],
            status: 'en_progreso',
            leadResearcher: 'Director Cátedra Sistemas',
            membersJoined: ['Director Cátedra Sistemas', 'Alex Torres'],
            tasks: [
              { id: 'tk1', title: 'Rutina de interrupción de timer en Assembly x86', completed: true, assignedTo: 'Director Cátedra' },
              { id: 'tk2', title: 'Cola de estados de procesos (Ready, Running, Blocked)', completed: true, assignedTo: 'Alex Torres' },
              { id: 'tk3', title: 'Implementar algoritmo Round-Robin con quantum de 10ms', completed: false, assignedTo: 'Alex Torres' },
            ],
            repoUrl: 'https://github.com/syseng-krnl/microkernel-prototype',
            createdAt: 'hace 3d',
          },
        ],
        researchFeed: [
          {
            id: 'krnl_rf1',
            author: 'Director Cátedra Sistemas',
            authorRole: 'Director de Semillero',
            type: 'benchmark',
            title: 'Medición de latencia: Mutex vs Spinlock en secciones críticas < 50ns',
            content: 'Realizamos 10M de operaciones concurrentes. En secciones críticas breves sin I/O, el spinlock con CPU pause disminuye la latencia en 34% al evitar el context switch al kernel de Linux.',
            codeSnippet: `// Loop de spinlock con mitigación de bus de memoria en x86\nwhile (lock.test_and_set(std::memory_order_acquire)) {\n    #if defined(__x86_64__)\n    __builtin_ia32_pause();\n    #endif\n}`,
            codeLanguage: 'cpp',
            upvotes: 6,
            hasUpvoted: false,
            comments: [
              { id: 'c1', author: 'Mentor Técnico', text: 'Excelente mitigación; previene que el bus del procesador se sature con cache line invalidations.', timeAgo: 'hace 5h' },
            ],
            timeAgo: 'hace 1d',
          },
          {
            id: 'krnl_rf2',
            author: 'Alex Torres',
            authorRole: 'Investigador Junior',
            type: 'hallazgo',
            title: 'Análisis de asignación de memoria: slab allocator vs malloc tradicional',
            content: 'Probamos un slab allocator para objetos fijos de 64 bytes. El tiempo de asignación fue 4.2x más rápido y con fragmentación externa casi nula en comparación con glibc malloc.',
            codeSnippet: `void* buf = slab_alloc(&packet_cache);\n// Retorno inmediato en O(1) tiempo constante`,
            codeLanguage: 'cpp',
            upvotes: 4,
            hasUpvoted: false,
            comments: [],
            timeAgo: 'hace 3h',
          },
        ],
        libraryPapers: [
          {
            id: 'krnl_lp1',
            title: 'The Design and Implementation of the FreeBSD Operating System',
            authors: 'McKusick, Neville-Neil, Watson',
            doiOrUrl: 'https://www.freebsd.org/doc/',
            summary: 'Texto fundamental sobre arquitectura de kernels monolíticos modernos, subsistema de memoria virtual y SMP.',
            addedBy: 'Director Cátedra',
            tags: ['Kernel', 'Virtual Memory', 'SMP'],
          },
        ],
        upcomingSessions: [
          {
            id: 'krnl_us1',
            title: 'Coloquio Semanal: Análisis de Concurrencia y Detección de Deadlocks',
            dateStr: 'Jueves 18:00 UTC',
            topic: 'Revisión práctica con ThreadSanitizer y análisis de grafos de espera (Wait-For Graph).',
            speaker: 'Director Cátedra Sistemas',
            attendeesCount: 4,
            userAttending: false,
          },
        ],
        researchers: [
          { id: 'm1', name: 'Director Cátedra Sistemas', role: 'Director de Semillero', level: 16, contributionsCount: 14, xpContributed: 1850 },
          { id: 'm2', name: 'Alex Torres', role: 'Investigador Principal', level: 8, contributionsCount: 7, xpContributed: 980 },
          { id: 'm3', name: 'Laura Cifuentes', role: 'Investigadora Junior', level: 5, contributionsCount: 4, xpContributed: 620 },
        ],
        battleChallenges: [
          {
            id: 'krnl_bat1',
            title: 'Speedcoding: Cola Circular Lock-Free (SPSC)',
            difficulty: 'hard',
            category: 'Concurrencia C++',
            description: 'Implementar un buffer circular de un solo productor y un solo consumidor sin bloqueos usando atomic head/tail.',
            timeLimitMinutes: 30,
            xpReward: 350,
            completedCount: 2,
          },
          {
            id: 'krnl_bat2',
            title: 'Detección de Deadlocks en Matrices de Grafos',
            difficulty: 'medium',
            category: 'Algoritmos & SO',
            description: 'Escribir una función que detecte si un sistema de recursos entra en abrazo mortal (algoritmo del Banquero).',
            timeLimitMinutes: 25,
            xpReward: 200,
            completedCount: 4,
          },
        ],
        isMember: false,
      },
      {
        id: 'algo',
        name: 'Clan de Algoritmos & Grafos',
        tag: '[ALGO]',
        category: 'algorithms',
        description: 'Resolución de problemas de alta complejidad algorítmica, árboles balanceados y optimización combinatoria.',
        linesOfResearch: ['Algoritmos de Enrutamiento en Grafos Masivos', 'Estructuras de Datos Auto-Balanceadas', 'Programación Dinámica Avanzada'],
        membersCount: 5,
        streakDays: 3,
        level: 2,
        levelTitle: 'Célula de Algoritmia Avanzada',
        currentXp: 1800,
        nextLevelXp: 3000,
        weeklyChallenge: { title: 'Calcular Camino Más Corto con Dijkstra sobre Grafos', xpReward: 280, completed: false },
        weeklyQuest: {
          title: 'Desafío de Optimización Topológica',
          description: 'Resolver 10 ejercicios de árboles y grafos en lecciones.',
          targetCount: 10,
          currentCount: 6,
          xpReward: 450,
          completed: false,
        },
        clanPerks: ['+10% XP en Cursos de Algoritmos', 'Insignia [ALGO] en Perfil'],
        recentLogs: [{ author: 'Director Cátedra Algoritmia (Lvl 15)', message: 'Publicó el reto de optimización de grafos.', timeAgo: 'hace 2d' }],
        projects: [
          {
            id: 'algo_p1',
            title: 'Motor de Búsqueda de Caminos Multimodal con A* y Contraction Hierarchies',
            description: 'Optimización de consultas de distancias mínimas en redes topológicas a gran escala.',
            techStack: ['Python', 'C++', 'Graph Theory'],
            status: 'en_progreso',
            leadResearcher: 'Director Cátedra Algoritmia',
            membersJoined: ['Director Cátedra Algoritmia'],
            tasks: [
              { id: 'at1', title: 'Implementar A* con heurística euclidiana y Manhattan', completed: true },
              { id: 'at2', title: 'Preprocesamiento de grafos para contracción de nodos de grado 2', completed: false },
            ],
            createdAt: 'hace 5d',
          },
        ],
        researchFeed: [
          {
            id: 'algo_rf1',
            author: 'Director Cátedra Algoritmia',
            authorRole: 'Director de Semillero',
            type: 'hallazgo',
            title: 'Balanceo AVL en O(log n) con rotaciones dobles compactas',
            content: 'Implementamos una versión compacta de rotaciones LR y RL que evita llamadas intermedias redundantes. El factor de balance se recalcula en O(1) tiempo constante.',
            upvotes: 5,
            hasUpvoted: false,
            comments: [],
            timeAgo: 'hace 2d',
          },
        ],
        libraryPapers: [
          {
            id: 'algo_lp1',
            title: 'Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks',
            authors: 'Geisberger et al.',
            doiOrUrl: 'https://doi.org/10.1007/978-3-540-68552-4_24',
            summary: 'Preprocesamiento de grafos para acelerar consultas de Dijkstra en órdenes de magnitud.',
            addedBy: 'Director Cátedra Algoritmia',
            tags: ['Grafos', 'A*', 'Dijkstra'],
          },
        ],
        upcomingSessions: [
          {
            id: 'algo_us1',
            title: 'Seminario: Complejidad Amortizada y Conjuntos Disjuntos (Union-Find)',
            dateStr: 'Miércoles 19:00 UTC',
            topic: 'Demostración de la función inversa de Ackermann en tiempo casi lineal.',
            speaker: 'Director Cátedra Algoritmia',
            attendeesCount: 5,
            userAttending: false,
          },
        ],
        researchers: [
          { id: 'al1', name: 'Director Cátedra Algoritmia', role: 'Director de Semillero', level: 15, contributionsCount: 9, xpContributed: 1100 },
          { id: 'al2', name: 'Mateo Vargas', role: 'Investigador', level: 7, contributionsCount: 4, xpContributed: 700 },
        ],
        battleChallenges: [
          {
            id: 'algo_bat1',
            title: 'Duelo: Árbol de Segmentos con Lazy Propagation',
            difficulty: 'hard',
            category: 'Estructuras de Datos',
            description: 'Actualización en rango y consulta en rango en O(log n) sin TLE.',
            timeLimitMinutes: 40,
            xpReward: 300,
            completedCount: 3,
          },
        ],
        isMember: false,
      },
      {
        id: 'arch',
        name: 'Arquitectura Backend & APIs Resilientes',
        tag: '[ARCH]',
        category: 'backend',
        description: 'Diseño de microservicios resilientes, bases de datos distribuidas, mensajería asíncrona y alta disponibilidad.',
        linesOfResearch: ['Patrones de Resiliencia: Circuit Breaker y Retry con Jitter', 'Arquitecturas Event-Driven & Kafka', 'Consistencia Eventual en Sistemas Distribuidos'],
        membersCount: 6,
        streakDays: 5,
        level: 4,
        levelTitle: 'Centro de Arquitectura Enterprise',
        currentXp: 4800,
        nextLevelXp: 6000,
        weeklyChallenge: { title: 'Implementar Circuit Breaker con Redis y fallback determinista', xpReward: 320, completed: false },
        weeklyQuest: {
          title: 'Resiliencia Total',
          description: 'Resolver 12 lecciones de Backend, SQL o Arquitectura.',
          targetCount: 12,
          currentCount: 9,
          xpReward: 700,
          completed: false,
        },
        clanPerks: ['+20% XP en Cursos de Backend & Bases de Datos', 'Insignia [ARCH] en Leaderboard', 'Acceso a Proyectos Enterprise'],
        recentLogs: [{ author: 'Director Cátedra Arquitectura (Lvl 17)', message: 'Publicó el paper sobre Outbox Pattern.', timeAgo: 'hace 1d' }],
        projects: [
          {
            id: 'arch_p1',
            title: 'Bus de Eventos Confiable con Patrón Transactional Outbox',
            description: 'Garantía de entrega At-Least-Once entre PostgreSQL y un broker de mensajería sin dual-write inconsistente.',
            techStack: ['TypeScript', 'PostgreSQL', 'Docker', 'Redis'],
            status: 'en_progreso',
            leadResearcher: 'Director Cátedra Arquitectura',
            membersJoined: ['Director Cátedra Arquitectura'],
            tasks: [
              { id: 'arch_t1', title: 'Crear tabla outbox_events con UUID y payload JSONB', completed: true },
              { id: 'arch_t2', title: 'Worker de polling con SELECT FOR UPDATE SKIP LOCKED', completed: true },
              { id: 'arch_t3', title: 'Manejo de reintentos y Dead Letter Queue (DLQ)', completed: false },
            ],
            createdAt: 'hace 6d',
          },
        ],
        researchFeed: [
          {
            id: 'arch_rf1',
            author: 'Director Cátedra Arquitectura',
            authorRole: 'Director de Semillero',
            type: 'paper',
            title: 'Por qué no usar 2PC (Two-Phase Commit) en Microservicios Modernos',
            content: 'El bloqueo de recursos durante la fase de Prepare genera colas de contención y puntos únicos de falla. La saga coreografiada con transacciones compensatorias es el estándar industrial.',
            upvotes: 8,
            hasUpvoted: false,
            comments: [],
            timeAgo: 'hace 1d',
          },
        ],
        libraryPapers: [
          {
            id: 'arch_lp1',
            title: 'Designing Data-Intensive Applications',
            authors: 'Martin Kleppmann',
            doiOrUrl: 'https://dataintensive.net/',
            summary: 'La referencia obligatoria para ingeniería de datos, replicación, particionamiento y consenso distribuido.',
            addedBy: 'Director Cátedra Arquitectura',
            tags: ['Distributed Systems', 'Replication', 'Consensus'],
          },
        ],
        upcomingSessions: [
          {
            id: 'arch_us1',
            title: 'Mesa Redonda: Rate Limiting Distribuido con Token Bucket en Redis',
            dateStr: 'Viernes 20:00 UTC',
            topic: 'Implementación con scripts Lua atómicos para evitar condiciones de carrera a 50k req/s.',
            speaker: 'Director Cátedra Arquitectura',
            attendeesCount: 6,
            userAttending: false,
          },
        ],
        researchers: [
          { id: 'ar1', name: 'Director Cátedra Arquitectura', role: 'Director de Semillero', level: 17, contributionsCount: 16, xpContributed: 2600 },
          { id: 'ar2', name: 'Valentina Restrepo', role: 'Lead Architect', level: 11, contributionsCount: 9, xpContributed: 1400 },
          { id: 'ar3', name: 'Carlos Mendoza', role: 'Investigador', level: 6, contributionsCount: 5, xpContributed: 800 },
        ],
        battleChallenges: [
          {
            id: 'arch_bat1',
            title: 'Reto de Resiliencia: Script Lua para Rate Limiter Atómico',
            difficulty: 'hard',
            category: 'Sistemas Distribuidos',
            description: 'Crear un algoritmo sliding window en Lua para Redis que maneje 100 req/min con 0 drift temporal.',
            timeLimitMinutes: 35,
            xpReward: 320,
            completedCount: 5,
          },
        ],
        isMember: false,
      },
      {
        id: 'sec',
        name: 'CyberSecurity & Exploit Analysis',
        tag: '[SEC]',
        category: 'security',
        description: 'Auditoría de seguridad en código fuente, sanitización estricta, criptografía aplicada y DevSecOps defensivo.',
        linesOfResearch: ['Auditoría Estática de Código (SAST) y OWASP Top 10', 'Criptografía Post-Cuántica y Manejo Seguro de Secretos', 'Hardening de Contenedores y Seguridad en CI/CD'],
        membersCount: 3,
        streakDays: 2,
        level: 2,
        levelTitle: 'Laboratorio DevSecOps',
        currentXp: 1650,
        nextLevelXp: 3000,
        weeklyChallenge: { title: 'Auditar y mitigar vulnerabilidad SSRF en cliente HTTP', xpReward: 300, completed: false },
        weeklyQuest: {
          title: 'Operación Blindaje Cibernético',
          description: 'Resolver 6 retos de validación y seguridad en la plataforma.',
          targetCount: 6,
          currentCount: 3,
          xpReward: 400,
          completed: false,
        },
        clanPerks: ['+10% XP en Retos de Seguridad', 'Insignia [SEC] en Perfil'],
        recentLogs: [{ author: 'Director Cátedra Ciberseguridad', message: 'Configuró el entorno de pruebas de sanitización.', timeAgo: 'hace 2d' }],
        projects: [
          {
            id: 'sec_p1',
            title: 'Linter SAST Automatizado para Reglas OWASP en TypeScript',
            description: 'Reglas de análisis estático con AST para detectar concatenación directa en SQL queries y tokens en memoria.',
            techStack: ['TypeScript', 'AST Parsing', 'Security SAST'],
            status: 'en_progreso',
            leadResearcher: 'Director Cátedra Ciberseguridad',
            membersJoined: ['Director Cátedra Ciberseguridad'],
            tasks: [
              { id: 'st1', title: 'Detector de raw SQL strings sin parametrizar', completed: true },
              { id: 'st2', title: 'Regla para validar flag HttpOnly y Secure en cookies', completed: false },
            ],
            createdAt: 'hace 4d',
          },
        ],
        researchFeed: [
          {
            id: 'sec_rf1',
            author: 'Director Cátedra Ciberseguridad',
            authorRole: 'Director de Semillero',
            type: 'benchmark',
            title: 'Argon2id vs bcrypt: Benchmark de resistencia ante ataques de GPU',
            content: 'Argon2id con costo de memoria de 64MB requiere más de 12GB de VRAM por intento paralelo, haciendo que la fuerza bruta con GPUs sea inviable en comparación con el espacio plano de bcrypt.',
            upvotes: 6,
            hasUpvoted: false,
            comments: [],
            timeAgo: 'hace 2d',
          },
        ],
        libraryPapers: [
          {
            id: 'sec_lp1',
            title: 'OWASP Application Security Verification Standard (ASVS 4.0)',
            authors: 'OWASP Foundation',
            doiOrUrl: 'https://owasp.org/www-project-application-security-verification-standard/',
            summary: 'Marco normativo para la verificación formal de controles de seguridad técnica en aplicaciones web.',
            addedBy: 'Director Cátedra Ciberseguridad',
            tags: ['OWASP', 'ASVS', 'AppSec'],
          },
        ],
        upcomingSessions: [
          {
            id: 'sec_us1',
            title: 'Laboratorio en Vivo: Análisis de Memory Corruption y Buffer Overflows',
            dateStr: 'Sábado 17:00 UTC',
            topic: 'Exploración de protecciones ASLR, canarios de pila (Stack Canaries) y mitigaciones con W^X.',
            speaker: 'Director Cátedra Ciberseguridad',
            attendeesCount: 3,
            userAttending: false,
          },
        ],
        researchers: [
          { id: 'sc1', name: 'Director Cátedra Ciberseguridad', role: 'Director de Semillero', level: 16, contributionsCount: 11, xpContributed: 1200 },
          { id: 'sc2', name: 'Daniela Soto', role: 'Investigadora AppSec', level: 6, contributionsCount: 4, xpContributed: 450 },
        ],
        battleChallenges: [
          {
            id: 'sec_bat1',
            title: 'Duelo: Evasión de Filtro WAF y Normalización Unicode',
            difficulty: 'hard',
            category: 'Ciberseguridad',
            description: 'Escribir un validador que detecte ataques de homógrafos y bypass de path traversal.',
            timeLimitMinutes: 30,
            xpReward: 300,
            completedCount: 1,
          },
        ],
        isMember: false,
      },
    ];
  }
}
