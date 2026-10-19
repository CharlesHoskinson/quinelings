The execution response is a pure observational field on an already authored body. `WovenBody.frame` and `LifeformFamilies.frame` keep today's geometry when `execution` is omitted, and otherwise deform that geometry by a closed seven-field contract projected from a Sherlock CEK step or a QDL task step. The field never runs the program.

# Live program execution coupling

Read-only inspection of `woven-body.js`, `lifeform-families.js`, and `designer8_quineling.js`, plus the CEK step contract in `DESIGNER_SPEC.md` and the passive-view rule in `docs/DESIGN-LANGUAGE.md`. Nothing in the repository was modified. The formulas below are a specification, not a claim that Lean or Quint has already checked them.

## 1. What the three code paths do today

`WovenBody.frame(body, phase, {budget, crests, reuse})` dispatches on the compiled record:

| Mechanism | Framer | Active chart |
| --- | --- | --- |
| `logarithmic-mantle`, `toroidal-weave`, `phyllotaxis-fan` | `LifeformFamilies.frame` | Two-parameter ribbon. Family caustics are the projected-compression grid (`material.rows = 48`, `columns = 15`). |
| `pleated-braid`, `lorenz-flow` | Generic `frame` | `chartAt` plus signed projected Jacobian \(n_z\). Lorenz replaces the spine with a Catmull-Rom window on a fixed RK4 orbit. |
| `recursive-affine` | `recursiveFrame` | Contractive branch charts. Scroll Jacobian zeros are the caustics. |
| `recursive-julia` | `juliaFrame` | Smoothed escape field of \(z\mapsto z^2+c\). Contours are marching-squares level sets. |
| `clifford-flow` | `cliffordFrame` | Density of the Clifford map. Crests are forward images of \(\det DF = 0\). |

Ownership is a partition of each component's \(u\in[0,1]\): patches meet at endpoints, every interior sample has one owner, and \(u=1\) belongs to the last patch. That convention is already enforced by `validate`.

Designer 8 does not pass execution into `frame`. It bakes an idle phase ring, then tints by `activeNodeIdx`, slows `omega` with fuel, lifts the root by call depth, and recolors terminals (`A080` Done, `A084` Exhausted, `A082` / `A140` / `A225` Rejected). Those are photometric and rigid-body cues. They do not move the chart, the Jacobian zeros, or the Lorenz window.

Presentation phase and execution time stay distinct. Framing with an execution record evaluates no kernel and writes no task trace.

## 2. Contract

```javascript
execution = {
  activeOwner,   // integer in [-1, nodeCount)
  nodeEnergies,  // length nodeCount, each entry in [0, 1]
  stackRatio,    // [0, 1]
  fuelRatio,     // [0, 1]
  stepImpulse,   // [0, 1], already the quintic H(z)
  outcome,       // 'Running' | 'Done' | 'Rejected' | 'Exhausted'
  seamPulse      // [0, 1]
}
```

Closed object: exactly these seven fields. `activeOwner = -1` means no operation is current. `nodeEnergies[i]` is that operation's resting activation. `stackRatio = 1` is a full continuation stack relative to `stackLimit`. `fuelRatio = 1` is a full tank relative to the trace's initial fuel. `stepImpulse` is position inside the current step. `seamPulse` is the pulse's position across the active patch.

`execution` omitted or `null` is the idle frame. The sampler then uses the authored formulas and the existing phase cache, so the `Float32` tissue matches a build that has no execution argument.

Malformed execution throws `WovenBody: execution contract` before any sample is written. The throw is deterministic and allocates no geometry.

### 2.1 Quintic step clock

Designer 8 already uses this Hermite quintic on the substep \(z\in[0,1]\):

\[
H(z)=6z^5-15z^4+10z^3=z^3(6z^2-15z+10)
\]

\[
1-H(z)=(1-z)^3(6z^2+3z+1)
\]

