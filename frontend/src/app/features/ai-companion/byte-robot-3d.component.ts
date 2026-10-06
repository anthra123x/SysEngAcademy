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
  selector: 'app-byte-robot-3d',
  standalone: true,
  template: `
    <div
      class="robot-canvas-container"
      [class.is-hovered]="isHovered"
      [class.is-observing]="isOpen"
      (click)="onClick()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      role="button"
      tabindex="0"
      aria-label="Byte - Asistente y compañero robot 3D"
      title="Haz clic para chatear con Byte"
    >
      <canvas #canvasRef class="robot-webgl-canvas"></canvas>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      user-select: none;
    }

    .robot-canvas-container {
      position: relative;
      width: 125px;
      height: 140px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;

      &:hover {
        transform: translateY(-2px) scale(1.03);
        filter: drop-shadow(0 10px 22px rgba(0, 217, 255, 0.5));
      }

      &:focus-visible {
        outline: 2px solid #00D9FF;
        outline-offset: 4px;
        border-radius: 16px;
      }
    }

    .robot-webgl-canvas {
      display: block;
      width: 100% !important;
      height: 100% !important;
      pointer-events: auto;
    }
  `],
})
export class ByteRobot3dComponent implements OnInit, OnDestroy {
  @ViewChild('canvasRef', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() isHovered = false;
  @Input() isOpen = false;
  @Input() isThinking = false;
  @Output() robotClick = new EventEmitter<void>();
  @Output() hoverChange = new EventEmitter<boolean>();

  private ngZone = inject(NgZone);

  // Three.js Core
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private animFrameId?: number;

  // Clock & Timing
  private clock = new THREE.Clock();
  private walkCycle = 0;
  private patrolPhase = 0;
  private blinkTimer = 0;
  private jumpProgress = -1; // -1 = idle, 0..1 = jumping

  // State Transition Blending (0 = Normal walking/idle, 1 = Observing chat panel)
  private observingBlend = 0;

  // Rig Hierarchical Groups
  private rootGroup?: THREE.Group;
  private bodyGroup?: THREE.Group;
  private torsoGroup?: THREE.Group;
  private headGroup?: THREE.Group;
  private leftHipGroup?: THREE.Group;
  private leftKneeGroup?: THREE.Group;
  private leftBootMesh?: THREE.Mesh;
  private rightHipGroup?: THREE.Group;
  private rightKneeGroup?: THREE.Group;
  private rightBootMesh?: THREE.Mesh;
  private leftArmGroup?: THREE.Group;
  private leftForearmGroup?: THREE.Group;
  private rightArmGroup?: THREE.Group;
  private rightForearmGroup?: THREE.Group;
  private rightWristGroup?: THREE.Group;
  private shadowMesh?: THREE.Mesh;

  // Facial Expressive Elements (Identical to reference mascot)
  private leftEyeMesh?: THREE.Mesh;
  private rightWinkMesh?: THREE.Mesh;
  private rightOpenEyeMesh?: THREE.Mesh;
  private blushLeft?: THREE.Mesh;
  private blushRight?: THREE.Mesh;
  private mouthMesh?: THREE.Mesh;
  private screenLight?: THREE.PointLight;
  private coreLight?: THREE.PointLight;

  // Disposables
  private disposables: Array<THREE.BufferGeometry | THREE.Material | THREE.Texture> = [];

  // Mouse Tracking (Smooth damped)
  private targetLook = new THREE.Vector2(0, 0);
  private currentLook = new THREE.Vector2(0, 0);

  // Smoothed Kinematics
  private currentFacingAngle = 0;
  private currentRootX = 0;

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
    this.robotClick.emit();
  }

  onMouseEnter() {
    this.isHovered = true;
    this.hoverChange.emit(true);
  }

  onMouseLeave() {
    this.isHovered = false;
    this.hoverChange.emit(false);
  }

  private initThree() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || 125;
    const height = canvas.clientHeight || 140;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera with framed perspective
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    this.camera.position.set(0, 0.06, 3.15);
    this.camera.lookAt(0, -0.05, 0);

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

    // 4. Studio Lighting for Retro Ceramic & High-Tech CPU Character
    const ambientLight = new THREE.AmbientLight(0xf2f8ff, 1.55);
    this.scene.add(ambientLight);

