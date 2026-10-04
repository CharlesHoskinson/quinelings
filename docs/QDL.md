# Quineling Design Language (QDL), experimental

QDL is a finite declarative language for mapping an executable program to an animated body. Its concrete syntax is JSON with a closed vocabulary and bounded numbers. `qdl.js` is its validator and interpreter; `design/default.qdl.json` is a complete expression. The finite transition model is written in Quint at `spec/design.qnt`.

The language is experimental and changes directly as the visual model develops. `qdl:1` is a prototype format marker, not a frozen version-one contract. There is no compatibility or migration promise yet. Once the language is stable, version one and an upgrade path can be fixed.

## Why these characteristics

The language needs to be predictable enough for an agent to generate valid creatures, expressive enough to yield distinct silhouettes, and inspectable enough for a person to understand the program. During exploration, determinism, source fidelity, state separation, and bounded evaluation are more useful than arbitrary shader code or unrestricted geometric recursion.

1. **A small, typed vocabulary.** Families, organ models, filament models, and clocks are enumerations. Unknown fields and primitives are errors. Agents cannot insert host JavaScript.
2. **Compositional anatomy.** Nodes become organs, ordered edges become endpoint-pinned filaments, and quote/repeat annotations remain explicit. Graph crossings and visual proximity add no behavior.
3. **Bounded parameters.** Radial amplitudes keep organs positive; density levels stay ordered; motion, membrane, material, and composition have finite limits. Budgets bound execution and lineage admission independently.
4. **Exact identity beneath a flexible view.** Canonical source includes the full QDL expression. Morphology can be a projection, while all source and design parameters survive both genomes and source reproduction.
5. **Independent state spaces.** Animation phase, selection, and replay position never dispatch effects or advance the interpreter. A still frame remains a valid view.
6. **Redundant semantic cues.** Hue gives operation role; exact palette/glyph/label identifies the opcode. The separately indexed RGB byte strand preserves source. Decorative accents never authorize actions.
7. **Explicit errors and counterexamples.** Invalid QDL, typed graph failures, exhausted bounds, corrupt genomes, and failed quine identity are observable outcomes. Unsafe replay is an intentional negative-control model transition.

## Syntax

The following grammar fixes the top-level vocabulary; nested records have the exact fields illustrated in the complete default expression. JSON supplies string/number/array lexical rules.

```ebnf
Design = '{', Marker, ',', Family, ',', Organ, ',', Filament, ',',
         Motion, ',', Ink, ',', Surface, ',', Light, ',', Composition, '}' ;
Marker = '"qdl":1' ; (* prototype marker *)
Family = '"family":', ('"filament"' | '"jelly"' | '"moth"' | '"coral"' |
         '"ribbon"' | '"nautilus"' | '"seed"' | '"torus"' | '"comet"' | '"bloom"') ;
Organ.model = '"rosette"' ;
Filament.model = '"pinned-sine"' ;
Motion.clock = '"separate"' ;
Motion.reducedMotion = '"freeze"' ;
Surface.model = '"folded-ribbon"' ;
Light.model = '"density-crest"' ;
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
surface.model = folded-ribbon
ribbons ∈ integers [8,36]; crests ∈ integers [3,6]; folds ∈ integers [2,9]
0.02 ≤ spread ≤ 0.24; 0.4 ≤ taper ≤ 2.5
0 ≤ asymmetry ≤ 0.35; 0 ≤ depth ≤ 0.35
0 ≤ twist ≤ 3; 0 ≤ phaseLag ≤ 2
samples ∈ integers [4000,24000]
light.model = density-crest
0.015 ≤ recessAlpha ≤ 0.12; 0.16 ≤ crestAlpha ≤ 0.65
recessAlpha < crestAlpha; 0 ≤ depthContrast ≤ 0.8
0.6 ≤ occupancy ≤ 0.84; −0.5 ≤ lean,yaw,pitch ≤ 0.5
0.15 ≤ focus ≤ 0.8
neutral matches #[0-9a-f]{6}
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

## Folded membrane and material

The visual contract is a coherent silhouette, sparse luminous crests, translucent recesses, and one asymmetric focal region. The family supplies a longitudinal centerline; a shared two-parameter folded membrane supplies its material. Operation organs and dependency curves use anchors in the same projection. Graph depth chooses spine position, stable same-depth lanes separate peers, and branches increase membrane ribbon count. Semantic anatomy becomes stronger during inspection; it does not replace the membrane's resting silhouette.

For membrane coordinates `u ∈ [0,1]`, `v ∈ [−1,1]`, ribbon index `k`, phase `φ`, and `N` ribbons, the actual implementation is:

```text
N = min(36, ribbons + min(6, graphBranches))
a = 2πk/N
C = project(strandPoint(family,u,k,N,φ,graph))
n = unit normal to the finite-difference tangent of C (ε = 0.003)
ψ = φ − phaseLag·u + 0.13 sin(a)
F = exp(−((u−focus)/0.3)²)
E = max(0.025,sin(πu))^taper
W = spread·E·(0.55+0.75F)·(1+asymmetry·sin(a+0.6))
    ·(1+0.055(sinψ+0.35sin(2ψ+0.7)))
