# Gemini Debugging & Fuzzing Agent 3: Quint Formal Verification of the Animation Pipeline (`spec/animation-pipeline.qnt`)

## 1. Executive Summary

Both `/home/charles/sherlock-bench/slideshow.html` and `/home/charles/sherlock-bench/motion.html` suffered a startup failure in which the `<canvas>` remained stuck at its HTML5 default dimensions (`300×150`) with `0` rendered pixels (`visiblePixels == 0`) and an inactive `requestAnimationFrame` loop (`frameRateLocked == false`).

By formalizing the browser animation startup and frame-rendering lifecycle in Quint (`/home/charles/repos/quinelings/spec/animation-pipeline.qnt`), we prove both directions of the failure and its fix:

1. **Counterexample Discovery (`detects_window_opcode_crashTest` & `--invariant=animationSafety`)**:
   - The 6 canonical task graphs in `slideshow.html` and `motion.html` used `op: 'window'` in `GRAPHS.tideglass` node `s2`.
   - `WovenBody.author` and `WovenBody.compile` do not validate `node.op` against `Chroma.ROLE_MAP`, allowing `CompileBodies` to succeed for all 8 canonical mechanisms.
   - Immediately afterward, top-level module evaluation executes `BuildChromaPalettes` (`Chroma.colorFor` -> `Chroma.role(node.op)`).
   - Because `"window"` is absent from the 41-entry `Chroma.ROLE_MAP` (`UnpatchedChromaRoleMap`), `Chroma.role("window")` throws `Error: Unknown chroma operation window` at the 6th specimen (`mantle` / `GRAPHS.tideglass`).
   - Because `resizeCanvas()` / `resize()`, phase-ring warming, and `requestAnimationFrame` were located **after** `BuildChromaPalettes` in the top-level `<script type="module">`, the unhandled exception aborts module evaluation in state `CrashedBeforeResize`, leaving `canvasWidth == 300`, `canvasHeight == 150`, `visiblePixels == 0`, and `frameRateLocked == false`.

2. **Safety Proof Across All 12 Slides and All 12 Motion Scenes**:
   - When `WovenGraphOps.subseteq(ChromaRoleMap)` and `canvasResized` hold, the pipeline transitions deterministically through:
     `Init -> CompileBodies -> BuildChromaPalettes -> ResizeCanvas -> WarmPhaseRing -> RenderFrame(scene, phase, execution)`
   - Quint proves that `animationSafety` and `frameRenderSafety` (`pipelineState != "CrashedBeforeResize" and pipelineState != "Crashed" and visiblePixels > 0 and frameRateLocked`) hold across all **12 slideshow plates** (`1..12`), all **12 motion studio scenes** (`1..12`), all **36 phase-ring buckets** (`0..35`), and all **4 CEK execution outcomes** (`Running`, `Done`, `Rejected`, `Exhausted`).
