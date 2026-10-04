import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Runtime,QuinelingError,examples,type Intent,type Request,type ParseResult} from '../src/index.js';
function code(expected:string){return (e:unknown)=>e instanceof QuinelingError&&e.code===expected;}
function build(r=new Runtime(),thought='[2,3,4] | square | sum | report total',seed=14){const x=r.create(thought,{seed});assert.equal(x.status,'supported');if(x.status!=='supported')throw Error('Expected supported');return {r,a:x.artifact};}

test('independent outcomes, deterministic source, three fresh generations and both codecs',()=>{
 const {r,a}=build();assert.equal(a.contract?.sourceBytes,Buffer.byteLength(a.source));
 assert.equal(new Runtime().create('[2,3,4] | square | sum | report total',{seed:14}).status,'supported');
 const b=build(new Runtime()).a;assert.equal(a.source,b.source);assert.equal(a.id,b.id);
 let run=r.run(a.id);assert.deepEqual(run.result.tasks[0]?.output,[{total:29}]);
 for(let i=0;i<3;i++){const child=r.reproduce(a.id,run.id);assert.equal(child.artifact.source,a.source);assert.equal(child.record.parentRecordId,run.id);assert.notEqual(child.record.id,run.id);assert.deepEqual(child.record.result.tasks[0]?.output,[{total:29}]);run=child.record;}
 for(const recovery of [{source:a.source},{harmonics:a.harmonics},{colors:a.colors}]){const fresh=new Runtime();const restored=fresh.recover(recovery);assert.equal(restored.source,a.source);assert.equal(restored.id,a.id);assert.equal(restored.intent,undefined);assert.deepEqual(fresh.run(restored.id).result.tasks[0]?.output,[{total:29}]);}
});
test('compile/recover/inspect/frame are passive and detached from internal source/records',()=>{
 const {r,a}=build(new Runtime({maxRecords:1}));
 const before=JSON.stringify(a);
 const frame=r.frame(a.id,0,{budget:4000,crests:2});assert.equal(frame.points.length,16000);assert.equal(frame.owners.length,4000);assert.equal(new Set(frame.owners).size,a.graph.nodes.length);assert(frame.normals.every(Number.isFinite));
 r.inspect(a.id);r.recover({source:a.source});assert.equal(JSON.stringify(a),before);
 a.program.length=0;a.graph.nodes.length=0;a.harmonics.bands[0]![0]=0;
 const record=r.run(a.id);assert.deepEqual(record.result.tasks[0]?.output,[{total:29}]);record.result.emitted.length=0;
 assert.equal(r.inspect(a.id).source,JSON.parse(before).source);
 assert.throws(()=>r.run(a.id),code('resource-limit'));
});
test('eager action needs guard and permissions; an explicit run creates simulation only',()=>{
 const {r,a}=build(new Runtime(),'route A to D in {"A":["D"],"D":[]} blocked [] | simulate "walk-route"');
 const record=r.run(a.id);assert.equal(record.result.tasks[0]?.effects.length,1);
 const intent=structuredClone(a.intent!);const action=intent.steps.find(x=>x.op==='action');assert(action&&action.op==='action');action.params.allowed=false;
 const denied=r.compile(intent,{seed:14});assert.equal(r.run(denied.id).result.tasks[0]?.effects.length,0);
});
test('closed input and resource limits reject malformed data before execution',()=>{
 const {r,a}=build();assert.throws(()=>r.run('missing'),code('unknown-artifact'));
 assert.throws(()=>r.reproduce(a.id,'missing'),code('unknown-record'));
 for(const input of [undefined,null,{operation:'run',artifactId:a.id,extra:true},{operation:'wat'}, {operation:'frame',artifactId:a.id,phase:Infinity}])assert.throws(()=>r.dispatch(input as Request),code('invalid-input'));
 let touches=0;const bad=Object.defineProperty({},'operation',{enumerable:true,get(){touches++;return 'run';}});assert.throws(()=>r.dispatch(bad as Request),code('invalid-input'));assert.equal(touches,0);
 const circular:any={operation:'parse'};circular.self=circular;assert.throws(()=>r.dispatch(circular),code('invalid-input'));
 for(const x of [{seed:-1},{seed:1.5},{repeats:0},{repeats:9},{seed:NaN},{extra:1}])assert.throws(()=>r.create('[1] | sum',x as any),code('invalid-input'));
 assert.throws(()=>r.recover({source:a.source,harmonics:a.harmonics} as any),code('invalid-input'));
 const corrupted=structuredClone(a.harmonics);corrupted.bands[0]![0]=0;assert.throws(()=>r.recover({harmonics:corrupted}),code('invalid-source'));
 assert.throws(()=>r.frame(a.id,1e10),code('invalid-input'));
 assert.throws(()=>r.frame(a.id,0,{budget:3999}),code('invalid-input'));
 assert.throws(()=>r.frame(a.id,0,{crests:5}),code('invalid-input'));
});
test('invalid constructor source cannot smuggle eager execution into recovery',()=>{
 const {a}=build();const fresh=new Runtime({maxRecords:1});
 const extra=['seq',['emit',['quote',[]]],a.program];assert.throws(()=>fresh.recover({source:JSON.stringify(extra)}),code('invalid-source'));
 const restored=fresh.recover({source:a.source});assert.deepEqual(fresh.run(restored.id).result.tasks[0]?.output,[{total:29}]);
});
test('source changes reject stale reproduction and metadata collisions remain explicit',()=>{
 const {r,a}=build();const record=r.run(a.id);const b=build(r,'[2,3,4] | square | sum | report total',15).a;
 assert.notEqual(b.id,a.id);assert.throws(()=>r.reproduce(b.id,record.id),code('stale-record'));
 const prior=r.inspect(a.id);r.compile(a.intent!,{seed:14});assert.deepEqual(r.inspect(a.id).sourceMap,prior.sourceMap);
 const other=structuredClone(a.intent!);other.thought='different interpretation';
 assert.throws(()=>r.compile(other,{seed:14}),code('metadata-conflict'));
});
test('all shipped recipes produce useful new source-authored bodies',()=>{
 const r=new Runtime();for(const thought of examples){const result=r.create(thought);assert.equal(result.status,'supported',thought);if(result.status==='supported'){const a=result.artifact;assert(a.design.anatomy);assert(a.design.motion.gesture);assert.equal(r.run(a.id).result.emitted[0],a.source);}}
});
test('provider proposals pass typed checks, preserve failures and respect cancellation',async()=>{
 const r=new Runtime(),parsed=r.parse('[2,3,4] | sum');assert.equal(parsed.status,'supported');
 const response=await r.propose('Please calculate the sum of the given data.',{async propose(){return parsed;}});assert.equal(response.status,'supported');
 const invalid=structuredClone(parsed);if(invalid.status==='supported')invalid.intent.steps[0]!.inputs=['missing'] as any;
 await assert.rejects(r.propose('proposal',{async propose(){return invalid;}}),code('invalid-intent'));
 const cancel=new AbortController();cancel.abort();await assert.rejects(r.propose('proposal',{async propose(){throw Error('must not call');}}, {},cancel.signal),code('cancelled'));
 const cancelledLater=new AbortController();await assert.rejects(r.propose('proposal',{async propose(){cancelledLater.abort();return parsed;}},{},cancelledLater.signal),code('cancelled'));
 const unsure:ParseResult={status:'clarify',diagnostics:[{code:'missing',path:'$',message:'Supply data'}],assumptions:[],sourceMap:[]};assert.equal((await r.propose('unsure',{async propose(){return unsure;}})).status,'clarify');
});
test('store limits and source normalization are explicit',()=>{
 const {r,a}=build(new Runtime({maxArtifacts:1,maxRecords:2}));assert.throws(()=>r.create('[4] | sum'),code('resource-limit'));
 assert.equal(new Runtime().recover({source:JSON.stringify(a.program,null,2)}).source,a.source);
 const run=r.run(a.id);r.reproduce(a.id,run.id);assert.throws(()=>r.reproduce(a.id,run.id),code('resource-limit'));
});
