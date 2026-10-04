# Ranch adapter integration validation

Implemented only `packages/agent-sdk/test/ranch-adapters.test.ts` and this report. Production Runtime/schema/MCP/A2A modules were exercised without modification. No deployment, credentials, live-world actions, commits or extra agents were used.

## Executed evidence

From `packages/agent-sdk` on 2026-10-04:

```
./node_modules/.bin/tsx --test test/ranch-adapters.test.ts
npm run typecheck
./node_modules/.bin/tsc --noEmit --target ES2022 --module NodeNext --moduleResolution NodeNext --strict --esModuleInterop --skipLibCheck test/ranch-adapters.test.ts
```

All commands completed with exit code 0. **Five integration tests passed, zero failed/skipped.** The standalone strict TypeScript check additionally includes the new test file, since the package's current test typecheck configuration includes its dedicated type-contract file rather than every executable test.

## Actual transport and API coverage

1. **Official MCP discovery and paired transports.** The official `Client` and `InMemoryTransport.createLinkedPair()` discover exactly the 16 actual tool names. Assertions inspect the SDK-emitted recursive closed ranch input schemas: exact recipe discriminants/selectors, two ordered parent/nullable-intent pins, closed six-trait style with bounded integers, ordered pairing resident tuples, library/world targets and all six world command variants. Actual tuple discovery uses draft-style `items:[...]`, `additionalItems:false`, and exact min/max2, rather than assuming `prefixItems`. Read-only flags are true for preview/frame/lineage/world inspection, false for admission/annotation/world creation/command; world commands are destructive, admission is request-key idempotent, explicit Run is not idempotent.

2. **MCP full offspring and social lifecycle.** Typed supplied `[10,20,30] L` mean and available5/desired12 litre budget parents compile over the transport. Before admission, preview returns a source-backed ready candidate; child inspection refuses unknown artifact and lineage remains empty. Candidate frame reconstructs/samples all owners at budget4000; wrong child source pin refuses. Library admission returns IDs, inspect retains exact source, lineage records the derivation, and exact complete-request retry returns the original acknowledgement. Changed nonce under the same request key conflicts; changed companion pin yields a semantic rejected preview; wrong units reject; nested unknown style fields are refused. Source-only candidate recovery and explicit annotation attach exact absent companion metadata; conflicting interpretation refuses without replacement.

   The same official MCP transport creates a neutral world, imports disabled adults, explicitly enables both, sends reciprocal invitations and advances bounded four-tick batches. It reaches a real proposal and energy recovery without modifying world positions, energy or internal fields. Wrong epochs, proposal ID and ordered parent roles refuse with complete world snapshot equality. Admission consumes the proposal, inserts one energy40 disabled nursery child, charges exactly30 each and increments revision once. Exact admission retry after consumed proposal preserves the world; a new key for that consumed proposal refuses. Manual and social derivations for the same source remain separate rows.

3. **MCP cancellation.** A same-turn actual JSON-RPC tool request and official cancellation notification on linked transports suppress dispatch/success output and leave candidate artifact and lineage absent. A defensive direct-handler check separately establishes `{error:{code:'cancelled',message,path}}` for an already-aborted signal; another direct-handler check establishes structured nested invalid-input errors when a client bypasses SDK structural validation. Those defensive checks supplement, rather than replace, the real transport test. A later explicit authorized admission still succeeds with the original key.

4. **Real A2A HTTP fixture.** An actual ephemeral loopback HTTP server uses `createA2AApp` and JSON-RPC `SendMessage`/`GetTask` with A2A-Version1.0. The fetched card advertises build/ranch/execute and ranch JSON input. A single user text part still completes passive create. Structured compile, preview, frame, library admission/retry, lineage, recover/annotate, world create/inspect/import/participate/invite/advance and actual proposal/birth all complete through HTTP. Results retain the exact existing `{operation,result}` artifact envelope. Wrong source pins/nested recipe fields and changed idempotency/sequence payloads return failed task status with structured `quinelingError` metadata. `GetTask` preserves that diagnostic. Rejected sequence conflict leaves the world unchanged. Real HTTP reciprocal birth consumes/charges once; exact retries preserve state and a new key cannot consume the proposal twice.

5. **A2A pre-dispatch cancellation.** The official `SendMessageRequest`, `RequestContext`, `ServerCallContext` and `DefaultExecutionEventBus` exercise `QuinelingExecutor` cancellation before a structured offspring admission dispatch. Dispatch count stays0, only canceled status is emitted, and no child artifact or derivation is stored. This is an executor boundary test, not an assertion that an arbitrary HTTP cancellation always wins a race against synchronous commit.

## Independent useful outputs and passivity

The child calculation has a handwritten expected output **`[{allocated:12,remaining:8}]`**, derived from `(10+20+30)/3=20` and `min(20,12)=12`. Parent outputs/runs are never used as child oracles. Both adapter paths export only the stored child source into a fresh Runtime with no parent artifacts, companion metadata or records, explicitly Run it and compare that independent literal result. Adapter explicit Run additionally verifies exact emitted source; the task-changing child executes once even when the MCP budget parent has three repeats. Effects are empty for this pure fixture.

A spy on the actual shared constructor executor records **zero calls throughout every passive compile/create/preview/frame/admission/annotation/world phase** in both transport lifecycle tests. The test then executes explicitly. Each primary runtime has exactly one record slot: its first explicit child Run succeeds and a second refuses `resource-limit`, demonstrating no earlier passive operation consumed execution-record capacity. Pure compile-time refinement calculation remains allowed. The spy proves the tested paths do not call that executor; it is not a universal host-code passivity proof.

## Findings and limits

No production source/API defect was found in the covered tests. Official SDK structural failures can be owned by the SDK before the adapter callback, so a schema refusal is asserted as `isError` without inventing adapter-owned structured metadata. Runtime semantic errors and deliberate callback-boundary checks verify the adapter error envelope separately.

This validation covers source adapters, official in-memory MCP protocol dispatch and real loopback A2A HTTP. It does not claim packed-package/remote authentication, browser rendering/accessibility, transport-loss durability, cross-process coordination, full-capacity saturation, all kernel refinements/recipes, every cancellation timing, full world liveness/geometry refinement, formal JS/SHA/compiler equivalence or performance acceptance. Root owns broader tests, formal gates, packaging, publication and final integration evidence.
