// ============================================================================
// src/designers/designer8_quineling.js
// Designer 8: Authentic `nursery.html` Quinelings SDK & `WovenBody` 3D Lifeforms
// Compiles actual Sherlock programs (`moriarty-sherlock-draft/1` AST + traces)
// through the enhanced upstream Quinelings SDK (`Quinelings.makeTaskProgram`,
// `QDL.fromGraph`, `WovenBody.author`, `Morphology`, `Chroma`, `LifeformFamilies`)
// and renders the genuine mathematical `WovenBody` shapes (`logarithmic-mantle`,
// `pleated-braid`, `recursive-affine`, `lorenz-flow`, `phyllotaxis-fan`,
// `clifford-flow`, `recursive-julia`, `toroidal-weave`) in 3D inside the hollow
// processor chamber — with program-driven variation in shape, motion, and color.
// ============================================================================
import * as THREE from 'three/webgpu';
import {
  clamp,
  lerp,
  tagInspectable,
} from './theme.js';
import { WovenBody, QDL } from '../engine/quinelingsSdk.js';
import {
  fnv1a32,
  compileSherlockProgramToQuineling,
} from '../engine/sherlockQuinelingCompiler.js';
import { createPersistentPhaseRing } from '../engine/functionalStructures.js';

export { fnv1a32 };

const TAU = Math.PI * 2;
const PHI_GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

