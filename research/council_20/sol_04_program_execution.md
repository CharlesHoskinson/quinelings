# Live execution coupling for Quinelings

Execution should modulate a compiled body without changing its graph, seed, territories, or cached attractors. Keep the original geometry as the baseline; apply a bounded deformation when sampling each frame.

The design below adds two functions:

```js
WovenBody.stepResponse(body, phase, execution)
WovenBody.deformSample(response, sample)
```

`stepResponse` creates a deterministic response descriptor. `deformSample` applies that response to a geometric sample before it enters the existing frame buffer.

The supplied interface does not identify the four point-buffer channels or expose sample coordinates and normals. Consequently, buffer rewriting alone cannot reliably implement normal elevation. The integration point must be the existing mechanism sampler, where position, territory coordinate, tangent, and normal are known.

## 1. Execution state contract

Publish one immutable snapshot per evaluator transition. Rendering may reuse that snapshot across frames.

```ts
type ExecutionState = {
  revision: number;             // Monotonically increasing evaluator transition ID
  activeOwner: number | null;   // Graph node ID; never an array index by implication

  nodeWeights?: Record<string, number>;  // Current activity in [0, 1]
  nodeEnergies?: Record<string, number>; // Decaying activity in [0, 1]

  stackRatio: number;           // Current depth / configured depth budget, clamped
  fuelRatio: number;            // Remaining fuel / initial fuel, clamped
  stepImpulse: number;          // Firing amplitude in [0, 1]

  outcome: "Running" | "Done" | "Rejected" | "Exhausted";

  // Explicit clocks make replay independent of render frequency.
  stepAge: number;              // Seconds since this transition
  terminalAge: number;          // Seconds since terminal outcome; otherwise 0

  seamPulse: null | {
    donorNode: number;
    recipientNode: number;
    integrationNode?: number;
    type?: string;
    amplitude: number;         // [0, 1]
    age: number;               // Seconds since an actual seam crossing
  };
};
```

Use `nodeWeights` for instantaneous operation participation and `nodeEnergies` for recent execution history. When both exist, weights take precedence for that node. When neither has an entry, the active owner receives weight one and other owners receive zero.

For evaluator event times \(t_j\), a suitable energy update is

\[
E_i(t_j)=\operatorname{clip}_{[0,1]}
\left(E_i(t_{j-1})e^{-(t_j-t_{j-1})/\tau_E}
+\eta\,\mathbf 1_{i=i_j}\right),
\qquad \tau_E=0.35\text{ s},\quad \eta=0.65.
\]

A CEK transition fires the owner of the expression being reduced or continuation operation being applied. Administrative transitions may have `activeOwner: null` and `stepImpulse: 0`. For task execution, the owner is the operation performing the scheduled transition. Stack depth measures the continuation stack or task ancestry under a fixed policy; it must not alternate between unrelated queue and stack measurements.

Compute

\[
s=\min(1,d/\max(1,d_{\max})),\qquad
f=\operatorname{clip}_{[0,1]}(F_{\rm remaining}/\max(1,F_{\rm initial})).
\]

These are display signals, not evaluator control inputs.

## 2. Shared geometric response

For a sample owned by node \(i\), let its territory be \([u_0,u_1]\). Define

\[
\xi=\operatorname{clip}_{[0,1]}
\frac{u-u_0}{u_1-u_0},
\qquad
w(\xi)=\sin^2(\pi\xi).
\]

A degenerate territory receives zero displacement. The window makes both displacement and its first derivative vanish at territory boundaries.

Let \(\mathbf p\) be the baseline position, \(\mathbf T\) a unit tangent, \(\mathbf N\) a perpendicular unit normal, and \(\mathbf B=\mathbf T\times\mathbf N\). Let \(L\) be a fixed characteristic body length.

### Operation firing: traveling Gaussian pulse

Use the term “soliton” visually: this is a Gaussian traveling pulse, not a claimed solution of a soliton PDE.

\[
c(a)=0.12+0.65a,\qquad \sigma=0.12,
\]

\[
G(\xi,a)=
e^{-a/0.28}
e^{-(\xi-c(a))^2/(2\sigma^2)}.
\]

The active operation produces normal elevation

\[
D_{\rm fire}=0.08L\,I\,W_i\,G(\xi,a),
\]

