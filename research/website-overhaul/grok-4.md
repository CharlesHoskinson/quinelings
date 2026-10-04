I'll review the new lab against the program contract and the frozen engine, then write the full report in this turn. First I'm reading the contract, the new site files, and the existing overhaul notes together.The contract and the reviewer brief are in. Next I’ll read the new lab sources and the four Sol reports in full, then run the frozen engine against the examples.The lab copy and the frozen interpreter are in place. Next I’ll run all ten examples, plus the edges that can make a picture lie, through `qdl-v1.js`.The engine agrees with nine of the ten stories. I’m writing the review to the research file and including the full report here.The new lab is honest about separating a run, a source edit, and a gesture. It is dishonest in four visitor-visible places: the organ-color legend, the receipt story, the empty-diff caption, and the schedule chart labels. Nine of the ten suggested changes match the frozen interpreter. The full review is also in `research/website-overhaul/grok-4.md`.

## Verdict

`V.compile` returns a program AST (`["apply", …]`), with no `sourceHash` and no artifact wrapper. `V.execute(program, inputs)` returns the run. The page bundle’s `QDLV1.compile` matched frozen `qdl-v1.js` for all ten recipes. Inputs and program ASTs were not mutated.

Canvas labels of recorded values are hidden once the editor no longer matches the run. Replay of the same request does not execute again. Scrubbing or playing the gesture does not execute. Harmonic and RGB genomes decode to the same source bytes; they are codecs. The constructor’s emitted source is the quine.

## How this was checked

Node executed frozen `qdl-v1.js` for every story baseline and every suggested change, then for the edges below. Anatomy frames used the page’s budget: 4,000 points, 3 crests. Displacement is XYZ only, in anatomy-frame coordinates, before camera projection. `rms = sqrt(sum(dx²+dy²+dz²) / 4000)`. The fourth point component is the constant `0.18` and did not move.

The bundled session was used only to count `QDLV1.execute` around compile, run, replay, verify, `session.frame`, and the page’s direct `Anatomy.frame` paint. This pass did not drive Chromium, did not re-run Quint, and did not re-run `verify-v1-library.cjs` or `sol-audit.cjs`.

## Three different changes, measured

Water-total’s pinned source hash is `ql_e02a5c069ddc078b3086c9b3a07918030bc3c90e1bad9bbbb41f1f351ad572b1` (8,125 canonical source bytes), the same hash Sol measured on `v1.html`.

| Change | What moved | What stayed |
| --- | --- | --- |
| Readings `[1.5, 2, 0.5]` to `[1.5, 5, 0.5]` | Liters 4 to 7. Input hash changes. Trace nodes `readings`, `total`, `summary` change. | `count` stays 3. Source hash stays. Emitted source stays the original bytes. Fixed-phase XYZ RMS is 0. Owners unchanged. |
| Same program, gesture phase 0 to 0.25×τ | All 4,000 points move. Water RMS `0.006764564694425559`, max `0.01211248303156437`. | Source, inputs, outputs, owner indices, and the fourth component stay. Execute calls stay 0 across `session.frame` and the page’s paint path. |
| Add `cappedWater = clamp(total, 0, 5)` and report that value as liters | Source hash becomes `ql_f90072bb6a82c6740965b274d1a452470898487a12857429f6f44a2d2e6d26dd`. Nodes 4 to 5. Edges 4 to 5. Readings `[1.5, 5, 0.5]` publish liters 7 and liters 5. Each program emits its own source. | Measurements stay 3. Both frames still contain 4,000 points, so an index-wise RMS would pair unrelated tissue. The page refuses that number and says the topologies differ. Readings `[1, 1]` publish liters 2 from both programs. |

Replay of request id `replay-check` returned the same record id with evidence `retained`. Execute calls went 0 on compile, 1 on the first run, and stayed 1 on replay and on `verify`. Water’s constructor verify reports 16 steps. A fresh session recovered the water program from `quineling-harmonics-1` and calculated a canonically equal result.

Phase RMS for the other bodies, same sampling, all 4,000 points moved, 0 owner changes: route 0.003259 / max 0.007239; receipt 0.002937 / 0.006603; checkpoints 0.006259 / 0.014330; craft 0.005186 / 0.010272; evidence 0.002635 / 0.005382; schedule 0.003046 / 0.006695; trade 0.003697 / 0.007930; needs 0.003073 / 0.006838; gather 0.003713 / 0.007930.

