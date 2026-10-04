# Experimental ranch SDK guide

The ranch builds complete source-backed offspring and manages an explicit, bounded social world in one `Runtime`. QDL, recipes, policy names, package versions and source markers remain experimental. Construction and social transitions do not execute tasks. Only `run` and `reproduce` invoke the task interpreter; compiler validation may evaluate bounded pure refinements without evaluating action nodes.

## Compose two useful tasks, inspect, admit and recover

This runnable Node ESM example uses the installed `@quinelings/agent-sdk` package. Compile two typed parents: a reservoir mean of 20 litres and a budget that initially has 5 litres available against 12 desired. The compose selector connects declared output `mean` to literal input `available`; the child imports the mean computation and returns `{allocated:12,remaining:8}`. No parent output cache supplies that value.

```js
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {Runtime} from '@quinelings/agent-sdk';

// Project canonical JSON: sorted object keys, ordered arrays. Not an RFC8785 claim.
const canonical = value => Array.isArray(value)
  ? '[' + value.map(canonical).join(',') + ']'
  : value !== null && typeof value === 'object'
    ? '{' + Object.keys(value).sort().map(key =>
        JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}'
    : JSON.stringify(value);
const sha256 = text => createHash('sha256').update(text, 'utf8').digest('hex');
const pin = artifact => ({artifactId:artifact.id,
  intentHash:artifact.intent ? sha256(canonical(artifact.intent)) : null});
const numberL = {kind:'number',unit:'L'};
const reservoirIntent = {
  format:'quineling-intent',name:'Reservoir mean',thought:'Average supplied litre readings.',
  inputs:[{id:'readings',value:[10,20,30],type:{kind:'array',element:numberL}}],
  steps:[{id:'mean',op:'mean',inputs:['readings'],params:{}}],
  outputs:['mean'],assumptions:[]
};
const budgetIntent = {
  format:'quineling-intent',name:'Water budget',thought:'Budget available litres against desired litres.',
  inputs:[{id:'available',value:5,type:numberL},{id:'desired',value:12,type:numberL}],
  steps:[{id:'budget',op:'budget',inputs:['available','desired'],params:{}}],
  outputs:['budget'],assumptions:[]
};
const runtime = new Runtime();
const a = runtime.compile(reservoirIntent,{seed:17});
const b = runtime.compile(budgetIntent,{seed:23,repeats:3});
const input = {
  parents:[pin(a),pin(b)],
  recipe:{kind:'compose',donorOutput:'mean',recipientInput:'available'},
  nonce:42,style:{mutation:'none'},origin:{kind:'manual'}
};
const preview = runtime.offspringPreview(input);
assert.equal(preview.status,'ready');
if (preview.status !== 'ready') throw new Error(JSON.stringify(preview.diagnostics));
const candidate = preview.candidate;
assert.equal(candidate.changes.taskSyntaxChanged,true);
assert.equal(candidate.lineage.seam.integrationNode,'p1n2');
assert.deepEqual(runtime.lineage(),{derivations:[]}); // Preview writes no lineage.
const pose = runtime.offspringFrame({input,candidateId:candidate.candidateId,
  childSourceHash:candidate.childSourceHash,phase:0,options:{budget:4000,crests:2}});
assert.equal(pose.frame.owners.length,4000);
const admissionRequest = {input,candidateId:candidate.candidateId,
  childSourceHash:candidate.childSourceHash,target:{kind:'library'},
  requestId:'guide-manual-compose-1'};
const admitted = runtime.offspringAdmit(admissionRequest);
assert.deepEqual(runtime.offspringAdmit(admissionRequest),admitted); // Exact retry.
const stored = runtime.inspect(admitted.artifactId);
assert.equal(stored.source,candidate.child.source);
assert.equal(runtime.lineage({artifactId:stored.id}).derivations.length,1);

// Fresh runtime receives only source, with no parents, companions or run records.
const fresh = new Runtime();
const recovered = fresh.recover({source:stored.source});
assert.equal(recovered.intent,undefined);
assert.equal(recovered.contract,undefined);
assert.deepEqual(fresh.lineage({artifactId:recovered.id}),{derivations:[]});
const run = fresh.run(recovered.id); // This explicit call creates the execution record.
assert.deepEqual(run.result.tasks[0].output,[{allocated:12,remaining:8}]);
assert.equal(run.result.tasks.length,1); // Task-changing recipes reset repeats to1.
assert.equal(run.result.tasks[0].effects.length,0);
assert.equal(run.result.emitted[0],stored.source);
const copied = fresh.reproduce(recovered.id,run.id); // Explicit fresh execution/copy.
assert.equal(copied.artifact.source,stored.source);
assert.deepEqual(copied.record.result.tasks[0].output,[{allocated:12,remaining:8}]);
for (const encoding of [{harmonics:stored.harmonics},{colors:stored.colors}]) {
  const genomeRuntime = new Runtime();
  assert.equal(genomeRuntime.recover(encoding).source,stored.source);
}
```

