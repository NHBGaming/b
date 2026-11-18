import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Eye,
  Maximize2,
  Minimize2,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { ColorVariant, EyewearProduct } from '../types/eyewear';
import { EYEWEAR_PRODUCTS, formatVND } from '../data/eyewearData';
import { buildEyewearMesh, EyewearMeshRig } from '../three/eyewearMeshBuilder';
import { RevealBlock } from './MotionPrimitives';

interface VrShowroomSectionProps {
  onOpenArTryOn: (product: EyewearProduct, variant: ColorVariant) => void;
  onQuickAdd: (product: EyewearProduct, variant: ColorVariant) => void;
}

type StudioMode = 'inspect' | 'vr-gallery';
type LightingMood = 'daylight' | 'golden' | 'gallery';
type CameraPreset = 'three-quarter' | 'front' | 'temple' | 'vr-wide';

const LIGHTING_CONFIGS: Record<
  LightingMood,
  {
    label: string;
    bg: number;
    fog: number;
    keyColor: number;
    keyIntensity: number;
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
  }
> = {
  daylight: {
    label: 'Ban ngày',
    bg: 0xefece6,
    fog: 0xefece6,
    keyColor: 0xfff8ee,
    keyIntensity: 2.3,
    hemiSky: 0xdbe6f0,
    hemiGround: 0xc9c2b5,
    hemiIntensity: 1.0,
  },
  golden: {
    label: 'Hoàng hôn',
    bg: 0xe6dfd3,
    fog: 0xe6dfd3,
    keyColor: 0xffd7a8,
    keyIntensity: 2.6,
    hemiSky: 0xf4dec4,
    hemiGround: 0x9c8b77,
    hemiIntensity: 0.9,
  },
  gallery: {
    label: 'Gallery tối',
    bg: 0x1c1d1c,
    fog: 0x1c1d1c,
    keyColor: 0xfff3e0,
    keyIntensity: 2.9,
    hemiSky: 0x8ea0b5,
    hemiGround: 0x262624,
    hemiIntensity: 0.65,
  },
};

function createTravertineTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#e5e0d5';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 6) {
      const alpha = 0.02 + ((y * 19) % 7) * 0.008;
      ctx.fillStyle = `rgba(110, 102, 88, ${alpha})`;
      ctx.fillRect(0, y, 512, 2);
    }
    ctx.strokeStyle = 'rgba(20, 20, 19, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 512; i += 128) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 120);
    grad.addColorStop(0, 'rgba(20, 20, 19, 0.42)');
    grad.addColorStop(0.55, 'rgba(20, 20, 19, 0.14)');
    grad.addColorStop(1, 'rgba(20, 20, 19, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const _camTargetPos = new THREE.Vector3();
const _camTargetLook = new THREE.Vector3();

export function VrShowroomSection({ onOpenArTryOn, onQuickAdd }: VrShowroomSectionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<EyewearProduct>(EYEWEAR_PRODUCTS[0]);
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant>(
    EYEWEAR_PRODUCTS[0].variants[0]
  );
  const [studioMode, setStudioMode] = useState<StudioMode>('vr-gallery');
  const [lightingMood, setLightingMood] = useState<LightingMood>('daylight');
  const [explodePercent, setExplodePercent] = useState(0);
  const [isFolded, setIsFolded] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mutable refs for WebGL scene lifecycle without React re-mount
  const sceneControlRef = useRef<{
    rebuildModel: (product: EyewearProduct, variant: ColorVariant) => void;
    updateColors: (variant: ColorVariant, isSunglasses: boolean) => void;
    setKinematicsTarget: (explode: number, fold: number) => void;
    setLighting: (mood: LightingMood) => void;
    setCameraPreset: (preset: CameraPreset) => void;
    setMode: (mode: StudioMode) => void;
  } | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = mount.clientWidth || 960;
    const height = mount.clientHeight || 560;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialMood = LIGHTING_CONFIGS.daylight;
    scene.background = new THREE.Color(initialMood.bg);
    scene.fog = new THREE.FogExp2(initialMood.fog, 0.045);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    camera.position.set(2.5, 1.35, 3.3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.6;
    controls.maxDistance = 8.5;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0.45, 0);

    // 3-point balanced studio lighting rig
    const hemiLight = new THREE.HemisphereLight(
      initialMood.hemiSky,
      initialMood.hemiGround,
      initialMood.hemiIntensity
    );
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(initialMood.keyColor, initialMood.keyIntensity);
    keyLight.position.set(3.8, 5.5, 3.6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -3.5;
    keyLight.shadow.camera.right = 3.5;
    keyLight.shadow.camera.top = 3.5;
    keyLight.shadow.camera.bottom = -3.5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xdce7f5, 0.85);
    rimLight.position.set(-4.2, 2.8, -3.5);
    scene.add(rimLight);

    // Architectural VR Gallery Environment
    const galleryGroup = new THREE.Group();
    const travertineTex = createTravertineTexture();
    travertineTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const floorGeo = new THREE.CircleGeometry(18, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: travertineTex,
      roughness: 0.72,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.75;
    floorMesh.receiveShadow = true;
    galleryGroup.add(floorMesh);

    // Central limestone plinth
    const plinthGeo = new THREE.CylinderGeometry(1.45, 1.55, 0.72, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0xe9e4da,
      roughness: 0.68,
      metalness: 0.04,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.set(0, -0.39, 0);
    plinthMesh.receiveShadow = true;
    plinthMesh.castShadow = true;
    galleryGroup.add(plinthMesh);

    // Subtle brass trim ring around plinth
    const ringGeo = new THREE.TorusGeometry(1.46, 0.012, 12, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xb9a273,
      metalness: 0.9,
      roughness: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -0.03, 0);
    galleryGroup.add(ringMesh);

    // Curved architectural gallery colonnade columns in background (VR 360 spatial cue)
    const columnGeo = new THREE.CylinderGeometry(0.24, 0.24, 5.2, 20);
    const columnMat = new THREE.MeshStandardMaterial({
      color: 0xded9ce,
      roughness: 0.8,
      metalness: 0.02,
    });
    const columnsInstanced = new THREE.InstancedMesh(columnGeo, columnMat, 12);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 6.8;
      dummy.position.set(Math.cos(angle) * radius, 1.85, Math.sin(angle) * radius);
      dummy.updateMatrix();
      columnsInstanced.setMatrixAt(i, dummy.matrix);
    }
    columnsInstanced.computeBoundingSphere();
    galleryGroup.add(columnsInstanced);

    // Contact shadow plane directly under glasses
    const shadowTex = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(2.8, 1.8);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -0.015, 0);
    galleryGroup.add(shadowPlane);

    scene.add(galleryGroup);

    // Active Eyewear Model Rig
    const modelContainer = new THREE.Group();
    modelContainer.position.set(0, 0.48, 0);
    scene.add(modelContainer);

    let currentRig: EyewearMeshRig = buildEyewearMesh(
      EYEWEAR_PRODUCTS[0],
      EYEWEAR_PRODUCTS[0].variants[0].hex,
      EYEWEAR_PRODUCTS[0].variants[0].lensTint,
      isSoftwareGl
    );
    modelContainer.add(currentRig.root);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Smooth kinematic & camera transition state
    let targetExplode = 0;
    let currentExplode = 0;
    let targetFold = 0;
    let currentFold = 0;
    let cameraTransitionActive = false;
    let currentMode: StudioMode = 'vr-gallery';

    _camTargetPos.copy(camera.position);
    _camTargetLook.copy(controls.target);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        const explodeDiff = Math.abs(currentExplode - targetExplode);
        const foldDiff = Math.abs(currentFold - targetFold);
        const needsKinematicStep = explodeDiff > 0.002 || foldDiff > 0.002;

        if (needsKinematicStep) {
          currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 7, dt);
          currentFold = THREE.MathUtils.damp(currentFold, targetFold, 7, dt);
          currentRig.applyKinematics(currentExplode, currentFold);
        }

        if (cameraTransitionActive) {
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _camTargetPos.x, 6, dt);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _camTargetPos.y, 6, dt);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _camTargetPos.z, 6, dt);
          controls.target.x = THREE.MathUtils.damp(controls.target.x, _camTargetLook.x, 6, dt);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, _camTargetLook.y, 6, dt);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, _camTargetLook.z, 6, dt);

          if (camera.position.distanceTo(_camTargetPos) < 0.015) {
            cameraTransitionActive = false;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const settled = !needsKinematicStep && !cameraTransitionActive;
        const done = () => {
          renderBusy = false;
          if (renderDirty || !settled) {
            requestRender();
          }
        };

        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    const onControlStart = () => {
      cameraTransitionActive = false;
    };
    const onControlChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('change', onControlChange);

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 960;
      const h = mount.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    sceneControlRef.current = {
      rebuildModel: (product, variant) => {
        modelContainer.remove(currentRig.root);
        currentRig.dispose();
        currentRig = buildEyewearMesh(product, variant.hex, variant.lensTint, isSoftwareGl);
        currentRig.applyKinematics(currentExplode, currentFold);
        modelContainer.add(currentRig.root);
        requestRender();
      },
      updateColors: (variant, isSunglasses) => {
        currentRig.setVariantColors(variant.hex, variant.lensTint, isSunglasses);
        requestRender();
      },
      setKinematicsTarget: (explode, fold) => {
        targetExplode = explode;
        targetFold = fold;
        requestRender();
      },
      setLighting: (mood) => {
        const cfg = LIGHTING_CONFIGS[mood];
        scene.background = new THREE.Color(cfg.bg);
        scene.fog = new THREE.FogExp2(cfg.fog, currentMode === 'vr-gallery' ? 0.045 : 0.025);
        keyLight.color.setHex(cfg.keyColor);
        keyLight.intensity = cfg.keyIntensity;
        hemiLight.color.setHex(cfg.hemiSky);
        hemiLight.groundColor.setHex(cfg.hemiGround);
        hemiLight.intensity = cfg.hemiIntensity;
        requestRender();
      },
      setCameraPreset: (preset) => {
        cameraTransitionActive = true;
        if (preset === 'front') {
          _camTargetPos.set(0, 0.55, 2.85);
          _camTargetLook.set(0, 0.46, 0);
        } else if (preset === 'temple') {
          _camTargetPos.set(2.4, 0.65, 0.3);
          _camTargetLook.set(0, 0.46, -0.2);
        } else if (preset === 'vr-wide') {
          _camTargetPos.set(3.2, 1.55, 4.2);
          _camTargetLook.set(0, 0.35, 0);
        } else {
          _camTargetPos.set(2.1, 1.05, 2.55);
          _camTargetLook.set(0, 0.45, 0);
        }
        requestRender();
      },
      setMode: (mode) => {
        currentMode = mode;
        galleryGroup.visible = true;
        columnsInstanced.visible = mode === 'vr-gallery';
        cameraTransitionActive = true;
        if (mode === 'vr-gallery') {
          _camTargetPos.set(3.0, 1.45, 3.9);
          _camTargetLook.set(0, 0.35, 0);
        } else {
          _camTargetPos.set(1.9, 0.95, 2.35);
          _camTargetLook.set(0, 0.46, 0);
        }
        requestRender();
      },
    };

    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', onControlChange);
      controls.dispose();
      currentRig.dispose();
      floorGeo.dispose();
      floorMat.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      columnGeo.dispose();
      columnMat.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();
      travertineTex.dispose();
      shadowTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      sceneControlRef.current = null;
    };
  }, []);

  // Keyboard shortcut H to toggle dock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const handleSelectProduct = (product: EyewearProduct) => {
    const nextVariant = product.variants[0];
    setSelectedProduct(product);
    setSelectedVariant(nextVariant);
    sceneControlRef.current?.rebuildModel(product, nextVariant);
  };

  const handleSelectVariant = (variant: ColorVariant) => {
    setSelectedVariant(variant);
    sceneControlRef.current?.updateColors(
      variant,
      selectedProduct.category === 'sunglasses'
    );
  };

  const handleExplodeChange = (val: number) => {
    setExplodePercent(val);
    sceneControlRef.current?.setKinematicsTarget(val / 100, isFolded ? 1 : 0);
  };

  const handleToggleFold = () => {
    const nextFold = !isFolded;
    setIsFolded(nextFold);
    sceneControlRef.current?.setKinematicsTarget(explodePercent / 100, nextFold ? 1 : 0);
  };

  const handleModeSwitch = (mode: StudioMode) => {
    setStudioMode(mode);
    sceneControlRef.current?.setMode(mode);
  };

  const handleMoodChange = (mood: LightingMood) => {
    setLightingMood(mood);
    sceneControlRef.current?.setLighting(mood);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const isDarkBg = lightingMood === 'gallery';

  return (
    <section id="vr-ar-studio" className="py-16 lg:py-20 border-b border-[#141413]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <RevealBlock className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium text-[#5C5B57] mb-2">
              Phòng trưng bày ảo VR 360° &amp; Thử kính AR trực tiếp
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight text-balance">
              Trải nghiệm Không gian Showroom 3D &amp; AR
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenArTryOn(selectedProduct, selectedVariant)}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[42px] text-xs font-medium bg-[#2C3E35] text-[#F7F6F2] rounded-lg hover:bg-[#141413] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Thử kính AR trên khuôn mặt</span>
            </button>
          </div>
        </RevealBlock>

        {/* Dedicated 3D Viewport Container */}
        <div
          ref={containerRef}
          className={`relative w-full rounded-2xl overflow-hidden border border-[#141413]/15 ${
            isFullscreen ? 'h-screen rounded-none' : 'h-[540px] sm:h-[600px]'
          }`}
        >
          {/* Isolated WebGL Mount Ref (No sibling HUD inside) */}
          <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

          {/* Minimal Top-Left Title / Spec Info (Solid/translucent rgba without backdrop-blur over WebGL) */}
          <div
            className={`absolute top-4 left-4 right-4 flex items-start justify-between gap-4 pointer-events-none`}
          >
            <div
              className={`pointer-events-auto px-4 py-3 rounded-xl border ${
                isDarkBg
                  ? 'bg-[#141413]/88 text-[#F7F6F2] border-[#F7F6F2]/15'
                  : 'bg-[#FFFFFF]/92 text-[#141413] border-[#141413]/12'
              }`}
            >
              <div className="flex items-center gap-2 text-xs opacity-75">
                <span>{studioMode === 'vr-gallery' ? 'VR 360° Showroom' : 'Xem 3D Cận cảnh'}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {selectedProduct.dimensions.lensWidth} □ {selectedProduct.dimensions.bridge} —{' '}
                  {selectedProduct.dimensions.temple}
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-3">
                <h3 className="text-sm sm:text-base font-semibold">{selectedProduct.name}</h3>
                <span className="text-xs font-medium tabular-nums opacity-85">
                  {formatVND(selectedProduct.price)}
                </span>
              </div>
            </div>

            {/* Top-Right Compact Viewport Actions */}
            <div className="pointer-events-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => sceneControlRef.current?.setCameraPreset('three-quarter')}
                title="Đưa góc nhìn về mặc định"
                aria-label="Đặt lại góc nhìn 3D"
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkBg
                    ? 'bg-[#141413]/88 text-[#F7F6F2] border-[#F7F6F2]/15 hover:bg-[#2C3E35]'
                    : 'bg-[#FFFFFF]/92 text-[#141413] border-[#141413]/12 hover:bg-[#EFECE6]'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem VR toàn màn hình'}
                aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Xem VR toàn màn hình'}
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                  isDarkBg
                    ? 'bg-[#141413]/88 text-[#F7F6F2] border-[#F7F6F2]/15 hover:bg-[#2C3E35]'
                    : 'bg-[#FFFFFF]/92 text-[#141413] border-[#141413]/12 hover:bg-[#EFECE6]'
                }`}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Bottom Control Dock (Zero Viewport Center Occlusion) */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[min(940px,calc(100%-24px))] flex flex-col items-center pointer-events-none">
            <button
              type="button"
              onClick={() => setDockCollapsed((prev) => !prev)}
              className="pointer-events-auto mb-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#141413]/90 text-[#F7F6F2] border border-[#F7F6F2]/15 hover:bg-[#2C3E35] transition-colors cursor-pointer"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Mở bảng điều khiển</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Thu gọn (H)</span>
                </>
              )}
            </button>

            <div
              className={`pointer-events-auto w-full rounded-xl border transition-transform duration-200 ${
                dockCollapsed ? 'translate-y-[140%] opacity-0 pointer-events-none h-0 overflow-hidden' : 'translate-y-0 opacity-100'
              } ${
                isDarkBg
                  ? 'bg-[#141413]/92 text-[#F7F6F2] border-[#F7F6F2]/15'
                  : 'bg-[#FFFFFF]/94 text-[#141413] border-[#141413]/15'
              } p-3.5 shadow-lg space-y-3`}
            >
              {/* Row 1: Model selector + Color Swatches + Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Product Dropdown + Swatches */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    aria-label="Chọn mẫu kính 3D"
                    value={selectedProduct.id}
                    onChange={(e) => {
                      const found = EYEWEAR_PRODUCTS.find((p) => p.id === e.target.value);
                      if (found) handleSelectProduct(found);
                    }}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border cursor-pointer ${
                      isDarkBg
                        ? 'bg-[#1F1F1D] text-[#F7F6F2] border-[#F7F6F2]/20'
                        : 'bg-[#F7F6F2] text-[#141413] border-[#141413]/15'
                    }`}
                  >
                    {EYEWEAR_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5" role="group" aria-label="Chọn màu gọng 3D">
                    {selectedProduct.variants.map((variant) => {
                      const active = variant.id === selectedVariant.id;
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          title={variant.name}
                          aria-label={`Đổi màu ${variant.name}`}
                          onClick={() => handleSelectVariant(variant)}
                          className={`w-5 h-5 rounded-full cursor-pointer transition-transform ${
                            active
                              ? 'ring-2 ring-offset-2 ring-[#2C3E35] scale-105'
                              : 'ring-1 ring-[#141413]/25'
                          }`}
                          style={{ backgroundColor: variant.hex }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Mode Switch: VR 360 vs 3D Inspect */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#EFECE6] text-[#141413]">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('vr-gallery')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      studioMode === 'vr-gallery'
                        ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                        : 'text-[#5C5B57] hover:text-[#141413]'
                    }`}
                  >
                    VR 360° Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('inspect')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                      studioMode === 'inspect'
                        ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                        : 'text-[#5C5B57] hover:text-[#141413]'
                    }`}
                  >
                    Cận cảnh 3D
                  </button>
                </div>
              </div>

              {/* Row 2: Explode Slider, Fold Toggle, Camera Presets, Lighting, AR/Bag CTAs */}
              <div className="pt-2.5 border-t border-current/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <span className="whitespace-nowrap opacity-80">Tách lớp</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={explodePercent}
                      onChange={(e) => handleExplodeChange(Number(e.target.value))}
                      aria-label="Tách lớp linh kiện gọng kính"
                      className="w-24 accent-[#2C3E35] cursor-pointer"
                    />
                    <span className="w-8 font-mono tabular-nums text-[11px]">{explodePercent}%</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleToggleFold}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap ${
                      isFolded
                        ? 'bg-[#2C3E35] text-[#F7F6F2] border-[#2C3E35]'
                        : 'border-current/20 hover:bg-current/5'
                    }`}
                  >
                    {isFolded ? 'Mở càng' : 'Gập càng'}
                  </button>

                  <div className="hidden sm:flex items-center gap-1 text-xs">
                    {(['front', 'three-quarter', 'temple'] as CameraPreset[]).map((preset) => {
                      const label =
                        preset === 'front' ? 'Trước' : preset === 'temple' ? 'Càng' : '3/4';
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => sceneControlRef.current?.setCameraPreset(preset)}
                          className="px-2 py-1.5 rounded-md border border-current/15 hover:bg-current/5 cursor-pointer whitespace-nowrap"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <select
                    aria-label="Chọn ánh sáng Showroom"
                    value={lightingMood}
                    onChange={(e) => handleMoodChange(e.target.value as LightingMood)}
                    className={`px-2.5 py-1.5 text-xs rounded-md border cursor-pointer ${
                      isDarkBg
                        ? 'bg-[#1F1F1D] text-[#F7F6F2] border-[#F7F6F2]/20'
                        : 'bg-[#F7F6F2] text-[#141413] border-[#141413]/15'
                    }`}
                  >
                    {(Object.keys(LIGHTING_CONFIGS) as LightingMood[]).map((m) => (
                      <option key={m} value={m}>
                        Ánh sáng: {LIGHTING_CONFIGS[m].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenArTryOn(selectedProduct, selectedVariant)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#2C3E35] text-[#F7F6F2] hover:bg-[#1E2B24] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Thử AR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickAdd(selectedProduct, selectedVariant)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141413] text-[#F7F6F2] hover:bg-[#2C3E35] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Thêm vào túi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
