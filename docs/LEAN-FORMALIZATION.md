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
| `QDL/Design.lean` | Closed families/primitives, exact authored bounds, hierarchy, decidable validator, valid default | Mirrors the fields and rational decimal domains in `qdl.js`, including optional rhythm, material territories, and scalar-lens controls |
| `QDL/Fixtures.lean` | Current default and all ten authored library profiles satisfy the formal bounds | Generated with `forProgram`, including Lanternkeeper’s scalar lens; stale fixtures fail the check command |
| `QDL/Geometry.lean` | Positive organ radii, pinned filament endpoints, opacity hierarchy, bounded point/crest allocation | Exact-real and exact-natural counterparts of the documented equations |
| `QDL/Semantics.lean` | View isolation, guarded receipts, conservation, finite repeats/population, full-source admission identity | A host-policy transition model for arbitrary complete source values |
| `QDL/Rhythm.lean` | Strictly increasing warped phase, positive breathing/stretch, bounded normalized harmonics | Exact-real counterparts of the new authored rhythm formulas |
| `QDL/RhythmDefaults.lean` | A missing rhythm uses a valid effective fallback without editing source | Generated fixture checks the renderer’s actual fallback values |
| `QDL/ClosedSurface.lean` | Periodic focus, taper, spatial folds, and rounded integral winding; closed material opacity bounds | Scalar controls used by moth, torus, and bloom membranes |
| `QDL/Chroma.lean` | Scalar provenance, stale/failed/unbound/nonnumeric rejection, zero-value availability, bounded monotone normalization, view isolation | Rational scalar evidence with explicit complete-source and declared-binding checks; trace construction and path extraction remain external |
| `QDL/Integration.lean` | Design-bearing quines, changed-design admission rejection, authoring isolation, task/design separation | Connects constructor ASTs to the generic operational policy |
| `QDL/ChromaSyntax.lean` | Safe bounded own-property paths, positive scalar domains, inclusive thresholds, unique bindings, graph membership | Uses the Astra session’s current chroma grammar; graph membership is a separate judgment |
| `QDL/Chroma.lean` | Scalar provenance, stale-source rejection, clamped monotone normalization, view isolation, authoring invalidation | Exact-rational projection of supplied traces, with property lookup and trace construction outside the proof |
| `QDL/ChromaSemantics.lean` | Six scalar states, unavailable values stay absent, under/overflow saturation, observation preserves execution, convex linear-RGB bounds | Complements the trace-provenance model; transfer curves, rounding, ownership, and pixels retain runtime tests |
| `QDL/ByteColors.lean` | Canonical RGB byte records are injective, round-trip, and reject malformed channel relationships | Exact per-byte counterpart of the genome color encoding, separate from rendered body colors |
| `QDL/Quine.lean` | Constructor evaluation reconstructs its own AST | Models the quote/run/apply and constructor pattern used by `makeTaskProgram` |

The geometry allocation proof accounts for the actual `max(12, floor(budget/(ribbons*4)))` sampling rule. Valid profiles allocate at most 24,000 surface points and 1,806 crest vertices. Inspection paths and Canvas bookkeeping are separate allocations.

`npm run lean:fixtures` regenerates authored decimal controls as exact rationals. The generated default is compared with the hand-authored Lean default. The generator also checks the expected JavaScript fields, so a new control cannot silently disappear from the fixtures. The check also compares every numeric Lean domain against the public JSON schema. These are executable correspondence checks, not verified translation or parser theorems.

## Scope of the claims

Lean checks proof terms in its kernel. The model contains no admitted proof placeholders or additional project axioms. Standard logical foundations used by Mathlib remain part of the trust boundary. The audit command checks the dependency closure of every exported QDL theorem and permits only the standard foundations `propext`, `Classical.choice`, and `Quot.sound`. Negative examples also check why the rhythm bounds are needed.

Typed records eliminate unsupported primitives and malformed harmonic counts after conversion. They do not verify a JSON parser or prove rejection of every malformed raw JSON value. Rational authored domains differ from JavaScript binary floating point. Exact-real geometry theorems do not establish pixel rendering, all-phase framing, beauty, or numerical stability of every floating-point execution.

