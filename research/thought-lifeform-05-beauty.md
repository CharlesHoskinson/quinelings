# Workstream 5: a generative art grammar for new lifeforms

## Direction

A new executable thought should produce a new anatomical composition, not merely choose a skin from the ten specimens. Novelty must come from a coherent body plan, meaningful graph structure and a small number of aesthetic choices. A deterministic source hash is a source of variation, not a substitute for anatomy.

The existing collection and `final-qdl-lifeforms.md` establish why: rich mathematical marks can still look like disconnected wire diagrams when every filament has equal visual authority. The generator should produce a dominant mass and attachment hierarchy before sampling fine tissue. Make the organism recognizable when paused and reduced to a small grayscale image.

`research/thought-lifeform-05-concepts.svg` is a native vector contact sheet of six proposed unseen body plans. These are design concepts, not runtime frames, generated QDL, or recorded measurements. The accompanying Python file deterministically constructs their curves. Semantic color is illustrative; no trace values or execution events are fabricated.

## Anatomy production rule

Use a typed, bounded grammar conceptually like:

    Organism := Axis + PrimaryTissue + AttachedSecondaryTissues + FineFringe
    PrimaryTissue := Chamber | FoldedSheet | RootedFan | OpenShell
    SecondaryTissue := Chamber | Petal | Tail | Branch | Membrane
    Attachment := declared(parent material coordinate, child root coordinate)

A detailed grammar/compiler is another workstream. The art requirement here is that each production carries a rest pose, continuous deformation, attachment invariant, owner map and scale budget. The grammar is not free collage: secondary pieces attach to the primary body, and primary bodies share one dominant orientation and gesture.

Keep executable nodes/ports/edges exact in the ownership and topology layer. An anatomical motif can summarize several operations for portrait readability, but inspection must reveal those actual owners. A decorative chamber cannot be described as a computation that does not exist.

## Constrained phenotype

These are suggested aesthetic acceptance ranges, not current QDL schema or universal mathematical laws:

| Trait | Suggested constraint | Purpose |
| --- | --- | --- |
| Dominant visible mass | 50–75% of coarse material area | One body rather than a cloud of equal parts |
| Primary mass count | 1; at most 3 major visible lobes | Readability at small scale |
| Secondary lobe area | Each 12–35% of primary area; sum ≤75% | Supporting structures remain subordinate |
| Child/root attachment width | 12–35% of child maximum width | Parts read as attached, not nearly touching |
| Fine fringe | ≤20% of total visible coarse mass footprint | Delicacy without visual confetti |
| Coarse portrait aspect ratio | Approximately 0.45–2.6 | Broad diversity without unreadable extreme slivers |
| Occupancy | Target 0.64–0.78; keep current hard composition bounds | Margin across the whole gesture |
| Dominant long ridges | 2–5 before finer detail | Strong structural light hierarchy |
| Primary posture lean | Prefer ≤0.25 rad before deliberate exceptions | A clear orientation without accidental collapse |
| Visible internal openings | 1 principal gap; up to 2 secondary gaps | Negative space has an intelligible hierarchy |

Material area here means a coarse silhouette/material mask from the rest anatomy, not the count of bright particles. Projected overlap can alter measured area, so evaluate several phases and do not confuse an image heuristic with a geometric proof. The actual hard geometry constraints remain finite values, positive thickness/radius, bounded scale, endpoint/root coincidence, valid seams, bounded vertices and explicit source ownership.

Controlled asymmetry is structural: shift one chamber, shorten one secondary branch, or offset one fold. Do not use independent per-vertex randomness. Align microdetail with the larger surface's tangent and curvature so it explains the mass. Dark recesses and one clear opening are as important as bright marks.

## Meaningful graph traits versus aesthetic variation

Use graph-derived features only where they have a clear honest interpretation:

- Longest dependency depth influences axis progression or chamber layering.
- Fanout creates a declared branching attachment group; fan-in creates a gathering chamber.
- Input-port order determines attachment order, even when two values have identical colors.
- Literal/observation nodes become peripheral input regions; degree controls local connection affordances.
- Distinct operation roles retain the fixed role dictionary in tissue ownership.
- Quote/constructor/repeat annotations receive explicit nested/return features. They do not imply arbitrary executable loops.
- A record/array result may receive a separate declared result projection. Its entries are not automatically executable graph nodes.

Do not assign aggression, intelligence, trustworthiness, emotion or subjective thought from graph depth, source length, hash bytes or color. A scalar lens colors actual recorded values using its declared unit/domain; it does not secretly control personality.

Use an explicit aesthetic seed for secondary asymmetry, curve handedness, chamber eccentricity, limited fold distribution and microdetail phase. Derive it from canonical executable graph plus validated authored preferences before final source assembly; record the resulting anatomical expression in source. This avoids a self-referential final-source-hash seed. Seeded choices must stay within the typed production constraints, not alter task policy, operation roles or numerical truth.

## Six new organism briefs

### 1. Crownweft — independent-source consensus

A hanging gathering chamber under a broad asymmetric canopy, with input fringes merging into a short clear stem. The upper canopy is the dominant mass; do not fill it with a dozen equal miniature bells. Colored input territories merge visually around the consensus owner's chamber while ownership remains separate. A slow canopy lift precedes one gentle gathering stroke; fine fringe follows late. Material: visible thin membrane, three long pearl seams, quiet wispy perimeter.

The executable consensus node counts distinct provenance as specified by the task. Number of decorative fringes must not be mistaken for independent votes. Recorded support or acceptance belongs in an explicitly declared result view; idle gathering indicates no accepted decision.

### 2. Spindlewake — dependency scheduling

