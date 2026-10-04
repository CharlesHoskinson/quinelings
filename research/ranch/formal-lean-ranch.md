# Local Lean ranch contracts

Implemented only `spec/lean/QDL/Ranch.lean` and this report. The module imports installed Mathlib and defines `QDL.Ranch`; root integrates its import, schema correspondence and audit counters. No existing theorem, runtime file, check script, or peer file was edited.

## Kernel evidence

Executed from `spec/lean` on 2026-10-04:

```
/home/hoskinson/.elan/bin/lake env lean QDL/Ranch.lean
```

The final file contains **37 theorem declarations** and completed with exit code 0 and no errors or warnings under Lean 4.34.1 / Mathlib v4.34.1. An additional stdin Lean invocation loaded the full source and printed axioms for every theorem. Its dependencies are exclusively Lean/Mathlib's standard `propext`, `Classical.choice`, and `Quot.sound`, or no axioms. There are no `sorry`/`admit` proofs, `sorryAx` dependencies, custom axioms, or native-decision trust shortcuts. Newborn defaults use ordinary kernel-checkable `decide`.

## Exact local correspondences

| Model | Runtime correspondence | Proved local consequences |
| --- | --- | --- |
| `GeneBound`, `clampGene`, `midpoint`, `mutate` | `offspring.js` six integer traits, `floor((A+B)/2)`, clamp to [-1000,1000] | Clamp/selection midpoint/mutation stay bounded; positive-divisor integer division satisfies floor inequalities even for negative sums; zero mutation is identity; unsaturated mutation records its exact delta; gentle mutation actual delta stays in [-80,80]. |
| `mutateTwo : (Fin 6 → Int) → ...` | Two distinct named loci in gentle mutation | All six coordinates remain bounded; every changed coordinate is one of the two selected loci; the second distinct locus receives its own delta. The SHA draws, modulo selection and sign policy are not formalized. |
| `axialMicro`, `radialMicro` | Exact micro-unit factors for `1+.12*(gene/1000)` and `1+.10*(gene/1000)` | Axial factor is 880000..1120000 micro-units and radial is 900000..1100000; both strictly positive. These are factors, not a proof of quantized component dimensions or global topology/embedding. |
| `RoleNode = Fin 2 × Nat`, `roleIndex`, `namespaceCode` | Role/index IDs `p0n<i>` and `p1n<i>` used for donor literals and all operations | Pair identity is injective, distinct roles are disjoint, independent numeric encoding `2*index+role` is injective. String rendering preserves this only under the explicit `Function.Injective render` hypothesis. Decimal JS serialization and stable topological indexing remain implementation/test obligations. |
| `PureNode`, `GuardConeClosed`, `substituteNode` | Original recipient guard ancestors and ordered port substitution in compose/mate | With the guard cone predecessor-closed and the replacement excluded, each guard node's operation, abstract parameter payload and complete ordered input list stay exactly unchanged. Port duplicates/order are preserved by list mapping. The parameter model is `List Int`, an opaque local projection rather than full kernel JSON. |
| `ActionNode`, `substituteAction` | An action's name/allowed Boolean/direct guard/payload ports | Guard exclusion preserves name, allowed and direct guard; payload-only donation changes exactly the payload port when guard/payload are distinct. Action-node replacement protection is an external predicate/implementation obligation. No action or guard value is evaluated. |
| `ProtectedSurvival` | Post-pruning survival check of the recipient guard cone | Given explicit unchanged survival, the surviving ordered guard ports are exact. This lemma does not prove the pruning algorithm discovers/preserves the cone. |
| `BirthState`, `BirthStaged`, `birth`, `stagedBirth` | `ranch-world.js` staged admission checks and count/energy/revision update projection | Distinct parents with energies 50..100 each lose exactly30, leaving20..70; counts remain within32 residents/8 nursery; a nonempty proposal count decreases by exactly1; revision increases exactly1 without exceeding1000000; tick+200 fits the ceiling; parent IDs stay unchanged/distinct; task run count stays unchanged; rejected model staging preserves the entire modeled state. |
| `Newborn` | World insert defaults and absence of an inherited execution record | Energy40, participation disabled, and no execution record. Model carries no inherited credential/authority field. |

The integer division model is exact floor division for denominator2, matching `Math.floor` on bounded integer sums (-2000..2000). The integer micro-unit factors are algebraic versions of source gene scales. Connecting these definitions to IEEE-754 evaluation, `Math.round`, UTF8/canonical source, parser validation, or the execution compiler requires separate correspondence evidence.

`BirthStaged` represents **only** numeric preconditions and distinct parent IDs. Runtime admission additionally requires exact live proposal/source/intent/epoch pins, membership, participation, adult/no-rest status, requested world revision, source/companion conflict checks, artifact/derivation/receipt count and byte budgets, safe geometry/spawn availability, and bounded response staging. None of those omitted checks is implied by the Lean arithmetic. In particular, `stagedBirth` rejection identity is a theorem of this deliberately pure model, not a proof that production JavaScript mutates no authoritative store on every exception. Its `taskRuns` field proves model passivity, not arbitrary callback or interpreter absence in host code.

## Excluded claims and remaining obligations

No proof is claimed for the 23 kernel operations/refinement/type compiler, full constructor/source recovery, graph reachability/topological sorting, donor integration witness, action/eager-branch exclusion, exact body companion preservation, actual SHA256/canonical construction/derivation IDs, trait draw distribution, parser/accessor rejection, JS mutation/transaction refinement, artifact/lineage/admission receipt correspondence, proposal uniqueness across request keys, full world lifecycle/deadline/geometry/invariant preservation, cross-process serialization, crash durability, anatomy compiler coverage/global embedding, aesthetic quality, rendering/contrast, browser behavior, or performance.

The existing offspring executable fixtures and root's runtime/world/schema/formal/browser checks provide different evidence classes. They must remain separately reported; theorem counts do not substitute for implementation correspondence or visual/performance measurement.

Root integration added two kernel-checked unsigned-32-bit nonce endpoint theorems and imported Ranch into the umbrella QDL module. The complete project audit passes 213 exported theorems, 42 prior numeric domains and 14 gene/nonce schema bounds, with zero proof placeholders or project axioms. The domain gate compares exact declarations and selected runtime endpoints, not complete JSON-parser refinement.
