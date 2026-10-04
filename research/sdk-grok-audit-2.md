# Specialist 2 audit — passive compile/recover/frame, explicit execution, quine reproduction, stale records, source provenance

Inspection snapshot only. Line numbers are from that read. Root’s later edits were not re-opened, so remediation status is “present when read” or “not re-checked,” not a fresh confirmation. This session ran one read-only probe against `packages/agent-sdk/src` via `tsx`. It did not run the package suite, browser suite, Lean, or Quint. Root’s counts (24 SDK, 47 browser, 176 Lean theorems, lifecycle Quint) are root’s claim.

## Remediation assessment

| Claimed remediation | What this session actually saw | Assessment |
| --- | --- | --- |
| Strict per-op `IntentStep`; discriminated `ParseResult` / `CreationResult` | `types.ts` and `schema.ts` already used per-op unions and `status` discriminants | Present in the snapshot |
| `dispatch` / `exchange` | `Runtime.dispatch` switches on `operation`; `exchange` tags the result | Present |
| `#private` stores | `#artifacts`, `#records`, `#bodies` | Present. Probe mutated a returned artifact and a returned `emitted` array; a later `run` still produced the original total. That matches the copy-on-return behavior in the snapshot |
| Full `sourceBytes` | `#admit` sets `contract.sourceBytes` from `Buffer.byteLength(canonical source)` | Probe: route program `7169` and a 320×80 string payload `57443`, both equal to the admitted source. Bare preflight for that payload was `55607` (anatomy not included) and was not what the contract stored |
| Provider `sourceMap` and diagnostic checks; drop a late abort | `propose` checks status, diagnostics, assumptions, source-map node ids, then `signal.aborted` after the promise | Present in source. Not exercised by the probe |
| First companion kept; `metadata-conflict`; first attach after recovery allowed | `#admit` conflicts only when both sides already have intent; otherwise it writes the first intent, source map, and contract | Probe confirmed both the attach and the lockout. This matches the stated policy and `large-genome.test.ts`. It still contradicts `docs/sdk-lifecycle.md` line 25 as read (“recovered … remains without it”) |
| Large RGB recovery and 400000-visit cap | `inert` rejects past 400000 visits; color recovery calls `decodeColors` | Not executed here |
| ESM split chunks, clean `dist` | `build.mjs` uses `splitting: true`. `dist/*.js` mtimes were later than the sources just stat’d. CLI files had `#!/usr/bin/env node` | Dist was not executed. The probe loaded `src` through `tsx` |
| Recursive MCP schemas; structured `code` / `path` | Compile schema test walks `$ref`. `QuinelingError.toJSON()` is `{code,message,path}` and the MCP handler returns that for `QuinelingError` | Zod failures in that same handler were still mapped to `execution-failed`. Not re-read |
| A2A paused TTL, terminal eviction, `protectActiveTasks`, scoped pagination | `BoundedTaskStore` in `a2a.ts` matched that description | Not executed here |

## Remaining findings

### 1. High — complete-source overflow is reported as `invalid-intent`

Snapshot: `packages/agent-sdk/src/index.ts` `#build`, the `wrap('invalid-intent', …)` around `T.compile`. `thought.js` `compile` catches every `makeTaskProgram` / `encode` failure and rethrows `source-budget`. `wrap` only preserves `QuinelingError`. A normal `Error` becomes `invalid-intent`, message and `path` kept.

Probe, same process:

- 420 strings of 80 `x`: thought layer threw `source-budget` / `Complete quine source exceeds 64 KiB`. SDK threw `invalid-intent` with that same message.
- 8 strings of 16000 `x`: message `Task graph exceeds 64 KiB`, SDK code `invalid-intent`.
- 320×80 still admitted. Contract `sourceBytes` was the full source (`57443`), not the anatomy-free preflight (`55607`).

`#admit` itself throws `QuinelingError('source-budget')` and `wrap` rethrows that. Callers only see `source-budget` when the bare program fits and the anatomy-bearing program does not. The overflow they are more likely to hit is mislabeled.

Failing scenario: an agent retries a too-large literal as a schema bug because `code === 'invalid-intent'`, or treats `source-budget` as unreachable.

Fix: in `#build`, if `error.code` is `source-budget` (or the message is the 64 KiB constructor/graph limit), throw `QuinelingError('source-budget', message, path)`. Do not use `invalid-intent` for that path.

Independent test: compile `bigIntent(420, 80)` and `bigIntent(8, 16000)` from the probe shape. Expect `error.code === 'source-budget'`. A separate case whose bare program is under 65536 bytes and whose anatomy-bearing program is over it must still be `source-budget`. A bad step id must stay `invalid-intent`.

Invariant: Quint `creation.canBuild` / `boundary_overflow_is_rejectedTest` (`bytes <= 65536`). SDK `ErrorCode` already distinguishes `source-budget` from `invalid-intent`. Lean `Quine.program_emits_itself` does not model this error code.

### 2. Medium — first attach after recovery will lock an unverified reading

This is the behavior root now calls implemented. The probe showed it is real, and the lifecycle sentence read in this session does not match it.

Snapshot: `index.ts` `#admit`, the branch `metadata.intent && !existing.intent` writes intent, source map, and contract. The conflict check runs only when `existing.intent` is already set.

Probe:

- Recover `[2,3,4] | sum` with no companion. `compile` of the same graph with thought `Approved for production deployment` and assumption `Operator authorized an external effect` kept the same artifact id and stored that prose. A later `compile` of the original intent threw `metadata-conflict`.
- `create('[2, 3, 4] | sum')` after a bare recover of `[2,3,4] | sum` also kept the same id and stored the spaced thought.
- If the runtime already had the original intent, the spaced recipe correctly threw `metadata-conflict`.
- Recover of an explicit `seed: 14` body, then `create` without that seed, produced a new id and left the recovered artifact bare. The same `create` with `seed: 14` attached. Source identity, not the recipe text, decides this.

Failing scenario: process B recovers only canonical source. The first `compile` or `create` whose graph, repeats, and seed match becomes the companion. A second runtime that still has the author’s wording is then told to use another runtime. `contract.provenance` still says the thought is not in the quine, but `inspect` returns the new thought as the artifact’s intent.

Fix, if first-writer-wins stays: update `docs/sdk-lifecycle.md` line 25 so it describes attach-once, and state that the attached thought is an unverified claim. If recovered artifacts must stay provenance-free, delete the enrich branch and change `large-genome.test.ts` (“compilation can attach the first explicitly supplied companion…”).

Independent test: the two probe cases above, plus “intent already stored ⇒ `metadata-conflict` and the stored thought unchanged.” Assert the lifecycle sentence matches whichever policy is kept.

Invariant: Quint `creation` header — source tokens do not prove English interpretation. There is no Quint or Lean companion field. Do not cite `QDL.ChromaView.displayed_scalar_has_provenance` or `stale_source_is_unavailable` as covering this; those are scalar traces, not prose.

### 3. Low — reproduction validates the emission, then runs the stored program

Snapshot: `reproduce` does `JSON.parse(record.result.emitted[0])`, `#admit`s it, then `#execute`s `artifact.program`. On an existing id, `#admit` returns the stored object. `creation.js` `copy` runs the parsed program.

Probe, route plus `simulate`, `repeats: 2`:

- `emitted.length === 1` and `emitted[0] === artifact.source`.
- `canon(parsed) === canon(stored program) === source`.
- `JSON.stringify(stored program) !== JSON.stringify(parsed)` (key order).
- Outputs, effects, and traces of `Q.execute(parsed)`, `Q.execute(stored)`, and the child record were equal. Two task cycles. `parentRecordId` pointed at the parent.
- Changing `repeats` from 1 to 2 changed the artifact id. `reproduce(newId, oldRecord)` threw `stale-record`.

No output, effect, or trace mismatch was observed on this fixture. The lifecycle sentence that reproduction executes the emission was not what the control flow did.

Fix: execute the parsed emission (or the reconstructed constructor), not the previously stored object. Compare that run’s outputs with the parent.

Independent test: `JSON.stringify` may differ; `canon` must match; child outputs, effects, and trace must equal `Q.execute(JSON.parse(parent.emitted[0]))`.

Invariant: Lean `QDL.Quine.program_emits_itself` and `program_injective` (the evaluated term is the source). Quint `freshEmission` / `canCopy` (`emitted == source` and the candidate is that source).

## Checked, not filed as defects

- `run` and `reproduce` are the only writers of `#records` in the snapshot. The probe called `inspect`, `recover`, and `frame` before `run`; `run` still returned a record. That is consistent with passive compile/recover/frame, not a record-count assertion.
- Frame at budget 4000, crests 3: 16000 finite points, finite normals, owner indices inside `nodeIds`. Phase `0` and `2π` returned the same JSON.
- Every ridge in that frame had `primary: true` (`anatomy.js` frame loop). The third crest’s owner set was `[3]` because that crest sits on another component. Not treated as a failed frame.
- `steps` was 30 and `trace.length` was 32 on that run (`steps` adds kernel-trace length on top of term fuel). No spec in the snapshot says those numbers are equal.
- Parent `emitted.length === 1` is enforced when the record is created, not again in `reproduce` beyond `emitted[0] === source`. No public path in the snapshot could build a longer `emitted` array.
- MCP `phase` ±1e6 versus runtime ±1e9 is written as an adapter limit in `docs/sdk-mcp-guide.md`, not a runtime bug.
- MCP non-`QuinelingError` failures, including Zod, were coded `execution-failed` in the handler that was read. `mcp.test.ts` only requires `isError` for structural schema failures. Not re-checked after the claimed schema work, and not executed here.

## Invariant index

| Issue | Formal anchor |
| --- | --- |
| Overflow reported as `invalid-intent` | Quint `creation.canBuild`, `boundary_overflow_is_rejectedTest` |
| Unverified companion lock-in | Not in Quint/Lean. Quint file header: tokens are not English fidelity. Lifecycle companion rule as actually published |
| Reproduction runs the stored object | Lean `QDL.Quine.program_emits_itself`, `program_injective`. Quint `freshEmission`, `canCopy` |
| Stale repeats (working in the probe) | Quint `freshRecord`, `detects_stale_recordTest`. Lean `QDL.Integration.changed_design_rejected` is design identity, not the SDK record id |
| Passive frame / recover (code path) | Quint `passive`, `recovery_is_passiveTest`, `build_does_not_executeTest`. Lean `QDL.Operational.render_no_execution` |
