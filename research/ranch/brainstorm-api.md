# Ranch SDK, MCP and A2A contract candidate

Proposal for convergence, 2026-10-04. This report implements no runtime behavior and claims no completed contract tests. It reads the workplan, six initial brainstorm reports and the shipped TypeScript runtime/adapters. QDL remains experimental; schema discriminants below identify an experimental interchange contract, not a frozen language.

## Preserve the shipped boundary

Keep `Runtime`, `Request`, `ResponseFor`, `TaggedResponse` and all eight existing operations unchanged: `parse`, `create`, `compile`, `inspect`, `run`, `reproduce`, `recover`, `frame`. In particular, `reproduce` makes a fresh exact-source execution and is neither passive copying nor offspring admission. `compile/create/recover` store artifacts without running their tasks. `frame` can cache compiled geometry but cannot evaluate task instructions. No text request should be interpreted as a run or birth.

Introduce `RanchRuntime` around an owned Runtime storage backend, exporting `RanchRequest`, `RanchResponseFor<R>` and `RanchTaggedResponse` separately. Existing runtimes and clients remain usable without a world. Extend public error codes additively; do not reinterpret existing codes. Internally split `#admit` into nonmutating validation/materialization and commit. The ranch and artifact stores need one serialized transaction boundary: a wrapper that calls the existing mutating `#admit` before world checks is inadequate.

Resolve the initial reports' conflicting task policies conservatively: this first contract admits task mating/composition only for pure parent graphs. Guard-preserving simulated-action mating is a later explicit recipe requiring its own audit. Body variation may preserve a simulated task byte-for-byte at the task projection level; viewing or admission never runs it. Keep resolved anatomy/design in source and all derivation/relatedness records in companion storage. Do not add `design.genetics` until its source schema and reconstruction obligations are independently agreed.

## Exact experimental data contract

Types below are serializable JSON. IDs are bounded opaque strings, not authorization tokens; runtime schemas reject unknown fields recursively. Validate numbers as finite safe integers with field-specific ranges. Use existing `Intent`, `Diagnostic`, `Artifact`, `Frame`, `Json` and `Request` types.

```ts
type Digest = string; // exactly 64 lowercase hexadecimal SHA-256 characters
type Parent = {
  artifactId: string;
  sourceHash: Digest;
  annotation: { kind: 'typed'; intentHash: Digest } | { kind: 'absent' };
};
type PairParents = [Parent, Parent]; // ordered; distinct artifact IDs
// Node IDs are interpreted within the named parent, never globally.
type Port = { parent: 0 | 1; nodeId: string };
type Trait = 'elongation' | 'spread' | 'curvature'
  | 'gestureGain' | 'tempo' | 'pigmentGain';
type BodyRecipe = {
  kind: 'body-variation'; base: 0 | 1;
  traits: Record<Trait, number>; // every field required, integers -1000..1000
};
type Recipe = BodyRecipe | {
  kind: 'mate'; recipient: 0 | 1;
  replaceNode: string; donorNode: string;
} | {
  kind: 'compose';
  bindings: { from: { parent: 0; nodeId: string };
              intoInput: { parent: 1; nodeId: string } }[];
  outputs: Port[];
};
type PairingRef = {
  worldId: string; proposalId: string;
  parents: [
    { residentId: string; policyEpoch: number },
    { residentId: string; policyEpoch: number }
  ];
};
type OffspringInput = {
  format: 'quineling-offspring-input-1';
  parents: PairParents; recipe: Recipe; nonce: number; // uint32, required
  origin: { kind: 'manual' } | { kind: 'pairing'; pairing: PairingRef };
};
type Changes = {
  // Compared with base parent (body), recipient (mate), parent 1 (compose).
  relativeToParent: 0 | 1;
  sourceChanged: boolean; taskChanged: boolean; bodyChanged: boolean;
  classification: 'unchanged' | 'body-only' | 'task-only' | 'task-and-body';
  evidence: 'canonical-projection'; // never general behavioral inequivalence
};
type NodeInheritance = {
  childNodeId: string; parent: 0 | 1; parentNodeId: string;
};
type Lineage = {
  format: 'quineling-lineage-1'; derivationId: string;
  childArtifactId: string; parents: PairParents;
  recipe: Recipe; nonce: number;
  versions: { compiler: string; assembly: string; recipe: string };
  inheritance: NodeInheritance[];
  origin: OffspringInput['origin'];
};
type Candidate = {
  format: 'quineling-offspring-candidate-1'; candidateId: string;
  input: OffspringInput; artifact: Artifact;
  changes: Changes; lineage: Lineage;
};
type PreviewResult =
  | { status: 'ready'; candidate: Candidate; diagnostics: Diagnostic[] }
  | { status: 'rejected'; diagnostics: Diagnostic[] };
type AdmissionTarget =
  | { kind: 'library' }
  | { kind: 'world'; worldId: string; expectedRevision: number };
type Admission = {
  artifactId: string; derivationId: string;
  placement: { kind: 'library' } |
    { kind: 'resident'; worldId: string; residentId: string;
      revision: number; committedTick: number };
};
```

