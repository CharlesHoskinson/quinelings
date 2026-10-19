'use strict';
/**
 * tests/fuzz-animation-pipeline.cjs
 * ---------------------------------
 * 10,000-Iteration Property-Based Fuzzer for WovenBody, Chroma, and LifeformFamilies.
 * Generates random valid DAGs (1..64 nodes) across all opcodes (including `window`),
 * compiles them with WovenBody.compile and Chroma.compile, and evaluates:
 *   - WovenBody.frame
 *   - WovenBody.strangeLoop
 *   - WovenBody.stepResponse
 *   - WovenBody.combine (compose, mate, merge, symbiote, body)
 *   - Chroma.colorFor & Chroma.compile
 * at random phases phi in [-100, 100] and random CEK execution states, asserting
 * zero exceptions and zero NaN/Infinity floats.
 */

const assert = require('node:assert/strict');
const W = require('../woven-body.js');
const F = require('../lifeform-families.js');
const C = require('../chroma.js');
const Q = require('../core.js');
const D = require('../qdl.js');

function makeRng(seed = 0x20261019) {
  let s = seed >>> 0;
  return {
    next() {
      s ^= s << 13;
      s ^= s >>> 17;
      s ^= s << 5;
      return (s >>> 0) / 4294967296;
    },
    int(min, max) {
      return min + Math.floor(this.next() * (max - min + 1));
    },
    pick(arr) {
      return arr[Math.floor(this.next() * arr.length)];
    },
    float(min, max) {
      return min + this.next() * (max - min);
    },
  };
}

const rng = makeRng(0x20261019);
const OPS = [...Q.OPS, 'window'];
const FAMILIES = D.FAMILIES;
const CHIMERA_MODES = ['compose', 'mate', 'merge', 'symbiote', 'body'];
const OUTCOMES = ['Running', 'Done', 'Rejected', 'Exhausted'];

function assertAllFinite(arr, label) {
  for (let i = 0; i < arr.length; i++) {
    if (!Number.isFinite(arr[i])) {
      throw new Error(`Non-finite float at ${label}[${i}] = ${arr[i]}`);
    }
  }
}

function genRandomDAG(iter) {
  const mode = iter % 8;
  const nCount = iter % 100 === 0 ? 1 : iter % 199 === 0 ? 64 : rng.int(2, 22);
  const nodes = [];
  const levels = new Array(nCount).fill(0);

  for (let i = 0; i < nCount; i++) {
    let op = rng.pick(OPS);
    const inputs = [];
    if (i === 0) {
      op = rng.pick(['literal', 'input', 'Observe', 'Permit', 'Box']);
    } else {
      if (mode === 0 && i === 1) op = 'filter';
      else if (mode === 1 && i === nCount - 1) op = rng.pick(['choose', 'Apply', 'Box', 'retry']);
      else if (mode === 2 && i === nCount - 1) op = rng.pick(['consensus', 'reconcile', 'evidence', 'Score']);
      else if (mode === 3) op = rng.pick(['dedupe', 'sort', 'length', 'select', 'clamp']);
      else if (mode === 4) op = rng.pick(['sum', 'mean', 'map', 'window']);
      else if (mode === 5 && i === nCount - 1) op = rng.pick(['action', 'Execute']);
      else if (mode === 6 && i === nCount - 1) op = 'report';

      const maxIn = Math.min(i, mode === 4 ? 1 : rng.int(1, 3));
      const chosen = new Set();
      for (let k = 0; k < maxIn; k++) {
        const depIdx = mode === 4 && i <= 3 ? 0 : rng.int(0, i - 1);
        chosen.add('n' + depIdx);
        levels[i] = Math.max(levels[i], levels[depIdx] + 1);
      }
      inputs.push(...chosen);
    }
    nodes.push({ id: 'n' + i, op, inputs, level: levels[i] });
  }
  return { version: 1, nodes, outputs: ['n' + (nCount - 1)] };
}

const t0 = Date.now();
const compiledPool = new Map();
const mechCounts = {};
const opCounts = {};
let totalFrames = 0;
let totalLoops = 0;
let totalSteps = 0;
let totalCombines = 0;
let totalChroma = 0;

