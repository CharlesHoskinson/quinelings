The candidate is not ready to implement. Its breeding loop correctly avoids executing tasks, but the four offspring recipes do not yet define a closed, type-preserving, effect-honest construction that a second implementer would reproduce.

# Grok design audit 1 of 3

**Specialty:** typed program composition, donor slices, effects and guards, useful offspring, source identity, honest recoverability.

**Material:** the converged candidate in this prompt only. No implementation was run, and no repository facts are claimed. Fixture numbers below are obligations the candidate itself states; they are not observed QDL outcomes.

**Verdict:** revise the candidate, then implement. The closed recipe set, exact structural equality, recomputed types, stateless preview, and the refusal to treat parent hashes as authenticated lineage are the right skeleton. The graft rules, signature rules, purity rules, and section 8 oracles are still open enough to admit different children from the same prose.

## Required corrections

### R1. Donor slice is not a closed definition
**Severity:** critical. **Section:** 2, compose and mate.

“Import the donor’s entire pure predecessor closure” can be read as “import the pure part and drop the rest,” or as “the closure is required to be pure.” Those readings produce different programs. Compose never states a reject rule. Mate states purity only as an adjective plus a later sentence.

**Counterexample:** Parent0’s declared output depends on an action result, or on a node whose kind is outside a fixed whitelist. An implementation that keeps only arithmetic ancestors emits a child that type-checks and still omits the action the value came from. An implementation that imports the action makes the child perform parent0’s effect on every child Run. Both satisfy the current prose.

**Correction:** Define the slice as the ancestor cone of the selected donor port or node, along data edges, in the recomputed graph.

- The cone is imported whole. Effectful, unknown, random, clock, artifact-read, or action nodes anywhere in the cone reject the candidate. There is no silent deletion.
- Purity is a closed whitelist of IR tags. Unknown tags reject.
- Leaves that are literal constants stay constants. Leaves that are input ports, or edges from nodes outside the cone, become new ordered child inputs. They are not filled from any run record, not matched to recipient ports by name, and not hash-consed with recipient nodes.
- The only new wiring is the single substitution edge. Donor identities and recipient identities stay disjoint.
- Cycles, topo-sort failure, and a cone that contributes no donor-origin node as an ancestor of a surviving recipient output or action payload reject the candidate.

**Obligation:** Golden graphs for a closed pure cone, an impure cone, a free input port, a diamond that must be imported once, and a sibling action that must stay outside the cone. Reject, and do not increment any task-run counter.

### R2. Compose can delete recipient effects
**Severity:** critical. **Section:** 2, compose, beside mate’s survival rule.

Mate requires every original recipient action to survive, with its name, allowed flag, and guard cone unchanged under an injective namespace map. Compose only requires “at least one surviving recipient operation” and prunes “unreachable” nodes. Reachability to declared outputs drops effect-only actions.

**Counterexample:** Parent1 computes a pure report and also has a guarded `walk` that produces no declared output. Composing a new literal into the report prunes `walk`. The child is a different task. The section 8 path-donation fixture is then impossible under compose, and only accidentally possible under mate.

**Correction:** For compose and mate, every recipient action survives with the same allowed flag and the same guard cone after id renaming. Pruning removes only recipient nodes that are outside all output cones and outside all action and guard cones, and that are not the selected substitution site. Donor graphs contribute no actions and no guards. “Whole-task replacement” means any of: the selected site is an action or lies in a guard cone; an action or guard cone differs; a donor action appears. Payload replacement of a pure node whose recomputed type is exactly the replaced node’s type is allowed. That is the path-donation case.

Guard cone means the Boolean guard roots of each action plus their data ancestors, using the IR’s actual guard edges. Ancestors shared with a payload stay on the recipient side. If the graft would rewire them, reject. Integer-as-Boolean guards are ineligible until the parent graph has real Boolean guards.

**Obligation:** A mate fixture whose guard AST hash is stable modulo the recorded id map; a compose that attempts to prune a non-output action and is rejected; a negative case that selects a guard ancestor as `replaceNode`. Lean’s “unchanged protected guard structure” stays an unproved lemma until it is checked. The runtime test is not that lemma.

### R3. Fixture 4 prescribes evaluator behavior the candidate also freezes
**Severity:** high. **Sections:** 2 and 8.

The candidate forbids a new evaluator, then requires a false-guard walk child to be “skipped” while still showing payload `path[A,C,D]`.

**Counterexample:** Under existing QDL, a false guard might skip payload construction, raise before the guard, or omit the payload from the result. Any of those makes the oracle unsatisfiable unless someone changes the evaluator. “Reject eager action branches” has no decision procedure in the text.