So \(H(0)=0\), \(H(1)=1\), and \(0\le H(z)\le 1\) on \([0,1]\). The factor \(H'(z)=30z^2(1-z)^2\) vanishes at both ends, and so does \(H''\). Concatenated steps are \(C^2\) in time. The projector stores `stepImpulse = H(z)`, not the raw fraction.

### 2.2 Projector from a CEK step or a QDL task step

The projector is pure. It reads `stepState` and the compiled node table. It does not call `kernels.js` or the Sherlock machine.

Precedence:

1. Control expression. `step.after.control.exprId`, else `step.before.control.exprId`, mapped through `exprToNodeId` to a node id, then to an owner index in `body.nodes`.
2. QDL task edge. `step.node` or `step.edge.to` looked up in `body.nodes`.
3. Otherwise `activeOwner = -1`.

Stack depth:

1. `step.after.frames.length` when `frames` is an array. This is the CEK continuation stack.
2. Else `step.after.activeCalls.length`. This is the call-chain summary Designer 8 uses for the vertical lift.
3. Else `0`.

`stackLimit` is `step.after.stackLimit` when that is an integer \(\ge 1\), else `16` (the bench default). \(\mathrm{stackRatio}=\min(1,\mathrm{depth}/\mathrm{stackLimit})\).

Fuel. Let \(f^-=\) `step.before.fuel` or else `step.after.aux2.fuel.before`. Let \(f^+=\) `step.after.fuel` or else `aux2.fuel.after`. Let \(f_0\) be `trace.steps[0].before.fuel`, else \(f^-\), else `1`.

\[
f_{\mathrm{live}}=f^-+(f^+-f^-)\,H(z),\qquad \mathrm{fuelRatio}=\mathrm{clamp}\!\left(\frac{f_{\mathrm{live}}}{\max(1,f_0)},0,1\right)
\]

Outcome, first match:

| Condition | `outcome` |
| --- | --- |
| `trace.outcome.kind === 'Done'` or rule `A080` / line 80 | `Done` |
| kind `'Exhausted'` or `A084` / line 84 | `Exhausted` |
| kind `'Rejected'` or line 82, 140, or 225 | `Rejected` |
| otherwise | `Running` |

`A140` is the frame-limit refusal. `A225` is the checked primitive fault. Both are rejections. Publishing a terminal spends no fuel; the geometric response still keys off `outcome`.

`nodeEnergies` starts at 0. The active owner is set to 1. Each continuation frame whose `originExprId` maps to an owner \(i\) at stack slot \(s\) (top is 0) receives

\[
E_i \leftarrow \max\left(E_i,\ 0.55\left(1-\frac{s}{\mathrm{stackLimit}}\right)\right)
\]

The unique graph predecessor of the active node, when it exists, receives \(\max(E_i, 0.35)\). Energies stay in \([0,1]\).

`seamPulse = H(z)`. A finite `stepState.seamPulse` overrides it.

QDL task traces that have no CEK fuel use `fuelRatio = 1` and `stackRatio = 0`. A `retry` / `budget` status string `exhausted` maps to `Exhausted`. A kernel rejection maps to `Rejected`. A successful task output maps to `Done` only on the last recorded edge.

Dispatch uses `body.record.mechanism`. A Sherlock preset name does not override the compiled chart.

## 3. Shared operators

Let \(g=1\) when execution is present and \(g=0\) when it is idle. Every amplitude below is multiplied by \(g\). Idle samples skip these operators entirely.

Constants, all dimensionless and absolute in woven coordinates:

| Symbol | Value | Role |
| --- | --- | --- |
| \(\eta_n\) | \(0.040\) | Normal soliton budget |
| \(\eta_s\) | \(0.020\) | Seam pulse budget |
| \(\eta_L\) | \(0.018\) | Done phase-lock budget |
| \(\eta_X\) | \(0.100\) | Shear prefactor |
| \(\mu_\star\) | \(0.55\) | Deepest furl, retraction factor \(0.45\) |
| \(\kappa_E\) | \(0.18\) | Exhausted contraction |

Worst-case additive displacement has \(\ell_\infty\) norm \(0.128\). Inward retractions add nothing to the idle bounding box.

### 3.1 Active patch, Hann window, traveling soliton

Let the active owner be \(o_\star\), and let \(P=[u_0,u_1]\) be a territory of that owner, with \(\Delta=u_1-u_0>0\). The half-open convention matches `ownerAt`: a nonterminal patch owns \([u_0,u_1)\), and the patch with \(u_1=1\) owns \([u_0,1]\).

\[
s=\mathrm{clamp}\!\left(\frac{u-u_0}{\Delta},0,1\right)
\]

\[
W(s)=\sin^2(\pi s),\qquad W(0)=W(1)=0,\qquad W'(s)=\pi\sin(2\pi s)
\]

\(W'(0)=W'(1)=0\). Exterior of the patch is \(0\).

\[
G(\xi)=\mathrm{sech}^2(8\xi)=\left(\frac{2}{e^{8\xi}+e^{-8\xi}}\right)^2
\]

\[
\mathrm{Sol}(k,u)=\begin{cases} W(s)\,G(s-\iota) & \text{owner}(k,u)=o_\star \text{ and } u\in P \\ 0 & \text{otherwise} \end{cases}
\]

\(\iota\) is `stepImpulse`. The peak enters at the patch's incoming seam when \(\iota=0\) and leaves through the outgoing seam when \(\iota=1\). Because \(W=W'=0\) at the endpoints, \(\mathrm{Sol}\) is \(C^1\) across owner boundaries even though \(G\) is not zero there. It is not \(C^2\): \(W''(0)=2\pi^2\).

