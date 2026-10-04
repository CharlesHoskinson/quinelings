# Agent SDK 1.0.0 — QDL 1

Quinelings / Living Thoughts exposes stable QDL 1 through SDK 1.0.0 explicit v1 entry points. The frozen registry is `43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3`. The supported scope is bounded deterministic simulation in one owner’s local memory Session on Node 22/26, with Chromium conformance for the browser runtime. Default/legacy APIs and ranch policies remain experimental. The SDK has not been published to npm; build locally or install the retained release tarball under `releases/qdl-v1.0.0`.

The interpreter is deterministic and simulation-only. Its complete public declaration, typed graph, policy and body live in source; each explicit Run supplies a separate typed snapshot. Source-only verification, recovery and body sampling do not execute tasks. [QDL-V1](QDL-V1.md) defines language, identity, units, errors and compatibility; [QDL-V1-LIBRARY](QDL-V1-LIBRARY.md) describes ten reusable recipes.

## Build and run locally

The package declares Node ≥22; release acceptance exercised Node v22.23.3 and v26.10.0. From this repository:

```sh
cd packages/agent-sdk
npm ci
npm run build
node examples/v1.mjs
```

The [working example](../packages/agent-sdk/examples/v1.mjs) imports only `../dist/v1.js` for SDK capabilities. It uses two runtime ports: a liter-reading array and an explicitly supplied reserve quantity. The independent snapshots are:

```text
readings [2,3], reserve 4 → [9]
readings [4,5], reserve 2 → [11]
```

Both runs preserve exact source/hash/emission, while their input digests differ. The example checks source-only verification, exact keyed replay, conflict refusal, fresh reproduction, both exact genomes, passive snapshot restoration and the asserted-versus-retained evidence labels. It requires no provider token, sensor connection or world dispatch.

Once installed from a local tarball, the public import is:

```js
import {Session, sourceOnly, QdlError} from '@quinelings/agent-sdk/v1';
```

Do not substitute the legacy `@quinelings/agent-sdk` entry point: its separate experimental Runtime and literal-override semantics are not the v1 port contract. The stable explicit entry points are `/v1`, `/v1-schema`, `/v1-mcp`, `/v1-a2a` and `/v1-migrate`. `/v1-ranch` exposes experimental construction/collaboration policies; any resulting executable still requires stable QDL 1 admission.

## Session API

`new Session(options?)` creates one bounded memory session. Optional limits are maxArtifacts, maxRecords, maxRecordBytes and maxRecordsBytes; they can lower configured capacity within the implementation's caps. `describe()` returns the pinned registry/digest, simulation-only effects, memory persistence and current limits.

| Method | Input | Result / evaluation |
| --- | --- | --- |
| compile | typed intent | Stored detached Artifact; no task evaluation |
| inspect | artifactId | Detached Artifact; passive |
| verify | artifactId | Constructor Verification; no runtime inputs required |
| recover | exactly `{source}`, `{harmonics}` or `{colors}` | Validated/stored Artifact; passive |
| frame | artifactId, phase, options? | Detached source body sample; passive |
| run | `{artifactId,requestId,inputs}` | Retained ExecutionRecord; explicit task evaluation |
| reproduce | `{artifactId,recordId,requestId}` | Fresh evaluation using retained parent bindings |
| exportSnapshot | none | Explicit bounded snapshot data; no filesystem write |
| Session.fromSnapshot | snapshot, options? | Passive restoration into a new memory session |

An Artifact contains id/sourceHash, canonical source, program, payload, exact ports, evaluation order and both genomes. IDs are `ql_` plus the SHA-256 source digest. An ExecutionRecord contains id, artifactId, requestId, result, evidence and optional parentRecordId. Its result has the input digest, bindings, completed/failed status, ordered occurrence outputs/traces/effects, diagnostic and exact emitted source.

`dispatch(request)` accepts a closed `{operation,...fields}` request. `exchange(request)` returns `{operation,result}`. `sourceOnly.verifyQuine(sourceOrProgram)` and `sourceOnly.encode(sourceOrProgram)` work without a stored artifact or runtime bindings. The former checks constructor emission; the latter returns exact harmonic/RGB genomes. Reproduction instead makes a fresh explicit task invocation and checks its semantic result against the parent. It does not refresh observations automatically.

