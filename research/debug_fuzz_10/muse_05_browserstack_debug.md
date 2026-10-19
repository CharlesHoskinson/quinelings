# Muse 05 — 3D Sherlock Stage (`uv` warning) & BrowserStack Live Verification

Scope: `designer8_quineling.js` WebGL/WebGPU `uv` warning + why `motion.html` /
`slideshow.html` showed no animation. Root cause first; fixes are one-liners.
No credentials are reproduced here — see §5 hygiene note.

## 1. Verdict

| Symptom | Cause | Severity |
|---|---|---|
| `motion.html`, `slideshow.html` blank, canvas stuck at default `300×150`, `0 brightPixels` | Uncaught `Error: Unknown chroma operation window` during top-level module evaluation, before `resize()` / `requestAnimationFrame` ever run | **P0 blocker** |
| `THREE` `uv` attribute warning on the 3D Sherlock stage (`index.html`, Designer 8) | `sdkRibbonGeom` / `tendrilGeom` have `position`+`color`+`normal` but no `uv`, paired with `MeshPhysicalMaterial` under `three/webgpu` | P2 cosmetic, non-fatal, unrelated to the blank canvas |

These are two separate defects. Fixing `uv` will not unblank the films; fixing
`window` will not silence `uv`.

## 2. Root-cause investigation (reproduced)

### 2.1 Evidence chain

1. Both films define the same demo graph with an unregistered op:
   [motion.html](/home/charles/sherlock-bench/motion.html:488) and
   [slideshow.html](/home/charles/sherlock-bench/slideshow.html:503):
   `{ id: 's2', op: 'window', inputs: ['s0'] }` inside `GRAPHS.tideglass`.
2. `buildChromaPalette()` maps every node through `Chroma.colorFor`
   ([motion.html](/home/charles/sherlock-bench/motion.html:516),
   [slideshow.html](/home/charles/sherlock-bench/slideshow.html:531)).
   `colorFor` → `role(op)` throws on any op absent from `ROLE_MAP`:
   [quinelingsSdk.js](/home/charles/sherlock-bench/src/engine/quinelingsSdk.js:474)
   `if(!Object.hasOwn(ROLE_MAP,op)) throw Error('Unknown chroma operation '+op)`,
   identical in upstream [chroma.js](/home/charles/repos/quinelings/chroma.js:23).
3. `ROLE_MAP` (41 entries, [quinelingsSdk.js](/home/charles/sherlock-bench/src/engine/quinelingsSdk.js:463) /
   [chroma.js](/home/charles/repos/quinelings/chroma.js:12)) has no `window`.
   Verified locally: `role('window')` and `colorFor(tideglassShape, s2)` both throw
   `Unknown chroma operation window`; every other op used by the six demo graphs
   (`literal, action, filter, consensus, sum, map, reconcile, report, sort, dedupe, select`)
   resolves.
4. `window` is not a real QDL opcode at all: it is absent from `Q.OPS`
   (41 ops, [core.js](/home/charles/repos/quinelings/core.js:9)) and has no
   `case` in the interpreter [kernels.js](/home/charles/repos/quinelings/kernels.js:31).
   The demo graphs are never executed — they only feed `WovenBody.author` +
   `Chroma` — so the string is a free-text label that drifted from the registry.
5. Throw site is the `mantle` entry of `SPECIMEN_LIST`
   ([motion.html](/home/charles/sherlock-bench/motion.html:578) `buildChromaPalette(GRAPHS.tideglass, …)`),
   evaluated at module top level. Everything after it in the same `<script type="module">`
   — including `resize()` ([motion.html](/home/charles/sherlock-bench/motion.html:1269),
   called at :1275; `resizeCanvas()` in slideshow at :928) and the
   `requestAnimationFrame(tick)` loop — never executes. An un-sized `<canvas>`
   keeps its HTML default `300×150` and is never painted: exactly the observed
   `300×150` + `0 brightPixels`. No WebGL/WebGPU failure is needed to explain it.

### 2.2 Ruled out

- **`WovenBody.author(tideglass)` does not throw.** Reproduced: it returns
  `mechanism = lorenz-flow` (the `reconcile` node sets `hasCoupled`, which wins
  before the `logarithmic-mantle` branch in
  [woven-body.js](/home/charles/repos/quinelings/woven-body.js:17)), and
  `WovenBody.compile` succeeds. The `logarithmic-mantle` / Lorenz `dynamics.window`
  field (an orbit-sample count, [woven-body.js](/home/charles/repos/quinelings/woven-body.js:21))
  is a red herring — three unrelated things share the word "window".
