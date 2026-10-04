import test from 'node:test';
import assert from 'node:assert/strict';
import {z} from 'zod';
import {Session,QdlError,sourceOnly,IntentSchema,RequestSchema,ResultSchemas,SnapshotSchema} from '../src/v1.js';
import type {Intent,ExecutionRecord} from '../src/v1.js';
// @ts-expect-error shared interpreter is JavaScript
import V from '../../../qdl-v1.js';
const fixture=():Intent=>({format:'qdl-intent',version:1,name:'Measured total',thought:'Sum the supplied measurements.',inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'item',min:0,integer:true},maxLength:512}}],steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
const failure=():Intent=>({format:'qdl-intent',version:1,name:'Bounded ratio',thought:'Divide the supplied numerator by denominator.',inputs:[{id:'n',name:'numerator',type:{kind:'number',unit:'item'}},{id:'d',name:'denominator',type:{kind:'number',unit:'one'}}],steps:[{id:'ratio',op:'arithmetic',inputs:['n','d'],params:{kind:'div'}}],outputs:['ratio'],repeats:3});
const error=(code:string)=>(e:unknown)=>e instanceof QdlError&&e.code===code;
function countExecutions(fn:(count:()=>number)=>void){const original=V.execute;let calls=0;V.execute=(...args:unknown[])=>{calls++;return original(...args);};try{fn(()=>calls);}finally{V.execute=original;}}

test('v1 inputs produce independent useful outcomes without changing executable source',()=>{
 const session=new Session(),artifact=session.compile(fixture()),source=artifact.source;
 assert.deepEqual(artifact.ports.map(p=>p.name),['samples']);
 const first=session.run({artifactId:artifact.id,requestId:'measurement-a',inputs:{samples:[3,5,7]}}),second=session.run({artifactId:artifact.id,requestId:'measurement-b',inputs:{samples:[10,20]}});
 assert.deepEqual(first.result.occurrences[0]!.outputs,[15]);assert.deepEqual(second.result.occurrences[0]!.outputs,[30]);
 assert.equal(first.result.emitted[0],source);assert.equal(second.result.emitted[0],source);assert.equal(first.artifactId,second.artifactId);assert.notEqual(first.result.inputHash,second.result.inputHash);
 assert.equal(session.inspect(artifact.id).source,source);assert.equal(first.evidence,'retained');assert.equal(session.describe().persistence,'memory');assert.equal(session.describe().effects,'simulation-only');
 artifact.program.length=0;first.result.bindings.samples=[];assert.deepEqual(session.run({artifactId:second.artifactId,requestId:'measurement-a',inputs:{samples:[3,5,7]}}).result.occurrences[0]!.outputs,[15]);
});

test('exact keyed replay returns a detached record; conflicts and full ledger refuse before evaluation',()=>countExecutions(calls=>{
 const session=new Session({maxRecords:1}),artifact=session.compile(fixture()),request={artifactId:artifact.id,requestId:'one-run',inputs:{samples:[8,9]}};
 const first=session.run(request);assert.equal(calls(),1);const replay=session.run(structuredClone(request));assert.deepEqual(replay,first);replay.result.occurrences.length=0;assert.equal(session.run(request).result.occurrences.length,1);assert.equal(calls(),1);
 assert.throws(()=>session.run({...request,inputs:{samples:[1]}}),error('request-conflict'));assert.throws(()=>session.reproduce({artifactId:artifact.id,recordId:first.id,requestId:request.requestId}),error('request-conflict'));
 assert.throws(()=>session.run({...request,requestId:'another'}),error('resource-limit'));assert.equal(calls(),1);assert.equal(session.exportSnapshot().records.length,1);
}));

test('source-only verification, source and both genomes remain passive with required ports',()=>countExecutions(calls=>{
 const session=new Session(),artifact=session.compile(fixture()),proof=session.verify(artifact.id),genomes=sourceOnly.encode(artifact.source);
 assert.equal(proof.source,artifact.source);assert.equal(proof.sourceHash,artifact.id);assert(proof.constructorSteps>0);assert.equal(sourceOnly.verifyQuine(artifact.program).sourceHash,artifact.id);
 for(const recovery of [{source:artifact.source},{harmonics:genomes.harmonics},{colors:genomes.colors}]){const fresh=new Session({maxRecords:1}),restored=fresh.recover(recovery);assert.equal(restored.id,artifact.id);assert.deepEqual(restored.payload.thought,artifact.payload.thought);assert.deepEqual(fresh.exportSnapshot().records,[]);assert.deepEqual(restored.ports,artifact.ports);}
 assert.equal(calls(),0);assert.deepEqual(session.exportSnapshot().records,[]);
 const corrupted=structuredClone(genomes.colors);corrupted.pixels[0]![0]![0]^=1;assert.throws(()=>new Session().recover({colors:corrupted}),QdlError);
}));

