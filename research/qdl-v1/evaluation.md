# QDL v1 evaluation and production acceptance

Status: release acceptance proposal, **not stable v1 certification**. Evaluation specialist ten; 2026-10-04. Scope is this report and independent `evaluation-fixtures.json`. No shared production edits, git operations, deployment, credentials, live City actions or workers. Read repository AGENTS/PROGRAM-CONTRACT, QDL v1 City context, semantics, runtime/API, stdlib, security, compatibility and formal reports; inspected `thought.js`, `kernels.js`, `core.js`, SDK runtime/MCP/build/package verification and runtime/MCP/A2A tests.

## Verdict and measured evidence

Current implementation remains an experimental legacy profile. Exact constructor reproduction and bounded local simulations work; they do not establish source-carried declared thought, typed reusable invocation ports, registry stability, factual observation truth, or safe result publication. A stable package version must identify precisely the stable profile and retain explicit legacy labeling.

Fresh local experiments used Node **v26.10.0**, repository source, on the above date. Commands `node verify-thought.cjs` (139 assertions), `node verify-runtime-boundaries.cjs`, and package-directory `node_modules/.bin/tsx --test test/runtime.test.ts test/mcp.test.ts test/a2a.test.ts` passed; the latter reported **27 tests, 27 passed, 0 failed**. These are legacy regression evidence. They do not execute the proposed new v1 grammar or registry. Node22 is not installed here; this specialist did not run Node22, actual browser or isolated installed-consumer checks. Existing `sdk-package-verification.json` records a Node26 legacy tarball check; it is prior evidence, not a new v1 result. The package build targeting `node22` is not execution on Node22.

| Independent probe | Observed result | Acceptance implication |
| --- | --- | --- |
| Compile `budget 5 for 12 credits`, construct source | 2,805 bytes; full thought and `credits` absent; companion registry `quineling-kernels-experimental` | Declared thought/types are not presently genome recoverable |
| Scalar literal 2, raw override `x:"ten"` | Ordered output `["ten"]`; numeric compiler companion is not consulted | No stable typed-port guarantee |
| Override budget literal | Resolved graph differs canonically from authored graph | Legacy overrides cannot stand in for source-preserving inputs |
| Three fresh execute/parse-emission generations | All three emissions equal initial source | Legacy constructor identity passes for this probe |
| False `choose` with true allowed action in other branch | Selected output is skip; one simulated local receipt still occurs | All nodes are eager; raw import must enforce the same effect rules as compiler |
| Action followed by `mean([])` | Throws `Mean requires values`, no error code/path/attached run record | Failed diagnostics and publication policy are missing at kernel boundary |
| Arbitrary wording `make my city happy` | `clarify` | This is not an executable task interpretation |
| Retry `retry,unknown,ok`, max3 | uncertain, attempts2, history retry/unknown | Existing bounded retry stops on unknown |
| Same source/claim true then false | supported, support1/refute0/sources1 | Legacy first-report policy differs from proposed freshness reducer |
| Official in-memory MCP discovery | 16 tools, zero `outputSchema` entries | Input schemas alone do not specify result conformance |

The separate MCP budget probe compiled a typed intent with two inputs (`text`: 16,000 ASCII x characters; `guard`: true), 60 `choose` steps, output `copy59`, and repeats2. Step `copy0` takes guard/text/text; each later step takes guard/previous/text. Name `Independent output budget`, thought `Copy finite local text only`. Source: **57,367 UTF-8 bytes**. Direct record JSON: **11,873,091 bytes**; `{result:record}`: **11,873,102 bytes**. Serializing the success envelope with the adapter's duplicated text and structured content would be **23,777,230 bytes**, before JSON-RPC framing. UUID values vary but their lengths do not.

Through the official client, with `new Runtime({maxRecords:1})`, first run returned resource-limit `MCP result exceeds 8 MiB; use a smaller frame budget or artifact.` The next run returned resource-limit `Execution record store is full; use a new Runtime`. This directly demonstrates a committed record behind an error response. No network/world effect was involved. MCP currently checks 4MiB request and 8MiB result text after Runtime dispatch; it does not bound the complete duplicated wire envelope at that threshold. The record ledger has a count cap, not aggregate byte reservation.

