# Track 4: Live Program Execution Coupling & CEK / Task Trace Response

**Council Reports Synthesized:**  
- [`gemini_04_program_execution.md`](../research/council_20/gemini_04_program_execution.md) (`33.6 KB`)  
- [`grok_04_program_execution.md`](../research/council_20/grok_04_program_execution.md) (`14.0 KB`)  
- [`muse_04_program_execution.md`](../research/council_20/muse_04_program_execution.md) (`32.9 KB`)  
- [`sol_04_program_execution.md`](../research/council_20/sol_04_program_execution.md) (`16.1 KB`)  
**Upstream Modules:** [`woven-body.js`](../woven-body.js), [`lifeform-families.js`](../lifeform-families.js), [`sherlock-bench/src/designers/designer8_quineling.js`](../../../sherlock-bench/src/designers/designer8_quineling.js)

---

## 1. Passive-View Execution Modulation Contract

To preserve the core Quinelings invariant that rendering never executes untrusted code or mutates program state (`passive` in `spec/ranch.qnt` and `combinationAndViewPassive` in `spec/woven-combinations.qnt`), live program execution coupling is formulated as a **pure observational vector field** `execution` passed into `WovenBody.frame(body, phase, { budget, crests, reuse, execution })` or `WovenBody.stepResponse(body, phase, execution, reuse)`.

When `execution` is omitted or `null`, `WovenBody.frame` and `LifeformFamilies.frame` execute the baseline idle geometry with zero overhead.

### 1.1 Normalized `execution` State Vector (`WovenBody.normalizeExecution`)
```javascript
{
  activeOwner: -1..N-1,             // Index of currently firing operation in body.nodes (-1 if idle)
  nodeWeights: Float32Array(N),     // Per-node activation energy in [0, 1] (also accepts nodeEnergies)
  stackRatio: 0..1,                 // Call / continuation stack depth divided by stackLimit
  fuelRatio: 0..1,                  // Remaining execution fuel divided by initialFuel
  stepImpulse: 0..1,                // Quintic intra-step progress H(z) = 6z^5 - 15z^4 + 10z^3
  seamPulse: 0..1,                  // Causal seam traversal pulse across [u0, u1]
  outcome: 'Running' | 'Done' | 'Rejected' | 'Exhausted',
  activePatch: { component, u: [u0, u1], centerU, halfWidth } | null
}
```

---

## 2. Four Dynamical Coupling Laws Across All 8 Mechanisms

### 2.1 Law 1: Territory Soliton Wave Packet $\Psi_k(u, q)$ (`activeOwner` & `nodeWeights`)
Let operation $i$ own patch $[u_0, u_1]$ on strand $k$ with midpoint $u_c = \frac{1}{2}(u_0 + u_1)$ and half-width $\sigma_u = \max(0.035, \frac{1}{2}(u_1 - u_0))$. When operation $i$ fires with activation weight $W_i \in [0, 1]$ and quintic step impulse $H(z) \in [0, 1]$, a localized Gaussian soliton packet propagates across its territory:
$$\Psi_k(u, q) = W_i \exp\!\left(-\frac{(u - u_{\text{wave}})^2}{2\sigma_u^2}\right), \qquad u_{\text{wave}} = u_0 + (u_1 - u_0)\big(0.5 + 0.35\sin(2\pi H(z))\big).$$
- **3D Normal & $z$-Flare**: Displaces the ribbon along its local surface normal (or $z$-axis) by $\Delta z_{\text{sol}} = \eta_n \Psi_k(u, q)\sin(2\pi\frac{u - u_0}{u_1 - u_0} - \phi)$ ($\eta_n = 0.042$).
- **Caustic Ridge Flare**: Amplifies `alpha` on owned points and caustic ridges via `clampedExecutionOpacity`:
  $$\tilde{\alpha} = \operatorname{clamp}_{[0, 1]}\!\big(\alpha \cdot (1 + 0.65\,\Psi_k(u, q) + 0.25\,\text{stackRatio})\big).$$

### 2.2 Law 2: Recursion & Call-Stack Structural Unfurling (`stackRatio`)
As recursion or continuation stack depth $S = \text{stackRatio} \in [0, 1]$ increases:
- **`recursive-affine`**: Unfurls child branch angles by $\Delta\theta_{\text{branch}} = 0.22\,S\cdot\text{depth}$ and boosts deep-branch transverse width by $(1 + 0.28\,S)$.
- **`logarithmic-mantle`**: Tightens helicospiral curl by $(1 + 0.18\,S)$ and expands collar roll pockets.
- **`toroidal-weave`**: Increases minor-to-major poloidal knot modulation by $(1 + 0.24\,S)$.
- **`lorenz-flow` & `pleated-braid`**: Advances the Lorenz orbit window phase and increases braid turn writhe by $\Delta\psi = 0.45\pi\,S\sin(\pi u)$.
- **`phyllotaxis-fan`, `clifford-flow`, `recursive-julia`**: Radially blooms outer florets and increases holomorphic/vorticity $z$-relief amplitude by $(1 + 0.30\,S)$.

### 2.3 Law 3: Terminal Outcome Regimes (`Done` vs `Rejected` / `Exhausted`)
- **`Done` (Harmonic Phase-Locking)**: Applies a golden-ratio standing-wave lock $\Delta\mathbf{x}_{\text{Done}} = 0.018\sin(2\pi\varphi^{-1} u - \phi)\,\hat{\mathbf{u}}_r$ and elevates baseline luminance.
- **`Rejected` (Lyapunov Bifurcation Shear)**: Applies deterministic high-frequency transverse shear $\Delta\mathbf{x}_{\text{Fault}} = 0.055\sin(19 u + 3\phi + k)\cos(13 u - 2\phi)\,\hat{\mathbf{n}}$ across the active fault territory.
- **`Exhausted` (Metabolic Ember Contraction)**: Smoothly contracts radial envelope toward $\mu_\star = 0.72 + 0.28\,\text{fuelRatio}$ with a low-frequency ember tremor.