test('reproduction executes fresh using retained parent bindings and never implicitly changes observations',()=>countExecutions(calls=>{
 const session=new Session(),artifact=session.compile(fixture()),parent=session.run({artifactId:artifact.id,requestId:'parent',inputs:{samples:[4,6]}});
 parent.result.bindings.samples=[1000];const child=session.reproduce({artifactId:artifact.id,recordId:parent.id,requestId:'child'});assert.notEqual(parent.id,child.id);assert.equal(child.parentRecordId,parent.id);assert.deepEqual(child.result.bindings,{samples:[4,6]});assert.deepEqual(child.result.occurrences[0]!.outputs,[10]);assert.equal(calls(),2);
 assert.deepEqual(session.reproduce({artifactId:artifact.id,recordId:parent.id,requestId:'child'}),child);assert.equal(calls(),2);
 const other=session.compile({...fixture(),name:'Different source'});assert.throws(()=>session.reproduce({artifactId:other.id,recordId:parent.id,requestId:'wrong-source'}),error('stale-record'));assert.equal(calls(),2);
}));

test('valid computed failure is retained, replayable, and stops later occurrences',()=>{
 const session=new Session(),artifact=session.compile(failure()),request={artifactId:artifact.id,requestId:'zero-denominator',inputs:{numerator:12,denominator:0}},record=session.run(request);
 assert.equal(record.result.status,'failed');assert.equal(record.result.occurrences.length,1);const occurrence=record.result.occurrences[0]!;assert.equal(occurrence.status,'failed');assert.deepEqual(occurrence.outputs,[]);assert.deepEqual(occurrence.effects,[]);assert.equal(occurrence.diagnostic?.nodeId,'ratio');assert(occurrence.trace.length>0);assert.equal(record.result.emitted[0],artifact.source);assert.deepEqual(session.run(request),record);
 const child=session.reproduce({artifactId:artifact.id,recordId:record.id,requestId:'fresh-failure'});assert.equal(child.result.status,'failed');assert.equal(child.parentRecordId,record.id);
 const ok=session.run({artifactId:artifact.id,requestId:'nonzero-denominator',inputs:{numerator:12,denominator:3}});assert.equal(ok.result.status,'completed');assert.equal(ok.result.occurrences.length,3);for(const o of ok.result.occurrences)assert.deepEqual(o.outputs,[4]);
});

test('malformed bindings, accessors and unknown fields refuse without consuming a request key',()=>{
 const session=new Session({maxRecords:1}),artifact=session.compile(fixture()),request={artifactId:artifact.id,requestId:'reusable-after-refusal',inputs:{samples:[1,2]}};
 for(const inputs of [{},{samples:[-1]},{samples:[1.5]},{samples:['wrong']},{samples:[1],extra:1}])assert.throws(()=>session.run({...request,inputs} as any),QdlError);
 let touches=0;const getter=Object.defineProperty({},'samples',{enumerable:true,get(){touches++;return [1];}});assert.throws(()=>session.run({...request,inputs:getter}),QdlError);assert.equal(touches,0);
 assert.throws(()=>session.dispatch({...request,operation:'run',extra:true} as any),error('invalid-input'));assert.deepEqual(session.exportSnapshot().records,[]);assert.deepEqual(session.run(request).result.occurrences[0]!.outputs,[3]);
});

