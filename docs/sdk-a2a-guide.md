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

The card has three skills: `build` covers source preparation and inspection; `ranch` covers offspring preparation/admission, lineage, annotation and explicit world control; `execute` covers explicit `run` and `reproduce`. Ranch operations never run tasks. Skills describe discovery capabilities; the request's `operation` selects the runtime action. A2A has no standard execution `skillId` argument.

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
| `offspringPreview` | `input` | Ready candidate or rejected diagnostics, no child storage |
| `offspringFrame` | `input`, `candidateId`, `childSourceHash`, `phase`, `options?` | `{candidateId,childSourceHash,frame}` from stateless rebuild |
| `offspringAdmit` | `input`, `candidateId`, `childSourceHash`, `target`, `requestId` | Explicit admission acknowledgement; no execution record |
| `lineage` | `artifactId?`, `cursor?`, `limit?` | `{derivations,nextCursor?}` flat session evidence |
| `annotate` | `artifactId`, `intent` | Exact graph-matching companion attachment |
| `worldCreate` | `worldKey`, `seed`, `affinity?` | One world snapshot, identical configuration idempotent |
| `worldInspect` | `worldId` | Detached world snapshot, no social advance |
| `worldCommand` | `worldId`, `expectedRevision`, `sequence`, `command` | Explicit bounded mutation acknowledgement |

Creation options are `{seed?, repeats?}`. Frame options are `{budget?, crests?}`. Recovery accepts exactly one of `{source}`, `{harmonics}`, or `{colors}`. Use the actual types rather than inventing a numeric genome array or transport-specific source format. Imported source is validated as a Quineling program; recovery never invokes arbitrary JavaScript evaluation.

`compile.intent` uses `format: "quineling-intent"`, a name and thought, typed supplied inputs, ordered operation steps, and declared outputs. See the source [intent schema](../design/intent.schema.json) and SDK declarations. Units and ordered ports affect task meaning. An unsupported operation cannot be enabled by adding its name to a remote request. All sixteen dispatch operations are closed records; unknown fields, including nested recipe/style/origin/command fields, reject. Public ranch types are in `src/ranch-types.ts`; the [API reference](sdk-api.md) gives their exact shapes. `offspringPreview` nests its complete input; frame/admission fields are flat alongside operation. `worldCreate` has no nested config object and `worldCommand` has no wrapper around its revision/sequence fields.

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


## Structured ranch requests and original-key retries

The native data part remains `{operation,...fields}` and the result data remains `{operation,result}`. The `ranch` skill introduces no separate message wrapper or skillId parameter. Text input continues to mean `create`; it cannot implicitly choose a recipe, admit offspring, advance a ranch, or execute a task.

```js
// Continue with the connected official client above.
async function sendOperation(data) {
  const response = await client.sendMessage(SendMessageRequest.fromJSON({
    message:{messageId:randomUUID(),role:'ROLE_USER',
      parts:[{mediaType:'application/json',data}]}
  }));
  if (!('artifacts' in response)) throw new Error('Expected an A2A task');
  for (const artifact of response.artifacts) {
    for (const part of artifact.parts) {
      if (part.content?.$case === 'data') return part.content.value;
    }
  }
  throw new Error(JSON.stringify(response.status));
}
const createdWorld = await sendOperation({operation:'worldCreate',
  worldKey:'a2a-garden',seed:23,affinity:'neutral'});
const worldId = createdWorld.result.id;
const inspected = await sendOperation({operation:'worldInspect',worldId});
const snapshot = inspected.result;
const originalCommand = {operation:'worldCommand',worldId,
  expectedRevision:snapshot.revision,sequence:snapshot.nextSequence,
  command:{kind:'advance',ticks:4}};
const advanced = await sendOperation(originalCommand);
const sameAcknowledgement = await sendOperation(originalCommand);
```

These two sends use different A2A message/task identifiers while preserving the original complete application command. The retained sequence/payload returns the original acknowledgement without advancing again. New commands use a freshly inspected revision and exact nextSequence. Matching retained replay precedes freshness checks; conflicting/gap/discarded stale sequences refuse. Multi-tick success advances revision once. Admission and annotation can change world revision without consuming a world-command sequence.

WorldCreate accepts key 1..64 characters, uint32 seed, and optional affinity structural/neutral. Omitted affinity means structural. Identical normalized configuration returns the current snapshot; a different configuration conflicts in the same Runtime. Neutral scoring uses distance only; structural scoring adds bounded operation-role overlap, gesture and source diversity. Neither determines typed offspring compatibility. Imported adults start energy 60 with participation disabled. `worldInspect` and frames are passive; social time requires explicit advance commands 1..4.

