# Workstream 1: arbitrary thought → typed intent → executable Quineling

## Product contract

Accept any finite free-text thought within an explicit input-size budget. Accepting text does not imply every thought has executable semantics. The system turns a supported, sufficiently specified goal into a typed, bounded task and its new creature; ambiguous or unavailable parts remain visible as questions or unmet capability obligations. The ten gallery specimens are examples, not the task catalog or final anatomical vocabulary.

The pipeline is:

    Thought document
      → Proposed Intent IR + evidence/assumptions + obligations
      → Capability resolution and typed graph elaboration
      → Structural/type/constraint validation and fixtures
      → Constructor quine + canonical source
      → Graph-driven bounded anatomy elaboration
      → Living view and recorded-run lenses

A language model can propose an IR, but the model is not the authority that declares a plan executable. The verifier and finite capability registry make that decision. A deterministic parser/template path can handle supported common intents without a provider call. No provider/credential calls were made for this review.

## Concrete intent intermediate representation

Illustrative schema, not current QDL syntax:

```json
{
  "goal": "allocate-resources",
  "inputs": [
    {"id":"water", "type":{"kind":"integer","min":0,"max":512}, "unit":"L", "origin":"user", "value":9},
    {"id":"beds", "type":{"kind":"array","maxLength":512,"element":"PlanterRequest"}, "origin":"user", "value":["typed records"]}
  ],
  "selection": {"field":"active","operator":"eq","value":true},
  "ordering": {"kind":"input-order"},
  "policy": {"kind":"fifo-partial-grants"},
  "outputs": ["grants","reserve","eligible-count"],
  "constraints": ["nonnegative-grants","total-grants-at-most-water","exclude-inactive"],
  "effectMode":"pure",
  "assumptions": [],
  "obligations": []
}
```

The IR needs a closed tagged vocabulary with typed operation recipes, not an arbitrary English `goal` string plus undocumented solver behavior. Start with numeric reduction, weighted fusion, filter/sort/dedupe, capacity/budget, FIFO allocation, route planning, dependency scheduling, independent-source agreement, bounded retry and evidence assessment. Each maps to existing kernels or to a declared missing capability.

Use types for finite number, safe bounded integer, boolean, string, named record, bounded array, optional/result and evidence state; track units and cardinality. Static typing catches arity and path mistakes; refinement obligations catch nonempty means, equal weighted-array lengths, nonnegative weights with positive total, unique allocation IDs and acyclic schedules. Keep a conservative static checker: where data-dependent validity cannot be proved, validate the supplied fixture/runtime input explicitly rather than asserting a proof.

The current kernel numbers are JavaScript numbers. A compiler must not silently promise arbitrary-precision integer arithmetic. It should require safe integer bounds for quantities that need exact integer operations, and finite bounds/results for numerical kernels. Fractional FIFO litres are not supported by the current integer `allocate` kernel; an exact declared millilitre unit conversion may be appropriate, but units and bounds must be explicit. Do not invent floating FIFO semantics.

## Capability statuses and ambiguity

Return one of:

- **compiled**: complete typed task, assumptions shown, all required capabilities present, fixtures passed.
- **needs-information**: a necessary quantity, interpretation or policy is missing; preserve a proposed partial IR and ask a focused semantic question.
- **unsupported**: the intent requires a capability absent from the bounded kernel registry; identify the missing operation and a useful supported decomposition.
- **inconsistent**: explicit constraints contradict each other or inputs violate required refinements.

“Make my city happy” is accepted as input but needs measurable goals and data. “Repair this lamp” resolves to an explicit local simulation if that is the selected available capability; it cannot become a live repair authority because the phrase sounds imperative. “Run forever and reproduce everywhere” has unavailable unbounded execution/admission obligations. Unsupported requests may still produce an inert intent specimen clearly labeled as a proposal, but must not produce a fake successful executable task or a reproduction receipt.

Ambiguity should be resolved at the IR layer. For “share fairly,” equal shares, weighted shares and FIFO are different policies. A suggested policy can be shown immediately with its assumption origin; only a user-specified or clearly chosen policy can be treated as the intended meaning. Do not pepper the user with aesthetic questions once semantics are clear: generate the anatomy deterministically and let them adjust it afterward.

## Provenance and exact identity

Store a thought document separately from the executable AST. The document records original text, user-provided inputs, externally observed inputs when available, assumption origins, selected interpretation, source spans supporting IR fields, compiler/recipe identifiers, unmet obligations and fixture expectations. Do not claim that source-span links prove semantic equivalence to arbitrary English.

For a stable artifact, validate and canonicalize the typed IR and graph; include the semantic contract/provenance digest in a deliberately specified artifact envelope. Current QDL does not yet define that envelope, so this is work to implement. A decision about whether raw text belongs in canonical executable source must be explicit. Storing only an English label in `graph.name` does not establish a full intent contract.

Anatomical seed should be derived from canonical executable graph plus validated intent/design preferences before anatomy elaboration. Then record the generated bounded anatomical expression inside source. Do **not** define a seed as the hash of final source if final source itself contains that seed; that creates an unnecessary circular fixed-point requirement. The final artifact hash is computed after elaboration. Renderer phase does not enter either seed or source identity.

