# Agent SDK public API proposal

Scope: experimental library API over the current `thought.js`, `core.js`, `qdl.js`, `anatomy.js`, and `kernels.js`. This is an interface proposal, not a source-version freeze or a production change. MCP and A2A should translate this API; the library should work without either transport, a model provider, network access, or a running server.

Integration update: root selected a bounded stateful `Runtime` with 128 artifacts and 256 execution records. The actual public operation vocabulary is `parse`, `compile`, `create`, `inspect`, `run`, `reproduce`, `recover`, `frame`, `dispatch`, and tagged `exchange`, matching `packages/agent-sdk/src/types.ts`. Stores use ECMAScript private fields. Returned artifacts are detached mutable copies; callers can edit their own copies without affecting internal state. This is the selected contract, and documentation must not describe these copies as frozen. The named functions and stronger immutability interfaces below are design recommendations, not claims about shipped exports. User-facing SDK documentation must use root's actual vocabulary and tested behavior.

Concrete correspondence for the selected implementation:

| Runtime method | Public intent |
| --- | --- |
| `parse(thought)` | Preserve the four parser statuses. |
| `compile(intent, options?)` | Validate typed intent and create/store an artifact. |
| `create(thought, options?)` | Parse, validate, and create/store an artifact. |
| `inspect(artifactId)` | Inspect a stored immutable artifact. |
| `run(artifactId)` | Explicit execution, with a stored source-bound record. |
| `reproduce(artifactId, recordId)` | Validate a specific parent record and run its fresh reproduced child. |
| `recover(recovery)` | Validate exactly one source, harmonic genome, or color genome and create/store an artifact. |
| `frame(artifactId, phase, options?)` | Sample geometry without running the task. |
| `dispatch(request)` | Exhaustively route the discriminated request union. |

`Artifact.id` is SHA-256 of canonical source. Record IDs are separate. `reproduce` must validate parent artifact/record association and actual emitted source, rather than merely deriving a child from an arbitrary supplied artifact. Read methods must not mutate stored artifacts. Store eviction should report a specific missing-artifact/record outcome, never rebuild or silently rerun it. MCP tools `quineling_parse`, `quineling_compile`, `quineling_create`, `quineling_inspect`, `quineling_run`, `quineling_reproduce`, `quineling_recover`, and `quineling_frame` should reflect store writes in their annotations; `{ result }` structured content and its JSON text mirror should agree.

## Recommended entry points

Prefer named functions with explicit inputs and returned artifacts. Avoid a mutable session or agent class that combines interpretation, execution, rendering, and transport state.

```ts
export function parseThought(text: string): ParseOutcome;
export function compileIntent(input: unknown): Result<CompiledThought>;
export function compileThought(text: string): CompileOutcome;
export function createLifeform(
  thought: CompiledThought,
  options?: CreateOptions,
): Result<Lifeform>;
export function executeLifeform(lifeform: Lifeform): Result<RunRecord>;
export function verifyLifeform(lifeform: Lifeform): Result<VerificationReport>;
export function exportLifeform(lifeform: Lifeform): Result<LifeformBundle>;
export function importLifeform(input: unknown): Result<Lifeform>;
export function sampleFrame(
  lifeform: Lifeform,
  options: FrameOptions,
): Result<FrameSnapshot>;
export function capabilities(): CapabilityManifest;
```

`compileIntent(unknown)` is deliberate: agent-generated JSON and imported artifacts need runtime checks even when a TypeScript caller claims the right type. Export `IntentIR` for authoring, but never treat a cast as validation. `compileThought` preserves clarification and unsupported outcomes instead of hiding them in an exception.

Creation validates source and design and may perform the compiler's bounded pure refinement calculations; it does not create a `RunRecord`. `executeLifeform` is the explicit task execution boundary. `sampleFrame` never executes a task. Keep source reproduction verification explicit because it evaluates the interpreter and task graph, even though all current effects are simulations.

## Results and errors

