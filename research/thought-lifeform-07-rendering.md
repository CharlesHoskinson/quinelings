# Workstream 7: rendering a generated connected organism

## Three priorities

1. **Compile one organism, not sixteen independent portraits.** Build immutable material charts, attachment frames, owners and an aggregate sampling allocation. Evaluate one shared gesture with attached child frames; keep palette/record lookups outside the per-point geometry loop.
2. **Make tissue read as volume.** Preserve a visible colored membrane, 2–4 dominant connected crests, stable depth ordering and density-calibrated opacity. Antialiased marks and a tiny crest underlight finish the form; glow does not repair a disconnected silhouette.
3. **Keep Canvas as the initial reference and measure before changing backend.** Typed-buffer reuse, coarse/analytic derivatives, depth interleaving and visible-only animation should precede GPU migration. A backend migration must preserve anatomy/owner/phase contracts, not promise pixel identity or genome recovery from GPU buffers.

No production files were edited. I reviewed current `gallery.js`, `morphology.js`, `chroma.js`, previous graphics/performance reports, and the new grammar and beauty proposals. `thought-lifeform-07-cost.cjs` is an independently runnable measurement/opacity experiment; its JSON is stored alongside this report.

## What current costs tell us

Existing browser measurements in `living-motion-performance.json` report live median rendering around 16.5–24.2 ms, with recorded local cases up to roughly 34.6 ms median and 41.6 ms p90. They are historical runs, not measurements of the proposed connected grammar or future WebGL renderer.

The new Node-only experiment warms and times `surfaceFrame` for filament, jelly and moth at two budgets. At 24,000 requested points, its geometry-only medians are approximately 9.28, 6.45 and 8.50 ms; at 4,200 they are approximately 2.48, 1.55 and 2.12 ms. Actual generated counts remain below the request. These are twenty-sample CPU measurements without Canvas, browser layout, GPU or end-to-end frame scheduling; they establish that multiplying existing per-family sampling cost by sixteen would be an unacceptable design, not a mobile performance guarantee.

The present frame allocates a fresh point buffer, four-depth/32-opacity bucket maps and temporary arrays. It computes multiple spine samples for each normal approximation. All crests are drawn after all dust, so a far crest can incorrectly appear over near tissue. These are concrete initial improvement opportunities.

## Compiled anatomy/material architecture

A validated anatomy has at most sixteen parts, four attachment levels, a shared bounded gait, and explicit material charts. Compile source-dependent data once:

```ts
compileBody(source, anatomy): CompiledBody {
  sourceIdentity,
  parts,                 // <=16 closed primitive records
  sockets,               // parent/local child frames, attachment tree
  ownerRegions,          // exact op ID ownership in material coordinates
  sampleDomains,         // stable (part,u,v) identifiers + quadrature weights
  restFrames,            // bounded regular tangent/frame representation
  crestDomains,          // <=1806 total surface-derived vertices
  operationAnchors,      // <=64, exact declared owners
  extentCertificate      // analytic conservative envelope where available
}

allocateQuality(body, viewScale, policy): SampleLayout
poseBody(body, presentationPhase): PosedFrames
resolvePalette(body, recordedRun, lensView): OwnerPalette
evaluateSurface(body, layout, frames): ReusedSurfaceBuffers
drawBody(buffers, palette, camera, renderPolicy): Frame
```

This is an internal renderer API proposal, not user-defined code in QDL. Chart evaluators are approved implementation primitives; QDL carries closed records and bounded numbers. Runtime task execution and genome codecs stay in the existing CPU interpreter.

Store material coordinates/part ID/owner ID independently of posed positions. Useful surface arrays include position Float32×3, normal Float32×3 or a coarse normal grid, material UV Float32×2, quadrature weight Float32, owner Uint16 and part Uint8. At 24,000 samples this full illustrative set is 936,000 bytes, before extra rest positions, indices, crests and double buffers. This is a theoretical storage estimate, not measured resident memory. Reuse buffers; do not allocate a fresh object per surface sample.

Compute parent/child frames in attachment order once per frame. A child root is defined by its parent's posed socket, not independently approximated. Rest charts and ownership remain unchanged across phases. At a root/socket, suppress hidden cap contributions or weld a declared collar so overlapping translucent caps do not form a bright accidental knot. Normal continuity at a welded joint requires a real joint contract; root position equality alone does not prove a smooth membrane.

## Sampling budget and LOD

The whole organism receives at most 24,000 surface samples and 1,806 crest vertices. These are aggregate limits, not per-part allowances. Allocate at least 128 samples per visible compiled chart where applicable; sixteen such allocations use only 2,048 samples. Distribute the remaining budget by deterministic rest-area and bounded curvature/visual importance weights, with integer remainder assigned by stable part ID. If a quality tier cannot preserve required attachments/ownership, choose a higher tier or a validated simpler anatomy; do not silently drop an executable owner.

