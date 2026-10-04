# Experimental v1 typed collaboration implementation

Implemented only the assigned new files: `qdl-v1-offspring.js`, `packages/agent-sdk/src/v1-ranch.ts`, `packages/agent-sdk/test/v1-ranch.test.ts`, `verify-v1-offspring.cjs`, and this report. No registry-pinned language, Session, adapters, world simulation or UI changes. This is an experimental collaboration add-on to the candidate language, not a stable ranch release or external action system.

## Public API

UMD/browser global `QDLV1Offspring`; Node `require('./qdl-v1-offspring.js')`:

```js
compatibility([canonicalSourceOrAST0, canonicalSourceOrAST1], recipe)
build([canonicalSourceOrAST0, canonicalSourceOrAST1], {
  recipe, nonce, name, thought // thought omitted for body only
})
```

Recipes are closed alternatives:

```ts
{kind:'compose',donorOutput:string,recipientInput:string}
{kind:'mate',donorNode:string,replaceNode:string}
{kind:'merge'}
{kind:'body',base:0|1}
```

Compatibility returns `status:'compatible'` with ordered source/profile pins, exact generated `task`, surviving `nodeMappings`, `portMappings`, protected `guardNodes`, typed `seam`, required `ports` and bounded diagnostics. Failure returns `status:'incompatible',diagnostics`. It performs source/type/effect/closure checks, not task evaluation or body generation. An analysis does not promise the final declaration/body/source fits the complete-source budget.

`build` requires uint32 nonce and a bounded name. Compose/mate/merge require a complete explicitly supplied six-array thought, validated against the mapped child task. String prose is insufficient. Body requires thought omission and preserves its selected base's exact thought/task/repeats. Graph-changing recipes use repeats 1 and explain that in diagnostics.

Candidates contain `{format,candidateId,derivationId,childSourceHash,child,classification,changes,diagnostics,lineage}`. `child` uses `V.admit` fields `{program,payload,source,sourceHash,ports,order}`. All source-hash fields use the existing `ql_` artifact identity. Candidate `qc_` identity binds ordered full parent source/profile pins, recipe, nonce, name, complete resolved thought and add-on policy. Derivation `qd_` also binds the resulting child source. Classification is `causal-integration`, `parallel-report` or `body-only`.

SDK programmatic add-on:

```ts
analyze(session, {parents:[artifactId0,artifactId1], recipe}): Compatibility
preview(session, {parents,recipe,nonce,name,thought?}):
  {status:'ready',candidate} | {status:'rejected',diagnostics}
admit(session, candidate): {
  artifact, candidateId, derivationId,
  evidence:'library-source-admitted'
}
```

SDK inputs are closed inert JSON; parents must already be admitted in the supplied Session. Unknown parent IDs throw typed errors. Preview does not store its child. Admission rebuilds from both retained exact parent sources and compares every candidate field before passive `Session.recover`. Replaying admission reuses the same source artifact. It creates no run or social-world receipt. Tampered/malformed candidates refuse without changing session artifacts/records/receipts. The SDK exports its add-on types and `policy`; root owns package exports and browser loading.

## Transformation and boundaries

Namespaced node IDs are `p0n0`, `p0n1`, … and `p1n0`, … in deterministic authored-ready topological order. Runtime port names receive `p0_`/`p1_`; their original keys never silently coalesce. Resulting names must remain safe own names within 64 Unicode scalars; oversized prefixes refuse instead of truncating. Only donor predecessors needed for the selected seam survive. Recipient nodes no longer contributing to outputs are pruned. Mappings include only live child nodes/ports. Merge retains both complete tasks, joins ordered outputs as `a0`,`a1`,…/`b0`,`b1`,… fields in one report, and refuses more than 16 report ports.

Compose replaces an `input` only and requires an exported donor output. Mate replaces a `literal` only. A donor closure must be action-free. Seam equality compares complete normalized types, including units, bounds, integer/string/array refinements and optional/record structure; no subtyping or unit conversion is invented. The surviving donor must feed an original recipient operation and a child output; a terminal replacement refuses.

