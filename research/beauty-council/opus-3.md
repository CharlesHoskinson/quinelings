# Beauty Council review: opus-3 (light, texture, color coherence, perceptual accessibility)

Read-only review. I edited no files, used no credentials or subagents, and sent no outside messages.

## Verdict

| Surface | Equivalent beauty to the original? |
|---|---|
| **Current homepage** (10 program bodies) | **No** |
| **Archived gallery** (10 families) | **Partly** |

## Scores (1–10)

| Axis | Original (comparator) | Homepage | Archived gallery |
|---|---|---|---|
| Form | 9 | 3 | 7 |
| Motion | 8 | 2 | not scored (see limits) |
| Light / texture | 9 | 3 | 7 |
| Color coherence | 9 (single hue) | 5 | 6 |
| Variety | n/a (one work) | 2 | 8 |

## Evidence used and its limits

- **Images inspected:** `comparison.jpg`, `motion-comparison.jpg`, `gallery-comparison.jpg`, `original-01.png`, `original-02.png`. Homepage frames: `water-total-0.png`, `water-total-50.png`, `craft-quote-0.png`, `confirmed-checkpoints-0.png`, `trade-preview-0.png`. Gallery frames: `gallery-{lanternkeeper,echoweaver,tidemender,seedbank}-0.png`.
- **Gallery phase frames:** I couldn't find any gallery frames other than phase 0. I tried the suffixes `-1`, `-2`, `-3`, `-25`, `-50` and `-180`; none existed, and I can't list the directory. So I didn't score gallery motion.
- **Sampling:** the stills are 4 phases, and the original MP4 was sampled every 2 s. Neither can show continuous smoothness, frame pacing or flicker. "Beauty" here is one reviewer's judgment, not a universal measure.
- **Not like for like:** the original is one hand-tuned work; the library has ten bodies that are also constrained by program semantics.
- **No measurements:** the luminance and contrast remarks below are visual estimates. I took no pixel measurements.

## Observations (visible in the images)

**Original**
- White dots on near-black. Overlapping dots build up to an almost pure-white central spine, while the edges thin out into sparse stipple. That gives a wide range from bright to dark.
- The texture is dotted contour bands that produce a moiré effect, plus long, uneven, hair-like or jellyfish-like strands.
- Frames 2 s apart differ a lot: strands swing, and the mass shifts left and right.
- Being one colour, it reads equally well with any form of colour blindness.

**Homepage**
- All ten bodies share one shape: an ellipsoid chamber, two arching side limbs and a hooked stalk. They differ mainly in the chamber's proportions (wide, tall or round) and limb hue. The ten look like one species.
- Each body fills about 40% of its tile's width and about 25% of its height, leaving much of the tile empty.
- Surfaces read as flat, mid-brightness pastel fills with horizontal colour bands. There is no bright core and no shading.
- Limbs show scattered dark speckles. These read as patchy dot coverage, not as strands.
- The teal-grey vignette background lowers figure–ground contrast compared with the original's near-black.
- The teal and periwinkle bands look about equally bright, so they are told apart mainly by hue. That separation is weaker for red–green colour-vision deficiencies. The small rose tips on the stalks are hard to distinguish for the same reason.
- **Motion:** `water-total-0` and `water-total-50` look almost identical. In the filmstrip, all four water and checkpoint phases are indistinguishable at that resolution.

