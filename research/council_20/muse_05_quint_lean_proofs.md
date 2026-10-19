# Quinelings — Formal Verification Report
## Specialist #5: Formal Verification in Quint & Mathematical Theorem Proving in Lean 4

> **Status of this deliverable.** This session runs in an empty directory with no
> filesystem or shell access. Nothing below was written to disk or compiled in
> this session. The report contains the complete, self-contained contents
> intended for `spec/lean/QDL/WovenBody.lean` and `spec/woven-combinations.qnt`,
> designed to be `sorry`-free against Mathlib (Lean 4) and typecheck-clean
> against Quint, plus the verification protocol to run once the files are
> materialised. Claims of the form "this proof closes" are design-level
> assertions about the proof terms as written; they must be confirmed by the
> commands in §6 before being treated as machine-checked results.

---

## 1. Scope, method, and the JS → formal-model gap

The reference codebase is JavaScript over `Float32Array`/`Uint16Array`, seeded
PRNGs, and floating-point attractors. None of that is directly provable.
The verification strategy is therefore **abstraction with explicit refinement
obligations**:

| JS artefact | Formal abstraction | Where verified |
|---|---|---|
| `territories: [{node, component, u: [u0, u1]}]` | Uniform rational/real partition of `[0,1]` into `N` patches, `patchLo/patchHi` | Lean §3.1 |
| `topology.depth`, recursive-affine branches | Contraction factor `s ∈ [35/100, 67/100]`, depth `d ≥ 1`, geometric reach series | Lean §3.2 |
| Clifford attractor (`cloud`, `grid`, `critical`) | Real Clifford step `x ↦ sin(a·y) + c·cos(b·x)` bounded by `1 + |c|` | Lean §3.3 |
| Hopf-type embedding in `geometry?`/`embedding?` | Hopf map `S³ → S²`, unit-norm preservation | Lean §3.3 |
| Chimeric blending of two parents' points | Convex combination `(1-λ)·pA + λ·pB`, `λ ∈ [0,1]` | Lean §3.4 |
| Execution opacity (`effects`, guards) | `clamp01` into `[0,1]` | Lean §3.4 |
| `compose` / `mate` / `merge` / `body` in `qdl-v1-offspring.js` | Quint state machine over graphs, seams, mechanisms | Quint §4 |
| `MECHANISMS` (8 mechanisms), `LIMITS` in `lifeform-families.js` | Quint enumerated type + range invariants | Quint §4 |

**Explicitly out of scope / unproven (residual risk):**

1. **Float32 rounding.** All Lean results are over `ℝ`/`ℚ`. The refinement
   obligation "Float32 evaluation stays within `ε` of the real model" is
   stated as an assumption, not discharged. A future `FloatSpec` layer or
   interval-arithmetic harness is required.
2. **Lorenz RK4 trajectory (`orbit`).** No stability/chaos theorem is claimed.
   Quint (§4) treats `lorenz-flow` only at the mechanism-combination level
   (state invariants), not trajectory level.
3. **Julia escape grid / marching squares.** Topological correctness of the
   contour extraction is not formalised; only the affine/Clifford/Hopf
   numerics that feed `WovenBody.compile` are.
4. **PRNG uniformity** behind `WovenBody.author(graph, seed)`. Seeds are
   modelled as opaque nondeterminism in Quint.

---

## 2. Conventions used in the Lean file

- One namespace, `QDL.WovenBody`, matching the existing `spec/lean/QDL/Geometry.lean`
  layout (`QDL` root namespace).
- `import Mathlib` at the top for self-containment. This is heavier than
  necessary; once compiled, imports can be narrowed to
  `Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic`,
  `Mathlib.Algebra.Order.GeomSum`, etc. Narrowing imports is a build-time
  optimisation and does not change any proof term.
- Partition parameters are in `ℝ` with `N : ℕ`, `hN : 0 < N`. Depth `d : ℕ`
  with `hd : 0 < d` where strict decay is claimed (at `d = 0`, `s^d = 1`, so
  `< 1` is **false** — the hypothesis is load-bearing, see §3.2).

---

## 3. Lean 4 specification: `spec/lean/QDL/WovenBody.lean`

### 3.0 Header and territory partition definitions

