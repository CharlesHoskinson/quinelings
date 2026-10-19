# Exotic Strange Attractors, Chaotic Flows, and Differential Geometry

Engineering report for `toroidal-weave`, `lorenz-flow` / `lorenzSpine`, and a shared holonomy used by `lifeform-families.js`. All maps below are drop-in replacements or additive fields. They stay inside the existing `WovenBody.compile` / `WovenBody.frame` contract: precompute in `compile`, sample `budget` points as `Float32Array(budget * 4)` with `owners`.

Domains are closed so seeds cannot blow the frame buffer. Angles are radians. `TAU = 2 * Math.PI`.

---

## 0. Shared seed lattice

Keep the existing seed hash. Derive bounded coefficients once in `compile` and store them on `body.geometry` so `frame` is pure.

```js
const TAU = 2 * Math.PI;
const PHI = (1 + Math.sqrt(5)) / 2;          // 1.6180339887…
const PHI_INV = PHI - 1;                      // 0.6180339887… = 1/φ

function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function frac(x) { return x - Math.floor(x); }

function unitHash(seed, salt) {
  let h = (Math.imul(seed ^ salt, 0x9E3779B1) >>> 0);
  h = Math.imul(h ^ (h >>> 16), 0x7FEB352D) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846CA68B) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function span(seed, salt, lo, hi) {
  return lerp(lo, hi, unitHash(seed, salt));
}
```

| Symbol | Domain | Role |
|---|---|---|
| `a_major` | `[0.85, 1.35]` | Hopf torus major radius after stereographic scale |
| `a_fiber` | `[0.18, 0.42]` | Villarceau tube radius, strictly `< a_major / 2` |
| `σ` | `10` fixed | Lorenz Prandtl |
| `ρ` | `[24, 32]` | Lorenz Rayleigh, above the strange-attractor window `ρ > 24.74` |
| `β` | `8/3` fixed | Lorenz geometric factor |
| `b_T` | `[0.18, 0.22]` | Thomas dissipation (labyrinth exists near `0.208186`) |
| `ε` | `[0.02, 0.08]` | Lorenz↔Thomas coupling, weak so both attractors survive |
| `q` | `{0, 1, 2}` cyclic | Thomas coordinate permutation index |
| `n_strand` | integer `≥ 2` | fiber count; linking is pairwise |

Invariant used everywhere: sample parameter `u ∈ [0, 1]`, strand index `k ∈ {0, …, n-1}`, phase `φ ∈ ℝ`.

---

## 1. Hopf fibration and linked Villarceau fibers (`toroidal-weave`)

### 1.1 Hopf map

Identify `S³ ⊂ ℂ²` by

\[
S^3 = \bigl\{ (z_1, z_2) \in \mathbb{C}^2 : |z_1|^2 + |z_2|^2 = 1 \bigr\}.
\]

The Hopf map \(h: S^3 \to S^2\) is

\[
h(z_1, z_2) = \bigl(2\operatorname{Re}(z_1 \overline{z_2}),\; 2\operatorname{Im}(z_1 \overline{z_2}),\; |z_1|^2 - |z_2|^2\bigr).
\]

A fiber over a base point is a great circle. Parametrize the fiber of winding \((p, q)\) with \(\gcd(|p|, |q|) = 1\) by

\[
\begin{aligned}
z_1(t) &= \cos\eta \; e^{i(p t + \alpha_k)}, \\
z_2(t) &= \sin\eta \; e^{i(q t + \beta_k)},
\end{aligned}
\qquad t \in [0, \tau],
\]

where the period that closes the curve on \(S^3\) is

\[
\tau = \frac{2\pi}{\gcd(|p|, |q|)} = 2\pi
\]

when \((p, q) = (1, 1)\) or \((1, -1)\). Those two are the classical Hopf fibers and their orientation reverse.

**Linking.** For distinct strands \(k \neq \ell\) with the same \((p, q) = (1, 1)\) and distinct phases \((\alpha_k, \beta_k) \neq (\alpha_\ell, \beta_\ell) \bmod 2\pi\), the Gauss linking number of the two projected circles is

\[
\operatorname{Lk}(\gamma_k, \gamma_\ell) = pq = 1.
\]

(The integer is the Hopf invariant of \(h\). It is unchanged by any ambient isotopy that stays an embedding, including stereographic projection from a pole not on either circle.)

Strand phases, golden so they never coincide:

\[
\alpha_k = 2\pi \, k \, \varphi^{-1}, \qquad
\beta_k = 2\pi \, k \, \varphi^{-2} + \psi_0,
\]

with \(\psi_0 \in [0, 2\pi)\) from the seed. Because \(\varphi^{-1}\) is irrational, \(\alpha_k \not\equiv \alpha_\ell \pmod{2\pi}\) for \(k \neq \ell\).

