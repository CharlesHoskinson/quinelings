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

The following grammar fixes the top-level vocabulary; nested records have the exact fields illustrated in the complete default expression, except that `motion.rhythm` and the top-level `chroma` record may be omitted by existing designs. JSON supplies string/number/array lexical rules.

```ebnf
Design = '{', Marker, ',', Family, ',', Organ, ',', Filament, ',',
         Motion, ',', Ink, ',', Surface, ',', Light, ',', Composition,
         [ ',', Chroma ], '}' ;
Marker = '"qdl":1' ; (* prototype marker *)
Family = '"family":', ('"filament"' | '"jelly"' | '"moth"' | '"coral"' |
         '"ribbon"' | '"nautilus"' | '"seed"' | '"torus"' | '"comet"' | '"bloom"') ;
Organ.model = '"rosette"' ;
Filament.model = '"pinned-sine"' ;
Motion.clock = '"separate"' ;
Motion.reducedMotion = '"freeze"' ;
Motion.rhythm.model = '"coupled-harmonic"' ; (* optional rhythm record *)
Motion.rhythm.mode = '"periodic"' | '"quasiperiodic"' ;
Surface.model = '"folded-ribbon"' ;
Light.model = '"density-crest"' ;
Chroma.model = '"material-territories"' ; (* optional chroma record *)
Chroma.palette = '"roles-1"' ;
Chroma.lens.kind = '"scalar"' ; (* optional lens record *)
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
if motion.rhythm is present, every rhythm field is required:
  model = coupled-harmonic; mode ∈ {periodic, quasiperiodic}
  0.25 ≤ rate ≤ 2; 0 ≤ breath,wave ≤ 0.18
  0 ≤ waveNumber ≤ 4; 0 ≤ lag ≤ 2
  0 ≤ asymmetry ≤ 0.8; 0 ≤ overtone ≤ 0.35
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

## Authored chromamapping

`chroma` binds persistent membrane color to declared program information. It is optional: omission retains neutral legacy material and validation never inserts a record. New `create(family)` designs contain `{model:"material-territories", palette:"roles-1", strength:0.85}`. `strength` is finite in `[0,1]`, mixing semantic color with the existing neutral material. Model and palette tags are fixed; arbitrary colors, shaders, expressions, and species hue rotations are not part of this record.

An optional scalar lens adds a second, explicitly named reading. This valid fragment illustrates a graph containing node `budget` whose recorded output has a numeric `remaining` property:

```json
"chroma": {
  "model": "material-territories",
  "palette": "roles-1",
  "strength": 0.85,
  "lens": {
    "kind": "scalar",
    "id": "remaining-budget",
    "label": "Remaining budget",
    "unit": "credits",
    "domain": [0, 100],
    "threshold": 20,
    "bindings": [{"node": "budget", "path": ["remaining"]}]
  }
}
```

All shown fields are required except `lens` and its `threshold`. Every nested record rejects unknown fields. Lens IDs and binding node IDs have 1–64 Unicode code points; labels have 1–80, and units 0–24. A domain contains two finite numbers `lo < hi` whose difference is also finite. An optional threshold must be finite and inside the inclusive domain; it is a legend reference, not an executable guard. Domains do not adapt to the current trace or visible nodes.

A lens has 1–64 bindings with unique node IDs. Each path has 0–8 segments. A segment is either a string of 1–64 Unicode code points or an integer index in `[0,511]`; `__proto__`, `constructor`, and `prototype` are forbidden keys. An empty path selects the complete node output. Runtime lookup traverses own properties only and accepts a finite number without coercion: zero is valid; `false`, `null`, strings, missing properties, and nonnumeric values are not numbers for this lens. All bindings share the declared quantity, unit, and scale.

`validate(d)` checks the closed design vocabulary and numeric relationships without mutating `d`. `validateBindings(d, graph)` additionally requires every binding to name a node in the task graph. Kernel output types are checked when reading the trace, rather than inferred from the design. `forProgram(item)` creates the family's design, replaces its chroma record with an independent copy of `item.skin.chroma` when present, and validates it; the core validates graph bindings during compilation, execution, and description.

Membrane territories have deterministic owners in material coordinates `(u,v,k)`. Their role colors stay attached while the authored periodic or quasiperiodic motion deforms the surface. Dependency levels order longitudinal bands and stable node IDs order peer lanes. Bound nodes receive extra territory weight for visibility. This is a categorical ownership map: neighboring scalar measurements are not averaged into an unrecorded value. Closed-family seams meet inside the same territory. Material compression and depth continue to determine opacity; colored tissue and colored crests with narrow pearl cores retain the fold hierarchy.

The `roles-1` dictionary has exactly six groups: `input` (cyan), `process` (blue, including arithmetic, transforms, and planning), `decision` (amber, labeled Judgment & evidence and including consensus/evidence), `quote` (violet, labeled Quote & reconstruction), `action` (coral), and `report` (green). It is separate from the exact opcode palette: organ markers, frequencies, and labels still identify individual operations. The exact RGB byte genome is a third, independent color representation.

Selecting the scalar lens recolors bound territories from one recorded task occurrence; unbound territories retain their role hues at reduced saturation. A fixed violet-to-pale-gold scale maps the authored domain, with explicit status labels for below-domain and above-domain values. Endpoint clipping never changes the displayed original number. Missing execution is `not-evaluated`; an incompatible path or value is `invalid`; a result belonging to an earlier source is `stale`. Missing or invalid measurements receive interrupted hatching as well as text; unavailable states are never reinterpreted as zero, false, or unknown evidence. The current implementation has one scalar lens; it does not reduce evidence conflict to a number or claim to visualize general causal provenance.

The gallery offers **Program roles**, the authored named recorded-value lens, and **Pearl study**. Pearl study is a neutral presentation view; it does not remove the authored chroma record. The recorded task selector identifies the run and selected cycle. The scale shows the fixed domain and optional reference threshold alongside the original number and status. Lanternkeeper authors its fault-score lens in `skin.chroma`, which `forProgram` includes in its source.

The caller associates the recorded task with the exact current source and selects a single repeat occurrence before resolving bindings. Any source edit invalidates that association. Selecting a lens, rendering, pausing, or replaying cannot run a task or dispatch effects. The lens declaration is source; active lens, trace selection, and current values are presentation/runtime state. All authored chroma fields survive source reproduction and both genome codecs. Designs that omit chroma retain that omission across the same operations.

## Authored rhythms

`motion.rhythm` declares a creature's movement in its canonical source. It is optional so previously encoded designs still validate and reproduce byte for byte. Validation never fills missing fields. An omitted record uses the renderer's fallback rhythm; this preserves source identity, not an archived rendering of the earlier renderer. New `create(family)` designs contain the complete record. Each family has a distinct preset; coral and bloom use quasiperiodic secondary movement.

```json
"rhythm": {
  "model": "coupled-harmonic",
  "mode": "periodic",
  "rate": 1,
  "breath": 0.06,
  "wave": 0.055,
  "waveNumber": 1.6,
  "lag": 0.9,
  "asymmetry": 0.28,
  "overtone": 0.17
}
```

| Control | Meaning |
| --- | --- |
| `rate` | Rhythm speed relative to the shared presentation phase |
| `breath` | Coherent expansion/contraction amplitude |
| `wave` | Tissue bending and secondary gesture amplitude |
| `waveNumber` | Spatial wave count; rounded on closed backbones to preserve seams |
| `lag` | Phase delay between leading tissue and trailing tissue |
| `asymmetry` | Faster active stroke and slower recovery through a monotone phase warp |
| `overtone` | Bounded weight of an additional harmonic |
| `mode` | Integer temporal harmonics or an irrational secondary frequency |

For presentation phase `t`, let `r` be the rhythm and define:

```text
φ = r.rate · t
θ = φ + r.asymmetry · sinφ
pulse = sinθ
χ = 3φ                         when mode = periodic
χ = √2 φ                       when mode = quasiperiodic
secondary = (sin(2θ − r.lag) + r.overtone·sinχ)/(1+r.overtone)
```

The phase warp never reverses: `dθ/dφ = 1 + asymmetry·cosφ ≥ 0.2`. Its nonuniform speed gives a stroke and recovery without piecewise discontinuities. Both `pulse` and `secondary` stay in `[−1,1]`. A shared lateral scale `S = 1 + breath·pulse` lies in `[0.82,1.18]`; longitudinal scale `1/√S` opposes the expansion. This suggests compliant tissue; it is not a claim of a complete volume-preserving or biomechanical simulation.

A traveling component at longitudinal position `u` and ribbon angle `a` is:

```text
w = waveNumber                  on open backbones
w = round(waveNumber)           on closed backbones
T = (sin(θ−2πwu−lag(1−cos a))
     + overtone·sin(2θ−2πwu−lag−a))/(1+overtone)
