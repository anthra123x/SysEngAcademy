import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

export interface DiagnosticQuestion {
  id: string;
  topic: string;
  category: 'logic' | 'oop' | 'database' | 'architecture' | 'specialty';
  title: string;
  prompt: string;
  codeSnippet?: string;
  options: { id: string; label: string; explanation?: string }[];
  correctAnswer?: string;
}

export interface SyllabusPhase {
  phaseNumber: number;
  phaseTitle: string;
  courseTitle: string;
  courseSlug: string;
  description: string;
  estimatedHours: number;
  skillsGained: string[];
}

export interface DiagnosticAnalysisResult {
  score: number;
  totalTechnical: number;
  levelNumber: number;
  levelTitle: string;
  recommendedSpecialty: string;
  recommendedPathSlug: string;
  recommendedPathTitle: string;
  primaryCourseSlug: string;
  primaryCourseTitle: string;
  competencyBreakdown: {
    logic: number;
    oop: number;
    database: number;
    architecture: number;
  };
  syllabus: SyllabusPhase[];
  agentFeedback: string;
  completedAt: string;
}

export interface TourHighlightItem {
  icon: string;
  title: string;
  desc: string;
}

export interface TourStepDefinition {
  step: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  routeLocation: string;
  routeLink: string;
  highlights: TourHighlightItem[];
  ctaText: string;
}