Latitude of the base circle (Villarceau opening):

\[
\eta \in \bigl[\tfrac{\pi}{6},\; \tfrac{\pi}{3}\bigr]
\quad\text{so}\quad
\cos\eta, \sin\eta \in \bigl[\tfrac12, \tfrac{\sqrt{3}}{2}\bigr].
\]

\(\eta = \pi/4\) gives the Clifford torus, the flattest case. Stay off \(\{0, \pi/2\}\) or a fiber collapses to a point and linking is undefined.

### 1.2 Stereographic projection \(S^3\setminus\{N\} \to \mathbb{R}^3\)

Take the north pole \(N = (0, 0, 0, 1)\) in coordinates \((x_1, y_1, x_2, y_2) = (\operatorname{Re} z_1, \operatorname{Im} z_1, \operatorname{Re} z_2, \operatorname{Im} z_2)\). For \(X \neq N\),

\[
\pi_N(X) = \frac{(x_1,\; y_1,\; x_2)}{1 - y_2}.
\]

On a \((1, 1)\)-fiber this image is a Villarceau circle on a torus of revolution. Closed form used in the sampler (equivalent, and cheaper than four trigs plus a divide every sample):

\[
\begin{aligned}
R &= a_{\text{major}}, \qquad r = a_{\text{fiber}}, \qquad R > 2r > 0, \\
\theta_k(u) &= 2\pi u + \alpha_k, \\
\phi_k(u) &= 2\pi u + \beta_k + \phi, \\[4pt]
c &= R + r \cos\phi_k, \\
\mathbf{p}_k(u) &= \bigl(
  c \cos\theta_k,\;
  c \sin\theta_k,\;
  r \sin\phi_k
\bigr).
\end{aligned}
\]

This is the standard torus. It is a Villarceau circle only after a rigid motion that cuts the torus on the bitangent plane. Apply that once per strand (constant rotation, so linking is preserved):

\[
\begin{aligned}
\xi &= \arctan\frac{r}{\sqrt{R^2 - r^2}} \in (0, \pi/2), \\
Q_\xi &= \begin{pmatrix}
\cos\xi & 0 & \sin\xi \\
0 & 1 & 0 \\
-\sin\xi & 0 & \cos\xi
\end{pmatrix}, \\
\mathbf{v}_k(u) &= Q_\xi \, \mathbf{p}_k(u).
\end{aligned}
\]

Then \(\mathbf{v}_k\) is a planar circle (Villarceau), \(\mathbf{v}_k\) and \(\mathbf{v}_\ell\) are linked once, and neither passes through the origin if \(R - r > 0\), which is already required.

**Pole guard.** The raw Hopf coordinate \(y_2 = \sin\eta \sin(t + \beta_k)\) equals \(1\) only if \(\sin\eta = 1\) and the phase hits \(\pi/2\). The domain \(\eta \le \pi/3\) gives \(|y_2| \le \sqrt{3}/2 < 1\), so \(1 - y_2 \ge 1 - \sqrt{3}/2 > 0.133\). If you sample the \(S^3\) formula directly, reject and resample when \(1 - y_2 < 10^{-3}\). The torus formula never hits that pole.

**Gauss check (compile-time, two strands).** Discrete Gauss integral, \(N\) samples, centered differences:

\[
\operatorname{Lk}_N(\gamma, \delta)
  = \frac{1}{4\pi} \sum_{i,j}
    \frac{
      \det\bigl(\gamma_i - \delta_j,\; \Delta\gamma_i,\; \Delta\delta_j\bigr)
    }{
      \|\gamma_i - \delta_j\|^3
    }.
\]

Accept the geometry iff \(|\operatorname{Lk}_N - 1| < 0.05\) at \(N = 64\). For \((p, q) = (1, 1)\) this passes; if a seed ever fails (degenerate \(\xi\)), fall back to \(\eta = \pi/4\), \(R = 1\), \(r = 0.3\).

### 1.3 Drop-in for `toroidal-weave`

Replaces `computeBasis` / `point` for this mechanism only. `v ∈ [-1, 1]` is a thin normal ribbon so the strand has thickness without leaving the linking class (the ribbon radius is `<` half the strand separation).

