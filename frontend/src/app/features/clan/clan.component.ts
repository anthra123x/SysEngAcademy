import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClansService } from '../../core/services/clans.service';
import { AuthService } from '../../core/services/auth.service';
import { AppIconComponent } from '../../shared/components/app-icon.component';
import { StudyGroup, ResearchLogEntry, ResearchProject } from '../../core/models/clan';

@Component({
  selector: 'app-clan',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AppIconComponent],
  templateUrl: './clan.component.html',
  styleUrl: './clan.component.scss',
})
export class ClanComponent implements OnInit {
  readonly clansService = inject(ClansService);
  readonly auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly Math = Math;

  // Tabs de navegación interna del Clan
  activeTab = signal<'feed' | 'projects' | 'arena' | 'members'>('feed');
  selectedClanId = signal<string | null>(null);
  feedFilter = signal<'all' | 'hallazgo' | 'benchmark' | 'paper' | 'propuesta'>('all');
  browseAllClans = signal<boolean>(false);

  // Modales
  showNewLogModal = signal<boolean>(false);
  showNewProjectModal = signal<boolean>(false);
  showCreateClanModal = signal<boolean>(false);

  // Formulario de Nueva Idea / Bitácora
  newLogTitle = signal<string>('');
  newLogContent = signal<string>('');
  newLogType = signal<'hallazgo' | 'pregunta' | 'paper' | 'benchmark' | 'propuesta'>('hallazgo');
  newLogCode = signal<string>('');
  newLogLanguage = signal<string>('typescript');

  // Formulario de Nuevo Proyecto
  newProjectTitle = signal<string>('');
  newProjectDesc = signal<string>('');
  newProjectStack = signal<string>('TypeScript, Node.js, Docker');
  newProjectRepo = signal<string>('');

  // Formulario de Creación de Clan
  newClanName = signal<string>('');
  newClanTag = signal<string>('');
  newClanCategory = signal<string>('systems');
  newClanDesc = signal<string>('');
  newClanLines = signal<string>('Concurrencia, Sistemas Distribuidos, Criptografía');

  // Comentarios en línea
  commentDrafts = signal<Record<string, string>>({});
  copiedSnippetId = signal<string | null>(null);

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

  selectClan(clan: StudyGroup): void {
    this.selectedClanId.set(clan.id);
    this.browseAllClans.set(false);
  }

  joinCurrentClan(): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.joinClan(clan.id);
    }
  }

  leaveCurrentClan(): void {
    const clan = this.currentClan();
    if (clan && confirm(`¿Estás seguro de que deseas salir del clan ${clan.name}?`)) {
      this.clansService.leaveClan(clan.id);
    }
  }

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
  }

  toggleTask(projectId: string, taskId: string): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.toggleProjectTask(clan.id, projectId, taskId);
    }
  }

  joinProject(projectId: string): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.joinProject(clan.id, projectId);
    }
  }

  contributeToQuest(): void {
    const clan = this.currentClan();
    if (clan) {
      this.clansService.completeQuestContribution(clan.id, 1);
    }
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
  }
}
