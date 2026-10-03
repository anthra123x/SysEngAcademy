import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, SlicePipe } from '@angular/common';
import { HomeService } from '../../core/services/home.service';
import { LearningPath, Course, Category } from '../../core/models';
import { AppIconComponent } from '../../shared/components/app-icon.component';

interface SnakeStop {
  path: LearningPath;
  color: string;   // color de la categoría (identidad del nodo)
  name: string;    // nombre de la categoría
  isRight: boolean;  // si la tarjeta va del lado derecho (alternante)
  num: number;     // posición en el recorrido (01..09)
  delay: number;   // stagger de entrada (s)
  levelBadge: string;
  milestoneTitle: string;
  skills: string[];
  phaseLabel?: string;
}

interface SnakeSeg {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;   // color de la categoría destino
  len: number;     // longitud en px (para draw-in)
  delay: number;   // retardo de dibujado (s)
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, SlicePipe, AppIconComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private homeSvc = inject(HomeService);

  learningPaths   = signal<LearningPath[]>([]);
  featuredCourses = signal<Course[]>([]);
  categories      = signal<Category[]>([]);
  selectedCategory = signal<string>('all');

  displayedCourses = computed(() => {
    // En la página de inicio se muestran exclusivamente los 6 cursos destacados principales
    return this.featuredCourses().slice(0, 6);
  });

  snakeStops       = signal<SnakeStop[]>([]);
  snakeSegments   = signal<SnakeSeg[]>([]);
  snakeVisible    = signal(false);
  @ViewChild('snakeWrap') snakeWrap?: ElementRef<HTMLElement>;

  private resizeObs?: ResizeObserver;
  private intersectObs?: IntersectionObserver;

  ngOnInit() {
    // Una sola llamada agregada (categorías + rutas + cursos) en vez de 3
    // requests que pagaban cada uno el arranque en frío de la BD.
    this.homeSvc.getHome().subscribe(home => {
      this.categories.set(home.categories);
      this.learningPaths.set(home.learning_paths.data);
      this.featuredCourses.set(home.courses.data);
      this.snakeStops.set(this.buildSnake(home.learning_paths.data, home.categories));
      // Esperar a que Angular pinte los nodos antes de medir la ruta.
      setTimeout(() => this.measureSnake(), 60);
    });
  }

  /** Crea las estaciones del roadmap en disposición alternante (L -> R -> L) con eje central */
  private buildSnake(paths: LearningPath[], allCats: Category[] = []): SnakeStop[] {
    const catMap = new Map(allCats.map(c => [Number(c.id), c]));

    const pathMilestones: Record<string, { badge: string; title: string; skills: string[] }> = {
      'fundamentos-programacion': {
        badge: 'Hito 01 • Lógica & Algoritmia Base',
        title: 'Pensamiento computacional estructurado, variables, control de flujo y resolución algorítmica esencial.',
        skills: ['Variables & Tipos', 'Estructuras de Control', 'Pseudocódigo', 'Funciones'],
      },
      'desarrollo-orientado-objetos': {
        badge: 'Hito 02 • Paradigma & Modelado OO',
        title: 'Abstracción de software, encapsulamiento, herencia, polimorfismo y diseño modular con principios SOLID.',
        skills: ['Clases & Objetos', 'Herencia & Interfaces', 'Principios SOLID', 'Clean Code'],
      },
      'desarrollo-backend': {
        badge: 'Hito 03 • Servidores & APIs Robustas',
        title: 'Arquitectura de servicios REST, persistencia relacional SQL, seguridad, transacciones y autenticación JWT.',
        skills: ['APIs RESTful', 'SQL & Modelado BD', 'Autenticación JWT', 'Seguridad Web'],
      },
      'desarrollo-frontend': {
        badge: 'Hito 04 • Interfaces Reactivas & SPA',
        title: 'Maquetación responsive moderna, componentes dinámicos, TypeScript avanzado y experiencia de usuario fluida.',
        skills: ['Angular / TypeScript', 'Componentes UI', 'Gestión de Estado', 'Responsive UX'],
      },
      'desarrollo-fullstack': {
        badge: 'Hito 05 • Integración End-to-End',
        title: 'Conexión integral entre cliente, servidor y base de datos con despliegue productivo y comunicación asíncrona.',
        skills: ['Arquitectura Full Stack', 'Consumo de APIs', 'WebSockets', 'Despliegue Cloud'],
      },
      'devops': {
        badge: 'Hito 06 • Contenedores & CI/CD',
        title: 'Entornos reproducibles con Docker, automatización de entregas continuas, administración Linux y orquestación.',
        skills: ['Docker & Compose', 'Pipelines CI/CD', 'Linux & Bash', 'Reverse Proxy'],
      },
      'git-y-control-versiones': {
        badge: 'Hito 07 • Control de Versiones Pro',
        title: 'Flujos de trabajo colaborativos en equipo, ramas profesionales, resolución de conflictos y Conventional Commits.',
        skills: ['Git Flow', 'Rebase & Merge', 'Pull Requests', 'Versionado Semántico'],
      },
      'ingenieria-de-requerimientos': {
        badge: 'Hito 08 • Análisis & Calidad Software',
        title: 'Levantamiento riguroso de especificaciones, modelado UML, casos de uso, arquitectura y testing QA formal.',
        skills: ['Historias de Usuario', 'Diagramas UML', 'Criterios de Aceptación', 'Testing QA'],
      },
      'desarrollo-con-ia': {
        badge: 'Hito 09 • IA Generativa & Agentes',
        title: 'Integración práctica de modelos LLM, ingeniería de prompts, flujos RAG con embeddings y desarrollo aumentado.',
        skills: ['Prompt Engineering', 'Agentes Autónomos', 'Embeddings & RAG', 'APIs de LLM'],
      },
    };

    return paths.map((p, idx) => {
      const cat = p.category || (p.category_id ? catMap.get(Number(p.category_id)) : null);
      const enrichedPath: LearningPath = {
        ...p,
        category: cat || p.category,
      };

      const ms = pathMilestones[p.slug] || {
        badge: `Hito 0${idx + 1} • Especialización Técnica`,
        title: p.description,
        skills: ['Ingeniería de Sistemas', 'Buenas Prácticas', 'Proyectos Reales'],
      };

      const color = cat?.color || '#0AE98A';
      const name = cat?.name || 'Ingeniería';

      let phaseLabel: string | undefined;
      if (idx === 0) phaseLabel = 'Fase 01 · Fundamentos y Lógica Computacional';
      if (idx === 3) phaseLabel = 'Fase 02 · Arquitectura y Desarrollo de Software';
      if (idx === 6) phaseLabel = 'Fase 03 · Infraestructura, Calidad & Inteligencia Artificial';

      return {
        path: enrichedPath,
        color,
        name,
        isRight: idx % 2 === 1,
        num: idx + 1,
        delay: Math.round(idx * 0.12 * 10) / 10,
        levelBadge: ms.badge,
        milestoneTitle: ms.title,
        skills: ms.skills,
        phaseLabel,
      };
    });
  }

