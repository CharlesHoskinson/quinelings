# Finite Quint ranch lifecycle evidence

`spec/ranch.qnt` models experimental ranch admission and lifecycle safety. The model is a finite abstraction of `ranch-world.js` and Runtime acknowledgement retention. Its seeded simulation and executable traces do not establish full JavaScript refinement, universal liveness, source/hash authenticity, continuous movement safety, or crash durability.

## State and runtime projection

| Model | Runtime projection and abstraction |
| --- | --- |
| `residents: actor→Resident`, actors1..4 | World resident records, finite actor tokens for monotonic resident IDs; `used` prevents reimport/reuse. Population4 and nursery2 are reduced bounds corresponding to production32/nursery8. |
| `source`, `intent`, `epoch` | Exact-equality tokens for sourceHash, intentHash (intent0 represents absent), and policy epoch; no SHA256 collision or parsing theorem is implied. Epoch ceiling8 is reduced from1e6. |
| `energy`, `rest`, `enabled`, `nursery`, `ready` | Exact integer energy0..100, enabled participation, rest latch, nursery deadline and cooldown. Costs/gains and thresholds are unscaled. |
| `invite`, `inviteExpiry`, `partner`, `pending` | Invitation target/deadline and pair/proposal backlinks; zero means absent. Reciprocal invitations read the same state before forming a pair. |
| `pairs`, `proposals`, `nextProposal` | Generic indexed maps, max2 simultaneous pairs/proposals. Proposal IDs1..8 abstract unique attempt IDs. Proposals carry ordered source/intent/epoch pins. |
| `consumed`, `children`, `admissions` | Ghost consumed-proposal set and birth mapping, plus retained admission-request acknowledgements (capacity4 versus production128). These expose uniqueness across new keys even after a proposal disappears. Runtime actually enforces this through consumed proposal absence and its durable-in-session successful-request ledger. |
| `revision`, `nextSeq`, `receipts` | Every successful mutation advances revision once; command success also advances sequence once and retains payload/revision acknowledgements. Receipt window2 abstracts production256; eviction never reduces watermark. Counters stop at60 versus production1e6. |
| `before`, `last`, `mutation`, `wasCommand`, `bornFrom` | Verification instrumentation outside authoritative `World`. Rejection/replay compares the complete authoritative state, including receipts, energy and clocks. |
| `executions` | Passive world execution count, always0. No source construction, interpreter or action evaluator is modeled. |

The public command hashes are abstracted by exact integer payload tokens. Tokens stand for canonical complete request identities, not partial command fields or untrusted callback results. This assumes distinct complete payloads receive distinct identity tokens; it does not prove canonical encoding or cryptographic collision resistance. Admission replay also explicitly matches proposal and child identities. Geometry uses actual arena dimensions512×320, inset24, and strict-interior overlap `abs(dx)<48 && abs(dy)<48`; touching is allowed.

The model admits a selected finite position only if it is inside and disjoint from every resident and live pair reservation. Pair slots have the explicit parent-owner exception and pairing requires both parent Chebyshev slot distances ≤160. `geometry` is an insertion/base-state invariant. Arrival/leave abstract route progress as guarded position transitions; they do not model unit moves, rotating move priority, roam affinity, swept union checks, animation interpolation, or congestion fairness. Runtime geometry is independently exercised by `verify-ranch-world.cjs`. There is no claim that the Quint geometry abstraction proves the JavaScript movement algorithm.

## Timer and phase correspondence

One model energy boundary represents 20 production ticks. All durations are integer multiples of that boundary:

| Timer | Model boundaries | Production ticks |
| --- | ---: | ---: |
| Invitation | 6 | 120 |
| Approach | 8 | 160 |
| Overall attempt | 12 | 240 |
| Arrived court dwell | 4 | 80 |
| Proposal | 30 | 600 |
| Proposal/birth cooldown | 10 | 200 |
| Nursery | 10 | 200 |
| Pair-abort cooldown | 2 | 40 |
| Unilateral expiry cooldown | 1 | 20 |

The correspondence table is also present in the model as `productionTimers`. Social reciprocity, arrival and leave are separate abstract command phases between energy boundaries. This permits imported energy60 adults to form a pair before the first20-tick energy loss, as the production controller does. It deliberately compresses within-boundary elapsed ticks and geometry progress. Four arrived boundaries approximate the80-tick court interval; the production first-arrived-tick counting rule is checked by the JavaScript production-duration fixture. This is a phase/timer correspondence description, not a bisimulation or proof that every model timestamp maps to one complete JavaScript trace.

