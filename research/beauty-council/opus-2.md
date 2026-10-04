# Beauty council review: opus-2 (mathematical motion, organic coherence, choreography)

## Verdict

| Surface | Equivalent beauty to the original? |
|---|---|
| **Current homepage** (10 program bodies) | **No** |
| **Archived gallery** (10 families) | **Partly.** It comes close in form and texture, but I could not check its motion from the files I found. |

## Evidence I used and its limits

- **Original:** `original-01…04.png` (the MP4 sampled every 2 s), `comparison.jpg`, `motion-comparison.jpg`, and the equation in `tweet-reference/index.html`. I did not play the MP4 itself.
- **Homepage:** `comparison.jpg`, `motion-comparison.jpg` (water and checkpoint at 0/25/50/75 %), plus full-size `water-total-0/50`, `confirmed-checkpoints-0`, `craft-quote-25` and `route-preview-0`.
- **Archive:** `gallery-comparison.jpg` and full-size `gallery-{tidemender,seedbank,echoweaver,wayfinder}-0.png`. I had no directory listing and found only phase-0 gallery files by guessing names. **The archive had no frames at other phases, so I have no visual evidence of its motion.** I did not find a separate atlas or filmstrip beyond the two comparison sheets.
- Still frames cannot measure smoothness, easing or perceived life. These scores are one reviewer's judgement, not a measurement. The original is one hand-tuned work and the library has ten. So "variety" does not compare like with like, and the original's variety score is nominal.
- Original frames 01 and 03 look the same at this resolution, and so do 02 and 04. The 2 s sampling probably lines up with the cycle and shows only two states. I can't tell from four stills what the motion looks like between samples.

## Scores (1–10)

| Axis | Original | Homepage | Archive |
|---|---|---|---|
| Form | 9 | 3 | 7 |
| Motion | 9* | 2 | not scored (no gallery frames at other phases) |
| Light / texture | 9 | 3 | 7 |
| Colour coherence | 9 (monochrome) | 4 | 6 |
| Variety | n/a (single work) | 3 | 8 |

*Based on the large change between 2 s samples plus the equation, where every sample's position depends on its own term `d − t`. I can't confirm smoothness.

## What I saw (images only)

**Original.** One asymmetric, vertical, flame- or jellyfish-like mass, about 45 % of the frame wide and 65 % tall. Brightness has a clear order: dense strands meet in a near-white diagonal core, while the outer tendrils are sparse dotted chains. The tendrils taper to points. Between 2 s samples the whole mass shifts: it leans left in 01 and right in 02, the core moves and the tendrils change which side they sweep. The reconstruction panel matches the original closely.

**Homepage.**
- All ten bodies share one layout: a central ellipsoid, two arched side limbs, a hooked neck and sometimes a small crown. They differ mainly in trunk shape and band colours.
- Surfaces read as flat, semi-opaque fills cut into hard horizontal stripes of colour, like a striped egg. Limbs are uniform tubes with blunt rounded ends and sparse dark speckles. There is no light-to-dark change from curvature or depth.
- The body fills roughly half the canvas width and a third of its height, and is almost mirror-symmetric.
- In `motion-comparison.jpg`, the four water frames are indistinguishable at this resolution, and so are the four checkpoint frames. Full-size `water-total-0` and `-50` also show no difference I can see.

**Archive.**
- Bodies are built from bundles of fine dotted filaments with soft, fading edges. That is much nearer the original's way of drawing.
- Silhouettes are clear and varied: spiral (tidemender), wing or comet (wayfinder), bell with a tapering vortex (seedbank), loops (pulsekeeper), S-curve (raincatcher).
- Several shapes look emblematic or decorative rather than organic: threadsorter is a clean ∞, memorybloom is a radial flower, and echoweaver's lower half is three rows of near-identical repeated ripples.
- Brightness is fairly even. Only lanternkeeper and wayfinder show a bright core against faint periphery.
- Role colours blend along the strands. Where yellow lies over blue (pulsekeeper, raincatcher) the overlap turns slightly muddy.
- Bodies fill about 40–55 % of the canvas.

## What the code suggests (not checked visually)

