import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  TeacherOverviewResponse,
  TeacherService,
  TeacherStudent,
  TeacherStudentDetail,
  TeacherActivity,
  QuizQuestion,
} from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="teacher-page">
      <!-- HEADER CONSOLA DOCENTE -->
      <header class="teacher-header">
        <div class="container header-container">
          <div class="header-left">
            <div class="role-badge">
              <span class="pulse-dot"></span>
              <span>🎓 PANEL DOCENTE & CÁTEDRA</span>
            </div>
            <h1 class="header-title">Consola de Gestión y Creación Académica</h1>
            <p class="header-subtitle">
              Profesor <strong>{{ auth.user()?.name || 'Andrés' }}</strong> · Supervisa el progreso del alumnado, diseña nuevos retos evaluativos y potencia tus cursos con Byte IA.
            </p>
          </div>
          
          <div class="header-actions">
            <button type="button" class="btn btn-outline" (click)="loadAllData()" [disabled]="loading()">
              <span class="btn-icon">{{ loading() ? '⏳' : '🔄' }}</span>
              <span>Sincronizar Datos</span>
            </button>
            <button type="button" class="btn btn-primary" (click)="openCreateModal('challenge')">
              <span>➕ Crear Reto Práctico</span>
            </button>
            <button type="button" class="btn btn-accent" (click)="openCreateModal('quiz')">
              <span>📝 Crear Quiz</span>
            </button>
          </div>
        </div>
      </header>

      <div class="container main-content">
        <!-- KPI METRICS SUMMARY -->
        @if (overview()) {
          <div class="kpi-grid">
            <div class="kpi-card kpi-cyan">
              <div class="kpi-header">
                <span class="kpi-icon">👥</span>
                <span class="kpi-pill">Estudiantes</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">{{ overview()!.stats.total_students }}</span>
                <span class="kpi-label">Alumnos activos en plataforma</span>
              </div>
            </div>

            <div class="kpi-card kpi-purple">
              <div class="kpi-header">
                <span class="kpi-icon">📝</span>
                <span class="kpi-pill">Cátedra</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">{{ activities().length }}</span>
                <span class="kpi-label">Actividades & Quizzes creados</span>
              </div>
            </div>

            <div class="kpi-card kpi-green">
              <div class="kpi-header">
                <span class="kpi-icon">✅</span>
                <span class="kpi-pill">Entregas</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">{{ overview()!.stats.total_completions }}</span>
                <span class="kpi-label">Lecciones y retos superados</span>
              </div>
            </div>

            <div class="kpi-card kpi-amber">
              <div class="kpi-header">
                <span class="kpi-icon">🎯</span>
                <span class="kpi-pill">Evaluación</span>
              </div>
              <div class="kpi-body">
                <span class="kpi-value">{{ overview()!.stats.average_score }}%</span>
                <span class="kpi-label">Promedio general de cohorte</span>
              </div>
            </div>
          </div>
        }

        <!-- PANELES DE NAVEGACIÓN -->
        <nav class="dashboard-nav" aria-label="Secciones del panel docente">
          <button
            type="button"
            class="nav-tab-btn"
            [class.is-active]="activeTab() === 'students'"
            (click)="setTab('students')"
          >
            <span class="tab-icon">👥</span>
            <span>Directorio de Estudiantes</span>
            <span class="tab-badge">{{ filteredStudents().length }}</span>
          </button>

          <button
            type="button"
            class="nav-tab-btn"
            [class.is-active]="activeTab() === 'activities'"
            (click)="setTab('activities')"
          >
            <span class="tab-icon">📝</span>
            <span>Gestor de Actividades & Quizzes</span>
            <span class="tab-badge">{{ activities().length }}</span>
          </button>

          <button
            type="button"
            class="nav-tab-btn"
            [class.is-active]="activeTab() === 'activity'"
            (click)="setTab('activity')"
          >
            <span class="tab-icon">📊</span>
            <span>Rendimiento & Métricas</span>
          </button>

          <button
            type="button"
            class="nav-tab-btn nav-tab-ai"
            [class.is-active]="activeTab() === 'ai'"
            (click)="setTab('ai')"
          >
            <span class="tab-icon">🤖</span>
            <span>Byte Asistente Docente IA</span>
            <span class="tab-badge pulse-badge">IA</span>
          </button>
        </nav>

        <!-- SECCIÓN 1: DIRECTORIO DE ESTUDIANTES -->
        @if (activeTab() === 'students') {
          <div class="panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <h2 class="panel-title">👥 Directorio y Seguimiento del Alumnado</h2>
                <p class="panel-desc">Visualiza expedientes, progreso en tiempo real y gestiona accesos de estudiantes.</p>
              </div>

              <!-- Search & Filter Controls -->
              <div class="toolbar-controls">
                <div class="search-input-wrap">
                  <span class="search-icon">🔍</span>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="Buscar estudiante por nombre o correo..."
                    [ngModel]="searchQuery()"
                    (ngModelChange)="onSearchChange($event)"
                  />
                  @if (searchQuery()) {
                    <button type="button" class="btn-clear" (click)="onSearchChange('')">✕</button>
                  }
                </div>

                <div class="filter-group">
                  <button
                    type="button"
                    class="filter-btn"
                    [class.active]="statusFilter() === 'all'"
                    (click)="statusFilter.set('all')"
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    class="filter-btn"
                    [class.active]="statusFilter() === 'verified'"
                    (click)="statusFilter.set('verified')"
                  >
                    Verificados
                  </button>
                  <button
                    type="button"
                    class="filter-btn"
                    [class.active]="statusFilter() === 'unverified'"
                    (click)="statusFilter.set('unverified')"
                  >
                    Pendientes
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla de Estudiantes -->
            @if (loading()) {
              <div class="loading-box">
                <div class="spinner"></div>
                <p>Cargando información académica de los estudiantes…</p>
              </div>
            } @else if (filteredStudents().length === 0) {
              <div class="empty-box">
                <span class="empty-emoji">👥</span>
                <h3>No se encontraron estudiantes</h3>
                <p class="text-muted">Ajusta los términos de búsqueda o filtros para encontrar estudiantes registrados.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="academic-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Estado Cuenta</th>
                      <th>Cursos Matriculados</th>
                      <th>Lecciones</th>
                      <th>Promedio Quizzes</th>
                      <th>Registro</th>
                      <th class="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (st of filteredStudents(); track st.id) {
                      <tr>
                        <td>
                          <div class="student-cell">
                            <div class="avatar-badge">{{ getInitials(st.name) }}</div>
                            <div class="student-meta">
                              <span class="student-name">{{ st.name }}</span>
                              <span class="student-email">{{ st.email }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          @if (st.email_verified) {
                            <span class="status-pill status-verified">✓ Verificado</span>
                          } @else {
                            <span class="status-pill status-pending">⏳ Pendiente</span>
                          }
                        </td>
                        <td>
                          <div class="courses-cell">
                            <span class="courses-count">{{ st.enrollments_count }} cursos</span>
                            @if (st.courses.length > 0) {
                              <small class="courses-snippet">{{ st.courses[0].title }}</small>
                            }
                          </div>
                        </td>
                        <td>
                          <span class="lessons-count">{{ st.completed_lessons_count }} completadas</span>
                        </td>
                        <td>
                          @if (st.average_quiz_score !== null) {
                            <div class="score-badge" [class.score-high]="st.average_quiz_score >= 80" [class.score-mid]="st.average_quiz_score < 80 && st.average_quiz_score >= 60" [class.score-low]="st.average_quiz_score < 60">
                              {{ st.average_quiz_score }}% ({{ st.quizzes_taken_count }})
                            </div>
                          } @else {
                            <span class="text-muted">Sin evaluaciones</span>
                          }
                        </td>
                        <td>
                          <span class="date-text">{{ formatDate(st.created_at) }}</span>
                        </td>
                        <td>
                          <div class="actions-cell">
                            <button
                              type="button"
                              class="btn-row-action btn-view"
                              (click)="viewStudentDossier(st.id)"
                              title="Ver expediente académico completo"
                            >
                              👁️ Ver
                            </button>
                            @if (!st.email_verified) {
                              <button
                                type="button"
                                class="btn-row-action btn-activate"
                                (click)="verifyStudentAccount(st)"
                                title="Verificar correo manualmente"
                              >
                                ✓ Activar
                              </button>
                            }
                            <button
                              type="button"
                              class="btn-row-action btn-delete"
                              (click)="deleteStudentAccount(st)"
                              title="Eliminar cuenta de estudiante"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- SECCIÓN 2: GESTOR DE ACTIVIDADES & QUIZZES -->
        @if (activeTab() === 'activities') {
          <div class="panel-card">
            <div class="panel-header">
              <div class="panel-title-wrap">
                <h2 class="panel-title">📝 Gestor de Actividades Prácticas y Quizzes</h2>
                <p class="panel-desc">Crea y asigna ejercicios interactivos de terminal, retos de código y evaluaciones de opción múltiple.</p>
              </div>

              <div class="header-action-group">
                <button type="button" class="btn btn-primary" (click)="openCreateModal('challenge')">
                  <span>➕ Nuevo Reto de Código</span>
                </button>
                <button type="button" class="btn btn-accent" (click)="openCreateModal('quiz')">
                  <span>📝 Nuevo Quiz</span>
                </button>
                <button type="button" class="btn btn-outline" (click)="setTab('ai')">
                  <span>🤖 Generar con IA</span>
                </button>
              </div>
            </div>

            <!-- Filtro de Tipo de Actividad -->
            <div class="activity-filter-bar">
              <div class="filter-group">
                <button
                  type="button"
                  class="filter-btn"
                  [class.active]="activityTypeFilter() === 'all'"
                  (click)="activityTypeFilter.set('all')"
                >
                  Todas ({{ activities().length }})
                </button>
                <button
                  type="button"
                  class="filter-btn"
                  [class.active]="activityTypeFilter() === 'challenge'"
                  (click)="activityTypeFilter.set('challenge')"
                >
                  Retos de Código
                </button>
                <button
                  type="button"
                  class="filter-btn"
                  [class.active]="activityTypeFilter() === 'quiz'"
                  (click)="activityTypeFilter.set('quiz')"
                >
                  Quizzes Evaluativos
                </button>
                <button
                  type="button"
                  class="filter-btn"
                  [class.active]="activityTypeFilter() === 'terminal'"
                  (click)="activityTypeFilter.set('terminal')"
                >
                  Terminal & Linux
                </button>
              </div>
            </div>

            <!-- Grid de Actividades -->
            <div class="activities-grid">
              @for (act of filteredActivities(); track act.id) {
                <div class="activity-card" [class.card-quiz]="act.type === 'quiz'" [class.card-challenge]="act.type === 'challenge'">
                  <div class="act-card-head">
                    <div class="act-badges">
                      <span class="act-type-pill" [class.pill-quiz]="act.type === 'quiz'" [class.pill-challenge]="act.type === 'challenge'" [class.pill-terminal]="act.type === 'terminal'">
                        {{ act.type === 'quiz' ? '📝 Quiz' : act.type === 'terminal' ? '💻 Terminal' : '⚡ Reto Código' }}
                      </span>
                      <span class="act-diff-pill">{{ act.difficulty }}</span>
                    </div>
                    <span class="act-xp-pill">+{{ act.xp_reward }} XP</span>
                  </div>

                  <h3 class="act-card-title">{{ act.title }}</h3>
                  <p class="act-course-tag">📚 {{ act.course_name }}</p>
                  <p class="act-card-desc">{{ act.description }}</p>

                  @if (act.quiz_questions && act.quiz_questions.length > 0) {
                    <div class="act-quiz-preview">
                      <span class="quiz-q-count">❓ {{ act.quiz_questions.length }} preguntas evaluativas</span>
                      <ul class="quiz-sample-list">
                        @for (q of act.quiz_questions.slice(0, 2); track q.question) {
                          <li>• {{ q.question }}</li>
                        }
                      </ul>
                    </div>
                  }

                  @if (act.expected_output) {
                    <div class="act-terminal-preview">
                      <span class="term-lbl">Output esperado:</span>
                      <code>{{ act.expected_output }}</code>
                    </div>
                  }

                  <div class="act-card-footer">
                    <div class="act-meta">
                      <span>👤 {{ act.author_name }}</span>
                      <span>• 👥 {{ act.submissions_count }} entregas</span>
                      <span>• 🎯 {{ act.pass_rate }}% éxito</span>
                    </div>

                    <div class="act-actions">
                      <button type="button" class="btn-icon-danger" (click)="deleteActivity(act.id)" title="Eliminar actividad">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- SECCIÓN 3: RENDIMIENTO & MÉTRICAS -->
        @if (activeTab() === 'activity' && overview()) {
          <div class="metrics-grid">
            <!-- Timeline de Actividad Reciente -->
            <div class="panel-card timeline-card">
              <div class="panel-header">
                <div>
                  <h2 class="panel-title">⚡ Resoluciones de Estudiantes en Tiempo Real</h2>
                  <p class="panel-desc">Monitoreo continuo de lecciones, quizzes y retos resueltos.</p>
                </div>
              </div>

              @if (overview()!.recent_activity.length === 0) {
                <div class="empty-box">
                  <p class="text-muted">No se registran actividades recientes en este momento.</p>
                </div>
              } @else {
                <div class="timeline-stream">
                  @for (act of overview()!.recent_activity; track act.id) {
                    <div class="stream-item">
                      <div class="stream-dot" [class.dot-pass]="act.passed" [class.dot-fail]="!act.passed">
                        {{ act.passed ? '✓' : '✗' }}
                      </div>
                      <div class="stream-content">
                        <div class="stream-header">
                          <span class="stream-user">{{ act.user_name }}</span>
                          <span class="stream-time">{{ formatTime(act.completed_at) }}</span>
                        </div>
                        <div class="stream-body">
                          <span>Completó <em>{{ act.lesson_title }}</em></span>
                          @if (act.score !== null) {
                            <span class="stream-score" [class.score-ok]="act.passed" [class.score-bad]="!act.passed">
                              Nota: {{ act.score }}%
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Cursos con Mayor Demanda & Retención -->
            <div class="panel-card demand-card">
              <div class="panel-header">
                <div>
                  <h2 class="panel-title">🔥 Demanda y Retención de Cursos</h2>
                  <p class="panel-desc">Estudiantes activos matriculados por asignatura.</p>
                </div>
              </div>

              <div class="demand-list">
                @for (c of overview()!.popular_courses; track c.id) {
                  <div class="demand-item">
                    <div class="demand-info">
                      <span class="demand-name">{{ c.title }}</span>
                      <span class="demand-diff">{{ c.difficulty }}</span>
                    </div>
                    <div class="demand-stat">
                      <span class="demand-count">{{ c.enrollments_count }} estudiantes</span>
                      <div class="demand-bar-bg">
                        <div class="demand-bar-fill" [style.width.%]="(c.enrollments_count / 1500) * 100"></div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- SECCIÓN 4: BYTE ASISTENTE DOCENTE IA -->
        @if (activeTab() === 'ai') {
          <div class="ai-panel">
            <!-- Header Byte Docente -->
            <div class="ai-copilot-banner">
              <div class="ai-banner-content">
                <div class="ai-badge">
                  <span class="sparkle">✨</span>
                  <span>BYTE TEACHER COPILOT v2.5</span>
                </div>
                <h2>Generador Asistido de Quizzes y Diagnóstico Pedagógico</h2>
                <p>
                  Aprovecha el modelo pedagógico de SysEngAcademy para redactar evaluaciones rigurosas en segundos o generar intervenciones personalizadas para alumnos con dificultades.
                </p>
              </div>
              <div class="ai-bot-avatar">🤖</div>
            </div>

            <div class="ai-workspace-grid">
              <!-- Creador Asistido de Quizzes con IA -->
              <div class="panel-card ai-generator-card">
                <div class="panel-header">
                  <div>
                    <h3 class="panel-title">⚡ Generar Evaluación Técnica con IA</h3>
                    <p class="panel-desc">Escribe un tema de ingeniería y la IA redactará preguntas técnicas con opciones y justificación.</p>
                  </div>
                </div>

                <div class="ai-form">
                  <div class="form-group">
                    <label class="form-label">Tema o Tecnología</label>
                    <div class="topic-presets">
                      <button type="button" class="preset-pill" (click)="aiTopic.set('Docker y Contenedores')">Docker</button>
                      <button type="button" class="preset-pill" (click)="aiTopic.set('Linux Shell y Bash')">Linux / Bash</button>
                      <button type="button" class="preset-pill" (click)="aiTopic.set('Git y Control de Versiones')">Git</button>
                      <button type="button" class="preset-pill" (click)="aiTopic.set('Punteros y Memoria en C')">Punteros C</button>
                      <button type="button" class="preset-pill" (click)="aiTopic.set('SQL y Consultas Avanzadas')">SQL Relacional</button>
                    </div>
                    <input
                      type="text"
                      class="form-input"
                      placeholder="Ej. Concurrencia en Go, Algoritmos de Grafos..."
                      [ngModel]="aiTopic()"
                      (ngModelChange)="aiTopic.set($event)"
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Nivel de Dificultad</label>
                      <select class="form-select" [ngModel]="aiDifficulty()" (ngModelChange)="aiDifficulty.set($event)">
                        <option value="Principiante">Principiante</option>
                        <option value="Intermedio">Intermedio</option>
                        <option value="Avanzado">Avanzado</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label class="form-label">Curso Destino</label>
                      <select class="form-select" [ngModel]="aiTargetCourse()" (ngModelChange)="aiTargetCourse.set($event)">
                        <option value="Introducción a la Programación">Introducción a la Programación</option>
                        <option value="Estructuras de Datos y Algoritmos">Estructuras de Datos y Algoritmos</option>
                        <option value="Sistemas Operativos y Linux">Sistemas Operativos y Linux</option>
                        <option value="Bases de Datos Relacionales">Bases de Datos Relacionales</option>
                        <option value="Arquitectura de Software">Arquitectura de Software</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="btn btn-primary btn-generate"
                    (click)="generateQuizWithAi()"
                    [disabled]="aiGenerating() || !aiTopic().trim()"
                  >
                    <span>{{ aiGenerating() ? '⏳ Generando Preguntas con Byte IA…' : '✨ Generar Quiz Técnico' }}</span>
                  </button>
                </div>

                <!-- Preview de Preguntas Generadas -->
                @if (aiGeneratedQuestions().length > 0) {
                  <div class="ai-generated-results">
                    <div class="results-header">
                      <h4>📋 Preguntas Generadas para: <em>{{ aiTopic() }}</em></h4>
                      <button type="button" class="btn btn-accent btn-sm" (click)="saveAiQuizToActivities()">
                        💾 Guardar como Actividad de Cátedra
                      </button>
                    </div>

                    <div class="questions-list">
                      @for (q of aiGeneratedQuestions(); track q.question; let idx = $index) {
                        <div class="q-item">
                          <span class="q-number">Pregunta #{{ idx + 1 }}</span>
                          <p class="q-text">{{ q.question }}</p>
                          <div class="q-options">
                            @for (opt of q.options; track opt; let optIdx = $index) {
                              <div class="q-opt" [class.q-correct]="optIdx === q.correct_index">
                                <span class="opt-letter">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                                <span>{{ opt }}</span>
                                @if (optIdx === q.correct_index) {
                                  <span class="correct-badge">✓ Correcta</span>
                                }
                              </div>
                            }
                          </div>
                          <div class="q-explanation">
                            💡 <strong>Justificación Técnica:</strong> {{ q.explanation }}
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Diagnóstico Pedagógico de Alumnos en Riesgo -->
              <div class="panel-card ai-cohort-card">
                <div class="panel-header">
                  <div>
                    <h3 class="panel-title">🎯 Diagnóstico Pedagógico de Cohorte</h3>
                    <p class="panel-desc">Estudiantes que requieren refuerzo o tutoría activa según su promedio evaluativo.</p>
                  </div>
                </div>

                <div class="at-risk-list">
                  <div class="risk-item">
                    <div class="risk-user">
                      <div class="risk-avatar">LR</div>
                      <div>
                        <strong>Lucas Ramírez</strong>
                        <small>lucas.ramirez@code.org</small>
                      </div>
                    </div>
                    <div class="risk-badge">Promedio: 85.5% · Email Pendiente</div>
                    <p class="risk-advice">
                      Byte recomienda: Enviar recordatorio de activación de credenciales y asignar el reto de automatización en Bash para consolidar conceptos de Linux.
                    </p>
                  </div>

                  <div class="risk-item">
                    <div class="risk-user">
                      <div class="risk-avatar">SH</div>
                      <div>
                        <strong>Sofía Herrera</strong>
                        <small>sofia.herrera@tech.dev</small>
                      </div>
                    </div>
                    <div class="risk-badge">Promedio: 82% · 1 Curso Activo</div>
                    <p class="risk-advice">
                      Byte recomienda: Buen ritmo en JavaScript pero bajo volumen de entregas prácticas. Sugerirle unirse a un grupo de estudio de estructuras de datos.
                    </p>
                  </div>
                </div>

                <div class="ai-assistant-chat-box">
                  <h4>💬 Consulta Directa a Byte Copilot Docente</h4>
                  <div class="mini-chat-bubble">
                    <strong>Byte:</strong> "Profesor, ¿deseas que prepare una rúbrica de evaluación para la entrega de proyectos finales o prefieres generar un simulador de parcial?"
                  </div>
                  <div class="chat-input-row">
                    <input type="text" class="chat-input" placeholder="Pregunta algo sobre diseño curricular o actividades…" />
                    <button type="button" class="btn btn-primary btn-sm">Enviar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- MODAL CREACIÓN DE ACTIVIDAD / QUIZ -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()" role="dialog" aria-modal="true">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <span class="modal-badge">{{ modalType() === 'quiz' ? '📝 EVALUACIÓN' : '⚡ RETO PRÁCTICO' }}</span>
                <h3 class="modal-title">
                  {{ modalType() === 'quiz' ? 'Crear Nuevo Quiz Evaluativo' : 'Crear Reto Práctico / CLI' }}
                </h3>
              </div>
              <button type="button" class="modal-close" (click)="closeCreateModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Título de la Actividad *</label>
                <input
                  type="text"
                  class="form-input"
                  placeholder="Ej. Implementación de Cola con Prioridad en C++"
                  [ngModel]="newActivityTitle()"
                  (ngModelChange)="newActivityTitle.set($event)"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Curso de Cátedra *</label>
                  <select class="form-select" [ngModel]="newActivityCourse()" (ngModelChange)="newActivityCourse.set($event)">
                    <option value="Introducción a la Programación">Introducción a la Programación</option>
                    <option value="Estructuras de Datos y Algoritmos">Estructuras de Datos y Algoritmos</option>
                    <option value="Sistemas Operativos y Linux">Sistemas Operativos y Linux</option>
                    <option value="Bases de Datos Relacionales">Bases de Datos Relacionales</option>
                    <option value="Arquitectura de Software">Arquitectura de Software</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Dificultad</label>
                  <select class="form-select" [ngModel]="newActivityDifficulty()" (ngModelChange)="newActivityDifficulty.set($event)">
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Recompensa XP</label>
                  <input
                    type="number"
                    class="form-input"
                    [ngModel]="newActivityXp()"
                    (ngModelChange)="newActivityXp.set($event)"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descripción Pedagógica / Enunciado *</label>
                <textarea
                  class="form-textarea"
                  rows="3"
                  placeholder="Describe el reto, objetivos y especificaciones técnicas..."
                  [ngModel]="newActivityDescription()"
                  (ngModelChange)="newActivityDescription.set($event)"
                ></textarea>
              </div>

              <!-- Campos específicos para Reto Práctico -->
              @if (modalType() === 'challenge') {
                <div class="form-group">
                  <label class="form-label">Código Inicial Starter (opcional)</label>
                  <textarea
                    class="form-textarea code-font"
                    rows="3"
                    placeholder="// Código base con el que iniciará el estudiante..."
                    [ngModel]="newActivityStarterCode()"
                    (ngModelChange)="newActivityStarterCode.set($event)"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Salida Esperada / Casos de Prueba (CLI)</label>
                  <input
                    type="text"
                    class="form-input code-font"
                    placeholder="Ej. Recorrido in-order: 10 20 30 40 50"
                    [ngModel]="newActivityExpectedOutput()"
                    (ngModelChange)="newActivityExpectedOutput.set($event)"
                  />
                </div>
              }

              <!-- Campos específicos para Quiz Evaluativo -->
              @if (modalType() === 'quiz') {
                <div class="quiz-builder-section">
                  <div class="quiz-builder-head">
                    <label class="form-label">Preguntas de Opción Múltiple ({{ quizQuestionsList().length }})</label>
                    <button type="button" class="btn btn-outline btn-sm" (click)="addQuestionToDraft()">
                      ➕ Añadir Pregunta
                    </button>
                  </div>

                  @for (q of quizQuestionsList(); track $index; let qIdx = $index) {
                    <div class="draft-question-box">
                      <div class="draft-q-head">
                        <strong>Pregunta #{{ qIdx + 1 }}</strong>
                        @if (quizQuestionsList().length > 1) {
                          <button type="button" class="btn-remove-q" (click)="removeQuestionFromDraft(qIdx)">✕ Eliminar</button>
                        }
                      </div>

                      <input
                        type="text"
                        class="form-input mb-2"
                        placeholder="Enunciado de la pregunta evaluativa..."
                        [(ngModel)]="q.question"
                      />

                      <div class="draft-options-grid">
                        @for (opt of q.options; track $index; let optIdx = $index) {
                          <div class="draft-opt-row">
                            <input
                              type="radio"
                              [name]="'correct_' + qIdx"
                              [checked]="q.correct_index === optIdx"
                              (change)="q.correct_index = optIdx"
                            />
                            <span class="opt-label">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                            <input
                              type="text"
                              class="form-input"
                              placeholder="Opción de respuesta..."
                              [(ngModel)]="q.options[optIdx]"
                            />
                          </div>
                        }
                      </div>

                      <input
                        type="text"
                        class="form-input mt-2"
                        placeholder="Explicación técnica del porqué es correcta..."
                        [(ngModel)]="q.explanation"
                      />
                    </div>
                  }
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeCreateModal()">Cancelar</button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="saveNewActivity()"
                [disabled]="!newActivityTitle().trim() || !newActivityDescription().trim()"
              >
                💾 Publicar Actividad en Cátedra
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL DOSSIER ESTUDIANTE -->
      @if (selectedStudentDetail()) {
        @let d = selectedStudentDetail()!;
        <div class="modal-backdrop" (click)="selectedStudentDetail.set(null)" role="dialog" aria-modal="true">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="dossier-head">
                <div class="dossier-avatar">{{ getInitials(d.student.name) }}</div>
                <div>
                  <h3 class="modal-title">{{ d.student.name }}</h3>
                  <span class="dossier-email">{{ d.student.email }}</span>
                  <div class="dossier-tags">
                    <span class="status-pill" [class.status-verified]="d.student.email_verified" [class.status-pending]="!d.student.email_verified">
                      {{ d.student.email_verified ? '✓ Correo Verificado' : '⏳ Pendiente de Activación' }}
                    </span>
                    <span class="role-pill">Rol: {{ d.student.role }}</span>
                  </div>
                </div>
              </div>
              <button type="button" class="modal-close" (click)="selectedStudentDetail.set(null)">✕</button>
            </div>

            <div class="modal-body">
              <!-- KPI Summary del Alumno -->
              <div class="dossier-kpis">
                <div class="d-kpi">
                  <span class="d-kpi-num">{{ d.academic_summary.total_enrolled }}</span>
                  <span class="d-kpi-lbl">Cursos Matriculados</span>
                </div>
                <div class="d-kpi">
                  <span class="d-kpi-num">{{ d.academic_summary.total_completed }}</span>
                  <span class="d-kpi-lbl">Lecciones Superadas</span>
                </div>
                <div class="d-kpi">
                  <span class="d-kpi-num">{{ d.academic_summary.average_score ?? 0 }}%</span>
                  <span class="d-kpi-lbl">Promedio Evaluativo</span>
                </div>
              </div>

              <!-- Cursos Inscritos -->
              <h4 class="section-title">📚 Cursos Inscritos</h4>
              <div class="dossier-courses">
                @for (c of d.courses; track c.id) {
                  <div class="d-course-card">
                    <div class="d-course-info">
                      <strong>{{ c.title }}</strong>
                      <span class="text-muted">Progreso: {{ c.progress_percent }}%</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" [style.width.%]="c.progress_percent"></div>
                    </div>
                  </div>
                }
              </div>

              <!-- Historial de Lecciones y Evaluaciones -->
              <h4 class="section-title mt-4">✅ Evaluaciones y Entregas Registradas</h4>
              @if (d.completed_lessons.length === 0) {
                <p class="text-muted">Sin evaluaciones completadas hasta el momento.</p>
              } @else {
                <div class="table-responsive">
                  <table class="academic-table table-sm">
                    <thead>
                      <tr>
                        <th>Lección / Actividad</th>
                        <th>Curso</th>
                        <th>Tipo</th>
                        <th>Puntaje</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (l of d.completed_lessons; track l.id) {
                        <tr>
                          <td><strong>{{ l.lesson_title }}</strong></td>
                          <td><span class="text-muted">{{ l.course_title }}</span></td>
                          <td><span class="status-pill status-type">{{ l.lesson_type }}</span></td>
                          <td>
                            @if (l.score !== null) {
                              <span [class.text-success]="l.passed" [class.text-danger]="!l.passed">
                                {{ l.score }}% {{ l.passed ? '✓' : '✗' }}
                              </span>
                            } @else {
                              <span class="text-muted">Completada</span>
                            }
                          </td>
                          <td><small class="text-muted">{{ formatDate(l.completed_at) }}</small></td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="selectedStudentDetail.set(null)">Cerrar Expediente</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      /* ESTILOS GLOBALES DEL PANEL DOCENTE */
      .teacher-page {
        min-height: calc(100vh - 75px);
        background: #080b14;
        color: #f1f5f9;
        font-family: inherit;
        padding-bottom: 5rem;
      }

      .container {
        max-width: 1380px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      /* HEADER CÁTEDRA */
      .teacher-header {
        background: linear-gradient(180deg, #0d1322 0%, #080b14 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 2.2rem 0;
      }

      .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        background: rgba(0, 217, 255, 0.12);
        color: #00d9ff;
        padding: 0.25rem 0.85rem;
        border-radius: 9999px;
        border: 1px solid rgba(0, 217, 255, 0.3);
        margin-bottom: 0.6rem;
      }

      .pulse-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #00d9ff;
        box-shadow: 0 0 8px #00d9ff;
        animation: pulseDot 2s infinite ease-in-out;
      }

      @keyframes pulseDot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.4); opacity: 0.6; }
      }

      .header-title {
        font-size: 1.9rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 0.4rem 0;
        letter-spacing: -0.02em;
      }

      .header-subtitle {
        color: #94a3b8;
        font-size: 0.95rem;
        margin: 0;
        max-width: 680px;
        line-height: 1.5;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      /* BOTONES */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1.15rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-decoration: none;
        border: none;
      }

      .btn:hover {
        transform: translateY(-1px);
      }

      .btn:active {
        transform: translateY(0);
      }

      .btn-primary {
        background: linear-gradient(135deg, #00d9ff 0%, #0099ff 100%);
        color: #030712;
        box-shadow: 0 0 16px rgba(0, 217, 255, 0.25);
      }

      .btn-primary:hover {
        box-shadow: 0 0 24px rgba(0, 217, 255, 0.4);
      }

      .btn-accent {
        background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
        color: #ffffff;
        box-shadow: 0 0 16px rgba(168, 85, 247, 0.25);
      }

      .btn-accent:hover {
        box-shadow: 0 0 24px rgba(168, 85, 247, 0.4);
      }

      .btn-outline {
        background: rgba(255, 255, 255, 0.04);
        color: #cbd5e1;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .btn-outline:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }

      .btn-sm {
        padding: 0.4rem 0.85rem;
        font-size: 0.8rem;
      }

      /* KPI CARDS */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1.25rem;
        margin: 2rem 0;
      }

      .kpi-card {
        background: #0d1322;
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 1.35rem 1.5rem;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s, border-color 0.2s;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
      }

      .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
      }

      .kpi-cyan::before { background: linear-gradient(90deg, #00d9ff, transparent); }
      .kpi-purple::before { background: linear-gradient(90deg, #c084fc, transparent); }
      .kpi-green::before { background: linear-gradient(90deg, #0ae98a, transparent); }
      .kpi-amber::before { background: linear-gradient(90deg, #f59e0b, transparent); }

      .kpi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .kpi-icon {
        font-size: 1.5rem;
      }

      .kpi-pill {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .kpi-value {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.1;
        letter-spacing: -0.02em;
        font-family: 'JetBrains Mono', monospace;
      }

      .kpi-label {
        font-size: 0.8rem;
        color: #94a3b8;
        margin-top: 0.35rem;
        display: block;
      }

      /* TABS NAVEGACIÓN */
      .dashboard-nav {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 1rem;
        margin-bottom: 2rem;
        overflow-x: auto;
      }

      .nav-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        padding: 0.65rem 1.15rem;
        border-radius: 10px;
        background: transparent;
        color: #94a3b8;
        border: 1px solid transparent;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
      }

      .nav-tab-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.04);
      }

      .nav-tab-btn.is-active {
        color: #00d9ff;
        background: rgba(0, 217, 255, 0.08);
        border-color: rgba(0, 217, 255, 0.25);
        box-shadow: 0 0 16px rgba(0, 217, 255, 0.1);
      }

      .nav-tab-ai.is-active {
        color: #c084fc;
        background: rgba(192, 132, 252, 0.1);
        border-color: rgba(192, 132, 252, 0.3);
      }

      .tab-badge {
        font-size: 0.7rem;
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
      }

      .pulse-badge {
        background: #a855f7;
        color: #ffffff;
        font-weight: 800;
      }

      /* PANEL CARD */
      .panel-card {
        background: #0d1322;
        border: 1px solid rgba(255, 255, 255, 0.07);
        border-radius: 16px;
        padding: 1.75rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .panel-title {
        font-size: 1.35rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 0.3rem 0;
      }

      .panel-desc {
        font-size: 0.88rem;
        color: #94a3b8;
        margin: 0;
      }

      .toolbar-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.85rem;
        font-size: 0.85rem;
        pointer-events: none;
      }

      .search-input {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-radius: 8px;
        padding: 0.55rem 2.2rem 0.55rem 2.2rem;
        font-size: 0.85rem;
        width: 280px;
        transition: all 0.2s;
      }

      .search-input:focus {
        outline: none;
        border-color: #00d9ff;
        background: rgba(0, 217, 255, 0.03);
        box-shadow: 0 0 10px rgba(0, 217, 255, 0.15);
      }

      .btn-clear {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
      }

      .filter-group {
        display: flex;
        background: rgba(255, 255, 255, 0.03);
        padding: 0.25rem;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.06);
      }

      .filter-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .filter-btn:hover {
        color: #ffffff;
      }

      .filter-btn.active {
        background: rgba(0, 217, 255, 0.15);
        color: #00d9ff;
      }

      /* TABLA ACADÉMICA */
      .table-responsive {
        overflow-x: auto;
      }

      .academic-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.86rem;
      }

      .academic-table th {
        text-align: left;
        padding: 0.85rem 1rem;
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .academic-table td {
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        vertical-align: middle;
      }

      .academic-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .avatar-badge {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #00d9ff;
        font-weight: 700;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(0, 217, 255, 0.3);
      }

      .student-meta {
        display: flex;
        flex-direction: column;
      }

      .student-name {
        font-weight: 600;
        color: #ffffff;
      }

      .student-email {
        font-size: 0.75rem;
        color: #64748b;
      }

      .status-pill {
        display: inline-block;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.2rem 0.65rem;
        border-radius: 9999px;
      }

      .status-verified {
        background: rgba(10, 233, 138, 0.12);
        color: #0ae98a;
        border: 1px solid rgba(10, 233, 138, 0.3);
      }

      .status-pending {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .status-type {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }

      .courses-cell {
        display: flex;
        flex-direction: column;
      }

      .courses-count {
        font-weight: 600;
        color: #cbd5e1;
      }

      .courses-snippet {
        color: #64748b;
        font-size: 0.72rem;
      }

      .lessons-count {
        font-family: 'JetBrains Mono', monospace;
        color: #00d9ff;
        font-weight: 600;
      }

      .score-badge {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.78rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
      }

      .score-high {
        background: rgba(10, 233, 138, 0.15);
        color: #0ae98a;
      }

      .score-mid {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .score-low {
        background: rgba(244, 63, 94, 0.15);
        color: #f43f5e;
      }

      .date-text {
        font-size: 0.78rem;
        color: #64748b;
      }

      .actions-cell {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        justify-content: flex-end;
      }

      .btn-row-action {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
      }

      .btn-row-action:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      .btn-view:hover {
        border-color: #00d9ff;
        color: #00d9ff;
      }

      .btn-activate {
        background: rgba(10, 233, 138, 0.1);
        border-color: rgba(10, 233, 138, 0.3);
        color: #0ae98a;
      }

      .btn-delete:hover {
        border-color: #f43f5e;
        color: #f43f5e;
      }

      /* ACTIVIDADES GRID */
      .activities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        gap: 1.25rem;
        margin-top: 1.5rem;
      }

      .activity-card {
        background: #111827;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        transition: all 0.2s;
      }

      .activity-card:hover {
        border-color: rgba(0, 217, 255, 0.3);
        transform: translateY(-2px);
      }

      .act-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.85rem;
      }

      .act-badges {
        display: flex;
        gap: 0.5rem;
      }

      .act-type-pill {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
      }

      .pill-quiz {
        background: rgba(168, 85, 247, 0.15);
        color: #c084fc;
        border: 1px solid rgba(168, 85, 247, 0.3);
      }

      .pill-challenge {
        background: rgba(0, 217, 255, 0.15);
        color: #00d9ff;
        border: 1px solid rgba(0, 217, 255, 0.3);
      }

      .pill-terminal {
        background: rgba(10, 233, 138, 0.15);
        color: #0ae98a;
        border: 1px solid rgba(10, 233, 138, 0.3);
      }

      .act-diff-pill {
        font-size: 0.7rem;
        background: rgba(255, 255, 255, 0.06);
        color: #94a3b8;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
      }

      .act-xp-pill {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.12);
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      .act-card-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 0.35rem 0;
        line-height: 1.35;
      }

      .act-course-tag {
        font-size: 0.78rem;
        color: #818cf8;
        margin: 0 0 0.75rem 0;
      }

      .act-card-desc {
        font-size: 0.84rem;
        color: #94a3b8;
        line-height: 1.5;
        margin: 0 0 1rem 0;
        flex-grow: 1;
      }

      .act-quiz-preview {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 0.75rem;
        margin-bottom: 1rem;
      }

      .quiz-q-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: #c084fc;
        display: block;
        margin-bottom: 0.35rem;
      }

      .quiz-sample-list {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.75rem;
        color: #cbd5e1;
      }

      .quiz-sample-list li {
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .act-terminal-preview {
        background: #05070d;
        border: 1px solid rgba(0, 217, 255, 0.2);
        border-radius: 8px;
        padding: 0.65rem;
        margin-bottom: 1rem;
        font-size: 0.75rem;
      }

      .term-lbl {
        color: #64748b;
        display: block;
        font-size: 0.68rem;
        margin-bottom: 0.2rem;
      }

      .act-terminal-preview code {
        color: #0ae98a;
        font-family: 'JetBrains Mono', monospace;
      }

      .act-card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.85rem;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.72rem;
        color: #64748b;
      }

      .act-meta {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }

      .btn-icon-danger {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.95rem;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .btn-icon-danger:hover {
        opacity: 1;
      }

      /* METRICAS & ACTIVITY */
      .metrics-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 992px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }

      .timeline-stream {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .stream-item {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
      }

      .stream-dot {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        flex-shrink: 0;
      }

      .dot-pass {
        background: rgba(10, 233, 138, 0.15);
        color: #0ae98a;
        border: 1px solid rgba(10, 233, 138, 0.3);
      }

      .dot-fail {
        background: rgba(244, 63, 94, 0.15);
        color: #f43f5e;
        border: 1px solid rgba(244, 63, 94, 0.3);
      }

      .stream-content {
        flex-grow: 1;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 0.75rem 1rem;
      }

      .stream-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.25rem;
      }

      .stream-user {
        font-weight: 600;
        color: #ffffff;
      }

      .stream-time {
        font-size: 0.72rem;
        color: #64748b;
      }

      .stream-body {
        font-size: 0.82rem;
        color: #94a3b8;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stream-score {
        font-family: 'JetBrains Mono', monospace;
        font-weight: 700;
        font-size: 0.78rem;
      }

      .score-ok { color: #0ae98a; }
      .score-bad { color: #f43f5e; }

      .demand-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .demand-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 1rem;
      }

      .demand-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .demand-name {
        font-weight: 600;
        color: #ffffff;
        font-size: 0.9rem;
      }

      .demand-diff {
        font-size: 0.7rem;
        color: #818cf8;
        background: rgba(99, 102, 241, 0.15);
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .demand-stat {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .demand-count {
        font-size: 0.78rem;
        color: #64748b;
      }

      .demand-bar-bg {
        height: 6px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 9999px;
        overflow: hidden;
      }

      .demand-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d9ff, #6366f1);
        border-radius: 9999px;
      }

      /* AI COPILOT WORKSPACE */
      .ai-copilot-banner {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%);
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 16px;
        padding: 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        margin-bottom: 2rem;
      }

      .ai-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #c084fc;
        background: rgba(168, 85, 247, 0.2);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        margin-bottom: 0.5rem;
      }

      .ai-copilot-banner h2 {
        font-size: 1.6rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 0.5rem 0;
      }

      .ai-copilot-banner p {
        color: #cbd5e1;
        font-size: 0.9rem;
        margin: 0;
        max-width: 700px;
        line-height: 1.5;
      }

      .ai-bot-avatar {
        font-size: 3.5rem;
        animation: floatBot 3s infinite ease-in-out;
      }

      @keyframes floatBot {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }

      .ai-workspace-grid {
        display: grid;
        grid-template-columns: 1.4fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 992px) {
        .ai-workspace-grid {
          grid-template-columns: 1fr;
        }
      }

      .topic-presets {
        display: flex;
        gap: 0.45rem;
        flex-wrap: wrap;
        margin-bottom: 0.6rem;
      }

      .preset-pill {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #cbd5e1;
        font-size: 0.74rem;
        padding: 0.25rem 0.6rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .preset-pill:hover {
        background: rgba(0, 217, 255, 0.15);
        color: #00d9ff;
        border-color: rgba(0, 217, 255, 0.3);
      }

      .form-group {
        margin-bottom: 1.15rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .form-label {
        display: block;
        font-size: 0.8rem;
        font-weight: 600;
        color: #cbd5e1;
        margin-bottom: 0.4rem;
      }

      .form-input,
      .form-select,
      .form-textarea {
        width: 100%;
        background: #080b14;
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #ffffff;
        border-radius: 8px;
        padding: 0.65rem 0.85rem;
        font-size: 0.85rem;
        transition: all 0.2s;
        box-sizing: border-box;
      }

      .form-input:focus,
      .form-select:focus,
      .form-textarea:focus {
        outline: none;
        border-color: #00d9ff;
        box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);
      }

      .code-font {
        font-family: 'JetBrains Mono', monospace;
      }

      .btn-generate {
        width: 100%;
        justify-content: center;
        padding: 0.75rem;
        font-size: 0.9rem;
      }

      .ai-generated-results {
        margin-top: 1.75rem;
        background: #080b14;
        border: 1px solid rgba(168, 85, 247, 0.3);
        border-radius: 12px;
        padding: 1.25rem;
      }

      .results-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding-bottom: 0.75rem;
      }

      .results-header h4 {
        margin: 0;
        font-size: 0.95rem;
        color: #ffffff;
      }

      .questions-list {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .q-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 1rem;
      }

      .q-number {
        font-size: 0.7rem;
        font-weight: 700;
        color: #c084fc;
        text-transform: uppercase;
      }

      .q-text {
        font-weight: 600;
        color: #ffffff;
        font-size: 0.88rem;
        margin: 0.35rem 0 0.75rem 0;
      }

      .q-options {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 0.75rem;
      }

      .q-opt {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.82rem;
        color: #cbd5e1;
        background: rgba(255, 255, 255, 0.03);
        padding: 0.45rem 0.75rem;
        border-radius: 6px;
      }

      .q-correct {
        background: rgba(10, 233, 138, 0.1);
        border: 1px solid rgba(10, 233, 138, 0.3);
        color: #0ae98a;
      }

      .opt-letter {
        font-weight: 700;
        color: #94a3b8;
      }

      .correct-badge {
        margin-left: auto;
        font-size: 0.7rem;
        font-weight: 700;
      }

      .q-explanation {
        font-size: 0.75rem;
        color: #94a3b8;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
      }

      /* COHORT RISK ITEMS */
      .at-risk-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .risk-item {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 1rem;
      }

      .risk-user {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.4rem;
      }

      .risk-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #1e293b;
        color: #f59e0b;
        font-weight: 700;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .risk-user small {
        color: #64748b;
        display: block;
      }

      .risk-badge {
        font-size: 0.72rem;
        color: #f59e0b;
        font-weight: 600;
        margin-bottom: 0.4rem;
      }

      .risk-advice {
        font-size: 0.8rem;
        color: #94a3b8;
        margin: 0;
        line-height: 1.45;
      }

      .ai-assistant-chat-box {
        background: #080b14;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1.25rem;
      }

      .ai-assistant-chat-box h4 {
        margin: 0 0 0.75rem 0;
        font-size: 0.9rem;
        color: #ffffff;
      }

      .mini-chat-bubble {
        background: rgba(168, 85, 247, 0.1);
        border: 1px solid rgba(168, 85, 247, 0.2);
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.82rem;
        color: #cbd5e1;
        margin-bottom: 0.75rem;
      }

      .chat-input-row {
        display: flex;
        gap: 0.5rem;
      }

      .chat-input {
        flex-grow: 1;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #ffffff;
        border-radius: 6px;
        padding: 0.45rem 0.75rem;
        font-size: 0.82rem;
      }

      /* MODALES */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(3, 7, 18, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-card {
        background: #0d1322;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 18px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        display: flex;
        flex-direction: column;
      }

      .modal-lg {
        max-width: 780px;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.35rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .modal-badge {
        font-size: 0.68rem;
        font-weight: 700;
        color: #00d9ff;
        letter-spacing: 0.08em;
      }

      .modal-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0.2rem 0 0 0;
      }

      .modal-close {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 1.2rem;
        cursor: pointer;
      }

      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
      }

      /* QUIZ BUILDER EN MODAL */
      .quiz-builder-section {
        margin-top: 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding-top: 1.25rem;
      }

      .quiz-builder-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .draft-question-box {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
      }

      .draft-q-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.82rem;
        color: #00d9ff;
      }

      .btn-remove-q {
        background: none;
        border: none;
        color: #f43f5e;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .draft-options-grid {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
      }

      .draft-opt-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .opt-label {
        font-weight: 700;
        font-size: 0.8rem;
        color: #94a3b8;
        width: 15px;
      }

      .mb-2 { margin-bottom: 0.5rem; }
      .mt-2 { margin-top: 0.5rem; }
      .mt-4 { margin-top: 1.5rem; }

      /* DOSSIER ESTUDIANTE */
      .dossier-head {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .dossier-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #00d9ff, #6366f1);
        color: #030712;
        font-weight: 800;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dossier-email {
        font-size: 0.82rem;
        color: #94a3b8;
        display: block;
      }

      .dossier-tags {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.35rem;
      }

      .role-pill {
        font-size: 0.72rem;
        background: rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
      }

      .dossier-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .d-kpi {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 0.85rem;
        text-align: center;
      }

      .d-kpi-num {
        display: block;
        font-size: 1.4rem;
        font-weight: 800;
        color: #00d9ff;
        font-family: 'JetBrains Mono', monospace;
      }

      .d-kpi-lbl {
        font-size: 0.72rem;
        color: #94a3b8;
      }

      .section-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 0.85rem 0;
      }

      .dossier-courses {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .d-course-card {
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        padding: 0.75rem 1rem;
      }

      .d-course-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        margin-bottom: 0.4rem;
      }

      .progress-bar-bg {
        height: 6px;
        background: rgba(255, 255, 255, 0.08);
        border-radius: 9999px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: #00d9ff;
        border-radius: 9999px;
      }

      .table-sm th, .table-sm td {
        padding: 0.6rem 0.75rem;
        font-size: 0.8rem;
      }

      .text-success { color: #0ae98a; }
      .text-danger { color: #f43f5e; }
      .text-muted { color: #64748b; }
      .text-right { text-align: right; }

      /* SPINNER & EMPTY */
      .loading-box,
      .empty-box {
        text-align: center;
        padding: 3.5rem 1rem;
        color: #94a3b8;
      }

      .empty-emoji {
        font-size: 2.8rem;
        margin-bottom: 0.5rem;
        display: block;
      }

      .spinner {
        width: 32px;
        height: 32px;
        border: 3px solid rgba(0, 217, 255, 0.2);
        border-top-color: #00d9ff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  private readonly teacherSvc = inject(TeacherService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);

  private routeSub?: Subscription;

  // Estados reactivos principales
  readonly loading = signal<boolean>(false);
  readonly overview = signal<TeacherOverviewResponse | null>(null);
  readonly students = signal<TeacherStudent[]>([]);
  readonly activities = signal<TeacherActivity[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'verified' | 'unverified'>('all');
  readonly activityTypeFilter = signal<'all' | 'challenge' | 'quiz' | 'terminal'>('all');
  readonly activeTab = signal<'students' | 'activities' | 'activity' | 'ai'>('students');

  readonly selectedStudentDetail = signal<TeacherStudentDetail | null>(null);

  // Estados para modal de creación
  readonly showCreateModal = signal<boolean>(false);
  readonly modalType = signal<'challenge' | 'quiz'>('challenge');
  readonly newActivityTitle = signal<string>('');
  readonly newActivityCourse = signal<string>('Introducción a la Programación');
  readonly newActivityDifficulty = signal<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  readonly newActivityXp = signal<number>(100);
  readonly newActivityDescription = signal<string>('');
  readonly newActivityStarterCode = signal<string>('');
  readonly newActivityExpectedOutput = signal<string>('');
  readonly quizQuestionsList = signal<QuizQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correct_index: 0,
      explanation: '',
    },
  ]);

  // Estados para asistente IA
  readonly aiTopic = signal<string>('Docker y Contenedores');
  readonly aiDifficulty = signal<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  readonly aiTargetCourse = signal<string>('Sistemas Operativos y Linux');
  readonly aiGenerating = signal<boolean>(false);
  readonly aiGeneratedQuestions = signal<QuizQuestion[]>([]);

  ngOnInit() {
    this.loadAllData();

    // Sincronización reactiva con queryParams de la URL (navbar pills)
    this.routeSub = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      if (tab === 'students' || tab === 'activities' || tab === 'activity' || tab === 'ai') {
        this.activeTab.set(tab);
      }
    });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  setTab(tab: 'students' | 'activities' | 'activity' | 'ai') {
    this.activeTab.set(tab);
  }

  loadAllData() {
    this.loading.set(true);

    this.teacherSvc.getOverview().subscribe({
      next: data => this.overview.set(data),
    });

    this.teacherSvc.getStudents().subscribe({
      next: data => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.teacherSvc.getActivities().subscribe({
      next: acts => this.activities.set(acts),
    });
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
  }

  // Filtrado reactivo de estudiantes
  readonly filteredStudents = computed(() => {
    let list = this.students();
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.statusFilter();

    if (query) {
      list = list.filter(
        s => s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query)
      );
    }

    if (filter === 'verified') {
      list = list.filter(s => s.email_verified);
    } else if (filter === 'unverified') {
      list = list.filter(s => !s.email_verified);
    }

    return list;
  });

  // Filtrado reactivo de actividades
  readonly filteredActivities = computed(() => {
    let list = this.activities();
    const type = this.activityTypeFilter();
    if (type !== 'all') {
      list = list.filter(a => a.type === type);
    }
    return list;
  });

  viewStudentDossier(id: number) {
    this.teacherSvc.getStudentDetail(id).subscribe({
      next: detail => this.selectedStudentDetail.set(detail),
    });
  }

  verifyStudentAccount(st: TeacherStudent) {
    if (!confirm(`¿Deseas verificar manualmente la cuenta de ${st.name}?`)) return;

    this.teacherSvc.updateStudent(st.id, { verify_email: true }).subscribe({
      next: () => {
        st.email_verified = true;
        this.students.update(all => [...all]);
      },
    });
  }

  deleteStudentAccount(st: TeacherStudent) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al estudiante "${st.name}" (${st.email}) y todo su progreso? Esta acción no se puede deshacer.`)) return;

    this.teacherSvc.deleteStudent(st.id).subscribe({
      next: () => {
        this.students.update(all => all.filter(item => item.id !== st.id));
      },
    });
  }

  // Creación de Actividades y Quizzes
  openCreateModal(type: 'challenge' | 'quiz') {
    this.modalType.set(type);
    this.newActivityTitle.set('');
    this.newActivityDescription.set('');
    this.newActivityStarterCode.set('');
    this.newActivityExpectedOutput.set('');
    this.newActivityXp.set(type === 'quiz' ? 100 : 150);
    this.quizQuestionsList.set([
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: '',
      },
    ]);
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  addQuestionToDraft() {
    this.quizQuestionsList.update(qList => [
      ...qList,
      {
        question: '',
        options: ['', '', '', ''],
        correct_index: 0,
        explanation: '',
      },
    ]);
  }

  removeQuestionFromDraft(index: number) {
    this.quizQuestionsList.update(qList => qList.filter((_, i) => i !== index));
  }

  saveNewActivity() {
    const isQuiz = this.modalType() === 'quiz';
    const author = this.auth.user()?.name || 'Prof. Andrés';

    this.teacherSvc
      .createActivity({
        title: this.newActivityTitle().trim(),
        description: this.newActivityDescription().trim(),
        type: isQuiz ? 'quiz' : 'challenge',
        course_name: this.newActivityCourse(),
        difficulty: this.newActivityDifficulty(),
        xp_reward: Number(this.newActivityXp()) || 100,
        author_name: author,
        starter_code: isQuiz ? undefined : this.newActivityStarterCode(),
        expected_output: isQuiz ? undefined : this.newActivityExpectedOutput(),
        quiz_questions: isQuiz ? this.quizQuestionsList() : undefined,
      })
      .subscribe({
        next: newAct => {
          this.activities.update(all => [newAct, ...all]);
          this.closeCreateModal();
          this.activeTab.set('activities');
        },
      });
  }

  deleteActivity(id: string) {
    if (!confirm('¿Deseas eliminar esta actividad del catálogo de cátedra?')) return;
    this.teacherSvc.deleteActivity(id).subscribe({
      next: () => {
        this.activities.update(all => all.filter(a => a.id !== id));
      },
    });
  }

  // Generador Byte IA
  generateQuizWithAi() {
    const topic = this.aiTopic().trim();
    if (!topic) return;

    this.aiGenerating.set(true);
    this.teacherSvc.generateAiQuiz(topic, this.aiDifficulty()).subscribe({
      next: questions => {
        this.aiGeneratedQuestions.set(questions);
        this.aiGenerating.set(false);
      },
      error: () => this.aiGenerating.set(false),
    });
  }

  saveAiQuizToActivities() {
    const questions = this.aiGeneratedQuestions();
    if (questions.length === 0) return;

    const topic = this.aiTopic().trim();
    const author = this.auth.user()?.name || 'Prof. Andrés';

    this.teacherSvc
      .createActivity({
        title: `Evaluación Evaluativa: ${topic}`,
        description: `Quiz de evaluación estructurado por Byte IA sobre conceptos críticos de ${topic}.`,
        type: 'quiz',
        course_name: this.aiTargetCourse(),
        difficulty: this.aiDifficulty(),
        xp_reward: 120,
        author_name: `${author} (Asistido por Byte IA)`,
        quiz_questions: questions,
      })
      .subscribe({
        next: newAct => {
          this.activities.update(all => [newAct, ...all]);
          this.activeTab.set('activities');
        },
      });
  }

  getInitials(name: string): string {
    return (
      name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST'
    );
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
}
