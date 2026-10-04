import QDL.Design
import QDL.Quine
import QDL.Semantics

/-! Instantiate source identity with actual constructor ASTs containing a complete
QDL design and task payload. This connects the two models, not the JS implementation. -/
namespace QDL.Integration

def source (design : Design) (task : Payload) (repeats : Nat) : Quine.Term (Design × Payload) :=
  Quine.program (design, task) repeats

theorem source_distinguishes_design {d e : Design} {task other : Payload} {n m : Nat}
    (different : d ≠ e) : source d task n ≠ source e other m := by
  intro h
  have identity := (Quine.program_injective h).1
  exact different (congrArg Prod.fst identity)

/-- Altering any complete design field prevents admission, even with the same task. -/
theorem changed_design_rejected (limits : Operational.Limits)
    (s : Operational.State (Quine.Term (Design × Payload)))
    (d e : Design) (task : Payload) (n : Nat)
    (parent : s.runtime.source = source d task n) (different : e ≠ d) :
    ¬Operational.admissible limits s (source e task n) := by
  apply Operational.differing_source_rejected
  rw [parent]
  exact source_distinguishes_design different

/-- Any total modeled task transformation leaves the constructor source intact. -/
theorem design_bearing_quine (taskRun : (Design × Payload) → (Design × Payload))
    (d : Design) (task : Payload) (n : Nat) (bounded : n + 1 ≤ 8) :
    Quine.Eval taskRun Quine.emptyEnv (source d task (n + 1))
      (.code (source d task (n + 1))) [source d task (n + 1)]
      (List.replicate (n + 1) (d, task)) :=
  Quine.program_emits_itself taskRun (d, task) n bounded

/-- The modeled task kernel reads task data, not presentation parameters. -/
def liftedTask (runTask : Payload → Payload) (input : Design × Payload) : Design × Payload :=
  (input.1, runTask input.2)

theorem task_result_independent_of_design (runTask : Payload → Payload)
    (d e : Design) (task : Payload) :
    (liftedTask runTask (d, task)).2 = (liftedTask runTask (e, task)).2 := rfl

/-- Authoring starts a new source/runtime identity; it is distinct from phase advancement. -/
def reauthor (limits : Operational.Limits) (design : Design) (task : Payload) (repeats : Nat) :
    Operational.State (Quine.Term (Design × Payload)) :=
  Operational.initial (source design task repeats) limits

theorem reauthor_no_execution (limits : Operational.Limits) (design : Design)
    (task : Payload) (repeats : Nat) :
    (reauthor limits design task repeats).runtime.executions = 0 ∧
      (reauthor limits design task repeats).runtime.receipts = 0 := by
  exact ⟨rfl, rfl⟩

end QDL.Integration
