# Astra implementation audit: generated anatomy and motion

Reviewed `docs/THOUGHT-TO-LIFEFORM.md`, workstreams 03/06/10, `qdl.js`, `morphology.js`, and Lean Geometry/Rhythm/ClosedSurface plus the research gesture proof. This is an implementation contract recommendation, not evidence that production accepts the proposed fields.

## Decision: implement one bounded assembly, then extend it

Production currently rejects `design.anatomy` and `motion.gesture`. Its renderer dispatches ten families; the generic tissue sampler computes separate family strands, numerical projected normals, and independent family anchors. Adding generated JSON alone does not create a new body. Update the runtime validator, JSON Schema, design-bound graph validator, renderer dispatch, constructor source admission, and browser script loading together.

The first complete grammar needs only one rooted ordered tree of tapered spines and ellipsoid chambers. It already generates genuinely new combinations: serial trunk with a continuation, branched trunk with subordinate chambers, and multiple inputs gathered into a central chamber. Use stable graph IDs and motif measurements; do not choose between three complete hard-coded animal recipes. Defer fins, loops, arbitrary joints, perturbation expressions, and soft followers until these assemblies work through the real source/renderer/recovery path.

A conservative straight tapered spine is a valid initial monotone cubic specialization. If curved spines are implemented now, use four local controls whose y derivative controls are all at least a fixed positive eta. Sweep circles in the fixed x/z plane. Since y strictly increases, this chart is regular without a numerical transport frame or curvature certificate, and distinct longitudinal slices cannot intersect. This is a restricted axial sweep, not a normal tube around an arbitrary curve. Keep root controls at the declared local origin. Positive linear radius avoids pinched tips; explicit end disks close it with C0 joins. Do not claim C1 end-cap joins.

Ellipsoid chambers need a real pole policy. Two stereographic hemisphere disks provide finite regular charts using rational functions; their equators coincide. Alternatively a latitude sampler may be used for rendering, but its rank-zero pole parameterization must not be described as a regular global chart. Ellipsoid gradients give well-defined normals even at poles. A chamber's child attachment origin must be explicit (for example its lower pole), or its root and material sampling will silently disagree.

## Source contract to settle before implementation

Use a single experimental compiler identity string and uint32 seed. Source contains all expanded dimensions and attachments; the seed is provenance, not a hidden geometry recipe. Legacy `family` can remain required as a compatibility field while `anatomy.model === "assembly"` is authoritative for geometry. Do not derive assembly coordinates from the legacy family in that branch.

Keep every nested record closed. One practical compact grammar is:

```text
anatomy = {model:"assembly", compiler:<fixed identity>, seed:uint32,
           components:[component...], owners:[territory...]}
component = {id, kind:"spine", length, radii:[root,tip], parent}
          | {id, kind:"chamber", axes:[x,y,z], parent}
parent = null | {component:<earlier id>, socket:{u,v}, angle, hinge}
territory = {node:<real task ID>, component:<ID>, u:[lo,hi]}
gesture = {kind:"gather"|"unfurl"|"glide"|"hover",
           strength:[0,1], ticks:[integer,integer,integer,integer]}
```

This is a proposed minimum, not an additional independently accepted syntax. `angle` is the rest orientation in a fixed declared plane; `hinge` is a signed bounded motion coefficient in that plane. Define the coordinate semantics once and use the same evaluator for body, socket, anchors, and crests. More orientation dimensions may be added only with clear units and bounds. Source paths and compiler identity distinguish authored structure from view state. Prefer an explicit `anatomy.owners` partition over renderer nearest-anchor guesses.

Required validator judgments:

- One root, first component; unique IDs; every parent is earlier. At most 16 components, root depth 0 and depth at most 4, at most four children per parent.
- Spine length .12–1.2, radii .015–.16; chamber axes .04–.35. All numeric controls finite. Single-component geometry remains bounded; recursively composed rest offsets still require conservative whole-body framing.
- Sockets have a documented normalized material meaning for each primitive. Unit intervals are closed; circular coordinate endpoints are canonicalized. For an axial spine, socket u is longitudinal position and v is azimuth; for a chamber u is normalized vertical location and v is longitude. Use an analytic frame or a fixed declared orientation at the poles, never normalize a zero cross product.
- Joint motion magnitude at most .12 radians and sum of absolute maximum angles along each path at most .35. A depth bound alone does not establish the path-angle bound.
- Every component has a positive-width complete ordered u partition from exactly 0 to exactly 1, no gaps or overlaps. Every partition owner is a task node. Every real task node occurs in at least one positive-width territory. A canonical boundary rule assigns internal boundaries to the upper strip and u=1 to the final strip. Circle seams and chamber poles have canonical owner selection independent of the chart used.
- Anchor each node at a deterministic interior coordinate of its first territory. Every anchor is inspectable. Decorative repeats may reuse an owner. Imported anatomy failing total ownership rejects; never silently replace it with generated ownership.
- Four integer timing values each at least 100, sum 1000. Strength is finite in [0,1]. Gesture tags are closed and fixed templates have p4=p0 and p3=p4.

The exact production schema should follow the implemented module, not all illustrative fields in earlier research. If compact equal partitions by an owner list are chosen instead, document their equivalence and keep the completeness/boundary checks above. The arbitrary original rectangles in the research example are unnecessarily difficult to validate and should not be the first grammar.

## Pure geometry and motion API

Compile a validated anatomy once into rest chart data, material territories, anchors and a conservative static extent. Pose once for a finite requested phase. For each component compose its parent's complete affine map, parent socket translation, rest orientation, and bounded hinge rotation. Child origin and the parent's evaluated socket then coincide by construction.

