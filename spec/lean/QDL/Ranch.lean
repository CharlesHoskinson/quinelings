import Mathlib

/-! Exact-integer local models, not a JS/compiler/hash refinement proof.
Guard preservation and namespace rendering have explicit premises. -/
namespace QDL.Ranch

def nonceMin : Nat := 0
def nonceMax : Nat := 4294967295
def NonceBound (n : Nat) : Prop := nonceMin ≤ n ∧ n ≤ nonceMax

theorem nonce_zero : NonceBound 0 := by norm_num [NonceBound, nonceMin, nonceMax]
theorem nonce_maximum : NonceBound nonceMax := by norm_num [NonceBound, nonceMin, nonceMax]

def GeneBound (g : Int) : Prop := -1000 ≤ g ∧ g ≤ 1000
def clampGene (g : Int) : Int := max (-1000) (min 1000 g)
def midpoint (a b : Int) : Int := (a + b) / 2
def mutate (g delta : Int) : Int := clampGene (g + delta)

theorem clampGene_bounded (g : Int) : GeneBound (clampGene g) := by
  unfold GeneBound clampGene
  constructor
  · exact le_max_left _ _
  · exact max_le (by omega) (min_le_left _ _)

theorem clampGene_identity {g : Int} (h : GeneBound g) : clampGene g = g := by
  unfold clampGene
  rw [min_eq_right h.2, max_eq_right h.1]

theorem midpoint_bounded {a b : Int} (ha : GeneBound a) (hb : GeneBound b) :
    GeneBound (midpoint a b) := by
  unfold midpoint GeneBound at *
  omega

/-- Positive-denominator Euclidean division is floor midpoint, including negatives. -/
theorem midpoint_floor_characterization (a b : Int) :
    2 * midpoint a b ≤ a + b ∧ a + b < 2 * (midpoint a b + 1) := by
  unfold midpoint
  omega

theorem mutation_bounded (g delta : Int) : GeneBound (mutate g delta) :=
  clampGene_bounded _

theorem zero_mutation_identity {g : Int} (h : GeneBound g) : mutate g 0 = g := by
  simpa [mutate] using clampGene_identity h

theorem unsaturated_mutation {g delta : Int} (h : GeneBound (g + delta)) :
    mutate g delta - g = delta := by
  rw [mutate, clampGene_identity h]
  omega

theorem gentle_actual_delta_bound {g delta : Int} (hg : GeneBound g)
    (hd : -80 ≤ delta ∧ delta ≤ 80) :
    -80 ≤ mutate g delta - g ∧ mutate g delta - g ≤ 80 := by
  unfold mutate clampGene
  unfold GeneBound at hg
  by_cases hi : g + delta ≤ 1000
  · rw [min_eq_right hi]
    by_cases lo : -1000 ≤ g + delta
    · rw [max_eq_right lo]
      omega
    · rw [max_eq_left (by omega)]
      omega
  · rw [min_eq_left (by omega), max_eq_right (by omega)]
    omega

/-- Two distinct selected loci; an unselected coordinate is unchanged even when
saturation makes one or both selected loci unchanged too. -/
def mutateTwo (genes : Fin 6 → Int) (i j : Fin 6) (d0 d1 : Int) (k : Fin 6) : Int :=
  if k = i then mutate (genes k) d0
  else if k = j then mutate (genes k) d1 else genes k

theorem two_loci_bounded {genes : Fin 6 → Int} {i j : Fin 6} {d0 d1 : Int}
    (hg : ∀ k, GeneBound (genes k)) (k : Fin 6) :
    GeneBound (mutateTwo genes i j d0 d1 k) := by
  unfold mutateTwo
  split_ifs
  · exact mutation_bounded _ _
  · exact mutation_bounded _ _
  · exact hg k

theorem at_most_two_loci_change {genes : Fin 6 → Int} {i j k : Fin 6} {d0 d1 : Int}
    (h : mutateTwo genes i j d0 d1 k ≠ genes k) : k = i ∨ k = j := by
  by_contra hn
  have hi : k ≠ i := by tauto
  have hj : k ≠ j := by tauto
  exact h (by simp [mutateTwo, hi, hj])

theorem distinct_second_locus {genes : Fin 6 → Int} {i j : Fin 6} {d0 d1 : Int}
    (h : i ≠ j) : mutateTwo genes i j d0 d1 j = mutate (genes j) d1 := by
  simp [mutateTwo, Ne.symm h]

/-- Exact integer micro-unit factors: 1+.12*g/1000 and 1+.10*g/1000. -/
def axialMicro (g : Int) : Int := 1000000 + 120 * g
def radialMicro (g : Int) : Int := 1000000 + 100 * g

theorem axialMicro_bounds {g : Int} (h : GeneBound g) :
    880000 ≤ axialMicro g ∧ axialMicro g ≤ 1120000 := by
  unfold GeneBound axialMicro at *
  omega

