# Specialist 4 audit: untrusted JSON, budgets, admission, overflow, accessors, mutation, exhaustion, portability

Last read covered `packages/agent-sdk/src` (`index.ts`, `schema.ts`, `mcp.ts`, `a2a.ts`, `types.ts`, `build.mjs`), the SDK tests as text, `docs/sdk-*.md`, and `core.js`, `thought.js`, `anatomy.js`, `kernels.js`, `orbit.js`, `qdl.js`, plus `spec/creation.qnt`, `spec/design.qnt`, and `spec/lean/QDL/{Semantics,Quine,Assembly,Integration}.lean`. The tree was moving during that read. The remediation list below was **not** re-checked against the files afterward. Line numbers are from that snapshot. Nothing in this report was executed here: no SDK suite, no browser run, no Lean, no Quint, no heap probe.

Root’s reported counts (24 SDK cases, 47 browser cases, 176 Lean theorems, lifecycle Quint) are outside this audit.

## Remediation assessment (from the snapshot only)

| Claimed remediation | Snapshot status |
| --- | --- |
| Strict per-op `IntentStep` and discriminated `ParseResult` / `CreationResult` | Present. `schema.ts` `IntentStepSchema` is a `discriminatedUnion` on `op` with closed params. `types.ts` splits supported vs unsuccessful results. |
| Generic `dispatch` and tagged `exchange` | Present. `dispatch` calls `inert` then `fields` per operation. `exchange` tags the same result. |
| `#private` stores | Present. `#artifacts`, `#records`, `#bodies`, and the limits are private. Returns go through `structuredClone` (`inspect`, `run`, `reproduce`, `frame` ridges). |
| Full `sourceBytes` | Present. `#admit` sets `contract.sourceBytes` from `Buffer.byteLength` of the canonical source, including anatomy. |
| Provider `sourceMap` and diagnostic checks | Present on `propose`: status enum, array checks, assumption limits, diagnostic `code`/`path`/`message` length ≤ 2048, source-map length ≤ 128, spans checked against `intent.thought`. |
| Cancellation of an ignored provider result | The signal is forwarded and checked before and after `await provider.propose`. A resolution after abort is discarded. A non-cooperative promise cannot be forced to stop; that limit is still there. |
| First companion kept, `metadata-conflict`, first metadata may attach after recovery | Present in `#admit`: differing stored intents throw `metadata-conflict`; a stored artifact with no intent can gain the first intent, source map, and contract. |
| Large RGB recovery and visit cap 400000 | `decodeColors` checks the redundant channels, band count ≤ 2049, and delegates to `decode` (length, magic, checksum, canonical JSON). `inert` uses `visits <= 400000` and `depth <= 64`. |
| ESM shared split chunks and a clean `dist` | `build.mjs` had `splitting: true`, `platform: 'node'`, `packages: 'external'`. `dist/index.js` and `dist/mcp-cli.js` imported the same runtime chunk, which contained the 400000-visit `inert` and the enrichment path. `mcp-cli.js` kept the shebang. A2A failure reporting uses `name === 'QuinelingError'` plus `code` and `path`, so it does not depend on `instanceof` across bundles. |
| Recursive MCP schemas and structured `code`/`path` | `JsonSchema` / `IntentTypeSchema` are recursive and the MCP test source expects `$ref` to resolve. `QuinelingError.toJSON()` returns `code`, `message`, and `path`. Zod failures are still rewritten as `execution-failed` (see finding 2). |
| A2A paused expiry, eviction, protected active tasks, scoped cursor, failed-task `code`/`path` | Present: 15-minute interrupted TTL, terminal/paused eviction, HMAC cursor bound to tenant/user and filters, admission `sequence` kept across updates, failure status carries `quinelingError` when the thrown value has that name and fields. Active-task protection is still by bare task id (finding 5). |

`docs/sdk-lifecycle.md` line 25, at the time it was read, still said a recovered artifact stays without companion metadata. That sentence contradicts the enrichment behavior above. Whether the doc was edited later was not re-read.

