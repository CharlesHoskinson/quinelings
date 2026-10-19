# Muse 01 — motion.html & slideshow.html Startup Crash, Canvas Resize, Scene Fuzzing

**Top finding:** Both pages die at module evaluation on one illegitimate op string.
`GRAPHS.tideglass` uses `op:'window'`, which exists in **no** registry in this repo.
`Chroma.role('window')` throws, the throw aborts the `<script type="module">` before
`resize()`/`animate()` are ever reached, and the canvas keeps its HTML default
`300×150` with 0 bright pixels. This is a data bug in the two demo graphs, not a
missing Chroma feature. Do not “fix” it by only adding `window` to `ROLE_MAP` —
that would mask a kernel-illegal op.

## 1. Root-cause chain (traced, reproduced)

1. `motion.html:484-492` and `slideshow.html:499-507` define identical
   `tideglass.nodes[2] = { id:'s2', op:'window', inputs:['s0'] }`.
2. `buildChromaPalette` (`motion.html:516-524`, `slideshow.html:531-539`) calls
   `Chroma.colorFor(shape, idx)` per node → `ROLES[role(node.op)]`
   (`chroma.js:96`, SDK copy `quinelingsSdk.js:474,542-547`).
3. `role()` throws `Error: Unknown chroma operation window`
   (`chroma.js:23`) because `ROLE_MAP` (`chroma.js:12-15`) has no `window` key.
4. The throw happens inside the top-level `SPECIMEN_LIST` literal
   (`motion.html:578`, `mantle` entry) / `PALETTES` literal
   (`slideshow.html:609`). Module evaluation stops there.
5. `resize()` is defined and first called at `motion.html:1269-1275`
   (`resizeCanvas()` at `slideshow.html:928-934`), and the rAF loops at
   `motion.html:1441,1587` / `slideshow.html:1342,1440` — all *after* the
   throwing literal. None execute. Canvas stays at the default `300×150`;
   nothing is ever drawn → `brightPixels = 0`.

Reproduced in Node (no browser needed):

```
$ node -e "C=require('./chroma.js'); C.role('window')"
Error: Unknown chroma operation window
$ node verify-chroma.cjs   # passes today — it never feeds 'window'
```

## 2. Correction to the brief's premise

- `WovenBody.author` does **not** validate op strings at all. `programProfile`
  (`woven-body.js`, `ops.add(n.op||'')`) only hashes them for `litNorm/opNorm`;
  `validate()` checks territory coverage by node *id*, never op legality.
  That is why `WovenBody.compile(WovenBody.author(GRAPHS.tideglass,42), …)`
  succeeds and the failure only surfaces later, in the palette builder.
- `tideglass` does not even select `logarithmic-mantle`: `reconcile` matches
  `hasCoupled`, so `author()` returns `lorenz-flow` (verified:
  `mechanism: lorenz-flow, strands 10`) before the `convergence>=2 →
  logarithmic-mantle` branch is reached. The `window`/mantle association in
  the brief is not in the code.
- Three registries agree `window` is illegitimate, all with exactly 41 ops:
  `core.js:9-11` (`OPS` = 34 legacy + 7 v1; `instructionColor` would also throw),
  `kernels.js:3` (`ARITY`; `validate` → `Unknown kernel window`, reproduced),
  and `chroma.js:12-15` `ROLE_MAP` (41 keys, exact set-match with `OPS`,
  verified programmatically). `OPCODE_ACCENTS` (`chroma.js:87-90`) likewise
  has no `window`. The bundled copies are not drifted: `ROLE_MAP` in
  `assets/ranch/quinelings-runtime.js` and `src/engine/quinelingsSdk.js` is
  byte-identical to `chroma.js`.

## 3. Fix (in priority order)

