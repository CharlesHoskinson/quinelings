# Workstream 10: integrated thought-to-lifeform architecture

This consolidates the ten research workstreams into an implementable experimental architecture. Syntax and modules below are proposals until schema, runtime, browser integration and tests are implemented. The current site remains an executable ten-program gallery; manually authored novel task demonstrations and schematic assemblies establish ingredients, not the complete pipeline. `qdl:1` remains an experimental marker, not a frozen version contract.

## One pipeline with distinct artifacts

1. **ThoughtDocument**: bounded original text, clause/source-span references, supplied observations, interpreted meaning, assumptions and unmet obligations. No credentials or hidden model reasoning. Proposed text ceiling 8192 Unicode code points and total document UTF-8 ceiling 65536 bytes. Store outside the self-reproducing executable by default.
2. **IntentIR**: closed goal recipes and explicit constraints/provenance, statuses `supported`, `clarify`, `partial`, `unsupported`, `inconsistent`. The partial plan never impersonates complete goal execution. Natural language proposes meaning; formal typing does not prove understanding.
3. **TaskIR**: typed ordered capability applications, literal inputs, output types, explicit guards/effects and budget. Typed refinements include same-unit numeric comparisons, equal weighted lengths with positive finite total, bounded safe integers for allocation, optional BFS distance and acyclic schedules. Current types often remain checked at evaluation; a new static elaborator must earn stronger claims.
4. **Lowered kernel graph**: current finite eager DAG, stable node IDs, ≤64 nodes, ≤16 ordered inputs per node, ≤16 outputs, finite arrays≤512, finite JSON depth≤24, graph/value UTF-8≤65536. It has no persistent state or runtime input slots today. `choose` selects values after producers execute; actions require direct guards. Repeat count1–8 is bounded identical-task work, not an event loop.
5. **Design**: explicit bounded generated anatomy, gesture, composition/material/chroma. A finite anatomical expression is committed inside the canonical program, rather than selecting a hidden current renderer preset. The generator identity and seed make provenance clear; source carries the actual expression required for reproduction.
6. **Executable artifact**: constructor-quine AST with task plus Design in its quoted payload; exact canonical source and independently recoverable numerical genomes. Artifact envelope records source hash, compiler/registry/anatomy identities, intent-document digest and acceptance report. Envelope metadata is not automatically reproduced unless deliberately included in source. Do not claim raw ThoughtDocument recovery from a genome that only encodes executable source.
7. **RunRecord and ViewState**: run ID, canonical source hash, input-environment identity where implemented, task cycle, ordered trace/effect receipts. View holds current phase, pause, quality, selection/lens and trace replay. View changes do not dispatch tasks or rewrite source; stale records remain stale.

Proposal statuses are user-readable outcomes, not interchangeable success labels. A supported plan may be compiled; execute is a separate explicit action. An inert suggested anatomy for an unresolved thought must show its status and never fake a successful task or child admission.

## Identity, registry and source budget

Typed capability registry entries fix ID/implementation identity, ordered port/result types, preconditions/refinements, pure/simulated/external effect classification, authority requirement, budgets and lowering recipes. Add a registry entry only with implementation tests and updated formal semantics; model-generated host code is not an entry. Keep unit metadata and contracts in a deliberate validated source contract or artifact manifest: raw JSON numbers are not typed quantities merely because a label says litres. The decision to include a type/intent contract in quoted source must be explicit; companion metadata is outside the current quine's identity. Initial implementation can record validated contract digest/source map in the companion envelope while executing the fully lowered literal graph.

Generate seed from canonical **pre-anatomy** graph plus explicit bounded aesthetic preferences and generator identity, then elaborate anatomy, then construct final AST and compute final source hash. Never hash the final source to produce a seed that the same final source contains. Proposed seed is uint32; anatomy reviewer used a text seed illustration, but one fixed integer domain is sufficient. Stable material/component/node IDs use1–64 Unicode code points and deterministic semantic origins, never clock/random/fetch order.

`makeTaskProgram` duplicates its constructor body, and each copy contains the task/design graph. The genome source limit applies to the complete canonical AST, not only the graph: roughly twice the graph+Design payload plus constructor overhead. Measure exact UTF-8 source bytes before admission/encoding, and reject over65536. A32KiB payload is not universally safe because wrapper and annotations also occupy bytes. The current manually authored planter demonstration’s exact AST is4341 UTF-8 bytes; it validates that example only, not maximum-size generated assemblies. Do not raise the genome limit silently or call structural validation alone source-budget validation. Store original text, examples, large explanatory source maps and generated meshes externally, linked by digests; avoid copying IntentIR/TaskIR/full trace into each quoted payload.

