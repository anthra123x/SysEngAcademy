import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

export interface DiagnosticQuestion {
  id: string;
  topic: string;
  category: 'logic' | 'oop' | 'database' | 'architecture' | 'specialty';
  title: string;
  prompt: string;
  codeSnippet?: string;
  options: { id: string; label: string; explanation?: string }[];
  correctAnswer?: string;
}

export interface SyllabusPhase {
  phaseNumber: number;
  phaseTitle: string;
  courseTitle: string;
  courseSlug: string;
  description: string;
  estimatedHours: number;
  skillsGained: string[];
}

export interface DiagnosticAnalysisResult {
  score: number;
  totalTechnical: number;
  levelNumber: number;
  levelTitle: string;
  recommendedSpecialty: string;
  recommendedPathSlug: string;
  recommendedPathTitle: string;
  primaryCourseSlug: string;
  primaryCourseTitle: string;
  competencyBreakdown: {
    logic: number;
    oop: number;
    database: number;
    architecture: number;
  };
  syllabus: SyllabusPhase[];
  agentFeedback: string;
  completedAt: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="onboarding-container">
      <!-- TOP STATUS BAR: ESTILO TERMINAL -->
      <header class="onboarding-header">
        <div class="header-left">
          <span class="term-prompt">syseng@terminal</span>:<span class="term-path">~/onboarding</span>$&nbsp;
          <span class="term-cmd">./calibrate-student.sh --mode=interactive</span>
        </div>
        <div class="header-right">
          <span class="step-badge" [class.is-done]="stage() === 'results'">
            @switch (stage()) {
              @case ('welcome') { PASO 1/4 · BIENVENIDA }
              @case ('tour') { PASO 2/4 · ORIENTACIÓN DE PLATAFORMA }
              @case ('assessment') { PASO 3/4 · EVALUACIÓN DIAGNÓSTICA ({{ currentQuestionIndex() + 1 }}/{{ questions.length }}) }
              @case ('analyzing') { PROCESANDO RESPUESTAS CON BYTE IA... }
              @case ('results') { PASO 4/4 · PLAN Y TEMARIO A MEDIDA }
            }
          </span>
          <span class="ai-status-pill">
            <span class="ai-indicator-dot"></span> BYTE IA ONLINE
          </span>
        </div>
      </header>

      <main class="onboarding-main">
        <!-- ==========================================
             FASE 0: BIENVENIDA A SYSENGACADEMY
             ========================================== -->
        @if (stage() === 'welcome') {
          <div class="welcome-card animate-fade-in">
            <div class="welcome-hero-badge">
              <span class="hero-icon">🚀</span>
              <span class="hero-tag">NUEVO ESTUDIANTE REGISTRADO</span>
            </div>

            <h1 class="welcome-title">
              ¡Bienvenido a <span class="gradient-text">SysEngAcademy</span>, {{ studentFirstName() }}!
            </h1>

            <p class="welcome-subtitle">
              La academia de ingeniería de software diseñada para dominar algoritmos, arquitectura limpia y código real
              mediante <strong>terminales interactivas en vivo</strong> y tutoría permanente impulsada por Inteligencia Artificial.
            </p>

            <div class="welcome-features-grid">
              <div class="wf-item">
                <span class="wf-icon">⚡</span>
                <div class="wf-text">
                  <strong>Práctica Deliberada</strong>
                  <span>Sin setups complicados: compila y prueba en sandboxes Linux desde tu navegador.</span>
                </div>
              </div>
              <div class="wf-item">
                <span class="wf-icon">🤖</span>
                <div class="wf-text">
                  <strong>Byte IA: Tu Mentor 24/7</strong>
                  <span>Diagnósticos socráticos en vivo, detección de fallos y recomendaciones de mejores prácticas.</span>
                </div>
              </div>
              <div class="wf-item">
                <span class="wf-icon">🔒</span>
                <div class="wf-text">
                  <strong>Maestría Verificable</strong>
                  <span>Desbloqueo secuencial por mérito: aprueba retos prácticos para avanzar de módulo.</span>
                </div>
              </div>
            </div>

            <div class="welcome-agent-intro">
              <div class="agent-avatar-box">
                <span class="agent-avatar-icon">🤖</span>
              </div>
              <div class="agent-intro-speech">
                <strong class="agent-name">Byte IA · Tutor Pedagógico</strong>
                <p>
                  "Hola, {{ studentFirstName() }}. Antes de comenzar con tu primer curso, te guiaré brevemente
                  por la academia y realizaremos una calibración diagnóstica para diseñar un <strong>temario y ruta de estudio
                  personalizados</strong> adaptados a tu nivel actual."
                </p>
              </div>
            </div>

            <div class="welcome-actions">
              <button type="button" class="btn btn-primary btn-lg" (click)="goToTour()">
                Conocer la plataforma y comenzar recorrido →
              </button>
            </div>
          </div>
        }

