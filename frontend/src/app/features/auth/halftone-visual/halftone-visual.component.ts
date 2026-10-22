import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject
} from '@angular/core';

@Component({
  selector: 'app-halftone-visual',
  standalone: true,
  template: `
    <div class="visual-container" (pointermove)="onPointerMove($event)" (pointerleave)="onPointerLeave()">
      <div class="glow-backdrop"></div>
      <canvas #canvas class="particle-canvas"></canvas>
      <div class="left-fade-overlay"></div>
      <div class="watermark-tag">
        SYSENG // REVOLUTIONIZING SYSTEM LEARNING
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

      .visual-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        background: #050911;
        overflow: hidden;
        user-select: none;
      }

      .glow-backdrop {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(
          circle at 75% 45%,
          rgba(0, 229, 153, 0.22) 0%,
          rgba(14, 165, 233, 0.14) 35%,
          rgba(5, 9, 17, 0) 70%
        );
      }

      .particle-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 1;
      }

      .left-fade-overlay {
        position: absolute;
        inset-y: 0;
        left: 0;
        width: 90px;
        background: linear-gradient(to right, #050911 0%, transparent 100%);
        pointer-events: none;
        z-index: 2;
      }

      .watermark-tag {
        position: absolute;
        bottom: 24px;
        right: 32px;
        z-index: 3;
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: 10px;
        font-weight: 500;
        letter-spacing: 0.18em;
        color: rgba(148, 163, 184, 0.4);
        pointer-events: none;
        text-transform: uppercase;
      }

      @media (max-width: 1024px) {
        .visual-container {
          min-height: 420px;
        }
        .watermark-tag {
          bottom: 16px;
          right: 20px;
          font-size: 9px;
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

  private mouseX = -9999;
  private mouseY = -9999;
  private targetMouseX = -9999;
  private targetMouseY = -9999;
  private isHovered = false;

  private startTime = performance.now();

  ngAfterViewInit(): void {
    this.initCanvas();
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
  }

  onPointerLeave(): void {
    this.isHovered = false;
  }

  private initCanvas(): void {
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
      const autoX = width * (0.7 + 0.12 * Math.sin(time * 0.5));
      const autoY = height * (0.45 + 0.15 * Math.cos(time * 0.4));
      this.mouseX += (autoX - this.mouseX) * 0.03;
      this.mouseY += (autoY - this.mouseY) * 0.03;
    }

    ctx.clearRect(0, 0, width, height);

    // Matrix spacing matching Stitch mockup (14px grid)
    const step = 14;
    const cols = Math.ceil(width / step) + 2;
    const rows = Math.ceil(height / step) + 2;
    const mouseRadius = 170;

    for (let c = 0; c < cols; c++) {
      const gx = c * step;
      const nx = gx / width;

      for (let r = 0; r < rows; r++) {
        const gy = r * step;
        const ny = gy / height;

        // Organic curve boundary matching Stitch screenshot 7c1e:
        // Top starts around nx = 0.18, dips to nx = 0.10 near ny = 0.42, then sweeps out to nx = 0.45 at bottom
        const curveOffset = 0.10 + 0.38 * Math.pow(ny - 0.42, 2) + 0.14 * ny;
        if (nx < curveOffset) {
          continue;
        }

        // Depth into the particle field
        const depthFromEdge = (nx - curveOffset) / Math.max(0.01, 1 - curveOffset);
        const edgeFade = Math.min(1, depthFromEdge * 4.5);

        // Undulating wave equation
        const w1 = Math.sin(nx * 3.8 + time * 1.1);
        const w2 = Math.cos(ny * 4.6 - time * 0.85);
        const w3 = Math.sin((nx * 2.8 + ny * 3.2) + time * 0.65);
        const w4 = Math.cos(Math.sqrt(Math.pow(nx - 0.75, 2) + Math.pow(ny - 0.45, 2)) * 5.8 - time * 1.5);

        let elevation = (w1 + w2 + w3 * 0.7 + w4 * 0.8) / 3.5;
        elevation = (elevation * 0.65 + 0.35) * edgeFade;

        // Interactive mouse luminescence
        const dx = gx - this.mouseX;
        const dy = gy - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mouseLuminescence = 0;
        if (dist < mouseRadius) {
          const mFactor = 1 - dist / mouseRadius;
          const ripple = Math.sin(dist * 0.09 - time * 5.5);
          elevation += mFactor * ripple * 0.6;
          mouseLuminescence = mFactor;
        }

        const normalized = Math.max(0, Math.min(1, elevation));
        const radius = 0.8 + normalized * 3.4;

        if (radius < 0.75) continue;

        // Color palette matching Stitch 7c1e screenshot:
        // Luminescent emerald (#00E599), vibrant cyan (#0EA5E9), deep teal, and subtle slate
        let color: string;
        if (mouseLuminescence > 0.4) {
          color = `rgba(255, 255, 255, ${0.6 + mouseLuminescence * 0.4})`;
        } else if (normalized > 0.72) {
          color = `rgba(0, 229, 153, ${0.8 + normalized * 0.2})`;
        } else if (normalized > 0.45) {
          color = `rgba(14, 165, 233, ${0.6 + normalized * 0.35})`;
        } else if (normalized > 0.22) {
          color = `rgba(16, 185, 129, ${0.35 + normalized * 0.3})`;
        } else {
          color = `rgba(148, 163, 184, ${0.16 * edgeFade})`;
        }

        ctx.fillStyle = color;

        // High elevation nodes render as delicate diamonds, others as rounded points
        if (normalized > 0.62) {
          ctx.beginPath();
          ctx.moveTo(gx, gy - radius);
          ctx.lineTo(gx + radius, gy);
          ctx.lineTo(gx, gy + radius);
          ctx.lineTo(gx - radius, gy);
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
