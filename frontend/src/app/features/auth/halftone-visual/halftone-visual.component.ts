import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject,
  signal
} from '@angular/core';

@Component({
  selector: 'app-halftone-visual',
  standalone: true,
  template: `
    <div class="halftone-container" (pointermove)="onPointerMove($event)" (pointerleave)="onPointerLeave()">
      <canvas #canvas class="halftone-canvas"></canvas>
      
      <!-- Overlay Vignette and Grid Lines -->
      <div class="halftone-vignette"></div>
      <div class="halftone-scanline"></div>

      <!-- Tech HUD Overlays -->
      <div class="hud-layer">
        <div class="hud-top">
          <div class="hud-badge">
            <span class="live-dot"></span>
            <span class="hud-badge__text">SYSENG.CORE // v2.6</span>
          </div>
          <div class="hud-telemetry">
            <span>{{ telemetryCoord() }}</span>
          </div>
        </div>

        <div class="hud-bottom">
          <div class="hud-info-card">
            <div class="info-card-header">
              <span class="sys-chip">TOPOLOGÍA CUÁNTICA</span>
              <span class="latency-tag">12ms</span>
            </div>
            <p class="info-card-desc">
              Campo dinámico de partículas y vectores de ejecución en tiempo real.
            </p>
            <div class="info-card-footer">
              <span class="protocol-label">PROTOCOLO:</span>
              <code>TLS 1.3 / AES-256-GCM</code>
            </div>
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

      .halftone-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 520px;
        background: radial-gradient(circle at 75% 25%, #0f172a 0%, #06080e 100%);
        overflow: hidden;
        user-select: none;
      }

      .halftone-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }

      .halftone-vignette {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse at center, transparent 35%, rgba(6, 8, 14, 0.82) 100%),
                    linear-gradient(to right, rgba(6, 8, 14, 0.6) 0%, transparent 20%, transparent 80%, rgba(6, 8, 14, 0.4) 100%);
      }

      .halftone-scanline {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0),
          rgba(255, 255, 255, 0) 50%,
          rgba(0, 0, 0, 0.25) 50%,
          rgba(0, 0, 0, 0.25)
        );
        background-size: 100% 4px;
        opacity: 0.35;
      }

      .hud-layer {
        position: absolute;
        inset: 0;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
        z-index: 2;
      }

      .hud-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .hud-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 10px;
        border-radius: 9999px;
        background: rgba(10, 15, 26, 0.75);
        border: 1px solid rgba(0, 217, 255, 0.25);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0ae98a;
          box-shadow: 0 0 8px #0ae98a;
          animation: pulse-live 2s infinite ease-in-out;
        }

        &__text {
          font-family: var(--font-mono, monospace);
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #e2e8f0;
        }
      }

      .hud-telemetry {
        font-family: var(--font-mono, monospace);
        font-size: 10px;
        font-weight: 600;
        color: rgba(148, 163, 184, 0.7);
        letter-spacing: 0.05em;
        background: rgba(10, 15, 26, 0.5);
        padding: 3px 8px;
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.05);
      }

      .hud-bottom {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hud-info-card {
        background: rgba(11, 16, 28, 0.72);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 14px 16px;
        backdrop-filter: blur(12px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-width: 380px;

        .info-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .sys-chip {
            font-family: var(--font-mono, monospace);
            font-size: 10px;
            font-weight: 700;
            color: #00d9ff;
            letter-spacing: 0.08em;
          }

          .latency-tag {
            font-family: var(--font-mono, monospace);
            font-size: 10px;
            font-weight: 600;
            color: #0ae98a;
            background: rgba(10, 233, 138, 0.1);
            padding: 1px 6px;
            border-radius: 4px;
            border: 1px solid rgba(10, 233, 138, 0.25);
          }
        }

        .info-card-desc {
          margin: 0;
          font-size: 12px;
          line-height: 1.45;
          color: #94a3b8;
        }

        .info-card-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 6px;

          .protocol-label {
            color: #64748b;
            font-weight: 600;
          }

          code {
            font-family: var(--font-mono, monospace);
            color: #cbd5e1;
            font-size: 10px;
          }
        }
      }

      @keyframes pulse-live {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.3);
          opacity: 0.6;
        }
      }

      @media (max-width: 960px) {
        .halftone-container {
          min-height: 200px;
        }
        .hud-layer {
          padding: 14px;
        }
        .hud-info-card {
          display: none;
        }
      }
    `
  ]
})
export class HalftoneVisualComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ngZone = inject(NgZone);
  private animId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  telemetryCoord = signal('POS: [0.50, 0.50]');

  private mouseX = -9999;
  private mouseY = -9999;
  private targetMouseX = -9999;
  private targetMouseY = -9999;
  private isHovered = false;

  private startTime = performance.now();

  ngAfterViewInit(): void {
    this.initCanvasAndLoop();
  }

  ngOnDestroy(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  onPointerMove(e: PointerEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.targetMouseX = e.clientX - rect.left;
    this.targetMouseY = e.clientY - rect.top;
    this.isHovered = true;

    // Telemetry display
    const nx = Math.max(0, Math.min(1, this.targetMouseX / rect.width)).toFixed(2);
    const ny = Math.max(0, Math.min(1, this.targetMouseY / rect.height)).toFixed(2);
    this.telemetryCoord.set(`VEC: [${nx}, ${ny}]`);
  }

  onPointerLeave(): void {
    this.isHovered = false;
    this.telemetryCoord.set('POS: [IDLE]');
  }

  private initCanvasAndLoop(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    resize();

    this.resizeObserver = new ResizeObserver(() => {
      resize();
    });
    this.resizeObserver.observe(container);

    // Run animation outside Angular zone to prevent triggering CD on every frame
    this.ngZone.runOutsideAngular(() => {
      const render = () => {
        this.renderFrame();
        this.animId = requestAnimationFrame(render);
      };
      this.animId = requestAnimationFrame(render);
    });
  }

  private renderFrame(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    if (width === 0 || height === 0) return;

    const now = performance.now();
    const time = (now - this.startTime) * 0.001;

    // Smooth mouse interpolation
    if (this.isHovered) {
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.12;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.12;
    } else {
      // Idle gentle floating cursor motion
      const autoX = width * (0.6 + 0.25 * Math.sin(time * 0.8));
      const autoY = height * (0.5 + 0.3 * Math.cos(time * 0.6));
      this.mouseX += (autoX - this.mouseX) * 0.04;
      this.mouseY += (autoY - this.mouseY) * 0.04;
    }

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Spacing between dots
    const step = 14;
    const cols = Math.ceil(width / step) + 2;
    const rows = Math.ceil(height / step) + 2;

    const mouseRadius = 160;

    for (let c = 0; c < cols; c++) {
      const gx = c * step;
      const nx = gx / width;

      for (let r = 0; r < rows; r++) {
        const gy = r * step;
        const ny = gy / height;

        // Multi-frequency harmonic mathematical waves creating an organic topology
        const w1 = Math.sin(nx * 4.5 + time * 1.2);
        const w2 = Math.cos(ny * 5.2 - time * 0.95);
        const w3 = Math.sin((nx * 3.0 + ny * 4.0) + time * 0.7);
        const w4 = Math.cos(Math.sqrt((nx - 0.7) ** 2 + (ny - 0.4) ** 2) * 7.0 - time * 1.8);

        let elevation = (w1 + w2 + w3 * 0.7 + w4 * 0.9) / 3.6; // ~ -1 to +1

        // Organic density mask (condenses toward right & center-bottom like the reference image)
        const organicShape = Math.sin(nx * Math.PI) * Math.cos((ny - 0.2) * Math.PI) + (nx * 0.7);
        elevation = elevation * 0.7 + organicShape * 0.5;

        // Interactive mouse gravity ripple
        const dx = gx - this.mouseX;
        const dy = gy - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mouseLuminescence = 0;
        if (dist < mouseRadius) {
          const mFactor = 1 - dist / mouseRadius;
          const ripple = Math.sin(dist * 0.08 - time * 6.0);
          elevation += mFactor * ripple * 0.85;
          mouseLuminescence = mFactor;
        }

        // Halftone dot radius modulation (0.6px subtle star up to 4.5px dense halftone dot)
        const normalizedElev = Math.max(0, Math.min(1, (elevation + 0.8) / 1.7));
        const radius = 0.65 + Math.pow(normalizedElev, 1.8) * 3.8;

        if (radius < 0.6) continue;

        // Color interpolation based on elevation & mouse glow
        let color: string;
        if (mouseLuminescence > 0.4) {
          color = `rgba(255, 255, 255, ${0.4 + mouseLuminescence * 0.5})`;
        } else if (normalizedElev > 0.75) {
          // Emerald crest
          const alpha = 0.6 + normalizedElev * 0.35;
          color = `rgba(10, 233, 138, ${alpha})`;
        } else if (normalizedElev > 0.45) {
          // Cyber Cyan mid
          const alpha = 0.4 + normalizedElev * 0.45;
          color = `rgba(0, 217, 255, ${alpha})`;
        } else if (normalizedElev > 0.25) {
          // Tech Violet subtle
          const alpha = 0.25 + normalizedElev * 0.3;
          color = `rgba(139, 92, 246, ${alpha})`;
        } else {
          // Background subtle matrix
          color = 'rgba(148, 163, 184, 0.15)';
        }

        ctx.fillStyle = color;

        // Draw diamond shape for higher elevation (halftone screen effect) or circle
        if (normalizedElev > 0.65) {
          ctx.beginPath();
          ctx.moveTo(gx, gy - radius * 1.15);
          ctx.lineTo(gx + radius * 1.15, gy);
          ctx.lineTo(gx, gy + radius * 1.15);
          ctx.lineTo(gx - radius * 1.15, gy);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(gx, gy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}