theorem radialMicro_bounds {g : Int} (h : GeneBound g) :
    900000 ≤ radialMicro g ∧ radialMicro g ≤ 1100000 := by
  unfold GeneBound radialMicro at *
  omega

theorem trait_scales_positive {g : Int} (h : GeneBound g) :
    0 < axialMicro g ∧ 0 < radialMicro g := by
  have ha := axialMicro_bounds h
  have hr := radialMicro_bounds h
  omega

/-- Role/index identity before the JS decimal string serialization. -/
abbrev RoleNode := Fin 2 × Nat
def roleIndex (role : Fin 2) (index : Nat) : RoleNode := (role, index)

theorem roleIndex_injective {r s : Fin 2} {i j : Nat} :
    roleIndex r i = roleIndex s j ↔ r = s ∧ i = j := by simp [roleIndex]

theorem roles_disjoint {r s : Fin 2} (h : r ≠ s) (i j : Nat) :
    roleIndex r i ≠ roleIndex s j := by
  intro he
  exact h ((roleIndex_injective.mp he).1)

/-- Independent numeric representation with parity-separated roles. -/
def namespaceCode (id : RoleNode) : Nat := 2 * id.2 + id.1.val

theorem namespaceCode_injective : Function.Injective namespaceCode := by
  intro a b he
  rcases a with ⟨r, i⟩
  rcases b with ⟨s, j⟩
  have hr := r.isLt
  have hs := s.isLt
  change 2 * i + r.val = 2 * j + s.val at he
  have hij : i = j := by omega
  have hrs : r.val = s.val := by omega
  have rs : r = s := Fin.ext hrs
  simp [hij, rs]

/-- Concrete JS string serialization still needs a separate proof/test. -/
theorem namespace_render_injective {render : RoleNode → String}
    (h : Function.Injective render) {r s : Fin 2} {i j : Nat}
    (he : render (roleIndex r i) = render (roleIndex s j)) : r = s ∧ i = j :=
  roleIndex_injective.mp (h he)

structure PureNode where
  operation : String
  parameters : List Int
  inputs : List Nat
  deriving DecidableEq

def replacePort (replaced donor port : Nat) : Nat :=
  if port = replaced then donor else port

def substituteNode (replaced donor : Nat) (n : PureNode) : PureNode :=
  { n with inputs := n.inputs.map (replacePort replaced donor) }

/-- Every predecessor port of a guardSet guard node is guardSet too. -/
def GuardConeClosed (graph : Nat → PureNode) (guardSet : Set Nat) : Prop :=
  ∀ id ∈ guardSet, ∀ port ∈ (graph id).inputs, port ∈ guardSet

/-- Unchanged operations/parameters/ordered ports, assuming destination exclusion
and a closed guard cone. Does not prove JS closure discovery or pruning survival. -/
theorem protected_guard_node_unchanged {graph : Nat → PureNode}
    {guardSet : Set Nat} {replaced donor id : Nat}
    (hc : GuardConeClosed graph guardSet) (hr : replaced ∉ guardSet)
    (hi : id ∈ guardSet) : substituteNode replaced donor (graph id) = graph id := by
  have ports : (graph id).inputs.map (replacePort replaced donor) = (graph id).inputs := by
    calc
      _ = (graph id).inputs.map (fun x => x) := by
        apply List.map_congr_left
        intro port hp
        have hn : port ≠ replaced := by
          intro he
          exact hr (he ▸ hc id hi port hp)
        simp [replacePort, hn]
      _ = (graph id).inputs := List.map_id _
  cases hnode : graph id
  simp [substituteNode, hnode] at ports ⊢
  exact ports

structure ActionNode where
  actionName : String
  allowed : Bool
  guard : Nat
  payload : Nat
  deriving DecidableEq

def substituteAction (replaced donor : Nat) (a : ActionNode) : ActionNode :=
  { a with guard := replacePort replaced donor a.guard,
           payload := replacePort replaced donor a.payload }

theorem protected_action_authority_and_guard {a : ActionNode}
    {replaced donor : Nat} (hguard : a.guard ≠ replaced) :
    (substituteAction replaced donor a).actionName = a.actionName ∧
    (substituteAction replaced donor a).allowed = a.allowed ∧
    (substituteAction replaced donor a).guard = a.guard := by
  simp [substituteAction, replacePort, hguard]

theorem payload_donation_changes_only_payload {a : ActionNode} {donor : Nat}
    (h : a.guard ≠ a.payload) :
    substituteAction a.payload donor a = {a with payload := donor} := by
  cases a
  simp_all [substituteAction, replacePort]

