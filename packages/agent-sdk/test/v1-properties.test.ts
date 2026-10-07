import test, {type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import {Session, QdlError, IntentSchema, RequestSchema, FrameInputSchema, FrameSchema,
  ErrorSchema, ExecutionRecordSchema} from '../src/v1.js';
import type {Intent, Request, ExecutionRecord, Frame} from '../src/v1.js';
// @ts-expect-error shared interpreter has no declarations
import V from '../../../qdl-v1.js';

// Deterministic, bounded generators: failures report seed + case for replay.
// These are selected SDK projections, not a proof of refinement. Invariant names
// refer to spec/v1-session.qnt; wire schemas/bytes/frame geometry are abstracted
// by preflight/view there and are additionally checked against the SDK contract.
const SEEDS = [20261004, 20261005, 20261007];
type ExecutionRequest = Extract<Request, {operation: 'run' | 'reproduce'}>;
function random(seed: number) {
  let state = seed >>> 0;
  return (limit: number) => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) % limit;
  };
}
function cases(count: number, fn: (pick: (n: number) => number, index: number, seed: number) => void) {
  for (const seed of SEEDS) {
    const pick = random(seed);
    for (let index = 0; index < count; index++) {
      try { fn(pick, index, seed); }
      catch (cause) { throw new Error(`seed=${seed} case=${index}`, {cause}); }
    }
  }
}
const fixture = (name = 'Property total', repeats = 1): Intent => ({
  format: 'qdl-intent', version: 1, name, thought: 'Total supplied finite quantities.',
  inputs: [{id: 'samples', name: 'samples', type: {
    kind: 'array', element: {kind: 'number', unit: 'item', integer: true, min: 0}, maxLength: 512
  }}], steps: [{id: 'total', op: 'sum', inputs: ['samples'], params: {}}], outputs: ['total'], repeats
});
function refusal(fn: () => unknown, code: string, path?: string): QdlError {
  let caught: unknown;
  try { fn(); } catch (error) { caught = error; }
  assert(caught instanceof QdlError, 'Expected typed refusal');
  assert.equal(caught.code, code);
  assert(ErrorSchema.safeParse(caught.toJSON()).success, 'Error must obey the advertised schema');
  assert(caught.path.startsWith('$'));
  if (path !== undefined) assert.equal(caught.path, path);
  return caught;
}
function executions(t: TestContext) {
  const original = V.execute;
  return t.mock.method(V, 'execute', (...args: unknown[]) => original(...args));
}

test('properties: valid intents and generated sums ground atomic/countOnce/receiptShape', () => {
  const sessions = new Map<number, Session>();
  cases(16, (pick, index, seed) => {
    const session = sessions.get(seed) ?? new Session(); sessions.set(seed, session);
    const intent = fixture(`Generated ${seed}-${index}`, 1 + pick(8));
    assert(IntentSchema.safeParse(intent).success);
    const artifact = session.compile(intent);
    assert.equal(session.compile(structuredClone(intent)).id, artifact.id);
    const samples = Array.from({length: pick(33)}, () => pick(1000));
    const request = {operation: 'run' as const, artifactId: artifact.id, requestId: `sum-${index}`, inputs: {samples}};
    assert(RequestSchema.safeParse(request).success);
    const record = session.dispatch(request);
    assert(ExecutionRecordSchema.safeParse(record).success);
    assert.equal(record.result.status, 'completed');
    assert.equal(record.result.occurrences.length, intent.repeats);
    for (const occurrence of record.result.occurrences) {
      assert.deepEqual(occurrence.outputs, [samples.reduce((a, b) => a + b, 0)]);
      assert.deepEqual(occurrence.effects, []);
    }
    assert.equal(record.result.emitted[0], artifact.source);
    const snapshot = session.exportSnapshot();
    assert.equal(snapshot.records.length, index + 1);
    assert.equal(snapshot.receipts.length, index + 1);
    assert.equal(snapshot.receipts[index]!.recordId, record.id);
  });
});