## Claims must be evaluated separately

1. **Wording proposal:** parser/provider status, explicit assumptions, clarification and source map. `supported` from a provider is an assertion. Neither a fluent explanation nor a semantically different but valid DAG earns interpretation credit.
2. **Compiler admission:** closed syntax, references, types/units/refinements, effects and resource bounds under the frozen registry. Validation establishes admissibility, not the author's English intent or supplied observations' truth.
3. **Task correctness:** exact independently supplied outputs, diagnostics, ordered traces and simulated effects for a finite snapshot.
4. **Recovery:** source-carried declaration, graph, types, policy and design survive both codecs and constructor reproduction. Source-only recovery must not obtain its authoritative declaration from a cached companion.
5. **World completion:** only admitted fresh supplied result evidence can support a checkpoint. This release performs local simulation; it has no measured live City completion rate.
6. **Presentation:** declared versus recorded versus stale/not-evaluated state remains visible. Frame/inspection/recovery/social ticks cannot execute tasks. Animation or reproduction cannot count as confirmation.

For arbitrary wording, freeze a reviewed benchmark of at least 16 clear, 16 ambiguous, 16 unsupported and 16 contradictory prompts, including paraphrases, negations, absent thresholds/units, copied testimony and stale claims. Assign expected status plus required clarification obligations before evaluating a proposer. Report the confusion matrix, unsupported-as-supported and ambiguous-as-supported counts, interpretation adequacy and compiler rejection separately. Require zero unsupported/ambiguous automatic execution and zero invented observations in the release set. Optional provider accuracy is measured independently; v1 can release without a universal English proposer. Do not reward invented defaults for making an ambiguity compile.

## Eight public City task classes

Domain requirements derive from captured official public documentation in `city-context.md`/`city-evidence.json`; they are synthetic evaluation requirements, not live API compatibility. No additional web browsing was needed to assess the local implementation. The public capture distinguishes static guidance from agent activity. The following benchmark requires at least three reviewed snapshots per class plus the shared mutation tests below. `evaluation-fixtures.json` contains 24 domain projections and six directly executable legacy-kernel oracles. Domain projections are **acceptance specifications**, not implemented recipes or evidence that the existing compiler accepts them.

| Class | Deterministic success expectation | Required refusal/edge cases |
| --- | --- | --- |
| Gather readiness | Fresh reachable eligible unreserved available node yields ready/proposal and at most one local receipt | Reserved/depleted or stale node yields ready false, no simulation; absent eligibility stays unknown |
| Craft readiness | requested4, ore7/need2, wood8/need1, capacity5/net2 => feasible2, ore4/wood2 predicted consumption | Missing material => feasible0; negative/zero recipe quantities reject; confirmed batches remain distinct from feasible |
| Mission checkpoints | Every named checkpoint has fresh allowed observation support | Stored plan/testimony is incomplete; stale support and contradictory support are incomplete; zero-checkpoint recipe rejects |
| Testimony/evidence ledger | Claim-specific provenance and freshness; independent eligible sources counted | Duplicate source does not inflate; contradictory same-source fresh reports become conflict in new reducer; unknown values never support |
| Route/resource selection | BFS A neighbors C,B, both to D => A,C,D, distance2 | Blocked endpoints/no route => found false; stale adjacency supplies no current proposal; dangling schedule dependency rejects |
| Trade/budget preview | inventory5, price3, quantity2, allowance2 => predicted proceeds6, quantity2 | Expired/absent offer or insufficient allowance => no proposal/receipt; preview never settled; unknown settlement blocks submission |
| Needs triage | Hunger>0 and fresh edible rows: restoration descending then stable item ID ascending | Hunger0/no food/stale needs => no eating proposal; equal restoration b/a chooses a, not input-order b |
| Outcome reconciliation | Count confirmed attempts once; partial results survive other attempts | Three confirmed1 + failed fourth => exhausted, confirmed3; pending/unknown => observe, mayRetry false; terminal regression and reused conflicting receipt ID reject |

