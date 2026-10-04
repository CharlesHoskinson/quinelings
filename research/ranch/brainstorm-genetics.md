# Source-authored genetics and morphology candidate

Status: implementable proposal, 2026-10-04. QDL remains experimental. This workstream changes no runtime code. Read `AGENTS.md`, `docs/RANCH-WORKPLAN.md`, `docs/GENERATIVE-FORMAL-MODEL.md`, `anatomy.js`, `qdl.js`, `chroma.js`, `core.js`, and SDK admission/reproduction definitions.

## Recommended boundary

Keep exact copying as `reproduce`. Introduce passive `breed` and `merge` candidate builders that return complete child source plus diagnostics. Admission and rendering never run the child; `run(child)` is explicit. Current SDK `reproduce` already executes a fresh copy and compares its outputs to the parent: retain its semantics, and do not route genetically changed children through that equality check.

Expose three truthful change classes computed from canonical projections: `body-only`, `task-only`, and `task-and-body`. Also expose `unchanged` when neither projection differs. Different lineage annotations alone never count as a new task or body. A requested distinct offspring that is unchanged is refused after bounded attempts; copying remains available. Distinct source is necessary, but a different name/hash alone is insufficient evidence of useful offspring.

Two breeding modes:

- Body breeding inherits bounded style traits while retaining one explicitly chosen parent's task.
- Task breeding recombines explicitly selected typed fragments, then generates the child's anatomy from its actual resulting graph and inherited style. A merge composes both tasks into a named report; it must say that both are computed, not imply fusion or semantic improvement.

## Authored genetic record

Propose optional `design.genetics`, admitted by deliberately extending QDL/schema/SDK validators rather than bypassing existing closed-field checks. The complete resolved `anatomy`, `gesture`, pigment strength and motion rate remain in source. Recovery therefore does not need parents or rerun a compiler.

```ts
type Genetics = {
  model: 'ranch-genetics-experimental';
  recipe: 'typed-fragments-style-1'; // experimental recipe discriminator
  parents: [string, string];        // full canonical-source SHA-256 digests
  nonce: number;                    // uint32, supplied explicitly
  seedDigest: string;               // full 64 lowercase hex characters
  selection: {
    mode: 'body'|'splice'|'merge';
    base: 0|1;
    fragments: {parent: 0|1; output: string; replace?: string}[];
  };
  traits: {
    elongation: number; spread: number; curvature: number;
    gestureGain: number; tempo: number; pigmentGain: number;
  };                              // each integer in [-1000,1000]
  mutations: {locus: string; before: number; after: number}[];
};
```

Bound fragments to four and mutation entries to two; locus names come from the six-trait enum, never arbitrary object paths. Add a bounded explicit port-binding list to the splice selection (at most 64 bindings, containing source node/port and destination IDs); every wiring decision is inspectable and seed-hashed. Include normalized selection, complete bindings, trait policy and mutation bounds in the recipe input. Do not store parent programs recursively: only immediate hashes and the bounded recipe. Do not embed a child hash in its own source.

The genetic record documents an asserted recipe; source validity alone cannot authenticate ancestry. With both parent sources available, replay and compare the entire child source; without them label ancestry `unverified`. A hash identifies source bytes, not a person or permission. Runtime lineage event IDs, parent execution records, budgets, credentials and external authority stay outside source and are never inherited. Recovered artifacts have no invented thought/source-map metadata.

## Determinism and identity

Continue hashing UTF-8 `Q.canon(program)` with SHA-256, as the SDK already does. Compute task identity from `{nodes, outputs, repeats}` excluding graph name/design, and body identity from the complete resolved visual design excluding genetics. Keep the existing source identity unchanged. Canonical JSON supports repeatable hashing; RFC 8785 describes a related standard, but the repository's custom `canon` must not be advertised as RFC-compliant without Unicode/number/error conformance tests. SHA-256 is specified by FIPS 180-4. [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785.html), [NIST Secure Hash Standard](https://csrc.nist.gov/pubs/fips/180-4/upd1/final).

