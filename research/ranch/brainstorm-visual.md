# Visual ranch proposal: a luminous tide garden

Status: design proposal for candidate convergence; no implementation or measured speedup. Read `AGENTS.md`, `docs/RANCH-WORKPLAN.md`, `lifeform-renderer.js`, `anatomy.js`, and `baseline-performance.json`. All social and lifecycle events remain local simulations; rendering never runs a task.

## Habitat and source-linked identity

Create one shallow, midnight-blue habitat with translucent mineral shelves, restrained sea-glass tissue, and bright fine ridges. Put most light inside bodies, leaving negative space between their curved appendages. Use a static CSS background and sparse decorative substrate contours; avoid a continuously simulated particle field. Creature shadows are soft flattened ellipses indicating habitat position rather than apparent physical mass. Background decorations have no program owners and are never selectable as tissue.

Use one scene for coexistence, with eight visible creatures as the initial desktop budget. Place residents using stable slot coordinates plus bounded idle offsets. Keep labels in DOM above or beside bodies, with name, short source identity, and lifecycle state. Camera framing stays fixed during breathing, approach, and birth. New arrivals occupy reserved nursery slots rather than forcing all residents to shift. A compact residence list makes every resident reachable when the visible cap is exceeded.

Preserve `Anatomy.generate`'s graph-derived morphology: convergence affects chamber spread; fanout yields unequal branches; deep serial programs acquire a neck and subordinate lobe; selection produces a sweep; effect/sequencing traits affect proportions. These are deterministic visual correlations, not promises that silhouette uniquely identifies executable behavior. Avoid assigning an arbitrary animal family to every program. Preserve the existing validated component tree, complete node territories, chart coverage, and fixed `portraitFrame` bounds.

Three readable layers:

- **Silhouette:** generated from the validated graph and authored anatomy. The seed controls bounded eccentricity and handedness. A small source identity label distinguishes creatures whose silhouettes coincide.
- **Tissue:** continue `Chroma.colorFor` role/lens colors. Owner boundaries carry fine texture or dashed seams when inspection is active, so identification does not depend on color. Do not substitute parental palette colors for recorded lens values.
- **Lineage:** an external identity badge and selected-lineage overlay. It references actual event records and node-origin mappings, never modifies executable inputs or inherited authority. Display “origin unavailable” when metadata is missing.

Keep program wires hidden during ambient motion. Selecting a node dims other territories, outlines its surface, shows its anchor and incident edges, and opens its actual source span/op/inputs. Selecting a creature reveals its graph and source separately from its parent history. A many-to-one inherited territory is labeled with all recorded origins; do not invent one parent for aesthetic convenience.

## Expressive choreography with honest outcomes

Animate immutable event records on a visual clock. No event completion callback may create offspring or execute code. Reloading, seeking, skipping, and motion preferences must produce the same final world state. Rendering interpolates world positions and the existing bounded anatomy gestures; it does not bend validated anatomy beyond its legal pose bounds.

| Event | Proposed visual sequence | Required visible result |
| --- | --- | --- |
| Courtship | 0–600 ms: two residents turn toward each other by view composition; 600–1400 ms: approach separate rendezvous marks; 1400–2200 ms: their gather/unfurl rhythms briefly synchronize. A thin, dashed proposal arc connects their labels. | “Pairing proposal” with compatibility/rejection reason. Proposal arcs never look like executable graph edges. Reject/expire returns each resident to its own slot. |
| Mating | After a committed accepted record, 0–700 ms: one bounded pulse travels along each recorded contribution arc; 700–1500 ms: a nursery silhouette reveals; 1500–2400 ms: the child's true tissue resolves and it unfurls. Parents remain readable at their slots. | State whether authored body, executable task, or both changed. If executable source is identical, explicitly label “copy”; similarity alone is insufficient. |
| Merge | 0–700 ms: source portraits flank a central destination; 700–1700 ms: their recorded contribution regions appear on the destination; 1700–2400 ms: destination ridges resolve. Use a crossfade between separate valid assemblies rather than impossible topology interpolation. | Show “merge” and actual retained/replaced parent lifecycle status. Do not make a surviving parent vanish because a cinematic fusion suggests consumption. |
| Birth | Child appears at its committed nursery slot, at full fixed scale, with a short tissue-opacity reveal. No explosive particles or shrinking through unsupported anatomy states. | Child identity, reconstruction status, and independent task change/result when available. “Not run” until an explicit task run exists. |

Queue at most one foreground ceremony. Other events appear immediately in the history and await optional replay; cap replay queue length. A selected event can be stepped through four named phases or skipped. Never hide validation failure behind an apparently successful birth animation. Initial preview offspring remain labeled “preview” until committed by the simulation operation.

## Performance diagnosis and proposed renderer

Baseline: eight offscreen 240 px creatures, 4,000 samples each, 30 frame measurements; median **81.4 ms**, p95 **106.6 ms**, covering CPU geometry and Canvas submission only. Reciprocal median is about 12.3 frames/s before other work. This establishes that eight continuously animated current canvases are unsuitable for a smooth ranch; it says nothing about hardware GPU timing.

Current hot path transforms every sample, normalizes normals, allocates projected point/bucket/hit objects, and submits one `drawImage` per tissue sample. Four crests add 1,204 world vertices per creature. `reuse:true` saves typed arrays, while the two-plan cache bounds layouts; neither removes per-frame sample transformation or Canvas calls. The frame API currently rejects budgets below 4,000, so “reduce budget to 500” is not an available option without an explicit validated API change.

Recommended WebGL2 route:

1. One habitat canvas/context and scheduler. Retain a DOM overlay for accessible controls and labels. No context per creature.
2. Add a narrow renderer-facing rest-layout export containing position, normal, component index, node owner, and alpha. It shares the existing sample-plan implementation; do not duplicate the geometry compiler in shaders. Upload rest samples once per compiled body/LOD. Owners stay integer node indices. Version any lower-sample layout path explicitly and reserve at least one interior sample per territory and required chart before distributing area samples.
3. Compute only the at-most-16 component pose matrices per creature on CPU using the existing semantics. Upload position transforms and matching normal matrices to a nearest-sampled float texture indexed by a scene-global component index. CPU normal matrix upload avoids discrepancies under anisotropic scaling. Palette texture maps creature/node to the current role or recorded lens color. Palette changes do not rebuild anatomy.
4. Draw each tissue sample as an instanced camera-facing quad with analytic radial alpha; a shared static four-vertex strip replaces 32,000 Canvas calls. Instance attributes reference immutable rest sample data, owner, and transform slot. One global draw handles the translucent additive glow; one batched ridge mesh pass handles fine luminous crests. Expand ridge lines to triangles because portable wide GL lines cannot be assumed. Retain a subdued interior/silhouette pass if additive light alone erases structure.
5. Additive glow intentionally trades exact Canvas depth appearance for stable unsorted luminescence. It must pass crowded-body readability review. Keep optional opaque cores depth-tested; do not claim normal alpha blending is order-independent. Bound halo radius and total framebuffer pixels to control overdraw. Use no full-scene bloom in the initial candidate.
6. Caps: 8 animated bodies, 32,000 tissue instances total, 16 components/body, 64 nodes/body, DPR at most 1.5 desktop / 1 mobile, maximum 2 million drawing-buffer pixels. Additional residents use cached still portraits and a list. Rebuild/upload only on actual source/body/LOD changes. Context loss cancels GPU scheduling and switches to still portraits, with a bounded rebuild on restoration.

The instancing and resource proposals derive from the [Khronos WebGL2 specification](https://registry.khronos.org/webgl/specs/2.0.0/); the performance outcome remains an untested hypothesis. A shader port must be compared against CPU `Anatomy.sample`/`anchor` for root, child, deep attachment, cap, and hemisphere samples across accepted gestures.

## Bounded fallback, mobile, and inspection

Canvas fallback: render six quantized phases for each visible 240 px portrait, then reuse the resulting images while moving whole portraits in the habitat. Build at most one portrait phase per idle slice, stop prewarming during interaction, and begin with a static phase. Eight bodies × six phases × 240² × four bytes is about **10.55 MiB of raw image pixels**, excluding browser overhead. Use a 16 MiB accounted pixel cap, two palettes at most per selected body, LRU eviction, and explicit disposal. Cache keys include source/body fingerprint, palette/lens signature, composition, resolution, and phase. Current `comp.sprites` is unbounded by palette count; invalidate or cap it when recording changing lens palettes. Do not rely on its current Map as a bounded scene cache.

Mobile starts with four visible bodies and still background residents. Preferred tissue LOD proposals are 1,000/sample thumbnail, 2,000/sample mobile, and 4,000/sample focused desktop, subject to the new layout validation and coverage floor. Cap total instances and raster pixels independently. Demote LOD only after sustained slow frames; promote after several seconds of headroom to avoid oscillation. Suspend the clock when the document is hidden and stop rendering an offscreen habitat. LOD changes preserve all owners in the accessible node list even when their territories are tiny.

For reduced motion, remove idle deformation, travel, synchronization, and reveal animation. Show the committed final pose plus a textual event summary and optional static four-step storyboard. Also offer a persistent pause control to everyone. This follows the W3C guidance that nonessential [interaction-triggered animation can be disabled](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html). Lifecycle information and controls remain usable with no animation.

Inspection begins with creature hit bounds in scene coordinates, then analytic CPU anchors and a sparse, preallocated owner sample list for the selected creature. Calculate against the exact displayed pose, including quantized fallback phase. Existing every-third-point nearest hit picking can select hidden or overlapping tissue; call this approximate, prioritize frontmost selected creature, and expose an explicit node list. Add an on-demand flat owner-ID picking pass only if needed; never do synchronous GPU readback on every pointer move. Keyboard selection cycles DOM creature buttons and source nodes with a visible focus outline. Tooltips are supplementary, and event status uses restrained `aria-live=polite` announcements.

## Candidate acceptance gates

- Reproduce the baseline scenario after warmup and separately record compile/prewarm, CPU update/submission, presented-frame intervals, and GPU timing when supported. Use asynchronous [Khronos disjoint timer queries](https://registry.khronos.org/webgl/extensions/EXT_disjoint_timer_query_webgl2/); discard disjoint results and disclose software rendering. Target p95 CPU work under 8 ms and presented intervals under 33.3 ms for eight desktop bodies. Targets are acceptance criteria, not measurements.
- No per-frame layout rebuilds or per-sample JS object churn. Resource accounting remains within the caps after hundreds of births, removals, lens changes, resizes, and context restoration. Removed bodies release GPU slots, buffers, images, and pick entries.
- Every rendered territory retains a valid node owner; no decorative substrate or lineage arc becomes a task edge. DOM selection, source mapping, and static view remain complete under every LOD.
- Identical-source reproduction is visibly labeled copying. Birth/replay/skip/pause never invokes task execution or changes deterministic lineage.
- Compare graph-diverse fixtures in normal and grayscale views, overlapped habitats, narrow mobile layout, paused mode, and keyboard-only use. Verify cap/hemisphere and child-component picks against source owners. Have auditors review actual candidate screenshots and traces alongside source, rather than evaluating aesthetic prose alone.

Implementation order: bounded fallback and passive event storyboard first; shared GPU tissue batch next; source inspection parity and stress/performance gates before further glow or environment effects.
