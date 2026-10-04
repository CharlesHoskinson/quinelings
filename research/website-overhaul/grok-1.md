The last pass stopped before the measured runs. I’ll use the library and the existing audit harness, then execute all ten programs in one batch.The harness already names hand-calculated cases. I’ll execute those plus visitor edge cases, and record hashes, effects, and old-gallery deltas.The kernels do the arithmetic and the guards they advertise. The examples are what fall flat. Distinct visitor inputs often share one result, and seven of the ten QDL 1 recipes publish no effect. There are no structurally dead nodes. Matching fixture counts overstate how many different behaviors a visitor can see.

The full review is also in `research/website-overhaul/grok-1.md`. No source, pin, or release file was changed. The retained registry pin is `43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3`.

## How this was measured

`research/website-overhaul/sol-audit.cjs` exited 0: 50 hand-written cases, and `deadNodes: []` on every recipe.

A separate runner compiled each recipe with `V.compile(intent)` and called `V.execute(program, bindings)` 61 times. Expected JSON was written before the run. All 61 library expectations matched. On every completed, failed, and refused run, `sourceHash` and the anatomy hash stayed equal to the compile-time identity.

Legacy `K.run` matched all 53 stored gallery expectations. Extra overrides covered an unused road, a decoupled retry budget, a parallel long job, a 2–2 consensus tie, and an evidence refutation. Nineteen creation sentences were parsed and, when supported, executed. Nothing called a network or a credential.

## QDL 1 — one program, many inputs

Inputs are bindings, not literals. Across all 61 runs the body did not change: same `sourceHash`, same anatomy hash, same component count. `inputHash` changed whenever the JSON changed, including when the output did not.

