import Std

/-! Isolated acceptance-contract prototype, not JavaScript refinement.
Request strings stand for already admitted complete canonical requests; keys
stand for session/principal-scoped IDs. Nat state/result tokens abstract bounded
serialized data. Atomic replacement and validation are explicit host premises.
No network, hashes, binary64 implementation, storage driver or typechecker is modeled. -/
namespace QDLV1Research

structure Receipt where
  request : String
  response : Nat
  revision : Nat
  deriving DecidableEq

structure Session where
  world : Nat
  revision : Nat
  receipts : Nat → Option Receipt

inductive Reply where
  | result (response : Nat)
  | conflict
  | refused
  deriving DecidableEq

def commit (s : Session) (key : Nat) (request : String)
    (draft response : Nat) : Session :=
  { world := draft, revision := s.revision + 1,
    receipts := fun k => if k = key then
      some { request, response, revision := s.revision + 1 } else s.receipts k }

-- Replay precedes expected-revision validation. The response, receipt and world
-- have already been staged/validated when ready=true; the ledger never evicts.
def execute (s : Session) (key : Nat) (request : String)
    (expected draft response : Nat) (ready : Bool) : Session × Reply :=
  match s.receipts key with
  | some r => if r.request = request then (s, .result r.response) else (s, .conflict)
  | none => if expected = s.revision ∧ ready = true then
      (commit s key request draft response, .result response) else (s, .refused)

theorem existing_key_no_mutation (s : Session) (key : Nat) (request : String)
    (expected draft response : Nat) (ready : Bool) (r : Receipt)
    (present : s.receipts key = some r) :
    (execute s key request expected draft response ready).1 = s := by
  simp [execute, present]
  split <;> rfl

theorem exact_replay (s : Session) (key : Nat) (r : Receipt)
    (expected draft response : Nat) (ready : Bool)
    (present : s.receipts key = some r) :
    execute s key r.request expected draft response ready = (s, .result r.response) := by
  simp [execute, present]

theorem changed_request_conflicts (s : Session) (key : Nat) (r : Receipt)
    (request : String) (expected draft response : Nat) (ready : Bool)
    (present : s.receipts key = some r) (changed : r.request ≠ request) :
    execute s key request expected draft response ready = (s, .conflict) := by
  simp [execute, present, changed]

theorem unready_no_commit (s : Session) (key : Nat) (request : String)
    (expected draft response : Nat) (missing : s.receipts key = none) :
    execute s key request expected draft response false = (s, .refused) := by
  simp [execute, missing]

theorem fresh_atomic_commit (s : Session) (key : Nat) (request : String)
    (draft response : Nat) (missing : s.receipts key = none) :
    let t := (execute s key request s.revision draft response true).1
    t.world = draft ∧ t.revision = s.revision + 1 ∧
    t.receipts key = some { request, response, revision := t.revision } := by
  simp [execute, missing, commit]

theorem commit_other_key (s : Session) (key other : Nat) (request : String)
    (draft response : Nat) (different : other ≠ key) :
    (commit s key request draft response).receipts other = s.receipts other := by
  simp [commit, different]

-- Occupied slots are immutable under ALL execute calls, including other keys.
theorem receipt_monotone (s : Session) (key other : Nat) (request : String)
    (expected draft response : Nat) (ready : Bool) (r : Receipt)
    (present : s.receipts other = some r) :
    (execute s key request expected draft response ready).1.receipts other = some r := by
  by_cases same : other = key
  · subst other
    rw [existing_key_no_mutation s key request expected draft response ready r present]
    exact present
  · unfold execute
    split
    · split <;> exact present
    · split
      · simpa [commit, same] using present
      · exact present

-- A fresh local commit followed by a lost response and arbitrary replay data
-- never commits again, even when expected revision is now stale.
theorem commit_then_replay (s : Session) (key : Nat) (request : String)
    (draft response expected otherDraft otherResponse : Nat) (ready : Bool) :
    execute (commit s key request draft response) key request expected
      otherDraft otherResponse ready =
    (commit s key request draft response, .result response) := by
  simp [execute, commit]

inductive Status where
  | pending | unknown | confirmed | failed
  deriving DecidableEq

structure Observation where
  status : Status
  units : Nat
  deriving DecidableEq

def terminal (o : Observation) : Prop :=
  o.status = .confirmed ∨ o.status = .failed

-- Sequence ordering and duplicate receipt-ID validation precede this relation.
-- pending/unknown may resolve; a terminal observation is immutable.
def CanObserve (old new : Observation) : Prop := terminal old → new = old

theorem terminal_cannot_regress (old new : Observation)
    (done : terminal old) (valid : CanObserve old new) : new = old := valid done

def contribution (o : Observation) : Nat :=
  if o.status = .confirmed then o.units else 0

theorem confirmed_units_monotone (old new : Observation)
    (valid : CanObserve old new) : contribution old ≤ contribution new := by
  by_cases h : old.status = .confirmed
  · have same := valid (Or.inl h)
    subst new
    exact Nat.le_refl _
  · simp [contribution, h]

def mayRetry (observations : List Observation) : Bool :=
  !(observations.any fun o => o.status == .pending || o.status == .unknown)

theorem unknown_blocks_retry (rest : List Observation) (units : Nat) :
    mayRetry ({status := .unknown, units} :: rest) = false := by
  simp [mayRetry]

-- Failure keeps bounded trace separately; it publishes neither outputs nor
-- simulated receipts. Resource accounting/trace length are not modeled here.
structure Occurrence where
  trace : List Nat
  outputs : List Nat
  published : List Nat

def failure (trace : List Nat) : Occurrence := {trace, outputs := [], published := []}

theorem failed_publication_empty (trace : List Nat) :
    (failure trace).trace = trace ∧ (failure trace).outputs = [] ∧
    (failure trace).published = [] := ⟨rfl, rfl, rfl⟩

-- A visual operation takes and returns the same semantic session.
def render (s : Session) (phase : Nat) : Session × Nat := (s, phase + 1)
theorem render_preserves_semantics (s : Session) (phase : Nat) :
    (render s phase).1 = s := rfl

#print axioms receipt_monotone
#print axioms fresh_atomic_commit
#print axioms commit_then_replay
#print axioms confirmed_units_monotone
#print axioms unknown_blocks_retry
#print axioms failed_publication_empty
#print axioms render_preserves_semantics
end QDLV1Research
