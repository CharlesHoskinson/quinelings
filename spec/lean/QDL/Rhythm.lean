import QDL.Design

/-! Exact-real counterparts of motionState, bodyTransform, and traveling in
morphology.js. These domain properties do not prove floating-point accuracy,
complete silhouette safety, or subjective appearance. -/
namespace QDL.RhythmSafety

noncomputable def warpedPhase (rate asymmetry time : ℝ) : ℝ :=
  rate * time + asymmetry * Real.sin (rate * time)

noncomputable def phaseVelocity (rate asymmetry time : ℝ) : ℝ :=
  rate * (1 + asymmetry * Real.cos (rate * time))

theorem warpedPhase_hasDerivAt (rate asymmetry time : ℝ) :
    HasDerivAt (warpedPhase rate asymmetry) (phaseVelocity rate asymmetry time) time := by
  have hr : HasDerivAt (fun t : ℝ => rate * t) rate time := by
    simpa using (hasDerivAt_id time).const_mul rate
  have hs := (Real.hasDerivAt_sin (rate * time)).comp time hr
  have h := hr.add (hs.const_mul asymmetry)
  change HasDerivAt (fun t : ℝ => rate * t + asymmetry * Real.sin (rate * t)) _ time
  convert h using 1
  · rfl
  · unfold phaseVelocity
    ring

theorem phaseVelocity_lower_bound {rate asymmetry : ℝ}
    (hr : 0 ≤ rate) (ha : 0 ≤ asymmetry) (time : ℝ) :
    rate * (1 - asymmetry) ≤ phaseVelocity rate asymmetry time := by
  have hm := mul_le_mul_of_nonneg_left (Real.neg_one_le_cos (rate * time)) ha
  unfold phaseVelocity
  apply mul_le_mul_of_nonneg_left _ hr
  linarith

theorem valid_phaseVelocity_positive {r : Rhythm} (valid : r.Valid) (time : ℝ) :
    0 < phaseVelocity (r.rate : ℝ) (r.asymmetry : ℝ) time := by
  rcases valid with ⟨hr, _, _, _, _, ha, _⟩
  have ratePos : (0 : ℚ) < r.rate := by have := hr.1; norm_num at *; linarith
  have asymSmall : r.asymmetry < 1 := by have := ha.2; norm_num at *; linarith
  have hr' : (0 : ℝ) < r.rate := by exact_mod_cast ratePos
  have ha' : (0 : ℝ) ≤ r.asymmetry := by exact_mod_cast ha.1
  have hs' : (r.asymmetry : ℝ) < 1 := by exact_mod_cast asymSmall
  have lower := phaseVelocity_lower_bound (le_of_lt hr') ha' time
  exact lt_of_lt_of_le (mul_pos hr' (by linarith)) lower

/-- Valid phase warping never reverses direction, regardless of visual mode. -/
theorem valid_warpedPhase_derivative_positive {r : Rhythm} (valid : r.Valid) (time : ℝ) :
    0 < deriv (warpedPhase (r.rate : ℝ) (r.asymmetry : ℝ)) time := by
  rw [(warpedPhase_hasDerivAt _ _ time).deriv]
  exact valid_phaseVelocity_positive valid time

theorem valid_warpedPhase_strictMono {r : Rhythm} (valid : r.Valid) :
    StrictMono (warpedPhase (r.rate : ℝ) (r.asymmetry : ℝ)) :=
  strictMono_of_deriv_pos (valid_warpedPhase_derivative_positive valid)

noncomputable def breathScale (breath phase : ℝ) : ℝ :=
  1 + breath * Real.sin phase

theorem breathScale_bounds {breath : ℝ} (hb : 0 ≤ breath) (phase : ℝ) :
    1 - breath ≤ breathScale breath phase ∧ breathScale breath phase ≤ 1 + breath := by
  have hlo := mul_le_mul_of_nonneg_left (Real.neg_one_le_sin phase) hb
  have hhi := mul_le_mul_of_nonneg_left (Real.sin_le_one phase) hb
  unfold breathScale
  constructor <;> linarith

/-- Reciprocal square-root stretch therefore has a positive argument. -/
theorem valid_breathScale_positive {r : Rhythm} (valid : r.Valid) (phase : ℝ) :
    0 < breathScale (r.breath : ℝ) phase := by
  rcases valid with ⟨_, hb, _, _, _, _, _⟩
  have hb' : (0 : ℝ) ≤ r.breath := by exact_mod_cast hb.1
  have hmax : (r.breath : ℝ) ≤ ((18/100 : ℚ) : ℝ) := by exact_mod_cast hb.2
  norm_num at hmax
  have lower := (breathScale_bounds hb' phase).1
  linarith

theorem valid_breathStretch_defined {r : Rhythm} (valid : r.Valid) (phase : ℝ) :
    0 < Real.sqrt (breathScale (r.breath : ℝ) phase) ∧
      0 < 1 / Real.sqrt (breathScale (r.breath : ℝ) phase) := by
  have h := Real.sqrt_pos.mpr (valid_breathScale_positive valid phase)
  exact ⟨h, div_pos (by norm_num) h⟩

/-- Secondary pulses and traveling waves share this normalized blend.
Angles are arbitrary, including the quasiperiodic √2 frequency. -/
noncomputable def normalizedWave (overtone angle₀ angle₁ : ℝ) : ℝ :=
  (Real.sin angle₀ + overtone * Real.sin angle₁) / (1 + overtone)

theorem normalizedWave_bounds {overtone : ℝ} (ho : 0 ≤ overtone) (x y : ℝ) :
    -1 ≤ normalizedWave overtone x y ∧ normalizedWave overtone x y ≤ 1 := by
  have denominator : 0 < 1 + overtone := by linarith
  have lo₀ := Real.neg_one_le_sin x
  have hi₀ := Real.sin_le_one x
  have lo₁ := mul_le_mul_of_nonneg_left (Real.neg_one_le_sin y) ho
  have hi₁ := mul_le_mul_of_nonneg_left (Real.sin_le_one y) ho
  unfold normalizedWave
  constructor
  · apply (le_div_iff₀ denominator).mpr
    linarith
  · apply (div_le_iff₀ denominator).mpr
    linarith

theorem valid_normalizedWave_bounds {r : Rhythm} (valid : r.Valid) (x y : ℝ) :
    -1 ≤ normalizedWave (r.overtone : ℝ) x y ∧
      normalizedWave (r.overtone : ℝ) x y ≤ 1 := by
  have ho : (0 : ℝ) ≤ r.overtone := by exact_mod_cast valid.2.2.2.2.2.2.1
  exact normalizedWave_bounds ho x y

end QDL.RhythmSafety
