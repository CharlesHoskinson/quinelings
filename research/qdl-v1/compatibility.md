# QDL v1 compatibility and identity decision

Status: concrete release recommendation; stable implementation and registry digest are not yet frozen. Specialist 6 owns this report only. Inspected `core.js`, `kernels.js`, `qdl.js`, `orbit.js`, `thought.js`, SDK source/types/build/manifest, `spec/lean/QDL/{Quine,ByteColors}.lean`, and the language, runtime and City workstream reports. No shared implementation files changed. Experiment: `/tmp/qdl-compatibility-probe.cjs`, results `/tmp/qdl-compatibility-probe.json`, 2026-10-04. No external services or credentials used.

## Decision and smallest release boundary

Ship an explicitly selected deterministic **QDL v1** profile alongside an explicitly named **legacy experimental** profile. Preserve legacy source bytes, constructors, genome formats and SDK methods. Implement the new closed source/type/invocation contract in a separate `qdl-v1.js` module and a new SDK `./v1` export; integrate through one discriminator dispatcher. Do not rewrite historical graphs, reinterpret `version:1`, or turn existing `action` into a live integration.

The production claim applies to strict source admission, typed supplied inputs, source-bound deterministic run evidence, local simulated effects, exact constructor reproduction and exact codec recovery. It requires the acceptance gates below. Persistence, real City connections, arbitrary host effects and concurrent multiuser services are separate deliverables; they must not be required merely to freeze this interpreter profile. Public City evidence supplies realistic fixture requirements, not a City API claim or authority to execute there.

The existing graph `version:1` is a graph-shape marker; design `qdl:1` is an experimental design-shape marker. Neither becomes a stability declaration. Package version, QDL source version, registry identity, codec format, rendering profile and MCP/A2A protocol version are independent numbers.

## Exact source and constructor recommendation

Retain the existing constructor AST as the canonical **source**. Put the new closed program envelope inside the quoted task payload. This is a deliberate refinement of the language report's provisional envelope: an outer plain program object would not itself be the current executable constructor quine. Wrapping such an object around an AST requires a new reconstructing constructor or a separate source/emission identity, with corresponding proof and SDK changes. The quoted envelope supplies an unmistakable discriminator while keeping the proven constructor fragment.

The payload `P` has exactly these required fields:

```ts
interface ProgramPayloadV1 {
  format: 'qdl-program';
  version: 1;
  canonical: 'qdl-json-1';
  registry: 'qdl-kernels-1';
  registryDigest: string; // 64 lowercase hex chars; assigned at release freeze
  thought: ThoughtDeclarationV1;
  task: {
    format: 'qdl-task'; version: 1; name: string;
    nodes: TypedNodeV1[]; outputs: string[];
  };
  design: DesignV1;
  repeats: number; // integer 1..8, matches constructor repeat count
}
```

`TypedNodeV1` contains exactly `id,op,inputs,params,type`; `type` is the normalized declared result type, including units/refinements. Input nodes declare their port name in closed `params`; literals keep their value in source. The final type grammar and thought grammar are those agreed with language semantics. `DesignV1` may retain `qdl:1` internally for the currently supported design record, but its closed permitted models/default expansion are pinned by the outer registry and explicit rendering contract. Design's marker never overrides the outer profile.

Define the existing shared constructor without copying an existing program:

```js
const E = ['emit',
  ['makeApply', ['makeRun', ['makeQuote', ['var','x']]],
                ['makeQuote', ['var','x']]]];
const D = ['lambda','x',
  ['seq', ['repeat', P.repeats, ['task', ['quote', P]]], E]];
const Q = ['apply', ['run', ['quote', D]], ['quote', clone(D)]];
```

`source = canonV1(Q)`. Both quoted copies contain the entire thought/task/design envelope. Source bytes include the exact explicit repeats and both copies; the complete source must fit 65,536 UTF-8 bytes. Strict v1 admission reconstructs `Q` from `P` and requires canonical byte equality, equal payload copies, exact constructor operations/arities/binder, matching repeat counts and all closed fields. It does not run the task. `task` dispatches an envelope only to the v1 evaluator; an ordinary legacy graph only to the legacy evaluator. `Q.execute`'s existing arbitrary AST evaluator is not a v1 admission route.

