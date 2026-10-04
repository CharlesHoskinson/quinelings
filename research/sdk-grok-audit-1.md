# API ergonomics audit — agent SDK

Static reading of `packages/agent-sdk/src`, `thought.js`, `anatomy.js`, `kernels.js`, `core.js`, `chroma.js` (partial), SDK tests, and `docs/sdk-*.md`. **No tests were run in this audit.** Scenarios below are deduced from those reads unless marked as direct code. The tree changed during the reading. Remediations listed by root were **not re-read**, so they are assessed only against the last text actually seen.

## Remediations

| Claim | Last text seen | Assessment |
| --- | --- | --- |
| Strict per-op `IntentStep`; discriminated `ParseResult` / `CreationResult` | `types.ts`: op union with fixed port tuples; `status: 'supported'` carries `intent` or `artifact`; other statuses use `intent?: never` / `artifact?: never` | Present at last read of `types.ts`. |
| Generic `dispatch` / tagged `exchange` | `ResponseFor` and `TaggedResponse` in `types.ts`; `dispatch<R extends Request>` overload; `exchange` returns `TaggedResponse` | Present. `exchange` still returns through `as TaggedResponse` (`index.ts` around the `exchange` method). The cast does not check that `operation` and `result` stay paired. The switch last read did return the matching value per operation. |
| `#private` stores | `Runtime` `#artifacts`, `#records`, `#bodies` | Present. |
| Full `sourceBytes` | `#admit` sets `contract.sourceBytes` from `Buffer.byteLength(source)` of the canonical program | Present for artifacts that reach `#admit`. See finding 1 for the throw that happens earlier. |
| Provider `sourceMap` and diagnostic checks; abort if the provider promise never settles | `propose` checks status, diagnostic fields, assumption strings, then source-map use; `AbortSignal` listener rejects with `cancelled` while the provider promise is pending | Present at the second read of `propose`. A provider rejection is still forwarded as the original rejection, not a `QuinelingError`. |
| First companion kept; `metadata-conflict`; first metadata may be attached after a metadata-free recovery | `#admit`: same intent canon continues; different intent canon throws `metadata-conflict`; `metadata.intent && !existing.intent` writes intent, source map, and contract onto the stored artifact | Matches the new policy in code. `docs/sdk-lifecycle.md`, at the time it was read, still said a recovered artifact “remains without” metadata when reused. That sentence and the enrich branch disagree. Align the doc with the enrich rule. |
| `inert` visit cap 400000; large RGB recovery | `inert` stops above 400000 visits | The cap was in the source. This audit did not execute a large color genome. |
| ESM split chunks and a clean `dist` | `dist/chunk-7ZOAKOO4.js` at one point matched `wrap` and the enrich branch. `frame` later gained `nodeColors` / `nodeRoles` in `src` | Not re-checked after that `frame` edit. Do not treat this audit as proof that `dist` matches `src`. |
| Recursive MCP schemas; structured `code` / `path` | `schema.ts` recursive `JsonSchema` / `IntentTypeSchema`; MCP handler returns `QuinelingError.toJSON()` on `isError` | Present for `QuinelingError`. Non-`QuinelingError` throws in that handler still become `code: 'execution-failed'`, `path: '$'`. Official MCP SDK validation runs the same Zod schema before the handler, so ordinary schema misses become protocol invalid-params, not that fallback. |
| A2A paused expiry, eviction, protected active work, stable pagination cursor, failed-task `code` / `path` | Expiry, eviction, and `protectActiveTasks` were in `BoundedTaskStore`. The executor `catch` published `TASK_STATE_FAILED` with `error.message` only (`a2a.ts` in the `execute` catch) | Expiry and protection match the last read. **Failed-task `code` / `path` was absent in that read** and was not re-read after the claim. Treat it as unverified. |

Root’s 24 SDK, 47 browser, 176 Lean, and Quint runs were not available here and are not used as evidence.

## Findings

### 1. High — compiler `source-budget` is reported as `invalid-intent`

**Where:** `wrap` in `packages/agent-sdk/src/index.ts` (immediately after `QuinelingError`; about line 61 after the `chroma.js` import). `#build` calls `wrap('invalid-intent', …)`. `thought.js` `compile` (the `makeTaskProgram(graph)` try/catch) does `fail('source-budget', '$', e.message)` with a plain `Error`, not `QuinelingError`.

