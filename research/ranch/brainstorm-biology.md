# Lifecycle ecology: bounded residents, explicit births

Proposal for convergence, 2026-10-04. QDL remains experimental. This report proposes simulation rules; it implements no runtime behavior and claims no completed proof. It draws on the local social, semantics and genetics reports, the SDK admission implementation, and `docs/PROGRAM-CONTRACT.md`.

## Recommendation and authority boundary

Give each resident finite simulated energy, a nursery stage, adult readiness, mutually enabled pairing, and an inspectable direct-parent lineage. Social courtship produces an inert proposal. An explicit admission command creates one child resident atomically; a separate explicit Run computes its program. Energy is a world variable, never CPU credits, money, a task output, an execution budget, or permission to act externally. Feeding, growing, pairing, and retirement execute no task kernels.

Retain the social report's 20 Hz integer clock, 32 resident maximum, 16 active pairs, 32 proposals, 256 informational events, and tick ceiling 1,000,000. Use a nursery cap of eight residents **within** the 32-resident total. World population bounds do not imply rendering performance: the existing local baseline measured about 81 ms median and 107 ms p95 for eight bodies at 4,000 samples each. The view workstream must choose a separate visible-body budget; hidden residents continue only when the world itself advances. Pausing or hiding the world freezes its timers and ecology; body phase and passive inspection do not advance age.

Artifacts, residents and derivations have different identities. An artifact is immutable canonical source; a resident is an instance in one world; a derivation records how a source was produced. Several residents or derivations may identify one artifact. Removal retires a resident and releases its world slots; it does not delete source or lineage. No automatic death, extinction, predation, or source deletion is needed for this first candidate.

## Finite state and clocks

Resident record, additional to the social movement fields:

```ts
type Ecology = {
  life: 'nursery' | 'adult';
  energy: number;             // integer 0..100
  bornTick: number;           // integer 0..1_000_000
  matureTick: number;         // integer 0..1_000_000
  restLatch: boolean;
  pairEnabled: boolean;       // companion world choice; default false
  policyEpoch: number;        // bounded command counter, never wrap
  readyAfterTick: number;
  lastAdmissionTick: number | null;
};
```

New child: `life=nursery`, `energy=40`, `matureTick=t+200`, `restLatch=false`, `pairEnabled=false`, `readyAfterTick=t+200`. Imported adult: energy 60, pairing disabled until explicitly enabled. Reject birth when `t+200` exceeds the tick ceiling. Policy changes increment an integer epoch bounded by the command-sequence ceiling; exhaustion pauses/rejects instead of wrapping. Source replacement is removal plus fresh admission with a new resident ID; it cannot silently preserve mating readiness.

Age is computed as `tick-bornTick`, not accumulated per frame. Retired IDs are absent from the active map and cannot become active again; reimport uses a new ID. Nursery resident count and reserved nursery geometry must agree. A mature resident keeps its existing guard-safe position and releases only its nursery designation; maturation does not teleport it or require a potentially unavailable adult spawn slot.

Deadline arithmetic is checked before storing a timer. A phase requiring a deadline beyond the tick ceiling returns `tick-budget`; an abort cooldown can saturate to the ceiling because the world then pauses. Pair start requires room for its overall 240-tick deadline; proposal creation requires room for its 600-tick expiry. No timer wraps or silently becomes an infinite reservation.

## Energy ecology and step order

Energy updates once each 20 ticks using the phase `tick % 20 === 0`. This is artificial renewable energy, not a conservation-law claim. Per update use exactly one row, in this priority order:

| Mode at update | Energy delta | Behavior |
| --- | --- | --- |
| Nursery | +4, saturating at 100 | Remains in reserved nursery position; passive authored gesture allowed |
| Rest latch set | +4, saturating at 100 | No invitations or voluntary locomotion; keeps guard square |
| Paired Approach/Court | -2, flooring at 0 | Social movement remains bounded |
| Unpaired Roam/Invite | -1, flooring at 0 | Idle movement and invitations |
| Unpaired Cooldown | +2, saturating at 100 | Gentle idle movement, no invitations |

