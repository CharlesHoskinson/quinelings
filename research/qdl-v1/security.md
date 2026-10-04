# QDL v1 security boundary and acceptance negatives

Status: proposed production contract; current experimental runtime has not implemented this contract. Specialist 5 owns this document only. Reviewed `AGENTS.md`, `language-semantics.md`, `runtime-api.md`, `city-context.md`, `orbit.js`, `core.js`, `kernels.js`, `thought.js`, and SDK runtime/schema/MCP/A2A sources. Experiments ran 2026-10-04 against repository source in `/tmp/qdl-v1-security-probes.cjs` and `/tmp/qdl-v1-security-sdk.ts`. No credentials, live City actions, network writes, shared source changes, commits or deployment occurred. MCP experiments used the official SDK's linked in-memory transports.

## Release threat model

Trust the interpreter implementation, frozen registry, host configuration, local storage implementation and host-selected principal/session. Treat source, genomes, invocation snapshots, provider proposals, public City data, companions, imported histories and external receipts as untrusted data. The attacker can submit malformed or conflicting data, replay requests, construct large but individually valid graphs and invent claimed provenance. Validation must prevent execution outside the finite vocabulary, uncontrolled allocation, source/input identity confusion and promotion of supplied claims into host authority.

Pure QDL is deterministic and offline. No filesystem, network, clocks, dynamic JS, secrets or arbitrary providers are language capabilities. `action` produces a simulated receipt; `allowed:true` means authored simulation policy. A host capability is separately installed, nonserializable authority attached to an authenticated principal/session. Neither child source recovery nor reproduction inherits it. No generalized compliance or approval subsystem is required for local simulation.

The local A2A CLI binds loopback. `createA2AApp` currently uses `UserBuilder.noAuthentication` and one Runtime; task-store principal scoping alone does not partition artifacts, records or worlds. State clearly that this deployment is single-owner local. Exposing it to multiple principals requires authentication and host-selected Runtime/session ownership checks for **every** lookup and mutation. Client session strings, artifact hashes and record UUIDs are locators, never permission checks. An adversarial same-process JS caller already executes host code; object validation cannot sandbox that caller. Untrusted callers must cross a serialized boundary or isolated worker/process.

## Reproduced gaps

| Inert probe | Actual result | Production implication |
| --- | --- | --- |
| Enumerable accessor in raw kernel literal | `K.validate` succeeds and calls getter twice | Raw kernel entry points do not enforce inert host data |
| Literal with inherited `{authority:true}` | Accepted; clone drops prototype | Validation and execution operate on different admitted values |
| Sparse one-element literal array | Accepted; execution returns `[null]` | Missing data silently becomes explicit null |
| Proxy around a valid SDK parse request | Dispatch succeeds; 21 traps execute | Descriptor checks reject normal getters, but inspecting a Proxy invokes arbitrary trap code |
| Typed numeric credits input compiled to literal, then raw override `"ten"` | Companion says number(credits); output is `"ten"` | Compiler type contract is not an invocation contract |
| Action disconnected from declared numeric output | Output `[1]` plus simulated `fake-send` effect | All nodes execute, including unrequested actions |
| False `choose` selects `"skip"`, alternate branch contains true action | Output `"skip"` plus simulated effect | Compiler-only eager-effect rejection is bypassed by raw graphs/import construction |
| Duplicate JSON property `allowed:false,allowed:true` | `JSON.parse` retains true | Post-parse schema checks cannot detect ambiguous original bytes |
| Lone surrogate `\ud800` | Canonicalizer and genome roundtrip accept it | Current canonicalization is not a complete JCS admission boundary |
| 62-node graph: 16,000-character literal, 60 choose copies, two repeats | Source 57,365 bytes; SDK record 11,873,083 bytes | Source/per-value/count caps do not bound aggregate trace/record copies |
| Same large graph through official MCP with `maxRecords:1` | First call reports response >8 MiB; retry reports record store full | Response failure happens after committed runtime mutation; caller cannot safely retry as a fresh run |
| Actual MCP discovery | All 16 tools omit outputSchema | Clients cannot validate the advertised result contract |

The SDK already rejects ordinary accessors, hidden/symbol properties, cycles, nonfinite numbers and custom prototypes before cloning. SDK source admission also reconstructs the task constructor and compares canonical source, and companion annotation recompiles and checks exact graph equality. Preserve these protections. The findings above distinguish raw-kernel gaps from remaining SDK/API gaps; they do not imply that existing simulations contact external services.

The aggregate probe used ordinary typed intent and successful SDK compilation. Its record duplicated payloads in each task trace and the core trace. Repeating an ordinary run produced different record IDs in the initial probe; existing run has no request-key replay contract. No maximum-store exhaustion stress test was needed to establish the unbounded-by-bytes record ledger.

