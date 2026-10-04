# QDL authored living motion

Reviewed the [published QDL interpreter](https://charleshoskinson.github.io/quinelings/qdl.js), local renderer, default/schema, design documentation, verifier, and finite Quint model. The old motion record exposes only the isolated phase clock; most personality comes from family formulas with fixed temporal coefficients. The extension makes movement a bounded, inspectable part of canonical source.

## Implemented contract

Optional `motion.rhythm` contains exactly `model`, `mode`, `rate`, `breath`, `wave`, `waveNumber`, `lag`, `asymmetry`, and `overtone`. Its absence remains accepted without rewriting source. All ten newly authored family designs have distinct presets. The filament factory and published default agree exactly. Coral and bloom use quasiperiodic secondary gestures; the other presets have closed temporal cycles.

The rhythm record supplies a monotone phase warp, normalized delayed harmonics, coherent breathing, and traveling tissue waves. Its analytic ingredients have elementary bounds: `1−asymmetry ≥ .2`, `1−breath ≥ .82`, and `1+overtone ≥ 1`. Periodic mode uses integer temporal harmonics; an irrational secondary frequency in quasiperiodic mode permits deterministic nonrepeating gestures. Closed backbones use circle-valued spatial controls and integral winding. These mechanisms suggest compliant tissue without mutable physical simulation state or execution effects.

`docs/QDL.md` records the implementation equations, controls, caveats, and exact schema ranges. The updated finite abstraction carries rhythm identity through rendering and child admission and encodes the positive scalar lower bounds. New negative controls reject changed rhythm offspring and detect a render transition that mutates rhythm. As described by the [Quint documentation](https://quint.sh/docs/), bounded randomized simulations search for counterexamples; this work does not claim a continuous geometry proof or exhaustive model checking.

## Verification

- `node verify-design.cjs`: 12 groups pass, including every new numeric boundary and invalid type, unknown/missing syntax, legacy omission without source mutation, each rhythm parameter through the quine and both genome codecs, unchanged task output, factory independence, and default/schema consistency.
- `quint typecheck spec/design.qnt`: passes.
- `quint test spec/design.qnt --max-samples=100 --backend=typescript`: 15 tests pass, including both rhythm identity controls.
- `quint run spec/design.qnt --invariant=safety --max-samples=1000 --max-steps=50 --seed=20261003 --backend=typescript --verbosity=1`: no violation found.

Framing remains a sampled envelope plus practical amplitude-dependent padding, not a proof that every permitted profile fits at every phase. Numeric boundedness does not establish visual quality. The concurrent Lean work initially assumed an exact three-field motion record. Its owner adapted the fixture generator separately; root reports that the current rhythm fixtures now pass its consistency check. No concurrent Lean files were edited in this task.
