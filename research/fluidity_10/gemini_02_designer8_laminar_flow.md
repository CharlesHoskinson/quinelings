# Designer 8 Sub-Bucket Phase Interpolation & Laminar Water-Like Flow Architecture

**Agent**: Gemini Fluidity Agent 2 (`54de896d-8d34-4159-be02-18bbcec38e6a`)  
**Target Subsystem**: `src/designers/designer8_quineling.js` & `src/engine/functionalStructures.js`  
**Reference Best Practices**: `wiki-llm/07-scrapling-animation-best-practices.md`

---

## 1. Root-Cause Analysis of Stepping & Micro-Roughness in `designer8_quineling.js`

### 1.1 Sawtooth Phase-Velocity Lurches (`stepSurgeVel`, Lines 1051–1068)
In `designer8_quineling.js`:
```js
if (stepIndex !== lastStepIndex) {
  if (lastStepIndex !== -1) {
    stepSurgeVel = Math.min(2.6, stepSurgeVel + 0.95);
  }
  lastStepIndex = stepIndex;
}
stepSurgeVel *= Math.exp(-dt * 5.5);
...
const omega = qdlPhaseSpeed * mechGain * fuelMod + stepSurgeVel;
accumPhase = (accumPhase + dt * omega) % (TAU * 64);
```
During normal CEK playback (`3.2 steps/sec`, $\Delta t_{\text{step}} \approx 312.5\text{ ms}$):
- Every 312.5 ms, `omega` jumps instantaneously by $+0.95\text{ rad/s}$ (a 35%–50% velocity spike) and then decays exponentially with $\tau = 1 / 5.5 \approx 182\text{ ms}$.
- While `accumPhase` is $C^0$ continuous, its first derivative $\dot{\phi}(t) = \omega(t)$ has a sawtooth waveform and its second derivative $\ddot{\phi}(t)$ contains periodic Dirac impulses at 3.2 Hz.
- Because `wovenPhase` drives **every** motion channel (`baseTissueWave` advection `2.5 * wovenPhase`, `coreRoot.position.y`, `coreRoot.rotation`, `coreRoot.scale`, gossamer ribbons, and atrium tendrils), this sawtooth velocity profile makes the entire organism lurch and brake 3.2 times per second instead of flowing like water.

### 1.2 Discrete Bucket Snapping in `PersistentPhaseRing` (Lines 1134–1142)
- `PersistentPhaseRing` divides $S^1 = [0, 2\pi)$ into $N = 64$ buckets on desktop ($N = 48$ on mobile), each spanning $\Delta\phi = 2\pi / 64 \approx 0.0982\text{ rad}$ ($5.625^\circ$).
- `phaseRing.getNearest(wovenPhase)` returns a single discrete bucket without fractional interpolation. At $\omega \approx 2.8\text{ rad/s}$, the organism crosses a bucket boundary ~28 times per second, causing all 8,192 `baseTissuePos` coordinates, `baseTissueExpAlpha` values, `baseRidgePos` segments, and `ribbonPaths` to step discretely ($C^{-1}$ discontinuity).
- Inspection of `src/engine/quinelingsSdk.js` (`LifeformFamilies.frame`, `cliffordFrame`, `juliaFrame`, `recursiveFrame`, and `WovenBody.frame`) confirms that for a compiled `WovenBody` and fixed `budget = TISSUE_BUDGET`, **particle index `i` ($0 \le i < \text{TISSUE\_BUDGET}$) always maps to the exact same `(component, u, v)` chart coordinate or attractor mark across all phases**. Thus, `bucketA.baseTissuePos[3*i .. 3*i+2]` and `bucketB.baseTissuePos[3*i .. 3*i+2]` are exact trajectory samples of the *same* material particle at $\phi_A$ and $\phi_B$ and can be linearly/Hermite blended in $O(1)$ time per vertex.

### 1.3 Step-Reset Yaw Impulses & Un-Damped Node Execution States
1. **`coreRoot.rotation.y` Reset Jump (Line 1094)**:
   - `(isInPlaceRewrite ? Math.sin(q * Math.PI) * 0.14 : 0)` uses intra-step `q = quinticStep(rawSub)`, which resets to `0` at every step boundary and toggles abruptly when entering/exiting rewrite rules (`A145`, `A149`, `A177`).
2. **Instantaneous Per-Node Gains & Z-Shifts (Lines 1211–1257, 1306–1360, 1413–1445)**:
   - `activeNodeIdx`, `nodeExecGain[n]`, and `nodeExecZShift[n]` change discretely on each step, causing immediate step-boundary jumps in tissue $z$-elevation (`execZ * 0.35`), tissue/ridge luminance, ribbon half-width (`0.0085` vs `0.0052`), anchor node scale (`1.65` vs `0.95`), and dependency arc opacity (`0.85` vs `0.38`).
3. **Genome Spore Index Quantization (Line 1481)**:
   - `const samplePt = Math.floor(((s * 61 + Math.floor(wovenPhase * 12)) % TISSUE_BUDGET)) * 3;` increments `Math.floor(wovenPhase * 12)` ~30 times per second, causing every spore to teleport to an unrelated tissue point on the manifold.