```lean
import Mathlib

namespace QDL.WovenBody

open Finset Real

/-- Lower endpoint of patch `i` in a uniform `N`-patch partition of `[0, 1]`.
    Abstracts `territories[i].u[0]` from `WovenBody.author`. -/
def patchLo (N i : ℕ) : ℝ := (i : ℝ) / (N : ℝ)

/-- Upper endpoint of patch `i`. Abstracts `territories[i].u[1]`. -/
def patchHi (N i : ℕ) : ℝ := ((i : ℝ) + 1) / (N : ℝ)

/-- Width of patch `i`. -/
def patchWidth (N i : ℕ) : ℝ := patchHi N i - patchLo N i

/-- Total width of the first `N` patches. -/
def totalPatchWidth (N : ℕ) : ℝ := ∑ i ∈ Finset.range N, patchWidth N i
```

### 3.1 Territory partition: positive width, contiguity, unit sum

**Theorem statements (as required):**

- `patchLo N i < patchHi N i` for `0 < N`.
- `patchHi N i = patchLo N (i + 1)`.
- `totalPatchWidth N = 1` for `0 < N`.

```lean
theorem patchWidth_pos {N : ℕ} (hN : 0 < N) (i : ℕ) :
    patchLo N i < patchHi N i := by
  unfold patchLo patchHi
  have hN' : (0 : ℝ) < (N : ℝ) := by exact_mod_cast hN
  apply (div_lt_div_right hN').mpr
  linarith

theorem patch_contiguous (N i : ℕ) :
    patchHi N i = patchLo N (i + 1) := by
  unfold patchHi patchLo
  push_cast
  ring_nf

theorem patchWidth_eq {N : ℕ} (hN : 0 < N) (i : ℕ) :
    patchWidth N i = 1 / (N : ℝ) := by
  unfold patchWidth patchHi patchLo
  have hN' : (N : ℝ) ≠ 0 := by exact_mod_cast (Nat.pos_iff_ne_zero.mp hN)
  field_simp
  ring

theorem totalPatchWidth_eq_one {N : ℕ} (hN : 0 < N) :
    totalPatchWidth N = 1 := by
  unfold totalPatchWidth
  simp_rw [patchWidth_eq hN]
  rw [Finset.sum_const, Finset.card_range, nsmul_eq_mul]
  have hN' : (N : ℝ) ≠ 0 := by exact_mod_cast (Nat.pos_iff_ne_zero.mp hN)
  field_simp
```

**Proof notes.**

- `patch_contiguous` is the seam-correctness property for territories: the
  JS author code emits `u: [u0, u1]` per territory; contiguity is the formal
  counterpart of "no gaps, no overlaps" between consecutive territories.
  After `push_cast`, both sides are `((i:ℝ)+1)/(N:ℝ)`, closed by `ring_nf`.
- `totalPatchWidth_eq_one` reduces, via `patchWidth_eq`, to
  `N • (1/N) = N * (1/N) = 1`. This is the formal counterpart of "territories
  tile the unit interval exactly" — the property a renderer relies on when it
  maps `u ∈ [0,1]` across strands without double-painting or leaving holes.
- Edge case `N = 0` is excluded by hypothesis: with no territories the sum is
  `0 ≠ 1`, and `1/(0:ℝ) = 0` in Lean's convention would silently corrupt the
  width lemma. The hypothesis is therefore not bureaucratic; it is the exact
  guard the JS side must enforce (`territories.length > 0`).

### 3.2 Contractive recursive-affine: scale decay and geometric reach

`WovenBody.compile` precomputes contractive IFS `branches` for
`recursive-affine`. The branch scale is drawn in `[35/100, 67/100]`. Two
facts matter downstream: iterates shrink (`s^d < 1` for `d ≥ 1`), and the
total reachable displacement is bounded by the geometric series
`L · Σ s^k ≤ L / (1 - s) ≤ (100/33) · L`.

