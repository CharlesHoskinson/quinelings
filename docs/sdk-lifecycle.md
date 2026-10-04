# Experimental SDK: types and lifecycle

The agent SDK separates thought interpretation, canonical executable source, execution evidence, and presentation. The SDK and QDL source language remain experimental; package revisions and current format identifiers do not freeze the language.

The stateful `Runtime` owns bounded artifact and execution-record stores behind ECMAScript private fields. Its original operation vocabulary is `parse`, `compile`, `create`, `inspect`, `run`, `reproduce`, `recover`, and `frame`; adapters use the same operations through `dispatch`. `dispatch` infers the result type from the request operation; `exchange` adds an operation tag for consumers that need to narrow a response union. See [`types.ts`](../packages/agent-sdk/src/types.ts) for exported declarations and [`index.ts`](../packages/agent-sdk/src/index.ts) for runtime behavior.

## Data boundary

Import and transport payloads require runtime validation, even when a TypeScript caller declares their shape. JSON must be finite, acyclic, plain, dense, bounded, and free of accessor/symbol/prototype hazards. A TypeScript `number` cannot establish a finite range, symbolic unit, positive total weight, or integer tick sum.

`Intent` supplies typed input literals, operation steps with ordered input IDs, outputs, and optional assumptions. Its `IntentStep` union encodes operation-specific parameter shapes and fixed input-port tuple arities. `IntentType` distinguishes numeric units, booleans, strings, null, arrays, records, and nullable `optional` values. Nullable does not mean a record key can be omitted. Compilation validates operation parameters, references, units, refinements, reachability, eager action restrictions, and capability availability.

Parser status is `supported`, `clarify`, `unsupported`, or `inconsistent`. `ParseResult` and `CreationResult` are discriminated unions: a supported result carries an intent or artifact respectively; an unsuccessful result does not. Only a supported interpretation can become an artifact. Preserve status, compiler diagnostic codes, paths, and assumptions in agent responses. Do not turn an unresolved thought into a fabricated successful task. Compilation may evaluate pure kernels to establish refinements; those preview values are compiler evidence, not an execution record.

## Artifacts and records

An `Artifact` contains complete canonical source, its SHA-256 artifact ID, validated program/graph/design, harmonic and color genomes, a source map, and available companion intent/contract. `contract.sourceBytes`, when present, counts UTF-8 bytes of the complete source including authored anatomy and duplicated constructor payload. Canonical source remains the authoritative identity. The genome's 32-bit checksum is an integrity check, not the artifact ID or an authenticity proof.

An `ExecutionRecord` has its own record ID, an artifact ID, exact source, and an `ExecutionResult`. The result includes `tasks`, ordered `emitted` source, interpreter trace, and step count. Each task is an ordered execution cycle containing ordered outputs, node trace, simulated effects, and the graph actually run. Keep the cycle dimension even when repeat count is one.

A supplied record is not evidence of local execution merely because its source hash matches. Runtime-generated records bind source to actual runtime evidence. Results exported across a transport are snapshots; mutating one cannot change committed source or store state.

By default the runtime retains at most 128 artifacts and 256 records; constructor configuration allows limits up to 1,024 artifacts and 4,096 records. Full stores reject new entries without silently evicting history. Complete serialized execution records are limited to 2 MiB each and 64 MiB in aggregate. Run checks both byte budgets before publishing a record. Reproduce stages artifact preparation and its execution record together; a refusal publishes neither. The interpreter still constructs its raw finite result before this SDK size check. IDs refer to the current runtime instance's retained state; they are not persistent URLs. Store source/genomes separately when later recovery is needed. Recovery in a new runtime recreates an artifact without an earlier execution history or original companion interpretation. Within the same runtime, an existing source reuses its artifact ID and stored companion metadata.

Companion admission has three outcomes:

- A source with no companion, including one admitted by `recover`, can receive its first intent, source map and contract through a later matching `compile` or supported `create`. Compilation must regenerate exactly the same canonical source. Its ID and existing execution records remain unchanged.
- Re-admitting the same canonical intent reuses the stored companion. A newly supplied source map does not replace the first admitted one.
- A different canonical intent for that same source raises `metadata-conflict`, preserving the existing artifact and companion. Thought wording, unit annotations and assumptions can cause this conflict even when executable bytes are identical. Separate runtimes can retain separate interpretations. Intent equality uses canonical JSON, not semantic normalization: equivalent unit spellings and omitted versus empty assumptions can still conflict.

