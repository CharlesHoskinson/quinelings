# Final experimental QDL: luminous material review

Reviewed current `gallery.js`, `morphology.js`, `chroma.js`, QDL validation, the motion review, the final motion filmstrip, and existing performance captures. Production files were not edited. The strongest improvement is a coherent translucent animal with a few luminous ridges, rather than adding particles or making every strand brighter.

## 1. Give the membrane a quiet body and a deliberate luminous skeleton

The current portrait already has substantial membrane structure, but many equal-strength contours compete, particularly in moth. Reserve the strongest light for 2–4 continuously connected crests; let the remaining membrane establish a barely visible occupied volume. Keep the hole of torus and the spaces between coral branches dark. A fixed source-authored crest selection should hold over the entire gesture instead of selecting different bright points each frame.

Use the current crest curves rather than inventing a second surface. For a crest with core opacity a in [0,0.98], draw one broad colored underlight at opacity 0.075a and width 2.7w, then the existing colored core of width w, then a narrow neutral core no wider than 0.3w. The broad layer is cheap bounded overdraw, not a physically accurate volumetric glow. Never apply it to every dust sample or dependency. Avoid full-screen bloom: semantic territories must retain hue and separated structures must remain distinguishable.

Existing source-authored QDL: `surface.crests`, `light.crestAlpha`, `light.recessAlpha`, `composition.focus`. Proposed optional authored extension: one bounded `light.haloGain` in [0,0.12]; core geometry and material-owner color remain authored. Canvas rasterization choices, DPI, and quality tier stay renderer settings. Initial release can use a fixed renderer underlight without claiming it is a source parameter.

Visual experiment: `final-qdl-graphics-material-contact-sheet.png` compares the same source, same phase, same role palette for jelly, moth, and torus. It tests underlight together with round tissue marks. The separate JSON confirms canonical source equality across both renders; this is a display experiment, not a modified quine or a proved improvement.

Observed result: the extra light is subtle at portrait scale, and the round kernel slightly softens the torus dust. It does not substantially change creature identity or solve moth's competing lobes. Do not oversell this as a dramatic beauty pass: motion choreography and a coherent principal silhouette remain the larger gains. This restrained material pass is useful finishing work once those are established. The candidate's mark area differs from a square and was not exposure-normalized, so this image is not a controlled brightness benchmark.

## 2. Light one shared surface in depth, with restrained transmission

The existing four back-to-front layers are a useful foundation, but all crest lines are drawn after all body points, so a far ridge can appear in front of near tissue. Interleave crest segments with the same depth buckets. Start with 8 depth buckets and compare against current 4; increasing to 64 is unnecessary.

Current `surfacePoint` derives intensity from projected transverse compression. Preserve that identity-rich fold term, but add a single fixed light direction shared by all species. For P(u,v,t), form N = normalize(P_u × P_v), using finite derivatives and a guarded fallback for degenerate tangents. Use an orthographic view V = (0,0,1), unit light L = normalize(0.35,-0.45,0.82), diffuse D = max(0,N·L), and rim F = (1−|N·V|)^3. Bounded intensity can be E = clamp(b + dD + fF + cK,0,1), where K is current bounded compression and b+d+f+c ≤ 1. Suggested start b=.10, d=.20, f=.25, c=.45. Do not equate this illustrative shader with a physically based material.

For an opacity calibration independent of sample density, use alpha = 1−exp(−tau*w_i), with tau in [0,2] and positive quadrature weights w_i whose sum is constant when resolution changes. Repeated independent samples then have aggregate transmittance exp(−tau*sum(w_i)). This avoids brighter creatures merely because an adaptive tier increases sample count. Spatial sample distribution still affects image appearance; it does not prove raster invariance. Preserve existing `source-over` compositing for pigmentation; indiscriminate additive blending clips channels and shifts categorical colors.