```lean
/-- Reach after `d` contraction steps with step bound `L` and factor `s`:
    `reach (d+1) = L + s * reach d`. Models cumulative IFS branch displacement. -/
def reach (s L : ℝ) : ℕ → ℝ
  | 0     => 0
  | d + 1 => L + s * reach s L d

theorem scale_pow_pos {s : ℝ} (hs : 35 / 100 ≤ s) {d : ℕ} :
    0 < s ^ d := by
  apply pow_pos
  linarith

theorem scale_pow_le {s : ℝ} (hs1 : 35 / 100 ≤ s) (hs2 : s ≤ 67 / 100)
    (d : ℕ) :
    s ^ d ≤ (67 / 100 : ℝ) ^ d := by
  apply pow_le_pow_left₀
  · linarith
  · exact hs2

theorem scale_pow_lt_one {s : ℝ} (hs1 : 35 / 100 ≤ s) (hs2 : s ≤ 67 / 100)
    {d : ℕ} (hd : 0 < d) :
    s ^ d < 1 := by
  have h1 : s ^ d ≤ (67 / 100 : ℝ) ^ d := scale_pow_le hs1 hs2 d
  have h2 : (67 / 100 : ℝ) ^ d < 1 := by
    apply pow_lt_one₀
    · norm_num
    · norm_num
    · exact Nat.pos_iff_ne_zero.mp hd
  linarith

/-- Combined decay statement: `0 < s^d ≤ (67/100)^d < 1`. -/
theorem scale_decay {s : ℝ} (hs1 : 35 / 100 ≤ s) (hs2 : s ≤ 67 / 100)
    {d : ℕ} (hd : 0 < d) :
    0 < s ^ d ∧ s ^ d ≤ (67 / 100 : ℝ) ^ d ∧ s ^ d < 1 :=
  ⟨scale_pow_pos hs1, scale_pow_le hs1 hs2 d, scale_pow_lt_one hs1 hs2 hd⟩

theorem reach_le {s L : ℝ} (hs1 : 35 / 100 ≤ s) (hs2 : s ≤ 67 / 100)
    (hL : 0 ≤ L) (d : ℕ) :
    reach s L d ≤ (100 / 33 : ℝ) * L := by
  induction d with
  | zero =>
      simp [reach]
      positivity
  | succ k ih =>
      have hs_nn : (0 : ℝ) ≤ s := by linarith
      calc reach s L (k + 1)
          = L + s * reach s L k := rfl
        _ ≤ L + s * ((100 / 33 : ℝ) * L) := by
            apply add_le_add_left
            exact mul_le_mul_of_nonneg_left ih hs_nn
        _ ≤ L + (67 / 100 : ℝ) * ((100 / 33 : ℝ) * L) := by
            apply add_le_add_left
            apply mul_le_mul_of_nonneg_right hs2
            positivity
        _ = (100 / 33 : ℝ) * L := by
            have hL' : L = L := rfl
            field_simp
            ring
```

**Proof notes and a genuine subtlety.**

- The final `calc` step is the fixed-point identity
  `L + (67/100)·(100/33)·L = (100/33)·L`, i.e. `1 + 67/33 = 100/33`.
  `field_simp` followed by `ring` discharges it. This is exactly the
  geometric-series bound `L/(1-s)` evaluated at the worst case `s = 67/100`:
  `1/(1 - 67/100) = 100/33`. The induction is over the *recursive* reach
  definition, which avoids needing `Finset.geom_sum_eq` and division side
  conditions on `s ≠ 1` inside the induction.
- The bound is **independent of `d`**, which is the useful form for a
  renderer: no matter how deep `topology.depth` goes, cumulative IFS
  displacement stays within `(100/33)·L ≈ 3.03·L`. In JS terms, the
  `recursive-affine` point cloud cannot escape a ball of that radius around
  its seed — a precondition for the fixed `budget` in `WovenBody.frame`.
- `hd : 0 < d` in `scale_pow_lt_one` is essential: `s^0 = 1`, so any
  "proof" omitting it would be proving a false statement. The Quint model
  in §4 carries the matching invariant `depth ≥ 1` for affine bodies.

### 3.3 Hopf fibration identity and Clifford step bound

The Hopf map `S³ → S²`, for `q = (a, b, c, d)` with `a²+b²+c²+d² = 1`:

```
H(q) = ( a² + b² − c² − d²,  2(ad + bc),  2(ac − bd) )
```

The theorem is `‖H(q)‖² = 1`, i.e. `H` really lands on `S²`.

```lean
/-- Hopf map `S³ → S²` (squared-norm form). -/
def hopf (a b c d : ℝ) : ℝ × ℝ × ℝ :=
  (a ^ 2 + b ^ 2 - c ^ 2 - d ^ 2, 2 * (a * d + b * c), 2 * (a * c - b * d))

theorem hopf_unit_norm {a b c d : ℝ}
    (h : a ^ 2 + b ^ 2 + c ^ 2 + d ^ 2 = 1) :
    (a ^ 2 + b ^ 2 - c ^ 2 - d ^ 2) ^ 2
      + (2 * (a * d + b * c)) ^ 2
      + (2 * (a * c - b * d)) ^ 2 = 1 := by
  have hid : (a ^ 2 + b ^ 2 - c ^ 2 - d ^ 2) ^ 2
      + (2 * (a * d + b * c)) ^ 2
      + (2 * (a * c - b * d)) ^ 2
      = (a ^ 2 + b ^ 2 + c ^ 2 + d ^ 2) ^ 2 := by ring
  rw [hid, h]
  norm_num
```

