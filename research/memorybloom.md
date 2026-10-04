# Memorybloom

Memorybloom computes a belief-support ledger for the fixed simulated claim `cistern-safe`. It uses the shared `evidence` kernel, preserves every submitted report in a stable source-sorted provenance list, counts submitted reports separately from counted sources, and selects a useful disposition from the four evidence states. The `bloom` skin provides the body family; runtime graph structure drives its animation.

## Findings and fixtures

The program has 17 DAG nodes and one structured output. All computation uses the contract's finite kernels. No effect node or external action is involved.

- Contradiction and duplicate: 4 submitted reports produce 1 support, 1 refutation, 2 counted sources, `conflict`, and a review disposition. An unrelated pump report stays visible in provenance but is excluded from this claim's assessment.
- Independent support with late reversal: 4 reports produce 2 support, 0 refutations, and `supported`. The same source's later opposing report is retained in provenance but cannot replace its first report under the kernel contract.
- Independent refutation: 3 reports produce 0 support, 2 refutations, and `refuted`; a duplicate negative report does not inflate evidence.
- No reports: 0 reports produce `unknown`, zero counts, and an await-evidence disposition.
- Unrelated claim only: 2 reports produce `unknown` for `cistern-safe`, while preserving both unrelated reports for inspection.

Exact expected JSON outputs were computed offline using an independent Python first-seen `(source, claim)` ledger and checked separately with a JavaScript DAG evaluator. Structural checks verify unique node IDs, producer ordering, valid literal overrides, output references, and finite fixture values. Shared-runtime integration is owned by the root agent.

## Limitations

This is a report-accounting tool, not a truth oracle. Source strings are supplied by simulated input and do not authenticate independent organizations or sensors. Boolean reports have no uncertainty, timestamps, trust weights, or measurement units. First-report precedence is intentionally order-sensitive: later corrections cannot update the assessment even though they remain visible in provenance. `supported` means at least one positive report and no counted negative report; it does not imply a quorum or certify physical safety. Contradictory reports from the same source alone do not create kernel conflict.

The claim is fixed by the `evidence` node's `params.claim`; the `claim` literal is its display label. Only override `reports` in normal fixture use. A configurable selector or revision-aware ledger would require a shared-kernel extension. There is no biological life, hidden cognition, screenshot recovery, or live integration claim.

No external research was needed: the implementation follows `docs/PROGRAM-CONTRACT.md` and uses simulated data exclusively.
