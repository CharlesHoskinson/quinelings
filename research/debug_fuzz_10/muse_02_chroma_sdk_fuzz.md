# Muse 02 — Chroma / SDK Opcode Role Contract & Property-Based Fuzzing

Scope: `chroma.js`, `woven-body.js`, `lifeform-families.js`, `quinelingsSdk.js`, plus `lifeform-renderer.js`, `verify-chroma.cjs`, `motion.html`, `slideshow.html`. Method: read error, reproduced in Node, traced data flow, compared working vs broken opcode sets. No files changed; this is the diagnosis + fix/verification plan.

## Verdict

One non-canonical opcode, `window`, in one bench graph blanks both pages. Fix the graph (or promote `window` properly — see Decision); do not just add it to `ROLE_MAP`.

## 1. Root cause (Phase 1–2 evidence)

Reproduced deterministically:

```
node: Chroma.role('window')        → throw "Unknown chroma operation window"
node: Chroma.colorFor(shape,2)     → same throw (tideglass node s2)
node: Chroma.compile(shape)        → same throw
node: Kernels.validate(tideglass)  → throw "Invalid task graph" / "Unknown kernel window"
node: WovenBody.author(tideglass)  → OK, mechanism = lorenz-flow (not logarithmic-mantle)
node verify-chroma.cjs             → ok:true (9/9) — canonical programs are clean
```

| Layer | Canonical set | Has `window`? | Behaviour on `window` |
|---|---|---|---|
| [core.js OPS (41)](/home/charles/repos/quinelings/core.js:11) | `LEGACY_OPS` + `V1_OPS` | No | `instructionColor` throws |
| [kernels.js ARITY (24)](/home/charles/repos/quinelings/kernels.js:3) | legacy executable ops | No | `validate` throws `Unknown kernel` |
| [chroma.js ROLE_MAP / OPCODE_ACCENTS](/home/charles/repos/quinelings/chroma.js:12) | exactly the 41 OPS (verified: no missing, no extra, accents complete) | No | `role()` throws, fail-closed |
| [quinelingsSdk.js ROLE_MAP](/home/charles/sherlock-bench/src/engine/quinelingsSdk.js:463) | copy of the same 41 | No | same throw at `quinelingsSdk.js:474` |
| [quinelings-runtime.js ROLE_MAP](/home/charles/repos/quinelings/assets/ranch/quinelings-runtime.js:1419) | third copy of the same 41 | No | same throw |

Corrections to the initial hypothesis:

- `WovenBody.author` never inspects `op === 'window'`. In [woven-body.js `author`](/home/charles/repos/quinelings/woven-body.js:17) the mechanism is chosen from graph topology (`guards/effects/fanout/convergence/depth`), and `logarithmic-mantle` is only one `ADAPTERS` entry routed to [lifeform-families.js](/home/charles/repos/quinelings/lifeform-families.js:3). For `GRAPHS.tideglass` it returns `lorenz-flow`. The word "window" in `woven-body.js`/`lifeform-families.js` is the unrelated Lorenz orbit `dynamics.window` sample count — a naming collision that likely inspired the bench opcode.
- `window` has no kernel semantics anywhere: no `ARITY`, no `calculate` case, no Quint/Lean opcode. It is a bench-invented label, plausibly meaning "freshness window" in `tideglass` (`s0 → s2 window → reconcile`).

Blast radius — why the user saw nothing: [motion.html `buildChromaPalette`](/home/charles/sherlock-bench/motion.html:516) is called inside the top-level `SPECIMEN_LIST` literal (line 578, `mantle` entry) and [slideshow.html](/home/charles/sherlock-bench/slideshow.html:609) likewise, both *before* `resize()`/`resizeCanvas()` and `requestAnimationFrame`. One throw aborts the whole module script: canvas stays at the default 300×150, no RAF, 0 bright pixels. [lifeform-renderer.js `paletteFor`](/home/charles/repos/quinelings/lifeform-renderer.js:4) is the same single point of failure in-repo. Fail-closed `role()` is correct in principle; the defect is an unvalidated input graph reaching it at startup with no isolation.

## 2. Fix decision (pick one, in order)

| Option | Change | When |
|---|---|---|
| A — bench fix (recommended) | In both bench pages, rename `tideglass.s2` op `window` → an existing op matching intent: `evidenceFresh` (freshness window, role `decision`) or `select` (windowing/selection, role `process`). One line ×2 files. | `window` was only a visual label; no execution semantics needed. |
| B — promote `window` | Append-only across *all* layers: `core.js` OPS+COLORS (append, never insert — indices are color identities), `kernels.js` ARITY+`calculate` with defined windowing semantics, `chroma.js` + SDK + runtime `ROLE_MAP`+`OPCODE_ACCENTS`, Quint + Lean opcode sets, `verify-chroma.cjs`. | A real sliding-window kernel is actually wanted. Cost is ~8 files; a `ROLE_MAP`-only patch is forbidden — it would color an opcode nothing can execute. |

