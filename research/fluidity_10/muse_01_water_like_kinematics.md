# Quinelings Fluidity — Agent 1: Water-Like Organic Kinematics & Laminar Flow

**Top finding: the camera must never be derived from the organism.** Per-frame `minX/maxX/minY/maxY` normalization makes the frame a function of the pose, so every undulation moves the camera and the organism simultaneously — the two motions partially cancel and partially amplify, producing judder that no easing curve can fix. All three laws below follow from inverting that dependency: fix the frame once, advect everything inside it with $C^2$ divergence-free flow, and let every discrete parameter reach its target through a critically damped ODE integrated in closed form.

---

## Law 1 — Phase-Locked `portraitFrame` Normalization (Still Camera)

### 1.1 The defect

```js
// ❌ BEFORE: frame is a function of pose → camera moves every frame
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const p of points) {
  minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
  minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
}
const s = Math.min(w / (maxX - minX), h / (maxY - minY)); // breathes with φ
```

If a point set expands by $\delta$ at phase $\phi$, the scale shrinks by $\approx \delta / W$. A point at radius $r$ then appears to move by $-r\delta/W$ **in addition to** its true motion $\dot p$. The apparent velocity field is $\dot p_{\text{app}} = \dot p - p\,\dot s/s$, which is discontinuous wherever the argmin/argmax point switches identity — that switch is the visible "step."

### 1.2 The law

Compute the frame **once**, from the rest pose ($\phi = 0$, zero displacement amplitude), and freeze it. All subsequent motion is a bounded displacement field *inside* the fixed frame, with amplitude chosen so the silhouette never reaches the frame edge.

$$
\mathbf{p}_{\text{screen}} = \mathbf{c}_{\text{view}} + S\,R\,(\mathbf{p} - \mathbf{c}_0), \qquad S,\ R,\ \mathbf{c}_0,\ \mathbf{c}_{\text{view}} = \text{const}
$$

$S$ is a scalar (uniform scale — never per-axis, which would shear the organism), $R$ an optional fixed rotation. Because $S$ is constant, apparent velocity equals true velocity: $\dot{\mathbf{p}}_{\text{screen}} = S R\, \dot{\mathbf{p}}$. Stillness of the camera is then a theorem, not a tuning goal.

**Headroom rule.** If rest-pose bounding radius is $r_0$ and peak displacement amplitude is $A_{\max}$, require

$$
S \cdot (r_0 + A_{\max}) \;\le\; \tfrac{1}{2}\min(w, h) \cdot (1 - m), \qquad m = 0.06 \text{ (margin)}
$$

so the organism undulates strictly inside the frame at every phase.

### 1.3 Exact JavaScript

```js
// portraitFrame.js — compute ONCE at construction; never recompute per frame.
/**
 * @param {Array<{x:number,y:number}>} restPoints  points at φ=0, amplitude 0
 * @param {number} maxDisplacement                 peak |displacement| over all φ (world units)
 * @param {number} viewW @param {number} viewH     viewport size (px)
 * @param {number} [margin=0.06]                   fractional safety margin
 */
export function makePortraitFrame(restPoints, maxDisplacement, viewW, viewH, margin = 0.06) {
  // Centroid (area-stable) rather than bbox centre: bbox centre jumps when an
  // extremal point changes identity; the centroid never does.
  let cx = 0, cy = 0;
  for (const p of restPoints) { cx += p.x; cy += p.y; }
  cx /= restPoints.length; cy /= restPoints.length;

  let r0 = 0;
  for (const p of restPoints) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d > r0) r0 = d;
  }

  const usable = 0.5 * Math.min(viewW, viewH) * (1 - margin);
  const scale = usable / (r0 + maxDisplacement);   // frozen forever

  return Object.freeze({
    cx, cy,                 // world-space anchor
    scale,                  // world → px
    vx: viewW / 2,          // screen-space anchor
    vy: viewH / 2,
    r0, maxDisplacement,
    /** world → screen. Pure affine map with constant coefficients. */
    apply(p, out) {
      out.x = this.vx + (p.x - this.cx) * this.scale;
      out.y = this.vy + (p.y - this.cy) * this.scale;
      return out;
    },
    /** screen → world (for picking). Exact inverse of apply(). */
    invert(s, out) {
      out.x = this.cx + (s.x - this.vx) / this.scale;
      out.y = this.cy + (s.y - this.vy) / this.scale;
      return out;
    },
  });
}
```

