# SDK types and source/result lifecycle review

Scope: design advice for the experimental agent SDK. This review changes documentation only; proposed declarations below are not an assertion that a public export already exists. The source language and library remain experimental, without a version freeze.

## Findings from the current runtime

- `thought.js` validates closed IntentIR records, finite JSON, symbolic units, operation parameters, ordered ports, reachability, eager action restrictions, and bounded intermediate values. Its parser returns `supported`, `clarify`, `unsupported`, or `inconsistent`; only `supported` carries intent.
- Compilation evaluates known pure kernels to check refinements. These values are compiler evidence, not an explicit execution record. `action` is deliberately left unevaluated during compilation.
- `core.js` commits literal inputs, graph, repeat count, and QDL design to the complete constructor quine. `canon(program)` is the exact source identity. Its 64 KiB ceiling applies to complete duplicated constructor source, not just graph JSON.
- `anatomy.js` uses a private WeakSet to authenticate compiled anatomy and clones/freezes authored records. A structurally similar object is not a compiled handle. A TypeScript declaration must preserve that distinction.
- `kernels.js` returns ordered outputs, node trace, simulated receipts, and the graph actually run. `core.js` may return multiple task cycles. Keep the cycle dimension even for a single repeat.
- `creation.js` and `gallery.js` already compare recorded source with installed canonical source before displaying result pigment. Recovering source does not recover companion thought/provenance or an earlier run.

## Recommended TypeScript boundary

Use strict mode and `noUncheckedIndexedAccess`. Prefer readonly recursive JSON, operation-discriminated unions, explicit tuple arities, opaque validated/compiled handles, and discriminated outcomes. `unknown` is appropriate at import/transport boundaries; `any` and unchecked `as IntentIR` are not validation. Consider `exactOptionalPropertyTypes` for the package once implementation declarations are reviewed: an omitted field and an explicit `undefined` should not serialize as different intentions.

Keep `IntentType` distinct from TypeScript's inferred value type. JavaScript `number` cannot express finite ranges, symbolic units, or positive total weight. These remain runtime compiler obligations. A brand records a successful check; it is not a substitute for that check. `optional` in IntentIR means nullable data, not omission of a record property.

An operation union should encode all current kernels. Representative signatures:

```ts
type JSONValue = null | boolean | number | string
  | readonly JSONValue[] | { readonly [key: string]: JSONValue };
type Ref = string; // Runtime validates IDs and graph membership.
type Step<Op extends string, Inputs extends readonly Ref[], Params> = {
  readonly id: Ref; readonly op: Op;
  readonly inputs: Inputs; readonly params: Params;
};
type Comparison = "eq" | "ne" | "gt" | "gte" | "lt" | "lte";
type EmptyParams = Readonly<Record<string, never>>;
type Examples =
  | Step<"sum", readonly [Ref], EmptyParams>
  | Step<"weightedMean", readonly [Ref, Ref], EmptyParams>
  | Step<"choose", readonly [Ref, Ref, Ref], EmptyParams>
  | Step<"map", readonly [Ref],
      { readonly kind: "square" } |
      { readonly kind: "multiply"; readonly factor: number }>
  | Step<"compare", readonly [Ref],
      { readonly operator: Comparison; readonly value: JSONValue }>
  | Step<"action", readonly [Ref, Ref],
      { readonly allowed: boolean; readonly action: string }>;
```

The production `IntentStep` declaration now extends this approach to every kernel. Variable `report` ports need a runtime labels/ports equality check; arbitrary ID references and symbolic unit algebra also need runtime checks. Close imported records at runtime because TypeScript excess-property checks do not enforce exact objects once assigned through a variable.

Do not promise generic `run<T>(): T` when `T` is selected solely by the caller. Safe baseline outputs are ordered readonly `JSONValue[]`. Rich inference requires a builder that carries validated operation and output information, or a caller-supplied decoder applied to actual output; decoder failure must remain visible.

## Identity and lifecycle decisions