```js
function hopfWeaveGeometry(seed, nStrands) {
  const R = span(seed, 0xA11, 0.85, 1.35);
  let r = span(seed, 0xA12, 0.18, 0.42);
  r = Math.min(r, 0.45 * R);                 // R > 2r
  const eta = span(seed, 0xA13, Math.PI / 6, Math.PI / 3);
  const psi0 = span(seed, 0xA14, 0, TAU);
  const xi = Math.atan(r / Math.sqrt(R * R - r * r));
  const cxi = Math.cos(xi), sxi = Math.sin(xi);
  return { R, r, eta, psi0, xi, cxi, sxi, n: nStrands };
}

function strandPhase(g, k) {
  const alpha = TAU * k * PHI_INV;
  const beta = TAU * k * PHI_INV * PHI_INV + g.psi0;
  return { alpha, beta };
}

function villarceauPoint(g, k, u, v, phase) {
  const { alpha, beta } = strandPhase(g, k);
  const theta = TAU * u + alpha;
  const phi = TAU * u + beta + phase;
  const radial = g.R + g.r * Math.cos(phi);
  // torus point
  let x = radial * Math.cos(theta);
  let y = radial * Math.sin(theta);
  let z = g.r * Math.sin(phi);
  // rigid tilt onto the bitangent (Villarceau) plane
  const xr =  g.cxi * x + g.sxi * z;
  const zr = -g.sxi * x + g.cxi * z;
  x = xr; z = zr;
  // ribbon: offset along an approximate normal, |v| ≤ 1
  const ribbon = 0.06 * g.r * clamp(v, -1, 1);
  const nx = Math.cos(phi) * Math.cos(theta);
  const ny = Math.cos(phi) * Math.sin(theta);
  const nz = Math.sin(phi);
  return [
    x + ribbon * ( g.cxi * nx + g.sxi * nz),
    y + ribbon * ny,
    z + ribbon * (-g.sxi * nx + g.cxi * nz)
  ];
}

// Compile-time linking audit for strands 0 and 1. Returns ~1.
function gaussLink(g, phase = 0, N = 64) {
  const A = new Array(N), B = new Array(N);
  for (let i = 0; i < N; i++) {
    A[i] = villarceauPoint(g, 0, i / N, 0, phase);
    B[i] = villarceauPoint(g, 1, i / N, 0, phase);
  }
  let lk = 0;
  for (let i = 0; i < N; i++) {
    const dA = [
      A[(i + 1) % N][0] - A[i][0],
      A[(i + 1) % N][1] - A[i][1],
      A[(i + 1) % N][2] - A[i][2]
    ];
    for (let j = 0; j < N; j++) {
      const dB = [
        B[(j + 1) % N][0] - B[j][0],
        B[(j + 1) % N][1] - B[j][1],
        B[(j + 1) % N][2] - B[j][2]
      ];
      const rx = A[i][0] - B[j][0];
      const ry = A[i][1] - B[j][1];
      const rz = A[i][2] - B[j][2];
      const det = rx * (dA[1] * dB[2] - dA[2] * dB[1])
                - ry * (dA[0] * dB[2] - dA[2] * dB[0])
                + rz * (dA[0] * dB[1] - dA[1] * dB[0]);
      const n3 = Math.pow(rx * rx + ry * ry + rz * rz, 1.5);
      if (n3 > 1e-12) lk += det / n3;
    }
  }
  return lk / (4 * Math.PI);
}
```

`point(body, k, u, v, phase)` for `toroidal-weave` returns `villarceauPoint(body.geometry.hopf, k, u, v, phase)`.

**Territory coordinate.** Existing `u: [u0, u1]` still parametrizes arc length fraction along the fiber. One full territory `[0, 1]` is one Villarceau circuit, linking number unchanged.

**What this does to `frame`.** No change to the buffer layout. Owners stay the strand index `k`. Ridges are samples where \(\partial_u \mathbf{v}\) turns fastest, i.e. where \(\sin\phi_k = 0\) (inner and outer equator of the torus before the tilt). Mark a ridge when `Math.abs(Math.sin(phi)) < 0.15`.

---

## 2. Coupled Lorenz–Thomas flow and a Bishop frame (`lorenz-flow`)

### 2.1 The two fields

Lorenz, classical chaotic window:

\[
\begin{aligned}
\dot x &= \sigma (y - x), \\
\dot y &= x (\rho - z) - y, \\
\dot z &= xy - \beta z,
\end{aligned}
\qquad
\sigma = 10,\;
\rho \in [24, 32],\;
\beta = 8/3.
\]

René Thomas cyclically symmetric labyrinth:

\[
\dot w_i = \sin(w_{i+1}) - b_T w_i,
\qquad i \in \mathbb{Z}/3\mathbb{Z},
\qquad b_T \in [0.18, 0.22].
\]

At \(b_T \approx 0.208186\) the attractor is a chaotic labyrinth with no equilibrium (the linear part \(-b_T I\) is contractive and the sine is the only fold). Cyclic index \(q \in \{0, 1, 2\}\) rotates which Thomas axis listens to which neighbor:

\[
\dot w_i = \sin(w_{i+1+q}) - b_T w_i.
\]

That is the assignment formula \(\sin(w_{\mathrm{cyc}} + 2.2 q)\) in spirit: the \(2.2\) is a phase offset inside the sine, not a new state. Use the permutation form in the integrator (it stays on the labyrinth) and put the phase on the coupling, where it cannot create a new unbounded term.