4. **Compressible Radial Wave Displacement (Lines 1238–1240)**:
   - Displacing $(x, y)$ by $+0.044\,\text{waveS}\cdot(bx, by)$ without a compensating axial compression term $-2\epsilon\,bz$ has non-zero 3D divergence ($\nabla \cdot \mathbf{u} = 2\epsilon \neq 0$), causing local density bunching rather than incompressible laminar streamline flow.

---

## 2. Mathematical Architecture of the Upgrade

### 2.1 Critically Damped Exponential Smoothing State Vector
We replace all discontinuous step impulses with frame-rate-independent exponential decay (`lerp(current, target, 1 - Math.exp(-dt * lambda))`):
- **`dampedOmega`** ($\lambda_\omega = 4.5\text{ s}^{-1}$): Smoothly tracks the continuous target phase velocity $\omega_{\text{target}} = \omega_{\text{QDL}} \cdot G_{\text{mech}} \cdot M_{\text{fuel}} \cdot (1 + \min(0.18, 0.025 \cdot d_{\text{call}}))$, completely eliminating `stepSurgeVel` sawtooth lurches.
- **`dampedRotY` & `dampedRewriteYaw`** ($\lambda_{\text{yaw}} = 9.0\text{ s}^{-1}$, $\lambda_{\text{rw}} = 5.0\text{ s}^{-1}$): Smoothly integrates ambient rotation, rhythm sway, and in-place rewrite torsion without referencing the step-resetting `q` parameter.
- **`dampedNodeActive[n]`, `dampedNodeGain[n]`, `dampedNodeZShift[n]`** ($\lambda_{\text{node}} = 9.5\text{ s}^{-1}$): Every AST operation territory $n \in [0, 63]$ smoothly ramps its active highlight, luminance gain, and 3D $z$-relief shift across step transitions.
- **`dampedFault`, `dampedExhaust`, `dampedDone`** ($\lambda_{\text{state}} = 7.5\text{ s}^{-1}$): Smoothly cross-fades terminal/fault chroma and studio point-light intensity.

### 2.2 Sub-Bucket Phase-Ring Interpolation `(bucketA, bucketB, frac)`
Given `wovenPhase` $\phi \in \mathbb{R}$ and bucket count $N = \text{PHASE\_BUCKET\_COUNT}$, since bucket $k$'s canonical center is $\phi_k = \frac{k + 0.5}{N} 2\pi$:
$$s = \frac{((\phi \bmod 2\pi) + 2\pi) \bmod 2\pi}{2\pi} N - 0.5, \quad k_A = \lfloor s \rfloor \bmod N, \quad k_B = (k_A + 1) \bmod N, \quad f = s - \lfloor s \rfloor \in [0, 1)$$
- **Amortized Background Warming**: Cold buckets are computed at most once every 3 frames so frame times never spike; once `bucketA` and `bucketB` are both warm, we blend `pos`, `wave`, `expAlpha`, and `pearl` linearly by $f$ and re-normalize `(sinK, cosK)` via fast first-order secant correction `invNorm = 1.5 - 0.5 * (sinK * sinK + cosK * cosK)` (one Newton-Raphson step of $x^{-1/2}$, zero `Math.sqrt` or trig calls!).
- **Proximity-Guarded Ridge & Ribbon Blending**: For caustic ridges and 3D gossamer ribbons, if segment `segIdx` in `bucketB` shares the same `owner` and lies within an $L_1$ radius $< 0.09$ of `bucketA`, its endpoints, wave vectors, and alphas are blended by $f$.

### 2.3 Divergence-Free 3D Laminar Streamline Advection ($\nabla \cdot \mathbf{u} = 0$)
Using the interpolated spatial wave `(sinK, cosK)` and per-frame `(sinPhi, cosPhi)`, we evaluate the traveling wave harmonics:
$$\text{waveS} = \sin(k - 2.5\phi) = \sin k \cos(2.5\phi) - \cos k \sin(2.5\phi)$$
$$\text{waveC} = \cos(k - 2.5\phi) = \cos k \cos(2.5\phi) + \sin k \sin(2.5\phi)$$
We decompose the 3D advection displacement $\delta\mathbf{x} = \delta\mathbf{x}_{\text{rot}} + \delta\mathbf{x}_{\text{stokes}} + \delta\mathbf{x}_{\text{helical}}$ into three divergence-free components:
1. **Incompressible Azimuthal Vortex Swirl**: $\delta\mathbf{x}_{\text{rot}} = \omega_s(-y, x, 0)$ with $\omega_s = 0.030\,\text{waveC}$, satisfying $\partial_x(-y) + \partial_y(x) = 0$.
2. **Volume-Preserving Stokes Radial-Axial Strain**: $\delta\mathbf{x}_{\text{stokes}} = (\epsilon_r x, \epsilon_r y, -2\epsilon_r z)$ with $\epsilon_r = 0.024\,\text{waveS}$, satisfying $\text{tr}(D) = \epsilon_r + \epsilon_r - 2\epsilon_r = 0$.
3. **Transverse Helical Wave Lift**: $\delta\mathbf{x}_{\text{helical}} = (0, 0, 0.042\,\text{waveS} + 0.020\,\text{waveC} + 0.35\,z_{\text{exec}})$.