**P0 — repair the data (one line × 2 files).** Change `op:'window'` to an
existing op in both HTML files. `map` is the least-wrong placeholder
(`s2` transforms `s0`, feeds `reconcile`); `select` is also defensible.
These pages never execute the graphs through `kernels.calculate`, so no
`params` are needed for the demo to run — but say so in a comment, because
as written the graph is not executable Quinelings source. If a real sliding-
window op is intended, that is a separate, larger change: add it to
`kernels.js` `ARITY`+`calculate`, `core.js` `OPS`+`COLORS`,
`chroma.js` `ROLE_MAP`+`OPCODE_ACCENTS`, then rebuild the SDK
(`packages/agent-sdk/build.mjs`, source `packages/agent-sdk/src/index.ts:15`
imports `../../../chroma.js` directly) and re-copy `quinelingsSdk.js`.
Adding it to `ROLE_MAP` alone is explicitly wrong.

**P1 — fail soft so one bad specimen can't blank the page.** Wrap each
`buildChromaPalette` call (or each `SPECIMEN_LIST`/`PALETTES` entry) in
`try/catch`, fall back to the neutral palette, and `console.error` the graph
key. Also move `resize()` + first `requestAnimationFrame` *above* the
specimen compilation, or into a separate non-module script, so a future
data error degrades to a missing specimen instead of a black page. Add a
visible error banner on uncaught module errors (`window.addEventListener('error')`)
— the current failure is silent to the user.

**P1 — close the validation hole at the source.** Make `WovenBody.author`
(or a shared `validateGraphOps`) reject any `node.op ∉ Kernels.ARITY` with
the node id in the message. Today `author`, `compile`, and `Chroma.compile`
each validate a different slice (territories / mechanism / nothing) and
none checks op membership; the palette builder is the *last* place this
should be discovered. `Chroma.compile` (`chroma.js:54`) also calls
`role(n.op)` eagerly for `roleColors`, so any `LifeformRenderer.compile`
(`lifeform-renderer.js:4-7`, via `paletteFor`) has the same blast radius.

## 4. Canvas resize — what to verify after the fix

`resize()` itself (`motion.html:1269-1275`, `slideshow.html:928-934`) is
correct once reached: `dpr = min(devicePixelRatio,2)`,
`canvas.width/height = floor(innerWidth/Height × dpr)`, re-run on `resize`.
`LifeformRenderer.draw` (`lifeform-renderer.js:12,17-18`) reads
`canvas.width/height` per frame, so no stale-size bug there. Fuzz it:

| Input | Expected |
|---|---|
| Load at 1920×1080, dpr 1 / 1.5 / 2 / 3 | `canvas.width == floor(1920·min(dpr,2))`, never `300×150` after load |
| Resize storm (50 events / 100 ms), orientation change, 0×0 viewport | No throw, final size matches final viewport, rAF keeps running |
| `devicePixelRatio` changes (zoom, drag across monitors) | Size follows on next `resize`; no permanent 2× clamp error |

Playwright gate (both pages): after load, assert
`canvas.width > 300 || canvas.height > 150`, then sample pixels after
≥30 frames and assert `brightPixels > 0`. The current bug fails the first
assert; that pair distinguishes “crashed before resize” from “rendered black”.

## 5. Scene fuzzing plan

Harness: Node + the real `chroma.js`/`kernels.js`/`woven-body.js` (all are
CommonJS-loadable today, verified), driving the exact `GRAPHS` literals
extracted from both HTML files, plus mutations:

- **Op fuzz:** every `op ∈ OPS` (must not throw in `role`/`colorFor`/
  `Kernels.validate`), plus `window`, `''`, `__proto__`, `constructor`,
  `Window`, ` window`, unicode look-alikes (must throw a named error
  *before* any body compile, once §3-P1 lands; today only `colorFor` throws).
- **Graph fuzz:** 1–64 nodes, duplicate ids, dangling inputs, self-loops,
  cycles, `level` ∈ {-1, 0, NaN, 1e9} (feeds `Chroma.compile` banding,
  `chroma.js:41-45`), missing `params`/`inputs`.
- **Numeric fuzz:** `phase ∈ {0, -0, NaN, ±Infinity, 1e12}`, `budget ∈
  {0, -1, NaN}`, `u/v/k/total` at band edges incl. the closed-family seam
  (`chroma.js:50-52`, families `moth/torus/bloom`); strength ∈ {0, 1, NaN,
  -1, 2} (`colorFor` clamps, `chroma.js:95-102`).
