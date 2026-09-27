import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TeacherOverviewResponse,
  TeacherService,
  TeacherStudent,
  TeacherStudentDetail,
} from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="teacher-page">
      <!-- HEADER -->
      <header class="teacher-header">
        <div class="container header-container">
          <div class="header-left">
            <span class="role-badge">🎓 Panel Docente & Administrativo</span>
            <h1 class="header-title">Gestión Académica de Estudiantes</h1>
            <p class="header-subtitle">
              Bienvenido, <strong>{{ auth.user()?.name || 'Profesor' }}</strong>. Supervisa el progreso, actividades y rendimiento en SysEngAcademy.
            </p>
          </div>
          <div class="header-actions">
            <button type="button" class="btn btn-outline btn-refresh" (click)="loadAllData()" [disabled]="loading()">
              <span class="btn-icon">{{ loading() ? '⏳' : '🔄' }}</span>
              <span>Actualizar Datos</span>
            </button>
            <a routerLink="/cursos" class="btn btn-primary">
              <span>Ver Cursos</span>
            </a>
          </div>
        </div>
      </header>

      <div class="container main-content">
        <!-- KPI METRICS CARDS -->
        @if (overview()) {
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--blue">👥</div>
              <div class="kpi-info">
                <span class="kpi-label">Estudiantes Registrados</span>
                <span class="kpi-value">{{ overview()!.stats.total_students }}</span>
                <span class="kpi-sub">Total en plataforma</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--purple">📚</div>
              <div class="kpi-info">
                <span class="kpi-label">Cursos Activos</span>
                <span class="kpi-value">{{ overview()!.stats.total_courses }}</span>
                <span class="kpi-sub">En catálogo</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--green">✅</div>
              <div class="kpi-info">
                <span class="kpi-label">Lecciones Completadas</span>
                <span class="kpi-value">{{ overview()!.stats.total_completions }}</span>
                <span class="kpi-sub">Actividades superadas</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-icon kpi-icon--cyan">🎯</div>
              <div class="kpi-info">
                <span class="kpi-label">Promedio de Quizzes</span>
                <span class="kpi-value">{{ overview()!.stats.average_score }}%</span>
                <span class="kpi-sub">Rendimiento evaluativo</span>
              </div>
            </div>
          </div>
        }

        <!-- TABS NAVIGATION -->
        <div class="dashboard-tabs">
          <button
            type="button"
            class="dash-tab"
            [class.is-active]="activeTab() === 'students'"
            (click)="activeTab.set('students')"
          >
            <span>👥 Directorio de Estudiantes</span>
            <span class="tab-count">{{ filteredStudents().length }}</span>
          </button>
          <button
            type="button"
            class="dash-tab"
            [class.is-active]="activeTab() === 'activity'"
            (click)="activeTab.set('activity')"
          >
            <span>⚡ Actividad y Rendimiento Reciente</span>
          </button>
        </div>

        <!-- TAB 1: STUDENTS DIRECTORY & MANAGEMENT -->
        @if (activeTab() === 'students') {
          <div class="table-card">
            <!-- Search & Filter Bar -->
            <div class="table-toolbar">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                  type="text"
                  class="search-input"
                  placeholder="Buscar estudiante por nombre o correo..."
                  [ngModel]="searchQuery()"
                  (ngModelChange)="onSearchChange($event)"
                />
                @if (searchQuery()) {
                  <button type="button" class="search-clear" (click)="onSearchChange('')">✕</button>
                }
              </div>

              <div class="filter-pills">
                <button
                  type="button"
                  class="filter-pill"
                  [class.is-active]="statusFilter() === 'all'"
                  (click)="statusFilter.set('all')"
                >
                  Todos
                </button>
                <button
                  type="button"
                  class="filter-pill"
                  [class.is-active]="statusFilter() === 'verified'"
                  (click)="statusFilter.set('verified')"
                >
                  Verificados
                </button>
                <button
                  type="button"
                  class="filter-pill"
                  [class.is-active]="statusFilter() === 'unverified'"
                  (click)="statusFilter.set('unverified')"
                >
                  Pendientes
                </button>
              </div>
            </div>

            <!-- Students Table -->
            @if (loading()) {
              <div class="loading-state">
                <div class="spinner"></div>
                <p>Cargando información académica de los estudiantes…</p>
              </div>
            } @else if (filteredStudents().length === 0) {
              <div class="empty-state">
                <span class="empty-icon">👥</span>
                <h3>No se encontraron estudiantes</h3>
                <p>No hay cuentas que coincidan con los criterios de búsqueda.</p>
              </div>
            } @else {
              <div class="table-responsive">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>Estado Correo</th>
                      <th>Cursos Inscritos</th>
                      <th>Lecciones</th>
                      <th>Promedio Quizzes</th>
                      <th>Fecha Registro</th>
                      <th class="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (st of filteredStudents(); track st.id) {
                      <tr>
                        <!-- Name & Email -->
                        <td>
                          <div class="student-cell">
                            <div class="student-avatar">
                              {{ getInitials(st.name) }}
                            </div>
                            <div class="student-info">
                              <span class="student-name">{{ st.name }}</span>
                              <span class="student-email">{{ st.email }}</span>
                            </div>
                          </div>
                        </td>

                        <!-- Verified status -->
                        <td>
                          @if (st.email_verified) {
                            <span class="badge badge--success">✓ Verificado</span>
                          } @else {
                            <span class="badge badge--warning">⏳ Pendiente</span>
                          }
                        </td>

                        <!-- Enrolled Courses -->
                        <td>
                          <div class="courses-cell">
                            <span class="courses-count">{{ st.enrollments_count }} cursos</span>
                            @if (st.courses && st.courses.length > 0) {
                              <small class="courses-first">{{ st.courses[0].title }}</small>
                            }
                          </div>
                        </td>

                        <!-- Completed Lessons -->
                        <td>
                          <span class="lessons-badge">{{ st.completed_lessons_count }} lecciones</span>
                        </td>

                        <!-- Quiz Average -->
                        <td>
                          @if (st.average_quiz_score !== null) {
                            <div class="score-pill" [class.score--high]="st.average_quiz_score >= 80" [class.score--med]="st.average_quiz_score >= 60 && st.average_quiz_score < 80" [class.score--low]="st.average_quiz_score < 60">
                              {{ st.average_quiz_score }}% ({{ st.quizzes_taken_count }})
                            </div>
                          } @else {
                            <span class="text-muted">Sin evaluaciones</span>
                          }
                        </td>

                        <!-- Registered Date -->
                        <td>
                          <span class="date-text">{{ formatDate(st.created_at) }}</span>
                        </td>

                        <!-- Action Buttons -->
                        <td class="text-right">
                          <div class="row-actions">
                            <button
                              type="button"
                              class="action-btn action-btn--view"
                              (click)="viewStudentDossier(st.id)"
                              title="Ver expediente académico y progreso completo"
                            >
                              👁️ Ver
                            </button>
                            @if (!st.email_verified) {
                              <button
                                type="button"
                                class="action-btn action-btn--verify"
                                (click)="verifyStudentAccount(st)"
                                title="Verificar correo manualmente"
                              >
                                ✓ Activar
                              </button>
                            }
                            <button
                              type="button"
                              class="action-btn action-btn--delete"
                              (click)="deleteStudentAccount(st)"
                              title="Eliminar cuenta de estudiante"
                            >
                              🗑
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

        <!-- TAB 2: RECENT ACTIVITY & METRICS -->
        @if (activeTab() === 'activity' && overview()) {
          <div class="activity-grid">
            <!-- Activity Timeline -->
            <div class="activity-card">
              <div class="card-head">
                <h3>⚡ Historial de Actividades Recientes</h3>
                <small>Últimas lecciones y retos resueltos por estudiantes</small>
              </div>

              @if (overview()!.recent_activity.length === 0) {
                <p class="text-muted">No hay actividades recientes registradas.</p>
              } @else {
                <div class="activity-timeline">
                  @for (act of overview()!.recent_activity; track act.id) {
                    <div class="timeline-item">
                      <div class="timeline-marker" [class.marker--pass]="act.passed" [class.marker--fail]="!act.passed">
                        {{ act.passed ? '✓' : '✗' }}
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-head">
                          <strong>{{ act.user_name }}</strong>
                          <span class="timeline-time">{{ formatTime(act.completed_at) }}</span>
                        </div>
                        <p class="timeline-desc">
                          Completó: <em>{{ act.lesson_title }}</em>
                          @if (act.score !== null) {
                            — Puntaje: <strong [class.text-success]="act.passed" [class.text-danger]="!act.passed">{{ act.score }}%</strong>
                          }
                        </p>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Popular Courses List -->
            <div class="popular-card">
              <div class="card-head">
                <h3>🔥 Cursos con Mayor Demanda</h3>
                <small>Estudiantes inscritos activamente</small>
              </div>

              <div class="popular-list">
                @for (c of overview()!.popular_courses; track c.id) {
                  <div class="popular-item">
                    <div class="popular-info">
                      <h4 class="popular-title">{{ c.title }}</h4>
                      <span class="popular-badge">{{ c.difficulty }}</span>
                    </div>
                    <span class="popular-count">{{ c.enrollments_count }} inscritos</span>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      <!-- STUDENT DOSSIER MODAL -->
      @if (selectedStudentDetail()) {
        @let d = selectedStudentDetail()!;
        <div class="modal-backdrop" (click)="selectedStudentDetail.set(null)" role="dialog" aria-modal="true">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-user-head">
                <div class="student-avatar student-avatar--lg">
                  {{ getInitials(d.student.name) }}
                </div>
                <div>
                  <h3 class="modal-user-name">{{ d.student.name }}</h3>
                  <span class="modal-user-email">{{ d.student.email }}</span>
                  <div class="modal-badges">
                    <span class="badge" [class.badge--success]="d.student.email_verified" [class.badge--warning]="!d.student.email_verified">
                      {{ d.student.email_verified ? '✓ Correo Verificado' : '⏳ Correo Pendiente' }}
                    </span>
                    <span class="badge badge--info">Rol: {{ d.student.role }}</span>
                  </div>
                </div>
              </div>
              <button type="button" class="modal-close" (click)="selectedStudentDetail.set(null)">✕</button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
              <!-- Summary KPIs -->
              <div class="modal-kpi-row">
                <div class="m-kpi">
                  <span class="m-kpi-val">{{ d.academic_summary.total_enrolled }}</span>
                  <span class="m-kpi-lbl">Cursos Matriculados</span>
                </div>
                <div class="m-kpi">
                  <span class="m-kpi-val">{{ d.academic_summary.total_completed }}</span>
                  <span class="m-kpi-lbl">Lecciones Completadas</span>
                </div>
                <div class="m-kpi">
                  <span class="m-kpi-val">{{ d.academic_summary.quizzes_taken }}</span>
                  <span class="m-kpi-lbl">Quizzes Realizados</span>
                </div>
                <div class="m-kpi">
                  <span class="m-kpi-val">{{ d.academic_summary.average_score ?? 0 }}%</span>
                  <span class="m-kpi-lbl">Promedio Calificaciones</span>
                </div>
              </div>

              <!-- Enrolled Courses Progression -->
              <h4 class="section-title">📚 Cursos y Avance</h4>
              @if (d.courses.length === 0) {
                <p class="text-muted">El estudiante aún no se ha inscrito a ningún curso.</p>
              } @else {
                <div class="dossier-courses-list">
                  @for (c of d.courses; track c.id) {
                    <div class="dossier-course-item">
                      <div class="dci-head">
                        <strong>{{ c.title }}</strong>
                        <span class="dci-percent">{{ c.progress_percent }}%</span>
                      </div>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="c.progress_percent"></div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Completed Activities Log -->
              <h4 class="section-title" style="margin-top: 1.5rem;">✅ Historial Detallado de Lecciones y Evaluaciones</h4>
              @if (d.completed_lessons.length === 0) {
                <p class="text-muted">Sin lecciones completadas aún.</p>
              } @else {
                <div class="dossier-lessons-table-wrap">
                  <table class="dossier-table">
                    <thead>
                      <tr>
                        <th>Lección</th>
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
                          <td><span class="badge badge--dark">{{ l.lesson_type }}</span></td>
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

            <!-- Modal Footer -->
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="selectedStudentDetail.set(null)">Cerrar</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .teacher-page {
        min-height: calc(100vh - 80px);
        background: #070913;
        color: #f1f5f9;
        padding-bottom: 4rem;
      }

      .teacher-header {
        background: linear-gradient(180deg, #0d1224 0%, #070913 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        padding: 2.5rem 0 2rem;
      }

      .header-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.5rem;
      }

      .role-badge {
        display: inline-block;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: rgba(99, 102, 241, 0.2);
        color: #818cf8;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        margin-bottom: 0.5rem;
        border: 1px solid rgba(99, 102, 241, 0.3);
      }

      .header-title {
        font-size: 2rem;
        font-weight: 800;
        color: #ffffff;
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.02em;
      }

      .header-subtitle {
        color: #94a3b8;
        font-size: 0.95rem;
        margin: 0;
        max-width: 600px;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1.25rem;
        border-radius: 8px;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
      }

      .btn-primary {
        background: #00d9ff;
        color: #030712;
        border: none;
      }

      .btn-primary:hover {
        background: #0ae98a;
      }

      .btn-outline {
        background: transparent;
        color: #e2e8f0;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .btn-outline:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      /* KPI CARDS */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.25rem;
        margin-top: -1.5rem;
        margin-bottom: 2rem;
      }

      .kpi-card {
        background: #0e1326;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        transition: transform 0.2s;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .kpi-icon--blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
      .kpi-icon--purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
      .kpi-icon--green { background: rgba(16, 185, 129, 0.15); color: #34d399; }
      .kpi-icon--cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }

      .kpi-info {
        display: flex;
        flex-direction: column;
      }

      .kpi-label {
        font-size: 0.78rem;
        color: #94a3b8;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .kpi-value {
        font-size: 1.6rem;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
      }

      .kpi-sub {
        font-size: 0.72rem;
        color: #64748b;
      }

      /* DASHBOARD TABS */
      .dashboard-tabs {
        display: flex;
        gap: 0.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        margin-bottom: 1.5rem;
      }

      .dash-tab {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.95rem;
        font-weight: 600;
        padding: 0.75rem 1.25rem;
        border-bottom: 2px solid transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
      }

      .dash-tab:hover {
        color: #f1f5f9;
      }

      .dash-tab.is-active {
        color: #00d9ff;
        border-bottom-color: #00d9ff;
      }

      .tab-count {
        background: #1e293b;
        color: #94a3b8;
        padding: 0.15rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
      }

      /* TABLE CARD & TOOLBAR */
      .table-card {
        background: #0e1326;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        overflow: hidden;
      }

      .table-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 1.25rem;
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        gap: 1rem;
        flex-wrap: wrap;
      }

      .search-box {
        display: flex;
        align-items: center;
        background: #070913;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 0.45rem 0.75rem;
        width: 320px;
        gap: 0.5rem;
      }

      .search-input {
        background: transparent;
        border: none;
        outline: none;
        color: #ffffff;
        font-size: 0.85rem;
        width: 100%;
      }

      .search-clear {
        background: transparent;
        border: none;
        color: #64748b;
        cursor: pointer;
      }

      .filter-pills {
        display: flex;
        gap: 0.4rem;
      }

      .filter-pill {
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        padding: 0.35rem 0.75rem;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
      }

      .filter-pill.is-active {
        background: rgba(0, 217, 255, 0.15);
        color: #00d9ff;
        border-color: #00d9ff;
      }

      /* DATA TABLE */
      .table-responsive {
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        text-align: left;
      }

      .data-table th {
        background: rgba(0, 0, 0, 0.2);
        color: #94a3b8;
        font-weight: 600;
        padding: 0.85rem 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .data-table td {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        vertical-align: middle;
      }

      .data-table tbody tr:hover {
        background: rgba(255, 255, 255, 0.02);
      }

      .student-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .student-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #06b6d4);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .student-avatar--lg {
        width: 52px;
        height: 52px;
        font-size: 1.2rem;
      }

      .student-info {
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

      .badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.72rem;
        font-weight: 700;
      }

      .badge--success { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      .badge--warning { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      .badge--info { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
      .badge--dark { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }

      .courses-cell {
        display: flex;
        flex-direction: column;
      }

      .courses-count {
        font-weight: 600;
        color: #e2e8f0;
      }

      .courses-first {
        color: #64748b;
        font-size: 0.72rem;
        max-width: 160px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .lessons-badge {
        font-weight: 600;
        color: #38bdf8;
      }

      .score-pill {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-weight: 700;
        font-size: 0.78rem;
      }

      .score--high { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      .score--med { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      .score--low { background: rgba(239, 68, 68, 0.2); color: #f87171; }

      .date-text {
        color: #64748b;
        font-size: 0.78rem;
      }

      .text-right {
        text-align: right;
      }

      .row-actions {
        display: inline-flex;
        gap: 0.35rem;
      }

      .action-btn {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #cbd5e1;
        padding: 0.35rem 0.65rem;
        border-radius: 6px;
        font-size: 0.78rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .action-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }

      .action-btn--view:hover {
        border-color: #00d9ff;
        color: #00d9ff;
      }

      .action-btn--verify {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
        border-color: rgba(16, 185, 129, 0.3);
      }

      .action-btn--delete:hover {
        border-color: #ef4444;
        color: #ef4444;
      }

      /* ACTIVITY TAB */
      .activity-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }

      @media (max-width: 900px) {
        .activity-grid { grid-template-columns: 1fr; }
      }

      .activity-card,
      .popular-card {
        background: #0e1326;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 1.5rem;
      }

      .card-head {
        margin-bottom: 1.25rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 0.75rem;
      }

      .card-head h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #ffffff;
      }

      .card-head small {
        color: #94a3b8;
      }

      .activity-timeline {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .timeline-item {
        display: flex;
        gap: 0.75rem;
        position: relative;
      }

      .timeline-marker {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 800;
        flex-shrink: 0;
      }

      .marker--pass { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      .marker--fail { background: rgba(239, 68, 68, 0.2); color: #f87171; }

      .timeline-content {
        flex: 1;
        font-size: 0.85rem;
      }

      .timeline-head {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.2rem;
      }

      .timeline-time {
        color: #64748b;
        font-size: 0.72rem;
      }

      .timeline-desc {
        margin: 0;
        color: #cbd5e1;
      }

      .popular-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .popular-item {
        background: #070913;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.04);
      }

      .popular-title {
        margin: 0 0 0.25rem 0;
        font-size: 0.875rem;
        color: #ffffff;
      }

      .popular-badge {
        font-size: 0.68rem;
        color: #00d9ff;
        text-transform: uppercase;
      }

      .popular-count {
        font-size: 0.8rem;
        font-weight: 700;
        color: #34d399;
      }

      /* MODAL */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 1.5rem;
      }

      .modal-card {
        background: #0e1326;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        overflow: hidden;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .modal-user-head {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .modal-user-name {
        margin: 0;
        font-size: 1.2rem;
        color: #ffffff;
      }

      .modal-user-email {
        font-size: 0.8rem;
        color: #94a3b8;
      }

      .modal-badges {
        display: flex;
        gap: 0.4rem;
        margin-top: 0.35rem;
      }

      .modal-close {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 1.25rem;
        cursor: pointer;
      }

      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
      }

      .modal-kpi-row {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .m-kpi {
        background: #070913;
        padding: 0.75rem;
        border-radius: 8px;
        text-align: center;
      }

      .m-kpi-val {
        display: block;
        font-size: 1.3rem;
        font-weight: 800;
        color: #00d9ff;
      }

      .m-kpi-lbl {
        font-size: 0.68rem;
        color: #94a3b8;
      }

      .section-title {
        margin: 0 0 0.75rem 0;
        font-size: 0.95rem;
        color: #ffffff;
      }

      .dossier-courses-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .dossier-course-item {
        background: #070913;
        padding: 0.65rem 0.85rem;
        border-radius: 6px;
      }

      .dci-head {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        margin-bottom: 0.35rem;
      }

      .dci-percent {
        font-weight: 700;
        color: #34d399;
      }

      .progress-bar {
        height: 6px;
        background: #1e293b;
        border-radius: 9999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d9ff, #0ae98a);
      }

      .dossier-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
      }

      .dossier-table th {
        background: #070913;
        color: #94a3b8;
        padding: 0.5rem 0.75rem;
        text-align: left;
      }

      .dossier-table td {
        padding: 0.6rem 0.75rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: flex-end;
      }

      .loading-state,
      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #94a3b8;
      }

      .empty-icon {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
        display: block;
      }

      .spinner {
        width: 28px;
        height: 28px;
        border: 3px solid rgba(0, 217, 255, 0.2);
        border-top-color: #00d9ff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
    `
  ]
})
export class TeacherDashboardComponent implements OnInit {
  private readonly teacherSvc = inject(TeacherService);
  readonly auth = inject(AuthService);

  readonly loading = signal<boolean>(false);
  readonly overview = signal<TeacherOverviewResponse | null>(null);
  readonly students = signal<TeacherStudent[]>([]);
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<'all' | 'verified' | 'unverified'>('all');
  readonly activeTab = signal<'students' | 'activity'>('students');

  readonly selectedStudentDetail = signal<TeacherStudentDetail | null>(null);

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loading.set(true);

    this.teacherSvc.getOverview().subscribe({
      next: data => {
        this.overview.set(data);
      },
      error: () => {},
    });

    this.teacherSvc.getStudents().subscribe({
      next: data => {
        this.students.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
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

  viewStudentDossier(id: number) {
    this.teacherSvc.getStudentDetail(id).subscribe({
      next: detail => {
        this.selectedStudentDetail.set(detail);
      },
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
