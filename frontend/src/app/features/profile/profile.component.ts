import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { Enrollment } from '../../core/models';

export interface AsciiAvatar {
  id: string;
  name: string;
  subtitle: string;
  ascii: string;
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

export interface StudyGroup {
  id: string;
  name: string;
  tag: string;
  category: string;
  description: string;
  membersCount: number;
  streakDays: number;
  weeklyChallenge: {
    title: string;
    xpReward: number;
    completed: boolean;
  };
  recentLogs: { author: string; message: string; timeAgo: string }[];
  isMember: boolean;
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
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page">
      <div class="container">

        <!-- ========================================================
             BANNER ONBOARDING / NIVELACIÓN PENDIENTE (SI APLICA)
             ======================================================== -->
        @if (!diagnosticCompleted()) {
          <div class="onboarding-notice-bar animate-fade-in">
            <div class="onboarding-notice-left">
              <span class="pulse-icon">⚡</span>
              <div class="notice-text">
                <strong>[NIVELACIÓN PENDIENTE]</strong>
                <span>Realiza tu test inicial con el Agente de IA para calibrar tu nivel de programación y asignar tu ruta recomendada.</span>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-primary-glitch" (click)="activeTab.set('diagnostic')">
              $ syseng-diagnostic --eval →
            </button>
          </div>
        }

        <!-- ========================================================
             LINUX TERMINAL WINDOW FRAME (MINIMALISTA)
             ======================================================== -->
        <div class="terminal-window">
          <!-- Terminal Titlebar -->
          <div class="terminal-titlebar">
            <div class="terminal-dots">
              <span class="dot dot-close"></span>
              <span class="dot dot-minimize"></span>
              <span class="dot dot-maximize"></span>
            </div>
            <div class="terminal-title">
              <span class="terminal-icon">🐧</span>
              <span>syseng-profile — {{ auth.user()?.email || 'student' }}@syseng-box: ~/profile (bash)</span>
            </div>
            <div class="terminal-sys-status">
              <span class="streak-pill-header" title="Racha activa de estudio consecutivo">
                🔥 {{ currentStreak() }}d streak
              </span>
              <span class="status-indicator"></span>
              <span class="status-label">ONLINE</span>
            </div>
          </div>

          <!-- Terminal Inner Content -->
          <div class="terminal-content">

            <!-- ========================================================
                 NEOFETCH SYSINFO HERO BANNER (MINIMALISTA)
                 ======================================================== -->
            <div class="neofetch-card">
              <!-- ASCII Avatar Box (Clickable to change avatar) -->
              <div class="neofetch-logo" (click)="openAvatarModal()" title="Haz clic para personalizar tu avatar ASCII">
                <pre class="ascii-art">{{ currentAsciiAvatar().ascii }}</pre>
                <div class="ascii-hover-overlay">
                  <span>[ ⚙ Cambiar ASCII ]</span>
                </div>
              </div>

              <!-- Sysinfo Metadata -->
              <div class="neofetch-info">
                <div class="neofetch-user-header">
                  <span class="prompt-user">{{ auth.user()?.name }}</span>
                  <span class="prompt-at">&#64;</span>
                  <span class="prompt-host">syseng-academy</span>
                  <button type="button" class="btn-avatar-chip" (click)="openAvatarModal()">
                    <span>avatar: {{ currentAsciiAvatar().name }}</span>
                    <span class="btn-avatar-icon">✎</span>
                  </button>
                </div>
                <div class="neofetch-divider">────────────────────────────────────────────────</div>