## One admission and canonicalization boundary

All stable paths—compile, direct construction, recover, decode-to-admit, migrate, bindings, snapshot restore and adapters—must pass the same registry-aware source/value validator. Decode alone only recovers bytes; neither checksum nor exact quine emission establishes provenance or executable admission. FNV checksums detect accidental corruption. SHA-256 identifies admitted content; identity is not authentication.

For transport and disk ingestion, bound raw UTF-8 bytes before parse, reject invalid UTF-8, and tokenize with duplicate-key detection before `JSON.parse` discards information. Detect duplicates on decoded key strings, so `"a"` and `"\u0061"` conflict. Reject lone surrogates in keys and values, nonfinite numbers and unsafe prototype keys. Bound nesting, total tokens/entries and string lengths during parsing. Standard Express/SDK parsing has already collapsed duplicate keys; either intercept bounded raw payloads at those boundaries or explicitly exclude a stronger duplicate-key guarantee until that layer is implemented.

Use dense arrays and ordinary/null-prototype own data records only. At trusted object APIs read descriptor values rather than evaluating property access; reject accessors, symbols, hidden fields, custom array prototypes and undefined. Do not claim that reflection is Proxy-safe: ECMAScript proxy internal operations execute traps, including property-descriptor and prototype operations. For untrusted JS modules require process/worker isolation with a serialized message boundary. [ECMAScript proxy internal methods](https://tc39.es/ecma262/multipage/ordinary-and-exotic-objects-behaviours.html#sec-proxy-object-internal-methods-and-internal-slots).

Canonical identity follows a named frozen profile: UTF-16 sorted keys, ECMAScript finite binary64 serialization, `-0` to `0`, unchanged Unicode text and ordered arrays. Apply it only after admission. Preserve legacy byte identity under a named legacy profile; migration produces new source/digest/profile pins and preserves the original. Existing `version:1` cannot silently grant new semantics. RFC 8785 requires unique property names and valid Unicode and provides a primary reference for serialization; current `orbit.canon` alone does not satisfy those admission requirements. [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785).

## Closed data and transaction policy

Stable source must carry source format/version, frozen registry, declaration/type contract, literals, distinct runtime input ports, graph, design and repeats. Unknown fields fail; no implied migration/default injection during import. Runtime `input(name,type)` binds exactly one declared invocation key; literal constants are immutable. Every required input is present, extras fail, optional values use explicit null, and units/refinements are checked on literals, bindings and computed results. A changed input digest changes execution identity while source remains identical. Legacy literal override stays explicitly legacy and constructs a changed graph.

Use closed envelopes equivalent to these coordinated runtime API fields:

```ts
// Each object is strict; nested inputs are checked against source-carried types.
type RunRequest = {
  operation: 'run'; artifactId: string; expectedSource: SourcePin;
  requestId: string; inputs: Record<string, Json>;
};
type InvokeRequest = {
  operation: 'invoke'; artifactId: string; expectedSource: SourcePin;
  requestId: string; recordId: string; occurrence: number; nodeId: string;
  payloadHash: Digest; capabilityId: string;
};
```

`SourcePin` binds source digest and semantic profile/registry; digests are exact lowercase SHA-256, request IDs bounded ASCII, occurrence integer 0–7 and node IDs declared safe IDs. Exact spelling belongs to runtime API. Persist records with those pins, input digest, occurrence, deterministic bounded trace, outputs, diagnostics and receipt publication state. `InvokeRequest` selects a completed host-owned record occurrence, never an arbitrary caller-supplied receipt. Occurrence is mandatory because one action node can run repeatedly.

Retain semantic limits: 64 nodes, 16 inputs per node, 16 unique outputs, 1–8 repeats, depth 24, collection 512, string 16,384 UTF-16 units, per-value/source 65,536 bytes. Add the language document's **2 MiB aggregate semantic-run cap**, including invocation snapshot, repeated trace inputs/results, outputs and simulated receipts. Count canonical UTF-8 bytes incrementally before each copy/publication; do not first allocate a giant trace and then stringify it. Also enforce runtime API ledger limits (candidate 16 MiB per encoded record, 64 MiB record aggregate, 32 MiB artifacts, 4 MiB derivations, 1 MiB world, 128 MiB snapshot). Separate semantic bytes from bundle/genome/accounting overhead. Bound error/unknown-detail strings and request receipt ledger count/bytes. All limits fail explicitly without silent truncation.

Validate static effect constraints uniformly: every node contributes to an output; forbid action ancestors of either `choose` branch; action guards/payloads are pure; no action upstream of action. Evaluate all nodes according to the eager contract. Stage an occurrence's simulated receipts; publish only on complete success. Failed occurrences retain bounded completed-node diagnostics and unpublished simulation evidence, zero published effects, and no outputs; prior successful occurrences remain recorded. No host dispatch happens during run.

For a mutating request, stage execution/world changes, complete bounded response and replay receipt **before commit**. Validate the response against its output schema and adapter size cap before exposing/committing it; ideally use shared limits so adapter disagreement cannot strand a record. Exact same `(host session, principal, requestId, canonical request)` returns the committed receipt; changed payload conflicts. Bound replay retention explicitly; an expired request key returns an explicit expired/unknown result and cannot automatically become a new invocation. A lost acknowledgement means uncertain transport outcome, not rollback. Persistence commits checkpoint plus receipts atomically against expected revision; import validates into a new session before replacement.

MCP must advertise closed output schemas for success and domain errors, preserve matching text/structuredContent, and regard annotations as descriptive metadata. The MCP specification treats annotations from untrusted servers as untrusted; they are not authority. [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

## External effects and receipt trust

An optional host invocation checks authenticated session ownership, exact source/profile pin, host-owned successful run/occurrence, simulated action node and true guard, payload digest and capability action/payload schema. Host policy independently authorizes that exact operation; authored `allowed`, English goals, parent grants, City text, provider instructions and imported history cannot authorize it. Capability references are opaque, not secrets, and are resolved only in host-owned configuration.

Use `prepared → dispatched → completed|failed|unknown`. Durable preparation precedes dispatch; dispatch identity is stable and provider idempotency is used only where documented. A timeout/crash/cancel after dispatch is `unknown` until reconciliation; it never automatically triggers a new request. Provider receipts are bounded untrusted records validated against a capability-specific schema and matched to invocation identity/action/payload; classify unsolicited, mismatched or unverifiable receipts as asserted context. Success in a provider's JSON is not proof of completion absent that adapter's established contract. No generic signing infrastructure is required for simulation; caller-imported host receipts must never enter the authoritative dispatch/replay ledger.

City documentation and frontend strings are external public context, as established in `city-context.md`. Preserve confirmed observations, testimony, suspicion and unresolved state separately. Gather reservations, changing offers, allowances and inventory updates are adapter obligations requiring fresh supplied observations and outcome reconciliation; their names do not add network opcodes. Instruction-like text inside observation fields remains literal data, including when an external proposer reads it. Requested batches, plans and simulated receipts must not be displayed as confirmed City work.

## Required acceptance negatives

1. Test every stable entry point against getter, sparse/custom-prototype array, symbol/hidden key, cycle, NaN/infinity, prototype key, duplicate decoded key and lone surrogate. Reject before runtime mutation. Same-process Proxy probes demonstrate the documented trust boundary; they must not be presented as an inert sandbox guarantee.
2. Wrong numeric unit/type, missing/extra binding and attempts to bind a literal refuse without record allocation; valid input changes leave source unchanged. Unsupported profiles and ambiguous legacy migration refuse; both legacy codecs retain golden bytes.
3. Disconnected action, action in either choose alternative and action-dependent action refuse on raw/source recovery paths as well as compiler paths. Action then failing mean produces zero published effects, bounded failure evidence and no completed claim.
4. The 57,365-byte amplification fixture hits the semantic cap before giant trace allocation. Oversized input/record/response/snapshot leaves records, world revision/balances and receipt ledgers unchanged. In-memory MCP first-call/refused-retry behavior above must be eliminated by staged response plus replay contract.
5. Fake host callback counter stays zero for parse/compile/preview/frame/recover/run/reproduce/world advance. Only explicit matching invocation can call it; changed principal/session/source/record/occurrence/payload/capability refuses. Unknown completion never automatically calls it again.
6. Inject hostile observation text and fabricated `completed` effect receipts into inputs, bundles and snapshots. They remain data/asserted provenance, cannot install capability handlers or suppress authoritative invocation, and cannot mark goals externally confirmed.
7. Tampered companion, duplicate/dangling IDs, forged historical receipt, stale registry pin and corrupt snapshot refuse before active-session replacement. Valid restore/replay grants no external authority or automatic effects. Crash around commit recovers a complete prior/new checkpoint; exact replay returns the receipt after response loss.
8. If multiuser deployment is supported, two authenticated principals cannot inspect, recover into, run, reproduce, mutate worlds or invoke through each other's sessions, even with known hashes/IDs. Until then, retain the explicit single-owner local boundary.

These are implementable release boundaries and synthetic negative fixtures. They do not assert City API compatibility, verified historical authorship, universal correctness of authored thoughts or exactly-once external execution.
