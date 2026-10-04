import test from 'node:test';
import assert from 'node:assert/strict';
import {Session,QdlError} from '../src/v1.js';
import {analyze,preview,admit} from '../src/v1-ranch.js';
import type {Candidate,Compatibility} from '../src/v1-ranch.js';
import type {Thought} from '../src/v1-types.js';
// @ts-expect-error executable shared collaboration fixtures are JavaScript
import fixturesModule from '../../../verify-v1-offspring.cjs';
// @ts-expect-error shared interpreter has no declarations
import V from '../../../qdl-v1.js';
// @ts-expect-error source codecs have no declarations
import Q from '../../../core.js';
const {fixtures}=fixturesModule;
function setup(options={}){const f=fixtures(),session=new Session(options),a=session.recover({source:V.admit(f.donor).source}),b=session.recover({source:V.admit(f.recipient).source});return {session,parents:[a.id,b.id] as [string,string],recipe:f.recipe};}
function thought(c:Compatibility,text='Allocate demand from supplied summed measurements.'):Thought {assert.equal(c.status,'compatible');if(c.status!=='compatible')throw Error('Fixture refused');return {observations:[],evidence:[],goals:[],decisions:[],plans:[],tasks:[{id:'combined',text,nodes:c.task.nodes.map(n=>n.id),outputs:c.task.outputs}]};}
function candidate(s:ReturnType<typeof setup>):Candidate{const c=analyze(s.session,{parents:s.parents,recipe:s.recipe}),result=preview(s.session,{parents:s.parents,recipe:s.recipe,nonce:42,name:'Measured collaboration',thought:thought(c)});assert.equal(result.status,'ready',JSON.stringify(result));if(result.status!=='ready')throw Error('Preview refused');return result.candidate;}

test('experimental analyze, preview, source admission and pose sampling remain passive',()=>{
 const s=setup(),before=s.session.exportSnapshot(),original=V.execute;let runs=0;V.execute=(...args:unknown[])=>{runs++;return original(...args);};try{const analyzed=analyze(s.session,{parents:s.parents,recipe:s.recipe});assert.equal(analyzed.status,'compatible');const c=candidate(s);assert.deepEqual(s.session.exportSnapshot(),before);const ack=admit(s.session,c);assert.equal(ack.evidence,'library-source-admitted');assert.equal(ack.artifact.id,c.childSourceHash);assert.equal(s.session.exportSnapshot().artifacts.length,3);assert.deepEqual(s.session.exportSnapshot().records,[]);assert.deepEqual(s.session.exportSnapshot().receipts,[]);assert.equal(s.session.frame(ack.artifact.id,0,{budget:4000,crests:2}).owners.length,4000);assert.equal(runs,0);assert.deepEqual(admit(s.session,c),ack);assert.equal(s.session.exportSnapshot().artifacts.length,3);assert.equal(runs,0);}finally{V.execute=original;}
});

test('admitted source executes causal independent outcomes and fresh input digests',()=>{
 const s=setup(),c=candidate(s),ack=admit(s.session,c),first=s.session.run({artifactId:ack.artifact.id,requestId:'first',inputs:{p0_readings:[2,3,5],p1_desired:7}}),second=s.session.run({artifactId:ack.artifact.id,requestId:'second',inputs:{p0_readings:[1,1,2],p1_desired:7}});
 assert.deepEqual(first.result.occurrences[0]!.outputs,[{allocated:7,remaining:3}]);assert.deepEqual(second.result.occurrences[0]!.outputs,[{allocated:4,remaining:0}]);assert.notEqual(first.result.inputHash,second.result.inputHash);assert.equal(first.result.emitted[0],second.result.emitted[0]);assert.equal(first.artifactId,second.artifactId);assert.equal(first.result.occurrences.length,1);assert.equal(c.changes.taskSyntaxChanged,true);
});

test('source-only three generations and codecs work in sessions containing no parents',()=>{
 const s=setup(),c=candidate(s);let source=c.child.source;
 for(let generation=0;generation<3;generation++){const fresh=new Session(),artifact=fresh.recover({source}),record=fresh.run({artifactId:artifact.id,requestId:'run-'+generation,inputs:{p0_readings:[4,6],p1_desired:8}});assert.deepEqual(record.result.occurrences[0]!.outputs,[{allocated:8,remaining:2}]);assert.equal(record.result.emitted[0],c.child.source);assert.equal(fresh.exportSnapshot().artifacts.length,1);assert.equal(new Session().recover({harmonics:artifact.harmonics}).id,artifact.id);assert.equal(new Session().recover({colors:artifact.colors}).id,artifact.id);source=record.result.emitted[0];assert.equal(artifact.payload.design.heredity?.parents.length,2);}
});

