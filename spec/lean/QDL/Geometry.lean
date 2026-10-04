import QDL.Design

/-! Exact-real counterparts of the QDL organ, filament and material equations,
and exact-natural counterparts of the renderer's allocation formulas.
These results do not establish IEEE-754 correctness, complete framing or beauty. -/

namespace QDL.Geometry

noncomputable def organRadius (radius a b angle₀ angle₁ : ℝ) : ℝ :=
  radius * (1 + a * Real.cos angle₀ + b * Real.cos angle₁)

theorem organRadius_lower_bound {radius a b : ℝ}
    (hr : 0 ≤ radius) (ha : 0 ≤ a) (hb : 0 ≤ b) (x y : ℝ) :
    radius * (1 - a - b) ≤ organRadius radius a b x y := by
  have hx := Real.neg_one_le_cos x
  have hy := Real.neg_one_le_cos y
  have hx' : -a ≤ a * Real.cos x := by nlinarith
  have hy' : -b ≤ b * Real.cos y := by nlinarith
  unfold organRadius
  exact mul_le_mul_of_nonneg_left (by linarith) hr

theorem organRadius_positive {radius a b : ℝ}
    (hr : 0 < radius) (ha : 0 ≤ a) (hb : 0 ≤ b) (hab : a + b < 1)
    (x y : ℝ) : 0 < organRadius radius a b x y := by
  have lower := organRadius_lower_bound (le_of_lt hr) ha hb x y
  have envelope : 0 < 1 - a - b := by linarith
  exact lt_of_lt_of_le (mul_pos hr envelope) lower

/-- The actual pre-harmonic radius cap is positive whenever the design base is. -/
theorem capped_radius_positive {base degreeGain literalGain degree magnitude : ℝ}
    (hb : 0 < base) (hd : 0 ≤ degreeGain) (hl : 0 ≤ literalGain)
    (hdegree : 0 ≤ degree) (hmagnitude : 0 ≤ magnitude) :
    0 < min (16/100 : ℝ) (base + degreeGain * degree + literalGain * magnitude) := by
  apply lt_min
  · norm_num
  · have := mul_nonneg hd hdegree
    have := mul_nonneg hl hmagnitude
    linarith

/-- Connect the real theorem to the rational authored-domain judgment. -/
theorem valid_organ_radius_positive {o : Organ} (valid : o.Valid)
    {degree magnitude : ℝ} (hd : 0 ≤ degree) (hm : 0 ≤ magnitude) (x y : ℝ) :
    0 < organRadius
      (min (16/100 : ℝ) ((o.baseRadius : ℝ) + (o.degreeGain : ℝ) * degree +
        (o.literalGain : ℝ) * magnitude))
      (o.amplitude₀ : ℝ) (o.amplitude₁ : ℝ) x y := by
  rcases valid with ⟨hbase, hdegree, hliteral, ha, hb, hab⟩
  have base : (0 : ℚ) < o.baseRadius := by have := hbase.1; norm_num at *; linarith
  apply organRadius_positive
  · apply capped_radius_positive
    · exact_mod_cast base
    · exact_mod_cast hdegree.1
    · exact_mod_cast hliteral.1
    · exact hd
    · exact hm
  · exact_mod_cast ha.1
  · exact_mod_cast hb.1
  · exact_mod_cast hab

noncomputable def filamentOffset (bend gain frequency ripple u phase : ℝ) : ℝ :=
  bend * (1 + gain * frequency) * Real.sin (Real.pi * u) *
    (1 + ripple * Real.sin (2 * Real.pi * frequency * u + phase))

noncomputable def filamentCoordinate (A B normal bend gain frequency ripple u phase : ℝ) : ℝ :=
  (1 - u) * A + u * B + normal * filamentOffset bend gain frequency ripple u phase

theorem filament_start (A B normal bend gain frequency ripple phase : ℝ) :
    filamentCoordinate A B normal bend gain frequency ripple 0 phase = A := by
  simp [filamentCoordinate, filamentOffset]

theorem filament_end (A B normal bend gain frequency ripple phase : ℝ) :
    filamentCoordinate A B normal bend gain frequency ripple 1 phase = B := by
  simp [filamentCoordinate, filamentOffset, Real.sin_pi]

noncomputable def clamp01 (x : ℝ) : ℝ := max 0 (min 1 x)

theorem clamp01_bounds (x : ℝ) : 0 ≤ clamp01 x ∧ clamp01 x ≤ 1 := by
  constructor
  · exact le_max_left _ _
  · exact max_le (by norm_num) (min_le_left _ _)

noncomputable def focalWeight (u focus : ℝ) : ℝ :=
  Real.exp (-(((u - focus) / (3/10)) ^ (2 : Nat)))

theorem focalWeight_bounds (u focus : ℝ) :
    0 ≤ focalWeight u focus ∧ focalWeight u focus ≤ 1 := by
  constructor
  · exact le_of_lt (Real.exp_pos _)
  · unfold focalWeight
    apply Real.exp_le_one_iff.mpr
    have := sq_nonneg ((u - focus) / (3/10 : ℝ))
    linarith

private theorem product_unit {x y : ℝ} (hx : 0 ≤ x ∧ x ≤ 1)
    (hy : 0 ≤ y ∧ y ≤ 1) : 0 ≤ x * y ∧ x * y ≤ 1 := by
  constructor
  · exact mul_nonneg hx.1 hy.1
  · nlinarith [mul_nonneg (sub_nonneg.mpr hx.2) hy.1]