- **Upstream test suite is green but blind:** `node verify-chroma.cjs` passes.
  Its first check only proves `Q.OPS ⊆ ROLE_MAP`
  ([verify-chroma.cjs](/home/charles/repos/quinelings/verify-chroma.cjs:9)); the
  demo graphs in `sherlock-bench` are outside that quantification, so the gap
  was invisible to CI.

### 2.3 Hypothesis (confirmed)

> The films broke when `tideglass.s2` was authored with the plausible-but-invented
> op name `window`; the strict fail-fast `role()` then aborted module evaluation
> before first paint. Minimal reproduction above confirms each link.

## 3. Fix (pick A; B only if `window` becomes a real opcode)

### Option A — P0, recommended (2 lines)

Rename the invented op to an already-registered process op in both files:

```diff
-{ id: 's2', op: 'window', inputs: ['s0'] },
+{ id: 's2', op: 'filter', inputs: ['s0'] },
```

- [motion.html](/home/charles/sherlock-bench/motion.html:488),
  [slideshow.html](/home/charles/sherlock-bench/slideshow.html:503).
- `filter → process (#639bfa)` keeps the intended "process" coloring; if the
  intent was a freshness window, `evidenceFresh → decision` is the semantic
  match. Either is safe: no interpreter, genome, or territory behavior changes
  (topology features read op names only via regexes that do not mention `window`).

### Option B — only with full opcode admission (do not half-do)

Register `window` in **all** of: `core.js` `OPS`+`COLORS`, `kernels.js`
evaluator case, `chroma.js` + bundled `quinelingsSdk.js` (`ROLE_MAP` **and**
`OPCODE_ACCENTS`). Warning: inserting into `OPS` shifts `instructionColor`
indices and therefore the harmonic genome encoding — treat as a format change,
not a patch.

### Defence in depth (P1, same change set)

1. **Sync hazard:** `quinelingsSdk.js` is a bundled copy of upstream
   ("Bundled from upstream", [quinelingsSdk.js](/home/charles/sherlock-bench/src/engine/quinelingsSdk.js:1)).
   Fixing only upstream [chroma.js](/home/charles/repos/quinelings/chroma.js) changes
   nothing in the browser. Patch the bundle (or regenerate it) and add a
   byte/AST parity check for `ROLE_MAP`/`OPCODE_ACCENTS` between the two.
2. **Fail-soft palette:** wrap each `buildChromaPalette` call so one bad specimen
   degrades to the neutral palette instead of aborting all eight bodies and the
   render loop; log the offending `graph.key`/`op`. Strict `role()` throwing is
   correct for admitted programs — the films' ad-hoc graphs are the wrong layer
   to be strict at top level.
3. **Order:** call `resize()` + start `requestAnimationFrame` before compiling
   specimens, so any future compile throw leaves a sized, diagnosable canvas.

### Regression test (P0, add with the fix)

Extend [verify-chroma.cjs](/home/charles/repos/quinelings/verify-chroma.cjs) (or a new
`sherlock-bench` check): extract every `op:` from `GRAPHS` in both HTML files and
assert `Object.hasOwn(Chroma.ROLE_MAP, op)` and `hex.test(Chroma.colorFor(shape, i))`
for every node. This is the exact quantifier CI was missing.

## 4. Designer 8 `uv` warning (P2)

In [designer8_quineling.js](/home/charles/sherlock-bench/src/designers/designer8_quineling.js:835),
`sdkRibbonGeom` and `tendrilGeom` (:951) set `position`/`color`/`normal` + index
but **no `uv`** (2 floats/vertex), while their `MeshPhysicalMaterial`s
(:844, :960) render under `THREE.WebGPURenderer` (`three/webgpu`, three 0.175.0)
with `scene.environment` IBL ([SherlockStage.js](/home/charles/sherlock-bench/src/stage/SherlockStage.js:117),
WebGL2 fallback at :188). The WebGPU node graph samples a default `uv`
attribute for PBR/environment paths; with none bound it warns and substitutes 0.
`Points`/`LineSegments` geometries (tissue :756, ridges :804, arcs :898) do not
need `uv` — `PointsMaterial.map` uses point coordinates, `LineBasicMaterial`
none — and upstream [lifeform-webgl.js](/home/charles/repos/quinelings/lifeform-webgl.js:9)
shaders use only `position`+`ink`, so the 2D lifeform path is unaffected.

Fix (either, per geometry, once at creation):

```js
// cheapest: dummy uvs, no visual change (no texture is bound)
geom.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(VERTEX_COUNT * 2), 2));
// better: u = segment parameter, v = 0/1 across the ribbon — enables future texturing
```

