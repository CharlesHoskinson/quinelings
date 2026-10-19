# Track 1: Exotic Strange Attractors, Chaotic Flows & Differential Geometry

**Council Reports Synthesized:**  
- [`gemini_01_exotic_math.md`](../research/council_20/gemini_01_exotic_math.md) (`51.4 KB`)  
- [`grok_01_exotic_math.md`](../research/council_20/grok_01_exotic_math.md) (`29.1 KB`)  
- [`muse_01_exotic_math.md`](../research/council_20/muse_01_exotic_math.md) (`19.8 KB`)  
- [`sol_01_exotic_math.md`](../research/council_20/sol_01_exotic_math.md) (`17.4 KB`)  
**Upstream Modules:** [`lifeform-families.js`](../lifeform-families.js), [`woven-body.js`](../woven-body.js)

---

## 1. Stereographic $S^3 \to \mathbb{R}^3$ Hopf Fibration & Linked Villarceau Fibers (`toroidal-weave`)

### 1.1 Mathematical Formulation
Let $S^3 = \{(z_1, z_2) \in \mathbb{C}^2 : |z_1|^2 + |z_2|^2 = 1\} \subset \mathbb{R}^4$. The Hopf map $\pi: S^3 \to S^2$ fibers the 3-sphere into mutually linked great circles over the base 2-sphere parameterized by polar latitude $\eta \in (0, \pi)$ and azimuthal phase $\phi \in [0, 2\pi)$:
$$\begin{aligned}
z_1(\eta, \phi, \theta) &= \cos\!\left(\frac{\eta}{2}\right) e^{i(\theta + \phi/2)} = x_0 + i x_1, \\
z_2(\eta, \phi, \theta) &= \sin\!\left(\frac{\eta}{2}\right) e^{i(\theta - \phi/2)} = x_2 + i x_3,
\end{aligned} \qquad \theta = 2\pi u \in [0, 2\pi].$$

Every point on a Hopf fiber satisfies the exact unit-sphere identity (formally proved in Lean 4 as `QDL.WovenBody.hopf_s3_unit_norm`):
$$x_0^2 + x_1^2 + x_2^2 + x_3^2 = \cos^2\!\left(\frac{\eta}{2}\right)\left(\cos^2\psi_+ + \sin^2\psi_+\right) + \sin^2\!\left(\frac{\eta}{2}\right)\left(\cos^2\psi_- + \sin^2\psi_-\right) = 1.$$

Under the $\kappa$-regularized conformal stereographic projection $\Sigma_\kappa: S^3 \to \mathbb{R}^3$ from $(1,0,0,0)$:
$$D_{\text{Hopf}}(u) = \frac{1}{1 - \kappa \cos(\eta(u)/2)\cos(\psi_+(u))}, \qquad \psi_\pm = \theta \pm \frac{1}{2}(\phi_k \pm p),$$
every pair of distinct strand fibers $\gamma_j, \gamma_k$ ($j \ne k$) forms a pair of linked Villarceau circles on a Dupin cyclide with **Gauss linking number**:
$$\mathrm{Lk}(\gamma_j, \gamma_k) = \frac{1}{4\pi} \oint_{\gamma_j} \oint_{\gamma_k} \frac{\mathbf{r}_j - \mathbf{r}_k}{\|\mathbf{r}_j - \mathbf{r}_k\|^3} \cdot (d\mathbf{r}_j \times d\mathbf{r}_k) = \pm 1.$$

### 1.2 Bounded Parameter Domain
Using the existing `LifeformFamilies.LIMITS` contract (`spread` $\in [0.5, 1.2]$, `curl` $\in [0.4, 1.6]$, `asymmetry` $\in [0, 0.4]$, `lobes` $\in [3, 9]$, `frequency` $\in [2, 8]$, `twist` $\in [1, 3]$):
- $\frac{\eta(u)}{2} = 0.60 + 0.12\,(g.\text{curl} - 0.4) + 0.055\sin(g.\text{lobes}\cdot\theta + \phi_k + p) \in [0.545, 0.799] \subset (0, \pi/2)$
- $\kappa = 0.22 + 0.28\,g.\text{asymmetry} \in [0.220, 0.332]$
- $\kappa\cos(\eta(u)/2) \le 0.332 \times 0.856 = 0.2842 < 1 \implies D_{\text{Hopf}}(u) \in [0.778, 1.397]$ (strictly positive, real-analytic, pole-free).

---

## 2. Discrete $\mathrm{SO}(3)$ Bishop Parallel-Transport Frames & Lorenz–Thomas Biharmonic Coupling (`lorenz-flow`)

### 2.1 Eliminating the $z$-Axis Gimbal Flip via Bishop Parallel Transport
In the baseline `lorenzSpine`, the normal vector $\mathbf{N} = (-T_1, T_0, 0)/\sqrt{T_0^2+T_1^2}$ becomes singular whenever the Lorenz trajectory plunges vertically along the $z$-axis invariant manifold ($x = y = 0, T_0^2 + T_1^2 \to 0$), causing a sudden $\pi$ azimuthal flip (step jump $\|\Delta\mathbf{N}\| = 1.0515$).