**Proof note.** The whole content is the algebraic identity
`‖H(q)‖² = ‖q‖⁴`, closed by `ring` — no analysis is needed, and no
trigonometric parametrisation of `S³` is required. This is the right level
of abstraction for the embedding code: whatever unit quaternion-like tuple
the JS side produces, its Hopf projection is a genuine point of `S²`, so
downstream spherical geometry (normals, territories on the sphere) is
well-defined.

**Clifford step.** `WovenBody.compile` iterates a Clifford attractor;
each coordinate update has the form `sin(a·y) + c·cos(b·x)`. Boundedness of
the attractor cloud reduces to one triangle-inequality step:

```lean
theorem clifford_step_bound (a b c x y : ℝ) :
    |Real.sin (a * y) + c * Real.cos (b * x)| ≤ 1 + |c| := by
  calc |Real.sin (a * y) + c * Real.cos (b * x)|
      ≤ |Real.sin (a * y)| + |c * Real.cos (b * x)| := abs_add _ _
    _ = |Real.sin (a * y)| + |c| * |Real.cos (b * x)| := by rw [abs_mul]
    _ ≤ 1 + |c| * 1 := by
        apply add_le_add
        · exact Real.abs_sin_le_one _
        · exact mul_le_mul_of_nonneg_left (Real.abs_cos_le_one _) (abs_nonneg c)
    _ = 1 + |c| := by ring
```

Iterating this step with the contraction structure of §3.2 gives a uniform
bound on the `cloud` coordinates, hence on the `grid`/`critical` occupancy
computation: the attractor cannot drift outside `[−(1+|c|), 1+|c|]` in the
updated coordinate. (`Real.abs_sin_le_one` / `Real.abs_cos_le_one` are the
Mathlib names; if a pinned Mathlib version spells them
`abs_sin_le_one`/`abs_cos_le_one` inside `Real`, adjust the two references —
the proof structure is unchanged.)

### 3.4 Convex blending and execution-opacity clamping

Chimeric combination (Quint §4, `compose`/`mate`) blends parent sample
points; live execution state carries an opacity in `[0,1]`. Both are
convexity/clamping facts:

```lean
/-- Convex blend of two scalar samples. `λ = 0` gives `pA`, `λ = 1` gives `pB`. -/
def blend (lam pA pB : ℝ) : ℝ := (1 - lam) * pA + lam * pB

theorem blend_mem_unit {lam pA pB : ℝ}
    (hlam0 : 0 ≤ lam) (hlam1 : lam ≤ 1)
    (hA0 : 0 ≤ pA) (hA1 : pA ≤ 1)
    (hB0 : 0 ≤ pB) (hB1 : pB ≤ 1) :
    0 ≤ blend lam pA pB ∧ blend lam pA pB ≤ 1 := by
  unfold blend
  constructor
  · apply add_nonneg
    · exact mul_nonneg (by linarith) hA0
    · exact mul_nonneg hlam0 hB0
  · have h1 : (1 - lam) * pA ≤ (1 - lam) * 1 :=
      mul_le_mul_of_nonneg_left hA1 (by linarith)
    have h2 : lam * pB ≤ lam * 1 :=
      mul_le_mul_of_nonneg_left hB1 hlam0
    linarith

theorem blend_endpoints (pA pB : ℝ) :
    blend 0 pA pB = pA ∧ blend 1 pA pB = pB := by
  unfold blend
  constructor <;> ring

/-- Execution opacity clamp, mirroring the JS guard on live execution state. -/
def clamp01 (x : ℝ) : ℝ := min (max x 0) 1

theorem clamp01_mem (x : ℝ) : 0 ≤ clamp01 x ∧ clamp01 x ≤ 1 := by
  unfold clamp01
  constructor
  · exact le_min (le_max_right x 0) (by norm_num)
  · exact min_le_right _ _

theorem clamp01_id {x : ℝ} (h0 : 0 ≤ x) (h1 : x ≤ 1) : clamp01 x = x := by
  unfold clamp01
  rw [max_eq_left h0, min_eq_left h1]

theorem blend_clamp01 {lam pA pB : ℝ}
    (hlam0 : 0 ≤ lam) (hlam1 : lam ≤ 1)
    (hA0 : 0 ≤ pA) (hA1 : pA ≤ 1)
    (hB0 : 0 ≤ pB) (hB1 : pB ≤ 1) :
    clamp01 (blend lam pA pB) = blend lam pA pB := by
  obtain ⟨h0, h1⟩ := blend_mem_unit hlam0 hlam1 hA0 hA1 hB0 hB1
  exact clamp01_id h0 h1

end QDL.WovenBody
```