**Archived gallery**
- This uses the same dotted-filament idiom as the original: visible moiré lines, glowing highlighted crests and a darker background.
- Silhouettes are clearly distinct: basket or jelly, flame, rosette, torus, S-ribbon, seed pod, coral, figure-eight, spiral and wing.
- **Shortfalls against the original:**
  - Several look like clean parametric curves (spirograph-like) rather than living bodies, notably threadsorter, pulsekeeper and memorybloom.
  - The brightest points are dimmer than the original's white core. Only tidemender's centre and lanternkeeper's top form a clear bright focus.
  - Where gold and blue strands overlap (lanternkeeper's middle, raincatcher), the colour goes muddy grey. With several hues blending along each strand, the light-to-dark hierarchy that carries the original gets lost.
  - The status labels inside the frame ("READY TO EXECUTE", organ and filament counts) intrude on the artwork.

## Code inference (from source; not visually proven)

- **Original** (`tweet-reference/index.html:15-17`): 20,000 samples, drawn as 2 px squares in white at alpha 0.376 on `#090909`. The overlap of these dots is what builds the bright core. The animation advances π/120 per frame at about 30 fps, which repeats every 8 s, matching the 8 s video.
- **Homepage draw** (`living-thoughts.js:39-41`):
  - 4,000 samples, each a 1.5 px disc in a flat role colour at alpha 0.43, blended with `screen`.
  - No surface normals, lighting or depth ordering, which explains the flat pastel look.
  - Every ridge (edge line) is a single 0.8 px stroke in `#dbeed2` at alpha 0.5, whatever node owns it.
- **Homepage timing** (`living-thoughts.js:82`): phase updates every 90 ms or more (about 11 fps), at 0.45 rad/s. One cycle is about 14 s.
- **Homepage motion amplitude** (`anatomy.js:4`, `anatomy.js:56`): gesture templates are small pose offsets (at most about 0.10 times strength), eased with smootherstep. This probably explains why the phase stills look identical. I didn't trace exactly how `score()` is applied.
- **`lifeform-renderer.js:10-21`** has a richer pipeline:
  - soft radial-gradient dot sprites, sorted into 12 depth layers;
  - per-dot lighting from surface normals, with alpha weighted per point;
  - ridges stroked in three passes: glow, core and a white highlight.
  
  This matches the gallery's look, but I didn't confirm that `gallery.js` calls this renderer.

## Three precise deficits

1. **No brightness hierarchy on the homepage.** The original's beauty comes from overlap building up to a white spine and fading to stipple. Homepage bodies are a uniform mid-brightness, banded fill with no bright focus, on a low-contrast teal vignette.
2. **One shape, small, and not built from strands.** All ten homepage bodies are the same chamber, limbs and stalk at icon scale. There is no filament or contour-band texture. The speckles on the limbs read as missing dots.
3. **Motion is barely visible.** Homepage phases at 0/25/50/75% are visually identical, while the original's silhouette changes substantially every 2 s. The gallery's motion could not be judged.

## Three actionable fixes

All three are view-only changes in `living-thoughts.js`. They leave the frozen runtime, the source, the `Anatomy.frame` output and each role's hue angle unchanged.

1. **Bring the gallery's lighting to the homepage draw.**
   - Use `frame.normals` for lighting, the 12 depth layers, and soft sprites drawn additively (`lighter`) at low per-dot alpha, so overlaps build toward a near-white core.
   - Brighten dots toward white by changing lightness only, in OKLCH, so each role's hue stays the same.
   - Raise the 4,000-sample budget only as far as measured `renderMs` allows.
   - Draw ridges in the owning node's colour with the three-pass glow, core and highlight (`lifeform-renderer.js:21`).
2. **Improve contrast and colour accessibility.**
   - Put bodies on a near-black canvas (or a much weaker vignette), and scale them to fill more of the frame.
   - Give adjacent role bands a set lightness gap while keeping their hue angles. Check the pairs with a colour-blindness simulator, and aim for at least 3:1 non-text contrast on selection marks.
   - In the gallery, stop gold and blue going grey where they overlap, for example by using the additive blend above or by having the brighter strand take over at crossings.
3. **Add visible view-only secondary motion.**
   - After computing the frame, displace points in screen space with a travelling wave along each component's length parameter, scaled to the component's length.
   - Redraw on every animation frame instead of the 90 ms tick. Keep the existing `prefers-reduced-motion` gate.
   - Apply the same displacement to anchors and hit-testing so selection stays aligned, and label the motion as display-only, not semantic.

Implementing any of these is a renderer decision for root. Re-capture the same phases afterwards to confirm the effect.
