The specifications below make two necessary conditions explicit: a territory partition has at least one patch, and strict scale decay requires depth `d > 0`. At depth zero, `s^0 = 1`.

No tools were called. The following files are complete proposed artifacts, but I cannot claim they have been machine-checked in this environment.

## `spec/lean/QDL/WovenBody.lean`

This file uses Mathlib. It defines equal-width territories, proves finite geometric reach bounds, verifies the polynomial Hopf map on the unit 3-sphere, and establishes coordinatewise bounds for blending and opacity.

```lean
import Mathlib

namespace QDL.WovenBody

/-! Equal-width territories. Indices are natural numbers; callers use i < n. -/

def patchLo (n i : ℕ) : ℝ :=
  (i : ℝ) / (n : ℝ)

def patchHi (n i : ℕ) : ℝ :=
  ((i : ℝ) + 1) / (n : ℝ)

def totalPatchWidth (n : ℕ) : ℝ :=
  ∑ i ∈ Finset.range n, (patchHi n i - patchLo n i)

theorem patch_positive_width
    (n i : ℕ) (hn : 0 < n) :
    patchLo n i < patchHi n i := by
  have hnR : (0 : ℝ) < (n : ℝ) := by exact_mod_cast hn
  unfold patchLo patchHi
  apply (div_lt_div_iff_of_pos_right hnR).2
  linarith

theorem patch_contiguous (n i : ℕ) :
    patchHi n i = patchLo n (i + 1) := by
  simp [patchHi, patchLo, Nat.cast_add, Nat.cast_one]

theorem patch_width (n i : ℕ) :
    patchHi n i - patchLo n i = 1 / (n : ℝ) := by
  unfold patchHi patchLo
  ring

theorem totalPatchWidth_eq_one
    (n : ℕ) (hn : 0 < n) :
    totalPatchWidth n = 1 := by
  have hnR : (n : ℝ) ≠ 0 := by
    exact_mod_cast (Nat.ne_of_gt hn)
  simp only [totalPatchWidth, patch_width]
  simp [hnR]

theorem patch_in_unit_interval
    (n i : ℕ) (hi : i < n) :
    0 ≤ patchLo n i ∧ patchHi n i ≤ 1 := by
  have hn : 0 < n := lt_of_le_of_lt (Nat.zero_le i) hi
  have hnR : (0 : ℝ) < (n : ℝ) := by exact_mod_cast hn
  have hiR : (i : ℝ) + 1 ≤ (n : ℝ) := by
    exact_mod_cast (Nat.succ_le_of_lt hi)
  constructor
  · exact div_nonneg (Nat.cast_nonneg i) (le_of_lt hnR)
  · unfold patchHi
    apply (div_le_iff₀ hnR).2
    simpa using hiR

/-! Recursive-affine contraction. -/

theorem recursive_affine_scale_decay
    (s : ℝ) (d : ℕ)
    (hsLo : (35 : ℝ) / 100 ≤ s)
    (hsHi : s ≤ (67 : ℝ) / 100)
    (hd : 0 < d) :
    0 < s ^ d ∧
      s ^ d ≤ ((67 : ℝ) / 100) ^ d ∧
      ((67 : ℝ) / 100) ^ d < 1 := by
  have hs : 0 < s := by linarith
  refine ⟨pow_pos hs d, ?_, ?_⟩
  · gcongr
  · exact pow_lt_one₀ (by norm_num) (by norm_num) (Nat.ne_of_gt hd)

/--
An upper bound on accumulated displacement along a recursive branch.

If each local displacement has norm at most L and each recursive step
scales by s, this recurrence bounds the displacement through d steps.
-/
def geometricReach (s L : ℝ) : ℕ → ℝ
  | 0 => 0
  | d + 1 => L + s * geometricReach s L d

theorem geometricReach_eq_sum
    (s L : ℝ) (d : ℕ) :
    geometricReach s L d =
      L * ∑ k ∈ Finset.range d, s ^ k := by
  induction d with
  | zero =>
      simp [geometricReach]
  | succ d ih =>
      rw [geometricReach, ih, Finset.sum_range_succ]
      have hgeom :
          (1 - s) * (∑ k ∈ Finset.range d, s ^ k) =
            1 - s ^ d := by
        induction d with
        | zero => simp
        | succ d ih =>
            rw [Finset.sum_range_succ, pow_succ]
            nlinarith
      nlinarith [hgeom]

theorem geometricReach_nonneg
    (s L : ℝ) (hs : 0 ≤ s) (hL : 0 ≤ L) (d : ℕ) :
    0 ≤ geometricReach s L d := by
  induction d with
  | zero => simp [geometricReach]
  | succ d ih =>
      exact add_nonneg hL (mul_nonneg hs ih)

theorem geometricReach_bound
    (s L : ℝ)
    (hsLo : 0 ≤ s)
    (hsHi : s ≤ (67 : ℝ) / 100)
    (hL : 0 ≤ L)
    (d : ℕ) :
    geometricReach s L d ≤ ((100 : ℝ) / 33) * L := by
  induction d with
  | zero =>
      dsimp [geometricReach]
      positivity
  | succ d ih =>
      have hnonneg := geometricReach_nonneg s L hsLo hL d
      have hscaled :
          s * geometricReach s L d ≤
            ((67 : ℝ) / 100) * geometricReach s L d :=
        mul_le_mul_of_nonneg_right hsHi hnonneg
      dsimp [geometricReach]
      nlinarith

theorem geometric_series_reach_bound
    (s L : ℝ)
    (hsLo : (35 : ℝ) / 100 ≤ s)
    (hsHi : s ≤ (67 : ℝ) / 100)
    (hL : 0 ≤ L)
    (d : ℕ) :
    L * (∑ k ∈ Finset.range d, s ^ k) ≤
      ((100 : ℝ) / 33) * L := by
  rw [← geometricReach_eq_sum]
  exact geometricReach_bound s L (by linarith) hsHi hL d

/-! Hopf map: S³ → S². Coordinates represent two complex numbers. -/

def hopfX (a b c d : ℝ) : ℝ := 2 * (a * c + b * d)
def hopfY (a b c d : ℝ) : ℝ := 2 * (b * c - a * d)
def hopfZ (a b c d : ℝ) : ℝ :=
  a ^ 2 + b ^ 2 - c ^ 2 - d ^ 2

theorem hopf_norm_identity (a b c d : ℝ) :
    hopfX a b c d ^ 2 +
      hopfY a b c d ^ 2 +
      hopfZ a b c d ^ 2 =
    (a ^ 2 + b ^ 2 + c ^ 2 + d ^ 2) ^ 2 := by
  unfold hopfX hopfY hopfZ
  ring

theorem hopf_unit_norm
    (a b c d : ℝ)
    (hS3 : a ^ 2 + b ^ 2 + c ^ 2 + d ^ 2 = 1) :
    hopfX a b c d ^ 2 +
      hopfY a b c d ^ 2 +
      hopfZ a b c d ^ 2 = 1 := by
  rw [hopf_norm_identity, hS3]
  norm_num

/-! A coordinate bound for a Clifford attractor step. -/

theorem clifford_step_bound (a x y c : ℝ) :
    |Real.sin (a * y) + c * Real.cos (a * x)| ≤ 1 + |c| := by
  calc
    |Real.sin (a * y) + c * Real.cos (a * x)|
        ≤ |Real.sin (a * y)| + |c * Real.cos (a * x)| :=
      abs_add _ _
    _ = |Real.sin (a * y)| + |c| * |Real.cos (a * x)| := by
      rw [abs_mul]
    _ ≤ 1 + |c| * 1 :=
      add_le_add
        (Real.abs_sin_le_one _)
        (mul_le_mul_of_nonneg_left
          (Real.abs_cos_le_one _) (abs_nonneg c))
    _ = 1 + |c| := by ring

/-! Convex combinations preserve coordinate intervals. -/

def blend (lam pA pB : ℝ) : ℝ :=
  (1 - lam) * pA + lam * pB

theorem blend_mem_interval
    (lam pA pB lo hi : ℝ)
    (hlamLo : 0 ≤ lam) (hlamHi : lam ≤ 1)
    (hALo : lo ≤ pA) (hAHi : pA ≤ hi)
    (hBLo : lo ≤ pB) (hBHi : pB ≤ hi) :
    lo ≤ blend lam pA pB ∧ blend lam pA pB ≤ hi := by
  have hweight : 0 ≤ 1 - lam := by linarith
  constructor
  · have hA := mul_le_mul_of_nonneg_left hALo hweight
    have hB := mul_le_mul_of_nonneg_left hBLo hlamLo
    unfold blend
    nlinarith
  · have hA := mul_le_mul_of_nonneg_left hAHi hweight
    have hB := mul_le_mul_of_nonneg_left hBHi hlamLo
    unfold blend
    nlinarith

/-- Applying blend_mem_interval to each coordinate proves box containment. -/
theorem blend_coordinates_mem_box
    {ι : Type*}
    (lam : ℝ) (pA pB lo hi : ι → ℝ)
    (hlamLo : 0 ≤ lam) (hlamHi : lam ≤ 1)
    (hA : ∀ j, lo j ≤ pA j ∧ pA j ≤ hi j)
    (hB : ∀ j, lo j ≤ pB j ∧ pB j ≤ hi j) :
    ∀ j,
      lo j ≤ blend lam (pA j) (pB j) ∧
      blend lam (pA j) (pB j) ≤ hi j := by
  intro j
  exact blend_mem_interval lam (pA j) (pB j) (lo j) (hi j)
    hlamLo hlamHi (hA j).1 (hA j).2 (hB j).1 (hB j).2

def clampOpacity (x : ℝ) : ℝ :=
  max 0 (min 1 x)

theorem clampOpacity_mem_unit (x : ℝ) :
    0 ≤ clampOpacity x ∧ clampOpacity x ≤ 1 := by
  constructor
  · exact le_max_left _ _
  · unfold clampOpacity
    exact max_le (by norm_num) (min_le_left _ _)

theorem clampOpacity_eq_self
    (x : ℝ) (hxLo : 0 ≤ x) (hxHi : x ≤ 1) :
    clampOpacity x = x := by
  simp [clampOpacity, min_eq_right hxHi, max_eq_right hxLo]

end QDL.WovenBody
```

