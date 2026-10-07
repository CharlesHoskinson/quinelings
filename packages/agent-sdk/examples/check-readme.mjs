import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
// Executes every ```js / ```ts fence in packages/agent-sdk/README.md and
// checks the bounds, codes and results that fence's surrounding text states.
// Also runs the package examples. SDK-V1 session numbers are checked on the
// stable fence because describe() is the public report of those limits.
const root = new URL('..', import.meta.url);
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
const v1 = new URL('../dist/v1.js', import.meta.url).href;
const experimental = new URL('../dist/experimental.js', import.meta.url).href;
const fences = [...readme.matchAll(/```(?:js|ts)\n([\s\S]*?)```/g)].map((match) => match[1]);
if (fences.length !== 3) throw new Error(`Expected 3 README js/ts fences, found ${fences.length}`);

const stableClaims = `
assert.deepEqual(first.result.occurrences[0].outputs, [9]);
assert.deepEqual(second.result.occurrences[0].outputs, [11]);
assert.equal(session.inspect(artifact.id).source, artifact.source);
assert.equal(artifact.id, artifact.sourceHash);
assert.match(artifact.id, /^ql_[0-9a-f]{64}$/);
assert.match(first.result.inputHash, /^qi_[0-9a-f]{64}$/);
const afterRuns = session.exportSnapshot().records.length;
assert.equal(afterRuns, 2);
session.verify(artifact.id);
assert.equal(session.exportSnapshot().records.length, afterRuns);
const replay = session.run({artifactId: artifact.id, requestId: 'water-a', inputs: {readings: [2, 3], reserve: 4}});
assert.equal(replay.id, first.id);
assert.equal(session.exportSnapshot().records.length, afterRuns);
assert.throws(() => session.run({artifactId: artifact.id, requestId: 'water-a', inputs: {readings: [1], reserve: 0}}), (error) => error instanceof QdlError && error.code === 'request-conflict');
assert.throws(() => session.run({artifactId: artifact.id, requestId: 'missing-readings', inputs: {reserve: 1}}), (error) => error instanceof QdlError && error.code === 'missing-input');
const described = session.describe();
assert.equal(described.registryDigest, '43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3');
assert.equal(described.effects, 'simulation-only');
assert.equal(described.persistence, 'memory');
assert.equal(described.limits.artifacts, 128);
assert.equal(described.limits.records, 256);
assert.equal(described.limits.artifactBytes, 32 * 1024 * 1024);
assert.equal(described.limits.recordBytes, 2 * 1024 * 1024);
assert.equal(described.limits.recordsBytes, 64 * 1024 * 1024);
assert.equal(described.limits.receipts, 256);
assert.equal(described.limits.snapshotBytes, 128 * 1024 * 1024);
`;