Render loop — note the **absence** of any bounds computation:

```js
// ❌ deleted: minX/maxX/minY/maxY scan, per-frame scale, per-frame centre
function drawFrame(ctx, frame, points, tmp) {
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    frame.apply(points[i], tmp);
    i === 0 ? ctx.moveTo(tmp.x, tmp.y) : ctx.lineTo(tmp.x, tmp.y);
  }
  ctx.closePath();
}
```

**Resize handling.** On viewport resize, recompute `scale`, `vx`, `vy` from the *same frozen* `cx, cy, r0, maxDisplacement`. The world anchor never moves; only the constant $S$ changes, instantaneously and identically for every point — a clean zoom, not a drift.

---

## Law 2 — $C^2$ Phase Interpolation & Divergence-Free Advection

### 2.1 Why buckets step

Discrete phase-ring buckets store poses $P_0, \dots, P_{N-1}$ at phases $\phi_k = 2\pi k/N$. Nearest-bucket lookup is $C^{-1}$ (discontinuous); linear blending is $C^0$ (velocity jumps at every knot → visible pulse at bucket frequency $N \cdot f_{\text{phase}}$). Catmull-Rom is $C^1$: position and velocity are continuous, but **acceleration jumps**, and acceleration is what the eye reads as "organic vs. mechanical."

We therefore use **quintic Hermite interpolation** on the ring: each knot stores position, velocity, and acceleration $(P_k, V_k, A_k)$ with respect to $\phi$, estimated once by periodic finite differences. The interpolant is $C^2$ everywhere, including across the $\phi = 2\pi \to 0$ wrap.

### 2.2 Quintic Hermite basis

On $t \in [0,1]$ between knots $k$ and $k{+}1$ (spacing $h = 2\pi/N$ in $\phi$):

$$
\begin{aligned}
H_0 &= 1 - 10t^3 + 15t^4 - 6t^5 &
H_1 &= t - 6t^3 + 8t^4 - 3t^5 &
H_2 &= \tfrac{1}{2}t^2 - \tfrac{3}{2}t^3 + \tfrac{3}{2}t^4 - \tfrac{1}{2}t^5\\
H_3 &= 10t^3 - 15t^4 + 6t^5 &
H_4 &= -4t^3 + 7t^4 - 3t^5 &
H_5 &= \tfrac{1}{2}t^3 - t^4 + \tfrac{1}{2}t^5
\end{aligned}
$$

$$
P(\phi) = H_0 P_k + H_1 (hV_k) + H_2 (h^2 A_k) + H_3 P_{k+1} + H_4 (hV_{k+1}) + H_5 (h^2 A_{k+1})
$$

### 2.3 Exact JavaScript — phase ring

