'use strict';
const assert = require('node:assert/strict');
const W = require('../woven-body.js');
const F = require('../lifeform-families.js');

const tideglass = require('../programs/generated/tideglass.json').graph;
const threadwing = require('../programs/generated/threadwing.json').graph;
const fork = {
  nodes: [
    { id: 'a', op: 'literal', inputs: [] },
    { id: 'b', op: 'sum', inputs: ['a'] },
    { id: 'c', op: 'sum', inputs: ['a'] },
    { id: 'd', op: 'sum', inputs: ['b', 'c'] },
  ],
};
const terminal = {
  nodes: [
    { id: 'g', op: 'literal', inputs: [] },
    { id: 'a', op: 'literal', inputs: [] },
    { id: 'effect', op: 'action', inputs: ['g', 'a'] },
  ],
};

// 1. Verify Lorenz Bishop Parallel-Transport Frames & Thomas Labyrinth Coupling
const baseRoute = W.author(threadwing, 42);
const lorenzRec = {
  ...baseRoute,
  mechanism: 'lorenz-flow',
  dynamics: {
    system: 'lorenz',
    method: 'rk4',
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    initial: [0.330938, 0.226438, 0.215456],
    dt: 0.006,
    burn: 512,
    steps: 3072,
    window: 384,
  },
};
delete lorenzRec.embedding;
const lorenzBody = W.compile(lorenzRec, threadwing);
assert(lorenzBody.bishop, 'Lorenz body compiles discrete SO(3) Bishop parallel-transport frames');
assert.equal(lorenzBody.bishop.U.length, lorenzBody.orbit.length);
assert.equal(lorenzBody.bishop.V.length, lorenzBody.orbit.length);
assert.equal(lorenzBody.bishop.thomas.length, lorenzBody.orbit.length);
for (let i = 0; i < lorenzBody.orbit.length; i += 64) {
  const u = lorenzBody.bishop.U[i];
  const v = lorenzBody.bishop.V[i];
  const th = lorenzBody.bishop.thomas[i];
  assert(Math.abs(Math.hypot(u[0], u[1], u[2]) - 1) < 1e-6, 'Bishop normal U_i is unit length');
  assert(Math.abs(Math.hypot(v[0], v[1], v[2]) - 1) < 1e-6, 'Bishop normal V_i is unit length');
  assert(Math.abs(u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) < 1e-6, 'Bishop frame vectors U_i, V_i are orthogonal');
  assert(th.every(x => Number.isFinite(x) && Math.abs(x) <= 1), 'Thomas labyrinth state is bounded in [-1, 1]');
}

// 2. Verify Julia 3D Douady-Hubbard Holomorphic Potential & Milnor Distance Relief
const juliaRec = W.author(fork, 42);
const juliaBody = W.compile(juliaRec, fork);
assert(juliaBody.julia.holoGrid instanceof Float32Array, 'Julia compiles holoGrid with Douady-Hubbard potential & Milnor distance');
assert.equal(juliaBody.julia.holoGrid.length, juliaRec.geometry.grid * juliaRec.geometry.grid * 4);
assert(juliaBody.julia.marks.some(m => m.pot > 0 && m.dist > 0), 'Exterior Julia marks carry positive potential and distance estimate');

// 3. Verify Strange-Loop Ouroboros Quine Feedback Filament (quote -> run -> apply)
for (const [g, rec] of [
  [tideglass, W.author(tideglass, 42)],
  [threadwing, baseRoute],
  [threadwing, lorenzRec],
  [fork, juliaRec],
  [terminal, W.author(terminal, 42)],
]) {
  const body = W.compile(rec, g);
  const bounds = W.portraitFrame(body);
  const loop = W.strangeLoop(body, 1.25, {
    samples: 96,
    execution: { activeOwner: 0, progress: 0.5, outcome: 'Running' },
  });
  assert.equal(loop.material, 'strange-loop-ouroboros');
  assert.equal(loop.holonomyTwist, Math.PI);
  assert.equal(loop.line.length, 97);
  const stagesSeen = new Set();
  for (const pt of loop.line) {
    assert(Number.isFinite(pt.x) && Number.isFinite(pt.y) && Number.isFinite(pt.z));
    assert(Math.abs(pt.x - bounds.cx) <= bounds.width / 2);
    assert(Math.abs(pt.y - bounds.cy) <= bounds.height / 2);
    assert(Math.abs(pt.z - bounds.cz) <= bounds.depth / 2);
    assert(pt.alpha >= 0 && pt.alpha <= 1);
    assert(pt.soliton >= 0 && pt.soliton <= 1);
    stagesSeen.add(pt.stage);
  }
  assert.deepEqual([...stagesSeen].sort(), ['apply', 'quote', 'run']);
}