- **Properties (all must hold or throw named errors, never silently):**
  `owner()` ∈ `[0, nodes.length)` and deterministic per `(u,v,k,total)`;
  every node owns ≥1 sampled point (the `verify-chroma.cjs:10-18` check,
  extended to the six demo graphs); `colorFor` always returns
  `#[0-9a-f]{6}`; `WovenBody.author` output passes `WovenBody.validate`;
  frozen inputs are not mutated (`verify-chroma.cjs:50-53` pattern).
- **Regression test to commit:** feed all six `GRAPHS` from each HTML file
  through `author → compile → buildChromaPalette` and assert no throw.
  Add the converse registry check `Object.keys(ROLE_MAP) ≡ OPS ≡
  Object.keys(Kernels.ARITY ∪ v1-ops)` to `verify-chroma.cjs` — check 1
  (`verify-chroma.cjs:9`) only asserts `OPS ⊆ ROLE_MAP` today, which is
  exactly how a stray op could pass unnoticed in the other direction.

## 6. Formal verification (Quint) & BrowserStack

- Existing coverage does not model this bug: `spec/design.qnt:65-68,106-107`
  abstracts chroma to `chromaMode ∈ 0..2` / `chromaStrength ∈ 0..1000`;
  no `.qnt` spec mentions op registries (grep-verified). `verify-chroma.cjs`
  passing is therefore not evidence about `window`.
- Add `spec/chroma-registry.qnt`: state = the three op sets as Quint sets
  imported from a generated JSON fixture ( Quint cannot import JS — generate
  the fixture in CI from `core.js`/`chroma.js`/`kernels.js` and fail CI if
  it is stale). Invariants: `OPS == ROLE_MAP.keys`,
  `ROLE_MAP.keys ⊆ Kernels.ARITY.keys ∪ V1_OPS`, and “palette construction
  is total”: `∀ graph, (∀ n ∈ graph.nodes: n.op ∈ OPS) ⇒ colorFor never
  throws`. Model the demo-page startup as init → compileAll → resize →
  animate with a boolean `crashed` flag; invariant `¬crashed ⇒
  canvasSized ∧ animating`, plus a run that injects one unknown op and
  expects `crashed` *with* the P1 fallback (specimen dropped, page alive).
  Run with `quint verify` + `quint run` in CI alongside the existing specs.
- BrowserStack (after P0): both pages × {Chrome/Win, Safari/macOS,
  Safari/iOS, Firefox} — assert no console error matching
  `Unknown chroma operation`, canvas sized per §4, `brightPixels > 0`.
  Keep the local Playwright gate as the fast pre-merge check; BrowserStack
  is the cross-engine confirmation, not the primary oracle.

## 7. Evidence index

- Crash site & registries: [chroma.js](/home/charles/repos/quinelings/chroma.js:12) · [core.js](/home/charles/repos/quinelings/core.js:9) · [kernels.js](/home/charles/repos/quinelings/kernels.js:3) · [verify-chroma.cjs](/home/charles/repos/quinelings/verify-chroma.cjs:9)
- Demo graphs & palette builder: [motion.html](/home/charles/sherlock-bench/motion.html:484) · [slideshow.html](/home/charles/sherlock-bench/slideshow.html:499) · [quinelingsSdk.js](/home/charles/sherlock-bench/src/engine/quinelingsSdk.js:474)
- Blast radius: [lifeform-renderer.js](/home/charles/repos/quinelings/lifeform-renderer.js:4) · [woven-body.js](/home/charles/repos/quinelings/woven-body.js:17)
- Commands run: `node -e` reproductions of `role('window')`,
  `Kernels.validate(window-graph)`, `WovenBody.author(tideglass)` →
  `lorenz-flow`; set-equality check `OPS ≡ ROLE_MAP` (41 = 41);
  `node verify-chroma.cjs` → ok; `node tests/verify-woven-body.cjs` → ok.
