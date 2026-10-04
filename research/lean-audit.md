# QDL Lean proof audit

Independent review of the exact authored design judgment, operational model,
constructor-quine evaluator, geometry lemmas, and the current living-motion
implementation. The language remains experimental; this audit does not freeze
its format marker or claim a completed compiler correctness proof.

## Proofs and their relation to the implementation

`QDL.Design` uses rational authored decimal controls and closed model/family
constructors. Its validator equivalence is a correspondence between `decide`
and its own validity judgment. Generated fixtures additionally compare the
runtime default and ten current family designs with those exact domains. This
is useful synchronization evidence; it is not a proof of the JavaScript JSON
parser, IEEE-754 comparisons, or rejection of every raw input object.

`QDL.Quine` derives the reproducing AST through quote/run/apply constructors,
variable binding, and ordinary evaluation rules. There is no evaluator rule
that returns the currently executing source. The self-reproduction theorem is
therefore not circular. It includes the useful task invocation list and accepts
an arbitrary total task transformer, so reproducing the original quoted payload
does not assume that executing the task leaves its result unchanged. Payloads
may carry the complete design. `QDL.Integration` makes that connection explicit
and proves that changing a design changes constructor source and defeats exact
source admission.

The operational model deliberately abstracts successful reproduction:
`executed` assigns `emitted := some source`. Its reachable-state theorem proves
bounded execution/admission, resource accounting, guarded simulated receipts,
and source identity for those transitions. It does not independently derive
quine construction. The separate evaluator provides that construction proof.
The model does not establish JavaScript kernel refinement, arbitrary program
termination, canonical byte serialization, unique evaluation results, external
effect authorization, or security against hostile code.

`QDL.Geometry` proves exact-real organ positivity, pinned filament endpoints,
material opacity bounds, and exact-natural allocation bounds. The sample bound
counts dot vertices and separately counts all 301 vertices per crest, rather
than incorrectly applying the dot budget to the entire frame. It establishes
finite allocation sizes, not a hardware performance guarantee. Floating-point
rounding, degenerate tangent handling, sampled portrait fitting, camera
containment for all phases, and aesthetic quality remain outside these proofs.

## Current authored rhythm

The equations in `QDL.RhythmSafety` match the current `motionState`,
`bodyTransform`, and normalized traveling-wave driver in `morphology.js`:

- `warpedPhase(r,a,t) = r t + a sin(r t)` has derivative
  `r (1 + a cos(r t))`. Valid rate and asymmetry domains give a strictly
  positive derivative at every real time and a strictly increasing phase.
- `1 + breath sin(phase)` lies between `1 − breath` and `1 + breath`.
  Valid breath therefore prevents a zero or negative body scale; its square
  root and reciprocal square-root stretch are positive.
- `[sin(x) + overtone sin(y)] / (1 + overtone)` lies in `[-1,1]` for
  nonnegative overtone. The angles are arbitrary, covering delayed secondary
  pulses, integer harmonic motion, and the irrational secondary frequency
  without assuming either periodicity or quasiperiodicity.

The actual `wave`, `waveNumber`, and `lag` controls select amplitudes or angles;
the normalized-wave theorem is independent of their angle choices. It does not
by itself bound every family displacement. Periodic time closure, closed
backbone C0/C1 continuity, closed-membrane geometry, and reciprocal stretch
accuracy require their own proofs or runtime tests. The current omission of
`motion.rhythm` invokes a fixed valid runtime default; preserving that omitted
syntax and computing the default are runtime behaviors rather than a parser
refinement theorem. The proof does not claim that quasiperiodic mode always
produces a nonrepeating visible shape: zero amplitudes can remove its irrational
component.

The motion cache is an implementation optimization. Its snapshot comparisons
and in-place edit behavior are tested, not formally verified. Portrait framing
still samples sixteen normalized phases with a practical motion allowance;
randomized/late-time stress tests must not be described as a global enclosure
proof. Rendering or freezing a view is source-preserving in the operational
model, while shared real geometry purity is covered separately by runtime tests.

## Negative controls and trusted foundation

`QDL.Audit` checks that `.81` timing asymmetry and zero authored rate violate the
current validity domain. It also shows why the domain matters: asymmetry `1`
can stall phase velocity, and breath `1` can collapse body scale. These examples
would remain analytic facts even if an erroneous implementation accepted the
unsafe controls; fixture and boundary tests provide the implementation link.

The audit prints dependency closures of the major validator, geometry,
operational, quine, integration, and rhythm theorems. Current closures use only
Lean/mathlib's standard `propext`, `Classical.choice`, and `Quot.sound`, or no
axioms. No project axiom, `sorry`, or `sorryAx` is needed. This is a foundation
and admitted-proof audit, not a claim that classical real analysis is axiom-free.
The project check also scans all source files for admitted proofs and custom
axioms; dependency checks should expand whenever new major theorems are added.