There is no separate attach operation and no automatic recovery of prose. Supply the intent and matching compilation choices explicitly. Earlier returned snapshots remain unchanged when the stored artifact gains its first companion.

## Lifecycle

| Operation or action | Source identity | Execution evidence |
| --- | --- | --- |
| `parse` | No executable source yet | No run |
| `compile` or supported `create` | Validated canonical artifact | No run |
| `inspect` | Same committed source | No run |
| `frame`, animation seek, camera, node selection | Same source | No run; prior record stays associated |
| `run` | Same source | New execution record with all task cycles |
| Change literal, graph name, repeat count, anatomy, gesture, or authored QDL | New source and artifact ID | Previous record is stale for this artifact |
| Change companion prose only | Same source if executable fields stay unchanged; conflicting intent rejected in the same runtime | Source association remains; prose needs separate review |
| `recover` from source/harmonics/colors | Recovered canonical source | No recovered run history |
| Matching `compile` after metadata-free recovery | Same source and ID; first companion attaches | No new execution record |
| `reproduce` from artifact and its specific parent record | Child source must equal parent source | Fresh child run, linked to parent record |

The runtime validates the complete 64 KiB constructor source ceiling, including duplicated payload. Literal inputs, graph name, repeat count, anatomy, gesture, and other authored QDL fields are embedded in that source. Phase, camera, paused state, selected node, and selected result cycle are view state and do not modify identity.

Source-matched result presentation requires `record.source === artifact.source`, an existing selected task cycle, and a valid finite value for the declared scalar binding. A scalar-presentation client must distinguish missing, stale, invalid, underflow and overflow; the current SDK `frame` returns role colors and does not resolve recorded scalar lenses. Missing execution is different from a successful zero, false, null, empty array, or skipped action.

`action` computes a simulated or skipped value. Only simulated receipts enter the task effects list; neither state grants authority for a real-world action. Fixtures using low-level `runTask(graph, overrides)` must attribute results to the graph actually run. Public source-bound runs execute committed source: compile changed literals into a new artifact first.

## Frame and provider contracts

`frame(artifactId, phase, options)` evaluates an authored assembly gesture at a phase in radians; one cycle is `2 * Math.PI`. The direct runtime accepts finite phases with magnitude at most `1e9`. Seeking to the same phase is deterministic. A phase one cycle apart represents the same mathematical pose, with floating-point rounding possible; do not require byte identity for all equivalent phase arguments. Transport schemas may impose a narrower phase range.

Frame budgets are integer tissue sample counts from 4,000 to 24,000; crest counts are integers from 2 to 4. Defaults are 12,000 samples and 3 crests. The returned detached arrays contain:

| Field | Meaning |
| --- | --- |
| `points` | Unprojected `[x, y, z, alpha]` groups, four numbers per tissue sample |
| `normals` | `[nx, ny, nz]` groups, three numbers per sample |
| `owners` | One node index per sample |
| `nodeIds`, `nodeRoles`, `nodeColors` | Parallel node identifiers, role names and role-palette RGB hex colors |
| `ridges` | Crest polylines whose points contain position, normal and the same owner index |

`nodeColors` honors authored chroma strength and neutral ink through the shared color contract. Omitted chroma or zero strength produces neutral ink. These are role colors, not encoded source bytes or source-matched measured quantities. The frame API accepts no record, task cycle or scalar lens selection. Its sample-layout cache retains at most two budgets per compiled body; a different valid budget cannot retain an unbounded sequence of plans.

`runtime.propose` accepts a `ProposalProvider` returning a `ParseResult`, validates its diagnostics and source-map references, and recompiles a supported intent. Source-map node IDs and optional spans are checked; that does not establish that a provider's wording correctly interprets the user's English. `propose` is a direct asynchronous runtime hook, outside the sixteen-operation `dispatch` union.

Aborting its signal rejects a pending proposal with `QuinelingError` code `cancelled` even when the provider ignores that signal or its promise remains pending. Late resolution cannot admit an artifact. Forward the signal to the provider's underlying I/O as well: the runtime cannot forcibly stop remote work, charges or synchronous JavaScript. Proposal acceptance remains separate from explicit task execution.

## TypeScript examples

The following examples use the exported request union, which fixes operation names and required IDs. A runtime caller can use direct methods or the equivalent `dispatch` request.

