# Raincatcher

Owned artifacts: `programs/raincatcher.json` and this note. The ribbon skin decorates a useful 15-node irrigation-budget DAG; computation uses only the shared contract's kernels.

Each sensor input is an independently prepared estimate of irrigation demand in litres for one common area and cycle. Confidence weights default to `[2,1,1]`. Weighted fusion produces 36 L from `[24,36,60]`. Clamp the result to 0–120 L, request zero when the clamped value is below 5 L, then allocate at most the reservoir balance. The report exposes the estimate, cap, request, allocation, remaining balance, and local irrigation receipt. Positive allocations produce exactly one simulated receipt; zero allocations produce a skipped receipt.

## Exact fixtures

| Fixture | Fused L | Capped L | Requested L | Allocated L | Remaining L | Receipt |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| limited-reservoir | 36 | 36 | 36 | 30 | 0 | simulated |
| wet-soil-zero-demand | -3 | 0 | 0 | 0 | 30 | skipped |
| below-five-litre-threshold | 4 | 4 | 0 | 0 | 30 | skipped |
| exact-five-litre-threshold | 5 | 5 | 5 | 5 | 25 | simulated |
| safety-cap | 190 | 120 | 120 | 120 | 30 | simulated |
| empty-reservoir | 36 | 36 | 36 | 0 | 0 | skipped |
| ignore-untrusted-probe | 24 | 24 | 24 | 24 | 6 | simulated |

Validated JSON parsing, unique IDs, topological input references, output references, and the 64-node bound. Independently calculated all seven complete expected reports in Python using the mathematical weighted average, threshold, clamp, and budget equations; each matched the authored JSON. Shared-runtime execution and quine verification remain integration checks for root.

## Limitations

This is a finite local simulation with no device/network access. Values and thresholds are illustrative policy constants, not agronomic recommendations. Actual moisture-to-litre calibration is outside this graph: do not pass raw percentage readings as litre estimates. Negative estimates model surplus moisture and clamp to zero. Weights must be nonnegative with positive total; inconsistent lengths and invalid weights are rejected by the kernel rather than represented as successful fixtures. The deadband applies to requested demand; a scarce reservoir may still supply a positive allocation below 5 L. There is no rainfall forecast, flow-rate control, sensor freshness check, persistent reservoir state, or physical actuation. No external sources were required for this arithmetic demonstration.
