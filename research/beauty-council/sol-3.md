# Beauty council — reviewer 3

2026-10-04. Specialty: color, light/texture, accessibility and perceptual quality. Identity: this session identifies me as a Codex agent based on GPT-6; the exact backend/Sol variant is not exposed to me, so I cannot independently certify a more specific model name. This is a read-only visual review; I changed no runtime, source, renderer or release artifact.

## Verdict

**Current homepage: no, it does not yet produce equivalent visual beauty to the original. Archived gallery: partly, and several gallery frames approach the reference’s visual appeal.** The original has a luminous, asymmetric tangle of fine continuous curves and interrupted particles with a strong hierarchy of brightness. The homepage has appealing semantic colors and orderly tissue ownership, but its ten examples mostly look like variants of one small oval body with two arms and a bent stalk. The archived gallery preserves the layered ribbons, translucency, depth and expressive silhouettes much better. These are three separate visual experiences and should not be described as equivalent to one another.

This says nothing adverse about QDL’s computational correctness. The language release and the visual renderer have different acceptance criteria.

## Evidence actually seen

Viewed `comparison.jpg`, `motion-comparison.jpg`, `gallery.png`, the full `original-02.png`, full homepage water frames at 0/50% and craft at 25%, plus gallery lanternkeeper at 0/π/2, wayfinder atπ, memorybloom atπ/2 and seedbank at3π/2. Read `capture.json`, the local reference `index.html`, `living-thoughts.js`, `anatomy.js`, and the relevant gallery renderer. Capture settings: homepage 4,000 samples, semantic role colors, no selection, phases 0/25/50/75%; original MP4 sampled independently every two seconds; gallery phases 0/π/2/π/3π/2 with no focus.

The reconstruction closely resembles the original in the supplied comparison. Its successful resemblance is evidence that the reference’s visual effect is technically approachable; it is not evidence that the homepage renderer already achieves it.

## Scores

Subjective 1–10 perceptual grades, not measured performance or a scientific beauty scale. Motion scores concern **change visible across captured phases**, not smoothness, frame pacing or animation quality in a played clip. Original variety is within one captured specimen; collection variety is assessed for the homepage/gallery, so that column is not a controlled like-for-like experiment.

| Experience | Form | Motion* | Light/texture | Color coherence | Variety |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original artwork | 9 | 8 | 9 | 9 | 6 |
| Current homepage | 4 | 3 | 4 | 6 | 3 |
| Archived gallery | 8 | 7 | 8 | 8 | 8 |

The archived gallery rating improved after its additional family/phase captures became available. Lanternkeeper changes substantially between 0 and π/2 while retaining a recognizable winding column. Wayfinder has a diagonal, tapering plume; memorybloom has a flowerlike radial expansion; seedbank has a suspended rounded veil. This is real visible family/phase variation. No capture establishes smooth temporal quality; do not interpret the 7 as a playback benchmark.

## Visually observed deficits

**Light and material are the homepage’s largest rendering deficit.** In the full water frame, teal/blue/green owner regions appear as relatively solid, even-opacity fills. Fine stippling exists, but it reads as holes or a screen mesh inside a flat body, not as illuminated layers of tissue. The original’s narrow white peaks and dim dotted edges make brightness describe thickness, folds and overlapping strands. Gallery lanternkeeper does this with cyan/blue/gold ribbons, and memorybloom has clearly separated bright contours and faint surrounding grains.

**The palette is intelligible but too quiet against the blue-green field.** Teal stalks recede toward the background; lavender arms and olive lower bands are low in perceived brightness. The original uses one coherent white palette and obtains variety through light. Gallery achieves coherent semantic color without losing all bright crests. The homepage has color boundaries but insufficient brightness hierarchy. This is a perceptual observation, not a formal WCAG failure: decorative creature regions are not automatically text or mandatory UI controls.

**The homepage sacrifices silhouette and scale.** The comparison’s ten examples all occupy a small central area with substantial unused background and mostly share the oval/three-appendage motif. Craft’s extra branch and evidence’s left attachment are modest differences. The visible distinction between recipes is often width and band count rather than a memorable family. The reference fills a taller area with irregular negative spaces and long trailing strokes; the gallery varies vertical, diagonal, radial and veil forms. Larger framing can expose existing details, but it cannot transform the same source geometry into a different topology honestly.

