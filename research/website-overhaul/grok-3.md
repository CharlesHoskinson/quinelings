The last pass stopped before the measurements. I’ll run the malformed, failure, replay, restoration, and source-only checks, and compare `website-lab.qnt` with the living-thoughts UI.The homepage logic is in `living-thoughts.js`. Next I’ll run the ten recipes, the session checks, and the water-cap comparison against that code.The recipe runs finished, and the Quint lab model passes its own tests. One schedule failure is mislabeled, and the comparison page can mix a new baseline with an old result after a refusal. I’ll write that up as the report.The ten QDL 1 recipes match their graphs. `QDLV1.compile` returns an `apply` constructor AST, not a run. The bundled runtime matches repository `qdl-v1.js` on all ten sources. Two defects showed up: a schedule cycle is filed as `refinement`, and a refused comparison mixes the new baseline with the previous result in the lab metrics. The full writeup is in `research/website-overhaul/grok-3.md`.

Node v26.10.0. No source, release, credential, or deploy changes. `quint test spec/website-lab.qnt` passed 12 token tests in 165ms. Those tokens are not a proof of this interpreter.

## Homepage pairs

Every suggested change kept the source hash, changed the input hash, and emitted that same source. Effects exist only on route, triage, and gather, and only when `ready` is true and `allowed` is true.

| Recipe | Before | After |
| --- | --- | --- |
| water-total | 1.5, 2, 0.5 → liters 4, count 3 | 2, 3, 4 → liters 9, count 3. `count` is not a changed node. |
| route-preview | A–C–D, distance 2, walk simulated | C closed → A–B–D, distance 2, still simulated |
| craft-quote | capacity 5 → feasible 2, ore used 4, wood used 2 | capacity 8 → feasible 3, ore 6, wood 3. `oreBound` stays 3, so four batches are still impossible. `fullRequest` stays false. |
| confirmed-checkpoints | both supported | a fresh arrival denial → arrival `conflict`, completed false. Haul’s reported state stays `supported`, while its evidence object changes because the denial is skipped as another claim. |
| evidence-ledger | supported, support 1 | same source also says no → conflict, support 1, refute 1, sources 1 |
| trade-preview | tick 10 → quantity 2, proceeds 6 | tick 11 → quantity 0, proceeds 0. `rawProceeds` stays 6 and is not highlighted. No action node. |
| needs-triage | tie breaks to `a` | b’s restoration 9 selects `b`. Both simulated. |
| receipt-reconciliation | empty history → ready, mayRetry true | one confirmed unit plus an unknown attempt → state `unknown`, confirmedUnits 1, attempts 2, mayRetry false |
| gather-readiness | age 2 → simulated payload 3 | now 13, age 3 → skipped, payload still 3. The six checks stay true. Effects 1 then 0. |
| work-schedule | makespan 5, within deadline | a’s duration 4 → a 0–4, b 4–6, c 0–4, order still a, b, c, makespan 6, within deadline false |

## Failures and plateaus

Refusals throw before a record. Failed evaluations keep an empty output, empty effects, a diagnostic, and the trace of nodes that finished.

- Negative numbers, short checks, duplicate ids, fractional batches, `maxAttempts` 0 or 9, and evidence kind `rumor` refuse with `refinement`. Missing `observedAt` is `missing-input`. An extra field is `unknown-field` or `type`. `NaN` and `Infinity` are `nonfinite` before a run. 513 readings and `repeats: 9` are `limit`. `[-0, 0]` sums to 0 with count 2.
- `[1e308, 1e308]` fails on node `total` with `nonfinite`. Outputs and effects are empty. Trace is only `readings`. With `repeats: 2`, a normal sum completes twice; the overflow stops after occurrence 0.
- A simulated `local-note` placed before that overflow remains in the trace as `simulated` and is not published. An action with `allowed: false` is `skipped` and publishes nothing.
- A well-typed `choose` that contains an action refuses with `eager-effect`. A type mismatch refuses earlier with `type`.
- Confirmed units 0 fail with `receipt-units`. A confirmed attempt that later goes pending fails with `receipt-conflict`. A duplicate evidence id fails with `duplicate-id`.
- Cyclic jobs fail with message “Schedule has dependency cycle” and code `refinement`. That code is the measured defect.

Output plateaus whose traces still move: reading order; which of the six gather checks is false (only the `checks` node changes); blocking B, which leaves A–C–D; hunger 4 versus 100; wood 8 versus 100 when ore binds; deadline 5 versus 100. A future timestamp uses age 0, `young` true, and `notFuture` false, so the proposal is skipped. Hunger 0 skips with payload `""` while trace `chosenId` remains `"a"`. Restoration 0 is still eligible; the page says so. A stale route keeps path A–C–D inside a skipped receipt. Two agreeing records from one source do not raise support above 1.

## Replay, restoration, genomes, cap, color

Repeating request key `water-key` returned the same record and did not call `execute`. A different payload on that key threw `request-conflict`. A refusal did not consume the key. The same key on another artifact conflicted. A stored cycle replayed as a failure. `session.verify` on water matched the source in 16 constructor steps and made no task call. The homepage counter wraps that same `execute`, so the guess that it cannot see session runs is false.

A restored snapshot rewritten to liters 999 replayed as `evidence: "asserted"` without executing. `reproduce` threw `stale-record`. A new key computed liters 4 as `retained`. The homepage does not import snapshots.

All ten recipes survived three constructor generations and both exact genomes. A fresh session recovered each RGB genome and recomputed the homepage baseline. The bundle’s ten sources match `qdl-v1.js`.

The lab’s five-liter variant is a real source change: nodes 4→5, edges 4→5, hashes `ql_e02a5c06…` versus `ql_f90072bb…`, same input hash. Readings `[1.5, 5, 0.5]` go from liters 7 to liters 5. Readings `[1, 1]` stay liters 2, count 2. Same-source phase-0 frames have XYZ RMS 0 across 4000 points. Different topologies are not given a pointwise distance.

Organ color is role color at chroma strength 0.85. Total, count, and the new clamp are all `#86acf8`. The opcode palette is different and unused. Colors do not follow the recorded total. The overlay is text keyed by `nodeId`, and only while the editor matches the run. `Chroma.resolveLens` looks for `edge`, so on a QDL 1 trace it reports `not-evaluated`. The homepage does not call it. Motion from phase 0 to 1.2 moves points and does not execute.

## Model versus the page

Replay, verify, input edits, the two-run comparison, the separate water-cap runs, and retention of the previous after record on a typed refusal agree with `spec/website-lab.qnt`. Generations are labeled recover-and-run; the model’s genome-only reconstruct is a different action and is not a separate button.

Source-level, not clicked in a browser: on a typed refusal, `runComparison` installs a new baseline and then lets `renderResults` score that baseline against the previous after record. Only the after box and caption are corrected. Changed-node count and `record-detail` still describe the mix. A JSON syntax error fails in `readInputs` before the baseline run; the model’s pre-interpreter refusal still counts a baseline evaluation. Restoring the exact recorded JSON re-enables the current overlay but leaves Replay disabled, because the keystroke cleared `lastRequest`. The route diagram draws the path and ignores a skipped receipt, so the stale-route fixture still paints A–C–D.

## Untested

Browser clicks, pixels, mobile layout, autoplay, the 2 MiB run cap, harmonic recovery from the 65 samples, the official 44-fixture script, and MCP/A2A. The mixed refusal and the JSON-syntax path are classified from control flow only.