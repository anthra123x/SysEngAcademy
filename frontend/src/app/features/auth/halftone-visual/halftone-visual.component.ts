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
    <div class="halftone-container" (pointermove)="onPointerMove($event)" (pointerleave)="onPointerLeave()">
      <canvas #canvas class="halftone-canvas"></canvas>
      <div class="halftone-vignette"></div>
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
        background: radial-gradient(circle at 70% 30%, #0d1322 0%, #06080e 100%);
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
        background: radial-gradient(ellipse at center, transparent 40%, rgba(6, 8, 14, 0.75) 100%),
                    linear-gradient(to right, rgba(6, 8, 14, 0.4) 0%, transparent 15%, transparent 85%, rgba(6, 8, 14, 0.4) 100%);
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
  }

  onPointerLeave(): void {
    this.isHovered = false;
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
      // Idle organic floating motion across the field
      const autoX = width * (0.65 + 0.2 * Math.sin(time * 0.7));
      const autoY = height * (0.5 + 0.25 * Math.cos(time * 0.5));
      this.mouseX += (autoX - this.mouseX) * 0.03;
      this.mouseY += (autoY - this.mouseY) * 0.03;
    }

    ctx.clearRect(0, 0, width, height);

    // Spacing between halftone dots
    const step = 14;
    const cols = Math.ceil(width / step) + 2;
    const rows = Math.ceil(height / step) + 2;

    const mouseRadius = 200;

    for (let c = 0; c < cols; c++) {
      const gx = c * step;
      const nx = gx / width;

      for (let r = 0; r < rows; r++) {
        const gy = r * step;
        const ny = gy / height;

        // Multi-frequency harmonic 3D waves creating an expansive organic landscape
        const w1 = Math.sin(nx * 3.8 + time * 1.1);
        const w2 = Math.cos(ny * 4.6 - time * 0.9);
        const w3 = Math.sin((nx * 2.8 + ny * 3.4) + time * 0.7);
        const w4 = Math.cos(Math.sqrt((nx - 0.75) ** 2 + (ny - 0.45) ** 2) * 6.5 - time * 1.5);

        let elevation = (w1 + w2 + w3 * 0.75 + w4 * 0.85) / 3.6; // ~ -1 to +1

        // Organic density gradient sweeping from the right side inward (like the reference image)
        const densityField = Math.pow(Math.max(0, nx - 0.08), 0.85) * (1.15 - Math.abs(ny - 0.45) * 0.65);
        elevation = elevation * 0.55 + densityField * 0.9;

        // Interactive mouse gravity ripple
        const dx = gx - this.mouseX;
        const dy = gy - this.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let mouseGlow = 0;
        if (dist < mouseRadius) {
          const mFactor = 1 - dist / mouseRadius;
          const ripple = Math.sin(dist * 0.07 - time * 5.5);
          elevation += mFactor * ripple * 0.9;
          mouseGlow = mFactor;
        }

        // Halftone dot radius modulation (0.75px fine star up to 5.2px dense halftone dot)
        const normalizedElev = Math.max(0, Math.min(1, (elevation + 0.65) / 1.6));
        const radius = 0.75 + Math.pow(normalizedElev, 1.7) * 4.5;

        if (radius < 0.7) continue;

        // Color interpolation: clean, sophisticated dark tech palette
        let color: string;
        if (mouseGlow > 0.4) {
          color = `rgba(255, 255, 255, ${0.45 + mouseGlow * 0.5})`;
        } else if (normalizedElev > 0.75) {
          // Emerald crest
          const alpha = 0.7 + normalizedElev * 0.28;
          color = `rgba(10, 233, 138, ${alpha})`;
        } else if (normalizedElev > 0.45) {
          // Cyber Cyan mid
          const alpha = 0.45 + normalizedElev * 0.45;
          color = `rgba(0, 217, 255, ${alpha})`;
        } else if (normalizedElev > 0.22) {
          // Subtle violet transition
          const alpha = 0.2 + normalizedElev * 0.35;
          color = `rgba(139, 92, 246, ${alpha})`;
        } else {
          // Background delicate points
          color = 'rgba(148, 163, 184, 0.16)';
        }

        ctx.fillStyle = color;

        // Halftone diamonds in higher density zones, circles in outer zones
        if (normalizedElev > 0.6) {
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
