# Typed mating and composition for the experimental ranch

Recommendation: build offspring by deterministic transformation of typed IntentIR, then use the existing compiler, assembly generator and constructor quine. Start with two parents, explicit connections, and pure-subgraph donation. Do not cross JavaScript source strings, concatenate constructor ASTs, infer units from raw numbers, or add a general evaluator. QDL stays experimental; the proposed recipe discriminator is an internal compatibility marker, not a frozen language release.

## Existing facts and terms

`thought.js` checks structural types and normalized symbolic units, arithmetic refinements, graph reachability and cycles. It rejects action ancestors in either value branch of eager `choose`. `kernels.js` evaluates the entire DAG, including actions; output selection is not lazy control flow. `packages/agent-sdk/src/index.ts` admits canonical task constructors with assembly anatomy and gesture and IDs artifacts by SHA-256 of complete source. Its intent, unit contract and source mapping are companion metadata; they are not inside the quine. Anatomy ownership must cover every graph node and partition each component.

Use precise labels in the interface:

| Operation | Executable task | Authored body | Meaning |
| --- | --- | --- | --- |
| Copy | Identical | Identical | Existing exact-source quine reproduction |
| Compose | Explicitly joined parent tasks | Regenerated for joined graph | New task with an inspectable connection |
| Mate | Recipient computation with a typed donor slice | Regenerated for new graph | New task with inherited computation from both parents |
| Body variation | Identical | Explicitly changed | Visual offspring, not a new computational capability |

A graph/source difference establishes a new artifact, not useful behavioral novelty. Renaming nodes, changing a name, or regenerating the body can change bytes without changing outputs. Publish task/body/source change flags separately and use concrete fixture outcomes to demonstrate useful differences. Do not claim general program equivalence or inequivalence from a few samples.

## Closed proposal API

Add a local experimental ranch service beside the existing SDK, with `proposeOffspring`, `inspectOffspringProposal`, and `admitOffspring`. Existing `run` remains the only execution entry point. Proposed request records reject unknown fields and executable callbacks.

```ts
type ParentRef = { artifactId: string; sourceHash: string; intentHash: string };
type PortRef = { parent: 0 | 1; nodeId: string };
type Recipe =
  | { kind: 'compose'; parents: [ParentRef, ParentRef];
      bindings: { from: PortRef; intoInput: PortRef }[];
      outputs: PortRef[] }
  | { kind: 'mate'; parents: [ParentRef, ParentRef];
      recipient: 0 | 1; replaceNode: string; donorNode: string };
type ProposalResult =
  | { status: 'accepted'; proposalId: string; artifactPreview: Artifact;
      recipe: Recipe; lineage: Lineage; changes: ChangeSummary }
  | { status: 'rejected'; diagnostics: Diagnostic[] };
```

`compose` bindings go exclusively from parent 0 into literal inputs of parent 1. Sources must be declared parent-0 outputs. No binding means ordered parallel composition. Outputs are explicit, unique, and bounded by the current 16-output limit. This intentionally omits arbitrary bidirectional wiring. Entire parent graphs are retained except bound literals that have been replaced; an output that names a replaced literal resolves to its replacement. The typed compiler rejects a choice of outputs that leaves disconnected computation. Parallel composition executes both graphs only when explicitly run; call it a joined report/task, not a new algorithm.

`mate` imports the donor node and its transitive dependency closure, replaces every recipient use and output reference of `replaceNode`, then prunes recipient nodes unreachable from its rewritten outputs. Replacement must have exactly the same normalized structural type, including units, array element types, record fields and optionality. Donor closure must be pure. Require some surviving recipient computation beyond a donor alias and at least one donor node; reject a whole-task replacement disguised as mating. For the first release, reject all self-mating requests; exact source copying already has an operation.

The current SDK `compile` builds and admits immediately, so preview cannot call it directly. Extract a pure candidate builder and use bounded proposal storage; only explicit admission may write the artifact and lineage stores. Both modes use existing operations only. No inferred coercions, implicit unit conversion, closures, dynamic imports, new effect authority, or automatic runs. Canonical role-prefixed integer IDs such as `p0n0` avoid collisions and the existing 64-character ID bound. Build the mapping from compiler-determined stable topological order, with original order breaking ready-node ties; never locale sorting. Preserve repeated input ports and output ordering.

