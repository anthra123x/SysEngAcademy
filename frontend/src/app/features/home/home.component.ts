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
      this.snakeStops.set(this.buildSnake(home.learning_paths.data));
      // Esperar a que Angular pinte los nodos antes de medir la ruta.
      setTimeout(() => this.measureSnake(), 0);
    });
  }

  /** Crea las estaciones del roadmap en disposición alternante (L -> R -> L) con eje central */
  private buildSnake(paths: LearningPath[]): SnakeStop[] {
    const milestones = [
      { badge: 'Hito 01 • Fundamentos Base', desc: 'Pensamiento lógico, variables, control de flujo y sintaxis esencial' },
      { badge: 'Hito 02 • Especialización Backend', desc: 'Arquitectura de servidores, APIs RESTful, seguridad y bases de datos' },
      { badge: 'Hito 03 • Dominio Fullstack', desc: 'Integración frontend moderna, TypeScript, Single Page Apps y cloud' },
      { badge: 'Hito 04 • DevOps y Plataformas', desc: 'Contenedores Docker, CI/CD automatizado y orquestación' },
      { badge: 'Hito 05 • Inteligencia Artificial', desc: 'Modelos de lenguaje, agentes autónomos y prompt engineering' },
    ];

    return paths.map((p, idx) => {
      const ms = milestones[idx] || { badge: `Hito 0${idx + 1} • Especialización`, desc: p.description };
      return {
        path: p,
        color: p.category?.color ?? '#0AE98A',
        name: p.category?.name ?? 'Ruta',
        isRight: idx % 2 === 1,
        num: idx + 1,
        delay: Math.round(idx * 0.12 * 10) / 10,
        levelBadge: ms.badge,
        milestoneTitle: ms.desc,
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
