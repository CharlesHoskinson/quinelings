# Reader fix cycle 1

The revision adds definitions where the reader needs them: ownership beside the body, measurement help beside the readouts, and genome/generation explanations beside recovery. It changes `living-copy.json` only. Root will place the new `ownershipIntro` and `metricsHelp` fields in the page and arrange a fresh reader check. No voice profile is active.

## Reader flags, verbatim

- “The program’s body” — I had to infer that the body is a visual representation with selectable parts. “The part of the body it owns” and “operation ownership” remained unclear: I could not tell what ownership means or how an operation determines a part’s shape.
- “Changed node values / Source identity / Anatomy change from inputs / Interpreter requests.” — I reread this and still could not tell whether these are controls, measurements, or topics. “Interpreter requests” had no explanation.
- “Check the source. Recover a runnable copy.” — I understood the definition of a quine, but had to infer what “genome data” is and how harmonic or RGB data contains recoverable source. “Three generations” also appeared without explaining what constitutes a generation.

## Findings and applied repairs

1. **An undefined metaphor carries the mechanism.** The original `bodyLegend` explains colors and recorded values, while `conceptBody` uses tissue ownership before defining it. The new `ownershipIntro` calls the body a visual representation, identifies source-declared curves and dimensions as the basis of its shape, and defines ownership as an explicit assignment of a region to an operation. Selection highlights that region. The water total’s trunk band supplies a concrete example. Operation names do not prescribe unique shapes. `sourceIntro` now describes the added cap’s trunk-band assignment rather than concluding with the undefined phrase “operation ownership.”

2. **Measurements lack a reading rule.** The labels alone do not tell the visitor how to interpret the numbers or the counter. The new `metricsHelp` identifies the first readouts as measurements of the displayed comparison, maps nodes to operations, explains source identity, and defines the fixed-phase RMS distance and its zero value. It then distinguishes the page-wide interpreter counter: it includes rejected requests, a normal comparison adds two, replay/presentation/passive decoding add none, and the generation action adds three. These counts explain controls and their cost; they are not offered as evidence of quality.

3. **The recovery nouns conceal separate operations.** The former `quineIntro` leaves “genome” and “generation” implicit. The revised paragraph defines a genome as another encoding of source bytes, names harmonic coefficients and exact RGB values as the storage forms, and says decoding uses complete records rather than the portrait. Constructor verification actually runs the constructor and compares its emission, while evaluating no task. A generation is a fresh program built from the previous emission. The action creates a chain through raw source, harmonic data and RGB data, evaluates each copy with the retained inputs in a fresh session, and compares source and result. It restores no earlier execution history.

## Preservation check

The opening, finite typed-task explanation, local simulation limit and authored meaning of “Living Thoughts” are unchanged. Ownership is not a unique-shape-per-opcode promise. The graph’s four-to-five operation change still retains the same four connected body parts, with changed dimensions and assignments. The seven-to-five water result remains conditional on the prepared readings. The RMS explanation concerns corresponding samples in the same-source comparison; it does not claim indexed-sample correspondence for different source programs.

The recovery copy keeps exact constructor emission, passive decoding and fresh task execution distinct. It does not equate viewing a portrait with recovering source, reconstruct absent history, certify arbitrary inputs, or strengthen the earlier runtime evidence. Refusals still count as interpreter requests even when no task result is created.

All five tell families were checked in this bounded repair. The additions supply missing mechanisms rather than promotional claims (content), define terms without varying them for effect (language), retain the surrounding cadence without imposing punctuation rules (style), explain the controls rather than narrating the editorial process (communication), and retain source/input/recovery qualifications that affect meaning (filler and hedging). The contrast between complete genome records and the portrait answers the reader’s actual uncertainty.