Use `SHA256(UTF8(Q.canon(["ranch-breed-style-1", parentDigests, normalizedRecipe, nonce])))` for the seed digest. Parent order is significant because base/port roles are significant. Never silently sort parent roles; explicitly expose swapping them as a new recipe. Use the first four digest bytes, big-endian, for the existing uint32 anatomy seed. Full seed digest and recipe disambiguate truncation collisions.

Generate random choices by hashing `[seedDigest, attemptIndex, locusName, drawIndex]`, taking unsigned big-endian words with rejection sampling for integer ranges. Named draws prevent unrelated changes from shifting every downstream choice. No `Math.random`, timestamps or locale-dependent sorting. Maximum eight attempts; return a deterministic diagnostic on exhaustion. Same inputs and recipe yield identical source, even after reload.

## Inheritance and bounded mutation

For each trait choose donor A, donor B or integer midpoint with equal probability; midpoint uses `Math.trunc((a+b)/2)` including negatives. Mutate at most two different traits, with signed nonzero integer deltas of magnitude 1–80 and saturation to [-1000,1000]. Log actual post-saturation changes; saturated no-ops are not mutations. A fixed recipe can disable mutation. Never mutate opcode strings, JSON bytes, guard/allowed fields or arbitrary constants.

Parents without genetics get the neutral vector of zeros, explicitly labeled `legacy-neutral`, rather than inventing undocumented hidden alleles. For hand-edited bodies this loses stylistic information: acceptable for the first candidate, with deliberate authoring of traits available later. Existing anatomy is self-contained phenotype; the six traits are a small genotype for future generation. Body edits must update traits through an explicit authored edit or mark the recipe as non-replayable. Do not silently regenerate and discard a parent's authored body.

Trait application follows `Anatomy.generate(childGraph, seed)` and cannot change topology or owners:

| Trait | Resolved change, with g = integer/1000 |
| --- | --- |
| elongation | Multiply spine lengths and chamber Y axes by `1 + .12*g` |
| spread | Multiply spine radii and chamber X/Z axes by `1 + .10*g` |
| curvature | Add `.025*g` to spine bend X; preserve attachment ordering |
| gestureGain | Add `.10*g` to generated strength, bounded [0,1] |
| tempo | Set source phaseRate to `.038 + .007*g`, bounded [0,.05] |
| pigmentGain | Set source chroma strength to `.85 + .10*g`, bounded [0,1] |

Clamp each geometric result to its existing validator domain, quantize authoring values to 1e-6 with a specified rounding rule, then validate the complete body and source. No parent hinge mutation in the first release: cumulative hinge limits couple several components. Gesture ticks and topology come from task structure, not inherited arbitrary arrays. Mutations cannot create extra operations or consume execution budget during viewing.

## Typed task recombination

Splice one selected pure donor fragment into the base task. A fragment is a predecessor-closed DAG slice terminating at one named output, optionally exposing explicit input ports. Match every open port by exact closed IntentType including units, array element types and record fields. Namespace imported nodes (`p0_`, `p1_`), rewire through explicit bindings, stable-topologically sort and prune disconnected pure nodes. Recompile through `Thought.compile` and all runtime validators; maximum 64 nodes and complete duplicated constructor <=65,536 bytes. Donor and base IDs that would exceed the 64-character ID bound must be deterministically reassigned, with a bounded source mapping.

Do not infer missing type contracts from names or runtime examples. Task breeding requires validated companion IntentIR/contracts, or explicit freshly authored typed declarations checked by the compiler. Source recovery alone still supports body breeding. This is an honest limitation of metadata being separate from executable source.

Initial automatic splicing and merging accept only pure graphs: refuse any `action`/`retry` nodes or simulation-mode contract. Preserve both branches of eager `choose`; its boolean does not make a task fragment lazy. Effectful composition requires a later reviewed rule for guards and evaluation order. A merge namespaces both pure DAGs and uses `report` with unique declared labels for selected outputs. Do not average unlike units or invent a meaningful joint objective. Pure graph merging can remain useful even if body breeding fails.

