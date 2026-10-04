# Beauty Council Review: opus-1 (art direction, silhouette, composition, variety)

**Scope:** I only read files and images. Nothing was edited. I had no access to the other council reports.

**What I looked at:** `comparison.jpg`, `motion-comparison.jpg`, `gallery-comparison.jpg`, `original-01` through `original-04.png`, homepage phase frames (`water-total-0/25/50`, `confirmed-checkpoints-0`, `craft-quote-0`), gallery frames (`gallery-tidemender-0`, `gallery-seedbank-0`, `gallery-echoweaver-0`, `gallery-wayfinder-0`) and `capture.json`. Code I read: the reference `index.html`, `living-thoughts.js`, `anatomy.js`, `lifeform-renderer.js`, and `gallery.js` lines 1–80.

## Verdict

| Surface | Equivalent beauty to the original? |
|---|---|
| **Current homepage** (10 program bodies) | **No** |
| **Archived gallery** (10 families) | **Partly.** The best specimens share the original's language of fine line density. None matches its brightness structure or its organic complexity. |

The reference reconstruction in `comparison.jpg` matches the original closely. That confirms the comparison frame itself is sound.

## Scores (1–10)

| Criterion | Original | Homepage | Archive |
|---|---|---|---|
| Form / silhouette | 9 | 3 | 7 |
| Motion | 9 (from video frames) | 2 | 5 (provisional, inferred from code only, see limits) |
| Light / texture | 9 | 3 | 7 |
| Color coherence | 9 (monochrome, coherent by restriction) | 5 | 6 |
| Variety | n/a (one work) | 3 | 8 |

## Observations (what is visible)

**Original:**
- An asymmetric, vertical cascade with roughly a dozen tendrils. It fills about half the frame height (my visual estimate).
- A bright braided white core runs diagonally. Around it are mid-density contour veils and sparse dotted outer strands. That gives at least three clear brightness levels.
- Overlapping strands create moiré contour lines that read as tissue.
- It sits on a near-black ground (`#090909`).
- In the 2-second samples the pose changes a lot between frames: tendrils move around in a near-mirror-image way.

**Homepage:**
- All ten bodies share one layout: a central ellipsoid "seed", two arms drooping to either side, and one hooked stalk. At thumbnail size they are interchangeable. Only arm angle, ellipsoid aspect and band order differ.
- The body takes up about a third of the canvas width and leaves a large empty teal ground. The composition is centered and static.
- The surface is a uniform field of mid-brightness dots. The ellipsoid carries horizontal color stripes that read as a striped egg or a flag rather than tissue.
- The thin ridge lines read as seams.
- `water-total` frames at 0%, 25% and 50%, and the checkpoint quarter-phase strip, are indistinguishable by eye.
- The role hues (teal, blue, sand, green, rose) are pleasant and muted on their own.

**Archive:**
- Clearly distinct gestural silhouettes: spiral (tidemender), wing (wayfinder), bell with veil (seedbank), S-ribbon (raincatcher), flower (memorybloom), fan (swarmwarden).
- Its translucent stacked filaments are the closest thing in the library to the original's texture.
- Weaknesses:
  - Peak brightness is low; there is no bright core strand.
  - threadsorter (∞) and pulsekeeper (torus) read as diagrams.
  - echoweaver's stacked rows look rigid and chart-like.
  - Where four hues overlap (lanternkeeper, raincatcher), the color goes muddy.

## Code inferences (what the source implies, not measured)

**Homepage drawing (`living-thoughts.js:39-41`):**
- Each frame uses 4,000 samples. The reference uses 20,000.
- Every sample is a 1.5 px disc in its owner's role color at a fixed alpha of 0.43, blended with `screen`.
- Three ridge lines are drawn at 0.8 px, alpha 0.5.
- The surface normals that `Anatomy.frame` returns are never used, so there is no shading.

**Homepage timing (`living-thoughts.js:82`):**
- It repaints at most once every 90 ms, which is about 11 frames per second or fewer.
- Phase advances at 0.45 rad/s, so one full cycle takes about 14 s.
- The reference advances π/120 per frame at 30 fps, so its cycle is 8 s.

