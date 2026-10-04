# Representative executed Quint/controller correspondence

`verify-ranch-model.cjs` executes the actual `spec/ranch.qnt` with installed Quint, exports and decodes Informal Trace Format states, and compares selected state projections with real pure `ranch-world.js` transitions. It does not substitute a handwritten JavaScript model or alter the production model/controller. The script and this report are the only repository files edited.

Executed on 2026-10-04:

```
node verify-ranch-model.cjs
```

Result: **passed; 13 actual Quint deterministic tests, two additional deterministic imported-model traces, 12 controller correspondence checks, zero interpreter calls**. Quint uses its TypeScript backend, max-samples1 and seed20261004. Temporary ITF files and a harness importing the unchanged model are created under the OS temporary directory and removed in `finally`; no primary `.qnt` source is rewritten.

## Compared evidence

| Executed model evidence | Production scenario and assertions |
| --- | --- |
| `useful_nearby_birthTest` | Test-only parents are placed at validated clearing slots before participation/invitations. Real reciprocal commands and80 actual court ticks yield energy52 each and a proposal, not a child. Model tick4 scales to production80. Birth compares exact parent projection52→22 each, child40/disabled, removed proposal, one revision increment and source input immutability. Nursery deadline difference10 boundaries compares with200 production ticks. A second consume attempt refuses without changes. |
| Imported-model birth plus10 `tick` steps | Actual model newborn at tick13 has energy76 and one remaining nursery boundary. Production tick260 has energy76 and20 remaining nursery ticks. Model tick14 / production280 clear nursery before energy selection, leaving75, with no child participation or position change. |
| `withdrawal_cancels_pairTest` | After a real reciprocal pair, withdrawal changes epoch1→2, disables one parent, clears both partners/pair and preserves other parent metadata/energy. Pair-abort cooldown differences2 boundaries/40 ticks agree. |
| `annotation_cancels_bothTest` | Annotation changes source companion token0→1 in the model, and null→explicit digest in production; epoch increments once and both pending links/proposal disappear. Revision delta is1. Production annotation does not consume a world command sequence; that intentional API distinction is explicitly asserted. |
| `proposal_half_open_expiryTest` | Proposal remains present at production expiry−1, is removed at exact expiry600 ticks after creation, and both pending links clear. End-state parent energy/rest/enabled/epoch/link projections compare with the executed model. Old proposal origin then refuses. |
| `batch_advances_one_revisionTest` | Both modeled two-boundary command and production two-tick command advance revision/sequence once. This compares the transactional rule, not equivalent elapsed duration. |
| `batch_ceiling_rejects_entire_draftTest` | Model59+2 crosses reduced ceiling60 and preserves state. Production999999+2 crosses1000000 and preserves complete world, tick, revision, sequence and receipts, despite a staged first tick being possible. |
| `retained_command_replayTest`, `conflicting_command_replayTest` | Executed model replay/rejection states equal their respective `before`. Production retries the original complete request with its now-stale revision and returns the retained original acknowledgement/world; changed tick payload under the same sequence refuses unchanged. |
| `stale_birth_epoch_rejectionTest` | Old ordered epoch pins refuse before charges; energy52/52, proposal and complete receipts/world are unchanged. Model consumed-set stays empty. |
| `below20_cancels_both_pair_sidesTest` and imported paired21/21 boundary | Model21/60→19/58 matches production at the20-tick boundary. Both21 parents produce19/19 and both rest latches/pair links clear. Production is checked in both resident-array orders. This exercises the simultaneous energy snapshot before cleanup, which prevents the first parent's cleanup from changing the second parent's energy branch. |
| `detects_partial_chargeTest`, `detects_partial_advanceTest`, `detects_implicit_runTest` | Actual unsafe model traces expose one-sided charging, reject-labeled partial tick state, and an incremented execution count. Safe production counterparts reject partial/stale mutations and invoke zero interpreter/constructor calls. |

All successful controller commands are also checked for detached input equality, one revision and sequence increment, valid resident/nursery/pair/proposal bounds, energy bounds, geometric guard separation, reciprocal pair references and exact live proposal source/intent/epoch backlinks. World validation runs alongside these independent assertions. `execute`, `runTask`, `makeTaskProgram`, and `makeProgram` are replaced with throwing counters during the controller scenarios; all counters remain0.

## Scope and distinctions

One model boundary represents20 production energy ticks. Selected aligned snapshots compare exact energy, epoch, participation/rest, link presence, deadlines as differences, and birth bookkeeping. Reciprocal pairing, arrival and departure are separate abstract model phases; production counts the first arrived tick and moves each explicit tick. The clearing fixture deliberately bypasses congestion/approach uncertainty. It is a stated simulated input, not a public position-changing command or a reachability/liveness claim.

Absolute revisions/sequences are not equated across these differently phased traces. The model's `advance2` means two energy boundaries, while the public production batch means1..4 individual ticks; only the one-commit rule is compared. Annotation is an abstract model command but a separate Runtime operation in production. Model maps/tokens/zero links are projected onto concrete resident IDs/hash strings/null links; cryptographic token injectivity is not proved. Model-selected child position differs from production's deterministic first free spawn, so insertion validity is compared rather than absolute newborn coordinates. Nursery duration is200 ticks; production `LIMITS.nursery` is the population cap8, not that duration.

Finite model capacities (actors4/nursery2/receipts2/ceiling60) abstract larger production caps32/8/256/1000000. This verifier does not equate complete model and JavaScript worlds. Model admission acknowledgement replay/ghost consumed sets are distinct from the pure world module's proposal consumption; Runtime receipt/lineage transaction behavior is covered separately by SDK/adapter tests.

The evidence is representative executed-state correspondence, not a bisimulation, full JavaScript refinement, exhaustive exploration, universal liveness, parser/compiler/SHA proof, source-authorship authentication, complete swept movement proof, cross-process/crash durability, serialized-byte accounting proof, browser accessibility/beauty or performance acceptance. Root integrates broader formal gates and final evidence.
