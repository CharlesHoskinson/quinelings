import QDL.Design
import QDL.Fixtures
import QDL.Geometry
import QDL.Semantics
import QDL.Quine
import QDL.Integration
import QDL.Rhythm

/-! The build's proof-dependency audit. The standard Lean/mathlib foundation
may use propext, Classical.choice and Quot.sound. No project axiom or admitted
proof is permitted. The executable audit runner checks these printed closures. -/

#print axioms QDL.validateDesign_iff
#print axioms QDL.validateDesign_reject_iff
#print axioms QDL.defaultDesign_valid
#print axioms QDL.Fixtures.default_matches_runtime
#print axioms QDL.Geometry.valid_organ_radius_positive
#print axioms QDL.Geometry.filament_start
#print axioms QDL.Geometry.filament_end
#print axioms QDL.Geometry.materialOpacity_bounds
#print axioms QDL.Geometry.frame_vertex_budget
#print axioms QDL.Operational.reachable_safe
#print axioms QDL.Operational.reachable_repeat_cap
#print axioms QDL.Operational.render_no_execution
#print axioms QDL.Operational.pause_no_execution
#print axioms QDL.Operational.replay_no_execution
#print axioms QDL.Operational.paused_render_freezes
#print axioms QDL.Operational.denied_action_has_no_receipt
#print axioms QDL.Operational.false_guard_has_no_receipt
#print axioms QDL.Operational.admission_copies_full_source
#print axioms QDL.Operational.differing_source_rejected
#print axioms QDL.Quine.constructor_emits
#print axioms QDL.Quine.repeated_task
#print axioms QDL.Quine.program_emits_itself
#print axioms QDL.Quine.program_injective
#print axioms QDL.Integration.source_distinguishes_design
#print axioms QDL.Integration.changed_design_rejected
#print axioms QDL.Integration.design_bearing_quine
#print axioms QDL.RhythmSafety.warpedPhase_hasDerivAt
#print axioms QDL.RhythmSafety.valid_warpedPhase_derivative_positive
#print axioms QDL.RhythmSafety.valid_warpedPhase_strictMono
#print axioms QDL.RhythmSafety.valid_breathScale_positive
#print axioms QDL.RhythmSafety.valid_breathStretch_defined
#print axioms QDL.RhythmSafety.valid_normalizedWave_bounds

namespace QDL.Audit

/-- Reject a timing asymmetry outside the runtime's authored domain. -/
example : ¬ ( { rate := 1, breath := 0, wave := 0, waveNumber := 0, lag := 0, asymmetry := 81/100, overtone := 0 } : Rhythm).Valid := by
  norm_num [Rhythm.Valid, Bounded]

/-- Reject the zero rate even though a frozen view is permitted independently. -/
example : ¬ ( { rate := 0, breath := 0, wave := 0, waveNumber := 0, lag := 0, asymmetry := 0, overtone := 0 } : Rhythm).Valid := by
  norm_num [Rhythm.Valid, Bounded]

/-- The strict phase lower bound depends on the validator: asymmetry 1 stalls. -/
example : RhythmSafety.phaseVelocity 1 1 Real.pi = 0 := by
  simp [RhythmSafety.phaseVelocity]

/-- The authored breath bound is essential for invertible body stretch. -/
example : RhythmSafety.breathScale 1 (-(Real.pi / 2)) = 0 := by
  simp [RhythmSafety.breathScale]

end QDL.Audit
