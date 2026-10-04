# Chroma syntax and binding review

The chroma grammar is defined in `QDL.Design`; `QDL.ChromaSyntax` imports it and
adds safety consequences and the separate graph-membership judgment. This
avoids competing definitions during the concurrent chroma integration.

The current typed syntax matches the accepted material-territories model,
roles-1 palette, scalar lens kind, optional lens/threshold, strength [0,1],
positive rational domain, bounded strings, 1–64 unique node bindings, at most
eight property/index path segments, indices through 511, and exclusion of
`__proto__`, `constructor`, and `prototype` property keys. An empty path is
accepted, matching the JavaScript contract. Threshold endpoints are inclusive.

Kernel-checked consequences establish:

- The three unsafe keys and oversized indices are invalid.
- Every member of a valid path satisfies the segment safety predicate, and
  valid bindings exclude an unsafe prototype segment.
- A valid lens domain has positive width, its present threshold lies inside
  that domain, and its binding count is bounded and nonzero.
- Two members of the binding list with the same node are equal bindings.
  Thus a single node cannot select two distinct authored paths.
- Every graph-validated binding names a member of the graph's ID list; one
  unknown binding rejects that membership judgment.
- Valid chroma strength lies in [0,1], and a present lens satisfies lens validity.

Graph membership is separate from syntax validity, corresponding to
`validateBindings` after `validate` in `qdl.js`. This check does not assert that
an output value exists at the path or is a finite scalar. The runtime resolver
may honestly return unbound, missing, or invalid values. Scalar normalization,
output provenance, categorical color mapping, and full AST source identity are
separate semantic responsibilities.

Rational domains model exact authored numbers and automatically exclude NaN
and infinity. They do not model IEEE-754 overflow in `upper-lower`; the runtime
explicitly rejects overflow even when two individual endpoints are finite.
Lean string length counts Unicode scalar values for valid strings, whereas
JavaScript `Array.from` can also encounter unpaired UTF-16 surrogates. Raw JSON
object keys, unknown/missing fields, integer/type checks, parsing, and this
encoding boundary are not proven by the typed grammar. Boundary and fixture
tests remain necessary for implementation correspondence.
