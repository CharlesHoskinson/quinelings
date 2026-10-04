# Operational-safety review

The Lean module `QDL/Semantics.lean` treats `Source` as an arbitrary complete source value: program graph, constructor, and all QDL design controls are inseparable for admission. It does not substitute a graph ID for source equality. A source can later be instantiated with an actual AST or validated design-bearing record.

A separate `View` contains phase, pause, and replay cursor. Rendering, pausing, and replaying preserve the entire runtime by definitional equality. Execution consumes one resource and one repeat allowance and produces at most one local simulated receipt, requiring both guard and allowed. Admission consumes a resource and population slot and requires prior emission plus exact parent/candidate equality.

The inductive transition system proves safety for arbitrary finite reachable traces: bounded executions, receipts, and population; exact conservation of resource plus executions plus children; parent source identity; and emitted/child identity. An eight-cycle cap follows when the configured repeat limit is at most eight. Unequal candidates and exhausted resource/repeat budgets are blocked.

This model is a host-policy abstraction. The website currently simulates actions; the proof does not verify JavaScript, canonical serialization, numeric/color codecs, external side effects, or executable child scheduling. Emission in this module assigns the complete source symbolically. Constructor-quine correctness must be proved independently before using that assignment as a refinement theorem. Limits are natural numbers; a valid QDL source must independently establish the actual 1–8 repeat domain.