\(0\le W\le 1\) and \(0\le G\le 1\), so \(0\le\mathrm{Sol}\le 1\). Partition disjointness gives at most one patch firing for a sample.

Resting energy uses the same window on every patch of owner \(o\), without the traveling peak:

\[
R(k,u)=E_o\,W(s)
\]

Normal displacement, with \(\hat n\) the unit chart normal of section 4:

\[
\delta_n=\eta_n\,(0.75\,\mathrm{Sol}+0.25\,R)\,\cos(\pi v)
\]

\[
\mathbf p \leftarrow \mathbf p + \delta_n\,\hat n
\]

\(|\cos(\pi v)|\le 1\) and \(0.75\,\mathrm{Sol}+0.25\,R\le 1\), so \(|\delta_n|\le 0.040\).

### 3.2 Jacobian caustic flare

Width pinch depends on \(u\) only:

\[
\rho(u)=1-0.16\,\mathrm{Sol}(k,u)\in[0.84,1]
\]

Apply \(\rho\) to the transverse half-width before the projected Jacobian. If the base scalar is \(J_0(u,v)\) and the pinched scalar is \(\rho(u)\,J_0(u,v)\) with \(\rho(u)\ne 0\), then

\[
\rho(u)\,J_0(u,v)=0 \iff J_0(u,v)=0
\]

Zero loci are unchanged. \(|J|\) falls, so the existing compression

\[
\mathrm{comp}=\min\left(8,\frac{1}{0.12+|n_z|/\mathrm{ref}}\right)
\]

rises on the active patch. Photometric flare, after compression is measured:

\[
\mathrm{comp}'=\min(8,\ \mathrm{comp}\,(1+1.75\,\mathrm{Sol}))
\]

\[
\alpha'=\min(1,\ \alpha\,(1+0.85\,\mathrm{Sol}+0.35\,E_o))
\]

Caustic polylines are built from the pinched chart, then displaced by the same \(\Delta\) as the tissue. Their parameter \(v\)-roots stay the roots of \(J_0\).

### 3.3 Seam pulse

On the active patch,

\[
\Pi(u)=\exp\left(-\left(\frac{s-\mathrm{seamPulse}}{0.08}\right)^2\right)
\]

\[
\delta_s=\eta_s\,\Pi(u)\,\mathrm{Sol\ support\ mask}
\]

\[
\mathbf p \leftarrow \mathbf p + \delta_s\,\hat n
\]

\(|\delta_s|\le 0.020\). This is the one visible pulse along the active connection. Idle motion does not emit it, because \(g=0\).

### 3.4 Stack retraction

For a body point \(\mathbf p\) and an attachment point \(\mathbf a\) that lies on the idle body,

\[
\Lambda=1-g\,(1-\lambda)\,\mu,\qquad \mu\in[0,0.55],\ \lambda\in[0,1]
\]

\[
\mathbf p'=\mathbf a+\Lambda(\mathbf p-\mathbf a)=(1-\Lambda)\mathbf a+\Lambda\mathbf p
\]