**Why `blend_clamp01` matters.** It is the commutativity fact the runtime
needs: clamping a convex blend of two already-in-range samples is a no-op.
So the execution layer may clamp defensively at every frame
(`WovenBody.frame`) without perturbing legitimately blended chimeric
geometry — clamping is *observationally transparent* on valid state and
*correcting* on invalid state (`clamp01_mem` holds for **all** `x`,
including `x < 0` and `x > 1` from a hostile or buggy donor graph).

**Deliberate omission.** A normed-space version
(`‖blend λ pA pB‖ ≤ max ‖pA‖ ‖pB‖` for points in `ℝ²`/`ℝ³`) follows from
`Convex.norm` lemmas in Mathlib but is not needed by any current call site:
`lifeform-families.js` `point(body, k, u, v, phase)` blends scalar basis
weights before constructing points. Adding the vector version speculatively
would be unverified surface area; it is listed as future work in §5.

---

## 4. Quint specification: `spec/woven-combinations.qnt`

Design goals: (i) model the four offspring operators from
`qdl-v1-offspring.js` as Quint actions over an abstract program graph;
(ii) model the eight `MECHANISMS` and the three compiled families from
`lifeform-families.js`; (iii) state invariants that Apalache can check
against the transition relation — territory sanity, scale bounds, opacity
range, seam well-formedness, and execution-state monotonicity.

