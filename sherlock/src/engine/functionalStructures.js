// ============================================================================
// src/engine/functionalStructures.js
// Functional & Persistent Data Structures for Zero-Jank 60/120 FPS Animation:
// 1. `PersistentConsStack`: Hash-consed persistent continuation spine with O(1)
//    push, pop, in-place head rewrite, and O(1) 32-bit Merkle structural hash.
// 2. `annotateTraceWithFunctionalDeltas`: Precomputes O(1) structural diffs and
//    12-bit ring-slot change bitmasks (`changedSlotsMask`) across CEK steps.
// 3. `PersistentPhaseRing`: Lazy, bounded circular functional memo table over
//    S^1 = [0, 2π) that turns pure `WovenBody.frame(body, phase)` evaluations
//    into O(1) SoA lookups after a single cycle, eliminating CPU stalls on
//    mobile/Android and desktop alike.
// ============================================================================

const TAU = Math.PI * 2;
const FNV_OFFSET = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

export function fnvMix32(hash, value) {
  let h = (hash ^ (value & 0xffff)) >>> 0;
  h = Math.imul(h, FNV_PRIME) >>> 0;
  h = (h ^ ((value >>> 16) & 0xffff)) >>> 0;
  return Math.imul(h, FNV_PRIME) >>> 0;
}

export function fnvString32(str, seed = FNV_OFFSET) {
  let h = seed >>> 0;
  const s = String(str || '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

// ----------------------------------------------------------------------------
// 1. Persistent Hash-Consed Continuation Stack (`PersistentConsStack`)
// ----------------------------------------------------------------------------
let _nextConsNodeId = 1;

export const EMPTY_CONS_STACK = Object.freeze({
  id: 0,
  head: null,
  tail: null,
  depth: 0,
  merkleHash: FNV_OFFSET,
});

export function consPush(stack, frame) {
  const base = stack || EMPTY_CONS_STACK;
  const frameKey = `${frame?.kind || ''}|${frame?.label || ''}|${frame?.ruleId || ''}`;
  const headHash = fnvString32(frameKey, base.merkleHash);
  return Object.freeze({
    id: _nextConsNodeId++,
    head: frame,
    tail: base,
    depth: base.depth + 1,
    merkleHash: headHash,
  });
}

export function consPop(stack) {
  if (!stack || !stack.tail) return EMPTY_CONS_STACK;
  return stack.tail;
}

export function consRewriteHead(stack, newFrame) {
  const tail = stack && stack.tail ? stack.tail : EMPTY_CONS_STACK;
  return consPush(tail, newFrame);
}

// ----------------------------------------------------------------------------
// 2. Functional Trace Delta Annotation (`annotateTraceWithFunctionalDeltas`)
// ----------------------------------------------------------------------------
export function annotateTraceWithFunctionalDeltas(trace) {
  if (!trace || !Array.isArray(trace.steps) || trace._functionalAnnotated) {
    return trace;
  }

  let prevStack = EMPTY_CONS_STACK;
  const prevSlotHashes = new Uint32Array(12);

  for (let i = 0; i < trace.steps.length; i += 1) {
    const step = trace.steps[i];
    const frames = step?.after?.frames || [];
    const beforeCount = i > 0 ? (trace.steps[i - 1]?.after?.frames?.length ?? 0) : 0;
    const afterCount = frames.length;

    // Structural-sharing transition on PersistentConsStack
    let nextStack = prevStack;
    if (i === 0) {
      nextStack = EMPTY_CONS_STACK;
      for (let f = 0; f < afterCount; f += 1) {
        nextStack = consPush(nextStack, frames[f]);
      }
    } else if (afterCount === beforeCount + 1 && afterCount > 0) {
      nextStack = consPush(prevStack, frames[afterCount - 1]);
    } else if (afterCount + 1 === beforeCount) {
      nextStack = consPop(prevStack);
    } else if (afterCount === beforeCount && afterCount > 0) {
      nextStack = consRewriteHead(prevStack, frames[afterCount - 1]);
    } else {
      nextStack = EMPTY_CONS_STACK;
      for (let f = 0; f < afterCount; f += 1) {
        nextStack = consPush(nextStack, frames[f]);
      }
    }

    // Compute 32-bit environment Merkle hash
    const env = step?.after?.env || [];
    let envHash = FNV_OFFSET;
    for (let e = 0; e < env.length; e += 1) {
      const b = env[e];
      envHash = fnvString32(`${b?.name || ''}=${b?.value ?? ''}`, envHash);
    }

    // Compute 12-bit ring-slot change bitmask (`changedSlotsMask`)
    let changedSlotsMask = 0;
    const slotHashes = new Uint32Array(12);
    for (let s = 0; s < 12; s += 1) {
      const f = frames[s];
      const h = f
        ? fnvMix32(fnvString32(`${f.kind || ''}|${f.label || ''}`), envHash)
        : 0;
      slotHashes[s] = h;
      if (i === 0 || h !== prevSlotHashes[s]) {
        changedSlotsMask |= 1 << s;
      }
      prevSlotHashes[s] = h;
    }

    step._functionalDelta = Object.freeze({
      stepIndex: i,
      stackNode: nextStack,
      stackMerkleHash: nextStack.merkleHash,
      envMerkleHash: envHash,
      changedSlotsMask,
      slotHashes,
    });

    prevStack = nextStack;
  }

  trace._functionalAnnotated = true;
  return trace;
}

// ----------------------------------------------------------------------------
// 3. `PersistentPhaseRing`: Lazy Functional Memoized Phase Stream over [0, 2π)
// ----------------------------------------------------------------------------
export function createPersistentPhaseRing(bucketCount = 48, defaultComputeFn = null) {
  const buckets = new Array(bucketCount).fill(null);
  let populatedCount = 0;

  return {
    bucketCount,
    buckets,
    getBucketIndex(phase) {
      const wrapped = ((phase % TAU) + TAU) % TAU;
      return Math.floor((wrapped / TAU) * bucketCount) % bucketCount;
    },
    bucketIndexForPhase(phase) {
      const wrapped = ((phase % TAU) + TAU) % TAU;
      return Math.floor((wrapped / TAU) * bucketCount) % bucketCount;
    },
    getBucketPhase(bucketIdx) {
      return ((bucketIdx + 0.5) / bucketCount) * TAU;
    },
    getOrCompute(phase, computeFn = defaultComputeFn) {
      const idx = this.getBucketIndex(phase);
      let entry = buckets[idx];
      if (!entry && typeof computeFn === 'function') {
        const canonicalPhase = this.getBucketPhase(idx);
        entry = Object.freeze(computeFn(canonicalPhase, idx));
        buckets[idx] = entry;
        populatedCount += 1;
      }
      return entry;
    },
    getNearest(phase, computeFn = defaultComputeFn) {
      const idx = this.getBucketIndex(phase);
      const bucket = this.getOrCompute(phase, computeFn);
      return { bucketIdx: idx, bucket };
    },
    get isFullyPopulated() {
      return populatedCount >= bucketCount;
    },
  };
}