| Recipe | Nodes (dead) | Visitor change | Exact result | Hash / body | Effect |
| --- | --- | --- | --- | --- | --- |
| gather-readiness | 14 (0) | checks all true, observedAt 10, now 12, maxAge 2 | `[{status:simulated, action:gather-proposal, payload:3}, true]` | source prefix `ql_4afb0d9041301b6f`, 6 components | effects = that receipt |
| gather-readiness | | any one check false, or observedAt 14 | skipped receipt, payload still 3, ready false. First-check and last-check outputs match. Input hashes `qi_379dc6ebb54298b` and `qi_a044ba49c1fc882` | body fixed | effects `[]` |
| gather-readiness | | five booleans | refused `refinement` | body fixed | no run |
| craft-quote | 22 (0) | ore 7, wood 8, request 4, space 5 | `{requested:4, feasible:2, oreUsed:4, woodUsed:2}`, fullRequest false | `ql_7c56d27486ee23c9f` | `[]` |
| craft-quote | | add stone 100 | identical quote. Input hash `qi_652e393a6aafe4f` → `qi_d7ec9437f11a61d` | body fixed | `[]` |
| craft-quote | | space 8 | feasible 3, oreUsed 6, woodUsed 3, fullRequest false | body fixed | `[]` |
| craft-quote | | ore 1, wood 10, request 1, space 10 | feasible 0. The leftover ore starts no batch | body fixed | `[]` |
| craft-quote | | request 0, empty inventory, space 0 | all zeros, fullRequest true | body fixed | `[]` |
| craft-quote | | duplicate ore id | refused `refinement` | body fixed | no run |
| confirmed-checkpoints | 13 (0) | fresh observations of haul and arrival | `{haul:supported, arrival:supported}`, true | `ql_75ead175269bdf485` | `[]` |
| confirmed-checkpoints | | a second independent haul supporter | identical output. Input hash `qi_c1fa740c849110e` → `qi_536cca2f41c8a5f` | body fixed | `[]` |
| confirmed-checkpoints | | haul testimony | `{haul:unknown, arrival:supported}`, false | body fixed | `[]` |
| confirmed-checkpoints | | haul value false | `{haul:refuted, arrival:supported}`, false | body fixed | `[]` |
| confirmed-checkpoints | | duplicate evidence id | failed `duplicate-id`. Outputs and effects emptied | body fixed | `[]` |
| evidence-ledger | 4 (0) | one fresh observation from sensor | supported, support 1, refute 0, sources 1 | `ql_cf11512800e701394` | `[]` |
| evidence-ledger | | second true record, same source | support stays 1, sources stay 1, both records kept in `used` | body fixed | `[]` |
| evidence-ledger | | alpha true, beta false | conflict, support 1, refute 1, sources 2, `sourceConflicts: []` | body fixed | `[]` |
| evidence-ledger | | testimony, same clock | supported. The checkpoint recipe rejects that kind | body fixed | `[]` |
| route-preview | 9 (0) | A→[C,B], B→[D], C→[D], current true | path `A,C,D` distance 2, walk-proposal simulated, ready true | `ql_d1f6b5a784aa5675f` | effects = that receipt |
| route-preview | | block B | identical path, receipt, and ready. Input hash `qi_ba7beeff67ffd5f` → `qi_59a9c0872b7e326` | body fixed | same simulated effect |
| route-preview | | block C | path `A,B,D` distance 2, still simulated | body fixed | payload changes |
| route-preview | | current false | path stays `A,C,D`. Proposal skipped, ready false | body fixed | effects `[]` while the output still carries the path |
| route-preview | | A neighbors only `Nope` | found false, path `[]`, skipped | body fixed | `[]` |
| route-preview | | add field E | refused `type` | body fixed | no run |
| trade-preview | 28 (0) | id `offer`, price 3, qty 2, stock 5, inventory 5, allowance 2, now = expiry 10 | `{ready:true, quantity:2, predictedProceeds:6}`, true | `ql_40529a23b2f67d0ec` | `[]` even when ready |
| trade-preview | | also a cheaper `stall` | identical 6. Input hash `qi_5bad92b023185aa` → `qi_e72fb1cf065475f` | body fixed | `[]` |
| trade-preview | | only `stall`, or qty 4 with stock 3, or qty 0 | all three give `{ready:false, quantity:0, predictedProceeds:0}` | body fixed | `[]` |
| trade-preview | | price 4.5 | proceeds 9 | body fixed | `[]` |
| needs-triage | 14 (0) | foods b and a, restoration 8, hunger 4 | eat-proposal simulated, payload `a` | `ql_1eb41b9cae8ba12cc` | effects = that receipt |
| needs-triage | | hunger 100 | identical `a`. Input hash `qi_8e2ad6f476c99cb` → `qi_c6f3d78aa9b859c` | body fixed | same |
| needs-triage | | add z restoration 9 | payload `z` | body fixed | payload changes |
| needs-triage | | cake inedible, restoration 20, beside b | payload stays `b` | body fixed | same |
| needs-triage | | hunger 0 | skipped, payload `""`, ready false | body fixed | `[]` |
| receipt-reconciliation | 3 (0) | no craft receipts, requested 3, maxAttempts 4 | `{state:ready, confirmedUnits:0, attempts:0, mayRetry:true}` | `ql_7a657b08ae90899e4` | `[]` |
| receipt-reconciliation | | one confirmed unit | `retryable`, units 1, mayRetry true | body fixed | `[]` |
| receipt-reconciliation | | one failed attempt | `retryable`, units 0, mayRetry true | body fixed | `[]` |
| receipt-reconciliation | | confirmed 1 then unknown | `unknown`, units 1 kept, mayRetry false | body fixed | `[]` |
| receipt-reconciliation | | same attempt: unknown at sequence 1, confirmed 3 at sequence 2 | `completed`, units 3, unknownAttempts 0, mayRetry false | body fixed | `[]` |
| receipt-reconciliation | | a confirmed walk receipt while policy is craft | identical to the empty history. Input hash `qi_57eb7d0c97f2c8e` → `qi_37271fd002e11fc` | body fixed | `[]` |
| receipt-reconciliation | | requested 0 and no receipts | `completed`, mayRetry false | body fixed | `[]` |
| receipt-reconciliation | | confirmed with units 0 | failed `receipt-units` | body fixed | `[]` |
| water-total | 4 (0) | `[1.5, 2, 0.5]` | `{liters:4, measurements:3}` | `ql_e02a5c069ddc078b3`, 4 components | `[]` |
| water-total | | `[0.1, 0.2]` | `{liters:0.30000000000000004, measurements:2}` | body fixed | `[]` |
| water-total | | `[0, 0]` versus `[]` | `{liters:0, measurements:2}` versus `{liters:0, measurements:0}` | body fixed | `[]` |
| water-total | | replace 2 with 5 | liters 7, measurements 3 | body fixed | `[]` |
| water-total | | `[-1]` | refused `refinement` | body fixed | no run |
| water-total | | `[1e308, 1e308]` | failed `nonfinite` | body fixed | `[]` |
| water-total | | extra field `note` | refused `unknown-field` (`Unknown field note`) | body fixed | no run |
| work-schedule | 5 (0) | a 3, b after a 2, c 4, deadline 5 | order `a,b,c`; ends 3, 5, 4; makespan 5; true | `ql_83e7d769a36c56d52` | `[]` |
| work-schedule | | deadline 4 | same schedule object, predicate false | body fixed | `[]` |
| work-schedule | | list order c, a, b | order `c,a,b`. Per-id times unchanged (c 0–4, a 0–3, b 3–5). Predicate stays true | body fixed | `[]` |
| work-schedule | | a duration 4, deadline 5 | b moves to start 4 end 6, makespan 6, predicate false | body fixed | `[]` |
| work-schedule | | cycle, or dependency `missing` | failed `refinement`. Messages: `Schedule has dependency cycle`, `Missing job dependency` | body fixed | `[]` |

