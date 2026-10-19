# Quineling Council Specialist #4: Live Program Execution Coupling & CEK / Task Trace Response

## 0. Design Position

Quinelings must not *replay* a program. They must be *deformed* by it, live, with bounded energy, reversible transients, and terminal states that are visually and mathematically distinct without destroying identity (`mechanism`, `seed`, topology).

The coupling is therefore:

```
CEK / Task Trace  ->  execution (normalized, clamped)  ->  WovenBody.stepResponse(body, phase, execution)  ->  WovenBody.frame(body, phaseEff, { ..., response })
```

`stepResponse` is pure with respect to `body` topology. It produces an ephemeral `Response` frame object. It never mutates `strands`, `folds`, `territories`, precomputed `orbit`/`cloud`/`branches`/`julia`, or seed. All deformation is applied at sampling time in `frame` / `computeBasis` / `point`, so one compiled body serves any number of concurrent executions by passing different `response` objects.

Three physical metaphors, one per input channel:

| Channel | Driver | Metaphor | Bounded by |
|---|---|---|---|
| Active operation firing | `activeOwner`, `nodeWeights`, `stepImpulse` | Gaussian soliton travelling on the owner's territory `[u0,u1]`, elevating along the surface normal | `stepImpulse ∈ [0,1]`, territory-localized |
| Recursion / task stack | `stackRatio` | Unfurling: branches open, whorls multiply, knots tighten as stack deepens | `stackRatio ∈ [0,1]`, smooth, hysteresis-free |
| Terminal outcome | `outcome`, `seamPulse` | `Done`: harmonic phase-lock (damping to lattice). `Rejected`/`Exhausted`: Lyapunov shear (exponential divergence along `u`) | latch with decay constant, never NaN |

---

## 1. The `execution` State Contract

### 1.1 Type

```ts
type Outcome = 'Running' | 'Done' | 'Rejected' | 'Exhausted' | null;

interface ExecutionState {
  // Index into body.territories / graph node id of the operation firing this step.
  // -1 or null = no active operation (idle breathing only).
  activeOwner: number;            // int, -1 = none

  // Per-node firing weight this step. Length = territories.length.
  // Either nodeWeights (preferred, sparse semantic weight) or nodeEnergies
  // (accumulated, decayed) may be supplied; stepResponse merges them.
  nodeWeights?: Float32Array | number[];  // w_i >= 0, typically sum = 1
  nodeEnergies?: Float32Array | number[]; // e_i >= 0, caller-decayed or raw counts

  // CEK stack depth / max observed depth this run, clamped [0,1].
  // 0 = top-level, 1 = deepest recursion / full task stack.
  stackRatio: number;             // s ∈ [0,1]

  // Remaining fuel / initial fuel, clamped [0,1]. 1 = fresh, 0 = spent.
  // Modulates amplitude globally: a spent Quineling moves less, except
  // that Exhausted overrides via outcome shear (§4.3).
  fuelRatio: number;              // f ∈ [0,1]

  // Impulse of THIS step only. Caller sets 1.0 on a firing step and lets
  // stepResponse decay it across frames (see §2.2), OR sets the raw
  // per-frame value each frame. Must be in [0,1]. 0 = no new firing.
  stepImpulse: number;            // I ∈ [0,1]

  // Terminal latch. null/'Running' = in flight. Once set to a terminal
  // value, caller keeps sending it; stepResponse integrates terminalTime.
  outcome: Outcome;

  // Offspring seam excitation from qdl-v1-offspring.js:
  // seam = { donorNode, recipientNode, type, integrationNode }.
  // seamPulse.p is 1.0 at the compose/mate/merge/body event, decaying
  // thereafter. Nodes are graph node ids resolved via territories[].node.
  seamPulse?: { donorNode: number, recipientNode: number,
                integrationNode?: number, p: number } | null;

  // Monotone step counter and wall/phase time of this frame, for decay
  // integration independent of frame rate.
  step?: number;                  // int >= 0
  dt?: number;                    // seconds since last frame, default 1/60
}
```

### 1.2 Normalization rules (enforced inside `stepResponse`, never trusted)

```
s  = clamp(stackRatio, 0, 1)
f  = clamp(fuelRatio,  0, 1)
I  = clamp(stepImpulse,0, 1)
w_i = max(0, nodeWeights?.[i] ?? 0);  W = Σ w_i;  if W > 0: w_i /= max(W,1)   // do not amplify multi-fire steps
e_i = nodeEnergies ? e_i / (1 + e_i) : 0                                       // soft-saturate raw energies to [0,1)
a_i = clamp(w_i + 0.5 * e_i, 0, 1)                                             // effective per-node activation
```

