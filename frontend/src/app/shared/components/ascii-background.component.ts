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
  // Base motion
  x: number;
  y: number;
  baseX: number;
  vy: number;
  // Compound harmonic horizontal swaying (suave y orgánico)
  swayFreq1: number;
  swayAmp1: number;
  swayPhase1: number;
  swayFreq2: number;
  swayAmp2: number;
  swayPhase2: number;
  // Dynamic smooth cursor interaction (spring dampening)
  displaceX: number;
  displaceY: number;
  targetDisplaceX: number;
  targetDisplaceY: number;
  // Visuals & ASCII style
  symbol: string;
  targetSymbol: string;
  fontSize: number;
  baseOpacity: number;
  pulseFreq: number;
  pulsePhase: number;
  colorType: 'zinc' | 'emerald' | 'cyan';
  // Smooth morphing transition (sin parpadeos bruscos)
  morphState: 'idle' | 'fading_out' | 'fading_in';
  morphAlpha: number;
  nextMorphTime: number;
}

// Conjunto de tokens y operadores de programación en auténtica sintaxis ASCII
const ASCII_CODE_TOKENS: readonly string[] = [
  '{ }', '[ ]', '( )', '</>', '=>', '->', '::', ':=',
  '//', '/* */', '!=', '==', '===', '&&', '||', '~',
  '*ptr', '&mut', '<T>', 'fn()', '0x7F', '0xFF', '0x00',
  '0b101', 'std::', '++', '--', '>>', '<<', '??', 'NaN',
  '01', '10', 'let', 'nil', ';;', '#[cfg]'
];

// Glifos y partículas estilo ASCII ("bolitas" y puntos de matriz ASCII)
const ASCII_MATRIX_GLYPHS: readonly string[] = [
  '·', '+', '*', '°', ':', '.', '_', '#', '@', '%'
];

