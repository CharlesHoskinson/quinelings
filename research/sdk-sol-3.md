# Agent SDK MCP boundary review

Scope: MCP tool boundaries, annotations, schemas, errors, and integration coverage. This review owns this file and `docs/sdk-mcp-guide.md`; adapter implementation belongs to the integration agent. QDL and the package remain experimental. No language-version freeze, deployment, or live-world action is implied.

## Framework evidence

`thought.js` parses bounded recipes and typed `quineling-intent` documents. Its four parse states are `supported`, `clarify`, `unsupported`, and `inconsistent`. It compiles units, ordered ports, finite JSON, reachability, refinements, and effect guards. Compilation can evaluate pure kernels for refinement checks; it does not invoke action kernels or execute the resulting quine. `verify-thought.cjs` independently checks these boundaries.

`core.js` wraps a graph plus authored design in a constructor quine. Canonical source, harmonic bands, and exact RGB strands are recoverable encodings. `execute` is a finite interpreter, not a host JavaScript evaluator. `action` receipts are local simulations. `anatomy.js` supplies ownership validation and deterministic bounded geometry; animation phase does not enter authored source.

The selected SDK adds a bounded process-local store: 128 artifacts and 256 execution records. Artifact IDs identify SHA-256 canonical source. Companion intent/types are not embedded in source, so identical executable source may have distinct explanations or units. Source identity therefore cannot stand in for companion identity or semantic proof.

## Selected MCP tools

Keep eight narrow tools mapped directly to `Runtime` methods. Avoid a generic operation dispatcher as the public MCP surface; separate names expose each input schema and effect boundary.

| Tool | Input | Result | Boundary |
| --- | --- | --- | --- |
| `quineling_parse` | `thought` | `ParseResult` | Interpret; store nothing. |
| `quineling_compile` | `intent`, optional `options` | `Artifact` | Validate typed meaning, generate authored anatomy, store source. |
| `quineling_create` | `thought`, optional `options` | `CreationResult` | Parse and compile only supported intent; no execution. |
| `quineling_inspect` | `artifactId` | `Artifact` | Return stored source and companion evidence. |
| `quineling_run` | `artifactId` | `ExecutionRecord` | Explicit finite execution and a new record. |
| `quineling_reproduce` | `artifactId`, `recordId` | `{artifact,record}` | Recover the indicated parent's emitted child and explicitly run it. |
| `quineling_recover` | Exactly one of `source`, `harmonics`, `colors` | `Artifact` | Validate one encoded representation and store the recovered artifact. |
| `quineling_frame` | `artifactId`, `phase`, optional `options` | `Frame` | Sample authored geometry without task execution. |

Do not add file paths, URL fetches, shell commands, provider credentials, deployment, timers, live events, or executable host callbacks to this tool surface. Provider proposals must pass through typed compilation. `frame` returns numeric geometry rather than a screenshot or performance claim.

`reproduce` requires a stored record associated with the specified source. A record from another artifact must fail before child execution. A child record names its parent record. Returning the same source ID is expected for an exact quine; it does not mean the parent execution record was reused.

## Annotations

Annotations describe adapter behavior, including the store, rather than only the underlying pure function. The protocol defines these as hints, not enforcement. [Official annotation definitions](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2025-11-25/schema.ts).

| Operations | `readOnlyHint` | `destructiveHint` | `idempotentHint` | `openWorldHint` |
| --- | --- | --- | --- | --- |
| parse, inspect, frame | true | false | true | false |
| compile, create, recover | false | false | true | false |
| run, reproduce | false | false | false | false |

Idempotency means environmental effects, not byte-identical output. Duplicate source admission preserves first metadata; conflicting companion intents reject with `metadata-conflict`. Capacity rejects rather than silently evicting. If either behavior changes, revise the hints. A future external executor needs separate tools and authority contracts; a simulated action string grants no authority.

## Schema and result contracts

