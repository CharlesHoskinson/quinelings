# QDL v1: bounded declared-thought semantics

Status: review candidate, not implemented or frozen. Specialist 2 owns this document only. Reviewed `AGENTS.md`, `docs/PROGRAM-CONTRACT.md`, `docs/QDL.md`, `docs/THOUGHT-TO-LIFEFORM.md`, `thought.js`, `kernels.js`, `core.js`, and the canonicalizer in `orbit.js`. Experiments ran against the existing runtime on 2026-10-04; no production source changed.

## Recommended release boundary

Freeze a bounded deterministic declared-thought/task language with explicit supplied observations, provenance references, goals, decisions, plans and tasks. Support one invocation over a finite input snapshot and simulated actions. Animation, replay, importing and inspecting are pure. Persistent worlds and real adapters consume this language through separate, explicitly versioned interfaces after this contract passes acceptance.

A thought is an agent's **public authored declaration**: a supplied observation, evidence assertion, chosen goal, stated decision, proposed plan or bounded task. It is not extracted hidden model reasoning. A model may propose this declaration, but validation proves structural/type/resource properties rather than truth, rationality or correspondence with arbitrary English.

Keep existing visual QDL and exact genomes readable as a named experimental legacy profile. The existing `qdl:1` and graph `version:1` markers cannot by themselves announce stable semantics: documentation expressly denies that promise. Introduce an unmistakable source envelope, provisionally `{format:"qdl-program",version:1,registry:"qdl-kernels-1",thought,task,design,repeats}`. `task` uses a new discriminator `{format:"qdl-task",version:1,...}` so new `input` nodes cannot be mistaken for old task graphs. Constructor/codec machinery can reconstruct this closed record without changing legacy bytes. Final spelling should be coordinated with API/version work; the semantic discriminator is mandatory.

Minimum additions before freeze: runtime `input`, source-carried types/units and thought contracts, uniform validation of every entry point, structured failures and bounded complete run records. Preserve the current finite operations; avoid general recursion, user host code, arbitrary expressions, timers, network access and mutable stores in this release.

## Evidence from the actual runtime

| Probe | Actual result | Required decision |
|---|---|---|
| Compile a credits budget with thought/assumption, then make a quine | `credits` and thought absent from source; three fresh emissions equal original source | Embed the bounded declaration/type contract when claiming recovery of declared thought; external notes remain companion artifacts |
| Compile numeric terminal input, `K.run(graph,{available:"ten"})` | Output `["ten"]` despite numeric companion type; returned graph differs | Runtime inputs need typed bindings that do not rewrite literals/source |
| Typed input with `binding:"runtime"` and no value | `missing`, `$.inputs.0.value` | Current compiler has no runtime-port construct |
| Structured object in `thought` | `schema`, `$.thought`: Thought must be a string | Observations/goals/etc. are proposed syntax, not existing support |
| Unknown graph/param fields plus duplicate outputs | Validation succeeds; output `[2,2]` | New profile needs closed fields and one declared output occurrence per ID |
| Import graph whose false `choose` branch references allowed/true action | Selected result `none`, but simulated `send` receipt exists | Compiler-only eager-effect check is insufficient; raw import/core construction need the same rule |
| Simulated action followed by invalid `mean([])` | Exception `Mean requires values`, no code/path/run record | Preserve failure and completed-node history; define simulation transaction publication |
| `evidence` over unrelated claims rain=true and sun=false, no claim param | `conflict` | Require a single claim for decision evidence; an all-claims aggregate cannot assert claim-specific conflict |
| Same source/claim contradictory duplicate, reversed order | First input order produces supported; reverse produces refuted | Explicitly retain first-report policy with duplicate warning, or introduce a separately named stricter reducer |
| Budget inputs labeled `L` and `mL` | `unit-type`, `$.steps.0` | Symbolic equality exists; unit conversion does not |
| Negative override of compiled valid budget | Plain exception `Expected nonnegative number` | Author-time example execution does not prove runtime refinements |
| Decode genome encoding `["unrecognized"]` | Successful byte recovery; execution rejects expression | Decode is recovery, followed by validation/admission; recovery alone grants no executable status |
| `length("😀")` | `2` | Freeze UTF-16 code-unit length for this opcode or add an explicitly separate Unicode opcode |

