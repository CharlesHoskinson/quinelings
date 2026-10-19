import * as THREE from 'three/webgpu';
import {
  PALETTE,
  clamp,
  tagInspectable,
} from './theme.js';

const EXPR_SLOT_COUNT = 16;
const LIMB_BYTE_COUNT = 16;
const CHANNEL_Y = 0.1062;
const FLANK_Y = 0.1068;
const LEFT_FLANK_X = -1.66;
const RIGHT_FLANK_X = 1.66;
const Z_START = -1.24;
const Z_END = 1.24;

const DARK_SAPPHIRE_SLATE_HEX = 0x151513;
const STANDBY_SAPPHIRE_SLOT_HEX = 0x262930;
const CYAN_TEAL_HEX = 0x2dd4bf;
const CYAN_TEAL_NEIGHBOR_HEX = 0x1a9e8f;
const CYAN_TEAL_DIM_HEX = 0x1c3838;
const AMBER_GOLD_HEX = 0xfbbf24;
const CHAMPAGNE_GOLD_HEX = 0xc5a059;
const AMBER_RIPPLE_HEX = 0xb47d1c;

// Module-scope reusable scratch objects — zero allocations inside .update(stepState)
const _tmpMatrix = new THREE.Matrix4();
const _tmpPos = new THREE.Vector3();
const _tmpQuat = new THREE.Quaternion();
const _tmpScale = new THREE.Vector3();
const _tmpColor = new THREE.Color();
const EMPTY_BYTES = Object.freeze([]);

/**
 * Designer 5: Hairline Micro-LED Flank Arrays Integrated Along the Die Perimeter Grooves
 */
