The candidate is not ready to implement. Its renderer skeleton is sound, but the phenotype map, birth and merge ceremony, pixel budgets, and accessibility contract would mis-draw lineage, mis-state the world, or leave the publication gates untestable.

This audit covers only the candidate text above. It did not read the repository, run models, or measure frames. The figures 81.4 ms and 106.6 ms are assertions in the candidate, not results of this review.

## Required corrections

### RC1 — Phenotype map is not an inverse of the legacy measurement
Severity: critical. Section 3, applied in section 7.

Elongation, spread, curvature, and gesture are deltas on an already expressed body. Phase and chroma are absolute overwrites. The two aspect zeros cannot occur together. `spread` is zero at `r/e = 0.6` (`e/r = 5/3`), while `elongation` is zero at `e/r = 1.5`. At `e/r = 1.5`, the spread trait is `round(1000*((2/3)-0.6)/0.6) = 111`, so the radial scale becomes `1.0111` and the ratio moves to about `1.484`. A gesture of `0.825` derives trait `500` and is reapplied as `0.875`. Curvature `b` returns as `b+0.125b` until it saturates, after which every `|b|≥0.2` shares one trait. `Math.round` rounds halves toward `+∞` (`Math.round(-1.5) === -1`), and `trait/1000` is not a binary rational.

Counterexample: body recipe, `mutation:'none'`, metadata-free parent with `e/r = 1.5`, `gestureStrength = 0.825`, `bendX = 0.08`. The child silhouette, gesture, and bend all differ from the parent. The novelty rule then treats that drift as a real body change. A neutral parent can be refused because heredity moved it off its own measured shape.

Correction: make all six traits absolute targets on one integer lattice of micro-units, with one published inverse. Use a single aspect coordinate such as `log(e/r)` and an independent size coordinate. Zeros must be simultaneously realizable. Apply `axial = 1000000 + 120*trait` and the matching exact forms for the other fields. Clamp on that same lattice so clamp and quantize commute. Round symmetrically, and map `-0` to `0`. For `mutation:'none'`, if the trait vector equals the substrate’s measured vector, resolved authoring values must equal the substrate up to that lattice. Record any saturation in the candidate diagnostics. The substrate must be named: recipient anatomy for compose and mate, base parent for body, and an explicit rule for merge. Blended traits replace substrate parameters. They are not added again.

Test and model obligation: Lean, or an integer executable checker later, must prove round-trip on the lattice, including negative twins and saturation. A future body-recipe fixture with `mutation:'none'` must match the base parent’s resolved visual fields. This audit did not run that check.

### RC2 — Seed draws and mutation are not an algorithm
Severity: critical. Section 3.

“The first four bytes big-endian seed Anatomy.generate” does not name the byte width, the generator, or the six independent choices. `floor((A+B)/2)` pulls odd negative sums toward `−∞`: `floor((-3+0)/2) = -2`. Gentle mutation’s locus, sign, and order relative to the blend are unnamed. `style.traits` together with `mutation:'gentle'` has no precedence. Canonical JSON is explicitly not RFC 8785, but no byte grammar replaces it. Two correct implementations can emit different creatures from the same parents, nonce, and recipe. That breaks the later demand for exact emitted source.

Correction: one numbered procedure. Canonicalize with an explicit UTF-8 byte grammar and published test vectors. Domain prefix is a fixed string. Expand the seed with a fixed counter, not an open-ended `Anatomy.generate` call. For each trait in a fixed order, choose parent A, parent B, or midpoint. Give the odd remainder to parent 0 and record it. If `style.traits` is present, it is the child vector and `mutation` must be `'none'`. Otherwise, after the blend, choose at most two distinct loci and signed deltas of magnitude `1..80`, saturate, and record pre-blend, blend choice, delta, and post-saturation value. No wall clock and no task result enters this procedure.

