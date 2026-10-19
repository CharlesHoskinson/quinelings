# Designer 4 Research Synthesis: Live Recursion Call-Tree Ribbon & Sculptural Value Stage

## 1. Research Sources (Web Search + Scrapling)
- **VisuAlgo Recursion Tree & DAG Module (`https://visualgo.net/en/recursion`)**:
  - Animates depth-first recursion by distinguishing four explicit visual states on every call-tree vertex:
    1. **Active / Executing Call** (highlighted in warm orange/ember as it enters the call stack or evaluates).
    2. **Waiting Parent Calls on the Stack** (suspended vertices along the active ancestor spine waiting for their child subproblem to return).
    3. **Base-Case / Resolved Calls** (leaf and completed subproblem vertices colored in crisp emerald green, with explicit return values annotated directly on the return edge).
    4. **Unvisited / Future Calls** (muted neutral silhouette).
  - Emphasizes the two-phase temporal rhythm of recursion: **Winding / Unfolding (Going Down)** as recursive calls push frames onto the stack toward a base case, and **Unwinding / Folding (Coming Up)** as base cases resolve and bubble return values sequentially back up to waiting parents.
- **Recursion Tree Visualizers (`https://recursion.vercel.app/`, Call-Stack Trace Trees)**:
  - Linear recursion (e.g., `fact(4) -> fact(3) -> fact(2) -> fact(1) -> fact(0)` or `sum_list`) forms a clean sequential call chain where each node records both its **invocation signature** (`fact(3)`) and, once resolved, its **returned value** (`=> 6`).
  - Tree recursion (e.g., `sum_tree(Branch(L, R))`) branches into left and right recursive invocations that resolve sequentially in depth-first order.
  - Pairing a high-level **Recursion Equation Banner** (`UNFOLDING: fact(4) → fact(3) → ...` vs. `UNWINDING: 1 → 2 → 6 → 24`) with the call-node chain makes the mathematical reduction immediately legible at a glance.

## 2. Borrowed Principles Applied to Wave 2 `designer4_arena.js`

### A. The Live Recursion Call-Chain / Call-Tree Arc (`y ∈ [0.88, 1.32]`, `z ≈ -0.35`)
1. **7-Capsule Horizontal Arch**:
   - Up to 7 sleek, precision-machined Call-Node Capsules arranged along a gentle elevated arch (`x ∈ [-0.88, 0.88]`, `y ∈ [0.92, 1.16]`, `z ≈ -0.35`) above the recursion well aperture, connected by hairline directional light-bridges with animated signal beads.
2. **Tri-State Visual Encoding (VisuAlgo-inspired, Apple Silicon palette)**:
   - **Waiting Parent Calls (on stack)**: Champagne gold rim (`PALETTE.gold` / `#d4a24c`) with a calm sinusoidal breathing pulse, showing the suspended call signature (`fact(4) · wait`).
   - **Currently Executing Call (deepest active call)**: Warm ember-orange core (`PALETTE.heatBright` / `#e86446`) with an active downward laser pointer (`y` down toward the well aperture at `y = 0.08`) linking the call node to the active evaluation inside the well.
   - **Base Case / Resolved Calls (already returned)**: Crisp emerald (`PALETTE.resolveBright` / `#45937a`) with an upward return arrow indicator (`↑`) and the resolved return value (`=> 1`, `=> 2`, `=> 6`, `=> 24`).
3. **Floating Live Recursion Equation Header Plaque (`y ≈ 1.28`, `z ≈ -0.35`)**:
   - Single high-DPI floating plaque above the arch displaying the live recursion equation:
     - During descent (`DESCEND`): `UNFOLDING: fact(4) → fact(3) → fact(2) ...`
     - During unwind (`RESOLVE` / `RETURN` / `EMBLEM`): `UNWINDING: 1 → 2 → 6 → 24`
     - During fault (`ERROR`): `FAULT AT DEPTH: Error(4) / Fuel = 0`

### B. Ultra-Clean Sculptural Value Focus (`y ∈ [0.32, 0.78]`, `z ≈ 0.15`)
- Replaces the cluttered Wave 1 12-wafer ROM cage, 12 vertical laser beams, and 3 nested gimbal rings with **one jewel-like, Apple-clean 3D value sculpture** for `stepState.step.focusValue`:
  - **`UInt`**: Single precision-faceted glass-and-gold octahedron with one calm equatorial ring and a crisp floating value badge (`24`).
  - **`Bool`**: Sleek two-tone optical lens disc (`true` emerald / `false` amber-coral) with a precision titanium bezel.
  - **`List`**: Clean horizontal chain of up to 5 smooth rounded capsules (`[5] → [8] → [3] → nil`) joined by gold micro-bridges.
  - **`Tree`**: Clean, symmetric 3D binary tree of smooth spheres (`Branch`) and octahedra (`Leaf`) with crisp connecting rods.
  - **`Error`**: Clean crimson warning octahedron (`PALETTE.errorRed`) with a single crisp error badge (`Error(4): StackLimit`, `Error(10): Overflow`, `Fuel = 0`).