                <div class="neofetch-grid">
                  <div class="meta-row">
                    <span class="meta-k">OS:</span>
                    <span class="meta-v">SysEng Linux OS (x86_64 Cloud Sandbox)</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Rango & Nivel:</span>
                    <span class="meta-v rank-tag">Nivel {{ userLevel() }} — {{ rankTitle() }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Especialidad:</span>
                    <span class="meta-v spec-tag">{{ specialization().icon }} {{ specialization().title }}</span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Racha Activa:</span>
                    <span class="meta-v streak-tag">
                      <strong>🔥 {{ currentStreak() }} días consecutivos</strong>
                      <span class="streak-boost">({{ streakMultiplier() }}x XP Boost)</span>
                    </span>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Experiencia (XP):</span>
                    <div class="meta-v xp-inline">
                      <span>{{ totalXp() }} XP</span>
                      <div class="xp-bar-inline">
                        <div class="xp-fill-inline" [style.width.%]="xpProgressPercent()"></div>
                      </div>
                      <span class="xp-next">{{ xpToNextLevel() }} XP para Nivel {{ userLevel() + 1 }}</span>
                    </div>
                  </div>
                  <div class="meta-row">
                    <span class="meta-k">Clan / Grupo:</span>
                    <span class="meta-v text-cyan">{{ myGroupName() }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ========================================================
                 TERMINAL NAVIGATION TABS (BASH COMMANDS)
                 ======================================================== -->
            <nav class="terminal-nav" aria-label="Navegación del perfil en terminal">
              <button
                type="button"
                class="term-tab"
                [class.is-active]="activeTab() === 'overview'"
                (click)="activeTab.set('overview')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">whoami</span>
                <span class="term-tab__flag">--courses</span>
              </button>

              <button
                type="button"
                class="term-tab term-tab--streak"
                [class.is-active]="activeTab() === 'streak'"
                (click)="activeTab.set('streak')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">streak</span>
                <span class="term-tab__flag">🔥 {{ currentStreak() }}d</span>
              </button>

              <button
                type="button"
                class="term-tab term-tab--diag"
                [class.is-active]="activeTab() === 'diagnostic'"
                (click)="activeTab.set('diagnostic')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">diagnostic</span>
                <span class="term-tab__flag">--eval-ia</span>
              </button>

              <button
                type="button"
                class="term-tab"
                [class.is-active]="activeTab() === 'guilds'"
                (click)="activeTab.set('guilds')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">guilds</span>
                <span class="term-tab__flag">--study</span>
              </button>

              <button
                type="button"
                class="term-tab"
                [class.is-active]="activeTab() === 'achievements'"
                (click)="activeTab.set('achievements')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">achievements</span>
                <span class="term-tab__flag">--badges ({{ unlockedBadgesCount() }}/{{ badges().length }})</span>
              </button>

              <button
                type="button"
                class="term-tab"
                [class.is-active]="activeTab() === 'leaderboard'"
                (click)="activeTab.set('leaderboard')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">leaderboard</span>
                <span class="term-tab__flag">#{{ myRank() }}</span>
              </button>

              <button
                type="button"
                class="term-tab term-tab--ai"
                [class.is-active]="activeTab() === 'advisor'"
                (click)="activeTab.set('advisor')"
              >
                <span class="term-tab__prompt">$</span>
                <span class="term-tab__cmd">advisor</span>
                <span class="term-tab__flag">--ai 🤖</span>
              </button>
            </nav>

            <!-- ========================================================
                 TAB 1: WHOAMI & PROCESS TABLE
                 ======================================================== -->
            @if (activeTab() === 'overview') {
              <div class="tab-pane animate-fade-in">
                <!-- Clean Minimal Sensor Metrics -->
                <div class="sensor-grid">
                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">CURSOS MATRICULADOS</span>
                      <span class="sensor-code">[SYS_ENR]</span>
                    </div>
                    <div class="sensor-num">{{ enrollments().length }}</div>
                    <div class="sensor-footer">
                      <span class="sensor-sub">{{ completedCount() }} completados (100%)</span>
                    </div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">RACHA DE ESTUDIO</span>
                      <span class="sensor-code">[STREAK_OK]</span>
                    </div>
                    <div class="sensor-num text-orange">🔥 {{ currentStreak() }}d</div>
                    <div class="sensor-footer">
                      <span class="sensor-sub">Récord: {{ maxStreak() }} días</span>
                    </div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">RETOS CLI RESUELTOS</span>
                      <span class="sensor-code">[CLI_EXEC]</span>
                    </div>
                    <div class="sensor-num">{{ solvedChallengesCount() }}</div>
                    <div class="sensor-footer">
                      <span class="sensor-sub">Algoritmos en terminal</span>
                    </div>
                  </div>

                  <div class="sensor-card sensor-card--glow">
                    <div class="sensor-card__head">
                      <span class="sensor-label">INSIGNIAS OBTENIDAS</span>
                      <span class="sensor-code">[BADGES]</span>
                    </div>
                    <div class="sensor-num">{{ unlockedBadgesCount() }}/{{ badges().length }}</div>
                    <div class="sensor-footer">
                      <span class="sensor-sub text-primary">Firmadas con SHA-256</span>
                    </div>
                  </div>
                </div>

                <!-- Process Table ps aux -->
                <div class="section-container">
                  <div class="section-terminal-bar">
                    <div class="terminal-bar-title">
                      <span class="term-prefix">ps aux | grep</span>
                      <span class="term-arg">courses_active</span>
                    </div>
                    <span class="term-status-badge">PID_TOTAL: {{ enrollments().length }}</span>
                  </div>

                  @if (loading()) {
                    <div class="skeleton-list">
                      <div class="skeleton-line" *ngFor="let i of [1,2,3]"></div>
                    </div>
                  } @else if (enrollments().length === 0) {
                    <div class="term-empty-card">
                      <p class="term-empty-title">[WARN] No hay procesos de estudio en ejecución</p>
                      <p class="term-empty-desc">Inscríbete a un curso para iniciar tu hilo de ejecución y acumular XP.</p>
                      <a routerLink="/cursos" class="btn btn-primary btn-sm">Explorar Catálogo →</a>
                    </div>
                  } @else {
                    <div class="course-process-table">
                      <div class="process-table-head">
                        <span class="col-pid">PID</span>
                        <span class="col-title">CURSO / PROCESO DE APRENDIZAJE</span>
                        <span class="col-cat">CATEGORÍA</span>
                        <span class="col-prog">PROGRESO</span>
                        <span class="col-status">ESTADO</span>
                        <span class="col-action">ACCIÓN</span>
                      </div>

                      @for (enr of enrollments(); track enr.id; let i = $index) {
                        <div class="process-row">
                          <span class="col-pid">10{{ 40 + i }}</span>
                          <span class="col-title">
                            <span class="proc-icon">{{ emoji(enr) }}</span>
                            <strong>{{ enr.course?.title }}</strong>
                          </span>
                          <span class="col-cat">
                            <span class="cat-chip">{{ enr.course?.category?.name || 'General' }}</span>
                          </span>
                          <span class="col-prog">
                            <div class="prog-wrapper">
                              <span class="prog-percent">{{ enr.progress_percent }}%</span>
                              <div class="prog-bar-shell">
                                <div class="prog-bar-fill" [style.width.%]="enr.progress_percent"></div>
                              </div>
                            </div>
                          </span>
                          <span class="col-status">
                            @if (enr.completed_at || enr.progress_percent === 100) {
                              <span class="status-pill status-pill--done">✓ GRADUADO</span>
                            } @else {
                              <span class="status-pill status-pill--running">⚡ EN EJECUCIÓN</span>
                            }
                          </span>
                          <span class="col-action">
                            <a [routerLink]="['/cursos', enr.course?.slug]" class="btn-term-run">
                              <span>exec &gt;</span>
                            </a>
                          </span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ========================================================
                 TAB 2: SISTEMA DE RACHAS (STREAKS & PROGRESS)
                 ======================================================== -->
            @if (activeTab() === 'streak') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">systemctl status</span>
                    <span class="term-arg">student-streak.service</span>
                  </div>
                  <span class="term-status-badge text-orange">🔥 RACHA CONSECUTIVA ACTIVA</span>
                </div>

                <div class="streak-dashboard-layout">
                  <!-- Main Streak Metric Card -->
                  <div class="streak-hero-card">
                    <div class="streak-flame-box">
                      <span class="flame-big">🔥</span>
                      <div class="flame-counter">
                        <span class="counter-num">{{ currentStreak() }}</span>
                        <span class="counter-lbl">DÍAS CONSECUTIVOS</span>
                      </div>
                    </div>

                    <div class="streak-stats-row">
                      <div class="streak-stat-item">
                        <span class="stat-k">Racha Histórica Máxima:</span>
                        <span class="stat-v">{{ maxStreak() }} días</span>
                      </div>
                      <div class="streak-stat-item">
                        <span class="stat-k">Multiplicador XP:</span>
                        <span class="stat-v text-success">{{ streakMultiplier() }}x Boost</span>
                      </div>
                      <div class="streak-stat-item">
                        <span class="stat-k">Estado de Hoy:</span>
                        @if (todayCheckedIn()) {
                          <span class="stat-v text-success">✓ Check-in Realizado (+25 XP)</span>
                        } @else {
                          <span class="stat-v text-orange">⚡ Pendiente de Check-in</span>
                        }
                      </div>
                    </div>

                    <div class="streak-action-box">
                      @if (!todayCheckedIn()) {
                        <button type="button" class="btn btn-primary btn-block" (click)="doDailyCheckIn()">
                          🔥 Registrar Práctica Diaria de Hoy (+25 XP)
                        </button>
                      } @else {
                        <div class="checked-in-banner">
                          <span>✓ ¡Excelente! Ya aseguraste tu racha de hoy. Vuelve mañana para sumar el día {{ currentStreak() + 1 }}.</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Weekly Activity Matrix / Heatmap -->
                  <div class="streak-week-card">
                    <h3 class="streak-card-title">Matriz de Actividad Semanal</h3>
                    <p class="streak-card-desc">Cada día de estudio, resolución de retos CLI o lecciones superadas mantiene tu flujo de aprendizaje continuo.</p>

                    <div class="week-days-grid">
                      @for (day of weekDays(); track day.dayName) {
                        <div
                          class="week-day-cell"
                          [class.is-done]="day.completed"
                          [class.is-today]="day.isToday"
                        >
                          <span class="day-name">{{ day.dayName }}</span>
                          <div class="day-indicator">
                            @if (day.completed) {
                              <span>🔥</span>
                            } @else if (day.isToday) {
                              <span>⚡</span>
                            } @else {
                              <span>·</span>
                            }
                          </div>
                          <span class="day-status-txt">
                            @if (day.completed) { OK } @else if (day.isToday) { HOY } @else { PEND }
                          </span>
                        </div>
                      }
                    </div>

                    <!-- Milestones Rewards for Streaks -->
                    <div class="streak-milestones-list">
                      <div class="milestone-row" [class.unlocked]="currentStreak() >= 3">
                        <span class="m-icon">🥉</span>
                        <div class="m-info">
                          <strong>Racha de 3 Días — Iniciación Constante</strong>
                          <span>Multiplicador 1.10x en todos los retos algorítmicos.</span>
                        </div>
                        <span class="m-badge">{{ currentStreak() >= 3 ? '✓ DESBLOQUEADO' : '3 DÍAS' }}</span>
                      </div>

                      <div class="milestone-row" [class.unlocked]="currentStreak() >= 7">
                        <span class="m-icon">🥈</span>
                        <div class="m-info">
                          <strong>Racha de 7 Días — Disciplina de Hierro</strong>
                          <span>Multiplicador 1.25x + Insignia Especial de Consistencia.</span>
                        </div>
                        <span class="m-badge">{{ currentStreak() >= 7 ? '✓ DESBLOQUEADO' : '7 DÍAS' }}</span>
                      </div>

                      <div class="milestone-row" [class.unlocked]="currentStreak() >= 14">
                        <span class="m-icon">🥇</span>
                        <div class="m-info">
                          <strong>Racha de 14 Días — Modo Hacker Linux</strong>
                          <span>Multiplicador 1.40x + Título Honorífico en el Leaderboard.</span>
                        </div>
                        <span class="m-badge">{{ currentStreak() >= 14 ? '✓ DESBLOQUEADO' : '14 DÍAS' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ========================================================
                 TAB 3: EVALUACIÓN INICIAL / ONBOARDING DIAGNOSTIC CON IA
                 ======================================================== -->
            @if (activeTab() === 'diagnostic') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">syseng-diagnostic</span>
                    <span class="term-arg">--eval-engine=byte-ai-v2</span>
                  </div>
                  <span class="term-status-badge text-cyan">AGENTE DE NIVELACIÓN CONECTADO 🤖</span>
                </div>

                @if (!diagnosticFinished()) {
                  <!-- Interactive Diagnostic Wizard -->
                  <div class="diag-wizard-card">
                    <div class="diag-wizard-head">
                      <div class="diag-head-left">
                        <span class="diag-step-badge">PREGUNTA {{ currentDiagQuestionIndex() + 1 }} DE {{ diagQuestions.length }}</span>
                        <h3>{{ currentQuestion().title }}</h3>
                      </div>
                      <span class="diag-topic-tag">{{ currentQuestion().topic }}</span>
                    </div>

                    <div class="diag-terminal-code-block" *ngIf="currentQuestion().codeSnippet">
                      <pre><code>{{ currentQuestion().codeSnippet }}</code></pre>
                    </div>

                    <p class="diag-question-text">{{ currentQuestion().prompt }}</p>

                    <div class="diag-options-grid">
                      @for (opt of currentQuestion().options; track opt.id) {
                        <button
                          type="button"
                          class="diag-option-btn"
                          [class.is-selected]="selectedDiagAnswer() === opt.id"
                          (click)="selectedDiagAnswer.set(opt.id)"
                        >
                          <span class="opt-key">{{ opt.id | uppercase }})</span>
                          <span class="opt-label">{{ opt.label }}</span>
                        </button>
                      }
                    </div>

                    <div class="diag-actions-footer">
                      <button
                        type="button"
                        class="btn btn-primary"
                        [disabled]="!selectedDiagAnswer() || evaluatingQuestion()"
                        (click)="submitDiagAnswer()"
                      >
                        {{ currentDiagQuestionIndex() < diagQuestions.length - 1 ? 'Siguiente Pregunta →' : 'Finalizar y Calibrar con IA ⚡' }}
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Diagnostic Result Card -->
                  <div class="diag-result-card animate-fade-in">
                    <div class="result-top-banner">
                      <div class="result-icon-robot">🤖</div>
                      <div class="result-header-text">
                        <span class="result-sub-eyebrow">DICTAMEN TÉCNICO DE BYTE COPILOT:</span>
                        <h2>{{ diagnosticResult().assignedLevelTitle }}</h2>
                        <span class="result-xp-reward">🎁 ¡+200 XP de Bienvenida Concedidos!</span>
                      </div>
                    </div>

                    <div class="result-breakdown-grid">
                      <div class="result-item">
                        <span class="rk">Nivel Inicial Asignado:</span>
                        <span class="rv text-purple">Nivel {{ diagnosticResult().assignedLevelNumber }}</span>
                      </div>
                      <div class="result-item">
                        <span class="rk">Especialidad Recomendada:</span>
                        <span class="rv text-cyan">{{ diagnosticResult().recommendedSpecialty }}</span>
                      </div>
                      <div class="result-item">
                        <span class="rk">Aciertos en Evaluación:</span>
                        <span class="rv text-success">{{ diagnosticResult().score }} de {{ diagQuestions.length }} correctas</span>
                      </div>
                      <div class="result-item">
                        <span class="rk">Ruta Oficial Asignada:</span>
                        <span class="rv">{{ diagnosticResult().recommendedPathTitle }}</span>
                      </div>
                    </div>

                    <div class="result-ai-feedback">
                      <div class="ai-speech-bubble">
                        <div class="ai-avatar-mini">byte&gt;</div>
                        <p>{{ diagnosticResult().agentFeedback }}</p>
                      </div>
                    </div>

                    <div class="result-action-strip">
                      <div class="course-suggestion-meta">
                        <span class="cs-lbl">Curso inicial prioritario para ti:</span>
                        <strong class="cs-val">{{ diagnosticResult().suggestedCourseTitle }}</strong>
                      </div>
                      <div class="result-buttons">
                        <button type="button" class="btn btn-outline" (click)="restartDiagnostic()">
                          🔄 Recalibrar Test
                        </button>
                        <a [routerLink]="['/cursos', diagnosticResult().suggestedCourseSlug]" class="btn btn-primary">
                          🚀 Empezar Mi Ruta de Estudio →
                        </a>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- ========================================================
                 TAB 4: GRUPOS DE ESTUDIO (STUDY GROUPS & GUILDS)
                 ======================================================== -->
            @if (activeTab() === 'guilds') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">ls -la</span>
                    <span class="term-arg">/var/syseng/study-guilds</span>
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" (click)="showCreateGuildModal.set(true)">
                    + Crear Grupo de Estudio
                  </button>
                </div>

                <div class="guilds-layout">
                  <!-- Guilds Catalog -->
                  <div class="guilds-grid">
                    @for (guild of studyGroups(); track guild.id) {
                      <div class="guild-card" [class.is-my-guild]="guild.isMember">
                        <div class="guild-header">
                          <div class="guild-badge-tag">{{ guild.tag }}</div>
                          <span class="guild-streak">🔥 {{ guild.streakDays }}d racha grupal</span>
                        </div>

                        <h3 class="guild-title">{{ guild.name }}</h3>
                        <p class="guild-desc">{{ guild.description }}</p>

                        <div class="guild-weekly-challenge">
                          <span class="challenge-lbl">RETO SEMANAL DEL CLAN:</span>
                          <p class="challenge-title">⚔️ {{ guild.weeklyChallenge.title }}</p>
                          <span class="challenge-reward">+{{ guild.weeklyChallenge.xpReward }} XP para el clan</span>
                        </div>

                        <div class="guild-footer">
                          <span class="guild-members-count">👥 {{ guild.membersCount }} miembros</span>
                          @if (guild.isMember) {
                            <button type="button" class="btn btn-sm btn-outline-danger" (click)="leaveGuild(guild.id)">
                              ✓ Miembro (Salir)
                            </button>
                          } @else {
                            <button type="button" class="btn btn-sm btn-primary" (click)="joinGuild(guild.id)">
                              + Unirme al Grupo
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Guild Activity Wall / Terminal Feed -->
                  <div class="guild-wall-card">
                    <div class="wall-header">
                      <span class="wall-title">📡 Tablón de Actividad de Clanes</span>
                      <span class="wall-tag">[STREAM EN VIVO]</span>
                    </div>

                    <div class="wall-messages-list">
                      @for (log of guildActivityLogs(); track log.author + log.timeAgo) {
                        <div class="wall-log-item">
                          <div class="log-meta">
                            <span class="log-author">{{ log.author }}</span>
                            <span class="log-time">{{ log.timeAgo }}</span>
                          </div>
                          <p class="log-msg">&gt; {{ log.message }}</p>
                        </div>
                      }
                    </div>

                    <!-- Post study note / command -->
                    <div class="wall-input-row">
                      <input
                        type="text"
                        class="term-input-field"
                        [(ngModel)]="newLogMessage"
                        placeholder="$ guild-post 'Completé el reto de grafos...'"
                        (keyup.enter)="postGuildLog()"
                      />
                      <button type="button" class="btn btn-primary btn-sm" (click)="postGuildLog()" [disabled]="!newLogMessage.trim()">
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ========================================================
                 TAB 5: ACHIEVEMENTS & BADGES
                 ======================================================== -->
            @if (activeTab() === 'achievements') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">ls -la</span>
                    <span class="term-arg">/etc/syseng/achievements</span>
                  </div>
                  <div class="badge-filter-group">
                    <button
                      type="button"
                      class="filter-chip"
                      [class.is-active]="selectedBadgeFilter() === 'all'"
                      (click)="selectedBadgeFilter.set('all')"
                    >
                      Todas ({{ badges().length }})
                    </button>
                    <button
                      type="button"
                      class="filter-chip"
                      [class.is-active]="selectedBadgeFilter() === 'unlocked'"
                      (click)="selectedBadgeFilter.set('unlocked')"
                    >
                      ✓ Conseguidas ({{ unlockedBadgesCount() }})
                    </button>
                    <button
                      type="button"
                      class="filter-chip"
                      [class.is-active]="selectedBadgeFilter() === 'challenges'"
                      (click)="selectedBadgeFilter.set('challenges')"
                    >
                      Retos CLI
                    </button>
                    <button
                      type="button"
                      class="filter-chip"
                      [class.is-active]="selectedBadgeFilter() === 'courses'"
                      (click)="selectedBadgeFilter.set('courses')"
                    >
                      Cursos
                    </button>
                  </div>
                </div>

                <div class="badges-terminal-grid">
                  @for (b of filteredBadges(); track b.id) {
                    <div
                      class="badge-terminal-card"
                      [class.is-unlocked]="b.unlocked"
                      [class.is-locked]="!b.unlocked"
                      [class.card-gold]="b.level === 'gold'"
                      [class.card-silver]="b.level === 'silver'"
                      [class.card-bronze]="b.level === 'bronze'"
                      [class.card-diamond]="b.level === 'diamond'"
                    >
                      <div class="card-top-header">
                        <span class="badge-level-pill">{{ b.level | uppercase }}</span>
                        @if (b.unlocked) {
                          <span class="badge-status-tag tag-unlocked">✓ VERIFICADA</span>
                        } @else {
                          <span class="badge-status-tag tag-locked">🔒 EN PROCESO</span>
                        }
                      </div>

                      <div class="badge-body">
                        <div class="badge-icon-box">
                          <span class="badge-icon-char">{{ b.icon }}</span>
                        </div>
                        <div class="badge-details">
                          <h4 class="badge-title">{{ b.title }}</h4>
                          <p class="badge-desc">{{ b.description }}</p>
                          <div class="badge-fingerprint">
                            <span class="fp-label">HASH:</span>
                            <span class="fp-code">{{ b.shaFingerprint }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="badge-footer">
                        <div class="badge-progress-row">
                          <span class="badge-req">{{ b.requirement }}</span>
                          <span class="badge-count">{{ b.currentCount }}/{{ b.targetCount }}</span>
                        </div>
                        <div class="badge-meter">
                          <div class="badge-meter-fill" [style.width.%]="b.progressPercent"></div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ========================================================
                 TAB 6: LEADERBOARD & RANKINGS
                 ======================================================== -->
            @if (activeTab() === 'leaderboard') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">sort -k6 -nr</span>
                    <span class="term-arg">/var/log/syseng/leaderboard.db</span>
                  </div>
                  <span class="term-status-badge">ACTUALIZACIÓN EN TIEMPO REAL ⚡</span>
                </div>

                <!-- Olympic Podium -->
                <div class="podium-section">
                  <div class="podium-step podium-silver">
                    <div class="podium-avatar">🥈</div>
                    <div class="podium-name">{{ leaderboard()[1].name }}</div>
                    <div class="podium-xp">{{ leaderboard()[1].xp }} XP</div>
                    <div class="podium-sub">{{ leaderboard()[1].specialization }}</div>
                    <div class="podium-block step-2">#2</div>
                  </div>

                  <div class="podium-step podium-gold">
                    <div class="podium-crown">👑</div>
                    <div class="podium-avatar">🥇</div>
                    <div class="podium-name">{{ leaderboard()[0].name }}</div>
                    <div class="podium-xp">{{ leaderboard()[0].xp }} XP</div>
                    <div class="podium-sub">{{ leaderboard()[0].specialization }}</div>
                    <div class="podium-block step-1">#1</div>
                  </div>

                  <div class="podium-step podium-bronze" [class.is-me]="leaderboard()[2].isCurrentUser">
                    <div class="podium-avatar">🥉</div>
                    <div class="podium-name">{{ leaderboard()[2].name }} <span *ngIf="leaderboard()[2].isCurrentUser" class="me-tag">(Tú)</span></div>
                    <div class="podium-xp">{{ leaderboard()[2].xp }} XP</div>
                    <div class="podium-sub">{{ leaderboard()[2].specialization }}</div>
                    <div class="podium-block step-3">#3</div>
                  </div>
                </div>

                <!-- Full Leaderboard Table -->
                <div class="leaderboard-table-shell">
                  <div class="leaderboard-head">
                    <span class="lcol-rank">RANK</span>
                    <span class="lcol-user">ESTUDIANTE</span>
                    <span class="lcol-spec">ESPECIALIDAD TÉCNICA</span>
                    <span class="lcol-level">NIVEL</span>
                    <span class="lcol-score">QUIZ AVG</span>
                    <span class="lcol-xp">XP TOTAL</span>
                  </div>

                  @for (entry of leaderboard(); track entry.rank) {
                    <div class="leaderboard-row" [class.is-user-row]="entry.isCurrentUser">
                      <span class="lcol-rank">
                        <span class="rank-number" [class.top-rank]="entry.rank <= 3">#{{ entry.rank }}</span>
                      </span>
                      <span class="lcol-user">
                        <span class="user-avatar-tag">{{ entry.avatarText }}</span>
                        <div class="user-id-box">
                          <span class="user-full-name">
                            {{ entry.name }}
                            @if (entry.isCurrentUser) {
                              <span class="user-you-pill">TÚ</span>
                            }
                          </span>
                          <span class="user-email-dim">{{ entry.email }}</span>
                        </div>
                      </span>
                      <span class="lcol-spec">
                        <span class="spec-capsule">{{ entry.specialization }}</span>
                      </span>
                      <span class="lcol-level">
                        <span class="level-indicator">Nivel {{ entry.level }}</span>
                        <span class="rank-name-dim">{{ entry.rankTitle }}</span>
                      </span>
                      <span class="lcol-score">
                        <span class="score-badge">{{ entry.avgQuizScore }}%</span>
                      </span>
                      <span class="lcol-xp">
                        <strong class="xp-val">{{ entry.xp }}</strong> <span class="xp-dim">XP</span>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- ========================================================
                 TAB 7: AI SMART LEARNING PATH ADVISOR
                 ======================================================== -->
            @if (activeTab() === 'advisor') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">byte-ai-agent --diagnose</span>
                    <span class="term-arg">--target=career_optimization</span>
                  </div>
                  <span class="term-status-badge text-cyan">MOTOR NEURONAL CONECTADO 🤖</span>
                </div>

                <div class="advisor-layout">
                  <div class="advisor-input-card">
                    <div class="advisor-card-head">
                      <h3>⚙️ Orientación Vocacional Técnica</h3>
                      <p>Configura tu aspiración profesional para que Byte Copilot analice tu perfil y te oriente hacia tu próxima meta.</p>
                    </div>

                    <div class="advisor-form">
                      <div class="form-block">
                        <label class="form-lbl">1. Objetivo profesional principal</label>
                        <select class="term-select" [(ngModel)]="selectedGoal" (change)="runAiDiagnosis()">
                          <option value="backend">Desarrollo Backend & Arquitectura de APIs Distribuidas</option>
                          <option value="algorithms">Estructuras de Datos, Algoritmos & Concursos de Programación</option>
                          <option value="frontend">Desarrollo Frontend Reactivo & Arquitectura UI</option>
                          <option value="fullstack">Ingeniería FullStack & Integración de Sistemas</option>
                        </select>
                      </div>

                      <div class="form-block">
                        <label class="form-lbl">2. Nivel de experiencia autopercibido</label>
                        <div class="option-pills">
                          <button
                            type="button"
                            class="pill-btn"
                            [class.is-active]="selectedExp === 'beginner'"
                            (click)="selectedExp = 'beginner'; runAiDiagnosis()"
                          >
                            🌱 Principiante
                          </button>
                          <button
                            type="button"
                            class="pill-btn"
                            [class.is-active]="selectedExp === 'intermediate'"
                            (click)="selectedExp = 'intermediate'; runAiDiagnosis()"
                          >
                            ⚡ Intermedio
                          </button>
                          <button
                            type="button"
                            class="pill-btn"
                            [class.is-active]="selectedExp === 'advanced'"
                            (click)="selectedExp = 'advanced'; runAiDiagnosis()"
                          >
                            🚀 Avanzado
                          </button>
                        </div>
                      </div>

                      <button type="button" class="btn btn-primary" style="width:100%; margin-top:8px;" (click)="runAiDiagnosis()" [disabled]="diagnosing()">
                        {{ diagnosing() ? 'Analizando tu expediente con IA...' : '⚡ Re-ejecutar Diagnóstico con IA' }}
                      </button>
                    </div>
                  </div>

                  <div class="advisor-output-card">
                    <div class="terminal-subhead">
                      <span class="term-dot"></span>
                      <span class="term-subhead-title">DIAGNÓSTICO PERSONALIZADO DE BYTE COPILOT</span>
                      <span class="match-score">Match Score: {{ currentRecommendation().matchScore }}%</span>
                    </div>

                    <div class="recommendation-content">
                      <div class="rec-path-box">
                        <span class="rec-eyebrow">RUTA TÉCNICA ASIGNADA:</span>
                        <h2 class="rec-title">{{ currentRecommendation().pathTitle }}</h2>
                        <span class="rec-milestone-pill">
                          🎯 Estación Asignada: Hito {{ currentRecommendation().milestoneOrder }} ({{ currentRecommendation().targetLevelName }})
                        </span>
                      </div>

                      <div class="rec-rationale">
                        <p><strong>Análisis del Agente de IA:</strong></p>
                        <p class="rationale-text">{{ currentRecommendation().rationale }}</p>
                      </div>

                      <div class="rec-topics-box">
                        <span class="topics-title">📌 Temas Prioritarios que debes estudiar:</span>
                        <ul class="topics-list">
                          @for (t of currentRecommendation().topicsToStudy; track t) {
                            <li class="topic-item">
                              <span class="topic-check">&gt;</span>
                              <span>{{ t }}</span>
                            </li>
                          }
                        </ul>
                      </div>

                      <div class="rec-action-bar">
                        <div class="rec-course-info">
                          <span class="rec-c-lbl">Curso inmediato sugerido:</span>
                          <span class="rec-c-val">{{ currentRecommendation().suggestedCourseTitle }}</span>
                        </div>
                        <a [routerLink]="['/cursos', currentRecommendation().suggestedCourseSlug]" class="btn btn-primary btn-lg">
                          🚀 Empezar Esta Ruta (Hito {{ currentRecommendation().milestoneOrder }}) →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>

        <!-- ========================================================
             MODAL / SELECTOR DE AVATAR ASCII (MINIMALISTA)
             ======================================================== -->
        @if (showAvatarModal()) {
          <div class="modal-backdrop" (click)="closeAvatarModal()">
            <div class="ascii-modal-window" (click)="$event.stopPropagation()">
              <div class="modal-titlebar">
                <span class="modal-cmd">chsh -s /usr/bin/ascii-avatar</span>
                <button type="button" class="modal-close-btn" (click)="closeAvatarModal()">✕</button>
              </div>

              <div class="modal-content">
                <p class="modal-help-text">
                  Selecciona la firma ASCII que representará tu terminal y expediente de estudiante:
                </p>

                <div class="avatar-gallery-grid">
                  @for (av of asciiAvatars; track av.id) {
                    <div
                      class="avatar-card-option"
                      [class.is-selected]="selectedAvatarId() === av.id"
                      (click)="selectAsciiAvatar(av.id)"
                    >
                      <pre class="ascii-preview-box">{{ av.ascii }}</pre>
                      <div class="avatar-opt-meta">
                        <strong class="av-name">{{ av.name }}</strong>
                        <span class="av-sub">{{ av.subtitle }}</span>
                      </div>
                      <button type="button" class="btn-select-pill">
                        {{ selectedAvatarId() === av.id ? '✓ ACTIVO' : 'Seleccionar' }}
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ========================================================
             MODAL CREAR GRUPO DE ESTUDIO
             ======================================================== -->
        @if (showCreateGuildModal()) {
          <div class="modal-backdrop" (click)="showCreateGuildModal.set(false)">
            <div class="guild-modal-window" (click)="$event.stopPropagation()">
              <div class="modal-titlebar">
                <span class="modal-cmd">$ guild --create --init</span>
                <button type="button" class="modal-close-btn" (click)="showCreateGuildModal.set(false)">✕</button>
              </div>

              <div class="modal-content">
                <div class="form-block">
                  <label class="form-lbl">Nombre del Grupo de Estudio</label>
                  <input type="text" class="term-input-field" [(ngModel)]="newGuildName" placeholder="Ej: Especialistas en Grafos y Árboles" />
                </div>

                <div class="form-block">
                  <label class="form-lbl">Tag / Siglas del Clan (3 a 5 letras)</label>
                  <input type="text" class="term-input-field" [(ngModel)]="newGuildTag" placeholder="Ej: [GRAFO]" />
                </div>

                <div class="form-block">
                  <label class="form-lbl">Objetivo de Estudio / Descripción</label>
                  <textarea class="term-input-field term-textarea" [(ngModel)]="newGuildDesc" placeholder="Describe qué temas estudiarán juntos y cada cuánto tiempo..."></textarea>
                </div>

                <div class="modal-actions-bar">
                  <button type="button" class="btn btn-outline" (click)="showCreateGuildModal.set(false)">Cancelar</button>
                  <button type="button" class="btn btn-primary" (click)="createGuild()" [disabled]="!newGuildName.trim() || !newGuildTag.trim()">
                    ⚡ Crear y Registrar Clan
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--sp-6) 0 var(--sp-12);
      min-height: calc(100vh - 72px);
      background: #08090d;
    }

    /* Notice Bar Onboarding */
    .onboarding-notice-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 12px 18px;
      background: rgba(0, 240, 255, 0.08);
      border: 1px solid rgba(0, 240, 255, 0.3);
      border-radius: var(--radius-md);
      margin-bottom: 16px;
      font-family: var(--font-mono);

      .onboarding-notice-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pulse-icon {
        font-size: 1.25rem;
        animation: pulse 1.5s infinite;
      }

      .notice-text {
        font-size: 13px;
        color: #e2e8f0;
        strong { color: #00f0ff; margin-right: 6px; }
      }

      .btn-primary-glitch {
        background: #00f0ff;
        color: #08090d;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-family: var(--font-mono);
        font-size: 12px;
        white-space: nowrap;

        &:hover { background: #0ae98a; }
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    /* Terminal Window */
    .terminal-window {
      background: #090b10;
      border: 1px solid #1a2233;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
      font-family: var(--font-sans);
    }

    .terminal-titlebar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #0c1017;
      border-bottom: 1px solid #1a2233;
      user-select: none;
    }

    .terminal-dots {
      display: flex;
      gap: 7px;
      align-items: center;

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;

        &-close { background: #ff5f56; }
        &-minimize { background: #ffbd2e; }
        &-maximize { background: #27c93f; }
      }
    }

    .terminal-title {
      font-family: var(--font-mono);
      font-size: 12px;
      color: #7b8ea6;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .terminal-sys-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 11px;

      .streak-pill-header {
        background: rgba(255, 136, 0, 0.12);
        border: 1px solid rgba(255, 136, 0, 0.3);
        color: #ff9d33;
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 700;
      }

      .status-indicator {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #0ae98a;
        box-shadow: 0 0 6px #0ae98a;
      }

      .status-label {
        color: #0ae98a;
        font-weight: 700;
      }
    }

    .terminal-content {
      padding: 20px;
    }

    /* Neofetch Sysinfo Minimalist */
    .neofetch-card {
      display: flex;
      gap: 24px;
      padding: 18px 20px;
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      align-items: center;

      @media (max-width: 800px) {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    .neofetch-logo {
      flex: none;
      position: relative;
      padding: 12px 18px;
      background: #080a0f;
      border: 1px solid #1a2333;
      border-radius: var(--radius-md);
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: #0ae98a;
        box-shadow: 0 0 14px rgba(10, 233, 138, 0.15);

        .ascii-hover-overlay {
          opacity: 1;
        }
      }

      .ascii-art {
        font-family: var(--font-mono);
        font-size: 12px;
        line-height: 1.22;
        color: #0ae98a;
        margin: 0;
        text-shadow: 0 0 8px rgba(10, 233, 138, 0.35);
      }

      .ascii-hover-overlay {
        position: absolute;
        inset: 0;
        background: rgba(8, 10, 15, 0.88);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.15s ease;
        border-radius: var(--radius-md);

        span {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #00f0ff;
          font-weight: 700;
        }
      }
    }

    .neofetch-info {
      flex: 1;
      min-width: 0;

      .neofetch-user-header {
        font-family: var(--font-mono);
        font-size: 15px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;

        .prompt-user { color: #0ae98a; }
        .prompt-at { color: #64748b; }
        .prompt-host { color: #00f0ff; }
      }

      .btn-avatar-chip {
        margin-left: auto;
        background: #121824;
        border: 1px solid #202b3d;
        color: #8b9bb4;
        font-family: var(--font-mono);
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;

        &:hover {
          color: #00f0ff;
          border-color: #00f0ff;
        }
      }

      .neofetch-divider {
        font-family: var(--font-mono);
        color: #1a2233;
        font-size: 11px;
        margin: 4px 0 10px;
      }
    }

    .neofetch-grid {
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 12.5px;
      font-family: var(--font-mono);

      .meta-row {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;

        .meta-k {
          width: 130px;
          color: #6d8098;
          font-weight: 600;
          flex: none;
        }

        .meta-v {
          color: #cbd5e1;
          flex: 1;
        }

        .rank-tag { color: #c084fc; font-weight: 600; }
        .spec-tag { color: #00f0ff; font-weight: 600; }
        .streak-tag {
          color: #ff9d33;
          display: flex;
          align-items: center;
          gap: 6px;

          .streak-boost {
            font-size: 11px;
            color: #0ae98a;
          }
        }

        .xp-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .xp-bar-inline {
            width: 100px;
            height: 6px;
            background: #182233;
            border-radius: 9999px;
            overflow: hidden;

            .xp-fill-inline {
              height: 100%;
              background: linear-gradient(90deg, #0ae98a, #00f0ff);
            }
          }

          .xp-next { font-size: 11px; color: #64748b; }
        }
      }
    }

    /* Terminal Nav */
    .terminal-nav {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      border-bottom: 1px solid #161f2e;
      padding-bottom: 10px;
    }

    .term-tab {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 13px;
      background: #0b0e14;
      border: 1px solid #1a2333;
      border-radius: 5px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #7d8fa6;
      cursor: pointer;
      transition: all 0.15s ease;

      .term-tab__prompt { color: #0ae98a; font-weight: bold; }
      .term-tab__cmd { color: #e2e8f0; font-weight: 600; }
      .term-tab__flag { font-size: 11px; color: #5a6b82; }

      &:hover {
        background: #121722;
        border-color: #27344c;
        color: #fff;
      }

      &.is-active {
        background: #0f1624;
        border-color: #0ae98a;
        box-shadow: 0 0 10px rgba(10, 233, 138, 0.12);

        .term-tab__cmd { color: #0ae98a; }
        .term-tab__flag { color: #8ba0b8; }
      }

      &--streak.is-active {
        border-color: #ff9d33;
        box-shadow: 0 0 10px rgba(255, 157, 51, 0.15);
        .term-tab__cmd { color: #ff9d33; }
      }

      &--diag.is-active {
        border-color: #00f0ff;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
        .term-tab__cmd { color: #00f0ff; }
      }

      &--ai.is-active {
        border-color: #a855f7;
        box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
        .term-tab__cmd { color: #c084fc; }
      }
    }

    /* Sensor Grid */
    .sensor-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;

      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 500px) { grid-template-columns: 1fr; }
    }

    .sensor-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &__head {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .sensor-label { font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 0.05em; }
        .sensor-code { font-family: var(--font-mono); font-size: 10px; color: #475569; }
      }

      .sensor-num {
        font-family: var(--font-mono);
        font-size: 22px;
        font-weight: 800;
        color: #f1f5f9;
      }

      .sensor-footer {
        font-size: 11px;
        color: #7b8ea6;
      }
    }

    /* Section Bar */
    .section-container {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      overflow: hidden;
    }

    .section-terminal-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #0e121a;
      border-bottom: 1px solid #161f2e;
      font-family: var(--font-mono);
      font-size: 12px;

      .terminal-bar-title {
        display: flex;
        gap: 6px;
        .term-prefix { color: #0ae98a; font-weight: bold; }
        .term-arg { color: #cbd5e1; }
      }

      .term-status-badge {
        font-size: 11px;
        color: #64748b;
      }
    }

    /* Process Table */
    .course-process-table {
      width: 100%;
      font-family: var(--font-mono);
      font-size: 12px;

      .process-table-head, .process-row {
        display: grid;
        grid-template-columns: 70px 1.8fr 1.2fr 1.2fr 110px 80px;
        align-items: center;
        padding: 9px 14px;
        border-bottom: 1px solid #141c2a;

        @media (max-width: 800px) {
          grid-template-columns: 60px 1fr 100px 70px;
          .col-cat, .col-prog { display: none; }
        }
      }

      .process-table-head {
        background: #090c12;
        color: #55667d;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.05em;
      }

      .process-row:hover {
        background: #0f1522;
      }

      .col-pid { color: #5a6d85; }
      .col-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #f1f5f9;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .cat-chip {
        font-size: 10.5px;
        padding: 2px 7px;
        background: #121927;
        border: 1px solid #1c2638;
        border-radius: 4px;
        color: #8b9bb4;
      }

      .prog-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;

        .prog-percent { font-size: 11px; width: 34px; color: #cbd5e1; }
        .prog-bar-shell {
          flex: 1;
          height: 5px;
          background: #182233;
          border-radius: 9999px;
          overflow: hidden;

          .prog-bar-fill { height: 100%; background: #0ae98a; }
        }
      }

      .status-pill {
        font-size: 9.5px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 3px;

        &--done { background: rgba(10, 233, 138, 0.12); color: #0ae98a; border: 1px solid rgba(10, 233, 138, 0.25); }
        &--running { background: rgba(0, 240, 255, 0.12); color: #00f0ff; border: 1px solid rgba(0, 240, 255, 0.25); }
      }

      .btn-term-run {
        font-size: 11px;
        padding: 3px 8px;
        background: #141c2a;
        border: 1px solid #233147;
        color: #0ae98a;
        text-decoration: none;
        border-radius: 4px;
        text-align: center;

        &:hover {
          background: #0ae98a;
          color: #08090d;
        }
      }
    }

    /* ========================================================
       TAB STREAKS
       ======================================================== */
    .streak-dashboard-layout {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 16px;
      margin-top: 14px;

      @media (max-width: 860px) { grid-template-columns: 1fr; }
    }

    .streak-hero-card, .streak-week-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 18px;
    }

    .streak-flame-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #161f2e;

      .flame-big { font-size: 3rem; }
      .flame-counter {
        display: flex;
        flex-direction: column;
        .counter-num { font-size: 2.2rem; font-weight: 900; color: #ff9d33; font-family: var(--font-mono); line-height: 1; }
        .counter-lbl { font-size: 11px; color: #64748b; font-weight: 700; letter-spacing: 0.06em; margin-top: 4px; }
      }
    }

    .streak-stats-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 16px 0;
      font-family: var(--font-mono);
      font-size: 12px;

      .streak-stat-item {
        display: flex;
        justify-content: space-between;
        .stat-k { color: #64748b; }
        .stat-v { font-weight: 700; color: #e2e8f0; }
      }
    }

    .checked-in-banner {
      background: rgba(10, 233, 138, 0.08);
      border: 1px solid rgba(10, 233, 138, 0.25);
      border-radius: 4px;
      padding: 10px 12px;
      font-family: var(--font-mono);
      font-size: 12px;
      color: #0ae98a;
      text-align: center;
    }

    .streak-card-title {
      font-size: 14px;
      color: #f1f5f9;
      margin: 0 0 4px;
    }

    .streak-card-desc {
      font-size: 11.5px;
      color: #7b8ea6;
      margin: 0 0 16px;
      line-height: 1.4;
    }

    .week-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin-bottom: 20px;
    }

    .week-day-cell {
      background: #080a0f;
      border: 1px solid #161f2e;
      border-radius: 4px;
      padding: 8px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-family: var(--font-mono);

      .day-name { font-size: 10px; color: #64748b; }
      .day-indicator { font-size: 15px; }
      .day-status-txt { font-size: 8px; color: #475569; }

      &.is-done {
        border-color: rgba(255, 157, 51, 0.4);
        background: rgba(255, 157, 51, 0.05);
        .day-status-txt { color: #ff9d33; font-weight: bold; }
      }

      &.is-today {
        border-color: #00f0ff;
        box-shadow: 0 0 8px rgba(0, 240, 255, 0.15);
        .day-status-txt { color: #00f0ff; font-weight: bold; }
      }
    }

    .streak-milestones-list {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .milestone-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 10px;
        background: #080a0f;
        border: 1px solid #161f2e;
        border-radius: 4px;
        font-size: 12px;

        .m-icon { font-size: 1.2rem; }
        .m-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          strong { color: #e2e8f0; font-size: 12px; }
          span { font-size: 10.5px; color: #64748b; }
        }

        .m-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #64748b;
        }

        &.unlocked {
          border-color: rgba(10, 233, 138, 0.3);
          .m-badge { color: #0ae98a; font-weight: bold; }
        }
      }
    }

    /* ========================================================
       TAB DIAGNOSTIC WIZARD
       ======================================================== */
    .diag-wizard-card, .diag-result-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 22px;
      margin-top: 14px;
    }

    .diag-wizard-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .diag-step-badge {
        font-family: var(--font-mono);
        font-size: 10px;
        color: #00f0ff;
        font-weight: 700;
        letter-spacing: 0.06em;
      }

      h3 {
        font-size: 17px;
        color: #f1f5f9;
        margin: 4px 0 0;
      }

      .diag-topic-tag {
        font-family: var(--font-mono);
        font-size: 11px;
        padding: 2px 8px;
        background: #141c2c;
        border: 1px solid #233147;
        border-radius: 4px;
        color: #8b9bb4;
      }
    }

    .diag-terminal-code-block {
      background: #080a0f;
      border: 1px solid #1a2333;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 14px;

      pre {
        margin: 0;
        font-family: var(--font-mono);
        font-size: 12px;
        color: #0ae98a;
      }
    }

    .diag-question-text {
      font-size: 13.5px;
      color: #cbd5e1;
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .diag-options-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;

      .diag-option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        background: #080a0f;
        border: 1px solid #1a2333;
        border-radius: 5px;
        color: #cbd5e1;
        font-size: 13px;
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;

        .opt-key {
          font-family: var(--font-mono);
          font-weight: 700;
          color: #64748b;
          font-size: 12px;
        }

        &:hover {
          background: #0f1624;
          border-color: #2b3952;
          color: #fff;
        }

        &.is-selected {
          background: #0e1b2d;
          border-color: #00f0ff;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);

          .opt-key { color: #00f0ff; }
          .opt-label { color: #f1f5f9; font-weight: 600; }
        }
      }
    }

    .diag-actions-footer {
      display: flex;
      justify-content: flex-end;
    }

    /* Result Card */
    .diag-result-card {
      border-color: rgba(0, 240, 255, 0.3);

      .result-top-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding-bottom: 18px;
        border-bottom: 1px solid #161f2e;
        margin-bottom: 18px;

        .result-icon-robot { font-size: 2.5rem; }
        .result-header-text {
          .result-sub-eyebrow { font-family: var(--font-mono); font-size: 10px; color: #64748b; letter-spacing: 0.06em; }
          h2 { font-size: 22px; color: #f1f5f9; margin: 2px 0 4px; }
          .result-xp-reward { font-family: var(--font-mono); font-size: 12px; color: #0ae98a; font-weight: bold; }
        }
      }

      .result-breakdown-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 18px;

        @media (max-width: 600px) { grid-template-columns: 1fr; }

        .result-item {
          background: #080a0f;
          border: 1px solid #161f2e;
          border-radius: 4px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-family: var(--font-mono);

          .rk { font-size: 10.5px; color: #64748b; }
          .rv { font-size: 13px; font-weight: 700; color: #e2e8f0; }
        }
      }

      .ai-speech-bubble {
        background: #090e17;
        border: 1px solid #172338;
        border-radius: 5px;
        padding: 14px;
        margin-bottom: 20px;
        font-size: 13px;
        line-height: 1.5;

        .ai-avatar-mini {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #00f0ff;
          font-weight: bold;
          margin-bottom: 4px;
        }

        p { margin: 0; color: #cbd5e1; }
      }

      .result-action-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding-top: 14px;
        border-top: 1px solid #161f2e;

        .course-suggestion-meta {
          display: flex;
          flex-direction: column;
          .cs-lbl { font-size: 11px; color: #64748b; }
          .cs-val { font-size: 13px; font-weight: 700; color: #f1f5f9; }
        }

        .result-buttons {
          display: flex;
          gap: 8px;
        }

        @media (max-width: 700px) {
          flex-direction: column;
          align-items: stretch;
        }
      }
    }

    /* ========================================================
       TAB GUILDS
       ======================================================== */
    .guilds-layout {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 16px;
      margin-top: 14px;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }

    .guilds-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .guild-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 16px;

      &.is-my-guild {
        border-color: rgba(10, 233, 138, 0.4);
        background: #0c121c;
      }

      .guild-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .guild-badge-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 800;
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.1);
          padding: 2px 7px;
          border-radius: 4px;
        }

        .guild-streak {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #ff9d33;
        }
      }

      .guild-title {
        font-size: 15px;
        color: #f1f5f9;
        margin: 0 0 6px;
      }

      .guild-desc {
        font-size: 12px;
        color: #7b8ea6;
        margin: 0 0 12px;
        line-height: 1.4;
      }

      .guild-weekly-challenge {
        background: #080a0f;
        border: 1px solid #141c2b;
        border-radius: 4px;
        padding: 9px 11px;
        margin-bottom: 12px;

        .challenge-lbl { font-size: 9.5px; font-weight: 700; color: #64748b; font-family: var(--font-mono); display: block; margin-bottom: 2px; }
        .challenge-title { font-size: 12px; color: #e2e8f0; margin: 0 0 2px; }
        .challenge-reward { font-size: 10.5px; color: #0ae98a; font-family: var(--font-mono); }
      }

      .guild-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .guild-members-count { font-size: 11px; color: #64748b; font-family: var(--font-mono); }
      }
    }

    .guild-wall-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      height: fit-content;

      .wall-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #161f2e;
        margin-bottom: 12px;
        font-family: var(--font-mono);

        .wall-title { font-size: 12px; font-weight: 700; color: #cbd5e1; }
        .wall-tag { font-size: 10px; color: #0ae98a; }
      }

      .wall-messages-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 14px;
        max-height: 380px;
        overflow-y: auto;

        .wall-log-item {
          background: #080a0f;
          border: 1px solid #131a26;
          border-radius: 4px;
          padding: 8px 10px;
          font-family: var(--font-mono);

          .log-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            margin-bottom: 3px;
            .log-author { color: #00f0ff; font-weight: bold; }
            .log-time { color: #54657a; }
          }

          .log-msg {
            font-size: 11.5px;
            color: #cbd5e1;
            margin: 0;
            line-height: 1.35;
          }
        }
      }

      .wall-input-row {
        display: flex;
        gap: 6px;

        .term-input-field {
          flex: 1;
          background: #080a0f;
          border: 1px solid #1a2333;
          border-radius: 4px;
          padding: 7px 10px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: #f1f5f9;

          &:focus { outline: none; border-color: #0ae98a; }
        }
      }
    }

    /* Badges Tab */
    .badge-filter-group {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;

      .filter-chip {
        padding: 3px 8px;
        font-size: 11px;
        font-family: var(--font-mono);
        background: #090c12;
        border: 1px solid #1a2333;
        color: #7b8ea6;
        border-radius: 4px;
        cursor: pointer;

        &.is-active {
          background: #141c2c;
          border-color: #0ae98a;
          color: #0ae98a;
        }
      }
    }

    .badges-terminal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }

    .badge-terminal-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      &.is-unlocked { border-color: rgba(10, 233, 138, 0.25); }
      &.is-locked { opacity: 0.6; }

      .card-top-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .badge-level-pill {
          font-family: var(--font-mono);
          font-size: 9.5px;
          padding: 1px 5px;
          border-radius: 3px;
          background: #141c2a;
          color: #8b9bb4;
        }

        .badge-status-tag {
          font-family: var(--font-mono);
          font-size: 9.5px;
          font-weight: 700;
          &.tag-unlocked { color: #0ae98a; }
          &.tag-locked { color: #64748b; }
        }
      }

      .badge-body {
        display: flex;
        gap: 10px;

        .badge-icon-box {
          font-size: 1.5rem;
          line-height: 1;
        }

        .badge-details {
          flex: 1;
          .badge-title { font-size: 13px; color: #f1f5f9; margin: 0 0 2px; }
          .badge-desc { font-size: 11px; color: #7b8ea6; margin: 0 0 4px; line-height: 1.35; }
          .badge-fingerprint {
            font-family: var(--font-mono);
            font-size: 9.5px;
            color: #475569;
            .fp-code { color: #5a6d85; }
          }
        }
      }

      .badge-footer {
        .badge-progress-row {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 10px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .badge-meter {
          height: 4px;
          background: #141c2a;
          border-radius: 9999px;
          overflow: hidden;

          .badge-meter-fill { height: 100%; background: #0ae98a; }
        }
      }
    }

    /* Leaderboard Podium */
    .podium-section {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 14px;
      margin: 20px 0 24px;

      .podium-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 160px;
        background: #0b0e14;
        border: 1px solid #161f2e;
        border-radius: 6px;
        padding: 12px 10px 0;
        text-align: center;

        .podium-avatar { font-size: 1.8rem; }
        .podium-name { font-size: 12.5px; font-weight: 700; color: #f1f5f9; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
        .podium-xp { font-family: var(--font-mono); font-size: 11px; color: #0ae98a; font-weight: bold; }
        .podium-sub { font-size: 9.5px; color: #64748b; margin-bottom: 8px; }

        .podium-block {
          width: 100%;
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 16px;
          display: grid;
          place-items: center;
          border-radius: 4px 4px 0 0;
        }

        &.podium-gold .podium-block { height: 75px; background: rgba(255, 189, 46, 0.15); color: #ffbd2e; border-top: 2px solid #ffbd2e; }
        &.podium-silver .podium-block { height: 55px; background: rgba(148, 163, 184, 0.15); color: #94a3b8; border-top: 2px solid #94a3b8; }
        &.podium-bronze .podium-block { height: 42px; background: rgba(205, 127, 50, 0.15); color: #cd7f32; border-top: 2px solid #cd7f32; }

        &.is-me { border-color: #0ae98a; box-shadow: 0 0 12px rgba(10, 233, 138, 0.15); }
      }
    }

    .leaderboard-table-shell {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      overflow: hidden;
      font-family: var(--font-mono);
      font-size: 12px;

      .leaderboard-head, .leaderboard-row {
        display: grid;
        grid-template-columns: 60px 1.8fr 1.3fr 120px 80px 100px;
        align-items: center;
        padding: 9px 14px;
        border-bottom: 1px solid #141c2a;

        @media (max-width: 800px) {
          grid-template-columns: 50px 1fr 90px;
          .lcol-spec, .lcol-level, .lcol-score { display: none; }
        }
      }

      .leaderboard-head { background: #090c12; color: #55667d; font-size: 10px; font-weight: 700; }
      .leaderboard-row.is-user-row { background: rgba(10, 233, 138, 0.05); border-left: 2px solid #0ae98a; }

      .user-avatar-tag {
        display: inline-grid;
        place-items: center;
        width: 24px;
        height: 24px;
        background: #141c2c;
        border-radius: 4px;
        font-size: 10px;
        color: #0ae98a;
        font-weight: bold;
      }

      .lcol-user { display: flex; align-items: center; gap: 8px; }
      .user-full-name { color: #f1f5f9; font-weight: 600; }
      .user-you-pill { font-size: 9px; background: #0ae98a; color: #08090d; padding: 1px 4px; border-radius: 3px; font-weight: 800; margin-left: 4px; }
      .user-email-dim { font-size: 10px; color: #5a6d85; }
      .spec-capsule { font-size: 10.5px; color: #8b9bb4; }
      .level-indicator { color: #c084fc; font-weight: bold; }
      .score-badge { color: #00f0ff; }
      .xp-val { color: #0ae98a; font-weight: bold; }
      .xp-dim { color: #55667d; font-size: 10px; }
    }

    /* Advisor Tab */
    .advisor-layout {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 16px;
      margin-top: 14px;
      @media (max-width: 860px) { grid-template-columns: 1fr; }
    }

    .advisor-input-card, .advisor-output-card {
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 18px;
    }

    .advisor-card-head {
      margin-bottom: 14px;
      h3 { font-size: 15px; color: #f1f5f9; margin: 0 0 4px; }
      p { font-size: 11.5px; color: #7b8ea6; margin: 0; line-height: 1.4; }
    }

    .form-block {
      margin-bottom: 12px;
      .form-lbl { font-size: 11.5px; font-weight: 600; color: #94a3b8; display: block; margin-bottom: 6px; }
    }

    .term-select, .term-input-field {
      width: 100%;
      padding: 8px 10px;
      background: #080a0f;
      border: 1px solid #1a2333;
      border-radius: 4px;
      color: #f1f5f9;
      font-family: var(--font-sans);
      font-size: 12.5px;
      &:focus { outline: none; border-color: #0ae98a; }
    }

    .term-textarea {
      min-height: 70px;
      resize: vertical;
    }

    .option-pills {
      display: flex;
      gap: 6px;
      .pill-btn {
        flex: 1;
        padding: 7px 6px;
        background: #080a0f;
        border: 1px solid #1a2333;
        border-radius: 4px;
        color: #7b8ea6;
        font-size: 11.5px;
        cursor: pointer;

        &.is-active {
          background: #0e1b2d;
          border-color: #00f0ff;
          color: #00f0ff;
          font-weight: 700;
        }
      }
    }

    .terminal-subhead {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 10px;
      border-bottom: 1px solid #161f2e;
      margin-bottom: 14px;
      font-family: var(--font-mono);
      font-size: 11px;

      .term-dot { width: 6px; height: 6px; border-radius: 50%; background: #00f0ff; box-shadow: 0 0 6px #00f0ff; }
      .term-subhead-title { color: #00f0ff; font-weight: 700; flex: 1; }
      .match-score { color: #0ae98a; font-weight: bold; }
    }

    .rec-eyebrow { font-family: var(--font-mono); font-size: 9.5px; color: #64748b; letter-spacing: 0.06em; }
    .rec-title { font-size: 18px; color: #f1f5f9; margin: 2px 0 6px; font-weight: 800; }
    .rec-milestone-pill { font-size: 10.5px; background: rgba(10, 233, 138, 0.1); border: 1px solid rgba(10, 233, 138, 0.25); color: #0ae98a; padding: 2px 8px; border-radius: 9999px; }
    .rec-rationale { background: #080a0f; border: 1px solid #141c2a; border-radius: 4px; padding: 10px 12px; margin: 14px 0; font-size: 12px; line-height: 1.4; color: #cbd5e1; }
    .topics-title { font-size: 11.5px; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px; }
    .topics-list { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 4px; }
    .topic-item { font-family: var(--font-mono); font-size: 11.5px; color: #cbd5e1; display: flex; gap: 6px; .topic-check { color: #0ae98a; } }

    .rec-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #161f2e;
      .rec-c-lbl { font-size: 10px; color: #64748b; display: block; }
      .rec-c-val { font-size: 12.5px; font-weight: 700; color: #f1f5f9; }
    }

    /* Modal Windows */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .ascii-modal-window, .guild-modal-window {
      width: 100%;
      max-width: 680px;
      background: #090c12;
      border: 1px solid #1c2638;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      font-family: var(--font-sans);
    }

    .modal-titlebar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: #0e121a;
      border-bottom: 1px solid #1c2638;
      font-family: var(--font-mono);
      font-size: 12px;

      .modal-cmd { color: #0ae98a; font-weight: bold; }
      .modal-close-btn { background: none; border: none; color: #64748b; font-size: 14px; cursor: pointer; &:hover { color: #fff; } }
    }

    .modal-content {
      padding: 18px;
    }

    .modal-help-text {
      font-size: 12px;
      color: #7b8ea6;
      margin: 0 0 16px;
    }

    .avatar-gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      @media (max-width: 640px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 420px) { grid-template-columns: 1fr; }
    }

    .avatar-card-option {
      background: #080a0f;
      border: 1px solid #161f2e;
      border-radius: 6px;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;

      .ascii-preview-box {
        font-family: var(--font-mono);
        font-size: 10px;
        line-height: 1.15;
        color: #7b8ea6;
        margin: 0 0 10px;
      }

      .avatar-opt-meta {
        margin-bottom: 10px;
        .av-name { font-size: 12px; color: #f1f5f9; display: block; }
        .av-sub { font-size: 10px; color: #64748b; }
      }

      .btn-select-pill {
        font-family: var(--font-mono);
        font-size: 10px;
        padding: 3px 8px;
        background: #121824;
        border: 1px solid #1f2b40;
        border-radius: 4px;
        color: #8b9bb4;
        cursor: pointer;
      }

      &:hover {
        border-color: #273752;
        .ascii-preview-box { color: #0ae98a; }
      }

      &.is-selected {
        border-color: #0ae98a;
        background: rgba(10, 233, 138, 0.05);
        box-shadow: 0 0 12px rgba(10, 233, 138, 0.12);

        .ascii-preview-box { color: #0ae98a; text-shadow: 0 0 8px rgba(10, 233, 138, 0.4); }
        .btn-select-pill { background: #0ae98a; color: #08090d; font-weight: bold; border-color: #0ae98a; }
      }
    }

    .modal-actions-bar {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
    }

    /* Common Utility Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 7px 14px;
      border-radius: 5px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      border: none;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .btn-primary { background: #00d9ff; color: #08090d; &:hover { background: #0ae98a; } }
    .btn-outline { background: transparent; border: 1px solid #1f2a3f; color: #8b9bb4; &:hover { border-color: #00d9ff; color: #fff; } }
    .btn-outline-danger { background: transparent; border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; &:hover { background: rgba(239, 68, 68, 0.1); } }
    .btn-block { width: 100%; }
    .btn-sm { padding: 5px 10px; font-size: 11.5px; }
    .btn-xs { padding: 3px 8px; font-size: 10.5px; }

    .text-orange { color: #ff9d33 !important; }
    .text-cyan { color: #00f0ff !important; }
    .text-purple { color: #c084fc !important; }
    .text-success { color: #0ae98a !important; }
    .text-primary { color: #00d9ff !important; }

    .animate-fade-in { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private coursesSvc = inject(CoursesService);
  private route = inject(ActivatedRoute);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);

  activeTab = signal<'overview' | 'streak' | 'diagnostic' | 'guilds' | 'achievements' | 'leaderboard' | 'advisor'>('overview');
  selectedBadgeFilter = signal<'all' | 'unlocked' | 'challenges' | 'courses'>('all');

  // ASCII Avatars Gallery
  readonly asciiAvatars: AsciiAvatar[] = [
    {
      id: 'syseng_bot',
      name: 'SysEng Bot (Conejito)',
      subtitle: 'Tutor oficial de la academia',
      ascii: `    /_/
  ( o.o )
   > ^ <
   /   \\
  (_| |_)
 SYSENG BOT`,
    },
    {
      id: 'tux_linux',
      name: 'Tux Linux',
      subtitle: 'Mascota del Kernel Linux',
      ascii: `   .--.
  |o_o |
  |:_/ |
 //   \\ \\
(|     | )
/'\\_   _/\\'\\
\\___)=(___/
 TUX LINUX`,
    },
    {
      id: 'cyber_cat',
      name: 'Cyber Daemon Cat',
      subtitle: 'Espía de terminales SSH',
      ascii: `  /\\___/\\
 (  o o  )
 /   V   \\
/ (     ) \\
\\_/  \\_/  \\_/
 CYBER CAT`,
    },
    {
      id: 'monolith_cli',
      name: 'Monolith CLI',
      subtitle: 'Terminal retro UNIX',
      ascii: ` +-------+
 | >_ [] |
 |  ===  |
 +---+---+
     |
    / \\
 MONOLITH`,
    },
    {
      id: 'root_skull',
      name: 'Root Skull',
      subtitle: 'Privilegios de superusuario',
      ascii: `   .---.
  /     \\
 | () () |
  \\  ^  /
   |||||
 ROOT SKULL`,
    },
    {
      id: 'code_wizard',
      name: 'Code Wizard',
      subtitle: 'Arquitecto de compiladores',
      ascii: `    /\\
   /  \\
  /____\\
 (  ^.^ )
  /| | \\
 (_|_|__)
 WIZARD CLI`,
    },
  ];

  selectedAvatarId = signal<string>('syseng_bot');
  showAvatarModal = signal(false);

  // Streak state
  currentStreak = signal(5);
  maxStreak = signal(12);
  todayCheckedIn = signal(false);

  // Diagnostic state
  diagnosticCompleted = signal(false);
  diagnosticFinished = signal(false);
  currentDiagQuestionIndex = signal(0);
  selectedDiagAnswer = signal<string | null>(null);
  evaluatingQuestion = signal(false);

  readonly diagQuestions = [
    {
      id: 'q1',
      title: '1. Estructura de Datos LIFO',
      topic: 'Estructuras de Datos',
      prompt: '¿Qué estructura de datos es la adecuada para implementar el historial de deshacer/rehacer de un editor de código?',
      codeSnippet: `// Ejemplo conceptual:
editor.pushState(code);
const lastState = editor.popState();`,
      options: [
        { id: 'a', label: 'Cola en memoria (Queue / FIFO)' },
        { id: 'b', label: 'Pila en memoria (Stack / LIFO)' },
        { id: 'c', label: 'Árbol Binario de Búsqueda (BST)' },
        { id: 'd', label: 'Lista simplemente enlazada sin puntero' },
      ],
      correctAnswer: 'b',
    },
    {
      id: 'q2',
      title: '2. Complejidad Asintótica Temporal',
      topic: 'Algoritmos & Big O',
      prompt: '¿Cuál es la complejidad temporal promedio de una búsqueda binaria sobre una lista indexada y previamente ordenada de N elementos?',
      codeSnippet: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) { /* división por 2 */ }
}`,
      options: [
        { id: 'a', label: 'O(N)' },
        { id: 'b', label: 'O(log N)' },
        { id: 'c', label: 'O(N log N)' },
        { id: 'd', label: 'O(1)' },
      ],
      correctAnswer: 'b',
    },
    {
      id: 'q3',
      title: '3. Arquitectura y Persistencia',
      topic: 'Bases de Datos & APIs',
      prompt: 'En el desarrollo de APIs REST sobre bases de datos relacionales, ¿cuál es la técnica óptima para evitar el cuello de botella de consultas N+1?',
      codeSnippet: `// Consulta ingenua (N+1):
$cursos = Curso::all();
foreach ($cursos as $c) { $docente = $c->docente; }`,
      options: [
        { id: 'a', label: 'Desactivar los índices de clave foránea' },
        { id: 'b', label: 'Carga ansiosa o Eager Loading (ej. with("docente") / JOIN)' },
        { id: 'c', label: 'Ejecutar consultas recursivas en segundo plano' },
        { id: 'd', label: 'Guardar toda la base de datos en cookies del cliente' },
      ],
      correctAnswer: 'b',
    },
    {
      id: 'q4',
      title: '4. Aspiración y Orientación Técnica',
      topic: 'Ruta de Carrera',
      prompt: '¿Hacia qué área tecnológica deseas enfocar con mayor prioridad tu desarrollo profesional en SysEng Academy?',
      codeSnippet: null,
      options: [
        { id: 'backend', label: 'Sistemas Backend, APIs Distribuidas y Bases de Datos' },
        { id: 'algo', label: 'Algoritmia Avanzada, Estructuras de Datos y Optimización' },
        { id: 'frontend', label: 'Arquitectura Frontend Reactiva, Interfaces y Accesibilidad' },
        { id: 'fullstack', label: 'Ingeniería FullStack (Integración Extremo a Extremo)' },
      ],
      correctAnswer: 'backend',
    },
  ];

  diagnosticAnswers: Record<string, string> = {};

  diagnosticResult = signal({
    assignedLevelNumber: 6,
    assignedLevelTitle: 'Nivel 6: Desarrollador Backend Semi-Senior',
    recommendedSpecialty: 'Sistemas Backend & APIs Distribuidas',
    recommendedPathTitle: 'Ruta de Desarrollo Backend & Arquitectura de APIs',
    suggestedCourseSlug: 'backend-introduccion',
    suggestedCourseTitle: 'Introducción al Backend & Arquitectura de Servidores',
    score: 3,
    agentFeedback: 'Byte Copilot ha procesado tu evaluación. Demuestras una comprensión sólida en la elección de estructuras en memoria (LIFO) y optimización de complejidad O(log N). Te orientamos a la Ruta Backend para perfeccionar persistencia, aislamiento ACID y microservicios.',
  });

  // Study Groups state
  studyGroups = signal<StudyGroup[]>([
    {
      id: 'krnl',
      name: 'Kernel & C++ Systems Hackers',
      tag: '[KRNL]',
      category: 'systems',
      description: 'Estudio intensivo de llamadas POSIX, memoria virtual y concurrencia.',
      membersCount: 18,
      streakDays: 19,
      weeklyChallenge: {
        title: 'Implementar un Thread Pool en C++ con mutex POSIX',
        xpReward: 350,
        completed: false,
      },
      recentLogs: [
        { author: 'Mateo (Lvl 16)', message: 'Subí un benchmark de semáforos en Linux a la repo.', timeAgo: 'hace 2h' },
        { author: 'Ana (Lvl 11)', message: 'Validé el manejo de señales SIGINT en el sandbox CLI.', timeAgo: 'hace 5h' },
      ],
      isMember: true,
    },
    {
      id: 'algo',
      name: 'Clan de Algoritmos & Grafos',
      tag: '[ALGO]',
      category: 'algorithms',
      description: 'Resolución de problemas de alta complejidad y árboles balanceados.',
      membersCount: 26,
      streakDays: 14,
      weeklyChallenge: {
        title: 'Calcular Camino Más Corto con Dijkstra sobre Grafos Dirigidos',
        xpReward: 280,
        completed: true,
      },
      recentLogs: [
        { author: 'Carlos (Lvl 12)', message: 'Resolví el problema de balanceo AVL en 4ms.', timeAgo: 'hace 1h' },
      ],
      isMember: false,
    },
    {
      id: 'bknd',
      name: 'Distributed APIs & Databases',
      tag: '[BKND]',
      category: 'backend',
      description: 'Arquitectura de endpoints, PostgreSQL avanzado e índices B-Tree.',
      membersCount: 31,
      streakDays: 24,
      weeklyChallenge: {
        title: 'Diseñar transacción SERIALIZABLE sin bloqueo de deadlocks',
        xpReward: 300,
        completed: false,
      },
      recentLogs: [
        { author: 'Diego (Lvl 6)', message: 'Aprobé el quiz de relaciones 1:N con 100%.', timeAgo: 'hace 3h' },
      ],
      isMember: false,
    },
    {
      id: 'frnt',
      name: 'Reactive UI & Web Performance',
      tag: '[FRNT]',
      category: 'frontend',
      description: 'Signals en Angular, renderizado a 60fps y accesibilidad WCAG.',
      membersCount: 14,
      streakDays: 8,
      weeklyChallenge: {
        title: 'Construir tabla virtualizada con 10,000 elementos sin lag de frames',
        xpReward: 250,
        completed: false,
      },
      recentLogs: [
        { author: 'Sofía (Lvl 9)', message: 'Implementé un debounce reactivo con signals puras.', timeAgo: 'hace 4h' },
      ],
      isMember: false,
    },
  ]);

  showCreateGuildModal = signal(false);
  newGuildName = '';
  newGuildTag = '';
  newGuildDesc = '';
  newLogMessage = '';

  // Advisor form state
  selectedGoal = 'backend';
  selectedExp = 'intermediate';
  selectedTime = 'medium';
  diagnosing = signal(false);

  // Recommendations
  readonly currentRecommendation = signal<PathRecommendation>({
    pathTitle: 'Ruta de Desarrollo Backend & Arquitectura de APIs',
    pathSlug: 'desarrollo-backend',
    targetLevelName: 'Modelos, Relaciones y Consultas SQL',
    milestoneOrder: 2,
    rationale: 'Tu expediente muestra un dominio destacado en algoritmos básicos y una tasa de acierto del 91.7% en quizzes. Según tu aspiración hacia sistemas de alta concurrencia, tu siguiente salto profesional es dominar la persistencia de datos relacionales, transacciones ACID y protección de APIs REST.',
    topicsToStudy: [
      'Modelos Eloquent, Relaciones 1:N y M:N con optimización eager loading',
      'Autenticación JWT stateless con protección de endpoints y middleware',
      'Índices compuestos en PostgreSQL y Pool de conexiones para alta demanda',
    ],
    suggestedCourseSlug: 'backend-introduccion',
    suggestedCourseTitle: 'Introducción al Backend & Arquitectura de Servidores',
    matchScore: 98,
  });

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });

    this.initLocalData();

    // Check query params for onboarding
    const qp = this.route.snapshot.queryParams;
    if (qp['onboarding'] === 'true' && !this.diagnosticCompleted()) {
      this.activeTab.set('diagnostic');
    }
  }

  private initLocalData() {
    if (typeof window === 'undefined') return;

    // Load saved avatar
    const savedAv = localStorage.getItem('syseng_selected_ascii_avatar');
    if (savedAv && this.asciiAvatars.some(a => a.id === savedAv)) {
      this.selectedAvatarId.set(savedAv);
    }

    // Load streak data
    try {
      const st = JSON.parse(localStorage.getItem('syseng_streak_data') || '{}');
      if (st.currentStreak !== undefined) this.currentStreak.set(st.currentStreak);
      if (st.maxStreak !== undefined) this.maxStreak.set(st.maxStreak);
      const today = new Date().toISOString().slice(0, 10);
      if (st.lastCheckIn === today) {
        this.todayCheckedIn.set(true);
      }
    } catch {}

    // Load diagnostic status
    const diagCompleted = localStorage.getItem('syseng_diagnostic_completed') === 'true';
    this.diagnosticCompleted.set(diagCompleted);
    if (diagCompleted) {
      try {
        const savedRes = JSON.parse(localStorage.getItem('syseng_diagnostic_result') || '{}');
        if (savedRes.assignedLevelTitle) {
          this.diagnosticResult.set(savedRes);
          this.diagnosticFinished.set(true);
        }
      } catch {}
    }

    // Load study groups
    try {
      const storedGuilds = JSON.parse(localStorage.getItem('syseng_study_groups') || '[]');
      if (Array.isArray(storedGuilds) && storedGuilds.length > 0) {
        this.studyGroups.set(storedGuilds);
      }
    } catch {}
  }

  readonly currentAsciiAvatar = computed(() => {
    const id = this.selectedAvatarId();
    return this.asciiAvatars.find(a => a.id === id) || this.asciiAvatars[0];
  });

  openAvatarModal() { this.showAvatarModal.set(true); }
  closeAvatarModal() { this.showAvatarModal.set(false); }

  selectAsciiAvatar(id: string) {
    this.selectedAvatarId.set(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('syseng_selected_ascii_avatar', id);
    }
    this.closeAvatarModal();
  }

  // Streaks helpers
  readonly streakMultiplier = computed(() => {
    const s = this.currentStreak();
    if (s >= 14) return 1.40;
    if (s >= 7)  return 1.25;
    if (s >= 3)  return 1.10;
    return 1.05;
  });

  readonly weekDays = computed<StreakDay[]>(() => {
    const names = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0
    return names.map((name, i) => ({
      dayName: name,
      shortDate: `${i + 22}/09`,
      completed: i < currentDayIdx || (i === currentDayIdx && this.todayCheckedIn()),
      isToday: i === currentDayIdx,
    }));
  });

  doDailyCheckIn() {
    if (this.todayCheckedIn()) return;
    this.todayCheckedIn.set(true);
    const newStreak = this.currentStreak() + 1;
    this.currentStreak.set(newStreak);
    this.maxStreak.set(Math.max(this.maxStreak(), newStreak));

    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('syseng_streak_data', JSON.stringify({
        currentStreak: newStreak,
        maxStreak: this.maxStreak(),
        lastCheckIn: today,
      }));
    }
  }

  // Diagnostic questions
  readonly currentQuestion = computed(() => {
    return this.diagQuestions[this.currentDiagQuestionIndex()];
  });

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
    if (this.diagnosticAnswers['q2'] === 'b') score++;
    if (this.diagnosticAnswers['q3'] === 'b') score++;

    const pref = this.diagnosticAnswers['q4'] || 'backend';

    let assignedLevel = 5;
    let assignedTitle = 'Nivel 5: Desarrollador Junior';
    if (score === 3) {
      assignedLevel = 7;
      assignedTitle = 'Nivel 7: Ingeniero de Sistemas Semi-Senior';
    } else if (score === 2) {
      assignedLevel = 4;
      assignedTitle = 'Nivel 4: Desarrollador FullStack Junior';
    } else {
      assignedLevel = 2;
      assignedTitle = 'Nivel 2: Iniciado en Algoritmos';
    }

    let spec = 'Sistemas Backend & APIs Distribuidas';
    let pathTitle = 'Ruta de Desarrollo Backend & Arquitectura de APIs';
    let courseSlug = 'backend-introduccion';
    let courseTitle = 'Introducción al Backend & Arquitectura de Servidores';

    if (pref === 'algo') {
      spec = 'Estructuras de Datos & Algorítmica';
      pathTitle = 'Ruta de Fundamentos de Algorítmica & Computación';
      courseSlug = 'algoritmos-ordenamiento';
      courseTitle = 'Algoritmos de Ordenamiento & Complejidad';
    } else if (pref === 'frontend') {
      spec = 'Arquitectura Frontend & UI Reactiva';
      pathTitle = 'Ruta de Desarrollo Frontend Moderno & UI';
      courseSlug = 'introduccion-desarrollo-web';
      courseTitle = 'Introducción al Desarrollo Web';
    }

    const result = {
      assignedLevelNumber: assignedLevel,
      assignedLevelTitle: assignedTitle,
      recommendedSpecialty: spec,
      recommendedPathTitle: pathTitle,
      suggestedCourseSlug: courseSlug,
      suggestedCourseTitle: courseTitle,
      score: score,
      agentFeedback: `Byte Copilot ha evaluado tu razonamiento técnico (${score}/3 aciertos fundamentales). Asignamos tu perfil al ${assignedTitle} dentro de la especialidad "${spec}". Tus habilidades lógicas están listas para comenzar.`,
    };

    this.diagnosticResult.set(result);
    this.diagnosticFinished.set(true);
    this.diagnosticCompleted.set(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('syseng_diagnostic_completed', 'true');
      localStorage.setItem('syseng_diagnostic_result', JSON.stringify(result));
    }
  }

  restartDiagnostic() {
    this.diagnosticFinished.set(false);
    this.currentDiagQuestionIndex.set(0);
    this.selectedDiagAnswer.set(null);
    this.diagnosticAnswers = {};
  }

  // Guilds methods
  readonly myGroupName = computed(() => {
    const mine = this.studyGroups().find(g => g.isMember);
    return mine ? `${mine.tag} ${mine.name}` : 'Sin clan asignado (Explora $ guilds)';
  });

  readonly guildActivityLogs = computed(() => {
    const list: { author: string; message: string; timeAgo: string }[] = [];
    for (const g of this.studyGroups()) {
      for (const l of g.recentLogs) {
        list.push(l);
      }
    }
    return list.slice(0, 8);
  });

  joinGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g => ({
        ...g,
        isMember: g.id === id,
        membersCount: g.id === id ? g.membersCount + 1 : (g.isMember ? g.membersCount - 1 : g.membersCount)
      }))
    );
    this.persistGuilds();
  }

  leaveGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g => g.id === id ? { ...g, isMember: false, membersCount: Math.max(1, g.membersCount - 1) } : g)
    );
    this.persistGuilds();
  }

  createGuild() {
    if (!this.newGuildName.trim() || !this.newGuildTag.trim()) return;
    const newG: StudyGroup = {
      id: 'guild_' + Date.now(),
      name: this.newGuildName.trim(),
      tag: this.newGuildTag.startsWith('[') ? this.newGuildTag.trim().toUpperCase() : `[${this.newGuildTag.trim().toUpperCase()}]`,
      category: 'systems',
      description: this.newGuildDesc.trim() || 'Grupo de estudio creado por estudiantes.',
      membersCount: 1,
      streakDays: 1,
      weeklyChallenge: {
        title: 'Resolver conjuntamente 5 retos algorítmicos en la terminal',
        xpReward: 200,
        completed: false,
      },
      recentLogs: [
        { author: `${this.auth.user()?.name ?? 'Estudiante'} (Fundador)`, message: 'Clan de estudio fundado exitosamente.', timeAgo: 'hace 1m' }
      ],
      isMember: true,
    };

    this.studyGroups.update(prev => [newG, ...prev]);
    this.persistGuilds();
    this.showCreateGuildModal.set(false);
    this.newGuildName = '';
    this.newGuildTag = '';
    this.newGuildDesc = '';
  }

  postGuildLog() {
    if (!this.newLogMessage.trim()) return;
    const authorName = this.auth.user()?.name || 'Estudiante';
    const msg = this.newLogMessage.trim();

    this.studyGroups.update(groups => {
      const active = groups.find(g => g.isMember) || groups[0];
      if (active) {
        active.recentLogs.unshift({
          author: authorName,
          message: msg,
          timeAgo: 'hace unos instantes'
        });
      }
      return [...groups];
    });

    this.newLogMessage = '';
    this.persistGuilds();
  }

  private persistGuilds() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('syseng_study_groups', JSON.stringify(this.studyGroups()));
    }
  }

  // Badges & Metrics
  completedCount(): number {
    return this.enrollments().filter(e => e.completed_at !== null || e.progress_percent === 100).length;
  }

  readonly solvedChallengesCount = computed(() => {
    let count = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('syseng_solved_challenges') || '[]');
        if (Array.isArray(stored)) count += stored.length;
      } catch {}
    }
    return Math.max(count, 8);
  });

  readonly totalXp = computed(() => {
    const fromChallenges = this.solvedChallengesCount() * 50;
    const fromCourses = this.completedCount() * 150;
    const fromEnrollments = this.enrollments().length * 30;
    const fromQuizzes = 6 * 40;
    const diagBonus = this.diagnosticCompleted() ? 200 : 0;
    const streakBonus = this.currentStreak() * 25;
    return fromChallenges + fromCourses + fromEnrollments + fromQuizzes + diagBonus + streakBonus;
  });

  readonly userLevel = computed(() => {
    return Math.max(1, Math.floor(this.totalXp() / 100) + 1);
  });

  readonly xpProgressPercent = computed(() => this.totalXp() % 100);
  readonly xpToNextLevel = computed(() => 100 - (this.totalXp() % 100));

  readonly rankTitle = computed(() => {
    const lvl = this.userLevel();
    if (lvl >= 11) return 'Arquitecto Principal de Sistemas';
    if (lvl >= 8)  return 'Ingeniero de Software Senior';
    if (lvl >= 6)  return 'Líder Técnico en Desarrollo';
    if (lvl >= 4)  return 'Desarrollador FullStack Semi-Senior';
    if (lvl >= 2)  return 'Desarrollador Junior Avanzado';
    return 'Cadete de Sistemas (Iniciación)';
  });

  readonly specialization = computed(() => {
    const enrs = this.enrollments();
    let backendCount = 0;
    let webCount = 0;
    let algoCount = 0;

    for (const e of enrs) {
      const slug = e.course?.category?.slug || '';
      if (slug.includes('backend') || slug.includes('datos')) backendCount++;
      else if (slug.includes('web') || slug.includes('frontend')) webCount++;
      else if (slug.includes('programacion') || slug.includes('algoritmos')) algoCount++;
    }

    if (backendCount >= webCount && backendCount >= algoCount) {
      return { title: 'Sistemas Backend & APIs Distribuidas', icon: '⚙️' };
    } else if (webCount > backendCount && webCount >= algoCount) {
      return { title: 'Arquitectura Frontend & UI Reactiva', icon: '🌐' };
    } else {
      return { title: 'Estructuras de Datos & Algoritmos', icon: '⚡' };
    }
  });

  myRank(): number { return 3; }

  readonly badges = computed<AchievementBadge[]>(() => {
    const solved = this.solvedChallengesCount();
    const completedCourses = this.completedCount();
    const enrolled = this.enrollments().length;

    return [
      {
        id: 'challenge_1',
        title: 'Primer Algoritmo CLI',
        category: 'challenges',
        icon: '🥉',
        description: 'Compilaste y validaste tu primer reto de código en la terminal.',
        requirement: 'Resuelve 1 reto interactivo',
        targetCount: 1,
        currentCount: Math.min(solved, 1),
        progressPercent: 100,
        unlocked: solved >= 1,
        level: 'bronze',
        shaFingerprint: 'sha256:7f8a91b2c4e5f6a1',
      },
      {
        id: 'challenge_3',
        title: 'Pensamiento Computacional',
        category: 'challenges',
        icon: '🥈',
        description: 'Superaste 3 retos interactivos verificados por casos de prueba de borde.',
        requirement: 'Resuelve 3 retos de código',
        targetCount: 3,
        currentCount: Math.min(solved, 3),
        progressPercent: 100,
        unlocked: solved >= 3,
        level: 'silver',
        shaFingerprint: 'sha256:4d8e9a11b7f03ca2',
      },
      {
        id: 'challenge_5',
        title: 'Maestro de Estructuras (Stack & Queues)',
        category: 'challenges',
        icon: '🥇',
        description: 'Dominaste los retos de balanceo de paréntesis y pilas/colas en memoria.',
        requirement: 'Resuelve 5 retos de código',
        targetCount: 5,
        currentCount: Math.min(solved, 5),
        progressPercent: 100,
        unlocked: solved >= 5,
        level: 'gold',
        shaFingerprint: 'sha256:1a84f3e9c0b2d187',
      },
      {
        id: 'challenge_10',
        title: 'Hacker de Sistemas',
        category: 'challenges',
        icon: '🏆',
        description: 'Completaste 10 retos técnicos avanzados sin errores de compilación.',
        requirement: 'Resuelve 10 retos de código',
        targetCount: 10,
        currentCount: Math.min(solved, 10),
        progressPercent: Math.min(100, Math.round((solved / 10) * 100)),
        unlocked: solved >= 10,
        level: 'gold',
        shaFingerprint: 'sha256:9c8e14d3f2a5b678',
      },
      {
        id: 'course_start',
        title: 'Iniciación SysEng',
        category: 'courses',
        icon: '🚀',
        description: 'Te matriculaste en tu primer curso oficial y abriste tu expediente.',
        requirement: 'Inscríbete en 1 curso',
        targetCount: 1,
        currentCount: Math.min(enrolled, 1),
        progressPercent: 100,
        unlocked: enrolled >= 1,
        level: 'bronze',
        shaFingerprint: 'sha256:a1b2c3d4e5f67890',
      },
      {
        id: 'course_grad_1',
        title: 'Graduado de Curso',
        category: 'courses',
        icon: '🎓',
        description: 'Completaste el 100% de los módulos y lecciones de un curso técnico.',
        requirement: 'Completa 1 curso técnico',
        targetCount: 1,
        currentCount: Math.min(completedCourses, 1),
        progressPercent: 100,
        unlocked: completedCourses >= 1,
        level: 'silver',
        shaFingerprint: 'sha256:e5f6a1b2c3d49876',
      },
      {
        id: 'courses_3',
        title: 'Arquitecto de Software',
        category: 'courses',
        icon: '🛡️',
        description: 'Completaste 3 cursos completos de ingeniería, arquitectura y buenas prácticas.',
        requirement: 'Completa 3 cursos técnicos',
        targetCount: 3,
        currentCount: Math.min(completedCourses, 3),
        progressPercent: 100,
        unlocked: completedCourses >= 3,
        level: 'gold',
        shaFingerprint: 'sha256:c3d4e5f6a1b21234',
      },
      {
        id: 'streak_fire',
        title: 'Disciplina & Constancia',
        category: 'special',
        icon: '🔥',
        description: 'Mantuviste una racha de actividad y estudio ininterrumpida de al menos 5 días.',
        requirement: 'Racha >= 5 días',
        targetCount: 5,
        currentCount: Math.min(this.currentStreak(), 5),
        progressPercent: Math.min(100, (this.currentStreak() / 5) * 100),
        unlocked: this.currentStreak() >= 5,
        level: 'silver',
        shaFingerprint: 'sha256:f5e4d3c2b1a09876',
      },
      {
        id: 'diagnostic_done',
        title: 'Nivelación Inicial Calibrada',
        category: 'special',
        icon: '🤖',
        description: 'Completaste el diagnóstico de habilidades con el Agente de IA.',
        requirement: 'Realiza el test inicial',
        targetCount: 1,
        currentCount: this.diagnosticCompleted() ? 1 : 0,
        progressPercent: this.diagnosticCompleted() ? 100 : 0,
        unlocked: this.diagnosticCompleted(),
        level: 'bronze',
        shaFingerprint: 'sha256:9a8b7c6d5e4f3a21',
      },
      {
        id: 'guild_member',
        title: 'Hermandad de Terminal',
        category: 'special',
        icon: '⚔️',
        description: 'Te uniste a un clan de estudio colaborativo para resolver retos compartidos.',
        requirement: 'Únete a un grupo',
        targetCount: 1,
        currentCount: this.studyGroups().some(g => g.isMember) ? 1 : 0,
        progressPercent: this.studyGroups().some(g => g.isMember) ? 100 : 0,
        unlocked: this.studyGroups().some(g => g.isMember),
        level: 'silver',
        shaFingerprint: 'sha256:3d4e5f6a7b8c9d0e',
      },
      {
        id: 'terminal_master',
        title: 'Terminal Linux Sandbox',
        category: 'special',
        icon: '🐧',
        description: 'Ejecutaste código y scripts directamente en el entorno aislado de Linux.',
        requirement: 'Usa la terminal de Linux',
        targetCount: 1,
        currentCount: 1,
        progressPercent: 100,
        unlocked: true,
        level: 'bronze',
        shaFingerprint: 'sha256:2c3d4e5f6a1b8765',
      },
    ];
  });

  readonly unlockedBadgesCount = computed(() => this.badges().filter(b => b.unlocked).length);

  readonly filteredBadges = computed(() => {
    const filter = this.selectedBadgeFilter();
    const all = this.badges();
    if (filter === 'unlocked') return all.filter(b => b.unlocked);
    if (filter === 'challenges') return all.filter(b => b.category === 'challenges');
    if (filter === 'courses') return all.filter(b => b.category === 'courses');
    return all;
  });

  // Leaderboard
  readonly leaderboard = computed<LeaderboardEntry[]>(() => [
    {
      rank: 1,
      name: 'Mateo Silva',
      email: 'mateo.silva@alumnos.syseng.edu',
      avatarText: 'MS',
      level: 16,
      rankTitle: 'Arquitecto Principal',
      specialization: 'Especialista en Algoritmos',
      completedLessons: 14,
      avgQuizScore: 96.0,
      xp: 1520,
      isCurrentUser: false,
      badgePill: '🥇 ORO',
    },
    {
      rank: 2,
      name: 'Carlos Prueba',
      email: 'carlos_test_1790540376@gmail.com',
      avatarText: 'CP',
      level: 12,
      rankTitle: 'Líder Técnico',
      specialization: 'Arquitecto FullStack',
      completedLessons: 11,
      avgQuizScore: 88.0,
      xp: 1180,
      isCurrentUser: false,
      badgePill: '🥈 PLATA',
    },
    {
      rank: 3,
      name: this.auth.user()?.name || 'Ana Estudiante (Demo)',
      email: this.auth.user()?.email || 'estudiante@sysengacademy.dev',
      avatarText: 'AE',
      level: this.userLevel(),
      rankTitle: this.rankTitle(),
      specialization: this.specialization().title,
      completedLessons: 9,
      avgQuizScore: 91.7,
      xp: this.totalXp(),
      isCurrentUser: true,
      badgePill: '🥉 BRONCE',
    },
    {
      rank: 4,
      name: 'Sofía Herrera',
      email: 'sofia.herrera@tech.dev',
      avatarText: 'SH',
      level: 9,
      rankTitle: 'Ingeniero Senior',
      specialization: 'Arquitectura Frontend & UI',
      completedLessons: 7,
      avgQuizScore: 84.0,
      xp: 840,
      isCurrentUser: false,
      badgePill: 'TOP 5',
    },
    {
      rank: 5,
      name: 'Lucas Ramírez',
      email: 'lucas.ramirez@code.org',
      avatarText: 'LR',
      level: 7,
      rankTitle: 'Desarrollador Semi-Senior',
      specialization: 'DevOps & Cloud Linux',
      completedLessons: 6,
      avgQuizScore: 82.5,
      xp: 690,
      isCurrentUser: false,
      badgePill: 'TOP 5',
    },
  ]);

  runAiDiagnosis() {
    this.diagnosing.set(true);
    setTimeout(() => {
      this.diagnosing.set(false);
    }, 400);
  }

  emoji(enr: Enrollment): string {
    const map: Record<string, string> = {
      'programacion-basica': '💡',
      algoritmos: '⚡',
      poo: '🧩',
      'bases-de-datos': '🗄️',
      redes: '🌐',
      'sistemas-operativos': '🖥️',
      'estructuras-de-datos': '🌳',
      'desarrollo-web': '🕸️',
      'desarrollo-backend': '⚙️',
    };
    return map[enr.course?.category?.slug ?? ''] ?? '📚';
  }
}