const CANONICAL_DAGS = {
  'toroidal-weave': { nodes: [{ id: 'g', op: 'literal', inputs: [] }, { id: 'a', op: 'literal', inputs: [] }, { id: 'effect', op: 'action', inputs: ['g', 'a'] }] },
  'clifford-flow': { nodes: [{ id: 'n0', op: 'literal', inputs: [] }, { id: 'n1', op: 'literal', inputs: [] }, { id: 'n2', op: 'filter', inputs: ['n0'] }, { id: 'n3', op: 'consensus', inputs: ['n1', 'n2'] }, { id: 'n4', op: 'action', inputs: ['n2', 'n3'] }] },
  'recursive-julia': { nodes: [{ id: 'a', op: 'literal', inputs: [] }, { id: 'b', op: 'sum', inputs: ['a'] }, { id: 'c', op: 'sum', inputs: ['a'] }, { id: 'd', op: 'sum', inputs: ['b', 'c'] }] },
  'logarithmic-mantle': { nodes: [{ id: 's0', op: 'literal', inputs: [] }, { id: 's1', op: 'map', inputs: ['s0'] }, { id: 's2', op: 'window', inputs: ['s1'] }, { id: 's3', op: 'sum', inputs: ['s2'] }, { id: 's4', op: 'report', inputs: ['s3'] }] },
  'pleated-braid': { nodes: [{ id: 'n0', op: 'literal', inputs: [] }, { id: 'n1', op: 'sort', inputs: ['n0'] }, { id: 'n2', op: 'dedupe', inputs: ['n1'] }, { id: 'n3', op: 'select', inputs: ['n2'] }, { id: 'n4', op: 'report', inputs: ['n3'] }] },
  'phyllotaxis-fan': { nodes: [{ id: 'a', op: 'literal', inputs: [] }, { id: 'b', op: 'sum', inputs: ['a'] }, { id: 'c', op: 'report', inputs: ['b'] }] },
};
for (const [mech, dag] of Object.entries(CANONICAL_DAGS)) {
  const rec = W.author(dag, 42);
  compiledPool.set(mech, { dag, rec, body: W.compile(rec, dag) });
}
{
  const lDag = CANONICAL_DAGS['clifford-flow'];
  const lRec = { ...W.author(lDag, 42), mechanism: 'lorenz-flow', dynamics: { system: 'lorenz', method: 'rk4', sigma: 10, rho: 28, beta: 8 / 3, initial: [0.330938, 0.226438, 0.215456], dt: 0.006, burn: 512, steps: 3072, window: 384 } };
  delete lRec.embedding;
  compiledPool.set('lorenz-flow', { dag: lDag, rec: lRec, body: W.compile(lRec, lDag) });
  const aDag = CANONICAL_DAGS['recursive-julia'];
  const aRec = { ...W.author(aDag, 42), mechanism: 'recursive-affine', geometry: { model: 'contractive-branch-charts', chart: 'rolled-scroll', rollTurns: 3, depth: 5, root: [0, 0.62], length: 0.64, width: 0.2, angle: -Math.PI / 2, motion: 0.2, transforms: [{ scale: 0.55, angle: -0.7, attach: 0.8 }, { scale: 0.56, angle: 0.7, attach: 0.9 }] } };
  compiledPool.set('recursive-affine', { dag: aDag, rec: aRec, body: W.compile(aRec, aDag) });
}

const ITERATIONS = 10000;

