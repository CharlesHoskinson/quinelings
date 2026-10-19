# Gemini Fluidity Agent 1: Slideshow & Motion Canvas Zero-Shake Camera & 60fps Fluidity Architecture

## 1. Forensic Root-Cause Analysis of Camera Shake & Frame Spikes in `slideshow.html`

### 1.1 Per-Frame Extrema Recomputation Coupling Wave Motion into Camera Transform
In `/home/charles/sherlock-bench/slideshow.html`, `renderSingleSpecimen` computed the bounding box directly from the live point cloud on every frame:
- **Boundary Wave Coupling**: Every mechanism in `woven-body.js` displaces surface points with phase-dependent traveling waves. As wave crests reach the outer silhouette, `minX`, `maxX`, `minY`, and `maxY` oscillate non-uniformly.
- **Global Origin & Zoom Modulation**: Because every vertex was normalized via `nx = (x - midX) / span` and `ny = (y - midY) / span`, any `±0.015` shift in a single extremal boundary point translated the entire 6,144-point organism in the opposite direction and rescaled the global zoom factor `1 / span`.
- **Un-Centered Z Pivot**: `const nz = f.points[b + 2] * 0.65` ignored `cz` and `span`, causing 3D tilt to pivot off-center.

### 1.2 Synchronous Per-Frame Caustic Root-Finding & TypedArray Churn
- Passing no `reuse` object set `const fast = Boolean(reuse)` to `false`, triggering `480 x 20 x 5` bisections in `caustics()` and `97 x 48 x 10` in `solveDepthRoots()`, costing **18–25ms/frame** (and **50–70ms/frame** on the 3-column comparison slide).
- **Fix**: Implement `SlidePhaseRing` (36 pre-baked canonical phase buckets per slide computed lazily on first view using `{ reuse }` fast-path caustics). At runtime, evaluate fractional bucket index `f = (normPhase / TAU) * N`, quintic smoothstep `t = smoothstep5(f - floor(f))`, and blend `bucket0` and `bucket1` in `< 0.7ms/frame` with zero GC allocations.

### 1.3 Frame-Rate Independent Exponential Smoothing (`DampedState`)
Every interactive parameter is governed by:
$$y(t + \Delta t) = y(t) + \bigl(y_{\text{target}} - y(t)\bigr)\bigl(1 - e^{-\lambda \Delta t}\bigr)$$
- `tiltX, tiltY`: $\lambda = 12.0\,\text{s}^{-1}$
- `ownerWeights[0..7]`: $\lambda = 7.5\,\text{s}^{-1}$
- `recursionDepth`: $\lambda = 6.0\,\text{s}^{-1}$
- `doneWeight, faultWeight, exhaustedWeight, fuelRatio`: $\lambda = 5.0\,\text{s}^{-1}$
