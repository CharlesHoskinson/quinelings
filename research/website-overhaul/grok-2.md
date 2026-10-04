The earlier pass stopped before the measurements. I’ll inspect the ten frozen recipes and the current homepage lab, then run a few before-and-after cases and finish the report.The new homepage lab pairs each recipe’s inputs and has a separate program-edit experiment. I’ll run those cases through `V.execute(V.compile(intent), bindings)` and record what actually changes.The ten paired runs finished. Source stayed fixed while inputs changed; the water-cap edit is a different program. I’ll write that up in `research/website-overhaul/grok-2.md` and include the full report here.The useful behavior is real and narrow. Each frozen recipe is a finite typed graph over a supplied snapshot. A second snapshot keeps the compiled source and changes named inputs, some node values, and the outputs. A deliberate graph edit, the five-liter cap, is a second source. The familiar part is the arithmetic. The part worth showing is that one source owns the graph and the tissue map, a run owns the values, and a genome rebuilds a program that accepts a new snapshot.

Measured with `V.execute(V.compile(intent), bindings)` on registry `43c66b7022fb73e3ffb2cb53cf4ad2181106a55ed95480bc83e9e656da5e6cf3`. This pass did not run the browser, `V1Session` replay, the 44-fixture verifier, or ranch courtship. `living-copy.json` is `{}`, so the sentences in `index.html` are the live copy. The write-up is also in `research/website-overhaul/grok-2.md`.

## Five layers, kept separate

- **Dataflow.** Sum, length, comparisons, selection, unweighted BFS, a dependency schedule, an evidence tally, and a receipt tally.
- **Quotation constructor.** Every compiled program emits its canonical source. This pass measured that emission, including 16 constructor steps on every run. It did not search prior literature and assigns no priority.
- **Lossless source codecs.** Harmonic coefficients and RGB triples restore the canonical bytes. They are not a reading of the drawing.
- **Anatomy in the source.** Owner records attach operations to tissue. A phase value moves the samples. Sampling called `V.execute` zero times.
- **Simulated receipts.** On gather, route, and food choice, `status` is `simulated` or `skipped`. The skipped gather run left an empty effects list. No receipt gathered items, moved a walker, or ate food.

“Living Thoughts” is the product name. Reproduction on the homepage is source emission, genome recovery, and another run. The one child built here is classified `body-only`: same task syntax, new body, same water totals. That is reuse of a calculation, not mating or a creature that learned.

The page already pairs a baseline with an edited snapshot, counts changed trace nodes, and checks the source hash. The phase slider only repaints. Value labels appear only when the inputs still match the after-record. A result picture is drawn for route, water, and work schedule; the other seven examples leave that region empty. “Anatomy change from inputs” compares both bodies at phase zero, so one unchanged source reports distance zero. The picture’s motion is the phase control.

## Three before/after cases

Source-hash prefixes are the first 18 characters. Every pair below completed, kept one source, emitted that exact source, and changed the input hash.

**Water, same program.** Source `ql_e02a5c069ddc078`, 8,125 bytes, 4 nodes, 7 owner records.

| | Input | Output |
| --- | --- | --- |
| Before | `[1.5, 2, 0.5]` | `[{liters: 4, measurements: 3}]` |
| After | `[2, 3, 4]` | `[{liters: 9, measurements: 3}]` |

Changed 3 of 4 nodes: `readings`, `total` 4 → 9, `summary`. The count stayed 3. `[-1]` throws `refinement`, “Number is below minimum,” and publishes no output.

**Route, same program.** Close C.

| | Path | Proposal |
| --- | --- | --- |
| `blocked: []` | A–C–D, distance 2 | simulated `walk-proposal`, ready true |
| `blocked: ["C"]` | A–B–D, distance 2 | simulated `walk-proposal`, ready true |

Changed 4 of 9 nodes: `blocked`, `route`, `path`, `proposal`. D stays reachable. The receipt carries the path. This pass moved nobody.

**Cap, second program.** `cappedWaterIntent` adds a clamp of the sum to `[0, 5]`. Nodes 4 → 5, edges 4 → 5, hashes differ, both sources emit themselves.

| Readings | Original | Capped |
| --- | --- | --- |
| `[1.5, 5, 0.5]` (the control’s default) | liters 7, count 3 | liters 5, count 3 |
| `[1.5, 2, 0.5]` | liters 4, count 3 | liters 4, count 3 |

The default readings show the new operation. The library’s ordinary readings stay under the cap, so the result pane matches while the graph has still changed.

## The other seven

Same source, different values.