These are missing production boundaries or documented semantics, not claims that the current simulation is secretly performing external effects. Compiler rejection of actions in eager branches is already present in `thought.js`; it is absent from `K.validate`/`Q.makeTaskProgram`.

## Source, invocation and display

Source contains closed program vocabulary, authored constants, runtime port declarations, normalized types/units, finite thought declaration, graph, full authored design, repeat count and registry identity. Source never contains active selections, wall clock, run values, active permissions or credentials. No implicit default insertion on import; builders can write explicit defaults before identity is assigned.

`literal(value,type)` is immutable authored data. `input(name,type)` resolves one required invocation binding; it has no embedded runtime value. Bindings are closed, all declared inputs are required and extra bindings fail. V1 deliberately has no implicit defaults: optional missing data must be supplied as explicit `null` under `optional(T)`. A new input snapshot changes run identity, not source identity. Constants may be changed only by constructing a new source. Legacy overrides remain an explicitly labeled legacy operation that produces a new resolved graph; they are not routed through stable invocation.

A RunRecord is associated with `(sourceDigest,registry,inputDigest,occurrence)`, with a caller-supplied bounded run ID for storage correlation. Equal source/input/registry/occurrence yields equal semantic output and ordered trace; run IDs and timestamps are metadata. Runtime world revisions/provenance references may be supplied data but are never implicitly read. Reproduction yields the same source; a subsequent run must receive a fresh invocation or an explicitly retained snapshot. Neither source recovery nor ancestry proves the external observations.

Suggested invocation shape: `{sourceDigest,runId,inputs:{readings:[...]}}`; the digest is verified against loaded source. Suggested response: `{status:"ok"|"failed",sourceDigest,inputDigest,occurrences:[...],diagnostics:[...]}`. Pure verification of constructor reproduction must be available independently of task execution, so missing runtime inputs cannot prevent byte identity verification.

## Small declaration grammar

`thought` is a closed record with required arrays `observations`, `evidence`, `goals`, `decisions`, `plans`, `tasks`; empty arrays are valid. Each contains at most 32 records, total at most 96 records, unique ASCII IDs across the declaration. IDs follow the compiler's existing safe 1–64 character rule. Text fields are at most 512 Unicode scalar values; source remains subject to the complete 65,536-byte quine ceiling, so these maxima do not promise simultaneous capacity.

| Record | Required fields | Meaning |
|---|---|---|
| Observation | `id,text,input,path,basis` | Public statement attached to runtime input or source literal; `basis` is `confirmed`, `testimony`, `suspected` or `open`; path is bounded own-property segments |
| Evidence assertion | `id,claim,source,observation,value` | Authored boolean assertion and explicit references; factual verification is external |
| Goal | `id,text,outputs,completion` | Desired result attached to task outputs; `completion` names a boolean result node, with no implicit optimizer |
| Decision | `id,text,guard,evidence` | `guard` names a boolean node; evidence references declaration IDs; runtime true/false is read only from its recorded result |
| Plan | `id,text,tasks` | Ordered explanatory references, with no additional scheduling/execution semantics |
| Task | `id,text,nodes,outputs` | Nonempty graph node and output references identifying the bounded executable work |

Paths use 0–8 string/integer segments, own properties only, forbidden prototype keys, integer indices 0–511. This matches the authored chroma path vocabulary; use one shared implementation. Task node references are provenance mappings, not a second executable graph. Every graph node must be covered by at least one declared task; every declared goal output must actually be a task output. Goal completion must name a boolean node and be explicitly included in a declared output or reported output record. A true source-authored assertion alone is an authored assertion, not confirmation of a world result; the source map and run inputs disclose its basis. Goals may share outputs and declarations may share evidence, without copying/counting it twice in a reducer.

The evidence declaration attaches authored provenance. Runtime `evidence` receives supplied boolean records through inputs and returns an evaluated summary. Neither relation asserts verified identity of a source. Run display must distinguish declared evidence from evaluated evidence; linked nodes get `not-evaluated`, recorded, invalid or stale status. A thought about an unavailable live capability is a proposal carrying an obligation, not an executable success.

