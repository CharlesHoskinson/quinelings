# Motion grammar for generated anatomical assemblies

Reviewed the current morphology, source/view separation, formal gesture proposal and workstream 3's compositional anatomy. This extends the same four gait tags to arbitrary attached components; it does not select an existing species or claim to compile English. Implementation artifacts here are numeric research experiments only; production files remain unchanged.

## Minimal authored motion

```json
{"motion":{"gesture":{"kind":"gather","strength":0.65,"ticks":[180,180,420,220]},"follow":"soft"}}
```

Use the formal proposal exactly: `kind` is gather/unfurl/glide/hover, finite strength in [0,1], four integer ticks >=100, sum exactly 1000. Existing phase rate and periodic/quasiperiodic mode remain. `follow:"soft"` is optional, selecting a bounded compiler preset rather than editable physical constants. This sketch shows proposed fields only; it is not an assertion that the existing QDL validator accepts them.

Compiler templates supply four pose intervals with five endpoints p0,p1,p2,p3,p4, p4=p0. Each pose is a vector (log stretch sigma, body lean alpha, opening o) within sigma in [-.15,.15], alpha/o in [-.12,.12]. Strength multiplies template values. The intervals mean anticipation, principal stroke, recovery and rest. Require p3=p4 for a held rest. Interpolate with H(z)=6z^5-15z^4+10z^3. Because H',H'' vanish at 0 and 1, the complete periodic score has a C2 temporal seam, even with unequal positive intervals. The existing Lean research proves local polynomial properties; additional assembly/loop correspondence remains to be proved.

Suggested fixed templates (rows are the five endpoints; not new user-authored coordinates):

```text
gather: [(0,0,0),(-.06,-.03,-.06),(.09,.04,.08),(0,0,0),(0,0,0)]
unfurl: [(0,0,0),(-.03,.02,-.07),(.06,-.02,.10),(0,0,0),(0,0,0)]
glide:  [(0,0,0),(-.025,-.06,-.03),(.04,.08,.05),(0,0,0),(0,0,0)]
hover:  [(0,0,0),(-.025,.02,-.02),(.025,-.02,.02),(0,0,0),(0,0,0)]
```

An elegant motion consists of this one broad score and quieter tissue response, not four equally strong simultaneous oscillators. No drift/random walk, time-step state, independent cameras or spontaneous task receipts.

## Rooted hierarchy with exact moving sockets

One dominant root transform is

    D0(p,t)=R(alpha(t)) diag(exp(-sigma/2),exp(sigma),exp(-sigma/2)) p + T(t).

The determinant is one and all scales are positive. Rooted assemblies set translation to zero and rotate about their declared root. Floating assemblies may translate by <=.025*L, where L is a fixed rest-body extent, never an animated auto-fit size. Do not apply an unrelated translation to each child.

For component i with parent j, material socket s_ij, socket frame F_ij, and child rest root r_i:

    p_world,i(q,t)=P_socket,j(t) + A_socket,j(t) R_i(t) D_i(q-r_i,t)
    P_socket,j(t)=p_world,j(s_ij,t).

`D_i(0,t)=0` and each hinge rotation fixes zero, so the child root equals its moving parent socket for every phase. `A_socket,j` carries the parent's deformation/orientation at that socket. For the first implementation restrict parent maps to affine orientation-preserving transforms: composing them is exact and cheap. If later using nonlinear parent maps, evaluate the actual material socket and a well-defined local frame/Jacobian there; copying an undeformed rest frame is insufficient. The child's full surface, crests, anchors and owned tissue use the same map. A task dependency filament uses the resulting two real anchors and keeps its endpoint-pinned bend.

Finite deformations compose sequentially. Do not linearly average arbitrary transformation matrices: even two individually valid rotations can average to a singular matrix. Blend translations linearly, scales in log space, and fixed-axis joint angles inside their bounded intervals; 3D rotations may use normalized quaternion slerp with an explicit shortest-arc choice. For first release joint amplitude <=.12 radians, and enforce sum of maximum angles along any root-to-part path <=.35 radians. The grammar's depth <=4 helps but does not alone imply that path bound.

