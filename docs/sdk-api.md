# Experimental SDK API reference

`@quinelings/agent-sdk` exports `Runtime`, `QuinelingError`, and public TypeScript types. Import adapters from `/mcp` or `/a2a`, and validation schemas from `/schema`. The package and QDL remain experimental. One Runtime owns in-memory artifacts, execution records, one ranch world, admitted derivations and successful admission receipts. Returned data is detached from those stores.

See the [quickstart](sdk-quickstart.md), [MCP guide](sdk-mcp-guide.md), [A2A guide](sdk-a2a-guide.md), and [ranch guide](SDK-RANCH-GUIDE.md) for complete workflows. Public declarations are in [types.ts](../packages/agent-sdk/src/types.ts) and [ranch-types.ts](../packages/agent-sdk/src/ranch-types.ts); validation follows [schema.ts](../packages/agent-sdk/src/schema.ts) and Runtime checks.

## Runtime and dispatch

```ts
const runtime = new Runtime({maxArtifacts:128,maxRecords:256});
```

Optional constructor bounds are `maxArtifacts:1..1024` and `maxRecords:1..4096`; defaults are 128 and 256. Stores reject new entries at capacity. `dispatch(request)` uses the same methods below and returns their result directly. Dispatch records are closed: include `operation` and the listed fields only. MCP tool arguments omit `operation`; A2A JSON data carries the dispatch record.

| Operation | Direct method | Dispatch fields beyond `operation` | Result |
| --- | --- | --- | --- |
| `parse` | `parse(thought)` | `thought` | `ParseResult`: supported/clarify/unsupported/inconsistent, diagnostics and assumptions. |
| `compile` | `compile(intent, options?)` | `intent`, `options?` | `Artifact`. |
| `create` | `create(thought, options?)` | `thought`, `options?` | `CreationResult`: supported artifact or interpretation status. |
| `inspect` | `inspect(artifactId)` | `artifactId` | `Artifact`. |
| `run` | `run(artifactId)` | `artifactId` | Fresh `ExecutionRecord`. |
| `reproduce` | `reproduce(artifactId, recordId)` | `artifactId`, `recordId` | `{artifact,record}`, with a fresh child execution. |
| `recover` | `recover(recovery)` | `recovery` | `Artifact`. Recovery has exactly one of `source`, `harmonics`, `colors`. |
| `frame` | `frame(artifactId, phase, options?)` | `artifactId`, `phase`, `options?` | `Frame` numeric geometry. |
| `offspringPreview` | `offspringPreview(input)` | `input` | `{status:'ready',candidate}` or `{status:'rejected',diagnostics}`. |
| `offspringFrame` | `offspringFrame(request)` | `input`, `candidateId`, `childSourceHash`, `phase`, `options?` | `{candidateId,childSourceHash,frame}`. |
| `offspringAdmit` | `offspringAdmit(request)` | `input`, `candidateId`, `childSourceHash`, `target`, `requestId` | Admission acknowledgement. |
| `lineage` | `lineage(request = {})` | `artifactId?`, `cursor?`, `limit?` | `{derivations,nextCursor?}`. |
| `annotate` | `annotate(request)` | `artifactId`, `intent` | Enriched `Artifact`. |
| `worldCreate` | `worldCreate(config)` | `worldKey`, `seed`, `affinity?` | `World` snapshot. |
| `worldInspect` | `worldInspect(worldId)` | `worldId` | `World` snapshot. |
| `worldCommand` | `worldCommand(request)` | `worldId`, `expectedRevision`, `sequence`, `command` | Command acknowledgement. |

`Runtime.propose(thought, provider, options?, signal?)` is a separate programmatic asynchronous helper returning `Promise<CreationResult>`. It invokes only the explicitly supplied `ProposalProvider`, revalidates its typed proposal and honors cancellation before storing a result. It is not a dispatch operation, MCP tool or A2A operation; parse/create do not implicitly invoke a provider.

Only `run` and `reproduce` execute tasks and add execution records. Compile-time validation may calculate bounded pure refinements. Preview, admission, world time, recovery, annotation, lineage and pose sampling do not run a parent or child. `reproduce` is exact-source copy plus explicit fresh execution; `offspringAdmit` is source construction/admission without execution.

