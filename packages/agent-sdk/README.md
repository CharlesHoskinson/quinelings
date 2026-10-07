# Quinelings Agent SDK

Agent SDK **1.0.0** provides stable **QDL 1**: bounded declared-thought programs, source-authored mathematical bodies and complete constructor quines. Import `Session` from the explicit `/v1` entry point. Runtime snapshots remain outside source; every effect is a local simulation. Legacy `Runtime` and ranch policies remain experimental.

Install the [1.0.0 tarball](https://charleshoskinson.github.io/quinelings/assets/sdk/quinelings-agent-sdk-1.0.0.tgz) with Node.js 22+: `npm install ./quinelings-agent-sdk-1.0.0.tgz`. This package has not been published to npm.

```js
import { Session } from '@quinelings/agent-sdk/v1';

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

const first = session.run({
  artifactId: artifact.id, requestId: 'water-a',
  inputs: { readings: [2, 3], reserve: 4 }
}); // outputs: [9]
const second = session.run({
  artifactId: artifact.id, requestId: 'water-b',
  inputs: { readings: [4, 5], reserve: 2 }
}); // outputs: [11]

console.log(first.result.occurrences[0].outputs); // [9]
console.log(second.result.occurrences[0].outputs); // [11]
console.log(session.inspect(artifact.id).source === artifact.source); // true
session.verify(artifact.id); // source-only; no task evaluation
```

`compile`, `inspect`, `verify`, `recover`, `frame`, `bake` and `traceOwners` are passive. `run` and `reproduce` explicitly evaluate tasks. Exact request-key replay returns the retained record without another evaluation; changed inputs need a new key. Source carries all six public declaration arrays, normalized types, policy, task and body. These declarations do not expose private reasoning or establish observation truth. Imported snapshot histories remain asserted.

### Embedding bodies in your own renderer

`Session.bake(artifactId, {frames, budget, crests, quantize})` returns a seamless loop of
`frames` poses (frame k is phase `2πk/frames`) as fresh typed buffers: per-frame `positions`
(xyz per sample), per-node `anchors` and crest `ridges`, plus phase-invariant `owners`,
`nodeIds`, `nodeColors`, `nodeRoles`, `bounds` and the `sourceHash`. Coordinates are
normalized into the body's fixed portrait box: `world = bounds.center + bounds.scale * stored / quantScale`
(`quantScale` is 32767 for `int16`, 1 for `float32`). Defaults: 24 frames, budget 1500,
3 crests, `float32`. Budgets run from 512 to 24000; `frames × budget` is capped at 2^20.
Below 4000 the bake keeps every reserved owner and cap sample of the shared sampler and a
strided subset of the rest, so every task node stays visible (the worst admissible
anatomy reserves 160 samples). `frame()` keeps its 4000 floor.

`Session.traceOwners(recordId)` maps every retained trace step of a run to an index into
`nodeIds`, so a renderer can light the executing node. Both methods are passive: they
never evaluate a task or change the session. See `examples/bake.mjs` and the formal model
`spec/v1-bake.qnt` (`npm run formal:bake` at the repository root).

## Render a Quineling

`Session.frame(artifactId, phase, options?)` samples the source assembly. It does not evaluate the task and does not append a run record. `phase` is radians. The gesture repeats every `2π`, and `|phase|` must be finite and at most `1e9`.

`options.budget` is the integer sample count, from 4000 through 24000. Omitting it samples 12000 points. `options.crests` is an integer from 2 through 4. Omitting it returns 3 crest lines. Each crest line has 301 samples. `spec/design.qnt` checks the same sample interval on `validProfile` (`samples >= 4000 and samples <= 24000`). A budget of 1000 or 1500, including a short keynote pose, is refused with `QdlError` code `invalid-input`.

Each sample is four floats in `points`: `[x, y, z, w]`. The sampler writes `0.18` into a 32-bit float, so every returned `w` is `Math.fround(0.18)`. `normals` are three floats `[nx, ny, nz]`. `owners[i]` is an index into the parallel arrays `nodeIds`, `nodeRoles` and `nodeColors`. Colors match `/^#[0-9a-f]{6}$/i`. Roles are `input`, `process`, `decision`, `quote`, `action` or `report`. Role color mixes the role pigment with the source neutral ink by chroma strength. Samples that share a role share a color. This call does not read a recorded scalar lens.

`examples/render.mjs` groups those buffers and checks the bounds above. A source with no assembly anatomy and gesture still verifies, recovers and runs; `frame` then throws code `unsupported-frame`.

```js
import { Session } from '@quinelings/agent-sdk/v1';

const session = new Session();
const liter = {kind: 'number', unit: 'L', min: 0};
const rendered = session.compile({
  format: 'qdl-intent', version: 1, name: 'Rendered reading total',
  thought: 'Sum the explicitly supplied readings.',
  inputs: [{id: 'readings', name: 'readings', type: {kind: 'array', element: liter}}],
  steps: [{id: 'total', op: 'sum', inputs: ['readings'], params: {}}],
  outputs: ['total']
});
const pose = session.frame(rendered.id, 0, {budget: 4000, crests: 2});
const owner = pose.owners[0];
console.log({
  samples: pose.owners.length,
  x: pose.points[0], y: pose.points[1], z: pose.points[2], w: pose.points[3],
  nodeId: pose.nodeIds[owner], color: pose.nodeColors[owner], role: pose.nodeRoles[owner]
});
```

See the [stable SDK guide](../../docs/SDK-V1.md), [QDL 1 contract](../../docs/QDL-V1.md), [ten reusable recipes](../../docs/QDL-V1-LIBRARY.md) and [identity/upgrade policy](../../docs/QDL-V1-UPGRADES.md). The release identity is `qdl-v1.0.0`.

Exports:

- `@quinelings/agent-sdk/v1`: stable `Session`, `sourceOnly`, `QdlError` and typed intents, requests and results.
- `@quinelings/agent-sdk/browser`: single-file browser ESM for that same `Session`, `sourceOnly`, `QdlError`, and experimental `MathematicalLifeforms`.
- `@quinelings/agent-sdk/v1-schema`, `/v1-mcp`, `/v1-a2a`, `/v1-migrate`: shared schemas, adapters and explicit passive legacy migration.
- `@quinelings/agent-sdk/v1-ranch`: experimental typed analyze/preview/admit policies.
- `@quinelings/agent-sdk`: legacy experimental `Runtime`, `QuinelingError`, typed intent/requests/results, recipes.
- `@quinelings/agent-sdk/schema`: strict recursive JSON and intent Zod schemas.
- `@quinelings/agent-sdk/mcp`: `createQuinelingMcpServer` and stdio CLI `quinelings-mcp`.
- `@quinelings/agent-sdk/a2a`: `createA2AApp`, `BoundedTaskStore`, `QuinelingExecutor` and CLI `quinelings-a2a`.

Node.js 22+; ESM and TypeScript declarations. `npm ci && npm run build && npm run typecheck && npm test` in this package builds and verifies the checkout. Then run `node examples/basic.mjs` for an asserted total-29 calculation and source-matching copy, `node examples/v1.mjs` for the stable water session, `node examples/render.mjs` for a `Session.frame` sample, and `node examples/check-readme.mjs` to execute the snippets in this file. Install a built directory or the downloadable tarball; this package has not been published to npm.

`npm run build` also writes a single-file browser bundle of stable `Session` plus experimental `MathematicalLifeforms`. `dist/browser/quinelings-v1.mjs` is the ESM file (`@quinelings/agent-sdk/browser`). `dist/browser/quinelings-v1.iife.js` installs the global `QuinelingsV1`. `examples/browser.html` loads the IIFE from a `file://` page, draws one `Session.frame`, and leaves the task unevaluated until `run`. The bundle aliases `node:crypto` to the browser SHA-256 helper and defines `Buffer.byteLength` with `TextEncoder`. It does not include MCP, A2A, or the Node filesystem. `npm run build:browser` rebuilds only those two files.

For stable QDL 1, start MCP with `node dist/v1-mcp-cli.js` or A2A with `node dist/v1-a2a-cli.js`. The following legacy experimental API remains available.

## Legacy experimental Runtime

Start legacy MCP with `node dist/mcp-cli.js`. Start the loopback A2A server with `node dist/a2a-cli.js`; discovery is `http://127.0.0.1:8049/.well-known/agent-card.json`. The adapter uses official MCP and A2A SDKs. Public/multi-user hosting requires the embedder's authentication and per-session runtime isolation.

Artifact IDs hash complete canonical source. Execution IDs identify individual runs. Returned data are detached snapshots. Typed interpretation metadata is a companion to the quine; persist complete artifacts when it matters. Genome recovery in a fresh runtime has no companion metadata. A matching `compile` or supported `create` can explicitly attach the first companion to the recovered source while retaining its ID. Re-admitting the same intent keeps the first companion and source map; a different intent for identical source throws `metadata-conflict` without overwriting it. Regenerating the same source requires matching compiler behavior, seed and repeat choices. Intent equality uses canonical JSON, not semantic normalization: equivalent unit spellings and omitted versus empty assumptions can still conflict. Formatting a source export is allowed: recovery canonicalizes JSON and validates the constructor.

`Session.frame` and `Runtime.frame` take phase in radians, with a `2π` gesture cycle and a direct-runtime bound of `|phase| ≤ 1e9`. `budget` is an integer from 4000 through 24000 (12000 when omitted) and `crests` is an integer from 2 through 4 (3 when omitted). Returned `points` groups are `[x, y, z, w]`. Every `w` is `Math.fround(0.18)`, the 32-bit float written by the sampler. Normals are `[nx, ny, nz]`, and each sample owner indexes parallel `nodeIds`, `nodeRoles` and `nodeColors` arrays. Role colors use source strength and neutral ink. The assembly frame does not read a recorded scalar lens and does not report a measured result. The experimental woven-body sampler below uses a different budget and an alpha component.

Stores are bounded (128 artifacts, 256 records by default), reject additions when full, and grant no external authority. A2A task history is separately bounded; paused clarification tasks expire or may be evicted, while active work is protected. Known field-path failures return `QuinelingError`.

Lean lemmas and bounded Quint models are separate from SDK/browser tests. They do not prove arbitrary English meaning, beauty, protocol conformance or the complete JavaScript runtime and codecs. Source equality and output checks establish the particular verified copy, not agreement with all companion prose.

## Experimental ranch APIs

The existing eight operations remain available. Eight additions build source-backed offspring, inspect external derivation evidence and manage explicit social time:

| Method | Result / purpose |
| --- | --- |
| `offspringPreview(input)` | Stateless `{status:'ready',candidate}` or semantic `{status:'rejected',diagnostics}`; malformed requests throw. |
| `offspringFrame({input,candidateId,childSourceHash,phase,options?})` | Rebuilds the complete candidate and samples its body after checking both identities. |
| `offspringAdmit({input,candidateId,childSourceHash,target,requestId})` | Rebuilds and explicitly admits to the library or a fresh world proposal; returns a small acknowledgement. |
| `lineage({artifactId?,cursor?,limit?})` | Flat append-order session derivations, limit 1..32; source assertions alone are not verified lineage. |
| `annotate({artifactId,intent})` | Attaches only absent/identical companion metadata after exact task comparison; conflicting metadata refuses. |
| `worldCreate({worldKey,seed,affinity?})` | One world per Runtime; same configuration is idempotent. Affinity is `structural` or `neutral`. |
| `worldInspect(worldId)` | Detached snapshot without ticking. |
| `worldCommand({worldId,expectedRevision,sequence,command})` | Explicit import/retire/participate/invite/cancelProposal/advance 1..4 transition. |

All ranch records are recursively closed. Parent pins are ordered `{artifactId,intentHash:string|null}`; a null hash means companion metadata is absent. Companion hashes use SHA256 of the project's canonical JSON with sorted object keys and ordered arrays. The input also carries a closed recipe, uint32 nonce, `style:{mutation:'none'|'gentle',traits?:completeSixTraits}`, and manual or pinned pairing origin. Trait overrides require `mutation:'none'`.

The four recipes are `compose` (parent 0 `donorOutput` to parent 1 literal `recipientInput`), `mate` (parent 0 `donorNode` to parent 1 `replaceNode`), `merge` (both complete tasks under report fields `a0..` then `b0..`) and `body` (`base:0|1`). Typed recipes recompile both companions, compare normalized complete structural types and check child refinements. Compose/mate require pure donation, preserve all recipient actions and their entire guard cones, and require a real donor→recipient-operation→output connection. A cached parent result, terminal replacement or unrelated retained operation is insufficient. Equal-source parents refuse task recipes; source-only assembled parents can make body variation.

Body preserves the selected base's exact task IDs/order, parameters, ordered ports/outputs, name, repeats and compatible companion metadata. It regenerates anatomy and visual traits. Task-changing recipes reset repeats to 1 and use disjoint role/index namespaces. Six integer traits in[-1000, 1000] control axial/radial scale, bend, gesture strength, separate phase rate and chroma strength; deterministic named SHA256 draws select parental/floor-midpoint traits and optional gentle mutation. Source heredity contains asserted parent hashes, seed, nonce and traits. Recovery retains those assertions but invents no thought, units, authenticated ancestry or execution record. The full guide gives the exact trait mappings and a runnable litre-mean→budget composition with handwritten 12/8 output, preview/frame/admit/lineage, fresh source-only Run/copy/genome checks and body examples:

[SDK ranch guide and verified examples](https://github.com/CharlesHoskinson/quinelings/blob/main/docs/SDK-RANCH-GUIDE.md)

Imported world adults start energy 60 with participation disabled. Explicit reciprocal invitations and social ticks can produce a proposal after approach and 80 consecutive court ticks; a proposal creates no child and selects no recipe. Admission requires the live ordered resident/source/intent/epoch pins, current revision, two enabled adult/no-rest parents with energy ≥ 50, safe capacity/placement and timer bounds. It consumes the proposal, deducts 30 each, sets cooldown 200 and inserts an energy 40 disabled child for 200 nursery ticks. Pending proposals can recover energy; invitation/approach/attempt/proposal durations are 120/160/240/600 ticks. Withdrawal, retirement and annotation invalidate affected links. No social transition or animation callback invokes a task.

For new commands, use the exact `nextSequence` and current `revision` from `worldInspect`. A successful command advances revision once, even when advancing four ticks. Birth/annotation can also change revision without consuming a command sequence. After a lost response, resend the **original complete request** with its original sequence/revision or admission `requestId`; do not issue a new key to retry the same action. Matching retained retries return the original acknowledgement before stale freshness checks. Conflicting payloads and discarded old command sequences refuse. Candidate/source identity excludes social origin; derivation identity binds origin so distinct births can share one source without losing separate evidence.

Admission stages validation, serialization and all capacities before one synchronous store swap; refusals preserve stores and charges. This is session-local in-memory atomicity, not crash durability. Limits include source 64 KiB, candidate 2 MiB, derivation 32 KiB/64 origins, artifact aggregate 32 MiB, 128 derivations/4 MiB, 128 successful admission receipts without eviction, 32 residents/8 nursery, 16 pairs/proposals, world snapshot 1 MiB, event ring 256 and command receipt window 256. Counters/ticks stop at 1000000. Explicit Run capacity is separate from admission. Lineage/read/preview/frame operations do not tick or execute.

MCP discovers all 16 `quineling_*` tools: the original parse/compile/create/inspect/run/reproduce/recover/frame and offspring_preview/offspring_frame/offspring_admit/lineage/annotate/world_create/world_inspect/world_command. Its strict schemas expose actual nested recipe/type fields, read-only/mutation annotations and structured `{code,message,path}` errors; successful results use `{result}`. A2A advertises `build`, `ranch` and `execute` skills and accepts the same structured operation union. A single user text part still means passive create; ranch requests use a single JSON data part and retain `{operation,result}` artifact envelopes. A2A task/message IDs do not replace admission/sequence keys. Cancellation can win before dispatch; synchronous evaluation/commit cannot be interrupted midway. These ranch policies and legacy APIs remain experimental. Stable QDL 1 does not imply a full JS/compiler/SHA/formal/browser/performance proof.

Guides and visual workspace: https://charleshoskinson.github.io/quinelings/sdk.html
Source and tests: https://github.com/CharlesHoskinson/quinelings/tree/main/packages/agent-sdk

### New mathematical body extension

The `/experimental` entry point is on this same package. It retains each admitted legacy or QDL 1 task source inside a recoverable visual capsule. It adds graph-authored mathematical constructions and deterministic owned tissue sampling. The historical `@quinelings/agent-sdk` 1.0.0 archive remains available unchanged.

```ts
import { Session } from '@quinelings/agent-sdk/v1';
import { VisualCapsule, MathematicalLifeforms } from '@quinelings/agent-sdk/experimental';

const admitted = new Session().compile({
  format: 'qdl-intent', version: 1, name: 'Supplied reading total',
  thought: 'Sum the explicitly supplied readings.',
  inputs: [{id: 'readings', name: 'readings', type: {kind: 'array', element: {kind: 'number', unit: 'L'}}}],
  steps: [{id: 'total', op: 'sum', inputs: ['readings'], params: {}}],
  outputs: ['total']
});
const capsule = VisualCapsule.author(admitted.source, 42);
VisualCapsule.verify(capsule); // constructor only
const recovered = VisualCapsule.recover(capsule, 'harmonics');
const body = MathematicalLifeforms.compile(recovered.design.woven, recovered.task);
const frame = MathematicalLifeforms.frame(body, 0, {budget: 2048});
const result = VisualCapsule.execute(recovered.program, {bindings: {readings: [2, 3, 4]}});
```

`MathematicalLifeforms.frame` takes an integer `budget` from 128 through 100000. The call above uses 2048 and returns 8192 point floats and 2048 owners. `crests` is a boolean; omitting it draws crests. `crests: false` returns no ridge lines. Point groups on this sampler are `[x, y, z, alpha]`. The MCP and A2A `visualFrame` adapter accepts budget 128 through 12000 and defaults to budget 2048 and crests false. This sampler is separate from `Session.frame`.

The result distinguishes `taskProfile: 'legacy'` with `tasks` from `taskProfile: 'qdl-v1'` with `occurrences`. For this program the QDL 1 occurrence outputs are `[9]`. Body authoring, verification, recovery and sampling are passive. Only execution evaluates the retained task. The complete capsule source is emitted exactly by either task profile. `verify` reports `exactSource: true` and the capsule source. `VisualCapsule.execute` refuses a program that carries the visual capsule payload but fails admission, also with `constructionOnly: true`; it does not fall back to the legacy interpreter. Programs without that payload keep the legacy execution path.

Opt in to the eight `quineling_visual_*` MCP tools with `quinelings-mcp --experimental-visual` (`node dist/mcp-cli.js`), or use `createQuinelingMcpServer(runtime, {experimentalVisual: true})`. The legacy A2A CLI `quinelings-a2a` (`node dist/a2a-cli.js`) accepts the same flag once. The stable v1 CLIs do not. `createA2AApp({experimentalVisual: true})` accepts `visualAuthor`, `visualAdmit`, `visualRecover`, `visualFrame`, `visualAnchor`, `visualBounds`, `visualVerify` and `visualRun` JSON operations. These are explicit experimental surfaces; original Runtime and stable QDL 1 endpoints keep their existing admission formats. See the website's API guide for exact request fields and bounds.
