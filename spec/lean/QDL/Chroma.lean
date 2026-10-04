import QDL.Design
import QDL.Semantics

/-! Scalar-lens evidence and view isolation. Output-path evaluation and trace
construction are explicit inputs, not verified implementations of JavaScript. -/
namespace QDL.ChromaView

structure Trace (Source : Type) where
  source : Source
  binding : LensBinding
  succeeded : Bool
  value : Option ℚ

/-- A scalar belongs to the current complete source and an explicitly declared binding. -/
def usable [DecidableEq Source] (current : Source) (lens : ScalarLens)
    (binding : LensBinding) (trace : Trace Source) : Prop :=
  trace.source = current ∧ trace.succeeded = true ∧
    binding ∈ lens.bindings ∧ trace.binding = binding

instance [DecidableEq Source] (current : Source) (lens : ScalarLens)
    (binding : LensBinding) (trace : Trace Source) :
    Decidable (usable current lens binding trace) := by
  unfold usable
  infer_instance

def scalarEvidence [DecidableEq Source] (current : Source) (lens : ScalarLens)
    (binding : LensBinding) (trace : Option (Trace Source)) : Option ℚ :=
  match trace with
  | none => none
  | some t => if usable current lens binding t then t.value else none

theorem displayed_scalar_has_provenance [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (value : ℚ)
    (shown : scalarEvidence current lens binding (some trace) = some value) :
    usable current lens binding trace ∧ trace.value = some value := by
  simp only [scalarEvidence] at shown
  split at shown
  · exact ⟨‹usable current lens binding trace›, shown⟩
  · contradiction

theorem stale_source_is_unavailable [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (stale : trace.source ≠ current) :
    scalarEvidence current lens binding (some trace) = none := by
  simp [scalarEvidence, usable, stale]

theorem failed_trace_is_unavailable [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (failed : trace.succeeded = false) :
    scalarEvidence current lens binding (some trace) = none := by
  simp [scalarEvidence, usable, failed]

theorem undeclared_binding_is_unavailable [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (undeclared : binding ∉ lens.bindings) :
    scalarEvidence current lens binding (some trace) = none := by
  simp [scalarEvidence, usable, undeclared]

theorem nonnumeric_is_unavailable [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (missing : trace.value = none) :
    scalarEvidence current lens binding (some trace) = none := by
  simp [scalarEvidence, missing]

theorem zero_is_a_value [DecidableEq Source]
    (current : Source) (lens : ScalarLens) (binding : LensBinding)
    (trace : Trace Source) (fresh : usable current lens binding trace)
    (zero : trace.value = some 0) :
    scalarEvidence current lens binding (some trace) = some 0 := by
  simp [scalarEvidence, fresh, zero]

def normalize (lens : ScalarLens) (value : ℚ) : ℚ :=
  max 0 (min 1 ((value - lens.lower) / (lens.upper - lens.lower)))

theorem normalized_bounded (lens : ScalarLens) (value : ℚ) :
    0 ≤ normalize lens value ∧ normalize lens value ≤ 1 := by
  constructor
  · exact le_max_left _ _
  · exact max_le (by norm_num) (min_le_left _ _)

theorem lower_is_zero (lens : ScalarLens) : normalize lens lens.lower = 0 := by
  simp [normalize]

theorem upper_is_one (lens : ScalarLens) (valid : lens.Valid) :
    normalize lens lens.upper = 1 := by
  have positive : 0 < lens.upper - lens.lower := sub_pos.mpr valid.2.2.2.1
  simp [normalize, ne_of_gt positive]

theorem normalized_monotone (lens : ScalarLens) (valid : lens.Valid)
    (x y : ℚ) (ordered : x ≤ y) : normalize lens x ≤ normalize lens y := by
  have positive : 0 < lens.upper - lens.lower := sub_pos.mpr valid.2.2.2.1
  unfold normalize
  gcongr

inductive Mode where | roles | scalar deriving DecidableEq

structure ViewState (Source : Type) where
  runtime : Operational.Runtime Source
  mode : Mode := .roles
  trace : Option (Trace Source) := none

def selectMode (s : ViewState Source) (mode : Mode) : ViewState Source :=
  { s with mode := mode }

theorem mode_change_preserves_runtime (s : ViewState Source) (mode : Mode) :
    (selectMode s mode).runtime = s.runtime := rfl

theorem mode_change_preserves_trace (s : ViewState Source) (mode : Mode) :
    (selectMode s mode).trace = s.trace := rfl

/-- New authored source starts with no cached evidence, independently of old colors. -/
def reauthor (runtime : Operational.Runtime Source) : ViewState Source :=
  { runtime := runtime }

theorem reauthor_clears_evidence (runtime : Operational.Runtime Source) :
    (reauthor runtime).trace = none := rfl

end QDL.ChromaView