The complete offspring input has ordered `{artifactId,intentHash}` parents, compose/mate/merge/body recipe, uint32 nonce, closed mutation style, and manual or pairing origin. Intent pins are canonical companion SHA256 or null only for absent companions; do not invent hashes. The [ranch guide](SDK-RANCH-GUIDE.md) supplies executable parents and pin construction. With a complete manual input:

```js
const prepared = await sendOperation({operation:'offspringPreview',input});
if (prepared.result.status !== 'ready') {
  throw new Error(JSON.stringify(prepared.result.diagnostics));
}
const c = prepared.result.candidate;
await sendOperation({operation:'offspringFrame',input,candidateId:c.candidateId,
  childSourceHash:c.childSourceHash,phase:0,options:{budget:4000,crests:2}});
const originalAdmission = {operation:'offspringAdmit',input,
  candidateId:c.candidateId,childSourceHash:c.childSourceHash,
  target:{kind:'library'},requestId:'a2a-manual-birth-1'};
const admitted = await sendOperation(originalAdmission);
const sameBirth = await sendOperation(originalAdmission);
const evidence = await sendOperation({operation:'lineage',
  artifactId:admitted.result.artifactId,limit:16});
// Only this separate explicit request evaluates the child's task:
const executed = await sendOperation({operation:'run',artifactId:admitted.result.artifactId});
```

Preview/frame are stateless and store no child or lineage. Frame and admission rebuild from complete input and verify candidateId and childSourceHash. A semantic preview refusal has `result.status:'rejected'` in a successfully completed A2A task; completion is not evidence that a candidate is ready or admitted. Frame phases are finite within ±1e9, options budget 4000..24000 and crests 2..4. Mutation overrides require all six integer traits in −1000..1000 and mutation none.

For world birth, choose a recipe explicitly after obtaining a live proposal. Build parents from its ordered artifact/intent pins, pairing origin `{kind:'pairing',worldId,proposalId,parentResidents,epochs}`, and target `{kind:'world',worldId,expectedRevision}`. Reciprocal courtship creates only a proposal. Admission rechecks fresh source/intent/epoch pins, participation, adulthood/rest, energy≥50 each, half-open expiry, geometry and resources. It consumes once, charges 30 each, inserts one disabled energy 40 child for 200 nursery ticks, and advances revision once. Pending proposal parents recover during cooldown. Withdrawal/retirement/annotation cancels affected links; re-enabling never revives a proposal. Another admission key cannot reuse a consumed proposal.

After a lost response, send the original complete admission requestId/payload or world sequence/payload, including its old expected revision. A new messageId/taskId is a transport identifier, not an application retry key. Changing revision, recipe, target or identities under a successful key conflicts. Exact successful admission replay returns its saved acknowledgement before rebuild/freshness. There is no A2A message deduplication for `run` or `reproduce`; resending them creates fresh execution.

`lineage` is a session-local flat append-order query, limit 1..32 default 16, with numeric nextCursor. It is distinct from A2A ListTasks and its opaque signed cursor. Source heredity parent hashes assert ancestry; session derivations preserve admitted construction evidence, while verified replay still requires exact parents and companions. A source recovered into a fresh Runtime does not restore omitted thought/units, external lineage or old execution records. Explicit `annotate` data is `{operation:'annotate',artifactId,intent}`; only absent/identical exact graph-matching metadata is accepted, and affected world pins/epochs invalidate atomically. The same staging applies to first companion attachment by compile of recovered source. Compound birth and metadata enrichment advance the public world revision once.

## Results, identity, and execution

The response is an A2A task carrying a structured artifact whose data is `{operation, result}`. Each task uses the stable result-container ID `quineling-result`; a follow-up replaces that container, so a successful result supersedes the earlier clarification payload. Successful requests complete the task. A `clarify` result interrupts it with `TASK_STATE_INPUT_REQUIRED`; `unsupported` or `inconsistent` rejects it with `TASK_STATE_REJECTED`. The structured result retains status and diagnostics with no created artifact. Read `result.status` before treating creation as successful. Typed `compile` returns the artifact directly as `result`, rather than a creation-status wrapper.

