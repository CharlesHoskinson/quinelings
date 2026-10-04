# Final experimental QDL: continuous geometry before complexity

Review of `morphology.js`, QDL/design documents, Lean Geometry/Rhythm/ClosedSurface, and the final motion proposal. Three changes below aim for a readable silhouette, stable attached tissue, and purposeful detail. They extend the experimental language directly; no version freeze is proposed. Existing Lean results prove radius/opacity/resource bounds and several scalar seam equalities, not regularity of the complete surface, absence of self-intersection, or beautiful silhouettes.

## 1. Regular spines and transported membrane frames

Highest priority: make each family define one regular 3D material spine γ(u,t), then obtain membrane/organ attachment frames from that spine. Current `surfacePoint` obtains a planar normal from a fixed finite difference of the projected strand, then applies depth. A projected tangent can vanish even when a 3D spine is regular; the `len || 1` fallback does not supply a well-defined direction. Frenet frames would also fail at zero curvature. Use a rotation-minimizing (Bishop) frame for the spatial curve instead:

    T = γᵤ / ||γᵤ||
    N₁ᵤ = −(Tᵤ · N₁)T, N₂ = T × N₁
    S(u,v,t) = γ(u,t) + v w(u,t)[cos θ N₁ + sin θ N₂]

Require γ to be C² with ||γᵤ||≥η>0 on its compact authored domain. Transport at a fixed material mesh from a deterministic root frame, recomputing from source plus requested phase rather than frame history. Apply the shared deformation map proposed by the motion review to this rest structure when possible; that retains root orientation and avoids arbitrary seed-frame changes over time. In discrete implementations detect coincident vertices and near-antiparallel tangents before double reflection/minimal rotation; refine or reject the local mesh instead of inventing a direction. Camera alignment is not a geometric degeneracy. [Wang, Jüttler, Zheng and Liu's primary RMF paper](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/Computation-of-rotation-minimizing-frames.pdf) describes double reflection and its fourth-order global approximation under smoothness assumptions. It is an approximation, not an exact proof of the JS renderer.

Repair open-tip parameterization first. In `strandPoint`, the seed and default filament branches use E(u)=`sqrt(max(0,1−(2u−1)²))`=2√(u(1−u)) for u∈[0,1]. E is continuous on [0,1] and smooth on (0,1), but E′=(1−2u)/√(u(1−u)) is unbounded at both tips. A nonzero lateral coefficient therefore destroys finite endpoint parameter-speed bounds. This can be an intentional visual tip and does not invalidate finite-coordinate tests; it does invalidate an unqualified C¹/finite-curvature claim in this parameterization. Use geometric latitude q=πu, height −cos q and lateral envelope sin q, where the rest geometry permits a smooth meridian. A full meridian needs both radial and longitudinal components to remain regular; merely replacing sqrt by sin while retaining arbitrary offsets is not a complete regularity proof. Point-collapse at a surface pole requires a separate cap chart or exclusion of the pole from the ribbon chart. A zero-width ribbon boundary can be intentional, but do not assert rank-two immersion there.

Closed frames have holonomy: transporting around a closed regular curve need not return N₁ to its starting direction. Measure signed residual rotation δ and distribute a compensating angle −δℓ/L by arc length. This closes the frame but intentionally adds uniform twist, so describe it as a seam-corrected transport frame. θ must otherwise be circle-valued (integer winding plus periodic terms). Require γ and its first two spatial derivatives to agree at u=0,1, as well as the corrected frame, width, material ownership, opacity, and normal. Periodic temporal mode separately requires equality at t and t+period; quasiperiodic mode must not promise an exact temporal loop. RMF alone does not guarantee the swept surface is injective.

Minimal syntax: one optional closed tag `surface.frame: "transport"`, whose implementation fixes regularity tolerances and seam correction. No arbitrary vector expressions or user-authored frame axes. Family primitives own whether their domain is open, circular, or capped. Fail validation/compilation clearly when the chosen authored primitive cannot meet its regularity contract; preserve old data as experimental legacy until migrated deliberately.

Proof/test targets: regular primitive speed lower bounds; transported orthonormality in exact arithmetic; corrected frame seam; finite and continuous JS frames at straight portions, inflections, extreme posture, camera-aligned tangents, and phase seeks; explicit degenerate-fixture rejection; shared organ/filament roots. Ensure rendering remains source-preserving.

## 2. Spend samples on curvature, while keeping material identity stable

Current bright crests use 301 uniformly spaced vertices regardless of family shape. Membrane sampling has four transverse columns and uniform parameter rows. Curved tips and tight nautilus chambers need more resolution than long quiet stretches. Improve the few silhouette-carrying crests before increasing total particles.

For a C² projected crest F on interval [a,b], if ||F″||≤M there, the linear chord satisfies

    sup ||F(u) − L(u)|| ≤ M(b−a)²/8.

This follows by the interpolation-error Green kernel and the vector norm triangle inequality. Convert the author-independent numerical geometry tolerance to pixels with the actual camera scale. Use analytic/interval derivative bounds for approved primitives; midpoint residual and curvature estimates are useful empirical checks but are not certificates. A symmetric oscillation can have zero endpoint and midpoint residual while hiding multiple loops. Curvature-only allocation also needs speed: ||F″|| includes tangential acceleration, not just normal curvature.

Build a deterministic nested dyadic mesh, maximum depth 10 and a fixed shared crest-vertex budget of 1806 (existing maximum). Split the largest bounded-error interval until tolerance or budget; when budget is exhausted report degraded resolution rather than silently claim the tolerance holds. Recompute mesh only at source/view-scale changes. For animated shapes use a bound over all periodic phases, or over the whole torus of independent quasiperiodic phases; a few temporal samples are not a proof. Stable material sample IDs prevent tissue colors from swimming and avoid adaptive-frame flicker. Density/opacity must compensate for changing sample distribution if translucent particles are also redistributed; otherwise adaptation unintentionally paints more light in high-curvature regions.

Minimal syntax: optional `surface.sampling: "curvature"`; tolerance/mesh ceilings are renderer policy initially, not additional artistic sliders. Keep `surface.samples` the particle budget and explicitly retain the separate crest budget. This improves smooth contours rather than adding folds.

Proof/test targets: the C² chord bound, partition nesting, deterministic allocation, actual total budget, maximum sampled residual against a dense oracle, closed duplicate endpoint handling, persistent material ownership, and screenshots at portrait/thumbnail sizes. Lean's existing 301-vertex arithmetic does not apply after this change; update the bound to the actual total allocation before claiming it.

## 3. Give graphs a bounded low-frequency silhouette signature

Graph depth/fanout currently increase fold/ribbon counts. That tends to add busy fine structure rather than a distinctive gesture. Reserve at most three normalized graph statistics for broad geometry: depth distribution skew, source-to-action concentration, and normalized fanout. Keep the exact program recoverable through the existing genome; geometry remains a readable projection, not an injective source codec.

For a regular base spine γ₀ and smooth vector perturbation modes Pⱼ, use

    γ(u) = γ₀(u) + Σ aⱼ Pⱼ(u), j=1..3
    Σ |aⱼ| sup ||Pⱼ′|| ≤ η₀/4,
    where inf ||γ₀′|| ≥ η₀>0.

Then ||γ′||≥3η₀/4, so these silhouette controls cannot introduce a cusp. For circular primitives Pⱼ are integral Fourier modes of order at most 3; a demonstrator can use higher order 5 to test bounds, but the portrait default should stay quieter. Open modes use endpoint-pinned smooth envelopes with bounded derivatives, not an unbounded square-root envelope. Express coefficients in family rest coordinates, and let the single shared deformation carry them with the body. A graph-derived sign may choose a consistent lean, but do not flip posture each animation frame or based on unrecorded execution. Species remains authored; statistics supply individuality inside it.

Require displacement Σ|aⱼ|≤0.08 in normalized body units, regularity budget above, and for tubes/ribbons local width·curvature<0.6 where that restricted tube condition applies. This reduces local folds around a spine, but does not prevent distant pieces crossing: use separation checks for primitives meant to be embedded. Transparent overlapping membranes can be an intentional art choice, clearly separate from a topological guarantee.

Minimal syntax: `surface.structure: "low-modes"`; statistic definitions, coefficient scale and mode assignment are fixed compiler rules, not executable expressions or 30 new sliders. Chroma ownership still follows exact node/material coordinates; shape controls do not invent new task edges.

Proof/test targets: normalized statistics in [−1,1] or [0,1], perturbation speed and displacement bounds, unchanged exact task semantics, graph edits cause measurable bounded coarse-shape changes, replay changes no source, and common-phase grayscale silhouette comparisons. Use visual review to judge whether the result is elegant; low frequencies alone cannot guarantee that.

## Small experiment and recommended order

`final-qdl-geometry-experiment.cjs` writes the JSON beside it. Current endpoint secant speeds at h=0.01/0.0001/0.000001 grow from 3.38 to 18.45 to 170.44 for filament and 5.25 to 50.80 to 508.32 for seed, consistent with the known square-root endpoint derivative singularity. This numerical probe is diagnostic, not a theorem about every strand.

A circle of radius 0.43 with bounded harmonics has base speed 2.70177, derivative perturbation bound 0.43354, and certified regular speed lower bound 2.26823. The analytic second-derivative bound gives 57 segments for normalized error 0.001: certified chord bound 0.00098575, observed dense residual 0.00097648. The experiment illustrates safety/error contracts; it does not replace all-family testing or provide a completed new renderer.

Implementation order: regular tip coordinates and shared rest geometry; transported frame plus complete seam contract on torus; bounded adaptive crests; low-mode individuality on filament/seed only; expand to other families after common-phase grayscale and short-motion visual review. Coordinate this with the motion proposal's shared deformation and gesture score. Prefer one clean continuous silhouette with three restrained modes over extra attractors, folds, or particles.
