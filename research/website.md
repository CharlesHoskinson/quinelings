# Website implementation

Owned files: `index.html`, `style.css`, `gallery.js`, and this report. The old `app.js` is unused. No deployment or external writes.

The dependency-free gallery fetches the manifest and ten envelopes, constructs executable ASTs through `Q.makeTaskProgram`, and uses the documented shared APIs. Scripts load orbit, kernels, core, then gallery. Fixture overrides are copied into literal nodes before constructing the quine so the source, genome, task results, and subsequent generations refer to the same exact program. Repetition is bounded 1–8.

Controls support specimen selection, fixture selection, task/quine execution, trace replay, fresh-generation reconstruction and execution, full harmonic-sample recovery followed by execution, independent exact RGB recovery followed by execution, canonical source inspection, and three JSON downloads. Text from envelopes is inserted through textContent. Source inspection is readonly. Effects are identified as local simulations.

## Design

Read `docs/DESIGN-LANGUAGE.md`. Family formulas are original bounded trigonometric point-cloud grammars: upright filament, jelly bell/tentacles, moth wings, rooted coral fan, folded ribbon, coiled nautilus, compact seed, open torus, directional comet, and radial bloom. Degree, depth, fanout, quote depth, opcode frequency, and bounded literal magnitude drive surface folds and organ radii. Shared `Q.nodePosition` and `Q.edgePoint` supply actual topology; a family transform preserves pinned edge endpoints. Neutral body ink with sparse semantic ridges preserves a density hierarchy. Low-opacity idle graph links become clear on inspection. Selected organs and replayed recorded operations highlight actual node IDs; replay sends short pulses along their incident links without re-executing effects.

All thumbnails use phase zero for a coherent collection comparison. Semantic color can be disabled for a grayscale inspection. Animation uses deterministic shared phase; no random per-frame jitter. Reduced-motion preferences start paused. Main canvas and thumbnail envelopes leave substantial negative space. Layout uses responsive five-column/two-column collection, desktop split inspector, and stacked mobile panels; no network font dependency.

The renderer expresses broad family identity and real dependency topology. Design targets such as a *chosen BFS route* mapped to a particular anatomical path, evidence support/refutation occupying separate petal regions, a seed's branched crown, and per-retry attempt sequencing are not yet bespoke semantic encodings: these outputs remain explicitly inspectable in the task panel. Do not claim those exact anatomical correspondences. Appearance alone is not executable meaning or exact source recovery.

## Verification

`node --check gallery.js` passes. A temporary Node VM DOM/canvas harness executed the actual gallery initialization and controls against the current shared runtime and all ten envelope files: 10 specimens loaded, 53 fixture outputs matched, and every specimen passed fresh-child reproduction, harmonic recovery, and RGB recovery. No missing documented APIs were found. The harness intentionally supplies the manifest IDs from the directory, so an HTTP manifest fetch still needs browser verification.

A local HTTP server plus installed Brave headless screenshot was attempted with an isolated temporary browser profile and without extensions; the browser timed out without a screenshot. Visual desktop/mobile review remains outstanding. Root can repeat with its browser tools. The renderer has not been falsely marked visually reviewed.

## Contrast revision after root review

Root reviewed `research/library-preview.png` and found the first rendering too dim and dusty, with organs dominating the body. The renderer now layers 12–22 continuous sampled family strands (140 samples per thumbnail strand, 300 per main strand) over the quieter point cloud. The family has an explicit curve grammar: folded vertical filaments, jelly dome/tentacles, moth wing contours, rooted coral branches, winding ribbons, spiral chamber contours, seed shell veins, toroidal seams, converging comet trails, and bloom petal contours. Depth/fanout tune their folding and strand count. Bright core strands use .72 alpha and secondary ridges .42 alpha, with point overlap building continuity. Default organ alpha decreased from .28 to .12 and default radii to 70%; inspected/selected organs retain full contrast. This should make grayscale silhouettes readable without relying on rosettes or rainbow color. Syntax and all 53 integration fixtures still pass after this change. Root will rerun screenshots for visual acceptance.

## QDL integration

`index.html` loads `qdl.js` before `core.js`. Both the selected program and every thumbnail now call `Q.makeTaskProgram(graph, repeats, QDL.create(skin.family))`, embedding the validated profile inside canonical source. Rendering reads `shape.design.family`, framing scale, neutral ink and the three alpha hierarchy constants, and motion phase rate. Organs use `QDL.organRadius` directly; pinned filaments already use the core's QDL-driven `Q.edgePoint`. Reproduction and both recoveries therefore preserve the species design profile as well as task code. Rechecked actual gallery controls against updated core/QDL: all ten programs, 53 fixture outputs, fresh-generation execution, sample recovery, and RGB recovery pass.

Final framing fix: both thumbnails and the main view now use `min(framing.scale, .5 - framing.padding) * min(width,height)`. Default .12 padding caps normalized scale at .38, so vertical bodies retain margins rather than clipping at the old thumbnail .65 scale. The footer links the design language, QDL documentation, and executable Quint specification. Ownership is handed back to root for final integration and browser review.
