# Sol reviewer 2: mathematical motion and organic coherence

Verdict: **No for the current homepage; partly for the archived gallery's still image.** The original has an integrated ribbon anatomy whose fine filaments, strong internal curves and moving asymmetry make one organism. The homepage currently looks like a small translucent oval with two lateral arms and a short top stalk. The archived gallery has a considerably stronger folded, luminous silhouette and comes closer to the reference's visual ambition. This is a judgment of the supplied artifacts, not a claim that semantic correctness requires a particular art style.

## Evidence and limits

Viewed `comparison.jpg`, `motion-comparison.jpg`, `gallery.png`, the full-resolution `original-02.png`, and full-resolution water phase 0/50 and checkpoints phase 25/75 frames. Read the local reference `index.html`, `living-thoughts.js`, `anatomy.js`, `lifeform-renderer.js`, and the archived renderer section of `gallery.js`. `capture.json` was absent on three attempted reads at review time. The contact sheet labels describe the original frames as every two seconds and homepage frames as quarter phases; I cannot independently verify the capture settings without that manifest.

I inspected a filmstrip and code, not continuous playback of the eight-second original video. Four evenly spaced samples can alias periodic motion, and identical endpoints do not prove the intervening motion is absent. Gallery movement cannot be reliably rated from its single still; its code establishes a time-dependent surface renderer but does not establish the quality of the viewed motion. The reference reconstruction is separate from the credited original video. Its `sample(index,t)` is useful evidence for a related mathematical field, not proof of the original author's exact implementation.

## Scores, 1–10

Scores are aesthetic judgments relative to this comparison, not measurements. A question mark marks weak temporal or population evidence.

| Artifact | Form | Movement | Light | Color | Variety |
|---|---:|---:|---:|---:|---:|
| Original @yuruyurau artwork | 9 | 8? | 9 | 8 | 8? |
| Current homepage, ten recipes | 4 | 3 | 4 | 6 | 3 |
| Archived gallery, supplied still | 8 | 6? | 8 | 8 | 6? |

Original color means disciplined monochrome contrast; monochrome is an artistic choice, not an omitted feature. Original variety here means internal structural/temporal variety within the one work. Gallery variety is provisional because only one portrait is shown. Homepage variety is supported by all ten bodies in the comparison sheet.

## Why the homepage movement feels less alive

The quarter-phase rows for water and checkpoints show extremely small silhouette changes. The full-resolution water frames at phase 0 and 50 are almost the same pose. Code explains why: `anatomy.js` evaluates a four-part gesture score into just three shared variables, sigma, lean and opening. The root receives a volume-preserving exponential squash/stretch and planar rotation; descendants receive inherited transforms and a small hinge rotation driven by the same opening value. Each local spine remains a simple fixed bend and taper. This creates a coherent attached assembly, but little independent tissue motion, traveling deformation or differential response along a limb.

All four gesture templates end with `[0,0,0]` followed by `[0,0,0]`; the final phase segment therefore explicitly holds the rest state. Other segments are smoothly eased with a quintic polynomial. That is mathematically smooth and attachment-safe, but the combination of low amplitudes, common drive and a rest hold makes the organism feel parked for a substantial portion of the cycle. Homepage playback is also throttled to approximately 11 paints per second (`now-clock>=90`) and phase advances at 0.45 radians per second: a loop is roughly fourteen seconds. These are code facts, not a measured frame-rate claim for the capture.

The reference reconstruction instead has phase inside an oscillatory term `sin(6*e-5*d+2*t)` and inside an angle `d-t`. Different positions experience different phase offsets through the field. The original filmstrip visibly changes its sideward sweep, spine emphasis and filament placement while retaining the same longitudinal organism. That spatial coupling produces richer choreography than globally tilting a mostly fixed surface. There is no need to call this fractal recursion or a strange attractor to appreciate the effect.

## Form, light and coherence

All ten current recipes share the same dominant oval-and-arms silhouette. Water is taller; trade and gather flatter; colors and fine proportions differ. These differences remain much smaller than the common template. The anatomy generator always starts from one chamber, chooses a restricted branch motif, and adds a countercurve/tail. On these small graphs the common chamber dominates rather than negative spaces or layered curvature. The top appendage and side arms read as discrete accessories. The original reads as a single swept field with multiple nested curves sharing a spine.

The homepage renderer reduces the surface to same-size 1.5-pixel circular dots at constant 0.43 opacity per operation and three thin pale ridge strokes. It does not use returned surface normals for lighting or depth ordering. Hence an informative three-dimensional assembly becomes a rather flat colored stippled silhouette. The blue, green and ochre operation colors are useful and reasonably calm, but horizontal ownership bands dominate the trunk and make it resemble a segmented diagram.

`lifeform-renderer.js` already provides useful mechanisms missing from this homepage path: normal-dependent lighting, depth buckets, soft sprites and layered ridge strokes. It is not the archived gallery renderer. The gallery's own renderer (`gallery.js`) uses a sampled folded membrane, depth/light buckets and compression-dependent crests; its supplied still has a long tapering countercurve, layered transparent folds and a luminous internal backbone. That image has a much stronger relation between curvature, brightness and form than the homepage bodies.

## Implementable fixes without changing frozen runtime or role colors

1. **Upgrade the presentation of existing geometry first.** Use normal-sensitive luminance, depth-aware compositing and sparse bright crest cores with faint halos. Keep each point's operation owner and `Chroma.colorFor` hue. Modulate luminance/opacity, not semantic hue. Preserve a fine point core so glow does not dissolve all internal structure.
2. **Give motion a traveling spatial phase.** A bounded renderer-only displacement can depend on component arclength and graph depth, with delayed swell/relax timing rather than identical phase everywhere. Fade deformation to zero at parent sockets, or compute child placement from the deformed socket, to avoid tearing. Keep rest geometry, runtime traces, source identity and operation owners unchanged. Label this as display choreography rather than execution progress.
3. **Replace the rest hold in an optional display clock.** A continuous low-amplitude breathing baseline plus occasional larger coordinated opening would keep a body alive across the whole loop. Do not silently modify frozen gesture bytes or `Anatomy.frame` semantics; introduce and explicitly version a separate visual adapter. Honor reduced motion and expose a stable phase scrubber.
4. **Improve pacing before increasing mathematical complexity.** Target a measured 30 fps on the main portrait, decouple paint scheduling from runtime evaluation, and benchmark the 4000-point budget. Faster repaint alone will not solve the low spatial deformation; both timing and choreography require attention.
5. **Increase family distinction in new visual compositions.** Let graph depth, fanout and convergence guide a longitudinal backbone, asymmetrical branching and folded negative spaces. Do not add fictitious task edges or mutate the frozen source to decorate a historical artifact. New authored design variants can be shown as such; display-only variations must be declared and keep operation-to-tissue selection intact.
6. **Test rhythm with denser temporal evidence.** Capture at least 16 phases per cycle and a continuous recording with the same canvas size. Compare contour displacement, internal flow and visibility of every operation's territory; separately verify identical outputs and source hashes. Four quarter phases are useful evidence but insufficient to judge fluidity or temporal aliasing.

Priority: first restore dimensional light and crest hierarchy in the homepage; then implement bounded spatially delayed motion; then diversify silhouettes through explicitly authored variants. The archived gallery proves that this project can produce a more graceful still image. The current ten-recipe homepage does not yet deliver the reference's comparable organic movement or richness.
