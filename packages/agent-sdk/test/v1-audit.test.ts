import test from 'node:test';
import assert from 'node:assert/strict';
import {Session,QdlError,sourceOnly} from '../src/v1.js';
import type {Intent} from '../src/v1.js';
// @ts-expect-error shared JavaScript interpreter
import V from '../../../qdl-v1.js';
// @ts-expect-error shared JavaScript core
import Core from '../../../core.js';
// @ts-expect-error shared JavaScript library
import Library from '../../../qdl-v1-library.js';
// @ts-expect-error shared JavaScript types
import T from '../../../qdl-v1-types.js';
const recipe=(id:string):Intent=>Library.get(id).intent;
const first=(r:any)=>r.result.occurrences[0];
function payloads(ast:any){const out:any[]=[];function visit(x:any){if(!Array.isArray(x))return;if(x[0]==='task'&&x[1]?.[0]==='quote')out.push(x[1][1]);x.slice(1).forEach(visit);}visit(ast);return out;}
const inertError=(e:any)=>e.code==='json'&&typeof e.path==='string'&&!(e instanceof RangeError);

test('raw core checks both copies before getters; cycles and options refuse with structured diagnostics',()=>{
 for(const method of ['execute','describe'])for(const index of [0,1]){const ast=V.compile(recipe('water-total'));let touches=0;Object.defineProperty(payloads(ast)[index],'format',{enumerable:true,get(){touches++;return 'qdl-program';}});assert.throws(()=>Core[method](ast),inertError);assert.equal(touches,0);}
 for(const method of ['execute','describe']){const cycle:any[]=['quote'];cycle.push(cycle);assert.throws(()=>Core[method](cycle),inertError);}
 const ast=V.compile(recipe('water-total'));let touches=0;const options=Object.defineProperty({},'bindings',{enumerable:true,get(){touches++;return {readings:[1]};}});assert.throws(()=>Core.execute(ast,options),inertError);assert.equal(touches,0);
 const changed=structuredClone(ast);payloads(changed)[1].name='different';assert.throws(()=>Core.execute(changed,{constructionOnly:true}));
});

test('identity rejects noncanonical text, duplicate keys, changed copies and foreign registry',()=>{
 const s=new Session(),a=s.compile(recipe('water-total'));assert.throws(()=>s.recover({source:' '+a.source}),QdlError);
 const duplicate=a.source.replace('"format":"qdl-program"','"format":"qdl-program","format":"qdl-program"');assert.notEqual(duplicate,a.source);assert.throws(()=>s.recover({source:duplicate}),QdlError);
 for(const index of [0,1]){const ast=structuredClone(a.program);payloads(ast)[index].name='changed';assert.throws(()=>sourceOnly.verifyQuine(ast),QdlError);}
 const ast=structuredClone(a.program);payloads(ast).forEach(p=>p.registryDigest='0'.repeat(64));assert.throws(()=>sourceOnly.verifyQuine(ast),QdlError);assert.equal(s.inspect(a.id).source,a.source);assert.equal(s.exportSnapshot().records.length,0);
});

test('canonical replay ignores record insertion order while comparing all fields',()=>{
 const s=new Session(),a=s.compile(recipe('receipt-reconciliation')),r=s.run({artifactId:a.id,requestId:'same',inputs:{receipts:[],policy:{operation:'craft',requested:1,maxAttempts:2}}});
 const replay=s.run({artifactId:a.id,requestId:'same',inputs:{policy:{maxAttempts:2,requested:1,operation:'craft'},receipts:[]}});assert.equal(replay.id,r.id);assert.equal(s.exportSnapshot().records.length,1);
 assert.throws(()=>s.run({artifactId:a.id,requestId:'same',inputs:{receipts:[],policy:{operation:'craft',requested:1,maxAttempts:3}}}),(e:any)=>e.code==='request-conflict');
});

