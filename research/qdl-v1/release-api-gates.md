# QDL v1 local API release gates

Reviewed 2026-10-04. Scope: `@quinelings/agent-sdk/v1`, its shared schemas, official MCP 1.32.0 stdio and official A2A 1.3.0 local HTTP adapters. This is a single-owner, in-memory, simulation-only release. Experimental legacy Runtime, social/world machinery and typed collaboration are outside this stable API assessment.

## Outcome

One concrete restoration blocker was reproduced and fixed in `packages/agent-sdk/src/v1.ts`, with two regressions in `test/v1.test.ts`. All 109 SDK tests and both TypeScript checks pass after the fix. Large valid results also pass through an actual official MCP stdio client, including source recovery, maximum-budget frames, escape-heavy completed and computed-failed runs, exact keyed replay and fresh reproduction.

No remaining functional blocker was demonstrated for this local scope. The MCP 8 MiB limit needs precise wording: the current handler checks the serialized `{result}` object, **not the complete duplicated/escaped MCP response or JSON-RPC wire envelope**. Tested large valid responses fit the official client's default 10 MiB stdio buffer. This evidence does not prove an exhaustive maximum-wire bound for every accepted assembly.

## Fixed restoration blocker

Before the fix, one valid default Session with 256 completed records exported a 26,040,091-byte snapshot. Each record was 98,892 bytes, well inside the 2 MiB per-record and 64 MiB aggregate limits. Its program had two inputs (`yes: Boolean` literal and runtime `data: Array<Null>`) and ten chained `choose(yes, previous, data)` steps. Each invocation supplied 512 nulls. `Session.fromSnapshot` rejected this SDK-produced snapshot with `resource-limit: JSON resource limit exceeded`: the ordinary four-million-visit traversal ceiling was applied to the entire snapshot.

Export and import now share `parseSnapshot`:

- Inspect native/plain root properties and dense native row arrays via descriptors before schema parsing; reject accessors, hidden/symbol fields, sparse arrays and cycles.
- Validate the header separately and retain the existing depth-64/four-million-visit inert boundary for **each row**.
- Bound source rows and receipt rows at 131,328 serialized bytes; execution rows at 2 MiB. Collections remain capped at 1,024 artifacts, 4,096 records and 4,096 receipts.
- Enforce serialized collection aggregates of 32 MiB source rows, 64 MiB execution rows and 32 MiB receipt rows, plus the exact 128 MiB total snapshot bound. Actual source admission still applies the stronger complete-artifact 32 MiB budget and configured count limits.
- Validate all rows before restoration publishes a fresh Session. No tasks execute during either export or import. Historical records become `asserted`; source, profile, binding digest, parent order and complete receipt identity are checked subsequently.

The new full-default-ledger regression restores successfully, keeps all 256 records, replays the original ID and semantic result with `asserted` evidence, and verifies no extra interpreter calls. A separate regression checks root/array/row/nested getters without touching them, hidden array properties, sparse arrays, cycles and oversized rows. Rejected imports do not mutate the original Session.

## Actual MCP wire measurements

Probe: `/tmp/qdl-api-wire-probe.mts`, launched with `node --import tsx` from the SDK package. It imports the official Client and StdioClientTransport, launches `src/v1-mcp-cli.ts`, discovers all eight tools and validates results through `client.callTool`. A second stdout listener counts each complete raw JSON-RPC line including its newline; the client uses its unmodified default read buffer. Measurements below include **both** structuredContent and text, with text's additional JSON escaping.

| Operation / boundary fixture | `{result}` bytes | Complete raw JSON-RPC line bytes |
| --- | ---: | ---: |
| Compile 65,535-byte canonical source | 1,315,249 | 2,633,639 |
| Inspect same source | 1,315,249 | 2,633,639 |
| Verify same source | 66,532 | 134,907 |
| Recover by source, colors or harmonics, each | 1,315,249 | 2,633,639 |
| Frame: 64 nodes, phase 1e9, budget 24,000, crests 4 | 3,594,029 | 7,205,425 |
| Completed escape-heavy run | 1,979,071 | 4,289,590 |
| Exact replay of that request | 1,979,071 | 4,289,590 |
| Fresh reproduction with retained bindings | 1,979,126 | 4,289,704 |
| Computed-failed escape-heavy run | 1,933,662 | 4,195,500 |

Source fixture: two string literals of length 15,050, no steps, both exported, name `Boundaryx`, thought `Passive source boundary.`. Canonical source is 65,535 UTF-8 bytes; adding one name character produces a source-budget refusal. This is the boundary for this fixture, not a claim that all source shapes have identical parity.

Escape fixture: runtime String plus literal true, nine chained choose steps, one output. `text` is 10,920 NUL characters; JSON bindings occupy 65,531 bytes. The completed output equals the supplied string. A 62-step version has 64 nodes total and yields a retained computed failure when its trace budget fills; effects and outputs are empty. The same dense source supplies the maximum-budget frame, whose arrays have 96,000 point values, 72,000 normal values and 24,000 owners. "Maximum" refers to allowed geometry counts, not an exhaustive search for the largest decimal coordinate encoding.

In `v1-mcp.ts`, `RESPONSE_BYTES = 8 MiB` is compared only to `JSON.stringify(structuredContent)`. The actual return also contains `content:[{type:'text',text:JSON.stringify(structuredContent)}]`; JSON-RPC then wraps it. Installed official SDK `shared/stdio.js` defaults `ReadBuffer` to 10,485,760 bytes and serializes each complete JSON-RPC message plus newline. Paired InMemoryTransport tests alone would not establish this wire compatibility.