1. Artifact identity is complete canonical executable source. A digest can index/cache that source, but equality must not rely on the genome's 32-bit checksum. Any digest algorithm and byte encoding must be explicit; source remains the authoritative comparison in this local runtime.
2. Name is embedded in graph source and changes identity. Original thought, assumptions, inferred unit annotations, and source-map prose are companion metadata unless deliberately embedded by a future language change.
3. Changing a literal, repeat count, anatomy, gesture, scalar binding, or any other authored QDL setting creates a new artifact. Do not mutate a validated handle in place. Previous run records remain history and are stale for the new source.
4. Phase, camera, selected organ, paused state, result-cycle selection, and reduced motion are view state. They neither modify source nor create an execution record.
5. Public execution should run the committed source. Literal overrides should create a new validated artifact before execution. `runTask(graph, overrides)` is useful for fixtures but its output must never be associated with the unmodified parent source.
6. A run snapshots source and runtime evidence. Records supplied by a remote peer are claimed records until schema/source/output validation or local rerun establishes the required trust. A content hash is not an execution attestation.
7. Reproduction validates emitted source and explicitly executes it again, comparing canonical source plus every ordered task-cycle output. The final runtime reuses an identical artifact ID and returns a fresh execution record linked to the parent. Emission, source recovery, and output agreement are separate checks.
8. Validation/build failure surfaces diagnostics or a typed error and leaves previous valid artifacts intact. Execution failure is not an empty successful result. Keep cancellation/transport failure separate from semantic failure in adapters.

## Handoff to implementation

The [lifecycle document](../docs/sdk-lifecycle.md) describes the implemented stateful `Runtime` and provides authoring examples. Final `types.ts` now includes operation-specific `IntentStep` tuples/parameters, discriminated parser/create outcomes, generic operation-derived `dispatch` result types, and tagged responses for `exchange`. Readonly recursive snapshots and opaque authoring handles remain possible refinements; current artifact snapshots are detached structural objects. Private ECMAScript stores prevent external mutation of runtime internals. The implementation uses SHA-256 over UTF-8 canonical source for `ql_` IDs. Preserve semantic outcome states in MCP/A2A JSON rather than converting all unresolved thoughts to a successful artifact. Expose authored source separately from companion interpretation.

Final metadata policy preserves the first admitted source map and rejects different stored intent for identical source with `metadata-conflict`. Recovered source in a fresh runtime has no invented companion metadata. Source recovery normalizes JSON whitespace; `contract.sourceBytes` counts the complete authored canonical source.

Suggested acceptance checks for implementers: each parser outcome narrows correctly; wrong tuple arity/map parameters fail TypeScript; malformed imports fail validation; generated artifact is detached from its input; compiler preview is not labeled a run; repeated cycles preserve ordering; source edits stale old results; view edits preserve identity; override execution uses new source; recovery cannot attach invented provenance; child verification checks all cycles and exact emission.

## Documentation verification

Extracted and executed all five TypeScript examples in `docs/sdk-lifecycle.md` together against final `packages/agent-sdk/src/index.ts` using the package's `tsx`. Observed total `[12]`, direct and tagged-response frame IDs, changed artifact/source association, revised total `[15]`, exact recovery in a new runtime, and reproduced source with the correct parent record link. Extra assertions confirmed full-source UTF-8 byte accounting, whitespace-normalized recovery identity, and `metadata-conflict` rejection for different companion thought with the same source. The same extracted examples and assertions passed TypeScript with `strict`, `noUncheckedIndexedAccess`, `NodeNext`, and `noEmit`. No production files were edited and no deployment was performed.

Sources: repository [`thought.js`](../thought.js), [`anatomy.js`](../anatomy.js), [`core.js`](../core.js), [`kernels.js`](../kernels.js), [`creation.js`](../creation.js), [`gallery.js`](../gallery.js), [program contract](../docs/PROGRAM-CONTRACT.md). No external protocol claims were needed for this review.
