import * as THREE from 'three/webgpu';
import {
  PALETTE,
  CONTROL_KIND_META,
  clamp,
  lerp,
} from './theme.js';

/**
 * Studio Camera Lens Presets for the Sherlock Universal Interpreter Workbench.
 * Includes exterior horological views, oblique wafer cross-sections, and
 * direct interior 3D Atrium immersion inside the hollow chip chamber.
 */
export const ASPECT_COMPENSATION_THRESHOLD = 1.15;
export const ASPECT_PORTRAIT_FULL_BLEND = 0.52;
export const ASPECT_MIN_CLAMP = 0.42;
export const ASPECT_LANDSCAPE_WIDE_THRESHOLD = 1.85;

export const CAMERA_PRESETS = {
  overview: {
    name: 'overview',
    label: 'Overview',
    subtitle: '3/4 diagonal studio perspective of the 3-tier Sherlock chip, companion Call Chiplets, and Split-Arc Rings',
    pos: [3.85, 4.85, 5.35],
    lookAt: [-0.38, -0.16, 0.05],
    fov: 32,
    portraitPos: [3.45, 5.15, 5.25],
    portraitLookAt: [-0.48, -0.18, 0.02],
    fovAlpha: 0.38,
    distBeta: 0.56,
    maxFov: 48,
    landscapeBeta: 0.14,
  },
  quineling: {
    name: 'quineling',
    label: 'Quineling Core',
    subtitle: 'Macro 3D studio inspection of the living WovenBody Quineling organism, operation anchors, and atrium tendrils',
    pos: [0.0, -1.96, 0.92],
    lookAt: [0.0, -2.08, 0.0],
    fov: 62,
    portraitPos: [0.0, -1.64, 0.94],
    portraitLookAt: [0.0, -2.08, -0.04],
    fovAlpha: 0.30,
    maxFov: 86,
  },
  interior: {
    name: 'interior',
    label: 'Inside Hollow Chip',
    subtitle: 'Miniature first-person observer inside the sealed 3D vault — framing the living 3D Quineling Core, 6 Split-Arc Rings overhead, and 39 3D Floor Modules below',
    pos: [0.0, -1.85, 0.94],
    lookAt: [0.0, -2.18, -0.28],
    fov: 72,
    portraitPos: [0.0, -1.52, 0.94],
    portraitLookAt: [0.0, -2.24, -0.34],
    fovAlpha: 0.28,
    maxFov: 90,
  },
  interior_up: {
    name: 'interior_up',
    label: 'Inside Chip · Look Up at Rings',
    subtitle: 'Looking straight up through the open bore at all 6 Split-Arc Rings and 10-Sector Control Stator',
    pos: [0.0, -1.32, 0.18],
    lookAt: [0.0, -0.10, -0.02],
    fov: 70,
    portraitPos: [0.0, -2.58, 0.22],
    portraitLookAt: [0.0, -0.10, 0.0],
    fovAlpha: 0.26,
    maxFov: 88,
  },
  interior_floor: {
    name: 'interior_floor',
    label: 'Inside Chip · 39 Floor Modules',
    subtitle: 'Hovering above the 39 physical 3D silicon rule chiplets on the chamber floor (A080..A225)',
    pos: [0.0, -2.15, 0.88],
    lookAt: [0.0, -3.35, -0.18],
    fov: 70,
    portraitPos: [0.0, -0.68, 0.54],
    portraitLookAt: [0.0, -3.38, -0.06],
    fovAlpha: 0.28,
    maxFov: 90,
  },
  well: {
    name: 'well',
    label: 'Top-Down Rings',
    subtitle: 'Axial horological view of all 12 Split-Arc Half-Rings (R1.A..R6.B), 10-Sector Control Stator, and open bore',
    pos: [0.0, 3.65, 0.01],
    lookAt: [0.0, -0.12, 0.0],
    fov: 28,
    portraitPos: [0.0, 3.85, 0.01],
    portraitLookAt: [0.0, -0.12, 0.0],
    fovAlpha: 0.40,
    distBeta: 0.58,
    maxFov: 46,
    landscapeBeta: 0.12,
  },
  frames: {
    name: 'frames',
    label: 'Cross-Section',
    subtitle: '3/4 architectural cutaway section through the machined stainless collar, 6 split-arc rings, 3D Quineling Core, and 39 3D floor modules',
    pos: [1.85, -0.75, 5.15],
    lookAt: [-0.05, -1.95, 0.0],
    fov: 42,
    portraitPos: [1.10, -0.65, 5.45],
    portraitLookAt: [0.0, -1.82, 0.0],
    fovAlpha: 0.34,
    distBeta: 0.56,
    maxFov: 54,
    landscapeBeta: 0.22,
  },
  arena: {
    name: 'arena',
    label: 'Active Calls & Value Stage',
    subtitle: 'Studio view of the West-Flank Companion Call Chiplets and Horological Well',
    pos: [-1.85, 3.25, 4.15],
    lookAt: [-0.95, -0.22, 0.0],
    fov: 32,
    portraitPos: [-1.65, 3.65, 4.35],
    portraitLookAt: [-1.12, -0.22, 0.0],
    fovAlpha: 0.38,
    distBeta: 0.58,
    maxFov: 50,
    landscapeBeta: 0.14,
  },
  circuit: {
    name: 'circuit',
    label: 'L4 Die Circuit',
    subtitle: 'High plan view of the die shield, perimeter micro-LED grooves, and 6 concentric rings',
    pos: [0.0, 5.15, 0.70],
    lookAt: [0, 0.02, 0],
    fov: 32,
    portraitPos: [0.0, 5.35, 0.65],
    portraitLookAt: [0.0, 0.02, 0.0],
    fovAlpha: 0.40,
    distBeta: 0.58,
    maxFov: 50,
    landscapeBeta: 0.12,
  },
  aux2: {
    name: 'aux2',
    label: 'Aux/2 ALU',
    subtitle: 'Macro inspection of the East flank 16-byte UInt128 ALU & FuelWitness array',
    pos: [2.55, 2.15, 2.35],
    lookAt: [1.62, 0.05, 0.22],
    fov: 32,
    portraitPos: [2.50, 2.35, 2.45],
    portraitLookAt: [1.48, 0.05, 0.12],
    fovAlpha: 0.38,
    distBeta: 0.56,
    maxFov: 48,
    landscapeBeta: 0.12,
  },
  loom: {
    name: 'loom',
    label: 'IVC Proof Ribbon',
    subtitle: 'Studio view of the North ReferenceSlice execution progress track',
    pos: [-1.60, 2.35, 3.10],
    lookAt: [0, 0.08, -1.25],
    fov: 32,
    portraitPos: [-0.85, 2.65, 3.35],
    portraitLookAt: [0.0, 0.06, -1.32],
    fovAlpha: 0.38,
    distBeta: 0.56,
    maxFov: 48,
    landscapeBeta: 0.12,
  },
  cinema: {
    name: 'cinema',
    label: 'Cinema Orbit',
    subtitle: 'Gentle, slow orbital rotation around the Sherlock chip',
    pos: [3.65, 4.45, 4.95],
    lookAt: [-0.25, -0.16, 0.0],
    fov: 32,
    portraitPos: [3.40, 4.85, 4.95],
    portraitLookAt: [-0.42, -0.18, 0.0],
    fovAlpha: 0.38,
    distBeta: 0.56,
    maxFov: 48,
    landscapeBeta: 0.14,
  },
};

