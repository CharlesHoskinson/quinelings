# Living Thoughts: first editorial draft

Draft for the sequential Inkwell editorial passes. Homepage text is in [living-copy.json](../../living-copy.json), keyed to every existing `data-copy` field. Each value is plain text for `textContent`; the headline does not depend on the previous `<br>` element. No voice profile is active. Grounding is the supplied [Inkwell research extract](inkwell-grounding.txt), the project contract, the current implementation, and all eight review reports listed below. This draft makes no new claim of verification.

## Reader brief

The visitor is curious about an animated program and may know neither quines nor dataflow graphs. They first need a task they can understand, a small edit they can make, and an answer they can check. Let the water sum or alternate route establish that a real calculation happened. Then let inspection connect its recorded values to its body.

The next question is why the body can remain unchanged. Explain that the source owns the graph and anatomy, while an invocation supplies values. Introduce a source edit only after that distinction is visible. Finish with exact source emission and recovery, keeping their controls and evidence distinct. The reader should leave able to explain what “Living Thoughts” means without attributing awareness, private model reasoning, live City access, or new planning algorithms to these programs.

Use ordinary task names. Keep the exact quantities that explain a result. An unchanged output can reveal a real constraint: more wood cannot defeat an ore limit, and a repeated witness does not add an independent source. A hash helps locate an artifact; a changing hash alone is not a useful explanation.

## Protected claim inventory

| Claim to preserve | Basis and limit |
| --- | --- |
| A QDL 1 task is an authored finite typed graph, evaluated locally with supplied named inputs. | [Program contract](../../docs/PROGRAM-CONTRACT.md), [QDL 1 library](../../docs/QDL-V1-LIBRARY.md), [correctness review](sol-correctness.md). The contract also describes the older literal-override interface; do not apply that input model to the new homepage. |
| The public thought is an author declaration. It is not evidence of private cognition or autonomous understanding. | [QDL 1 workspace](../../v1.html), [translation notes](../../docs/TRANSLATION.md), [novelty review](sol-novelty.md). No general English proposer is connected on the QDL 1 page. |
| Runtime inputs can change outputs and trace values without changing program source or anatomy. | [Browser measurements](sol-browser.md), [Grok 2](grok-2.md), [Grok 4](grok-4.md). Water input comparisons have unchanged fixed-phase geometry. Some input edits also leave outputs unchanged. |
| Anatomy is a visual index with source-declared ownership. Its attachment structure is separate from computation dependencies. | [Browser measurements](sol-browser.md), [Grok 4](grok-4.md), current `compiled`, `draw`, and `renderTrace` code. A selected connection is an inspection overlay, not a new task edge. |
| Source changes can alter computation, ownership or design; they need not produce a conspicuous body change or a different answer for every input. | [Novelty review](sol-novelty.md), [Grok 1](grok-1.md), [Grok 4](grok-4.md). The water cap changes the graph but leaves totals below five unchanged. The component tree in that example remains the same. |
| Gesture playback evaluates presentation equations without evaluating the task. | [Browser measurements](sol-browser.md), [Grok 3](grok-3.md), [Grok 4](grok-4.md). Motion is not a trace replay, execution counter, or inference process. |
| The homepage uses role colors. Distinct operations may have the same color. Gold runtime labels come from a matching recorded run. | [Grok 3](grok-3.md), [Grok 4](grok-4.md), current `Chroma.colorFor` call. Do not replace this with an opcode-color or value-pigment claim. |
| The quine claim is exact constructor source emission. | [Grok 2](grok-2.md), [Grok 3](grok-3.md), [Grok 4](grok-4.md), `verifySource`. Verify executes the constructor, not the declared task. It does not establish the correctness of a task output. |
| Harmonic and RGB genomes are separate source codecs. They recover underlying data, not a screenshot. | [Grok 4](grok-4.md), [mapping specification](../../docs/MAPPING.md). Passive recovery and recovery followed by execution are different actions. |
| Fresh recovered copies can be run with retained inputs and compared with the original run. | [Grok 3](grok-3.md), [Grok 4](grok-4.md), `generations`. This checks the selected inputs; it is not a proof for all possible inputs. Recovered source does not recreate absent execution history or authenticate external facts. |
| Only gather, route and food-choice recipes publish simulated action receipts when their guards pass. | [Grok 1](grok-1.md), [correctness review](sol-correctness.md). A quote, schedule or reconciliation result is data. A skipped receipt can remain in outputs while the effects list is empty. Nothing gathers, moves, trades, eats or retries externally. |
| Refusal, failed evaluation and a completed negative decision are different outcomes. | [Correctness review](sol-correctness.md), [Grok 3](grok-3.md), [Grok 4](grok-4.md). A failed occurrence has a diagnostic and the trace completed before failure, with no published outputs/effects. |
| Exact request replay returns the retained record without another task evaluation. | [Grok 3](grok-3.md), [Quint review](sol-quint.md). An imported assertion is not locally verified execution evidence. |
| Familiar algorithms underpin the tasks. The engineering experiment joins computation, source-owned anatomy and reproducible identity. | [Novelty review](sol-novelty.md), [Grok 2](grok-2.md). No historical priority or novel planning-algorithm claim is established. |
| Formal evidence has a stated boundary. | [Quint review](sol-quint.md). Its finite token model explores identity, provenance and transition rules; it does not prove the JavaScript interpreter, renderer, hash, codec or all inputs correct. |
| The Ranch constructs candidates under explicit rules. Preview, admission, social proposal and Run are different events. | [Browser measurements](sol-browser.md), [Ranch guide](../../docs/SDK-RANCH-GUIDE.md), [workshop](../../ranch-workshop.html). Body inheritance can retain a task; parent hashes alone do not authenticate ancestry. |