Apply the same component transform to sampled tissue, material sockets, operation anchors, and crest vertices. Do not add independent world-coordinate waves after that transform. Use one root gesture transform `R(alpha) diag(exp(-sigma/2),exp(sigma),exp(-sigma/2))`; fixed templates bound sigma by .15 and lean/opening by .12. All scales are positive and the exact-real determinant is one. Inverse-transpose normals are required under this nonuniform scale. No linear averaging of component transforms is needed.

The four-stage score uses `H(z)=6z^5-15z^4+10z^3` at normalized stage coordinates. Phase convention should be explicit: preserve existing radians at the morphology boundary, reduce `phase*rate/(2*pi)` modulo one, including negative phases, then locate the stage from ticks. Finite-but-enormous input phases need an explicit numerical policy; multiplication overflow is not excluded merely by `Number.isFinite(phase)`. Either reject out-of-range phases or reduce before multiplication safely.

No clocks, random calls, task evaluation, trace access, or ambient state belong in anatomy geometry. Stable owners depend only on rest material IDs. A tiny cache may use the immutable source-derived compiled object plus exact requested phase; cache identity must not omit anatomy or gesture fields. Source mutation requires recompilation. Reduced motion freezes the selected complete rest pose, including crests and organs.

Recommended surface interface returns the existing `{points,ridges,owners}` representation and a component-based anchor evaluator. Owner indices must use the same ordering as `Chroma.compile(s)`; matching task IDs to array positions without checking that ordering is a subtle integration bug. Root should wire dispatch in morphology and preserve the legacy branch. Pure anatomy modules should receive validated graph node IDs, not import core or execute kernels.

## Global allocation and identity gates

Allocate at most `design.surface.samples` tissue samples across the entire body, never that count per component. Preserve every active chart and every owner. The research minimum 128 samples per chart conflicts with existing 4,000-point designs when 16 components have three charts (6,144 minimum). Resolve this now: use a smaller feasible minimum or raise the effective minimum with explicit rejection/schema changes. Do not exceed the requested budget to satisfy a hidden per-chart minimum. It is also necessary to reserve at least one sample inside every territory if visible owner coverage is claimed; positive mathematical area alone can miss a thin strip at a finite sampling level.

Crests share the global 1,806-vertex budget. A six-crest maximum does not permit six crests on each component. All task edges remain inspectable up to 1,024 declared input slots; anatomical simplification cannot discard them. Normals, lighting and scalar labels do not change categorical material ownership.

Expanded anatomy must survive the canonical constructor AST, three fresh generations, harmonic/RGB recovery, and source-bound run association. Check exact canonical UTF-8 source against 65,536 bytes after constructor duplication. A graph payload below 65,536 bytes is insufficient. Derive seed from canonical graph plus explicit preferences before anatomy; do not hash a source that contains its own seed. Selecting another candidate changes source and invalidates the old run association.

## Formal claims that are established and missing

Existing Lean Geometry proves positive scalar organ radius, pinned filament endpoints, opacity bounds and legacy allocation arithmetic. Rhythm proves monotone phase warp, positive breath scale, and bounded normalized scalar waves. ClosedSurface proves periodic scalar controls; its own comment explicitly excludes centerline and normal continuity. The research gesture proof establishes polynomial bounds, actual first/second derivatives, endpoint conditions and convex interval preservation. None currently refines an assembly implementation.

Extend the formal project with the actual gesture definitions and small honest contracts: piecewise stage values remain in template intervals, positive diagonal scales, attachment-root algebra, and allocation/ownership arithmetic. Whole piecewise C2 periodicity requires a gluing argument, not merely the six endpoint equalities. A full regular-surface theorem additionally needs chart ranks, chart transition agreement and normal orientation. Total categorical ownership needs exact partition and cross-chart quotient compatibility. Runtime floating-point tests supplement these real-number claims; they are not proof extraction.

Explicitly leave unproved global self-intersection avoidance, C1 watertight unions, anatomical beauty, natural-language meaning, and whole-browser frame performance. Local determinant positivity is not global injectivity of an assembly. A disconnected-looking body can pass every scalar safety inequality. Human inspection of complete bodies and motion remains an independent acceptance gate.

## Concrete verification gate

1. Positive examples: three unseen DAG shapes and two seeds each; compare full generated component/attachment expressions, not family names. Input-order/ID tie rules must be deterministic.
2. Negative examples: unknown owner, omitted task owner, overlapping/gapped/zero-width territory, duplicate component, missing/forward parent, fifth child, depth five, invalid socket, nonfinite dimension, path angle above .35, malformed ticks and source overflow.
3. Geometry: all primitive seams/caps and their owner tie rules; finite analytic normals at poles; every territory visibly sampled; every moving child root equals its real parent socket; same phase after arbitrary seeks yields identical arrays/owners; strength zero gives rest geometry.
4. Motion: every stage boundary plus just before/after and the period seam; negative phases; all four tags; exact deterministic rendering cannot advance task counts or create receipts.
5. Budgets and integration: 16 components / 64 nodes / minimum 4,000 samples, both view tiers, total tissue and crests bounded, all anchors map to existing Chroma owners, no missing task edges, three quine generations and both codecs.
6. Visual review: complete stills and 12 phase contact sheets of actual production geometry, plus real browser motion at stated viewport/device. Report observed clipping, excessive overlap, weak silhouette hierarchy and frame timings separately from passed mathematical tests.
