# A compositional anatomy grammar for novel Quinelings

This proposes an experimental QDL extension beyond the ten hard-coded families. Reviewed current QDL, morphology, and final motion/geometry/lifeform proposals. No shared production files are changed. A natural-language compiler is a separate workstream: anatomy consumes a validated executable graph and never invents an instruction or an effect.

## One connected body from a finite grammar

Use a small assembly of regular spines, chambers, fins and loops, not a random choice of ten skins. Each component is a charted geometric primitive with a stable ID, material domain, parent attachment, and explicit operation ownership. An attachment tree supplies mechanical hierarchy. The task dependency graph remains a different graph: edges displayed between operation anchors represent actual declared data dependencies, not anatomical joints.

```ebnf
Anatomy       = Root, Component{0..15}, Ownership, Gesture ;
Root          = Spine | Chamber ;
Component     = Spine | Chamber | Fin | Loop ;
Spine         = BezierSpine | ArcSpine ;
Chamber       = Ellipsoid | PearChamber ;
Fin           = RuledMembrane ;
Loop          = EllipseLoop ;
Attachment    = ParentID, Socket, Joint ;
Socket        = SpineSocket | ChamberSocket | FinSocket | LoopSocket ;
Joint         = Rigid | Hinge ;
Domain        = Open | Capped | Closed ;
Ownership     = OperationID, ComponentID, MaterialRegion ;
Gesture       = bounded closed primitive choreography ;
```

Typed constructor signatures make domain constraints checkable before rendering:

```text
spine  : RegularCurve<[0,1]> × WidthProfile × EndCaps → Component<SpineDomain>
chamber: PositiveAxes × ClosedShapeProfile → Component<CappedSphereDomain>
fin    : RegularCurve<[0,1]> × FinProfile → Component<OpenRectDomain>
loop   : PositiveAxes × TubeRadius → Component<S1xS1Domain>
socket : Component<D> × Coordinate<D> × UnitFrame → Socket<D>
attach : EarlierComponent × Socket<D> × Joint × LocalComponent → AttachedComponent
```

Domain contracts are primitive-specific: an open ribbon has rectangle boundary; a capped tube has explicit disk cap charts; an ellipsoid is a sphere with separate pole charts; a loop is a torus with both coordinates circular. A chamber's latitude seams/poles are not handled by declaring every parameter periodic. A fin remains a sheet; it does not claim to be a watertight volume.

## Concrete authored JSON

Illustrative syntax, not currently accepted by the existing strict validator:

```json
{
  "anatomy": {
    "model": "assembly",
    "compiler": "graph-anatomy-experimental",
    "seed": "designer-choice-17",
    "components": [
      {"id":"axis","kind":"spine","domain":"capped",
       "curve":{"kind":"bezier","control":[[0,-0.7,0],[0.14,-0.25,0],[0.07,0.2,0],[0,0.7,0]]},
       "width":{"root":0.09,"tip":0.035},"parent":null},
      {"id":"core","kind":"chamber","domain":"capped",
       "axes":[0.18,0.23,0.12],
       "parent":{"component":"axis","socket":{"u":0.45,"angle":0},"joint":{"kind":"rigid"}}},
      {"id":"collar","kind":"loop","domain":"closed",
       "axes":[0.31,0.23],"tube":0.035,
       "parent":{"component":"core","socket":{"latitude":0,"longitude":0},"joint":{"kind":"rigid"}}},
      {"id":"fin-right","kind":"fin","domain":"open","span":0.42,"width":0.16,
       "parent":{"component":"axis","socket":{"u":0.52,"angle":1.2},"joint":{"kind":"hinge","axis":[0,1,0],"amplitude":0.12}}}
    ],
    "owners":[{"node":"faultScore","component":"core","region":{"u":[0.1,0.6],"v":[0,1]}}],
    "gesture":{"kind":"gather-unfurl","amplitude":0.08}
  }
}
```

The example omits other owners for brevity; complete source must assign every real operation to at least one inspectable anchor and tissue territory. Every declared owner must reference a real graph node. Different owners may occupy neighboring regions, never ambiguous overlapping categorical territory. A component can contain many operations; several ornamental appendages may share one real operation owner. Such appendages are graphical repeats and do not increase the node count.

## Safe geometry and exact attachments