`compileLorenzBishop(orbit, d)` replaces this with a **Discrete $\mathrm{SO}(3)$ Bishop (Rotation-Minimizing) Frame** $(\mathbf{T}_i, \mathbf{U}_{1,i}, \mathbf{U}_{2,i})$ satisfying:
$$\tilde{\mathbf{U}}_{1,i} = \mathbf{U}_{1,i-1} - \frac{\langle \mathbf{T}_{i-1} + \mathbf{T}_i, \mathbf{U}_{1,i-1} \rangle}{1 + \langle \mathbf{T}_{i-1}, \mathbf{T}_i \rangle}(\mathbf{T}_{i-1} + \mathbf{T}_i),$$
$$\mathbf{U}_{1,i} = \frac{\tilde{\mathbf{U}}_{1,i} - \langle \tilde{\mathbf{U}}_{1,i}, \mathbf{T}_i \rangle \mathbf{T}_i}{\|\tilde{\mathbf{U}}_{1,i} - \langle \tilde{\mathbf{U}}_{1,i}, \mathbf{T}_i \rangle \mathbf{T}_i\|_2}, \qquad \mathbf{U}_{2,i} = \mathbf{T}_i \times \mathbf{U}_{1,i}.$$
This reduces maximum frame-to-frame normal rotation jump by **$10.6\times$** ($0.0986$ vs $1.0515$) and eliminates all Gimbal flips.

### 2.2 Regularized Frenet–Bishop Geodesic Torsion & Thomas Biharmonic Attractor
Along the Bishop frame, normal curvatures $\kappa_{1,i} = \langle \Delta\mathbf{T}_i / \Delta s_i, \mathbf{U}_{1,i} \rangle$ and $\kappa_{2,i} = \langle \Delta\mathbf{T}_i / \Delta s_i, \mathbf{U}_{2,i} \rangle$ drive the regularized torsion phase:
$$\Theta_{\tau,i} = 0.992\,\Theta_{\tau,i-1} + \frac{\kappa_{1,i-1}\kappa_{2,i} - \kappa_{2,i-1}\kappa_{1,i}}{\kappa_{1,i-1}^2 + \kappa_{2,i-1}^2 + 0.05}\tanh\!\left(\frac{\Delta s_i}{0.02}\right) \in [-6.5, 6.5].$$
Simultaneously, René Thomas's cyclically symmetric labyrinth attractor $\mathbf{w} = (w_1, w_2, w_3)$ evolves synchronously with the normalized Lorenz state $\mathbf{q}_i$:
$$\dot{w}_1 = \sin(w_2 + 2.2\,q_y) - b_T w_1, \quad \dot{w}_2 = \sin(w_3 + 2.2\,q_z) - b_T w_2, \quad \dot{w}_3 = \sin(w_1 + 2.2\,q_x) - b_T w_3$$
with $b_T = 0.208186$, remaining forward-invariant inside the absorbing ball $\|\mathbf{w}\|_\infty \le 1/b_T \approx 4.8034$ while leaving `body.orbit` untouched for RK4 step-halving verification.

---

## 3. Clifford Biharmonic Vorticity-Torsion Sheet (`clifford-flow`)

For the 2D Clifford map $F(x,y) = (\sin(ay)+c\cos(ax), \sin(bx)+e\cos(by))$, the antisymmetric curl of $DF(x,y)$ is the discrete vorticity:
$$\omega(x,y) = \frac{\partial F_y}{\partial x} - \frac{\partial F_x}{\partial y} = b\cos(bx) - a\cos(ay).$$
The 3D sheet embedding `mapWarp` lifts overlapping 2D attractor filaments according to their vorticity sign:
$$z(x,y,p) = 0.056\sin(x + y + p) + 0.024\cos\!\big(ax - by + \varphi^{-1}(x - y) - p\big)\sin\!\big(0.5\,\omega(x,y)\big) \in [-0.080, 0.080].$$

---

## 4. Hofstadter Strange-Loop Holonomy Twist ($\Phi_{\text{SL}}$)

Let $\varphi^{-1} = \frac{\sqrt{5}-1}{2} \approx 0.6180339887498949$. Across every ribbon strand $k \in \{0, \dots, S-1\}$ and longitudinal parameter $u \in [0, 1]$, the **Hofstadter Strange-Loop Holonomy Phase** is:
$$\Phi_{\text{SL}}(u, k, p) = (2m + 1)\pi\!\left(u - \frac{1}{2}\right) + 2\pi\varphi^{-1}\frac{k}{S} + \gamma_H \sin(\pi u)\cos\!\left(2\pi\varphi^{-1} u - p + \phi_k\right), \quad m \in \{0, 1\}.$$
Because $\sin(\pi u) = 0$ at $u \in \{0, 1\}$, the open-loop Berry fluctuation breathes continuously with phase $p$, while the global holonomy across $u: 0 \to 1$ is topologically locked to an exact odd multiple of $\pi$:
$$\Delta\Phi_{\text{SL}} = \Phi_{\text{SL}}(1, k, p) - \Phi_{\text{SL}}(0, k, p) = (2m + 1)\pi \equiv \pi \pmod{2\pi}.$$