The partition theorem establishes positive widths, matching boundaries, coverage endpoints, and total width. If production territories have unequal widths, the implementation needs a corresponding prefix-sum partition model.

The reach theorem covers every finite recursion depth. Its application to geometry additionally requires each unscaled branch displacement to have norm at most `L`.

## `spec/woven-combinations.qnt`

This finite-state model uses integer opacity units and blend weights with denominator `100`. It models mechanism selection, offspring operations, seam typing, execution progress, and clamping. Geometry remains an abstract bounded coordinate, with its real-valued justification supplied by Lean.

```quint
module woven_combinations {
  val mechanisms = Set(
    "pleated-braid",
    "lorenz-flow",
    "clifford-flow",
    "recursive-affine",
    "recursive-julia",
    "logarithmic-mantle",
    "toroidal-weave",
    "phyllotaxis-fan"
  )

  val operations = Set("compose", "mate", "merge", "body")
  val statuses = Set("idle", "running", "done", "failed")
  val valueTypes = Set("number", "boolean")

  val maxSteps = 4
  val coordinateBound = 2

  var state: {
    mechanismA: str,
    mechanismB: str,
    operation: str,
    weight: int,
    pointA: int,
    pointB: int,
    blendNumerator: int,
    donorType: str,
    recipientType: str,
    seamPresent: bool,
    integrationPresent: bool,
    joinedReport: bool,
    status: str,
    cursor: int,
    executed: Set[int],
    rawOpacity: int,
    opacity: int
  }

  pure def clampOpacity(x: int): int =
    if (x < 0) 0 else if (x > 100) 100 else x

  action init = {
    state' = {
      mechanismA: "pleated-braid",
      mechanismB: "lorenz-flow",
      operation: "body",
      weight: 50,
      pointA: 0,
      pointB: 0,
      blendNumerator: 0,
      donorType: "number",
      recipientType: "number",
      seamPresent: false,
      integrationPresent: false,
      joinedReport: false,
      status: "idle",
      cursor: 0,
      executed: Set(),
      rawOpacity: 0,
      opacity: 0
    }
  }

  action authorCombination = {
    nondet a = mechanisms.oneOf()
    nondet b = mechanisms.oneOf()
    nondet op = operations.oneOf()
    nondet w = 0.to(100).oneOf()
    nondet pa = (-coordinateBound).to(coordinateBound).oneOf()
    nondet pb = (-coordinateBound).to(coordinateBound).oneOf()
    nondet donor = valueTypes.oneOf()
    nondet recipient = valueTypes.oneOf()

    all {
      state.status != "running",
      // Replacing an input or literal requires type compatibility.
      (op != "compose" and op != "mate") or donor == recipient,
      state' = {
        mechanismA: a,
        mechanismB: b,
        operation: op,
        weight: w,
        pointA: pa,
        pointB: pb,
        blendNumerator: (100 - w) * pa + w * pb,
        donorType: donor,
        recipientType: recipient,
        seamPresent: op == "compose",
        integrationPresent: op == "compose",
        joinedReport: op == "merge",
        status: "idle",
        cursor: 0,
        executed: Set(),
        rawOpacity: 0,
        opacity: 0
      }
    }
  }

  action start = all {
    state.status == "idle",
    state' = {
      ...state,
      status: "running"
    }
  }

  action executeNode = {
    nondet raw = Set(-25, 0, 25, 75, 100, 125).oneOf()
    all {
      state.status == "running",
      state.cursor < maxSteps,
      state' = {
        ...state,
        cursor: state.cursor + 1,
        executed: state.executed.union(Set(state.cursor)),
        rawOpacity: raw,
        opacity: clampOpacity(raw)
      }
    }
  }

  action finish = all {
    state.status == "running",
    state.cursor == maxSteps,
    state' = {
      ...state,
      status: "done"
    }
  }

  action fail = all {
    state.status == "running",
    state' = {
      ...state,
      status: "failed"
    }
  }

  action stutter = {
    state' = state
  }

  action step = any {
    authorCombination,
    start,
    executeNode,
    finish,
    fail,
    stutter
  }

  val mechanismValidity =
    mechanisms.contains(state.mechanismA) and
    mechanisms.contains(state.mechanismB)

  val combinationValidity =
    operations.contains(state.operation) and
    state.weight >= 0 and
    state.weight <= 100 and
    state.pointA >= -coordinateBound and
    state.pointA <= coordinateBound and
    state.pointB >= -coordinateBound and
    state.pointB <= coordinateBound

  val blendDefinition =
    state.blendNumerator ==
      (100 - state.weight) * state.pointA +
      state.weight * state.pointB

  // The represented coordinate is blendNumerator / 100.
  val convexContainment =
    state.blendNumerator >= -100 * coordinateBound and
    state.blendNumerator <= 100 * coordinateBound

  val typeCompatibility =
    valueTypes.contains(state.donorType) and
    valueTypes.contains(state.recipientType) and
    (
      (state.operation != "compose" and state.operation != "mate") or
      state.donorType == state.recipientType
    )

  val seamIntegrity =
    state.seamPresent == (state.operation == "compose") and
    state.integrationPresent == state.seamPresent

  val mergeIntegrity =
    state.joinedReport == (state.operation == "merge")

  val executionValidity =
    statuses.contains(state.status) and
    state.cursor >= 0 and
    state.cursor <= maxSteps and
    state.executed == 0.to(maxSteps - 1).filter(i => i < state.cursor)

  val idleIsFresh =
    state.status != "idle" or
      (state.cursor == 0 and state.executed == Set())

  val completedExecution =
    state.status != "done" or state.cursor == maxSteps

  val opacityValidity =
    state.opacity >= 0 and
    state.opacity <= 100 and
    state.opacity == clampOpacity(state.rawOpacity)

  val safety = and {
    mechanismValidity,
    combinationValidity,
    blendDefinition,
    convexContainment,
    typeCompatibility,
    seamIntegrity,
    mergeIntegrity,
    executionValidity,
    idleIsFresh,
    completedExecution,
    opacityValidity
  }
}
```