where \(I=\texttt{stepImpulse}\), \(a=\texttt{stepAge}\), and \(W_i\) is owner activity.

### Recursion: unfurling and knot release

Use stack ratio to increase a bounded envelope:

\[
U(s)=\frac{\tanh(2s)}{\tanh 2}.
\]

Each mechanism supplies coefficients \(a_m,b_m,k_m\). Its recursion response is

\[
D_{\rm stack}
=L\,a_m U(s)\sin(\pi\xi),
\]

\[
D_{\rm unfold}
=L\,b_m U(s)(2\xi-1).
\]

The first opens folds along the normal. The second separates neighboring portions along the binormal. Reduce the visual knot phase by \(1-0.6U(s)\); this releases knots as depth grows.

### Terminal response

Assume `phase` is in radians. If the existing renderer uses cycles, convert it once with \(2\pi\).

For `Done`, blend toward the nearest harmonic phase:

\[
q=\frac{\pi}{2}\operatorname{round}
\left(\frac{\phi}{\pi/2}\right),\qquad
h=1-e^{-t_D/0.45},
\]

\[
\phi_D=(1-h)\phi+hq.
\]

Freeze the baseline phase at terminal entry so that the target does not move. The code below accepts this frozen value as `phase` for terminal snapshots. Its response approaches a stationary harmonic shape.

For `Rejected` and `Exhausted`, use bounded exponential shear:

\[
r(t)=\min(2,\operatorname{expm1}(\lambda t)),
\]

\[
D_{\rm shear}
=0.018L\,r(t)\sin(2\pi\xi+\phi),
\]

with \(\lambda=1.4\) for rejection and \(0.8\) for exhaustion. Exhaustion additionally scales shear by \(1+0.5(1-f)\).

This is a visual Lyapunov-style divergence cue; it does not establish a Lyapunov exponent for the underlying system. Its cap prevents runaway geometry.

### Seam crossing

Emit a seam pulse only when execution actually crosses the recorded integration boundary. Merely possessing offspring seam metadata does not trigger it.

For donor, recipient, and integration owners,

\[
D_{\rm seam}
=0.06L A_S e^{-t_S/0.40}
\sin(2\pi\xi-9t_S).
\]

The recipient receives the opposite sign to the donor; the integration owner receives a positive pulse unless it is also the recipient.

### Combined deformation

With mechanism knot phase

\[
K_m=2\pi k_m(1-0.6U(s))\xi+\phi_*,
\]

define

\[
\mathbf p'=\mathbf p+w(\xi)\left[
\left(
D_{\rm fire}+D_{\rm stack}+D_{\rm seam}
+0.008L\sin K_m
\right)\mathbf N
+
\left(D_{\rm unfold}+D_{\rm shear}\right)\mathbf B
\right].
\]

The small harmonic term is introduced only while execution is active or terminal settling is visible. Idle bodies receive no execution deformation.

## 3. Mechanism mapping

All eight mechanisms receive the same firing pulse and terminal rules. Their stack coefficients express the response through their existing geometric structure.

| Mechanism | \(a_m\) | \(b_m\) | \(k_m\) | Visible response |
|---|---:|---:|---:|---|
| `pleated-braid` | .080 | .025 | 5 | Pleats lift; braid crossings loosen |
| `lorenz-flow` | .045 | .060 | 3 | Orbit ribbons separate along their transverse frame |
| `clifford-flow` | .040 | .050 | 4 | Cloud ribbons expand locally around active territories |
| `recursive-affine` | .100 | .045 | 3 | Branch ribbons open with stack depth |
| `recursive-julia` | .055 | .035 | 6 | Contour folds lift and separate |
| `logarithmic-mantle` | .100 | .035 | 3 | Mantle whorls open |
| `toroidal-weave` | .060 | .060 | 5 | Toroidal crossings spread and untwist visually |
| `phyllotaxis-fan` | .110 | .025 | 4 | Fan leaves lift and separate |

These are geometric unfurling effects. They do not increase IFS recursion depth, change Julia iteration limits, integrate a new Lorenz orbit, or alter the authored number of whorls. Those operations would change compilation cost or identity.

