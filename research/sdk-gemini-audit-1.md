I have completed the read-only inspection of the `agent-sdk` packages, type definitions, adapters, and corresponding documentation. Based on the Quint lifecycle semantics and the Lean invariants specified in the documentation (particularly the Type Review `sdk-sol-2.md`), here is the final audit report highlighting actionable API ergonomics issues, missing TypeScript discriminants, and caller mistake hazards.

### Quinelings Agent SDK Audit Report

#### 1. Missing Discriminated Result for Responses
- **Severity**: High (Ergonomics & TypeScript Types)
- **Exact File/Line**: `packages/agent-sdk/src/types.ts:75`
- **Concrete failing scenario**: An A2A or MCP client receiving a returned `Response` evaluates a structural union (`ParseResult | CreationResult | Artifact | ExecutionRecord | Frame`). Lacking a uniform literal discriminant like `operation` or `type`, callers must rely on fragile duck-typing like `if ('points' in result)` or `if ('record' in result)` to narrow the types. This disables safe TS control flow analysis and degrades downstream client experiences.
- **Recommended fix**: Re-declare `Response` explicitly as a discriminated union: `export type Response = { operation: 'parse', result: ParseResult } | ...`
- **Independent verification**: In `packages/agent-sdk/src/a2a.ts` lines 76-80, the adapter currently compensates by artificially wrapping the result into `{ operation: request.operation, result }`. Furthermore, it resorts to an unsafe string-based `'status' in result` check to guess the return state.
- **Lean Invariant / Quint Lifecycle**: Violates the **Stronger Discriminated Authoring Types** invariant (`sdk-sol-2.md`). Lean formalizations require strict inductive sum types (`Sum` / `Option`) to bind shape to intent; untagged structural unions obscure the state transition boundary.

#### 2. Incomplete Narrowing in State Results (`CreationResult`, `ParseResult`)
- **Severity**: Moderate (TypeScript Types)
- **Exact File/Line**: `packages/agent-sdk/src/types.ts:18` and `types.ts:31`
- **Concrete failing scenario**: A caller validates `if (result.status === 'supported')` expecting to access `result.artifact`. However, because the interface maps `artifact?: Artifact` optionally on the parent object, TypeScript still treats it as potentially `undefined`, forcing developers into `!` non-null assertions that obscure bugs when new states are added.
- **Recommended fix**: Migrate to a strictly discriminated sum type keyed on `status`:
  ```typescript
  export type CreationResult =
    | { status: 'supported'; artifact: Artifact; diagnostics: Diagnostic[]; assumptions: string[] }
    | { status: 'clarify' | 'unsupported' | 'inconsistent'; diagnostics: Diagnostic[]; assumptions: string[] };
  ```
- **Independent verification**: While `packages/agent-sdk/src/index.ts` returns the correct shape at runtime during `create()`, the public interface erases that coupling.
- **Lean Invariant / Quint Lifecycle**: Requires the **Stronger Discriminated Authoring Types** constraint, ensuring results mirror an `Except`/`Option` type coupling data guarantees strictly to their semantic success boundaries.

#### 3. Discarded `sourceMap` in Proposal Processing
- **Severity**: Moderate (Actionable Bug)
- **Exact File/Line**: `packages/agent-sdk/src/index.ts:86-89`
- **Concrete failing scenario**: A `ProposalProvider` analyzes a user thought, constructs an `Intent`, and carefully passes a mapped `sourceMap` linking the QDL intent back to English semantics. `Runtime.propose` uses `fields()` on line 86 to enforce that `proposal.sourceMap` is present, but directly ignores and drops this property on line 89 when executing the build, leaving the artifact only with the internal quine map.
- **Recommended fix**: Bind the provider's companion `sourceMap` onto the constructed `Artifact` prior to returning, identically to how it is handled in `Runtime.create`:
  ```typescript
  const artifact = this.compile(proposal.intent, config);
  artifact.sourceMap = copy(proposal.sourceMap);
  this.artifacts.get(artifact.id)!.sourceMap = copy(proposal.sourceMap);
  ```
