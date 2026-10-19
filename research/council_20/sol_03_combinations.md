# Multi-mechanism Quineling offspring

A combination should preserve two compiled parent bodies and add a composition layer. Assigning one mechanism to the whole offspring would erase the causal distinction between donor and recipient.

Use two operations:

- **Graft:** retain the donor mechanism on its causal cone, retain the recipient mechanism elsewhere, and blend their geometry across an explicit seam collar.
- **Cross-modulate:** retain both mechanisms and let one parent’s bounded dynamical signal deform the other.

The offspring’s semantic ownership remains discrete even where its geometry blends smoothly.

## 1. Representation and causal ownership

```js
{
  model: "woven-combination-v1",
  operation: "compose", // mate | merge | symbiote
  mechanisms: [parentA.mechanism, parentB.mechanism],
  seam: {
    donorNode,
    recipientNode,
    integrationNode,
    type
  },
  territories: [{
    node,                // offspring graph node ID
    parent: 0,           // source mechanism
    component: 0,
    sourceNode,          // original parent node ID
    sourceU: [0, 1],      // source territory interval
    ticks: [0, 1024],     // authoritative offspring interval
    u: [0, 0.25]         // derived display interval
  }],
  collar: {
    boundary: 0.25,
    halfWidth: 0.04
  }
}
```

For `compose` and `mate`, construct the territory ordering from the **offspring graph**, using the composition’s node provenance:

1. Donor-cone nodes use Parent 0’s mechanism.
2. Recipient and integration nodes use Parent 1’s mechanism.
3. The selected donor territory ends exactly where the integration territory begins.
4. The geometric transition occupies a collar on both sides of that boundary.

Do not infer provenance solely from a `p0n*` spelling. Use the offspring builder’s rename map; prefixes are a fallback convention, not proof of ancestry.

A single linear territory chart cannot make every edge of a branching causal graph adjacent. For multiple seams, use separate component charts or explicitly designate which seam receives the collar.

## 2. Causal seam grafting

Let the seam collar be \([s-w,s+w]\), with

\[
\tau=\frac{u-(s-w)}{2w},\qquad
H(\tau)=6\tau^5-15\tau^4+10\tau^3.
\]

Within the collar, evaluate donor and recipient continuations \(A(u)\) and \(B(u)\). The base blend is

\[
P_0(u)=(1-H(\tau))A(u)+H(\tau)B(u).
\]