Immediately after an energy change or admission charge, energy below 20 sets the rest latch and aborts any invitation/pair on both sides. The latch clears at energy at least 60. At energy zero the resident still exists and rests; starvation never destroys source. Nursery has its own row and does not latch merely because it starts at 40. At maturation, initialize the adult latch from its current energy (`energy < 20`). Explicit resident removal can always release space.

Fixed step order: (1) validate and apply ordered explicit commands against the current tick, including admission; (2) advance one tick, or pause at the ceiling; (3) mature eligible nursery residents; (4) update scheduled energy and latch state; (5) invalidate expired/withdrawn/stale pairings and proposals; (6) resolve reciprocal invitations using this common snapshot; (7) perform reserved movement; (8) update courtship dwell and emit proposals. No second admission or task execution is hidden in the step. Command replies name the tick of commit. On global pause explicit management commands remain possible at the frozen tick; they cannot force maturation or replenish energy.

This order makes readiness and depletion deterministic. An energy update invalidating a pair happens before courtship completion, so it cannot produce a proposal from a depleted partner. All energy deltas are fixed integers; geometric path length and render frame rate do not change them. Refresh loops cannot mint energy because only a recorded tick advances it.

## Mutual participation and compatibility

Pair enablement is a user-authored local simulation preference, not an autonomous creature's consent, an inherited author permission, or an external authorization. Both residents must separately have pairing enabled; a nursery always has it disabled. Enabling one never enables its partner. Offspring never inherit either parent's participation switch. Withdrawal increments the policy epoch and atomically cancels any pair and pending proposal involving that resident, even if immediately re-enabled.

At pair selection require: distinct active adult residents; both enabled and not resting; energy at least 60; `tick >= readyAfterTick`; no partner or unresolved offspring proposal for either resident; free rendezvous slots; compatible explicit recipe capability. This imposes a stricter bound of one unresolved proposal per resident, hence at most 16 social proposals despite the general 32-proposal store. One-sided invitations cannot reserve a partner. Resolve unordered reciprocal pairs disjointly as in the social report; lineage, reputation or apparent visual affinity cannot bypass these predicates.

Compatibility is separate from attraction. Attraction may rank visible operation roles and shapes. A compatibility preflight returns closed statuses `supported`, `unsupported`, `metadata-missing`, or `stale`; it never guesses units from names or executes either parent. Body variation may use recovered source after anatomy validation; task mating requires available validated IntentIR and exact port/unit agreement. For initial automatic recipes recommend the genetics report's pure graphs only. Guard-aware effectful mating proposed by the semantics report requires a separate reviewed recipe; it must not be enabled by social affinity. Compatibility is revalidated during preparation and admission.

Relatedness is a selectable **simulation policy**, not a genetic disease model: default reject self-resident, equal parent artifact IDs, direct parent/child resident pairs, and siblings sharing a known direct parent resident ID. Store only direct parent IDs with the child, permitting constant-size checks without recursively traversing lineage. When direct provenance is unavailable, body variation may proceed labeled `relatedness unknown`; a strict-relatedness mode instead refuses it. This detects no distant cousins and says so. A wider ancestry exclusion requires a separately bounded index, not recursive records.

## Courtship and finite outcomes

Reuse the social states and explicit bounds: Invite expires after 120 ticks; mutual Approach has a 160-tick deadline; Court requires 80 consecutive ticks in its two reserved slots; completed Proposal expires after 600 ticks. All intervals are half-open: a deadline `d` permits work only while `tick < d`; expiry wins at `tick === d`. A pair has one overall completion deadline `startTick+240`, so repeatedly losing dwell cannot prolong it indefinitely. Nonadjacent or invalid rendezvous resets dwell, and the overall deadline still applies.

Successful courtship stores one proposal with exact ordered parent resident/artifact IDs, source and companion-intent hashes, policy epochs, recipe capability/version, creation/expiry ticks and world ID. It releases rendezvous reservations and both partners into Cooldown with `readyAfterTick=t+200`. It does **not** reserve offspring space, debit birth energy, generate execution records, or create a resident. An aborted reciprocal pair also sets both cooldowns to at least `t+200`; a declined/expired unilateral invitation sets only its sender's cooldown to at least `t+40`. Cooldown and resting are orthogonal: resting may extend unavailability beyond the timer. An unresolved proposal itself prevents another pairing, even after cooldown ends.

