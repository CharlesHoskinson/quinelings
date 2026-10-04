'use strict';
const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),L=require('./qdl-v1-library.js'),V=require('./qdl-v1.js'),Q=require('./core.js');
let fixtures=0,recoveries=0,generations=0,refusals=0,failed=0;
A.equal(L.programs.length,10);A.equal(new Set(L.programs.map(p=>p.id)).size,10);A.equal(Object.isFrozen(L.programs),true);
const detached=L.get('water-total');detached.intent.name='changed';detached.fixtures[0].inputs.readings[0]=999;A.equal(L.get('water-total').name,'Water measurement total');A.equal(L.get('water-total').fixtures[0].inputs.readings[0],1.5);
A.throws(()=>L.get('absent-program'),e=>e.code==='unknown-program'&&e.path==='$.id');
const results=[];
for(const entry of L.programs){
 const program=V.compile(entry.intent),admitted=V.admit(program),source=admitted.source;
 A.ok(admitted.ports.length>0,entry.id+' reusable runtime inputs');A.equal(entry.intent.inputs.some(x=>Object.hasOwn(x,'name')),true);A.ok(admitted.payload.thought.observations.length>0);A.ok(admitted.payload.thought.plans.length>0);
 A.ok(new TextEncoder().encode(source).length<=65536);A.ok(admitted.payload.design.anatomy,entry.id+' generated anatomy');
 for(const goal of admitted.payload.thought.goals){A.ok(admitted.payload.task.outputs.includes(goal.completion));A.equal(admitted.payload.task.nodes.find(n=>n.id===goal.completion).type.kind,'boolean');}
 // Inference-heavy three-input evidenceFresh graph previously overflowed a
 // trunk's four-child anatomy limit. Compile without an explicit-design bypass.
 if(entry.id==='evidence-ledger')A.equal(Object.hasOwn(entry.intent,'design'),false);
 let generation=program;
 for(let i=0;i<3;i++){const proof=V.verifyQuine(generation);A.equal(proof.source,source);generation=JSON.parse(proof.source);A.equal(V.admit(generation).source,source);generations++;}
 for(const recovered of [Q.decode(Q.encode(program)),Q.decodeColors(Q.encodeColors(program))]){const r=V.admit(recovered);A.equal(r.source,source);A.deepEqual(r.payload.thought,admitted.payload.thought);A.deepEqual(r.payload.task,admitted.payload.task);recoveries++;}
 const successful=[];
 for(const fixture of entry.fixtures){fixtures++;if(fixture.expectedStatus==='refused'){A.throws(()=>V.execute(program,fixture.inputs),e=>e.code===fixture.expectedDiagnostic,entry.id+': '+fixture.name);refusals++;continue;}
  const result=V.execute(program,fixture.inputs);A.equal(result.status,fixture.expectedStatus??'completed',entry.id+': '+fixture.name);A.equal(result.sourceHash,admitted.sourceHash);A.equal(result.emitted[0],source);
  const occurrence=result.occurrences.at(-1);
  if(fixture.expectedStatus==='failed'){A.equal(occurrence.diagnostic.code,fixture.expectedDiagnostic,entry.id+': '+fixture.name);A.deepEqual(occurrence.outputs,[]);A.deepEqual(occurrence.effects,[]);A.ok(occurrence.trace.length>0);failed++;}
  else {A.deepEqual(occurrence.outputs,fixture.expectedOutputs,entry.id+': '+fixture.name);A.equal(occurrence.diagnostic,null);A.equal(occurrence.trace.length,admitted.payload.task.nodes.length);successful.push(result);}
  A.equal(Q.canon(program),source,entry.id+' source remains unchanged');
 }
 A.ok(successful.length>=2,entry.id+' multiple snapshots');const distinct=successful.find(r=>r.inputHash!==successful[0].inputHash&&Q.canon(r.occurrences[0].outputs)!==Q.canon(successful[0].occurrences[0].outputs));A.ok(distinct,entry.id+' different inputs yield different outputs');A.equal(distinct.sourceHash,successful[0].sourceHash);A.equal(distinct.emitted[0],successful[0].emitted[0]);
 // Public core dispatch must route through the same source-preserving v1 path.
 const coreRun=Q.execute(program,{bindings:entry.fixtures[0].inputs});A.deepEqual(coreRun.occurrences[0].outputs,entry.fixtures[0].expectedOutputs);
 results.push({id:entry.id,nodes:admitted.payload.task.nodes.length,sourceBytes:new TextEncoder().encode(source).length,fixtures:entry.fixtures.length});
}
A.ok(fixtures>=24);
const water=V.compile(L.get('water-total').intent);
A.throws(()=>V.execute(water,{readings:[],extra:1}),e=>e.code==='unknown-field');
const sampleGenome=Q.fromSamples(Q.samples(Q.encode(water)));A.equal(V.admit(Q.decode(sampleGenome)).source,V.admit(water).source);recoveries++;
const craft=V.compile(L.get('craft-quote').intent);A.throws(()=>V.execute(craft,{inventory:[{id:'ore',amount:3},{id:'ore',amount:4}],requested:1,freeCapacity:10}),e=>e.code==='refinement');
const context=vm.createContext({});vm.runInContext(fs.readFileSync(require.resolve('./qdl-v1-library.js'),'utf8'),context);A.equal(vm.runInContext('QDLV1Library.programs.length',context),10);A.equal(vm.runInContext('QDLV1Library.get("water-total").intent.format',context),'qdl-intent');
console.log(JSON.stringify({library:'QDL v1 synthetic agent-task recipes',programs:results,fixtures,refusals,failedEvaluations:failed,freshGenerations:generations,genomeRecoveries:recoveries,node:process.version,claims:'Local deterministic supplied snapshots and simulated proposals; no live City compatibility or world dispatch.'},null,2));
