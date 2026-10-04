# QDL 1 — Living Thoughts

Status: stable QDL 1 for bounded deterministic task computation with simulation-only effects in a single-owner local Session. The frozen `qdl-program` version 1 profile uses `qdl-kernels-1` at registry digest `43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3`. Supported acceptance environments are Node 22/26 and Chromium; the tested versions are recorded below. SDK 1.0.0 exposes this profile through explicit v1 entry points. The default/legacy API and ranch collaboration policies remain experimental. The SDK is distributed as a release tarball and has not been published to npm.

Quinelings turns a declared task into a visible, inspectable lifeform. A Living Thought carries its public declaration, typed executable graph and authored body in exact reproducible source. Its recorded values come from an explicit Run. Validation checks structure, types, units, references, bounds and effect boundaries; it does not certify facts, recover private model reasoning or guarantee agreement with arbitrary English.

Implementation references: [interpreter](../qdl-v1.js), [types](../qdl-v1-types.js), [task contract](../qdl-v1-contract.js), [new kernels](../qdl-v1-kernels.js), [registry](../qdl-v1-registry.js), [SDK entry point](../packages/agent-sdk/src/v1.ts). See [the recipe library](QDL-V1-LIBRARY.md), [visual design language](QDL.md) and [legacy author contract](PROGRAM-CONTRACT.md).

## Source, input and view

The executable source is the existing quotation/constructor AST containing two identical quoted copies of a closed payload. The payload is:

```text
{
  format: "qdl-program", version: 1,
  name, registry: "qdl-kernels-1", registryDigest,
  canonical: "qdl-json-1",
  thought, task, design, repeats
}
```

Every field is required. The source includes the complete thought declaration, normalized node types, constants, runtime-port declarations, graph, full design and repeat count. Admission requires the exact constructor shape and matching copies, the current registry pin, normalized source types and valid design bindings. A plain payload record is not an executable quine.

Runtime inputs are a separate exact named snapshot. Changing a snapshot changes its `inputHash` and may change the result; it MUST NOT change canonical source, `sourceHash` or either exact genome. An authored `literal` is immutable during invocation. Changing a constant, declaration, type, policy or design creates different source. There are no implicit port defaults: an optional value is supplied explicitly as `null`.

Selection, phase, pausing, inspection and replay are presentation state. They do not perform a Run. Source-only constructor verification, source encoding and source recovery do not evaluate task nodes. A displayed value must be associated with the matching source and recorded occurrence; an absent, invalid or stale value must remain distinguishable from numeric zero or evidence `unknown`.

## Building a task

`QDLV1.compile(intent)` and SDK `Session.compile(intent)` accept the following closed authoring record:

```text
{
  format: "qdl-intent", version: 1, name, thought,
  inputs: [{id, type, name} | {id, type, value}],
  steps: [{id, op, inputs, params, type?}],
  outputs: [nodeId, ...],
  design?, repeats?
}
```

Each input declares exactly one runtime `name` or authored `value`. A computed step can omit `type` during construction; the compiler infers its structural result and writes a normalized type into source. A supplied step type can add runtime refinements. String `thought` is a bounded description: it becomes a declaration with one task covering the graph. It is not interpreted as instructions. A structured thought preserves the six declaration classes below.

When no design is supplied, the intent compiler generates deterministic source-authored assembly anatomy and gesture. Low-level `build({name,thought,task,design?,repeats?})` accepts an already typed task; its omitted-design default is the existing family design rather than the compiler's generated assembly. Design validation and geometry inspection remain separate from task correctness.

A compiled task has exactly `{format:"qdl-task",version:1,nodes,outputs}`. Every admitted node has exactly `{id,op,inputs,params,type}`. IDs are unique ASCII identifiers matching `[A-Za-z][A-Za-z0-9_-]{0,63}` with prototype keys forbidden. Runtime names use the same identifier grammar and are unique. Inputs are ordered producer IDs, outputs are ordered unique node IDs. The finite graph must be acyclic and every node must contribute to an output.