test('properties: malformed intent fields refuse passively (preflight/refusalUnchanged)', () => {
  const session = new Session(), baseline = session.exportSnapshot();
  const mutations: ((x: any, n: number) => string)[] = [
    x => { x.format = 'other'; return '$.format'; },
    x => { x.version = 2; return '$.version'; },
    x => { x.name = ''; return '$.name'; },
    x => { x.repeats = 0; return '$.repeats'; },
    x => { x.repeats = 9; return '$.repeats'; },
    x => { x.repeats = 1.5; return '$.repeats'; },
    x => { x.outputs = []; return '$.outputs'; },
    x => { x.inputs[0].id = '9bad'; return '$.inputs.0.id'; },
    x => { x.thought = 7; return '$.thought'; },
    x => { x.extra = true; return '$'; },
    (x, n) => { x.name = 'x'.repeat(121 + n); return '$.name'; },
    (x, n) => { x.outputs = Array(17 + n).fill('total'); return '$.outputs'; }
  ];
  cases(48, (pick, index) => {
    const intent = structuredClone(fixture());
    const path = mutations[index % mutations.length]!(intent, pick(10));
    assert.equal(IntentSchema.safeParse(intent).success, false);
    refusal(() => session.compile(intent), 'invalid-input', path);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
});

test('properties: semantic intent errors stay typed and admit no artifacts (refusalUnchanged)', () => {
  const session = new Session(), baseline = session.exportSnapshot();
  // Schema admission is distinct from reference/type validation in the interpreter.
  const mutations: ((x: Intent, n: number) => void)[] = [
    (x, n) => { x.outputs = [`missing${n}`]; },
    (x, n) => { x.steps[0]!.inputs = [`missing${n}`]; },
    x => { x.steps[0]!.id = 'samples'; },
    x => { x.inputs[0]!.type = {kind: 'number', unit: 'item', min: 2, max: 1}; }
  ];
  const diagnostics = [['reference', '$.outputs'], ['cycle', '$.steps'],
    ['invalid-input', '$'], ['refinement', '$']] as const;
  cases(16, (pick, index) => {
    const intent = fixture(); mutations[index % mutations.length]!(intent, pick(100));
    assert(IntentSchema.safeParse(intent).success);
    const [code, path] = diagnostics[index % mutations.length]!;
    refusal(() => session.compile(intent), code, path);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
});

test('properties: inert boundary rejects non-JSON without getters or mutation (preflight/passive)', () => {
  const session = new Session(), artifact = session.compile(fixture()), baseline = session.exportSnapshot();
  let touches = 0;
  const inputs: [unknown, string][] = [
    [{samples: [NaN]}, '$["inputs"]["samples"]["0"]'],
    [{samples: [Infinity]}, '$["inputs"]["samples"]["0"]'],
    [{samples: [undefined]}, '$["inputs"]["samples"]["0"]'],
    [{samples: [1n]}, '$["inputs"]["samples"]["0"]'],
    [{samples: [() => 1]}, '$["inputs"]["samples"]["0"]'],
    [{samples: new Date(0)}, '$["inputs"]["samples"]'],
    [{samples: new Array(2)}, '$["inputs"]["samples"]'],
    [{samples: '\ud800'}, '$["inputs"]["samples"]'],
    [Object.defineProperty({}, 'samples', {enumerable: true, get() { touches++; return [1]; }}), '$["inputs"]["samples"]'],
    [Object.defineProperty({samples: [1]}, 'hidden', {value: 1}), '$["inputs"]'],
    [{samples: [1], [Symbol('hidden')]: 1}, '$["inputs"]'],
    [JSON.parse('{"constructor":1,"samples":[1]}'), '$["inputs"]["constructor"]']
  ];
  const cyclic: any = {}; cyclic.samples = cyclic;
  inputs.push([cyclic, '$["inputs"]["samples"]']);
  cases(inputs.length, (_pick, index) => {
    const [value, path] = inputs[index]!;
    refusal(() => session.run({artifactId: artifact.id, requestId: `inert-${index}`, inputs: value as any}), 'invalid-input', path);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
  assert.equal(touches, 0);
  assert.equal(session.run({artifactId: artifact.id, requestId: 'inert-0', inputs: {samples: [1]}}).result.status, 'completed');
});

test('properties: malformed request envelopes expose stable codes/paths (refusalUnchanged)', () => {
  const session = new Session(), artifact = session.compile(fixture()), baseline = session.exportSnapshot();
  const mutations: ((x: any, n: number) => string)[] = [
    x => { x.operation = 'execute'; return '$.operation'; },
    x => { x.artifactId = 'ql_bad'; return '$.artifactId'; },
    x => { x.requestId = ''; return '$.requestId'; },
    (x, n) => { x.requestId = 'x'.repeat(129 + n); return '$.requestId'; },
    x => { delete x.inputs; return '$.inputs'; },
    x => { x.inputs = []; return '$.inputs'; },
    x => { x.extra = 1; return '$'; }
  ];
  cases(28, (pick, index) => {
    const request: any = {operation: 'run', artifactId: artifact.id, requestId: 'reuse', inputs: {samples: [1]}};
    const path = mutations[index % mutations.length]!(request, pick(100));
    assert.equal(RequestSchema.safeParse(request).success, false);
    refusal(() => session.dispatch(request), 'invalid-input', path);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
  refusal(() => session.dispatch({operation: 'inspect', artifactId: 'ql_' + '0'.repeat(64)}), 'unknown-artifact', '$');
  refusal(() => session.reproduce({artifactId: artifact.id, recordId: 'run_' + '0'.repeat(36), requestId: 'reuse'}), 'unknown-record', '$');
  assert.deepEqual(session.exportSnapshot(), baseline);
});

test('properties: frame budget/phase schema boundaries and refusals are passive (view/preflight)', () => {
  const session = new Session(), artifact = session.compile(fixture()), baseline = session.exportSnapshot();
  const budgets = [-1, 0, 1000, 1500, 3999, 4000, 4000.5, 4001, 23999, 24000, 24001, NaN, Infinity];
  const phases = [-Infinity, -1e9 - 1, -1e9, -0.25, -0, 0, 0.25, 1e9, 1e9 + 1, NaN, Infinity];
  for (const budget of budgets) for (const phase of phases) {
    const request = {artifactId: artifact.id, phase, options: {budget, crests: 2}};
    const valid = Number.isInteger(budget) && budget >= 4000 && budget <= 24000 &&
      Number.isFinite(phase) && Math.abs(phase) <= 1e9;
    assert.equal(FrameInputSchema.safeParse(request).success, valid, `budget=${budget} phase=${phase}`);
    if (!valid) {
      const path = !Number.isFinite(budget) ? '$["options"]["budget"]' : !Number.isFinite(phase) ? '$["phase"]' :
        Math.abs(phase) > 1e9 ? '$.phase' : '$.options.budget';
      refusal(() => session.frame(artifact.id, phase, request.options), 'invalid-input', path);
    }
  }
  for (const crests of [1, 2.5, 5]) refusal(() => session.frame(artifact.id, 0, {crests}), 'invalid-input', '$.options.crests');
  assert.deepEqual(session.exportSnapshot(), baseline);
});

test('properties: generated frames obey ownership/buffer relations and stay detached (passive)', t => {
  const execution = executions(t), session = new Session(), artifact = session.compile(fixture());
  const baseline = session.exportSnapshot();
  cases(4, (pick, index) => {
    const phase = [-1e9, 1e9, (pick(20001) - 10000) / 100, 0][index]!;
    const options = {budget: [4000, 24000, 4001, 23999][index]!, crests: 2 + pick(3)};
    const frame = session.frame(artifact.id, phase, options);
    assert(FrameSchema.safeParse(frame).success);
    assert.equal(frame.owners.length, options.budget);
    assert.equal(frame.points.length, options.budget * 4);
    assert.equal(frame.normals.length, options.budget * 3);
    assert.equal(frame.ridges.length, options.crests);
    assert(frame.owners.every(owner => owner >= 0 && owner < frame.nodeIds.length));
    assert(frame.ridges.every(r => r.line.every(p => p.owner < frame.nodeIds.length)));
    const replay = session.frame(artifact.id, phase, options);
    assert.deepEqual(frame, replay);
    frame.points.fill(99); frame.ridges[0]!.line[0]!.owner = 63; frame.nodeIds.length = 0;
    assert.deepEqual(session.frame(artifact.id, phase, options), replay);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
  assert.equal(execution.mock.callCount(), 0);
});

test('properties: FrameSchema rejects corrupted buffers and ridge owner metadata (abstract preflight)', () => {
  const session = new Session(), artifact = session.compile(fixture());
  const frame = session.frame(artifact.id, 0, {budget: 4000, crests: 2});
  const mutations: ((f: Frame, pick: (n: number) => number) => void)[] = [
    f => { f.points.pop(); }, f => { f.normals.pop(); }, f => { f.owners.pop(); },
    (f, pick) => { f.owners[pick(f.owners.length)] = f.nodeIds.length; },
    f => { f.nodeColors.pop(); }, f => { f.nodeRoles.pop(); },
    (f, pick) => { f.ridges[pick(f.ridges.length)]!.line[pick(301)]!.owner = f.nodeIds.length; }
  ];
  cases(14, (pick, index) => {
    const changed = structuredClone(frame); mutations[index % mutations.length]!(changed, pick);
    assert.equal(FrameSchema.safeParse(changed).success, false, `corruption=${index % mutations.length}`);
  });
});

test('properties: untrusted diagnostic paths fit ErrorSchema without reading accessors (preflight)', () => {
  const session = new Session(), artifact = session.compile(fixture()), baseline = session.exportSnapshot();
  cases(6, (pick, index) => {
    let touches = 0;
    const key = 'k'.repeat(2048 + pick(14000));
    const inputs = Object.defineProperty({}, key, {enumerable: true, get() { touches++; return 1; }});
    const error = refusal(() => session.run({artifactId: artifact.id, requestId: `long-${index}`, inputs}), 'invalid-input');
    assert(error.path.startsWith('$["inputs"]["'));
    assert(error.path.length <= 2048);
    assert.equal(touches, 0);
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
});

test('properties: seeded run/reproduce ledger oracle (ledgerMonotone/countOnce/atomic/refusalUnchanged)', t => {
  const execution = executions(t);
  for (const seed of SEEDS) {
    const pick = random(seed), session = new Session({maxRecords: 32});
    const artifact = session.compile(fixture()), other = session.compile(fixture('Other identity'));
    const ledger = new Map<string, {request: ExecutionRequest; record: ExecutionRecord}>();
    const start = execution.mock.callCount();
    for (let index = 0; index < 120; index++) {
      const key = `key-${pick(40)}`, saved = ledger.get(key), baseline = session.exportSnapshot();
      const prior = [...ledger.values()][pick(Math.max(1, ledger.size))];
      const request: ExecutionRequest = saved && pick(3) !== 0 ? structuredClone(saved.request) :
        prior && pick(3) === 0 ? {operation: 'reproduce', artifactId: artifact.id, recordId: prior.record.id, requestId: key} :
          {operation: 'run', artifactId: artifact.id, requestId: key, inputs: {samples: [pick(100), pick(100)]}};
      const label = `seed=${seed} step=${index}`;
      if (saved && JSON.stringify(request) !== JSON.stringify(saved.request)) {
        refusal(() => session.dispatch(request), 'request-conflict', '$.requestId');
        assert.deepEqual(session.exportSnapshot(), baseline, label);
      } else if (!saved && ledger.size === 32) {
        refusal(() => session.dispatch(request), 'resource-limit', '$');
        assert.deepEqual(session.exportSnapshot(), baseline, label);
      } else {
        const record = session.dispatch(request) as ExecutionRecord;
        if (saved) { assert.deepEqual(record, saved.record, label); assert.deepEqual(session.exportSnapshot(), baseline); }
        else ledger.set(key, {request: structuredClone(request), record: structuredClone(record)});
        record.result.occurrences.length = 0;
        if (saved && request.operation === 'run') {
          refusal(() => session.dispatch({...request, artifactId: other.id}), 'request-conflict', '$.requestId');
        }
      }
      const snapshot = session.exportSnapshot();
      assert.equal(snapshot.records.length, ledger.size, label);
      assert.equal(snapshot.receipts.length, ledger.size, label);
      assert.equal(execution.mock.callCount() - start, ledger.size, label);
      for (const row of snapshot.receipts) {
        const expected = ledger.get(row.request.requestId)!;
        assert.deepEqual(row.request, expected.request, label);
        assert.equal(row.recordId, expected.record.id, label);
      }
    }
  }
});

test('properties: default 128 artifact store refuses overflow and never evicts (bounded/refusalUnchanged projection)', () => {
  const pick = random(SEEDS[0]!), session = new Session(), artifacts = [];
  assert.equal(session.describe().limits.artifacts, 128);
  for (let index = 0; index < 128; index++) artifacts.push(session.compile(fixture(`Capacity ${index}-${pick(100000)}`)));
  const full = session.exportSnapshot();
  assert.equal(full.artifacts.length, 128);
  refusal(() => session.compile(fixture('Overflow')), 'resource-limit', '$');
  for (const artifact of artifacts) {
    assert.equal(session.inspect(artifact.id).source, artifact.source);
    assert.equal(session.recover({source: artifact.source}).id, artifact.id);
    assert.equal(session.compile(fixture(artifact.payload.name)).id, artifact.id);
  }
  assert.deepEqual(session.exportSnapshot(), full);
});

test('properties: canonical nested binding permutations replay once (countOnce/ledgerMonotone)', t => {
  const execution = executions(t);
  const numeric = {kind: 'number' as const, unit: 'item', integer: true};
  const intent: Intent = {format: 'qdl-intent', version: 1, name: 'Record replay', thought: 'Add a supplied pair.',
    inputs: [{id: 'pair', name: 'pair', type: {kind: 'record', fields: {left: numeric, right: numeric}}}],
    steps: [{id: 'left', op: 'get', inputs: ['pair'], params: {path: 'left'}},
      {id: 'right', op: 'get', inputs: ['pair'], params: {path: 'right'}},
      {id: 'total', op: 'arithmetic', inputs: ['left', 'right'], params: {kind: 'add'}}], outputs: ['total']};
  const session = new Session(), artifact = session.compile(intent);
  cases(8, (pick, index, seed) => {
    const left = pick(1000), right = pick(1000), requestId = `order-${seed}-${index}`;
    const request = {artifactId: artifact.id, requestId, inputs: {pair: {left, right}}};
    const record = session.run(request), baseline = session.exportSnapshot();
    const replay = session.run({inputs: {pair: {right, left}}, requestId, artifactId: artifact.id});
    assert.deepEqual(replay, record);
    assert.deepEqual(record.result.occurrences[0]!.outputs, [left + right]);
    refusal(() => session.run({...request, inputs: {pair: {left: left + 1, right}}}), 'request-conflict', '$.requestId');
    assert.deepEqual(session.exportSnapshot(), baseline);
  });
  assert.equal(execution.mock.callCount(), 24);
});

test('properties: computed failures retain/replay/reproduce without repeated effects (countOnce/receiptShape)', t => {
  const execution = executions(t), session = new Session();
  const intent: Intent = {format: 'qdl-intent', version: 1, name: 'Failure replay', thought: 'Divide supplied quantities.',
    inputs: [{id: 'n', name: 'n', type: {kind: 'number', unit: 'item'}},
      {id: 'd', name: 'd', type: {kind: 'number', unit: 'one'}}],
    steps: [{id: 'ratio', op: 'arithmetic', inputs: ['n', 'd'], params: {kind: 'div'}}], outputs: ['ratio'], repeats: 8};
  const artifact = session.compile(intent);
  cases(8, (pick, index, seed) => {
    const request = {artifactId: artifact.id, requestId: `failed-${seed}-${index}`, inputs: {n: pick(1000), d: 0}};
    const record = session.run(request), baseline = session.exportSnapshot();
    assert.equal(record.result.status, 'failed');
    assert.equal(record.result.occurrences.length, 1);
    assert.deepEqual(record.result.occurrences[0]!.effects, []);
    assert.equal(record.result.occurrences[0]!.diagnostic?.nodeId, 'ratio');
    assert.deepEqual(session.run(request), record);
    assert.deepEqual(session.exportSnapshot(), baseline);
    const childRequest = {artifactId: artifact.id, recordId: record.id, requestId: `child-${seed}-${index}`};
    const child = session.reproduce(childRequest);
    assert.deepEqual(child.result, record.result);
    assert.equal(child.parentRecordId, record.id);
    assert.deepEqual(session.reproduce(childRequest), child);
  });
  assert.equal(execution.mock.callCount(), 48);
  assert.equal(session.exportSnapshot().records.length, 48);
  assert.equal(session.exportSnapshot().receipts.length, 48);
});

test('properties: default 256 record store preserves every replay at capacity (bounded/ledgerMonotone/countOnce)', t => {
  const execution = executions(t), pick = random(SEEDS[0]!), session = new Session();
  const artifact = session.compile(fixture()), issued: {request: ExecutionRequest; record: ExecutionRecord}[] = [];
  assert.equal(session.describe().limits.records, 256);
  for (let index = 0; index < 256; index++) {
    const request: ExecutionRequest = index % 5 === 4 ? {operation: 'reproduce', artifactId: artifact.id,
      recordId: issued[pick(index)]!.record.id, requestId: `full-${index}`} :
      {operation: 'run', artifactId: artifact.id, requestId: `full-${index}`, inputs: {samples: [pick(1000)]}};
    issued.push({request, record: session.dispatch(request) as ExecutionRecord});
  }
  const full = session.exportSnapshot();
  assert.equal(full.records.length, 256); assert.equal(full.receipts.length, 256);
  for (const {request, record} of issued) assert.deepEqual(session.dispatch(structuredClone(request)), record);
  for (let index = 0; index < 32; index++) {
    const {request, record} = issued[pick(256)]!;
    refusal(() => session.dispatch({...request, requestId: `overflow-${index}`}), 'resource-limit', '$');
    const conflict: ExecutionRequest = request.operation === 'run' ? {...request, inputs: {samples: [-1]}} :
      {...request, recordId: issued[(issued.findIndex(x => x.record === record) + 1) % 256]!.record.id};
    // A different complete payload conflicts even when the ledger is full.
    refusal(() => session.dispatch(conflict), 'request-conflict', '$.requestId');
  }
  assert.equal(execution.mock.callCount(), 256);
  assert.deepEqual(session.exportSnapshot(), full);
});

test('properties: exact record/aggregate byte boundaries commit or refuse atomically (bounded/atomic/refusalUnchanged)', () => {
  cases(3, (pick, index, seed) => {
    const measuring = new Session(), artifact = measuring.compile(fixture());
    const request = {artifactId: artifact.id, requestId: `bytes-${seed}-${index}`, inputs: {samples: [pick(1000)]}};
    const measured = measuring.run(request), size = Buffer.byteLength(JSON.stringify(measured));
    for (const delta of [-1, 0, 1]) {
      const session = new Session({maxRecordBytes: size + delta}); session.recover({source: artifact.source});
      const baseline = session.exportSnapshot();
      if (delta < 0) { refusal(() => session.run(request), 'resource-limit', '$'); assert.deepEqual(session.exportSnapshot(), baseline); }
      else assert.equal(session.run(request).result.status, 'completed');
    }
    const session = new Session({maxRecordsBytes: size * 2}); session.recover({source: artifact.source});
    const first = session.run(request), second = session.run({...request, requestId: request.requestId.replace('bytes', 'other')});
    assert.notEqual(first.id, second.id);
    const full = session.exportSnapshot();
    refusal(() => session.run({...request, requestId: 'extra'}), 'resource-limit', '$');
    assert.deepEqual(session.run(request), first);
    assert.deepEqual(session.exportSnapshot(), full);
  });
});
