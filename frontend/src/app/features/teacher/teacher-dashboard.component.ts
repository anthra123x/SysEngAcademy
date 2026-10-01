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
      <!-- CABECERA PRINCIPAL DOCENTE -->
      <div class="page-head">
        <div class="container head-layout">
          <div>
            <div class="sub-badge">CÁTEDRA &amp; SUPERVISIÓN</div>
            <h1 class="page-title">Panel de Control Docente</h1>
            <p class="page-subtitle">
              Profesor <strong>{{ auth.user()?.name || 'Docente' }}</strong> — Supervisión académica, diseño de actividades evaluativas y analíticas de cohorte.
            </p>
          </div>

          <div class="head-actions">
            <button type="button" class="btn btn-ghost" (click)="loadAllData()" [disabled]="loading()">
              <span>{{ loading() ? 'Sincronizando…' : '🔄 Sincronizar' }}</span>
            </button>
            <button type="button" class="btn btn-outline" (click)="triggerProgressDigest()" [disabled]="sendingDigest()">
              <span>{{ sendingDigest() ? 'Enviando…' : '📧 Enviar Resumen Progreso' }}</span>
            </button>
            <button type="button" class="btn btn-outline" (click)="triggerStreakReminder()" [disabled]="sendingStreak()">
              <span>{{ sendingStreak() ? 'Enviando…' : '🔥 Alertas de Racha' }}</span>
            </button>
            <button type="button" class="btn btn-outline" (click)="openCreateModal('challenge')">
              <span>➕ Nuevo Reto</span>
            </button>
            <button type="button" class="btn btn-primary" (click)="openCreateModal('quiz')">
              <span>📝 Crear Quiz</span>
            </button>
          </div>
        </div>
      </div>

      @if (actionNotification()) {
        <div class="container" style="margin-top: 1rem;">
          <div class="action-toast animate-fade-in">
            <span>{{ actionNotification() }}</span>
            <button type="button" class="btn-toast-close" (click)="actionNotification.set('')">✕</button>
          </div>
        </div>
      }

      <div class="container dashboard-container">
        <!-- KPIS MÉTRICAS NEUTRAS -->
        @if (overview()) {
          <div class="kpi-grid">
            <div class="kpi-card">
              <span class="kpi-label">Estudiantes Registrados</span>
              <span class="kpi-value">{{ totalStudentsCount() }}</span>
              <span class="kpi-meta">Alumnos en catálogo docente</span>
            </div>

            <div class="kpi-card">
              <span class="kpi-label">Actividades &amp; Quizzes</span>
              <span class="kpi-value">{{ activities().length }}</span>
              <span class="kpi-meta">Creados por la cátedra</span>
            </div>

            <div class="kpi-card">
              <span class="kpi-label">Lecciones Completadas</span>
              <span class="kpi-value">{{ totalLessonsCompleted() }}</span>
              <span class="kpi-meta">Superadas por alumnos</span>
            </div>

            <div class="kpi-card">
              <span class="kpi-label">Promedio de Quizzes</span>
              <span class="kpi-value">{{ averageQuizScore() }}%</span>
              <span class="kpi-meta">Rendimiento evaluativo global</span>
            </div>
          </div>
        }

        <!-- PESTAÑA 1: DIRECTORIO DE ESTUDIANTES -->
        @if (activeTab() === 'students') {
          <div class="surface-panel">
            <div class="panel-head-row">
              <div>
                <h2 class="panel-heading">Directorio de Alumnos Matriculados</h2>
                <p class="panel-subtext">Supervisión en tiempo real de progreso académico, lecciones completadas y calificaciones.</p>
              </div>
              <div class="head-count-badge">
                <span>{{ filteredStudents().length }} estudiantes registrados</span>
              </div>
            </div>

            <div class="panel-toolbar">
              <div class="search-input-group">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  class="search-box"
                  placeholder="Buscar alumno por nombre o correo…"
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                />
                @if (searchQuery()) {
                  <button type="button" class="btn-clear" (click)="onSearchChange('')">✕</button>
                }
              </div>

              <div class="filter-pills">
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="statusFilter() === 'all'"
                  (click)="statusFilter.set('all')"
                >
                  Todos
                </button>
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="statusFilter() === 'verified'"
                  (click)="statusFilter.set('verified')"
                >
                  Verificados
                </button>
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="statusFilter() === 'unverified'"
                  (click)="statusFilter.set('unverified')"
                >
                  Pendientes
                </button>
              </div>
            </div>

            @if (loading()) {
              <div class="state-block">
                <div class="loading-spinner"></div>
                <p>Cargando información de estudiantes…</p>
              </div>
            } @else if (filteredStudents().length === 0) {
              <div class="state-block">
                <p class="state-title">No se encontraron estudiantes</p>
                <p class="state-desc">Prueba ajustando los filtros o la búsqueda.</p>
              </div>
            } @else {
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Estado</th>
                      <th>Cursos</th>
                      <th>Lecciones</th>
                      <th>Promedio</th>
                      <th>Fecha Registro</th>
                      <th class="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (st of filteredStudents(); track st.id) {
                      <tr>
                        <td>
                          <div class="student-cell">
                            <div class="avatar-box">{{ getInitials(st.name) }}</div>
                            <div>
                              <div class="cell-name">{{ st.name }}</div>
                              <div class="cell-meta">{{ st.email }}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          @if (st.email_verified) {
                            <span class="badge badge-success">Verificado</span>
                          } @else {
                            <span class="badge badge-warning">Pendiente</span>
                          }
                        </td>
                        <td>
                          <span class="cell-primary">{{ st.enrollments_count }} cursos</span>
                          @if (st.courses.length > 0) {
                            <small class="cell-sub">{{ st.courses[0].title }}</small>
                          }
                        </td>
                        <td>
                          <span class="mono-value">{{ st.completed_lessons_count }}</span>
                        </td>
                        <td>
                          @if (st.average_quiz_score !== null) {
                            <span class="mono-value">{{ st.average_quiz_score }}%</span>
                            <small class="cell-sub">({{ st.quizzes_taken_count }} evaluados)</small>
                          } @else {
                            <span class="cell-muted">—</span>
                          }
                        </td>
                        <td>
                          <span class="cell-muted">{{ formatDate(st.created_at) }}</span>
                        </td>
                        <td>
                          <div class="action-btn-group">
                            <button
                              type="button"
                              class="action-btn"
                              (click)="viewStudentDossier(st.id)"
                              title="Ver expediente académico"
                            >
                              Ver
                            </button>
                            @if (!st.email_verified) {
                              <button
                                type="button"
                                class="action-btn action-btn--success"
                                (click)="verifyStudentAccount(st)"
                                title="Verificar correo manualmente"
                              >
                                Activar
                              </button>
                            }
                            <button
                              type="button"
                              class="action-btn action-btn--danger"
                              (click)="deleteStudentAccount(st)"
                              title="Eliminar cuenta"
                            >
                              Eliminar
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

        <!-- PESTAÑA 2: GESTOR DE ACTIVIDADES & QUIZZES -->
        @if (activeTab() === 'activities') {
          <div class="surface-panel">
            <div class="panel-head-row">
              <div>
                <h2 class="panel-heading">Actividades y Evaluaciones de Cátedra</h2>
                <p class="panel-subtext">Diseña retos prácticos de código y evaluaciones teóricas de opción múltiple.</p>
              </div>

              <div class="filter-pills">
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="activityTypeFilter() === 'all'"
                  (click)="activityTypeFilter.set('all')"
                >
                  Todas ({{ activities().length }})
                </button>
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="activityTypeFilter() === 'challenge'"
                  (click)="activityTypeFilter.set('challenge')"
                >
                  Retos Código
                </button>
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="activityTypeFilter() === 'quiz'"
                  (click)="activityTypeFilter.set('quiz')"
                >
                  Quizzes
                </button>
                <button
                  type="button"
                  class="filter-tab"
                  [class.is-active]="activityTypeFilter() === 'terminal'"
                  (click)="activityTypeFilter.set('terminal')"
                >
                  Terminal
                </button>
              </div>
            </div>

            <div class="card-grid">
              @for (act of filteredActivities(); track act.id) {
                <div class="item-card">
                  <div class="item-card__head">
                    <div class="badge-group">
                      <span class="badge badge-neutral">
                        {{ act.type === 'quiz' ? 'Quiz Evaluativo' : act.type === 'terminal' ? 'Terminal Linux' : 'Reto Código' }}
                      </span>
                      <span class="badge badge-subtle">{{ act.difficulty }}</span>
                    </div>
                    <span class="item-xp">+{{ act.xp_reward }} XP</span>
                  </div>

                  <h3 class="item-card__title">{{ act.title }}</h3>
                  <div class="item-card__course">📚 {{ act.course_name }}</div>
                  <p class="item-card__desc">{{ act.description }}</p>

                  @if (act.quiz_questions && act.quiz_questions.length > 0) {
                    <div class="quiz-info-box">
                      <span class="quiz-count">{{ act.quiz_questions.length }} preguntas evaluativas</span>
                      <ul class="quiz-preview-list">
                        @for (q of act.quiz_questions.slice(0, 2); track q.question) {
                          <li>• {{ q.question }}</li>
                        }
                      </ul>
                    </div>
                  }

                  @if (act.expected_output) {
                    <div class="terminal-preview-box">
                      <span class="term-tag">Salida esperada:</span>
                      <code>{{ act.expected_output }}</code>
                    </div>
                  }

                  <div class="item-card__footer">
                    <div class="meta-row">
                      <span>{{ act.author_name }}</span>
                      <span>· {{ act.submissions_count }} entregas</span>
                      <span>· {{ act.pass_rate }}% éxito</span>
                    </div>

                    <button type="button" class="btn-delete-item" (click)="deleteActivity(act.id)" title="Eliminar actividad">
                      Eliminar
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- PESTAÑA 3: RENDIMIENTO & ANALÍTICAS -->
        @if (activeTab() === 'activity' && overview()) {
          <div class="grid-two-cols">
            <!-- Feed de Actividad Reciente -->
            <div class="surface-panel">
              <h2 class="panel-heading">Resoluciones Recientes</h2>
              <p class="panel-subtext">Historial de actividades entregadas en tiempo real.</p>

              @if (overview()!.recent_activity.length === 0) {
                <p class="cell-muted" style="padding: 1.5rem 0;">No hay actividad registrada en las últimas horas.</p>
              } @else {
                <div class="activity-feed">
                  @for (act of overview()!.recent_activity; track act.id) {
                    <div class="feed-item">
                      <div class="feed-dot" [class.dot-success]="act.passed" [class.dot-danger]="!act.passed"></div>
                      <div class="feed-body">
                        <div class="feed-head">
                          <span class="cell-primary">{{ act.user_name }}</span>
                          <span class="cell-muted">{{ formatTime(act.completed_at) }}</span>
                        </div>
                        <div class="feed-meta">
                          <span>Completó: <em>{{ act.lesson_title }}</em></span>
                          @if (act.score !== null) {
                            <span class="mono-value" [class.text-success]="act.passed" [class.text-danger]="!act.passed">
                              {{ act.score }}%
                            </span>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Cursos con Mayor Demanda -->
            <div class="surface-panel">
              <h2 class="panel-heading">Demanda de Asignaturas</h2>
              <p class="panel-subtext">Distribución de estudiantes inscritos.</p>

              <div class="demand-table">
                @for (c of overview()!.popular_courses; track c.id) {
                  <div class="demand-row">
                    <div class="demand-info">
                      <span class="cell-primary">{{ c.title }}</span>
                      <span class="badge badge-subtle">{{ c.difficulty }}</span>
                    </div>
                    <div class="demand-bar-wrap">
                      <div class="demand-progress-bg">
                        <div class="demand-progress-fill" [style.width.%]="(c.enrollments_count / 1500) * 100"></div>
                      </div>
                      <span class="mono-value">{{ c.enrollments_count }} alumnos</span>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- PESTAÑA 4: ASISTENTE BYTE DOCENTE IA -->
        @if (activeTab() === 'ai') {
          <div class="grid-two-cols">
            <!-- Creador de Quizzes con IA -->
            <div class="surface-panel">
              <div class="panel-heading-group">
                <span class="badge badge-neutral">BYTE TEACHER IA</span>
                <h2 class="panel-heading">Generador Técnico de Evaluaciones</h2>
                <p class="panel-subtext">Ingresa un tema técnico y la IA generará preguntas con opciones y justificación.</p>
              </div>

              <div class="form-layout">
                <div class="field-group">
                  <label class="field-label">Tema de Evaluación</label>
                  <div class="quick-topics">
                    <button type="button" class="topic-chip" (click)="aiTopic.set('Docker y Contenedores')">Docker</button>
                    <button type="button" class="topic-chip" (click)="aiTopic.set('Linux Shell y Bash')">Linux Shell</button>
                    <button type="button" class="topic-chip" (click)="aiTopic.set('Git y Control de Versiones')">Git</button>
                    <button type="button" class="topic-chip" (click)="aiTopic.set('Punteros y Memoria en C')">Punteros C</button>
                    <button type="button" class="topic-chip" (click)="aiTopic.set('SQL y Normalización')">SQL</button>
                  </div>
                  <input
                    type="text"
                    class="field-input"
                    placeholder="Ej. Algoritmos de Grafos, Concurrencia en Go…"
                    [ngModel]="aiTopic()"
                    (ngModelChange)="aiTopic.set($event)"
                  />
                </div>

                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">Dificultad</label>
                    <select class="field-select" [ngModel]="aiDifficulty()" (ngModelChange)="aiDifficulty.set($event)">
                      <option value="Principiante">Principiante</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                    </select>
                  </div>

                  <div class="field-group">
                    <label class="field-label">Curso Destino</label>
                    <select class="field-select" [ngModel]="aiTargetCourse()" (ngModelChange)="aiTargetCourse.set($event)">
                      <option value="Introducción a la Programación">Introducción a la Programación</option>
                      <option value="Estructuras de Datos y Algoritmos">Estructuras de Datos y Algoritmos</option>
                      <option value="Sistemas Operativos y Linux">Sistemas Operativos y Linux</option>
                      <option value="Bases de Datos Relacionales">Bases de Datos Relacionales</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  class="btn btn-primary btn-block"
                  (click)="generateQuizWithAi()"
                  [disabled]="aiGenerating() || !aiTopic().trim()"
                >
                  <span>{{ aiGenerating() ? 'Generando Preguntas con IA…' : 'Generar Quiz con Byte IA' }}</span>
                </button>
              </div>

              <!-- Resultados Generados -->
              @if (aiGeneratedQuestions().length > 0) {
                <div class="generated-results">
                  <div class="results-head">
                    <span class="cell-primary">Preguntas generadas: {{ aiTopic() }}</span>
                    <button type="button" class="btn btn-outline btn-sm" (click)="saveAiQuizToActivities()">
                      Guardar en Catálogo
                    </button>
                  </div>

                  <div class="questions-stack">
                    @for (q of aiGeneratedQuestions(); track q.question; let idx = $index) {
                      <div class="q-card">
                        <span class="q-label">Pregunta #{{ idx + 1 }}</span>
                        <p class="q-text">{{ q.question }}</p>

                        <div class="options-list">
                          @for (opt of q.options; track opt; let optIdx = $index) {
                            <div class="option-row" [class.is-correct]="optIdx === q.correct_index">
                              <span class="opt-letter">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                              <span>{{ opt }}</span>
                              @if (optIdx === q.correct_index) {
                                <span class="badge badge-success" style="margin-left: auto;">Correcta</span>
                              }
                            </div>
                          }
                        </div>

                        <div class="explanation-box">
                          <strong>Justificación:</strong> {{ q.explanation }}
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Diagnóstico Pedagógico de Cohorte Dinámico -->
            <div class="surface-panel">
              <div class="panel-heading-group">
                <span class="badge badge-neutral">ANÁLISIS DE COHORTE</span>
                <h2 class="panel-heading">Estudiantes que Requieren Refuerzo</h2>
                <p class="panel-subtext">Seguimiento pedagógico para prevenir rezago académico.</p>
              </div>

              @if (studentsAtRisk().length === 0) {
                <div class="state-block" style="padding: 2rem 1rem; text-align: center;">
                  <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">✅</span>
                  <p class="state-title" style="color: #0ae98a; font-weight: 600;">Cohorte al día</p>
                  <p class="state-desc" style="color: #94a3b8; font-size: 0.85rem;">Todos los estudiantes registrados presentan actividad regular y buen rendimiento evaluativo.</p>
                </div>
              } @else {
                <div class="risk-stack">
                  @for (st of studentsAtRisk(); track st.id) {
                    <div class="risk-card">
                      <div class="risk-header">
                        <div class="avatar-box">{{ getInitials(st.name) }}</div>
                        <div>
                          <div class="cell-name">{{ st.name }}</div>
                          <div class="cell-meta">
                            {{ st.email }} · {{ !st.email_verified ? 'Cuenta pendiente de activación' : (st.completed_lessons_count + ' lecciones completadas') }}
                          </div>
                        </div>
                      </div>
                      <p class="risk-note">
                        <strong>Diagnóstico Byte:</strong>
                        @if (!st.email_verified) {
                          El estudiante no ha verificado su cuenta institucional. Se sugiere enviar recordatorio de activación.
                        } @else if (st.completed_lessons_count === 0) {
                          Inscrito en {{ st.enrollments_count }} curso(s) sin lecciones completadas aún. Recomendado asignar reto inicial guiado.
                        } @else {
                          Promedio evaluativo de {{ st.average_quiz_score }}%. Se recomienda reforzar fundamentos teóricos antes del siguiente hito.
                        }
                      </p>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- MODAL CREACIÓN ACTIVIDAD / QUIZ -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3 class="modal-title">
                {{ modalType() === 'quiz' ? 'Crear Nuevo Quiz' : 'Crear Reto de Código' }}
              </h3>
              <button type="button" class="btn-close" (click)="closeCreateModal()">✕</button>
            </div>

            <div class="modal-body">
              <div class="field-group">
                <label class="field-label">Título de la Actividad *</label>
                <input
                  type="text"
                  class="field-input"
                  placeholder="Ej. Implementación de Árbol AVL en C++"
                  [ngModel]="newActivityTitle()"
                  (ngModelChange)="newActivityTitle.set($event)"
                />
              </div>

              <div class="field-row">
                <div class="field-group">
                  <label class="field-label">Curso Destino</label>
                  <select class="field-select" [ngModel]="newActivityCourse()" (ngModelChange)="newActivityCourse.set($event)">
                    <option value="Introducción a la Programación">Introducción a la Programación</option>
                    <option value="Estructuras de Datos y Algoritmos">Estructuras de Datos y Algoritmos</option>
                    <option value="Sistemas Operativos y Linux">Sistemas Operativos y Linux</option>
                    <option value="Bases de Datos Relacionales">Bases de Datos Relacionales</option>
                  </select>
                </div>

                <div class="field-group">
                  <label class="field-label">Dificultad</label>
                  <select class="field-select" [ngModel]="newActivityDifficulty()" (ngModelChange)="newActivityDifficulty.set($event)">
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <div class="field-group">
                  <label class="field-label">Recompensa XP</label>
                  <input
                    type="number"
                    class="field-input"
                    [ngModel]="newActivityXp()"
                    (ngModelChange)="newActivityXp.set($event)"
                  />
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Descripción / Instrucciones *</label>
                <textarea
                  class="field-textarea"
                  rows="3"
                  placeholder="Objetivos pedagógicos y pautas técnicas para el estudiante…"
                  [ngModel]="newActivityDescription()"
                  (ngModelChange)="newActivityDescription.set($event)"
                ></textarea>
              </div>

              @if (modalType() === 'challenge') {
                <div class="field-group">
                  <label class="field-label">Código Inicial Starter</label>
                  <textarea
                    class="field-textarea mono-font"
                    rows="3"
                    placeholder="// Código base que verá el estudiante al iniciar..."
                    [ngModel]="newActivityStarterCode()"
                    (ngModelChange)="newActivityStarterCode.set($event)"
                  ></textarea>
                </div>

                <div class="field-group">
                  <label class="field-label">Salida Esperada / Test Case</label>
                  <input
                    type="text"
                    class="field-input mono-font"
                    placeholder="Ej. 10 20 30 40 50"
                    [ngModel]="newActivityExpectedOutput()"
                    (ngModelChange)="newActivityExpectedOutput.set($event)"
                  />
                </div>
              }

              @if (modalType() === 'quiz') {
                <div class="quiz-builder">
                  <div class="quiz-builder__head">
                    <label class="field-label">Preguntas del Quiz ({{ quizQuestionsList().length }})</label>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="addQuestionToDraft()">
                      ➕ Añadir Pregunta
                    </button>
                  </div>

                  @for (q of quizQuestionsList(); track $index; let qIdx = $index) {
                    <div class="draft-box">
                      <div class="draft-head">
                        <span class="mono-value">Pregunta #{{ qIdx + 1 }}</span>
                        @if (quizQuestionsList().length > 1) {
                          <button type="button" class="btn-delete-q" (click)="removeQuestionFromDraft(qIdx)">Eliminar</button>
                        }
                      </div>

                      <input
                        type="text"
                        class="field-input"
                        placeholder="Enunciado de la pregunta…"
                        [(ngModel)]="q.question"
                      />

                      <div class="draft-options">
                        @for (opt of q.options; track $index; let optIdx = $index) {
                          <div class="draft-opt-row">
                            <input
                              type="radio"
                              [name]="'radio_q_' + qIdx"
                              [checked]="q.correct_index === optIdx"
                              (change)="q.correct_index = optIdx"
                            />
                            <span class="opt-label">{{ ['A', 'B', 'C', 'D'][optIdx] }}</span>
                            <input
                              type="text"
                              class="field-input"
                              placeholder="Opción de respuesta…"
                              [(ngModel)]="q.options[optIdx]"
                            />
                          </div>
                        }
                      </div>

                      <input
                        type="text"
                        class="field-input"
                        placeholder="Explicación técnica de la respuesta correcta…"
                        [(ngModel)]="q.explanation"
                        style="margin-top: 0.5rem;"
                      />
                    </div>
                  }
                </div>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="closeCreateModal()">Cancelar</button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="saveNewActivity()"
                [disabled]="!newActivityTitle().trim() || !newActivityDescription().trim()"
              >
                Publicar Actividad
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL DOSSIER ESTUDIANTE -->
      @if (selectedStudentDetail()) {
        @let d = selectedStudentDetail()!;
        <div class="modal-backdrop" (click)="selectedStudentDetail.set(null)">
          <div class="modal-dialog" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="dossier-user">
                <div class="avatar-box avatar-lg">{{ getInitials(d.student.name) }}</div>
                <div>
                  <h3 class="modal-title">{{ d.student.name }}</h3>
                  <div class="cell-meta">{{ d.student.email }}</div>
                  <div style="margin-top: 4px;">
                    <span class="badge" [class.badge-success]="d.student.email_verified" [class.badge-warning]="!d.student.email_verified">
                      {{ d.student.email_verified ? 'Verificado' : 'Pendiente' }}
                    </span>
                  </div>
                </div>
              </div>
              <button type="button" class="btn-close" (click)="selectedStudentDetail.set(null)">✕</button>
            </div>

            <div class="modal-body">
              <div class="kpi-grid" style="margin-bottom: 1.5rem;">
                <div class="kpi-card">
                  <span class="kpi-label">Cursos Matriculados</span>
                  <span class="kpi-value">{{ d.academic_summary.total_enrolled }}</span>
                </div>
                <div class="kpi-card">
                  <span class="kpi-label">Lecciones Superadas</span>
                  <span class="kpi-value">{{ d.academic_summary.total_completed }}</span>
                </div>
                <div class="kpi-card">
                  <span class="kpi-label">Promedio Quizzes</span>
                  <span class="kpi-value">{{ d.academic_summary.average_score ?? 0 }}%</span>
                </div>
              </div>

              <h4 class="section-title">Cursos Inscritos</h4>
              <div class="dossier-list">
                @for (c of d.courses; track c.id) {
                  <div class="dossier-course-item">
                    <div class="feed-head">
                      <span class="cell-primary">{{ c.title }}</span>
                      <span class="mono-value">{{ c.progress_percent }}%</span>
                    </div>
                    <div class="demand-progress-bg">
                      <div class="demand-progress-fill" [style.width.%]="c.progress_percent"></div>
                    </div>
                  </div>
                }
              </div>

              <h4 class="section-title" style="margin-top: 1.5rem;">Historial Evaluativo</h4>
              @if (d.completed_lessons.length === 0) {
                <p class="cell-muted">Sin evaluaciones registradas.</p>
              } @else {
                <table class="data-table" style="font-size: 0.8rem;">
                  <thead>
                    <tr>
                      <th>Lección</th>
                      <th>Tipo</th>
                      <th>Puntaje</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (l of d.completed_lessons; track l.id) {
                      <tr>
                        <td><strong>{{ l.lesson_title }}</strong></td>
                        <td><span class="badge badge-subtle">{{ l.lesson_type }}</span></td>
                        <td>
                          @if (l.score !== null) {
                            <span [class.text-success]="l.passed" [class.text-danger]="!l.passed">
                              {{ l.score }}%
                            </span>
                          } @else {
                            <span class="cell-muted">—</span>
                          }
                        </td>
                        <td><span class="cell-muted">{{ formatDate(l.completed_at) }}</span></td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-ghost" (click)="selectedStudentDetail.set(null)">Cerrar Expediente</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      /* ESTILOS NEUTROS — PALETA COHERENTE CON SYSENGACADEMY */
      :host {
        display: block;
      }

      .teacher-page {
        min-height: calc(100vh - 64px);
        background: #08090D;
        color: #F8FAFC;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        padding-bottom: 4rem;
      }

      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 1.5rem;
      }

      /* CABECERA */
      .page-head {
        background: #08090D;
        border-bottom: 1px solid #202436;
        padding: 2rem 0 1.5rem;
      }

      .head-layout {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .sub-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        color: #94A3B8;
        background: #161926;
        border: 1px solid #202436;
        padding: 2px 8px;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #F8FAFC;
        margin: 0 0 0.35rem 0;
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.9rem;
        color: #94A3B8;
        margin: 0;
        max-width: 650px;
        line-height: 1.5;
      }

      .head-actions {
        display: flex;
        align-items: center;
        gap: 0.6rem;
        flex-wrap: wrap;
      }

      .action-toast {
        background: rgba(10, 233, 138, 0.1);
        border: 1px solid rgba(10, 233, 138, 0.35);
        border-radius: 8px;
        padding: 10px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #F8FAFC;
        font-size: 0.875rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);

        .btn-toast-close {
          background: transparent;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          font-size: 14px;
          &:hover { color: #FFF; }
        }
      }

      .btn-simulate-student {
        margin-left: auto;
        background: rgba(0, 217, 255, 0.1);
        border: 1px dashed rgba(0, 217, 255, 0.4);
        color: #00D9FF;
        border-radius: 6px;
        padding: 6px 12px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: rgba(0, 217, 255, 0.2);
          border-color: #00D9FF;
        }
      }

      /* BOTONES */
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 7px 14px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease;
        border: none;
      }

      .btn-primary {
        background: #0AE98A;
        color: #08090D;
      }
      .btn-primary:hover {
        background: #1FFFB0;
      }

      .btn-outline {
        background: #10121C;
        color: #F8FAFC;
        border: 1px solid #202436;
      }
      .btn-outline:hover {
        background: #161926;
        border-color: #2E344E;
      }

      .btn-ghost {
        background: transparent;
        color: #94A3B8;
        border: 1px solid transparent;
      }
      .btn-ghost:hover {
        background: #10121C;
        color: #F8FAFC;
      }

      .btn-sm {
        padding: 5px 10px;
        font-size: 0.78rem;
      }

      .btn-block {
        width: 100%;
        justify-content: center;
        padding: 8px;
      }

      /* KPIS NEUTROS */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
        margin: 1.5rem 0;
      }

      .kpi-card {
        background: #10121C;
        border: 1px solid #202436;
        border-radius: 8px;
        padding: 1.25rem;
        transition: border-color 0.15s ease;
      }
      .kpi-card:hover {
        border-color: #2E344E;
      }

      .kpi-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 500;
        color: #94A3B8;
        margin-bottom: 0.4rem;
      }

      .kpi-value {
        display: block;
        font-size: 1.85rem;
        font-weight: 700;
        color: #F8FAFC;
        font-family: 'JetBrains Mono', monospace;
        line-height: 1.1;
      }

      .kpi-meta {
        display: block;
        font-size: 0.75rem;
        color: #64748B;
        margin-top: 0.4rem;
      }

      /* BADGE DE CONTEO EN CABECERA DE PANEL */
      .head-count-badge {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
        font-weight: 600;
        color: #94A3B8;
        background: #161926;
        border: 1px solid #202436;
        border-radius: 9999px;
        padding: 4px 12px;
      }

      /* SUPERFICIES Y PANELES */
      .surface-panel {
        background: #10121C;
        border: 1px solid #202436;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .panel-heading {
        font-size: 1.15rem;
        font-weight: 600;
        color: #F8FAFC;
        margin: 0 0 0.25rem 0;
      }

      .panel-subtext {
        font-size: 0.85rem;
        color: #94A3B8;
        margin: 0;
      }

      .panel-head-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #202436;
      }

      /* TOOLBAR */
      .panel-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .search-input-group {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        color: #64748B;
        font-size: 0.8rem;
        pointer-events: none;
      }

      .search-box {
        background: #161926;
        border: 1px solid #202436;
        color: #F8FAFC;
        font-size: 0.85rem;
        padding: 6px 2rem 6px 2.2rem;
        border-radius: 6px;
        width: 280px;
        transition: border-color 0.15s ease;
      }
      .search-box:focus {
        outline: none;
        border-color: #2E344E;
      }

      .btn-clear {
        position: absolute;
        right: 0.6rem;
        background: none;
        border: none;
        color: #64748B;
        cursor: pointer;
      }

      .filter-pills {
        display: flex;
        gap: 4px;
        background: #161926;
        padding: 3px;
        border-radius: 6px;
        border: 1px solid #202436;
      }

      .filter-tab {
        background: transparent;
        border: none;
        color: #94A3B8;
        font-size: 0.78rem;
        font-weight: 500;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
      }
      .filter-tab:hover {
        color: #F8FAFC;
      }
      .filter-tab.is-active {
        background: #202436;
        color: #F8FAFC;
      }

      /* TABLAS */
      .table-wrap {
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }

      .data-table th {
        text-align: left;
        padding: 0.65rem 0.75rem;
        font-size: 0.72rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748B;
        border-bottom: 1px solid #202436;
      }

      .data-table td {
        padding: 0.85rem 0.75rem;
        border-bottom: 1px solid #161926;
        vertical-align: middle;
      }

      .data-table tr:hover td {
        background: rgba(255, 255, 255, 0.02);
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .avatar-box {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: #161926;
        border: 1px solid #202436;
        color: #F8FAFC;
        font-size: 11px;
        font-weight: 700;
        display: grid;
        place-items: center;
      }

      .avatar-lg {
        width: 44px;
        height: 44px;
        font-size: 14px;
      }

      .cell-name {
        font-weight: 600;
        color: #F8FAFC;
      }

      .cell-meta {
        font-size: 0.75rem;
        color: #64748B;
      }

      .cell-primary {
        font-weight: 500;
        color: #F8FAFC;
      }

      .cell-sub {
        display: block;
        font-size: 0.75rem;
        color: #64748B;
      }

      .cell-muted {
        color: #64748B;
        font-size: 0.8rem;
      }

      .mono-value {
        font-family: 'JetBrains Mono', monospace;
        color: #F8FAFC;
        font-weight: 600;
      }

      .badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 4px;
      }

      .badge-success {
        background: rgba(10, 233, 138, 0.1);
        color: #0AE98A;
        border: 1px solid rgba(10, 233, 138, 0.3);
      }

      .badge-warning {
        background: rgba(245, 158, 11, 0.1);
        color: #F59E0B;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .badge-neutral {
        background: #161926;
        color: #94A3B8;
        border: 1px solid #202436;
      }

      .badge-subtle {
        background: transparent;
        color: #64748B;
        border: 1px solid #202436;
      }

      .action-btn-group {
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: flex-end;
      }

      .action-btn {
        background: #161926;
        border: 1px solid #202436;
        color: #94A3B8;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .action-btn:hover {
        background: #202436;
        color: #F8FAFC;
      }
      .action-btn--success {
        color: #0AE98A;
      }
      .action-btn--danger {
        color: #EF4444;
      }

      /* TARJETAS DE ACTIVIDADES */
      .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 1rem;
      }

      .item-card {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        transition: border-color 0.15s ease;
      }
      .item-card:hover {
        border-color: #2E344E;
      }

      .item-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .badge-group {
        display: flex;
        gap: 4px;
      }

      .item-xp {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 600;
        color: #F59E0B;
      }

      .item-card__title {
        font-size: 1rem;
        font-weight: 600;
        color: #F8FAFC;
        margin: 0 0 0.25rem 0;
      }

      .item-card__course {
        font-size: 0.78rem;
        color: #94A3B8;
        margin-bottom: 0.6rem;
      }

      .item-card__desc {
        font-size: 0.82rem;
        color: #94A3B8;
        line-height: 1.45;
        margin-bottom: 1rem;
        flex-grow: 1;
      }

      .quiz-info-box,
      .terminal-preview-box {
        background: #10121C;
        border: 1px solid #202436;
        border-radius: 4px;
        padding: 0.65rem;
        margin-bottom: 0.85rem;
        font-size: 0.78rem;
      }

      .quiz-count,
      .term-tag {
        color: #64748B;
        font-size: 0.72rem;
        display: block;
        margin-bottom: 0.25rem;
      }

      .quiz-preview-list {
        list-style: none;
        padding: 0;
        margin: 0;
        color: #94A3B8;
      }
      .quiz-preview-list li {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .terminal-preview-box code {
        font-family: 'JetBrains Mono', monospace;
        color: #0AE98A;
      }

      .item-card__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid #161926;
        font-size: 0.72rem;
        color: #64748B;
      }

      .meta-row {
        display: flex;
        gap: 4px;
      }

      .btn-delete-item {
        background: none;
        border: none;
        color: #EF4444;
        font-size: 0.75rem;
        cursor: pointer;
      }
      .btn-delete-item:hover {
        text-decoration: underline;
      }

      /* GRID 2 COLUMNAS */
      .grid-two-cols {
        display: grid;
        grid-template-columns: 1.3fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 900px) {
        .grid-two-cols {
          grid-template-columns: 1fr;
        }
      }

      /* FEED ACTIVIDAD */
      .activity-feed {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 1rem;
      }

      .feed-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .feed-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-top: 6px;
      }
      .dot-success { background: #0AE98A; }
      .dot-danger { background: #EF4444; }

      .feed-body {
        flex-grow: 1;
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 0.65rem 0.85rem;
      }

      .feed-head {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        margin-bottom: 0.2rem;
      }

      .feed-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        color: #94A3B8;
      }

      /* DEMANDA */
      .demand-table {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .demand-row {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 0.85rem;
      }

      .demand-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;
        font-size: 0.85rem;
      }

      .demand-bar-wrap {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .demand-progress-bg {
        flex-grow: 1;
        height: 4px;
        background: #161926;
        border-radius: 9999px;
        overflow: hidden;
      }

      .demand-progress-fill {
        height: 100%;
        background: #0AE98A;
        border-radius: 9999px;
      }

      /* ASISTENTE IA */
      .quick-topics {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-bottom: 0.5rem;
      }

      .topic-chip {
        background: #161926;
        border: 1px solid #202436;
        color: #94A3B8;
        font-size: 11px;
        padding: 2px 7px;
        border-radius: 4px;
        cursor: pointer;
      }
      .topic-chip:hover {
        color: #F8FAFC;
        border-color: #2E344E;
      }

      .form-layout {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .field-label {
        font-size: 0.78rem;
        font-weight: 500;
        color: #94A3B8;
      }

      .field-input,
      .field-select,
      .field-textarea {
        background: #08090D;
        border: 1px solid #202436;
        color: #F8FAFC;
        border-radius: 6px;
        padding: 7px 10px;
        font-size: 0.85rem;
        box-sizing: border-box;
      }
      .field-input:focus,
      .field-select:focus,
      .field-textarea:focus {
        outline: none;
        border-color: #2E344E;
      }

      .mono-font {
        font-family: 'JetBrains Mono', monospace;
      }

      .generated-results {
        margin-top: 1.5rem;
        border-top: 1px solid #202436;
        padding-top: 1.25rem;
      }

      .results-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .questions-stack {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .q-card {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 1rem;
      }

      .q-label {
        font-size: 10px;
        font-weight: 700;
        color: #64748B;
        text-transform: uppercase;
      }

      .q-text {
        font-size: 0.88rem;
        font-weight: 600;
        color: #F8FAFC;
        margin: 0.25rem 0 0.65rem 0;
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 0.65rem;
      }

      .option-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #94A3B8;
        background: #10121C;
        padding: 5px 8px;
        border-radius: 4px;
      }
      .option-row.is-correct {
        color: #0AE98A;
        border: 1px solid rgba(10, 233, 138, 0.25);
      }

      .opt-letter {
        font-weight: 700;
        color: #64748B;
      }

      .explanation-box {
        font-size: 0.75rem;
        color: #94A3B8;
        background: #10121C;
        border-left: 2px solid #202436;
        padding: 0.4rem 0.65rem;
        border-radius: 0 4px 4px 0;
      }

      /* COHORT RISK */
      .risk-stack {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 1rem;
      }

      .risk-card {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 1rem;
      }

      .risk-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .risk-note {
        font-size: 0.8rem;
        color: #94A3B8;
        margin: 0;
        line-height: 1.45;
      }

      /* MODALES */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: grid;
        place-items: center;
        z-index: 1000;
        padding: 1rem;
      }

      .modal-dialog {
        background: #10121C;
        border: 1px solid #202436;
        border-radius: 8px;
        width: 100%;
        max-width: 680px;
        max-height: 90vh;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem;
        border-bottom: 1px solid #202436;
      }

      .modal-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: #F8FAFC;
        margin: 0;
      }

      .btn-close {
        background: none;
        border: none;
        color: #64748B;
        font-size: 1.1rem;
        cursor: pointer;
      }

      .modal-body {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .modal-footer {
        padding: 1rem 1.25rem;
        border-top: 1px solid #202436;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }

      /* QUIZ BUILDER EN MODAL */
      .quiz-builder {
        border-top: 1px solid #202436;
        padding-top: 1rem;
      }

      .quiz-builder__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }

      .draft-box {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 0.85rem;
        margin-bottom: 0.75rem;
      }

      .draft-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.4rem;
      }

      .btn-delete-q {
        background: none;
        border: none;
        color: #EF4444;
        font-size: 0.75rem;
        cursor: pointer;
      }

      .draft-options {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 0.5rem;
      }

      .draft-opt-row {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .opt-label {
        font-size: 0.78rem;
        font-weight: 700;
        color: #64748B;
        width: 14px;
      }

      /* DOSSIER USER */
      .dossier-user {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .section-title {
        font-size: 0.88rem;
        font-weight: 600;
        color: #F8FAFC;
        margin: 0 0 0.5rem 0;
      }

      .dossier-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .dossier-course-item {
        background: #08090D;
        border: 1px solid #202436;
        border-radius: 6px;
        padding: 0.65rem 0.85rem;
      }

      .text-success { color: #0AE98A; }
      .text-danger { color: #EF4444; }
      .text-right { text-align: right; }

      /* ESTADOS */
      .state-block {
        text-align: center;
        padding: 3rem 1rem;
        color: #94A3B8;
      }

      .state-title {
        font-size: 1rem;
        font-weight: 600;
        color: #F8FAFC;
        margin-bottom: 0.25rem;
      }

      .state-desc {
        font-size: 0.85rem;
        color: #64748B;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #202436;
        border-top-color: #0AE98A;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 0.75rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* RESPONSIVE ENGINE DOCENTE MÓVIL */
      @media (max-width: 768px) {
        .page-head {
          padding: 1.25rem 0 1rem;
        }

        .head-layout {
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }

        .page-title {
          font-size: 1.35rem;
        }

        .head-actions {
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 6px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          &::-webkit-scrollbar { display: none; }

          .btn {
            flex-shrink: 0;
            white-space: nowrap;
            font-size: 0.8rem;
            padding: 7px 12px;
          }
        }

        .kpi-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin: 1rem 0 1.25rem;

          .kpi-card {
            padding: 1rem;

            .kpi-value {
              font-size: 1.45rem;
            }
          }
        }

        .surface-panel {
          padding: 1rem;
          margin-bottom: 1.25rem;
        }

        .panel-head-row {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .panel-toolbar {
          flex-direction: column;
          align-items: stretch;
          gap: 0.75rem;
        }

        .search-input-group {
          width: 100%;
          .search-box { width: 100%; }
        }

        .filter-pills {
          overflow-x: auto;
          flex-wrap: nowrap;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          &::-webkit-scrollbar { display: none; }

          .filter-tab {
            flex-shrink: 0;
            white-space: nowrap;
            padding: 6px 12px;
          }
        }

        .table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
          border-radius: 6px;
          border: 1px solid #202436;
        }

        .data-table {
          min-width: 680px;
          width: 100%;
        }

        .card-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .modal-dialog {
          width: 95vw;
          max-width: 95vw;
          margin: 12px auto;
          max-height: 90vh;
          overflow-y: auto;
          padding: 1.25rem;
        }

        .field-row {
          flex-direction: column;
          gap: 10px;
        }
      }

      @media (max-width: 480px) {
        .kpi-grid {
          grid-template-columns: 1fr;
        }
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

  readonly sendingDigest = signal(false);
  readonly sendingStreak = signal(false);
  readonly actionNotification = signal('');

  private studentsUpdateListener = () => {
    this.loadAllData();
  };

  ngOnInit() {
    this.loadAllData();

    if (typeof window !== 'undefined') {
      window.addEventListener('teacher:students-updated', this.studentsUpdateListener);
      window.addEventListener('storage', this.studentsUpdateListener);
    }

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
    if (typeof window !== 'undefined') {
      window.removeEventListener('teacher:students-updated', this.studentsUpdateListener);
      window.removeEventListener('storage', this.studentsUpdateListener);
    }
  }

  triggerProgressDigest() {
    this.sendingDigest.set(true);
    this.teacherSvc.sendProgressDigest().subscribe({
      next: res => {
        this.sendingDigest.set(false);
        this.actionNotification.set('📨 ' + res.message);
        setTimeout(() => this.actionNotification.set(''), 6000);
      },
      error: () => this.sendingDigest.set(false),
    });
  }

  triggerStreakReminder() {
    this.sendingStreak.set(true);
    this.teacherSvc.sendStreakReminder().subscribe({
      next: res => {
        this.sendingStreak.set(false);
        this.actionNotification.set('🔥 ' + res.message);
        setTimeout(() => this.actionNotification.set(''), 6000);
      },
      error: () => this.sendingStreak.set(false),
    });
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

  readonly filteredActivities = computed(() => {
    let list = this.activities();
    const type = this.activityTypeFilter();
    if (type !== 'all') {
      list = list.filter(a => a.type === type);
    }
    return list;
  });

  readonly totalStudentsCount = computed(() => {
    return this.students().length;
  });

  readonly totalLessonsCompleted = computed(() => {
    return this.students().reduce((acc, s) => acc + (s.completed_lessons_count || 0), 0);
  });

  readonly averageQuizScore = computed(() => {
    const scored = this.students().filter(s => s.average_quiz_score !== null && s.average_quiz_score > 0);
    if (scored.length > 0) {
      const avg = scored.reduce((acc, s) => acc + (s.average_quiz_score || 0), 0) / scored.length;
      return Math.round(avg * 10) / 10;
    }
    return 0;
  });

  readonly studentsAtRisk = computed(() => {
    const list = this.students();
    return list.filter(s => {
      const lowQuizzes = s.quizzes_taken_count > 0 && (s.average_quiz_score ?? 100) < 70;
      const noProgress = s.completed_lessons_count === 0 && s.enrollments_count > 0;
      const unverified = !s.email_verified;
      return lowQuizzes || noProgress || unverified;
    }).slice(0, 5);
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
        this.students.update(all => all.filter(item => item.id !== st.id && item.email?.toLowerCase().trim() !== st.email?.toLowerCase().trim()));
        this.overview.update(ov => {
          if (!ov) return null;
          return {
            ...ov,
            stats: {
              ...ov.stats,
              total_students: Math.max(0, this.students().length),
            },
          };
        });
        this.actionNotification.set(`Estudiante "${st.name}" eliminado de la cátedra.`);
        setTimeout(() => this.actionNotification.set(''), 4000);
      },
    });
  }

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