For point-cloud mechanisms, construct the sampling frame from the underlying parameterization or a precomputed local neighborhood. Do not estimate normals from unrelated consecutive output points.

## 4. Drop-in JavaScript

Install this after `WovenBody` is defined. It adds deterministic response functions without changing compilation.

```js
(() => {
  "use strict";

  const TAU = 2 * Math.PI;
  const profiles = {
    "pleated-braid":      [.080, .025, 5],
    "lorenz-flow":        [.045, .060, 3],
    "clifford-flow":      [.040, .050, 4],
    "recursive-affine":   [.100, .045, 3],
    "recursive-julia":    [.055, .035, 6],
    "logarithmic-mantle": [.100, .035, 3],
    "toroidal-weave":     [.060, .060, 5],
    "phyllotaxis-fan":    [.110, .025, 4]
  };

  const finite = (x, fallback = 0) =>
    Number.isFinite(x) ? x : fallback;
  const clamp01 = x => Math.max(0, Math.min(1, finite(x)));
  const age = x => Math.max(0, finite(x));

  function cross(a, b) {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0]
    ];
  }

  function unit(v, fallback) {
    const n = Math.hypot(...v);
    return n > 1e-10 ? v.map(x => x / n) : fallback.slice();
  }

  function frame(tangent, normal) {
    const t = unit(tangent, [1, 0, 0]);
    const dot = normal.reduce((sum, x, j) => sum + x * t[j], 0);
    let n = normal.map((x, j) => x - dot * t[j]);

    if (Math.hypot(...n) < 1e-10) {
      const axis = Math.abs(t[2]) < .9 ? [0, 0, 1] : [0, 1, 0];
      n = cross(axis, t);
    }

    n = unit(n, [0, 1, 0]);
    return { n, b: unit(cross(t, n), [0, 0, 1]) };
  }

  WovenBody.stepResponse = function stepResponse(body, phase, execution) {
    const e = execution || {};
    const outcome = ["Done", "Rejected", "Exhausted"].includes(e.outcome)
      ? e.outcome : "Running";

    // Contract: body is the authored record or exposes record.
    const record = body.record || body;
    const profile = profiles[record.mechanism];
    if (!profile) throw new Error("Unknown woven mechanism");

    const s = clamp01(e.stackRatio);
    const terminal = outcome !== "Running";
    const terminalAge = age(e.terminalAge);
    const basePhase = finite(phase);
    const lock = outcome === "Done"
      ? 1 - Math.exp(-terminalAge / .45) : 0;
    const target = Math.round(basePhase / (Math.PI / 2)) * (Math.PI / 2);

    const weights = { ...(e.nodeWeights || {}) };
    const energies = { ...(e.nodeEnergies || {}) };
    const seam = e.seamPulse ? { ...e.seamPulse } : null;

    return {
      revision: e.revision,
      outcome,
      phase: basePhase + lock * (target - basePhase),
      stack: Math.tanh(2 * s) / Math.tanh(2),
      fuel: clamp01(e.fuelRatio),
      impulse: clamp01(e.stepImpulse),
      stepAge: age(e.stepAge),
      terminalAge,
      activeOwner: e.activeOwner ?? null,
      weights,
      energies,
      seam,
      profile,
      terminal
    };
  };

  WovenBody.deformSample = function deformSample(r, sample) {
    const {
      position: p, tangent, normal, owner, u, territory,
      scale = 1
    } = sample;

    const width = territory.u[1] - territory.u[0];
    if (!(width > 0) || !(scale > 0)) return p.slice();

    const xi = Math.max(0, Math.min(1,
      (u - territory.u[0]) / width
    ));
    const window = Math.sin(Math.PI * xi) ** 2;
    const { n, b } = frame(tangent, normal);
    const [normalGain, spreadGain, knots] = r.profile;

    const own = Object.prototype.hasOwnProperty;
    const key = String(owner);
    const activity = own.call(r.weights, key)
      ? clamp01(r.weights[key])
      : own.call(r.energies, key)
        ? clamp01(r.energies[key])
        : Number(owner === r.activeOwner);

    const center = .12 + .65 * r.stepAge;
    const gaussian = Math.exp(-r.stepAge / .28)
      * Math.exp(-.5 * ((xi - center) / .12) ** 2);

    const fire = .08 * r.impulse * activity * gaussian;
    const unfurl = normalGain * r.stack * Math.sin(Math.PI * xi);
    const spread = spreadGain * r.stack * (2 * xi - 1);

    let seam = 0;
    if (r.seam) {
      const s = r.seam;
      let sign = 0;
      if (owner === s.recipientNode) sign = -1;
      else if (owner === s.donorNode || owner === s.integrationNode) sign = 1;

      const t = age(s.age);
      seam = sign * .06 * clamp01(s.amplitude)
        * Math.exp(-t / .40) * Math.sin(TAU * xi - 9 * t);
    }

    let shear = 0;
    if (r.outcome === "Rejected" || r.outcome === "Exhausted") {
      const exhausted = r.outcome === "Exhausted";
      const lambda = exhausted ? .8 : 1.4;
      // Cap the exponent before evaluating it.
      const growth = Math.expm1(Math.min(
        Math.log(3), lambda * r.terminalAge
      ));
      shear = .018 * growth
        * (exhausted ? 1 + .5 * (1 - r.fuel) : 1)
        * Math.sin(TAU * xi + r.phase);
    }

    const visibility = Math.max(
      r.stack,
      r.impulse * activity * Math.exp(-r.stepAge / .28),
      Math.abs(seam) / .06,
      Number(r.terminal)
    );
    const harmonic = .008 * visibility * Math.sin(
      TAU * knots * (1 - .6 * r.stack) * xi + r.phase
    );

    const dn = scale * window * (fire + unfurl + seam + harmonic);
    const db = scale * window * (spread + shear);

    return p.map((x, j) => x + dn * n[j] + db * b[j]);
  };
})();
```