A full v1 invocation runs the task and constructs its source emission independently of the task's output. Also expose `reproduceSource(source)` using constructor-only evaluation without resolving runtime ports. Missing inputs cannot prevent byte reproduction. Constructor-only evaluation traverses the fixed constructor, substituting a no-effect task runner; it never reads currently executing source or returns a cached copy as the supposed quine proof.

Do not allow a caller to smuggle a v1 payload through permissive `K.validate` or `Q.makeTaskProgram`: legacy constructors must reject a recognized `format:'qdl-program'`/`'qdl-task'` marker. This is a narrow boundary guard, not a rewrite of accepted historical graph semantics. Unknown fields on genuine historical graphs keep their existing behavior under legacy admission.

## Registry, canonicalization and IDs

Freeze a checked-in machine-readable `qdl-kernels-1` manifest before release. It enumerates opcode signatures, closed params, type/unit rules, evaluation order, output/effect semantics, machine error codes, limits, canonicalization, constructor grammar, exact instruction colors/frequencies, supported design-model contracts and codec references. `registryDigest = SHA256(UTF8(canonV1(manifest)))`; exclude the manifest's own digest and mutable commentary/timestamps. This is a content fingerprint, not a publisher signature. Publish the computed 64-hex value and pin it in fixtures; never invent a placeholder stable value in released sources.

`qdl-json-1` sorts own string keys by ECMAScript UTF-16 lexicographic order, preserves array order, uses JSON string escaping and finite ECMAScript number serialization, UTF-8 without BOM and no Unicode normalization. Normalize negative zero to zero explicitly at builder admission. Reject nonfinite numbers, undefined, sparse arrays, accessors, symbols, custom prototypes, cycles, duplicate textual JSON keys and malformed scalar Unicode before assigning identity. Reject noncanonical input text rather than silently converting it into the same imported source. Builders can normalize permitted author data before first source identity; that is not historical-source migration. Prototype-key restrictions remain the agreed closed-language rule.

Keep the current identity algorithm for both profiles: `artifactId = 'ql_' + SHA256(UTF8(source))`. No prefix change or hash-of-graph substitution is necessary because the profile and registry pin are present in the source bytes. Display/store a `SourcePin` alongside the ID:

```ts
{ artifactId, sourceDigest, profile: 'qdl-v1',
  registry: 'qdl-kernels-1', registryDigest, canonical: 'qdl-json-1' }
```

Legacy pins say `profile:'legacy-experimental'` and reference a frozen legacy implementation/fixture manifest externally; do not insert that pin into old source. The legacy canonicalizer remains unchanged even where it admits values that v1 rejects. A source digest proves content equality, not authorship, factual truth or external completion.

Patch/minor package updates may fix packaging or add another explicitly selectable profile. They may not change a frozen registry's accepted schema, limits, type rules, reductions, output order, receipt publication, machine errors or canonical bytes. A new operation also changes the closed registry: allocate `qdl-kernels-2` and its digest, even if existing operations are preserved. QDL source `version:1` may continue to describe the same envelope grammar with that registry only after explicitly implementing it; this release accepts only the one frozen registry. Envelope schema changes require `version:2`.

## Codecs and frozen color/frequency meanings

Reuse `quineling-harmonics-1` and `quineling-chroma-1` unchanged for either canonical source profile. These are byte containers, not interpreter versions. Existing exact transport is magic bytes `QLNG`, big-endian uint32 source length, canonical UTF-8 payload, then big-endian FNV-1a checksum; 32-coefficient rows carry byte+1 with zero-only padding. Chroma carries byte `b` as `[b,255-b,(73*b+19)%256]`, with null padding. Frequencies 1..32 in a row are codec carrier frequencies; they are independent of graph opcode frequencies. Preserve sample count 65 and current integer/sample rejection tolerances. FNV detects accidental corruption, not malicious rewriting; verify SHA256 source pins separately.

Decoding must first recover exact bytes; schema/admission is a separate step. The current decoder successfully returns `['unrecognized']`; byte recovery is not executable admission. An unknown future QDL envelope can be exported/recovered as an opaque bounded source with its digest, but cannot be admitted, described as runnable, scheduled, migrated automatically or evaluated. Unknown codec formats fail `unsupported-codec`; recognized future envelope versions fail `unsupported-version`; unknown registry names/digest mismatches fail `unsupported-registry`. A malformed recognized v1 envelope fails its specific schema/identity diagnostic and is never retried as legacy.

Freeze the current 34-op table as explicit data, not `Object.keys(K.ARITY)` enumeration or calculated palette formulas. Exact table in the probe:

