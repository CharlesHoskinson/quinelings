import * as THREE from 'three/webgpu';
import {
  PALETTE,
  clamp,
  tagInspectable,
} from './theme.js';

const MAX_CALL_TILES = 6;
const WEST_FLANK_X = -2.88;
const GROUND_TILE_Y = -0.325;

// Clean Reference Call-Tile Palette (Obsidian Body + Terracotta/Gold Active Rim + Emerald Resolved Rim)
const HEX_TILE_IDLE = 0x2c2b29;
const HEX_TILE_ACTIVE = 0x3a261d;
const HEX_TILE_RETURNED = 0x263b34;
const HEX_TILE_FAULT = 0x421c1c;

const HEX_RIM_IDLE = 0x3a3936;
const HEX_RIM_WAITING = 0xc5a059;
const HEX_RIM_ACTIVE = 0xea580c;
const HEX_RIM_RETURNED = 0x0d9488;

function makeCanvas(width, height) {
  if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }
  return null;
}

function compactCallLabel(rawLabel) {
  if (!rawLabel) return 'call()';
  let s = String(rawLabel)
    .replace(/^Invoke\((.*)\)$/i, '$1')
    .replace(/^Enter\((.*)\)$/i, '$1')
    .replace(/^Return\((.*)\)$/i, '$1')
    .trim();

  s = s.replace(
    /branch\s*\(\s*leaf\((\d+)\)\s*,\s*branch\s*\(\s*leaf\((\d+)\)\s*,\s*leaf\((\d+)\)\s*\)\s*\)/gi,
    'B($1,B($2,$3))'
  );
  s = s.replace(/branch\s*\(\s*leaf\((\d+)\)\s*,\s*leaf\((\d+)\)\s*\)/gi, 'B($1,$2)');
  s = s.replace(/leaf\s*\(\s*(\d+)\s*\)/gi, 'L($1)');
  s = s.replace(
    /cons\s*\(\s*(\d+)\s*,\s*cons\s*\(\s*(\d+)\s*,\s*cons\s*\(\s*(\d+)\s*,\s*nil\s*\)\s*\)\s*\)/gi,
    '[$1,$2,$3]'
  );
  s = s.replace(/cons\s*\(\s*(\d+)\s*,\s*cons\s*\(\s*(\d+)\s*,\s*nil\s*\)\s*\)/gi, '[$1,$2]');
  s = s.replace(/cons\s*\(\s*(\d+)\s*,\s*nil\s*\)/gi, '[$1]');
  s = s.replace(/\s+/g, '');
  if (s.length > 16) {
    s = `${s.slice(0, 14)}..`;
  }
  return s;
}

function compactValueAtom(raw) {
  if (raw === null || raw === undefined) return '';
  let s = String(raw)
    .replace(/^Return\((.*)\)$/i, '$1')
    .replace(/^PrimOk\((.*)\)$/i, '$1')
    .replace(/^Done\((.*)\)$/i, '$1')
    .trim();
  s = s.replace(/branch\s*\(\s*leaf\((\d+)\)\s*,\s*leaf\((\d+)\)\s*\)/gi, 'B($1,$2)');
  s = s.replace(/leaf\s*\(\s*(\d+)\s*\)/gi, 'L($1)');
  if (s.length > 12) s = `${s.slice(0, 10)}..`;
  return s;
}

function resolveCallRingNumber(call) {
  const rawRing = (call.depth > 0 ? call.depth + 1 : call.index) || 1;
  return clamp(rawRing, 1, 6);
}

let _cachedTraceRef = null;
let _cachedTraceKey = '';
let _cachedAllCalls = [];

