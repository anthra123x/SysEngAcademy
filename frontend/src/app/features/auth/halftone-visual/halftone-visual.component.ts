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
    <div class="visual-canvas-wrap">
      <div class="glow-backdrop"></div>
      <canvas #canvas class="particle-canvas"></canvas>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        z-index: 1;
      }

      .visual-canvas-wrap {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: transparent;
        overflow: hidden;
      }

      .glow-backdrop {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        background: radial-gradient(
          circle at 75% 42%,
          rgba(0, 229, 153, 0.16) 0%,
          rgba(14, 165, 233, 0.10) 38%,
          rgba(5, 9, 17, 0) 72%
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
    `
  ]
})
export class HalftoneVisualComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ngZone = inject(NgZone);
  private animId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
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

  private smoothstep(min: number, max: number, value: number): number {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
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

    ctx.clearRect(0, 0, width, height);

    // Uniform technical dot matrix (16px grid step)
    const step = 16;
    const cols = Math.ceil(width / step) + 1;
    const rows = Math.ceil(height / step) + 1;

    for (let c = 0; c < cols; c++) {
      const gx = c * step;
      const nx = gx / width;

      // Smooth horizontal blend factor:
      // Ambient faint dots on the left, organic rich wave expanding smoothly on the right
      const blendFactor = this.smoothstep(0.22, 0.72, nx);

      for (let r = 0; r < rows; r++) {
        const gy = r * step;
        const ny = gy / height;

        // Fluid 3D wave harmonics based solely on natural time (no mouse cursor spotlight)
        const w1 = Math.sin(nx * 3.6 + time * 1.05);
        const w2 = Math.cos(ny * 4.4 - time * 0.8);
        const w3 = Math.sin((nx * 2.6 + ny * 3.0) + time * 0.65);
        const w4 = Math.cos(Math.sqrt(Math.pow(nx - 0.72, 2) + Math.pow(ny - 0.45, 2)) * 5.4 - time * 1.4);

        const rawElevation = (w1 + w2 + w3 * 0.7 + w4 * 0.8) / 3.5;
        const verticalWeight = 1.0 - 0.35 * Math.pow(ny - 0.46, 2);

        // Blended wave elevation: smoothly transitions from zero on the left to full on the right
        const waveElevation = Math.max(0, (rawElevation * 0.55 + 0.45) * blendFactor * verticalWeight);

        // Ambient base: every dot in the grid has a calm presence so everything feels connected
        const baseAmbient = 0.07 + 0.03 * Math.sin(nx * 6.0 + ny * 5.0 + time * 0.3);
        const totalEnergy = Math.max(baseAmbient, waveElevation);

        // Radius calculation
        const radius = 0.8 + totalEnergy * 2.4;

        // Color and glow selection matching the natural emerald & cyan Stitch palette
        let color: string;

        if (totalEnergy > 0.65) {
          // Wave crest: electric cyan in upper right, bright neon emerald in mid wave
          if (ny < 0.32 && nx > 0.58) {
            color = `rgba(14, 165, 233, ${0.75 + totalEnergy * 0.25})`;
          } else {
            color = `rgba(0, 229, 153, ${0.75 + totalEnergy * 0.25})`;
          }
        } else if (totalEnergy > 0.4) {
          // Mid wave: cyan and teal
          if (ny < 0.38 && nx > 0.55) {
            color = `rgba(56, 189, 248, ${0.5 + totalEnergy * 0.3})`;
          } else {
            color = `rgba(16, 185, 129, ${0.45 + totalEnergy * 0.3})`;
          }
        } else if (totalEnergy > 0.2) {
          // Transition / deep teal
          color = `rgba(13, 148, 136, ${0.25 + totalEnergy * 0.25})`;
        } else {
          // Ambient dots: very subtle slate on the left side, blending seamlessly
          const ambientAlpha = 0.09 + blendFactor * 0.08;
          color = `rgba(148, 163, 184, ${ambientAlpha})`;
        }

        ctx.fillStyle = color;

        // Render dot: high-energy nodes render as slight diamonds, others as clean circular points
        if (totalEnergy > 0.72 && nx > 0.6) {
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