const ALL_ASCII_SYMBOLS: readonly string[] = [
  ...ASCII_CODE_TOKENS,
  ...ASCII_MATRIX_GLYPHS
];

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
        background: radial-gradient(ellipse 95% 85% at 50% 25%, transparent 40%, rgba(9, 9, 11, 0.6) 100%);
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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.handleResize();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    document.addEventListener('mouseleave', this.mouseLeaveHandler, { passive: true });
    document.addEventListener('visibilitychange', this.visibilityHandler, { passive: true });

    if (prefersReducedMotion) {
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
    // Densidad visual óptima: ~1 partícula cada 24000px² (aprox 35-75 partículas en desktop)
    const targetCount = Math.max(28, Math.min(75, Math.floor((this.width * this.height) / 24000)));
    this.particles = [];

    const now = performance.now();
    for (let i = 0; i < targetCount; i++) {
      this.particles.push(this.createParticle(false, now));
    }
  }

  private createParticle(spawnAtBottom: boolean, now: number): AsciiParticle {
    // 70% tokens de código, 30% glifos de matriz ASCII ("bolitas/puntos")
    const isGlyph = Math.random() < 0.30;
    const symbolList = isGlyph ? ASCII_MATRIX_GLYPHS : ASCII_CODE_TOKENS;
    const symbol = symbolList[Math.floor(Math.random() * symbolList.length)];

    // Selección de color armónico con la paleta de SysEng
    const colorRoll = Math.random();
    let colorType: 'zinc' | 'emerald' | 'cyan' = 'zinc';
    let baseOpacity = 0.09 + Math.random() * 0.08; // 0.09 a 0.17

    if (colorRoll < 0.25) {
      colorType = 'emerald';
      baseOpacity = 0.18 + Math.random() * 0.12; // 0.18 a 0.30 (verde terminal visible)
    } else if (colorRoll < 0.38) {
      colorType = 'cyan';
      baseOpacity = 0.14 + Math.random() * 0.10; // 0.14 a 0.24 (cyan sutil)
    }

    const x = Math.random() * this.width;
    const y = spawnAtBottom
      ? this.height + 25 + Math.random() * 40
      : Math.random() * this.height;

    return {
      x,
      y,
      baseX: x,
      // Movimiento vertical muy suave (flotación lenta hacia arriba)
      vy: -(0.14 + Math.random() * 0.16), // ~0.14 a 0.30 px por frame a 60fps
      // Ondulación horizontal armónica compuesta (períodos de 12 a 24 segundos)
      swayFreq1: 0.25 + Math.random() * 0.25, // rad/s
      swayAmp1: 12 + Math.random() * 16,     // px
      swayPhase1: Math.random() * Math.PI * 2,
      swayFreq2: 0.12 + Math.random() * 0.15,
      swayAmp2: 6 + Math.random() * 10,
      swayPhase2: Math.random() * Math.PI * 2,
      // Amortiguación elástica de cursor
      displaceX: 0,
      displaceY: 0,
      targetDisplaceX: 0,
      targetDisplaceY: 0,
      // Estilo visual
      symbol,
      targetSymbol: symbol,
      fontSize: isGlyph ? 10 + Math.floor(Math.random() * 2) : 11 + Math.floor(Math.random() * 2), // 10-12px
      baseOpacity,
      pulseFreq: 0.4 + Math.random() * 0.5, // rad/s (período ~8-14 segundos)
      pulsePhase: Math.random() * Math.PI * 2,
      colorType,
      // Transición suave de símbolo sin parpadeos
      morphState: 'idle',
      morphAlpha: 1,
      nextMorphTime: now + 12000 + Math.random() * 24000
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

      const delta = Math.min((currentTime - lastTime) / 16.67, 2.0); // Normalizado a 60fps
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
    const tSeconds = time * 0.001; // Tiempo en segundos para oscilaciones suaves

    // Interpolación suave de posición del cursor
    if (this.targetMouseX > -5000) {
      this.mouseX += (this.targetMouseX - this.mouseX) * 0.12 * delta;
      this.mouseY += (this.targetMouseY - this.mouseY) * 0.12 * delta;
    } else {
      this.mouseX = -9999;
      this.mouseY = -9999;
    }

    const mouseRadius = 150;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // 1. Flotación vertical suave
      p.y += p.vy * delta;

      // 2. Ondulación armónica sinusoidal dual (sin saltos bruscos)
      const sway =
        Math.sin(tSeconds * p.swayFreq1 + p.swayPhase1) * p.swayAmp1 +
        Math.cos(tSeconds * p.swayFreq2 + p.swayPhase2) * p.swayAmp2;
      const naturalX = p.baseX + sway;

      // 3. Interacción dinámica y suave con el cursor (resorte amortiguado)
      if (this.mouseX > -5000) {
        const dx = naturalX - this.mouseX;
        const dy = p.y - this.mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < mouseRadiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          // Fuerza cuadrática suave que disminuye hacia los bordes
          const force = Math.pow(1 - dist / mouseRadius, 1.8) * 42;
          p.targetDisplaceX = (dx / dist) * force;
          p.targetDisplaceY = (dy / dist) * force;
        } else {
          p.targetDisplaceX = 0;
          p.targetDisplaceY = 0;
        }
      } else {
        p.targetDisplaceX = 0;
        p.targetDisplaceY = 0;
      }

      // Amortiguación hacia la posición de reposo
      p.displaceX += (p.targetDisplaceX - p.displaceX) * 0.08 * delta;
      p.displaceY += (p.targetDisplaceY - p.displaceY) * 0.08 * delta;

      // 4. Transición elegante de cambio de símbolo (fade-out y fade-in suave)
      if (time > p.nextMorphTime && p.morphState === 'idle') {
        p.morphState = 'fading_out';
        p.targetSymbol = ALL_ASCII_SYMBOLS[Math.floor(Math.random() * ALL_ASCII_SYMBOLS.length)];
      }

      if (p.morphState === 'fading_out') {
        p.morphAlpha -= 0.035 * delta;
        if (p.morphAlpha <= 0) {
          p.morphAlpha = 0;
          p.symbol = p.targetSymbol;
          p.morphState = 'fading_in';
        }
      } else if (p.morphState === 'fading_in') {
        p.morphAlpha += 0.035 * delta;
        if (p.morphAlpha >= 1) {
          p.morphAlpha = 1;
          p.morphState = 'idle';
          p.nextMorphTime = time + 14000 + Math.random() * 26000;
        }
      }

      // 5. Reciclaje suave al salir por arriba
      if (p.y < -35) {
        this.particles[i] = this.createParticle(true, time);
      }
    }
  }

  private renderFrame(time: number): void {
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.width, this.height);
    const tSeconds = time * 0.001;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Ondulación horizontal
      const sway =
        Math.sin(tSeconds * p.swayFreq1 + p.swayPhase1) * p.swayAmp1 +
        Math.cos(tSeconds * p.swayFreq2 + p.swayPhase2) * p.swayAmp2;

      const renderX = Math.round(p.baseX + sway + p.displaceX);
      const renderY = Math.round(p.y + p.displaceY);

      // Respiración sutil de opacidad
      const pulse = Math.sin(tSeconds * p.pulseFreq + p.pulsePhase) * 0.03;

      // Suavizado en bordes superior e inferior para evitar cortes bruscos
      let edgeFade = 1;
      if (p.y < 70) {
        edgeFade = Math.max(0, p.y / 70);
      } else if (p.y > this.height - 70) {
        edgeFade = Math.max(0, (this.height - p.y) / 70);
      }

      const totalOpacity = Math.max(
        0.03,
        Math.min(0.42, (p.baseOpacity + pulse) * edgeFade * p.morphAlpha)
      );

      // Tipografía nítida monoespaciada para auténtico renderizado ASCII
      this.ctx.font = `500 ${p.fontSize}px "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace`;

      if (p.colorType === 'emerald') {
        this.ctx.fillStyle = `rgba(34, 197, 94, ${totalOpacity.toFixed(3)})`;
      } else if (p.colorType === 'cyan') {
        this.ctx.fillStyle = `rgba(56, 189, 248, ${totalOpacity.toFixed(3)})`;
      } else {
        this.ctx.fillStyle = `rgba(244, 244, 245, ${totalOpacity.toFixed(3)})`;
      }

      this.ctx.fillText(p.symbol, renderX, renderY);
    }
  }
}
