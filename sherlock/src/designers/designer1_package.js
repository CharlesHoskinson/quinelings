import * as THREE from 'three/webgpu';
import {
  PALETTE,
  createBrushedMetalTexture,
  tagInspectable,
} from './theme.js';

// Module-scope reusable scratch objects — zero allocations inside .update(stepState)
const _tmpColorA = new THREE.Color();
const _tmpColorB = new THREE.Color();
const _tmpMatrix = new THREE.Matrix4();
const _tmpPos = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _tmpScale = new THREE.Vector3(1, 1, 1);
const _upAxis = new THREE.Vector3(0, 1, 0);

const LEAD_COUNT = 24; // 6 precision gold leads on each of the 4 sides (matching clean reference)
const CERAMIC_HALF = 2.15;
const SILVER_STEP_HALF = 1.98;
const DARK_SHIELD_HALF = 1.82;
const WELL_RADIUS = 1.06;

// Clean Reference Material Palette (Warm Porcelain Ceramic + Machined Silver-Platinum + Obsidian-Sapphire Shield + Cryo-Gold)
const ALABASTER_CERAMIC_HEX = 0xe6e0d3;
const MACHINED_SILVER_HEX = 0xa7aaad;
const OBSIDIAN_SHIELD_HEX = 0x2c2b29;
const GROOVE_DARK_HEX = 0x151513;
const CRYO_GOLD_HEX = 0xc5a059;
const LUMINOUS_GOLD_HEX = 0xfbbf24;
const CYAN_TEAL_HEX = 0x2dd4bf;

let _cachedCeramicColorTex = null;
let _cachedCeramicBumpTex = null;
let _cachedSilverRoughnessTex = null;