`compose` permits 0..64 bindings, unique destinations, from declared parent-0 outputs into parent-1 literal inputs, and 1..16 unique ordered outputs. Full compiler reachability constraints still apply. An empty binding list is parallel composition, not inferred fusion. `mate` takes one donor node and its pure dependency closure, rewrites recipient uses/outputs, prunes unreachable recipient nodes, and requires surviving recipient computation plus donor contribution. Imported and replaced ports must have exactly matching normalized structural types, including units and optionality. Self-mating/equal-source parents reject. Body variation keeps the selected base's task, including repeats, and changes only the six bounded explicit traits through the audited body transformer; no arbitrary object paths. One input produces exactly one candidate; there are no hidden random retries or search jobs.

Parent type contracts are recomputed from stored IntentIR and matched against source graphs. Typed recipes require two `typed` annotations. Body variation accepts absent annotations and labels the child accordingly; it cannot fabricate units or original thought. Source-only recovery remains runnable/reproducible but cannot silently gain typed eligibility. A child's mechanically generated intent/source clauses and node inheritance map must not claim inherited natural-language spans.

Candidate identity is `SHA256(Q.canon([input, versions]))`, with a documented domain prefix and UTF-8 encoding. Derivation identity additionally includes child source hash. Source artifact ID remains the shipped `ql_` plus source SHA-256. Seed is a documented uint32 projection of the candidate digest. Task projection includes nodes, ordered outputs and repeats, excludes name/design, and uses deterministic normalized node IDs; body projection contains resolved design and excludes companion provenance. Declare these functions in one contract document and golden fixtures before implementation. Hashes do not establish authentic authorship. Name changes, different IDs or lineage alone are not novelty. Reject unchanged candidates and child source equal to either parent; changing a task projection establishes structural change only.

## Passive preview and atomic admission

Choose **stateless previews**: `offspringPreview(input)` returns the complete candidate without writing artifact, candidate, world, lineage or execution stores. This eliminates a server-side prepared-candidate cache and eviction ambiguity. The website may retain at most eight candidates in its nursery view, replacing/clearing them explicitly. Candidate source is limited to 65,536 UTF-8 bytes, lineage to 32 KiB, inheritance to the existing 64-node graph cap, and the complete candidate to 1 MiB. A pairing candidate expires with its world proposal; manual library candidates have no timer and still require current parent/annotation/version checks. This is a concrete alternative to the biology report's eight-entry server cache; convergence must choose one, not implement both.

`offspringAdmit` takes `{input, candidateId, childSourceHash, target, requestId}` rather than trusting returned `artifact`/lineage blobs. It deterministically rebuilds the candidate, compares all three identities, validates exact current parents and metadata, and then stages admission. There is no need to upload genome arrays again. Paired inputs must target their own world; manual inputs may target only the library. This keeps social birth policy unavoidable while allowing expert non-world experiments. Importing an existing artifact as a resident is a separate explicit world command, not a birth or derivation.

Successful admission ledger lookup occurs before stale revision/proposal checks. A matching `(scope, requestId, canonical admission payload)` returns the original Admission even after proposal consumption or parent retirement. Same key with a different payload returns `request-conflict`. Store at most 128 successful keys for a world/runtime session and reject new admissions when full; do not evict a key and allow replay to create another child. Library admission deduplicates derivation/artifact inserts; repeated requests may record a new ledger entry but cannot overwrite companion metadata.