Canonical graph IDs are stable semantic IDs; compiler allocation cannot depend on wall clock, process randomness, provider sampling or current animation phase. Equivalent reorders need a stated normalization rule: array order is often semantically significant here, including operation ports and stable FIFO/sort policies, so do not sort all arrays indiscriminately.

## A real current-op demonstration

I created and ran `research/final-qdl-generation-example.cjs`. It manually elaborates this thought:

> Exclude dormant rooftop planters, distribute 9 litres in request order, and report each grant and the conserved reserve.

The seven-node graph uses real current operations:

    water:literal ───────────────┐
    beds:literal → eligible:filter → grants:allocate → reserve:get
                            └→ count:length             │
                                 grants,reserve,count → ledger:report

The default inputs request 4 L for an active fern, 5 L for dormant moss, and 7 L for active sage. The output grants 4 L and 5 L to fern and sage, excludes moss, reports two eligible beds and reserve 0 L. Edge checks cover no available water and all dormant beds.

The experiment derives a bounded design deterministically from executable-graph hash and structural counts, includes a real scalar reserve lens with fixed domain [0,9] L, builds the constructor quine, and verifies three fresh generations. It verifies exact direct harmonic recovery, sampled harmonic recovery, RGB recovery, zero effects, and 336 finite surface samples at four phases. The recorded zero reserve is read as zero rather than treated as missing.

Artifacts:

- `research/final-qdl-generation-program.json`: thought, executable graph, current validated design and AST.
- `research/final-qdl-generation-results.json`: exact output and verification results.
- Run: `node research/final-qdl-generation-example.cjs`.

**Boundary:** this is a manually elaborated thought plus a novel executable task and a new parameterized individual in an existing family. It is not an automatic English compiler and not a compositional new-creature grammar. It does not edit the ten-specimen catalog or any production file.

## Execution facts the compiler must honor

The current DAG evaluator evaluates all nodes. `choose` selects among values; it does not make the unselected producers lazy. Therefore an action node placed behind an unselected value branch could already have executed in the local simulation. Elaborate conditional actions with an explicit boolean input to `action`, enforce declared effect policy, and never treat a visual branch as execution control. A general lazy/short-circuit language requires a new execution semantics and proofs, not a compiler trick.

Graph structural validation currently checks known operations, counts, references, DAG ordering and bounded JSON. It does not statically prove all operation parameter types/refinements. `runTask` validates many of those during evaluation. The new typed IR/elaborator should add a static layer rather than claim the existing graph validator is already a full dependent type checker.

Fixture overrides replace literal values and therefore change executable source when used to construct a new program. A recorded run from an earlier source must become stale after edits. Rendering, intent editing previews, selecting a lens and replaying records cannot issue execution effects or reproduction admission.

## Interface to the new anatomy workstream

The compiler hands the anatomical elaborator validated graph, ordered ports, semantic operation roles, graph-derived motif descriptors, source/design seed, authored aesthetic preferences, and declared recorded-result bindings. It receives a bounded anatomical grammar expression and ownership map. It cannot merely return one of ten skin names and call that novel generation.

The anatomy grammar needs independently valid primitives and bounded composition. Candidate primitives include axis/sheet, rooted branching tissue, ring chambers and nested shells; retain exact graph nodes/edges even if the visible grouping is lossy. Any anatomical simplification or grouping must preserve an explicit owner mapping. Rendered crossing, chamber adjacency and decorative loops never introduce executable dependencies.

Structural source determines anatomy; phase drives bounded motion; recorded output supplies declared lenses. Confidence/evidence/mood-like labels must name real program quantities rather than guessed mental attributes.

## Available now versus required implementation

Available now: bounded executable DAG operations, task graph validation, operation-role and scalar ownership, parameterized mathematical family bodies, constructor self-emission, exact canonical source, redundant harmonic/RGB recovery, view/receipt separation and local simulations. The demonstration exercises those capabilities on a task outside the ten library programs.

Required: typed intent schema, intent parser/proposer, capability recipes and resolution, conservative static typing/refinement obligations, semantic/provenance artifact contract, anatomy grammar/compiler, creature generation UI, and tests spanning the complete translation. New operations must ship their input/output contract, resource/effect bounds, fixtures, body mapping, and formal-model changes together. An operation plugin is not permission to run arbitrary host JavaScript.

## First implementation milestones

1. Implement a typed intent recipe for the demonstrated allocation/filter/report goal, including unit/bounds and policy disambiguation. Show the generated graph and exact assumptions before execution.
2. Add 4–6 existing-kernel recipes with independent edge fixtures; ensure unseen valid combinations produce new graphs rather than selecting library records.
3. Connect the graph to the bounded generative anatomy compiler. Test that graph changes affect anatomy/ownership while phase changes leave source, graph, lenses and receipts intact.

Acceptance: ten user-written supported intents yield valid new executable tasks and meaningfully varied creatures; ambiguous/unsupported examples return explicit obligations; semantic fixtures pass; reproduction retains intent contract and authored anatomy; no parser/preview/lens event issues task effects. English-to-program adequacy is evaluated through named goal predicates and user-selected assumptions, not presented as a general formal proof.
