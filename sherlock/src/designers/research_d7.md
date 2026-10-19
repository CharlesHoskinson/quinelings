# Designer 7 Research Synthesis: Apple Hardware Keynote Cinematography, Whisper-Subtle GLSL & Spatial Focus Reticle

## 1. Sources & References Investigated (`search_web` + `scrapling`)
- **Apple Human Interface Guidelines — Spatial Layout, Materials & Eyes (`visionOS`)**:
  - `https://developer.apple.com/design/human-interface-guidelines/eyes.md`
  - `https://developer.apple.com/design/human-interface-guidelines/materials.md`
  - `https://developer.apple.com/design/human-interface-guidelines/spatial-layout.md`
- **Schlick's Fresnel Approximation & Studio Rim Lighting**:
  - `https://en.wikipedia.org/wiki/Schlick%27s_approximation` (`R(θ) = R0 + (1 - R0)(1 - cos θ)^p`)
- **Dieter Rams Functionalist Restraint ("Less, but better")**:
  - `https://en.wikipedia.org/wiki/Dieter_Rams`

---

## 2. Borrowed Cinematography & Shader Principles Applied to `designer7_cinema.js`

### A. Whisper-Subtle GLSL Fresnel Containment & Directional Wave
In Apple Silicon hardware reveal films (M3/M4/R1 architecture breakdowns), internal cross-sections and deep silicon wells are never obscured by heavy wireframe grids or opaque sci-fi forcefields. Instead:
- **Soft Grazing-Angle Fresnel (`pow(1.0 - abs(dot(N, V)), 2.35)`)**: The center of the recursion well remains crystal-clear (`uOpacity` peak clamped to `0.14..0.22`, center transparency near `0.02`) so **Designer 3's Continuation Wafers, `[ ? ]` waiting holes, and glowing Unwind Value Orb** are 100% crisp and unobstructed from every camera angle.
- **No Concentric Vernier / Azimuthal Grid Clutter**: Removed all 64-tick vernier rings, 96-ring horizontal stripes, and 8-column lattice bars from the well shader.
- **Directional Recursion Wave**: A single, silky-smooth vertical light-wave travels **downward during `DESCEND` (`Push frame` / `Eval`)** and **upward during `RESOLVE` / `RETURN`**, reinforcing the direction of stack descent and value fold-up without visual noise.
- **Near-Camera Proximity Fade (`nearCameraFade`)**: Smoothly fades the well containment shader when the camera dives directly inside the hollow 3D recursion chamber so the lens never passes through a fog curtain.
- **Razor-Thin Hairline Aperture Ring (`width = 0.025`)**: Replaced the busy dual-ring 72-via data-bus shader (`width = 0.08` + `0.115`) with a single precision-machined `0.025`-wide hairline light ring around the aperture (`r = 1.075..1.100`) that softly breathes with `stepFraction` and active phase color.

### B. Apple Keynote Camera Choreography & Hollow-Chamber Immersion (`CAMERA_PRESETS`)
Camera lenses are tuned around comfortable field-of-view framing, unobstructed cross-sectional sightlines, and **immersive diving inside the hollow 3D recursion chamber**:
- **`overview` (`pos: [0.0, 4.45, 4.55], lookAt: [0, -0.05, -0.05]`)**: Balanced studio hero shot framing the entire monolithic die, call-tree arc above the aperture, and recursion well.
- **`well` (`pos: [0.0, 2.25, 0.78], lookAt: [0, -1.28, 0]`)**: Poised right at the aperture lip, diving straight down the hollow 3D recursion chamber to watch Continuation Wafers descend toward the 39-rule `sherlock-k-a/1` floor and unwind orbs ascend.
- **`interior` (`pos: [0.66, -0.28, 0.68], lookAt: [0, -1.15, 0]`)**: **Inside the Hollow Chip!** Physically places the camera inside the hollow central recursion chamber (`r ≈ 0.94`, below the aperture rim) right amidst the suspended Continuation Wafers, vertical `[ ? ]` light-threads, Unwind Result Orb, and illuminated inner TSV walls.
- **`frames` (`pos: [1.55, 1.68, 2.38], lookAt: [0, -0.32, 0]`)**: A crystal-clear **35° oblique cross-section** that simultaneously captures the **Live Call-Tree Arc** floating above the aperture (`y ∈ [0.28, 1.15]`) AND the **Continuation Wafer Stack + Unwind Result Orb** suspended inside the recursion well (`y ∈ [-1.85, 0.20]`).
- **`arena` (`pos: [-1.85, 1.78, 2.78], lookAt: [0, 0.56, 0]`)**: Eye-level studio shot focused on the Live Recursion Call-Tree Arc & Semantic Value Arena above the aperture.
- **`circuit` (`pos: [0.0, 5.25, 0.72], lookAt: [0, 0.10, 0]`)**: High plan view of the 4 flush L4 quadrants (`ProgramBlock`, `StateBlock`, `aux/1`, `aux/2`).
- **`aux2` (`pos: [2.15, 2.05, 2.25], lookAt: [1.48, 0.12, 1.05]`)**: Dedicated macro lens on the SE quadrant 16-byte UInt128 ALU & FuelWitness array.
- **`loom` (`pos: [-1.65, 2.12, 2.95], lookAt: [0, 0.52, -1.55]`)**: Clean view of the rear `ReferenceSlice` (1/2/4/8) & IVC Proof-History Composition Loom.
- **`cinema` (`pos: [2.95, 3.15, 3.45], lookAt: [0, -0.10, -0.05]`)**: Slow, damped keynote orbital sweep that gently tracks vertical recursion depth.
- **Hollow-Chamber Zoom Dive & Anti-Clip Guard (`MIN_ORBIT_DISTANCE = 0.65`, `camera.near = 0.04`)**: Scroll-zooming inside the central aperture (`desiredRadius < 2.1`) smoothly lowers the lookAt target into the hollow chamber (`y -> -1.08`) while clamping horizontal wall-clipping (`r <= 0.88` when `y < 0.16`), letting the user fly effortlessly inside the 3D hollow chip.

### C. Minimalist `visionOS`-Style 3D Focus Reticle
Inspired by Apple `visionOS` gaze/hover highlights (`eyes.md`):
- **Ultra-Clean Champagne-Gold Corner Hairlines**: Removed the noisy 12-edge inner wireframe bounding cage and spinning octahedron beacon.
- **Precision Corner Brackets Only**: Renders 8 delicate corner hairlines (`PALETTE.goldBright` on hover, `PALETTE.heatBright` when pinned) with smooth exponential spring damping (`exp(-20 * dt)`) and micro-breathing, framing any Continuation Wafer, Call-Tree node, or Rule Tile cleanly without obscuring its typography or geometry.
