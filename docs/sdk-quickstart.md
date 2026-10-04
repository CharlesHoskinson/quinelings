# Agent SDK quickstart

The experimental `@quinelings/agent-sdk` package turns bounded tasks into source-authored mathematical bodies, runs their local programs, and verifies fresh copies. It wraps this repository's thought compiler, anatomy, and executable quine runtime. QDL and the SDK may evolve together; the package does not freeze a language version.

## Build the checkout

Use Node.js 22 or later. From the repository root:

```sh
cd packages/agent-sdk
npm ci
npm run build
npm run typecheck
npm test
node examples/basic.mjs
```

The checked-in `examples/basic.mjs` asserts the total of 29 and the reproduced source. The examples below import the built checkout. Save JavaScript examples as `.mjs` files inside `packages/agent-sdk` and run them with `node`. A consumer project can install the local directory with `npm install /absolute/path/to/quinelings/packages/agent-sdk`, then import `@quinelings/agent-sdk` instead of `./dist/index.js`.

## Create, inspect, run, and reproduce

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
const created = runtime.create('[2,3,4] | square | sum | report total');
if (created.status !== 'supported') {
  throw new Error(JSON.stringify(created.diagnostics));
}
const artifact = created.artifact;
const inspected = runtime.inspect(artifact.id);
console.log(inspected.graph.nodes.map(node => [node.id, node.op, node.inputs]));

const record = runtime.run(artifact.id);
assert.deepEqual(record.result.tasks[0].output, [{ total: 29 }]);
assert.deepEqual(record.result.emitted, [artifact.source]);

const child = runtime.reproduce(artifact.id, record.id);
assert.equal(child.artifact.source, artifact.source);
assert.equal(child.record.parentRecordId, record.id);
assert.deepEqual(child.record.result.tasks[0].output, [{ total: 29 }]);
console.log({ artifactId: artifact.id, runId: record.id, childRunId: child.record.id });
```

`create` constructs and validates an artifact without running its task. `inspect` exposes the admitted source, graph, design, and codecs. `run` creates an execution record. `reproduce` uses a specific parent record to reconstruct and explicitly execute a fresh copy; it verifies source and outputs against that parent.

Artifact IDs identify canonical source using SHA-256. Reproduction of identical source retains the artifact identity and creates a new record identity. Source equality establishes exact reproduction; agreement with the original English requires separate assessment.

## Supply a typed plan

Agents can supply explicit `Intent` instead of relying on the local text parser. Save this example as `typed-plan.ts` in the package directory and run it with `npx tsx typed-plan.ts` after building:

```ts
import assert from 'node:assert/strict';
import { Runtime, type Intent } from './dist/index.js';

const intent: Intent = {
  format: 'quineling-intent',
  name: 'Water total',
  thought: 'Add the supplied water quantities in litres.',
  assumptions: ['All supplied quantities use L.'],
  inputs: [{
    id: 'water', value: [2, 3, 4],
    type: { kind: 'array', element: { kind: 'number', unit: 'L' } },
  }],
  steps: [{ id: 'total', op: 'sum', inputs: ['water'], params: {} }],
  outputs: ['total'],
};

const runtime = new Runtime();
const artifact = runtime.compile(intent);
assert.deepEqual(artifact.contract?.types.total, { kind: 'number', unit: 'L' });
assert.deepEqual(runtime.run(artifact.id).result.tasks[0]?.output, [9]);
```

The TypeScript `IntentStep` union gives each operation its own ordered input tuple and parameter shape. `ParseResult` and `CreationResult` discriminate on `status`: a supported result contains its intent or artifact; an unresolved result does not. The compiler also validates types, units, graph reachability, and resource limits at runtime. `artifact.contract.sourceBytes` counts the complete canonical artifact source in UTF-8 bytes, including its body and gesture.

Quantity units, assumptions, and original thought are companion metadata; save the complete artifact when that provenance matters. Source recovery in a fresh runtime does not recover companion metadata. A later compilation can attach the first explicitly supplied companion if it regenerates that exact source; the recovery example below shows this transition.

## Handle unresolved thoughts

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
for (const [thought, expected] of [
  ['make my city happy', 'clarify'],
  ['monitor continuously and send email', 'unsupported'],
  ['[] | mean', 'inconsistent'],
]) {
  const parsed = runtime.parse(thought);
  assert.equal(parsed.status, expected);
  console.log(parsed.status, parsed.diagnostics);
}
```

The local parser understands explicit JSON data and a bounded pipeline grammar. `clarify` needs more precise input; `unsupported` needs unavailable capabilities; `inconsistent` fails validation. Use each diagnostic's `code`, `path`, and `message` to revise the request. A model-generated plan must pass the same typed compiler.

