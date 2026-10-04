# Echoweaver

## Computation

Echoweaver aggregates route recommendations by source identity. Its four-node DAG runs `literal → consensus → get(accepted) → action`, with the consensus decision also feeding the action payload. Outputs are the structured decision and one local receipt. The jelly family supplies the animated body; its decorative accent is `#88dfe8`. The runtime owns animation, semantic opcode colors, canonical quotation, and reproduction.

The consensus kernel counts the first vote from each source only, picks the largest support count, and breaks ties by the earliest first-seen choice. `required: 3` gates the local `accept-consensus` receipt. Below threshold, a tentative choice remains visible but the receipt is skipped. Empty input produces a null choice.

This performs useful finite aggregation: duplicated messages cannot inflate support, a tentative recommendation is distinguishable from an accepted one, and every accepted decision exposes its support and distinct-source count. No host code, credentials, network calls, or live routing actions are included.

## Validation and findings

Parsed the JSON with Python's standard JSON parser and checked unique node IDs, producer-before-consumer edges, and output references. Independently computed all five expected ordered outputs using a source-keyed dictionary and `collections.Counter`, then asserted exact structural equality:

1. Four independent sources plus a duplicate: east gets three votes; admission is simulated.
2. Repeated and contradictory reports from one source: its first east vote counts once; east gets two votes, west one, and admission is skipped.
3. Six sources split three to three: west appeared first, so west wins the deterministic tie and meets the absolute threshold.
4. Four sources split two to two: west wins the deterministic tie but misses the threshold; admission is skipped.
5. Empty observations: null choice, zero support, zero sources, skipped admission.

All five fixtures passed independent calculation. The shared JavaScript runtime was not yet available at authoring time; root should run these fixtures through `Q.runTask` and verify canonical-source reproduction during integration.

## Limitations

- `source` is an input label, not authenticated provenance. A sender inventing multiple labels can inflate support. Genuine provenance requires an upstream identity boundary.
- First report wins for each source; a later correction is ignored. Input ordering therefore affects conflicting reports and tied outcomes.
- The threshold is absolute support, not strict majority, unanimity, Byzantine fault tolerance, or distributed agreement. A tied choice with three supporters is accepted by this contract.
- This finite batch computation has no streaming state, timestamps, confidence weights, or proof that the recommended route is correct.
- Receipts are simulations only. The quine constructor and reversible source encodings are supplied by the shared runtime; this file does not claim screenshot recovery or biological life.

## Sources

Implementation authority: `docs/PROGRAM-CONTRACT.md`, especially the `consensus`, `get`, and `action` operation definitions. No external research was needed or used; the computation intentionally implements this local contract exactly.