Admission computes deterministic first-ready order in the source node array. The intent compiler resolves authoring steps into a typed node array before admission; it is that committed array which fixes runtime order. Unknown fields, operations, references or parameter names are errors. Static checking compares output structure and symbolic units while erasing refinements. Actual literals and selection defaults must meet their full types; computed refinements are checked when their results exist. Admission executes no sample task and does not prove every possible binding succeeds.

## Public declaration

`thought` contains exactly six arrays. Empty arrays are permitted, although task coverage of executable nodes is mandatory. Declaration IDs are unique across all classes.

| Class | Exact record fields | Interpretation |
| --- | --- | --- |
| Observation | `id,text,input,path,basis` | A public statement referring to an input or literal node; basis is confirmed/testimony/suspected/open |
| Evidence | `id,claim,source,observation,value` | Authored Boolean assertion linked to an observation; source identity and factual truth remain assertions |
| Goal | `id,text,outputs,completion` | Desired result; completion names an explicitly exported Boolean node |
| Decision | `id,text,guard,evidence` | Public decision statement with a Boolean node and evidence-declaration references |
| Plan | `id,text,tasks` | Ordered explanatory task references, without extra execution control |
| Task | `id,text,nodes,outputs` | Nonempty executable node/output references; every graph node must be covered |

Observation `path` is an array of up to eight own-property segments. Record segments are exact string keys; array segments are integers 0–511. Paths cannot cross optional values. A declaration can reference source-authored data, so even basis `confirmed` is not a cryptographic certificate of a world observation. Goal completion is structurally Boolean; authors must connect it to an appropriate result predicate rather than an unsupported assertion. A saved plan and a simulated action do not establish mission completion.

There are at most 32 records per class, 96 in total, 64 unique references per reference array, 512 Unicode scalar values per text/claim/source field and 120 for program names. The complete-source budget can be reached before these individual maxima.

## Types and quantities

Every type record is closed; unknown fields fail.

| Type | Required fields | Optional refinements |
| --- | --- | --- |
| number | `kind:"number",unit` | `integer` Boolean, finite inclusive `min`, finite inclusive `max` |
| string | `kind:"string"` | unique `enum` of at most 32 strings, nonnegative `minLength`, `maxLength` |
| boolean/null | `kind` | none |
| array | `kind:"array",element` | nonnegative `minLength`, `maxLength`, `uniqueBy` |
| optional | `kind:"optional",element` | none |
| record | `kind:"record",fields` | none; exact fields are required |

`integer:true` requires a safe integer, including negative values unless a minimum is declared. Documentation shorthand `Nat[u]` means number in unit `u` with `integer:true,min:0`; `N[u]` means finite number in unit `u`. `optional(T)` admits T or explicit null, not an omitted record field. Empty arrays need explicit element types; inference refuses them. An empty string enum is a valid refinement admitting no string. Array `uniqueBy` names one required record-element field and compares its canonical values; it is not a dotted path.

Units are symbolic products, normalized by sorting bases, summing integer powers and removing zero powers; `one` is dimensionless. Exponents are bounded to ±99 and expressions to 64 ASCII characters. For example, `item*batch^-1` normalizes to `batch^-1*item`. `L` and `mL`, `item` and `crystal`, or `tick` and `second` remain distinct. No ambient conversion, currency rate or physical equivalence is inferred.

All numbers are finite IEEE 754 binary64. Checked reductions run left to right; relevant integer intermediates are checked for safe-integer overflow. Division rejects zero. Negative zero serializes as zero. Exact equality is canonical JSON equality over compatible structural types; ordered comparisons accept matching-unit numbers or strings. Strings compare in UTF-16 lexicographic order, and `length` counts UTF-16 code units (`"😀"` has length 2). Text is preserved without Unicode normalization.

Inference commonly drops refinements from computed output types. Declare a computed type explicitly when later arithmetic should retain a Nat/safe-integer obligation. This is a runtime check, not an unproved static claim that an upstream calculation always satisfies it.