Also harden regardless of A/B: wrap each `buildChromaPalette`/`SPECIMEN_LIST` entry (and `paletteFor`) so one bad specimen degrades to neutral palette + console error instead of aborting module evaluation; move `resize()` + RAF start before palette construction. Keep `role()` throwing — silent fallback to a default role would hide the next typo (probe set below confirms near-misses like `Window`, `literal␣`, `observe` all correctly throw today, and `__proto__`/`constructor`/`toString` are safe via `Object.hasOwn`).

Drift risk: the Chroma block exists in 3 copies (`chroma.js`, `quinelingsSdk.js`, bundled runtime). Any opcode change must land in all three or be generated from one source; add the parity check in §3 so copies cannot silently diverge again.

## 3. Property-based fuzzing plan

Add `verify-chroma-fuzz.cjs` (fast-check or a seeded PRNG harness, ≥10k cases/seed, seeds logged). Generators: random op strings (canonical, case/whitespace mutations, synonyms — `window`, `slide`, `freshnessWindow` — prototype keys, empty/non-string), random graphs (0–64 nodes, duplicate ids, cycles, unknown inputs), random lens bindings/paths, strengths ∈ {0, 1, NaN, ±∞, out-of-range}.

Properties to assert on every case:

1. Contract totality: `∀ op ∈ OPS: role(op)` defined ∧ `OPCODE_ACCENTS` has `op` ∧ `instructionFromColor(instructionColor(op)) = op`; `∀ op ∉ OPS: role(op)` throws (fail-closed, incl. mutated/synonym/prototype inputs — the §1 probe list is the seed corpus).
2. Palette safety: for any graph accepted by `WovenBody.author` + `Chroma.compile/colorFor`, every color matches `/^#[0-9a-f]{6}$/`, is deterministic, frozen-input-safe, and order-invariant by node id (extends existing checks 2/4).
3. No total failure: fuzzed invalid graphs in a `SPECIMEN_LIST`-shaped harness leave `resize`/RAF-equivalent sentinels executed (validates the §2 isolation).
4. Cross-copy parity: `ROLE_MAP`/`OPCODE_ACCENTS` key sets extracted from all 3 Chroma copies are identical to `core.js` OPS. This one check would have caught the bug pre-merge if bench `GRAPHS` ops are also fed through it — so also assert every op literal in `motion.html`/`slideshow.html` `GRAPHS` ∈ OPS.

Existing [verify-chroma.cjs check 1](/home/charles/repos/quinelings/verify-chroma.cjs:9) already proves `OPS ⊆ ROLE_MAP` for canonical programs; the gap is bench graphs, SDK/runtime copies, accents, and adversarial op strings. That gap, not Chroma itself, is what fuzzing must close.

## 4. Quint specification

No Quint module covers Chroma today (`spec/*.qnt` has no chroma/opcode-role model; `woven-combinations.qnt` covers mechanisms only). Add a small `spec/chroma.qnt`:

- `pure val allOps`, `pure def roleOf(op)` mirroring `ROLE_MAP`; invariant `allOpsHaveRole ≜ allOps.forall(op ⇒ roleOf(op) ∈ Roles)` and `unknownOpRejected ≜ ∀ op ∉ allOps: roleOf` undefined — stated as Quint `pure def` + `run` tests (`chromaContractTest`), since Quint models the contract, not the JS throw.
- Action-level: model `buildPalette(graph)` as succeeding ⟺ every node op ∈ `allOps`, with a trace where `tideglass` with `window` is rejected and with `evidenceFresh`/`select` is accepted — the regression trace for this bug.
- Gate: `npx quint typecheck spec/chroma.qnt && npx quint test spec/chroma.qnt` in the same CI step as `verify-chroma.cjs`; keep opcode list single-sourced by generating the Quint `allOps` literal from `core.js` in a pre-test script, or assert parity in `verify-chroma-fuzz.cjs`.

## 5. BrowserStack / browser verification

- Local first (Playwright, already the discovery route): load both pages, assert no `pageerror`, canvas ≠ 300×150 after load, `brightPixels > 0` on a screenshot sample, RAF advancing (frame counter changes over 500 ms). Add `tideglass/mantle` specimen visibility as an explicit assertion, not just "no error".
- BrowserStack matrix (real rendering differences are the risk, not JS semantics): Chrome/Edge (Win), Firefox (Win), Safari (macOS + iOS), Chrome Android — at minimum latest + latest−1. Assert the same three signals via screenshot pixel sampling; WebGL path (`LifeformWebGL.available()`) must be exercised in both available/unavailable modes (Safari iOS is the likely divergence).
- CI order: `verify-chroma.cjs` → `verify-chroma-fuzz.cjs` → Quint typecheck/test → Playwright local → BrowserStack on release candidates only.

## Action checklist

1. Bench owner: apply Option A (or schedule Option B as a kernel feature) in `motion.html` + `slideshow.html`; isolate per-specimen palette failures; start RAF before palettes.
2. Root: add cross-copy parity + bench-graph op checks to `verify-chroma.cjs` (or the new fuzz file); land `spec/chroma.qnt`.
3. Root: run fuzz seeds + Quint + Playwright; attach BrowserStack run to the fix PR. Re-run `node verify-chroma.cjs` (currently 9/9 green) as the baseline that must stay green.
