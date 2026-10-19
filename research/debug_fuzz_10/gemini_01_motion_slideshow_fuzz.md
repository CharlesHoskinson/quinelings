# Gemini Debugging & Fuzzing Agent 1 Report: `motion.html` & `slideshow.html` Runtime & Fuzz Audit

## 1. Operation-by-Operation Audit: `GRAPHS` vs. `Chroma.ROLE_MAP` & `WovenBody.author`

### 1.1 `Chroma.ROLE_MAP` & `OPCODE_ACCENTS` (`src/engine/quinelingsSdk.js:463-466, 538-541`)
`Chroma.role(op)` (`quinelingsSdk.js:474`) throws `Error('Unknown chroma operation ' + op)` for any operation not present in `ROLE_MAP`:
- **Orbit ops (10)**: `Observe`, `Box`, `Permit`, `Apply`, `Score`, `Authorize`, `Execute`, `Quote`, `Decode`, `Report`
- **Kernel ops (24)**: `literal`, `sum`, `mean`, `min`, `max`, `weightedMean`, `length`, `map`, `sort`, `dedupe`, `filter`, `compare`, `choose`, `get`, `clamp`, `budget`, `action`, `report`, `bfs`, `allocate`, `schedule`, `consensus`, `retry`, `evidence`
- **QDL v1 ops (7)**: `input`, `arithmetic`, `compareValues`, `all`, `select`, `evidenceFresh`, `reconcile`

### 1.2 Audit of `GRAPHS` in `motion.html:459-509` and `slideshow.html:474-524`

| Graph Key | Target Specimen | Declared Nodes & Ops | `Chroma.role(op)` Status | `WovenBody.author(graph, 42)` Actual vs. Expected Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| `terminal` | `toroidal` | `g: literal`, `a: literal`, `effect: action` | All valid (`input`, `action`) | `'toroidal-weave'` (matches expected) |
| `threadwing` | `clifford` (& `lorenz` override) | `n0: literal`, `n1: literal`, `n2: filter`, `n3: consensus`, `n4: action` | All valid (`input`, `process`, `decision`, `action`) | `'clifford-flow'` (matches expected; `lorenz` explicitly overrides `mechanism: 'lorenz-flow'`) |
| `fork` | `julia` (& `affine` override) | `a: literal`, `b: sum`, `c: sum`, `d: sum` | All valid (`input`, `process`) | `'recursive-julia'` (matches expected; `affine` explicitly overrides `mechanism: 'recursive-affine'`) |
| `tideglass` | `mantle` | `s0: literal`, `s1: map`, **`s2: window`**, `s3: reconcile`, `s4: report` | **CRASHES on `s2: window`** (`Error: Unknown chroma operation window`) | **BUG**: Authors `'lorenz-flow'` instead of `'logarithmic-mantle'` because `s3` has `op: 'reconcile'` (`hasCoupled = true`) and `s0` has `fanout = 2`! |
| `braidGraph` | `braid` | `n0: literal`, `n1: sort`, `n2: dedupe`, `n3: select`, `n4: report` | All valid (`input`, `process`, `report`) | `'pleated-braid'` (matches expected) |
| `linear` | `phyllotaxis` | `a: literal`, `b: sum(['a'])`, `c: report(['a', 'b'])` | All valid (`input`, `process`, `report`) | **BUG**: Authors `'recursive-julia'` instead of `'phyllotaxis-fan'` because `c` lists `'a'` in `inputs`, giving `'a'` `fanout = 2`! |

### 1.3 Exact Fix for `GRAPHS.tideglass` and `GRAPHS.linear` (in both `motion.html` and `slideshow.html`)
```js
        tideglass: {
          nodes: [
            { id: 's0', op: 'literal', inputs: [] },
            { id: 's1', op: 'literal', inputs: [] },
            { id: 's2', op: 'map', inputs: ['s0'] },
            { id: 's3', op: 'mean', inputs: ['s1'] },
            { id: 's4', op: 'report', inputs: ['s2', 's3'] },
          ],
        },
        linear: {
          nodes: [
            { id: 'a', op: 'literal', inputs: [] },
            { id: 'b', op: 'sum', inputs: ['a'] },
            { id: 'c', op: 'report', inputs: ['b'] },
          ],
        },
```

## 2. Scene, Slide, Scrubbing & Resize Runtime Audit

1. **Initialization Order**:
   - Call `resize()` / `resizeCanvas()` before `GRAPHS` / `buildChromaPalette` and wrap `buildChromaPalette` in a fail-soft fallback so `<canvas>` is always full-viewport even if an external graph contains a custom opcode.
2. **Scene Transitions & Scrubbing (`[0..5399]`) in `motion.html`**:
   - Ensure `frame = 0` (`localT = 0`) in Scene 1 renders the embryonic seed organism and kinetic typography with non-zero initial opacity (`opacity = 0.72 + 0.28 * localT`, `enter >= 0.35`) so `brightPixels > 500` holds at every single frame `[0..5399]`.
3. **Slide Transitions (`SLIDES` 1..12) & Controls in `slideshow.html`**:
   - Always pass `crests: true` inside `getInterpolated` when populating phase ring buckets so toggling `#toggleCausticsBtn` off and back on never loses ridges.
   - Read `r.owner ?? r.line?.[Math.floor(r.line.length / 2)]?.owner ?? (rIdx % nPal)` for per-ridge territory ownership colors.
