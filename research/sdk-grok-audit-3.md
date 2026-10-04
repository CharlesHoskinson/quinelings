# MCP/A2A audit (specialist 3)

Limitation: this report uses the last source read in this session (`packages/agent-sdk/src/a2a.ts`, `mcp.ts`, `schema.ts`, `types.ts`, `index.ts`, `build.mjs`, the MCP and A2A tests, `thought.js`, `core.js`, `spec/creation.qnt`, and the `@a2a-js/sdk` 1.3.0 / MCP SDK 1.32.0 handlers). Root’s later edits were not re-read. Line numbers are from that read. This audit did not execute the SDK, browser, Lean, or Quint suites. Root’s counts (24 SDK cases, 47 browser cases, 176 Lean theorems, lifecycle Quint) are root’s, not results from this session.

## Remediation assessment

These items were present in the last read and match the claimed fixes. They are not reconfirmed against later edits.

| Claim | Last-read evidence | Assessment |
| --- | --- | --- |
| Strict per-op `IntentStep`, discriminated parse/creation | `schema.ts` 34–72; `types.ts` 11–40 and 77–78 | Present. Each `op` has a closed parameter object and a fixed input tuple. `ParseResult` / `CreationResult` carry `intent` or `artifact` only when `status` is `supported`. |
| Generic `dispatch` and tagged `exchange` | `index.ts` 165–180 | Present. Unknown fields are rejected by `fields`. `exchange` returns `{operation, result}`. |
| Private stores | `index.ts` 63–65 | Present: `#artifacts`, `#records`, `#bodies`. |
| Full `sourceBytes` | `index.ts` 131 | Present. `contract.sourceBytes` is UTF-8 bytes of canonical source at admission. |
| Provider `sourceMap` and diagnostic checks | `index.ts` 102–109 | Present. Status, diagnostic shape, assumption bounds, and source-map spans are checked before `#build`. |
| Abort of an ignored provider promise | `index.ts` 99–101 | Present on `Runtime.propose`. The signal is checked before the await and again before admission. `test/runtime.test.ts` and `test/large-genome.test.ts` name this case. This audit did not run them. |
| First companion kept; `metadata-conflict`; first metadata may attach after recovery | `index.ts` 124–128 | Present. A second different intent for the same source throws `metadata-conflict`. An intent is written only when the stored artifact has none. |
| Large RGB recovery and visit budget 400000 | `index.ts` 27; `core.js` 76–80 | The visit cap of 400000 was present. Harmonic bands of 0–256 match `validateGenome`. This audit did not execute a large-genome recovery. |
| ESM split chunks and a clean `dist` | `build.mjs` as last read | The last `build.mjs` called `rmSync('dist')` before esbuild `splitting`. During the session, `dist/` still held superseded chunks (`chunk-DAA5B437.js`, `chunk-4YN6XOWT.js`) while `dist/a2a.js` moved to a newer chunk. A finished build from that script should not leave those imports. Equality of the final `dist/` to `src/` was not rechecked. |
| Recursive MCP input schemas and structured `code` / `path` | `mcp.ts` 34–54; `test/mcp.test.ts` 33–65 | `quineling_compile` is registered with `IntentSchema`. Domain failures use `QuinelingError.toJSON()` (`code`, `path`, `message`) and `isError: true`. The test file asserts resolved `$ref`s and `unknown-artifact`. This audit did not run it. |
| A2A paused expiry, protected active tasks, scoped cursor, failed-task `code` / `path` | `a2a.ts` 20–76 and 118–122; `test/a2a.test.ts` 85–125 | Present at last read: 15-minute lazy expiry, `protectActiveTasks`, HMAC cursor bound to tenant/user/filter query, immutable admission `sequence`, and `metadata.quinelingError` on `TASK_STATE_FAILED`. The cursor test in `a2a.test.ts` covers eviction of earlier rows and a forged token. It was not executed here. Wire survival of `quinelingError` through `Message.toJSON` was not executed here. |

`creation.qnt` still models tokens, not JSON, English, or codec bytes (lines 1–2 and 34–36). `QDL.Integration.reauthor_no_execution` (`spec/lean/QDL/Integration.lean` 49–52) states that authoring starts at zero executions. Neither theorem mentions MCP or A2A transports.

## Remaining findings

