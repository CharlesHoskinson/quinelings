import QDL.ChromaSyntax
import QDL.Chroma

/-! Exact-rational, conditional model of scalar presentation and linear-light
RGB mixing. Snapshot freshness and path extraction are supplied inputs; no
JavaScript interpreter, source matcher, or JSON resolver is assumed verified. -/
namespace QDL.ChromaSemantics

inductive ScalarStatus where
  | notEvaluated | stale | invalid | underflow | valid | overflow
  deriving DecidableEq, Repr

/-- A supplied source-matched scalar, or an explicit reason no scalar is usable.
Missing rows become notEvaluated; failed paths/duplicate rows become invalid. -/
inductive ScalarInput where
  | notEvaluated | stale | invalid
  | current : ℚ → ScalarInput
  deriving DecidableEq, Repr

structure Resolution where
  status : ScalarStatus
  value : Option ℚ
  normalized : Option ℚ
  deriving DecidableEq, Repr

def classify (lo hi value : ℚ) : ScalarStatus :=
  if value < lo then .underflow else if hi < value then .overflow else .valid

def resolve (lens : ScalarLens) : ScalarInput → Resolution
  | .notEvaluated => ⟨.notEvaluated, none, none⟩
  | .stale => ⟨.stale, none, none⟩
  | .invalid => ⟨.invalid, none, none⟩
  | .current value => if lens.lower < lens.upper then
      ⟨classify lens.lower lens.upper value, some value, some (ChromaView.normalize lens value)⟩
    else ⟨.invalid, none, none⟩

theorem classify_valid_iff (lo hi value : ℚ) :
    classify lo hi value = .valid ↔ lo ≤ value ∧ value ≤ hi := by
  unfold classify
  split_ifs with below above <;> simp_all

theorem classify_lower_endpoint {lo hi : ℚ} (domain : lo < hi) :
    classify lo hi lo = .valid :=
  (classify_valid_iff _ _ _).mpr ⟨le_refl _, le_of_lt domain⟩
theorem classify_upper_endpoint {lo hi : ℚ} (domain : lo < hi) :
    classify lo hi hi = .valid :=
  (classify_valid_iff _ _ _).mpr ⟨le_of_lt domain, le_refl _⟩

/-- Threshold syntax includes both endpoints; color resolution itself makes no decision. -/
theorem valid_threshold_inclusive {l : ScalarLens} (valid : l.Valid) {t : ℚ}
    (present : l.threshold = some t) : classify l.lower l.upper t = .valid :=
  (classify_valid_iff _ _ _).mpr (valid.threshold_in_domain present)

theorem missing_has_no_scalar (lens : ScalarLens) :
    (resolve lens .notEvaluated).value = none ∧
      (resolve lens .notEvaluated).normalized = none := ⟨rfl, rfl⟩
theorem stale_has_no_scalar (lens : ScalarLens) :
    (resolve lens .stale).value = none ∧
      (resolve lens .stale).normalized = none := ⟨rfl, rfl⟩
theorem invalid_has_no_scalar (lens : ScalarLens) :
    (resolve lens .invalid).value = none ∧
      (resolve lens .invalid).normalized = none := ⟨rfl, rfl⟩

/-- All numeric statuses retain the original value, including out-of-domain values. -/
theorem current_preserves_value (lens : ScalarLens) (valid : lens.Valid) (value : ℚ) :
    (resolve lens (.current value)).value = some value := by
  simp [resolve, valid.2.2.2.1]

theorem underflow_status {lens : ScalarLens} (valid : lens.Valid) {value : ℚ}
    (below : value < lens.lower) : (resolve lens (.current value)).status = .underflow := by
  simp [resolve, valid.2.2.2.1, classify, below]

theorem overflow_status {lens : ScalarLens} (valid : lens.Valid) {value : ℚ}
    (above : lens.upper < value) : (resolve lens (.current value)).status = .overflow := by
  have notBelow : ¬ value < lens.lower := by
    have domain := valid.2.2.2.1
    linarith
  simp [resolve, valid.2.2.2.1, classify, above, notBelow]

theorem invalid_domain_has_no_scalar {lens : ScalarLens} (bad : lens.upper ≤ lens.lower)
    (value : ℚ) : (resolve lens (.current value)).value = none := by
  simp [resolve, not_lt.mpr bad]

/-- Out-of-domain observations saturate color without losing their raw magnitude. -/
theorem underflow_normalizes_zero {lens : ScalarLens} (valid : lens.Valid) {value : ℚ}
    (below : value < lens.lower) : ChromaView.normalize lens value = 0 := by
  have h := ChromaView.normalized_monotone lens valid value lens.lower (le_of_lt below)
  rw [ChromaView.lower_is_zero] at h
  exact le_antisymm h (ChromaView.normalized_bounded _ _).1