## How tasks shape appearance

Existing `Anatomy.generate` derives dependency depth, fanout, convergence and operation counts from the executable DAG. Keep this as the dominant structural signal. Actual fanout/convergence yields asymmetric branches; a longer serial chain can acquire neck/lobe continuation; selection produces a sweep; action counts widen the body. Every graph operation retains positive owned territory, including on the trunk; decorative repeated ownership adds no fictitious task edges.

Current gesture kind favors `gather` for convergence, `unfurl` for forks, `glide` for depth and `hover` for shallow tasks. These authored loops describe structure, not task execution. A scheduling kernel's internal jobs are not separate graph nodes; claim only the implemented graph-level signal. Future finer morphology would require explicitly bounded decomposition.

Role colors continue to come from actual operation roles through `Chroma.role`. Inherit pigment strength/material treatment only; never inherit a donor's categorical operation colors onto a different operation. Exact RGB byte genome stays untouched. A scalar lens survives only with explicit remapping to surviving compatible output paths and units; otherwise remove it with a diagnostic. Parent execution values never enter the child's lens. Newly admitted children display `not-evaluated` until their own explicit run, and edits invalidate numeric provenance.

## Concrete local experiment

Ran an isolated Node heredoc against current modules with anatomy seed 12345, without file changes:

| Program on [1,2,3,4] | Output | Components | Source bytes |
| --- | --- | --- | --- |
| A: filter >=3, sum | [7] | 3 | 4,911 |
| B: multiply by 2, sum | [20] | 3 | 4,945 |
| Proposed child: multiply by 2, filter >=3, sum | [18] | 5 | 5,997 |

All three sources differed, all emitted their own exact canonical source on explicit execution, and all passed `Anatomy.validateOwners`. Child trunk axes were approximately [.134428,.277158,.100579]; A was [.134428,.231158,.100579], B [.112428,.278158,.100579]. The child gained the deeper serial structure while retaining selection's broader proportion. This verifies a useful combination using existing kernels; it does not implement or validate the proposed breeding API, trait inheritance or formal guarantees. Additional child fixtures: [1] -> [0], [2,5] -> [14], [] -> [0].

## Acceptance obligations and tradeoffs

- Golden recipes: exact source/hash replay in browser and Node; swapped roles and changed nonce behave deterministically. Recover either genome, delete parents, render and explicitly run the self-contained child.
- Identity: lineage-only/name-only changes cannot pass distinct-offspring checks. Body-only children retain task identity and fixture outputs. Task recombination changes task identity and passes child-specific expectations rather than copying parent results.
- Bounds: adversarial traits, boundary saturation, malformed bindings, unit mismatches, unavailable metadata, duplicate IDs, 65-node unions, source overflow and eight exhausted attempts produce defined diagnostics with no partial child/budget debit.
- Anatomy: validate tree/depth/fanout/hinge/positive partitions; check every child node owns territory and every frame has finite points/unit normals at phase boundaries and minimum budgets. Inheritance never bypasses these existing validators.
- Purity: instrument run/effect counters while breeding, inspecting, recovering and animating. They stay zero. Explicit child run emits exactly the child source; it carries no parent record or authority.
- Model Quint proposal/admission/refusal and atomic budget spending. Propose Lean bounded-trait lemmas and owner preservation under topology-preserving numeric edits; retain proposed-obligation labels until checked. No biological heredity or optimality claim follows from these models.

Six style traits are less expressive than arbitrary geometry crossover but make validation, lineage replay and visible family resemblance tractable. Typed slices reject many attractive combinations, yet preserve meaning better than byte crossover. Source-authored resolved geometry costs bytes, but keeps descendants inspectable and independently recoverable. Visual resemblance needs silhouette review across several parent/seed families; these numeric bounds establish validity, not beauty.