## Proposed example copy

These are replacements for the visitor-facing fields in [lab-examples.js](../../lab-examples.js). They preserve the supplied scenarios. Where a change is merely suggested, the sentence describes what the button will load, not what is necessarily in the editor after another fixture was selected. Dynamic outcome copy must follow the actual run.

### Water total

- Title: **Total the water readings**
- Question: **How does a new set of readings change the total?**
- Rule: **Add the readings and count how many were supplied.**
- Assumption: **Readings are supplied in liters. This program has no sensor or stored running total.**
- Change: **Load 2, 3 and 4 liters. The total becomes 9; the reading count stays 3.**

The baseline is `[1.5, 2, 0.5]`, totaling 4 across three readings. The existing suggested change replaces all three values. A smaller optional experiment would replace only 2 with 5 and show 4 → 7 with the count unchanged. That requires changing the scenario as well as the copy. Preserve the raw floating-point answer for `[0.1, 0.2]`; presentation must not imply exact decimal arithmetic.

### Route preview

- Title: **Find an open route**
- Question: **Can D still be reached when C closes?**
- Rule: **Find the route with the fewest edges from A to D. Use neighbor order to break ties.**
- Assumption: **The caller marks the map current. Each edge has equal cost, and the walking proposal is a local simulation.**
- Change: **Close C. The route changes from A–C–D to A–B–D, still two edges.**

Keep the computed route visible when `current` is false, but label the proposal skipped. A chart limited to A–D needs an explicit partial-view notice for other neighbor strings. Do not say that closing any junction changes the path: closing unused B does not.

### Craft quote

- Title: **Quote a batch of work**
- Question: **How many of the four requested batches fit the available materials and space?**
- Rule: **min(requested, floor(ore / 2), wood, floor(freeCapacity / 2))**
- Assumption: **Each batch uses two ore, one wood and two spaces. The quote reserves no materials.**
- Change: **Increase capacity from 5 to 8. The quote rises from two batches to three; seven ore still prevents a fourth.**

“Price a batch” suggests money, which this program never computes. Keep the ore constraint visible even though its node value does not change.

### Confirmed checkpoints

- Title: **Check the arrival**
- Question: **What happens when a fresh report denies arrival?**
- Rule: **Complete only when fresh observations support both haul and arrival, with no eligible contradiction.**
- Assumption: **The records supply their own source labels and times. These do not authenticate witnesses or prove an outside event.**
- Change: **Add a fresh denial of arrival. Arrival becomes conflicted and completion becomes false; haul stays supported.**

The displayed state is exactly `conflict`, not `refuted`. This recipe accepts observation kind only. The broader evidence ledger below also accepts testimony and inference.

### Evidence ledger

- Title: **Keep conflicting evidence**
- Question: **What happens when one source says both yes and no?**
- Rule: **Count each source once for support and once for refutation. Keep both sides of a conflict.**
- Assumption: **The supplied clock and revision limit determine which records count. Renaming a source does not establish an independent witness.**
- Change: **Add a denial from the same source. Support stays 1, refutation becomes 1, and the source count stays 1.**

