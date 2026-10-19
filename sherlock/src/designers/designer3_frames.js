import * as THREE from 'three/webgpu';
import {
  FRAME_KIND_META,
  clamp,
  lerp,
  smoothstep,
  createBrushedMetalTexture,
  createPlaqueTexture,
  tagInspectable,
} from './theme.js';

const MAX_WAFERS = 12;

const ALL_FRAME_KINDS = [
  'Let',
  'Left',
  'Right',
  'Unary',
  'If',
  'Match',
  'Args',
  'Return',
  'Scope',
];

// -----------------------------------------------------------------------------
// Semantic Ring & Wafer Families aligned with `reference_types.rs` and the 6 Rings:
// - ENV  (`Frame::Return`):                 Deep Emerald-Teal (`0x0d9488`)
// - ENV  (`Frame::Scope`):                  Sky Cyan (`0x38bdf8`)
// - OP   (`Frame::Left`, `Args`, `Unary`):  Amber-Copper (`0xf59e0b`)
// - OP   (`Frame::Right`, e.g. `4 × [?]`):  Luminous Gold (`0xfbbf24`)
// - GATE (`If`, `Match`, `Let`):            Royal Violet-Indigo (`0x818cf8`)
// -----------------------------------------------------------------------------
const HEX_ENV_RETURN_TEAL = 0x0d9488;
const HEX_ENV_SCOPE_CYAN = 0x38bdf8;
const HEX_ENV_BRIGHT_TEAL = 0x2dd4bf;
const HEX_OP_LEFT_AMBER = 0xf59e0b;
const HEX_OP_RIGHT_GOLD = 0xfbbf24;
const HEX_GATE_VIOLET = 0x818cf8;

const HEX_BRUSHED_RHODIUM = 0xd8dde6;
const HEX_SAPPHIRE_SLATE = 0x182232;

const CSS_ENV_RETURN_TEAL = '#0d9488';
const CSS_ENV_SCOPE_CYAN = '#38bdf8';
const CSS_OP_LEFT_AMBER = '#f59e0b';
const CSS_OP_RIGHT_GOLD = '#fbbf24';
const CSS_GATE_VIOLET = '#818cf8';

// Open-Bore Annular Continuation Ring Radii (Perimeter Gallery Architecture):
// - `innerRadius = 1.02` (`diameter = 2.04`) clears the entire `r = 0.232..0.950` crown of
//   all 6 Concentric Split-Arc Rings (`R1..R6`) and the 10-Sector Control Stator (`y = -0.24`),
//   leaving the central `r < 1.00` shaft 100% unobstructed from floor to ceiling!
// - `outerRadius = 1.28` sits cleanly inside the widened `innerHalf = 1.56` atrium vault.
const WAFER_INNER_RADIUS = 1.02;
const WAFER_COLLAR_OUTER_R = 1.06;
const WAFER_RHODIUM_INNER_R = 1.23;
const WAFER_OUTER_RADIUS = 1.28;

// Compact Front-Facing Gallery Badge dimensions (`0.40 × 0.096`)
const BADGE_WIDTH = 0.40;
const BADGE_HEIGHT = 0.096;
const BADGE_RADIUS = 1.01;

// Dock height just below the 10-Sector Control Stator (y = -0.24) so the orb never clips the stator bridge
const CONTROL_CORE_DOCK_Y = -0.285;

// Pre-allocated module-scope scratch colors & family descriptors (zero per-frame allocations)
const _colorEnvReturnTeal = new THREE.Color(HEX_ENV_RETURN_TEAL);
const _colorEnvScopeCyan = new THREE.Color(HEX_ENV_SCOPE_CYAN);
const _colorEnvBrightTeal = new THREE.Color(HEX_ENV_BRIGHT_TEAL);
const _colorOpLeftAmber = new THREE.Color(HEX_OP_LEFT_AMBER);
const _colorOpRightGold = new THREE.Color(HEX_OP_RIGHT_GOLD);
const _colorGateViolet = new THREE.Color(HEX_GATE_VIOLET);
const _colorBlended = new THREE.Color();