Each boundary performs maturity, priority energy/rest cleanup, expiry, then dwell/proposal. Energy priority is nursery/rest+4, paired−2, cooldown+2, adult−1, clamped0..100. At the exact maturation boundary nursery clears before energy selection. Pair approach and overall deadlines are immutable; `arrived` remembers first arrival and `atSlots` tracks current dwell participation. Leaving resets dwell without reviving the approach timeout or extending the overall attempt. Proposal creation releases pair/invitations and sets pending+cooldown, so pending parents can regain energy. Expiry is half-open (`tick<expiry`), with cleanup before dwell or admission.

Commands prepare their whole next state before commit. `advance2` stages two complete energy boundaries and advances revision once, or rejects without state change if any resulting deadline/counter exceeds its bound. This is an abstraction of an atomic batched command, not an assertion that two energy boundaries equal the public1..4-production-tick batch. The model covers selected resource/counter preconditions, not Runtime aggregate serialized bytes, JSON schemas, source validation or all allocation caps.

## Properties and unsafe controls

The `safety` conjunction checks bounded state and energy; geometric base state; mutual pair creation; pair backlink/disjointness/deadline/reservation invariants; proposal pin freshness/backlink/half-open-expiry invariants; whole-state equality after reject/replay; one revision per mutation; command sequence/watermark and receipt window; one consumed proposal→one child across request keys; atomic two-parent30 charges plus one disabled energy40 nursery child; and passive executions0.

All nine unsafe controls are excluded from both safe transition relations and have executable detection tests:

| Unsafe transition | Detecting property |
| --- | --- |
| Fully linked pair from unilateral invitation | `mutualCreation` |
| Pair removal clearing only one partner | `pairBijection` |
| Birth charging only one parent | `atomicBirth` |
| Parent epoch change retaining old proposal | `proposalBijection` |
| Consumed proposal reused with a new admission key/child | `singleChild` |
| Insertion into occupied guard | `geometry` |
| Successful insertion forgetting revision | `revisionRule` |
| Rejected batch preserving one partial clock update | `rejectedUnchanged` |
| World action implicitly incrementing execution count | `passive` |

Positive traces include nearby court/birth (52→22 energy each), delayed approach/court proposal at38 energy followed by six cooldown boundaries to50 and birth at20, occupied insertion rejection, stale epoch admission rejection, withdrawal/annotation/retirement two-sided cleanup, retained command and admission replay, conflict/gap/evicted sequence refusal, new-key consumed-proposal refusal, half-open approach/proposal expiry, immutable attempt timeout after dwell reset, one-revision batch, batch ceiling rollback, frozen-tick safe import, below20 pair cleanup and rest energy priority. Test-only energy and clock initialization fixtures install stated valid finite boundary states; they are not public ranch commands.

## Actual commands and evidence

On 2026-10-04, using installed Quint 0.33.0 with the TypeScript backend:

```
quint typecheck spec/ranch.qnt
quint test spec/ranch.qnt --max-samples=100 --backend=typescript
quint run spec/ranch.qnt --invariant=safety --max-samples=1000 --max-steps=80 --seed=20261004 --backend=typescript --verbosity=1
quint run spec/ranch.qnt --init=paired --step=familyStep --invariant=safety --max-samples=500 --max-steps=80 --seed=20261005 --backend=typescript --verbosity=1
```

Typechecking passed. All 31 deterministic executable tests passed. The final general relation run found no violation in 1000 seeded traces of at most 80 steps. The final family-focused relation run found no violation in 500 seeded traces of at most 80 steps. Both use the same safety invariant; the family relation starts from a reciprocal pair and concentrates transitions on arrival/dwell, recovery, admission, cancellation and invalidation. Seeds are respectively 0x135288c and0x135288d. These are finite randomized simulation results, not exhaustive state-space exploration or kernel-checked theorems. Successful tests provide witnesses and negative-control sensitivity, not universal reachability/liveness.

Root integrates the formal command entrypoint and representative model/controller replay evidence. Full runtime/model trace refinement, cryptographic identity, parser correctness, source/type validation, serialized-byte bounds and browser rendering remain separate obligations.
