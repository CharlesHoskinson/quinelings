# Workstream 04: typed executable lowering and capabilities

The current interpreter is a bounded eager dataflow DAG: ≤64 nodes, ≤16 inputs per node, ≤16 declared outputs, ≤512 entries per array, finite JSON depth≤24, canonical graph/value bytes≤65536, with an outer 1–8 repeat count. All nodes execute once per cycle when dependencies are ready. `choose` selects already-computed values; it is not lazy control flow. `action` returns only local simulated receipts. `retry` consumes a supplied outcomes list; it does not call/retry a network operation. These are the compiler's present semantic target, not a universal agent language.

## Concrete compiler intermediate representation

Keep ThoughtIR provenance/dialogue separate from a complete typed executable TaskIR. One illustrative closed TaskIR envelope:

```json
{
  "format":"typed-task-ir",
  "registry":"quineling-kernels-prototype",
  "status":"supported",
  "inputs":[
    {"id":"observations","mode":"literal","type":{"array":{"number":"finite","unit":"litre"},"max":512},"value":[24,36,60]},
    {"id":"weights","mode":"literal","type":{"array":{"number":"nonnegative","unit":"one"},"max":512},"value":[2,1,1]}
  ],
  "nodes":[
    {"id":"estimate","capability":"weightedMean","arguments":[{"port":"values","from":"observations"},{"port":"weights","from":"weights"}],"parameters":{},"resultType":{"number":"finite","unit":"litre"},"effect":"pure"}
  ],
  "outputs":[{"from":"estimate","label":"estimated demand"}],
  "cycles":1,
  "authority":{"mode":"simulation"}
}
```

This is a proposed schema, not a currently accepted program. Compiler version/registry implementation identity must be recorded where reproducible semantics requires it. No arbitrary host functions, shader strings or dynamic property access. Input/node IDs unique; arguments exactly match ordered signature ports. Canonical node result types are inferred and then checked against declarations; a model cannot make arithmetic safe by asserting an incorrect type. Supported types: finite number, bounded safe integer, Boolean, bounded string/enumeration, record with closed named fields, bounded vector, optional value; optional discriminated unions describe algorithm outcomes. Units are exact symbolic dimensions with a declared conversion registry, never untyped label text.

ThoughtIR includes original statement, interpreted goal clauses, assumptions, input provenance, constraints, supported fragments, missing capabilities, and clarification questions. It cannot self-authorize `supported`; the compiler validates completeness and maps unresolved goals to `needs-clarification`, `partial`, or `unsupported`. User intention remains a human interpretation boundary. Static types/fixtures prove properties of a formal plan, not equivalence to arbitrary natural language.

## Registry and unit contracts

Each entry declares capability ID/implementation identity, ordered ports, type/parameter inference, runtime preconditions, result and failure types, purity/effect kind, resource cost/bounds, and lowering rule into current ops. New entries require interpreter validation, negative fixtures, preservation tests, updated formal semantics, anatomy/color identity and old-program regression checks. No model-generated registry code executes automatically.

Examples:

- `weightedMean`: values Vec<Number<U>>, weights Vec<Nonnegative<one>>, same nonzero length, positive finite weight sum; result Number<U>. Finite inputs alone do not guarantee finite intermediate products/sums; either validate stronger numerical preconditions or retain an explicit runtime failure outcome. Current JS may reject nonfinite results after evaluation rather than prove every operation statically total.
- `map.square`: Vec<Number<U>>→Vec<Number<U²>>. `multiply` parameter has a declared dimension, or must be dimensionless; arbitrary unit erasure is forbidden.
- `budget`: [available Nonnegative<U>, desired Nonnegative<U>]→{allocated Nonnegative<U>,remaining Nonnegative<U>}. `allocate` requires safe integer amounts in the same resource unit; units do not survive raw JSON automatically, so the compiler manifest retains the contract.
- `bfs`: [adjacency,blocked] plus literal start/goal parameters→{found:Boolean,path:Vec<ID>,distance:Option<NonnegativeInt<edge>>}. Distance is number of graph edges, not metres or travel time. `schedule` uses one shared duration unit; its durations do not include unspecified setup/travel delays.
- `get`: compile statically known record paths with own-property semantics; optional result fields cannot be treated as definitely present. The current dotted path is unsuitable for field names containing literal dots; reject those schemas or add a separately specified segment-list operation later.
- `compare`: ordered numeric comparisons require equal units, or explicit valid conversion; equality requires compatible structured types. `choose` branch types must unify. `filter` predicate units agree with the selected field.

Types and units belong to task semantics; motion/role color does not convert or validate them. Parameters such as comparison threshold and route start/goal are authored source. Unknown observations cannot be supplied by an invented default.

## Lowering algorithm

