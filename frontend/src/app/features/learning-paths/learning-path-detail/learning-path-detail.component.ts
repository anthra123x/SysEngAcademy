import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LearningPathsService } from '../../../core/services/learning-paths.service';
import { LearningPath, LearningPathLevel, Course } from '../../../core/models';
import { AppIconComponent } from '../../../shared/components/app-icon.component';

@Component({
  selector: 'app-learning-path-detail',
  imports: [RouterLink, AppIconComponent],
  template: `
    @if (loading()) {
      <div class="container" style="padding-top: var(--sp-16); padding-bottom: var(--sp-16);">
        <div class="skeleton" style="height: 320px; border-radius: var(--radius-xl); margin-bottom: var(--sp-8);"></div>
        <div class="skeleton" style="height: 500px; border-radius: var(--radius-xl);"></div>
      </div>
    } @else if (path()) {
      <div class="path-detail">
        <!-- Hero Section -->
        <div class="path-hero">
          <div class="container path-hero__inner">
            <div class="path-hero__content">
              <div class="path-hero__badges">
                @if (path()!.category) {
                  <span class="badge badge-primary">
                    {{ path()!.category!.name }}
                  </span>
                }
                <span [class]="'badge badge-' + path()!.difficulty">{{ diffLabel(path()!.difficulty) }}</span>
                <span class="badge badge-accent">Itinerario Guiado</span>
              </div>

              <h1 class="path-title">{{ path()!.title }}</h1>
              <p class="path-desc">{{ path()!.description }}</p>

              <!-- Roadmap summary stats -->
              <div class="path-stats-bar">
                <div class="stat-box">
                  <span class="stat-box__val">{{ totalCourses() }}</span>
                  <span class="stat-box__lbl">Cursos de la Ruta</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">{{ path()!.estimated_hours }}h</span>
                  <span class="stat-box__lbl">Horas estimadas</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">{{ path()!.levels?.length ?? 0 }}</span>
                  <span class="stat-box__lbl">Hitos Troncales</span>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-box">
                  <span class="stat-box__val">{{ totalComplementaryCourses() }}</span>
                  <span class="stat-box__lbl">Complementarios</span>
                </div>
              </div>

              <!-- Direct Path Actions (Canonical Style: Solid Primary + Green Outline) -->
              <div class="path-hero__actions">
                @if (firstCourseSlug()) {
                  <a [routerLink]="['/cursos', firstCourseSlug()]" class="btn btn-primary btn-lg">
                    Comenzar Ruta
                  </a>
                } @else {
                  <a routerLink="/cursos" class="btn btn-primary btn-lg">
                    Explorar Rutas
                  </a>
                }
                <a href="#roadmap-stations" class="btn btn-outline btn-lg">
                  Ver Estaciones
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Levels / Roadmap Milestones -->
        <div id="roadmap-stations" class="container levels-section">
          <div class="levels-header">
            <div class="section-tag">Mapa de ruta interactivo</div>
            <h2>Hitos y Estaciones de Formación</h2>
            <p class="section-desc">
              Cada hito corresponde a un curso troncal del catálogo. Los cursos adicionales se presentan de forma complementaria para enriquecer tu aprendizaje sin abrumarte.
            </p>
          </div>

          <div class="roadmap-spine-container">
            @for (level of path()!.levels ?? []; track level.id; let idx = $index; let isLast = $last) {
              <div class="milestone-station" [class.is-last]="isLast">
                <!-- Spine on the Left -->
                <div class="station-spine">
                  <div class="station-node">
                    <span class="station-num">{{ formatOrder(level.order) }}</span>
                  </div>
                  @if (!isLast) {
                    <div class="station-line"></div>
                  }
                </div>

                <!-- Station Card Content -->
                <div class="station-content">
                  <div class="station-card">
                    <!-- Station Header -->
                    <header class="station-card__header">
                      <div class="station-tag-row">
                        <span class="station-pill">
                          Hito 0{{ level.order }}
                        </span>
                        <span class="station-courses-count">
                          {{ getPrimaryCourse(level) ? '1 Curso Troncal' : '' }}
                          @if (getComplementaryCourses(level).length > 0) {
                            · {{ getComplementaryCourses(level).length }} {{ getComplementaryCourses(level).length === 1 ? 'recomendación' : 'recomendaciones' }}
                          }
                        </span>
                      </div>
                      <h3 class="station-title">{{ level.title }}</h3>
                      @if (level.description) {
                        <p class="station-desc">{{ level.description }}</p>
                      }
                    </header>

                    <!-- Station Card Body: Primary Course & Complementary Recommendations -->
                    <div class="station-card__body">
                      <!-- 1. CURSO TRONCAL (Principal del catálogo para este hito) -->
                      @if (getPrimaryCourse(level); as primary) {
                        <div class="milestone-primary-block">
                          <div class="primary-label-bar">
                            <span class="primary-flag">
                              <app-icon name="check-circle" [size]="14" color="var(--primary)" />
                              CURSO TRONCAL · CATÁLOGO DE CURSOS
                            </span>
                            <span class="primary-note">Eje principal requerido para completar este hito</span>
                          </div>

                          <a [routerLink]="['/cursos', primary.slug]" class="path-course-card path-course-card--primary">
                            <div class="pcc-header">
                              <div class="pcc-icon">
                                <app-icon [category]="primary.category?.slug" [size]="22" [color]="primary.category?.color || '#0AE98A'" [strokeWidth]="2" />
                              </div>
                              <div class="pcc-badge-wrap">
                                @if (primary.category) {
                                  <span class="badge badge-category" [style.borderColor]="(primary.category.color || '#0AE98A') + '40'" [style.color]="primary.category.color || '#0AE98A'">
                                    {{ primary.category.name }}
                                  </span>
                                }
                                <span [class]="'badge badge-' + primary.difficulty">{{ diffLabel(primary.difficulty) }}</span>
                              </div>
                            </div>

                            <div class="pcc-body">
                              <h4 class="pcc-title">{{ primary.title }}</h4>
                              <p class="pcc-desc">{{ primary.description }}</p>
                            </div>

                            <div class="pcc-footer">
                              <div class="pcc-meta">
                                <span class="pcc-time"><app-icon name="clock" [size]="12" /> {{ primary.duration_hours }}h</span>
                                <span class="pcc-divider">·</span>
                                <span class="pcc-lessons"><app-icon name="book" [size]="12" /> {{ primary.lessons_count ?? 0 }} lecciones</span>
                              </div>
                              <div class="pcc-cta pcc-cta--primary">
                                <span>Iniciar Curso Troncal</span>
                                <span class="pcc-cta-arrow" aria-hidden="true">→</span>
                              </div>
                            </div>
                          </a>
                        </div>
                      }

                      <!-- 2. CURSOS COMPLEMENTARIOS / RECOMENDACIONES DEL HITO -->
                      @if (getComplementaryCourses(level).length > 0) {
                        <div class="milestone-complementary-section">
                          <div class="complementary-header">
                            <div class="comp-title-wrap">
                              <app-icon name="sparkles" [size]="15" color="#FFB800" />
                              <span class="comp-title">Recomendaciones & Cursos Complementarios</span>
                            </div>
                            <span class="comp-subtitle">Cursos del catálogo sugeridos para afianzar conceptos clave sin abrumarte</span>
                          </div>

                          <div class="complementary-grid">
                            @for (comp of getComplementaryCourses(level); track comp.id) {
                              <a [routerLink]="['/cursos', comp.slug]" class="path-course-card path-course-card--complementary">
                                <div class="pcc-header">
                                  <div class="pcc-icon pcc-icon--sm">
                                    <app-icon [category]="comp.category?.slug" [size]="18" [color]="comp.category?.color || '#FFB800'" [strokeWidth]="2" />
                                  </div>
                                  <div class="pcc-badge-wrap">
                                    <span class="badge badge-warning">
                                      💡 {{ comp.complementary_badge || 'Recomendado' }}
                                    </span>
                                    @if (comp.category) {
                                      <span class="badge badge-category" [style.borderColor]="(comp.category.color || '#FFB800') + '35'" [style.color]="comp.category.color || '#FFB800'">
                                        {{ comp.category.name }}
                                      </span>
                                    }
                                  </div>
                                </div>

                                <div class="pcc-body">
                                  <h4 class="pcc-title">{{ comp.title }}</h4>
                                  @if (comp.complementary_reason) {
                                    <div class="comp-reason-box">
                                      <span class="reason-label">¿Por qué este curso complementario?</span>
                                      <p class="reason-text">{{ comp.complementary_reason }}</p>
                                    </div>
                                  } @else {
                                    <p class="pcc-desc">{{ comp.description }}</p>
                                  }
                                </div>

                                <div class="pcc-footer">
                                  <div class="pcc-meta">
                                    <span class="pcc-time"><app-icon name="clock" [size]="12" /> {{ comp.duration_hours }}h</span>
                                    <span class="pcc-divider">·</span>
                                    <span class="pcc-lessons"><app-icon name="book" [size]="12" /> {{ comp.lessons_count ?? 0 }} lecc.</span>
                                  </div>
                                  <div class="pcc-cta pcc-cta--comp">
                                    <span>Ver complementario</span>
                                    <span class="pcc-cta-arrow" aria-hidden="true">→</span>
                                  </div>
                                </div>
                              </a>
                            }
                          </div>
                        </div>
                      }

                      <!-- 3. EMPTY STATE IF NO COURSES -->
                      @if (!getPrimaryCourse(level) && getComplementaryCourses(level).length === 0) {
                        <div class="station-empty">
                          <div class="empty-icon">
                            <app-icon name="construction" [size]="36" color="#FFB800" />
                          </div>
                          <div class="empty-content">
                            <h4>Contenido en preparación para este hito</h4>
                            <p>Los módulos y proyectos avanzados de esta etapa se están actualizando para la mejor experiencia interactiva.</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Connector Bridge to Next Milestone -->
                  @if (!isLast) {
                    <div class="milestone-bridge">
                      <div class="bridge-arrow">
                        <span>↓</span> Requisito para desbloquear el Hito {{ level.order + 1 }}
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Route-Level Catalog Cross-Recommendations -->
        @if (path()!.complementary_courses && path()!.complementary_courses!.length > 0) {
          <div class="container path-recommendations-section">
            <div class="path-rec-header">
              <div class="section-tag">Ampliación de perfil profesional</div>
              <h2>Cursos Complementarios & Recomendaciones del Catálogo</h2>
              <p class="section-desc">
                Habilidades transversales de nuestro catálogo recomendadas por el equipo docente para complementar tu aprendizaje en esta ruta.
              </p>
            </div>

            <div class="recommendations-grid">
              @for (rec of path()!.complementary_courses; track rec.id) {
                <a [routerLink]="['/cursos', rec.slug]" class="rec-course-card">
                  <div class="rec-badge-row">
                    <span class="badge badge-accent">
                      ⭐ {{ rec.complementary_badge || 'Recomendación' }}
                    </span>
                    @if (rec.category) {
                      <span class="badge badge-category" [style.borderColor]="(rec.category.color || '#0AE98A') + '40'" [style.color]="rec.category.color || '#0AE98A'">
                        {{ rec.category.name }}
                      </span>
                    }
                  </div>

                  <div class="rec-card-main">
                    <div class="rec-icon">
                      <app-icon [category]="rec.category?.slug" [size]="22" [color]="rec.category?.color || '#0AE98A'" [strokeWidth]="2" />
                    </div>
                    <div class="rec-info">
                      <h3 class="rec-title">{{ rec.title }}</h3>
                      @if (rec.reason) {
                        <p class="rec-reason">{{ rec.reason }}</p>
                      } @else {
                        <p class="rec-desc">{{ rec.description }}</p>
                      }
                    </div>
                  </div>

                  <div class="rec-footer">
                    <div class="rec-meta">
                      <span><app-icon name="clock" [size]="12" /> {{ rec.duration_hours }}h</span>
                      <span>· <app-icon name="book" [size]="12" /> {{ rec.lessons_count ?? 0 }} lecciones</span>
                      <span [class]="'badge badge-sm badge-' + rec.difficulty">{{ diffLabel(rec.difficulty) }}</span>
                    </div>
                    <span class="rec-action">Explorar curso →</span>
                  </div>
                </a>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="container" style="padding: var(--sp-20) var(--sp-4); text-align: center; min-height: 60vh; display: flex; align-items: center; justify-content: center;">
        <div class="empty-state-card" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: var(--sp-12); max-width: 520px; width: 100%; box-shadow: var(--shadow-xl);">
          <div style="margin-bottom: var(--sp-4); display: flex; justify-content: center;">
            <app-icon name="map" [size]="52" color="var(--text-muted)" />
          </div>
          <h2 style="font-size: var(--text-2xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--sp-3);">Ruta no encontrada</h2>
          <p style="color: var(--text-secondary); margin-bottom: var(--sp-6); line-height: 1.6;">La ruta de aprendizaje a la que intentas acceder no existe o está en proceso de diseño.</p>
          <div style="display: flex; gap: var(--sp-3); justify-content: center; flex-wrap: wrap;">
            <a routerLink="/rutas" class="btn btn-primary">Ver todas las Rutas</a>
            <a routerLink="/cursos" class="btn btn-outline">Explorar Cursos</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .path-detail {
      padding-bottom: calc(var(--bottom-nav-height, 60px) + 36px);
    }

    /* ---------- HERO SECTION ---------- */
    .path-hero {
      padding: var(--sp-6) 0 var(--sp-4);
      position: relative;
      background: transparent;

      &__inner {
        display: block;
        max-width: 900px;
      }

      &__content {
        min-width: 0;
      }

      &__badges {
        display: flex;
        gap: var(--sp-2);
        flex-wrap: wrap;
        margin: var(--sp-4) 0 var(--sp-3);
      }
    }

    .path-hero__actions {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      margin-top: var(--sp-6);
      flex-wrap: wrap;

      .btn-primary {
        background: var(--primary);
        color: #08090D !important;
        font-weight: var(--font-semibold);
        border: 1px solid var(--primary);

        &:visited {
          color: #08090D !important;
        }

        &:hover {
          background: var(--primary-hover);
          border-color: var(--primary-hover);
          color: #08090D !important;
          box-shadow: 0 4px 16px var(--primary-dim);
          transform: translateY(-1px);
        }
      }

      .btn-outline,
      .btn-secondary {
        background: transparent;
        border: 1px solid var(--primary);
        color: var(--primary) !important;
        font-weight: var(--font-medium);

        &:visited {
          color: var(--primary) !important;
        }

        &:hover {
          background: var(--primary-dim);
          border-color: var(--primary-hover);
          color: var(--primary-hover) !important;
          transform: translateY(-1px);
        }
      }

      @media (max-width: 540px) {
        flex-direction: column;
        width: 100%;

        .btn {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .path-title {
      font-size: clamp(2rem, 3.5vw, 3rem);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: var(--sp-4);
      text-wrap: balance;
    }

    .path-desc {
      color: var(--text-secondary);
      font-size: var(--text-base);
      line-height: 1.65;
      max-width: 68ch;
      margin-bottom: var(--sp-6);
    }

    /* Path Stats Bar */
    .path-stats-bar {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-3) var(--sp-5);
      flex-wrap: wrap;

      @media (max-width: 640px) {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 12px 14px;

        .stat-divider {
          display: none;
        }
      }
    }

    .stat-box {
      display: flex;
      flex-direction: column;
      gap: 2px;

      &__val {
        font-size: var(--text-lg);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        font-family: var(--font-mono);
      }

      &__lbl {
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
    }

    .stat-divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    /* ---------- ROADMAP LEVELS SECTION ---------- */
    .levels-section {
      padding: var(--sp-4) 0 var(--sp-16);
    }

    .levels-header {
      margin-bottom: var(--sp-10);

      .section-tag {
        font-size: var(--text-xs);
        font-weight: var(--font-bold);
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--sp-1);
      }

      h2 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-top: 4px;
        max-width: 68ch;
        line-height: 1.55;
      }
    }

    /* Roadmap Spine Container */
    .roadmap-spine-container {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .milestone-station {
      display: flex;
      gap: var(--sp-6);
      position: relative;

      @media (max-width: 768px) {
        gap: 10px;
      }
    }

    .station-spine {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
      width: 48px;

      @media (max-width: 768px) {
        width: 24px;
      }
    }

    .station-node {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--bg-surface-2);
      border: 2px solid var(--primary);
      box-shadow: 0 0 16px rgba(10, 233, 138, 0.2);
      display: grid;
      place-items: center;
      z-index: 2;
      transition: all var(--transition-base);

      .station-num {
        font-size: 0.85rem;
        font-weight: var(--font-bold);
        font-family: var(--font-mono);
        color: var(--primary);
      }

      @media (max-width: 768px) {
        width: 24px;
        height: 24px;
        border-width: 1.5px;
        box-shadow: 0 0 8px rgba(10, 233, 138, 0.25);
        .station-num {
          font-size: 0.65rem;
        }
      }
    }

    .station-line {
      flex: 1;
      width: 2px;
      background: linear-gradient(180deg, rgba(10, 233, 138, 0.4), var(--border));
      min-height: 60px;
      margin: 4px 0;

      @media (max-width: 768px) {
        margin: 2px 0;
      }
    }

    .station-content {
      flex: 1;
      min-width: 0;
      padding-bottom: var(--sp-6);

      @media (max-width: 768px) {
        padding-bottom: var(--sp-4);
      }
    }

    .station-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-md);

      @media (max-width: 768px) {
        border-radius: var(--radius-lg);
      }

      &__header {
        padding: var(--sp-6);
        border-bottom: 1px solid var(--border);

        @media (max-width: 768px) {
          padding: 12px 14px;
        }
      }

      &__body {
        padding: var(--sp-6);

        @media (max-width: 768px) {
          padding: 12px 12px 14px;
        }
      }
    }

    .station-tag-row {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      margin-bottom: var(--sp-2);
      flex-wrap: wrap;
    }

    .station-pill {
      font-size: 0.72rem;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      background: var(--primary-dim);
      color: var(--primary);
      border: 1px solid rgba(10, 233, 138, 0.25);
    }

    .station-courses-count {
      font-size: var(--text-xs);
      color: var(--text-muted);
      font-family: var(--font-mono);
    }

    .station-title {
      font-size: var(--text-xl);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: var(--sp-1);

      @media (max-width: 768px) {
        font-size: 1.15rem;
        margin-bottom: 3px;
      }
    }

    .station-desc {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.55;

      @media (max-width: 768px) {
        font-size: 0.8rem;
        line-height: 1.45;
      }
    }

    /* Primary Course Block within Milestone */
    .milestone-primary-block {
      display: flex;
      flex-direction: column;
      gap: var(--sp-3);
    }

    .primary-label-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-3);
      flex-wrap: wrap;
    }

    .primary-flag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      font-weight: var(--font-bold);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--primary);
      font-family: var(--font-mono);
    }

    .primary-note {
      font-size: var(--text-xs);
      color: var(--text-muted);
    }

    /* Course Cards */
    .path-course-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--sp-5);
      text-decoration: none;
      color: inherit;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--primary);
        box-shadow: var(--shadow-primary);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        padding: 12px 14px;
        border-radius: var(--radius-md);

        &:hover {
          transform: none;
        }
      }
    }

    .path-course-card--primary {
      background: linear-gradient(135deg, rgba(10, 233, 138, 0.05) 0%, var(--bg-surface-2) 100%);
      border: 1px solid rgba(10, 233, 138, 0.28);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);

      &:hover {
        border-color: var(--primary);
        box-shadow: 0 8px 30px rgba(10, 233, 138, 0.16);

        .pcc-cta--primary {
          background: var(--primary);
          color: #08090D !important;
          border-color: var(--primary);
          box-shadow: 0 0 16px rgba(10, 233, 138, 0.45);

          .pcc-cta-arrow {
            transform: translateX(4px);
          }
        }
      }

      .pcc-title {
        font-size: var(--text-lg);
        @media (max-width: 768px) {
          font-size: 0.95rem;
          line-height: 1.35;
          margin-bottom: 4px;
        }
      }
    }

    .pcc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--sp-3);

      @media (max-width: 768px) {
        margin-bottom: 8px;
        gap: 8px;
      }
    }

    .pcc-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-3);
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 1.25rem;

      &--sm {
        width: 32px;
        height: 32px;
      }

      @media (max-width: 768px) {
        width: 32px;
        height: 32px;
        font-size: 1rem;
      }
    }

    .pcc-badge-wrap {
      display: flex;
      gap: var(--sp-2);
      align-items: center;
      flex-wrap: wrap;

      @media (max-width: 768px) {
        gap: 4px;
      }
    }

    .badge-category {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid;
      font-size: 0.72rem;
      padding: 2px 8px;

      @media (max-width: 768px) {
        font-size: 0.65rem;
        padding: 2px 6px;
      }
    }

    .pcc-body {
      flex: 1;
      margin-bottom: var(--sp-4);

      @media (max-width: 768px) {
        margin-bottom: 10px;
      }
    }

    .pcc-title {
      font-size: var(--text-base);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--sp-1);
      line-height: 1.35;

      @media (max-width: 768px) {
        font-size: 0.95rem;
        margin-bottom: 4px;
      }
    }

    .pcc-desc {
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @media (max-width: 768px) {
        font-size: 0.78rem;
        line-height: 1.45;
        margin-bottom: 4px;
      }
    }

    .pcc-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--sp-3);
      padding-top: var(--sp-3);
      border-top: 1px solid rgba(42, 42, 62, 0.6);
      font-size: var(--text-xs);
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
        padding-top: 8px;
      }
    }

    .pcc-meta {
      color: var(--text-muted);
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;

      .pcc-divider {
        opacity: 0.5;
      }

      @media (max-width: 768px) {
        justify-content: flex-start;
        font-size: 0.72rem;
      }
    }

    .pcc-cta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: var(--radius-md);
      font-size: 0.75rem;
      font-weight: var(--font-semibold);
      font-family: var(--font-mono);
      letter-spacing: 0.02em;
      line-height: 1;
      white-space: nowrap;
      transition: all var(--transition-base);

      .pcc-cta-arrow {
        display: inline-block;
        font-size: 0.85rem;
        transition: transform var(--transition-base);
      }

      &--primary {
        background: rgba(10, 233, 138, 0.08);
        border: 1px solid rgba(10, 233, 138, 0.32);
        color: var(--primary) !important;
      }

      &--comp {
        background: rgba(255, 184, 0, 0.08);
        border: 1px solid rgba(255, 184, 0, 0.28);
        color: #FFB800 !important;
      }

      @media (max-width: 768px) {
        width: 100%;
        justify-content: center;
        padding: 9px 14px;
        font-size: 0.75rem;
        text-align: center;
      }
    }

    /* Milestone Complementary Section */
    .milestone-complementary-section {
      margin-top: var(--sp-6);
      padding: var(--sp-5);
      background: rgba(255, 184, 0, 0.03);
      border: 1px dashed rgba(255, 184, 0, 0.25);
      border-radius: var(--radius-lg);

      @media (max-width: 768px) {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: var(--radius-md);
      }
    }

    .complementary-header {
      margin-bottom: var(--sp-4);
      display: flex;
      flex-direction: column;
      gap: 2px;

      @media (max-width: 768px) {
        margin-bottom: 8px;
      }
    }

    .comp-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .comp-title {
      font-size: var(--text-sm);
      font-weight: var(--font-bold);
      color: #FFB800;
      letter-spacing: 0.02em;

      @media (max-width: 768px) {
        font-size: 0.8rem;
      }
    }

    .comp-subtitle {
      font-size: var(--text-xs);
      color: var(--text-muted);

      @media (max-width: 768px) {
        font-size: 0.72rem;
      }
    }

    .complementary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--sp-4);

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }

    .path-course-card--complementary {
      background: var(--bg-surface-2);
      border: 1px solid rgba(255, 184, 0, 0.18);

      @media (max-width: 768px) {
        padding: 10px 12px;
      }

      &:hover {
        border-color: #FFB800;
        box-shadow: 0 4px 18px rgba(255, 184, 0, 0.14);

        .pcc-cta--comp {
          background: #FFB800;
          color: #08090D !important;
          border-color: #FFB800;
          box-shadow: 0 0 14px rgba(255, 184, 0, 0.35);

          .pcc-cta-arrow {
            transform: translateX(4px);
          }
        }
      }
    }

    .comp-reason-box {
      margin-top: var(--sp-2);
      padding: 6px 10px;
      background: rgba(0, 0, 0, 0.25);
      border-left: 2px solid #FFB800;
      border-radius: 4px;
    }

    .reason-label {
      display: block;
      font-size: 0.65rem;
      font-weight: var(--font-bold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #FFB800;
      margin-bottom: 2px;
    }

    .reason-text {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.45;
      margin: 0;
    }

    /* Empty state inside milestone */
    .station-empty {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      padding: var(--sp-6);
      background: rgba(10, 10, 15, 0.3);
      border-radius: var(--radius-lg);

      .empty-icon {
        font-size: 2rem;
      }

      .empty-content {
        h4 { font-size: var(--text-sm); font-weight: var(--font-semibold); color: var(--text-primary); }
        p { font-size: var(--text-xs); color: var(--text-muted); margin-top: 2px; }
      }
    }

    /* Milestone Bridge */
    .milestone-bridge {
      display: flex;
      align-items: center;
      padding: var(--sp-4) var(--sp-6) 0;

      .bridge-arrow {
        font-size: 0.75rem;
        font-weight: var(--font-semibold);
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--primary);
        display: flex;
        align-items: center;
        gap: 6px;

        span {
          font-size: 1rem;
        }
      }
    }

    /* Route-Level Cross Recommendations Section */
    .path-recommendations-section {
      margin-top: var(--sp-16);
      padding-top: var(--sp-10);
      border-top: 1px solid var(--border);
    }

    .path-rec-header {
      margin-bottom: var(--sp-8);

      .section-tag {
        font-size: var(--text-xs);
        font-weight: var(--font-bold);
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: var(--sp-1);
      }

      h2 {
        font-size: var(--text-2xl);
        font-weight: var(--font-bold);
        color: var(--text-primary);
        letter-spacing: -0.02em;
      }

      .section-desc {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin-top: 4px;
        max-width: 68ch;
        line-height: 1.55;
      }
    }

    .recommendations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--sp-5);
    }

    .rec-course-card {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: var(--sp-5);
      text-decoration: none;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-primary);

        .rec-action {
          color: var(--primary);
          transform: translateX(3px);
        }
      }
    }

    .rec-badge-row {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      margin-bottom: var(--sp-3);
      flex-wrap: wrap;
    }

    .rec-card-main {
      display: flex;
      gap: var(--sp-3);
      flex: 1;
      margin-bottom: var(--sp-4);
    }

    .rec-icon {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--bg-surface-2);
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .rec-info {
      flex: 1;
      min-width: 0;
    }

    .rec-title {
      font-size: var(--text-base);
      font-weight: var(--font-bold);
      color: var(--text-primary);
      margin-bottom: var(--sp-1);
      line-height: 1.35;
    }

    .rec-reason {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .rec-desc {
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1.5;
    }

    .rec-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: var(--sp-3);
      border-top: 1px solid rgba(42, 42, 62, 0.6);
      font-size: var(--text-xs);
    }

    .rec-meta {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      color: var(--text-muted);
      font-family: var(--font-mono);
      flex-wrap: wrap;
    }

    .rec-action {
      color: var(--text-secondary);
      font-weight: var(--font-semibold);
      transition: all var(--transition-fast);
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      .path-stats-bar {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--sp-3);
        padding: var(--sp-4);

        .stat-divider { display: none; }
      }

      .path-hero__actions {
        flex-direction: column;
        align-items: stretch;
        .btn { width: 100%; justify-content: center; }
      }
    }
  `]
})
export class LearningPathDetailComponent implements OnInit {
  private pathsSvc = inject(LearningPathsService);
  private route    = inject(ActivatedRoute);

