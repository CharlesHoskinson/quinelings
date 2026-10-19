# Track 3: Symbiogenesis, Chimeric Combinations & Multi-Mechanism Offspring

**Council Reports Synthesized:**  
- [`gemini_03_combinations.md`](../research/council_20/gemini_03_combinations.md) (`60.4 KB`)  
- [`grok_03_combinations.md`](../research/council_20/grok_03_combinations.md) (`8.3 KB`)  
- [`muse_03_combinations.md`](../research/council_20/muse_03_combinations.md) (`31.1 KB`)  
- [`sol_03_combinations.md`](../research/council_20/sol_03_combinations.md) (`18.7 KB`)  
**Upstream Modules:** [`woven-body.js`](../woven-body.js), [`qdl-v1-offspring.js`](../qdl-v1-offspring.js), [`spec/woven-combinations.qnt`](../spec/woven-combinations.qnt)

---

## 1. Overcoming Winner-Take-All Mechanism Collapse

Previously, when two parents with distinct `WovenBody` mechanisms—for example, Parent 0 (`lorenz-flow`) and Parent 1 (`recursive-julia` or `toroidal-weave`)—were combined via `compose`, `mate`, or `merge` in `qdl-v1-offspring.js`, calling `WovenBody.author(childTask)` collapsed the entire child into a single winner-take-all mechanism and interleaved `p0n*` and `p1n*` territories modulo `strands`.

The 20-agent council designed **`WovenBody.authorCombination(parentA, parentB, assembled, seed)`** and **`WovenBody.combine(parentA, parentB, recipe, phase, opts)`** around two complementary symbiogenetic architectures:
1. **Causal Seam Grafting (`compose` & `mate`)**
2. **Attractor Cross-Modulation (`merge`, `symbiote`, and chimeric `body`)**

---

## 2. Causal Seam Grafting (`compose` & `mate`)

When a donor subgraph (`p0n*`) from Parent 0 ($\mathcal{M}_0$) is grafted into a recipient subgraph (`p1n*`) from Parent 1 ($\mathcal{M}_1$) across `seam = { donorNode, recipientNode, type, integrationNode }`:

### 2.1 Strand Bundle Partitioning & Shared-Knot Contiguity
The $S \in [8, 40]$ strands are partitioned into three contiguous bundles:
1. **Donor Bundle $K_0 = \{0, \dots, S_0 - 1\}$**: Purely owned by `p0n*` nodes and rendered via Parent 0's mechanism $\mathcal{M}_0$.
2. **Causal Seam Bundle $K_{\text{seam}} = \{S_0, \dots, S_0 + S_{\text{seam}} - 1\}$**: Carries donor nodes on $[0, u_s]$ ending with `seam.donorNode` at $[u_{m_0-1}, u_s]$, and recipient integration nodes on $[u_s, 1]$ starting with `seam.integrationNode` at $[u_s, u_{m_0+1}]$.
3. **Recipient Bundle $K_1 = \{S_0 + S_{\text{seam}}, \dots, S - 1\}$**: Purely owned by `p1n*` nodes and rendered via Parent 1's mechanism $\mathcal{M}_1$.

Using a shared IEEE-754 knot array $U_k = [0, \operatorname{round}_6(1/m), \dots, 1]$ guarantees bit-exact boundary equality (`group[i-1].u[1] === group[i].u[0]`) and strict interior positivity across $[0, 1]$.

### 2.2 $C^2$ Quintic Partition of Unity & Sextic Geodesic Bridge
Across the tubular collar $[u_s - \Delta u, u_s + \Delta u]$ ($\Delta u \le 0.14$) on any seam strand $k \in K_{\text{seam}}$, define the normalized collar coordinate $\tau(u) = \operatorname{clamp}\!\left(\frac{u - (u_s - \Delta u)}{2\Delta u}, 0, 1\right)$ and the $C^2$ quintic Hermite partition of unity:
$$\psi_1(\tau) = 6\tau^5 - 15\tau^4 + 10\tau^3, \qquad \psi_0(\tau) = 1 - \psi_1(\tau).$$
Both first and second derivatives vanish at the collar boundaries ($\psi_1'(0) = \psi_1'(1) = \psi_1''(0) = \psi_1''(1) = 0$). Adding the $C^2$-vanishing sextic geodesic arch $B_6(\tau) = 64\tau^3(1-\tau)^3\,\mathbf{h}_{\text{seam}}$ yields the $C^2$-continuous grafted surface:
$$\mathbf{X}_{\text{seam}}(k, u, v, \phi) = \psi_0(\tau)\,\mathbf{X}_0(k, u_0(u), v, \phi) + \psi_1(\tau)\,\mathbf{X}_1(k, u_1(u), v, \phi) + 64\tau^3(1-\tau)^3\,\mathbf{h}_{\text{seam}}.$$
Discrete/implicit mechanisms (`clifford-flow`, `recursive-julia`) are promoted to local $(k, u, v)$ ribbon charts via `universalChartPoint` using their compiled critical curves and marching-squares escape contours, enabling smooth grafting across all $8 \times 8 = 64$ mechanism pairs.

---

## 3. Attractor Cross-Modulation (`merge`, `symbiote`, `body`)

For `merge` and `symbiote`, `WovenBody.invariantSignal(subBody, u, phase)` extracts a bounded 3-channel dynamical invariant vector $\mathcal{I}_A(u, \phi) = (\iota_\phi, \iota_\theta, \iota_r) \in [-1, 1]^3$ from Parent A:
- **Phase Driver $\iota_\phi \in [-1, 1]$**: Wing state $\tanh(1.1 q_x)$ (`lorenz-flow`), recurrence phase $\sin(ay + \phi)$ (`clifford-flow`), or smoothed escape wave $\sin(\pi \hat{V}_J + \phi)$ (`recursive-julia`).
- **Torsion Driver $\iota_\theta \in [-1, 1]$**: Transverse velocity $\tanh(1.4 B_z)$ (`lorenz-flow`), shear $\cos(bx - \phi)$ (`clifford-flow`), or scroll Jacobian $\tanh(10 J_{\text{scroll}})$ (`recursive-affine`).
- **Radial / Density Driver $\iota_r \in [-1, 1]$**: Normalized log-density $2\frac{\ln(1+\rho)}{\ln(1+\rho_{\max})}-1$ (`clifford-flow`), vertical energy $\tanh(1.2 q_y)$ (`lorenz-flow`), or escape depth (`recursive-julia`).

With bounded gains $\gamma_\phi \in [0, 0.35]$, $\gamma_\theta \in [0, 0.40]$, and $\gamma_r \in [0, 0.22]$, Parent B's manifold is cross-modulated around its spine $\mathbf{c}_B$:
$$\tilde{\mathbf{X}}_B(k, u, v, \phi) = \mathbf{c}_B(k, u, \phi + \gamma_\phi \iota_\phi^A) + 0.06\gamma_r\sin(\pi u)\,\mathbf{c}_A + (1 + \gamma_r\iota_r^A\sin(\pi u))\,\mathbf{R}_{\text{trans}}(\gamma_\theta\iota_\theta^A\sin(\pi u))\,\mathbf{d}_B.$$