export function isInteriorPresetName(name) {
  return (
    name === 'interior' ||
    name === 'interior_up' ||
    name === 'interior_floor' ||
    name === 'quineling'
  );
}

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// Pre-allocated module-scope scratch math objects (zero per-frame or per-event allocations)
const _scratchOffset = new THREE.Vector3();
const _scratchPos = new THREE.Vector3();
const _scratchSpherical = new THREE.Spherical();
const _panRight = new THREE.Vector3();
const _panUp = new THREE.Vector3();
const _panFwd = new THREE.Vector3();
const _camOffset = new THREE.Vector3();
const _interiorLookDir = new THREE.Vector3();
const _interiorLookTarget = new THREE.Vector3();
const _interiorHorizFwd = new THREE.Vector3();
const _interiorHorizRight = new THREE.Vector3();
const _compPos = [0, 0, 0];
const _compLookAt = [0, 0, 0];
const _compResult = {
  fov: 32,
  distMultiplier: 1.0,
  portraitBlend: 0.0,
  pos: _compPos,
  lookAt: _compLookAt,
};

export function computeAspectCompensation(preset, aspect = 1.7778, out = _compResult) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0.05 ? aspect : 1.7778;
  const baseFov = preset?.fov || 32;
  const maxFov = preset?.maxFov || (isInteriorPresetName(preset?.name) ? 90 : 50);
  const fovAlpha = preset?.fovAlpha ?? (isInteriorPresetName(preset?.name) ? 0.28 : 0.38);
  const distBeta = preset?.distBeta ?? 0.56;
  const landscapeBeta = preset?.landscapeBeta ?? 0.14;

  let portraitBlend = 0.0;
  let effectiveFov = baseFov;
  let distMultiplier = 1.0;

  if (safeAspect < ASPECT_COMPENSATION_THRESHOLD) {
    const clampedAspect = clamp(safeAspect, ASPECT_MIN_CLAMP, ASPECT_COMPENSATION_THRESHOLD);
    const rho = ASPECT_COMPENSATION_THRESHOLD / clampedAspect;
    const t = clamp(
      (ASPECT_COMPENSATION_THRESHOLD - clampedAspect) /
        (ASPECT_COMPENSATION_THRESHOLD - ASPECT_PORTRAIT_FULL_BLEND),
      0.0,
      1.0
    );
    portraitBlend = t * t * (3.0 - 2.0 * t);

    const baseHalfTan = Math.tan(baseFov * 0.5 * DEG2RAD);
    const maxHalfTan = Math.tan(maxFov * 0.5 * DEG2RAD);
    const desiredHalfTan = Math.min(maxHalfTan, baseHalfTan * Math.pow(rho, fovAlpha));
    effectiveFov = clamp(2.0 * Math.atan(desiredHalfTan) * RAD2DEG, baseFov, maxFov);

    const achievedFovGain = desiredHalfTan / Math.max(1e-6, baseHalfTan);
    if (!isInteriorPresetName(preset?.name)) {
      const totalCoverageGain = Math.pow(rho, fovAlpha + distBeta);
      distMultiplier = totalCoverageGain / Math.max(1.0, achievedFovGain);
    }
  } else if (safeAspect > ASPECT_LANDSCAPE_WIDE_THRESHOLD && !isInteriorPresetName(preset?.name)) {
    const wideRatio = Math.min(safeAspect, 2.45) / ASPECT_LANDSCAPE_WIDE_THRESHOLD;
    distMultiplier = Math.pow(wideRatio, landscapeBeta);
  }

  const basePos = preset?.pos || [3.85, 4.85, 5.35];
  const portPos = preset?.portraitPos || basePos;
  const baseLook = preset?.lookAt || [0, 0, 0];
  const portLook = preset?.portraitLookAt || baseLook;

  out.pos[0] = lerp(basePos[0], portPos[0], portraitBlend);
  out.pos[1] = lerp(basePos[1], portPos[1], portraitBlend);
  out.pos[2] = lerp(basePos[2], portPos[2], portraitBlend);

  out.lookAt[0] = lerp(baseLook[0], portLook[0], portraitBlend);
  out.lookAt[1] = lerp(baseLook[1], portLook[1], portraitBlend);
  out.lookAt[2] = lerp(baseLook[2], portLook[2], portraitBlend);

  out.fov = effectiveFov;
  out.distMultiplier = distMultiplier;
  out.portraitBlend = portraitBlend;
  return out;
}

function resolvePhaseMode(phase, controlKind) {
  const p = phase || CONTROL_KIND_META[controlKind]?.phase || 'STILL';
  if (p === 'INGEST' || p === 'DESCEND') return 1;
  if (p === 'RESOLVE' || p === 'RETURN') return 2;
  return 0;
}

// ---------------------------------------------------------------------------
// Minimalist 8-Corner Hairline Reticle (Zero Per-Frame Allocations)
// ---------------------------------------------------------------------------

function createInspectorReticle() {
  const reticleGroup = new THREE.Group();
  reticleGroup.name = 'CinemaInspectorReticle';
  reticleGroup.visible = false;
  reticleGroup.userData.isInspectorReticle = true;

  // 8 corners * 3 orthogonal hairline segments * 2 vertices = 48 vertices
  const cornerPositions = new Float32Array(48 * 3);
  const cornerGeo = new THREE.BufferGeometry();
  cornerGeo.setAttribute('position', new THREE.BufferAttribute(cornerPositions, 3));

  const cornerMat = new THREE.LineBasicMaterial({
    color: PALETTE.goldBright,
    transparent: true,
    opacity: 0.88,
    depthTest: false,
  });
  const cornerLines = new THREE.LineSegments(cornerGeo, cornerMat);
  cornerLines.renderOrder = 999;
  cornerLines.userData.isInspectorReticle = true;
  cornerLines.raycast = () => {};
  reticleGroup.add(cornerLines);

  const cornerSigns = [
    [1, 1, 1],
    [-1, 1, 1],
    [1, -1, 1],
    [-1, -1, 1],
    [1, 1, -1],
    [-1, 1, -1],
    [1, -1, -1],
    [-1, -1, -1],
  ];

  function updateGeometryFromBox(min, max, ambient = 0, pinned = false) {
    const dx = Math.max(0.035, max.x - min.x);
    const dy = Math.max(0.025, max.y - min.y);
    const dz = Math.max(0.035, max.z - min.z);

    const pulse = (pinned ? 0.0025 : 0.005) * Math.sin(ambient * 4.0);
    const x0 = min.x - pulse;
    const y0 = min.y - pulse;
    const z0 = min.z - pulse;
    const x1 = max.x + pulse;
    const y1 = max.y + pulse;
    const z1 = max.z + pulse;

    const bx = clamp(dx * 0.22, 0.018, 0.11);
    const by = clamp(dy * 0.22, 0.014, 0.09);
    const bz = clamp(dz * 0.22, 0.018, 0.11);

    let idx = 0;
    for (let i = 0; i < 8; i++) {
      const [sx, sy, sz] = cornerSigns[i];
      const cx = sx > 0 ? x0 : x1;
      const cy = sy > 0 ? y0 : y1;
      const cz = sz > 0 ? z0 : z1;

      // X hairline
      cornerPositions[idx++] = cx;
      cornerPositions[idx++] = cy;
      cornerPositions[idx++] = cz;
      cornerPositions[idx++] = cx + sx * bx;
      cornerPositions[idx++] = cy;
      cornerPositions[idx++] = cz;

      // Y hairline
      cornerPositions[idx++] = cx;
      cornerPositions[idx++] = cy;
      cornerPositions[idx++] = cz;
      cornerPositions[idx++] = cx;
      cornerPositions[idx++] = cy + sy * by;
      cornerPositions[idx++] = cz;

      // Z hairline
      cornerPositions[idx++] = cx;
      cornerPositions[idx++] = cy;
      cornerPositions[idx++] = cz;
      cornerPositions[idx++] = cx;
      cornerPositions[idx++] = cy;
      cornerPositions[idx++] = cz + sz * bz;
    }

    cornerGeo.attributes.position.needsUpdate = true;
    cornerMat.color.setHex(pinned ? PALETTE.heatBright : PALETTE.goldBright);
    cornerMat.opacity = pinned ? 0.96 : 0.84;
  }

  function dispose() {
    cornerGeo.dispose();
    cornerMat.dispose();
  }

  return {
    group: reticleGroup,
    updateGeometryFromBox,
    dispose,
  };
}

