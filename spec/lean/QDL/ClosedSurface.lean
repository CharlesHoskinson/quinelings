import QDL.Geometry

/-! The circle-valued controls introduced by the living-motion implementation.
These eliminate a scalar seam; centerline/normal continuity remains a separate obligation. -/
namespace QDL.ClosedSurface

noncomputable def spatial (u : ℝ) : ℝ := Real.sin (2 * Real.pi * u)
noncomputable def focusWeight (u focus : ℝ) : ℝ :=
  Real.exp (-2 * (Real.sin (Real.pi * (u - focus))) ^ (2 : Nat))
noncomputable def envelope (u focus taper : ℝ) : ℝ :=
  (3/4 + 1/4 * Real.cos (2 * Real.pi * (u - focus))) ^ taper

/-- Squaring the antiperiodic sine yields a periodic focal density. -/
theorem focusWeight_periodic (u focus : ℝ) : focusWeight (u + 1) focus = focusWeight u focus := by
  unfold focusWeight
  have angle : Real.pi * (u + 1 - focus) = Real.pi * (u - focus) + Real.pi := by ring
  rw [angle, Real.sin_add_pi]
  simp

theorem focusWeight_bounds (u focus : ℝ) :
    0 ≤ focusWeight u focus ∧ focusWeight u focus ≤ 1 := by
  constructor
  · exact le_of_lt (Real.exp_pos _)
  · unfold focusWeight
    apply Real.exp_le_one_iff.mpr
    have := sq_nonneg (Real.sin (Real.pi * (u - focus)))
    linarith

theorem spatial_periodic (u : ℝ) : spatial (u + 1) = spatial u := by
  unfold spatial
  have angle : 2 * Real.pi * (u + 1) = 2 * Real.pi * u + 2 * Real.pi := by ring
  rw [angle, Real.sin_add_two_pi]

theorem envelope_periodic (u focus taper : ℝ) :
    envelope (u + 1) focus taper = envelope u focus taper := by
  unfold envelope
  have angle : 2 * Real.pi * (u + 1 - focus) = 2 * Real.pi * (u - focus) + 2 * Real.pi := by ring
  rw [angle, Real.cos_add_two_pi]

/-- The closed taper's base remains positive for every angle and focus. -/
theorem envelope_positive (u focus taper : ℝ) : 0 < envelope u focus taper := by
  unfold envelope
  apply Real.rpow_pos_of_pos
  have := Real.neg_one_le_cos (2 * Real.pi * (u - focus))
  linarith

/-- Integral spatial folding returns to the same phase after one circuit. -/
theorem fold_periodic (folds : Nat) (u phase : ℝ) :
    Real.sin (2 * Real.pi * (folds : ℝ) * (u + 1) + phase) =
      Real.sin (2 * Real.pi * (folds : ℝ) * u + phase) := by
  have angle : 2 * Real.pi * (folds : ℝ) * (u + 1) + phase =
      (2 * Real.pi * (folds : ℝ) * u + phase) + (folds : ℝ) * (2 * Real.pi) := by ring
  rw [angle, Real.sin_add_nat_mul_two_pi]

/-- For the nonnegative authored domain, this is JavaScript round(x). -/
def closedWinding (waveNumber : ℚ) : Nat := Int.toNat ⌊waveNumber + 1/2⌋

theorem closedWinding_bounded {waveNumber : ℚ} (h : Bounded 0 4 waveNumber) :
    closedWinding waveNumber ≤ 4 := by
  have upper : ⌊waveNumber + 1/2⌋ < (5 : ℤ) := by
    apply Int.floor_lt.mpr
    have := h.2
    norm_num at *
    linarith
  unfold closedWinding
  omega

/-- Rounded integral winding makes a closed traveling-wave factor periodic. -/
theorem rounded_fold_periodic (waveNumber : ℚ) (u phase : ℝ) :
    Real.sin (2 * Real.pi * (closedWinding waveNumber : ℝ) * (u + 1) + phase) =
      Real.sin (2 * Real.pi * (closedWinding waveNumber : ℝ) * u + phase) :=
  fold_periodic (closedWinding waveNumber) u phase

theorem closed_material_bounds (recess crest c u focus contrast depth : ℝ)
    (hierarchy : recess ≤ crest) (hk : 0 ≤ contrast ∧ contrast ≤ 1) :
    recess ≤ Geometry.materialOpacity recess crest (Geometry.clamp01 c)
      (focusWeight u focus) contrast (Geometry.clamp01 depth) ∧
    Geometry.materialOpacity recess crest (Geometry.clamp01 c)
      (focusWeight u focus) contrast (Geometry.clamp01 depth) ≤ crest :=
  Geometry.materialOpacity_bounds hierarchy (Geometry.clamp01_bounds c)
    (focusWeight_bounds u focus) hk (Geometry.clamp01_bounds depth)

end QDL.ClosedSurface