Each projection retains supplied inputs and authored policy and asserts only its defined summary. Full production tests must additionally compare the complete declared output schema, provenance/skipped reasons, ordered diagnostics, effects and occurrence records. Success denominators are per class, not pooled across easy cases. Require all reviewed semantic fixtures pass, zero false completion, zero duplicate confirmation inflation, zero action on stale/unknown/ambiguous inputs, and zero retries after unknown. More English prompts cannot compensate for a failed deterministic case.

## Independent oracle and fixture policy

Expected data is hand-derived from frozen requirements. Production code, code-generated fixtures, snapshots of current outputs, and a second implementation sharing the same helper cannot serve as the sole oracle. Review both requirement and expected result; pin fixture JSON digest, reviewer, registry digest and literal golden source/genome bytes once the registry exists. CI may report observed results but may not silently rewrite expected data. Missing expected values fail evaluation rather than becoming an automatic baseline.

Current six kernel cases are exact `calculate(op,inputs,params)` assertions with literal expected JSON: budget, adjacency-order BFS, duplicate-source consensus, partial allocation, stable scheduling and unknown-stop retry. A local inline Node assertion loop ran all six against `K.calculate`: six passed. JSON structure checks confirmed 24 projections across eight classes; domain recipes were not executed. `projectionRules` freezes the synthetic policy used by each summary, including inclusive freshness/expiry boundaries and the explicitly allowed local simulation receipt count. A fixture generator only packages hand-authored expectations; it must not calculate them using the implementation. The domain projection collection intentionally has no pretend v1 source hashes or absent executable builders. Implement a separate reviewed lowering/harness and fail an unimplemented case rather than marking it passed.

Add metamorphic checks in addition to exact oracles: duplicate identical evidence cannot raise support; rearranging independent receipt observations cannot change reconciliation; adding a blocked route cannot shorten the returned route; source reproduction cannot increase confirmed attempts; input changes preserve source/genomes but alter input identity; declaration/policy/type/design changes alter source identity. Respect authored-order semantics: BFS neighbor order and consensus tie order are intentionally not permutation invariant.

## Source, registry and typed-runtime acceptance

Require one source/profile discriminator, source-carried bounded declaration/types/runtime ports, and a reviewed immutable semantic manifest with digest. The manifest pins op signatures, closed params, eager order, evidence policy, numerical behavior, failures, bounds, constructor/canonicalization/codec rules and instruction mapping. Package version, graph `version:1`, derived `Object.keys(K.ARITY)` colors, and companion registry strings are insufficient.

Roundtrip both codecs into an empty session, recover full declaration and types without original companion, and reproduce constructor source without runtime bindings. Three fresh generations must be byte-equal. Invoke the same admitted source with two independent snapshots; source digest and genomes remain equal, input digests/output records differ. Reject missing/extra bindings, type mismatch, unit mismatch, unsafe integers, nonfinite intermediates and invalid refinements before publishing success. Cover exact array512/node64/repeat8/source65,536 byte bounds and plus-one cases, full UTF-8 bytes rather than string length, nesting and aggregate result limits.

Strict admission rejects unknown fields/version/registry, duplicate textual keys (including escaped aliases), malformed Unicode, mismatched quote copies/repeat counts, altered source pins, invalid DAG/arity, trailing source data and eager unguarded effects uniformly across compile/import/core/SDK/adapters. Opaque byte recovery performs zero tasks and cannot fall back to legacy execution for a recognized invalid v1 source. Freeze legacy source/ID/genome/outputs separately; explicit migration changes identity and preserves the original. Missing historic thought or units must not be invented.