## Compilation and unit preservation

For each parent, require the stored companion IntentIR and recompile it. Compare its compiled task graph to the task in the parent's validated source, accounting only for the design carried separately in the constructor. Recompute the contract; do not trust a supplied `types` map. If intent is missing, return `missing-typed-parent`. A source-only recovered artifact remains inspectable, runnable and copyable; it is ineligible for typed mating until explicit companion metadata is supplied and validated. A new annotation is recorded as user-supplied, not recovered historical metadata.

Normalize units with the existing compiler's rules: multiplication of bases is commutative, exponents combine, and `one` is dimensionless. `L` and `mL` remain distinct symbolic units; arithmetic equality of the numbers does not authorize a conversion. Parameters such as comparison thresholds keep the inherited compiler interpretation relative to their input type; the first release introduces no new parameter mutation. Structural compatibility alone is insufficient: run the full compiler again for nonempty means, weight mass, finite arithmetic, integer allocations, and all current refinements.

Generate the child IntentIR using remapped inherited literals/types/steps, an explicitly mechanical thought description, and bounded distinct inherited assumptions. Do not invent a natural-language parent thought or concatenate source maps into false spans. Use new generated source clauses plus a separate inheritance map `(childNode, parentArtifact, parentNode)`.

Then generate anatomy, gesture and source through the shared constructor path, validate graph/design/ownership, and check the complete 65,536-byte source budget. Regeneration is the baseline body policy: it makes positive territory available to every new node and avoids invalid inherited ownership intervals. Morphological crossover can be a separate audited transformation later. Validate chroma bindings after renaming; initially generate the default design rather than silently preserving a scalar lens whose producer was removed. Show body/lens changes in the preview.

## Effects survive through conservative rules

Compute a transitive effect summary for every node: pure or contains simulated action. Every imported donor slice must be pure. Recipient action nodes and every ancestor of their direct Boolean guard are protected: mating may not replace a protected node, and pruning may not remove a recipient action. Action opcode, action name, allowed flag and guard connection remain unchanged. Payload computation may receive a same-type pure donor slice; disclose that payload change explicitly.

For composition, reject a binding into any input upstream of a parent-1 action guard. Preserve both parents' action nodes and their parameters. Repeated action names remain separate receipts, keyed in the new trace by child node; never deduplicate effects by name. Recompile and retain the existing eager-`choose` rejection. Neither `allowed:true` nor a successful parent record grants external authority. Every action remains a local simulation.

