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
import { Challenge } from './codelab.models';

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

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  // Data signals from service
  readonly spotlightChallenge = this.codelabService.spotlightChallenge;
  readonly challenges = this.codelabService.filteredChallenges;
  readonly stats = this.codelabService.stats;
  readonly tabCounts = this.codelabService.tabCounts;

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
    this.startCountdown();
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

  private startCountdown(): void {
    let totalSeconds = 7 * 3600 + 42 * 60 + 19;
    this.timerInterval = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        this.countdownTimer.set(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
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
    this.codelabService.toggleVote(challenge.id);
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