function getOrBuildTraceCalls(trace) {
  const steps = Array.isArray(trace?.steps) ? trace.steps : [];
  const traceKey = `${trace?.programName || ''}:${steps.length}`;
  if (trace && trace === _cachedTraceRef && traceKey === _cachedTraceKey) {
    return _cachedAllCalls;
  }

  const outcome = trace?.outcome || {};
  const allCalls = [];
  const openStack = [];

  for (let i = 0; i < steps.length; i += 1) {
    const s = steps[i];

    if (s?.ruleLine === 200 || s?.controlKind === 'Enter') {
      const prev = steps[Math.max(0, i - 1)];
      const rawCall =
        prev?.controlKind === 'Invoke'
          ? prev.controlSummary
          : s.controlSummary || prev?.controlSummary || 'call()';
      const cleanCall = compactCallLabel(rawCall);
      const invokeStepIdx = prev?.controlKind === 'Invoke' ? i - 1 : i;
      const parentCall = openStack.length > 0 ? openStack[openStack.length - 1] : null;
      if (parentCall) {
        parentCall.spawnedChildren += 1;
      }

      const callNode = {
        index: allCalls.length + 1,
        callExpr: cleanCall,
        rawCall: String(rawCall).replace(/^Invoke\((.*)\)$/i, '$1'),
        invokeStep: invokeStepIdx,
        enterStep: i,
        returnStep: null,
        returnValue: null,
        depth: openStack.length,
        spawnedChildren: 0,
        isFaulted: false,
        isBaseCase: false,
        status: 'future',
      };
      allCalls.push(callNode);
      openStack.push(callNode);
    } else if (s?.ruleLine === 185 && openStack.length > 0) {
      const finished = openStack.pop();
      finished.returnStep = i;
      const valStr =
        s.controlValue?.summary ??
        s.after?.control?.value?.summary ??
        s.controlSummary?.replace(/^Return\((.*)\)$/i, '$1') ??
        '';
      finished.returnValue = compactValueAtom(valStr);
    } else if (
      (s?.ruleLine === 140 || s?.ruleLine === 82 || s?.ruleLine === 84 || s?.ruleLine === 225) &&
      openStack.length > 0
    ) {
      openStack[openStack.length - 1].isFaulted = true;
    }
  }

  if (allCalls.length === 0 && steps.length > 0) {
    allCalls.push({
      index: 1,
      callExpr: trace?.programName || 'entry',
      rawCall: trace?.programName || 'entry',
      invokeStep: 0,
      enterStep: 0,
      returnStep: steps.length - 1,
      returnValue: compactValueAtom(outcome?.summary || '0'),
      depth: 0,
      spawnedChildren: 0,
      isFaulted: false,
      isBaseCase: true,
      status: 'active',
    });
  }

  for (let i = 0; i < allCalls.length; i += 1) {
    allCalls[i].isBaseCase = allCalls[i].spawnedChildren === 0;
  }

  _cachedTraceRef = trace;
  _cachedTraceKey = traceKey;
  _cachedAllCalls = allCalls;
  return allCalls;
}

const _visibleCallsScratch = [];

function evaluateCallTilesAtStep(stepState) {
  const trace = stepState?.trace;
  const steps = Array.isArray(trace?.steps) ? trace.steps : [];
  const stepIndex = clamp(stepState?.stepIndex ?? 0, 0, Math.max(0, steps.length - 1));
  const currentStep = steps[stepIndex] || stepState?.step || {};
  const allCalls = getOrBuildTraceCalls(trace);

  _visibleCallsScratch.length = 0;

  let lastOpenCall = null;
  let lastOpenIdx = -1;

  for (let i = 0; i < allCalls.length; i += 1) {
    const c = allCalls[i];
    if (stepIndex < c.invokeStep) {
      c.status = 'future';
    } else if (c.returnStep !== null && stepIndex >= c.returnStep) {
      c.status = 'resolved';
    } else {
      c.status = 'waiting';
      lastOpenCall = c;
      lastOpenIdx = i;
    }
  }

  if (lastOpenCall) {
    lastOpenCall.status = 'active';
  }

  // Slide the 6-tile window so the active call is always visible when total calls > MAX_CALL_TILES (e.g. fib(4) = 9 calls)
  let windowStart = 0;
  if (allCalls.length > MAX_CALL_TILES && lastOpenIdx >= MAX_CALL_TILES) {
    windowStart = Math.min(
      allCalls.length - MAX_CALL_TILES,
      lastOpenIdx - (MAX_CALL_TILES - 2)
    );
  }
  const windowEnd = Math.min(allCalls.length, windowStart + MAX_CALL_TILES);
  for (let i = windowStart; i < windowEnd; i += 1) {
    _visibleCallsScratch.push(allCalls[i]);
  }

  const phase = stepState?.phase || 'DESCEND';
  const isError =
    phase === 'ERROR' ||
    currentStep?.controlKind === 'Error' ||
    currentStep?.ruleLine === 82 ||
    currentStep?.ruleLine === 84 ||
    currentStep?.ruleLine === 140 ||
    currentStep?.ruleLine === 225;

  return {
    visibleCalls: _visibleCallsScratch,
    isError,
  };
}

