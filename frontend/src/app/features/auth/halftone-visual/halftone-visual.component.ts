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
      <canvas #canvas class="particle-canvas"></canvas>
      <div class="glow-backdrop"></div>
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
        background: #030712;
        overflow: hidden;
        user-select: none;
      }

      .particle-canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
        z-index: 1;
      }

      .glow-backdrop {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(
          ellipse 70% 60% at 85% 50%,
          rgba(0, 217, 255, 0.15) 0%,
          rgba(10, 233, 138, 0.08) 40%,
          transparent 80%
        );
      }

      .watermark-tag {
        position: absolute;
        bottom: 24px;
        right: 32px;
        z-index: 2;
        font-family: var(--font-mono, monospace);
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.16em;
        color: rgba(148, 163, 184, 0.35);
        pointer-events: none;
        text-transform: uppercase;
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
      const autoX = width * (0.7 + 0.15 * Math.sin(time * 0.6));
      const autoY = height * (0.5 + 0.2 * Math.cos(time * 0.45));
      this.mouseX += (autoX - this.mouseX) * 0.03;
      this.mouseY += (autoY - this.mouseY) * 0.03;
    }

    ctx.clearRect(0, 0, width, height);

    // Grid spacing matching reference image
    const step = 14;
    const cols = Math.ceil(width / step) + 2;
    const rows = Math.ceil(height / step) + 2;

    const mouseRadius = 180;

    for (let c = 0; c < cols; c++) {
      const gx = c * step;
      const nx = gx / width;

      for (let r = 0; r < rows; r++) {
        const gy = r * step;
        const ny = gy / height;

        // Curved organic wavefront boundary (arcs from top-center through middle to bottom-center)
        // Parabolic / elliptical boundary curve matching the screenshot
        const curveOffset = 0.22 + Math.pow(Math.abs(ny - 0.5), 1.6) * 0.25;
        if (nx < curveOffset) {
          // Outside the wavefront, completely clean/empty on the left
          continue;
        }

        // Distance from wavefront edge (0 at boundary, increases toward right)
        const depthFromEdge = (nx - curveOffset) / (1 - curveOffset);

        // 3D undulating wave equation
        const w1 = Math.sin(nx * 4.2 + time * 1.15);
        const w2 = Math.cos(ny * 5.0 - time * 0.9);
        const w3 = Math.sin((nx * 3.0 + ny * 3.5) + time * 0.7);
        const w4 = Math.cos(Math.sqrt((nx - 0.8) ** 2 + (ny - 0.5) ** 2) * 6.0 - time * 1.6);

        let elevation = (w1 + w2 + w3 * 0.7 + w4 * 0.8) / 3.5; // ~ -1 to +1

        // Modulation based on depth from the curved edge
        const edgeFade = Math.min(1, depthFromEdge * 3.5);
        elevation = (elevation * 0.6 + 0.4) * edgeFade;

        // Interactive mouse ripple
        const dx = gx - this.mouseX;
        const dy = gy - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mouseLuminescence = 0;
        if (dist < mouseRadius) {
          const mFactor = 1 - dist / mouseRadius;
          const ripple = Math.sin(dist * 0.08 - time * 6.0);
          elevation += mFactor * ripple * 0.7;
          mouseLuminescence = mFactor;
        }

        const normalized = Math.max(0, Math.min(1, elevation));
        const radius = 0.85 + normalized * 3.6;

        if (radius < 0.8) continue;

        // Color palette exactly like the screenshot:
        // Glowing cyan-emerald gradient in core, subtle teal/blue at perimeter
        let color: string;
        if (mouseLuminescence > 0.4) {
          color = `rgba(255, 255, 255, ${0.5 + mouseLuminescence * 0.5})`;
        } else if (normalized > 0.75) {
          // Core bright emerald/cyan
          color = `rgba(10, 233, 138, ${0.75 + normalized * 0.25})`;
        } else if (normalized > 0.45) {
          // Mid vibrant cyan
          color = `rgba(0, 217, 255, ${0.55 + normalized * 0.35})`;
        } else if (normalized > 0.2) {
          // Subtle teal / dark cyan
          color = `rgba(0, 180, 216, ${0.3 + normalized * 0.3})`;
        } else {
          // Faint perimeter dots
          color = `rgba(148, 163, 184, ${0.12 * edgeFade})`;
        }

        ctx.fillStyle = color;

        // Render diamond or circle based on density
        if (normalized > 0.58) {
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