In particular, linear blend skinning can collapse or flip even when each bone transform is invertible. Do not extend the component determinant guarantee to weighted vertex skinning. Shared sockets give positional (C0) attachment continuity; smooth C1 tissue joins require separately compatible tangents/charts and cannot be inferred from root coincidence. Nor does local orientation preservation prove globally nonintersecting assembled bodies. Material owners remain indexed by unchanged rest-component coordinates before every deformation.

For a root-fixed local wave, an optional shear x'=x+a[sin(ky-phi)-sin(-phi)], y'=y, z'=z keeps origin fixed, has determinant one and an explicit inverse. Take |a*k|<=.15 and |a|<=.035*localLength. The singular values remain bounded away from zero because it is an invertible shear, although the whole assembly may still self-intersect. General root-envelope waves cannot inherit this determinant proof automatically.

## Drive, joint and passive tissue

Let the principal joint angle follow the finite gesture score. An appendage may follow with a bounded artistic delayed score g(c-delta), scaled by the same strength. This deterministic interpolation is useful but is not the exact solution of a damped harmonic ODE.

For an explicitly finite **raw-phase harmonic** drive q(t)=sum A_m sin(m*omega*t+beta_m), a genuine steady-state follower is

    r_m=m*omega/omega0
    M_m=1/sqrt((1-r_m^2)^2+4*zeta^2*r_m^2)
    delta_m=atan2(2*zeta*r_m,1-r_m^2)
    y(t)=sum A_m*M_m*sin(m*omega*t+beta_m-delta_m).

This solves y''+2*zeta*omega0*y'+omega0^2*y=omega0^2*q. Use zeta in [.75,1.5], fundamental ratio omega/omega0 in [.15,.8], at most three integer temporal harmonics, sum |A_m|<=.08*localLength. Since zeta>=1/sqrt(2), gain <=1 at every frequency, including higher harmonics, so the follower displacement remains bounded. Precompute gains/delays per source. Open appendage roots use a material amplitude envelope zero at the root; the response is computed for that bounded driver at each material coordinate. Envelope choice must satisfy geometry derivative contracts independently.

Do not feed `sin(phi+a*sin(phi))` or the piecewise gesture score directly into this finite-harmonic formula and claim exact ODE behavior. Instead layer the raw-harmonic follower as small secondary tissue motion; or document a finite Fourier approximation of the gesture and its error if a fully driven follower is required later. `motion.follow:"soft"` can initially compile to one raw sine mode to keep its contract simple.

## Size and complexity normalization

Use fixed rest-local lengths and rest-area weights, not screen pixels or sampled current bounding boxes. Joint angles remain size-independent. Root translations scale by overall L; tissue displacements scale by local component length. Let w_i be normalized rest-area weights, sum w_i=1, and let a_i be normalized tissue amplitudes. Set sum(w_i*a_i^2)<=B^2 with B=.05, plus individual a_i<=.08. Thus increasing from three to sixteen parts does not increase average motion energy merely because there are more moving parts. This RMS budget is a presentation measure, not mechanical energy or an aesthetic theorem.

Cap major pose amplitude separately from tissue. One dominant axis gets full gesture strength; large secondary masses get .6–.8; delicate tips get small absolute displacement but larger delay. Avoid multiplying independent full-strength global and local breathing controls. The body transform's bound and positive determinant survive, but arbitrary added displacements need their own nonfolding/regularity checks.

## Choosing a gait from real task motifs

Gait selection is an explicit authored design convention:

- A serial pipeline suggests **glide**: directed trunk inclination followed by a tapered continuation.
- Fanout suggests **unfurl**: the root remains stable while branch openings widen in a deliberate hierarchy.
- Many inputs converging to one result suggest **gather**: a central chamber briefly collects inward and releases.
- A compact low-depth task suggests **hover**: a small centered stroke and clear rest.

