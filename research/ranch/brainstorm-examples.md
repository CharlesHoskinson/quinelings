# Five useful, inspectable offspring fixtures

Experimental candidate input, 2026-10-04. This report changes no runtime or website code. Recipes below follow `brainstorm-semantics.md`: directional composition replaces a recipient literal; mating imports a pure dependency closure and preserves recipient computation; parallel composition retains both tasks. Body policy and lineage placement still need convergence with `brainstorm-genetics.md`. These fixtures do not resolve that policy disagreement by introducing source fields.

Each child contains its own literals and computation. Parent cached outputs, execution records, resident energy, credentials and authority are never task inputs. All expected results are hand-derived below and are compared against literal oracles in the executable fixture. Building and viewing a candidate must create zero task runs; compiler refinement calculations are distinct from explicit execution. The Node experiment deliberately runs the fixtures and is not a proposed preview implementation.

## 1. Reservoir mean feeds a watering budget

Parent A thinks: “Average supplied reservoir readings `[10,20,30] L`.” It returns `[20]`. Parent B thinks: “Budget available `5 L` for desired `12 L`.” It returns `[{allocated:5,remaining:0}]`.

Compose A output `mean` into B literal `available`, retain B output `budget`, remove the displaced literal, and namespace inherited nodes. The exact child is `c1` below. It recomputes `(10+20+30)/3=20`, allocates `min(20,12)=12`, and leaves `8 L`. Expected ordered outputs: `[{allocated:12,remaining:8}]`. A and B contribute executable computation, not their previous results. This same graph can arise through a pure mean-slice mating recipe; identical resulting source does not establish identical derivation.

Connection is `number<L> → number<L>`. `number<mL>` and `number<s>` reject despite identical numbers. `L*s*s^-1` normalizes to `L` and is compatible. A negative available result passes the structural port type but fails the budget's nonnegative refinement. An empty donor array fails `mean` before admission.

Thought → program → body: the generated recipe summary names the inherited mean and budget, not a new English promise about actual watering. The child's mean dependency connects to budget port 0; desired remains port 1. Generate anatomy for all four child nodes, including the retained desired literal. Body ownership follows those nodes; reservoir readings are array items within one literal node, not three additional organs. No external water action occurs.

## 2. Pure filtered-readings slice mates into a weighted estimator

Donor A filters `[12,24,36,48] L` with `gt 12`, returning `[[24,36,48]]`. Recipient B weights `[12,24,36] L` by dimensionless `[1,2,1]`, returning `[24]` because `(12+48+36)/4=24`.

Replace recipient literal `values` with donor output `filtered` and its pure closure, keeping recipient `weights` and `weighted`. Child `c2` computes `(24+72+48)/4=36`, so expected output is `[36]`. It is useful recombination: the donor contributes selection, the recipient contributes weighted aggregation. The inherited threshold is `12 L`, interpreted relative to its filter input; it is not a separately typed literal port.

Replacement is `array<number<L>> → array<number<L>>`. Seconds, squared litres, or an optional array reject. Weight arrays must remain `array<number<one>>`, have matching nonempty lengths, nonnegative entries and positive mass. Equal structural types do not prove those refinements: replacing the donor filter threshold with `gt 24` leaves two values against three weights and must reject. A threshold `gt 48` produces an empty array and rejects. A donor slice containing an action anywhere in its dependency closure rejects even if its final output type fits.

Thought → program → body: “Use donor-selected readings in recipient weighted estimator” is a generated recipe summary. The child has two literal nodes, one filter and one weightedMean, with ordered values/weights ports intact. WeightedMean receives two dependency paths; the body may reflect that convergence, but appearance does not establish the calculated answer.

## 3. Joined report combines supply allocation and preparation schedule

Supply parent A allocates `9 L` in order to fern requesting `4 L`, then sage requesting `7 L`. Expected output is `[{grants:[{id:'fern',requested:4,granted:4},{id:'sage',requested:7,granted:5}],remaining:0}]`.

Schedule parent B supplies `fill` duration `2 s`, then `water` dependent on fill with duration `3 s`. Expected output is `[{order:['fill','water'],jobs:[{id:'fill',start:0,end:2},{id:'water',start:2,end:5}],makespan:5}]`.