No recipe retries in simulation ticks. Preparation allows the genetics recipe's maximum eight deterministic variant attempts, then returns a terminal diagnostic. An expired or invalidated proposal cannot be revived; create a new courtship. Resource refusal leaves an unexpired valid proposal retryable by explicit command. A rejected recipe creates no child, charges no energy and does not extend cooldown. Terminal cancellation clears the per-parent pending-proposal links atomically. Duplicate withdrawal/cancellation is harmless.

## Atomic offspring admission

Preparation is bounded pure construction and validation of candidate source/body/typed graph, with no store admission, parent energy charge or `Q.execute` call. Keep at most eight prepared candidates and at most one per proposal, each complete source at most 65,536 UTF-8 bytes plus at most 32 KiB lineage; candidate expiry equals proposal expiry. A candidate carries a digest of its complete canonical source and recipe, exact parent revisions/epochs, world/version and preparation validation version. Clearing/expiry discards that candidate object, not an admitted artifact. A source/recipe digest is identity, not authority.

An explicit `admitOffspring(candidateId, requestId)` first checks the successful-request ledger: the same request ID and payload returns its original result even after candidate removal; reuse with a different payload rejects `request-conflict`. An otherwise new request checks these guards together immediately before commit:

1. Same world and supported recipe/compiler versions; proposal unexpired, unused and still linked to these exact active parent residents; matching source/intent hashes and participation epochs; both enabled adults, not resting, with at least 50 energy. The lower threshold permits the bounded energy spent in courtship. A pending proposal need not satisfy the invitation predicate, which would reject its own existence.
2. Candidate has passed current constructor, graph, units, anatomy/ownership, source byte and novelty checks. Task/body/source change flags are independently inspectable. Unchanged offspring uses the separately labeled copy workflow rather than spending birth energy.
3. Fewer than 32 residents and eight nursery residents; a free guard-safe nursery spawn from a finite deterministic list. This uses the social swept-box/guard rules and cannot overlap adults or reserved clearings.
4. Artifact capacity if this is a new source, derivation capacity (128 default), candidate/lineage limits, request-ledger capacity and no SDK companion-metadata conflict. A reused artifact still needs its own new resident and derivation association. No execution-record capacity is required because admission executes nothing.

Commit one transaction: insert or reference the artifact; insert or reference the immutable derivation; insert child resident and its nursery slot; debit exactly 30 energy from each parent; set both cooldown deadlines to `max(old,t+200)`; mark proposal consumed and clear its pending links; remove prepared candidate; record the idempotent request result. Apply latch rules after charges. Either all happen, or none happen. If a derivation exists from a prior successful request, return that prior result without another resident or charge; a fresh deliberate repeat requires a fresh proposal. Different derivations producing the same artifact remain distinguishable.

Current SDK `#admit` mutates/enriches artifact metadata and has no cross-store transaction; calling it first and then checking nursery or lineage capacity is insufficient. Integration should add a prepare/validate phase and stage all stores in an immutable draft, then swap one ranch-state root after success. Serialize commands while committing. Async preparation returns an inert object; its later callback cannot mutate the current world. If artifact storage remains a separate mutable Runtime, add an explicit atomic batch protocol there rather than pretending a rollback of world state undoes SDK mutation. Use revision checking for async hashes/validators and a final synchronous commit check.

Bound the successful-request ledger to 128 entries, retain entries for this world session, and reject new admissions when full. Do not evict IDs that can later replay as new births. World-local command sequence and resident counters never wrap. Derived IDs use world ID and monotonic admission sequence, not ambient timestamps or `randomUUID`; derivation IDs use canonical recipe hashes as specified by semantics. Exhausted stores return a named limit and leave parents, proposal and counters unchanged. Disk persistence, if added, needs one durable transaction; this in-memory proposal makes no crash-durability claim.