### 2.2 Coupling

Let \(X = (x, y, z)\) and \(W = (w_0, w_1, w_2)\). Weak diffusive coupling through a fixed permutation \(P_q\):

\[
\begin{aligned}
\dot X &= F_{\text{Lorenz}}(X) + \varepsilon \, (P_q W - X), \\
\dot W &= F_{\text{Thomas}, q}(W) + \varepsilon \, (X - P_q W),
\end{aligned}
\qquad
\varepsilon \in [0.02, 0.08].
\]

\[
P_0 = I,\quad
P_1 (w) = (w_2, w_0, w_1),\quad
P_2 (w) = (w_1, w_2, w_0).
\]

Energy remark, not a conserved quantity: the coupling term \(\varepsilon(P_q W - X)\) is skew in the joint quadratic form \(\|X\|^2 + \|W\|^2\), so it does not inject energy. Dissipation still comes from \(-\sigma, -1, -\beta\) and \(-b_T\). With \(\varepsilon \le 0.08\) and \(b_T \ge 0.18\), trajectories started in the box below stay in a ball of radius \(< 80\) for the Lorenz block and \(< 20\) for the Thomas block (practical bound used to size the spine; not a Lyapunov proof).

**Initial box (compile):**

\[
X(0) \in [1, 8]^2 \times [10, 25], \qquad
W(0) \in [-1, 1]^3.
\]

Do not start at the origin: Lorenz origin is an equilibrium, Thomas origin is a focus.

**Alternate coupling (Rössler or Halvorsen), same slot.** If a seed bit says so, replace \(F_{\text{Thomas}}\) by one of:

Rössler, chaotic for these bounds:

\[
\dot u = -v - w,\quad
\dot v = u + a_R v,\quad
\dot w = b_R + w(u - c_R),
\]

\[
a_R \in [0.15, 0.2],\; b_R \in [0.15, 0.2],\; c_R \in [5.7, 8.5].
\]

Halvorsen (cyclic, no sine):

\[
\dot w_i = -a_H w_i - 4 w_{i+1} - 4 w_{i+2} - w_{i+1}^2,
\qquad a_H \in [1.25, 1.4].
\]

Same \(\varepsilon\)-coupling. Prefer Thomas as the default: it is bounded by the sine and will not overflow a `Float32` orbit buffer when RK4 takes a stiff step. Halvorsen’s quadratic term needs a smaller step (\(h \le 0.004\)).

### 2.3 Integrator

Existing Lorenz path is RK4. Extend the state to \(\mathbb{R}^6\). Fixed step, stored orbit:

| Quantity | Value |
|---|---|
| step \(h\) | \(0.008\) (Thomas or Rössler), \(0.004\) (Halvorsen) |
| steps | \(12000\) transient discard, then \(8000\) stored |
| store | `Float32Array(8000 * 6)` as `orbit` |
| spine | Lorenz block `orbit[i*6 + 0..2]`, the visible curve |
| dye | Thomas block `+3..5`, available to color or a second ribbon |

RK4 on a Lipschitz field is fine here. Thomas and Lorenz are \(C^\infty\). Halvorsen is polynomial. No event detection required.

```js
function thomasF(w0, w1, w2, bT, q) {
  // cyclic shift of the sine argument by q
  const s0 = q === 0 ? w1 : q === 1 ? w2 : w0;
  const s1 = q === 0 ? w2 : q === 1 ? w0 : w1;
  const s2 = q === 0 ? w0 : q === 1 ? w1 : w2;
  return [Math.sin(s0) - bT * w0,
          Math.sin(s1) - bT * w1,
          Math.sin(s2) - bT * w2];
}

function coupledField(s, p) {
  const [x, y, z, w0, w1, w2] = s;
  const Fx = p.sigma * (y - x);
  const Fy = x * (p.rho - z) - y;
  const Fz = x * y - p.beta * z;
  const Fw = thomasF(w0, w1, w2, p.bT, p.q);
  // P_q W
  const P = p.q === 0 ? [w0, w1, w2]
          : p.q === 1 ? [w2, w0, w1]
                      : [w1, w2, w0];
  const e = p.eps;
  return [
    Fx + e * (P[0] - x),
    Fy + e * (P[1] - y),
    Fz + e * (P[2] - z),
    Fw[0] + e * (x - P[0]),
    Fw[1] + e * (y - P[1]),
    Fw[2] + e * (z - P[2])
  ];
}

function rk4Step(s, h, p) {
  const a = coupledField(s, p);
  const s2 = s.map((v, i) => v + 0.5 * h * a[i]);
  const b = coupledField(s2, p);
  const s3 = s.map((v, i) => v + 0.5 * h * b[i]);
  const c = coupledField(s3, p);
  const s4 = s.map((v, i) => v + h * c[i]);
  const d = coupledField(s4, p);
  return s.map((v, i) => v + (h / 6) * (a[i] + 2 * b[i] + 2 * c[i] + d[i]));
}
```