- **Homepage motion is small rigid changes per component** (`anatomy.js:56,64-65`). Each component gets a stretch of `exp(σ)` with |σ| ≤ 0.10 × strength, where strength is 0.55–0.70, so at most about 7 %. It also gets a lean of up to 0.08 × strength (≤ ~3°) and a small hinge opening. Every point on a component moves by the same transform, so no wave travels along a limb, and spine `bend` never changes. Each gesture template starts and ends at zero (`anatomy.js:4`), so the body rests for the last 18–22 % of each cycle.
- **Homepage frame rate and cycle** (`living-thoughts.js:82`): it repaints at most every 90 ms (about 11 fps), and phase advances 0.45 rad/s, so one cycle takes about 14 s. The reference page draws at 30 fps and steps π/120 per frame, which is an 8 s cycle (`index.html:21`).
- **Homepage surface drawing** (`living-thoughts.js:40-41`): 4,000 dots of radius 1.5 px at alpha 0.43, blended with `screen`, one flat colour per owner, and no use of surface normals. That explains the saturated fills. Ridges are three plain 0.8 px lines.
- The repo's own `lifeform-renderer.js:15,21` already has normal-based lighting, depth layering and a three-layer glowing ridge stroke. The homepage doesn't use any of it.
- The reference equation puts the phase inside every sample's position (`angle = d − t`, `sin(6e − 5d + 2t)`). That makes the whole body move as one connected wave. Nothing like that exists in the homepage's motion.
- `gallery.js:32-39` describes travelling waves with breath, wave and lag controls. I did not read the morphology module and can't confirm what that motion looks like.

## Three observable deficits

1. **Homepage bodies barely move.** Across 0/25/50/75 % the outline, limb angles and band positions look identical. The original changes where its mass sits between every 2 s sample.
2. **Homepage surfaces are flat colour stripes with no lighting.** Uniform dot fills cut into hard bands, with no shading from curvature or depth and no brightness order. The original's beauty comes mostly from how dense dots build up: a bright core where strands meet, sparse dotted edges.
3. **Homepage outlines are blunt, symmetric, small and all the same shape.** The tubes end in rounded caps, the composition mirrors left to right, the body uses about a third of the canvas height, and all ten share one layout. The original tapers to points, is strongly asymmetric and fills the frame vertically. (The archive avoids most of this, but it still lacks the original's brightness order and has some decorative symmetry.)

## Three fixes (proposals only)

All three change only the homepage drawing code (`living-thoughts.js` `draw`/`tick`). None changes the frozen runtime, `anatomy.js` or program source. Colours keep coming from `Chroma.colorFor` per owner; only brightness, alpha and line width would change.

1. **Add a travelling wave for display only, and run the loop every frame.**
   - Use `requestAnimationFrame` with time-based phase instead of the 90 ms gate. Aim for a cycle of about 8–10 s.
   - After `Anatomy.frame`, push each sample along its normal (`frame.normals`, already returned) by `A · w(u) · sin(κu − n·phase + φ_component)`, with whole-number `n` so the loop closes.
   - `u` per sample can come from `Anatomy.restLayout(body, {budget: 4000})`, which the code says uses the same sampling plan as `frame()` (`anatomy.js:92-98`). Cache it per artifact.
   - Make `w(u)` grow toward spine tips, and cap the tip amplitude at about 15–20 % of component length so owner regions stay readable.
   - `geometry()` and its XYZ RMS readout call `Anatomy.frame` directly, so the measurements are unaffected. Anchors and value labels need the same offset, or must be shown as rest-pose positions.
   - The UI should say this motion is for display only.
2. **Shade the dots by lighting so brightness comes from density.** Use dots of about 0.8–1 px with alpha around 0.10–0.18, multiplied by `0.45 + 0.55·max(0, n·L)` with the light vector already used in `lifeform-renderer.js:15`, plus a depth term. Keep additive or screen blending so grazing edges and overlaps glow. Raise `crests` from 3 to 4 (the most `frame()` allows) and draw ridges with the three-layer glow stroke from `lifeform-renderer.js:21`.
3. **Draw spines as tapering fibre bundles and enlarge the framing.** For each spine, draw 8–16 strands sampled with the public `Anatomy.sample(body, component, u, v_k, phase)`, using the per-sample owner it returns for colour. Fade alpha and line width toward `u = 1` so tendrils end in points and limbs gain grain. Raise the scale factors from `.76/.8` to about `.88`, as in `lifeform-renderer.js:13`. `portraitFrame` padding already prevents clipping. One limit remains: all ten bodies would still share one layout, because `generateV1` and the stored `composition` are frozen. Display changes alone cannot add real shape variety.

## Bottom line

The homepage is not as beautiful as the original. Its bodies are small, banded and nearly still, where the original is one luminous, asymmetric field that keeps moving. The archive is the closest match in form and texture. It still lacks the original's bright-core-to-sparse-edge order and is sometimes decorative rather than organic, and I could not judge its motion from these files.
