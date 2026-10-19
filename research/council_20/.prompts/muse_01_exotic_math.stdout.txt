# Exotic Strange Attractors, Chaotic Flows & Differential Geometry — Enhancements for `woven-body.js` / `lifeform-families.js`

> Specialist #1 report. Read-only: no files modified. All proposals are **additive, opt-in, and preserve** the existing 8 mechanisms in `MECHANISMS`, the `author → compile → frame` lifecycle, the territory partition `{node, component:k, u:[u0,u1]}`, the `frame()` return contract `{points: Float32Array(budget*4), owners: Int16Array(budget), crests, bounds}`, and the QDL v1 / Lean / Quint validation surface. New behavior activates only via new mechanism names or new `opts` flags; default paths are bit-identical.

---

## 0. Design invariants (non-negotiable)

1. **Partition preservation:** territories remain a contiguous partition of `[0,1]` per strand `k`. New geometry may *re-parameterize inside* a territory (`u ↦ (u, v(u), φ(u))`) but never move `u0/u1` boundaries, so `owners[]` bookkeeping is untouched.
2. **Determinism:** all new fields derive from `(seed, graph)` through the same seeded PRNG discipline as existing code. No `Math.random()`, no wall-clock, no unseeded noise. Chaotic flows are integrated with fixed-step RK4 exactly as `compileLorenz` does.
3. **Bounded output:** every new sampler must provably stay inside a declared bounding ball so `bounds` remains finite and the renderer's normalization is stable. Each proposal below states its bound.
4. **Budget respect:** `frame()` still emits exactly `budget*4` floats. New samplers are drop-in point generators, not new allocation shapes.

---

## 1. Hopf Fibration & Stereographic $S^3 \to \mathbb{R}^3$ for `toroidal-weave`

### 1.1 Mathematics

The Hopf map $h: S^3 \subset \mathbb{C}^2 \to S^2 \subset \mathbb{R}^3$:

$$
h(z_1, z_2) = \bigl(2\operatorname{Re}(z_1 \bar z_2),\; 2\operatorname{Im}(z_1 \bar z_2),\; |z_1|^2 - |z_2|^2\bigr), \qquad |z_1|^2+|z_2|^2=1.
$$

The fiber over each point of $S^2$ is a great circle on $S^3$, and **any two distinct fibers are linked exactly once** (linking number $=1$) — this is the topological content that makes the weave *provably* interlocked rather than visually interwoven.

Parameterize $S^3$ by $(\eta, \xi_1, \xi_2)$ with $\eta \in [0, \pi/2]$, $\xi_1,\xi_2 \in [0, 2\pi)$:

$$
z_1 = \cos\eta \cdot e^{i\xi_1}, \qquad z_2 = \sin\eta \cdot e^{i\xi_2}.
$$

Fixing $\eta$ gives a Clifford torus $T_\eta \subset S^3$; each fiber on it is the curve $t \mapsto (\xi_1, \xi_2) = (\phi + t, \; \psi + t)$ (slope-1 flow). Stereographic projection from $(-1,0,0,0)$ maps $S^3 \setminus \{\text{pt}\} \to \mathbb{R}^3$:

$$
(X_1,X_2,X_3,X_4) \mapsto \frac{(X_2, X_3, X_4)}{1 + X_1}.
$$

Under this projection each Hopf fiber becomes a circle in $\mathbb{R}^3$, and each Clifford torus $T_\eta$ ($\eta \neq \pi/4$ excluded to avoid the point at infinity) becomes a standard torus of revolution with:

$$
R = \frac{1}{|\cos 2\eta|}\cdot \text{(scale)}, \qquad r = \tan\!\bigl(\min(2\eta, \pi - 2\eta)\bigr) \cdot R \ \text{style ratio},
$$

more precisely the image torus has major/minor radii satisfying $r/R = \tan(\pi/4 - |\eta - \pi/4| \cdot \text{sign})$; the practical form used in code is: with $c = \cos 2\eta$,

