import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

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
                <h2 class="analyzing-heading">Byte IA está evaluando tu diagnóstico en tiempo real...</h2>
                <p class="analyzing-sub">El agente de inteligencia artificial analiza cada respuesta individualmente para generar tu ruta personalizada:</p>

                <div class="terminal-exec-feed">
                  <div class="exec-log-line is-done">
                    <span class="exec-tick">✔</span> [0.02s] Respuestas capturadas correctamente ({{ questions.length }} preguntas)... <span class="txt-green">[OK]</span>
                  </div>
                  <div class="exec-log-line is-done">
                    <span class="exec-tick">✔</span> [0.15s] Enviando matriz de respuestas al Agente Byte IA... <span class="txt-green">[OK]</span>
                  </div>
                  <div class="exec-log-line is-active">
                    <span class="exec-pulse">⚡</span> Byte IA está analizando tus fortalezas, debilidades y preferencia técnica... <span class="txt-cyan">[PROCESANDO]</span>
                  </div>
                  <div class="exec-log-line">
                    <span class="exec-wait">○</span> Generando retroalimentación personalizada y temario en 3 fases... <span class="txt-muted">[EN COLA]</span>
                  </div>
                  <div class="exec-log-line">
                    <span class="exec-wait">○</span> Calibrando nivel y ruta de especialización... <span class="txt-muted">[PENDIENTE]</span>
                  </div>
                </div>

                <p class="analyzing-note" style="margin-top: 18px; font-size: 11px; color: #64748b; text-align: center;">
                  Este proceso puede tomar entre 10 y 30 segundos mientras el agente genera tu análisis personalizado.
                </p>
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
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          flex-wrap: nowrap;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          &::-webkit-scrollbar { display: none; }

          .pipe-step {
            flex-shrink: 0;
            white-space: nowrap;
            font-size: 11px;
            padding: 4px 8px;
          }

          .pipe-sep {
            margin: 0 2px;
          }
        }
        .induction-manifesto .manifesto-title {
          font-size: 1.35rem;
        }
        .dossier-hero {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }
      }
    `
  ]
})
export class OnboardingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private api = inject(ApiService);

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
  readonly aiEvaluationFailed = signal(false);
  readonly aiEvaluationInProgress = signal(false);

  // Preguntas de razonamiento lógico y afinidad técnica
  readonly questions: DiagnosticQuestion[] = [
    {
      id: 'q1',
      topic: 'Razonamiento Lógico: Secuencias y Estados',
      category: 'logic',
      title: 'Deducción de Reglas y Patrones Algorítmicos',
      prompt: 'Un algoritmo procesa un valor numérico aplicando la siguiente regla de transformación:\n"Si el número actual es par, se divide entre 2. Si es impar, se multiplica por 3 y se le suma 1".\n\nSi la ejecución inicia con el número 6, ¿cuál es la secuencia exacta de los siguientes 3 pasos?',
      codeSnippet: `// Estado inicial: x = 6
Paso 1: ¿resultado de transformar 6?
Paso 2: ¿resultado de transformar el valor anterior?
Paso 3: ¿resultado de transformar el valor anterior?`,
      options: [
        { id: 'a', label: '3, 10, 5 (6 es par → 3; 3 es impar → 3×3+1=10; 10 es par → 5)' },
        { id: 'b', label: '18, 9, 28 (Aplica multiplicación consecutiva sin evaluar paridad)' },
        { id: 'c', label: '3, 6, 9 (Suma constante de múltiplos)' },
        { id: 'd', label: '12, 6, 3 (Secuencia decreciente directa)' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q2',
      topic: 'Lógica Booleana: Condiciones y Causa-Efecto',
      category: 'logic',
      title: 'Evaluación de Condiciones Lógicas Compuestas',
      prompt: 'En un sistema automatizado, una compuerta de seguridad se abre si la condición general es Verdadera:\n(A AND B) OR (NOT C)\n\nSi los sensores reportan los siguientes valores:\n• A = Verdadero\n• B = Falso\n• C = Falso\n\n¿La compuerta se abrirá y cuál es la justificación lógica?',
      codeSnippet: `A = true;
B = false;
C = false;

