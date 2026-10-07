import assert from 'node:assert/strict';
// Build the package before running this file. It imports only the stable entry.
import {Session, QdlError} from '../dist/v1.js';

const ROLES = new Set(['input', 'process', 'decision', 'quote', 'action', 'report']);
const session = new Session();
const liter = {kind: 'number', unit: 'L', min: 0};
const intent = {
  format: 'qdl-intent', version: 1, name: 'Rendered reading total',
  thought: 'Sum the explicitly supplied readings.',
  inputs: [{id: 'readings', name: 'readings', type: {kind: 'array', element: liter}}],
  steps: [{id: 'total', op: 'sum', inputs: ['readings'], params: {}}],
  outputs: ['total']
};
const artifact = session.compile(intent);
const before = session.exportSnapshot();
const pose = session.frame(artifact.id, 0, {budget: 4000, crests: 2});

assert.equal(pose.points.length, 4 * pose.owners.length);
assert.equal(pose.normals.length, 3 * pose.owners.length);
assert.equal(pose.owners.length, 4000);
assert.equal(pose.ridges.length, 2);
assert.equal(pose.nodeIds.length, pose.nodeColors.length);
assert.equal(pose.nodeIds.length, pose.nodeRoles.length);

const counts = new Map();
const shown = [];
for (let i = 0; i < pose.owners.length; i++) {
  const owner = pose.owners[i];
  assert.equal(pose.points[i * 4 + 3], Math.fround(0.18));
  assert.ok(Number.isInteger(owner) && owner >= 0 && owner < pose.nodeIds.length);
  counts.set(owner, (counts.get(owner) ?? 0) + 1);
  if (shown.length < 3) {
    shown.push({
      x: pose.points[i * 4],
      y: pose.points[i * 4 + 1],
      z: pose.points[i * 4 + 2],
      w: pose.points[i * 4 + 3],
      owner,
      nodeId: pose.nodeIds[owner],
      color: pose.nodeColors[owner],
      role: pose.nodeRoles[owner]
    });
  }
}
assert.equal([...counts.values()].reduce((sum, count) => sum + count, 0), 4000);
for (const ridge of pose.ridges) assert.equal(ridge.line.length, 301);
const colorByRole = new Map();
for (let i = 0; i < pose.nodeRoles.length; i++) {
  assert.match(pose.nodeColors[i], /^#[0-9a-f]{6}$/i);
  assert.ok(ROLES.has(pose.nodeRoles[i]));
  const prior = colorByRole.get(pose.nodeRoles[i]);
  if (prior === undefined) colorByRole.set(pose.nodeRoles[i], pose.nodeColors[i]);
  else assert.equal(pose.nodeColors[i], prior);
}
assert.deepEqual(session.exportSnapshot(), before, 'frame does not retain a run');

const cycled = session.frame(artifact.id, Math.PI * 2, {budget: 4000, crests: 2});
assert.deepEqual(cycled.points, pose.points);
assert.deepEqual(cycled.owners, pose.owners);
const defaults = session.frame(artifact.id, 0);
assert.equal(defaults.owners.length, 12000);
assert.equal(defaults.ridges.length, 3);
assert.equal(session.frame(artifact.id, 1e9, {budget: 4000, crests: 2}).owners.length, 4000);
assert.throws(() => session.frame(artifact.id, 1e9 + 1, {budget: 4000}), (error) => error instanceof QdlError && error.code === 'invalid-input');
assert.throws(() => session.frame(artifact.id, 0, {budget: 1500}), (error) => {
  return error instanceof QdlError && error.code === 'invalid-input' && error.message.includes('4000');
});

const familyDesign = structuredClone(artifact.payload.design);
delete familyDesign.anatomy;
delete familyDesign.motion.gesture;
const family = session.compile({...intent, name: 'Family only reading total', design: familyDesign});
assert.equal(session.verify(family.id).source, family.source);
assert.throws(() => session.frame(family.id, 0), (error) => error instanceof QdlError && error.code === 'unsupported-frame');
assert.deepEqual(session.run({
  artifactId: family.id, requestId: 'family-run', inputs: {readings: [2, 3, 4]}
}).result.occurrences[0].outputs, [9]);

console.log(JSON.stringify({
  samples: pose.owners.length,
  nodes: pose.nodeIds.map((nodeId, index) => ({
    nodeId, role: pose.nodeRoles[index], color: pose.nodeColors[index], samples: counts.get(index) ?? 0
  })),
  first: shown[0]
}));
