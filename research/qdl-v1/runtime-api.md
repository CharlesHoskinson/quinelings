# Production QDL v1: runtime and agent API

Scope: SDK runtime, persistence, caller inputs, effect authority and MCP/A2A compatibility. Research only; no runtime changes. Examined `AGENTS.md`, `docs/PROGRAM-CONTRACT.md`, `docs/sdk-api.md`, SDK `types.ts`, `index.ts`, `schema.ts`, `mcp.ts`, `a2a.ts`, `ranch-types.ts`, core interpreter/kernels and adapter/runtime tests. City-specific requirements should be reconciled with `city-context.md` when available.

## What already works, and what v1 must preserve

The current runtime rejects noninert JSON, canonicalizes constructor source, independently reconstructs the accepted constructor, checks source emission on explicit execution, and returns detached data. The source hash identifies exact canonical source, including body design. Typed companions are checked against task graphs. Offspring preview/frame, source recovery, annotation, inspection and social time do not run tasks. Ranch admission stages all local validation and commits source, lineage, receipt and world changes together. Existing keyed admission and sequenced world commands already have useful replay semantics.

Keep these boundaries. `action` is a simulated receipt. Its `allowed` parameter and Boolean guard cannot grant external permission. Compilation, parsing, import, source recovery, frame sampling and town/ranch ticks remain passive; pure bounded validation may calculate refinements. No program-supplied JavaScript, `eval`, module loading, URLs to fetch, network client or ambient host callbacks belong in the interpreter. An external proposer stays an explicitly supplied host service, never an implicit parse/create dependency.

## Reproduced gaps

Probe: `/tmp/quinelings-runtime-api-probe.mts`, run with installed `packages/agent-sdk/node_modules/.bin/tsx`; imports SDK source and official MCP 1.32.0 client with paired `InMemoryTransport`. Dependencies inspected locally: MCP SDK 1.32.0, A2A SDK 1.3.0, Zod 4.6.5. These findings concern current checkout, not promises about subsequent SDK releases.

| Finding | Concrete evidence | Necessary v1 change |
| --- | --- | --- |
| Source recovery is not session restore. | New Runtime recovery preserves `ql_…`, loses intent, yields empty lineage, and reproducing old run ID raises `unknown-record`. Runtime prototype has no export/import/checkpoint methods. | Bounded versioned source bundle plus whole-session checkpoint; distinguish executable recovery from retained session evidence. |
| Runtime inputs stop at kernel API. | For `[1,2,3] \| sum`, `Q.runTask(graph,{inputId:[10,20]})` yields `[30]`; SDK dispatch `run` with `bindings` raises `invalid-input`. `Q.execute` calls `K.run(graph)` without overrides. | An explicit run input contract and interpreter plumbing that preserves exact emitted source. |
| Source identity does not identify evaluator semantics. | Artifact ID is SHA256(source). Graph `version:1` and design `qdl:1` are experimental; artifact/run records contain no complete evaluator/registry identity. | Keep source ID; add pinned language/registry/canonicalization identity to execution and new source profile. |
| Execution storage has a count bound, not aggregate byte accounting. | `#execute` only checks `#maxRecords`; result includes source AST, traces and repeated full task records. Config permits 4096 records. Artifacts have a separate 32 MiB aggregate bound. | Per-record and aggregate byte budgets, reservation before commit, bounded export. |
| Advertised and actual adapter contracts differ. | Official `tools/list`: 16 tools, zero output schemas. Direct phase `2e6` succeeds; MCP regular frame discovers ±1e6 and rejects the same phase, while offspring frame uses ±1e9. | One normative request/result schema set and consistent phase bounds. |
| Not every MCP validation error has a domain error envelope. | The official SDK validates before the custom handler. Probe's invalid phase returns `isError:true`, text `MCP error -32602: …`, no `structuredContent`. Local SDK `server/mcp.js` confirms this path. | Document protocol/SDK errors separately from domain envelopes; test both. Do not promise every malformed input is a `QuinelingError`. |
| Transport failure can follow committed state. | MCP serializes and size-checks response after Runtime mutation; A2A publishes/stores results after dispatch. Run/reproduce lack retry keys. | Reserve bounded result capacity before commit; durable request receipts for opted-in retryable execution. Transport failure never implies rollback. |
| A2A history scopes do not scope Runtime authority. | TaskStore keys include tenant/user, but Executor calls its one `runtime`; app uses `UserBuilder.noAuthentication`. Knowing a source ID enables inspect/run in that Runtime. | Explicit single-owner local mode, or authenticated host selection of one Runtime/session per principal. IDs are not authorization. |
| Capabilities are not a complete machine contract. | Exported `capabilities` is a string list from thought parser; it omits runtime limits, compatibility profiles, formats and host capability availability. | A passive descriptor operation, separate from granting authority. |

