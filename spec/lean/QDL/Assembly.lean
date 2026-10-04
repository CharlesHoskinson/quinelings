import Mathlib
namespace QDL.Assembly
noncomputable def H (z : ℝ) := 6*z^5 - 15*z^4 + 10*z^3
noncomputable def V (z : ℝ) := 30*z^2*(1-z)^2
noncomputable def A (z : ℝ) := 60*z*(1-z)*(1-2*z)
theorem H_factor (z : ℝ) : H z = z^3*(6*(1-z)^2+3*(1-z)+1) := by unfold H; ring
theorem complement_factor (z : ℝ) : 1-H z = (1-z)^3*(6*z^2+3*z+1) := by unfold H; ring
theorem H_bounds {z : ℝ} (hz : 0 ≤ z) (hz1 : z ≤ 1) : 0 ≤ H z ∧ H z ≤ 1 := by
  have hnon : 0 ≤ 1-z := by linarith
  constructor
  · rw [H_factor]; positivity
  · have hp : 0 ≤ 1-H z := by rw [complement_factor]; positivity
    linarith

theorem H_derivative (z : ℝ) : HasDerivAt H (V z) z := by
  have h := (((hasDerivAt_pow 5 z).const_mul 6).sub ((hasDerivAt_pow 4 z).const_mul 15)).add ((hasDerivAt_pow 3 z).const_mul 10)
  convert h using 1
  · ext x; simp [H]
  · simp [V]; ring

theorem V_derivative (z : ℝ) : HasDerivAt V (A z) z := by
  have h := (((hasDerivAt_pow 2 z).const_mul 30).sub ((hasDerivAt_pow 3 z).const_mul 60)).add ((hasDerivAt_pow 4 z).const_mul 30)
  convert h using 1
  · ext x; simp [V]; ring
  · simp [A]; ring

theorem endpoints : H 0=0 ∧ H 1=1 ∧ V 0=0 ∧ V 1=0 ∧ A 0=0 ∧ A 1=0 := by norm_num [H,V,A]
theorem velocity_nonnegative (z : ℝ) : 0 ≤ V z := by unfold V; positivity

theorem convex_interval {lo hi a b z : ℝ} (ha : lo ≤ a ∧ a ≤ hi) (hb : lo ≤ b ∧ b ≤ hi) (hz : 0 ≤ z ∧ z ≤ 1) :
 lo ≤ (1-H z)*a+H z*b ∧ (1-H z)*a+H z*b ≤ hi := by
 have hh := H_bounds hz.1 hz.2
 have one : 0 ≤ 1-H z := by linarith
 have al := mul_le_mul_of_nonneg_left ha.1 one
 have bl := mul_le_mul_of_nonneg_left hb.1 hh.1
 have au := mul_le_mul_of_nonneg_left ha.2 one
 have bu := mul_le_mul_of_nonneg_left hb.2 hh.1
 constructor <;> nlinarith


/-! Exact-real local contracts of anatomy.js. These are not a parser/IEEE-754
refinement, complete atlas proof, global embedding, piecewise C² gluing, or
an aesthetic theorem. H is algebraically the runtime factored polynomial. -/

theorem runtime_H (z : ℝ) : H z = z^3*(10+z*(-15+6*z)) := by unfold H; ring

inductive GestureKind where
  | gather | unfurl | glide | hover
  deriving DecidableEq, Repr

structure Gesture where
  kind : GestureKind
  strength : ℚ
  prepare : Nat
  stroke : Nat
  recover : Nat
  rest : Nat
  deriving DecidableEq, Repr

def Gesture.Valid (g : Gesture) : Prop :=
  (0 ≤ g.strength ∧ g.strength ≤ 1) ∧
  100 ≤ g.prepare ∧ 100 ≤ g.stroke ∧ 100 ≤ g.recover ∧ 100 ≤ g.rest ∧
  g.prepare + g.stroke + g.recover + g.rest = 1000

instance (g : Gesture) : Decidable g.Valid := inferInstanceAs (Decidable (_ ∧ _))