## Operations and deterministic policy

The frozen registry contains 24 retained names and seven additions. Retained names operate under the strict new graph contract; this does not make every legacy graph admissible.

```text
literal sum mean min max weightedMean length map sort dedupe filter compare
choose get clamp budget action report bfs allocate schedule consensus retry evidence
input arithmetic compareValues all select evidenceFresh reconcile
```

Every operation has a fixed arity and closed params; `report` takes 0–16 ordered values. The exact checker is [qdl-v1-contract.js](../qdl-v1-contract.js). Important policies are:

- `choose` is eager. Both producers must be safe even when their value will not be selected. Compatible alternatives may merge with explicit null into an optional type; arbitrary unions are unavailable.
- `sum([])=0`; empty mean/min/max fail. Weighted means require equal nonempty arrays, nonnegative weights and positive finite mass.
- Sort is stable; dedupe keeps the first canonical key/value. Allocation is request ordered. BFS uses ordered neighbors and shortest edge count, with blocked endpoints returning no route. Scheduling uses first-ready input job order and parallel earliest starts; it does not model resource contention.
- Consensus counts one vote per source and resolves ties by first-seen choice. Stable `evidence` requires one authored claim and retains first source+claim report. These source strings do not prove independence.
- `retry` consumes supplied retry/ok/unknown outcomes with maxAttempts 1–8. Unknown stops; it submits nothing.
- `arithmetic` has add/sub/mul/div/floorDiv/min/max. Add/sub/min/max require equal units; multiplication and division compute symbolic units. Floor division requires nonnegative safe-integer values and a positive denominator at runtime.
- `compareValues` compares two supplied compatible values. `all` takes one Boolean array, with empty true. Recipes requiring a meaningful set of checks must declare a nonempty length refinement.
- `select` takes rows and an exact query record. Params are `{keys,order,default}`; keys are top-level own names and ordering rules are `{path,descending}`. Equal order keys retain original row order. The result is `{found,value,index}`; no match returns the authored typed default and null index. The default is policy, not an observation.

Kernel paths are dotted own-property paths with at most eight safe segments, each at most 64 Unicode scalar values. Legacy get/sort/filter/dedupe can traverse bounded array indices; select ordering traverses record paths. Prototype names are forbidden. Paths across optional values are not supported; eager choose cannot hide a missing-property error.

`evidenceFresh` receives `[records,claim,clock]` and `{allowedKinds}`. Records are exactly `{id,source,claim,value,kind,observedAt,revision}`; value is Boolean or null, kind observation/testimony/inference, times use Nat[tick], revision Nat[revision]. Clock is `{now,maxAge,minRevision}`. Source/claim/IDs are nonempty. IDs are unique. It keeps matching allowed non-null records observed no later than now, age ≤ maxAge and revision ≥ minRevision. Skip reason precedence is claim, kind, unknown, future, stale, revision. Complete records remain in `used` or `skipped`. A source reporting both polarities contributes once to each and appears in `sourceConflicts`; support+refute can exceed source count. Returned states are unknown/supported/refuted/conflict. There is no implicit clock or source authentication.

`reconcile` receives `[receipts,policy]` and `{}`. Receipts are exactly `{id,operation,attempt,sequence,status,units}`; policy is `{operation,requested,maxAttempts}`. Sequences use Nat[revision], units/requested Nat[item], attempts Nat[count] bounded 1–8. Matching-operation exact repeated IDs collapse; differing data for one ID fails. Sequence order defines each attempt's history; conflicting equal sequences or terminal regressions fail. Confirmed units must be positive; other statuses must have zero units. Each confirmed attempt counts once. State precedence is unknown, pending, completed by quantity, exhausted by attempts, ready for zero attempts, then retryable. Zero requested with no attempts is completed. Unknown/pending forbid retry advice while retaining partial confirmed quantities. `mayRetry` is advice about supplied history, not permission to dispatch.