**Correction:** Split the fixture. The construction requirement is the surviving action, unchanged false guard, and donated payload expression in the emitted source. The run oracle is whatever the current experimental evaluator already does for that source shape, recorded before the ranch ships. If that behavior is not “visible path and no effect,” change the written oracle. Do not add an evaluator. If the donated expression can raise or diverge, reject the candidate when a false guard does not protect that evaluation; if the language is total on the whitelist, say so and keep the expression total in the fixture.

**Obligation:** One characterization test on current QDL for a hand-written false-guard action, plus the ranch test that the grafted source matches that shape and performs no extra runs during preview or admission.

### R4. Child signatures are unspecified
**Severity:** critical. **Section:** 2.

“Rewrite all recipient uses/outputs” can be implemented as a rewrite of every recipient output. Input arity after a graft is never stated. Merge’s report can be misread as flattened fields.

**Counterexample:** Budget inputs are `(desired, available)`. Replacing `available` by position 0 substitutes `desired` instead. The section 8 child `{allocated:12, remaining:8}` is then the wrong graft: it is the result of overwriting `available` with mean `20 L` while `desired` stays `12 L`, under an arithmetic story the candidate never states. A second counterexample: both parents have an input named `xs`. Merge by name zips unrelated lists. A third: donor output `L` and schedule output `s` are flattened into one numeric report and added.

**Correction:**

- Compose input list: recipient literal inputs, in order, without the replaced port, then the donor cone’s new leaf ports, in deterministic leaf order. Declared outputs: exactly the recipient’s ordered outputs. Recomputed type of each must match the recipient output type, including units, optionality, record fields, and refinements. Arity changes at outputs reject.
- Mate: same output rule. Inputs gain the donor leaves and lose a port only when the replaced node is itself a literal input.
- Merge inputs: all parent0 ports in order, then all parent1 ports, namespaced, with no dedupe. One report field per declared output port, in order `a0..aN` then `b0..bN`. The field’s type is that entire output type. Records stay nested. Combined output-port count above 16 rejects. `|nodes(p0)| + |nodes(p1)| + 1 > 64` rejects before any rewrite. Actions run as `(namespace, name)` under their own guards. The report reads declared outputs and is not itself an action.
- Port selectors in the API are stable indices or unique ids in the recomputed graph. Bare names that are not unique reject.
- Parents are an ordered pair, index 0 then index 1. `base: 0|1` uses that order. Seed preimage and candidate id use role order.

**Obligation:** The mean-budget fixture must name `donorOutput` and `recipientInput` and expect `{allocated: 12 L, remaining: 8 L}` only after the existing `budget` semantics are shown to compute that. A swapped-port negative test is mandatory. Merge’s oracle is a full record with litres in one field and seconds in another, plus a case with two `walk` actions where only the true guard runs.

### R5. Exact equality and the flagship fixtures disagree
**Severity:** high. **Sections:** 2 and 8.

The type rule is exact normalized structural equality, with `L` distinct from `mL`, and `L*s*s^-1` normalizing to `L`. Fixture 2 feeds a filtered list to `weightedMean` and expects bare `child 36`.

**Counterexample:** Filter yields `List L` of unknown length. Weights are a length-3 vector. Exact equality rejects the pair, so the acceptance child is ill-typed under the candidate’s own rule. If an implementation inserts a length coercion to make the demo succeed, it has broken the type rule. The printed oracle `36` also drops `L`.

**Correction:** Keep exact equality, including symbolic dimensions, field order, and optionality. Do not add an adapting cast. Replace fixture 2 with two programs whose seam types are exhibited and identical; the expected value is `36 L` if the quantity is volumetric. State the normalization laws that are actually in the comparer, including record field order and the unit rewrite used for `L*s*s^-1`. Refinement obligations at the seam and on the child are recomputed. Checker failure or checker crash rejects. A missing refinement check is a reject, not a pass.

**Obligation:** A seam-type fixture that prints both normalized types; a deliberate `L` versus `mL` reject; a refinement failure at the graft; a unit-carrying weighted-mean oracle. Full IntentIR refinement soundness remains unproved. The obligation is to run the checker and refuse on failure, not to claim it is complete.

### R6. `repeats1` changes executable meaning
**Severity:** high. **Section:** 2.

The novelty comparison treats repeats as part of the executable task, then task recipes force `repeats1`. Body correctly keeps base repeats.

**Counterexample:** The recipient’s task is defined as repeating a sample or a schedule. The child runs the grafted body once. Outputs differ from the recipient for the same inputs, with no diagnostic. Merge of `repeats=3` with `repeats=5` has no single honest repeat count.

