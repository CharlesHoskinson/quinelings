# Quinelings Agent SDK

A TypeScript interface for bounded thought programs, source-authored mathematical bodies and constructor quines. The SDK and QDL are experimental; current package and source markers do not freeze the language.

```ts
import { Runtime } from '@quinelings/agent-sdk';
const runtime = new Runtime();
const created = runtime.create('[2,3,4] | square | sum | report total');
if (created.status === 'supported') {
  const record = runtime.run(created.artifact.id);
  console.log(record.result.tasks[0]?.output); // [{ total: 29 }]
  const child = runtime.reproduce(created.artifact.id, record.id);
  console.log(child.artifact.source === created.artifact.source); // true
}
```

`create`, `compile`, `inspect`, `recover` and `frame` do not execute tasks. `run` and `reproduce` explicitly execute; all current effects are local simulations. A `ProposalProvider` can propose typed data for broader English goals; every supported proposal is checked by the same compiler. Aborting a pending proposal rejects with `cancelled` even if its provider ignores the signal; late completion admits no artifact. Providers must still cancel their own I/O or remote work. No model credential or model client is bundled.

Exports:

- `@quinelings/agent-sdk`: `Runtime`, `QuinelingError`, typed intent/requests/results, recipes.
- `@quinelings/agent-sdk/schema`: strict recursive JSON and intent Zod schemas.
- `@quinelings/agent-sdk/mcp`: `createQuinelingMcpServer` and stdio CLI `quinelings-mcp`.
- `@quinelings/agent-sdk/a2a`: `createA2AApp`, `BoundedTaskStore`, `QuinelingExecutor` and CLI `quinelings-a2a`.

Node.js 22+; ESM and TypeScript declarations. `npm ci && npm run build && npm run typecheck && npm test` in this package builds and verifies the checkout. Then run `node examples/basic.mjs` for an asserted total-29 calculation and source-matching copy. Install a built directory or the downloadable tarball; this package has not been published to npm.

Start MCP with `node dist/mcp-cli.js`. Start the loopback A2A server with `node dist/a2a-cli.js`; discovery is `http://127.0.0.1:8049/.well-known/agent-card.json`. The adapter uses official MCP and A2A SDKs. Public/multi-user hosting requires the embedder's authentication and per-session runtime isolation.

Artifact IDs hash complete canonical source. Execution IDs identify individual runs. Returned data are detached snapshots. Typed interpretation metadata is a companion to the quine; persist complete artifacts when it matters. Genome recovery in a fresh runtime has no companion metadata. A matching `compile` or supported `create` can explicitly attach the first companion to the recovered source while retaining its ID. Re-admitting the same intent keeps the first companion and source map; a different intent for identical source throws `metadata-conflict` without overwriting it. Regenerating the same source requires matching compiler behavior, seed and repeat choices. Intent equality uses canonical JSON, not semantic normalization: equivalent unit spellings and omitted versus empty assumptions can still conflict. Formatting a source export is allowed: recovery canonicalizes JSON and validates the constructor.

`frame` takes phase in radians, with a `2π` gesture cycle and a direct-runtime bound of `|phase| ≤ 1e9`. Returned `points` groups are `[x,y,z,alpha]`, normals are `[nx,ny,nz]`, and each sample owner indexes parallel `nodeIds`, `nodeRoles` and `nodeColors` arrays. Role colors honor source strength and neutral ink. The SDK frame has no recorded scalar-lens selector and does not report a measured result.

Stores are bounded (128 artifacts, 256 records by default), reject additions when full, and grant no external authority. A2A task history is separately bounded; paused clarification tasks expire or may be evicted, while active work is protected. Known field-path failures return `QuinelingError`.

Lean lemmas and bounded Quint models are separate from SDK/browser tests. They do not prove arbitrary English meaning, beauty, protocol conformance or the complete JavaScript runtime and codecs. Source equality and output checks establish the particular verified copy, not agreement with all companion prose.

Guides and visual workspace: https://charleshoskinson.github.io/quinelings/sdk.html
Source and tests: https://github.com/CharlesHoskinson/quinelings/tree/main/packages/agent-sdk
