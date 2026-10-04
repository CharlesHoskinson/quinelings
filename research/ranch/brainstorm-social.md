# Social ranch: a bounded garden of invitations

Proposal for convergence, 2026-10-04. QDL remains experimental. This report changes no executable code and makes no claim of completed verification.

## Recommendation

Build a small, deliberately spacious artificial-life garden: at most 32 residents move among four gathering clearings, recognize nearby neighbors, exchange reversible invitations, and sometimes settle into a shared courtship pose. A completed courtship creates an inert pairing proposal. A person separately chooses whether to prepare and admit an offspring, inspect its changed task/body, and run it. The social world never calls the task interpreter.

Use local separation and weak attraction, inspired by Reynolds's actor-based flocking [1], with explicit social states above the steering layer [2]. Start with conservative integer movement reservations rather than an ORCA solver: ORCA offers a stronger established navigation method under its stated assumptions [3], but adding a floating-point optimization library would increase the first candidate's replay and refinement burden. Our reservation proposal does not inherit ORCA's guarantees.

## Three clocks and three APIs

| Layer | Inputs and result | May change |
| --- | --- | --- |
| Render | `view(snapshotA, snapshotB, alpha, bodyPhase, options)` | Returned geometry only; no simulation ticks, randomness, records, pairings, or task runs |
| World | `stepWorld(state, orderedCommands)` advances one integer tick | Positions, invitations, gathering membership, bounded social events and proposals |
| Task | Existing explicit SDK `run`; future explicit offspring preparation/admission | Executable artifacts and execution records under existing resource checks |

Existing `Runtime.frame` is passive; `Runtime.reproduce` currently admits an identical source and immediately performs a fresh execution. Do not call `reproduce` from a courtship callback or reuse its name for new-source mating. A future `prepareOffspring(pairingId, recipe)` should return a validated candidate without running it; `admitOffspring(candidateId)` and `run(artifactId)` remain distinguishable explicit operations. Lineage is external provenance, never inherited authority.

The world has its own version, seed and tick. Body phase stays independent, as `Design.motion.clock: 'separate'` already requires. Render interpolation reads two completed snapshots and cannot advance either clock. A paused ranch can still display an authored gesture, subject to reduced motion. Camera movement, selecting a resident, decoding source, opening an inspector, and requesting an SDK frame are passive.

## Concrete bounded state

- Arena: integer coordinates in `[0,512] × [0,320]`, with 16 units per visual world unit; fixed 20 Hz simulation.
- Residents: maximum 32, separate immutable `residentId` and canonical `artifactId`. Identical-source residents remain separate individuals. Display body scale must fit its entire accepted gesture envelope in an axis-aligned square of half-width 8 grid units, centered on the resident; derive this from the existing fixed portrait bounds. Shrink the display body if necessary. Guard squares are simulation geometry, not measurements inferred from current sampled points.
- Per resident: integer position, last step, goal, social mode, one partner ID or null, dwell/stall/cooldown counters, and explicit ranch participation switches. Ranch switches are companion state: source recovery neither invents nor inherits them.
- Maximum 16 active pairings, 4 gatherings of at most 8 residents, 32 pending offspring proposals, and 256 social event records. Reject proposal creation when full; coalesce or ring-buffer informational events with a visible dropped count. Do not silently discard an active pairing or proposal. No pairwise friendship matrix or unbounded history.
- Tick range `0..1_000_000`; exhaustion pauses with an explicit resource result. Restart creates a new world identity. No offline catch-up: a hidden tab pauses, and simulation consumes at most four queued ticks per visible frame before pausing backlog accumulation. For exact replay, replay the recorded ticks and commands, not wall time.

Determinism contract: same canonical initial snapshot, ordered command log and simulation version yield the same canonical world snapshots. Sort residents by immutable ID, then rotate scheduling priority by `tick % residentCount`. Commands have a tick and unique integer sequence; reject duplicate sequences. Use no `Math.random`, locale sort, wall time, body-sampling result, or task output in world decisions. Seed-derived idle waypoints use a specified uint32 hash/mixer over `(seed, residentOrdinal, wanderEpoch)`; document the exact implementation and fixtures. IDs provide identity, not a claim of trust.

## Coexistence, spacing and attraction

Admission requires a free guard square inside the arena. Search a finite stable list of spawn points; reject when none is available. Leave empty space even if the population cap allows more residents.

Each tick, each resident considers eight one-grid-unit steps and waiting. Rank candidates using integer costs: goal distance squared, a crowd penalty inside a 48-unit neighborhood, and a small heading-change penalty. Separation is a hard acceptance constraint; attraction cannot override it. Stay within an 8-unit boundary inset.

For each proposed step, form the axis-aligned box covering its old and new guard squares. Reject a step if that box intersects any other resident's old guard square or any already accepted movement box. Waiting is always available from a valid snapshot. Strictly separated accepted boxes make simultaneous straight-line visual interpolation safe, provided the entire body envelope remains inside its guard square. This is conservative: crossing swept boxes can reject motions that would actually be safe. Do not label this a continuous-physics simulation.

After 40 blocked ticks, select another deterministic waypoint and cancel an unfinished approach; do not teleport or relax spacing. Rotating scheduling priority reduces fixed-ID advantage but does not establish starvation freedom. At 32 residents, checking eight movement candidates against all residents and accepted boxes is comfortably bounded; benchmark it rather than claim a browser frame-rate guarantee.

Attraction targets are chosen every 20 ticks, with commitment hysteresis. Eligible neighbors must be inside 96 units, available, and participate in social invitations. A default aesthetic affinity score can combine shared gesture kind and overlap in public operation-role sets, with a diversity bonus for different anatomies. These are visible structural heuristics, not inferred English meaning, execution compatibility, consent, task usefulness, or genetic fitness. Cap each score term and publish the formula. Distance penalty and stable-ID tie breaking select one target. Offer a neutral mode in which all eligible neighbors have equal affinity.