Verification: `node_modules/.bin/tsx --test test/runtime.test.ts test/mcp.test.ts test/a2a.test.ts` from `packages/agent-sdk` passed **27/27**. The first run from repository root failed only the stdio case because that test resolves `dist/mcp-cli.js` against its working directory; rerun from package directory passed. Existing tests already cover constructor rejection, detached state, simulated-only actions, early cancellation, official MCP discovery, A2A 1.0 JSON-RPC/REST and 0.3 compatibility, clarification resume/expiry and scoped task-history cursors. Those successes should be retained.

## Minimal interface candidate

Keep existing sync `Runtime` methods and existing wire requests as compatibility surface. Add a versioned session entry point for durable/retryable work, shared closed request and response schemas, and one optional host invocation boundary. Names below are a concrete candidate, not implemented APIs.

```ts
type Digest = string; // 64 lowercase hex; checked at boundaries
interface SemanticPin {
  language: 'qdl-v1' | 'qdl-experimental-legacy';
  registry: string;          // immutable semantic profile, not package version
  registryDigest: Digest;   // manifest of opcode semantics, types and limits
  canonicalization: string; // fixed algorithm identifier
}
interface SourcePin {
  artifactId: string;        // keep existing ql_SHA256(canonicalSource)
  sourceHash: Digest;
  semantics: SemanticPin;
}
interface RuntimeDescriptor {
  apiVersion: '1.0';
  implementationVersion: string;
  supportedProfiles: SemanticPin[];
  operations: string[];
  limits: Record<string, number>;
  formats: string[];
  effects: 'simulation-only' | 'host-invocation';
  persistence: 'memory' | 'durable';
}
interface RunOptions {
  bindings?: Record<string, Json>;
}
type RunRequestV1 = {
  operation: 'run'; artifactId: string;
  expectedSource?: SourcePin; options?: RunOptions;
};
type ExecuteV1 = {
  apiVersion: '1.0';
  requestId: string; // caller retry key, 1..128; session scoped
  request: RequestV1;
};
interface ExecutionContext {
  signal?: AbortSignal; // nonserializable; supplied by adapter
}
interface Session {
  describe(): RuntimeDescriptor;
  execute(input: ExecuteV1, context?: ExecutionContext): Promise<TaggedResponseV1>;
  requestInspect(requestId: string): Promise<RequestReceipt | undefined>;
  exportSnapshot(): Promise<SessionSnapshotV1>;
}
// Programmatic only; no arbitrary file paths accepted by program/wire requests.
function restoreSession(snapshot: SessionSnapshotV1,
  host?: SessionHost): Promise<Session>;
```

`RequestV1` is a closed union of the retained operations plus passive `describe` and `requestInspect`. Every operation has one exported runtime validator, JSON Schema and result schema. `Session.execute` is explicit execution of the selected operation: a wrapped frame still only samples; a wrapped run runs. Request IDs bind canonical complete requests, source/semantic pins and effective bindings. Exact replay returns the original receipt/result. Changed payload refuses with `request-conflict`; it never silently applies another run. Scope receipt storage to the owning session. Bound the receipt ledger and refuse new writes when full rather than discarding at-most-once evidence.

The old `run(artifactId)` and `reproduce(artifactId,recordId)` remain fresh memory executions. Retryable callers use `Session.execute`, not a silently changed meaning of the legacy API. A source bundle/export operation need not be a wire tool initially; SDK callers already receive source. Whole-session snapshots are host APIs, because their possible size exceeds existing MCP/A2A request limits and they contain session-private history.

### Caller input semantics

