# Higher-Order Fractals and the Strange-Loop Ouroboros

Proposal only. This report does not modify the repository. It specifies a backward-compatible upgrade of the finite `recursive-julia` and `recursive-affine` constructions in `woven-body.js`, a shared hook for `lifeform-families.js`, and the passive map `WovenBody.strangeLoop(body, phase)`.

The admitted records stay finite, seeded, and operation-owned. Contours, territories, and the constructor quine are unchanged when the new optional blocks are absent. With those blocks absent, the height and the caustic weight reduce to the formulas already compiled in `woven-body.js`.

## 0. Foundations this upgrade keeps

`core.js` builds the task quine

```text
constructor = emit(makeApply(makeRun(makeQuote(var x)), makeQuote(var x)))
body       = λx. seq(repeat(n, task(quote(payload))), constructor)
program    = apply(run(quote(body)), quote(body))
```

`QDL.Quine.program_emits_itself` is the semantic fixed point: evaluation emits exactly that program. `strangeLoop` is a geometric picture of the same tower. It does not call `execute`, `run`, or `task`.

`woven-body.js` already does three things the upgrade rides on.

- Quadratic Julia tissue. `juliaValue` iterates \(z \mapsto z^2+c\) with escape radius \(2\), and `compileJulia` extracts marching-square contours of that finite escape field. Ownership is a strand/row partition through `juliaOwner` and `ownerAt`.
- Contractive branch charts. Every authored rule has scale in \([0.35,0.67]\). Child addresses are parent pose plus attach, bend, and roll. Caustic polylines are the zero set of the projected Jacobian \(J=X_u Y_v-X_v Y_u\).
- Exact key validation. `keys(...)` rejects unknown fields. Any new source field needs a matching `validate` clause. Omitting the field must keep today's records valid.

`qdl.js` keeps motion on a separate clock (`motion.clock = 'separate'`, `reducedMotion = 'freeze'`). Phase in the formulas below is that visual clock. It does not advance the task.

The finite Julia field is an escape-time sample on a grid, not a theorem about the infinite Julia set. The caustic weight is a bounded function of \(J\), not a radiative-transfer solution. The trefoil filament is a sampled curve through two owned anchors, not a proof that the drawn pixels are a smooth knot.

## 1. Equations and bounded domains

### 1.1 Complex potential

Let \(d\in\{2,3,4\}\) and \(c\in\mathbb{C}\) with \(|\operatorname{Re} c|\le 1\), \(|\operatorname{Im} c|\le 1\). The higher-order map on the sample plane is

\[
p_{d,c}(z)=z^d+c.
\]

For \(d=2\) the orbit is the algebraic iteration already in `juliaValue`:

\[
x_{k+1}=x_k^2-y_k^2+\operatorname{Re} c,\qquad y_{k+1}=2x_k y_k+\operatorname{Im} c.
\]

For \(d\in\{3,4\}\), with \(\rho_k=|z_k|\) and \(\phi_k=\operatorname{Arg} z_k\in(-\pi,\pi]\),

\[
z_{k+1}=\rho_k^d\bigl(\cos(d\phi_k)+i\sin(d\phi_k)\bigr)+c.
\]

The escape test stays \(|z_k|>R\) with the admitted constant \(R=2\). Let \(n\) be the first index with \(|z_n|>2\), and \(n=N\) if no such index exists inside the iteration budget \(N\).

The Douady–Hubbard potential and its harmonic conjugate, truncated at escape, are

\[
G_N(z)=\begin{cases}
d^{-n}\log|z_n| & \text{if the orbit escapes at }n,\\
0 & \text{if }|z_k|\le 2\text{ for all }k\le N,
\end{cases}
\qquad
\theta_N(z)=\begin{cases}
d^{-n}\operatorname{Arg}(z_n) & \text{if the orbit escapes},\\
0 & \text{otherwise.}
\end{cases}
\]

On the basin of infinity, \(G_c=\lim_{n\to\infty} d^{-n}\log^+|p^{\circ n}(z)|\) is harmonic, vanishes on the filled Julia set, and satisfies \(G(p(z))=d\,G(z)\). The Böttcher coordinate obeys \(\varphi(p(z))=\varphi(z)^d\) and \(\log\varphi=G+i\theta\), so \(\theta\) is the harmonic conjugate of \(G\) off the filled set. The pair \((G_N,\theta_N)\) is the finite sample of that pair. Inside the iteration budget the non-escaping convention is \(G_N=0\), which is the numerical filled set, not a certificate that the true Green function is zero.