Then \(\Lambda\in[0.45,1]\). If both \(\mathbf a\) and \(\mathbf p\) lie in a convex set, so does \(\mathbf p'\). An axis-aligned portrait box is convex, so stack unfurling stays inside the idle portrait. \(g=0\) or \(\lambda=1\) leaves \(\mathbf p\) fixed.

Per mechanism, \(\lambda\) and \(\mathbf a\) are section 4. Full stack (\(\mathrm{stackRatio}=1\)) is constructed so \(\lambda=1\) on every authored branch, which restores the idle pose.

### 3.5 Fuel, Done lock, Rejected / Exhausted shear

Let \(\rho_f\) be `fuelRatio`, \(\iota\) be `stepImpulse`, and \(\phi\) the presentation phase already passed to `frame`.

\[
\lambda_D=\mathbf{1}_{\mathrm{Done}}\cdot\iota,\qquad
\lambda_R=\mathbf{1}_{\mathrm{Rejected}},\qquad
\lambda_E=\mathbf{1}_{\mathrm{Exhausted}}
\]

\[
\kappa_f=(1-\rho_f)^2\in[0,1]
\]

Phase-lock is an additive standing wave on the response normal. It does not rewrite authored frequencies, so the idle phase sweep remains the idle phase sweep.

\[
\delta_L=\eta_L\,\lambda_D\,\sin(n\phi)\,\cos(2\pi u)
\]

\[
\mathbf p\leftarrow\mathbf p+\delta_L\,\hat n
\]

The integer \(n\) is the mechanism harmonic in section 4. \(|\delta_L|\le 0.018\).

Bifurcation shear, in woven coordinates \((x,y)\):

\[
q(x,y)=\frac{1}{1+x^2+y^2}
\]

\[
\delta_x=\eta_X\,(\lambda_R+0.35\,\lambda_E)\,\kappa_f\,q(x,y)\,y\,\sin(\pi v)
\]

\[
\delta_y=\eta_X\,(\lambda_R+0.35\,\lambda_E)\,\kappa_f\,q(x,y)\,x\,\sin(2\pi u)
\]

\[
|y|\,q(x,y)\le |y|/(1+y^2)\le 1/2
\]

because \(1+y^2-2|y|=(1-|y|)^2\ge 0\). The same bound holds in \(x\). With \(\eta_X=0.100\) and \((\lambda_R+0.35\lambda_E)\kappa_f\le 1\),

\[
|\delta_x|\le 0.050,\qquad |\delta_y|\le 0.050
\]

Rejected is the full shear. Exhausted keeps a smaller shear and adds the contraction

\[
\mathbf p\leftarrow \mathbf c+(1-0.18\,\kappa_f\,\lambda_E)\,(\mathbf p-\mathbf c)
\]

where \(\mathbf c\) is the idle portrait center. The scale factor lies in \([0.82,1]\), so this is the same convex retraction and stays in the idle box. Clifford multiplies \(\delta_x,\delta_y\) by \(\mathrm{sign}(\widehat\lambda)\), where \(\widehat\lambda\) is the compiled `lyapunovEstimate`. A nonpositive exponent produces the opposite shear; a zero exponent drops the shear.

Done and the two fault outcomes are mutually exclusive by the projector's first-match table.

### 3.6 Order inside one sample

1. Authored chart at \((k,u,v,\phi)\), including the Lorenz index of section 4.4 when that mechanism is live.
2. Transverse pinch \(\rho(u)\).
3. Jacobian, compression, owner. Owner is computed before any deformation and is never rewritten.
4. Stack retraction about \(\mathbf a\).
5. Exhausted contraction about the portrait center.
6. Add \(\delta_n\hat n+\delta_s\hat n+\delta_L\hat n+(\delta_x,\delta_y,0)\).
7. Multiply alpha by the flare factor and clamp to \([0,1]\).

Crest vertices of the same \((k,u,v)\) take steps 4–7. Steps 4–6 are skipped when \(g=0\).

### 3.7 Cache and the Designer 8 phase ring

`basis` caches on presentation phase. A live execution key joins that cache identity: quantized `stackRatio`, `fuelRatio`, `outcome`, `activeOwner`, and `stepImpulse` in steps of \(1/32\). The idle key is the constant `0`, so the idle cache behavior is unchanged.

The Designer 8 ring remains an idle bake (`execution = null`). Rebaking per CEK state would be \(8\times 8\times 4\times 64\times 8\) buckets. The hot path stores `u`, `v`, and owner beside the idle SoA and evaluates section 3 from a 64-entry \(\mathrm{sech}^2\) table and a 64-entry Hann table. Quantized \(\xi\) and \(s\) index those tables. Fit uses one precomputed enclosure: the idle portrait expanded by \(0.128\) on every side (`EXECUTION_FIT_PAD`). The scale stays constant
