import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Challenge, CodelabStats, TestCaseModel } from './codelab.models';

const INITIAL_CHALLENGES: Challenge[] = [
  // 1. Featured Spotlight Challenge
  {
    id: 'ret-2041',
    slug: 'inversion-arbol-binario-limite-memoria-o1',
    title: 'Inversión de Árbol Binario con Límite de Memoria O(1)',
    description: 'Dado el nodo raíz de un árbol binario balanceado, invierte los subárboles izquierdo y derecho sin usar recursión profunda ni pilas auxiliares que violen la cota de memoria O(1) auxiliar (Algoritmo de Morris modificado).',
    difficulty: 'media',
    acceptanceRate: 64.2,
    xp: 50,
    category: 'estructuras',
    tags: ['#estructuras-de-datos', '#algoritmos'],
    languages: ['Python 3.12', 'C++20', 'Rust'],
    author: {
      name: 'Mateo',
      username: 'mateo_dev',
      role: 'Estudiante Semestre 6 • Ing. Sistemas',
      avatarInitial: 'M',
      isTopContributor: false,
    },
    status: 'pending',
    upvotes: 248,
    commentsCount: 39,
    isOfficial: false,
    isCommunity: true,
    testCasesCount: 14,
    testCases: [
      { input: '[4, 2, 7, 1, 3, 6, 9]', expected: '[4, 7, 2, 9, 6, 3, 1]', isHidden: false, label: 'Caso 1' },
      { input: '[2, 1, 3]', expected: '[2, 3, 1]', isHidden: false, label: 'Caso 2' },
      { input: '[]', expected: '[]', isHidden: true, label: 'Caso 3 (Borde: Vacío)' },
      { input: '[1]', expected: '[1]', isHidden: true, label: 'Caso 4 (Borde: Hoja)' },
    ],
    starterCode: {
      python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def invertTree(self, root: TreeNode) -> TreeNode:
        # Tu implementación con memoria O(1) auxiliar aquí
        pass
`,
      javascript: `/**
 * Definición de TreeNode
 * function TreeNode(val, left, right) {
 *   this.val = (val===undefined ? 0 : val)
 *   this.left = (left===undefined ? null : left)
 *   this.right = (right===undefined ? null : right)
 * }
 */
function invertTree(root) {
  // Escribe tu solución aquí
}
`,
      cpp: `#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        // Tu solución O(1) aquí
        return root;
    }
};
`
    },
    solutionPreview: {
      filename: 'solution_morris.py',
      benchmark: '1.84ms benchmark',
      passedCases: '14/14 superados',
      memoryMb: '14.1 MB (Top 98%)',
      code: `class Solution:
    def invertTreeMorris(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        curr = root
        while curr:
            # Swap left & right branches in place
            curr.left, curr.right = curr.right, curr.left
            curr = curr.right
        return root

# Test Case 01: [4, 2, 7, 1, 3, 6, 9] -> PASS (0.42ms)`,
    },
    publishedAt: 'Hace 5 horas',
  },

  // 2. Community: Raft Algorithm
  {
    id: 'ret-1082',
    slug: 'implementacion-algoritmo-raft-consenso',
    title: 'Implementación de Algoritmo Raft (Consenso Simplificado)',
    description: 'Diseña la máquina de estados de elección de líder y latidos (heartbeats) con tolerancia a particiones de red.',
    difficulty: 'dificil',
    acceptanceRate: 87.0,
    xp: 75,
    category: 'concurrencia',
    tags: ['#concurrencia', '#distribuidos'],
    languages: ['Go', 'Rust'],
    author: {
      name: 'Sofía',
      username: 'sofia_sys',
      role: 'Top Contribuidor',
      avatarInitial: 'S',
      isTopContributor: true,
    },
    status: 'pending',
    upvotes: 184,
    commentsCount: 31,
    isOfficial: false,
    isCommunity: true,
    testCasesCount: 28,
    testCases: [
      { input: 'nodes: 3, leader_fail: true', expected: 'NEW_LEADER_ELECTED: Term 2', isHidden: false },
      { input: 'nodes: 5, partition: [0,1]-[2,3,4]', expected: 'MAJORITY_QUORUM: TRUE', isHidden: false },
    ],
    starterCode: {
      go: `package main

type RaftNode struct {
    ID int
    CurrentTerm int
    VotedFor int
    IsLeader bool
}

func (r *RaftNode) RequestVote(candidateID int, term int) bool {
    // Implementa tu lógica de elección
    return false
}
`,
      python: `class RaftNode:
    def __init__(self, node_id: int):
        self.node_id = node_id
        self.term = 0
        self.is_leader = False

    def request_vote(self, candidate_id: int, term: int) -> bool:
        pass
`
    },
    publishedAt: 'Hace 2 días',
  },

  // 3. Official: Valid Parentheses in Restricted Memory
  {
    id: 'ret-0312',
    slug: 'validar-secuencia-parentesis-memoria-restringida',
    title: 'Validar Secuencia de Paréntesis en Memoria Restringida',
    description: "Determina si un flujo entrante de tokens '()[]{}' es balanceado con espacio auxiliar menor a 512 bytes.",
    difficulty: 'facil',
    acceptanceRate: 92.0,
    xp: 30,
    category: 'estructuras',
    tags: ['#pilas'],
    languages: ['Python', 'JavaScript'],
    author: {
      name: 'SysEng Faculty',
      username: 'faculty',
      role: 'Curaduría Oficial',
      isOfficial: true,
      avatarInitial: 'FAC',
    },
    status: 'solved',
    upvotes: 412,
    commentsCount: 56,
    isOfficial: true,
    isCommunity: false,
    testCasesCount: 18,
    testCases: [
      { input: '()[]{}', expected: 'true', isHidden: false },
      { input: '(]', expected: 'false', isHidden: false },
      { input: '([{}])', expected: 'true', isHidden: false },
      { input: '(((((', expected: 'false', isHidden: true },
    ],
    starterCode: {
      python: `def isValid(s: str) -> bool:
    # Escribe tu solución aquí
    return True
`,
      javascript: `function isValid(s) {
  // Retorna true si los paréntesis son válidos
  return true;
}
`
    },
    publishedAt: 'Semana 1',
  },

  // 4. Community/User: Round Robin Scheduler (Camilo's Creation)
  {
    id: 'ret-0845',
    slug: 'simulador-planificador-procesos-round-robin',
    title: 'Simulador de Planificador de Procesos Round Robin',
    description: 'Simula el cambio de contexto con un quantum de tiempo variante y calcula el turnaround time y waiting time promedio.',
    difficulty: 'media',
    acceptanceRate: 58.0,
    xp: 50,
    category: 'so',
    tags: ['#sistemas-operativos'],
    languages: ['C', 'C++'],
    author: {
      name: 'Camilo',
      username: 'camilo',
      role: 'Tú',
      avatarInitial: 'C',
      isCurrentUser: true,
    },
    status: 'my_creation',
    upvotes: 98,
    commentsCount: 19,
    isOfficial: false,
    isCommunity: true,
    testCasesCount: 20,
    testCases: [
      { input: 'quantum=2, burst=[5, 3, 1]', expected: 'AVG_WAITING: 4.33, AVG_TURNAROUND: 7.33', isHidden: false },
    ],
    starterCode: {
      cpp: `#include <vector>
#include <iostream>
using namespace std;

struct Process {
    int id;
    int burstTime;
    int remainingTime;
};

void roundRobin(vector<Process>& procs, int quantum) {
    // Tu implementación del planificador
}
`
    },
    publishedAt: 'Hace 3d',
  },

  // 5. Official: SQL Query Optimization
  {
    id: 'ret-0499',
    slug: 'optimizacion-consultas-sql-millones-registros',
    title: 'Optimización de Consultas SQL sobre Millones de Registros',
    description: 'Reescribe una consulta de agregación multi-JOIN con planes de ejecución EXPLAIN ANALYZE menores a 45ms en PostgreSQL.',
    difficulty: 'media',
    acceptanceRate: 71.0,
    xp: 45,
    category: 'bd',
    tags: ['#database', '#sql'],
    languages: ['PostgreSQL 16'],
    author: {
      name: 'SysEng DB Lab',
      username: 'db_lab',
      role: 'Curaduría Oficial',
      isOfficial: true,
      avatarInitial: 'DB',
    },
    status: 'pending',
    upvotes: 215,
    commentsCount: 44,
    isOfficial: true,
    isCommunity: false,
    testCasesCount: 15,
    testCases: [
      { input: 'SELECT count(*) FROM orders o JOIN users u ON o.user_id = u.id GROUP BY u.country', expected: 'ROWS: 48, EXEC_TIME_MS: 38.2', isHidden: false },
    ],
    starterCode: {
      sql: `-- Optimiza la siguiente consulta agregando los índices o subqueries requeridos
EXPLAIN ANALYZE
SELECT u.country, count(o.id) AS total_orders
FROM users u
INNER JOIN orders o ON o.user_id = u.id
WHERE o.created_at >= '2025-01-01'
GROUP BY u.country;
`
    },
    publishedAt: 'Semana 3',
  },

  // 6. Community: Lexer Mini-Pascal
  {
    id: 'ret-1420',
    slug: 'compilador-lexico-mini-pascal-automatas-finitos',
    title: 'Compilador Léxico Mini-Pascal con Autómatas Finitos Deterministas',
    description: 'Construye el analizador léxico que tokeniza identificadores, palabras reservadas y literales numéricos sin regex.',
    difficulty: 'dificil',
    acceptanceRate: 43.0,
    xp: 80,
    category: 'compiladores',
    tags: ['#compiladores', '#rust', 'Teoría de Autómatas'],
    languages: ['Rust', 'Python'],
    author: {
      name: 'Alex',
      username: 'alex_lang',
      role: 'Monitor Compiladores',
      avatarInitial: 'A',
      isMonitor: true,
    },
    status: 'pending',
    upvotes: 167,
    commentsCount: 28,
    isOfficial: false,
    isCommunity: true,
    testCasesCount: 32,
    testCases: [
      { input: 'program Test; begin var x := 42; end.', expected: 'TOKENS: [PROGRAM, ID(Test), SEMICOLON, BEGIN, VAR, ID(x), ASSIGN, INT(42), SEMICOLON, END, DOT]', isHidden: false },
    ],
    starterCode: {
      rust: `#[derive(Debug, PartialEq)]
enum Token {
    Program,
    Begin,
    End,
    Ident(String),
    Number(i64),
}

fn tokenize(source: &str) -> Vec<Token> {
    // Autómata Finito Determinista (AFD)
    Vec::new()
}
`
    },
    publishedAt: 'Hace 4 días',
  },
];

