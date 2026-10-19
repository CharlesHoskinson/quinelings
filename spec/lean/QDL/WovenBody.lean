import QDL.Geometry
import QDL.Assembly

/-! Exact-real and exact-natural counterparts of WovenBody territory partitioning,
contractive recursive-affine branch envelopes, Hopf S³ fiber norm conservation,
Clifford attractor step bounds, chimeric combination convexity, and execution
pulse opacity modulation. -/

namespace QDL.WovenBody

/-- Authored strand count formula from `woven-body.js`. -/
def authoredStrands (fanout convergence extra : Nat) : Nat :=
  max 8 (min 16 (7 + fanout + convergence / 2 + extra))

theorem authoredStrands_bounds (fanout convergence extra : Nat) :
    8 ≤ authoredStrands fanout convergence extra ∧
      authoredStrands fanout convergence extra ≤ 16 := by
  unfold authoredStrands
  omega

theorem authoredStrands_admissible (fanout convergence extra : Nat) :
    8 ≤ authoredStrands fanout convergence extra ∧
      authoredStrands fanout convergence extra ≤ 40 := by
  have h := authoredStrands_bounds fanout convergence extra
  omega

/-- Lower endpoint of the `i`-th territory patch on a strand with `assigned` operations. -/
noncomputable def patchLo (assigned i : Nat) : ℝ :=
  (i : ℝ) / (assigned : ℝ)

/-- Upper endpoint of the `i`-th territory patch on a strand with `assigned` operations. -/
noncomputable def patchHi (assigned i : Nat) : ℝ :=
  ((i : ℝ) + 1) / (assigned : ℝ)

theorem patch_width_eq (assigned i : Nat) :
    patchHi assigned i - patchLo assigned i = 1 / (assigned : ℝ) := by
  unfold patchHi patchLo
  ring

theorem patch_positive_width {assigned : Nat} (ha : 1 ≤ assigned) (i : Nat) :
    patchLo assigned i < patchHi assigned i := by
  have hpos : (0 : ℝ) < (assigned : ℝ) := by exact_mod_cast (by omega : 0 < assigned)
  have hdiv : (0 : ℝ) < 1 / (assigned : ℝ) := div_pos one_pos hpos
  have hw := patch_width_eq assigned i
  linarith

theorem patch_contiguous_boundary (assigned i : Nat) :
    patchHi assigned i = patchLo assigned (i + 1) := by
  unfold patchHi patchLo
  push_cast
  ring

theorem patch_start_zero (assigned : Nat) :
    patchLo assigned 0 = 0 := by
  unfold patchLo
  simp

theorem patch_end_one {assigned : Nat} (ha : 1 ≤ assigned) :
    patchLo assigned assigned = 1 := by
  unfold patchLo
  have hne : (assigned : ℝ) ≠ 0 := by exact_mod_cast (by omega : assigned ≠ 0)
  exact div_self hne

/-- Cumulative width of the first `k` territory patches on a strand. -/
noncomputable def totalPatchWidth (assigned : Nat) : Nat → ℝ
  | 0 => 0
  | k + 1 => totalPatchWidth assigned k + (patchHi assigned k - patchLo assigned k)

theorem totalPatchWidth_eq_patchLo (assigned k : Nat) :
    totalPatchWidth assigned k = patchLo assigned k := by
  induction k with
  | zero => simp [totalPatchWidth, patchLo]
  | succ k ih =>
    unfold totalPatchWidth
    rw [ih]
    unfold patchHi patchLo
    push_cast
    ring

theorem totalPatchWidth_unit {assigned : Nat} (ha : 1 ≤ assigned) :
    totalPatchWidth assigned assigned = 1 := by
  rw [totalPatchWidth_eq_patchLo]
  exact patch_end_one ha

theorem strand_territory_coverage {strands assigned : Nat}
    (_hs : 8 ≤ strands) (ha : 1 ≤ assigned) (i : Nat) :
    patchLo assigned i < patchHi assigned i ∧
      patchHi assigned i = patchLo assigned (i + 1) ∧
      totalPatchWidth assigned assigned = 1 :=
  ⟨patch_positive_width ha i, patch_contiguous_boundary assigned i, totalPatchWidth_unit ha⟩

