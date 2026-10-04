import Mathlib

/-! Exact, closed QDL design syntax. Rational decimal domains model authored JSON
numbers, not IEEE-754 evaluation or the renderer. The format marker is experimental. -/

namespace QDL

inductive Family where
  | filament | jelly | moth | coral | ribbon | nautilus | seed | torus | comet | bloom
  deriving DecidableEq, Repr

inductive OrganModel where | rosette deriving DecidableEq, Repr
inductive FilamentModel where | pinnedSine deriving DecidableEq, Repr
inductive MotionClock where | separate deriving DecidableEq, Repr
inductive ReducedMotion where | freeze deriving DecidableEq, Repr
inductive SurfaceModel where | foldedRibbon deriving DecidableEq, Repr
inductive LightModel where | densityCrest deriving DecidableEq, Repr

structure RGB where
  red : Fin 256
  green : Fin 256
  blue : Fin 256
  deriving DecidableEq, Repr

def Bounded (lo hi value : ℚ) : Prop := lo ≤ value ∧ value ≤ hi
instance (lo hi value : ℚ) : Decidable (Bounded lo hi value) :=
  inferInstanceAs (Decidable (lo ≤ value ∧ value ≤ hi))

structure Organ where
  model : OrganModel := .rosette
  baseRadius : ℚ
  degreeGain : ℚ
  literalGain : ℚ
  amplitude₀ : ℚ
  amplitude₁ : ℚ
  deriving DecidableEq, Repr

def Organ.Valid (o : Organ) : Prop :=
  Bounded (1/100) (8/100) o.baseRadius ∧
  Bounded 0 (6/1000) o.degreeGain ∧
  Bounded 0 (3/1000) o.literalGain ∧
  Bounded 0 (45/100) o.amplitude₀ ∧
  Bounded 0 (45/100) o.amplitude₁ ∧
  o.amplitude₀ + o.amplitude₁ < 1

structure Filament where
  model : FilamentModel := .pinnedSine
  bend : ℚ
  frequencyGain : ℚ
  ripple : ℚ
  deriving DecidableEq, Repr

def Filament.Valid (f : Filament) : Prop :=
  Bounded 0 (8/100) f.bend ∧ Bounded 0 (2/10) f.frequencyGain ∧
  Bounded 0 (3/10) f.ripple

inductive RhythmModel where | coupledHarmonic deriving DecidableEq, Repr
inductive RhythmMode where | periodic | quasiperiodic deriving DecidableEq, Repr

structure Rhythm where
  model : RhythmModel := .coupledHarmonic
  mode : RhythmMode := .periodic
  rate : ℚ
  breath : ℚ
  wave : ℚ
  waveNumber : ℚ
  lag : ℚ
  asymmetry : ℚ
  overtone : ℚ
  deriving DecidableEq, Repr

def Rhythm.Valid (r : Rhythm) : Prop :=
  Bounded (1/4) 2 r.rate ∧ Bounded 0 (18/100) r.breath ∧
  Bounded 0 (18/100) r.wave ∧ Bounded 0 4 r.waveNumber ∧
  Bounded 0 2 r.lag ∧ Bounded 0 (8/10) r.asymmetry ∧
  Bounded 0 (35/100) r.overtone

structure Motion where
  clock : MotionClock := .separate
  phaseRate : ℚ
  reducedMotion : ReducedMotion := .freeze
  rhythm : Option Rhythm := none
  deriving DecidableEq, Repr

def Motion.Valid (m : Motion) : Prop := Bounded 0 (5/100) m.phaseRate ∧
  (match m.rhythm with | none => True | some r => r.Valid)

structure Ink where
  ghostAlpha : ℚ
  secondaryAlpha : ℚ
  ridgeAlpha : ℚ
  neutral : RGB
  deriving DecidableEq, Repr

def Ink.Valid (i : Ink) : Prop :=
  Bounded 0 1 i.ghostAlpha ∧ Bounded 0 1 i.secondaryAlpha ∧
  Bounded 0 1 i.ridgeAlpha ∧
  i.ghostAlpha < i.secondaryAlpha ∧ i.secondaryAlpha < i.ridgeAlpha

structure Surface where
  model : SurfaceModel := .foldedRibbon
  ribbons : Nat
  crests : Nat
  spread : ℚ
  folds : Nat
  taper : ℚ
  asymmetry : ℚ
  depth : ℚ
  twist : ℚ
  phaseLag : ℚ
  samples : Nat
  deriving DecidableEq, Repr