theorem valid_tick_bounds {g : Gesture} (h : g.Valid) :
    g.prepare ≤ 700 ∧ g.stroke ≤ 700 ∧ g.recover ≤ 700 ∧ g.rest ≤ 700 := by
  rcases h with ⟨_, hp, hs, hc, hr, total⟩
  omega

theorem valid_ticks_positive {g : Gesture} (h : g.Valid) :
    0 < g.prepare ∧ 0 < g.stroke ∧ 0 < g.recover ∧ 0 < g.rest := by
  rcases h with ⟨_, hp, hs, hc, hr, _⟩
  omega

/-- Runtime local y-coordinate of the bowed axial sweep. -/
noncomputable def axialY (length u : ℝ) := length*u

theorem axialY_derivative (length u : ℝ) : HasDerivAt (axialY length) length u := by
  change HasDerivAt (fun t : ℝ => length*t) length u
  convert (hasDerivAt_id u).const_mul length using 1 <;> simp

theorem positive_axial_derivative {length : ℝ} (h : 0 < length) (u : ℝ) :
    0 < deriv (axialY length) u := by
  rw [(axialY_derivative length u).deriv]
  exact h

theorem axialY_strictMono {length : ℝ} (h : 0 < length) : StrictMono (axialY length) :=
  strictMono_of_deriv_pos (positive_axial_derivative h)

noncomputable def radius (root tip u : ℝ) := root + (tip-root)*u

theorem radius_positive {root tip u : ℝ} (hr : 0 < root) (ht : 0 < tip)
    (hu : 0 ≤ u ∧ u ≤ 1) : 0 < radius root tip u := by
  have a : 0 ≤ (1-u)*root := mul_nonneg (by linarith) (le_of_lt hr)
  unfold radius
  by_cases h : u = 0
  · subst u; simpa using hr
  · have : 0 < u*tip := mul_pos (lt_of_le_of_ne hu.1 (Ne.symm h)) ht
    nlinarith

/-- Product of the root's diagonal scales; rotation is a separate factor. -/
theorem scale_product_one (sigma : ℝ) :
    Real.exp (-sigma/2) * Real.exp sigma * Real.exp (-sigma/2) = 1 := by
  rw [← Real.exp_add, ← Real.exp_add]
  have : -sigma/2 + sigma + -sigma/2 = 0 := by ring
  rw [this, Real.exp_zero]

theorem scales_positive (sigma : ℝ) :
    0 < Real.exp (-sigma/2) ∧ 0 < Real.exp sigma :=
  ⟨Real.exp_pos _, Real.exp_pos _⟩

abbrev Point := Fin 3 → ℝ
noncomputable def attach (socket : Point) (map : Point →ₗ[ℝ] Point) (q : Point) : Point :=
  socket + map q

theorem attachment_root (socket : Point) (map : Point →ₗ[ℝ] Point) :
    attach socket map 0 = socket := by simp [attach]

def Owns (lo hi u : ℝ) : Prop := lo ≤ u ∧ u < hi

theorem adjacent_owners_disjoint {lo hi nextLo nextHi u : ℝ}
    (ordered : hi ≤ nextLo) (first : Owns lo hi u) : ¬ Owns nextLo nextHi u := by
  intro second
  rcases first with ⟨_, firstHi⟩
  rcases second with ⟨secondLo, _⟩
  linarith

theorem territory_has_interior {lo hi : ℝ} (h : lo < hi) :
    lo < (lo+hi)/2 ∧ (lo+hi)/2 < hi := by constructor <;> linarith

theorem boundary_goes_to_upper {lo boundary hi : ℝ} (h : boundary < hi) :
    ¬ Owns lo boundary boundary ∧ Owns boundary hi boundary := by
  simp [Owns,h]

/-- One reserved sample per territory and at most two chart disks per part. -/
def reserved (owners components : Nat) := owners + 2*components

theorem reserve_fits {owners components budget : Nat} (ho : owners ≤ 128)
    (hc : components ≤ 16) (hb : 4000 ≤ budget) : reserved owners components ≤ budget := by
  unfold reserved
  omega

