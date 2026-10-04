The candidate is not ready to implement. Its social lifecycle can double-commit a birth, and its own timers and energy rules make a legal birth unreachable. Fix the three defects below in the candidate text before any ranch code.

## 1. Birth is not one social transition
**Severity:** critical. **Sections 4–6.**

Admission is described as a synchronous commit of artifact, derivation, resident, nursery flag, both energy charges, cooldowns, proposal consumption, and the request result. Nothing says that this commit and a world tick are one exclusive transition. `expectedRevision` is not defined to change on energy, expiry, pairing, or movement. A proposal stores residents and policy epochs, but not the recipe, nonce, style, or candidate id. Preview writes nothing, so a later admit can attach any recipe to a live proposal.

**Counterexample.** Both parents have energy 50, proposal P is open, revision is R. The controller applies the 20-tick drain (−2) without bumping R. Two admits, with different request ids, both observe energy ≥50 and P unconsumed. Both commit. Each parent is charged twice, two children occupy the nursery, or the second commit overlaps the first child’s guard. A variant with one request: the user previewed `body`, and an agent calls `offspringAdmit` with `merge` against the same P. The world target checks only the proposal and parent epochs, so the merge is committed.

A second spatial case: the nursery count is free, but an adult still occupies the deterministic spawn cell. The child is placed in an overlapping guard. The movement rule assumes every current guard is already disjoint, so that tick has no legal step.

**Required correction.** One world actor. Commands and the whole tick run to completion with no interleaving. Inside the birth transition, re-read and require: proposal unconsumed; frozen `(recipe, nonce, style, parent source hashes, intent hashes, epochs)` equal to the request; both energies ≥50; nursery, resident, spawn, ledger, and byte caps free; the child’s guard disjoint from every current guard. Then subtract 30 from both, or from neither. Failure restores every store and leaves P available. Annotate and withdrawal bump the policy epoch frozen into P. Manual origin cannot target a world. Spawn failure rejects the birth.

**Model obligation.** One Quint action, `Admit`, with that precondition and a postcondition of one child, both charges, P consumed, and unchanged state on every failure. Negative traces: stale revision, partial charge, second request on P, recipe mismatch, overlapping spawn. Lean’s “local atomic birth” text needs these same predicates; until then it is unproved.

## 2. Courtship timers and energy forbid birth
**Severity:** critical. **Section 4.**

Invitation lasts 120 ticks, approach 160, court 80 consecutive arrived ticks, and proposal 600. Nothing cancels the earlier timer at a phase change. Drain is −2 per 20 ticks while paired in approach or court. Invitation needs energy ≥60; birth needs both ≥50 and then charges 30. Rest fires only below 20 and cancels the pair and proposal. Paired residents do not recover energy.

**Counterexample.** A and B become reciprocal at energy 60. The invitation clock is still running. They need 50 ticks to reach slots 48 units apart. The invitation expires at 120, so only 70 ticks remain, short of 80 arrived ticks. If the invitation timer is ignored and the approach timer is not, arrival at tick 100 leaves 60 ticks before the approach timeout, still short of 80. If both timers are ignored and they arrive immediately, four drains during the 80-tick court leave energy 52. The proposal phase continues at −2 per 20 ticks, so they fall through 50 before a human admission and can never climb back while paired. Separately, a unit step cannot cross the 512×320 arena inside 160 ticks, so a distant reserved slot always times out. At tick 999900, nursery 200 and proposal 600 do not fit the ceiling of 1000000.

**Required correction.** Disjoint phases on one snapshot: `Invite → Approach → Court → Proposed → terminal`. Entering a phase cancels the previous deadline. Use half-open bounds: valid while `tick < start+duration`. Form a pair only if both invitations exist, neither resident is paired, resting, cooling down, or holding a proposal, and both assigned slots are reachable in 160 unit steps with guards at least 48 apart. Priority is rotated resident-id order; cycles use that unique matching; one free slot pair or no pair. Court resets if either leaves the slot. `Proposed` freezes energy and does not drain. Birth remains an explicit command. Refuse to enter a phase, or to admit, when `tick+deadline` would pass 1000000. At the ceiling the world halts and only inspects.

**Model obligation.** A Quint state machine on a small arena, with exact energy 0..100. Positive trace: invite at 60, arrive, court 80, proposal, one birth, energies 30. Negative traces: unilateral invite, expiry at `start+duration`, drain through 50 during proposal, unreachable slot, overflow deadline. Do not claim pairing liveness under congestion.

## 3. Replay can repeat a mutation or ack the wrong one
**Severity:** high. **Sections 5–6.**

Derivations reject when their 128-receipt ledger is full. Command receipts instead use a 256-entry window. Those two policies disagree. `worldCommand` says a duplicate matching sequence returns the saved ack, without requiring the same canonical payload. `advance1..4` does not say whether it is one revision or four. Autonomous phases are not tied to the command sequence at all.

**Counterexample.** Sequences 1..256 are stored. Sequence 257 evicts 1. Replaying 1 finds no entry. If absence means “not done,” the command runs again. If a client times out on `advance4`, receives no ack, and sends sequence 258 with another `advance4`, the world advances eight ticks. A same-sequence retry whose payload now says `retire` returns the old movement ack, and the client treats retirement as done.

**Required correction.** Per world, `nextSequence` starts at 1 and stops at 1000000. Execute only `sequence == next` with the expected revision, then store the ack and canonical payload hash. The same sequence and same hash return that ack. The same sequence and a different hash refuse and do not mutate. `sequence < next` is stale and is never re-executed, even after the ack body ages out of a 256-entry cache. A future sequence refuses. One command, including `advance4`, is one revision; the four ticks are internal. Admission request ids follow the no-evict ledger. Timeout recovery is “retry the same key,” not “allocate a new one.”

**Model obligation.** Quint sequences with duplicate, conflict, stale, and gap actions. A controller test may replay the transition trace after implementation. That test does not exist yet.

## Unproved, and optional
The listed Quint properties and Lean birth lemmas are proposals. Finite exploration, kernel checks, and runtime tests are future work. SHA collision resistance and continuous collision are correctly left open. Optional later: show the 128-derivation cap, and keep affinity as a displayed heuristic that cannot create a pair by itself. Neutral affinity already belongs in the candidate.

## Recommendation
Reject this snapshot for implementation. Accept it only after the candidate specifies the single `Admit` transition, the five-phase courtship clock, the frozen proposal digest, reachable slots, proposal-time energy freeze, ceiling rejection, and the sequence watermark. The Quint machine for pairing, expiry, `Admit`, and replay is the gate; the website and renderer should follow that model rather than invent missing lifecycle rules.
