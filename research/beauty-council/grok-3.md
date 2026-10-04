# Beauty council — grok-3

Specialty: light, texture, color coherence, perceptual accessibility. Read-only. Verdicts are about the stills inspected, not about code correctness.

## Verdict

**Homepage: no.** The ten current program bodies are not equivalent in beauty to the original.

**Archive: partly.** The ten gallery bodies share the original’s black ground and filament drawing, and several are genuinely graceful. They do not match its light: strokes stay even and pastel, crossings do not burn white, and hue does the work luminance does in the original.

The monochrome reference reconstruction at phase 0 is in the original’s visual family. The gap is in the product pictures, not in whether a sampled filament form can look like that work.

## Scope

Inspected up close: `original-01.png` through `original-04.png`; `reference-reconstruction-0.png`; `comparison.jpg`, `motion-comparison.jpg`, `gallery-comparison.jpg`, `council-atlas.jpg`, `council-motion.jpg`; homepage stills `water-total-0/50`, `confirmed-checkpoints-0/50`, `route-preview-0`, `evidence-ledger-0`, `craft-quote-25`, `needs-triage-25`, `gather-readiness-75`, `trade-preview-50`; gallery stills `lanternkeeper-157`, `wayfinder-314`, `memorybloom-157`, `seedbank-471`, `echoweaver-157`, `swarmwarden-314`, `threadsorter-0`, `pulsekeeper-157`, `tidemender-314`, `raincatcher-471`.

The atlas and `comparison.jpg` show all ten homepage bodies and all ten gallery bodies at one phase. `work-schedule` and `receipt-reconciliation` were judged only at that atlas scale. Gallery motion was not judged: no within-family phase strip was compared. No numeric contrast was computed.

## Scores

| Axis | Original (4 MP4 stills) | Current homepage | Archived gallery |
|---|---:|---:|---:|
| Form | 8 | 3 | 7 |
| Motion | 7 | 2 | not scored |
| Light / texture | 9 | 3 | 6 |
| Color coherence | 9 | 4 | 6 |
| Variety | 6 | 3 | 8 |

Original motion is the pose change across two-second samples, not a smoothness score. Original variety is range inside one organism. Gallery variety is ten different silhouettes. Those are different kinds of variety.

## Observations

**Original.** Black ground. White marks only. A braided core goes solid white where lines stack. Mid-weight curves leave that core. The periphery dissolves into stipple. The contour is irregular and many-tendriled. Frames 1 and 3 are a spread pose; frames 2 and 4 are a tighter, hanging pose. Identity holds across that change. One light, so the form does not depend on hue.

**Reconstruction, phase 0.** Same grammar: black ground, white filaments, bright stack, dotted edge. The silhouette is more open than `original-02`.

**Homepage.** Every body inspected is one schema: an oval disc, two lateral arms, one curled stem, on a dark slate-teal field. The disc is stippled in horizontal color bands. The arms and stem are flatter strokes, so each creature carries two textures. Values sit close to the ground: dusty teal, blue, olive, khaki. Overlap does not brighten toward white. `route-preview-0`, `needs-triage-25`, and `gather-readiness-75` add a faint pink wisp above the stem that nearly drops out of the ground. In the water and checkpoint filmstrip, and in the 0-versus-50 close pairs, the silhouette barely moves. The ten atlas bodies differ mainly by which hue lands on the stem, the arms, and the bands.

**Gallery.** Black ground, colored luminous strokes, a different silhouette per family. Figure and ground separate clearly.

- `lanternkeeper-157` and `raincatcher-471`: one ribbon, mint to gold to a small rose tip. Even dotted weight.
- `wayfinder-314`: a combed fan of parallel cyan strokes, a periwinkle body, a pale yellow-green tip.
- `memorybloom-157`: regular elliptical loops, gold left, cyan right, blue below, and a dark hub.
- `pulsekeeper-157`: a ring with an empty dark center.
- `echoweaver-157`: a bell of horizontal hue bands (gold, cyan, rose, blue), a dark gap inside the bell, and dangling tentacles.
- `seedbank-471`: a clean oval mesh, teal crown, blue body, green base, no hot interior.
- `swarmwarden-314`: the densest pile, gold left and blue right, with a small mint brightening at the root.
- `tidemender-314`: a spiral with a small mint core and a long green tail.
- `threadsorter-0`: two symmetric ice-blue loops pinched by green.