import { AppIconComponent } from '../../shared/components/app-icon.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppIconComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

  // Etapas del onboarding
  readonly stage = signal<'welcome' | 'tour' | 'mission' | 'assessment' | 'analyzing' | 'results'>('welcome');
  readonly tourStep = signal<number>(1);
  readonly totalTourSteps = 5;

  readonly tourSteps: TourStepDefinition[] = [
    {
      step: 1,
      badge: 'COMPONENTE 01 // NAVEGACIÓN Y COCKPIT',
      title: 'Inicio & Cockpit Central',
      subtitle: 'Tu base de operaciones diaria en SysEng Academy',
      description: 'Desde aquí tienes acceso inmediato a tu racha de estudio diaria (🔥), notificaciones sin leer, tus métricas de práctica y la última lección activa recomendada.',
      routeLocation: 'Página de Inicio ( / )',
      routeLink: '/',
      highlights: [
        { icon: 'home', title: 'Acceso Directo a tu Lección', desc: 'Retoma de inmediato la materia en la que estabas practicando con un solo clic.' },
        { icon: 'flame', title: 'Racha de Estudio y Notificaciones', desc: 'Protege tu racha diaria y revisa avisos de logros en la campanita superior.' },
        { icon: 'sparkles', title: 'Asistente Byte IA Siempre Listo', desc: 'Tu tutor pedagógico listo para resolver dudas en el momento.' }
      ],
      ctaText: 'Siguiente: Rutas de Aprendizaje →'
    },
    {
      step: 2,
      badge: 'COMPONENTE 02 // MALLAS CURRICULARES',
      title: 'Rutas de Aprendizaje Especializadas',
      subtitle: 'Trayectorias formativas estructuradas de inicio a fin',
      description: 'Nuestras 9 rutas de aprendizaje organizan los cursos en fases secuenciales para que construyas bases sólidas de ingeniería sin vacíos conceptuales.',
      routeLocation: 'Rutas de Aprendizaje ( /rutas )',
      routeLink: '/rutas',
      highlights: [
        { icon: 'map', title: '9 Especialidades Oficiales', desc: 'Backend, Frontend, Full Stack, POO, DevOps, IA, Git, Requerimientos y Fundamentos.' },
        { icon: 'git-branch', title: 'Progresión por Fases', desc: 'Avanza secuencialmente desde conceptos base hasta arquitecturas avanzadas.' },
        { icon: 'award', title: 'Acreditación de Mérito', desc: 'Cada ruta completada valida tus competencias con certificación verificable.' }
      ],
      ctaText: 'Siguiente: Catálogo de Cursos →'
    },
    {
      step: 3,
      badge: 'COMPONENTE 03 // CATÁLOGO FORMATIVO',
      title: 'Catálogo de Cursos & Módulos',
      subtitle: '44 asignaturas prácticas con lecciones y retos',
      description: 'Explora el catálogo completo con filtros por dificultad y tecnología. Cada curso incluye temarios desglosados, tiempo estimado y prácticas en código.',
      routeLocation: 'Catálogo de Cursos ( /cursos )',
      routeLink: '/cursos',
      highlights: [
        { icon: 'book-open', title: '44 Cursos Disponibles', desc: 'Cursos completos en Python, Laravel, Angular, Docker, SQL, Java y Linux.' },
        { icon: 'filter', title: 'Filtros por Nivel', desc: 'Clasificados rigurosamente en Principiante, Intermedio y Avanzado.' },
        { icon: 'layers', title: 'Temarios Claros y Transparentes', desc: 'Consulta el índice detallado de cada módulo antes de inscribirte.' }
      ],
      ctaText: 'Siguiente: Reproductor e IDE →'
    },
    {
      step: 4,
      badge: 'COMPONENTE 04 // ENTORNO DE PRÁCTICA',
      title: 'Reproductor de Lecciones con Editor & Byte IA',
      subtitle: 'El corazón práctico: teoría, código en vivo y tutor socrático',
      description: 'Aprende haciendo. Lee la teoría, escribe código en el editor interactivo y ejecuta pruebas en el sandbox. Si te bloqueas, consulta a Byte IA para recibir pistas socráticas.',
      routeLocation: 'Reproductor de Lecciones ( /cursos/:slug/leccion/:slug )',
      routeLink: '/cursos',
      highlights: [
        { icon: 'terminal', title: 'Editor de Código con Terminal', desc: 'Escribe, compila y ejecuta directamente en el navegador sin configurar nada.' },
        { icon: 'check-circle', title: 'Batería de Pruebas Automáticas', desc: 'Valida tu lógica al instante con tests unitarios integrados.' },
        { icon: 'bot', title: 'Tutor Socrático Byte IA', desc: 'Respuestas pedagógicas que guían tu razonamiento sin darte la solución masticada.' }
      ],
      ctaText: 'Siguiente: Perfil & Racha →'
    },
    {
      step: 5,
      badge: 'COMPONENTE 05 // HISTORIAL Y MÉTRICAS',
      title: 'Perfil del Estudiante, Métricas & Logros',
      subtitle: 'Tu expediente de crecimiento como futuro ingeniero',
      description: 'Monitorea tus horas acumuladas de estudio, tu racha activa, tu nivel y XP, el dictamen diagnóstico de calibración y tu vitrina de insignias desbloqueadas.',
      routeLocation: 'Perfil del Estudiante ( /perfil )',
      routeLink: '/perfil',
      highlights: [
        { icon: 'user', title: 'Expediente y Nivel XP', desc: 'Sigue tu evolución de Cadete hasta Desarrollador Senior mediante puntos de experiencia.' },
        { icon: 'flame', title: 'Calendario de Rachas', desc: 'Registra tus días consecutivos de práctica y recupera rachas congeladas.' },
        { icon: 'shield', title: 'Dictamen Diagnóstico Guardado', desc: 'Revisa siempre las recomendaciones personalizadas emitidas por la IA.' }
      ],
      ctaText: 'Finalizar Tour y Elegir mi Misión →'
    }
  ];

  readonly currentTour = computed(() => this.tourSteps[this.tourStep() - 1]);

  // Estado del usuario
  readonly user = this.auth.user;
  readonly studentFirstName = computed(() => {
    const full = this.user()?.name || 'Estudiante';
    return full.split(' ')[0];
  });

  readonly currentStageIndex = computed(() => {
    switch (this.stage()) {
      case 'welcome': return 1;
      case 'tour': return 2;
      case 'mission': return 3;
      case 'assessment':
      case 'analyzing': return 4;
      case 'results': return 5;
      default: return 1;
    }
  });

  readonly stageProgressPercent = computed(() => {
    return (this.currentStageIndex() / 5) * 100;
  });

  exitTour(): void {
    this.router.navigate(['/']);
  }

  // Estado del examen diagnóstico
  readonly currentQuestionIndex = signal<number>(0);
  readonly selectedOption = signal<string | null>(null);
  readonly userAnswers = signal<Record<string, string>>({});
  readonly analysisResult = signal<DiagnosticAnalysisResult | null>(null);
  readonly aiEvaluationFailed = signal(false);
  readonly aiEvaluationInProgress = signal(false);

  // Preguntas de razonamiento técnico y calibración diagnóstica
  readonly questions: DiagnosticQuestion[] = [
    {
      id: 'q_background',
      topic: 'Punto de Partida & Experiencia Previa',
      category: 'specialty',
      title: '¿Cuál es tu trayectoria previa con el código?',
      prompt: 'Para calibrar tu ruta de aprendizaje de forma realista y honesta, cuéntanos cuál ha sido tu contacto real con la programación hasta el momento:',
      options: [
        { id: 'exp_zero', label: 'Principiante absoluto: Estoy empezando desde cero, nunca he programado o apenas he leído nociones muy básicas.' },
        { id: 'exp_basics', label: 'Autodidacta inicial: He seguido tutoriales o cursos introductorios y conozco variables y condicionales, pero me cuesta construir código propio.' },
        { id: 'exp_academic', label: 'Estudiante / Nivel académico: Estudio ingeniería de sistemas o afines, resuelvo algoritmos y he desarrollado proyectos de práctica.' },
        { id: 'exp_practicing', label: 'Desarrollador con práctica: Construyo o he construido aplicaciones completas con persistencia, bases de datos y APIs.' }
      ]
    },
    {
      id: 'q_logic',
      topic: 'Razonamiento Algorítmico & Control de Flujo',
      category: 'logic',
      title: 'Trazabilidad de Bucles y Estados de Variables',
      prompt: 'Un algoritmo procesa una secuencia de transacciones en un acumulador en memoria. Analiza la ejecución de las instrucciones paso a paso. ¿Cuál será el valor final de "balance" tras completar la iteración?',
      codeSnippet: `let balance = 10;
const transacciones = [15, -8, 20, -5];

for (const t of transacciones) {
    if (t > 0) {
        balance += (t > 10 ? t - 2 : t);
    } else {
        balance += (balance > 25 ? t * 2 : t);
    }
}`,
      options: [
        { id: 'a', label: '23 (Paso 1: 10 + 13 = 23; Paso 2: 23 - 8 = 15; Paso 3: 15 + 18 = 33; Paso 4: 33 + (-10) = 23)' },
        { id: 'b', label: '32 (Aplica sumas directas sin evaluar la condición de umbral de saldo)' },
        { id: 'c', label: '18 (Aplica penalización doble a todas las transacciones negativas)' },
        { id: 'd', label: '27 (Omite el descuento de 2 unidades en transacciones mayores a 10)' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q_oop',
      topic: 'Paradigma Orientado a Objetos & Gestión de Memoria',
      category: 'oop',
      title: 'Instancias y Mutación de Referencias en Memoria',
      prompt: 'En un lenguaje orientado a objetos, se instancian dos variables asociadas a una clase. ¿Qué ocurre en memoria al alterar el estado de una de ellas y cuál es el resultado de la comparación de identidad?',
      codeSnippet: `class SesionUsuario {
    constructor(public token: string, public activa: boolean) {}
}

const s1 = new SesionUsuario('auth_99', true);
const s2 = s1;
s2.activa = false;

console.log(s1.activa, s1 === s2);`,
      options: [
        { id: 'a', label: 'false true (Los objetos se asignan por referencia; s2 y s1 apuntan a la misma dirección en el Heap, por lo que mutar s2 altera s1 y la comparación de identidad es verdadera).' },
        { id: 'b', label: 'true false (s2 es una copia superficial independiente generada al asignar, manteniendo el estado de s1 intacto).' },
        { id: 'c', label: 'true true (El estado de s1 está protegido por encapsulamiento y no puede mutar).' },
        { id: 'd', label: 'Error de ejecución en tiempo de compilación por reasignación de puntero constante.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q_database',
      topic: 'Persistencia de Datos & Consultas SQL',
      category: 'database',
      title: 'Consultas Relacionales, Agrupaciones y Uniones (JOIN)',
      prompt: 'En un esquema relacional con tablas "usuarios" y "pedidos", necesitas listar a TODOS los usuarios junto a la cantidad total de pedidos que tienen, mostrando 0 para aquellos usuarios que aún no tienen ningún pedido. ¿Cuál es la consulta SQL correcta?',
      codeSnippet: `-- Tabla: usuarios (id, nombre, email)
-- Tabla: pedidos (id, usuario_id, total, created_at)`,
      options: [
        { id: 'a', label: 'SELECT u.nombre, COUNT(p.id) FROM usuarios u LEFT JOIN pedidos p ON u.id = p.usuario_id GROUP BY u.id, u.nombre;' },
        { id: 'b', label: 'SELECT u.nombre, COUNT(p.id) FROM usuarios u INNER JOIN pedidos p ON u.id = p.usuario_id;' },
        { id: 'c', label: 'SELECT u.nombre, SUM(p.id) FROM usuarios u RIGHT JOIN pedidos p ON u.id = p.usuario_id;' },
        { id: 'd', label: 'SELECT u.nombre, (SELECT * FROM pedidos) FROM usuarios u WHERE u.id IS NOT NULL;' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q_architecture',
      topic: 'Arquitectura Web, Protocolo HTTP & APIs RESTful',
      category: 'architecture',
      title: 'Semántica de Verbos HTTP y Códigos de Estado REST',
      prompt: 'Un cliente frontend envía una petición HTTP para actualizar parcialmente el estado de un recurso (ej. marcar una notificación como leída). El servidor procesa la modificación exitosamente y no necesita devolver contenido en el cuerpo de la respuesta. ¿Qué método HTTP y código de estado corresponden según la especificación REST?',
      codeSnippet: `// Actualización puntual de estado en endpoint REST
METODO /api/notificaciones/42/leer HTTP/1.1`,
      options: [
        { id: 'a', label: 'PATCH (o POST según diseño de acción puntual) con respuesta de estado 204 No Content.' },
        { id: 'b', label: 'GET con respuesta de estado 200 OK y cuerpo JSON vacío.' },
        { id: 'c', label: 'PUT con respuesta de estado 301 Moved Permanently.' },
        { id: 'd', label: 'DELETE con respuesta de estado 201 Created.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q_optimization',
      topic: 'Estructuras de Datos & Complejidad Algorítmica (Big-O)',
      category: 'logic',
      title: 'Estructura Óptima para Consultas de Alta Concurrencia',
      prompt: 'Necesitas verificar si un identificador de usuario existe dentro de un conjunto de 500.000 registros, ejecutando cientos de comprobaciones por segundo. ¿Qué estructura de datos ofrece la complejidad temporal óptima para esta operación?',
      codeSnippet: `// Operación crítica: contains(userId)
// Volumen: 500.000 identificadores en memoria`,
      options: [
        { id: 'a', label: 'Tabla Hash / Set (Conjunto): Ofrece complejidad promedio O(1) de tiempo constante mediante cálculo de índice hash.' },
        { id: 'b', label: 'Arreglo secuencial no ordenado (Array): Ofrece complejidad lineal O(N) recorriendo elemento por elemento.' },
        { id: 'c', label: 'Cola FIFO (Queue): Restringe el acceso al frente para reducir el consumo de memoria.' },
        { id: 'd', label: 'Pila LIFO (Stack): Permite invertir los datos para garantizar búsquedas en tiempo O(log N).' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q_specialty',
      topic: 'Aspiración Técnica & Especialidad',
      category: 'specialty',
      title: 'Tu Especialidad & Meta Técnica Prioritaria',
      prompt: '¿En qué área de la ingeniería de software deseas enfocarte prioritariamente en SysEngAcademy?',
      options: [
        { id: 'backend', label: 'Desarrollo Backend & APIs: Servidores, bases de datos SQL, persistencia y lógica distribuida.' },
        { id: 'frontend', label: 'Desarrollo Frontend & Web: Interfaces reactivas modernas, componentes UI, experiencia de usuario y CSS/DOM.' },
        { id: 'fullstack', label: 'Desarrollo Full Stack: Construcción de punta a punta, autenticación JWT, APIs e interfaces web completas.' },
        { id: 'poo', label: 'Arquitectura de Software Orientada a Objetos: Modularidad limpia, principios SOLID y patrones de diseño GoF.' },
        { id: 'devops', label: 'DevOps & Automatización Cloud: Terminal Linux, contenedores Docker, CI/CD y despliegues continuos.' },
        { id: 'ia', label: 'Inteligencia Artificial Aplicada: Integración de modelos LLM, prompting estructurado, RAG y agentes inteligentes.' },
        { id: 'algoritmos', label: 'Lógica Algorítmica & Ciencias de la Computación: Estructuras de datos, acertijos de lógica pura y optimización asintótica.' }
      ]
    }
  ];

  readonly currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
  readonly progressPercentage = computed(() =>
    Math.round(((this.currentQuestionIndex() + 1) / this.questions.length) * 100)
  );

  ngOnInit() {
    // Si ya completó el diagnóstico previamente y llega aquí, cargamos sus resultados locales
    const existing = this.auth.getDiagnosticResult();
    if (existing && existing.syllabus) {
      this.analysisResult.set(existing);
      this.stage.set('results');
    }

    // Sincronizar con el diagnóstico oficial almacenado en el backend
    this.api.get<{ success: boolean; result: DiagnosticAnalysisResult }>('/ai/diagnostic').subscribe({
      next: (res) => {
        if (res?.success && res?.result) {
          this.analysisResult.set(res.result);
          this.auth.saveDiagnosticResult(res.result);
          this.stage.set('results');
        }
      },
      error: () => {}
    });

    // Aleatorizar el orden de opciones en cada pregunta técnica
    this.shuffleQuestionOptions();
  }

  /**
   * Baraja las opciones de cada pregunta técnica preservando la referencia
   * correctAnswer (ya que es un ID, no un índice). Las preguntas de
   * preferencia (specialty) no se barajan porque no tienen respuesta correcta.
   */
  private shuffleQuestionOptions(): void {
    for (const q of this.questions) {
      if (q.category === 'specialty') continue;
      // Fisher-Yates shuffle
      const opts = q.options;
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
    }
  }

  goToTour(): void {
    this.startTour();
  }

  startTour(): void {
    this.stage.set('tour');
    this.tourStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextTourStep(): void {
    if (this.tourStep() < this.totalTourSteps) {
      this.tourStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.finishTourToMission();
    }
  }

  prevTourStep(): void {
    if (this.tourStep() > 1) {
      this.tourStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.stage.set('welcome');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  setTourStep(step: number): void {
    if (step >= 1 && step <= this.totalTourSteps) {
      this.tourStep.set(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  finishTourToMission(): void {
    this.stage.set('mission');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  skipTourToMission(): void {
    this.stage.set('mission');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  selectMission(mission: 'diagnostic' | 'first_course' | 'explore_paths'): void {
    if (mission === 'diagnostic') {
      this.goToAssessment();
    } else if (mission === 'first_course') {
      this.router.navigate(['/cursos', 'introduccion-programacion']);
    } else if (mission === 'explore_paths') {
      this.router.navigate(['/rutas']);
    }
  }

  goToAssessment(): void {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    const firstQId = this.questions[0]?.id || 'q_background';
    this.selectedOption.set(this.userAnswers()[firstQId] || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextQuestion() {
    const sel = this.selectedOption();
    if (!sel) return;

    // Guardar respuesta actual
    const qId = this.currentQuestion().id;
    this.userAnswers.update(prev => ({ ...prev, [qId]: sel }));

    if (this.currentQuestionIndex() < this.questions.length - 1) {
      const nextIdx = this.currentQuestionIndex() + 1;
      this.currentQuestionIndex.set(nextIdx);
      const nextQ = this.questions[nextIdx];
      this.selectedOption.set(this.userAnswers()[nextQ.id] || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finalizar examen
      this.finishAssessment();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      const prevIdx = this.currentQuestionIndex() - 1;
      this.currentQuestionIndex.set(prevIdx);
      const prevQ = this.questions[prevIdx];
      this.selectedOption.set(this.userAnswers()[prevQ.id] || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private finishAssessment() {
    this.stage.set('analyzing');
    this.aiEvaluationInProgress.set(true);
    this.aiEvaluationFailed.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Intentar evaluación con IA primero
    this.evaluateWithAI().then((success) => {
      if (!success) {
        // Fallback a evaluación local determinística
        this.aiEvaluationFailed.set(true);
        this.computeDiagnosisAndSyllabus();
      }
      this.aiEvaluationInProgress.set(false);
      this.stage.set('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Envía las respuestas al backend para que la IA genere una evaluación
   * personalizada. Retorna true si tuvo éxito, false si debe usar fallback.
   */
  private async evaluateWithAI(): Promise<boolean> {
    try {
      const payload = {
        answers: this.userAnswers(),
        questions: this.questions.map(q => ({
          id: q.id,
          title: q.title,
          category: q.category,
          prompt: q.prompt,
          codeSnippet: q.codeSnippet || null,
          options: q.options,
          correctAnswer: q.correctAnswer || null,
        })),
        student_name: this.user()?.name || 'Estudiante',
        student_email: this.user()?.email || 'anon@syseng',
      };

      const response = await this.api.post<{
        success: boolean;
        fallback?: boolean;
        result?: DiagnosticAnalysisResult;
      }>('/ai/diagnostic', payload, 30000).toPromise();

      if (response?.success && response.result) {
        const aiResult = response.result;
        aiResult.completedAt = aiResult.completedAt || new Date().toISOString();
        this.analysisResult.set(aiResult);
        this.auth.saveDiagnosticResult(aiResult);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('syseng:diagnostic_completed', { detail: aiResult }));
        }
        return true;
      }

      return false;
    } catch (err) {
      console.warn('[Onboarding] Evaluación IA falló, usando fallback local:', err);
      return false;
    }
  }

  private computeDiagnosisAndSyllabus() {
    const answers = this.userAnswers();
    const totalTechnical = 5;

    // Evaluación por ejes técnicos específicos
    const isLogicOk = answers['q_logic'] === 'a';
    const isOopOk = answers['q_oop'] === 'a';
    const isDbOk = answers['q_database'] === 'a';
    const isArchOk = answers['q_architecture'] === 'a';
    const isOptOk = answers['q_optimization'] === 'a';

    let score = 0;
    if (isLogicOk) score++;
    if (isOopOk) score++;
    if (isDbOk) score++;
    if (isArchOk) score++;
    if (isOptOk) score++;

    // Desglose de competencias porcentuales (0-100)
    const logicScore = Math.min(100, (isLogicOk ? 50 : 15) + (isOptOk ? 50 : 15));
    const oopScore = isOopOk ? 95 : 25;
    const dbScore = isDbOk ? 95 : 20;
    const archScore = isArchOk ? 95 : 20;

    const backgroundExp = answers['q_background'] || 'exp_basics';
    const specialtyPref = answers['q_specialty'] || answers['q5'] || 'backend';

    // Calibración Crítica y Realista de Nivel (1 a 4)
    let levelNumber = 1;
    let levelTitle = 'Nivel 1: Cadete en Formación · Fundamentos & Pensamiento Computacional';

    if (score >= 5 && (backgroundExp === 'exp_academic' || backgroundExp === 'exp_practicing')) {
      levelNumber = 4;
      levelTitle = 'Nivel 4: Desarrollador Junior Avanzado · Pensamiento Sistémico & Arquitectura';
    } else if (score >= 4) {
      levelNumber = 3;
      levelTitle = 'Nivel 3: Desarrollador Junior · Autonomía Técnica & Construcción de Módulos';
    } else if (score >= 2 && backgroundExp !== 'exp_zero') {
      levelNumber = 2;
      levelTitle = 'Nivel 2: Desarrollador Trainee · Lógica Estructurada & Bases Consolidadas';
    } else {
      levelNumber = 1;
      levelTitle = 'Nivel 1: Cadete en Formación · Fundamentos & Pensamiento Computacional';
    }

    // Mapeo Canónico de Rutas y Cursos 100% Verificados en Base de Datos
    const catalogConfig: Record<string, {
      slug: string;
      title: string;
      specialty: string;
      levels: Record<number, Array<{
        title: string;
        slug: string;
        desc: string;
        hours: number;
        skills: string[];
      }>>;
    }> = {
      backend: {
        slug: 'desarrollo-backend',
        title: 'Ruta de Desarrollo Backend & Arquitectura de APIs',
        specialty: 'Desarrollo Backend & APIs Distribuidas',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Fundamentos de control de flujo, variables, condicionales y ciclos.', hours: 12, skills: ['Lógica Booleana', 'Estructuras de Control', 'Trazabilidad'] },
            { title: 'Programación Estructurada con Python', slug: 'python-estructurado', desc: 'Sintaxis limpia, funciones puras, colecciones y manejo de datos.', hours: 14, skills: ['Python Moderno', 'Funciones & Scope', 'Manipulación de Datos'] },
            { title: 'Introducción al Backend', slug: 'backend-introduccion', desc: 'Arquitectura cliente-servidor, procesamiento de peticiones y controladores.', hours: 14, skills: ['Cliente-Servidor', 'Controladores', 'Endpoints HTTP'] }
          ],
          2: [
            { title: 'Introducción al Backend', slug: 'backend-introduccion', desc: 'Arquitectura de servidores, controladores, middlewares y respuestas JSON.', hours: 14, skills: ['Cliente-Servidor', 'Controladores', 'Middlewares'] },
            { title: 'SQL desde Cero', slug: 'sql-desde-cero', desc: 'Bases de datos relacionales, claves foráneas, consultas SELECT, JOINs y agregaciones.', hours: 15, skills: ['PostgreSQL', 'JOINs & Agrupaciones', 'Integridad Referencial'] },
            { title: 'Diseño y Versionado de APIs RESTful', slug: 'diseno-apis-restful', desc: 'Estándares OpenAPI, contratos DTO tipados, respuestas predecibles y versionado.', hours: 16, skills: ['Contratos DTO', 'REST Best Practices', 'Paginación & Filtros'] }
          ],
          3: [
            { title: 'Diseño y Versionado de APIs RESTful', slug: 'diseno-apis-restful', desc: 'Contratos tipados, respuestas consistentes y estándares semánticos REST.', hours: 16, skills: ['Contratos DTO', 'REST Best Practices', 'Códigos HTTP'] },
            { title: 'APIs REST con Laravel', slug: 'apis-rest-con-laravel', desc: 'Construcción de APIs profesionales con validación de Requests y API Resources.', hours: 18, skills: ['Laravel Framework', 'API Resources', 'Inyección de Dependencias'] },
            { title: 'Modelos, Relaciones y Consultas', slug: 'modelos-relaciones-y-consultas', desc: 'ORM Eloquent avanzado, optimización de consultas, prevención de N+1 e índices.', hours: 18, skills: ['Eloquent ORM', 'Optimización SQL', 'Prevención N+1'] }
          ],
          4: [
            { title: 'Modelos, Relaciones y Consultas', slug: 'modelos-relaciones-y-consultas', desc: 'Optimización de consultas complejas, prevención de N+1 e indexación en base de datos.', hours: 18, skills: ['Eloquent ORM', 'Optimización SQL', 'Prevención N+1'] },
            { title: 'Seguridad en APIs', slug: 'seguridad-en-apis', desc: 'Hardening de endpoints, sanitización OWASP, rate limiting y autorización RBAC.', hours: 18, skills: ['OWASP Security', 'Rate Limiting', 'Sanitización Defensiva'] },
            { title: 'Proyecto Final: Arquitectura de Software Orientada a Objetos', slug: 'arquitectura-proyecto-poo', desc: 'Construcción de un backend modular desacoplado con arquitectura limpia y pruebas.', hours: 24, skills: ['Arquitectura Limpia', 'Patrón Repositorio', 'Clean Code'] }
          ]
        }
      },
      frontend: {
        slug: 'desarrollo-frontend',
        title: 'Ruta de Desarrollo Frontend & Experiencia de Usuario',
        specialty: 'Desarrollo Frontend & Interfaces Reactivas',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Lógica algorítmica, variables y estructuras de control indispensables.', hours: 12, skills: ['Pensamiento Lógico', 'Estructuras de Control', 'Variables'] },
            { title: 'Introducción al Desarrollo Web', slug: 'intro-desarrollo-web', desc: 'Navegadores, árbol DOM, DevTools y flujo de documentos en la web.', hours: 12, skills: ['Árbol DOM', 'DevTools', 'Arquitectura Web'] },
            { title: 'HTML, CSS y JavaScript', slug: 'html-css-javascript', desc: 'Maquetación estructurada, estilos modernos y manipulación interactiva con scripts.', hours: 14, skills: ['HTML5 Semántico', 'CSS3', 'JavaScript Vanilla'] }
          ],
          2: [
            { title: 'HTML, CSS y JavaScript', slug: 'html-css-javascript', desc: 'Estructura semántica, eventos en el DOM y lógica asíncrona client-side.', hours: 14, skills: ['HTML5 Semántico', 'Eventos DOM', 'Fetch API'] },
            { title: 'CSS Moderno: Flexbox, CSS Grid y Responsive Design', slug: 'css-moderno-flexbox-grid', desc: 'Maquetación adaptativa fluida con Flexbox, Grid y tokens de diseño CSS.', hours: 16, skills: ['Flexbox', 'CSS Grid', 'Mobile First'] },
            { title: 'TypeScript Profesional para Aplicaciones Frontend', slug: 'typescript-profesional-frontend', desc: 'Tipado estático robusto, interfaces, genéricos y seguridad en tipos.', hours: 16, skills: ['Tipado Estricto', 'Interfaces DTO', 'Genéricos en TS'] }
          ],
          3: [
            { title: 'TypeScript Profesional para Aplicaciones Frontend', slug: 'typescript-profesional-frontend', desc: 'Tipado seguro, manejo de interfaces y patrones de arquitectura client-side.', hours: 16, skills: ['Tipado Estricto', 'Interfaces DTO', 'Genéricos en TS'] },
            { title: 'Angular Moderno', slug: 'angular-moderno', desc: 'Componentes standalone, signals reactivas, control flow y servicios singleton.', hours: 20, skills: ['Signals & Reactividad', 'Standalone Components', 'Enrutamiento Client-Side'] },
            { title: 'Accesibilidad y Performance Web', slug: 'accesibilidad-y-performance-web', desc: 'Core Web Vitals, accesibilidad WCAG/ARIA y optimización de renderizado.', hours: 18, skills: ['Core Web Vitals', 'Accesibilidad ARIA', 'Optimización CWV'] }
          ],
          4: [
            { title: 'Angular Moderno', slug: 'angular-moderno', desc: 'Arquitectura modular escalable, reactividad con signals y manejo de estado.', hours: 20, skills: ['Signals & Reactividad', 'Standalone Components', 'Enrutamiento Client-Side'] },
            { title: 'Accesibilidad y Performance Web', slug: 'accesibilidad-y-performance-web', desc: 'Optimización de Core Web Vitals, presupuesto de rendimiento y auditorías.', hours: 18, skills: ['Core Web Vitals', 'Accesibilidad ARIA', 'Optimización CWV'] },
            { title: 'Integración Frontend ↔ Backend', slug: 'integracion-frontend-backend', desc: 'Consumo resiliente de APIs, interceptores HTTP, JWT y manejo global de errores.', hours: 18, skills: ['Interceptores HTTP', 'Manejo de Errores', 'Sincronización Asíncrona'] }
          ]
        }
      },
      fullstack: {
        slug: 'desarrollo-fullstack',
        title: 'Ruta de Desarrollo Full Stack Integral',
        specialty: 'Desarrollo Full Stack de Punta a Punta',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Fundamentos de control de flujo, lógica algorítmica y estructuras condicionales.', hours: 12, skills: ['Pensamiento Lógico', 'Estructuras de Control', 'Variables'] },
            { title: 'HTML, CSS y JavaScript', slug: 'html-css-javascript', desc: 'Maquetación, estilos básicos y dinamismo con JavaScript en el navegador.', hours: 14, skills: ['HTML5 Semántico', 'CSS3', 'JavaScript Vanilla'] },
            { title: 'Introducción al Backend', slug: 'backend-introduccion', desc: 'Principios de servidores, peticiones HTTP, controladores y endpoints.', hours: 14, skills: ['Cliente-Servidor', 'Controladores', 'Endpoints HTTP'] }
          ],
          2: [
            { title: 'Introducción al Desarrollo Web', slug: 'intro-desarrollo-web', desc: 'Bases de la arquitectura web cliente-servidor y manipulación del DOM.', hours: 12, skills: ['Árbol DOM', 'DevTools', 'Arquitectura Web'] },
            { title: 'Introducción al Backend', slug: 'backend-introduccion', desc: 'Construcción de servidores, middlewares y manejo de peticiones JSON.', hours: 14, skills: ['Cliente-Servidor', 'Controladores', 'Middlewares'] },
            { title: 'Integración Frontend ↔ Backend', slug: 'integracion-frontend-backend', desc: 'Conexión de vistas con APIs REST, interceptores y manejo de respuestas.', hours: 18, skills: ['Interceptores HTTP', 'Consumo de APIs', 'Sincronización'] }
          ],
          3: [
            { title: 'Integración Frontend ↔ Backend', slug: 'integracion-frontend-backend', desc: 'Integración de servicios web cliente-servidor con manejo reactivo de estados.', hours: 18, skills: ['Interceptores HTTP', 'Consumo de APIs', 'Sincronización'] },
            { title: 'Autenticación JWT de punta a punta', slug: 'autenticacion-jwt-web', desc: 'Autenticación stateless, tokens JWT, guards de navegación y sesiones protegidas.', hours: 20, skills: ['Autenticación JWT', 'Guards de Navegación', 'Almacenamiento Seguro'] },
            { title: 'Despliegue Full Stack', slug: 'despliegue-fullstack', desc: 'Publicación en producción, variables de entorno, pipelines y bases de datos cloud.', hours: 22, skills: ['Deploy en Producción', 'Variables de Entorno', 'PostgreSQL Cloud'] }
          ],
          4: [
            { title: 'Autenticación JWT de punta a punta', slug: 'autenticacion-jwt-web', desc: 'Seguridad en autenticación, tokens JWT, refresh tokens y sesiones stateless.', hours: 20, skills: ['Autenticación JWT', 'Guards de Navegación', 'Almacenamiento Seguro'] },
            { title: 'Despliegue Full Stack', slug: 'despliegue-fullstack', desc: 'Despliegue continuo en la nube, optimización de bundles y persistencia distribuida.', hours: 22, skills: ['Deploy en Producción', 'Variables de Entorno', 'PostgreSQL Cloud'] },
            { title: 'Seguridad en APIs', slug: 'seguridad-en-apis', desc: 'Hardening integral, sanitización OWASP, rate limiting y protección contra ataques.', hours: 18, skills: ['OWASP Security', 'Rate Limiting', 'Sanitización Defensiva'] }
          ]
        }
      },
      poo: {
        slug: 'desarrollo-orientado-objetos',
        title: 'Ruta de Arquitectura y Programación Orientada a Objetos',
        specialty: 'Arquitectura Orientada a Objetos & SOLID',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Bases de lógica algorítmica y control de flujo previas al paradigma de objetos.', hours: 12, skills: ['Pensamiento Lógico', 'Estructuras de Control', 'Variables'] },
            { title: 'Introducción a la Programación Orientada a Objetos', slug: 'introduccion-poo', desc: 'Conceptos esenciales: clases, instancias, atributos, métodos y estado interno.', hours: 14, skills: ['Clases & Objetos', 'Métodos & Atributos', 'Abstracción'] },
            { title: 'Clases, Objetos y Herencia', slug: 'clases-objetos-herencia', desc: 'Jerarquías de clases, reutilización mediante herencia, constructores y polimorfismo.', hours: 16, skills: ['Herencia', 'Polimorfismo', 'Sobrecarga de Métodos'] }
          ],
          2: [
            { title: 'Clases, Objetos y Herencia', slug: 'clases-objetos-herencia', desc: 'Modelado orientado a objetos con jerarquías y constructores especializados.', hours: 16, skills: ['Herencia', 'Polimorfismo', 'Sobrecarga de Métodos'] },
            { title: 'Programación Orientada a Objetos con Java', slug: 'programacion-orientada-a-objetos-java', desc: 'POO tipada estricta, paquetes, excepciones y manipulación de memoria con Java.', hours: 18, skills: ['Java OOP', 'Manejo de Excepciones', 'Colecciones Tipadas'] },
            { title: 'Diseño Modular, Interfaces y Contratos', slug: 'diseno-modular-interfaces', desc: 'Interfaces, clases abstractas, desacoplamiento y contratos de software.', hours: 18, skills: ['Interfaces & Contratos', 'Desacoplamiento', 'Clases Abstractas'] }
          ],
          3: [
            { title: 'Diseño Modular, Interfaces y Contratos', slug: 'diseno-modular-interfaces', desc: 'Diseño por contratos, polimorfismo desacoplado y abstracción de dependencias.', hours: 18, skills: ['Interfaces & Contratos', 'Desacoplamiento', 'Clases Abstractas'] },
            { title: 'Principios SOLID en la práctica', slug: 'principios-solid', desc: 'Single Responsibility, Open/Closed, Liskov, Interface Segregation y Dependency Inversion.', hours: 18, skills: ['Principios SOLID', 'Refactorización', 'Inversión de Control'] },
            { title: 'Patrones de Diseño', slug: 'patrones-de-diseno', desc: 'Patrones creacionales, estructurales y de comportamiento (Factory, Strategy, Observer).', hours: 22, skills: ['Patrones GoF', 'Arquitectura Limpia', 'Mantenibilidad'] }
          ],
          4: [
            { title: 'Principios SOLID en la práctica', slug: 'principios-solid', desc: 'Aplicación estricta de principios SOLID para arquitecturas escalables y mantenibles.', hours: 18, skills: ['Principios SOLID', 'Refactorización', 'Inversión de Control'] },
            { title: 'Patrones de Diseño', slug: 'patrones-de-diseno', desc: 'Patrones GoF clásicos aplicados a problemas reales de arquitectura y diseño.', hours: 22, skills: ['Patrones GoF', 'Arquitectura Limpia', 'Mantenibilidad'] },
            { title: 'Proyecto Final: Arquitectura de Software Orientada a Objetos', slug: 'arquitectura-proyecto-poo', desc: 'Sistema modular integral con arquitectura en capas, DTOs, repositorios y contratos.', hours: 24, skills: ['Arquitectura en Capas', 'Patrón Repositorio', 'Clean Architecture'] }
          ]
        }
      },
      devops: {
        slug: 'devops',
        title: 'Ruta de DevOps, Contenedores & Automatización Cloud',
        specialty: 'DevOps & Infraestructura como Código',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Lógica algorítmica y control de flujo esenciales para scripting y automatización.', hours: 12, skills: ['Lógica Booleana', 'Estructuras de Control', 'Variables'] },
            { title: 'Linux y línea de comandos', slug: 'linux-y-linea-de-comandos', desc: 'Navegación en terminal Bash, permisos, pipes, redirecciones y procesos.', hours: 16, skills: ['Terminal Linux & Bash', 'Permisos & Procesos', 'Pipes & Redirecciones'] },
            { title: 'Git desde cero', slug: 'git-desde-cero', desc: 'Control de versiones esencial: repositorios, commits, ramas e historial.', hours: 12, skills: ['Git Básico', 'Ramas & Commits', 'Repositorios Remotos'] }
          ],
          2: [
            { title: 'Linux y línea de comandos', slug: 'linux-y-linea-de-comandos', desc: 'Dominio de terminal Linux, gestión de procesos en background y automatización.', hours: 16, skills: ['Terminal Linux & Bash', 'Permisos & Procesos', 'Pipes & Redirecciones'] },
            { title: 'Git colaboración y flujos', slug: 'git-colaboracion-y-flujos', desc: 'Flujos colaborativos, pull requests, resolución de conflictos y conventional commits.', hours: 14, skills: ['Git Flow & PRs', 'Resolución de Conflictos', 'Conventional Commits'] },
            { title: 'Docker y contenedores', slug: 'docker-y-contenedores', desc: 'Empaquetado de aplicaciones en imágenes Docker, mapeo de puertos y volúmenes.', hours: 18, skills: ['Dockerfiles', 'Gestión de Contenedores', 'Volúmenes & Redes'] }
          ],
          3: [
            { title: 'Docker y contenedores', slug: 'docker-y-contenedores', desc: 'Contenedores Docker, aislamiento de entornos de ejecución y redes internas.', hours: 18, skills: ['Dockerfiles', 'Gestión de Contenedores', 'Volúmenes & Redes'] },
            { title: 'Docker Compose y Arquitecturas Multiservicio', slug: 'docker-compose-multiservicio', desc: 'Orquestación local de microservicios con backend, base de datos y caché.', hours: 18, skills: ['Docker Compose', 'Orquestación Local', 'Variables de Entorno'] },
            { title: 'CI/CD con GitHub Actions', slug: 'ci-cd-github-actions', desc: 'Automatización de pipelines de integración continua, tests y despliegue cloud.', hours: 20, skills: ['GitHub Actions', 'Pipelines de CI/CD', 'Automatización de Tests'] }
          ],
          4: [
            { title: 'Docker Compose y Arquitecturas Multiservicio', slug: 'docker-compose-multiservicio', desc: 'Orquestación multicontenedor avanzada y redes seguras entre servicios.', hours: 18, skills: ['Docker Compose', 'Orquestación Local', 'Variables de Entorno'] },
            { title: 'CI/CD con GitHub Actions', slug: 'ci-cd-github-actions', desc: 'Pipelines automatizados de testing, construcción de imágenes y entrega continua.', hours: 20, skills: ['GitHub Actions', 'Pipelines de CI/CD', 'Automatización de Tests'] },
            { title: 'Despliegue Full Stack', slug: 'despliegue-fullstack', desc: 'Infraestructura en la nube, gestión de secretos, DNS, certificados y monitoreo.', hours: 22, skills: ['Deploy en Producción', 'Gestión de Secretos', 'Monitoreo Cloud'] }
          ]
        }
      },
      ia: {
        slug: 'desarrollo-con-ia',
        title: 'Ruta de Desarrollo con Inteligencia Artificial & Agentes',
        specialty: 'Inteligencia Artificial Aplicada & Prompt Engineering',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Fundamentos de programación y razonamiento indispensables para consumir APIs de IA.', hours: 12, skills: ['Pensamiento Lógico', 'Estructuras de Control', 'Variables'] },
            { title: 'Programación Estructurada con Python', slug: 'python-estructurado', desc: 'Lenguaje estándar de la industria para scripts de IA y procesamiento de datos.', hours: 14, skills: ['Python Moderno', 'Funciones & Scope', 'Manipulación de Datos'] },
            { title: 'Introducción a la IA para desarrolladores', slug: 'introduccion-ia-para-desarrolladores', desc: 'Conceptos base de LLMs, tokens, contexto, inferencia y consumo de APIs.', hours: 14, skills: ['Fundamentos de LLMs', 'Llamadas a APIs de IA', 'Manejo de Contexto'] }
          ],
          2: [
            { title: 'Programación Estructurada con Python', slug: 'python-estructurado', desc: 'Estructuración modular de código en Python y manejo de payloads JSON.', hours: 14, skills: ['Python Moderno', 'Funciones & Scope', 'Manipulación de Datos'] },
            { title: 'Introducción a la IA para desarrolladores', slug: 'introduccion-ia-para-desarrolladores', desc: 'Consumo de modelos generativos, parámetros de temperatura y ventanas de contexto.', hours: 14, skills: ['Fundamentos de LLMs', 'Llamadas a APIs de IA', 'Manejo de Contexto'] },
            { title: 'Prompt Engineering práctico', slug: 'prompt-engineering-practico', desc: 'Prompting estructurado, Few-Shot, Chain-of-Thought y salida controlada en JSON.', hours: 16, skills: ['Prompting Estructurado', 'Few-Shot & CoT', 'Generación en JSON'] }
          ],
          3: [
            { title: 'Introducción a la IA para desarrolladores', slug: 'introduccion-ia-para-desarrolladores', desc: 'Consumo de modelos generativos con manejo de streaming y control de latencia.', hours: 14, skills: ['Fundamentos de LLMs', 'Llamadas a APIs de IA', 'Manejo de Contexto'] },
            { title: 'Prompt Engineering práctico', slug: 'prompt-engineering-practico', desc: 'Técnicas avanzadas de prompting para extracción de datos y razonamiento guiado.', hours: 16, skills: ['Prompting Estructurado', 'Few-Shot & CoT', 'Generación en JSON'] },
            { title: 'IA en el ciclo de desarrollo', slug: 'ia-en-el-ciclo-de-desarrollo', desc: 'Pair programming asistido, generación de pruebas unitarias y refactorización.', hours: 18, skills: ['Pair Programming con IA', 'Generación de Tests', 'Depuración Asistida'] }
          ],
          4: [
            { title: 'Prompt Engineering práctico', slug: 'prompt-engineering-practico', desc: 'Diseño sistemático de prompts para tareas complejas y validación de esquemas.', hours: 16, skills: ['Prompting Estructurado', 'Few-Shot & CoT', 'Generación en JSON'] },
            { title: 'IA en el ciclo de desarrollo', slug: 'ia-en-el-ciclo-de-desarrollo', desc: 'Automatización del ciclo de desarrollo y agentes evaluadores de código.', hours: 18, skills: ['Pair Programming con IA', 'Generación de Tests', 'Depuración Asistida'] },
            { title: 'RAG (Retrieval-Augmented Generation) y Bases de Datos Vectoriales', slug: 'rag-embeddings-bases-vectoriales', desc: 'Embeddings semánticos, bases vectoriales y arquitecturas RAG para conocimiento propio.', hours: 22, skills: ['Bases de Datos Vectoriales', 'Arquitecturas RAG', 'Búsqueda Semántica'] }
          ]
        }
      },
      algoritmos: {
        slug: 'fundamentos-programacion',
        title: 'Ruta de Fundamentos de Programación y Pensamiento Algorítmico',
        specialty: 'Lógica Algorítmica & Ciencias de la Computación',
        levels: {
          1: [
            { title: 'Introducción a la Programación', slug: 'introduccion-programacion', desc: 'Pensamiento algorítmico básico, diagramas de flujo y control de ejecución.', hours: 12, skills: ['Pensamiento Lógico', 'Estructuras de Control', 'Depuración Paso a Paso'] },
            { title: 'PSeInt desde cero', slug: 'pseint-desde-cero', desc: 'Pseudocódigo guiado y trazabilidad procedimental de variables en memoria.', hours: 10, skills: ['Pseudocódigo', 'Diagramas de Flujo', 'Trazabilidad de Variables'] },
            { title: 'Lógica y Pensamiento Computacional', slug: 'logica-pensamiento-computacional', desc: 'Descomposición analítica, abstracción y patrones computacionales estructurados.', hours: 14, skills: ['Descomposición Lógica', 'Abstracción', 'Patrones Computacionales'] }
          ],
          2: [
            { title: 'Lógica y Pensamiento Computacional', slug: 'logica-pensamiento-computacional', desc: 'Descomposición de problemas complejos y resolución paso a paso.', hours: 14, skills: ['Descomposición Lógica', 'Abstracción', 'Patrones Computacionales'] },
            { title: 'Programación Estructurada con Python', slug: 'python-estructurado', desc: 'Implementación de algoritmos con funciones modulares y colecciones.', hours: 14, skills: ['Python Moderno', 'Funciones & Scope', 'Manipulación de Datos'] },
            { title: 'Algoritmos de Ordenamiento', slug: 'algoritmos-ordenamiento', desc: 'Búsquedas eficientes, algoritmos de partición y análisis de complejidad Big-O.', hours: 16, skills: ['Búsqueda Binaria', 'QuickSort/MergeSort', 'Complejidad Temporal O(N)'] }
          ],
          3: [
            { title: 'Algoritmos de Ordenamiento', slug: 'algoritmos-ordenamiento', desc: 'Análisis asintótico de algoritmos de ordenación y búsqueda en memoria.', hours: 16, skills: ['Búsqueda Binaria', 'QuickSort/MergeSort', 'Complejidad Temporal O(N)'] },
            { title: 'Estructuras de Datos Lineales y Complejidad', slug: 'estructuras-datos-lineales', desc: 'Pilas, colas, listas enlazadas, mapas hash y optimización de memoria.', hours: 18, skills: ['Tablas Hash', 'Estructuras Lineales', 'Eficiencia Asintótica'] },
            { title: 'Clases, Objetos y Herencia', slug: 'clases-objetos-herencia', desc: 'Modelado de estructuras de datos orientadas a objetos y tipos abstractos.', hours: 16, skills: ['Herencia', 'Polimorfismo', 'Modelado de Tipos'] }
          ],
          4: [
            { title: 'Estructuras de Datos Lineales y Complejidad', slug: 'estructuras-datos-lineales', desc: 'Estructuras de datos avanzadas, colisiones en tablas hash y optimización temporal.', hours: 18, skills: ['Tablas Hash', 'Estructuras Lineales', 'Eficiencia Asintótica'] },
            { title: 'Diseño Modular, Interfaces y Contratos', slug: 'diseno-modular-interfaces', desc: 'Contratos de software, tipos genéricos y estructuras altamente desacopladas.', hours: 18, skills: ['Interfaces & Contratos', 'Desacoplamiento', 'Tipos Genéricos'] },
            { title: 'Patrones de Diseño', slug: 'patrones-de-diseno', desc: 'Patrones GoF para resolver problemas recurrentes de arquitectura de software.', hours: 22, skills: ['Patrones GoF', 'Arquitectura Limpia', 'Mantenibilidad'] }
          ]
        }
      }
    };

    const targetConfig = catalogConfig[specialtyPref] || catalogConfig['backend'];
    const pathCourses = targetConfig.levels[levelNumber] || targetConfig.levels[1];

    const syllabus: SyllabusPhase[] = pathCourses.map((c, idx) => ({
      phaseNumber: idx + 1,
      phaseTitle: `Fase 0${idx + 1}: ${c.title}`,
      courseTitle: c.title,
      courseSlug: c.slug,
      description: c.desc,
      estimatedHours: c.hours,
      skillsGained: c.skills
    }));

    const primaryCourseSlug = syllabus[0].courseSlug;
    const primaryCourseTitle = syllabus[0].courseTitle;
    const recommendedPathSlug = targetConfig.slug;
    const recommendedPathTitle = targetConfig.title;
    const recommendedSpecialty = targetConfig.specialty;

    // Dictamen Pedagógico Crítico y Realista de Byte IA
    const strengths: string[] = [];
    const gaps: string[] = [];

    if (isLogicOk) strengths.push('trazabilidad algorítmica y control de flujo condicional');
    else gaps.push('seguimiento mental de variables de estado y bucles acumuladores');

    if (isOopOk) strengths.push('diferenciación de identidades y mutación de referencias en memoria');
    else gaps.push('comprensión del paso por referencia y encapsulamiento en objetos');

    if (isDbOk) strengths.push('consultas relacionales SQL con agregaciones y agrupaciones');
    else gaps.push('modelado relacional e integridad referencial en persistencia');

    if (isArchOk) strengths.push('estándares semánticos del protocolo HTTP y diseño REST');
    else gaps.push('códigos de estado y métodos semánticos en el ciclo de vida web');

    const strText = strengths.length > 0
      ? `Has demostrado destreza concreta en ${strengths.join(', ')}.`
      : 'Tu evaluación refleja que estás en una etapa formativa inicial donde aún debes adquirir las herramientas básicas de deducción algorítmica.';

    const gapText = gaps.length > 0
      ? ` No obstante, he detectado brechas prioritarias en ${gaps.join(', además de ')}, áreas indispensables para construir software profesional robusto.`
      : ' Has evidenciado una base sólida y equilibrada en los cuatro pilares fundamentales examinados.';

    const p1 = `Tras analizar con detenimiento tu prueba diagnóstica técnica y tu punto de partida, he calibrado tu estado formativo actual en **Nivel 0${levelNumber}** (${score} de ${totalTechnical} aciertos técnicos validados). Mi evaluación como tutor de ingeniería es estrictamente realista: no buscamos adular ni inflar rangos ficticios, sino situarte exactamente donde cada hora de estudio maximice tu comprensión y evite la deserción por vacíos conceptuales.`;
    const p2 = `${strText}${gapText}`;
    const p3 = `Para atender tu perfil con precisión, he definido tu hoja de ruta personalizada en la **${recommendedPathTitle}**, estructurada en 3 fases secuenciales. Tu punto de partida inmediato es el curso **${primaryCourseTitle}**. En lugar de saltar apresuradamente a temas avanzados sin cimientos firmes, completar esta fase te otorgará el rigor técnico para codificar con autonomía y seguridad.`;

    const agentFeedback = `${p1}\n\n${p2}\n\n${p3}`;

    const result: DiagnosticAnalysisResult = {
      score,
      totalTechnical,
      levelNumber,
      levelTitle,
      recommendedSpecialty,
      recommendedPathSlug,
      recommendedPathTitle,
      primaryCourseSlug,
      primaryCourseTitle,
      competencyBreakdown: {
        logic: logicScore,
        oop: oopScore,
        database: dbScore,
        architecture: archScore
      },
      syllabus,
      agentFeedback,
      completedAt: new Date().toISOString()
    };

    this.analysisResult.set(result);

    // Guardar en AuthService y emitir evento global para actualización en vivo del perfil
    this.auth.saveDiagnosticResult(result);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('syseng:diagnostic_completed', { detail: result }));
    }
  }

  recalibrate() {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(null);
    this.userAnswers.set({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
