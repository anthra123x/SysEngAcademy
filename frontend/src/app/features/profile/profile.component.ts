import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { TeacherService, TeacherStudent, TeacherActivity, TeacherOverviewResponse } from '../../core/services/teacher.service';
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
                <strong>[CALIBRACIÓN PENDIENTE]</strong>
                <span>Realiza tu calibración inicial con Byte IA para desbloquear tu ruta y temario de ingeniería personalizado.</span>
              </div>
            </div>
            <a routerLink="/onboarding" class="btn btn-sm btn-primary-glitch">
              $ syseng-calibrate --start →
            </a>
          </div>
        }

        <!-- ========================================================
             LINUX TERMINAL WINDOW FRAME (MINIMALISTA)
             ======================================================== -->
        <div class="terminal-window" [class.is-faculty-terminal]="isTeacher()">
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
              @if (isTeacher()) {
                <span class="teacher-pill-header">
                  FACULTY ROOT // CÁTEDRA
                </span>
                <span class="status-indicator status-indicator--faculty"></span>
                <span class="status-label status-label--faculty">SUPERVISOR</span>
              }
            </div>
          </div>

          <!-- Terminal Inner Content -->
          <div class="terminal-content">

            <!-- ========================================================
                 NEOFETCH SYSINFO HERO BANNER (CON ASCII ART ANIMADO)
                 ======================================================== -->
            <div class="neofetch-card" [class.is-faculty-neofetch]="isTeacher()">
              <!-- ASCII Avatar Box with Animated Frames & Blink -->
              <div class="neofetch-logo" (click)="openAvatarModal()" [title]="isTeacher() ? 'Personalizar Mascota y Firma de Cátedra' : 'Personalizar avatar ASCII animado'">
                <pre class="ascii-art">{{ currentAsciiFrame() }}</pre>
                <div class="ascii-hover-overlay">
                  <span>[ ⚙ {{ isTeacher() ? 'Cambiar Mascota Docente' : 'Cambiar ASCII' }} ]</span>
                </div>
                <div class="ascii-motion-indicator">
                  <span class="motion-dot"></span>
                  <span class="motion-lbl">{{ isTeacher() ? 'FACULTY LIVE' : 'LIVE' }}</span>
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
                    <div class="meta-row">
                      <span class="meta-k">OS:</span>
                      <span class="meta-v">SysEng Linux OS (Faculty Authority Pod v6.8-ACADEMIA)</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Cargo Docente:</span>
                      <span class="meta-v role-tag-teacher">Profesor Titular &amp; Arquitecto de Cátedra</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Alumnos a Cargo:</span>
                      <span class="meta-v"><strong>{{ facultyStudentsCount() }} estudiantes</strong> en supervisión activa</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Cursos en Catálogo:</span>
                      <span class="meta-v"><strong>43 asignaturas técnicas</strong> estructuradas</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Actividades &amp; Quizzes:</span>
                      <span class="meta-v"><strong>{{ facultyActivitiesCount() }} retos y evaluaciones</strong> publicados</span>
                    </div>
                    <div class="meta-row">
                      <span class="meta-k">Aprobación Global:</span>
                      <span class="meta-v"><strong>{{ facultyAvgScore() }}% de efectividad</strong> en cohortes</span>
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
                        <strong>🔥 {{ currentStreak() }} {{ currentStreak() === 1 ? 'día consecutivo' : 'días consecutivos' }}</strong>
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
                  <span class="term-tab__flag">--faculty-ai</span>
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
                  <span class="term-tab__flag">--ai</span>
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
                    <div class="sensor-num">{{ facultyStudentsCount() }}</div>
                    <div class="sensor-footer"><span class="sensor-sub">Supervisión en tiempo real</span></div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">CURSOS ACTIVOS</span>
                      <span class="sensor-code">[FAC_CRS]</span>
                    </div>
                    <div class="sensor-num">43</div>
                    <div class="sensor-footer"><span class="sensor-sub">Catálogo académico oficial</span></div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">PROMEDIO EVALUATIVO</span>
                      <span class="sensor-code">[FAC_AVG]</span>
                    </div>
                    <div class="sensor-num">{{ facultyAvgScore() }}%</div>
                    <div class="sensor-footer"><span class="sensor-sub">Rendimiento en quizzes</span></div>
                  </div>

                  <div class="sensor-card">
                    <div class="sensor-card__head">
                      <span class="sensor-label">ACTIVIDADES &amp; QUIZZES</span>
                      <span class="sensor-code">[FAC_ACT]</span>
                    </div>
                    <div class="sensor-num">{{ facultyActivitiesCount() }}</div>
                    <div class="sensor-footer"><span class="sensor-sub">Creados por la cátedra</span></div>
                  </div>
                </div>

                <div class="section-container">
                  <div class="section-terminal-bar">
                    <div class="terminal-bar-title">
                      <span class="term-prefix">ps aux | grep</span>
                      <span class="term-arg">faculty_supervision</span>
                    </div>
                    <a routerLink="/docente" class="btn btn-xs btn-outline">Ir al Panel Docente Principal →</a>
                  </div>

                  <div class="teacher-overview-block">
                    <div class="teacher-banner-box">
                      <h3>Supervisión de Cátedra &amp; Calidad Académica</h3>
                      <p>Desde este portal tienes autoridad completa para diseñar actividades interactivas en terminal, crear quizzes de opción múltiple, supervisar el avance de cada estudiante y auditar el catálogo.</p>
                      <div class="faculty-action-pills">
                        <a routerLink="/docente" [queryParams]="{ tab: 'activities' }" class="btn btn-sm btn-primary">
                          Crear Nueva Actividad
                        </a>
                        <a routerLink="/docente" [queryParams]="{ tab: 'students' }" class="btn btn-sm btn-outline">
                          Ver Directorio de Alumnos
                        </a>
                        <a routerLink="/docente" [queryParams]="{ tab: 'ai' }" class="btn btn-sm btn-outline">
                          Asistente Docente IA
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

                  @for (st of facultyStudents(); track st.id) {
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
                        <span class="cat-chip" [style.color]="st.email_verified ? '#0ae98a' : '#ff9d33'">
                          {{ st.email_verified ? '✓ Verificado' : '⏳ Pendiente' }}
                        </span>
                      </span>
                      <span class="lcol-level">
                        <span class="level-indicator">{{ st.enrollments_count }} cursos</span>
                      </span>
                      <span class="lcol-score">
                        <span class="score-badge">{{ st.average_quiz_score !== null ? st.average_quiz_score + '%' : '—' }}</span>
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
                  @for (act of facultyActivities(); track act.id) {
                    <div class="badge-terminal-card is-unlocked card-gold">
                      <div class="card-top-header">
                        <span class="badge-level-pill">{{ act.type | uppercase }}</span>
                        <span class="badge-status-tag tag-unlocked">✓ ACTIVA</span>
                      </div>
                      <div class="badge-body">
                        <div class="badge-icon-box">
                          <span class="badge-icon-char">{{ act.type === 'quiz' ? '📝' : (act.type === 'terminal' ? '💻' : '⚡') }}</span>
                        </div>
                        <div class="badge-details">
                          <h4 class="badge-title">{{ act.title }}</h4>
                          <p class="badge-desc">{{ act.description }}</p>
                          <div class="badge-fingerprint">
                            <span class="fp-label">CURSO:</span>
                            <span class="fp-code">{{ act.course_name }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="badge-footer">
                        <div class="badge-progress-row">
                          <span class="badge-req">Recompensa: +{{ act.xp_reward }} XP</span>
                          <span class="badge-count">Dificultad: {{ act.difficulty }}</span>
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
                  <span class="term-status-badge text-cyan">ASISTENTE PEDAGÓGICO CONECTADO</span>
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
                        Los {{ facultyStudentsCount() }} estudiantes registran una tasa evaluativa global del {{ facultyAvgScore() }}% en evaluaciones técnicas de algoritmos y sistemas. Se recomienda mantener actualizada la suite de actividades prácticas en terminal.
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

                  <div class="sensor-card sensor-card--glow">
                    <div class="sensor-card__head">
                      <span class="sensor-label">NIVEL Y TEMARIO CALIBRADO</span>
                      <span class="sensor-code">[BYTE_IA]</span>
                    </div>
                    <div class="sensor-num text-cyan" style="font-size: 1.05rem; line-height: 1.3;">
                      {{ diagnosticCompleted() ? diagnosticResult().assignedLevelTitle : 'Pendiente de Calibrar' }}
                    </div>
                    <div class="sensor-footer">
                      <a routerLink="/onboarding" class="sensor-sub text-primary">
                        {{ diagnosticCompleted() ? 'Ver temario y plan a medida →' : 'Realizar calibración inicial →' }}
                      </a>
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



            @if (!isTeacher() && activeTab() === 'guilds') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">ls -la</span>
                    <span class="term-arg">/var/syseng/study-guilds</span>
                  </div>
                  <button type="button" class="btn btn-xs btn-outline" (click)="openCreateGuildModal()">
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
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">gpg --verify-badges</span>
                    <span class="term-arg">/var/syseng/achievements.key</span>
                  </div>
                  <span class="term-status-badge text-success">CERTIFICACIÓN CRIPTOGRÁFICA</span>
                </div>

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
                          <div class="badge-fingerprint" style="margin-top: 6px; font-family: var(--font-mono); font-size: 10px; color: #475569;">
                            <span>SHA256: {{ b.shaFingerprint.slice(0, 16) }}…</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'leaderboard') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">top -b -n 1 | head</span>
                    <span class="term-arg">--ranking=global-xp</span>
                  </div>
                  <span class="term-status-badge text-primary">CUADRO DE HONOR ACTIVO</span>
                </div>

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

                <div class="leaderboard-table-shell">
                  <div class="leaderboard-head">
                    <span class="lcol-rank">RANGO</span>
                    <span class="lcol-user">ESTUDIANTE</span>
                    <span class="lcol-spec">ESPECIALIDAD</span>
                    <span class="lcol-level">NIVEL</span>
                    <span class="lcol-score">QUIZZES</span>
                    <span class="lcol-xp">XP TOTAL</span>
                  </div>
                  @for (entry of leaderboard(); track entry.rank) {
                    <div class="leaderboard-row" [class.is-current-user]="entry.isCurrentUser">
                      <span class="lcol-rank">#{{ entry.rank }}</span>
                      <span class="lcol-user">
                        <span class="user-avatar-tag">{{ entry.avatarText }}</span>
                        <strong>{{ entry.name }}</strong>
                        @if (entry.isCurrentUser) { <span class="cat-chip" style="color: #00f0ff; margin-left: 6px;">(Tú)</span> }
                      </span>
                      <span class="lcol-spec"><span class="cat-chip">{{ entry.specialization }}</span></span>
                      <span class="lcol-level"><span class="cat-chip">Lvl {{ entry.level }}</span></span>
                      <span class="lcol-score"><span class="cat-chip">{{ entry.avgQuizScore }}%</span></span>
                      <span class="lcol-xp"><strong style="color: #0ae98a;">{{ entry.xp }} XP</strong></span>
                    </div>
                  }
                </div>
              </div>
            }

            @if (!isTeacher() && activeTab() === 'advisor') {
              <div class="tab-pane animate-fade-in">
                <div class="section-terminal-bar">
                  <div class="terminal-bar-title">
                    <span class="term-prefix">byte-copilot</span>
                    <span class="term-arg">--consult-profile</span>
                  </div>
                  <span class="term-status-badge text-purple">RECOMENDADOR DE RUTA TÉCNICA</span>
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
                  {{ isTeacher() ? 'Selecciona la mascota y firma ASCII de Cátedra que representará tu autoridad docente:' : 'Selecciona la firma ASCII animada que representará tu sesión en SysEng Academy:' }}
                </p>

                <div class="avatar-gallery-grid">
                  @for (av of availableAsciiAvatars(); track av.id) {
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

        <!-- ========================================================
             MODAL / CREAR GRUPO DE ESTUDIO (CLAN)
             ======================================================== -->
        @if (showCreateGuildModal()) {
          <div class="modal-backdrop" (click)="closeCreateGuildModal()">
            <div class="ascii-modal-window" style="max-width: 540px;" (click)="$event.stopPropagation()">
              <div class="modal-titlebar">
                <span class="modal-cmd">groupadd -g syseng /etc/study-guilds</span>
                <button type="button" class="modal-close-btn" (click)="closeCreateGuildModal()">✕</button>
              </div>

              <div class="modal-content">
                <p class="modal-help-text">
                  Funda un nuevo Clan de Ingeniería para estudiar con otros cadetes, compartir retos de código y mantener rachas grupales.
                </p>

                @if (guildActionError(); as err) {
                  <p style="color: #ef4444; font-size: 11.5px; margin-bottom: 12px; font-family: var(--font-mono);">
                    ⚠ {{ err }}
                  </p>
                }

                <div style="display: flex; flex-direction: column; gap: 12px;">
                  <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                      <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 4px;">
                        Nombre del Clan
                      </label>
                      <input
                        type="text"
                        class="input input-sm"
                        style="width: 100%;"
                        placeholder="Ej: Rust & Sistemas de Baja Latencia"
                        [ngModel]="newGuildName()"
                        (ngModelChange)="newGuildName.set($event)"
                      />
                    </div>
                    <div style="width: 110px;">
                      <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 4px;">
                        Tag / Sigla
                      </label>
                      <input
                        type="text"
                        class="input input-sm"
                        style="width: 100%; text-transform: uppercase;"
                        placeholder="[RUST]"
                        [ngModel]="newGuildTag()"
                        (ngModelChange)="newGuildTag.set($event)"
                      />
                    </div>
                  </div>

                  <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 4px;">
                      Especialidad de Estudio
                    </label>
                    <select
                      class="input input-sm"
                      style="width: 100%;"
                      [ngModel]="newGuildCategory()"
                      (ngModelChange)="newGuildCategory.set($event)"
                    >
                      <option value="systems">Sistemas & Concurrencia</option>
                      <option value="algorithms">Algoritmos & Estructuras de Datos</option>
                      <option value="backend">Desarrollo Backend & APIs</option>
                      <option value="frontend">Frontend & Experiencia de Usuario</option>
                      <option value="security">Ciberseguridad & Red Teaming</option>
                      <option value="ai">Inteligencia Artificial & Modelos</option>
                    </select>
                  </div>

                  <div>
                    <label style="display: block; font-size: 11px; font-family: var(--font-mono); color: #94a3b8; margin-bottom: 4px;">
                      Descripción del Clan y Objetivos
                    </label>
                    <textarea
                      class="input input-sm"
                      rows="3"
                      style="width: 100%; resize: vertical;"
                      placeholder="Describe qué tecnologías estudiarán y qué metas técnicas persiguen en equipo..."
                      [ngModel]="newGuildDescription()"
                      (ngModelChange)="newGuildDescription.set($event)"
                    ></textarea>
                  </div>

                  <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px;">
                    <button type="button" class="btn btn-sm btn-outline" (click)="closeCreateGuildModal()">
                      Cancelar
                    </button>
                    <button type="button" class="btn btn-sm btn-primary" (click)="createGuild()">
                      + Fundar Clan
                    </button>
                  </div>
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

    /* ========================================================
       STUDENT TABS COMPLETE DESIGN SYSTEM
       ======================================================== */

    /* STREAK TAB */
    .streak-dashboard-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 14px;
      @media (max-width: 800px) { grid-template-columns: 1fr; }
    }

    .streak-hero-card, .streak-week-card {
      background: #0B0E14;
      border: 1px solid #161F2E;
      border-radius: var(--radius-md);
      padding: 22px;
      display: flex;
      flex-direction: column;
    }

    .streak-flame-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 18px;
      border-bottom: 1px solid #161F2E;
      margin-bottom: 18px;

      .flame-big {
        font-size: 3rem;
        line-height: 1;
        filter: drop-shadow(0 0 16px rgba(255, 157, 51, 0.4));
        animation: pulse 1.8s infinite;
      }

      .flame-counter {
        display: flex;
        flex-direction: column;

        .counter-num {
          font-family: var(--font-mono);
          font-size: 2.2rem;
          font-weight: 800;
          color: #FF9D33;
          line-height: 1;
        }

        .counter-lbl {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #7B8EA6;
          letter-spacing: 0.08em;
          margin-top: 4px;
        }
      }
    }

    .streak-stats-row {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;

      .streak-stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: var(--font-mono);
        font-size: 12px;
        padding: 9px 12px;
        background: #080A0F;
        border: 1px solid #141C2A;
        border-radius: 4px;

        .stat-k { color: #7B8EA6; }
        .stat-v { color: #CBD5E1; font-weight: 600; }
      }
    }

    .streak-action-box {
      margin-top: auto;
      .btn-block { width: 100%; justify-content: center; }
      .checked-in-banner {
        background: rgba(10, 233, 138, 0.08);
        border: 1px solid rgba(10, 233, 138, 0.25);
        color: #0AE98A;
        font-family: var(--font-mono);
        font-size: 12px;
        padding: 10px 14px;
        border-radius: 4px;
        text-align: center;
      }
    }

    .streak-week-card {
      .streak-card-title {
        font-size: 15px;
        color: #F1F5F9;
        margin: 0 0 6px;
        font-weight: 700;
      }

      .streak-card-desc {
        font-size: 12px;
        color: #7B8EA6;
        line-height: 1.5;
        margin: 0 0 16px;
      }
    }

    .week-days-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;

      .week-day-cell {
        background: #080A0F;
        border: 1px solid #141C2A;
        border-radius: 6px;
        padding: 12px 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
        transition: all 0.2s ease;

        .day-name {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #64748B;
          font-weight: 700;
        }

        .day-indicator {
          font-size: 1.2rem;
          line-height: 1;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .day-status-txt {
          font-family: var(--font-mono);
          font-size: 9.5px;
          color: #475569;
          font-weight: 700;
        }

        &.is-done {
          border-color: rgba(255, 157, 51, 0.4);
          background: rgba(255, 157, 51, 0.06);
          .day-name { color: #FF9D33; }
          .day-status-txt { color: #0AE98A; }
        }

        &.is-today {
          border-color: #00F0FF;
          background: rgba(0, 240, 255, 0.08);
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
          .day-name { color: #00F0FF; }
          .day-status-txt { color: #00F0FF; }
        }
      }
    }

    /* DIAGNOSTIC TAB */
    .diag-wizard-card {
      background: #0B0E14;
      border: 1px solid #161F2E;
      border-radius: var(--radius-md);
      padding: 24px;
      margin-top: 14px;
    }

    .diag-wizard-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      gap: 14px;
      flex-wrap: wrap;

      .diag-step-badge {
        font-family: var(--font-mono);
        font-size: 10px;
        color: #00F0FF;
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid rgba(0, 240, 255, 0.25);
        padding: 3px 8px;
        border-radius: 4px;
        font-weight: 700;
        display: inline-block;
        margin-bottom: 6px;
      }

      h3 {
        font-size: 16px;
        color: #F1F5F9;
        margin: 0;
      }

      .diag-topic-tag {
        font-family: var(--font-mono);
        font-size: 11px;
        color: #A855F7;
        background: rgba(168, 85, 247, 0.1);
        border: 1px solid rgba(168, 85, 247, 0.25);
        padding: 3px 10px;
        border-radius: 9999px;
      }
    }

    .diag-terminal-code-block {
      background: #080A0F;
      border: 1px solid #161F2E;
      border-radius: 4px;
      padding: 12px 16px;
      margin-bottom: 16px;
      pre, code {
        margin: 0;
        font-family: var(--font-mono);
        font-size: 12px;
        color: #0AE98A;
      }
    }

    .diag-question-text {
      font-size: 14px;
      color: #CBD5E1;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .diag-options-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 22px;

      .diag-option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: #080A0F;
        border: 1px solid #161F2E;
        border-radius: 6px;
        color: #CBD5E1;
        cursor: pointer;
        font-size: 13px;
        text-align: left;
        transition: all 0.15s ease;

        .opt-key {
          font-family: var(--font-mono);
          font-weight: 700;
          color: #64748B;
        }

        &:hover {
          border-color: #27344C;
          background: #101622;
          color: #FFF;
        }

        &.is-selected {
          border-color: #00F0FF;
          background: rgba(0, 240, 255, 0.06);
          color: #00F0FF;
          box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
          .opt-key { color: #00F0FF; }
        }
      }
    }

    .diag-actions-footer {
      display: flex;
      justify-content: flex-end;
    }

    /* Diag Result Card */
    .diag-result-card {
      background: #0B0E14;
      border: 1px solid #161F2E;
      border-radius: var(--radius-md);
      padding: 26px;
      margin-top: 14px;
    }

    .result-top-banner {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-bottom: 18px;
      border-bottom: 1px solid #161F2E;
      margin-bottom: 22px;

      .result-icon-robot {
        font-size: 2.5rem;
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid rgba(0, 240, 255, 0.3);
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: grid;
        place-items: center;
      }

      .result-header-text {
        .result-sub-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #00F0FF;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 4px;
        }

        h2 {
          font-size: 18px;
          color: #F1F5F9;
          margin: 0 0 6px;
        }

        .result-xp-reward {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #0AE98A;
          font-weight: 700;
        }
      }
    }

    .result-breakdown-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 22px;
      @media (max-width: 700px) { grid-template-columns: 1fr; }

      .result-item {
        background: #080A0F;
        border: 1px solid #161F2E;
        border-radius: 6px;
        padding: 12px 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: var(--font-mono);
        font-size: 12px;

        .rk { color: #64748B; }
        .rv { color: #CBD5E1; font-weight: 600; }
      }
    }

    .result-ai-feedback {
      margin-bottom: 22px;
      .ai-speech-bubble {
        background: rgba(0, 240, 255, 0.04);
        border: 1px solid rgba(0, 240, 255, 0.2);
        border-radius: 6px;
        padding: 14px 18px;
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .ai-avatar-mini {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #00F0FF;
          background: rgba(0, 240, 255, 0.15);
          padding: 2px 7px;
          border-radius: 4px;
          font-weight: 700;
          flex: none;
        }

        p {
          font-size: 13px;
          color: #CBD5E1;
          line-height: 1.6;
          margin: 0;
        }
      }
    }

    .result-action-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
      padding-top: 18px;
      border-top: 1px solid #161F2E;

      .course-suggestion-meta {
        font-size: 13px;
        .cs-lbl { color: #64748B; margin-right: 6px; }
        .cs-val { color: #F1F5F9; }
      }

      .result-buttons {
        display: flex;
        gap: 10px;
      }
    }

    /* GUILDS TAB */
    .guilds-layout {
      margin-top: 14px;
    }

    .guilds-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }

    .guild-card {
      background: #0B0E14;
      border: 1px solid #161F2E;
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;

      &:hover {
        border-color: #27344C;
        background: #0F1420;
      }

      &.is-my-guild {
        border-color: rgba(0, 240, 255, 0.35);
        background: rgba(0, 240, 255, 0.03);
      }

      .guild-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .guild-badge-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 800;
          color: #00F0FF;
          background: rgba(0, 240, 255, 0.1);
          border: 1px solid rgba(0, 240, 255, 0.25);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .guild-streak {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #FF9D33;
        }
      }

      .guild-title {
        font-size: 15px;
        color: #F1F5F9;
        margin: 0 0 6px;
        font-weight: 700;
      }

      .guild-desc {
        font-size: 12px;
        color: #7B8EA6;
        line-height: 1.5;
        margin: 0 0 16px;
        flex: 1;
      }

      .guild-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 14px;
        border-top: 1px solid #161F2E;

        .guild-members-count {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #64748B;
        }

        .btn-outline-danger {
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #F87171;
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
          &:hover {
            background: rgba(239, 68, 68, 0.1);
            border-color: #EF4444;
          }
        }
      }
    }

    /* LEADERBOARD TAB */
    .podium-section {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      gap: 16px;
      padding: 36px 16px 20px;
      margin-bottom: 20px;
      border-bottom: 1px solid #161F2E;

      .podium-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 140px;

        .podium-crown {
          font-size: 1.4rem;
          margin-bottom: 4px;
          animation: asciiFloat 2.5s ease-in-out infinite;
        }

        .podium-avatar {
          font-size: 2rem;
          margin-bottom: 6px;
        }

        .podium-name {
          font-size: 12px;
          color: #F1F5F9;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 130px;
        }

        .podium-xp {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #0AE98A;
          margin-bottom: 10px;
        }

        .podium-block {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 800;
          border-radius: 6px 6px 0 0;
          border: 1px solid transparent;

          &.step-1 {
            height: 110px;
            background: linear-gradient(180deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.05));
            border-color: rgba(234, 179, 8, 0.4);
            color: #FACC15;
          }

          &.step-2 {
            height: 85px;
            background: linear-gradient(180deg, rgba(148, 163, 184, 0.25), rgba(148, 163, 184, 0.05));
            border-color: rgba(148, 163, 184, 0.4);
            color: #E2E8F0;
          }

          &.step-3 {
            height: 60px;
            background: linear-gradient(180deg, rgba(217, 119, 6, 0.25), rgba(217, 119, 6, 0.05));
            border-color: rgba(217, 119, 6, 0.4);
            color: #F97316;
          }
        }

        &.is-me {
          .podium-name { color: #00F0FF; }
          .podium-block {
            border-color: #00F0FF;
            box-shadow: 0 0 14px rgba(0, 240, 255, 0.2);
          }
        }
      }
    }

    .leaderboard-row.is-current-user {
      background: rgba(0, 240, 255, 0.05);
      border-left: 2px solid #00F0FF;
    }

    /* ADVISOR TAB */
    .advisor-output-card {
      background: #0B0E14;
      border: 1px solid #161F2E;
      border-radius: var(--radius-md);
      overflow: hidden;
      margin-top: 14px;
    }

    .terminal-subhead {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #0E121A;
      border-bottom: 1px solid #161F2E;
      font-family: var(--font-mono);
      font-size: 11px;

      .term-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #A855F7;
        box-shadow: 0 0 6px #A855F7;
      }

      .term-subhead-title {
        color: #C084FC;
        font-weight: 700;
        letter-spacing: 0.06em;
      }

      .match-score {
        margin-left: auto;
        color: #0AE98A;
        font-weight: 700;
      }
    }

    .recommendation-content {
      padding: 24px;

      .rec-path-box {
        margin-bottom: 18px;

        .rec-eyebrow {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #64748B;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 4px;
        }

        .rec-title {
          font-size: 18px;
          color: #F1F5F9;
          margin: 0 0 8px;
        }

        .rec-milestone-pill {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 11px;
          color: #00F0FF;
          background: rgba(0, 240, 255, 0.08);
          border: 1px solid rgba(0, 240, 255, 0.25);
          padding: 4px 10px;
          border-radius: 4px;
        }
      }

      .rec-rationale {
        margin-bottom: 22px;
        .rationale-text {
          font-size: 13px;
          color: #CBD5E1;
          line-height: 1.7;
          margin: 0;
        }
      }

      .rec-action-bar {
        padding-top: 18px;
        border-top: 1px solid #161F2E;
      }
    }

    /* PROCESS TABLE & SENSOR UTILITIES */
    .prog-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .prog-percent {
        font-family: var(--font-mono);
        font-size: 11px;
        color: #CBD5E1;
        width: 32px;
      }

      .prog-bar-shell {
        flex: 1;
        height: 6px;
        background: #141C2A;
        border-radius: 9999px;
        overflow: hidden;

        .prog-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0AE98A, #00F0FF);
        }
      }
    }

    .proc-icon {
      font-size: 1.1rem;
      margin-right: 4px;
    }

    .term-empty-card {
      padding: 36px 20px;
      text-align: center;
      background: #080A0F;

      .term-empty-title {
        font-family: var(--font-mono);
        font-size: 13px;
        color: #FF9D33;
        font-weight: 700;
        margin: 0 0 6px;
      }

      .term-empty-desc {
        font-size: 12px;
        color: #7B8EA6;
        margin: 0 0 16px;
      }
    }

    .sensor-card--glow {
      border-color: rgba(0, 240, 255, 0.3);
      box-shadow: 0 0 12px rgba(0, 240, 255, 0.08);
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

    /* Dedicated Styling for Faculty Terminal (Docente) */
    .terminal-window.is-faculty-terminal {
      background: #08090D;
      border: 1px solid #1E2235;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.08);

      .terminal-titlebar {
        background: #0D101A;
        border-bottom: 1px solid #1E2235;
        .terminal-title { color: #94A3B8; }
      }

      .teacher-pill-header {
        background: #161926;
        border: 1px solid #202436;
        color: #F8FAFC;
        font-weight: 700;
        font-size: 10px;
        letter-spacing: 0.06em;
      }

      .status-indicator--faculty {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #38BDF8;
        box-shadow: 0 0 6px #38BDF8;
      }

      .status-label--faculty {
        color: #38BDF8;
        font-weight: 700;
        font-size: 10px;
      }

      .neofetch-card.is-faculty-neofetch {
        background: #0E101A;
        border: 1px solid #1E2235;

        .neofetch-logo {
          background: #08090D;
          border: 1px solid #1E2235;

          &:hover {
            border-color: #38BDF8;
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
          }

          .ascii-art {
            color: #F8FAFC;
          }

          .ascii-motion-indicator {
            color: #38BDF8;
            .motion-dot {
              background: #38BDF8;
              box-shadow: 0 0 6px #38BDF8;
            }
          }

          .ascii-hover-overlay span {
            color: #38BDF8;
          }
        }

        .neofetch-user-header {
          .prompt-user { color: #F8FAFC; font-weight: 700; }
          .prompt-at { color: #64748B; }
          .prompt-host { color: #38BDF8; }
          .btn-avatar-chip {
            background: #161926;
            border: 1px solid #202436;
            color: #94A3B8;
            &:hover {
              color: #F8FAFC;
              border-color: #38BDF8;
              background: #1C2030;
            }
          }
        }

        .neofetch-divider {
          color: #1E2235;
        }

        .meta-row {
          .meta-k { color: #64748B; }
          .meta-v { color: #CBD5E1; strong { color: #F8FAFC; } }
          .role-tag-teacher {
            background: rgba(56, 189, 248, 0.08);
            border: 1px solid rgba(56, 189, 248, 0.25);
            color: #38BDF8;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 600;
          }
        }
      }

      .terminal-nav {
        border-bottom: 1px solid #1E2235;

        .term-tab {
          background: #0D101A;
          border: 1px solid #1E2235;
          color: #94A3B8;

          &:hover {
            background: #161926;
            color: #F8FAFC;
            border-color: #2E344E;
          }

          &.is-active {
            background: #161926;
            border-color: #38BDF8;
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.15);

            .term-tab__prompt { color: #38BDF8; }
            .term-tab__cmd { color: #F8FAFC; }
            .term-tab__flag { color: #38BDF8; }
          }
        }
      }

      .sensor-card {
        background: #0E101A;
        border: 1px solid #1E2235;
        transition: all 0.15s ease;

        &:hover {
          border-color: #2E344E;
          background: #111422;
        }

        .sensor-label { color: #64748B; }
        .sensor-code { color: #38BDF8; }
        .sensor-num { color: #F8FAFC; }
        .sensor-footer { color: #94A3B8; }
      }

      .section-container {
        background: #0E101A;
        border: 1px solid #1E2235;
      }

      .section-terminal-bar {
        background: #0D101A;
        border-bottom: 1px solid #1E2235;
        .term-prefix { color: #38BDF8; }
        .term-arg { color: #F8FAFC; }
      }

      .teacher-overview-block {
        .teacher-banner-box {
          background: #08090D;
          border: 1px solid #1E2235;
          h3 { color: #F8FAFC; }
          p { color: #94A3B8; }

          .btn-primary {
            background: #38BDF8;
            color: #08090D;
            border: 1px solid #38BDF8;
            font-weight: 600;
            &:hover { background: #0284C7; border-color: #0284C7; color: #FFF; }
          }

          .btn-outline {
            background: #161926;
            border: 1px solid #202436;
            color: #E2E8F0;
            &:hover { background: #1E2235; border-color: #38BDF8; color: #FFF; }
          }
        }
      }
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private coursesSvc = inject(CoursesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  enrollments = signal<Enrollment[]>([]);
  loading = signal(true);

  // Tab state: student vs teacher
  activeTab = signal<'overview' | 'streak' | 'guilds' | 'achievements' | 'leaderboard' | 'advisor'>('overview');
  activeTeacherTab = signal<'overview' | 'students' | 'activities' | 'advisor'>('overview');
  selectedBadgeFilter = signal<'all' | 'unlocked' | 'challenges' | 'courses'>('all');

  // Animated ASCII Art frame index
  currentFrame = signal(0);
  private frameTimer: any = null;

  // Mascotas exclusivas para el cuerpo Docente y Cátedra
  readonly facultyAvatars: AsciiAvatar[] = [
    {
      id: 'professor_owl',
      name: 'Professor Owl',
      subtitle: 'Búho sabio de Cátedra y Algoritmos',
      frames: [
        `   /\\___/\\
  (( o,o ))
   \\  -  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
        `   /\\___/\\
  (( -,- ))
   \\  -  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
        `   /\\___/\\
  (( ^,o ))
   \\  o  /
   /|| ||\\
  (_"---"_)
 PROFESSOR OWL`,
      ],
    },
    {
      id: 'dean_tux',
      name: 'Dean Tux (Decano)',
      subtitle: 'Dirección Cátedra & Kernel Linux',
      frames: [
        `   .--.   [DOC]
  |o_o |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
        `   .--.   [DOC]
  |-.- |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
        `   .--.   [DOC]
  |^_^ |  /
  |:_/ | < Cátedra
 //   \\ \\
(| [=] | )
/'\\_   _/\\'\\
\\___)=(___/
 DEAN TUX`,
      ],
    },
    {
      id: 'chief_architect',
      name: 'Chief Architect',
      subtitle: 'Arquitecto de Sistemas & Cloud',
      frames: [
        ` [====KERNEL====]
 | [CPU] 3.8GHz |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
        ` [====KERNEL====]
 | [CPU] >RUN<  |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
        ` [====KERNEL====]
 | [CPU] 4.2GHz |
 |  MEM: 128 GB |
 | ARCH: FACULTY|
 +--------------+
     ||    ||
  CHIEF ARCHITECT`,
      ],
    },
    {
      id: 'grand_mentor',
      name: 'Grand Mentor',
      subtitle: 'Profesor Emérito de Compiladores',
      frames: [
        `      .---.
     /     \\
    | [o] [o]|  🎓
    |   _    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
        `      .---.
     /     \\
    | [-] [-]|  🎓
    |   _    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
        `      .---.
     /     \\
    | [^] [^]|  🎓
    |   o    | /
     \\  -   /
     /|===|\\
    (_|   |_)
   GRAND MENTOR`,
      ],
    },
  ];

  // Mascotas para los Estudiantes
  readonly studentAvatars: AsciiAvatar[] = [
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

  readonly availableAsciiAvatars = computed<AsciiAvatar[]>(() => {
    return this.isTeacher() ? this.facultyAvatars : this.studentAvatars;
  });

  selectedAvatarId = signal<string>('professor_owl');
  showAvatarModal = signal(false);

  // Streak state
  currentStreak = signal(1);
  maxStreak = signal(1);
  todayCheckedIn = signal(true);

  // Diagnostic state
  diagnosticCompleted = signal(false);
  diagnosticFinished = signal(false);
  currentDiagQuestionIndex = signal(0);
  selectedDiagAnswer = signal<string | null>(null);
  evaluatingQuestion = signal(false);

  readonly diagQuestions = [
    {
      id: 'q1',
      title: '1. Rastreo de Variables y Asignación',
      topic: 'Variables y Estado',
      prompt: 'Si ejecutamos este bloque de código paso a paso, ¿cuál será el valor final de la variable puntos?',
      codeSnippet: `let puntos = 10;
puntos = puntos + 5;
puntos = puntos * 2;`,
      options: [
        { id: 'a', label: '20' },
        { id: 'b', label: '30' },
        { id: 'c', label: '25' },
        { id: 'd', label: '15' },
      ],
    },
    {
      id: 'q2',
      title: '2. Condicionales y Toma de Decisiones',
      topic: 'Lógica Condicional (If / Else)',
      prompt: 'Dado el siguiente bloque de código, ¿qué mensaje mostrará la consola si edad = 16?',
      codeSnippet: `let edad = 16;

if (edad >= 18) {
  console.log("Acceso concedido");
} else {
  console.log("Acceso restringido: menor de edad");
}`,
      options: [
        { id: 'a', label: 'Acceso restringido: menor de edad' },
        { id: 'b', label: 'Acceso concedido' },
        { id: 'c', label: 'Error de sintaxis en el condicional' },
        { id: 'd', label: 'No imprime nada en la consola' },
      ],
    },
    {
      id: 'q3',
      title: '3. Bucles y Repetición Secuencial',
      topic: 'Ciclos y Algoritmia Básica',
      prompt: 'Un robot parte desde la posición 0. ¿En qué posición termina el robot después de completar este ciclo?',
      codeSnippet: `let posicion = 0;

for (let paso = 1; paso <= 3; paso++) {
  posicion = posicion + 4;
}`,
      options: [
        { id: 'a', label: '7' },
        { id: 'b', label: '12' },
        { id: 'c', label: '4' },
        { id: 'd', label: '16' },
      ],
    },
    {
      id: 'q4',
      title: '4. Enfoque e Interés de Aprendizaje',
      topic: 'Ruta de Especialización',
      prompt: '¿Hacia qué área o tipo de proyectos deseas orientar con mayor prioridad tu ruta en SysEng Academy?',
      codeSnippet: null,
      options: [
        { id: 'frontend', label: 'Desarrollo Web & Interfaces Visuales (HTML, CSS, JS reactivo)' },
        { id: 'backend', label: 'Sistemas Backend, APIs y Bases de Datos (Lógica de servidor, SQL)' },
        { id: 'algo', label: 'Pensamiento Computacional & Algoritmos (Resolución de problemas de lógica)' },
        { id: 'fullstack', label: 'Ingeniería FullStack (Integración frontend y backend)' },
      ],
    },
  ];

  diagnosticAnswers: Record<string, string> = {};

  diagnosticResult = signal({
    assignedLevelNumber: 1,
    assignedLevelTitle: 'Nivel 1: Cadete en Formación',
    recommendedSpecialty: 'Por definir (Prueba Diagnóstica Pendiente)',
    recommendedPathTitle: 'Ruta Inicial de Formación Técnica',
    suggestedCourseSlug: 'introduccion-programacion',
    suggestedCourseTitle: 'Introducción a la Programación',
    score: 0,
    agentFeedback: 'Presenta tu examen diagnóstico para calibrar tu nivel y definir tu ruta de aprendizaje recomendada.',
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
      isMember: false,
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
    {
      id: 'arch',
      name: 'Arquitectura Backend & APIs',
      tag: '[ARCH]',
      category: 'backend',
      description: 'Diseño de microservicios, bases de datos distribuidas y patrones resilientes.',
      membersCount: 31,
      streakDays: 22,
      weeklyChallenge: { title: 'Diseñar un Rate Limiter distribuido con Redis y Token Bucket', xpReward: 320, completed: false },
      recentLogs: [{ author: 'Valeria (Lvl 14)', message: 'Añadí tests de carga con k6 para 10k req/s.', timeAgo: 'hace 3h' }],
      isMember: false,
    },
    {
      id: 'sec',
      name: 'CyberSecurity & Exploit Analysis',
      tag: '[SEC]',
      category: 'security',
      description: 'Auditoría de seguridad en código, sanitización estricta y criptografía aplicada.',
      membersCount: 15,
      streakDays: 11,
      weeklyChallenge: { title: 'Mitigar vulnerabilidades OWASP Top 10 en endpoint de auth', xpReward: 400, completed: false },
      recentLogs: [{ author: 'Esteban (Lvl 15)', message: 'Demostré inyección de cabeceras en proxy inverso.', timeAgo: 'hace 5h' }],
      isMember: false,
    },
  ]);

  readonly currentStudentEmail = computed(() => {
    return this.auth.user()?.email?.toLowerCase().trim() || 'guest';
  });

  readonly isDemoStudent = computed(() => {
    return this.currentStudentEmail() === 'estudiante@sysengacademy.dev';
  });

  private getUserStorageKey(suffix: string): string {
    return `syseng_${this.currentStudentEmail()}_${suffix}`;
  }

  showCreateGuildModal = signal(false);
  newGuildName = signal('');
  newGuildTag = signal('');
  newGuildCategory = signal<'systems' | 'algorithms' | 'backend' | 'frontend' | 'security' | 'ai'>('systems');
  newGuildDescription = signal('');
  guildActionError = signal<string | null>(null);

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

  private teacherSvc = inject(TeacherService);

  readonly facultyStudents = signal<TeacherStudent[]>([]);
  readonly facultyActivities = signal<TeacherActivity[]>([]);
  readonly facultyOverview = signal<TeacherOverviewResponse | null>(null);

  readonly facultyStudentsCount = computed(() => {
    return this.facultyStudents().length || this.facultyOverview()?.stats.total_students || 5;
  });

  readonly facultyAvgScore = computed(() => {
    return this.facultyOverview()?.stats.average_score ?? 89.1;
  });

  readonly facultyActivitiesCount = computed(() => {
    return this.facultyActivities().length || 3;
  });

  ngOnInit() {
    this.coursesSvc.getMyEnrollments().subscribe(enrs => {
      this.enrollments.set(enrs);
      this.loading.set(false);
    });

    if (this.isTeacher()) {
      this.teacherSvc.getStudents().subscribe(st => this.facultyStudents.set(st));
      this.teacherSvc.getActivities().subscribe(acts => this.facultyActivities.set(acts));
      this.teacherSvc.getOverview().subscribe(ov => this.facultyOverview.set(ov));
    }

    this.initLocalData();

    // Start animated ASCII frame cycler
    if (typeof window !== 'undefined') {
      this.frameTimer = setInterval(() => {
        this.currentFrame.update(f => (f + 1) % 3);
      }, 1200);
    }

    const qp = this.route.snapshot.queryParams;
    if ((qp['onboarding'] === 'true' || qp['tab'] === 'diagnostic') && !this.isTeacher()) {
      this.router.navigate(['/onboarding']);
    }
  }

  ngOnDestroy() {
    if (this.frameTimer) clearInterval(this.frameTimer);
  }

  private initLocalData() {
    if (typeof window === 'undefined') return;

    const teacher = this.isTeacher();
    const storageKey = teacher ? 'syseng_selected_teacher_ascii_avatar' : 'syseng_selected_ascii_avatar';
    const savedAv = localStorage.getItem(storageKey);
    const pool = teacher ? this.facultyAvatars : this.studentAvatars;

    if (savedAv && pool.some(a => a.id === savedAv)) {
      this.selectedAvatarId.set(savedAv);
    } else {
      this.selectedAvatarId.set(pool[0].id);
    }

    if (this.isDemoStudent()) {
      try {
        const st = JSON.parse(localStorage.getItem('syseng_streak_data') || '{}');
        this.currentStreak.set(st.currentStreak !== undefined ? st.currentStreak : 5);
        this.maxStreak.set(st.maxStreak !== undefined ? st.maxStreak : 12);
        const today = new Date().toISOString().slice(0, 10);
        if (st.lastCheckIn === today) this.todayCheckedIn.set(true);
      } catch {
        this.currentStreak.set(5);
        this.maxStreak.set(12);
      }

      this.diagnosticCompleted.set(true);
      this.diagnosticFinished.set(true);
      this.diagnosticResult.set({
        assignedLevelNumber: 6,
        assignedLevelTitle: 'Nivel 6: Desarrollador Backend Semi-Senior',
        recommendedSpecialty: 'Sistemas Backend & APIs Distribuidas',
        recommendedPathTitle: 'Ruta de Desarrollo Backend & Arquitectura de APIs',
        suggestedCourseSlug: 'backend-introduccion',
        suggestedCourseTitle: 'Introducción al Backend & Arquitectura de Servidores',
        score: 3,
        agentFeedback: 'Byte Copilot ha evaluado tu perfil demostrativo.',
      });

      const savedDemoGroups = localStorage.getItem(this.getUserStorageKey('study_groups'));
      if (savedDemoGroups) {
        try {
          this.studyGroups.set(JSON.parse(savedDemoGroups));
        } catch {
          this.studyGroups.update(groups => groups.map(g => ({ ...g, isMember: g.id === 'krnl' })));
        }
      } else {
        this.studyGroups.update(groups =>
          groups.map(g => ({ ...g, isMember: g.id === 'krnl' }))
        );
      }
      return;
    }

    // Alumno real (nuevo usuario): Cargar datos limpios asociados exclusivamente a su cuenta
    const userKeyStreak = this.getUserStorageKey('streak_data');
    const userKeyDiag = this.getUserStorageKey('diagnostic_completed');
    const userKeyDiagRes = this.getUserStorageKey('diagnostic_result');
    const userKeyGroups = this.getUserStorageKey('study_groups');

    try {
      const streakRaw = localStorage.getItem(userKeyStreak);
      if (streakRaw) {
        const st = JSON.parse(streakRaw);
        this.currentStreak.set(st.currentStreak || 1);
        this.maxStreak.set(st.maxStreak || 1);
        const today = new Date().toISOString().slice(0, 10);
        this.todayCheckedIn.set(st.lastCheckIn === today);
      } else {
        this.currentStreak.set(1);
        this.maxStreak.set(1);
        this.todayCheckedIn.set(true);
      }
    } catch {
      this.currentStreak.set(1);
      this.maxStreak.set(1);
      this.todayCheckedIn.set(true);
    }

    const diagDone = this.auth.isDiagnosticCompleted(this.currentStudentEmail());
    this.diagnosticCompleted.set(diagDone);
    if (diagDone) {
      try {
        const res = this.auth.getDiagnosticResult(this.currentStudentEmail()) || JSON.parse(localStorage.getItem(userKeyDiagRes) || '{}');
        const levelTitle = res.levelTitle || res.assignedLevelTitle;
        if (levelTitle) {
          const mapped = {
            ...res,
            assignedLevelTitle: levelTitle,
            assignedLevelNumber: res.levelNumber || res.assignedLevelNumber || 1,
            recommendedSpecialty: res.recommendedSpecialty || 'Ingeniería de Software',
            recommendedPathTitle: res.recommendedPathTitle || 'Ruta de Fundamentos de Software',
            suggestedCourseSlug: res.primaryCourseSlug || res.suggestedCourseSlug || 'introduccion-programacion',
            suggestedCourseTitle: res.primaryCourseTitle || res.suggestedCourseTitle || 'Introducción a la Programación',
          };
          this.diagnosticResult.set(mapped);
          this.diagnosticFinished.set(true);
          this.currentRecommendation.set({
            pathTitle: mapped.recommendedPathTitle,
            pathSlug: mapped.suggestedCourseSlug,
            targetLevelName: mapped.assignedLevelTitle,
            milestoneOrder: 1,
            rationale: res.agentFeedback || `Byte IA ha evaluado tu perfil y estructurado tu temario de ingeniería personalizado.`,
            topicsToStudy: ['Fundamentos de Programación', 'Algoritmos y Lógica', 'Prácticas en Terminal'],
            suggestedCourseSlug: mapped.suggestedCourseSlug,
            suggestedCourseTitle: mapped.suggestedCourseTitle,
            matchScore: 96,
          });
        }
      } catch {}
    } else {
      this.diagnosticFinished.set(false);
      this.diagnosticResult.set({
        assignedLevelNumber: 1,
        assignedLevelTitle: 'Nivel 1: Cadete en Formación',
        recommendedSpecialty: 'Por definir (Prueba Diagnóstica Pendiente)',
        recommendedPathTitle: 'Ruta Inicial de Formación Técnica',
        suggestedCourseSlug: 'introduccion-programacion',
        suggestedCourseTitle: 'Introducción a la Programación',
        score: 0,
        agentFeedback: 'Presenta tu examen diagnóstico de 3 preguntas de lógica básica para calibrar tu nivel y definir tu ruta de aprendizaje.',
      });
      this.currentRecommendation.set({
        pathTitle: 'Evaluación y Calibración Diagnóstica',
        pathSlug: 'introduccion-programacion',
        targetLevelName: 'Nivel 1 (Diagnóstico Pendiente)',
        milestoneOrder: 1,
        rationale: 'Aún no has completado tu prueba diagnóstica. Preséntala en la pestaña "diagnostic" para que Byte Copilot calibre tus habilidades y recomiende tu primera ruta de formación técnica personalizada.',
        topicsToStudy: ['Variables y Asignaciones', 'Condicionales Lógicos (if/else)', 'Bucles y Acumuladores'],
        suggestedCourseSlug: 'introduccion-programacion',
        suggestedCourseTitle: 'Introducción a la Programación',
        matchScore: 98,
      });
    }

    try {
      const groupsRaw = localStorage.getItem(userKeyGroups);
      if (groupsRaw) {
        this.studyGroups.set(JSON.parse(groupsRaw));
      } else {
        this.studyGroups.update(groups => groups.map(g => ({ ...g, isMember: false })));
      }
    } catch {}
  }

  readonly currentAsciiAvatar = computed(() => {
    const pool = this.availableAsciiAvatars();
    const id = this.selectedAvatarId();
    return pool.find(a => a.id === id) || pool[0];
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
      const storageKey = this.isTeacher() ? 'syseng_selected_teacher_ascii_avatar' : 'syseng_selected_ascii_avatar';
      localStorage.setItem(storageKey, id);
      window.dispatchEvent(new CustomEvent('ascii-avatar:changed', { detail: { id, isTeacher: this.isTeacher() } }));
    }
    this.closeAvatarModal();
  }

  readonly streakMultiplier = computed(() => {
    const s = this.currentStreak();
    if (s >= 14) return 1.40;
    if (s >= 7)  return 1.25;
    if (s >= 3)  return 1.10;
    return 1.0;
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
      const data = {
        currentStreak: newStreak,
        maxStreak: this.maxStreak(),
        lastCheckIn: today,
      };
      if (this.isDemoStudent()) {
        localStorage.setItem('syseng_streak_data', JSON.stringify(data));
      } else {
        localStorage.setItem(this.getUserStorageKey('streak_data'), JSON.stringify(data));
      }
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
    if (this.diagnosticAnswers['q2'] === 'a') score++;
    if (this.diagnosticAnswers['q3'] === 'b') score++;

    const pref = this.diagnosticAnswers['q4'] || 'backend';

    let assignedLevel = 2;
    let assignedTitle = 'Nivel 2: Iniciación a la Programación';
    if (score === 3) {
      assignedLevel = 3;
      assignedTitle = 'Nivel 3: Desarrollador en Formación';
    } else if (score === 1 || score === 0) {
      assignedLevel = 1;
      assignedTitle = 'Nivel 1: Fundamentos de Lógica y Algoritmia';
    }

    let spec = 'Sistemas Backend & APIs';
    let pathTitle = 'Ruta de Desarrollo Backend & Arquitectura de APIs';
    let courseSlug = 'backend-introduccion';
    let courseTitle = 'Introducción al Backend & Arquitectura de Servidores';

    if (pref === 'algo') {
      spec = 'Pensamiento Computacional & Algoritmia';
      pathTitle = 'Ruta de Fundamentos de Algorítmica';
      courseSlug = 'algoritmos-ordenamiento';
      courseTitle = 'Algoritmos y Estructuras de Datos';
    } else if (pref === 'frontend') {
      spec = 'Arquitectura Frontend & UI Reactiva';
      pathTitle = 'Ruta de Desarrollo Frontend Moderno';
      courseSlug = 'introduccion-desarrollo-web';
      courseTitle = 'Introducción al Desarrollo Web';
    } else if (pref === 'fullstack') {
      spec = 'Ingeniería de Software FullStack';
      pathTitle = 'Ruta FullStack de Ingeniería de Software';
      courseSlug = 'introduccion-desarrollo-web';
      courseTitle = 'Fundamentos de Desarrollo Web y Sistemas';
    }

    const result = {
      assignedLevelNumber: assignedLevel,
      assignedLevelTitle: assignedTitle,
      recommendedSpecialty: spec,
      recommendedPathTitle: pathTitle,
      suggestedCourseSlug: courseSlug,
      suggestedCourseTitle: courseTitle,
      score: score,
      agentFeedback: `Byte Copilot ha evaluado tu razonamiento lógico (${score}/3 respuestas correctas). Asignamos tu perfil al ${assignedTitle} y te sugerimos iniciar con ${courseTitle}.`,
    };

    this.diagnosticResult.set(result);
    this.diagnosticFinished.set(true);
    this.diagnosticCompleted.set(true);

    this.currentRecommendation.set({
      pathTitle: pathTitle,
      pathSlug: courseSlug,
      targetLevelName: assignedTitle,
      milestoneOrder: 1,
      rationale: `Byte Copilot ha evaluado tu razonamiento lógico (${score}/3 respuestas correctas). Asignamos tu perfil al ${assignedTitle} y te sugerimos iniciar con ${courseTitle}.`,
      topicsToStudy: ['Variables y Flujos', 'Algoritmos y Estructuras', 'Proyectos Prácticos'],
      suggestedCourseSlug: courseSlug,
      suggestedCourseTitle: courseTitle,
      matchScore: 95,
    });

    if (typeof window !== 'undefined') {
      const email = this.currentStudentEmail();
      if (this.isDemoStudent()) {
        localStorage.setItem('syseng_diagnostic_completed', 'true');
        localStorage.setItem('syseng_diagnostic_result', JSON.stringify(result));
      } else {
        localStorage.setItem(this.getUserStorageKey('diagnostic_completed'), 'true');
        localStorage.setItem(this.getUserStorageKey('diagnostic_result'), JSON.stringify(result));
      }

      // Asignar el curso inicial recomendado automáticamente a las inscripciones del usuario
      const starterEnrollment: Enrollment = {
        id: Date.now(),
        user_id: this.auth.user()?.id || Date.now(),
        course_id: 1,
        enrolled_at: new Date().toISOString(),
        completed_at: undefined,
        progress_percent: 0,
        course: {
          id: 1,
          title: courseTitle,
          slug: courseSlug,
          description: 'Ruta inicial asignada según tu evaluación diagnóstica de lógica y preferencias.',
          duration_hours: 12,
          difficulty: 'beginner',
          is_free: true,
          category: { id: 1, name: 'Fundamentos', slug: 'programacion-basica' },
        } as any,
      };

      this.enrollments.set([starterEnrollment]);
      const enrKey = 'syseng_user_enrollments_' + email;
      localStorage.setItem(enrKey, JSON.stringify([starterEnrollment]));

      // Sincronizar en tiempo real el progreso de la actividad con el Panel Docente
      try {
        const currentUser = this.auth.user();
        if (currentUser?.email) {
          const cache = JSON.parse(localStorage.getItem('syseng_teacher_students_cache') || '[]');
          const idx = cache.findIndex((s: any) => s.email?.toLowerCase() === currentUser.email.toLowerCase());
          const quizPct = Math.round((score / 3) * 100);
          if (idx >= 0) {
            cache[idx].quizzes_taken_count = Math.max(cache[idx].quizzes_taken_count || 0, 1);
            cache[idx].average_quiz_score = quizPct;
            cache[idx].completed_lessons_count = Math.max(cache[idx].completed_lessons_count || 0, 1);
            cache[idx].courses = [{ id: 1, title: courseTitle, progress_percent: 10 }];
          }
          localStorage.setItem('syseng_teacher_students_cache', JSON.stringify(cache));
          window.dispatchEvent(new CustomEvent('teacher:students-updated', { detail: currentUser }));
        }
      } catch {}
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
    return mine ? `${mine.tag} ${mine.name}` : 'Sin clan asignado (Explorador Independiente)';
  });

  openCreateGuildModal() {
    this.newGuildName.set('');
    this.newGuildTag.set('');
    this.newGuildCategory.set('systems');
    this.newGuildDescription.set('');
    this.guildActionError.set(null);
    this.showCreateGuildModal.set(true);
  }

  closeCreateGuildModal() {
    this.showCreateGuildModal.set(false);
  }

  createGuild() {
    const name = this.newGuildName().trim();
    const rawTag = this.newGuildTag().trim().toUpperCase();
    const desc = this.newGuildDescription().trim();

    if (!name || !rawTag || !desc) {
      this.guildActionError.set('Por favor completa todos los campos del clan.');
      return;
    }

    const tag = rawTag.startsWith('[') ? rawTag : `[${rawTag}]`;
    const newId = 'clan_' + Date.now();
    const currentUser = this.auth.user();

    const createdGuild: StudyGroup = {
      id: newId,
      name,
      tag,
      category: this.newGuildCategory() as any,
      description: desc,
      membersCount: 1,
      streakDays: 1,
      weeklyChallenge: {
        title: `Reto Fundacional de ${name}: Resolver 3 retos de código`,
        xpReward: 350,
        completed: false,
      },
      recentLogs: [
        {
          author: `${currentUser?.name || 'Tú'} (Lvl ${this.userLevel()})`,
          message: 'Fundó el clan y convocó a nuevos miembros.',
          timeAgo: 'hace un momento',
        },
      ],
      isMember: true,
    };

    // Cambiar membresía al nuevo clan
    this.studyGroups.update(groups => [
      createdGuild,
      ...groups.map(g => ({ ...g, isMember: false })),
    ]);

    this.saveStudyGroups();
    this.showCreateGuildModal.set(false);
  }

  joinGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g => {
        if (g.id === id) {
          return {
            ...g,
            isMember: true,
            membersCount: g.membersCount + 1,
            recentLogs: [
              {
                author: `${this.auth.user()?.name || 'Tú'} (Lvl ${this.userLevel()})`,
                message: 'Se unió al clan de estudio.',
                timeAgo: 'hace un momento',
              },
              ...(g.recentLogs || []),
            ].slice(0, 4),
          };
        }
        if (g.isMember) {
          return {
            ...g,
            isMember: false,
            membersCount: Math.max(1, g.membersCount - 1),
          };
        }
        return g;
      })
    );
    this.saveStudyGroups();
  }

  leaveGuild(id: string) {
    this.studyGroups.update(groups =>
      groups.map(g =>
        g.id === id
          ? { ...g, isMember: false, membersCount: Math.max(1, g.membersCount - 1) }
          : g
      )
    );
    this.saveStudyGroups();
  }

  private saveStudyGroups() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.getUserStorageKey('study_groups'), JSON.stringify(this.studyGroups()));
    }
  }

  completedCount(): number {
    return this.enrollments().filter(e => e.completed_at !== null || e.progress_percent === 100).length;
  }

  readonly solvedChallengesCount = computed(() => {
    if (this.isDemoStudent()) return 8;
    let count = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(this.getUserStorageKey('solved_challenges')) || '[]');
        if (Array.isArray(stored)) count += stored.length;
      } catch {}
    }
    return count;
  });

  readonly totalXp = computed(() => {
    if (this.isDemoStudent()) return 1685;

    const fromChallenges = this.solvedChallengesCount() * 50;
    const fromCourses = this.completedCount() * 150;
    const fromEnrollments = this.enrollments().length * 30;
    const diagBonus = this.diagnosticCompleted() ? 100 : 0;
    const streakBonus = Math.max(0, this.currentStreak() - 1) * 25;
    const welcomeBonus = 50;

    return welcomeBonus + fromChallenges + fromCourses + fromEnrollments + diagBonus + streakBonus;
  });

  readonly userLevel = computed(() => {
    if (this.isDemoStudent()) return 17;
    if (this.diagnosticCompleted()) {
      return this.diagnosticResult().assignedLevelNumber || 2;
    }
    return 1;
  });

  readonly xpProgressPercent = computed(() => {
    if (this.isDemoStudent()) return 85;
    return this.totalXp() % 100;
  });

  readonly xpToNextLevel = computed(() => {
    if (this.isDemoStudent()) return 15;
    return 100 - (this.totalXp() % 100);
  });

  readonly rankTitle = computed(() => {
    if (this.isDemoStudent()) return 'Arquitecto Principal de Sistemas';
    const lvl = this.userLevel();
    if (!this.diagnosticCompleted()) return 'Cadete de Sistemas (Nivel 1)';
    if (lvl >= 7)  return 'Ingeniero de Sistemas Semi-Senior';
    if (lvl >= 4)  return 'Desarrollador Junior Avanzado';
    if (lvl >= 3)  return 'Desarrollador en Formación';
    if (lvl >= 2)  return 'Iniciación a la Programación';
    return 'Cadete de Sistemas (Iniciación)';
  });

  readonly specialization = computed(() => {
    if (this.isDemoStudent()) {
      return { title: 'Sistemas Backend & APIs Distribuidas', icon: '⚙️' };
    }
    if (this.diagnosticCompleted()) {
      const spec = this.diagnosticResult().recommendedSpecialty || 'Fundamentos de Programación';
      let icon = '🚀';
      const s = spec.toLowerCase();
      if (s.includes('backend') || s.includes('servidor')) icon = '⚙️';
      else if (s.includes('frontend') || s.includes('web')) icon = '🎨';
      else if (s.includes('algo') || s.includes('lógica')) icon = '🧩';
      return { title: spec, icon };
    }
    return { title: 'Por definir (Prueba Diagnóstica Pendiente)', icon: '📝' };
  });

  myRank(): number {
    if (this.isDemoStudent()) return 3;
    return this.diagnosticCompleted() ? 4 : 8;
  }

  readonly badges = computed<AchievementBadge[]>(() => {
    if (this.isDemoStudent()) {
      return [
        {
          id: 'welcome_cadet',
          title: 'Bienvenido a la Academia',
          category: 'special',
          icon: '🎓',
          description: 'Creaste y activaste tu cuenta de estudiante.',
          requirement: 'Cuenta verificada',
          targetCount: 1,
          currentCount: 1,
          progressPercent: 100,
          unlocked: true,
          level: 'bronze',
          shaFingerprint: 'sha256:01a9b2c3d4e5f6',
        },
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
      ];
    }

    const hasDiag = this.diagnosticCompleted();
    const challenges = this.solvedChallengesCount();
    const streak = this.currentStreak();

    return [
      {
        id: 'welcome_cadet',
        title: 'Bienvenido a la Academia',
        category: 'special',
        icon: '🎓',
        description: 'Creaste y activaste tu cuenta de estudiante en SysEng.',
        requirement: 'Registro y activación',
        targetCount: 1,
        currentCount: 1,
        progressPercent: 100,
        unlocked: true,
        level: 'bronze',
        shaFingerprint: 'sha256:01a9b2c3d4e5f6',
      },
      {
        id: 'diagnostic_done',
        title: 'Calibración de Nivel',
        category: 'special',
        icon: '⚡',
        description: 'Completaste la prueba diagnóstica y definiste tu ruta inicial.',
        requirement: 'Completar examen inicial',
        targetCount: 1,
        currentCount: hasDiag ? 1 : 0,
        progressPercent: hasDiag ? 100 : 0,
        unlocked: hasDiag,
        level: 'silver',
        shaFingerprint: 'sha256:c7d8e9f0a1b2c3',
      },
      {
        id: 'challenge_1',
        title: 'Primer Algoritmo CLI',
        category: 'challenges',
        icon: '🥉',
        description: 'Compilaste tu primer reto interactivo en la terminal.',
        requirement: 'Resuelve 1 reto',
        targetCount: 1,
        currentCount: challenges >= 1 ? 1 : 0,
        progressPercent: Math.min(100, challenges * 100),
        unlocked: challenges >= 1,
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
        currentCount: streak,
        progressPercent: Math.min(100, Math.round((streak / 5) * 100)),
        unlocked: streak >= 5,
        level: 'silver',
        shaFingerprint: 'sha256:f5e4d3c2b1a09876',
      },
    ];
  });

  readonly unlockedBadgesCount = computed(() => this.badges().filter(b => b.unlocked).length);
  readonly filteredBadges = computed(() => this.badges());

  readonly leaderboard = computed<LeaderboardEntry[]>(() => {
    const user = this.auth.user();
    const isDemo = this.isDemoStudent();
    const score = this.diagnosticCompleted() ? Math.round((this.diagnosticResult().score / 3) * 100) : 0;
    const lessons = this.completedCount();

    if (isDemo) {
      return [
        { rank: 1, name: 'Mateo Silva', email: 'mateo.silva@alumnos.syseng.edu', avatarText: 'MS', level: 16, rankTitle: 'Arquitecto Principal', specialization: 'Especialista en Algoritmos', completedLessons: 14, avgQuizScore: 96.0, xp: 1520, isCurrentUser: false, badgePill: '🥇 ORO' },
        { rank: 2, name: 'Carlos Prueba', email: 'carlos_test_1790540376@gmail.com', avatarText: 'CP', level: 12, rankTitle: 'Líder Técnico', specialization: 'Arquitecto FullStack', completedLessons: 11, avgQuizScore: 88.0, xp: 1180, isCurrentUser: false, badgePill: '🥈 PLATA' },
        { rank: 3, name: user?.name || 'Ana Estudiante (Demo)', email: user?.email || 'estudiante@sysengacademy.dev', avatarText: 'AE', level: 17, rankTitle: 'Arquitecto Principal de Sistemas', specialization: 'Sistemas Backend & APIs Distribuidas', completedLessons: 9, avgQuizScore: 91.7, xp: 1685, isCurrentUser: true, badgePill: '🥉 BRONCE' },
      ];
    }

    return [
      { rank: 1, name: 'Mateo Silva', email: 'mateo.silva@alumnos.syseng.edu', avatarText: 'MS', level: 16, rankTitle: 'Arquitecto Principal', specialization: 'Especialista en Algoritmos', completedLessons: 14, avgQuizScore: 96.0, xp: 1520, isCurrentUser: false, badgePill: '🥇 ORO' },
      { rank: 2, name: 'Carlos Prueba', email: 'carlos_test_1790540376@gmail.com', avatarText: 'CP', level: 12, rankTitle: 'Líder Técnico', specialization: 'Arquitecto FullStack', completedLessons: 11, avgQuizScore: 88.0, xp: 1180, isCurrentUser: false, badgePill: '🥈 PLATA' },
      { rank: 3, name: 'Valeria Silva', email: 'valeria.silva@universidad.edu.co', avatarText: 'VS', level: 3, rankTitle: 'Desarrolladora en Formación', specialization: 'Fundamentos de Algorítmica', completedLessons: 2, avgQuizScore: 100.0, xp: 350, isCurrentUser: false, badgePill: '🥉 BRONCE' },
      {
        rank: this.myRank(),
        name: user?.name || 'Estudiante',
        email: user?.email || '',
        avatarText: (user?.name || 'ES').slice(0, 2).toUpperCase(),
        level: this.userLevel(),
        rankTitle: this.rankTitle(),
        specialization: this.specialization().title,
        completedLessons: lessons,
        avgQuizScore: score,
        xp: this.totalXp(),
        isCurrentUser: true,
        badgePill: this.diagnosticCompleted() ? '⚡ ACTIVO' : '🆕 NUEVO',
      },
    ];
  });

  emoji(enr: Enrollment): string {
    return '📚';
  }
}
