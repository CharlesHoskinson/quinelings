import * as THREE from 'three/webgpu';
import {
  PALETTE,
  clamp,
  tagInspectable,
} from './theme.js';

const MAX_STEPS = 32;
const CHANNEL_Y = 0.1062;
const BAR_Y = 0.1068;
const BAR_Z = -1.66;
const BAR_SPAN_X = 2.48;

const DARK_SAPPHIRE_SLATE_HEX = 0x151513;
const PENDING_SAPPHIRE_SLOT_HEX = 0x262930;
const CYAN_TEAL_HEX = 0x2dd4bf;
const LUMINOUS_GOLD_HEX = 0xfbbf24;

// Module-scope reusable scratch objects — zero allocations inside .update(stepState)
const _tmpMatrix = new THREE.Matrix4();
const _tmpPos = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _tmpScale = new THREE.Vector3();
const _tmpColor = new THREE.Color();

/**
 * Designer 6: Silent, Flush Rear Execution Progress Bar in the North Perimeter Groove
 */
export function createLoomSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer6_FlushExecutionProgressBar';

  const disposables = [];
  const track = (r) => {
    if (r) disposables.push(r);
    return r;
  };

  const channelGeo = track(new THREE.BoxGeometry(BAR_SPAN_X + 0.05, 0.0008, 0.018));
  const channelMat = track(
    new THREE.MeshStandardMaterial({
      color: DARK_SAPPHIRE_SLATE_HEX,
      roughness: 0.58,
      metalness: 0.22,
    })
  );
  const channelMesh = new THREE.Mesh(channelGeo, channelMat);
  channelMesh.position.set(0, CHANNEL_Y, BAR_Z);
  channelMesh.receiveShadow = true;
  group.add(channelMesh);

  // Single InstancedMesh for all 32 flush execution progress segments (1 draw call total)
  const segGeo = track(new THREE.BoxGeometry(1, 0.0012, 0.012));
  const segMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    })
  );

  const progressInstanced = new THREE.InstancedMesh(segGeo, segMat, MAX_STEPS);
  progressInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  group.add(progressInstanced);

  const lastSegHex = new Uint32Array(MAX_STEPS);

  // Pre-initialize all 32 matrices & colors so GPU buffers are allocated upfront
  for (let i = 0; i < MAX_STEPS; i++) {
    _tmpPos.set(0, BAR_Y, BAR_Z);
    _tmpScale.set(0.04, 1, 1);
    _tmpMatrix.compose(_tmpPos, _tmpQuat, _tmpScale);
    progressInstanced.setMatrixAt(i, _tmpMatrix);
    _tmpColor.setHex(PENDING_SAPPHIRE_SLOT_HEX);
    progressInstanced.setColorAt(i, _tmpColor);
    lastSegHex[i] = PENDING_SAPPHIRE_SLOT_HEX;
  }
  progressInstanced.instanceMatrix.needsUpdate = true;
  if (progressInstanced.instanceColor) {
    progressInstanced.instanceColor.setUsage(THREE.DynamicDrawUsage);
    progressInstanced.instanceColor.needsUpdate = true;
  }
  progressInstanced.computeBoundingSphere();

  tagInspectable(group, {
    type: 'execution-progress',
    id: 'flush-rear-progress-filament',
    title: 'Flush Execution Progress Filament',
    subtitle: 'y = 0.1052, z = -1.92 // Sapphire-Slate Track · Slice-Grouped Execution Progress',
    details: '32-segment execution progress bar grouped by ReferenceSlice width and inset flush into a dark sapphire-slate track on the rear brushed silver-platinum deck (y = 0.1052).',
  });

  const _pendingColor = new THREE.Color(PENDING_SAPPHIRE_SLOT_HEX);
  const _activeColor = new THREE.Color(LUMINOUS_GOLD_HEX);
  const _doneColor = new THREE.Color(CYAN_TEAL_HEX);
  let lastSegmentCount = -1;
  let lastSliceWidth = -1;
  let lastActiveSeg = -1;
  let lastPhase = '';
  let lastFracBucket = -1;

  function update(stepState = {}) {
    const rawSteps = stepState.trace?.steps;
    const rawTotalSteps = Math.max(
      1,
      Number(stepState.totalSteps) || (Array.isArray(rawSteps) ? rawSteps.length : 16)
    );
    const segmentCount = clamp(rawTotalSteps, 1, MAX_STEPS);
    const sliceWidth = clamp(Number(stepState.trace?.sliceWidth) || 4, 1, 16);
    const rawStepIndex = clamp(Number(stepState.stepIndex) || 0, 0, rawTotalSteps - 1);
    const stepFraction = clamp(Number(stepState.stepFraction ?? stepState.sub ?? 0), 0, 1);
    const continuousStep = Math.min(rawTotalSteps - 1, rawStepIndex + stepFraction);
    const progress = rawTotalSteps <= 1 ? 1 : continuousStep / (rawTotalSteps - 1);
    const exactSeg =
      rawTotalSteps <= MAX_STEPS
        ? continuousStep
        : clamp(progress * segmentCount, 0, segmentCount - 1);
    const activeSegment = Math.floor(exactSeg);
    const segFraction = exactSeg - activeSegment;
    const fracBucket = Math.round(segFraction * 24);
    const phase = stepState.phase || 'DESCEND';

    // Recompute segment widths & slice-grouped positions only when segmentCount or sliceWidth changes
    if (segmentCount !== lastSegmentCount || sliceWidth !== lastSliceWidth) {
      lastSegmentCount = segmentCount;
      lastSliceWidth = sliceWidth;

      const nomPitch = BAR_SPAN_X / segmentCount;
      const numBreaks = segmentCount > 1 ? Math.floor((segmentCount - 1) / sliceWidth) : 0;
      const numIntra = Math.max(0, segmentCount - 1 - numBreaks);
      const intraGap = Math.min(0.010, nomPitch * 0.16);
      const interGap = Math.min(0.032, nomPitch * 0.48);
      const totalGap = numIntra * intraGap + numBreaks * interGap;
      const segWidth = Math.max(0.010, (BAR_SPAN_X - totalGap) / segmentCount);
      const actualSpan = segmentCount * segWidth + totalGap;
      let cursorX = -actualSpan * 0.5 + segWidth * 0.5;

      for (let i = 0; i < MAX_STEPS; i++) {
        if (i < segmentCount) {
          _tmpPos.set(cursorX, BAR_Y, BAR_Z);
          _tmpScale.set(segWidth, 1, 1);
          const isSliceBreak = (i + 1) % sliceWidth === 0;
          cursorX += segWidth + (isSliceBreak ? interGap : intraGap);
        } else {
          _tmpPos.set(0, BAR_Y - 0.05, BAR_Z);
          _tmpScale.set(0, 0, 0);
        }
        _tmpMatrix.compose(_tmpPos, _tmpQuat, _tmpScale);
        progressInstanced.setMatrixAt(i, _tmpMatrix);
      }
      progressInstanced.instanceMatrix.needsUpdate = true;
      progressInstanced.computeBoundingSphere();
      lastActiveSeg = -1;
      lastFracBucket = -1;
    }

    if (activeSegment !== lastActiveSeg || phase !== lastPhase || fracBucket !== lastFracBucket) {
      const segStepChanged = activeSegment !== lastActiveSeg || phase !== lastPhase;
      lastActiveSeg = activeSegment;
      lastPhase = phase;
      lastFracBucket = fracBucket;

      const activeHex = phase === 'ERROR' ? PALETTE.errorRed : LUMINOUS_GOLD_HEX;
      _activeColor.setHex(activeHex);
      let colorChanged = false;

      for (let i = 0; i < MAX_STEPS; i++) {
        if (i === activeSegment && i < segmentCount) {
          _tmpColor.copy(_activeColor).lerp(_doneColor, segFraction * 0.35);
          progressInstanced.setColorAt(i, _tmpColor);
          lastSegHex[i] = 0xffffffff;
          colorChanged = true;
          continue;
        }
        if (i === activeSegment + 1 && i < segmentCount && segFraction > 0.02) {
          _tmpColor.copy(_pendingColor).lerp(_activeColor, segFraction * 0.65);
          progressInstanced.setColorAt(i, _tmpColor);
          lastSegHex[i] = 0xfffffffe;
          colorChanged = true;
          continue;
        }

        let nextHex = PENDING_SAPPHIRE_SLOT_HEX;
        if (i >= segmentCount) {
          nextHex = DARK_SAPPHIRE_SLATE_HEX;
        } else if (i < activeSegment) {
          nextHex = CYAN_TEAL_HEX;
        }

        if (lastSegHex[i] !== nextHex) {
          lastSegHex[i] = nextHex;
          _tmpColor.setHex(nextHex);
          progressInstanced.setColorAt(i, _tmpColor);
          colorChanged = true;
        }
      }

      if (colorChanged && progressInstanced.instanceColor) {
        progressInstanced.instanceColor.needsUpdate = true;
      }

      if (segStepChanged) {
        group.userData.subtitle = `Step ${rawStepIndex + 1} / ${rawTotalSteps} (Slice ×${sliceWidth}) · ${phase}`;
      }
    }
  }

  update({ stepIndex: 0, totalSteps: 16, phase: 'DESCEND' });

  function dispose() {
    progressInstanced.dispose();
    for (let i = 0; i < disposables.length; i++) {
      if (disposables[i] && typeof disposables[i].dispose === 'function') {
        disposables[i].dispose();
      }
    }
    disposables.length = 0;
  }

  return {
    group,
    update,
    dispose,
  };
}