function makeCanvas(width, height) {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

function makeFallbackTexture(r = 230, g = 224, b = 211, a = 255, isData = false) {
  const data = new Uint8Array([r, g, b, a]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.colorSpace = isData ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function getAlabasterCeramicTextures() {
  if (_cachedCeramicColorTex && _cachedCeramicBumpTex) {
    return { colorMap: _cachedCeramicColorTex, bumpMap: _cachedCeramicBumpTex };
  }

  const size = 512;
  const colorCanvas = makeCanvas(size, size);
  const bumpCanvas = makeCanvas(size, size);

  if (!colorCanvas || !bumpCanvas) {
    _cachedCeramicColorTex = makeFallbackTexture(252, 251, 249, 255, false);
    _cachedCeramicBumpTex = makeFallbackTexture(128, 128, 128, 255, true);
    return { colorMap: _cachedCeramicColorTex, bumpMap: _cachedCeramicBumpTex };
  }

  const cCtx = colorCanvas.getContext('2d');
  const bCtx = bumpCanvas.getContext('2d');

  cCtx.fillStyle = '#fcfbfa';
  cCtx.fillRect(0, 0, size, size);

  bCtx.fillStyle = 'rgb(128, 128, 128)';
  bCtx.fillRect(0, 0, size, size);

  let seed = 0x7f4a7c15;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < 14000; i++) {
    const x = Math.floor(nextRand() * size);
    const y = Math.floor(nextRand() * size);
    const r = 1 + Math.floor(nextRand() * 2.2);
    const delta = (nextRand() - 0.45) * 12;

    const cr = Math.max(245, Math.min(255, Math.round(252 + delta * 0.5)));
    const cg = Math.max(243, Math.min(255, Math.round(251 + delta * 0.5)));
    const cb = Math.max(240, Math.min(255, Math.round(249 + delta * 0.5)));
    cCtx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
    cCtx.fillRect(x, y, r, r);

    const bh = Math.max(0, Math.min(255, Math.round(128 + delta * 3.8)));
    bCtx.fillStyle = `rgb(${bh}, ${bh}, ${bh})`;
    bCtx.fillRect(x, y, r, r);
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(1.5, 1.5);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 8;
  colorMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(1.5, 1.5);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.anisotropy = 8;
  bumpMap.needsUpdate = true;

  _cachedCeramicColorTex = colorMap;
  _cachedCeramicBumpTex = bumpMap;

  return { colorMap, bumpMap };
}

function getBrushedSilverPlatinumTextures() {
  const colorMap = createBrushedMetalTexture({
    size: 512,
    baseHex: '#f4f6fa',
    streakAlpha: 0.07,
  });

  if (_cachedSilverRoughnessTex) {
    return { colorMap, roughnessMap: _cachedSilverRoughnessTex };
  }

  const size = 512;
  const canvas = makeCanvas(size, size);
  if (!canvas) {
    _cachedSilverRoughnessTex = makeFallbackTexture(212, 212, 212, 255, true);
    return { colorMap, roughnessMap: _cachedSilverRoughnessTex };
  }

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(212, 212, 212)';
  ctx.fillRect(0, 0, size, size);

  let seed = 0x13579bdf;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let y = 0; y < size; y++) {
    const baseVal = 202 + Math.round(nextRand() * 22);
    ctx.fillStyle = `rgb(${baseVal}, ${baseVal}, ${baseVal})`;
    ctx.fillRect(0, y, size, 1);
  }

  const roughnessMap = new THREE.CanvasTexture(canvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.anisotropy = 8;
  roughnessMap.needsUpdate = true;

  _cachedSilverRoughnessTex = roughnessMap;
  return { colorMap, roughnessMap };
}

/**
 * Architectural Studio Ground Plane Texture (adapted directly from `buildGround()` in the clean reference):
 * - Warm paper `#f4f0e8` base
 * - Subtle technical drafting grid (`rgba(24,24,22,0.045)`)
 * - 4-way diagonal circuit routing traces (`rgba(24,24,22,0.16)`) with circular via terminals (`rgba(24,24,22,0.22)`)
 * - Smooth radial vignette fade into `#f4f0e8`
 */
function createCleanBenchGroundTexture() {
  const size = 2048;
  const canvas = makeCanvas(size, size);
  if (!canvas) return makeFallbackTexture(244, 240, 232, 255);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4f0e8';
  ctx.fillRect(0, 0, size, size);

  // Fine architectural drafting grid
  ctx.strokeStyle = 'rgba(24, 24, 22, 0.045)';
  ctx.lineWidth = 1;
  for (let t = 64; t < size; t += 64) {
    ctx.beginPath();
    ctx.moveTo(t, 0);
    ctx.lineTo(t, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, t);
    ctx.lineTo(size, t);
    ctx.stroke();
  }

  const center = 1024;
  const scale = 32;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(24, 24, 22, 0.16)';
  ctx.lineWidth = 3;

  const drawPolyline = (pts) => {
    ctx.beginPath();
    pts.forEach(([x, z], idx) => {
      const px = center + x * scale;
      const py = center + z * scale;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  };

  const offsets = [-1.9, -1.2, -0.5, 0.2, 0.9, 1.6];
  offsets.forEach((off, idx) => {
    const r = 4.2 + idx * 0.35;
    drawPolyline([
      [-14, off - 4.5 - idx * 0.3],
      [-r - 4.5, off - 4.5 - idx * 0.3],
      [-r, off],
      [-2.2, off],
    ]);
    drawPolyline([
      [14, -off + 4.5 + idx * 0.3],
      [r + 4.5, -off + 4.5 + idx * 0.3],
      [r, -off],
      [2.2, -off],
    ]);
  });

  offsets.forEach((off, idx) => {
    const r = 4.4 + idx * 0.3;
    drawPolyline([
      [off + 5 + idx * 0.3, -14],
      [off + 5 + idx * 0.3, -r - 5],
      [off, -r],
      [off, -2.2],
    ]);
    drawPolyline([
      [-off - 5 - idx * 0.3, 14],
      [-off - 5 - idx * 0.3, r + 5],
      [-off, r],
      [-off, 2.2],
    ]);
  });

  // Circular via terminals on the studio board
  ctx.fillStyle = 'rgba(24, 24, 22, 0.22)';
  const vias = [
    [-6.2, 3.1],
    [6.2, -3.1],
    [3.1, 6.6],
    [-3.1, -6.6],
    [-9.1, -5.3],
    [9.1, 5.3],
  ];
  for (const [vx, vz] of vias) {
    ctx.beginPath();
    ctx.arc(center + vx * scale, center + vz * scale, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Radial fade into #f4f0e8 at the perimeter
  const fade = ctx.createRadialGradient(center, center, 260, center, center, 1000);
  fade.addColorStop(0, 'rgba(244, 240, 232, 0)');
  fade.addColorStop(1, 'rgba(244, 240, 232, 1)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function normalizePlanarUVs(geometry, halfSpan) {
  const pos = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  if (!pos || !uv) return;
  const span = halfSpan * 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uv.setXY(i, (x + halfSpan) / span, (y + halfSpan) / span);
  }
  uv.needsUpdate = true;
}

function createRimEngravingPlaque(width = 1024, height = 220) {
  const canvas = makeCanvas(width, height);
  if (!canvas) {
    return {
      canvas: null,
      ctx: null,
      tex: makeFallbackTexture(243, 239, 230, 0),
    };
  }
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { canvas, ctx, tex };
}

function paintRimEngraving(plaque, text, color = '#e7e1d4', fontSize = 66) {
  if (!plaque.ctx || !plaque.canvas) return;
  const { ctx, canvas, tex } = plaque;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color;
  ctx.font = `600 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) {
    ctx.letterSpacing = '0.14em';
  }
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  tex.needsUpdate = true;
}

function extractProgramExpressionLabel(stepState) {
  const source = stepState?.trace?.source || '';
  if (source) {
    const match = source.match(/entry\s+([^;]+);/);
    if (match && match[1]) {
      let raw = match[1].trim();
      if (/^sum_list\s*\(/i.test(raw)) return 'SUM([5, 8, 3])';
      if (/^sum_tree\s*\(/i.test(raw)) return 'SUM(TREE)';
      if (/^let\s+/i.test(raw)) {
        const inIdx = raw.toLowerCase().lastIndexOf(' in ');
        if (inIdx !== -1) raw = raw.slice(inIdx + 4).trim();
      }
      if (raw.length > 22) {
        raw = raw.slice(0, 20) + '…';
      }
      return raw.toUpperCase();
    }
  }
  const progName = stepState?.trace?.programName;
  if (progName) return String(progName).toUpperCase();
  return 'FACT(4)';
}

function extractFrontValueStatus(stepState) {
  const step = stepState?.step;
  const trace = stepState?.trace;
  const outcome = trace?.outcome;
  const totalSteps = stepState?.totalSteps || trace?.steps?.length || 0;
  const stepIdx = stepState?.stepIndex ?? 0;
  const isFinalStep = totalSteps > 0 && stepIdx >= totalSteps - 1;

  if (isFinalStep && outcome) {
    if (outcome.kind === 'Done') {
      return { text: `RESULT ${outcome.summary || ''}`.trim(), color: '#2b5b4c' };
    }
    if (outcome.kind === 'Rejected') {
      return { text: `STOPPED · REJECTED`, color: '#c84b31' };
    }
    if (outcome.kind === 'Exhausted') {
      return { text: `STOPPED · FUEL EXHAUSTED`, color: '#c84b31' };
    }
  }

  const ctrlKind = step?.after?.control?.kind || step?.controlKind || 'Eval';
  const ctrlVal = step?.after?.control?.value?.summary || step?.controlValue?.summary;
  if ((ctrlKind === 'Return' || ctrlKind === 'PrimitiveResult') && ctrlVal) {
    return { text: `VALUE ${ctrlVal}`, color: '#2b5b4c' };
  }

  const frameCount = step?.after?.frames?.length ?? 0;
  if (stepIdx === 0 && frameCount === 0) {
    return { text: 'READY', color: '#3a3936' };
  }
  return {
    text: `${frameCount} ${frameCount === 1 ? 'FRAME' : 'FRAMES'} · STEP ${stepIdx + 1}/${Math.max(1, totalSteps)}`,
    color: '#3a3936',
  };
}

// ---------------------------------------------------------------------------
// Subsystem Factory
// ---------------------------------------------------------------------------

export function createPackageSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer1_MonolithicPackageSubsystem';

  const disposables = [];
  const track = (item) => {
    if (item) disposables.push(item);
    return item;
  };

  // =========================================================================
  // 1. ARCHITECTURAL WARM-PAPER BENCH GROUND WITH TRACE FANOUT (y = -0.36)
  // =========================================================================
  const benchGroup = new THREE.Group();
  benchGroup.name = 'CleanStudioBenchGround';
  group.add(benchGroup);

  const benchHalfSpan = 14.0;
  const benchShape = new THREE.Shape();
  benchShape.moveTo(-benchHalfSpan, -benchHalfSpan);
  benchShape.lineTo(benchHalfSpan, -benchHalfSpan);
  benchShape.lineTo(benchHalfSpan, benchHalfSpan);
  benchShape.lineTo(-benchHalfSpan, benchHalfSpan);
  benchShape.closePath();

  // Circular central well bore so the hollow 3D chamber below is 100% open
  const boreHole = new THREE.Path();
  boreHole.absarc(0, 0, WELL_RADIUS, 0, Math.PI * 2, true);
  benchShape.holes.push(boreHole);

  const benchGeo = track(new THREE.ShapeGeometry(benchShape, 64));
  normalizePlanarUVs(benchGeo, benchHalfSpan);

  const benchTex = track(createCleanBenchGroundTexture());
  const benchMat = track(
    new THREE.MeshStandardMaterial({
      map: benchTex,
      roughness: 0.96,
      metalness: 0.0,
    })
  );

  const benchMesh = new THREE.Mesh(benchGeo, benchMat);
  benchMesh.rotation.x = -Math.PI / 2;
  benchMesh.position.y = -0.36;
  benchMesh.receiveShadow = true;
  benchGroup.add(benchMesh);

  // =========================================================================
  // 2. THREE-TIER STEPPED MONOLITHIC PACKAGE (MATCHING CLEAN REFERENCE)
  //    - Tier 1 (Base): Warm Alabaster Porcelain Ceramic (0xe6e0d3, half = 2.15, y = -0.35..-0.14)
  //    - Tier 2 (Step): Machined Silver-Platinum Interposer (0xa7aaad, half = 1.98, y = -0.14..-0.02)
  //    - Tier 3 (Shield): Deep Matte Charcoal-Obsidian Top Shield (0x2c2b29, half = 1.82, y = -0.02..0.105)
  //    - Central Lathe-Turned Silver-Platinum Beveled Funnel Collar framing the circular well (r = 1.06)
  // =========================================================================
  const substrateGroup = new THREE.Group();
  substrateGroup.name = 'ThreeTierSteppedPackage';
  group.add(substrateGroup);

  const { colorMap: ceramicColorMap, bumpMap: ceramicBumpMap } = getAlabasterCeramicTextures();
  const { colorMap: brushedMetalMap, roughnessMap: brushedRoughnessMap } =
    getBrushedSilverPlatinumTextures();

  // Tier 1 Material: Warm Alabaster Porcelain Ceramic (0xe6e0d3)
  const ceramicBodyMat = track(
    new THREE.MeshPhysicalMaterial({
      color: ALABASTER_CERAMIC_HEX,
      map: ceramicColorMap,
      bumpMap: ceramicBumpMap,
      bumpScale: 0.0025,
      roughness: 0.38,
      metalness: 0.02,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
    })
  );

  // Tier 2 & Collar Material: Machined Silver-Platinum (0xa7aaad)
  const machinedSilverMat = track(
    new THREE.MeshPhysicalMaterial({
      color: MACHINED_SILVER_HEX,
      map: brushedMetalMap,
      roughnessMap: brushedRoughnessMap,
      roughness: 0.26,
      metalness: 0.88,
      clearcoat: 0.25,
      clearcoatRoughness: 0.3,
    })
  );

  // Tier 3 Material: Deep Matte Charcoal-Obsidian Top Die Shield (0x2c2b29)
  const obsidianShieldMat = track(
    new THREE.MeshPhysicalMaterial({
      color: OBSIDIAN_SHIELD_HEX,
      roughness: 0.42,
      metalness: 0.22,
    })
  );

  // Front-South Architectural Cutaway Gate Group (retracts smoothly when cutawayMix > 0 in interior/frames views)
  const frontGateGroup = new THREE.Group();
  frontGateGroup.name = 'FrontSouthCutawayGate';
  group.add(frontGateGroup);

  const CUT_ANGLE = 0.25 * Math.PI; // ±45° front-south cutaway bay

  const buildSplitCircularBoreTier = ({
    halfSize,
    boreRadius = WELL_RADIUS,
    yTop,
    depth,
    bevel = 0,
    material,
    mainParent = substrateGroup,
    gateParent = frontGateGroup,
  }) => {
    const r = boreRadius + bevel;
    const cutX = r * Math.sin(CUT_ANGLE); // ~0.75
    const cutY = -r * Math.cos(CUT_ANGLE); // ~-0.75 (maps to +Z_world = +0.75)

    // 1. Main U-Body (270° back, left, right, and all 4 corners)
    const uShape = new THREE.Shape();
    uShape.moveTo(cutX, -halfSize);
    uShape.lineTo(halfSize, -halfSize);
    uShape.lineTo(halfSize, halfSize);
    uShape.lineTo(-halfSize, halfSize);
    uShape.lineTo(-halfSize, -halfSize);
    uShape.lineTo(-cutX, -halfSize);
    uShape.lineTo(-cutX, cutY);
    // Arc from -0.5*PI - CUT_ANGLE counter-clockwise around the back/sides to -0.5*PI + CUT_ANGLE
    uShape.absarc(0, 0, r, -Math.PI * 0.5 - CUT_ANGLE, Math.PI * 1.5 - CUT_ANGLE, true);
    uShape.closePath();

    const uGeo = track(
      new THREE.ExtrudeGeometry(uShape, {
        depth,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 2,
        curveSegments: 96,
      })
    );
    const uMesh = new THREE.Mesh(uGeo, material);
    uMesh.rotation.x = -Math.PI / 2;
    uMesh.position.y = yTop - depth - bevel;
    uMesh.castShadow = true;
    uMesh.receiveShadow = true;
    mainParent.add(uMesh);

    // 2. Front-South Gate Plug (`x ∈ [-cutX, +cutX], z_world ∈ [+0.75, +halfSize]`)
    const gateShape = new THREE.Shape();
    gateShape.moveTo(-cutX, -halfSize);
    gateShape.lineTo(cutX, -halfSize);
    gateShape.lineTo(cutX, cutY);
    gateShape.absarc(0, 0, r, -Math.PI * 0.5 + CUT_ANGLE, -Math.PI * 0.5 - CUT_ANGLE, true);
    gateShape.closePath();

    const gateGeo = track(
      new THREE.ExtrudeGeometry(gateShape, {
        depth,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 2,
        curveSegments: 48,
      })
    );
    const gateMesh = new THREE.Mesh(gateGeo, material);
    gateMesh.rotation.x = -Math.PI / 2;
    gateMesh.position.y = yTop - depth - bevel;
    gateMesh.castShadow = true;
    gateMesh.receiveShadow = true;
    gateParent.add(gateMesh);
  };

  // Tier 1: Warm Alabaster Porcelain Ceramic Carrier (half = 2.15, y = -0.35..-0.14)
  buildSplitCircularBoreTier({
    halfSize: CERAMIC_HALF,
    yTop: -0.14,
    depth: 0.21,
    bevel: 0,
    material: ceramicBodyMat,
  });

  // Tier 2: Machined Silver-Platinum Interposer Step (half = 1.98, y = -0.14..-0.02)
  buildSplitCircularBoreTier({
    halfSize: SILVER_STEP_HALF,
    yTop: -0.02,
    depth: 0.12,
    bevel: 0,
    material: machinedSilverMat,
  });

  // Tier 3: Deep Matte Charcoal-Obsidian Top Die Shield (half = 1.82, y = -0.02..0.105)
  const lidGroup = new THREE.Group();
  lidGroup.name = 'ObsidianDieShieldDeck';
  group.add(lidGroup);

  buildSplitCircularBoreTier({
    halfSize: DARK_SHIELD_HALF,
    yTop: 0.105,
    depth: 0.11,
    bevel: 0.015,
    material: obsidianShieldMat,
    mainParent: lidGroup,
    gateParent: frontGateGroup,
  });

  // Lathe-Turned Machined Silver-Platinum Beveled Funnel Collar around the circular well
  const collarPoints = [
    new THREE.Vector2(1.16, 0.108),
    new THREE.Vector2(1.11, 0.108),
    new THREE.Vector2(WELL_RADIUS, 0.082),
    new THREE.Vector2(WELL_RADIUS, -0.12),
  ];
  const collarMat = track(
    new THREE.MeshPhysicalMaterial({
      color: MACHINED_SILVER_HEX,
      map: brushedMetalMap,
      roughnessMap: brushedRoughnessMap,
      roughness: 0.25,
      metalness: 0.90,
      clearcoat: 0.28,
      clearcoatRoughness: 0.24,
      side: THREE.DoubleSide,
    })
  );

  // Back/Side 270° Collar (always stationary on lidGroup)
  const mainCollarGeo = track(
    new THREE.LatheGeometry(collarPoints, 96, CUT_ANGLE, Math.PI * 2 - CUT_ANGLE * 2)
  );
  const collarMesh = new THREE.Mesh(mainCollarGeo, collarMat);
  collarMesh.receiveShadow = true;
  lidGroup.add(collarMesh);

  // Front-South 90° Collar Arc (retracts with frontGateGroup in interior/frames cutaway views)
  const gateCollarGeo = track(
    new THREE.LatheGeometry(collarPoints, 36, -CUT_ANGLE, CUT_ANGLE * 2)
  );
  const gateCollarMesh = new THREE.Mesh(gateCollarGeo, collarMat);
  gateCollarMesh.receiveShadow = true;
  frontGateGroup.add(gateCollarMesh);

  // 4 Recessed Perimeter Groove Lines on the Obsidian Top Shield (inset at ±1.66)
  const grooveMat = track(
    new THREE.MeshStandardMaterial({
      color: GROOVE_DARK_HEX,
      roughness: 0.7,
      metalness: 0.1,
    })
  );
  const grooveOffset = DARK_SHIELD_HALF - 0.16;
  const grooveHGeo = track(new THREE.BoxGeometry(grooveOffset * 2, 0.003, 0.010));
  const grooveVGeo = track(new THREE.BoxGeometry(0.010, 0.003, grooveOffset * 2));
  const northGrooveMesh = new THREE.Mesh(grooveHGeo, grooveMat);
  northGrooveMesh.position.set(0, 0.106, -grooveOffset);
  lidGroup.add(northGrooveMesh);

  const southGrooveMesh = new THREE.Mesh(grooveHGeo, grooveMat);
  southGrooveMesh.position.set(0, 0.106, grooveOffset);
  frontGateGroup.add(southGrooveMesh);

  for (const sign of [-1, 1]) {
    const vMesh = new THREE.Mesh(grooveVGeo, grooveMat);
    vMesh.position.set(sign * grooveOffset, 0.106, 0);
    lidGroup.add(vMesh);
  }

  // 4 Machined Silver-Platinum Corner Torus Fiducial Rings at (±1.62, 0.108, ±1.62)
  const cornerRingGeo = track(new THREE.TorusGeometry(0.044, 0.008, 8, 24));
  for (const sx of [-1.62, 1.62]) {
    for (const sz of [-1.62, 1.62]) {
      const ringMesh = new THREE.Mesh(cornerRingGeo, machinedSilverMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.set(sx, 0.108, sz);
      lidGroup.add(ringMesh);
    }
  }

  // =========================================================================
  // 3. 24 PROTRUDING GOLD CONTACT LEADS IN 1 THREE.InstancedMesh (6 PER SIDE)
  // =========================================================================
  const leadGeo = track(new THREE.BoxGeometry(0.06, 0.14, 0.11));
  const leadMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.90,
    })
  );

  const edgePadsInstanced = new THREE.InstancedMesh(leadGeo, leadMat, LEAD_COUNT);
  edgePadsInstanced.castShadow = true;
  substrateGroup.add(edgePadsInstanced);

  const padMeta = [];
  const sideAngles = [
    Math.PI / 2,  // 0: North (z = -2.15)
    0,            // 1: East  (x = +2.15)
    -Math.PI / 2, // 2: South (z = +2.15)
    Math.PI,      // 3: West  (x = -2.15)
  ];

  for (let sideIndex = 0; sideIndex < 4; sideIndex++) {
    const rotY = sideAngles[sideIndex];
    _tmpQuat.setFromAxisAngle(_upAxis, rotY);

    for (let i = 0; i < 6; i++) {
      const idx = sideIndex * 6 + i;
      const offset = -0.92 + i * 0.368;

      _tmpPos.set(CERAMIC_HALF - 0.01, -0.245, offset).applyQuaternion(_tmpQuat);
      _tmpMatrix.compose(_tmpPos, _tmpQuat, _tmpScale);
      edgePadsInstanced.setMatrixAt(idx, _tmpMatrix);

      _tmpColorA.setHex(CRYO_GOLD_HEX);
      edgePadsInstanced.setColorAt(idx, _tmpColorA);

      padMeta.push({
        idx,
        sideIndex,
        localIndex: i,
      });
    }
  }
  edgePadsInstanced.instanceMatrix.needsUpdate = true;
  if (edgePadsInstanced.instanceColor) {
    edgePadsInstanced.instanceColor.setUsage(THREE.DynamicDrawUsage);
    edgePadsInstanced.instanceColor.needsUpdate = true;
  }
  edgePadsInstanced.computeBoundingSphere();

  // =========================================================================
  // 4. LASER-ETCHED NOMENCLATURE ("SHERLOCK", "FACT(4)", AND FRONT VALUE STEP)
  // =========================================================================
  const northPlaque = createRimEngravingPlaque(1024, 220);
  track(northPlaque.tex);
  paintRimEngraving(northPlaque, 'SHERLOCK', '#e7e1d4', 72);

  const northWordmarkMesh = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.15, 0.28)),
    track(
      new THREE.MeshBasicMaterial({
        map: northPlaque.tex,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        toneMapped: false,
      })
    )
  );
  northWordmarkMesh.rotation.x = -Math.PI / 2;
  northWordmarkMesh.position.set(0, 0.108, -1.46);
  lidGroup.add(northWordmarkMesh);

  // South Deck Program Plate: "FACT(4)" in champagne-gold (#c5a059)
  const southPlaque = createRimEngravingPlaque(1024, 220);
  track(southPlaque.tex);
  let lastProgramTitle = 'FACT(4)';
  let lastTraceRef = null;
  let lastTraceSource = '';
  let lastProgramName = '';
  paintRimEngraving(southPlaque, lastProgramTitle, '#c5a059', 58);

  const southPlateMesh = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.25, 0.26)),
    track(
      new THREE.MeshBasicMaterial({
        map: southPlaque.tex,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        toneMapped: false,
      })
    )
  );
  southPlateMesh.rotation.x = -Math.PI / 2;
  southPlateMesh.position.set(0, 0.108, 1.46);
  frontGateGroup.add(southPlateMesh);

  // Front Ceramic Step Live Value/Frame Status Engraving (at z = 2.065, y = -0.138)
  const frontValuePlaque = createRimEngravingPlaque(1024, 220);
  track(frontValuePlaque.tex);
  let lastFrontValueKey = '';
  let lastFrontStepIdx = -1;
  let lastFrontTraceRef = null;
  let lastLeadPhase = '';
  paintRimEngraving(frontValuePlaque, 'READY', '#3a3936', 52);

  const frontValueMesh = new THREE.Mesh(
    track(new THREE.PlaneGeometry(2.50, 0.24)),
    track(
      new THREE.MeshBasicMaterial({
        map: frontValuePlaque.tex,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        toneMapped: false,
      })
    )
  );
  frontValueMesh.rotation.x = -Math.PI / 2;
  frontValueMesh.position.set(0, -0.138, 2.065);
  frontGateGroup.add(frontValueMesh);

  tagInspectable(substrateGroup, {
    type: 'package-substrate',
    id: 'three-tier-ceramic-silver-package',
    title: 'Three-Tier Porcelain Ceramic & Silver-Platinum Package',
    subtitle: 'Alabaster Ceramic Base + Silver-Platinum Step + 24 Gold Leads',
    details: 'Three-tier stepped IC carrier with warm alabaster porcelain ceramic base, machined silver-platinum interposer step, 24 gold leads, and live front ceramic status engraving.',
  });

  tagInspectable(lidGroup, {
    type: 'package-lid',
    id: 'obsidian-die-shield-deck',
    title: 'Obsidian-Sapphire Top Die Shield & Silver Funnel Collar',
    subtitle: 'SHERLOCK · K-A/1 // Lathe-Turned Silver-Platinum Well Collar',
    details: 'Deep matte obsidian-graphite top shield framed by 4 corner fiducial rings and a lathe-turned silver-platinum beveled funnel collar around the hollow 3D well.',
  });

  // =========================================================================
  // DYNAMIC UPDATE LOOP (.update(stepState)) — ZERO ALLOCATIONS
  // =========================================================================
  function update(stepState = {}) {
    const ambient = stepState.ambient ?? 0;
    const phase = stepState.phase ?? 'STILL';
    const cutawayMix = stepState.cutawayMix ?? 0;

    // 0. Smoothly retract the Front-South Cutaway Gate & lower the bench plane below the -3.40 vault base in frames mode
    frontGateGroup.position.y = -cutawayMix * 3.12;
    frontGateGroup.visible = cutawayMix < 0.96;
    benchMesh.position.y = -0.36 - cutawayMix * 3.08;

    // 1. Update South Rim Active Program Call Laser-Etching when program changes
    const trace = stepState.trace ?? null;
    const rawSource = trace?.source || '';
    const rawProgName = trace?.programName || '';
    if (
      trace !== lastTraceRef ||
      rawSource !== lastTraceSource ||
      rawProgName !== lastProgramName
    ) {
      lastTraceRef = trace;
      lastTraceSource = rawSource;
      lastProgramName = rawProgName;
      const exprLabel = extractProgramExpressionLabel(stepState);
      if (exprLabel !== lastProgramTitle) {
        lastProgramTitle = exprLabel;
        paintRimEngraving(southPlaque, lastProgramTitle, '#c5a059', 58);
        lidGroup.userData.subtitle = `SHERLOCK · K-A/1 // Active Call: ${lastProgramTitle}`;
      }
    }

    // 2. Update Front Ceramic Step Value/Frame Status Engraving ONLY when integer step or trace changes
    const stepIdx = stepState.stepIndex ?? stepState.step?.stepIndex ?? -1;
    if (stepIdx !== lastFrontStepIdx || trace !== lastFrontTraceRef) {
      lastFrontStepIdx = stepIdx;
      lastFrontTraceRef = trace;
      const frontStatus = extractFrontValueStatus(stepState);
      const frontKey = `${frontStatus.text}|${frontStatus.color}`;
      if (frontKey !== lastFrontValueKey) {
        lastFrontValueKey = frontKey;
        paintRimEngraving(frontValuePlaque, frontStatus.text, frontStatus.color, 50);
      }
    }

    // 3. Update 24 Instanced Gold Contact Leads (skip redundant GPU upload when stationary in STILL phase)
    if (phase === 'STILL' && lastLeadPhase === 'STILL') {
      return;
    }
    lastLeadPhase = phase;

    _tmpColorB.setHex(CRYO_GOLD_HEX);

    for (let p = 0; p < LEAD_COUNT; p++) {
      const { sideIndex, localIndex } = padMeta[p];
      let targetHex = LUMINOUS_GOLD_HEX;
      let blend = 0.25;

      if (phase === 'INGEST') {
        const wave = 0.5 + 0.5 * Math.sin(ambient * 6.5 - localIndex * 0.5);
        targetHex = sideIndex === 3 ? CYAN_TEAL_HEX : LUMINOUS_GOLD_HEX;
        blend = 0.30 + 0.40 * wave;
      } else if (phase === 'DESCEND') {
        const wave = 0.5 + 0.5 * Math.sin(ambient * 5.0 - localIndex * 0.45 + sideIndex * 0.7);
        targetHex = LUMINOUS_GOLD_HEX;
        blend = 0.20 + 0.35 * wave;
      } else if (phase === 'RESOLVE' || phase === 'RETURN' || phase === 'EMBLEM') {
        const wave = 0.5 + 0.5 * Math.sin(ambient * 6.0 + localIndex * 0.45);
        targetHex = phase === 'EMBLEM' ? LUMINOUS_GOLD_HEX : CYAN_TEAL_HEX;
        blend = 0.30 + 0.45 * wave;
      } else if (phase === 'ERROR') {
        const pulse = 0.5 + 0.5 * Math.sin(ambient * 8.0);
        targetHex = PALETTE.errorRed;
        blend = 0.45 + 0.50 * pulse;
      }

      _tmpColorA.setHex(targetHex);
      _tmpColorA.lerp(_tmpColorB, 1 - blend);
      edgePadsInstanced.setColorAt(p, _tmpColorA);
    }

    if (edgePadsInstanced.instanceColor) {
      edgePadsInstanced.instanceColor.needsUpdate = true;
    }
  }

  function dispose() {
    edgePadsInstanced.dispose();
    for (let i = 0; i < disposables.length; i++) {
      const d = disposables[i];
      if (d && typeof d.dispose === 'function') {
        d.dispose();
      }
    }
    disposables.length = 0;
  }

  update({ ambient: 0, phase: 'STILL' });

  return {
    group,
    update,
    dispose,
  };
}