**What the code does:** `wrap` rethrows `QuinelingError` and otherwise builds a new `QuinelingError` with the wrapper code. It copies `path` and `message` and drops `error.code`. `#admit`’s own over-budget check is a real `QuinelingError('source-budget', …)` and survives `wrap`. The earlier `thought.js` failure does not.

`makeTaskProgram(graph)` inside `thought.js` builds a program with the default design and no assembly anatomy. `Runtime.compile` / `propose` later build a larger program with anatomy and gesture. Both failures are “complete source exceeds 64 KiB”, with two public codes:

- Payload large enough that the preflight program exceeds 64 KiB: thrown `code` is `invalid-intent`. Message is the kernel text (`Complete quine source exceeds 64 KiB`). `path` is `$`.
- Payload small enough for that preflight and too large only after anatomy: `#admit` throws `source-budget`.

`parse` / `create` of `plan ` plus the same JSON do not use `wrap`. `thought.js` `parse` puts `e.code` on the diagnostic, so the same plan comes back `status: 'inconsistent'` with `diagnostics[0].code === 'source-budget'`.

`docs/sdk-quickstart.md` says to branch on `code` because messages may change. `source-budget` is a public `ErrorCode`. Callers who branch on it miss the preflight failure. `verify-thought.cjs` expects `source-budget` from `thought.js` for three 12000-character strings; the SDK suite read here does not compile that fixture through `Runtime.compile`.

**Fix:** If `error.code` is already an `ErrorCode`, rethrow it as `QuinelingError` with that code and `error.path`. Keep `invalid-intent` for compiler codes that are not in the public union (`type`, `ports`, `cycle`, …). Add a direct test that `Runtime.compile` of a plan whose preflight source exceeds 65536 bytes throws `source-budget`, and that `runtime.create('plan ' + JSON.stringify(intent))` returns `inconsistent` with the same code.

**Invariant:** Quint `creation.qnt` `canBuild` / `boundary_overflow_is_rejectedTest` (`bytes <= 65536` is rejected, not admitted). Lean has no diagnostic-code theorem. Nearest source-identity statement is `QDL.Semantics.admission_copies_full_source` plus the 65536-byte admission check in `QDL.Quine`’s constructor model; the byte ceiling itself is the JS/Quint bound.

### 2. Medium — nested JSON failures are reported at path `$`

**Where:** `inert` in `index.ts`. Every `check` inside `visit` uses the default path `$`. `compile` / `dispatch` / `recover` / `propose` call `inert` before `thought.js`.

**Scenario:** An `Intent` that typechecks in TypeScript with `value: NaN`, a cycle, a sparse array, or `__proto__` throws `QuinelingError` `invalid-input`, message such as `Expected finite JSON numbers`, `path: '$'`. `thought.js` `finiteJSON` would have reported a path like `$.inputs.0.value`, and it never runs. The quickstart tells callers to revise the request using `path`.

Frame budget failures are the same shape: `anatomy.js` `frame` throws a plain `Error` (`integer frame budgets required`, `number outside [4000,24000]`), and `wrap('invalid-input', …)` stores `path: '$'`.

**Fix:** Thread a JSON path through `inert`. Map anatomy frame failures to `$.phase`, `$.options.budget`, or `$.options.crests`.

**Invariant:** Quint `diagnose` is the explicit-failure step (`clarify_blocks_executionTest` and the other diagnosis runs). Lean `QDL.ChromaSyntax` bounds own-property paths for lenses; it does not cover this walker.

### 3. Medium — 128 KiB intent budget uses two codes

**Where:** `thought.js` `compile`: `fail('budget', '$', 'Intent exceeds 128 KiB')` on canonical UTF-8 length. That becomes `invalid-intent` via finding 1. `mcp.ts` `quineling_compile` throws `QuinelingError('resource-limit', 'Intent exceeds 128 KiB.', '$.intent')` when `Buffer.byteLength(JSON.stringify(intent)) > 131072`, before `runtime.compile`.

**Scenario:** The same oversized intent is `resource-limit` through MCP and `invalid-intent` through `Runtime.compile` / A2A `compile`. `JSON.stringify` and `Q.canon` are not the same byte count, so some documents cross only one check.

**Fix:** One code, one measurement. Prefer `resource-limit` and path `$.intent` in `Runtime.compile` for the 128 KiB canon check, and call that helper from MCP instead of a second stringify check.

**Invariant:** Quint `budgets` / energy is a different counter. This is the SDK intent-size limit documented in `sdk-mcp-guide.md`, not a Lean theorem.