At the editor’s handoff, the JSON was checked for unique keys and nonempty strings. Its original keys remained, with only the two requested display fields added. Runtime code, story copy, page substitutions and live HTML were outside this edit. The earlier cadence displacement result is not reinterpreted as a result for this revised text; this is a bounded factual-clarity repair, not another metric-driven cadence revision.

Root now owns the copy for integration. It will split the recovery explanation into source verification, genome decoding and generation paragraphs, preserving their content, and can broaden the counter phrase to “including inputs it rejects” to cover refinement refusals as well as type mismatches. The fresh reader will receive the complete revised page copy.

**Status: fixes applied; fresh reader verdict pending.** The editor has addressed each reported gap, but does not declare the prose clear or the flags resolved before the independent re-read.

# Reader fix cycle 2

The next reader reported this flag verbatim:

- “Complete only when fresh observations support both haul and arrival” — I had to infer that “haul” is a separate condition being checked; the draft never explains what it means. “Eligible contradiction” and “revision limits” also left me unable to tell which reports count or why the new denial qualifies. I understood the reported change, but could not follow the rule that produces it.

**Finding: an unexplained policy hides the causal step.** The `confirmed-checkpoints` story now identifies “haul” and “arrival” as the names of two supplied claims, without inventing a real-world meaning for haul. It defines support as at least one qualifying true observation and no qualifying false observation, then makes completion the conjunction of those supported states. The assumption defines the actual filters: observation kind, no future timestamp, age at most maxAge and revision at least minRevision. Revision means the record’s declared update number, with a caller-supplied minimum; it authenticates no witness.

The suggested change now explains why the denial counts. Both the existing reports and the added denial use tick 10 and revision 1. With now 12, maxAge 2 and minRevision 1, the denial meets the inclusive age and revision bounds. Arrival then becomes conflict, completion becomes false, and haul remains supported. These are the controlled fixture values, not a promise about arbitrary editor values.

The `evidence-ledger` assumption uses the same definition of revision and the same inclusive time/version filters. It explicitly retains that recipe’s broader acceptance of observations, testimony and inference. Its source-count and conflict rules are unchanged. No source label, revision number or renamed source is described as authenticated or independent evidence.

Only these two entries in `story-copy.json` changed in this cycle. The checkpoint title and question now refer to both checks; all changes remain in the five existing prose fields. The recipe identifiers, runtime transformations, frozen sources and other stories are unchanged. The JSON retains its expected recipe and field schema. The current library documentation and fixture definitions supplied the policy and values; this copy edit did not rerun the task or add a runtime-verification claim.

**Status: copy repaired and ready for root application; fresh reader verdict pending.** No claim of reader clarity is made before the independent re-read.

# Reader fix cycle 3

The reader’s remaining flag was:

- “Try the suggested change. Edit the supplied values. Run the comparison. Replay this request.” I could not tell what Replay does or how it differs from running the comparison again. The later statement that Replay adds no interpreter requests made me reread this: I had to infer that it replays an existing record, but the draft never explains what I would see.

**Finding: a control name leaves its visible result unspecified.** Added `replayIntro` to `living-copy.json` for placement immediately after the run buttons. It says that Replay retrieves the same saved run record, leaving the displayed output and recorded operation values the same. It neither evaluates a task nor animates the trace. Running the comparison again evaluates both input sets and creates new records for accepted inputs, even when their values have not changed.

The wording follows `replay()` and `runComparison()` in the current implementation. Replay reuses the last request and checks the retained record ID; comparison creates new request keys. The phrase “for accepted inputs” preserves the distinction between a new evaluation record and an input refusal. No claim is made that a refusal creates a new comparison pair. The copy explains the visitor’s action without adding request-key mechanics to the control help.

This cycle adds only the `replayIntro` string. It changes no other homepage copy, story field or runtime behavior. JSON parsing confirms a nonempty string. The final reader check remains outstanding. This is the third permitted repair cycle; any flags remaining after that re-read must be recorded rather than starting another repair loop.

**Status: Replay help applied; final reader verdict pending.**