A vertically elongated chamber column containing staggered broad sheets, with a clear exterior edge and one open internal channel. Depth layers organize the column; independent dependency groups can have subordinate sheets at the same progression level. One main axial expansion and delayed sheet opening convey an orderly gesture. Material: translucent broad sheets with pearl edges, not evenly bright spiral wire.

The task DAG determines dependencies; actual start/end times come from the recorded schedule. Anatomical vertical distance alone does not represent hours. A result projection may label timing; a pure waveform cannot assert schedule completion.

### 3. Needleglider — routing

One strong leading chamber, a long narrow continuation, a small offset ventral fin and a single opening separating chamber from wake. It inclines before gliding, with a restrained counter-curved recovery; the wake trails rather than oscillating independently. Material: dense front ridge, thin colored shoulder membrane, progressively sparse trailing tissue.

The computation DAG contains routing operations. A city/street adjacency graph is task input, not automatically anatomy. A recorded route overlay, when declared, should follow its own identifiable result geometry. The organism is not said to physically travel streets when it merely renders a task.

### 4. Rootvault — resource allocation

A dense low reserve chamber supplies three unequal rooted fans, all joined by broad attachment necks. The reserve chamber is primary; branches are subordinate grouped outputs. A slow outward fan opening then inward settling preserves the base. Material: husk-like root membrane, luminous joining ridges, translucent fan interiors and very few distal threads.

Input request order and actual allocation policy remain explicit. Grants/reserve can shape a declared recorded-result view with units; the static number of decorative branches does not assert the number of requests. No growth or reproduction is implied by an outward fan stroke.

### 5. Concord-shell — evidence reconciliation

Two unequal leaf chambers share a short central root and open around one clearly visible gap. Both are parts of one organism, with a quiet connecting hinge; avoid two detached rings. A shared preparation precedes offset openings and a measured return. Material: thin pane-like leaf membranes, one bright ridge on each leaf, slightly different fold densities.

The paired form is a structural motif for multiple evidence operations, not an automatic true/false polarization. Conflict, support, refutation and missing evidence must retain their categorical recorded semantics. Never blend contradiction into an invented average certainty or portray missing evidence as false.

### 6. Archivane — named report / memory-shaped data task

A compact layered capsule carries a short curved crown and a few laminated overlapping vanes around an eccentric core. The body stays compact while one vane unfurls, holds, and settles; it differs from a long filament even when its operation count is similar. Material: a visible central membrane, quiet recessed layers and short bright edge sections.

A report operation gives named output ownership; quoted input records may be shown as layered structure. The current pure task runtime does not provide persistent mutable memory. “Memory-shaped” must identify actual source data or recorded task outputs rather than claim an organism remembers between executions.

## Deterministic constrained generation and search

1. Validate task semantics and bounds before choosing anatomy. Build stable structural descriptors from the graph.
2. Choose a primary production compatible with those descriptors; generate 24 or 32 candidate anatomical expressions from a deterministic candidate seed sequence. This finite candidate budget is authoring work, not 32 live interpreters.
3. Enforce hard constraints first: ownership completeness, root/endpoint coincidence, valid closed seams, bounded geometry, no new execution edges, and budget compliance.
4. Render low-resolution grayscale and role-color studies at rest plus several gesture phases. Rank candidates using explicit proxy scores: coherent coarse silhouette, relative mass hierarchy, stable occupied extent, clear principal opening, modest line-density variation, and identifiable attachments. Penalize clipping, disconnected major masses, equal-weight tangles and phase-to-phase framing drift.
5. Add diversity only among candidates that pass the hard constraints and baseline quality. Compare coarse shape descriptors against existing specimens; do not reward novelty at the expense of anatomical coherence.
6. Present a small number of beautiful candidates with the same task and ownership. Selection edits authored anatomy, so final canonical source and quine identity include the selected expression. Runtime view phase cannot silently rerun candidate search.

Aesthetic scores are proxies, not proofs of beauty. Keep individual score terms inspectable, use fixed seeds and sample phases, and validate finalists with humans. A meaningful-program review and a visual preference selection are separate judgments: liking a creature does not approve an assumption about policy or authorize its effects. Unsupported thoughts remain proposals with obligations, regardless of attractive rendering.

## Authored source, actual provenance, and view traits

Authored: bounded anatomical expression, attachment/owner map or its deterministic derivation contract, material hierarchy, gesture declaration, aesthetic seed and chosen candidate. These reproduce exactly in source, although future experimental renderer changes may affect pixels.

Actual runtime provenance: source hash, selected task occurrence, verified emission/admission events and lineage relationships. If a display shows age, distinguish elapsed presentation time, time since a recorded run, and verified lineage depth. A pulse rate cannot manufacture source age, a bud cannot manufacture a child, and a seed hash cannot manufacture ancestry.

Presentation: current deformation phase, pause, reduced-motion specimen frame, camera zoom, active lens, trace replay and temporary owner emphasis. Keep names/callouts outside the main silhouette; an organism should hold attention without UI text over its body. Owner precision appears when selected or inspected.

## Acceptance

Generate the six task motifs above plus at least four unseen combinations. Each must create a new anatomical expression rather than point to a library family record. Confirm stable reproduction of that expression, honest operation ownership, source/phase separation and unchanged task outputs across aesthetic candidates.

Use a small unlabeled grayscale sheet at 64/96/160-pixel specimen height. Ask viewers to group repeated phases of the same creature and separate different creatures; confusion should guide anatomy revisions. Inspect a ten-second film for a clear principal gesture, continuous attachments and quiet recovery. Confirm role/lens states remain readable and no view event dispatches a task. Measure candidate-generation cost independently from per-frame cost and keep rendering within the existing geometry budget.

The exceptional creature is a simple coherent composition with rich tissue inside it. Its complexity should feel discovered when inspected, rather than dumped onto the first glance.