Test obligation: frozen vectors for midpoint remainder, mod-or-rejection sampling, gentle saturation at `±1000`, and the override-versus-mutation conflict. Same vector in the future TypeScript and Lean checkers. Do not call the draws unbiased.

### RC3 — Ceremony must not rewrite who exists or where they are
Severity: critical. Sections 1, 2, 4, and 7.

Parents are not consumed. The child is admitted at a nursery spawn. A crossfade of “valid source bodies” can fade parents out, blend them into each other, or draw the child at the rendezvous and then show it in the nursery. Additive glow at mid-fade sums both bodies and washes the silhouette out at the moment the birth is supposed to be readable. Queue overflow is unnamed, and a duplicate admission acknowledgement can enqueue a second ceremony for one child.

Correction: ceremony is a render-only overlay keyed by admission `requestId` or derivation id. Duplicate acknowledgements do not enqueue again. Parents stay at full opacity at their reserved poses. The child fades in only at the admitted spawn. Kinship ribbons are screen-space or otherwise non-trajectory decoration, in a non-role pattern, and they do not recolor resident pixels. Blend is standard premultiplied alpha under one glow budget, the maximum of the two contributors, not the sum. Recipe grammar is fixed: compose marks the donor output and recipient input; mate marks the chosen nodes and badges protected actions; merge shows namespace A, namespace B, and a reserved report color for generated report nodes, with litres and seconds kept on separate fields; body shows a same-task badge and, when applicable, the text “same-source variation.” One foreground ceremony. Ambient courtship is not that ceremony. If the replay queue is full, the resident list keeps an unseen-birth indicator. Renderer failure does not roll back the committed child.

Test obligation: future `worldInspect` during a ceremony returns admission poses, not interpolated poses. A double-delivered acknowledgement yields one child and one ceremony. Screenshots at fade midpoint must still separate the two parent silhouettes and the nursery child. No test of that exists yet.

### RC4 — Extreme traits can escape the guard
Severity: major. Sections 3, 4, and 7.

Guards are fixed: half-width 24 in a `512×320` arena. Axial scale `1.12`, radial scale `1.10`, and `gestureStrength + 0.10` enlarge the envelope. A parent that already fills the guard produces a child whose full gesture does not fit. The meadow rule requires every gesture envelope to lie inside its guard. Clamping authoring fields does not imply that bound.

Correction: after resolution, compute a conservative bound over the whole gesture, not only the rest pose. If it does not fit the guard, reject the candidate with a named diagnostic, or apply one recorded uniform fit-scale stored in the resolved source. Draw nothing outside the guard. Previews render in the inspector only. The arena draws admitted residents only.

Test obligation: a future fixture at trait `+1000` for elongation, spread, and gesture must either reject or fit, including phase extremes. A preview must not change arena reservations.

### RC5 — Color and material erase the mathematics
Severity: major. Sections 2 and 7.

Role color is the operation encoding. One `chromaStrength`, a warming clearing, and additive particle glow all shift hue. Merge children carry both parents’ roles plus a generated report. In grayscale the hue channel disappears. At overlap, additive glow moves distinct roles toward white.

Correction: lock a material thesis. Role hue is categorical and constant under pigment, energy, affinity, and courtship. Pigment and glow change only luminance, inside a cap that keeps palette entries separable. Lineage, if shown, is a rim or ridge pattern, not a hue shift. The report node has a reserved non-role pattern. Courtship does not grade resident pixels. The word “warms” should leave the candidate. Energy, rest, affinity, and proposal state are list badges plus non-hue cues. Affinity overlay defaults off. All readable text is HTML, including source labels, the role legend, and the variation-versus-two-parent classification. Generated companion prose is marked generated. WebGL contains no text.

Test obligation: future sparse and dense reviews at desktop, mobile, grayscale, and reduced motion, plus a ceremony midpoint. Rubric: silhouette readable, roles separable without hue, no whiteout, nursery distinct from adults, units unblended on merge reports. Human review remains required. Passing the rubric does not prove beauty.