def Surface.Valid (s : Surface) : Prop :=
  (8 ≤ s.ribbons ∧ s.ribbons ≤ 36) ∧
  (3 ≤ s.crests ∧ s.crests ≤ 6) ∧
  Bounded (2/100) (24/100) s.spread ∧
  (2 ≤ s.folds ∧ s.folds ≤ 9) ∧
  Bounded (4/10) (25/10) s.taper ∧
  Bounded 0 (35/100) s.asymmetry ∧
  Bounded 0 (35/100) s.depth ∧
  Bounded 0 3 s.twist ∧ Bounded 0 2 s.phaseLag ∧
  (4000 ≤ s.samples ∧ s.samples ≤ 24000)

structure Light where
  model : LightModel := .densityCrest
  recessAlpha : ℚ
  crestAlpha : ℚ
  depthContrast : ℚ
  deriving DecidableEq, Repr

def Light.Valid (l : Light) : Prop :=
  Bounded (15/1000) (12/100) l.recessAlpha ∧
  Bounded (16/100) (65/100) l.crestAlpha ∧
  Bounded 0 (8/10) l.depthContrast ∧ l.recessAlpha < l.crestAlpha

structure Composition where
  occupancy : ℚ
  lean : ℚ
  yaw : ℚ
  pitch : ℚ
  focus : ℚ
  deriving DecidableEq, Repr

def Composition.Valid (c : Composition) : Prop :=
  Bounded (6/10) (84/100) c.occupancy ∧
  Bounded (-1/2) (1/2) c.lean ∧ Bounded (-1/2) (1/2) c.yaw ∧
  Bounded (-1/2) (1/2) c.pitch ∧ Bounded (15/100) (8/10) c.focus

inductive ChromaModel where | materialTerritories deriving DecidableEq, Repr
inductive ChromaPalette where | roles1 deriving DecidableEq, Repr
inductive LensKind where | scalar deriving DecidableEq, Repr

/-- Typed path segments distinguish object keys from array indices. -/
inductive LensPathSegment where
  | key (name : String)
  | index (value : Nat)
  deriving DecidableEq, Repr

def LensPathSegment.Valid : LensPathSegment → Prop
  | .key name => 1 ≤ name.length ∧ name.length ≤ 64 ∧
      name ≠ "__proto__" ∧ name ≠ "constructor" ∧ name ≠ "prototype"
  | .index value => value ≤ 511

instance (p : LensPathSegment) : Decidable p.Valid := by
  cases p <;> unfold LensPathSegment.Valid <;> infer_instance

structure LensBinding where
  node : String
  path : List LensPathSegment
  deriving DecidableEq, Repr

def LensBinding.Valid (b : LensBinding) : Prop :=
  1 ≤ b.node.length ∧ b.node.length ≤ 64 ∧ b.path.length ≤ 8 ∧
  ∀ segment ∈ b.path, segment.Valid

instance (b : LensBinding) : Decidable b.Valid := by
  unfold LensBinding.Valid
  infer_instance

structure ScalarLens where
  kind : LensKind := .scalar
  id : String
  label : String
  unit : String
  lower : ℚ
  upper : ℚ
  threshold : Option ℚ := none
  bindings : List LensBinding
  deriving DecidableEq, Repr

/-- Rational domains model finite authored values; JS overflow checks remain external. -/
def ScalarLens.Valid (l : ScalarLens) : Prop :=
  (1 ≤ l.id.length ∧ l.id.length ≤ 64) ∧
  (1 ≤ l.label.length ∧ l.label.length ≤ 80) ∧ l.unit.length ≤ 24 ∧
  l.lower < l.upper ∧
  (match l.threshold with | none => True | some v => l.lower ≤ v ∧ v ≤ l.upper) ∧
  (1 ≤ l.bindings.length ∧ l.bindings.length ≤ 64) ∧
  (l.bindings.map LensBinding.node).Nodup ∧ ∀ b ∈ l.bindings, b.Valid

instance (l : ScalarLens) : Decidable l.Valid := by
  unfold ScalarLens.Valid
  cases l.threshold <;> infer_instance

structure Chroma where
  model : ChromaModel := .materialTerritories
  palette : ChromaPalette := .roles1
  strength : ℚ
  lens : Option ScalarLens := none
  deriving DecidableEq, Repr

def Chroma.Valid (c : Chroma) : Prop := Bounded 0 1 c.strength ∧
  (match c.lens with | none => True | some l => l.Valid)

instance (c : Chroma) : Decidable c.Valid := by
  unfold Chroma.Valid
  cases c.lens <;> infer_instance