**Correction:** Compose and mate keep the recipient’s repeats. The donor is inlined into one recipient execution, not wrapped in the donor’s outer repeat. Merge keeps per-namespace repeats when the IR can represent them; unequal repeats with a single task-level counter reject. Body keeps base repeats. The emitted child round-trips to that same repeat count.

**Obligation:** Recipient `repeats=3` produces a child `repeats=3` whose run count matches a hand-written recipient with the same graft, and a merge reject when repeats differ and cannot be represented separately.

### R7. Node-origin bound does not cover every recipe
**Severity:** high. **Sections:** 2 and 5.

Merge is capped at 64 nodes. Compose and mate are not. A candidate may carry at most 64 origin rows. Recovery of parent identity for every node is then impossible past that bound, or admission fails for a reason the recipe never states.

**Correction:** Every recipe rejects when the child node count exceeds 64, counting the report. Every emitted node has exactly one origin: `parent0`, `parent1`, or `generated`. Origin rows and nodes are the same set. Internal caps use the same count.

**Obligation:** A 64-node child admits; a 65-node graft rejects in preview with no store write.

### R8. Source, companion, and “complete task” are one claim
**Severity:** high. **Sections:** 1, 3, 5, 6, and 7.

Section 1 says every child carries a complete task in constructor source. Section 3 says source-only recovery does not reconstruct typed interpretation. Section 5 allows another derivation of the same source to keep the first companion untouched. Those three rules together let two types sit under one source, or let a typed demo be “recovered” from source that does not contain the types.

**Counterexample:** Derivation 1 stores source `S` with companion `C1`. Derivation 2 rebuilds the same bytes with recomputed companion `C2`, different refinements or units, because a policy pin changed only metadata. The store keeps `C1`. Inspection of derivation 2 shows derivation 1’s types. A second failure mode: body inheritance “retains companion metadata where available” after style emission has drifted from the graph that metadata describes.

**Correction:**

- Child source is the executable constructor. The admitted companion is the recomputed IntentIR, stored beside it, and is what the inspector calls the typed operation.
- Pipeline for typed recipes: parse source; if an intent is present, its executable graph must match the source graph with design erased; recompute types; disagreeing submitted contracts reject. Null intent rejects compose, mate, and merge. Body may be metadata-free and is labeled `metadata-free-body`.
- Emit child source from the frozen graph with hygienic role/index binders. Reparse and recompile. Inequality rejects.
- Same source hash with a different companion hash is `source-companion-conflict`. A second derivation may add a lineage row only when the companion hash matches. It does not rewrite metadata and does not attach a second typing.
- Annotate uses this same graph equality and writes only absent or identical metadata. Mismatch writes nothing and runs nothing.
- Section 1’s recoverability sentence should say the child source is independently executable, and that units, thought, and lineage are present only when the companion or the parents are present. Source-only recovery keeps the section 7 labels.

**Obligation:** Round-trip source hash equality; conflict reject; null-intent reject for the three task recipes; annotate mismatch writes zero rows; a fresh runtime whose store contains only the child artifact still runs the section 8 value oracles.

### R9. Heredity application can move the task, and the seed does not commit to the traits shown
**Severity:** high. **Section:** 3.

Topology is generated, then trait scales are applied, then the whole source is validated. Quantization is `Math.round` to `1e-6`. The seed preimage lists policy identifiers and style, and does not clearly include the post-mutation trait vector. JS `Math.round` is asymmetric on negatives (`Math.round(-1.5) === -1`) and tie-sensitive in binary floating point.

**Counterexample:** A serializer reapplies “scale-like” numbers to every literal, including a task threshold that happens to share digits with `axesY`. The body child no longer has the base task. Another: two engines quantize a negative curvature differently, so website and MCP derivation ids diverge for the same nonce. Another: recorded deltas claim two loci changed by 80, but recomputation from the seed does not, and recovery still displays a verified genome.

**Correction:** Freeze the base executable DAG before any trait function. Traits write only the closed visual parameter list: axial scale, radial scale, bend, gesture strength, phase rate, chroma strength, each from `g = trait/1000`, then clamp to existing field domains. Owners, hinges, and task nodes are not retargeted. Quantize in integer micro-units, half away from zero, and normalize negative zero before emit. If assembly validation fails, reject. The persisted heredity block contains parent source hashes, intent hashes, seed digest, pre-mutation draws, actual deltas, and the final six traits. The seed preimage is a specified canonical JSON document: a fixed domain string `quineling-heredity-v1`, role-ordered parent hashes, recipe, nonce, mutation mode, final trait vector, and graft/compiler/assembly/heredity policy ids. Recovery labels heredity `asserted-unverified` until both parent sources are supplied and the seed and deltas recompute. A mismatch is `inconsistent`. The task remains runnable. The child does not embed its own hash.