theorem overflow_normalizes_one {lens : ScalarLens} (valid : lens.Valid) {value : ℚ}
    (above : lens.upper < value) : ChromaView.normalize lens value = 1 := by
  have h := ChromaView.normalized_monotone lens valid lens.upper value (le_of_lt above)
  rw [ChromaView.upper_is_one lens valid] at h
  exact le_antisymm (ChromaView.normalized_bounded _ _).2 h

theorem resolved_normalized_bounded {lens : ScalarLens} {input : ScalarInput} {x : ℚ}
    (present : (resolve lens input).normalized = some x) : 0 ≤ x ∧ x ≤ 1 := by
  cases input with
  | notEvaluated => simp [resolve] at present
  | stale => simp [resolve] at present
  | invalid => simp [resolve] at present
  | current value =>
      simp only [resolve] at present
      split at present
      · simp only [Option.some.injEq] at present
        rw [← present]
        exact ChromaView.normalized_bounded _ _
      · contradiction

/-- Freshness and usable binding evidence reuse the peer provenance model. -/
def inputOfTrace [DecidableEq Source] (current : Source) (lens : ScalarLens)
    (binding : LensBinding) : Option (ChromaView.Trace Source) → ScalarInput
  | none => .notEvaluated
  | some trace => if trace.source ≠ current then .stale
    else if ChromaView.usable current lens binding trace then
      match trace.value with | none => .invalid | some x => .current x
    else .invalid

theorem stale_input [DecidableEq Source] (current : Source) (lens : ScalarLens)
    (binding : LensBinding) (trace : ChromaView.Trace Source)
    (stale : trace.source ≠ current) :
    inputOfTrace current lens binding (some trace) = .stale := by
  simp [inputOfTrace, stale]

/-- Observation returns the original view and a presentation result, never executing. -/
def observe [DecidableEq Source] (view : ChromaView.ViewState Source)
    (lens : ScalarLens) (binding : LensBinding) : ChromaView.ViewState Source × Resolution :=
  (view, resolve lens (inputOfTrace view.runtime.source lens binding view.trace))

theorem observation_preserves_runtime [DecidableEq Source]
    (view : ChromaView.ViewState Source) (lens : ScalarLens) (binding : LensBinding) :
    (observe view lens binding).1.runtime = view.runtime := rfl

theorem observation_preserves_execution [DecidableEq Source]
    (view : ChromaView.ViewState Source) (lens : ScalarLens) (binding : LensBinding) :
    (observe view lens binding).1.runtime.executions = view.runtime.executions := rfl

theorem missing_observation_has_no_scalar [DecidableEq Source]
    (view : ChromaView.ViewState Source) (lens : ScalarLens) (binding : LensBinding)
    (missing : view.trace = none) : (observe view lens binding).2.value = none := by
  simp [observe, missing, inputOfTrace, resolve]

theorem stale_observation_has_no_scalar [DecidableEq Source]
    (view : ChromaView.ViewState Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : ChromaView.Trace Source) (present : view.trace = some trace)
    (stale : trace.source ≠ view.runtime.source) :
    (observe view lens binding).2.value = none := by
  simp [observe, present, inputOfTrace, stale, resolve]

/-- Channels are linear-light rationals, before display transfer/rounding. -/
abbrev LinearRGB := Fin 3 → ℚ
def LinearRGB.Valid (color : LinearRGB) : Prop := ∀ i, 0 ≤ color i ∧ color i ≤ 1
def mixRGB (a b : LinearRGB) (t : ℚ) : LinearRGB := fun i => (1 - t) * a i + t * b i

theorem convex_channel_bounds {a b t : ℚ} (ha : 0 ≤ a ∧ a ≤ 1)
    (hb : 0 ≤ b ∧ b ≤ 1) (ht : 0 ≤ t ∧ t ≤ 1) :
    0 ≤ (1 - t) * a + t * b ∧ (1 - t) * a + t * b ≤ 1 := by
  have omt : 0 ≤ 1 - t := sub_nonneg.mpr ht.2
  constructor
  · exact add_nonneg (mul_nonneg omt ha.1) (mul_nonneg ht.1 hb.1)
  · have left := mul_le_mul_of_nonneg_left ha.2 omt
    have right := mul_le_mul_of_nonneg_left hb.2 ht.1
    nlinarith

theorem mixRGB_valid {a b : LinearRGB} (ha : a.Valid) (hb : b.Valid) {t : ℚ}
    (ht : 0 ≤ t ∧ t ≤ 1) : (mixRGB a b t).Valid := by
  intro i
  exact convex_channel_bounds (ha i) (hb i) ht

theorem valid_chroma_mix {a b : LinearRGB} (ha : a.Valid) (hb : b.Valid)
    {c : Chroma} (hc : c.Valid) : (mixRGB a b c.strength).Valid :=
  mixRGB_valid ha hb hc.strength_bounded

theorem mixRGB_zero (a b : LinearRGB) : mixRGB a b 0 = a := by
  funext i
  simp [mixRGB]
theorem mixRGB_one (a b : LinearRGB) : mixRGB a b 1 = b := by
  funext i
  simp [mixRGB]

end QDL.ChromaSemantics