## Types, units and refinements

Retain `boolean`, `string`, `null`, `number(unit)`, `array(T)`, exact closed `record(fields)` and `optional(T)` (null or T). Empty arrays require an explicit element type; never infer the existing default numeric element in a stable source. Primitive types are structural; no coercion. Add optional finite refinements only where runtime can enforce them: numeric inclusive min/max, safe-integer flag, array min/max length (0–512). Bounds intersect global limits. Refinements are checked on bindings, literals and each computed result.

Units remain symbolic products with integer powers, normalized exactly as the existing compiler does, with `one` dimensionless and exponent/length bounds. `count`, `edge`, `credits`, `L` and `mL` are distinct. Number labels cannot establish physical conversion or currency equivalence. Bare map multiply factors are dimensionless; square doubles unit exponents. Clamp bounds and comparison thresholds inherit the numeric operand's unit. This is an explicit source semantic rule; the params contain numeric magnitudes, not newly inferred units. Weighted mean weights must be dimensionless. Budget/allocate quantities match; schedule times retain the duration unit. Duration/quantities still get nonnegative runtime checks. Conversion can be a later named operation with a registry contract; v1 does not silently treat L/mL as equal.

Compile validates DAG/arities/closed params/types, conservative effect constraints and bounds, without pretending that one sample is a universal proof. Author-provided fixtures are separately executable examples. Dynamic predicates such as nonempty filtered output, positive weight mass, graph scheduling acyclicity inside supplied records and finite arithmetic remain runtime checks with structured failures. An eager `choose` cannot avoid a failed alternative; recommend recipes using `sum([])=0` or nonempty refinements when appropriate, rather than adding implicit laziness.

Freeze finite binary64 numerical behavior, left-to-right reduction order, no fused/reordered arithmetic, finite intermediate/results, safe integers where demanded. Equality is exact canonical JSON equality, including array order. String ordered comparisons use UTF-16 lexicographic order; `length` counts UTF-16 code units. Preserve stable sort with original index ties, first canonical-value dedupe, source-once voting, earliest-first-seen consensus tie, request-order allocation, adjacency-order BFS and stable-ready-order scheduling. Runtime node order is first ready node in authored node-array order. Unicode text is preserved without normalization.

For stable `evidence`, require `params.claim` and operate on exactly that claim. Preserve source+claim first-report-wins to ease migration, but return a run diagnostic `duplicate-evidence` for contradictory duplicates; do not represent it as independently corroborated support. An existing all-claim reducer must remain legacy or a named summary operation. Freeze retry's `unknown` stop and 1–8 consumption; it interprets supplied outcomes and never resubmits an external action.

## Pure/effect/error contract

All operations except `action` are pure deterministic computations. `action` creates a simulated receipt only. It requires explicit boolean guard and authored simulation `allowed`; this field is never an external authorization token. A false guard or permission yields a `skipped` receipt preserving payload. Eager graph evaluation executes all reachable nodes once per occurrence. Require every node to contribute to a declared output; disconnected actions are invalid. Reject actions in either `choose` alternative's ancestor cone on every entry point, including imported artifacts. Keep action guards/payloads pure in v1: no action upstream of another action. Reporting receipts is allowed.

Publish effects only after the entire occurrence succeeds; on failure retain completed action nodes as **unpublished simulated receipts** in its failure trace, with zero published effects. Each repeat is a separate occurrence; earlier successful occurrences remain recorded if a later occurrence fails, and evaluation stops. This transaction rule is implementable for local simulation and makes no exactly-once network promise. Real adapters require a separate protocol for authorization/idempotency/uncertain completion and must not be substituted for `action` under the same registry.

Every failure returns `{code,path,nodeId,occurrence,message}` with fields nullable when not applicable. Stable machine codes include `unknown-field`, `reference`, `cycle`, `type`, `unit-type`, `refinement`, `nonfinite`, `limit`, `missing-input`, `identity`, `unsupported-registry`, `corrupt-genome`. Messages are not compatibility keys. No task outputs on a failed occurrence; preserve bounded completed-node trace and failed node identity. Display never maps failure/missing/stale to zero, false or evidence unknown. Reject before evaluation for malformed source, bindings, or static effect violations.