Only `gather-readiness`, `route-preview`, and `needs-triage` contain `action`. A skipped action is still an output receipt and is omitted from `effects`. Ready trade quotes, craft totals, schedules, ledgers, and water sums publish `effects: []`.

## Live nodes and masked values

Reachability from declared outputs is total. Dead nodes are `[]` for all ten recipes and all ten legacy graphs. The flat examples are masked values and constants.

- Gather’s six labels are a conjunction. The output cannot say which check failed. `quantity` is the constant 3 on every path, including the skip path.
- Craft reads only ids `ore` and `wood`. Stone is well-typed and ignored. `woodNeed` is 1, so that division does not change an integer wood stock.
- Checkpoints keep the evidence state and drop support, refute, and sources. A second agreeing witness is invisible. Testimony becomes `unknown`. A false observation becomes `refuted`.
- Evidence counts a source once. Two disagreeing sources set `state: conflict` and leave `sourceConflicts` empty. `sourceConflicts` records one source that itself said both things.
- Route BFS on this map never uses B while C is open. A dangling neighbor string is a silent dead end. An undeclared map field is a type refusal.
- Trade’s 28 nodes still select only id `offer`, demand the entire quantity, and emit no receipt. A short stock becomes a zero quote.
- Hunger above zero does not change the chosen food. Restoration is not compared with hunger. An inedible row is skipped even at restoration 20.
- Reconciliation ignores other operation names. `failed` leaves `mayRetry` true. `unknown` and `pending` set it false. A later sequence on the same attempt can replace an earlier unknown. Requested 0 makes an empty history `completed`.
- Schedule `order` is list-scanner order. Independent jobs share a start time. Listing b before c does not delay c. There is no workstation. The predicate watches makespan only.
- Water uses IEEE addition. `[0,0]` and `[]` share liters 0 and differ in the count.

`evidence-ledger` and `water-total` are four nodes. `receipt-reconciliation` is three. Their policies sit inside one kernel, so the portrait has little graph to show. `trade-preview` is a long guard chain around one hardcoded id.

## Legacy gallery

Every non-default scenario rewrites the quine, because overrides replace literals before `makeTaskProgram`. The source hash changed on every non-default fixture. Organ radius often barely moves. The largest measured radius delta across authored fixtures is 0.00798. Lantern’s inspector edit, raincatcher’s same-length estimate arrays, and threadsorter’s same-length job list change the source hash with radius delta 0.

All 53 stored expectations matched. Distinct results are fewer:

- Wayfinder `unreachable-clinic` and `same-start-goal-isolated-depot` return one output: clinic not found, and zero-trip `{found:true, path:["depot"], distance:0}`. Blocking unused `park` as well as `bridge` also leaves the default detour `depot, arcade, library, square, clinic` (distance 4). The source hash still changes. Closures length changes radius by 0.00133.
- Threadsorter `empty-input-queue` and `no-eligible-jobs` return one empty-queue report. The result has no rejected-job count.
- Pulsekeeper `attemptLimit: 1` still records `outcome.attempts: 3`, history `retry, retry, ok`, status completed, and a simulated delivery receipt. `attemptBudget` becomes `{allocated:1, remaining:0}`. The literal feeds `budget` only. `retry`’s `maxAttempts` is the constant param 4, which scenario overrides cannot replace.
- Lantern, one inspector false: faultScore stays 0.875, maintenance stays true, evidence becomes conflict 1/1/2, repair status becomes skipped.
- Raincatcher estimates `[200,200,200]`: fused 200, capped request 120, allocated litres still 30, irrigation still simulated. Estimates `[1,1,1]`: request 0, allocated 0, remaining 30, irrigation skipped.
- Tidemender plus an independent `delay` of 20: survey through inspect keep their old times, delay runs 0–20, makespan 20, `withinWindow` false. The window 14 is a compare parameter, not a literal.
- Echoweaver 2 east and 2 west, required param still 3: choice stays the first-seen `route-east`, support 2, accepted false, receipt skipped.
- Swarmwarden capacity 5: scouts 3, nursery 2, archive 0, unstarted `[archive]`, depleted true.
- Seedbank stock 0 and trays `[1]`: demand 6, allocated 0, reserve 0. Stock 100 versus 0 changes radius by 0.00798.
- Memorybloom without the lab refutation: state supported, support 1, submitted 3, disposition `accept-supported-claim`. The repeated field-sensor row does not raise support. `pump-ready` remains in provenance and in the submitted count.

Wayfinder’s gallery graph has a route and a zero-trip, and no walk action. The creation sentence `route … | simulate "walk-route"` is the one that emits a local receipt.

## Creation page

The six buttons run. The compiler rejects loose English.

| Sentence | Output | Body hash prefix | Notes |
| --- | --- | --- | --- |
| allocate 9 L, fern 4, sage 7 | fern granted 4, sage granted 5, remaining 0 | `5d6265571464bb53` | partial grant, 3 nodes, 2911 source bytes, no effect |
| allocate 3 L | fern 3, sage 0, remaining 0 | `2d2597f9698e92ba` | real change |
| allocate 20 L | fern 4, sage 7, remaining 9 | `df84a3aa25226ace` | real change |
| route, block `["B"]`, simulate | simulated `walk-route`, payload `A,C,D` | `0f5195bf79ef3c46` | still found |
| same map, block `[]` | simulated, payload `A,B,D` | `f69c174175f1f08e` | path changes, success stays |
| block `["B","C"]` | skipped, payload `[]`, effects `[]` | `dc687d7eefdeca25` | the failure a visitor can see |
| `[2,3,5] \| square \| sum` | 38 | `1a75df4cbd0765e4` | 3 nodes |
| `[8,2,8,4] \| dedupe \| sort desc \| mean` | 4.666666666666667 | `3f1c864cd3693913` | |
| same with an extra trailing 4 | 4.666666666666667 | `e0b6002595096fdf` | output fixed, body and source change (2919 → 2923 bytes) |
| schedule a 2, b after a 3 | order a,b, makespan 5 | `0c58ba6e17ea39fa` | |
| plus independent c duration 1 | makespan still 5; c is 0–1 | `1a9fab6e17ea39fa` | headline number fixed |
| `[1,5,9] L \| filter gt 3 \| sum` | 14 | `b5596682d04508a3` | |
| filter gt 9 | 0 | `178f5374b173268c` | |
| weighted mean 24,36,60 weights 2,1,1 | 36 | in `thought.js`, absent from the buttons | |
| consensus two yes, required 2 | choice yes, support 2, accepted true | same | |
| evidence one true safe | supported, support 1 | same | |
| retry `retry, ok` max 3 | completed, attempts 2 | same | |
| “should the lamp be repaired?” | `clarify`: `Expected explicit JSON data` | | |
| “allocate the water fairly” | same clarify | | |

On this page the data live in the sentence, so a new sentence is a new program and a new anatomy seed. That is why the duplicate 4 changes the creature and leaves the mean alone. The QDL 1 workspace does the opposite: edits stay off the body, and many of them also stay off the result.

