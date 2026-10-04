# A2A integration of the experimental Quineling runtime

The package adapter uses the official `@a2a-js/sdk` 1.3.0 and Express 5.1.0. Its native protocol is A2A 1.0; optional official SDK compatibility supports 0.3 `message/send`. These protocol/package revisions do not freeze QDL. Reviewed the [official JavaScript SDK](https://github.com/a2aproject/a2a-js) and the installed SDK's public TypeScript declarations and transport implementation. The SDK identifies the [A2A 1.0 specification](https://a2a-protocol.org/v1.0.0/specification/) as its wire-contract source.

`packages/agent-sdk/src/a2a.ts` exports `createA2AApp`, `QuinelingExecutor`, and `BoundedTaskStore`. It mounts official `agentCardHandler`, `jsonRpcHandler`, and `restHandler` adapters around one `DefaultRequestHandler`; protocol codecs, task transport, discovery, event ordering, and error mappings come from the SDK. The implementation does not pretend an arbitrary JSON endpoint is A2A.

The default CLI binds only `127.0.0.1:8049`. `QUINELING_A2A_PORT` selects another loopback port. Embedded applications receive an Express app and may manage their own server. The included adapter is one local runtime session, with unauthenticated SDK context; it does not supply a public multi-user authentication/authority service.

Endpoints:

- `GET /.well-known/agent-card.json`; send `A2A-Version: 1.0` for the native card. Compatibility mode returns the SDK's 0.3 card when the header is absent.
- `POST /a2a/jsonrpc` with `A2A-Version: 1.0` and native methods `SendMessage`, `GetTask`, `CancelTask`, `ListTasks`, and SDK streaming methods.
- `POST /a2a/rest/message:send` and the official SDK's native REST task endpoints.
- With compatibility enabled (the default), `POST /a2a/jsonrpc` with `A2A-Version: 0.3` accepts `message/send` and the older task methods. This is the SDK compatibility layer, not a second handwritten parser.

A single text part requests passive local `create` with the original string, including whitespace; empty thoughts clarify and the runtime checks its raw length limit. A single JSON data part carries the shared runtime request union:

```json
{
  "jsonrpc": "2.0",
  "id": "build-1",
  "method": "SendMessage",
  "params": {
    "message": {
      "messageId": "thought-1",
      "role": "ROLE_USER",
      "parts": [{"text": "[2,3,5] | square | sum"}]
    }
  }
}
```

A native response contains `result.task`; its output artifact contains a JSON data part `{operation, result}`. Supported text returns the authored source, graph, design, and recoverable genomes. Parse/compile/create/inspect/recover/frame produce no execution receipt. Evaluation requires an explicit structured part such as `{"data":{"operation":"run","artifactId":"ql_..."},"mediaType":"application/json"}`. `reproduce` likewise requires both artifact ID and a matching prior record ID and creates a fresh child execution record. The runtime validates every structured request and exact source association.

Tasks publish submitted, working, an output artifact, then completed/rejected/input-required as appropriate. A follow-up keeps the stored transcript and replaces the stable `quineling-result` container; a malformed message envelope on a paused task leaves it resumable. Clarification preserves the task ID for a follow-up while that paused task remains retained. The executor releases its pending entry and the SDK closes the event bus after returning input-required; retained storage reconstructs later follow-up or cancellation. Unsupported or inconsistent proposals are rejected, without invented results. Validation/evaluation errors produce failed task status with the actual error message. A runtime `QuinelingError` also retains `{code,message,path}` in `task.status.message.metadata.quinelingError`, including when retrieved later with `GetTask`. Unknown task lookup and invalid cancellation use official protocol error codes.

Cancellation may win during the event-loop yield before dispatch or while clarification is pending. Once synchronous bounded interpretation begins it cannot be interrupted; completed tasks reject cancellation. No response claims to undo already executed work.

Resources are bounded: HTTP JSON bodies default to 2 MiB; thought text is at most 16,384 JavaScript characters; task history defaults to 128 entries and 64 MiB total with a 16 MiB per-task cap. Capacity pressure evicts the least-recently-updated terminal or paused (`INPUT_REQUIRED` / `AUTH_REQUIRED`) tasks. Paused tasks also expire after 15 minutes without a status update; expiry is applied on the next store load, save, or list. Reads do not renew that lifetime. Submitted, working, and actively resuming tasks are never evicted. If active work alone exhausts capacity, the new request fails and can be retried after completion. An evicted or expired task ID returns protocol task-not-found for inspection, cancellation, or follow-up; the client must start a new task without the old ID. Retained paused tasks still support cancellation and follow-up. `BoundedTaskStore` accepts an `interruptedTtlMs` retention option for embedders; custom stores own their retention policy. SDK task IDs are separate from source-derived Quineling artifact IDs. Restart loses the in-memory session and task history. The runtime separately bounds stored source artifacts and execution records.

Task listing uses an opaque signed cursor bound to this store, caller scope, and membership filters. It advances in descending parsed status-timestamp order, with immutable task admission sequence as the equal-time tie-breaker. The cursor stores that pair independently of retention order. Evicting earlier rows or the cursor row does not skip surviving later rows. Updating a task timestamp may move it across the cursor; its immutable sequence remains the tie-breaker. A cursor cannot be reused with another tenant/caller, changed context/status/timestamp filters, or another store instance. Listings are live, not snapshots: later admissions may appear; rows that expire or are evicted disappear; concurrent changes to filter membership may require starting a new listing. There is no exactly-once or snapshot-consistency guarantee during mutation. `totalSize` describes the currently retained matching set.

Validation:

- `npx tsx --test test/a2a.test.ts`: twelve passing tests spanning real HTTP native discovery, passive creation, explicit run with independent expected result 38, source-identical fresh reproduction, passive source recovery, a 4,000-point frame, task retrieval, native REST, and official legacy compatibility.
- Additional paths cover malformed envelopes/JSON, unsupported structured operations, unknown artifacts/tasks, oversized requests, completed-task cancellation refusal, clarification cancellation, and clarification follow-up completion.
- A direct executor test cancels before dispatch and observes zero runtime dispatch calls. Bounded-store tests verify terminal task eviction, paused expiry, and protection of active/resuming work. A real HTTP regression submits 140 ambiguous thoughts, verifies a fresh valid request still completes, checks old IDs return task-not-found, and confirms retained paused tasks still cancel and resume. The listed task count remains bounded at 128. A separate cursor regression saves ten tasks, reads five, admits five more while evicting the earlier rows, and confirms the next page returns retained tasks five through nine without skipping them; it also checks stable order across updates and rejects cross-scope, changed-filter, malformed, and foreign-store cursors.
- `npx tsc --noEmit` checks portable exported declarations. Root runs complete package/build and protocol integration verification.

This is an operational local A2A adapter. Public deployment, persistent task storage, external capability credentials, and authenticated multi-user authority are outside this implementation.


Final specialist-audit verification confirmed and corrected four A2A findings in audit 3: lost follow-up history/stale result containers; text whitespace/length divergence; destructive capacity rejection; and lexical timestamp comparison. The recommendation to make the timestamp filter exclusive was rejected against the [published A2A 1.0 specification](https://a2a-protocol.org/v1.0.0/specification/#314-list-tasks), which specifies inclusion at equality and newest-first ordering. Ordering was independently corrected to follow that contract. Audit 4's uncloneable-task destructive replacement and bare-ID active protection were also confirmed and fixed. Save now prepares its clone and victim set before mutation; executor and store protection use tenant/user scope, and cancellation matches the active scoped bus.

The expanded twelve-case A2A suite passes and TypeScript checks pass. New regressions check transcript retention and artifact replacement across malformed and successful follow-ups, raw text/data/direct runtime parity, rejection without losing paused or previous tasks, inclusive timestamp offsets and ordering, and independent tenant protection/cancellation for the same task ID. These tests establish the specific local and HTTP behaviors; they are not proofs of general protocol conformance.