const renderClaims = `
const roles = new Set(['input', 'process', 'decision', 'quote', 'action', 'report']);
assert.equal(pose.owners.length, 4000);
assert.equal(pose.points.length, 16000);
assert.equal(pose.normals.length, 12000);
assert.equal(pose.points.length, 4 * pose.owners.length);
assert.equal(pose.normals.length, 3 * pose.owners.length);
assert.equal(pose.nodeIds.length, pose.nodeColors.length);
assert.equal(pose.nodeIds.length, pose.nodeRoles.length);
for (let i = 0; i < pose.owners.length; i++) {
  assert.equal(pose.points[i * 4 + 3], Math.fround(0.18));
  const owner = pose.owners[i];
  assert.ok(Number.isInteger(owner) && owner >= 0 && owner < pose.nodeIds.length);
  assert.match(pose.nodeColors[owner], /^#[0-9a-f]{6}$/i);
  assert.ok(roles.has(pose.nodeRoles[owner]));
}
assert.equal(pose.ridges.length, 2);
for (const ridge of pose.ridges) assert.equal(ridge.line.length, 301);
const recordsBefore = session.exportSnapshot().records.length;
session.frame(rendered.id, 0, {budget: 4000, crests: 2});
assert.equal(session.exportSnapshot().records.length, recordsBefore);
assert.deepEqual(session.frame(rendered.id, Math.PI * 2, {budget: 4000, crests: 2}).points, pose.points);
assert.equal(session.frame(rendered.id, 0).owners.length, 12000);
assert.equal(session.frame(rendered.id, 0).ridges.length, 3);
assert.throws(() => session.frame(rendered.id, 0, {budget: 1500}), (error) => error instanceof QdlError && error.code === 'invalid-input' && error.message.includes('4000'));
const familyDesign = structuredClone(rendered.payload.design);
delete familyDesign.anatomy;
delete familyDesign.motion.gesture;
const family = session.compile({
  format: 'qdl-intent', version: 1, name: 'Family only reading total',
  thought: 'Sum the explicitly supplied readings.',
  inputs: [{id: 'readings', name: 'readings', type: {kind: 'array', element: liter}}],
  steps: [{id: 'total', op: 'sum', inputs: ['readings'], params: {}}],
  outputs: ['total'],
  design: familyDesign
});
assert.equal(session.verify(family.id).source, family.source);
assert.throws(() => session.frame(family.id, 0), (error) => error instanceof QdlError && error.code === 'unsupported-frame');
assert.deepEqual(session.run({artifactId: family.id, requestId: 'family-run', inputs: {readings: [2, 3, 4]}}).result.occurrences[0].outputs, [9]);
`;

const experimentalClaims = `
assert.equal(frame.owners.length, 2048);
assert.equal(frame.points.length, 8192);
assert.ok(frame.points.every((value) => Number.isFinite(value)));
assert.ok(frame.owners.every((owner) => owner < capsule.task.nodes.length));
const proof = VisualCapsule.verify(capsule);
assert.equal(proof.exactSource, true);
assert.equal(proof.source, capsule.source);
assert.equal(recovered.source, capsule.source);
assert.equal(result.taskProfile, 'qdl-v1');
assert.deepEqual(result.occurrences[0].outputs, [9]);
assert.equal(result.emitted[0], capsule.source);
const quiet = MathematicalLifeforms.frame(body, 0, {budget: 2048, crests: false});
assert.equal(quiet.owners.length, 2048);
assert.equal(quiet.ridges.length, 0);
`;

function claimsFor(source) {
  if (source.includes('VisualCapsule')) return experimentalClaims;
  if (source.includes('Rendered reading total')) return renderClaims;
  if (source.includes('water-a')) return stableClaims;
  throw new Error('README fence has no claim checker');
}

function rewrite(source) {
  const rewritten = source
    .replaceAll("from '@quinelings/agent-sdk/v1'", `from '${v1}'`)
    .replaceAll("from '@quinelings/agent-sdk/experimental'", `from '${experimental}'`);
  if (rewritten.includes('@quinelings/agent-sdk')) throw new Error('README fence still imports a package name');
  const header = ["import assert from 'node:assert/strict';"];
  if (!rewritten.includes('QdlError')) header.push(`import { QdlError } from '${v1}';`);
  return `${header.join('\n')}\n${rewritten}\n${claimsFor(source)}\n`;
}

function runModule(name, source) {
  const dir = mkdtempSync(join(tmpdir(), 'quinelings-readme-'));
  const file = join(dir, `${name}.mjs`);
  try {
    writeFileSync(file, source);
    const result = spawnSync(process.execPath, [file], {stdio: 'inherit'});
    if (result.status !== 0) {
      console.error(`README snippet failed: ${name}`);
      process.exit(result.status ?? 1);
    }
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

fences.forEach((fence, index) => runModule(`readme-${index + 1}`, rewrite(fence)));

const packageRoot = root.pathname;
for (const example of ['basic.mjs', 'v1.mjs', 'render.mjs']) {
  const result = spawnSync(process.execPath, [new URL(`examples/${example}`, root).pathname], {stdio: 'inherit', cwd: packageRoot});
  if (result.status !== 0) {
    console.error(`Example failed: ${example}`);
    process.exit(result.status ?? 1);
  }
}
console.log('check-readme: 3 fences and 3 examples passed');