The adapter exposes closed top-level objects, explicit required keys, and bounded scalar options. `seed` is a uint32; `repeats` an integer 1–8; MCP `phase` finite within ±1e6; `budget` an integer 4,000–24,000; `crests` an integer 2–4. Seed defaults to a graph-derived uint32, repeats to 1, budget to 12,000, and crests to 3. MCP recovery accepts exactly one top-level `source`, `harmonics`, or `colors`, never ambiguous precedence. Only the SDK dispatch request uses a nested `recovery` object.

Inline transport schemas or local `$defs`; do not require clients to fetch `quinelings.local` schema IDs. Nested arbitrary JSON must still pass semantic finite-JSON checks. JSON Schema alone cannot establish graph acyclicity, unit agreement, ownership partitioning, source-byte ceilings, safe refinement arithmetic, or emitted-source equality. Preserve the shared validators as the authority.

The exported `@quinelings/agent-sdk/schema` module supplies recursive Zod schemas for finite JSON, nested intent types, operation-specific steps, and complete intent. Tool discovery includes exact ordered port counts, unit fields, closed params, and resolvable local recursive references. Schema parsing is structural; graph and semantic checks remain in `Runtime.compile`.

The adapter uses structured success results wrapped as `{result: <SDK response>}` and mirrors their JSON in one text block. It currently advertises no output schemas. If added, validate complete envelopes for each operation, including failure variants. Structured content and output-schema behavior follow the [MCP tools specification](https://modelcontextprotocol.io/specification/2025-11-25/server/tools).

A non-supported parse or creation is a successful interpretation result with an explicit status, diagnostics, and no artifact. A tool failure such as a missing artifact, invalid typed plan, or corrupted encoding should set `isError: true` and return actionable diagnostics. Unknown tool names and malformed MCP envelopes belong to the protocol error layer. SDK argument-schema rejection may also happen before a handler; tests should assert actual wire behavior rather than invent a uniform domain envelope.

The adapter's handler failures return `{error:{code,path,message}}` in structured content and mirrored JSON text, with `isError: true`. Compiler failures preserve the diagnostic path and use the SDK category `invalid-intent`; parse results retain original compiler diagnostic codes. Structural schema rejection is owned by the MCP SDK and may expose only error text. Distinguish validation, missing references, capacity, corruption, and internal failures. Avoid stack traces and dumping submitted source into error text. Never silently convert unsupported intent to a nearby executable task, discard invalid fields, or report recovered intent notes as source-authenticated.

## Resource policy recommendations

The core 65,536-byte source limit applies to the complete canonical quine, including duplicated constructor payload and authored anatomy. The adapter checks parsed handler input against 4 MiB and serialized success JSON against 8 MiB. These checks occur after protocol parsing, and response checks occur after the runtime call. Also bound incoming encoded JSON, decode work, companion data, outgoing geometry, stored records, and aggregate memory. Maximum counts alone do not bound aggregate bytes. Do not truncate source/genomes or return partial geometry as a complete frame. The artifact contract's `sourceBytes` now measures complete authored source UTF-8 length.

Prefer stdio for the initial local adapter. Reserve stdout for protocol frames and stderr for diagnostics. Use the official SDK's transport and lifecycle rather than implementing newline framing manually. Streamable HTTP, authentication, session isolation, Origin validation, and rate limiting are separate hosting work. [Official transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports).

Synchronous bounded calls need no advertised task capability, resource subscription, roots capability, elicitation, or sampling. Do not advertise dynamic tool-list changes for a static catalog. If cancellation cannot preempt synchronous work, document that limit and retain bounded execution; a timeout does not establish nonexecution.

## Integration acceptance matrix

These are implementation requirements and review cases, not a claim that all already pass.

| Test | Evidence required |
| --- | --- |
| Discovery | Initialize an actual SDK client/server pair; exactly eight tools; valid object schemas; correct annotations. |
| Wire result | Success `structuredContent.result` and handler failure `structuredContent.error` agree with parsed JSON text; failures have `isError`; advertised output schemas, if added, accept complete results. |
| Supported pipeline | `[2,3,4] \| square \| sum \| report total` produces an artifact without running; explicit run produces `[{total:29}]`. |
| Parse states | Ambiguous English clarifies; continuous email goal is unsupported; empty mean is inconsistent; none produces an artifact. |
| Typed meaning | Units mismatch, reversed ports, invalid fields, disconnected graph, cycles, unguarded/eager-effect branches, and unsafe numeric refinement reject. |
| Source identity | Same intent and seed yield exact same source ID; changed authored seed/design changes source; animation phase and execution do not. |
| Companion identity | Differing units/thought with the same graph do not silently replace existing provenance. |
| Explicit execution | Parse/create/compile/inspect/recover/frame do not invoke task or action execution; run and reproduction do. Pure refinement evaluation is allowed. |
| Simulated guard | Blocked route returns a skipped receipt and zero effects; open route emits exactly one simulated effect per task cycle. |
| Fresh child | Reproduce from an actual matching record; check exact canonical emission, identical source, expected child output, and `parentRecordId`. Reject stale/foreign IDs. |
| Recovery | Source, harmonic, and RGB recovery agree on source; checksum, padding, palette drift, noncanonical genome text, mixed representations, and invalid AST reject. Source-string import canonicalizes JSON formatting. |
| Mutation isolation | Mutating returned artifacts, records, or frame arrays cannot mutate the store or invalidate later inspection. |
| Geometry | Fixed phase/options produce finite arrays, coherent lengths, valid owner indices, and no execution records; minimum/maximum budgets accept and out-of-range values reject. |
| Capacity | Exact artifact/record limits are observable; overflow returns a diagnostic without silent replacement, execution, or partial state mutation. |
| Lifecycle | Real stdio subprocess initializes, lists, calls, and closes; stdout contains only MCP messages; invalid call does not kill subsequent valid calls. |
| Packaging | Built CLI and exported factory work outside repository cwd; bundled framework does not depend on source-tree absolute paths. |

Use independently specified outputs rather than deriving expected values from `Runtime.run`. Exercise both in-memory SDK transport and built subprocess transport. Keep a small smoke test runnable from the documented package scripts; test runtime resource limits at the shared SDK layer and transport shape at the adapter layer.

## Integration risks to resolve

1. Content-keyed artifacts preserve first evidence and reject differing intent when both carry companion intent. Supporting several interpretations in one session would require explicit variant identity; recovery followed by compilation currently retains the first artifact without adding intent.
2. Capacity checks happen before task execution, but response-size checks follow runtime mutation. A failed transport result can follow a stored execution; do not describe all errors as nonexecution.
3. `frame` typed-array conversion can materially enlarge payloads; bound serialized transport size, not only point count.
4. Recovery validates semantic/source structure as well as byte integrity. A checksum is not a proof that an arbitrary decoded AST is an allowed task quine.
5. Local annotation hints must match store mutations. Repeated explicit runs add records and are not idempotent.

The companion [MCP guide](../docs/sdk-mcp-guide.md) uses the selected names and types. It should be checked against the final adapter before integration sign-off.

## Verification performed

The guide's supported recipe produced independently expected `[{total:29}]` using the shared compiler and kernel runtime. Its ambiguous, unsupported, and inconsistent examples returned the documented statuses. `node --import tsx --test test/mcp.test.ts` passed all three tests after the schema and error changes: the full lifecycle over paired official SDK transports, source CLI stdio including structured domain errors, and exported recursive schemas. Discovery checks that every generated recursive reference resolves and that all 24 operations expose their closed params and ordered inputs. This does not establish the entire acceptance matrix or a built-package subprocess check.

The implementation now preserves first source mappings, rejects companion intent collisions, reports complete authored source bytes, and carries structured error categories and paths. Remaining limitations include response-size checks after runtime mutation, original compiler error categories grouped under `invalid-intent`, and canonicalization of source-string input while genome recovery validates canonical encoded text.
