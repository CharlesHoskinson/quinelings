# Symbiogenesis: chimeric WovenBody combinations

Read-only inspection of `qdl-v1-offspring.js`, `woven-body.js`, and `lifeform-families.js`. No repository file was modified. The task assembler remains the authority for graphs, types, and lineage. `WovenBody.combine` is a geometric layer that consumes that evidence. This session did not execute the Lean file or the Quint model.

Current `build` in `qdl-v1-offspring.js` still authors anatomy with `Anatomy.generateV1` and `D.create(family)`. It never calls `WovenBody.author`. A chimera is a new record, model `woven-field-chimera-experimental`, attached later as presentation geometry. It does not rewrite the child task.

## 1. What the four recipes already do

Policy string: `qdl-v1-collaboration-experimental-1`. Parents are an inert length-2 array of canonical admitted v1 sources, same `registry`, `registryDigest`, and `canonical`. Closed recipe objects:

| `kind` | Closed fields | Task effect | `lineage.seam` | `classification` | `repeats` |
| --- | --- | --- | --- | --- | --- |
| `compose` | `donorOutput`, `recipientInput` | Parent 0 exported output replaces a parent 1 **runtime input** | populated | `causal-integration` | 1 |
| `mate` | `donorNode`, `replaceNode` | Parent 0 node replaces a parent 1 **literal** | populated | `causal-integration` | 1 |
| `merge` | none | Both DAGs kept; generated `joined` report | `null` | `parallel-report` | 1 |
| `body` | `base` ∈ {0,1} | Exact copy of the base task, original ids | `null` | `body-only` | base repeats |

Graph-changing recipes require `sourceHash` inequality. Every inherited node is renamed in **topological** order, not source order:

```text
parent role r, topo index i  →  p{r}n{i}
input port name              →  p{r}_{originalName}     (length ≤ 64, no '.')
```

`merge` labels are `a0..` for parent 0 outputs, then `b0..` for parent 1, at most 16 combined outputs, at most 64 nodes. The generated node is `{id:'joined', op:'report'}`. The diagnostic `repeats-reset` states that merge is a parallel report, with no causal seam.

`compose` / `mate` import the donor predecessor closure and the full recipient, delete the replaced node, retarget its consumers to the donor id, then prune to the ancestor closure of the recipient outputs. The donor closure must be free of `action`. Recipient `action` nodes and the ancestor cone of each action's guard port (`inputs[0]`) are protected before and after pruning. The seam type test is exact:

```text
canonical(normalize(donor.type)) = canonical(normalize(recipient.type))
```

Downstream closure starts at `donorId`. The integration witness is the first remaining node whose id begins with `p1n`, whose op is neither `input` nor `literal`, and which lies downstream of the donor:

```text
seam = {
  donorNode,          // live p0n*
  recipientNode,      // removed p1n* (absent from the live graph)
  type,               // donor type, copied
  integrationNode     // live p1n*
}
```

`body` copies the base task, ports, and thought. Node ids stay the base ids. There is no `p0n*` renaming and no seam.

Six integer traits in `[-1000,1000]` are drawn per name by `SHA256(seed ∥ name) mod 3` toward parent 0, parent 1, or the floor midpoint. Those draws feed anatomy today. `combine` reuses the same integers only as clamped continuous multipliers on an existing woven record when `kind === 'body'`.

## 2. Mechanism dispatch that a chimera must preserve

`WovenBody.author` chooses one mechanism for a whole graph. Priority is fixed:

```text
guards > 0                                          → clifford-flow
effects = 0 ∧ fanout ≥ 2 ∧ hasTreeBranch            → recursive-affine
effects = 0 ∧ hasCoupled                            → lorenz-flow
effects = 0 ∧ fanout ≤ 1 ∧ depth ≥ 4 ∧ hasPipelineFold → pleated-braid
fanout ≥ 2                                          → recursive-julia
effects > 0                                         → toroidal-weave
convergence ≥ 2                                     → logarithmic-mantle
otherwise                                           → phyllotaxis-fan
```

`hasTreeBranch` matches `choose|Apply|Box|retry`. `hasCoupled` matches `consensus|reconcile|evidence|evidenceFresh|compareValues|Score|Quote|Decode`. `hasPipelineFold` matches `dedupe|sort|length|select|clamp`. Guards count `guard|filter|if|condition`, plus an `action` whose first input is not a literal. Effects count `action|effect`.

So a pure coupled graph is Lorenz, a pure fan-out graph is Julia, a guarded graph is Clifford, and an effectful unguarded graph is a toroidal weave. A child graph mixes those opcodes, so a fresh `author(childGraph)` would collapse the chimera to a single mechanism. `combine` does not do that. Each live `p0n*` sample is evaluated with parent A's compiled mechanism. Each live `p1n*` sample is evaluated with parent B's.

Territory law already required by `validate`, and kept for every chimera component:

```text
for each component, sort patches by u[0]:
  patch[0].u[0] = 0
  patch[last].u[1] = 1
  patch[i].u[1] = patch[i+1].u[0]
  patch[i].u[0] < patch[i].u[1]
  every endpoint ∈ [0,1]
```

Set-cover against the live child graph: every territory node is a live node, and every live node appears at least once. The replaced recipient id has no territory. Strands of one ordinary record lie in `[8,40]`. A chimera packs at most 16 strands per lobe plus one seam or clasp strand, so the total is in `[8,33] ⊂ [8,40]`.

## 3. Charts being grafted

### 3.1 Lorenz (`lorenz-flow`)

Native vector field, constants fixed by `validate`:

\[
\sigma=10,\quad \rho=28,\quad \beta=\frac{8}{3}
\]

\[
\dot x=\sigma(y-x),\qquad
\dot y=x(\rho-z)-y,\qquad
\dot z=xy-\beta z
\]

\[
\nabla\cdot F=-\sigma-1-\beta=-\frac{41}{3}<0
\]

Initial \((x,y,z)\) each in `[-2,2]`, with \(\sqrt{x^2+y^2}>10^{-5}\). `dt ∈ [0.002,0.01]`, `burn ∈ [256,4096]`, `steps ∈ [2048,16384]`, `window ∈ [256,4096]`, and `window ≤ ⌊(steps-5)/2⌋`. Integration is RK4. The compiler rejects a non-finite state or a coordinate with absolute value `≥ 100`.

Presentation, stored on the orbit:

\[
\Pi(x,y,z)=(0.036\,x,\ 0.03(25-z),\ 0.009\,y)
\]

\[
\Pi^{-1}(X,Y,Z)=\Big(\frac{X}{0.036},\ \frac{Z}{0.009},\ 25-\frac{Y}{0.03}\Big)
\]

The ribbon is a Catmull-Rom tube on \(\Pi(\text{orbit})\) with the normal-binormal frame already in `lorenzSpine` / `chartAt`. There is no global first integral. The symbiote observable is the trapping function sampled on the orbit, then affinely normalized:

\[
V(x,y,z)=\rho x^2+\sigma y^2+\sigma(z-2\rho)^2
\]

\[
\eta_L=\mathrm{clamp}_{[0,1]}\Big(\frac{V-V_{\min}}{V_{\max}-V_{\min}}\Big)
\]

with \(\eta_L=\tfrac12\) when \(V_{\max}=V_{\min}\). Fixed points used only as a documented reference, not as the weight:

\[
C_\pm=\big(\pm\sqrt{\beta(\rho-1)},\ \pm\sqrt{\beta(\rho-1)},\ \rho-1\big)
=\big(\pm 6\sqrt{2},\ \pm 6\sqrt{2},\ 27\big)
\]

### 3.2 Clifford (`clifford-flow`)

\[
x_{n+1}=\sin(a y_n)+c\cos(a x_n),\qquad
y_{n+1}=\sin(b x_n)+e\cos(b y_n)
\]

Parameters and initial coordinates lie in `[-2.5,2.5]` and `[-3,3]`. `burn ∈ [32,4096]`, `iterations ∈ [4096,131072]`, `densityGrid ∈ [64,256]`, `criticalImages ∈ [1,16]`. Enclosure used by the compiler:

\[
|\sin(ay)+c\cos(ax)|\le 1+|c|,\qquad
|\sin(bx)+e\cos(by)|\le 1+|e|
\]

so the map image lies in \([-b_x,b_x]\times[-b_y,b_y]\) with \(b_x=1+|c|\), \(b_y=1+|e|\). Tangent propagation matches the code:

\[
DF=\begin{pmatrix}-ac\sin(ax)& a\cos(ay)\\ b\cos(bx)& -be\sin(by)\end{pmatrix}
\]

Critical curves are the zero set of

\[
\det DF=ab\big(ce\sin(ax)\sin(by)-\cos(ay)\cos(bx)\big)
\]

The observable is the compiler's 3×3 box density divided by `maxDensity`. Each cell count is `≤ maxDensity`, so the nine-cell mean is `≤ maxDensity` and

\[
\eta_C=\frac{\mathrm{density}(x,y)}{\mathrm{maxDensity}}\in[0,1]
\]

Embedding warp stays inside the existing `bounded-native-warp` box (`scale ∈ [0.2,0.5]`, `warp ∈ [0,0.16]`, `overtone ∈ [0,0.08]`, `frequency ∈ [1,4]`, `shear ∈ [-0.2,0.2]`).

### 3.3 Quadratic Julia (`recursive-julia`)

\[
z_{n+1}=z_n^2+c,\qquad c\in[-1,1]^2,\qquad \text{escape radius }=2
\]

Grid `∈ [128,256]`, iterations `∈ [32,96]`, domain a positive rectangle inside `[-2,2]^2`. Smooth escape count, as compiled:

\[
\nu=\begin{cases}