// Regla booleana del sistema:
compuerta_abierta = (A && B) || (!C);`,
      options: [
        { id: 'a', label: 'Sí se abre: (A AND B) es Falso, pero NOT C es Verdadero. La operación OR hace que el resultado final sea Verdadero.' },
        { id: 'b', label: 'No se abre: Como B es Falso, invalida automáticamente toda la expresión.' },
        { id: 'c', label: 'No se abre: La condición requiere que A y B sean Verdaderos al mismo tiempo.' },
        { id: 'd', label: 'El sistema genera un estado indeterminado debido a la combinación de operadores.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q3',
      topic: 'Control de Flujo: Bucles y Acumuladores',
      category: 'logic',
      title: 'Rastreo de Estados e Iteraciones Acumuladas',
      prompt: 'Un acumulador en memoria inicia en 0. Se ejecuta un bucle que se repite exactamente 4 veces con esta instrucción:\n"Suma 5 al acumulador. Inmediatamente después, si el acumulador supera 10, réstale 2".\n\n¿Cuál es el valor final del acumulador al terminar la cuarta repetición?',
      codeSnippet: `let acumulador = 0;

for (let paso = 1; paso <= 4; paso++) {
    acumulador = acumulador + 5;
    if (acumulador > 10) {
        acumulador = acumulador - 2;
    }
}`,
      options: [
        { id: 'a', label: '16 (Paso 1: 5 → Paso 2: 10 → Paso 3: 15-2=13 → Paso 4: 13+5-2=16)' },
        { id: 'b', label: '20 (Suma 5 en cada iteración sin descontar nada)' },
        { id: 'c', label: '14 (Descuenta 2 en cada uno de los cuatro pasos)' },
        { id: 'd', label: '12 (El valor se restablece al superar 10)' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q4',
      topic: 'Descomposición Sistemática & Optimización',
      category: 'logic',
      title: 'Estrategia Óptima de Búsqueda y Resolución',
      prompt: 'Tienes un índice alfabético ordenado de 1.000 registros y necesitas encontrar un término específico. ¿Cuál de estas estrategias representa el pensamiento algorítmico más rápido y eficiente?',
      codeSnippet: `// Espacio de búsqueda ordenado: 1.000 registros