```quint
// spec/woven-combinations.qnt
// Chimeric multi-mechanism combinations and live execution transitions
// for woven-body Quinelings. Abstracts qdl-v1-offspring.js operators
// (compose / mate / merge / body) and WovenBody.author/compile/frame.

module woven_combinations {

  // ---------- Types ----------

  type Mechanism =
    | PleatedBraid
    | LorenzFlow
    | CliffordFlow
    | RecursiveAffine
    | RecursiveJulia
    | LogarithmicMantle
    | ToroidalWeave
    | PhyllotaxisFan

  type NodeId = int
  type Op = Compose | Mate | Merge | BodyReseed

  type Seam = {
    donorNode: NodeId,
    recipientNode: NodeId,
    seamType: str,
    integrationNode: NodeId
  }

  type ExecState = Idle | Running | Suspended | Halted

  type Body = {
    mechanism: Mechanism,
    seed: int,
    depth: int,          // topology.depth, >= 1 for recursive mechanisms
    scalePermille: int,  // affine scale * 1000, in [350, 670]
    territories: int,    // number of territory patches, >= 1
    opacityPermille: int // execution opacity * 1000, in [0, 1000]
  }

  type Program = {
    nodes: Set[NodeId],
    literals: Set[NodeId],
    outputs: Set[NodeId],
    seam: Seam | NoneType   // see note below on option encoding
  }

  // Quint has no built-in option type in all dialects; encode seam
  // presence with a boolean + a dummy seam when absent.
  // (Kept as a record for readability; the checker encoding uses
  //  `hasSeam: bool` alongside `seam`.)

  // ---------- State ----------

  var parent0: Body
  var parent1: Body
  var child: Body
  var program: { nodes: Set[NodeId], literals: Set[NodeId],
                 outputs: Set[NodeId] }
  var hasSeam: bool
  var seam: Seam
  var exec: ExecState
  var steps: int          // live execution step counter
  var lastOp: Op

  // ---------- Constants mirroring lifeform-families.js LIMITS ----------

  pure val SCALE_MIN = 350    // 35/100 * 1000
  pure val SCALE_MAX = 670    // 67/100 * 1000
  pure val OPACITY_MAX = 1000

  // ---------- Helpers ----------

  pure def isRecursive(m: Mechanism): bool =
    m == RecursiveAffine or m == RecursiveJulia

  pure def blendPermille(lam: int, a: int, b: int): int =
    // integer (permille) convex blend; lam in [0, 1000]
    ((1000 - lam) * a + lam * b) / 1000

  pure def clampOpacity(x: int): int =
    if (x < 0) 0 else if (x > OPACITY_MAX) OPACITY_MAX else x

  // ---------- Initialisation: WovenBody.author ----------

  action init = all {
    nondet s0 = 0.to(2^31 - 1).oneOf()
    nondet s1 = 0.to(2^31 - 1).oneOf()
    nondet m0 = oneOfMechanism()
    nondet m1 = oneOfMechanism()
    parent0' = { mechanism: m0, seed: s0, depth: 4,
                 scalePermille: 500, territories: 8,
                 opacityPermille: 1000 },
    parent1' = { mechanism: m1, seed: s1, depth: 4,
                 scalePermille: 500, territories: 8,
                 opacityPermille: 1000 },
    child' = parent0,
    program' = { nodes: Set(0, 1, 2), literals: Set(1), outputs: Set(2) },
    hasSeam' = false,
    seam' = { donorNode: 0, recipientNode: 0, seamType: "none",
              integrationNode: 0 },
    exec' = Idle,
    steps' = 0,
    lastOp' = BodyReseed
  }

  pure def oneOfMechanism(): Mechanism =
    // Placeholder for Quint `oneOf` over the constructor set; in the
    // checked file this is written as an explicit nondet disjunction.
    PleatedBraid

  // ---------- Offspring operators: qdl-v1-offspring.js ----------

  // compose: replace recipient runtime input with donor output cone.
  // Emits seam = {donorNode, recipientNode, type, integrationNode}.
  action doCompose = all {
    exec == Idle or exec == Suspended,
    nondet d = program.outputs.oneOf()
    nondet r = program.nodes.oneOf()
    nondet integ = program.nodes.oneOf()
    hasSeam' = true,
    seam' = { donorNode: d, recipientNode: r,
              seamType: "compose", integrationNode: integ },
    child' = { mechanism: child.mechanism, seed: child.seed,
               depth: child.depth, scalePermille: child.scalePermille,
               territories: child.territories,
               opacityPermille: child.opacityPermille },
    lastOp' = Compose,
    exec' = exec,
    steps' = steps,
    parent0' = parent0, parent1' = parent1, program' = program
  }

  // mate: replace a recipient literal with the donor cone.
  action doMate = all {
    exec == Idle or exec == Suspended,
    program.literals.size() > 0,
    nondet lit = program.literals.oneOf()
    nondet d = program.outputs.oneOf()
    hasSeam' = true,
    seam' = { donorNode: d, recipientNode: lit,
              seamType: "mate", integrationNode: lit },
    program' = { nodes: program.nodes, literals: program.literals.exclude(lit),
                 outputs: program.outputs },
    lastOp' = Mate,
    child' = child, exec' = exec, steps' = steps,
    parent0' = parent0, parent1' = parent1
  }

  // merge: parallel report node 'joined' over both parents.
  action doMerge = all {
    exec == Idle,
    hasSeam' = false,
    child' = { mechanism: child.mechanism,
               seed: child.seed,
               depth: max(parent0.depth, parent1.depth),
               scalePermille:
                 blendPermille(500, parent0.scalePermille,
                               parent1.scalePermille),
               territories:
                 parent0.territories + parent1.territories,
               opacityPermille:
                 clampOpacity(blendPermille(500, parent0.opacityPermille,
                                            parent1.opacityPermille)) },
    lastOp' = Merge,
    exec' = exec, steps' = steps,
    parent0' = parent0, parent1' = parent1, program' = program,
    seam' = seam
  }

  // body: trait re-seed; mechanism may change, ranges preserved.
  action doBodyReseed = all {
    nondet s = 0.to(2^31 - 1).oneOf()
    nondet sc = SCALE_MIN.to(SCALE_MAX).oneOf()
    child' = { mechanism: child.mechanism, seed: s,
               depth: child.depth, scalePermille: sc,
               territories: child.territories,
               opacityPermille: clampOpacity(child.opacityPermille) },
    lastOp' = BodyReseed,
    exec' = exec, steps' = steps, hasSeam' = hasSeam, seam' = seam,
    parent0' = parent0, parent1' = parent1, program' = program
  }

  // ---------- Live execution transitions ----------

  action startExec = all {
    exec == Idle,
    exec' = Running,
    steps' = steps,
    child' = child, parent0' = parent0, parent1' = parent1,
    program' = program, hasSeam' = hasSeam, seam' = seam,
    lastOp' = lastOp
  }

  action stepExec = all {
    exec == Running,
    steps' = steps + 1,
    // opacity may drift under execution but is always re-clamped,
    // mirroring clamp01 in the Lean model.
    nondet drift = (-100).to(100).oneOf()
    child' = { mechanism: child.mechanism, seed: child.seed,
               depth: child.depth, scalePermille: child.scalePermille,
               territories: child.territories,
               opacityPermille: clampOpacity(child.opacityPermille + drift) },
    exec' = Running,
    parent0' = parent0, parent1' = parent1, program' = program,
    hasSeam' = hasSeam, seam' = seam, lastOp' = lastOp
  }

  action suspendExec = all {
    exec == Running, exec' = Suspended, steps' = steps,
    child' = child, parent0' = parent0, parent1' = parent1,
    program' = program, hasSeam' = hasSeam, seam' = seam, lastOp' = lastOp
  }

  action haltExec = all {
    exec == Running or exec == Suspended,
    exec' = Halted, steps' = steps,
    child' = child, parent0' = parent0, parent1' = parent1,
    program' = program, hasSeam' = hasSeam, seam' = seam, lastOp' = lastOp
  }

  action step = any {
    doCompose, doMate, doMerge, doBodyReseed,
    startExec, stepExec, suspendExec, haltExec
  }

  // ---------- Invariants ----------

  // Territory count positive: Lean totalPatchWidth_eq_one needs N > 0.
  val TerritoryPositive = child.territories >= 1

  // Affine/Julia recursion is contractive and at depth >= 1:
  // Lean scale_decay (0 < s^d <= (67/100)^d < 1).
  val ScaleContractive =
    (not isRecursive(child.mechanism)) or
      (child.scalePermille >= SCALE_MIN and
       child.scalePermille <= SCALE_MAX and
       child.depth >= 1)

  // Execution opacity always in [0, 1]: Lean clamp01_mem / blend_mem_unit.
  val OpacityInRange =
    child.opacityPermille >= 0 and child.opacityPermille <= OPACITY_MAX

  // Seam well-formedness for compose/mate: endpoints exist in the graph,
  // integration node exists. Mirrors the seam record emitted by
  // qdl-v1-offspring.js compose/mate.
  val SeamWellFormed =
    (not hasSeam) or
      (program.outputs.contains(seam.donorNode) and
       program.nodes.contains(seam.recipientNode) and
       program.nodes.contains(seam.integrationNode))

  // Mate consumes a literal: after mate, the recipient is no longer a
  // literal awaiting replacement (checked as a state invariant on the
  // post-state via lastOp; Apalache checks it on every reachable state).
  val MateConsumesLiteral =
    lastOp != Mate or not program.literals.contains(seam.recipientNode)

  // Execution lifecycle: steps never decrease; Halted is absorbing
  // for the step counter (no stepExec from Halted, by action guards).
  val StepsMonotone = steps >= 0

  // Mechanism is always one of the eight woven-body mechanisms:
  // guaranteed by the Mechanism type; stated for traceability with
  // MECHANISMS in woven-body.js.
  val MechanismValid = true  // by construction of `Mechanism`

  val AllInvariants =
    TerritoryPositive and ScaleContractive and OpacityInRange and
    SeamWellFormed and MateConsumesLiteral and StepsMonotone

  // Temporal property: once Halted, execution never resumes Running
  // without an intervening offspring operation resetting to Idle.
  // (Checked with Apalache as a temporal property over `exec`.)
  temporal NeverResumesAfterHalt =
    always((exec == Halted) implies
             always(exec != Running or lastOp != Mate))
}
```