1. Preserve the proposed thought interpretation and unresolved fragments. Resolve capabilities only from the explicit registry. Require all relevant inputs and units; clarify ambiguity such as "first duplicate" versus "highest-priority duplicate" before compiling.
2. Elaborate typed task nodes: infer types, validate ports and parameters, reject cycles/dangling IDs, prove or runtime-check refinements. Normalize declared conversions explicitly with traceable nodes. Choose deterministic stable IDs derived from semantic provenance; no IDs from current timestamp.
3. Establish pure/effect contracts. Expand pure conveniences into current kernels where equivalence is justified. For Boolean conjunction, current `choose(guardA,guardB,false)` can compute a pure Boolean conjunction, with both inputs eagerly computed. Never use it to protect an action hidden in a branch.
4. Topologically lower ordered arguments to `inputs:[producer IDs]`. Literal inputs become `literal` nodes; dynamic algorithm start/threshold parameters require a new op or recompilation today. Record a source map from ThoughtIR clause→TaskIR node→kernel graph node(s). Preserve constraints that cannot yet be expressed as unresolved requirements rather than deleting them.
5. Run `validateTask`, then kernel fixture evaluation for declared example inputs. Validate canonical byte/node/value bounds including authored QDL; wrapping/design can push the complete genome past its own 64KiB limit even when the bare graph passed.
6. Generate design/material recipe deterministically from graph and explicit seed. Compile with `makeTaskProgram(graph,cycles,design)`. Verify output source exactly equals canonical whole AST before child admission. A useful test suite checks intended results and failure cases, not just quine self-equality.

Mechanical repair may canonicalize ordering, rename colliding internal IDs with a complete provenance-preserving reference update, or remove harmless duplicate metadata. Repairing missing arguments, swapping ports, changing unit/domain, inventing an observation, dropping a constraint or breaking a cycle changes meaning: return diagnostic/clarification, or a visibly revised proposal requiring intent review. If the operation is unsupported, a pretty body must not label the plan executable.

## Effects, authority and future runtime inputs

Current `action.allowed` is an authored simulation Boolean. It is not proof of permission to access Midnight.city or any host. Future external effects need a separate host authority channel, typed capabilities, explicit invocation boundary, failure/unknown receipts, idempotency keys and resource budget. A quine reconstructs source, not credentials or world-write permission. Reproduced children must receive fresh host authorization; capability metadata alone grants nothing. Replaying a trace never invokes the adapter.

Current literal overrides clone and replace literal values; `runTask` returns that changed graph. Compiling it yields a different canonical source and possibly a different generated body. The experiment verifies this. Calling overrides while comparing output with the original unchanged quine would obscure what actually ran. Treat fixture changes as a new authored task instance and bind trace identity to the effective source.

A future runtime input channel should explicitly name typed input slots in source, receive values in a separate immutable execution environment, and record environment digest/provenance in receipts. Then source identity remains constant, while task results depend on the input environment. Validate environment types/units, disallow undeclared slots, and never include secrets in emitted source or public logs. This runtime channel does not exist in current kernels and needs a new formal/runtime contract. Persistent memory, streaming observations, event-driven agents and unbounded loops likewise remain unsupported until designed; literal arrays and repeated identical cycles are not those capabilities.

## Provider-independent generation transport

Static GitHub Pages serves the UI/runtime and local computations. It cannot safely retain a model API secret. Use a provider-independent synthesis interface accepting task proposal JSON and returning structured ThoughtIR/TaskIR plus diagnostics; implementations can be a separately authenticated backend or a local user-controlled service. Provide import/export/manual structured proposals and local validated templates as a usable no-provider path. Provider switching changes proposal generation, not compiler guarantees. Do not ship keys in browser code, URL queries, local storage defaults or quines. A backend must authenticate and enforce cost limits, while its model response remains untrusted input to the same browser/server compiler. Model transport is not a real-world action adapter.

## Two exact current-kernel thought examples

The runnable `thought-lifeform-04-examples.cjs` writes its graphs/output to JSON and tests three fresh generations each.

**“Find an open route from A to D through these streets, avoiding B, and simulate walking it.”**

`literal(streets)` and `literal(blocked)` → `bfs(streets,blocked; start=A,goal=D)` → `get(found)`, `get(path)`, `get(distance)` → `action(found,path;allowed=true,action=walk-route)` → `report(route,action)`.

Given A→[B,C], B→[D], C→[D], D→[], blocked=[B], result path is [A,C,D], distance 2, simulated walk receipt. With B and C blocked, found=false and no effect receipt. **Supported for supplied streets and local simulation**. “Walk there now using live closures” is **partial**: missing live observation/world adapter/location authority, not an implemented route agent. “Shortest travel time” requires weighted routing and travel-time data; BFS currently means fewest edges.

**“From this queue, keep urgent jobs, retain the first surviving job for each ID, and sort them by descending priority.”**

`literal(queue)` → `filter(key=urgent,eq,true)` → `dedupe(key=id)` → `sort(key=priority,descending=true)` → `length` → `report(ordered,count)`.

Input urgent a(priority2), nonurgent b(priority10), duplicate urgent a(priority9), urgent c(priority7) yields c then the first a(priority2), count2. **Supported for a finite supplied queue**. “Keep the most important duplicate” is a different meaning and needs a different ordered operation sequence; do not silently substitute it. “Remember processed IDs tomorrow and consume incoming work continuously” is **partial/unsupported for execution**: missing persistent store, runtime input channel and scheduler, not cured by eight task cycles.

## Identity and acceptance

Tests cover declared outputs, types/units/port order, missing inputs, unsupported loops, numerical failures, action guards and zero real-world calls. Three fresh quine generations must preserve canonical AST/design and task result for equal environments. Generated-body tests must separately verify deterministic material recipe/owners and phase-dependent coordinates under identical source+generator identity+seed+phase. Changing only phase/quality/replay preserves source/effect count; changing graph/seed intentionally changes canonical identity. Current experiment verifies `describe` identity with existing family bodies; **it does not implement or validate the proposed new generative compiler**. Exact harmonic/RGB recovery remains independently checked. A source-preserving copy can still encode the wrong task; that is why semantic fixtures and interpretation review are necessary.
