# Muse 03 — Quint pipeline: why the animations were invisible

**Verdict:** One bad opcode string kills both pages at module load. `GRAPHS.tideglass`
node `s2` uses `op:'window'`, which is registered **nowhere**. The palette build
throws before `resize()`/`requestAnimationFrame`, so the canvas never leaves its
default 300×150 and paints 0 bright pixels. Spec + regression model delivered in
[animation-pipeline.qnt](/home/charles/repos/quinelings/spec/animation-pipeline.qnt).

## Root cause (verified by execution, not just reading)

| # | Fact | Evidence |
|---|---|---|
| 1 | `window` ∉ every registry | `core.js:11` `OPS` (41 ops), `chroma.js:12` `ROLE_MAP`, `chroma.js:87` `OPCODE_ACCENTS`, `kernels.js` — `K.validate(...op:'window')` throws `Unknown kernel window` |
| 2 | Throw site | [chroma.js:23](/home/charles/repos/quinelings/chroma.js:23) `role()` throws `Unknown chroma operation window`; reached via `colorFor` at [chroma.js:96](/home/charles/repos/quinelings/chroma.js:96) |
| 3 | Trigger | `motion.html:488` / `slideshow.html:503` `op:'window'`, consumed by `buildChromaPalette` (`motion.html:516`, `slideshow.html:531`) → `Chroma.colorFor` per node |
| 4 | Startup atomicity | `SPECIMEN_LIST` (`motion.html:572`) builds all 8 palettes in one top-level literal; the tideglass entry (`:578`) throws, so `resize()` (`motion.html:1275`) and `requestAnimationFrame(tick)` (`:1587`) never run |
| 5 | Reproduced | `node -e C.role('window')` → throws; `node verify-chroma.cjs` → ok (it only iterates `Q.OPS`, so the bench-only `window` op is invisible to it) |

**Correction to the brief:** `WovenBody.author` does *not* check for `window`.
It never inspects that string ([woven-body.js:17](/home/charles/repos/quinelings/woven-body.js:17)
branches on guards/effects/fanout/convergence/depth + op-class sets).
Verified: tideglass authors as `lorenz-flow` (its `reconcile` node hits the
`hasCoupled` branch) with `window`, `sum`, or `clamp` at `s2` alike;
`logarithmic-mantle` is only the `convergence>=2` fallback and is never reached
here. `WovenBody.compile` also succeeds on the bad graph — `nodes()` checks IDs
only — so the first validator the graph ever meets is `Chroma.role`, at paint time.

## Fix (pick A; B is defence-in-depth, do both if cheap)

- **A — fix the data (root cause):** in both bench pages change tideglass `s2`
  `op:'window'` to a registered op with the intended semantics (a sliding-window
  aggregate ≈ `mean` over `s0`; `sum`/`clamp` also author identically). One word
  per file. Do **not** add `window` to `ROLE_MAP` alone: `kernels.validate`
  still rejects it, so any `Q.runTask`/SDK path would fail later and quieter.
  If a real `window` kernel is wanted, add it to all four registries at once
  (`kernels.js`, `core.js` `OPS`, `chroma.js` `ROLE_MAP`+`OPCODE_ACCENTS`) plus
  a `verify-chroma.cjs` assertion — treat the four as one atomic change.
- **B — fail visibly, never silently:** wrap each `buildChromaPalette` call (or
  the whole specimen bootstrap) in `try/catch` that renders the error text into
  the page and still calls `resize()` + starts the remaining 7 specimens. A
  blank 300×150 canvas must be impossible: either armed animation or a visible
  error. This is invariant `failureIsVisible` in the spec.
- **C — close the test gap:** extend the `verify-chroma.cjs:9` registry check to
  also scan bench/fixture graphs (extract `GRAPHS` ops from
  `motion.html`/`slideshow.html`, assert each ∈ `ROLE_MAP ∩ OPS`). Today that
  check passes while the shipped pages crash.

`lifeform-renderer.js:4` (`paletteFor` → `Chroma.colorFor`) has the same
exposure for any woven design whose graph carries an unregistered op; fix A/C
cover it, B should be mirrored at its call sites.

## Formal verification — `spec/animation-pipeline.qnt`

Single page, shared state, no messages → plain Quint (no Choreo; nothing to
choreograph). State record: phase, node/op-registry status, palette size,
canvas size, frame budget, frames/brightFrames, `errorShown`, `ownerValid`.
Actions: `loadGraph → buildPalette → resize → startAnimation → tick`, with
`startAnimation` guarded by `canAnimate` (complete palette ∧ sized canvas ∧
budget ∈ [128,100000], mirroring `WovenBody.frame` bounds).

Invariants: `animatingIsArmed`, `paletteIsAtomic` (0 or all nodes coloured —
no partial palette), `failureIsVisible` (failed ⇒ shown ∧ 0 frames),
`framesImplyArmed`, `canvasSafe`. Observed this session:

```
quint typecheck spec/animation-pipeline.qnt   → ok
quint run … --invariant safety --witnesses animatingReached brightReached failedReached
  → [ok] No violation found; witnesses 45.5% / 31.5% / 47.5% of 200 traces (all live)
quint test spec/animation-pipeline.qnt
  → unknownOpFailsVisiblyTest passed; knownGraphAnimatesTest passed
```

`unknownOpFailsVisiblyTest` is the reported bug as a regression: unknown op ⇒
`failed`, error shown, canvas still 300×150, 0 frames. Sampled `quint run`
only (no exhaustive `verify` was run or needed). Not modelled: JS exception
mechanics, actual pixel brightness, colour maths — those stay with JS/browser
checks; `brightFrames` is a browser-observed boolean, not a Quint proof.

## Fuzz actions (next, in priority order)

1. **Opcode fuzz:** for each registry, throw every string in
   `OPS ∪ ROLE_MAP ∪ OPCODE_ACCENTS ∪ bench-graph ops` plus mutations
   (`window`, `Window`, `''`, `__proto__`, unicode) at `Chroma.role`,
   `instructionColor`, `kernels.validate`; assert the three accept-sets are
   identical. Current known diff: bench-only `window` (accept-set ∅, used once).
2. **Graph fuzz:** random DAGs (1–64 nodes, random ops/inputs) through
   `WovenBody.author/compile` + `paletteFor`; assert either a clean palette or
   one visible error — never a throw after partial rendering.
3. **Scalar/lens fuzz:** `scalarColor`/`resolveLens` over NaN/±Inf/huge,
   duplicate trace edges, prototype-key paths (partly covered at
   `verify-chroma.cjs:38-48`; extend to `colorFor` strength/lens combos).

## BrowserStack / browser matrix (proposed — not run here)

No credentials used and no live run claimed (per repo rules). Run after fix A:
Chrome/Edge/Firefox/Safari latest × {`motion.html`, `slideshow.html`} at
360×740, 1280×720, 1920×1080. Pass = no console error, canvas ≠ 300×150 after
load, `brightPixels > 0` within 2 s, ≥30 fps over 5 s. Add one negative case
(reintroduce `op:'window'` locally): pass = visible error banner + other
specimens still animating (fix B). Playwright local run first; BrowserStack
only for the Safari/iOS rows local WebKit cannot cover.