A candidate is detached evidence, never an admission token or a stored child. `offspringFrame` and `offspringAdmit` rebuild from the complete input and compare candidate/source pins. Frame is a pose sample with operation owners/colors, not a recorded task measurement. Its budget is 4000..24000, crests 2..4 and finite phase magnitude ≤ 1e9; phase uses radians over a 2π gesture cycle. Keep the actual admission acknowledgement after transport loss.

Malformed closed requests throw `QuinelingError` with `code/message/path`. A well-formed preview can return `status:'rejected'` and diagnostics for a semantic recipe refusal; unknown parent artifacts throw. Never assume ready because residents paired. A typed seam compares recomputed complete structural types, including units, arrays/records and optionality. `L*s*s^-1` normalizes to `L`; `mL`, `s`, `L^2` and an optional number do not match required `number<L>`. Negative supplied donor results can still fail the child's nonnegative budget refinement after substitution.

## Four recipes and body metadata

| Recipe | Exact request selectors | Behavior |
| --- | --- | --- |
| Compose | `{kind:'compose',donorOutput:'mean',recipientInput:'available'}` | Parent 0 declared output replaces a parent 1 literal. Imports pure predecessor closure, rewrites all uses, prunes unused recipient nodes and requires a donor→original recipient nonliteral→child output witness. |
| Mate | `{kind:'mate',donorNode:'filtered',replaceNode:'values'}` | Explicit parent 0 donor node replaces a parent 1 node. Same purity, structural type, action/guard protection and integration checks. The names must exist in those actual parents. |
| Merge | `{kind:'merge'}` | Retains both complete DAGs in disjoint namespaces and joins declared outputs under ordered labels `a0..` then `b0..`. Preserves unlike units in separate fields; no averaging or conversion. |
| Body | `{kind:'body',base:1}` | Preserves the selected base's exact task name, node IDs/order, inputs/outputs, parameters, repeats and compatible companion metadata; generates new anatomy and resolved visual traits. |

Compose and mate protect all original recipient actions and every ancestor of their direct Boolean guards before and after pruning. Shared guard/payload ancestors are protected too. Pure payload donation can preserve a false guard without permission changes. Any action in the donor closure rejects; eager `choose` action branches reject. Replacing the terminal task alone or retaining an unrelated recipient operation fails integration. Both typed companions are required for compose/mate/merge and are recompiled against exact parent source. Stored contracts alone are not accepted as type evidence.

Every inherited task node, including literals, gets an injective role/index namespace for task-changing recipes. Ordered repeated ports survive. Origin rows name each original parent node; generated report nodes are labeled generated. Mechanical source clauses explain the child graph without fabricating English spans. The resulting child is limited to 64 nodes; merged reports accept at most 16 combined outputs. Equal-source parents reject task recipes. Body accepts same-source variation but does not present it as distinct-parent computational inheritance. World residents always remain separate individuals; self-pairing of one resident rejects.

Continue the preceding example to compare typed body retention and source-only body variation:

```js
const bodyInput = {...input,recipe:{kind:'body',base:1},nonce:43};
const bodyPreview = runtime.offspringPreview(bodyInput);
assert.equal(bodyPreview.status,'ready');
if (bodyPreview.status !== 'ready') throw new Error(JSON.stringify(bodyPreview.diagnostics));
const bodyChild = bodyPreview.candidate.child;
assert.equal(bodyPreview.candidate.changes.taskSyntaxChanged,false);
assert.deepEqual(bodyChild.intent,b.intent);
const baseTask = structuredClone(b.graph); delete baseTask.design;
assert.deepEqual(bodyChild.graph,baseTask); // IDs/ports/name/order stay exact.
const bodyFresh = new Runtime();
const bodyRecovered = bodyFresh.recover({source:bodyChild.source});
const bodyRun = bodyFresh.run(bodyRecovered.id);
assert.equal(bodyRun.result.tasks.length,3);
assert.deepEqual(bodyRun.result.tasks[0].output,[{allocated:5,remaining:0}]);
const sourceOnlyRuntime = new Runtime();
const sourceOnly = sourceOnlyRuntime.recover({source:b.source});
const sourceOnlyBody = sourceOnlyRuntime.offspringPreview({
  parents:[pin(sourceOnly),pin(sourceOnly)],recipe:{kind:'body',base:0},
  nonce:44,style:{mutation:'none'},origin:{kind:'manual'}
});
assert.equal(sourceOnlyBody.status,'ready');
if (sourceOnlyBody.status !== 'ready') throw new Error(JSON.stringify(sourceOnlyBody.diagnostics));
assert.equal(sourceOnlyBody.candidate.classification,'same-source body variation');
assert.equal(sourceOnlyBody.candidate.child.intent,undefined);
// Explicit interpretation attachment after exact graph comparison; no historical authorship claim.
const annotated = sourceOnlyRuntime.annotate({artifactId:sourceOnly.id,intent:budgetIntent});
assert.deepEqual(annotated.intent,budgetIntent);
```

Source-only SDK artifacts must contain authored assembly anatomy and gesture. Sources without these cannot be admitted to the SDK; offspring construction cannot silently measure nonexistent legacy anatomy. `annotate` attaches only absent or identical metadata. A conflicting companion refuses without replacing the first interpretation. Adding metadata to a world artifact updates affected resident pins/epochs and invalidates affected pair/proposal links atomically.

## Deterministic visual heredity and identity

The ordered exact source/companion pins, complete recipe/style, uint32 nonce and compiler/assembly/heredity/quantization policy names form the construction key. SHA256 domain-separated draws determine one candidate with no ambient randomness, wall time or task results. Candidate IDs are `qc_...`; source artifacts are `ql_...`; derivations are `qd_...`; world residents are world-scoped `wr_...`; execution records are `run_...`. Candidate and source identity exclude social origin. Derivation identity additionally binds origin, so different social proposals/residents can retain separate birth evidence for the same child source.

Six traits are integers in[-1000, 1000]. Let `g=trait/1000`:

| Trait | Resolved visual authoring rule |
| --- | --- |
| `elongation` | Axial dimensions multiplied by `1+.12*g`. |
| `spread` | Radial dimensions multiplied by `1+.10*g`. |
| `curvature` | Spine bendX offset by `.025*g`. |
| `gestureGain` | Gesture strength `.65+.10*g`. |
| `tempo` | Separate presentation phase rate `.038+.007*g`. |
| `pigmentGain` | Role chroma strength `.85+.10*g`; operation role colors remain associated with the actual child operations. |

Parents with authored heredity supply their six traits. Otherwise assembly controls supply a labeled `legacy-phenotype` approximation, not recovered historic genes. Each named draw chooses A, B or floor midpoint by modulo 3. `mutation:'gentle'` selects two distinct loci, applies signed integer magnitudes 1..80 and saturates; derivation records actual deltas/saturation. These modulo draws are deterministic, not advertised as unbiased. `mutation:'none'` adds no perturbation, but the regenerated anatomy can differ. Complete six-trait overrides require `mutation:'none'`; arbitrary field paths are unsupported. Authoring values clamp to accepted domains and round to 1e-6, normalizing negative zero. Hinges, owners and task literals are not mutated; incompatible scalar lenses drop with a diagnostic.