theorem patch_in_unit_interval {assigned i : Nat}
    (ha : 1 ≤ assigned) (hi : i < assigned) :
    0 ≤ patchLo assigned i ∧ patchHi assigned i ≤ 1 := by
  have hpos : (0 : ℝ) < (assigned : ℝ) := by exact_mod_cast (by omega : 0 < assigned)
  have hi0 : (0 : ℝ) ≤ (i : ℝ) := Nat.cast_nonneg i
  have hi1 : (i : ℝ) + 1 ≤ (assigned : ℝ) := by exact_mod_cast (by omega : i + 1 ≤ assigned)
  unfold patchLo patchHi
  exact ⟨div_nonneg hi0 (le_of_lt hpos), (div_le_one hpos).mpr hi1⟩

theorem patch_adjacent_disjoint {assigned : Nat} (i : Nat) (u : ℝ)
    (h : Assembly.Owns (patchLo assigned i) (patchHi assigned i) u) :
    ¬ Assembly.Owns (patchLo assigned (i + 1)) (patchHi assigned (i + 1)) u := by
  have hcontig : patchHi assigned i ≤ patchLo assigned (i + 1) :=
    le_of_eq (patch_contiguous_boundary assigned i)
  exact Assembly.adjacent_owners_disjoint hcontig h

/-- Authored contractive scale domain `s ∈ [0.35, 0.67]` for `recursive-affine`. -/
def AffineScaleValid (s : ℝ) : Prop := 35/100 ≤ s ∧ s ≤ 67/100

theorem affine_scale_pow_bounds {s : ℝ} (hs : AffineScaleValid s) (d : Nat) :
    (35/100 : ℝ) ^ d ≤ s ^ d ∧ s ^ d ≤ (67/100 : ℝ) ^ d := by
  rcases hs with ⟨hlo, hhi⟩
  have h35 : (0 : ℝ) ≤ 35/100 := by norm_num
  have hs0 : (0 : ℝ) ≤ s := by linarith
  exact ⟨pow_le_pow_left₀ h35 hlo d, pow_le_pow_left₀ hs0 hhi d⟩

theorem affine_scale_contractive {s : ℝ} (hs : AffineScaleValid s)
    {d : Nat} (hd : 1 ≤ d) :
    0 < s ^ d ∧ s ^ d ≤ (67/100 : ℝ) ^ d ∧ (67/100 : ℝ) ^ d < 1 := by
  rcases hs with ⟨hlo, hhi⟩
  have hs_pos : (0 : ℝ) < s := by linarith
  have h67_nonneg : (0 : ℝ) ≤ 67/100 := by norm_num
  have h67_lt_one : (67/100 : ℝ) < 1 := by norm_num
  have hd_ne : d ≠ 0 := by omega
  exact ⟨pow_pos hs_pos d, pow_le_pow_left₀ (le_of_lt hs_pos) hhi d,
    pow_lt_one₀ h67_nonneg h67_lt_one hd_ne⟩

/-- Finite geometric series `1 + s + s^2 + ... + s^d` for recursive branch reach. -/
noncomputable def geomSeries (s : ℝ) : Nat → ℝ
  | 0 => 1
  | d + 1 => geomSeries s d + s ^ (d + 1)

noncomputable def branchReach (L s : ℝ) (d : Nat) : ℝ :=
  L * geomSeries s d

theorem geomSeries_identity (s : ℝ) (d : Nat) :
    (1 - s) * geomSeries s d = 1 - s ^ (d + 1) := by
  induction d with
  | zero =>
    simp [geomSeries]
  | succ d ih =>
    unfold geomSeries
    have hmul : (1 - s) * (geomSeries s d + s ^ (d + 1)) =
        (1 - s) * geomSeries s d + (1 - s) * s ^ (d + 1) := by ring
    rw [hmul, ih, pow_succ s (d + 1)]
    ring

theorem geomSeries_nonneg {s : ℝ} (hs : 0 ≤ s) (d : Nat) :
    0 ≤ geomSeries s d := by
  induction d with
  | zero =>
    unfold geomSeries
    norm_num
  | succ d ih =>
    unfold geomSeries
    have hp : 0 ≤ s ^ (d + 1) := pow_nonneg hs (d + 1)
    linarith

theorem geomSeries_upper_bound {s : ℝ} (hs : AffineScaleValid s) (d : Nat) :
    geomSeries s d ≤ 100/33 := by
  rcases hs with ⟨hlo, hhi⟩
  have hs0 : (0 : ℝ) ≤ s := by linarith
  have hg0 : 0 ≤ geomSeries s d := geomSeries_nonneg hs0 d
  have hp0 : 0 ≤ s ^ (d + 1) := pow_nonneg hs0 (d + 1)
  have hid := geomSeries_identity s d
  have hgap : (33/100 : ℝ) ≤ 1 - s := by linarith
  have hmul : (33/100 : ℝ) * geomSeries s d ≤ (1 - s) * geomSeries s d :=
    mul_le_mul_of_nonneg_right hgap hg0
  linarith

