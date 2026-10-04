# Constructor-quine proof review

The Lean module `spec/lean/QDL/Quine.lean` formalizes the constructor-quine shape actually authored by `core.js`'s `makeTaskProgram`:

```
body = lambda x (seq (repeat r (task (quote payload)))
  (emit (makeApply (makeRun (makeQuote x)) (makeQuote x))))
program = apply (run (quote body)) (quote body)
```

The proof does not assume that executing a program emits that program. Quoted syntax is a value; `makeQuote`, `makeRun`, and `makeApply` each construct one AST node from evaluated code values. The bound variable contains the quoted body. Its constructor expression therefore evaluates to the exact outer application AST. An ordinary `emit` rule then appends that constructed AST to the emission list.

Theorems:

- `constructor_emits`: reconstructs the outer application from any bound quoted body, using the constructor evaluation rules.
- `repeated_task`: a task runs exactly 1–8 times and records its original payload for every invocation, without emitting source.
- `program_emits_itself`: for arbitrary payload, task runner, and permitted repeat budget, a finite evaluation derives exactly one emission equal to the complete program AST, its final code result, and exactly the repeated task invocation trace.
- `program_injective`: equal generated program ASTs imply equal payloads and repeat counts. Design changes inside the payload cannot silently become the same source AST.

The payload type is universally quantified. It can include the complete graph, input data, and QDL Design without changing the reproduction proof. The task runner is an explicit arbitrary function `Payload → Payload`; reproduction works independently of its results. Since the emitted AST equals the parent AST, the same theorem applies when that emitted child is executed again.

## Scope

This is a Lean kernel-checked big-step model of the constructor-quine fragment, using code-valued closure environments and a single de Bruijn bound variable in generated programs. It is not a proof of the entire dynamically typed JavaScript evaluator, its closure semantics for all possible terms, graph kernels, canonical JSON serialization, byte codecs, or the 20,000-step fuel limit. It proves existence of the specified finite derivation rather than a separately established evaluator determinism theorem. Useful task invocation counts are proved; internal graph effects are represented by the parameterized task runner and remain outside this module.

The model preserves the bounded repeat policy and explicitly separates ordered source emissions from ordered task invocations. No `sorry`, custom axiom, source-oracle primitive, or assumed `emitted = input` premise appears in the module.

Validation: `/home/hoskinson/.elan/bin/lake env lean QDL/Quine.lean` completed successfully under Lean 4.34.1 and the pinned Mathlib dependency. QDL remains experimental; this proof adds no frozen language version or migration contract.