  path    = signal<LearningPath | null>(null);
  loading = signal(true);

  totalCourses = computed(() => {
    const p = this.path();
    if (!p) return 0;
    if (p.courses_count) return p.courses_count;
    let count = 0;
    for (const lvl of p.levels ?? []) {
      count += lvl.courses?.length ?? 0;
    }
    return count;
  });

  totalComplementaryCourses = computed(() => {
    const p = this.path();
    if (!p) return 0;
    let count = p.complementary_courses?.length ?? 0;
    for (const lvl of p.levels ?? []) {
      count += this.getComplementaryCourses(lvl).length;
    }
    return count;
  });

  firstCourseSlug = computed(() => {
    const p = this.path();
    if (!p?.levels) return null;
    for (const lvl of p.levels) {
      const primary = this.getPrimaryCourse(lvl);
      if (primary) return primary.slug;
      if (lvl.courses && lvl.courses.length > 0) {
        return lvl.courses[0].slug;
      }
    }
    return null;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading.set(true);
        this.pathsSvc.getBySlug(slug).subscribe({
          next: (p) => { this.path.set(p); this.loading.set(false); },
          error: () => { this.path.set(null); this.loading.set(false); },
        });
      }
    });
  }

  getPrimaryCourse(level: LearningPathLevel): Course | undefined {
    if (!level.courses || level.courses.length === 0) return undefined;
    // 1. Explicit primary flag
    const explicit = level.courses.find(c => c.is_primary);
    if (explicit) return explicit;
    // 2. First non-complementary course
    const nonComp = level.courses.find(c => !c.is_complementary);
    if (nonComp) return nonComp;
    // 3. Fallback: first course
    return level.courses[0];
  }

  getComplementaryCourses(level: LearningPathLevel): Course[] {
    if (!level.courses || level.courses.length === 0) return [];
    const primary = this.getPrimaryCourse(level);
    return level.courses.filter(c => c !== primary);
  }

  diffLabel(d: string): string {
    return { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' }[d] ?? d;
  }

  formatOrder(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }
}
