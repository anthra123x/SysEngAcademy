import { Component, signal, OnInit, OnDestroy } from '@angular/core';

interface CodeSnippet {
  id: string;
  filename: string;
  language: string;
  badge: string;
  challengeTitle: string;
  difficulty: 'Fácil' | 'Intermedio' | 'Avanzado';
  xpReward: number;
  codeLines: { num: number; code: string; highlight?: boolean }[];
  testResults: { label: string; latency: string; passed: boolean }[];
}

@Component({
  selector: 'app-gamified-visual',
  standalone: true,
  template: `
    <div class="gamified-container">
      <!-- Ambient Cyber Glows -->
      <div class="glow-orb glow-top-right"></div>
      <div class="glow-orb glow-bottom-left"></div>

      <!-- Tech Background Grid -->
      <div class="cyber-grid-overlay"></div>

      <!-- Floating Tech Badges / Atmosphere Nodes -->
      <div class="floating-tech-item float-1">fn main() &#123;</div>
      <div class="floating-tech-item float-2">&lt;ClusterMesh /&gt;</div>
      <div class="floating-tech-item float-3">0x7F49A2 // Ok(quorum)</div>
      <div class="floating-tech-item float-4">async/await :: sys</div>

      <!-- Main Showcase Wrapper -->
      <div class="showcase-content">
        <!-- Top Floating HUD: Player Profile & Level Progress -->
        <div class="hud-card hud-player-card">
          <div class="player-avatar-wrap">
            <div class="player-avatar">
              <span class="avatar-sym">&lt;/&gt;</span>
            </div>
            <div class="player-level-badge">18</div>
          </div>
          <div class="player-info">
            <div class="player-top-line">
              <span class="player-title">Kernel Systems Architect</span>
              <span class="streak-pill">
                <span class="flame-icon">🔥</span> 14 Días
              </span>
            </div>
            <div class="xp-bar-wrap">
              <div class="xp-bar-track">
                <div class="xp-bar-fill" [style.width.%]="xpPercent()"></div>
              </div>
              <span class="xp-text">3,450 / 4,000 XP</span>
            </div>
          </div>
        </div>

        <!-- Central Interactive Cyber IDE Card -->
        <div class="ide-terminal-card">
          <!-- Window Header with macOS Dots & Language Tabs -->
          <div class="terminal-header">
            <div class="window-controls">
              <span class="dot dot-close"></span>
              <span class="dot dot-minimize"></span>
              <span class="dot dot-maximize"></span>
            </div>

            <!-- Tab Switchers -->
            <div class="file-tabs">
              @for (snip of snippets; track snip.id) {
                <button
                  type="button"
                  class="tab-btn"
                  [class.active]="activeTab().id === snip.id"
                  (click)="selectTab(snip)"
                >
                  <span class="tab-lang-icon" [attr.data-lang]="snip.language">
                    {{ snip.language === 'rust' ? '🦀' : snip.language === 'python' ? '🐍' : '⚡' }}
                  </span>
                  <span class="tab-name">{{ snip.filename }}</span>
                </button>
              }
            </div>

            <div class="challenge-pill">
              <span class="diff-tag" [attr.data-diff]="activeTab().difficulty">
                {{ activeTab().difficulty }}
              </span>
              <span class="xp-tag">+{{ activeTab().xpReward }} XP</span>
            </div>
          </div>

          <!-- Code View Area -->
          <div class="code-viewport">
            <div class="code-inner">
              @for (line of activeTab().codeLines; track line.num) {
                <div class="code-row" [class.highlighted-row]="line.highlight">
                  <span class="line-num">{{ line.num }}</span>
                  <span class="line-content" [innerHTML]="line.code"></span>
                </div>
              }
            </div>
          </div>

          <!-- Live Interactive Sandbox Runner Console -->
          <div class="console-runner">
            <div class="console-top-bar">
              <div class="console-status">
                <span class="status-indicator" [class.running]="isRunningTests()"></span>
                <span class="status-label">
                  {{ isRunningTests() ? 'Compilando sandbox en WebAssembly...' : 'Sandbox Aislado // Codelab v2.4' }}
                </span>
              </div>
              <button
                type="button"
                class="btn-run-code"
                [disabled]="isRunningTests()"
                (click)="triggerRunTests()"
              >
                <span class="play-icon">▶</span>
                <span>{{ isRunningTests() ? 'Ejecutando...' : 'Probar Reto' }}</span>
              </button>
            </div>

            <!-- Test Pipeline Execution Log -->
            <div class="test-results-stream">
              @for (t of activeTab().testResults; track t.label; let idx = $index) {
                <div
                  class="test-item"
                  [class.test-passed]="testsPassed() > idx"
                  [class.test-pending]="testsPassed() <= idx"
                >
                  <span class="test-icon">
                    {{ testsPassed() > idx ? '✓' : '◌' }}
                  </span>
                  <span class="test-name">{{ t.label }}</span>
                  <span class="test-latency">{{ t.latency }}</span>
                </div>
              }

              @if (testsPassed() >= activeTab().testResults.length) {
                <div class="quest-unlocked-banner">
                  <span class="quest-emoji">🎉</span>
                  <div class="quest-text">
                    <strong>¡Reto Completado con Éxito!</strong>
                    <span>+{{ activeTab().xpReward }} XP agregados a tu perfil</span>
                  </div>
                  <span class="level-up-tag">NIVEL 18</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Bottom Floating HUD: Live Metrics and Active Users -->
        <div class="hud-footer-stats">
          <div class="stat-pill">
            <span class="pulse-green"></span>
            <span class="stat-bold">14,890</span>
            <span class="stat-dim">desarrolladores online</span>
          </div>

          <div class="stat-pill">
            <span class="stat-icon">🛡️</span>
            <span class="stat-bold">Zero-Trust Sandbox</span>
            <span class="stat-dim">0.4ms ping</span>
          </div>

          <div class="stat-pill watermark-pill">
            SYSENG // GAMIFIED LEARNING
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      .gamified-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        background: #050911;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(1.5rem, 3vw, 3rem);
        box-sizing: border-box;
        overflow: hidden;
        user-select: none;
      }

      /* Ambient Volumetric Nebulas */
      .glow-orb {
        position: absolute;
        border-radius: 50%;
        filter: blur(120px);
        pointer-events: none;
        z-index: 0;
      }

      .glow-top-right {
        top: -10%;
        right: -10%;
        width: 500px;
        height: 500px;
        background: radial-gradient(circle, rgba(0, 229, 153, 0.16) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 80%);
      }

      .glow-bottom-left {
        bottom: -15%;
        left: 20%;
        width: 480px;
        height: 480px;
        background: radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%, rgba(0, 229, 153, 0.06) 60%, transparent 80%);
      }

      /* Subtle Cyber Grid Lines */
      .cyber-grid-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 1;
        background-size: 44px 44px;
        background-image:
          linear-gradient(to right, rgba(255, 255, 255, 0.018) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
      }

      /* Floating Tech Snippets in Background */
      .floating-tech-item {
        position: absolute;
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: 11px;
        font-weight: 600;
        color: rgba(148, 163, 184, 0.12);
        letter-spacing: 0.05em;
        pointer-events: none;
        z-index: 1;
        animation: floatDrift 16s ease-in-out infinite alternate;
      }

      .float-1 { top: 12%; left: 10%; animation-delay: 0s; }
      .float-2 { top: 22%; right: 8%; animation-delay: 2s; }
      .float-3 { bottom: 18%; left: 8%; animation-delay: 4s; }
      .float-4 { bottom: 25%; right: 12%; animation-delay: 6s; }

      @keyframes floatDrift {
        from { transform: translateY(0px) rotate(0deg); }
        to { transform: translateY(-18px) rotate(2deg); }
      }

      /* Main Showcase Wrapper */
      .showcase-content {
        position: relative;
        z-index: 10;
        width: 100%;
        max-width: 580px;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      /* Player Profile & XP HUD Card */
      .hud-player-card {
        background: rgba(9, 16, 29, 0.85);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 0.9rem 1.2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        backdrop-filter: blur(12px);
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
      }

      .player-avatar-wrap {
        position: relative;

        .player-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #00E599 0%, #0ea5e9 100%);
          color: #050911;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono, monospace);
          font-weight: 800;
          font-size: 14px;
          box-shadow: 0 4px 16px rgba(0, 229, 153, 0.3);
        }

        .player-level-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #050911;
          color: #00E599;
          border: 1.5px solid #00E599;
          border-radius: 6px;
          font-family: var(--font-mono, monospace);
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
        }
      }

      .player-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .player-top-line {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .player-title {
            font-size: 0.88rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.01em;
          }

          .streak-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: #fbbf24;
            font-size: 11px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 9999px;

            .flame-icon {
              font-size: 12px;
            }
          }
        }

        .xp-bar-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;

          .xp-bar-track {
            flex: 1;
            height: 6px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 9999px;
            overflow: hidden;

            .xp-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #00E599, #00c985);
              border-radius: 9999px;
              box-shadow: 0 0 10px rgba(0, 229, 153, 0.5);
              transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
          }

          .xp-text {
            font-family: var(--font-mono, monospace);
            font-size: 10px;
            font-weight: 600;
            color: #94a3b8;
          }
        }
      }

      /* Interactive IDE Terminal Card */
      .ide-terminal-card {
        background: rgba(9, 16, 29, 0.94);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 18px;
        overflow: hidden;
        backdrop-filter: blur(16px);
        box-shadow: 0 20px 50px -15px rgba(0, 0, 0, 0.7),
                    0 0 24px rgba(0, 229, 153, 0.06);
        transition: transform 0.25s ease, border-color 0.25s ease;

        &:hover {
          border-color: rgba(0, 229, 153, 0.3);
        }
      }

      /* Terminal Header Bar */
      .terminal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.65rem 1rem;
        background: rgba(5, 9, 17, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);

        .window-controls {
          display: flex;
          align-items: center;
          gap: 6px;

          .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;

            &.dot-close { background: #ef4444; }
            &.dot-minimize { background: #f59e0b; }
            &.dot-maximize { background: #10b981; }
          }
        }

        .file-tabs {
          display: flex;
          align-items: center;
          gap: 4px;

          .tab-btn {
            background: transparent;
            border: 1px solid transparent;
            border-radius: 6px;
            padding: 4px 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            color: #94a3b8;
            font-family: var(--font-mono, monospace);
            font-size: 11px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              color: #ffffff;
              background: rgba(255, 255, 255, 0.04);
            }

            &.active {
              color: #00E599;
              background: rgba(0, 229, 153, 0.08);
              border-color: rgba(0, 229, 153, 0.25);
            }
          }
        }

        .challenge-pill {
          display: flex;
          align-items: center;
          gap: 6px;

          .diff-tag {
            font-family: var(--font-mono, monospace);
            font-size: 9px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;

            &[data-diff="Avanzado"] {
              background: rgba(239, 68, 68, 0.15);
              color: #f87171;
              border: 1px solid rgba(239, 68, 68, 0.3);
            }
            &[data-diff="Intermedio"] {
              background: rgba(245, 158, 11, 0.15);
              color: #fbbf24;
              border: 1px solid rgba(245, 158, 11, 0.3);
            }
            &[data-diff="Fácil"] {
              background: rgba(16, 185, 129, 0.15);
              color: #34d399;
              border: 1px solid rgba(16, 185, 129, 0.3);
            }
          }

          .xp-tag {
            font-family: var(--font-mono, monospace);
            font-size: 10px;
            font-weight: 800;
            color: #00E599;
          }
        }
      }

      /* Code Viewport */
      .code-viewport {
        padding: 1rem 1.1rem;
        background: #060b14;
        overflow-x: auto;

        .code-inner {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .code-row {
          display: flex;
          align-items: baseline;
          gap: 1.25rem;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 12px;
          line-height: 1.5;

          &.highlighted-row {
            background: rgba(0, 229, 153, 0.06);
            border-left: 2px solid #00E599;
            padding-left: 4px;
            margin-left: -6px;
          }

          .line-num {
            width: 20px;
            text-align: right;
            color: #475569;
            font-size: 10px;
            user-select: none;
            flex-shrink: 0;
          }

          .line-content {
            color: #cbd5e1;
            white-space: pre;

            :deep(.kw) { color: #c084fc; font-weight: 600; }
            :deep(.fn) { color: #38bdf8; font-weight: 600; }
            :deep(.type) { color: #fde047; }
            :deep(.str) { color: #34d399; }
            :deep(.num) { color: #f97316; }
            :deep(.com) { color: #64748b; font-style: italic; }
            :deep(.accent) { color: #00E599; font-weight: 700; }
          }
        }
      }

      /* Console Runner Section */
      .console-runner {
        background: #040810;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        padding: 0.85rem 1.1rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .console-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .console-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .status-indicator {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: #00E599;
              box-shadow: 0 0 8px #00E599;

              &.running {
                background: #f59e0b;
                box-shadow: 0 0 8px #f59e0b;
                animation: pulseStatus 0.8s infinite;
              }
            }

            .status-label {
              font-family: var(--font-mono, monospace);
              font-size: 10.5px;
              color: #94a3b8;
              letter-spacing: 0.04em;
            }
          }

          .btn-run-code {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #00E599;
            color: #050911;
            border: none;
            border-radius: 8px;
            padding: 5px 12px;
            font-family: var(--font-mono, monospace);
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0, 229, 153, 0.3);
            transition: all 0.15s ease;

            &:hover:not(:disabled) {
              background: #00c985;
              transform: translateY(-1px);
              box-shadow: 0 4px 14px rgba(0, 229, 153, 0.45);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }

            .play-icon {
              font-size: 9px;
            }
          }
        }

        .test-results-stream {
          display: flex;
          flex-direction: column;
          gap: 5px;

          .test-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 8px;
            border-radius: 6px;
            font-family: var(--font-mono, monospace);
            font-size: 11px;
            transition: all 0.2s ease;

            &.test-passed {
              background: rgba(0, 229, 153, 0.06);
              color: #cbd5e1;

              .test-icon {
                color: #00E599;
                font-weight: 800;
              }
              .test-latency {
                color: #38bdf8;
              }
            }

            &.test-pending {
              color: #64748b;
              .test-icon {
                color: #475569;
              }
            }

            .test-name {
              flex: 1;
              margin-left: 8px;
            }

            .test-latency {
              font-size: 10px;
            }
          }
        }

        .quest-unlocked-banner {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: linear-gradient(90deg, rgba(0, 229, 153, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%);
          border: 1px solid rgba(0, 229, 153, 0.35);
          border-radius: 8px;
          padding: 6px 10px;
          margin-top: 4px;
          animation: bannerSlideUp 0.3s ease;

          .quest-emoji {
            font-size: 16px;
          }

          .quest-text {
            flex: 1;
            display: flex;
            flex-direction: column;

            strong {
              font-size: 11.5px;
              color: #ffffff;
            }

            span {
              font-size: 10px;
              color: #00E599;
              font-family: var(--font-mono, monospace);
            }
          }

          .level-up-tag {
            font-family: var(--font-mono, monospace);
            font-size: 9px;
            font-weight: 800;
            background: #00E599;
            color: #050911;
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
      }

      @keyframes pulseStatus {
        50% { opacity: 0.4; }
      }

      @keyframes bannerSlideUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Bottom Stats HUD */
      .hud-footer-stats {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;

        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(9, 16, 29, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          padding: 5px 12px;
          font-family: var(--font-mono, monospace);
          font-size: 10px;
          backdrop-filter: blur(8px);

          .pulse-green {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #00E599;
            box-shadow: 0 0 6px #00E599;
          }

          .stat-bold {
            color: #ffffff;
            font-weight: 700;
          }

          .stat-dim {
            color: #94a3b8;
          }

          &.watermark-pill {
            color: rgba(148, 163, 184, 0.45);
            font-weight: 600;
            letter-spacing: 0.12em;
          }
        }
      }

      @media (max-width: 1200px) {
        .showcase-content {
          max-width: 500px;
        }
      }
    `
  ]
})
export class AuthGamifiedVisualComponent implements OnInit, OnDestroy {
  readonly snippets: CodeSnippet[] = [
    {
      id: 'rust-kernel',
      filename: 'distributed_kernel.rs',
      language: 'rust',
      badge: 'Rust 1.76',
      challengeTitle: 'Consenso Raft Distribuido',
      difficulty: 'Avanzado',
      xpReward: 350,
      codeLines: [
        { num: 1, code: '<span class="com">// Reto 042: Creador de Quorum en Memoria</span>' },
        { num: 2, code: '<span class="kw">pub async fn</span> <span class="fn">replicate_state</span>(entry: <span class="type">LogEntry</span>) -&gt; <span class="type">Result</span>&lt;<span class="type">u64</span>, <span class="type">QuorumErr</span>&gt; {' },
        { num: 3, code: '    <span class="kw">let</span> <span class="kw">mut</span> cluster = <span class="type">EngineCluster</span>::<span class="fn">connect_mesh</span>().<span class="kw">await</span>?;', highlight: true },
        { num: 4, code: '    cluster.<span class="fn">verify_signatures</span>(&amp;entry.<span class="fn">hash</span>())?;' },
        { num: 5, code: '    <span class="kw">let</span> ack_count = cluster.<span class="fn">broadcast_atomic</span>(entry).<span class="kw">await</span>?;' },
        { num: 6, code: '    <span class="kw">if</span> ack_count &gt;= cluster.<span class="fn">majority_quorum</span>() {' },
        { num: 7, code: '        <span class="type">Ok</span>(cluster.<span class="fn">commit_index</span>())' },
        { num: 8, code: '    } <span class="kw">else</span> { <span class="type">Err</span>(<span class="type">QuorumErr</span>::<span class="type">LeaderDegraded</span>) }' },
        { num: 9, code: '}' }
      ],
      testResults: [
        { label: 'Test 1: Zero-copy packet pipeline', latency: '0.3ms', passed: true },
        { label: 'Test 2: Distributed consensus quorum', latency: '1.2ms', passed: true },
        { label: 'Test 3: Chaos partition resilience', latency: '0.8ms', passed: true }
      ]
    },
    {
      id: 'python-arena',
      filename: 'arena_challenger.py',
      language: 'python',
      badge: 'Python 3.12',
      challengeTitle: 'Algoritmo de Rate Limiting Token Bucket',
      difficulty: 'Intermedio',
      xpReward: 250,
      codeLines: [
        { num: 1, code: '<span class="com"># Reto Arena: Algoritmo de Defensa Anti-DDoS</span>' },
        { num: 2, code: '<span class="kw">class</span> <span class="type">TokenBucketLimiter</span>:' },
        { num: 3, code: '    <span class="kw">def</span> <span class="fn">__init__</span>(self, capacity: <span class="type">int</span>, refill_rate: <span class="type">float</span>):' },
        { num: 4, code: '        self.capacity = capacity' },
        { num: 5, code: '        self.tokens = capacity', highlight: true },
        { num: 6, code: '    <span class="kw">async def</span> <span class="fn">acquire</span>(self, tokens_needed: <span class="type">int</span> = <span class="num">1</span>) -&gt; <span class="type">bool</span>:' },
        { num: 7, code: '        self.<span class="fn">_refill_tokens</span>()' },
        { num: 8, code: '        <span class="kw">return</span> self.<span class="fn">_deduct_if_available</span>(tokens_needed)' }
      ],
      testResults: [
        { label: 'Test 1: Burst protection limits', latency: '0.1ms', passed: true },
        { label: 'Test 2: High concurrency lock acquisition', latency: '0.4ms', passed: true },
        { label: 'Test 3: Memory leak heap inspection', latency: '0.2ms', passed: true }
      ]
    },
    {
      id: 'ts-cloud',
      filename: 'orchestrator.ts',
      language: 'typescript',
      badge: 'TypeScript 5.4',
      challengeTitle: 'Autoscaling de Microservicios Cloud',
      difficulty: 'Avanzado',
      xpReward: 300,
      codeLines: [
        { num: 1, code: '<span class="com">// Sandbox de Arquitectura Cloud SysEng</span>' },
        { num: 2, code: '<span class="kw">import</span> { <span class="type">K8sCluster</span>, <span class="type">Telemetry</span> } <span class="kw">from</span> <span class="str">"@syseng/core"</span>;' },
        { num: 3, code: '<span class="kw">export async function</span> <span class="fn">scaleReplicas</span>(metric: <span class="type">RpsSignal</span>) {' },
        { num: 4, code: '  <span class="kw">const</span> nodes = <span class="kw">await</span> <span class="type">K8sCluster</span>.<span class="fn">discoverActiveNodes</span>();', highlight: true },
        { num: 5, code: '  <span class="kw">if</span> (metric.cpuUsage &gt; <span class="num">0.82</span>) {' },
        { num: 6, code: '    <span class="kw">await</span> nodes.<span class="fn">dispatchHorizontalScale</span>({ replicas: <span class="num">12</span> });' },
        { num: 7, code: '  }' },
        { num: 8, code: '}' }
      ],
      testResults: [
        { label: 'Test 1: Cluster health ping SLA', latency: '0.2ms', passed: true },
        { label: 'Test 2: Auto-scaling trigger under 50k rps', latency: '0.9ms', passed: true },
        { label: 'Test 3: Graceful drain and rollback check', latency: '0.5ms', passed: true }
      ]
    }
  ];

  activeTab = signal<CodeSnippet>(this.snippets[0]);
  isRunningTests = signal(false);
  testsPassed = signal(3);
  xpPercent = signal(86);

  private autoRunInterval: any = null;

  ngOnInit(): void {
    // Periodically simulate a subtle code execution cycle
    this.autoRunInterval = setInterval(() => {
      this.runTestsStepByStep();
    }, 14000);
  }

  ngOnDestroy(): void {
    if (this.autoRunInterval) {
      clearInterval(this.autoRunInterval);
    }
  }

  selectTab(snippet: CodeSnippet): void {
    if (this.activeTab().id === snippet.id) return;
    this.activeTab.set(snippet);
    this.testsPassed.set(snippet.testResults.length);
  }

  triggerRunTests(): void {
    if (this.isRunningTests()) return;
    this.runTestsStepByStep();
  }

  private runTestsStepByStep(): void {
    this.isRunningTests.set(true);
    this.testsPassed.set(0);

    setTimeout(() => {
      this.testsPassed.set(1);
    }, 600);

    setTimeout(() => {
      this.testsPassed.set(2);
    }, 1200);

    setTimeout(() => {
      this.testsPassed.set(3);
      this.isRunningTests.set(false);
    }, 1800);
  }
}