Legacy measurements stay labeled measurements. Resolved anatomy is regenerated from the child graph and then scaled. It is not a blend of parent meshes. Incompatible visual scalar lenses drop with a diagnostic. Executable projections that the output type depends on are not dropped; the candidate rejects.

**Obligation:** Body child’s normalized DAG and repeats equal the base on a shared input set. Integer quantization vectors include `-1000`, `-1`, `0`, negative ties, and a 4-byte UTF-8 character at the 65536-byte source cap. A bad delta is labeled inconsistent and still does not run during preview. Schema values correspond to the Lean integers only after that integer law is written; until then the blend is unproved.

### R10. Equal-source policy blocks a real composition, and import can look like birth
**Severity:** medium. **Sections:** 2 and 6.

Self-pairing of one resident should stay forbidden. The further ban rejects every task recipe whose parent sources are equal, including a manual library compose of a program with its exact-source copy.

**Counterexample:** `double` reproduced by the existing copy operation cannot be composed with the copy, so the ranch cannot build `double∘double`. Separately, a library child imported into the world is a new resident with energy 60. If the UI treats source equality as family membership, the import becomes a second birth with no charges and no proposal.

**Correction:** World pairing and the family demo reject equal-source task recipes and self-ids. Manual library compose, mate, and merge of equal sources are allowed only with classification `same-source-composition`. Body stays `same-source-variation` or `variation`, including repeated manual source references. Import never creates nursery status, offspring links, or charges. Only the world admission transaction does. Origins and targets agree: `manual` with `library`, `pairing` with `world`. Pairing admission carries the recipe, nonce, style, and child source hash, and consumes the proposal only when the rebuild matches. The demo is a fixed script of those public commands.

**Obligation:** Equal-source manual compose of a pure function with its copy yields one inlined pipeline and the classification above. Equal-source world mate rejects. Import of a child artifact creates an adult who is not a child in lineage. Cancelling admission mid-demo leaves zero new artifacts.

### R11. Identity of the candidate is not pinned to the graft policy
**Severity:** medium. **Sections:** 5 and 6.

Candidate id is “parent/version/style pins and recipe.” Nonce, port indices, intent hashes, and graft policy can fall outside that phrase. `Q.canon` is explicitly not RFC 8785, but the canon that ids and idempotency keys use is not specified. Preview is deterministic only if that canon is shared by the website, TypeScript, and MCP.

**Correction:** Publish one canonical JSON subset and test vectors. Candidate-id preimage includes parent artifact ids, intent hashes, ordered recipe selectors, nonce, style, final traits, and the policy ids from R9. World revision and ticks stay out of the candidate id and stay in the freshness check. Derivation id adds the child source hash. Admission looks up the idempotency key before freshness checks, inside the same synchronous snapshot swap as the commit. Same key and same canonical payload return the stored acknowledgement, success or refusal. Same key and different payload refuse. After the commit point there is no check that can fail. Rejection restores every staged store and both parent charges.

Session memory is not crash durability. The docs and agent card should say a restart can forget keys. That limitation is acceptable for this experiment only while it stays explicit.

**Obligation:** Two adapters hash the published vectors to the same SHA-256 as platform crypto. A duplicate admit returns one child. A payload collision on the key refuses and writes nothing. A forced companion mismatch refuses. These are runtime tests, not the Quint idempotence theorem.

### R12. Generated language must stay inside recipe facts
**Severity:** medium. **Sections:** 2 and 7. Specialty utility.

Bounded generated names and companion descriptions can invent a purpose the graft does not have.

**Counterexample:** A merge that only juxtaposes litres and seconds receives the description “efficient joint optimizer.” The user recovers a fiction. The candidate already forbids a joint objective and forbids fabricated English source spans.

**Correction:** Display names are role/index or hash labels plus the classification from R10. Descriptions are templates filled from recipe facts: which index, which types, which actions survived. Source maps point at real parent spans or at clauses tagged generated. Dangling parent spans, when parents are absent, are labeled unresolved. The child still runs.

**Obligation:** Snapshot the inspector text for the five fixtures and reject adjective catalogs. Origin row, source clause, and parent node agree when parents are loaded.

### R13. Section 8 oracles need to be programs, not sketches
**Severity:** high. **Section:** 8.

The five examples are the only usefulness proof the candidate offers. Several are under-specified, and one drops a unit.