**Motion is restrained in the sampled homepage cycle.** Water’s four frames and checkpoint’s four frames remain very similar; inspecting water 0 and 50% full-size reveals subtle silhouette differences rather than flowing restructuring. The anatomy gesture templates are correspondingly small, bounded affine/hinge variations. Original sample frames visibly alternate winding asymmetric configurations. Filmstrips do not show whether the homepage breathes pleasantly in real time; they do show that its pose range is visually much narrower.

## Implementable fixes that preserve the release

1. **Recover density-dependent light in the unpinned view renderer.** The homepage builds one `Path2D` containing every point circle for an owner and fills that path once. Intersections within that path do not accumulate independent translucent point brightness; they become an even filled region. The reference paints 20,000 tiny point rectangles separately, while the gallery paints per-point samples in depth/opacity buckets. Render the homepage’s existing samples as individually composited points or a point-sprite buffer, preserving exact owner IDs and `Chroma.colorFor` hue assignments. Batch by existing owner/depth/brightness without turning each owner into a solid union. This addresses the observed flatness without changing source geometry, kernel semantics or the frozen registry.
2. **Use the existing normals and depth as light, not as new semantics.** `Anatomy.frame` already returns normalized surface normals and coordinates; the homepage currently uses positions/owners but no normal lighting and a near-constant alpha. Add a restrained camera-relative diffuse/rim contribution, low-opacity back layers and a thin brighter crest pass. Preserve base role hues and retain an explicit semantic legend. Light changes must be labeled presentation, not evidence that a guard passed or an operation ran. Avoid broad bloom that merges distinct bands.
3. **Raise sampling selectively within the existing 4,000–24,000 range.** Offer a bounded high-detail still/paused hero at 12,000–20,000 samples, with 4,000 for small cards/reduced-resource mode. Cache the existing fixed layouts and avoid repeated owner×sample scans by bucketing owners in one pass. Measure paint time, memory and redraw cadence before making this default; more points alone cannot fix flat fills or identical topology. Do not change the pinned sampler or regenerate goldens.
4. **Improve presentation framing while retaining fixed bounds.** Give the hero a taller display region and use a fixed portrait camera with a small safe margin across the accepted cycle. Keep comparable before/after views on shared framing; avoid phase-dependent auto-fit that makes motion appear as camera zoom. A neutral darker canvas is a useful presentation option because it increases tissue contrast without inventing new role colors. Do not silently crop trailing geometry or reinterpret source coordinates.
5. **Retain source-faithful contours.** Additional thin longitudinal lines can be sampled on existing authored components through the current read-only anatomy API, carrying their existing owner colors. This can reveal curved structure without adding fictitious branches. Distinct new artistic families require separately authored, admitted artifacts; changing an old artifact’s body would change its source identity. Frozen source/artifacts should remain untouched. For immediate art direction, expose the archived gallery as its own clearly experimental visual collection rather than claiming those older shapes are the stable recipe bodies.
6. **Keep accessibility and semantic inspection separate from ornament.** Preserve the existing reduced-motion default, pause and manual phase controls. Add or retain a textual owner/operation legend, visible selected outline and recorded status text so cyan versus blue is never the only way to identify a computation. Use an optional neutral tissue view for users who cannot distinguish role hues, leaving the legend authoritative. Selected dimming currently drops unselected tissue to 0.06; retain enough silhouette context or provide a selected-only/full-context choice. Keyboard selection and reduced-motion stills must be tested after visual changes.

A presentation speed or camera change can make existing motion easier to see but cannot honestly supply the original’s internal deformation range. More expressive geometry/gesture rules would require a separately versioned visual system or newly authored source under the existing accepted contract, not a silent edit to frozen `anatomy.js`. Do not trade source correctness for a cosmetic claim of equivalence.

## Answer I would give the user

The current homepage is technically inspectable but visually simpler and flatter than the original. The archived gallery comes much closer: several frames have comparable ribbon texture, glow and expressive shape, with a coherent colored identity of their own. The quickest faithful improvement is to bring that renderer’s density, depth and luminous contour treatment into the homepage view without changing frozen programs. A claim of full motion equivalence needs actual side-by-side played sequences and frame-time evidence, not these phase stills.