**Homepage motion amplitude (`anatomy.js:4,56,64,150`):**
- The motion is a global affine pose: scale (sigma), lean and hinge opening.
- The template peaks are no more than 0.1, multiplied by a strength of at most 0.70.
- In practice that means a body scale change of roughly 6% or less, a lean of about 1.6° or less, and joint opening of about 3° or less.
- There is no wave travelling through the body. The original's equation has one (`sin(6e−5d+2t)`, `angle=d−t`). This explains why the phase frames look identical.

**Homepage shape (`anatomy.js:117-150`):**
- The generator always builds one ellipsoid trunk, a few tapered spines and a tail.
- The stripes come from ownership territories, which are bands along the trunk.
- Because this layout is encoded in the source's `design.anatomy`, a renderer-only change cannot add new shapes.

**Archive motion (`gallery.js:32-39`):** the families carry a rhythm with breath, wave and lag settings plus travelling-wave descriptions. That is why I scored archive motion provisionally above the homepage.

## Three observable deficits

1. **Same silhouette everywhere (homepage).** All ten bodies use one ellipsoid-plus-arms-plus-stalk layout, centered and small. The original is an asymmetric vertical cascade with many tendrils of different lengths and real negative-space tension.
2. **No visible motion between phases (homepage).** The 0/25/50/75% stills of `water-total` and `confirmed-checkpoints` cannot be told apart by eye. Original frames 2 s apart show large redistribution of the tendrils.
3. **No brightness or texture hierarchy.** The homepage bodies are evenly filled, mid-brightness and striped. The original runs from a near-white braided core down to isolated dots, with moiré contours. The archive has partial hierarchy but no bright core.

## Three fixes (proposals only)

All three are view-side only. They leave the frozen runtime, source, `sourceHash`, genomes and the role-hue identities untouched.

1. **Add travelling-wave motion and a smooth frame rate.**
   - In the homepage `draw()`, apply a display-only displacement after `Anatomy.frame`: a phase-shifted wave that grows with distance from the trunk anchor (`Anatomy.anchor`/`socket`) and moves perpendicular to it.
   - Replace the 90 ms throttle with ordinary per-frame animation (`requestAnimationFrame`) at about 30 fps, with a cycle near 8–10 s.
   - Do not feed the displaced points into `geometry()` or into any metric or proof.
   - Respect `prefers-reduced-motion`.
2. **Build a brightness hierarchy within each role hue.**
   - Raise the budget toward the existing 12,000–24,000 range that `Anatomy.frame` already allows.
   - Use smaller dots (about 0.8–1 px) and additive blending so overlaps build bright cores.
   - Modulate alpha with the normals that are already returned. The lighting term in `lifeform-renderer.js:15` can be reused.
   - Draw up to four crests as the bright "spine" strands.
   - Each owner's hue stays fixed; only lightness and alpha vary.
3. **Improve composition without new source.**
   - Raise the fit from `.76/.8` so the body fills about 60–70% of the canvas, and darken the ground toward the reference's near-black.
   - Draw the program's real input edges as long, trailing, wave-driven filaments between anchors. `lifeform-renderer.js:24` already draws curves between anchors. This adds silhouette variety that follows the graph's real structure.
   - Show ownership boundaries as fine contour lines instead of filled stripes.
   - Limit: this cannot match the archive's family variety unless the generated anatomy changes, and that would be a source change.

## Evidence limits

- **Stills only.** Phase stills cannot measure continuous smoothness, frame pacing or perceived life. Universal or subjective beauty cannot be measured.
- **Original sampling may alias.** `original-01` and `original-03` look identical, and so do `-02` and `-04`. Sampling every 2 s may therefore alias the original's motion.
- **No per-phase gallery frames.** I could not find any (I had no directory listing, and the filenames I guessed did not exist). The atlas shows one phase per family, so the archive motion score rests on code only.
- **Unequal sample counts.** Homepage captures use 4,000 samples against the reference's 20,000.
- **Image quality.** The atlases are downscaled JPEGs.
- **Unequal comparison.** The original is one hand-tuned work. The library has ten bodies under semantic constraints, so variety cannot be scored for the original.
- **Not separately inspected:** the attached atlas and filmstrip. I judged the equivalent content from `comparison.jpg` and `motion-comparison.jpg`.
