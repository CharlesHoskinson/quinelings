# Quineling A2A integration

The experimental agent SDK adapts the local thought-to-lifeform runtime to Agent2Agent requests. The package pins `@a2a-js/sdk` **1.3.0**; examples here target its native **A2A 1.0** wire model. QDL remains experimental. Protocol compatibility does not freeze source formats or imply unrestricted thought compilation.

Runtime operation names and arguments follow `packages/agent-sdk/src/types.ts`; transport behavior follows `src/a2a.ts`. The adapter mounts JSON-RPC and HTTP+JSON, supports streaming, and enables JSON-RPC v0.3 compatibility by default. Its unauthenticated server is intended for local use.

The [official SDK](https://github.com/a2aproject/a2a-js) supplies discovery, clients, request handlers, stores, and transports. Consult the [released A2A specification](https://a2a-protocol.org/v1.0.0/specification/) for protocol requirements and the [compatibility guide](https://github.com/a2aproject/a2a-js/blob/main/docs/compatibility-v0_3.md) before connecting v0.3 peers.

## Discovery and versioning

`createA2AApp` serves `/.well-known/agent-card.json` with the SDK `agentCardHandler`. The card identifies the transport endpoint independently of the discovery URL. A native card has an ordered `supportedInterfaces` array; its default preferred entry is:

```json
{
  "url": "http://127.0.0.1:8049/a2a/jsonrpc",
  "protocolBinding": "JSONRPC",
  "protocolVersion": "1.0"
}
```

The CLI defaults to this local port; no deployment is implied. HTTP+JSON is mounted at `/a2a/rest`. Agent `version` is `0.0.0-experimental`, separate from interface `protocolVersion`. The card advertises streaming and disables push notifications; it does not configure an extended authenticated card.

The card has two skills: `build` covers passive creation and inspection operations; `execute` covers explicit `run` and `reproduce`. Skills describe discovery capabilities; the request's `operation` selects the runtime action. A2A has no standard execution `skillId` argument.

After building the package, run `node dist/a2a-cli.js` from `packages/agent-sdk`; set `QUINELING_A2A_PORT` to change its port. The CLI binds to `127.0.0.1`. To embed it:

```js
import { createA2AApp } from '@quinelings/agent-sdk/a2a';
const { app, runtime, card } = createA2AApp({
  baseUrl: 'http://127.0.0.1:8049',
  legacyCompat: false
});
const server = app.listen(8049, '127.0.0.1');
```

The factory also accepts `runtime`, `taskStore`, and `requestLimitBytes`. Its default JSON body limit is 2 MiB. Supply the advertised listener origin as `baseUrl`; changing the card alone does not open a listener.

## Structured request contract

Send a user message with exactly one JSON data part containing a request; use `mediaType: "application/json"`. A single text part is shorthand for `create` with that exact thought. Text is passed unchanged to the runtime: empty or whitespace-only thoughts request clarification, and the 16,384-character limit applies before trimming. The integration preserves the runtime argument names:

| `operation` | Fields beyond `operation` | Runtime response |
| --- | --- | --- |
| `parse` | `thought` | Parse status, intent when supported, diagnostics, assumptions, source map |
| `create` | `thought`, optional `options` | Creation status and artifact when supported |
| `compile` | typed `intent`, optional `options` | Validated artifact; invalid intent raises an error |
| `inspect` | `artifactId` | Full stored Quineling artifact |
| `run` | `artifactId` | Fresh source-bound execution record |
| `reproduce` | `artifactId`, `recordId` | `{artifact, record}` for a fresh child execution |
| `recover` | `recovery` | Artifact validated from source or one genome |
| `frame` | `artifactId`, finite `phase`, optional `options` | Geometry points, normals, owners, ridges, node IDs |

Creation options are `{seed?, repeats?}`. Frame options are `{budget?, crests?}`. Recovery accepts exactly one of `{source}`, `{harmonics}`, or `{colors}`. Use the actual types rather than inventing a numeric genome array or transport-specific source format. Imported source is validated as a Quineling program; recovery never invokes arbitrary JavaScript evaluation.

`compile.intent` uses `format: "quineling-intent"`, a name and thought, typed supplied inputs, ordered operation steps, and declared outputs. See the source [intent schema](../design/intent.schema.json) and SDK declarations. Units and ordered ports affect task meaning. An unsupported operation cannot be enabled by adding its name to a remote request.

Example raw JSON-RPC request to the advertised endpoint:

```http
POST /a2a/jsonrpc HTTP/1.1
Host: 127.0.0.1:8049
Content-Type: application/json
A2A-Version: 1.0

{
  "jsonrpc": "2.0",
  "id": "create-1",
  "method": "SendMessage",
  "params": {
    "message": {
      "messageId": "msg-create-1",
      "role": "ROLE_USER",
      "parts": [{
        "mediaType": "application/json",
        "data": {
          "operation": "create",
          "thought": "[2,3,4] | square | sum | report total"
        }
      }]
    }
  }
}
```

Native SDK objects differ from serialized JSON. Use codecs to supply defaults and flatten protobuf unions:

```js
import { randomUUID } from 'node:crypto';
import { SendMessageRequest } from '@a2a-js/sdk';
import { ClientFactory } from '@a2a-js/sdk/client';

const client = await new ClientFactory().createFromUrl('http://127.0.0.1:8049');
const request = SendMessageRequest.fromJSON({
  message: {
    messageId: randomUUID(),
    role: 'ROLE_USER',
    parts: [{
      mediaType: 'application/json',
      data: { operation: 'create', thought: '[2,3,4] | square | sum | report total' }
    }]
  }
});
const response = await client.sendMessage(request);
if ('artifacts' in response) {
  for (const artifact of response.artifacts) {
    for (const part of artifact.parts) {
      if (part.content?.$case === 'data') console.log(part.content.value);
    }
  }
}
```

Do not JSON.stringify an SDK `content: {$case: "data", value: ...}` object and post it directly; use `SendMessageRequest.toJSON` for manual transport. Native wire parts have no `kind: "data"`, user role is not `"user"`, and the RPC method is not `message/send`.

## Results, identity, and execution

The response is an A2A task carrying a structured artifact whose data is `{operation, result}`. Each task uses the stable result-container ID `quineling-result`; a follow-up replaces that container, so a successful result supersedes the earlier clarification payload. Successful requests complete the task. A `clarify` result interrupts it with `TASK_STATE_INPUT_REQUIRED`; `unsupported` or `inconsistent` rejects it with `TASK_STATE_REJECTED`. The structured result retains status and diagnostics with no created artifact. Read `result.status` before treating creation as successful. Typed `compile` returns the artifact directly as `result`, rather than a creation-status wrapper.

The A2A result artifact is a protocol container. Its `artifactId` identifies that container inside the A2A task. The nested Quineling artifact `id` identifies canonical source using SHA-256. A2A task ID, context ID, and message ID are separate identifiers. Preserve the returned runtime `artifact.id` for `inspect`, `run`, and `frame` requests, and the returned execution record `id` for `reproduce.recordId`.

Thought, typed intent, contract, and source map are companion metadata; they do not change source identity. If the same canonical source is already stored with an intent, submitting a different companion intent raises `metadata-conflict` rather than overwriting the existing interpretation. Use separate Runtime instances to retain both interpretations. Recovering source into a fresh Runtime restores the program without those omitted companions; recovery into a Runtime that already knows the source returns its retained artifact.

Creation constructs validated source and authored anatomy without executing the program. Inspection and frame sampling are observations. `run` executes explicitly; `reproduce` verifies the specific parent record and performs a fresh child execution. A reproduced source must match exactly, while execution records have their own identity and parent lineage. Actions supported by the kernel registry are simulations, not external world actions.

The runtime defaults to at most 128 artifacts and 256 execution records in memory; its constructor allows bounded overrides. A full store rejects new entries with `resource-limit`; it does not silently evict retained entries. Process restart loses those entries. Source and genome exports can recover a validated program; they do not recover omitted thought provenance or historical execution records. A reproduction request must use a currently retained record associated with that exact artifact/source.

## Lifecycle and errors

Malformed JSON and oversized HTTP bodies fail before dispatch (400/413). The executor creates an initial task, then validates message role/content and runtime arguments. Failures at that stage, including unknown runtime artifact/record references, produce `TASK_STATE_FAILED` with a status message rather than a success artifact. Runtime errors retain their structured `{code,message,path}` at `task.status.message.metadata.quinelingError`, including in later `GetTask` responses. A malformed role/part envelope on an existing interrupted task leaves it `TASK_STATE_INPUT_REQUIRED`, allowing a corrected follow-up; a valid envelope that fails runtime validation still produces a failed task. Unknown A2A task IDs and terminal cancellation use SDK semantic errors. These identifiers must remain distinct.

The implementation uses `AgentExecutor`, `DefaultRequestHandler`, and `AgentEvent` from `@a2a-js/sdk/server`. Each invocation publishes an initial task before updates. JSON-RPC mounting uses `jsonRpcHandler({requestHandler, userBuilder})`; discovery uses `agentCardHandler({agentCardProvider})`. SDK error classes come from `@a2a-js/sdk/errors`.

A retained clarification response can be continued with a new message ID and the same task/context. Previous user and agent messages remain in the task history, including unsuccessful message attempts. Send a complete replacement thought or structured request: the executor does not merge partial data or infer omitted arguments. On entering `TASK_STATE_INPUT_REQUIRED`, it releases active execution state and the SDK event bus; follow-up and cancellation are reconstructed from retained task storage. Streaming uses `client.sendMessageStream(request)` and yields SDK `StreamResponse.payload` values (`task`, `statusUpdate`, `artifactUpdate`, or `message`). The artifact arrives before the terminal/interrupted status. Cancellation can win before synchronous dispatch or while a clarification task remains retained; once bounded synchronous evaluation begins, it is not interruptible. Disconnecting does not establish cancellation. Send retries may duplicate work; the adapter has no message deduplication.

The default `BoundedTaskStore` retains up to 128 tasks and 64 MiB, with a 16 MiB per-task limit. At capacity it evicts eligible terminal or paused tasks in order of their last update. Paused tasks also expire after 15 minutes; expiry is checked lazily on load, save, or list. Active and resuming work is protected within the task's tenant/user scope. Failed capacity admission or cloning leaves existing task entries intact; eviction is committed only after the replacement is prepared and shown to fit. Polling a task does not extend its lifetime. Once an ID is evicted or expires, polling, cancellation, or follow-up returns task-not-found; start a new task with a complete request. Runtime artifact/record stores instead reject new entries at capacity.

To change paused-task retention, supply `taskStore: new BoundedTaskStore(128, 64 * 1024 * 1024, {interruptedTtlMs: 30 * 60 * 1000})` to `createA2AApp`; import `BoundedTaskStore` from `@quinelings/agent-sdk/a2a`. The optional `now` callback supports deterministic expiry tests. Custom task stores own their retention policy.

`ListTasks` uses an opaque signed cursor bound to the store instance, tenant/user scope, and context/status/timestamp filters. Results are ordered by status timestamp from newest to oldest; immutable admission sequence breaks equal-time ties. The cursor records both values, so eviction of earlier rows or the cursor row does not shift the continuation. Reusing a cursor with changed membership filters or another scope/store is rejected. This is a live listing: status changes can move a task across the cursor, and eviction or expiry can remove it. It does not promise snapshot consistency or exactly-once enumeration during mutation. Start a fresh listing to refresh changed results; `totalSize` counts the currently retained matches.

`statusTimestampAfter` compares parsed instants, including timezone offsets, and includes a task at exactly the supplied instant. Missing or invalid stored timestamps are excluded when that filter is present. Inclusive filtering and newest-first ordering follow the [A2A 1.0 List Tasks contract](https://a2a-protocol.org/v1.0.0/specification/#314-list-tasks); the installed SDK's reference in-memory store uses a stricter timestamp comparison, which this adapter deliberately does not copy.

The factory mounts `UserBuilder.noAuthentication` and a shared Runtime. Remote service use requires an adapted authenticated mount and principal-scoped runtime access in addition to the task store's tenant/user scope. Runtime IDs are references, not access tokens. Source/thought artifacts may contain supplied data; apply the same authorization to downloads. No credentials belong in source or the agent card.

## Interoperability checks before release

Use isolated runtimes and an ephemeral loopback listener. This checklist specifies required coverage; it is not a test result report.

- Discover with the official client; validate interface version, endpoint, modes, skills, and examples against the actual mounted service.
- Create the square/sum example, inspect its source, then run and assert total **29** independently. Reproduce using the returned current record, assert exact source and fresh parent-linked record, then recover separately through each genome representation.
- Exercise every structured operation through transport and compare it with direct `Runtime.dispatch`. Frame/inspect/recover must not create execution records.
- Preserve clarification/unsupported/inconsistent diagnostics and reject unknown operations, multiple data payloads, malformed intent, non-finite inputs, and conflicting recovery representations before mutation.
- Test polling, history limits, clarification transcript preservation/result replacement, malformed follow-up recovery, terminal cancellation, wrong task/context pairs, missing runtime references, and unsupported push/stream requests. Card claims must agree with observed behavior.
- Submit more clarification requests than the task capacity, then create a valid lifeform. Verify retained clarification follow-up/cancellation, expired or evicted IDs returning task-not-found, and active/resuming tasks surviving cleanup. Check conflicting companion intents preserve the existing artifact.
- Test cursor continuation after eviction, newest-first ordering, inclusive chronological timestamp filters, atomic failed saves, and tenant-scoped active protection.
- Include raw HTTP fixtures to catch accidental v0.3 wire fields. When possible, add an official independent-language client or conformance suite; same-SDK round trips alone do not establish interoperability.

JSON-RPC legacy compatibility defaults to enabled; `legacyCompat: false` disables it. Discovery and JSON-RPC handlers use the upstream compat layer, and the card advertises a v0.3 JSON-RPC interface. REST remains native A2A 1.0. For a legacy server client, enable upstream compat in card resolution and the selected client transport, and test it separately. Do not send old field names to a native-only service.

Detailed design decisions and installed SDK evidence are recorded in [the A2A review](../research/sdk-sol-4.md).