This starts from fixture 1. Preserve the distinction between two disagreeing sources and a single self-contradicting source: both can yield `conflict`, but only the latter fills `sourceConflicts`.

### Offer quote

- Title: **Check a sale quote**
- Question: **Does the quote survive one tick past the offer’s expiry?**
- Rule: **Quote the full quantity only if offer, expiry, stock, inventory and allowance checks pass.**
- Assumption: **The recipe selects the offer named “offer.” It quotes a sale in symbolic crystal units and makes no payment.**
- Change: **Advance the supplied time from 10 to 11. The expired offer yields quantity 0 and proceeds 0.**

The baseline proceeds are 6. Equality at expiry is accepted. This is not a best-price search, a purchase affordability check or a partial-fill policy. The selected trace can distinguish expiry from inadequate inventory even when both publish zeros.

### Food choice

- Title: **Choose a food candidate**
- Question: **Which fresh edible food has the highest restoration value?**
- Rule: **Choose the greatest restoration value; break ties by ascending item ID.**
- Assumption: **Hunger only needs to be positive, and freshness is supplied. Even zero restoration is eligible. The result is a simulated proposal.**
- Change: **Raise b’s restoration from 8 to 9. It wins the choice over a.**

The baseline tie selects a. This does not optimize nutrition or predict hunger reduction. Where space allows, show the selected restoration alongside its ID.

### Receipt reconciliation

- Title: **Review retry advice**
- Question: **After one confirmed unit, does an unknown second attempt allow a retry?**
- Rule: **Retain confirmed units and stop retry advice while an attempt is pending or unknown.**
- Assumption: **The caller supplies the attempt history. The program reviews it and submits no work.**
- Change: **Add an unknown second attempt. The confirmed unit remains; mayRetry changes from true to false.**

This wording depends on the corrected controlled baseline: requested 3, cap 4, one confirmed unit in attempt1; then append an unknown attempt2. Root’s current `baselineInputs` and `transform` implement that pair. Earlier reviews measured the previous empty-history baseline and must not be presented as measurements of the corrected pair. Confirm the changed pair before publishing these expected results. Distinguish receipt IDs, attempt IDs and sequence numbers in any timeline.

### Gather readiness

- Title: **Check collection readiness**
- Question: **Is the observation still recent enough for a collection proposal?**
- Rule: **Require all six checks and an observation no later than now and no older than maxAge.**
- Assumption: **Checks mean skill, route, reservation, capacity, owner permission and remaining uses, in that order. The caller supplies these values.**
- Change: **Advance now from 12 to 13. The observation becomes too old, so the simulated proposal is skipped.**

The skipped receipt still carries payload 3; it reports no collected units. Future observations are also rejected by the readiness guard even though the safe age calculation returns zero.

### Work schedule

- Title: **Follow job dependencies**
- Question: **Does one extra tick on job a push work past the deadline?**
- Rule: **Start each job when all its dependencies end. Independent jobs can start together.**
- Assumption: **The estimate assumes unlimited parallel capacity. It reserves no workers and executes no jobs.**
- Change: **Increase a from 3 to 4 ticks. Job b finishes at 6 instead of 5 and misses the deadline.**

Job c remains at 0–4. The output order is stable traversal order, not chronological dispatch. Chart intervals should use actual start/end values; partial charts must say how many jobs they show.

## Other pages and documentation

### Archive and original gallery

Keep the newly added archive banner and the fixed-cap warning. Suggested wording: “This is the original experimental gallery. Choosing a scenario rewrites values inside the program and creates new source. The QDL 1 examples accept new inputs without rewriting their source.” Keep the Pulsekeeper sentence adjacent to its control: “This budget input changes the budget report. Retry itself uses a fixed cap of four.”

In the first walkthrough, replace “Change the inputs” with “Build the healthy-lamp scenario.” Follow with: “Selecting this scenario writes different lamp readings into the source. Run that program to see a score of 0.125 and a skipped repair.” Preserve the source-generation distinction through the reproduction paragraph.

Replace “From Midnight.city to a mathematical body” with “From a supplied task to a mathematical body.” Suggested caption: “Public Midnight.city artwork illustrates this authored task. The graph below defines the local calculation.” Keep artwork provenance linked. The existing translation document already explains this boundary accurately; apply it earlier in the page.

Replace “Infinite curiosity” with “Inspect the calculation.” Replace “One program. Three ways to understand it.” with “Follow the task into its body.” These cuts remove unsupported mental-state language and scaffolding without touching the program claims.

### Creation workspace

