import assert from 'node:assert/strict';
// Embedding example: bake a looping creature for a third-party renderer and map a
// run's trace onto the body so the executing node can be lit. Uses only the built
// package entry point. Build the package before running it.
import {Session} from '../dist/v1.js';

const session = new Session();
const liter = {kind: 'number', unit: 'L', min: 0};
const artifact = session.compile({
  format: 'qdl-intent', version: 1, name: 'Supplied water total',
  thought: 'Sum the supplied readings, then add the supplied reserve.',
  inputs: [
    {id: 'readings', name: 'readings', type: {kind: 'array', element: liter}},
    {id: 'reserve', name: 'reserve', type: liter}
  ],
  steps: [
    {id: 'subtotal', op: 'sum', inputs: ['readings'], params: {}},
    {id: 'total', op: 'arithmetic', inputs: ['subtotal', 'reserve'], params: {kind: 'add'}}
  ],
  outputs: ['total']
});

// 24 frames x 1200 points, int16: about 170 KiB of positions for one creature.
const baked = session.bake(artifact.id, {frames: 24, budget: 1200, crests: 3, quantize: 'int16'});
assert.equal(baked.sourceHash, artifact.id);
assert.equal(baked.positions.length, 24);
assert.equal(baked.positions[0].length, 3 * 1200);
const toWorld = (buffer, i) => [0, 1, 2].map(a => baked.bounds.center[a] + baked.bounds.scale * buffer[3 * i + a] / baked.quantScale);

// The run is the only evaluating call. traceOwners only reads the retained record.
const record = session.run({artifactId: artifact.id, requestId: 'water-a', inputs: {readings: [2, 3], reserve: 4}});
const lit = session.traceOwners(record.id).occurrences[0].owners;
assert.deepEqual(lit.map(i => baked.nodeIds[i]), record.result.occurrences[0].trace.map(step => step.nodeId));

// A renderer would draw frame k with points owned by lit[step] highlighted.
for (const [step, owner] of lit.entries()) {
  const frame = step % baked.frames, highlighted = baked.owners.filter(o => o === owner).length;
  console.log(`step ${step}: node ${baked.nodeIds[owner]} (${baked.nodeRoles[owner]}, ${baked.nodeColors[owner]}) lights ${highlighted} points; anchor at frame ${frame}:`,
    toWorld(baked.anchors[frame], owner).map(v => v.toFixed(3)).join(', '));
}
console.log('baked', baked.frames, 'frames x', baked.budget, 'points,', baked.quantize, 'source', baked.sourceHash.slice(0, 15) + '...');
