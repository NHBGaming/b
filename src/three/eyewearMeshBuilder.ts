import * as THREE from 'three';
import { EyewearProduct } from '../types/eyewear';

export type FrameSilhouette =
  | 'square'
  | 'round'
  | 'aviator'
  | 'cateye'
  | 'geometric'
  | 'panto';

export interface EyewearMeshRig {
  root: THREE.Group;
  leftLens: THREE.Mesh;
  rightLens: THREE.Mesh;
  leftRim: THREE.Mesh;
  rightRim: THREE.Mesh;
  bridgeGroup: THREE.Group;
  nosePadsGroup: THREE.Group;
  leftHinge: THREE.Mesh;
  rightHinge: THREE.Mesh;
  leftTemplePivot: THREE.Group;
  rightTemplePivot: THREE.Group;
  setVariantColors: (frameHex: string, lensTint: string, isSunglasses: boolean) => void;
  applyKinematics: (explodeAmount: number, foldAmount: number) => void;
  dispose: () => void;
}

export function getSilhouetteForProduct(productId: string): FrameSilhouette {
  if (productId.includes('moncada')) return 'square';
  if (productId.includes('sabae')) return 'round';
  if (productId.includes('aeron')) return 'aviator';
  if (productId.includes('celeste')) return 'cateye';
  if (productId.includes('koto')) return 'geometric';
  return 'panto';
}

function createTortoiseTexture(baseHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    const baseColor = new THREE.Color(baseHex);
    const hsl = { h: 0, s: 0, l: 0 };
    baseColor.getHSL(hsl);

    // Subtle organic acetate marbling for tortoiseshell / textured frames
    const isDark = hsl.l < 0.25;
    const fleckColor = isDark ? 'rgba(180, 120, 62, 0.28)' : 'rgba(42, 24, 12, 0.22)';
    const highlightColor = 'rgba(225, 185, 130, 0.16)';

    for (let i = 0; i < 42; i++) {
      const x = ((i * 73) % 256);
      const y = ((i * 137) % 256);
      const rx = 14 + (i % 5) * 7;
      const ry = 8 + (i % 4) * 5;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i * 0.45) % Math.PI);
      ctx.fillStyle = i % 3 === 0 ? highlightColor : fleckColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function buildLensShape(silhouette: FrameSilhouette, isLeft: boolean): THREE.Shape {
  const s = new THREE.Shape();
  const sign = isLeft ? -1 : 1;

  if (silhouette === 'round') {
    s.absarc(0, 0, 0.44, 0, Math.PI * 2, false);
    return s;
  }

  if (silhouette === 'aviator') {
    s.moveTo(-0.46 * sign, 0.32);
    s.quadraticCurveTo(0, 0.39, 0.44 * sign, 0.28);
    s.quadraticCurveTo(0.49 * sign, -0.05, 0.33 * sign, -0.34);
    s.quadraticCurveTo(0.05 * sign, -0.45, -0.28 * sign, -0.34);
    s.quadraticCurveTo(-0.48 * sign, -0.1, -0.46 * sign, 0.32);
    return s;
  }

  if (silhouette === 'cateye') {
    s.moveTo(-0.43 * sign, 0.2);
    s.quadraticCurveTo(0, 0.31, 0.5 * sign, 0.39);
    s.quadraticCurveTo(0.47 * sign, -0.08, 0.24 * sign, -0.33);
    s.quadraticCurveTo(-0.15 * sign, -0.36, -0.39 * sign, -0.18);
    s.quadraticCurveTo(-0.47 * sign, 0.02, -0.43 * sign, 0.2);
    return s;
  }

  if (silhouette === 'geometric') {
    s.moveTo(-0.42, 0.28);
    s.lineTo(0.4, 0.32);
    s.quadraticCurveTo(0.46, 0.28, 0.44, -0.18);
    s.lineTo(0.28, -0.34);
    s.lineTo(-0.28, -0.34);
    s.lineTo(-0.45, -0.16);
    s.closePath();
    return s;
  }

  if (silhouette === 'panto') {
    s.moveTo(-0.43, 0.24);
    s.lineTo(0.43, 0.24);
    s.quadraticCurveTo(0.47, -0.06, 0.3, -0.35);
    s.quadraticCurveTo(0, -0.44, -0.3, -0.35);
    s.quadraticCurveTo(-0.47, -0.06, -0.43, 0.24);
    return s;
  }

  // Default: square
  const w = 0.47;
  const h = 0.34;
  const r = 0.1;
  s.moveTo(-w + r, h);
  s.lineTo(w - r, h);
  s.quadraticCurveTo(w, h, w, h - r);
  s.lineTo(w, -h + r);
  s.quadraticCurveTo(w, -h, w - r, -h);
  s.lineTo(-w + r, -h);
  s.quadraticCurveTo(-w, -h, -w, -h + r);
  s.lineTo(-w, h - r);
  s.quadraticCurveTo(-w, h, -w + r, h);
  return s;
}

