import test, {before, after, type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {Session, QdlError, FrameSchema} from '../src/v1.js';
import type {Intent, Frame, FrameOptions, Snapshot} from '../src/v1.js';
// @ts-expect-error shared assembly compiler has no declarations
import A from '../../../anatomy.js';
// @ts-expect-error shared interpreter has no declarations
import V from '../../../qdl-v1.js';
// @ts-expect-error shared design constructor has no declarations
import D from '../../../qdl.js';

// Selected real-implementation projections, not a universal refinement proof.
// The model's source tokens map to actual admitted sources; compiler spies expose
// misses/evictions without adding production cache introspection. Full frame
// equality and caller alias checks deliberately go beyond symbolic model values.
const ROOT=fileURLToPath(new URL('../../../',import.meta.url));
const names=Array.from(readFileSync(join(ROOT,'spec/v1-frame_test.qnt'),'utf8')
  .matchAll(/\brun\s+(\w+Test)\s*=/g),m=>m[1]!);
type Variant<T=unknown>={tag:string;value:T};
type ModelRequest={artifact:number;phase:number;budget:number;crests:number;shape:Variant};
type Key={artifact:number;phase:number;budget:number;crests:number};
type ModelFrame={key:Key;points:number;normals:number;owners:number;ridges:number;mutation:number};
type ModelState={cache:number[];compilations:number;evaluations:number;records:number;receipts:number};
type TraceState={s:ModelState;audit:{before:ModelState;beforeOriginals:ModelFrame[];beforeCopies:ModelFrame[];
  originals:ModelFrame[];copies:ModelFrame[];command:Variant<ModelRequest|number>;outcome:Variant}};
let directory:string;
let fixture:Snapshot;
const ids=new Map<number,string>();
const traces=new Map<string,TraceState[]>();
function decode(value:any):any {
  if(value===null||typeof value!=='object')return value;
  if(Object.hasOwn(value,'#bigint')){const n=Number(value['#bigint']);assert(Number.isSafeInteger(n));return n;}
  if(Object.hasOwn(value,'#tup'))return value['#tup'].map(decode);
  if(Array.isArray(value))return value.map(decode);
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v)]));
}
async function quint(args:string[]):Promise<void> {
  const result=await new Promise<{code:number|null;output:string}>((resolve,reject)=>{
    const child=spawn(join(ROOT,'node_modules/.bin/quint'),args,{cwd:ROOT,stdio:['ignore','pipe','pipe']});
    let output='';const timeout=setTimeout(()=>{child.kill();reject(new Error('Quint trace generation timed out'));},60000);
    child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{output+=data;});
    child.on('error',error=>{clearTimeout(timeout);reject(error);});
    child.on('close',code=>{clearTimeout(timeout);resolve({code,output});});
  });
  assert.equal(result.code,0,result.output);
}
function readTrace(file:string):TraceState[] {
  const raw=JSON.parse(readFileSync(join(directory,file),'utf8'));
  assert.deepEqual(raw.vars.slice().sort(),['audit','s']);assert(raw.states.length>1,'Empty Quint trace');
  return raw.states.map((state:any,index:number)=>{assert.equal(state['#meta'].index,index);return decode(state);});
}
const intent=(token:number):Intent=>({format:'qdl-intent',version:1,name:'Frame model source '+token,
  thought:'Total supplied finite quantities.',inputs:[{id:'samples',name:'samples',type:{kind:'array',
    element:{kind:'number',unit:'item',integer:true,min:0}}}],
  steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
before(async()=>{
  directory=mkdtempSync(join(ROOT,'.v1-frame-traces-'));
  assert.equal(new Set(names).size,names.length);assert(names.length>0);
  await quint(['test','spec/v1-frame_test.qnt','--main=v1FrameTest','--max-samples=1','--seed=20261004',
    '--backend=typescript','--out-itf='+join(directory,'{test}_{seq}.itf.json'),'--verbosity=0']);
  for(const name of names){
    const files=readdirSync(directory).filter(f=>f.startsWith(name+'_')&&f.endsWith('.itf.json'));
    assert.equal(files.length,1,'Missing/ambiguous executed Quint scenario '+name);traces.set(name,readTrace(files[0]!));
  }
  assert.equal(readdirSync(directory).filter(f=>f.endsWith('.itf.json')).length,names.length);
  await quint(['run','spec/v1-frame.qnt','--main=v1Frame','--invariant=safety','--max-samples=10',
    '--n-traces=10','--max-steps=30','--seed=20261004','--backend=typescript',
    '--out-itf='+join(directory,'random_{seq}.itf.json'),'--verbosity=0']);
  const files=readdirSync(directory).filter(f=>f.startsWith('random_'));
  assert.equal(files.length,10);for(const file of files)traces.set(file,readTrace(file));
  const session=new Session();
  for(let token=1;token<=34;token++){
    const artifact=session.compile(token===34?{...intent(token),design:D.create()}:intent(token));
    ids.set(token,artifact.id);
  }
  assert.equal(new Set(ids.values()).size,34,'Source tokens must have distinct identities');
  session.run({artifactId:ids.get(1)!,requestId:'preexisting-history',inputs:{samples:[2,3]}});
  fixture=session.exportSnapshot();
});
after(()=>{if(directory)rmSync(directory,{recursive:true,force:true});});
const errorCodes:Record<string,string>={InvalidInput:'invalid-input',UnknownArtifact:'unknown-artifact',
  UnsupportedFrame:'unsupported-frame',SampleFailed:'sample-failed'};
function argumentsFor(r:ModelRequest):[string,number,FrameOptions] {
  let phase=r.phase;let options:FrameOptions={budget:r.budget,crests:r.crests as FrameOptions['crests']};
  switch(r.shape.tag){
    case 'Normal':break;
    case 'Defaults':options={};break;
    case 'FractionalBudget':options.budget=r.budget+0.5;break;
    case 'FractionalCrests':options.crests=(r.crests+0.5) as FrameOptions['crests'];break;
    case 'NonfinitePhase':phase=r.phase===0?NaN:r.phase>0?Infinity:-Infinity;break;
    case 'ExtraOption':options={...options,reuse:true} as FrameOptions;break;
    default:assert.fail('Unknown model input shape '+r.shape.tag);
  }
  return [ids.get(r.artifact)??'ql_'+'0'.repeat(64),phase,options];
}
function mutateFrame(frame:Frame):void {
  frame.points[0]=999;frame.normals[0]=999;frame.owners[0]=999;
  frame.ridges[0]!.line[0]!.x=999;frame.ridges[0]!.line[0]!.nx=999;
  frame.ridges[0]!.primary=!frame.ridges[0]!.primary;
  frame.nodeIds[0]='mutated';frame.nodeColors[0]='#000000';frame.nodeRoles[0]='action';
}
function replay(t:TestContext,states:TraceState[]):void {
  const session=Session.fromSnapshot(fixture),baseline=session.exportSnapshot();
  const actualCompile=A.compile;
  const compile=t.mock.method(A,'compile',(...args:unknown[])=>actualCompile(...args));
  const execution=t.mock.method(V,'execute',()=>{assert.fail('Session.frame evaluated a task');});
  const copies:Frame[]=[],expectedCopies:Frame[]=[],originals:Frame[]=[];
  const seen=new Map<string,Frame>();
  let compared=0;
  try{
    for(const [index,state] of states.entries()){
      const {audit,s}=state;
      if(index>0){
        assert.deepEqual(audit.before,states[index-1]!.s,'Model transition predecessor');
        const {tag,value}=audit.command;
        if(tag==='Mutate'){
          assert.equal(audit.outcome.tag,'Mutated');const selected=value as number;
          mutateFrame(copies[selected]!);mutateFrame(expectedCopies[selected]!);
        }else{
          assert(tag==='Render'||tag==='FailSample','Unknown model command '+tag);
          const args=argumentsFor(value as ModelRequest);
          let failure:ReturnType<typeof t.mock.method>|undefined;
          if(tag==='FailSample')failure=t.mock.method(A,'frame',()=>{throw new QdlError('sample-failed','Simulated sampler failure');});
          try{
            if(audit.outcome.tag==='Rendered'){
              // Alternate public entry paths while replaying the same model call.
              const frame=index%2?session.frame(...args):session.dispatch({operation:'frame',artifactId:args[0],phase:args[1],options:args[2]});
              assert(FrameSchema.safeParse(frame).success);
              const projected=audit.originals.at(-1)!;
              assert.deepEqual([frame.points.length,frame.normals.length,frame.owners.length,frame.ridges.length],
                [projected.points,projected.normals,projected.owners,projected.ridges]);
              const key=JSON.stringify(projected.key),prior=seen.get(key);
              if(prior)assert.deepEqual(frame,prior,'Identical source/phase/options changed full frame bytes');
              else seen.set(key,structuredClone(frame));
              const artifact=session.inspect(args[0]);assert.equal(artifact.id,artifact.sourceHash);
              assert.deepEqual(frame.nodeIds,artifact.payload.task.nodes.map(n=>n.id));
              assert.notEqual(frame.points,frame.normals);assert.notEqual(frame.nodeIds,frame.nodeColors);
              originals.push(structuredClone(frame));copies.push(frame);expectedCopies.push(structuredClone(frame));
            }else{
              const code=errorCodes[audit.outcome.tag];assert(code,'Unknown model refusal '+audit.outcome.tag);
              assert.throws(()=>session.frame(...args),e=>e instanceof QdlError&&e.code===code);
            }
          }finally{failure?.mock.restore();}
        }
      }else{
        assert.equal(audit.command.tag,'Start');assert.equal(audit.outcome.tag,'Initial');
      }
      assert.equal(compile.mock.calls.length,s.compilations,'Body misses/evictions differ from Quint');
      assert.equal(execution.mock.calls.length,s.evaluations);
      const snapshot=session.exportSnapshot();assert.deepEqual(snapshot,baseline,'Frame mutated retained source/history');
      assert.equal(snapshot.records.length,s.records);assert.equal(snapshot.receipts.length,s.receipts);
      assert.equal(copies.length,audit.copies.length);assert.equal(originals.length,audit.originals.length);
      assert.deepEqual(copies,expectedCopies,'Caller mutation leaked into another returned frame');
      for(const [i,original] of originals.entries()){
        const projected=audit.originals[i]!;
        assert.equal(projected.mutation,0);
        assert.deepEqual(original,seen.get(JSON.stringify(projected.key)),'Canonical baseline changed');
      }
      compared++;
    }
    t.diagnostic('Replayed '+compared+' actual Quint states against Session');
  }finally{compile.mock.restore();execution.mock.restore();}
}
for(const name of names)test('Session frame matches Quint '+name,t=>{replay(t,traces.get(name)!);});
test('Session frame matches ten seeded random Quint traces',t=>{
  const selected=[...traces.entries()].filter(([name])=>name.startsWith('random_'));
  assert.equal(selected.length,10);for(const [,states] of selected)replay(t,states);
});
