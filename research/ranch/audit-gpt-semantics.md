# GPT semantics audit of the converged ranch candidate

Audited `docs/RANCH-CANDIDATE.md`, dated 2026-10-04, independently before implementation. Scope: substitution, merge/body recipes, truthful companions, protected actions, independent offspring, and deterministic identities. Read repository `AGENTS.md`, `thought.js`, `kernels.js`, `core.js`, relevant SDK admission code, and the semantics brainstorm as supporting material. No shared implementation was changed, no credentials accessed, and no live world actions performed.

Verdict: **revise before implementation**. The candidate has strong useful boundaries: exact normalized types, pure donor closures, no parent callbacks/results, complete constructor validation, independently recoverable child source, and explicit simulated task execution. The following gaps need concrete resolution. Severity denotes design impact; no new ranch implementation or implementation tests currently exist.

## Required fixes

### S1 — High: compose can weaken an action guard

**Candidate:** §2 compose versus mate; §8 protected-guard acceptance.

Mate protects recipient actions and every ancestor of each Boolean guard, but compose specifies only literal replacement, exact types, pure donation, pruning, and surviving recipient computation. It does not apply the guard-cone or action-survival requirements. Changing the spelling of the recipe therefore changes the protection for the same substitution.

**Counterexample:** recipient has `guard=false:boolean`, `payload="route":string`, and `walk=action(guard,payload,{allowed:true,action:"walk"})`, output `walk`. Donor declares `compare(1,gt,0):boolean`. Compose donor output into recipient literal `guard`. All stated compose checks pass: exact Boolean type, pure donor closure, surviving recipient action, and donor contribution. Parent action is skipped; child action is simulated. A numerical guard ancestor can be replaced similarly, even if direct Boolean replacement is prohibited.

**Exact correction:** append to compose: “Apply mate's protected recipient action/guard-cone rule before substitution and after pruning. Reject any destination in a direct action guard's transitive predecessor cone. Every original recipient action must survive with its opcode, action name, allowed flag, and ordered guard cone unchanged under the injective namespace map. Apply eager-action-branch rejection to the resulting child.” Do not require preserving actions outside the imported donor closure: importing that pure closure deliberately excludes donor actions.

**Independent obligation:** reject both direct Boolean and indirect numerical guard replacement through compose and mate; reject pruning away an original recipient action; allow a same-type pure payload substitution while retaining false-guard and `allowed:false` behavior. Prove the same protected-cone predicate for both recipe constructors, rather than only mate. Check every node/ordered port/parameter in the cone, including repeated ports.

**Evidence:** an isolated inline Node experiment using existing `ThoughtCompiler.compile` and `QuinelingKernels.run` accepted the hand-transformed child. Recipient output was `skipped`, with no effects; child output was `simulated`, with one simulated walk receipt. This verifies the primitive-level counterexample, not an implemented compose API.

### S2 — High: body cannot both rename every task node and retain exact task/companion metadata

**Candidate:** §2 body and “All generated child node IDs”; §6 annotate; §7 truthful source inspection.

Body promises the base parent's exact task projection/repeats and retention of supplied companion task metadata. The unconditional role/index child-node naming rule changes the task projection and invalidates retained IntentIR node references. Recompiling that retained companion then fails the exact source-graph comparison used for later typed recipes. Graph names and mechanical source clauses can create the same problem if regenerated during body inheritance.

**Counterexample:** typed base uses literal `values` and step `average=mean(values)`, output `average`. Body child renames them to `p0n0,p0n1`, output `p0n1`, while retaining base IntentIR. The recompiled companion still names `values,average`. A future typed offspring request rejects a child produced by the body recipe itself. An isolated comparison of these existing compiler graphs confirmed that they differ.

**Exact correction:** scope generated role/index IDs and regenerated task names/clauses to compose, mate, and merge. For body, preserve the entire source task projection excluding design, including graph name, node IDs/order, ordered ports/outputs, parameters, and repeats. Preserve compatible base IntentIR/contract/source-map references; generate separate derivation descriptions rather than rewriting the retained thought. Regenerate body ownership against those preserved node IDs. Another coherent policy is to remap the entire companion and clearly label its generated description, but then replace the claim of retaining the exact task projection/metadata with an explicit alpha-renaming contract.

**Independent obligation:** a typed body child must remain eligible as a typed parent; its recompiled companion must match its source graph. Assert byte-identical task projection and repeats under the recommended policy, including nontrivial IDs and repeated input ports. Check metadata-free body inheritance still produces no invented intent/units/authorship.

### S3 — High: candidate identity omits a source-determining input

**Candidate:** §3 seed digest; §5 candidate/derivation identity; §6 required nonce.

The seed definition includes nonce, but the candidate-ID definition lists parent/version/style pins and recipe without nonce. Read literally, two requests with identical listed pins and different nonces identify one candidate while producing different seeds, topology/traits, and source. Binding childSourceHash separately prevents accepting the wrong source, but does not make a candidate ID an unambiguous construction identity.

**Counterexample:** preview twice with the same ordered parents, recipe, style, and policy IDs, changing nonce from 0 to 1. §3 permits different generated bodies. §5's stated candidate-ID material is unchanged.

