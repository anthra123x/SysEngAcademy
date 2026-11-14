import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject,
  PLATFORM_ID,
  ChangeDetectionStrategy
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface AsciiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleOffset: number;
  symbol: string;
  targetSymbol: string;
  isAccent: boolean;
  fontSize: number;
  baseOpacity: number;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
  morphTimer: number;
  morphDuration: number;
  morphProgress: number;
}

const PROGRAMMING_SYMBOLS: readonly string[] = [
  '{ }', '</>', '=>', '//', '::', '0x7F', 'fn()', '&&', '!=', '->',
  ':=', '~', 'std::', '||', '*ptr', 'λ', '===', '0b101', 'null', '<<',
  '#', '[ ]', '++', 'struct', 'async', 'await', 'void', '<T>', '&mut',
  '??', ';;', '01', '10', '0xFF', '0x00', 'enum', 'impl'
];

const GLITCH_CHARS: readonly string[] = ['0', '1', '#', '/', '!', '$', '%', '&', '*', '+', '=', '?', '@', '^', '~'];

@Component({
  selector: 'app-ascii-background',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ascii-bg" aria-hidden="true">
      <div class="ascii-bg__grid"></div>
      <canvas #canvas class="ascii-bg__canvas"></canvas>
      <div class="ascii-bg__vignette"></div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
      display: block;
    }

    .ascii-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-base, #09090b);

      &__grid {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
          linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
          linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px);
        background-size: 32px 32px;
      }

      &__canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: block;
      }

      &__vignette {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(ellipse 95% 85% at 50% 25%, transparent 45%, rgba(9, 9, 11, 0.55) 100%);
      }
    }
  `]
})
export class AsciiBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) private canvasRef?: ElementRef<HTMLCanvasElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);

  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private particles: AsciiParticle[] = [];
  private width = 0;
  private height = 0;
  private dpr = 1;

  private mouseX = -9999;
  private mouseY = -9999;
  private targetMouseX = -9999;
  private targetMouseY = -9999;

  private isRunning = false;
  private resizeHandler = () => this.handleResize();
  private mouseMoveHandler = (e: MouseEvent) => this.handleMouseMove(e);
  private mouseLeaveHandler = () => this.handleMouseLeave();
  private visibilityHandler = () => this.handleVisibilityChange();

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.initCanvas();
    });
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('mousemove', this.mouseMoveHandler);
      document.removeEventListener('mouseleave', this.mouseLeaveHandler);
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx = canvas.getContext('2d', { alpha: true });
    if (!this.ctx) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.handleResize();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    document.addEventListener('mouseleave', this.mouseLeaveHandler, { passive: true });
    document.addEventListener('visibilitychange', this.visibilityHandler, { passive: true });

    if (prefersReducedMotion) {
      // Draw static frame only
      this.renderFrame(0);
      return;
    }

    this.startAnimation();
  }

  private handleResize(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    canvas.width = Math.floor(this.width * this.dpr);
    canvas.height = Math.floor(this.height * this.dpr);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);

    this.initParticles();
  }

  private initParticles(): void {
    // Density calculation: 1 particle per ~32000px², bounded between 24 and 65
    const targetCount = Math.max(24, Math.min(65, Math.floor((this.width * this.height) / 32000)));
    this.particles = [];

    for (let i = 0; i < targetCount; i++) {
      this.particles.push(this.createParticle(false));
    }
  }

  private createParticle(spawnAtBottom: boolean): AsciiParticle {
    const symbol = PROGRAMMING_SYMBOLS[Math.floor(Math.random() * PROGRAMMING_SYMBOLS.length)];
    const isAccent = Math.random() < 0.22;
    const baseOpacity = isAccent
      ? 0.16 + Math.random() * 0.12 // 0.16 - 0.28 for emerald green
      : 0.08 + Math.random() * 0.09; // 0.08 - 0.17 for monochrome zinc/white

    const x = Math.random() * this.width;
    const y = spawnAtBottom
      ? this.height + 20 + Math.random() * 40
      : Math.random() * this.height;

    return {
      x,
      y,
      baseX: x,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(0.18 + Math.random() * 0.28), // upward drift ~0.18 to 0.46 px/frame
      wobbleSpeed: 0.008 + Math.random() * 0.012,
      wobbleAmp: 8 + Math.random() * 16,
      wobbleOffset: Math.random() * Math.PI * 2,
      symbol,
      targetSymbol: symbol,
      isAccent,
      fontSize: 11 + (Math.random() > 0.7 ? 1 : 0), // 11px or 12px
      baseOpacity,
      opacity: baseOpacity,
      pulseSpeed: 0.015 + Math.random() * 0.02,
      pulseOffset: Math.random() * Math.PI * 2,
      morphTimer: 180 + Math.floor(Math.random() * 400),
      morphDuration: 8,
      morphProgress: 0
    };
  }

  private handleMouseMove(e: MouseEvent): void {
    this.targetMouseX = e.clientX;
    this.targetMouseY = e.clientY;
  }

  private handleMouseLeave(): void {
    this.targetMouseX = -9999;
    this.targetMouseY = -9999;
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.stopAnimation();
    } else {
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;

      const delta = Math.min((currentTime - lastTime) / 16.67, 2.5); // Normalized to 60fps
      lastTime = currentTime;

      this.updateParticles(currentTime, delta);
      this.renderFrame(currentTime);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopAnimation(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private updateParticles(time: number, delta: number): void {
    // Smooth cursor interpolation
    if (this.targetMouseX > -5000) {
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.15;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.15;
    } else {
      this.mouseX = -9999;
      this.mouseY = -9999;
    }

    const mouseRepulsionRadius = 130;
    const mouseRepulsionForce = 1.2;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Vertical drift
      p.y += p.vy * delta;

      // Horizontal sinusoidal wobble
      const wobble = Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * p.wobbleAmp;
      p.x = p.baseX + wobble;

      // Subtle mouse repulsion
      if (this.mouseX > -5000) {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < mouseRepulsionRadius * mouseRepulsionRadius && distSq > 1) {
          const dist = Math.sqrt(distSq);
          const factor = (1 - dist / mouseRepulsionRadius) * mouseRepulsionForce;
          p.x += (dx / dist) * factor * 2.5;
          p.y += (dy / dist) * factor * 2.5;
          p.baseX += (dx / dist) * factor * 0.5;
        }
      }

      // Opacity breathing / pulse
      const pulse = Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.035;
      p.opacity = Math.max(0.04, Math.min(0.35, p.baseOpacity + pulse));

      // Dynamic morph / glitch behavior
      p.morphTimer--;
      if (p.morphTimer <= 0 && p.morphProgress === 0) {
        p.morphProgress = p.morphDuration;
        p.targetSymbol = PROGRAMMING_SYMBOLS[Math.floor(Math.random() * PROGRAMMING_SYMBOLS.length)];
      }

      if (p.morphProgress > 0) {
        p.morphProgress--;
        if (p.morphProgress > 0) {
          // Display random glitch ASCII character during morph
          p.symbol = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        } else {
          // Settle on new symbol
          p.symbol = p.targetSymbol;
          p.morphTimer = 200 + Math.floor(Math.random() * 450);
        }
      }

      // Recycle particle when it exits top of screen
      if (p.y < -30) {
        const recycled = this.createParticle(true);
        this.particles[i] = recycled;
      }
    }
  }

  private renderFrame(time: number): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      this.ctx.font = `500 ${p.fontSize}px "JetBrains Mono", Menlo, Monaco, Consolas, monospace`;

      if (p.isAccent) {
        // Emerald terminal accent color
        this.ctx.fillStyle = `rgba(34, 197, 94, ${p.opacity.toFixed(3)})`;
      } else {
        // High-contrast clean zinc/white
        this.ctx.fillStyle = `rgba(244, 244, 245, ${p.opacity.toFixed(3)})`;
      }

      this.ctx.fillText(p.symbol, Math.round(p.x), Math.round(p.y));
    }
  }
}