Source carries bounded `design.heredity` parent hashes, seed digest, nonce and traits, plus resolved task/anatomy/motion/chroma. Those parent hashes are assertions, not authenticated ancestry. A source-only recovery retains assertions while losing thought, unit interpretation, external derivation and prior execution records. `lineage` reads the session's admitted flat derivations, with original construction/policy/origin/seam evidence. Replay verification requires the exact parent sources and companions. Different source hashes alone do not establish novelty: candidates changing neither normalized executable task nor resolved body refuse. Structural task change does not prove different results on every input.

## Reciprocal social commands and explicit birth

Continue with the two typed parents above. One world per Runtime starts empty; identical `worldKey/seed/affinity` creation is idempotent and a different configuration conflicts. Imported adults start energy 60 with participation disabled. Neutral affinity uses distance; structural affinity is an inspectable heuristic of operation roles, gesture, diversity and distance, never English understanding or typed compatibility.

```js
const world = runtime.worldCreate({worldKey:'guide-ranch',seed:23,affinity:'neutral'});
// Keep each outbound payload and its receipt; retries use this exact payload.
function worldCommand(command) {
  const snapshot = runtime.worldInspect(world.id);
  const request = {worldId:world.id,expectedRevision:snapshot.revision,
    sequence:snapshot.nextSequence,command};
  const acknowledgement = runtime.worldCommand(request);
  assert.deepEqual(runtime.worldCommand(request),acknowledgement);
  return acknowledgement;
}
const adult0 = worldCommand({kind:'import',artifactId:a.id}).residentId;
const adult1 = worldCommand({kind:'import',artifactId:b.id}).residentId;
worldCommand({kind:'participate',residentId:adult0,enabled:true});
worldCommand({kind:'participate',residentId:adult1,enabled:true});
worldCommand({kind:'invite',residentId:adult0,partnerId:adult1});
worldCommand({kind:'invite',residentId:adult1,partnerId:adult0});
let proposal;
for (let batch=0; batch<200 && !proposal; batch++) {
  worldCommand({kind:'advance',ticks:4}); // Explicit social time, no interpreter.
  const snapshot = runtime.worldInspect(world.id);
  proposal = snapshot.proposals.find(p => p.parentResidents.every(id =>
    snapshot.residents.find(r => r.id === id).energy >= 50));
}
assert.ok(proposal,'No eligible proposal before this bounded demonstration ended');
const pairedInput = {...input,
  parents:proposal.artifactIds.map((artifactId,i) =>
    ({artifactId,intentHash:proposal.intentHashes[i]})),
  origin:{kind:'pairing',worldId:world.id,proposalId:proposal.id,
    parentResidents:proposal.parentResidents,epochs:proposal.epochs}
};
const pairPreview = runtime.offspringPreview(pairedInput);
assert.equal(pairPreview.status,'ready');
if (pairPreview.status !== 'ready') throw new Error(JSON.stringify(pairPreview.diagnostics));
const pairCandidate = pairPreview.candidate;
assert.equal(pairCandidate.candidateId,candidate.candidateId);
assert.equal(pairCandidate.childSourceHash,candidate.childSourceHash);
assert.notEqual(pairCandidate.derivationId,candidate.derivationId);
const beforeBirth = runtime.worldInspect(world.id);
const worldAdmission = {input:pairedInput,candidateId:pairCandidate.candidateId,
  childSourceHash:pairCandidate.childSourceHash,
  target:{kind:'world',worldId:world.id,expectedRevision:beforeBirth.revision},
  requestId:'guide-social-birth-1'};
const birth = runtime.offspringAdmit(worldAdmission);
assert.deepEqual(runtime.offspringAdmit(worldAdmission),birth);
const afterBirth = runtime.worldInspect(world.id);
assert.equal(afterBirth.revision,beforeBirth.revision+1);
assert.equal(afterBirth.residents.length,beforeBirth.residents.length+1);
for (const id of proposal.parentResidents) {
  assert.equal(afterBirth.residents.find(r => r.id === id).energy,
    beforeBirth.residents.find(r => r.id === id).energy-30);
}
const nursery = afterBirth.residents.find(r => r.id === birth.residentId);
assert.equal(nursery.energy,40);
assert.equal(nursery.enabled,false);
assert.equal(nursery.nurseryUntil,beforeBirth.tick+200);
assert.equal(runtime.lineage({artifactId:birth.artifactId}).derivations.length,2);
console.log('Guide assertions passed: composed 12/8, body 5/0 with three repeats, explicit reciprocal birth.');
```