function createCallTileCanvasPlaque() {
  const canvas = makeCanvas(512, 256);
  if (!canvas) {
    const data = new Uint8Array([0, 0, 0, 0]);
    const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
    tex.needsUpdate = true;
    return { canvas: null, ctx: null, tex };
  }
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { canvas, ctx, tex };
}

function paintCleanCallTile(plaque, label, value, status, ringTag) {
  if (!plaque.ctx || !plaque.canvas) return;
  const { ctx, canvas, tex } = plaque;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const isReturned = status === 'resolved';
  const isActive = status === 'active';
  const isWaiting = status === 'waiting';

  // Subtle top-right Ring indicator (R1..R6)
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillStyle = isReturned
    ? 'rgba(167, 243, 208, 0.72)'
    : isActive || isWaiting
      ? 'rgba(253, 230, 138, 0.72)'
      : 'rgba(155, 150, 140, 0.45)';
  ctx.font = '600 32px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(ringTag, canvas.width - 24, 18);

  // Main call expression (matching clean reference `paintTile`)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isReturned
    ? '#dfe9df'
    : isActive
      ? '#f4d9c8'
      : isWaiting
        ? '#e7e1d4'
        : '#9b968c';
  const hasVal = isReturned && Boolean(value);
  ctx.font = `600 ${hasVal ? 68 : 80}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText(label, canvas.width / 2, hasVal ? canvas.height * 0.38 : canvas.height * 0.54);

  if (hasVal) {
    ctx.fillStyle = '#cfe3d4';
    ctx.font = '500 58px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(`→ ${value}`, canvas.width / 2, canvas.height * 0.76);
  }

  tex.needsUpdate = true;
}

/**
 * Designer 4: Clean West-Flank Companion Call Chiplets on the Studio Ground Plane
 * (matching `rebuildTiles` & `makeTile` in the clean reference).
 */
export function createArenaSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer4_WestFlankCallTiles';

  const disposableGeometries = [];
  const disposableMaterials = [];
  const disposableTextures = [];

  const trackGeo = (g) => {
    disposableGeometries.push(g);
    return g;
  };
  const trackMat = (m) => {
    disposableMaterials.push(m);
    return m;
  };
  const trackTex = (t) => {
    if (t) disposableTextures.push(t);
    return t;
  };

  const tileRowGroup = new THREE.Group();
  tileRowGroup.name = 'WestFlankCallTileRow';
  tileRowGroup.position.set(WEST_FLANK_X, GROUND_TILE_Y, 0);
  group.add(tileRowGroup);

  const tileWidth = 0.72;
  const tileHeight = 0.06;
  const tileDepth = 0.44;

  const tileBodyGeo = trackGeo(new THREE.BoxGeometry(tileWidth, tileHeight, tileDepth));
  const tileEdgeGeo = trackGeo(new THREE.BoxGeometry(tileWidth + 0.05, 0.018, tileDepth + 0.05));
  const tilePlaqueGeo = trackGeo(new THREE.PlaneGeometry(tileWidth * 0.92, tileDepth * 0.88));

  const callTiles = [];

  for (let i = 0; i < MAX_CALL_TILES; i += 1) {
    const tileGroup = new THREE.Group();
    tileGroup.name = `CallTile_${i}`;
    tileRowGroup.add(tileGroup);

    const bodyMat = trackMat(
      new THREE.MeshPhysicalMaterial({
        color: HEX_TILE_IDLE,
        roughness: 0.42,
        metalness: 0.22,
      })
    );
    const bodyMesh = new THREE.Mesh(tileBodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    tileGroup.add(bodyMesh);

    const edgeMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: HEX_RIM_IDLE,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.38,
        metalness: 0.35,
      })
    );
    const edgeMesh = new THREE.Mesh(tileEdgeGeo, edgeMat);
    edgeMesh.position.y = -0.024;
    edgeMesh.receiveShadow = true;
    tileGroup.add(edgeMesh);

    const plaque = createCallTileCanvasPlaque();
    trackTex(plaque.tex);
    const ringNum = i + 1;
    const initLabel = `fact(${Math.max(0, 4 - i)})`;
    paintCleanCallTile(plaque, initLabel, '', 'future', `R${ringNum}`);

    const plaqueMat = trackMat(
      new THREE.MeshBasicMaterial({
        map: plaque.tex,
        transparent: true,
        alphaTest: 0.08,
        depthWrite: false,
        toneMapped: false,
      })
    );
    const plaqueMesh = new THREE.Mesh(tilePlaqueGeo, plaqueMat);
    plaqueMesh.rotation.x = -Math.PI / 2;
    plaqueMesh.position.y = tileHeight * 0.5 + 0.002;
    tileGroup.add(plaqueMesh);

    tagInspectable(tileGroup, {
      type: 'recursion-call-tile',
      id: `call-tile-${i + 1}`,
      title: `R${ringNum} · Call #${i + 1}`,
      subtitle: `Companion Call Chiplet · Ring R${ringNum}`,
      details: [
        `Ring R${ringNum} holds this call's frames while on the stack (Slots R${ringNum}·A & R${ringNum}·B).`,
        'Displays live function invocation state and returned value alongside the chip.',
      ],
    });

    callTiles.push({
      index: i,
      group: tileGroup,
      bodyMat,
      edgeMat,
      plaque,
      currentZ: 0,
      targetZ: 0,
      currentY: -0.02,
      targetY: 0,
      currentScale: 0.85,
      targetScale: 1.0,
      wasVisible: false,
      lastSignature: '',
      lastMetaCallIndex: -1,
      lastMetaStatus: '',
      lastMetaReturn: '',
    });
  }

  let lastStepIndex = -1;
  let lastTraceRef = null;
  let lastPhase = '';
  let cachedStepEval = { visibleCalls: [], isError: false };

  function update(stepState = {}) {
    const stepIdx = stepState.stepIndex ?? 0;
    const traceRef = stepState.trace ?? null;
    const phaseStr = stepState.phase ?? '';
    const dt = clamp(stepState.dt ?? 0.016, 0.001, 0.05);
    const damp = 1.0 - Math.exp(-dt * 15.0);

    const stepChanged =
      stepIdx !== lastStepIndex ||
      traceRef !== lastTraceRef ||
      phaseStr !== lastPhase;

    if (stepChanged) {
      lastStepIndex = stepIdx;
      lastTraceRef = traceRef;
      lastPhase = phaseStr;
      cachedStepEval = evaluateCallTilesAtStep(stepState);

      const { visibleCalls, isError } = cachedStepEval;
      const count = visibleCalls.length;
      const spacing = count <= 1 ? 0 : Math.min(0.62, 3.10 / Math.max(1, count));
      const startZ = -((count - 1) * spacing) * 0.5;

      for (let i = 0; i < MAX_CALL_TILES; i += 1) {
        const tile = callTiles[i];
        if (i >= count) {
          tile.targetScale = 0.0;
          tile.targetY = -0.025;
          continue;
        }

        const call = visibleCalls[i];
        const nextZ = startZ + i * spacing;
        if (!tile.wasVisible) {
          tile.currentZ = nextZ;
          tile.currentY = -0.022;
          tile.currentScale = 0.82;
          tile.wasVisible = true;
        }
        tile.group.visible = true;
        tile.targetZ = nextZ;
        tile.targetY = call.status === 'active' ? 0.010 : call.status === 'resolved' ? 0.003 : 0.0;
        tile.targetScale = call.status === 'active' ? 1.03 : 1.0;

        const ringNum = resolveCallRingNumber(call);
        const ringTag = `R${ringNum}`;
        const retVal = call.status === 'resolved' ? call.returnValue || 'ok' : '';

        if (call.status === 'resolved') {
          tile.bodyMat.color.setHex(HEX_TILE_RETURNED);
          tile.edgeMat.color.setHex(HEX_RIM_RETURNED);
          tile.edgeMat.emissive.setHex(HEX_RIM_RETURNED);
          tile.edgeMat.emissiveIntensity = 0.72;
        } else if (call.status === 'active') {
          const activeEdge = isError ? PALETTE.errorRed : HEX_RIM_ACTIVE;
          tile.bodyMat.color.setHex(isError ? HEX_TILE_FAULT : HEX_TILE_ACTIVE);
          tile.edgeMat.color.setHex(activeEdge);
          tile.edgeMat.emissive.setHex(activeEdge);
          tile.edgeMat.emissiveIntensity = 0.90;
        } else if (call.status === 'waiting') {
          tile.bodyMat.color.setHex(HEX_TILE_IDLE);
          tile.edgeMat.color.setHex(HEX_RIM_WAITING);
          tile.edgeMat.emissive.setHex(HEX_RIM_WAITING);
          tile.edgeMat.emissiveIntensity = 0.38;
        } else {
          tile.bodyMat.color.setHex(HEX_TILE_IDLE);
          tile.edgeMat.color.setHex(HEX_RIM_IDLE);
          tile.edgeMat.emissive.setHex(0x000000);
          tile.edgeMat.emissiveIntensity = 0.0;
        }

        const sig = `${call.callExpr}|${retVal}|${call.status}|${ringTag}`;
        if (sig !== tile.lastSignature) {
          tile.lastSignature = sig;
          paintCleanCallTile(tile.plaque, call.callExpr, retVal, call.status, ringTag);
        }

        if (
          tile.lastMetaCallIndex !== call.index ||
          tile.lastMetaStatus !== call.status ||
          tile.lastMetaReturn !== retVal
        ) {
          tile.lastMetaCallIndex = call.index;
          tile.lastMetaStatus = call.status;
          tile.lastMetaReturn = retVal;
          tile.group.userData.id = `call-tile-${call.index}`;
          tile.group.userData.ringNumber = ringNum;
          tile.group.userData.title = `${ringTag} · Call #${call.index}: ${call.rawCall}`;
          tile.group.userData.subtitle =
            call.status === 'resolved'
              ? `Ring ${ringTag} · Returned → ${retVal} (step ${call.returnStep})`
              : `Ring ${ringTag} (Slots ${ringTag}·A / ${ringTag}·B) · Status: ${call.status.toUpperCase()}`;
        }
      }
    }

    const visibleCount = cachedStepEval.visibleCalls.length;
    for (let i = 0; i < MAX_CALL_TILES; i += 1) {
      const tile = callTiles[i];
      if (!tile.group.visible) continue;
      tile.currentZ += (tile.targetZ - tile.currentZ) * damp;
      tile.currentY += (tile.targetY - tile.currentY) * damp;
      tile.currentScale += (tile.targetScale - tile.currentScale) * damp;
      tile.group.position.set(0, tile.currentY, tile.currentZ);
      const s = Math.max(0.001, tile.currentScale);
      tile.group.scale.setScalar(s);
      if (i >= visibleCount && tile.currentScale < 0.05) {
        tile.group.visible = false;
        tile.wasVisible = false;
      }
    }
  }

  function dispose() {
    for (let i = 0; i < disposableGeometries.length; i += 1) {
      disposableGeometries[i].dispose();
    }
    for (let i = 0; i < disposableMaterials.length; i += 1) {
      disposableMaterials[i].dispose();
    }
    for (let i = 0; i < disposableTextures.length; i += 1) {
      disposableTextures[i].dispose();
    }
    disposableGeometries.length = 0;
    disposableMaterials.length = 0;
    disposableTextures.length = 0;
    _cachedTraceRef = null;
    _cachedTraceKey = '';
    _cachedAllCalls = [];
    _visibleCallsScratch.length = 0;
  }

  update({ ambient: 0, dt: 0.016, stepFraction: 0 });

  return {
    group,
    update,
    dispose,
  };
}