### 1. High — clarification follow-up replaces task history and keeps the clarify artifact

Last observed: `packages/agent-sdk/src/a2a.ts` 102 and 114–117. SDK merge: `@a2a-js/sdk` `dist/server/index.js` 2313–2316 and 2428–2434.

`execute` always publishes a new task whose `history` is only `context.userMessage`. `ResultManager.processTaskEventLocked` copies stored history only when the incoming history is empty. A one-element history therefore drops the original user message and the agent clarification. The new task event has no artifacts, so stored artifacts are kept. The success payload is then published under a new random `artifactId`, which appends instead of replacing.

Scenario: `SendMessage` text `allocate` ends `TASK_STATE_INPUT_REQUIRED` with one artifact `{operation:'create', result:{status:'clarify'}}`. A second `SendMessage` on that task id with `[1,2,3] | sum` ends `TASK_STATE_COMPLETED`. Expected transcript contains both user messages. Actual history, by the SDK merge above, contains the second user message and later agent status messages. `artifacts[0]` is still the clarify payload; `artifacts.at(-1)` is the sum. `docs/sdk-a2a-guide.md` tells clients to walk every artifact. A malformed follow-up is worse: validation runs only after that task event (`a2a.ts` 108–122), so the paused task becomes `TASK_STATE_FAILED` and cannot be resumed.

`test/a2a.test.ts` 56 asserts the same task id and `TASK_STATE_COMPLETED`. It does not read `history` or `artifacts[0]`.

Fix: publish the follow-up task event with an empty `history` so the SDK keeps the stored transcript. Use one stable A2A `artifactId` per task and `append: false` when a new attempt supersedes a clarify or reject payload. If `requestFromMessage` fails on an already interrupted task, publish `TASK_STATE_INPUT_REQUIRED` again, or fail the RPC without a terminal task state.

Independent test: drive `SendMessage` → `GetTask` → follow-up `SendMessage` → `GetTask`. Assert both user texts remain, the clarify artifact is gone or no longer first, and a two-part follow-up leaves the task `TASK_STATE_INPUT_REQUIRED` and still resumable. Do not treat the existing completion assertion as coverage.

Invariant: `creation.qnt` `diagnose` (28–33) then a later `build` (38–44). `clarify_blocks_executionTest` (127–128) and `passive` (112–114) require the clarify step to add no execution. Quint has no A2A history or artifact list. This finding needs a new trace property: resuming an interrupted proposal preserves the prior messages and does not leave a `diagnose` artifact ahead of the admitted result. No current Lean theorem covers it. `reauthor_no_execution` only covers the runtime execution count.

### 2. High — A2A text rejects thoughts the runtime classifies as clarify, and it trims before the length check

Last observed: `a2a.ts` 82–85. Runtime: `thought.js` 123. MCP calls `runtime.parse` / `runtime.create` with the raw string (`mcp.ts` 61 and 72).

`requestFromMessage` trims, then throws `RequestMalformedError` when the remainder is empty. That becomes `TASK_STATE_FAILED` (122). `thought.js` checks `length <= 16384` first, then trims, and an empty remainder returns `status:'clarify'` with diagnostic `missing`. `Runtime.create` returns that status without throwing, so MCP `quineling_create` is a successful tool result whose `result.status` is `clarify`. The A2A guide maps `clarify` to `TASK_STATE_INPUT_REQUIRED`.

Scenario A: text `"   "`. MCP `quineling_create` and A2A data `{operation:'create', thought:'   '}` follow `parse` and stay a clarification. A2A text becomes `TASK_STATE_FAILED` with “Thought text needs 1–16384 characters” and no clarify artifact.

Scenario B: one leading space plus `[1] | sum` plus spaces, total length 16385. Trimmed length is 9. A2A text accepts it and creates a lifeform. `runtime.parse` and MCP reject it for length before trim.

Fix: pass the original part text to `runtime.create` unchanged. Map `status:'clarify'` to `TASK_STATE_INPUT_REQUIRED`. Reserve `RequestMalformedError` for the wrong role, part count, or part kind.

Independent test: one table with whitespace-only text, whitespace-only data `create`, MCP `quineling_create`, and a 16385-character padded `[1] | sum`. Assert one status for all three adapters, and assert the length boundary against `thought.js` 123.