        <!-- ==========================================
             FASE 1: ORIENTACIÓN / TOUR DE LA PLATAFORMA
             ========================================== -->
        @if (stage() === 'tour') {
          <div class="tour-card animate-fade-in">
            <div class="tour-header">
              <span class="tour-eyebrow">GUÍA RÁPIDA DE INGENIERÍA</span>
              <h2>¿Cómo funciona el ecosistema de SysEngAcademy?</h2>
              <p>Conoce los 4 pilares tecnológicos que acelerarán tu aprendizaje:</p>
            </div>

            <div class="tour-cards-grid">
              <div class="tour-feature-card">
                <div class="tfc-number">01</div>
                <div class="tfc-icon">🖥️</div>
                <h3>Terminal Linux & Sandbox Real</h3>
                <p>
                  Cada lección de código cuenta con un entorno Linux integrado. Escribe tus algoritmos,
                  ejecuta en tiempo real con <code>[▶ run]</code> y valida casos de prueba con <code>[🧪 test]</code>.
                </p>
                <div class="tfc-preview-tag font-mono">$ ./run_solution.sh --watch</div>
              </div>

              <div class="tour-feature-card">
                <div class="tfc-number">02</div>
                <div class="tfc-icon">🤖</div>
                <h3>Diagnóstico Activo de Byte IA</h3>
                <p>
                  El agente evalúa tu código de forma automática y silenciosa. Si tienes un error de sintaxis o lógica,
                  te explica qué falló y te da recomendaciones accionables en la pestaña <strong>Copilot</strong>.
                </p>
                <div class="tfc-preview-tag font-mono">✨ Byte Copilot · Feedback socrático</div>
              </div>

              <div class="tour-feature-card">
                <div class="tfc-number">03</div>
                <div class="tfc-icon">🎯</div>
                <h3>Desbloqueo de Módulos por Dominio</h3>
                <p>
                  No puedes saltar lecciones sin demostrar competencia. El sistema o el agente deben aprobar
                  tus ejercicios prácticos para desbloquear el siguiente módulo del curso.
                </p>
                <div class="tfc-preview-tag font-mono">🔒 Validación requerida para avanzar</div>
              </div>

              <div class="tour-feature-card">
                <div class="tfc-number">04</div>
                <div class="tfc-icon">🗺️</div>
                <h3>Rutas y Certificados de Ingeniería</h3>
                <p>
                  Tus lecciones se organizan en trayectorias completas: desde Fundamentos Algorítmicos hasta
                  Arquitectura Limpia y DevOps, otorgándote insignias técnicas verificables.
                </p>
                <div class="tfc-preview-tag font-mono">🏆 Credenciales técnicas y XP</div>
              </div>
            </div>

            <div class="tour-banner">
              <div class="tb-left">
                <strong>¿Listo para calibrar tu nivel inicial?</strong>
                <span>Presentarás un breve examen de 6 preguntas para estructurar tu temario a medida.</span>
              </div>
              <div class="tb-right">
                <button type="button" class="btn btn-primary" (click)="goToAssessment()">
                  Iniciar Examen Diagnóstico ⚡
                </button>
              </div>
            </div>
          </div>
        }

        <!-- ==========================================
             FASE 2: EXAMEN DIAGNÓSTICO ADAPTATIVO
             ========================================== -->
        @if (stage() === 'assessment') {
          <div class="assessment-card animate-fade-in">
            <!-- PROGRESS BAR -->
            <div class="assessment-progress-bar">
              <div class="progress-fill" [style.width.%]="progressPercentage()"></div>
            </div>

            <div class="assessment-meta-row">
              <div class="question-tracker">
                <span class="tracker-dot"></span>
                <strong>PREGUNTA {{ currentQuestionIndex() + 1 }} DE {{ questions.length }}</strong>
              </div>
              <span class="topic-pill">{{ currentQuestion().topic }}</span>
            </div>

            <h2 class="question-title">{{ currentQuestion().title }}</h2>
            <p class="question-prompt">{{ currentQuestion().prompt }}</p>

            <!-- CODE SNIPPET (IF ANY) -->
            @if (currentQuestion().codeSnippet) {
              <div class="code-terminal-box">
                <div class="ctb-bar">
                  <span class="ctb-dot red"></span>
                  <span class="ctb-dot yellow"></span>
                  <span class="ctb-dot green"></span>
                  <span class="ctb-filename">ejercicio_diagnostico.py</span>
                </div>
                <pre class="font-mono"><code>{{ currentQuestion().codeSnippet }}</code></pre>
              </div>
            }

            <!-- OPTIONS LIST -->
            <div class="options-container">
              @for (opt of currentQuestion().options; track opt.id) {
                <button
                  type="button"
                  class="option-item"
                  [class.is-selected]="selectedOption() === opt.id"
                  (click)="selectedOption.set(opt.id)"
                >
                  <span class="option-key font-mono">{{ opt.id | uppercase }}</span>
                  <span class="option-text">{{ opt.label }}</span>
                  @if (selectedOption() === opt.id) {
                    <span class="option-check">✓</span>
                  }
                </button>
              }
            </div>

            <!-- ACTIONS -->
            <div class="assessment-footer">
              <button
                type="button"
                class="btn btn-ghost"
                (click)="prevQuestion()"
                [disabled]="currentQuestionIndex() === 0"
              >
                ← Anterior
              </button>

              <button
                type="button"
                class="btn btn-primary"
                [disabled]="!selectedOption()"
                (click)="nextQuestion()"
              >
                {{ currentQuestionIndex() < questions.length - 1 ? 'Siguiente Pregunta →' : 'Calibrar y Generar Temario 🤖' }}
              </button>
            </div>
          </div>
        }

        <!-- ==========================================
             FASE ANALYZING: PROCESANDO CON BYTE IA
             ========================================== -->
        @if (stage() === 'analyzing') {
          <div class="analyzing-card animate-fade-in">
            <div class="analyzing-spinner"></div>
            <h2>Byte IA está calibrando tus respuestas...</h2>
            <p>Calculando matrices de competencia algorítmica, OOP y diseñando tu plan de estudio personalizado.</p>
            <div class="analyzing-steps">
              <span class="as-step is-done">✓ Mapeo de respuestas técnicas</span>
              <span class="as-step is-active">⚡ Asignación de nivel y especialidad</span>
              <span class="as-step">⏳ Estructuración del temario en 3 fases</span>
            </div>
          </div>
        }