function buildRimShape(silhouette: FrameSilhouette, isLeft: boolean, thickness: number): THREE.Shape {
  const outer = new THREE.Shape();
  const hole = buildLensShape(silhouette, isLeft);
  const scale = 1 + thickness;

  const points = hole.getPoints(36);
  if (points.length > 0) {
    outer.moveTo(points[0].x * scale, points[0].y * scale);
    for (let i = 1; i < points.length; i++) {
      outer.lineTo(points[i].x * scale, points[i].y * scale);
    }
    outer.closePath();
  }
  outer.holes.push(hole);
  return outer;
}

function resolveLensColor(lensTint: string, isSunglasses: boolean): { hex: number; opacity: number } {
  const lower = lensTint.toLowerCase();
  if (!isSunglasses || lower.includes('trong')) {
    return { hex: 0xe6f0ee, opacity: 0.24 };
  }
  if (lower.includes('ô-liu') || lower.includes('g15')) {
    return { hex: 0x2c3b30, opacity: 0.78 };
  }
  if (lower.includes('hổ phách') || lower.includes('nâu') || lower.includes('trà')) {
    return { hex: 0x7a4821, opacity: 0.72 };
  }
  if (lower.includes('hồng')) {
    return { hex: 0x8d5e58, opacity: 0.68 };
  }
  return { hex: 0x1e2022, opacity: 0.8 };
}

