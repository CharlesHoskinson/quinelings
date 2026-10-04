# Chroma status and linear-light semantics

`QDL.ChromaSemantics` complements `QDL.ChromaView`; it imports and reuses the
existing normalization, provenance predicate, trace type, and view state. It
does not define a competing resolver or normalization policy.

The conditional model distinguishes not-evaluated, stale, invalid, underflow,
valid, and overflow results. Freshness/source identity and successful declared
binding evidence come from the peer provenance model. Missing traces are
not-evaluated, previous-source traces are stale, and failed/unusable or nonnumeric
evidence is invalid. A current scalar with a positive domain retains its raw
value; values below/above the domain receive distinct statuses and saturate the
normalized color coordinate at zero/one. Bad nonpositive domains produce no
scalar. Missing, stale, and invalid statuses carry neither a raw scalar nor a
normalized coordinate.

Proofs establish inclusive valid-domain classification, including both endpoints
and a valid authored threshold, bounded normalized observations, saturation
outside the domain, and preservation of the original runtime and execution count
when observing scalar presentation. Observation is a pure read returning the
same view plus its result. These are properties of explicit Lean definitions,
not a refinement proof of the JavaScript trace-building or own-property path
resolver. Duplicate-row handling and IEEE-754 domain-width overflow remain
runtime checks. The model does not infer threshold decisions or execute tasks
when colors change.

Linear-light RGB is represented by three rational channels in [0,1]. Convex
mixing `(1-t)a+t b` preserves those bounds when `t` is in [0,1]; valid authored
chroma strength supplies that condition. Strength zero/one selects the exact
input color endpoints. This models the bounded linear-light mixing stage in
`chroma.js`, conditional on bounded converted input channels. The nonlinear
sRGB transfer functions, floating-point exponentiation, palette stops, final
rounding/clamping, perceptual accessibility, and categorical material territory
allocation are not proved by the convexity theorem.