        <!-- ==========================================
             FASE 3: RESULTADOS Y TEMARIO PERSONALIZADO
             ========================================== -->
        @if (stage() === 'results' && analysisResult()) {
          <div class="results-card animate-fade-in">
            <!-- TOP HERO BANNER -->
            <div class="results-hero">
              <div class="hero-left">
                <span class="hero-level-tag">DICTAMEN TÉCNICO OFICIAL</span>
                <h1 class="hero-level-title">{{ analysisResult()!.levelTitle }}</h1>
                <div class="hero-meta-pills">
                  <span class="pill-score">
                    🎯 {{ analysisResult()!.score }}/{{ analysisResult()!.totalTechnical }} Aciertos Técnicos
                  </span>
                  <span class="pill-spec">
                    💡 Especialidad: {{ analysisResult()!.recommendedSpecialty }}
                  </span>
                  <span class="pill-xp">
                    🎁 +200 XP de Bienvenida Concedidos
                  </span>
                </div>
              </div>
              <div class="hero-right">
                <div class="level-badge-large">
                  <span class="lbl-number">Nivel {{ analysisResult()!.levelNumber }}</span>
                  <span class="lbl-status">CALIBRADO</span>
                </div>
              </div>
            </div>

            <!-- RADAR DE COMPETENCIAS -->
            <div class="competencies-grid">
              <div class="comp-box">
                <div class="comp-header">
                  <span>Lógica & Algoritmos</span>
                  <strong>{{ analysisResult()!.competencyBreakdown.logic }}%</strong>
                </div>
                <div class="comp-bar"><div class="comp-fill" [style.width.%]="analysisResult()!.competencyBreakdown.logic"></div></div>
              </div>

              <div class="comp-box">
                <div class="comp-header">
                  <span>Paradigma & POO</span>
                  <strong>{{ analysisResult()!.competencyBreakdown.oop }}%</strong>
                </div>
                <div class="comp-bar"><div class="comp-fill" [style.width.%]="analysisResult()!.competencyBreakdown.oop"></div></div>
              </div>

              <div class="comp-box">
                <div class="comp-header">
                  <span>Bases de Datos & SQL</span>
                  <strong>{{ analysisResult()!.competencyBreakdown.database }}%</strong>
                </div>
                <div class="comp-bar"><div class="comp-fill" [style.width.%]="analysisResult()!.competencyBreakdown.database"></div></div>
              </div>

              <div class="comp-box">
                <div class="comp-header">
                  <span>Arquitectura & Principios</span>
                  <strong>{{ analysisResult()!.competencyBreakdown.architecture }}%</strong>
                </div>
                <div class="comp-bar"><div class="comp-fill" [style.width.%]="analysisResult()!.competencyBreakdown.architecture"></div></div>
              </div>
            </div>

            <!-- MENSAJE DE BYTE IA -->
            <div class="agent-verdict-box">
              <div class="avb-avatar">🤖</div>
              <div class="avb-content">
                <strong>Análisis Pedagógico de Byte IA:</strong>
                <p>{{ analysisResult()!.agentFeedback }}</p>
              </div>
            </div>

            <!-- DEFINICIÓN DETALLADA DE TEMARIO PERSONALIZADO -->
            <div class="syllabus-section">
              <div class="syllabus-header">
                <h2>📚 Tu Temario de Formación a Medida (3 Fases)</h2>
                <p>Diseñado específicamente para cubrir tus áreas de oportunidad y acelerar tu maestría técnica:</p>
              </div>

              <div class="syllabus-phases-grid">
                @for (phase of analysisResult()!.syllabus; track phase.phaseNumber) {
                  <div class="phase-card" [class.is-primary]="phase.phaseNumber === 1">
                    <div class="phase-badge">
                      FASE {{ phase.phaseNumber }}
                      @if (phase.phaseNumber === 1) { <span class="primary-indicator">· ARRANQUE INMEDIATO</span> }
                    </div>

                    <h3 class="phase-title">{{ phase.phaseTitle }}</h3>
                    <div class="phase-course-target">
                      <span class="target-label">Curso Clave:</span>
                      <strong class="target-name">{{ phase.courseTitle }}</strong>
                    </div>

                    <p class="phase-desc">{{ phase.description }}</p>

                    <div class="phase-skills">
                      <span class="skills-label">Habilidades a dominar:</span>
                      <div class="skills-chips">
                        @for (skill of phase.skillsGained; track skill) {
                          <span class="skill-chip font-mono">{{ skill }}</span>
                        }
                      </div>
                    </div>

                    <div class="phase-footer">
                      <span class="phase-hours">⏱️ ~{{ phase.estimatedHours }} horas prácticas</span>
                      @if (phase.phaseNumber === 1) {
                        <a [routerLink]="['/cursos', phase.courseSlug]" class="btn btn-primary btn-sm">
                          Comenzar este Curso →
                        </a>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- FINAL CALL TO ACTION -->
            <div class="results-cta-bar">
              <div class="cta-left">
                <strong>Ruta Oficial Recomendada:</strong>
                <span>{{ analysisResult()!.recommendedPathTitle }}</span>
              </div>
              <div class="cta-right">
                <button type="button" class="btn btn-outline" (click)="recalibrate()">
                  🔄 Recalibrar Examen
                </button>
                <a [routerLink]="['/cursos', analysisResult()!.primaryCourseSlug]" class="btn btn-primary btn-lg">
                  🚀 Iniciar Mi Ruta en SysEngAcademy →
                </a>
              </div>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [
    `
      .onboarding-container {
        min-height: calc(100vh - 65px);
        background: #070a12;
        color: #f1f5f9;
        display: flex;
        flex-direction: column;
        font-family: inherit;
      }

      .onboarding-header {
        background: #090d16;
        border-bottom: 1px solid #1a2234;
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        font-size: 0.82rem;

        .term-prompt { color: #10b981; font-weight: 600; }
        .term-path { color: #38bdf8; }
        .term-cmd { color: #94a3b8; }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .step-badge {
          background: #161e2e;
          border: 1px solid #27354f;
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 0.72rem;
          letter-spacing: 0.05em;

          &.is-done {
            border-color: #10b981;
            color: #34d399;
            background: rgba(16, 185, 129, 0.08);
          }
        }

        .ai-status-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #a855f7;
          font-size: 0.72rem;
          font-weight: 600;

          .ai-indicator-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #a855f7;
            box-shadow: 0 0 8px #a855f7;
            animation: pulseAgent 1.8s infinite ease-in-out;
          }
        }
      }

      @keyframes pulseAgent {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.8); }
      }

      .onboarding-main {
        flex: 1;
        max-width: 1040px;
        width: 100%;
        margin: 0 auto;
        padding: 2.5rem 1.5rem 4rem;
      }

      /* ==========================================
         FASE 0: WELCOME
         ========================================== */
      .welcome-card {
        background: #0d121f;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 2.5rem;
        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);

        .welcome-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 0.35rem 0.85rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 9999px;
          margin-bottom: 1.25rem;

          .hero-icon { font-size: 1.1rem; }
          .hero-tag {
            color: #38bdf8;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.05em;
          }
        }

        .welcome-title {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1rem;

          .gradient-text {
            background: linear-gradient(135deg, #38bdf8, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        .welcome-subtitle {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 820px;

          strong { color: #f1f5f9; }
        }

        .welcome-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;

          .wf-item {
            background: #111726;
            border: 1px solid #1e293b;
            padding: 1.25rem;
            border-radius: 10px;
            display: flex;
            align-items: flex-start;
            gap: 1rem;

            .wf-icon { font-size: 1.5rem; flex-shrink: 0; }
            .wf-text {
              display: flex;
              flex-direction: column;
              gap: 4px;

              strong { font-size: 0.92rem; color: #e2e8f0; }
              span { font-size: 0.8rem; color: #94a3b8; line-height: 1.45; }
            }
          }
        }

        .welcome-agent-intro {
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2.5rem;

          .agent-avatar-box {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background: #7c3aed;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.6rem;
            box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
            flex-shrink: 0;
          }

          .agent-intro-speech {
            .agent-name {
              color: #c084fc;
              font-size: 0.85rem;
              display: block;
              margin-bottom: 4px;
            }
            p {
              font-size: 0.88rem;
              color: #e2e8f0;
              line-height: 1.5;
              margin: 0;
            }
          }
        }

        .welcome-actions {
          display: flex;
          justify-content: flex-end;
        }
      }

      /* ==========================================
         FASE 1: TOUR DE LA PLATAFORMA
         ========================================== */
      .tour-card {
        background: #0d121f;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 2.5rem;

        .tour-header {
          margin-bottom: 2rem;

          .tour-eyebrow {
            color: #38bdf8;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            display: block;
            margin-bottom: 6px;
          }

          h2 {
            font-size: 1.8rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
          }

          p { color: #94a3b8; font-size: 0.95rem; }
        }

        .tour-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;

          .tour-feature-card {
            background: #111726;
            border: 1px solid #1e293b;
            border-radius: 10px;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            position: relative;
            transition: transform 0.2s, border-color 0.2s;

            &:hover {
              transform: translateY(-2px);
              border-color: #38bdf8;
            }

            .tfc-number {
              position: absolute;
              top: 1rem;
              right: 1rem;
              font-family: monospace;
              font-size: 0.75rem;
              color: #475569;
              font-weight: 700;
            }

            .tfc-icon { font-size: 1.8rem; margin-bottom: 1rem; }

            h3 {
              font-size: 1rem;
              font-weight: 700;
              margin-bottom: 0.5rem;
              color: #f1f5f9;
            }

            p {
              font-size: 0.82rem;
              color: #94a3b8;
              line-height: 1.5;
              flex: 1;
              margin-bottom: 1rem;
            }

            .tfc-preview-tag {
              background: #090d16;
              border: 1px solid #1e293b;
              padding: 0.25rem 0.5rem;
              border-radius: 4px;
              font-size: 0.7rem;
              color: #38bdf8;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }

        .tour-banner {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.08));
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 10px;
          padding: 1.25rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;

          .tb-left {
            display: flex;
            flex-direction: column;
            gap: 4px;

            strong { font-size: 1rem; color: #ffffff; }
            span { font-size: 0.85rem; color: #94a3b8; }
          }
        }
      }

      /* ==========================================
         FASE 2: ASSESSMENT
         ========================================== */
      .assessment-card {
        background: #0d121f;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 2.25rem;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);

        .assessment-progress-bar {
          height: 6px;
          background: #161e2e;
          border-radius: 9999px;
          overflow: hidden;
          margin-bottom: 1.5rem;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #38bdf8, #a855f7);
            transition: width 0.3s ease;
          }
        }

        .assessment-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;

          .question-tracker {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.75rem;
            color: #94a3b8;
            letter-spacing: 0.04em;

            .tracker-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: #38bdf8;
            }
          }

          .topic-pill {
            background: #161e2e;
            color: #38bdf8;
            border: 1px solid #27354f;
            padding: 0.2rem 0.6rem;
            border-radius: 4px;
            font-size: 0.72rem;
            font-weight: 600;
          }
        }

        .question-title {
          font-size: 1.45rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #f8fafc;
        }

        .question-prompt {
          font-size: 0.95rem;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .code-terminal-box {
          background: #05080f;
          border: 1px solid #1a2234;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          overflow: hidden;

          .ctb-bar {
            background: #090d16;
            border-bottom: 1px solid #1a2234;
            padding: 0.4rem 0.8rem;
            display: flex;
            align-items: center;
            gap: 6px;

            .ctb-dot {
              width: 9px;
              height: 9px;
              border-radius: 50%;
              &.red { background: #ef4444; }
              &.yellow { background: #f59e0b; }
              &.green { background: #10b981; }
            }

            .ctb-filename {
              margin-left: 8px;
              font-size: 0.72rem;
              color: #64748b;
              font-family: monospace;
            }
          }

          pre {
            margin: 0;
            padding: 1rem;
            font-size: 0.85rem;
            line-height: 1.5;
            color: #e2e8f0;
            overflow-x: auto;
          }
        }

        .options-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;

          .option-item {
            background: #111726;
            border: 1px solid #1e293b;
            border-radius: 8px;
            padding: 1rem 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
            color: #cbd5e1;

            &:hover {
              background: #162035;
              border-color: #334155;
            }

            &.is-selected {
              background: rgba(56, 189, 248, 0.08);
              border-color: #38bdf8;
              color: #f8fafc;
            }

            .option-key {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              background: #090d16;
              border: 1px solid #1e293b;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.78rem;
              font-weight: 700;
              color: #38bdf8;
              flex-shrink: 0;
            }

            .option-text {
              flex: 1;
              font-size: 0.9rem;
              line-height: 1.45;
            }

            .option-check {
              color: #38bdf8;
              font-weight: 800;
              font-size: 1.1rem;
            }
          }
        }

        .assessment-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.25rem;
          border-top: 1px solid #1e293b;
        }
      }

      /* ==========================================
         FASE ANALYZING
         ========================================== */
      .analyzing-card {
        background: #0d121f;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 4rem 2rem;
        text-align: center;
        max-width: 600px;
        margin: 2rem auto;

        .analyzing-spinner {
          width: 54px;
          height: 54px;
          border: 4px solid #1e293b;
          border-top-color: #a855f7;
          border-radius: 50%;
          margin: 0 auto 1.5rem;
          animation: spin 1s infinite linear;
        }

        h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        p { color: #94a3b8; font-size: 0.92rem; margin-bottom: 2rem; }

        .analyzing-steps {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.85rem;

          .as-step {
            color: #64748b;
            &.is-done { color: #10b981; font-weight: 600; }
            &.is-active { color: #38bdf8; font-weight: 700; }
          }
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* ==========================================
         FASE 3: RESULTS & CUSTOM SYLLABUS
         ========================================== */
      .results-card {
        background: #0d121f;
        border: 1px solid #1e293b;
        border-radius: 14px;
        padding: 2.5rem;
        box-shadow: 0 24px 50px rgba(0, 0, 0, 0.5);

        .results-hero {
          background: linear-gradient(135deg, #111726, #161e31);
          border: 1px solid #27354f;
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;

          .hero-left {
            .hero-level-tag {
              color: #a855f7;
              font-size: 0.75rem;
              font-weight: 700;
              letter-spacing: 0.06em;
              display: block;
              margin-bottom: 6px;
            }

            .hero-level-title {
              font-size: 1.85rem;
              font-weight: 800;
              margin-bottom: 1rem;
              color: #ffffff;
            }

            .hero-meta-pills {
              display: flex;
              flex-wrap: wrap;
              gap: 0.6rem;

              span {
                font-size: 0.78rem;
                padding: 0.3rem 0.75rem;
                border-radius: 9999px;
                font-weight: 600;
              }

              .pill-score { background: rgba(56, 189, 248, 0.12); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
              .pill-spec { background: rgba(168, 85, 247, 0.12); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
              .pill-xp { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
            }
          }

          .hero-right {
            .level-badge-large {
              background: #090d16;
              border: 2px solid #a855f7;
              box-shadow: 0 0 20px rgba(168, 85, 247, 0.35);
              border-radius: 12px;
              padding: 1.25rem 2rem;
              text-align: center;
              display: flex;
              flex-direction: column;
              gap: 4px;

              .lbl-number { font-size: 1.4rem; font-weight: 800; color: #f1f5f9; }
              .lbl-status { font-size: 0.68rem; color: #10b981; font-weight: 700; letter-spacing: 0.1em; }
            }
          }
        }

        .competencies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;

          .comp-box {
            background: #111726;
            border: 1px solid #1e293b;
            padding: 1rem 1.25rem;
            border-radius: 8px;

            .comp-header {
              display: flex;
              justify-content: space-between;
              font-size: 0.82rem;
              margin-bottom: 8px;
              color: #94a3b8;

              strong { color: #f1f5f9; }
            }

            .comp-bar {
              height: 6px;
              background: #1e293b;
              border-radius: 9999px;
              overflow: hidden;

              .comp-fill {
                height: 100%;
                background: linear-gradient(90deg, #38bdf8, #10b981);
                border-radius: 9999px;
              }
            }
          }
        }

        .agent-verdict-box {
          background: rgba(168, 85, 247, 0.06);
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 2.5rem;

          .avb-avatar {
            font-size: 1.8rem;
            flex-shrink: 0;
            padding-top: 2px;
          }

          .avb-content {
            strong {
              color: #c084fc;
              font-size: 0.88rem;
              display: block;
              margin-bottom: 4px;
            }
            p {
              color: #cbd5e1;
              font-size: 0.9rem;
              line-height: 1.55;
              margin: 0;
            }
          }
        }

        .syllabus-section {
          margin-bottom: 2.5rem;

          .syllabus-header {
            margin-bottom: 1.5rem;
            h2 { font-size: 1.45rem; font-weight: 800; margin-bottom: 0.4rem; }
            p { font-size: 0.88rem; color: #94a3b8; }
          }

          .syllabus-phases-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.25rem;

            .phase-card {
              background: #111726;
              border: 1px solid #1e293b;
              border-radius: 10px;
              padding: 1.5rem;
              display: flex;
              flex-direction: column;
              transition: all 0.2s;

              &.is-primary {
                border-color: #38bdf8;
                box-shadow: 0 8px 24px rgba(56, 189, 248, 0.12);
              }

              .phase-badge {
                font-size: 0.72rem;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 0.05em;
                margin-bottom: 0.75rem;

                .primary-indicator { color: #38bdf8; font-weight: 800; }
              }

              .phase-title {
                font-size: 1.1rem;
                font-weight: 700;
                color: #f8fafc;
                margin-bottom: 0.75rem;
              }

              .phase-course-target {
                background: #090d16;
                border: 1px solid #1e293b;
                padding: 0.5rem 0.75rem;
                border-radius: 6px;
                margin-bottom: 1rem;
                font-size: 0.8rem;
                display: flex;
                flex-direction: column;
                gap: 2px;

                .target-label { color: #64748b; font-size: 0.68rem; }
                .target-name { color: #38bdf8; font-weight: 600; }
              }

              .phase-desc {
                font-size: 0.82rem;
                color: #94a3b8;
                line-height: 1.5;
                flex: 1;
                margin-bottom: 1.25rem;
              }

              .phase-skills {
                margin-bottom: 1.25rem;

                .skills-label {
                  font-size: 0.72rem;
                  color: #64748b;
                  display: block;
                  margin-bottom: 6px;
                }

                .skills-chips {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 4px;

                  .skill-chip {
                    background: #090d16;
                    border: 1px solid #1e293b;
                    color: #cbd5e1;
                    padding: 0.15rem 0.45rem;
                    border-radius: 3px;
                    font-size: 0.7rem;
                  }
                }
              }

              .phase-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-top: 1rem;
                border-top: 1px solid #1a2333;

                .phase-hours {
                  font-size: 0.75rem;
                  color: #64748b;
                }
              }
            }
          }
        }

        .results-cta-bar {
          background: #090d16;
          border: 1px solid #27354f;
          border-radius: 10px;
          padding: 1.25rem 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;

          .cta-left {
            display: flex;
            flex-direction: column;
            gap: 4px;

            strong { color: #64748b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
            span { color: #38bdf8; font-size: 1.05rem; font-weight: 700; }
          }

          .cta-right {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
          }
        }
      }

      /* BOTONES */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        border-radius: 8px;
        padding: 0.65rem 1.25rem;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        border: none;

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        &.btn-primary {
          background: linear-gradient(135deg, #0284c7, #2563eb);
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);

          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(2, 132, 199, 0.6);
          }
        }

        &.btn-outline {
          background: transparent;
          border: 1px solid #334155;
          color: #cbd5e1;

          &:hover:not(:disabled) {
            background: #1e293b;
            color: #ffffff;
          }
        }

        &.btn-ghost {
          background: transparent;
          color: #94a3b8;

          &:hover:not(:disabled) {
            color: #ffffff;
          }
        }

        &.btn-sm {
          padding: 0.45rem 0.85rem;
          font-size: 0.8rem;
        }

        &.btn-lg {
          padding: 0.85rem 1.6rem;
          font-size: 1rem;
        }
      }

      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
      }

      .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .welcome-card, .tour-card, .assessment-card, .results-card {
          padding: 1.5rem;
        }
        .results-hero {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `
  ]
})
export class OnboardingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Etapas del onboarding
  readonly stage = signal<'welcome' | 'tour' | 'assessment' | 'analyzing' | 'results'>('welcome');

  // Estado del usuario
  readonly user = this.auth.user;
  readonly studentFirstName = computed(() => {
    const full = this.user()?.name || 'Estudiante';
    return full.split(' ')[0];
  });

  // Estado del examen diagnóstico
  readonly currentQuestionIndex = signal<number>(0);
  readonly selectedOption = signal<string | null>(null);
  readonly userAnswers = signal<Record<string, string>>({});
  readonly analysisResult = signal<DiagnosticAnalysisResult | null>(null);

  // Preguntas técnicas calibradas
  readonly questions: DiagnosticQuestion[] = [
    {
      id: 'q1',
      topic: 'Algoritmos & Complejidad Asintótica',
      category: 'logic',
      title: 'Análisis de Complejidad Temporal (Big-O)',
      prompt: 'Observa el siguiente algoritmo de Búsqueda Binaria. ¿Cuál es su complejidad temporal en el peor caso y por qué?',
      codeSnippet: `def busqueda_binaria(arr: list[int], objetivo: int) -> int:
    izq, der = 0, len(arr) - 1
    while izq <= der:
        medio = (izq + der) // 2
        if arr[medio] == objetivo:
            return medio
        elif arr[medio] < objetivo:
            izq = medio + 1
        else:
            der = medio - 1
    return -1`,
      options: [
        { id: 'a', label: 'O(N), porque en el peor de los casos debe recorrer cada elemento secuencialmente.' },
        { id: 'b', label: 'O(log N), porque el espacio de búsqueda se reduce a la mitad en cada iteración del bucle.' },
        { id: 'c', label: 'O(N log N), debido al costo acumulado de la división entera en cada paso.' },
        { id: 'd', label: 'O(1), porque accede por índice directo al elemento central.' }
      ],
      correctAnswer: 'b'
    },
    {
      id: 'q2',
      topic: 'Fundamentos de Lenguajes & Memoria',
      category: 'logic',
      title: 'Mutabilidad y Paso de Parámetros por Referencia',
      prompt: 'En lenguajes de alto nivel como Python, ¿qué salida imprimirá exactamente la ejecución de este código?',
      codeSnippet: `def registrar_sensor(datos, nuevo_valor):
    datos.append(nuevo_valor)
    return len(datos)

sensores = [101, 102]
total = registrar_sensor(sensores, 103)
print(sensores, total)`,
      options: [
        { id: 'a', label: '[101, 102, 103] 3 (Las listas son mutables y la modificación afecta al llamador).' },
        { id: 'b', label: '[101, 102] 3 (Las funciones operan sobre copias locales aisladas).' },
        { id: 'c', label: '[101, 102, 103] [101, 102, 103] (Retorna la lista completa modificada).' },
        { id: 'd', label: 'Error de ejecución: NameError al intentar modificar sensores.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q3',
      topic: 'Programación Orientada a Objetos',
      category: 'oop',
      title: 'Principio de Encapsulamiento e Invariantes',
      prompt: '¿Cuál es la principal ventaja arquitectónica de definir un método depositar() en lugar de modificar cuenta._saldo directamente desde afuera?',
      codeSnippet: `class CuentaBancaria:
    def __init__(self, saldo_inicial: float):
        self._saldo = saldo_inicial  # atributo protegido

    def depositar(self, monto: float) -> bool:
        if monto > 0:
            self._saldo += monto
            return True
        return False`,
      options: [
        { id: 'a', label: 'Permite validar invariantes de negocio (monto > 0) y protege el estado interno de corrupciones.' },
        { id: 'b', label: 'Python prohíbe sintácticamente modificar variables que tengan guion bajo.' },
        { id: 'c', label: 'Hace que el recolector de basura de memoria libere la clase más rápidamente.' },
        { id: 'd', label: 'No tiene ventaja técnica, es solo una convención estética opcional.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q4',
      topic: 'Bases de Datos Relacionales & SQL',
      category: 'database',
      title: 'Consultas con LEFT JOIN y Registros Huérfanos',
      prompt: 'En PostgreSQL o motores relacionales, ¿qué conjunto exacto de datos devuelve esta consulta?',
      codeSnippet: `SELECT u.id, u.nombre
FROM usuarios u
LEFT JOIN pedidos p ON u.id = p.usuario_id
WHERE p.id IS NULL;`,
      options: [
        { id: 'a', label: 'Todos los usuarios que tienen al menos un pedido registrado.' },
        { id: 'b', label: 'Los usuarios que NUNCA han realizado ningún pedido en el sistema.' },
        { id: 'c', label: 'Los pedidos que fueron cancelados o están en estado nulo.' },
        { id: 'd', label: 'Genera un error porque WHERE no puede filtrar sobre columnas de un LEFT JOIN.' }
      ],
      correctAnswer: 'b'
    },
    {
      id: 'q5',
      topic: 'Arquitectura de Software & Principios SOLID',
      category: 'architecture',
      title: 'Separación de Responsabilidades (SRP)',
      prompt: 'Si una clase ControladorPedido procesa la solicitud HTTP, valida el JSON, ejecuta consultas SQL directas y envía correos por SMTP, ¿qué principio clave se vulnera?',
      codeSnippet: `// Clase con múltiples responsabilidades
class ControladorPedido {
    public function crear(Request $req) {
        $data = $this->validarJSON($req);
        DB::insert('INSERT INTO pedidos ...', $data);
        Mail::to($data['email'])->send(new FacturaMail());
    }
}`,
      options: [
        { id: 'a', label: 'Principio de Responsabilidad Única (SRP): la clase tiene múltiples razones para cambiar.' },
        { id: 'b', label: 'Principio de Sustitución de Liskov (LSP).' },
        { id: 'c', label: 'Principio de Segregación de Interfaces (ISP).' },
        { id: 'd', label: 'Ninguno, es el diseño recomendado en microframeworks modernos.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q6',
      topic: 'Especialización Profesional Deseada',
      category: 'specialty',
      title: 'Área Prioritaria de Formación',
      prompt: '¿En qué rama de la ingeniería de software te gustaría enfocar tu plan de estudio en SysEngAcademy?',
      options: [
        { id: 'backend', label: 'Desarrollo Backend & APIs: Arquitectura en capas, bases de datos SQL y microservicios.' },
        { id: 'algoritmos', label: 'Lógica Algorítmica & Ciencias de la Computación: Estructuras de datos, optimización y Big-O.' },
        { id: 'web', label: 'Desarrollo Web Fullstack: Interfaces reactivas modernas, integración de APIs y ecosistema Web.' },
        { id: 'arquitectura', label: 'Arquitectura de Software & DevOps: Patrones GoF, Clean Architecture y sistemas escalables.' }
      ]
    }
  ];

  readonly currentQuestion = computed(() => this.questions[this.currentQuestionIndex()]);
  readonly progressPercentage = computed(() =>
    Math.round(((this.currentQuestionIndex() + 1) / this.questions.length) * 100)
  );

  ngOnInit() {
    // Si ya completó el diagnóstico previamente y llega aquí, cargamos sus resultados
    const existing = this.auth.getDiagnosticResult();
    if (existing && existing.syllabus) {
      this.analysisResult.set(existing);
      // Si la URL no pide explícitamente recalibrar, mostramos los resultados
      this.stage.set('results');
    }
  }

  goToTour() {
    this.stage.set('tour');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToAssessment() {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(this.userAnswers()['q1'] || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextQuestion() {
    const sel = this.selectedOption();
    if (!sel) return;

    // Guardar respuesta actual
    const qId = this.currentQuestion().id;
    this.userAnswers.update(prev => ({ ...prev, [qId]: sel }));

    if (this.currentQuestionIndex() < this.questions.length - 1) {
      const nextIdx = this.currentQuestionIndex() + 1;
      this.currentQuestionIndex.set(nextIdx);
      const nextQ = this.questions[nextIdx];
      this.selectedOption.set(this.userAnswers()[nextQ.id] || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Finalizar examen
      this.finishAssessment();
    }
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      const prevIdx = this.currentQuestionIndex() - 1;
      this.currentQuestionIndex.set(prevIdx);
      const prevQ = this.questions[prevIdx];
      this.selectedOption.set(this.userAnswers()[prevQ.id] || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private finishAssessment() {
    this.stage.set('analyzing');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      this.computeDiagnosisAndSyllabus();
      this.stage.set('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  private computeDiagnosisAndSyllabus() {
    const answers = this.userAnswers();
    let score = 0;
    const totalTechnical = 5;

    // Calificar preguntas técnicas (q1 a q5)
    const isQ1Correct = answers['q1'] === 'b';
    const isQ2Correct = answers['q2'] === 'a';
    const isQ3Correct = answers['q3'] === 'a';
    const isQ4Correct = answers['q4'] === 'b';
    const isQ5Correct = answers['q5'] === 'a';

    if (isQ1Correct) score++;
    if (isQ2Correct) score++;
    if (isQ3Correct) score++;
    if (isQ4Correct) score++;
    if (isQ5Correct) score++;

    // Desglose de competencias
    const logicScore = Math.round((( (isQ1Correct ? 1 : 0) + (isQ2Correct ? 1 : 0) ) / 2) * 100);
    const oopScore = isQ3Correct ? 100 : 35;
    const databaseScore = isQ4Correct ? 100 : 40;
    const architectureScore = isQ5Correct ? 100 : 35;

    // Preferencia de especialización
    const specialtyPref = answers['q6'] || 'backend';

    let levelNumber = 1;
    let levelTitle = '';
    let agentFeedback = '';
    let syllabus: SyllabusPhase[] = [];
    let recommendedPathSlug = 'fundamentos-programacion';
    let recommendedPathTitle = 'Fundamentos de Programación y Pensamiento Algorítmico';
    let primaryCourseSlug = 'introduccion-programacion';
    let primaryCourseTitle = 'Introducción a la Programación';
    let recommendedSpecialty = 'Lógica & Algoritmos';

    if (score <= 2) {
      // NIVEL 1: INICIACIÓN / JUNIOR I
      levelNumber = 1;
      levelTitle = 'Nivel 1: Junior I · Fundamentos y Lógica Computacional';
      recommendedSpecialty = 'Fundamentos Algorítmicos';
      recommendedPathSlug = 'fundamentos-programacion';
      recommendedPathTitle = 'Ruta de Fundamentos de Programación';
      primaryCourseSlug = 'introduccion-programacion';
      primaryCourseTitle = 'Introducción a la Programación';

      agentFeedback =
        `Identificamos que tienes gran entusiasmo pero requieres afianzar las bases de la algoritmia, ` +
        `complejidad computacional Big-O y control de flujo antes de adentrarte en arquitecturas complejas. ` +
        `Diseñamos para ti un temario que te llevará paso a paso desde la lógica pura hasta algoritmos estructurados.`;

      syllabus = [
        {
          phaseNumber: 1,
          phaseTitle: 'Arranque: Lógica & Pensamiento Algorítmico',
          courseTitle: 'Introducción a la Programación',
          courseSlug: 'introduccion-programacion',
          description: 'Aprende variables, condicionales, ciclos y diagramas de flujo sin fricción sintáctica en el sandbox.',
          estimatedHours: 12,
          skillsGained: ['Pensamiento Lógico', 'Estructuras de Control', 'Funciones']
        },
        {
          phaseNumber: 2,
          phaseTitle: 'Estructuración: Programación Modular con Python',
          courseTitle: 'Programación Estructurada con Python',
          courseSlug: 'python-estructurado',
          description: 'Domina funciones, alcance de variables, listas, diccionarios y resolución estructurada de problemas.',
          estimatedHours: 14,
          skillsGained: ['Python Moderno', 'Mutabilidad de Datos', 'Modularización']
        },
        {
          phaseNumber: 3,
          phaseTitle: 'Consolidación: Algoritmos de Ordenamiento & Big-O',
          courseTitle: 'Algoritmos de Ordenamiento',
          courseSlug: 'algoritmos-ordenamiento',
          description: 'Comprende cómo los algoritmos optimizan recursos de cómputo: Bubble, Merge y Quick Sort.',
          estimatedHours: 8,
          skillsGained: ['Complejidad Asintótica', 'Notación Big-O', 'Recursión']
        }
      ];
    } else if (score <= 4) {
      // NIVEL 2: INTERMEDIO / JUNIOR II / MID
      levelNumber = 2;
      levelTitle = 'Nivel 2: Junior II / Mid · Paradigma de Objetos & Backend';
      recommendedSpecialty = specialtyPref === 'backend' ? 'Desarrollo Backend & APIs' : 'Programación Orientada a Objetos';
      recommendedPathSlug = 'programacion-orientada-a-objetos';
      recommendedPathTitle = 'Ruta de Programación Orientada a Objetos y Arquitectura';
      primaryCourseSlug = 'clases-objetos-herencia';
      primaryCourseTitle = 'Clases, Objetos y Herencia';

      agentFeedback =
        `¡Excelente desempeño! Demostraste comprensión sólida de algoritmos y estructuras de datos básicas. ` +
        `Tu siguiente escalón técnico consiste en dominar la Programación Orientada a Objetos rigurosa, ` +
        `el encapsulamiento con invariantes de negocio y bases de datos relacionales SQL.`;

      syllabus = [
        {
          phaseNumber: 1,
          phaseTitle: 'Arranque: Clases, Encapsulamiento y Modelado POO',
          courseTitle: 'Clases, Objetos y Herencia',
          courseSlug: 'clases-objetos-herencia',
          description: 'Modela entidades reales con atributos protegidos, constructores y métodos con responsabilidades claras.',
          estimatedHours: 16,
          skillsGained: ['POO Avanzada', 'Encapsulamiento', 'Polimorfismo']
        },
        {
          phaseNumber: 2,
          phaseTitle: 'Persistencia: SQL Relacional desde Cero',
          courseTitle: 'SQL desde Cero',
          courseSlug: 'sql-desde-cero',
          description: 'Aprende consultas complejas, JOINs relacionales, índices y diseño de esquemas en PostgreSQL.',
          estimatedHours: 10,
          skillsGained: ['PostgreSQL', 'JOINs & Agrupaciones', 'Integridad Referencial']
        },
        {
          phaseNumber: 3,
          phaseTitle: 'Clean Code: Principios SOLID en la Práctica',
          courseTitle: 'Principios SOLID en la práctica',
          courseSlug: 'principios-solid',
          description: 'Aplica SRP, OCP, LSP, ISP y DIP para crear software mantenible, desacoplado y listo para producción.',
          estimatedHours: 18,
          skillsGained: ['Principios SOLID', 'Refactorización', 'Inyección de Dependencias']
        }
      ];
    } else {
      // NIVEL 3: AVANZADO / SENIOR
      levelNumber = 3;
      levelTitle = 'Nivel 3: Senior / Advanced · Arquitectura Limpia & Sistemas';
      recommendedSpecialty = 'Arquitectura de Software & Patrones de Diseño';
      recommendedPathSlug = 'programacion-orientada-a-objetos';
      recommendedPathTitle = 'Ruta de Arquitectura de Software Avanzada';
      primaryCourseSlug = 'patrones-de-diseno';
      primaryCourseTitle = 'Patrones de Diseño (GoF)';

      agentFeedback =
        `¡Nivel sobresaliente! Respondiste con precisión sobre complejidad algorítmica, mutabilidad de memoria, ` +
        `encapsulamiento y principios de arquitectura SOLID. Tu plan de estudio omitirá conceptos básicos ` +
        `para enfocarse directamente en Patrones de Diseño GoF, Clean Architecture y sistemas escalables.`;

      syllabus = [
        {
          phaseNumber: 1,
          phaseTitle: 'Arranque: Patrones de Diseño GoF en Python',
          courseTitle: 'Patrones de Diseño',
          courseSlug: 'patrones-de-diseno',
          description: 'Soluciones estructurales, creacionales y comportamentales probadas para software de gran envergadura.',
          estimatedHours: 20,
          skillsGained: ['Patrones GoF', 'Factory & Singleton', 'Observer & Strategy']
        },
        {
          phaseNumber: 2,
          phaseTitle: 'Arquitectura: Proyecto Final de Arquitectura POO',
          courseTitle: 'Proyecto Final: Arquitectura de Software Orientada a Objetos',
          courseSlug: 'arquitectura-proyecto-poo',
          description: 'Construye un sistema completo con arquitectura en capas, entidades ricas y repositorios.',
          estimatedHours: 16,
          skillsGained: ['Layered Architecture', 'Repository Pattern', 'Dominio Rico']
        },
        {
          phaseNumber: 3,
          phaseTitle: 'Ingeniería Avanzada: Git Profesional & CI/CD',
          courseTitle: 'Git Avanzado: Rebase, Cherry-Pick y Conflictos Complejos',
          courseSlug: 'git-avanzado-rebase-cherry-pick-conflictos-complejos',
          description: 'Domina los flujos de colaboración en equipos distribuidos de alto rendimiento.',
          estimatedHours: 10,
          skillsGained: ['Git Rebase', 'Worktrees & Bisect', 'Resolución de Conflictos']
        }
      ];
    }

    const result: DiagnosticAnalysisResult = {
      score,
      totalTechnical,
      levelNumber,
      levelTitle,
      recommendedSpecialty,
      recommendedPathSlug,
      recommendedPathTitle,
      primaryCourseSlug,
      primaryCourseTitle,
      competencyBreakdown: {
        logic: logicScore,
        oop: oopScore,
        database: databaseScore,
        architecture: architectureScore
      },
      syllabus,
      agentFeedback,
      completedAt: new Date().toISOString()
    };

    this.analysisResult.set(result);

    // Guardar en AuthService y localStorage
    this.auth.saveDiagnosticResult(result);
  }

  recalibrate() {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(null);
    this.userAnswers.set({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
