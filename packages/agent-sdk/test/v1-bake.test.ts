import test from 'node:test';
import assert from 'node:assert/strict';
import {Session,QdlError,BakeOptionsSchema,BAKE_FLOOR} from '../src/v1.js';
import type {Intent,Bake} from '../src/v1.js';
import {selection,reservedCount,FRAME_FLOOR} from '../src/v1-bake.js';
// @ts-expect-error shared interpreter is JavaScript
import V from '../../../qdl-v1.js';
// @ts-expect-error shared assembly sampler is JavaScript
import A from '../../../anatomy.js';
// @ts-expect-error shared library is JavaScript
import L from '../../../qdl-v1-library.js';
const fixture=():Intent=>({format:'qdl-intent',version:1,name:'Measured total',thought:'Sum the supplied measurements.',inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'item',min:0,integer:true},maxLength:512}}],steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
const error=(code:string)=>(e:unknown)=>e instanceof QdlError&&e.code===code;
function countExecutions(fn:(count:()=>number)=>void){const original=V.execute;let calls=0;V.execute=(...args:unknown[])=>{calls++;return original(...args);};try{fn(()=>calls);}finally{V.execute=original;}}
const library=():Intent[]=>L.programs.map((p:{intent:Intent})=>p.intent);

test('bake is deterministic, detached and passive (spec v1-bake.qnt: passive, onlyRunEvaluates)',()=>{
 countExecutions(calls=>{
  const session=new Session(),artifact=session.compile(fixture()),before=session.exportSnapshot();
  const first=session.bake(artifact.id),second=session.bake(artifact.id,{frames:24,budget:1500,crests:3,quantize:'float32'});
  assert.deepEqual(first,second);assert.equal(first.sourceHash,artifact.id);assert.equal(first.format,'qdl-bake');
  assert.equal(first.positions.length,24);assert.equal(first.positions[0]!.length,3*1500);assert.equal(first.owners.length,1500);
  assert.equal(first.anchors[0]!.length,3*first.nodeIds.length);assert.equal(first.ridges[0]!.length,3);assert.equal(first.ridges[0]![0]!.length,3*301);
  assert.deepEqual(first.nodeIds,artifact.payload.task.nodes.map(n=>n.id));assert.equal(first.nodeColors.length,first.nodeIds.length);assert.equal(first.nodeRoles.length,first.nodeIds.length);
  first.positions[0]![0]=7;first.owners[0]=63;first.nodeIds.length=0;first.bounds.center[0]=99;
  assert.deepEqual(session.bake(artifact.id),second);
  assert.deepEqual(session.exportSnapshot(),before);assert.equal(calls(),0);
 });
});

test('bake at the 512 floor keeps every node visible and coordinates inside the normalized box',()=>{
 const session=new Session(),intents=[fixture(),...library()];assert.equal(intents.length,11);
 for(const intent of intents){
  const artifact=session.compile(intent),baked:Bake=session.bake(artifact.id,{frames:4,budget:BAKE_FLOOR,quantize:'int16'});
  assert.equal(baked.owners.length,512);assert.equal(baked.quantScale,32767);
  assert.deepEqual(new Set(baked.owners),new Set(baked.nodeIds.map((_,i)=>i)),'every task node owns a sample');
  for(const buffers of [baked.positions,baked.anchors,...baked.ridges])for(const b of buffers){assert(b instanceof Int16Array);for(const v of b)assert(v>=-32767&&v<=32767);}
  const f32=session.bake(artifact.id,{frames:4,budget:BAKE_FLOOR});
  for(let k=0;k<4;k++)for(let i=0;i<f32.positions[k]!.length;i++){const v=f32.positions[k]![i]!;assert(Math.abs(v)<=1);assert(Math.abs(v-baked.positions[k]![i]!/32767)<=1/32767+1e-6);}
 }
});

test('bake agrees with frame on the shared domain and subsamples it below the sampler floor',()=>{
 const session=new Session(),artifact=session.compile(fixture());
 const full=session.bake(artifact.id,{frames:3,budget:4000,crests:2}),low=session.bake(artifact.id,{frames:3,budget:900,crests:2});
 const {center,scale}=full.bounds;
 const body=A.compile(artifact.payload.design.anatomy,artifact.payload.task.nodes,artifact.payload.design.motion.gesture),reserved=reservedCount(body.parts),indices=selection(reserved,900);
 for(let k=0;k<3;k++){
  const frame=session.frame(artifact.id,full.phases[k]!,{budget:4000,crests:2});assert.deepEqual(Array.from(full.owners),frame.owners);
  for(let j=0;j<4000;j++)for(let a=0;a<3;a++)assert(Math.abs(full.positions[k]![3*j+a]!*scale+center[a]!-frame.points[4*j+a]!)<1e-5);
  for(let j=0;j<900;j++){const i=indices[j]!;assert.equal(low.owners[j],frame.owners[i]);for(let a=0;a<3;a++)assert.equal(low.positions[k]![3*j+a],full.positions[k]![3*i+a]);}
 }
 assert.deepEqual(low.anchors,full.anchors);assert.deepEqual(low.ridges,full.ridges);
});

