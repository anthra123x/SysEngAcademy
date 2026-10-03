import { Component, Input, computed } from '@angular/core';
import {
  LucideAngularModule,
  LucideIconData,
  // Categorías de Ingeniería y Computación (iconos precisos)
  Terminal,
  Binary,
  Blocks,
  Boxes,
  Database,
  Network,
  Cpu,
  FolderTree,
  Globe,
  Server,
  Layout,
  Palette,
  Workflow,
  MonitorSmartphone,
  Container,
  GitBranch,
  GitFork,
  GitMerge,
  GitPullRequest,
  ClipboardList,
  BrainCircuit,
  Sparkles,
  // Iconos UI, Navegación y Funcionalidades
  Code,
  Zap,
  Book,
  BookOpen,
  Clock,
  Trophy,
  Award,
  Medal,
  Map,
  MessageSquare,
  MessageCircle,
  Search,
  Target,
  Check,
  CircleCheck,
  Lock,
  Lightbulb,
  Flame,
  Mail,
  RefreshCw,
  Plus,
  FileText,
  Construction,
  Video,
  GraduationCap,
  CircleQuestionMark,
  Star,
  Shield,
  Settings,
  Compass,
  FlaskConical,
  Folder,
  Copy,
  Download,
  ExternalLink,
  User,
  TriangleAlert,
  Send,
  PenLine,
  Coffee,
  TrendingUp,
  X,
  Play,
  Monitor,
  HardDrive,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-angular';

/**
 * Registro de iconos de Lucide disponibles para toda la plataforma SysEngAcademy.
 * Cada icono proviene de la librería oficial `lucide-angular`.
 */
const LUCIDE_ICONS: Record<string, LucideIconData> = {
  // Categorías principales de Ingeniería de Sistemas
  'terminal': Terminal,
  'binary': Binary,
  'blocks': Blocks,
  'boxes': Boxes,
  'database': Database,
  'network': Network,
  'cpu': Cpu,
  'folder-tree': FolderTree,
  'globe': Globe,
  'server': Server,
  'layout': Layout,
  'palette': Palette,
  'workflow': Workflow,
  'monitor-smartphone': MonitorSmartphone,
  'container': Container,
  'git-branch': GitBranch,
  'git-fork': GitFork,
  'git-merge': GitMerge,
  'git-pull-request': GitPullRequest,
  'clipboard-list': ClipboardList,
  'brain-circuit': BrainCircuit,
  'sparkles': Sparkles,

  // Utilidades y UI del sistema
  'code': Code,
  'zap': Zap,
  'book': Book,
  'book-open': BookOpen,
  'clock': Clock,
  'trophy': Trophy,
  'award': Award,
  'medal': Medal,
  'map': Map,
  'chat': MessageSquare,
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  'search': Search,
  'target': Target,
  'check': Check,
  'check-circle': CircleCheck,
  'lock': Lock,
  'lightbulb': Lightbulb,
  'flame': Flame,
  'mail': Mail,
  'refresh-cw': RefreshCw,
  'plus': Plus,
  'file-text': FileText,
  'construction': Construction,
  'video': Video,
  'graduation-cap': GraduationCap,
  'help-circle': CircleQuestionMark,
  'star': Star,
  'shield': Shield,
  'settings': Settings,
  'compass': Compass,
  'flask': FlaskConical,
  'folder': Folder,
  'copy': Copy,
  'download': Download,
  'external-link': ExternalLink,
  'user': User,
  'alert-triangle': TriangleAlert,
  'send': Send,
  'edit': PenLine,
  'coffee': Coffee,
  'chart': TrendingUp,
  'x': X,
  'play': Play,
  'monitor': Monitor,
  'hard-drive': HardDrive,
  'layers': Layers,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <lucide-angular
      [img]="resolvedIconData()"
      [size]="size"
      [strokeWidth]="strokeWidth"
      [color]="resolvedColor()"
      [class]="'app-icon ' + extraClass"
    ></lucide-angular>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
      line-height: 0;
    }
    .app-icon {
      display: inline-block;
      transition: transform var(--transition-fast, 150ms ease), stroke var(--transition-fast, 150ms ease);
    }
    :host ::ng-deep svg.lucide {
      display: block;
      vertical-align: middle;
    }
  `]
})
export class AppIconComponent {
  @Input() name: string = 'code';
  @Input() category?: string | null = null;
  @Input() size: number | string = 18;
  @Input() strokeWidth: number | string = 2;
  @Input() color?: string | null = null;
  @Input() extraClass: string = '';

  /**
   * Resuelve el icono adecuado proveniente de la librería `lucide-angular`.
   * Si se especifica una categoría, utiliza el mapeo semántico especializado de Ingeniería de Software.
   */
  resolvedIconData = computed<LucideIconData>(() => {
    let key = this.name?.trim() || 'code';
    if (this.category) {
      key = this.categoryToIconName(this.category);
    } else {
      key = this.normalizeIconKey(key);
    }
    return LUCIDE_ICONS[key] ?? LUCIDE_ICONS['code'];
  });

  resolvedColor = computed(() => {
    return this.color ?? 'currentColor';
  });

  /**
   * Normaliza identificadores PascalCase, kebab-case y variantes de base de datos
   * para empatar con las llaves registradas en LUCIDE_ICONS.
   */
  private normalizeIconKey(raw: string): string {
    if (!raw) return 'code';
    // Convertir CamelCase / PascalCase a kebab-case (e.g. GitBranch -> git-branch)
    const kebab = raw
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase()
      .trim();

    const aliases: Record<string, string> = {
      'gitbranch': 'git-branch',
      'gitfork': 'git-fork',
      'foldertree': 'folder-tree',
      'treepine': 'folder-tree',
      'tree-pine': 'folder-tree',
      'clipboardlist': 'clipboard-list',
      'braincircuit': 'brain-circuit',
      'bookopen': 'book-open',
      'circlecheck': 'check-circle',
      'messagesquare': 'message-square',
      'filetext': 'file-text',
      'harddrive': 'hard-drive',
      'monitorsmartphone': 'monitor-smartphone',
    };

    return aliases[kebab] || kebab;
  }

  /**
   * Mapeo semántico de alta fidelidad entre los slugs y nombres de categorías de base de datos
   * y los iconos oficiales de Lucide acordes a su temática técnica real.
   */
  private categoryToIconName(input: string): string {
    const slug = input.toLowerCase().trim();
    const map: Record<string, string> = {
      // 1. Programación Básica: Fundamentos de lógica, consola y ejecución de scripts
      'programacion-basica': 'terminal',
      'programacion basica': 'terminal',
      'programación básica': 'terminal',
      'fundamentos': 'terminal',

      // 2. Algoritmos: Lógica computacional, aritmética binaria y complejidad algorítmica
      'algoritmos': 'binary',
      'algoritmo': 'binary',

      // 3. Programación Orientada a Objetos: Clases, abstracciones modulares y bloques
      'poo': 'blocks',
      'programacion orientada a objetos': 'blocks',
      'programación orientada a objetos': 'blocks',
      'oop': 'blocks',

      // 4. Bases de Datos: SQL relacional, índices, transacciones y almacenamiento
      'bases-de-datos': 'database',
      'bases de datos': 'database',
      'base de datos': 'database',
      'database': 'database',
      'sql': 'database',

      // 5. Redes de Computadoras: Topologías de red, sockets, protocolos y puertos
      'redes': 'network',
      'redes de computadoras': 'network',
      'networking': 'network',

      // 6. Sistemas Operativos: Arquitectura de kernel, CPU scheduling y memoria
      'sistemas-operativos': 'cpu',
      'sistemas operativos': 'cpu',
      'so': 'cpu',

      // 7. Estructuras de Datos: Árboles, grafos, nodos y listas jerárquicas
      'estructuras-de-datos': 'folder-tree',
      'estructuras de datos': 'folder-tree',
      'data-structures': 'folder-tree',

      // 8. Desarrollo Web: Estándares web, HTTP y alcance global en internet
      'desarrollo-web': 'globe',
      'desarrollo web': 'globe',
      'web': 'globe',

      // 9. Desarrollo Backend: Servidores dedicados, APIs REST y microservicios
      'desarrollo-backend': 'server',
      'desarrollo backend': 'server',
      'backend': 'server',

      // 10. Desarrollo Frontend: Maquetación responsive, vistas y UI engineering
      'desarrollo-frontend': 'layout',
      'desarrollo frontend': 'layout',
      'frontend': 'layout',

      // 11. DevOps & Cloud: Contenedores Docker, CI/CD pipelines y orquestación
      'devops': 'container',
      'cloud': 'container',

      // 12. Git: Control de versiones colaborativo y bifurcación de ramas
      'git': 'git-branch',
      'git y control de versiones': 'git-branch',
      'control-versiones': 'git-branch',

      // 13. Ingeniería de Software: Arquitectura de sistemas, especificaciones y calidad
      'ingenieria-software': 'clipboard-list',
      'ingenieria de software': 'clipboard-list',
      'ingeniería de software': 'clipboard-list',

      // 14. Inteligencia Artificial: Redes neuronales, circuitos cognitivos y LLMs
      'ia-desarrollo': 'brain-circuit',
      'ia para desarrollo': 'brain-circuit',
      'desarrollo con ia': 'brain-circuit',
      'ia': 'brain-circuit',
      'ai': 'brain-circuit',
    };
    return map[slug] ?? this.normalizeIconKey(slug);
  }
}