```js
// phaseRing.js — C² periodic quintic interpolation over N phase buckets.
/** Build knot derivatives once, periodically (indices wrap mod N). */
export function buildRing(poses) {           // poses: Float32Array-like [N][M][2] or flat
  const N = poses.length;
  const ring = poses.map((P, k) => {
    const prev = poses[(k - 1 + N) % N], next = poses[(k + 1) % N];
    const prev2 = poses[(k - 2 + N) % N], next2 = poses[(k + 2) % N];
    const V = new Array(P.length), A = new Array(P.length);
    for (let i = 0; i < P.length; i++) {
      // 4th-order central differences w.r.t. knot index (divide by h later via basis scaling)
      V[i] = [(prev2[i].x - 8 * prev[i].x + 8 * next[i].x - next2[i].x) / 12,
              (prev2[i].y - 8 * prev[i].y + 8 * next[i].y - next2[i].y) / 12];
      A[i] = [(-prev2[i].x + 16 * prev[i].x - 30 * P[i].x + 16 * next[i].x - next2[i].x) / 12,
              (-prev2[i].y + 16 * prev[i].y - 30 * P[i].y + 16 * next[i].y - next2[i].y) / 12];
    }
    return { P, V, A };
  });
  return { ring, N, h: (2 * Math.PI) / N };
}

/** Sample the ring at continuous phase φ (radians, any real). Writes into out[]. */
export function sampleRing(R, phi, out) {
  const { ring, N, h } = R;
  let u = (phi / h) % N; if (u < 0) u += N;          // wrap into [0, N)
  const k = Math.floor(u), t = u - k;
  const a = ring[k], b = ring[(k + 1) % N];
  const t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t;
  const H0 = 1 - 10 * t3 + 15 * t4 - 6 * t5,  H3 = 10 * t3 - 15 * t4 + 6 * t5;
  const H1 = t - 6 * t3 + 8 * t4 - 3 * t5,    H4 = -4 * t3 + 7 * t4 - 3 * t5;
  const H2 = 0.5 * t2 - 1.5 * t3 + 1.5 * t4 - 0.5 * t5,
        H5 = 0.5 * t3 - t4 + 0.5 * t5;
  for (let i = 0; i < out.length; i++) {
    out[i].x = H0 * a.P[i].x + H1 * a.V[i][0] + H2 * a.A[i][0]
             + H3 * b.P[i].x + H4 * b.V[i][0] + H5 * b.A[i][0];
    out[i].y = H0 * a.P[i].y + H1 * a.V[i][1] + H2 * a.A[i][1]
             + H3 * b.P[i].y + H4 * b.V[i][1] + H5 * b.A[i][1];
  }
  return out;
}
```

> Note: $V, A$ above are derivatives w.r.t. knot index, not $\phi$; the basis already absorbs the factors of $h$ and $h^2$ because $t$ is the normalized coordinate. This is exact, not an approximation.

### 2.4 Divergence-free stream function $\Psi(u,v,\phi)$

Bucket poses give the skeleton; the *flesh* — points and caustic ridges between buckets — is advected by a velocity field derived from a stream function, guaranteeing $\nabla \cdot \mathbf{v} = 0$ identically (incompressible, area-preserving, water-like; no sources, sinks, or breathing):

$$
\mathbf{v} = \left( \frac{\partial \Psi}{\partial v},\; -\frac{\partial \Psi}{\partial u} \right),
\qquad
\nabla \cdot \mathbf{v} = \frac{\partial^2 \Psi}{\partial u \partial v} - \frac{\partial^2 \Psi}{\partial v \partial u} = 0
$$

by equality of mixed partials, for **any** smooth $\Psi$. Choose $\Psi$ as a finite sum of phase-modulated sinusoidal modes (each mode is a steady cellular flow; $\phi$ slowly rotates/mixes them):

$$
\Psi(u,v,\phi) = \sum_{m=1}^{M} a_m \sin\!\big(k_m u + \alpha_m \phi\big)\, \sin\!\big(l_m v + \beta_m \phi\big)
$$

```js
// streamField.js — divergence-free velocity from Ψ(u, v, φ), analytic derivatives.
export const MODES = [
  //  a      ku    lu    α (φ-rate u)   β (φ-rate v)
  { a: 0.60, ku: 1, lu: 1, au: 1, av: 0 },
  { a: 0.35, ku: 2, lu: 1, au: -1, av: 1 },
  { a: 0.22, ku: 1, lu: 2, au: 0, av: -1 },
  { a: 0.12, ku: 3, lu: 2, au: 2, av: 1 },
];

/** Velocity at (u, v) in normalized portrait coordinates [-1, 1]². */
export function velocity(u, v, phi, out) {
  let vx = 0, vy = 0;                       // vx = ∂Ψ/∂v,  vy = −∂Ψ/∂u
  for (const m of MODES) {
    const su = Math.sin(m.ku * u + m.au * phi), cu = Math.cos(m.ku * u + m.au * phi);
    const sv = Math.sin(m.lu * v + m.av * phi), cv = Math.cos(m.lu * v + m.av * phi);
    vx += m.a * m.lu * su * cv;
    vy += -m.a * m.ku * cu * sv;
  }
  out.x = vx; out.y = vy; return out;
}
```

