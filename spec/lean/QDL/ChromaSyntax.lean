import QDL.Design

/-! Safety and graph membership consequences of the current chroma syntax.
The grammar is owned by Design. Rational scalar domains do not prove JS
parsing, IEEE-754 arithmetic, or overflow checks. -/
namespace QDL

/-- Graph membership is a separate check after syntactic validation, as in JS. -/
def ScalarLens.BindingsInGraph (l : ScalarLens) (nodeIds : List String) : Prop :=
  ∀ b ∈ l.bindings, b.node ∈ nodeIds

def Chroma.BindingsInGraph (c : Chroma) (nodeIds : List String) : Prop :=
  match c.lens with | none => True | some l => l.BindingsInGraph nodeIds

instance (l : ScalarLens) (ids : List String) : Decidable (l.BindingsInGraph ids) := by
  unfold ScalarLens.BindingsInGraph
  infer_instance
instance (c : Chroma) (ids : List String) : Decidable (c.BindingsInGraph ids) := by
  unfold Chroma.BindingsInGraph
  cases c.lens <;> infer_instance

theorem unsafe_proto_rejected : ¬ (LensPathSegment.key "__proto__").Valid := by
  simp [LensPathSegment.Valid]
theorem unsafe_constructor_rejected : ¬ (LensPathSegment.key "constructor").Valid := by
  simp [LensPathSegment.Valid]
theorem unsafe_prototype_rejected : ¬ (LensPathSegment.key "prototype").Valid := by
  simp [LensPathSegment.Valid]
theorem oversized_index_rejected (index : Nat) (h : 511 < index) :
    ¬ (LensPathSegment.index index).Valid := by
  simp only [LensPathSegment.Valid]
  omega

theorem LensBinding.Valid.path_bounded {b : LensBinding} (h : b.Valid) :
    b.path.length ≤ 8 := h.2.2.1

theorem LensBinding.Valid.path_safe {b : LensBinding} (h : b.Valid)
    {part : LensPathSegment} (member : part ∈ b.path) : part.Valid := h.2.2.2 part member

theorem LensBinding.Valid.excludes_unsafe_proto {b : LensBinding} (h : b.Valid) :
    LensPathSegment.key "__proto__" ∉ b.path := by
  intro member
  exact unsafe_proto_rejected (h.path_safe member)

theorem ScalarLens.Valid.threshold_in_domain {l : ScalarLens} (h : l.Valid)
    {t : ℚ} (present : l.threshold = some t) : l.lower ≤ t ∧ t ≤ l.upper := by
  have ht := h.2.2.2.2.1
  simpa [present] using ht

theorem ScalarLens.Valid.domain_positive {l : ScalarLens} (h : l.Valid) :
    0 < l.upper - l.lower := by
  have hd := h.2.2.2.1
  linarith

theorem ScalarLens.Valid.bindings_bounded {l : ScalarLens} (h : l.Valid) :
    1 ≤ l.bindings.length ∧ l.bindings.length ≤ 64 := h.2.2.2.2.2.1

theorem ScalarLens.Valid.binding_valid {l : ScalarLens} (h : l.Valid)
    {b : LensBinding} (member : b ∈ l.bindings) : b.Valid :=
  h.2.2.2.2.2.2.2 b member

/-- The same graph node cannot select two different authored paths. -/
theorem ScalarLens.Valid.unique_node_binding {l : ScalarLens} (h : l.Valid)
    {a b : LensBinding} (ha : a ∈ l.bindings) (hb : b ∈ l.bindings)
    (sameNode : a.node = b.node) : a = b := by
  exact List.inj_on_of_nodup_map h.2.2.2.2.2.2.1 ha hb sameNode

theorem ScalarLens.BindingsInGraph.member {l : ScalarLens} {ids : List String}
    (h : l.BindingsInGraph ids) {b : LensBinding} (member : b ∈ l.bindings) :
    b.node ∈ ids := h b member

theorem ScalarLens.unknown_binding_rejected {l : ScalarLens} {ids : List String}
    {b : LensBinding} (member : b ∈ l.bindings) (unknown : b.node ∉ ids) :
    ¬ l.BindingsInGraph ids := by
  intro h
  exact unknown (h.member member)

theorem Chroma.Valid.strength_bounded {c : Chroma} (h : c.Valid) :
    0 ≤ c.strength ∧ c.strength ≤ 1 := h.1

theorem Chroma.Valid.lens_valid {c : Chroma} (h : c.Valid) {l : ScalarLens}
    (present : c.lens = some l) : l.Valid := by
  simpa [present] using h.2

end QDL