## Simulation, failures and bounds

`action` accepts `[BooleanGuard,payload]` with `{allowed:Boolean,action:label}` and returns `{status:"simulated"|"skipped",action,payload}`. It performs no network, world, filesystem or credential operation. Source `allowed` grants only local simulation. Guard and payload ancestor cones must be pure. Any action in either choose alternative's ancestor cone is invalid, including through another pure node. These restrictions apply through shared task admission.

Receipts are staged per occurrence. A successful occurrence publishes its ordered outputs and staged simulated effects. If a node, type check or byte limit fails, that occurrence has `status:"failed"`, empty outputs/effects, completed trace entries and a diagnostic. Completed simulated action trace entries are not published effects. Earlier successful occurrences remain; later occurrences do not run. Every repeat receives the same immutable snapshot; repeats are finite task occurrences, not automatic external retries.

Invalid source or bindings throw structured errors with `code,path,message` before a task record is returned. Runtime computation failures return a failed run with diagnostic `{code,path,nodeId,occurrence,message}`. Codes include identity, unsupported-registry, missing-input, unknown-field, type, unit-type, refinement, nonfinite, limit, eager-effect and kernel-specific receipt-conflict. Paths use both bracket and dotted forms depending on the checking layer; messages are explanatory text. SDK `QdlError` carries these fields; schema refusals may use invalid-input and SDK capacity refusals resource-limit. Use the appropriate structured code, not a message-string match.

| Bound | Candidate limit |
| --- | --- |
| Complete canonical constructor source | 65,536 UTF-8 bytes, including both payload copies |
| Individual JSON value | 65,536 canonical UTF-8 bytes |
| JSON nesting / array or record entries | depth 24 / 512 |
| String or property-name size | 16,384 UTF-16 code units |
| Graph / node input ports / outputs | 64 / 16 / 16 |
| Repeat occurrences | 1–8 |
| Complete low-level semantic run | 2 MiB, with 8 KiB diagnostic reserve |

The limits intersect. A deeply nested value consumes wrapper depth in an enclosing source or request. The interpreter measures the actual serialized run, including emitted source and trace copies; it fails rather than truncating evidence. Trace size is bounded by bytes as well as node counts. Dense native arrays, plain/null-prototype records and enumerable own data properties are admitted; cycles, nonfinite values, symbol/accessor/hidden properties, unsafe prototype keys and malformed Unicode fail. Reflection cannot sandbox hostile same-process Proxy handlers; parsed JSON is the external data boundary.

## Registry and exact identity

`qdl-json-1` sorts record keys in UTF-16 order and uses ECMAScript JSON serialization for primitives. Array order is significant. Admission of source text requires it to equal the reserialized canonical constructor bytes; duplicate textual keys and alternate encodings fail that equality. A parsed host object cannot reveal textual duplicate keys already discarded by its parser. This named profile is not a claim of complete RFC 8785 interoperability.

The source commits `qdl-kernels-1` and its SHA-256 manifest digest. The manifest pins bounds, policies, operations and implementation hashes. A different pin is rejected by the current interpreter; there is no registry fallback. QDL 1 freezes the digest above and its reviewed source/genome vectors. A semantic, signature, bound, diagnostic or pinned implementation change requires a separately identified reviewed registry and explicit new artifact construction; it cannot silently replace this pin. Normal checks verify the registry rather than regenerate it.

`sourceHash` is `ql_` followed by SHA-256 of canonical source; `inputHash` is `qi_` followed by SHA-256 of canonical bindings. Input values live in the run, not the source. Harmonic and RGB genomes preserve exact source; sampled harmonic recovery has explicit coefficient/residual tolerances in the existing codec. Checksums detect corruption, not historical authorship or external authenticity. Decoding bytes and admitting executable source are separate operations.

## SDK workflow and session behavior