There are unresolved inter-report design differences: runtime-api initially describes bindable literal/default options; semantics/compatibility/stdlib favor distinct required `input` nodes and explicit null. Runtime/API examples use `apiVersion:'1.0'` whereas compatibility proposes numeric1. Semantics' base registry and stdlib's seven additions must become a single explicit manifest, and legacy first-report evidence must be distinct from `evidenceFresh` conflict semantics. Resolve these in a normative schema before generating golden v1 fixtures. The evaluation does not certify either draft as implemented.

## Failure, result publication and retry gates

Freeze failed-occurrence semantics: preserve completed pure node observations and a structured node/code/path diagnostic; failed occurrence outputs are absent and its simulated receipts remain unpublished. Earlier successful repeat occurrences remain separately recorded with their own receipts; a later failure cannot erase them or publish the failed occurrence. Final record distinguishes successful, failed and not-evaluated occurrences. External confirmed units are supplied evidence and must survive reconciliation independently of local simulation transaction outcomes. Constructor-only source reproduction must remain possible even if a task fails.

Budget actual full run/trace/source/emission/result envelope bytes and aggregate stores, including repeats and duplicate copies. Reserve capacity before mutation or return a bounded committed receipt with retrievable result under an explicit keyed session API. Assert preflight refusal leaves record/artifact/world/lineage/receipt counts unchanged; assert completed keyed execution followed by transport loss replays the same receipt/result without another run. Changed payload with same key refuses. Fail after each staged write in fault-injection tests and compare all stores. A2A publication/store failure and MCP serialization failure must not masquerade as an uncommitted run. Legacy fresh run semantics stay explicitly legacy.

Set normative per-record, aggregate-record, request, result and full wire-response limits in the manifest/descriptor. This report does not invent stable limits. Test below/equal/above each frozen byte limit with multibyte strings, high fanout, repeated large values and maximum repeats. Discovery must publish output schemas; official clients validate successful/domain-error outputs and separately test SDK/protocol errors. Measure parse/admission/evaluation/serialization latency and peak memory independently. Proposed reference budgets: local non-render task p95 <=500ms over 100 warmed iterations, passive inspection <=100ms, and a complete 1,000-call replay/cancellation mix with no monotonic store growth beyond documented retention. These are acceptance targets, not observed performance claims; specify hardware before asserting them.

## Cross-runtime release matrix and missing gates

Run the **same pinned independent fixtures and golden bytes** through Node22, Node26, Chromium and Firefox browser bundles, and an empty consumer installing the actual packed tarball under both Node versions. Include public SDK entrypoints, official MCP in-memory and stdio clients, and A2A serialization. The isolated consumer cannot import repo source or share repo node_modules. Record exact versions, package tarball SHA256, registry digest, fixture digest, browser/device and result artifacts. Compare canonical source/IDs/genomes/outputs/diagnostic codes+paths/effects/order exactly; compare presentation structurally and measured frame budgets separately from GPU pixels. Random IDs/timestamps are metadata excluded by a specified projection, not removed opportunistically on mismatch. Browser execution uses the actual bundle in an actual browser; a Node VM is not browser agreement.

Release blocks still open:

- [ ] One frozen source/transport grammar resolving draft differences, manifest and real registry digest.
- [ ] Production source-carried declared thought/types and source-preserving typed runtime inputs.
- [ ] Uniform strict admission including raw/import dispatch and canonical textual ingestion.
- [ ] New stdlib/recipe semantics implemented with independent exact expected fixtures, not inferred English.
- [ ] Structured failed-occurrence record and receipt publication behavior, including repeats.
- [ ] Precommit byte accounting, aggregate record bounds, full-wire sizing and safe keyed retry.
- [ ] MCP/A2A result schemas and output/error conformance.
- [ ] Reviewed stable and legacy golden source/genome fixtures plus explicit migration pairs.
- [ ] Node22/26, actual browsers and installed-consumer v1 agreement.
- [ ] Fault injection, adversarial mutation, performance/resource results and formal-model correspondence.

Passing local legacy regression tests closes none of these new-profile gates by itself. Label the delivery experimental/RC while any required gate remains open; publish a stable v1 claim only with the pinned matrix and independent acceptance evidence.