Because $\Psi$ is $C^\infty$ in $(u, v, \phi)$, trajectories are $C^\infty$ in time — **zero stepping by construction**, at any frame rate, since $\phi$ itself advances continuously (Law 3 governs $\phi$'s own drivers).

### 2.5 Advection: points and caustic ridges

Advect with midpoint (RK2) integration in normalized coordinates; step size from $dt$, never from bucket spacing:

```js
// advect.js
const _v1 = { x: 0, y: 0 }, _v2 = { x: 0, y: 0 };
export function advectPoint(p, phi, dt, out) {
  velocity(p.x, p.y, phi, _v1);
  const mx = p.x + 0.5 * dt * _v1.x, my = p.y + 0.5 * dt * _v1.y;
  velocity(mx, my, phi + 0.5 * dt, _v2);          // φ advances with time too
  out.x = p.x + dt * _v2.x;
  out.y = p.y + dt * _v2.y;
  return out;
}
```

Caustic ridges are advected as material line elements. A ridge point carries a tangent $\boldsymbol{\tau}$; its brightness is governed by local compression, measured by the flow-map Jacobian determinant $\det J$. Since the field is divergence-free, $\det J = 1$ for the exact flow — ridges neither gain nor lose area, they only **stretch and fold**, and caustic intensity is proportional to stretch anisotropy:

```js
// caustics.js — advect ridge polylines; intensity from finite-difference Jacobian.
export function advectRidge(ridge, phi, dt) {     // ridge: [{x, y, s}]  s = intensity
  const e = 1e-3, a = {x:0,y:0}, b = {x:0,y:0}, c = {x:0,y:0}, d = {x:0,y:0};
  for (const p of ridge) {
    // Jacobian of the one-step flow map F(p) ≈ [[Fx_u, Fx_v],[Fy_u, Fy_v]]
    advectPoint({ x: p.x + e, y: p.y }, phi, dt, a);
    advectPoint({ x: p.x - e, y: p.y }, phi, dt, b);
    advectPoint({ x: p.x, y: p.y + e }, phi, dt, c);
    advectPoint({ x: p.x, y: p.y - e }, phi, dt, d);
    const jxx = (a.x - b.x) / (2 * e), jxy = (c.x - d.x) / (2 * e);
    const jyx = (a.y - b.y) / (2 * e), jyy = (c.y - d.y) / (2 * e);
    // Largest singular value ≈ maximal stretch → caustic brightness
    const tr = jxx * jxx + jxy * jxy + jyx * jyx + jyy * jyy;
    const det = jxx * jyy - jxy * jyx;            // ≈ 1 (verify in tests; drift ⇒ bug)
    const stretch = Math.sqrt(Math.max(0, (tr + Math.sqrt(Math.max(0, tr * tr - 4 * det * det))) / 2));
    p.s += (Math.min(1, Math.max(0, (stretch - 1) * 2)) - p.s) * 0.1;  // smoothed per Law 3 in production
    advectPoint(p, phi, dt, p);
  }
}
```

**Invariant test (must hold):** `|det − 1| < 1e-2` per step for the amplitudes above. A violation means the mode amplitudes or `dt` are too large for RK2 — reduce `dt` (substep) rather than renormalizing, which would break $C^2$.

---

## Law 3 — Critically Damped Springs for Every Parameter

### 3.1 The law

Every interactive and execution parameter — `activeOwner`, `recursionDepth`, `outcome`, `tiltX`, `tiltY`, and likewise phase speed, amplitude, and ridge intensity — is a state $(y, \dot y)$ obeying

$$
\ddot y + 2\zeta\omega\, \dot y + \omega^2 (y - y_{\text{target}}) = 0, \qquad \zeta = 1
$$

$\zeta = 1$ is the fastest return to target with **no overshoot** — overshoot in `tiltX` reads as wobble, overshoot in `recursionDepth` reads as a lie. $\omega$ sets the timescale: settle time $\approx 5/\omega$.

**Do not integrate this with semi-implicit Euler at large $\omega\, dt$** — it goes unstable/oscillatory exactly when the interaction feels snappy. Use the **closed-form critically damped solution** per step. With $r = y - y_{\text{target}}$, $v = \dot y$:

$$
y(t) = y_{\text{target}} + e^{-\omega t}\big(r + (v + \omega r)\,t\big), \qquad
\dot y(t) = e^{-\omega t}\big(v - \omega(v + \omega r)\,t\big)
$$

This is exact for constant target, unconditionally stable, and **frame-rate independent** (Rory Driscoll's exponential-damping result, generalized from 1st to 2nd order): composing steps of $dt_1, dt_2$ equals one step of $dt_1 + dt_2$.

### 3.2 Exact JavaScript — scalar spring

```js
// spring.js — critically damped (ζ=1) spring, closed-form integration.
export class CritSpring {
  /** @param {number} value initial value @param {number} omega rad/s (settle ≈ 5/ω s) */
  constructor(value = 0, omega = 8) {
    this.y = value; this.v = 0; this.target = value; this.omega = omega;
  }
  set(value) { this.y = value; this.v = 0; this.target = value; return this; }
  /** Advance by dt seconds (any dt ≥ 0; clamp upstream to ≤ 0.1 for sanity). */
  update(dt) {
    if (dt <= 0) return this.y;
    const w = this.omega, r = this.y - this.target;
    const c = this.v + w * r;                     // coefficient of t
    const e = Math.exp(-w * dt);
    this.y = this.target + e * (r + c * dt);
    this.v = e * (this.v - w * c * dt);
    return this.y;
  }
  get settled() { return Math.abs(this.y - this.target) < 1e-4 && Math.abs(this.v) < 1e-4; }
}
```

### 3.3 Discrete parameters: `activeOwner`, `recursionDepth`, `outcome`

Discrete quantities must never teleport. Map each to a continuous spring state; render from the continuous state, commit discrete reads only at settle:

| Parameter | Continuous encoding | Render rule | Discrete read |
|---|---|---|---|
| `tiltX`, `tiltY` | scalar spring directly | use `y` | — |
| `recursionDepth` | scalar spring to integer target | depth layers fade/scale by fractional `y` | `Math.round(y)` when `settled` |
| `activeOwner` | one spring per candidate (one-hot targets) | cross-fade opacity by spring values | `argmax` when settled |
| `outcome` | one spring per outcome (one-hot targets) | blend outcome glyphs/colors by weights | `argmax` when settled |

```js
// dampedParams.js
import { CritSpring } from './spring.js';

/** One-hot spring bank for categorical parameters (activeOwner, outcome). */
export class DampedCategory {
  constructor(keys, initial, omega = 6) {
    this.keys = [...keys];
    this.springs = new Map(keys.map(k => [k, new CritSpring(k === initial ? 1 : 0, omega)]));
    this.current = initial;
  }
  setTarget(key) {
    this.current = key;
    for (const [k, s] of this.springs) s.target = k === key ? 1 : 0;
  }
  update(dt) { for (const s of this.springs.values()) s.update(dt); }
  weight(key) { return this.springs.get(key).y; }              // for cross-fades
  get settled() { return [...this.springs.values()].every(s => s.settled); }
  get value() { return this.settled ? this.current : this.current; } // commit only via argmax below
  get argmax() {
    let best = this.keys[0], bw = -Infinity;
    for (const k of this.keys) { const w = this.weight(k); if (w > bw) { bw = w; best = k; } }
    return best;
  }
}

/** Full Quinelings parameter set, all critically damped. */
export class DampedState {
  constructor() {
    this.tiltX = new CritSpring(0, 10);          // pointer tilt — snappier (settle ≈ 0.5 s)
    this.tiltY = new CritSpring(0, 10);
    this.recursionDepth = new CritSpring(1, 5);  // execution — deliberate (settle ≈ 1 s)
    this.phaseSpeed = new CritSpring(1, 4);
    this.amplitude = new CritSpring(1, 4);
    this.activeOwner = new DampedCategory(['self', 'child', 'parent'], 'self', 6);
    this.outcome = new DampedCategory(['running', 'returned', 'branched', 'errored'], 'running', 6);
  }
  /** Single entry point per frame. dt clamped: tab-switch must not teleport springs. */
  update(rawDt) {
    const dt = Math.min(Math.max(rawDt, 0), 0.1);
    this.tiltX.update(dt); this.tiltY.update(dt);
    this.recursionDepth.update(dt);
    this.phaseSpeed.update(dt); this.amplitude.update(dt);
    this.activeOwner.update(dt); this.outcome.update(dt);
  }
  /** Fractional depth for rendering: layer i opacity = clamp(y − i, 0, 1). */
  layerOpacity(i) { return Math.min(1, Math.max(0, this.recursionDepth.y - i)); }
}
```

Pointer input feeds **targets only**:

```js
canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  state.tiltX.target = ((e.clientX - r.left) / r.width) * 2 - 1;   // [-1, 1]
  state.tiltY.target = ((e.clientY - r.top) / r.height) * 2 - 1;
});
```

### 3.4 Choosing $\omega$ (Quilez/Lisyarus guidance, quantified)

- $\omega = 4$–$6$: execution semantics (`recursionDepth`, `outcome`, `activeOwner`) — readable, deliberate, settle $0.8$–$1.2\,\text{s}$.
- $\omega = 8$–$12$: pointer response (`tiltX`, `tiltY`) — settle $0.4$–$0.6\,\text{s}$, still critically damped so it never rings.
- Never $\zeta < 1$ for state parameters: overshoot in a spring is charm in a mascot and a bug in a depth counter. Reserve under-damping ($\zeta \approx 0.7$) for purely decorative particles, if at all.

---

## Composed Frame Loop (All Three Laws)

```js
// main loop — frame frozen (Law 1), φ continuous & C² (Law 2), params damped (Law 3)
let phi = 0, last = performance.now();
function frame(now) {
  const rawDt = (now - last) / 1000; last = now;
  state.update(rawDt);                                   // Law 3 (clamps dt internally)
  phi += rawDt * state.phaseSpeed.y * 0.5;               // continuous phase, rad/s

  sampleRing(ring, phi, skeleton);                       // Law 2: C² bucket interpolation
  for (const p of fleshPoints) advectPoint(p, phi, Math.min(rawDt, 0.1), p);  // Law 2: ∇·v = 0
  for (const ridge of causticRidges) advectRidge(ridge, phi, Math.min(rawDt, 0.1));

  drawFrame(ctx, portraitFrame, skeleton, tmp);          // Law 1: constant affine map only
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
```

## Verification Checklist

1. **Camera stillness:** log `portraitFrame.scale/cx/cy` for 600 frames — must be bit-identical; screen-space centroid of the rest pose must not drift.
2. **$C^2$ continuity:** finite-difference `sampleRing` output across a bucket boundary; position, 1st, and 2nd differences must show no jump above $10^{-3}$ (linear blending fails the 1st, Catmull-Rom fails the 2nd).
3. **Incompressibility:** assert `|det J − 1| < 1e-2` in `advectRidge` during tests.
4. **No overshoot:** step `CritSpring.target` by $1$; assert $y$ approaches monotonically (critically damped signature) at $dt \in \{1/240, 1/60, 1/30, 0.1\}$.
5. **Frame-rate independence:** simulate the same $2\,\text{s}$ spring trajectory at 30 Hz and 240 Hz; final $y$ must agree to $10^{-6}$.