The smooth count currently stored by `juliaValue` stays the field value, so marching squares and levels do not move. After the existing post-escape increment of the counter,

\[
\nu=n-\log_2(\log|z_n|)\quad(d=2),\qquad G_N=2^{-n}\log|z_n|=2^{-\nu}.
\]

The code keeps returning `value` from the current expression `count+1-log2(log|z|)`. Relief uses \(G_N\) and \(\theta_N\), not `value`.

Tail control for \(d=2\), once \(|z_n|\ge 2\) and \(|c|\le\sqrt{2}\) (true for the admitted parameter box): \(|z_{n+1}|\ge |z_n|^2-|c|>|z_n|\), and

\[
\bigl|G_{n+1}(z)-G_n(z)\bigr|
=2^{-(n+1)}\Bigl|\log\bigl|1+c/z_n^2\bigr|\Bigr|
\le 2^{-(n+1)}\frac{|c|}{|z_n|^2-|c|}.
\]

### 1.2 Quaternion slice and the height

The planar field stays the complex orbit above, so contours and owners stay put. A parallel quaternion orbit supplies the out-of-plane residue. Identify

\[
q_0=x+yi+\eta\sin\psi\,k,\qquad c_H=\operatorname{Re} c+\operatorname{Im} c\,i,
\]

with \(\psi\) the visual phase and \(\eta\) the slice amplitude. Quaternion square is

\begin{align*}
a'&=a^2-b^2-c_j^2-d_k^2,\\
b'&=2ab,\qquad c_j'=2ac_j,\qquad d_k'=2ad_k,
\end{align*}

then \(a'\mathrel{+}=\operatorname{Re} c\), \(b'\mathrel{+}=\operatorname{Im} c\). For \(\eta=0\) and \(d=2\) this orbit is the complex orbit and the \(k\)-component stays \(0\).

Height of a sample \((x,y)\) at phase \(\psi\):

\[
Z(x,y;\psi)
=\alpha\,G_N(z)\,\cos\bigl(m\operatorname{Arg}(z_n)+\psi\bigr)
+\beta\,d^{-n} q_n^{(k)}.
\]

Here \(m\in\{1,2,3,4\}\) is the argument harmonic. Non-escaping samples have \(G_N=0\), \(q^{(k)}\) unused, and \(Z=0\). Thus the numerical filled set is the zero level of the relief.

The planar embedding is untouched:

\begin{align*}
X&=s_0 x+\sigma y+w_0 e(x)\sin(f_0 y+\psi),\\
Y&=s_1 y+w_1 e(x)\sin(f_1 x-\psi),\\
e(x)&=\max\bigl(0,\,1-(x/B_x)^2\bigr).
\end{align*}

Only the third coordinate changes, from \(0.06\sin(x-y+\psi)\) to \(Z\) when a potential block is present.

### 1.3 Whitney fold and cusp on the affine charts

The scroll and pleat charts are immersions \((u,v)\mapsto(X,Y,Z)\) with \(u\in[0,1]\), \(v\in[-1,1]\). The projected Jacobian already implemented as `recursiveScrollJacobian` and `recursiveJacobianRow` is

\[
J(u,v)=X_u Y_v-X_v Y_u.
\]

Critical set \(\Sigma=\{J=0\}\). Boardman/Whitney type along a \(v\)-slice:

| Stratum | Test | Normal form | Geometric intensity |
| --- | --- | --- | --- |
| Regular | \(J\neq 0\) | local diffeomorphism | \(I\sim 1/|J|\) |
| Fold \(A_2\) | \(J=0\), \(J_v\neq 0\) | \((x,y)\mapsto(x,y^2)\) | transverse \(I\sim|\delta|^{-1/2}\) |
| Cusp \(A_3\) | \(J=J_v=0\), \(J_{vv}\neq 0\) | \((x,y)\mapsto(x,xy+y^3)\) | on the axis \(I\sim|v|^{-2/3}\); fold brightness along the caustic toward the cusp \(I\sim|\ell|^{-1/4}\) |

The fold exponent is the chain rule on \((x,y)\mapsto(x,y^2)\): \(J=2y\) and the lit-side image coordinate is \(\delta=y^2\), so \(1/|J|\sim|\delta|^{-1/2}\). The cusp exponent is the same reading of \((x,y)\mapsto(x,xy+y^3)\) at the origin: \(J=3y^2\), image height \(v=y^3\), so \(1/|J|\sim|v|^{-2/3}\).

The legacy compression is

\[
\kappa_0=\min\Bigl(6,\ \frac{1}{0.15+|J|/(L w)}\Bigr).
\]