- **Retry.** Empty history: `ready`, 0 confirmed, `mayRetry: true`. The other fixture, one confirmed unit plus an unknown attempt: `unknown`, 1 confirmed, 2 attempts, `mayRetry: false`. The program does not submit a retry. The button sentence “add an unknown second attempt after one confirmed unit” describes the after snapshot; the before snapshot is empty. Proposed copy should say they are two supplied histories.
- **Arrival.** Both checkpoints supported and completed. One added fresh denial of arrival makes arrival `conflict` and completion false. Haul stays supported.
- **Craft.** Ore 7, wood 8, request 4. Capacity 5 → feasible 2. Capacity 8 → feasible 3, because `floor(7/2) = 3`. `fullRequest` stays false. The inventory input is unchanged by the run.
- **Evidence.** One supporting record from `sensor` is `supported`. The same source also saying no is `conflict`, support 1, refute 1, sources 1, both records kept.
- **Schedule.** Makespan 5 meets deadline 5. Job a at 4 ticks pushes b to end at 6, makespan 6, deadline check false. Independent job c still ends at 4. The output has no worker field.
- **Offer.** At the supplied expiry, quantity 2 quotes proceeds 6. One tick later the quote is quantity 0 and proceeds 0. Ten of 28 nodes change. “Live” in the fixture name means supplied `now` equals expiry. Effects are empty both times.
- **Food.** Equal restoration 8 selects `a`. Raising `b` to 9 selects `b`. Both are simulated eat proposals. Ready stays true.
- **Gather.** Six true checks and `now` 12 produce a simulated gather proposal for 3. `now` 13 skips it, payload still 3, effects list empty. The six checks do not change.

## View, recovery, child

Water sampling did not change the canonical source and did not call `V.execute`. The `total` anchor moved between phase 0 and phase 1.2. Across 4,000 points, phase 0 versus 0.8 had XYZ RMS about 0.00488. Phase 0 versus itself was 0. Labels come from the trace, colors from the operation palette, ridges from the frame.

Water recovery: 255 harmonic bands, 16,575 samples, and the RGB record both restored the source and the 4-liter result. `verifyQuine` returned that source in 16 constructor steps. The task output is a different value from the emitted source string. One altered RGB channel was rejected with “Color is outside the exact byte palette.”

Body-only child of that recovered source, nonce 1: classification `body-only`, task syntax unchanged, body changed, child prefix `ql_4f243a91012eaa3`, same four operations. RGB recovery reproduced the child. Parent and child both returned liters 4 and liters 9 on the two reading sets. The homepage button recovers the same program three ways. It does not build this child. Compose and mate across the ten recipes were not searched; the offspring rules require an exact typed seam and protect action guards.

## Proposed page text

1. **Route.** Open streets walk A–C–D because C is A’s first neighbor. Closing C walks A–B–D, still two edges. The walking line is a simulated receipt.
2. **Retry.** An empty history allows retry advice. A supplied history with one confirmation and one unknown attempt keeps the confirmed unit and sets `mayRetry` false.
3. **Water.** 1.5, 2, and 0.5 sum to 4 liters across 3 readings. 2, 3, and 4 sum to 9. One source hash covers both runs.
4. **Arrival.** Fresh support for haul and arrival completes the checkpoint. One fresh denial turns arrival into `conflict` and completion false.
5. **Craft.** Capacity 5 allows 2 of 4 batches. Capacity 8 allows 3, limited by 7 ore. The run leaves the inventory input as it was.
6. **Evidence.** One source saying yes is support. That same source saying no is a conflict with sources still equal to 1.
7. **Schedule.** An extra tick on job a moves the dependent job past deadline 5. The overlapping job still ends at 4.
8. **Offer.** The quote is usable at the supplied expiry and unusable one tick later. No crystals are spent.
9. **Food.** A restoration tie selects the earlier item id. A higher restoration selects the other item. Both results are simulated proposals.
10. **Gather.** The age limit allows a simulated proposal for 3 items. One tick past that limit skips the proposal and clears the effects list.

Cap caption worth adding: readings 1.5, 5, and 0.5 sum to 7 and publish 5 after the clamp; readings 1.5, 2, and 0.5 publish 4 from both programs, so a changed graph can hide in the result pane.

The experiment already measured, and the one the page can show in order: run both water snapshots; recover the source from samples and from RGB and run the 4-liter case again; build the body-only child and show the new hash with the same 4 and 9; move the phase slider while the evaluation count stays still. Step 3 should be labeled as a new body for the same calculation.

These Node figures were not confirmed through the homepage buttons. Replay-by-request-id, canvas layout, and cross-recipe mating remain unread by execution.