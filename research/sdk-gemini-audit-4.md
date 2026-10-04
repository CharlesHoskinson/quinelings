# Agent SDK Audit Report

## 1. Resource Exhaustion / Budgets (Severity: High)

* **File / Line:** `packages/agent-sdk/src/index.ts` (inside `inert()` limit check at ~line 22-26) and `recover()` (line ~142).
* **Concrete Failing Scenario:** The `Runtime.recover` function parses incoming payloads (like `colors`) by passing them to `inert()` to validate that the JSON object is plain, free of accessors, and non-cyclic. `inert` increments a `visits` counter on every nested object/array and primitive value, with a hardcoded limit of `++visits <= 150000`. However, a perfectly valid, max-budget Quineling color genome (2049 crests × 32 tuples × 3 RGB values) contains over 196,000 numbers and ~67,000 arrays. Attempting to recover a valid genome of this size will unconditionally hit the visit limit, throwing a `JSON resource limit exceeded` error and rendering the recovery of large authentic genomes impossible.
* **Recommended Fix:** Increase the hardcoded `visits` threshold in `inert()` (e.g., to `500,000`) or pass a context-specific `visitLimit` argument so that dense numerical matrices (like `ColorGenome`s) have a safe margin without opening the door to algorithmic complexity attacks.
* **Independent Verification:** Tested directly via Node.js by constructing an array of 2049 arrays of 32 RGB tuples, then calling `runtime.recover({ colors: ... })`. The execution aborted synchronously with the expected `JSON resource limit exceeded` exception.
* **Formalization:** Requires the Lean invariant for **Resource Exhaustion (Termination/Bounded Size Proof)**.

---

## 2. Package Portability / Module Identity (Severity: High)

* **File / Line:** `packages/agent-sdk/build.mjs` (Line 4).
* **Concrete Failing Scenario:** The SDK uses `esbuild` with `bundle: true` across 5 different entry points (`index.ts`, `mcp.ts`, `a2a.ts`, and CLIs) but incorrectly omits `splitting: true`. As a consequence, esbuild resolves relative imports (like `../../../core.js` and `Runtime`) independently for each output file. If a consumer application imports `Runtime` from `@quinelings/agent-sdk` and `createQuinelingMcpServer` from `@quinelings/agent-sdk/mcp`, they load two separate, disjoint copies of the Quinelings runtime. This silently breaks singleton behavior (such as `bufferCache` in `anatomy.js`), invalidates `instanceof Runtime` checks, and bloats the published package size significantly.
* **Recommended Fix:** Add `splitting: true` alongside `format: 'esm'` in the esbuild configuration in `build.mjs`. This directs esbuild to extract shared internal dependencies (like `Runtime`, `core.js`, `anatomy.js`) into shared chunk files that all entry points safely reference.
* **Independent Verification:** Verified by dynamically importing `dist/index.js` and `dist/mcp.js` concurrently in Node.js. `(await import('./dist/index.js')).Runtime === (await import('./dist/mcp.js')).createMcpServer.constructor` evaluated to `false`.
* **Formalization:** Requires the Lean invariant for **Package Portability (Module Identity/Singleton Equivalence)**.

---

## 3. Source Admission / Mutation (Severity: Medium)

* **File / Line:** `packages/agent-sdk/src/index.ts` (inside `Runtime.#admit` around lines 96-101).
* **Concrete Failing Scenario:** When an artifact is discovered/admitted via `recover`, it doesn't possess an execution intent (so `intent` remains `undefined`). If the user subsequently issues a `create` or `compile` command with a rich, typed `intent` that generates the *exact same canonical constructor source*, `#admit` correctly locates the existing artifact in `#artifacts` to avoid duplication. However, instead of merging the new `intent` onto the artifact, the code simply executes `return copy(existing)`. The newly compiled intent metadata is silently dropped, meaning the resulting returned task inexplicably lacks its typed intent.
* **Recommended Fix:** Modify the conflict-resolution block in `#admit` to lazily populate missing metadata. If `existing.intent` is falsey but `metadata.intent` is provided, mutate `existing.intent = copy(metadata.intent)` and update the `contract` before returning it. 
* **Independent Verification:** Restored a source via `runtime.recover({ source: '[1] | sum' })` (yielding `intent: undefined`), then compiled the same string via `runtime.create('[1] | sum')`. Inspected the artifact returned by `create` and verified that its `intent` property was falsely left `undefined`.
* **Formalization:** Requires the Quint lifecycle property for **State Equivalence (Idempotence & Metadata Propagation)**.