## Courtship and gatherings

| State | Transition and bound |
| --- | --- |
| Roam | Choose idle waypoint or available gathering; no offspring consequence |
| Invite | One outbound invitation; expires after 120 ticks; recipient can be unavailable or decline through its explicit participation setting |
| Approach | Begin only for reciprocal invitations resolved on the same old snapshot; reserve both partners; timeout 160 ticks |
| Court | Both reach distinct guard-safe rendezvous slots and remain there for 80 consecutive ticks; movement or invalidation resets/aborts dwell |
| Proposal | One inert proposal binds the two exact source IDs, resident IDs, social recipe version and creation tick; then release partners |
| Cooldown | 200 ticks before another invitation; no repeated pressure on an unavailable resident |

Resolve reciprocal candidates as unordered pairs sorted by score and IDs; admit disjoint pairs only. All participants use one mode and at most one partner. A withdrawal, resident removal, source change, or lost reservation aborts both sides atomically. A proposal expires after 600 ticks or a parent change. Offspring preparation must recheck exact parent sources, proposal freshness and finite stores; asynchronous results cannot overwrite newer edits. Courtship completion says “pairing ready to inspect,” never “child born.” The genetics workstream owns whether a recipe changes task, body, or both and must reject unsupported compositions.

For rendezvous, enumerate a finite list of two-slot clearings at least 20 grid units apart; both slots must be free before reserving them. No available pair of slots means graceful timeout. Gatherings use eight pre-authored slots at each of four clearings, with at most one member per slot. Assign from the previous snapshot in stable order, reserve before approach, and release on departure or timeout. Gathering invitations cannot displace courtship slots. Prefer sparse crescents and rings visually; group membership creates no mating permission.

Courtship decoration belongs to a view overlay: partners lean toward one another, a thin ribbon joins their centers, and the clearing briefly warms. Keep operation-role colors and body ownership inspectable. Do not rewrite authored gestures or canonical source merely to make social choreography. Do not phase-lock every gathering; slight deterministic phase offsets make a meadow instead of a synchronized factory. Reduced motion removes ribbons' travel and freezes bodily motion; state labels and a textual event list still convey changes. Do not smooth positions with overshooting splines that leave guard squares.

## Example

Residents A and B hold different sources; both contain `sum` but have different gesture/body designs. Structural affinity brings them into the same clearing. They reciprocate invitations, reserve two slots, arrive, and dwell for four simulated seconds. The world records `pairing-ready` with exact source IDs. The inspector shows “same operation role; different anatomy,” with no claim about their thoughts. Selecting a genetics recipe previews its source diff and says whether it changes the executable task, body, or both. Admission adds a new resident only if the artifact store and a spawn slot have capacity. No execution record appears until the person chooses Run. Identical-source copying is separately labeled copying.

## Verification expected before implementation acceptance

1. Golden replay: 10,000 ticks with admission/removal/withdrawal commands produce identical snapshots under different render frame schedules; inserting 100 frame/inspect/recover calls changes no world or execution counters.
2. Adversarial movement: crossing diagonals, same-position admission, crowded doorway, boundary corners, 32 residents and all gesture phases. Accepted movement boxes remain separated; body envelopes fit guards; timeout occurs without teleporting. Compare analytic envelope bounds rather than trusting sampled extrema.
3. Pairing safety: no self-pair, double partner, proposal from one-sided invitation, proposal after expiry, or successful stale-source preparation. Removing either partner resets both sides. A full proposal store stops proposal admission without growing memory.
4. Passive boundary: instrument `Q.execute` and SDK record/artifact stores. Render and 10,000 social ticks make zero calls, zero children and zero execution records. Add a deliberately unsafe courtship→run transition and show the regression test fails.
5. Small Quint model: three residents, two gathering slots, two proposal slots and bounded timers; check reciprocal pairing, unique slots, finite resources, stale proposal rejection and no implicit execution. Add an unsafe unilateral pairing transition to demonstrate invariant detection. Keep geometry and browser performance outside this model's proof claims.
6. Visual/accessibility review: crowded and sparse desktop/mobile scenes, distinguishable selected residents, keyboard-accessible partner/proposal inspection, reduced motion, bounded event narration. Benchmark maximum population at minimum existing body budgets; a global ranch render budget must coexist with anatomy's per-body owner/chart reservations.

Tradeoff: reservations can jam and introduce slight lattice motion; small steps, straight interpolation, open clearings and timeouts make that tolerable. This candidate favors explainable safe coexistence and reviewable reproduction over biologically realistic selection. Later ORCA or richer ecology should be a separately versioned simulation with new replay fixtures and stated assumptions.

## Primary references

[1] Craig Reynolds, [Flocks, Herds, and Schools: A Distributed Behavioral Model](https://www.red3d.com/cwr/papers/1987/boids.html), SIGGRAPH 1987. Supports local actor interactions producing aggregate motion; our discrete safety reservation and courtship protocol are new design proposals.

[2] Craig Reynolds, [Steering Behaviors For Autonomous Characters](https://www.red3d.com/cwr/papers/1999/gdc99steer.html), GDC 1999. Separates strategy, steering and locomotion; supports combining local steering goals. The task/render authority split is specific to this repository.

[3] Jur van den Berg et al., [Optimal Reciprocal Collision Avoidance](https://gamma-web.iacs.umd.edu/ORCA/), primary research project and linked publications. Describes reciprocal avoidance and low-dimensional optimization; considered as a future alternative, not implemented or claimed here.