For a world target, recheck expected world revision, pairing membership, active exact parent resident/source/annotation/policy epochs, proposal expiry/consumption, adult/enabled/nonresting state, parent energy >=50, supported recipe, free guard-safe spawn, total residents <32, nursery residents <8 and timer arithmetic. Check artifact, lineage, ledger and response capacities before mutation. Reserve/stage the child resident, debit 30 from each parent, apply cooldown/latch rules, insert/reference artifact and derivation, consume proposal, clear its links, and insert ledger result **in one commit**. Failure preserves all counters and stores, including optional metadata enrichment. No execution-record slot is needed. Derivations remain distinct even if they share source, and prior metadata conflict behavior is retained.

The response-size check must precede commit. Both current adapters size responses after calling the runtime, which can produce a transport error after a successful mutation. New mutations return small acknowledgements with a guaranteed bound; preflight their serialized result in the transaction. Full source/geometry follows through separate passive inspections. In-memory atomicity is not crash durability; persistence later requires an actual durable transaction.

## New operations and response discrimination

```ts
type RanchOnlyRequest =
  | { operation: 'offspringPreview'; input: OffspringInput }
  | { operation: 'offspringFrame'; input: OffspringInput;
      candidateId: string; phase: number; options?: FrameOptions }
  | { operation: 'offspringAdmit'; input: OffspringInput;
      candidateId: string; childSourceHash: Digest;
      target: AdmissionTarget; requestId: string }
  | { operation: 'lineage'; artifactId: string;
      cursor?: string; limit?: number }
  | { operation: 'annotate'; artifactId: string;
      sourceHash: Digest; intent: Intent }
  | { operation: 'worldCreate'; worldKey: string; seed: number }
  | { operation: 'worldInspect'; worldId: string }
  | { operation: 'worldCommand'; worldId: string;
      expectedRevision: number; sequence: number; command: WorldCommand };
type RanchRequest = Request | RanchOnlyRequest;
type WorldCommand =
  | { kind: 'import'; artifactId: string }
  | { kind: 'retire'; residentId: string }
  | { kind: 'participate'; residentId: string; enabled: boolean }
  | { kind: 'invite'; fromResidentId: string; toResidentId: string }
  | { kind: 'cancelProposal'; proposalId: string }
  | { kind: 'advance'; ticks: number }; // integer 1..4
```

`offspringFrame` rebuilds/checks an unstored candidate and samples it without admission. Use one shared passive body sampler rather than temporarily admitting and deleting an artifact. Reject stale parents. Match shipped Runtime phase bounds (finite magnitude <=1e9) for new tools; preserve legacy MCP frame's existing narrower <=1e6 constraint until a separately reviewed compatibility fix.

`lineage` returns `{status:'available',items:Lineage[],nextCursor:string|null}` or `{status:'unavailable',items:[],nextCursor:null}`; known source-only artifacts are unavailable rather than unknown. Limit 1..32, default 16; cursor binds artifact, tenant/session and immutable sequence, not an array offset. No recursive ancestor expansion. `annotate` is an explicit metadata write: validate/recompile IntentIR against exact source graph, recompute contract, attach only if absent or identical; conflicting stored intent rejects `metadata-conflict`. Return `{artifactId,intentHash,origin:'user-supplied'}`. Do not recover historical thought claims, expose arbitrary contract attachment or permit last-writer-wins metadata replacement.

`worldCreate` is idempotent by explicit `worldKey` (1..80 safe identifier characters), seed uint32 and version; same key/different configuration conflicts. A default runtime allows one world; server-owned caps cannot be raised in tool input. It returns a WorldSnapshot. `worldInspect` returns a WorldSnapshot without timers advancing. Commands return `{worldId,revision,tick,sequence}` acknowledgements; inspect afterwards for state. Command sequence is a safe integer 1..1,000,000 and every successful mutation advances revision once; duplicate `(sequence,payload)` returns its original ack, different payload conflicts. Keep a bounded 256-entry command receipt window; older sequences reject `stale-command` rather than replay. A rejected command consumes neither sequence nor revision. Successful offspring admission also advances the world revision once.