The explicit package entry point is `@quinelings/agent-sdk/v1`; legacy package entry points retain their separate experimental API. This example uses SDK 1.0.0 once built or installed from the retained release tarball:

```ts
import {Session, sourceOnly} from '@quinelings/agent-sdk/v1';

const session = new Session();
const artifact = session.compile({
  format: 'qdl-intent', version: 1, name: 'Water total',
  thought: 'Total the supplied nonnegative liter measurements.',
  inputs: [{id: 'readings', name: 'readings', type: {
    kind: 'array', element: {kind: 'number', unit: 'L', min: 0}
  }}],
  steps: [{id: 'total', op: 'sum', inputs: ['readings'], params: {}}],
  outputs: ['total']
});

sourceOnly.verifyQuine(artifact.source); // no task bindings or task execution
const run = session.run({
  artifactId: artifact.id, requestId: 'water-1',
  inputs: {readings: [1.5, 2]}
});
// run.result.occurrences[0].outputs is [3.5]
const freshCopy = session.reproduce({
  artifactId: artifact.id, recordId: run.id, requestId: 'water-copy-1'
});
```

`verify`/`sourceOnly.verifyQuine` check constructor reproduction only. `recover` admits exact source or either exact genome without executing a task. `run` performs an explicit bounded task invocation. Session `reproduce` performs a fresh run with the retained parent's same bindings, checks exact semantic run equality and links the new record to the parent. It does not invent fresh sensor data or a new world confirmation. A second explicit run may instead supply a new snapshot to the same artifact.

Run/reproduce `requestId` is an immutable session key. Retrying an identical complete request returns its retained record without re-evaluation; changed payload under the key is request-conflict. Retained failures are also records. Validation, schema/byte checks and detached return allocation precede the in-memory commit. Replay keys are not evicted or silently reopened; capacity exhaustion refuses new records. This is a bounded memory session, not durable host storage or exactly-once external action execution.

Default capacity is 128 artifacts and 256 records. SDK caps are 32 MiB aggregate artifacts, 2 MiB per execution record, 64 MiB aggregate records, 32 MiB request receipts and 128 MiB snapshots. Record count/byte limits can be lowered through Session options. SDK record wrapping consumes bytes beyond the low-level run; a near-limit semantic run can therefore be refused before record commit. `describe()` reports active limits. Transport envelopes and adapters have additional checks; these are not replaced by the semantic-run cap.

`exportSnapshot()` returns explicit session data; `Session.fromSnapshot()` passively restores into a fresh memory session. Imported historical records are marked `evidence:"asserted"`, even if their source/binding hashes validate. Restoration does not execute tasks or establish that imported outputs really occurred. A retained live-session record is labeled retained; neither label authenticates outside world testimony.

See [release identity and future upgrades](QDL-V1-UPGRADES.md) for immutable release retention, exact-pin refusal and the explicit matching-runtime → reviewed construction → new artifact path. No automatic multi-registry loader is implemented.

## Legacy compatibility and explicit migration

Legacy `graph.version:1`, visual `qdl:1`, constructor source, fixtures, genomes and literal override semantics remain experimental and separately executable. Its original 34 operation identities/colors are frozen independently; new operations append rather than renumber those existing entries. The new profile has an unmistakable `qdl-program` discriminator. A recognized malformed v1 source must refuse rather than fall back to legacy. V1 Session recovery accepts v1 source only. Recover or execute legacy source through its existing API; do not change bytes merely to give it a new label.

No implicit upgrade is implemented or promised. QDL 1 provides passive explicit `migrateLegacy` in [qdl-v1-migrate.js](../qdl-v1-migrate.js) and SDK `@quinelings/agent-sdk/v1-migrate`. Its closed request is `{source,registryDigest,name,thought,types,ports,evidenceClaims}`: legacy constructor source, exact current target digest, authored name/full public declaration, a type for **every** old graph node, a map of deliberately selected literal IDs to required runtime names, and an explicit claim for every legacy evidence node.

