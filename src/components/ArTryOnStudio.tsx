import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Camera,
  Download,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  VideoOff,
  X,
} from 'lucide-react';
import { ColorVariant, EyewearProduct } from '../types/eyewear';
import { EYEWEAR_PRODUCTS, formatVND, HERO_CAMPAIGN_IMAGE } from '../data/eyewearData';
import { buildEyewearMesh, EyewearMeshRig } from '../three/eyewearMeshBuilder';

interface ArTryOnStudioProps {
  isOpen: boolean;
  initialProduct: EyewearProduct;
  initialVariant: ColorVariant;
  onClose: () => void;
  onQuickAdd: (product: EyewearProduct, variant: ColorVariant) => void;
}

type BackdropMode = 'camera' | 'sample' | 'upload';

interface FaceDetectorLike {
  detect: (
    image: HTMLVideoElement | HTMLImageElement
  ) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
}

export function ArTryOnStudio({
  isOpen,
  initialProduct,
  initialVariant,
  onClose,
  onQuickAdd,
}: ArTryOnStudioProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const sampleImgRef = useRef<HTMLImageElement | null>(null);
  const threeMountRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [product, setProduct] = useState<EyewearProduct>(initialProduct);
  const [variant, setVariant] = useState<ColorVariant>(initialVariant);
  const [backdropMode, setBackdropMode] = useState<BackdropMode>('camera');
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'active' | 'denied'>('idle');
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string>('');

  // AR alignment transforms
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0.08);
  const [scale, setScale] = useState(1.0);
  const [yawDeg, setYawDeg] = useState(0);
  const [pitchDeg, setPitchDeg] = useState(0);
  const [rollDeg, setRollDeg] = useState(0);

  const dragStateRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const threeApiRef = useRef<{
    rebuild: (p: EyewearProduct, v: ColorVariant) => void;
    updateColors: (v: ColorVariant, isSun: boolean) => void;
    updatePose: (
      x: number,
      y: number,
      s: number,
      yaw: number,
      pitch: number,
      roll: number
    ) => void;
    renderNow: () => HTMLCanvasElement | null;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setProduct(initialProduct);
    setVariant(initialVariant);
  }, [isOpen, initialProduct, initialVariant]);

  // Manage webcam lifecycle
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const stopStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    if (backdropMode !== 'camera') {
      stopStream();
      setCameraStatus('idle');
      return;
    }

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('denied');
        setBackdropMode('sample');
        setStatusNotice('Trình duyệt không hỗ trợ camera trực tiếp, đã chuyển sang ảnh mẫu.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraStatus('active');
        setStatusNotice('');
      } catch {
        if (!cancelled) {
          setCameraStatus('denied');
          setBackdropMode('sample');
          setStatusNotice(
            'Không truy cập được camera. Bạn có thể dùng ảnh mẫu hoặc tải ảnh chân dung lên.'
          );
        }
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isOpen, backdropMode]);

  // Mount transparent Three.js WebGL overlay for 3D glasses in AR
  useEffect(() => {
    if (!isOpen) return;
    const mount = threeMountRef.current;
    if (!mount) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const w = mount.clientWidth || 640;
    const h = mount.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 30);
    camera.position.set(0, 0, 5.2);

    const hemi = new THREE.HemisphereLight(0xffffff, 0xc8c0b4, 1.15);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff9f0, 2.2);
    key.position.set(2.5, 4, 4);
    scene.add(key);

    const holder = new THREE.Group();
    scene.add(holder);

    let rig: EyewearMeshRig = buildEyewearMesh(
      product,
      variant.hex,
      variant.lensTint,
      isSoftwareGl
    );
    holder.add(rig.root);

    let frameId = 0;
    const renderScene = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        renderer.render(scene, camera);
      });
    };

    const onResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth || 640;
      const nh = mount.clientHeight || 480;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
      renderScene();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    threeApiRef.current = {
      rebuild: (p, v) => {
        holder.remove(rig.root);
        rig.dispose();
        rig = buildEyewearMesh(p, v.hex, v.lensTint, isSoftwareGl);
        holder.add(rig.root);
        renderScene();
      },
      updateColors: (v, isSun) => {
        rig.setVariantColors(v.hex, v.lensTint, isSun);
        renderScene();
      },
      updatePose: (x, y, s, yaw, pitch, roll) => {
        holder.position.set(x * 1.8, y * 1.4, 0);
        holder.scale.setScalar(s * 0.86);
        holder.rotation.set(
          THREE.MathUtils.degToRad(pitch),
          THREE.MathUtils.degToRad(yaw),
          THREE.MathUtils.degToRad(roll)
        );
        renderScene();
      },
      renderNow: () => {
        renderer.render(scene, camera);
        return renderer.domElement;
      },
    };

    threeApiRef.current.updatePose(posX, posY, scale, yawDeg, pitchDeg, rollDeg);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      rig.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      threeApiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Sync AR pose transforms
  useEffect(() => {
    threeApiRef.current?.updatePose(posX, posY, scale, yawDeg, pitchDeg, rollDeg);
  }, [posX, posY, scale, yawDeg, pitchDeg, rollDeg]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectProduct = (next: EyewearProduct) => {
    const nextVar = next.variants[0];
    setProduct(next);
    setVariant(nextVar);
    threeApiRef.current?.rebuild(next, nextVar);
  };

  const handleSelectVariant = (nextVar: ColorVariant) => {
    setVariant(nextVar);
    threeApiRef.current?.updateColors(nextVar, product.category === 'sunglasses');
  };

  const handleAutoDetectFace = async () => {
    const detectorCtor = (
      window as unknown as { FaceDetector?: new (opts?: object) => FaceDetectorLike }
    ).FaceDetector;

    const source =
      backdropMode === 'camera' ? videoRef.current : sampleImgRef.current;

    if (detectorCtor && source) {
      try {
        const detector = new detectorCtor({ fastMode: true, maxDetectedFaces: 1 });
        const faces = await detector.detect(source);
        if (faces.length > 0) {
          const box = faces[0].boundingBox;
          const elRect = source.getBoundingClientRect();
          const sourceW =
            source instanceof HTMLVideoElement ? source.videoWidth : source.naturalWidth;
          const sourceH =
            source instanceof HTMLVideoElement ? source.videoHeight : source.naturalHeight;
          if (sourceW > 0 && sourceH > 0 && elRect.width > 0) {
            const cx = (box.x + box.width / 2) / sourceW;
            const cy = (box.y + box.height * 0.36) / sourceH;
            const mirroredX = backdropMode === 'camera' ? 1 - cx : cx;
            setPosX(Number(((mirroredX - 0.5) * 2).toFixed(2)));
            setPosY(Number(((0.5 - cy) * 2).toFixed(2)));
            setScale(Number(Math.min(1.45, Math.max(0.65, (box.width / sourceW) * 2.15)).toFixed(2)));
            setStatusNotice('Đã tự động căn chỉnh gọng kính theo khuôn mặt.');
            return;
          }
        }
      } catch {
        // Fallback below
      }
    }

    // Clean calibration preset for sample portrait or center camera
    if (backdropMode === 'sample') {
      setPosX(0.02);
      setPosY(0.28);
      setScale(0.74);
      setYawDeg(-6);
      setPitchDeg(3);
      setRollDeg(0);
      setStatusNotice('Đã căn chỉnh kính vừa với ảnh mẫu.');
    } else {
      setPosX(0);
      setPosY(0.08);
      setScale(1.0);
      setYawDeg(0);
      setPitchDeg(0);
      setRollDeg(0);
      setStatusNotice('Đã đặt kính vào vị trí trung tâm. Kéo trực tiếp để tinh chỉnh.');
    }
  };

  const handleUploadPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedPhotoUrl(url);
    setBackdropMode('upload');
    setPosX(0);
    setPosY(0.1);
    setScale(0.95);
    setStatusNotice('Đã tải ảnh chân dung lên. Kéo kính vào đúng sống mũi của bạn.');
  };

  const handleCaptureSnapshot = () => {
    const threeCanvas = threeApiRef.current?.renderNow();
    if (!threeCanvas) return;

    const out = document.createElement('canvas');
    out.width = threeCanvas.width;
    out.height = threeCanvas.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;

    if (backdropMode === 'camera' && videoRef.current && videoRef.current.readyState >= 2) {
      ctx.save();
      ctx.translate(out.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, out.width, out.height);
      ctx.restore();
    } else if (sampleImgRef.current && sampleImgRef.current.complete) {
      ctx.drawImage(sampleImgRef.current, 0, 0, out.width, out.height);
    } else {
      ctx.fillStyle = '#EFECE6';
      ctx.fillRect(0, 0, out.width, out.height);
    }

    ctx.drawImage(threeCanvas, 0, 0, out.width, out.height);

    const link = document.createElement('a');
    link.download = `solis-ar-${product.sku.toLowerCase()}.png`;
    link.href = out.toDataURL('image/png');
    link.click();
    setStatusNotice('Đã lưu ảnh thử kính AR về thiết bị.');
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragStateRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.lastX;
    const dy = e.clientY - dragStateRef.current.lastY;
    dragStateRef.current.lastX = e.clientX;
    dragStateRef.current.lastY = e.clientY;
    setPosX((prev) => Number(Math.max(-0.85, Math.min(0.85, prev + dx * 0.003)).toFixed(3)));
    setPosY((prev) => Number(Math.max(-0.85, Math.min(0.85, prev - dy * 0.003)).toFixed(3)));
  };

  const handlePointerUp = () => {
    dragStateRef.current.active = false;
  };

  const activePhotoSrc =
    backdropMode === 'upload' && uploadedPhotoUrl ? uploadedPhotoUrl : HERO_CAMPAIGN_IMAGE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Phòng thử kính AR trực tuyến"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#141413]/70 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-[#F7F6F2] rounded-2xl border border-[#141413]/15 overflow-hidden shadow-2xl my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#141413]/10 flex items-center justify-between gap-4 bg-[#FFFFFF]">
          <div>
            <div className="text-xs font-medium text-[#2C3E35]">
              Công nghệ Thực tế Tăng cường (WebGL AR)
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#141413]">
              Thử kính AR trên khuôn mặt
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng phòng thử kính AR"
            className="w-10 h-10 rounded-full border border-[#141413]/15 flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: AR Live Stage */}
          <div className="lg:col-span-7 bg-[#141413] relative min-h-[380px] sm:min-h-[480px] flex items-center justify-center overflow-hidden">
            {backdropMode === 'camera' ? (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover -scale-x-100"
                />
                {cameraStatus !== 'active' && (
                  <div className="relative z-10 text-center text-[#F7F6F2] p-6 max-w-xs space-y-2">
                    <VideoOff className="w-8 h-8 mx-auto opacity-80" />
                    <p className="text-xs opacity-85">
                      Đang khởi tạo camera... Hoặc chuyển sang chế độ Ảnh mẫu để thử ngay.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <img
                ref={sampleImgRef}
                src={activePhotoSrc}
                alt="Chân dung thử kính AR"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            )}

            {/* Interactive 3D Eyewear Overlay Canvas */}
            <div
              ref={threeMountRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              title="Kéo để di chuyển vị trí kính"
              className="absolute inset-0 z-20 cursor-move touch-none"
            />

            {/* Top-left stage mode switcher */}
            <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setBackdropMode('camera')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  backdropMode === 'camera'
                    ? 'bg-[#2C3E35] text-[#F7F6F2]'
                    : 'bg-[#141413]/80 text-[#F7F6F2] hover:bg-[#141413]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Camera</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBackdropMode('sample');
                  setPosX(0.02);
                  setPosY(0.28);
                  setScale(0.74);
                  setYawDeg(-6);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer ${
                  backdropMode === 'sample'
                    ? 'bg-[#2C3E35] text-[#F7F6F2]'
                    : 'bg-[#141413]/80 text-[#F7F6F2] hover:bg-[#141413]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Ảnh mẫu</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#141413]/80 text-[#F7F6F2] hover:bg-[#141413] cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tải ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadPhoto}
                  className="sr-only"
                />
              </label>
            </div>

            {/* Bottom-center quick action bar */}
            <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleAutoDetectFace}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#141413]/85 text-[#F7F6F2] hover:bg-[#2C3E35] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Tự căn khuôn mặt</span>
              </button>

              <button
                type="button"
                onClick={handleCaptureSnapshot}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-[#FFFFFF] text-[#141413] hover:bg-[#EFECE6] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Chụp ảnh AR</span>
              </button>
            </div>
          </div>

          {/* Right: AR Model & Fit Controls */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              {statusNotice && (
                <div className="p-3 rounded-lg bg-[#EFECE6] text-xs text-[#141413]">
                  {statusNotice}
                </div>
              )}

              {/* Choose Model */}
              <div className="space-y-2">
                <label htmlFor="ar-model-select" className="block text-xs font-medium text-[#141413]">
                  Mẫu kính đang thử
                </label>
                <select
                  id="ar-model-select"
                  value={product.id}
                  onChange={(e) => {
                    const found = EYEWEAR_PRODUCTS.find((p) => p.id === e.target.value);
                    if (found) handleSelectProduct(found);
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413] cursor-pointer"
                >
                  {EYEWEAR_PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatVND(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#141413]">
                  Màu gọng: <span className="text-[#5C5B57] font-normal">{variant.name}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.variants.map((v) => {
                    const active = v.id === variant.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border cursor-pointer ${
                          active
                            ? 'border-[#141413] bg-[#FFFFFF] font-medium text-[#141413]'
                            : 'border-[#141413]/15 text-[#5C5B57]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-[#141413]/20"
                          style={{ backgroundColor: v.hex }}
                        />
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Precision 3D Fit Sliders */}
              <div className="pt-4 border-t border-[#141413]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#141413]">
                    Tinh chỉnh góc độ 3D (hoặc kéo trên ảnh)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPosX(0);
                      setPosY(0.08);
                      setScale(1.0);
                      setYawDeg(0);
                      setPitchDeg(0);
                      setRollDeg(0);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#5C5B57] hover:text-[#141413] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Đặt lại</span>
                  </button>
                </div>

                <label className="block text-xs space-y-1">
                  <div className="flex justify-between text-[#5C5B57]">
                    <span>Kích thước gọng</span>
                    <span className="font-mono tabular-nums">{scale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min={0.55}
                    max={1.55}
                    step={0.02}
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full accent-[#2C3E35] cursor-pointer"
                  />
                </label>

                <label className="block text-xs space-y-1">
                  <div className="flex justify-between text-[#5C5B57]">
                    <span>Xoay trái / phải (Yaw)</span>
                    <span className="font-mono tabular-nums">{yawDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min={-35}
                    max={35}
                    step={1}
                    value={yawDeg}
                    onChange={(e) => setYawDeg(Number(e.target.value))}
                    className="w-full accent-[#2C3E35] cursor-pointer"
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs space-y-1">
                    <div className="flex justify-between text-[#5C5B57]">
                      <span>Ngẩng / Cúi</span>
                      <span className="font-mono tabular-nums">{pitchDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={-20}
                      max={20}
                      step={1}
                      value={pitchDeg}
                      onChange={(e) => setPitchDeg(Number(e.target.value))}
                      className="w-full accent-[#2C3E35] cursor-pointer"
                    />
                  </label>

                  <label className="block text-xs space-y-1">
                    <div className="flex justify-between text-[#5C5B57]">
                      <span>Độ nghiêng</span>
                      <span className="font-mono tabular-nums">{rollDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min={-15}
                      max={15}
                      step={1}
                      value={rollDeg}
                      onChange={(e) => setRollDeg(Number(e.target.value))}
                      className="w-full accent-[#2C3E35] cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Bottom Add to Bag */}
            <div className="pt-4 border-t border-[#141413]/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-[#5C5B57]">{product.categoryLabel}</div>
                <div className="text-base font-semibold text-[#141413] tabular-nums">
                  {formatVND(product.price)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onQuickAdd(product, variant);
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Thêm mẫu này vào túi</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