Invariant: `creation.qnt` `diagnose("clarify")` and `clarify_blocks_executionTest` (127–128). The text adapter never reaches `diagnose`. `passive` (112–114) is the property that must hold once the status is clarify. No Lean theorem states adapter parity.

### 3. Medium — a rejected task save still deletes paused tasks

Last observed: `a2a.ts` 42–46.

`save` evicts terminal and interrupted tasks until the projected size fits, then throws `RequestMalformedError` (“A2A task capacity reached by active work”) if active work still exceeds `maxTasks` or `maxBytes`. Deletions are already committed. `maxBytes` cannot be below 16 MiB, and one task may be 16 MiB (`MAX_TASK_BYTES`, line 13), so one protected working task plus one new working task can force this path.

Scenario: store limit 16 MiB; one protected `TASK_STATE_WORKING` task of about 9 MiB; one `TASK_STATE_INPUT_REQUIRED` task of about 7 MiB; `save` of another working task of about 9 MiB. The paused task is removed, the new save throws, and `load` of the paused id is missing.

The cursor test (106–118) checks a save that succeeds after evicting older terminal rows. It does not cover a save that throws.

Fix: choose victims without deleting them. Commit eviction only after the new task is known to fit. If it cannot fit even after every evictable row is removed, throw and leave the map unchanged.

Independent test: the sizes above, with `protectActiveTasks` covering only the working id. Assert the rejection, `load(paused)` still returns the task, and `bytes` is unchanged.

Invariant: none. `creation.qnt` 83–85 says the eight-energy model is not the SDK store, and `budgets` (119–121) is that energy model. This needs a store invariant: a failed `save` does not change the set of retained task ids.

### 4. Medium — `statusTimestampAfter` is an inclusive string compare

Last observed: `a2a.ts` 72. Reference store: `@a2a-js/sdk` `dist/server/index.js` 3584–3588.

The handler parses the parameter as a date string (`index.js` 3200–3201) and the reference `InMemoryTaskStore` keeps tasks whose timestamp is strictly greater. `BoundedTaskStore` keeps tasks when `timestamp >= statusTimestampAfter` using lexicographic order. Task timestamps written by this executor are `toISOString()` (`a2a.ts` 107).

Scenario A: list with `statusTimestampAfter` equal to a stored `Z` timestamp. That task is returned again. The reference store excludes it. A client polling “after the last task I saw” does not advance.

Scenario B, derived from the operators and not executed: a task at `2026-10-04T10:00:00.000Z` is after `2026-10-04T12:00:00.000+03:00` (09:00 UTC). String order treats `10` as less than `12`, so the task is dropped. `Date.parse` comparison includes it.

Fix: compare `Date.parse(task.status.timestamp) > Date.parse(params.statusTimestampAfter)`, and exclude missing timestamps, matching the SDK store.

Independent test: two tasks with known `Z` timestamps; assert the equal timestamp is excluded and a later one is included. Add one stored `Z` timestamp and one offset filter that is chronologically earlier but lexicographically later.

Invariant: none in `creation.qnt` or `QDL.Integration`. This is A2A `ListTasks` interoperability.

### 5. Medium — MCP tool handlers never observe cancellation

Last observed: `mcp.ts` 38–43. The callback is `async (raw)` and does not read `extra.signal`. `Runtime.propose` does (`index.ts` 99–101). MCP tools do not call `propose`.

MCP SDK control flow, read but not executed: `notifications/cancelled` aborts the request controller (`protocol.js` 27–28 and 173–179). The tool handler runs in a later microtask (`protocol.js` 383–395). Stdio delivers every complete message in one chunk before yielding (`server/stdio.js` 40–52). A `tools/call` and its cancel in the same chunk can abort the signal before `quineling_run` or `quineling_reproduce` runs. The handler still calls `runtime.run`. After the handler returns, an aborted signal drops the JSON-RPC response (`protocol.js` 397–399). The execution record remains.

Scenario: initialize a stdio or in-memory server, `quineling_compile` a small sum, then write `tools/call quineling_run` and `notifications/cancelled` for that request id in one buffer. Expected: no new execution record. Actual, from this control flow: `run` increments the record store, and the client may receive no result.

