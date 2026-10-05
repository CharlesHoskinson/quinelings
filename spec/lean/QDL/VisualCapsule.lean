import QDL.Quine
import QDL.Semantics

/-! The experimental capsule keeps a complete task source and a separate body
record in its constructor payload. This instantiates the constructor theorem;
it does not verify JSON admission, the JS dispatcher, codecs or numerical geometry.
The task runner below is abstract and total. Runtime diagnostics and bindings
are checked by the executable contract tests rather than this abstraction. -/
namespace QDL.VisualCapsule

variable {Source Body Result : Type}

abbrev Payload (Source Body : Type) := Source × Body

def source (task : Source) (body : Body) : Quine.Term (Payload Source Body) :=
  Quine.program (task, body) 1

theorem exact_constructor_reproduction
    (runPayload : Payload Source Body → Payload Source Body)
    (task : Source) (body : Body) :
    Quine.Eval runPayload Quine.emptyEnv (source task body)
      (.code (source task body)) [source task body] [(task, body)] := by
  simpa [source] using
    (Quine.program_emits_itself runPayload (task, body) 0 (by decide))

theorem complete_source_identity {task other : Source} {body alternative : Body}
    (equal : source task body = source other alternative) :
    task = other ∧ body = alternative := by
  have payload := (Quine.program_injective equal).1
  exact ⟨congrArg Prod.fst payload, congrArg Prod.snd payload⟩

theorem changed_body_changes_source {task : Source} {body alternative : Body}
    (different : body ≠ alternative) : source task body ≠ source task alternative := by
  intro equal
  exact different (complete_source_identity equal).2

theorem changed_task_changes_source {task other : Source} {body : Body}
    (different : task ≠ other) : source task body ≠ source other body := by
  intro equal
  exact different (complete_source_identity equal).1

/-- The modeled useful computation receives the retained task, never body data. -/
def evaluateTask (runTask : Source → Result) (payload : Payload Source Body) : Result :=
  runTask payload.1

theorem useful_result_independent_of_body (runTask : Source → Result)
    (task : Source) (body alternative : Body) :
    evaluateTask runTask (task, body) = evaluateTask runTask (task, alternative) := rfl

def author (limits : Operational.Limits) (task : Source) (body : Body) :
    Operational.State (Quine.Term (Payload Source Body)) :=
  Operational.initial (source task body) limits

theorem author_is_passive (limits : Operational.Limits) (task : Source) (body : Body) :
    (author limits task body).runtime.executions = 0 ∧
      (author limits task body).runtime.receipts = 0 := ⟨rfl, rfl⟩

end QDL.VisualCapsule