test('per-record and aggregate byte limits stage refusal before committing records or receipts',()=>{
 const tiny=new Session({maxRecordBytes:64}),a=tiny.compile(fixture()),request={artifactId:a.id,requestId:'too-large',inputs:{samples:[1]}};assert.throws(()=>tiny.run(request),error('resource-limit'));assert.deepEqual(tiny.exportSnapshot().records,[]);assert.deepEqual(tiny.exportSnapshot().receipts,[]);
 const measuring=new Session(),artifact=measuring.compile(fixture()),record=measuring.run({artifactId:artifact.id,requestId:'same-length',inputs:{samples:[2]}}),size=Buffer.byteLength(JSON.stringify(record));
 const bounded=new Session({maxRecordsBytes:size+64}),restored=bounded.recover({source:artifact.source}),first=bounded.run({artifactId:restored.id,requestId:'same-length',inputs:{samples:[2]}});
 assert.throws(()=>bounded.run({artifactId:restored.id,requestId:'next-length',inputs:{samples:[2]}}),error('resource-limit'));assert.equal(bounded.exportSnapshot().records.length,1);assert.equal(bounded.exportSnapshot().receipts.length,1);assert.equal(bounded.run({artifactId:restored.id,requestId:'same-length',inputs:{samples:[2]}}).id,first.id);
});

test('artifact capacity preserves admitted source and idempotent recovery',()=>{
 const session=new Session({maxArtifacts:1}),artifact=session.compile(fixture());assert.equal(session.recover({source:artifact.source}).id,artifact.id);
 assert.throws(()=>session.compile({...fixture(),name:'New source'}),error('resource-limit'));assert.equal(session.exportSnapshot().artifacts.length,1);assert.equal(session.inspect(artifact.id).source,artifact.source);
});

test('bounded snapshots restore passively, preserve keyed replay and mark imported history asserted',()=>countExecutions(calls=>{
 const session=new Session(),artifact=session.compile(fixture()),request={artifactId:artifact.id,requestId:'original',inputs:{samples:[11,13]}},parent=session.run(request),child=session.reproduce({artifactId:artifact.id,recordId:parent.id,requestId:'offspring'}),snapshot=session.exportSnapshot();assert.equal(calls(),2);
 const restored=Session.fromSnapshot(snapshot);assert.equal(calls(),2);assert.equal(restored.inspect(artifact.id).source,artifact.source);const replay=restored.run(request);assert.equal(replay.id,parent.id);assert.equal(replay.evidence,'asserted');assert.equal(restored.reproduce({artifactId:artifact.id,recordId:parent.id,requestId:'offspring'}).id,child.id);assert.equal(calls(),2);
 const fresh=restored.reproduce({artifactId:artifact.id,recordId:child.id,requestId:'verified-fresh'});assert.deepEqual(fresh.result.occurrences[0]!.outputs,[24]);assert.equal(fresh.evidence,'retained');assert.equal(calls(),3);
 snapshot.records[0]!.result.bindings.samples=[];assert.deepEqual(restored.run(request).result.bindings,{samples:[11,13]});
}));

test('snapshot corruption and fabricated computation cannot become retained evidence',()=>{
 const session=new Session(),artifact=session.compile(fixture()),parent=session.run({artifactId:artifact.id,requestId:'parent',inputs:{samples:[1,3]}}),snapshot=session.exportSnapshot();
 for(const mutate of [(s:any)=>s.artifacts.push(s.artifacts[0]),(s:any)=>s.records[0].result.inputHash='qi_'+'0'.repeat(64),(s:any)=>s.receipts[0].request.inputs.samples=[9],(s:any)=>s.registryDigest='0'.repeat(64),(s:any)=>s.records[0].parentRecordId='run_00000000-0000-0000-0000-000000000000']){const changed=structuredClone(snapshot);mutate(changed);assert.throws(()=>Session.fromSnapshot(changed),QdlError);}
 const claimed=structuredClone(snapshot);claimed.records[0]!.result.occurrences[0]!.outputs=[999];const imported=Session.fromSnapshot(claimed);assert.equal(imported.exportSnapshot().records[0]!.evidence,'asserted');assert.throws(()=>imported.reproduce({artifactId:artifact.id,recordId:parent.id,requestId:'check-claim'}),error('stale-record'));assert.equal(imported.exportSnapshot().records.length,1);assert.deepEqual(session.exportSnapshot(),snapshot);
});