```ts
export type Result<T> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: SdkError }>;

export type Stage =
  | 'parse' | 'compile' | 'create' | 'execute'
  | 'verify' | 'import' | 'export' | 'frame';

export type Diagnostic = Readonly<{
  code: string;                 // preserve the existing compiler code
  path: string;                 // retain existing $.steps.0 spelling
  message: string;
}>;

export type SdkError = Readonly<{
  code: 'invalid-input' | 'compile-failed' | 'invalid-design'
      | 'invalid-artifact' | 'budget-exceeded' | 'execution-failed'
      | 'verification-failed' | 'unsupported-format' | 'internal-error';
  stage: Stage;
  message: string;
  diagnostics: readonly Diagnostic[];
}>;

export type ParseOutcome =
  | Readonly<{
      status: 'supported'; intent: IntentIR;
      assumptions: readonly string[];
      sourceMap: readonly SourceMapEntry[];
      diagnostics: readonly Diagnostic[];
    }>
  | Readonly<{
      status: 'clarify' | 'unsupported' | 'inconsistent';
      assumptions: readonly string[];
      diagnostics: readonly Diagnostic[];
    }>;

export type CompileOutcome =
  | Readonly<{ status: 'compiled'; value: CompiledThought }>
  | Exclude<ParseOutcome, { status: 'supported' }>
  | Readonly<{ status: 'error'; error: SdkError }>;
```

Normal user-facing compiler outcomes are data. The existing parser already distinguishes missing/syntactic information, unavailable operations, and inconsistent plans; retain those distinctions. Broad SDK error categories should be a closed TypeScript union; original compiler diagnostic codes can remain open while the kernel and grammar evolve. Do not manufacture structured paths by parsing generic anatomy/core error text: use the stage, a broad error code, and the original message.

All public fallible functions catch legacy exceptions and normalize them. If throwing convenience functions are desired later, add an explicit `unwrap(result)` and `QuinelingError`, rather than mixing exception and result styles across operations. Transport startup/listen errors belong to transport APIs, not compiler outcomes. Do not put raw causes, stack traces, arbitrary thrown objects, or input payloads into serialized errors.

## Typed plans and inspectable compiled artifacts

```ts
export type Json =
  | null | boolean | number | string
  | readonly Json[]
  | { readonly [key: string]: Json };

export type ValueType =
  | Readonly<{ kind: 'number'; unit: string }>
  | Readonly<{ kind: 'boolean' | 'string' | 'null' }>
  | Readonly<{ kind: 'array' | 'optional'; element: ValueType }>
  | Readonly<{ kind: 'record'; fields: Readonly<Record<string, ValueType>> }>;

export type IntentIR = Readonly<{
  format: 'quineling-intent';
  name: string;
  thought: string;
  inputs: readonly Readonly<{ id: string; value: Json; type: ValueType }>[];
  steps: readonly IntentStep[];
  outputs: readonly string[];
  assumptions?: readonly string[];
}>;

export type SourceMapEntry = Readonly<{ nodeId: string; clause: string }>;

export type CompiledThought = Readonly<{
  intent: IntentIR;
  graph: TaskGraph;
  contract: Readonly<{
    format: 'quineling-contract';
    registry: string;
    types: Readonly<Record<string, ValueType>>;
    assumptions: readonly string[];
    effectMode: 'pure' | 'simulation';
    sourceBytes: number;
    provenance: string;
  }>;
  sourceMap: readonly SourceMapEntry[];
  diagnostics: readonly Diagnostic[];
}>;
```

`Json` excludes undefined and functions statically; runtime validation must also exclude nonfinite numbers, accessors, hidden/symbol properties, cycles, sparse arrays, unsafe keys, and nonplain objects before cloning. These requirements already exist in the intent compiler. Do not JSON-stringify first: that invokes getters/toJSON and silently removes invalid values.

Make `IntentStep` a discriminated opcode union, not `{ op: string; params: Record<string, unknown> }`. `literal` belongs to task graph nodes and intent inputs, not intent steps. Export a central `ParamsByOp` map and derive node unions from it:

```ts
export interface ParamsByOp {
  sum: Readonly<Record<string, never>>;
  weightedMean: Readonly<Record<string, never>>;
  map: Readonly<{ kind: 'square' }> | Readonly<{ kind: 'multiply'; factor: number }>;
  compare: Readonly<{ operator: Comparison; value: Json }>;
  action: Readonly<{ allowed: boolean; action: string }>;
  report: Readonly<{ labels: readonly string[] }>;
  // Include every currently supported operation, from the kernel registry.
}
export type StepFor<K extends keyof ParamsByOp> = Readonly<{
  id: string; op: K; inputs: readonly string[]; params: ParamsByOp[K];
}>;
export type IntentStep = {
  [K in keyof ParamsByOp]: StepFor<K>
}[keyof ParamsByOp];
```