Use 4,200 surface samples for static gallery previews as a starting policy, 8,000–12,000 for a moving small specimen, and up to 24,000 for the focused portrait. These are proposed tiers, not newly measured quality/performance conclusions. Keep sockets and principal crests stable at every tier. Two to four crests dominate visually, while the present authored range of three to six can retain quieter secondary crests. Never allocate six 301-vertex crests for every part: six across the animal gives the existing 1,806 maximum.

Create a nested deterministic sample hierarchy in material coordinates. Coarser layouts select stable parent samples; finer layouts add samples rather than resampling the entire surface each phase. No wall-clock jitter. LOD changes use hysteresis and occur at a stable view-scale threshold. If transitioning opacity, normalize quadrature weights for the mixed layout, otherwise crossfading two tiers doubles brightness. A simple stable tier selection is safer than an uncalibrated crossfade.

Screen-space sampling criterion: projected curve chord error below approximately 0.5 CSS px for focused crests; preserve sockets/seams as exact samples. Chart frequencies above the available sample rate must be attenuated as display detail or require a higher LOD, without changing task/source or categorical ownership. Do not allow low-LOD aliasing to invent new visual branches. Stable material-space hatch coordinates keep unavailable recorded values legible without phase-driven flicker.

## Tissue, light and exposure

Use restrained `source-over` pigmentation. A coarse membrane/base layer gives a readable body, fine samples explain surface curvature and depth, and principal crests carry structure. Broad additive bloom tends to bleach categorical hues and erase anatomical openings.

Interleave points and crest segments in the same 8 or 12 back-to-front depth bins, splitting segments at owner and depth transitions. Four bins currently underspecify some overlaps; more bins are an approximation, not exact transparent order. At complex self-crossings, local ordering may require additional subdivision. A depth buffer that writes translucent fronts is not a complete transparency solution.

For regular approved chart P(u,v), use an analytic or cached coarse normal N = normalize(P_u × P_v). Never blindly normalize a near-zero cross product: retain a declared regular frame/fallback and report invalid geometry where the chart violates its contract. Shared inherited deformations must transform the normal consistently; nonuniform scale requires inverse-transpose behavior.

A bounded illustrative light model is

    D = max(0,N·L)
    R = (1−|N·V|)^3
    K = |κ|/(κ₀+|κ|), κ₀>0
    I = clamp(b+dD+rR+cK,0,1), b+d+r+c≤1.

Curvature must be finite from regular charts; this ratio is a bounded accent, not a reason to divide by a degenerate tangent. Trial normal/curvature light on principal crests/coarse grids first. Six additional geometry evaluations per point would consume the current budget quickly. Lighting reveals shape; it never changes the displayed numerical reading or role category.

Opacity uses optical depth and quadrature weights:

    α_i = 1−exp(−τ_i w_i).

With constant τ and identical pixel coverage, combined transmittance is exp(−τΣw_i), independent of how a fixed total weight is split. The experiment demonstrates fixed per-sample alpha .045 changing combined alpha from .168 at four coincident samples to .947 at sixty-four, while a fixed total optical depth .8 gives .551 in each case. This does **not** prove full raster invariance: sample locations, footprint kernels, shape deformation, color order and occlusion still matter. Normalize round/square kernel integral before visual comparisons; otherwise a claimed improvement may be added exposure.

Use a cached soft-edge round kernel with a bounded flat center and narrow softness ramp. Avoid creating a Canvas path/arc for every one of 24,000 samples without profiling. Measure `drawImage` sprite batches versus the current `fillRect`; GPU drivers and browser engines can make either bottleneck different. Screen CSS scale/DPR belongs to render policy; exact source geometry stays independent. Cap animated backing-store pixels and DPR, and reserve supersampling for explicit still export.

## Pigment and recorded lenses

Ownership is categorical in material coordinates. Precompute owner IDs for each layout and chart; update the owner palette only when lens selection, source association or recorded task occurrence changes. No interpreter call in a shader, render callback, phase update or picking operation.

Fixed role hue is shared across generated organisms. The scalar palette uses actual recorded values and fixed authored domains; not-evaluated/invalid/stale states use stable hatching/text, not a fabricated zero or flickering color. LOD and camera changes must not reassign owners. In GPU draws, integer/flat owner attributes or explicit indexed region lookup prevent interpolation into nonexistent owner IDs. Never average neighboring scalar values to make a pleasing gradient unless a distinct declared derived-result contract genuinely computes that quantity.

A wide crest underlight and a narrow pearl core can enhance tissue, but retain the colored structural line and expose the original number in inspection. Exact opcode identity and byte RGB genome remain separate from rendered color, antialiasing and light.