## Findings

### 1. High — sample-plan cache grows with every distinct frame budget

Observed in `anatomy.js` lines 57 and 77–88, reached from `packages/agent-sdk/src/index.ts` lines 158–163 and `mcp.ts` lines 97–102 (`budget` integer 4000–24000). `planCache` is a process-wide `WeakMap` from compiled body to a `Map` keyed by budget. Each miss freezes and retains that budget’s samples. `Runtime.#bodies` holds the compiled body for the life of the artifact, so the weak key stays alive. There is no cap on how many budgets are retained. Task-store eviction does not clear it.

Derived from those ranges, not from a heap measurement: one body can retain every integer budget from 4000 through 24000 (20001 plans), and each plan holds on the order of `budget` sample records (up to 24000). Repeating one budget hits the existing entry. A long-lived MCP or A2A `Runtime` can be grown by read-only `frame` calls alone.

**Fix:** Keep one plan per compiled body, or an LRU of size 1–2. Drop the map entry when the body is dropped.

**Independent test:** One artifact. Frame budget 4000 thirty times and record `process.memoryUsage().heapUsed`. Then frame thirty distinct budgets. The second delta must stay on the order of one or two plans. Re-frame an evicted budget and check `points.length === budget * 4`, `owners.length === budget`, and finite normals.

**Invariant:** `QDL/Assembly.lean` `reserve_fits`, `allocation_exact`, `crest_budget`, and `aggregate_budget` bound a single frame (`budget + crestVertices ≤ 25204` for `budget ≤ 24000` and `crests ≤ 4`). They do not bound a memoization map. `LEAN-FORMALIZATION.md` already says memoization caches are outside the proofs. `QDL/Semantics.lean` `render_no_execution` only says rendering must not change runtime execution state. Quint `creation.qnt` `budgets` is the exploration energy/child cap, which the spec comment separates from SDK store limits. This needs a new cardinality invariant: retained plans per compiled body are bounded by a constant, and every retained plan’s length equals its budget.

### 2. Medium — MCP accepts nested JSON past the documented depth budget

Observed in `schema.ts` lines 12–16 and `mcp.ts` lines 38–42. The schema text says “at most 512 array/record entries and 24 nesting levels.” Arrays have `.max(512)`. Records have no key cap. Nothing in the Zod type stops recursion. `quineling_*` tools `JSON.stringify` the raw arguments (4 MiB cap) and then `inputSchema.parse` before `Runtime` `inert` (depth 64) or `thought.js` `finiteJSON` (depth 24, line 16). A deep `IntentType` or JSON value is walked by recursive Zod first. The tool `catch` maps a non-`QuinelingError` to `execution-failed` with a sliced message, so a stack overflow becomes the wrong code. Whether that overflow kills the process or is caught was not executed.

Direct `Runtime.compile` / `dispatch` call `inert` before `T.compile`, so this gap is the MCP boundary.

**Fix:** Walk arguments iteratively with an explicit depth limit of 24 (and a record-key cap) before Zod parse. Reject with `QuinelingError('invalid-input', ..., path)`. Keep the 4 MiB check. Make the schema description match the enforced limit.

**Independent test:** A type or value nested 24 levels is accepted when the rest of the intent is valid. Depth 25 returns `isError` with `code === 'invalid-input'` and a path. A depth of several thousand, still under 4 MiB, returns that same code, and the process is still able to serve a later `quineling_parse`.

**Invariant:** No Lean theorem covers the raw JSON parser. `LEAN-FORMALIZATION.md` states that. The obligation is the depth rule already implemented in `thought.js` `finiteJSON` and the 64 KiB / 128 KiB byte checks. Quint `creation.qnt` `sourceAdmission` only bounds source bytes (`1..65536`), not nesting. Add an explicit JSON-depth invariant for transport payloads.

### 3. Low — admission keeps the pre-canonical AST, so `-0` can survive in `program`

