# Lanternkeeper

Implemented `programs/lanternkeeper.json`, a 17-node finite DAG using the shared constructor/task contract and the `filament` body family. Root supplies the runtime, constructor quine, source verification, animation, and gallery integration.

The useful task is a local maintenance decision: combine three supplied normalized fault signals in the order **outage severity, flicker severity, illumination deficit**, using weights `[4, 2, 2]`. A score at or above `0.625` requests maintenance. Repair proceeds only when `evidence` reports the selected `faultConfirmed` claim as `supported` and the explicit `repairPermitted` literal is true. `action` has `allowed: true` and returns only a simulated `repairStreetLamp` receipt, with lamp ID, selected operation, and computed score. No physical repair, network call, credential, or external write occurs.

## Findings and verification

Parsed the JSON and independently checked unique node IDs, topological input references, valid graph outputs, and literal-only overrides. Independently recalculated every expected ordered output using Python `Fraction` arithmetic for weighted scores and a separate first-source-plus-claim evidence aggregation. All seven fixtures passed:

| Fixture | Score | Evidence | Receipt |
| --- | ---: | --- | --- |
| default-confirmed-fault | 0.875 | supported (2 sources) | simulated |
| healthy-lamp-guard-false | 0.125 | supported (2 sources) | skipped |
| threshold-boundary | 0.625 | supported (2 sources) | simulated |
| conflicting-inspections-guard-false | 0.875 | conflict | skipped |
| repair-permission-denied | 0.875 | supported (2 sources) | skipped |
| duplicate-provenance-and-unrelated-claim | 0.875 | supported (1 source) | simulated |
| no-inspection-evidence | 0.875 | unknown | skipped |

The boundary fixture verifies inclusive comparison. Duplicate contradictory reports from the same source and claim do not inflate counts or overwrite the first report; unrelated claims are excluded. Both low severity and inconclusive evidence yield guard-false receipts. Scores use binary-exact fractions, making exact JSON expected outputs portable across the independent calculation and JavaScript runtime.

## Limitations

Weights and threshold are illustrative policy choices, not a validated engineering standard. Inputs are pre-normalized simulated signals; the graph does not measure illumination, diagnose real hardware, or authenticate inspector identities. The evidence contract accepts one nonconflicting source as supported; deployments needing a minimum number of independent reports would need an additional support-count guard. A permitted simulation conveys no real-world authority. Negative, out-of-range, or incorrectly ordered signal inputs are outside these fixtures; the supplied graph does not validate the nominal `[0, 1]` signal range. Shared-runtime and quine integration checks remain root's responsibility.

No external research claims or sources were required: the decision policy is deliberately specified here, and kernel behavior comes from `docs/PROGRAM-CONTRACT.md`.
