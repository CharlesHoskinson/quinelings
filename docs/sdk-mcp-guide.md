# Quinelings MCP guide

The experimental `@quinelings/agent-sdk` exposes bounded thought compilation, authored anatomy, explicit simulated execution, source recovery, and numeric animation frames through MCP. QDL remains experimental; the package revision does not freeze the language. The adapter uses a process-local Runtime with artifact and execution-record stores, one ranch world, session lineage and admission receipts. Restarting it discards those stores. Only explicit `run` and `reproduce` execute tasks; offspring admission and social time do not.

## Start the local adapter

From the checkout, install and build the SDK:

```bash
cd packages/agent-sdk
npm ci
npm run build
node dist/mcp-cli.js
```

The CLI is an MCP stdio process. Start it through an MCP client; it is not an interactive terminal program. Configure the client with the Node executable and an absolute path to `packages/agent-sdk/dist/mcp-cli.js`. The package also declares a `quinelings-mcp` binary. No registry publication or deployment is implied by building locally.

The exported `createQuinelingMcpServer(runtime = new Runtime())` factory is intended for applications that own the SDK transport and runtime lifecycle. Import it from `@quinelings/agent-sdk/mcp`. The CLI supplies the stdio transport. Stdout carries protocol messages; diagnostics belong on stderr. [MCP stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

`@quinelings/agent-sdk/schema` exports `JsonSchema`, `IntentTypeSchema`, `IntentStepSchema`, and `IntentSchema`, plus `TraitsSchema`, `ParentPinSchema`, `OffspringRecipeSchema`, `OffspringOriginSchema`, `OffspringInputSchema`, `FrameOptionsSchema`, `OffspringFrameSchema`, `OffspringTargetSchema`, `AdmissionSchema`, `LineageSchema`, `AnnotationSchema`, `WorldConfigSchema`, `WorldActionSchema`, and `WorldCommandSchema`. These recursive Zod schemas expose nested types, units, ordered input counts, and closed operation parameters in `tools/list`. Applications can validate proposal structure with `IntentSchema.parse(proposal)`. Schema parsing does not execute kernels. `JsonSchema` rejects nonfinite numbers, arrays or records with more than 512 entries, and values nested beyond 24 levels. `IntentSchema` also checks the depth of the complete intent envelope; wrapping a value adds levels. `tools/list` exposes recursive type references and the record/array size limits; depth is enforced by a Zod refinement and the compiler. `Runtime.compile` additionally checks references, acyclicity, units, operation refinements, the combined node count, and source budgets.

## Tool catalog

| Tool | Arguments | Purpose |
| --- | --- | --- |
| `quineling_parse` | `{thought}` | Return supported intent or explicit clarification, unsupported, or inconsistent status. |
| `quineling_compile` | `{intent, options?}` | Compile an explicit typed intent into a stored artifact. |
| `quineling_create` | `{thought, options?}` | Parse a bounded recipe and build it when supported. |
| `quineling_inspect` | `{artifactId}` | Read a stored artifact and its companion information. |
| `quineling_run` | `{artifactId}` | Execute the stored source and add a fresh record. |
| `quineling_reproduce` | `{artifactId, recordId}` | Verify the parent's emitted source, reconstruct a child, and execute it. |
| `quineling_recover` | Exactly one of `{source}`, `{harmonics}`, `{colors}` | Recover and store source from one exact representation. |
| `quineling_frame` | `{artifactId, phase, options?}` | Obtain deterministic numeric tissue, normals, ownership, and ridges. |
| `quineling_offspring_preview` | `{input}` | Stateless candidate preparation, ready/rejected diagnostics. |
| `quineling_offspring_frame` | `{input,candidateId,childSourceHash,phase,options?}` | Rebuild and sample the exact candidate, without storage. |
| `quineling_offspring_admit` | `{input,candidateId,childSourceHash,target,requestId}` | Explicit atomic source/lineage admission; world birth charges both parents once. |
| `quineling_lineage` | `{artifactId?,cursor?,limit?}` | Read flat session derivations. |
| `quineling_annotate` | `{artifactId,intent}` | Attach absent/identical exact graph-matching companion metadata. |
| `quineling_world_create` | `{worldKey,seed,affinity?}` | Create one bounded world; identical configuration is idempotent. |
| `quineling_world_inspect` | `{worldId}` | Detached world snapshot, no tick or execution. |
| `quineling_world_command` | `{worldId,expectedRevision,sequence,command}` | Explicit import/retire/participate/invite/cancelProposal/advance mutation. |

`options` on create/compile accepts `seed` and `repeats`. The seed is an unsigned 32-bit integer; repeats is 1–8 and defaults to 1. An omitted seed is derived deterministically from the graph. Frame options are `budget` (4,000–24,000, default 12,000) and `crests` (2–4, default 3), both integers. MCP `phase` is a finite raw phase value within ±1,000,000, not wall-clock time. Use `tools/list` to inspect all sixteen running tools. The offspring-frame phase bound is ±1e9; the existing frame tool retains ±1e6. Every root request and operation record is closed; unknown nested fields reject rather than being silently dropped. Complete offspring/command shapes are in the [API reference](sdk-api.md).

Tool annotations follow the actual adapter:

| Tools | `readOnlyHint` | `idempotentHint` | `destructiveHint` |
| --- | --- | --- | --- |
| parse, inspect, frame, offspring_preview, offspring_frame, lineage, world_inspect | true | true | false |
| compile, create, recover, offspring_admit, annotate, world_create | false | true | false |
| run, reproduce | false | false | false |
| world_command | false | true | true |

Names in this annotation table omit the `quineling_` prefix. Every tool has `openWorldHint:false`. `world_command` is destructive because its union can retire residents or cancel proposals. Its idempotency depends on retaining the exact sequence and complete payload; admission idempotency depends on the original requestId/payload. An annotation does not authorize an external action or guarantee permanent receipt retention.

## Build, inspect, then execute

The following are `tools/call` parameter objects; the MCP client supplies initialization and JSON-RPC request IDs.

```json
{
  "name": "quineling_create",
  "arguments": {
    "thought": "[2,3,4] | square | sum | report total",
    "options": {"seed": 17, "repeats": 1}
  }
}
```

A supported creation supplies an artifact containing canonical `source`, `program`, `graph`, authored `design`, harmonic and color genomes, and available companion intent/contract/source mappings. Use the returned artifact's `id` as `artifactId`; do not generate an ID from its title.

```json
{"name":"quineling_inspect","arguments":{"artifactId":"<returned artifact.id>"}}
```

Creation validates and stores the artifact. It does not execute the task. Execute deliberately:

```json
{"name":"quineling_run","arguments":{"artifactId":"<returned artifact.id>"}}
```

The execution record contains an `id`, `artifactId`, exact `source`, and `result`. For this one-cycle example, `result.tasks[0].output` is `[{"total":29}]`. `result.emitted` contains the exact canonical source. A second run creates another record even if its source and outputs are identical.

To verify and run a fresh child from that record:

```json
{
  "name":"quineling_reproduce",
  "arguments":{
    "artifactId":"<returned artifact.id>",
    "recordId":"<returned execution record.id>"
  }
}
```

Reproduction returns `{artifact,record}`. An exact quine's child retains its source identity; the child execution is fresh and its record names `parentRecordId`. Supplying a record for another source fails. Reproduction includes execution, so call it only when a fresh simulated task cycle is intended.

## Interpretation results and errors

Results use `structuredContent.result`; a JSON text block mirrors the same envelope for clients that consume text. MCP structured results are server data rather than model-generated schema-constrained text. [MCP tool results](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

Parse statuses have distinct meanings:

| Status | Client behavior |
| --- | --- |
| `supported` | Inspect the proposed intent and assumptions; compile or create explicitly. |
| `clarify` | Request the missing data or a complete supported recipe. |
| `unsupported` | Explain the named capability obligation; no artifact exists. |
| `inconsistent` | Correct the supplied plan/data using diagnostics. |

These statuses are interpretation results. They must not be mistaken for successful task execution. Parse diagnostics include `code`, `path`, and `message`. Domain failures such as invalid compilation, missing artifact IDs, or corrupted genomes use `isError: true` and `structuredContent.error`, mirrored as JSON text:

```json
{"error":{"code":"unknown-artifact","path":"$","message":"Artifact is not in this runtime"}}
```

MCP argument-schema failures usually happen before the tool handler and may have SDK-generated text without this structured envelope. If the handler’s own defensive schema check rejects an input, it returns structured `invalid-input` with the first issue’s path. Runtime domain errors preserve their original `code`, `path`, and `message`. Unknown tools and malformed protocol requests can produce protocol errors. Check `isError`, structured error data, text, and protocol failures; do not retry an unchanged invalid request indefinitely.

For example, `"make my city happy"` needs clarification, `"monitor continuously and send email"` is unsupported, and `"[] | mean"` is inconsistent. The adapter does not invent supplied data or quietly substitute another task.

## Recovery and animation

MCP recovery arguments contain exactly one representation. The advertised object schema includes `oneOf` alternatives requiring `source`, `harmonics`, or `colors`; the SDK and handler both reject missing or multiple encodings. Use actual artifact fields:

```json
{"name":"quineling_recover","arguments":{"source":"<artifact.source>"}}
```

Alternatively send `{"harmonics": <artifact.harmonics>}` or `{"colors": <artifact.colors>}` as the arguments. The SDK's generic `dispatch` API nests these inside `recovery`; the MCP tool uses the three fields directly. Byte encodings recover executable source and authored design. They do not recover original English, types, units, or external notes that were stored only as companion information. Source checksums detect encoding corruption; semantic validation remains necessary.

```json
{
  "name":"quineling_frame",
  "arguments":{
    "artifactId":"<returned artifact.id>",
    "phase":0.5,
    "options":{"budget":4000,"crests":2}
  }
}
```

Frames contain numeric arrays, not images: `points`, `normals`, `owners`, `ridges`, and `nodeIds`. The same authored source, phase, and options produce the same geometry. Frame seeking does not run the task, create an execution record, or change source identity. Renderers should treat owner indices as references into `nodeIds`. Start with a modest sample budget because JSON geometry can be large.


## Offspring and ranch tool calls

These are exact `tools/call` parameter objects using actual parent/proposal data. Recipes are compose `{kind:'compose',donorOutput,recipientInput}`, mate `{kind:'mate',donorNode,replaceNode}`, merge `{kind:'merge'}`, or body `{kind:'body',base:0|1}`. Parent roles are ordered; each `intentHash` is the project's canonical complete companion SHA256, or null only when the companion is absent. Nonce is uint32. Mutation is none/gentle; optional overrides require all six integer traits in −1000..1000 and mutation none. See the [ranch guide](SDK-RANCH-GUIDE.md) for executable typed parents and the canonical pin helper.

```js
// input is the complete manual OffspringInput built from your actual parents.
const prepared = await client.callTool({
  name:'quineling_offspring_preview',arguments:{input}
});
if (prepared.isError) throw new Error(JSON.stringify(prepared));
const preview = prepared.structuredContent.result;
if (preview.status !== 'ready') throw new Error(JSON.stringify(preview.diagnostics));
const c = preview.candidate;
const frame = await client.callTool({name:'quineling_offspring_frame',arguments:{
  input,candidateId:c.candidateId,childSourceHash:c.childSourceHash,
  phase:0,options:{budget:4000,crests:2}
}});
const admission = {input,candidateId:c.candidateId,childSourceHash:c.childSourceHash,
  target:{kind:'library'},requestId:'mcp-manual-birth-1'};
const receipt = await client.callTool({name:'quineling_offspring_admit',arguments:admission});
// If the response was lost, resend this exact admission object and key.
const retry = await client.callTool({name:'quineling_offspring_admit',arguments:admission});
```

Preview and frame create neither stored offspring, execution records nor lineage. Frame and admission rebuild the candidate from complete input; preserve candidateId and exact childSourceHash. A ready candidate is not an admission token. The explicit admission receipt identifies the stored child, its derivation and any acknowledged world placement. To execute the child, separately call `quineling_run` with the successful receipt's `structuredContent.result.artifactId`.

```json
{"name":"quineling_world_create","arguments":{"worldKey":"garden","seed":23,"affinity":"neutral"}}
```

This creates an empty world; imported adults start energy 60 and participation disabled. Neutral affinity uses distance only, while default structural affinity also scores bounded operation-role overlap, gesture and source diversity. Neither tests typed offspring compatibility. Same normalized configuration returns the existing snapshot; different configuration refuses within one Runtime.

```js
const inspected = await client.callTool({name:'quineling_world_inspect',arguments:{worldId}});
if (inspected.isError) throw new Error(JSON.stringify(inspected));
const snapshot = inspected.structuredContent.result;
const commandRequest = {worldId,expectedRevision:snapshot.revision,
  sequence:snapshot.nextSequence,command:{kind:'import',artifactId}};
const imported = await client.callTool({name:'quineling_world_command',arguments:commandRequest});
// A retry preserves old revision, sequence and the complete command payload.
const sameImport = await client.callTool({name:'quineling_world_command',arguments:commandRequest});
```

Command union alternatives are import `{kind:'import',artifactId}`, retire `{kind:'retire',residentId}`, participate `{kind:'participate',residentId,enabled}`, invite `{kind:'invite',residentId,partnerId}`, cancelProposal `{kind:'cancelProposal',proposalId}`, and advance `{kind:'advance',ticks:1|2|3|4}`. Inspect a fresh snapshot before each new command; use its revision and exact nextSequence. Multi-tick success increments revision once. Matching retained replay makes no change; stale-discarded/gap/conflicting sequences refuse. Annotation and birth can change revision without using a command sequence.

Reciprocal invitations may create a pair and later a proposal; neither births or executes anything. A world admission uses proposal-ordered `parents`, pairing origin `{kind:'pairing',worldId,proposalId,parentResidents,epochs}`, and target `{kind:'world',worldId,expectedRevision}`. Both parent source/intent/epoch pins, participation, adulthood, rest, energy≥50, expiry and geometry must still agree. Successful admission consumes once, charges 30 each, inserts a disabled energy 40 nursery child for 200 ticks, and increments revision once. Pending parents can recover during cooldown. A consumed proposal cannot admit another child using a new request key.

```json
{"name":"quineling_lineage","arguments":{"artifactId":"<receipt artifactId>","limit":16}}
```

Lineage pages are flat append-order session evidence, limit 1..32 (default 16), with an optional numeric nextCursor. Known artifacts without derivations return an empty page. Source heredity hashes assert parents; they do not authenticate ancestry or restore session evidence on recovery. To explicitly attach a supplied interpretation, call `quineling_annotate` with `{artifactId,intent}`. Exact source-task graph matching is required; conflicting existing metadata refuses. World pins/epochs and affected pair/proposal links invalidate atomically when metadata is first attached. This also applies when compile first supplies a companion for recovered source; artifact and world invalidation stage together. Compound birth with metadata enrichment remains one public world revision.

## Identity, limits, and effects

Artifact IDs identify SHA-256 canonical source. Thought, units, and provenance are companion evidence and need separate interpretation: two companion documents may describe the same executable source. A stored artifact keeps its first companion metadata. Compiling different intent for an existing source with companion intent returns `metadata-conflict`; use separate runtime sessions to preserve both interpretations. Recovering into a fresh runtime supplies no companion intent. Source equality proves exact program identity within this runtime, not fidelity to arbitrary English or a frozen cross-version semantics contract. An artifact's available `contract.sourceBytes` measures its complete canonical source in UTF-8 bytes, including authored anatomy.

The default runtime stores at most 128 artifacts and 256 execution records. A full store rejects new entries rather than evicting existing evidence. The framework additionally bounds graph nodes, task repeats, anatomy, finite JSON, and the complete canonical source to 65,536 bytes. MCP handlers check parsed request JSON against 4 MiB and each success result envelope against 8 MiB; these are handler limits rather than transport-wide preparse limits. Artifact aggregate storage is additionally capped at 32 MiB including companions/genomes. Ranch caps are one world, 32 residents/nursery 8/pairs 16/proposals 16 and 1 MiB snapshot; candidates 2 MiB, derivations 32 KiB each/128 entries/4 MiB aggregate, successful admission receipts 128 without eviction, world receipts 256, event ring 256, acknowledgements 4 KiB, and counters 1e6 without wrapping. Full ledgers refuse new admission. Export source/genomes when the client needs recovery across process restarts; source-only export does not preserve session lineage or receipts.

The handler checks the MCP request’s cancellation signal before dispatch. A request already cancelled at that point returns a `cancelled` error when the transport still accepts a response, and performs no compilation, admission, or execution. The MCP SDK may discard a cancelled request’s response entirely. Once synchronous evaluation or admission commit starts, it runs to completion; cancellation cannot interrupt or roll it back midway.

The response-size check follows the runtime call. An oversized response can therefore fail after a run has created a record; an error or timeout does not establish nonexecution. Repeating `run` or `reproduce` requests another fresh simulated execution. An admission or command response can also fail after its mutation committed. Retry with the original complete requestId/payload or sequence/payload, including the old expected revision. Refreshing revision or choosing a new key is a new operation. Retained admission replay is checked before stale world freshness; world command acknowledgements older than their 256-entry window refuse instead of re-executing. Synchronous store swaps are in-memory atomicity, not crash durability or cross-process serialization.

All `action` results are local simulation receipts. Their names and `allowed` parameters do not authorize email, filesystem changes, network calls, purchases, or deployment. MCP hints describe actual store effects, including the ranch operations and destructive world-command union listed above. Clients should treat annotations as advisory. [Official tool annotations](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.ts).

## Validation

Run package verification from `packages/agent-sdk`:

```bash
npm run typecheck
npm test
npm run build
```

Ranch payloads were exercised against the actual SDK source on 2026-10-04 with the official MCP client over linked in-memory transports: all eight ranch tools, discovery of sixteen tools and destructive world-command annotation, candidate frame budget 4000, exact admission/command retries, lineage, identical annotation, and a separately requested composed child run with handwritten output `{allocated:12,remaining:8}` passed. These are adapter payload checks, not browser or remote-service evidence.
