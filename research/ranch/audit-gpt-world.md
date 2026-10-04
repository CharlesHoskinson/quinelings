# GPT audit: world, lifecycle and atomic admission

Audited `docs/RANCH-CANDIDATE.md`, sections 4–6 and 8, on 2026-10-04. Read repository `AGENTS.md` and the supporting social, biology and formal brainstorm reports. This report owns only this file. The candidate is a design awaiting implementation: the traces below are independent specification counterexamples, not observed runtime failures or executed implementation tests. No shared code, live world, credentials or deployment was touched.

**Verdict: revise before implementation.** The passivity boundary, exact parent pins, half-open proposal validity, two-parent admission transaction and retained admission receipts are good foundations. The remaining defects are primarily missing transition rules that permit materially different implementations. Supporting brainstorm rules are not automatically part of the converged candidate; explicitly restore the selected rules there.

Severity: S2 means a required correction affecting state safety, concurrency or bounded lifecycle behavior; S3 means a required precision/test correction. No S1 exploit is established by this audit.

## Required corrections

### W1 — S2: proposal creation has no complete successor state

**Candidate:** §4 energy/pairing/step order; §5 admission commit.

**Counterexample:** A and B finish 80 arrived court ticks and receive proposal P. One implementation keeps their mutual partner links and rendezvous reservations, because §4 never orders their release. Another releases the links but leaves both residents in a `proposal` phase. The first continues the court energy drain and can retain a clearing after P is consumed; the second has no matching energy row (`nursery/rest`, `paired approach/court`, `unpaired roam/invite`, or `cooldown`). Both follow the written proposal creation rule. Expiry and successful birth likewise lack a complete pair/resource cleanup successor. Repeated proposals can therefore leave stale reservations or actors whose energy behavior is unspecified.

**Exact correction:** Define proposal creation as one atomic transition: allocate P and both pending links; clear both partner links and reciprocal invitations; release both rendezvous reservations; place both adults in cooldown with `readyAfterTick = max(old, min(ceiling, tick+200))`. Pending proposal is an orthogonal flag, not an unaccounted energy phase. Each energy update selects exactly one row in declared priority order: nursery, rest latch, paired approach/court, cooldown, otherwise adult roam/invite. Pending P prevents invitations after cooldown expires. Admission, cancellation, expiry, rest abort and retirement must each explicitly define removal of all associated links/reservations. Define aborted-pair and unilateral-invitation cooldown durations too; the candidate currently mentions abort cooldown saturation without its duration.

**Independent obligation:** Enumerate every life/social/latch/cooldown combination reachable from initialization and assert exactly one energy row applies. Trace court completion → wait 20 ticks → admit → cooldown expiry → new courtship, and court completion → proposal expiry. Assert pair references and rendezvous ownership are empty after proposal creation, pending links correspond bijectively to live P, and neither terminal path leaks a reservation. These are needed model/controller tests, not existing tests.

### W2 — S2: interrupted courtship has no explicit overall deadline

**Candidate:** §4 “approach timeout160; court requires80 consecutive arrived ticks” and bounded-timeout claim.

**Counterexample:** A pair arrives near the approach deadline and begins court. At dwell 79 it loses arrival, resets, and resumes. Does the original approach deadline still terminate the pair? Does returning to approach get another 160 ticks? Does court have no timer? The candidate permits all three readings. Energy depletion eventually aborts a continuously paired actor, but that is a different bound and cannot specify the intended courtship deadline or reset behavior. Holding two scarce rendezvous reservations longer than the intended attempt changes ecology and capacity.

**Exact correction:** Store immutable `pairStartedTick`, `approachDeadline = start+160`, and `pairDeadline = start+240`; refuse pair creation unless both deadlines fit the ceiling. State when approach deadline stops applying after arrival. Enforce `tick < pairDeadline` across approach/court/re-entry, including dwell resets; deadlines never restart. Expiry checks run before movement/dwell. Define arrival using both current integer positions at their reserved slots, and define the first counted dwell tick precisely. Abort and release both sides when the overall deadline is reached. An alternative duration is acceptable if explicitly selected and modeled.

