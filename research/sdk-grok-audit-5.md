# Specialist 5 audit — onboarding, examples, honest capabilities, independent tests

Scope observed in this session: `docs/sdk-quickstart.md`, `docs/sdk-lifecycle.md`, `docs/sdk-mcp-guide.md`, `docs/sdk-a2a-guide.md`, root `package.json`, `packages/agent-sdk/package.json`, `packages/agent-sdk/build.mjs`, and directory listings of `packages/agent-sdk/src`, `test`, `dist`, and `examples`. `thought.js`, `anatomy.js`, `core.js`, SDK test bodies, Quint models, and Lean sources were not opened. No test, build, or example was run here. Root’s report of 24 SDK cases, 47 browser cases, 176 Lean theorems, and a lifecycle Quint run is recorded as an external claim, not a result of this audit. Remediations listed below were not re-read in code.

Formal names actually cited by the files read: `spec/creation.qnt` invariant `safety` (root `package.json` `formal:creation`), `spec/design.qnt` invariant `safety` (root `package.json` `formal`). `docs/LEAN-FORMALIZATION.md` states that the constructor model proves source reconstruction separately from the JavaScript interpreter, and that the per-byte RGB proof does not establish canonical JSON, full-strand framing, or harmonic codec inversion. Finer theorem names were not inspected. Browser and Lean runs do not exercise SDK onboarding.

---

## Findings

### 1. High — packaged `./schema` entry is absent from the inspected `dist`

- **Basis:** observed listing versus `packages/agent-sdk/package.json` lines 22–24.
- **Where:** export map `packages/agent-sdk/package.json:22-24` (`types`: `./dist/schema.d.ts`, `import`: `./dist/schema.js`). `src/schema.ts` was present. `dist/` contained `index`, `mcp`, `mcp-cli`, `a2a`, `a2a-cli`, and `types.d.ts` only. No `schema.js`, `schema.d.ts`, or `schema.js.map`.
- **Scenario:** After the quickstart’s “import the built checkout” path, `import '@quinelings/agent-sdk/schema'` fails to resolve. A consumer that trusts the export map gets a missing-module failure before any lifecycle call.
- **Fix:** Make `npm run build` the only producer of `dist`, emit every `exports` key, and fail the build if any target file is missing. Do not leave a partial `dist` in the tree that docs tell users to import.
- **Independent test:** From `packages/agent-sdk`, run `npm run build`, then assert each `exports` path exists and that `import('@quinelings/agent-sdk/schema')` resolves. Diff `dist` against the export map so a stale file fails the check.
- **Formal obligation:** none. `creation.qnt` `safety` and Lean reconstruction do not check package entry points. This is a packaging test.

Remediation “clean dist + ESM shared chunks” would address this only if the clean build actually writes `dist/schema.js` and `dist/schema.d.ts`. That output was not re-checked.

### 2. High — onboarding examples are prose, and the package ships no guide

- **Basis:** observed.
- **Where:** `packages/agent-sdk/examples/` listed with no files. `packages/agent-sdk/package.json:31-34` publishes `dist`, `README.md`, and `examples`. The package directory listing contained no `README.md`. The only runnable instructions are `docs/sdk-*.md`, which are outside `"files"`.
- **Scenario:** `npm pack` / `npm install` of the SDK directory produces a package whose documented surface is four monorepo guides the tarball does not include, plus an empty `examples/` and a missing README. A new consumer has exports and no in-package scenario that creates, runs, and checks total 29.
- **Fix:** Add `packages/agent-sdk/README.md` that points at one command. Check in the quickstart snippets as `examples/*.mjs` (and `typed-plan.ts`) and run those files in `npm test`. Keep docs as explanation; keep the files as the oracle.
- **Independent test:** `npm pack --dry-run` must list `README.md` and each example. A fresh process must run `node examples/create-run-reproduce.mjs` and exit non-zero if `tasks[0].output` is not `[{ total: 29 }]`, if child source differs, or if `parentRecordId` is wrong.
- **Formal obligation:** creation lifecycle, `spec/creation.qnt` `safety`, for “create stores source and does not run; run records a cycle; reproduce keeps source and links the parent.” Lean source-reconstruction does not discharge the numeric oracle `4+9+16 = 29` or the output shape `[{ total: 29 }]`.