### Frame integration

Build the descriptor once per frame. Apply it inside every mechanism’s existing sample loop:

```js
const response = WovenBody.stepResponse(body, phase, execution);

// Inside the existing sampling loop:
const displayedPosition = WovenBody.deformSample(response, {
  position: baselinePosition,
  tangent: baselineTangent,
  normal: baselineNormal,
  owner: territory.node,
  u,
  territory,
  scale: characteristicBodyLength
});

// Write displayedPosition using the existing point-buffer convention.
// Keep the existing fourth channel and owner encoding.
```

For terminal snapshots, retain the phase captured at terminal entry and pass that value to both baseline sampling and `stepResponse`. For running snapshots, use the current animation phase.

Prefer generating ridges from deformed samples. If ridges have an independent sampler, apply the same response there so crests track the body.

## 5. CEK, task, and offspring semantics

For CEK evaluation, emit firing impulses on actual expression reductions and continuation applications. `Done` means a final value with no remaining continuation. `Rejected` means an explicit evaluator rejection. `Exhausted` means execution stopped because its resource budget ran out. Preserve the final stack ratio and fuel ratio for the terminal response.

For concurrent tasks, emit a snapshot per ordered transition and use decaying node energies to preserve overlapping activity. A single `activeOwner` identifies the latest transition; it does not represent every runnable task.

For offspring:

- **Compose:** pulse when donor output is consumed across the recorded recipient seam.
- **Mate:** pulse when evaluation reaches the inserted donor cone through its recorded integration boundary.
- **Merge:** pulse the `joined` report owner when the join operation actually executes.
- **Body:** preserve execution semantics; trait reseeding alone emits no seam pulse.

Stable graph IDs must survive composition. If transformations renumber nodes, remap territory owners and seam endpoints together before compilation.

## 6. Verification requirements

The implementation should be checked against these observable properties:

- Replaying the same snapshots at different frame rates produces the same sampled positions at matching timestamps.
- Territory endpoints receive zero displacement; adjacent territory responses meet continuously.
- An isolated firing raises the active territory and decays without modifying compiled geometry.
- Increasing stack ratio opens all eight mechanisms with bounded displacement.
- `Done` converges to a fixed harmonic shape when terminal phase and stack state are frozen.
- Rejection and exhaustion produce finite, capped shear.
- Seam pulses occur only on executed crossings and use the remapped offspring owner IDs.
- Invalid or degenerate territories cannot produce division-by-zero displacement.

The code is an integration-ready proposal, not a tested patch: the sampler frame conventions and compiled-body record location must be matched to the actual implementation.