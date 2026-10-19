# Animator's Mathematical Rendering Bible & Complete Creative Package Index
**Project**: Quinelings 2.0 — *"The Ouroboros Manifold: What Is Life?"*  
**Authors**: Creative Director Muse (`muse-wonder-1.0`) & Gemini Mathematical Council  
**Verification**: 14/14 Lean 4 Theorems (`spec/lean/QDL/WovenBody.lean`) · 3/3 Quint Specs (`design.qnt`, `woven-combinations.qnt`, `animation-pipeline.qnt`) · 10,000-Iteration Fuzzer (`tests/fuzz-animation-pipeline.cjs`)

---

## 1. Quick-Access Entry Points for Animators

Animators and technical directors can access the live mathematical equations, compiled `WovenBody` records, and rendering pipelines in three ways:
1. **In-Browser Interactive Modal (`∑ Math Bible`) & Global JS Object**:
   - Open [`http://localhost:4377/motion.html`](http://localhost:4377/motion.html) and click **`∑ Math Bible`** in the top header bar (or click **`Copy JSON Spec`**) to view and copy every equation and parameter bound.
   - In the browser DevTools console on both `motion.html` and `slideshow.html`, inspect `window.QUINELING_MATH_BIBLE` for the full machine-readable specification.
2. **Canonical JavaScript Reference Implementations**:
   - Upstream Quinelings Engine: [`/home/charles/repos/quinelings/woven-body.js`](file:///home/charles/repos/quinelings/woven-body.js), [`/home/charles/repos/quinelings/lifeform-families.js`](file:///home/charles/repos/quinelings/lifeform-families.js), [`/home/charles/repos/quinelings/chroma.js`](file:///home/charles/repos/quinelings/chroma.js), [`/home/charles/repos/quinelings/lifeform-renderer.js`](file:///home/charles/repos/quinelings/lifeform-renderer.js).
   - Sherlock 3D WebGPU / Three.js Stage: [`/home/charles/sherlock-bench/src/engine/quinelingsSdk.js`](file:///home/charles/sherlock-bench/src/engine/quinelingsSdk.js) and [`/home/charles/sherlock-bench/src/designers/designer8_quineling.js`](file:///home/charles/sherlock-bench/src/designers/designer8_quineling.js).
3. **Formal Proofs & Invariants**:
   - Lean 4 Proofs: [`/home/charles/repos/quinelings/spec/lean/QDL/WovenBody.lean`](file:///home/charles/repos/quinelings/spec/lean/QDL/WovenBody.lean).
   - Quint State Machines: [`/home/charles/repos/quinelings/spec/woven-combinations.qnt`](file:///home/charles/repos/quinelings/spec/woven-combinations.qnt) and [`/home/charles/repos/quinelings/spec/animation-pipeline.qnt`](file:///home/charles/repos/quinelings/spec/animation-pipeline.qnt).

---

## 2. Global $C^2$ Laminar Kinematics, Zero-Shake Camera & Lighting Laws

To ensure every Quineling moves like a living, breathing marine organism flowing through water with **zero camera shake**, animators must obey five global laws:

### 2.1 Startup-Locked Bounding Box (Zero Camera Shake)
Never recompute the camera center `(midX, midY)` or scale `span` from a moving point cloud per frame. Compute and lock `(cx, cy, cz, span, spanZ)` once at rest phase $\phi = 0$:
$$c_x = \frac{x_{\min}(0) + x_{\max}(0)}{2}, \quad c_y = \frac{y_{\min}(0) + y_{\max}(0)}{2}, \quad \text{span} = \max\!\big(0.25,\; 0.56(x_{\max}(0)-x_{\min}(0)),\; 0.56(y_{\max}(0)-y_{\min}(0))\big)$$
Every subsequent phase $\phi \in [0, 2\pi)$ projects through this invariant reference frame.

### 2.2 $C^2$ Quintic Smootherstep Interpolation
Whenever interpolating between phase ring buckets $(\text{bucket}_k, \text{bucket}_{k+1})$, cross-manifold morph targets $(P_A, P_B)$, or scene transitions $\tau \in [0, 1]$, use Perlin's $C^2$-continuous quintic polynomial whose first **and** second derivatives vanish at both endpoints ($S_2'(0)=S_2'(1)=0$, $S_2''(0)=S_2''(1)=0$):
$$S_2(\tau) = 6\tau^5 - 15\tau^4 + 10\tau^3, \qquad \tau = \operatorname{clamp}(t, 0, 1)$$

### 2.3 Frame-Rate-Independent Exponential Damping
All interactive or step-driven state changes (3D tilt, recursion depth, active owner node, camera orbit, audio envelope) must be smoothed via exact exponential decay with $\Delta t$ clamped to $[0.001, 0.05]\text{ s}$:
$$y(t + \Delta t) = y(t) + \big(x_{\text{target}}(t) - y(t)\big)\cdot\left(1 - e^{-\lambda \Delta t}\right)$$

### 2.4 Aerial Perspective, 32-Bin $Z$-Sorting & AgX/ACES Soft-Knee Roll-Off
Sort all projected points and ridge segments back-to-front across $B = 24\text{..}32$ depth bins over $z_{\text{norm}} \in [-1, 1]$:
- **Receding Depth Attenuation ($z_{\text{norm}} < 0$)**: Desaturate toward abyssal indigo `#0e1838` by $\lambda_{\text{ind}} = \min(0.45, -0.36 z_{\text{norm}})$ and attenuate opacity exponentially:
  $$\alpha_{\text{depth}}(z_{\text{norm}}) = \begin{cases} e^{0.85 z_{\text{norm}}} & z_{\text{norm}} < 0 \\ 1 + 0.25 z_{\text{norm}} & z_{\text{norm}} \ge 0 \end{cases}$$
- **Foreground Pearlescent Fresnel Glint ($z_{\text{norm}} > 0$)**: Blend toward warm bioluminescent pearl `#fff7e8` by $\lambda_{\text{pearl}} = \min(0.42, 0.28 z_{\text{norm}}^{1.35})$.
- **Filmic Soft-Knee Highlight Roll-Off**: Prevent additive `lighter` blending from clipping dense cores into chalky white:
  $$\alpha_{\text{filmic}} = \frac{\alpha_{\text{lin}}}{\sqrt{1 + 0.58\,\alpha_{\text{lin}}^2}}, \qquad \alpha_{\text{lin}} = \left(1 - e^{-2.2 \alpha_{\text{raw}}}\right)\alpha_{\text{depth}}(z_{\text{norm}})$$

### 2.5 Calligraphic Stroke Taper & Jacobian Compression Width
Every caustic ridge and filament tapers smoothly to a fine glass tip at both ends ($s \in [0, 1]$) and thickens on foreground crests:
$$w(s, z_{\text{norm}}) = w_0 \cdot \left(0.56 + 0.64\,d_{\text{norm}}\right) \cdot \left(0.22 + 0.78 \sin(\pi s)^{0.6}\right), \qquad d_{\text{norm}} = \frac{z_{\text{norm}} + 1}{2}$$

---

## 3. Complete Mathematical Specification of the 8 Quineling Families

### Family 01: `toroidal-weave` — Stereographic $S^3 \to \mathbb{R}^3$ Hopf Fibration & Villarceau Linked Fibers
- **Topological Invariant**: Every pair of distinct strand fibers $\gamma_i, \gamma_j \subset S^3$ is a Villarceau circle linked with exact linking number $\operatorname{Lk}(\gamma_i, \gamma_j) = +1$.
- **Equations ($u \in [0, 1]$, strand index $p \in \{1,\dots,S\}$, phase $\phi \in [0, 2\pi)$)**:
  $$\eta(p, \phi) = 0.24 + 0.46\left(\frac{1 + \cos(2\pi p / S + \phi)}{2}\right), \qquad \xi_1(u, \phi) = 2\pi P u + a_{\text{asym}}\sin(2\pi u + \phi)$$
  $$\xi_2(u, p, \phi) = \theta_0(p) + 2\pi Q u + \theta_{\text{hol}}(u, \phi)$$
  $$X_{S^3} = \big(\cos\eta\cos\xi_1,\; \cos\eta\sin\xi_1,\; \sin\eta\cos\xi_2,\; \sin\eta\sin\xi_2\big), \qquad \|X_{S^3}\|_2^2 \equiv 1$$
  $$\mathbf{P}_{\text{Hopf}}(u, p, \phi) = \frac{R_{\text{scale}}}{1.35 - 0.55\sin\eta\sin\xi_2}\big(\cos\eta\cos\xi_1,\; \cos\eta\sin\xi_1,\; \sin\eta\cos\xi_2\big)$$
- **Lean 4 Theorem**: `hopf_s3_norm_sq_one` in `spec/lean/QDL/WovenBody.lean`.

### Family 02: `lorenz-flow` — Biharmonic Lorenz–Halvorsen Strange Attractor & $SO(3)$ Bishop Frame
- **Dynamical System (RK4 integration, $\Delta t = 0.006$, $\text{burn} = 512$, $\text{steps} = 3072$)**:
  $$\frac{dx}{dt} = \sigma(y - x) + \varepsilon\sin(y), \qquad \frac{dy}{dt} = x(\rho - z) - y + \varepsilon\sin(z), \qquad \frac{dz}{dt} = xy - \beta z + \varepsilon\sin(x)$$
  with canonical parameters $\sigma = 10$, $\rho = 28$, $\beta = 8/3$, and biharmonic coupling $\varepsilon \in [0, 0.45]$.
- **Twist-Free $SO(3)$ Bishop Parallel-Transport Frame**:
  Unlike Frenet–Serret frames (which flip discontinuously by $180^\circ$ at inflection points between the two Lorenz wings), the Bishop frame $(T_i, N_{1,i}, N_{2,i})$ parallel-transports the normal plane along the unit tangent $T_i = \Delta \mathbf{x}_i / \|\Delta \mathbf{x}_i\|$ via minimal rotation:
  $$N_{1,i} = \operatorname{normalize}\!\big(N_{1,i-1} - (N_{1,i-1}\cdot T_i)T_i\big), \qquad N_{2,i} = T_i \times N_{1,i}$$
  $$\mathbf{P}_{\text{Lorenz}}(u, v, \phi) = \mathbf{x}(u) + w(v)\big(\cos\theta(u,\phi)\,N_1(u) + \sin\theta(u,\phi)\,N_2(u)\big)$$

### Family 03: `clifford-flow` — Biharmonic Clifford Strange Attractor & Vorticity-Sheet Jacobian Relief
- **2D Coupled Map & 3D Vorticity Elevation**:
  $$x_{n+1} = \sin(a y_n) + c\cos(a x_n) + \varepsilon\sin(2a y_n), \qquad y_{n+1} = \sin(b x_n) + d\cos(b y_n) + \varepsilon\cos(2b x_n)$$
  $$\det DF(x, y) = ab\big(\cos(ay)\cos(bx) - cd\sin(ax)\sin(by)\big)$$
  $$z_{\text{Clifford}}(x, y, \phi) = 0.052\sin(x + y + \phi) + 0.024\tanh\!\big(0.35\det DF(x, y)\big)$$
- **Lean 4 Bound**: `clifford_step_bound` proves $|x_{n+1}| \le 1 + |c| + |\varepsilon|$ for all inputs.

### Family 04: `recursive-julia` — 3D Holomorphic Douady–Hubbard Potential & Milnor Distance Relief
- **Complex Quadratic Dynamics ($z_{k+1} = z_k^2 + c(\phi)$ over $72\times 72$ grid in $[-1.55, 1.55]^2$)**:
  $$G_c(z) = \frac{\log|z_n|}{2^n}, \qquad d(z) = \frac{|z_n|\log|z_n|}{|z'_n|}, \qquad z'_n = 2^n \prod_{k=0}^{n-1} z_k$$
  $$z_{\text{Julia}}(x, y, \phi) = 0.075\tanh\!\big(0.8\,G_c(z)\big) + 0.042\,e^{-3 d(z)}\cos\!\big(\arg(z_n) - \phi\big)$$
- **Marching-Squares Territory Guarantee**: Every territory cell $k \in \{0,\dots,N-1\}$ is guaranteed at least one fallback contour sample (`ownerMarks[k]`) even for high node counts ($N \ge 19$).

### Family 05: `recursive-affine` — Contractive IFS Rolled-Scroll Charts & Whitney Fold-Cusp Caustics
- **Contractive Affine Branch Maps ($m \in \{0, 1\}$, depth $d \le 5$, scale $s_m \in [0.35, 0.67]$)**:
  $$f_m(\mathbf{x}) = \mathbf{x}_{\text{attach}} + s_m R(\theta_m + \delta\theta(\phi))\,\mathbf{x}$$
- **Rolled-Scroll 3D Immersion & Whitney Fold-Cusp Caustic Brightness**:
  $$I_{\text{caustic}}(u, v) = \operatorname{clamp}\!\left(\frac{1}{\sqrt{|\det J_{\text{proj}}(u, v)| + 0.04}},\; 0.15,\; 1.0\right)$$
- **Lean 4 Theorems**: `contractive_scale_lt_one` and `affine_geometric_series_bound` prove $\sum_{k=0}^d L s^k \le \frac{100}{33}L$.

### Family 06: `logarithmic-mantle` — Logarithmic Spiral Mantle & Hofstadter Golden-Ratio $\pi$-Holonomy
- **Equations**:
  $$r(u, v) = r_0 e^{b u}\big(1 + m\cos(k v + \phi)\big), \qquad \theta_{\text{hol}}(u, \phi) = \pi u + 2\pi\Phi^{-1} u(1 - u)\sin(\phi)$$
  where $\Phi^{-1} = \frac{\sqrt{5}-1}{2} \approx 0.6180339887$. Traversing $u: 0 \to 1$ imparts a non-orientable $\pi$ Möbius half-twist modulated by quasi-periodic golden-ratio breathing.

### Family 07: `pleated-braid` — Artin Braid Group $B_n$ Weaving & Strange-Loop Ouroboros Nerve
- **Artin Braid Relations ($\sigma_i \sigma_{i+1} \sigma_i = \sigma_{i+1} \sigma_i \sigma_{i+1}$)**:
  $$y_k(u, \phi) = y_{k,0}(u) + A_{\text{pleat}}\sin(\pi m u + \sigma_k \phi), \qquad z_k(u, \phi) = A_z \cos(\pi m u + \sigma_k \phi)$$
- **Strange-Loop Ouroboros Quine Filament (`WovenBody.strangeLoop(body, phase)`)**:
  Connects the terminal output territory (`apply`, $u \in [2/3, 1]$) back into the initial constructor quotation (`quote`, $u \in [0, 1/3)$) through the execution bridge (`run`, $u \in [1/3, 2/3)$) with a traveling fixed-point soliton pulse:
  $$A_{\text{pulse}}(s, \phi) = 1 + 0.45\operatorname{sech}^2\!\Big(8\cdot\operatorname{wrap}\!\big(s - \tfrac{\phi}{2\pi}\big)\Big)$$

### Family 08: `phyllotaxis-fan` — Vogel Golden-Angle Phyllotaxis Spiral & CEK KdV Soliton Wave
- **Vogel Spiral Packing & Korteweg–de Vries (KdV) Execution Soliton**:
  $$r_k = c\sqrt{k}, \qquad \theta_k = k \cdot 2\pi\left(1 - \Phi^{-1}\right) \approx k \cdot 137.507764^\circ$$
  $$A_{\text{soliton}}(u, \phi) = \sum_{m=0}^{N-1} g_m \operatorname{sech}^2\!\Big(9\big(u - u_m - 0.12\sin\phi\big)\Big)$$

---

## 4. Chimeric Symbiogenesis (`WovenBody.combine`) & Live CEK Program Execution (`WovenBody.stepResponse`)

### 4.1 Causal Seam Grafting (`compose` & `mate`)
Given donor manifold $\mathbf{P}_A(u, \phi)$ and recipient manifold $\mathbf{P}_B(u, \phi)$ with seam interval $[u_0, u_1] \subset [0, 1]$, let $\lambda(u) = S_2\!\big(\operatorname{clamp}(\frac{u - u_0}{u_1 - u_0}, 0, 1)\big)$:
$$\mathbf{P}_{\text{chimera}}(u, \phi) = \big(1 - \lambda(u)\big)\mathbf{P}_A(u, \phi) + \lambda(u)\mathbf{P}_B(u, \phi) + 4\lambda(u)\big(1 - \lambda(u)\big)\mathbf{H}_{\text{bridge}}(u, \phi)$$
where $4\lambda(1-\lambda)$ vanishes identically outside the seam and reaches unit peak at the seam midpoint $u = (u_0 + u_1)/2$.

### 4.2 Bidirectional Strange-Attractor Cross-Modulation (`symbiote` & `merge`)
$$\mathbf{P}_{\text{symbiote}}(u, \phi) = \mathbf{P}_A\!\big(u,\; \phi + \kappa\|\mathbf{P}_B(u, \phi)\|\big) + \kappa\big(\mathbf{P}_B(u, \phi) \times \mathbf{N}_A(u, \phi)\big), \qquad \kappa \in [0.05, 0.45]$$

### 4.3 Live CEK Program Execution Coupling (`execution` Parameter)
When a Quineling executes a program step-by-step (`outcome` $\in \{\text{Running}, \text{Done}, \text{Rejected}, \text{Exhausted}\}$):
- **Active Node KdV Soliton**: Amplifies owner territory $m = \text{activeOwner}$ by $g_m \in [1.0, 1.65]$ and elevates $z$-flare by $\Delta z_m = 0.048 \operatorname{sech}^2(9(u - u_m))$.
- **Outcome Harmonic Locking vs Viscous Distress Wave**:
  - `Done`: Golden-ratio phase lock ($\text{globalScale} = 1.04$, zero shear).
  - `Rejected` / `Exhausted`: Smooth, low-frequency viscous distress wave $\Delta_{\text{viscous}}(p, i) = 0.032\sin(2p + 2\pi i \Phi^{-1})$ (replacing harsh high-frequency mechanical vibration).

---

## 5. Digital Electronic Ocean Physics & 90.000-Second `charlessong_90s.mp3` Synchronization

### 5.1 Three-Zone Digital Electronic Ocean Architecture
1. **Epipelagic Canopy (Top)**: Snell's window ($48.6^\circ$ critical cone) + 43.2 Hz refractive clock-wave interference ribbons driven by `audioBands.highSynth`.
2. **Pelagic Water Column (Mid-Water)**: Divergence-free curl-noise streamfunction $\mathbf{u}(x, y, t) = \nabla \times \psi(x, y, t)$ ($\nabla \cdot \mathbf{u} \equiv 0$) driving 6 swaying optical-fiber kelp strands and 64 `RGB(b)` genome plankton motes.
3. **Benthic Lithography Trench (Bottom)**: 6 Concentric Sherlock CPU Rings (`R0`–`R5`, gold `#f6e2b2`, cyan `#7dd3fc`, emerald `#a8e0c6`, orchid `#e4c4f0`, cobalt `#38bdf8`, amber `#f59e0b`) pulsing with `audioBands.subBass`.

### 5.2 Sample-Exact 90.000-Second Master Soundtrack (`charlessong_90s.mp3`)
- **Source**: `/mnt/c/Users/charl/OneDrive/Desktop/charlessong.mp3` (`118.746848s`, 98 BPM = `1.6333 Hz`).
- **Master Cut**: [`/home/charles/sherlock-bench/assets/audio/charlessong_90s.mp3`](file:///home/charles/sherlock-bench/assets/audio/charlessong_90s.mp3) and [`/home/charles/sherlock-bench/assets/audio/charlessong_90s.wav`](file:///home/charles/sherlock-bench/assets/audio/charlessong_90s.wav) — **exact `3,969,000` samples @ `44,100 Hz` = `90.000000s` (`5,400` frames @ `60fps`)**, assembled via 3 phase-correlated equal-power cosine crossfades:

| Master Time | Frames (`60fps`) | Scene | Musical & Lyric Cue (`charlessong_90s.mp3`) | Visual Choreography |
| :--- | :--- | :--- | :--- | :--- |
| `00.00s – 08.00s` | `0000 – 0480` | **Scene 01** | Sub-bass abyssal pad & glassy arpeggio | *"What is life?"* — Embryonic Hopf Quineling pulsing over 6-ring CPU floor |
| `08.00s – 18.00s` | `0480 – 1080` | **Scene 02** | Synth bass pulse & clock-crystal chimes | 3 holographic terminal panes (`tty0`, `tty1`, `tty2`) type self-reproducing QDL quine code |
| `18.00s – 31.00s` | `1080 – 1860` | **Scene 03** | *"Come with me, and you'll be, in a world of pure imagination…"* | Code glyphs detach into a Rankine hydrodynamic vortex and birth the Hopf Quineling |
| `31.00s – 44.00s` | `1860 – 2640` | **Scene 04** | *"Take a look, and you'll see, into your imagination…"* | Hero Quineling swims a figure-8 path, morphing `toroidal` $\to$ `lorenz` $\to$ `clifford` |
| `44.00s – 57.00s` | `2640 – 3420` | **Scene 05** | *"We'll begin, with a spin, traveling in the world of my creation…"* | Holomorphic Julia relief, contractive affine caustics, and golden-ratio $\pi$-holonomy |
| `57.00s – 68.00s` | `3420 – 4080` | **Scene 06** | *"If you want to view paradise… Want to change the world, there's nothing to it…"* | Two parent Quinelings glide together and fuse across a $C^2$ quintic geodesic seam |
| `68.00s – 81.00s` | `4080 – 4860` | **Scene 07** | **[MASSIVE SYNTHWAVE CLIMAX DROP @ 69.25s]** | Zero-shake exponential pullback ($Z_{\text{cam}}(t) = Z_0 (Z_1/Z_0)^{S_2(\tau)}$) to **36 Quinelings** |
| `81.00s – 90.00s` | `4860 – 5400` | **Scene 08** | *"Living there, you'll be free, if you truly wish to be…"* | *"Life is what we make of it."* — Pelagic colony & resonant D-minor glow |

---

## 6. Complete Quinelings 2.0 Creative & Technical Package Manifest (`01` – `13`)

Every deliverable of the Quinelings 2.0 Creative & Technical Package is complete, verified, and committed:

1. [`wiki-llm/01-overview-and-architecture.md`](file:///home/charles/repos/quinelings/wiki-llm/01-overview-and-architecture.md) — Core Quine Architecture & Constructor Identity
2. [`wiki-llm/02-qdl-and-morphology.md`](file:///home/charles/repos/quinelings/wiki-llm/02-qdl-and-morphology.md) — QDL Genome, Harmonic/RGB Codecs & Morphology
3. [`wiki-llm/03-woven-body-mathematics.md`](file:///home/charles/repos/quinelings/wiki-llm/03-woven-body-mathematics.md) — 8 Differential-Geometric Mechanisms & Caustics
4. [`wiki-llm/04-combinations-and-execution.md`](file:///home/charles/repos/quinelings/wiki-llm/04-combinations-and-execution.md) — Chimeric Symbiogenesis & CEK Execution Response
5. [`wiki-llm/05-formal-verification-lean-quint.md`](file:///home/charles/repos/quinelings/wiki-llm/05-formal-verification-lean-quint.md) — 14 Lean 4 Theorems & Quint Formal Specs
6. [`wiki-llm/06-muse-creative-director-storyboard.md`](file:///home/charles/repos/quinelings/wiki-llm/06-muse-creative-director-storyboard.md) — Muse Wonder 1.0 5-Act Storyboard
7. [`wiki-llm/07-scrapling-animation-best-practices.md`](file:///home/charles/repos/quinelings/wiki-llm/07-scrapling-animation-best-practices.md) — Scrapling Research & 10-Agent Zero-Shake Fluidity Synthesis
8. [`wiki-llm/08-muse-creative-director-what-is-life-brief.md`](file:///home/charles/repos/quinelings/wiki-llm/08-muse-creative-director-what-is-life-brief.md) — *"What is life?"* $\to$ *"Life is what we make of it"* Design Brief
9. [`wiki-llm/09-gemini-elegance-trio-study.md`](file:///home/charles/repos/quinelings/wiki-llm/09-gemini-elegance-trio-study.md) — 3-Agent Study of Lighting, Calligraphic Line Depth & Chromatic Harmony
10. [`wiki-llm/10-elevenlabs-documentation-research.md`](file:///home/charles/repos/quinelings/wiki-llm/10-elevenlabs-documentation-research.md) — ElevenLabs Music & SFX API Documentation Research
11. [`wiki-llm/11-muse-round2-electronic-ocean-concept-art-and-elevenlabs-soundtrack.md`](file:///home/charles/repos/quinelings/wiki-llm/11-muse-round2-electronic-ocean-concept-art-and-elevenlabs-soundtrack.md) — Digital Electronic Ocean World Bible & 6 GPT (`gpt-6.1-sol`) Concept Art Plates (`wiki-llm/concept-art/concept_01..06.png`)
12. [`wiki-llm/12-muse-gemini-charlessong-90s-cut-and-choreography.md`](file:///home/charles/repos/quinelings/wiki-llm/12-muse-gemini-charlessong-90s-cut-and-choreography.md) — 90.000s Master Cut of `charlessong.mp3` & Audio-Visual Choreography
13. [`wiki-llm/13-animator-mathematical-rendering-bible.md`](file:///home/charles/repos/quinelings/wiki-llm/13-animator-mathematical-rendering-bible.md) — Complete Animator's Mathematical Rendering Bible & Package Manifest