The upgrade multiplies by a cusp weight and then uses the same cap. With \(\rho=|J|/(Lw)\), \(\rho_v=|J_v|/(Lw)\), \(\tau>0\), and \(\lambda\ge 0\),

\begin{align*}
w_c&=\exp\bigl(-\rho_v^2/(2\tau^2)\bigr),\\
\kappa&=\min\Bigl(6,\ \frac{1+ \lambda w_c}{0.15+\rho}\Bigr).
\end{align*}

\(\lambda=0\) recovers \(\kappa_0\). The weight \(w_c\) is \(1\) on a cusp slice and decays as the fold becomes transverse. The cap \(6\) is the constant already used in `recursivePleatPoint` and `recursivePoint`.

For the rolled scroll, \(F=F_v v+\omega\), \(s=\sin F\), \(c=\cos F\), \(R=w(r_0+r_1 v)\), and

\begin{align*}
D_u&=D_u^0+0.7(R_u c-R s F_u),&
D_v&=0.7(R_v c-R s F_v),\\
S_u&=S_u^0+R_u s+R c F_u,&
S_v&=R_v s+R c F_v,
\end{align*}

\[
J=D_u S_v-S_u D_v.
\]

Differentiating in \(v\) with \(\partial_v s=c F_v\), \(\partial_v c=-s F_v\), \(\partial_v R=R_v\), \(\partial_v R_u=w_u r_1\):

\begin{align*}
D_u'&=0.7\bigl(w_u r_1\, c-R_u s F_v-R_v s F_u-R c F_v F_u\bigr),\\
D_v'&=0.7\bigl(-2 R_v s F_v-R c F_v^2\bigr),\\
S_u'&=w_u r_1\, s+R_u c F_v+R_v c F_u-R s F_v F_u,\\
S_v'&=2 R_v c F_v-R s F_v^2,\\
J_v&=D_u' S_v+D_u S_v'-S_u' D_v-S_u D_v'.
\end{align*}

The pleat chart uses the same product rule on the expressions in `recursiveJacobianRow` (the branch without `geometry.chart`). Those derivatives are in the drop-in as `pleatJacobian`.

Caustic polylines remain the sign-change roots of \(J(\cdot,v)\) already tracked by `solveDepthRoots`. Each vertex stores \(\kappa\) and \(w_c\). Alpha on those vertices scales by \(\kappa/\kappa_0\) when \(\lambda>0\), and stays the current alpha when \(\lambda=0\).

### 1.4 Strange-loop filament

Let \(P_E\) be the anchor of the terminal output node and \(P_\lambda\) the anchor of the root lambda territory, both at the same phase, both in \(\mathbb{R}^3\).

Node choice, from the task graph `body.nodes` using `inputs` or `args`:

- Depth is the usual \(1+\max\) over in-graph predecessors. A source has depth \(1\), matching `topology`.
- The terminal output node maximizes \((\mathrm{depth},-\mathrm{id})\) among nodes of out-degree \(0\).
- The root lambda node minimizes \((\mathrm{depth},\mathrm{id})\) among nodes of in-degree \(0\).

Point choice:

- \(P_E=\mathrm{anchor}(\mathrm{body},\mathrm{id}_E,\psi)\).
- On a recursive-affine body, \(P_\lambda\) is the stem root `recursivePoint(body, 0, 0, 0, ψ)`, whose owner is `ownerAt(body, 0, 0)`. That point is the geometric \(\lambda\)-root of the contractive tree.
- On every other body, including Julia and family adapters, \(P_\lambda=\mathrm{anchor}(\mathrm{body},\mathrm{id}_\lambda,\psi)\).

The centerline is a similar copy of the \((2,3)\)-torus knot

\[
T(t)=\bigl((R+r\cos 3t)\cos 2t,\ (R+r\cos 3t)\sin 2t,\ r\sin 3t\bigr),
\]

with fixed normal-form radii \(R=2\), \(r=1\), and \(t\in[0,2\pi]\). Then \(T(0)=(3,0,0)\), \(T(\pi)=(1,0,0)\), and \(|T(0)-T(\pi)|=2\). For chord length \(L=|P_\lambda-P_E|>10^{-4}\),

\[
C(t)=P_E+S\,M\bigl(T(t)-T(0)\bigr),\qquad S=L/2,
\]

where \(M\in\mathrm{SO}(3)\) sends \(e_1\) to \(-(P_\lambda-P_E)/L\). Consequences, for every phase:

\[
C(0)=C(2\pi)=P_E,\qquad C(\pi)=P_\lambda.
\]