/-- Abstract optional surviving nodes; unchanged survival is an explicit premise. -/
def ProtectedSurvival (old : Nat → PureNode) (new : Nat → Option PureNode)
    (guardSet : Set Nat) : Prop := ∀ id ∈ guardSet, new id = some (old id)

theorem surviving_guard_ports_exact {old : Nat → PureNode}
    {new : Nat → Option PureNode} {guardSet : Set Nat} {id : Nat}
    (hs : ProtectedSurvival old new guardSet) (hi : id ∈ guardSet) :
    (new id).map PureNode.inputs = some (old id).inputs := by
  rw [hs id hi]
  rfl

/-- Bookkeeping projection, omitting geometry/pins/ledgers and interpreter internals. -/
structure BirthState where
  parent0 : Nat
  parent1 : Nat
  energy0 : Int
  energy1 : Int
  residents : Nat
  nursery : Nat
  proposals : Nat
  tick : Nat
  revision : Nat
  taskRuns : Nat
  deriving DecidableEq

def BirthStaged (s : BirthState) : Prop :=
  s.parent0 ≠ s.parent1 ∧
  (50 ≤ s.energy0 ∧ s.energy0 ≤ 100) ∧
  (50 ≤ s.energy1 ∧ s.energy1 ≤ 100) ∧
  s.residents < 32 ∧ s.nursery < 8 ∧ 0 < s.proposals ∧
  s.tick + 200 ≤ 1000000 ∧ s.revision < 1000000

instance (s : BirthState) : Decidable (BirthStaged s) :=
  inferInstanceAs (Decidable (_ ∧ _))

def birth (s : BirthState) : BirthState :=
  { s with energy0 := s.energy0 - 30, energy1 := s.energy1 - 30,
           residents := s.residents + 1, nursery := s.nursery + 1,
           proposals := s.proposals - 1, revision := s.revision + 1 }

def stagedBirth (s : BirthState) : BirthState :=
  if BirthStaged s then birth s else s

theorem birth_two_parent_charge (s : BirthState) :
    s.energy0 - (birth s).energy0 = 30 ∧ s.energy1 - (birth s).energy1 = 30 := by
  simp [birth]

theorem birth_energy_bounds {s : BirthState} (h : BirthStaged s) :
    (20 ≤ (birth s).energy0 ∧ (birth s).energy0 ≤ 70) ∧
    (20 ≤ (birth s).energy1 ∧ (birth s).energy1 ≤ 70) := by
  rcases h with ⟨_, h0, h1, _⟩
  simp only [birth]
  omega

theorem birth_capacity_bounds {s : BirthState} (h : BirthStaged s) :
    (birth s).residents ≤ 32 ∧ (birth s).nursery ≤ 8 ∧
    (birth s).revision ≤ 1000000 := by
  unfold BirthStaged at h
  simp only [birth]
  omega

theorem birth_consumes_one_proposal {s : BirthState} (h : BirthStaged s) :
    (birth s).proposals + 1 = s.proposals := by
  unfold BirthStaged at h
  simp only [birth]
  omega

theorem birth_deadline_fits {s : BirthState} (h : BirthStaged s) :
    (birth s).tick + 200 ≤ 1000000 := by
  unfold BirthStaged at h
  simp only [birth]
  omega

theorem birth_passive (s : BirthState) : (birth s).taskRuns = s.taskRuns := rfl

theorem birth_revision_once (s : BirthState) : (birth s).revision = s.revision + 1 := rfl

theorem staged_rejection_preserves_state {s : BirthState} (h : ¬ BirthStaged s) :
    stagedBirth s = s := by simp [stagedBirth, h]

theorem staged_success_has_two_charges {s : BirthState} (h : BirthStaged s) :
    s.energy0 - (stagedBirth s).energy0 = 30 ∧
    s.energy1 - (stagedBirth s).energy1 = 30 := by
  simpa [stagedBirth, h] using birth_two_parent_charge s

theorem staged_birth_passive (s : BirthState) :
    (stagedBirth s).taskRuns = s.taskRuns := by
  unfold stagedBirth
  split_ifs <;> rfl

theorem birth_parent_ids_preserved (s : BirthState) :
    (birth s).parent0 = s.parent0 ∧ (birth s).parent1 = s.parent1 := by
  exact ⟨rfl, rfl⟩

theorem birth_distinct_parents {s : BirthState} (h : BirthStaged s) :
    (birth s).parent0 ≠ (birth s).parent1 := h.1

/-- Local newborn projection with no inherited credential/authority field. -/
structure Newborn where
  energy : Int
  pairingEnabled : Bool
  executionRecord : Option Nat
  deriving DecidableEq

def newborn : Newborn := ⟨40, false, none⟩

theorem newborn_passive_defaults :
    newborn.energy = 40 ∧ newborn.pairingEnabled = false ∧
    newborn.executionRecord = none := by decide

end QDL.Ranch