Observed mechanism, scenario not executed. `orbit.js` line 5: `canon` uses `JSON.stringify` for numbers, and `JSON.stringify(-0)` is `"0"`. `index.ts` `#admit` (lines 113–130) stores `program: copy(program)` via `structuredClone`, which preserves `-0`. The quine check compares `Q.canon(reconstructed)` to `Q.canon(program)` after `describe`, whose clone is `JSON.parse(JSON.stringify(...))` and therefore turns `-0` into `+0`. `#execute` (lines 135–137) runs `artifact.program`, not `JSON.parse(artifact.source)`. `kernels.js` literals then clone through JSON, so numeric outputs likely collapse to `+0` anyway. `inspect().program` can still disagree with `JSON.parse(inspect().source)`.

**Scenario to run:** Take a supported program’s canonical source, replace one literal `0` with the two characters `-0`, and `recover` it. Expect admission to succeed, `artifact.source` to contain no `-0`, `Object.is` on the corresponding `artifact.program` number to be `-0`, and a fresh `recover({source: artifact.source})` to show `+0`.

**Fix:** Persist and execute the reconstructed program, or `JSON.parse(source)`, after the canon check. Keep `source` as the canonical string.

**Independent test:** The scenario above, plus `run` on both artifacts and `assert.deepEqual` on task outputs. Also `Object.is` over every number in `artifact.program` against `JSON.parse(artifact.source)`.

**Invariant:** `QDL/Quine.lean` `program_emits_itself` and `program_injective`; `QDL/Semantics.lean` `admission_copies_full_source` and `Safe` (`source = origin`). `design.qnt` `sourceIdentity` and `codecAssumption`. Those models have no IEEE `-0`. `LEAN-FORMALIZATION.md` says canonical JSON serialization is not a verified refinement. The JS obligation is: the executed AST’s canon equals `artifact.source`, and `structuredClone` does not reintroduce a value `canon` erases.

### 4. Medium — A2A `save` drops the previous task if `structuredClone` throws

Observed in `a2a.ts` `save` (lines 38–47). Byte size comes from `JSON.stringify(task)`. The map entry is deleted, then `structuredClone(task)` runs, then `this.bytes += additional`. `JSON.stringify` omits function-valued fields; `structuredClone` throws on them. On that throw the old entry is already gone and `this.bytes` still includes it. Later saves can fail capacity checks for bytes that no longer exist. Not executed.

Normal `Task.fromJSON` values may clone successfully. The branch is still reachable for any value `save` accepts that stringifies and does not clone, including an update of a task that was already stored.

**Fix:** `structuredClone` first. On success, replace the map entry and adjust `this.bytes` by `newBytes - oldBytes`. On failure, leave the previous entry and counter unchanged.

**Independent test:** Save a completed task `kept`. Save again under the same id with an own function property. Expect a throw, `load('kept')` still returning the first task, and a following small save still fitting under `maxBytes`.

**Invariant:** None. Quint `budgets` and `Semantics.lean` `exhausted_resource_blocks_admission` are artifact/energy limits, not the A2A byte counter. Add a store invariant: `bytes` equals the sum of retained task sizes, and a failed `save` does not remove the previous record.

### 5. Low — active-task protection ignores tenant scope

Observed in `a2a.ts` lines 34–35, 44, and 96–97. Map keys are `JSON.stringify([tenant, userName]) + ':' + id`. Expiry and eviction call `activeTask(item.task.id)`. The executor’s predicate is `pending.has(taskId)` with no tenant. `ServerCallContext` accepts a `tenant`. One active id suppresses expiry and eviction for every tenant’s paused task with that id. The default app uses `UserBuilder.noAuthentication`, so this shows up when two tenants are actually set. Not executed.

**Fix:** Protect `scope(context) + taskId`, or pass the scoped key into `protectActiveTasks`.

**Independent test:** Two `ServerCallContext`s with tenants `a` and `b`, both storing interrupted task id `same`, TTL already elapsed, `protectActiveTasks` true only for `a`’s scoped id. `load('same')` on `a` remains; `load('same')` on `b` is gone. Pagination for `b` does not list it.

