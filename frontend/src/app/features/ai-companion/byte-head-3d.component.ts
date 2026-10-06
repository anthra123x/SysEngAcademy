import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  NgZone,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

@Component({
  selector: 'app-byte-head-3d',
  standalone: true,
  template: `
    <div
      class="byte-head-canvas-container"
      (click)="onClick()"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      role="button"
      tabindex="0"
      aria-label="Byte IA - Mascota Robot 3D"
      title="Haz clic para interactuar con Byte"
    >
      <canvas #canvasRef class="byte-head-webgl-canvas"></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      user-select: none;
    }

    .byte-head-canvas-container {
      position: relative;
      width: 100%;
      height: 100%;
      min-width: 100px;
      min-height: 100px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:active {
        transform: scale(0.96);
      }
    }

    .byte-head-webgl-canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
      pointer-events: auto;
    }
  `],
})
export class ByteHead3dComponent implements OnInit, OnDestroy {
  @ViewChild('canvasRef', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() isThinking = false;
  @Input() uiState: 'idle' | 'asking' | 'responding' = 'idle';
  @Output() headClick = new EventEmitter<void>();

  private ngZone = inject(NgZone);

  // Three.js Core
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animFrameId?: number;

  // Clock & Timing
  private clock = new THREE.Clock();
  private blinkTimer = 0;
  private isWinkOpen = false;
  private jumpProgress = -1; // -1 = idle, 0..1 = jump bounce

  // Model Groups
  private rootGroup?: THREE.Group;
  private headGroup?: THREE.Group;
  private leftEyeMesh?: THREE.Mesh;
  private rightWinkMesh?: THREE.Mesh;
  private rightOpenEyeMesh?: THREE.Mesh;
  private blushLeft?: THREE.Mesh;
  private blushRight?: THREE.Mesh;
  private mouthMesh?: THREE.Mesh;
  private screenLight?: THREE.PointLight;
  private shadowMesh?: THREE.Mesh;

  // Disposables
  private disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];

  // Interaction & Tracking
  private targetLook = new THREE.Vector2(0, 0);
  private currentLook = new THREE.Vector2(0, 0);

  private mouseMoveListener = (e: MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetLook.set(nx, ny);
  };

  ngOnInit() {
    window.addEventListener('mousemove', this.mouseMoveListener, { passive: true });
    this.ngZone.runOutsideAngular(() => {
      this.initThree();
      this.animate();
    });
  }

  ngOnDestroy() {
    window.removeEventListener('mousemove', this.mouseMoveListener);
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.disposeThree();
  }

  onClick() {
    this.jumpProgress = 0;
    this.headClick.emit();
  }