Recipient actions and all guard ancestors are protected, including inputs shared with payloads. Action payload donation remains possible, but source action label, simulation allowance, result type and guard wire stay unchanged. Every non-action guard node stays exactly the same under namespace remapping. The final common task validator rechecks eager effects and all guard/payload purity rules. No extra exceptions are introduced for examples.

Generated bodies use `A.generateV1` and bounded trait adjustments, valid anatomy ownership/gesture, a fresh base-family design, and the existing Chroma dictionary. Existing authored source heredity traits are usable; otherwise parent traits are explicitly labeled `source-seeded-traits`, derived deterministically from parent source hashes. These are construction authoring values, not measured phenotype or biological facts. Fresh design avoids silently retaining scalar lenses against renamed nodes. Heredity source fields carry two asserted parent hashes under the already supported experimental heredity model. Node/port maps and source reconstruction establish a mechanical relation, not historical authorship, factual observation, social participation, consent, task execution or City completion.

Bounds are 64 child nodes, 64 KiB complete constructor source, 2 MiB candidate and 32 KiB derivation. Source/type/declaration validation is shared with v1. Candidate and derivation serialization occur before SDK admission. Novelty checks discard node-name/port-name renaming, anatomy seed/compiler and ancestry fields before comparing task/body projections; renaming and ancestry assertions alone are insufficient.

## Evidence

* `node verify-v1-offspring.cjs`: **14/14 checks passed**. Independent sum→budget outputs: readings `[2,3,5]`, desired 7 produce `{allocated:7,remaining:3}`; `[1,1,2]`, desired 7 produce `{allocated:4,remaining:0}` with identical source and different input hashes. Covers mate, parallel merge, body preservation, explicit declarations, full unit/refinement refusal, uncaptured/missing ports, mixed legacy/profile refusal, terminal swap, action payload donation, shared guard protection, impure donors, namespace/node/source limits, detached deterministic construction and valid anatomy/Chroma.
* The same verifier checks three source-only constructor generations and both exact codecs, and executes the fresh child without parents.
* Browser UMD loading in an isolated JavaScript context produces the exact same canonical candidate as Node. This checks script interoperability, not an actual browser renderer/GPU.
* SDK `tsx --test test/v1-ranch.test.ts`: **8/8 passed**. Spy evidence confirms analyze/preview/admit/frame do not call `V.execute`; library capacity and tampered candidate failures preserve all stores. New Sessions containing only child source execute independently. Source-only import keeps ancestry assertions but has no construction/run history.
* `npm run typecheck` and full SDK suite passed: **96/96 tests** at this checkout (includes other concurrent integration work). After the final malformed-parent-pin guard, source typecheck and the focused **8/8** were repeated successfully.

For the root website demonstration, explicitly author donor sum step type `{kind:'number',unit:'L',min:0}` and the recipient available input with exactly that full type. Without an explicit donor result type, normal sum inference does not retain min refinement. `[4,5]` with desired12 yields allocated9/remaining0; `[8,12]` with desired12 yields12/8. Do not relax equality for the demo.

## Limits still explicit

There is no social world admission, energy accounting, nursery, lineage store, session-ledger persistence, autonomous recipe choice, host capability inheritance or external dispatch. The returned derivation is bounded construction evidence; callers retain it separately if needed. Session snapshots save source/run state, not this add-on's external derivation object. Importing only a child source preserves its complete declarations and ancestry assertions, not trusted history. Building/rebuilding does not verify that authored statements are true. Static compatibility cannot prove all future input-dependent computation succeeds.

A schema alignment issue remains outside assigned ownership: the core accepts some safe Unicode/spaced runtime port names, while current shared SDK schemas constrain names with the ASCII node-ID schema. Direct UMD construction follows the core safe-name rule; the tested SDK/browser examples use ASCII keys. Root should resolve that core/SDK contract difference before promising all admitted-core sources work through the SDK.