Choose by fixed normalized topology rules, stable tie-breaking and committed compiler identity. A designer may choose a different valid gait. Operation type does not imply subjective mood, intelligence or intent. A closed anatomical loop does not imply a compute loop. Gait is attached to the program's designed phenotype, not evidence of an execution or authorization. Role/scalar colors and actual task overlays retain their separate contracts.

## Three first generated assembly demonstrations

1. **Reserve bearer:** gather [180,180,420,220], strength .6. Belly and trunk share one stretch; its two open continuations follow at lower amplitude and longer delay. No detached cap movement.
2. **Fork crown:** unfurl [220,170,430,180], strength .55. The trunk root is fixed. Three branch hinges open with slightly staggered material timing, all tip chambers inherit their complete parent transform. Rest clearly holds the branches before the next anticipation.
3. **Confluence glider:** glide [180,170,450,200], strength .65. Its central chamber and collar share the principal pose; fins open through two opposed bounded hinges and recover slowly. The collar gets a low-amplitude integer spatial wave rather than spinning the whole creature. The wide fins and hollow collar distinguish it from a ten-family skin.

Use the compositional anatomy prototype's real part recipes. First release should show the same arbitrary assembled body at 12 phases, plus a 10-second film. The prototype contact sheet alone cannot establish pleasant motion.

## Loops, time and reduced motion

Closed material coordinates use integer spatial windings sin(2*pi*m*u+phi), m integer. All socket/chart/material/normal/light contracts agree across seams. A loop rooted at one socket may use a periodic displacement envelope 1-cos(2*pi*u), which vanishes with first derivative at the socket; its derivative budget must still be checked. A linear delayed term delta*u is not periodic across a closed seam and must not be used there. Use delta*sin(2*pi*u) or an integer-winding phase instead.

Periodic mode: the gesture and every raw temporal harmonic repeat after one declared period, with no history. Quasiperiodic mode: independent irrational secondary phase is bounded and random-access; do not advertise a finite exact loop. The broad four-stage gesture may repeat while fine tissue changes. Phase seeks reproduce the same pose/owners; restart from source without simulating preceding frames.

Reduced motion selects one validated open, readable rest pose per gesture; freeze all geometric phase and pulse position. A source-authored score does not automatically make phase zero a good thumbnail. Choose a fixed **view** presentation phase from the compiler's still-pose convention; this changes no program identity. Pose evaluation never advances the interpreter. Replay markers refer only to the recorded matching-source node/edge/occurrence; pause and seeking cannot fabricate receipts or send pulses along selected but unexecuted dependencies.

## Validation and implementation order

`thought-lifeform-06-experiment.py` numerically checks score bounds/loop seam, positive unit determinant, rooted hierarchical socket coincidence, finite raw-harmonic response gain and ODE residual. It is an independent formula prototype, not a floating-point refinement proof of the renderer. No new task execution is included.

Observed numeric results for 129 random-access phases of each generated assembly: maximum socket error 0, maximum unit-determinant error 5.55e-16, maximum response gain 1, and centered finite-difference ODE residual 2.99e-9. The JSON contains all 387 pose records. These establish behavior of this deliberately restricted test construction; attachment checks do not certify the existing production renderer, and the experiment does not prove C1 joins or global separation.

First implement the four-stage score and affine hierarchy on the three example assemblies. Then give fins bounded hinges and open spines one soft raw-harmonic follower. Add loop waves only after spatial seam tests. Measure frame time on 16-part bodies and reuse per-part transforms instead of recomputing the score for every vertex. Test 12 phase frames, full videos, every boundary tick, extreme strength/periods, phase seeks, socket errors, global determinant/Jacobian lower bounds where claimed, material-owner stability, reduced motion, exact source/genome/quine identities and no task count changes from rendering. Root coincidence does not prove global nonintersection; employ conservative separation checks when a body must remain embedded.