Reject a seed (redraw `eps` down by half, once) if any stored sample has a non-finite component or \(\|X\| > 200\). That is the only runtime guard.

### 2.4 Why `lorenzSpine` flips, and the Bishop frame that does not

A Frenet frame

\[
T = \frac{\gamma'}{\|\gamma'\|},\quad
B = \frac{\gamma' \times \gamma''}{\|\gamma' \times \gamma''\|},\quad
N = B \times T
\]

is undefined when curvature \(\kappa = \|\gamma' \times \gamma''\| / \|\gamma'\|^3\) hits zero, and \(N, B\) reverse when the torsion changes sign. On the Lorenz attractor the orbit passes near the \(z\)-axis between the two lobes; the projected heading \((\dot x, \dot y)\) rotates through a half-turn while \(\dot z\) stays positive. Any frame built as

\[
\text{“up”} = (0, 0, 1), \qquad
N_{\text{gimb}} = \text{normalize}(up \times T)
\]

vanishes when \(T \parallel e_z\). That is the gimbal flip: one sample of \(N\) jumps by nearly \(\pi\) even though \(T\) moved by \(O(h)\).

**Bishop (rotation-minimizing) frame.** Given \(T(s)\) only, transport a normal by the discrete connection that has zero torsion in the \(T\)-direction. Continuous statement: \(N\) satisfies

\[
N' = -(N \cdot T') \, T
\]

so \(N \cdot T = 0\) is preserved and \(N' \perp N\). There is no \(B\)-component in \(N'\), which is exactly “torsion seen by this normal is zero”. The curve’s intrinsic torsion is then carried by the angle \(\theta(s)\) between this Bishop normal and the Frenet normal:

\[
\frac{d\theta}{ds} = \tau(s).
\]

You never form \(\tau\) or \(\kappa\), so lobe crossings stay continuous.

**Discrete SO(3) transport**, sample \(i\) to \(i+1\), tangents \(T_i, T_{i+1}\) already normalized:

\[
\begin{aligned}
\omega &= T_i \times T_{i+1}, \\
\sin\alpha &= \|\omega\|, \qquad
\cos\alpha &= T_i \cdot T_{i+1}, \\
\alpha &= \operatorname{atan2}(\sin\alpha,\; \cos\alpha) \in [0, \pi].
\end{aligned}
\]

If \(\sin\alpha < 10^{-8}\), set \(R = I\). Otherwise the unique shortest rotation \(R_i \in \mathrm{SO}(3)\) with \(R_i T_i = T_{i+1}\) has axis \(\hat\omega = \omega / \sin\alpha\) and angle \(\alpha\). Rodrigues:

\[
R v = v\cos\alpha + (\hat\omega \times v)\sin\alpha + \hat\omega(\hat\omega\cdot v)(1 - \cos\alpha).
\]

Update

\[
T_{i+1}^{\text{check}} = R_i T_i, \quad
U_{i+1} = R_i U_i, \quad
V_{i+1} = T_{i+1} \times U_{i+1}.
\]

\(U\) stays orthonormal to \(T\) up to roundoff. Renormalize every 32 steps with one Gram–Schmidt step

\[
U \leftarrow \operatorname{normalize}(U - (U\cdot T) T), \qquad V \leftarrow T \times U
\]

so \(\det(T, U, V) = +1\) forever. No \(\varepsilon\)-sign flip is applied. That flip was the gimbal.

**Seed frame** at \(i = 0\): pick the reference vector farthest from \(T_0\) among \(\{e_x, e_y, e_z\}\),

\[
U_0 = \operatorname{normalize}(e_{\star} \times T_0), \qquad V_0 = T_0 \times U_0.
\]

Because the test uses all three axes, \(T_0 \parallel e_z\) is the case that selects \(e_x\), and the first normal is well defined.

**Holonomy around one stored orbit is not closed.** Parallel transport around a non-planar loop returns \(U\) rotated by the writhe of that loop. Do not force \(U_N = U_0\). For a periodic ribbon, fade the mismatch along \(u\) only if a consumer asks for a closed mesh; the spine polyline itself does not need it.