Child `c3` retains both complete graphs and adds a `report` node with ordered inputs `[allocation,schedule]` and labels `['supply','preparation']`. Its sole output is the record containing exactly both preceding objects. This requires a report-join option in the converged recipe schema: today's semantics proposal only exposes ordered parallel outputs, which would instead return `[allocationObject,scheduleObject]`. Do not silently label that array as a generated report. If no join opcode is admitted, present the ordered parallel-output variant explicitly.

The supply record carries litre-valued grants/remaining; the schedule record carries second-valued starts/ends/makespan. `report` preserves both structural types without requiring compatible units and performs no conversion. Connecting makespan to available litres rejects. Fractional allocations, duplicate request IDs, missing job dependencies or dependency cycles fail refinements. Duplicate report labels fail parameters. Changing grants does not recompute schedule durations: the two tasks share a presentation record, not a planning algorithm.

Thought → program → body: the generated summary says “Compute both supplied tasks and join their reports.” Both parent computations remain and a new report convergence node owns its own positive body territory. A social ribbon between residents is distinct from either this new dependency or a computation link.

## 4. Pure route payload donation preserves a simulated-action guard

Donor A computes route A→D in `{A:['B','C'],B:['D'],C:['D'],D:[]}` with B blocked, then extracts `path`. Ordered BFS selects `['A','C','D']`; output is `[['A','C','D']]`.

Recipient B has explicit Boolean `permit:false`, literal payload `['A','D']`, and `action` parameters `{allowed:true,action:'walk-route'}`. It returns `[{status:'skipped',action:'walk-route',payload:['A','D']}]` and zero simulated receipts.

Mate the pure donor `path` closure into recipient literal `payload`. Child `c4` returns `[{status:'skipped',action:'walk-route',payload:['A','C','D']}]`, with zero simulated receipts. It keeps recipient's guard node, connection, allowed flag and action name exactly. In separately authored, explicitly declared variants, setting `permit:true` gives `status:'simulated'` and exactly one receipt; setting `allowed:false` still skips. These variants are fixture edits, not permission inherited from the donor.

`array<string>` fits the payload replacement. Replacing `permit`, its ancestors, or the action node rejects under protected-guard policy even for a same-type pure donor. Selecting donor `route.distance` yields `optional<number<edge>>`; feeding it into a required numerical budget rejects optionality and units. Actions inside `choose` branches reject because the runtime is eager. All route constants remain supplied local data, and “walk-route” performs no real movement or network action.

Thought → program → body: the summary explicitly says the payload changed while guard stayed false. BFS and get contribute distinct nodes, while graph cities remain record/array data. The action body region must display skipped recorded status only after an explicit child run, never copy a parent's previous status.

## 5. Body inheritance changes gesture strength, not the task

Reuse typed recipient B from scenario 1 unchanged. Give its source an assembly generated with seed `17`; give donor A an assembly generated with seed `23`. Explicitly author recipient gesture strength `0.55` and donor strength `0.70`. The child retains recipient graph, anatomy, gesture kind/ticks, units and all other design fields, replacing only `motion.gesture.strength` with donor's `0.70`. Exact constructions are in the fixture. This is a simple bounded style locus compatible with current QDL, not an implementation of the proposed six-trait genetics model.

Both parent B and child output `[{allocated:5,remaining:0}]`. Child source/body differ; executable task is exactly equal. Call it “body-only inheritance”; do not call it a new budgeting capability. Donor mean remains a donor task and is not computed by this child. No donor owner intervals are transplanted: child ownership remains valid for the unchanged recipient nodes. A retained donor lens referring to `mean` would fail binding validation against the recipient graph. A body field beyond the closed QDL schema, invalid gesture bounds, or missing required anatomy ownership rejects.

Thought → program → body: the original companion task thought stays associated with the unchanged task; a separate generated body-recipe summary explains the strength inheritance. Gesture strength affects rendering on the separate presentation clock and never changes available litres, run count or outputs. Source recovery preserves resolved body/task but cannot invent missing historical thought, units, parent identity or lineage.

## Exact typed fixtures and independent literal oracles