    // Key Light (warm daylight from top right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(2.4, 3.4, 2.8);
    this.scene.add(keyLight);

    // Cyber Rim Light (electric cyan edge rim light)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.7);
    rimLight.position.set(-2.8, 2.0, -1.8);
    this.scene.add(rimLight);

    // Soft Indigo / Purple Bounce Fill Light from bottom
    const fillLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    fillLight.position.set(1.2, -2.2, 1.8);
    this.scene.add(fillLight);

    // 5. Build Rig based on Mascot Reference (Image 2)
    this.buildByteFullBodyRig();
  }

  private buildByteFullBodyRig() {
    if (!this.scene) return;

    // Materials Palette (Matching Image 2 exactly)
    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.12,
      roughness: 0.22,
    });
    this.disposables.push(whiteChassisMat);

    const lightGreyBodyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.18,
      roughness: 0.28,
    });
    this.disposables.push(lightGreyBodyMat);

    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.32,
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

    const chipSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.82,
      roughness: 0.20,
    });
    this.disposables.push(chipSilverMat);

    const pinMetalMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.92,
      roughness: 0.15,
    });
    this.disposables.push(pinMetalMat);

    // Root Group
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Soft Floor Contact Shadow
    const shadowTex = this.createShadowTexture();
    this.disposables.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(1.1, 0.6);
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
    this.shadowMesh.position.y = -0.72;
    this.rootGroup.add(this.shadowMesh);

    // Main Floating/Walking Body Group
    this.bodyGroup = new THREE.Group();
    this.rootGroup.add(this.bodyGroup);

    // ==========================================
    // 1. TORSO / CPU CHOP (IMAGE 2 MICROPROCESSOR)
    // ==========================================
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = -0.08;
    this.bodyGroup.add(this.torsoGroup);

    // Torso outer casing (Microchip block)
    const torsoGeo = new RoundedBoxGeometry(0.52, 0.46, 0.28, 4, 0.08);
    this.disposables.push(torsoGeo);
    const torsoMesh = new THREE.Mesh(torsoGeo, lightGreyBodyMat);
    this.torsoGroup.add(torsoMesh);

    // 4 Corner Screw Rivets on Front Face
    const screwGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.01, 10);
    this.disposables.push(screwGeo);
    const screwPositions = [
      [-0.20,  0.17, 0.141],
      [ 0.20,  0.17, 0.141],
      [-0.20, -0.17, 0.141],
      [ 0.20, -0.17, 0.141],
    ];
    screwPositions.forEach(([x, y, z]) => {
      const screw = new THREE.Mesh(screwGeo, darkTrimMat);
      screw.rotation.x = Math.PI / 2;
      screw.position.set(x, y, z);
      this.torsoGroup!.add(screw);
    });

    // Central CPU Processor Die (Plate with rounded corners)
    const cpuDieGeo = new RoundedBoxGeometry(0.24, 0.24, 0.035, 3, 0.04);
    this.disposables.push(cpuDieGeo);
    const cpuDieMesh = new THREE.Mesh(cpuDieGeo, chipSilverMat);
    cpuDieMesh.position.set(0, 0, 0.145);
    this.torsoGroup.add(cpuDieMesh);

    // Specular Highlight on CPU Die
    const cpuFlareGeo = new THREE.CapsuleGeometry(0.012, 0.04, 6, 8);
    this.disposables.push(cpuFlareGeo);
    const cpuFlareMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
    });
    this.disposables.push(cpuFlareMat);
    const cpuFlare = new THREE.Mesh(cpuFlareGeo, cpuFlareMat);
    cpuFlare.rotation.z = -Math.PI / 4;
    cpuFlare.position.set(-0.065, 0.065, 0.165);
    this.torsoGroup.add(cpuFlare);

    // IC Pins (5 pins on left, 5 pins on right of CPU die)
    const pinGeo = new THREE.BoxGeometry(0.065, 0.014, 0.015);
    this.disposables.push(pinGeo);
    const pinYs = [0.08, 0.04, 0.0, -0.04, -0.08];

    pinYs.forEach(py => {
      // Left pin
      const pL = new THREE.Mesh(pinGeo, pinMetalMat);
      pL.position.set(-0.155, py, 0.145);
      this.torsoGroup!.add(pL);
      // Right pin
      const pR = new THREE.Mesh(pinGeo, pinMetalMat);
      pR.position.set(0.155, py, 0.145);
      this.torsoGroup!.add(pR);
    });

    // Subtle Cyan Light from Processor
    this.coreLight = new THREE.PointLight(0x00f0ff, 0.7, 1.0);
    this.coreLight.position.set(0, 0, 0.24);
    this.torsoGroup.add(this.coreLight);

    // ==========================================
    // 2. RETRO CRT MONITOR HEAD (IMAGE 2)
    // ==========================================
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.28, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck joint (Titanium pivot)
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.10, 0.09, 16);
    this.disposables.push(neckGeo);
    const neckMesh = new THREE.Mesh(neckGeo, darkTrimMat);
    neckMesh.position.y = -0.16;
    this.headGroup.add(neckMesh);

    // Monitor chassis
    const chassisGeo = new RoundedBoxGeometry(0.70, 0.60, 0.46, 5, 0.11);
    this.disposables.push(chassisGeo);
    const chassisMesh = new THREE.Mesh(chassisGeo, whiteChassisMat);
    this.headGroup.add(chassisMesh);

    // Sunken Bezel Frame
    const bezelGeo = new RoundedBoxGeometry(0.58, 0.48, 0.05, 4, 0.08);
    this.disposables.push(bezelGeo);
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
    bezelMesh.position.set(0, 0.005, 0.215);
    this.headGroup.add(bezelMesh);

    // CRT Screen Glass
    const crtGeo = new RoundedBoxGeometry(0.52, 0.42, 0.03, 4, 0.06);
    this.disposables.push(crtGeo);
    const crtMesh = new THREE.Mesh(crtGeo, crtScreenMat);
    crtMesh.position.set(0, 0.005, 0.235);
    this.headGroup.add(crtMesh);

    // Specular Glass Reflection (upper-left screen)
    const flareGeo = new THREE.CapsuleGeometry(0.012, 0.04, 6, 8);
    this.disposables.push(flareGeo);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
    });
    this.disposables.push(flareMat);
    const flareMesh = new THREE.Mesh(flareGeo, flareMat);
    flareMesh.rotation.z = -Math.PI / 4;
    flareMesh.position.set(-0.16, 0.13, 0.252);
    this.headGroup.add(flareMesh);

    // Dynamic Screen Glow
    this.screenLight = new THREE.PointLight(0x00f0ff, 0.8, 1.1);
    this.screenLight.position.set(0, 0.02, 0.32);
    this.headGroup.add(this.screenLight);

    // --- FACIAL EXPRESSION NEON ELEMENTS ---
    // Left Eye: Upright glowing pill capsule
    const eyeGeo = new THREE.CapsuleGeometry(0.026, 0.05, 10, 14);
    this.disposables.push(eyeGeo);
    this.leftEyeMesh = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.leftEyeMesh.position.set(-0.105, 0.025, 0.252);
    this.headGroup.add(this.leftEyeMesh);

    // Sparkle Pupil in Left Eye
    const pupilGeo = new THREE.SphereGeometry(0.009, 8, 8);
    this.disposables.push(pupilGeo);
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.disposables.push(pupilMat);
    const pupilL = new THREE.Mesh(pupilGeo, pupilMat);
    pupilL.position.set(-0.095, 0.04, 0.266);
    this.headGroup.add(pupilL);

    // Right Eye: Signature Winking Arc (Image 2)
    const winkGeo = new THREE.TorusGeometry(0.038, 0.011, 8, 16, Math.PI * 0.84);
    this.disposables.push(winkGeo);
    this.rightWinkMesh = new THREE.Mesh(winkGeo, cyanGlowMat);
    this.rightWinkMesh.rotation.z = Math.PI * 1.08;
    this.rightWinkMesh.position.set(0.105, 0.02, 0.252);
    this.headGroup.add(this.rightWinkMesh);

    // Alternate Open Right Eye (for blinking cycles)
    this.rightOpenEyeMesh = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.rightOpenEyeMesh.position.set(0.105, 0.025, 0.252);
    this.rightOpenEyeMesh.visible = false;
    this.headGroup.add(this.rightOpenEyeMesh);

    // Curved Smile
    const smileGeo = new THREE.TorusGeometry(0.026, 0.008, 8, 14, Math.PI * 0.82);
    this.disposables.push(smileGeo);
    this.mouthMesh = new THREE.Mesh(smileGeo, cyanGlowMat);
    this.mouthMesh.rotation.z = Math.PI * 1.09;
    this.mouthMesh.position.set(0, -0.045, 0.252);
    this.headGroup.add(this.mouthMesh);

    // Rosy Pink Blushing Cheeks
    const blushGeo = new THREE.CapsuleGeometry(0.019, 0.032, 8, 12);
    this.disposables.push(blushGeo);
    this.blushLeft = new THREE.Mesh(blushGeo, blushPinkMat);
    this.blushLeft.rotation.z = Math.PI / 2;
    this.blushLeft.position.set(-0.145, -0.04, 0.252);

    this.blushRight = new THREE.Mesh(blushGeo, blushPinkMat);
    this.blushRight.rotation.z = Math.PI / 2;
    this.blushRight.position.set(0.145, -0.04, 0.252);
    this.headGroup.add(this.blushLeft, this.blushRight);

    // Ear Pods / Robot Headphone Dials on Sides
    const earBaseGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 20);
    this.disposables.push(earBaseGeo);
    const earKnobGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.07, 20);
    this.disposables.push(earKnobGeo);
    const earLedGeo = new THREE.SphereGeometry(0.022, 10, 10);
    this.disposables.push(earLedGeo);

    // Left Ear
    const earBaseL = new THREE.Mesh(earBaseGeo, whiteChassisMat);
    earBaseL.rotation.z = Math.PI / 2;
    earBaseL.position.set(-0.36, 0, 0);

    const earKnobL = new THREE.Mesh(earKnobGeo, darkTrimMat);
    earKnobL.rotation.z = Math.PI / 2;
    earKnobL.position.set(-0.38, 0, 0);

    const earLedL = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedL.position.set(-0.42, 0, 0);

    // Right Ear
    const earBaseR = new THREE.Mesh(earBaseGeo, whiteChassisMat);
    earBaseR.rotation.z = Math.PI / 2;
    earBaseR.position.set(0.36, 0, 0);

    const earKnobR = new THREE.Mesh(earKnobGeo, darkTrimMat);
    earKnobR.rotation.z = Math.PI / 2;
    earKnobR.position.set(0.38, 0, 0);

    const earLedR = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedR.position.set(0.42, 0, 0);

    this.headGroup.add(earBaseL, earKnobL, earLedL, earBaseR, earKnobR, earLedR);

    // ==========================================
    // 3. ARMS WITH 2-FINGER CLAWS (IMAGE 2)
    // ==========================================
    const shoulderGeo = new THREE.SphereGeometry(0.048, 14, 14);
    this.disposables.push(shoulderGeo);
    const upperArmGeo = new THREE.CylinderGeometry(0.030, 0.028, 0.12, 12);
    this.disposables.push(upperArmGeo);
    const forearmGeo = new THREE.CylinderGeometry(0.028, 0.026, 0.11, 12);
    this.disposables.push(forearmGeo);
    const armIndicatorGeo = new THREE.BoxGeometry(0.015, 0.035, 0.01);
    this.disposables.push(armIndicatorGeo);

    // Claw geometry (2 fingers per hand)
    const clawFingerGeo = new RoundedBoxGeometry(0.018, 0.042, 0.016, 2, 0.005);
    this.disposables.push(clawFingerGeo);

    // --- LEFT ARM ---
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.30, 0.06, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const shoulderL = new THREE.Mesh(shoulderGeo, darkTrimMat);
    this.leftArmGroup.add(shoulderL);

    const upperArmL = new THREE.Mesh(upperArmGeo, lightGreyBodyMat);
    upperArmL.position.y = -0.06;
    this.leftArmGroup.add(upperArmL);

    this.leftForearmGroup = new THREE.Group();
    this.leftForearmGroup.position.y = -0.12;
    this.leftArmGroup.add(this.leftForearmGroup);

    const elbowL = new THREE.Mesh(shoulderGeo, darkTrimMat);
    elbowL.scale.set(0.8, 0.8, 0.8);
    this.leftForearmGroup.add(elbowL);

    const forearmL = new THREE.Mesh(forearmGeo, lightGreyBodyMat);
    forearmL.position.y = -0.055;
    this.leftForearmGroup.add(forearmL);

    // Cyan indicator pill on forearm (Image 2)
    const armIndL = new THREE.Mesh(armIndicatorGeo, cyanGlowMat);
    armIndL.position.set(0, -0.055, 0.028);
    this.leftForearmGroup.add(armIndL);

    // Left Hand Claw (2 fingers)
    const clawL1 = new THREE.Mesh(clawFingerGeo, darkTrimMat);
    clawL1.position.set(-0.015, -0.13, 0);
    clawL1.rotation.z = -0.18;
    const clawL2 = new THREE.Mesh(clawFingerGeo, darkTrimMat);
    clawL2.position.set(0.015, -0.13, 0);
    clawL2.rotation.z = 0.18;
    this.leftForearmGroup.add(clawL1, clawL2);

    // --- RIGHT ARM (Waving greeting arm) ---
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.30, 0.06, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const shoulderR = new THREE.Mesh(shoulderGeo, darkTrimMat);
    this.rightArmGroup.add(shoulderR);

    const upperArmR = new THREE.Mesh(upperArmGeo, lightGreyBodyMat);
    upperArmR.position.set(0.04, 0.05, 0.01);
    upperArmR.rotation.z = -0.68;
    this.rightArmGroup.add(upperArmR);

    this.rightForearmGroup = new THREE.Group();
    this.rightForearmGroup.position.set(0.10, 0.11, 0.02);
    this.rightArmGroup.add(this.rightForearmGroup);

    const elbowR = new THREE.Mesh(shoulderGeo, darkTrimMat);
    elbowR.scale.set(0.8, 0.8, 0.8);
    this.rightForearmGroup.add(elbowR);

    const forearmR = new THREE.Mesh(forearmGeo, lightGreyBodyMat);
    forearmR.position.set(0.03, 0.07, 0.01);
    forearmR.rotation.z = -0.28;
    this.rightForearmGroup.add(forearmR);

    // Right Wrist Group for fluid waving
    this.rightWristGroup = new THREE.Group();
    this.rightWristGroup.position.set(0.06, 0.14, 0.02);
    this.rightForearmGroup.add(this.rightWristGroup);

    const clawR1 = new THREE.Mesh(clawFingerGeo, darkTrimMat);
    clawR1.position.set(-0.015, 0.02, 0);
    clawR1.rotation.z = 0.18;
    const clawR2 = new THREE.Mesh(clawFingerGeo, darkTrimMat);
    clawR2.position.set(0.015, 0.02, 0);
    clawR2.rotation.z = -0.18;
    this.rightWristGroup.add(clawR1, clawR2);

    // ==========================================
    // 4. PELVIS & LEGS (IMAGE 2)
    // ==========================================
    const pelvisGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.05, 16);
    this.disposables.push(pelvisGeo);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, darkTrimMat);
    pelvisMesh.position.y = -0.25;
    this.torsoGroup.add(pelvisMesh);

    const thighGeo = new THREE.CylinderGeometry(0.036, 0.032, 0.12, 12);
    this.disposables.push(thighGeo);
    const kneeJointGeo = new THREE.SphereGeometry(0.036, 12, 12);
    this.disposables.push(kneeJointGeo);
    const shinGeo = new THREE.CylinderGeometry(0.032, 0.030, 0.11, 12);
    this.disposables.push(shinGeo);

    const bootGeo = new RoundedBoxGeometry(0.10, 0.065, 0.16, 3, 0.02);
    this.disposables.push(bootGeo);
    const soleGeo = new RoundedBoxGeometry(0.105, 0.018, 0.165, 2, 0.005);
    this.disposables.push(soleGeo);

    // Left Leg
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(-0.10, -0.27, 0);
    this.torsoGroup.add(this.leftHipGroup);

    const thighL = new THREE.Mesh(thighGeo, darkTrimMat);
    thighL.position.y = -0.06;
    this.leftHipGroup.add(thighL);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.y = -0.12;
    this.leftHipGroup.add(this.leftKneeGroup);

    const kneeL = new THREE.Mesh(kneeJointGeo, darkTrimMat);
    this.leftKneeGroup.add(kneeL);

    const shinL = new THREE.Mesh(shinGeo, lightGreyBodyMat);
    shinL.position.y = -0.055;
    this.leftKneeGroup.add(shinL);

    this.leftBootMesh = new THREE.Mesh(bootGeo, darkTrimMat);
    this.leftBootMesh.position.set(0, -0.14, 0.025);
    this.leftKneeGroup.add(this.leftBootMesh);

    const soleL = new THREE.Mesh(soleGeo, cyanGlowMat);
    soleL.position.set(0, -0.175, 0.025);
    this.leftKneeGroup.add(soleL);

    // Right Leg
    this.rightHipGroup = new THREE.Group();
    this.rightHipGroup.position.set(0.10, -0.27, 0);
    this.torsoGroup.add(this.rightHipGroup);

    const thighR = new THREE.Mesh(thighGeo, darkTrimMat);
    thighR.position.y = -0.06;
    this.rightHipGroup.add(thighR);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.y = -0.12;
    this.rightHipGroup.add(this.rightKneeGroup);

    const kneeR = new THREE.Mesh(kneeJointGeo, darkTrimMat);
    this.rightKneeGroup.add(kneeR);

    const shinR = new THREE.Mesh(shinGeo, lightGreyBodyMat);
    shinR.position.y = -0.055;
    this.rightKneeGroup.add(shinR);

    this.rightBootMesh = new THREE.Mesh(bootGeo, darkTrimMat);
    this.rightBootMesh.position.set(0, -0.14, 0.025);
    this.rightKneeGroup.add(this.rightBootMesh);

    const soleR = new THREE.Mesh(soleGeo, cyanGlowMat);
    soleR.position.set(0, -0.175, 0.025);
    this.rightKneeGroup.add(soleR);
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.033);
    const time = this.clock.getElapsedTime();

    if (!this.rootGroup || !this.bodyGroup || !this.headGroup) return;

    // 1. Observing Chat Mode Transition (Smooth blend 0 -> 1)
    const targetObserving = this.isOpen ? 1.0 : 0.0;
    this.observingBlend = THREE.MathUtils.lerp(this.observingBlend, targetObserving, 0.08);

    // 2. Mouse Look Interpolation with gentle damping
    this.currentLook.x = THREE.MathUtils.lerp(this.currentLook.x, this.targetLook.x, 0.06);
    this.currentLook.y = THREE.MathUtils.lerp(this.currentLook.y, this.targetLook.y, 0.06);

    // 3. Lifelike Blinking & Winking Rhythm
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.8) {
      const phase = this.blinkTimer - 3.8;
      if (phase < 0.16) {
        if (this.leftEyeMesh) this.leftEyeMesh.scale.y = 0.1;
      } else if (phase < 0.32) {
        if (this.leftEyeMesh) this.leftEyeMesh.scale.y = 1.0;
        if (this.rightWinkMesh && this.rightOpenEyeMesh) {
          this.rightWinkMesh.visible = false;
          this.rightOpenEyeMesh.visible = true;
        }
      } else if (phase < 1.0) {
        if (this.rightWinkMesh && this.rightOpenEyeMesh) {
          this.rightWinkMesh.visible = true;
          this.rightOpenEyeMesh.visible = false;
        }
      } else {
        this.blinkTimer = 0;
      }
    }

    // 4. Subtle Cyber Pulses (Screen & Core processor)
    const pulseFreq = this.isThinking ? 7.2 : 3.0;
    const pulseIntensity = 0.9 + (this.isThinking ? 0.45 : 0.20) * Math.sin(time * pulseFreq);
    if (this.screenLight) this.screenLight.intensity = 0.8 * pulseIntensity;
    if (this.coreLight) this.coreLight.intensity = 0.7 * pulseIntensity;

    // 5. Celebration Jump Physics
    if (this.jumpProgress >= 0) {
      this.jumpProgress += delta * 2.6;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = -1;
      }
    }
    const jumpOffset = this.jumpProgress >= 0 ? Math.sin(this.jumpProgress * Math.PI) * 0.28 : 0;
    const jumpSpin = this.jumpProgress >= 0 ? Math.sin(this.jumpProgress * Math.PI * 2) * 0.32 : 0;

    // 6. Kinematics Modes:
    // A) WALKING / PATROL MODE (When chat is closed and not hovered)
    // B) OBSERVING CHAT MODE (When chat is open: parked, observing chat)
    // C) HOVERED IDLE MODE (User mouse is over Byte)
    const canWalk = this.observingBlend < 0.05 && !this.isHovered && this.jumpProgress < 0;

    if (canWalk) {
      // --- PATROL WALK ---
      this.patrolPhase += delta * 0.42;
      const targetPatrolX = Math.sin(this.patrolPhase) * 0.24;
      const targetVelX = Math.cos(this.patrolPhase);

      this.currentRootX = THREE.MathUtils.lerp(this.currentRootX, targetPatrolX, 0.08);
      this.rootGroup.position.x = this.currentRootX;

      const targetFacing = Math.sign(targetVelX) * 0.30;
      this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, targetFacing, 0.06);
      this.rootGroup.rotation.y = this.currentFacingAngle;

      const walkSpeed = Math.abs(targetVelX) * 4.4;
      this.walkCycle += delta * walkSpeed;

      const stride = Math.sin(this.walkCycle);
      const liftL = Math.max(0, -Math.sin(this.walkCycle));
      const liftR = Math.max(0, Math.sin(this.walkCycle));

      if (this.leftHipGroup) this.leftHipGroup.rotation.x = stride * 0.40;
      if (this.rightHipGroup) this.rightHipGroup.rotation.x = -stride * 0.40;

      if (this.leftKneeGroup) {
        this.leftKneeGroup.position.y = -0.12 + (liftL * liftL) * 0.035;
        this.leftKneeGroup.rotation.x = (liftL * liftL) * 0.55;
      }
      if (this.rightKneeGroup) {
        this.rightKneeGroup.position.y = -0.12 + (liftR * liftR) * 0.035;
        this.rightKneeGroup.rotation.x = (liftR * liftR) * 0.55;
      }

      if (this.leftBootMesh) this.leftBootMesh.rotation.x = -stride * 0.20;
      if (this.rightBootMesh) this.rightBootMesh.rotation.x = stride * 0.20;

      const hipSway = Math.sin(this.walkCycle) * 0.040;
      this.bodyGroup.rotation.z = hipSway;

      const stepBounce = Math.abs(Math.sin(this.walkCycle)) * 0.028;
      this.bodyGroup.position.y = stepBounce + jumpOffset;

      if (this.leftArmGroup) {
        this.leftArmGroup.rotation.x = -stride * 0.36;
        if (this.leftForearmGroup) this.leftForearmGroup.rotation.x = Math.max(0, -stride) * 0.20;
      }

      // Head tracks mouse forward
      this.headGroup.rotation.y = THREE.MathUtils.clamp(this.currentLook.x * 0.36 - this.currentFacingAngle * 0.36, -0.55, 0.55);
      this.headGroup.rotation.x = THREE.MathUtils.clamp(-this.currentLook.y * 0.20, -0.28, 0.28);
      this.headGroup.rotation.z = 0;
    } else {
      // --- STATIONARY MODES ---
      this.currentRootX = THREE.MathUtils.lerp(this.currentRootX, 0, 0.08);
      this.rootGroup.position.x = this.currentRootX;

      if (this.leftHipGroup) this.leftHipGroup.rotation.x = THREE.MathUtils.lerp(this.leftHipGroup.rotation.x, 0, 0.12);
      if (this.rightHipGroup) this.rightHipGroup.rotation.x = THREE.MathUtils.lerp(this.rightHipGroup.rotation.x, 0, 0.12);
      if (this.leftKneeGroup) {
        this.leftKneeGroup.position.y = THREE.MathUtils.lerp(this.leftKneeGroup.position.y, -0.12, 0.12);
        this.leftKneeGroup.rotation.x = THREE.MathUtils.lerp(this.leftKneeGroup.rotation.x, 0, 0.12);
      }
      if (this.rightKneeGroup) {
        this.rightKneeGroup.position.y = THREE.MathUtils.lerp(this.rightKneeGroup.position.y, -0.12, 0.12);
        this.rightKneeGroup.rotation.x = THREE.MathUtils.lerp(this.rightKneeGroup.rotation.x, 0, 0.12);
      }
      if (this.leftBootMesh) this.leftBootMesh.rotation.x = THREE.MathUtils.lerp(this.leftBootMesh.rotation.x, 0, 0.12);
      if (this.rightBootMesh) this.rightBootMesh.rotation.x = THREE.MathUtils.lerp(this.rightBootMesh.rotation.x, 0, 0.12);

      if (this.leftArmGroup) this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.1);
      if (this.leftForearmGroup) this.leftForearmGroup.rotation.x = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.x, 0, 0.1);

      // Gentle organic breathing bob
      const breathBob = Math.sin(time * 2.2) * 0.015;
      this.bodyGroup.position.y = breathBob + jumpOffset;
      this.bodyGroup.rotation.z = THREE.MathUtils.lerp(this.bodyGroup.rotation.z, 0, 0.08);

      if (this.observingBlend > 0.05) {
        // === OBSERVING CHAT MODE ===
        const obsTurnBody = -0.42 * this.observingBlend;
        this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, obsTurnBody, 0.08);
        this.rootGroup.rotation.y = this.currentFacingAngle + jumpSpin;

        const chatObserveNod = Math.sin(time * 1.6) * 0.022;
        const targetHeadPitch = -0.34 + chatObserveNod;
        const targetHeadYaw = -0.36 + Math.cos(time * 1.2) * 0.012;
        const targetHeadRoll = 0.08 + Math.sin(time * 2.0) * 0.008;

        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, targetHeadPitch, 0.08);
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, targetHeadYaw, 0.08);
        this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, targetHeadRoll, 0.08);
      } else {
        // === HOVERED / NORMAL IDLE MODE ===
        this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, 0, 0.1);
        this.rootGroup.rotation.y = this.currentFacingAngle + jumpSpin;

        const curiousTilt = this.isHovered ? 0.08 : 0;
        this.headGroup.rotation.y = THREE.MathUtils.clamp(this.currentLook.x * 0.62, -0.70, 0.70);
        this.headGroup.rotation.x = THREE.MathUtils.clamp(-this.currentLook.y * 0.36, -0.40, 0.40);
        this.headGroup.rotation.z = curiousTilt;
      }
    }

    // 7. Organic Multi-Joint Waving Hand
    if (this.rightArmGroup && this.rightForearmGroup && this.rightWristGroup) {
      if (this.observingBlend > 0.05) {
        // Attentive listening pose
        const thinkTap = Math.sin(time * 2.8) * 0.035;
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, -0.28, 0.08);
        this.rightArmGroup.rotation.y = THREE.MathUtils.lerp(this.rightArmGroup.rotation.y, 0.35, 0.08);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.z, 0.55 + thinkTap, 0.08);
        this.rightForearmGroup.rotation.y = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.y, 0.20, 0.08);
        this.rightWristGroup.rotation.z = THREE.MathUtils.lerp(this.rightWristGroup.rotation.z, -0.15 + thinkTap * 0.8, 0.08);
      } else {
        // Cheerful wave towards user
        const waveFreq = this.isHovered ? 7.0 : 4.2;
        const waveAmp = this.isHovered ? 0.30 : 0.20;

        const shoulderSway = Math.sin(time * (waveFreq * 0.5)) * 0.05;
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, shoulderSway, 0.08);
        this.rightArmGroup.rotation.y = THREE.MathUtils.lerp(this.rightArmGroup.rotation.y, 0, 0.08);

        const waveAngle = Math.sin(time * waveFreq);
        this.rightForearmGroup.rotation.z = waveAngle * waveAmp;
        this.rightForearmGroup.rotation.y = Math.cos(time * waveFreq) * (waveAmp * 0.40);

        const wristAngle = Math.sin(time * waveFreq - 0.42);
        this.rightWristGroup.rotation.z = wristAngle * (waveAmp * 0.72);
        this.rightWristGroup.rotation.y = Math.cos(time * waveFreq - 0.42) * (waveAmp * 0.32);
        this.rightWristGroup.rotation.x = Math.sin(time * waveFreq - 0.65) * 0.10;
      }
    }

    // 8. Ground Shadow Dynamics
    if (this.shadowMesh) {
      const shadowScale = THREE.MathUtils.lerp(1.0, 0.7, Math.min(1, jumpOffset * 3.0));
      this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    }

    // 9. Render Frame
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
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.38)');
    grad.addColorStop(0.35, 'rgba(14, 22, 44, 0.60)');
    grad.addColorStop(0.70, 'rgba(8, 12, 24, 0.20)');
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
