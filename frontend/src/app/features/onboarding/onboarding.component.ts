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
  readonly stage = signal<'welcome' | 'tour' | 'assessment' | 'analyzing' | 'results'>('welcome');

  // Estado del usuario
  readonly user = this.auth.user;
  readonly studentFirstName = computed(() => {
    const full = this.user()?.name || 'Estudiante';
    return full.split(' ')[0];
  });

  // Estado del examen diagnóstico
  readonly currentQuestionIndex = signal<number>(0);
  readonly selectedOption = signal<string | null>(null);
  readonly userAnswers = signal<Record<string, string>>({});
  readonly analysisResult = signal<DiagnosticAnalysisResult | null>(null);
  readonly aiEvaluationFailed = signal(false);
  readonly aiEvaluationInProgress = signal(false);

  // Preguntas de razonamiento lógico y afinidad técnica
  readonly questions: DiagnosticQuestion[] = [
    {
      id: 'q1',
      topic: 'Razonamiento Lógico: Secuencias y Estados',
      category: 'logic',
      title: 'Deducción de Reglas y Patrones Algorítmicos',
      prompt: 'Un algoritmo procesa un valor numérico aplicando la siguiente regla de transformación:\n"Si el número actual es par, se divide entre 2. Si es impar, se multiplica por 3 y se le suma 1".\n\nSi la ejecución inicia con el número 6, ¿cuál es la secuencia exacta de los siguientes 3 pasos?',
      codeSnippet: `// Estado inicial: x = 6
Paso 1: ¿resultado de transformar 6?
Paso 2: ¿resultado de transformar el valor anterior?
Paso 3: ¿resultado de transformar el valor anterior?`,
      options: [
        { id: 'a', label: '3, 10, 5 (6 es par → 3; 3 es impar → 3×3+1=10; 10 es par → 5)' },
        { id: 'b', label: '18, 9, 28 (Aplica multiplicación consecutiva sin evaluar paridad)' },
        { id: 'c', label: '3, 6, 9 (Suma constante de múltiplos)' },
        { id: 'd', label: '12, 6, 3 (Secuencia decreciente directa)' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q2',
      topic: 'Lógica Booleana: Condiciones y Causa-Efecto',
      category: 'logic',
      title: 'Evaluación de Condiciones Lógicas Compuestas',
      prompt: 'En un sistema automatizado, una compuerta de seguridad se abre si la condición general es Verdadera:\n(A AND B) OR (NOT C)\n\nSi los sensores reportan los siguientes valores:\n• A = Verdadero\n• B = Falso\n• C = Falso\n\n¿La compuerta se abrirá y cuál es la justificación lógica?',
      codeSnippet: `A = true;
B = false;
C = false;

// Regla booleana del sistema:
compuerta_abierta = (A && B) || (!C);`,
      options: [
        { id: 'a', label: 'Sí se abre: (A AND B) es Falso, pero NOT C es Verdadero. La operación OR hace que el resultado final sea Verdadero.' },
        { id: 'b', label: 'No se abre: Como B es Falso, invalida automáticamente toda la expresión.' },
        { id: 'c', label: 'No se abre: La condición requiere que A y B sean Verdaderos al mismo tiempo.' },
        { id: 'd', label: 'El sistema genera un estado indeterminado debido a la combinación de operadores.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q3',
      topic: 'Control de Flujo: Bucles y Acumuladores',
      category: 'logic',
      title: 'Rastreo de Estados e Iteraciones Acumuladas',
      prompt: 'Un acumulador en memoria inicia en 0. Se ejecuta un bucle que se repite exactamente 4 veces con esta instrucción:\n"Suma 5 al acumulador. Inmediatamente después, si el acumulador supera 10, réstale 2".\n\n¿Cuál es el valor final del acumulador al terminar la cuarta repetición?',
      codeSnippet: `let acumulador = 0;

for (let paso = 1; paso <= 4; paso++) {
    acumulador = acumulador + 5;
    if (acumulador > 10) {
        acumulador = acumulador - 2;
    }
}`,
      options: [
        { id: 'a', label: '16 (Paso 1: 5 → Paso 2: 10 → Paso 3: 15-2=13 → Paso 4: 13+5-2=16)' },
        { id: 'b', label: '20 (Suma 5 en cada iteración sin descontar nada)' },
        { id: 'c', label: '14 (Descuenta 2 en cada uno de los cuatro pasos)' },
        { id: 'd', label: '12 (El valor se restablece al superar 10)' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q4',
      topic: 'Descomposición Sistemática & Optimización',
      category: 'logic',
      title: 'Estrategia Óptima de Búsqueda y Resolución',
      prompt: 'Tienes un índice alfabético ordenado de 1.000 registros y necesitas encontrar un término específico. ¿Cuál de estas estrategias representa el pensamiento algorítmico más rápido y eficiente?',
      codeSnippet: `// Espacio de búsqueda ordenado: 1.000 registros
// Meta: Minimizar el número de comparaciones requeridas`,
      options: [
        { id: 'a', label: 'Partición binaria: Abrir a la mitad; si el término está antes o después, descartar la mitad opuesta y repetir en la mitad restante (~10 pasos).' },
        { id: 'b', label: 'Búsqueda lineal: Revisar registro por registro desde el inicio hasta hallarlo (hasta 1.000 pasos).' },
        { id: 'c', label: 'Muestreo aleatorio: Revisar posiciones al azar esperando coincidencia por suerte.' },
        { id: 'd', label: 'Búsqueda alternada: Revisar registros pares primero y luego impares.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q5',
      topic: 'Aspiración Técnica & Especialidad',
      category: 'specialty',
      title: 'Tu Área de Interés Prioritaria',
      prompt: '¿En qué área de la ingeniería de software te gustaría enfocarte prioritariamente en SysEngAcademy?',
      options: [
        { id: 'backend', label: 'Desarrollo Backend & APIs: Servidores, bases de datos SQL, persistencia y lógica distribuida.' },
        { id: 'frontend', label: 'Desarrollo Frontend & Web: Interfaces reactivas modernas, componentes UI, experiencia de usuario y CSS/DOM.' },
        { id: 'algoritmos', label: 'Lógica Algorítmica & Ciencias de la Computación: Estructuras de datos, acertijos de lógica pura y optimización asintótica.' },
        { id: 'devops', label: 'DevOps & Automatización Cloud: Terminal Linux, contenedores Docker, CI/CD y despliegues continuos.' },
        { id: 'ia', label: 'Inteligencia Artificial Aplicada: Integración de modelos LLM, prompting estructurado y agentes inteligentes.' },
        { id: 'poo', label: 'Arquitectura de Software Orientada a Objetos: Modularidad limpia, principios SOLID y patrones de diseño GoF.' }
      ]
    }
  ];

  readonly currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
  readonly progressPercentage = computed(() =>
    Math.round(((this.currentQuestionIndex() + 1) / this.questions.length) * 100)
  );

  ngOnInit() {
    // Si ya completó el diagnóstico previamente y llega aquí, cargamos sus resultados
    const existing = this.auth.getDiagnosticResult();
    if (existing && existing.syllabus) {
      this.analysisResult.set(existing);
      this.stage.set('results');
    }

    // Aleatorizar el orden de opciones en cada pregunta para que la respuesta
    // correcta no esté siempre en la primera posición
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

  goToTour() {
    this.stage.set('tour');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToAssessment() {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(this.userAnswers()['q1'] || null);
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
    let score = 0;
    const totalTechnical = 4; // 4 preguntas de razonamiento lógico

    const isQ1Correct = answers['q1'] === 'a';
    const isQ2Correct = answers['q2'] === 'a';
    const isQ3Correct = answers['q3'] === 'a';
    const isQ4Correct = answers['q4'] === 'a';

    if (isQ1Correct) score++;
    if (isQ2Correct) score++;
    if (isQ3Correct) score++;
    if (isQ4Correct) score++;

    // Desglose de competencias lógicas
    const logicScore = isQ1Correct && isQ2Correct ? 100 : (isQ1Correct || isQ2Correct ? 60 : 30);
    const flowScore = isQ3Correct ? 100 : 40;
    const optimizationScore = isQ4Correct ? 100 : 35;
    const generalScore = Math.round((score / totalTechnical) * 100);

    // Preferencia técnica declarada por el estudiante
    const specialtyPref = answers['q5'] || 'backend';

    // Determinar Nivel Asignado acorde a rendimiento
    let levelNumber = 1;
    let levelTitle = '';

    if (score <= 1) {
      levelNumber = 1;
      levelTitle = 'Nivel 1: Cadete en Formación · Lógica Inicial';
    } else if (score === 2) {
      levelNumber = 2;
      levelTitle = 'Nivel 2: Explorador de Sistemas · Lógica Estructurada';
    } else if (score === 3) {
      levelNumber = 3;
      levelTitle = 'Nivel 3: Desarrollador Junior Avanzado · Razonamiento Sistemático';
    } else {
      levelNumber = 4;
      levelTitle = 'Nivel 4: Ingeniero Junior Promesa · Alto Rendimiento Lógico';
    }

    // Determinar Ruta, Curso y Temario Adaptativo según afinidad y nivel
    let recommendedPathSlug = 'fundamentos-programacion';
    let recommendedPathTitle = 'Fundamentos de Programación y Pensamiento Algorítmico';
    let primaryCourseSlug = 'introduccion-programacion';
    let primaryCourseTitle = 'Introducción a la Programación';
    let recommendedSpecialty = 'Lógica & Algoritmos';
    let syllabus: SyllabusPhase[] = [];

    switch (specialtyPref) {
      case 'frontend':
        recommendedPathSlug = 'desarrollo-frontend';
        recommendedPathTitle = 'Ruta de Desarrollo Frontend & Experiencia de Usuario';
        primaryCourseSlug = score >= 3 ? 'desarrollo-web-fundamentos' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Fundamentos del Desarrollo Web Moderno' : 'Introducción a la Programación (Bases Frontend)';
        recommendedSpecialty = 'Desarrollo Frontend & Interfaces Reactivas';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Estructura Semántica, Layout y CSS Moderno',
            courseTitle: 'Desarrollo Web: HTML5, CSS3 y Flexbox',
            courseSlug: 'desarrollo-web-fundamentos',
            description: 'Aprende a maquetar aplicaciones web con estándares accesibles, grid y diseño responsive.',
            estimatedHours: 14,
            skillsGained: ['HTML5 Semántico', 'CSS Flexbox & Grid', 'Diseño Adaptativo']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Interactividad, DOM y JavaScript Asíncrono',
            courseTitle: 'JavaScript Moderno para Frontend',
            courseSlug: 'javascript-moderno',
            description: 'Manipulación del árbol DOM, eventos en tiempo real, promesas y consumo de endpoints JSON.',
            estimatedHours: 16,
            skillsGained: ['Eventos del Navegador', 'Fetch API', 'Programación Reactiva']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Arquitectura Basada en Componentes',
            courseTitle: 'Frameworks SPA & Estado Centralizado',
            courseSlug: 'desarrollo-frontend',
            description: 'Construcción de aplicaciones escalables con separación de vistas, señales y ciclo de vida.',
            estimatedHours: 20,
            skillsGained: ['Arquitectura de Componentes', 'Manejo de Estado', 'Enrutamiento Client-Side']
          }
        ];
        break;

      case 'algoritmos':
        recommendedPathSlug = 'fundamentos-programacion';
        recommendedPathTitle = 'Ruta de Fundamentos de Programación y Pensamiento Algorítmico';
        primaryCourseSlug = score >= 3 ? 'algoritmos-ordenamiento' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Algoritmos de Ordenamiento & Eficiencia' : 'Introducción a la Programación';
        recommendedSpecialty = 'Ciencias de la Computación & Algoritmos';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Lógica Pura y Variables de Estado',
            courseTitle: 'Introducción a la Programación',
            courseSlug: 'introduccion-programacion',
            description: 'Fundamentos de control de flujo, tablas de verdad, variables y diagramas algorítmicos.',
            estimatedHours: 12,
            skillsGained: ['Pensamiento Lógico', 'Estructuras de Control', 'Depuración Paso a Paso']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Modularidad y Programación Estructurada',
            courseTitle: 'Programación Estructurada con Python',
            courseSlug: 'python-estructurado',
            description: 'Diseño modular de funciones, arreglos, recursión y estructuras de datos dinámicas.',
            estimatedHours: 15,
            skillsGained: ['Modularidad', 'Colecciones en Memoria', 'Recursión']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Optimización y Análisis Asintótico Big-O',
            courseTitle: 'Algoritmos de Ordenamiento & Eficiencia',
            courseSlug: 'algoritmos-ordenamiento',
            description: 'Mide el consumo de tiempo y memoria en algoritmos de partición, árboles y grafos.',
            estimatedHours: 18,
            skillsGained: ['Notación Big-O', 'Divide & Vencerás', 'Optimización de Memoria']
          }
        ];
        break;

      case 'devops':
        recommendedPathSlug = 'devops';
        recommendedPathTitle = 'Ruta de DevOps, Linux & Automatización Cloud';
        primaryCourseSlug = score >= 3 ? 'introduccion-devops' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Introducción a DevOps y Contenedores' : 'Introducción a la Programación (Fundamentos DevOps)';
        recommendedSpecialty = 'DevOps & Infraestructura Cloud';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Dominio de Terminal Linux & Bash Scripting',
            courseTitle: 'Terminal y Shell Scripting para Ingenieros',
            courseSlug: 'terminal-linux-scripting',
            description: 'Control de procesos Unix, pipes, redirecciones, permisos y automatización de tareas en servidor.',
            estimatedHours: 12,
            skillsGained: ['Bash Scripting', 'Permisos POSIX', 'Control de Procesos']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Contenedores Docker y Aislamiento de Entornos',
            courseTitle: 'Docker & Microservicios Contenerizados',
            courseSlug: 'docker-contenedores',
            description: 'Creación de imágenes ligeras, volúmenes de datos, redes virtuales y docker-compose.',
            estimatedHours: 16,
            skillsGained: ['Dockerfiles Multi-stage', 'Redes de Contenedores', 'Docker Compose']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Pipelines de Integración Continua (CI/CD)',
            courseTitle: 'CI/CD con GitHub Actions y Despliegues Cloud',
            courseSlug: 'devops',
            description: 'Automatización de compilación, ejecución de tests y entrega continua a entornos de producción.',
            estimatedHours: 18,
            skillsGained: ['GitHub Actions', 'Monitoreo de Salud', 'Zero-Downtime Deployment']
          }
        ];
        break;

      case 'ia':
        recommendedPathSlug = 'desarrollo-con-ia';
        recommendedPathTitle = 'Ruta de Desarrollo Asistido por Inteligencia Artificial';
        primaryCourseSlug = 'desarrollo-con-ia';
        primaryCourseTitle = 'Ingeniería de Software con IA y Modelos LLM';
        recommendedSpecialty = 'Inteligencia Artificial Aplicada';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Modelos LLM y Prompt Engineering Técnico',
            courseTitle: 'Fundamentos de Modelos de Lenguaje & Prompting',
            courseSlug: 'desarrollo-con-ia',
            description: 'Estructuración de instrucciones semánticas, Few-shot prompting y limitaciones de alucinación.',
            estimatedHours: 10,
            skillsGained: ['Prompting Estructurado', 'Embeddings Semánticos', 'Tokens & Context Window']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Programación Asistida y Pair Programming con Agentes',
            courseTitle: 'Workflows de Ingeniería Asistida en el IDE',
            courseSlug: 'agentes-desarrollo',
            description: 'Uso de agentes de codificación para refactorización, generación de tests y análisis AST en vivo.',
            estimatedHours: 14,
            skillsGained: ['Pair Programming con Agentes', 'Generación de Pruebas Unitarias', 'Auditoría con IA']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Agentes Autónomos y Consumo de APIs de IA',
            courseTitle: 'Integración de Agentes y Llamadas a Herramientas (Function Calling)',
            courseSlug: 'ia-avanzada-agentes',
            description: 'Conecta modelos con APIs externas, bases de datos y ejecución de funciones automáticas.',
            estimatedHours: 18,
            skillsGained: ['Function Calling', 'RAG (Retrieval Augmented Gen)', 'Agentes Autónomos']
          }
        ];
        break;

      case 'poo':
        recommendedPathSlug = 'desarrollo-orientado-objetos';
        recommendedPathTitle = 'Ruta de Programación Orientada a Objetos y Diseño Limpio';
        primaryCourseSlug = score >= 3 ? 'clases-objetos-herencia' : 'introduccion-poo';
        primaryCourseTitle = score >= 3 ? 'Clases, Objetos y Herencia' : 'Introducción a la Programación Orientada a Objetos';
        recommendedSpecialty = 'Arquitectura de Objetos & Principios SOLID';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Abstracción, Clases, Objetos y Encapsulamiento',
            courseTitle: 'Clases, Objetos y Herencia',
            courseSlug: 'clases-objetos-herencia',
            description: 'Modela entidades reales con encapsulamiento estricto, métodos mutadores y constructores.',
            estimatedHours: 14,
            skillsGained: ['Encapsulamiento', 'Constructores', 'Modelado de Dominio']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Herencia, Polimorfismo e Interfaces',
            courseTitle: 'Polimorfismo y Diseño de Contratos de Software',
            courseSlug: 'polimorfismo-interfaces',
            description: 'Crea arquitecturas flexibles mediante contratos e interfaces desacopladas.',
            estimatedHours: 16,
            skillsGained: ['Polimorfismo', 'Interfaces y Tipos Abstractos', 'Inversión de Control']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Principios SOLID y Patrones de Diseño GoF',
            courseTitle: 'Principios SOLID en la Práctica',
            courseSlug: 'principios-solid',
            description: 'Escribe código desacoplado, testeable y preparado para mantenimiento a largo plazo.',
            estimatedHours: 18,
            skillsGained: ['SRP, OCP, LSP, ISP, DIP', 'Inyección de Dependencias', 'Patrones GoF']
          }
        ];
        break;

      default: // 'backend'
        recommendedPathSlug = 'desarrollo-backend';
        recommendedPathTitle = 'Ruta de Desarrollo Backend & Arquitectura de APIs';
        primaryCourseSlug = score >= 3 ? 'backend-introduccion' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Introducción al Backend & Arquitectura de Servidores' : 'Introducción a la Programación (Bases Backend)';
        recommendedSpecialty = 'Sistemas Backend & Arquitectura de APIs';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Arquitectura de Servidores y Protocolo HTTP',
            courseTitle: 'Introducción al Backend & Arquitectura de Servidores',
            courseSlug: 'backend-introduccion',
            description: 'Comprende el ciclo de vida de peticiones HTTP, middlewares, códigos de estado y respuestas JSON.',
            estimatedHours: 12,
            skillsGained: ['Ciclo HTTP', 'Enrutamiento de Servidor', 'Middlewares']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Persistencia, Modelado Relacional y SQL',
            courseTitle: 'SQL desde Cero y Persistencia de Datos',
            courseSlug: 'sql-desde-cero',
            description: 'Diseño de bases de datos relacionales, llaves foráneas, JOINs y transacciones en PostgreSQL.',
            estimatedHours: 16,
            skillsGained: ['PostgreSQL', 'Modelado Relacional', 'Consultas Optimizadas']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: APIs RESTful, Autenticación y Seguridad',
            courseTitle: 'Desarrollo de APIs RESTful y Seguridad',
            courseSlug: 'desarrollo-backend',
            description: 'Implementación de autenticación JWT stateless, validación estricta de payloads y control de acceso.',
            estimatedHours: 20,
            skillsGained: ['Autenticación JWT', 'Sanitización de Datos', 'Controladores REST']
          }
        ];
        break;
    }

    // Generar retroalimentación detallada y personalizada de Byte Copilot
    const strengths: string[] = [];
    if (isQ1Correct) strengths.push('✓ Excelente habilidad para proyectar transiciones de estado secuenciales.');
    if (isQ2Correct) strengths.push('✓ Dominio riguroso de lógica booleana compuesta y evaluación de compuertas (AND/OR/NOT).');
    if (isQ3Correct) strengths.push('✓ Gran capacidad para rastrear bucles iterativos con condiciones y acumuladores en memoria.');
    if (isQ4Correct) strengths.push('✓ Intuición algorítmica óptima para optimización mediante partición (divide y vencerás).');

    const weaknesses: string[] = [];
    if (!isQ1Correct) weaknesses.push('• Sugerimos ejercitar la simulación paso a paso de variables numéricas y paridad.');
    if (!isQ2Correct) weaknesses.push('• Conviene repasar tablas de verdad y precedencia de operadores lógicos condicionales.');
    if (!isQ3Correct) weaknesses.push('• Fortalecer el seguimiento mental de acumuladores dentro de ciclos repetitivos.');
    if (!isQ4Correct) weaknesses.push('• Desarrollar el pensamiento asintótico para elegir caminos de búsqueda eficientes.');

    const strengthsSummary = strengths.length > 0
      ? `Fortalezas demostradas:\n${strengths.join('\n')}`
      : 'Has dado tus primeros pasos en el análisis de problemas computacionales.';

    const weaknessesSummary = weaknesses.length > 0
      ? `\n\nÁreas clave a potenciar:\n${weaknesses.join('\n')}`
      : '\n\n¡Rendimiento impecable! No se detectaron fallos lógicos en tu evaluación.';

    const rationale = `\n\nDiagnóstico del Agente: Obtuviste ${score} de ${totalTechnical} aciertos (${generalScore}%). Calibré tu perfil en ${levelTitle} y asigné tu plan a la "${recommendedPathTitle}", iniciando con "${primaryCourseTitle}". Esta ruta te permitirá capitalizar tus afinidades en ${recommendedSpecialty} mientras avanzas con retos prácticos progresivos.`;

    const agentFeedback = `${strengthsSummary}${weaknessesSummary}${rationale}`;

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
        oop: flowScore,
        database: optimizationScore,
        architecture: generalScore
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
