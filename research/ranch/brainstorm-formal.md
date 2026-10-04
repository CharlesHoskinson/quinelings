# Ranch formal obligations for candidate convergence

Proposal, 2026-10-04. Read `AGENTS.md`, the ranch workplan, generative formal model, existing semantics/genetics/social/biology brainstorms, `spec/creation.qnt`, and `spec/lean/QDL/Assembly.lean`. This report changes only this file. Definitions and obligations below are proposed; no new theorem or model run is claimed.

Recommend a separate `ranch.qnt` interaction model and small Lean modules for typed transformations and genes. Keep the existing creation model: it describes source creation, explicit execution and exact copying, whereas ranch admission creates an inert resident with a new source. Existing SDK reproduction performs a fresh run and is not a birth primitive. The nine candidate audits should review one concrete recipe and transaction, rather than these alternatives independently.

## Convergence decisions required

1. Take social reciprocity and biology's atomic admission as the lifecycle baseline. Birth is an explicit command; courtship only makes a proposal. Pair enablement defaults false, is world-local, and is not external authority.
2. For the first task-mating recipe use exact normalized types, a pure donor dependency closure, complete recompilation, generated anatomy and a protected recipient action/guard cone. An even narrower pure-parent recipe can ship first; effectful composition must remain disabled until its additional obligations pass.
3. Treat parent source and companion IntentIR as separate identities. Never infer dimensions from executable numeric literals or recover historical thought metadata from source. Body-only variation can have a different admission predicate from typed mating.
4. Resolve genetics' optional source-embedded recipe versus semantics' companion lineage explicitly. Resolved task/body must remain self-contained in source; verified derivations remain external, bounded records. A source-embedded parent assertion is not verified lineage. No child-source hash inside its own source.
5. Freeze a recipe's ordered parent roles, seed encoding, integer trait bounds, mutation algorithm, versions, and proposal-id inputs before claiming determinism. Different recipes cannot share a compatibility marker merely because their fields look similar.

## Quint: concrete state and small exploration domain

Use one state root so rejection and birth atomicity are expressible. The following are a concrete field plan, not paste-ready Quint syntax. Encode finite maps as maps over fixed integer IDs plus `active` flags if that simplifies total lookups. Optional references use `-1` with an explicit validity invariant; do not overload a valid source token as missing.

```text
ParentStamp = { resident, source, companion, policyEpoch }
Resident = { active, source, companion, policyEpoch, adult,
             pairEnabled, restLatch, energy, partner, pendingProposal,
             slot, readyAfter, bornTick, matureTick }
Pair = { active, a, b, stampA, stampB, slotA, slotB,
         deadline, dwell, arrivedA, arrivedB }
Proposal = { active, used, a, b, stampA, stampB, world,
             recipeVersion, expires }
Candidate = { active, proposal, childSource, childCompanion, derivation,
              stampA, stampB, world, recipeVersion, validatorVersion,
              expires, validGraph, validOwners, validGenes, validBytes }
RequestResult = { used, request, payloadToken, child, derivation }
State = { world, tick, paused, residents, pairs, proposals, candidates,
          artifactSources, artifactCompanions, derivations, requests,
          occupiedSlots, nextResident, nextCommand,
          executions, receipts, records, births,
          last, previousStateProjection }
```

Model three resident slots, one nursery designation, two proposal slots, one candidate slot, two artifact slots and two request entries. Three residents allow contention for one child slot. Give sources and companions independent finite exact-equality token sets, including a missing-companion value. Give world IDs at least two values to exercise reset races. Model distinct proposal IDs and a used tombstone/consumed status: merely deleting a proposal cannot establish one-birth-per-proposal. Add bounded command/request counters; no wrap or silent ledger eviction. A reset changes the world identity and rejects old candidates; world-scoped request IDs prevent replay across resets.

Use exact `energy ∈ 0..100` initially; it is already finite. The biology report's threshold samples alone are not transition-closed: e.g. 50−2=48 and 50−30=20. A coarse quotient requires a simulation relation preserving every guard and update, or nondeterministic sound overapproximation with documented spurious counterexamples. Reduce actor counts/timer lengths before replacing arithmetic with an unjustified rounding policy.

Use small timer constants preserving order and half-open deadlines, e.g. approach=2, court=2, proposalLife=3, nursery=2, cooldown=2, tick ceiling=12. These explore ordering, not the production durations. Production fixtures separately use 160/80/600/200 and the ceiling 1,000,000. Saturating cooldown is allowed; birth/maturation deadlines must fit before admission. Bounded exploration requires bounding revisions, epochs and instrumentation counters as well as population; the existing creation model's revisions are not intrinsically finite.