Creation options are `{seed?:uint32,repeats?:1..8}`. Frame options are `{budget?:4000..24000,crests?:2..4}`; defaults are 12000 and 3. Runtime frame phases are finite numbers within ±1e9. The existing MCP `quineling_frame` imposes the narrower ±1e6 discovery bound; `quineling_offspring_frame` accepts ±1e9. Frames have numeric `points`, `normals`, `owners`, `ridges`, `nodeIds`, `nodeColors`, and `nodeRoles`, not task results or images.

## Closed offspring requests

The following TypeScript shape shows required fields and alternatives; ranges are enforced at runtime and by adapter schemas. Send finite JSON with no unknown fields, getters, functions or cycles.

```ts
type ParentPin = {artifactId:string; intentHash:string|null};
type Recipe =
  | {kind:'compose'; donorOutput:string; recipientInput:string}
  | {kind:'mate'; donorNode:string; replaceNode:string}
  | {kind:'merge'}
  | {kind:'body'; base:0|1};
type Traits = {
  elongation:number; spread:number; curvature:number;
  gestureGain:number; tempo:number; pigmentGain:number;
};
type Origin = {kind:'manual'} | {
  kind:'pairing'; worldId:string; proposalId:string;
  parentResidents:[string,string]; epochs:[number,number];
};
type OffspringInput = {
  parents:[ParentPin,ParentPin]; recipe:Recipe; nonce:number;
  style:{mutation:'none'|'gentle'; traits?:Traits}; origin:Origin;
};
```

Parents are ordered roles. `intentHash` is the SHA256 of the project's canonical complete companion intent; use null only when no companion exists. Digests are 64 lowercase hexadecimal characters. Nonce is uint32. Six-trait overrides must be complete integers in −1000..1000 and require `mutation:'none'`. Compose/mate selectors are existing node/output IDs, matching `[A-Za-z][A-Za-z0-9_-]{0,63}` with unsafe prototype names excluded.

Compose, mate and merge require both exact graph-matching typed companions and independently recomputed types. Compose/mate require pure donor closures, protect recipient actions and Boolean guard ancestors, and require actual integrated computation. Merge joins ordered outputs in separate fields. Body preserves its selected base's exact task projection and compatible companion metadata. Task-changing recipes use repeats 1; body preserves repeats. Typed recipe refusal is a ready/rejected preview result; malformed input and unknown artifacts throw. Courtship never chooses a recipe or guarantees compatibility.

A candidate contains `{candidateId,derivationId,childSourceHash,child,changes,classification,diagnostics,lineage}`. Preview does not store that child or append lineage. Frame and admission statelessly rebuild from the complete `input` and verify both candidate/source pins; there is no hidden preview handle.

The following excerpt assumes the complete manual `input` from the ranch guide:

```js
const preview = runtime.offspringPreview(input);
if (preview.status !== 'ready') throw new Error(JSON.stringify(preview.diagnostics));
const c = preview.candidate;
const pose = runtime.offspringFrame({input,candidateId:c.candidateId,
  childSourceHash:c.childSourceHash,phase:0,options:{budget:4000,crests:2}});
const request = {input,candidateId:c.candidateId,childSourceHash:c.childSourceHash,
  target:{kind:'library'},requestId:'manual-birth-1'};
const receipt = runtime.offspringAdmit(request); // input.origin must be manual.
const sameReceipt = runtime.offspringAdmit(request); // Exact original request retry.
const execution = runtime.run(receipt.artifactId); // Separate explicit task execution.
```

Admission targets are exactly `{kind:'library'}` or `{kind:'world',worldId,expectedRevision}`. Manual origin requires library; pairing origin requires world. `requestId` is 1..128 characters. Success returns `{requestId,candidateId,derivationId,artifactId,childSourceHash,worldId?,residentId?,revision?,tick?}`. The world fields are present for a world birth. Reusing a successful key with a different canonical complete request raises `metadata-conflict`. Exact replay returns the original acknowledgement before rebuilding or world freshness checks. A rejected request writes no successful receipt.

## World commands and optimistic concurrency

```js
const world = runtime.worldCreate({worldKey:'garden',seed:23,affinity:'neutral'});
const snapshot = runtime.worldInspect(world.id);
const request = {worldId:world.id,expectedRevision:snapshot.revision,
  sequence:snapshot.nextSequence,command:{kind:'advance',ticks:4}};
const acknowledgement = runtime.worldCommand(request);
const sameAcknowledgement = runtime.worldCommand(request);
```