**Exact correction:** define one closed canonical construction-key object containing a domain tag, both ordered exact source hashes and intent hashes, complete recipe, complete style, nonce, and compiler/assembly/heredity policy IDs. Compute candidate ID from that complete object; derive the generation seed through a separately tagged hash of the same material. Derivation ID binds candidate ID and exact child source hash. State whether social origin is excluded from construction identity and bound separately at admission, or included; either is workable, but the choice must be explicit. Include every other source-generating input if later added.

**Independent obligation:** independent golden vectors for canonical key bytes, candidate ID, seed bytes/endian projection, child source, and derivation ID. Vary each field independently, including nonce, ordered roles, null versus nonnull companion hash, mutation, full traits, and each policy ID. Same complete key in fresh runtimes must yield identical source/maps. Digest equality relies on the stated SHA assumption; do not present nonce variation as a mathematical guarantee of different phenotype.

### S4 — Medium: surviving recipient computation need not be connected to the donation

**Candidate:** §2 compose/mate contribution requirement; §1 actual typed operation; §7 typed connection display.

At least one surviving recipient operation and actual donor contribution do not require a computational connection between them. A donor may replace a literal that is only a declared output, while an unrelated recipient calculation survives. The child then exposes parallel results, which is a useful merge-like construction, but does not substantiate compose's claimed computation connection.

**Counterexample:** recipient declares outputs `[available, total]`, where `available` is a literal and `total=sum(otherValues)` is independent. Donor declares a mean output. Compose into `available`; rewrite the output to the donor mean and retain the recipient sum. All stated contribution checks pass, but no recipient operation consumes the donated value. Mate can likewise replace one terminal output while retaining unrelated recipient computation.

**Exact correction:** for compose require a surviving original recipient **nonliteral** operation transitively downstream of the replaced literal, with a path from the imported donor node to that operation and onward to a declared child output. For mate either require the same integration witness or explicitly disclose terminal-output replacement as permitted and distinguish it from an integrated computation. Define “reject whole-task replacement” mechanically using surviving recipient-origin computation; a surviving unrelated literal must not discharge it. Merge remains the explicit parallel-output recipe.

**Independent obligation:** reject compose's output-only substitution and literal-only surviving recipient remnant; accept mean-to-budget integration; preserve repeated donor references and ordered outputs. Require the witness to reference actual child edges/node origins, not English text or a cached donor result.

### S5 — Medium: absolute task-evaluation wording conflicts with required refinement compilation

**Candidate:** §§1, 2, 4, 6, 8 passivity claims and recompilation/refinements.

Existing `ThoughtCompiler.compile` evaluates pure kernels using `K.calculate` to check finite intermediate values, nonempty means, matching weights/positive mass, and other refinements. It deliberately leaves action nodes unevaluated. Recompiling parents/children during preview therefore performs pure computations even when `K.run` and `Q.execute` are never called. The statement “only run/reproduce evaluate tasks” is too broad for this required validation path.

**Counterexample:** preparing mean-to-budget recomputes the supplied mean during compile, and weighted-mean validation calculates products and totals. This cannot satisfy a literal prohibition on evaluating any task computation during preparation.

**Exact correction:** define passivity as: “Only explicit run/reproduce invokes the task interpreter/constructor executor or creates execution records/simulated action receipts. Preview/annotation/admission may perform bounded pure compile-time refinement evaluation against source literals, never actions, runtime overrides, or stored run results.” Keep refinement evaluation bounded and distinguish its cost from task runs in diagnostics and metrics. If absolutely no evaluation is intended instead, specify a new static refinement checker and its adequacy obligations before implementation.

**Independent obligation:** instrument `Q.execute`, `K.run`, action calculation, execution-record creation, and effect emission separately from pure refinement calculation. Preview/admission/recovery/world/renderer paths must produce zero task interpreter calls and zero action evaluations/receipts. Do not weaken this to zero externally visible network effects: all actions here are already simulations.

## Optional enhancements and accepted limits

- Add independent merge fixtures with duplicate action names and repeated output ports. Preserve separate receipts and ordered `a0..aN,b0..bN` fields; effectful merge is explicitly permitted and does not need pure-donor restrictions. Repeats=1 is already disclosed for task recipes; describe merge as retaining both DAGs, rather than reproducing each parent's full repeat behavior.
- State that “symbolic dimensions” means symbolic units in the current type algebra. Existing array types contain element types, not dependent length indices. Keep cardinality/refinement checks separate; accepting equal array element types must not skip resulting weighted-mean length/mass validation. Adding dependent lengths is optional.
- Publish resolved-body/source golden vectors across supported JS engines if cross-engine determinism is promised. Six-decimal quantization alone does not specify every floating-point threshold or assembly-generation decision. The candidate currently supplies policy IDs but no complete conformance corpus.
- Keep parent hashes in authored heredity explicitly asserted, separate from externally validated derivations. Exact source recovery cannot authenticate ancestry, recover companion units/thought, or recreate missing derivations. The candidate correctly states these limits.

No universal behavioral-novelty claim is needed. The required useful fixtures plus fresh isolated source recovery/run/copy checks can demonstrate independently executable offspring. Structural novelty and a new source hash remain separate from behavioral novelty. New Lean/Quint lemmas and controller tests are obligations proposed by the candidate, not evidence already delivered.