## Nursery, lineage and independent execution

After 200 actual simulation ticks a nursery resident becomes adult at its existing position. Maturation does not run the task, copy a parent result or enable pairing. The UI shows `not evaluated` until its own explicit Run. Nursery residents can be inspected, retired, exported or explicitly run without changing age or world energy; if product design disables Run in nursery, that is a UI policy rather than program dependence on maturity.

Keep immutable direct-parent derivation records outside executable source, with recipe/version, parent source identities, optional parent resident IDs, child source identity and bounded node inheritance map. Do not recursively embed ancestors, execution records, credentials, providers, authority or fabricated unit declarations. Genetics' optional source-authored recipe is an assertion that can be replay-checked when parent evidence exists; it is not authenticated lineage. Missing companion lineage on source recovery is `unavailable`, even when a source claims parent hashes. Retiring a parent does not invalidate an already admitted child's self-contained program; it invalidates unfinished proposals using that parent. A child can recover and execute without either parent present.

## Concrete scenarios

- Adults A and B start at energy 80. They mutually enable pairing, pass typed compatibility, approach for 40 ticks and court for 80. Six paired energy updates cost 12 each; proposal creation leaves energy 68. An immediate explicit admission costs 30 each, leaving 38; child C starts nursery at 40. Ten nursery energy updates and 200 ticks make C an adult at energy 80, still pairing disabled and not evaluated. A and B cool down for 200 ticks; they must also regain invitation energy 60 before pairing again.
- A budget task and a mean task may prepare the semantics report's child: donor computes mean of `[10,20,30]` in litres, replacing recipient's available 5 litres for desired 12 litres. Admission yields a self-contained child; a later explicit Run computes `{allocated:12,remaining:8}`. Parents' results and ecological energy never become its inputs. Seconds-versus-litres mismatch refuses preparation.
- At 31 residents and seven nursery residents, two queued admissions compete for the last slot. The first valid command commits; the second returns `resident-limit` with zero parent charge and its still-valid proposal intact. At eight nursery residents but only 20 total residents, admission returns `nursery-limit`; bounded nursery maturation can later free designation capacity.
- A prepared candidate finishes after parent A withdraws, changes source, retires, or the proposal expires. Admission rejects with the corresponding stale/withdrawn/expired result. Re-enabling A does not restore its old policy epoch. The candidate never executes or partially enriches SDK metadata.
- Both parents have energy 50. Admission leaves 20 each, which does not set the `<20` rest latch. A later depletion to 19 forces rest. At energy 49 admission refuses; it never creates a child with only one parent charged.

## Acceptance checks and proof scope

Model with three residents, one nursery slot, two proposal slots, energies abstracted across 0/19/20/49/50/59/60/100, bounded epochs and timers. Check mutual enablement, no self/double pairing, per-parent single pending proposal, no nursery pairing, deadline precedence, nonnegative bounded energy, atomic two-parent charges, child/slot/derivation correspondence, stale epoch/source refusal and request idempotence. Deliberately split the two parent charges into separate transitions and demonstrate that the invariant detects partial birth. Abstract energy domains must preserve guards; these are proposed checks, not claims about completed Quint or Lean proofs.

Implementation fixtures should cover 32 adults; eight nursery; full artifact/lineage/request stores; existing-source metadata conflict; deterministic simultaneous admissions; withdrawal followed by re-enable; expiry exactly at admission; zero-energy recovery; repeated dwell resets; tick exhaustion; source-only child recovery; retired parents; repeated request IDs after candidate removal; and preparation finishing after world reset. Assert canonical replay under differing render schedules and exact counter/store equality before and after every rejected admission.

Instrument interpreter and execution-record counters: 10,000 ecology/social ticks, renders, preparations, admissions and maturation must produce zero task runs. One explicit child Run must produce exactly its own fresh record. Existing `Runtime.reproduce` executes a fresh identical-source copy; do not call it from birth or use it as the transactional admission primitive. These lifecycle invariants establish bounded simulation behavior, not biological fitness, program usefulness, collision-proof geometry, wall-clock performance or implementation refinement.