// Meta: Minimizar el número de comparaciones requeridas`,
      options: [
        { id: 'a', label: 'Partición binaria: Abrir a la mitad; si el término está antes o después, descartar la mitad opuesta y repetir en la mitad restante (~10 pasos).' },
        { id: 'b', label: 'Búsqueda lineal: Revisar registro por registro desde el inicio hasta hallarlo (hasta 1.000 pasos).' },
        { id: 'c', label: 'Muestreo aleatorio: Revisar posiciones al azar esperando coincidencia por suerte.' },
        { id: 'd', label: 'Búsqueda alternada: Revisar registros pares primero y luego impares.' }
      ],
      correctAnswer: 'a'
    },
    {
      id: 'q5',
      topic: 'Aspiración Técnica & Especialidad',
      category: 'specialty',
      title: 'Tu Área de Interés Prioritaria',
      prompt: '¿En qué área de la ingeniería de software te gustaría enfocarte prioritariamente en SysEngAcademy?',
      options: [
        { id: 'backend', label: 'Desarrollo Backend & APIs: Servidores, bases de datos SQL, persistencia y lógica distribuida.' },
        { id: 'frontend', label: 'Desarrollo Frontend & Web: Interfaces reactivas modernas, componentes UI, experiencia de usuario y CSS/DOM.' },
        { id: 'algoritmos', label: 'Lógica Algorítmica & Ciencias de la Computación: Estructuras de datos, acertijos de lógica pura y optimización asintótica.' },
        { id: 'devops', label: 'DevOps & Automatización Cloud: Terminal Linux, contenedores Docker, CI/CD y despliegues continuos.' },
        { id: 'ia', label: 'Inteligencia Artificial Aplicada: Integración de modelos LLM, prompting estructurado y agentes inteligentes.' },
        { id: 'poo', label: 'Arquitectura de Software Orientada a Objetos: Modularidad limpia, principios SOLID y patrones de diseño GoF.' }
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

    // Aleatorizar el orden de opciones en cada pregunta para que la respuesta
    // correcta no esté siempre en la primera posición
    this.shuffleQuestionOptions();
  }

  /**
   * Baraja las opciones de cada pregunta técnica preservando la referencia
   * correctAnswer (ya que es un ID, no un índice). Las preguntas de
   * preferencia (specialty) no se barajan porque no tienen respuesta correcta.
   */
  private shuffleQuestionOptions(): void {
    for (const q of this.questions) {
      if (q.category === 'specialty') continue;
      // Fisher-Yates shuffle
      const opts = q.options;
      for (let i = opts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opts[i], opts[j]] = [opts[j], opts[i]];
      }
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
    this.aiEvaluationInProgress.set(true);
    this.aiEvaluationFailed.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Intentar evaluación con IA primero
    this.evaluateWithAI().then((success) => {
      if (!success) {
        // Fallback a evaluación local determinística
        this.aiEvaluationFailed.set(true);
        this.computeDiagnosisAndSyllabus();
      }
      this.aiEvaluationInProgress.set(false);
      this.stage.set('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Envía las respuestas al backend para que la IA genere una evaluación
   * personalizada. Retorna true si tuvo éxito, false si debe usar fallback.
   */
  private async evaluateWithAI(): Promise<boolean> {
    try {
      const payload = {
        answers: this.userAnswers(),
        questions: this.questions.map(q => ({
          id: q.id,
          title: q.title,
          category: q.category,
          prompt: q.prompt,
          codeSnippet: q.codeSnippet || null,
          options: q.options,
          correctAnswer: q.correctAnswer || null,
        })),
        student_name: this.user()?.name || 'Estudiante',
        student_email: this.user()?.email || 'anon@syseng',
      };

      const response = await this.api.post<{
        success: boolean;
        fallback?: boolean;
        result?: DiagnosticAnalysisResult;
      }>('/ai/diagnostic', payload, 30000).toPromise();

      if (response?.success && response.result) {
        const aiResult = response.result;
        aiResult.completedAt = aiResult.completedAt || new Date().toISOString();
        this.analysisResult.set(aiResult);
        this.auth.saveDiagnosticResult(aiResult);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('syseng:diagnostic_completed', { detail: aiResult }));
        }
        return true;
      }

      return false;
    } catch (err) {
      console.warn('[Onboarding] Evaluación IA falló, usando fallback local:', err);
      return false;
    }
  }

  private computeDiagnosisAndSyllabus() {
    const answers = this.userAnswers();
    let score = 0;
    const totalTechnical = 4; // 4 preguntas de razonamiento lógico

    const isQ1Correct = answers['q1'] === 'a';
    const isQ2Correct = answers['q2'] === 'a';
    const isQ3Correct = answers['q3'] === 'a';
    const isQ4Correct = answers['q4'] === 'a';

    if (isQ1Correct) score++;
    if (isQ2Correct) score++;
    if (isQ3Correct) score++;
    if (isQ4Correct) score++;

    // Desglose de competencias lógicas
    const logicScore = isQ1Correct && isQ2Correct ? 100 : (isQ1Correct || isQ2Correct ? 60 : 30);
    const flowScore = isQ3Correct ? 100 : 40;
    const optimizationScore = isQ4Correct ? 100 : 35;
    const generalScore = Math.round((score / totalTechnical) * 100);

    // Preferencia técnica declarada por el estudiante
    const specialtyPref = answers['q5'] || 'backend';

    // Determinar Nivel Asignado acorde a rendimiento
    let levelNumber = 1;
    let levelTitle = '';

    if (score <= 1) {
      levelNumber = 1;
      levelTitle = 'Nivel 1: Cadete en Formación · Lógica Inicial';
    } else if (score === 2) {
      levelNumber = 2;
      levelTitle = 'Nivel 2: Explorador de Sistemas · Lógica Estructurada';
    } else if (score === 3) {
      levelNumber = 3;
      levelTitle = 'Nivel 3: Desarrollador Junior Avanzado · Razonamiento Sistemático';
    } else {
      levelNumber = 4;
      levelTitle = 'Nivel 4: Ingeniero Junior Promesa · Alto Rendimiento Lógico';
    }

    // Determinar Ruta, Curso y Temario Adaptativo según afinidad y nivel
    let recommendedPathSlug = 'fundamentos-programacion';
    let recommendedPathTitle = 'Fundamentos de Programación y Pensamiento Algorítmico';
    let primaryCourseSlug = 'introduccion-programacion';
    let primaryCourseTitle = 'Introducción a la Programación';
    let recommendedSpecialty = 'Lógica & Algoritmos';
    let syllabus: SyllabusPhase[] = [];

    switch (specialtyPref) {
      case 'frontend':
        recommendedPathSlug = 'desarrollo-frontend';
        recommendedPathTitle = 'Ruta de Desarrollo Frontend & Experiencia de Usuario';
        primaryCourseSlug = score >= 3 ? 'desarrollo-web-fundamentos' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Fundamentos del Desarrollo Web Moderno' : 'Introducción a la Programación (Bases Frontend)';
        recommendedSpecialty = 'Desarrollo Frontend & Interfaces Reactivas';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Estructura Semántica, Layout y CSS Moderno',
            courseTitle: 'Desarrollo Web: HTML5, CSS3 y Flexbox',
            courseSlug: 'desarrollo-web-fundamentos',
            description: 'Aprende a maquetar aplicaciones web con estándares accesibles, grid y diseño responsive.',
            estimatedHours: 14,
            skillsGained: ['HTML5 Semántico', 'CSS Flexbox & Grid', 'Diseño Adaptativo']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Interactividad, DOM y JavaScript Asíncrono',
            courseTitle: 'JavaScript Moderno para Frontend',
            courseSlug: 'javascript-moderno',
            description: 'Manipulación del árbol DOM, eventos en tiempo real, promesas y consumo de endpoints JSON.',
            estimatedHours: 16,
            skillsGained: ['Eventos del Navegador', 'Fetch API', 'Programación Reactiva']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Arquitectura Basada en Componentes',
            courseTitle: 'Frameworks SPA & Estado Centralizado',
            courseSlug: 'desarrollo-frontend',
            description: 'Construcción de aplicaciones escalables con separación de vistas, señales y ciclo de vida.',
            estimatedHours: 20,
            skillsGained: ['Arquitectura de Componentes', 'Manejo de Estado', 'Enrutamiento Client-Side']
          }
        ];
        break;

      case 'algoritmos':
        recommendedPathSlug = 'fundamentos-programacion';
        recommendedPathTitle = 'Ruta de Fundamentos de Programación y Pensamiento Algorítmico';
        primaryCourseSlug = score >= 3 ? 'algoritmos-ordenamiento' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Algoritmos de Ordenamiento & Eficiencia' : 'Introducción a la Programación';
        recommendedSpecialty = 'Ciencias de la Computación & Algoritmos';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Lógica Pura y Variables de Estado',
            courseTitle: 'Introducción a la Programación',
            courseSlug: 'introduccion-programacion',
            description: 'Fundamentos de control de flujo, tablas de verdad, variables y diagramas algorítmicos.',
            estimatedHours: 12,
            skillsGained: ['Pensamiento Lógico', 'Estructuras de Control', 'Depuración Paso a Paso']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Modularidad y Programación Estructurada',
            courseTitle: 'Programación Estructurada con Python',
            courseSlug: 'python-estructurado',
            description: 'Diseño modular de funciones, arreglos, recursión y estructuras de datos dinámicas.',
            estimatedHours: 15,
            skillsGained: ['Modularidad', 'Colecciones en Memoria', 'Recursión']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Optimización y Análisis Asintótico Big-O',
            courseTitle: 'Algoritmos de Ordenamiento & Eficiencia',
            courseSlug: 'algoritmos-ordenamiento',
            description: 'Mide el consumo de tiempo y memoria en algoritmos de partición, árboles y grafos.',
            estimatedHours: 18,
            skillsGained: ['Notación Big-O', 'Divide & Vencerás', 'Optimización de Memoria']
          }
        ];
        break;

      case 'devops':
        recommendedPathSlug = 'devops';
        recommendedPathTitle = 'Ruta de DevOps, Linux & Automatización Cloud';
        primaryCourseSlug = score >= 3 ? 'introduccion-devops' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Introducción a DevOps y Contenedores' : 'Introducción a la Programación (Fundamentos DevOps)';
        recommendedSpecialty = 'DevOps & Infraestructura Cloud';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Dominio de Terminal Linux & Bash Scripting',
            courseTitle: 'Terminal y Shell Scripting para Ingenieros',
            courseSlug: 'terminal-linux-scripting',
            description: 'Control de procesos Unix, pipes, redirecciones, permisos y automatización de tareas en servidor.',
            estimatedHours: 12,
            skillsGained: ['Bash Scripting', 'Permisos POSIX', 'Control de Procesos']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Contenedores Docker y Aislamiento de Entornos',
            courseTitle: 'Docker & Microservicios Contenerizados',
            courseSlug: 'docker-contenedores',
            description: 'Creación de imágenes ligeras, volúmenes de datos, redes virtuales y docker-compose.',
            estimatedHours: 16,
            skillsGained: ['Dockerfiles Multi-stage', 'Redes de Contenedores', 'Docker Compose']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Pipelines de Integración Continua (CI/CD)',
            courseTitle: 'CI/CD con GitHub Actions y Despliegues Cloud',
            courseSlug: 'devops',
            description: 'Automatización de compilación, ejecución de tests y entrega continua a entornos de producción.',
            estimatedHours: 18,
            skillsGained: ['GitHub Actions', 'Monitoreo de Salud', 'Zero-Downtime Deployment']
          }
        ];
        break;

      case 'ia':
        recommendedPathSlug = 'desarrollo-con-ia';
        recommendedPathTitle = 'Ruta de Desarrollo Asistido por Inteligencia Artificial';
        primaryCourseSlug = 'desarrollo-con-ia';
        primaryCourseTitle = 'Ingeniería de Software con IA y Modelos LLM';
        recommendedSpecialty = 'Inteligencia Artificial Aplicada';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Modelos LLM y Prompt Engineering Técnico',
            courseTitle: 'Fundamentos de Modelos de Lenguaje & Prompting',
            courseSlug: 'desarrollo-con-ia',
            description: 'Estructuración de instrucciones semánticas, Few-shot prompting y limitaciones de alucinación.',
            estimatedHours: 10,
            skillsGained: ['Prompting Estructurado', 'Embeddings Semánticos', 'Tokens & Context Window']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Programación Asistida y Pair Programming con Agentes',
            courseTitle: 'Workflows de Ingeniería Asistida en el IDE',
            courseSlug: 'agentes-desarrollo',
            description: 'Uso de agentes de codificación para refactorización, generación de tests y análisis AST en vivo.',
            estimatedHours: 14,
            skillsGained: ['Pair Programming con Agentes', 'Generación de Pruebas Unitarias', 'Auditoría con IA']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Agentes Autónomos y Consumo de APIs de IA',
            courseTitle: 'Integración de Agentes y Llamadas a Herramientas (Function Calling)',
            courseSlug: 'ia-avanzada-agentes',
            description: 'Conecta modelos con APIs externas, bases de datos y ejecución de funciones automáticas.',
            estimatedHours: 18,
            skillsGained: ['Function Calling', 'RAG (Retrieval Augmented Gen)', 'Agentes Autónomos']
          }
        ];
        break;

      case 'poo':
        recommendedPathSlug = 'desarrollo-orientado-objetos';
        recommendedPathTitle = 'Ruta de Programación Orientada a Objetos y Diseño Limpio';
        primaryCourseSlug = score >= 3 ? 'clases-objetos-herencia' : 'introduccion-poo';
        primaryCourseTitle = score >= 3 ? 'Clases, Objetos y Herencia' : 'Introducción a la Programación Orientada a Objetos';
        recommendedSpecialty = 'Arquitectura de Objetos & Principios SOLID';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Abstracción, Clases, Objetos y Encapsulamiento',
            courseTitle: 'Clases, Objetos y Herencia',
            courseSlug: 'clases-objetos-herencia',
            description: 'Modela entidades reales con encapsulamiento estricto, métodos mutadores y constructores.',
            estimatedHours: 14,
            skillsGained: ['Encapsulamiento', 'Constructores', 'Modelado de Dominio']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Herencia, Polimorfismo e Interfaces',
            courseTitle: 'Polimorfismo y Diseño de Contratos de Software',
            courseSlug: 'polimorfismo-interfaces',
            description: 'Crea arquitecturas flexibles mediante contratos e interfaces desacopladas.',
            estimatedHours: 16,
            skillsGained: ['Polimorfismo', 'Interfaces y Tipos Abstractos', 'Inversión de Control']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: Principios SOLID y Patrones de Diseño GoF',
            courseTitle: 'Principios SOLID en la Práctica',
            courseSlug: 'principios-solid',
            description: 'Escribe código desacoplado, testeable y preparado para mantenimiento a largo plazo.',
            estimatedHours: 18,
            skillsGained: ['SRP, OCP, LSP, ISP, DIP', 'Inyección de Dependencias', 'Patrones GoF']
          }
        ];
        break;

      default: // 'backend'
        recommendedPathSlug = 'desarrollo-backend';
        recommendedPathTitle = 'Ruta de Desarrollo Backend & Arquitectura de APIs';
        primaryCourseSlug = score >= 3 ? 'backend-introduccion' : 'introduccion-programacion';
        primaryCourseTitle = score >= 3 ? 'Introducción al Backend & Arquitectura de Servidores' : 'Introducción a la Programación (Bases Backend)';
        recommendedSpecialty = 'Sistemas Backend & Arquitectura de APIs';
        syllabus = [
          {
            phaseNumber: 1,
            phaseTitle: 'Fase 1: Arquitectura de Servidores y Protocolo HTTP',
            courseTitle: 'Introducción al Backend & Arquitectura de Servidores',
            courseSlug: 'backend-introduccion',
            description: 'Comprende el ciclo de vida de peticiones HTTP, middlewares, códigos de estado y respuestas JSON.',
            estimatedHours: 12,
            skillsGained: ['Ciclo HTTP', 'Enrutamiento de Servidor', 'Middlewares']
          },
          {
            phaseNumber: 2,
            phaseTitle: 'Fase 2: Persistencia, Modelado Relacional y SQL',
            courseTitle: 'SQL desde Cero y Persistencia de Datos',
            courseSlug: 'sql-desde-cero',
            description: 'Diseño de bases de datos relacionales, llaves foráneas, JOINs y transacciones en PostgreSQL.',
            estimatedHours: 16,
            skillsGained: ['PostgreSQL', 'Modelado Relacional', 'Consultas Optimizadas']
          },
          {
            phaseNumber: 3,
            phaseTitle: 'Fase 3: APIs RESTful, Autenticación y Seguridad',
            courseTitle: 'Desarrollo de APIs RESTful y Seguridad',
            courseSlug: 'desarrollo-backend',
            description: 'Implementación de autenticación JWT stateless, validación estricta de payloads y control de acceso.',
            estimatedHours: 20,
            skillsGained: ['Autenticación JWT', 'Sanitización de Datos', 'Controladores REST']
          }
        ];
        break;
    }

    // Generar retroalimentación detallada y personalizada de Byte Copilot
    const strengths: string[] = [];
    if (isQ1Correct) strengths.push('✓ Excelente habilidad para proyectar transiciones de estado secuenciales.');
    if (isQ2Correct) strengths.push('✓ Dominio riguroso de lógica booleana compuesta y evaluación de compuertas (AND/OR/NOT).');
    if (isQ3Correct) strengths.push('✓ Gran capacidad para rastrear bucles iterativos con condiciones y acumuladores en memoria.');
    if (isQ4Correct) strengths.push('✓ Intuición algorítmica óptima para optimización mediante partición (divide y vencerás).');

    const weaknesses: string[] = [];
    if (!isQ1Correct) weaknesses.push('• Sugerimos ejercitar la simulación paso a paso de variables numéricas y paridad.');
    if (!isQ2Correct) weaknesses.push('• Conviene repasar tablas de verdad y precedencia de operadores lógicos condicionales.');
    if (!isQ3Correct) weaknesses.push('• Fortalecer el seguimiento mental de acumuladores dentro de ciclos repetitivos.');
    if (!isQ4Correct) weaknesses.push('• Desarrollar el pensamiento asintótico para elegir caminos de búsqueda eficientes.');

    const strengthsSummary = strengths.length > 0
      ? `Fortalezas demostradas:\n${strengths.join('\n')}`
      : 'Has dado tus primeros pasos en el análisis de problemas computacionales.';

    const weaknessesSummary = weaknesses.length > 0
      ? `\n\nÁreas clave a potenciar:\n${weaknesses.join('\n')}`
      : '\n\n¡Rendimiento impecable! No se detectaron fallos lógicos en tu evaluación.';

    const rationale = `\n\nDiagnóstico del Agente: Obtuviste ${score} de ${totalTechnical} aciertos (${generalScore}%). Calibré tu perfil en ${levelTitle} y asigné tu plan a la "${recommendedPathTitle}", iniciando con "${primaryCourseTitle}". Esta ruta te permitirá capitalizar tus afinidades en ${recommendedSpecialty} mientras avanzas con retos prácticos progresivos.`;

    const agentFeedback = `${strengthsSummary}${weaknessesSummary}${rationale}`;

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
        oop: flowScore,
        database: optimizationScore,
        architecture: generalScore
      },
      syllabus,
      agentFeedback,
      completedAt: new Date().toISOString()
    };

    this.analysisResult.set(result);

    // Guardar en AuthService y emitir evento global para actualización en vivo del perfil
    this.auth.saveDiagnosticResult(result);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('syseng:diagnostic_completed', { detail: result }));
    }
  }

  recalibrate() {
    this.stage.set('assessment');
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(null);
    this.userAnswers.set({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