Inputs must exactly name the source's ports. Missing input, extra fields, incorrect types/refinements or malformed data refuse; incompatible symbolic source units refuse at compilation/admission. Supplied numeric magnitudes carry the port’s declared unit, whose factual correctness remains a caller obligation; optional values require explicit null. Changing only the supplied snapshot never rewrites literals or source. Each new desired invocation needs a new requestId. Repeating an identical complete run/reproduce request with its original key returns the retained record; changed payload under that key is request-conflict. The key is separate from transport message/RPC/task IDs.

Defaults are 128 artifacts and 256 execution records. Aggregate caps are 32 MiB artifacts, 64 MiB records, 32 MiB request receipts and 128 MiB snapshots; individual execution records are capped at 2 MiB. Keys are not evicted or reopened. New-key capacity refusal leaves retained records available for exact replay. The interpreter's separate source/value/depth/collection/2 MiB semantic-run limits also apply; SDK record wrapping consumes additional bytes. No API here supplies durable storage or real effect authority. Snapshot export and import share a plain-header/dense-row validation boundary. Each row retains the depth-64 and four-million-visit inert-data checks. Source/receipt rows are bounded at 131,328 bytes, execution rows at 2 MiB, with maximum row counts 1,024/4,096/4,096 and serialized aggregate budgets 32/64/32 MiB respectively; the complete snapshot is bounded at 128 MiB. This allows a valid full-capacity session to restore passively without applying one request’s structural ceiling to its entire history. Accessors, hidden fields, sparse arrays and cycles refuse before schema reads.

Frames require source assembly anatomy and gesture. Phase must be finite within ±1e9; options are `{budget?:4000..24000,crests?:2..4}` with integer values. Sampling returns points, normals, owners, ridges and node identity/color/role metadata. It neither advances a task clock nor creates a run record. A valid family-only source can verify/recover/run while frame refuses unsupported-frame.

## Shared schemas and errors

The package exports strict recursive `IntentSchema`, `ValueTypeSchema`, `ThoughtSchema`, `RequestSchema`, `ArtifactSchema`, `RunSchema`, `ExecutionRecordSchema`, `RecoverySchema`, `SnapshotSchema`, `FrameSchema`, `ResultSchemas`, `TaggedResponseSchema` and operation-specific input schemas. `/v1-schema` provides the same contracts for clients/adapters. Schema parsing handles closed wire shapes; the shared interpreter additionally checks references, units, structural result types, registry pins and effects. Passing a wire schema alone does not establish graph admissibility or factual truth.

Malformed requests and missing bindings throw `QdlError` with code/path/message. Codes include invalid-input, missing-input, type, refinement, unsupported-registry, identity, unknown-artifact, unknown-record, request-conflict, stale-record, unsupported-frame and resource-limit. Code/path carry the decision; message is explanatory. Structured decisions are frozen with this profile; match the relevant code and checking layer rather than explanatory message text. A changed diagnostic contract requires an explicit reviewed registry/version transition.

A valid invocation can return `record.result.status:"failed"`. That computed failure is a successfully delivered result with completed-node trace and bounded diagnostic; its failed occurrence publishes no outputs/effects and later occurrences stop. Earlier successful occurrences remain. Source-only constructor reproduction still succeeds independently of task failure. Do not convert a failed/missing/stale value to zero or evidence unknown.

## MCP: eight explicit tools

Launch the local stdio server:

```sh
node packages/agent-sdk/dist/v1-mcp-cli.js
```

Configure an MCP host with command `node` and the absolute path to that CLI as its argument. Stdio stdout is reserved for protocol traffic. A programmatic host imports `createV1McpServer` from `@quinelings/agent-sdk/v1-mcp` and connects an MCP transport; an optional Session can be supplied.

The exact tools and arguments are:

| Tool | Arguments |
| --- | --- |
| quineling_v1_describe | `{}` |
| quineling_v1_compile | `{intent}` |
| quineling_v1_inspect | `{artifactId}` |
| quineling_v1_verify | `{artifactId}` |
| quineling_v1_recover | `{recovery:{source}}` OR `{recovery:{harmonics}}` OR `{recovery:{colors}}` |
| quineling_v1_frame | `{artifactId,phase,options?}` |
| quineling_v1_run | `{artifactId,requestId,inputs}` |
| quineling_v1_reproduce | `{artifactId,recordId,requestId}` |