Commands are `import`, `retire`, `participate`, `invite`, `cancelProposal` and `advance` 1..4. Use the exact next sequence and current expected revision for new commands. Each successful new command increments revision once, including a multi-tick batch; a matching retained duplicate returns its acknowledgement without another tick/mutation. Sequence and revision are different counters. Admission and annotation can change world revision without using a world command sequence. Retried lost responses must preserve the original sequence **and complete request**, including the old revision. Never allocate a fresh sequence to retry the same action.

Only reciprocal invitations on a common snapshot create a pair. Invitations expire 120 ticks; approach is limited to 160 and the entire pair attempt to 240; proposal requires 80 consecutive arrived court ticks. Proposal creation clears the pair/invitations/reservations and starts cooldown 200; proposal is valid only while `tick<expiry`, for 600 ticks. It selects no recipe and creates no child. Blocked paths and capacity can prevent success; the bounded example is a fixture, not a liveness guarantee.

Every 20 ticks, energy changes by priority: nursery/rest +4, paired -2, cooldown +2, adult roam/invite -1, saturated 0..100. Below 20 latches rest and cancels links; reaching 60 clears rest. Pending proposals allow recovery. At birth both parents must still be eligible adults, enabled/no rest, match source/companion/epoch pins and each have ≥ 50. Admission consumes the live proposal, charges 30 each, starts cooldown 200, and inserts a disabled child at energy 40 with 200 nursery ticks. No execution record or authority is inherited. Turning participation off, retirement, or annotation invalidates affected links/epochs; enabling later cannot revive a proposal. Participation is a local simulation setting, not creature consent.

`worldInspect`, preview and rendering do not tick. Scheduling explicit social commands is the embedder's responsibility. A frame phase or animation completion cannot admit offspring or run a task. Manual input can admit only to the library; world targets require pairing origin and the exact fresh proposal/revision.

## Sixteen MCP tools and structured A2A

MCP retains eight existing tools and adds eight ranch tools with recursive closed discovery schemas and `{code,message,path}` structured errors:

| Runtime operation | MCP tool | Store/state behavior |
| --- | --- | --- |
| `parse` | `quineling_parse` | Read-only parsing. |
| `compile` | `quineling_compile` | Stores validated source/companion. |
| `create` | `quineling_create` | Parses and may store an artifact. |
| `inspect` | `quineling_inspect` | Read-only artifact. |
| `run` | `quineling_run` | Explicit task execution and new record. |
| `reproduce` | `quineling_reproduce` | Explicit fresh copy execution and record. |
| `recover` | `quineling_recover` | Stores recovered source, no companion invention. |
| `frame` | `quineling_frame` | Read-only body pose. |
| `offspringPreview` | `quineling_offspring_preview` | Stateless ready/rejected candidate. |
| `offspringFrame` | `quineling_offspring_frame` | Stateless rebuild and pose. |
| `offspringAdmit` | `quineling_offspring_admit` | Explicit atomic admission under request key. |
| `lineage` | `quineling_lineage` | Read-only flat derivations. |
| `annotate` | `quineling_annotate` | Explicit companion attachment/invalidation. |
| `worldCreate` | `quineling_world_create` | Idempotent same-config world creation. |
| `worldInspect` | `quineling_world_inspect` | Read-only world snapshot. |
| `worldCommand` | `quineling_world_command` | Explicit simulation mutation; can retire/cancel. |

