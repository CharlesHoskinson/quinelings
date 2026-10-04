# Quinelings developer branding and onboarding

Tagline: **Living Thoughts**

Status: developer copy and documentation recommendations, 2026-10-04. This report changes no implementation or public documentation. Current SDK behavior and proposed QDL v1 behavior are separated below. Read the repository `AGENTS.md` and `docs/PROGRAM-CONTRACT.md` (the contract is in `docs/`, not the repository root).

## Developer promise

Lead with the work an agent can author and the evidence a developer can inspect. The moving body is the invitation; the source, operation graph and explicit execution record make it useful.

Ready-to-apply SDK landing copy:

> Quinelings
>
> Living Thoughts
>
> Give an agent's declared task an executable, inspectable body. Compile a bounded recipe or typed plan, inspect its source and operation graph, then run it explicitly and check the result. Quinelings connect through a TypeScript SDK, MCP tools and an A2A adapter.
>
> The SDK is experimental. Its programs compute over supplied data; action receipts are local simulations. A thought is a public declaration authored by an agent or developer.

Use “declared task” in the current first sentence because the current SDK's `thought` is a string accompanied by an executable plan. “Declared thought” can describe that public authored material, provided the page explains where it is retained. Avoid making the tagline sound like a claim of consciousness, extracted hidden reasoning or autonomous external action.

Ready-to-apply README introduction:

> Quinelings are bounded executable programs with animated mathematical bodies. An agent supplies an explicit recipe or typed intent; the compiler produces a task graph, authored anatomy and recoverable canonical source. Developers can inspect each operation, run the task on its source-authored data, and verify a fresh copy against a retained execution record.
>
> Original thought text, units and assumptions are companion metadata in the current SDK. Save the complete artifact when those declarations matter. Source and exact genomes preserve the executable program and authored design; recovering them into a fresh runtime does not restore omitted companions or historical runs.

Evidence: [README](../../README.md), [SDK README](../../packages/agent-sdk/README.md), [artifact and intent types](../../packages/agent-sdk/src/types.ts), [runtime implementation](../../packages/agent-sdk/src/index.ts).

## Ready-to-apply first successful task

Suggested quickstart heading: **Declare a task. Inspect the source. Run it.**

Introductory copy:

> Start with one finite calculation: square 2, 3 and 4, then add them. The expected total is 29. Creation builds the artifact; the separate Run call evaluates its task and records the result.

Build instructions for the existing checkout, using Node.js 22 or later:

```sh
cd packages/agent-sdk
npm ci
npm run build
npm run typecheck
npm test
node examples/basic.mjs
```

Save the following as an `.mjs` file inside `packages/agent-sdk` and run it with `node`. A consumer that has installed the built local package or downloadable tarball can replace `./dist/index.js` with `@quinelings/agent-sdk`. The package is not currently published to npm; do not use an unqualified registry-install command as the first step.

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
const created = runtime.create('[2,3,4] | square | sum | report total');
if (created.status !== 'supported') {
  throw new Error(JSON.stringify(created.diagnostics));
}

const artifact = runtime.inspect(created.artifact.id);
console.log(artifact.source);
console.table(artifact.graph.nodes.map(({ id, op, inputs }) => ({ id, op, inputs })));

const record = runtime.run(artifact.id);
assert.deepEqual(record.result.tasks[0].output, [{ total: 29 }]);
assert.deepEqual(record.result.emitted, [artifact.source]);

const copy = runtime.reproduce(artifact.id, record.id);
assert.equal(copy.artifact.source, artifact.source);
assert.equal(copy.record.parentRecordId, record.id);
assert.deepEqual(copy.record.result.tasks[0].output, [{ total: 29 }]);
```

Follow the example with this copy:

> Inspect shows the source, graph, design and available companions. Run returns ordered task outputs, traces and simulated receipts. Reproduce uses the matching parent record to construct and execute a fresh copy; it checks exact source emission and the task outputs against that record. The copy keeps the source identity and receives a fresh execution identity.

Do not shorten the last statement to “copy without execution.” Current `reproduce` explicitly executes. Likewise, passive creation can perform bounded pure validation calculations; “does not execute the task or perform actions” is more accurate than “does no computation.”

Evidence: [quickstart](../../docs/sdk-quickstart.md), [asserted basic example](../../packages/agent-sdk/examples/basic.mjs), [runtime `run` and `reproduce`](../../packages/agent-sdk/src/index.ts).

## Declare a useful typed program

Suggested second tutorial: **State the data and its units.**

Ready-to-apply introduction:

> Agents can supply a typed intent directly. Declare the data, ordered operation inputs and requested outputs. The compiler checks the bounded plan, including its types and symbolic units. A unit label records the intended quantity; it does not convert units or verify a real-world measurement.

```js
import assert from 'node:assert/strict';
import { Runtime } from './dist/index.js';

const runtime = new Runtime();
const artifact = runtime.compile({
  format: 'quineling-intent',
  name: 'Water total',
  thought: 'Add the supplied water quantities in litres.',
  inputs: [{
    id: 'water', value: [2, 3, 4],
    type: { kind: 'array', element: { kind: 'number', unit: 'L' } },
  }],
  steps: [{ id: 'total', op: 'sum', inputs: ['water'], params: {} }],
  outputs: ['total'],
});

