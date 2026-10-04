import QDL.Design

/-! Exact RGB byte records in core.js. This is distinct from rendered body color. -/
namespace QDL.ByteColors

def encode (byte : Fin 256) : RGB := {
  red := byte
  green := ⟨255 - byte.val, by omega⟩
  blue := ⟨(73 * byte.val + 19) % 256, Nat.mod_lt _ (by decide)⟩
}

def valid (color : RGB) : Prop :=
  color.green.val = 255 - color.red.val ∧
  color.blue.val = (73 * color.red.val + 19) % 256

instance (color : RGB) : Decidable (valid color) := by unfold valid; infer_instance

def decode (color : RGB) : Option (Fin 256) :=
  if valid color then some color.red else none

theorem encode_valid (byte : Fin 256) : valid (encode byte) := ⟨rfl, rfl⟩

theorem decode_encode (byte : Fin 256) : decode (encode byte) = some byte := by
  unfold decode
  rw [ite_eq_left (encode_valid byte)]
  rfl

theorem encode_injective : Function.Injective encode := by
  intro x y identity
  exact congrArg RGB.red identity

theorem invalid_rejected (color : RGB) (bad : ¬valid color) : decode color = none := by
  simp [decode, bad]

/-- Every accepted record is exactly the canonical record for its decoded byte. -/
theorem accepted_is_canonical {color : RGB} {byte : Fin 256}
    (accepted : decode color = some byte) : encode byte = color := by
  unfold decode at accepted
  split at accepted
  next good =>
    have red : color.red = byte := Option.some.inj accepted
    cases color with
    | mk r g b =>
      simp only [valid] at good
      subst byte
      rcases good with ⟨hg, hb⟩
      have green : (⟨255 - r.val, by omega⟩ : Fin 256) = g := Fin.ext hg.symm
      have blue : (⟨(73 * r.val + 19) % 256, Nat.mod_lt _ (by decide)⟩ : Fin 256) = b := Fin.ext hb.symm
      simp [encode, green, blue]
  next bad => simp at accepted

end QDL.ByteColors