Runtime validation failures throw `QuinelingError`, exported from the SDK with `code`, `path`, and `message` fields and a `toJSON()` method. For example, malformed typed plans throw `invalid-intent`; missing session IDs throw `unknown-artifact` or `unknown-record`; reproducing from a record for another source throws `stale-record`. Handle thrown errors in addition to proposal statuses.

```ts
import assert from 'node:assert/strict';
import { Runtime, QuinelingError } from './dist/index.js';

try {
  new Runtime().inspect('ql_missing');
  assert.fail('Expected an unknown artifact error');
} catch (error: unknown) {
  if (!(error instanceof QuinelingError)) throw error;
  assert.equal(error.code, 'unknown-artifact');
  console.log(error.toJSON());
}
```

Branch on `code`; diagnostic messages may change. `metadata-conflict` means that identical source already has a different companion intent in this session. For example, compiling the same graph and seed with revised thought or units can produce identical source. Use separate runtimes to retain both interpretations. The first intent, contract and source map remain stored. Re-admitting the same intent reuses them; an alternative source map does not replace the first one. A source recovered without a companion can receive its first companion through a subsequent matching `compile` or supported `create`. This does not change its source, ID or execution history. Intent equality uses canonical JSON, not semantic normalization: equivalent unit spellings and omitted versus empty assumptions can still conflict.

## Supply a proposal provider

`runtime.propose` accepts a provider implementing `ProposalProvider`. The hook returns a `ParseResult`; the runtime revalidates every supported intent through its typed compiler. This example uses an explicit local proposal fixture for a previously interpreted request:

```ts
import assert from 'node:assert/strict';
import { Runtime, type ProposalProvider } from './dist/index.js';

const runtime = new Runtime();
const fixture = runtime.parse('[2,3,4] | sum');
if (fixture.status !== 'supported') throw new Error('Invalid proposal fixture');
const provider: ProposalProvider = {
  async propose(thought, { signal }) {
    signal?.throwIfAborted();
    return {
      ...fixture,
      intent: { ...fixture.intent, thought },
    };
  },
};

const controller = new AbortController();
const proposal = await runtime.propose(
  'Add my supplied quantities: 2, 3, and 4.', provider, {}, controller.signal,
);
if (proposal.status !== 'supported') {
  throw new Error(JSON.stringify(proposal.diagnostics));
}
assert.deepEqual(runtime.run(proposal.artifact.id).result.tasks[0]?.output, [9]);
```

A real provider performs its own interpretation and returns `clarify`, `unsupported`, or `inconsistent` when it cannot supply a complete plan. Forward the supplied signal to asynchronous provider work. While the asynchronous hook is pending, aborting the signal rejects `runtime.propose` with `QuinelingError` code `cancelled`, even if the provider ignores the signal or never resolves. A late result is not admitted. This stops the runtime from accepting the proposal; it cannot stop provider-side network activity, billing or synchronous work. The provider must forward the signal to cancel its own resources. Successful proposal construction still requires a separate `run` call to execute the task.

## Simulate a guarded action

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
for (const [blocked, status, payload] of [
  [['B'], 'simulated', ['A', 'C', 'D']],
  [['B', 'C'], 'skipped', []],
]) {
  const thought = `route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ${JSON.stringify(blocked)} | simulate "walk-route"`;
  const created = runtime.create(thought);
  if (!created.artifact) throw new Error(JSON.stringify(created.diagnostics));
  const record = runtime.run(created.artifact.id);
  assert.deepEqual(record.result.tasks[0].output, [{
    status, action: 'walk-route', payload,
  }]);
}
```

The action is a local simulated receipt guarded by route success. It grants no network or filesystem authority. Task DAG evaluation is eager; `choose` is not a lazy branch for effects. Supply an explicit boolean action guard.

## Recover source and sample a body

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
const options = { seed: 42, repeats: 1 };
const created = runtime.create('[2,3,4] | sum', options);
if (!created.artifact) throw new Error(JSON.stringify(created.diagnostics));
const artifact = created.artifact;

for (const recovery of [
  { source: artifact.source },
  { harmonics: artifact.harmonics },
  { colors: artifact.colors },
]) {
  const recovered = runtime.recover(recovery);
  assert.equal(recovered.source, artifact.source);
  assert.equal(recovered.id, artifact.id);
}

const freshRuntime = new Runtime();
const imported = freshRuntime.recover({
  source: JSON.stringify(artifact.program, null, 2),
});
assert.equal(imported.source, artifact.source);
assert.equal(imported.intent, undefined);
assert.equal(imported.contract, undefined);

// Supply the original companion explicitly; it was not recovered from bytes.
assert.ok(artifact.intent);
const attached = freshRuntime.compile(artifact.intent, options);
assert.equal(attached.id, imported.id);
assert.equal(attached.source, imported.source);
assert.deepEqual(attached.intent, artifact.intent);
assert.equal(imported.intent, undefined); // Earlier snapshots remain detached.
assert.throws(() => freshRuntime.compile({
  ...artifact.intent, thought: 'A different interpretation of the same program.',
}, options), { code: 'metadata-conflict' });

const frame = runtime.frame(artifact.id, 0, { budget: 4000, crests: 3 });
assert.ok(frame.points.length > 0);
assert.ok(frame.points.every(Number.isFinite));
const owner = frame.owners[0];
assert.equal(frame.nodeColors.length, frame.nodeIds.length);
assert.equal(frame.nodeRoles.length, frame.nodeIds.length);
console.log({ node: frame.nodeIds[owner], role: frame.nodeRoles[owner],
  color: frame.nodeColors[owner], samples: frame.owners.length });
```