const SEMANTIC_FAMILY_DESC = {
  ENV_RETURN: {
    family: 'ENV',
    roleDesc: 'ENV · Frame::Return Saved Call Environment (Teal 0x0d9488)',
    colorObj: _colorEnvReturnTeal,
    hex: HEX_ENV_RETURN_TEAL,
    css: CSS_ENV_RETURN_TEAL,
    bg: 'rgba(12, 30, 34, 0.94)',
    muted: '#5eead4',
  },
  ENV_SCOPE: {
    family: 'ENV',
    roleDesc: 'ENV · Frame::Scope Saved Lexical Scope (Sky Cyan 0x38bdf8)',
    colorObj: _colorEnvScopeCyan,
    hex: HEX_ENV_SCOPE_CYAN,
    css: CSS_ENV_SCOPE_CYAN,
    bg: 'rgba(14, 28, 42, 0.94)',
    muted: '#7dd3fc',
  },
  OP_LEFT: {
    family: 'OP',
    roleDesc: 'OP · Frame::Left Pending Operand (Amber-Copper 0xf59e0b)',
    colorObj: _colorOpLeftAmber,
    hex: HEX_OP_LEFT_AMBER,
    css: CSS_OP_LEFT_AMBER,
    bg: 'rgba(28, 22, 15, 0.94)',
    muted: '#fcd34d',
  },
  OP_RIGHT: {
    family: 'OP',
    roleDesc: 'OP · Frame::Right Waiting Operand (Luminous Gold 0xfbbf24)',
    colorObj: _colorOpRightGold,
    hex: HEX_OP_RIGHT_GOLD,
    css: CSS_OP_RIGHT_GOLD,
    bg: 'rgba(29, 25, 15, 0.94)',
    muted: '#fde68a',
  },
  GATE: {
    family: 'GATE',
    roleDesc: 'GATE · Branch / Pattern / Binding (Royal Violet-Indigo 0x818cf8)',
    colorObj: _colorGateViolet,
    hex: HEX_GATE_VIOLET,
    css: CSS_GATE_VIOLET,
    bg: 'rgba(20, 22, 38, 0.94)',
    muted: '#c7d2fe',
  },
};

function getFrameSemanticFamily(kind) {
  if (kind === 'Return') {
    return SEMANTIC_FAMILY_DESC.ENV_RETURN;
  }
  if (kind === 'Scope') {
    return SEMANTIC_FAMILY_DESC.ENV_SCOPE;
  }
  if (kind === 'Right') {
    return SEMANTIC_FAMILY_DESC.OP_RIGHT;
  }
  if (kind === 'Left' || kind === 'Args' || kind === 'Unary') {
    return SEMANTIC_FAMILY_DESC.OP_LEFT;
  }
  return SEMANTIC_FAMILY_DESC.GATE;
}

/**
 * Map chronological wafer index `chronoIdx` (`0..11`) directly to its 1-to-1 Half-Ring Slot ID
 * (`R1·A`, `R1·B`, `R2·A`, `R2·B`, ..., `R6·B`) on the 6 Concentric Horological Rings above.
 */
function formatHalfRingSlotId(chronoIdx) {
  const ringNum = Math.floor(chronoIdx / 2) + 1;
  const halfSlot = chronoIdx % 2 === 0 ? 'A' : 'B';
  return `R${ringNum}·${halfSlot}`;
}

/**
 * Create a precision-machined circular annular ring geometry in the horizontal XZ plane.
 */
function createAnnularRingGeometry({
  innerR,
  outerR,
  depth = 0.014,
  bevelEnabled = true,
  bevelThickness = 0.002,
  bevelSize = 0.002,
  curveSegments = 64,
  yOffset = 0,
}) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);

  const holePath = new THREE.Path();
  holePath.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled,
    bevelThickness: bevelEnabled ? bevelThickness : 0,
    bevelSize: bevelEnabled ? bevelSize : 0,
    bevelSegments: bevelEnabled ? 2 : 1,
    curveSegments,
  });
  geo.rotateX(Math.PI * 0.5);
  geo.translate(0, depth * 0.5 + yOffset, 0);
  return geo;
}