Unselected literals remain constants. Design, repeats and output boundary are preserved. The helper validates the ordinary legacy task constructor and the new typed/effect-safe graph; legacy Orbit plan-only sources are outside its scope. It returns `{format:"qdl-migration-preview",version:1,legacySource,legacySourceHash,targetRegistryDigest,mapping,semanticChanges,artifact,evidence:"authored-conversion",executed:false}`. The preview carries the canonical old source and a new admitted constructor, but performs no task execution and inserts no SDK session artifact. Explicitly call `session.recover({source:preview.artifact.source})` to retain the new artifact, then Run with typed bindings only when intended. Preserved legacy family designs may lack the assembly/gesture required by SDK `frame`; successful migration does not automatically add new geometry.

An explicit migration review must:

1. Retain the original canonical legacy source, hash, genomes and fixture outcomes.
2. Write reviewed node types and units; historic missing units or thought are unresolved obligations rather than inferred facts.
3. Treat existing literals as authored constants by default. Select runtime ports deliberately and provide exact binding schemas and independent fixtures. A legacy literal override changes the resolved graph; it is not a v1 port binding.
4. Author the public declaration and node/output references. Keep external notes/provenance separate unless deliberately embedded. Export Boolean goal predicates when appropriate.
5. Fix disconnected work, effect-bearing action cones and eager action branches. Choose a claim for legacy evidence aggregates; explicitly select first-report `evidence` or freshness/conflict-aware `evidenceFresh` semantics.
6. Compile under the target registry and review the changed source identity, task outcomes, simulation receipts and body. Record old/new identities in a separate migration manifest; migration is construction of a new artifact.

## Release acceptance

The seven release gates below passed within the stated scope. [The independent gate review](../research/qdl-v1/release-language-gates.md) maps each gate to concrete code, fixtures and test evidence:

- Reviewed normative registry/signature/error/bound vectors and golden canonical source/genome bytes, including explicit legacy migration pairs.
- Strict source, typed bindings, dependency/effect/reference checks across compiler, raw import, core, SDK and adapters; malformed sources cannot bypass shared admission.
- Independent exact fixtures and adversarial boundaries for numeric overflow, explicit null, empty collections, unknown/pending/conflicting evidence, repeat failure publication and aggregate/wire budgets.
- Same source with distinct inputs, three fresh constructor generations and both exact genomes recover full declaration/types/design in an empty session; source-only operations execute no task.
- Legacy golden identities and all existing outcome fixtures preserved through the legacy entry points.
- Node 22/26, actual browser and installed-package consumer agreement, real MCP/A2A serialization/schema checks and fault tests for precommit failures/keyed replay/passive restore.
- Correspondence between implemented checks, Lean/Quint abstractions and actual executable fixtures, with remaining obligations stated. Checked abstractions do not prove all JavaScript, renderer or external adapter behavior.

Recorded acceptance includes Node v22.23.3 and v26.10.0 with 109 SDK tests per runtime, typecheck/build and installed-package consumers; Chromium 153.0.8010.12 agrees on ten frozen sources, 44 independent recipe cases, both exact codecs and 12 legacy sources. The independent semantics audit passes 11 adversarial checks under the frozen pin. Legacy compatibility preserves all 53 existing outcome fixtures and 12 complete source/genome identities. See [the acceptance record](../research/qdl-v1/acceptance.json), [browser conformance](../research/qdl-v1/browser-conformance.json), [recipe evidence](QDL-V1-LIBRARY.md) and [formal correspondence](../research/qdl-v1/formal-runtime-correspondence.md).

Release designation `qdl-v1.0.0` retains the matching source, manifest, goldens and SDK archive under `releases/qdl-v1.0.0`. The [upgrade policy](QDL-V1-UPGRADES.md) requires the matching archived runtime for historical pins; no universal loader is shipped. These finite checks support the bounded language contract. They do not certify outside facts, live City compatibility, durable storage, authenticated shared hosting, arbitrary English interpretation or all JavaScript behavior.
