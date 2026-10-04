# Executable compiler audit and implementation decision

Reviewed `docs/THOUGHT-TO-LIFEFORM.md`, generation, semantics, integration and evaluation research, `docs/PROGRAM-CONTRACT.md`, `kernels.js`, `core.js`, and the canonical JSON functions in `orbit.js`. This review changes no production code. The proposed architecture is implementable with existing kernels, provided the first release explicitly scopes interpretation and keeps the following gates.

## Blocking findings

1. **Structural validation is not typed compilation.** `kernels.validate` checks finite JSON, references, arity and acyclicity. It accepts unknown parameter fields, wrong numerical units and most invalid refinements. Add a closed compiler schema and parameter/type validation before constructing a quine. Keep legacy graphs compatible by making this a new compiler boundary, not retroactively labeling the old validator typed.
2. **Conditional effects must carry their own guard.** Every node executes, including nodes outside output ancestry. A checked example `choose(false, action(true,payload), payload)` returns the harmless value while emitting one simulated effect. Reject action nodes anywhere upstream of a `choose` branch in the first compiler; explicit `action(condition,payload)` is supported. Reject disconnected operations rather than treating them as harmless unobserved work. This conservative rule can be relaxed only with explicit effect semantics.
3. **Finite output does not establish valid weighted arithmetic.** Executing weighted mean on values `[1e-308,1e-308]` and weights `[1e308,1e308]` currently returns `0`: the denominator overflows to infinity but the quotient is finite. Compiler checks must require finite weight sum, finite products and finite numerator, in addition to equal nonempty lengths, nonnegative weights and positive total. Literal-bound evaluation can check these precisely. General numeric results remain IEEE-754, not exact real arithmetic.
4. **Graph byte admission is insufficient.** Three valid 12,000-character literals create a structurally valid graph but a 74,697-byte constructor source with default design. Check exact canonical UTF-8 size of the finished AST against 65,536 before admitting the artifact. Never truncate inputs/design to make it fit.
5. **Build and Run currently have no shared explicit record boundary.** Compilation may perform bounded validation evaluation, but its internal values must not appear as a user RunRecord. User Run and verified-child execution produce source-bound records. All actions remain simulated; Build cannot silently imply live effects or user authorization.
6. **No automatic arbitrary-English compiler exists.** The manually lowered examples and twenty benchmark labels do not establish synthesis coverage. A deterministic parser must consume a documented, complete grammar or reject/clarify the remaining text. Keyword extraction that ignores “except”, “then”, “if”, units or trailing clauses is a false-success bug.

## Decisive initial API

Use one dependency-free UMD module, `thought-compiler.js` (`ThoughtCompiler` in browsers), plus `verify-thought.cjs`. Avoid a directory tree of small responsibilities before those boundaries need independent implementations.

```js
propose(text)                 // local supported syntax → proposal/status
validateIntent(intent)       // closed structural/type/unit/refinement checks
lower(intent)                // → {graph, contract, sourceMap, diagnostics}
compile(intent, {design})    // → status + complete bounded AST/source/envelope
importProposal(jsonText)     // bounded parse → same validation, never host code
exportProposal(proposal)     // JSON companion document, separate from quine
```

Compilation returns exactly one of `compiled`, `needs-information`, `unsupported`, `inconsistent`. Diagnostics have `{code,path,message}`; successful result includes `intent`, `graph`, `contract`, `sourceMap`, `program`, `source`, `sourceBytes`. An invalid supplied graph is `inconsistent`, unknown capabilities are `unsupported`, and omitted meaning/data are `needs-information`. No result except `compiled` contains an executable artifact.

Keep anatomy injected: the root can supply a generated validated `design` after `lower`, or compiler may accept an explicit deterministic `designForGraph(graph)` integration hook controlled by application code. Provider JSON cannot supply a function. Seed input is canonical pre-design graph plus authored design preferences; final source never seeds itself.

## Concrete IntentIR envelope

```json
{
  "format":"quineling-intent-1",
  "name":"Squared total",
  "thought":"Square the supplied litre measurements, then sum them.",
  "inputs":[{"id":"readings","value":[2,3],"type":{"kind":"array","element":{"kind":"number","unit":"L"}}}],
  "steps":[
    {"id":"squares","op":"map","inputs":["readings"],"params":{"kind":"square"}},
    {"id":"total","op":"sum","inputs":["squares"],"params":{}}
  ],
  "outputs":["total"]
}
```

Required fields are closed. `thought` is preserved companion provenance and never treated as proof of the steps. Optional assumption/source-span metadata belongs to a documented separate ThoughtDocument or explicitly closed optional fields. Never accept unknown `constraints` or `authority` fields and silently drop them. The complete supplied IR is the executable interpretation; the UI displays it for review.