If both weight arrays are absent, `a_i = (i === activeOwner ? 1 : 0)`. If `activeOwner < 0` and no weights, all `a_i = 0` — the body idles.

**Fuel gating.** Effective impulse is fuel-scaled so depletion reads as tiredness, not death:

```
I_eff = I * (0.25 + 0.75 * f)          // floor 0.25: even spent bodies twitch on firing
```

Terminal outcomes bypass this gate (§4.3): `Exhausted` must be *visible* at `f = 0`.

### 1.3 `Response` — output of `stepResponse`

```ts
interface StepResponse {
  phaseEff: number;                 // phase after outcome phase-locking (§4.1)
  a: Float32Array;                  // per-territory activation a_i ∈ [0,1], decayed (§2.2)
  owner: number;                    // resolved active territory index, -1 if none
  uc: number, sigma: number;        // soliton centre / width in u-space (§2.1)
  amp: number;                      // soliton amplitude after fuel gate & impulse decay
  s: number; f: number;             // clamped stackRatio, fuelRatio (echoed for samplers)
  unfurl: number;                   // U(s) = s^1.5 smoothed, branch/whorl opening factor [0,1]
  shear: number;                    // Lyapunov shear rate λ_shear >= 0; 0 unless terminal-negative
  lock: number;                     // phase-lock strength ∈ [0,1]; >0 only for Done
  seamAmp: number;                  // decayed seam pulse amplitude [0,1]
  seamDonor: number; seamRecip: number; seamInteg: number;  // territory indices, -1 if none
  terminal: Outcome;                // latched outcome or null
  // Sampler helpers (bound closures, allocation-free after first call):
  soliton(u: number, ownerIdx: number): number;   // §2.1 elevation profile in [0, amp]
  seamGlow(u: number, ownerIdx: number): number;  // §5 ridge/owner tint weight
}
```

---

## 2. Core Response Mathematics

### 2.1 Gaussian soliton on the active territory

Each territory owns `u ∈ [u0, u1]` (from `territories[i].u`). The firing operation injects a soliton centred in that interval, travelling with `phase`:

```
c_i   = (u0_i + u1_i) / 2                       // territory centre
L_i   = max(u1_i - u0_i, 1e-4)                  // territory width
uc    = c_owner + 0.35 * L_owner * sin(phase)   // soliton sloshes within territory, never escapes it
sigma = 0.18 * L_owner                          // narrow: ~5σ spans the territory

G(u)  = exp( - (u - uc)^2 / (2 sigma^2) )       // ∈ (0,1], peak 1 at uc

elevation(u, i) = amp * a_i * G(u)              // only the owner's territory (and weighted neighbours via a_i) rise
```

Normal elevation: the sampled point `P(u,v)` with (approximate) surface normal `N̂(u,v)` is displaced

```
P' = P + N̂ * elevation(u, i) * ridgeScale
```

where `ridgeScale` is mechanism-specific (§3, column "Soliton gain") and `N̂` is computed by finite differences of the un-displaced sampler (already available wherever `frame` differentiates strands for `ridges`; for `LifeformFamilies.point`, use `∂P/∂u × ∂P/∂v` normalized, falling back to radial direction `P - centre` when degenerate). The soliton is a *soliton* and not a bump because `uc` is phase-advected: it carries energy along `u` without dispersing — `sigma` is constant, only `amp` decays.

### 2.2 Impulse and activation decay (frame-rate independent)

`stepResponse` is stateful per execution via a WeakMap keyed on the `execution` object identity (or an explicit `body._resp` slot in the drop-in code, §6). Decay uses `dt`:

```
decayImpulse = exp(-dt / tau_I),  tau_I = 0.35 s     // stepImpulse visible ~1 s
decayAct     = exp(-dt / tau_a),  tau_a = 0.90 s     // territory glow lingers longer

amp_t   = max(I_eff, amp_{t-1} * decayImpulse)       // new firing re-peaks instantly
a_i,t   = max(a_i (input), a_i,t-1 * decayAct)       // per-territory envelope
seamAmp_t = max(p (input), seamAmp_{t-1} * exp(-dt / 1.2))
```

This gives the characteristic Quineling gesture: sharp attack on the firing frame, exponential release — a plucked strand, not a toggled light.

### 2.3 Stack unfurling

```
U(s) = smoothstep(s)^1.5  where smoothstep(s) = s^2 (3 - 2s)
```

`U` is 0 at empty stack, 1 at full stack, with slow onset (shallow recursion barely opens the body) and saturation at depth. Every "unfurl" quantity in §3 is an affine function of `U`. Because `U` is monotone and stateless in `s`, stack pops visibly re-furl — correct CEK semantics: returning from a call closes what the call opened.