### 3. Medium — root `npm test` never runs the SDK

- **Basis:** observed.
- **Where:** root `package.json:6-8`. SDK tests are only `packages/agent-sdk/package.json:39` (`tsx --test test/*.test.ts`).
- **Scenario:** A green root `npm test` can coexist with a broken quickstart, a broken `./schema` export, or a drifted total-29 example. Root’s separate 24 SDK cases, if they remain outside this script, are invisible to the default gate.
- **Fix:** Add a root script that runs `npm test` and `npm run build` in `packages/agent-sdk`, or invoke the example files directly. Publish the case list next to the command.
- **Independent test:** Rename a quickstart assertion locally and confirm root `npm test` fails. Restore it. This audit did not do that.
- **Formal obligation:** not a Quint/Lean stand-in. Lifecycle Quint `safety` passing does not import the SDK.

### 4. Medium — phase unit is not one contract across the guides

- **Basis:** observed doc contradiction. Runtime units were not read.
- **Where:** `docs/sdk-quickstart.md:150` says `frame` phase is in radians. `docs/sdk-mcp-guide.md:33` says MCP `phase` is a finite raw value within ±1,000,000, not wall-clock time. The same guide’s sample is `"phase": 0.5` (`docs/sdk-mcp-guide.md:109`). `docs/sdk-a2a-guide.md:51` says only “finite `phase`”. `docs/sdk-lifecycle.md:39` lists phase as view state and gives no unit.
- **Scenario:** One caller treats `0.5` as half a turn. Another treats it as 0.5 radians. Both requests are inside ±1e6, so both succeed, and the geometries differ. Frame equality across MCP and the quickstart cannot be reviewed from the docs.
- **Fix:** State one definition in `sdk-lifecycle.md` and use it in the other three guides: raw parameter, radians, or turns, and whether `phase` and `phase + 2π` match. Put that assertion in an example.
- **Independent test:** Same artifact, `frame(id, 0.5, {budget:4000, crests:3})` versus `frame(id, 0.5 + 2*Math.PI, …)` and versus `phase: 0`. Record which pairs are byte-identical. Update the sentence that disagrees.
- **Formal obligation:** `Rhythm.lean` (positive derivative, strictly increasing warped phase, blend in [-1, 1]) does not define the SDK `frame` argument. `spec/design.qnt` `safety` is the collection/chroma model named in `docs/GENERATIVE-FORMAL-MODEL.md`, not this API. Needs a runtime geometry test.

### 5. Medium — companion lifecycle text does not describe the claimed metadata rules

- **Basis:** doc text observed. New behavior is root’s remediation claim and was not re-read.
- **Where:** `docs/sdk-lifecycle.md:23-24` and the table at lines 35–36: same source reuses the artifact id and stored companion; changing companion prose keeps source “if executable fields stay unchanged” and “prose needs separate review.” `docs/sdk-lifecycle.md:102-105` recovers and runs, and does not attach metadata. Operation list at line 5 has no attach operation. `docs/sdk-quickstart.md:76` says source recovery does not recover companion metadata.
- **Scenario:** Compile the water-total intent, then compile the same graph with thought `"Add numbers."` or unit `mL`. The lifecycle page says the artifact id stays and the prose needs review. The remediation says this is an explicit `metadata-conflict`. A caller written from the page will treat a throw as a regression, or a silent keep as success. Second scenario: `recover({ source })` in a new runtime, then compile the original intent. The remediation says the first companion may attach. The page never says that fill-in succeeds, so two conforming readers will disagree about whether recovery plus compile preserves the recovered id.
- **Fix:** Document three outcomes: first companion stored, same companion accepted, conflicting companion raises `metadata-conflict` and does not replace the stored companion or source. Show the post-recovery attach snippet beside the recover example.
- **Independent test:** Two compiles of equal canonical source and different `thought`/`unit`; assert the error’s `code` is `metadata-conflict`, `artifact.source` and the first companion are unchanged, and no execution record was added. In a fresh runtime, recover source, attach the original intent once, assert id and source unchanged and companion present; attach a different thought and assert `metadata-conflict`.
- **Formal obligation:** a creation-lifecycle transition on `spec/creation.qnt` (`safety` must keep source fixed and reject the second companion without dropping the artifact). Lean quine/reconstruction theorems cover source, not English, units, or assumptions (`docs/sdk-lifecycle.md:120` and the Lean reconstruction limit already state that split).