Arities, numeric refinements, reference validity, and graph-wide units remain runtime compiler obligations. Do not promise statically inferred output values for arbitrary text or unknown imported plans. The contract's `types` table is the inspectable inferred answer. Optional means nullable in this framework, not a missing record field.

## Lifeforms, identity, and provenance

```ts
export type CreateOptions = Readonly<{
  seed?: number;                // uint32; deterministic default 0
  repeats?: number;             // integer 1..8; default 1
  design?: Design;              // complete authored QDL record
}>;

export type Lifeform = Readonly<{
  format: 'quineling-lifeform';
  sourceId: string;             // sha256:<hex> of exact UTF-8 canonical source
  canonicalSource: string;
  program: ProgramAst;
  graph: TaskGraph;             // extracted embedded graph, including design
  design: Design;
  thought: CompiledThought | null;
  metadata: Readonly<{
    sdk: string;
    kernelRegistry: string;
    anatomyCompiler: string | null;
  }>;
}>;

export type LifeformBundle = Readonly<{
  format: 'quineling-lifeform-bundle';
  canonicalSource: string;
  sourceId: string;
  thought: CompiledThought | null;
  metadata: Lifeform['metadata'];
}>;
```

The canonical source is authoritative. Graph and design views must be extracted from that source and validated, not independently editable copies that might disagree with the executable program. Thought, units, assumptions, and source maps are companion provenance: the present constructor does not embed them. Their presence must not imply that the quine reproduced them. On import, validate provenance against the extracted executable graph or reject an inconsistent companion; recompilation should compare executable content independently of attached design. A source-only import can legitimately have `thought: null`.

Source identity includes the authored design and repeat count. It excludes the SDK package version, timestamp, selected lens, current phase, and run selection. SHA-256 identifies exact source; it does not certify semantic correctness, safety, or agreement with English. Existing genome checksums serve codec corruption checks, not artifact authentication.

Metadata records which experimental implementation produced an artifact without freezing that implementation. Tags such as `quineling-kernels-experimental`, `qdl-assembly-experimental`, and QDL's existing prototype marker retain their current meanings. Import either validates under the current runtime or reports an unsupported compiler/format. It must not claim archived rendering fidelity because an old package string happens to match.

## Run records and rendering

```ts
export type RunRecord = Readonly<{
  format: 'quineling-run';
  sourceId: string;
  occurrences: readonly TaskOccurrence[];
  emittedSources: readonly string[];
  trace: readonly InterpreterEvent[];
  steps: number;
}>;

export type TaskOccurrence = Readonly<{
  index: number;               // zero-based task occurrence, consistent with arrays
  outputs: readonly Json[];   // retain declared output order
  trace: readonly Readonly<{
    nodeId: string; op: KernelOp; inputs: readonly Json[]; value: Json;
  }>[];
  simulatedEffects: readonly SimulatedReceipt[];
}>;

export type FrameOptions = Readonly<{
  phase: number;               // radians, matches anatomy.js
  budget?: number;             // integer 4000..24000, default 12000
  crests?: number;             // integer 2..4, default 3
}>;

export type FrameSnapshot = Readonly<{
  sourceId: string;
  phase: number;
  points: readonly number[];   // stride 4: x, y, z, alpha
  normals: readonly number[];  // stride 3
  owners: readonly number[];   // index into ownerNodeIds
  ownerNodeIds: readonly string[];
  ridges: readonly Ridge[];
  bounds: PortraitBounds;
}>;
```

Keep all repeated task occurrences. Selecting only `tasks[0]` loses results and receipts for repeats 2..8. Trace node IDs come from the kernel's current `edge` field; normalize that name at the SDK boundary. Outcomes such as retry `uncertain`, evidence `conflict`, or action `skipped` are successful domain results and must not become SDK failures. `simulatedEffects` names the authority correctly; never accept an executor callback that quietly turns current local action kernels into external effects.