structure Design where
  formatMarker : Nat := 1
  family : Family
  organ : Organ
  filament : Filament
  motion : Motion
  ink : Ink
  surface : Surface
  light : Light
  composition : Composition
  chroma : Option Chroma := none
  deriving DecidableEq, Repr

def Design.Valid (d : Design) : Prop :=
  d.formatMarker = 1 ∧ d.organ.Valid ∧ d.filament.Valid ∧
  d.motion.Valid ∧ d.ink.Valid ∧ d.surface.Valid ∧ d.light.Valid ∧
  d.composition.Valid ∧ (match d.chroma with | none => True | some c => c.Valid)

instance (d : Design) : Decidable d.Valid := by
  unfold Design.Valid Organ.Valid Filament.Valid Motion.Valid Ink.Valid
    Surface.Valid Light.Valid Composition.Valid Rhythm.Valid
  cases d.motion.rhythm <;> cases d.chroma <;> infer_instance

def validateDesign (d : Design) : Bool := decide d.Valid

theorem validateDesign_iff (d : Design) : validateDesign d = true ↔ d.Valid := by
  simp [validateDesign]

theorem validateDesign_reject_iff (d : Design) : validateDesign d = false ↔ ¬d.Valid := by
  simp [validateDesign]

theorem Design.Valid.organ_valid {d : Design} (h : d.Valid) : d.organ.Valid := h.2.1
theorem Design.Valid.filament_valid {d : Design} (h : d.Valid) : d.filament.Valid := h.2.2.1
theorem Design.Valid.motion_valid {d : Design} (h : d.Valid) : d.motion.Valid := h.2.2.2.1
theorem Design.Valid.ink_valid {d : Design} (h : d.Valid) : d.ink.Valid := h.2.2.2.2.1
theorem Design.Valid.surface_valid {d : Design} (h : d.Valid) : d.surface.Valid := h.2.2.2.2.2.1
theorem Design.Valid.light_valid {d : Design} (h : d.Valid) : d.light.Valid := h.2.2.2.2.2.2.1
theorem Design.Valid.composition_valid {d : Design} (h : d.Valid) : d.composition.Valid := h.2.2.2.2.2.2.2.1

theorem Organ.Valid.radial_envelope_positive {o : Organ} (h : o.Valid) :
    0 < 1 - o.amplitude₀ - o.amplitude₁ := by
  have hb := h.2.2.2.2.2
  linarith

theorem Surface.Valid.positive_sample_budget {s : Surface} (h : s.Valid) : 0 < s.samples := by
  have hb := h.2.2.2.2.2.2.2.2.2.1
  omega

theorem Ink.Valid.ghost_lt_ridge {i : Ink} (h : i.Valid) : i.ghostAlpha < i.ridgeAlpha :=
  lt_trans h.2.2.2.1 h.2.2.2.2

theorem Design.Valid.with_family {d : Design} (h : d.Valid) (f : Family) :
    ({ d with family := f } : Design).Valid := h

def defaultDesign : Design := {
  family := .filament
  organ := { baseRadius := 3/100, degreeGain := 4/1000, literalGain := 1/1000, amplitude₀ := 2/10, amplitude₁ := 13/100 }
  filament := { bend := 4/100, frequencyGain := 7/100, ripple := 16/100 }
  motion := { phaseRate := 38/1000, rhythm := some { rate := 1, breath := 6/100, wave := 55/1000, waveNumber := 16/10, lag := 9/10, asymmetry := 28/100, overtone := 17/100 } }
  ink := { ghostAlpha := 9/100, secondaryAlpha := 42/100, ridgeAlpha := 88/100, neutral := { red := 240, green := 241, blue := 235 } }
  surface := { ribbons := 28, crests := 4, spread := 16/100, folds := 7, taper := 65/100, asymmetry := 25/100, depth := 28/100, twist := 19/10, phaseLag := 14/10, samples := 24000 }
  light := { recessAlpha := 45/1000, crestAlpha := 58/100, depthContrast := 65/100 }
  composition := { occupancy := 76/100, lean := -12/100, yaw := 3/10, pitch := 12/100, focus := 38/100 }
  chroma := some { strength := 85/100 }
}

theorem defaultDesign_valid : defaultDesign.Valid := by
  norm_num [Design.Valid, Organ.Valid, Filament.Valid, Motion.Valid, Ink.Valid,
    Surface.Valid, Light.Valid, Composition.Valid, Rhythm.Valid, Chroma.Valid, Bounded, defaultDesign]

end QDL
