# Actual v1 Session / model correspondence

2026-10-04. Owned only `packages/agent-sdk/test/v1-model.test.ts` and this report. Read current `src/v1.ts`, v1 schemas/types and existing tests, `qdl-v1-library.js`, `qdl-v1-kernels.js` and `spec/v1-session.qnt`. No production, model, build or package-script edits; no credentials, git mutations, workers, deployment or external actions.

The new suite bridges the **actual** `Session` implementation and shipped `receipt-reconciliation` recipe to selected deterministic Quint scenarios. It does not use the previous independent JS token model as the runtime under test. All Session runs go through real compile/admission, source-carried ports, evaluation, record validation and receipt storage. Recipe assessments go through `Session.compile(Library.get('receipt-reconciliation').intent)` and `Session.run`, rather than direct kernel calls or proposed SDK endpoints.

## Executed traces and projection

The suite invokes the installed repository Quint binary in its `before` hook, selecting 16 named tests from `spec/v1-session.qnt`, `--max-samples=1 --seed=20261004 --backend=typescript`, and exports actual ITF traces to a temporary directory. It requires one trace per named scenario, checks ITF state indices, decodes safe integer/map tokens, and removes the directory on completion. Missing Quint or traces fail the suite; there is no fabricated-trace fallback or skipped correspondence test. Future package-only consumers need the repository model/dev dependency to run this source test.

For Session comparisons, key 1/2/3 maps to `requestId='key-1'/'key-2'/'key-3'`. Request-token equality is interpreted **within each key** as equality of the complete actual request. Key 1/token 1 binds samples `[2,3]` (output 5); key 2/token 1 binds `[2,4]` (output 6). Changed token 2 binds `[8]` and must conflict on an occupied key. Response tokens 5/6 map to actual sum outputs. The suite projects Session snapshots onto record count, receipt key/count, receipt-to-record correspondence, retained canonical bindings and completed output. Model `commits` maps to stored execution-record count, not interpreter call count: evaluation can finish yet fail precommit record-byte validation.

For reconciliation, model attempt 1/2 maps to `attempt-1`/`attempt-2`, with operation `craft`. Each accepted observation transition becomes a distinct receipt ID carrying its sequence/status/units, and **complete** prior accepted history is supplied to the recipe. Every accepted prefix is evaluated, including empty history and passive view transitions. Assessment projection checks confirmed units, attempt count, each status count, state precedence and retry advice; confirmed quantity cannot decrease over valid extensions. All runs retain the same emitted source, contain no action node and publish no effects.

## Seven implementation checks

| Check | Actual implementation evidence | Executed model scenarios |
|---|---|---|
| Lost reply / conflict | Simulate caller acknowledgement loss by replaying the same request after passive inspect/verify. Return the identical record, leave the complete snapshot unchanged and call actual evaluator once. Changed inputs conflict before another evaluation; replay records are detached. | `lost_response_replayTest`, `changed_payload_conflictTest` |
| Full ledger | With `maxRecords:2`, two completed requests fill both stores. Third key refuses with `resource-limit` without evaluation/mutation; first key still returns its exact result. | `ledger_full_refusalTest`, `full_ledger_retains_replayTest` |
| Precommit failures | Wrong typed binding leaves the complete snapshot unchanged. A 64-byte record cap rejects **after actual evaluation** yet stores neither record nor receipt. Repeating the refused key evaluates again and refuses, showing no committed replay key was consumed. | `preflight_failureTest`, `oversized_responseTest` |
| Passive restore / provenance | Snapshot restoration and restored keyed replay call no evaluator. Source and occupied ledger projections survive, but imported records remain `asserted`. A fabricated well-shaped output remains asserted; explicit fresh reproduction detects mismatch (`stale-record`) and commits nothing. Original Session stays unchanged. | Ledger projection of `full_ledger_retains_replayTest`; restoration/provenance has no direct Quint transition |
| Accepted histories | Evaluate each prefix for pending, unknown, unknown→confirmed, repeated terminal reads, two distinct 1-unit attempts, and confirmed partial work plus unknown. Count distinct attempts once and preserve quantities/source. | `pending_blocks_retryTest`, `unknown_blocks_retryTest`, `unknown_resolvesTest`, `terminal_reobservation_onceTest`, `separate_attempts_countTest`, `partial_confirmed_unknownTest` |
| Conflicting histories | Terminal→pending, changed terminal units and differing equal-sequence reads yield a bounded `receipt-conflict` failed occurrence, no outputs/effects, and exact replay of that failure record. | `terminal_regression_refusesTest`, `changed_terminal_units_refusesTest`, `equal_sequence_conflictTest` |
| Explicit differences | Older observations arriving after a newer unknown are accepted in complete history, sorted and assessed identically in either input order. A completed request correctly returns `mayRetry:false`; exact duplicate receipt IDs do not add units/attempts. | `stale_observation_refusesTest` and `terminal_reobservation_onceTest`, with differences described below |