**Correction:** For each fixture, freeze parent sources, selectors, normalized seam types, child source, both asserted heredity blocks, and the literal result of one explicit Run in a fresh store. Add the negative controls already named in section 8, plus: impure donor, guard-node replacement, unit mismatch, 65th node, null intent, equal-source world task recipe, preview/admit/tick/render/replay run-count staying zero, and ceremony replay creating zero artifacts.

`mean → budget`, `filter → weightedMean`, and the walk payload are valid only if current experimental QDL already has those constructors and the recorded results. If it does not, write the fixture programs and set the oracle from their current behavior. Do not change the evaluator to hit the numbers in the prose.

## Optional enhancements

- Document the center bias of `floor((A+B)/2)` and the “at most two loci” mutation in the inspector. The candidate already says the draws are not unbiased. No algorithm change is required.
- Multi-hole substitution in one request. Nesting admitted children is enough for the first implementation.
- Reject a syntactic no-op graft that only inserts an identity node. Structural novelty already admits it, and the candidate correctly says structure does not prove different behavior on all inputs.
- Crash-durable ledgers. The candidate already refuses to call in-memory atomicity durability. Leave it out of the first implementation.
- Visual epsilon so a 1e-6 trait change is not presented as a meaningful body. The honesty rule that hash difference alone is not novelty already covers the formal side.

## Unproved properties

These are not defects by themselves. They become defects if implementation copy or a green world-model run presents them as established.

- Type preservation of substitution, seam refinement completeness, and normalization confluence for the full IntentIR.
- Namespace injectivity and closed-cone reasoning, including the Lean lemmas named in section 8.
- That an unchanged guard AST modulo renaming exhausts every control dependency in the real IR.
- SHA-256 collision resistance, and any claim that `Q.canon` is RFC 8785.
- That a structural DAG change changes results for all inputs. The candidate already denies this. Keep the denial on the inspector.
- Quint mutual exclusion, epoch freshness, idempotence, and atomic two-parent charges. Those are model obligations, not evidence about grafts. The model’s small domains do not cover IntentIR.
- Global geometry, atlas regularity, continuous collision, English fidelity, and beauty. Performance numbers in section 7 are unmeasured targets.
- Parser and heredity-schema correspondence for every client. One Lean integer law plus schema tests does not verify every parser.
- Fixture arithmetic for `budget`, `weightedMean`, and skipped actions, until characterized on existing QDL.
- Independent executability of children whose donor literals were not lifted into the child. That property is true only after R1 and R8.

## Aesthetic and utility notes

The recipe set is the right size for useful offspring: compose is a computation connection, mate is a guarded payload edit, merge is a product of unlike quantities, and body is appearance with the base task held fixed. That is a mathematical garden rather than a genetic costume, provided the inspector shows the seam.

What should be visible, and is the aesthetic standard for this specialty:

- Donor type and recipient type at the single connection, with units and the equality result.
- Which recipient actions and guard cones were held fixed.
- Child inputs and outputs after signature surgery, in order.
- `not-run` until an explicit Run, then an execution id distinct from the derivation id.
- Classification: `compose`, `mate`, `merge`, `body`, `same-source-composition`, `same-source-variation`, `variation`, `metadata-free-body`, `imported`.
- Heredity as asserted, unverified, or inconsistent. Regenerated anatomy is a fresh chart scaled by bounded integers, not a child-shaped average of the parents.
- Merge ceremony as two source bodies and a report, never as one fused objective.

Courtship ribbons and crossfades can stay decorative. They should not be the only explanation of the offspring. A luminous scene that cannot answer “which port was replaced, and in which units?” has failed the utility bar even if the frame-time targets are later met.

Similar silhouettes remain honest only with source-hash labels, as section 7 already asks. Generated pet names that imply purpose undo that.

## Recommendation

**Do not implement from this snapshot.** Accept the candidate for implementation after R1–R13 are edited into the design text and the section 8 oracles are concrete programs with seam types.

When those corrections are in, the implementation contract is:

1. One pure, closed, hygienic graft function shared by preview and admission.
2. Typed recipes that recompute types and reject null or disagreeing intent.
3. Effect and guard survival for compose and mate, recipient repeats preserved, merge as a namespaced product under the 16- and 64-caps.
4. Admission that rebuilds, conflicts on companion mismatch, and never runs a task.
5. Recovery that executes a child without parents, and that labels missing thought, unresolved spans, and unverified heredity.
6. Quint and runtime tests for pairing, idempotence, charges, and passivity kept separate from unproved Lean substitution lemmas.

I would implement that revised candidate. I would not implement the current wording of the slice, the `repeats1` rule, the unitless fixture 2, or the companion-retention sentence.
