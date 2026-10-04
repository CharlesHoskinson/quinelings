# Final experimental QDL: lifeform choreography

The current membrane is already technically rich. Its strongest opportunity is to make one creature perform an intelligible gesture, with tissues following it. I inspected `morphology.js`, the QDL/design docs, current motion notes, and `research/living-motion-final-filmstrip.png`. Jelly reads as a coherent body; moth reads mostly as two independently tangled lobes; torus keeps a strong outline but spends detail on low-amplitude interior movement. The following are three concrete changes, in priority order. Do not add noise, more folds, or unconstrained simulation.

## 1. A bounded gesture score: prepare, stroke, recover, rest

Add optional `motion.gesture`, closed vocabulary such as `gather`, `unfurl`, `glide`, `hover`; select species-appropriate defaults. Each describes four bounded poses and four positive durations, rather than arbitrary executable expressions. The record is authored source; current pose is presentation state. Expose a small amount of posture and cadence control, not a timeline editor full of numbers.

Let c = fract(φ / 2π), with the existing monotone phase φ. Partition the cycle by durations d_i summing to one, each at least 0.1. For local interval coordinate z in [0,1], interpolate pose vectors using H(z) = 10z³−15z⁴+6z⁵. H′ = 30z²(1−z)² ≥ 0; H and its first two derivatives match at endpoints. Require final pose equal initial pose. This gives a C² closed gesture, including the loop seam. A deliberate resting interval can interpolate equal poses; secondary tissue may keep moving. This is not globally jerk-continuous, and it is not a physical energy optimum for the whole creature.

Represent poses by log longitudinal scale σ in [−0.15,0.15], body lean angle α in [−0.12,0.12] radians, and one family-specific opening amount o in [−0.12,0.12]. Use fixed closed primitives, not user-defined keyframe coordinates. Compose one major gesture with the existing weaker tissue wave; avoid simultaneously making every control oscillate at full amplitude.

Suggested personalities:

- Lanternkeeper gathers toward its quiet upper center, straightens, releases a long tendril, then settles.
- Jelly anticipates with a slight bell opening, gives a compact contraction, and lets tentacles recover after it.
- Moth sweeps both wings as one stroke, then allows a delayed trailing-edge fold. Preserve its bilateral skeleton but differ left/right fine tissue subtly.
- Coral keeps its root fixed; a slow outward inclination passes through tips, then recoils inward.
- Torus expands one chamber and passes a graceful circulation around the ring without spinning the whole animal.

Visual payoff: recognizable intent and contrast between movement and stillness. This is a designed lifeform gesture, never evidence that a task ran or that a creature has subjective thought. Execution pulses still require a recorded task occurrence.

Cost: one cached gesture calculation per body per frame, then a small number of multiplies per vertex. No frame history or solver. Validate interpolation monotonicity/ranges, C² temporal seam, extreme durations, freeze/reduced motion, and unchanged task/source behavior under pure view updates. Lean can prove H bounds and endpoint derivatives. Assess 8–12-frame silhouettes and a video, because a four-frame strip hides pacing.

## 2. Analytic passive tissue response instead of arbitrary lag

A lead tissue and its following appendage should have a causal-looking relationship in timing and amplitude. Retain deterministic random-access rendering by using the exact steady-state response of a damped harmonic follower; do not add a time-step integrator.

For a finite raw-phase harmonic driver q(t)=Σ A_j sin(ω_j t+β_j), use response

    y(t)=Σ A_j M_j sin(ω_j t+β_j−δ_j)
    r_j=ω_j/ω₀
    M_j=1/sqrt((1−r_j²)²+4ζ²r_j²)
    δ_j=atan2(2ζr_j,1−r_j²).

This solves y″+2ζω₀y′+ω₀²y=ω₀²q for the steady-state harmonics. Proposed bounds ζ in [0.75,1.5], fundamental frequency ratio in [0.15,0.8], and Σ|A_j|≤0.12. For ζ≥1/√2, M_j≤1 for every frequency, so displacement stays bounded by Σ|A_j|. Zero frequency remains well defined. Closed backbones retain integral spatial winding; periodic drivers retain integer temporal harmonics. Quasiperiodic drivers remain deterministic but are not falsely called loops.

