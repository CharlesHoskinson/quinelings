# Living motion review — 2026-10-03

Reviewed the [published collection](https://charleshoskinson.github.io/quinelings/#collection) and the local implementation in Chromium. Captures use the actual canvas renderer with reduced motion enabled and explicit deterministic phases; no generated images or pixel-golden assertions.

The published bodies already had recognizable silhouettes. Their motion lacked distinct contraction/recovery, trailing tissue lag, and a coherent repeating cycle. The jelly's tentacle roots visibly floated below its bell. The closed moth, torus, and bloom centerlines met at their endpoints, but their surrounding membranes did not: measured maximum 3D seam gaps were 0.010697, 0.009189, and 0.006594 respectively. Time-dependent surface thickness and clamped endpoint normals caused these gaps.

The revised specimens visibly improve those defects. Jelly contraction drives trailing tentacles and the added lower rim joins the silhouette; moth fore/hind wings share a stroke with delayed trailing edges; torus folds circulate along a (1,3) winding. The logarithmic nautilus and golden-angle seed remain distinct. Shared motion keeps executable graph endpoints attached while periodic specimens return their complete membrane, lighting, nodes, and filaments to their starting configuration. Quasiperiodic profiles add a secondary phase that changes successive cycles. These are authored mathematical animations, not a biological simulation.

## Evidence

- [Published collection](living-motion-live-collection.png) and [local collection](living-motion-optimized-collection.png).
- [Published four-phase filmstrip](living-motion-live-filmstrip.png) and [final four-phase filmstrip](living-motion-final-filmstrip.png): jelly, moth, and torus at normalized driver phases 0, π/2, π, and 3π/2. For the old version, which has no rhythm rate, phases use rate 1.
- [Authored motion controls](living-motion-final-controls.png).
- [Paired browser timings](living-motion-performance.json) and [seeded parameter exploration](living-motion-stress.json).

## Verification

`node verify-morphology.cjs` passes 11 behavioral groups across all ten families. New checks cover full membrane position/shading/tangent closure, whole-body periodicity, bounded harmonic drivers, quasiperiodic cycle differences, late-time determinism and continuity, graph endpoint attachment, legacy designs without a rhythm record, extreme motion parameters, species distinction, and the minimum material sample budget. Closed-surface positional gaps fell to floating-point roundoff (about 10⁻¹⁴). These tests measure geometric contracts; they do not compare screenshots or duplicate the rendering equations.

`verify-motion.py` passes the original shared-clock, frozen-pixels, reduced-motion, hit-testing, keyboard focus, and mobile-width tests plus new motion-authoring checks. Mode, breath, wave, and lag controls change canonical source without executing a task. Fixture and cycle changes retain authored rhythm. Reproduction and both recovery codecs preserve it exactly. Reset restores species defaults while retaining selected task inputs.

A reproducible legal-parameter sweep (`node research/living-motion-stress.cjs`, seed 20261003) checks 30 designs and 60,000 surface points through phase 10,000, varying motion, material shape, and camera composition. No sampled point clips: maximum normalized half-frame occupancy was 0.366 against the 0.5 boundary. This is sampled regression evidence, not an analytic proof over every legal design and real-valued phase.

A performance regression in the first implementation was caught and corrected by sharing rhythm state and precomputing deformation/projection coefficients. Paired sequential measurements in the same browser put final median full-render costs around 20–35 ms across species, versus the published version's roughly 16–24 ms on this desktop. `living-motion-performance.py` measures both material generation and complete rendering after warm-up; timing results are advisory rather than machine-dependent test gates. Other hardware and simultaneous canvases can have different frame rates.

The jelly attachment improvement is a coherent silhouette and shared center/depth motion. Its independently folded membrane strips can still intersect or slightly offset; this review does not claim a watertight biological mesh.