**Invariant:** No Quint or Lean model of A2A tenants. The code’s own scope prefix is the invariant to extend: protection, expiry, and cursors must all use that key. Cursor query hashing already includes the prefix (lines 49–70).

### 6. Low — `build.mjs` discovers entries from the process cwd

Observed at `build.mjs` line 3: `existsSync('src/' + name + '.ts')`. `npm run build` from the package directory works. `node packages/agent-sdk/build.mjs` from the repo root filters every entry out. Not executed.

**Fix:** Resolve `src/` from `import.meta.url`.

**Independent test:** From the repo root, run the build script and confirm `dist/index.js`, `dist/mcp.js`, `dist/a2a.js`, and `dist/schema.js` are produced and import shared chunks. This test writes `dist`; it was not run here.

**Invariant:** None. Packaging only.

## Observed as sound in the snapshot

- `inert` rejects cycles, non-finite numbers, non-plain prototypes, symbol and hidden keys, sparse arrays, accessors (descriptor `value` is read, the getter is not called), and `__proto__` / `constructor` / `prototype` before `canon` or kernel reads. `dispatch` calls it first. The accessor regression is written in `test/runtime.test.ts` and was not run here.
- Source admission requires a task-constructor quine: `canon(makeTaskProgram(describe(...))) === canon(program)`, then `K.validate` and `D.validateBindings`, with anatomy and gesture required. The 65536-byte ceiling matches `creation.qnt` `canBuild` / `sourceAdmission` and `boundary_overflow_is_rejectedTest` (`65537` rejected).
- Kernel execution is bounded in the files read: interpreter fuel 20000, repeats 1–8, ≤ 64 nodes, ≤ 64 kernel steps, BFS `seen.size < 512`, strings ≤ 16384, collections ≤ 512, value canon ≤ 64 KiB. Non-finite sums fail `boundedJSON` inside `run` rather than being stored. Repeat cap aligns with `Quine.lean` (`n + 1 ≤ 8`) and `reachable_repeat_cap`.
- `frame` does not call `execute`. Unknown frame fields, including `reuse`, are rejected, so the SDK does not opt into `bufferCache`. Crest count 2–4 matches `crestVertices = crests * 301`.
- `D.create()` clones `DEFAULT` before the SDK assigns anatomy and gesture.
- Recovered genomes re-check magic, length, padding, checksum, and `canon(program) === text` before `#admit`.
- Quint’s three-child / eight-energy cap is documented in `creation.qnt` as an exploration bound, with SDK store limits (128/1024 artifacts, 256/4096 records) separate. Absence of that cap in the SDK is not a defect against that comment.

## Not confirmed (do not treat as bugs yet)

- Floating-point sample apportionment in `anatomy.js` lines 81–86 (`Math.floor(cumulative * remaining)`) has no final `items.length === budget` check. No budget was found here that undershoots. Test every shipped example at every budget from 4000 through 24000.
- Zero-length normals (`nx / length` at `anatomy.js` line 91) were not produced for a real body.
- `Object.fromEntries` inside `stripOptional` (`index.ts` lines 46–52) runs before the unsafe-key check. Every caller then `inert`s the copy. Global prototype pollution was not executed. Test an own `__proto__` key on config, options, and intent: expect `invalid-input`, and `Object.prototype` unchanged.
- `requestFromMessage` (`a2a.ts` lines 79–90) reads `value.operation` before `dispatch`’s `inert`. JSON bodies do not create accessors. A getter would run only if the A2A stack handed one in. `dispatch` still fail-closes afterward.
- `execute` registers `pending` and publishes `SUBMITTED` outside the `try` (`a2a.ts` lines 100–108). A throw from that publish would leave the slot counted toward 128. No failing bus was exercised.
- Scalar lens underflow/overflow from `docs/sdk-lifecycle.md` and `ChromaSemantics.lean` `classify` / `overflow_status` are not implemented on SDK `run` results. Non-finite kernel values become `execution-failed`. That presentation layer is still missing, and the formalization doc already leaves trace lookup outside the proofs.
