# Muse 04 — Website Pages Debug: invisible animations, `window` chroma crash

Scope: `index.html`, `nursery.html`, `ranch.html`, `field-guide.html`, `lifeform-renderer.js`, `lifeform-webgl.js`, runtime bundle sync. Bench repro: `~/sherlock-bench/motion.html`, `~/sherlock-bench/slideshow.html` at `http://localhost:4377/{motion,slideshow}.html`.

## 1. Verdict — root cause (Phase 1: evidence first)

**One unregistered opcode in bench fixture data kills the whole module before first paint. Repo website pages do not contain this opcode today and are not directly broken; they share the same fail-hard surface and will break identically if it ever ships in a program.**

Causal chain, each link observed:

1. Bench `GRAPHS.tideglass` declares `{ id: 's2', op: 'window', inputs: ['s0'] }` — `motion.html:488`, `slideshow.html:503`.
2. `window` is registered **nowhere**: not in `core.js:10-11` `OPS` (40 ops), not in `kernels.js` `ARITY`/`calculate` (`Unknown kernel`), not in `chroma.js:12-15` `ROLE_MAP`, not in `chroma.js:87-90` `OPCODE_ACCENTS`. Reproduced in Node:
   ```
   OPS includes window? false · ROLE_MAP has window? false
   role('window') throws: Unknown chroma operation window
   colorFor throws: at role (chroma.js:23) at Object.colorFor (chroma.js:96)
   OPS missing from ROLE_MAP: [] · ROLE_MAP extra vs OPS: []   ← repo registries are in sync
   ```
3. `buildChromaPalette()` (`motion.html:516`, `slideshow.html:531`) maps `Chroma.colorFor(shape, idx)` over every node. `colorFor` → `role(node.op)` throws on `s2`. The throw is **not** in `WovenBody`: `WovenBody.author(tideglass,42)` + `compile()` succeed (mechanism resolves on topology counts only — guards/effects/fanout/convergence — never on op semantics). Do not debug the body compiler for this bug.
4. Palettes/bodies are built at **top-level module evaluation** in array-literal order (`motion.html:572-580` `SPECIMEN_LIST`, `slideshow.html:603-611` `PALETTES`). `mantle` is 6th: five palettes compute, then the throw aborts the entire `<script type="module">`. Nothing after it runs.
5. `resize()`/`resizeCanvas()` and `requestAnimationFrame(tick)` sit **after** that block (`motion.html:1269-1275,1441`; `slideshow.html:~929,1342`). They never execute → canvas keeps default `300×150`, no frame is ever drawn → Playwright `brightPixels = 0`. The symptom (blank 300×150) is exactly "module died before sizing", not a WebGL/renderer failure.

Note on naming: `mantleBody` is aspirational. With repo `woven-body.js:17` selection, tideglass topology currently resolves to `lorenz-flow`, not `logarithmic-mantle` (verified by executing `author`). The `window` node influences only counts (`fanout`/`convergence`), not mechanism choice by name.

## 2. Affected vs unaffected

| Surface | Status | Why |
|---|---|---|
| `sherlock-bench/motion.html`, `slideshow.html` | **Broken, blank** | Contain `op:'window'`; throw at startup (above) |
| Repo `nursery.html` + `nursery.js` | Works today, same fragility | Loads `chroma.js` then `lifeform-renderer.js`; `LifeformRenderer.compile` → `paletteFor` → `Chroma.colorFor` per node (`lifeform-renderer.js:4-7`). All 10 `programs/*.json` use only registered ops (census: literal/get/report/compare/… — no `window`), and `verify-chroma.cjs` passes. But `card()` compile is outside the `try` in `run()`; one bad future op blanks the whole collection via `load().catch` |
| Repo `index.html` (`introduction.js`, `first-lesson.js`) | Works today | Compiles V1 `route-preview` / water artifacts only; registered ops. Same `paletteFor` throw surface if intent fixtures change |
| Repo `ranch.html` | Unaffected by chroma | Imports esbuild bundle `assets/ranch/quinelings-runtime.js` (`ranch.js:1`); no `Chroma`/`LifeformRenderer` path. Guarded by `guard()` wrapper |
| Repo `field-guide.html` | Unaffected | Static documentation; no canvas execution |
| `lifeform-webgl.js` | Not implicated | `draw()` is only reached via `LifeformRenderer.draw` after a successful `compile`; batching, `available()` fallback to Canvas2D (`lifeform-renderer.js:17,23`) never got a frame to render |

## 3. Fix — at the source, not the symptom (Phases 2–4)