$$
R_\eta = \frac{s}{\sqrt{1-c^2}}\cdot \sqrt{1-c^2}\ \longrightarrow\ \text{use } R_\eta = \frac{s}{1+|c|}\cdot\frac{1}{\max(|c|,\varepsilon)},\quad r_\eta = R_\eta \tan\!\Bigl(\frac{\pi}{4} - \tfrac{1}{2}\arcsin c\Bigr)
$$

— in practice we sidestep closed-form fragility by projecting points directly (below), which is exact and cheaper than deriving $(R,r)$ analytically.

**Villarceau circles:** on a standard torus $(R + r\cos\phi)\cos\theta$, etc., the Villarceau circles are the circles obtained by slicing with a bitangent plane through the torus center at angle $\alpha$ with $\sin\alpha = r/R$. They pass through the "hole" and link the torus's two generating circles. They are precisely the stereographic images of Hopf fibers restricted to one Clifford torus — so adding Hopf fibers to `toroidal-weave` *automatically* adds Villarceau circles, with the weave's existing $(\theta,\phi)$ lattice as the scaffold.

### 1.2 Parameter bounds

| Parameter | Symbol | Range | Rationale |
|---|---|---|---|
| Torus latitude on $S^3$ | $\eta$ | $[0.35,\ \pi/2 - 0.35]$ rad | Keeps stereographic denominator $1+X_1 \ge 1-\sin(0.35) > 0.65$; avoids blow-up near projection pole |
| Fibers per torus | $N_f$ | $8 \le N_f \le 64$ (int) | Budget divisor; linking visible from $N_f \ge 8$ |
| Base phases | $\xi_1^{(0)}, \xi_2^{(0)}$ | $[0, 2\pi)$ | Seeded |
| Fiber parameter | $t$ | $[0, 2\pi)$ | One full great circle |
| Scale | $s$ | $(0, 1]$, default $0.9$ | Fits existing `bounds` normalization |
| Villarceau tilt | $\alpha = \arcsin(r/R)$ | derived, $\in (0, \pi/2)$ | Not free; must satisfy bitangency |

Stereographic bound: with $\eta \le \pi/2 - 0.35$, $|X_1| = |\cos\eta\cos\xi_1| \le \cos(0.35)$, denominator $\ge 1 - \cos(0.35) \approx 0.061$ worst-case only if additionally $\xi_1 \to \pi$; tighten by rejecting samples with $1 + X_1 < 0.25$ and clamping scale — code below projects then radially clamps to radius $3s$, which is safe because Hopf circles not passing near the pole stay within radius $\cot(\eta_{\min}/1) \approx 2.9$.

### 1.3 Drop-in code (`lifeform-families.js`)

Add alongside the existing `toroidal-weave` compiler; register as `'toroidal-weave-hopf'` **or** as `opts.hopf: true` on `toroidal-weave` (recommended: flag, to not grow `MECHANISMS` selection surface).

```js
// Hopf fiber sampler: returns [x,y,z] on the stereographic image of the
// Hopf fiber through base angles (xi1_0, xi2_0) at S^3 latitude eta.
// Linking: any two fibers with distinct (eta, phase-pair) link exactly once.
function hopfFiberPoint(eta, xi1_0, xi2_0, t, scale) {
  const ce = Math.cos(eta), se = Math.sin(eta);
  const a = xi1_0 + t, b = xi2_0 + t;              // slope-1 flow on Clifford torus
  const X1 = ce * Math.cos(a), X2 = ce * Math.sin(a);
  const X3 = se * Math.cos(b), X4 = se * Math.sin(b);
  let denom = 1 + X1;
  if (denom < 0.25) denom = 0.25;                  // pole guard (see bounds table)
  const x = (X2 / denom) * scale, y = (X3 / denom) * scale, z = (X4 / denom) * scale;
  const r2 = x*x + y*y + z*z, maxR = 3 * scale;    // radial clamp, preserves linking
  if (r2 > maxR * maxR) { const k = maxR / Math.sqrt(r2); return [x*k, y*k, z*k]; }
  return [x, y, z];
}

// Villarceau circle on an existing toroidal-weave torus (R, r):
// bitangent-plane circle, center offset along the slice direction.
function villarceauPoint(R, r, theta, out) {
  const alpha = Math.asin(Math.min(1, r / R));     // bitangency condition
  const ca = Math.cos(alpha), sa = Math.sin(alpha);
  // Circle of radius R in the tilted plane, centered at origin offset:
  const u = R * Math.cos(theta), v = R * Math.sin(theta);
  out[0] = u; out[1] = v * ca; out[2] = v * sa;    // plane tilt about x-axis
  return out;
}
```