### 6. Medium — MCP failures are documented as text, while the remediation adds structured `code`/`path`

- **Basis:** doc observed. Structured error shape not re-read.
- **Where:** `docs/sdk-mcp-guide.md:79` maps success to `structuredContent.result`. Lines 90–91 say domain failures use `isError: true` and that clients should read text. The tool table (lines 22–31) does not show the error object.
- **Scenario:** An invalid intent or unknown `artifactId` returns `isError: true`. A client that follows the guide parses the sentence and retries. It never branches on `code`/`path`. If those fields exist only on structured content, the published client contract drops them.
- **Fix:** Publish one error envelope for `isError: true` with `code`, `path`, and `message`, and mirror it in the text block. Add one failing `tools/call` fixture per code the runtime already throws (`invalid-intent`, `unknown-artifact`, `unknown-record`, `stale-record`, `resource-limit`).
- **Independent test:** In-process MCP client and a built stdio client. For each fixture, assert `isError`, structured `code`/`path`, and that the artifact count is unchanged.
- **Formal obligation:** `docs/sdk-lifecycle.md:116` (“a failed proposal or import must not replace an existing valid artifact”) as a `creation.qnt` `safety` transition. Recursive JSON Schema shape is an MCP contract test, not a Lean theorem.

### 7. Medium — A2A clarification continuation has no paused-task deadline

- **Basis:** doc observed. Expiry implementation not re-read.
- **Where:** `docs/sdk-a2a-guide.md:131` says a clarification can continue with a new message id and the same task/context, and that the executor does not merge partial data. Lines 127–128 say validation failures become `TASK_STATE_FAILED` with a status message. Lines 131–133 describe terminal-task eviction and retention of active/interrupted tasks. The page does not mention paused expiry, a scoped pagination cursor, or failed-task `code`/`path`.
- **Scenario:** `parse`/`create` returns `TASK_STATE_INPUT_REQUIRED`. The caller waits past the new expiry, then sends a full replacement thought on that task id, as the guide instructs. The task is gone or expired, and the guide has no deadline or replacement error. A failed task whose status text is kept but whose `code`/`path` are omitted cannot be retried precisely.
- **Fix:** Document TTL, which states are protected, cursor scope (task list pagination under `UserBuilder.noAuthentication`), and the failed-task fields that survive retention. Align line 131 with eviction so a continuation after expiry is a specified error.
- **Independent test:** Ephemeral `127.0.0.1` app. Drive a clarify task, advance time past the TTL, assert the continuation’s state and that an active task is not evicted when the store is full. Fail a task with `unknown-artifact`, then read it back and assert `code` and `path` are still present. Assert a pagination cursor from one scope does not walk another scope’s tasks.
- **Formal obligation:** outside `design.qnt` and Lean geometry. If `creation.qnt` has no task-store clock, add a lifecycle property or keep this as an adapter test only. Do not treat Quint `safety` as coverage of A2A cursors.

### 8. Medium — the native A2A client sample can succeed without reading a result