Pattern check: every working graph (terminal/threadwing/fork/braid/linear, all 10 repo programs) uses only ops present in **all three** registries. `window` is the sole outlier. Three options:

- **A. Fix the bench data (recommended, P0).** Rename `s2` op `window` → an already-registered op in both bench HTML files. Bench never executes graphs (`kernels.calculate` is never called; only `WovenBody.author/compile` + `Chroma.colorFor` run), so topology — the only thing `author` reads — is unchanged by the rename. Pick by intended meaning: sliding-window aggregation → `filter` (process, `#639bfa`); freshness window → `evidenceFresh` (decision). Add a comment that it is a display stand-in until a real kernel exists. One-line change ×2 files; unblocks all 8 specimens.
- **B. Register `window` as a first-class op (only if real semantics are wanted).** Must land atomically in: `core.js` `OPS`+`COLORS` (order defines RGB genome — append, never insert), `kernels.js` `ARITY`+`calculate`+validation, `chroma.js` `ROLE_MAP`+`OPCODE_ACCENTS`, QDL validation, and `verify-chroma.cjs` coverage. Partial registration (e.g. Chroma only) creates an op that colors but cannot execute — worse than throwing.
- **C. Make `Chroma.role/colorFor` fail-soft (rejected).** Returning neutral on unknown op violates the repo contract: `verify-chroma.cjs:9` asserts `role('made-up')` throws and every `Q.OPS` entry has an explicit role. Fail-soft hides typos as silently wrong colors. Keep the throw; fix isolation instead (below).

**Isolation hardening (P1, repo):** wrap per-specimen palette/compile so one bad graph degrades to a labeled placeholder instead of aborting siblings: in bench, build `SPECIMEN_LIST` entries in a `try/catch` map; in `nursery.js:card()`, catch around `R.compile(...)` and render the card with an error status. This converts any future registry drift from "blank page" to "one grey specimen + console error".

**Regression test (P0, before/with fix):** add a bench-side static check (or extend `verify-chroma.cjs`) asserting every `op` literal in `motion.html`/`slideshow.html` `GRAPHS` ∈ `Chroma.ROLE_MAP`. Fails today on `window`, passes after A. Also assert `OPS ≡ ROLE_MAP keys ≡ kernels ARITY keys` — currently true (verified empty symmetric difference); lock it in.

## 4. Runtime bundle sync — drift hazard

Two different bundles, easy to confuse:

- `assets/ranch/quinelings-runtime.js`: esbuild output of `packages/agent-sdk/src/browser-entry.ts` via `npm run ranch:build` (`scripts/build-ranch-browser.mjs:6`). Unrelated to Chroma/WovenBody. Verify freshness by hash (`scripts/verify-ranch-browser.cjs:9` pattern): rebuild → compare SHA-256; stale bundle = Ranch silently running old SDK.
- `~/sherlock-bench/src/engine/quinelingsSdk.js`: hand-bundled copy ("Bundled from upstream", concatenates `chroma.js` etc.). Its `ROLE_MAP` is byte-equivalent to repo `chroma.js:12-15` today (both lack `window`) — **fixing repo `chroma.js` does not fix the bench**; the bench imports only `./src/engine/quinelingsSdk.js`. Action: add a sync check — extract `ROLE_MAP`/`OPCODE_ACCENTS` from both files and diff in CI; re-bundle bench SDK after any upstream `chroma.js`/`core.js`/`woven-body.js` change, and record upstream commit in the bundle header.

## 5. Fuzz plan (codebase)

1. **Registry cross-fuzz (highest value):** enumerate `OPS × ROLE_MAP × OPCODE_ACCENTS × kernels.ARITY`; assert identical key sets. Then property-test `Chroma.colorFor` over random graphs (1–64 nodes, random registered ops, random `strength ∈ [0,1]`, frozen inputs): never throws, always `#[0-9a-f]{6}`, deterministic, no mutation (mirrors `verify-chroma.cjs:50-52`).
2. **Unknown-op fuzz:** random strings (including `__proto__`, `constructor`, unicode, empty) as `op` → must throw `Unknown chroma operation …`, never pollute prototypes, never return a color.
3. **Graph-shape fuzz for `WovenBody.author/compile` + `LifeformRenderer.compile`:** random DAGs (varying fanout/convergence/depth/guards) → compile succeeds or throws a *validation* error, never a chroma error for registered ops; `frame()` points all finite (extends `verify-chroma.cjs:15`).
4. **Lens fuzz:** random traces (duplicate edges, inherited props, `__proto__` paths, NaN/±Infinity, out-of-domain) → statuses stay in `{valid,underflow,overflow,not-evaluated,stale,invalid}` (extends `verify-chroma.cjs:34-49`).
5. **Bench fixture fuzz:** parse every `GRAPHS` literal from both bench HTML files in Node (regex/AST, no browser) and run `author+compile+buildChromaPalette` — the exact startup path that failed. This is the cheapest reproduction of the original bug.