Run this single fenced block with Node from the repository root (or extract it to an isolated interpreter). Constructors expand to complete existing IntentIR records; they introduce no new runtime operation. Names are human-readable fixture IDs; production remapping must follow the converged canonical namespace policy. Assertions use handwritten expected values, not parent runs as child oracles. Every fixture compiles, runs through kernels, builds a validated assembly, and emits exact source from the shared constructor quine.

```js
const assert = require('node:assert/strict');
const T = require('./thought.js'), K = require('./kernels.js');
const Q = require('./core.js'), D = require('./qdl.js'), A = require('./anatomy.js');
const N = unit => ({kind:'number',unit});
const S = {kind:'string'}, B = {kind:'boolean'};
const Arr = element => ({kind:'array',element});
const Rec = fields => ({kind:'record',fields});
const I = (id,value,type) => ({id,value,type});
const E = (id,op,inputs,params={}) => ({id,op,inputs,params});
const P = (name,inputs,steps,outputs) => ({format:'quineling-intent',name,
  thought:'Generated fixture recipe: '+name,inputs,steps,outputs,assumptions:[]});
const ml = I('readings',[10,20,30],Arr(N('L')));
const mean = E('mean','mean',['readings']);
const desired = I('desired',12,N('L'));
const a1 = P('reservoir',[ml],[mean],['mean']);
const b1 = P('budget',[I('available',5,N('L')),desired],
  [E('budget','budget',['available','desired'])],['budget']);
const c1 = P('reservoir-budget',[ml,desired],
  [mean,E('budget','budget',['mean','desired'])],['budget']);

const raw = I('raw',[12,24,36,48],Arr(N('L')));
const filtered = E('filtered','filter',['raw'],{operator:'gt',value:12});
const weights = I('weights',[1,2,1],Arr(N('one')));
const a2 = P('selection',[raw],[filtered],['filtered']);
const b2 = P('weighted',[I('values',[12,24,36],Arr(N('L'))),weights],
  [E('weighted','weightedMean',['values','weights'])],['weighted']);
const c2 = P('selected-weighted',[raw,weights],
  [filtered,E('weighted','weightedMean',['filtered','weights'])],['weighted']);

const reqType = Arr(Rec({id:S,amount:N('L')}));
const jobType = Arr(Rec({id:S,depends:Arr(S),duration:N('s')}));
const supplyInputs = [I('stock',9,N('L')),I('requests',
  [{id:'fern',amount:4},{id:'sage',amount:7}],reqType)];
const jobInputs = [I('jobs',[{id:'fill',depends:[],duration:2},
  {id:'water',depends:['fill'],duration:3}],jobType)];
const allocation = E('allocation','allocate',['stock','requests']);
const schedule = E('schedule','schedule',['jobs']);
const a3 = P('supply',supplyInputs,[allocation],['allocation']);
const b3 = P('preparation',jobInputs,[schedule],['schedule']);
const c3 = P('joined-report',[...supplyInputs,...jobInputs],
  [allocation,schedule,E('joined','report',['allocation','schedule'],
    {labels:['supply','preparation']})],['joined']);
const supplyExpected = {grants:[{id:'fern',requested:4,granted:4},
  {id:'sage',requested:7,granted:5}],remaining:0};
const scheduleExpected = {order:['fill','water'],jobs:[
  {id:'fill',start:0,end:2},{id:'water',start:2,end:5}],makespan:5};

const roadInputs = [I('roads',{A:['B','C'],B:['D'],C:['D'],D:[]},
  Rec({A:Arr(S),B:Arr(S),C:Arr(S),D:Arr(S)})),I('blocked',['B'],Arr(S))];
const route = E('route','bfs',['roads','blocked'],{start:'A',goal:'D'});
const path = E('path','get',['route'],{path:'path'});
const permit = I('permit',false,B);
const act = payload => E('walk','action',['permit',payload],
  {allowed:true,action:'walk-route'});
const a4 = P('route-payload',roadInputs,[route,path],['path']);
const b4 = P('guarded-walk',[permit,I('payload',['A','D'],Arr(S))],
  [act('payload')],['walk']);
const c4 = P('inherited-payload',[...roadInputs,permit],
  [route,path,act('path')],['walk']);
const skipped = payload => ({status:'skipped',action:'walk-route',payload});

function design(graph,seed) {
  const d = D.create(), g = A.generate(graph,seed);
  d.anatomy = g.anatomy; d.motion.gesture = g.gesture;
  D.validateBindings(d,graph); return d;
}
const fixtures = [[a1,[20]],[b1,[{allocated:5,remaining:0}]],
  [c1,[{allocated:12,remaining:8}]],[a2,[[24,36,48]]],[b2,[24]],[c2,[36]],
  [a3,[supplyExpected]],[b3,[scheduleExpected]],
  [c3,[{supply:supplyExpected,preparation:scheduleExpected}]],
  [a4,[['A','C','D']]],[b4,[skipped(['A','D'])]],
  [c4,[skipped(['A','C','D'])]]];
for (const [intent,expected] of fixtures) {
  const {graph} = T.compile(intent), result = K.run(graph);
  assert.deepEqual(result.output,expected); assert.equal(result.effects.length,0);
  const source = Q.makeTaskProgram(graph,1,design(graph,17));
  const run = Q.execute(source);
  assert.deepEqual(run.tasks[0].output,expected);
  assert.equal(run.emitted[0],Q.canon(source));
}
const graphB = T.compile(b1).graph, graphA = T.compile(a1).graph;
const bodyB = design(graphB,17), bodyA = design(graphA,23);
bodyB.motion.gesture.strength = 0.55; bodyA.motion.gesture.strength = 0.70;
const bodyChild = structuredClone(bodyB);
bodyChild.motion.gesture.strength = bodyA.motion.gesture.strength;
D.validateBindings(bodyChild,graphB);
const parentSource = Q.makeTaskProgram(graphB,1,bodyB);
const childSource = Q.makeTaskProgram(graphB,1,bodyChild);
assert.notEqual(Q.canon(parentSource),Q.canon(childSource));
const stripDesign = source => {
  const g = structuredClone(Q.describe(source).graph); delete g.design; return g;
};
assert.deepEqual(stripDesign(parentSource),stripDesign(childSource));
assert.deepEqual(Q.execute(childSource).tasks[0].output,[{allocated:5,remaining:0}]);
assert.equal(Q.execute(childSource).emitted[0],Q.canon(childSource));

const malformed = structuredClone(c2); malformed.steps[0].params.value = 24;
assert.throws(() => T.compile(malformed),e => e.code === 'refinement');
const wrongWeights = structuredClone(c2); wrongWeights.inputs[1].type = Arr(N('L'));
assert.throws(() => T.compile(wrongWeights),e => e.code === 'unit-type');
const invalidBudget = structuredClone(c1); invalidBudget.inputs[0].value = [-10,-20,-30];
assert.throws(() => T.compile(invalidBudget),e => e.code === 'refinement');
console.log('12 typed parent/child fixtures; body-only source/task distinction; 3 compiler rejection oracles passed');
```