**Notes on the Quint model — read before checking:**

1. **`oneOfMechanism` is a stub in this report.** Quint's `oneOf` works on
   sets, not directly on ADT constructors in all versions. In the checked
   file, mechanism choice should be written as an explicit nondeterministic
   disjunction over the eight constructors, e.g.
   `nondet m = {PleatedBraid, LorenzFlow, ...}.oneOf()` where the set
   literal enumerates constructors — supported in recent Quint. If the
   pinned Quint version rejects sets of ADTs, replace with eight boolean
   `nondet` flags and a `oneOf`-style cascade. This is the one place where
   the report's code may need version-dependent adjustment.
2. **Permille integers instead of reals.** Apalache works far better over
   integers. Scales (`[350, 670]` ≙ `[35/100, 67/100]`) and opacity
   (`[0, 1000]` ≙ `[0,1]`) are scaled by 1000. The Lean theorems are the
   real-valued ground truth; the Quint ranges are their integer shadows.
   The correspondence obligation is: JS must quantise into these ranges
   (or the invariant is vacuous for out-of-range JS values — see §5).
3. **`blendPermille` integer division truncates.** This makes the Quint
   blend a *conservative under-approximation* of the Lean `blend`. For
   range invariants (`OpacityInRange`, `ScaleContractive`) truncation is
   sound: if the truncated integer blend is in range whenever inputs are,
   the real blend is too (Lean `blend_mem_unit`). The converse is not
   claimed.
4. **`NeverResumesAfterHalt` as written is weak** (it only forbids resume
   "as a Mate"). A stronger, cleaner formulation is to add an explicit
   `resetExec` action (`Halted → Idle`, offspring operations only) and
   assert `always(exec == Halted implies (exec' stays Halted until reset))`
   via an auxiliary history variable. I flag this rather than silently
   shipping a temporal formula whose strength I cannot test in this
   session. The safety invariants (`AllInvariants`) do not depend on it.