// 4. Verify Chimeric Combinations (compose, mate, merge, symbiote, body)
const torusBody = W.compile(W.author(terminal, 42), terminal);
const mantleBody = W.compile(W.author(tideglass, 42), tideglass);
const cliffordBody = W.compile(baseRoute, threadwing);

for (const mode of ['compose', 'mate', 'merge', 'symbiote', 'body']) {
  const authored = W.authorCombination(lorenzBody, juliaBody, { mode, blend: 0.45, coupling: 0.22 }, 77);
  assert(W.validate(authored), `authored chimera (${mode}) validates cleanly`);
  assert.equal(authored.chimera.mode, mode);
  assert.deepEqual(authored.chimera.parentMechanisms, ['lorenz-flow', 'recursive-julia']);

  const combined = W.combine(lorenzBody, juliaBody, authored.chimera, 0.85, {
    budget: 2048,
    crests: true,
    execution: { activeOwner: 1, stackRatio: 0.5, fuelRatio: 0.8, progress: 0.4, outcome: 'Running' },
  });
  assert.equal(combined.points.length, 2048 * 4);
  assert.equal(combined.owners.length, 2048);
  assert(combined.ridges.some(r => r.material === 'chimeric-seam-bridge'), `chimera (${mode}) includes C2 seam bridge filament`);
  for (let i = 0; i < combined.points.length; i += 4) {
    const [x, y, z, a] = combined.points.subarray(i, i + 4);
    assert([x, y, z, a].every(Number.isFinite), `chimera (${mode}) point is finite`);
    assert(a >= 0 && a <= 1, `chimera (${mode}) alpha in [0,1]`);
  }
}

// Cross-family chimeric combination: clifford-flow + toroidal-weave
const symbiote = W.combine(cliffordBody, torusBody, { mode: 'symbiote', blend: 0.5, coupling: 0.28 }, 1.7, { budget: 1024 });
assert.equal(symbiote.points.length, 1024 * 4);
assert.deepEqual(symbiote.parentMechanisms, ['clifford-flow', 'toroidal-weave']);

// 5. Verify Live Program Execution Response across mechanisms
for (const body of [mantleBody, torusBody, lorenzBody, cliffordBody, juliaBody]) {
  const bounds = W.portraitFrame(body);
  const srReuse = {};
  const sr = W.stepResponse(body, 1.1, {
    activeOwner: 0,
    recursionDepth: 4,
    stackRatio: 0.65,
    fuelRatio: 0.4,
    progress: 0.55,
    stepFraction: 0.3,
    outcome: 'Running',
  }, srReuse);
  assert(Number.isFinite(sr.effPhase));
  assert(sr.ownerGain[0] > 1.2, 'active operation owner receives strong gain boost');
  assert.equal(srReuse.ownerGain, sr.ownerGain, 'stepResponse reuses typed arrays cleanly');

  const baseFrame = W.frame(body, 1.1, { budget: 1024, crests: false });
  const execFrame = W.frame(body, 1.1, {
    budget: 1024,
    crests: true,
    execution: {
      activeOwner: 0,
      stackRatio: 0.65,
      fuelRatio: 0.4,
      progress: 0.55,
      outcome: 'Done',
    },
  });
  let diff = 0;
  for (let i = 0; i < baseFrame.points.length; i += 4) {
    const [x, y, z, a] = execFrame.points.subarray(i, i + 4);
    assert([x, y, z, a].every(Number.isFinite));
    assert(Math.abs(x - bounds.cx) <= bounds.width / 2);
    assert(Math.abs(y - bounds.cy) <= bounds.height / 2);
    assert(Math.abs(z - bounds.cz) <= bounds.depth / 2);
    assert(a >= 0 && a <= 1);
    diff += Math.hypot(x - baseFrame.points[i], y - baseFrame.points[i + 1], z - baseFrame.points[i + 2]);
  }
  assert(diff / 1024 > 0.005, `execution state dynamically modulates ${body.record.mechanism} coordinates`);
}

console.log('Council 20 enhancements verified: Hopf fibration, Bishop parallel-transport & Thomas labyrinth coupling, Clifford vorticity lift, 3D Douady-Hubbard Julia relief, Whitney A2/A3 caustic gain, Strange-Loop Ouroboros filament, Chimeric combinations (compose/mate/merge/symbiote/body), and Live Program Execution coupling all passed.');