@Injectable({ providedIn: 'root' })
export class CodelabService {
  private readonly api = inject(ApiService);
  private readonly notificationSvc = inject(NotificationService);
  private readonly STORAGE_KEY = 'syseng_codelab_challenges_v1';

  // Signals for state
  readonly allChallenges = signal<Challenge[]>(this.loadChallenges());
  readonly activeTab = signal<'todos' | 'oficiales' | 'comunidad' | 'mis_retos' | 'mis_soluciones'>('todos');
  readonly searchQuery = signal<string>('');
  readonly selectedDifficulty = signal<string>('');
  readonly selectedLanguage = signal<string>('');
  readonly selectedCategory = signal<string>('');
  readonly selectedTrack = signal<string>('all');

  // Daily spotlight challenge
  readonly spotlightChallenge = computed(() => {
    const list = this.allChallenges();
    return list.find(c => c.isSpotlight) || list.find(c => c.id === 'ret-2041') || list[0];
  });

  // Filtered challenges reactive computed
  readonly filteredChallenges = computed(() => {
    let list = this.allChallenges();
    const tab = this.activeTab();
    const query = this.searchQuery().toLowerCase().trim();
    const diff = this.selectedDifficulty();
    const lang = this.selectedLanguage().toLowerCase();
    const cat = this.selectedCategory();
    const track = this.selectedTrack();

    // Tab filtering
    if (tab === 'oficiales') {
      list = list.filter(c => c.isOfficial);
    } else if (tab === 'comunidad') {
      list = list.filter(c => c.isCommunity);
    } else if (tab === 'mis_retos') {
      list = list.filter(c => c.author.isCurrentUser);
    } else if (tab === 'mis_soluciones') {
      list = list.filter(c => c.status === 'solved');
    }

    // Academic track filter
    if (track && track !== 'all') {
      if (track === 'sem1-3') {
        list = list.filter(c => c.category === 'algoritmos' || c.category === 'estructuras');
      } else if (track === 'sem4-5') {
        list = list.filter(c => c.category === 'so');
      } else if (track === 'sem6-7') {
        list = list.filter(c => c.category === 'concurrencia' || c.category === 'bd');
      } else if (track === 'sem8-10') {
        list = list.filter(c => c.category === 'compiladores');
      }
    }

    // Search query
    if (query) {
      list = list.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(t => t.toLowerCase().includes(query)) ||
        c.author.username.toLowerCase().includes(query) ||
        c.author.name.toLowerCase().includes(query) ||
        c.languages.some(l => l.toLowerCase().includes(query))
      );
    }

    // Difficulty filter
    if (diff) {
      list = list.filter(c => c.difficulty === diff);
    }

    // Language filter
    if (lang) {
      list = list.filter(c => c.languages.some(l => l.toLowerCase().includes(lang)));
    }

    // Category filter
    if (cat) {
      list = list.filter(c => c.category === cat);
    }

    return list;
  });

  // Global real-time metrics signal populated from PostgreSQL backend
  readonly stats = signal<CodelabStats>({
    totalStudents: 25,
    solvedToday: 0,
    solvedTodayTrend: '0 hoy',
    communityChallengesCount: 0,
    topRankUser: 'Por Disputar',
    topRankXp: 0,
    topRankPosition: 1,
    latencyMs: 0,
    sandboxHealthPercent: 99.98,
    podium: [],
    activityFeed: [],
  });

  // Tab counters computed
  readonly tabCounts = computed(() => {
    const challenges = this.allChallenges();
    return {
      todos: challenges.length,
      oficiales: challenges.filter(c => c.isOfficial).length,
      comunidad: challenges.filter(c => c.isCommunity).length,
      mis_retos: challenges.filter(c => c.author.isCurrentUser).length,
      mis_soluciones: challenges.filter(c => c.status === 'solved').length,
    };
  });

  constructor() {
    this.fetchChallengesFromApi();
    this.fetchLiveStats();
    this.initLiveSync();
  }

  fetchLiveStats(): void {
    this.api.get<CodelabStats>('/codelab/stats').subscribe({
      next: s => {
        if (s) {
          this.stats.set(s);
        }
      },
      error: () => {}
    });
  }

  fetchChallengesFromApi(): void {
    this.api.get<{ challenges: Challenge[]; stats?: CodelabStats }>('/codelab/challenges')
      .subscribe({
        next: res => {
          if (res?.challenges && res.challenges.length > 0) {
            this.allChallenges.set(res.challenges);
            this.saveChallenges(res.challenges);
          }
          if (res?.stats) {
            this.stats.set(res.stats);
          }
        },
        error: err => {
          console.warn('[CodeLab] Conexión local fallback (API backend offline):', err?.message);
        }
      });
  }

  private initLiveSync(): void {
    if (typeof window === 'undefined') return;

    // Periodic live sync polling (every 10 seconds) for real-time telemetry
    setInterval(() => {
      this.fetchLiveStats();
    }, 10000);

    // Live Server-Sent Events (SSE) connection
    try {
      const eventSource = new EventSource('/api/codelab/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && (data.podium || data.solvedToday)) {
            this.stats.set(data);
          }
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource.close();
      };
    } catch {}
  }

  private loadChallenges(): Challenge[] {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('No se pudo cargar retos desde localStorage:', err);
      }
    }
    return INITIAL_CHALLENGES;
  }

  private saveChallenges(challenges: Challenge[]): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(challenges));
      } catch (err) {
        console.warn('Error al guardar en localStorage:', err);
      }
    }
  }

  getChallengeBySlug(slug: string): Challenge | undefined {
    return this.allChallenges().find(c => c.slug === slug || c.id === slug);
  }

  fetchChallengeBySlug(slug: string): Observable<Challenge> {
    return this.api.get<Challenge>(`/codelab/challenges/${slug}`).pipe(
      tap(remote => {
        if (remote) {
          const list = this.allChallenges();
          const exists = list.some(c => c.id === remote.id || c.slug === remote.slug);
          if (exists) {
            this.allChallenges.set(list.map(c => (c.id === remote.id || c.slug === remote.slug) ? { ...c, ...remote } : c));
          } else {
            this.allChallenges.set([...list, remote]);
          }
        }
      })
    );
  }

  toggleVote(challengeId: string): void {
    const previous = this.allChallenges();
    const updated = previous.map(c => {
      if (c.id === challengeId) {
        const voted = !c.userVoted;
        return {
          ...c,
          userVoted: voted,
          upvotes: voted ? c.upvotes + 1 : Math.max(0, c.upvotes - 1),
        };
      }
      return c;
    });
    this.allChallenges.set(updated);
    this.saveChallenges(updated);

    // Persist in backend PostgreSQL database
    this.api.post<{ upvotes: number; userVoted: boolean }>(`/codelab/challenges/${challengeId}/vote`, {})
      .subscribe({
        next: res => {
          if (res) {
            const confirmed = this.allChallenges().map(c => {
              if (c.id === challengeId) {
                return {
                  ...c,
                  upvotes: res.upvotes,
                  userVoted: res.userVoted,
                };
              }
              return c;
            });
            this.allChallenges.set(confirmed);
            this.saveChallenges(confirmed);
          }
        },
        error: err => {
          console.warn('[CodeLab] Error sincronizando voto en backend:', err?.message);
        }
      });
  }

  markAsSolved(challengeId: string): void {
    const updated = this.allChallenges().map(c => {
      if (c.id === challengeId || c.slug === challengeId) {
        return { ...c, status: 'solved' as const };
      }
      return c;
    });
    this.allChallenges.set(updated);
    this.saveChallenges(updated);

    if (typeof window !== 'undefined') {
      try {
        const key = 'syseng_solved_challenges';
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        if (!stored.includes(challengeId)) {
          stored.push(challengeId);
          localStorage.setItem(key, JSON.stringify(stored));
        }
      } catch {}
    }
  }

  publishNewChallenge(data: {
    title: string;
    description: string;
    difficulty: 'facil' | 'media' | 'dificil' | 'hardcore';
    category: 'algoritmos' | 'estructuras' | 'concurrencia' | 'so' | 'bd' | 'compiladores';
    tags: string[];
    languages: string[];
    inputStdin: string;
    expectedStdout: string;
    starterCode?: string;
  }): Challenge {
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const tempId = `ret-${Date.now().toString().slice(-4)}`;
    const newChallenge: Challenge = {
      id: tempId,
      slug: slug || `desafio-${Date.now()}`,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      acceptanceRate: 100.0,
      xp: data.difficulty === 'facil' ? 30 : data.difficulty === 'media' ? 50 : 80,
      category: data.category,
      tags: data.tags.length > 0 ? data.tags : [`#${data.category}`, '#comunidad'],
      languages: data.languages.length > 0 ? data.languages : ['Python', 'JavaScript'],
      author: {
        name: 'Camilo',
        username: 'camilo',
        role: 'Tú',
        avatarInitial: 'C',
        isCurrentUser: true,
      },
      status: 'my_creation',
      upvotes: 1,
      userVoted: true,
      commentsCount: 0,
      isOfficial: false,
      isCommunity: true,
      testCasesCount: 4,
      testCases: [
        {
          input: data.inputStdin,
          expected: data.expectedStdout,
          isHidden: false,
          label: 'Test 1 (Público)'
        },
        {
          input: data.inputStdin ? `${data.inputStdin}\n42` : 'test_borde',
          expected: data.expectedStdout,
          isHidden: true,
          label: 'Test 2 (Oculto)'
        }
      ],
      starterCode: {
        python: data.starterCode || `# Starter code para ${data.title}\ndef solution(input_data):\n    # Escribe tu solución\n    pass\n`,
        javascript: `function solution(inputData) {\n  // Escribe tu solución\n}\n`,
      },
      publishedAt: 'Recién publicado',
    };

    // Optimistic local update
    const current = this.allChallenges();
    this.allChallenges.set([newChallenge, ...current]);
    this.saveChallenges([newChallenge, ...current]);

    // Send to Backend API & PostgreSQL Database
    this.api.post<{ message: string; challenge: any }>('/codelab/challenges', {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      inputStdin: data.inputStdin,
      expectedStdout: data.expectedStdout,
      starterCode: data.starterCode,
      tags: data.tags,
      languages: data.languages,
    }).subscribe({
      next: (res) => {
        if (res?.challenge) {
          const serverCh = res.challenge;
          const updated = this.allChallenges().map(c => {
            if (c.id === tempId) {
              return {
                ...c,
                id: String(serverCh.id),
                slug: serverCh.slug,
              };
            }
            return c;
          });
          this.allChallenges.set(updated);
          this.saveChallenges(updated);
          this.fetchLiveStats();
        }
        this.notificationSvc.show({
          type: 'success',
          title: '¡Reto Publicado! 🚀',
          message: 'Tu desafío ha sido publicado y guardado en la base de datos de SysEng Academy.',
          duration: 5000,
        });
      },
      error: (err) => {
        console.warn('[CodeLab] Error guardando reto en backend:', err);
        this.notificationSvc.show({
          type: 'info',
          title: 'Guardado Localmente',
          message: 'El reto está activo en tu sesión local de CodeLab.',
          duration: 4000,
        });
      }
    });

    return newChallenge;
  }

  submitSolution(
    challengeId: string | number,
    language: string,
    code: string
  ): Observable<{
    passed: boolean;
    status: string;
    passed_cases: number;
    total_cases: number;
    execution_time_ms: number;
    memory_mb: number;
    percentile_speed?: number;
    percentile_memory?: number;
    stdout: string;
    stderr: string;
    tests: Array<{ input: string; expected: string; actual: string; passed: boolean; isHidden: boolean }>;
  }> {
    return this.api.post<any>(`/codelab/challenges/${challengeId}/submit`, {
      language,
      code,
    }).pipe(
      tap(res => {
        if (res?.passed) {
          this.markAsSolved(String(challengeId));
          this.fetchLiveStats();
          this.fetchChallengesFromApi();
          const challenge = this.allChallenges().find(c => c.id === String(challengeId) || c.slug === String(challengeId));
          const xp = challenge?.xp || 50;
          this.notificationSvc.show({
            type: 'success',
            title: '¡Reto Completado! 🏆',
            message: `Has superado todos los casos de prueba exitosamente.`,
            xp: xp,
            duration: 6000,
          });
        }
      })
    );
  }
}