test('selection matches the Quint scenario and keeps the reserved prefix (spec: bakeSound)',()=>{
 assert.deepEqual(Array.from(selection(8,11,16)),[0,1,2,3,4,5,6,7,8,10,13]);assert.deepEqual(Array.from(selection(8,8,16)),[0,1,2,3,4,5,6,7]);
 assert.deepEqual(Array.from(selection(8,18,16)),Array.from({length:18},(_,i)=>i));
 for(const reserved of [1,45,160])for(const budget of [512,777,3999]){const s=selection(reserved,budget);assert.equal(s.length,budget);for(let i=0;i<reserved;i++)assert.equal(s[i],i);for(let i=1;i<budget;i++)assert(s[i-1]!<s[i]!);assert(s[budget-1]!<FRAME_FLOOR);}
 // Worst admissible anatomy: 16 components and 128 owner regions reserve 160 samples.
 const graph={nodes:Array.from({length:64},(_,i)=>({id:'n'+i,inputs:[]}))},parts=[];
 for(let i=0;i<16;i++)parts.push({id:'p'+i,kind:'spine',length:.2,radii:[.04,.02],bend:[.1,.05],parent:i?{component:'p'+Math.floor((i-1)/4),socket:{u:.3+.1*(i%4),v:(i%4)/4},angle:(i%4-1.5)*.5,hinge:.04}:null});
 const owners=parts.flatMap((p,i)=>Array.from({length:8},(_,j)=>({node:'n'+((i*8+j)%64),component:p.id,u:[j/8,(j+1)/8]})));
 const body=A.compile({model:'assembly',compiler:A.COMPILER,seed:1,components:parts,owners},graph.nodes,{kind:'unfurl',strength:1,ticks:[100,100,700,100]});
 assert.equal(reservedCount(body.parts),160);assert(160<=BAKE_FLOOR);
 const frame=A.frame(body,2,{budget:FRAME_FLOOR,crests:2}),picked=Array.from(selection(160,BAKE_FLOOR),i=>frame.owners[i]);assert.equal(new Set(picked).size,64);
});

test('bake refuses malformed, oversized and unsupported requests without state change',async()=>{
 // @ts-expect-error shared source design has no declarations
 const {default:D}=await import('../../../qdl.js');
 countExecutions(calls=>{
  const session=new Session(),artifact=session.compile(fixture()),custom=session.compile({...fixture(),name:'Custom body',design:D.create()}),before=session.exportSnapshot();
  for(const options of [{budget:511},{budget:24001},{budget:600.5},{frames:0},{frames:241},{crests:1},{crests:5},{quantize:'int8'},{reuse:true}])assert.throws(()=>session.bake(artifact.id,options as any),error('invalid-input'));
  assert.throws(()=>session.bake(artifact.id,{frames:240,budget:24000}),error('resource-limit'));
  assert.throws(()=>session.bake('ql_'+'0'.repeat(64)),error('unknown-artifact'));
  assert.throws(()=>session.bake(custom.id),error('unsupported-frame'));
  assert(BakeOptionsSchema.safeParse({budget:512}).success&&!BakeOptionsSchema.safeParse({budget:4000.5}).success);
  assert.deepEqual(session.exportSnapshot(),before);assert.equal(calls(),0);
 });
});

test('traceOwners maps each retained trace step to its node owner without evaluation (spec: traceSound)',()=>{
 const session=new Session();
 for(const program of L.programs as {id:string;intent:Intent;fixtures:{inputs:Record<string,never>}[]}[]){
  const artifact=session.compile(program.intent),record=session.run({artifactId:artifact.id,requestId:'trace-'+program.id,inputs:program.fixtures[0]!.inputs});
  countExecutions(calls=>{
   const before=session.exportSnapshot(),mapped=session.traceOwners(record.id);
   assert.equal(mapped.sourceHash,artifact.id);assert.equal(mapped.occurrences.length,record.result.occurrences.length);
   mapped.occurrences.forEach((o,k)=>{const trace=record.result.occurrences[k]!.trace;assert.equal(o.owners.length,trace.length);o.owners.forEach((owner,i)=>assert.equal(mapped.nodeIds[owner],trace[i]!.nodeId));});
   assert.deepEqual(session.exportSnapshot(),before);assert.equal(calls(),0);
  });
 }
 assert.throws(()=>session.traceOwners('run_00000000-0000-0000-0000-000000000000'),error('unknown-record'));
 assert.throws(()=>session.traceOwners('nope'),error('invalid-input'));
});