`recover` accepts exactly one encoding and validates recovered source. Formatted source JSON is normalized to canonical source, retaining its artifact identity. An existing artifact in the same runtime keeps its stored companion metadata; a fresh runtime has only the recovered program. Harmonics are numerical genome data; colors are exact RGB byte records. A screenshot is not a lossless source export. Reattaching a companion requires the original intent and compilation choices to regenerate the same complete source; compilation with a different design or compiler result instead creates a different artifact. Recovery, companion attachment and sampling do not execute the task or create a result.

`frame` takes a phase in radians: one authored gesture cycle is `2 * Math.PI`. The direct runtime accepts finite phases with magnitude at most `1e9`; use numerical tolerance when comparing phases one cycle apart. Its integer sample budget is 4,000–24,000, with 2–4 crests. `points` contains repeated `[x, y, z, alpha]` groups, `normals` contains `[nx, ny, nz]` groups, and `owners` indexes the parallel `nodeIds`, `nodeRoles` and `nodeColors` arrays. Coordinates are unprojected 3D material geometry.

`nodeColors` applies the source’s role palette, color strength and neutral ink. `frame` has no run-record or scalar-lens selector; these colors do not claim a measured result. A client displaying recorded scalar quantities must separately validate source, cycle and binding provenance. See the [lifecycle guide](sdk-lifecycle.md) for the complete boundary.

## Connect an agent

The same operations are available as discriminated requests through `runtime.dispatch`:

```js
import { Runtime } from './dist/index.js';
const runtime = new Runtime();
const parsed = runtime.dispatch({ operation: 'parse', thought: '[2,3] | sum' });
console.log(parsed);
```

Keep one `Runtime` for an agent session: it holds bounded in-memory artifact and execution-record stores, with defaults of 128 artifacts and 256 records. Full stores throw `resource-limit`. IDs must resolve in that runtime; persist exported artifacts explicitly if you need another process to recover their source.

The MCP entry point is `@quinelings/agent-sdk/mcp`, exporting `createQuinelingMcpServer(runtime)`. For a client that launches an MCP stdio subprocess, configure command `node` with an absolute path to the built `dist/mcp-cli.js` as its argument. Its sixteen tools cover task creation, inspection and execution, offspring construction, lineage and ranch commands. The basic tools are `quineling_parse`, `quineling_compile`, `quineling_create`, `quineling_inspect`, `quineling_run`, `quineling_reproduce`, `quineling_recover`, and `quineling_frame`. Collaboration adds `quineling_offspring_preview`, `quineling_offspring_frame`, `quineling_offspring_admit`, `quineling_lineage`, `quineling_annotate`, `quineling_world_create`, `quineling_world_inspect`, and `quineling_world_command`. See the [MCP guide](sdk-mcp-guide.md) for their contracts. Successful calls return `structuredContent.result`, mirrored as JSON text; check `isError` before consuming a result.

The A2A entry point is `@quinelings/agent-sdk/a2a`, exporting `createA2AApp`. From the built package directory, `node dist/a2a-cli.js` starts the local server on `127.0.0.1:8049`; `QUINELING_A2A_PORT` selects another port. Discovery is at `/.well-known/agent-card.json`, with JSON-RPC at `/a2a/jsonrpc` and HTTP+JSON at `/a2a/rest`. Its plain-text input creates a proposal; explicit structured `run` and `reproduce` requests execute tasks. Both transports expose the same local lifecycle and simulated effects.

Verification is split between SDK/runtime tests, browser behavior tests, finite Quint models and Lean lemmas about the modeled mathematics and constructor. These do not prove arbitrary English meaning, visual beauty, complete codec inversion, or a refinement of the entire JavaScript SDK. See [formal scope](GENERATIVE-FORMAL-MODEL.md).

For the underlying contracts, see [typed intent schema](../design/intent.schema.json), [program contract](PROGRAM-CONTRACT.md), and [thought-to-lifeform design](THOUGHT-TO-LIFEFORM.md).
