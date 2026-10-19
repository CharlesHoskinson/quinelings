# THE OUROBOROS MANIFOLD
## When Programs Become Living Geometry

### Quinelings 2.0 — Mathematical Lifeforms & Strange-Loop Film
**Creative Direction & Motion Graphics Storyboard**

| Item | Specification |
|---|---|
| Runtime | 90 seconds |
| Frame Rate | 60 fps |
| Total Frames | 5,400 frames |
| Format | 3840 × 2160, 16:9, Rec. 709 / P3-safe |
| Structure | 5 Acts, 12 Scenes |
| Visual Language | 3Blue1Brown mathematical clarity × Territory Studio cinematic interfaces × Claude Motion kinetic typography |
| Motion Principle | No decorative motion. Every movement is driven by a mathematical parameter, program state, or proof obligation |
| Typography | Space Grotesk for titles, IBM Plex Mono for code, KaTeX-style serif for equations |
| Master Palette | Void `#05070D`, Ink `#0B1020`, Proof White `#F4F7FF`, Quine Cyan `#22D3EE`, Phi Gold `#F5C542`, Lorenz Coral `#FF5A6E`, Hopf Violet `#8B7CFF`, Living Green `#34E89E`, Reject Red `#FF3355` |
| Master Easing | `cubic-bezier(0.22, 1.00, 0.36, 1.00)` for entrances; `cubic-bezier(0.65, 0.00, 0.35, 1.00)` for state changes; linear only for true phase, rotation, and attractor time |
| Audio Clock | 120 BPM, 4/4. One beat = 30 frames. One bar = 120 frames. Mathematical events land on beats; proof events land on bar lines |

> **Directorial thesis:** A program is not illustrated. A program is grown. Code becomes tissue, tissue becomes geometry, geometry folds back into code — and the film ends when the loop proves itself.

---

# GLOBAL VISUAL SYSTEM

## Camera Grammar

| Camera Move | Meaning | Never Used For |
|---|---|---|
| Slow push-in | A definition becoming unavoidable | Decoration |
| Orbital move | A group action, fibration, flow, or symmetry | Generic “3D showcase” |
| Lateral dolly | Scanning an interval, sequence, or trace | — |
| Top-down flattening | A projection, quotient, or proof view | Hiding dimensionality without labeling it |
| Pull-back to manifold | Local construction revealed as global object | — |
| Locked-off frame | A theorem, invariant, or terminal state | — |

## Kinetic Typography Rules

1. Equations enter **term by term**, left to right, in reading order.
2. A variable appears on screen at the exact frame its geometry changes.
3. Definitions fade in at 60% opacity; active terms reach 100% and gain a 1-frame glow.
4. Code is typed, never pasted. One token per 2 frames at normal speed, one token per frame under urgency.
5. Theorem statements are never paraphrased mid-animation. They assemble, lock, and remain readable for at least 45 frames.
6. Numbers count with tabular figures. No rolling odometers on proof counts.

## Sound Architecture

| Layer | Content | Function |
|---|---|---|
| Pulse | Sine sub at 55 Hz, soft kick on beats 1 and 3 | Film heartbeat / frame clock |
| Tissue | Filtered noise, granular strings | Territory growth, fibers, sheets |
| Geometry | Glass harmonics, FM bells, prepared piano | Curvature, caustics, phase-lock |
| Code | Short filtered clicks, typewriter transients pitched to a pentatonic scale | CEK steps, quoting, execution |
| Proof | Low brass + choir pad, no percussion | Invariants and final verification |
| Silence | Full drops of 6–12 frames | State changes the audience must feel |

---

# ACT I — THE QUINE SEED & TERRITORY PARTITION $[0,1]$

## Scene 1 — `constructor` / The Quine Seed

**Programs:** `WovenBody.constructor`, territory partition of $[0,1]$  
**Timecode:** `00:00.000 – 00:08.000`  
**Frames:** `0 – 479` (480 frames)

### 1. Visual Composition, Camera & Palette

Black void. A single point of light at frame center expands into a horizontal interval — a luminous filament stretching from left edge to right edge, suspended over a dark reflective plane.

Beneath it, a constructor program prints itself character by character. Each emitted character lands on the interval as a cell. Cells grow into **contiguous owned tissue patches**: translucent membranes with visible seams, each patch a distinct hue drawn from a controlled spectral ramp, each labeled with its owner index.

The camera begins in extreme close-up on the seed point, dollies laterally along the growing interval, then rises into a slow push-in as the patches tile the full unit interval with no gaps and no overlaps.

| Element | Hex |
|---|---|
| Void background | `#05070D` |
| Interval filament | `#F4F7FF` |
| Constructor code | `#22D3EE` |
| Tissue patch A | `#22D3EE` |
| Tissue patch B | `#34E89E` |
| Tissue patch C | `#F5C542` |
| Tissue patch D | `#FF5A6E` |
| Tissue patch E | `#8B7CFF` |
| Seam lines | `#F4F7FF` at 70% |
| Lean proof panel | `#0B1020` with `#F4F7FF` text |

### 2. Equations & Kinetic Typography

On screen, in sequence:

```text
q  =  quote(program)
program  →  run(q)  →  program
```

Then the partition statement assembles term by term:

$$
[0,1] \;=\; \bigsqcup_{i=0}^{n-1} [\,a_i,\; a_{i+1}\,), \qquad a_0 = 0,\;\; a_n = 1,\;\; a_i < a_{i+1}
$$

Callouts animate as:

- `contiguous` — underlines each shared endpoint `aᵢ₊₁` as two patches touch.
- `owned` — each patch flashes its owner label `owner(i)`.
- `proven in Lean 4` — a proof panel slides up from the lower third:

```lean
theorem territory_partition_covers :
    (⋃ i, patch i) = Set.Icc 0 1
```

```lean
theorem territory_partition_disjoint :
    Pairwise (Disjoint on patch)
```

Each theorem types in, holds, then its final line stamps `∎` in Phi Gold `#F5C542` with a 3-frame scale punch from 104% → 100%.

### 3. Parameter Keyframes

| Frame | Time | Parameter | Value | Easing / Note |
|---:|---|---|---|---|
| 0 | 00:00.000 | Seed intensity | 0.0 | Black |
| 20 | 00:00.333 | Seed intensity | 1.0 | Ease-out, single bloom |
| 40 | 00:00.667 | Interval draw | 0.0 → 1.0 begins | Linear draw-on |
| 120 | 00:02.000 | Code emission rate | 1 token / 2 frames | Pentatonic clicks begin |
| 180 | 00:03.000 | Patch count | 1 → 5 | Each patch grows from its seed endpoint |
| 300 | 00:05.000 | Patch growth | 0.62 → 1.0 coverage | Coverage counter climbs to `1.000` |
| 380 | 00:06.333 | Gap indicator | Visible gaps → 0 | Gap highlights extinguish one by one |
| 430 | 00:07.167 | Lean panel | Hidden → locked | Slides up, 18 frames, master ease |
| 479 | 00:07.983 | `blendWeight` | 1.0 | Full partition held for Act transition |