- **Independent verification**: `fields()` explicitly validates `sourceMap` on line 86. The immediate return block on line 89 delegates to `this.compile(proposal.intent)` and completely strips the provenance.
- **Lean Invariant / Quint Lifecycle**: Breaks the **Source Association** tracking. Companion metadata and intent provenance represent important non-executable linkages to the external author context that must be conserved across the generation phase.

#### 4. Opaque MCP Tool Schema for `intent`
- **Severity**: High (Caller Mistakes / Ergonomics)
- **Exact File/Line**: `packages/agent-sdk/src/mcp.ts:40`
- **Concrete failing scenario**: A reasoning agent discovers the `quineling_compile` tool via MCP. Evaluating the JSON Schema, the agent sees `{}` (`z.unknown()`) for the required `intent`. Without structural LLM guidance for the deeply recursive `IntentType`, the agent guesses, sending a string or incomplete JSON object, reliably triggering immediate `invalid-intent` runtime execution faults.
- **Recommended fix**: Swap `z.unknown()` with a fully instantiated `z.strictObject()` mapping mirroring `IntentType` (using `z.lazy()` if recursive components persist).
- **Independent verification**: The schema registers strictly as `intent: z.unknown()`. MCP passes this verbatim to the LLM agent discovery payloads, masking the primary contract and blinding integration loops.
- **Lean Invariant / Quint Lifecycle**: Fails the **Stronger Discriminated Authoring Types** constraint on the protocol integration boundary. Valid Lean simulation requires caller inputs adhering to formalized graph specifications.

#### 5. Conflicting `thought` Length Limits (A2A vs Runtime)
- **Severity**: Moderate (Actionable Bug)
- **Exact File/Line**: `packages/agent-sdk/src/a2a.ts:56` and `packages/agent-sdk/src/index.ts:52`
- **Concrete failing scenario**: An automated caller submits a valid 20,000-character thought over A2A. The A2A adapter's check (`thought.length > 32768`) explicitly considers this safe and accepts the input, pushing it to `Runtime.dispatch`. The core runtime abruptly crashes the cycle with `invalid-input: Thought text must be 1 to 16384 characters`, forcing a reject onto a request that met the adapter's stated bounds.
- **Recommended fix**: Ensure boundary parity; restrict the validation limit in `a2a.ts` down to `16384` max bytes, unifying the behavior exactly as the `mcp.ts` adapter does.
- **Independent verification**: Tracing `a2a.ts:56` directly shows `throw new RequestMalformedError('Thought text needs 1–32768 characters')`. The central `Runtime.parse` enforces `16384`.
- **Lean Invariant / Quint Lifecycle**: Compromises the **Inconsistent Contract Boundary** rule ("Invalid build/import/run requests raise validation..."). Limits on literal bounds and strings are non-negotiable within the invariant space and must be perfectly symmetrical across transports.

#### 6. Blind Casts Bypassing Type Soundness
- **Severity**: High (Caller Mistakes / Diagnostics)
- **Exact File/Line**: `packages/agent-sdk/src/a2a.ts:59-62`
- **Concrete failing scenario**: A user pushes A2A JSON containing `{ "operation": "compile", "intent": 123 }`. The `a2a.ts` adapter evaluates the string operation but then invokes an unsafe type-cast `return value as Request`. `Runtime.dispatch()` executes `fields()` to test if the key `"intent"` merely exists, running zero type checks. `123` is dispatched into `this.compile`, causing severe runtime exceptions instead of returning clear, structural diagnostics.
- **Recommended fix**: Add stringent payload schema evaluation (`Zod` or similar runtime parsing) prior to invoking `Runtime.dispatch`, or rewrite `fields()` to validate type properties.
- **Independent verification**: `requestFromMessage` uses `value as Request` while `Runtime.dispatch` falls back exclusively to checking `keys.includes()`. No type-assertion boundary executes to defend the compiled operations against invalid sub-objects.
- **Lean Invariant / Quint Lifecycle**: Disobeys the central **Stronger Discriminated Authoring Types** principle. Evading type boundaries via blind memory casting permits non-canonical memory representations into strictly verified simulation pipelines.

*(A corresponding artifact of this report has been saved to `audit_report.md` for extended persistence).*