Add a fuzz/assert: every `Mesh` geometry paired with a `Mesh*Material` in
Designer 8 exposes `position`, `normal`, `uv` with matching vertex counts.
Re-verify visually once — ribbons/tendrils must be pixel-identical (they bind
no map today).

## 5. BrowserStack Live verification suite

Existing assets: [browserstack_desktop_matrix.mjs](/home/charles/sherlock-bench/test/browserstack_desktop_matrix.mjs)
(10 desktop configs) and [browserstack_mobile_matrix.mjs](/home/charles/sherlock-bench/test/browserstack_mobile_matrix.mjs),
driven from `server.js` (`PORT 4377`, BrowserStack mini-app on `4388`).

**Gap to close first:** both matrices default `TARGET_URL` to the deployed
GitHub Pages visualization, so they would pass while `localhost:4377/motion.html`
is still broken. Run them against the local build via BrowserStack Local
tunnel (or a staging deploy of the fixed tree).

Per-session scripted assertions (fail = session fail):

1. Load `motion.html`, then `slideshow.html`, then `index.html` with the
   `quineling` preset active. Capture `pageerror`/console.
2. Assert **zero** `Unknown chroma operation` errors (the P0 signature).
3. Assert film canvas `width > 300 || height > 150` after 1s and sampled
   `brightPixels > 0` over ≥30 frames; assert stage canvas renders Designer 8
   (non-blank frame + FPS counter advancing).
4. Record `uv` warnings separately as **warn-only**: present-before-fix /
   absent-after-fix on Chrome+Edge (Blink/WebGPU), Safari (WebKit/Metal),
   Firefox (forced WebGL2 path). Never let them fail the run until §4 lands,
   then promote to fail.
5. Matrix: Win11 Chrome/Edge/Firefox 1080p, Win11 Chrome QXGA, macOS Sonoma
   Safari 17.3/Chrome/Firefox/Edge, macOS Ventura Safari 16.5, Win10 Chrome;
   mobile spot-check Galaxy S24 Ultra + Pixel 8 Pro (existing tiers).
   Note the single-parallel-session plan limit — run sequentially, desktop first.

**Hygiene (P1):** `/home/charles/sherlock-bench/.browserstack.json` contains
live-looking credentials in plaintext. Do not commit/print them; move to env
vars / secret store and rotate if this file has ever been shared.

## 6. Fuzz & formal verification ( Quint )

Fuzz (fast-check, extend `test/fuzz_burnin.test.mjs` style):

- Generate graphs with ops drawn from `Q.OPS ∪ {'window','__proto__','constructor','', random strings}`:
  property — `buildChromaPalette` either succeeds with `/^#[0-9a-f]{6}$/` per node
  or fails **without** preventing `resize`/first frame (post fail-soft fix: always succeeds with neutral fallback + logged op).
- `role()` totality: `∀ op ∈ Q.OPS: ROLE_MAP` has `op` (existing check) **plus**
  `∀ op ∈ demo-graphs: ROLE_MAP` has `op` (new check, §3).
- Designer 8: arbitrary ribbon/tendril vertex counts ⇒ attribute item-sizes
  `(position:3, color:3, normal:3, uv:2)` and equal counts.

Quint (new `specs/quint/chroma_palette.qnt`, or extend
`engine_quineling_pipeline.qnt` which currently models mechanisms/caches but
not Chroma):

```quint
pure val RegisteredOps = Set("literal","sum", /* …41 ops… */ "reconcile")
type BootState = { paletteOk: bool, resized: bool, animating: bool, bright: bool }
invariant PaletteTotal = allGraphs.forall(g => g.ops.forall(op => RegisteredOps.contains(op)))
invariant BootProgress = animating => resized   // resize/rAF never blocked by palette
invariant VisibleWhenBooted = animating => bright // falsifies the 300×150/0-bright state
```

Model-check the pre-fix trace (`window ∉ RegisteredOps` ⇒ `animating = false`)
as a failing run, then the fixed + fail-soft variants as passing runs.

## 7. Action checklist

- [ ] **P0** Option A rename in both HTML files + palette regression check (§3).
- [ ] **P0** Re-run locally: films animate, canvas > `300×150`, `brightPixels > 0`, zero page errors.
- [ ] **P1** Fail-soft palette + resize-before-compile ordering; upstream↔bundle `ROLE_MAP` parity check.
- [ ] **P1** BrowserStack run against local/staging build with §5 assertions; rotate plaintext BrowserStack credentials.
- [ ] **P2** Dummy/real `uv` on `sdkRibbonGeom` + `tendrilGeom`; promote `uv` warning to fail in BrowserStack.
- [ ] **P2** Land fuzz properties + `chroma_palette.qnt` invariants.