Important implementation boundary: sin(φ+a sinφ) is not a finite raw-time harmonic sum. Applying the formula to that warped phase directly is an artistic phase delay, not an exact solution of the stated ODE. Use an explicitly bounded raw-phase harmonic driver, or document and test a finite Fourier approximation. Do not claim physical correctness of the existing arbitrary-lag field.

Visual payoff: tentacles and tails trail the principal stroke with visibly lower high-frequency amplitude, then settle coherently; membrane softness becomes legible. Derive root-to-tip softness with a smooth material coordinate, preserving root attachment. Start with jelly and comet rather than applying uniformly to all ten families.

Cost: response gains/phase delays precomputed when source changes; per-frame sine evaluations comparable to current wave modes. Numerical experiment `research/final-qdl-motion-experiment.json` shows damping 1 and frequency ratio 0.8 give amplitude 0.609756 and lag 1.349482 radians, versus nearly undiminished low-frequency motion. The experiment includes exploratory damping 0.7; proposed production bound is 0.75 because 0.7 would not establish the global non-amplification theorem.

Tests: harmonic ODE residual, response amplitude bound, exact repeatability across frame rates and seeks, closed seams, attached roots, finite extreme parameters, and no new interpreter/receipt effects. Lean should prove denominator positivity and the gain bound; JS verifies finite arithmetic and the declared frequency contract.

## 3. A single shared deformation map, with deliberate volume or area preservation

Currently `strandPoint`, `anchor`, and `surfacePoint` contain separately repeated family motion formulas. Some attachments use different coefficients. Establish a canonical material rest pose and apply one deformation D_t to membrane samples, organs, crests, and dependency endpoints. A filament remains pinned to D_t(A) and D_t(B). Chroma ownership remains in original material coordinates and cannot slide with the screen-space deformation.

A simple guaranteed invertible spine gesture in 3D is

    D_t(x,y,z) = R_t diag(exp(−σ/2),exp(σ),exp(−σ/2)) (x,y,z) + translation.

Its determinant is one and every singular value is positive. Rooted families rotate/scale about the declared root and use zero translation. For the 2D area-preserving option use diag(exp(−σ),exp(σ)). Choose one clear material convention. Current x-scale s and y-scale 1/√s have projected area factor √s, ranging approximately 0.9055–1.0863 at maximum breath; that is not an error unless area preservation was intended, but it is not an area-preservation proof.

Keep the current family wave as a separately bounded embellishment until its Jacobian is checked. A safe additional shear x↦x+a sin(ky−φ), y↦y has determinant one and explicit inverse; composable shears provide richer motion without requiring an integrator. Use bounded a≤0.06 and integral k where circle-valued domains demand seams. Do not casually multiply a root envelope into a shear that depends on x: doing so can change its determinant and invalidate the guarantee.

Visual payoff: every attached organ feels embedded in one animal, breathing affects its whole mass, and colored tissue stays attached during the stroke. It also gives a clearer formal boundary than adding more independent local sinusoids.

Cost: modest refactor, potentially fewer duplicate trigonometric evaluations. Test organ/membrane root coincidence across full cycles, material territory identity, endpoint pinning, inverse roundtrip, Jacobian determinant, 3D-to-2D projection finiteness, and same-phase identity after seeks. Geometry proofs establish the restricted map only; they do not automatically establish non-self-intersection of a folded ribbon.

## Suggested final scope

Implement the gesture score and shared transform first; use analytic passive response only for two demonstrator species if time allows. The acceptance criterion is a beautiful 6–10 second film with a clear principal stroke and quiet recovery, not a higher control count. Preserve source/animation separation, reduced-motion still frames, actual run receipts, and exact quine/genome identities. No language version freeze is needed for this experimental update.

Primary references: [Lasseter, Principles of Traditional Animation Applied to 3D Computer Animation](https://www.evl.uic.edu/aej/527/papers/lasseter.pdf) supports the artistic use of anticipation, timing, and follow-through. [Flash and Hogan, The Coordination of Arm Movements](https://bpb-us-e1.wpmucdn.com/sites.mit.edu/dist/5/1384/files/2025/02/1985-the-coordination-of-arm-movements-an-experimentally-confirmed-mathematical-model.pdf) supplies the minimum-jerk movement context. Those are design references, not claims that Quinelings reproduce human motor control.
