import Std

/-! An operational safety abstraction for QDL. `Source` is the entire program,
including its design. No codec, JavaScript interpreter, or renderer refinement
is assumed. Receipts below are local simulated receipts, not external effects. -/
namespace QDL
namespace Operational

structure Limits where
  repeats : Nat
  population : Nat
  resource : Nat

structure View where
  phase : Nat := 0
  paused : Bool := false
  replayCursor : Nat := 0
  deriving DecidableEq

structure Runtime (Source : Type) where
  source : Source
  origin : Source
  emitted : Option Source := none
  child : Option Source := none
  executions : Nat := 0
  receipts : Nat := 0
  children : Nat := 0
  energy : Nat

structure State (Source : Type) where
  runtime : Runtime Source
  view : View := {}

def initial (source : Source) (limits : Limits) : State Source :=
  { runtime := { source := source, origin := source, energy := limits.resource } }

def admissible (limits : Limits) (s : State Source) (candidate : Source) : Prop :=
  s.runtime.emitted = some s.runtime.source ∧
  candidate = s.runtime.source ∧
  s.runtime.children < limits.population ∧ 0 < s.runtime.energy

def receipt (guard allowed : Bool) : Nat := if guard && allowed then 1 else 0

def executed (s : State Source) (guard allowed : Bool) : State Source :=
  { s with runtime := { s.runtime with
      executions := s.runtime.executions + 1
      receipts := s.runtime.receipts + receipt guard allowed
      emitted := some s.runtime.source
      energy := s.runtime.energy - 1 } }

def admitted (s : State Source) (candidate : Source) : State Source :=
  { s with runtime := { s.runtime with
      children := s.runtime.children + 1
      child := some candidate
      energy := s.runtime.energy - 1 } }

def rendered (s : State Source) : State Source :=
  { s with view := { s.view with
      phase := if s.view.paused then s.view.phase else s.view.phase + 1 } }

def paused (s : State Source) : State Source :=
  { s with view := { s.view with paused := !s.view.paused } }

def replayed (s : State Source) (cursor : Nat) : State Source :=
  { s with view := { s.view with replayCursor := cursor } }

inductive Step (limits : Limits) : State Source → State Source → Prop where
  | render (s) : Step limits s (rendered s)
  | pause (s) : Step limits s (paused s)
  | replay (s) (cursor) : Step limits s (replayed s cursor)
  | execute (s) (guard allowed)
      (repeatAvailable : s.runtime.executions < limits.repeats)
      (resourceAvailable : 0 < s.runtime.energy) :
      Step limits s (executed s guard allowed)
  | admit (s) (candidate) (check : admissible limits s candidate) :
      Step limits s (admitted s candidate)
  | reject (s) (candidate) (check : ¬admissible limits s candidate) :
      Step limits s s

def Safe (limits : Limits) (s : State Source) : Prop :=
  s.runtime.executions ≤ limits.repeats ∧
  s.runtime.receipts ≤ s.runtime.executions ∧
  s.runtime.children ≤ limits.population ∧
  s.runtime.energy + s.runtime.executions + s.runtime.children = limits.resource ∧
  s.runtime.source = s.runtime.origin ∧
  (s.runtime.emitted = none ∨ s.runtime.emitted = some s.runtime.source) ∧
  (s.runtime.child = none ∨ s.runtime.child = some s.runtime.source)

theorem initial_safe (source : Source) (limits : Limits) :
    Safe limits (initial source limits) := by
  simp [Safe, initial]

theorem receipt_le_one (guard allowed : Bool) : receipt guard allowed ≤ 1 := by
  simp only [receipt]
  split <;> omega

theorem step_preserves_safe {limits : Limits} {s t : State Source}
    (safe : Safe limits s) (step : Step limits s t) : Safe limits t := by
  rcases safe with ⟨he, hr, hc, hb, hi, hm, hk⟩
  cases step with
  | render => exact ⟨he, hr, hc, hb, hi, hm, hk⟩
  | pause => exact ⟨he, hr, hc, hb, hi, hm, hk⟩
  | replay => exact ⟨he, hr, hc, hb, hi, hm, hk⟩
  | reject => exact ⟨he, hr, hc, hb, hi, hm, hk⟩
  | execute guard allowed heAvailable hresource =>
      have hreceipt := receipt_le_one guard allowed
      simp only [Safe, executed]
      refine ⟨by omega, by omega, hc, by omega, hi, by simp, hk⟩
  | admit candidate check =>
      rcases check with ⟨hemitted, hcandidate, hchild, hresource⟩
      simp only [Safe, admitted]
      refine ⟨he, hr, by omega, by omega, hi, hm, Or.inr ?_⟩
      exact congrArg some hcandidate

inductive Reachable (limits : Limits) (source : Source) : State Source → Prop where
  | init : Reachable limits source (initial source limits)
  | next {s t} : Reachable limits source s → Step limits s t → Reachable limits source t

theorem reachable_safe {limits : Limits} {source : Source} {s : State Source}
    (reachable : Reachable limits source s) : Safe limits s := by
  induction reachable with
  | init => exact initial_safe source limits
  | next _ step ih => exact step_preserves_safe ih step

theorem reachable_repeat_cap {limits : Limits} {source : Source} {s : State Source}
    (cap : limits.repeats ≤ 8) (reachable : Reachable limits source s) :
    s.runtime.executions ≤ 8 := by
  exact Nat.le_trans (reachable_safe reachable).1 cap

theorem render_no_execution (s : State Source) : (rendered s).runtime = s.runtime := rfl

theorem pause_no_execution (s : State Source) : (paused s).runtime = s.runtime := rfl

theorem replay_no_execution (s : State Source) (cursor : Nat) :
    (replayed s cursor).runtime = s.runtime := rfl

theorem paused_render_freezes (s : State Source) (h : s.view.paused = true) :
    (rendered s).view.phase = s.view.phase := by
  simp [rendered, h]

theorem guarded_receipt (s : State Source) (guard allowed : Bool) :
    (executed s guard allowed).runtime.receipts =
      s.runtime.receipts + if guard && allowed then 1 else 0 := rfl

theorem denied_action_has_no_receipt (s : State Source) (guard : Bool) :
    (executed s guard false).runtime.receipts = s.runtime.receipts := by
  simp [executed, receipt]

theorem false_guard_has_no_receipt (s : State Source) (allowed : Bool) :
    (executed s false allowed).runtime.receipts = s.runtime.receipts := by
  simp [executed, receipt]

theorem differing_source_rejected (limits : Limits) (s : State Source)
    (candidate : Source) (different : candidate ≠ s.runtime.source) :
    ¬admissible limits s candidate := by
  intro h
  exact different h.2.1

theorem admission_copies_full_source (limits : Limits) (s : State Source)
    (candidate : Source) (check : admissible limits s candidate) :
    (admitted s candidate).runtime.child = some s.runtime.source := by
  exact congrArg some check.2.1

theorem exhausted_repeats_block_execution (limits : Limits) (s : State Source)
    (exhausted : limits.repeats ≤ s.runtime.executions) :
    ¬s.runtime.executions < limits.repeats := by omega

theorem exhausted_resource_blocks_admission (limits : Limits) (s : State Source)
    (candidate : Source) (empty : s.runtime.energy = 0) :
    ¬admissible limits s candidate := by
  intro h
  have := h.2.2.2
  omega

end Operational
end QDL
