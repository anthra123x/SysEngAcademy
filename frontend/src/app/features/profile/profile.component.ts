import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
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
             BANNER ONBOARDING / NIVELACIÓN PENDIENTE (SÓLO ESTUDIANTES)
             ======================================================== -->
        @if (!isTeacher() && !diagnosticCompleted()) {
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
              <span class="terminal-icon">{{ isTeacher() ? '🎓' : '🐧' }}</span>
              <span>syseng-profile — {{ auth.user()?.email || 'user' }}&#64;{{ isTeacher() ? 'syseng-faculty' : 'syseng-box' }}: ~/{{ isTeacher() ? 'faculty-portal' : 'profile' }} (bash)</span>
            </div>
            <div class="terminal-sys-status">
              @if (!isTeacher()) {
                <span class="streak-pill-header" title="Racha activa de estudio consecutivo">
                  🔥 {{ currentStreak() }}d streak
                </span>
              } @else {
                <span class="teacher-pill-header">
                  ROOT AUTHORITY
                </span>
              }
              <span class="status-indicator"></span>
              <span class="status-label">ONLINE</span>
            </div>
          </div>

          <!-- Terminal Inner Content -->
          <div class="terminal-content">

            <!-- ========================================================
                 NEOFETCH SYSINFO HERO BANNER (CON ASCII ART ANIMADO)
                 ======================================================== -->
            <div class="neofetch-card">
              <!-- ASCII Avatar Box with Animated Frames & Blink -->
              <div class="neofetch-logo" (click)="openAvatarModal()" title="Haz clic para personalizar tu avatar ASCII animado">
                <pre class="ascii-art">{{ currentAsciiFrame() }}</pre>
                <div class="ascii-hover-overlay">
                  <span>[ ⚙ Cambiar ASCII ]</span>
                </div>
                <div class="ascii-motion-indicator">
                  <span class="motion-dot"></span>
                  <span class="motion-lbl">LIVE</span>
                </div>
              </div>

              <!-- Sysinfo Metadata (Diferenciada según Rol: Docente vs Estudiante) -->
              <div class="neofetch-info">
                <div class="neofetch-user-header">
                  <span class="prompt-user">{{ auth.user()?.name }}</span>
                  <span class="prompt-at">&#64;</span>
                  <span class="prompt-host">{{ isTeacher() ? 'faculty-council' : 'syseng-academy' }}</span>
                  <button type="button" class="btn-avatar-chip" (click)="openAvatarModal()">
                    <span>avatar: {{ currentAsciiAvatar().name }}</span>
                    <span class="btn-avatar-icon">✎</span>
                  </button>
                </div>
                <div class="neofetch-divider">────────────────────────────────────────────────</div>

                <div class="neofetch-grid">
                  @if (isTeacher()) {
                    <!-- MÉTRICAS PARA EL DOCENTE -->
                    <div class="meta-row">
                      <span class="meta-k">OS:</span>
                      <span class="meta-v">SysEng Linux OS (Faculty Authority Pod v6.8.0-DOCENTE)</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Cargo Docente:</span>
                      <span class="meta-v role-tag-teacher">Cátedra Principal &amp; Arquitecto de Contenido</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Alumnos a Cargo:</span>
                      <span class="meta-v text-cyan"><strong>1,248 estudiantes</strong> en supervisión activa</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Cursos en Catálogo:</span>
                      <span class="meta-v text-purple"><strong>43 cursos técnicos</strong> estructurados</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Actividades &amp; Quizzes:</span>
                      <span class="meta-v text-success"><strong>{{ totalFacultyActivities() }} retos y quizzes</strong> publicados</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Aprobación Global:</span>
                      <span class="meta-v text-orange"><strong>94.5% de aprobación</strong> en cohortes</span>
                    </div>
                  } @else {
                    <!-- MÉTRICAS PARA EL ESTUDIANTE -->
                    <div class="meta-row">
                      <span class="meta-k">OS:</span>
                      <span class="meta-v">SysEng Linux OS (x86_64 Cloud Sandbox)</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Rango &amp; Nivel:</span>
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
                  }
                </div>
              </div>
            </div>

            <!-- ========================================================
                 TERMINAL NAVIGATION TABS (BASH COMMANDS)
                 ======================================================== -->
            <nav class="terminal-nav" aria-label="Navegación del perfil en terminal">
              @if (isTeacher()) {
                <!-- PESTAÑAS PARA EL DOCENTE -->
                <button
                  type="button"
                  class="term-tab"
                  [class.is-active]="activeTeacherTab() === 'overview'"
                  (click)="activeTeacherTab.set('overview')"
                >
                  <span class="term-tab__prompt">$</span>
                  <span class="term-tab__cmd">whoami</span>
                  <span class="term-tab__flag">--faculty</span>
                </button>

                <button
                  type="button"
                  class="term-tab"
                  [class.is-active]="activeTeacherTab() === 'students'"
                  (click)="activeTeacherTab.set('students')"
                >
                  <span class="term-tab__prompt">$</span>
                  <span class="term-tab__cmd">students</span>
                  <span class="term-tab__flag">--supervision</span>
                </button>

                <button
                  type="button"
                  class="term-tab"
                  [class.is-active]="activeTeacherTab() === 'activities'"
                  (click)="activeTeacherTab.set('activities')"
                >
                  <span class="term-tab__prompt">$</span>
                  <span class="term-tab__cmd">curriculum</span>
                  <span class="term-tab__flag">--activities</span>
                </button>

                <button
                  type="button"
                  class="term-tab term-tab--ai"
                  [class.is-active]="activeTeacherTab() === 'advisor'"
                  (click)="activeTeacherTab.set('advisor')"
                >
                  <span class="term-tab__prompt">$</span>
                  <span class="term-tab__cmd">advisor</span>
                  <span class="term-tab__flag">--faculty-ai 🤖</span>
                </button>
              } @else {
                <!-- PESTAÑAS PARA EL ESTUDIANTE -->
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
              }
            </nav>

            <!-- ========================================================
                 VISTA DOCENTE: TAB 1 WHOAMI FACULTY
                 ======================================================== -->
            @if (isTeacher() && activeTeacherTab() === 'overview') {
              <div class="tab-pane animate-fade-in">
                <div class="sensor-grid">
                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">ALUMNOS MATRICULADOS</span>
                      <span class="sensor-code">[FAC_STU]</span>
                    </div>
                    <div class="sensor-num text-cyan">1,248</div>
                    <div class="sensor-footer"><span class="sensor-sub">Supervisión en tiempo real</span></div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">CURSOS ACTIVOS</span>
                      <span class="sensor-code">[FAC_CRS]</span>
                    </div>
                    <div class="sensor-num text-purple">43</div>
                    <div class="sensor-footer"><span class="sensor-sub">Catálogo académico oficial</span></div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">PROMEDIO EVALUATIVO</span>
                      <span class="sensor-code">[FAC_AVG]</span>
                    </div>
                    <div class="sensor-num text-success">94.5%</div>
                    <div class="sensor-footer"><span class="sensor-sub">Rendimiento en quizzes</span></div>
                  </div>

                  <div class="sensor-card sensor-card--glow">
                    <div class="sensor-card__head">
                      <span class="sensor-label">ACTIVIDADES &amp; QUIZZES</span>
                      <span class="sensor-code">[FAC_ACT]</span>
                    </div>
                    <div class="sensor-num text-orange">{{ totalFacultyActivities() }}</div>
                    <div class="sensor-footer"><span class="sensor-sub text-primary">Creados por la cátedra</span></div>
                  </div>
                </div>

                <div class="section-container">
                  <div class="section-terminal-bar">
                    <div class="terminal-bar-title">
                      <span class="term-prefix">ps aux | grep</span>
                      <span class="term-arg">faculty_supervision</span>
                    </div>
                    <a routerLink="/docente" class="btn btn-xs btn-primary">Ir al Panel Docente Principal →</a>
                  </div>

                  <div class="teacher-overview-block">
                    <div class="teacher-banner-box">
                      <h3>👨‍🏫 Supervisión de Cátedra &amp; Calidad Académica</h3>
                      <p>Desde este portal tienes autoridad completa para diseñar actividades interactivas en terminal, crear quizzes de opción múltiple, supervisar el avance de cada estudiante y auditar el catálogo.</p>
                      <div class="faculty-action-pills">
                        <a routerLink="/docente" [queryParams]="{ tab: 'activities' }" class="btn btn-sm btn-primary">
                          📝 Crear Nueva Actividad o Quiz
                        </a>
                        <a routerLink="/docente" [queryParams]="{ tab: 'students' }" class="btn btn-sm btn-outline">
                          👥 Ver Directorio de Alumnos
                        </a>
                        <a routerLink="/docente" [queryParams]="{ tab: 'ai' }" class="btn btn-sm btn-outline">
                          🤖 Consultar Asistente Docente IA
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- VISTA DOCENTE: TAB 2 STUDENTS -->
            @if (isTeacher() && activeTeacherTab() === 'students') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">ls -la</span>
                    <span class="term-arg">/var/syseng/students/active-dossiers</span>
                  </div>
                  <a routerLink="/docente" [queryParams]="{ tab: 'students' }" class="btn btn-xs btn-outline">Abrir Gestión Completa en Panel Docente →</a>
                </div>

                <div class="leaderboard-table-shell">
                  <div class="leaderboard-head">
                    <span class="lcol-rank">ID</span>
                    <span class="lcol-user">ESTUDIANTE</span>
                    <span class="lcol-spec">ESTADO</span>
                    <span class="lcol-level">CURSOS</span>
                    <span class="lcol-score">QUIZ AVG</span>
                    <span class="lcol-xp">ACCIONES</span>
                  </div>

                  @for (st of topSupervisedStudents; track st.id) {
                    <div class="leaderboard-row">
                      <span class="lcol-rank"><span class="rank-number">#{{ st.id }}</span></span>
                      <span class="lcol-user">
                        <span class="user-avatar-tag">{{ st.name.slice(0, 2).toUpperCase() }}</span>
                        <div class="user-id-box">
                          <span class="user-full-name">{{ st.name }}</span>
                          <span class="user-email-dim">{{ st.email }}</span>
                        </div>
                      </span>
                      <span class="lcol-spec">
                        <span class="cat-chip" style="color: #0ae98a;">✓ Verificado</span>
                      </span>
                      <span class="lcol-level">
                        <span class="level-indicator">{{ st.coursesCount }} cursos</span>
                      </span>
                      <span class="lcol-score">
                        <span class="score-badge">{{ st.avgScore }}%</span>
                      </span>
                      <span class="lcol-xp">
                        <a routerLink="/docente" [queryParams]="{ tab: 'students' }" class="btn-term-run" style="text-decoration:none;">
                          expediente &gt;
                        </a>
                      </span>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- VISTA DOCENTE: TAB 3 ACTIVITIES -->
            @if (isTeacher() && activeTeacherTab() === 'activities') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">cat</span>
                    <span class="term-arg">/etc/syseng/curriculum/faculty-activities.json</span>
                  </div>
                  <a routerLink="/docente" [queryParams]="{ tab: 'activities' }" class="btn btn-xs btn-primary">+ Crear Actividad en Panel Docente</a>
                </div>

                <div class="badges-terminal-grid">
                  @for (act of facultyActivitiesList(); track act.id) {
                    <div class="badge-terminal-card is-unlocked card-gold">
                      <div class="card-top-header">
                        <span class="badge-level-pill">{{ act.type | uppercase }}</span>
                        <span class="badge-status-tag tag-unlocked">✓ ACTIVA</span>
                      </div>
                      <div class="badge-body">
                        <div class="badge-icon-box">
                          <span class="badge-icon-char">📝</span>
                        </div>
                        <div class="badge-details">
                          <h4 class="badge-title">{{ act.title }}</h4>
                          <p class="badge-desc">{{ act.description }}</p>
                          <div class="badge-fingerprint">
                            <span class="fp-label">CURSO:</span>
                            <span class="fp-code">{{ act.courseTitle }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="badge-footer">
                        <div class="badge-progress-row">
                          <span class="badge-req">Recompensa: +{{ act.xpReward }} XP</span>
                          <span class="badge-count">⏱ {{ act.durationMinutes }} min</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- VISTA DOCENTE: TAB 4 ADVISOR FACULTY AI -->
            @if (isTeacher() && activeTeacherTab() === 'advisor') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">byte-copilot</span>
                    <span class="term-arg">--faculty-assistant --model=gpt-4o-mini</span>
                  </div>
                  <span class="term-status-badge text-cyan">ASISTENTE PEDAGÓGICO CONECTADO 🤖</span>
                </div>

                <div class="advisor-output-card" style="margin-top: 14px;">
                  <div class="terminal-subhead">
                    <span class="term-dot"></span>
                    <span class="term-subhead-title">INFORME PEDAGÓGICO Y ANÁLISIS DE COHORTE</span>
                    <span class="match-score">Salud Curricular: 98%</span>
                  </div>
                  <div class="recommendation-content">
                    <div class="rec-path-box">
                      <span class="rec-eyebrow">DIAGNÓSTICO AUTOMATIZADO DE COHORTE:</span>
                      <h2 class="rec-title">Rendimiento Sobresaliente en Algorítmica y Backend</h2>
                      <span class="rec-milestone-pill">
                        🎯 Recomendación: Diseñar un nuevo taller de Concurrencia y Mutex en C++
                      </span>
                    </div>

                    <div class="rec-rationale">
                      <p><strong>Observación de Byte Copilot:</strong></p>
                      <p class="rationale-text">
                        Los 1,248 estudiantes registran una tasa de aprobación del 94.5% en evaluaciones conceptuales de estructuras LIFO y búsqueda binaria. Sin embargo, en el módulo de Concurrencia y Bloqueos de Bases de Datos el 14% de los alumnos solicita ayuda en el chat. Se recomienda publicar un reto práctico con casos de prueba sobre transacciones ACID.
                      </p>
                    </div>

                    <div class="rec-action-bar">
                      <a routerLink="/docente" [queryParams]="{ tab: 'ai' }" class="btn btn-primary btn-lg">
                        🚀 Abrir Generador de Quizzes &amp; Retos con IA →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- ========================================================
                 VISTA ESTUDIANTE: PESTAÑAS EXISTENTES (WHOAMI, STREAK, ETC)
                 ======================================================== -->
            @if (!isTeacher() && activeTab() === 'overview') {
              <div class="tab-pane animate-fade-in">
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

            @if (!isTeacher() && activeTab() === 'streak') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">systemctl status</span>
                    <span class="term-arg">student-streak.service</span>
                  </div>
                  <span class="term-status-badge text-orange">🔥 RACHA CONSECUTIVA ACTIVA</span>
                </div>

                <div class="streak-dashboard-layout">
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

                  <div class="streak-week-card">
                    <h3 class="streak-card-title">Matriz de Actividad Semanal</h3>
                    <p class="streak-card-desc">Cada día de estudio, resolución de retos CLI o lecciones superadas mantiene tu flujo de aprendizaje continuo.</p>

                    <div class="week-days-grid">
                      @for (day of weekDays(); track day.dayName) {
                        <div class="week-day-cell" [class.is-done]="day.completed" [class.is-today]="day.isToday">
                          <span class="day-name">{{ day.dayName }}</span>
                          <div class="day-indicator">
                            @if (day.completed) { <span>🔥</span> } @else if (day.isToday) { <span>⚡</span> } @else { <span>·</span> }
                          </div>
                          <span class="day-status-txt">
                            @if (day.completed) { OK } @else if (day.isToday) { HOY } @else { PEND }
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'diagnostic') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">syseng-diagnostic</span>
                    <span class="term-arg">--eval-engine=byte-ai-v2</span>
                  </div>
                  <span class="term-status-badge text-cyan">AGENTE DE NIVELACIÓN CONECTADO 🤖</span>
                </div>

                @if (!diagnosticFinished()) {
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
                        <span class="cs-lbl">Curso inicial prioritario:</span>
                        <strong class="cs-val">{{ diagnosticResult().suggestedCourseTitle }}</strong>
                      </div>
                      <div class="result-buttons">
                        <button type="button" class="btn btn-outline" (click)="restartDiagnostic()">🔄 Recalibrar</button>
                        <a [routerLink]="['/cursos', diagnosticResult().suggestedCourseSlug]" class="btn btn-primary">
                          🚀 Empezar Mi Ruta →
                        </a>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }

            @if (!isTeacher() && activeTab() === 'guilds') {
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
                  <div class="guilds-grid">
                    @for (guild of studyGroups(); track guild.id) {
                      <div class="guild-card" [class.is-my-guild]="guild.isMember">
                        <div class="guild-header">
                          <div class="guild-badge-tag">{{ guild.tag }}</div>
                          <span class="guild-streak">🔥 {{ guild.streakDays }}d racha grupal</span>
                        </div>
                        <h3 class="guild-title">{{ guild.name }}</h3>
                        <p class="guild-desc">{{ guild.description }}</p>
                        <div class="guild-footer">
                          <span class="guild-members-count">👥 {{ guild.membersCount }} miembros</span>
                          @if (guild.isMember) {
                            <button type="button" class="btn btn-sm btn-outline-danger" (click)="leaveGuild(guild.id)">✓ Miembro (Salir)</button>
                          } @else {
                            <button type="button" class="btn btn-sm btn-primary" (click)="joinGuild(guild.id)">+ Unirme</button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'achievements') {
              <div class="tab-pane animate-fade-in">
                <div class="badges-terminal-grid">
                  @for (b of filteredBadges(); track b.id) {
                    <div class="badge-terminal-card" [class.is-unlocked]="b.unlocked" [class.is-locked]="!b.unlocked">
                      <div class="card-top-header">
                        <span class="badge-level-pill">{{ b.level | uppercase }}</span>
                        <span class="badge-status-tag" [class.tag-unlocked]="b.unlocked">{{ b.unlocked ? '✓ VERIFICADA' : '🔒 EN PROCESO' }}</span>
                      </div>
                      <div class="badge-body">
                        <div class="badge-icon-box"><span class="badge-icon-char">{{ b.icon }}</span></div>
                        <div class="badge-details">
                          <h4 class="badge-title">{{ b.title }}</h4>
                          <p class="badge-desc">{{ b.description }}</p>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'leaderboard') {
              <div class="tab-pane animate-fade-in">
                <div class="podium-section">
                  <div class="podium-step podium-silver">
                    <div class="podium-avatar">🥈</div>
                    <div class="podium-name">{{ leaderboard()[1].name }}</div>
                    <div class="podium-xp">{{ leaderboard()[1].xp }} XP</div>
                    <div class="podium-block step-2">#2</div>
                  </div>
                  <div class="podium-step podium-gold">
                    <div class="podium-crown">👑</div>
                    <div class="podium-avatar">🥇</div>
                    <div class="podium-name">{{ leaderboard()[0].name }}</div>
                    <div class="podium-xp">{{ leaderboard()[0].xp }} XP</div>
                    <div class="podium-block step-1">#1</div>
                  </div>
                  <div class="podium-step podium-bronze is-me">
                    <div class="podium-avatar">🥉</div>
                    <div class="podium-name">{{ leaderboard()[2].name }} (Tú)</div>
                    <div class="podium-xp">{{ leaderboard()[2].xp }} XP</div>
                    <div class="podium-block step-3">#3</div>
                  </div>
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'advisor') {
              <div class="tab-pane animate-fade-in">
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
                        🎯 Estación: Hito {{ currentRecommendation().milestoneOrder }} ({{ currentRecommendation().targetLevelName }})
                      </span>
                    </div>
                    <div class="rec-rationale">
                      <p class="rationale-text">{{ currentRecommendation().rationale }}</p>
                    </div>
                    <div class="rec-action-bar">
                      <a [routerLink]="['/cursos', currentRecommendation().suggestedCourseSlug]" class="btn btn-primary btn-lg">
                        🚀 Empezar Esta Ruta →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }

          </div>
        </div>

        <!-- ========================================================
             MODAL / SELECTOR DE AVATAR ASCII ANIMADO
             ======================================================== -->
        @if (showAvatarModal()) {
          <div class="modal-backdrop" (click)="closeAvatarModal()">
            <div class="ascii-modal-window" (click)="$event.stopPropagation()">
              <div class="modal-titlebar">
                <span class="modal-cmd">chsh -s /usr/bin/ascii-avatar (LIVE ANIMATED)</span>
                <button type="button" class="modal-close-btn" (click)="closeAvatarModal()">✕</button>
              </div>

              <div class="modal-content">
                <p class="modal-help-text">
                  Selecciona la firma ASCII animada que representará tu sesión en SysEng Academy (parpadea y reacciona en vivo):
                </p>

                <div class="avatar-gallery-grid">
                  @for (av of asciiAvatars; track av.id) {
                    <div
                      class="avatar-card-option"
                      [class.is-selected]="selectedAvatarId() === av.id"
                      (click)="selectAsciiAvatar(av.id)"
                    >
                      <pre class="ascii-preview-box">{{ av.frames[currentFrame() % av.frames.length] }}</pre>
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

      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--sp-6) 0 var(--sp-12);
      min-height: calc(100vh - 72px);
      background: #08090d;
    }

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

      .onboarding-notice-left { display: flex; align-items: center; gap: 12px; }
      .pulse-icon { font-size: 1.25rem; animation: pulse 1.5s infinite; }
      .notice-text { font-size: 13px; color: #e2e8f0; strong { color: #00f0ff; margin-right: 6px; } }

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
    }

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
      .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block;
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

      .teacher-pill-header {
        background: rgba(0, 217, 255, 0.14);
        border: 1px solid rgba(0, 217, 255, 0.4);
        color: #00d9ff;
        padding: 2px 7px;
        border-radius: 4px;
        font-weight: 800;
        font-size: 10px;
        letter-spacing: 0.05em;
      }

      .status-indicator { width: 6px; height: 6px; border-radius: 50%; background: #0ae98a; box-shadow: 0 0 6px #0ae98a; }
      .status-label { color: #0ae98a; font-weight: 700; }
    }

    .terminal-content { padding: 20px; }

    /* Animated Neofetch Logo */
    .neofetch-card {
      display: flex;
      gap: 24px;
      padding: 18px 20px;
      background: #0b0e14;
      border: 1px solid #161f2e;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      align-items: center;

      @media (max-width: 800px) { flex-direction: column; align-items: flex-start; }
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
      min-width: 140px;
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #0ae98a;
        box-shadow: 0 0 14px rgba(10, 233, 138, 0.2);
        .ascii-hover-overlay { opacity: 1; }
      }

      .ascii-art {
        font-family: var(--font-mono);
        font-size: 12px;
        line-height: 1.22;
        color: #0ae98a;
        margin: 0;
        animation: asciiFloat 3.2s ease-in-out infinite;
      }

      .ascii-motion-indicator {
        position: absolute;
        top: 6px;
        right: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-family: var(--font-mono);
        font-size: 9px;
        color: #0ae98a;

        .motion-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #0ae98a;
          box-shadow: 0 0 6px #0ae98a;
          animation: pulse 1s infinite;
        }
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
        span { font-family: var(--font-mono); font-size: 10px; color: #00f0ff; font-weight: 700; }
      }
    }

    @keyframes asciiFloat {
      0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 6px rgba(10, 233, 138, 0.3)); }
      50% { transform: translateY(-3px); filter: drop-shadow(0 0 14px rgba(10, 233, 138, 0.6)); }
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
        &:hover { color: #00f0ff; border-color: #00f0ff; }
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

        .meta-k { width: 140px; color: #6d8098; font-weight: 600; flex: none; }
        .meta-v { color: #cbd5e1; flex: 1; }

        .role-tag-teacher { color: #00d9ff; font-weight: 700; text-shadow: 0 0 8px rgba(0, 217, 255, 0.35); }
        .rank-tag { color: #c084fc; font-weight: 600; }
        .spec-tag { color: #00f0ff; font-weight: 600; }
        .streak-tag { color: #ff9d33; display: flex; align-items: center; gap: 6px;
          .streak-boost { font-size: 11px; color: #0ae98a; }
        }
        .xp-inline {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          .xp-bar-inline { width: 100px; height: 6px; background: #182233; border-radius: 9999px; overflow: hidden;
            .xp-fill-inline { height: 100%; background: linear-gradient(90deg, #0ae98a, #00f0ff); }
          }
          .xp-next { font-size: 11px; color: #64748b; }
        }
      }
    }

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

      &:hover { background: #121722; border-color: #27344c; color: #fff; }

      &.is-active {
        background: #0f1624;
        border-color: #0ae98a;
        box-shadow: 0 0 10px rgba(10, 233, 138, 0.12);
        .term-tab__cmd { color: #0ae98a; }
        .term-tab__flag { color: #8ba0b8; }
      }

      &--streak.is-active { border-color: #ff9d33; .term-tab__cmd { color: #ff9d33; } }
      &--diag.is-active { border-color: #00f0ff; .term-tab__cmd { color: #00f0ff; } }
      &--ai.is-active { border-color: #a855f7; .term-tab__cmd { color: #c084fc; } }
    }

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
        display: flex; justify-content: space-between; align-items: center;
        .sensor-label { font-size: 10px; font-weight: 700; color: #64748b; }
        .sensor-code { font-family: var(--font-mono); font-size: 10px; color: #475569; }
      }

      .sensor-num { font-family: var(--font-mono); font-size: 22px; font-weight: 800; color: #f1f5f9; }
      .sensor-footer { font-size: 11px; color: #7b8ea6; }
    }

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

      .terminal-bar-title { display: flex; gap: 6px;
        .term-prefix { color: #0ae98a; font-weight: bold; }
        .term-arg { color: #cbd5e1; }
      }
      .term-status-badge { font-size: 11px; color: #64748b; }
    }

    .teacher-overview-block {
      padding: 24px;
      .teacher-banner-box {
        background: #080a0f;
        border: 1px solid #161f2e;
        border-radius: 6px;
        padding: 20px;
        h3 { font-size: 17px; color: #f1f5f9; margin: 0 0 8px; }
        p { font-size: 13px; color: #8b9bb4; line-height: 1.5; margin: 0 0 16px; }
      }
      .faculty-action-pills { display: flex; gap: 10px; flex-wrap: wrap; }
    }

    /* Common Process & Leaderboard Tables */
    .course-process-table, .leaderboard-table-shell {
      width: 100%;
      font-family: var(--font-mono);
      font-size: 12px;
      background: #0b0e14;

      .process-table-head, .process-row, .leaderboard-head, .leaderboard-row {
        display: grid;
        grid-template-columns: 70px 1.8fr 1.2fr 1.2fr 110px 100px;
        align-items: center;
        padding: 9px 14px;
        border-bottom: 1px solid #141c2a;
      }

      .process-table-head, .leaderboard-head {
        background: #090c12; color: #55667d; font-size: 10px; font-weight: 700;
      }
      .process-row:hover, .leaderboard-row:hover { background: #0f1522; }
      .col-pid, .lcol-rank { color: #5a6d85; }
      .col-title, .lcol-user { display: flex; align-items: center; gap: 8px; color: #f1f5f9; }
      .user-avatar-tag { width: 24px; height: 24px; background: #141c2c; border-radius: 4px; display: grid; place-items: center; color: #0ae98a; font-weight: bold; }
      .cat-chip { font-size: 10.5px; padding: 2px 7px; background: #121927; border: 1px solid #1c2638; border-radius: 4px; color: #8b9bb4; }
      .status-pill { font-size: 9.5px; font-weight: 700; padding: 2px 6px; border-radius: 3px;
        &--done { background: rgba(10, 233, 138, 0.12); color: #0ae98a; }
        &--running { background: rgba(0, 240, 255, 0.12); color: #00f0ff; }
      }
      .btn-term-run { font-size: 11px; padding: 3px 8px; background: #141c2a; border: 1px solid #233147; color: #0ae98a; border-radius: 4px; }
    }

    /* Badges & Guilds Grid */
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
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      &.is-unlocked { border-color: rgba(10, 233, 138, 0.25); }
      &.is-locked { opacity: 0.6; }
      .card-top-header { display: flex; justify-content: space-between; align-items: center;
        .badge-level-pill { font-family: var(--font-mono); font-size: 9.5px; padding: 1px 5px; background: #141c2a; color: #8b9bb4; border-radius: 3px; }
        .badge-status-tag { font-family: var(--font-mono); font-size: 9.5px; font-weight: 700; &.tag-unlocked { color: #0ae98a; } }
      }
      .badge-body { display: flex; gap: 10px;
        .badge-icon-box { font-size: 1.5rem; }
        .badge-details { flex: 1;
          .badge-title { font-size: 13px; color: #f1f5f9; margin: 0 0 2px; }
          .badge-desc { font-size: 11px; color: #7b8ea6; margin: 0 0 4px; }
        }
      }
    }

    /* Modal */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.78); backdrop-filter: blur(6px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 16px;
    }
    .ascii-modal-window {
      width: 100%; max-width: 680px; background: #090c12; border: 1px solid #1c2638; border-radius: 8px; overflow: hidden;
    }
    .modal-titlebar {
      display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #0e121a; border-bottom: 1px solid #1c2638; font-family: var(--font-mono); font-size: 12px;
      .modal-cmd { color: #0ae98a; font-weight: bold; }
      .modal-close-btn { background: none; border: none; color: #64748b; font-size: 14px; cursor: pointer; }
    }
    .modal-content { padding: 18px; }
    .modal-help-text { font-size: 12px; color: #7b8ea6; margin: 0 0 16px; }
    .avatar-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
    }
    .avatar-card-option {
      background: #080a0f; border: 1px solid #161f2e; border-radius: 6px; padding: 12px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer;
      .ascii-preview-box { font-family: var(--font-mono); font-size: 10px; color: #7b8ea6; margin: 0 0 8px; animation: asciiFloat 3s ease-in-out infinite; }
      .av-name { font-size: 12px; color: #f1f5f9; display: block; }
      .av-sub { font-size: 10px; color: #64748b; }
      .btn-select-pill { font-family: var(--font-mono); font-size: 10px; padding: 3px 8px; background: #121824; border: 1px solid #1f2b40; color: #8b9bb4; border-radius: 4px; margin-top: 8px; }
      &.is-selected { border-color: #0ae98a; background: rgba(10, 233, 138, 0.05);
        .ascii-preview-box { color: #0ae98a; }
        .btn-select-pill { background: #0ae98a; color: #08090d; font-weight: bold; }
      }
    }

    /* Common Buttons & Utilities */
    .btn { display: inline-flex; align-items: center; justify-content: center; padding: 7px 14px; border-radius: 5px; font-weight: 700; font-size: 12px; cursor: pointer; border: none; text-decoration: none; }
    .btn-primary { background: #00d9ff; color: #08090d; &:hover { background: #0ae98a; } }
    .btn-outline { background: transparent; border: 1px solid #1f2a3f; color: #8b9bb4; &:hover { border-color: #00d9ff; color: #fff; } }
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
export class ProfileComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private coursesSvc = inject(CoursesService);
  private route = inject(ActivatedRoute);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);

  // Tab state: student vs teacher
  activeTab = signal<'overview' | 'streak' | 'diagnostic' | 'guilds' | 'achievements' | 'leaderboard' | 'advisor'>('overview');
  activeTeacherTab = signal<'overview' | 'students' | 'activities' | 'advisor'>('overview');
  selectedBadgeFilter = signal<'all' | 'unlocked' | 'challenges' | 'courses'>('all');

  // Animated ASCII Art frame index
  currentFrame = signal(0);
  private frameTimer: any = null;

  // ASCII Avatars with Multiple Interactive Blinking / Moving Frames
  readonly asciiAvatars: AsciiAvatar[] = [
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
      codeSnippet: `editor.pushState(code);
const lastState = editor.popState();`,
      options: [
        { id: 'a', label: 'Cola en memoria (Queue / FIFO)' },
        { id: 'b', label: 'Pila en memoria (Stack / LIFO)' },
        { id: 'c', label: 'Árbol Binario de Búsqueda (BST)' },
        { id: 'd', label: 'Lista simplemente enlazada sin puntero' },
      ],
    },
    {
      id: 'q2',
      title: '2. Complejidad Asintótica Temporal',
      topic: 'Algoritmos & Big O',
      prompt: '¿Cuál es la complejidad temporal promedio de una búsqueda binaria sobre una lista indexada de N elementos?',
      codeSnippet: `function binarySearch(arr, target) { /* división por 2 */ }`,
      options: [
        { id: 'a', label: 'O(N)' },
        { id: 'b', label: 'O(log N)' },
        { id: 'c', label: 'O(N log N)' },
        { id: 'd', label: 'O(1)' },
      ],
    },
    {
      id: 'q3',
      title: '3. Arquitectura y Persistencia',
      topic: 'Bases de Datos & APIs',
      prompt: 'En el desarrollo de APIs REST sobre bases de datos relacionales, ¿cuál es la técnica óptima para evitar el problema N+1?',
      codeSnippet: `$cursos = Curso::with("docente")->get();`,
      options: [
        { id: 'a', label: 'Desactivar los índices de clave foránea' },
        { id: 'b', label: 'Carga ansiosa o Eager Loading (ej. with / JOIN)' },
        { id: 'c', label: 'Ejecutar consultas recursivas en segundo plano' },
        { id: 'd', label: 'Guardar toda la base de datos en cookies del cliente' },
      ],
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
    agentFeedback: 'Byte Copilot ha procesado tu evaluación. Demuestras una comprensión sólida en la elección de estructuras en memoria (LIFO) y optimización de complejidad O(log N). Te orientamos a la Ruta Backend.',
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
      weeklyChallenge: { title: 'Implementar un Thread Pool en C++ con mutex POSIX', xpReward: 350, completed: false },
      recentLogs: [{ author: 'Mateo (Lvl 16)', message: 'Subí benchmark de semáforos a la repo.', timeAgo: 'hace 2h' }],
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
      weeklyChallenge: { title: 'Calcular Camino Más Corto con Dijkstra sobre Grafos', xpReward: 280, completed: true },
      recentLogs: [{ author: 'Carlos (Lvl 12)', message: 'Resolví el balanceo AVL en 4ms.', timeAgo: 'hace 1h' }],
      isMember: false,
    },
  ]);

  showCreateGuildModal = signal(false);

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
      user?.email === 'andrescamilomartinez330@gmail.com' ||
      user?.role === 'admin' ||
      user?.role === 'instructor'
    );
  });

  readonly totalFacultyActivities = signal(18);

  readonly topSupervisedStudents = [
    { id: 3, name: 'Ana Estudiante (Demo)', email: 'estudiante@sysengacademy.dev', coursesCount: 4, avgScore: 94.0 },
    { id: 4, name: 'Carlos Prueba', email: 'carlos_test_1790540376@gmail.com', coursesCount: 2, avgScore: 88.0 },
    { id: 5, name: 'Mateo Silva', email: 'mateo.silva@alumnos.syseng.edu', coursesCount: 3, avgScore: 96.0 },
    { id: 6, name: 'Sofía Herrera', email: 'sofia.herrera@tech.dev', coursesCount: 1, avgScore: 82.0 },
  ];

  readonly facultyActivitiesList = signal([
    { id: 'act_1', title: 'Implementación de Thread Pool en C++', type: 'code_challenge', courseTitle: 'Introducción a la Programación', durationMinutes: 45, xpReward: 100, description: 'Desarrollo de un pool de hilos POSIX con sincronización de mutex y colas seguras.' },
    { id: 'act_2', title: 'Quiz Evaluativo: Prevención de Consultas N+1', type: 'quiz', courseTitle: 'Backend Introducción', durationMinutes: 15, xpReward: 50, description: '4 preguntas de opción múltiple sobre Eager Loading, índices compuestos y JOINs.' },
    { id: 'act_3', title: 'Balanceo de Paréntesis y Árboles BST', type: 'code_challenge', courseTitle: 'Algoritmos y Estructuras', durationMinutes: 30, xpReward: 80, description: 'Validación de sintaxis balanceada y recorrido en orden de árboles binarios.' },
  ]);

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });

    this.initLocalData();

    // Start animated ASCII frame cycler
    if (typeof window !== 'undefined') {
      this.frameTimer = setInterval(() => {
        this.currentFrame.update(f => (f + 1) % 3);
      }, 1200);
    }

    const qp = this.route.snapshot.queryParams;
    if (qp['onboarding'] === 'true' && !this.diagnosticCompleted() && !this.isTeacher()) {
      this.activeTab.set('diagnostic');
    }
  }

  ngOnDestroy() {
    if (this.frameTimer) clearInterval(this.frameTimer);
  }

  private initLocalData() {
    if (typeof window === 'undefined') return;

    const savedAv = localStorage.getItem('syseng_selected_ascii_avatar');
    if (savedAv && this.asciiAvatars.some(a => a.id === savedAv)) {
      this.selectedAvatarId.set(savedAv);
    }

    try {
      const st = JSON.parse(localStorage.getItem('syseng_streak_data') || '{}');
      if (st.currentStreak !== undefined) this.currentStreak.set(st.currentStreak);
      if (st.maxStreak !== undefined) this.maxStreak.set(st.maxStreak);
      const today = new Date().toISOString().slice(0, 10);
      if (st.lastCheckIn === today) this.todayCheckedIn.set(true);
    } catch {}

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
  }

  readonly currentAsciiAvatar = computed(() => {
    const id = this.selectedAvatarId();
    return this.asciiAvatars.find(a => a.id === id) || this.asciiAvatars[0];
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
      localStorage.setItem('syseng_selected_ascii_avatar', id);
    }
    this.closeAvatarModal();
  }

  readonly streakMultiplier = computed(() => {
    const s = this.currentStreak();
    if (s >= 14) return 1.40;
    if (s >= 7)  return 1.25;
    if (s >= 3)  return 1.10;
    return 1.05;
  });

  readonly weekDays = computed<StreakDay[]>(() => {
    const names = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
    const currentDayIdx = (new Date().getDay() + 6) % 7;
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
    }

    let spec = 'Sistemas Backend & APIs Distribuidas';
    let pathTitle = 'Ruta de Desarrollo Backend & APIs';
    let courseSlug = 'backend-introduccion';
    let courseTitle = 'Introducción al Backend & Arquitectura de Servidores';

    if (pref === 'algo') {
      spec = 'Estructuras de Datos & Algorítmica';
      pathTitle = 'Ruta de Fundamentos de Algorítmica';
      courseSlug = 'algoritmos-ordenamiento';
      courseTitle = 'Algoritmos de Ordenamiento & Complejidad';
    } else if (pref === 'frontend') {
      spec = 'Arquitectura Frontend & UI Reactiva';
      pathTitle = 'Ruta de Desarrollo Frontend Moderno';
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
      agentFeedback: `Byte Copilot ha evaluado tu razonamiento técnico (${score}/3 aciertos fundamentales). Asignamos tu perfil al ${assignedTitle}.`,
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

  readonly myGroupName = computed(() => {
    const mine = this.studyGroups().find(g => g.isMember);
    return mine ? `${mine.tag} ${mine.name}` : 'Sin clan asignado';
  });

  joinGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g => ({ ...g, isMember: g.id === id, membersCount: g.id === id ? g.membersCount + 1 : (g.isMember ? g.membersCount - 1 : g.membersCount) }))
    );
  }

  leaveGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g => g.id === id ? { ...g, isMember: false, membersCount: Math.max(1, g.membersCount - 1) } : g)
    );
  }

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

  readonly userLevel = computed(() => Math.max(1, Math.floor(this.totalXp() / 100) + 1));
  readonly xpProgressPercent = computed(() => this.totalXp() % 100);
  readonly xpToNextLevel = computed(() => 100 - (this.totalXp() % 100));

  readonly rankTitle = computed(() => {
    const lvl = this.userLevel();
    if (lvl >= 11) return 'Arquitecto Principal de Sistemas';
    if (lvl >= 8)  return 'Ingeniero de Software Senior';
    if (lvl >= 6)  return 'Líder Técnico en Desarrollo';
    if (lvl >= 4)  return 'Desarrollador FullStack Semi-Senior';
    return 'Cadete de Sistemas (Iniciación)';
  });

  readonly specialization = computed(() => ({
    title: 'Sistemas Backend & APIs Distribuidas',
    icon: '⚙️',
  }));

  myRank(): number { return 3; }

  readonly badges = computed<AchievementBadge[]>(() => [
    {
      id: 'challenge_1',
      title: 'Primer Algoritmo CLI',
      category: 'challenges',
      icon: '🥉',
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
      icon: '🔥',
      description: 'Mantuviste una racha de estudio de al menos 5 días.',
      requirement: 'Racha >= 5 días',
      targetCount: 5,
      currentCount: 5,
      progressPercent: 100,
      unlocked: true,
      level: 'silver',
      shaFingerprint: 'sha256:f5e4d3c2b1a09876',
    },
  ]);

  readonly unlockedBadgesCount = computed(() => this.badges().filter(b => b.unlocked).length);
  readonly filteredBadges = computed(() => this.badges());

  readonly leaderboard = computed<LeaderboardEntry[]>(() => [
    { rank: 1, name: 'Mateo Silva', email: 'mateo.silva@alumnos.syseng.edu', avatarText: 'MS', level: 16, rankTitle: 'Arquitecto Principal', specialization: 'Especialista en Algoritmos', completedLessons: 14, avgQuizScore: 96.0, xp: 1520, isCurrentUser: false, badgePill: '🥇 ORO' },
    { rank: 2, name: 'Carlos Prueba', email: 'carlos_test_1790540376@gmail.com', avatarText: 'CP', level: 12, rankTitle: 'Líder Técnico', specialization: 'Arquitecto FullStack', completedLessons: 11, avgQuizScore: 88.0, xp: 1180, isCurrentUser: false, badgePill: '🥈 PLATA' },
    { rank: 3, name: this.auth.user()?.name || 'Ana Estudiante (Demo)', email: this.auth.user()?.email || 'estudiante@sysengacademy.dev', avatarText: 'AE', level: this.userLevel(), rankTitle: this.rankTitle(), specialization: this.specialization().title, completedLessons: 9, avgQuizScore: 91.7, xp: this.totalXp(), isCurrentUser: true, badgePill: '🥉 BRONCE' },
  ]);

  emoji(enr: Enrollment): string {
    return '📚';
  }
}