This policy preserves both guard syntax and guard-producing data. It limits examples such as mating a new route planner into an existing action guard; those should be a separately authored typed task edit with explicit review, not an incidental inheritance operation. An effect label alone cannot certify that a guard was not weakened. The two-label summary is inspired by type-and-effect systems, but is much smaller than Koka's general effect system; see [Microsoft Research's Koka project](https://www.microsoft.com/en-us/research/project/koka/).

## Deterministic identity and bounded lineage

Use three separate identities: artifact ID hashes complete executable source; proposal ID hashes a canonical recipe plus exact parent source and companion-intent hashes and current compiler/assembly compatibility IDs; derivation ID additionally hashes the resulting child source. Use the project's `Q.canon`, UTF-8 and SHA-256 consistently; do not call this RFC JSON canonicalization without checking that specification. Child generation seed is an explicitly documented uint32 projection of the proposal digest. No ambient randomness, wall time, iteration over unordered collections or parent execution records participate.

Lineage is a bounded companion record containing two ordered direct parent identities, canonical recipe, compiler/generator compatibility IDs, child source hash and node inheritance map. It carries no parent execution records, runtime budgets, provider credentials, author identity attestations or authority. Bound its serialized size at admission (proposed 32 KiB) and the lineage store separately (proposed default 128 records). Do not embed ancestors recursively. Source-only recovery cannot recreate lineage; report `lineage unavailable`. Derivation determinism establishes reproducibility, not authentic parent authorship.

The same child source may have several derivations. Store lineage by derivation ID, with a bounded artifact-to-derivation relation; never overwrite the first lineage because source hashes match. Reject an accepted recipe if child source equals either parent's source. Admission rechecks exact parent/proposal identities, all validators and artifact/lineage capacity, then commits atomically. Duplicate admitted derivations are idempotent and spend no new slot. Admission, inspection, framing and rejection produce zero task runs and zero simulated receipts. Child run records are fresh and contain no inherited parent results.

## Concrete example and reversible experiment

Parent A: `mean [10,20,30] L` produces `[20]`. Parent B: `budget 5 for 12 L` produces `[{allocated:5, remaining:0}]`. Compose A's mean output into B's `available` literal, and expose B's budget output. The compiled child has the array literal, mean, desired literal and budget, and independently produces `[{allocated:12, remaining:8}]`.

Alternatively mate A's pure mean slice into B's `available` node with the same `number<L>` type. B's displaced literal is pruned; the same useful computation results under a distinct recipe. The task is independent: it contains A's inherited computation and supplied numbers, not a stored output of A or a callback to either parent. Explicitly running it recomputes the mean.

A reversible inline Node experiment against current `ThoughtCompiler.compile` and `QuinelingKernels.run` confirmed all three outputs above. This demonstrates compiler/runtime feasibility of the graph transformation, not implementation of the proposed API or proof of lineage.

## Required rejection cases and tests

1. Unit mismatch (`L` versus `s` or `mL`), record-field mismatch, optional-to-required mismatch, or missing/forged/stale companion intent rejects with paths to both ports.
2. Unknown fields, nonliteral composition destinations, duplicate destinations, wrong parent direction, dangling references, cycles, disconnected leftovers, more than 64 nodes/16 outputs, excessive source, or exhausted admission stores reject without mutation.
3. Effectful donor closure, replacement of an action/guard ancestor, an action removed by pruning, and actions under `choose` reject. False guard and `allowed:false` still emit no effects after accepted payload mating. True guarded action emits exactly its own simulated receipt after explicit run.
4. Identical requests in fresh stores produce byte-identical child source, proposal/derivation IDs and node maps. Reversing parents changes the ordered recipe. Changing the compiler compatibility marker changes proposal identity. Different derivations may share one artifact without losing either lineage. Preserve the SDK companion-intent conflict rule: conflicting intent for an existing source rejects unless an explicit separate derivation-annotation store is implemented; never overwrite its artifact metadata.
5. Recovery of child source reconstructs exact task/body/source and yields no inherited lineage or invented units. Repeated child copies emit exact child source. Running a recovered child remains explicit.
6. Example fixtures establish child budget `{12,8}`, recipient `{5,0}`, and donor `20`. An equivalent numeric donor should demonstrate why source change is not proof of behavioral novelty.
7. Assembly regeneration passes rooted-tree, ownership partition, graph coverage, depth/fanout/component, gesture and minimum rendering-budget checks; inspecting/rendering proposals does not increase task counters.

## Tradeoffs and claim boundaries

The first implementation is deliberately restrictive: exact types, pure donations, protected guards, directional connections, complete recompilation and generated bodies. It needs no new interpreter opcodes, but rejects some intuitive biological crossovers and cannot mate metadata-free source recoveries. Later extensions should be explicit recipes for typed parameter mutation, guard-aware action redesign and validated morphology crossover, each with separate obligations.

Units are a programming-language check, not decoration. F# similarly checks units at compile time while not retaining them in runtime values; [the official F# documentation](https://learn.microsoft.com/dotnet/fsharp/language-reference/units-of-measure) explains that boundary. Quinelings must preserve its companion type evidence through a derivation rather than assuming executable numbers can reconstruct it.

Proposed Lean obligations: transformed typed DAG preservation, exact normalized-unit compatibility, preservation of protected action/guard cones, and constructor reconstruction. Proposed Quint obligations: passive proposals, stale-parent rejection, atomic admission, finite derivation stores and fresh explicit child execution. Existing finite exploration or local assembly proofs do not discharge these new obligations or prove implementation refinement.