- **Basis:** observed snippet. It was not executed.
- **Where:** `docs/sdk-a2a-guide.md:92-110`. The sample logs only when `'artifacts' in response` and `part.content?.$case === 'data'`. There is no assert and no non-zero exit.
- **Scenario:** `createFromUrl` succeeds, the wire part is ordinary JSON, and the `$case` branch never runs. The process exits 0 and prints nothing. That looks like a working create of `[2,3,4] | square | sum | report total`.
- **Fix:** If no data part is found, throw. Assert `result.operation === 'create'`, `result.result.status === 'supported'`, and the stored artifact id is a 64-digit hex SHA-256. Keep the warning at lines 113–113 about not posting protobuf unions raw.
- **Independent test:** Start `node dist/a2a-cli.js` on an ephemeral port, run the corrected sample, and also send the raw HTTP body at lines 66–82. Compare both payloads to `Runtime.dispatch` of the same create. This is the checklist at lines 139–146, which the guide already says is not a test report.
- **Formal obligation:** creation `safety` for the create transition. Protocol field names (`SendMessage`, `ROLE_USER`, no `kind: "data"`) need a raw HTTP fixture. Lean does not speak A2A.

### 9. Low — `build.mjs` can succeed after dropping an entry

- **Basis:** observed. Whether this line survived the later build change was not re-read.
- **Where:** `packages/agent-sdk/build.mjs:2-3`. Entry names are filtered with `existsSync` before `esbuild`. The inspected options are `bundle: true` with no `splitting` and no clean of `outdir`.
- **Scenario:** A partial worktree or a renamed `schema.ts` still prints a successful build. `package.json` continues to export the missing file. Separate bundled entries can also duplicate runtime state across `dist/index.js` and `dist/mcp.js` if any check uses class identity.
- **Fix:** Fail if the entry count is not six. Delete `dist` before emit. With shared ESM chunks, re-resolve every export after the build.
- **Independent test:** Build, then `node --input-type=module` import of `.`, `./mcp`, `./a2a`, and `./schema`. Construct a runtime, pass it into `createQuinelingMcpServer`, and run one tool.
- **Formal obligation:** none.

### 10. Low — `type-contract.ts` is outside the test glob

- **Basis:** observed filenames and script. File body not read.
- **Where:** `packages/agent-sdk/test/type-contract.ts` versus `package.json` script `tsx --test test/*.test.ts` (line 39). `typecheck` does compile `tsconfig.tests.json` (line 38).
- **Scenario:** A type-level contract that diverges from runtime `dispatch` still leaves `npm test` green. `npm run typecheck` may catch it only when someone runs that script.
- **Fix:** Import the contract from a `*.test.ts` file, or include a runtime assertion of the same unions.
- **Independent test:** Run `npm run typecheck` and `npm test`. This audit ran neither.
- **Formal obligation:** the strict `IntentStep` and discriminated `Parse`/`Creation` unions should be the types those tests narrow. That is a TypeScript check, not Lean.

---

## Documented oracles that still need an executable check

These sentences are consistent across the guides. They were not executed here, so they are open verification items, not confirmed runtime failures.

| Oracle | Location | What must be asserted | Formal map |
| --- | --- | --- | --- |
| `[2,3,4] \| square \| sum \| report total` → `[{ total: 29 }]`, one emitted source equal to `artifact.source` | `sdk-quickstart.md:35-36`, `sdk-mcp-guide.md:61`, `sdk-a2a-guide.md:142` | Output, emit length 1, byte-identical source, no record until `run` | creation `safety` plus a runtime numeric check. Lean quine does not know the literal 29 |
| Typed sum `[2,3,4]` → `[9]` and `contract.types.total = {kind:'number', unit:'L'}` | `sdk-quickstart.md:72-73` | Those two equals, and lifecycle’s `[[12]]` for `[2,4,6]` (`sdk-lifecycle.md:68`) | creation `safety`. Unit metadata is companion state, not the Lean quine |
| `make my city happy` → `clarify`; email monitor → `unsupported`; `[] \| mean` → `inconsistent`; no artifact | `sdk-quickstart.md:85-91`, `sdk-mcp-guide.md:92` | Status, diagnostic `code`/`path`/`message`, store size unchanged | creation `safety` “failed proposal does not replace an artifact” (`sdk-lifecycle.md:116`) |
| Route blocked `['B']` simulated `['A','C','D']`; blocked `['B','C']` skipped `[]` | `sdk-quickstart.md:107-117` | Those objects, and `effects` only for the simulated receipt | creation `safety` if actions are modeled; otherwise runtime only. Not a Lean geometry theorem |
| Recover source, harmonics, and colors; same `source` and same `id`; no new execution record | `sdk-quickstart.md:134-142` | All three paths, including a color genome whose walk is at least 400000 visits and whose source is at the 65536-byte ceiling | Lean RGB per-byte proof is explicitly not codec inversion (`docs/LEAN-FORMALIZATION.md` reconstruction/RGB paragraph). Needs a runtime round trip |
| Changed literals → new id; old record’s source differs; new sum `[3,5,7]` → `[[15]]` | `sdk-lifecycle.md:92-96` | Id inequality and both outputs | creation `safety` |
| `reproduce` child source equal, `parentRecordId` equal, fresh record id | `sdk-quickstart.md:38-40`, `sdk-lifecycle.md:107-109` | All three, plus mismatch of record and artifact → `stale-record` and no new child | creation `safety` |
| 64 KiB source ceiling, including duplicated payload; stores 128/256 reject with `resource-limit` and do not evict | `sdk-lifecycle.md:21-22` and `:39`, `sdk-mcp-guide.md:121` | 65536 accepted, 65537 rejected, full store unchanged | creation `safety` if capacity is in the model; else runtime only |