theorem allocation_exact {reservation budget : Nat} (h : reservation ≤ budget) :
    reservation + (budget-reservation) = budget := Nat.add_sub_of_le h

def crestVertices (crests : Nat) := crests*301

theorem crest_budget {crests : Nat} (h : crests ≤ 4) : crestVertices crests ≤ 1204 := by
  unfold crestVertices
  omega

theorem aggregate_budget {budget crests : Nat} (hb : budget ≤ 24000) (hc : crests ≤ 4) :
    budget + crestVertices crests ≤ 25204 := by
  have := crest_budget hc
  omega


/-! Exact authored numeric domains. These declarations support the schema
correspondence script; validity lemmas are local, not a full assembly parser. -/
def seedMin : ℚ := 0
def seedMax : ℚ := 4294967295
def componentMin : Nat := 1
def componentMax : Nat := 16
def ownerMin : Nat := 1
def ownerMax : Nat := 128
def idMin : Nat := 1
def idMax : Nat := 64
def depthMax : Nat := 4
def fanoutMax : Nat := 4
def nodeMax : Nat := 64
def spineLengthMin : ℚ := 12/100
def spineLengthMax : ℚ := 12/10
def radiusMin : ℚ := 15/1000
def radiusMax : ℚ := 16/100
def bendMin : ℚ := -2/10
def bendMax : ℚ := 2/10
def axisMin : ℚ := 4/100
def axisMax : ℚ := 35/100
def coordinateMin : ℚ := 0
def coordinateMax : ℚ := 1
-- JSON decimal bound for Math.PI, not a proof of floating-point pi accuracy.
def angleMin : ℚ := -3141592653589793/1000000000000000
def angleMax : ℚ := 3141592653589793/1000000000000000
def hingeMin : ℚ := -12/100
def hingeMax : ℚ := 12/100
def pathHingeMax : ℚ := 35/100
def strengthMin : ℚ := 0
def strengthMax : ℚ := 1
def tickMin : Nat := 100
def tickMax : Nat := 700
def tickTotal : Nat := 1000
def tissueMin : Nat := 4000
def tissueMax : Nat := 24000
def crestMin : Nat := 2
def crestMax : Nat := 4
def phaseAbsMax : ℚ := 1000000000

def InDomain (lo hi value : ℚ) : Prop := lo ≤ value ∧ value ≤ hi
structure SpineControls where
  length : ℚ
  rootRadius : ℚ
  tipRadius : ℚ
  bendX : ℚ
  bendZ : ℚ
  deriving DecidableEq, Repr

def SpineControls.Valid (s : SpineControls) : Prop :=
  InDomain spineLengthMin spineLengthMax s.length ∧
  InDomain radiusMin radiusMax s.rootRadius ∧
  InDomain radiusMin radiusMax s.tipRadius ∧
  InDomain bendMin bendMax s.bendX ∧ InDomain bendMin bendMax s.bendZ

theorem valid_spine_positive_length {s : SpineControls} (h : s.Valid) : 0 < s.length := by
  have lower := h.1.1
  norm_num [spineLengthMin] at lower
  linarith

theorem valid_spine_positive_radii {s : SpineControls} (h : s.Valid) :
    0 < s.rootRadius ∧ 0 < s.tipRadius := by
  have rootLower := h.2.1.1
  have tipLower := h.2.2.1.1
  norm_num [radiusMin] at rootLower tipLower
  constructor <;> linarith

structure ChamberControls where
  x : ℚ
  y : ℚ
  z : ℚ
  deriving DecidableEq, Repr

def ChamberControls.Valid (c : ChamberControls) : Prop :=
  InDomain axisMin axisMax c.x ∧ InDomain axisMin axisMax c.y ∧ InDomain axisMin axisMax c.z

theorem valid_chamber_positive_axes {c : ChamberControls} (h : c.Valid) :
    0 < c.x ∧ 0 < c.y ∧ 0 < c.z := by
  have hx := h.1.1
  have hy := h.2.1.1
  have hz := h.2.2.1
  norm_num [axisMin] at hx hy hz
  constructor
  · linarith
  · constructor <;> linarith

end QDL.Assembly
