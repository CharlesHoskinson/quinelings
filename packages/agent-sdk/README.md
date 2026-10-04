# Quinelings Agent SDK

A TypeScript interface for bounded thought programs, source-authored mathematical bodies and constructor quines. The SDK and QDL are experimental; current package and source markers do not freeze the language.

```ts
import { Runtime } from '@quinelings/agent-sdk';
const runtime = new Runtime();
const created = runtime.create('[2,3,4] | square | sum | report total');
if (created.status === 'supported') {
  const record = runtime.run(created.artifact.id);
  console.log(record.result.tasks[0]?.output); // [{ total: 29 }]
  const child = runtime.reproduce(created.artifact.id, record.id);
  console.log(child.artifact.source === created.artifact.source); // true
}
```

`create`, `compile`, `inspect`, `recover` and `frame` do not execute tasks. `run` and `reproduce` explicitly execute; all current effects are local simulations. A `ProposalProvider` can propose typed data for broader English goals; every supported proposal is checked by the same compiler. Aborting a pending proposal rejects with `cancelled` even if its provider ignores the signal; late completion admits no artifact. Providers must still cancel their own I/O or remote work. No model credential or model client is bundled.

Exports:

- `@quinelings/agent-sdk`: `Runtime`, `QuinelingError`, typed intent/requests/results, recipes.
- `@quinelings/agent-sdk/schema`: strict recursive JSON and intent Zod schemas.
- `@quinelings/agent-sdk/mcp`: `createQuinelingMcpServer` and stdio CLI `quinelings-mcp`.
- `@quinelings/agent-sdk/a2a`: `createA2AApp`, `BoundedTaskStore`, `QuinelingExecutor` and CLI `quinelings-a2a`.

Node.js 22+; ESM and TypeScript declarations. `npm ci && npm run build && npm run typecheck && npm test` in this package builds and verifies the checkout. Then run `node examples/basic.mjs` for an asserted total-29 calculation and source-matching copy. Install a built directory or the downloadable tarball; this package has not been published to npm.

Start MCP with `node dist/mcp-cli.js`. Start the loopback A2A server with `node dist/a2a-cli.js`; discovery is `http://127.0.0.1:8049/.well-known/agent-card.json`. The adapter uses official MCP and A2A SDKs. Public/multi-user hosting requires the embedder's authentication and per-session runtime isolation.

Artifact IDs hash complete canonical source. Execution IDs identify individual runs. Returned data are detached snapshots. Typed interpretation metadata is a companion to the quine; persist complete artifacts when it matters. Genome recovery in a fresh runtime has no companion metadata. A matching `compile` or supported `create` can explicitly attach the first companion to the recovered source while retaining its ID. Re-admitting the same intent keeps the first companion and source map; a different intent for identical source throws `metadata-conflict` without overwriting it. Regenerating the same source requires matching compiler behavior, seed and repeat choices. Intent equality uses canonical JSON, not semantic normalization: equivalent unit spellings and omitted versus empty assumptions can still conflict. Formatting a source export is allowed: recovery canonicalizes JSON and validates the constructor.

`frame` takes phase in radians, with a `2π` gesture cycle and a direct-runtime bound of `|phase| ≤ 1e9`. Returned `points` groups are `[x,y,z,alpha]`, normals are `[nx,ny,nz]`, and each sample owner indexes parallel `nodeIds`, `nodeRoles` and `nodeColors` arrays. Role colors honor source strength and neutral ink. The SDK frame has no recorded scalar-lens selector and does not report a measured result.

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

MCP discovers all 16 `quineling_*` tools: the original parse/compile/create/inspect/run/reproduce/recover/frame and offspring_preview/offspring_frame/offspring_admit/lineage/annotate/world_create/world_inspect/world_command. Its strict schemas expose actual nested recipe/type fields, read-only/mutation annotations and structured `{code,message,path}` errors; successful results use `{result}`. A2A advertises `build`, `ranch` and `execute` skills and accepts the same structured operation union. A single user text part still means passive create; ranch requests use a single JSON data part and retain `{operation,result}` artifact envelopes. A2A task/message IDs do not replace admission/sequence keys. Cancellation can win before dispatch; synchronous evaluation/commit cannot be interrupted midway. No stable language version or full JS/compiler/SHA/formal/browser/performance proof is claimed.

Guides and visual workspace: https://charleshoskinson.github.io/quinelings/sdk.html
Source and tests: https://github.com/CharlesHoskinson/quinelings/tree/main/packages/agent-sdk
