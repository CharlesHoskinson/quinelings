# Sol reviewer 1: art direction, silhouette and composition

Verdict: **No for the current homepage; partly for the archived gallery.** The original has a richer and more compelling visual hierarchy. The homepage shows readable ownership regions, but those regions currently occupy a repetitive, modest silhouette. The archived gallery's captured specimen comes substantially closer through elongated folds, luminous contours and layered transparent tissue.

These are subjective visual grades, not instrument measurements or audience-study results.

| Criterion | Original artwork | Current homepage | Archived gallery |
| --- | ---: | ---: | ---: |
| Form / silhouette / composition | 9 | 4 | 8 |
| Movement | 8 | 3 | 7 |
| Light / texture | 9 | 4 | 7 |
| Color coherence | 9 | 6 | 8 |
| Variety | 7 within the sampled sequence | 3 across ten specimens | 8 across inspected families |

Original color coherence means its monochrome hierarchy, not a claim of chromatic variety. Original variety describes changing appearances of one artwork; homepage variety describes different programs. Those are different comparison populations. Archived movement describes inspected phase differences, not continuous playback. Gallery variety reflects the inspected wing, folded ribbon, comet and ring families.

## What I actually saw

I read `capture.json` and inspected `gallery-threadsorter-0.png`, `gallery-raincatcher-157.png`, `gallery-wayfinder-314.png`, `gallery-lanternkeeper-157.png`, `gallery-pulsekeeper-0.png`, `gallery-pulsekeeper-314.png`, `comparison.jpg`, `motion-comparison.jpg`, `gallery.png`, and the full-size `original-02.png`, `water-total-0.png`, `water-total-25.png`, `craft-quote-0.png`, and `craft-quote-50.png` with the image viewer.

The original has an asymmetrical, vertically stretched form. Bright sinuous paths run through softer stippled fans; fine strands trail into black space. Its contour changes in complexity along its length, with concentrated crossings and quieter gaps. Black internal voids make the strands legible. Its silhouette suggests an unfolding object rather than a closed badge.

Every homepage specimen on the comparison sheet uses a closely related oval or round center, two lateral curved limbs and an upward hook. Some have additional small projections. Different proportions and ownership colors are visible, but the repeated outline dominates the collection. At full size, water's fill reads as a muted, relatively uniform dotted skin with broad horizontal color territories. Craft adds overlap and a denser center, but retains the same overall family. Large margins and subdued contrast reduce their presence.

The original filmstrip alternates strongly different lean and trailing contours. Water's sampled poses change only slightly; checkpoint likewise preserves almost the same recognizable outline across all four frames. This is an observation about four samples, not an assertion that the complete animations have no movement or that quarter phases capture maximum displacement. I did not watch the original eight-second video continuously.

The archived screenshot has a tall, tapered, twisting silhouette with overlapping folds, bright long contours and turquoise, blue, gold and pink regions. It has stronger directional flow and more depth than the homepage. It remains smoother and more symmetrical through its central axis than the original's tangled, ragged edge; it does not reproduce the original's contrast between bright skeletal arcs and disappearing loose tendrils. Additional raw frames establish real family variety: Threadsorter has paired hollow wings; Wayfinder has a sweeping comet-like silhouette; Raincatcher is an elongated folded ribbon; Pulsekeeper is a hollow ring. Lanternkeeper at phase 1.57 changes its folded profile noticeably, and Pulsekeeper at phase 3.14 shifts its bright contour loops. These are larger and more compelling pose differences than the homepage samples, though filmstrips still cannot establish smoothness.

## Three observed deficits

1. **Repeated outline and weak directional composition.** Ten homepage examples repeat the central oval and three principal projections. The original and archived specimen have a dominant long gesture; homepage limbs mostly read as decorations around a central blob.
2. **Insufficient light hierarchy.** Homepage dots and a few contours have similar apparent importance, and the broad role-color bands flatten volume. The original separates bright continuous arcs, translucent fans and sparse peripheral points. Archived gallery already does this better.
3. **Weak sampled pose contrast.** Homepage quarter-phase silhouettes stay very close. The original filmstrip changes the body's lean, fan placement and trailing direction enough that the movement is visually consequential.

## Code evidence and inference

`living-thoughts.js` `draw()` calls `Anatomy.frame` with a 4,000-point budget and three crests. It draws fixed-radius 1.5-pixel dots with one unselected alpha of .43, then .8-pixel pale crest strokes at alpha .5. Unlike the archived renderer's alpha buckets, these passes do not use per-point normals to shade volume. That is a plausible cause of the uniform texture; it is not a claim derived from brightness measurements.

`anatomy.js` `frame()` exposes normals and ownership. Its three-crest selection places two crests on the first component and the third on another component. The sampled homepage imagery is therefore consistent with limited contour coverage. `portraitFrame()` deliberately uses conservative phase-safe bounds; projecting its box in `compiled()` plausibly explains some excess margin. Removing safety bounds indiscriminately would introduce clipping or camera pumping.

`gallery.js` `render()` already uses alpha buckets, ridge segments, layered sampling and family-specific morphology. This explains why the archived image can look substantially richer without demonstrating that its task semantics are better. Its gesture descriptions and phase machinery are consistent with the visible phase differences; source inspection is not a substitute for watching full playback.

## Three actionable fixes that preserve the frozen programs

1. **Improve the homepage camera and silhouette presentation in the website renderer.** Compute a tighter fixed projected envelope from sampled phases, retaining a tested margin and a constant camera for both before/after portraits. Use a separate decorative outer filament portrait driven by existing source geometry, with every filament retaining its ownership association; keep the exact canonical anatomy in inspection mode. Do not silently replace frozen source anatomy or imply the ornament is a new operation. New, more varied source bodies can be separately authored variants, clearly identified as new artifacts, rather than replacements for pinned recipes.
2. **Introduce a light hierarchy while retaining semantic hues.** Use existing normals and projected density to vary alpha and brightness within each role color; make sparse peripheral samples softer and selected folded contours brighter. Use adaptive sampling or a higher allowed `Anatomy.frame` budget where performance permits, with narrower dots and owner-preserving contour sampling on more components. Keep role hues, gold recorded-value labels and legend meaning unchanged. Review idle and selected states separately so inspection dimming does not determine the beauty verdict.
3. **Give viewing motion stronger directional contrast without changing task execution or source identity.** First preview several existing phase intervals and camera angles and choose a presentation that exposes their actual deformation. If still insufficient, offer an explicitly labeled display-only camera orbit or gentle perspective tilt, separate from the source-authored gesture phase. Do not rewrite pinned gesture parameters under the same source hash. A later separately authored body variant can add delayed limb motion and unfolding folds, with its distinct source identity visible.

## Evidence boundary

The local reference HTML identifies `reference.mp4` as the original eight-second @yuruyurau video and distinguishes its equation reconstruction from the video. I used the frames labeled original, not the reconstructed panel, as the benchmark. `capture.json` confirms unselected homepage captures at phases 0, 25, 50 and 75 percent, and unfocused gallery captures at 0, π/2, π and 3π/2. It confirms independent original-video samples every two seconds. No equal-time sampling, perceptual metric, frame-rate measurement or external artist-intent claim is asserted.

All image paths above are under `research/beauty-council/`. Source inspected: `living-thoughts.js`, `anatomy.js`, `gallery.js`, and `/home/hoskinson/midnight-language-lab/tweet-reference/index.html`. Only this report was written for this review.