test('reviewed candidate identity binds declarations, nonce and all exact rebuilt fields',()=>{
 const s=setup(),c=candidate(s),before=s.session.exportSnapshot();for(const mutate of [(x:Candidate)=>x.candidateId='qc_'+'0'.repeat(64),(x:Candidate)=>x.child.source='[]',(x:Candidate)=>x.lineage.construction.nonce++,(x:Candidate)=>x.lineage.heredity=null,(x:Candidate)=>x.diagnostics.push({code:'fake',path:'$',message:'changed'}),(x:Candidate)=>(x.lineage.construction as any).parents=null]){const changed=structuredClone(c);mutate(changed);assert.throws(()=>admit(s.session,changed),QdlError);assert.deepEqual(s.session.exportSnapshot(),before);}
 const analyzed=analyze(s.session,{parents:s.parents,recipe:s.recipe}),changed=preview(s.session,{parents:s.parents,recipe:s.recipe,nonce:42,name:'Measured collaboration',thought:thought(analyzed,'Different explicit declaration wording.')});assert.equal(changed.status,'ready');if(changed.status==='ready'){assert.notEqual(changed.candidate.candidateId,c.candidateId);assert.notEqual(changed.candidate.childSourceHash,c.childSourceHash);}
});

test('missing child declarations and typed compatibility refusal are structured, not fabricated',()=>{
 const s=setup(),before=s.session.exportSnapshot(),result=preview(s.session,{parents:s.parents,recipe:s.recipe,nonce:1,name:'Missing declaration'});assert.equal(result.status,'rejected');if(result.status==='rejected')assert.equal(result.diagnostics[0]!.code,'missing-declaration');
 const terminal={kind:'compose' as const,donorOutput:'total',recipientInput:'budget'},refused=analyze(s.session,{parents:s.parents,recipe:terminal});assert.equal(refused.status,'incompatible');if(refused.status==='incompatible')assert.equal(refused.diagnostics[0]!.code,'selector');assert.deepEqual(s.session.exportSnapshot(),before);
 const parent=candidate(s).lineage.construction.parents;assert.equal(parent[0].sourceHash,s.parents[0]);assert.equal(parent[1].sourceHash,s.parents[1]);
});

test('library capacity refusal preserves parents, candidate and all source/run stores',()=>{
 const s=setup({maxArtifacts:2}),c=candidate(s),before=s.session.exportSnapshot();assert.throws(()=>admit(s.session,c),e=>e instanceof QdlError&&e.code==='resource-limit');assert.deepEqual(s.session.exportSnapshot(),before);assert.deepEqual(c,candidate(s));
 const fresh=new Session();assert.throws(()=>admit(fresh,c),e=>e instanceof QdlError&&e.code==='unknown-artifact');assert.deepEqual(fresh.exportSnapshot().artifacts,[]);
});

test('merge and body retain their narrower experimental meanings',()=>{
 const s=setup(),mergeRecipe={kind:'merge' as const},mapping=analyze(s.session,{parents:s.parents,recipe:mergeRecipe}),merged=preview(s.session,{parents:s.parents,recipe:mergeRecipe,nonce:3,name:'Parallel observations',thought:thought(mapping)});assert.equal(merged.status,'ready');if(merged.status!=='ready')return;assert.equal(merged.candidate.classification,'parallel-report');const artifact=admit(s.session,merged.candidate).artifact;assert.deepEqual(s.session.run({artifactId:artifact.id,requestId:'parallel',inputs:{p0_readings:[2,3],p0_spare:4,p1_available:8,p1_desired:6}}).result.occurrences[0]!.outputs,[{a0:5,a1:4,b0:{allocated:6,remaining:2}}]);
 const body=preview(s.session,{parents:s.parents,recipe:{kind:'body',base:0},nonce:3,name:'New body'});assert.equal(body.status,'ready');if(body.status==='ready'){assert.equal(body.candidate.classification,'body-only');assert.deepEqual(body.candidate.child.payload.task,s.session.inspect(s.parents[0]).payload.task);assert.deepEqual(body.candidate.child.payload.thought,s.session.inspect(s.parents[0]).payload.thought);assert.equal(body.candidate.child.payload.repeats,2);assert.equal(body.candidate.changes.taskSyntaxChanged,false);}
});

test('closed collaboration inputs reject unknown fields and getters before reading or storing data',()=>{
 const s=setup(),before=s.session.exportSnapshot();assert.throws(()=>analyze(s.session,{parents:s.parents,recipe:s.recipe,extra:true} as any),QdlError);let reads=0;const hostile=Object.defineProperty({parents:s.parents},'recipe',{enumerable:true,get(){reads++;return s.recipe;}});assert.throws(()=>analyze(s.session,hostile as any),QdlError);assert.equal(reads,0);const c=candidate(s),getter=Object.defineProperty({},'format',{enumerable:true,get(){reads++;return c.format;}});assert.throws(()=>admit(s.session,getter as any),QdlError);assert.equal(reads,0);assert.deepEqual(s.session.exportSnapshot(),before);
});