### 4. Medium — `JsonSchema` text states bounds the schema does not check

**Where:** `packages/agent-sdk/src/schema.ts`, `JsonSchema`. The `.describe` string says at most 512 array/record entries and 24 nesting levels. The Zod value is `z.array(JsonSchema).max(512)` and `z.record(key, JsonSchema)` with no key cap and no depth cap. `thought.js` `finiteJSON` does enforce depth 24 and 512 keys. `inert` allows depth 64.

**Scenario:** A client or model that trusts `tools/list` can send a record with well over 512 keys, or a nest deeper than 24. `IntentSchema.parse` accepts it. `Runtime.compile` then fails inside the compiler. MCP shows that failure as `invalid-intent`, not as a schema rejection.

**Fix:** Enforce `max` on record keys and a depth refine in `JsonSchema`, matching `finiteJSON`, or change the description so it does not claim those limits. Cover with `JsonSchema.safeParse` cases, not only `tools/list` shape checks.

**Invariant:** No Lean JSON-schema theorem. The live bound is `thought.js` `finiteJSON`. Quint `canBuild` does not model nesting.

### 5. Medium — normalized companions still count as a different intent

**Where:** `thought.js` `unit()` rewrites powers (`L*L` to `L^2`, bases sorted so `s*m^-1` becomes `m^-1*s`). `compile` stores that in `contract.types` and treats missing `assumptions` as `[]`. `#admit` compares `Q.canon(metadata.intent)` to `Q.canon(existing.intent)`. `stripOptional` removes `assumptions: undefined` and keeps `assumptions: []`.

**Scenario (deduced, not executed):** Compile an intent whose unit is `L*L` or `s*m^-1`, or whose `assumptions` key is absent. Read `artifact.contract.types` (canonical unit) or send the same intent with `assumptions: []`. The executable source can be identical because units and assumptions are not in the quine. The second `compile` throws `metadata-conflict`. A caller who copies `artifact.intent` unchanged is fine. A caller who copies the published contract type back into the intent is not.

This is separate from a real unit change (`L` versus `kg`) or a real thought change, which the lifecycle doc treats as a conflict on purpose.

**Fix:** Compare a canonical companion: run units through `unit()`, store `assumptions` as `[]` when omitted, and conflict only when that form differs. Test both spellings and omitted versus empty assumptions on one `Runtime` with the same seed.

**Invariant:** No Lean or Quint rule for companion documents. Quint `build` / `recover` admit a source token and do not store prose. The SDK rule that must stay true is: source identity does not change when only companion spelling changes (`QDL.Semantics.differing_source_rejected` is about a different source, which this path must not pretend to be).

### 6. Medium — task `graph` is not in the type callers can rely on

**Where:** `types.ts` `TaskRecord`: `output`, `effects`, `trace`, plus `[key: string]: Json`. `kernels.js` `run` returns `{output, trace, effects, graph}`. `core.js` `execute` stores that object on `tasks`. `tsconfig.json` has `noUncheckedIndexedAccess`.

**Scenario:** `record.result.tasks[0].graph` is the graph that actually ran, including the embedded design. The declared fields do not include `graph`. Index access types it as `Json` (and `| undefined` under the unchecked-index flag). `docs/sdk-lifecycle.md` says each task includes that graph. `output` remains the right field for the task answer; `result.result` is the interpreter return value (the reconstructed program), which the same loose `Json` type does not distinguish.

**Fix:** Declare `graph: Graph` on `TaskRecord` without a string index that erases it, or drop the index and list `trace` element fields (`edge`, `rule`, `inputs`, `value`). Add a type-level test that `tasks[0].graph.outputs` is `string[]`.

**Invariant:** `QDL.Integration.task_result_independent_of_design` and the Quint note that a run must be attributed to the graph that ran. `creation.qnt` `freshRecord` requires the record source to be the admitted source; the typed graph is how a caller checks that.

### 7. Medium — blank A2A text is a failed task, not `clarify`

**Where:** `a2a.ts` `requestFromMessage`. A text part is trimmed; empty or whitespace-only throws `RequestMalformedError` before `dispatch`. The `execute` catch last read mapped that to `TASK_STATE_FAILED` and the error message. `thought.js` `parse` trims and returns `status: 'clarify'`, code `missing`, for an empty string. `sdk-a2a-guide.md` calls a single text part shorthand for `create`.