**Independent obligation:** Test the last admissible start tick and one tick later, court completion at deadline−1 versus deadline, repeated dwell resets and arrival/departure on an energy-update tick. Add a model invariant tying every live pair to a nonexpired immutable attempt deadline. Use production 160/80/240 fixtures as well as small timer domains; equal small constants alone do not cover production ordering.

### W3 — S2: world admission must explicitly advance the world revision

**Candidate:** §5 final world revision check/commit; §6 expectedRevision and revision semantics.

**Counterexample:** Client C reads world revision R. Another client successfully admits a child using R; §5 inserts a resident, charges both parents and consumes P, but never explicitly increments the revision. C then sends a management command with R, which passes the §6 expectedRevision check despite the intervening mutation. “Each successful mutation advances revision once” appears inside the worldCommand description; offspringAdmit is a separate operation. Depending on interpretation, optimistic concurrency is either correct or silently broken.

**Exact correction:** State globally that every successful new world-mutating operation, including offspringAdmit, advances that world's revision exactly once. A multi-tick advance is one command/revision increment. Admission stages the new revision and checks its capacity before any mutation. Read-only operations, rejection and matching receipt replay produce zero revision delta. Admission acknowledgement includes the committed revision. Clarify which counters admissions consume separately from worldCommand sequence numbers; do not implicitly spend an unrelated client's sequence.

**Independent obligation:** Capture R, admit under R, then attempt participate/import/advance under R: each must refuse unchanged. Matching admission replay returns the original acknowledgement without incrementing R again. Check two admissions competing under the same R, revision at ceiling, and the exact revision delta of advance4.

### W4 — S2: atomicity and overflow policy are unspecified for world commands

**Candidate:** §4 bounded ticks/epochs; §5 transactional staging applies to admission; §6 advance1..4 and command receipts.

**Counterexample:** At tick 999999, `advance4` completes one tick and then hits the ceiling. If it returns a limit error without a success receipt, retry may repeat management effects or leave an unacknowledged partial mutation. Similarly, a withdrawal changes enablement and clears a pair, then discovers the policy epoch cannot increment; or advance performs expiry/energy transitions before discovering revision exhaustion. “Never wrapping” prevents overflow but does not require refusal before these mutations. The admission transaction rule does not unambiguously cover these commands.

**Exact correction:** Extend stage/validate/commit/receipt atomicity to every world command. Choose one policy for advance batches: preferably preflight all requested ticks and all resulting counter/deadline transitions in a bounded draft, then commit all or refuse unchanged. If partial advance is intended, define it as a successful acknowledged result with `requestedTicks`, `appliedTicks` and stop reason; never report an ordinary rejection after partial application. Counter exhaustion must be checked before the first effect. At frozen ticks, explicitly say which management operations remain permitted and which revision/epoch exhaustion blocks. Saved matching command receipts must be returned before expectedRevision, tick and counter checks; stale discarded sequences must refuse before execution.

**Independent obligation:** Deep-state equality on rejected advance4 at ceiling−1, rejected participation at epoch ceiling, and every command at revision ceiling. Replay successful commands after subsequent mutation, retirement and tick exhaustion. Model discarded sequence replay separately from a retained duplicate; add a deliberately partial advance/withdrawal negative control.

### W5 — S2: spawn and reservation geometry are not an explicit admission guard

**Candidate:** §4 deterministic spawn list and movement guards; §5 “nursery/resident/spawn/timer bounds”; §6 import.