```

Again `|T| ≤ 1`. Family formulas multiply the wave by bounded tissue envelopes: coral bends increasingly toward its tips, jelly and comet threads trail their head, moth wings share a stroke, and a logarithmic nautilus expands along its shell. The seed uses golden-angle strand placement, while the torus carries a `(1,3)` toroidal winding. These are explicit presentation formulas, not new interpreter operations.

All periodic temporal terms use integer harmonics of the raw or shared warped phase, so the nominal loop in input phase is `2π/rate`. In quasiperiodic mode the additional `√2` frequency generally prevents a common finite period when its weight and displacement are nonzero. It remains deterministic and bounded; zero amplitudes can remove the nonperiodic contribution. No accumulated velocity, random walk, numerical integrator, or hidden oscillator state is needed. The same source and phase reproduce the same frame.

`phaseRate` still controls the clock and can be zero; `rhythm.rate` controls the geometry's response to that clock. In seconds, a periodic cycle lasts `2π/(24·phaseRate·rhythm.rate)` when both rates are positive. Pause and reduced motion freeze the input phase before any of these formulas are evaluated. None of the rhythm controls dispatches effects or advances program execution.

The gallery’s **Shape the motion** controls expose the mode, breathing, traveling wave, and follow-through (`lag`). Committing a control change encodes the edited rhythm in the creature’s source and both genomes. **Reset species motion** restores its authored family preset. These edits change source identity while preserving task semantics.

## Mapping equations

For operation node n, let `t` be the raw presentation phase, `φ = motionState(t).phase` its shared warped phase, and `α` the organ outline angle. The anchor consumes raw `t` and applies the rhythm internally. Let f be its stable opcode frequency, degree the sum of incoming/outgoing counts, and v a bounded literal-magnitude summary. Define:

```text
R = min(0.16, baseRadius + degreeGain·degree + literalGain·v)
r(α,φ) = R(1 + a cos(fα) + b cos((outdegree+1)α + φ))
Organ = anchor(n,t) + r(α,φ)(cosα,sinα)
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

