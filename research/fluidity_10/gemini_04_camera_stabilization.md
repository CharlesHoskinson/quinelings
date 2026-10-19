# Gemini Fluidity Agent 4: Three.js Cinema Camera Stabilization & Zero-Shake Choreography Audit

**Agent**: Gemini Fluidity Agent 4 (`132b58ab-b94d-49ab-9b31-3d8a4dc4c267`)

---

## Executive Summary

To make the 3D Sherlock camera glide on silk rails with zero shake across 60/120/144Hz displays, every camera state variable—**position, target (`lookAt`), field of view (`fov`), parabolic transition arc lift, and orbital/gimbal velocity**—must be governed by **frame-rate-independent exponential smoothing** (`1 - Math.exp(-dt * lambda)`) with `dt` strictly clamped to `[0.001, 0.05]`, and completely decoupled from discrete CEK execution step transitions.

Our line-by-line audit of `designer7_cinema.js` and `SherlockStage.js` identified **11 concrete sources of camera shake, micro-jitter, and un-damped step discontinuities** during playback, preset transitions, and pointer gestures:

1. **Playback-Coupled Camera Shake in `'cinema'` Preset (`designer7_cinema.js` L1435–1446)**:
   - `desiredRadius` coupled discrete execution progress (`Math.cos(ambient * 0.20 + progress * Math.PI) * 0.38`), causing per-step radius jumps during playback and a **0.76-unit snap** whenever playback loops (`progress: 1.0 → 0.0`).
   - `desiredTarget.y` oscillated between `-0.26`, `-0.16`, and `-0.10` on every CEK step transition using a non-exponential linear `lerp(..., dt * 1.6)`.
2. **`dt` Clamping & `update(stepState, ambient, dt)` Signature (`designer7_cinema.js` L1350–1352, L985)**:
   - Clamped `dt` to `[0.001, 0.05]` in both `update(stepState, ambient, dt)` and per-pointer `dtMove`.
3. **Non-Exponential Smoothing & `resetCamera()` Instantaneous Vertical Jump**:
   - Replaced `transitionArcBoost` frame-1 jump with an exponentially decayed, $C^2$-smooth parabolic transition arc `4 * p * (1 - p)` starting at `p = 1.0` (`lift = 0.0`).
4. **Smooth $C^1$ Polar Limit & Pre-Smoothing Well Wall Constraint**:
   - Replaced the post-smoothing boolean wall clamp and binary `getMaxPhiForState` jump with smooth `smoothstep01` blends applied to `desiredRadius` and `desiredPhi` before exponential damping.
5. **Exponentially Damped Chamber Lighting (`SherlockStage.js`)**:
   - Applied `1 - Math.exp(-10.0 * dt)` smoothing to `wellPointLight`, `vaultUpperLight`, and `vaultFloorLight`.