WorldSnapshot must be an explicit export, not `Record<string,Json>`: `{format:'quineling-world-1',worldId,version,seed,revision,tick,residents,pairs,proposals,events,droppedEvents}`. Export bounded row types from the social/ecology implementation: Resident includes ID/artifact/direct-parent IDs, integer x/y, lifecycle (`nursery|adult`), mode (`roam|invite|approach|court|cooldown|rest`), energy, partner ID/null, policy epoch/enabled state, born/mature/ready ticks and rest latch. Pair includes two resident IDs, reserved slots, start/deadline ticks and dwell count. Proposal includes ordered parent pins, epochs, created/expiry ticks and recipe eligibility. Events use a closed `kind` union (`imported|retired|invited|pair-started|pair-aborted|pairing-ready|proposal-cancelled|proposal-expired|offspring-admitted|matured|rest-started|rest-ended`) with tick and affected resident IDs; they contain no task outputs. No wall-clock auto-step API, autonomous admission, source replacement command, whole-snapshot overwrite or ambient world-run endpoint. `advance` applies recorded simulation ticks only and respects tick exhaustion.

Define a `RanchResultMap` keyed by every new operation with these exact results: PreviewResult, Frame, Admission, LineagePage, AnnotationReceipt, WorldSnapshot, WorldSnapshot, WorldAck respectively. `RanchResponseFor<R>` selects `ResponseFor<R>` for legacy requests and `RanchResultMap[R['operation']]` for ranch-only requests. Build the distributive `{operation:O,result:...}` union through a mapped type, with exhaustive switch assertions in dispatch. Do not widen to an uncorrelated operation/result pair or `Json`.

## MCP and A2A adapters

Add one MCP tool per new operation: `quineling_offspring_preview`, `quineling_offspring_frame`, `quineling_offspring_admit`, `quineling_lineage`, `quineling_annotate`, `quineling_world_create`, `quineling_world_inspect`, `quineling_world_command`. Retain the eight existing names and schemas. Every tool uses strict root objects and nested discriminated unions; export their reusable Zod/JSON schemas. MCP discovery must actually advertise alternative required fields, exclusivity and additionalProperties:false; a runtime refinement alone is not sufficient. Avoid tuple/union features unsupported by the pinned discovery converter without fixture testing.

| Tools | readOnlyHint | idempotentHint | destructiveHint | openWorldHint |
| --- | --- | --- | --- | --- |
| preview, offspring frame, lineage, world inspect | true | true | false | false |
| admit, annotate, world create | false | true | false | false |
| world command | false | true | true | false |

World command can retire residents/cancel proposals, so its aggregate destructive hint is true even though operations are local and reversible by new import. Hints describe behavior; they do not authorize calls. Success remains the shipped `{result}` in text and structuredContent. Tool failures remain `isError:true` and `{error:{code,path,message}}`; semantic preview rejection is a successful PreviewResult with diagnostics and zero mutation. Preserve 4 MiB request/8 MiB response adapter caps, enforce stricter domain caps first, and bound diagnostic arrays to 64 and messages to 2048 characters.

A2A accepts precisely one user data part containing the closed RanchRequest. Existing text→create and bare legacy data requests remain supported. Add an optional explicit new wire envelope:

```ts
type RanchA2AInput = {
  format: 'quineling-ranch-request-1'; request: RanchRequest;
};
type RanchA2AOutput = {
  format: 'quineling-ranch-response-1';
  response: RanchTaggedResponse;
};
```

Bare requests continue returning the legacy `{operation,result}` envelope; explicitly formatted requests return RanchA2AOutput in one `application/json` data part. Reject mixed envelopes and unsupported formats. `taskId/contextId/messageId` are transport correlation, not candidate/admission IDs; retry idempotency uses explicit requestId/sequence. Add passive-offspring/world-management skills to the agent card while retaining existing build/execute descriptions; only structured legacy run/reproduce evaluate tasks. `working` descriptions must distinguish passive construction, world mutation and task execution. Preview `rejected` becomes TASK_STATE_REJECTED with its structured result, ready/acks become COMPLETED, malformed wire request becomes protocol request error, and runtime/transaction failure becomes FAILED with the existing quinelingError metadata. No world proposal uses INPUT_REQUIRED: that state remains natural-language clarification, not a nursery timer. Preserve scoped task lookup, bounded task retention, pagination and per-scope pending-operation ownership.

## Async, cancellation and error boundaries