### RC6 — The 32-resident scene does not fit the stated budgets or the 320 px claim
Severity: major. Section 7.

`32 × 1000 = 32000` exhausts the meadow tissue cap before ridges or particles. Eight residents at `4000` samples do the same. “Analytic” particles may be fragment overdraw. The cap never says which. Focused detail “separately” can draw a second tissue for the same resident and double the additive glow. The acceptance target covers eight residents, while the world allows 32. Arena width `512` on a `320` px layout makes a guard about `30` px wide, too small for ridges or owner structure. A non-uniform shrink to the `2e6` pixel cap would turn axial and radial traits into false ellipses.

Correction: split budgets for body samples, ridge vertices, and fragment glow. State that `32` minimum bodies plus ridges plus glow fit, or drop distant residents to the list with an impostor. One tissue draw per resident per frame. The inspector replaces meadow LOD for the focused resident. Framebuffer scale is uniform, with letterboxing. Project anchors from CPU pose matrices. No synchronous GPU readback on the frame path. On a `320` px layout the list is primary, and any inspected body is shown at a readable crop of at least `120` px. Initial spawn coordinates, or a deterministic placement rule, are part of the candidate so the sparse scene is fixed.

Test obligation: future draw-call accounting shows one draw per visible resident. Dense mode at 32 residents has its own interval target, or a hard visible cap. CPU time includes pose, upload, and any world ticks that ran inside that frame. The `p95 CPU ≤ 8 ms` and `presented interval ≤ 33.3 ms` gates apply only to a named hardware WebGL2 class, after a stated warmup and sample length. Software rendering is a disclosed fallback with a smaller visible set and must not be scored as if it were that gate. The eight-body Canvas baseline needs a published method before anyone cites it.

### RC7 — Motion clock, cache, and ridges are under-specified
Severity: major. Sections 4 and 7.

Phase is forbidden from affecting world decisions, but the candidate never says whether displayed phase is a function of tick or of wall-clock frames. Hidden-tab pause, pause-all, ceremony timing, and replay then diverge. Six `240` px poses per body, inside `16 MiB`, posterize motion. Fine ridges without a screen-space frequency cap crawl at meadow scale. Context restore can hitch or flash empty during the one foreground ceremony. Idle prewarm can steal the frame that the `8 ms` budget is measuring.

Correction: displayed phase is a pure function of tick and resolved `phaseRate`, so replay is determined by committed state. Pause-all, reduced motion, and hidden-tab pause freeze phase, particles, ribbons, and ceremony tweens. State changes appear immediately. Canvas fallback may show at most those six bins and must say so. Ridges follow owner or chart parameter lines, fade below Nyquist, and must not create a second silhouette. Keep the last presented frame, or one fallback pose, across context loss. Restore at most one resident per frame. Prewarm runs only after a frame that used less than half the CPU budget, and never during a ceremony.

Test obligation: the same tick sequence must produce the same phase bins in a future controller replay. A paused dense frame must not show ridge crawl. No such recording exists yet.

### RC8 — Accessibility is declared complete without a behavior contract
Severity: major. Sections 6 and 7.

Keyboard support, a `320` px layout, reduced motion, and pause-all are asserted, but there is no key map, live-region policy, focus rule, or hit-size rule. `worldCommand` bundles retire and cancel with advance. `offspringFrame` has no size or meaning. A family demo is a sequence of real commands, so a mid-sequence failure is visible partial state.

Correction: the resident list is the accessibility tree. The canvas is `role="img"` with an HTML summary, or `role="application"` with a documented key map. Selection, pause, preview, admit, run, and retire do not share keys. Run and admit are distinct. Retire is confirmed and is not adjacent to the demo control. `aria-live="polite"` covers proposal, commit, rejection, and not-run. Retire is assertive. Ceremony does not move focus. Hit targets are at least `44` px. `offspringFrame` is a bounded JSON pose descriptor under the existing response cap: quantized matrices, palette indices, and ceremony phase. It is not a bitmap. Document demo order: failed admission enqueues no ceremony. A committed child remains if display fails. Microcopy must not describe pairing as consent. The candidate’s own term is a local scenario setting.