Artifact hashing and compiler/generator implementation identities are distinct from existing compact genome checksums. Existing checksum verification provides codec integrity, not cryptographic authorization or intention verification. Fresh child execution must preserve complete canonical AST, including anatomical expression and gesture; child receives no inherited real-world authority.

## Minimal experimental Design additions

Retain existing rosette organs, exact pinned task dependencies, material/color rules and legacy family profiles. Introduce one explicit anatomy tag and one gesture record; simplify old presets gradually through migration, without pretending the prototype format is frozen.

Illustrative shape:

    design.anatomy = {
      model: "assembly", compiler: "graph-anatomy-experimental", seed:uint32,
      components:[bounded typed primitive constructors],
      owners:[total categorical material partition + exact operation anchors]
    }
    design.motion.gesture = {
      kind:gather|unfurl|glide|hover, strength:[0,1],
      ticks:[prepare,stroke,recover,rest]
    }

All nested records are closed, numeric controls finite, ticks exactly four integers each≥100 summing1000. Compiler-fixed pose templates use C² quintic interpolation and matching first/final pose; bound log scale±0.15, lean/opening±0.12. Default pose must remain a recognizable complete still specimen. Presets may derive suitable gesture choices without asking aesthetic questions; editing them changes source.

Anatomy initially offers monotone cubic/arc spine, positive-axis chamber, attached tapering spine; later a hinged fin and closed elliptical loop. Use ≤16 components, attachment depth≤4 (root depth0), ≤4 children per parent, ≤3 dominant masses, ≤4 loops/≤4 fins, and deterministic sockets. Proposed normalized geometric ranges from anatomy review: spine length .12–1.2, tube radius .015–.16, chamber axes .04–.35, fin span .12–.65 and width .025–.24, ellipse axes .15–.55, hinge angle amplitude≤.12 radians initially, with sum of maximum joint angles along each root-to-component path≤.35. The anatomy review’s broader .25 domain is deferred until composition tests justify it. These are bounded grammar domains, not a global nonintersection or beauty theorem. Primitive-specific regularity/seam/cap contracts must also hold.

A monotone cubic must have all derivative control vectors project≥η on one declared unit axis; compiler-fixed positive η makes its speed bound conditional and checkable. Ellipse loop speed≥2π min(a,b), curvature≤max(a,b)/min(a,b)²; require tube·curvatureBound<.45 for local tube safety. This does not prove separation between distant assembly parts. Square-root seed/filament tips need reparameterization/cap charts before reuse under a C¹ regularity claim.

Every real task operation has ≥one inspectable anchor and positive material territory. Every material point has exactly one categorical owner; neighboring region boundaries need a documented deterministic tie rule. One operation may own multiple regions; ornamental parts may repeat an owner without inventing computations. Stable material identity is tuple(componentID,chartID,u,v), with circle charts identifying endpoints and cap charts handling poles. Component rest topology and ownership survive every deformation. Unknown owners, uncovered required operations, ambiguous territory overlaps and invalid sockets reject compilation.

The anatomical attachment tree is distinct from the computational DAG. A body loop/branch/hinge is a visual motif, not an executable repeat/conditional. Task edges always join actual operation anchors with exact ordered ports. Component budget reduction may simplify decorative parts but cannot silently remove task nodes/edges or owners.

## Compiler and renderer policies, not extra sliders

Safe frame transport, holonomy/seam correction, adaptive sampling, quality tiers, depth buckets, derivative epsilons and GPU choice are implementation policies. Do not add arbitrary `frame`/`curvature` toggles to source just because algorithms change. Anatomy primitive topology implies its appropriate frame/seam policy. Source authors control intended topology, gesture, proportions and material—not low-level numerical algorithms.

Use shared rest material geometry and one deformation for tissue, sockets, organs and crests. A restricted 3D transform R diag(exp(−σ/2),exp(σ),exp(−σ/2)) has positive scales and determinant one; unrelated wave offsets do not inherit that proof. At most three low-frequency graph-derived perturbations obey Σ|a_j|sup||P_j′||≤η₀/4 for base speed≥η₀; this preserves speed≥3η₀/4. No formula proves that every generated assembly is elegant. The motion workstream’s387 restricted numeric poses establish socket coincidence and determinant/gain behavior in its prototype, not production geometric refinement. Compile dominant serial/fanout/merge motifs to glide/unfurl/gather with explicit tie rules; compact tasks may hover. Root-to-part affine maps carry exact moving sockets; C⁰ root coincidence does not assert C¹ watertight joins. Soft follower amplitudes use local rest length (≤.08L), and a rest-area weighted RMS budget≤.05 prevents component count alone increasing presentation intensity.