## 6. Formal verification (Quint)

- Existing: `npm run formal:website` (`spec/website-lab.qnt`) typechecks and passes in this session; `spec/design.qnt:34-37` models `role(op)`/`color(op)` only abstractly over `op:int` (4 buckets), and `design.qnt:65-68` bounds `chromaMode/chromaStrength`. **No Quint module models the op registry itself** — the invariant that failed ("every graph op has a role") is currently only a JS test (`verify-chroma.cjs:9`), not a formal one.
- Proposed (P1): add to `spec/design.qnt` (or new `spec/chroma.qnt`): finite op alphabet mirroring `OPS`; invariant `allOpsHaveRole: graph.nodes.all(n => ROLE_MAP.contains(n.op))` as a *precondition* action guard on `compile/palette` actions, plus a deliberate `badGraph` action with an unregistered op and a `detects_unregistered_opTest` run expecting the guard to reject — mirroring the existing `detects_*Test` pattern (`website-lab.qnt:129-135`). Keep the JS/Quint op lists mechanically compared (generate one from the other or assert equality in `verify-chroma.cjs`) so the model cannot drift from `core.js`.
- Run: `quint typecheck spec/design.qnt && quint test spec/design.qnt --max-samples=100 --backend=typescript && quint run spec/design.qnt --invariant=safety --max-samples=1000 --max-steps=50 --seed=20261003 --backend=typescript`. Local `quint` is 0.32.0 vs pinned 0.33.0 — note version in CI to avoid silent spec drift.

## 7. Browser test plan (Playwright + BrowserStack)

Local Playwright (P0, reproduces the original report): serve bench on `:4377` and repo on `:8048` (`npm run dev`); for each of `motion.html`, `slideshow.html`, `index.html`, `nursery.html`, `ranch.html`: assert (a) zero `pageerror`s on load, (b) canvas `width>300 || height>150` after `resize`, (c) `brightPixels > 0` via `getImageData` sampling after 1s, (d) canvas size tracks a viewport resize, (e) `prefers-reduced-motion` still paints one frame. (a)+(b) fail today on both bench pages; all pass after Fix A.

BrowserStack (P1, after local green; credentials only via the bench `browserstack.html` local config flow — never commit): matrix = Chrome/Windows, Edge/Windows, Firefox/Windows, Safari/macOS, Safari/iOS, Chrome/Android × the five pages above. Automate via Playwright's BrowserStack CDP endpoint; gate on the same five assertions. Priority: Safari/iOS (module + `structuredClone` + WebGL fallback path in `lifeform-webgl.js:6-11`) and Firefox (WeakMap/cache behavior in `chroma.js:21`). Record bundle hash (§4) in each run's metadata so a failure can be tied to a stale bundle.

## 8. Ordered actions

| # | Pri | Action | File |
|---|---|---|---|
| 1 | P0 | Rename `op:'window'` → registered op (Fix A) | `~/sherlock-bench/motion.html:488`, `slideshow.html:503` |
| 2 | P0 | Add GRAPHS-op ∈ `ROLE_MAP` regression check | bench test or `verify-chroma.cjs` |
| 3 | P0 | Playwright bright-pixel/pageerror gate (§7) | bench + repo pages |
| 4 | P1 | Per-specimen `try/catch` isolation | bench `SPECIMEN_LIST`; `nursery.js:card()` |
| 5 | P1 | Registry-set equality lock (`OPS≡ROLE_MAP≡ARITY`) | `verify-chroma.cjs` |
| 6 | P1 | Bench SDK ↔ upstream chroma diff check + re-bundle note | `~/sherlock-bench/src/engine/quinelingsSdk.js` header |
| 7 | P1 | Quint `allOpsHaveRole` guard + `detects_unregistered_opTest` | `spec/design.qnt` |
| 8 | P2 | Decide real `window` kernel semantics or drop the concept | `kernels.js`, `core.js` (Fix B if yes) |
| 9 | P2 | BrowserStack matrix on green local build | §7 |

Evidence note: all statements above were verified by reading the cited files and executing Node/Quint checks in this session (`verify-chroma.cjs` green; `window` throw reproduced; `author/compile` on tideglass succeeds; registry symmetric difference empty). No repo source was modified; this report is the only deliverable.