“Anatomy change from inputs” compares the current artifact with `session.inspect(before.artifactId)` at phase 0. Both runs share that artifact, so the figure is structurally `0 XYZ RMS` after every same-program comparison. It is a true zero. It is not a measurement of the pose on screen.

## The ten examples

“Before” is always the story baseline, usually fixture 0. “After” is the editor. The suggested-change button loads a snapshot and does not run it. The scenario menu can load a different fixture while the gold suggestion sentence stays put. Running without loading a change compares the baseline to itself.

### 1. Find a route

Baseline streets A:[C,B], B:[D], C:[D], D:[], blocked [], current true. BFS takes A’s first neighbor C. Path A–C–D, distance 2, simulated `walk-proposal`, ready true.

Closing C yields A–B–D, distance still 2, proposal still simulated, ready still true. Changed nodes: `blocked`, `route`, `path`, `proposal` (4 of 9). Source unchanged. Phase-0 RMS 0.

The chart draws that path. An edited neighbor outside A–D is omitted: A:['E','B'] still returns A–B–D distance 2, and the SVG drops E.

### 2. Decide whether to retry

The sentence says “Add an unknown second attempt after one confirmed unit.” The button does not do that.

Baseline fixture “no attempts yet” has `receipts: []` and publishes `{state:'ready', confirmedUnits:0, attempts:0, mayRetry:true}`. The loaded after-fixture is “unknown stops retry advice”: one confirmed unit plus an unknown second attempt, publishing `{state:'unknown', confirmedUnits:1, confirmedAttempts:1, unknownAttempts:1, attempts:2, mayRetry:false}`. Confirmed units move from 0 to 1. Changed nodes are only `receipts` and `result` (2 of 3). The reconcile kernel is one node, so the body has no attempt timeline.

### 3. Count the water

Baseline 1.5+2+0.5 = 4 liters, 3 measurements. Suggested readings 2+3+4 = 9 liters, 3 measurements. Changed nodes: `readings`, `total`, `summary` (3 of 4). `count` stays 3 and is the same process color as `total` (`#86acf8`). Source unchanged. Phase-0 RMS 0.

Empty readings publish `{liters:0, measurements:0}`. Append 3 to the baseline: `{liters:7, measurements:4}`. Thirteen 1’s: `{liters:13, measurements:13}`. The chart keeps only the first 12 bars and does not say so.

Negative `[-1]` never becomes a run: refusal `refinement` at `$.bindings.readings["0"]`, “Number is below minimum.” `1e308+1e308` is a failed evaluation: diagnostic `nonfinite` on `total`, outputs `[]`, effects `[]`, trace length 1. The status string “completed trace” overclaims; `total` is absent from that trace.

### 4. Check the arrival

Baseline: fresh observations, haul from source `a` and arrival from source `b`, both true, tick 10, revision 1, clock now 12 / maxAge 2 / minRevision 1. Both states `supported`, completed true.

The suggested denial from source `other` makes arrival `conflict` (support still 1, used 1 to 2). Completed becomes false. Haul’s published state stays `supported`; its skipped list grows 1 to 2 because the new row is not a haul claim. The gold chip still marks `haul` (7 of 13 nodes change). “Contradict” matches the engine. “Refuted” would not.

### 5. Price a batch of work

Baseline ore 7, wood 8, free capacity 5, requested 4. Bounds: floor(7/2)=3, wood 8, floor(5/2)=2. Feasible = min(4, 3, 8, 2) = 2. Ore used 4, wood used 2, full request false.

Capacity 8: space bound 4, feasible 3, ore used 6, wood used 3, full request still false. Changed: `freeCapacity`, `spaceBound`, `capacityBound`, `feasible`, `oreUsed`, `woodUsed`, `quote` (7 of 22). `oreBound` stays 3, so the constraint that still blocks a fourth batch is the one the chips do not mark.

Capacity 6 and capacity 7 both have space bound 3 and feasible 3. The static question “What prevents the workshop from making four batches?” stays on screen after capacity has stopped being the answer.

### 6. Keep conflicting evidence

Baseline is fixture 1: one true observation from `sensor`, claim `ready`, tick 0, revision 2, clock 10/10/2. State `supported`, support 1, refute 0, sources 1.

The suggested fixture adds the same source saying false. State `conflict`, support 1, refute 1, sources 1, `sourceConflicts: ['sensor']`, both rows in `used`. Changed nodes: `records`, `ledger` (2 of 4). This story matches its sentence.