```js
function norm3(v) {
  const n = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / n, v[1] / n, v[2] / n];
}
function cross(a, b) {
  return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
}
function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function rodrigues(v, axis, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const cv = cross(axis, v);
  const d = dot(axis, v);
  return [
    v[0]*c + cv[0]*s + axis[0]*d*(1-c),
    v[1]*c + cv[1]*s + axis[1]*d*(1-c),
    v[2]*c + cv[2]*s + axis[2]*d*(1-c)
  ];
}

function bishopFrames(points) {
  const n = points.length;
  const T = new Array(n), U = new Array(n), V = new Array(n);
  for (let i = 0; i < n; i++) {
    const nxt = points[Math.min(i + 1, n - 1)];
    const prv = points[Math.max(i - 1, 0)];
    T[i] = norm3([nxt[0]-prv[0], nxt[1]-prv[1], nxt[2]-prv[2]]);
  }
  const axes = [[1,0,0],[0,1,0],[0,0,1]];
  let ref = axes[0], best = Math.abs(dot(T[0], axes[0]));
  for (let a = 1; a < 3; a++) {
    const d = Math.abs(dot(T[0], axes[a]));
    if (d < best) { best = d; ref = axes[a]; }
  }
  U[0] = norm3(cross(ref, T[0]));
  V[0] = cross(T[0], U[0]);
  for (let i = 0; i < n - 1; i++) {
    const w = cross(T[i], T[i+1]);
    const sA = Math.hypot(w[0], w[1], w[2]);
    const cA = clamp(dot(T[i], T[i+1]), -1, 1);
    if (sA < 1e-8) {
      U[i+1] = U[i];
    } else {
      const axis = [w[0]/sA, w[1]/sA, w[2]/sA];
      U[i+1] = rodrigues(U[i], axis, Math.atan2(sA, cA));
    }
    if ((i & 31) === 31) {
      const t = T[i+1];
      const d = dot(U[i+1], t);
      U[i+1] = norm3([U[i+1][0]-d*t[0], U[i+1][1]-d*t[1], U[i+1][2]-d*t[2]]);
    }
    V[i+1] = cross(T[i+1], U[i+1]);
  }
  return { T, U, V };
}
```

`lorenzSpine` should read position from the Lorenz block and orientation from `{T, U, V}` at the same index. Ribbon point:

\[
\mathbf{r}(i, v) = X_i + w_{\text{rib}} v \, U_i,
\qquad v \in [-1, 1],\; w_{\text{rib}} \in [0.04, 0.12].
\]

A \(\pi\) jump in \(U\) would show up as \(U_i \cdot U_{i+1} < 0\) while \(T_i \cdot T_{i+1} > 0.99\). The construction forbids that: \(R_i\) is the short rotation (\(\alpha \le \pi\), and for \(h = 0.008\) one has \(\alpha \ll 1\)), so \(U_i \cdot U_{i+1} = \cos\alpha > 0\).

---

## 3. Hofstadter strange-loop holonomy \(\Phi_{SL}\)

### 3.1 What is being parallel-transported

Each strand \(k\) is a leaf of a foliation of the parameter rectangle \([0, 1]_u \times \mathbb{Z}_k\). Identification at the end of the interval is a half-twist, the Möbius holonomy, quantized so it is exactly \(\pi\) and not an accumulated float:

\[
\Phi_{SL}: [0, 1] \times \{0,\ldots,n-1\} \times \mathbb{R} \to \mathbb{R}
\]

\[
\boxed{
\Phi_{SL}(u, k, \phi)
  = \pi \, u
  + 2\pi \, k \, \varphi^{-1}
  + \phi_{\mathrm{drive}}(u, \phi)
}
\]

The three terms are independent and each has a fixed meaning.

| Term | Domain | Meaning |
|---|---|---|
| \(\pi u\) | \(u \in [0, 1]\) contributes \([0, \pi]\) | one Möbius half-twist per circuit. \(\Phi(1) - \Phi(0) = \pi\) from this term alone, so a normal \((\cos\Phi, \sin\Phi)\) returns as its negative: the leaf is non-orientable along \(u\) |
| \(2\pi k / \varphi\) | \(k \in \mathbb{Z}\) | golden foliation. Leaf origins are the Kronecker sequence on the circle, dense and with minimal gap \(1/\varphi\) mod 1. Three consecutive strands never cluster |
| \(\phi_{\mathrm{drive}}\) | bounded | slow drive from the animation phase, see below |

**Strange loop, quantized.** The Hofstadter butterfly comes from the almost-Mathieu operator at flux \(\varphi^{-1}\). The same flux is used here as a leaf label, not as a Hamiltonian. The holonomy defect after one circuit of strand \(k\) and one circuit of strand \(k+1\) differs by

\[
\Delta_k = \Phi_{SL}(1, k+1, \phi) - \Phi_{SL}(1, k, \phi)
        = 2\pi \varphi^{-1} \pmod{2\pi},
\]

which is irrational over \(\pi\), so the set of defects never closes into a finite symmetry of the ribbon. That is the strange loop: monodromy in \(u\) is order 2 (Möbius), monodromy in \(k\) is infinite (golden).

**Drive, bounded, does not cancel the half-twist:**

