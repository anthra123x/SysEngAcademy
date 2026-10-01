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
    <div class="terminal-workspace">
      <!-- LINUX WINDOW FRAME -->
      <div class="terminal-window">
        <!-- TOP TITLEBAR CON CONTROLES UNIX -->
        <header class="terminal-titlebar">
          <div class="window-controls">
            <span class="ctrl-dot dot-close"></span>
            <span class="ctrl-dot dot-minimize"></span>
            <span class="ctrl-dot dot-maximize"></span>
          </div>

          <div class="titlebar-session">
            <span class="prompt-user">syseng@workstation</span>:<span class="prompt-path">~/induction_protocol.sh</span>
            <span class="session-badge font-mono">[xterm-256color]</span>
          </div>

          <div class="titlebar-telemetry">
            <span class="telemetry-pill">
              <span class="telemetry-dot green"></span>
              SANDBOX POSIX: ONLINE
            </span>
            <span class="telemetry-pill">
              <span class="telemetry-dot purple"></span>
              BYTE IA: LISTO
            </span>
          </div>
        </header>

        <!-- PIPELINE STATUSLINE (TMUX / NEOVIM STYLE) -->
        <nav class="pipeline-statusline">
          <div class="pipeline-steps">
            <button
              type="button"
              class="pipe-step"
              [class.is-active]="stage() === 'welcome'"
              [class.is-passed]="stage() !== 'welcome'"
              (click)="stage.set('welcome')"
            >
              <span class="pipe-num">01</span>
              <span class="pipe-label">INDUCCIÓN</span>
            </button>
            <span class="pipe-sep">/</span>

            <button
              type="button"
              class="pipe-step"
              [class.is-active]="stage() === 'tour'"
              [class.is-passed]="stage() === 'assessment' || stage() === 'analyzing' || stage() === 'results'"
              (click)="stage.set('tour')"
            >
              <span class="pipe-num">02</span>
              <span class="pipe-label">ARQUITECTURA</span>
            </button>
            <span class="pipe-sep">/</span>

            <button
              type="button"
              class="pipe-step"
              [class.is-active]="stage() === 'assessment' || stage() === 'analyzing'"
              [class.is-passed]="stage() === 'results'"
              (click)="stage() === 'results' ? stage.set('assessment') : null"
            >
              <span class="pipe-num">03</span>
              <span class="pipe-label">EVALUACIÓN DIAGNÓSTICA</span>
              @if (stage() === 'assessment') {
                <span class="pipe-counter">[{{ currentQuestionIndex() + 1 }}/{{ questions.length }}]</span>
              }
            </button>
            <span class="pipe-sep">/</span>

            <button
              type="button"
              class="pipe-step"
              [class.is-active]="stage() === 'results'"
              [disabled]="!analysisResult()"
              (click)="analysisResult() ? stage.set('results') : null"
            >
              <span class="pipe-num">04</span>
              <span class="pipe-label">DICTAMEN & TEMARIO</span>
            </button>
          </div>

          <div class="pipeline-user-tag font-mono">
            UID: {{ user()?.email || 'estudiante@syseng' }}
          </div>
        </nav>

        <!-- TERMINAL BUFFER / MAIN CANVAS -->
        <main class="terminal-buffer">
          <!-- ==========================================
               FASE 0: INDUCCIÓN & PROTOCOLO DE BIENVENIDA
               ========================================== -->
          @if (stage() === 'welcome') {
            <section class="stage-section animate-fade-in">
              <!-- ASCII BANNER TERMINAL -->
              <div class="terminal-banner-box">
                <pre class="ascii-banner font-mono">
  ███████╗██╗   ██╗███████╗███████╗███╗   ██╗ ██████╗       █████╗  ██████╗ █████╗ ██████╗ ███████╗███╗   ███╗██╗   ██╗
  ██╔════╝╚██╗ ██╔╝██╔════╝██╔════╝████╗  ██║██╔════╝      ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝████╗ ████║╚██╗ ██╔╝
  ███████╗ ╚████╔╝ ███████╗█████╗  ██╔██╗ ██║██║  ███╗     ███████║██║     ███████║██║  ██║█████╗  ██╔████╔██║ ╚████╔╝ 
  ╚════██║  ╚██╔╝  ╚════██║██╔══╝  ██║╚██╗██║██║   ██║     ██╔══██║██║     ██╔══██║██║  ██║██╔══╝  ██║╚██╔╝██║  ╚██╔╝  
  ███████║   ██║   ███████║███████╗██║ ╚████║╚██████╔╝     ██║  ██║╚██████╗██║  ██║██████╔╝███████╗██║ ╚═╝ ██║   ██║   
  ╚══════╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝ ╚═════╝      ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝     ╚═╝   ╚═╝   </pre>
                <div class="banner-subline font-mono">
                  <span>[PROTOCOL: KERNEL_INIT_v2.6]</span>
                  <span>[TARGET: POSIX_INTERACTIVE]</span>
                  <span>[STATUS: READY]</span>
                </div>
              </div>

              <!-- WELCOME MANIFESTO -->
              <div class="induction-manifesto">
                <div class="manifesto-prompt font-mono">
                  <span class="txt-green">$</span> systemctl start syseng-induction.service --student="{{ studentFirstName() }}"
                </div>

                <h1 class="manifesto-title">
                  Protocolo de bienvenida a <span class="txt-cyan">SysEng Academy</span>, cadete {{ studentFirstName() }}.
                </h1>

                <p class="manifesto-description">
                  Esta academia no es una colección de videotutoriales pasivos. Es un <strong>centro de alto rendimiento</strong> diseñado para formar ingenieros de software capaces de escribir, depurar y estructurar código real sobre <strong>sandboxes Linux en vivo</strong> con tutoría algorítmica constante.
                </p>
              </div>

              <!-- 3 ARQUITECTURAS FUNDAMENTALES (CLI MODULES) -->
              <div class="induction-grid">
                <div class="cli-card">
                  <div class="cli-card-header font-mono">
                    <span class="card-tag">MODULE_01</span>
                    <span class="card-status txt-green">ONLINE</span>
                  </div>
                  <h3 class="cli-card-title">Sandboxes Linux Interactivos</h3>
                  <p class="cli-card-body">
                    Escribe código en C++, Python, PSeInt y JS con compiladores integrados en el navegador. Ejecuta con <code>[▶ run]</code> y valida casos de prueba con <code>[🧪 test]</code> sin configuraciones locales.
                  </p>
                  <div class="cli-card-meta font-mono">
                    <span class="meta-item">&gt;_ Runtime nativo</span>
                    <span class="meta-item">&gt;_ stdin / stdout</span>
                  </div>
                </div>

                <div class="cli-card">
                  <div class="cli-card-header font-mono">
                    <span class="card-tag">MODULE_02</span>
                    <span class="card-status txt-cyan">INTEGRADO</span>
                  </div>
                  <h3 class="cli-card-title">Tutoría Socrática Byte IA</h3>
                  <p class="cli-card-body">
                    Tu mentor inteligente analiza tu árbol de sintaxis abstracta (AST) y errores en segundo plano. Nunca te dará la solución copiada: te guiará socráticamente para desarrollar intuición algorítmica.
                  </p>
                  <div class="cli-card-meta font-mono">
                    <span class="meta-item">&gt;_ Análisis estático</span>
                    <span class="meta-item">&gt;_ Cero spoilers</span>
                  </div>
                </div>

                <div class="cli-card">
                  <div class="cli-card-header font-mono">
                    <span class="card-tag">MODULE_03</span>
                    <span class="card-status txt-amber">VERIFICADO</span>
                  </div>
                  <h3 class="cli-card-title">Desbloqueo por Mérito Estricto</h3>
                  <p class="cli-card-body">
                    Los módulos avanzados están bloqueados por diseño. Para desbloquear el siguiente nivel, tus ejercicios de código deben ser aprobados por la batería de tests o el dictamen oficial del sistema.
                  </p>
                  <div class="cli-card-meta font-mono">
                    <span class="meta-item">&gt;_ Candados estrictos</span>
                    <span class="meta-item">&gt;_ Credencial técnica</span>
                  </div>
                </div>
              </div>

              <!-- MINI CONSOLE SIMULATION -->
              <div class="terminal-log-preview font-mono">
                <div class="log-line"><span class="txt-muted">[0.001s]</span> <span class="txt-cyan">init:</span> Entorno de ejecución montado en /dev/sandbox/student_{{ user()?.id || 101 }}</div>
                <div class="log-line"><span class="txt-muted">[0.015s]</span> <span class="txt-green">auth:</span> Credenciales validadas para {{ user()?.email || 'estudiante' }}</div>
                <div class="log-line"><span class="txt-muted">[0.042s]</span> <span class="txt-purple">agent:</span> Byte Copilot listo para calibrar tu nivel de partida.</div>
                <div class="log-line"><span class="txt-muted">[0.060s]</span> <span class="txt-amber">ready:</span> Presiona iniciar calibración para generar tu temario a medida.</div>
              </div>

              <!-- ACTIONS BAR -->
              <div class="terminal-action-row">
                <button type="button" class="term-btn term-btn-outline" (click)="goToTour()">
                  <span class="btn-prefix">$</span> ./view-platform-guide.sh
                </button>
                <button type="button" class="term-btn term-btn-primary" (click)="goToAssessment()">
                  <span class="btn-prefix">$</span> ./start-calibration.sh --now ⚡
                </button>
              </div>
            </section>
          }

          <!-- ==========================================
               FASE 1: ARQUITECTURA DEL ECOSISTEMA (TOUR)
               ========================================== -->
          @if (stage() === 'tour') {
            <section class="stage-section animate-fade-in">
              <div class="section-cli-header">
                <div class="cli-breadcrumb font-mono">
                  <span class="txt-green">syseng</span>::<span class="txt-cyan">docs</span>::<span class="txt-white">platform-stack.spec</span>
                </div>
                <h2 class="section-heading">Arquitectura Tecnológica del Ecosistema</h2>
                <p class="section-subtext">
                  Conoce cómo interactúan los 4 subsistemas de SysEng Academy para estructurar tu crecimiento técnico:
                </p>
              </div>

              <div class="spec-grid">
                <!-- SPEC 01 -->
                <article class="spec-card">
                  <div class="spec-header font-mono">
                    <span class="spec-id">SUBSYS_01</span>
                    <span class="spec-label">TERMINAL_RUNTIME</span>
                  </div>
                  <h3 class="spec-title">Terminal Linux & Sandboxes POSIX</h3>
                  <p class="spec-desc">
                    Cada lección práctica monta una consola Linux virtual con entrada estándar, salida y control de procesos. Escribe tu algoritmo en el editor y compílalo al instante sin depender de dependencias locales.
                  </p>
                  <div class="spec-code-box font-mono">
                    <span class="txt-muted">// Ejecución directa de solución</span>
                    <div><span class="txt-green">&gt;</span> python3 solution.py &lt; test_input.txt</div>
                    <div><span class="txt-cyan">[TEST PASS]</span> 4/4 casos de prueba verificados en 12ms</div>
                  </div>
                </article>

                <!-- SPEC 02 -->
                <article class="spec-card">
                  <div class="spec-header font-mono">
                    <span class="spec-id">SUBSYS_02</span>
                    <span class="spec-label">BYTE_COPILOT</span>
                  </div>
                  <h3 class="spec-title">Evaluación Silenciosa con Byte IA</h3>
                  <p class="spec-desc">
                    El agente inteligente no es un chat genérico: inspecciona tu código fuente, identifica errores de punteros, mutabilidad, complejidad temporal y te sugiere puntos de inspección directamente en el editor.
                  </p>
                  <div class="spec-code-box font-mono">
                    <span class="txt-muted">// Análisis pedagógico activo</span>
                    <div><span class="txt-purple">byte-ai:</span> Nota que estás reasignando la lista en cada ciclo.</div>
                    <div><span class="txt-purple">byte-ai:</span> ¿Cómo afectaría esto la complejidad temporal Big-O?</div>
                  </div>
                </article>

                <!-- SPEC 03 -->
                <article class="spec-card">
                  <div class="spec-header font-mono">
                    <span class="spec-id">SUBSYS_03</span>
                    <span class="spec-label">MERIT_GATING</span>
                  </div>
                  <h3 class="spec-title">Candados de Módulos por Mérito</h3>
                  <p class="spec-desc">
                    La academia previene el avance superficial. Si no resuelves correctamente los ejercicios del módulo o el examen práctico, los módulos subsiguientes permanecen inaccesibles para asegurar maestría real.
                  </p>
                  <div class="spec-code-box font-mono">
                    <span class="txt-muted">// Puerta de validación técnica</span>
                    <div><span class="txt-amber">[GATE]</span> Módulo 2 bloqueado: Requiere aprobación del ejercicio 1.4</div>
                    <div><span class="txt-green">[PASS]</span> Ejercicio aprobado → Módulo 2 desbloqueado</div>
                  </div>
                </article>

                <!-- SPEC 04 -->
                <article class="spec-card">
                  <div class="spec-header font-mono">
                    <span class="spec-id">SUBSYS_04</span>
                    <span class="spec-label">CAREER_GRAPH</span>
                  </div>
                  <h3 class="spec-title">Rutas de Especialidad & Clanes</h3>
                  <p class="spec-desc">
                    Desde Fundamentos de Algoritmos hasta Arquitectura Distribuida y Ciberseguridad. Además, puedes unirte o fundar un Clan de Estudio en tu perfil para compartir retos semanales con otros cadetes.
                  </p>
                  <div class="spec-code-box font-mono">
                    <span class="txt-muted">// Red de ingeniería y clanes</span>
                    <div><span class="txt-cyan">[GUILD]</span> [KRNL] Kernel & C++ Systems Hackers</div>
                    <div><span class="txt-green">[XP]</span> +350 XP por reto de concurrencia completado</div>
                  </div>
                </article>
              </div>

              <!-- ACTION BAR -->
              <div class="terminal-action-row">
                <button type="button" class="term-btn term-btn-outline" (click)="stage.set('welcome')">
                  ← Volver a Inducción
                </button>
                <button type="button" class="term-btn term-btn-primary" (click)="goToAssessment()">
                  <span class="btn-prefix">$</span> ./run-diagnostic-matrix.sh ⚡
                </button>
              </div>
            </section>
          }

          <!-- ==========================================
               FASE 2: EVALUACIÓN DIAGNÓSTICA ADAPTATIVA
               ========================================== -->
          @if (stage() === 'assessment') {
            <section class="stage-section animate-fade-in">
              <!-- TELEMETRY ASSESSMENT TOPBAR -->
              <div class="assessment-header-bar font-mono">
                <div class="ah-left">
                  <span class="ah-pill txt-cyan">[PREGUNTA 0{{ currentQuestionIndex() + 1 }} / 0{{ questions.length }}]</span>
                  <span class="ah-pill txt-muted">[TÓPICO: {{ currentQuestion().topic | uppercase }}]</span>
                </div>
                <div class="ah-right">
                  <span class="ah-pill txt-green">PROGRESO: {{ progressPercentage() }}%</span>
                </div>
              </div>

              <!-- PROGRESS BAR HIGH CONTRAST -->
              <div class="terminal-progress-track">
                <div class="terminal-progress-fill" [style.width.%]="progressPercentage()"></div>
              </div>

              <!-- QUESTION BOX -->
              <div class="assessment-question-box">
                <div class="question-meta-category font-mono">
                  <span class="meta-cat-badge">// {{ currentQuestion().category | uppercase }} MATRIX EVALUATION</span>
                </div>

                <h2 class="assessment-title">{{ currentQuestion().title }}</h2>
                <p class="assessment-prompt">{{ currentQuestion().prompt }}</p>

                <!-- CODE TERMINAL BUFFER (IF APPLICABLE) -->
                @if (currentQuestion().codeSnippet) {
                  <div class="code-buffer-window font-mono">
                    <div class="code-buffer-titlebar">
                      <div class="code-mini-dots">
                        <span></span><span></span><span></span>
                      </div>
                      <span class="buffer-filename">benchmark_matrix.py [RO]</span>
                      <span class="buffer-lang">PYTHON_3.12</span>
                    </div>
                    <pre class="code-buffer-pre"><code>{{ currentQuestion().codeSnippet }}</code></pre>
                  </div>
                }

                <!-- OPTION SELECTOR (TERMINAL STYLE) -->
                <div class="options-terminal-grid">
                  @for (opt of currentQuestion().options; track opt.id) {
                    <button
                      type="button"
                      class="term-option-card"
                      [class.is-selected]="selectedOption() === opt.id"
                      (click)="selectedOption.set(opt.id)"
                    >
                      <div class="opt-shortcut font-mono">
                        [{{ opt.id | uppercase }}]
                      </div>
                      <div class="opt-text">
                        {{ opt.label }}
                      </div>
                      <div class="opt-status font-mono">
                        @if (selectedOption() === opt.id) {
                          <span class="opt-selected-tag txt-cyan">✓ SELECCIONADO</span>
                        } @else {
                          <span class="opt-idle-tag txt-muted">Oprimir [{{ opt.id | uppercase }}]</span>
                        }
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- ASSESSMENT ACTIONS -->
              <div class="terminal-action-row between">
                <button
                  type="button"
                  class="term-btn term-btn-outline"
                  (click)="prevQuestion()"
                  [disabled]="currentQuestionIndex() === 0"
                >
                  ← Pregunta Anterior
                </button>

                <button
                  type="button"
                  class="term-btn term-btn-primary"
                  [disabled]="!selectedOption()"
                  (click)="nextQuestion()"
                >
                  @if (currentQuestionIndex() < questions.length - 1) {
                    <span>Siguiente Pregunta [Enter] →</span>
                  } @else {
                    <span>Calibrar y Compilar Temario →</span>
                  }
                </button>
              </div>
            </section>
          }

          <!-- ==========================================
               FASE ANALYZING: ANÁLISIS AST CON BYTE IA
               ========================================== -->
          @if (stage() === 'analyzing') {
            <section class="stage-section analyzing-section animate-fade-in">
              <div class="analyzing-matrix font-mono">
                <div class="matrix-loader-spinner"></div>
                <h2 class="analyzing-heading">Byte IA está evaluando tu matriz de competencias...</h2>
                <p class="analyzing-sub">Calculando perfiles de complejidad algorítmica, POO y persistencia relacional:</p>

                <div class="terminal-exec-feed">
                  <div class="exec-log-line is-done">
                    <span class="exec-tick">✔</span> [0.12s] Parsing AST de soluciones algorítmicas y complejidad Big-O... <span class="txt-green">[OK]</span>
                  </div>
                  <div class="exec-log-line is-done">
                    <span class="exec-tick">✔</span> [0.38s] Verificando entendimiento de invariantes de negocio y POO... <span class="txt-green">[OK]</span>
                  </div>
                  <div class="exec-log-line is-active">
                    <span class="exec-pulse">⚡</span> [0.65s] Clasificando consultas SQL relacionales y arquitectura... <span class="txt-cyan">[EN PROCESO]</span>
                  </div>
                  <div class="exec-log-line">
                    <span class="exec-wait">○</span> [0.90s] Estructurando temario personalizado en 3 fases de ingeniería... <span class="txt-muted">[PENDIENTE]</span>
                  </div>
                </div>
              </div>
            </section>
          }

          <!-- ==========================================
               FASE 3: EXPEDIENTE TÉCNICO & TEMARIO A MEDIDA
               ========================================== -->
          @if (stage() === 'results' && analysisResult()) {
            <section class="stage-section animate-fade-in">
              <!-- CERTIFICATION DOSSIER HEADER -->
              <div class="dossier-card">
                <div class="dossier-top font-mono">
                  <span class="dossier-stamp txt-cyan">SYSENG ACADEMY // DICTAMEN DE CALIBRACIÓN OFICIAL</span>
                  <span class="dossier-timestamp txt-muted">EMISIÓN: {{ analysisResult()!.completedAt | date:'yyyy-MM-dd HH:mm' }} UTC</span>
                </div>

                <div class="dossier-hero">
                  <div class="dossier-info">
                    <div class="dossier-level-badge font-mono">
                      <span>NIVEL ASIGNADO: 0{{ analysisResult()!.levelNumber }}</span>
                    </div>
                    <h1 class="dossier-level-title">{{ analysisResult()!.levelTitle }}</h1>
                    <div class="dossier-tags font-mono">
                      <span class="d-tag tag-score">🎯 {{ analysisResult()!.score }}/{{ analysisResult()!.totalTechnical }} ACIERTOS TÉCNICOS</span>
                      <span class="d-tag tag-spec">💼 ESPECIALIDAD: {{ analysisResult()!.recommendedSpecialty }}</span>
                      <span class="d-tag tag-xp">🎁 +200 XP DE BIENVENIDA</span>
                    </div>
                  </div>

                  <div class="dossier-badge-window font-mono">
                    <div class="db-box">
                      <span class="db-lvl-large">LVL 0{{ analysisResult()!.levelNumber }}</span>
                      <span class="db-status-txt txt-green">● VERIFICADO</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- TELEMETRY RADAR BARS -->
              <div class="radar-telemetry-grid">
                <div class="radar-card">
                  <div class="radar-header font-mono">
                    <span class="radar-label">LÓGICA & ALGORITMOS</span>
                    <strong class="radar-val txt-cyan">{{ analysisResult()!.competencyBreakdown.logic }}%</strong>
                  </div>
                  <div class="radar-track">
                    <div class="radar-fill bg-cyan" [style.width.%]="analysisResult()!.competencyBreakdown.logic"></div>
                  </div>
                </div>

                <div class="radar-card">
                  <div class="radar-header font-mono">
                    <span class="radar-label">PARADIGMA POO & MEMORIA</span>
                    <strong class="radar-val txt-purple">{{ analysisResult()!.competencyBreakdown.oop }}%</strong>
                  </div>
                  <div class="radar-track">
                    <div class="radar-fill bg-purple" [style.width.%]="analysisResult()!.competencyBreakdown.oop"></div>
                  </div>
                </div>

                <div class="radar-card">
                  <div class="radar-header font-mono">
                    <span class="radar-label">BASES DE DATOS & SQL</span>
                    <strong class="radar-val txt-green">{{ analysisResult()!.competencyBreakdown.database }}%</strong>
                  </div>
                  <div class="radar-track">
                    <div class="radar-fill bg-green" [style.width.%]="analysisResult()!.competencyBreakdown.database"></div>
                  </div>
                </div>

                <div class="radar-card">
                  <div class="radar-header font-mono">
                    <span class="radar-label">ARQUITECTURA & SOLID</span>
                    <strong class="radar-val txt-amber">{{ analysisResult()!.competencyBreakdown.architecture }}%</strong>
                  </div>
                  <div class="radar-track">
                    <div class="radar-fill bg-amber" [style.width.%]="analysisResult()!.competencyBreakdown.architecture"></div>
                  </div>
                </div>
              </div>

              <!-- INFORME PEDAGÓGICO DE BYTE IA -->
              <div class="agent-audit-report font-mono">
                <div class="aar-header">
                  <span class="aar-icon txt-purple">&gt;_</span>
                  <span class="aar-title">DICTAMEN PEDAGÓGICO DE BYTE IA (TUTOR DE SISTEMAS)</span>
                </div>
                <p class="aar-text">
                  "{{ analysisResult()!.agentFeedback }}"
                </p>
              </div>

              <!-- TEMARIO PERSONALIZADO EN 3 FASES -->
              <div class="syllabus-roadmap">
                <div class="sr-header">
                  <span class="sr-eyebrow font-mono">// CURRICULUM_PIPELINE</span>
                  <h2 class="sr-title">Temario de Formación a Medida (3 Fases)</h2>
                  <p class="sr-sub">
                    Estructurado por el sistema para cerrar tus brechas específicas y acelerar tu maestría técnica:
                  </p>
                </div>

                <div class="syllabus-phases-container">
                  @for (phase of analysisResult()!.syllabus; track phase.phaseNumber) {
                    <div class="syllabus-phase-card" [class.is-immediate]="phase.phaseNumber === 1">
                      <div class="phase-meta-top font-mono">
                        <span class="phase-id">FASE 0{{ phase.phaseNumber }}</span>
                        @if (phase.phaseNumber === 1) {
                          <span class="phase-immediate-tag txt-cyan">● ARRANQUE RECOMENDADO</span>
                        } @else {
                          <span class="phase-locked-tag txt-muted">CONSOLIDACIÓN SUBSIGUIENTE</span>
                        }
                      </div>

                      <h3 class="phase-card-title">{{ phase.phaseTitle }}</h3>

                      <div class="phase-course-target-box font-mono">
                        <span class="target-lbl">CURSO CLAVE:</span>
                        <strong class="target-name txt-white">{{ phase.courseTitle }}</strong>
                      </div>

                      <p class="phase-card-desc">{{ phase.description }}</p>

                      <div class="phase-competencies-list">
                        <span class="comp-label font-mono">COMPETENCIAS CLAVE:</span>
                        <div class="comp-chips">
                          @for (skill of phase.skillsGained; track skill) {
                            <span class="skill-chip font-mono">{{ skill }}</span>
                          }
                        </div>
                      </div>

                      <div class="phase-card-footer">
                        <span class="phase-time font-mono">⏱️ ~{{ phase.estimatedHours }} horas de práctica</span>
                        @if (phase.phaseNumber === 1) {
                          <a [routerLink]="['/cursos', phase.courseSlug]" class="term-btn term-btn-primary term-btn-sm">
                            Comenzar este Curso →
                          </a>
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- FINAL COMMAND BAR -->
              <div class="results-command-bar">
                <div class="rcb-left">
                  <div class="rcb-label font-mono">RUTA OFICIAL RECOMENDADA:</div>
                  <div class="rcb-path-name">{{ analysisResult()!.recommendedPathTitle }}</div>
                </div>
                <div class="rcb-actions">
                  <button type="button" class="term-btn term-btn-outline" (click)="recalibrate()">
                    <span class="btn-prefix">$</span> ./recalibrate.sh --reset
                  </button>
                  <a [routerLink]="['/cursos', analysisResult()!.primaryCourseSlug]" class="term-btn term-btn-primary term-btn-lg">
                    <span class="btn-prefix">$</span> ./launch-academy.sh --now →
                  </a>
                </div>
              </div>
            </section>
          }
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      /* ========================================================
         LINUX TERMINAL WORKSPACE DESIGN SYSTEM (MINIMALISTA & PROFESIONAL)
         ======================================================== */
      :host {
        display: block;
        min-height: calc(100vh - 65px);
        background: #06080d;
        color: #e2e8f0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace !important;
      }

      /* ACCENTS */
      .txt-green { color: #10b981 !important; }
      .txt-cyan { color: #00f0ff !important; }
      .txt-amber { color: #f59e0b !important; }
      .txt-purple { color: #c084fc !important; }
      .txt-white { color: #f8fafc !important; }
      .txt-muted { color: #64748b !important; }

      .bg-cyan { background: #00f0ff !important; }
      .bg-purple { background: #a855f7 !important; }
      .bg-green { background: #10b981 !important; }
      .bg-amber { background: #f59e0b !important; }

      .terminal-workspace {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1.5rem 1rem 3.5rem;
      }

      /* LINUX WINDOW FRAME */
      .terminal-window {
        background: #090c13;
        border: 1px solid #1a2234;
        border-radius: 8px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }

      /* TOP TITLEBAR */
      .terminal-titlebar {
        background: #0d121c;
        border-bottom: 1px solid #1a2234;
        padding: 0.65rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        user-select: none;
      }

      .window-controls {
        display: flex;
        align-items: center;
        gap: 7px;

        .ctrl-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          display: inline-block;

          &.dot-close { background: #ff5f56; }
          &.dot-minimize { background: #ffbd2e; }
          &.dot-maximize { background: #27c93f; }
        }
      }

      .titlebar-session {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;

        .prompt-user { color: #10b981; font-weight: 700; }
        .prompt-path { color: #38bdf8; }
        .session-badge {
          color: #64748b;
          font-size: 0.72rem;
          background: #141c2c;
          padding: 1px 6px;
          border-radius: 3px;
        }
      }

      .titlebar-telemetry {
        display: flex;
        align-items: center;
        gap: 1rem;

        .telemetry-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #94a3b8;
          background: #111724;
          border: 1px solid #1d273b;
          padding: 2px 8px;
          border-radius: 4px;

          .telemetry-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;

            &.green { background: #10b981; box-shadow: 0 0 6px #10b981; }
            &.purple { background: #c084fc; box-shadow: 0 0 6px #c084fc; }
          }
        }
      }

      /* PIPELINE STATUSLINE (TMUX / NEOVIM STATUS BAR) */
      .pipeline-statusline {
        background: #0a0f19;
        border-bottom: 1px solid #161f30;
        padding: 0.4rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .pipeline-steps {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .pipe-step {
        background: transparent;
        border: none;
        color: #64748b;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.74rem;
        font-weight: 600;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 4px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: color 0.15s;

        .pipe-num { color: #475569; font-weight: 700; }

        &:hover:not(:disabled) {
          color: #94a3b8;
        }

        &.is-active {
          color: #00f0ff;
          background: rgba(0, 240, 255, 0.08);
          .pipe-num { color: #00f0ff; }
        }

        &.is-passed {
          color: #10b981;
          .pipe-num { color: #10b981; }
        }

        .pipe-counter {
          color: #f59e0b;
          font-size: 0.7rem;
        }

        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .pipe-sep {
        color: #334155;
        font-family: monospace;
        font-size: 0.75rem;
      }

      .pipeline-user-tag {
        font-size: 0.72rem;
        color: #64748b;
      }

      /* BUFFER MAIN CONTENT */
      .terminal-buffer {
        padding: 2.25rem 2rem 3rem;
      }

      .stage-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      /* ========================================================
         FASE 0: WELCOME & INDUCTION
         ======================================================== */
      .terminal-banner-box {
        background: #060910;
        border: 1px solid #161e2f;
        border-radius: 6px;
        padding: 1.25rem 1.5rem;
        overflow-x: auto;

        .ascii-banner {
          margin: 0;
          color: #00f0ff;
          font-size: 0.58rem;
          line-height: 1.15;
          letter-spacing: 0.02em;
        }

        .banner-subline {
          display: flex;
          gap: 1.5rem;
          margin-top: 0.75rem;
          padding-top: 0.65rem;
          border-top: 1px dashed #1a2336;
          font-size: 0.72rem;
          color: #64748b;
          flex-wrap: wrap;
        }
      }

      .induction-manifesto {
        .manifesto-prompt {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
        }

        .manifesto-title {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
          line-height: 1.25;
          margin-bottom: 0.85rem;
        }

        .manifesto-description {
          font-size: 1.05rem;
          color: #94a3b8;
          line-height: 1.65;
          max-width: 920px;
          margin: 0;

          strong { color: #f1f5f9; }
        }
      }

      .induction-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;
      }

      .cli-card {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        transition: border-color 0.2s, transform 0.2s;

        &:hover {
          border-color: #2b3b5c;
          transform: translateY(-2px);
        }

        .cli-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.72rem;
          margin-bottom: 0.75rem;

          .card-tag { color: #64748b; }
        }

        .cli-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.65rem;
        }

        .cli-card-body {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.55;
          margin: 0 0 1.25rem;
          flex: 1;

          code {
            background: #141b2a;
            color: #38bdf8;
            padding: 1px 4px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.82rem;
          }
        }

        .cli-card-meta {
          border-top: 1px solid #161e30;
          padding-top: 0.75rem;
          display: flex;
          gap: 1rem;
          font-size: 0.72rem;
          color: #64748b;
          flex-wrap: wrap;
        }
      }

      .terminal-log-preview {
        background: #05070d;
        border: 1px solid #161e2f;
        border-radius: 6px;
        padding: 1rem 1.25rem;
        font-size: 0.78rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .log-line { line-height: 1.5; }
      }

      /* ========================================================
         FASE 1: SPEC GRID (TOUR)
         ======================================================== */
      .section-cli-header {
        .cli-breadcrumb {
          font-size: 0.78rem;
          margin-bottom: 0.5rem;
        }

        .section-heading {
          font-size: 1.85rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .section-subtext {
          font-size: 1rem;
          color: #94a3b8;
          margin: 0;
        }
      }

      .spec-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 1.25rem;
      }

      .spec-card {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;

        .spec-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          margin-bottom: 0.75rem;

          .spec-id { color: #64748b; }
          .spec-label { color: #00f0ff; }
        }

        .spec-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.65rem;
        }

        .spec-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .spec-code-box {
          background: #06080e;
          border: 1px solid #161e2f;
          border-radius: 4px;
          padding: 0.75rem;
          font-size: 0.76rem;
          line-height: 1.5;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
      }

      /* ========================================================
         FASE 2: ASSESSMENT INTERFACE
         ======================================================== */
      .assessment-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;
        flex-wrap: wrap;
        gap: 0.75rem;

        .ah-left { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ah-pill {
          background: #111724;
          border: 1px solid #1d273b;
          padding: 2px 8px;
          border-radius: 4px;
        }
      }

      .terminal-progress-track {
        height: 4px;
        background: #141c2c;
        border-radius: 2px;
        overflow: hidden;

        .terminal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00f0ff, #10b981);
          transition: width 0.25s ease;
        }
      }

      .assessment-question-box {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.75rem;

        .question-meta-category {
          font-size: 0.74rem;
          color: #00f0ff;
          margin-bottom: 0.75rem;
        }

        .assessment-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .assessment-prompt {
          font-size: 1rem;
          color: #cbd5e1;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }
      }

      .code-buffer-window {
        background: #05070d;
        border: 1px solid #1a2438;
        border-radius: 6px;
        margin-bottom: 1.5rem;
        overflow: hidden;

        .code-buffer-titlebar {
          background: #0c101a;
          border-bottom: 1px solid #1a2438;
          padding: 0.4rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;

          .code-mini-dots {
            display: flex;
            gap: 5px;
            span {
              width: 8px; height: 8px; border-radius: 50%; background: #263249;
            }
          }

          .buffer-filename { color: #94a3b8; }
          .buffer-lang { color: #00f0ff; }
        }

        .code-buffer-pre {
          margin: 0;
          padding: 1.25rem;
          font-size: 0.86rem;
          line-height: 1.6;
          color: #e2e8f0;
          overflow-x: auto;
        }
      }

      .options-terminal-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .term-option-card {
        background: #080c14;
        border: 1px solid #1c273e;
        border-radius: 5px;
        padding: 1rem 1.25rem;
        display: flex;
        align-items: center;
        gap: 1.25rem;
        cursor: pointer;
        text-align: left;
        color: #cbd5e1;
        transition: all 0.15s ease;

        &:hover {
          background: #0f1524;
          border-color: #3b4d70;
        }

        &.is-selected {
          background: rgba(0, 240, 255, 0.05);
          border-color: #00f0ff;
          color: #f8fafc;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.12);

          .opt-shortcut {
            background: #00f0ff;
            color: #06090f;
            border-color: #00f0ff;
          }
        }

        .opt-shortcut {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: #111724;
          border: 1px solid #24324f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: #00f0ff;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .opt-text {
          flex: 1;
          font-size: 0.95rem;
          line-height: 1.45;
        }

        .opt-status {
          font-size: 0.74rem;
          flex-shrink: 0;
        }
      }

      /* ========================================================
         FASE ANALYZING
         ======================================================== */
      .analyzing-section {
        padding: 3rem 1rem;
      }

      .analyzing-matrix {
        max-width: 680px;
        margin: 0 auto;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;

        .matrix-loader-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #1a2438;
          border-top-color: #00f0ff;
          border-right-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1.5rem;
        }

        .analyzing-heading {
          font-size: 1.45rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .analyzing-sub {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 2rem;
        }

        .terminal-exec-feed {
          width: 100%;
          background: #05070d;
          border: 1px solid #1a2438;
          border-radius: 6px;
          padding: 1.25rem;
          text-align: left;
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;

          .exec-log-line {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #94a3b8;

            &.is-done { color: #f1f5f9; }
            &.is-active { color: #00f0ff; font-weight: 700; }
          }
        }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* ========================================================
         FASE 3: RESULTS & DOSSIER
         ======================================================== */
      .dossier-card {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.75rem;

        .dossier-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          border-bottom: 1px solid #161e30;
          padding-bottom: 0.75rem;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .dossier-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;

          .dossier-level-badge {
            font-size: 0.76rem;
            color: #10b981;
            margin-bottom: 0.4rem;
          }

          .dossier-level-title {
            font-size: 1.85rem;
            font-weight: 800;
            color: #f8fafc;
            line-height: 1.25;
            margin-bottom: 1rem;
          }

          .dossier-tags {
            display: flex;
            gap: 0.65rem;
            flex-wrap: wrap;

            .d-tag {
              font-size: 0.74rem;
              padding: 3px 8px;
              border-radius: 4px;
              border: 1px solid transparent;

              &.tag-score { background: rgba(0, 240, 255, 0.08); border-color: rgba(0, 240, 255, 0.25); color: #00f0ff; }
              &.tag-spec { background: rgba(192, 132, 252, 0.08); border-color: rgba(192, 132, 252, 0.25); color: #c084fc; }
              &.tag-xp { background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.25); color: #10b981; }
            }
          }
        }

        .dossier-badge-window {
          .db-box {
            background: #05070d;
            border: 1px solid #223049;
            padding: 1.25rem 2rem;
            border-radius: 6px;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 4px;

            .db-lvl-large {
              font-size: 1.6rem;
              font-weight: 800;
              color: #f8fafc;
            }

            .db-status-txt {
              font-size: 0.7rem;
              letter-spacing: 0.08em;
            }
          }
        }
      }

      /* RADAR COMPETENCY TRACKS */
      .radar-telemetry-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }

      .radar-card {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1rem 1.25rem;

        .radar-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          margin-bottom: 0.5rem;
          color: #94a3b8;
        }

        .radar-track {
          height: 5px;
          background: #141c2c;
          border-radius: 3px;
          overflow: hidden;

          .radar-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.4s ease;
          }
        }
      }

      /* AGENT REPORT */
      .agent-audit-report {
        background: #080c14;
        border: 1px solid #261d3b;
        border-left: 3px solid #c084fc;
        border-radius: 4px;
        padding: 1.25rem;

        .aar-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.74rem;
          color: #c084fc;
          margin-bottom: 0.5rem;
        }

        .aar-text {
          margin: 0;
          font-size: 0.88rem;
          color: #cbd5e1;
          line-height: 1.6;
        }
      }

      /* SYLLABUS ROADMAP */
      .syllabus-roadmap {
        .sr-header {
          margin-bottom: 1.25rem;

          .sr-eyebrow {
            color: #00f0ff;
            font-size: 0.74rem;
            margin-bottom: 0.35rem;
            display: block;
          }

          .sr-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 0.35rem;
          }

          .sr-sub {
            font-size: 0.92rem;
            color: #94a3b8;
            margin: 0;
          }
        }
      }

      .syllabus-phases-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.25rem;
      }

      .syllabus-phase-card {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        transition: border-color 0.2s;

        &.is-immediate {
          border-color: #00f0ff;
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.08);
        }

        .phase-meta-top {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          margin-bottom: 0.65rem;

          .phase-id { color: #64748b; font-weight: 700; }
        }

        .phase-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.85rem;
        }

        .phase-course-target-box {
          background: #06080e;
          border: 1px solid #161e2f;
          border-radius: 4px;
          padding: 0.6rem 0.75rem;
          margin-bottom: 1rem;
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
          gap: 2px;

          .target-lbl { color: #64748b; font-size: 0.68rem; }
        }

        .phase-card-desc {
          font-size: 0.86rem;
          color: #94a3b8;
          line-height: 1.55;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .phase-competencies-list {
          margin-bottom: 1.25rem;

          .comp-label {
            font-size: 0.68rem;
            color: #64748b;
            display: block;
            margin-bottom: 6px;
          }

          .comp-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;

            .skill-chip {
              background: #111724;
              border: 1px solid #1f2b42;
              color: #94a3b8;
              font-size: 0.72rem;
              padding: 2px 7px;
              border-radius: 3px;
            }
          }
        }

        .phase-card-footer {
          border-top: 1px solid #161e30;
          padding-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;

          .phase-time {
            font-size: 0.74rem;
            color: #64748b;
          }
        }
      }

      /* FINAL RESULTS COMMAND BAR */
      .results-command-bar {
        background: #0b0f19;
        border: 1px solid #1a2438;
        border-radius: 6px;
        padding: 1.25rem 1.75rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;

        .rcb-left {
          display: flex;
          flex-direction: column;
          gap: 3px;

          .rcb-label { font-size: 0.72rem; color: #64748b; }
          .rcb-path-name { font-size: 1.15rem; font-weight: 700; color: #00f0ff; }
        }

        .rcb-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
      }

      /* ========================================================
         TERMINAL ACTION BUTTONS
         ======================================================== */
      .terminal-action-row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 1rem;
        padding-top: 0.5rem;
        flex-wrap: wrap;

        &.between {
          justify-content: space-between;
        }
      }

      .term-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.88rem;
        font-weight: 700;
        padding: 0.65rem 1.35rem;
        border-radius: 4px;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease;
        border: 1px solid transparent;

        .btn-prefix { color: #64748b; font-weight: normal; }

        &:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        &.term-btn-primary {
          background: #00f0ff;
          color: #06090f;
          border-color: #00f0ff;

          .btn-prefix { color: #0284c7; }

          &:hover:not(:disabled) {
            background: #10b981;
            border-color: #10b981;
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
          }
        }

        &.term-btn-outline {
          background: transparent;
          border-color: #24324f;
          color: #cbd5e1;

          &:hover:not(:disabled) {
            background: #141c2c;
            border-color: #3b4d70;
            color: #ffffff;
          }
        }

        &.term-btn-sm {
          padding: 0.4rem 0.85rem;
          font-size: 0.78rem;
        }

        &.term-btn-lg {
          padding: 0.8rem 1.65rem;
          font-size: 0.95rem;
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.25s ease-out forwards;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .terminal-buffer {
          padding: 1.25rem 1rem 2rem;
        }
        .terminal-titlebar {
          flex-direction: column;
          align-items: flex-start;
        }
        .pipeline-statusline {
          flex-direction: column;
          align-items: flex-start;
        }
        .induction-manifesto .manifesto-title {
          font-size: 1.5rem;
        }
        .dossier-hero {
          flex-direction: column;
          align-items: flex-start;
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
    const logicScore = Math.round((((isQ1Correct ? 1 : 0) + (isQ2Correct ? 1 : 0)) / 2) * 100);
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