## Cache keys and random-access motion

Separate cache identities:

- **Compile cache:** canonical source identity + internal anatomy compiler/render implementation revision.
- **Layout cache:** compile identity + quality tier + quantized projected scale/camera needed by adaptive layout + raster/DPR policy. Material-space base samples can be shared across cameras.
- **Pose cache:** compile identity + exact presentation phase + authored gait. No dependence on previous frame.
- **Palette cache:** compile identity + recorded run/source/cycle + lens mode.
- **Picking cache:** pose/layout + camera revision; owner IDs come from source data.

A renderer implementation revision is an internal cache key, not a QDL language version freeze. Source editing invalidates source-associated run palettes as current policy requires. View-only changes invalidate only the corresponding render caches.

CPU reference evaluates analytic bounded gaits at arbitrary phase. GPU can receive precomputed sine/cosine pairs for declared modes and inherited matrices rather than accumulate floating phase frame by frame. Independent periodic/quasiperiodic mode phases should be computed from the same supplied double-precision presentation coordinate; reducing phases on CPU avoids large-time Float32 jitter. GPU/CPU images may differ numerically. Exact genome and execution identity never depend on GPU precision, texture values or screenshots.

## Canvas first, WebGL2 later

Start with Canvas and CPU compiled charts, reusing buffers and interleaving depth. It supports a direct visual comparison, graceful fallback and the existing site integration. Animate the focused portrait only; gallery thumbnails can be cached canonical stills until explicitly active. Paused/reduced-motion frames redraw only when a relevant source/view changes.

A WebGL2 path becomes useful if target-hardware p95 remains above 33 ms after those changes, or simultaneous moving organisms are genuinely required. Instanced camera-facing splats with per-instance positions/normals/owners/weights reduce per-point Canvas dispatch, and a small shader computes kernel alpha/light. Four quad vertices per splat means approximately 96,000 vertex invocations for 24,000 splats; that is a cost accounting fact, not a measured performance win. At 60 fps, uploading only positions+normals costs approximately 34.6 MB/s before driver overhead; analytical GPU deformation can reduce uploads after the CPU reference is stable.

Keep one surface implementation contract; do not fork into GPU-only geometry without conformance checks. For transparent tissue, retain sorted depth bins or explicitly tested order-independent approximation; ordinary depth writes will hide valid rear translucency. Account for context creation failure/loss and fall back to the source-backed Canvas still/renderer. No arbitrary shader source or host code is part of QDL.

Primary specifications consulted: [WHATWG Canvas](https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element) defines the rendering context and compositing contract; [Khronos WebGL2 specification](https://registry.khronos.org/webgl/specs/2.0.0/) is the stable API reference for the optional backend. The latest editor draft is in progress, so this proposal does not assume unshipped draft behavior. Rendering architecture, optical formulas and performance thresholds here are our proposals rather than browser-standard guarantees.

## Authored versus renderer policy

Authored anatomy owns primitive dimensions, attachments, owner regions, principal crest paths/selection, bounded material hierarchy and gait. Renderer policy owns adaptive sample count under the authored cap, quadrature discretization, derivative tolerances, depth-bin count, backing-store scale, sprite atlas, backend and picking acceleration. A role/lens declaration remains source; active lens/run and lighting evaluation are view/runtime state. A global finishing light does not need to be serialized as a per-frame material result.

## Test targets — not yet measured

- Focused desktop portrait: aim for p95 below 16.7 ms when feasible; minimum useful steady animation below 33 ms p95 on a documented target device. Report geometry, raster and scheduling separately over at least 300 warm frames.
- Hard limits: at most sixteen components, 24,000 body samples and 1,806 total crest vertices. Track inspection-overlay vertices separately; do not pretend these body limits include all graph overlays. Inspect selected neighborhoods/paged graphs without dropping source nodes.
- Equal-exposure same-source comparisons at multiple sample tiers, DPR 1/2 and scales: target median coarse-region luminance drift below approximately 5%, investigate any role boundary drift or topology disappearance. This is a practical target, not an established invariant.
- Seam/root coincidence across whole gesture, finite regular normals, stable categorical owner IDs, no material swimming, no near/far crest inversion in selected controlled overlaps, no clipping or camera pumping.
- At 64/96/160-pixel heights, dominant mass, principal openings and attached secondary parts remain readable. A ten-second film must show one coherent gesture; glow cannot be the only visible improvement.
- Pause/seek/reduced motion and CPU/GPU fallback preserve source, task results, records and quine/genome identity. Deterministic same-backend phase replay yields the same geometry within its stated arithmetic tolerance.
- Context loss/import/source edit does not trigger execution. Corrupt charts and degenerate normals fail visibly or use a documented bounded fallback; no NaNs silently enter draw buffers.