`docs/sdk-mcp-guide.md:135` and `docs/sdk-a2a-guide.md:139` already say the checklists are required coverage and not test reports. That wording is accurate. The gap is that the oracles are not files this audit could point at in `examples/`.

---

## Assessment of remediations (code not re-read)

| Claimed change | Assessment from the text already read |
| --- | --- |
| Strict per-op `IntentStep`, discriminated `Parse`/`Creation` | Matches the honesty rule in `sdk-lifecycle.md:9-13`. The published snippets still use a generic step `{op:'sum', params:{}}` (`sdk-lifecycle.md:59-61`, `sdk-quickstart.md:65`). They need a `tsc` run of those exact snippets. Not confirmed broken. |
| Generic `dispatch` and tagged exchange | `sdk-quickstart.md:159` and A2A `{operation, result}` (`sdk-a2a-guide.md:117`) already use an `operation` tag. No contradiction found in the prose. Wire shape was not compared to code. |
| `#private` stores | Agrees with `sdk-lifecycle.md:21` (exported snapshots must not mutate stores). Not re-read. |
| Full `sourceBytes` | This is what `sdk-lifecycle.md:39` already claims. Still needs the 65536/65537 test above. |
| Provider `sourceMap` and diagnostic validation | Agrees with `sdk-lifecycle.md:11`. Not re-read. |
| Abort of an ignored provider promise | No user-facing sentence describes provider promises. No doc contradiction. Effect on clarify/cancel (`sdk-a2a-guide.md:131`) was not inspected. |
| First companion kept, `metadata-conflict`, attach after recovery | Behavior is ahead of the guides. Finding 5 stands until the lifecycle page and an example assert it. |
| Valid large RGB recovery at visit 400000 | Small examples cannot show this. Lean’s per-byte RGB proof does not discharge it. Keep a runtime test at the documented source ceiling. |
| ESM shared chunks and clean `dist` | The inspected `build.mjs` did not split or clean, and inspected `dist` had no `schema` output. Finding 1 stays open until a build is listed again. |
| Recursive MCP input schemas and structured error `code`/`path` | Schemas: the guide already defers to `tools/list` (`sdk-mcp-guide.md:33`). Errors: Finding 6 stands; the guide still says to read text. |
| A2A paused expiry, protected active tasks, stable scoped cursor, retained failed `code`/`path` | Partially ahead of `sdk-a2a-guide.md:127-133`. Finding 7 stands. Protection of active tasks agrees with the sentence that active/interrupted tasks are retained. Expiry can invalidate the continuation sentence at line 131. |

---

## What the guides already state plainly

Experimental package `0.0.0-experimental`, local loopback only, simulated `action` receipts with no network or filesystem authority, genome checksum distinct from SHA-256 artifact id, recovery does not restore execution history, and same-SDK round trips are not an interoperability proof (`sdk-a2a-guide.md:139-146`). Those limits should stay attached to any example that prints a successful task.