For a strict **total-wire 8 MiB** contract, prebuild/check the complete CallToolResult with explicit JSON-RPC request-ID/envelope headroom, or choose a documented larger total-wire bound below the official buffer. For the existing implementation, describe 8 MiB as the handler's structured-result budget and distinguish it from total wire size. This issue is a bound-definition gap; the boundary fixtures above do not exhibit a transport failure.

## Session and publication audit

Artifact ID is the hash of complete canonical source. Runtime inputs remain named ports and have a separate canonical digest; changing bindings changes input identity and outputs without rewriting source. Registry digest and source pin are checked by admission. Source/genome exports preserve declarations, types, policy and design but carry no execution history. Recover and constructor verification remain passive. Assembly frame sampling has no Run/world calls; unsupported custom nonassembly sources honestly refuse frame while remaining executable and recoverable.

Artifact admission prepares codecs, schema validation, serialized capacity and detached return before swapping its map. Run/reproduce binds the complete canonical operation/request payload to `requestId`; exact replay precedes capacity checks and returns a detached original record. A changed payload conflicts. A fresh full-ledger request refuses before evaluation; no successful receipt eviction permits duplicate execution. Reproduce explicitly evaluates retained parent bindings and compares the complete semantic result before admitting a fresh record.

Record schema validation, 2 MiB complete-record serialization, 64 MiB aggregate check, detached return allocation, receipt preparation and both replacement maps precede the synchronous local commit. Computed failures are retained semantic records, with staged occurrence outputs/effects cleared and later repeats stopped. Malformed inputs, insufficient capacity and failed reproduction are typed refusals with no record/key commit. Post-evaluation byte refusal can consume bounded computation but publishes no run or receipt.

Limits are serialized logical-data budgets, not JavaScript heap quotas. Artifact count defaults to 128 (maximum 1,024); run/receipt count defaults to 256 (maximum 4,096). The receipt charge is canonical request bytes plus 256, not serialization of the private `{payload,request,recordId}` object; its duplicated canonical string and JavaScript object/string overhead are additional memory. This remains finite under the count/request/record aggregate bounds. Do not market it as a literal 32 MiB heap limit.

Cancellation is explicitly before dispatch. Neither synchronous evaluation/commit nor a committed response can be rolled back by cancellation or disconnection. A post-commit transport/task-store failure is delivery loss, not evidence of nonexecution; retry the identical complete request/key. Session receipts survive transport task-history eviction within the process, but process termination destroys memory. Snapshots are passive bounded interchange, not authenticated historical evidence, an fsync journal, or crash durability. Restore with sufficient configured count/byte options; foreign registry pins refuse. Well-shaped imported output claims remain asserted and fail explicit fresh reproduction if false.

## Official protocol coverage and supported limits

MCP exposes exactly eight `quineling_v1_*` tools with strict shared input schemas and actual strict output schemas `{result: ResultSchemas[operation]}`. Native schema/protocol validation errors differ from typed QDL domain errors. Computed-failed Run is a successful tool result containing a failed semantic record. Tests cover discoverable schemas, passive lifecycle, original keyed replay, conflict, pre-dispatch cancellation, clean stdio and invalid successful output refusal.

A2A uses the official DefaultRequestHandler and native JSON-RPC/REST bindings, with discovery and separate build/inspect/run skills. Only a closed structured JSON Request executes; English yields INPUT_REQUIRED without admission or task computation. Official-client real HTTP tests cover two independent Sessions, source pins, recoveries, retained runs, snapshot restoration, retry/conflict, failed semantic delivery, native REST and optional 0.3 compatibility. Streaming tests observe SUBMITTED → WORKING → artifact → COMPLETED. Cancellation and scoped identical task IDs are additionally exercised at the official executor/event-bus boundary; completed task cancellation returns the official protocol error.

A2A defaults to a 4 MiB HTTP body, 16 MiB per retained task, and a 128-task/64 MiB task store. Task history can be evicted; active work is protected and paused clarification has a bounded lifetime. Schema/domain failures use task state and `qdlError` metadata; malformed protocol/HTTP bodies use protocol/HTTP errors. A2A computed failure delivery is TASK_STATE_COMPLETED with `record.result.status === 'failed'`. Pending work is bounded. Task history's budgets are distinct from non-evicting Session execution receipts.

Loopback single-owner operation is supported. Public authenticated shared hosting, cross-owner Session isolation, durable server storage, live City effects, arbitrary program network/eval, automatic English interpretation and experimental ranch/world policy are outside this stable promise. Their absence is not a local-release blocker.

## Verification performed

- `node --import tsx --test test/v1.test.ts test/v1-adapters.test.ts test/v1-audit.test.ts`: 37 passed before the snapshot fix.
- `node --import tsx --test test/v1-model.test.ts`: 7 model-backed tests passed before the fix, including lost-reply replay, complete-payload conflict, staged refusal and passive asserted restore.
- Real official MCP stdio large-envelope probe: all operations above succeeded.
- Snapshot failure reproduced with `/tmp/qdl-api-snapshot-probe.mts`; exact dense-default case is now a regression in `test/v1.test.ts`.
- After the fix, `node --import tsx --test test/v1.test.ts`: 16 passed.
- After the fix, `npm test`: **109 passed, zero failed**.
- `npm run typecheck`: production and test TypeScript checks passed.

Tests ran on installed Node v26.10.0 with official dependencies pinned in package metadata. Root separately reports Node22 full-suite (109 tests), typecheck and build passing; its delivery gate owns packed-consumer and release archive verification. Probe temporary files are local evidence, not packaged release artifacts. No registry-pinned language files, adapters, legacy goldens, credentials, deployments or external-world actions changed in this workstream.