// ---------------------------------------------------------------------------
// Designer 7 Factory: Pure WebGPU Camera Choreography, Throttled Raycaster & Reticle
// ---------------------------------------------------------------------------

export function createCinemaSubsystem({
  camera,
  domElement,
  scene,
  onInspect = null,
} = {}) {
  const group = new THREE.Group();
  group.name = 'Designer7_Cinema';

  let inspectCallback = typeof onInspect === 'function' ? onInspect : null;

  // Minimalist 8-corner hairline reticle
  const reticle = createInspectorReticle();
  group.add(reticle.group);

  // -------------------------------------------------------------------------
  // 1. Smooth Damped Camera Choreography, Aspect Compensation & Micro-Gimbal
  // -------------------------------------------------------------------------
  const MIN_ORBIT_DISTANCE = 0.45;
  const BASE_MAX_ORBIT_DISTANCE = 22.0;
  const MIN_PHI = 0.002;

  // Interior First-Person / Micro-Gimbal bounds (strictly inside the open central atrium `r <= 0.94`)
  const INTERIOR_MAX_RADIAL = 0.94;
  const INTERIOR_MIN_Y = -2.96;
  const INTERIOR_MAX_Y = -0.52;
  const INTERIOR_MIN_PITCH = -Math.PI * 0.465; // -83.7° (look straight down at 3D floor chiplets)
  const INTERIOR_MAX_PITCH = Math.PI * 0.472;  // +85.0° (look straight up through open bore at 6 rings)
  const INTERIOR_MIN_FOV = 38;
  const INTERIOR_MAX_FOV = 90;

  // Inertial physics & gesture thresholds
  const INERTIA_DECAY_RATE = 6.5;              // Exponential decay Math.exp(-dt * 6.5)
  const MAX_ANGULAR_VELOCITY = 14.0;           // rad/s clamp for flicks
  const MAX_INERTIA_SPEED = MAX_ANGULAR_VELOCITY;
  const INERTIA_EPSILON = 0.004;
  const MAX_BORE_VELOCITY = 4.5;               // world-units/s clamp for vertical bore flicks
  const SPIN_CATCH_THRESHOLD = 0.35;           // rad/s above which a tap halts spin instead of raycasting
  const TAP_MAX_TRAVEL_PX = 8.0;               // < 8px total travel for tap raycast
  const TAP_MAX_DURATION_MS = 300;             // < 300ms duration for tap raycast
  const DOUBLE_TAP_MAX_DELAY_MS = 280;         // < 280ms between taps for reset
  const DOUBLE_TAP_MAX_DIST_PX = 24.0;         // < 24px separation between taps for reset

  let currentPresetName = 'overview';
  let currentAspect =
    camera && Number.isFinite(camera.aspect) && camera.aspect > 0.05 ? camera.aspect : 1.7778;
  let currentDistMultiplier = 1.0;
  let userZoomRatio = 1.0;
  let hasUserPanOrOrbit = false;
  let desiredFov = CAMERA_PRESETS.overview.fov || 32;
  let transitionArcBoost = 0.0;

  const initComp = computeAspectCompensation(CAMERA_PRESETS.overview, currentAspect);
  desiredFov = initComp.fov;
  currentDistMultiplier = initComp.distMultiplier;

  const userPanOffset = new THREE.Vector3(0, 0, 0);
  const currentTarget = new THREE.Vector3(...initComp.lookAt);
  const desiredTarget = new THREE.Vector3(...initComp.lookAt);

  _scratchOffset.set(...initComp.pos).sub(currentTarget);
  _scratchSpherical.setFromVector3(_scratchOffset);

  let currentRadius = _scratchSpherical.radius * currentDistMultiplier;
  let currentPhi = _scratchSpherical.phi;
  let currentTheta = _scratchSpherical.theta;

  let desiredRadius = currentRadius;
  let desiredPhi = _scratchSpherical.phi;
  let desiredTheta = _scratchSpherical.theta;

  // First-person micro-gimbal state for `interior` mode (`∂eye/∂yaw = ∂eye/∂pitch = 0`)
  const interiorEye = new THREE.Vector3(...CAMERA_PRESETS.interior.pos);
  const desiredInteriorEye = new THREE.Vector3(...CAMERA_PRESETS.interior.pos);
  let interiorHeight = CAMERA_PRESETS.interior.pos[1];
  let interiorYaw = 0.0;
  let desiredInteriorYaw = 0.0;
  let interiorPitch = 0.08;
  let desiredInteriorPitch = 0.08;

  // Inertial angular & vertical bore velocities
  let inertiaVelTheta = 0.0;
  let inertiaVelPhi = 0.0;
  let inertiaVelYaw = 0.0;
  let inertiaVelPitch = 0.0;
  let inertiaVelBoreY = 0.0;

  function zeroInertia() {
    inertiaVelTheta = 0.0;
    inertiaVelPhi = 0.0;
    inertiaVelYaw = 0.0;
    inertiaVelPitch = 0.0;
    inertiaVelBoreY = 0.0;
  }

  function isSpinningSignificantly() {
    return (
      Math.hypot(inertiaVelTheta, inertiaVelPhi) > SPIN_CATCH_THRESHOLD ||
      Math.hypot(inertiaVelYaw, inertiaVelPitch) > SPIN_CATCH_THRESHOLD ||
      Math.abs(inertiaVelBoreY) > 0.25
    );
  }

  function clampInteriorEye(vec) {
    const r = Math.hypot(vec.x, vec.z);
    if (r > INTERIOR_MAX_RADIAL) {
      const s = INTERIOR_MAX_RADIAL / r;
      vec.x *= s;
      vec.z *= s;
    }
    vec.y = clamp(vec.y, INTERIOR_MIN_Y, INTERIOR_MAX_Y);
    interiorHeight = vec.y;
  }

  function seedInteriorFromPreset(preset, aspectToUse = currentAspect) {
    const comp = computeAspectCompensation(preset, aspectToUse);
    desiredFov = comp.fov;
    currentDistMultiplier = 1.0;

    desiredInteriorEye.set(comp.pos[0], comp.pos[1], comp.pos[2]);
    clampInteriorEye(desiredInteriorEye);

    _scratchOffset
      .set(comp.lookAt[0], comp.lookAt[1], comp.lookAt[2])
      .sub(desiredInteriorEye)
      .normalize();

    const seedPitch = clamp(
      Math.asin(clamp(_scratchOffset.y, -0.995, 0.995)),
      INTERIOR_MIN_PITCH,
      INTERIOR_MAX_PITCH
    );
    const seedYaw = Math.atan2(_scratchOffset.x, -_scratchOffset.z);

    let deltaYaw = seedYaw - interiorYaw;
    while (deltaYaw > Math.PI) deltaYaw -= Math.PI * 2;
    while (deltaYaw < -Math.PI) deltaYaw += Math.PI * 2;
    desiredInteriorYaw = interiorYaw + deltaYaw;
    desiredInteriorPitch = seedPitch;
  }

  seedInteriorFromPreset(CAMERA_PRESETS.interior, currentAspect);
  interiorEye.copy(desiredInteriorEye);
  interiorYaw = desiredInteriorYaw;
  interiorPitch = desiredInteriorPitch;

  {
    const ovComp = computeAspectCompensation(CAMERA_PRESETS.overview, currentAspect);
    desiredFov = ovComp.fov;
    currentDistMultiplier = ovComp.distMultiplier;
  }

  if (camera) {
    camera.fov = desiredFov;
    if (camera.near > 0.03) {
      camera.near = 0.03;
    }
    if (typeof camera.updateProjectionMatrix === 'function') {
      camera.updateProjectionMatrix();
    }
    _camOffset.setFromSphericalCoords(currentRadius, currentPhi, currentTheta);
    camera.position.copy(currentTarget).add(_camOffset);
    camera.lookAt(currentTarget);
  }

  function getMaxOrbitDistance() {
    return BASE_MAX_ORBIT_DISTANCE * Math.max(1.0, currentDistMultiplier);
  }

  function getMaxPhiForState(radius, target) {
    if (currentPresetName === 'frames' || target.y < 0.0) {
      return Math.PI * 0.96;
    }
    const inCentralWell = Math.hypot(target.x, target.z) < 0.96 && target.y < 0.05;
    if (inCentralWell && radius < 3.2 * currentDistMultiplier) {
      return Math.PI * 0.96;
    }
    return Math.PI * 0.48;
  }

  function applyAspectToActivePreset({ immediate = false } = {}) {
    const preset = CAMERA_PRESETS[currentPresetName] || CAMERA_PRESETS.overview;
    if (isInteriorPresetName(currentPresetName)) {
      if (!hasUserPanOrOrbit) {
        seedInteriorFromPreset(preset, currentAspect);
        if (immediate) {
          interiorEye.copy(desiredInteriorEye);
          interiorYaw = desiredInteriorYaw;
          interiorPitch = desiredInteriorPitch;
        }
      } else {
        const comp = computeAspectCompensation(preset, currentAspect);
        desiredFov = comp.fov;
      }
    } else {
      const comp = computeAspectCompensation(preset, currentAspect);
      desiredFov = comp.fov;
      currentDistMultiplier = comp.distMultiplier;

      _scratchOffset
        .set(comp.pos[0], comp.pos[1], comp.pos[2])
        .sub(_scratchPos.set(comp.lookAt[0], comp.lookAt[1], comp.lookAt[2]));
      _scratchSpherical.setFromVector3(_scratchOffset);

      const maxDist = getMaxOrbitDistance();
      desiredRadius = clamp(
        _scratchSpherical.radius * currentDistMultiplier * userZoomRatio,
        MIN_ORBIT_DISTANCE,
        maxDist
      );

      if (!hasUserPanOrOrbit) {
        desiredTarget.set(comp.lookAt[0], comp.lookAt[1], comp.lookAt[2]);
        const maxPhi = getMaxPhiForState(desiredRadius, desiredTarget);
        desiredPhi = clamp(_scratchSpherical.phi, MIN_PHI, maxPhi);
      }

      if (immediate) {
        currentTarget.copy(desiredTarget);
        currentRadius = desiredRadius;
        currentPhi = desiredPhi;
        currentTheta = desiredTheta;
      }
    }

    if (immediate && camera) {
      camera.fov = desiredFov;
      if (typeof camera.updateProjectionMatrix === 'function') {
        camera.updateProjectionMatrix();
      }
      if (!isInteriorPresetName(currentPresetName)) {
        _camOffset.setFromSphericalCoords(currentRadius, currentPhi, currentTheta);
        camera.position.copy(currentTarget).add(_camOffset);
        camera.lookAt(currentTarget);
      }
    }
  }

  function setAspect(nextAspect, options = {}) {
    if (!Number.isFinite(nextAspect) || nextAspect <= 0.05) return currentDistMultiplier;
    const aspectChanged = Math.abs(nextAspect - currentAspect) > 1e-4;
    currentAspect = nextAspect;
    if (aspectChanged || options.immediate) {
      applyAspectToActivePreset(options);
    }
    return currentDistMultiplier;
  }

  function setCameraPreset(presetName) {
    const key = CAMERA_PRESETS[presetName] ? presetName : 'overview';
    const prevPresetName = currentPresetName;
    const wasInterior = isInteriorPresetName(prevPresetName);
    const nowInterior = isInteriorPresetName(key);
    currentPresetName = key;
    userZoomRatio = 1.0;
    hasUserPanOrOrbit = false;
    userPanOffset.set(0, 0, 0);
    zeroInertia();

    if (camera && Number.isFinite(camera.aspect) && camera.aspect > 0.05) {
      currentAspect = camera.aspect;
    }

    const preset = CAMERA_PRESETS[key];
    const comp = computeAspectCompensation(preset, currentAspect);
    desiredFov = comp.fov;
    currentDistMultiplier = comp.distMultiplier;

    if (nowInterior) {
      if (!wasInterior && camera) {
        interiorEye.set(comp.pos[0] * 0.5, -0.65, comp.pos[2] * 0.5);
        clampInteriorEye(interiorEye);
      }
      seedInteriorFromPreset(preset, currentAspect);
      transitionArcBoost = 0.0;
      if (camera) {
        camera.near = 0.008;
        if (typeof camera.updateProjectionMatrix === 'function') {
          camera.updateProjectionMatrix();
        }
      }
      return preset;
    }

    if (wasInterior && camera) {
      const cosP = Math.cos(interiorPitch);
      currentTarget.set(
        interiorEye.x + Math.sin(interiorYaw) * cosP * 0.45,
        interiorEye.y + Math.sin(interiorPitch) * 0.45,
        interiorEye.z - Math.cos(interiorYaw) * cosP * 0.45
      );
      _scratchOffset.copy(camera.position).sub(currentTarget);
      if (_scratchOffset.lengthSq() > 1e-6) {
        _scratchSpherical.setFromVector3(_scratchOffset);
        currentRadius = clamp(_scratchSpherical.radius, MIN_ORBIT_DISTANCE, getMaxOrbitDistance());
        currentPhi = clamp(_scratchSpherical.phi, MIN_PHI, Math.PI * 0.96);
        currentTheta = _scratchSpherical.theta;
      }
      camera.near = 0.025;
      if (typeof camera.updateProjectionMatrix === 'function') {
        camera.updateProjectionMatrix();
      }
    }

    desiredTarget.set(comp.lookAt[0], comp.lookAt[1], comp.lookAt[2]);
    _scratchOffset
      .set(comp.pos[0], comp.pos[1], comp.pos[2])
      .sub(desiredTarget);
    _scratchSpherical.setFromVector3(_scratchOffset);

    desiredRadius = clamp(
      _scratchSpherical.radius * currentDistMultiplier,
      MIN_ORBIT_DISTANCE,
      getMaxOrbitDistance()
    );
    const maxPhi = getMaxPhiForState(desiredRadius, desiredTarget);
    desiredPhi = clamp(_scratchSpherical.phi, MIN_PHI, maxPhi);

    let deltaTheta = _scratchSpherical.theta - currentTheta;
    while (deltaTheta > Math.PI) deltaTheta -= Math.PI * 2;
    while (deltaTheta < -Math.PI) deltaTheta += Math.PI * 2;
    desiredTheta = currentTheta + deltaTheta;

    if (prevPresetName !== key) {
      transitionArcBoost = 1.0;
    }

    return preset;
  }

  function resetCamera() {
    const preset = setCameraPreset(currentPresetName);
    if (!isInteriorPresetName(currentPresetName)) {
      transitionArcBoost = 0.38;
    }
    if (pinnedObject) {
      pinnedObject = null;
      emitInspect(null, false);
    }
    return preset;
  }

  function getCameraPreset() {
    return currentPresetName;
  }

  // -------------------------------------------------------------------------
  // 2. High-Performance Throttled Raycaster (<= 16 Hz / 60ms) &
  //    Multi-Pointer Touch + Inertial Gesture Engine
  // -------------------------------------------------------------------------
  const raycaster = new THREE.Raycaster();
  raycaster.params.Line = { threshold: 0.015 };
  const pointerNDC = new THREE.Vector2();
  let pointerInside = false;

  const activePointers = new Map();
  let isDragging = false;
  let isPanning = false;
  let gestureHadMultiTouch = false;
  let wasSpinningOnDown = false;
  let dragMovedDistance = 0;
  let lastMoveTimestamp = 0;

  let lastTapTime = 0;
  let lastTapX = -9999;
  let lastTapY = -9999;

  let lastRaycastTime = 0;
  let lastRaycastClientX = -9999;
  let lastRaycastClientY = -9999;
  const RAYCAST_THROTTLE_MS = 60;

  let hoveredObject = null;
  let pinnedObject = null;

  // Smoothed world-space bounding box for the inspector reticle
  const rawBox = new THREE.Box3();
  const smoothMin = new THREE.Vector3();
  const smoothMax = new THREE.Vector3();
  let reticleInitialized = false;

  const floorRuleProxyCache = new Map();
  function getFloorRuleProxy(instancedMesh, cellRecord) {
    let proxy = floorRuleProxyCache.get(cellRecord.index);
    if (!proxy) {
      const rule = cellRecord.rule;
      proxy = {
        name: `FloorRule_${rule.id}`,
        visible: true,
        parent: instancedMesh.parent,
        customBox: new THREE.Box3(
          new THREE.Vector3(cellRecord.x - 0.20, -3.38, cellRecord.z - 0.17),
          new THREE.Vector3(cellRecord.x + 0.20, -3.28, cellRecord.z + 0.17)
        ),
        userData: {
          inspectable: true,
          type: 'k-decoder-rule-chiplet',
          id: `floor-rule-${rule.id}`,
          title: `${rule.id} · L${rule.line} ${rule.shortName}`,
          subtitle: `${rule.fullName} · ${rule.categoryLabel}`,
          details: [
            rule.description,
            `Fuel Charge: ${rule.charge}F · Matrix Slot [${cellRecord.row + 1}, ${cellRecord.col + 1}]`,
          ],
        },
      };
      floorRuleProxyCache.set(cellRecord.index, proxy);
    } else {
      proxy.parent = instancedMesh.parent;
    }
    return proxy;
  }

  function findInspectableTarget(intersections) {
    for (let i = 0; i < intersections.length; i++) {
      const hit = intersections[i];
      const hitObj = hit.object;
      if (!hitObj || hitObj.userData?.isInspectorReticle) continue;

      let visCheck = hitObj;
      let isVisible = true;
      while (visCheck) {
        if (visCheck.visible === false) {
          isVisible = false;
          break;
        }
        visCheck = visCheck.parent;
      }
      if (!isVisible) continue;

      const ruleRecords = hitObj.userData?.ruleRecords;
      if (Array.isArray(ruleRecords) && hit.instanceId !== undefined && ruleRecords[hit.instanceId]) {
        return getFloorRuleProxy(hitObj, ruleRecords[hit.instanceId]);
      }

      let cur = hitObj;
      while (cur) {
        if (cur.userData?.inspectable) {
          return cur;
        }
        cur = cur.parent;
      }
      if (hitObj.userData?.inspectableParent) {
        return hitObj.userData.inspectableParent;
      }
    }
    return null;
  }

  function extractInspectMeta(obj, pinned = false) {
    if (!obj || !obj.userData) return null;
    const ud = obj.userData;
    return {
      type: ud.type || 'component',
      id: ud.id || obj.name || 'subsystem',
      title: ud.title || obj.name || 'Sherlock Subsystem',
      subtitle: ud.subtitle || '',
      details: ud.details || {},
      pinned,
    };
  }

  function emitInspect(obj, pinned = false) {
    if (!inspectCallback) return;
    if (!obj) {
      inspectCallback(null);
      return;
    }
    inspectCallback(extractInspectMeta(obj, pinned));
  }

  const _raycastHits = [];

  function performRaycast(forceWhenStationary = false) {
    if (!camera || !scene || !pointerInside) return null;
    if (isDragging && !forceWhenStationary) return null;
    raycaster.setFromCamera(pointerNDC, camera);
    _raycastHits.length = 0;
    const hits = raycaster.intersectObjects(scene.children, true, _raycastHits);
    const target = findInspectableTarget(hits);

    if (target !== hoveredObject) {
      hoveredObject = target;
      if (!pinnedObject) {
        emitInspect(hoveredObject, false);
      }
    }
    if (domElement) {
      domElement.style.cursor = isDragging
        ? 'grabbing'
        : hoveredObject
          ? 'pointer'
          : 'grab';
    }
    return target;
  }

  function updatePointerNDC(event) {
    if (!domElement) return;
    const rect = domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerNDC.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function releasePointerCaptureSafe(pointerId) {
    if (
      domElement &&
      domElement.releasePointerCapture &&
      pointerId !== null &&
      pointerId !== undefined
    ) {
      try {
        if (!domElement.hasPointerCapture || domElement.hasPointerCapture(pointerId)) {
          domElement.releasePointerCapture(pointerId);
        }
      } catch (_) {
        // Ignore release errors
      }
    }
  }

  function releaseAllPointers() {
    for (const ptrId of activePointers.keys()) {
      releasePointerCaptureSafe(ptrId);
    }
    activePointers.clear();
    isDragging = false;
    isPanning = false;
    gestureHadMultiTouch = false;
    wasSpinningOnDown = false;
    if (domElement) {
      domElement.style.cursor = hoveredObject ? 'pointer' : 'grab';
    }
  }

  function onPointerDown(event) {
    if (!domElement) return;
    if (event.pointerType === 'mouse' && event.button !== 0 && event.button !== 1 && event.button !== 2) {
      return;
    }

    const now = performance.now();
    pointerInside = true;
    updatePointerNDC(event);

    if (activePointers.size === 0) {
      wasSpinningOnDown = isSpinningSignificantly();
      gestureHadMultiTouch = false;
      dragMovedDistance = 0;
    }

    // Immediate stop on touch-down (cancels inertial coasting)
    zeroInertia();

    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      prevX: event.clientX,
      prevY: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      pointerType: event.pointerType || 'mouse',
      button: event.button ?? 0,
    });

    if (activePointers.size >= 2) {
      gestureHadMultiTouch = true;
    }

    isDragging = activePointers.size > 0;
    isPanning =
      activePointers.size === 1 &&
      (event.button === 2 || event.button === 1 || event.shiftKey);
    lastMoveTimestamp = now;

    if (domElement.setPointerCapture && event.pointerId !== undefined) {
      try {
        domElement.setPointerCapture(event.pointerId);
      } catch (_) {
        // Ignore pointer capture errors on synthetic events
      }
    }
    domElement.style.cursor = 'grabbing';
  }

  function onPointerMove(event) {
    pointerInside = true;

    if (isDragging && event.pointerType === 'mouse' && event.buttons === 0) {
      releaseAllPointers();
    }

    const tracked = activePointers.get(event.pointerId);
    if (tracked) {
      const now = performance.now();
      const dtMove = clamp((now - lastMoveTimestamp) * 0.001, 0.004, 0.065);
      lastMoveTimestamp = now;

      tracked.prevX = tracked.x;
      tracked.prevY = tracked.y;
      tracked.x = event.clientX;
      tracked.y = event.clientY;

      const stepDist = Math.hypot(tracked.x - tracked.prevX, tracked.y - tracked.prevY);
      dragMovedDistance += stepDist;

      // -------------------------------------------------------------------
      // Branch A: 2-Finger Pinch-to-Zoom + 2-Finger Midpoint Pan / Elevator
      // -------------------------------------------------------------------
      if (activePointers.size >= 2) {
        gestureHadMultiTouch = true;
        zeroInertia();

        const iter = activePointers.values();
        const p1 = iter.next().value;
        const p2 = iter.next().value;

        const prevSep = Math.hypot(p2.prevX - p1.prevX, p2.prevY - p1.prevY);
        const currSep = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        const prevMidX = (p1.prevX + p2.prevX) * 0.5;
        const prevMidY = (p1.prevY + p2.prevY) * 0.5;
        const currMidX = (p1.x + p2.x) * 0.5;
        const currMidY = (p1.y + p2.y) * 0.5;

        const midDx = currMidX - prevMidX;
        const midDy = currMidY - prevMidY;

        if (isInteriorPresetName(currentPresetName)) {
          hasUserPanOrOrbit = true;
          // 2-finger pinch inside the bore adjusts vertical bore depth + subtle FOV
          if (prevSep > 12 && currSep > 12) {
            const pinchDelta = currSep - prevSep;
            desiredInteriorEye.y = clamp(
              desiredInteriorEye.y + pinchDelta * 0.0038,
              INTERIOR_MIN_Y,
              INTERIOR_MAX_Y
            );
            desiredFov = clamp(
              desiredFov * Math.pow(prevSep / currSep, 0.22),
              48,
              86
            );
          }
          // 2-finger midpoint drag translates horizontally + elevates bore height
          const moveScale = 0.0022;
          _interiorHorizFwd.set(Math.sin(interiorYaw), 0, -Math.cos(interiorYaw));
          _interiorHorizRight.set(Math.cos(interiorYaw), 0, Math.sin(interiorYaw));
          desiredInteriorEye.addScaledVector(_interiorHorizRight, -midDx * moveScale);
          desiredInteriorEye.y = clamp(
            desiredInteriorEye.y + midDy * 0.0046,
            INTERIOR_MIN_Y,
            INTERIOR_MAX_Y
          );
          clampInteriorEye(desiredInteriorEye);
          return;
        }

        // Exterior 2-finger Pinch-to-Zoom
        if (prevSep > 12 && currSep > 12) {
          const pinchRatio = clamp(prevSep / currSep, 0.75, 1.35);
          const prevRadius = desiredRadius;
          const maxDist = getMaxOrbitDistance();
          desiredRadius = clamp(desiredRadius * pinchRatio, MIN_ORBIT_DISTANCE, maxDist);
          userZoomRatio = clamp(userZoomRatio * pinchRatio, 0.25, 2.5);

          if (Math.hypot(desiredTarget.x, desiredTarget.z) < 0.65) {
            if (desiredRadius < 2.1 && pinchRatio < 1.0) {
              const diveT = clamp((2.1 - desiredRadius) / (2.1 - MIN_ORBIT_DISTANCE), 0, 1);
              const chamberY = lerp(-0.18, -2.15, diveT);
              desiredTarget.y = Math.min(desiredTarget.y, chamberY);
            } else if (prevRadius < 2.1 && pinchRatio > 1.0 && currentPresetName === 'overview') {
              const surfaceT = clamp((desiredRadius - MIN_ORBIT_DISTANCE) / (3.2 - MIN_ORBIT_DISTANCE), 0, 1);
              desiredTarget.y = lerp(desiredTarget.y, -0.12, surfaceT * 0.35);
            }
          }
        }

        // Exterior 2-finger Midpoint Pan (replaces Shift-drag on mobile!)
        if (camera && (Math.abs(midDx) > 0.1 || Math.abs(midDy) > 0.1)) {
          hasUserPanOrOrbit = true;
          const panScale = Math.max(0.9, desiredRadius) * 0.0014;
          camera.matrixWorld.extractBasis(_panRight, _panUp, _panFwd);
          desiredTarget.addScaledVector(_panRight, -midDx * panScale);
          desiredTarget.addScaledVector(_panUp, midDy * panScale);
          desiredTarget.y = clamp(desiredTarget.y, -3.35, 1.6);
          userPanOffset.copy(desiredTarget);
        }
        return;
      }

      // -------------------------------------------------------------------
      // Branch B: 1-Finger Orbit / Look + Inertial Velocity Estimation
      // -------------------------------------------------------------------
      const dx = tracked.x - tracked.prevX;
      const dy = tracked.y - tracked.prevY;
      isPanning = event.button === 2 || event.button === 1 || event.shiftKey;

      if (isInteriorPresetName(currentPresetName)) {
        hasUserPanOrOrbit = true;
        if (isPanning) {
          const moveScale = 0.0022;
          _interiorHorizFwd.set(Math.sin(interiorYaw), 0, -Math.cos(interiorYaw));
          _interiorHorizRight.set(Math.cos(interiorYaw), 0, Math.sin(interiorYaw));
          desiredInteriorEye.addScaledVector(_interiorHorizRight, -dx * moveScale);
          desiredInteriorEye.addScaledVector(_interiorHorizFwd, dy * moveScale);
          clampInteriorEye(desiredInteriorEye);
        } else {
          const dYaw = dx * 0.0052;
          const dPitch = -dy * 0.0048;
          desiredInteriorYaw += dYaw;
          desiredInteriorPitch = clamp(
            desiredInteriorPitch + dPitch,
            INTERIOR_MIN_PITCH,
            INTERIOR_MAX_PITCH
          );

          const instVelYaw = clamp(dYaw / dtMove, -MAX_INERTIA_SPEED, MAX_INERTIA_SPEED);
          const instVelPitch = clamp(dPitch / dtMove, -MAX_INERTIA_SPEED, MAX_INERTIA_SPEED);
          inertiaVelYaw = lerp(inertiaVelYaw, instVelYaw, 0.45);
          inertiaVelPitch = lerp(inertiaVelPitch, instVelPitch, 0.45);
        }
        return;
      }

      if (isPanning && camera) {
        hasUserPanOrOrbit = true;
        const panScale = Math.max(0.9, desiredRadius) * 0.0014;
        camera.matrixWorld.extractBasis(_panRight, _panUp, _panFwd);
        desiredTarget.addScaledVector(_panRight, -dx * panScale);
        desiredTarget.addScaledVector(_panUp, dy * panScale);
        desiredTarget.y = clamp(desiredTarget.y, -3.35, 1.6);
        userPanOffset.copy(desiredTarget);
        zeroInertia();
      } else {
        hasUserPanOrOrbit = true;
        const maxPhi = getMaxPhiForState(desiredRadius, desiredTarget);
        const dTheta = -dx * 0.0068;
        const dPhi = -dy * 0.0058;
        desiredTheta += dTheta;
        desiredPhi = clamp(desiredPhi + dPhi, MIN_PHI, maxPhi);

        const instVelTheta = clamp(dTheta / dtMove, -MAX_INERTIA_SPEED, MAX_INERTIA_SPEED);
        const instVelPhi = clamp(dPhi / dtMove, -MAX_INERTIA_SPEED, MAX_INERTIA_SPEED);
        inertiaVelTheta = lerp(inertiaVelTheta, instVelTheta, 0.45);
        inertiaVelPhi = lerp(inertiaVelPhi, instVelPhi, 0.45);
      }
      return;
    }

    // Hover raycast only for desktop mouse when no pointers are dragging
    if (event.pointerType === 'touch') return;

    if (
      event.clientX === lastRaycastClientX &&
      event.clientY === lastRaycastClientY
    ) {
      return;
    }

    const now = performance.now();
    if (now - lastRaycastTime < RAYCAST_THROTTLE_MS) {
      return;
    }

    lastRaycastTime = now;
    lastRaycastClientX = event.clientX;
    lastRaycastClientY = event.clientY;
    updatePointerNDC(event);
    performRaycast();
  }

  function onPointerUp(event) {
    const tracked = activePointers.get(event.pointerId);
    releasePointerCaptureSafe(event.pointerId);
    activePointers.delete(event.pointerId);

    const now = performance.now();

    // If user held their finger still for >85ms before lifting, zero out flick velocity
    if (now - lastMoveTimestamp > 85 || gestureHadMultiTouch) {
      zeroInertia();
    }

    // If 1 finger remains after a 2-finger pinch/pan, refresh its prevX/prevY so it doesn't jump
    if (activePointers.size > 0) {
      for (const rem of activePointers.values()) {
        rem.prevX = rem.x;
        rem.prevY = rem.y;
      }
      return;
    }

    isDragging = false;
    isPanning = false;

    const totalTravel = tracked
      ? Math.hypot(event.clientX - tracked.startX, event.clientY - tracked.startY)
      : dragMovedDistance;
    const tapDuration = tracked ? now - tracked.startTime : 999;

    const isCleanSingleTap =
      !gestureHadMultiTouch &&
      !wasSpinningOnDown &&
      totalTravel < TAP_MAX_TRAVEL_PX &&
      dragMovedDistance < TAP_MAX_TRAVEL_PX * 1.25 &&
      tapDuration < TAP_MAX_DURATION_MS &&
      (event.button === 0 || event.pointerType === 'touch');

    if (isCleanSingleTap) {
      zeroInertia();

      // Check for Double-Tap Reset (< 280ms and < 24px from previous clean tap)
      const dtTap = now - lastTapTime;
      const distTap = Math.hypot(event.clientX - lastTapX, event.clientY - lastTapY);
      if (dtTap > 35 && dtTap <= DOUBLE_TAP_MAX_DELAY_MS && distTap <= DOUBLE_TAP_MAX_DIST_PX) {
        lastTapTime = 0;
        resetCamera();
        if (domElement) {
          domElement.style.cursor = 'grab';
        }
        return;
      }

      lastTapTime = now;
      lastTapX = event.clientX;
      lastTapY = event.clientY;

      updatePointerNDC(event);
      lastRaycastTime = now;
      lastRaycastClientX = event.clientX;
      lastRaycastClientY = event.clientY;
      const hitTarget = performRaycast(true);
      if (hitTarget) {
        if (pinnedObject === hitTarget) {
          pinnedObject = null;
          emitInspect(hoveredObject, false);
        } else {
          pinnedObject = hitTarget;
          emitInspect(pinnedObject, true);
        }
      } else if (pinnedObject) {
        pinnedObject = null;
        emitInspect(null, false);
      }
    } else if (domElement) {
      domElement.style.cursor = hoveredObject ? 'pointer' : 'grab';
    }
  }

  function onPointerCancel(event) {
    if (event && event.pointerId !== undefined) {
      releasePointerCaptureSafe(event.pointerId);
      activePointers.delete(event.pointerId);
    }
    if (activePointers.size === 0) {
      releaseAllPointers();
      zeroInertia();
    } else {
      for (const rem of activePointers.values()) {
        rem.prevX = rem.x;
        rem.prevY = rem.y;
      }
    }
  }

  function onWindowBlur() {
    if (isDragging || activePointers.size > 0) {
      releaseAllPointers();
      zeroInertia();
    }
  }

  function onPointerLeave(event) {
    if (event && event.pointerType === 'touch') return;
    pointerInside = false;
    if (!isDragging && activePointers.size === 0) {
      hoveredObject = null;
      if (!pinnedObject) {
        emitInspect(null, false);
      }
      if (domElement) {
        domElement.style.cursor = 'grab';
      }
    }
  }

  function onWheel(event) {
    event.preventDefault();
    zeroInertia();

    // Inside the hollow chip: scroll wheel operates the vertical elevator (`y ∈ [-2.96, -0.52]`),
    // gliding smoothly between the 39 3D floor modules at the bottom and the 6 split-arc rings at the top
    // without ever pushing the camera through the chamber walls!
    if (isInteriorPresetName(currentPresetName)) {
      hasUserPanOrOrbit = true;
      desiredInteriorEye.y = clamp(
        desiredInteriorEye.y - event.deltaY * 0.0022,
        INTERIOR_MIN_Y,
        INTERIOR_MAX_Y
      );
      clampInteriorEye(desiredInteriorEye);
      return;
    }

    const zoomFactor = Math.exp(event.deltaY * 0.0011);
    const prevRadius = desiredRadius;
    const maxDist = getMaxOrbitDistance();
    desiredRadius = clamp(desiredRadius * zoomFactor, MIN_ORBIT_DISTANCE, maxDist);
    userZoomRatio = clamp(userZoomRatio * zoomFactor, 0.25, 2.5);

    // When zooming inside the central aperture (desiredRadius < 2.1), gently guide lookAt
    // down into the hollow 3D chamber so the camera dives smoothly inside the chip
    if (Math.hypot(desiredTarget.x, desiredTarget.z) < 0.65) {
      if (desiredRadius < 2.1 && event.deltaY < 0) {
        const diveT = clamp((2.1 - desiredRadius) / (2.1 - MIN_ORBIT_DISTANCE), 0, 1);
        const chamberY = lerp(-0.18, -2.15, diveT);
        desiredTarget.y = Math.min(desiredTarget.y, chamberY);
      } else if (prevRadius < 2.1 && event.deltaY > 0 && currentPresetName === 'overview') {
        const surfaceT = clamp((desiredRadius - MIN_ORBIT_DISTANCE) / (3.2 - MIN_ORBIT_DISTANCE), 0, 1);
        desiredTarget.y = lerp(desiredTarget.y, -0.12, surfaceT * 0.35);
      }
    }
  }

  function onContextMenu(event) {
    event.preventDefault();
  }

  if (domElement && domElement.addEventListener) {
    domElement.style.cursor = 'grab';
    domElement.addEventListener('pointerdown', onPointerDown);
    domElement.addEventListener('pointermove', onPointerMove);
    domElement.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('pointercancel', onPointerCancel);
    domElement.addEventListener('lostpointercapture', onPointerCancel);
    domElement.addEventListener('pointerleave', onPointerLeave);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    domElement.addEventListener('contextmenu', onContextMenu);
  }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('blur', onWindowBlur);
  }

  function isHierarchyVisible(obj) {
    let cur = obj;
    while (cur) {
      if (cur.visible === false) return false;
      cur = cur.parent;
    }
    return Boolean(obj && obj.parent);
  }

  // -------------------------------------------------------------------------
  // 3. Per-Frame Update Loop: Damped Camera Choreography, Inertial Physics & Reticle
  // -------------------------------------------------------------------------
  let lastStepIndex = -1;
  let lastBoxTarget = null;
  let lastBoxStepIndex = -1;

  function update(stepState = {}) {
    const ambient = stepState.ambient ?? 0;
    const dt = clamp(stepState.dt ?? 0.016, 0.001, 0.05);
    const step = stepState.step || {};
    const phaseMode = resolvePhaseMode(stepState.phase, step.controlKind);

    if (camera) {
      const damp = 1.0 - Math.exp(-12.0 * dt);
      const inertiaDecay = Math.exp(-INERTIA_DECAY_RATE * dt);

      if (typeof camera.fov === 'number' && Math.abs(camera.fov - desiredFov) > 0.05) {
        camera.fov = lerp(camera.fov, desiredFov, damp);
        if (typeof camera.updateProjectionMatrix === 'function') {
          camera.updateProjectionMatrix();
        }
      }

      if (isInteriorPresetName(currentPresetName)) {
        // Apply inertial coasting when fingers are lifted in interior view
        if (!isDragging && activePointers.size === 0) {
          if (Math.abs(inertiaVelYaw) > INERTIA_EPSILON || Math.abs(inertiaVelPitch) > INERTIA_EPSILON) {
            desiredInteriorYaw += inertiaVelYaw * dt;
            desiredInteriorPitch = clamp(
              desiredInteriorPitch + inertiaVelPitch * dt,
              INTERIOR_MIN_PITCH,
              INTERIOR_MAX_PITCH
            );
            inertiaVelYaw *= inertiaDecay;
            inertiaVelPitch *= inertiaDecay;
          } else {
            inertiaVelYaw = 0;
            inertiaVelPitch = 0;
          }

          if (Math.abs(inertiaVelBoreY) > INERTIA_EPSILON) {
            desiredInteriorEye.y = clamp(
              desiredInteriorEye.y + inertiaVelBoreY * dt,
              INTERIOR_MIN_Y,
              INTERIOR_MAX_Y
            );
            inertiaVelBoreY *= inertiaDecay;
          } else {
            inertiaVelBoreY = 0;
          }
        }

        // First-Person / Micro-Gimbal Interior Camera Update:
        // Strictly clamps `interiorEye` inside the sealed vault and rotates the look vector in place!
        clampInteriorEye(desiredInteriorEye);
        interiorEye.lerp(desiredInteriorEye, damp);
        clampInteriorEye(interiorEye);

        interiorYaw = lerp(interiorYaw, desiredInteriorYaw, damp);
        interiorPitch = lerp(interiorPitch, desiredInteriorPitch, damp);

        const cosPitch = Math.cos(interiorPitch);
        _interiorLookDir.set(
          Math.sin(interiorYaw) * cosPitch,
          Math.sin(interiorPitch),
          -Math.cos(interiorYaw) * cosPitch
        );

        camera.position.copy(interiorEye);
        _interiorLookTarget.copy(interiorEye).add(_interiorLookDir);
        camera.lookAt(_interiorLookTarget);

        // Keep exterior spherical state synced to current camera so switching back to exterior is seamless
        currentTarget.copy(_interiorLookTarget);
        desiredTarget.copy(_interiorLookTarget);
      } else {
        // Apply inertial coasting when fingers are lifted in exterior view
        if (!isDragging && activePointers.size === 0) {
          if (Math.abs(inertiaVelTheta) > INERTIA_EPSILON || Math.abs(inertiaVelPhi) > INERTIA_EPSILON) {
            const maxPhi = getMaxPhiForState(desiredRadius, desiredTarget);
            desiredTheta += inertiaVelTheta * dt;
            desiredPhi = clamp(desiredPhi + inertiaVelPhi * dt, MIN_PHI, maxPhi);
            inertiaVelTheta *= inertiaDecay;
            inertiaVelPhi *= inertiaDecay;
          } else {
            inertiaVelTheta = 0;
            inertiaVelPhi = 0;
          }
        }

        if (currentPresetName === 'cinema' && !isDragging && activePointers.size === 0) {
          desiredTheta += dt * 0.16;
          desiredPhi = 0.82 + Math.sin(ambient * 0.22) * 0.05;
          desiredRadius =
            (7.45 + Math.cos(ambient * 0.18) * 0.34) *
            currentDistMultiplier *
            userZoomRatio;

          const phaseTargetY =
            phaseMode === 1 ? -0.24 : phaseMode === 2 ? -0.11 : -0.16;
          desiredTarget.y = lerp(desiredTarget.y, phaseTargetY, 1.0 - Math.exp(-dt * 2.2));
        }

        currentRadius = lerp(currentRadius, desiredRadius, damp);
        currentPhi = lerp(currentPhi, desiredPhi, damp);
        currentTheta = lerp(currentTheta, desiredTheta, damp);
        currentTarget.lerp(desiredTarget, damp);

        transitionArcBoost = Math.max(0, transitionArcBoost - dt * 2.4);
        const arcLiftY = Math.sin(transitionArcBoost * Math.PI) * 0.28;

        _camOffset.setFromSphericalCoords(
          currentRadius,
          currentPhi,
          currentTheta
        );
        camera.position.copy(currentTarget).add(_camOffset);
        camera.position.y += arcLiftY;

        // Only clamp to the inner well walls when user manually zooms inside the non-cutaway North/East/West walls
        if (
          currentPresetName !== 'frames' &&
          currentPresetName !== 'quineling' &&
          currentTarget.y < -0.60 &&
          camera.position.y < -0.22 &&
          camera.position.z < 0.75
        ) {
          const horizR = Math.hypot(camera.position.x, camera.position.z);
          if (horizR > 0.94) {
            const clampScale = 0.94 / horizR;
            camera.position.x *= clampScale;
            camera.position.z *= clampScale;
          }
          camera.position.y = Math.max(camera.position.y, -3.22);
        }

        camera.lookAt(currentTarget);
      }
    }

    // Drop pinned or hovered object if it was popped/hidden
    if (pinnedObject && !isHierarchyVisible(pinnedObject)) {
      pinnedObject = null;
      emitInspect(hoveredObject && isHierarchyVisible(hoveredObject) ? hoveredObject : null, false);
    }
    if (hoveredObject && !isHierarchyVisible(hoveredObject)) {
      hoveredObject = null;
    }

    // Update Minimalist 8-Corner Hairline Reticle
    const activeInspectTarget = pinnedObject || hoveredObject;
    if (activeInspectTarget && isHierarchyVisible(activeInspectTarget)) {
      const currentStepIdx = stepState.stepIndex ?? 0;
      if (
        activeInspectTarget !== lastBoxTarget ||
        currentStepIdx !== lastBoxStepIndex ||
        rawBox.isEmpty()
      ) {
        if (activeInspectTarget.customBox) {
          rawBox.copy(activeInspectTarget.customBox);
        } else {
          rawBox.setFromObject(activeInspectTarget);
          if (!rawBox.isEmpty()) {
            rawBox.expandByScalar(0.018);
          }
        }
        lastBoxTarget = activeInspectTarget;
        lastBoxStepIndex = currentStepIdx;
      }

      if (!rawBox.isEmpty()) {
        if (!reticleInitialized) {
          smoothMin.copy(rawBox.min);
          smoothMax.copy(rawBox.max);
          reticleInitialized = true;
        } else {
          const boxDamp = 1.0 - Math.exp(-20.0 * dt);
          smoothMin.lerp(rawBox.min, boxDamp);
          smoothMax.lerp(rawBox.max, boxDamp);
        }
        reticle.group.visible = true;
        reticle.updateGeometryFromBox(smoothMin, smoothMax, ambient, Boolean(pinnedObject));

        if (stepState.stepIndex !== undefined && stepState.stepIndex !== lastStepIndex) {
          lastStepIndex = stepState.stepIndex;
          emitInspect(activeInspectTarget, Boolean(pinnedObject));
        }
      } else {
        reticle.group.visible = false;
      }
    } else {
      reticle.group.visible = false;
      reticleInitialized = false;
      lastBoxTarget = null;
    }
  }

  function setOnInspect(fn) {
    inspectCallback = typeof fn === 'function' ? fn : null;
  }

  function dispose() {
    releaseAllPointers();
    zeroInertia();
    if (domElement && domElement.removeEventListener) {
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('pointercancel', onPointerCancel);
      domElement.removeEventListener('lostpointercapture', onPointerCancel);
      domElement.removeEventListener('pointerleave', onPointerLeave);
      domElement.removeEventListener('wheel', onWheel, { passive: false });
      domElement.removeEventListener('contextmenu', onContextMenu);
    }
    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('blur', onWindowBlur);
    }
    floorRuleProxyCache.clear();
    _raycastHits.length = 0;
    hoveredObject = null;
    pinnedObject = null;
    lastBoxTarget = null;
    inspectCallback = null;
    reticle.dispose();
  }

  return {
    group,
    update,
    setCameraPreset,
    getCameraPreset,
    setAspect,
    resetCamera,
    setOnInspect,
    dispose,
  };
}