For a regular material spine gamma(u), use the geometry review's transported frame T,N1,N2. Sweep a tube S(u,v)=gamma(u)+r(u)[cos(2pi*v)N1+sin(2pi*v)N2]. Ribbons replace circular v with v in [-1,1]. A chamber uses sphere charts with positive axes; an elliptical loop has centerline gamma(u)=(a cos(2pi*u), b sin(2pi*u),0). Its speed is at least 2pi*min(a,b). Local curvature is bounded by max(a,b)/min(a,b)^2, so require tubeRadius*thatBound < .45. This local tube constraint does not establish distant-part separation in arbitrary assemblies.

Use a cubic Bezier spine gamma(u)=sum(B_i^3(u) P_i). Approve it only when every derivative control vector 3(P_(i+1)-P_i) has projection at least eta on one declared unit axis. Convexity of quadratic Bernstein weights then establishes gamma'(u)·axis >= eta, hence regular speed >= eta. This restricted class makes a useful first implementation and avoids a sampling-only cusp certificate. Unrestricted Beziers can wait for an interval derivative validator.

Child roots are defined by a socket transform, not approximate screen-space proximity:

    W_child(t) = W_parent(t) F_socket(t) R_hinge(t) T_root
    R_hinge(t) = exp(axis_hat * amplitude * boundedDriver(t))

The child rest origin is exactly the socket origin. A hinge's rotation pivot stays there. Deform the local component and socket through the same shared parent map; never add separate world-space root waves. Neighboring surfaces can visually overlap at a joint without pretending they are a single smooth manifold. First release uses a translucent collar to conceal the join and explicitly calls it an assembly. Smooth watertight blending requires a later geometric union contract.

Suggested normalized bounds: component length .12–1.2, tube radius .015–.16, chamber axes .04–.35, fin span .12–.65, fin width .025–.24, ellipse axes .15–.55, hinge amplitude 0–.25 radians, geometric perturbation sum <=.06. Parent depth <=4; sockets separated by at least .07 material arc length unless explicitly a paired bilateral hinge. Attachment-tree local transforms have no scale <=0 and no arbitrary expression strings.

Closed primitives require periodic centerline/width/frame/material/lighting and derivative agreement. Cap poles use cap charts and stable ownership. An open spine's root/tip labels survive reversal: renderer may not silently reverse u to simplify a pose. Reuse the geometry proposal's seam-corrected transport frame for loops, including holonomy correction.

## Deterministic graph-to-body compilation

1. Validate the task DAG first. Compute topological levels, role groups, degree, merge nodes, genuine forks, outputs, and a deterministic dominant source-to-output path. Resolve ties using stable operation IDs or ordered-input index; make the choice explicit in the compiled source.
2. Choose one root spine from normalized depth. Place actual path operations in monotone u order. Represent off-path operations with compact chambers at their dependency depth, clustering peers into at most three major masses. All 64 operations can be shown by tissue partitioning without allocating 64 large components.
3. Genuine fanout contributes unequal branch spines; merging contributes a gathering chamber. A designer/compiler grammar rule may choose a loop collar for a merge motif. Label it as a **visual motif**: a closed anatomical loop is not a computation cycle or a retry instruction. Repeat annotation is still shown separately.
4. Outputs may receive one compact terminal chamber; directional literal-to-result chains can receive a tail. Quote/reconstruction nodes receive small inner tissue regions, not a huge competing shell. Optional fins are chosen by bounded structural descriptors and authored aesthetic seed; they are aesthetic, not invented actions.
5. Build ownership regions from actual node IDs using monotone depth bands and stable peer lanes within each component. Every dependency filament connects its two actual operation anchors. Colors remain the shared role palette; scalar lens bindings still read only a matching recorded task occurrence.
6. Solve a coarse composition: dominant root mass plus at most two large secondary masses, one asymmetry, paired structures with related gesture. Projected margins and empty regions around branches/loop holes are acceptance criteria, not proof of beauty. Fallback simplifies branches and shrinks secondary surfaces deterministically; never silently removes program nodes or edges.

Normalize descriptors by resource-bound constants, not by whichever specimens happen to be displayed. Traits may use depth, fork distribution, input/output ratio and source-byte digest. A hash can break aesthetic ties, but does not supply semantic authority. Hash-to-parameter mapping must be bounded and low-frequency: use a few values to select lean, branch proportion or chamber eccentricity, not independently perturb every vertex.