Run bindings name literal input nodes, never operations, guards by opaque program rewriting, graph parameters, arbitrary intermediate values or executable expressions. Validate finite inert JSON and exact input type/units, declared ports, required/default values, array/depth/byte budgets and value-dependent refinements before execution. Unknown binding keys refuse. Caller input bytes must be recorded once with their canonical digest; copies cannot change effective inputs. Never bake new observations into a supposedly identical source or make a frame lookup request fresh input from the host.

For new stable sources, include an input declaration in executable source: `{id,type,default?,bindable}` for each declared runtime port, and freeze its schema with the source profile. The compiler may still emit a literal default internally, but the evaluator validates source declarations independently of companion prose. Omitted `bindable` is false for legacy source. This avoids allowing a fabricated companion annotation to invent runtime authority or types. A legacy artifact with no source input contract remains executable with its exact source constants. The legacy kernel `runTask(graph,overrides)` remains a simulation/fixture helper; exposing it as typed v1 run requires an explicit new-source migration.

Execution records gain `{sourcePin,bindings,bindingsHash,recordBytes}` and distinguish the source graph from the effective bound graph. Exact constructor emission remains the original source for every binding. `reproduce` reuses a parent's effective bindings and semantic profile; asking for new inputs is a new run, not a reproduction check. Its fresh output comparison uses the same bound input context. No silent clock/randomness: host observations, timestamps and random seeds enter as declared finite data. Body frames retain their current explicit phase and source-default geometry. A result-conditioned rendering, if later needed, must name a completed record and cannot invoke it.

City coordination evidence supplied by root (`city-evidence.json`) strengthens this requirement: observations must distinguish reported plans, confirmed current state and unknown state. A typed observation should carry its host-supplied revision/time and evidence category as finite input data; the program cannot promote a report into confirmed inventory. A bounded mission such as reserve → refresh → gather consists of separate explicit host invocations and new observations. Inventory atomicity, pending acknowledgements and allowances stay in the host/provider contract; simulated allocation or `allowed:true` cannot establish them. Preserve source across these observations and bind every run/invocation to its observation digest.

### Effects: optional host boundary

V1 can ship simulation-only and report that honestly. If it must perform real actions, add this boundary outside the interpreter; do not turn the existing `action` kernel into a network opcode:

```ts
interface InvokeRequestV1 {
  operation: 'invoke';
  artifactId: string;
  expectedSource: SourcePin;
  recordId: string;           // completed explicit evaluation
  nodeId: string;             // matching simulated action receipt
  payloadHash: Digest;
  capabilityId: string;       // opaque host grant, never recovered from source
}
interface HostCapability {    // nonserializable host configuration
  id: string;
  action: string;
  validatePayload(value: Json): Json;
  invoke(value: Json, context: {
    invocationId: string; signal?: AbortSignal;
  }): Promise<HostOutcome>;
}
type HostOutcome =
  | {status:'completed'; receipt:Json}
  | {status:'failed'; error:DomainErrorV1}
  | {status:'unknown'; detail:string};
```

Expose invoke only in a host that installed capabilities for this principal/session. Grant references and handlers are not serializable, importable or inheritable. The host checks source/profile, source-bound completed record, node, Boolean guard, allowed simulation outcome, exact payload digest, capability action and payload schema, and its own authorization policy. Source `allowed:true`, an English instruction, parent grant, source heredity, imported receipt, tool annotation or provider proposal cannot satisfy that policy. Adapters do not auto-invoke after run and reproduction never invokes a parent capability.

Invocation uses the `Session.execute` retry key. Persist `prepared` before handing work to a provider and `dispatched` before the external call; use a stable host invocation ID with provider idempotency when supported. A crash/timeout after dispatch becomes `unknown` until the provider reconciles it. Do not interpret `unknown` as safe to retry an external action. Exactly-once external effects cannot be promised without the provider's idempotency/reconciliation contract. This is the only extra lifecycle required by real effects; no generic distributed transaction system is needed for simulated programs.

### Durability and bounded artifacts

Define two formats, with different claims:

* `ArtifactBundleV1`: canonical source, `SourcePin`, optional exact graph-matching companion/source map, bounded claimed derivations. Decode/rebuild derived graph/body/genomes without task execution. Source-only recovery remains sufficient for source/default execution and body, not original thought, trusted lineage, host grants or history.
* `SessionSnapshotV1`: format/version, session ID/revision, immutable profile pins, sources/companions, bounded execution records, ranch snapshot, admitted derivations and successful request/admission/command receipts. Omit frame/body caches, redundant genomes, active transport subscriptions, A2A cursor secrets and host credentials/capability handlers. There are no serialized live promises.

Candidate initial hard limits: source 64 KiB; records ≤16 MiB each and ≤64 MiB aggregate; retained artifacts ≤32 MiB; derivations ≤4 MiB; world ≤1 MiB; request receipts counted under a separate explicit budget; snapshot ≤128 MiB encoded. Keep existing counts as well. Account all bytes before allocating a committed record; repeated tasks/traces can consume the record budget even when source is small. The exact defaults need fixture measurement, but byte limits and failure-before-mutation are mandatory. Bundle/snapshot import has strict schemas, finite values, bounded depth/count/bytes and rejects duplicate IDs, stale source/profile pins, dangling world/parent/run references, conflicting companions and bad source reconstruction. Restore into a new session; never partially merge a malformed snapshot into a running one.

Persistence belongs to the host. A minimal `SessionHost` provides an atomic compare-and-swap commit of a bounded checkpoint and receipts against an expected session revision. A single-owner local file store can implement this with a replacement file and required durability flushes; programs cannot choose a path. Mutating session execution stages state and bounded response, durably commits, then exposes success. Commit failure leaves the previous authoritative state. Crash recovery reads the last complete checkpoint. In-memory mode states that it is not durable. This avoids retrofitting asynchronous I/O into every legacy synchronous Runtime method.

Arbitrary imported JSON cannot certify that an execution or birth happened. Verify content hashes and source/companion consistency, but classify imported history as asserted until appropriate replay or trusted host receipt verification. Replaying a pure construction verifies that its child matches those parents under a profile; it does not prove historical authorship, world consent or external completion. A saved host-owned checkpoint can resume its trusted receipt ledger through the host's storage integrity policy. Importing a caller-supplied snapshot must not promote its claimed host invocation receipts to authority or suppress/authorize external work. Cryptographic signing/key infrastructure is not required for v1 local simulation; explicit evidence status and trust boundary are required.

## Cancellation and errors

Retain honest bounded synchronous semantics: cancellation before dispatch produces no mutation; once evaluation or atomic commit starts, it runs to its defined boundary. An adapter disconnect/cancellation cannot undo a completed commit. A2A `CancelTask` may return not-cancelable. Request lookup/replay resolves uncertain transport outcomes. Do not report `cancelled` for a committed request whose response was lost.

Provider work and optional host invocation receive a real `AbortSignal`, but cancellation is cooperative. A provider that ignores it must not be able to admit a late proposal. Unknown provider failures normalize to a bounded domain error, rather than arbitrary error objects; diagnostic fields retain a useful path. Host errors cannot leak credentials. Separate malformed protocol envelopes, semantic compile/preview refusal, domain failure and indeterminate external outcome.

```ts
interface DomainErrorV1 {
  code: string; path: string; message: string;
  outcome: 'not-applied' | 'committed' | 'unknown';
  requestId?: string;
}
```

Preserve current code spellings; add only `unsupported-version`, `request-conflict`, `capability-denied` and `storage-failed` where needed. Map world stale sequence/revision/pin conflicts to existing `stale-state` instead of broadly wrapping everything as `invalid-offspring`. Never infer a retry rule from a message substring. A size/storage error before dispatch is not-applied; a transport/host failure after an effect may be unknown. Adapter protocol errors are outside this domain schema.

## Adapter and migration contract

MCP success keeps `{result}` structured content and matching serialized text; every v1 tool advertises a precise output schema. Retain established tool names. Share constants/schemas so regular and offspring frame accept the same phase range. The official SDK can reject before a tool handler, so compatibility tests must admit native SDK/protocol errors as well as custom domain errors. Advertise passive tools as read-only; running stores records and is not read-only; fresh legacy runs are not idempotent. Descriptions/annotations describe behavior, not authorization.

