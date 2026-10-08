import { Component, OnInit, OnDestroy, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { CoursesService } from '../../core/services/courses.service';
import { StreakService } from '../../core/services/streak.service';
import { TeacherService, TeacherStudent, TeacherActivity, TeacherOverviewResponse, StudentFeedbackItem } from '../../core/services/teacher.service';
import { Enrollment } from '../../core/models';
import { AppIconComponent } from '../../shared/components/app-icon.component';

export interface AsciiAvatar {
  id: string;
  name: string;
  subtitle: string;
  frames: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'challenges' | 'courses' | 'special';
  icon: string;
  description: string;
  requirement: string;
  targetCount: number;
  currentCount: number;
  progressPercent: number;
  unlocked: boolean;
  level: 'bronze' | 'silver' | 'gold' | 'diamond';
  shaFingerprint: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  email: string;
  avatarText: string;
  level: number;
  rankTitle: string;
  specialization: string;
  completedLessons: number;
  avgQuizScore: number;
  xp: number;
  isCurrentUser: boolean;
  badgePill: string;
}

export interface PathRecommendation {
  pathTitle: string;
  pathSlug: string;
  targetLevelName: string;
  milestoneOrder: number;
  rationale: string;
  topicsToStudy: string[];
  suggestedCourseSlug: string;
  suggestedCourseTitle: string;
  matchScore: number;
}

export interface StreakDay {
  dayName: string;
  shortDate: string;
  completed: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppIconComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private coursesSvc = inject(CoursesService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly streakService = inject(StreakService);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);
  readonly todayStudyMinutes = computed(() => this.streakService.todayStudyMinutes());
  remoteLeaderboard = signal<LeaderboardEntry[]>([]);
  private studyTimer: any = null;
  private onDiagnosticUpdated = () => this.initLocalData();

  // Tab state: student vs teacher
  activeTab = signal<'overview' | 'streak' | 'achievements' | 'leaderboard' | 'advisor'>('overview');
  activeTeacherTab = signal<'overview' | 'students' | 'activities' | 'advisor'>('overview');
  selectedBadgeFilter = signal<'all' | 'unlocked' | 'challenges' | 'courses'>('all');

  constructor() {
    effect(() => {
      const tab = this.activeTab();
      if (tab === 'leaderboard') this.loadLeaderboard();
      if (tab === 'streak') this.streakService.loadStatus();
    });
  }

  // Animated ASCII Art frame index
  currentFrame = signal(0);
  private frameTimer: any = null;

  // Mascotas exclusivas para el cuerpo Docente y Cátedra
  readonly facultyAvatars: AsciiAvatar[] = [
    {
      id: 'professor_owl',
      name: 'Professor Owl',
      subtitle: 'Búho sabio de Cátedra y Algoritmos',
      frames: [
        `   /\\___/\\
  (( o,o ))
   \\  -  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
        `   /\\___/\\
  (( -,- ))
   \\  -  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
        `   /\\___/\\
  (( ^,o ))
   \\  o  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
      ],
    },
    {
      id: 'dean_tux',
      name: 'Dean Tux (Decano)',
      subtitle: 'Dirección Cátedra & Kernel Linux',
      frames: [
        `   .--.   [DOC]
  |o_o |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
        `   .--.   [DOC]
  |-.- |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
        `   .--.   [DOC]
  |^_^ |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
      ],
    },
    {
      id: 'chief_architect',
      name: 'Chief Architect',
      subtitle: 'Arquitecto de Sistemas & Cloud',
      frames: [
        ` [====KERNEL====]
 | [CPU] 3.8GHz |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
        ` [====KERNEL====]
 | [CPU] >RUN<  |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
        ` [====KERNEL====]
 | [CPU] 4.2GHz |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
      ],
    },
    {
      id: 'grand_mentor',
      name: 'Grand Mentor',
      subtitle: 'Profesor Emérito de Compiladores',
      frames: [
        `      .---.
     /     \\
    | [o] [o]|  [*]
    |   _    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
        `      .---.
     /     \\
    | [-] [-]|  [*]
    |   _    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
        `      .---.
     /     \\
    | [^] [^]|  [*]
    |   o    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
      ],
    },
  ];

  // Mascotas para los Estudiantes
  readonly studentAvatars: AsciiAvatar[] = [
    {
      id: 'syseng_bot',
      name: 'SysEng Bot (Conejito)',
      subtitle: 'Tutor oficial de la academia',
      frames: [
        `    /_/
  ( o.o )
   > ^ <
   /   \\
  (_| |_)
 SYSENG BOT`,
        `    /_/
  ( -.- )
   > ^ <
   /   \\
  (_| |_)
 SYSENG BOT`,
        `    \\_/
  ( ^.^ )
   > o <
   /   \\
  (_| |_)
 SYSENG BOT`,
      ],
    },
    {
      id: 'tux_linux',
      name: 'Tux Linux',
      subtitle: 'Mascota del Kernel Linux',
      frames: [
        `   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\\'\\
\\___)=(___/
 TUX LINUX`,
        `   .--.
  |-.- |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\\'\\
\\___)=(___/
 TUX LINUX`,
        `   .--.
  |^_^ |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\\'\\
\\___)=(___/
 TUX LINUX`,
      ],
    },
    {
      id: 'cyber_cat',
      name: 'Cyber Daemon Cat',
      subtitle: 'Espía de terminales SSH',
      frames: [
        `  /\\___/\\
 (  o o  )
 /   V   \\
/ (     ) \\
\\_/  \\_/  \\_/
 CYBER CAT`,
        `  /\\___/\\
 (  - -  )
 /   V   \\
/ (     ) \\
\\_/  \\_/  \\_/
 CYBER CAT`,
        `  /\\___/\\
 (  ^ ^  )
 /   o   \\
/ (     ) \\
\\_/  \\_/  \\_/
 CYBER CAT`,
      ],
    },
    {
      id: 'monolith_cli',
      name: 'Monolith CLI',
      subtitle: 'Terminal retro UNIX',
      frames: [
        ` +-------+
 | >_ [] |
 |  ===  |
 +---+---+
     |
    / \\
 MONOLITH`,
        ` +-------+
 | >  [] |
 |  ===  |
 +---+---+
     |
    / \\
 MONOLITH`,
        ` +-------+
 | >_ [] |
 |  ---  |
 +---+---+
     |
    / \\
 MONOLITH`,
      ],
    },
    {
      id: 'root_skull',
      name: 'Root Skull',
      subtitle: 'Privilegios de superusuario',
      frames: [
        `   .---.
  /     \\
 | () () |
  \\  ^  /
   |||||
 ROOT SKULL`,
        `   .---.
  /     \\
 | (•) (•)|
  \\  ^  /
   |||||
 ROOT SKULL`,
        `   .---.
  /     \\
 | (> <) |
  \\  -  /
   |||||
 ROOT SKULL`,
      ],
    },
    {
      id: 'code_wizard',
      name: 'Code Wizard',
      subtitle: 'Arquitecto de compiladores',
      frames: [
        `    /\\
   /  \\
  /____\\
 (  ^.^ )
  /| | \\
 (_|_|__)
 WIZARD CLI`,
        `    /\\
   /  \\
  /____\\
 (  -.- )
  /| | \\
 (_|_|__)
 WIZARD CLI`,
        `    /\\
   /  \\
  /____\\
 (  o.o )
  /| | \\
 (_|_|__)
 WIZARD CLI`,
      ],
    },
  ];

  readonly availableAsciiAvatars = computed<AsciiAvatar[]>(() => {
    return this.isTeacher() ? this.facultyAvatars : this.studentAvatars;
  });

  selectedAvatarId = signal<string>('professor_owl');
  showAvatarModal = signal(false);

  // Streak state
  readonly currentStreak = computed(() => this.streakService.currentStreak());
  readonly previousStreak = computed(() => this.streakService.previousStreak());
  readonly maxStreak = computed(() => this.streakService.maxStreak());
  readonly canRecoverStreak = computed(() => this.streakService.canRecoverStreak());
  readonly flameState = computed(() => this.streakService.flameState());
  readonly isStreakActive = computed(() => this.streakService.isStreakActive());
  readonly isStreakPending = computed(() => this.streakService.isStreakPending());
  readonly isStreakExtinguished = computed(() => this.streakService.isStreakExtinguished());
  readonly todayCheckedIn = computed(() => this.streakService.isActiveToday());
  readonly recoveryDrill = computed(() => this.streakService.recoveryDrill());
  readonly isRecovering = computed(() => this.streakService.isRecovering());
  readonly recoverySuccessMessage = computed(() => this.streakService.recoverySuccessMessage());
  readonly recoveryErrorMessage = computed(() => this.streakService.recoveryErrorMessage());
  readonly selectedRecoveryOption = signal<string>('');

  // Diagnostic & Advisor AI state
  diagnosticCompleted = signal(false);
  diagnosticFinished = signal(false);
  advisorQuery = signal('');
  advisorLoading = signal(false);
  advisorHistory = signal<{ role: 'user' | 'assistant'; text: string; timeAgo: string }[]>([
    {
      role: 'assistant',
      text: '¡Hola! Soy Byte Copilot, tu consejero técnico de ingeniería. Estoy aquí para resolver tus dudas sobre tu ruta de aprendizaje, prerrequisitos de cursos o estrategias para dominar algoritmos y sistemas distribuidos. ¿En qué puedo orientarte hoy?',
      timeAgo: 'ahora',
    }
  ]);

  // Estados para Retroalimentación y Comunicados del Docente
  protected readonly Math = Math;

  // Estados para Retroalimentación y Comunicados del Docente
  studentFeedbacks = signal<StudentFeedbackItem[]>([]);
  feedbacksLoading = signal<boolean>(false);
  advisorSubTab = signal<'comunicados' | 'llamados'>('comunicados');

  readonly activeWarnings = computed(() =>
    this.studentFeedbacks().filter(f => (f.type === 'warning_strict' || f.type === 'warning_mild') && !f.is_dismissed)
  );

  readonly activeUnresolvedWarnings = computed(() =>
    this.activeWarnings().filter(f => !f.is_resolved)
  );

  readonly resolvedWarnings = computed(() =>
    this.activeWarnings().filter(f => f.is_resolved)
  );

  readonly catedraFeedbacks = computed(() =>
    this.studentFeedbacks().filter(f => f.type !== 'warning_strict' && f.type !== 'warning_mild' && !f.is_dismissed)
  );

  readonly totalPenalizedXp = computed(() =>
    this.activeUnresolvedWarnings()
      .filter(f => f.xp_impact < 0)
      .reduce((acc, f) => acc + Math.abs(f.xp_impact), 0)
  );

  readonly totalBonusXp = computed(() =>
    this.studentFeedbacks()
      .filter(f => f.xp_impact > 0)
      .reduce((acc, f) => acc + f.xp_impact, 0)
  );

  // Estados para la subsanación interactiva de llamados de atención
  activeRemediationFeedbackId = signal<number | null>(null);
  remediatingFeedback = signal<boolean>(false);
  remediationSuccessNotice = signal<{ feedbackId: number; message: string; restoredXp: number } | null>(null);
  remediationErrorNotice = signal<string | null>(null);
  selectedRemediationOption = signal<string>('');

  currentDiagQuestionIndex = signal(0);
  selectedDiagAnswer = signal<string | null>(null);
  evaluatingQuestion = signal(false);

  readonly diagQuestions = [
    {
      id: 'q1',
      title: '1. Rastreo de Variables y Asignación',
      topic: 'Variables y Estado',
      prompt: 'Si ejecutamos este bloque de código paso a paso, ¿cuál será el valor final de la variable puntos?',
      codeSnippet: `let puntos = 10;
puntos = puntos + 5;
puntos = puntos * 2;`,
      options: [
        { id: 'a', label: '20' },
        { id: 'b', label: '30' },
        { id: 'c', label: '25' },
        { id: 'd', label: '15' },
      ],
    },
    {
      id: 'q2',
      title: '2. Condicionales y Toma de Decisiones',
      topic: 'Lógica Condicional (If / Else)',
      prompt: 'Dado el siguiente bloque de código, ¿qué mensaje mostrará la consola si edad = 16?',
      codeSnippet: `let edad = 16;

if (edad >= 18) {
  console.log("Acceso concedido");
} else {
  console.log("Acceso restringido: menor de edad");
}`,
      options: [
        { id: 'a', label: 'Acceso restringido: menor de edad' },
        { id: 'b', label: 'Acceso concedido' },
        { id: 'c', label: 'Error de sintaxis en el condicional' },
        { id: 'd', label: 'No imprime nada en la consola' },
      ],
    },
    {
      id: 'q3',
      title: '3. Bucles y Repetición Secuencial',
      topic: 'Ciclos y Algoritmia Básica',
      prompt: 'Un robot parte desde la posición 0. ¿En qué posición termina el robot después de completar este ciclo?',
      codeSnippet: `let posicion = 0;

for (let paso = 1; paso <= 3; paso++) {
  posicion = posicion + 4;
}`,
      options: [
        { id: 'a', label: '7' },
        { id: 'b', label: '12' },
        { id: 'c', label: '4' },
        { id: 'd', label: '16' },
      ],
    },
    {
      id: 'q4',
      title: '4. Enfoque e Interés de Aprendizaje',
      topic: 'Ruta de Especialización',
      prompt: '¿Hacia qué área o tipo de proyectos deseas orientar con mayor prioridad tu ruta en SysEng Academy?',
      codeSnippet: null,
      options: [
        { id: 'frontend', label: 'Desarrollo Web & Interfaces Visuales (HTML, CSS, JS reactivo)' },
        { id: 'backend', label: 'Sistemas Backend, APIs y Bases de Datos (Lógica de servidor, SQL)' },
        { id: 'algo', label: 'Pensamiento Computacional & Algoritmos (Resolución de problemas de lógica)' },
        { id: 'fullstack', label: 'Ingeniería FullStack (Integración frontend y backend)' },
      ],
    },
  ];

  diagnosticAnswers: Record<string, string> = {};

  diagnosticResult = signal({
    assignedLevelNumber: 1,
    assignedLevelTitle: 'Nivel 1: Cadete en Formación',
    recommendedSpecialty: 'Por definir (Prueba Diagnóstica Pendiente)',
    recommendedPathTitle: 'Ruta Inicial de Formación Técnica',
    suggestedCourseSlug: 'introduccion-programacion',
    suggestedCourseTitle: 'Introducción a la Programación',
    score: 0,
    agentFeedback: 'Presenta tu examen diagnóstico para calibrar tu nivel y definir tu ruta de aprendizaje recomendada.',
  });

readonly currentStudentEmail = computed(() => {
    return this.auth.user()?.email?.toLowerCase().trim() || 'guest';
  });

  readonly isDemoStudent = computed(() => {
    return this.currentStudentEmail() === 'estudiante@sysengacademy.dev';
  });

  private getUserStorageKey(suffix: string): string {
    return `syseng_${this.currentStudentEmail()}_${suffix}`;
  }

  // Recommendations
  readonly currentRecommendation = signal<PathRecommendation>({
    pathTitle: 'Ruta de Desarrollo Backend & Arquitectura de APIs',
    pathSlug: 'desarrollo-backend',
    targetLevelName: 'Modelos, Relaciones y Consultas SQL',
    milestoneOrder: 2,
    rationale: 'Tu expediente muestra un dominio destacado en algoritmos básicos y una tasa de acierto del 91.7% en quizzes. Según tu aspiración hacia sistemas de alta concurrencia, tu siguiente salto profesional es dominar la persistencia de datos relacionales y APIs REST.',
    topicsToStudy: ['Modelos Eloquent y Relaciones', 'Autenticación JWT stateless', 'Índices compuestos en PostgreSQL'],
    suggestedCourseSlug: 'backend-introduccion',
    suggestedCourseTitle: 'Introducción al Backend & Arquitectura de Servidores',
    matchScore: 98,
  });

  // Teacher specific state
  readonly isTeacher = computed(() => {
    const user = this.auth.user();
    return (
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  private teacherSvc = inject(TeacherService);

  readonly facultyStudents = signal<TeacherStudent[]>([]);
  readonly facultyActivities = signal<TeacherActivity[]>([]);
  readonly facultyOverview = signal<TeacherOverviewResponse | null>(null);

  readonly facultyStudentsCount = computed(() => {
    return this.facultyStudents().length || this.facultyOverview()?.stats.total_students || 5;
  });

  readonly facultyAvgScore = computed(() => {
    return this.facultyOverview()?.stats.average_score ?? 89.1;
  });

  readonly facultyActivitiesCount = computed(() => {
    return this.facultyActivities().length || 3;
  });

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });

    if (this.isTeacher()) {
      this.teacherSvc.getStudents().subscribe(st => this.facultyStudents.set(st));
      this.teacherSvc.getActivities().subscribe(acts => this.facultyActivities.set(acts));
      this.teacherSvc.getOverview().subscribe(ov => this.facultyOverview.set(ov));
    }

    // Cargar leaderboard remoto de la base de datos
    this.api.get<LeaderboardEntry[]>('/leaderboard').subscribe({
      next: (entries) => {
        if (Array.isArray(entries)) {
          this.remoteLeaderboard.set(entries);
        }
      },
      error: () => {}
    });

    this.initLocalData();
    this.loadTeacherFeedbacks();

    // Start animated ASCII frame cycler y telemetría de estudio en vivo
    if (typeof window !== 'undefined') {
      this.frameTimer = setInterval(() => {
        this.currentFrame.update(f => (f + 1) % 3);
      }, 1200);

      window.addEventListener('syseng:diagnostic_completed', this.onDiagnosticUpdated);
      window.addEventListener('syseng:feedback_sent', this.onFeedbackReceived);
      window.addEventListener('syseng:xp_updated', this.onFeedbackReceived);
    }

    const qp = this.route.snapshot.queryParams;
    if ((qp['onboarding'] === 'true' || qp['tab'] === 'diagnostic') && !this.isTeacher()) {
      this.router.navigate(['/onboarding']);
    }
  }

  ngOnDestroy() {
    if (this.frameTimer) clearInterval(this.frameTimer);
    if (typeof window !== 'undefined') {
      window.removeEventListener('syseng:diagnostic_completed', this.onDiagnosticUpdated);
      window.removeEventListener('syseng:feedback_sent', this.onFeedbackReceived);
      window.removeEventListener('syseng:xp_updated', this.onFeedbackReceived);
    }
  }

  loadTeacherFeedbacks() {
    const email = this.currentStudentEmail();
    this.feedbacksLoading.set(true);
    this.teacherSvc.getStudentFeedbacksForProfile(email).subscribe({
      next: (list) => {
        if (Array.isArray(list)) {
          this.studentFeedbacks.set(list);
        }
        this.feedbacksLoading.set(false);
      },
      error: () => this.feedbacksLoading.set(false)
    });
  }

  toggleRemediation(feedbackId: number) {
    if (this.activeRemediationFeedbackId() === feedbackId) {
      this.activeRemediationFeedbackId.set(null);
    } else {
      this.activeRemediationFeedbackId.set(feedbackId);
      this.selectedRemediationOption.set('');
      this.remediationErrorNotice.set(null);
    }
  }

  getRemediationDrill(feedback: StudentFeedbackItem) {
    const t = (feedback.title + ' ' + (feedback.message || '')).toLowerCase();
    if (t.includes('rezago') || t.includes('rendimiento') || t.includes('entrega') || t.includes('inactividad')) {
      return {
        question: 'Para subsanar el rezago y regularizar tu estado de cátedra, ¿qué comando en Git confirma tus cambios en el área de preparación registrando formalmente tu entrega con mensaje?',
        code: '$ git ______ -m "Entrega regularizacion practica de catedra"',
        options: ['commit', 'push', 'checkout', 'reset'],
        answer: 'commit',
        hint: 'El comando para confirmar cambios locales con un mensaje descriptivo es commit.',
      };
    }
    return {
      question: 'Para regularizar tu actividad práctica y verificar la ejecución en el simulador, selecciona el comando que otorga permisos de ejecución (+x) a tu script de entrega:',
      code: '$ _____ +x solucion_entrega.sh',
      options: ['chmod', 'chown', 'touch', 'cat'],
      answer: 'chmod',
      hint: 'El comando para cambiar los modos o permisos de acceso a un archivo es chmod.',
    };
  }

  submitRemediation(feedback: StudentFeedbackItem) {
    const drill = this.getRemediationDrill(feedback);
    const selected = this.selectedRemediationOption();
    if (!selected) {
      this.remediationErrorNotice.set('Por favor selecciona una opción técnica para validar la subsanación.');
      return;
    }

    if (selected.toLowerCase().trim() !== drill.answer.toLowerCase().trim()) {
      this.remediationErrorNotice.set(`Respuesta incorrecta. Pista: ${drill.hint}`);
      return;
    }

    this.remediatingFeedback.set(true);
    this.remediationErrorNotice.set(null);

    const email = this.currentStudentEmail();
    this.teacherSvc.remediateFeedback(feedback.id, 'Reto práctico de regularización completado en el simulador', email).subscribe({
      next: (res) => {
        this.remediatingFeedback.set(false);
        this.activeRemediationFeedbackId.set(null);
        this.remediationSuccessNotice.set({
          feedbackId: feedback.id,
          message: res.message || 'Llamado subsanado con éxito.',
          restoredXp: res.restored_xp || 0,
        });

        // Actualizar el estado local del feedback
        this.studentFeedbacks.update(list =>
          list.map(item => item.id === feedback.id ? { ...item, is_resolved: true, status: 'resolved', remediation_action: 'Reto de regularización completado' } : item)
        );

        // Si el usuario actual tiene XP, actualizarlo en auth
        if (res.student_xp) {
          const u = this.auth.user();
          if (u) {
            u.xp = res.student_xp;
          }
        }
      },
      error: (err) => {
        this.remediatingFeedback.set(false);
        this.remediationErrorNotice.set(err.error?.message || 'Error al subsanar el llamado de atención.');
      }
    });
  }

  dismissFeedback(feedbackId: number) {
    const email = this.currentStudentEmail();
    this.teacherSvc.dismissFeedback(feedbackId, email).subscribe({
      next: () => {
        this.studentFeedbacks.update(list => list.filter(f => f.id !== feedbackId));
      },
      error: () => {
        // Fallback optimista local
        this.studentFeedbacks.update(list => list.filter(f => f.id !== feedbackId));
      }
    });
  }

  clearAllResolvedWarnings() {
    const email = this.currentStudentEmail();
    this.teacherSvc.clearResolvedFeedbacks(email).subscribe({
      next: () => {
        this.studentFeedbacks.update(list => list.filter(f => !f.is_resolved));
      },
      error: () => {
        this.studentFeedbacks.update(list => list.filter(f => !f.is_resolved));
      }
    });
  }

  private onFeedbackReceived = () => {
    this.loadTeacherFeedbacks();
    this.api.get<LeaderboardEntry[]>('/leaderboard').subscribe({
      next: (entries) => {
        if (Array.isArray(entries)) {
          this.remoteLeaderboard.set(entries);
        }
      },
      error: () => {}
    });
  };

  private initLocalData() {
    if (typeof window === 'undefined') return;

    const teacher = this.isTeacher();
    const storageKey = teacher ? 'syseng_selected_teacher_ascii_avatar' : 'syseng_selected_ascii_avatar';
    const savedAv = localStorage.getItem(storageKey);
    const pool = teacher ? this.facultyAvatars : this.studentAvatars;

    if (savedAv && pool.some(a => a.id === savedAv)) {
      this.selectedAvatarId.set(savedAv);
    } else {
      this.selectedAvatarId.set(pool[0].id);
    }

    // Cargar datos reales y telemetría de racha
    this.streakService.loadStatus();
    this.loadLeaderboard();

    const userKeyDiagRes = this.getUserStorageKey('diagnostic_result');
    const diagDone = this.auth.isDiagnosticCompleted(this.currentStudentEmail());
    this.diagnosticCompleted.set(diagDone);
    if (diagDone) {
      try {
        const res = this.auth.getDiagnosticResult(this.currentStudentEmail()) || JSON.parse(localStorage.getItem(userKeyDiagRes) || '{}');
        const levelTitle = res.levelTitle || res.assignedLevelTitle;
        if (levelTitle) {
          const mapped = {
            ...res,
            assignedLevelTitle: levelTitle,
            assignedLevelNumber: res.levelNumber || res.assignedLevelNumber || 1,
            recommendedSpecialty: res.recommendedSpecialty || 'Ingeniería de Software',
            recommendedPathTitle: res.recommendedPathTitle || 'Ruta de Fundamentos de Software',
            suggestedCourseSlug: res.primaryCourseSlug || res.suggestedCourseSlug || 'introduccion-programacion',
            suggestedCourseTitle: res.primaryCourseTitle || res.suggestedCourseTitle || 'Introducción a la Programación',
          };
          this.diagnosticResult.set(mapped);
          this.diagnosticFinished.set(true);
          this.currentRecommendation.set({
            pathTitle: mapped.recommendedPathTitle,
            pathSlug: mapped.suggestedCourseSlug,
            targetLevelName: mapped.assignedLevelTitle,
            milestoneOrder: 1,
            rationale: res.agentFeedback || `Byte IA ha evaluado tu perfil y estructurado tu temario de ingeniería personalizado.`,
            topicsToStudy: ['Fundamentos de Programación', 'Algoritmos y Lógica', 'Prácticas en Terminal'],
            suggestedCourseSlug: mapped.suggestedCourseSlug,
            suggestedCourseTitle: mapped.suggestedCourseTitle,
            matchScore: 96,
          });
        }
      } catch {}
    } else {
      this.diagnosticFinished.set(false);
      this.diagnosticResult.set({
        assignedLevelNumber: 1,
        assignedLevelTitle: 'Nivel 1: Cadete en Formación',
        recommendedSpecialty: 'Por definir (Prueba Diagnóstica Pendiente)',
        recommendedPathTitle: 'Ruta Inicial de Formación Técnica',
        suggestedCourseSlug: 'introduccion-programacion',
        suggestedCourseTitle: 'Introducción a la Programación',
        score: 0,
        agentFeedback: 'Presenta tu examen diagnóstico de razonamiento lógico para calibrar tu nivel y definir tu ruta de aprendizaje personalizada.',
      });
      this.currentRecommendation.set({
        pathTitle: 'Evaluación y Calibración Diagnóstica',
        pathSlug: 'introduccion-programacion',
        targetLevelName: 'Nivel 1 (Diagnóstico Pendiente)',
        milestoneOrder: 1,
        rationale: 'Aún no has completado tu prueba diagnóstica. Preséntala en la pestaña "diagnostic" para que Byte Copilot calibre tus habilidades y recomiende tu primera ruta de formación técnica personalizada.',
        topicsToStudy: ['Razonamiento Lógico', 'Condicionales y Secuencias', 'Pensamiento Computacional'],
        suggestedCourseSlug: 'introduccion-programacion',
        suggestedCourseTitle: 'Introducción a la Programación',
        matchScore: 98,
      });
    }

  }

  readonly currentAsciiAvatar = computed(() => {
    const pool = this.availableAsciiAvatars();
    const id = this.selectedAvatarId();
    return pool.find(a => a.id === id) || pool[0];
  });

  readonly currentAsciiFrame = computed(() => {
    const av = this.currentAsciiAvatar();
    const frameIdx = this.currentFrame() % av.frames.length;
    return av.frames[frameIdx];
  });

  openAvatarModal() { this.showAvatarModal.set(true); }
  closeAvatarModal() { this.showAvatarModal.set(false); }

  selectAsciiAvatar(id: string) {
    this.selectedAvatarId.set(id);
    if (typeof window !== 'undefined') {
      const storageKey = this.isTeacher() ? 'syseng_selected_teacher_ascii_avatar' : 'syseng_selected_ascii_avatar';
      localStorage.setItem(storageKey, id);
      window.dispatchEvent(new CustomEvent('ascii-avatar:changed', { detail: { id, isTeacher: this.isTeacher() } }));
    }
    this.closeAvatarModal();
  }

  readonly streakMultiplier = computed(() => {
    const s = this.currentStreak();
    if (s >= 14) return 1.40;
    if (s >= 7)  return 1.25;
    if (s >= 3)  return 1.10;
    return 1.0;
  });

  readonly weekDays = computed<StreakDay[]>(() => {
    const matrix = this.streakService.weeklyMatrix();
    if (matrix && matrix.length > 0) {
      return matrix.map(m => {
        const parts = m.date.split('-');
        const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : m.date;
        return {
          dayName: m.day.toUpperCase(),
          shortDate,
          completed: m.active,
          isToday: m.is_today,
        };
      });
    }

    const names = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const now = new Date();
    const currentDayIdx = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayIdx);

    return names.map((name, i) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dayNum = String(dayDate.getDate()).padStart(2, '0');
      const monthNum = String(dayDate.getMonth() + 1).padStart(2, '0');
      return {
        dayName: name,
        shortDate: `${dayNum}/${monthNum}`,
        completed: i === currentDayIdx,
        isToday: i === currentDayIdx,
      };
    });
  });

  doDailyCheckIn() {
    this.streakService.recordActivity('pulse');
  }

  selectRecoveryOption(opt: string) {
    this.selectedRecoveryOption.set(opt);
  }

  refreshRecoveryDrill() {
    const currentId = this.recoveryDrill()?.id;
    this.selectedRecoveryOption.set('');
    this.streakService.fetchRecoveryDrill(currentId);
  }

  submitRecoveryDrill() {
    const drill = this.recoveryDrill();
    const answer = this.selectedRecoveryOption();
    if (!drill || !answer || this.isRecovering()) return;

    this.streakService.recoverStreak(drill.id, answer).subscribe({
      next: () => {
        this.selectedRecoveryOption.set('');
      },
      error: () => {},
    });
  }

  askAdvisor(suggestedPrompt?: string) {
    const q = (suggestedPrompt || this.advisorQuery()).trim();
    if (!q || this.advisorLoading()) return;

    this.advisorQuery.set('');
    this.advisorLoading.set(true);

    const now = 'hace un momento';
    this.advisorHistory.update(h => [...h, { role: 'user', text: q, timeAgo: now }]);

    this.api.post<{ reply?: string; answer?: string; message?: string }>('/ai/ask', {
      message: q,
      context: `Estudiante: ${this.auth.user()?.name || 'Estudiante'}. Nivel: ${this.userLevel()}. Especialidad: ${this.specialization().title}. Racha: ${this.currentStreak()} días. Cursos completados: ${this.completedCount()}.`
    }).subscribe({
      next: (res) => {
        this.advisorLoading.set(false);
        const botReply = res?.reply || res?.answer || res?.message || 'He analizado tu consulta. Para tu nivel actual, te recomiendo avanzar con ejercicios de lógica de programación y completar los retos de terminal antes de pasar a arquitectura avanzada.';
        this.advisorHistory.update(h => [...h, { role: 'assistant', text: botReply, timeAgo: 'ahora' }]);
        this.streakService.recordActivity('pulse');
      },
      error: () => {
        this.advisorLoading.set(false);
        const fallback = this.generateAdvisorFallback(q);
        this.advisorHistory.update(h => [...h, { role: 'assistant', text: fallback, timeAgo: 'ahora' }]);
      }
    });
  }

  private generateAdvisorFallback(q: string): string {
    const lower = q.toLowerCase();
    if (lower.includes('backend') || lower.includes('api')) {
      return 'Para destacar en Backend, domina el diseño de APIs REST idempotentes, control transaccional en bases de datos relacionales (PostgreSQL) y manejo de concurrencia. ¡Tu siguiente paso ideal es el curso de Introducción al Backend!';
    }
    if (lower.includes('algoritmo') || lower.includes('reto') || lower.includes('dijkstra') || lower.includes('grafo')) {
      return 'Los algoritmos requieren práctica continua: comienza analizando la complejidad temporal Big-O (O(1), O(log n), O(n)) y resuelve al menos un reto CLI al día para mantener tu racha activa.';
    }
    if (lower.includes('racha') || lower.includes('xp') || lower.includes('ranking')) {
      return 'Para maximizar tu XP y escalar en el ranking: cada lección otorga +20 XP, los retos +50 XP, completar cursos +150 XP y mantener rachas diarias otorga bonificaciones progresivas (+25 XP por día consecutivo).';
    }
    return `Basado en tu perfil actual (Nivel ${this.userLevel()} - ${this.specialization().title}): te recomiendo continuar con tu curso asignado en la pestaña whoami y resolver ejercicios prácticos para obtener experiencia acelerada.`;
  }

  readonly currentQuestion = computed(() => this.diagQuestions[this.currentDiagQuestionIndex()]);

  submitDiagAnswer() {
    const ans = this.selectedDiagAnswer();
    if (!ans) return;

    this.evaluatingQuestion.set(true);
    const q = this.currentQuestion();
    this.diagnosticAnswers[q.id] = ans;

    setTimeout(() => {
      this.evaluatingQuestion.set(false);
      this.selectedDiagAnswer.set(null);

      if (this.currentDiagQuestionIndex() < this.diagQuestions.length - 1) {
        this.currentDiagQuestionIndex.update(idx => idx + 1);
      } else {
        this.finishDiagnostic();
      }
    }, 200);
  }

  private finishDiagnostic() {
    let score = 0;
    if (this.diagnosticAnswers['q1'] === 'b') score++;
    if (this.diagnosticAnswers['q2'] === 'a') score++;
    if (this.diagnosticAnswers['q3'] === 'b') score++;

    const pref = this.diagnosticAnswers['q4'] || 'backend';

    let assignedLevel = 2;
    let assignedTitle = 'Nivel 2: Iniciación a la Programación';
    if (score === 3) {
      assignedLevel = 3;
      assignedTitle = 'Nivel 3: Desarrollador en Formación';
    } else if (score === 1 || score === 0) {
      assignedLevel = 1;
      assignedTitle = 'Nivel 1: Fundamentos de Lógica y Algoritmia';
    }

    let spec = 'Sistemas Backend & APIs';
    let pathTitle = 'Ruta de Desarrollo Backend & Arquitectura de APIs';
    let courseSlug = 'backend-introduccion';
    let courseTitle = 'Introducción al Backend & Arquitectura de Servidores';

    if (pref === 'algo') {
      spec = 'Pensamiento Computacional & Algoritmia';
      pathTitle = 'Ruta de Fundamentos de Algorítmica';
      courseSlug = 'algoritmos-ordenamiento';
      courseTitle = 'Algoritmos y Estructuras de Datos';
    } else if (pref === 'frontend') {
      spec = 'Arquitectura Frontend & UI Reactiva';
      pathTitle = 'Ruta de Desarrollo Frontend Moderno';
      courseSlug = 'introduccion-desarrollo-web';
      courseTitle = 'Introducción al Desarrollo Web';
    } else if (pref === 'fullstack') {
      spec = 'Ingeniería de Software FullStack';
      pathTitle = 'Ruta FullStack de Ingeniería de Software';
      courseSlug = 'introduccion-desarrollo-web';
      courseTitle = 'Fundamentos de Desarrollo Web y Sistemas';
    }

    const result = {
      assignedLevelNumber: assignedLevel,
      assignedLevelTitle: assignedTitle,
      recommendedSpecialty: spec,
      recommendedPathTitle: pathTitle,
      suggestedCourseSlug: courseSlug,
      suggestedCourseTitle: courseTitle,
      score: score,
      agentFeedback: `Byte Copilot ha evaluado tu razonamiento lógico (${score}/3 respuestas correctas). Asignamos tu perfil al ${assignedTitle} y te sugerimos iniciar con ${courseTitle}.`,
    };

    this.diagnosticResult.set(result);
    this.diagnosticFinished.set(true);
    this.diagnosticCompleted.set(true);

    this.currentRecommendation.set({
      pathTitle: pathTitle,
      pathSlug: courseSlug,
      targetLevelName: assignedTitle,
      milestoneOrder: 1,
      rationale: `Byte Copilot ha evaluado tu razonamiento lógico (${score}/3 respuestas correctas). Asignamos tu perfil al ${assignedTitle} y te sugerimos iniciar con ${courseTitle}.`,
      topicsToStudy: ['Variables y Flujos', 'Algoritmos y Estructuras', 'Proyectos Prácticos'],
      suggestedCourseSlug: courseSlug,
      suggestedCourseTitle: courseTitle,
      matchScore: 95,
    });

    if (typeof window !== 'undefined') {
      const email = this.currentStudentEmail();
      if (this.isDemoStudent()) {
        localStorage.setItem('syseng_diagnostic_completed', 'true');
        localStorage.setItem('syseng_diagnostic_result', JSON.stringify(result));
      } else {
        localStorage.setItem(this.getUserStorageKey('diagnostic_completed'), 'true');
        localStorage.setItem(this.getUserStorageKey('diagnostic_result'), JSON.stringify(result));
      }

      // Asignar el curso inicial recomendado automáticamente a las inscripciones del usuario
      const starterEnrollment: Enrollment = {
        id: Date.now(),
        user_id: this.auth.user()?.id || Date.now(),
        course_id: 1,
        enrolled_at: new Date().toISOString(),
        completed_at: undefined,
        progress_percent: 0,
        course: {
          id: 1,
          title: courseTitle,
          slug: courseSlug,
          description: 'Ruta inicial asignada según tu evaluación diagnóstica de lógica y preferencias.',
          duration_hours: 12,
          difficulty: 'beginner',
          is_free: true,
          category: { id: 1, name: 'Fundamentos', slug: 'programacion-basica' },
        } as any,
      };

      this.enrollments.set([starterEnrollment]);
      const enrKey = 'syseng_user_enrollments_' + email;
      localStorage.setItem(enrKey, JSON.stringify([starterEnrollment]));

      // Sincronizar en tiempo real el progreso de la actividad con el Panel Docente
      try {
        const currentUser = this.auth.user();
        if (currentUser?.email) {
          const cache = JSON.parse(localStorage.getItem('syseng_teacher_students_cache') || '[]');
          const idx = cache.findIndex((s: any) => s.email?.toLowerCase() === currentUser.email.toLowerCase());
          const quizPct = Math.round((score / 3) * 100);
          if (idx >= 0) {
            cache[idx].quizzes_taken_count = Math.max(cache[idx].quizzes_taken_count || 0, 1);
            cache[idx].average_quiz_score = quizPct;
            cache[idx].completed_lessons_count = Math.max(cache[idx].completed_lessons_count || 0, 1);
            cache[idx].courses = [{ id: 1, title: courseTitle, progress_percent: 10 }];
          }
          localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(cache));
          window.dispatchEvent(new CustomEvent('teacher:students-updated', { detail: currentUser }));
        }
      } catch {}
    }
  }

  restartDiagnostic() {
    this.diagnosticFinished.set(false);
    this.currentDiagQuestionIndex.set(0);
    this.selectedDiagAnswer.set(null);
    this.diagnosticAnswers = {};
  }

  loadLeaderboard(): void {
    const email = this.currentStudentEmail();
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    this.api.get<LeaderboardEntry[]>(`/leaderboard${query}`).subscribe({
      next: (entries) => {
        if (Array.isArray(entries)) {
          this.remoteLeaderboard.set(entries);
        }
      },
      error: () => {}
    });
  }

  completedCount(): number {
    return this.enrollments().filter(e => e.completed_at !== null || e.progress_percent === 100).length;
  }

  readonly solvedChallengesCount = computed(() => {
    if (this.isDemoStudent()) return 8;
    let count = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(this.getUserStorageKey('solved_challenges')) || '[]');
        if (Array.isArray(stored)) count += stored.length;
      } catch {}
    }
    return count;
  });

  readonly totalXp = computed(() => {
    if (this.isDemoStudent()) return 1685;

    const fromChallenges = this.solvedChallengesCount() * 50;
    const fromCourses = this.completedCount() * 150;
    const fromEnrollments = this.enrollments().length * 30;
    const diagBonus = this.diagnosticCompleted() ? 100 : 0;
    const streakBonus = Math.max(0, this.currentStreak() - 1) * 25;
    const welcomeBonus = 50;

    return welcomeBonus + fromChallenges + fromCourses + fromEnrollments + diagBonus + streakBonus;
  });

  readonly userLevel = computed(() => {
    if (this.isDemoStudent()) return 4;
    if (this.diagnosticCompleted()) {
      return this.diagnosticResult().assignedLevelNumber || 2;
    }
    return 1;
  });

  readonly xpProgressPercent = computed(() => {
    if (this.isDemoStudent()) return 85;
    return this.totalXp() % 100;
  });

  readonly xpToNextLevel = computed(() => {
    if (this.isDemoStudent()) return 15;
    return 100 - (this.totalXp() % 100);
  });

  readonly rankTitle = computed(() => {
    if (this.isDemoStudent()) return 'Arquitecto Principal de Sistemas';
    const lvl = this.userLevel();
    if (!this.diagnosticCompleted()) return 'Cadete de Sistemas (Nivel 1)';
    if (lvl >= 4)  return 'Desarrollador Junior Avanzado (Nivel 4)';
    if (lvl >= 3)  return 'Desarrollador Intermedio (Nivel 3)';
    if (lvl >= 2)  return 'Iniciación al Desarrollo (Nivel 2)';
    return 'Cadete de Sistemas (Nivel 1)';
  });

  readonly specialization = computed(() => {
    if (this.isDemoStudent()) {
      return { title: 'Sistemas Backend & APIs Distribuidas', icon: 'server' };
    }
    if (this.diagnosticCompleted()) {
      const spec = this.diagnosticResult().recommendedSpecialty || 'Fundamentos de Programación';
      let icon = 'terminal';
      const s = spec.toLowerCase();
      if (s.includes('backend') || s.includes('servidor')) icon = 'server';
      else if (s.includes('frontend') || s.includes('web')) icon = 'layout';
      else if (s.includes('algo') || s.includes('lógica')) icon = 'zap';
      return { title: spec, icon };
    }
    return { title: 'Por definir (Prueba Diagnóstica Pendiente)', icon: 'file-text' };
  });

  myRank(): number {
    const me = this.leaderboard().find(e => e.isCurrentUser);
    return me ? me.rank : 1;
  }

  readonly badges = computed<AchievementBadge[]>(() => {
    if (this.isDemoStudent()) {
      return [
        {
          id: 'welcome_cadet',
          title: 'Bienvenido a la Academia',
          category: 'special',
          icon: 'graduation-cap',
          description: 'Creaste y activaste tu cuenta de estudiante.',
          requirement: 'Cuenta verificada',
          targetCount: 1,
          currentCount: 1,
          progressPercent: 100,
          unlocked: true,
          level: 'bronze',
          shaFingerprint: 'sha256:01a9b2c3d4e5f6',
        },
        {
          id: 'challenge_1',
          title: 'Primer Algoritmo CLI',
          category: 'challenges',
          icon: 'code',
          description: 'Compilaste tu primer reto interactivo.',
          requirement: 'Resuelve 1 reto',
          targetCount: 1,
          currentCount: 1,
          progressPercent: 100,
          unlocked: true,
          level: 'bronze',
          shaFingerprint: 'sha256:7f8a91b2c4e5f6a1',
        },
        {
          id: 'streak_fire',
          title: 'Disciplina & Constancia',
          category: 'special',
          icon: 'flame',
          description: 'Mantuviste una racha de estudio de al menos 5 días.',
          requirement: 'Racha >= 5 días',
          targetCount: 5,
          currentCount: 5,
          progressPercent: 100,
          unlocked: true,
          level: 'silver',
          shaFingerprint: 'sha256:f5e4d3c2b1a09876',
        },
      ];
    }

    const hasDiag = this.diagnosticCompleted();
    const challenges = this.solvedChallengesCount();
    const streak = this.currentStreak();
    const enrollmentsCount = this.enrollments().length;
    const completedCourses = this.completedCount();
    const studyMins = this.todayStudyMinutes();

    return [
      {
        id: 'welcome_cadet',
        title: 'Bienvenido a la Academia',
        category: 'special',
        icon: 'graduation-cap',
        description: 'Creaste y activaste tu cuenta de estudiante en SysEng.',
        requirement: 'Registro y activación',
        targetCount: 1,
        currentCount: 1,
        progressPercent: 100,
        unlocked: true,
        level: 'bronze',
        shaFingerprint: 'sha256:01a9b2c3d4e5f6',
      },
      {
        id: 'diagnostic_done',
        title: 'Calibración de Nivel',
        category: 'special',
        icon: 'zap',
        description: 'Completaste la prueba diagnóstica y definiste tu ruta inicial.',
        requirement: 'Completar examen inicial',
        targetCount: 1,
        currentCount: hasDiag ? 1 : 0,
        progressPercent: hasDiag ? 100 : 0,
        unlocked: hasDiag,
        level: 'silver',
        shaFingerprint: 'sha256:c7d8e9f0a1b2c3',
      },
      {
        id: 'challenge_1',
        title: 'Primer Algoritmo CLI',
        category: 'challenges',
        icon: 'code',
        description: 'Compilaste tu primer reto interactivo en la terminal.',
        requirement: 'Resuelve 1 reto',
        targetCount: 1,
        currentCount: challenges >= 1 ? 1 : 0,
        progressPercent: Math.min(100, challenges * 100),
        unlocked: challenges >= 1,
        level: 'bronze',
        shaFingerprint: 'sha256:7f8a91b2c4e5f6a1',
      },
      {
        id: 'challenge_master',
        title: 'Maestro de Algoritmos',
        category: 'challenges',
        icon: 'target',
        description: 'Superaste con éxito 3 retos de práctica y código.',
        requirement: 'Resuelve 3 retos',
        targetCount: 3,
        currentCount: Math.min(3, challenges),
        progressPercent: Math.min(100, Math.round((challenges / 3) * 100)),
        unlocked: challenges >= 3,
        level: 'gold',
        shaFingerprint: 'sha256:9a8b7c6d5e4f3a2b',
      },
      {
        id: 'streak_3',
        title: 'Hábito de Código',
        category: 'special',
        icon: 'flame',
        description: 'Estudiaste durante 3 días consecutivos en la plataforma.',
        requirement: 'Racha >= 3 días',
        targetCount: 3,
        currentCount: Math.min(3, streak),
        progressPercent: Math.min(100, Math.round((streak / 3) * 100)),
        unlocked: streak >= 3,
        level: 'bronze',
        shaFingerprint: 'sha256:3d3e3f4a5b6c7d8e',
      },
      {
        id: 'streak_fire',
        title: 'Disciplina & Constancia',
        category: 'special',
        icon: 'flame',
        description: 'Mantuviste una racha de estudio ininterrumpida de al menos 5 días.',
        requirement: 'Racha >= 5 días',
        targetCount: 5,
        currentCount: streak,
        progressPercent: Math.min(100, Math.round((streak / 5) * 100)),
        unlocked: streak >= 5,
        level: 'silver',
        shaFingerprint: 'sha256:f5e4d3c2b1a09876',
      },
      {
        id: 'course_explorer',
        title: 'Explorador Técnico',
        category: 'courses',
        icon: 'book-open',
        description: 'Te inscribiste en al menos 2 cursos del pensum institucional.',
        requirement: 'Inscribirse en 2 cursos',
        targetCount: 2,
        currentCount: Math.min(2, enrollmentsCount),
        progressPercent: Math.min(100, Math.round((enrollmentsCount / 2) * 100)),
        unlocked: enrollmentsCount >= 2,
        level: 'bronze',
        shaFingerprint: 'sha256:e1d2c3b4a5f60718',
      },
      {
        id: 'course_master',
        title: 'Graduado de Cátedra',
        category: 'courses',
        icon: 'trophy',
        description: 'Completaste al 100% tu primer curso oficial en SysEng Academy.',
        requirement: 'Completar 1 curso',
        targetCount: 1,
        currentCount: completedCourses >= 1 ? 1 : 0,
        progressPercent: completedCourses >= 1 ? 100 : 0,
        unlocked: completedCourses >= 1,
        level: 'gold',
        shaFingerprint: 'sha256:b1a2c3d4e5f60789',
      },
      {
        id: 'terminal_veteran',
        title: 'Veterano de Terminal',
        category: 'special',
        icon: 'terminal',
        description: 'Superaste con destreza desafíos técnicos y ejercicios de práctica.',
        requirement: 'Resuelve 5 retos',
        targetCount: 5,
        currentCount: Math.min(5, challenges),
        progressPercent: Math.min(100, Math.round((challenges / 5) * 100)),
        unlocked: challenges >= 5,
        level: 'silver',
        shaFingerprint: 'sha256:4a5b6c7d8e9f0123',
      },
      {
        id: 'study_marathon',
        title: 'Enfoque Profundo',
        category: 'special',
        icon: 'clock',
        description: 'Dedicaste más de 15 minutos de estudio y código en la plataforma.',
        requirement: 'Estudio >= 15 min',
        targetCount: 15,
        currentCount: Math.min(15, studyMins),
        progressPercent: Math.min(100, Math.round((studyMins / 15) * 100)),
        unlocked: studyMins >= 15,
        level: 'silver',
        shaFingerprint: 'sha256:8f7e6d5c4b3a2019',
      },
    ];
  });

  readonly unlockedBadgesCount = computed(() => this.badges().filter(b => b.unlocked).length);
  readonly filteredBadges = computed<AchievementBadge[]>(() => {
    const filter = this.selectedBadgeFilter();
    const all = this.badges();
    if (filter === 'unlocked') return all.filter(b => b.unlocked);
    if (filter === 'challenges') return all.filter(b => b.category === 'challenges');
    if (filter === 'courses') return all.filter(b => b.category === 'courses');
    return all;
  });

  readonly leaderboard = computed<LeaderboardEntry[]>(() => {
    const remote = this.remoteLeaderboard();
    const myEmail = this.currentStudentEmail().toLowerCase().trim();

    if (remote && remote.length > 0) {
      return remote.map((entry: any, idx) => {
        const isMe = (entry.email?.toLowerCase().trim() === myEmail) || entry.isCurrentUser || entry.is_current_user;
        const rank = idx + 1;
        let badge = 'ACTIVO';
        if (rank === 1) badge = 'ORO';
        else if (rank === 2) badge = 'PLATA';
        else if (rank === 3) badge = 'BRONCE';

        const name = (entry.name && String(entry.name).trim().length > 0)
          ? String(entry.name).trim()
          : (entry.user_name && String(entry.user_name).trim().length > 0)
            ? String(entry.user_name).trim()
            : (entry.email ? String(entry.email).split('@')[0] : 'Estudiante');

        const nameParts = name.split(/\s+/);
        const autoAvatar = nameParts.length >= 2
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : name.slice(0, 2).toUpperCase();

        const xp = Number(entry.xp || 100);
        const level = Number(entry.level) || Math.max(1, Math.min(5, Math.floor(xp / 150) + 1));
        const rankTitles = ['Junior Dev', 'Algorithmic Solver', 'Systems Builder', 'Junior Engineer', 'Master Architect'];
        const rankTitle = entry.rankTitle || rankTitles[level - 1] || 'Junior Dev';

        return {
          ...entry,
          rank,
          id: entry.id || entry.user_id,
          name: name,
          email: entry.email || '',
          avatarText: entry.avatarText || autoAvatar,
          level: isMe ? this.userLevel() : level,
          rankTitle: isMe ? this.rankTitle() : rankTitle,
          specialization: entry.specialization || (isMe ? this.specialization().title : 'Ingeniería de Software'),
          completedLessons: entry.completedLessons ?? entry.completed_lessons_count ?? 0,
          avgQuizScore: entry.avgQuizScore ?? entry.average_quiz_score ?? 100,
          xp: isMe ? (this.totalXp() || xp) : xp,
          isCurrentUser: isMe,
          badgePill: badge,
        };
      });
    }

    // Generar ranking en tiempo real con TODOS los estudiantes registrados en el sistema
    const studentsMap = new Map<string, { name: string; email: string; xp: number; completedCount: number; avgQuiz: number }>();

    // 1. Estudiante activo en sesión
    const currentUser = this.auth.user();
    if (currentUser && currentUser.email) {
      const email = currentUser.email.toLowerCase().trim();
      studentsMap.set(email, {
        name: currentUser.name || 'Estudiante',
        email,
        xp: this.totalXp() || 50,
        completedCount: this.completedCount() || 0,
        avgQuiz: 100,
      });
    }

    // 2. Alumnos registrados en el sistema
    if (typeof window !== 'undefined') {
      try {
        const rawReg = localStorage.getItem('syseng_registered_users');
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            for (const item of list) {
              const u = item.user;
              if (!u || !u.email) continue;
              const email = u.email.toLowerCase().trim();
              if (u.role === 'admin' || u.role === 'instructor') continue; // Docente
              if (email === 'estudiante@sysengacademy.dev') continue; // Mock

              if (!studentsMap.has(email)) {
                let completed = 0;
                const compRaw = localStorage.getItem(`syseng_${email}_completed_lessons`);
                if (compRaw) {
                  try { completed = JSON.parse(compRaw).length; } catch {}
                }

                let score = 85;
                const diagRaw = localStorage.getItem(`syseng_${email}_diagnostic_result`);
                if (diagRaw) {
                  try {
                    const diag = JSON.parse(diagRaw);
                    if (diag && typeof diag.score === 'number') {
                      score = Math.round((diag.score / 3) * 100);
                    }
                  } catch {}
                }

                const studentXp = 50 + (completed * 80) + Math.round((score / 100) * 40);
                studentsMap.set(email, {
                  name: u.name || 'Estudiante',
                  email,
                  xp: studentXp,
                  completedCount: completed,
                  avgQuiz: score,
                });
              }
            }
          }
        }

        // 3. Alumnos en cache docente
        const rawCache = localStorage.getItem('syseng_teacher_students_cache');
        if (rawCache) {
          const cacheList = JSON.parse(rawCache);
          if (Array.isArray(cacheList)) {
            for (const st of cacheList) {
              if (!st.email) continue;
              const email = st.email.toLowerCase().trim();
              if (st.role === 'admin' || st.role === 'instructor') continue;

              const existing = studentsMap.get(email);
              const doneCount = st.completed_lessons_count || 0;
              const avg = st.average_quiz_score || 80;
              const calculatedXp = 50 + (doneCount * 80) + Math.round((avg / 100) * 40);

              if (existing) {
                existing.completedCount = Math.max(existing.completedCount, doneCount);
                existing.xp = Math.max(existing.xp, calculatedXp);
              } else {
                studentsMap.set(email, {
                  name: st.name || 'Estudiante',
                  email,
                  xp: calculatedXp,
                  completedCount: doneCount,
                  avgQuiz: avg,
                });
              }
            }
          }
        }
      } catch {}
    }

    const sortedList = Array.from(studentsMap.values()).sort((a, b) => b.xp - a.xp);
    if (sortedList.length === 0) {
      const myName = currentUser?.name || 'Estudiante';
      return [{
        rank: 1,
        name: myName,
        email: myEmail,
        avatarText: myName.slice(0, 2).toUpperCase(),
        level: this.userLevel(),
        rankTitle: this.rankTitle(),
        specialization: this.specialization().title,
        completedLessons: this.completedCount(),
        avgQuizScore: 100,
        xp: this.totalXp() || 50,
        isCurrentUser: true,
        badgePill: 'ORO',
      }];
    }

    return sortedList.map((st, idx) => {
      const rank = idx + 1;
      const isMe = st.email === myEmail;
      let badge = 'ACTIVO';
      if (rank === 1) badge = 'ORO';
      else if (rank === 2) badge = 'PLATA';
      else if (rank === 3) badge = 'BRONCE';

      const name = (st.name && st.name.trim().length > 0)
        ? st.name.trim()
        : (st.email ? st.email.split('@')[0] : 'Estudiante');

      const nameParts = name.split(/\s+/);
      const autoAvatar = nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();

      const level = Math.max(1, Math.min(5, Math.floor(st.xp / 150) + 1));
      const rankTitles = ['Junior Dev', 'Algorithmic Solver', 'Systems Builder', 'Junior Engineer', 'Master Architect'];
      const rankTitle = rankTitles[level - 1] || 'Junior Dev';

      return {
        rank,
        name: name,
        email: st.email,
        avatarText: autoAvatar,
        level: isMe ? this.userLevel() : level,
        rankTitle: isMe ? this.rankTitle() : rankTitle,
        specialization: isMe ? this.specialization().title : 'Ingeniería de Software',
        completedLessons: st.completedCount,
        avgQuizScore: st.avgQuiz,
        xp: st.xp,
        isCurrentUser: isMe,
        badgePill: badge,
      };
    });
  });
}