export function createCircuitSubsystem() {
  const group = new THREE.Group();
  group.name = 'Designer5_MinimalistFlushFlankArrays';

  const disposables = [];
  const track = (item) => {
    if (item) disposables.push(item);
    return item;
  };

  const channelGeo = track(new THREE.BoxGeometry(0.024, 0.0008, Z_END - Z_START + 0.08));
  const channelMat = track(
    new THREE.MeshStandardMaterial({
      color: DARK_SAPPHIRE_SLATE_HEX,
      roughness: 0.58,
      metalness: 0.22,
    })
  );

  const leftChannelMesh = new THREE.Mesh(channelGeo, channelMat);
  leftChannelMesh.position.set(LEFT_FLANK_X, CHANNEL_Y, 0);
  leftChannelMesh.receiveShadow = true;
  group.add(leftChannelMesh);

  const rightChannelMesh = new THREE.Mesh(channelGeo, channelMat);
  rightChannelMesh.position.set(RIGHT_FLANK_X, CHANNEL_Y, 0);
  rightChannelMesh.receiveShadow = true;
  group.add(rightChannelMesh);

  // Hairline micro-LED geometry integrated into the ±1.66 perimeter groove
  const microLedGeo = track(new THREE.BoxGeometry(0.018, 0.0012, 0.088));
  const microLedMat = track(
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    })
  );

  // 1. Left Flank InstancedMesh: 16 Flush Micro-LEDs for Active AST Expression Row (Cyan-Teal 0x2dd4bf)
  const leftExprInstanced = new THREE.InstancedMesh(
    microLedGeo,
    microLedMat,
    EXPR_SLOT_COUNT
  );
  leftExprInstanced.name = 'LeftFlankExpressionMicroLEDs';
  group.add(leftExprInstanced);

  // 2. Right Flank InstancedMesh: 16 Flush Micro-LEDs for 16-Byte UInt128 Limbs (Amber-Gold 0xfbbf24)
  const rightLimbInstanced = new THREE.InstancedMesh(
    microLedGeo,
    microLedMat,
    LIMB_BYTE_COUNT
  );
  rightLimbInstanced.name = 'RightFlankUInt128MicroLEDs';
  group.add(rightLimbInstanced);

  const zStep = (Z_END - Z_START) / (EXPR_SLOT_COUNT - 1);
  _tmpScale.set(1, 1, 1);

  const lastLeftHex = new Uint32Array(EXPR_SLOT_COUNT);
  const lastRightHex = new Uint32Array(LIMB_BYTE_COUNT);

  for (let i = 0; i < EXPR_SLOT_COUNT; i++) {
    const z = Z_START + i * zStep;

    _tmpPos.set(LEFT_FLANK_X, FLANK_Y, z);
    _tmpMatrix.compose(_tmpPos, _tmpQuat, _tmpScale);
    leftExprInstanced.setMatrixAt(i, _tmpMatrix);
    _tmpColor.setHex(STANDBY_SAPPHIRE_SLOT_HEX);
    leftExprInstanced.setColorAt(i, _tmpColor);
    lastLeftHex[i] = STANDBY_SAPPHIRE_SLOT_HEX;

    _tmpPos.set(RIGHT_FLANK_X, FLANK_Y, z);
    _tmpMatrix.compose(_tmpPos, _tmpQuat, _tmpScale);
    rightLimbInstanced.setMatrixAt(i, _tmpMatrix);
    _tmpColor.setHex(STANDBY_SAPPHIRE_SLOT_HEX);
    rightLimbInstanced.setColorAt(i, _tmpColor);
    lastRightHex[i] = STANDBY_SAPPHIRE_SLOT_HEX;
  }

  leftExprInstanced.instanceMatrix.needsUpdate = true;
  rightLimbInstanced.instanceMatrix.needsUpdate = true;
  if (leftExprInstanced.instanceColor) {
    leftExprInstanced.instanceColor.setUsage(THREE.DynamicDrawUsage);
    leftExprInstanced.instanceColor.needsUpdate = true;
  }
  if (rightLimbInstanced.instanceColor) {
    rightLimbInstanced.instanceColor.setUsage(THREE.DynamicDrawUsage);
    rightLimbInstanced.instanceColor.needsUpdate = true;
  }
  leftExprInstanced.computeBoundingSphere();
  rightLimbInstanced.computeBoundingSphere();

  tagInspectable(leftExprInstanced, {
    type: 'circuit-left-flank',
    id: 'left-flank-expression-array',
    title: 'Left Flank AST Expression Photolithography Channel',
    subtitle: 'y = 0.1052 // Dark Sapphire-Slate Channel · Cyan-Teal (0x2dd4bf) Active AST Row',
    details: 'Recessed dark sapphire-slate photolithography channel flush on the left silver-platinum flank (y = 0.1052), glowing with Cyan-Teal (0x2dd4bf) on the active AST expression row.',
  });

  tagInspectable(rightLimbInstanced, {
    type: 'circuit-right-flank',
    id: 'right-flank-uint128-array',
    title: 'Right Flank 16-Byte UInt128 Photolithography Channel',
    subtitle: 'y = 0.1052 // Dark Sapphire-Slate Channel · Amber-Gold (0xfbbf24) UInt128 Limbs',
    details: 'Recessed dark sapphire-slate photolithography channel flush on the right silver-platinum flank (y = 0.1052), glowing with Amber-Gold (0xfbbf24) for 16-byte UInt128 arithmetic limbs.',
  });

  let lastExprCount = -1;
  let lastActiveRowIdx = -1;
  let lastStepRef = undefined;
  let lastRippleBucket = -1;

  // =========================================================================
  // LIVE UPDATE LOOP (.update(stepState)) — ZERO ALLOCATIONS
  // =========================================================================
  function update(stepState) {
    if (!stepState) return;
    const ambient = stepState.ambient ?? 0;
    const trace = stepState.trace;
    const step = stepState.step;
    const after = step?.after;

    // -----------------------------------------------------------------------
    // 1. Left Flank: 16 Flush AST Expression Micro-LEDs (Cyan-Teal 0x2dd4bf)
    //    Only update GPU instanceColor buffer when active row or expression count changes
    // -----------------------------------------------------------------------
    const expressions = trace?.programImage?.expressions || EMPTY_BYTES;
    const exprCount = expressions.length;
    const rawExprId = after?.controlOrigin?.exprId ?? after?.control?.exprId ?? 0;
    const activeRowIdx =
      ((Number(rawExprId) % EXPR_SLOT_COUNT) + EXPR_SLOT_COUNT) % EXPR_SLOT_COUNT;

    if (exprCount !== lastExprCount || activeRowIdx !== lastActiveRowIdx) {
      lastExprCount = exprCount;
      lastActiveRowIdx = activeRowIdx;
      let leftChanged = false;

      for (let i = 0; i < EXPR_SLOT_COUNT; i++) {
        let nextHex = STANDBY_SAPPHIRE_SLOT_HEX;
        if (i === activeRowIdx) {
          nextHex = CYAN_TEAL_HEX;
        } else if (i < exprCount) {
          const dist = Math.abs(i - activeRowIdx);
          nextHex = dist === 1 ? CYAN_TEAL_NEIGHBOR_HEX : CYAN_TEAL_DIM_HEX;
        }
        if (lastLeftHex[i] !== nextHex) {
          lastLeftHex[i] = nextHex;
          _tmpColor.setHex(nextHex);
          leftExprInstanced.setColorAt(i, _tmpColor);
          leftChanged = true;
        }
      }
      if (leftChanged && leftExprInstanced.instanceColor) {
        leftExprInstanced.instanceColor.needsUpdate = true;
      }
    }

    // -----------------------------------------------------------------------
    // 2. Right Flank: 16-Byte UInt128 Arithmetic Limbs (Amber-Gold 0xfbbf24)
    //    Only update GPU instanceColor buffer when step or active ripple pulse changes
    // -----------------------------------------------------------------------
    const arith = after?.aux2?.arithmetic;
    const fuel = after?.aux2?.fuel;
    const arithActive = Boolean(arith?.active);
    const rippleIdx = ((ambient * 3.0) % 1.0) * (LIMB_BYTE_COUNT - 1);
    const rippleBucket = arithActive ? Math.floor(rippleIdx * 2) : -1;

    if (step !== lastStepRef || rippleBucket !== lastRippleBucket) {
      lastStepRef = step;
      lastRippleBucket = rippleBucket;

      const lhsBytes = arith?.lhsBytes || EMPTY_BYTES;
      const rhsBytes = arith?.rhsBytes || EMPTY_BYTES;
      const resBytes = arith?.resultBytes || EMPTY_BYTES;
      const carries = arith?.carries || EMPTY_BYTES;
      const borrows = arith?.borrows || EMPTY_BYTES;
      const fuelAfterBytes = fuel?.afterBytes || EMPTY_BYTES;

      let rightChanged = false;

      for (let c = 0; c < LIMB_BYTE_COUNT; c++) {
        const lb = lhsBytes[c] ?? 0;
        const rb = rhsBytes[c] ?? 0;
        const outB = resBytes[c] ?? 0;
        const cVal = carries[c] ?? 0;
        const boVal = borrows[c] ?? 0;
        const fb = fuelAfterBytes[c] ?? 0;

        const hasArithByte = outB > 0 || lb > 0 || rb > 0 || cVal > 0 || boVal > 0;
        let nextHex = STANDBY_SAPPHIRE_SLOT_HEX;

        if (arithActive && hasArithByte) {
          nextHex = arith?.overflow || boVal > 0 ? PALETTE.heatBright : AMBER_GOLD_HEX;
        } else if (arithActive) {
          const nearRipple = clamp(1 - Math.abs(c - rippleIdx) / 2.5, 0, 1);
          nextHex = nearRipple > 0.5 ? AMBER_RIPPLE_HEX : STANDBY_SAPPHIRE_SLOT_HEX;
        } else if (hasArithByte) {
          nextHex = AMBER_GOLD_HEX;
        } else if (fb > 0) {
          nextHex = CHAMPAGNE_GOLD_HEX;
        }

        if (lastRightHex[c] !== nextHex) {
          lastRightHex[c] = nextHex;
          _tmpColor.setHex(nextHex);
          rightLimbInstanced.setColorAt(c, _tmpColor);
          rightChanged = true;
        }
      }

      if (rightChanged && rightLimbInstanced.instanceColor) {
        rightLimbInstanced.instanceColor.needsUpdate = true;
      }
    }
  }

  function dispose() {
    leftExprInstanced.dispose();
    rightLimbInstanced.dispose();
    for (let i = 0; i < disposables.length; i++) {
      const d = disposables[i];
      if (d && typeof d.dispose === 'function') {
        d.dispose();
      }
    }
    disposables.length = 0;
  }

  update({ ambient: 0, step: null, trace: null });

  return {
    group,
    update,
    dispose,
  };
}