Test obligation: future keyboard passes for list, inspect, preview, admit, run, pause, replay, and a reduced-motion cut. An accessibility tree check must find names for role, nursery, rest, stale, and not-run without relying on color. Schema check: destructive command kinds are separate `oneOf` branches. This audit did not exercise a UI.

### RC9 — Low LOD can erase an owner, and trait application can break the embedding
Severity: major. Sections 3, 7, and 8.

Meadow layouts may use `1000` samples while “retaining every owner.” Nothing forces each owner to receive a sample. Hinge connectivity can stay fixed while axial scale plus curvature self-intersects. The candidate already leaves global atlas and seam regularity unproved. A silent clamp would still publish a different shape than the trait names.

Correction: every owner and chart reservation receives at least one meadow sample. Assembly failure after traits rejects the candidate with a diagnostic. It does not publish a clamped embedding as if it were the requested trait. High-curvature review is part of the visual gate.

Test obligation: for the ten starter graphs and the section 8 children, a future layout check shows every owner present at `1000` samples. One near-degenerate curvature fixture must reject or remain non-self-intersecting. A Lean proof is not claimed unless it is actually produced. Finite checks and proofs stay separate, as section 8 already says.

## Optional enhancements

These are not gates.

- Idle motion may use a curve that stays inside the swept box. Straight reservation is already an honest rule.
- State the shared material sentence in the docs: one luminous family, variation in proportion, tempo, and lineage pattern.
- Publish the four clearing centers with the spawn list so “spacious” is a measured margin.
- HTML meadow labels can update slowly, while the selected resident tracks its CPU-projected anchor. Avoid per-frame layout of 32 labels.
- Rim-light lineage, kept off role hue, would make families readable once RC5 is in place.

## Unproved, and not established by this candidate

- Visual beauty, including any claim that bounds or a future shader imply it.
- The `8 ms` and `33.3 ms` targets, and the transfer of the `81.4 / 106.6` ms Canvas baseline.
- Non-self-intersection, seam regularity, and chart quality after trait application.
- Pixel-identical silhouettes across GPUs. Float32 CPU positions can support a one-pixel bound. Glow banding cannot.
- Perceptual smoothness of six pose bins.
- Hue separation under additive blend, until RC5’s cap exists and is measured.
- SHA-256 collision resistance, full IntentIR refinement, continuous collision, and English fidelity. Section 8 already excludes these. This audit does not add them as proved.
- In-memory admission atomicity is not crash durability. Section 5 already says so. Ceremony and preview must not be described as part of that transaction.

## What should be kept

The split between committed events and display is the right honesty rule: rendering, seeking, replaying, and skipping do not admit a child or run a task. One shared WebGL2 scene, immutable rest layouts, CPU pose matrices, GPU transforms, and a single shared Anatomy sampler are the right performance shape. Role color tied to real child operations, merge that refuses fake topology interpolation, a bounded canvas fallback, no phase-keyed cache, and targets labeled unmeasured are the right constraints. Quoting exact source, keeping task runs out of inspect and preview, and marking same-source body inheritance as variation are what the pictures must teach.

## Recommendation

Do not implement this candidate yet. Accept it for implementation only after RC1 through RC9 are written back into the candidate as normative text, with the integer phenotype inverse, the render-only ceremony grammar, the split budgets, the tick-phase clock, and the accessibility behavior table. No new proof, browser run, or performance result is implied by this audit. After those corrections, the ranch concept is fit to build, and publication still depends on the candidate’s own later evidence: failure and transaction tests, real browser frames, the visual rubric, and the hardware-scoped timing gate.