/**
 * Extract a concise function name from a Sherlock AST path like `fn[0]:fact/2.1` -> `fact`.
 */
function extractFnName(astPath = '') {
  const match = String(astPath).match(/fn\[\d+\]:([A-Za-z0-9_]+)/);
  return match ? match[1] : null;
}

/**
 * Format a compact lexical binding summary for a wafer edge badge, e.g. `n = 4`.
 */
function formatBindingsCompact(bindings = [], maxItems = 1) {
  if (!Array.isArray(bindings) || bindings.length === 0) return '';
  const b = bindings[0];
  if (!b) return '';
  const val = String(b.valueSummary ?? '').replace(/\s+/g, '');
  const shortVal = val.length > 8 ? `${val.slice(0, 7)}..` : val;
  return `${b.name}=${shortVal}`;
}

/**
 * Format a concise pending operation + binding summary for the compact front-edge badge
 * (`0.36 × 0.090`), e.g. `4 × [?] · n=4` or `RET fact(4)`.
 */
function formatWaferPlaqueTitle(frame, effectiveBindings) {
  const kind = frame.kind || 'Return';
  const rawLabel = String(frame.label || kind)
    .replace(/\[hole\]/gi, '[?]')
    .replace(/\s*\*\s*/g, ' × ')
    .trim();
  const fnName = extractFnName(frame.astPath);
  const bindingText = formatBindingsCompact(effectiveBindings, 1);
  const firstVal =
    Array.isArray(effectiveBindings) && effectiveBindings.length > 0
      ? String(effectiveBindings[0].valueSummary ?? '').trim()
      : '';

  let opText = '';
  if (kind === 'Return') {
    const callDesc = fnName
      ? firstVal
        ? `${fnName}(${firstVal})`
        : `${fnName}()`
      : 'entry';
    opText = `RET ${callDesc}`;
  } else if (kind === 'Scope') {
    opText = fnName ? `SCP ${fnName}` : 'SCP env';
  } else if (kind === 'Args') {
    const callTarget = rawLabel.split('(')[0] || fnName || 'call';
    opText = `${callTarget}([?])`;
  } else if (kind === 'If') {
    opText = 'if [?]';
  } else if (kind === 'Match') {
    opText = 'match [?]';
  } else {
    opText =
      rawLabel.includes('[?]') || rawLabel.includes('?')
        ? rawLabel
        : `${rawLabel} [?]`;
  }

  return bindingText ? `${opText} · ${bindingText}` : opText;
}

/**
 * Resolve active camera preset from `stepState` without allocating.
 */
function resolveActiveCameraPreset(stepState) {
  if (stepState?.activePreset) return stepState.activePreset;
  if (stepState?.cameraPreset) return stepState.cameraPreset;
  return 'overview';
}

/**
 * Designer 3: Open-Bore Machined Stainless & Sapphire Annular Continuation Rings
 *
 * Inside the hollow 3D chamber (`y = -0.52` down to `-1.92`, `innerRadius = 0.36, outerRadius = 0.74`):
 * - Up to 12 open-center annular continuation rings suspended below the 6 Split-Arc Rings
 *   and the 10-Sector Control Stator (`y = -0.24`).
 * - Because `innerRadius = 0.36` (`diameter = 0.72`), the central vertical light-column from
 *   the Control Stator (`y = -0.24`, `r <= 0.216`) to the 39-Rule Floor (`y = -2.18`) is
 *   100% open and visible from every camera angle!
 */