test('failure after a staged action rolls back occurrence effects and stops subsequent repeats',()=>{
 const intent:Intent={format:'qdl-intent',version:1,name:'Staging audit',thought:'Propose and summarize supplied samples.',inputs:[{id:'yes',value:true,type:{kind:'boolean'}},{id:'payload',value:'proposal',type:{kind:'string'}},{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'one'}}}],steps:[{id:'proposal',op:'action',inputs:['yes','payload'],params:{allowed:true,action:'audit'}},{id:'average',op:'mean',inputs:['samples'],params:{}}],outputs:['proposal','average'],repeats:3};
 const s=new Session(),a=s.compile(intent),request={artifactId:a.id,requestId:'empty',inputs:{samples:[]}},bad=s.run(request),o=first(bad);assert.equal(bad.result.status,'failed');assert.equal(bad.result.occurrences.length,1);assert.equal(o.diagnostic.nodeId,'average');assert.deepEqual(o.outputs,[]);assert.deepEqual(o.effects,[]);assert(o.trace.some((t:any)=>t.nodeId==='proposal'&&t.value.status==='simulated'));assert.equal(bad.result.emitted[0],a.source);assert.deepEqual(s.run(request),bad);
 const good=s.run({artifactId:a.id,requestId:'good',inputs:{samples:[2,4]}});assert.equal(good.result.occurrences.length,3);for(const x of good.result.occurrences){assert.deepEqual(x.outputs,[{status:'simulated',action:'audit',payload:'proposal'},3]);assert.equal(x.effects.length,1);}
});
const e=(id:string,value:boolean|null,extra:Record<string,unknown>={})=>({id,source:'one-observer',claim:'ready',value,kind:'observation',observedAt:0,revision:2,...extra});
test('evidence uses inclusive age and revision, preserves skip priority and does not inflate independent sources',()=>{
 const s=new Session(),a=s.compile(recipe('evidence-ledger')),records=[e('a',true),e('b',true),e('c',false),e('u',null,{observedAt:11}),e('f',true,{observedAt:11}),e('old',true,{revision:1}),e('other',true,{claim:'other',observedAt:11})];
 const r=s.run({artifactId:a.id,requestId:'ledger',inputs:{records,claim:'ready',clock:{now:10,maxAge:10,minRevision:2}}});assert.deepEqual(first(r).outputs,[{state:'conflict',support:1,refute:1,sources:1,sourceConflicts:['one-observer'],used:records.slice(0,3),skipped:[{record:records[3],reason:'unknown'},{record:records[4],reason:'future'},{record:records[5],reason:'revision'},{record:records[6],reason:'claim'}]}]);
 const stale=s.run({artifactId:a.id,requestId:'aged',inputs:{records:[records[0]],claim:'ready',clock:{now:11,maxAge:10,minRevision:2}}});assert.equal(first(stale).outputs[0].skipped[0].reason,'stale');
});
const receipt=(id:string,attempt:string,sequence:number,status:string,units=0)=>({id,operation:'craft',attempt,sequence,status,units});
test('receipt order and duplicate delivery cannot alter units; unknown blocks even a met or zero quota',()=>{
 const s=new Session(),a=s.compile(recipe('receipt-reconciliation')),done=receipt('done','a',2,'confirmed',3),pending=receipt('waiting','a',1,'pending'),unknown=receipt('unknown','b',1,'unknown'),policy={operation:'craft',requested:3,maxAttempts:2};
 const one=s.run({artifactId:a.id,requestId:'one',inputs:{receipts:[done,unknown,pending,done],policy}}),two=s.run({artifactId:a.id,requestId:'two',inputs:{receipts:[pending,done,unknown],policy}}),expected={state:'unknown',confirmedUnits:3,confirmedAttempts:1,failedAttempts:0,pendingAttempts:0,unknownAttempts:1,attempts:2,mayRetry:false};assert.deepEqual(first(one).outputs,[expected]);assert.deepEqual(first(two).outputs,[expected]);assert.notEqual(one.result.inputHash,two.result.inputHash);
 const zero=s.run({artifactId:a.id,requestId:'zero',inputs:{receipts:[unknown],policy:{...policy,requested:0}}});assert.equal(first(zero).outputs[0].state,'unknown');
});
test('conflicting IDs, equal sequences and terminal regressions fail and replay without retry effects',()=>{
 const s=new Session(),a=s.compile(recipe('receipt-reconciliation')),policy={operation:'craft',requested:1,maxAttempts:2};
 const histories=[[receipt('id','a',1,'confirmed',1),receipt('id','a',1,'confirmed',2)],[receipt('id','a',1,'pending'),receipt('other','a',1,'unknown')],[receipt('id','a',1,'confirmed',1),receipt('other','a',2,'failed')]];
 histories.forEach((receipts,i)=>{const request={artifactId:a.id,requestId:String(i),inputs:{receipts,policy}},r=s.run(request);assert.equal(r.result.status,'failed');assert.equal(first(r).diagnostic.code,'receipt-conflict');assert.deepEqual(first(r).effects,[]);assert.deepEqual(s.run(request),r);});assert.equal(s.exportSnapshot().records.length,3);
});
test('independent UTF8 byte, UTF16 scalar, array and integer boundaries',()=>{
 const within=['x'.repeat(16382),'x'.repeat(16382),'x'.repeat(16382),'x'.repeat(16377)];assert.equal(Buffer.byteLength(JSON.stringify(within)),65536);assert.equal(T.finiteJSON(within),true);assert.throws(()=>T.finiteJSON([...within.slice(0,3),'x'.repeat(16378)]),(e:any)=>e.code==='limit');
 assert.equal(T.finiteJSON('😀'.repeat(8192)),true);assert.throws(()=>T.finiteJSON('😀'.repeat(8193)));assert.equal(T.assert(Number.MAX_SAFE_INTEGER,{kind:'number',unit:'item',integer:true}),true);assert.throws(()=>T.assert(Number.MAX_SAFE_INTEGER+1,{kind:'number',unit:'item',integer:true}));assert.equal(T.finiteJSON(Array(512).fill(null)),true);assert.throws(()=>T.finiteJSON(Array(513).fill(null)));assert.throws(()=>T.finiteJSON(Array(1)));
});
test('large trace fails within the semantic cap with no effects and fresh reproduction agrees',()=>{
 const steps:any[]=[{id:'proposal',op:'action',inputs:['yes','text'],params:{allowed:true,action:'large'}}];for(let i=0;i<59;i++)steps.push({id:'v'+i,op:'choose',inputs:['yes',i===0?'text':'v'+(i-1),'text'],params:{}});
 const intent:Intent={format:'qdl-intent',version:1,name:'Trace audit',thought:'Propagate supplied text.',inputs:[{id:'yes',value:true,type:{kind:'boolean'}},{id:'text',name:'text',type:{kind:'string'}}],steps,outputs:['proposal','v58'],repeats:3};
 const s=new Session(),a=s.compile(intent),r=s.run({artifactId:a.id,requestId:'large',inputs:{text:'x'.repeat(16384)}});assert.equal(r.result.status,'failed');const failed=r.result.occurrences.find(x=>x.status==='failed')!;assert.equal(failed.diagnostic!.code,'limit');assert.deepEqual(failed.effects,[]);assert.deepEqual(failed.outputs,[]);assert(Buffer.byteLength(JSON.stringify(r.result))<=V.RUN_LIMIT);assert.equal(r.result.emitted[0],a.source);const child=s.reproduce({artifactId:a.id,recordId:r.id,requestId:'fresh'});assert.deepEqual(child.result,r.result);
});

