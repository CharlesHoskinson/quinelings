# Typed QDL design and validation

The Lean design model uses a closed ten-constructor `Family` and one-constructor
types for the supported organ, filament, motion clock, reduced motion, surface,
and light primitives. Unsupported primitive names cannot inhabit these types.
RGB values use three `Fin 256` channels. The two radial harmonics are explicit
fields, so a typed design cannot supply the wrong number of harmonics.

All authored continuous controls are exact rational numbers, and subdivision
counts and sample budgets are natural numbers. Each numeric bound in `qdl.js`
appears in the corresponding nested `Valid` predicate, together with the strict
ink and light hierarchies. `Design.Valid` also checks the current experimental
format marker. This marker does not freeze QDL or define an upgrade policy.

The public validator is `validateDesign : Design → Bool`; its soundness and
completeness are expressed by `validateDesign_iff`, with rejection characterized
by `validateDesign_reject_iff`. Other results establish positive radial envelope
margin, positive sample budgets, ink hierarchy transitivity, projection of all
seven nested validity predicates, preservation when changing family, and the
validity of the exact current default design.

This is a mathematical model of already typed authored designs. It does not
prove that a JSON parser rejects unknown fields, that JavaScript binary floating
point agrees at every decimal boundary, or that a renderer remains finite and
beautiful. JSON/schema conformance and renderer behavior need independent
implementation checks. A future verified parser can bridge a raw syntax tree to
these closed types; finite floating point controls should either be serialized
as exact authored decimals or checked against the rational model with an
explicit conversion policy.