All initial transformations and world steps are bounded synchronous operations. Dispatch checks AbortSignal before starting; once evaluation/commit starts, cancellation returns not-cancelable and never claims rollback. A2A already implements this pre-dispatch yield boundary. MCP must not label a committed mutation cancelled because the signal arrived while serializing its reply. Transport loss after commit is resolved by requestId retry. If building later moves to workers, workers return inert drafts only: check cancellation and parent/version/world pins after await, then serialize the final commit with a final signal check. No asynchronous callback admits a candidate. Keep `Runtime.propose` as an explicit provider API; no new adapter calls models, credentials, external networks or callbacks embedded in JSON.

Add closed codes: `missing-typed-parent`, `incompatible-ports`, `unsupported-recipe`, `unchanged-offspring`, `unknown-world`, `unknown-resident`, `unknown-proposal`, `stale-parent`, `stale-candidate`, `stale-world`, `stale-command`, `proposal-expired`, `proposal-consumed`, `participation-withdrawn`, `ineligible-parent`, `request-conflict`. Use existing `resource-limit` with a stable path to the exhausted bound (`$.limits.residents`, `nursery`, `artifacts`, `lineage`, `admissionLedger`, `tick`, etc.). Do not leak unrelated tenant identities in errors. Type/recipe incompatibility is PreviewResult rejection when inputs are otherwise valid; admission uses structured errors so callers cannot mistake refusal for a birth. Internal bugs remain execution-failed with a bounded message; validators provide precise paths. Always distinguish unavailable companion evidence from unknown artifact.

## Independent contract verification required

These are future acceptance tests, not implementation-shaped assertions. An independent client must consume published discovery schemas and the compiled package; avoid testing only private helper functions shared with the implementation.

1. Compile positive/negative TypeScript fixtures proving correlation of every operation/result and unreachable fields across recipe/origin/target discriminants. Snapshot all eight old operations, tool discovery names, annotations and bare A2A envelopes to detect compatibility breaks.
2. Raw MCP and A2A requests bypass advertised client validation: unknown nested fields, forged digests, callbacks/accessors in local SDK calls, NaN/infinity, sparse arrays, deep payloads, duplicate bindings, oversized Unicode source and wrong tuple length refuse without mutation. Independently inspect discovery alternatives against these inputs.
3. Instrument interpreter/record counters externally: preview, candidate frame, annotate, world creation/import/advance/inspection, admission and 10,000 social ticks produce zero task executions. Exactly one explicit child run yields a fresh source-bound record; reproduce keeps its shipped fresh-copy execution behavior.
4. Saturate each admission store/spawn/energy bound independently. Compare a complete before/after world+artifact+metadata+lineage+ledger digest on rejection. Include existing-source metadata enrichment/conflict and insufficient response budget. Inject a failure immediately before commit; no parent charge or partial child may remain.
5. Race two admissions for the final nursery slot through different adapters; only one commits. Retry success after parent retirement/proposal removal with the same requestId returns its original receipt. Changed payload conflicts; full ledger rejects; an evicted world command sequence remains stale. Withdrawal/re-enable changes epochs and rejects the old candidate.
6. Two fresh runtimes with identical pinned parents/input/version produce byte-identical candidates and source. Swap parent order or nonce and check the documented identities. Recover child in a fresh Runtime without parents; its explicit run independently produces the expected mean/budget fixture `{allocated:12,remaining:8}`. Recovery reports missing lineage/type evidence, not fabricated ancestry. Body variation preserves task projection and result without claiming computational novelty.
7. Cross transport equivalence: SDK, MCP and both A2A protocol bindings produce equal domain results/errors for the same fixtures. Exercise cancelled-before-start, cancel-during-synchronous-work, disconnected-after-commit/retry, clarify/resume retention and task-scope separation. No adapter failure after committed admission may lead to duplicate birth.
8. Replay the same world command log under differing view schedules and inspect/frame frequency; snapshots match. Assert resident/proposal/event/tick bounds, no self/double pairs, reciprocal participation, expiry at equality, zero implicit admission and deterministic retired-ID handling.

Implementation order: agree on pure-parent pilot and stateless preview choice; define schemas/identity projections; separate validator and transaction backend; implement passive preview/frame/annotation/lineage; add bounded world reducer; add atomic admission; expose adapters; run independent contract fixtures and the workplan's nine candidate audits before integration/publication. Existing finite-model checks do not establish these new API guarantees.