Because \(H'\) and \(H''\) vanish at both endpoints, this matches the donor’s position, first derivative, and second derivative at the left boundary, and the recipient’s corresponding derivatives at the right boundary—provided the continuations are \(C^2\).

### Geodesic arch

Let \(a=A(s-w)\), \(b=B(s+w)\), \(m=(a+b)/2\), and \(d=b-a\). Choose a unit normal \(n\perp d\). A semicircle joining the anchors is

\[
G(\tau)=m-\frac12\cos(\pi\tau)d
       +\frac{\|d\|}{2}\sin(\pi\tau)n.
\]

This is a great-circle geodesic on the sphere centered at \(m\), with radius \(\|d\|/2\). It is **not** an intrinsic geodesic of an arbitrary parent surface.

Add its deviation from the straight chord through a compact envelope:

\[
\begin{aligned}
L(\tau)&=(1-\tau)a+\tau b,\\
E(\tau)&=64\tau^3(1-\tau)^3,\\
P(u)&=P_0(u)+\alpha E(\tau)\bigl(G(\tau)-L(\tau)\bigr).
\end{aligned}
\]

Here \(E,E',E''\) vanish at the collar endpoints. Consequently the arch preserves the \(C^2\) attachment. Coincident anchors give a zero arch.

## 3. Attractor cross-modulation

Expose a bounded, three-channel parent signal:

\[
I_A(u,\phi)=(i_\phi,i_\theta,i_r)\in[-1,1]^3.
\]

For Lorenz and Clifford parents, derive these channels from normalized compiled trajectories or clouds. For recursive and family mechanisms, use bounded geometric observables or a mechanism-specific invariant extractor.

“Dynamical invariant” should be used carefully: a sampled coordinate observable is generally not invariant under coordinate changes or flow evolution. The API below accepts an extractor, so a mathematically defined invariant can replace the default geometric signal.

Deform Parent B by

\[
\begin{aligned}
\phi_B'&=\phi+\epsilon_\phi i_\phi,\\
\theta&=\epsilon_\theta i_\theta,\\
\rho&=1+\epsilon_r i_r.
\end{aligned}
\]

With recipient spine \(c_B\), unit tangent \(T_B\), and offset \(q=P_B-c_B\),

\[
P_B'=c_B+q_\parallel+
\rho R_{T_B}(\theta)q_\perp.
\]

This changes transverse torsion and radial breathing while preserving the axial offset. Require \(0\le\epsilon_r<1\) to keep the radial multiplier positive.

For `merge`, use A → B modulation. For `symbiote`, evaluate both directions from the **unmodified** parents; this avoids order-dependent feedback.

## 4. Exact territory invariants

Use positive integer tick lengths as the authoritative partition. For total ticks \(D\),

\[
0=q_0<q_1<\cdots<q_n=D,\qquad
T_i=[q_i/D,q_{i+1}/D).
\]

The final territory includes \(u=1\).

This provides:

- Exact integer contiguity: `end[i] === start[i + 1]`.
- Complete coverage of `[0, 1]`.
- No positive-length overlaps.
- Deterministic ownership at boundaries.
- No accumulation of floating-point widths.

Derived floating-point endpoints are shared values. They are not necessarily exact rational representations.

## 5. Drop-in JavaScript

The following installs both methods on an existing `WovenBody` object. It uses the existing `frame` API and requires no changes to parent compilers.

The caller supplies ordered offspring territories and their parent provenance. `opts.ownerIndex` maps offspring node IDs to the graph indices expected by the renderer.

```js
function installWovenCombinations(WovenBody) {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const H = t => t * t * t * (10 + t * (-15 + 6 * t));
  const add = (a, b) => a.map((x, i) => x + b[i]);
  const sub = (a, b) => a.map((x, i) => x - b[i]);
  const mul = (a, s) => a.map(x => x * s);
  const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
  const norm = a => Math.hypot(...a);
  const unit = (a, fallback = [1, 0, 0]) => {
    const n = norm(a);
    return n > 1e-12 ? mul(a, 1 / n) : fallback.slice();
  };
  const mix = (a, b, t) =>
    a.map((x, i) => x + t * (b[i] - x));

  function normalTo(tangent, preferred) {
    const t = unit(tangent);
    let p = preferred || [0, 0, 1];
    let n = sub(p, mul(t, dot(p, t)));
    if (norm(n) < 1e-8) {
      p = Math.abs(t[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0];
      n = sub(p, mul(t, dot(p, t)));
    }
    return unit(n);
  }

  function rotate(v, axis, angle) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return add(
      add(mul(v, c), mul(cross(axis, v), s)),
      mul(axis, dot(axis, v) * (1 - c))
    );
  }

  function requireFinite(x, label) {
    if (!Number.isFinite(x)) throw new Error(`${label} must be finite`);
    return x;
  }

  WovenBody.authorCombination = function (
    parentA, parentB, recipe, opts = {}
  ) {
    const operation = recipe.operation || recipe.kind;
    if (!["compose", "mate", "merge", "symbiote"].includes(operation)) {
      throw new Error("Unsupported combination operation");
    }

    const input = recipe.territories;
    if (!Array.isArray(input) || !input.length) {
      throw new Error("Ordered provenance territories are required");
    }

    let total = 0;
    const territories = input.map(t => {
      const weight = t.weight ?? 1;
      if (!Number.isSafeInteger(weight) || weight <= 0) {
        throw new Error("Territory weights must be positive safe integers");
      }
      if (t.parent !== 0 && t.parent !== 1) {
        throw new Error("Each territory requires parent 0 or 1");
      }

      const sourceU = t.sourceU || [0, 1];
      if (
        sourceU.length !== 2 ||
        !Number.isFinite(sourceU[0]) ||
        !Number.isFinite(sourceU[1]) ||
        sourceU[0] < 0 || sourceU[1] > 1 ||
        sourceU[0] >= sourceU[1]
      ) {
        throw new Error("Invalid sourceU interval");
      }

      const start = total;
      total += weight;
      if (!Number.isSafeInteger(total)) {
        throw new Error("Territory tick total exceeds safe integer range");
      }
      return {
        ...t,
        component: t.component ?? 0,
        sourceU: sourceU.slice(),
        ticks: [start, total]
      };
    });

    // Reuse boundary values rather than accumulating normalized widths.
    const boundaries = [0, ...territories.map(t => t.ticks[1] / total)];
    territories.forEach((t, i) => {
      t.u = [boundaries[i], boundaries[i + 1]];
    });

    let collar = null;
    if (operation === "compose" || operation === "mate") {
      const seam = recipe.seam;
      if (!seam) throw new Error("Grafts require a causal seam");

      const i = territories.findIndex(t =>
        t.node === seam.donorNode && t.parent === 0
      );
      if (
        i < 0 || i + 1 >= territories.length ||
        territories[i + 1].node !== seam.integrationNode ||
        territories[i + 1].parent !== 1
      ) {
        throw new Error("Donor and integration territories must be adjacent");
      }

      const left = territories[i], right = territories[i + 1];
      const maxWidth = Math.min(
        left.u[1] - left.u[0],
        right.u[1] - right.u[0]
      ) / 2;
      const halfWidth = requireFinite(
        recipe.halfWidth ?? maxWidth / 2, "halfWidth"
      );
      if (!(halfWidth > 0 && halfWidth <= maxWidth)) {
        throw new Error("Seam collar exceeds neighboring territories");
      }
      collar = {
        boundary: left.u[1],
        halfWidth,
        leftIndex: i,
        rightIndex: i + 1
      };
    }

    const gains = {
      phase: recipe.gains?.phase ?? 0.12,
      twist: recipe.gains?.twist ?? 0.35,
      radial: recipe.gains?.radial ?? 0.15
    };
    Object.entries(gains).forEach(([k, v]) => requireFinite(v, k));
    if (gains.radial < 0 || gains.radial >= 1) {
      throw new Error("radial gain must be in [0, 1)");
    }

    const archGain = requireFinite(recipe.archGain ?? 0.5, "archGain");

    return {
      model: "woven-combination-v1",
      operation,
      mechanisms: [parentA.mechanism, parentB.mechanism],
      seam: recipe.seam ? { ...recipe.seam } : null,
      totalTicks: total,
      territories,
      collar,
      gains,
      archGain,
      archNormal: opts.archNormal || null
    };
  };

  WovenBody.combine = function (
    parentA, parentB, recipe, phase, opts = {}
  ) {
    requireFinite(phase, "phase");
    const record = recipe.model === "woven-combination-v1"
      ? recipe
      : WovenBody.authorCombination(parentA, parentB, recipe, opts);

    const budget = opts.budget ?? 2048;
    const samples = opts.samples ?? Math.max(256, budget);
    if (!Number.isInteger(budget) || budget < 2 ||
        !Number.isInteger(samples) || samples < 2) {
      throw new Error("budget and samples must be integers >= 2");
    }

    // The parent frame must expose a stable longitudinal sample ordering.
    // Supply opts.sample when a mechanism's frame order is not longitudinal.
    const parents = [parentA, parentB];
    const frames = parents.map(body =>
      WovenBody.frame(body, phase, {
        budget: samples,
        crests: opts.crests
      })
    );

    function sample(parent, u, atPhase = phase) {
      u = clamp(u, 0, 1);
      if (opts.sample) {
        return opts.sample(parents[parent], u, atPhase).slice(0, 3);
      }
      if (atPhase !== phase) {
        throw new Error(
          "Phase modulation requires opts.sample(body, u, phase)"
        );
      }

      const points = frames[parent].points;
      const count = points.length / 4;
      if (!Number.isInteger(count) || count < 2) {
        throw new Error("Invalid parent frame");
      }
      const x = u * (count - 1);
      const i = Math.min(count - 2, Math.floor(x));
      const a = Array.from(points.subarray(4 * i, 4 * i + 3));
      const b = Array.from(points.subarray(4 * (i + 1), 4 * (i + 1) + 3));

      // C² in u at sample knots; derivatives vanish at each knot.
      return mix(a, b, H(x - i));
    }

    function localSource(t, u) {
      const x = clamp((u - t.u[0]) / (t.u[1] - t.u[0]), 0, 1);
      return t.sourceU[0] + x * (t.sourceU[1] - t.sourceU[0]);
    }

    function base(t, u, atPhase = phase) {
      return sample(t.parent, localSource(t, u), atPhase);
    }

    function invariant(parent, u) {
      let value;
      if (opts.invariant) {
        value = opts.invariant(parents[parent], u, phase);
      } else {
        // Bounded geometric observable, not a claimed conserved quantity.
        const p = sample(parent, u);
        const scale = opts.signalScale ?? 1;
        if (!(Number.isFinite(scale) && scale > 0)) {
          throw new Error("signalScale must be positive");
        }
        value = p.map(x => Math.tanh(x / scale));
      }
      if (!value || value.length !== 3 ||
          !Array.from(value).every(Number.isFinite)) {
        throw new Error("Invariant extractor must return three finite values");
      }
      return Array.from(value, x => clamp(x, -1, 1));
    }

    function modulated(t, u) {
      const sourceU = localSource(t, u);
      const signal = invariant(1 - t.parent, sourceU);
      const gains = record.gains;
      const shiftedPhase = phase + gains.phase * signal[0];
      const p = sample(t.parent, sourceU, shiftedPhase);

      if (!opts.spine) {
        throw new Error("Cross-modulation requires opts.spine");
      }
      const spine = opts.spine(
        parents[t.parent], sourceU, shiftedPhase
      );
      const center = spine.center;
      const axis = unit(spine.tangent);
      const q = sub(p, center);
      const axial = mul(axis, dot(q, axis));
      const transverse = sub(q, axial);
      const twisted = rotate(transverse, axis, gains.twist * signal[1]);
      return add(
        center,
        add(axial, mul(twisted, 1 + gains.radial * signal[2]))
      );
    }

    function territoryAt(u) {
      // Half-open ownership, with u=1 assigned to the final territory.
      const ts = record.territories;
      let lo = 0, hi = ts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (u < ts[mid].u[1]) hi = mid;
        else lo = mid + 1;
      }
      return ts[lo];
    }

    function graft(u, territory) {
      const c = record.collar;
      const start = c.boundary - c.halfWidth;
      const end = c.boundary + c.halfWidth;
      if (u < start || u > end) return base(territory, u);

      const left = record.territories[c.leftIndex];
      const right = record.territories[c.rightIndex];
      const tau = (u - start) / (end - start);

      // Extend each source chart through the whole collar without clamping
      // at the seam itself. The collar bounds keep source coordinates valid.
      function continuation(t) {
        const x = (u - t.u[0]) / (t.u[1] - t.u[0]);
        const sourceU =
          t.sourceU[0] + x * (t.sourceU[1] - t.sourceU[0]);
        return sample(t.parent, sourceU);
      }

      const a = base(left, start);
      const b = base(right, end);
      const delta = sub(b, a);
      const midpoint = mul(add(a, b), 0.5);
      const normal = normalTo(delta, record.archNormal);
      const arc = add(
        sub(midpoint, mul(delta, 0.5 * Math.cos(Math.PI * tau))),
        mul(normal, 0.5 * norm(delta) * Math.sin(Math.PI * tau))
      );
      const envelope = 64 * tau ** 3 * (1 - tau) ** 3;
      return add(
        mix(continuation(left), continuation(right), H(tau)),
        mul(sub(arc, mix(a, b, tau)), record.archGain * envelope)
      );
    }

    const points = new Float32Array(budget * 4);
    const owners = new Uint16Array(budget);

    for (let k = 0; k < budget; k++) {
      const u = k / (budget - 1);
      const t = territoryAt(u);
      let p;

      if (record.collar) {
        p = graft(u, t);
      } else if (record.operation === "symbiote" || t.parent === 1) {
        p = modulated(t, u);
      } else {
        p = base(t, u);
      }

      if (!p.every(Number.isFinite)) {
        throw new Error("Non-finite combination geometry");
      }
      const owner = typeof opts.ownerIndex === "function"
        ? opts.ownerIndex(t.node)
        : opts.ownerIndex?.[t.node];
      if (!Number.isInteger(owner) || owner < 0 || owner > 65535) {
        throw new Error(`Missing or invalid owner index for ${t.node}`);
      }

      points.set(p, 4 * k);
      // The reference specifies stride, but not the fourth lane's meaning.
      points[4 * k + 3] = opts.fourth
        ? opts.fourth({ u, territory: t, phase })
        : 1;
      owners[k] = owner;
    }

    return {
      points,
      owners,
      // Use the renderer's existing ridge schema through this adapter.
      ridges: opts.makeRidges
        ? opts.makeRidges({ record, points, owners, phase })
        : [],
      combination: record
    };
  };
}
```

### Integration constraints

The frame fallback is suitable only when parent samples have a stable longitudinal ordering. Attractor clouds often do not. For those mechanisms, supply `opts.sample(body, u, phase)` using the compiled orbit, selected cloud path, IFS address, Julia contour, or family parameterization.

For grafts, source charts should reserve continuation margins beyond their seam endpoints. The code clamps exhausted source coordinates; that preserves \(C^2\) with its quintic fallback sampler but can flatten the transition. A native sampler should provide deliberate continuations.

The fallback’s quintic interpolation gives \(C^2\) **spatial curves at fixed phase**, with zero derivatives at sample knots. It does not establish temporal smoothness, surface regularity, injectivity, collision avoidance, or nonzero tangent speed. Native mechanism samplers are preferable for production geometry.

## 6. Acceptance checks

Before integration, verify:

1. Every territory’s integer end equals the next territory’s integer start; the total begins at zero and ends at `totalTicks`.
2. Seam neighbors match the actual offspring graph edge and provenance map.
3. Outside the collar, graft samples equal their assigned parent samples.
4. At both collar boundaries, position and first two spatial derivatives agree with the corresponding parent continuation.
5. Zero modulation gains reproduce recipient geometry.
6. Symbiote results are independent of parent evaluation order.
7. All owners resolve to valid offspring graph indices.
8. Every supported mechanism returns finite geometry throughout its source intervals.

This is an implementation design and supplied code; it has not been executed against the reference repository.