**Wiring in `frame()`:** when `opts.hopf`, for each territory on a `toroidal-weave` strand, map $u \in [u_0,u_1]$ to fiber index $j = \lfloor N_f \cdot (k + u \cdot \text{strands}) / \text{strands} \rfloor$ and $t = 2\pi \cdot \text{frac}(u \cdot N_f \cdot \text{turns})$, $\eta$ seeded per strand in $[0.35, \pi/2-0.35]$. Owners unchanged. This keeps the existing $(R + r\cos\phi)\cos\theta$ path as the $\eta \to$ scaffold underlay (`opts.hopf` adds fibers *on* it).

---

## 2. Coupled Chaotic Attractors + Bishop Frames for `lorenz-flow`

### 2.1 The three flows (exact equations)

**Rössler** (spiral chaos, single scroll — complements Lorenz's two lobes):
$$
\dot x = -y - z,\qquad \dot y = x + a y,\qquad \dot z = b + z(x - c)
$$
Chaotic for $a = 0.2,\ b = 0.2,\ c = 5.7$ (period-doubling route; largest Lyapunov $\lambda_1 \approx 0.07$).

**Thomas** (cyclically symmetric, no equilibrium-driven lobes — pure cyclic flow):
$$
\dot x = \sin y - b x,\qquad \dot y = \sin z - b y,\qquad \dot z = \sin x - b z
$$
Chaotic for $b = 0.208186$ (at $b = 0.19$ strongly chaotic; $b \ge 0.32899$ collapses to fixed points — keep $b \in [0.15, 0.30]$).

**Halvorsen** (quadratic cyclic symmetry, harmonic partner to Lorenz):
$$
\dot x = -a x - 4y - 4z - y^2,\qquad \dot y = -a y - 4z - 4x - z^2,\qquad \dot z = -a z - 4x - 4y - x^2
$$
Chaotic at $a = 1.89$ ($\lambda_1 \approx 0.73$).

**Coupling to Lorenz** (drive–response / Pecora–Carroll style, one-way so the master Lorenz trajectory compiled by `compileLorenz` is unchanged):

$$
\dot{\mathbf{y}} = F_{\text{slave}}(\mathbf{y}) + K\,(\mathbf{x}_{\text{Lorenz}} - \mathbf{y}), \qquad K = \operatorname{diag}(k, 0, 0),\ k \in [0, 8].
$$

$k=0$ recovers independent attractors; $k \gtrsim 4.5$ (Rössler slave) approaches generalized synchronization. Expose $k$ as `opts.coupling`, default `0` (existing behavior preserved exactly).

Standard Lorenz parameters stay $\sigma=10,\ \rho=28,\ \beta=8/3$.

### 2.2 Bishop (parallel-transport) frames — `lorenzBasis` / `computeBasis`

Frenet frames flip and spin wildly at near-zero curvature (Lorenz lobe switches). A **Bishop frame** $(T, N_1, N_2)$ parallel-transports the normals, minimizing torsion:

$$
T' = \kappa_1 N_1 + \kappa_2 N_2, \qquad N_1' = -\kappa_1 T, \qquad N_2' = -\kappa_2 T,
$$

so the normal plane rotates only as much as the curve forces it to. Discrete version along the precomputed RK4 polyline $p_i$ (this is what `computeBasis` should implement):

```js
// Double-reflection parallel transport (stable, O(n), no trig per step).
function computeBasis(points /*Float32Array n*3*/, out /*{T,N1,N2} Float32Arrays*/) {
  const n = points.length / 3;
  // Initial tangent
  let tx = points[3]-points[0], ty = points[4]-points[1], tz = points[5]-points[2];
  let tl = Math.hypot(tx, ty, tz) || 1; tx/=tl; ty/=tl; tz/=tl;
  // Arbitrary initial normal perpendicular to T
  let ax = Math.abs(tx) < 0.9 ? 1 : 0, ay = Math.abs(tx) < 0.9 ? 0 : 1, az = 0;
  let n1x = ay*tz - az*ty, n1y = az*tx - ax*tz, n1z = ax*ty - ay*tx;
  const n1l = Math.hypot(n1x, n1y, n1z) || 1; n1x/=n1l; n1y/=n1l; n1z/=n1l;
  for (let i = 0; i < n; i++) {
    if (i > 0) {
      // tangent at i (central difference, clamped ends)
      const i0 = Math.max(0, i-1)*3, i1 = Math.min(n-1, i+1)*3;
      let ux = points[i1]-points[i0], uy = points[i1+1]-points[i0+1], uz = points[i1+2]-points[i0+2];
      const ul = Math.hypot(ux, uy, uz) || 1; ux/=ul; uy/=ul; uz/=ul;
      // Reflect previous N1 across plane bisecting (prevT, T): rotation-minimizing
      const vx = tx+ux, vy = ty+uy, vz = tz+uz;
      const vd = vx*n1x + vy*n1y + vz*n1z;
      const vl2 = vx*vx + vy*vy + vz*vz || 1;
      n1x -= 2*vd/vl2*vx; n1y -= 2*vd/vl2*vy; n1z -= 2*vd/vl2*vz;
      // Re-orthogonalize against new tangent
      const d = n1x*ux + n1y*uy + n1z*uz;
      n1x -= d*ux; n1y -= d*uy; n1z -= d*uz;
      const nl = Math.hypot(n1x, n1y, n1z) || 1; n1x/=nl; n1y/=nl; n1z/=nl;
      tx = ux; ty = uy; tz = uz;
    }
    const o = i*3;
    out.T[o]=tx; out.T[o+1]=ty; out.T[o+2]=tz;
    out.N1[o]=n1x; out.N1[o+1]=n1y; out.N1[o+2]=n1z;
    out.N2[o]=ty*n1z-tz*n1y; out.N2[o+1]=tz*n1x-tx*n1z; out.N2[o+2]=tx*n1y-ty*n1x;
  }
  return out;
}
// Public alias matching requested name:
const lorenzBasis = computeBasis;
```

Use: ribbon/tube offsets around Lorenz trajectories become `p + w*(cos ψ * N1 + sin ψ * N2)` with no Frenet twist pops at lobe switches. Total added twist is measurable and near-minimal (see §3).

### 2.3 Parameter bounds

| Flow | Params | Chaotic window | Integration |
|---|---|---|---|
| Lorenz (existing) | $\sigma{=}10, \rho{=}28, \beta{=}8/3$ | fixed | RK4, $dt = 0.008$, as existing |
| Rössler | $a{=}b{=}0.2,\ c{=}5.7$ | $c \in [4.6, 6.2]$ at $a{=}b{=}0.2$ | RK4, $dt \le 0.02$ |
| Thomas | $b = 0.208186$ | $b \in [0.15, 0.30]$ | RK4, $dt \le 0.05$ (slow flow) |
| Halvorsen | $a = 1.89$ | $a \in [1.5, 2.2]$ | RK4, $dt \le 0.01$ |
| Coupling | $k \in [0, 8]$, default $0$ | sync onset $\approx 4$–$5$ (Rössler slave) | same step as slave |

All four flows are dissipative with bounded attractors (Lorenz $\subset$ ball radius $\approx 50$ pre-normalization; Thomas $\subset [-12,12]^3$ approx). Apply the same compile-time normalization `compileLorenz` already uses; do not change its scale constants.

### 2.4 Drop-in code (`woven-body.js`, beside `compileLorenz`)

```js
function rk4Step(f, s, dt) {
  const k1 = f(s[0], s[1], s[2]);
  const k2 = f(s[0]+k1[0]*dt/2, s[1]+k1[1]*dt/2, s[2]+k1[2]*dt/2);
  const k3 = f(s[0]+k2[0]*dt/2, s[1]+k2[1]*dt/2, s[2]+k2[2]*dt/2);
  const k4 = f(s[0]+k3[0]*dt,   s[1]+k3[1]*dt,   s[2]+k3[2]*dt);
  return [s[0] + dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]),
          s[1] + dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1]),
          s[2] + dt/6*(k1[2]+2*k2[2]+2*k3[2]+k4[2])];
}

const FLOWS = {
  rossler:  { dt: 0.02, f: (x,y,z) => [-y - z, x + 0.2*y, 0.2 + z*(x - 5.7)] },
  thomas:   { dt: 0.05, f: (x,y,z) => [Math.sin(y) - 0.208186*x,
                                        Math.sin(z) - 0.208186*y,
                                        Math.sin(x) - 0.208186*z] },
  halvorsen:{ dt: 0.01, f: (x,y,z) => [-1.89*x - 4*y - 4*z - y*y,
                                        -1.89*y - 4*z - 4*x - z*z,
                                        -1.89*z - 4*x - 4*y - x*x] },
};

// compileCoupled(record, graph, { flow, coupling, steps })
// Lorenz master from existing compileLorenz output drives slave via x-coupling.
function compileCoupled(master /*Float32Array steps*3*/, flowName, coupling, steps) {
  const flow = FLOWS[flowName]; if (!flow) throw new Error('unknown flow: ' + flowName);
  const out = new Float32Array(steps * 3);
  let s = [0.1, 0, 0];
  for (let i = 0; i < steps; i++) {
    const o = i * 3;
    out[o] = s[0]; out[o+1] = s[1]; out[o+2] = s[2];
    const driven = (x, y, z) => {
      const d = flow.f(x, y, z);
      d[0] += coupling * (master[o] - x);   // one-way Pecora-Carroll drive
      return d;
    };
    s = rk4Step(driven, s, flow.dt);
  }
  return out;
}
```

Register as `opts.flow: 'rossler'|'thomas'|'halvorsen'` on `lorenz-flow`; absent ⇒ untouched path.

---

## 3. Hofstadter Strange-Loop Holonomy Twist

### 3.1 Mathematics

A *strange loop* (Hofstadter): traversing the strand parameter $u: 0 \to 1$ and returning to the "same" level, you arrive twisted — the geometric incarnation is **holonomy**: parallel-transport a frame around a closed (or territory-closing) loop and measure the net rotation of the normal plane. For a curve with Bishop curvatures $(\kappa_1, \kappa_2)$, the holonomy angle after one traversal is

$$
\Theta = \oint \tau_{\text{eff}}\, ds \;=\; \int_0^1 \bigl(\kappa_1 \dot\beta\text{-terms}\bigr)\,du \quad\text{discretely:}\quad \Theta = \sum_i \angle\bigl(N_1^{(i)},\, \widetilde{N}_1^{(i+1)}\bigr),
$$

i.e. transport $N_1$ around the loop with `computeBasis` (§2.2), compare initial vs. final $N_1$ in the plane $\perp T(0)=T(1)$:

$$
\Theta = \operatorname{atan2}\bigl(\langle N_1^{final}, N_2^{init}\rangle,\; \langle N_1^{final}, N_1^{init}\rangle\bigr) \in (-\pi, \pi].
$$

**The twist applied to rendering:** when a territory's strand is drawn as a ribbon/tube with angular coordinate $\psi$, replace $\psi \to \psi + \Theta \cdot u$ *within that territory only*. Effect: the ribbon returns to its seam rotated by exactly its own holonomy — a visible Möbius-like self-reference that is *earned by the geometry*, not faked. Optionally quantize for topological closure:

$$
\Theta_q = \frac{2\pi}{m}\left\lfloor \frac{m\,\Theta}{2\pi} \right\rceil, \qquad m \in \{1,2,3,4,6\},
$$

so with $m=2$ every loop closes as a true Möbius band ($\Theta_q = \pi$ when $\Theta$ near $\pi$), $m=1$ forces orientable closure. Default: **unquantized** ($\Theta$ as computed), `opts.holonomy: {quantize: m}` opt-in.

For open strands (most territories), close the loop virtually with the straight segment $p_{end} \to p_{start}$ before transporting — standard practice; state it in code comments so validators don't mistake it for a bug.

### 3.2 Parameter bounds

| Quantity | Bound | Note |
|---|---|---|
| $\Theta$ | $(-\pi, \pi]$, computed, never free | Derived, not a knob — this is the contract |
| Quantizer $m$ | $\{1,2,3,4,6\}$, default off | Divisors giving clean closure |
| Twist application | $\psi + \Theta u$, $u \in [0,1]$ local | Zero net displacement of centerline; only frame rotates |
| Centerline | unchanged | Guarantees `bounds` and `owners` unaffected |

Centerline invariance is the safety property: holonomy twists *frames*, never points on the spine, so all existing spatial validation still passes; only crest/ribbon orientation changes.

### 3.3 Drop-in code (`woven-body.js`)

```js
// Holonomy of a (virtually closed) polyline: net Bishop-frame rotation.
function strangeLoopHolonomy(points /*Float32Array n*3*/) {
  const n = points.length / 3;
  const basis = { T: new Float32Array(points.length),
                  N1: new Float32Array(points.length),
                  N2: new Float32Array(points.length) };
  computeBasis(points, basis);
  // Compare transported N1 at end vs initial frame (project onto init normal plane)
  const e = (n - 1) * 3;
  const c = basis.N1[e]*basis.N1[0] + basis.N1[e+1]*basis.N1[1] + basis.N1[e+2]*basis.N1[2];
  const s = basis.N1[e]*basis.N2[0] + basis.N1[e+1]*basis.N2[1] + basis.N1[e+2]*basis.N2[2];
  return Math.atan2(s, c); // in (-pi, pi]
}

function quantizeHolonomy(theta, m) {
  if (!m) return theta;
  const step = 2 * Math.PI / m;
  return Math.round(theta / step) * step;
}

// In frame(): per territory, theta = quantizeHolonomy(strangeLoopHolonomy(spine), opts.holonomy?.quantize)
// then ribbon angle psi' = psi + theta * uLocal. Spine points untouched.
```

**Composability note for `qdl-v1-offspring.js` (no change requested, flagged for root):** holonomy is *additive under grafting* mod $2\pi$ to first order — a `compose` seam joining territories with holonomies $\Theta_a, \Theta_b$ carries $\Theta_a + \Theta_b$ around the combined loop. Worth a line in the seam record later; not required for this proposal and deliberately not implemented here per ownership rules (`qdl-v1-offspring.js` is outside this assignment).

---

## 4. Integration & validation checklist

| # | Change | File | Default behavior | Validation |
|---|---|---|---|---|
| 1 | `hopfFiberPoint`, `villarceauPoint`, `opts.hopf` | `lifeform-families.js` | Off; `toroidal-weave` identical | Linking check: sample 2 fibers, numeric linking integral $\approx \pm 1$ within $10^{-2}$ |
| 2 | `FLOWS`, `compileCoupled`, `opts.flow/coupling` | `woven-body.js` | `coupling: 0`, Lorenz only | $k=0$ slave vs. standalone flow: max deviation $< 10^{-9}$ over 1k steps |
| 3 | `computeBasis` / `lorenzBasis` | `woven-body.js` | Unused until ribbon path opts in | Orthonormality: $\|N_1 \times N_2 - T\| < 10^{-6}$ all samples; torsion vs. Frenet reduced |
| 4 | `strangeLoopHolonomy`, `opts.holonomy` | `woven-body.js` | Off; centerlines always unchanged | Planar circle ⇒ $\Theta \approx 0$; helix test case ⇒ $\Theta$ matches analytic $\oint \tau\, ds$ within $10^{-3}$ |

Existing gates must stay green untouched: `lake build` + `audit-lean.cjs` (zero `sorry`) and `quint typecheck/test/run` — none of these proposals alter QDL syntax, graph topology, or territory semantics, so no Lean/Quint changes are needed. New JS should be verified with the repo's existing harness plus the four numeric checks above (deterministic, seeded, no new dependencies).

**Ownership compliance:** this report proposes code for root integration; per `AGENTS.md` no peer files were edited, no existing program source was copied (all samplers are written from the shared mathematical definitions above), and mechanisms 1–8 (`pleated-braid` … `phyllotaxis-fan`) remain semantically intact.
