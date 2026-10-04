# Lean formalization of experimental QDL

QDL now has two complementary specifications: Lean proves properties of typed designs, real-valued equations, constructor syntax, and an operational policy; Quint searches bounded transition traces for counterexamples. Neither freezes the experimental language. Dependency pins identify the proof toolchain, not a stable QDL release.

## Install and check

From the repository root:

```sh
npm ci
npm run lean:install
npm run formal:lean
npm run formal
npm test
```

The installer uses Elan without changing shell configuration, then Lake installs the Lean version in `spec/lean/lean-toolchain` and the dependencies recorded in `lake-manifest.json`. Lean and Mathlib are pinned to 4.34.1. Mathlib's compiled cache avoids rebuilding the library. The scripts find Lake in PATH or `$HOME/.elan/bin`; no root access is needed. Node 22 or newer, git, curl, and a C compiler are prerequisites.

The existing Quint tool is now a local development dependency. Its ZIP dependency is overridden to the patched 0.6.1 release; the selected dependency tree passes npm audit. Lean caches and downloaded libraries remain outside Git and website publication.

## Proof coverage

| Module | Checked property | Connection to implementation |
| --- | --- | --- |
| `QDL/Design.lean` | Closed families/primitives, exact authored bounds, hierarchy, decidable validator, valid default | Mirrors the fields and rational decimal domains in `qdl.js`, including optional rhythm controls |
| `QDL/Fixtures.lean` | Current default and all ten family profiles satisfy the formal bounds | Generated from the current JavaScript profiles; stale fixtures fail the check command |
| `QDL/Geometry.lean` | Positive organ radii, pinned filament endpoints, opacity hierarchy, bounded point/crest allocation | Exact-real and exact-natural counterparts of the documented equations |
| `QDL/Semantics.lean` | View isolation, guarded receipts, conservation, finite repeats/population, full-source admission identity | A host-policy transition model for arbitrary complete source values |
| `QDL/Rhythm.lean` | Strictly increasing warped phase, positive breathing/stretch, bounded normalized harmonics | Exact-real counterparts of the new authored rhythm formulas |
| `QDL/RhythmDefaults.lean` | A missing rhythm uses a valid effective fallback without editing source | Generated fixture checks the renderer’s actual fallback values |
| `QDL/ClosedSurface.lean` | Periodic focus, taper, spatial folds, and rounded integral winding; closed material opacity bounds | Scalar controls used by moth, torus, and bloom membranes |
| `QDL/Integration.lean` | Design-bearing quines, changed-design admission rejection, authoring isolation, task/design separation | Connects constructor ASTs to the generic operational policy |
| `QDL/Quine.lean` | Constructor evaluation reconstructs its own AST | Models the quote/run/apply and constructor pattern used by `makeTaskProgram` |

The geometry allocation proof accounts for the actual `max(12, floor(budget/(ribbons*4)))` sampling rule. Valid profiles allocate at most 24,000 surface points and 1,806 crest vertices. Inspection paths and Canvas bookkeeping are separate allocations.

`npm run lean:fixtures` regenerates authored decimal controls as exact rationals. The generated default is compared with the hand-authored Lean default. The generator also checks the expected JavaScript fields, so a new control cannot silently disappear from the fixtures. The check also compares every numeric Lean domain against the public JSON schema. These are executable correspondence checks, not verified translation or parser theorems.

## Scope of the claims

Lean checks proof terms in its kernel. The model contains no admitted proof placeholders or additional project axioms. Standard logical foundations used by Mathlib remain part of the trust boundary. The audit command checks the dependency closure of every exported QDL theorem and permits only the standard foundations `propext`, `Classical.choice`, and `Quot.sound`. Negative examples also check why the rhythm bounds are needed.

Typed records eliminate unsupported primitives and malformed harmonic counts after conversion. They do not verify a JSON parser or prove rejection of every malformed raw JSON value. Rational authored domains differ from JavaScript binary floating point. Exact-real geometry theorems do not establish pixel rendering, all-phase framing, beauty, or numerical stability of every floating-point execution.

The operational model symbolically emits a complete source value. The constructor model proves source reconstruction separately; neither is a verified refinement of the complete JavaScript interpreter, its fuel accounting, its task kernels, canonical JSON serialization, or genome codecs. Those implementation boundaries retain their JavaScript and browser tests. A future refinement needs explicit source conversion and execution correspondence theorems.

The next useful proof layers are a verified raw-syntax decoder, typed DAG kernel semantics, canonical byte serialization, and exact codec inversion. They should be added as the experimental semantics settle, before claiming end-to-end verified execution.

## Primary references

- [Lean installation and Mathlib project setup](https://lean-lang.org/install/manual/)
- [Elan toolchains](https://lean-lang.org/doc/reference/latest/Build-Tools-and-Distribution/Managing-Toolchains-with-Elan/)
- [Mathlib dependency setup](https://github.com/leanprover-community/mathlib4/wiki/Using-mathlib4-as-a-dependency)
- [Quint installation and checking](https://quint.sh/docs/getting-started)

## Integration of the living-motion work

The separate animation session adds optional coupled-harmonic rhythms, ten family presets, shared breathing and recovery, periodic and quasiperiodic gestures, closed membrane coordinates, and source-authoring controls. The Lean profiles and generated fixtures include these controls without inventing a stable language version.

`Rhythm.lean` proves the actual warped phase has a positive derivative and is strictly increasing. Its normalized harmonic blend stays in [-1,1] for arbitrary angles, covering both the integer and √2 secondary frequencies. Valid breathing bounds keep the reciprocal-square-root stretch well-defined. `ClosedSurface.lean` proves the circular focus/taper and integral fold factors repeat after one spatial circuit, including the nonnegative authored rounding rule. Both open and closed focus functions satisfy the opacity theorem's hypotheses.

These scalar results support the new renderer, but do not prove C1 continuity of every complete family surface, the correctness of memoization caches, aperiodicity of every nonzero quasiperiodic profile, or a global enclosure for the sampled portrait frame. The animation session's seam, continuity, late-time, cache, and framing tests remain the evidence for those implementation properties. New motion edits construct a new source identity; advancing presentation phase preserves an existing identity. The integration model makes that distinction explicit.