A second true row from `sensor` leaves support at 1 and grows `used` from 1 to 2. The suggestion does not load that case.

### 7. Follow dependencies

Baseline: a 0–3, b 3–5, c 0–4, makespan 5, deadline 5 holds. Order `[a,b,c]` lists b before c even though c starts earlier.

Suggested a duration 4: a 0–4, b 4–6, c 0–4, makespan 6, deadline fails. Changed: `jobs`, `schedule`, `makespan`, `withinDeadline` (4 of 5).

Deadline 4 alone leaves the schedule object identical and flips only `withinDeadline`. Raising c from 4 to 5 changes c’s end and leaves makespan 5 and the verdict true. The chart places bars by start and end, then loses the labels. It draws at most five jobs and no deadline line.

A cycle fails evaluation: `refinement` on `schedule`, “Schedule has dependency cycle,” outputs `[]`, trace length 2.

### 8. Check an offer

Baseline now 10, expiry 10, price 3, quantity 2, inventory 5, stock 5, allowance 2. Inclusive expiry: 10≤10, `unexpired` true, proceeds 6, ready true.

Now 11 makes `unexpired` false. The chain `a`–`d` collapses. Quote `{ready:false, quantity:0, predictedProceeds:0}`, trailing boolean false. Focus node `unexpired` is the right label. Changed 10 of 28 nodes.

Price 4.5 at tick 10 publishes proceeds 9 and stays ready. Inventory 1 publishes the same all-zero quote as expiry. The output JSON does not say which guard failed. The trace does. Buttons `a · choose` through `d · choose` are unnamed temporaries.

### 9. Choose food

Baseline foods b and a, both restoration 8, hunger 4, current true. Tie break is restoration descending, then id ascending, so payload `a`, simulated, ready true.

Raising b to 9 selects `b`. Ready stays true. Changed: `foods`, `food`, `chosenId`, `itemId`, `proposal` (5 of 14).

Hunger 100 publishes the same output; only the `hunger` input node changes. Hunger 0 skips and the payload becomes `''`. A fresh edible item with restoration 0 is still a simulated eat-proposal payload `zero`. The assumption text already says this. The page does not show the chosen restoration beside the id.

### 10. Gate a collection task

Baseline checks all true, observedAt 10, now 12, maxAge 2. Age = 2, young true, eligible true, ready true, simulated payload 3.

Now 13: age = 3, young false, eligible still true, proposal `skipped`, payload still 3, ready false. Changed: `now`, `age`, `young`, `fresh`, `ready`, `proposal` (6 of 14).

Future observedAt 14 at now 12: age is 0 because of the safe minimum, `notFuture` is false, ready is still false. The six booleans are skill, route, reservation, capacity, owner permission, remaining uses, in that order. The page never says so. Fixture “resource reserved check” is the third boolean, and the suggestion sentence still talks about advancing the clock.

## Bugs

1. **Receipt story.** `lab-examples.js` sets `fixture: 2` and leaves baseline at fixture 0. The loaded pair is empty history against “confirmed unit plus unknown attempt.”

2. **Organ colors.** `compiled()` calls `Chroma.colorFor` with no lens. Designs use `palette: 'roles-1'` at strength 0.85. Water’s `sum` and `length` are both `#86acf8`. Trade has 9 opcodes and 4 colors across 28 nodes. The legend says “Organ colors identify operations.” Those pixels are role colors: input, process, judgment, and report. Gold `#e7d29f` labels are a view overlay of the after-record. Ridge strokes `#dbeed2` are one color for every dependency. Selection draws extra gold lines before any run, because `select()` focuses the story node immediately.

3. **Empty-diff caption.** When outputs are equal, the caption always says “Inspect the changed trace values.” A second run of the same water readings has changed-node list `[]`. Hunger 4 versus 100 is the caption’s real case: the output is equal and the `hunger` node did change. Those need different sentences.

4. **Schedule labels.** Bars are `#b9c6a3`. The SVG sets label fill `#11251d` (contrast about 8.93:1). `.domain text { fill: var(--ink) }` then paints them `#edf2e9` (contrast about 1.58:1). This is the stylesheet cascade, not a screenshot.

5. **Pictures drop data the JSON keeps.** Water bars `slice(0, 12)`. Schedule rows `slice(0, 5)`. Route edges skip any junction outside A–D and do not say so.

