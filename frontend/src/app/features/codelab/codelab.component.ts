import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CodelabService } from './codelab.service';
import { Challenge, CodelabComment } from './codelab.models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-codelab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './codelab.component.html',
  styleUrls: ['./codelab.component.scss'],
})
export class CodelabComponent implements OnInit, OnDestroy {
  readonly codelabService = inject(CodelabService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  // Data signals from service
  readonly spotlightChallenge = this.codelabService.spotlightChallenge;
  readonly challenges = this.codelabService.filteredChallenges;
  readonly stats = this.codelabService.stats;
  readonly tabCounts = this.codelabService.tabCounts;

  // Comments modal state
  readonly activeCommentsChallenge = signal<Challenge | null>(null);
  readonly commentsList = signal<CodelabComment[]>([]);
  readonly isLoadingComments = signal<boolean>(false);
  readonly newCommentContent = signal<string>('');
  readonly newCommentSnippet = signal<string>('');
  readonly isSubmittingComment = signal<boolean>(false);

  // Countdown timer for daily challenge
  readonly countdownTimer = signal<string>('07h 42m 19s');
  private timerInterval?: ReturnType<typeof setInterval>;

  // Modal / Creator Drawer state
  readonly isCreateModalOpen = signal<boolean>(false);
  newChallengeData = {
    title: '',
    description: '',
    difficulty: 'media' as 'facil' | 'media' | 'dificil' | 'hardcore',
    category: 'algoritmos' as 'algoritmos' | 'estructuras' | 'concurrencia' | 'so' | 'bd' | 'compiladores',
    inputStdin: '',
    expectedStdout: '',
  };

  // Active filters helper
  readonly activeFiltersText = computed(() => {
    const parts: string[] = [];
    if (this.codelabService.selectedDifficulty()) parts.push('Dificultad');
    if (this.codelabService.selectedLanguage()) parts.push('Lenguaje');
    if (this.codelabService.selectedCategory()) parts.push('Categoría');
    if (this.codelabService.searchQuery()) parts.push('Búsqueda');
    return parts.length > 0 ? parts.join(', ') : 'Ninguno';
  });

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  // Hotkey: CTRL+K or CMD+K focuses search
  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInputRef?.nativeElement.focus();
    }
  }

  setTab(tab: 'todos' | 'oficiales' | 'comunidad' | 'mis_retos' | 'mis_soluciones'): void {
    this.codelabService.activeTab.set(tab);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.codelabService.searchQuery.set(input.value);
  }

  onDifficultyChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codelabService.selectedDifficulty.set(select.value);
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codelabService.selectedLanguage.set(select.value);
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.codelabService.selectedCategory.set(select.value);
  }

  setSemesterTrack(track: string): void {
    this.codelabService.selectedTrack.set(track);
  }

  clearFilters(): void {
    this.codelabService.searchQuery.set('');
    this.codelabService.selectedDifficulty.set('');
    this.codelabService.selectedLanguage.set('');
    this.codelabService.selectedCategory.set('');
    this.codelabService.selectedTrack.set('all');
    this.codelabService.activeTab.set('todos');
  }

  voteChallenge(challenge: Challenge, event: Event): void {
    event.stopPropagation();
    const willVote = !challenge.userVoted;
    this.codelabService.toggleVote(challenge.slug || challenge.id);
    this.notificationService.show({
      type: willVote ? 'success' : 'info',
      title: willVote ? '¡Voto registrado!' : 'Voto retirado',
      message: willVote
        ? `Has apoyado el reto "${challenge.title}".`
        : `Has retirado tu voto de "${challenge.title}".`,
      duration: 3000,
    });
  }

  openCommentsModal(challenge: Challenge, event: Event): void {
    event.stopPropagation();
    this.activeCommentsChallenge.set(challenge);
    this.isLoadingComments.set(true);
    this.newCommentContent.set('');
    this.newCommentSnippet.set('');

    this.codelabService.getComments(challenge.slug || challenge.id).subscribe({
      next: (comments) => {
        this.commentsList.set(comments);
        this.isLoadingComments.set(false);
      },
      error: () => {
        this.commentsList.set([]);
        this.isLoadingComments.set(false);
      }
    });
  }

  closeCommentsModal(): void {
    this.activeCommentsChallenge.set(null);
  }

  submitComment(): void {
    const challenge = this.activeCommentsChallenge();
    const content = this.newCommentContent().trim();
    if (!challenge || !content || this.isSubmittingComment()) return;

    this.isSubmittingComment.set(true);
    const snippet = this.newCommentSnippet().trim();

    this.codelabService.addComment(challenge.slug || challenge.id, content, snippet).subscribe({
      next: (createdComment) => {
        this.commentsList.update(list => [createdComment, ...list]);
        this.newCommentContent.set('');
        this.newCommentSnippet.set('');
        this.isSubmittingComment.set(false);
        this.notificationService.show({
          type: 'success',
          title: '¡Comentario publicado!',
          message: 'Tu aporte ha sido compartido en la discusión del reto (+15 XP).',
          duration: 3500,
        });
      },
      error: () => {
        this.isSubmittingComment.set(false);
      }
    });
  }

  toggleBookmark(challenge: Challenge): void {
    // Bookmark interaction feedback
    challenge.userVoted = !challenge.userVoted;
  }

  openSolver(challenge: Challenge): void {
    this.router.navigate(['/codelab', challenge.slug]);
  }

  openRandomChallenge(): void {
    const all = this.codelabService.allChallenges();
    if (all.length > 0) {
      const randomIndex = Math.floor(Math.random() * all.length);
      this.openSolver(all[randomIndex]);
    }
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitNewChallenge(): void {
    if (!this.newChallengeData.title || !this.newChallengeData.description) return;

    this.codelabService.publishNewChallenge({
      title: this.newChallengeData.title,
      description: this.newChallengeData.description,
      difficulty: this.newChallengeData.difficulty,
      category: this.newChallengeData.category,
      tags: [`#${this.newChallengeData.category}`, '#comunidad'],
      languages: ['Python', 'JavaScript'],
      inputStdin: this.newChallengeData.inputStdin,
      expectedStdout: this.newChallengeData.expectedStdout,
    });

    this.closeCreateModal();
    this.codelabService.activeTab.set('comunidad');

    // Reset form
    this.newChallengeData = {
      title: '',
      description: '',
      difficulty: 'media',
      category: 'algoritmos',
      inputStdin: '',
      expectedStdout: '',
    };
  }
}