For membrane coordinates `u ∈ [0,1]`, `v ∈ [−1,1]`, ribbon index `k`, and `N` ribbons, the implementation uses the raw presentation phase `t` for the family spine and the shared warped phase `φ = motionState(t).phase` for the membrane. Define `closed` for moth, torus, and bloom. The following choices keep their position, thickness, tangent, and lighting continuous across the longitudinal seam:

```text
N = min(36, ribbons + min(6, graphBranches))
a = 2πk/N
C = project(strandPoint(family,u,k,N,t,graph))
n = unit normal to the finite-difference tangent of C (ε = 0.003)
    (longitudinal samples wrap on closed backbones; clamp on open ones)
g = sin(2πu) when closed; u otherwise
h = 1 when closed; sin(πu) otherwise
ψ = φ − (phaseLag + rhythm.lag)·g + 0.13 sin(a)
F = exp(−2sin²(π(u−focus))) when closed; exp(−((u−focus)/0.3)²) otherwise
E = (0.75+0.25cos(2π(u−focus)))^taper when closed
    max(0.025,sin(πu))^taper otherwise
W = spread·E·(0.55+0.75F)·(1+asymmetry·sin(a+0.6))
    ·(1+0.055(sinψ+0.35sin(2ψ+0.7)))
β = 0.35a + twist·(sin(2πu) when closed; 2π(u−0.5) otherwise)
    + 0.48sinψ + 0.24sin(2ψ+0.4a+πv) + 0.18rhythm.overtone·secondary
m = min(9,folds+floor(graphDepth/5))
L = vW cosβ + 0.10W sin(2πmu−ψ+a)h
δ = 4Cx for jelly; 2πu otherwise
Ez = 0 for jelly rim (k=0); sin(πu) for other jelly ribbons; E otherwise
z = 0.45depth·sin(δ−φ) + vW sinβ
    + 0.14depth·sin(2πmu−ψ+a)Ez
Praw = (Cx + nxL + 0.07asymmetry·hF, Cy + nyL, z)
```

The jelly gives ribbon `k=0` an explicit lip: before the shared living pose, `x = 0.43(2u−1)(1−2·breath·pulse)` and `y = −0.06`. Bell layers arc above it; trailing threads begin at that same lip height. Their shared depth field depends on projected centerline `Cx`, while the additional depth ripple vanishes on the rim and at thread roots. This keeps the bell and appendages visually attached through the stroke.

`pose` rotates this surface by yaw and pitch, then shears its projected x coordinate by `lean·y`. The same transform applies to organ anchors. It projects depth into spatial overlap rather than introducing a second decorative particle cloud.