A2A native 1.0 and legacy 0.3 remain distinct, pinned compatibility modes through the official adapter SDK. QDL API version travels inside the data payload; it is not the A2A protocol version, card version or package version. Add a passive descriptor skill and a schema reference/digest for structured requests/results so a caller can discover the data-part contract. Preserve one user data/text-part rule; raw text only creates a passive artifact, never invokes or runs. Test SDK-decoded messages and actual HTTP JSON-RPC/REST serialization. Do not claim multiuser isolation from task-store scoping alone: start with an explicitly single-owner local service; authenticated deployment requires host-selected sessions and ownership checks for every operation. Client-supplied tenant/session strings cannot select another owner's runtime.

Existing source bytes, `ql_` IDs, harmonic/RGB encodings and defaults must remain readable under a frozen legacy semantic profile. Historical experimental `qdl:1`/graph `version:1` cannot silently mean the new stable language. New sources explicitly bind the new semantic profile/input contract; importing old source does not rewrite it or synthesize trusted metadata. Explicit migration creates new source and a new artifact ID, records old/new hashes and profile pins as a claimed or replay-verified derivation, and preserves the original. Package patch/minor upgrades may add implementations or operations but cannot alter a frozen registry's output/effect/type/canonicalization semantics. Such changes require a new profile; unsupported profiles fail closed.

## Acceptance gates

1. Golden legacy fixtures retain exact source IDs, emission, default results and both decoders across package upgrades. Stable v1 profile tests freeze opcode errors, type/units rules, byte canonicalization and profile digests independently of npm version.
2. For a bindable v1 sum port, `[10,20]` yields 30 through SDK, MCP and A2A; source and artifact ID are unchanged. Missing/unknown/type-invalid/oversized bindings refuse before record allocation. Binding to an unmarked legacy literal refuses. Reproduction uses the parent's bindings and validates identical outputs with a fresh record ID.
3. Every direct request valid at schema bounds has the same acceptance/result shape over both adapters. Frame tests include ±1e9 boundaries, nonfinite values and exact option limits. Every MCP output validates against discovery outputSchema; refs resolve; malformed protocol and SDK validation paths are covered separately.
4. Checkpoint roundtrip retains source, exact companion, world revision/sequence, record pins, admission receipts and bounded lineage. It produces no task execution, automatic time advance, capability invocation or network call. Corrupt/duplicate/dangling/version-incompatible imports leave active sessions untouched.
5. Crash-injection around prepare/commit/ack proves old or new complete checkpoint recovery. Lost acknowledgement + exact original request returns one run/admission/world receipt; changed payload conflicts. Aggregate byte exhaustion leaves counts, balances, records and receipt ledgers unchanged.
6. Pre-dispatch cancel leaves no record/admission; late cancel never claims rollback. Proposer late completion after abort cannot admit. Host timeout after dispatch yields unknown and cannot trigger automatic reissue. Explicit inspection resolves committed outcome after response loss.
7. Source-only recovery and caller-supplied bundles preserve heredity claims but have no trusted birth/run/effect evidence. Tampered traces and fabricated host receipts cannot authorize invocation. Replay verifies construction content without inventing historical consent.
8. Optional capability test uses a fake host, never a live service: preview/frame/recover/compile/run/reproduce/world advance invoke zero callbacks; only explicit invoke with matching source/record/action/payload and host grant invokes one. Changed grant/payload/record refuses; repeated requestId calls provider once or reconciles unknown under declared provider semantics.
9. Official installed MCP and A2A clients exercise discovery, stream terminal transitions, clarification follow-up, cancellation and JSON-RPC/REST/0.3 modes. Two authenticated host principals cannot inspect/run/import/invoke each other's artifacts, records, worlds or request receipts. Local single-owner mode is stated in card/descriptor and deployment configuration.

## Primary protocol references

* [MCP tools specification, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools): discovery schemas, structured output validation, error categories and untrusted annotations. These support output-schema and error-path recommendations; annotations are not permission grants.
* [A2A specification](https://a2a-protocol.org/latest/specification/): task cancellation/error behavior, protocol-version negotiation and declared authentication responsibilities. Its current document evolves; CI compatibility must use pinned protocol/SDK fixtures rather than the moving latest page.

Protocol references justify transport behavior only. Persistence, source trust and runtime-input recommendations follow the inspected repository and the experiments above.