Types use `number(unit)`, Boolean, string, null, array(element), record(fields), and optional(element), with finite values and safe integers where operations require them. Unknown record fields and dotted/unsafe property names reject. Empty arrays require an explicit element type when an operation needs it; do not infer numeric arrays from emptiness. Optional route distance remains optional even on a successful supplied example. Infer result types from operation signatures, not the model's declared result type or just a sample's resulting value.

Units are exact symbolic identities (`one`, `L`, `s`, `edge`, etc.) with bounded syntax and canonical dimension exponents. Addition/reduction preserve dimensions; square doubles exponents; `length` is a count, not the input quantity unit; weights must be dimensionless; comparison thresholds/clamp bounds inherit the operand dimension under an explicit parameter contract. `multiply.factor` is dimensionless initially. `allocate` amount fields and available must match dimensions and be nonnegative safe integers. No implicit litre/millilitre conversion. `bfs.distance` is `optional(number(edge))`. `schedule` shares the job duration unit. Fields of report retain their types and units.

Implementation may begin with a supported registry subset if every omitted kernel is reported as unsupported. Prefer all existing finite kernels where feasible; generic ordered-step composition, rather than a whole-task template catalog, is the important boundary. Registry entries expose ordered port names, closed parameters, purity (`pure`/`simulation`) and output inference. Runtime refinement checking against fixed literal inputs is sufficient for this release because no runtime input slots exist; do not advertise universal static totality.

## Lowering and validation order

1. Bound input text/JSON bytes before parse; validate actual finite acyclic JSON before JSON cloning can convert NaN/infinity or drop undefined. Reject unknown fields, keys, formats, capabilities and invalid IDs. Bound ID length, arrays, nodes, record depth and diagnostic count.
2. Validate complete literal schemas, unique IDs, references, ordered arity/ports, outputs and cycles. Topologically traverse with stable author order for ties; do not sort significant arrays or reorder FIFO requests.
3. Validate parameters and infer types/units through every node. Check numeric/algorithm refinements against current fixed literal values; explicitly check weighted overflow before using kernel evaluation. Every supplied field of every row must match its declared schema, not only the first row.
4. Reject conditional-effect branch patterns and disconnected steps. Require action guard Boolean and `allowed` explicit Boolean; classify receipts simulation only. `retry` is reduction of supplied outcomes, not an external retry loop. Repetition remains one by default; adding cycles means identical re-execution, not state or observation.
5. Lower literals plus steps mechanically to `version:1` graph, then call existing `validateTask` and bounded kernel evaluation. Return validation outcomes internally; expose user run values only through explicit Run.
6. Commit generated design; call shared `makeTaskProgram`, never copy specimen source. Measure entire canonical source; encode only after admission. Contract/source-map metadata remains companion state and says so explicitly.
7. Validate final embedded graph/design and confirm constructor source equality in tests across three fresh executions. Real browser Build need not execute three generations; Run/Create verified copy already own explicit execution.

## Honest free-text and provider contract

Local input should support a documented pipeline grammar such as `numbers [2,3] L | square | sum`, with anchored parsing of every stage, plus a small number of anchored plain-English forms such as “sum [2,3]”. Generic pipelines give unseen composition without whole-plan templates. Failed or partial parse returns `needs-information`, preserving the complete text. A JSON IntentIR import covers arbitrary supported DAGs. Display “local supported syntax” and “import a structured proposal”; do not call this unrestricted language understanding.

An optional proposer is an application-supplied async function `(thoughtDocument) => IntentIR proposal`, or an explicitly configured same-origin/local backend endpoint. It returns data only; timeout, cancellation, response-size and JSON-schema checks precede compilation. No provider credentials, executable JS, registry code, arbitrary response HTML or credentials enter source/browser assets. Absence of an adapter yields an informative unavailable status. Do not make an actual network call or add credential UX merely to complete this local implementation.

## Acceptance tests that earn the implementation claim

- Independent expected results for reduction after map/filter, FIFO allocation after filter, route/no-route guard, queue filter/dedupe/sort and a report joining branches. At least two compositions absent from parser examples.
- Negative cases: wrong units, wrong ordered ports, empty mean, unequal/zero/overflowing weights, fractional/unsafe allocation, duplicate IDs, schedule cycle, unknown/extra fields, unsafe paths, cyclic/undefined/nonfinite JS input, unsupported op, and residual free text.
- Effect case above rejects; a false direct action guard yields zero simulation effects; fresh explicit execution creates source-matched records.
- Complete wrapped source boundary catches the demonstrated oversized graph; no “compiled” artifact exceeds 65,536 UTF-8 bytes.
- Three fresh constructor generations preserve full source/design and independently specified outputs; direct/sampled harmonic and RGB codecs recover exact source.
- Parameter/literal/units changes affect their declared identity boundary. Changing only phase or replay does not compile/run. Units in companion metadata must not be claimed reproduced by genomes unless deliberately embedded later.

This completes the executable design audit. It permits a useful new compositional compiler now while preserving the distinction between validated formal intent, bounded deterministic text parsing, optional model interpretation, and arbitrary human thought.
