import Mathlib.Data.List.Basic
import Mathlib.Tactic

/-! Constructor quines for the executable fragment used by `core.js`.
Payloads are arbitrary and may contain the complete graph and QDL design.
The task runner is a parameter, not an assumed implementation of JS kernels. -/
namespace QDL.Quine

inductive Term (Payload : Type) where
  | payload : Payload → Term Payload
  | var : Nat → Term Payload
  | quote : Term Payload → Term Payload
  | run : Term Payload → Term Payload
  | lambda : Term Payload → Term Payload
  | apply : Term Payload → Term Payload → Term Payload
  | seq : Term Payload → Term Payload → Term Payload
  | task : Term Payload → Term Payload
  | repeat : Nat → Term Payload → Term Payload
  | emit : Term Payload → Term Payload
  | makeQuote : Term Payload → Term Payload
  | makeRun : Term Payload → Term Payload
  | makeApply : Term Payload → Term Payload → Term Payload
  deriving Repr

abbrev Env (P : Type) := Nat → Option (Term P)
def emptyEnv : Env P := fun _ => none
def bind (env : Env P) (t : Term P) : Env P := fun i =>
  if i = 0 then some t else env (i - 1)

inductive Value (P : Type) where
  | code : Term P → Value P
  | closure : Term P → Env P → Value P

/-- Big-step evaluation with ordered emissions and task invocations.
Closures capture code-valued variables, covering the constructor-quine fragment.
There is no rule that returns the currently executing program's source. -/
inductive Eval (taskRun : P → P) :
    Env P → Term P → Value P → List (Term P) → List P → Prop where
  | var (h : env i = some t) : Eval taskRun env (.var i) (.code t) [] []
  | quote : Eval taskRun env (.quote t) (.code t) [] []
  | lambda : Eval taskRun env (.lambda body) (.closure body env) [] []
  | run : Eval taskRun env expr (.code t) e₁ a₁ →
      Eval taskRun emptyEnv t v e₂ a₂ →
      Eval taskRun env (.run expr) v (e₁ ++ e₂) (a₁ ++ a₂)
  | apply : Eval taskRun env f (.closure body captured) e₁ a₁ →
      Eval taskRun env arg (.code t) e₂ a₂ →
      Eval taskRun (bind captured t) body v e₃ a₃ →
      Eval taskRun env (.apply f arg) v (e₁ ++ e₂ ++ e₃) (a₁ ++ a₂ ++ a₃)
  | seq : Eval taskRun env first v₁ e₁ a₁ →
      Eval taskRun env second v₂ e₂ a₂ →
      Eval taskRun env (.seq first second) v₂ (e₁ ++ e₂) (a₁ ++ a₂)
  | task : Eval taskRun env expr (.code (.payload p)) e a →
      Eval taskRun env (.task expr) (.code (.payload (taskRun p))) e (a ++ [p])
  | repeatOne : Eval taskRun env expr v e a →
      Eval taskRun env (.repeat 1 expr) v e a
  | repeatNext : n + 2 ≤ 8 → Eval taskRun env expr v₁ e₁ a₁ →
      Eval taskRun env (.repeat (n + 1) expr) v₂ e₂ a₂ →
      Eval taskRun env (.repeat (n + 2) expr) v₂ (e₁ ++ e₂) (a₁ ++ a₂)
  | emit : Eval taskRun env expr (.code t) e a →
      Eval taskRun env (.emit expr) (.code t) (e ++ [t]) a
  | makeQuote : Eval taskRun env expr (.code t) e a →
      Eval taskRun env (.makeQuote expr) (.code (.quote t)) e a
  | makeRun : Eval taskRun env expr (.code t) e a →
      Eval taskRun env (.makeRun expr) (.code (.run t)) e a
  | makeApply : Eval taskRun env f (.code t) e₁ a₁ →
      Eval taskRun env arg (.code u) e₂ a₂ →
      Eval taskRun env (.makeApply f arg) (.code (.apply t u)) (e₁ ++ e₂) (a₁ ++ a₂)

/-- The source construction expression has the same shape as `makeTaskProgram`. -/
def constructor : Term P :=
  .emit (.makeApply (.makeRun (.makeQuote (.var 0))) (.makeQuote (.var 0)))

def body (p : P) (repeats : Nat) : Term P :=
  .lambda (.seq (.repeat repeats (.task (.quote (.payload p)))) constructor)

def program (p : P) (repeats : Nat) : Term P :=
  .apply (.run (.quote (body p repeats))) (.quote (body p repeats))

/-- A bound quoted body becomes a complete AST by ordinary constructors. -/
theorem constructor_emits (taskRun : P → P) (t : Term P) :
    Eval taskRun (bind emptyEnv t) constructor
      (.code (.apply (.run (.quote t)) (.quote t)))
      [.apply (.run (.quote t)) (.quote t)] [] := by
  have hv : Eval taskRun (bind emptyEnv t) (.var 0) (.code t) [] [] :=
    Eval.var (by simp [bind])
  exact Eval.emit (Eval.makeApply (Eval.makeRun (Eval.makeQuote hv)) (Eval.makeQuote hv))

/-- Repetition invokes the useful task exactly `n+1` times, emitting no source. -/
theorem repeated_task (taskRun : P → P) (env : Env P) (p : P)
    (n : Nat) (bounded : n + 1 ≤ 8) :
    Eval taskRun env (.repeat (n + 1) (.task (.quote (.payload p))))
      (.code (.payload (taskRun p))) [] (List.replicate (n + 1) p) := by
  induction n with
  | zero => exact Eval.repeatOne (Eval.task Eval.quote)
  | succ n ih =>
      have previous := ih (by omega)
      have step := Eval.repeatNext (by omega : n + 2 ≤ 8)
        (Eval.task (env := env) (p := p) Eval.quote) previous
      simpa [List.replicate_succ] using step

/-- Evaluation derives exact reproduction for every payload and task runner.
Any embedded design is copied along with the complete AST. -/
theorem program_emits_itself (taskRun : P → P) (p : P) (n : Nat)
    (bounded : n + 1 ≤ 8) :
    Eval taskRun emptyEnv (program p (n + 1))
      (.code (program p (n + 1))) [program p (n + 1)]
      (List.replicate (n + 1) p) := by
  have useful := repeated_task taskRun (bind emptyEnv (body p (n + 1))) p n bounded
  have reproduction := constructor_emits taskRun (body p (n + 1))
  have combined := Eval.seq useful reproduction
  have application := Eval.apply (env := emptyEnv) (Eval.run Eval.quote Eval.lambda) Eval.quote combined
  simpa [program, body] using application

/-- The reproducing source distinguishes every payload and repeat budget. -/
theorem program_injective {p q : P} {n m : Nat}
    (h : program p n = program q m) : p = q ∧ n = m := by
  simp only [program, body, Term.apply.injEq, Term.run.injEq,
    Term.quote.injEq, Term.lambda.injEq, Term.seq.injEq,
    Term.repeat.injEq, Term.task.injEq, Term.payload.injEq] at h
  exact ⟨h.1.1.2, h.1.1.1⟩

end QDL.Quine