\[
\phi_{\mathrm{drive}}(u, \phi)
  = A \sin(2\pi u + \phi),
\qquad A \in [0, \pi/6].
\]

Then

\[
\partial_u \Phi_{SL} = \pi + 2\pi A \cos(2\pi u + \phi) \in [\pi - \pi/3,\; \pi + \pi/3] \subset [\tfrac{2\pi}{3}, \tfrac{4\pi}{3}],
\]

so the twist rate never changes sign and never stalls. Integrating the drive over \([0, 1]\) gives \(0\), therefore

\[
\Phi_{SL}(1, k, \phi) - \Phi_{SL}(0, k, \phi) = \pi
\]

exactly, for every strand and every phase. The half-twist is quantized; the drive only breathes.

### 3.2 Where it enters the existing families

`LIMITS` already has `twist: [1, 3]` and `offset: [0, TAU]`. Do not widen those. \(\Phi_{SL}\) is an angle added to the frame, not a replacement for `twist`.

Logarithmic mantle (Fermat / log spiral style, matching the existing growth and curl limits):

\[
\begin{aligned}
\rho(u) &= e^{\gamma (u - 1)} , \qquad \gamma \in [0.12, 0.35] \quad\text{(growth)}, \\
\theta(u, k) &= \omega \, u + \Phi_{SL}(u, k, \phi), \qquad \omega \in [0.4, 1.6]\cdot 2\pi \quad\text{(curl as turns)}, \\
\mathbf{p} &= \bigl(\rho\cos\theta,\; \rho\sin\theta,\; \zeta \sin\Phi_{SL}\bigr),
\end{aligned}
\]

with vertical amplitude \(\zeta \in [0.05, 0.2]\). Using \(\sin\Phi_{SL}\) as the \(z\)-fold makes the Möbius identification visible: at \(u = 1\) the normal tilt is opposite the tilt at \(u = 0\).

Phyllotaxis fan. Divergence angle stays the golden angle, now phase-locked to the same \(\varphi^{-1}\) used by \(\Phi_{SL}\):

\[
\theta_k = k \cdot \frac{2\pi}{\varphi^2}
        = 2\pi k \varphi^{-2},
\qquad
r_k = c \sqrt{k + 1},
\quad c \in [0.5, 1.2]\ \text{(spread)}.
\]

\(\Phi_{SL}\) twists the local petal frame, not the divergence (changing the divergence would destroy the packing):

\[
\mathbf{n}_k(u) = \cos\Phi_{SL}(u, k, \phi)\, e_r + \sin\Phi_{SL}(u, k, \phi)\, e_z.
\]

Toroidal weave. Add \(\Phi_{SL}\) on top of the Villarceau parametrization as the ribbon angle, not as a second winding. A second winding in \(u\) would change \((p, q)\) and could change \(\operatorname{Lk}\). The ribbon is contractible in a tubular neighborhood of the fiber, so

\[
\operatorname{Lk}(\operatorname{core}_k, \operatorname{core}_\ell) = 1
\]

remains, while each core’s own ribbon is a Möbius band because the normal rotates by \(\pi\).

```js
function phiSL(u, k, phase, amp) {
  const A = clamp(amp, 0, Math.PI / 6);
  // π*u is the quantized half-twist.
  // 2π*k/φ is the golden leaf.
  // A*sin integrates to 0 over u ∈ [0,1].
  return Math.PI * u
       + TAU * k * PHI_INV
       + A * Math.sin(TAU * u + phase);
}

function applyRibbon(point, normal, binormal, u, k, phase, amp, halfWidth) {
  const a = phiSL(u, k, phase, amp);
  const c = Math.cos(a), s = Math.sin(a);
  const w = halfWidth; // already in [0.04, 0.12] or 0.06*r
  return [
    point[0] + w * (c * normal[0] + s * binormal[0]),
    point[1] + w * (c * normal[1] + s * binormal[1]),
    point[2] + w * (c * normal[2] + s * binormal[2])
  ];
}
```

**Monodromy unit check** (put next to `gaussLink` in compile, cheap):

```js
function halfTwistDefect(k, phase, amp) {
  // exact π, drive integrates out; allow 1e-9 for trig noise
  return phiSL(1, k, phase, amp) - phiSL(0, k, phase, amp) - Math.PI;
}
```

Fail the seed only if `Math.abs(halfTwistDefect(...)) > 1e-6`. With the formula above it is on the order of `1e-15`.

### 3.3 Foliation vs. strands already in the graph