## Limits and exact recovery

Keep 64 nodes, 16 input ports per node, 16 unique outputs, repeat 1–8, nesting 24, collections 512 entries, strings at most 16,384 UTF-16 code units and value bytes at most 65,536. Complete canonical constructor source, including duplicated payload and declaration/design, must fit 65,536 bytes. Task occurrence trace has at most 64 entries; total occurrences at most eight. Add aggregate semantic-run size cap **2 MiB** across all occurrence trace/input/value/effect records; count canonical UTF-8 bytes incrementally and stop with `limit`, never truncate silently. Source and per-value limits alone do not bound duplicated trace payload to 64 KiB. Run accounting overhead is included in this aggregate cap; refuse an invocation snapshot that alone exceeds it.

Use a named stable canonical profile based on the existing sorted-key canonicalizer over an admitted finite dense plain-JSON subset. Specify UTF-16 key ordering, ECMAScript number serialization, `-0` canonicalizing to `0`, no Unicode normalization; reject duplicate JSON keys before parsing collapses them, lone surrogates, accessor/symbol/prototype-bearing host objects and nonfinite numbers. Do not claim current implementation is already a complete RFC 8785 implementation. RFC 8785 independently specifies deterministic property sorting, ECMAScript serialization and rejection of malformed Unicode/nonfinite numbers; use its fixtures to test compatibility on the admitted stable subset. [RFC 8785](https://www.rfc-editor.org/rfc/rfc8785).

Quine identity means emitted canonical UTF-8 source equals admitted canonical source, verified in three fresh generations. Both exact harmonic and RGB codecs recover that same source; sampled harmonic recovery uses the current explicit coefficient/residual tolerances. The FNV-style checksum detects accidental corruption and is not authentication. Source digest uses SHA-256; digest is separate metadata or recomputed from source, never a self-referential field included in its own bytes. Decode produces recovered source status, then full validation is required to become runnable/admissible. Preserve registry identity, units, declaration, input schemas, design omission/presence and quine bytes; external notes and observations are absent unless deliberately authored into source.

The distinction between entities, activities and agents in W3C PROV is a useful provenance reference: our input snapshots/source artifacts, executions and declared source identifiers fit separate roles. This candidate adopts only bounded references, not full PROV interoperability or a proof of who supplied a value. [W3C PROV-DM](https://www.w3.org/TR/prov-dm/).

## City grounding and Living Thoughts fixtures

Incorporated the root's public read-only scrape in `research/qdl-v1/city-evidence.json`. Its documentation and frontend strings are evidence of intended public semantics, not a live agent thought feed or permission to enter the City. First Night distinguishes observed results, testimony, suspicions and unresolved matters; a saved plan is not proof of following it. The six declaration arrays above should preserve those distinctions, and goal completion must refer to evaluated results with visible provenance. [Midnight City First Night](https://midnight.city/docs/connect-to-midnight-city/first-night/).

The public gathering guide separates source definitions from changing resource instances and requires fresh resource reads and confirmed outcomes; inventory outputs are applied atomically. The economy guide distinguishes City inventory crystals from wallet settlement and imposes current inventory/allowance constraints. These are important adapter obligations, not authority conferred by a QDL receipt. [Gathering and Resources](https://midnight.city/docs/gameplay/gathering-and-resources/), [Economy and Needs](https://midnight.city/docs/gameplay/economy-and-needs/).

Build the following simulated acceptance recipes with independently specified inputs:

- **Grounded decision:** supplied evidence rows `{source,claim,value,basis}`; `filter` basis=`confirmed`, then `evidence` claim=`haul-completed`, then `get(state)` and `compare(eq,"supported")`. A testimony-only supported report produces completion `false` after filtering. Same-claim confirmed contradiction produces `conflict` and completion `false`; empty confirmed set produces `unknown` and completion `false`. Display retains excluded testimony/suspicion rather than erasing it from the thought.
- **Fresh resource guard:** supply booleans `currentRevisionMatches`, `available`, `withinAllowance`; combine pure booleans via `choose(a,b,false)` as an AND recipe and feed `action`. All true ⇒ simulated receipt; any false ⇒ skipped. This verifies snapshot interpretation only. A live adapter must refresh/revalidate at commit because reservations can change after the snapshot. Plans describing reserve/read/gather are declarations; an eager finite DAG cannot carry out a live temporal sequence by itself.
- **Bounded mission:** report planned haul, confirmed haul, and completion boolean separately; failed or pending receipt does not increment confirmed haul. A normalized supplied batch acknowledgement with one confirmed item and one unknown item keeps exactly one confirmed result, stops at unknown via `retry(["ok"])` or `retry(["unknown","ok"])` (the latter returns `{status:"uncertain",attempts:1,history:["unknown"]}`). Retry interprets one supplied operation's outcomes; independent batch commands need separately named receipts, not a single aggregate `ok` that invents all-command completion.
- **Crystal accounting:** `budget(available,desired)` may allocate less than desired. Simulation payload reports allocation/remaining and a boolean exact-quantity acceptance computed with `get(allocated)` and comparison to the authored desired quantity. An adapter requiring exact quantity must reject rather than silently dispatch a smaller quantity. Dynamic quantity equality needs a future two-input equality operation or a currently bounded recipe with source-authored desired quantity; do not claim existing one-input `compare` is a general dynamic comparator.

The grounded-decision reducer and unknown-stop example were also executed directly against current `K.calculate`: testimony-only ⇒ unknown/false, confirmed contradiction ⇒ conflict/false, one confirmed support ⇒ supported/true; `["unknown","ok"]` ⇒ uncertain after one attempt. The freshness/crystal/batch examples remain proposed acceptance fixtures rather than claims of a completed City adapter.

Two absent operations matter beyond this candidate: arbitrary runtime quantity-to-quantity comparisons and structured batch acknowledgement reconciliation are not conveniently expressed by current `compare`/numeric-only `map`. They merit explicit stdlib/registry proposals with types and fixtures, not English claims of support. The recipe boundary keeps v1 useful for supplied bounded thought snapshots while preserving those named obligations.

## Compatibility and release gates

1. Legacy corpus: all ten programs, their expected fixture outputs and at least three fresh generations remain identical under legacy execution. Existing genomes decode to identical canonical legacy source. Unknown new-format markers fail; never auto-upgrade imported bytes.
2. New-format closure: adversarial unknown fields/opcodes, duplicate output IDs/JSON keys, unsafe paths, cycles, mixed units, sparse/accessor host values, missing/extra bindings and source-budget excess reject through compiler, raw import, constructor, core execution and admission with matching machine codes.
3. Runtime separation: run two input snapshots against one source; outputs differ as independently specified, source/quine/genomes remain identical. A literal binding attempt fails. Type/refinement rejection precedes task evaluation. Recovery succeeds without runtime input; running requires one.
4. Thought recovery: three generations and both genomes preserve all six declaration arrays, unit/type refinements, links and exact omission/presence. Runtime observations do not appear in source. Invalid declaration references fail.
5. Effect fixtures: false guard, false permission, true+true, eager branch action, action ancestry, disconnected action and action-before-failure. Assert ordered receipt traces, zero published effects on failure, bounded repeat occurrence behavior and zero activity on replay/render/decode.
6. Evidence fixtures: no matching observations ⇒ unknown; support, refutation, same-claim conflict, duplicate identical report, duplicate contradiction, unrelated claim filtering, source-once voting and deterministic tie. Count diagnostics independently from state.
7. Error/limit fixtures: empty mean, zero/overflowed weighted mass, negative allocation, cyclic supplied schedule, 512/513 boundary, 64/65 nodes, byte boundary and aggregate trace overflow. Assert failed node/code and retained history; no invented result.
8. Numeric/canonical fixtures: Unicode keys/text, astral string length, negative zero, exponent serialization, finite arithmetic overflow, stable equal-key sort, source identity unaffected by JSON object insertion order. Freeze golden expected bytes/results; run browser and Node compatibility checks.

Migration is explicit and changes identity. Existing compiler intents migrate each `{value,type}` input to an authored literal by default; authors must intentionally select reusable runtime ports. Importing raw graphs cannot invent units, goals or thought from node names: produce a reviewable draft with unresolved declarations and unit obligations, retaining executable legacy source alongside it. Existing `evidence` without claim requires an author to choose a claim or retain legacy semantics. Existing effectful eager branches remain legacy and cannot be stamped stable. Attach old source hash and a migration manifest externally; exact old-source recovery remains available.

Implementation order: shared closed/type/effect validator; new source-carried declaration and input ports; source-preserving invocation plus structured run records; identity-only quine verification; fixture migration and corpus gates. Freeze only after all eight gates pass. API convenience functions/stdlib recipes/ranch operations should build these artifacts and consume these records rather than introducing separate execution semantics.

## Reproducing the review probes

The executed script was `/tmp/qdl-v1-semantics.cjs`. It only imports the current local modules and calls existing APIs. To recreate the principal failures without repository edits:

```js
const T=require('./thought.js'), K=require('./kernels.js'), Q=require('./core.js');
const literal=(id,value)=>({id,op:'literal',inputs:[],params:{value}});
const node=(id,op,inputs,params={})=>({id,op,inputs,params});
const graph=(nodes,outputs)=>({version:1,name:'probe',nodes,outputs});
const intent={format:'quineling-intent',name:'probe',thought:'Declared public budget',
  assumptions:['Nonnegative credits'],inputs:[
    {id:'available',value:10,type:{kind:'number',unit:'credits'}},
    {id:'desired',value:3,type:{kind:'number',unit:'credits'}}],
  steps:[node('budget','budget',['available','desired'])],outputs:['budget']};
function probe(name,f){try{console.log(name,f())}catch(e){console.log(name,e.code,e.path,e.message)}}
probe('companion-loss',()=>{const c=T.compile(intent);let p=Q.makeTaskProgram(c.graph);
  const s=Q.canon(p);return [s.includes('credits'),s.includes(intent.thought),
    ...[1,2,3].map(()=>{const r=Q.execute(p);p=JSON.parse(r.emitted[0]);return r.emitted[0]===s})]});
probe('override-type-bypass',()=>K.run(T.compile({...intent,inputs:[intent.inputs[0]],
  steps:[],outputs:['available']}).graph,{available:'ten'}).output);
probe('runtime-field',()=>T.compile({...intent,inputs:[
  {id:'available',type:{kind:'number',unit:'credits'},binding:'runtime'},intent.inputs[1]]}));
probe('structured-thought',()=>T.compile({...intent,thought:{observations:[],goals:[]}}));
probe('unknown-fields',()=>{const g=graph([literal('x',2)],['x','x']);g.unknown=true;
  g.nodes[0].params.unknown=true;return [K.validate(g),K.run(g).output]});
probe('eager-effect-import',()=>Q.execute(Q.makeTaskProgram(graph([
  literal('f',false),literal('t',true),literal('p','hello'),
  node('send','action',['t','p'],{allowed:true,action:'send'}),literal('fallback','none'),
  node('select','choose',['f','send','fallback'])],['select']))).tasks);
probe('failure-record',()=>K.run(graph([literal('t',true),literal('p','hello'),
  node('send','action',['t','p'],{allowed:true,action:'send'}),literal('empty',[]),
  node('bad','mean',['empty'])],['bad','send'])));
probe('cross-claim-evidence',()=>K.calculate('evidence',[[
  {source:'a',claim:'rain',value:true},{source:'b',claim:'sun',value:false}]],{}));
probe('duplicate-source-contradiction',()=>[true,false].map(first=>K.calculate('evidence',[[
  {source:'a',claim:'rain',value:first},{source:'a',claim:'rain',value:!first}]],{claim:'rain'})));
probe('conversion',()=>T.compile({...intent,inputs:[
  {...intent.inputs[0],type:{kind:'number',unit:'L'}},
  {...intent.inputs[1],type:{kind:'number',unit:'mL'}}]}));
probe('input-refinement',()=>K.run(T.compile(intent).graph,{desired:-1}));
probe('recovery-is-not-validation',()=>{const p=Q.decode(Q.encode(['unrecognized']));
  console.log('recovered',p);return Q.execute(p)});
probe('unicode-length',()=>K.calculate('length',['😀'],{}));
```