### 4. Audio & Rhythmic Cues

- **Frames 0–19:** Near-silence. One 55 Hz sub pulse on frame 0.
- **Frame 40:** First heartbeat kick. Interval draw is scored with a rising filtered sine, 110 Hz → 440 Hz across 80 frames.
- **Frames 120–380:** Each code token is a pitched click. Each completed patch adds one granular string note; five patches form a C-major pentatonic stack.
- **Frame 430:** Percussion stops. Proof panel lands on a bar line with a low brass swell.
- **Frame 479:** One held chord. Cut on the downbeat into Act II.

---

# ACT II — EXOTIC CHAOS & DIFFERENTIAL GEOMETRY

## Scene 2 — `toroidal-weave` / Hopf Fibration

**Mathematics:** Stereographic projection $S^3 \to \mathbb{R}^3$, Hopf fibration, linked Villarceau circles, linking number $Lk = \pm 1$  
**Timecode:** `00:08.000 – 00:15.000`  
**Frames:** `480 – 899` (420 frames)

### 1. Visual Composition, Camera & Palette

A hypersphere is suggested, never literally drawn: a field of great circles floats in dark space, each circle a fiber. The camera orbits slowly as stereographic projection pulls the fibers down into $\mathbb{R}^3$, where they resolve into nested tori covered in linked Villarceau circles — every pair of circles linked exactly once.

Two hero circles are isolated mid-scene: one cyan, one gold. They pass through each other without ever touching. A linking counter ticks to `+1`, reverses orientation, and ticks to `−1`.

| Element | Hex |
|---|---|
| Background | `#070A16` |
| Fiber field | `#8B7CFF` |
| Nested tori | `#3D348B` → `#8B7CFF` gradient |
| Hero circle +1 | `#22D3EE` |
| Hero circle −1 | `#F5C542` |
| Projection rays | `#F4F7FF` at 25% |
| Linking readout | `#34E89E` |

### 2. Equations & Kinetic Typography

The Hopf map assembles one complex coordinate at a time:

$$
h(z_1, z_2) \;=\; \bigl(2\,\mathrm{Re}(z_1\bar{z}_2),\;\; 2\,\mathrm{Im}(z_1\bar{z}_2),\;\; |z_1|^2 - |z_2|^2\bigr), \qquad |z_1|^2 + |z_2|^2 = 1
$$

Callouts:

- `S³ → S²` — appears as the base sphere fades in beneath the fibers.
- `fiber = S¹` — one circle detaches and pulses.
- `stereographic projection` — rays converge to the north pole point, then project down.
- `Villarceau circles` — labels track two circles as they tilt into the torus section plane.
- The linking number builds as an integral:

$$
Lk \;=\; \frac{1}{4\pi} \oint\!\!\oint \frac{(\mathbf{r}_1 - \mathbf{r}_2) \cdot (d\mathbf{r}_1 \times d\mathbf{r}_2)}{|\mathbf{r}_1 - \mathbf{r}_2|^3} \;=\; \pm 1
$$

The `= ±1` lands last, in Living Green, synchronized with the hero circles completing one full linked pass.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 480 | `phaseVelocity` | 0.15 rev/s | Fiber field idle rotation |
| 560 | Projection parameter `t` | 0.0 → 1.0 begins | $S^3 \to \mathbb{R}^3$ over 160 frames |
| 640 | `tiltX` / `tiltY` | 18° / −12° | Torus nest revealed |
| 720 | Hero circle isolation | Field opacity → 18% | Two circles remain at full |
| 800 | Linking pass | 0 → 1 full pass | `Lk` counter resolves to `+1` |
| 850 | Orientation | Reverses | Counter resolves to `−1` |
| 899 | `phaseVelocity` | 0.30 rev/s | Hand-off energy into Scene 3 |

### 4. Audio & Rhythmic Cues

- Continuous glass-harmonic arpeggio, one note per fiber family.
- Each completed fiber link adds a soft FM bell; linked pairs chime in major thirds.
- At frame 800, the `+1` landing is a single warm sine tone. At frame 850, `−1` is the same tone detuned down a semitone — orientation made audible.
- Underneath, the 120 BPM pulse continues unbroken from Act I. The audience should feel one organism, not a new clip.

---

## Scene 3 — `lorenz-flow` / Bishop Frames on a Lorenz–Thomas Labyrinth

**Mathematics:** Discrete SO(3) Bishop parallel-transport frames, torsion-free transport, Lorenz–Thomas cyclic attractor  
**Timecode:** `00:15.000 – 00:22.000`  
**Frames:** `900 – 1319` (420 frames)

### 1. Visual Composition, Camera & Palette

The famous butterfly — but built as a **labyrinth ribbon**. A single trajectory threads a cyclic Lorenz–Thomas attractor, extruding a ribbon whose width carries a moving Bishop frame: tangent, normal, binormal triads drawn as small luminous tripods riding the curve.

Crucially, the frame does **not** twist. As the ribbon dives through both lobes, the tripods stay parallel-transported — the audience sees rotation-minimizing motion against the curve's own violent turning. Two synchronized trajectories, phase-locked, weave the labyrinth in coral and cyan.

| Element | Hex |
|---|---|
| Background | `#0A0710` |
| Trajectory A (Lorenz) | `#FF5A6E` |
| Trajectory B (Thomas, phase-locked) | `#22D3EE` |
| Bishop tangent `T` | `#F4F7FF` |
| Bishop normal `N₁` | `#F5C542` |
| Bishop normal `N₂` | `#34E89E` |
| Lobe ghosts | `#FF5A6E` at 8% |

### 2. Equations & Kinetic Typography

The Lorenz system types in beside the left lobe:

$$
\dot{x} = \sigma(y - x), \qquad \dot{y} = x(\rho - z) - y, \qquad \dot{z} = xy - \beta z
$$

with `σ = 10, ρ = 28, β = 8/3` stamping in as the attractor ignites.

The Bishop transport condition appears as the first tripod locks on:

$$
\frac{dN_i}{ds} \;=\; -\bigl(N_i \cdot \tfrac{dT}{ds}\bigr)\, T, \qquad \tau_{\text{Bishop}} = 0
$$

Callouts:

- `parallel transport` — the tripod slides along the ribbon without spinning.
- `zero torsion` — a torsion meter pinned at `0.000` for the full scene.
- `SO(3)` — the frame matrix assembles and its determinant reads `det = +1`.
- `cyclic labyrinth` — both trajectories complete a synchronized lobe exchange; a phase-lock badge reads `Δφ = 0`.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 900 | Attractor integration `dt` | 0.008 | RK4, trajectory draw-on begins |
| 980 | Ribbon extrusion | 0 → 40% | First Bishop tripods appear |
| 1080 | Camera orbit | 0° → 90° | Lobe exchange viewed side-on |
| 1160 | Trajectory B phase | Locked, `Δφ = 0` | Second ribbon joins |
| 1240 | Torsion readout | `0.000` held | Held for minimum 60 frames |
| 1280 | `tiltX` | 24° | Labyrinth depth revealed |
| 1319 | Flow speed | ×1.4 | Acceleration carries into Scene 4 |

### 4. Audio & Rhythmic Cues

- Two interlocking polyrhythmic plucks: 3 against 4, one per trajectory.
- Lobe crossings trigger a soft stereo swap — left trajectory crosses to right channel.
- The torsion meter's held zero is scored with a single sustained harmonic; any viewer who listens for twist hears none.
- A low tom on each lobe entry keeps the chaos legible as rhythm, not noise.

---

## Scene 4 — `clifford-flow` / Jacobian Determinant & Vorticity Sheet

**Mathematics:** Biharmonic flow, Jacobian determinant $\det(DF)$, vorticity $\omega = \nabla \times F$ sheet lift  
**Timecode:** `00:22.000 – 00:29.000`  
**Frames:** `1320 – 1739` (420 frames)

### 1. Visual Composition, Camera & Palette

A flat vector field on a Clifford torus unrolls into a sheet. The sheet deforms under a biharmonic flow — smooth, fourth-order, reluctant to crease. Where the deformation compresses, the sheet glows hot; where it expands, it cools. Then the sheet **lifts**: vorticity curls it up into a standing ribbon of rotation, a translucent vortex sheet hovering over its own field.

A determinant heatmap rides the surface in real time. Folds — where $\det(DF)$ crosses zero — are drawn as bright fault lines.

| Element | Hex |
|---|---|
| Background | `#060B12` |
| Sheet base | `#164E63` |
| Compression (det < 1) | `#FF5A6E` |
| Expansion (det > 1) | `#22D3EE` |
| Fold line (det = 0) | `#F4F7FF` |
| Vorticity lift | `#34E89E` |
| Biharmonic smoothing overlay | `#8B7CFF` at 30% |

### 2. Equations & Kinetic Typography

The deformation gradient appears as the sheet first bends:

$$
F \;=\; \nabla \varphi, \qquad \det(DF) \;=\; \frac{dA_{\text{deformed}}}{dA_{\text{reference}}}
$$

The biharmonic condition fades in term by term:

$$
\Delta^2 \varphi \;=\; 0
$$

Then the vorticity definition, with the curl symbol rotating into place:

$$
\boldsymbol{\omega} \;=\; \nabla \times F, \qquad \text{sheet lift} \;\propto\; |\boldsymbol{\omega}|
$$

Callouts:

- `compression` / `expansion` — labels pin to hot and cool regions and ride the surface.
- `fold: det(DF) = 0` — appears the frame the first fault line ignites.
- `curl lifts the sheet` — the lift begins exactly as $|\boldsymbol{\omega}|$ crosses its on-screen threshold value.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 1320 | Sheet deformation amplitude | 0.0 → 0.4 | Biharmonic solve fades in |
| 1420 | `det(DF)` heatmap | Off → on | 30-frame crossfade |
| 1520 | First fold | `det(DF) = 0` line ignites | Held 45 frames minimum |
| 1600 | Vorticity threshold | Crossed | Sheet lift initiates |
| 1680 | Lift height | 0 → 1.0 normalized | Ease-out over 80 frames |
| 1739 | `blendWeight` (sheet → ribbon) | 0.85 | Ribbon state handed to Scene 5's spiral |

### 4. Audio & Rhythmic Cues

- Sheet deformation: bowed metal / long string glissandi, pitch mapped to mean curvature.
- Fold ignition: a single bright ping, like a fault line cracking in glass.
- Vorticity lift: rising Shepard tone layered under the glissandi, resolving as the ribbon stands.
- Pulse drops out for 12 frames at the fold — the film's first true silence since frame 0.

---

## Scene 5 — `logarithmic-mantle` & `phyllotaxis-fan` / Golden Spiral & Vogel Whorls

**Mathematics:** Bernoulli logarithmic (golden) spiral, Hofstadter $\pi$-holonomy twist by `PHI_INV`, Vogel golden-angle phyllotaxis  
**Timecode:** `00:29.000 – 00:37.000`  
**Frames:** `1740 – 2219` (480 frames)

### 1. Visual Composition, Camera & Palette

The vorticity ribbon from Scene 4 curls — and keeps curling — into a **Bernoulli golden spiral** mantle: a shell-like logarithmic surface rotating with constant angle between radius and tangent. Riding the spiral, a holonomy gauge accumulates twist; each full turn, the frame has rotated by a $\pi$-scaled golden-ratio increment.

The mantle then blooms open into a **phyllotaxis fan**: hundreds of seeds placed by Vogel's model, golden-angle whorls resolving into visible parastichy spirals — clockwise and counter-clockwise families counted on screen.

Camera: begins inside the spiral looking out, spirals outward with the curve itself, then rises to a top-down flattening for the phyllotaxis count.

| Element | Hex |
|---|---|
| Background | `#0B0A06` |
| Golden spiral mantle | `#F5C542` |
| Holonomy gauge arc | `#FF5A6E` |
| Seeds (young → mature) | `#34E89E` → `#F5C542` |
| Parastichy family A (cw) | `#22D3EE` |
| Parastichy family B (ccw) | `#FF5A6E` |
| Golden angle marker | `#F4F7FF` |

### 2. Equations & Kinetic Typography

The Bernoulli spiral, with its growth factor solved on screen:

$$
r \;=\; a\, e^{\,b\theta}, \qquad b \;=\; \frac{\ln \varphi}{\pi/2} \;\approx\; 0.30635
$$

The Hofstadter holonomy twist:

$$
\Delta\psi \;=\; \pi \cdot \texttt{PHI\_INV}, \qquad \texttt{PHI\_INV} \;=\; \frac{\sqrt{5}-1}{2} \;\approx\; 0.6180339887
$$

Vogel's model assembles as the first seeds land:

$$
r_n \;=\; c\sqrt{n}, \qquad \theta_n \;=\; n \cdot 137.5077640^{\circ}
$$

Callouts:

- `self-similar at every scale` — the camera zooms one full turn; the spiral is unchanged in shape.
- `holonomy: the frame remembers the loop` — the gauge arc fills as the transported frame returns rotated.
- `golden angle` — the divergence angle sweeps and locks at `137.5077640°`.
- Parastichy counts count up on screen: `13 / 21`, then `21 / 34` — consecutive Fibonacci pairs, stamped as they become visible.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 1740 | Ribbon → spiral morph | 0.0 → 1.0 | 120 frames, master ease |
| 1820 | Spiral turns drawn | 0 → 3.5 turns | Linear in $\theta$ |
| 1940 | Holonomy twist `Δψ` | 0 → $\pi\cdot\varphi^{-1}$ | Gauge fills with transported frame |
| 2020 | Mantle → fan bloom | 0.0 → 1.0 | Seeds emit from center |
| 2100 | Seed count | 0 → 500 | Vogel placement, 1 seed / frame burst then settle |
| 2160 | Parastichy highlight | Families A/B isolate | Counts `21 / 34` stamp in |
| 2219 | Fan rotation | 0.05 rev/s | Slow, breathing; Act II closes |

### 4. Audio & Rhythmic Cues

- Spiral growth: a warm analog pad swelling one partial per quarter-turn.
- Holonomy landing: a Hofstadterian recursive motif — a melody that quotes its own first three notes transposed, then again, smaller.
- Each seed placement is a soft wooden tick; 500 ticks accelerate into a rain-like texture, then thin to the golden-angle lock tone.
- Parastichy counts land on bar lines with muted piano.

---

# ACT III — HIGHER-ORDER FRACTALS, CATASTROPHE CAUSTICS & STRANGE-LOOP QUINES

## Scene 6 — `recursive-julia` / Quaternion Julia & Milnor Distance Estimator

**Mathematics:** Quaternion / bicomplex iteration, Douady–Hubbard potential $G_c(z)$, Milnor distance estimator  
**Timecode:** `00:37.000 – 00:44.000`  
**Frames:** `2220 – 2639` (420 frames)

### 1. Visual Composition, Camera & Palette

A 3D quaternion Julia set rendered as a **relief landscape** — not a raymarched blob floating in space, but terrain: the Milnor distance estimator becomes elevation. Ridges where escape is slow, valleys where it is fast. The camera flies low over the relief as the constant $c$ migrates through parameter space and the terrain reorganizes — connected, then dust, then connected again.

A bicomplex slice panel floats at frame right, showing the 2D Julia set of the current slice, updating in sync with the terrain.

| Element | Hex |
|---|---|
| Background | `#08060F` |
| Relief — bound core | `#8B7CFF` |
| Relief — slow escape ridges | `#F5C542` |
| Relief — fast escape valleys | `#0B1020` → `#164E63` |
| Douady–Hubbard potential contours | `#22D3EE` |
| Parameter path `c(t)` | `#FF5A6E` |
| Slice panel | `#0B1020` / `#F4F7FF` |

### 2. Equations & Kinetic Typography

The iteration, typed as the first orbit escapes:

$$
z_{n+1} \;=\; z_n^{\,2} + c, \qquad z \in \mathbb{H}\ \text{(quaternion)},\;\; c \in \mathbb{C}
$$

The Douady–Hubbard potential builds beside the contour lines it describes:

$$
G_c(z) \;=\; \lim_{n\to\infty} \frac{1}{2^n} \log^+ \bigl|z_n\bigr|
$$

The Milnor distance estimator — the equation that *is* the terrain:

$$
d(z) \;\approx\; \frac{|z_n|\,\log|z_n|}{|z_n'|}, \qquad z_{n+1}' = 2 z_n z_n' + \delta
$$

Callouts:

- `escape time → elevation` — a legend maps iteration count to relief height.
- `connected ↔ Cantor dust` — stamps at the two topological phase changes as `c(t)` crosses the Mandelbrot boundary inset at lower left.
- `the derivative remembers the orbit` — `$z_n'$` highlights as ridge lines sharpen.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 2220 | Relief render | Fade in from contour field | 40 frames |
| 2300 | `c(t)` path | Begins in connected region | Coral dot traverses inset |
| 2400 | Max iterations | 64 → 128 | Ridges sharpen live |
| 2480 | Topological event 1 | Connected → dust | Terrain fractures; 8-frame silence |
| 2560 | Topological event 2 | Dust → connected | Terrain re-knits |
| 2600 | Camera altitude | Low → survey height | Pull-back begins |
| 2639 | `tiltY` | −20° | Relief handed to Scene 7 as “terrain with folds” |

### 4. Audio & Rhythmic Cues

- Terrain flight: granular synthesis, grain density mapped to local escape-time variance.
- Ridge crossings produce soft tonal pings on a whole-tone scale — pleasant, slightly unmoored.
- The dust fracture at frame 2480: all pitched sound cuts for 8 frames; only the sub pulse remains.
- Re-knitting: the whole-tone pings return, now resolving toward the tonic.

---

## Scene 7 — `recursive-affine` / IFS Charts & Whitney Catastrophe Caustics

**Mathematics:** Contractive iterated function systems, Whitney $A_2$ fold and $A_3$ cusp catastrophes, caustic ridges  
**Timecode:** `00:44.000 – 00:51.000`  
**Frames:** `2640 – 3059` (420 frames)

### 1. Visual Composition, Camera & Palette

The Julia relief flattens into a stack of **affine branch charts** — translucent parallelograms that copy, contract, and re-place the whole image into itself, recursively. Each branch is labeled with its matrix. As recursion deepens, the self-similar canopy forms.

Then light is shone through the construction. Where the chart map folds, light concentrates into **caustic ridges**: a bright fold line ($A_2$) that sharpens, meets itself, and births a cusp point ($A_3$) — two fold arcs terminating in a single brilliant point. The camera pushes into the cusp until it fills the frame.

| Element | Hex |
|---|---|
| Background | `#07090F` |
| Branch charts | `#22D3EE` at 35% |
| Chart matrices / labels | `#F4F7FF` |
| Recursion depth tint | `#8B7CFF` |
| Fold caustic $A_2$ | `#F5C542` |
| Cusp caustic $A_3$ | `#FFFFFF` core, `#FF5A6E` halo |
| Contractivity meter | `#34E89E` |

### 2. Equations & Kinetic Typography

The IFS definition, one branch at a time as each chart lands:

$$
w_i(x) \;=\; A_i x + b_i, \qquad \|A_i\| < 1, \qquad \mathcal{A} \;=\; \bigcup_i w_i(\mathcal{A})
$$

The Whitney normal forms appear at the moment of their geometry:

$$
A_2\ \text{(fold):}\quad (x, y) \mapsto (x,\; y^2) \qquad\qquad A_3\ \text{(cusp):}\quad (x, y) \mapsto (x,\; y^3 + xy)
$$

Callouts:

- `every branch contracts` — the contractivity meter reads each `‖Aᵢ‖` as its chart lands; all values stamp `< 1` in green.
- `the attractor is its own image` — `𝒜 = ⋃ wᵢ(𝒜)` locks as the canopy closes.
- `fold` — labels the first caustic ridge.
- `cusp: two folds, one point` — labels the birth of the $A_3$ point; the label holds 60 frames.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 2640 | Branch charts | 1 → 4 placed | Each with matrix label |
| 2740 | Recursion depth | 1 → 6 | Canopy forms; depth counter visible |
| 2840 | Light-through-map | Off → on | Caustic field computes in |
| 2920 | Fold ridge $A_2$ | Appears, sharpens | 60-frame brighten |
| 3000 | Cusp birth $A_3$ | Two folds converge | White core ignites |
| 3030 | Camera push | Into cusp | 29-frame push, master ease |
| 3059 | Cusp intensity | 1.0 (peak) | White frame-edge bloom hands to Scene 8 |

### 4. Audio & Rhythmic Cues

- Each chart placement: a soft paper-like snap, pitched down a fourth per recursion depth — self-similarity you can hear descending.
- Caustic brightening: a slow crescendo of bowed vibraphone.
- Cusp birth: a single high sine partial sweeps up and locks at 4,186 Hz for 20 frames, then releases into the braid scene's rhythm.
- The 120 BPM pulse returns at frame 2840 after its Scene 6 thinning — structure reasserting itself.

---

## Scene 8 — `pleated-braid` & `WovenBody.strangeLoop` / Braid Group $B_3$ & the Ouroboros Quine

**Mathematics:** Artin braid group $B_3$, braid relations, KdV $\mathrm{sech}^2$ solitons; the quine loop `quote → run → apply`  
**Timecode:** `00:51.000 – 00:59.000`  
**Frames:** `3060 – 3539` (480 frames)

### 1. Visual Composition, Camera & Palette

Three strands descend from the cusp point and begin to **braid**. Each crossing is a generator: over-crossings glow gold, under-crossings sink into violet shadow. The braid pleats — folds of strand surface catch light like fabric.

Mid-scene, the braid's lower end curves up and **bites its own head**: the Ouroboros Quine Feedback Filament. Code travels around the loop — quoted, run, applied, re-quoted — visible as packets of mono type circulating the filament. Riding the filament, **three KdV soliton pulses** chase each other, passing through one another without losing shape.

This is the film's thesis shot. It is held longer than any other single composition.

| Element | Hex |
|---|---|
| Background | `#05070D` |
| Strand I | `#22D3EE` |
| Strand II | `#F5C542` |
| Strand III | `#FF5A6E` |
| Over-crossing highlight | `#FFFFFF` |
| Under-crossing shadow | `#3D348B` |
| Ouroboros filament | `#34E89E` |
| Code packets | `#F4F7FF` on `#0B1020` |
| KdV solitons | `#F5C542` core, `#FF5A6E` tail |

### 2. Equations & Kinetic Typography

The braid group presentation assembles as the first crossings form:

$$
B_3 \;=\; \bigl\langle \sigma_1, \sigma_2 \;\big|\; \sigma_1 \sigma_2 \sigma_1 \;=\; \sigma_2 \sigma_1 \sigma_2 \bigr\rangle
$$

At frame ~3300, the relation is *performed*: three crossings execute on the left of frame, three mirrored crossings on the right, and both sides resolve to the identical braid. A green check stamps: `relation holds`.

The strange loop, as circulating code:

```text
quote : Program → Data
run   : Data → Program
apply : Program → Program
```

$$
\text{strangeLoop} \;=\; \texttt{apply} \circ \texttt{run} \circ \texttt{quote}, \qquad \texttt{apply}(\texttt{run}(\texttt{quote}(p))) \;\equiv\; p
$$

The KdV soliton as each pulse ignites:

$$
u(x,t) \;=\; \frac{c}{2}\; \mathrm{sech}^{2}\!\left( \frac{\sqrt{c}}{2}\,(x - ct - x_0) \right)
$$

Callouts:

- `σ₁`, `σ₂` — labels pin to crossings as they occur.
- `the loop closes` — at filament bite; the code packet completes its first full circuit.
- `solitons pass through, unchanged` — after the first pulse collision, both pulses re-emerge with identical profiles; a before/after profile overlay proves it.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 3060 | Strand drop | 3 strands from cusp | Braiding begins |
| 3140 | Crossing rate | 1 crossing / 20 frames | `σ₁ σ₂ σ₁ …` sequence spells out |
| 3240 | Braid word | `σ₁σ₂σ₁ = σ₂σ₁σ₂` performed | Both sides resolve identically |
| 3320 | Filament closure | Open → closed loop | Ouroboros bite; packet circuit 1 begins |
| 3400 | Code packet speed | 1 circuit / 90 frames | `quote → run → apply` labels light in turn |
| 3440 | Soliton pulses | 3 pulses ignite | Speeds `c = 1.0, 1.6, 2.3` |
| 3500 | Soliton collision 1 | Pulses pass through | Profile overlay: `Δshape = 0` |
| 3539 | Loop state | Self-sustaining | Packet + solitons circulate unaided; Act III ends |

### 4. Audio & Rhythmic Cues

- Crossings: alternating high/low wooden blocks on beats — the braid is a rhythm instrument.
- The braid relation performance: left and right phrases are rhythmic mirror images; their identical resolution lands as a unison hit.
- Filament closure: the code clicks from Scene 1 return — same pitches, now circulating in stereo around the listener.
- Soliton collisions are *silent*. The pulses pass through each other and the mix passes through itself: no impact sound, because there is no impact. The absence is the point.
- A heartbeat sub-pulse synchronizes to the code packet's circuit from frame 3400 onward.

---

# ACT IV — SYMBIOGENESIS & CHIMERIC OFFSPRING

## Scene 9 — `compose` / Causal Seam Graft: Lorenz × Hopf

**Mathematics:** $C^2$ quintic smootherstep geodesic bridge $S_2(\tau) = 6\tau^5 - 15\tau^4 + 10\tau^3$  
**Timecode:** `00:59.000 – 01:06.000`  
**Frames:** `3540 – 3959` (420 frames)

### 1. Visual Composition, Camera & Palette

Split frame. Left: the Lorenz labyrinth ribbon from Scene 3, coral. Right: the Hopf torus nest from Scene 2, violet. Between them, a dark seam.

A bridge grows across the seam — a geodesic ribbon whose cross-section morphs continuously from Lorenz ribbon to Hopf fiber bundle. The morph is governed, visibly, by the smootherstep curve plotted in a lower-third graph: as $\tau$ sweeps $0 \to 1$, the bridge's left end is pure Lorenz, its right end pure Hopf, and the middle is a genuine hybrid — neither, and both.

The seam is **causal**: an arrow of time crosses it in one direction only. Attempts to cross backward, shown once as a ghost, dissolve.

| Element | Hex |
|---|---|
| Background | `#060812` |
| Lorenz side | `#FF5A6E` |
| Hopf side | `#8B7CFF` |
| Geodesic bridge | `#FF5A6E` → `#8B7CFF` continuous gradient |
| Seam line | `#F4F7FF` dashed |
| $S_2(\tau)$ graph | `#F5C542` curve on `#0B1020` |
| Causal arrow | `#34E89E` |
| Failed reverse ghost | `#FF3355` at 30% |

### 2. Equations & Kinetic Typography

The graft operator:

$$
\texttt{compose}(A, B) \;=\; \gamma(\tau), \qquad \gamma(0) = A,\;\; \gamma(1) = B
$$

The smootherstep, built term by term as the graph draws itself:

$$
S_2(\tau) \;=\; 6\tau^5 \;-\; 15\tau^4 \;+\; 10\tau^3, \qquad S_2(0)=0,\;\; S_2(1)=1,\;\; S_2'(0)=S_2'(1)=0,\;\; S_2''(0)=S_2''(1)=0
$$

The blend it drives:

$$
\gamma(\tau) \;=\; \bigl(1 - S_2(\tau)\bigr)\, A \;+\; S_2(\tau)\, B
$$

Callouts:

- `C² seam: no kink, no crease` — the derivative badges `S′=0`, `S″=0` stamp at both ends of the graph.
- `causal: one direction only` — as the green arrow crosses; the red reverse ghost dissolves at the seam.
- `the bridge is a geodesic` — the bridge ribbon pulses once along its length, minimizing-path shimmer.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 3540 | Split frame | Lorenz / Hopf established | Seam dashed line draws |
| 3620 | $\tau$ sweep | 0.0 → 1.0 begins | Graph curve draws in sync |
| 3700 | `blendWeight` | 0.50 at bridge center | Hybrid cross-section featured |
| 3780 | Causal arrow crossing | Left → right | 60 frames, green |
| 3840 | Reverse ghost attempt | Dissolves at seam | Red, 40 frames |
| 3900 | Bridge completion | `blendWeight` field continuous | Full graft held |
| 3959 | Camera | Pushes through bridge | Audience crosses the seam into Scene 10 |

### 4. Audio & Rhythmic Cues

- Left channel carries the Lorenz polyrhythm; right channel carries the Hopf glass harmonics.
- As $\tau$ sweeps, the mix crossfades with the *same* smootherstep curve — the audience hears $S_2(\tau)$, not a linear fade. A callout notes this.
- Causal arrow: a rising green-tone sweep. Reverse ghost: the same sweep backward, cutting to silence at the seam.
- Crossing into Scene 10 is scored as one continuous note bent from coral timbre to violet timbre.

---

## Scene 10 — `mate` & `symbiote` / Crossover and Cross-Modulation

**Mathematics:** Homologous crossover (Julia × Clifford), bidirectional attractor cross-modulation (Affine ↔ Braid)  
**Timecode:** `01:06.000 – 01:14.000`  
**Frames:** `3960 – 4439` (480 frames)

### 1. Visual Composition, Camera & Palette

Two offspring are born in sequence.

**First birth — `mate` (frames 3960–4199):** The quaternion Julia relief (Scene 6) and the Clifford vorticity sheet (Scene 4) align as homologous parents. Corresponding regions are highlighted in matching colors; segments exchange along a crossover seam. The child terrain carries Julia ridges whose valleys are Clifford flow lines — a relief that is also a field.

**Second birth — `symbiote` (frames 4200–4439):** The affine IFS canopy (Scene 7) and the pleated braid (Scene 8) face each other. Modulation signals pass both ways: braid crossing density drives IFS recursion depth; IFS contraction ratios drive braid pleat amplitude. Each system's parameter graph is drawn being *turned by the other's hand*.

Camera: locked-off symmetrical two-shots for both births — parentage must be readable at a glance.

| Element | Hex |
|---|---|
| Background | `#070A10` |
| Julia parent | `#8B7CFF` |
| Clifford parent | `#164E63` / `#22D3EE` |
| Homologous region markers | `#F4F7FF` paired |
| Child (mate) | `#8B7CFF` ridges + `#22D3EE` flow lines |
| Affine parent | `#22D3EE` |
| Braid parent | `#F5C542` |
| Modulation signal A→B | `#34E89E` |
| Modulation signal B→A | `#FF5A6E` |

### 2. Equations & Kinetic Typography

Crossover:

$$
\texttt{mate}(P_1, P_2) \;=\; P_1[0:k] \;\oplus\; P_2[k:n], \qquad \text{homology: } \chi(P_1) = \chi(P_2)
$$

Cross-modulation, as a coupled pair written simultaneously on opposite sides of frame:

$$
\frac{d\,(\text{depth}_{\text{IFS}})}{dt} \;=\; f\bigl(\text{crossing density}_{\text{braid}}\bigr), \qquad
\frac{d\,(\text{pleat}_{\text{braid}})}{dt} \;=\; g\bigl(\|A_i\|_{\text{IFS}}\bigr)
$$

Callouts:

- `homologous: same shape, different life` — paired region markers lock.
- `crossover point k` — the seam marker slides, then commits.
- `neither parent survives unchanged` — both parent panels dim to 40% as the child reaches full.
- `bidirectional: each turns the other's dial` — the two modulation arrows light alternately, then simultaneously.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 3960 | Parents align | Julia / Clifford two-shot | Homology markers pair up |
| 4040 | Crossover point `k` | Scans → commits at 0.55 | Seam marker locks |
| 4120 | Child `blendWeight` | 0 → 1 | Ridge/flow-line hybrid resolves |
| 4200 | Hard cut | `symbiote` two-shot | Affine / braid face-off |
| 4280 | Modulation A→B | Braid density → IFS depth | Depth counter climbs with crossings |
| 4340 | Modulation B→A | IFS `‖Aᵢ‖` → braid pleat | Pleat amplitude breathes |
| 4400 | Coupled state | Both arrows live | Feedback oscillation stabilizes |
| 4439 | Children held | Both offspring on screen | Split to four quadrants; Act IV ends |

### 4. Audio & Rhythmic Cues

- `mate`: the Julia whole-tone pings and Clifford glissandi interleave note-for-note, then fuse into a single melodic line at the crossover commit.
- `symbiote`: two LFO-like tonal swells, each audibly controlling the other's rate — the listener hears coupled modulation as mutual vibrato.
- Both births land their child-reveal on bar lines.
- Final quadrant split: four timbres, one chord.

---

# ACT V — LIVE PROGRAM EXECUTION COUPLING & FORMAL PROOF FINALE

## Scene 11 — `WovenBody.stepResponse` / Live CEK Execution States

**Mathematics:** CEK machine states, `stepResponse`, Lyapunov exponent, bifurcation shear  
**Timecode:** `01:14.000 – 01:22.000`  
**Frames:** `4440 – 4919` (480 frames)

### 1. Visual Composition, Camera & Palette

A live machine. The four offspring from Act IV occupy four quadrants, each with a CEK state readout: Control, Environment, Kontinuation. A `step` clock ticks; on each tick every quadrant executes one step and its body responds.

Three execution outcomes are staged in sequence across the quadrants:

- **Running** — a Gaussian territory soliton flares on the body's surface and its depth layers unfurl like a opening fan.
- **Done** — motion settles into crystalline harmonic phase-lock: every oscillation an exact integer ratio of every other, drawn as a frozen lattice of light.
- **Rejected / Exhausted** — a Lyapunov bifurcation shear: the body trembles, its layers slide against each other with exponentially growing offset, and the readout stamps the cause.

Camera: slow push-in across all three stagings, ending on the trembling Rejected body — the film's only sustained image of failure, held honestly.

| Element | Hex |
|---|---|
| Background | `#05070D` |
| CEK panel | `#0B1020`, text `#F4F7FF` |
| `Running` soliton flare | `#F5C542` Gaussian core, `#FF5A6E` skirt |
| Depth unfurl layers | `#22D3EE` at 20–60% stacked |
| `Done` phase-lock lattice | `#34E89E` |
| `Rejected` shear | `#FF3355` |
| `Exhausted` fuel gauge | `#FF5A6E` draining to `#FF3355` |
| Step clock | `#F4F7FF` |

### 2. Equations & Kinetic Typography

The CEK transition, typed once and then executed live beneath it:

$$
\langle C,\; E,\; K \rangle \;\xrightarrow{\;\texttt{step}\;}\; \langle C',\; E',\; K' \rangle
$$

The three outcomes, as they occur:

$$
\texttt{Running:}\quad \text{flare}(x) \;=\; I_0\, e^{-\frac{(x-\mu)^2}{2\sigma^2}}, \qquad \text{depth unfurl} \in [0, 1]
$$

$$
\texttt{Done:}\quad \frac{\omega_i}{\omega_j} \;\in\; \mathbb{Q}\ \ \forall\, i, j, \qquad \Delta\phi_{ij} \;=\; \text{const}
$$

$$
\texttt{Rejected:}\quad \lambda \;=\; \lim_{n\to\infty} \frac{1}{n} \sum_{k=0}^{n-1} \log \bigl| f'(x_k) \bigr| \;>\; 0
$$

Callouts:

- `one step, one response` — each CEK tick and its bodily flare are frame-locked.
- `phase-lock: every ratio rational` — the lattice freezes; a ratio table fills with exact fractions `1/1, 2/1, 3/2, 4/3`.
- `λ > 0: nearby futures diverge` — two near-identical trajectories separate exponentially on the trembling body.
- `EXHAUSTED: fuel = 0` / `REJECTED: invariant violated` — terminal stamps, red, no glitch effects. Failure is typeset, not sensationalized.

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 4440 | CEK panels | Live; `step` clock at 2 steps/s | Four quadrants executing |
| 4520 | `Running` soliton intensity | 0 → 1.0 Gaussian flare | `σ` narrows as `I₀` peaks |
| 4580 | Depth unfurl | 0.0 → 1.0 | Layers fan over 60 frames |
| 4660 | `Done` onset | Phase-lock engages | Ratios snap to rationals over 30 frames |
| 4720 | Phase-lock lattice | Fully frozen | Held 40 frames, near-silence |
| 4780 | `Rejected` onset | Shear tremor begins | Lyapunov `λ` readout climbs through 0 |
| 4840 | Fuel gauge | Drains to 0 | `EXHAUSTED` stamps |
| 4880 | Shear amplitude | Exponential growth, clamped for legibility | On-screen note: `amplitude clamped ×0.1` |
| 4919 | Hold on Rejected body | Tremor continues | Hard cut to black for Scene 12 |

### 4. Audio & Rhythmic Cues

- Each CEK step is the Scene 1 code click, now at machine tempo; each quadrant has its own pitch.
- `Running`: each flare is a warm bloom of filtered noise + sine swell.
- `Done`: all pitches converge to a just-intoned chord — the rational ratios are *heard* as consonance. Percussion stops. This is the quietest moment in the film.
- `Rejected`: the chord detunes. Slowly at first, then with the same exponential curve as the shear — pitch divergence sonifies $\lambda > 0$.
- `EXHAUSTED`: fuel ticks accelerate and stop mid-tick. Silence. Cut to black.

---

## Scene 12 — Formal Verification Finale / Quint & Lean 4

**Mathematics:** Quint state-machine model checking; Lean 4 theorem proving  
**Timecode:** `01:22.000 – 01:30.000`  
**Frames:** `4920 – 5399` (480 frames)

### 1. Visual Composition, Camera & Palette

Black. Then, from the darkness, every body from the film returns — not as a montage, but as **states in one machine**. The twelve scenes' geometries arrange themselves into a state-transition diagram: nodes of living geometry, edges of proven transitions.

Two verification panels rise. Left: the **Quint** model checker, running traces — hundreds of faint paths threading the state diagram, every one terminating in green. Right: the **Lean 4** proof state, theorems checking in one by one, each closing with `∎`, a counter climbing to its final number.

In the final 90 frames, the state diagram folds — literally, along its own edges — back into the Ouroboros filament of Scene 8. The loop closes around the verified whole. The seed point from frame 0 appears at its center. Hold. End.

Camera: locked-off for the verification counts — proof does not need camera movement — then one slow pull-back as the manifold folds into the loop.

| Element | Hex |
|---|---|
| Background | `#05070D` |
| State nodes | Each scene's signature color, at 80% |
| Transition edges | `#F4F7FF` at 40% |
| Quint traces | `#22D3EE` faint → `#34E89E` on pass |
| Violation indicator | `#FF3355` — **never lights; its unlit state is shown and labeled** |
| Lean panel | `#0B1020`, text `#F4F7FF`, `∎` in `#F5C542` |
| Counters (final values) | `#F4F7FF` tabular; totals stamp `#34E89E` |
| Ouroboros return | `#34E89E` |

### 2. Equations & Kinetic Typography

The Quint invariants, stated before the traces run:

```quint
val invariants = List(
  "territoryPartitionsAreDisjoint",
  "territoryCoversUnitInterval",
  "strangeLoopIsIdentity",
  "composeIsCausal",
  "noStepFromDone",
  "noStepFromRejected"
)
```

The verification result, building line by line — never pre-shown:

```text
Quint   : 9 / 9 tests passed
Traces  : 250 explored
Violations: 0
```

The Lean finale:

```lean
-- 275 exported QDL theorems
-- 0 sorry
theorem ouroboros_verified : Verified WovenBody := by
  exact ⟨territory_partition, strange_loop_identity, causal_compose⟩
```

$$
\boxed{\;\forall\, p \in \texttt{WovenBody}:\quad \texttt{verified}(p) \;\wedge\; \texttt{strangeLoop}(p) \equiv p\;}
$$

Callouts:

- `every trace terminates in green` — as the 250th trace completes.
- `this indicator never lit` — an arrow points to the dark violations lamp. **Held 45 frames.** The absence of red is the loudest claim in the film and is given time to land.
- `0 sorry` — the final Lean line. A `sorry` counter is shown explicitly at `0`, because in Lean an unproven assumption is exactly what `sorry` would hide.
- Final title, assembling letter by letter over the closed loop:

```text
THE OUROBOROS MANIFOLD
When Programs Become Living Geometry
```

### 3. Parameter Keyframes

| Frame | Parameter | Value | Note |
|---:|---|---|---|
| 4920 | State diagram | Assembles from black | 12 nodes, one per scene |
| 5000 | Quint traces | Begin; counter 0 → 250 | ~2 traces/frame, easing to completion |
| 5080 | Trace counter | `250 / 250` | All paths green |
| 5120 | Tests readout | `9 / 9` stamps | One stamp per test, 6 frames apart |
| 5160 | Violations readout | `0` stamps; lamp shown unlit | 45-frame hold begins |
| 5200 | Lean theorem counter | Climbs → `275` | Accelerating check-ins, tabular figures |
| 5260 | `sorry` counter | `0` stamps | Gold `∎` cascade |
| 5300 | Manifold fold | Diagram → Ouroboros filament | 60 frames, master ease |
| 5360 | Seed point | Reappears at loop center | Matches frame 0's seed exactly |
| 5399 | Final frame | Closed loop, title complete | Hold to cut |

### 4. Audio & Rhythmic Cues

- Trace runs: a soft rain of clicks — the Scene 1 code sound, now hundreds deep — thinning as traces complete.
- Each of the 9 test stamps: one low brass note, ascending a major scale. The ninth resolves to the tonic an octave up.
- The unlit violations lamp's 45-frame hold: **total silence except the 55 Hz sub**. The audience is meant to notice nothing happening.
- Lean check-ins: choir pad enters, one voice per 50 theorems.
- At the fold (frame 5300), every musical theme from the film sounds simultaneously for exactly one bar — Hopf harmonics, Lorenz polyrhythm, braid blocks, the Done chord — in the phase-lock ratios of Scene 11. Then all but the sub drop out.
- Final frame: one heartbeat. Cut to black on its decay, not its attack.

---

# MASTER KEYFRAME & STATE TABLE

| Scene | Program(s) | Frames | $t$ (s) | Phase Vel. | tiltX / tiltY | Blend / Morph | Execution / Soliton | Signature Event |
|---:|---|---|---|---|---|---|---|---|
| 1 | `constructor` | 0–479 | 0–8 | — | 0° / 0° | Coverage 0→1 | — | Partition locks; `∎` |
| 2 | `toroidal-weave` | 480–899 | 8–15 | 0.15→0.30 rev/s | 18° / −12° | Projection 0→1 | — | $Lk = +1$, then $−1$ |
| 3 | `lorenz-flow` | 900–1319 | 15–22 | Flow ×1.0→×1.4 | 24° / 0° | Ribbon 0→1 | — | Torsion pinned `0.000` |
| 4 | `clifford-flow` | 1320–1739 | 22–29 | — | 0° / 15° | Sheet→ribbon 0.85 | — | First fold `det(DF)=0` |
| 5 | `logarithmic-mantle`, `phyllotaxis-fan` | 1740–2219 | 29–37 | 0.05 rev/s | Top-down | Mantle→fan 0→1 | — | Parastichy `21 / 34` |
| 6 | `recursive-julia` | 2220–2639 | 37–44 | — | 0° / −20° | Relief fade-in | — | Connected → dust → connected |
| 7 | `recursive-affine` | 2640–3059 | 44–51 | — | Push-in | Depth 1→6 | — | $A_3$ cusp ignites |
| 8 | `pleated-braid`, `strangeLoop` | 3060–3539 | 51–59 | Packet 1 circuit/90 f | 12° / 0° | Loop open→closed | 3 solitons, `c = 1.0/1.6/2.3` | Braid relation performed; loop bites |
| 9 | `compose` | 3540–3959 | 59–66 | — | Through-bridge | $S_2(\tau)$: 0→1 | — | Causal arrow crosses; reverse dissolves |
| 10 | `mate`, `symbiote` | 3960–4439 | 66–74 | — | Locked two-shots | Child 0→1; coupled | — | Crossover at `k = 0.55`; mutual modulation |
| 11 | `stepResponse` | 4440–4919 | 74–82 | Step clock 2/s | Push-in | Unfurl 0→1 | Flare 0→1; shear grows | `Done` phase-lock; `λ > 0` rejection |
| 12 | Verification | 4920–5399 | 82–90 | — | Locked → pull-back | Diagram→loop | — | `9/9`, `250`, `0`, `275`, `0 sorry` |

---

# END CARD SPECIFICATION

| Frame | Content |
|---:|---|
| 5360–5399 | Closed Ouroboros filament, seed point at center, title complete. No credits scroll. |
| 5399 | Final frame held to hard cut. Audio decays naturally past picture cut by 12 frames. |

**Post-film slate (not counted in the 5,400 frames):** a single static card, Proof White `#F4F7FF` on Void `#05070D`:

```text
QUINELINGS 2.0 — THE OUROBOROS MANIFOLD
Quint: 9/9 tests · 250 traces · 0 violations
Lean 4: 275 theorems · 0 sorry
quote → run → apply
```

---

> **Closing directorial note:** The film's argument is its structure. Act I partitions; Act II differentiates; Act III recurses and closes the loop; Act IV breeds; Act V executes and proves. Every visual event is a mathematical event, every sound is a parameter, and the final silence — a violations lamp that never lights — is the thesis: a program that can prove itself no longer needs to be believed.