  onTouchStart(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.updateTouchCoords(e.touches[0]);
    }
  }

  onTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      this.updateTouchCoords(e.touches[0]);
    }
  }

  private updateTouchCoords(t: Touch) {
    const nx = (t.clientX / window.innerWidth) * 2 - 1;
    const ny = -(t.clientY / window.innerHeight) * 2 + 1;
    this.targetLook.set(nx, ny);
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 110;
    const height = canvas.clientHeight || 110;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera: Framed specifically for Byte's cute monitor head
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    this.camera.position.set(0, 0.02, 3.10);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer with transparent background
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 4. Studio Lighting for Retro Ceramic & CRT Character
    const ambientLight = new THREE.AmbientLight(0xf2f8ff, 1.55);
    this.scene.add(ambientLight);

    // Key Light (Warm soft daylight from top right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.4, 3.2, 2.8);
    this.scene.add(keyLight);

    // Electric Cyan Rim Light (Highlights monitor bevel edge)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.6);
    rimLight.position.set(-2.8, 2.0, -1.8);
    this.scene.add(rimLight);

    // Soft Indigo / Purple Bounce Fill Light from bottom
    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    fillLight.position.set(1.2, -2.2, 1.8);
    this.scene.add(fillLight);

    // 5. Build Rig
    this.buildByteHeadRig();
  }

  private buildByteHeadRig() {
    if (!this.scene) return;

    // Materials Palette
    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.10,
      roughness: 0.20,
    });
    this.disposables.push(whiteChassisMat);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.30,
      roughness: 0.35,
    });
    this.disposables.push(bezelMat);

    const crtScreenMat = new THREE.MeshStandardMaterial({
      color: 0x080d1a,
      metalness: 0.90,
      roughness: 0.08,
    });
    this.disposables.push(crtScreenMat);

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });
    this.disposables.push(cyanGlowMat);

    const blushPinkMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.78,
    });
    this.disposables.push(blushPinkMat);

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.85,
      roughness: 0.28,
    });
    this.disposables.push(darkTrimMat);

    // Root Group
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Soft Floating Contact Shadow below head
    const shadowTex = this.createShadowTexture();
    this.disposables.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(1.2, 0.7);
    this.disposables.push(shadowGeo);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    this.disposables.push(shadowMat);
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = -0.78;
    this.rootGroup.add(this.shadowMesh);

    // Head Main Group
    this.headGroup = new THREE.Group();
    this.rootGroup.add(this.headGroup);

    // --- 1. RETRO MONITOR CHASSIS (Rounded CRT Casing from Image 2) ---
    const chassisGeo = new RoundedBoxGeometry(1.36, 1.18, 0.92, 6, 0.22);
    this.disposables.push(chassisGeo);
    const chassisMesh = new THREE.Mesh(chassisGeo, whiteChassisMat);
    this.headGroup.add(chassisMesh);

    // --- 2. SUNKEN SCREEN BEZEL (Front Frame) ---
    const bezelGeo = new RoundedBoxGeometry(1.15, 0.96, 0.10, 4, 0.15);
    this.disposables.push(bezelGeo);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.set(0, 0.01, 0.43);
    this.headGroup.add(bezelMesh);

    // --- 3. CRT SCREEN GLASS ---
    const crtGeo = new RoundedBoxGeometry(1.02, 0.82, 0.06, 4, 0.12);
    this.disposables.push(crtGeo);
    const crtMesh = new THREE.Mesh(crtGeo, crtScreenMat);
    crtMesh.position.set(0, 0.01, 0.47);
    this.headGroup.add(crtMesh);

    // Dynamic screen soft glow light
    this.screenLight = new THREE.PointLight(0x00f0ff, 0.9, 1.2);
    this.screenLight.position.set(0, 0.05, 0.65);
    this.headGroup.add(this.screenLight);

    // Specular Glass Reflection (Cute pill flare on top-left of screen)
    const flareGeo = new THREE.CapsuleGeometry(0.024, 0.08, 8, 12);
    this.disposables.push(flareGeo);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
    });
    this.disposables.push(flareMat);
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    flareMesh.rotation.z = -Math.PI / 4;
    flareMesh.position.set(-0.33, 0.26, 0.51);
    this.headGroup.add(flareMesh);

    // --- 4. FACIAL EXPRESSIONS (CYAN NEON FROM IMAGE 2) ---
    // Left Eye: Upright glowing pill capsule
    const eyeGeo = new THREE.CapsuleGeometry(0.052, 0.10, 12, 16);
    this.disposables.push(eyeGeo);
    this.leftEyeMesh = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.leftEyeMesh.position.set(-0.21, 0.05, 0.51);
    this.headGroup.add(this.leftEyeMesh);

    // Tiny white sparkle pupil in Left Eye
    const pupilGeo = new THREE.SphereGeometry(0.018, 10, 10);
    this.disposables.push(pupilGeo);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.disposables.push(pupilMat);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.19, 0.08, 0.54);
    this.headGroup.add(pupilL);

    // Right Eye: Signature Winking Arc (Image 2)
    const winkGeo = new THREE.TorusGeometry(0.076, 0.022, 8, 18, Math.PI * 0.84);
    this.disposables.push(winkGeo);
    this.rightWinkMesh = new THREE.Mesh(winkGeo, cyanGlowMat);
    this.rightWinkMesh.rotation.z = Math.PI * 1.08;
    this.rightWinkMesh.position.set(0.21, 0.04, 0.51);
    this.headGroup.add(this.rightWinkMesh);

    // Alternative Open Right Eye (for blinking cycles)
    this.rightOpenEyeMesh = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.rightOpenEyeMesh.position.set(0.21, 0.05, 0.51);
    this.rightOpenEyeMesh.visible = false;
    this.headGroup.add(this.rightOpenEyeMesh);

    // Cute Curved Digital Smile
    const smileGeo = new THREE.TorusGeometry(0.052, 0.016, 8, 16, Math.PI * 0.82);
    this.disposables.push(smileGeo);
    this.mouthMesh = new THREE.Mesh(smileGeo, cyanGlowMat);
    this.mouthMesh.rotation.z = Math.PI * 1.09;
    this.mouthMesh.position.set(0, -0.09, 0.51);
    this.headGroup.add(this.mouthMesh);

    // Rosy Pink Blushing Cheeks
    const blushGeo = new THREE.CapsuleGeometry(0.038, 0.065, 10, 14);
    this.disposables.push(blushGeo);
    this.blushLeft = new THREE.Mesh(blushGeo, blushPinkMat);
    this.blushLeft.rotation.z = Math.PI / 2;
    this.blushLeft.position.set(-0.29, -0.08, 0.51);

    this.blushRight = new THREE.Mesh(blushGeo, blushPinkMat);
    this.blushRight.rotation.z = Math.PI / 2;
    this.blushRight.position.set(0.29, -0.08, 0.51);
    this.headGroup.add(this.blushLeft, this.blushRight);

    // --- 5. EAR PODS / ROBOT HEADPHONE DIALS (Image 2) ---
    const earBaseGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.10, 24);
    this.disposables.push(earBaseGeo);
    const earKnobGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.14, 24);
    this.disposables.push(earKnobGeo);
    const earLedGeo = new THREE.SphereGeometry(0.042, 12, 12);
    this.disposables.push(earLedGeo);

    // Left Ear Pod
    const earBaseL = new THREE.Mesh(earBaseGeo, whiteChassisMat);
    earBaseL.rotation.z = Math.PI / 2;
    earBaseL.position.set(-0.72, 0, 0);

    const earKnobL = new THREE.Mesh(earKnobGeo, darkTrimMat);
    earKnobL.rotation.z = Math.PI / 2;
    earKnobL.position.set(-0.76, 0, 0);

    const earLedL = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedL.position.set(-0.84, 0, 0);

    // Right Ear Pod
    const earBaseR = new THREE.Mesh(earBaseGeo, whiteChassisMat);
    earBaseR.rotation.z = Math.PI / 2;
    earBaseR.position.set(0.72, 0, 0);

    const earKnobR = new THREE.Mesh(earKnobGeo, darkTrimMat);
    earKnobR.rotation.z = Math.PI / 2;
    earKnobR.position.set(0.76, 0, 0);

    const earLedR = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedR.position.set(0.84, 0, 0);

    this.headGroup.add(earBaseL, earKnobL, earLedL, earBaseR, earKnobR, earLedR);

    // --- 6. MECHANICAL NECK JOINT ---
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.14, 20);
    this.disposables.push(neckGeo);
    const neckMesh = new THREE.Mesh(neckGeo, darkTrimMat);
    neckMesh.position.set(0, -0.63, 0);
    this.headGroup.add(neckMesh);
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.033);
    const time = this.clock.getElapsedTime();

    if (!this.headGroup) return;

    // 1. Organic Idle Floating Bob & Gentle Tilt
    const floatSpeed = this.uiState === 'asking' ? 3.2 : 2.2;
    const floatAmp = this.uiState === 'asking' ? 0.045 : 0.032;
    const floatY = Math.sin(time * floatSpeed) * floatAmp;
    const idleRoll = Math.sin(time * 1.4) * 0.02;

    // 2. Interactive Head Look Tracking (Smooth Damped)
    this.currentLook.lerp(this.targetLook, 0.08);

    const targetRotY = this.currentLook.x * 0.38;
    const targetRotX = -this.currentLook.y * 0.28;
    const targetRotZ = idleRoll - this.currentLook.x * 0.08;

    this.headGroup.rotation.y = targetRotY;
    this.headGroup.rotation.x = targetRotX;
    this.headGroup.rotation.z = targetRotZ;

    // 3. Tap Jump / Joyful Bounce Reaction
    let jumpOffset = 0;
    if (this.jumpProgress >= 0) {
      this.jumpProgress += delta * 3.2; // ~0.3s bounce
      if (this.jumpProgress >= 1) {
        this.jumpProgress = -1;
      } else {
        // Smooth sine bounce with slight overshoot
        jumpOffset = Math.sin(this.jumpProgress * Math.PI) * 0.18;
      }
    }

    // 4. Responding Joyful Nodding
    let nodOffset = 0;
    if (this.uiState === 'responding') {
      nodOffset = Math.sin(time * 6.0) * 0.04;
      this.headGroup.rotation.x += nodOffset;
    }

    this.headGroup.position.y = floatY + jumpOffset;

    // 5. Lifelike Eye Blinking & Winking Rhythm
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.8) {
      // Periodic blink event
      const blinkPhase = this.blinkTimer - 3.8;
      if (blinkPhase < 0.16) {
        // Close left eye
        if (this.leftEyeMesh) this.leftEyeMesh.scale.y = 0.1;
      } else if (blinkPhase < 0.32) {
        // Restore left eye
        if (this.leftEyeMesh) this.leftEyeMesh.scale.y = 1.0;
        // Briefly open right eye for a playful double-eyed smile!
        if (this.rightWinkMesh && this.rightOpenEyeMesh) {
          this.rightWinkMesh.visible = false;
          this.rightOpenEyeMesh.visible = true;
        }
      } else if (blinkPhase < 1.0) {
        // Return to signature wink
        if (this.rightWinkMesh && this.rightOpenEyeMesh) {
          this.rightWinkMesh.visible = true;
          this.rightOpenEyeMesh.visible = false;
        }
      } else {
        this.blinkTimer = 0;
      }
    }

    // 6. Blushing & Screen Light Breathing Glow
    const glowPulse = 0.85 + Math.sin(time * 3.0) * 0.25;
    if (this.screenLight) {
      this.screenLight.intensity = this.uiState === 'asking' ? 1.4 : glowPulse;
    }

    // 7. Ground Shadow Dynamics
    if (this.shadowMesh) {
      const shadowScale = 1.0 - (floatY + jumpOffset) * 0.8;
      this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    }

    // 8. Render Frame
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  private createShadowTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 58);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(0.3, 'rgba(14, 22, 44, 0.65)');
    grad.addColorStop(0.7, 'rgba(8, 12, 24, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  private disposeThree() {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
  }
}