```text
Observe 1 #72d9e2; Box 2 #bb91ed; Permit 3 #e6c66a;
Apply 4 #6ad4a0; Score 5 #eb90ba; Authorize 6 #efaa73;
Execute 7 #b5e681; Quote 8 #899be8; Decode 9 #77bce9;
Report 10 #d6e6be; literal 11 #81bac5; sum 12 #82c6af;
mean 13 #82c8b3; min 14 #82c9b6; max 15 #83cab9;
weightedMean 16 #83cbb1; length 17 #83ccb4; map 18 #84cdb7;
sort 19 #84cfbb; dedupe 20 #85d0be; filter 21 #85d1b5;
compare 22 #d2bf85; choose 23 #d3c686; get 24 #86d4bf;
clamp 25 #87d5c3; budget 26 #87d6b9; action 27 #d7a088;
report 28 #88d89f; bfs 29 #89d9c4; allocate 30 #89dac7;
schedule 31 #8adbbd; consensus 32 #dcc28b; retry 33 #8ba1dd;
evidence 34 #deda8c
```

Allocate new `input` opcode frequency 35 and exact color `#94c4e8` in the v1 table, after verifying palette uniqueness. Keep this out of the legacy table. Case-sensitive `Report`/`report` remain distinct. Rendered role pigment, user accent and measured scalar lenses are distinct from this invertible instruction palette and from the byte chroma genome. Freeze semantic mapping, not pixel-identical GPU screenshots. Frame/body caches pin the rendering implementation separately; new renderer versions must not silently replace the meaning of a source-carried design model.

## Dual SDK/API behavior and companion contract

Keep root SDK `Runtime`, all current method signatures, literal override behavior, artifact IDs, response shapes and `./mcp`, `./a2a`, `./schema` exports available. Keep root compile/create defaults legacy for backward consumers. Add `@quinelings/agent-sdk/v1` exporting a `Session` and v1 schemas/types plus `compile`, `validateSource`, `run`, `reproduceSource`, `migrateLegacy` and descriptor. Give stable invocation `inputs` its own typed shape; do not repurpose the legacy `overrides` field. A source-only legacy read must not acquire invented thought/units.

V1 transport requests use required `{apiVersion:1,operation,...}` envelopes and exact v1 output schemas. Existing unversioned requests keep legacy semantics. Adapters can publish additional distinctly named tools or an explicitly versioned endpoint; they must not change established tool input schemas invisibly. Registry/profile discovery comes before invocation. Ranch composition must require equal compatible profile pins, or refuse `profile-mismatch`; mixed-profile parent construction requires explicit migration first. A scene may display both profiles with clear labels.

V1 authoritative authored thought, normalized types/units, task and complete design are in source. Companion documents may contain original English, compiler source maps, examples and explanatory notes, each attached to the source digest and classified as assertions. They cannot supply absent runtime types, change operation meaning, authorize effects or overwrite source-carried declarations. Same-source differing companions are separate companion records, not alternate authoritative source meanings. Legacy companion intent remains optional and its current metadata-conflict behavior remains legacy. Existing lost thought/units cannot be recovered from a genome just because a later compiler recognizes its task pattern.

## Explicit migration

`migrateLegacy` is pure preview followed by explicit admission of the reviewed result. It never updates the original artifact or aliases its ID. Input requires original source pin, supplied thought/type contract, mapping of each chosen legacy literal to a typed runtime port (or explicit instruction to keep it constant), explicit claim policy for legacy evidence without `params.claim`, and target registry pin. Validate the supplied companion against the old graph before using it; refuse missing/contradictory required information rather than infer units from prose.

Default conversion keeps literals constant, output order, repeat count and complete authored design. It embeds the new typed declarations and envelope, therefore changes source bytes, digest, ID and both exact genomes even when outputs stay equal. Port conversion moves invocation values out of source; author fixtures become separately retained invocation examples. Explain changed eager-action validation and evidence rules; graphs rejected by v1 need an authored repair, never a silent semantic rewrite. Migration returns diagnostics plus `{oldPin,newPin,mapping,semanticChanges,fixtureComparison}`. Store a digest-bound migration record as claimed until replay verifies the deterministic conversion. This is a construction relation, not historical birth/authorship proof.