/-- Actual fractional exponent and focus/depth factors used by surfacePoint. -/
noncomputable def materialOpacity (recess crest compression focus contrast depth : ℝ) : ℝ :=
  recess + (crest - recess) * compression ^ (9/10 : ℝ) *
    (28/100 + 72/100 * focus) * (1 - contrast + contrast * depth)

theorem materialOpacity_bounds {recess crest compression focus contrast depth : ℝ}
    (hierarchy : recess ≤ crest)
    (hc : 0 ≤ compression ∧ compression ≤ 1)
    (hf : 0 ≤ focus ∧ focus ≤ 1)
    (hk : 0 ≤ contrast ∧ contrast ≤ 1)
    (hd : 0 ≤ depth ∧ depth ≤ 1) :
    recess ≤ materialOpacity recess crest compression focus contrast depth ∧
      materialOpacity recess crest compression focus contrast depth ≤ crest := by
  have hp : 0 ≤ compression ^ (9/10 : ℝ) ∧ compression ^ (9/10 : ℝ) ≤ 1 :=
    ⟨Real.rpow_nonneg hc.1 _, Real.rpow_le_one hc.1 hc.2 (by norm_num)⟩
  have focusFactor : 0 ≤ (28/100 : ℝ) + 72/100 * focus ∧
      (28/100 : ℝ) + 72/100 * focus ≤ 1 := by constructor <;> linarith
  have depthFactor : 0 ≤ 1 - contrast + contrast * depth ∧
      1 - contrast + contrast * depth ≤ 1 := by
    constructor
    · nlinarith [mul_nonneg hk.1 hd.1]
    · nlinarith [mul_nonneg hk.1 (sub_nonneg.mpr hd.2)]
  have weight := product_unit (product_unit hp focusFactor) depthFactor
  have nonnegative : 0 ≤ crest - recess := sub_nonneg.mpr hierarchy
  have lower := mul_nonneg nonnegative weight.1
  have upper := mul_le_mul_of_nonneg_left weight.2 nonnegative
  unfold materialOpacity
  constructor <;> nlinarith

/-- Clamping and the Gaussian focus supply all the material theorem's hypotheses. -/
theorem clamped_materialOpacity_bounds (recess crest c u focus contrast z : ℝ)
    (h : recess ≤ crest) (hk : 0 ≤ contrast ∧ contrast ≤ 1) :
    recess ≤ materialOpacity recess crest (clamp01 c) (focalWeight u focus) contrast (clamp01 z) ∧
      materialOpacity recess crest (clamp01 c) (focalWeight u focus) contrast (clamp01 z) ≤ crest :=
  materialOpacity_bounds h (clamp01_bounds c) (focalWeight_bounds u focus) hk (clamp01_bounds z)

/-- JavaScript's integer branch counts and sample limits represented exactly. -/
def ribbonCount (ribbons branches : Nat) : Nat := min 36 (ribbons + min 6 branches)
def pointBudget (samples : Nat) (thumbnail : Bool) : Nat :=
  if thumbnail then min 4200 samples else samples
def sampleRows (budget ribbons : Nat) : Nat := max 12 (budget / (ribbons * 4))
def pointCount (budget ribbons : Nat) : Nat := ribbons * sampleRows budget ribbons * 4
def crestVertices (crests : Nat) : Nat := crests * 301

theorem ribbonCount_bounds {ribbons : Nat} (hr : 8 ≤ ribbons) (branches : Nat) :
    8 ≤ ribbonCount ribbons branches ∧ ribbonCount ribbons branches ≤ 36 := by
  unfold ribbonCount
  omega

theorem pointBudget_bounds {samples : Nat} (hs : 4000 ≤ samples ∧ samples ≤ 24000)
    (thumbnail : Bool) : 4000 ≤ pointBudget samples thumbnail ∧
      pointBudget samples thumbnail ≤ 24000 := by
  cases thumbnail <;> simp [pointBudget] <;> omega

theorem pointCount_le_budget {budget ribbons : Nat}
    (hb : 4000 ≤ budget) (hr : ribbons ≤ 36) : pointCount budget ribbons ≤ budget := by
  have minimum : 12 * (ribbons * 4) ≤ budget := by nlinarith
  have division := Nat.div_mul_le_self budget (ribbons * 4)
  unfold pointCount sampleRows
  rw [Nat.mul_comm ribbons, Nat.mul_assoc]
  by_cases h : budget / (ribbons * 4) ≤ 12
  · rw [max_eq_left h]
    nlinarith
  · rw [max_eq_right (by omega : 12 ≤ budget / (ribbons * 4))]
    exact division

theorem crestVertices_bounded {crests : Nat} (h : 3 ≤ crests ∧ crests ≤ 6) :
    903 ≤ crestVertices crests ∧ crestVertices crests ≤ 1806 := by
  unfold crestVertices
  omega

/-- Point storage and separately budgeted crest vertices stay bounded together. -/
theorem frame_vertex_budget {s : Surface} (valid : s.Valid) (branches : Nat)
    (thumbnail : Bool) :
    pointCount (pointBudget s.samples thumbnail) (ribbonCount s.ribbons branches) +
      crestVertices s.crests ≤ 25806 := by
  rcases valid with ⟨hr, hc, _, _, _, _, _, _, _, hs⟩
  have hb := pointBudget_bounds hs thumbnail
  have hn := ribbonCount_bounds hr.1 branches
  have hp := pointCount_le_budget hb.1 hn.2
  have hv := crestVertices_bounded hc
  omega

end QDL.Geometry
