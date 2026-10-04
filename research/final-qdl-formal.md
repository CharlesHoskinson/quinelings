# Final experimental QDL: expressive grammar and honest contracts

Read current JSON schema, `qdl.js`, Lean Design/Geometry/Rhythm/ClosedSurface, and the motion, geometry, lifeform and graphics reviews. The central extension is now **arbitrary thought intake → validated executable meaning → a newly generated body**, not a fixed ten-skin selector. No language version freeze is proposed. QDL should remain a small declarative design language alongside a typed task language; a natural-language model proposes these declarations, while validators and the interpreter determine what actually executes.

## 1. The thought-to-program boundary

Accept arbitrary natural-language text, but return one of `supported`, `needs-clarification`, `partial`, or `unsupported`. Do not pretend arbitrary human goals have a translation into today's finite DAG kernels. A successful natural-language parse is a proposal, not proof of equivalence to the person's intent.

Introduce a typed ThoughtIR with explicit goal, typed input bindings, named capability applications, dependencies, constraints, desired outputs, and effect requirements. Keep the original text and user-facing interpretation outside canonical executable meaning unless deliberately included as inert metadata. Missing resources, unresolved references, and unsupported capabilities must be represented; never replace them with fabricated literal observations. Partial plans expose which goal fragments are executable and which remain unmet. An unresolved plan must not automatically execute a deceptively complete task.

Example meaning: `weightedMean(readings: Vec<Float>, weights: Vec<NonnegativeFloat>) -> Float`, followed by `compare(score, threshold)->Bool`, `evidence(records)->EvidenceState`, and a guarded `simulateAction(permission ∧ supportedEvidence ∧ fault, repairPayload)->Receipt`. Ordinary dataflow dependencies are distinct from effect control. The current eager `choose` does not protect effects; every effect node needs its own guard. A thought such as "make everyone happier" needs clarification or an explicitly declared proxy/capability; it cannot become a fabricated confidence number.

Capability registry entries declare stable operation ID, typed ordered arguments/result, preconditions, determinism, effect kind, required authority, resource cost/limits, implementation identity, and failure outcomes. Use pure and simulated capabilities first. Future real-world adapters require separate user authority and receipt semantics; QDL appearance cannot grant them. Extensions add independently tested capability entries, rather than unrestricted arbitrary JS in a program. Resource limits remain explicit (current 64 graph nodes, 512-value arrays, 1–8 task cycles); richer loops/recursion need their own executable semantics before visual rings imply support.

Compile only well-typed complete supported ThoughtIR into the bounded graph AST. Verify argument/port order, known capability IDs, DAG dependencies, selected output types, guards, and resource bounds. IR→AST correspondence is provable for specified capabilities, independently of whether the NLP proposal captured the user's meaning. The present graph runtime checks numerical/input types during evaluation; a stronger static capability elaborator is a proposed extension, not already implemented. Canonical source contains the lowered task and authored design. Quotation constructs the program's own canonical source; it does not prove the original natural language was understood.

## 2. Generative bodies, not ten mandatory families

Compile validated graph plus an explicit generator declaration into a bounded material assembly. Retain the ten families as presets/reference specimens, while permitting generated compositions of a tiny closed grammar:

    Body ::= Chamber | Tube | Ribbon | Branch | Loop | Cap
    Assembly ::= one rooted connected tree of Body nodes
    Pose ::= material rest coordinates + shared deformation

Proposed initial ceiling: 16 body parts, attachment depth ≤4, branch fanout ≤4, at most 3 dominant masses and 6 luminous crests. These are design/resource limits, not guarantees of beauty. `Loop` requires a regular circular spine and complete frame/material seam contract. A `Cap` handles a true pole rather than asserting an immersion through a zero-width ribbon chart. Every generated part has a deterministic stable ID and material coordinate domain. Distinguish these decorative assembly links from actual task-graph dependencies.