Verified locally with Node by extracting the fenced fixture directly from this report: all 12 typed parent/child cases passed their literal output oracles, assembly validation and constructor source-emission checks; body-only task equality/source inequality and all three compiler rejection oracles passed. No production code was changed.

## Integration acceptance and claim boundaries

Port mismatches in the recipe layer are not currently compiler APIs: literals disappear into untyped task graphs after compilation. Preserve validated companion IntentIR and compare normalized contract types before replacing them. A naked graph still computing `20` cannot reveal whether its author declared litres or seconds. Missing metadata rejects typed mating; inspection, running and exact copying remain available according to their existing contracts.

For every accepted task child, export its complete source, load it into a fresh runtime without parents or records, explicitly run it, and check the handwritten output plus exact emitted source. This report verifies constructor execution locally but does not claim SDK source-only admission or browser recovery tests. Run the derived source again to establish exact copying separately from changed offspring. Show no historical lineage or unit metadata when only source was recovered.

Integration tests must additionally exercise proposed recipe-layer rejection for mismatched units/types, impure donor closure, protected guards, disconnected retained graphs and stale parents. These are obligations, not results of the isolated compiler experiment. Preparation/admission/viewing counters must remain zero; one explicit Run produces one child record, with effects determined only by its own local guards. The combined-report schema extension and body policy require candidate review and the planned nine independent audits before implementation.