6. **“Completed trace” on failure.** Overflow and cycle traces stop before the failing node. Outputs and effects are empty, which the pre does show.

7. **Stale chrome.** Recorded-value canvas labels are passed only when `isCurrent()` is true, and the inspector’s after-value becomes `{available:false, reason:'edited inputs have no record'}`. The gold chips and the three metric figures stay on the previous comparison with no stale marker. The after pre is dimmed and prefixed “Recorded for earlier inputs.” The domain picture is cleared. On a refusal, `before` is replaced and those chips can compare the new baseline with an older success.

8. **Error styling sticks.** Only `runComparison` removes the `failure` class. “Try the suggested change” and the scenario menu replace the status text and leave it red.

9. **Broken link.** `index.html` points at `research/website-overhaul/findings.md`, which is absent. `living-copy.json` is `{}`, so the HTML sentences are the live copy.

10. **Unlabeled Before / After.** Before is re-executed from the story baseline on every comparison. Two fresh request ids mean two task runs even when both sides match.

## Accessibility and confusing controls

The page has a skip link, visible focus, `aria-pressed` on example and trace buttons, a polite run status, and a text trace beside the canvas. Reduced motion starts the gesture paused and turns off smooth scroll.

The result pres are not live regions. Changed chips expose the change by border and background only. The schedule chart is `role="img"`, so its interval text is not a text alternative, and that text is also too faint to read. The phase slider has no numeric readout. Ownership copy uses “u” with no gloss. Gather’s six checks are an anonymous boolean array. Trade’s `a`–`d` buttons are unnamed until the inspector opens.

JSON textareas are the only editor. Invalid JSON during typing is caught by `isCurrent`. Run reports `input:` plus the parser message. The 64 KiB cap in `parse` was not exercised.

Motion autoplays unless reduced motion is set. The status “No task has run yet” and a request counter staying at 0 are true while the canvas moves. The counter is cumulative across examples, the cap section, and recovery, and it is labeled “Interpreter requests” for the count of `QDLV1.execute` calls. Each of those calls also runs the constructor through `core().execute`; the badge does not count those steps.

The first tab is route-preview. Water, the example that makes a zero body-change obvious, is third.

## Codecs and the quine

For all ten compiled programs, `Quinelings.encode` / `decode` (`quineling-harmonics-1`) and `encodeColors` / `decodeColors` (`quineling-chroma-1`) admitted source equal to the constructor source. Neither encoding string equals `run.emitted[0]`.

On water, `verifyQuine` returned that same source. Executing the harmonic-decoded program and the color-decoded program produced canonically equal runs. A session-level harmonic `recover` plus `run` also matched.

“Verify source without running the task” calls `session.verify`, and the spy does not move. “Recover and run three generations” decodes source, harmonics, and colors, then executes each. The proof rows store `exactSource`, `emissionExact`, and `exactCalculation` separately. The success sentence collapses them. The section paragraph does draw the distinction: the constructor emits source; the genomes store that source as data; recovery does not read the picture.

There is no control that decodes a genome and stops, with zero task runs. The page also has no import path, so it does not promote an imported record to verified.

## Editorial revisions

**Legend.** “Colors mark roles: input, process, judgment, and report. A sum and a length can share a color. Gold text is the recorded value from the matching run. Gold lines are the selected dependency. Neither one is a source color.”

**Water caption.** “Total changed from 4 liters to 9. The measurement count stayed 3. The source hash and the phase-0 body stayed put. Gesture playback moved the pose and ran no task.” A tighter suggestion is to replace only the middle reading, `[1.5, 2, 0.5]` to `[1.5, 5, 0.5]`, total 4 to 7, count still 3. Keep the cap section on `[1.5, 5, 0.5]`, and say that a total already under 5 can change the graph without changing the number.

**Receipt.** Replace the story. Baseline: one row `{id:'a', operation:'craft', attempt:'attempt1', sequence:1, status:'confirmed', units:1}` with policy `{operation:'craft', requested:3, maxAttempts:4}`. Change: append `{id:'z', operation:'craft', attempt:'attempt2', sequence:1, status:'unknown', units:0}`. Question: “After one confirmed unit, does an unknown acknowledgement still allow a retry?” This review did not re-execute that corrected pair. Sol’s passing audit recorded the first as retryable, 1 confirmed unit, `mayRetry` true, and the second as `unknown`, confirmed units still 1, `mayRetry` false. Re-run those two inputs and print those fields. Add an attempt timeline.