Passive tissue following can later use one fixed `soft` preset. Its nonamplification/ODE claims require raw-phase harmonic drivers, damping≥1/√2 (suggested .75–1.5), bounded frequency definitions and displacement sum≤.12. Existing phase-warped sine is not a finite raw-time harmonic sum. Closed spatial winding is integral; periodic temporal modes loop exactly under their declared contract, quasiperiodic secondary phases remain deterministic without exact fundamental-loop claims.

Compile charts, sockets, ownership and nested layouts once; pose per-part frames once per requested phase; reuse typed buffers and resolve recorded owner palettes outside the vertex loop. The first reference backend is Canvas, with optional WebGL2 only after measured need and conformance. Eight or12 common depth buckets interleave tissue and crest segments; transparency ordering remains approximate. Source-over pigment, cached round marks and a few restrained underlights support a connected silhouette. Normal transformations under nonuniform scale need inverse transpose; do not normalize degenerate chart cross products. Optical-depth alpha=1−exp(−τw) preserves aggregate transmittance for fixed total weight at identical pixel coverage, not arbitrary raster invariance.

Global per-animal budgets:≤24000 tissue samples plus≤1806 crest vertices, not those amounts per component;≤64 operation anchors. Actual DAG maximum edge slots is64×16=1024 before acyclic restrictions—an overlay display cap512 proposed by anatomy review would need explicit aggregation/inspection, not silently drop validated dependencies. Start with all exact edges on inspection, bounded by the real graph port budget. The renderer review proposes128 samples per visible chart; to make the budget precise, cap the primitive atlas at≤4 active charts per component (≤64charts), so minimum allocation≤8192; approved atlas charts and ownership must all be preserved. Sixteen single-chart components require only2048. Minimum allocation is renderer policy, not a new aesthetic slider; then distribute remaining budget by fixed material-area weights. Adaptive-error exhaustion is visible; density-normalized material weights prevent higher quality from merely whitening the animal. Renderer buffers/phase are never genomes.

## Proposed modules and interfaces

- `thought/document.js`: validate/import/export ThoughtDocument and preserve interpretation/status diagnostics.
- `thought/intent.js`: closed IntentIR recipes and clarification obligations; no execution.
- `thought/provider.js`: provider-neutral synthesis transport returning untrusted proposals; local templates/imports usable without a provider.
- `compiler/registry.js`: capability signatures/refinements/lowering identity; pure and simulated initially.
- `compiler/task-ir.js`: infer types/units/ordered ports and validate constraints/completeness.
- `compiler/lower.js`: `lower(taskIR,registry) -> {graph,contract,sourceMap,diagnostics}`; mechanical repairs tracked, meaning-changing repairs return a new proposal.
- `anatomy/grammar.js`: typed bounded component/ownership/socket validators.
- `anatomy/compile.js`: `elaborate(graph,seed,preferences) -> {anatomy,gesture,explanation}` deterministic before AST construction.
- `anatomy/material.js`: rest geometry, charts, transport/sockets/deformation; `sample(anatomy,materialID,phase)` gives geometry+owner without executing. `render/compiled-body.js` caches source/revision-bound charts and layout, while `render/canvas.js` initially implements reused buffers, common depth order and palette lookup. Compile/layout/pose/palette/picking caches have distinct source/view/run identities.
- `compiler/artifact.js`: `compileArtifact(...)` attaches actual Design, checks exact source budget, creates companion envelope/genomes, verifies child admission.
- `runtime/records.js`: explicit source-bound runs/lens/replay selection; future input environment contract lives here only after implemented.
- `gallery.js`/`translation.js` integrations: review supported meaning, generate a new body, inspect clause→task→organ, explicitly run/reproduce. Legacy specimens remain examples.

Do not introduce every module at once if a simpler testable dependency-free layout achieves the boundary. Names describe responsibilities and intended interfaces; implementation can combine small files initially.

## Hosting, secrets and game capability boundaries