### Actions and exact invariants

`view`, `inspect`, `recoverPreview`, `prepare`, `prepareResponse`, `withdraw`, `invite`, `pair`, `tick`, `admit`, `reject`, `run`, and `reset` are distinct actions. Pure compilation may evaluate pure operators as validation evidence; it may not call the task interpreter or mint a RunRecord. A passive source recovery can explicitly admit an artifact in the SDK, so distinguish that operation from a ranch preview and from birth. Its allowed store change must be specified rather than asserting every recovery preserves every store.

| Obligation | State predicate / transition postcondition |
| --- | --- |
| Passive world and previews | For every action except explicit `run`, executions, receipts and records are unchanged. `view` preserves the entire authoritative state; camera/body phase live outside it. `prepare` preserves residents, energy, artifact and derivation stores; only bounded proposal-candidate bookkeeping may change. |
| Mutual pairing | Every active pair has distinct active adult participants, both enabled and not resting; reciprocal invitations existed in the predecessor state. `r[a].partner=b ⇔ r[b].partner=a`; each resident belongs to at most one pair. Withdrawal/removal cancels both references and reservations in one step. |
| Proposal correspondence | Each active unconsumed proposal has exactly its two parent pending links, no parent has two unresolved proposals, and no proposal creates a resident. Expired/withdrawn proposals have no live candidate or pending links. |
| Freshness | An admissible candidate has current world/version, exact source AND companion identities, policy epochs, active resident identities, matching pending proposal and `tick < expires`. A source-only parent is unavailable for typed mating. Re-enable after withdrawal cannot revive a stamp. |
| Capacity | Active residents ≤ residentCap; nursery residents ≤ nurseryCap; stores within their separate bounds. Occupied resident slots correspond bijectively to active residents; pair rendezvous reservations are separate from resident spawn slots. No overlapping reservations are admitted. |
| Atomic birth | New successful admission adds exactly one child resident, one nursery designation and one request result; inserts only missing artifact/derivation entries; charges exactly 30 to EACH parent; consumes exactly one proposal and removes its candidate. No task counter changes. Reused artifacts do not waive resident/derivation capacity. |
| Reject/idempotence | Rejection preserves all authoritative stores, residents, energies, consumed status and counters, apart from a bounded diagnostic field. Replaying a successful request with the same payload returns the saved result with zero delta; different payload is `request-conflict`. A used derivation/proposal cannot create another child under a new request. |
| Child independence | Child authority is empty, pairEnabled=false, record absent; no parent records, budgets or companion participation are copied. Maturation only changes lifecycle designation/readiness and does not run or enable pairing. |
| Energy/deadlines | Energy remains integer 0..100; no charge before both parents satisfy ≥50. Latch sets below 20 and clears at ≥60. Expiry wins at equality; arithmetic never wraps; tick exhaustion cannot advance age. |

Define `canAdmit(s,c,request)` as the conjunction of the freshness, validator, parent-energy, spawn, metadata-conflict and store-capacity predicates. Compute the complete successor in a pure function, then one `s' = successor` assignment. A preflight of available capacity is insufficient if later async work occurs: perform the guard again immediately before the serialized commit. If SDK storage is outside this root, the implementation must supply a matching atomic batch protocol; world rollback alone cannot undo metadata enrichment.

Don't put `last == "admit"` exemptions around capacity/freshness safety. Record the predecessor projection needed for delta properties, and assert `births = successfulNewRequests = committedChildAdmissions`; imported residents are counted separately. Energy is renewable ecology, so do not reuse creation's conserved `energy + runs + children` equation. Avoid embedding complete predecessor states recursively; snapshot only the fields used by delta checks.

### Required traces and deliberate negative controls

Safe traces: reciprocal pair → dwell → proposal → prepare → admit → explicit child run; one-sided invitation cannot pair; two admissions compete for the final nursery slot; withdrawal then re-enable rejects an old candidate; response after reset rejects; matching source with changed/missing companion rejects typed mating; expiry at admission rejects; energy 49 refuses and 50 succeeds; repeated request after candidate deletion returns the original child; conflicting companion for an existing source leaves every store unchanged.

Keep unsafe actions outside the safe step relation. Each regression should deliberately enable one and assert its associated invariant becomes false:

- `unsafeViewRun`: increment an execution counter during view → passive fails.
- `unsafeUnilateralPair`: reserve an unwilling partner → mutual pairing fails.
- `unsafePartialBirth`: create a child/debit only A → birth delta/correspondence fails.
- `unsafeAdmitArtifactFirst`: enrich SDK companion before a later capacity rejection → rejection atomicity fails.
- `unsafeIgnoreCompanion` / `unsafeIgnoreEpoch`: accept a stale candidate → freshness fails.
- `unsafeEvictRequest`: forget a successful request and permit replay → one-birth/idempotence fails.
- `unsafeExpireAfterAdmit`: permit birth at `tick == expires` → deadline safety fails.

Suggested eventual commands, after actual implementation: `quint typecheck spec/ranch.qnt`; `quint test spec/ranch.qnt`; `quint run spec/ranch.qnt --invariant=safety --max-samples=10000 --max-steps=100`. Record installed tool version, seed, exact command and results. Random bounded runs are finite exploration, not exhaustive model checking; report the actual backend/search limits if a verifier is also used. Termination of preparation comes from a fixed attempt bound; social progress/starvation freedom requires additional assumptions and is not established by these safety invariants.

## Lean: mathematical definitions and theorem targets

Put proposed definitions in `QDL/RanchTypes.lean`, `QDL/RanchTransform.lean`, `QDL/RanchGenes.lean` and a global ownership extension only after candidate convergence. Prefer proof-carrying admitted values; separately prove validator soundness so validity is not merely an assumed premise.

```text
Unit := finite map BaseUnit → integer exponent, zero entries removed
Ty := scalar Unit | boolean | string | null | array Ty |
      record (finite unique field map) | optional Ty
NodeId := Fin nodeCount
TypedNode Γ := opcode + ordered dependency ports + parameters + output Ty
TypedDAG := finite ordered nodes + proof(each dependency index < node index)
           + signatures/refinement evidence + nonempty bounded outputs
PureAt(g,n) := every node in dependencyClosure(g,n) is non-action
GuardCone(g) := action nodes ∪ dependency closures of their direct guards
Gene lo hi := { value : Int // lo ≤ value ∧ value ≤ hi }
AdmittedChild := task + assembly + gesture + source + validity evidence
```

`Ty` is recursive with finite record/array structure; bound depth in admission for a decidable executable checker. Type equivalence must implement the compiler's exact normalization, not invent unit conversions: `L` and `mL` remain distinct. Refined quantities such as nonempty means and valid integer allocations require their own predicates; structural type equality does not prove those predicates.

| Proposed theorem | Statement and important premise |
| --- | --- |
| `normalized_unit_eq_sound` | Equal normalized unit maps denote the same formal dimension expression. This does not establish empirical units or numeric conversions. |
| `remap_injective`, `remap_preserves_ports` | Deterministic parent-role/topological renaming is injective within the joined node domain and preserves repeated input ports and ordered outputs. |
| `donor_closure_pure` | An accepted donation contains no action in its entire transitive dependency closure, not only at its root. |
| `mate_preserves_typing` | A same-type pure splice into an unprotected recipient node, followed by correctly defined reachability pruning and acceptance of refinement checks, yields a well-typed acyclic bounded DAG. Structural preservation and refinement-validator soundness are separate proof obligations. |
| `guard_cone_preserved` | Accepted transformation retains an isomorphic copy of every recipient action and its full guard cone, with identical parameters/literals/ordered edges; no action is pruned. Composition likewise forbids bindings into guard ancestors. |
| `guard_evaluation_preserved` | Given deterministic pure semantics and unchanged guard inputs/parameters, guard values are identical before/after transformation (or have the same defined error). Guard-cone syntax alone does not establish runtime refinement or permission. |
| `pure_eval_has_no_receipts` | Evaluation of any pure dependency closure produces no receipt, even when a selected value comes from an eager `choose`. Explicit actions alone may issue local simulated receipts under their direct Boolean guard and allowed flag. |
| `child_closed` | Every dependency of the resulting task is defined within that task; evaluation needs neither parent program nor parent RunRecord. External authority/context is not a field of the source transformation. |
| `generate_deterministic` | Equal ordered parent source/companion values, canonical recipe, nonce and compiler/generator versions yield equal generated source, body and node maps. Prove equality from exact inputs; SHA-256 collision resistance is an assumption, not a Lean theorem here. |
| `mutation_bounded` | Each mutation changes at most the declared loci, stays within `[-1000,1000]`, and its magnitude ≤ configured bound. A direct bounded integer construction is preferable to float perturbation followed by ad hoc clamping. |
| `prepare_terminates` | At most eight finite attempts; each attempt has bounded nodes/components/source. Failure is an explicit result, never an unbounded search for novelty. |
| `birth_preserves_invariant` | For arbitrary finite stores satisfying capacity/identity invariants, `canAdmit` implies the pure atomic successor satisfies them; refusal returns the original authoritative state. Complements Quint's ordering exploration. |