Fix: take `extra` and, before `run`, `reproduce`, `compile`, `create`, and `recover`, return the structured `cancelled` error when `extra.signal.aborted` is already set. That matches `Runtime.propose`. Synchronous kernel work still cannot stop mid-evaluation; that limit is already documented for A2A and should be stated for MCP.

Independent test: the paired-message case above against `InMemoryTransport`, plus a handler invoked with a pre-aborted signal. Assert record-store size is unchanged and no success envelope is sent.

Invariant: `creation.qnt` `cancelProposal` (55) and `cancelled_response_rejectedTest` (144–145): a response after cancel must not apply. The MCP `run` path needs that same rule. `reauthor_no_execution` does not mention cancellation.

### 6. Low — advertised recover schema accepts inputs the handler rejects

Last observed: `mcp.ts` 86–89. `source`, `harmonics`, and `colors` are all optional on one strict object. The exactly-one rule runs only after parse.

Scenario: `tools/list` schema validation accepts `{source, harmonics}` together. `tools/call` returns `isError: true` and `invalid-input`. Behavior fails closed. Generated clients still treat the call as schema-valid.

Fix: register a `z.union` of three strict single-field objects, or a JSON Schema `oneOf` with the other two fields forbidden. Keep the handler check.

Independent test: assert the generated `inputSchema` rejects zero-field and two-field arguments before the handler, and still accepts each encoding alone. `test/mcp.test.ts` 103–104 only checks the handler.

Invariant: `recovery_is_passiveTest` (131–132) applies after a single valid recovery is chosen. The schema gap does not by itself execute a task.

### 7. Low — strict re-parse failures are labeled `execution-failed`

Last observed: `mcp.ts` 47–54. `QuinelingError` keeps `code` and `path`. A `ZodError` from the handler’s own `inputSchema.parse` does not. The MCP SDK usually rejects the same schema first (`mcp.js` 206–223) and returns its own text. The handler path matters when a client skips advertised checks, which the comment at line 41 says it is there to catch.

Scenario: a compile payload that passes a lossy client-side reading but fails Zod in the handler. The tool result is `isError: true` with `code:'execution-failed'` and `path:'$'`, not a validation code.

Fix: map `ZodError` to `invalid-input` and put the first issue path in `path`. Keep `execution-failed` for kernel failures.

Independent test: call the registered handler with an extra field after bypassing SDK validation, and assert `invalid-input` rather than `execution-failed`.

Invariant: none. This is an error-envelope contract, separate from `passive` and `freshRecord`.

## Not defects

- Tool annotations last read at `mcp.ts` 37 match the guide: parse, inspect, and frame are read-only and idempotent; compile, create, and recover write and are idempotent; run and reproduce are not idempotent; `destructiveHint` and `openWorldHint` are false.
- MCP phase ±1,000,000 versus runtime ±1e9 is the documented MCP cap (`docs/sdk-mcp-guide.md`). A2A frame uses `runtime.frame` (±1e9, `index.ts` 160).
- `keepBusAliveStates: []` (`a2a.ts` 148) matches the guide: clarification releases the bus, and cancel or follow-up is rebuilt from the task store. `resubscribe` still returns the stored task when the bus is gone.
- Once `state.running` is set, `cancelTask` throws `TaskNotCancelableError` (`a2a.ts` 125–127). The yield before dispatch is the pre-dispatch cancel window. That behavior is documented and is not an interruptible-kernel bug.
- Unauthenticated `UserBuilder.noAuthentication` is the documented local mount. Principal-scoped runtimes are missing for remote use, not a local-contract bug.
- Handler byte checks of 4 MiB and 8 MiB are documented as post-parse limits, not a transport preparse limit.
- Empty `nextPageToken` is omitted by the SDK’s `toJSON` when it is `""`.
- `IntentSchema` does not encode “inputs plus steps ≤ 64” or JSON depth ≤ 24 (`thought.js` 16 and 92). Compile rejects those. That is fail-closed layering, not an admitted bad artifact.

## Verification

No test command was run in this audit. Do not read the test file assertions, root’s 24 / 47 / 176 counts, or the Quint `run` declarations as execution evidence from this session. The independent tests listed under findings 1–5 are still required. Findings 1–4 are source and SDK control-flow conclusions. Finding 5’s race is traced through the MCP SDK and was not reproduced on a live transport.