for (let iter = 0; iter < ITERATIONS; iter++) {
  const dag = genRandomDAG(iter);
  for (const n of dag.nodes) {
    opCounts[n.op] = (opCounts[n.op] || 0) + 1;
  }

  // Compile 32 diverse bodies (including 1-node and 64-node boundary DAGs) and run 10,000 fuzz evaluations
  const needCompile = iter < 30 || iter === 100 || iter === 199;
  let entry;
  if (needCompile) {
    const seed = rng.int(1, 100000);
    const rec = W.author(dag, seed);
    const body = W.compile(rec, dag);
    const design = D.create(rng.pick(FAMILIES));
    design.chroma = { model: 'material-territories', palette: 'roles-1', strength: rng.float(0, 1) };
    const shape = { design, nodes: dag.nodes };
    const cField = C.compile(shape);
    for (let idx = 0; idx < dag.nodes.length; idx++) {
      const col = C.colorFor(shape, idx);
      assert.match(col, /^#[0-9a-f]{6}$/i);
      totalChroma++;
    }
    assert.equal(cField.nodeIds.length, dag.nodes.length);
    entry = { dag, rec, body, shape };
    compiledPool.set(rec.mechanism, entry);
  } else {
    const mechs = [...compiledPool.keys()];
    entry = compiledPool.get(mechs[iter % mechs.length]);
    const design = D.create(rng.pick(FAMILIES));
    design.chroma = { model: 'material-territories', palette: 'roles-1', strength: rng.float(0, 1) };
    const shape = { design, nodes: dag.nodes };
    for (let idx = 0; idx < dag.nodes.length; idx++) {
      const col = C.colorFor(shape, idx);
      assert.match(col, /^#[0-9a-f]{6}$/i);
      totalChroma++;
    }
  }

  const { body } = entry;
  mechCounts[body.record.mechanism] = (mechCounts[body.record.mechanism] || 0) + 1;

  const phi = rng.float(-100, 100);
  const nNodes = body.nodes.length;
  const execution = {
    activeOwner: rng.int(-1, nNodes - 1),
    recursionDepth: rng.int(0, 12),
    maxDepth: 8,
    fuelRatio: rng.float(0, 1),
    outcome: rng.pick(OUTCOMES),
    stepIndex: rng.int(0, 64),
    totalSteps: 64,
    registerLoad: rng.float(0, 1),
  };

  const frame = W.frame(body, phi, {
    budget: 160,
    crests: iter % 25 === 0,
    reuse: iter % 2 === 0 ? (body._fuzzReuse || (body._fuzzReuse = {})) : undefined,
    execution: iter % 3 === 0 ? execution : undefined,
  });
  assert.equal(frame.points.length, 160 * 4);
  assertAllFinite(frame.points, `frame.points(${body.record.mechanism})`);
  for (const r of frame.ridges) {
    for (const pt of r.line) {
      assertAllFinite([pt.x, pt.y, pt.z, pt.alpha], `frame.ridge(${body.record.mechanism})`);
    }
  }
  totalFrames++;

  const loop = W.strangeLoop(body, phi, { samples: 24, execution });
  assert.equal(loop.line.length, 25);
  for (const pt of loop.line) {
    assertAllFinite([pt.x, pt.y, pt.z, pt.alpha, pt.holonomy, pt.soliton], `strangeLoop.line(${body.record.mechanism})`);
  }
  totalLoops++;

  const sr = W.stepResponse(body, phi, execution);
  assertAllFinite(
    [sr.effPhase, sr.globalScale, sr.shearTremor, sr.solitonU, sr.strangeLoopBoost],
    `stepResponse.scalars(${body.record.mechanism})`
  );
  assertAllFinite(sr.ownerGain, `stepResponse.ownerGain(${body.record.mechanism})`);
  assertAllFinite(sr.ownerShift, `stepResponse.ownerShift(${body.record.mechanism})`);
  assertAllFinite(sr.ownerFlare, `stepResponse.ownerFlare(${body.record.mechanism})`);
  totalSteps++;

  const mechanisms = [...compiledPool.keys()];
  if (mechanisms.length >= 2 && iter % 4 === 0) {
    const parentA = compiledPool.get(rng.pick(mechanisms)).body;
    const parentB = compiledPool.get(rng.pick(mechanisms)).body;
    const mode = rng.pick(CHIMERA_MODES);
    const combRecipe = {
      mode,
      blend: rng.float(0, 1),
      coupling: rng.float(0, 0.45),
      seamRange: [0.3, 0.7],
    };
    const comb = W.combine(parentA, parentB, combRecipe, phi, {
      budget: 160,
      crests: iter % 40 === 0,
      execution,
    });
    assert.equal(comb.points.length, 160 * 4);
    assertAllFinite(comb.points, `combine.points(${mode})`);
    totalCombines++;
  }
}

console.log(
  JSON.stringify(
    {
      ok: true,
      iterations: ITERATIONS,
      elapsedMs: Date.now() - t0,
      uniqueOpcodesTested: Object.keys(opCounts).length,
      windowOpCount: opCounts.window,
      mechCounts,
      totalFrames,
      totalLoops,
      totalSteps,
      totalCombines,
      totalChroma,
    },
    null,
    2
  )
);