For genes, fix a concrete integer function such as `blend(a,b,w)= floor(((1000-w)*a+w*b)/1000)` with `w∈0..1000`, using explicit Euclidean floor division for negatives. Prove bounds from bounded parents and convex integer weights. Mutate by an enumerated-locus `delta∈[-d,d]`, followed by specified saturation; prove closure and actual displacement ≤d. Specify hash byte order and seed projection separately. Reduction modulo a range gives a bounded deterministic choice but need not be unbiased; do not call it uniform without a distribution proof. uint32 seed collisions are expected and must not identify full recipes.

### Global ownership and anatomy obligations

Existing `Assembly.lean` proves local interval disjointness/interior and scalar/resource facts, not global partitions, a rooted attachment tree, or a typed graph transformation. Regenerating anatomy is a practical way to avoid inheriting invalid owner intervals, but still requires an accepted-assembly theorem.

Define `Assembly` as a nonempty bounded vector of components whose unique root is index 0; every later component has exactly one earlier parent and a validated socket. Earlier-parent indices prove acyclicity; prove connectivity to root by induction, plus depth≤4, fanout≤4 and components≤16 from the validator. Every graph node needs positive territory somewhere; multiple territories for one node are allowed. Every component needs a partition whose cuts are strictly increasing from 0 to 1 and whose owner IDs are valid graph nodes.

Use half-open cells `[cut_i,cut_(i+1))` and explicitly assign material coordinate `u=1` to the final cell, or prove all samples exclude 1. Existing `Owns` excludes the terminal endpoint; its adjacent-boundary theorem alone cannot establish total coverage. The proposed global theorem is: for every accepted component and every permitted material coordinate, exactly one cell owns it; every graph node has at least one interval of strictly positive measure. Palette, phase and social overlays leave that assignment unchanged. Global anatomy caps do not imply global ranch rendering feasibility: establish owner/chart reservations across the visible residents under the chosen shared sample budget, or expose a faithful inspection mode when reduced rendering omits territory.

Keep exact-rational gene/ownership fixtures and exact-real geometry separate from IEEE-754 execution. Existing gesture interpolation lemmas can support bounded gene-generated gesture controls; they do not prove sockets, collision-free world interpolation or visual beauty. Swept reservation safety, if pursued in Lean, should prove disjoint axis-aligned swept boxes imply disjoint guard-contained linearly interpolated bodies. It needs an analytic full gesture envelope premise, not observed sampled extrema.

## Implementation evidence and publication claim ledger

Replay selected Quint traces through the real controller with instrumented interpreter, receipt, artifact, lineage and resident counters. Compare rejection snapshots before/after SDK metadata attachment paths. Explicitly exercise hand-written graphs so compiler safety cannot mask an unsafe runtime. Use the mean/budget fixture from semantics: independent child recomputes mean 20 and allocation `{allocated:12, remaining:8}`; mere parent-output injection fails the independence test. Compare exact graph/source reconstruction and child reproduction separately from useful fixture output differences.

Test deterministic recipes under different render schedules, parent insertion orders and async completion order. Recipes use ordered parent roles and stable topological ties, so intentionally swapping roles is a different input; random map insertion changes are the equality test. Test 32 residents, eight nursery, minimum owner/chart budgets, full artifact/derivation/request stores, same-source metadata conflicts, stale response, maximum source bytes, interval endpoint 1, mutation negatives, tick ceiling, false guard, allowed=false, and repeated input ports. Tests must verify state/counter deltas, not only error strings.

Publish each result under exactly one label: **kernel-checked theorem**, **finite model exploration**, **runtime/browser test**, or **proposed obligation**. For each theorem record file/name/toolchain and successful build; for exploration record configuration/limits/seed; for tests record command and relevant fixtures. Current local assembly proofs and creation tests remain existing evidence and do not discharge ranch obligations. Typed purity, conservation of protected guard syntax, deterministic bounded genes and atomic modeled admission still do not prove English interpretation, novelty for all inputs, program equivalence, authenticated ancestry, creature consent, external permission, browser performance or JavaScript refinement. State those boundaries with the specific associated claim rather than a blanket assertion that the ranch is formally verified.