Source carries `{generator:"graph-body", seed:<uint32>, gesture:<...>}` plus bounded authored posture/material controls; expanded assembly is deterministic generated presentation unless consciously promoted into source. Seed changes morphology, never results. Use canonical graph-derived statistics and stable node IDs to generate anatomy; never `Math.random`, fetch order, current clock, or machine-specific hash state. Source + generator implementation identity + material coordinates + requested phase determines geometry/ownership. Exact cross-platform pixel equality is not guaranteed by JS transcendental arithmetic. For archival deterministic semantics, record the compiler/generator identity or bake its finite material recipe; the experimental marker `qdl:1` alone cannot promise unchanged output after generator revisions.

Preserve a transparent mapping: every executable node has a stable inspectable organ/territory, every dependency retains exact endpoint and ordered-port attribution, and generated coarse structures explain which statistics selected them. Geometry may be many-to-one; recoverable genomes remain exact source encodings. No generated body part invents a new operation, effect, or trace occurrence.

## 3. Minimal gesture vocabulary

One optional authored gesture record is sufficient initially:

    motion.gesture = {
      kind: gather | unfurl | glide | hover,
      strength: finite number in [0,1],
      ticks: [prepare,stroke,recover,rest]
    }

Four integer ticks each ≥100, sum exactly 1000. This avoids normalized floating-point duration-sum ambiguity. Compiler-fixed family/generated-body pose templates define endpoints; interpolate each segment with H(z)=6z⁵−15z⁴+10z³. Strength scales template amplitudes. Template bounds: log longitudinal scale σ∈[−0.15,0.15], lean α∈[−0.12,0.12], opening o∈[−0.12,0.12]. The fifth endpoint equals the first; H′ and H″ vanish at both local endpoints, so piecewise interpolation has a C² temporal seam even with unequal segment durations. No claim of C³ continuity or physical energy optimality. A rest segment has equal endpoints.

No free user coordinate arrays, arbitrary expressions, new personality sliders or per-species records. The shared deformation is compiler semantics: D=R diag(exp(−σ/2),exp(σ),exp(−σ/2)) plus bounded/root-appropriate translation; determinant is one and scale positive. Membranes, organs, crests and pinned dependencies use the same material map. This determinant statement does not extend automatically to independent local wave offsets.

Periodic mode uses integer temporal harmonics and closed scores. Quasiperiodic mode has bounded irrational secondary phases and must not advertise exact replay after one fundamental cycle. All closed spatial modes use integer winding. Editing gesture changes canonical source; current phase, pause, rendering quality and trace replay do not.

## 4. What belongs where

**Authored QDL:** generator/seed or deliberate material recipe, coarse gesture/cadence/strength, intended body topology and material controls, existing composition, semantic chroma/lens bindings. A fixed optional follower `motion.follow: "soft"` may express tissue character; its detailed coefficients should start as closed compiler presets. Presets use damping ζ∈[0.75,1.5], fundamental ω/ω₀∈[0.15,0.8], Σ|Aⱼ|≤0.12. The gain ≤1 proof requires ζ≥1/√2 and a finite **raw-phase** harmonic driver. Applying the same response to phase-warped sin(φ+a sinφ) is not the exact claimed ODE solution. Either provide the raw harmonic representation or label the effect artistic and omit that physical guarantee.

**Compiler geometry policy:** shared deformation convention, frame construction/seam correction, low-mode statistic definitions and derivative budgets, primitive regularity validation. Use ≤3 low modes with Σ|aⱼ|sup||Pⱼ′||≤η₀/4 when base speed ≥η₀; then perturbed speed ≥3η₀/4. This is conditional on a proved/validated primitive contract. Seed/filament's current square-root endpoint envelope lacks bounded endpoint derivatives; it cannot meet this condition without reparameterization/caps. Global non-self-intersection requires more than local derivative bounds.