```ts
import { Runtime, type Intent, type Request } from '@quinelings/agent-sdk';

const runtime = new Runtime();
const intent: Intent = {
  format: 'quineling-intent',
  name: 'Measured total',
  thought: 'Sum the supplied volumes.',
  inputs: [{ id: 'volumes', value: [2, 4, 6],
    type: { kind: 'array', element: { kind: 'number', unit: 'L' } } }],
  steps: [{ id: 'total', op: 'sum', inputs: ['volumes'], params: {} }],
  outputs: ['total'],
  assumptions: [],
};

const compileRequest = { operation: 'compile', intent,
  options: { seed: 42, repeats: 1 } } satisfies Request;
const artifact = runtime.dispatch(compileRequest); // Inferred Artifact.
const record = runtime.dispatch({ operation: 'run', artifactId: artifact.id });
console.log(record.result.tasks.map(task => task.output)); // [[12]]
```

Interpretation can stop before execution:

```ts
const interpreted = runtime.parse('numbers [2,4,6] | sum');
if (interpreted.status === 'supported') {
  const artifact = runtime.compile(interpreted.intent);
  // Compile, inspect, and frame do not create execution records.
  const geometry = runtime.frame(artifact.id, 0, { budget: 4000, crests: 2 });
  console.log(geometry.nodeIds);
} else {
  console.log(interpreted.status, interpreted.diagnostics);
}
```

For a tagged response, narrow its operation before reading the payload:

```ts
const response = runtime.exchange({ operation: 'frame',
  artifactId: artifact.id, phase: 0, options: { budget: 4000, crests: 2 } });
if (response.operation === 'frame') console.log(response.result.nodeIds);
```

Commit changed data before running, and keep earlier records as history:

```ts
const revised: Intent = {
  ...intent,
  inputs: [{ ...intent.inputs[0]!, value: [3, 5, 7] }],
};
const changed = runtime.compile(revised, { seed: 42, repeats: 1 });
console.log(changed.id === artifact.id);     // false
console.log(record.source === changed.source); // false: stale for changed
const changedRecord = runtime.run(changed.id);
console.log(changedRecord.result.tasks.map(task => task.output)); // [[15]]
```

Recover source without pretending to recover provenance or old results, then explicitly run when needed:

```ts
const freshRuntime = new Runtime();
const recovered = freshRuntime.recover({ source: artifact.source });
console.log(recovered.source === artifact.source); // true
console.log(recovered.intent); // undefined
const attached = freshRuntime.compile(intent, { seed: 42, repeats: 1 });
console.log(attached.id === recovered.id); // true: first companion attached
console.log(attached.intent?.thought); // Sum the supplied volumes.
console.log(recovered.intent); // Still undefined in the earlier snapshot.
const recoveredRun = freshRuntime.run(recovered.id);

const child = runtime.reproduce(artifact.id, record.id);
console.log(child.artifact.source === artifact.source); // true
console.log(child.record.parentRecordId === record.id); // true
```

Recovery takes exactly one of `source`, `harmonics`, or `colors`, as expressed by `RecoveryInput`. Source-text recovery parses JSON and returns canonical source: harmless JSON whitespace changes do not create a different artifact ID. A verified fresh generation requires the current parent artifact and a specific matching parent execution record; a previous-source record cannot verify the new artifact.

## Failure and verification

Invalid build/import/run requests raise validation or runtime errors rather than return empty successful task outputs. Adapters should preserve semantic failure distinctly from transport success. An unsuccessful thought interpretation remains an explicit status with diagnostics. A failed proposal or import must not replace an existing valid artifact.

Source emission, lossless genome recovery, fresh construction, and output agreement are separate evidence. Source verification requires exactly one emitted source equal to the complete canonical source. Reproduction parses and validates the matching parent's emission, executes it again, verifies its emission, and compares all ordered task-cycle outputs with the parent's. Identical source reuses the stored artifact ID; the execution record is fresh and links to its parent record. A matching first output alone is insufficient.

Thought text, type/unit annotations, assumptions, and source-map prose are companion metadata in the current compiler. Recovery can inspect the graph and source-authored design, but it cannot reconstruct the original English interpretation. Source reproduction is not a proof that a program matches arbitrary prose or that its body is aesthetically successful.

## Ranch lifecycle extension

The Runtime now exposes sixteen dispatch operations. See the [API reference](sdk-api.md) and [ranch guide](SDK-RANCH-GUIDE.md) for offspring preview/frame/admission, annotation, lineage and world operations. Preview and frames are stateless and passive; admission stores source/evidence without a task run. First companion attachment through annotation or existing compile also invalidates affected social epochs/proposals atomically. Successful compound birth commits one public world revision. Aggregate serialized artifacts are bounded at 32 MiB in addition to count caps; session derivations and admission retry receipts are separately bounded.