Recovery requires the nested `recovery` wrapper and exactly one recovery field. `{source:...}` directly as tool arguments is invalid. Every tool publishes an input schema and a successful output schema requiring exactly `{result}`. On success, `structuredContent.result` is the operation's typed result, and the text content is its serialized `{result}` wrapper. A computed-failed run remains a successful tool response containing its failed execution record.

Caught adapter errors have `isError:true`, text content and `structuredContent:{error:{code,path,message}}`. Framework-level malformed protocol/tool-schema refusals can instead provide plain error content without structuredContent; clients must handle that separately. Describe/inspect/verify/frame advertise read-only; all tools advertise idempotent, non-destructive and no open-world action. Run idempotency depends on the exact key/payload contract, not a promise that different request IDs collapse.

The adapter checks 4 MiB request JSON and 8 MiB serialized successful `{result}` content. That latter count is not a universal full JSON-RPC wire cap: MCP also carries text and structured copies. Session record/schema/serialization limits precede its in-memory commit. A response/schema/publication failure after dispatch can still leave a committed keyed run; retry the complete original request and key rather than inventing a new key. Cancellation is checked before synchronous dispatch; once bounded evaluation/commit starts, mid-node interruption or rollback is not provided.

## A2A: explicit JSON requests

The CLI binds **127.0.0.1:8050** by default:

```sh
node packages/agent-sdk/dist/v1-a2a-cli.js
```

`QUINELING_V1_A2A_PORT` changes the integer port. The card is `http://127.0.0.1:8050/.well-known/agent-card.json`; JSON-RPC is `/a2a/jsonrpc`, native REST `/a2a/rest`. A programmatic host imports `createV1A2AApp` from `/v1-a2a`; options are baseUrl, legacyCompat, taskStore and requestLimitBytes. The supplied baseUrl must be an HTTP(S) origin without credentials, path, query or fragment. It describes advertised interfaces and does not itself choose the listening host.

A2A 1.0 JSON-RPC example, with `Content-Type: application/json` and `A2A-Version: 1.0`:

```json
{
  "jsonrpc":"2.0", "id":"rpc-describe", "method":"SendMessage",
  "params":{"message":{
    "messageId":"message-describe", "role":"ROLE_USER",
    "parts":[{"data":{"operation":"describe"},"mediaType":"application/json"}]
  }}
}
```

Run uses the same one-data-part message with data `{operation:"run",artifactId,requestId,inputs}`. Compile uses `{operation:"compile",intent}`; recovery uses `{operation:"recover",recovery:{colors}}` or the other single recovery form. The executor requires exactly one user JSON data part for execution. Native REST POST `/a2a/rest/message:send` uses the same `{message:{...}}` body without the JSON-RPC wrapper.

A successful task artifact has ID `qdl-v1-result`; its JSON data part is `{operation,result}`. In JSON-RPC SendMessage results this is found under `result.task.artifacts[].parts[].data`. Submitted/working/artifact/completed events are available through streaming. A computed-failed run is delivered as a completed A2A task whose execution result is failed; inspect that result rather than treating task completion as mission success.

One text part leads to TASK_STATE_INPUT_REQUIRED and a request for explicit structured input. English is not automatically compiled or executed. Resume with a complete JSON request using the interrupted task's ID in `message.taskId`; malformed resumed structured input can remain input-required. A new malformed request or domain refusal can yield TASK_STATE_FAILED, with structured QdlError metadata at `task.status.message.metadata.qdlError` when available.

The factory currently enables A2A 0.3 compatibility by default; set legacyCompat=false to omit it. Its older JSON-RPC form uses `A2A-Version: 0.3`, method `message/send`, role `user`, and parts `[{kind:"data",data:{operation:...}}]`. This is protocol-envelope compatibility, not fallback to the legacy QDL Runtime. A2A 1.0 and native REST carry the same closed v1 requests.

Cancellation can win during the pre-dispatch event-loop yield. Once synchronous dispatch/commit begins or the task completes, cancellation is refused; it cannot erase a retained run or undo an external action. A2A task IDs and Session request IDs have different lifetimes. Retry after response loss must preserve the exact original Session requestId and complete payload even when creating a new transport message.