assert.deepEqual(runtime.run(artifact.id).result.tasks[0].output, [9]);
console.log(artifact.contract?.types.total);
```

Follow with:

> These input values become source-authored literals. The current SDK's `run(artifactId)` accepts no invocation bindings. Changing supplied values means compiling another program. Thought text and unit types remain companions; retain the complete artifact to retain that interpretation.

Use increasing task complexity: total → guarded allocation → route preview → provenance-aware evidence → bounded retry interpretation. Existing gallery examples support concrete demonstrations of resource conservation, ordered routing and uncertain outcomes. Each walkthrough should include a hand-derived expected result and an edge case, such as no route or an unknown outcome. Label all City-like inputs as simulated fixtures.

Handle text proposals explicitly: `supported` contains an artifact; `clarify`, `unsupported` and `inconsistent` contain diagnostics without one. Thrown runtime errors are a separate path. A `ProposalProvider` can supply a broader model-generated typed plan, but the host supplies the provider and its model connection; the SDK bundles neither a model client nor credentials. Compiler acceptance establishes admissibility, not agreement with every sentence of the request.

Evidence: [typed intent and proposal examples](../../docs/sdk-quickstart.md), [program contract](../../docs/PROGRAM-CONTRACT.md), [SDK types](../../packages/agent-sdk/src/types.ts).

## Agent connection copy

Ready-to-apply MCP connection paragraph:

> Launch the built MCP adapter with `node /absolute/path/to/packages/agent-sdk/dist/mcp-cli.js`. It exposes sixteen tools. Start with `quineling_create` or `quineling_compile`, inspect the returned artifact with `quineling_inspect`, and call `quineling_run` explicitly when you want an execution record. Read `isError` before consuming `structuredContent.result`; a successful creation response still requires `result.status === 'supported'`.

The original eight tools are parse, compile, create, inspect, run, reproduce, recover and frame, each prefixed `quineling_`. The additions are `offspring_preview`, `offspring_frame`, `offspring_admit`, `lineage`, `annotate`, `world_create`, `world_inspect` and `world_command`, with the same prefix. Keep the first tutorial focused on the build/inspect/run sequence; link to the ranch guide for composition and social commands.

Example tool arguments after extracting the actual runtime artifact ID:

```json
{"name":"quineling_create","arguments":{"thought":"[2,3,4] | square | sum | report total"}}
```

```json
{"name":"quineling_inspect","arguments":{"artifactId":"<returned artifact.id>"}}
```

```json
{"name":"quineling_run","arguments":{"artifactId":"<returned artifact.id>"}}
```

The placeholders are instructions to substitute returned IDs, not runnable artifact identifiers. MCP SDK/protocol validation can return an error without the runtime's structured domain envelope; do not promise that every rejected call contains `structuredContent.error`.

Ready-to-apply A2A connection paragraph:

> From the built package directory, `node dist/a2a-cli.js` starts a loopback A2A service at `127.0.0.1:8049`. Discover it at `/.well-known/agent-card.json`. The card advertises build, ranch and execute skills. Send one text part to create a proposal, or one JSON data part containing an explicit operation. Creating, inspecting and sampling remain passive; `run` and `reproduce` request task execution.

Native A2A 1.0 request example for `POST /a2a/jsonrpc`, with `Content-Type: application/json` and `A2A-Version: 1.0`:

```json
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

Read the result container's `{operation,result}` data and its creation status. Keep runtime artifact IDs, execution IDs and A2A task/message/container IDs distinct. Native SDK objects use protobuf union wrappers; use the documented codecs rather than posting those objects directly. Native REST and configurable legacy JSON-RPC compatibility are documented separately. Describe this as an implemented adapter with repository test evidence, not independently certified protocol conformance.

The default service shares an unauthenticated local Runtime. Remote or multi-user hosting requires host authentication and principal-scoped runtime access. Source IDs identify content; they grant no access authority. Repeated Run/copy requests create fresh executions. Ranch admission/commands have application retry keys: after a lost response resend the original complete payload and key, even with a new A2A message ID.

Evidence: [MCP implementation](../../packages/agent-sdk/src/mcp.ts), [MCP guide](../../docs/sdk-mcp-guide.md), [A2A guide](../../docs/sdk-a2a-guide.md), [runtime/API research](runtime-api.md).

## Current behavior versus QDL v1 proposals

| Topic | Current experimental SDK | Proposed QDL v1 direction |
| --- | --- | --- |
| Public thought | String in typed intent; companion metadata | Structured bounded observations, evidence, goals, decisions, plans and tasks carried in source |
| Input values | Typed intent values compile into literals; SDK Run takes an artifact ID | Source-declared typed runtime ports, with invocation data recorded separately |
| Meaning pin | Source ID hashes canonical source; current markers remain experimental | Explicit source profile and frozen semantic registry/canonicalization pins |
| Recovery | Exact source and authored design; fresh recovery loses omitted companions and historical records | Recovery of source-carried declarations/types; session restoration remains a separate contract |
| Copy | Fresh explicit execution using a retained matching record | Pure constructor reproduction separate from bound task execution |
| Persistence/retries | Bounded in-memory runtime; keyed ranch admissions/commands | Candidate durable Session/receipt/snapshot interfaces and retryable execution |
| Actions | Local simulated receipts | Simulation-only release is viable; real effects require a separate authorized host boundary |

