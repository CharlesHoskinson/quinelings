import assert from 'node:assert/strict';
// This example consumes only the built package entry point, never repository
// interpreter files. Build the package before running it.
import {Session, sourceOnly} from '../dist/v1.js';

const session = new Session();
const liter = {kind: 'number', unit: 'L', min: 0};
const intent = {
  format: 'qdl-intent', version: 1, name: 'Supplied water total',
  thought: {
    observations: [
      {id: 'observedReadings', text: 'Explicitly supplied liter readings.', input: 'readings', path: [], basis: 'open'},
      {id: 'observedReserve', text: 'Explicitly supplied reserve liters; no ambient stored balance.', input: 'reserve', path: [], basis: 'open'}
    ],
    evidence: [], goals: [], decisions: [],
    plans: [{id: 'plan', text: 'Sum the readings, then add the supplied reserve.', tasks: ['task']}],
    tasks: [{id: 'task', text: 'Compute the bounded total from this snapshot.', nodes: ['readings', 'reserve', 'subtotal', 'total'], outputs: ['total']}]
  },
  inputs: [
    {id: 'readings', name: 'readings', type: {kind: 'array', element: liter}},
    {id: 'reserve', name: 'reserve', type: liter}
  ],
  steps: [
    {id: 'subtotal', op: 'sum', inputs: ['readings'], params: {}},
    {id: 'total', op: 'arithmetic', inputs: ['subtotal', 'reserve'], params: {kind: 'add'}}
  ],
  outputs: ['total']
};
const artifact = session.compile(intent);
const originalSource = artifact.source;
assert.deepEqual(artifact.ports.map(p => p.name), ['readings', 'reserve']);
assert.equal(sourceOnly.verifyQuine(originalSource).sourceHash, artifact.id);
assert.equal(session.verify(artifact.id).source, originalSource);
assert.equal(session.exportSnapshot().records.length, 0);

const requestA = {artifactId: artifact.id, requestId: 'water-a', inputs: {readings: [2, 3], reserve: 4}};
const requestB = {artifactId: artifact.id, requestId: 'water-b', inputs: {readings: [4, 5], reserve: 2}};
const first = session.run(requestA);
const second = session.run(requestB);
// Independent hand-derived expectations: 2 + 3 + 4 = 9; 4 + 5 + 2 = 11.
assert.deepEqual(first.result.occurrences[0].outputs, [9]);
assert.deepEqual(second.result.occurrences[0].outputs, [11]);
assert.notEqual(first.result.inputHash, second.result.inputHash);
for (const record of [first, second]) {
  assert.equal(record.result.status, 'completed');
  assert.equal(record.result.sourceHash, artifact.id);
  assert.equal(record.result.emitted[0], originalSource);
  assert.equal(record.evidence, 'retained');
}
assert.equal(session.inspect(artifact.id).source, originalSource);
assert.deepEqual(session.run(requestA), first); // replay performs no fresh invocation
assert.throws(() => session.run({...requestA, inputs: requestB.inputs}), e => e.code === 'request-conflict');

const copy = session.reproduce({artifactId: artifact.id, recordId: first.id, requestId: 'water-copy'});
assert.notEqual(copy.id, first.id);
assert.equal(copy.parentRecordId, first.id);
assert.deepEqual(copy.result.bindings, requestA.inputs);
assert.deepEqual(copy.result.occurrences[0].outputs, [9]);
assert.equal(copy.result.emitted[0], originalSource);

const genomes = sourceOnly.encode(originalSource);
for (const recovery of [{harmonics: genomes.harmonics}, {colors: genomes.colors}]) {
  const recoveredSession = new Session();
  assert.equal(recoveredSession.recover(recovery).source, originalSource);
  assert.equal(recoveredSession.exportSnapshot().records.length, 0);
}

const snapshot = JSON.parse(JSON.stringify(session.exportSnapshot()));
const restored = Session.fromSnapshot(snapshot); // passive restoration
assert.equal(restored.inspect(artifact.id).source, originalSource);
assert.equal(restored.exportSnapshot().records.every(r => r.evidence === 'asserted'), true);
const replayed = restored.run(requestA);
assert.equal(replayed.id, first.id);
assert.equal(replayed.evidence, 'asserted');
assert.deepEqual(replayed.result.occurrences[0].outputs, [9]);
const fresh = restored.run({...requestB, requestId: 'water-restored-fresh'});
assert.equal(fresh.evidence, 'retained');
assert.deepEqual(fresh.result.occurrences[0].outputs, [11]);
assert.equal(fresh.result.emitted[0], originalSource);

console.log(JSON.stringify({
  profile: 'QDL v1 candidate', outputs: [9, 11], sourcePreserved: true,
  reproduced: 9, restoredHistory: replayed.evidence, freshHistory: fresh.evidence,
  effects: session.describe().effects, persistence: session.describe().persistence
}, null, 2));