**Scenario:** `Runtime.create('   ')` returns `clarify` and does not store an artifact. The same text through A2A, after trim, never calls `create`. The task is failed, not `TASK_STATE_INPUT_REQUIRED`. Non-empty unclear text such as `allocate` does reach `create` and is `INPUT_REQUIRED` (the A2A test file asserts that). The blank string is the split.

**Fix:** Pass the original text to `create` / `parse` and map `clarify` the same way as other clarification. Keep a transport error only for a missing part or a non-string.

**Invariant:** Quint `diagnose("clarify")` and `clarify_blocks_executionTest`: not compiled, no execution, explicit clarify status. Lean `render_no_execution` is the passive side of that, not the diagnostic code.

### 8. Low — `points` and `normals` do not share a stride, and the type does not say so

**Where:** `anatomy.js` `frame` writes four floats per sample into `points` (`x, y, z`, then `0.18`) and three into `normals`. `index.ts` `frame` copies those arrays into `Frame`. `types.ts` types both as `number[]`. `docs/sdk-quickstart.md` only requires `points.length > 0` and finite numbers. The runtime test expects `points.length === 16000` and `owners.length === 4000` for budget 4000, which is the 4-wide layout. That assertion was read, not run.

**Scenario:** A client that treats `points` as tightly packed xyz reads the constant `0.18` as the next x. `owners[i]` matches sample `i`, and `nodeIds` follows `artifact.graph.nodes`, which is the same order `anatomy.js` `nodeIDs` uses. `nodeColors` / `nodeRoles` are also one entry per graph node, not per sample.

**Fix:** Document the strides on `Frame` (`points` length `4 * owners.length`, `normals` length `3 * owners.length`, w fixed). Reject a frame where those lengths disagree before returning.

**Invariant:** `QDL.Assembly.tissueMin` / `tissueMax` (4000–24000) and `crestVertices` count samples and crest vertices, not flat floats. `aggregate_budget` is the sample budget.

### 9. Low — exported `Response` is not discriminated by `status` alone

**Where:** `types.ts` `Response = ParseResult | CreationResult | Artifact | ExecutionRecord | {artifact, record} | Frame`. Supported parse and supported create both use `status: 'supported'` and then different payloads (`intent` versus `artifact`).

**Scenario:** A function annotated with `Response` that branches only on `status === 'supported'` still has both a parse intent and a creation artifact in the remaining union. `dispatch`’s `ResponseFor` and `exchange`’s `TaggedResponse` avoid that. Callers who store the untagged `Response` do not.

**Fix:** Stop exporting `Response` as a value callers should narrow, or tag every variant with `operation` the way `TaggedResponse` does. Add the negative `tsc` checks next to `test/type-contract.ts` for “supported create has no `intent`” and “supported parse has no `artifact`”.

**Invariant:** Quint `diagnose` versus `build`: a non-supported status must not carry a compiled source. The TypeScript unions are the SDK image of that split. Lean does not model the response union.

## Closed or out of scope on the last read

These were in the code that was read; they are not open defects under the stated policy.

- Per-op port tuples and closed parameter objects in `IntentStep` / `IntentStepSchema`, including square-without-factor and multiply-with-factor.
- `ParseResult` / `CreationResult` omit the success payload on `clarify` | `unsupported` | `inconsistent`.
- `#admit` keeps the first intent canon and throws `metadata-conflict` when a second canon differs. Enrichment after a metadata-free recovery is the current code policy (finding 5 and the doc sentence are the leftovers).
- `propose` validates provider diagnostics and drops a non-supported proposal without compiling it. Abort during a still-pending provider promise rejects with `cancelled`.
- `sourceBytes` on an admitted contract is the UTF-8 length of canonical source.
- MCP `QuinelingError.toJSON()` keeps `code` and `path` for errors the runtime already classified, including `unknown-artifact` and compile `invalid-intent` at the compiler path (`$.inputs.0.value` in the MCP test source).
- A2A `clarify` / `unsupported` / `inconsistent` on a creation or parse result select `INPUT_REQUIRED` or `REJECTED`. Run and reproduce results have no top-level `status`, so they complete.

## Unverified claims

Failed A2A tasks retaining `code` and `path`, `dist` matching the `nodeColors` frame, and behavior of a large RGB recover were not re-read or executed. `wrap`’s code-dropping behavior was read in `src` and in `dist/chunk-7ZOAKOO4.js` before the later `frame` edit; it was not seen to change. Independent checks for findings 1, 3, and 5 are still required: this audit did not run `npm test`, `tsc`, or those fixtures.
