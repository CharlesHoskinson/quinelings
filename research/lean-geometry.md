# Continuous geometry and allocation proof review

`spec/lean/QDL/Geometry.lean` formalizes exact-real equations from `qdl.js` and
`morphology.js`, together with exact-natural sampling allocations. It proves:

- The cosine-harmonic organ is bounded below by `R(1-a-b)` and strictly positive
  for valid authored organ parameters and nonnegative degree/literal magnitude.
  The `min(0.16, ...)` radius cap is included in the design-connected theorem.
- Both coordinate components of a pinned-sine filament equal their declared
  endpoints at `u=0` and `u=1`, for arbitrary normal, frequency and phase.
- The *actual* material expression uses the real power `compression^(9/10)`.
  Gaussian focus and clamping establish its unit-interval factors; its opacity
  stays between recess and crest levels without replacing that exponent by an
  unrelated polynomial.
- The actual `max(12, budget/(ribbons*4))` sampling grid fits its point budget.
  The separate 301-vertex crest tracks give at most 1,806 extra vertices, hence
  at most 25,806 combined surface/crest vertices per full frame.

These are mathematical specifications, not proofs of JavaScript floating-point
operations, typed-array storage precision, frame time, complete silhouette
framing across all phases, physical light transport or visual attractiveness.
Inspection graph paths are separate and not counted in the surface budget.
No source inversion or renderer injectivity claim follows from these equations.

The parent owns dependency installation/build integration. Build validation is
pending until that installation finishes; theorem drafts have no `sorry` or
custom axioms.