The opening already asks for an explicit task recipe. Retain it. Replace “Your words become explicit operations” with “Supported task syntax builds explicit operations. Open the interpretation to inspect what was built.” Replace “A thought, taking shape” with “The authored program’s body.”

Keep the optional proposal service description close to its toggle: “A separately configured service can propose a typed plan from other text. This browser validates the plan’s structure; you still need to check that it expresses your intended task.” Build success does not certify arbitrary English understanding.

Preserve the companion-artifact distinction in export help. On this legacy creation surface, original words and interpretation can travel outside executable source. Do not generalize QDL 1’s source-embedded public declaration to every old artifact.

### QDL 1 workspace

Replace “Give a thought something to do” with “Build a task. Supply its inputs.” Keep the explicit public-text/typed-graph distinction beneath it.

Change “The authored anatomy defines the shape; role pigments identify operations” to “The authored anatomy defines the shape. Colors group operations by role; selecting an operation identifies the tissue it owns.” Preserve the sentence that viewing and seeking execute no task.

Keep imported histories labeled asserted. A matching source hash is not evidence that a restored result was computed locally. The source verification panel should describe constructor emission, while the run panel describes task output.

### Ranch and workshop

Replace “Two thoughts become a family” with “Construct a child from explicit program rules.” Replace “Every meeting holds a new possibility” with “Meetings can propose a pairing.” Pairing is bounded local simulation and may not succeed.

Suggested short explanation beside construction: “Compose connects compatible ports. Mate replaces an eligible pure slice. Merge retains both tasks, while Body keeps one task and varies its form. Preview lets you inspect candidate source; admission stores it. Run creates a task result.” These are four genuinely distinct rules, so the list serves comparison rather than a rhetorical pattern.

In the workshop, replace “A useful new lifeform” with “Connect their calculations.” The reservoir/waterkeeper example provides the concrete reason: measured water can feed an allocation input. Preserve the notice distinguishing a library child from a recorded meadow birth.

Keep gesture time and social time visibly separate. Neither is a task run, and an imported resident’s source does not recover missing verified ancestry. Avoid “learns,” “wants,” or “understands” as literal explanations of the bounded policy.

### Documentation orientation

The [README](../../README.md) currently introduces the original family gallery and later introduces a second ten-recipe QDL 1 library. Lead with the homepage lab and name the libraries separately. Suggested opening: “Quinelings are authored local programs with mathematical bodies. The homepage runs reusable QDL 1 recipes on supplied inputs; the original gallery preserves programs whose scenarios rewrite source. Both let you inspect a calculation and check exact source reproduction.” Move legacy viewer controls under the original-gallery link.

Mark [Thought to lifeform](../../docs/THOUGHT-TO-LIFEFORM.md) as a historical design proposal at its opening. Its “production validator does not yet accept” and “does not freeze version one” statements describe an earlier stage, while current QDL 1 documentation describes the shipped stable profile. Suggested notice: “Historical design proposal. For the implemented stable language, read QDL-V1.md; creation and Ranch policies retain their separately documented experimental status.” Preserve the original proposal below that notice.

The library’s task-specific limits are already useful. Link to them from relevant examples instead of summarizing fixture totals as proof of quality. The audit index should lead with the observed source/input/view separation and exact recovery evidence, then disclose refusals, failed evaluations and scope limits.

## Implementation dependencies for the next editor

The draft assumes root’s requested corrections will land: controlled receipt baseline; accurate partial-trace failure status; stale/refused comparisons labeled and excluded from current metrics; role-color legend; passive genome-recovery controls; and partial chart notices. These are implementation work, not corrections this copy file can perform.

Keep the counter labeled “Interpreter requests” or explain it equivalently: it includes typed refusals and spans all page experiments. “Task runs” alone would miscount refusals. A comparison normally requests both baseline and edited-input evaluations. Exact replay, constructor verification and passive codec recovery add no task requests; the generation action deliberately does.

The static water-cap introduction explicitly names the example readings. If the editor replaces them, the result caption must report the actual outputs. At a total below five, the source still differs while both totals match. Do not describe that as a failed edit.

The hero canvas follows the selected program even after evaluation. Replace its fixed caption “The selected program, before evaluation” with “The selected program’s source-owned body.”

No frozen recipe, registry pin, source vector or release artifact is changed by this editorial draft. Suggested titles, explanations and source variants belong to the website layer. Retain the actual runtime error code alongside a readable error explanation, including `refinement` for the schedule failure.