Generated anatomy is committed into canonical program source. A reproducible compiler version plus seed supports regeneration, but a hidden version-dependent UI choice must not silently alter an emitted program. The exact AST remains recoverable through both genomes. A phenotype is intentionally many-to-one; no finite gallery promises every arbitrary source a perceptually unique body. Novelty comes from component arrangements, proportions, attachments, ownership bands and gesture together, with collision checks against prior silhouettes if desired. A uniqueness score is an aesthetic diagnostic, never an exact-source identity test.

## Three generated composite examples

The companion SVG/JSON experiment demonstrates three assemblies compiled from three different structural motifs using the same bounded primitives. It is a schematic prototype, not a production renderer or executable thought compiler.

1. **Reserve bearer:** a deep single spine carrying an eccentric belly chamber, one thin upper cap and two tapered trailing appendages. A serial budgeting motif determines monotone anatomy; only one large mass dominates. It is not the existing seed/filament preset because chambers and independently attached open components are explicitly assembled.
2. **Fork crown:** a rooted trunk with three unequal branching spines, terminal paired chambers and a quiet membrane apron. An actual fanout motif determines branch count and placement, rather than scattering decorative coral strands. The tree supports deterministic inherited motion and root coincidence.
3. **Confluence glider:** a short trunk, gathering chamber, two hinged fin sheets and a continuous elliptical collar. A merge motif gives the central chamber; the collar is an authored visual gathering motif. It combines open sheets, a capped body and a genuinely closed surface without claiming the computation DAG contains a cycle.

All body components retain explicit parent/root relationships and operation owners. Adding an input branch or removing a merge modifies the assembly deterministically. Changing animation phase modifies no owner, graph node, exact source or executed result.

## Budgets, rejection and first implementation

Cap 16 components, four attachment levels, three major masses, four children per attachment, eight branch appendages, four loops and four fins. Maximum total sampled surface vertices 24,000 across the whole animal; crest vertices <=1,806 shared; operation anchors <=64, exact dependency overlays <=512 subject to runtime limits. Minimum per-component allocation 128; distribute the rest by deterministic rest-area weights. If minimum allocations plus anchors exceed the budget, reject or recompile fewer aesthetic components rather than truncate ownership. Avoid each component independently requesting 24,000 samples.

Reject unknown keys/constructors; nonfinite parameters; nonpositive dimensions; zero-length/cusp spines; unknown or forward/self parent references; repeated component IDs; invalid domains/sockets; missing/unknown operation owners; attachment-depth overflow; incompatible circle seam modes; and budgets exceeded. Geometry bounds must be analytic for approved primitives. Projected tangent collapse under camera rotation is not a 3D geometry error. Distal intersections can be intentionally translucent, but claims of embedded topology require explicit nonadjacent separation tests and cannot follow from merely bounded coordinates.

First implement **one monotone cubic trunk + ellipsoid chamber + attached tapering spine**, with exact sockets and shared gesture map. Compile two DAGs into different attached bodies and expose click-to-owner mapping. Next add a fin with one bounded hinge. Then add the closed elliptical collar with complete seam/ownership contracts. This produces genuinely new assembled organisms before creating more arbitrary presets. Keep current ten skins as legacy demonstrations while the experimental grammar earns its own rendering and formal contracts.

Validate exact root coincidence over full motion; primitive regularity; finite normals; seam derivatives; cap ownership; deterministic phase seek; source-changing authoring versus source-preserving view controls; role/lens invariants; full-graph inspectability; budgets; quine and both genome recovery identities. Review grayscale/contact sheets at multiple phases, small thumbnails and a 10-second film. Structural novelty does not automatically mean a graceful lifeform.

Runnable schematic: `python research/thought-lifeform-03-demo.py` generates the three motif examples plus structural anatomy for workstream 1's validated seven-node rooftop-planter program when available. `thought-lifeform-03-runnable-task-anatomy.json` includes all seven real operation owners and a 24,000-vertex aggregate allocation. The three standalone schematic fixtures deliberately omit executable operator parameters; they are not advertised as runnable programs. The same compiler consumes the fully executable workstream 1 graph. Initial grammar ceilings align with the formal review: 16 components, depth 4, parent fanout 4.