MCP successful `structuredContent` is `{result:...}`; errors have `isError:true` and `structuredContent:{error:{code,message,path}}`. Preview semantic refusal is a successful tool result containing `status:'rejected'`. MCP `frame` advertises phase ± 1e6; ranch `offspringFrame` accepts ± 1e9. Read-only annotations distinguish inspection from mutation; request-key/sequence idempotency is explicit. Cancellation before dispatch prevents work, but synchronous evaluation/commit is not preemptible. Requests/results are capped at 4 MiB/8 MiB.

A2A discovery advertises `build`, `ranch`, and `execute` skills. Send exactly one user JSON data part containing a Runtime dispatch request. Examples are `{operation:'offspringPreview',input}`, `{operation:'offspringAdmit',...admissionRequest}`, `{operation:'worldCreate',worldKey:'garden',seed:23,affinity:'neutral'}`, and `{operation:'worldCommand',worldId,expectedRevision,sequence,command}`. Text input still means passive `create`; it does not request execution or birth. Results retain the existing `{operation,result}` artifact envelope, with no new wrapper/version freeze. Quineling failures carry `quinelingError` metadata on the task status message. Task lifecycle/history is separately bounded/scoped; a new A2A message or task ID does not replace application admission or sequence keys. Only structured `run`/`reproduce` execute tasks.

## Atomic admission, bounds and lost responses

Admission stages exact parents and companions, recipe/policy identity, world proposal/membership/pins/energy/revision, geometry/spawn/timers, metadata conflict, all store capacities, byte budgets and acknowledgement serialization before a synchronous store swap. A refusal preserves authoritative stores, parent charges and counters. No `await` or user callback occurs in that commit. This is one Runtime's in-memory transaction, not crash durability or cross-process shared-world storage.

Successful admission receipts are checked before stale world freshness: the same `requestId` and canonical payload returns the original acknowledgement even after the proposal was consumed. Reusing a key with different input/target/identity/revision refuses. Distinct derivations may share an artifact source without replacing companion metadata. After network loss, resend the original complete admission request; keep its request key and old expected revision. If the Runtime session itself was lost, its in-memory receipts/world/lineage are lost too.

| Bound | Limit |
| --- | --- |
| Complete canonical source | 65536 UTF8 bytes. |
| Candidate / one derivation | 2 MiB / 32 KiB; at most 64 origin rows. |
| Artifact store | Default 128 artifacts, configurable 1..1024; aggregate 32 MiB including genomes/companions. |
| Execution store | Default 256 records, configurable 1..4096; admission uses no record capacity. |
| World | One per Runtime;32 residents including at most 8 nursery, 16 pairs, 16 live proposals, snapshot ≤ 1 MiB. |
| World events | Ring 256 with dropped count; informational only. |
| World command receipts | Retained window 256; older sequences refuse, never re-execute. |
| Admission receipt / derivation ledgers | 128 each; full ledgers reject without eviction. Derivation aggregate ≤ 4 MiB. |
| Admission acknowledgement | ≤ 4 KiB. |
| Tick / revision / sequence / epoch counters | Bounded at 1000000, never wrap. New deadlines must fit. |
| Lineage pagination | Flat append-order cursor; limit 1..32, default 16. Known artifact with no derivations returns empty. |

The constructor can independently execute/copy in a fresh runtime, as checked above. Local Lean ranch lemmas cover bounded integer genes, positive scale factors, namespace/protected-guard premises and staged bookkeeping models. Quint models and executable SDK/world/offspring tests supply separate evidence. None proves all 23 kernels, JS/compiler/SHA refinement, all world transactions, English semantics, authenticated ancestry, beauty, browser accessibility or renderer performance.

The JavaScript blocks above were executed together against the actual SDK source on 2026-10-04, with handwritten 12/8 and 5/0 output assertions, exact emitted-source/copy/genome checks, typed/source-only body metadata checks and explicit reciprocal social birth/charge/retry checks. No browser/performance evidence is claimed by this guide.
