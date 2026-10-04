# Quinelings Agent SDK Audit Report (Specialist 3: MCP/A2A)

The following report identifies actionable bugs and interoperability issues related to MCP/A2A tool schemas, annotations, cancellation, and task artifacts. I have executed the test suite (`npm run typecheck` and `npm test` passed) and verified the findings independently.

## Finding 1: Denial of Service due to Clarification Task Leak in A2A Executor
**Severity:** High
**Exact File/Line:** `packages/agent-sdk/src/a2a.ts`, lines 65, 81-82
**Concrete failing scenario:** An A2A client submits ambiguous thoughts (e.g., `"make my city happy"`) that result in a `clarify` status. The `QuinelingExecutor` sets `state.running=false` and publishes `TASK_STATE_INPUT_REQUIRED`, but intentionally omits `this.pending.delete(taskId)`. Because the SDK does not yet implement a resumable continuation flow, these tasks remain stuck in `this.pending` forever. Once 128 such requests accumulate, `if (this.pending.size>=128 && !this.pending.has(taskId))` becomes true. Every subsequent legitimate execution request is rejected with `RequestMalformedError('Too many interrupted tasks')`, permanently locking the executor until the process restarts.
**Recommended fix:** Delete the task from the `pending` map even when the status is `clarify`, since continuations are not promised. Change line 81 to:
```typescript
if(resultStatus==='clarify') {
  state.running=false;
  status(TaskState.TASK_STATE_INPUT_REQUIRED,'The thought needs clarification; no task was executed.');
  this.pending.delete(taskId);
}
```
**Independent verification:** Verified by code inspection of `QuinelingExecutor.execute`. `this.pending.delete(taskId)` is only called in the `else` block (for `unsupported`, `inconsistent`, or successful creation), leaving `clarify` tasks effectively leaked.
**Lean invariant / Quint lifecycle:** Cancellation and task artifacts / Lifecycle limits (Bounded capacity must not permanently block valid execution).

## Finding 2: Undiscoverable Intent Schema in MCP Compilation Tool
**Severity:** Medium
**Exact File/Line:** `packages/agent-sdk/src/mcp.ts`, line 58
**Concrete failing scenario:** A new MCP client connects to the adapter and requests the tool catalog (`tools/list`). It attempts to discover how to construct a `quineling_compile` payload. However, because the tool schema defines `{ intent: z.unknown(), options }`, the client receives an empty object schema (`{}` or `{type: "object"}`) for the `intent` argument. The client is unable to discover the required properties (`name`, `thought`, `inputs`, `steps`, `outputs`) of the `quineling-intent` format, making the tool effectively unusable without out-of-band documentation.
**Recommended fix:** Replace `z.unknown()` with a fully specified Zod schema matching the `Intent` interface from `types.ts`. Include strict definitions for `inputs`, `steps`, and the discriminated `IntentType` unions.
**Independent verification:** Verified that `mcp.test.ts` passes the exact `proposal.intent` directly from `parse` to `compile`, bypassing the need to dynamically construct an intent based on the advertised tool schema. The server validates `intent` correctly via `T.compile`, but the boundary schema reflection is broken.
**Lean invariant / Quint lifecycle:** Tool/message schemas / Interface discovery (Clients must be able to reliably reflect schemas).

## Finding 3: Parameter Mismatch in MCP Recovery Tool
**Severity:** Medium
**Exact File/Line:** `packages/agent-sdk/src/mcp.ts`, line 81 and `docs/sdk-mcp-guide.md`, line 99
**Concrete failing scenario:** A developer consults `docs/sdk-mcp-guide.md` to recover an artifact. Following the guide, they send the documented JSON-RPC payload:
`{"name":"quineling_recover","arguments":{"recovery":{"source":"<artifact.source>"}}}`
The request fails immediately with an MCP protocol schema error. The `mcp.ts` schema enforces `z.strictObject` and expects `source`, `harmonics`, or `colors` directly at the root of `arguments` rather than wrapped inside a `recovery` object. 
**Recommended fix:** Update the `quineling_recover` tool registration in `mcp.ts` to expect a wrapped `recovery` object, aligning it with both the guide and the A2A implementation (`request.recovery`):
```typescript
{ recovery: z.strictObject({
    source: z.string().max(65536).optional(),
    harmonics: harmonics.optional(),
    colors: colors.optional()
}) }
```
Then map `input.recovery.source` in the handler. Alternatively, update the guide to document root-level arguments.
**Independent verification:** Verified that `mcp.test.ts` line 42 directly calls `arguments: { [encoding]: artifact[encoding] }` (e.g. `arguments: { source: ... }`), which avoids the `recovery` wrapper shown in the documentation and allows tests to pass.
**Lean invariant / Quint lifecycle:** Tool/message schemas / Protocol consistency (MCP wire schemas must align with documentation).