test('explicit migration is passive, type complete and rejects hidden request data',async()=>{
 const {migrateLegacy}=await import('../src/v1-migrate.js');
 const old=Core.makeTaskProgram({version:1,nodes:[{id:'samples',op:'literal',inputs:[],params:{value:[1,2]}},{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
 const source=Core.canon(old),harmonics=Core.encode(old),thought={observations:[{id:'o',text:'Supplied readings',input:'samples',path:[],basis:'testimony' as const}],evidence:[],goals:[],decisions:[],plans:[],tasks:[{id:'t',text:'Sum',nodes:['samples','total'],outputs:['total']}]};
 const request={source,registryDigest:V.registryDigest,name:'Audit migration',thought,types:{samples:{kind:'array' as const,element:{kind:'number' as const,unit:'L'}},total:{kind:'number' as const,unit:'L'}},ports:{samples:'readings'},evidenceClaims:{}};
 for(const key of ['source','unexpected']){const hidden=structuredClone(request);Object.defineProperty(hidden,key,{value:key==='source'?source:1,enumerable:false});assert.throws(()=>migrateLegacy(hidden),(e:any)=>typeof e.code==='string');}
 let touches=0;const getter=structuredClone(request);Object.defineProperty(getter,'source',{enumerable:true,get(){touches++;return source;}});assert.throws(()=>migrateLegacy(getter));assert.equal(touches,0);
 const preview=migrateLegacy(request);assert.equal(preview.executed,false);assert.equal(preview.evidence,'authored-conversion');assert.notEqual(preview.artifact.source,source);const session=new Session(),a=session.recover({source:preview.artifact.source});assert.equal(session.exportSnapshot().records.length,0);assert.deepEqual(first(session.run({artifactId:a.id,requestId:'fresh',inputs:{readings:[4,5]}})).outputs,[9]);assert.equal(Core.canon(old),source);assert.deepEqual(Core.encode(old),harmonics);
});

test('refinement obligation stays runtime; pure choose cannot hide eager effects and numeric units stay exact',()=>{
 const base:Intent={format:'qdl-intent',version:1,name:'Shape audit',thought:'Declare numeric result bounds.',inputs:[{id:'a',name:'a',type:{kind:'number',unit:'L'}},{id:'b',name:'b',type:{kind:'number',unit:'L'}}],steps:[{id:'result',op:'arithmetic',inputs:['a','b'],params:{kind:'add'},type:{kind:'number',unit:'L',min:0,max:10}}],outputs:['result']};
 const s=new Session(),a=s.compile(base);assert.equal(first(s.run({artifactId:a.id,requestId:'bounded',inputs:{a:5,b:6}})).diagnostic.code,'refinement');assert.deepEqual(first(s.run({artifactId:a.id,requestId:'inside',inputs:{a:5,b:5}})).outputs,[10]);
 const unlike=structuredClone(base);unlike.inputs[1]!.type={kind:'number',unit:'mL'};assert.throws(()=>s.compile(unlike),QdlError);
 const effect:Intent={format:'qdl-intent',version:1,name:'Eager audit',thought:'Reject an effect-bearing branch.',inputs:[{id:'yes',value:true,type:{kind:'boolean'}},{id:'text',value:'x',type:{kind:'string'}}],steps:[{id:'effect',op:'action',inputs:['yes','text'],params:{allowed:true,action:'audit'}},{id:'selected',op:'choose',inputs:['yes','effect','effect'],params:{}}],outputs:['selected']};assert.throws(()=>s.compile(effect),QdlError);
});