**Counterexample:** An initial resident moves onto an unused deterministic spawn location. Capacity remains below32 and nursery below8. A new child or imported adult is assigned that list position because the list entry is unused as a spawn designation. Its old guard overlaps the roaming resident's guard. The swept movement rule cannot repair this snapshot: even waiting now intersects another old guard. Two individually free rendezvous slots can likewise be closer than two guard half-widths unless “free” is geometric, rather than just unowned.

**Exact correction:** Define a guard box and boundary-touch convention once. Every import/birth spawn must be inside the inset and geometrically disjoint from every active resident guard and incompatible live spatial reservation, regardless of spawn-list ownership. Reserve two rendezvous guard boxes only if they are mutually disjoint, inside bounds and free under the same geometry rule; owner exceptions must be explicit. Select the first valid spawn in deterministic list order and reject atomically if none exists. Maturation retains the existing position and releases only nursery designation. Check initial world creation by the same invariant. Do not teleport a resident on maturation.

**Independent obligation:** Put an adult on each otherwise-unused spawn and test that admission chooses a different guard-safe location or refuses unchanged. Test 47/48/49 coordinate separation according to the chosen touching convention, obstruction of a reserved clearing, import under a crowded snapshot, and maturation without position change. Inductively model valid old guards → valid admitted/advanced guards; movement-only checks do not establish the base/insertion case.

### W6 — S3: the formal acceptance list omits key correspondence properties

**Candidate:** §8 Quint invariant list and local atomic birth/capacity lemmas.

**Counterexample:** A model with mutual unique pairing, fresh sources, bounded population, atomic parent charges and same-request idempotence can still admit the same consumed proposal under a *new* requestId if it does not assert proposal-to-birth uniqueness. It can also retain one parent's stale pending link after cancellation while keeping counts and pair uniqueness valid. These are distinct properties from request idempotence. A model that leaves worldCommand out of the state machine cannot detect W3/W4.

**Exact correction:** Add explicit invariants: every live proposal has exactly its two pending-parent links and vice versa; no resident participates in multiple live proposals; each proposal produces at most one world child across all requestIds; every live pair owns exactly its two disjoint reservations; terminal pair/proposal transitions release their resources; all rejected operations preserve the complete authoritative projection; every new world mutation has its specified revision delta; passive operations preserve execution counters. Use a bounded consumed-proposal/birth witness or an equivalent transition-history invariant, not an unbounded model ledger. Define the model-to-runtime state projection and representative replay obligations, including receipt windows, command batches and energy-mode partition.

**Independent obligation:** Negative controls must include new-key replay of a consumed proposal, one-sided pending-link cleanup, forgotten admission revision, occupied spawn and partial advance, in addition to the listed unilateral pair/partial charge/stale admission/implicit run controls. A mutation that the checker cannot distinguish from the intended implementation exposes a missing property. Lean local lemmas require the actual staged transition predicate as a premise; they cannot establish that the implementation checked it. Report finite exploration, checked theorem and runtime trace evidence separately.

## Optional enhancements, not acceptance blockers

- Publish an energy trace showing a slow courtship starting at60. At 200 paired ticks it can finish near40, below admission threshold50, then recover during cooldown before proposal expiry. This is acceptable renewable-energy behavior once W1 specifies the phase, but immediate birth must not be promised for every successful courtship.
- Add bounded diagnostics for why a pair or spawn failed, especially guard obstruction versus count capacity. This improves debuggability without establishing fairness, throughput or collision freedom beyond the stated guard premise.
- Persistent request receipts would improve crash recovery. The candidate correctly limits its guarantee to in-memory atomicity; persistence is not required for this experiment.

## Claims retained and limits

No change is requested to explicit Run, no inherited authority, stateless preview, successful-receipt lookup before admission freshness checks, half-open proposal expiry or non-evicting admission replay protection. Exact energy0..100 in Quint is appropriate. The integer guard model still depends on conservative full gesture containment; neither this audit nor a sampled portrait demonstrates that geometric premise. The candidate's independent browser/performance/visual acceptance remains necessary and unperformed here.
