# Agent library review and resolution

The experimental library was designed and documented by five Sol 6.1 reviewers, inspected by five native AGY Gemini 3.1 Pro reviewers and five native Grok 4.7 reviewers, then corrected and tested by the integration team. Reviews are observations of an evolving tree, not independent certifications of the final build. The [execution ledger](../research/sdk-council-execution.json) records the actual model routes and report files. Early unsupported, permission-blocked and timed-out attempts are not counted as completed reports.

## Findings resolved in implementation

| Finding | Resolution and independent evidence |
| --- | --- |
| Optional success payloads and vague operation parameters | Status-discriminated parse/create results, per-operation parameter unions and ordered input tuples. `test/type-contract.ts` is checked by the separate TypeScript test configuration. |
| Untagged responses | Generic `dispatch` preserves request-specific return types; `exchange` supplies an operation-tagged union. The legacy broad `Response` alias remains an aggregate type; use `exchange` when retaining heterogeneous responses. |
| Lost provider source maps and mutable internal state | Validated maps name actual operations; private stores return detached snapshots. Mutation and invalid metadata regression tests check source and result isolation. |
| Provider cancellation waiting forever | Cancellation rejects even if the provider ignores its signal; late completion cannot admit an artifact. The provider itself may continue external work. |
| Companion interpretation overwritten or lost after recovery | First supplied companion is retained; conflicting companion produces `metadata-conflict`. A metadata-free recovered source can acquire its first explicitly supplied validated companion. This attachment does not establish authorship or English fidelity. |
| Source and intent size errors disagree | Complete constructor source is bounded at65,536 UTF-8 bytes, with `source-budget` retained across compiler errors. Runtime intent admission measures canonical JSON at 128 KiB and returns `resource-limit`; MCP delegates this policy. Regression fixtures cover both graph/preflight overflow and valid large source recovery. |
| Vague error paths and noncanonical stored AST | Finite-JSON checks report nested field paths; frame controls identify their fields. Stored and executed ASTs are parsed from canonical source; fresh copies are parsed from the verified emission. |
| Large authentic RGB genomes rejected | Validation visit budget accommodates authentic near-limit genomes. A >40KiB complete source is recovered through its exact RGB genome. |
| Unbounded sample-plan memoization | At most two cached plans per compiled body. A heap-retention regression varies30 budgets, checks the bound and rebuilds an evicted plan. Per-frame geometry bounds do not prove cache behavior. |
| Opaque MCP typed intent discovery | Full recursive types, units, 23 operator schemas, closed parameters and exact port arities. Official client discovery and validation tests check references and passive rejection. |
| MCP cancellation/recovery/schema diagnostics | Pre-dispatch cancellation, exactly-one recovery discovery and structured runtime/schema diagnostics are checked against the actual adapter. Synchronous computation cannot be interrupted after dispatch. |
| A2A clarification capacity exhaustion | Paused tasks release executor state/event buses; retained paused tasks can expire or be evicted.140 clarification requests no longer prevent a fresh valid request. |
| A2A task-store update, continuation and paging problems | Atomic failed saves preserve existing rows; scoped active protection; raw text parity; retained follow-up transcript; replacement result artifacts; chronological timestamp filters and eviction-safe scoped cursors. Tests use native HTTP plus direct store boundary checks. Listing remains a live view, not a snapshot or exactly-once delivery guarantee. |
| A2A failed task hides error fields | Failed-task metadata retains `quinelingError` with code/message/path, including later retrieval. |
| Duplicated modules and incomplete build/package | Shared ESM chunks, clean cwd-independent build, all exports/bin/type targets verified. An actual tarball is installed into an isolated consumer and all public entry points imported. |
| Stale or untested onboarding | Four implementation-aligned guides, package README and shipped example. Documentation authors executed their fenced examples and strict TypeScript snippets; protocol tests use official clients. |

## Findings clarified rather than adopted

Companion equality is deliberately equality of supplied canonical JSON, not inferred semantic equivalence. Rewriting unit notation, adding an omitted assumptions array, changing whitespace in the original thought, or changing claims can therefore conflict even when executable source matches. Reuse the stored companion unchanged or use another Runtime. Normalizing different interpretations silently would lose what the author actually supplied.

An A2A request containing `intent:123` cannot bypass the Runtime validator: it is rejected before compilation or execution. A cast in transport code does not itself admit executable input. The direct negative regression checks this boundary. Several reports described TypeScript ergonomics or omitted implementation refinements as violated Lean theorems; those properties were never claimed as existing Lean theorems.

A2A `statusTimestampAfter` is inclusive according to the [published A2A 1.0 protocol](https://a2a-protocol.org/v1.0.0/specification/#314-list-tasks). Chronological comparison is corrected, but an audit suggestion to make it strict was rejected. Listing order and cursor tie handling follow the protocol's descending status timestamp contract.

The root `npm test` exercises the browser/interpreter modules. `npm run sdk:check` separately typechecks, builds and tests the agent library; the publication gate runs both, all formal gates and isolated package installation. A type-only contract belongs in the TypeScript checker, not a runtime import.

## Scope of the evidence

Lean kernel-checks 176 exported project theorems without sorry placeholders or project axioms. Exact schema endpoint checks cover 42 legacy numeric controls plus 36 assembly endpoints. These facts do not establish the full TypeScript compiler, JSON parsers, task store, JavaScript floating-point renderer, arbitrary English interpretation or visual beauty.

Quint explores separate design, creation and agent-session transition abstractions. Creation's eight-energy/three-child limits bound model exploration; the website does not impose those session limits. The SDK has 35 passing tests, including 12 A2A and six MCP tests. The creation workspace has 47 browser checks; the collection and translation retain their separate browser gates. Browser checks, direct runtime tests, protocol tests and package tests provide implementation evidence. Public multi-user deployment, external action authority, durable persistence, cross-language A2A conformance and cryptographic authenticity of a genome remain outside the local adapter contract.

QDL is still experimental. This delivery does not freeze a stable language version.