Do not introduce execution overrides initially. Existing `K.run(graph, overrides)` replaces literals without rerunning the intent compiler's unit/refinement proof. If needed, offer a separate `withInputs(thought, replacements)` that edits copied intent inputs, recompiles, constructs a new lifeform, and returns its new source identity. Never assign an original source ID to a substituted graph.

If recorded-value coloring is exposed, require both run source equality and an explicit occurrence index. A stale record should have an explicit stale state; do not default to a numeric zero. Frame and view selection do not mutate the authored design.

## Immutability implementation requirements

Use independent clones and recursive freezes for every public JSON artifact, including diagnostics, successful results, run traces, and exported bundles. `Readonly<T>` alone is shallow and only helps TypeScript callers. Never freeze caller-owned objects in place. Private compiled anatomy/cache handles belong in a `WeakMap`, not public enumerable fields.

Nonempty typed arrays cannot be frozen into immutable buffers with `Object.freeze`. For the ordinary inspectable API, convert frame buffers to plain arrays and recursively freeze them. If performance requires typed arrays, add a separately named buffer API that returns new caller-owned buffers on every call and describes them as mutable snapshots. Never return a cache's internal arrays as allegedly immutable views. Also avoid exposing `Map`/`Set` as frozen public data: freezing their object does not disable mutating methods.

Public functions must not trust a structural `Lifeform` cast. Revalidate imported/constructed data and source consistency or use an internally authenticated handle for already-created artifacts. Import can establish that handle after validation; inspectable plain JSON remains exportable. Immutable objects make validation caching safe only after independent cloning and deep freezing.

## Practical first implementation and acceptance checks

Implement parse/compile/create/execute/import/export/verify first; rendering is optional if the current SDK lacks a frontend consumer. Export all named artifact interfaces from the root package. Put MCP/A2A adapters behind subpath exports so importing the pure core does not start a listener or load a transport framework.

Meaningful checks: supported/clarify/unsupported/inconsistent parser cases; unit mismatch and source budget diagnostics; caller input mutations cannot affect an artifact; nested artifact mutations fail; export/import canonical source equality; tampered graph/provenance/source/hash rejection; repeated occurrences retained; source-only provenance remains absent; pure and skipped/simulated action outcomes retained; two frame snapshots do not share mutable buffers; phase/frame sampling leaves task execution untouched. Verify source reproduction with exact canonical string equality across fresh generations rather than a hash alone.

Local evidence inspected: `thought.js` parse outcomes, typed compile/refinement validation and companion contract; `core.js` constructor quine, canonical codecs, repeated execution and source ceiling; `anatomy.js` private compiled-set validation, deterministic generation, typed-array frame output; `kernels.js` task trace and simulated receipts; `docs/PROGRAM-CONTRACT.md`, `docs/THOUGHT-TO-LIFEFORM.md`, and `docs/QDL.md` artifact and view semantics. No external research or deployment was required.

## Follow-up audit of the selected Runtime

The updated implementation has discriminated parse/creation outcomes, per-op input tuple and parameter types, private stores, detached return copies, exact SHA-256 source IDs, full authored source byte counts, and explicit parent record checks. Reproduction retains all occurrences and executes a fresh source-decoded program. Duplicate admissions preserve their first source map/companion; differing companion intents for an existing canonical source raise `metadata-conflict`. These changes satisfy the main boundary concerns above under the selected mutable-copy contract.

Two concrete remaining issues were sent to root for correction:

1. `Request` groups `inspect` and `run` into one member with `operation: 'inspect' | 'run'`. The mapped `TaggedResponse` uses `Extract<Request, {operation: O}>`; extraction for either individual operation yields `never`. Split those request members, so tagged inspection and execution results have their intended types.
2. `propose` checks only that diagnostics and assumptions are arrays. It needs to validate diagnostic entries (`code`, `path`, `message` strings), assumptions strings, and non-supported source mapping entries before returning typed `CreationResult`. Otherwise a provider can return inert JSON such as `diagnostics: [7]` or `assumptions: [false]`, and the SDK publishes data inconsistent with its public types. Bound metadata strings/collections using the current compiler limits.

No production files were changed during this audit. These are findings against the inspected in-progress revision; root may resolve them concurrently.
