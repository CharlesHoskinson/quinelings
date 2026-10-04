# Agent SDK Audit Report

## 1. Provider Proposal `sourceMap` Omission
- **Severity**: High
- **Exact file/line**: `packages/agent-sdk/src/index.ts`, Line 99
- **Concrete failing scenario**: An A2A client or provider generates a proposal containing a `sourceMap` that maps English thought text ranges to generated intent steps. When `Runtime.propose` compiles this intent, it calls `this.compile(proposal.intent, config)` which does not accept a `sourceMap` argument. The provider's custom `sourceMap` is permanently lost and silently replaced by the core compiler's default mapping, breaking provenance highlighting in the UI.
- **Recommended fix**: Bypass the wrapper and call `#build` directly to preserve the map: `artifact: this.#build(proposal.intent, config, proposal.sourceMap)`.
- **Independent verification**: Create a mock `ProposalProvider` that yields a custom `sourceMap`. Call `Runtime.propose` with it and assert that `artifact.sourceMap` strictly equals the custom map (currently it fails and equals the default).
- **Quint/Lean Requirement**: **Quint State Invariant**. An invariant asserting that metadata from a supported provider proposal is strictly preserved in the resulting artifact's state: `∀ p ∈ Proposals: p.status = "supported" ⟹ Artifact(p).sourceMap = p.sourceMap`.

## 2. `inert` Validation Crashes on Explicit `undefined`
- **Severity**: Medium
- **Exact file/line**: `packages/agent-sdk/src/index.ts`, Line 30
- **Concrete failing scenario**: A TypeScript SDK consumer passes a config with explicit optional parameters, such as `runtime.create(thought, { seed: undefined })`, or supplies an `Intent` with `assumptions: undefined`. The `inert` validator's `visit` function checks `x && typeof x === 'object'`, which evaluates to falsy for `undefined`, causing `check()` to throw an unhandled `invalid-input` ("Expected JSON data") error instead of cleanly dropping it like `JSON.stringify` does.
- **Recommended fix**: Add `if (x === undefined) return;` at the top of the `visit(x, depth, seen)` function inside `inert`.
- **Independent verification**: Add a unit test asserting `assert.doesNotThrow(() => runtime.create('[2]|sum', { seed: undefined }))`.
- **Quint/Lean Requirement**: **Lean Totality Proof**. A theorem proving that the recursive validation function is total (does not crash) over the entire domain of valid TypeScript shapes, including explicit `undefined` assigned to optional properties.

## 3. Unsafe Offset Pagination in Bounded Task Store
- **Severity**: Medium
- **Exact file/line**: `packages/agent-sdk/src/a2a.ts`, Lines 40-41
- **Concrete failing scenario**: A client calls `ListTasks` (page 1, size 50) and receives `nextPageToken: "50"`. Before the client fetches page 2, the `BoundedTaskStore` reaches its 128-task limit and dynamically evicts the 10 oldest terminal tasks. The client requests page 2 with `pageToken: "50"`. Because the `all` array is dynamically evaluated and is now 10 items shorter, slicing at offset 50 causes the client to permanently miss 10 shifted tasks.
- **Recommended fix**: Replace integer offsets with cursor-based pagination (e.g., passing the `taskId` of the last seen item as the `pageToken`) or document clearly that this experimental bounds-evicting store explicitly drops pagination safety guarantees.
- **Independent verification**: Initialize `BoundedTaskStore(10)`. Save 10 tasks. Call `list(pageSize: 5)`. Save 5 more tasks (triggering eviction). Call `list(pageToken: "5")` and assert that the returned tasks seamlessly continue from the previous page without skipping.
- **Quint/Lean Requirement**: **Quint Safety Property**. A formal specification proving that sequential chunked reads over a mutating store guarantee exactly-once or at-least-once item delivery (`Stable Cursor Isolation`).
