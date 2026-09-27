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
  private eyeBlinkProgress = 0; // 0 = open, 1 = closed
  private jumpProgress = -1;    // -1 = idle, 0..1 = jumping

  // State Transition Blending (0 = Normal walking/idle, 1 = Observing chat panel)
  private observingBlend = 0;

  // Rig Hierarchical Groups
  private rootGroup?: THREE.Group;
  private bodyGroup?: THREE.Group;
  private torsoMesh?: THREE.Mesh;
  private headGroup?: THREE.Group;
  private antennaTip?: THREE.Mesh;
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

  // Facial Expressive Elements
  private leftEyeGroup?: THREE.Group;
  private rightEyeGroup?: THREE.Group;
  private mouthMesh?: THREE.Mesh;
  private beaconLight?: THREE.PointLight;
  private coreLight?: THREE.PointLight;

  // Physical Antenna Inertia Lag
  private antennaInertia = new THREE.Vector2(0, 0);

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

    // 2. Camera with pleasant framing
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    this.camera.position.set(0, 0.10, 3.25);
    this.camera.lookAt(0, -0.04, 0);

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

    // 4. Studio Lighting for Friendly White Ceramic Character
    const ambientLight = new THREE.AmbientLight(0xf2f8ff, 1.45);
    this.scene.add(ambientLight);

    // Key Light (warm soft daylight from top right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(2.5, 3.5, 3.0);
    this.scene.add(keyLight);

    // Cyber Rim Light (electric cyan edge rim light)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 2.6);
    rimLight.position.set(-3.0, 2.2, -2.0);
    this.scene.add(rimLight);

    // Soft Violet/Indigo bounce fill from bottom
    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 1.1);
    fillLight.position.set(1.5, -2.0, 2.0);
    this.scene.add(fillLight);

    // 5. Build Rig
    this.buildFriendlyRobotRig();
  }

  private buildFriendlyRobotRig() {
    if (!this.scene) return;

    // Materials Palette
    const whiteBodyMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.08,
      roughness: 0.18,
    });
    this.disposables.push(whiteBodyMat);

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x070b18,
      metalness: 0.9,
      roughness: 0.06,
    });
    this.disposables.push(visorMat);

    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
    });
    this.disposables.push(cyanGlowMat);

    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xff4d88,
      transparent: true,
      opacity: 0.72,
    });
    this.disposables.push(blushMat);

    const smileMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
    });
    this.disposables.push(smileMat);

    const metalTrimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.28,
    });
    this.disposables.push(metalTrimMat);

    const purpleMat = new THREE.MeshStandardMaterial({
      color: 0x6c63ff,
      metalness: 0.35,
      roughness: 0.25,
    });
    this.disposables.push(purpleMat);

    // Root Group
    this.rootGroup = new THREE.Group();
    this.scene.add(this.rootGroup);

    // Soft Floor Contact Shadow
    const shadowTex = this.createShadowTexture();
    this.disposables.push(shadowTex);
    const shadowGeo = new THREE.PlaneGeometry(1.0, 0.55);
    this.disposables.push(shadowGeo);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    this.disposables.push(shadowMat);
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = -0.74;
    this.rootGroup.add(this.shadowMesh);

    // Main Floating/Walking Body Group
    this.bodyGroup = new THREE.Group();
    this.rootGroup.add(this.bodyGroup);

    // --- CUTE ROUNDED TORSO ---
    const torsoGeo = new THREE.CapsuleGeometry(0.2, 0.16, 16, 20);
    this.disposables.push(torsoGeo);
    this.torsoMesh = new THREE.Mesh(torsoGeo, whiteBodyMat);
    this.torsoMesh.position.y = -0.09;
    this.bodyGroup.add(this.torsoMesh);

    // Glowing Heart / Arc Reactor Core
    const coreGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 20);
    this.disposables.push(coreGeo);
    const coreMesh = new THREE.Mesh(coreGeo, cyanGlowMat);
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, -0.06, 0.19);
    this.bodyGroup.add(coreMesh);

    this.coreLight = new THREE.PointLight(0x00f5ff, 0.9, 1.2);
    this.coreLight.position.set(0, -0.06, 0.25);
    this.bodyGroup.add(this.coreLight);

    // Cute Compact Backpack / Power Pod
    const packGeo = new THREE.BoxGeometry(0.22, 0.24, 0.11);
    this.disposables.push(packGeo);
    const packMesh = new THREE.Mesh(packGeo, whiteBodyMat);
    packMesh.position.set(0, -0.07, -0.19);
    this.bodyGroup.add(packMesh);

    const packLedGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.18, 14);
    this.disposables.push(packLedGeo);
    const packLedL = new THREE.Mesh(packLedGeo, cyanGlowMat);
    packLedL.position.set(-0.06, -0.07, -0.25);
    const packLedR = new THREE.Mesh(packLedGeo, cyanGlowMat);
    packLedR.position.set(0.06, -0.07, -0.25);
    this.bodyGroup.add(packLedL, packLedR);

    // Pelvis ring
    const pelvisGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.06, 20);
    this.disposables.push(pelvisGeo);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, purpleMat);
    pelvisMesh.position.y = -0.27;
    this.bodyGroup.add(pelvisMesh);

    // --- LEGS & CUTE BOOTS WITH ANKLE FLEXION ---
    // Left Leg
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(-0.11, -0.29, 0);
    this.bodyGroup.add(this.leftHipGroup);

    const thighGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.14, 14);
    this.disposables.push(thighGeo);
    const thighL = new THREE.Mesh(thighGeo, metalTrimMat);
    thighL.position.y = -0.07;
    this.leftHipGroup.add(thighL);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.y = -0.14;
    this.leftHipGroup.add(this.leftKneeGroup);

    const shinGeo = new THREE.CylinderGeometry(0.04, 0.038, 0.12, 14);
    this.disposables.push(shinGeo);
    const shinL = new THREE.Mesh(shinGeo, metalTrimMat);
    shinL.position.y = -0.06;
    this.leftKneeGroup.add(shinL);

    const bootGeo = new THREE.BoxGeometry(0.11, 0.08, 0.18);
    this.disposables.push(bootGeo);
    this.leftBootMesh = new THREE.Mesh(bootGeo, whiteBodyMat);
    this.leftBootMesh.position.set(0, -0.16, 0.03);
    this.leftKneeGroup.add(this.leftBootMesh);

    const soleGeo = new THREE.BoxGeometry(0.12, 0.02, 0.19);
    this.disposables.push(soleGeo);
    const soleL = new THREE.Mesh(soleGeo, cyanGlowMat);
    soleL.position.set(0, -0.20, 0.03);
    this.leftKneeGroup.add(soleL);

    // Right Leg
    this.rightHipGroup = new THREE.Group();
    this.rightHipGroup.position.set(0.11, -0.29, 0);
    this.bodyGroup.add(this.rightHipGroup);

    const thighR = new THREE.Mesh(thighGeo, metalTrimMat);
    thighR.position.y = -0.07;
    this.rightHipGroup.add(thighR);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.y = -0.14;
    this.rightHipGroup.add(this.rightKneeGroup);

    const shinR = new THREE.Mesh(shinGeo, metalTrimMat);
    shinR.position.y = -0.06;
    this.rightKneeGroup.add(shinR);

    this.rightBootMesh = new THREE.Mesh(bootGeo, whiteBodyMat);
    this.rightBootMesh.position.set(0, -0.16, 0.03);
    this.rightKneeGroup.add(this.rightBootMesh);

    const soleR = new THREE.Mesh(soleGeo, cyanGlowMat);
    soleR.position.set(0, -0.20, 0.03);
    this.rightKneeGroup.add(soleR);

    // --- ARTICULATED ARMS (BOTH FULLY VISIBLE & FLUID!) ---
    // 1. LEFT ARM (Natural gentle swing and organic elbow flexion)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.25, 0.02, 0.02);
    this.bodyGroup.add(this.leftArmGroup);

    const shoulderGeo = new THREE.SphereGeometry(0.065, 16, 16);
    this.disposables.push(shoulderGeo);
    const shoulderL = new THREE.Mesh(shoulderGeo, purpleMat);
    this.leftArmGroup.add(shoulderL);

    const upperArmGeo = new THREE.CylinderGeometry(0.038, 0.034, 0.14, 14);
    this.disposables.push(upperArmGeo);
    const upperArmL = new THREE.Mesh(upperArmGeo, whiteBodyMat);
    upperArmL.position.y = -0.07;
    this.leftArmGroup.add(upperArmL);

    this.leftForearmGroup = new THREE.Group();
    this.leftForearmGroup.position.y = -0.14;
    this.leftArmGroup.add(this.leftForearmGroup);

    const forearmGeo = new THREE.CylinderGeometry(0.035, 0.032, 0.13, 14);
    this.disposables.push(forearmGeo);
    const forearmL = new THREE.Mesh(forearmGeo, whiteBodyMat);
    forearmL.position.y = -0.065;
    this.leftForearmGroup.add(forearmL);

    const handGeo = new THREE.SphereGeometry(0.048, 16, 16);
    this.disposables.push(handGeo);
    const handL = new THREE.Mesh(handGeo, whiteBodyMat);
    handL.position.y = -0.15;
    this.leftForearmGroup.add(handL);

    const palmLedGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12);
    this.disposables.push(palmLedGeo);
    const palmL = new THREE.Mesh(palmLedGeo, cyanGlowMat);
    palmL.rotation.x = Math.PI / 2;
    palmL.position.set(0, -0.15, 0.04);
    this.leftForearmGroup.add(palmL);

    // 2. RIGHT ARM (Waving greeting arm - 100% visible facing user)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.25, 0.02, 0.04);
    this.bodyGroup.add(this.rightArmGroup);

    const shoulderR = new THREE.Mesh(shoulderGeo, purpleMat);
    this.rightArmGroup.add(shoulderR);

    const upperArmR = new THREE.Mesh(upperArmGeo, whiteBodyMat);
    upperArmR.position.set(0.04, 0.06, 0.02);
    upperArmR.rotation.z = -0.72;
    this.rightArmGroup.add(upperArmR);

    // Forearm Group (rotates freely to wave)
    this.rightForearmGroup = new THREE.Group();
    this.rightForearmGroup.position.set(0.11, 0.13, 0.03);
    this.rightArmGroup.add(this.rightForearmGroup);

    const elbowR = new THREE.Mesh(shoulderGeo, purpleMat);
    elbowR.scale.set(0.85, 0.85, 0.85);
    this.rightForearmGroup.add(elbowR);

    const forearmR = new THREE.Mesh(forearmGeo, whiteBodyMat);
    forearmR.position.set(0.04, 0.08, 0.01);
    forearmR.rotation.z = -0.32;
    this.rightForearmGroup.add(forearmR);

    // Wrist joint for organic waving fluidity
    this.rightWristGroup = new THREE.Group();
    this.rightWristGroup.position.set(0.08, 0.16, 0.02);
    this.rightForearmGroup.add(this.rightWristGroup);

    const handR = new THREE.Mesh(handGeo, whiteBodyMat);
    this.rightWristGroup.add(handR);

    const palmR = new THREE.Mesh(palmLedGeo, cyanGlowMat);
    palmR.rotation.x = Math.PI / 2;
    palmR.position.set(0, 0, 0.045);
    this.rightWristGroup.add(palmR);

    // --- CUTE CHIBI HEAD & SENSORS RIG ---
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.22, 0);
    this.bodyGroup.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.09, 0.10, 0.07, 16);
    this.disposables.push(neckGeo);
    const neckMesh = new THREE.Mesh(neckGeo, metalTrimMat);
    neckMesh.position.y = -0.04;
    this.headGroup.add(neckMesh);

    // Helmet Shell (Pearly White)
    const helmetGeo = new THREE.SphereGeometry(0.30, 32, 24);
    this.disposables.push(helmetGeo);
    const helmetMesh = new THREE.Mesh(helmetGeo, whiteBodyMat);
    helmetMesh.position.y = 0.16;
    helmetMesh.scale.set(1.08, 0.96, 1.0);
    this.headGroup.add(helmetMesh);

    // Antenna with Inertial Physics
    const antRodGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.18, 12);
    this.disposables.push(antRodGeo);
    const antRod = new THREE.Mesh(antRodGeo, metalTrimMat);
    antRod.position.set(0, 0.49, 0);
    this.headGroup.add(antRod);

    const beaconGeo = new THREE.SphereGeometry(0.055, 18, 16);
    this.disposables.push(beaconGeo);
    this.antennaTip = new THREE.Mesh(beaconGeo, cyanGlowMat);
    this.antennaTip.position.set(0, 0.59, 0);
    this.headGroup.add(this.antennaTip);

    this.beaconLight = new THREE.PointLight(0x00f5ff, 1.0, 1.4);
    this.beaconLight.position.set(0, 0.60, 0);
    this.headGroup.add(this.beaconLight);

    // Ear Pods (Headphones style)
    const earGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.06, 18);
    this.disposables.push(earGeo);
    const earL = new THREE.Mesh(earGeo, purpleMat);
    earL.rotation.z = Math.PI / 2;
    earL.position.set(-0.33, 0.16, 0);
    const earR = new THREE.Mesh(earGeo, purpleMat);
    earR.rotation.z = Math.PI / 2;
    earR.position.set(0.33, 0.16, 0);
    this.headGroup.add(earL, earR);

    const earLedGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.07, 16);
    this.disposables.push(earLedGeo);
    const earLedL = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedL.rotation.z = Math.PI / 2;
    earLedL.position.set(-0.34, 0.16, 0);
    const earLedR = new THREE.Mesh(earLedGeo, cyanGlowMat);
    earLedR.rotation.z = Math.PI / 2;
    earLedR.position.set(0.34, 0.16, 0);
    this.headGroup.add(earLedL, earLedR);

    // Visor Glass Screen
    const visorGeo = new THREE.SphereGeometry(0.26, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.52);
    this.disposables.push(visorGeo);
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.x = Math.PI / 2;
    visorMesh.position.set(0, 0.16, 0.10);
    visorMesh.scale.set(0.96, 0.95, 0.72);
    this.headGroup.add(visorMesh);

    // Digital Eyes
    this.leftEyeGroup = new THREE.Group();
    this.leftEyeGroup.position.set(-0.095, 0.17, 0.29);
    this.headGroup.add(this.leftEyeGroup);

    const eyeGeo = new THREE.CapsuleGeometry(0.042, 0.035, 12, 16);
    this.disposables.push(eyeGeo);
    const eyeMeshL = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.leftEyeGroup.add(eyeMeshL);

    const sparkleGeo = new THREE.SphereGeometry(0.014, 10, 10);
    this.disposables.push(sparkleGeo);
    const sparkleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.disposables.push(sparkleMat);
    const sparkleL = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleL.position.set(0.015, 0.02, 0.04);
    this.leftEyeGroup.add(sparkleL);

    this.rightEyeGroup = new THREE.Group();
    this.rightEyeGroup.position.set(0.095, 0.17, 0.29);
    this.headGroup.add(this.rightEyeGroup);

    const eyeMeshR = new THREE.Mesh(eyeGeo, cyanGlowMat);
    this.rightEyeGroup.add(eyeMeshR);

    const sparkleR = new THREE.Mesh(sparkleGeo, sparkleMat);
    sparkleR.position.set(0.015, 0.02, 0.04);
    this.rightEyeGroup.add(sparkleR);

    // Rosy Blushing Cheeks
    const blushGeo = new THREE.CircleGeometry(0.032, 16);
    this.disposables.push(blushGeo);
    const blushL = new THREE.Mesh(blushGeo, blushMat);
    blushL.position.set(-0.15, 0.09, 0.28);
    const blushR = new THREE.Mesh(blushGeo, blushMat);
    blushR.position.set(0.15, 0.09, 0.28);
    this.headGroup.add(blushL, blushR);

    // Digital Smile
    const smileGeo = new THREE.TorusGeometry(0.042, 0.009, 8, 16, Math.PI * 0.85);
    this.disposables.push(smileGeo);
    this.mouthMesh = new THREE.Mesh(smileGeo, smileMat);
    this.mouthMesh.rotation.z = Math.PI * 1.08;
    this.mouthMesh.position.set(0, 0.08, 0.28);
    this.headGroup.add(this.mouthMesh);
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const rawDelta = this.clock.getDelta();
    // Clamping delta avoids frame-skip stutters and hitching on variable refresh rates
    const delta = Math.min(rawDelta, 0.033);
    const time = this.clock.getElapsedTime();

    if (!this.rootGroup || !this.bodyGroup || !this.headGroup) return;

    // 1. Observing Chat Mode Transition (Smooth blend 0 -> 1)
    const targetObserving = this.isOpen ? 1.0 : 0.0;
    this.observingBlend = THREE.MathUtils.lerp(this.observingBlend, targetObserving, 0.08);

    // 2. Mouse Look Interpolation with gentle organic damping
    this.currentLook.x = THREE.MathUtils.lerp(this.currentLook.x, this.targetLook.x, 0.06);
    this.currentLook.y = THREE.MathUtils.lerp(this.currentLook.y, this.targetLook.y, 0.06);

    // 3. Smooth Eye Blink with quadratic easing
    this.blinkTimer += delta;
    if (this.blinkTimer > 3.4) {
      this.eyeBlinkProgress += delta * 9.0;
      if (this.eyeBlinkProgress >= 2.0) {
        this.blinkTimer = 0;
        this.eyeBlinkProgress = 0;
      }
    }
    const blinkScaleY = this.eyeBlinkProgress > 0 ? Math.max(0.08, 1.0 - Math.sin(this.eyeBlinkProgress * Math.PI * 0.5)) : 1.0;

    if (this.leftEyeGroup && this.rightEyeGroup) {
      if (this.isHovered) {
        // Cheerful crescent smiling eyes
        this.leftEyeGroup.scale.set(1.18, 0.45, 1);
        this.rightEyeGroup.scale.set(1.18, 0.45, 1);
        this.leftEyeGroup.rotation.z = 0.2;
        this.rightEyeGroup.rotation.z = -0.2;
      } else {
        this.leftEyeGroup.scale.set(1, blinkScaleY, 1);
        this.rightEyeGroup.scale.set(1, blinkScaleY, 1);
        this.leftEyeGroup.rotation.z = 0;
        this.rightEyeGroup.rotation.z = 0;
      }

      // In observing mode: eyes glance up and left toward the chat content!
      const eyeLookX = THREE.MathUtils.lerp(0, -0.012, this.observingBlend);
      const eyeLookY = THREE.MathUtils.lerp(0, 0.010, this.observingBlend);
      this.leftEyeGroup.position.set(-0.095 + eyeLookX, 0.17 + eyeLookY, 0.29);
      this.rightEyeGroup.position.set(0.095 + eyeLookX, 0.17 + eyeLookY, 0.29);
    }

    // 4. Cyber Pulses (Antenna Beacon & Arc Reactor)
    // When the AI is actively thinking/streaming, pulse faster!
    const pulseFreq = this.isThinking ? 7.5 : 3.2;
    const pulseIntensity = 1.0 + (this.isThinking ? 0.45 : 0.25) * Math.sin(time * pulseFreq);
    if (this.beaconLight) this.beaconLight.intensity = 0.9 * pulseIntensity;
    if (this.coreLight) this.coreLight.intensity = 0.9 * pulseIntensity;
    if (this.antennaTip) {
      const s = 1.0 + (this.isThinking ? 0.14 : 0.07) * Math.sin(time * pulseFreq);
      this.antennaTip.scale.set(s, s, s);
    }

    // 5. Celebration Jump Physics
    if (this.jumpProgress >= 0) {
      this.jumpProgress += delta * 2.5;
      if (this.jumpProgress >= 1) {
        this.jumpProgress = -1;
      }
    }
    const jumpOffset = this.jumpProgress >= 0 ? Math.sin(this.jumpProgress * Math.PI) * 0.30 : 0;
    const jumpSpin = this.jumpProgress >= 0 ? Math.sin(this.jumpProgress * Math.PI * 2) * 0.35 : 0;

    // 6. Kinematics Modes:
    // A) WALKING / PATROL MODE (When chat is closed and not hovered)
    // B) OBSERVING CHAT MODE (When chat is open: robot stays parked, watching the chat attentively)
    // C) HOVERED IDLE MODE (User mouse is over Byte: stops, looks right at user)

    const canWalk = this.observingBlend < 0.05 && !this.isHovered && this.jumpProgress < 0;

    if (canWalk) {
      // --- ORGANIC SINUSOIDAL PATROL ---
      // Moves along smooth sine wave: naturally slows at turnarounds and accelerates through center
      this.patrolPhase += delta * 0.42;
      const targetPatrolX = Math.sin(this.patrolPhase) * 0.26;
      const targetVelX = Math.cos(this.patrolPhase);

      this.currentRootX = THREE.MathUtils.lerp(this.currentRootX, targetPatrolX, 0.08);
      this.rootGroup.position.x = this.currentRootX;

      // Smooth facing angle derived from velocity
      const targetFacing = Math.sign(targetVelX) * 0.32;
      this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, targetFacing, 0.06);
      this.rootGroup.rotation.y = this.currentFacingAngle;

      // Walk cycle speed is proportional to movement velocity (no foot sliding!)
      const walkSpeed = Math.abs(targetVelX) * 4.4;
      this.walkCycle += delta * walkSpeed;

      // Leg stride with natural inverse kinematics & parabolic step lift
      const stride = Math.sin(this.walkCycle);
      const liftL = Math.max(0, -Math.sin(this.walkCycle));
      const liftR = Math.max(0, Math.sin(this.walkCycle));

      if (this.leftHipGroup) this.leftHipGroup.rotation.x = stride * 0.42;
      if (this.rightHipGroup) this.rightHipGroup.rotation.x = -stride * 0.42;

      // Knee flex on backswing with realistic foot pickup
      if (this.leftKneeGroup) {
        this.leftKneeGroup.position.y = -0.14 + (liftL * liftL) * 0.035;
        this.leftKneeGroup.rotation.x = (liftL * liftL) * 0.58;
      }
      if (this.rightKneeGroup) {
        this.rightKneeGroup.position.y = -0.14 + (liftR * liftR) * 0.035;
        this.rightKneeGroup.rotation.x = (liftR * liftR) * 0.58;
      }

      // Foot ankle roll (heel-strike to toe-off)
      if (this.leftBootMesh) this.leftBootMesh.rotation.x = -stride * 0.22;
      if (this.rightBootMesh) this.rightBootMesh.rotation.x = stride * 0.22;

      // Hip sway and weight shifting (secondary motion)
      const hipSway = Math.sin(this.walkCycle) * 0.045;
      this.bodyGroup.rotation.z = hipSway;
      if (this.torsoMesh) {
        this.torsoMesh.rotation.z = -hipSway * 0.65;
        this.torsoMesh.rotation.y = -Math.sin(this.walkCycle) * 0.035;
        // Organic squash and stretch!
        const squash = Math.sin(this.walkCycle * 2) * 0.022;
        this.torsoMesh.scale.set(1.0 + squash, 1.0 - squash, 1.0 + squash);
      }

      // Bouncy footsteps squash/stretch
      const stepBounce = Math.abs(Math.sin(this.walkCycle)) * 0.032;
      this.bodyGroup.position.y = stepBounce + jumpOffset;

      // Left arm natural counter-swing with elbow follow-through
      if (this.leftArmGroup) {
        this.leftArmGroup.rotation.x = -stride * 0.38;
        if (this.leftForearmGroup) this.leftForearmGroup.rotation.x = Math.max(0, -stride) * 0.22;
      }

      // Antenna inertial lag (springs back against walking velocity)
      this.antennaInertia.x = THREE.MathUtils.lerp(this.antennaInertia.x, -targetVelX * 0.042 + Math.sin(time * 3.5) * 0.015, 0.1);
      this.antennaInertia.y = Math.cos(time * 2.8) * 0.012;
      if (this.antennaTip) this.antennaTip.position.set(this.antennaInertia.x, 0.59 + this.antennaInertia.y, 0);

      // Head tracks mouse forward
      this.headGroup.rotation.y = THREE.MathUtils.clamp(this.currentLook.x * 0.38 - this.currentFacingAngle * 0.38, -0.6, 0.6);
      this.headGroup.rotation.x = THREE.MathUtils.clamp(-this.currentLook.y * 0.22, -0.3, 0.3);
      this.headGroup.rotation.z = 0;
    } else {
      // --- STATIONARY MODES (OBSERVING CHAT OR HOVERED IDLE) ---
      // Smoothly return root position X toward center (no sliding!)
      this.currentRootX = THREE.MathUtils.lerp(this.currentRootX, 0, 0.08);
      this.rootGroup.position.x = this.currentRootX;

      // Reset legs smoothly to grounded stance
      if (this.leftHipGroup) this.leftHipGroup.rotation.x = THREE.MathUtils.lerp(this.leftHipGroup.rotation.x, 0, 0.12);
      if (this.rightHipGroup) this.rightHipGroup.rotation.x = THREE.MathUtils.lerp(this.rightHipGroup.rotation.x, 0, 0.12);
      if (this.leftKneeGroup) {
        this.leftKneeGroup.position.y = THREE.MathUtils.lerp(this.leftKneeGroup.position.y, -0.14, 0.12);
        this.leftKneeGroup.rotation.x = THREE.MathUtils.lerp(this.leftKneeGroup.rotation.x, 0, 0.12);
      }
      if (this.rightKneeGroup) {
        this.rightKneeGroup.position.y = THREE.MathUtils.lerp(this.rightKneeGroup.position.y, -0.14, 0.12);
        this.rightKneeGroup.rotation.x = THREE.MathUtils.lerp(this.rightKneeGroup.rotation.x, 0, 0.12);
      }
      if (this.leftBootMesh) this.leftBootMesh.rotation.x = THREE.MathUtils.lerp(this.leftBootMesh.rotation.x, 0, 0.12);
      if (this.rightBootMesh) this.rightBootMesh.rotation.x = THREE.MathUtils.lerp(this.rightBootMesh.rotation.x, 0, 0.12);

      if (this.leftArmGroup) this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(this.leftArmGroup.rotation.x, 0, 0.1);
      if (this.leftForearmGroup) this.leftForearmGroup.rotation.x = THREE.MathUtils.lerp(this.leftForearmGroup.rotation.x, 0, 0.1);

      // Gentle organic breathing bob
      const breathBob = Math.sin(time * 2.2) * 0.016;
      this.bodyGroup.position.y = breathBob + jumpOffset;
      this.bodyGroup.rotation.z = THREE.MathUtils.lerp(this.bodyGroup.rotation.z, 0, 0.08);

      if (this.torsoMesh) {
        this.torsoMesh.rotation.z = 0;
        this.torsoMesh.rotation.y = 0;
        const breathSquash = Math.sin(time * 2.2) * 0.012;
        this.torsoMesh.scale.set(1.0 + breathSquash, 1.0 - breathSquash * 0.5, 1.0 + breathSquash);
      }

      if (this.antennaTip) {
        this.antennaTip.position.x = THREE.MathUtils.lerp(this.antennaTip.position.x, Math.sin(time * 2.0) * 0.01, 0.08);
        this.antennaTip.position.y = 0.59 + Math.cos(time * 2.2) * 0.01;
      }

      // Calculate Target Pose Blended between Observing Chat vs Hovered/Idle
      if (this.observingBlend > 0.05) {
        // === OBSERVING CHAT MODE ===
        // Robot stays in place, turns slightly left and tilts head up toward the open chat panel!
        const obsTurnBody = -0.42 * this.observingBlend;
        this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, obsTurnBody, 0.08);
        this.rootGroup.rotation.y = this.currentFacingAngle + jumpSpin;

        // Head tilts upward and leftward (observing the chat messages with gentle attentive breathing nod)
        const chatObserveNod = Math.sin(time * 1.6) * 0.022;
        const targetHeadPitch = -0.36 + chatObserveNod; // looking up
        const targetHeadYaw = -0.38 + Math.cos(time * 1.2) * 0.012; // looking toward chat panel
        const targetHeadRoll = 0.09 + Math.sin(time * 2.0) * 0.008; // curious listening tilt

        this.headGroup.rotation.x = THREE.MathUtils.lerp(this.headGroup.rotation.x, targetHeadPitch, 0.08);
        this.headGroup.rotation.y = THREE.MathUtils.lerp(this.headGroup.rotation.y, targetHeadYaw, 0.08);
        this.headGroup.rotation.z = THREE.MathUtils.lerp(this.headGroup.rotation.z, targetHeadRoll, 0.08);
      } else {
        // === HOVERED / NORMAL IDLE MODE ===
        this.currentFacingAngle = THREE.MathUtils.lerp(this.currentFacingAngle, 0, 0.1);
        this.rootGroup.rotation.y = this.currentFacingAngle + jumpSpin;

        // Head tracks mouse cursor attentively
        const curiousTilt = this.isHovered ? 0.08 : 0;
        this.headGroup.rotation.y = THREE.MathUtils.clamp(this.currentLook.x * 0.65, -0.75, 0.75);
        this.headGroup.rotation.x = THREE.MathUtils.clamp(-this.currentLook.y * 0.38, -0.42, 0.42);
        this.headGroup.rotation.z = curiousTilt;
      }
    }

    // 7. Organic Multi-Joint Waving Hand (Triple-Joint Wave Chain)
    // In Observing Mode: Hand rests near chin/chest in an attentive "listening" pose with micro-taps.
    // In Walking/Idle: Waves fluidly towards user with multi-joint harmonic wave!
    if (this.rightArmGroup && this.rightForearmGroup && this.rightWristGroup) {
      if (this.observingBlend > 0.05) {
        // Listening / Thinking pose: Arm lowered to chest/chin level
        const thinkTap = Math.sin(time * 2.8) * 0.035;
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, -0.28, 0.08);
        this.rightArmGroup.rotation.y = THREE.MathUtils.lerp(this.rightArmGroup.rotation.y, 0.35, 0.08);
        this.rightForearmGroup.rotation.z = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.z, 0.55 + thinkTap, 0.08);
        this.rightForearmGroup.rotation.y = THREE.MathUtils.lerp(this.rightForearmGroup.rotation.y, 0.20, 0.08);
        this.rightWristGroup.rotation.z = THREE.MathUtils.lerp(this.rightWristGroup.rotation.z, -0.15 + thinkTap * 0.8, 0.08);
      } else {
        // Normal Cheerful Multi-Joint Wave (Whip-like organic harmonic delay)
        const waveFreq = this.isHovered ? 7.2 : 4.4;
        const waveAmp = this.isHovered ? 0.32 : 0.22;

        const shoulderSway = Math.sin(time * (waveFreq * 0.5)) * 0.05;
        this.rightArmGroup.rotation.z = THREE.MathUtils.lerp(this.rightArmGroup.rotation.z, shoulderSway, 0.08);
        this.rightArmGroup.rotation.y = THREE.MathUtils.lerp(this.rightArmGroup.rotation.y, 0, 0.08);

        // Forearm leads
        const waveAngle = Math.sin(time * waveFreq);
        this.rightForearmGroup.rotation.z = waveAngle * waveAmp;
        this.rightForearmGroup.rotation.y = Math.cos(time * waveFreq) * (waveAmp * 0.42);

        // Wrist articulates with phase delay (flowing whip wave)
        const wristAngle = Math.sin(time * waveFreq - 0.42);
        this.rightWristGroup.rotation.z = wristAngle * (waveAmp * 0.75);
        this.rightWristGroup.rotation.y = Math.cos(time * waveFreq - 0.42) * (waveAmp * 0.35);
        this.rightWristGroup.rotation.x = Math.sin(time * waveFreq - 0.65) * 0.12;
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
    grad.addColorStop(0, 'rgba(0, 217, 255, 0.35)');
    grad.addColorStop(0.3, 'rgba(12, 18, 34, 0.6)');
    grad.addColorStop(0.7, 'rgba(6, 10, 20, 0.2)');
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
