# Executable formal design model

Primary artifact: `spec/design.qnt`, module `design`. Chosen tool: Quint 0.33.0,
already installed globally through mise. No dependencies or Lean installation
were added. Quint is appropriate for this finite transition system and produces
useful executable scenarios and counterexamples. Lean would be useful later for
analytical proofs about trigonometric envelopes, Fourier recovery and numerical
error bounds; the present checks are not those theorems.

The model follows Quint's official [state/action semantics](https://github.com/quint-co/quint/blob/main/docs/content/docs/lang.md),
[builtin operators](https://github.com/quint-co/quint/blob/main/docs/content/docs/builtin.md),
and [simulation/property workflow](https://quint.sh/docs/checking-properties).
Command options were checked against the installed 0.33.0 CLI, because options
and simulator backends can differ between versions.

## What is worth formalizing

The useful requirements are precise behavioral relationships, rather than whether
a portrait feels alive or beautiful:

| Characteristic | Model obligation | Practical purpose |
| --- | --- | --- |
| Source identity across display phases | `source == origin`; emissions are zero or the same source | Animation cannot redefine the program |
| Render/replay separation | Render, pause, replay and rejected admission preserve execution/effect/child counters | Scrubbing a trace must not perform an action |
| Guarded effects | Each execution increments effects iff both guard and permission are true | A bright pulse reflects a simulated receipt |
| Repeat and work bounds | Executions <= repeats, repeats in 1..8; energy never negative | Display frames cannot imply unlimited computation |
| Population bounds | Children <=2; one shared resource unit per accepted child | Reproduction remains an explicit finite operation |
| Exact source child admission | Emission and candidate must both equal parent source, with remaining budgets | Decorative similarity does not grant admission |
| Opcode and color identity | Distinct modeled opcodes have distinct exact colors; role mapping is stable | Accent and phase cannot change instruction meaning |
| Structural geometry | Acyclic levels, bounded anchors and exact edge endpoints | Filaments represent declared connections |
| Stable design profile | Source, emission and admitted child preserve the complete modeled profile | Reproduction preserves the phenotype annotation |
| Positive radial envelope | `baseRadius * (1000-a-b) > 0` | Valid amplitudes cannot collapse the abstract lower bound |
| Ink hierarchy | Integer alpha samples satisfy ghost < secondary < ridge | Preserve the intended visual density order |

The two-child population cap and ten-unit shared work budget are illustrative
policy values in this formal model, not claims about the current runtime's actual
population admission policy. Root's QDL validator owns concrete metadata limits.

## State and abstraction boundary

State uses three abstract source IDs; source zero is reserved for “not emitted.”
There are four display phases, a pause flag, nondeterministically chosen repeat
limit 1..8, execution/effect counters, emitted and admitted child source tokens,
and a ten-unit resource budget. Initialization varies source, repeat limit and a
bounded nondeterministic design profile.
`step` interleaves render, pause, trace replay, guarded execution, valid admission
and rejected admission. Render/replay never consume that execution budget.
All fields range over finite reachable sets; rejection and view transitions allow
continued simulation after execution or child budgets are exhausted.

The design profile mirrors numeric limits read from `qdl.js`:

| Parameter | Integer model domain | QDL numerical domain |
| --- | --- | --- |
| Family | 0..9 | The ten entries in `QDL.FAMILIES`, in declared order |
| Harmonic a, b | Each 0..450 | Each 0..0.45 |
| Base radius | 10..80 | 0.01..0.08 |
| Degree/literal gains | 0..6 / 0..3 | 0..0.006 / 0..0.003 |
| Filament bend | 0..80 | 0..0.08 |
| Frequency gain / ripple | 0..200 / 0..300 | 0..0.2 / 0..0.3 |
| Phase rate | 0..50 | 0..0.05 |
| Ink ghost/secondary/ridge | 0..1000 with strict order | 0..1 with strict order |
| Framing scale / padding | 250..470 / 80..250 | 0.25..0.47 / 0.08..0.25 |

All numeric values use milliscale integers: one model unit denotes 0.001 in QDL.
The model samples this finite grid, not every JavaScript floating point value.
Model tags (`rosette`, `pinned-sine`, `separate`, `freeze`) and QDL version 1 are
fixed rather than mutable parameters. The neutral RGB string is not modeled;
its source-preserving identity remains in the opaque source token and real codec
checks. Root's actual constructor embeds the full validated phenotype annotation
in source. The model explicitly records origin, emitted and child profiles and
requires record equality on admission, so changing a family while preserving the
opaque source ID is still rejected. Profiles remain immutable through all normal
transitions. Zero phase rate freezes the model phase, as does pause. All nonzero
rates advance one abstract phase tick; distinct positive rates are not represented
as different timing intervals. The exact source token represents unmodeled graph/metadata.

The radial invariant checks an integer lower-bound numerator. Each amplitude is
at most 450, so `1000-a-b` is at least 100 and base radius is at least 10. Under
the mathematical premise that each cosine lies in [-1,1], this corresponds to a
positive continuous radial envelope. Quint does not prove that trigonometric
premise, JavaScript `Math.cos` accuracy, actual rendering positivity, or the
degree/literal-gain geometry formula. It verifies the discrete parameter bound.

The structural representative is a four-node chain:
input → transform → guard → action. Node IDs, opcodes, role strings, frequency
indices 1..4, depth and fanout are immutable derived metadata. Exact colors are
abstract codes 100..103, **not the browser's literal RGB opcode dictionary**.
The existing JavaScript audit tests the actual opcode palette for injectivity.
The model checks this representative DAG; it does not quantify over every graph
of up to 64 nodes or prove all 26 kernels correct.

Anchors and filaments use finite integer coordinates. Endpoint parameters 0 and
2 return the same anchor function used by each operation node. Interior parameter
1 is only an abstract representative; it is not a simulation of the renderer's
trigonometric interpolation. Pinned endpoints and finite coordinate bounds hold
for every modeled phase. This does not prove screen margins, unclipped biological
forms, or any continuous real-number geometry. Node anchors and op identity are
separate from the execution counters.

`encodeToken` and `decodeToken` preserve a tagged source identity by construction.
`codecAssumption` is explicitly an **abstract codec identity assumption**. It
does not implement UTF-8, FNV-1a, integer harmonics, RGB arithmetic, rounding,
corruption detection or screenshots. Those actual machine representations are
independently exercised by `audit.cjs` and the library checks. A refinement proof
connecting JavaScript executions to these Quint transitions has not been built.
One model execution represents one task run with at most one simulated action;
real graphs can have multiple guarded action nodes, so counter scaling differs.
Model energy also does not stand for measured CPU time, physical energy or money.

## Verification commands and observed results

```sh
quint --version
quint typecheck spec/design.qnt
quint test spec/design.qnt --max-samples=100 --backend=typescript
quint run spec/design.qnt --invariant=safety --max-samples=1000 --max-steps=50 --seed=20261003 --backend=typescript --verbosity=1 --witnesses hasEffect hasChild exhaustedRepeats rejectedCandidate
```

Version: 0.33.0. Typechecking exits 0. Nine scenarios each pass 100 randomized
initializations (900 successful scenario runs): render/replay/pause separation,
false-guard execution, correct child admission, rejection before emission,
rejection of source mismatch, child-budget exhaustion, and detection of an
intentionally unsafe replay action, rejection of a modified design profile, and
detection of an intentionally unsafe family change during rendering.

Seed 20261003 (printed as `0x135288b`) explores 1,000 traces with 50 transitions
each, checking the combined `safety` invariant at every state. No violation was
found. Witness coverage on this bounded sample:

| Witness | Traces |
| --- | ---: |
| At least one simulated effect | 644/1000 |
| At least one admitted child | 814/1000 |
| Repeat budget reached | 962/1000 |
| Candidate rejection occurred | 1000/1000 |

These are seeded randomized simulations, **not exhaustive state exploration or
machine-checked inductive proofs**. They establish observed bounded conformance
of this specification and nonvacuous exercise of important paths, not universal
correctness of a browser implementation. No liveness or fairness property is
claimed; an indefinitely replaying trace is permitted.

## Negative control

`unsafeReplay` is intentionally excluded from normal `step`. It increments effects
while replaying. `detectsUnsafeReplayTest` passes only if the invariants reject that
mutation. A real counterexample is reproducible with:

```sh
quint run spec/design.qnt --step=unsafeStep --invariant=safety --max-samples=100 --max-steps=10 --seed=20261003 --backend=typescript --verbosity=1
```

Expected exit is 1, “Invariant violated.” The minimal negative scenario is two states:
initial effects=0, executions=0, followed by replay with effects=1, executions=0.
It violates effect provenance and view separation, showing that the safety test
is capable of detecting the relevant regression rather than simply passing a
model with no execution or effects.

`unsafeProfileRender` is also excluded from normal steps. Its separate scenario
passes only when mutating family during render violates `sourceIdentity`, even
though the opaque source token and effect counters do not change.

## Limits and next useful work

The formal model is reviewable policy, not a perceptual aesthetic score, biological
life model or claim about hidden LLM thought. Extend the discrete abstraction with
model-based JavaScript trace replay before claiming implementation refinement.
Continuous endpoint identities, analytic organ-radius positivity and Fourier/noise bounds
would require a separate analytical proof or carefully scoped numerical property
tests. Keep existing byte-level round-trip/corruption checks independent of the
abstract codec identity premise.