If \(L\le 10^{-4}\), both territories share one point. The centerline is then a trefoil of chord scale \(0.05\) centered at that point, and both endpoints report the same owner.

Stations on the oriented loop, in evaluation order of `apply(run(quote(D)), quote(D))`, returning to the emit fixed point:

| \(t\) | Station | Territory |
| --- | --- | --- |
| \(0\equiv 2\pi\) | emit, the reproduction fixed point | terminal output |
| \(2\pi/3\) | quote | along the outgoing limb |
| \(\pi\) | run, the closure | root lambda |
| \(4\pi/3\) | apply | along the return limb |

A Möbius frame twists by half a turn along the knot. Let \(T_g(t)=C'(t)/|C'(t)|\) and let \(N_1(t),N_2(t)\) be a right-handed normal basis obtained by one Gram–Schmidt step from a fixed reference \(e_3\), falling back to \(e_2\) if the tangent is parallel to \(e_3\). The material frame is

\[
\tau(t)=t/2+\psi,
\qquad
N_\tau=\cos\tau\, N_1+\sin\tau\, N_2,
\qquad
B_\tau=T_g\times N_\tau.
\]

A tube sample with half-width \(w\) and angle \(s\) is

\[
X(t,s)=C(t)+w\bigl(\cos s\, N_\tau+\sin s\, B_\tau\bigr).
\]

Because \(\tau(2\pi)=\tau(0)+\pi\),

\[
N_\tau(2\pi)=-N_\tau(0),\qquad X(2\pi,s)=X(0,s+\pi).
\]

That holonomy is the geometric quote/run crossing: one circuit reverses the normal, and the centerline value returns to the emitted point. The \((2,3)\) torus knot bounds a Möbius band; the frame above is that half-twist, sampled.

Ownership of a sample is a single integer. On \([0,\pi]\) the owner is the output node for \(t<2\pi/3\) and the lambda node for \(t\ge 2\pi/3\). On \((\pi,2\pi]\) the owner is the lambda node until \(4\pi/3\), then the output node. Endpoints \(t=0\) and \(t=2\pi\) both belong to the output node. Every sample therefore has one owner, and both endpoint territories appear.

The half-width is \(w=\mathrm{clamp}(0.02\,L,\ 0.004,\ 0.03)\) when \(L>10^{-4}\), and \(w=0.004\) on the degenerate trefoil.

### 1.5 Domains

Admitted today, and left as they are:

| Block | Field | Domain |
| --- | --- | --- |
| Julia `geometry` | `parameter` | two reals, each in \([-1,1]\) |
| | `grid` | integer \([128,256]\) |
| | `iterations` | integer \([32,96]\) |
| | `escape` | exactly \(2\) |
| | `bounds` | four reals in \([-2,2]\), strict rectangle |
| | `levels` | \(3\) to \(12\) strictly increasing integers in \([2,N-1]\) |
| | `embedding.scale` | each in \([0.2,0.6]\) |
| | `embedding.warp` | each in \([0,0.2]\) |
| | `embedding.frequency` | each in \([1,4]\) |
| | `embedding.shear` | \([-0.2,0.2]\) |
| Affine `geometry` | `depth` | integer \([2,6]\) |
| | `root` | each in \([-1,1]\) |
| | `length` | \([0.3,0.8]\) |
| | `angle` | \([-\pi,\pi]\) |
| | `motion` | \([0,0.25]\) |
| | `transforms` | \(2\) or \(3\) rules |
| | `scale`, `angle`, `attach` | \([0.35,0.67]\), \([-1.2,1.2]\), \([0.4,1]\) |
| | `width` | optional \([0.08,0.3]\) |
| | `rollTurns` | optional \([2,4.2]\), and only with `chart: 'rolled-scroll'` |

New optional blocks. Absent means legacy height and legacy \(\kappa_0\).

| Block | Field | Domain |
| --- | --- | --- |
| `geometry.potential` | `model` | `'douady-hubbard-relief'` |
| | `degree` | integer \(2,3,4\); authoring default \(2\) |
| | `amplitude` \(\alpha\) | \([0,0.12]\) |
| | `harmonic` \(m\) | integer \([1,4]\) |
| | `quaternionSlice` \(\eta\) | \([0,0.35]\); used only for \(d=2\) |
| | `quaternionGain` \(\beta\) | \([0,0.08]\) |
| `geometry.caustic` | `model` | `'whitney-fold-cusp'` |
| | `lambda` \(\lambda\) | \([0,1.5]\) |
| | `tau` \(\tau\) | \([0.02,0.5]\) |
| | `cap` | exactly \(6\) |