// Detect mobile / coarse-pointer / iPadOS devices so Android/iOS CPUs & GPUs run at locked 60 FPS
const IS_MOBILE_RUNTIME =
  typeof navigator !== 'undefined' &&
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
    (Number(navigator.maxTouchPoints) > 1 && /Macintosh/i.test(navigator.userAgent || '')) ||
    (typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(max-width: 900px), (hover: none) and (pointer: coarse)').matches));

// Spatial Anchor & Strict Envelope Constants inside the 3.12 × 3.12 × 3.40 Vault
export const QUINELING_CORE_Y = -2.06;
export const QUINELING_MAX_RADIUS = 0.54;

const TISSUE_BUDGET = IS_MOBILE_RUNTIME ? 6144 : 8192;
const MAX_RIDGE_SEGMENTS = IS_MOBILE_RUNTIME ? 16384 : 28672;
const MAX_RIDGE_VERTICES = MAX_RIDGE_SEGMENTS * 2;
const PHASE_BUCKET_COUNT = IS_MOBILE_RUNTIME ? 48 : 64;

const SDK_RIBBON_COUNT = 24;
const SDK_RIBBON_SEGMENTS = 24;
const SDK_RIBBON_VERTEX_COUNT = SDK_RIBBON_COUNT * SDK_RIBBON_SEGMENTS * 2;

const MAX_ANCHOR_NODES = 16;
const MAX_DEPENDENCY_ARCS = 24;
const ARC_SEGMENTS = 12;
const MAX_ARC_VERTICES = MAX_DEPENDENCY_ARCS * (ARC_SEGMENTS - 1) * 2;

const SPORE_COUNT = 64;
const TENDRIL_CURVE_COUNT = 16;
const TENDRIL_SEGMENTS = 10;
const TENDRIL_VERTEX_COUNT = TENDRIL_CURVE_COUNT * TENDRIL_SEGMENTS * 2;

const ROLES_1_HEX = Object.freeze({
  inputCyan: 0x35d6c3,
  processBlue: 0x639bfa,
  decisionAmber: 0xedc653,
  quoteViolet: 0xb184ef,
  actionCoral: 0xf2757d,
  reportGreen: 0x2dd4bf,
  pearlCrest: 0xe6f8ed,
  faultCrimson: 0xe11d48,
  exhaustSlate: 0x64748b,
});

function quinticStep(z) {
  const t = clamp(z, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Canonical 8-Program Quineling Species Profiles (`nursery.html` `WovenBody` mechanisms)
 * Every Sherlock program compiles through the upstream SDK (`WovenBody.author` + `QDL.fromGraph`)
 * into its authentic mathematical `WovenBody` lifeform.
 */
export const QUINELING_SPECIES = Object.freeze({
  factorial: {
    id: 'factorial',
    speciesName: 'Logarithmic Mantle',
    binomial: 'Spiralis multiplicata',
    commonTitle: 'Logarithmic Mantle // Coiled Ribbon Chart',
    family: 'nautilus',
    mechanism: 'logarithmic-mantle',
    symmetryOrder: 'Two-Parameter Logarithmic Shell Chart + Jacobian Compression',
    gesture: 'glide',
    primaryHex: 0x72d9e2,
    secondaryHex: 0xe6c66a,
    accentCss: '#72d9e2',
    description:
      'Genuine WovenBody logarithmic-mantle lifeform authored from convergent multiplicative accumulation, with projected-compression Jacobian caustics and spiral parameter filaments.',
  },
  list_fold: {
    id: 'list_fold',
    speciesName: 'Pleated Braid',
    binomial: 'Vitta catenaria',
    commonTitle: 'Pleated Braid // Folded Ribbon Manifold',
    family: 'ribbon',
    mechanism: 'pleated-braid',
    symmetryOrder: 'Multi-Strand Pleated Braid Immersion + Fold Ridges',
    gesture: 'gather',
    primaryHex: 0x6ad4a0,
    secondaryHex: 0xbb91ed,
    accentCss: '#6ad4a0',
    description:
      'Genuine WovenBody pleated-braid lifeform authored from sequential cons/nil pipeline folds, weaving core and peripheral ribbon lanes with harmonic fold crests.',
  },
  tree_fold: {
    id: 'tree_fold',
    speciesName: 'Recursive Affine',
    binomial: 'Dendron bifurcata',
    commonTitle: 'Recursive Affine // Contractive Branch Charts',
    family: 'coral',
    mechanism: 'recursive-affine',
    symmetryOrder: 'Contractive Rolled-Scroll Affine Branch Charts + Jacobian Caustics',
    gesture: 'unfurl',
    primaryHex: 0x88d89f,
    secondaryHex: 0xefaa73,
    accentCss: '#88d89f',
    description:
      'Genuine WovenBody recursive-affine lifeform authored from hierarchical branch/leaf tree recursion, with contractive rolled-scroll branch charts and exact signed Jacobian caustics.',
  },
  mutual_even_odd: {
    id: 'mutual_even_odd',
    speciesName: 'Lorenz Strange Attractor',
    binomial: 'Bimorpha paritatis',
    commonTitle: 'Lorenz Flow // RK4 Strange Attractor',
    family: 'moth',
    mechanism: 'lorenz-flow',
    symmetryOrder: 'Classical RK4 Lorenz Attractor (σ=10, ρ=28, β=8/3) + Frenet Ribbons',
    gesture: 'hover',
    primaryHex: 0xbb91ed,
    secondaryHex: 0x72d9e2,
    accentCss: '#bb91ed',
    description:
      'Genuine WovenBody lorenz-flow lifeform authored from coupled is_even/is_odd parity alternation, integrating a two-wing RK4 Lorenz orbit with Frenet-frame ribbon pleats.',
  },
  lexical_let: {
    id: 'lexical_let',
    speciesName: 'Phyllotaxis Fan',
    binomial: 'Granum phyllotaxis',
    commonTitle: 'Phyllotaxis Fan // Golden-Angle Whorls',
    family: 'bloom',
    mechanism: 'phyllotaxis-fan',
    symmetryOrder: 'Golden-Angle (137.5°) Phyllotaxis Ribbon Whorls + Jacobian Compression',
    gesture: 'gather',
    primaryHex: 0xb5e681,
    secondaryHex: 0x899be8,
    accentCss: '#b5e681',
    description:
      'Genuine WovenBody phyllotaxis-fan lifeform authored from nested lexical let-scope chains, arranging two-parameter ribbon charts along the golden angle with projected-compression caustics.',
  },
  checked_underflow: {
    id: 'checked_underflow',
    speciesName: 'Clifford Strange Attractor',
    binomial: 'Umbrella fracturae',
    commonTitle: 'Clifford Flow // Critical Caustic Web',
    family: 'jelly',
    mechanism: 'clifford-flow',
    symmetryOrder: 'Native Clifford Recurrence Map + Forward-Iterated Critical Curves',
    gesture: 'hover',
    primaryHex: 0xeb90ba,
    secondaryHex: 0x77bce9,
    accentCss: '#eb90ba',
    description:
      'Genuine WovenBody clifford-flow lifeform authored from guarded subtractive boundary checks, sampling a 2D Clifford attractor density field and its forward-mapped Jacobian zero-determinant critical curves.',
  },
  stack_overflow: {
    id: 'stack_overflow',
    speciesName: 'Quadratic Julia Manifold',
    binomial: 'Cauda julia',
    commonTitle: 'Recursive Julia // Escape-Level Contours',
    family: 'comet',
    mechanism: 'recursive-julia',
    symmetryOrder: 'Complex Quadratic Recurrence z → z² + c + Marching-Squares Contours',
    gesture: 'glide',
    primaryHex: 0xefaa73,
    secondaryHex: 0xbb91ed,
    accentCss: '#efaa73',
    description:
      'Genuine WovenBody recursive-julia lifeform authored from divergent self-recursive call fanout, tracing smoothed escape-time tissue and marching-squares level-set contours of z → z² + c.',
  },
  fuel_exhaustion: {
    id: 'fuel_exhaustion',
    speciesName: 'Toroidal Weave',
    binomial: 'Annulus toroidalis',
    commonTitle: 'Toroidal Weave // Poloidal Ribbon Field',
    family: 'torus',
    mechanism: 'toroidal-weave',
    symmetryOrder: 'Multi-Lobe Toroidal Ribbon Immersion + Parameter Filaments',
    gesture: 'gather',
    primaryHex: 0x77bce9,
    secondaryHex: 0xe6c66a,
    accentCss: '#77bce9',
    description:
      'Genuine WovenBody toroidal-weave lifeform authored from bounded effectful loop schedules, wrapping multi-strand poloidal ribbons around an asymmetric breathing torus.',
  },
});

const PRESET_ALIAS_TO_ID = Object.freeze({
  factorial: 'factorial',
  list_fold: 'list_fold',
  list_sum: 'list_fold',
  tree_fold: 'tree_fold',
  tree_sum: 'tree_fold',
  mutual_even_odd: 'mutual_even_odd',
  lexical_let: 'lexical_let',
  let_shadow: 'lexical_let',
  checked_underflow: 'checked_underflow',
  checked_sub_trap: 'checked_underflow',
  stack_overflow: 'stack_overflow',
  fuel_exhaustion: 'fuel_exhaustion',
});

export function resolveCompiledQuineling(stepState = {}) {
  const source =
    stepState.source ||
    stepState.trace?.source ||
    'language "moriarty-sherlock-draft/1"; program Factorial { fn fact(n: UInt): UInt { if n == 0 { 1 } else { n * fact(n - 1) } } entry fact(4); }';
  return compileSherlockProgramToQuineling(
    source,
    QUINELING_SPECIES,
    stepState.trace || null
  );
}

export function resolveQuinelingSpecies(stepState = {}) {
  const rawId =
    stepState.presetId ||
    stepState.trace?.presetId ||
    stepState.programId ||
    '';
  const mappedId = PRESET_ALIAS_TO_ID[rawId];
  if (mappedId && QUINELING_SPECIES[mappedId] && !stepState.source) {
    return QUINELING_SPECIES[mappedId];
  }
  const artifact = resolveCompiledQuineling(stepState);
  return artifact.speciesMeta || QUINELING_SPECIES.factorial;
}

let _lastTelemetryKey = '';
let _lastTelemetryResult = null;

/**
 * Computes a concise live morphogenesis telemetry object for UI inspector (`#telemetryQdlMorph`)
 */
export function getQuinelingTelemetry(stepState = {}) {
  const artifact = resolveCompiledQuineling(stepState);
  const stepIndex = stepState.stepIndex ?? stepState.step?.index ?? 0;
  const telemetryKey = `${artifact.cacheKey}|step:${stepIndex}`;
  if (telemetryKey === _lastTelemetryKey && _lastTelemetryResult) {
    return _lastTelemetryResult;
  }

  const species = artifact.speciesMeta;
  const step = stepState.step ?? null;
  const ruleLine = step?.ruleLine ?? 80;
  const ruleId = step?.ruleId || `A${String(ruleLine).padStart(3, '0')}`;
  const frames = step?.after?.frames ?? [];
  const frameCount = frames.length;
  const beforeFrameCount = step?.before?.frameCount ?? frameCount;
  const activeCalls = step?.after?.activeCalls ?? [];
  const callDepth = activeCalls.length;
  const controlKind = step?.after?.control?.kind || step?.controlKind || 'Eval';
  const rhythmMode = artifact.design?.motion?.rhythm?.mode || 'breath-pulse';

  let morphGesture = `RHYTHM ${rhythmMode.toUpperCase()}`;
  let morphCss = artifact.nodeColors?.[0]?.hex || species.accentCss;

  if (ruleLine === 80 || ruleId === 'A080') {
    morphGesture = `CROWN BLOOM · ${artifact.wovenRecord.mechanism.toUpperCase()} DONE`;
    morphCss = '#2dd4bf';
  } else if (ruleLine === 82 || ruleLine === 140 || ruleLine === 225) {
    morphGesture = `CAUSTIC FAULT LOCK · ${ruleId}`;
    morphCss = '#e11d48';
  } else if (ruleLine === 84 || ruleId === 'A084') {
    morphGesture = 'TOROIDAL EMBER FADE · 0F';
    morphCss = '#64748b';
  } else if (ruleLine === 149 || ruleLine === 145 || ruleLine === 177) {
    morphGesture = `CHIRAL PHASE LOCK · ${ruleId}`;
    morphCss = '#e6c66a';
  } else if (ruleLine === 223) {
    morphGesture = `16-LIMB ALU CONVERGENCE · ${rhythmMode.toUpperCase()}`;
    morphCss = '#72d9e2';
  } else if (frameCount > beforeFrameCount || ruleLine === 135) {
    morphGesture = `UNFURLING PATCH #${frameCount} · DEPTH ${callDepth}`;
    morphCss = artifact.nodeColors?.[frameCount % Math.max(1, artifact.nodeColors.length)]?.hex || species.accentCss;
  } else if (frameCount < beforeFrameCount || controlKind === 'Return') {
    morphGesture = `MANIFOLD SYNTHESIS · ${frameCount} OPEN`;
    morphCss = '#6ad4a0';
  } else {
    morphGesture = `${artifact.wovenRecord.mechanism.toUpperCase()} · ${rhythmMode.toUpperCase()}`;
  }

  _lastTelemetryKey = telemetryKey;
  _lastTelemetryResult = {
    speciesId: species.id,
    speciesName: species.speciesName,
    binomial: species.binomial,
    commonTitle: species.commonTitle,
    family: artifact.design?.family || species.family,
    mechanism: artifact.wovenRecord?.mechanism || species.mechanism,
    symmetryOrder: species.symmetryOrder,
    morphGesture,
    morphCss,
    quineVerified: artifact.quineVerified,
    quineBytes: artifact.quineBytes,
    nodeCount: artifact.graph.nodes.length,
  };
  return _lastTelemetryResult;
}

let sharedTissueSpriteTexture = null;
function getTissueSpriteTexture() {
  if (sharedTissueSpriteTexture) return sharedTissueSpriteTexture;
  if (typeof document === 'undefined') return null;
  const size = 128;
  const half = size * 0.5;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(half, half, 1.5, half, half, half - 1.5);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.24, 'rgba(248, 253, 255, 0.94)');
  grad.addColorStop(0.54, 'rgba(218, 244, 252, 0.42)');
  grad.addColorStop(0.82, 'rgba(165, 224, 242, 0.10)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  sharedTissueSpriteTexture = new THREE.CanvasTexture(canvas);
  sharedTissueSpriteTexture.colorSpace = THREE.SRGBColorSpace;
  sharedTissueSpriteTexture.minFilter = THREE.LinearFilter;
  sharedTissueSpriteTexture.magFilter = THREE.LinearFilter;
  sharedTissueSpriteTexture.generateMipmaps = false;
  sharedTissueSpriteTexture.needsUpdate = true;
  return sharedTissueSpriteTexture;
}

function writeRibbonStrip(positions, colors, normals, uvs, curveIndex, segments, pointsArray, halfWidth, r, g, b) {
  const baseVertex = curveIndex * segments * 2;
  for (let s = 0; s < segments; s += 1) {
    const p = pointsArray[s];
    const pNext = pointsArray[Math.min(segments - 1, s + 1)];
    const pPrev = pointsArray[Math.max(0, s - 1)];

    let tx = pNext.x - pPrev.x;
    let ty = pNext.y - pPrev.y;
    let tz = pNext.z - pPrev.z;
    const tLen = Math.hypot(tx, ty, tz) || 1;
    tx /= tLen;
    ty /= tLen;
    tz /= tLen;

    let bx = -tz;
    let by = 0;
    let bz = tx;
    const bLen = Math.hypot(bx, by, bz);
    if (bLen < 1e-4) {
      bx = 1;
      by = 0;
      bz = 0;
    } else {
      bx /= bLen;
      bz /= bLen;
    }

    const nx = ty * bz - tz * by;
    const ny = tz * bx - tx * bz;
    const nz = tx * by - ty * bx;

    const u = s / Math.max(1, segments - 1);
    const taper = Math.sin(u * Math.PI) * 0.72 + 0.28;
    const w = halfWidth * taper;

    const v0 = (baseVertex + s * 2) * 3;
    const v1 = (baseVertex + s * 2 + 1) * 3;

    positions[v0] = p.x - bx * w;
    positions[v0 + 1] = p.y - by * w;
    positions[v0 + 2] = p.z - bz * w;

    positions[v1] = p.x + bx * w;
    positions[v1 + 1] = p.y + by * w;
    positions[v1 + 2] = p.z + bz * w;

    normals[v0] = nx;
    normals[v0 + 1] = ny;
    normals[v0 + 2] = nz;
    normals[v1] = nx;
    normals[v1 + 1] = ny;
    normals[v1 + 2] = nz;

    const glow = 0.68 + 0.32 * Math.sin(u * Math.PI);
    colors[v0] = r * glow;
    colors[v0 + 1] = g * glow;
    colors[v0 + 2] = b * glow;
    colors[v1] = r * glow;
    colors[v1 + 1] = g * glow;
    colors[v1 + 2] = b * glow;

    if (uvs) {
      const uv0 = (baseVertex + s * 2) * 2;
      const uv1 = (baseVertex + s * 2 + 1) * 2;
      uvs[uv0] = u;
      uvs[uv0 + 1] = 0;
      uvs[uv1] = u;
      uvs[uv1 + 1] = 1;
    }
  }
}

function buildRibbonIndices(curveCount, segments) {
  const indexArray = [];
  for (let c = 0; c < curveCount; c += 1) {
    const base = c * segments * 2;
    for (let s = 0; s < segments - 1; s += 1) {
      const i0 = base + s * 2;
      const i1 = i0 + 1;
      const i2 = i0 + 2;
      const i3 = i0 + 3;
      indexArray.push(i0, i2, i1, i1, i2, i3);
    }
  }
  return indexArray;
}

/**
 * Evaluates the program-authored QDL `motion.rhythm` phase modulation (`nursery.js` / `visual-capsule.js`)
 * so each program moves with its own distinct rhythm (`breath-pulse`, `crest-wave`,
 * `asymmetric-glide`, `harmonic-overtone`).
 */
function evaluateProgramRhythmPhase(design, basePhase) {
  const mr = design?.motion?.rhythm;
  if (!mr) return basePhase;
  const rate = Number.isFinite(mr.rate) ? mr.rate : 1.0;
  const breath = Number.isFinite(mr.breath) ? mr.breath : 0.14;
  const wave = Number.isFinite(mr.wave) ? mr.wave : 0.12;
  const asym = Number.isFinite(mr.asymmetry) ? mr.asymmetry : 0.1;
  const overtone = Number.isFinite(mr.overtone) ? mr.overtone : 0.08;
  const t = basePhase * rate;

  switch (mr.mode) {
    case 'crest-wave':
      return t + wave * Math.sin(2 * t) + overtone * Math.cos(3 * t);
    case 'asymmetric-glide':
      return t + asym * Math.sin(t + asym * Math.cos(t)) + 0.5 * wave * Math.sin(2 * t);
    case 'harmonic-overtone':
      return t + breath * Math.sin(t) + overtone * Math.sin(3 * t + 0.6);
    case 'breath-pulse':
    default:
      return t + breath * Math.sin(t) + 0.35 * wave * Math.cos(2 * t);
  }
}

/**
 * Normalizes a 3D `WovenBody` point `(x, y, z)` into the Hollow Well atrium envelope
 * (`r <= QUINELING_MAX_RADIUS = 0.54`) while preserving exact `nursery.html` proportions
 * and giving all 8 `WovenBody` mechanisms sculptural 3D Z-depth relief under camera orbit.
 */
function normalizeWovenCoord(x, y, z, bounds, mechanism, outVec) {
  const cx = bounds?.cx || 0;
  const cy = bounds?.cy || 0;
  const cz = bounds?.cz || 0;
  const span = Math.max(0.32, bounds?.width || 1.2, bounds?.height || 1.2);
  const scale = (QUINELING_MAX_RADIUS * 1.92) / span;

  const nx = (x - cx) * scale;
  // Flip Y because nursery.html / WovenBody uses 2D screen coordinates (+Y downward)
  const ny = -(y - cy) * scale;
  let nz = (z - cz) * scale;

  const r = Math.hypot(nx, ny);
  const theta = Math.atan2(ny, nx);

  // Give all 8 mechanisms sculptural 3D Z-depth relief while preserving their 2D silhouette
  if (mechanism === 'clifford-flow' || mechanism === 'recursive-julia') {
    nz = nz * 2.8 + 0.11 * Math.sin(nx * 5.4 + ny * 4.2) + 0.06 * Math.cos(r * 7.0 - theta);
  } else if (mechanism === 'recursive-affine') {
    nz = nz * 2.1 + 0.08 * Math.sin(ny * 5.0 + nx * 3.5);
  } else if (mechanism === 'logarithmic-mantle' || mechanism === 'phyllotaxis-fan') {
    nz = nz * 1.65 + 0.09 * Math.cos(r * 5.8 - theta * 2.0);
  } else if (mechanism === 'pleated-braid') {
    nz = nz * 1.75 + 0.085 * Math.sin(nx * 6.5) * Math.cos(ny * 4.5);
  } else {
    nz = nz * 1.45 + 0.05 * Math.sin(theta * 2.0 + r * 4.0);
  }

  outVec.set(nx, ny, nz);
  return outVec;
}

const MECHANISM_VELOCITY_GAIN = Object.freeze({
  'logarithmic-mantle': 2.2,
  'pleated-braid': 1.85,
  'recursive-affine': 2.0,
  'lorenz-flow': 2.45,
  'phyllotaxis-fan': 2.35,
  'clifford-flow': 2.1,
  'recursive-julia': 2.05,
  'toroidal-weave': 2.3,
});

function computeSpatialWaveAngle(nx, ny, nz, mechanism) {
  const r = Math.hypot(nx, ny);
  const theta = Math.atan2(ny, nx);
  switch (mechanism) {
    case 'logarithmic-mantle':
      return r * 13.5 - theta * 2.0;
    case 'pleated-braid':
      return nx * 9.5 + ny * 5.5;
    case 'recursive-affine':
      return r * 11.0 + theta - ny * 4.0;
    case 'lorenz-flow':
      return r * 11.0 + (nx >= 0 ? 0 : 1.57);
    case 'phyllotaxis-fan':
      return r * 15.0 - theta * 5.0;
    case 'clifford-flow':
      return nx * 9.5 + ny * 7.5;
    case 'recursive-julia':
      return r * 14.0 + theta * 2.0;
    case 'toroidal-weave':
    default:
      return r * 12.5 + theta * 3.0 + nz * 4.0;
  }
}

/**
 * Returns (or lazily initializes) the functional `PersistentPhaseRing` memo table on `artifact`.
 * Each bucket stores pre-normalized Structure-of-Arrays (SoA) tissue & ridge geometry over S^1 = [0, 2π),
 * plus precomputed spatial wave sin/cos, exponential density alpha, and ribbon paths so per-frame
 * 60/120fps advection uses zero transcendental calls inside the vertex loop!
 */
function ensureArtifactPhaseRing(artifact, frameReuse, vecA, vecB) {
  if (
    artifact._phaseRing &&
    artifact._phaseRingBudget === TISSUE_BUDGET &&
    artifact._phaseRing.bucketCount === PHASE_BUCKET_COUNT
  ) {
    return artifact._phaseRing;
  }

  const species = artifact.speciesMeta || QUINELING_SPECIES.factorial;
  const mechanism = artifact.wovenRecord?.mechanism || species.mechanism;
  const bounds = artifact.wovenBounds || { cx: 0, cy: 0, cz: 0, width: 1.2, height: 1.2, depth: 0.4 };
  const nodeColors = artifact.nodeColors || [];
  const nodeCount = Math.max(1, nodeColors.length);
  const baseGain = artifact.wovenBody?.cloud
    ? 0.34
    : artifact.wovenBody?.familyAdapter
      ? 0.46
      : 0.62;

  artifact._phaseRingBudget = TISSUE_BUDGET;
  artifact._phaseRing = createPersistentPhaseRing(PHASE_BUCKET_COUNT, (bucketPhase) => {
    const rawFrame = WovenBody.frame(artifact.wovenBody, bucketPhase, {
      budget: TISSUE_BUDGET,
      crests: true,
      reuse: frameReuse,
    });

    const pts = rawFrame.points;
    const owners = rawFrame.owners;

    const baseTissuePos = new Float32Array(TISSUE_BUDGET * 3);
    const baseTissueWave = new Float32Array(TISSUE_BUDGET * 2);
    const baseTissueExpAlpha = new Float32Array(TISSUE_BUDGET);
    const baseTissuePearl = new Float32Array(TISSUE_BUDGET);
    const baseTissueOwner = new Uint16Array(TISSUE_BUDGET);

    for (let i = 0; i < TISSUE_BUDGET; i += 1) {
      const p4 = i * 4;
      const p3 = i * 3;
      const p2 = i * 2;
      normalizeWovenCoord(pts[p4], pts[p4 + 1], pts[p4 + 2], bounds, mechanism, vecA);
      const nx = vecA.x;
      const ny = vecA.y;
      const nz = vecA.z;
      baseTissuePos[p3] = nx;
      baseTissuePos[p3 + 1] = ny;
      baseTissuePos[p3 + 2] = nz;

      const kAngle = computeSpatialWaveAngle(nx, ny, nz, mechanism);
      baseTissueWave[p2] = Math.sin(kAngle);
      baseTissueWave[p2 + 1] = Math.cos(kAngle);

      const rawPtAlpha = pts[p4 + 3] || 0.04;
      baseTissueExpAlpha[i] = 1 - Math.exp(-2.6 * rawPtAlpha);
      baseTissuePearl[i] = rawPtAlpha > 0.20 ? clamp((rawPtAlpha - 0.20) * 0.68, 0, 0.38) : 0;
      baseTissueOwner[i] = owners[i] % nodeCount;
    }

    const ridges = rawFrame.ridges ? rawFrame.ridges.slice() : [];
    if (typeof WovenBody.strangeLoop === 'function' && artifact.wovenBody) {
      ridges.push(WovenBody.strangeLoop(artifact.wovenBody, bucketPhase, { samples: 64 }));
    }
    let totalRawSegments = 0;
    for (let rIdx = 0; rIdx < ridges.length; rIdx += 1) {
      const len = ridges[rIdx].line?.length || 0;
      if (len >= 2) totalRawSegments += len - 1;
    }
    const stepStride = totalRawSegments > MAX_RIDGE_SEGMENTS ? 2 : 1;

    // First pass: count active segments
    let segCount = 0;
    for (let rIdx = 0; rIdx < ridges.length && segCount < MAX_RIDGE_SEGMENTS; rIdx += 1) {
      const line = ridges[rIdx].line;
      if (!Array.isArray(line) || line.length < 2) continue;
      for (let j = 0; j < line.length - 1 && segCount < MAX_RIDGE_SEGMENTS; j += stepStride) {
        const nextJ = Math.min(line.length - 1, j + stepStride);
        const rawA0 = Number.isFinite(line[j].alpha) ? line[j].alpha : 0.2;
        const rawA1 = Number.isFinite(line[nextJ].alpha) ? line[nextJ].alpha : 0.2;
        if (Math.max(rawA0, rawA1) < 0.012) continue;
        segCount += 1;
      }
    }

    const baseRidgePos = new Float32Array(segCount * 6);
    const baseRidgeWave = new Float32Array(segCount * 4);
    const baseRidgeAlpha = new Float32Array(segCount * 2);
    const baseRidgeOwner = new Uint16Array(segCount);

    // Pre-sample up to SDK_RIBBON_COUNT primary ridge polylines for 3D gossamer ribbons
    const ribbonPaths = new Float32Array(SDK_RIBBON_COUNT * SDK_RIBBON_SEGMENTS * 3);
    const ribbonOwners = new Uint16Array(SDK_RIBBON_COUNT);
    let ribbonCount = 0;

    let segCursor = 0;
    for (let rIdx = 0; rIdx < ridges.length; rIdx += 1) {
      const line = ridges[rIdx].line;
      if (!Array.isArray(line) || line.length < 2) continue;
      const isParamFilament = ridges[rIdx].material === 'parameter-filament';

      if (ribbonCount < SDK_RIBBON_COUNT && line.length >= 4 && !isParamFilament) {
        const cBase = ribbonCount * SDK_RIBBON_SEGMENTS * 3;
        const maxIdx = line.length - 1;
        for (let s = 0; s < SDK_RIBBON_SEGMENTS; s += 1) {
          const sampleIdx = Math.min(maxIdx, Math.floor((s / (SDK_RIBBON_SEGMENTS - 1)) * maxIdx));
          const pt = line[sampleIdx];
          normalizeWovenCoord(pt.x, pt.y, pt.z || 0, bounds, mechanism, vecA);
          const off = cBase + s * 3;
          ribbonPaths[off] = vecA.x;
          ribbonPaths[off + 1] = vecA.y;
          ribbonPaths[off + 2] = vecA.z;
        }
        const firstPt = line[0];
        ribbonOwners[ribbonCount] =
          Number.isInteger(firstPt?.owner) && firstPt.owner >= 0
            ? firstPt.owner % nodeCount
            : rIdx % nodeCount;
        ribbonCount += 1;
      }

      const lineMax = Math.max(1, line.length - 1);
      for (let j = 0; j < line.length - 1 && segCursor < segCount; j += stepStride) {
        const nextJ = Math.min(line.length - 1, j + stepStride);
        const p0 = line[j];
        const p1 = line[nextJ];

        const rawA0 = Number.isFinite(p0.alpha) ? p0.alpha : 0.2;
        const rawA1 = Number.isFinite(p1.alpha) ? p1.alpha : 0.2;
        if (Math.max(rawA0, rawA1) < 0.012) continue;

        const taper0 = 0.24 + 0.76 * Math.pow(Math.max(0, Math.sin((j / lineMax) * Math.PI)), 0.6);
        const taper1 = 0.24 + 0.76 * Math.pow(Math.max(0, Math.sin((nextJ / lineMax) * Math.PI)), 0.6);
        const comp0 = 1 + 0.32 * Math.min(1.5, p0.compression || 0);
        const comp1 = 1 + 0.32 * Math.min(1.5, p1.compression || 0);
        const focus0 = (isParamFilament ? Math.pow(clamp(rawA0, 0, 1), 1.35) : clamp(rawA0, 0, 1)) * taper0 * comp0;
        const focus1 = (isParamFilament ? Math.pow(clamp(rawA1, 0, 1), 1.35) : clamp(rawA1, 0, 1)) * taper1 * comp1;

        normalizeWovenCoord(p0.x, p0.y, p0.z || 0, bounds, mechanism, vecA);
        normalizeWovenCoord(p1.x, p1.y, p1.z || 0, bounds, mechanism, vecB);

        const vBase = segCursor * 6;
        baseRidgePos[vBase] = vecA.x;
        baseRidgePos[vBase + 1] = vecA.y;
        baseRidgePos[vBase + 2] = vecA.z;
        baseRidgePos[vBase + 3] = vecB.x;
        baseRidgePos[vBase + 4] = vecB.y;
        baseRidgePos[vBase + 5] = vecB.z;

        const wBase = segCursor * 4;
        const k0 = computeSpatialWaveAngle(vecA.x, vecA.y, vecA.z, mechanism);
        const k1 = computeSpatialWaveAngle(vecB.x, vecB.y, vecB.z, mechanism);
        baseRidgeWave[wBase] = Math.sin(k0);
        baseRidgeWave[wBase + 1] = Math.cos(k0);
        baseRidgeWave[wBase + 2] = Math.sin(k1);
        baseRidgeWave[wBase + 3] = Math.cos(k1);

        baseRidgeAlpha[segCursor * 2] = clamp(focus0 * baseGain, 0.008, 0.92);
        baseRidgeAlpha[segCursor * 2 + 1] = clamp(focus1 * baseGain, 0.008, 0.92);
        baseRidgeOwner[segCursor] =
          Number.isInteger(p0.owner) && p0.owner >= 0
            ? p0.owner % nodeCount
            : rIdx % nodeCount;

        segCursor += 1;
      }
    }

    return {
      baseTissuePos,
      baseTissueWave,
      baseTissueExpAlpha,
      baseTissuePearl,
      baseTissueOwner,
      baseRidgePos,
      baseRidgeWave,
      baseRidgeAlpha,
      baseRidgeOwner,
      ridgeSegCount: segCursor,
      ribbonPaths,
      ribbonOwners,
      ribbonCount,
    };
  });

  return artifact._phaseRing;
}

/**
 * Builds the 3D `nursery.html` `WovenBody` Quineling Subsystem (`Designer 8`).
 * Replaces all cartoon animal sculptures with the genuine mathematical `WovenBody`
 * tissue field, caustic/crest filaments, gossamer manifold ribbons, `WovenBody.anchor`
 * operation nodes, and `quineling-chroma-1` RGB genome spores.
 */
export function createQuinelingSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer8_QuinelingCore';

  const coreRoot = new THREE.Group();
  coreRoot.name = 'QuinelingOrganismRoot';
  coreRoot.position.set(0, QUINELING_CORE_Y, 0);
  group.add(coreRoot);

  // Studio illumination for the translucent mathematical tissue
  const corePointLight = new THREE.PointLight(0x72d9e2, 0.85, 2.4, 1.5);
  corePointLight.position.set(0, 0.06, 0.08);
  coreRoot.add(corePointLight);

  const rimPointLight = new THREE.PointLight(0x9ad7ff, 0.45, 2.4, 1.5);
  rimPointLight.position.set(0.22, 0.18, 0.26);
  coreRoot.add(rimPointLight);

  // Backwards-compatible species sub-groups map for inspection & telemetry hooks
  const speciesGroups = {};
  for (const spKey of Object.keys(QUINELING_SPECIES)) {
    const sg = new THREE.Group();
    sg.name = `WovenSpecies_${spKey}`;
    sg.visible = spKey === 'factorial';
    coreRoot.add(sg);
    speciesGroups[spKey] = sg;
  }

  // ==========================================================================
  // 1. PRIMARY `WovenBody` GOSSAMER TISSUE CLOUD (`THREE.Points`, 8192 samples)
  // ==========================================================================
  const tissueGeom = new THREE.BufferGeometry();
  const tissuePositions = new Float32Array(TISSUE_BUDGET * 3);
  const tissueColors = new Float32Array(TISSUE_BUDGET * 3);
  const tissueUvs = new Float32Array(TISSUE_BUDGET * 2);
  tissueUvs.fill(0.5);
  tissueGeom.setAttribute('position', new THREE.BufferAttribute(tissuePositions, 3));
  tissueGeom.setAttribute('color', new THREE.BufferAttribute(tissueColors, 3));
  tissueGeom.setAttribute('uv', new THREE.BufferAttribute(tissueUvs, 2));

  const tissueMat = new THREE.PointsMaterial({
    size: IS_MOBILE_RUNTIME ? 0.0175 : 0.0148,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    toneMapped: false,
  });
  const _raycastSphere = new THREE.Sphere(new THREE.Vector3(0, QUINELING_CORE_Y, 0), QUINELING_MAX_RADIUS * 0.85);
  const _raycastHitPoint = new THREE.Vector3();
  const NOOP_RAYCAST = () => {};

  const tissuePointsMesh = new THREE.Points(tissueGeom, tissueMat);
  tissuePointsMesh.name = 'WovenBody_TissueCloud';
  tissuePointsMesh.frustumCulled = false;
  tissuePointsMesh.raycast = function fastWovenBodyRaycast(raycaster, intersects) {
    if (!this.visible) return;
    _raycastSphere.center.setFromMatrixPosition(this.matrixWorld);
    _raycastSphere.radius = QUINELING_MAX_RADIUS * 0.85;
    if (raycaster.ray.intersectSphere(_raycastSphere, _raycastHitPoint)) {
      intersects.push({
        distance: raycaster.ray.origin.distanceTo(_raycastHitPoint),
        point: _raycastHitPoint.clone(),
        object: this,
      });
    }
  };
  tagInspectable(tissuePointsMesh, {
    type: 'quineling-tissue',
    id: 'woven-body-tissue-cloud',
    title: 'WovenBody Mathematical Tissue Field',
    subtitle: 'nursery.html // WovenBody.frame',
    details: 'High-density real-time points sampled from WovenBody.frame(wovenBody, phase) and colored by Chroma.colorFor(shape, owner).',
  });
  coreRoot.add(tissuePointsMesh);

  // ==========================================================================
  // 2. PRIMARY `WovenBody` CAUSTIC & CREST FILAMENTS (`THREE.LineSegments`)
  // ==========================================================================
  const ridgeLineGeom = new THREE.BufferGeometry();
  const ridgeLinePositions = new Float32Array(MAX_RIDGE_VERTICES * 3);
  const ridgeLineColors = new Float32Array(MAX_RIDGE_VERTICES * 3);
  ridgeLineGeom.setAttribute('position', new THREE.BufferAttribute(ridgeLinePositions, 3));
  ridgeLineGeom.setAttribute('color', new THREE.BufferAttribute(ridgeLineColors, 3));
  ridgeLineGeom.setDrawRange(0, 0);

  const ridgeLineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const ridgeLineSegments = new THREE.LineSegments(ridgeLineGeom, ridgeLineMat);
  ridgeLineSegments.name = 'WovenBody_CausticRidges';
  ridgeLineSegments.frustumCulled = false;
  ridgeLineSegments.raycast = NOOP_RAYCAST;
  tagInspectable(ridgeLineSegments, {
    type: 'quineling-ridges',
    id: 'woven-body-caustic-ridges',
    title: 'WovenBody Caustic & Crest Filaments',
    subtitle: 'nursery.html // frame.ridges',
    details: 'Exact mathematical ridges from WovenBody.frame: critical curves, Julia escape contours, Jacobian caustics, and parameter filaments.',
  });
  coreRoot.add(ridgeLineSegments);

  // ==========================================================================
  // 3. 3D `WovenBody` GOSSAMER RIBBON STRIPS (`sdkManifoldRibbonMesh`)
  // ==========================================================================
  const sdkRibbonGeom = new THREE.BufferGeometry();
  const sdkRibbonPositions = new Float32Array(SDK_RIBBON_VERTEX_COUNT * 3);
  const sdkRibbonColors = new Float32Array(SDK_RIBBON_VERTEX_COUNT * 3);
  const sdkRibbonNormals = new Float32Array(SDK_RIBBON_VERTEX_COUNT * 3);
  const sdkRibbonUvs = new Float32Array(SDK_RIBBON_VERTEX_COUNT * 2);
  sdkRibbonGeom.setAttribute('position', new THREE.BufferAttribute(sdkRibbonPositions, 3));
  sdkRibbonGeom.setAttribute('color', new THREE.BufferAttribute(sdkRibbonColors, 3));
  sdkRibbonGeom.setAttribute('normal', new THREE.BufferAttribute(sdkRibbonNormals, 3));
  sdkRibbonGeom.setAttribute('uv', new THREE.BufferAttribute(sdkRibbonUvs, 2));
  sdkRibbonGeom.setIndex(buildRibbonIndices(SDK_RIBBON_COUNT, SDK_RIBBON_SEGMENTS));

  const sdkRibbonMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: new THREE.Color(0x0b1f2e),
    emissiveIntensity: 0.42,
    roughness: 0.32,
    metalness: 0.04,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sdkManifoldRibbonMesh = new THREE.Mesh(sdkRibbonGeom, sdkRibbonMat);
  sdkManifoldRibbonMesh.name = 'WovenBody_GossamerRibbons';
  sdkManifoldRibbonMesh.frustumCulled = false;
  sdkManifoldRibbonMesh.visible = true;
  sdkManifoldRibbonMesh.raycast = NOOP_RAYCAST;
  tagInspectable(sdkManifoldRibbonMesh, {
    type: 'quineling-ribbons',
    id: 'woven-body-gossamer-ribbons',
    title: 'WovenBody 3D Gossamer Ribbons',
    subtitle: 'WovenBody // 3D Ribbon Chart',
    details: 'Translucent 3D ribbon strips tracing the primary mathematical ridges of the active WovenBody manifold.',
  });
  coreRoot.add(sdkManifoldRibbonMesh);

  // ==========================================================================
  // 4. OPERATION ANCHOR NODES (`WovenBody.anchor`) & DEPENDENCY ARCS
  // ==========================================================================
  const anchorNodeGeom = new THREE.SphereGeometry(0.0085, 10, 8);
  const anchorNodeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 1.15,
    roughness: 0.22,
    metalness: 0.1,
    transparent: true,
    opacity: 0.92,
  });
  const anchorNodeMesh = new THREE.InstancedMesh(anchorNodeGeom, anchorNodeMat, MAX_ANCHOR_NODES);
  anchorNodeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  anchorNodeMesh.name = 'WovenBody_OperationAnchors';
  anchorNodeMesh.frustumCulled = false;
  anchorNodeMesh.visible = true;
  anchorNodeMesh.raycast = NOOP_RAYCAST;
  tagInspectable(anchorNodeMesh, {
    type: 'quineling-anchors',
    id: 'woven-body-operation-anchors',
    title: 'Quinelings Operation Territory Anchors',
    subtitle: 'WovenBody.anchor // Quinelings.describe',
    details: 'Operation nodes positioned on the 3D manifold via WovenBody.anchor(wovenBody, nodeId, phase) and lit when active in the Sherlock CEK trace.',
  });
  coreRoot.add(anchorNodeMesh);

  const depArcGeom = new THREE.BufferGeometry();
  const depArcPositions = new Float32Array(MAX_ARC_VERTICES * 3);
  const depArcColors = new Float32Array(MAX_ARC_VERTICES * 3);
  depArcGeom.setAttribute('position', new THREE.BufferAttribute(depArcPositions, 3));
  depArcGeom.setAttribute('color', new THREE.BufferAttribute(depArcColors, 3));
  depArcGeom.setDrawRange(0, 0);

  const depArcMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.52,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const depArcLines = new THREE.LineSegments(depArcGeom, depArcMat);
  depArcLines.name = 'WovenBody_DependencyArcs';
  depArcLines.frustumCulled = false;
  depArcLines.visible = true;
  depArcLines.raycast = NOOP_RAYCAST;
  coreRoot.add(depArcLines);

  // ==========================================================================
  // 5. 64 RGB GENOME SPORES (`Quinelings.encodeColors` -> `quineling-chroma-1`)
  // ==========================================================================
  const sporeGeom = new THREE.OctahedronGeometry(0.0055, 0);
  const sporeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.95,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.82,
  });
  const sporeMesh = new THREE.InstancedMesh(sporeGeom, sporeMat, SPORE_COUNT);
  sporeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  sporeMesh.name = 'Quineling_ChromaGenomeSpores';
  sporeMesh.frustumCulled = false;
  sporeMesh.visible = true;
  sporeMesh.raycast = NOOP_RAYCAST;
  tagInspectable(sporeMesh, {
    type: 'quineling-spores',
    id: 'quineling-chroma-genome-spores',
    title: 'quineling-chroma-1 Exact Byte Spores',
    subtitle: 'Quinelings.encodeColors // quineling-chroma-1',
    details: '64 exact RGB byte triplets from Quinelings.encodeColors(quineProgram) drifting across the WovenBody manifold.',
  });
  coreRoot.add(sporeMesh);

  // ==========================================================================
  // 6. PERIMETER CHAMBER TENDRILS (Connecting Atrium Boundary to Rings/Floor)
  // ==========================================================================
  const tendrilGeom = new THREE.BufferGeometry();
  const tendrilPositions = new Float32Array(TENDRIL_VERTEX_COUNT * 3);
  const tendrilColors = new Float32Array(TENDRIL_VERTEX_COUNT * 3);
  const tendrilNormals = new Float32Array(TENDRIL_VERTEX_COUNT * 3);
  const tendrilUvs = new Float32Array(TENDRIL_VERTEX_COUNT * 2);
  tendrilGeom.setAttribute('position', new THREE.BufferAttribute(tendrilPositions, 3));
  tendrilGeom.setAttribute('color', new THREE.BufferAttribute(tendrilColors, 3));
  tendrilGeom.setAttribute('normal', new THREE.BufferAttribute(tendrilNormals, 3));
  tendrilGeom.setAttribute('uv', new THREE.BufferAttribute(tendrilUvs, 2));
  tendrilGeom.setIndex(buildRibbonIndices(TENDRIL_CURVE_COUNT, TENDRIL_SEGMENTS));

  const tendrilMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    vertexColors: true,
    emissive: new THREE.Color(0x0c2135),
    emissiveIntensity: 0.65,
    roughness: 0.36,
    metalness: 0.08,
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const tendrilMesh = new THREE.Mesh(tendrilGeom, tendrilMat);
  tendrilMesh.name = 'Quineling_AtriumTendrils';
  tendrilMesh.frustumCulled = false;
  tendrilMesh.visible = true;
  tendrilMesh.raycast = NOOP_RAYCAST;
  coreRoot.add(tendrilMesh);

  // ==========================================================================
  // PREALLOCATED SCRATCH BUFFERS (ZERO PER-FRAME ALLOCATIONS)
  // ==========================================================================
  const _frameReuse = {
    points: new Float32Array(TISSUE_BUDGET * 4),
    owners: new Uint16Array(TISSUE_BUDGET),
  };
  const _sdkPts = Array.from({ length: SDK_RIBBON_SEGMENTS }, () => new THREE.Vector3());
  const _tendrilPts = Array.from({ length: TENDRIL_SEGMENTS }, () => new THREE.Vector3());
  const _anchorPositions = Array.from({ length: MAX_ANCHOR_NODES }, () => new THREE.Vector3());
  const _nodeBaseR = new Float32Array(64);
  const _nodeBaseG = new Float32Array(64);
  const _nodeBaseB = new Float32Array(64);
  const _ridgeBaseR = new Float32Array(64);
  const _ridgeBaseG = new Float32Array(64);
  const _ridgeBaseB = new Float32Array(64);
  const _nodeExecGain = new Float32Array(64);
  const _nodeExecZShift = new Float32Array(64);
  const _dampedNodeGain = new Float32Array(64).fill(0.75);
  const _dampedNodeZShift = new Float32Array(64);
  const _vecA = new THREE.Vector3();
  const _vecB = new THREE.Vector3();
  const _dummy = new THREE.Object3D();
  const _color = new THREE.Color();
  const _faultColor = new THREE.Color(0xe11d48);

  let dampedYOffset = 0;
  let dampedBaseY = QUINELING_CORE_Y;
  let dampedOmega = 1.65;
  let dampedRotYOffset = 0;
  let accumPhase = 0;
  let stepSurgeVel = 0;
  let lastStepIndex = -1;
  let lastBucketLookupFrame = -10;
  let frameCounter = 0;
  let currentBucket = null;

  function update(stepState = {}, ambientArg = 0, dtArg = 0.016) {
    const ambient = stepState?.ambient ?? ambientArg;
    const dt = clamp(stepState?.dt ?? dtArg, 0.001, 0.05);
    const artifact = resolveCompiledQuineling(stepState);
    const species = artifact.speciesMeta || QUINELING_SPECIES.factorial;
    const speciesId = species.id;
    const mechanism = artifact.wovenRecord?.mechanism || species.mechanism;
    const bounds = artifact.wovenBounds || { cx: 0, cy: 0, cz: 0, width: 1.2, height: 1.2, depth: 0.4 };
    const design = artifact.design;

    // Dynamic DPR & viewport-height point size scaling for crisp retina luminance
    const effDpr = stepState.effectiveDpr || 1.75;
    const vpHeight = stepState.viewportHeight || 680;
    const dprBoost = effDpr < 1.6 ? 1.18 : 1.0;
    const heightBoost = clamp(680 / Math.max(360, vpHeight), 0.92, 1.25);
    const targetPointSize = (IS_MOBILE_RUNTIME ? 0.0175 : 0.0148) * dprBoost * heightBoost;
    if (Math.abs(tissueMat.size - targetPointSize) > 0.0004) {
      tissueMat.size = targetPointSize;
    }

    // Toggle active species marker group
    for (const [key, sg] of Object.entries(speciesGroups)) {
      sg.visible = key === speciesId;
    }

    const step = stepState.step ?? null;
    const stepIndex = stepState.stepIndex ?? 0;
    const rawSub = clamp(stepState.sub ?? 1, 0, 1);
    const q = quinticStep(rawSub);
    const ruleLine = step?.ruleLine ?? 80;
    const ruleId = step?.ruleId || `A${String(ruleLine).padStart(3, '0')}`;
    const activeCalls = step?.after?.activeCalls ?? [];
    const callDepth = activeCalls.length;

    const preFuel = step?.before?.fuel ?? 20;
    const postFuel = step?.after?.fuel ?? preFuel;
    const initialFuel = Math.max(1, stepState.trace?.steps?.[0]?.before?.fuel ?? 20);
    const liveFuelRatio = clamp(lerp(preFuel, postFuel, q) / initialFuel, 0, 1);

    const isDone = ruleLine === 80 || ruleId === 'A080';
    const isFault = ruleLine === 82 || ruleLine === 140 || ruleLine === 225;
    const isExhausted = ruleLine === 84 || ruleId === 'A084';
    const isInPlaceRewrite = ruleLine === 149 || ruleLine === 145 || ruleLine === 177;

    // Smooth laminar step-transition flow (zero sawtooth phase-velocity lurches)
    if (stepIndex !== lastStepIndex) {
      if (lastStepIndex !== -1) {
        stepSurgeVel = Math.min(0.42, stepSurgeVel + 0.14);
      }
      lastStepIndex = stepIndex;
    }
    stepSurgeVel *= Math.exp(-dt * 4.2);

    // Restore upstream QDL 24x phase timebase (`phaseRate * 24`) + mechanism velocity gain
    const rawPhaseRate = design?.motion?.phaseRate ?? 0.034;
    const qdlPhaseSpeed = rawPhaseRate < 0.15 ? rawPhaseRate * 24.0 : rawPhaseRate * 3.8;
    const mechGain = MECHANISM_VELOCITY_GAIN[mechanism] ?? 2.1;
    const fuelMod = isExhausted ? 0.34 : 0.76 + 0.40 * liveFuelRatio;
    const targetOmega = qdlPhaseSpeed * mechGain * fuelMod + stepSurgeVel;
    dampedOmega = lerp(dampedOmega, targetOmega, 1 - Math.exp(-dt * 4.5));

    accumPhase = (accumPhase + dt * dampedOmega) % (TAU * 64);
    const wovenPhase = evaluateProgramRhythmPhase(design, accumPhase);

    const rhythm = design?.motion?.rhythm;
    const breathAmp = (rhythm?.breath ?? 0.14) * 0.16;
    const asymTilt = (rhythm?.asymmetry ?? 0.1) * 0.26;

    // Preset-driven bore levitation:
    // - In `well` (Top Rings), levitate to y = -0.74 directly beneath the sapphire aperture!
    // - In `overview`, levitate to y = -0.96 so the Quineling is visible through the open bore!
    // - In `quineling`, `interior`, `frames`, etc., rest at QUINELING_CORE_Y (-2.06) in the core!
    const cameraPreset = stepState.cameraPreset || 'overview';
    const presetBaseY =
      cameraPreset === 'well'
        ? -0.74
        : cameraPreset === 'overview'
          ? -0.96
          : QUINELING_CORE_Y;
    dampedBaseY = lerp(dampedBaseY, presetBaseY, 1 - Math.exp(-dt * 6.5));

    const targetYOffset = clamp((callDepth - 1) * 0.014, -0.05, 0.06);
    dampedYOffset = lerp(dampedYOffset, targetYOffset, 1 - Math.exp(-dt * 8.0));

    const targetRotYOffset = isInPlaceRewrite ? 0.08 : 0.0;
    dampedRotYOffset = lerp(dampedRotYOffset, targetRotYOffset, 1 - Math.exp(-dt * 4.0));

    coreRoot.position.y =
      dampedBaseY +
      dampedYOffset +
      (Math.sin(wovenPhase) + 0.18 * Math.sin(2 * wovenPhase - 0.65)) * breathAmp;
    coreRoot.rotation.y =
      ambient * 0.32 +
      Math.sin(wovenPhase * 0.55) * 0.26 +
      dampedRotYOffset;
    coreRoot.rotation.x = Math.cos(wovenPhase * 0.7) * asymTilt * 0.30;
    coreRoot.rotation.z = Math.sin(wovenPhase * 0.5) * asymTilt * 0.20;

    const breathScale =
      1.0 +
      (Math.sin(wovenPhase) + 0.16 * Math.sin(2 * wovenPhase - 0.65)) *
        (rhythm?.breath ?? 0.12) *
        0.13;
    coreRoot.scale.setScalar(breathScale);

    // Primary node color for core studio light
    const primaryNodeHex = artifact.nodeColors?.[0]?.hex || species.accentCss;
    _color.set(primaryNodeHex);
    if (isFault) _color.setHex(ROLES_1_HEX.faultCrimson);
    else if (isDone) _color.setHex(ROLES_1_HEX.reportGreen);
    corePointLight.color.copy(_color);
    corePointLight.intensity = isDone ? 1.35 : isFault ? 1.45 : isExhausted ? 0.45 : 1.05 + callDepth * 0.06;

    // Active AST expression -> Quinelings operation node ownership highlight
    const activeExprId =
      step?.after?.control?.exprId ??
      step?.before?.control?.exprId ??
      null;
    const activeNodeId =
      activeExprId !== null && artifact.exprToNodeId?.has(activeExprId)
        ? artifact.exprToNodeId.get(activeExprId)
        : null;
    const activeNodeEntry =
      activeNodeId && artifact.nodesById?.has(activeNodeId)
        ? artifact.nodesById.get(activeNodeId)
        : null;
    const activeNodeIdx = activeNodeEntry
      ? activeNodeEntry.index
      : stepIndex % Math.max(1, artifact.graph.nodes.length);

    // ========================================================================
    // 1. PERSISTENT FUNCTIONAL PHASE RING (`PersistentPhaseRing` over S^1)
    //    Cold buckets are solved at most once every 3 frames during the first
    //    2π cycle; once adjacent buckets (idx0, idx1) are warm, we smoothly
    //    interpolate between bucketA and bucketB with C^2 quintic blend!
    // ========================================================================
    frameCounter += 1;
    const phaseRing = ensureArtifactPhaseRing(artifact, _frameReuse, _vecA, _vecB);
    const bCount = phaseRing.bucketCount || PHASE_BUCKET_COUNT;
    const normPhase = ((wovenPhase % TAU) + TAU) % TAU;
    const exactBucket = (normPhase / TAU) * bCount;
    const idx0 = Math.floor(exactBucket) % bCount;
    const idx1 = (idx0 + 1) % bCount;
    const rawFrac = exactBucket - Math.floor(exactBucket);
    const smoothFrac = quinticStep(rawFrac);

    const warm0 = phaseRing.buckets[idx0];
    const warm1 = phaseRing.buckets[idx1];
    if (warm0 !== null || !currentBucket || frameCounter - lastBucketLookupFrame >= 3) {
      if (warm0 === null) {
        lastBucketLookupFrame = frameCounter;
      }
      currentBucket = warm0 || phaseRing.getNearest(wovenPhase).bucket;
    } else if (warm1 === null && frameCounter - lastBucketLookupFrame >= 3) {
      lastBucketLookupFrame = frameCounter;
      phaseRing.getBucket(idx1);
    }

    const bucketA = warm0 || currentBucket;
    const bucketB = warm0 && warm1 ? warm1 : bucketA;
    const useSubBucketBlend = bucketB !== bucketA;
    const invFrac = 1 - smoothFrac;

    const baseTissuePosA = bucketA.baseTissuePos;
    const baseTissuePosB = bucketB.baseTissuePos;
    const baseTissueWave = bucketA.baseTissueWave;
    const baseTissueExpAlphaA = bucketA.baseTissueExpAlpha;
    const baseTissueExpAlphaB = bucketB.baseTissueExpAlpha;
    const baseTissuePearl = bucketA.baseTissuePearl;
    const baseTissueOwner = bucketA.baseTissueOwner;
    const nodeColors = artifact.nodeColors || [];
    const nodeCount = Math.min(64, Math.max(1, nodeColors.length));

    // Precompute per-frame trig for traveling wave sin(k - 2.5*phi) & cos(k - 2.5*phi)
    const sinPhi = Math.sin(wovenPhase * 2.35);
    const cosPhi = Math.cos(wovenPhase * 2.35);

    const nodeBaseR = _nodeBaseR;
    const nodeBaseG = _nodeBaseG;
    const nodeBaseB = _nodeBaseB;
    const ridgeBaseR = _ridgeBaseR;
    const ridgeBaseG = _ridgeBaseG;
    const ridgeBaseB = _ridgeBaseB;

    for (let n = 0; n < nodeCount; n += 1) {
      const rgb = nodeColors[n]?.rgb || [114, 217, 226];
      let tr = rgb[0] / 255;
      let tg = rgb[1] / 255;
      let tb = rgb[2] / 255;
      let rr = tr * 0.86 + 0.933 * 0.14;
      let rg = tg * 0.86 + 0.949 * 0.14;
      let rb = tb * 0.86 + 0.925 * 0.14;

      if (isFault) {
        tr = lerp(tr, 0.92, 0.58);
        tg *= 0.34;
        tb *= 0.38;
        rr = lerp(rr, 0.92, 0.58);
        rg *= 0.34;
        rb *= 0.38;
      } else if (isExhausted) {
        const tGray = (tr + tg + tb) * 0.333;
        tr = tGray * 0.55;
        tg = tGray * 0.6;
        tb = tGray * 0.68;
        const rGray = (rr + rg + rb) * 0.333;
        rr = rGray * 0.55;
        rg = rGray * 0.6;
        rb = rGray * 0.68;
      }
      nodeBaseR[n] = tr;
      nodeBaseG[n] = tg;
      nodeBaseB[n] = tb;
      ridgeBaseR[n] = rr;
      ridgeBaseG[n] = rg;
      ridgeBaseB[n] = rb;
    }

    const nodeExecGain = _nodeExecGain;
    const nodeExecZShift = _nodeExecZShift;
    const dampedNodeGain = _dampedNodeGain;
    const dampedNodeZShift = _dampedNodeZShift;
    const stepResp =
      typeof WovenBody.stepResponse === 'function' && artifact.wovenBody
        ? WovenBody.stepResponse(artifact.wovenBody, wovenPhase, {
            activeOwner: activeNodeIdx,
            callDepth,
            fuelRatio: liveFuelRatio,
            outcome: isFault ? 'Rejected' : isExhausted ? 'Exhausted' : isDone ? 'Done' : 'Running',
            stepIndex,
          })
        : null;
    const gainsArr = stepResp?.ownerGain || stepResp?.ownerGains;
    const zShiftsArr = stepResp?.ownerZShift || stepResp?.ownerZShifts;
    const nodeDecay = 1 - Math.exp(-dt * 7.5);
    for (let n = 0; n < nodeCount; n += 1) {
      const targetGain = gainsArr && gainsArr[n] !== undefined
        ? gainsArr[n]
        : n === activeNodeIdx ? 1.14 : 0.72;
      const targetZ = zShiftsArr && zShiftsArr[n] !== undefined
        ? zShiftsArr[n]
        : 0;
      dampedNodeGain[n] = lerp(dampedNodeGain[n], targetGain, nodeDecay);
      dampedNodeZShift[n] = lerp(dampedNodeZShift[n], targetZ, nodeDecay);
      nodeExecGain[n] = dampedNodeGain[n];
      nodeExecZShift[n] = dampedNodeZShift[n];
    }

    // ========================================================================
    // 2. EVERY-FRAME 60/120FPS 3D LAMINAR WAVE ADVECTION & AERIAL PERSPECTIVE
    //    Zero transcendental calls inside the loop!
    // ========================================================================
    for (let i = 0; i < TISSUE_BUDGET; i += 1) {
      const p3 = i * 3;
      const p2 = i * 2;
      const bx = useSubBucketBlend
        ? baseTissuePosA[p3] * invFrac + baseTissuePosB[p3] * smoothFrac
        : baseTissuePosA[p3];
      const by = useSubBucketBlend
        ? baseTissuePosA[p3 + 1] * invFrac + baseTissuePosB[p3 + 1] * smoothFrac
        : baseTissuePosA[p3 + 1];
      const bz = useSubBucketBlend
        ? baseTissuePosA[p3 + 2] * invFrac + baseTissuePosB[p3 + 2] * smoothFrac
        : baseTissuePosA[p3 + 2];

      const sinK = baseTissueWave[p2];
      const cosK = baseTissueWave[p2 + 1];
      const waveS = sinK * cosPhi - cosK * sinPhi;
      const waveC = cosK * cosPhi + sinK * sinPhi;

      const ownerIdx = baseTissueOwner[i];
      const execZ = nodeExecZShift[ownerIdx] || 0;
      // Divergence-free laminar tangential + normal micro-advection
      const px = bx + bx * 0.036 * waveS - by * 0.028 * waveC;
      const py = by + by * 0.036 * waveS + bx * 0.028 * waveC;
      const pz = bz + 0.042 * waveS + 0.018 * waveC + execZ * 0.32;

      tissuePositions[p3] = px;
      tissuePositions[p3 + 1] = py;
      tissuePositions[p3 + 2] = pz;

      // Aerial perspective depth law: z < 0 attenuates & shifts toward abyssal indigo;
      // z > 0 catches warm pearlescent Fresnel rim glint; AgX soft-knee prevents blowout
      const zNorm = clamp(pz * 1.45, -1, 1);
      const depthShade = zNorm < 0 ? 1.0 + zNorm * 0.46 : 1.0 + zNorm * 0.28;
      const activeFactor = 0.74 + 0.26 * (nodeExecGain[ownerIdx] || 1);
      const rawA = useSubBucketBlend
        ? baseTissueExpAlphaA[i] * invFrac + baseTissueExpAlphaB[i] * smoothFrac
        : baseTissueExpAlphaA[i];
      const linearA = rawA * activeFactor * depthShade;
      // AgX / ACES soft-knee highlight roll-off
      let a = linearA / Math.sqrt(1 + 0.55 * linearA * linearA);
      if (a < 0.038) a = 0.038;
      else if (a > 0.92) a = 0.92;

      const pearlBoost = clamp(baseTissuePearl[i] + (zNorm > 0 ? zNorm * zNorm * 0.22 : 0), 0, 0.46);
      const indigoShift = zNorm < 0 ? -zNorm * 0.32 : 0;
      const invPearl = 1 - pearlBoost;
      let cr = nodeBaseR[ownerIdx] * invPearl + 1.0 * pearlBoost;
      let cg = nodeBaseG[ownerIdx] * invPearl + 0.969 * pearlBoost;
      let cb = nodeBaseB[ownerIdx] * invPearl + 0.910 * pearlBoost;
      if (indigoShift > 0) {
        const invInd = 1 - indigoShift;
        cr = cr * invInd + 0.055 * indigoShift;
        cg = cg * invInd + 0.094 * indigoShift;
        cb = cb * invInd + 0.220 * indigoShift;
      }
      tissueColors[p3] = cr * a;
      tissueColors[p3 + 1] = cg * a;
      tissueColors[p3 + 2] = cb * a;
    }
    tissueGeom.attributes.position.needsUpdate = true;
    tissueGeom.attributes.color.needsUpdate = true;

    // ========================================================================
    // 3. EVERY-FRAME 60/120FPS 3D TRAVELING-WAVE ADVECTION ON CAUSTIC RIDGES
    //    Zero transcendental calls inside the loop!
    // ========================================================================
    const baseRidgePos = bucketA.baseRidgePos;
    const baseRidgeWave = bucketA.baseRidgeWave;
    const baseRidgeAlpha = bucketA.baseRidgeAlpha;
    const baseRidgeOwner = bucketA.baseRidgeOwner;
    const ridgeSegCount = bucketA.ridgeSegCount;

    for (let segIdx = 0; segIdx < ridgeSegCount; segIdx += 1) {
      const vBase = segIdx * 6;
      const wBase = segIdx * 4;
      const aBase = segIdx * 2;
      const ownerIdx = baseRidgeOwner[segIdx];
      const execZ = (nodeExecZShift[ownerIdx] || 0) * 0.32;

      const bx0 = baseRidgePos[vBase];
      const by0 = baseRidgePos[vBase + 1];
      const bz0 = baseRidgePos[vBase + 2];
      const sinK0 = baseRidgeWave[wBase];
      const cosK0 = baseRidgeWave[wBase + 1];
      const waveS0 = sinK0 * cosPhi - cosK0 * sinPhi;
      const waveC0 = cosK0 * cosPhi + sinK0 * sinPhi;

      const bx1 = baseRidgePos[vBase + 3];
      const by1 = baseRidgePos[vBase + 4];
      const bz1 = baseRidgePos[vBase + 5];
      const sinK1 = baseRidgeWave[wBase + 2];
      const cosK1 = baseRidgeWave[wBase + 3];
      const waveS1 = sinK1 * cosPhi - cosK1 * sinPhi;
      const waveC1 = cosK1 * cosPhi + sinK1 * sinPhi;

      const pz0 = bz0 + 0.042 * waveS0 + 0.018 * waveC0 + execZ;
      const pz1 = bz1 + 0.042 * waveS1 + 0.018 * waveC1 + execZ;

      ridgeLinePositions[vBase] = bx0 + bx0 * 0.036 * waveS0 - by0 * 0.028 * waveC0;
      ridgeLinePositions[vBase + 1] = by0 + by0 * 0.036 * waveS0 + bx0 * 0.028 * waveC0;
      ridgeLinePositions[vBase + 2] = pz0;
      ridgeLinePositions[vBase + 3] = bx1 + bx1 * 0.036 * waveS1 - by1 * 0.028 * waveC1;
      ridgeLinePositions[vBase + 4] = by1 + by1 * 0.036 * waveS1 + bx1 * 0.028 * waveC1;
      ridgeLinePositions[vBase + 5] = pz1;

      const zNorm0 = clamp(pz0 * 1.45, -1, 1);
      const zNorm1 = clamp(pz1 * 1.45, -1, 1);
      const depthBoost0 = zNorm0 < 0 ? 1.0 + zNorm0 * 0.48 : 1.0 + zNorm0 * 0.34;
      const depthBoost1 = zNorm1 < 0 ? 1.0 + zNorm1 * 0.48 : 1.0 + zNorm1 * 0.34;
      const activeBoost = 0.86 + 0.24 * (nodeExecGain[ownerIdx] || 1);

      const linA0 = baseRidgeAlpha[aBase] * activeBoost * depthBoost0;
      const linA1 = baseRidgeAlpha[aBase + 1] * activeBoost * depthBoost1;
      const a0 = Math.min(0.92, linA0 / Math.sqrt(1 + 0.55 * linA0 * linA0));
      const a1 = Math.min(0.92, linA1 / Math.sqrt(1 + 0.55 * linA1 * linA1));

      const baseR = ridgeBaseR[ownerIdx];
      const baseG = ridgeBaseG[ownerIdx];
      const baseB = ridgeBaseB[ownerIdx];
      const glint0 = zNorm0 > 0 ? zNorm0 * 0.18 : 0;
      const glint1 = zNorm1 > 0 ? zNorm1 * 0.18 : 0;

      ridgeLineColors[vBase] = (baseR * (1 - glint0) + glint0) * a0;
      ridgeLineColors[vBase + 1] = (baseG * (1 - glint0) + 0.97 * glint0) * a0;
      ridgeLineColors[vBase + 2] = (baseB * (1 - glint0) + 0.91 * glint0) * a0;
      ridgeLineColors[vBase + 3] = (baseR * (1 - glint1) + glint1) * a1;
      ridgeLineColors[vBase + 4] = (baseG * (1 - glint1) + 0.97 * glint1) * a1;
      ridgeLineColors[vBase + 5] = (baseB * (1 - glint1) + 0.91 * glint1) * a1;
    }
    ridgeLineGeom.setDrawRange(0, ridgeSegCount * 2);
    ridgeLineGeom.attributes.position.needsUpdate = true;
    ridgeLineGeom.attributes.color.needsUpdate = true;

    // ========================================================================
    // 4. 3D GOSSAMER RIBBON STRIPS (`sdkManifoldRibbonMesh`)
    // ========================================================================
    if (sdkManifoldRibbonMesh.visible && bucketA.ribbonPaths) {
      const rPathsA = bucketA.ribbonPaths;
      const rPathsB = bucketB.ribbonPaths || rPathsA;
      const rOwners = bucketA.ribbonOwners;
      const rCount = bucketA.ribbonCount || 0;
      const canBlendRibbons = useSubBucketBlend && bucketB.ribbonCount === rCount;
      for (let c = 0; c < SDK_RIBBON_COUNT; c += 1) {
        if (c < rCount) {
          const cBase = c * SDK_RIBBON_SEGMENTS * 3;
          for (let s = 0; s < SDK_RIBBON_SEGMENTS; s += 1) {
            const off = cBase + s * 3;
            const bx = canBlendRibbons ? rPathsA[off] * invFrac + rPathsB[off] * smoothFrac : rPathsA[off];
            const by = canBlendRibbons ? rPathsA[off + 1] * invFrac + rPathsB[off + 1] * smoothFrac : rPathsA[off + 1];
            const bz = canBlendRibbons ? rPathsA[off + 2] * invFrac + rPathsB[off + 2] * smoothFrac : rPathsA[off + 2];
            const wave = Math.sin(s * 0.35 - wovenPhase * 2.35 + c * 0.6) * 0.014;
            _sdkPts[s].set(bx + bx * wave, by + by * wave, bz + wave * 1.2);
          }
          const ownerIdx = rOwners[c] % nodeCount;
          const isAct = ownerIdx === activeNodeIdx;
          const hw = isAct ? 0.0082 : 0.0050;
          writeRibbonStrip(
            sdkRibbonPositions,
            sdkRibbonColors,
            sdkRibbonNormals,
            sdkRibbonUvs,
            c,
            SDK_RIBBON_SEGMENTS,
            _sdkPts,
            hw,
            ridgeBaseR[ownerIdx],
            ridgeBaseG[ownerIdx],
            ridgeBaseB[ownerIdx]
          );
        } else {
          for (let s = 0; s < SDK_RIBBON_SEGMENTS; s += 1) {
            _sdkPts[s].set(0, 0, 0);
          }
          writeRibbonStrip(
            sdkRibbonPositions,
            sdkRibbonColors,
            sdkRibbonNormals,
            sdkRibbonUvs,
            c,
            SDK_RIBBON_SEGMENTS,
            _sdkPts,
            0,
            0,
            0,
            0
          );
        }
      }
      sdkRibbonGeom.attributes.position.needsUpdate = true;
      sdkRibbonGeom.attributes.color.needsUpdate = true;
      sdkRibbonGeom.attributes.normal.needsUpdate = true;
      sdkRibbonGeom.attributes.uv.needsUpdate = true;
    }

    // ========================================================================
    // 5. OPERATION ANCHOR NODES & DEPENDENCY ARCS (`anchorNodeMesh`, `depArcLines`)
    // ========================================================================
    const shapeNodes = artifact.shape?.nodes || [];
    const activeAnchorCount = Math.min(MAX_ANCHOR_NODES, shapeNodes.length);

    if (anchorNodeMesh.visible) {
      anchorNodeMesh.count = activeAnchorCount;

      for (let nIdx = 0; nIdx < activeAnchorCount; nIdx += 1) {
        const node = shapeNodes[nIdx];
        let rawAnchor;
        try {
          rawAnchor = WovenBody.anchor(artifact.wovenBody, node.id, wovenPhase);
        } catch (_) {
          rawAnchor = { x: 0, y: 0, z: 0 };
        }
        normalizeWovenCoord(
          rawAnchor.x || 0,
          rawAnchor.y || 0,
          rawAnchor.z || 0,
          bounds,
          mechanism,
          _anchorPositions[nIdx]
        );

        const isActiveNode = nIdx === activeNodeIdx;
        _dummy.position.copy(_anchorPositions[nIdx]);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.setScalar(isActiveNode ? 1.65 : 0.95);
        _dummy.updateMatrix();
        anchorNodeMesh.setMatrixAt(nIdx, _dummy.matrix);

        const cSpec = nodeColors[nIdx % nodeCount];
        const rgb = cSpec?.opRgb || cSpec?.rgb || [114, 217, 226];
        _color.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
        if (isActiveNode) _color.lerp(_faultColor, isFault ? 0.7 : 0.0);
        anchorNodeMesh.setColorAt(nIdx, _color);
      }
      anchorNodeMesh.instanceMatrix.needsUpdate = true;
      if (anchorNodeMesh.instanceColor) anchorNodeMesh.instanceColor.needsUpdate = true;
    }

    if (depArcLines.visible && activeAnchorCount >= 2) {
      const edges = artifact.graph?.edges || [];
      const arcCount = Math.min(MAX_DEPENDENCY_ARCS, Math.max(activeAnchorCount - 1, edges.length));
      let arcVertCursor = 0;
      for (let eIdx = 0; eIdx < arcCount; eIdx += 1) {
        const srcIdx = eIdx % activeAnchorCount;
        const dstIdx = (eIdx + 1) % activeAnchorCount;
        const pStart = _anchorPositions[srcIdx];
        const pEnd = _anchorPositions[dstIdx];
        const cIdx = srcIdx % nodeCount;
        const isEdgeActive = srcIdx === activeNodeIdx || dstIdx === activeNodeIdx;
        const gain = isEdgeActive ? 0.85 : 0.38;
        const ar = ridgeBaseR[cIdx] * gain;
        const ag = ridgeBaseG[cIdx] * gain;
        const ab = ridgeBaseB[cIdx] * gain;

        for (let s = 0; s < ARC_SEGMENTS - 1; s += 1) {
          const t0 = s / (ARC_SEGMENTS - 1);
          const t1 = (s + 1) / (ARC_SEGMENTS - 1);
          const arch0 = Math.sin(t0 * Math.PI) * 0.065;
          const arch1 = Math.sin(t1 * Math.PI) * 0.065;

          const vOff = arcVertCursor * 3;
          depArcPositions[vOff] = lerp(pStart.x, pEnd.x, t0);
          depArcPositions[vOff + 1] = lerp(pStart.y, pEnd.y, t0) + arch0;
          depArcPositions[vOff + 2] = lerp(pStart.z, pEnd.z, t0) + arch0 * 0.8;

          depArcPositions[vOff + 3] = lerp(pStart.x, pEnd.x, t1);
          depArcPositions[vOff + 4] = lerp(pStart.y, pEnd.y, t1) + arch1;
          depArcPositions[vOff + 5] = lerp(pStart.z, pEnd.z, t1) + arch1 * 0.8;

          depArcColors[vOff] = ar;
          depArcColors[vOff + 1] = ag;
          depArcColors[vOff + 2] = ab;
          depArcColors[vOff + 3] = ar;
          depArcColors[vOff + 4] = ag;
          depArcColors[vOff + 5] = ab;

          arcVertCursor += 2;
        }
      }
      depArcGeom.setDrawRange(0, arcVertCursor);
      depArcGeom.attributes.position.needsUpdate = true;
      depArcGeom.attributes.color.needsUpdate = true;
    }

    // ========================================================================
    // 6. 64 RGB GENOME SPORES & PERIMETER TENDRILS (`sporeMesh`, `tendrilMesh`)
    // ========================================================================
    if (sporeMesh.visible) {
      const rgbPixels = artifact.rgbPixels || [];
      const outScale = isExhausted ? 0.92 : 1.04;

      for (let s = 0; s < SPORE_COUNT; s += 1) {
        const samplePt = Math.floor(((s * 61 + Math.floor(wovenPhase * 12)) % TISSUE_BUDGET)) * 3;
        const radialDrift = 0.016 * Math.sin(wovenPhase * 1.5 + s * PHI_GOLDEN_ANGLE);

        _dummy.position.set(
          tissuePositions[samplePt] * outScale + radialDrift,
          tissuePositions[samplePt + 1] * outScale + radialDrift * 0.6,
          tissuePositions[samplePt + 2] * outScale - radialDrift
        );
        _dummy.rotation.set(wovenPhase + s, wovenPhase * 0.7 + s, 0);
        _dummy.scale.setScalar(isDone ? 1.18 : isExhausted ? 0.56 : 0.92);
        _dummy.updateMatrix();
        sporeMesh.setMatrixAt(s, _dummy.matrix);

        const px = rgbPixels[s % Math.max(1, rgbPixels.length)];
        if (px && px.length >= 3) {
          _color.setRGB(px[0] / 255, px[1] / 255, px[2] / 255);
        } else {
          _color.setHex(species.primaryHex);
        }
        if (isFault) _color.lerp(_faultColor, 0.7);
        sporeMesh.setColorAt(s, _color);
      }
      sporeMesh.instanceMatrix.needsUpdate = true;
      if (sporeMesh.instanceColor) sporeMesh.instanceColor.needsUpdate = true;
    }

    if (tendrilMesh.visible) {
      for (let tIdx = 0; tIdx < TENDRIL_CURVE_COUNT; tIdx += 1) {
        const angle = (tIdx / TENDRIL_CURVE_COUNT) * TAU + wovenPhase * 0.18;
        const isUpper = tIdx % 2 === 0;
        const startR = QUINELING_MAX_RADIUS * 0.62;
        const endR = isUpper ? 0.56 : 0.72;
        const startY = isUpper ? 0.16 : -0.16;
        const endY = isUpper ? 0.58 : -0.56;

        for (let s = 0; s < TENDRIL_SEGMENTS; s += 1) {
          const u = s / (TENDRIL_SEGMENTS - 1);
          const sway = Math.sin(u * Math.PI * 1.5 - wovenPhase * 2.2 + tIdx) * 0.036 * u;
          const r = lerp(startR, endR, u * u) + sway;
          const theta = angle + sway * 1.4;
          _tendrilPts[s].set(
            Math.cos(theta) * r,
            lerp(startY, endY, u),
            Math.sin(theta) * r
          );
        }
        const ownerIdx = tIdx % nodeCount;
        writeRibbonStrip(
          tendrilPositions,
          tendrilColors,
          tendrilNormals,
          tendrilUvs,
          tIdx,
          TENDRIL_SEGMENTS,
          _tendrilPts,
          0.0046,
          nodeBaseR[ownerIdx],
          nodeBaseG[ownerIdx],
          nodeBaseB[ownerIdx]
        );
      }
      tendrilGeom.attributes.position.needsUpdate = true;
      tendrilGeom.attributes.color.needsUpdate = true;
      tendrilGeom.attributes.normal.needsUpdate = true;
      tendrilGeom.attributes.uv.needsUpdate = true;
    }
  }

  function dispose() {
    anchorNodeMesh.dispose();
    sporeMesh.dispose();
    const resources = [
      tissueGeom,
      tissueMat,
      ridgeLineGeom,
      ridgeLineMat,
      sdkRibbonGeom,
      sdkRibbonMat,
      anchorNodeGeom,
      anchorNodeMat,
      depArcGeom,
      depArcMat,
      sporeGeom,
      sporeMat,
      tendrilGeom,
      tendrilMat,
    ];
    for (let i = 0; i < resources.length; i += 1) {
      if (resources[i] && typeof resources[i].dispose === 'function') {
        resources[i].dispose();
      }
    }
    group.traverse((obj) => {
      if (obj.geometry && typeof obj.geometry.dispose === 'function') {
        obj.geometry.dispose();
      }
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          for (let m = 0; m < obj.material.length; m += 1) {
            if (obj.material[m] && typeof obj.material[m].dispose === 'function') {
              obj.material[m].dispose();
            }
          }
        } else if (typeof obj.material.dispose === 'function') {
          obj.material.dispose();
        }
      }
    });
    currentBucket = null;
  }

  return {
    group,
    coreRoot,
    speciesGroups,
    tissuePointsMesh,
    ridgeLineSegments,
    sdkManifoldRibbonMesh,
    anchorNodeMesh,
    sporeMesh,
    update,
    dispose,
  };
}