**Renderer policy:** pixel tolerance, depth buckets, DPR, sprite kernels, adaptive mesh construction, CPU/GPU choice, transport numerical epsilon, lighting derivative grid, quadrature weights. Do not add optional transport/curvature flags merely because algorithms are changing: every generated continuous body should use the appropriate safe compiler/render policy. Sampling budget stays bounded; use the existing ≤24000 tissue samples and an explicit ≤1806 total crest vertices until a justified change. At resource exhaustion state that desired error tolerance was not achieved. Changing sample count must not rewrite QDL or change material owner IDs.

**Presentation state:** current phase, paused/still mode, lens selection, trace/run occurrence, source-match status, picking, view scale. Replay/idle gestures never dispatch tasks. Recorded values retain units/domain/missing/invalid/stale states. Semantic role color, scalar color and lossless RGB-source records remain distinct.

## 5. Formal work that earns its place

Lean priorities:

1. Gesture validation: exact integer duration partition; quintic bounds, derivatives and endpoint jets; convex interval preservation; piecewise C² closed assembly under positive durations and matching poses.
2. Shared deformation: positivity/inverse/determinant for the restricted transform; attachments and material owner identity commute with deformation. Do not claim arbitrary folded sheets are injective.
3. Capability typing and elaboration: registry signature matching, guard presence, executable resource bounds, IR→AST result/effect correspondence for each supported primitive.
4. Generative assembly: finite rooted grammar, stable IDs, total ownership, actual graph endpoint preservation; regularity and seam hypotheses are explicit obligations, not hidden assumptions.
5. Passive gain/denominator only for the declared raw harmonic driver. Curvature/chord error only with justified derivative bounds; complete surface position/normal/seam theorems remain separate from current scalar seam lemmas.

Quint priorities: operational transitions between draft/clarification/validated/compiled/run/reproduced; rendering and replay preserve source/execution count; unsupported/partial plans do not admit full execution; stale trace cannot masquerade as current output; capability authority gates; budgets and reproduction admission. Bounded model checking does not prove NLP correctness or continuous geometry.

JS correspondence: validators reject nonfinite values, unknown fields, noninteger ticks and incorrect sums; bindings use own properties only; identical source/phase yields deterministic generated recipe and material owners; tests compare compiler fixtures to exact formal data models where available. Numerical derivative checks and image metrics are empirical tests, not proofs of floating-point refinement. Every new grammar tag needs schema/JS/Lean/fixture agreement. Existing Lean validity and material bounds do not yet cover this proposed grammar.

## 6. Kernel experiment and qualitative gate

`final-qdl-formal-gesture.lean` is a standalone research file importing installed Mathlib. It proves H∈[0,1], the first/second derivative formulas, zero endpoint derivatives, nonnegative interpolation velocity and interval preservation of convex gesture blends. It is only a local interpolation prototype; it does not establish complete piecewise-loop C², JS refinement or new language acceptance. Lean 4.34.1 kernel-check succeeded with exit code 0. The printed axiom dependencies contain only standard `propext`, `Classical.choice` and `Quot.sound`, with no `sorryAx`; compiler output is recorded alongside it. No new project axioms or `sorry` are permitted in the accepted experiment.

Beauty is a separate acceptance gate: inspect thumbnail/still/full-cycle films in pearl and semantic color; three dominant masses or fewer; clearly attached roots, quiet negative space and one signature gesture; torus holes/coral gaps remain readable; programs generated from materially different graphs produce meaningfully different bodies; seed-only changes offer bounded variety without obscuring semantic anatomy. Visual reviewers must reject safe but tangled specimens. Never turn silhouette metrics into a theorem that a creature is beautiful.

Suggested implementation order: typed intake statuses and capability elaboration; deterministic graph-body compiler with three primitives and a visible provenance inspector; shared transform and gesture score; stable sampling/material pass; then soft follow and additional primitives. Demonstrate a newly entered supported task generating a new validated graph and body, plus an ambiguous/unsupported thought handled honestly, before claiming arbitrary-thought programmability.