export function buildEyewearMesh(
  product: EyewearProduct,
  initialFrameHex: string,
  initialLensTint: string,
  isSoftwareGl: boolean
): EyewearMeshRig {
  const silhouette = getSilhouetteForProduct(product.id);
  const isMetal = product.category === 'titanium' || silhouette === 'aviator';
  const isSunglasses = product.category === 'sunglasses';
  const rimThickness = isMetal ? 0.08 : 0.16;
  const extrudeDepth = isMetal ? 0.045 : 0.085;

  const root = new THREE.Group();
  const disposableGeos: THREE.BufferGeometry[] = [];
  const disposableMats: THREE.Material[] = [];
  let activeTexture: THREE.CanvasTexture | null = createTortoiseTexture(initialFrameHex);

  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialFrameHex),
    map: isMetal ? null : activeTexture,
    metalness: isMetal ? 0.92 : 0.05,
    roughness: isMetal ? 0.22 : 0.18,
    clearcoat: isMetal ? 0.2 : 0.9,
    clearcoatRoughness: 0.12,
    anisotropy: isMetal ? 0.8 : 0,
  });
  disposableMats.push(frameMaterial);

  const metalAccentMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd4c39a,
    metalness: 0.94,
    roughness: 0.2,
    anisotropy: 0.75,
  });
  disposableMats.push(metalAccentMaterial);

  const lensSpec = resolveLensColor(initialLensTint, isSunglasses);
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: lensSpec.hex,
    metalness: 0.05,
    roughness: 0.05,
    transparent: true,
    opacity: isSoftwareGl ? lensSpec.opacity : Math.max(0.32, lensSpec.opacity),
    transmission: isSoftwareGl ? 0 : isSunglasses ? 0.25 : 0.82,
    ior: 1.56,
    thickness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  disposableMats.push(lensMaterial);

  const nosePadMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6e4de,
    roughness: 0.35,
    metalness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  disposableMats.push(nosePadMaterial);

  const eyeOffsetX = 0.6;

  // 1 & 2. Left and Right Front Rims
  const leftRimGeo = new THREE.ExtrudeGeometry(buildRimShape(silhouette, true, rimThickness), {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 28,
  });
  leftRimGeo.center();
  disposableGeos.push(leftRimGeo);
  const leftRim = new THREE.Mesh(leftRimGeo, frameMaterial);
  leftRim.position.set(-eyeOffsetX, 0, 0);
  leftRim.castShadow = true;

  const rightRimGeo = new THREE.ExtrudeGeometry(buildRimShape(silhouette, false, rimThickness), {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 28,
  });
  rightRimGeo.center();
  disposableGeos.push(rightRimGeo);
  const rightRim = new THREE.Mesh(rightRimGeo, frameMaterial);
  rightRim.position.set(eyeOffsetX, 0, 0);
  rightRim.castShadow = true;

  // 3 & 4. Left and Right Lenses
  const leftLensGeo = new THREE.ExtrudeGeometry(buildLensShape(silhouette, true), {
    depth: 0.018,
    bevelEnabled: false,
    curveSegments: 28,
  });
  leftLensGeo.center();
  disposableGeos.push(leftLensGeo);
  const leftLens = new THREE.Mesh(leftLensGeo, lensMaterial);
  leftLens.position.set(-eyeOffsetX, 0, 0);
  leftLens.renderOrder = 2;

  const rightLensGeo = new THREE.ExtrudeGeometry(buildLensShape(silhouette, false), {
    depth: 0.018,
    bevelEnabled: false,
    curveSegments: 28,
  });
  rightLensGeo.center();
  disposableGeos.push(rightLensGeo);
  const rightLens = new THREE.Mesh(rightLensGeo, lensMaterial);
  rightLens.position.set(eyeOffsetX, 0, 0);
  rightLens.renderOrder = 2;

  // 5. Bridge (arch + optional double-bridge for aviator)
  const bridgeGroup = new THREE.Group();
  const bridgeCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-0.18, 0.08, 0),
    new THREE.Vector3(0, 0.16, 0.03),
    new THREE.Vector3(0.18, 0.08, 0)
  );
  const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 16, isMetal ? 0.022 : 0.038, 10, false);
  disposableGeos.push(bridgeGeo);
  const bridgeMesh = new THREE.Mesh(bridgeGeo, frameMaterial);
  bridgeMesh.castShadow = true;
  bridgeGroup.add(bridgeMesh);

  if (silhouette === 'aviator') {
    const topBarCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.34, 0.34, 0.01),
      new THREE.Vector3(0, 0.37, 0.025),
      new THREE.Vector3(0.34, 0.34, 0.01)
    );
    const topBarGeo = new THREE.TubeGeometry(topBarCurve, 18, 0.02, 10, false);
    disposableGeos.push(topBarGeo);
    const topBarMesh = new THREE.Mesh(topBarGeo, metalAccentMaterial);
    topBarMesh.castShadow = true;
    bridgeGroup.add(topBarMesh);
  }

  // 6 & 7. Nose Pads
  const nosePadsGroup = new THREE.Group();
  const padGeo = new THREE.CapsuleGeometry(0.028, 0.07, 6, 10);
  disposableGeos.push(padGeo);
  const leftPad = new THREE.Mesh(padGeo, nosePadMaterial);
  leftPad.position.set(-0.15, -0.05, -0.09);
  leftPad.rotation.set(0.25, 0, -0.25);

  const rightPad = new THREE.Mesh(padGeo, nosePadMaterial);
  rightPad.position.set(0.15, -0.05, -0.09);
  rightPad.rotation.set(0.25, 0, 0.25);

  nosePadsGroup.add(leftPad, rightPad);

  // 8 & 9. Metallic 5-barrel Hinges
  const hingeGeo = new THREE.BoxGeometry(0.08, 0.055, 0.09);
  disposableGeos.push(hingeGeo);
  const leftHinge = new THREE.Mesh(hingeGeo, metalAccentMaterial);
  leftHinge.position.set(-1.12, 0.09, -0.05);
  leftHinge.castShadow = true;

  const rightHinge = new THREE.Mesh(hingeGeo, metalAccentMaterial);
  rightHinge.position.set(1.12, 0.09, -0.05);
  rightHinge.castShadow = true;

  // 10 & 11. Sculpted Temples (Arm + Ear Tip) with Hinged Pivots
  const buildTemple = (side: -1 | 1): THREE.Group => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 1.12, 0.09, -0.06);

    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(side * 0.03, 0, -0.65),
      new THREE.Vector3(side * 0.02, -0.02, -1.25),
      new THREE.Vector3(side * 0.01, -0.24, -1.55),
    ]);
    const templeGeo = new THREE.TubeGeometry(
      templeCurve,
      24,
      isMetal ? 0.02 : 0.032,
      10,
      false
    );
    disposableGeos.push(templeGeo);
    const templeMesh = new THREE.Mesh(templeGeo, frameMaterial);
    templeMesh.castShadow = true;

    const tipGeo = new THREE.SphereGeometry(isMetal ? 0.026 : 0.036, 10, 10);
    disposableGeos.push(tipGeo);
    const tipMesh = new THREE.Mesh(tipGeo, frameMaterial);
    tipMesh.position.set(side * 0.01, -0.24, -1.55);

    // Decorative silver/gold temple rivet
    const rivetGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10);
    disposableGeos.push(rivetGeo);
    const rivetMesh = new THREE.Mesh(rivetGeo, metalAccentMaterial);
    rivetMesh.rotation.z = Math.PI / 2;
    rivetMesh.position.set(side * 0.028, 0, -0.14);

    pivot.add(templeMesh, tipMesh, rivetMesh);
    return pivot;
  };

  const leftTemplePivot = buildTemple(-1);
  const rightTemplePivot = buildTemple(1);

  root.add(
    leftRim,
    rightRim,
    leftLens,
    rightLens,
    bridgeGroup,
    nosePadsGroup,
    leftHinge,
    rightHinge,
    leftTemplePivot,
    rightTemplePivot
  );

  // Center the model on Z around origin for natural OrbitControls rotation
  root.position.set(0, 0, 0.45);

  const setVariantColors = (frameHex: string, lensTint: string, sunglassFlag: boolean) => {
    frameMaterial.color.set(frameHex);
    if (!isMetal) {
      if (activeTexture) activeTexture.dispose();
      activeTexture = createTortoiseTexture(frameHex);
      frameMaterial.map = activeTexture;
      frameMaterial.needsUpdate = true;
    }
    const nextLens = resolveLensColor(lensTint, sunglassFlag);
    lensMaterial.color.setHex(nextLens.hex);
    lensMaterial.opacity = isSoftwareGl ? nextLens.opacity : Math.max(0.32, nextLens.opacity);
    lensMaterial.needsUpdate = true;
  };

  const applyKinematics = (explodeAmount: number, foldAmount: number) => {
    const e = THREE.MathUtils.clamp(explodeAmount, 0, 1);
    const f = THREE.MathUtils.clamp(foldAmount, 0, 1);

    // Exploded view offsets along mechanical assembly axes
    leftLens.position.z = e * 0.48;
    rightLens.position.z = e * 0.48;
    leftRim.position.x = -eyeOffsetX - e * 0.16;
    rightRim.position.x = eyeOffsetX + e * 0.16;
    bridgeGroup.position.y = e * 0.28;
    nosePadsGroup.position.set(0, -e * 0.15, -e * 0.34);

    leftHinge.position.set(-1.12 - e * 0.25, 0.09, -0.05 - e * 0.08);
    rightHinge.position.set(1.12 + e * 0.25, 0.09, -0.05 - e * 0.08);

    leftTemplePivot.position.set(-1.12 - e * 0.42, 0.09, -0.06 - e * 0.32);
    rightTemplePivot.position.set(1.12 + e * 0.42, 0.09, -0.06 - e * 0.32);

    // Fold temples inward (about 84 degrees)
    leftTemplePivot.rotation.y = f * 1.46;
    rightTemplePivot.rotation.y = -f * 1.46;
  };

  const dispose = () => {
    disposableGeos.forEach((g) => g.dispose());
    disposableMats.forEach((m) => m.dispose());
    if (activeTexture) activeTexture.dispose();
  };

  return {
    root,
    leftLens,
    rightLens,
    leftRim,
    rightRim,
    bridgeGroup,
    nosePadsGroup,
    leftHinge,
    rightHinge,
    leftTemplePivot,
    rightTemplePivot,
    setVariantColors,
    applyKinematics,
    dispose,
  };
}