theorem branchReach_envelope_bound {L s : ℝ} (hL : 0 ≤ L)
    (hs : AffineScaleValid s) (d : Nat) :
    branchReach L s d ≤ (100/33 : ℝ) * L := by
  have hgeom := geomSeries_upper_bound hs d
  have hmul := mul_le_mul_of_nonneg_left hgeom hL
  unfold branchReach
  linarith

/-- Hopf fibration coordinates on `S³ ⊂ ℝ⁴`. -/
noncomputable def hopfX₀ (α θ : ℝ) : ℝ := Real.cos α * Real.cos θ
noncomputable def hopfX₁ (α θ : ℝ) : ℝ := Real.cos α * Real.sin θ
noncomputable def hopfX₂ (α φ : ℝ) : ℝ := Real.sin α * Real.cos φ
noncomputable def hopfX₃ (α φ : ℝ) : ℝ := Real.sin α * Real.sin φ

noncomputable def hopfNormSq (α θ φ : ℝ) : ℝ :=
  (hopfX₀ α θ) ^ 2 + (hopfX₁ α θ) ^ 2 + (hopfX₂ α φ) ^ 2 + (hopfX₃ α φ) ^ 2

theorem hopf_s3_unit_norm (α θ φ : ℝ) :
    hopfNormSq α θ φ = 1 := by
  unfold hopfNormSq hopfX₀ hopfX₁ hopfX₂ hopfX₃
  have hθ : Real.cos θ ^ 2 + Real.sin θ ^ 2 = 1 := Real.cos_sq_add_sin_sq θ
  have hφ : Real.cos φ ^ 2 + Real.sin φ ^ 2 = 1 := Real.cos_sq_add_sin_sq φ
  have hα : Real.cos α ^ 2 + Real.sin α ^ 2 = 1 := Real.cos_sq_add_sin_sq α
  calc
    (Real.cos α * Real.cos θ) ^ 2 + (Real.cos α * Real.sin θ) ^ 2 +
        (Real.sin α * Real.cos φ) ^ 2 + (Real.sin α * Real.sin φ) ^ 2
      = Real.cos α ^ 2 * (Real.cos θ ^ 2 + Real.sin θ ^ 2) +
          Real.sin α ^ 2 * (Real.cos φ ^ 2 + Real.sin φ ^ 2) := by ring
    _ = Real.cos α ^ 2 * 1 + Real.sin α ^ 2 * 1 := by rw [hθ, hφ]
    _ = Real.cos α ^ 2 + Real.sin α ^ 2 := by ring
    _ = 1 := hα

theorem hopf_fourth_coord_abs_le_one (α φ : ℝ) :
    |hopfX₃ α φ| ≤ 1 := by
  unfold hopfX₃
  rw [abs_mul]
  have hα : |Real.sin α| ≤ 1 := Real.abs_sin_le_one α
  have hφ : |Real.sin φ| ≤ 1 := Real.abs_sin_le_one φ
  have h0 : 0 ≤ |Real.sin α| := abs_nonneg (Real.sin α)
  nlinarith

theorem hopf_stereographic_denom_positive (α φ : ℝ) :
    (1/5 : ℝ) ≤ 6/5 - hopfX₃ α φ := by
  have h := (abs_le.mp (hopf_fourth_coord_abs_le_one α φ)).2
  linarith

/-- Single coordinate step of the 2D Clifford strange attractor recurrence. -/
noncomputable def cliffordStep (a c x y : ℝ) : ℝ :=
  Real.sin (a * y) + c * Real.cos (a * x)

theorem clifford_step_abs_bound (a c x y : ℝ) :
    |cliffordStep a c x y| ≤ 1 + |c| := by
  unfold cliffordStep
  have htri : |Real.sin (a * y) + c * Real.cos (a * x)| ≤
      |Real.sin (a * y)| + |c * Real.cos (a * x)| :=
    abs_add_le (Real.sin (a * y)) (c * Real.cos (a * x))
  have hsin : |Real.sin (a * y)| ≤ 1 := Real.abs_sin_le_one (a * y)
  have hcos : |Real.cos (a * x)| ≤ 1 := Real.abs_cos_le_one (a * x)
  have hmul : |c * Real.cos (a * x)| ≤ |c| := by
    rw [abs_mul]
    have hc : 0 ≤ |c| := abs_nonneg c
    nlinarith
  linarith