GitHub Pages hosts static UI, local compiler/interpreter and data import/export. It cannot contain model/provider credentials. Optional generation uses a separately authenticated backend or local controlled service through one provider-neutral interface, with rate/cost limits; its response still needs identical validation. No backend/live Midnight.city operation is implemented by this research. Model synthesis permission is separate from real-world capability authority.

The existing NES game/emulator can be a separately invoked authenticated/local game capability or embedded experience once its actual API is reviewed. No arbitrary ROM/emulator/JavaScript code enters the typed task registry, no generated thought evaluates host expressions, and a quine does not copy game assets or credentials. A visual controller proposal can be inert until a specific bounded approved emulator control contract exists. Ownership of a game does not magically supply emulator APIs or source semantics.

## Staged implementation and gates

**A. Typed bounded task prototype:** implement status/registry/TaskIR validation and two literal input recipes plus import. Demonstrate one new supported thought and one clarify/unsupported case; compile the five unseen-composition benchmark cases without whole-task templates. Tests use independent outcomes, explicit unit/port/guard failures and no silent repair. Model meaning remains reviewed, not universally verified.

**B. New body compiler:** implement trunk/chamber/attached spine with stable ownership and committed finite anatomical expression. Two different task DAGs must generate different assemblies beyond family switching; seed variation affects bounded appearance only. Exact root/socket and operation mapping tests; source+generator identity determines recipe. Add fin/loop only after connected silhouettes pass visual review.

**C. Shared gesture/material pass:** implement the four-tick score, deterministic deformation and complete seam/cap/normal contracts; refine restrained light and sampling with aggregate budgets. Lean local quintic prototype is checked, but whole pipeline refinement remains work. Use film and static reduced-motion reviews as independent gates.

**D. Complete browser story:** meaning review, program, equations/anatomy, new creature, actual result, exact reproduction; trace-lens missing/stale/zero states, keyboard/mobile access, quality and pause with no effects. Source-bound explanatory text must distinguish observed input from authored assumption. Derive walkthrough sentences from the artifact’s task/contract/source map and validate every referenced node/constant. The actual Seedbank walkthrough falsely described squaring although its task multiplies tray counts by6; this is a concrete reason not to reuse hard-coded narration for generated tasks. The root has corrected that existing example separately. Use Body/Program/Recorded result modes and separate Build, Watch, Run and Create verified copy actions; a verified copy that evaluates a fresh task records that execution. Unresolved imports/proposals remain still and cannot auto-run. Three bounded candidate bodies preserve task semantics but selecting a new authored design changes source, making prior results stale.

**E. Release evidence:** existing tests plus20-thought statuses/10exact outcomes; three fresh quine generations and both recovery codecs; deterministic generated owners/phase; grammar/resource negative limits; human thumbnail/film comparison and stated-device performance. Report dimensions separately. Proposed p95≤33ms desktop/≤50ms mobile for one visible portrait are targets, not achieved measurements. Safety proofs never substitute for beautiful complete silhouettes.

## Consolidated evidence and honest remaining scope

All ten workstream perspectives are incorporated, including final motion/render/experience reports. Existing manually elaborated planter graph proves its expected output, zero effects, three fresh generations and both codecs. The semantics examples add route/queue output, blocked action guards and changed literal-source identity. Evaluation adds20 independently labeled thoughts and10 current-kernel outcome checks; these do not measure an automatic synthesizer. The Lean research quintic prototype kernel-checks local bounds/derivatives/interval preservation without project axioms or `sorry`, not complete renderer refinement. Motion’s387 numeric poses validate its restricted formula experiment; the new browser preview demonstrates those research shapes/motion with deterministic seeking, mobile and reduced-motion behavior, not production task compilation.

Rendering’s new20-sample Node measurements give geometry-only medians6.45–9.28ms at requested24000 points and1.55–2.48ms at4200. They exclude browser layout, Canvas dispatch/GPU and full-frame scheduling, and therefore do not certify desktop/mobile frame targets. Its936000-byte24k illustrative vertex-buffer estimate is theoretical, not measured resident memory. Coincident-pixel optical normalization is verified only under its stated coverage assumptions. Proposed first quality tiers4200 static previews,8000–12000 small animated bodies and≤24000 focused portraits remain to undergo equal-exposure visual/performance tests.

Current implementation still lacks automatic free-text interpretation, typed TaskIR compiler, committed production assembly grammar, full generated-body renderer and target-device/human acceptance results. Root’s companion design/prototype showcase may explain these available experiments, while production claims must remain tied to actually implemented features. The architecture above defines what to implement next and the separate gates for calling that pipeline useful, correct and beautiful.