export function createFramesSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer3_ContinuationWafers';

  const disposableResources = [];

  function trackGeo(geo) {
    disposableResources.push(geo);
    return geo;
  }

  function trackMat(mat) {
    disposableResources.push(mat);
    return mat;
  }

  // ---------------------------------------------------------------------------
  // 1. Shared Open-Bore Annular Ring Geometries (`innerRadius = 0.36, outerRadius = 0.74`)
  // ---------------------------------------------------------------------------

  // 1a. Outer Brushed Stainless / Silver-Rhodium Structural Ring (`r = 0.696..0.740`)
  const waferOuterBevelGeo = trackGeo(
    createAnnularRingGeometry({
      innerR: WAFER_RHODIUM_INNER_R,
      outerR: WAFER_OUTER_RADIUS,
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.0025,
      bevelSize: 0.0025,
      curveSegments: 64,
      yOffset: 0.001,
    })
  );

  // 1b. Translucent Sapphire-Slate Annular Web (`r = 0.396..0.696`)
  const waferGlassGeo = trackGeo(
    createAnnularRingGeometry({
      innerR: WAFER_COLLAR_OUTER_R,
      outerR: WAFER_RHODIUM_INNER_R,
      depth: 0.010,
      bevelEnabled: false,
      curveSegments: 64,
      yOffset: 0.0,
    })
  );

  // 1c. Anodized Semantic Inner Bore Collar (`r = 0.360..0.396`) framing the open central shaft
  const waferInnerCollarGeo = trackGeo(
    createAnnularRingGeometry({
      innerR: WAFER_INNER_RADIUS,
      outerR: WAFER_COLLAR_OUTER_R,
      depth: 0.018,
      bevelEnabled: true,
      bevelThickness: 0.002,
      bevelSize: 0.002,
      curveSegments: 64,
      yOffset: 0.0015,
    })
  );

  // 1d. Hairline Semantic Outer Accent Ring on both top and bottom soffit decks
  const outerAccentLipGeo = trackGeo(
    new THREE.RingGeometry(WAFER_RHODIUM_INNER_R - 0.012, WAFER_RHODIUM_INNER_R, 64)
  );
  outerAccentLipGeo.rotateX(-Math.PI * 0.5);
  outerAccentLipGeo.translate(0, 0.0095, 0);

  const lowerAccentLipGeo = trackGeo(
    new THREE.RingGeometry(WAFER_RHODIUM_INNER_R - 0.012, WAFER_RHODIUM_INNER_R, 64)
  );
  lowerAccentLipGeo.rotateX(Math.PI * 0.5);
  lowerAccentLipGeo.translate(0, -0.0085, 0);

  // 1e. Compact Front-Facing Edge Badge (`0.36 × 0.090`) on the front arc
  const waferPlaqueGeo = trackGeo(new THREE.PlaneGeometry(BADGE_WIDTH, BADGE_HEIGHT));

  // Shared translucent sapphire-slate glass material
  const sharedGlassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: HEX_SAPPHIRE_SLATE,
      roughness: 0.14,
      metalness: 0.10,
      clearcoat: 0.90,
      clearcoatRoughness: 0.12,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );

  // Shared brushed silver-rhodium outer ring material (`0xd8dde6`)
  const rhodiumBrushTex = createBrushedMetalTexture({
    size: 256,
    baseHex: '#d8dde6',
    streakAlpha: 0.04,
  });
  const sharedOuterBevelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: HEX_BRUSHED_RHODIUM,
      map: rhodiumBrushTex,
      roughness: 0.24,
      metalness: 0.88,
    })
  );

  // ---------------------------------------------------------------------------
  // 2. Central Open-Bore Light Filament & Clean Unwind Result Orb (`orbMesh`, r = 0.046)
  // ---------------------------------------------------------------------------
  const spineHeight = 3.05;
  const spineGeo = trackGeo(new THREE.CylinderGeometry(0.003, 0.003, spineHeight, 12));
  const spineMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: HEX_ENV_BRIGHT_TEAL,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
  );
  const spineMesh = new THREE.Mesh(spineGeo, spineMat);
  spineMesh.name = 'OpenBoreLightFilament';
  spineMesh.position.set(0, -1.80, 0);
  spineMesh.raycast = () => {};
  group.add(spineMesh);

  const orbGeo = trackGeo(new THREE.SphereGeometry(0.046, 24, 24));
  const orbMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: HEX_ENV_BRIGHT_TEAL,
      emissive: HEX_ENV_BRIGHT_TEAL,
      emissiveIntensity: 1.45,
      roughness: 0.14,
      metalness: 0.22,
    })
  );
  const orbMesh = new THREE.Mesh(orbGeo, orbMat);
  orbMesh.name = 'UnwindResultOrb';
  orbMesh.visible = false;
  group.add(orbMesh);

  tagInspectable(orbMesh, {
    type: 'unwind-orb',
    id: 'unwind-result-orb',
    title: 'Unwind Result Orb',
    subtitle: 'Returning value rising through the r = 1.02 open-bore light shaft into the Control Stator',
    details: [
      'Axis: Central open bore (x = 0, z = 0) inside the r = 1.02 annular continuation rings',
      'Destination: 10-Sector Control Optical Stator (y = -0.24)',
    ],
  });

  // ---------------------------------------------------------------------------
  // 3. Pre-Allocate 12 Open-Bore Annular Continuation Rings (`y = -0.64` down to `-2.75`)
  // ---------------------------------------------------------------------------
  const wafersContainer = new THREE.Group();
  wafersContainer.name = 'SavedFrameWafersStack';
  group.add(wafersContainer);

  const waferSlots = [];

  for (let i = 0; i < MAX_WAFERS; i++) {
    const slotGroup = new THREE.Group();
    slotGroup.name = `SavedFrameWafer_${i}`;
    slotGroup.visible = false;
    wafersContainer.add(slotGroup);

    // 3a. Translucent sapphire-slate annular web (`r = 1.06..1.23`)
    const glassMesh = new THREE.Mesh(waferGlassGeo, sharedGlassMat);
    slotGroup.add(glassMesh);

    // 3b. Brushed silver-rhodium outer bevel ring (`r = 1.23..1.28`)
    const outerBevelMesh = new THREE.Mesh(waferOuterBevelGeo, sharedOuterBevelMat);
    slotGroup.add(outerBevelMesh);

    // 3c. Anodized semantic inner bore collar (`r = 1.02..1.06`) & top/bottom accent lips
    const rimMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: HEX_OP_LEFT_AMBER,
        emissive: HEX_OP_LEFT_AMBER,
        emissiveIntensity: 0.28,
        roughness: 0.24,
        metalness: 0.84,
        side: THREE.DoubleSide,
      })
    );
    const innerCollarMesh = new THREE.Mesh(waferInnerCollarGeo, rimMat);
    slotGroup.add(innerCollarMesh);

    const outerLipMesh = new THREE.Mesh(outerAccentLipGeo, rimMat);
    slotGroup.add(outerLipMesh);

    const lowerLipMesh = new THREE.Mesh(lowerAccentLipGeo, rimMat);
    slotGroup.add(lowerLipMesh);

    // 3d. Compact Front-Facing Gallery Badge (`0.40 × 0.096`) on the North gallery collar (`z < 0`)
    //     facing `+Z` directly toward the interior observer and Cross-Section camera!
    const slotId = formatHalfRingSlotId(i);
    const isEastSlotB = i % 2 === 1;
    const ringTier = Math.floor(i / 2);
    const staggerRad = 0.24 + (ringTier % 2) * 0.14;
    const badgeAzimuth = isEastSlotB ? staggerRad : -staggerRad;
    const initSig = `init|${slotId}`;
    const initialTex = createPlaqueTexture({
      badge: slotId,
      title: `Frame #${i + 1}`,
      subtitle: `${slotId} · Saved continuation ring`,
      accent: CSS_OP_LEFT_AMBER,
      bg: 'rgba(18, 26, 38, 0.94)',
      fg: '#f3efe6',
      muted: '#9e978b',
      width: 512,
      height: 128,
    });

    const plaqueMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: initialTex,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    const plaqueMesh = new THREE.Mesh(waferPlaqueGeo, plaqueMat);
    plaqueMesh.position.set(
      Math.sin(badgeAzimuth) * BADGE_RADIUS,
      0.018,
      -Math.cos(badgeAzimuth) * BADGE_RADIUS
    );
    plaqueMesh.rotation.y = -badgeAzimuth * 0.65;
    slotGroup.add(plaqueMesh);

    tagInspectable(slotGroup, {
      type: 'frame',
      id: `saved-frame-wafer-${i}`,
      title: `[${slotId}] Annular Continuation Ring #${i + 1}`,
      subtitle: `Open-Bore Continuation Ring (r = 1.02..1.28) · Slot ${slotId}`,
      details: [],
    });

    const initialY = -0.64 - i * 0.19;
    waferSlots.push({
      slotIndex: i,
      slotId,
      group: slotGroup,
      rimMat,
      plaqueMat,
      plaqueMesh,
      badgeOpacity: 0.96,
      lastSignature: initSig,
      inspectSignature: '',
      currentY: initialY,
      targetY: initialY,
      lastActiveY: initialY,
      currentScale: 1.0,
      wasVisible: false,
      flashIntensity: 0,
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Compact Edge Badge Texture Updater (Uses `theme.js` LRU cache)
  // ---------------------------------------------------------------------------
  function updateWaferPlaque(slot, frame, depthNumber, effectiveBindings, semFamily) {
    const kind = ALL_FRAME_KINDS.includes(frame.kind) ? frame.kind : 'Return';
    const meta = FRAME_KIND_META[kind] || FRAME_KIND_META.Return;
    const badge = slot.slotId;
    const title = formatWaferPlaqueTitle(frame, effectiveBindings);
    const subtitle = `${semFamily.family} (${meta.badge}) · D${depthNumber} · env#${frame.envId ?? 0}`;
    const accentCss = semFamily.css;

    const signature = `${badge}|${title}|${subtitle}|${accentCss}`;
    if (slot.lastSignature === signature) return;
    slot.lastSignature = signature;

    const tex = createPlaqueTexture({
      badge,
      title,
      subtitle,
      accent: accentCss,
      bg: semFamily.bg,
      fg: '#f3efe6',
      muted: semFamily.muted,
      width: 512,
      height: 128,
    });

    if (slot.plaqueMat.map !== tex) {
      slot.plaqueMat.map = tex;
      slot.plaqueMat.needsUpdate = true;
    }

    slot.group.userData.inspectable = true;
    slot.group.userData.type = 'frame';
    slot.group.userData.id = `frame-wafer-${depthNumber}`;
    slot.group.userData.slotId = slot.slotId;
    slot.group.userData.kind = kind;
    slot.group.userData.semanticFamily = semFamily.family;
    slot.group.userData.originExprId = frame.originExprId ?? null;
    slot.group.userData.astPath = frame.astPath || 'root';
    slot.group.userData.envId = frame.envId ?? 0;
    slot.group.userData.title = `[${slot.slotId}] ${title}`;
    slot.group.userData.subtitle = `Slot ${slot.slotId} (Depth ${depthNumber}) · ${semFamily.roleDesc}`;
    slot.group.userData.details = [
      `Half-Ring Slot ID: ${slot.slotId} (chronological index ${slot.slotIndex})`,
      `Annular Ring Bore: innerRadius = 1.02, outerRadius = 1.28`,
      `Operation & Binding: ${title}`,
      `Semantic Ring Family: ${semFamily.roleDesc}`,
      `AST Origin: Expr #${frame.originExprId ?? 'root'} (${frame.astPath || 'entry'})`,
    ];
  }

  // ---------------------------------------------------------------------------
  // 5. Main `.update(stepState)` Loop (Zero Per-Frame Object Allocations)
  // ---------------------------------------------------------------------------
  const effectiveBindingsScratch = new Array(MAX_WAFERS);
  const EMPTY_ARRAY = [];
  let lastStepIndex = -1;
  let lastTraceRef = null;

  function update(stepState) {
    if (!stepState) return;

    const dt = clamp(stepState.dt ?? 0.016, 0.001, 0.1);
    const stepFraction = clamp(stepState.stepFraction ?? 0, 0, 1);
    const step = stepState.step;
    const after = step?.after;
    const before = step?.before;
    const stepIdx = stepState.stepIndex ?? step?.stepIndex ?? 0;
    const isStepChanged = stepIdx !== lastStepIndex || stepState.trace !== lastTraceRef;
    lastStepIndex = stepIdx;
    lastTraceRef = stepState.trace;

    const activePreset = resolveActiveCameraPreset(stepState);
    // Only display text badges on wafers when inside the hollow chip (`interior*`) or in
    // Cross-Section (`frames`) so `Overview` and `Top-Down Rings` (`well`) have zero text
    // bleed-through in the split-arc ring gaps!
    const showWaferBadges =
      activePreset === 'interior' ||
      activePreset === 'interior_up' ||
      activePreset === 'interior_floor' ||
      activePreset === 'frames' ||
      activePreset === 'quineling';
    const targetBadgeOpacity = showWaferBadges ? 0.96 : 0.0;
    const targetBadgePitch = -0.06 * Math.PI;

    const rawAfterFrames = Array.isArray(after?.frames) ? after.frames : EMPTY_ARRAY;
    const rawBeforeFrames = Array.isArray(before?.frames) ? before.frames : EMPTY_ARRAY;

    const totalAfter = rawAfterFrames.length;
    const numWafers = Math.min(totalAfter, MAX_WAFERS);
    const prevCount = Math.min(rawBeforeFrames.length, MAX_WAFERS);

    if (isStepChanged) {
      const rootEnvBindings =
        Array.isArray(after?.envRoots) && after.envRoots[0]?.bindings
          ? after.envRoots[0].bindings
          : EMPTY_ARRAY;

      for (let chronoIdx = 0; chronoIdx < numWafers; chronoIdx++) {
        const frame = rawAfterFrames[totalAfter - 1 - chronoIdx];
        let resolved =
          Array.isArray(frame.bindings) && frame.bindings.length > 0
            ? frame.bindings
            : null;
        if (!resolved) {
          for (let j = chronoIdx - 1; j >= 0; j--) {
            const parentFrame = rawAfterFrames[totalAfter - 1 - j];
            if (
              Array.isArray(parentFrame?.bindings) &&
              parentFrame.bindings.length > 0
            ) {
              resolved = parentFrame.bindings;
              break;
            }
          }
        }
        effectiveBindingsScratch[chronoIdx] = resolved || rootEnvBindings;
      }
    }

    // Detect value return / frame unwind transitions
    const ruleLine = step?.ruleLine ?? 0;
    const ruleName = String(step?.ruleName || '');
    const controlKind = String(step?.controlKind || '');
    const isUnwinding =
      controlKind === 'Return' ||
      controlKind === 'PrimitiveResult' ||
      ruleLine === 153 ||
      ruleLine === 185 ||
      ruleLine === 195 ||
      ruleLine === 80 ||
      ruleName.includes('Return') ||
      ruleName.includes('Binary primitive') ||
      ruleName.includes('Restore scope');

    // Spacious vertical slot spacing inside deep hollow chamber y ∈ [-0.64, -2.75]
    const topY = -0.64;
    const spacing = 0.19;
    const damp = 1.0 - Math.exp(-10.0 * dt);

    for (let chronoIdx = 0; chronoIdx < MAX_WAFERS; chronoIdx++) {
      const slot = waferSlots[chronoIdx];

      if (chronoIdx < numWafers) {
        const frame = rawAfterFrames[totalAfter - 1 - chronoIdx];
        const kind = ALL_FRAME_KINDS.includes(frame.kind) ? frame.kind : 'Return';
        const semFamily = getFrameSemanticFamily(kind);
        const depthNumber = chronoIdx + 1;
        const isDeepestActive = chronoIdx === numWafers - 1;
        const isUnwindTarget = isUnwinding && isDeepestActive;

        slot.targetY = clamp(topY - chronoIdx * spacing, -2.85, -0.64);

        if (!slot.wasVisible) {
          slot.currentY = clamp(slot.targetY + 0.08, -2.85, -0.58);
          slot.currentScale = 0.92;
          slot.wasVisible = true;
        }

        slot.group.visible = true;

        slot.currentY = lerp(slot.currentY, slot.targetY, damp);
        slot.lastActiveY = slot.currentY;

        const targetScale = isDeepestActive ? 1.0 : 0.97;
        slot.currentScale = lerp(slot.currentScale, targetScale, damp);

        slot.group.position.set(0, slot.currentY, 0);
        slot.group.scale.setScalar(slot.currentScale);

        // Smoothly fade/hide compact front-edge badge when outside interior/frames views
        slot.badgeOpacity = lerp(slot.badgeOpacity, targetBadgeOpacity, damp * 1.6);
        slot.plaqueMat.opacity = slot.badgeOpacity;
        slot.plaqueMesh.visible = slot.badgeOpacity > 0.02;
        slot.plaqueMesh.rotation.x = lerp(slot.plaqueMesh.rotation.x, targetBadgePitch, damp);

        const dockFlash = isUnwindTarget
          ? smoothstep(0.15, 0.85, stepFraction)
          : 0;
        slot.flashIntensity = lerp(slot.flashIntensity, dockFlash, damp);

        _colorBlended
          .copy(semFamily.colorObj)
          .lerp(_colorEnvBrightTeal, slot.flashIntensity * 0.65);

        slot.rimMat.color.copy(_colorBlended);
        slot.rimMat.emissive.copy(_colorBlended);
        const baseEmissive = showWaferBadges ? 0.34 : 0.14;
        slot.rimMat.emissiveIntensity =
          baseEmissive +
          (isDeepestActive ? 0.28 : 0.08) +
          slot.flashIntensity * 0.45;

        if (isStepChanged) {
          updateWaferPlaque(
            slot,
            frame,
            depthNumber,
            effectiveBindingsScratch[chronoIdx],
            semFamily
          );
        }
      } else {
        slot.group.visible = false;
        slot.wasVisible = false;
        slot.currentScale = 0.92;
        slot.flashIntensity = 0;
      }
    }

    // Update Open-Bore Light Filament & Clean Unwind Result Orb (`orbMesh`, radius = 0.046)
    spineMesh.visible = numWafers > 0 || isUnwinding;
    spineMat.opacity = isUnwinding ? 0.28 : 0.14;

    if (isUnwinding && (numWafers > 0 || prevCount > 0 || controlKind === 'Return')) {
      orbMesh.visible = true;
      const popIndex = clamp(Math.max(numWafers, prevCount) - 1, 0, MAX_WAFERS - 1);
      const startY = clamp(
        waferSlots[popIndex]?.lastActiveY ?? (topY - popIndex * spacing),
        -2.85,
        -0.64
      );

      // Continuous smoothstep without jump discontinuity at stepFraction = 0
      const orbT = smoothstep(0.0, 0.95, stepFraction);
      const orbY = lerp(startY, CONTROL_CORE_DOCK_Y, orbT);

      orbMesh.position.set(0, orbY, 0);
      orbMat.emissiveIntensity = 1.2 + 0.35 * Math.sin(orbT * Math.PI);
    } else {
      orbMesh.visible = false;
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Clean Resource Disposal (Shared plaque textures are owned by `theme.js`)
  // ---------------------------------------------------------------------------
  function dispose() {
    for (const res of disposableResources) {
      if (res && typeof res.dispose === 'function') {
        res.dispose();
      }
    }
  }

  return {
    group,
    update,
    dispose,
  };
}