Evaluator instrumentation wraps the actual exported `V.execute` function using Node's test mock and delegates to its original implementation. Node restores the mock at test completion. It counts evaluations but introduces no replacement semantics or external host callback.

## Abstraction mismatches — part of acceptance, not hidden

1. **No Session world/CAS/staging API.** Current Session is synchronous bounded memory storage. Quint world/revision tokens, separate stage/preflight actions and hypothetical CAS are not SDK fields or endpoints. The suite compares public pre/post snapshots around `run` and count/output/receipt projections; it does not claim step-for-step correspondence, durable atomicity or concurrent driver behavior. Model staging response tokens can differ on replay; actual replay compares the complete canonical request and ignores no changed caller inputs.
2. **Complete-history reducer versus online ledger.** Quint `observe` rejects a lower sequence arriving after a higher one. The actual pure reducer accepts a complete supplied history in arbitrary input order and sorts by sequence. The suite positively checks that correct divergence rather than incorrectly expecting a production refusal. Missing historical receipts/completeness/provenance are caller obligations; monotonicity applies only to valid complete-history extensions.
3. **Observation refusal versus failed-run retention.** Quint leaves its observation ledger unchanged on terminal regression/equal-sequence conflict. The runtime's recipe processes that malformed history during evaluation, yielding a valid failed run that Session records and replays. No assessment outputs or simulated effects are published, but Session record/receipt counts increase once. This is not `refusalUnchanged` for the entire Session and must not be advertised as full state equivalence.
4. **Retry blocker versus complete policy.** Quint `mayRetry` is only absence of pending/unknown. Actual recipe additionally checks requested quantity and attempt budget. Matching-prefix comparisons deliberately use requested 3/maxAttempts 4, which neither completes nor exhausts those chosen traces. A separate assertion shows completed=1 unit gives `mayRetry:false` even though the model's unresolved blocker permits it. This advice grants no external authority.
5. **Trust has no model field.** Quint models host-owned receipt occupancy; caller-supplied restored snapshots are validated but historical calculations remain asserted. Passive restore/replay is tested independently and connected only by the retained ledger projection. Imported output validity/authenticity is not inferred from its schema, source hash or replay key.
6. **Finite tokens omit real mechanics.** UUID generation, constructor source/genomes, registry/schema admission, raw parsing, exact byte accounting, resource aggregation, adapter serialization and provider outcomes are not refined by these traces. The tests exercise some real mechanisms but cannot prove them generally. The simulated lost reply is a repeated caller request, not an MCP/A2A connection-loss or crash injection. Current descriptors report `simulation-only` and `memory`.

## Actual checks

Environment: Node v26.10.0, installed Quint 0.33.0, existing SDK tsx/TypeScript dependencies. From `packages/agent-sdk`:

```bash
node_modules/.bin/tsx --test test/v1-model.test.ts
node_modules/.bin/tsx --test test/v1-model.test.ts test/v1.test.ts
node_modules/.bin/tsc --noEmit --target ES2022 --module NodeNext \
  --moduleResolution NodeNext --strict --esModuleInterop --skipLibCheck \
  --noUncheckedIndexedAccess test/v1-model.test.ts
```

Results: new suite **7/7 passed**; combined new/existing v1 suites **21/21 passed**, including 14 existing v1 tests. Dedicated strict typecheck of the new test and imported sources exited 0. The new suite's hook executed all **16 selected Quint tests** successfully and consumed their exported ITF traces. A tsx/Node `module.register` deprecation warning appeared; it did not affect results. Existing package `tsconfig.tests.json` includes only `type-contract.ts`, so the dedicated command above supplies actual static checking of this new test. No Node 22, browser, network transport, full SDK suite or new sampled exploration run is claimed in this assignment.

The test filename matches the existing `test/*.test.ts` package script automatically. No package integration edit is required. Acceptance supported here is **selected executed model/runtime projections plus explicitly tested divergences**, not universal JavaScript refinement, authenticated receipt provenance or exactly-once external work.