Material opacity depends on transverse projected compression. Let `βv = 0.24π cos(2ψ+0.4a+πv)`, `Lv = W(cosβ−v sinβ·βv)`, and `zv = W(sinβ+v cosβ·βv)`. Apply the same pose transform to the derivative `(nxLv,nyLv,zv)` and call its screen components `Jx,Jy`:

```text
compression = clamp(1 − hypot(Jx,Jy)/max(0.01,1.4W),0,1)
zDepth = clamp(0.5 + projectedDepth/(2(depth+spread)),0,1)
α = recessAlpha + (crestAlpha−recessAlpha)·compression^0.9
    ·(0.28+0.72F)·(1−depthContrast+depthContrast·zDepth)
```

This is a bounded density-inspired material, not a physical light-transport simulation. Because all factors lie in `[0,1]`, point opacity stays between `recessAlpha` and `crestAlpha`. The screen derivative measures narrowing transverse to a ribbon; it is not a full surface Jacobian. Distinct folds therefore gain brightness without making every boundary equally luminous.

`surfaceFrame` samples four transverse columns and a bounded longitudinal grid with stable offsets; thumbnails cap the point budget at 4,200. It draws `crests` continuous interior tracks from the same surface. Their transverse coordinate is `v = 0.92cos(φ−phaseLag·g+a/2)`, with 301 samples per track. These are designed material tracks, not numerically traced compression maxima. Points and tracks share the membrane's position and compression-derived opacity. The per-frame point budget does not include these separately bounded crest vertices or graph inspection paths.

`portraitFrame` estimates a fixed envelope over sixteen samples of the primary rhythm cycle, includes organ radii, and adds padding based on rhythm amplitudes. This padding is a practical allowance for unsampled extrema and secondary phases, not a proved analytic bound. `occupancy` determines how much of the canvas that envelope occupies. It avoids scale pumping during animation, but remains a sampled framing estimate rather than an analytic bound over every phase. There is no separate QDL framing record.

## Dynamic model

The morphology renderer separates the folded membrane, exact graph-derived anatomy, and temporary emphasis from a recorded execution trace. The organ radius remains the exact QDL radial equation at rest and during selection; default filament bend and frequency gain are `0.04` and `0.07`. All membrane, material, and composition controls are embedded in canonical program source. Changing any of them changes source identity even when task results stay the same.

One elapsed-time presentation clock drives both viewers. `phaseRate` retains its nominal 24-frame-per-second interpretation: `Δphase = phaseRate × 24 × Δseconds`. Elapsed increments are capped at 100 ms and tab visibility changes reset the timestamp, avoiding a jump on resume. Pause and dynamic reduced-motion preferences freeze the shared phase. Neither phase advancement nor selection executes a task or changes source. Invisible canvases skip redraws; frozen views redraw when inspection changes.

Replay markers refer to the recorded trace node and travel along its incoming dependencies. Selecting another organ changes inspection without changing that recorded identity. Family motion uses the authored bounded harmonic or quasiperiodic formulas above; no strange-attractor simulation is claimed. `verify-morphology.cjs` checks purity, endpoint attachment, loop closure, and clock-rate independence. `verify-motion.py` checks the browser's shared pause, reduced motion, hit testing, and trace attribution.

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

The model uses a finite graph and source tokens. The profile includes integer ribbon/fold/crest/sample controls and milliscale samples of every bounded numeric organ, filament, motion, ink, membrane, material, and composition control. Model tags and the neutral color syntax are fixed assumptions rather than independently explored string domains. The profile also includes rhythm mode/presence and milliscale samples of every rhythm number. Mode zero represents omission; bounded numeric placeholders are dormant in that abstraction. Changed family, spread, material, and rhythm candidates are rejected by full profile equality. Negative controls mutate effects during replay and mutate family, material, composition, or rhythm during rendering; each must violate safety. Integer lower bounds encode the noncollapsing breathing scale, monotone phase warp, and positive harmonic normalization denominator, assuming trigonometric values lie in `[−1,1]`. They do not prove the floating-point renderer.

The chroma extension adds full profile/source matching for recorded evidence, changed-chroma admission rejection, and unsafe stale-display negative controls to the finite model. Lean carries the complete optional chroma/lens/path declaration and proves source/declaration/trace association, unavailability of failed, nonnumeric, or stale evidence, preservation of zero, bounded monotone clamped normalization over exact rational domains, view/runtime separation, and evidence invalidation on reauthoring. These statements do not prove JavaScript path extraction, trace construction, IEEE floating-point arithmetic, or the color renderer.

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