The request default is 4 MiB, configurable from 1 KiB to 16 MiB; malformed JSON receives HTTP400 and oversized bodies HTTP413 before Session mutation. The executor limits active requests to 128 and reserves 64 KiB of a 16 MiB task budget before publishing the operation payload. Default BoundedTaskStore retains up to 128 tasks/64 MiB, with a 16 MiB individual task limit. It may evict terminal/interrupted history under pressure; interrupted tasks expire lazily after 15 minutes. Active tasks are protected. Task-store eviction does not evict or reopen the separate Session replay keys. State publication can fail after a Session commit, so transport task history is not the transaction receipt.

## Host setup and ownership

The default A2A app uses noAuthentication and one shared single-owner Session. Tenant/user task-history scoping is not authentication and does not isolate that Session's artifacts/records between owners. Keep the CLI on its loopback listener for local use. A shared or remote host must provide authentication, owner routing and one Session ownership boundary per owner, plus its own request/transport policies. Merely changing baseUrl or passing tenant strings does not establish that boundary.

MCP receives whatever host authority its process is given, but these eight tools implement no real filesystem/network/world actions and provide no credential-injection interface. Keep optional model-provider and external-adapter secrets in the host's credential mechanism, outside source, bindings intended for public artifacts and browser assets. The SDK does not include a provider setup, automatic English proposer or authenticated live City connection.

## Snapshots, evidence and fresh verification

Snapshots are explicit data, not automatic persistence. `Session.fromSnapshot()` validates source pins, binding digests, request/record references and budgets without running tasks. Imported historical records become **asserted**, because caller-provided JSON cannot attest that their outputs occurred. An exact restored-key replay remains asserted. Newly evaluated records are **retained** in the current local session. Neither label proves external witness identity or world facts.

Fresh reproduction of an imported record reruns its bindings and refuses stale-record if the semantic result differs. Successful reproduction supplies fresh local computation evidence; it still does not refresh a sensor or turn a simulated action into world confirmation. A process restart requires an explicit snapshot/restoration workflow; the built-in Session is not a durable storage driver.

## Explicit migration

The passive migration helper is a separate import:

```js
import {migrateLegacy} from '@quinelings/agent-sdk/v1-migrate';

const preview = migrateLegacy({
  source: legacyCanonicalSource,
  registryDigest: session.describe().registryDigest,
  name: 'Reviewed upgrade',
  thought: reviewedSixArrayDeclaration,
  types: reviewedTypesForEveryLegacyNode,
  ports: {selectedLiteralNode: 'namedRuntimePort'},
  evidenceClaims: reviewedClaimsByEvidenceNode
});
const migrated = session.recover({source: preview.artifact.source});
// Explicit Run requires the exact newly declared typed bindings.
```

The named review values must be authored for that legacy graph; the helper does not infer historical thought or units. Full structured thought is required, unselected literals stay constants, legacy design/repeats are retained, selected ports are deliberate and each legacy evidence node needs a chosen claim. Conversion uses first-report-per-source/claim evidence semantics; choose a separately reviewed fresh-evidence task if stricter conflict policy is intended. Preview executed=false and authored-conversion evidence do not report a task run. Old canonical source/genomes remain recoverable through the separate legacy API; new source has a new identity and exact target registry pin. See [QDL-V1 migration and freeze gates](QDL-V1.md#legacy-compatibility-and-explicit-migration).

## Reproducing checks

The package tests include strict schema discovery, official MCP in-memory/stdio clients, real A2A HTTP/native REST/streaming, clarification/resume, cancellation, replay, computed failures and passive snapshots. From the package directory:

```sh
npm run typecheck
npm test
node examples/v1.mjs
```

The built example passed independent 9/11 outputs and lifecycle assertions. Release acceptance records 109 SDK tests on each of Node v22.23.3 and v26.10.0, static negative type contracts, build checks and installed-tarball consumers covering legacy and six v1 imports. Actual Chromium conformance covers ten frozen sources, 44 fixtures, both codecs and 12 legacy sources. Official MCP and A2A transport tests cover schema discovery, keyed replay, passive restore and precommit failure. See [recorded acceptance](../research/qdl-v1/acceptance.json), [the release gate review](../research/qdl-v1/release-language-gates.md) and [model/runtime correspondence](../research/qdl-v1/formal-runtime-correspondence.md).

Release designation `qdl-v1.0.0` retains the matching runtime, source, registry, goldens and package archive under `releases/qdl-v1.0.0`. Use [the matching-runtime upgrade policy](QDL-V1-UPGRADES.md) for old pins. No automatic multi-registry loader, shared-host authentication, durable storage or live-world dispatcher is part of these SDK guarantees.