`topology.fanout` is the strand count \(n\). Leaf index \(k\) runs `0 … fanout-1`. Territory `[u0, u1]` restricts the integral of twist to \(\pi(u_1 - u_0)\), so a partial territory is a partial twist and does not pretend to be a closed Möbius band. Guards that reject \(u \notin [0, 1]\) stay as they are. Effects that mirror a strand should send \(k \mapsto k\) and \(u \mapsto 1 - u\), which sends \(\Phi_{SL} \mapsto \pi - \pi u + \cdots\) and reverses the half-twist, consistent with a mirror.

---

## 4. Compile and frame wiring

Stored on the record, no new top-level mechanism names (the eight-name list stays):

```js
// inside WovenBody.compile, lorenz-flow branch
const params = {
  sigma: 10,
  rho: span(seed, 0xB01, 24, 32),
  beta: 8 / 3,
  bT: span(seed, 0xB02, 0.18, 0.22),
  eps: span(seed, 0xB03, 0.02, 0.08),
  q: Math.floor(unitHash(seed, 0xB04) * 3),
  amp: span(seed, 0xB05, 0, Math.PI / 6),
  ribbon: span(seed, 0xB06, 0.04, 0.12)
};
// integrate, discard 12000, keep 8000 × 6
// body.dynamics = { orbit, frames: bishopFrames(lorenzPts), params }

// inside WovenBody.compile, toroidal-weave branch
const hopf = hopfWeaveGeometry(seed, fanout);
if (Math.abs(gaussLink(hopf) - 1) > 0.05) {
  hopf.R = 1; hopf.r = 0.3;
  hopf.xi = Math.atan(hopf.r / Math.sqrt(hopf.R * hopf.R - hopf.r * hopf.r));
  hopf.cxi = Math.cos(hopf.xi); hopf.sxi = Math.sin(hopf.xi);
}
// body.geometry = { hopf, amp: span(seed, 0xA15, 0, Math.PI/6) }
```

`frame(body, phase, {budget, crests, reuse})` is unchanged in signature. For the Lorenz spine, walk the stored orbit by phase:

\[
i_0 = \lfloor \mathrm{frac}(\mathrm{phase}) \cdot N \rfloor, \qquad
i_s = (i_0 + s \cdot \lfloor N / \mathrm{budget}\rfloor) \bmod N.
\]

Write `points[4*s + 0..2]` from the ribbon formula and `points[4*s + 3]` as \(\Phi_{SL}(s/\mathrm{budget}, \mathrm{owner}, \mathrm{phase})\) if the fourth lane is free; otherwise leave the existing lane alone. `owners[s] = k` with \(k\) constant along a Lorenz spine (one owner) and \(k = s \bmod n\) along a weave.

`reuse: true` skips RK4 and Bishop rebuild. Both are pure functions of `seed` plus the stored orbit, so reuse is valid. `crests` selects ridge samples: Lorenz, where \(T \cdot e_z\) changes sign (lobe crossing); weave, where \(|\sin\phi_k| < 0.15\).

---

## 5. Invariants to assert

| Check | Pass |
|---|---|
| `gaussLink` at \(N = 64\) | \(\|Lk - 1\| < 0.05\) |
| Stereographic denominator | not used in the torus form; if the \(S^3\) form is sampled, \(1 - y_2 \ge 0.13\) |
| \(R > 2r\) | `r ≤ 0.45 R` |
| Bishop step | \(U_i \cdot U_{i+1} > 0\) whenever \(T_i \cdot T_{i+1} > 0.99\) |
| Right-handedness | \(\det(T, U, V) > 0.99\) after each renormalize |
| Half-twist | \(\Phi_{SL}(1,k,\phi) - \Phi_{SL}(0,k,\phi) = \pi\) within `1e-6` |
| Twist rate | \(\partial_u \Phi_{SL} \in [2\pi/3,\, 4\pi/3]\) |
| Orbit | all finite, \(\|X\| < 200\), \(\|W\| < 40\) |
| Coupling energy | \(\varepsilon \le 0.08\) so the skew term cannot dominate dissipation |
| `LIMITS` | growth, spread, curl, twist intervals unchanged; new coefficients live in `geometry` / `dynamics` |

---

## 6. Offspring note (`qdl-v1-offspring.js`)

`body` (trait re-seed) is the only operator that should touch this math. `compose`, `mate`, and `merge` move cones and literals; they do not resample orbits.

On `body`, re-seed by mixing parent seeds and rebuild:

\[
\mathrm{seed}' = (\mathrm{seed}_0 \oplus \mathrm{seed}_1 \oplus \mathrm{rol}(\mathrm{seed}_0, 13)) \mathbin{\&} 0\text{xFFFFFFFF},
\]

then run the same `compile` path. Linking number, half-twist, and the Bishop construction are properties of the maps, not of the seed, so every child still has \(\operatorname{Lk} = 1\), Möbius defect \(\pi\), and a flip-free spine. What the child inherits as a trait is the bounded tuple \((\rho, b_T, \varepsilon, q, R, r, \eta, A)\).
