# Quinelings MCP guide

The experimental `@quinelings/agent-sdk` exposes bounded thought compilation, authored anatomy, explicit simulated execution, source recovery, and numeric animation frames through MCP. QDL remains experimental; the package revision does not freeze the language. The adapter uses a process-local artifact and execution-record store. Restarting it discards that store.

## Start the local adapter

From the checkout, install and build the SDK:

```bash
cd packages/agent-sdk
npm ci
npm run build
node dist/mcp-cli.js
```

The CLI is an MCP stdio process. Start it through an MCP client; it is not an interactive terminal program. Configure the client with the Node executable and an absolute path to `packages/agent-sdk/dist/mcp-cli.js`. The package also declares a `quinelings-mcp` binary. No registry publication or deployment is implied by building locally.

The exported `createQuinelingMcpServer(runtime = new Runtime())` factory is intended for applications that own the SDK transport and runtime lifecycle. Import it from `@quinelings/agent-sdk/mcp`. The CLI supplies the stdio transport. Stdout carries protocol messages; diagnostics belong on stderr. [MCP stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

`@quinelings/agent-sdk/schema` exports `JsonSchema`, `IntentTypeSchema`, `IntentStepSchema`, and `IntentSchema`. These recursive Zod schemas expose nested types, units, ordered input counts, and closed operation parameters in `tools/list`. Applications can validate proposal structure with `IntentSchema.parse(proposal)`. Schema parsing does not execute kernels. `JsonSchema` rejects nonfinite numbers, arrays or records with more than 512 entries, and values nested beyond 24 levels. `IntentSchema` also checks the depth of the complete intent envelope; wrapping a value adds levels. `tools/list` exposes recursive type references and the record/array size limits; depth is enforced by a Zod refinement and the compiler. `Runtime.compile` additionally checks references, acyclicity, units, operation refinements, the combined node count, and source budgets.

## Tool catalog

| Tool | Arguments | Purpose |
| --- | --- | --- |
| `quineling_parse` | `{thought}` | Return supported intent or explicit clarification, unsupported, or inconsistent status. |
| `quineling_compile` | `{intent, options?}` | Compile an explicit typed intent into a stored artifact. |
| `quineling_create` | `{thought, options?}` | Parse a bounded recipe and build it when supported. |
| `quineling_inspect` | `{artifactId}` | Read a stored artifact and its companion information. |
| `quineling_run` | `{artifactId}` | Execute the stored source and add a fresh record. |
| `quineling_reproduce` | `{artifactId, recordId}` | Verify the parent's emitted source, reconstruct a child, and execute it. |
| `quineling_recover` | Exactly one of `{source}`, `{harmonics}`, `{colors}` | Recover and store source from one exact representation. |
| `quineling_frame` | `{artifactId, phase, options?}` | Obtain deterministic numeric tissue, normals, ownership, and ridges. |

`options` on create/compile accepts `seed` and `repeats`. The seed is an unsigned 32-bit integer; repeats is 1–8 and defaults to 1. An omitted seed is derived deterministically from the graph. Frame options are `budget` (4,000–24,000, default 12,000) and `crests` (2–4, default 3), both integers. MCP `phase` is a finite raw phase value within ±1,000,000, not wall-clock time. Use `tools/list` to inspect the running adapter's schemas.

## Build, inspect, then execute

The following are `tools/call` parameter objects; the MCP client supplies initialization and JSON-RPC request IDs.

```json
{
  "name": "quineling_create",
  "arguments": {
    "thought": "[2,3,4] | square | sum | report total",
    "options": {"seed": 17, "repeats": 1}
  }
}
```

A supported creation supplies an artifact containing canonical `source`, `program`, `graph`, authored `design`, harmonic and color genomes, and available companion intent/contract/source mappings. Use the returned artifact's `id` as `artifactId`; do not generate an ID from its title.

```json
{"name":"quineling_inspect","arguments":{"artifactId":"<returned artifact.id>"}}
```

Creation validates and stores the artifact. It does not execute the task. Execute deliberately:

```json
{"name":"quineling_run","arguments":{"artifactId":"<returned artifact.id>"}}
```

The execution record contains an `id`, `artifactId`, exact `source`, and `result`. For this one-cycle example, `result.tasks[0].output` is `[{"total":29}]`. `result.emitted` contains the exact canonical source. A second run creates another record even if its source and outputs are identical.

To verify and run a fresh child from that record:

```json
{
  "name":"quineling_reproduce",
  "arguments":{
    "artifactId":"<returned artifact.id>",
    "recordId":"<returned execution record.id>"
  }
}
```

Reproduction returns `{artifact,record}`. An exact quine's child retains its source identity; the child execution is fresh and its record names `parentRecordId`. Supplying a record for another source fails. Reproduction includes execution, so call it only when a fresh simulated task cycle is intended.

## Interpretation results and errors

Results use `structuredContent.result`; a JSON text block mirrors the same envelope for clients that consume text. MCP structured results are server data rather than model-generated schema-constrained text. [MCP tool results](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

Parse statuses have distinct meanings:

| Status | Client behavior |
| --- | --- |
| `supported` | Inspect the proposed intent and assumptions; compile or create explicitly. |
| `clarify` | Request the missing data or a complete supported recipe. |
| `unsupported` | Explain the named capability obligation; no artifact exists. |
| `inconsistent` | Correct the supplied plan/data using diagnostics. |

These statuses are interpretation results. They must not be mistaken for successful task execution. Parse diagnostics include `code`, `path`, and `message`. Domain failures such as invalid compilation, missing artifact IDs, or corrupted genomes use `isError: true` and `structuredContent.error`, mirrored as JSON text:

```json
{"error":{"code":"unknown-artifact","path":"$","message":"Artifact is not in this runtime"}}
```

MCP argument-schema failures usually happen before the tool handler and may have SDK-generated text without this structured envelope. If the handler’s own defensive schema check rejects an input, it returns structured `invalid-input` with the first issue’s path. Runtime domain errors preserve their original `code`, `path`, and `message`. Unknown tools and malformed protocol requests can produce protocol errors. Check `isError`, structured error data, text, and protocol failures; do not retry an unchanged invalid request indefinitely.

For example, `"make my city happy"` needs clarification, `"monitor continuously and send email"` is unsupported, and `"[] | mean"` is inconsistent. The adapter does not invent supplied data or quietly substitute another task.

## Recovery and animation

MCP recovery arguments contain exactly one representation. The advertised object schema includes `oneOf` alternatives requiring `source`, `harmonics`, or `colors`; the SDK and handler both reject missing or multiple encodings. Use actual artifact fields:

```json
{"name":"quineling_recover","arguments":{"source":"<artifact.source>"}}
```

Alternatively send `{"harmonics": <artifact.harmonics>}` or `{"colors": <artifact.colors>}` as the arguments. The SDK's generic `dispatch` API nests these inside `recovery`; the MCP tool uses the three fields directly. Byte encodings recover executable source and authored design. They do not recover original English, types, units, or external notes that were stored only as companion information. Source checksums detect encoding corruption; semantic validation remains necessary.

```json
{
  "name":"quineling_frame",
  "arguments":{
    "artifactId":"<returned artifact.id>",
    "phase":0.5,
    "options":{"budget":4000,"crests":2}
  }
}
```

Frames contain numeric arrays, not images: `points`, `normals`, `owners`, `ridges`, and `nodeIds`. The same authored source, phase, and options produce the same geometry. Frame seeking does not run the task, create an execution record, or change source identity. Renderers should treat owner indices as references into `nodeIds`. Start with a modest sample budget because JSON geometry can be large.

## Identity, limits, and effects

Artifact IDs identify SHA-256 canonical source. Thought, units, and provenance are companion evidence and need separate interpretation: two companion documents may describe the same executable source. A stored artifact keeps its first companion metadata. Compiling different intent for an existing source with companion intent returns `metadata-conflict`; use separate runtime sessions to preserve both interpretations. Recovering into a fresh runtime supplies no companion intent. Source equality proves exact program identity within this runtime, not fidelity to arbitrary English or a frozen cross-version semantics contract. An artifact's available `contract.sourceBytes` measures its complete canonical source in UTF-8 bytes, including authored anatomy.

The default runtime stores at most 128 artifacts and 256 execution records. A full store rejects new entries rather than evicting existing evidence. The framework additionally bounds graph nodes, task repeats, anatomy, finite JSON, and the complete canonical source to 65,536 bytes. MCP handlers check parsed request JSON against 4 MiB and each success result envelope against 8 MiB; these are handler limits rather than transport-wide preparse limits. Export source/genomes when the client needs recovery across process restarts.

The handler checks the MCP request’s cancellation signal before dispatch. A request already cancelled at that point returns a `cancelled` error when the transport still accepts a response, and performs no compilation, admission, or execution. The MCP SDK may discard a cancelled request’s response entirely. Once synchronous kernel work starts, it runs to completion; cancellation cannot interrupt it midway.

The response-size check follows the runtime call. An oversized response can therefore fail after a run has created a record; an error or timeout does not establish nonexecution. Repeating `run` or `reproduce` requests another fresh simulated execution.

All `action` results are local simulation receipts. Their names and `allowed` parameters do not authorize email, filesystem changes, network calls, purchases, or deployment. MCP hints describe actual store effects: parse/inspect/frame are reads; compile/create/recover store artifacts; run/reproduce add execution records. Clients should treat annotations as advisory. [Official tool annotations](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.ts).

## Validation

Run package verification from `packages/agent-sdk`:

```bash
npm run typecheck
npm test
npm run build
```

The MCP integration tests cover discovery with resolved recursive schemas, exactly-one recovery, independent task outcomes, quine and codec recovery, direct structured error paths, JSON depth/record bounds, an actual stdio exchange, and a same-turn call/cancellation pair that consumes no execution-record slot. Package tests separately cover frame determinism and store isolation/capacity. The [MCP boundary review](../research/sdk-sol-3.md) records the detailed acceptance matrix and remaining design risks; it distinguishes requested coverage from tests actually executed.
