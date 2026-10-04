# Design Audit Report 2/3: Social State Machine & Formal Properties

**Auditor Focus:** Social state machine, reciprocal participation, atomic birth, freshness, finite resources, replay and proposed Quint/Lean properties.

## 1. Concrete Defect: Energy Economics Preclude Reproduction
**Severity:** Critical (Logic / State Machine)
**Candidate Section:** Section 4. Social world and lifecycle

**Defect Description:**
The finite resources simulation mathematically prevents reproduction for the vast majority of spatial configurations due to the tight coupling of the rest latch, energy drain, and birth requirements. Residents stop resting exactly when their energy reaches 60. From that moment, energy monotonically decreases during roaming, approach, and courtship. The time required to physically traverse the arena guarantees that energy will fall below the birth threshold before courtship finishes.

**Counterexample:**
1. Adult A and B rest until their energy reaches 60. The rest latch clears, making them active.
2. They immediately form a reciprocal pair and begin approach. Starting energy: 60.
3. They are located 100 units apart in the 512x320 arena. At a conservative 1 unit/tick, approach takes 50 ticks (both moving towards each other).
4. Courtship strictly requires 80 consecutive ticks. Total paired duration = 130 ticks.
5. Paired approach/court drains 2 energy per 20 ticks. Energy lost = `(130 / 20) * 2 = 13`.
6. Ending energy for both parents is 47.
7. Birth demands: *"Birth costs 30 each parent after both still have ≥ 50"*.
8. Because `47 < 50`, the birth fails, triggering an abort cooldown. Any approach taking longer than 20 ticks (leaving exactly 80 ticks for courtship to hit a 10 energy / 100 tick budget) will definitively fail, rendering the 512x320 arena practically sterile.

**Exact Correction:**
Increase the rest latch clear threshold and the starting energy of imported adults to create a sufficient energy buffer for traversal.
*   **Change:** `"Below 20 sets rest latch ... at ≥ 90 clears it."` (Provide a 40-point buffer above the 50-point birth requirement).
*   **Change:** `"Imported adults start 90, pairing disabled."`

**Test/Model Obligation:**
*   **Quint:** Add a positive liveness trace asserting that two agents starting at opposite corners of the 512x320 arena can successfully pair, approach, complete the 80-tick courtship, and spawn a child without hitting the `energy < 50` failure condition.
*   **Lean:** Formulate a capacity lemma proving that `max_arena_traversal_ticks * approach_cost_rate + court_ticks * court_cost_rate <= rest_clear_threshold - birth_minimum`.

---

## 2. Required Corrections vs. Optional Enhancements

### Required Corrections
*   **Energy Buffer (Detailed Above):** The mathematical contradiction between the 60-energy cap, the time-distance traversal cost, and the 50-energy birth floor must be fixed.
*   **Tick Ceiling Saturation:** The specification states *"Birth/maturation/expiry deadlines must fit tick ceiling"*. The admission transaction must explicitly reject proposals where `current_tick + 200 (nursery/cooldown) > 1,000,000`, rather than allowing silent truncation or overflow.

### Optional Enhancements (Utility & Aesthetics)
*   **Aesthetic State Feedback:** Introduce a visible "exhaustion" indicator (e.g., dimming chroma or resting pose) when the rest latch is engaged. Currently, if a pair breaks up silently due to hitting `< 20` energy mid-courtship, the user experiences a frustrating lack of feedback.
*   **Utility - Explicit Replay Eviction Signal:** Since the ledger uses strict rejection (*"full ledgers reject rather than evict"*), a session is permanently capped at 128 successful births. While 128 is generous for a single sitting, the UI should gracefully notify the user when the ledger is full, prompting a world export/refresh rather than failing silently.

### Unproved Properties
*   **Continuous Collision-Free Paths:** The specification claims *"Straight interpolation stays inside the swept box"*. While true for point masses or axis-aligned bounding boxes moving strictly orthogonally, diagonal straight interpolation of a rotating or non-circular guard box can clip corners outside the Minkowski sum of the swept area. The Lean obligation must mathematically define the geometric bounds of the "swept box" rather than assuming English definitions of "straight interpolation" guarantee disjoint continuous geometries.

---

## 3. System Strengths (Freshness & Replay)
The design robustly handles several complex state transitions within the assigned focus areas:
*   **Freshness & Epochs:** Binding the pending proposal to `policy epochs` effectively eliminates race conditions. If a parent is withdrawn or rests, the epoch increments. A delayed admission request (e.g., from a slow MCP agent) will safely fail the `exact parent resident/source/companion/policy epochs` check.
*   **Atomic Birth:** Staging state validations prior to the synchronous transaction prevents partial commits (e.g., charging energy without generating a resident).
*   **Bounded Resources:** Hard limits (32 residents, 16 pairs, 128 receipts, 1MiB snapshot) ensure predictable memory consumption and prevent runaway social graphs.

---

## 4. Candidate Recommendation
**Status: CONDITIONAL PROCEED**

The converged experimental candidate demonstrates a rigorous, well-bounded approach to social state management, atomic transactions, and formal verification targets. The strict epoch-based freshness checks and ledger bounds provide excellent defense against replay and stale-state bugs.

However, the mathematical contradiction in the energy economics (Section 4) fundamentally breaks the reciprocal pairing mechanic. Conditioned upon applying the exact correction to the rest latch threshold (e.g., raising it to 90 to allow arena traversal), this design is cleared for implementation from the perspective of social state and formal properties.
