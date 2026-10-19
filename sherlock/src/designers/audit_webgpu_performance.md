# Three.js WebGPU (`three/webgpu`) & Scene Performance Architecture Audit

## 1. Three.js `WebGPURenderer` & TSL Best Practices

### 1.1 Asynchronous Device Initialization & Headless Fallback
Unlike legacy `WebGLRenderer`, which synchronously acquires a WebGL context in the constructor, `THREE.WebGPURenderer` (`three/webgpu`) negotiates `GPUAdapter` and `GPUDevice` handles asynchronously via `await renderer.init()`.
- **Explicit Readiness Gate (`this.ready`)**: When driving rendering on-demand or from an external `requestAnimationFrame` controller (`SherlockStage.render(stepState)`), `renderer.render(scene, camera)` must only execute after `await this.renderer.init()` resolves (`this.ready = true`).
- **Decoupled Subsystem State Updates**: Even before `this.ready` becomes `true` (or in headless Node test environments where `navigator.gpu` is absent), all 7 designer subsystems (`sub.update(fullState)`) must still execute deterministically so scene graph transforms, instanced buffers, and inspection metadata stay synchronized.
- **Graceful Headless / WebGL 2 Fallback**: Wrapping `await this.renderer.init()` in a `try / catch` block ensures that if WebGPU initialization fails in a headless runner without a GPU adapter or WebGL2 context, `SherlockStage` degrades gracefully without throwing unhandled promise rejections.

### 1.2 Node Materials (`MeshStandardNodeMaterial` / `MeshPhysicalNodeMaterial`) & Pipeline Caching
- **Unified `three/webgpu` Imports**: Importing from `'three/webgpu'` exposes `WebGPURenderer`, `MeshStandardNodeMaterial`, `MeshPhysicalNodeMaterial`, and standard Three.js classes (`MeshStandardMaterial`, `MeshPhysicalMaterial`, `InstancedMesh`, etc.) which `WebGPURenderer` automatically maps to its WGSL/GLSL node material compiler.
- **No Legacy `ShaderMaterial` / `RawShaderMaterial` or `onBeforeCompile`**: WebGPU compiles immutable `GPURenderPipeline` objects keyed by shader graph structure and render state. Legacy GLSL string injection breaks pipeline caching and fails under WGSL backends. Composable TSL nodes (`colorNode`, `emissiveNode`, `roughnessNode`) or standard PBR material properties (`color`, `emissive`, `emissiveIntensity`, `transmission`, `ior`) preserve pipeline reuse.

### 1.3 Zero Per-Frame Texture Uploads (`createPlaqueTexture` LRU Cache)
- **The Problem**: Creating a new `<canvas>` element and instantiating `new THREE.CanvasTexture(canvas)` inside `.update(stepState)` triggers a full 2D rasterization pass on the CPU plus a synchronous `queue.writeTexture` / `texImage2D` upload to GPU VRAM on every step or frame.
- **The Solution**: `createPlaqueTexture(options)` in `src/designers/theme.js` now computes a deterministic composite string key covering all visual parameters:
  `title | subtitle | badge | accent/accentHex | bg/bgHex | fg/textHex | muted | width | height | border`
  and stores textures in a bounded LRU `Map` (`MAX_PLAQUE_CACHE_SIZE = 512`). Repeated requests for the same step plaque, frame badge, rule label, or slice badge return the **exact cached `THREE.CanvasTexture` instance** in $O(1)$ time with zero DOM or GPU allocations.

### 1.4 Zero-Allocation `.update(stepState)` Loops
- **Heap Allocation Hazards**: Instantiating `new THREE.Color()`, `new THREE.Vector3()`, `new THREE.Matrix4()`, or cloning state objects via `{ ...stepState }` at 60–120 Hz creates garbage collection pressure and frame-time spikes.
- **Pre-Allocated Scratch Objects**:
  - `src/designers/theme.js` exports shared module-scope scratch objects (`SCRATCH_COLOR`, `SCRATCH_VEC3`, `SCRATCH_MAT4`, `SCRATCH_QUAT`, `SCRATCH_EULER`) alongside helper functions (`easeInOutCubic`, `createBrushedMetalTexture`, `createReticleTexture`).
  - `src/stage/SherlockStage.js` pre-allocates `this._scratchColor` and reuses a persistent `this._fullState` envelope in `render(stepState)` so zero heap objects are allocated per frame.

### 1.5 `THREE.InstancedMesh` Batching
- While WebGPU reduces CPU driver validation overhead per draw call compared to WebGL, render bundle / draw call count remains critical when rendering hundreds of micro-components (ROM expression pads, 39-rule decoder tiles, 6-ring horological latches, fuel segments).
- Using `THREE.InstancedMesh` with pre-allocated `Matrix4` and `Color` scratch buffers (`setMatrixAt` / `setColorAt`) collapses dozens of individual meshes into a single instanced draw call.

### 1.6 Studio Lighting & Shadow Map Optimization
- **Light Rig Consolidation**: Every dynamic light in a PBR/transmissive scene multiplies per-fragment BRDF evaluations across all visible pixels. `SherlockStage._setupLights()` is streamlined from 6 lights down to 4 high-impact studio lights:
  1. `HemisphereLight(0xfff9ee, 0x2c2925, 1.35)` — warm alabaster sky / dark walnut ground ambient fill.
  2. `DirectionalLight(0xfff6e5, 2.1)` — primary key light with `1024x1024` shadow map (4x fewer shadow depth texels per frame than `2048x2048`, with tight orthographic bounds `d = 4.2`).
  3. `DirectionalLight(0xd4a24c, 0.95)` — warm horological brass rim light.
  4. `PointLight(0xc84b31, 1.7, 5.5, 1.5)` — dynamic central recursion well point light driven by machine phase (`DESCEND`, `RESOLVE`/`RETURN`, `EMBLEM`, `ERROR`).
- Redundant secondary fill directional and upper arena point lights were removed to reduce fragment shader cost and eliminate specular glare clutter.

---

## 2. Codebase Performance Audit Summary

| File / Subsystem | Audit Findings | Remediation Applied |
| :--- | :--- | :--- |
| `src/stage/SherlockStage.js` | Used legacy `THREE.WebGLRenderer`; 6 lights including `2048x2048` shadow map + extra fill & arena lights; allocated `{ ...stepState }` every frame in `render()`. | Upgraded to `THREE.WebGPURenderer` (`three/webgpu`) with async `_initRenderer()` + `this.ready` guard + headless fallback; streamlined to 4 studio lights with `1024x1024` shadow map; pre-allocated `this._scratchColor` and reusable state transfer. |
| `src/designers/theme.js` | Imported from `'three'`; `createPlaqueTexture()` allocated a new `<canvas>` and `THREE.CanvasTexture` on every call without caching; lacked `easeInOutCubic`, `createBrushedMetalTexture`, `createReticleTexture`, and shared scratch objects. | Switched import to `'three/webgpu'`; added LRU string-keyed texture cache (`MAX_PLAQUE_CACHE_SIZE = 512`) supporting both `(accent, bg, fg)` and `(accentHex, bgHex, textHex)` aliases; added cached `createBrushedMetalTexture()`, `createReticleTexture()`, `easeInOutCubic()`, and pre-allocated scratch math objects. |
| `src/designers/designer1_package.js` .. `designer7_cinema.js` | High call frequency to `createPlaqueTexture()` during step transitions and inspection badges; heavy reliance on PBR & physical materials under multi-light evaluation. | Automatically accelerated by `theme.js` LRU `CanvasTexture` caching and `SherlockStage.js` 4-light WebGPU studio pipeline. |