### 2.4 Ridge and owner coupling

`frame` already returns `owners: Uint16Array(budget)` and `ridges`. The response modulates both without reallocating:

```
ridgeBoost(point on territory i) = 1 + 1.5 * a_i * G(u) + 2.0 * seamGlow
ownerTint(i)                     = a_i        // renderer maps to emissive / saturation
```

Points sampled on the active territory during a firing are thus simultaneously *raised* (geometry), *sharpened* (ridge), and *lit* (owner activation export via `response.a[owners[k]]`).

---

## 3. Mechanism-by-Mechanism Response

All eight mechanisms receive the same three inputs — soliton `(amp, uc, sigma, a_i)`, unfurl `U(s)`, and terminal `(lock, shear)` — but express them through their own geometry. Gains below are relative to each mechanism's existing `topology` scales (`depth`, `fanout`, `convergence`, `guards`).

Notation: `P` = base sampled point, `N̂` = normal, `phase` = `phaseEff` (§4), `R(θ, axis)` = rotation.

### 3.1 `pleated-braid`

Base: braided strands with pleat folds. Sampling is strand-parametric in `u` along the braid.

- **Firing:** soliton raises the pleat locally and increases pleat frequency:
  ```
  P' = P + N̂ * 0.60 * elevation
  pleatFreq' = pleatFreq * (1 + 0.8 * a_i * G(u))
  twist'     = twist + 0.9 * elevation * sin(phase * 2)     // soliton twists the braid as it passes
  ```
- **Stack:** pleats unfold like a fan — pleat amplitude decreases, braid radius increases:
  ```
  pleatAmp' = pleatAmp * (1 - 0.55 * U)
  radius'   = radius * (1 + 0.35 * U)
  ```
  Deep recursion = open, legible braid; shallow = tight pleats.
- **Terminal:** `Done` locks pleat phase: `pleatPhase → round(pleatPhase / π) * π`. Negative: shear slides strands along braid axis, `u' = u + shear * (strandIndex - fanout/2) / fanout`, visibly unbraiding.

### 3.2 `lorenz-flow`

Base: precomputed RK4 `orbit`. Sampling walks the orbit with `phase`.

- **Firing:** the trajectory point is pushed off-orbit along the local normal, with gain scaled by proximity to the territory's orbit segment. Territory `i` maps to orbit arc `t ∈ [u0_i * T, u1_i * T]`:
  ```
  P' = P + N̂ * 0.45 * elevation(t/T mapped to u)
  ```
  Additionally the walk speed surges: `phaseEff` advances at `1 + 1.2 * amp` while `amp > 0.05` — firing *is* faster flow.
- **Stack:** the two Lorenz wings separate — unfurling is literal wing-opening. Scale the wing-separation axis (`x` in standard embedding):
  ```
  x' = x * (1 + 0.30 * U),   rho_eff = rho * (1 + 0.12 * U)   // only if re-integrating; baked orbit uses x-scale only
  ```
  (For the baked `orbit`, apply only the geometric scale; `rho_eff` applies if `compile` is re-run live.)
- **Terminal:** `Done`: orbit walk locks to the orbit's natural period — `phaseEff` quantized per §4.1 with harmonic `n = 2`. Negative: Lyapunov shear is *native* here — apply `P' = P + tangent * shear * (t - t0)` where `tangent` is the orbit derivative; neighbouring points diverge exactly as the flow's positive Lyapunov exponent dictates. Cap `shear * Δt ≤ 0.5` per frame.

### 3.3 `clifford-flow`

Base: `cloud` points, `grid` density, `critical` points from the Clifford attractor iteration.

- **Firing:** soliton displaces cloud points along `N̂` (grid normal = density gradient direction) and locally raises density weight so `crests` selection prefers the active region:
  ```
  P' = P + N̂ * 0.50 * elevation(u(P))       // u(P) = point's parametric coordinate stored at compile
  crestWeight *= (1 + 3 * a_i * G(u))
  ```
- **Stack:** unfurl = attractor parameter drift toward openness. Interpolate Clifford params `(a,b,c,d)` toward their "open" targets baked at compile:
  ```
  param' = param + U * 0.15 * (paramOpen - param)   // applied to baked cloud as affine warp: P' = M(U) * P
  ```
  With the baked cloud this is realized as an anisotropic scale `diag(1 + 0.2U, 1 + 0.2U, 1)` plus rotation `R_z(0.3 * U)`. Deep stack = rotated, spread cloud.
- **Terminal:** `Done`: cloud snaps to `critical` points — blend `P' = mix(P, nearestCritical, 0.35 * lock)`. Negative: shear via the attractor's own Jacobian — one extra Clifford iteration step scaled by `shear` on terminal frames only; divergence is automatic and bounded by the attractor.