The A2A result artifact is a protocol container. Its `artifactId` identifies that container inside the A2A task. The nested Quineling artifact `id` identifies canonical source using SHA-256. A2A task ID, context ID, and message ID are separate identifiers. Preserve the returned runtime `artifact.id` for `inspect`, `run`, and `frame` requests, and the returned execution record `id` for `reproduce.recordId`.

Thought, typed intent, contract, and source map are companion metadata; they do not change source identity. If the same canonical source is already stored with an intent, submitting a different companion intent raises `metadata-conflict` rather than overwriting the existing interpretation. Use separate Runtime instances to retain both interpretations. Recovering source into a fresh Runtime restores the program without those omitted companions; recovery into a Runtime that already knows the source returns its retained artifact.

Creation constructs validated source and authored anatomy without executing the program. Inspection and frame sampling are observations. `run` executes explicitly; `reproduce` verifies the specific parent record and performs a fresh child execution. A reproduced source must match exactly, while execution records have their own identity and parent lineage. Actions supported by the kernel registry are simulations, not external world actions.

The runtime defaults to at most 128 artifacts and 256 execution records in memory; its constructor allows bounded overrides. A full store rejects new entries with `resource-limit`; it does not silently evict retained entries. Process restart loses those entries. Artifacts also have a32 MiB aggregate budget including companions/genomes. Ranch stores cap one world/1 MiB snapshot,32 residents/nursery 8/pairs 16/proposals 16, candidates 2 MiB, derivations 32 KiB each/128 entries/4 MiB total, admission receipts 128 without eviction, world receipts 256, events 256, and acknowledgements 4 KiB. Required timers/counters stop at 1e6. Full ledgers refuse new admission without partial charges or artifact enrichment. These are Runtime limits, separate from A2A task history. Source and genome exports can recover a validated program; they do not recover omitted thought provenance or historical execution records. A reproduction request must use a currently retained record associated with that exact artifact/source.

## Lifecycle and errors

Malformed JSON and oversized HTTP bodies fail before dispatch (400/413). The executor creates an initial task, then validates message role/content and runtime arguments. Failures at that stage, including unknown runtime artifact/record references, produce `TASK_STATE_FAILED` with a status message rather than a success artifact. Runtime errors retain their structured `{code,message,path}` at `task.status.message.metadata.quinelingError`, including in later `GetTask` responses. A malformed role/part envelope on an existing interrupted task leaves it `TASK_STATE_INPUT_REQUIRED`, allowing a corrected follow-up; a valid envelope that fails runtime validation still produces a failed task. Unknown A2A task IDs and terminal cancellation use SDK semantic errors. These identifiers must remain distinct.

The implementation uses `AgentExecutor`, `DefaultRequestHandler`, and `AgentEvent` from `@a2a-js/sdk/server`. Each invocation publishes an initial task before updates. JSON-RPC mounting uses `jsonRpcHandler({requestHandler, userBuilder})`; discovery uses `agentCardHandler({agentCardProvider})`. SDK error classes come from `@a2a-js/sdk/errors`.

A retained clarification response can be continued with a new message ID and the same task/context. Previous user and agent messages remain in the task history, including unsuccessful message attempts. Send a complete replacement thought or structured request: the executor does not merge partial data or infer omitted arguments. On entering `TASK_STATE_INPUT_REQUIRED`, it releases active execution state and the SDK event bus; follow-up and cancellation are reconstructed from retained task storage. Streaming uses `client.sendMessageStream(request)` and yields SDK `StreamResponse.payload` values (`task`, `statusUpdate`, `artifactUpdate`, or `message`). The artifact arrives before the terminal/interrupted status. Cancellation can win before synchronous dispatch or while a clarification task remains retained; once bounded synchronous evaluation or admission commit begins, it is not interruptible or reversible by cancellation. Disconnecting does not establish cancellation. Runtime admission stages source, lineage, world, both charges and acknowledgement before one synchronous store swap; this is in-memory atomicity, not crash durability or cross-process serialization. Response serialization or A2A task-storage failure can occur after a Runtime mutation committed. Preserve and retry original application keys as above; the adapter itself has no message deduplication.

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

On 2026-10-04, native `SendMessage` envelopes were exercised through an ephemeral loopback service using actual SDK source: all eight ranch operations, the build/ranch/execute discovery skills, stateless frame budget 4000, exact admission/command retries with new transport message IDs, lineage/annotation, and a separate composed child run returning `{allocated:12,remaining:8}` passed. This supplies same-SDK HTTP payload evidence; it does not establish independent-language interoperability or remote deployment.