Where strokes crowd, the picture usually stays pastel or leaves a hole. `swarmwarden` and `tidemender` are the exceptions, and their bright spot is a small mint core. Repeated strokes often run parallel at one weight. Hue families of similar lightness split a body into colored parts. Dim HUD type (“READY TO EXECUTE”, organ and filament counts) sits in every gallery frame.

**Access, from the pictures.** Homepage roles are mostly hue at similar lightness, on a ground close to that lightness, with broken stippled edges. Gallery form survives much better because it is light on black. Gallery role structure is still mostly hue at similar lightness, so it is fragile for a viewer who does not separate those hues. The original’s form is carried by luminance alone.

## Code inference

Separated from the pictures. This is what the sources imply, not an extra visual claim.

The reference draws 20,000 white rectangles at alpha about 0.38 on `#090909`, so stacking climbs toward white. Its colored mode tints by sample index; the reconstruction capture is the monochrome path.

`living-thoughts.js` draws the homepage frame at budget 4,000, screen composite, per-node role color, alpha 0.43, arcs of radius 1.5, then a pale ridge (`#dbeed2` at alpha 0.5). `lifeform-renderer.js` draws role-colored radial sprites, multiplies alpha by a Lambert term that darkens (`0.5 + 0.5 * max(0, dot)`), and strokes crests in the role hue plus a thin near-white hairline. Either drawer keeps role hue and refuses a white stack. The stills match that outcome: mid-tone role color, no burned core. The cause of the horizontal rows was not isolated in the sampler.

`gallery.js` draws dots and round strokes. The optional halo is a small fraction of the stroke alpha. Pigmented mode strokes the role color, then a neutral ink at reduced alpha. Overlap is ordinary source-over, which fits the dark holes and the even pastel weight. `chroma.js` states that role color is mixed in linear RGB and that hue-angle arithmetic is not used. Crest versus recess alpha exists in `morphology.js` and is not what dominates these stills.

## Three visible deficits

1. Homepage figure and texture. On the eight close stills and all ten atlas bodies, the organism is a low-contrast sprout whose body is horizontal color stripes and whose limbs are a second, flatter texture. The original’s body is white filament that brightens where it stacks.
2. Homepage motion. Water and checkpoint at 0, 25, 50, and 75 percent keep the same sprout. The original’s four two-second frames switch between a spread pose and a hanging pose.
3. Gallery light. In the ten gallery stills opened, density does not become white light. `memorybloom-157`, `pulsekeeper-157`, and `echoweaver-157` keep dark interiors; `seedbank-471` stays an even pale mesh; `wayfinder-314` and the echoweaver bell repeat one stroke weight in parallel. Role hues of similar value split lanternkeeper, memorybloom, echoweaver, and raincatcher into separate colored parts.

## Three fixes

Presentation only. Leave the frozen runtime, the sample source, and the role hue identities as they are.

1. Accumulate the existing homepage samples so overlap raises luminance toward white. Keep each unoccluded sample at its current role hue. Drop the darkening shade term on that path.
2. Put those same marks on a near-black ground, as the reference canvas does, so the current hues separate from the field by lightness.
3. Drive mark value and mark size from density already present in the frozen frame: crowded samples brighter and tighter, sparse samples smaller and stippled. In the gallery drawer, let existing overlaps composite toward white instead of a uniform core plus a fixed dim halo. Unoccluded hue stays the role color. Lightness then carries form for viewers who miss the hue steps, without renaming any role.

## Evidence limits

These are phase stills. They cannot show continuous smoothness, temporal aliasing, or biological life. The original is one work sampled four times, two seconds apart; the library is ten works, and most of their phases were not opened. Beauty here is a comparison with that one artwork, not a claim of universal taste. No live page was exercised in this pass. No measurement pass was completed, so this report gives no contrast ratios, distances, or pixel deltas.