### 3.4 `recursive-affine`

Base: contractive IFS `branches`, each branch an affine contraction applied recursively to `depth`.

- **Firing:** the branch whose territory is active gets its contraction *relaxed* locally — it reaches further:
  ```
  branchScale_j' = branchScale_j * (1 + 0.5 * elevation)   for j in active territory
  P' = P + N̂ * 0.40 * elevation
  ```
- **Stack:** this is the canonical unfurl. Effective recursion depth and branch spread grow with `U`:
  ```
  depthEff = depth * (0.6 + 0.4 * U)          // sample deeper when the real stack is deep
  spread_j = spread_j * (1 + 0.45 * U)         // branch translations pushed outward from IFS centroid
  P' = centroid + (P - centroid) * (1 + 0.45 * U * levelWeight)   // levelWeight = point's recursion level / depth
  ```
  Deeper sampled levels unfurl most — a fractal opening from the outside in.
- **Terminal:** `Done`: branch rotations lock to multiples of `π / fanout`. Negative: shear breaks contractivity visually — scale the active branch by `1 + shear * 0.3` along its principal axis; the IFS fringes fray (bounded: apply only to the last recursion level's points).

### 3.5 `recursive-julia`

Base: `julia` escape grid + marching-squares contours.

- **Firing:** soliton perturbs the Julia constant locally in `u`:
  ```
  c' = c + 0.08 * elevation * (cos(phase), sin(phase))     // contour set breathes around the firing point
  P' = P + N̂ * 0.55 * elevation                             // contour lines lift off the plane
  ```
  If contours are baked, realize `c'` as a radial warp about the soliton's complex-plane position with radius `2 * sigma` mapped to plane units.
- **Stack:** unfurl = zoom out + contour levels multiply:
  ```
  zoom' = zoom * (1 - 0.35 * U)               // deeper stack sees more of the set
  contourLevels' = contourLevels + round(2 * U)   // extra marching-squares levels appear
  ```
- **Terminal:** `Done`: `c` locks to the nearest point on the main cardioid boundary parameter lattice (harmonic locking in parameter space). Negative: Lyapunov shear is the Julia set's own escape-time gradient — displace contour points along `∇(escape time)` by `shear * 0.2`, so contours smear exactly where the set is chaotic.

### 3.6 `logarithmic-mantle`

Base: `LifeformFamilies` — `computeBasis(body, k, u, phase)`, `point(body, k, u, v, phase)`, params bounded by `LIMITS` (`growth, spread, curl, ...`).

- **Firing:** in `computeBasis`, the basis swells at the soliton and curl tightens:
  ```
  radius_k(u) *= 1 + 0.70 * elevation(u) / max(amp,eps) * a_k   // local bulge (gain highest of all mechanisms: mantle is soft tissue)
  curlEff = curl * (1 + 0.6 * a_owner * G(u))
  P' = point(...) evaluated with swollen basis, then + N̂ * 0.30 * elevation
  ```
- **Stack:** unfurl through `growth` and `spread`, clamped by `LIMITS`:
  ```
  growthEff = clamp(growth * (1 + 0.5 * U), LIMITS.growth)     // mantle extends
  spreadEff = clamp(spread * (1 + 0.4 * U), LIMITS.spread)
  ```
  The clamp is semantic: a mantle at max `growth` cannot unfurl further, so deep-stack readings saturate gracefully instead of exploding.
- **Terminal:** `Done`: `offset` parameter phase-locks: `offset → offset + lock * (round(offset / (TAU/lobes)) * (TAU/lobes) - offset)` — lobes align to a harmonic rosette. Negative: shear twists: `twistEff = twist * (1 + shear)` with `twist` clamped to `LIMITS.twist` maximum `* 1.5` under shear (shear deliberately exceeds family limits — pathology should read as pathology).

### 3.7 `toroidal-weave`

Base: torus-knot-like weave via `computeBasis`/`point`; `whorls ∈ [2,4]`, `twist ∈ [1,3]` in `LIMITS`.

- **Firing:** soliton travels around the torus — `uc` maps to the toroidal angle, elevation lifts the weave radially:
  ```
  P' = P + radialDir * 0.65 * elevation
  weavePhase' = weavePhase + 0.8 * elevation    // the weave locally advances, like a stitch being pulled
  ```
- **Stack:** the knot tightens/loosens — stack depth *is* knot tension:
  ```
  minorRadius' = minorRadius * (1 - 0.25 * U)          // tube thins as knot tightens
  majorRadius' = majorRadius * (1 + 0.18 * U)
  twistEff = clamp(twist + U * 0.8, LIMITS.twist)      // extra twist per whorl
  ```
- **Terminal:** `Done`: toroidal and poloidal frequencies lock to a rational ratio — choose nearest `p/q` with small `q` (the compile-time `frequency` rounded), blend `frequency → p/q` by `lock`. Negative: shear slips the weave — poloidal angle advances by `shear * (1 + whorlIndex * 0.1)` per whorl, so whorls desynchronize and the knot visibly loosens asymmetrically.

### 3.8 `phyllotaxis-fan`

Base: golden-angle fan via `computeBasis`/`point`; `lobes ∈ [3,9]`, `frequency ∈ [2,8]`.

- **Firing:** soliton opens the floret(s) at the active territory — territory maps to an angular sector:
  ```
  divergenceEff = goldenAngle * (1 + 0.05 * a_i * G(u))     // local angular spread
  P' = P + N̂ * 0.60 * elevation
  floretScale at sector centre *= 1 + 0.8 * elevation
  ```
- **Stack:** the fan literally unfurls — the headline stack mechanism:
  ```
  fanAngle' = fanAngle * (0.55 + 0.45 * U)      // closed bud → open fan
  lobesEff  = lobes + round(U * 2)              // clamped to LIMITS.lobes; new lobes unfold at depth
  offsetEff = offset + U * 0.4                  // fan rotates open
  ```
- **Terminal:** `Done`: divergence angle locks to the golden angle exactly (it drifts under `Running` by `+0.002 * sin(phase)`; `Done` removes drift, fan becomes a perfect phyllotaxis rosette — stillness as correctness). Negative: shear breaks the golden angle progressively: `divergenceEff = goldenAngle * (1 + shear * 0.12 * radialIndex / maxIndex)` — outer florets shear first, fan spirals wrong from the rim inward.

### 3.9 Summary table

| Mechanism | Soliton gain | Stack (`U`) primary | `Done` lock target | Negative shear mode |
|---|---|---|---|---|
| `pleated-braid` | 0.60 + twist | pleat amp ↓, radius ↑ | pleat phase → `kπ` | axial strand slide |
| `lorenz-flow` | 0.45 + speed ↑ | wing `x`-scale ↑ | period harmonic `n=2` | orbit-tangent divergence |
| `clifford-flow` | 0.50 + crest ↑ | affine open warp | snap to `critical` | extra Jacobian iteration |
| `recursive-affine` | 0.40, branch relax | depth & spread ↑ | rotation → `kπ/fanout` | last-level fray |
| `recursive-julia` | 0.55, `c` perturb | zoom out, levels ↑ | `c` → cardioid lattice | escape-gradient smear |
| `logarithmic-mantle` | 0.70 bulge | `growth`,`spread` ↑ (clamped) | `offset` → lobe lattice | `twist` over-limit |
| `toroidal-weave` | 0.65 radial | tube ↓, twist ↑ | frequency → rational `p/q` | whorl desync slip |
| `phyllotaxis-fan` | 0.60 + floret ↑ | fan angle, lobes ↑ | divergence → golden angle | rim-first angle break |

---

## 4. Terminal Outcomes

### 4.1 `Done` — harmonic phase-locking

Correct termination should read as the body *settling into its own harmonics*: motion continues but becomes periodic, quantized, calm.

```
lock_t = 1 - exp(-t_terminal / tau_lock),   tau_lock = 1.5 s   // t_terminal = time since outcome latched

phaseLockTarget(phase) = nearest multiple of 2π / H,  H = mechanism harmonic (table §3.9; default H = topology.fanout)
phaseEff = phase + lock * wrapAngle(phaseLockTarget - phase)

velocity damping:  all per-frame phase increments scale by (1 - 0.6 * lock)
breathing floor:   idle amplitude scales to 0.3 — a Done Quineling still breathes, slowly.
```

Per-mechanism lock targets are in §3. `lock` is exported in `Response` so `frame` can apply parameter locks (Julia `c`, toroidal `p/q`, phyllotaxis golden angle) in addition to the global `phaseEff`.

### 4.2 `Rejected` / `Exhausted` — Lyapunov shear

Incorrect or starved termination reads as *instability*: formerly neighbouring strands diverge exponentially, exactly as trajectories do under a positive Lyapunov exponent.

```
shear_t = shearMax * (1 - exp(-t_terminal / tau_shear)),  tau_shear = 0.8 s
shearMax = 0.9 (Rejected), 0.6 (Exhausted)     // Rejected is violent; Exhausted sags first (see below)

Per-point shear displacement (generic form, specialized per mechanism in §3):
  P' = P + T̂(u) * shear_t * (u - u_pivot) * |P|_local
where T̂ = local tangent along u, u_pivot = active territory centre (or body centre if none).
Neighbouring points at u and u+δ separate by factor exp(shear_t * δ / L) per unit phase — exponential in u-distance, the definitional Lyapunov signature.
```

**`Exhausted` pre-shear sag.** Before shear dominates, low fuel collapses amplitude: for the first `tau_shear`, blend in `sag = (1 - f) * 0.35` downward normal displacement (`P -= N̂ * sag * (1 + u)`). An exhausted Quineling droops, then frays. `Rejected` skips the sag (`f` is irrelevant; the program was wrong, not tired).

**Hard bounds (non-negotiable).** Shear displacement per point is clamped to `0.75 ×` the body's bounding radius; `shear_t` stops growing at `shearMax`; no parameter may become NaN — all warps are affine or bounded blends of baked data. A rejected program produces a *damaged* Quineling, never a crashed renderer.

### 4.3 Outcome latching in the caller

The trace adapter latches the first terminal outcome and keeps sending it with increasing `step`. `stepResponse` computes `t_terminal = (step - stepTerminal) * nominalDt` from its own state slot. Sending `outcome: 'Running'` (or `null`) after a terminal value resets the latch — this is how a reused body is reborn for the next program.

---

## 5. Seam Pulse (Offspring Coupling)

From `qdl-v1-offspring.js`, `compose`/`mate` emit `seam = {donorNode, recipientNode, type, integrationNode}`; `merge` joins at the `'joined'` report node; `body` re-seeds traits. When any of these fire:

```
seamGlow(u, i) = seamAmp * [ exp(-d(i, donor)^2 / 2) + exp(-d(i, recip)^2 / 2) + 1.5 * exp(-d(i, integ)^2 / 2) ]
```
where `d(i, j)` = territory-index distance after resolving graph node ids through `territories[].node`. The integration node glows strongest — it is where two programs became one. `seamGlow` feeds `ridgeBoost` (§2.4) and, for `toroidal-weave`/`pleated-braid`, a local twist `+ seamGlow * 0.5` (the seam is a stitch). `merge`'s parallel join pulses both parents' territories symmetrically; `body` (trait re-seed) sends `seamPulse` with donor = recipient = the re-seeded node and `p = 0.6` — a softer, single-site pulse.

---

## 6. Drop-in JS Implementation

Add to `woven-body.js`. Requires no changes to `author`/`compile`; `frame` and `LifeformFamilies.computeBasis/point` take an optional trailing `resp` argument (call sites in §6.3).

### 6.1 `WovenBody.stepResponse`

```js
// ---- Live execution coupling (Specialist #4) -----------------------------
const _clamp01 = x => x < 0 ? 0 : x > 1 ? 1 : x;
const _wrapPi  = x => Math.atan2(Math.sin(x), Math.cos(x));
const HARMONIC = { 'pleated-braid': 2, 'lorenz-flow': 2, 'clifford-flow': 4,
  'recursive-affine': 0 /* fanout */, 'recursive-julia': 6,
  'logarithmic-mantle': 0 /* lobes */, 'toroidal-weave': 3, 'phyllotaxis-fan': 5 };

WovenBody.stepResponse = function (body, phase, execution) {
  const ex = execution || {};
  const n = body.territories.length;
  // Per-body response state (decay envelopes + terminal latch). Ephemeral:
  // never serialized, never part of the authored record.
  const st = body._respState || (body._respState = {
    amp: 0, seamAmp: 0, a: new Float32Array(n),
    outcome: null, stepTerminal: 0, lastStep: -1 });

  const dt = ex.dt != null ? ex.dt : 1 / 60;
  const step = ex.step != null ? ex.step : st.lastStep + 1;
  st.lastStep = step;

  const s = _clamp01(ex.stackRatio || 0);
  const f = _clamp01(ex.fuelRatio != null ? ex.fuelRatio : 1);
  const I = _clamp01(ex.stepImpulse || 0);

  // --- per-territory activation a_i (§1.2) ---
  const wIn = ex.nodeWeights, eIn = ex.nodeEnergies;
  let wSum = 0; if (wIn) for (let i = 0; i < n; i++) wSum += Math.max(0, wIn[i] || 0);
  const decayA = Math.exp(-dt / 0.90);
  let owner = -1, best = 0;
  for (let i = 0; i < n; i++) {
    let a = 0;
    if (wIn && wSum > 0) a += Math.max(0, wIn[i] || 0) / Math.max(wSum, 1);
    if (eIn) { const e = Math.max(0, eIn[i] || 0); a += 0.5 * (e / (1 + e)); }
    if (!wIn && !eIn && i === ex.activeOwner) a = 1;
    if (a > best) { best = a; owner = i; }
    st.a[i] = Math.max(_clamp01(a), st.a[i] * decayA);
  }
  if (ex.activeOwner >= 0 && ex.activeOwner < n) owner = ex.activeOwner;

  // --- soliton placement (§2.1) ---
  let uc = 0.5, sigma = 0.09;
  if (owner >= 0) {
    const [u0, u1] = body.territories[owner].u, L = Math.max(u1 - u0, 1e-4);
    uc = (u0 + u1) / 2 + 0.35 * L * Math.sin(phase);
    sigma = 0.18 * L;
  }
  const iEff = I * (0.25 + 0.75 * f);
  st.amp = Math.max(iEff, st.amp * Math.exp(-dt / 0.35));
  const amp = st.amp;

  // --- stack unfurl (§2.3) ---
  const ss = s * s * (3 - 2 * s), unfurl = Math.pow(ss, 1.5);

  // --- terminal latch, lock & shear (§4) ---
  const outcome = ex.outcome || null;
  const terminal = outcome === 'Done' || outcome === 'Rejected' || outcome === 'Exhausted';
  if (terminal && st.outcome !== outcome) { st.outcome = outcome; st.stepTerminal = step; }
  if (!terminal) st.outcome = null;
  const tTerm = terminal ? Math.max(0, step - st.stepTerminal) * (1 / 60) : 0;
  const lock  = st.outcome === 'Done' ? 1 - Math.exp(-tTerm / 1.5) : 0;
  const shearMax = st.outcome === 'Rejected' ? 0.9 : st.outcome === 'Exhausted' ? 0.6 : 0;
  const shear = shearMax * (1 - Math.exp(-tTerm / 0.8));

  let phaseEff = phase;
  if (lock > 0) {
    let H = HARMONIC[body.mechanism] || body.topology.fanout || 4;
    const target = Math.round(phase / (2 * Math.PI / H)) * (2 * Math.PI / H);
    phaseEff = phase + lock * _wrapPi(target - phase);
  }

  // --- seam pulse (§5) ---
  let seamDonor = -1, seamRecip = -1, seamInteg = -1;
  if (ex.seamPulse) {
    st.seamAmp = Math.max(_clamp01(ex.seamPulse.p || 0), st.seamAmp);
    const idx = node => body.territories.findIndex(t => t.node === node);
    seamDonor = idx(ex.seamPulse.donorNode); seamRecip = idx(ex.seamPulse.recipientNode);
    seamInteg = ex.seamPulse.integrationNode != null ? idx(ex.seamPulse.integrationNode) : -1;
  }
  st.seamAmp *= Math.exp(-dt / 1.2);
  const seamAmp = st.seamAmp;

  const resp = {
    phaseEff, a: st.a, owner, uc, sigma, amp, s, f, unfurl,
    shear, lock, seamAmp, seamDonor, seamRecip, seamInteg,
    terminal: st.outcome,
    soliton(u, i) {                       // §2.1 elevation, 0 if territory inactive
      if (i < 0 || st.a[i] <= 0 || amp <= 0) return 0;
      const d = (u - uc) / sigma; return amp * st.a[i] * Math.exp(-0.5 * d * d);
    },
    seamGlow(u, i) {
      if (seamAmp <= 0 || i < 0) return 0;
      const g = (j, wgt) => j < 0 ? 0 : wgt * Math.exp(-0.5 * (i - j) * (i - j));
      return seamAmp * (g(seamDonor, 1) + g(seamRecip, 1) + g(seamInteg, 1.5));
    }
  };
  body._resp = resp;
  return resp;
};
```

### 6.2 Sampler hook (generic form, used inside `frame` and `point`)

```js
// After computing base point P=(x,y,z), normal N=(nx,ny,nz), param u, territory i:
if (resp) {
  const el = resp.soliton(u, i);                       // Gaussian soliton (§2.1)
  const gain = SOLITON_GAIN[body.mechanism] || 0.5;    // table §3.9
  let d = gain * el + resp.seamGlow(u, i) * 0.15;
  if (resp.terminal === 'Exhausted')                   // sag before fray (§4.2)
    d -= (1 - resp.f) * 0.35 * (1 - Math.exp(-0.001)) * 0 + (1 - resp.f) * 0.20 * resp.shear / 0.6 * -1 * -1; // see note
  x += nx * d; y += ny * d; z += nz * d;
  if (resp.shear > 0) {                                // Lyapunov shear along u-tangent T (§4.2), clamped
    const sh = Math.min(resp.shear * (u - resp.uc), 0.75);
    x += tx * sh; y += ty * sh; z += tz * sh;
  }
}
```

> Note on the Exhausted line above: implement sag cleanly as `d -= (1 - resp.f) * 0.35 * Math.min(1, resp.shear / 0.6 + 0.3)` (droop grows as shear phase begins). The mechanism-specific displacements of §3 (wing scale, IFS spread, fan angle, `growth`/`spread`/`twist` clamps against `LIMITS`, Julia warp, whorl slip) are applied where those parameters are already read in `WovenBody.frame` / `LifeformFamilies.computeBasis`, substituting `paramEff` values computed from `resp.unfurl`, `resp.lock`, `resp.shear` exactly as tabulated in §3.9. All substitutions are affine in baked data, preserving the §4.2 bounds.

### 6.3 Call-site changes (minimal diff surface)

```js
// woven-body.js — inside WovenBody.frame(body, phase, opts):
const resp = opts.response || body._resp || null;
const ph = resp ? resp.phaseEff : phase;
// ... use `ph` everywhere `phase` was used; pass `resp` into per-mechanism
// sampling branches and apply §3 substitutions + §6.2 hook before writing
// into points[]; ridge write becomes:
//   ridges[k] *= 1 + 1.5 * (resp ? resp.soliton(u, owners[k]) : 0)
//                  + 2.0 * (resp ? resp.seamGlow(u, owners[k]) : 0);

// lifeform-families.js — computeBasis(body, k, u, phase, resp?) / point(body, k, u, v, phase, resp?):
// read growthEff/spreadEff/curlEff/twistEff/lobesEff/offsetEff from resp per §3.6–3.8,
// each clamped to LIMITS (except toroidal/julia shear overrides noted in §3).

// trace adapter (caller side, per rendered frame):
const ex = traceAdapter.snapshot();            // builds ExecutionState from CEK stack + fuel + outcome latch
const resp = WovenBody.stepResponse(body, phase, ex);
const frame = WovenBody.frame(body, phase, { budget, crests, reuse, response: resp });
```

Backward compatibility: with `execution` omitted, `stepResponse` returns zero-activation response with `phaseEff = phase`, and `frame` without `opts.response` behaves byte-identically to today.

---

## 7. Worked Trace (sanity check)

Program: recursive factorial, depth 5, then `Done`.

| Step event | `execution` | Visible response |
|---|---|---|
| Call `fact` at node 7 | `activeOwner=7, stepImpulse=1, stackRatio=0.2` | Soliton blooms on territory 7; all mechanisms stir slightly (`U≈0.05`) |
| Recurse to depth 5 | `stackRatio=1.0` | `U=1`: fan fully opens / IFS spreads / mantle reaches clamped `growth` / knot tightens — body is maximally unfurled at maximal depth |
| Return, multiply fires | `activeOwner=<mul node>, stepImpulse=1, stackRatio=0.2` | New soliton at multiply territory; unfurl relaxes as stack pops — body re-furls on unwind |
| Fuel low near end | `fuelRatio=0.1` | Impulses shrink to 32% (`0.25+0.75·0.1`); motion tires but persists |
| `Done` latched | `outcome='Done'` | Over ~1.5 s, `lock→1`: phase quantizes to harmonic lattice, per-mechanism locks engage (golden angle exact / `p/q` torus / cardioid `c`); breathing drops to 30% |
| (alt.) `Rejected` | `outcome='Rejected'` | Over ~0.8 s, `shear→0.9`: strands diverge exponentially in `u`, Julia contours smear along escape gradient, whorls desync — unmistakably broken, bounded, never NaN |

## 8. Invariants

1. **Identity preserved.** Response never writes `mechanism`, `seed`, `topology`, `territories`, or compiled artifacts. Two executions on one body differ only via `Response`.
2. **Boundedness.** Every displacement ≤ `max(gain·amp, 0.75·boundingRadius)`; every parameter clamped to `LIMITS` except the two deliberate shear over-rides (§3.6 twist, §4.2), themselves capped.
3. **Locality.** Firing affects only territories with `a_i > 0`; soliton support is the owner's `[u0,u1]` up to `3σ` tails.
4. **Reversibility.** All non-terminal deformation vanishes as `amp, a_i, seamAmp → 0` and `s → 0`. Terminal states persist only while latched.
5. **Frame-rate independence.** All envelopes integrate `exp(-dt/τ)`; behaviour at 30 Hz and 144 Hz is identical up to sampling.