The actual baseline probe demonstrates why marker-only upgrade is wrong: the 2,655-byte source produces `[6]` and ID `ql_47c1f15a0b879256f3c633a7a50883b989bb6bd66598da0e00e23b89b7682dd7`; adding only an unknown `graph.profile` preserves output but changes ID to `ql_654d891e4500e664304d7e2bb347bc3059328b1779393c2cbe00d756324fac24`. `K.validate` accepts that unknown marker. It must not be used as stable dispatch. Both codecs roundtrip the baseline and emission is exact.

## Integration choice and release gates

A separate v1 module isolates new validation, bindings, type enforcement and failures while retaining historical behavior. Share the pure constructor template and exact byte codec only after golden tests prove unchanged bytes. Legacy numerical helpers may be reused where their full behavior matches the frozen contract; avoid mutable globals and helpers whose revised strictness changes legacy outputs. Add a narrow source/profile dispatcher to SDK admission, source inspection and gallery/ranch selection. Bundle the new module into Node package and browser entry explicitly; the current build enumerates entry points and current SDK admission insists on `Json[]` and reconstructs via legacy `makeTaskProgram`, so merely exporting types cannot integrate it.

Rewriting `kernels.js` in place risks changing accepted legacy fields, first-report evidence, eager action behavior, failure effects and ordering under identical hashes. Adding a mode argument everywhere could work but makes every unchecked default a legacy/stable confusion site. A separate module has some bounded duplicate validation logic but supplies a reviewable release boundary. Do not migrate all ten examples automatically before the profile is frozen; migrate them explicitly with fixtures and preserve their legacy genomes.

Before assigning a stable version or publishing the package, check in immutable fixtures, independently reviewed expected results and registry manifest. Suggested dedicated directory: `fixtures/qdl-v1/`, with separate `legacy/` and `stable/` cases. Required policy:

1. Commit literal source bytes, source IDs, complete harmonic/RGB JSON and their hashes for the legacy Orbit constructor, the probe's task constructor, all ten production examples and representative anatomy/chroma/heredity designs. Pin outputs, repeats and instruction tables. Current probe codec hashes: harmonic `6cc58a33971dff1bd585d5f529ba5357ed26471865f05a6616dba256ffe5ebbe`, chroma `33fc19f164f31cb555d667cc48977a20fcf2e08c9ba5d83017fd642506c286e5`.
2. Commit stable constant-only sum, typed bound sum, units/refinement rejection, claim-specific duplicate evidence, eager-action rejection, failed occurrence with unpublished simulated receipts, unavailable/missing input, complete thought recovery and per-repeat outcomes. Expected results must be hand-derived and reviewed, not regenerated from the implementation as the oracle.
3. Prove three fresh emissions byte-equal for both profiles, plus v1 constructor-only reproduction without bindings. Different invocation snapshots retain source/ID/genomes but change input digest and outcomes. Adding/changing source-carried thought/type/design/registry must change source digest.
4. Mutation cases cover duplicate JSON keys, unknown fields/version/registry, altered digest, mismatched quote copies/repeat count, trailing source bytes, unknown expression, nonfinite input and exact size/depth boundaries. Every recognized v1 refusal must leave storage/world counts unchanged; never fall back to legacy.
5. Corrupt magic/length/checksum/UTF-8/padding/chroma redundancy/unsupported harmonic and sample boundaries. Decoding opaque future source performs zero tasks/actions; strict admission refuses it. Golden bytes cannot be rebaselined in CI. A intentional new profile gets new fixtures while previous ones remain.
6. Migration pairs preserve old bytes, show exact new IDs/genomes and declared semantic differences, replay the conversion, and compare independently supplied fixtures. Incomplete legacy thought/type information produces a diagnostic, not a manufactured declaration.
7. Install the packed tarball into an empty consumer and run legacy SDK calls plus new `./v1` imports, browser bundle dispatch, MCP discovery/output schemas and A2A serialization. No source-tree imports in the consumer check. Test the actual advertised package, not only repository sources.
8. Keep Lean constructor and byte-color proofs' scope honest: they establish abstract constructor reproduction and palette inverses, not JS typechecking, registry admission, UTF-8 or all task semantics. Regenerate reviewed correspondence fixtures for the quoted v1 payload; retaining the same constructor fragment reduces proof changes but does not discharge runtime conformance.

Publish an experimental/RC package while any gate is open. A final `@quinelings/agent-sdk` 1.0.0 may retain legacy exports alongside the advertised stable `./v1`; its release notes must say precisely which profile is stable. A npm version bump alone does not freeze old `qdl:1` artifacts.