θ = 0.35a + twist·2π(u−0.5) + 0.62sinψ + 0.32sin(2ψ+0.4a+πv)
m = min(9,folds+floor(graphDepth/5))
L = vW cosθ + 0.10W sin(2πmu−ψ+a)sin(πu)
z = 0.45depth·sin(2πu−0.45φ) + vW sinθ
    + 0.14depth·sin(πmu−ψ+a)E
Praw = (Cx + nxL + 0.07asymmetry·sin(πu)F, Cy + nyL, z)
```

`pose` rotates this surface by yaw and pitch, then shears its projected x coordinate by `lean·y`. The same transform applies to organ anchors. It projects depth into spatial overlap rather than introducing a second decorative particle cloud.

Material opacity depends on transverse projected compression. Let `θv = 0.32π cos(2ψ+0.4a+πv)`, `Lv = W(cosθ−v sinθ·θv)`, and `zv = W(sinθ+v cosθ·θv)`. Apply the same pose transform to the derivative `(nxLv,nyLv,zv)` and call its screen components `Jx,Jy`:

```text
compression = clamp(1 − hypot(Jx,Jy)/max(0.01,1.4W),0,1)
zDepth = clamp(0.5 + projectedDepth/(2(depth+spread)),0,1)
α = recessAlpha + (crestAlpha−recessAlpha)·compression^0.9
    ·(0.28+0.72F)·(1−depthContrast+depthContrast·zDepth)
```

This is a bounded density-inspired material, not a physical light-transport simulation. Because all factors lie in `[0,1]`, point opacity stays between `recessAlpha` and `crestAlpha`. The screen derivative measures narrowing transverse to a ribbon; it is not a full surface Jacobian. Distinct folds therefore gain brightness without making every boundary equally luminous.

`surfaceFrame` samples four transverse columns and a bounded longitudinal grid with stable offsets; thumbnails cap the point budget at 4,200. It draws `crests` continuous interior tracks from the same surface. Their transverse coordinate is `v = 0.92cos(0.23φ−phaseLag·u+a/2)`, with 301 samples per track. These are designed material tracks, not numerically traced compression maxima. Points and tracks share the membrane's position and compression-derived opacity. The per-frame point budget does not include these separately bounded crest vertices or graph inspection paths.

`portraitFrame` estimates a fixed envelope over several phases and includes organ radii. `occupancy` determines how much of the canvas that envelope occupies. It avoids scale pumping during animation, but remains a sampled framing estimate rather than an analytic bound over every phase. There is no separate QDL framing record.

## Dynamic model

The morphology renderer separates the folded membrane, exact graph-derived anatomy, and temporary emphasis from a recorded execution trace. The organ radius remains the exact QDL radial equation at rest and during selection; default filament bend and frequency gain are `0.04` and `0.07`. All membrane, material, and composition controls are embedded in canonical program source. Changing any of them changes source identity even when task results stay the same.

One elapsed-time presentation clock drives both viewers. `phaseRate` retains its nominal 24-frame-per-second interpretation: `Δphase = phaseRate × 24 × Δseconds`. Elapsed increments are capped at 100 ms and tab visibility changes reset the timestamp, avoiding a jump on resume. Pause and dynamic reduced-motion preferences freeze the shared phase. Neither phase advancement nor selection executes a task or changes source. Invisible canvases skip redraws; frozen views redraw when inspection changes.

Replay markers refer to the recorded trace node and travel along its incoming dependencies. Selecting another organ changes inspection without changing that recorded identity. The present family motions are bounded harmonic presentation formulas; they are not strange-attractor simulations. `verify-morphology.cjs` checks purity, endpoint attachment, loop closure, and clock-rate independence. `verify-motion.py` checks the browser's shared pause, reduced motion, hit testing, and trace attribution.

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

The model uses a finite graph and source tokens. The profile includes integer ribbon/fold/crest/sample controls and milliscale samples of every bounded numeric organ, filament, motion, ink, membrane, material, and composition control. Model tags and the neutral color syntax are fixed assumptions rather than independently explored string domains. Changed family, spread, and material candidates are rejected by full profile equality. Negative controls mutate effects during replay and mutate family, material, or composition during rendering; each must violate safety.

Numeric codec recovery is represented by an explicit identity abstraction; it is not proved by that abstraction. The model is not a verified refinement of every renderer/kernel instruction. Source-byte/color/sample checks and all library fixtures exercise the actual JavaScript implementation.

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