The coverage line matches the compiler. The buttons are the short pipelines. Consensus, evidence, retry, and weighted mean already run.

## Language versus the pages

The QDL 1 page is right that snapshots are synthetic and that a missing binding is a refusal. Source and body stay put while `inputHash` and, sometimes, outputs move. The creation page is right that ordinary English does not become a program. The gallery line that a scenario rewrites encoded values matches the source-hash changes above.

The overclaim is usefulness and variety. The kernels do small, exact tasks. A visitor who blocks the unused road, adds stone, raises hunger, adds a witness, or picks the other offer sees a new input hash and the same decision. Two gallery scenario pairs are duplicates. Fifty-three matching fixtures and fifty matching sol-audit cases do not add those missing distinctions.

## Observed defects

1. Pulsekeeper’s visible attempt limit does not bound `retry`. Measured: limit literal 1, attempts 3, budget allocated 1, receipt still simulated. The graph is connected. The wiring is the defect.
2. Wayfinder publishes the same JSON for “clinic cut off by closures” and “map has no streets.” The zero-trip stays found unless the depot itself is blocked. Blocking `park` is also invisible.
3. Threadsorter’s empty list and its all-ineligible list are one report, so the scenario control can look broken.
4. Trade, craft, checkpoints, and gather drop the fact a visitor just changed. Different mistakes become one boolean or one zeroed quote.
5. Water’s total for 0.1 and 0.2 is `0.30000000000000004`. That is the JavaScript sum.
6. Cycle and dangling jobs both fail as `refinement`. The message text is specific. The code is coarse because the legacy `schedule` error has no code and the v1 wrapper fills in `refinement`. The frozen fixture expects that code.

## Suggestions that can stay off the pin

Use inputs the current programs already answer differently:

- Route: block C (`A,C,D` → `A,B,D`), and show `current: false` keeping the path while the effect list goes empty. Label blocking B as an invariance demo.
- Craft: show stone ignored, then ore 1 producing feasible 0, then ore 8 / wood 8 / space 8 producing fullRequest true for a real batch. Say that request 0 is vacuously full.
- Trade: show price 3 → 4.5 (proceeds 6 → 9) and qty 4 with stock 3 (quote 0). Point partial fills at the creation `allocate` sentence, which already grants 4 then 5 from 9 litres.
- Needs: change restoration, not hunger. Hunger 4 and hunger 100 are the same proposal.
- Evidence: same-source contradiction fills `sourceConflicts`. Two sources leave it empty and still conflict. Put testimony next to the checkpoint recipe, where the same row becomes `unknown`.
- Receipt: one failed attempt (`mayRetry` true) beside one unknown (`mayRetry` false, units kept). A walk receipt under a craft policy is the empty history again.
- Water: show `[]` beside `[0,0]`, and show the binary sum.
- Schedule: change `a`’s duration so b moves and the deadline flips. Say that reordering independent jobs changes `order` and leaves each job’s times and the predicate alone.
- Creation buttons: add the four grammar examples that already execute, and add the route with both streets blocked so the simulated walk becomes a skip.
- Gallery copy: say that unreachable-clinic and the isolated depot currently match, and that Pulsekeeper’s number is a budget input beside a fixed retry cap of 4.

## Fixes incompatible with the QDL 1 pin and the retained 1.0.0 artifacts

Do not retag or replace `releases/qdl-v1.0.0`. These would move the registry digest, kernel hashes, or the published recipe vectors inside that archive:

- Decimal or rational liters, replacing the IEEE sum.
- `retry` taking its cap from a value input, so a literal override could stop Pulsekeeper at one attempt.
- A schedule that reserves a workstation. Today’s times are dependency times only. The frozen order `a,b,c` is the list scanner.
- A new failure code for cycles. The library fixture expects `refinement`.
- Editing the ten intents so checkpoints export support counts, gather names the failed check, or trade fills a partial quantity. Each of those is a new source hash (`ql_75ead175269bdf485`, `ql_4afb0d9041301b6f`, `ql_40529a23b2f67d0ec`, and the rest above). Ship them as new programs in a later release.

The behavior worth putting on the page is already executable. The examples selected for visitors are the inputs those programs were built to ignore.