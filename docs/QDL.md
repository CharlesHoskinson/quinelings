# Quineling Design Language (QDL), version 1

QDL is a finite declarative language for mapping an executable program to an animated body. Its concrete syntax is JSON with a closed vocabulary and bounded numbers. `qdl.js` is its validator and interpreter; `design/default.qdl.json` is a complete expression. The finite transition model is written in Quint at `spec/design.qnt`.

## Why these characteristics

The language needs to be predictable enough for an agent to generate valid creatures, expressive enough to yield distinct silhouettes, and inspectable enough for a person to understand the program. For version 1, determinism, source fidelity, state separation, and bounded evaluation are more useful than arbitrary shader code or unrestricted geometric recursion.

1. **A small, typed vocabulary.** Families, organ models, filament models, and clocks are enumerations. Unknown fields and primitives are errors. Agents cannot insert host JavaScript.
2. **Compositional anatomy.** Nodes become organs, ordered edges become endpoint-pinned filaments, and quote/repeat annotations remain explicit. Graph crossings and visual proximity add no behavior.
3. **Bounded parameters.** Radial amplitudes keep organs positive; density levels stay ordered; motion and scale have finite limits. Budgets bound execution and lineage admission independently.
4. **Exact identity beneath a flexible view.** Canonical source includes the full QDL expression. Morphology can be a projection, while all source and design parameters survive both genomes and source reproduction.
5. **Independent state spaces.** Animation phase, selection, and replay position never dispatch effects or advance the interpreter. A still frame remains a valid view.
6. **Redundant semantic cues.** Hue gives operation role; exact palette/glyph/label identifies the opcode. The separately indexed RGB byte strand preserves source. Decorative accents never authorize actions.
7. **Explicit errors and counterexamples.** Invalid QDL, typed graph failures, exhausted bounds, corrupt genomes, and failed quine identity are observable outcomes. Unsafe replay is an intentional negative-control model transition.

## Syntax

The following grammar fixes the top-level vocabulary; nested records have the exact fields illustrated in the complete default expression. JSON supplies string/number/array lexical rules.

```ebnf
Design = '{', Version, ',', Family, ',', Organ, ',', Filament, ',',
         Motion, ',', Ink, ',', Framing, '}' ;
Version = '"qdl":1' ;
Family = '"family":', ('"filament"' | '"jelly"' | '"moth"' | '"coral"' |
         '"ribbon"' | '"nautilus"' | '"seed"' | '"torus"' | '"comet"' | '"bloom"') ;
Organ.model = '"rosette"' ;
Filament.model = '"pinned-sine"' ;
Motion.clock = '"separate"' ;
Motion.reducedMotion = '"freeze"' ;
```

Object order is not significant; the displayed order is conventional. Required keys, primitive types, and independent numeric bounds are specified in `design/qdl.schema.json`. The executable validator additionally checks cross-field relationships.

## Static judgments

Write `valid(D)` for successful QDL validation. It requires:

```text
D.qdl = 1
D.family ∈ Families
0.01 ≤ baseRadius ≤ 0.08
0 ≤ degreeGain ≤ 0.006; 0 ≤ literalGain ≤ 0.003
0 ≤ a,b ≤ 0.45; a+b < 1
0 ≤ bend ≤ 0.08; 0 ≤ frequencyGain ≤ 0.2; 0 ≤ ripple ≤ 0.3
0 ≤ phaseRate ≤ 0.05
0 ≤ ghostAlpha < secondaryAlpha < ridgeAlpha ≤ 1
0.25 ≤ scale ≤ 0.47; 0.08 ≤ padding ≤ 0.25
clock = separate; reducedMotion = freeze
```

A program task graph must also satisfy the independent kernel judgment `validGraph(G)`: unique node IDs, known operations, correct arities, explicit dependency endpoints, finite acyclic ordering, finite JSON values, and source/node/value bounds. Operation input types are checked when each node evaluates. QDL does not make an ill-typed program valid.

Compilation `compile(G,D)` copies G and attaches the full validated D as `graph.design` inside the quoted task. The constructor quine therefore reconstructs the design annotation too. A design edit changes canonical source identity but leaves task results unchanged when executable fields are unchanged.

## Mapping equations

For operation node n, let f be its stable opcode frequency, degree the sum of incoming/outgoing counts, and v a bounded literal-magnitude summary. Define:

```text
R = min(0.16, baseRadius + degreeGain·degree + literalGain·v)
r(θ,φ) = R(1 + a cos(fθ) + b cos((outdegree+1)θ + φ))
Organ = anchor(n,φ) + r(θ,φ)(cosθ,sinθ)
```

In real arithmetic, `r ≥ R(1−a−b) > 0`, so this radial organ does not collapse. This is the mathematical design argument; numerical sampling and the bounded integer abstraction are checked separately.

For edge endpoints A and B, a normal N, frequency f, and u ∈ [0,1]:

```text
C(u,φ) = (1−u)A + uB + N·bend(1+frequencyGain·f)
         ·sin(πu)·(1+ripple·sin(2πfu+φ))
```

In real arithmetic, `C(0)=A` and `C(1)=B`. Implementation checks allow floating-point tolerance at the endpoint. Whole-family body formulas remain bounded presentation functions in the renderer; the low-frequency silhouette is not claimed to encode every source distinction. The exact genome is the lossless representation.

## Dynamic model

The Quint state includes source identity, display phase/pause, execution and repeat counters, effects, emitted identity, child identity, and resource budgets. Transitions are `render`, `replay`, `pause`, guarded `execute`, identity-checked `admit`, and `reject`.

Safety requires:

```text
view transitions preserve execution/effects/children
new effects occur only during execute and require guard ∧ permission
executions ≤ repeat budget; children ≤ population budget
remaining resource + execution cost + admission cost = initial resource
admitted child source = emitted source = parent source
operation colors preserve opcode identity
filament endpoints preserve declared incidence
```

The model uses a finite graph and source tokens. Numeric codec recovery is represented by an explicit identity abstraction; it is not proved by that abstraction. The model is not a verified refinement of every renderer/kernel instruction. Source-byte/color/sample checks and all library fixtures exercise the actual JavaScript implementation.

Randomized bounded Quint simulations are counterexample searches, not exhaustive model checking or a theorem. An intentionally unsafe replay transition changes effects and is detected by the same invariants.

## Reproduce checks

```sh
node verify-design.cjs
quint typecheck spec/design.qnt
quint test spec/design.qnt --max-samples=100 --backend=typescript
quint run spec/design.qnt --invariant=safety --max-samples=1000 --max-steps=50 --seed=20261003 --backend=typescript
```

Quint was chosen because behavior evolves through transitions, asynchronous-style boundaries, replay, and reproduction. Lean would be appropriate for later general analytic proofs about codec inversion and continuous geometry. Neither formal method establishes visual beauty; the reference breakdown and human inspection remain part of design acceptance.

Official language and property-checking documentation: https://quint.sh/docs/ .