This model permits different parent mechanisms and includes all four offspring operations. `compose` requires a seam and integration node; `mate` requires compatible replacement types; `merge` requires a joined report; `body` starts a fresh execution.

The execution abstraction processes four ordered nodes. Each execution step records exactly one new node, terminal states stop execution, and authoring a new combination resets execution state. Stuttering is allowed, so these are safety properties; eventual completion requires a separate fairness or scheduling assumption.

## Validation and implementation connection

Suggested checks, from their respective project environments:

```bash
lake env lean spec/lean/QDL/WovenBody.lean
quint typecheck spec/woven-combinations.qnt
quint run spec/woven-combinations.qnt --invariant=safety
quint verify spec/woven-combinations.qnt --invariant=safety
```

Simulation and bounded verification establish only the coverage provided by their configured bounds and backend. A successful bounded run is not an unbounded proof.

These artifacts specify mathematical and abstract-state guarantees. Connecting them to the JavaScript requires checking that:

- Territory construction implements the specified partition.
- Recursive-affine branches obey the scale and displacement bounds.
- Hopf and Clifford coordinates use the modeled formulas.
- Blending and opacity use compatible weights and clamp semantics.
- Offspring construction and runtime transitions refine the Quint actions.

The Quint seam model checks structural flags and type compatibility. Actual graph-node existence, donor-cone copying, acyclicity, and recipient replacement require an explicit graph model before those implementation properties can be claimed as verified.