**Route.** “C is closed. The shortest path changes from A–C–D to A–B–D. The distance stays 2. The walking proposal is still only a simulated receipt.” If any id is outside A–D: “This chart draws junctions A–D only. The result JSON is the whole route.”

**Craft.** “Capacity 5 allowed 2 batches. Capacity 8 allows 3. Ore still caps the quote at floor(7/2) = 3, so four batches remain impossible. `fullRequest` stays false.”

**Checkpoints.** “Arrival changes from supported to conflict because source `other` denies it while source `b` still affirms it. Haul stays supported. Its skipped list grows because the denial is not a haul claim.”

**Evidence.** “Support stays 1. Refute becomes 1. Sources stay 1. The state is conflict, and both rows remain in `used`.” Offer the second-true-row case beside it: “Support stays 1. `used` grows from 1 to 2.”

**Schedule.** “Job a growing from 3 to 4 pushes b from 3–5 to 4–6. Makespan changes from 5 to 6, so the deadline fails. c still runs from 0 to 4 beside them. The list order a, b, c is traversal order.” Draw a deadline tick. Keep on-bar labels at `#11251d` with a rule that wins over `.domain text`. If there are more than five jobs, say the chart is partial.

**Trade.** “Tick 11 fails `unexpired` (11 ≤ 10 is false). The quote collapses to quantity 0 and proceeds 0. Price 4.5 at tick 10 would instead publish proceeds 9. Inventory 1 publishes the same zeros through `hasInventory`.” Name the `a`–`d` buttons by the inputs they combine.

**Needs.** “Restoration ties at 8, so the ascending id chooses a. Raising b to 9 chooses b. The proposal is simulated; nothing is eaten. Hunger 100 leaves this output unchanged because hunger is only required to be positive.” Show the chosen restoration next to the id.

**Gather.** “Age goes from 2 to 3. The age window fails. The six checks stay true. The proposal is skipped and still carries payload 3.” Label the booleans in order. For the future-observation fixture: “Age is 0 and the observation is still in the future, so ready is false.”

**Comparison chrome.** Title the columns “Story baseline” and “Editor inputs.” When the diff is empty: “Same inputs, same outputs, same trace.” When the output is equal and some nodes changed: “The published output stayed the same. Changed nodes: …” Prefix the metric cells with “Last comparison” whenever `isCurrent()` is false. Remove the `failure` class on every non-error status write. On failure: “Evaluation failed at node `total` (`nonfinite`). Nodes after the failure are absent from the trace. Outputs and effects are empty.”

**Recovery.** Keep verify. Add “Decode harmonic genome” and “Decode RGB genome” that compare source bytes and leave the task-run counter unchanged. Keep a separate “Run the recovered program” button. Success copy: “The harmonic codec and the RGB codec each returned the original source bytes. That match is not the quine. The quine is the constructor emission, checked by Verify. The generation runs are extra task executions.”

**Page order and motion.** Open on water-total, paused. Let Play be the gesture. Point “Example audit and measurements” at the four Sol notes, or add the missing `findings.md` as an index. Rename the badge “Task runs this page.”

**Latent copy bug.** `el.textContent = value` on `[data-copy]` will remove the `<br>` inside the headline if `living-copy.json` ever supplies `headline`.

## Untested limits

No Chromium pass on the new index: no canvas PNG, no focus-order walk, no mobile layout, no reduced-motion check beyond the CSS and the initial `matchMedia` branch. Schedule contrast is computed from the cascade. Sol’s screenshots are the previous v1, gallery, create, and ranch pages.

Codec byte-identity was checked for all ten programs. A full re-execution after decode was checked for water only, plus one session harmonic recover-and-run of water. Constructor step counts were recorded for water only (16).

The corrected receipt pair was not re-executed here. The page’s actual receipt pair was. The other story pairs and the edges in this note were executed on frozen `qdl-v1.js`: negative refusal, nonfinite sum, empty and thirteen-reading water, schedule cycle, deadline-only flip, noncritical duration, craft capacities 5/6/7/8, hunger 100 and 0, restoration 0, future observation, same-source evidence inflation, route neighbor E, trade price 4.5 and inventory 1, and a same-input water rerun.

Not re-run: Quint, `verify-v1-library.cjs`, `sol-audit.cjs`, the 64 KiB editor, download, and the three-generation button’s DOM path for all ten recipes. The session replay and verify counts are the bundled session, whose water program matched the frozen compiler.