Authored QDL could carry a closed light model and bounded coefficients. Camera/DPR, depth bucket count, derivative epsilon, and sample quadrature belong to the renderer. Material role ownership must stay in original coordinates. Scalar colors still come only from recorded execution values on a fixed domain. Light modulation conveys form, never a changed result.

Cost: compute derivatives only on sampled crests or a coarse reusable material grid first. Applying six extra geometry evaluations to all 24,000 samples risks exceeding the present frame budget. The recorded performance report has ~16–25 ms live renders, with some local cases ~35 ms; these are prior measurements, not benchmarks of this proposal.

## 3. Replace visible square dust with antialiased tissue without increasing density

The current body uses `fillRect` marks around 1.4–2.5 backing pixels. Prefer a small round, soft-edge sample kernel so narrow crests look like membrane rather than luminous grit. The experiment uses individual antialiased arcs to expose the visual difference; do not ship that per-point path approach without profiling.

Production Canvas path: pre-render a tiny radial sprite per role color and device scale, then use `drawImage`; retain existing color/opacity/depth batching. Keep the center nearly flat, with an edge-only softness ramp, so the point does not gain a huge halo. With normalized radius r, an edge ramp k(r)=1−H(clamp((r−.7)/.3,0,1)), H(z)=3z²−2z³, is finite in [0,1]. Normalize kernel integral against the square footprint when judging equal exposure. Otherwise apparent improvement may just be brightness.

Size backing store to visible CSS dimensions times min(DPR,2), with a fixed maximum pixel budget. Keep CSS and source geometry coordinates independent; use the same conversion for picking and SVG anatomy connectors. For export captures a dedicated supersampled offscreen canvas is acceptable; do not supersample every continuously animated gallery thumbnail. Adaptive resolution must not mutate QDL/source. Do not round moving organ geometry to integer pixels: saving raster work at the expense of visible stepping defeats coherent motion.

## Canvas or WebGL?

Finish this aesthetic pass in Canvas. It preserves the current approachable dependency-free implementation and permits a controlled before/after comparison. Cache palette sprites, reuse typed buffers, lower invisible work, and draw only visible portraits. OffscreenCanvas can move CPU work but does not make geometry calculation free.

WebGL2 becomes worthwhile if repeated profiling shows >33 ms p95 for a single visible portrait on target hardware, or many simultaneous animated specimens become a requirement. Instanced splats offer per-pixel soft edges; shaders can evaluate lighting and depth efficiently. Transparent objects still need an ordering strategy: a depth buffer alone does not solve overlapping translucent tissue. Keep the CPU interpreter and exact genome recovery unchanged, and define the same material-coordinate ownership contract for both renderers. Shader buffers and GPU precision are never the canonical genome. Account for context loss, GPU support, and capture parity before migration.

## Implementation order and acceptance

1. Ship the restrained crest underlight and inspect complete cycles in neutral and role-color modes. Budget only a few broad strokes per frame.
2. Add round cached tissue marks plus density-normalized alpha; compare equal exposure at low/high sample tiers and DPR 1/2.
3. Interleave depth buckets, then trial coherent light on crests before applying it to the whole surface.

Measure p50/p95 render time over 300 warm frames, foreground clipping, occupied bounding-box area, connected silhouette components, and high-luminance pixel fraction. Test all ten families at ≥12 phases including closed seams. A useful starting guard is <2% of foreground pixels near display-white saturation, with thresholds calibrated to artwork rather than declared universal beauty criteria. Require visibly intact torus holes, jelly roots, and coral branch gaps at thumbnail size. Confirm unchanged source/results under every renderer-quality/view change, exact quine and both genome identities, static reduced-motion parity, and genuine recorded pulse attribution. Review motion video as well as still images.

Primary implementation references: [MDN Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas) documents offscreen primitive caches, batching, DPR sizing, and avoiding expensive per-frame shadow/text work. [MDN compositing modes](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) defines available blend behavior. The formulas and numeric budgets above are bounded design proposals, not conclusions supplied by those sources.