theorem clifford_step_interval_bounds (a c x y : ℝ) :
    -(1 + |c|) ≤ cliffordStep a c x y ∧ cliffordStep a c x y ≤ 1 + |c| :=
  abs_le.mp (clifford_step_abs_bound a c x y)

theorem clifford_authored_enclosure {c : ℝ} (hc : -5/2 ≤ c ∧ c ≤ 5/2) (a x y : ℝ) :
    |cliffordStep a c x y| ≤ 7/2 := by
  have habs : |c| ≤ 5/2 := abs_le.mpr ⟨by linarith [hc.1], hc.2⟩
  have hstep := clifford_step_abs_bound a c x y
  linarith

/-- Convex chimeric interpolation between two parent manifold coordinates. -/
noncomputable def chimericLerp (pA pB lam : ℝ) : ℝ :=
  (1 - lam) * pA + lam * pB

theorem chimericLerp_interval_bounds {lo hi pA pB lam : ℝ}
    (hA : lo ≤ pA ∧ pA ≤ hi) (hB : lo ≤ pB ∧ pB ≤ hi) (hlam : 0 ≤ lam ∧ lam ≤ 1) :
    lo ≤ chimericLerp pA pB lam ∧ chimericLerp pA pB lam ≤ hi := by
  have h1 : 0 ≤ 1 - lam := by linarith
  have al := mul_le_mul_of_nonneg_left hA.1 h1
  have bl := mul_le_mul_of_nonneg_left hB.1 hlam.1
  have au := mul_le_mul_of_nonneg_left hA.2 h1
  have bu := mul_le_mul_of_nonneg_left hB.2 hlam.1
  unfold chimericLerp
  constructor <;> linarith

theorem chimericLerp_enclosure_bounds {R pA pB lam : ℝ}
    (hA : -R ≤ pA ∧ pA ≤ R) (hB : -R ≤ pB ∧ pB ≤ R) (hlam : 0 ≤ lam ∧ lam ≤ 1) :
    -R ≤ chimericLerp pA pB lam ∧ chimericLerp pA pB lam ≤ R :=
  chimericLerp_interval_bounds hA hB hlam

theorem chimericLerp_abs_bound {R pA pB lam : ℝ}
    (hA : |pA| ≤ R) (hB : |pB| ≤ R) (hlam : 0 ≤ lam ∧ lam ≤ 1) :
    |chimericLerp pA pB lam| ≤ R :=
  abs_le.mpr (chimericLerp_enclosure_bounds (abs_le.mp hA) (abs_le.mp hB) hlam)

theorem chimericSeam_quintic_enclosure {R pA pB z : ℝ}
    (hA : -R ≤ pA ∧ pA ≤ R) (hB : -R ≤ pB ∧ pB ≤ R) (hz : 0 ≤ z ∧ z ≤ 1) :
    -R ≤ chimericLerp pA pB (Assembly.H z) ∧ chimericLerp pA pB (Assembly.H z) ≤ R :=
  chimericLerp_enclosure_bounds hA hB (Assembly.H_bounds hz.1 hz.2)

/-- Execution pulse opacity modulation via rational convex normalization. -/
noncomputable def executionOpacity (alpha gain pulse : ℝ) : ℝ :=
  (alpha + gain * pulse) / (1 + gain)

theorem executionOpacity_bounds {alpha gain pulse : ℝ}
    (ha : 0 ≤ alpha ∧ alpha ≤ 1) (hp : 0 ≤ pulse ∧ pulse ≤ 1) (hg : 0 ≤ gain) :
    0 ≤ executionOpacity alpha gain pulse ∧ executionOpacity alpha gain pulse ≤ 1 := by
  have hden : 0 < 1 + gain := by linarith
  have hgp_lo : 0 ≤ gain * pulse := mul_nonneg hg hp.1
  have hgp_hi : gain * pulse ≤ gain := by nlinarith [mul_nonneg hg (sub_nonneg.mpr hp.2)]
  unfold executionOpacity
  constructor
  · exact div_nonneg (by linarith) (le_of_lt hden)
  · exact (div_le_iff₀ hden).mpr (by linarith)

/-- Clamped execution pulse opacity modulation. -/
noncomputable def clampedExecutionOpacity (alpha gain pulse : ℝ) : ℝ :=
  Geometry.clamp01 (alpha * (1 + gain * pulse))

theorem clampedExecutionOpacity_bounds (alpha gain pulse : ℝ) :
    0 ≤ clampedExecutionOpacity alpha gain pulse ∧
      clampedExecutionOpacity alpha gain pulse ≤ 1 :=
  Geometry.clamp01_bounds (alpha * (1 + gain * pulse))

end QDL.WovenBody