Portrait depth for a Julia body with a potential block is \(2(\alpha+\beta)+0.02\), which is at most \(0.42\). The legacy depth \(0.14\) remains the value when the block is absent. Phase stays in \([-10^{12},10^{12}]\), and every trig function receives \(\psi \bmod 2\pi\). Strange-loop sample count is an integer in \([24,256]\), default \(96\).

Authoring defaults, when `author` is asked to attach the blocks: \(\alpha=0.06\) (the legacy height scale), \(m=1\), \(\eta=0.12\), \(\beta=0.02\), \(d=2\), \(\lambda=0.75\), \(\tau=0.08\). Degree stays \(2\) unless the record sets \(3\) or \(4\). A degree other than \(2\) still uses escape radius \(2\) and the same grid; only \(G_N\), \(\theta_N\), and \(Z\) change. Contour levels remain levels of the smooth escape `value`.

## 2. Drop-in JavaScript

Paste the following above `const api=...` in `woven-body.js`. Then apply the four small edits after the block: `author`, `validate`, the \(z\)-channel, and the export list. The functions call `check`, `bounded`, `TAU`, `anchor`, `ownerAt`, `recursivePoint`, `recursiveScrollRow`, and `rng`, which already exist in that file.

`lifeform-families.js` should not grow a second Julia iterator. It should call `causticAmplify` and `strangeLoop` through the hook at the end of this section. Family selection, `Families.compile`, and `Families.frame` stay the adapters they are.

```javascript
// Higher-order Douady–Hubbard relief, Whitney caustic weight, and the
// quote → run → apply trefoil. Optional geometry blocks. Absent blocks
// leave the legacy height and the legacy compression unchanged.
// strangeLoop is passive: it only reads anchors and territories.

function potentialOf(geometry) {
  const p = geometry && geometry.potential;
  if (!p) return null;
  return p;
}

function causticOf(geometry) {
  const c = geometry && geometry.caustic;
  if (!c) return { lambda: 0, tau: 0.08, cap: 6 };
  return c;
}

function validatePotential(p) {
  keys(p, ['model', 'degree', 'amplitude', 'harmonic', 'quaternionSlice', 'quaternionGain']);
  check(p.model === 'douady-hubbard-relief', 'unknown potential');
  check([2, 3, 4].includes(p.degree) && Number.isInteger(p.degree), 'potential degree');
  bounded(p.amplitude, 0, 0.12);
  check(Number.isInteger(p.harmonic), 'potential harmonic');
  bounded(p.harmonic, 1, 4);
  bounded(p.quaternionSlice, 0, 0.35);
  bounded(p.quaternionGain, 0, 0.08);
}

function validateCaustic(c) {
  keys(c, ['model', 'lambda', 'tau', 'cap']);
  check(c.model === 'whitney-fold-cusp', 'unknown caustic');
  bounded(c.lambda, 0, 1.5);
  bounded(c.tau, 0.02, 0.5);
  check(c.cap === 6, 'caustic cap must stay 6');
}

function complexStep(x, y, re, im, degree) {
  if (degree === 2) {
    const nx = x * x - y * y + re;
    return { x: nx, y: 2 * x * y + im };
  }
  const rho = Math.hypot(x, y);
  const phi = Math.atan2(y, x);
  const pow = rho > 0 ? Math.exp(degree * Math.log(rho)) : 0;
  const ang = degree * phi;
  return { x: pow * Math.cos(ang) + re, y: pow * Math.sin(ang) + im };
}

function quatStep(a, b, cj, dk, re, im) {
  const na = a * a - b * b - cj * cj - dk * dk + re;
  const nb = 2 * a * b + im;
  const nc = 2 * a * cj;
  const nd = 2 * a * dk;
  return { a: na, b: nb, cj: nc, dk: nd };
}

// Superset of juliaValue. `value`, `escaped`, and `count` keep the legacy
// smooth-count meaning for d = 2. G and theta are the finite potential.
function juliaOrbit(g, x, y, phase) {
  const pot = potentialOf(g);
  const degree = pot ? pot.degree : 2;
  const re = g.parameter[0], im = g.parameter[1];
  const esc2 = g.escape * g.escape, iters = g.iterations;
  let zx = x, zy = y, count = 0, escaped = false;
  let a = x, b = y, cj = 0, dk = pot && degree === 2 ? pot.quaternionSlice * Math.sin(phase % TAU) : 0;
  for (; count < iters; count++) {
    const next = complexStep(zx, zy, re, im, degree);
    zx = next.x; zy = next.y;
    if (degree === 2 && pot) {
      const q = quatStep(a, b, cj, dk, re, im);