World key is 1..64 characters; seed is uint32. Affinity is `structural` by default or `neutral` for distance alone. Omitted and explicit structural modes are equivalent. One Runtime permits one world configuration: identical creation returns its current snapshot; a different key, seed or affinity raises `metadata-conflict`. Structural affinity is a heuristic, not typed task compatibility or English understanding.

Command alternatives are recursively closed:

```ts
type WorldAction =
  | {kind:'import'; artifactId:string}
  | {kind:'retire'; residentId:string}
  | {kind:'participate'; residentId:string; enabled:boolean}
  | {kind:'invite'; residentId:string; partnerId:string}
  | {kind:'cancelProposal'; proposalId:string}
  | {kind:'advance'; ticks:1|2|3|4};
```

New commands require the exact `nextSequence` and current `revision`. Success advances revision once, including a multi-tick batch, and returns `{worldId,revision,sequence,tick,residentId?,proposalId?,appliedTicks?}`. Retained exact sequence/payload replay changes nothing. Conflicting, gap and discarded stale sequences refuse; the watermark never falls when receipts are evicted. Admission and annotation can change revision without using a command sequence.

After transport loss, resend the original complete request with its original sequence or admission requestId and old expected revision. Refreshing revision or allocating a new key/sequence changes the operation rather than retrying it. Once a lost command receipt has fallen outside the 256-entry window, its old sequence refuses; do not infer that it never executed.

Imported adults start energy 60 and participation disabled. Only mutual invitations form pairs; a proposal after courtship is a fresh ordered source/intent/epoch pin set, not a child. World admission requires that exact live proposal, ordered parents, current revision, enabled adults without rest, each energy≥50, and geometry/capacity/deadline checks. It consumes the proposal once, charges 30 each, inserts one disabled energy 40 nursery child for 200 ticks, and increments world revision once. Pending parents can recover energy during cooldown before half-open proposal expiry. A consumed proposal cannot birth again under another key. Withdrawal, retirement and annotation invalidate affected links; re-enabling does not revive them. Inspecting or sampling a pose never advances time.

## Interpretation, lineage and identity

`annotate({artifactId,intent})` independently compiles the supplied interpretation and requires exact source-task graph agreement. It attaches only absent or identical companion metadata; conflicting existing metadata refuses. Matching world residents receive new intent pins/epochs and affected pairs/proposals are cancelled in one staged transition. Source-only recovery does not invent thought, units or author history. First companion attachment through any storing operation, including compile of a recovered source, stages the same world pin/epoch invalidation before committing artifact metadata. A compound world birth that also enriches metadata still increments world revision exactly once.

`lineage({artifactId?,cursor?,limit?})` reads flat admitted derivations in append order. Limit is 1..32, default 16; cursor is a session-local numeric append index. Known artifacts with no derivations return an empty page; unknown artifacts throw. Continue using returned `nextCursor` with the same intended artifact filter. It is not a recursive ancestor query or an A2A task-list cursor.

Artifact `ql_...` identifies exact canonical constructor source; `qc_...` identifies deterministic construction; `qd_...` binds derivation including social origin; `qw_...` identifies normalized world configuration; resident `wr_...` is scoped by world. Candidate/source generation excludes social origin, so distinct admitted derivations may share source identity. Source `design.heredity` parent hashes are assertions. Session lineage retains construction/policies/origin/seam evidence; verified replay requires exact parent source and companions. Recovering a child source in a new Runtime preserves executable source and heredity assertions but does not restore omitted companion metadata, session lineage or run records.

## Limits, transaction scope and errors

| Resource | Bound |
| --- | --- |
| Canonical source | 65536 UTF-8 bytes. |
| Candidate / derivation | 2 MiB / 32 KiB, at most 64 node origins. |
| Artifacts | Default 128; aggregate 32 MiB including genomes/companions. |
| Execution records | Default 256; birth admission needs no execution-record slot. |
| World | One, snapshot ≤1 MiB; 32 residents, nursery 8, pairs 16, proposals 16. |
| Informational events / command receipts | Rings/windows 256. Events are not admission evidence. |
| Admission receipts / derivations | 128 each, no eviction; derivation aggregate ≤4 MiB. |
| Admission acknowledgement | ≤4 KiB. |
| Tick/revision/sequence/epoch | Stop at 1e6; required new deadlines must fit. |
| MCP handler request/result | 4 MiB / 8 MiB. |
| A2A HTTP body / task | Default 2 MiB / 16 MiB; default task history store 128 tasks/64 MiB. |

