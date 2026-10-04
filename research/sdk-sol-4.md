# A2A adapter design review

Reviewed 2026-10-04. Scope: discovery, request contracts, lifecycle, errors, and interoperability. Only this note and `docs/sdk-a2a-guide.md` are owned by this review; runtime and adapter implementation belong to the integration agent. QDL and the SDK remain experimental. An A2A protocol version describes the transport, not a frozen Quineling source language.

## Evidence and version choice

`packages/agent-sdk/package.json`, lockfile, and installed package agree on **`@a2a-js/sdk` 1.3.0**. Its installed declarations are the implementation authority for examples. The current [official SDK README](https://github.com/a2aproject/a2a-js) identifies A2A 1.0 support. The [released protocol specification](https://a2a-protocol.org/v1.0.0/specification/) is the normative protocol reference; avoid the changing `/dev/` specification. The [official compatibility guide](https://github.com/a2aproject/a2a-js/blob/main/docs/compatibility-v0_3.md) covers optional legacy support.

Installed declarations inspected: `dist/a2a-CJdXl9vi.d.ts`, `dist/extensions-DglIgEjg.d.ts`, `dist/server/index.d.ts`, `dist/server/express/index.d.ts`, `dist/client/index.d.ts`, and `dist/errors/index.d.ts`. These establish:

- `AgentCard.supportedInterfaces` entries use `protocolBinding`, `protocolVersion`, and `url`; preference follows array order. Agent `version` is separate.
- Native JSON-RPC uses `SendMessage`, `SendStreamingMessage`, `GetTask`, `CancelTask`, and `SubscribeToTask`; legacy `message/send` requires explicit compatibility.
- SDK objects use numeric `Role`/`TaskState` enums and `Part.content = {$case, value}`. Serialized JSON uses `ROLE_USER`, `TASK_STATE_COMPLETED`, and flattened `text`/`data` members. Do not hand-send SDK object unions as wire JSON.
- Generated `Message`, `Part`, `AgentCard`, and request codecs expose `fromJSON`, `toJSON`, and `create` for defaults and conversions.
- Every executor invocation, including follow-up turns, first publishes a task or message through `AgentEvent`. `statusUpdate` and `artifactUpdate` cannot be first.
- Status updates have no v0.3 `final` property. Artifact updates retain `append` and `lastChunk`. Stream responses have a `payload` union.
- Express helpers accept options objects (`requestHandler`, `userBuilder`); discovery uses `agentCardHandler({agentCardProvider})`. Errors are named subclasses from `@a2a-js/sdk/errors`.

## Contract choices

Use one JSON data part containing the existing `Request` union from `src/types.ts`. It selects `operation`, with exactly the same arguments and response types as `Runtime.dispatch`. Do not maintain a second compiler API behind A2A. Text-only input can mean `create` if implemented and documented; structured requests are the unambiguous integration path. Skill discovery should group operations without inventing an A2A `skillId` execution parameter:

| Proposed skill ID | Operations | Result and obligation |
| --- | --- | --- |
| `quineling-create` | `parse`, `compile`, `create` | Explicit intent or creation status; source is created only for supported input. |
| `quineling-inspect` | `inspect`, `frame` | Stored artifact or deterministic geometry; phase is presentation input. |
| `quineling-run` | `run` | Source-bound execution record; actions are simulations. |
| `quineling-reproduce` | `reproduce` | Fresh child artifact/record from a specified current parent record. |
| `quineling-recover` | `recover` | Validated source recovered from exactly one source/harmonic/color representation. |

Skill IDs are a design recommendation, not a protocol requirement. Input/output modes are `application/json` and, where supported, `text/plain`. An artifact JSON envelope must distinguish the SDK's Quineling `Artifact` from the A2A protocol `Artifact`. Wrap a full runtime response as structured data; include explanatory text separately if useful.

Runtime artifact IDs are SHA-256 of canonical source. A2A task IDs, context IDs, message IDs, artifact IDs, and runtime execution-record IDs occupy separate namespaces. Task/context IDs are orchestration identifiers, never source identities. Reproduction requests supply both `artifactId` and `recordId`; neither a message nor the shared context silently grants permission to execute.

`thought.js` performs bounded explicit-data parsing and typed graph compilation. `anatomy.js` generates authored anatomy and gesture. `core.js` constructs, reproduces, and encodes the executable source. A2A wraps those stages; it does not add unrestricted natural-language synthesis or external capabilities. Source reproduction proves source equality, not agreement with arbitrary English or reproduction of companion provenance.

## Lifecycle and errors

For the initial bounded adapter, prefer one completed task containing a structured response artifact. A `clarify`, `unsupported`, or `inconsistent` creation response can be a completed **analysis** task: completion means the request was answered, not that a lifeform was produced. Always preserve `status`, `diagnostics`, and absence of `artifact`; never say creation succeeded for these cases. This simple policy avoids advertising resumable clarification before it exists.

If later implementing actual multi-turn creation, map `clarify` to `TASK_STATE_INPUT_REQUIRED`, preserve the pending operation and partial data, and resume only with the same task/context and a new message ID. Unsupported creation is rejected, internal execution failure is failed. Terminal tasks must not be re-opened. This is an alternative lifecycle design requiring its own tests, not behavior to claim for the initial adapter.

Malformed transport envelopes and invalid operation shapes fail before runtime mutation. Use `RequestMalformedError` for malformed application requests, `ContentTypeNotSupportedError` for unsupported message content, `TaskNotFoundError` for unknown A2A task IDs, and `TaskNotCancelableError` for completed/uninterruptible work. A missing Quineling `artifactId` is an application lookup diagnostic, not an unknown A2A task. SDK transport helpers serialize errors; avoid defining conflicting wire codes. Internal failures after a task starts publish failed state and a sanitized diagnostic, then settle the bus.

Initial advertisement: JSON-RPC only, streaming/push/extended card false unless integration tests demonstrate them. Bind unauthenticated examples to loopback. Remote use requires authenticated middleware and ownership-scoped runtime/task stores. The installed `InMemoryTaskStore` supports owner resolution, but runtime artifact/record access needs equivalent checks. An agent card declares security; it does not implement authorization.

Do not promise durable IDs across restart or unlimited retained artifacts: Runtime defaults to bounded in-memory stores (128 artifacts, 256 records), rejects admission when full, and permits bounded constructor overrides. Send retries are not automatically exactly-once; implement message deduplication before promising it. Cancellation of synchronous CPU work cannot succeed merely by setting a flag; advertise/return the actual inability to stop it. HTTP disconnect is not cancellation.

## Interoperability acceptance plan

These are proposed tests, not reported passing results:

1. Discover with native `ClientFactory` and `A2A-Version: 1.0`; assert card/endpoint/modes/skills and that advertised examples parse. Validate serialized card with SDK codecs.
2. Send each `Request` branch through the official client; compare data responses to direct `Runtime.dispatch` in isolated runtimes. Keep generated IDs out of equality comparisons where appropriate, but require exact canonical source equality.
3. Create `[2,3,4] | square | sum | report total`; inspect; run and independently assert 29; reproduce from that execution record and assert exact source plus fresh record lineage. Recover through source, harmonics, and colors, each separately.
4. Verify frame generation at phase 0 and 0.5 leaves source and execution stores unchanged. Building/inspection/recovery must not create a run record; run/reproduce do.
5. Submit missing data, unavailable capability, and type inconsistency. Require the exact creation status and diagnostic; no artifact/run success is fabricated.
6. Reject absent/multiple data parts, arrays/null instead of operation objects, unknown operations, wrong fields, incompatible content, oversized bodies, and `recover` inputs with zero or multiple representations. Reject malformed requests before store writes.
7. Check A2A task polling separately from runtime artifact lookup. Wrong task/context pair is rejected; history limits are honored. Test terminal cancellation and unsupported streaming/push against the card.
8. Use raw HTTP JSON fixtures in addition to SDK clients: `ROLE_USER`, flattened data parts, PascalCase method, `A2A-Version` header. Check response envelopes contain a task/message result, never a naked Runtime response.
9. With streaming enabled later, assert initial task/message, ordered status/artifacts, complete artifact before terminal status, and correct stream union decoding. Test cancellation races before claiming support.
10. Cross-SDK smoke test with an official Python or independent conformance client; same-SDK round trips alone do not establish interop. Exercise all transports only when advertised. Legacy peers need explicit compat handlers/card interfaces and a separate v0.3 suite.

## Implemented adapter reconciliation

The integration agent's `src/a2a.ts` now implements `createA2AApp`, `QuinelingExecutor`, and `BoundedTaskStore`. Its final choices differ from several recommendations above: discovery groups operations into `build` and `execute`; JSON-RPC `/a2a/jsonrpc` and REST `/a2a/rest` are mounted; streaming is advertised; JSON-RPC v0.3 compatibility defaults to enabled. Response artifact data is `{operation, result}`. Clarification uses input-required and accepts a complete replacement request, while unsupported/inconsistent results reject the task. It does not merge partial intent. `compile` returns an Artifact directly. Runtime validation failures are caught after initial task publication and become failed task status messages.

Task storage defaults to 128 tasks and 64 MiB and permits 16 MiB per task. It evicts terminal or interrupted tasks in least-recently-updated order and lazily expires paused tasks after 15 minutes. `TaskRetentionOptions` exposes `interruptedTtlMs` and a test clock. Active/resuming tasks are protected; paused tasks release executor state and event buses (`keepBusAliveStates: []`), preventing accumulated ambiguous requests from blocking fresh work. Retained clarification IDs permit cancellation or a complete replacement follow-up; expired/evicted IDs return task-not-found. Runtime artifacts/records instead reject new admission when full. Cancellation is supported before synchronous dispatch and while a clarification remains retained; dispatch itself is not interruptible.

Source identity excludes companion metadata. Runtime admission preserves the existing artifact; a different submitted intent for the same source with an existing intent raises `metadata-conflict`. Separate Runtime instances retain alternative interpretations. A fresh source recovery does not recreate omitted companion provenance. Both mounts are unauthenticated with a shared Runtime, so task-store scope alone does not provide remote multi-user isolation. The guide reflects these actual choices; the recommendations and acceptance tests above remain review history and future checks. This research does not edit implementation or enable deployment.

## Verification performed by this review

Extracted the raw HTTP request from the guide, decoded it with installed `SendMessageRequest.fromJSON`, checked native role/data representation, and round-tripped with `toJSON`. Parsed/compiled the fixture with the actual thought compiler and independently checked its kernel output `{total:29}`. Started `createA2AApp({legacyCompat:false})` on an ephemeral loopback port; the official `ClientFactory` discovered the card, sent the guide creation fixture, received a completed task with `{operation,result}`, and ran the returned artifact to obtain 29. Closed the listener afterward. No code or persistent test files were edited. The pinned SDK's `sendMessage` returns `Task | Message` directly, while raw transport and stream envelopes differ; the guide's client extraction reflects this distinction.

After the retention correction, ran `node --import tsx --test test/a2a.test.ts`: all six existing tests passed. Coverage includes native JSON-RPC/REST and legacy compatibility, malformed requests, cancellation, capacity handling after 140 clarification requests, lazy expiry, retained follow-up, and active/resuming task protection. The independent-language conformance checks proposed above remain outstanding.
