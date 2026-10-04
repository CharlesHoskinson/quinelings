import Std

/-! Stable-v1 abstract acceptance contracts, not JavaScript refinement.
Request strings stand for already admitted complete canonical requests; keys
stand for session/principal-scoped IDs. Nat state/result tokens abstract bounded
serialized data. Atomic replacement and validation are explicit host premises.
No network, hashes, binary64 implementation, storage driver or typechecker is modeled. -/
namespace QDL.V1

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

-- A visual operation takes and returns the same semantic session.
def render (s : Session) (phase : Nat) : Session × Nat := (s, phase + 1)
theorem render_preserves_semantics (s : Session) (phase : Nat) :
    (render s phase).1 = s := rfl

end QDL.V1

namespace QDL.V1

-- Token lists have count ceilings; encoded byte accounting remains a host
-- preflight premise. Publication is modeled separately from DAG evaluation.
abbrev Trace := { xs : List Nat // xs.length ≤ 64 }
abbrev Outputs := { xs : List Nat // xs.length ≤ 16 }
abbrev Simulations := { xs : List Nat // xs.length ≤ 64 }

inductive Evaluation where
  | ok (trace : Trace) (outputs : Outputs) (simulations : Simulations)
  | failed (trace : Trace) (diagnostic : Nat)

structure Occurrence where
  trace : List Nat
  outputs : List Nat
  published : List Nat
  diagnostic : Option Nat

def publish : Evaluation → Occurrence
  | .ok trace outputs simulations =>
    { trace := trace.val, outputs := outputs.val, published := simulations.val, diagnostic := none }
  | .failed trace diagnostic =>
    { trace := trace.val, outputs := [], published := [], diagnostic := some diagnostic }

theorem failed_publication_empty (trace : Trace) (diagnostic : Nat) :
    (publish (.failed trace diagnostic)).trace = trace.val ∧
    (publish (.failed trace diagnostic)).outputs = [] ∧
    (publish (.failed trace diagnostic)).published = [] := ⟨rfl, rfl, rfl⟩

theorem publication_bounded (e : Evaluation) :
    (publish e).trace.length ≤ 64 ∧ (publish e).outputs.length ≤ 16 ∧
    (publish e).published.length ≤ 64 := by
  cases e with
  | ok trace outputs simulations => exact ⟨trace.property, outputs.property, simulations.property⟩
  | failed trace diagnostic => exact ⟨trace.property, by simp [publish], by simp [publish]⟩

theorem publication_has_finite_outcome (e : Evaluation) :
    (publish e).diagnostic = none ∨
    ((publish e).diagnostic ≠ none ∧ (publish e).outputs = [] ∧
      (publish e).published = []) := by
  cases e <;> simp [publish]

-- Supplied outcomes stop at failure. No claim that JS produces these correctly.
def publishRun : Nat → List Evaluation → List Occurrence
  | 0, _ => []
  | _, [] => []
  | fuel + 1, e :: rest => match e with
    | .ok _ _ _ => publish e :: publishRun fuel rest
    | .failed _ _ => [publish e]

theorem run_bounded (fuel : Nat) (es : List Evaluation) :
    (publishRun fuel es).length ≤ fuel := by
  induction fuel generalizing es with
  | zero => simp [publishRun]
  | succ fuel ih =>
    cases es with
    | nil => simp [publishRun]
    | cons e rest =>
      cases e with
      | ok trace outputs simulations =>
        simpa [publishRun] using Nat.succ_le_succ (ih rest)
      | failed trace diagnostic => simp [publishRun]

theorem run_repeat_ceiling (fuel : Nat) (es : List Evaluation) (cap : fuel ≤ 8) :
    (publishRun fuel es).length ≤ 8 := Nat.le_trans (run_bounded fuel es) cap

theorem failed_stops_later_occurrences (fuel : Nat) (rest : List Evaluation)
    (trace : Trace) (diagnostic : Nat) :
    publishRun (fuel + 1) (.failed trace diagnostic :: rest) =
      [publish (.failed trace diagnostic)] := rfl

-- Minimal structural type fragment. Quantities are exact Nat tokens with
-- symbolic units: no binary64, record schema, refinements or registry proof.
inductive Ty where
  | boolean | text | quantity (unit : String) | array (element : Ty) | optional (element : Ty)
  deriving DecidableEq

inductive Data where
  | boolean (value : Bool) | text (value : String)
  | quantity (value : Nat) (unit : String) | array (values : List Data) | null

def typeChecks : Ty → Data → Bool
  | .boolean, .boolean _ => true
  | .text, .text _ => true
  | .quantity u, .quantity _ v => u == v
  | .array t, .array values => values.all (typeChecks t)
  | .optional _, .null => true
  | .optional t, value => typeChecks t value
  | _, _ => false

structure Source where
  canonical : String
  registry : String
  profile : String
  ports : String → Option Ty

abbrev Bindings := String → Option Data

def ExactBindings (source : Source) (bindings : Bindings) : Prop :=
  (∀ name ty, source.ports name = some ty →
    ∃ value, bindings name = some value ∧ typeChecks ty value = true) ∧
  (∀ name value, bindings name = some value → ∃ ty, source.ports name = some ty)

def resolve (source : Source) (bindings : Bindings) (name : String) : Option Data :=
  match source.ports name, bindings name with
  | some ty, some value => if typeChecks ty value then some value else none
  | _, _ => none

structure Invocation where
  source : Source
  bindings : Bindings

def bind (source : Source) (bindings : Bindings) : Invocation := {source, bindings}

theorem bind_preserves_complete_source (source : Source) (bindings : Bindings) :
    (bind source bindings).source = source := rfl

theorem admitted_port_resolves (source : Source) (bindings : Bindings)
    (exact : ExactBindings source bindings) (name : String) (ty : Ty)
    (port : source.ports name = some ty) :
    ∃ value, resolve source bindings name = some value ∧ typeChecks ty value = true := by
  obtain ⟨value, hb, ht⟩ := exact.1 name ty port
  exact ⟨value, by simp [resolve, port, hb, ht], ht⟩

theorem resolved_port_has_declared_type (source : Source) (bindings : Bindings)
    (name : String) (value : Data) (resolved : resolve source bindings name = some value) :
    ∃ ty, source.ports name = some ty ∧ typeChecks ty value = true := by
  unfold resolve at resolved
  split at resolved
  · rename_i ty candidate hp hb
    split at resolved
    · rename_i ht
      have same : candidate = value := Option.some.inj resolved
      subst candidate
      exact ⟨ty, hp, ht⟩
    · contradiction
  · contradiction

theorem wrong_unit_refuses (a b : String) (n : Nat) (different : a ≠ b) :
    typeChecks (.quantity a) (.quantity n b) = false := by
  simp [typeChecks, different]

theorem optional_null_admitted (ty : Ty) : typeChecks (.optional ty) .null = true := rfl

-- The evaluator is an explicit parameter with no ambient access in this model.
-- It may succeed or fail; neither outcome replaces source with bound values.
def evaluateInvocation (evaluate : Source → Bindings → Evaluation)
    (invocation : Invocation) : Source × Occurrence :=
  (invocation.source, publish (evaluate invocation.source invocation.bindings))

theorem evaluation_preserves_complete_source (evaluate : Source → Bindings → Evaluation)
    (invocation : Invocation) :
    (evaluateInvocation evaluate invocation).1 = invocation.source := rfl

def confirmedTotal : List Observation → Nat
  | [] => 0
  | o :: rest => contribution o + confirmedTotal rest

-- Lists here represent the SAME distinct attempt identities in the SAME order.
-- Duplicate-ID validation and attempt grouping are explicit adapter premises;
-- this theorem neither deduplicates raw receipts nor verifies their provenance.
inductive ValidUpdates : List Observation → List Observation → Prop where
  | nil : ValidUpdates [] []
  | cons {old updated rest updatedRest} : CanObserve old updated →
      ValidUpdates rest updatedRest → ValidUpdates (old :: rest) (updated :: updatedRest)

theorem confirmed_total_monotone (old updated : List Observation)
    (valid : ValidUpdates old updated) :
    confirmedTotal old ≤ confirmedTotal updated := by
  induction valid with
  | nil => exact Nat.le_refl _
  | cons valid rest ih =>
    exact Nat.add_le_add (confirmed_units_monotone _ _ valid) ih

structure Command where
  key : Nat
  request : String
  expected : Nat
  draft : Nat
  response : Nat
  ready : Bool

def executeMany : Session → List Command → Session
  | s, [] => s
  | s, c :: rest => executeMany
    (execute s c.key c.request c.expected c.draft c.response c.ready).1 rest

theorem occupied_key_forever (s : Session) (commands : List Command)
    (key : Nat) (r : Receipt) (present : s.receipts key = some r) :
    (executeMany s commands).receipts key = some r := by
  induction commands generalizing s with
  | nil => exact present
  | cons c rest ih =>
    exact ih _ (receipt_monotone s c.key key c.request c.expected c.draft c.response c.ready r present)

end QDL.V1

-- Audit every named theorem: standard Lean foundation only.
#print axioms QDL.V1.existing_key_no_mutation
#print axioms QDL.V1.exact_replay
#print axioms QDL.V1.changed_request_conflicts
#print axioms QDL.V1.unready_no_commit
#print axioms QDL.V1.fresh_atomic_commit
#print axioms QDL.V1.commit_other_key
#print axioms QDL.V1.receipt_monotone
#print axioms QDL.V1.commit_then_replay
#print axioms QDL.V1.terminal_cannot_regress
#print axioms QDL.V1.confirmed_units_monotone
#print axioms QDL.V1.unknown_blocks_retry
#print axioms QDL.V1.render_preserves_semantics
#print axioms QDL.V1.failed_publication_empty
#print axioms QDL.V1.publication_bounded
#print axioms QDL.V1.publication_has_finite_outcome
#print axioms QDL.V1.run_bounded
#print axioms QDL.V1.run_repeat_ceiling
#print axioms QDL.V1.failed_stops_later_occurrences
#print axioms QDL.V1.bind_preserves_complete_source
#print axioms QDL.V1.admitted_port_resolves
#print axioms QDL.V1.resolved_port_has_declared_type
#print axioms QDL.V1.wrong_unit_refuses
#print axioms QDL.V1.optional_null_admitted
#print axioms QDL.V1.evaluation_preserves_complete_source
#print axioms QDL.V1.confirmed_total_monotone
#print axioms QDL.V1.occupied_key_forever