test('shared closed request/result schemas serialize for adapter discovery',()=>{
 const session=new Session(),artifact=session.compile(fixture()),run=session.run({artifactId:artifact.id,requestId:'schema',inputs:{samples:[1,4]}});
 for(const [operation,result] of [['describe',session.describe()],['compile',artifact],['inspect',artifact],['recover',artifact],['verify',session.verify(artifact.id)],['run',run],['reproduce',run]] as const)assert(ResultSchemas[operation].safeParse(result).success);
 assert(IntentSchema.safeParse(fixture()).success);assert(!RequestSchema.safeParse({operation:'run',artifactId:artifact.id,requestId:'bad',inputs:{},extra:1}).success);assert(SnapshotSchema.safeParse(session.exportSnapshot()).success);
 for(const schema of [IntentSchema,RequestSchema,...Object.values(ResultSchemas)])assert.doesNotThrow(()=>JSON.stringify(z.toJSONSchema(schema)));
 assert.deepEqual(session.exchange({operation:'verify',artifactId:artifact.id}).result,session.verify(artifact.id));
});

test('v1 frame is deterministic, detached and passive with exact new-operation roles',()=>countExecutions(calls=>{
 const session=new Session({maxRecords:1}),artifact=session.compile(failure()),before=session.exportSnapshot();
 const frame=session.frame(artifact.id,1.25,{budget:4000,crests:2});assert.equal(frame.points.length,16000);assert.equal(frame.normals.length,12000);assert.equal(frame.owners.length,4000);assert.deepEqual(frame.nodeRoles,['input','input','process']);assert.equal(new Set(frame.owners).size,artifact.payload.task.nodes.length);assert(frame.points.every(Number.isFinite));assert(frame.normals.every(Number.isFinite));assert(frame.nodeColors.every(c=>/^#[0-9a-f]{6}$/i.test(c)));
 const again=session.dispatch({operation:'frame',artifactId:artifact.id,phase:1.25,options:{budget:4000,crests:2}});assert.deepEqual(again,frame);assert(ResultSchemas.frame.safeParse(frame).success);
 frame.points[0]=999;frame.nodeIds.length=0;assert.deepEqual(session.frame(artifact.id,1.25,{budget:4000,crests:2}),again);assert.deepEqual(session.exportSnapshot(),before);assert.equal(calls(),0);
 for(const phase of [-1e9,1e9])assert.equal(session.frame(artifact.id,phase,{budget:4000,crests:2}).owners.length,4000);
 for(const phase of [NaN,Infinity,1e9+1])assert.throws(()=>session.frame(artifact.id,phase),QdlError);
 for(const options of [{budget:3999},{budget:24001},{budget:4000.5},{crests:1},{crests:5},{crests:2.5},{reuse:true}])assert.throws(()=>session.frame(artifact.id,0,options as any),QdlError);
 assert.equal(calls(),0);assert.equal(session.run({artifactId:artifact.id,requestId:'explicit-after-view',inputs:{numerator:8,denominator:2}}).result.status,'completed');assert.equal(calls(),1);
}));

test('custom nonassembly source refuses frames while remaining recoverable and executable',async()=>{
 // @ts-expect-error shared source design has no declarations
 const {default:D}=await import('../../../qdl.js');
 const session=new Session(),artifact=session.compile({...fixture(),design:D.create()});assert.equal(session.verify(artifact.id).sourceHash,artifact.id);assert.throws(()=>session.frame(artifact.id,0),error('unsupported-frame'));
 assert.deepEqual(session.run({artifactId:artifact.id,requestId:'nonassembly-run',inputs:{samples:[6,7]}}).result.occurrences[0]!.outputs,[13]);assert.equal(new Session().recover({source:artifact.source}).id,artifact.id);
});

test('v1 frame cache reuses bodies and retains at most 32 compiled source bodies',async()=>{
 // @ts-expect-error shared assembly module has no declarations
 const {default:A}=await import('../../../anatomy.js');const original=A.compile;let compilations=0;A.compile=(...args:unknown[])=>{compilations++;return original(...args);};
 try{const session=new Session(),ids:string[]=[];for(let i=0;i<33;i++){const artifact=session.compile({...fixture(),name:'Body '+i});ids.push(artifact.id);session.frame(artifact.id,0,{budget:4000,crests:2});}assert.equal(compilations,33);session.frame(ids[32]!,1,{budget:4000,crests:2});assert.equal(compilations,33);session.frame(ids[0]!,0,{budget:4000,crests:2});assert.equal(compilations,34);assert.deepEqual(session.exportSnapshot().records,[]);}finally{A.compile=original;}
});