Admission prepares validation, source/companion conflicts, capacities, geometry, both charges, lineage and acknowledgement serialization before a synchronous store swap. Rejection preserves authoritative state. This is atomic within one Runtime session; it is not crash-durable or a cross-process transaction. Process restart loses worlds, receipts and lineage. Export source/genomes and save acknowledgements externally when needed.

Cancellation before dispatch prevents work. Synchronous evaluation or commit runs to completion; cancellation/disconnection cannot roll it back. Adapter response serialization or storage can fail after a Runtime mutation committed, so a failed transport result does not prove nonadmission or nonexecution. Retry keyed admissions and commands with the original complete payload; `run` and `reproduce` always request fresh execution.

`QuinelingError` exposes `code`, `message`, `path` and `toJSON()`. Codes include `invalid-input`, `invalid-intent`, `source-budget`, `invalid-source`, `unknown-artifact`, `unknown-record`, `stale-record`, `resource-limit`, `execution-failed`, `cancelled`, `metadata-conflict`, `invalid-offspring`, `stale-state`, and `unknown-world`. Some pure-world sequence/conflict/ineligibility errors currently wrap as `invalid-offspring`; use message/context and inspect a fresh snapshot instead of assuming every concurrency refusal is `stale-state`. MCP uses `isError` and `{error:{code,message,path}}`; A2A Runtime errors appear in task-status message metadata as `quinelingError`. A semantic preview refusal is a successful structured result with `status:'rejected'`. Null target, command, affinity, cursor or limit is malformed; omit optional fields rather than supplying null.

## Experimental mathematical bodies

The `/experimental` entry point is on `@quinelings/agent-sdk`, not a second package name. The frozen SDK 1.0.0 archive and its existing `Runtime` and QDL 1 admission rules remain unchanged. The capsule retains an admitted task source and a complete source-authored mathematical body. Use `VisualCapsule.author`, `admit`, `verify`, `recover`, `execute`, and `MathematicalLifeforms.compile`, `frame`, `anchor`, `portraitFrame` through that entry point.

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
const creature = VisualCapsule.author(admitted.source, 42);
const proof = VisualCapsule.verify(creature); // no task evaluation
const copy = VisualCapsule.recover(creature, 'colors');
const body = MathematicalLifeforms.compile(copy.design.woven, copy.task);
const pose = MathematicalLifeforms.frame(body, 0, {budget: 2048, crests: false});
const run = VisualCapsule.execute(copy.program, {bindings: {readings: [2, 3, 4]}});
if ('taskProfile' in run && run.taskProfile === 'qdl-v1') {
  console.log(run.occurrences[0]?.outputs); // [9]
}
```

For literal legacy tasks, omit bindings; the discriminated result has
`taskProfile: 'legacy'` and `tasks`. Bound QDL 1 tasks have `taskProfile:
'qdl-v1'`, `occurrences` and retained bindings. Both emit the capsule's exact
full source. `constructionOnly: true` is passive and refuses bindings.

The legacy `quinelings-mcp` and `quinelings-a2a` CLIs accept `--experimental-visual` once. The stable v1 CLIs do not.
Programmatic callers opt in with `createQuinelingMcpServer(runtime,
{experimentalVisual: true})` or `createA2AApp({experimentalVisual: true})`.
This adds eight MCP tools: `quineling_visual_author`, `_admit`, `_recover`,
`_frame`, `_anchor`, `_bounds`, `_verify`, `_run`. A2A uses corresponding
operations `visualAuthor`, `visualAdmit`, `visualRecover`, `visualFrame`,
`visualAnchor`, `visualBounds`, `visualVerify`, `visualRun` in a JSON data part.
The original operations keep their existing source formats.

Author accepts `taskSource` and optional uint32 `seed`. Other operations accept
canonical capsule `source`. Recover adds `encoding: 'harmonics' | 'colors'`;
frame adds finite `phase`, optional `budget` (128–12000) and boolean `crests`
(default false); anchor adds `nodeId` and phase. Run accepts explicit bindings
or constructor-only mode. Author, admission, sampling, inspection, verification
and recovery do not evaluate tasks. `visualRun` is the execution operation;
actions remain local simulated receipts. Frame JSON includes point coordinates
and per-sample operation owners. A source identifies the experimental body;
phase is view state.