QDL v1 research does not yet settle all API details. `runtime-api.md` sketches `apiVersion:'1.0'`, optional defaults and a Session execution wrapper; `language-semantics.md` recommends required typed ports without defaults; `compatibility.md` sketches `apiVersion:1` and a separate `./v1` export. Do not merge these into an apparently implemented signature. Publish them as design questions until the owner freezes the contract.

Ready-to-apply future-design callout:

> Under review: QDL v1 would carry an agent's bounded public declaration and typed input contract in source. A run would bind a finite observation snapshot while preserving the program's source identity. This profile and its SDK interfaces are proposals; the current quickstart uses the experimental Runtime.

Do not provide a “runnable v1 quickstart” using invented Session imports, declaration fields or runtime bindings. Keep future source diagrams explicitly labeled conceptual. Proposed standard-library names such as `evidenceFresh` and `reconcile` also remain candidate names, despite isolated reference-fixture evidence.

Evidence: [semantics candidate](language-semantics.md), [API candidate](runtime-api.md), [compatibility candidate](compatibility.md), [stdlib candidate](stdlib.md), [formal acceptance plan](formal.md), [security boundary](security.md).

## Names, document order and claim limits

Use the product name **Quinelings**, singular **a Quineling**, tagline exactly **Living Thoughts**. Keep `Runtime`, `Intent`, artifact, execution record, source and genome consistent with the implementation. Introduce “constructor quine” after the first successful example: “a program that constructs and emits its own canonical source.” Preserve current package/import/tool identifiers; branding is no reason to rename working APIs.

UI/documentation labels: **Declare task**, **Build**, **Inspect source**, **Run task**, **Verify copy**, **Recover source**, **View recorded result**. Add “runs a fresh copy” alongside Verify copy. Reserve **Runtime inputs**, **Source-carried declaration** and **Stable QDL v1** for the future profile. In ranch docs use **Preview composition**, **Admit offspring** and **Advance social time**; admission is not task execution and a courtship proposal is not a compiled child.

Recommended documentation order:

1. Product promise, experimental status and the total-29 quickstart.
2. Typed plans, diagnostics and explicit provider integration.
3. Source/companion/run identity and exact recovery.
4. MCP/A2A connection recipes, followed by error and retry behavior.
5. Ranch composition and session lineage, as a separate advanced guide.
6. Clearly labeled QDL v1 design and implementation acceptance gates.

Ready-to-apply claim limits:

| Use | Avoid |
| --- | --- |
| “Compile a bounded declared task” | “Turn any thought into a correct program” |
| “Inspect source, operation ownership and recorded values” | “See what an AI is secretly thinking” |
| “Verify this copy's canonical source and task outputs” | “Prove the agent's intention is true” |
| “Recover source from full harmonic data or exact RGB records” | “Recover code from a screenshot or video” |
| “Run a local simulated action” | “Repair a real City lamp” |
| “Read session construction evidence” | “Authenticate ancestry from parent hashes” |
| “Experimental SDK with tested adapters” | “Stable QDL 1.0” or “fully verified interoperable runtime” |
| “Lean lemmas and bounded Quint models cover stated obligations” | “The entire JavaScript implementation is formally proved” |

Avoid “autonomous” in onboarding unless a host explicitly implements orchestration. Animation, replay, source recovery and ranch ticks do not invoke tasks. Body ownership exposes structure; a silhouette alone is not a source decoder. Units check symbolic compatibility, not physical conversion. Simulated evidence/consensus summarizes supplied assertions, not authenticated external truth.

## Evidence and follow-up edits

Direct local verification during this assignment used the existing built `dist/index.js`, without rebuilding, changing shared files, starting a transport server or taking external actions. Passed: total 29; typed litre sum 9; exact constructor emission; matching fresh copy and parent-record link; source, harmonic and color recovery in separate runtimes with no companion intent; expected clarify/unsupported/inconsistent parser statuses. The repository's basic example also passed. This is focused runtime evidence, not a fresh full-suite or transport-conformance run.

Concrete documentation corrections for the owning integrator:

- `docs/sdk-quickstart.md`, “Connect an agent”: replace the eight-tool total with sixteen and link the ranch additions. Its original-eight list is useful when labeled as the core lifecycle.
- Put the companion-metadata boundary immediately below the first example and in the recovery section, before readers infer that the tagline promises full thought recovery.
- Give each build/inspection control a passive description and each Run/copy control an explicit execution description.
- Separate current installation instructions from any prospective npm release or `./v1` entry point. Keep the experimental status on SDK and language landing pages.
- Keep formal guarantees attached to their precise theorem/model/test scope and recorded implementation evidence.

Only this assigned report was written. No production documentation correction above has been applied.