The operational model symbolically emits a complete source value. The constructor model proves source reconstruction separately; neither is a verified refinement of the complete JavaScript interpreter, its fuel accounting, its task kernels, canonical JSON serialization, or complete genome codecs. The per-byte RGB proof does not yet establish canonical JSON serialization, full-strand framing, or harmonic codec inversion. Those implementation boundaries retain their JavaScript and browser tests. A future refinement needs explicit source conversion and execution correspondence theorems.

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

## Integration of chromamapping

The Astra session adds fixed material territories, operation-role pigment, and authored scalar lenses that read recorded task results. QDL preserves missing and stale states rather than inventing numeric values. Role colors and quantitative body colors are lossy presentation layers; exact opcode colors and RGB byte records remain separate.

The syntax model uses the shared QDL grammar directly. Generated profiles include Lanternkeeper’s fault-score binding and the optional-free legacy form. Rational domains prove strict ordering and inclusive thresholds, while runtime checks additionally reject nonfinite numbers and overflowing domain widths. Path proofs exclude prototype-related keys and bound indices; they do not verify JavaScript property lookup or a raw JSON parser. String lengths use Lean Unicode characters, with parser correspondence still outside the model.

## Chroma and scalar-lens integration

The typed `Design` now includes `Option Chroma`. `Chroma` retains its model, palette, strength, and optional scalar lens. The lens retains its kind, identifier, label, unit, two domain endpoints, optional threshold, and every node/path binding. String keys and natural-number array indices are distinct path constructors. Validity mirrors string lengths, path and binding counts, forbidden prototype keys, index limits, increasing domains, threshold inclusion, and node uniqueness. The complete-design quine and admission theorems therefore continue to cover all newly authored chroma data; none of those proofs was replaced with a projection that discards new fields.

Scalar domains have no arbitrary global magnitude cap in JavaScript. Lean represents their finite authored values as rationals and proves the positive-width relationship. The JavaScript validator also rejects nonfinite endpoints, nonfinite differences, and invalid numeric inputs; rationals do not model IEEE-754 overflow. The executable domain checker treats endpoint and threshold constraints as relational controls and recursively checks numeric alternatives inside binding paths. It also checks the schema's string and collection limits against the typed syntax. This is a maintenance check on the authored notation, not a verified schema parser.

The fixture generator now uses the actual library `forProgram(item)` design, rather than just its family's default. It checks node references with the runtime binding validator before emitting a fixture. Lanternkeeper consequently carries the exact `faultScore` binding, domain `[0,1]`, and threshold `0.625`. Additional fixtures cover omission of both rhythm and chroma without inserting either into the source. Existing default, rhythm-fallback, geometry, semantics, constructor, and integration proofs remain intact.

`Chroma.lean` models a trace as a complete source identity, binding, success flag, and optional rational value. A displayed scalar requires the current source, a successful trace, and an exact declared binding. Theorems reject stale sources, failed traces, undeclared bindings, and unavailable scalar values while preserving numeric zero as a value. Clamped normalization is in `[0,1]`, maps the declared endpoints to zero and one, and is monotone for valid domains. Selecting a color mode preserves both runtime and recorded evidence; reauthoring starts with no cached evidence.

The evidence abstraction assumes that the supplied trace identity, binding, success flag, and numeric value describe a real recorded run. It does not prove output-path extraction, JavaScript trace authenticity, browser invalidation, numerical color interpolation, shader output, or perceptual accessibility. Those remain executable and browser verification concerns. In particular, `none` represents missing or nonnumeric evidence, not zero.

The expanded Quint model carries chroma strength, lens metadata/binding identity tokens, sampled domain/threshold values, cached trace provenance, and value-view selection. Render, replay, and lens selection preserve effects and execution counters. Scalar display requires a matching source and full design profile, a successful numeric trace, and an authored lens. Tests cover changed chroma/lens child rejection, stale-source and changed-design caches, failed and nonnumeric evidence, and deliberate unsafe stale display or lens mutation during rendering. The model uses finite lens tokens and small domain samples; it does not enumerate every string, path, number, or rendered color.