  /**
   * Mide el centro real de cada nodo (getBoundingClientRect) y genera:
   *  - los segmentos SVG que unen las estaciones en orden (el "snake"),
   *  - la polyline para la partícula animada (offset-path),
   *  - los observers de intersección (dibuja la serpiente al hacer scroll)
   *    y de resize (recalcula al cambiar el viewport).
   */
  private measureSnake() {
    const wrap = this.snakeWrap?.nativeElement;
    if (!wrap || this.snakeStops().length === 0) return;
    const nodes = Array.from(wrap.querySelectorAll<HTMLElement>('.snake__node'));
    if (nodes.length === 0) return;

    const wrapRect = wrap.getBoundingClientRect();
    const pts = nodes.map(n => {
      const r = n.getBoundingClientRect();
      return { x: r.left + r.width / 2 - wrapRect.left, y: r.top + r.height / 2 - wrapRect.top };
    });

    const segs: SnakeSeg[] = [];
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    for (let i = 1; i < pts.length; i++) {
      const len = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segs.push({
        x1: pts[i - 1].x, y1: pts[i - 1].y,
        x2: pts[i].x,     y2: pts[i].y,
        color: this.snakeStops()[i]?.color || '#0AE98A',
        len: Math.round(len * 10) / 10,
        delay: Math.round(i * 0.12 * 10) / 10,
      });
    }
    this.snakeSegments.set(segs);

    const dot = wrap.querySelector<SVGCircleElement>('.snake__motion');
    if (dot && d.length > 2) {
      dot.style.setProperty('offset-path', `path('${d}')`);
    }

    if (!this.resizeObs) {
      this.resizeObs = new ResizeObserver(() => this.measureSnake());
      this.resizeObs.observe(wrap);
      this.intersectObs = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this.snakeVisible.set(true);
          this.intersectObs?.disconnect();
        }
      }, { threshold: 0.12 });
      this.intersectObs.observe(wrap);
    }
  }

  difficultyLabel(d: string): string {
    const map: Record<string, string> = {
      beginner: 'Principiante', intermediate: 'Intermedio',
      advanced: 'Avanzado', expert: 'Experto',
    };
    return map[d] ?? d;
  }

  getPathGradient(path: LearningPath): string {
    const color = path.category?.color ?? '#6C63FF';
    return `linear-gradient(135deg, ${color}44, ${color}22)`;
  }
}