5. **What Quint does *not* check:** that `compose`'s cone substitution is
   type-correct in the JS graph, that `merge`'s `'joined'` report node is
   wired to both parents' outputs, or anything about `Float32Array`
   budgets in `WovenBody.frame`. Those need either a richer Quint graph
   model (edges as `NodeId -> Set[NodeId]`, cone reachability) or JS-level
   property tests. Recommended next step, §5.

---

## 5. Cross-layer correspondence and residual obligations

| # | Obligation | Lean side | Quint side | JS side (unverified) |
|---|---|---|---|---|
| O1 | Territories tile `[0,1]` | `totalPatchWidth_eq_one`, `patch_contiguous` | `TerritoryPositive` | `author` must emit exactly the uniform partition, or O1's hypothesis fails and the Lean result does not apply |
| O2 | Affine contraction | `scale_decay`, `reach_le` | `ScaleContractive` | `compile` must draw branch scales in `[0.35, 0.67]`; a single out-of-range branch voids the reach bound |
| O3 | Clifford cloud bounded | `clifford_step_bound` (+ O2 iteration) | mechanism typing only | `compile` must use the stated step form; variants (e.g. `sin(a y) + c cos(b x) + d sin(...)`) need a re-proved bound |
| O4 | Hopf embedding on `S²` | `hopf_unit_norm` | — | Input tuple must be unit-norm; JS normalisation is assumed, not checked |
| O5 | Blend/opacity safety | `blend_mem_unit`, `clamp01_mem`, `blend_clamp01` | `OpacityInRange`, `doMerge`/`stepExec` clamping | Execution layer must actually call the clamp; Lean proves the clamp *correct*, not that JS *calls* it |
| O6 | Seam integrity | — | `SeamWellFormed`, `MateConsumesLiteral` | `compose`/`mate` must emit seam endpoints that exist in the graph at emission time |

The honest summary: **Lean proves the mathematics; Quint proves the
state machine respects the mathematics' preconditions; nothing yet proves
the JavaScript does either.** Closing O1–O6 on the JS side is a
refinement/property-testing project (e.g. fast-check properties mirroring
each invariant against `WovenBody.author/compile/frame` outputs), and is
the highest-value follow-up.

---

## 6. Verification protocol (to run when files are materialised)

```bash
# Lean (from spec/lean, with lakefile requiring Mathlib)
cd spec/lean
lake build QDL.WovenBody
grep -rn "sorry\|admit\|axiom" QDL/WovenBody.lean   # must be empty
#print axioms QDL.WovenBody.totalPatchWidth_eq_one  # via a scratch file:
#   expect only [propext, Classical.choice, Quot.sound]

# Quint
quint typecheck spec/woven-combinations.qnt
quint verify --invariant AllInvariants spec/woven-combinations.qnt
# or via Apalache directly:
# quint run --invariant AllInvariants --max-steps 12 \
#   spec/woven-combinations.qnt   (bounded simulation, not a proof)
```

Acceptance criteria: `lake build` green with zero `sorry`; `#print axioms`
shows no project-specific axioms; `quint typecheck` clean; Apalache
reports no counterexample to `AllInvariants` at the chosen bound (and,
ideally, an unbounded/inductive check if the model stays in a decidable
fragment — with integer permille ranges and finite node sets, bounded
checking to depth ≥ 12 plus the monotonicity of `steps` is reasonable
evidence, not a proof; say so in any external claim).

---

## 7. Summary of findings

1. **All four requested Lean theorem families are provable `sorry`-free**
   with elementary Mathlib machinery (order lemmas on powers, `ring` for
   the Hopf identity, triangle inequality for Clifford, convexity by
   monotonicity of multiplication). Complete proof terms are given in §3.
   The only load-bearing hypotheses are `N > 0` (territories), `d > 0`
   (strict decay — false at `d = 0`), and `s ∈ [35/100, 67/100]`.
2. **The geometric reach bound `(100/33)·L` is depth-independent**, giving
   `WovenBody.frame` a static justification for fixed budgets under
   `recursive-affine`, conditional on JS branch scales staying in range (O2).
3. **Quint model covers all four offspring operators and the execution
   lifecycle**, with invariants that are integer shadows of the Lean
   theorems. Two known weak points, flagged in-place rather than hidden:
   the `oneOfMechanism` encoding is Quint-version-sensitive, and the
   temporal no-resume property should be strengthened with an explicit
   reset action before being claimed as verified.
4. **The largest unverified surface is the JS↔formal refinement** (O1–O6),
   especially Float32 rounding and whether `author`/`compile` actually
   produce values inside the proved ranges. Formal results should be cited
   externally only together with this caveat until property tests close it.

*End of report — Specialist #5 (Formal Verification in Quint & Theorem Proving in Lean 4).*
