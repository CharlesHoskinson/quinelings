# Quinelings SDK Audit Report: Specialist 2

## Findings Summary
I have independently verified the implementation of `packages/agent-sdk/src`, `tests`, `docs/sdk-*.md`, `thought.js`, `anatomy.js`, and `core.js` by running the test suite locally (which passed with 46 assertions confirmed) and performing a static analysis of the runtime lifecycle. 

Below are two actionable bugs related to execution state, stale records, and source provenance.

---

### Bug 1: A2A Adapter Memory Leak on 'Clarify' Status
* **Severity:** High (Denial of Service)
* **Exact File/Line:** `packages/agent-sdk/src/a2a.ts`, line 81
* **Concrete Failing Scenario:**
  A user submits an ambiguous thought (e.g., `"make my city happy"`) via the A2A broker. The runtime parses this as `clarify`. `QuinelingExecutor.execute` updates the A2A status to `TASK_STATE_INPUT_REQUIRED` and sets `state.running = false`. However, it fails to execute `this.pending.delete(taskId)` (unlike the success/rejection branch on line 82).
  Because `TASK_STATE_INPUT_REQUIRED` is not considered a terminal state by the bounded task store eviction logic (line 11), the task remains in memory forever. Once 128 such abandoned or unanswered tasks accumulate, `this.pending.size >= 128` triggers the throw of `Too many interrupted tasks` (line 65), permanently blocking any new requests for the runtime instance.
* **Recommended Fix:** 
  In `a2a.ts` line 81, add `this.pending.delete(taskId);` inside the `if (resultStatus === 'clarify')` branch. The executor is stateless between messages; if the user provides clarification, it will arrive as a fresh A2A request resuming the task, which is safely re-added.
* **Required Lean Invariant/Quint Lifecycle:**
  **Finite resource allocation invariant** (Bounded execution store limits and complete task lifecycle eviction).

---

### Bug 2: Stale Companion Metadata Desync in Artifact Store
* **Severity:** Moderate
* **Exact File/Line:** `packages/agent-sdk/src/index.ts`, lines 86-87
* **Concrete Failing Scenario:**
  A user creates a thought like `[2,3,4] | sum` and it is compiled into a new artifact. Later, they submit a semantically identical thought with different formatting/prose: `[ 2, 3, 4 ] | sum`. The runtime builds an identical AST and canonical source, so `this.admit()` safely returns the existing stored artifact. 
  However, in `Runtime.create` (line 86), the code explicitly overwrites `stored.sourceMap = copy(parsed.sourceMap)` but ignores the new `intent` and `assumptions`. The `sourceMap` now contains source offsets pointing to the *new* text, but the `intent.thought` on the artifact remains the *old* text. This completely breaks source provenance tracing and syntax highlighting, as offsets no longer align with the stored English prose.
* **Recommended Fix:** 
  The lifecycle contract explicitly states: *"Within the same runtime, an existing source reuses its artifact ID and stored companion metadata."* To honor this, `Runtime.create` should **not** mutate `stored.sourceMap` at all when an artifact is reused. If the prose requires a separate review, the new source map should also be discarded in favor of the stored one, ensuring metadata coherence.
* **Required Lean Invariant/Quint Lifecycle:**
  **Source provenance invariant** (Companion metadata coherence and immutable source-bound identity).
