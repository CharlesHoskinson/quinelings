import test, {before, after, type TestContext} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, readdirSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {Session, QdlError} from '../src/v1.js';
import type {Intent, Json, RunInput} from '../src/v1.js';
// @ts-expect-error shared interpreter has no declarations
import V from '../../../qdl-v1.js';
// @ts-expect-error actual shipped recipe library has no declarations
import Library from '../../../qdl-v1-library.js';

// Selected IMPLEMENTATION projections against actually executed Quint traces.
// Session has no world revision, CAS, public stage/preflight or durable driver.
// Request tokens compare equality within a key; response tokens map to sum output.
// UUIDs, bytes, source parsing, adapter transport and imported evidence are not
// represented in Quint. This suite makes no universal refinement claim.
const ROOT=fileURLToPath(new URL('../../../',import.meta.url));
const names=[
  'lost_response_replayTest','changed_payload_conflictTest','ledger_full_refusalTest',
  'full_ledger_retains_replayTest','preflight_failureTest','oversized_responseTest',
  'pending_blocks_retryTest','unknown_blocks_retryTest','unknown_resolvesTest',
  'terminal_reobservation_onceTest','separate_attempts_countTest',
  'terminal_regression_refusesTest','changed_terminal_units_refusesTest',
  'equal_sequence_conflictTest','partial_confirmed_unknownTest','stale_observation_refusesTest'
];
type Observation={sequence:number;status:'pending'|'unknown'|'confirmed'|'failed';units:number};
type ModelState={world:number;revision:number;commits:number;receipts:Map<number,{request:number;response:number;revision:number}>;
  observations:Map<number,Observation>;submissions:number};
type ModelSnapshot={s:ModelState;before:ModelState;last:string;returned:number};
const traces=new Map<string,ModelSnapshot[]>();
let directory:string|undefined;
function decode(value:any):any {
  if(value===null||typeof value!=='object')return value;
  if(Object.hasOwn(value,'#bigint')){const n=Number(value['#bigint']);assert(Number.isSafeInteger(n));return n;}
  if(Object.hasOwn(value,'#map'))return new Map(value['#map'].map(([k,v]:[unknown,unknown])=>[decode(k),decode(v)]));
  if(Array.isArray(value))return value.map(decode);
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v)]));
}
before(()=>{
  directory=mkdtempSync(join(tmpdir(),'qdl-v1-actual-session-'));
  const result=spawnSync(join(ROOT,'node_modules/.bin/quint'),[
    'test','spec/v1-session.qnt','--match=^('+names.join('|')+')$',
    '--max-samples=1','--seed=20261004','--backend=typescript',
    '--out-itf='+join(directory,'{test}_{seq}.itf.json'),'--verbosity=0'
  ],{cwd:ROOT,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024});
  if(result.error||result.status!==0){rmSync(directory,{recursive:true,force:true});directory=undefined;}
  assert.equal(result.error,undefined,String(result.error));
  assert.equal(result.status,0,result.stderr||result.stdout);
  for(const name of names){
    const files=readdirSync(directory!).filter(f=>f.startsWith(name+'_')&&f.endsWith('.itf.json'));
    assert.equal(files.length,1,'Actual Quint trace absent or ambiguous: '+name);
    const states=JSON.parse(readFileSync(join(directory!,files[0]!), 'utf8')).states;
    for(const [index,state] of states.entries())assert.equal(state['#meta'].index,index);
    traces.set(name,states.map(decode));
  }
  assert.equal(readdirSync(directory!).filter(f=>f.endsWith('.itf.json')).length,names.length);
});
after(()=>{if(directory)rmSync(directory,{recursive:true,force:true});});
const trace=(name:string)=>{const values=traces.get(name);assert(values,'Missing executed trace '+name);return values;};
const last=(name:string)=>trace(name).at(-1)!;
const qdlError=(code:string)=>(error:unknown)=>error instanceof QdlError&&error.code===code;
const total=():Intent=>({format:'qdl-intent',version:1,name:'Session model total',thought:'Total supplied finite quantities.',
  inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'item',integer:true,min:0}}}],
  steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
const request=(artifactId:string,key:number,token=1):RunInput=>({artifactId,requestId:'key-'+key,
  inputs:{samples:token===2?[8]:key===2?[2,4]:[2,3]}});
function spy(t:TestContext){const original=V.execute;return t.mock.method(V,'execute',(...args:unknown[])=>original(...args));}
function projection(session:Session,model:ModelState):void {
  const snapshot=session.exportSnapshot();
  assert.equal(snapshot.records.length,model.commits);
  assert.equal(snapshot.receipts.length,model.receipts.size);
  const records=new Map(snapshot.records.map(r=>[r.id,r]));
  for(const [key,receipt] of model.receipts){
    const retained=snapshot.receipts.find(r=>r.request.requestId==='key-'+key);assert(retained);
    assert.equal(retained.request.operation,'run');
    const record=records.get(retained.recordId);assert(record);
    assert.deepEqual(record.result.occurrences[0]!.outputs,[receipt.response]);
    assert.equal(record.result.status,'completed');
    if(retained.request.operation==='run')assert.deepEqual(retained.request.inputs,request(record.artifactId,key,receipt.request).inputs);
  }
}

test('actual Session lost-reply replay and conflict match executed model ledger projections',t=>{
  const execution=spy(t),session=new Session({maxRecords:2}),artifact=session.compile(total());
  const replayTrace=trace('lost_response_replayTest');
  projection(session,replayTrace[0]!.s);
  const issued=request(artifact.id,1),record=session.run(issued);
  projection(session,replayTrace.find(s=>s.last==='commit')!.s);
  const committed=session.exportSnapshot();
  // Drop the returned object as if delivery were lost; passivity is an inspect/verify,
  // not a claimed transport fault or rollback. The next request is byte-equivalent.
  session.inspect(artifact.id);session.verify(artifact.id);
  const replay=session.run(structuredClone(issued));
  assert.deepEqual(replay,record);assert.deepEqual(session.exportSnapshot(),committed);
  assert.equal(execution.mock.calls.length,1);projection(session,last('lost_response_replayTest').s);
  assert.equal(last('lost_response_replayTest').returned,replay.result.occurrences[0]!.outputs[0]);
  assert.throws(()=>session.run(request(artifact.id,1,2)),qdlError('request-conflict'));
  assert.equal(last('changed_payload_conflictTest').last,'conflict');
  projection(session,last('changed_payload_conflictTest').s);
  assert.deepEqual(session.exportSnapshot(),committed);assert.equal(execution.mock.calls.length,1);
  replay.result.bindings.samples=[99];
  assert.deepEqual(session.run(issued),record,'Replay returned a mutable alias into stored evidence');
});

test('actual full ledger refuses fresh execution and retains exact replay',t=>{
  const execution=spy(t),session=new Session({maxRecords:2}),artifact=session.compile(total());
  const first=session.run(request(artifact.id,1));session.run(request(artifact.id,2));
  const snapshot=session.exportSnapshot();
  assert.throws(()=>session.run(request(artifact.id,3)),qdlError('resource-limit'));
  projection(session,last('ledger_full_refusalTest').s);
  assert.deepEqual(session.exportSnapshot(),snapshot);assert.equal(execution.mock.calls.length,2);
  assert.deepEqual(session.run(request(artifact.id,1)),first);
  projection(session,last('full_ledger_retains_replayTest').s);
  assert.equal(execution.mock.calls.length,2);
});

test('actual input and post-evaluation byte preflight refusals preserve the complete session',t=>{
  const execution=spy(t),invalid=new Session(),artifact=invalid.compile(total()),before=invalid.exportSnapshot();
  assert.throws(()=>invalid.run({...request(artifact.id,1),inputs:{samples:['bad']}}),QdlError);
  assert.equal(last('preflight_failureTest').last,'refuse');
  projection(invalid,last('preflight_failureTest').s);assert.deepEqual(invalid.exportSnapshot(),before);
  assert.equal(execution.mock.calls.length,1,'Binding rejection occurs inside actual interpreter preflight');
  // More demanding than an input refusal: evaluation finishes but the proposed
  // record cannot fit. No record or replay key may leak from the staging boundary.
  const tiny=new Session({maxRecordBytes:64}),a=tiny.compile(total()),snapshot=tiny.exportSnapshot();
  assert.throws(()=>tiny.run(request(a.id,1)),qdlError('resource-limit'));
  projection(tiny,last('oversized_responseTest').s);assert.deepEqual(tiny.exportSnapshot(),snapshot);
  assert.equal(execution.mock.calls.length,2);
  assert.throws(()=>tiny.run(request(a.id,1)),qdlError('resource-limit'));
  assert.equal(execution.mock.calls.length,3,'Refused key was never committed/replayed');
  assert.deepEqual(tiny.exportSnapshot(),snapshot);
});

test('actual restore is passive and its replayed history stays asserted',t=>{
  const execution=spy(t),session=new Session({maxRecords:2}),artifact=session.compile(total());
  session.run(request(artifact.id,1));session.run(request(artifact.id,2));
  const exported=session.exportSnapshot(),restored=Session.fromSnapshot(exported,{maxRecords:2});
  assert.equal(execution.mock.calls.length,2,'Restore executed supplied task history');
  projection(restored,last('full_ledger_retains_replayTest').s);
  assert.equal(restored.inspect(artifact.id).source,artifact.source);
  const replay=restored.run(request(artifact.id,1));assert.equal(replay.evidence,'asserted');
  assert(restored.exportSnapshot().records.every(r=>r.evidence==='asserted'));
  assert.throws(()=>restored.run(request(artifact.id,3)),qdlError('resource-limit'));
  assert.equal(execution.mock.calls.length,2);
  // Imported computation is a claim: a well-shaped changed output is admitted as
  // asserted, but cannot pass an explicit fresh reproduction check.
  const fabricated=structuredClone(exported);fabricated.records[0]!.result.occurrences[0]!.outputs=[999];
  const claimed=Session.fromSnapshot(fabricated,{maxRecords:3});
  assert.equal(execution.mock.calls.length,2);
  assert.equal(claimed.run(request(artifact.id,1)).evidence,'asserted');
  assert.throws(()=>claimed.reproduce({artifactId:artifact.id,recordId:replay.id,requestId:'verify-claim'}),qdlError('stale-record'));
  assert.equal(claimed.exportSnapshot().records.length,2);assert.equal(execution.mock.calls.length,3);
  assert.deepEqual(session.exportSnapshot(),exported,'Restoration changed the original session');
});

type Receipt=Observation&{id:string;operation:string;attempt:string};
type Assessment={state:string;confirmedUnits:number;confirmedAttempts:number;failedAttempts:number;
  pendingAttempts:number;unknownAttempts:number;attempts:number;mayRetry:boolean};
const policy={operation:'craft',requested:3,maxAttempts:4};
function recipeSession(){
  const session=new Session();
  const artifact=session.compile(Library.get('receipt-reconciliation').intent as Intent);
  return {session,artifact};
}
function assess(session:Session,artifactId:string,receipts:Receipt[],key:string,selected=policy){
  const record=session.run({artifactId,requestId:key,inputs:{receipts:receipts as unknown as Json,policy:selected}});
  if(record.result.status==='failed')return {record,assessment:undefined};
  assert.equal(record.result.occurrences.length,1);
  assert.deepEqual(record.result.occurrences[0]!.effects,[]);
  return {record,assessment:record.result.occurrences[0]!.outputs[0] as unknown as Assessment};
}
function history(states:ModelSnapshot[],until:number):Receipt[]{
  const receipts:Receipt[]=[];
  for(let index=1;index<=until;index++){
    const state=states[index]!;
    if(state.last!=='observe')continue;
    for(const [attempt,o] of state.s.observations){
      if(JSON.stringify(o)===JSON.stringify(state.before.observations.get(attempt)))continue;
      receipts.push({...o,id:'read-'+index+'-'+attempt,operation:'craft',attempt:'attempt-'+attempt});
    }
  }
  return receipts;
}
function observationProjection(assessment:Assessment,model:ModelState){
  const values=[...model.observations.values()];
  const units=values.reduce((n,o)=>n+(o.status==='confirmed'?o.units:0),0);
  assert.equal(assessment.confirmedUnits,units);
  assert.equal(assessment.attempts,model.observations.size);
  for(const [status,key] of [['confirmed','confirmedAttempts'],['failed','failedAttempts'],['pending','pendingAttempts'],['unknown','unknownAttempts']] as const)
    assert.equal(assessment[key],values.filter(o=>o.status===status).length);
  // Alignment deliberately selects requested=3,maxAttempts=4: these model
  // traces neither complete that request nor exhaust its retry budget. Quint
  // mayRetry only blocks unresolved attempts; the actual recipe also gates budget.
  assert.equal(assessment.mayRetry,!values.some(o=>o.status==='pending'||o.status==='unknown'));
  const expectedState=values.some(o=>o.status==='unknown')?'unknown':values.some(o=>o.status==='pending')?'pending':
    units>=policy.requested?'completed':values.length>=policy.maxAttempts?'exhausted':values.length===0?'ready':'retryable';
  assert.equal(assessment.state,expectedState);
  assert.equal(model.submissions,0);
}

test('actual reconciliation recipe matches each accepted pending/unknown/terminal trace prefix',()=>{
  const {session,artifact}=recipeSession();
  const cases=['pending_blocks_retryTest','unknown_blocks_retryTest','unknown_resolvesTest',
    'terminal_reobservation_onceTest','separate_attempts_countTest','partial_confirmed_unknownTest'];
  for(const name of cases){
    const states=trace(name);let confirmed=0;
    for(let index=0;index<states.length;index++){
      const receipts=history(states,index),result=assess(session,artifact.id,receipts,name+'-'+index);
      assert(result.assessment);observationProjection(result.assessment,states[index]!.s);
      assert(result.assessment.confirmedUnits>=confirmed);confirmed=result.assessment.confirmedUnits;
      assert.equal(result.record.result.emitted[0],artifact.source);
      assert(result.record.result.occurrences[0]!.trace.every(node=>node.op!=='action'));
    }
  }
});

test('actual recipe terminal regression, changed units and equal-sequence conflicts fail finitely',()=>{
  const {session,artifact}=recipeSession();
  for(const name of ['terminal_regression_refusesTest','changed_terminal_units_refusesTest','equal_sequence_conflictTest']){
    const states=trace(name),model=states.at(-1)!;assert.equal(model.last,'refuse');
    assert.deepEqual(model.s,model.before);
    const receipts=history(states,states.length-2),prior=receipts.at(-1)!;
    const invalid:Receipt={...prior,id:'conflicting-read',sequence:name==='equal_sequence_conflictTest'?1:2,
      status:name==='changed_terminal_units_refusesTest'?'confirmed':name==='equal_sequence_conflictTest'?'unknown':'pending',
      units:name==='changed_terminal_units_refusesTest'?2:0};
    const before=session.exportSnapshot(),issued=[...receipts,invalid],key=name+'-failure';
    const {record,assessment}=assess(session,artifact.id,issued,key);assert.equal(assessment,undefined);
    assert.equal(record.result.status,'failed');const occurrence=record.result.occurrences[0]!;
    assert.equal(occurrence.diagnostic?.code,'receipt-conflict');assert.deepEqual(occurrence.outputs,[]);assert.deepEqual(occurrence.effects,[]);
    // Quint rejects a stateful observation without mutation; Session instead
    // commits a valid failure run. The reducer result publishes no changed total.
    assert.equal(session.exportSnapshot().records.length,before.records.length+1);
    assert.deepEqual(session.run({artifactId:artifact.id,requestId:key,inputs:{receipts:issued as unknown as Json,policy}}),record);
  }
});

test('actual recipe order independence and completion advice expose the documented abstraction differences',()=>{
  const {session,artifact}=recipeSession(),model=last('stale_observation_refusesTest');
  assert.equal(model.last,'refuse');
  // Online model rejects late lower sequence. Complete supplied-history reducer
  // sorts it, preserves the latest unknown and does not treat input order as time.
  const receipts:Receipt[]=[{id:'new',operation:'craft',attempt:'a',sequence:2,status:'unknown',units:0},
    {id:'old',operation:'craft',attempt:'a',sequence:1,status:'pending',units:0}];
  const forward=assess(session,artifact.id,receipts,'unordered'),reverse=assess(session,artifact.id,[...receipts].reverse(),'reversed');
  assert.deepEqual(forward.assessment,reverse.assessment);assert.equal(forward.assessment!.state,'unknown');
  observationProjection(forward.assessment!,model.s);
  const terminalStates=trace('terminal_reobservation_onceTest'),terminalHistory=history(terminalStates,terminalStates.length-1);
  const completed=assess(session,artifact.id,terminalHistory,'completed',{...policy,requested:1});
  assert.equal(completed.assessment!.confirmedUnits,1);assert.equal(completed.assessment!.attempts,1);
  assert.equal(completed.assessment!.state,'completed');assert.equal(completed.assessment!.mayRetry,false);
  assert([...last('terminal_reobservation_onceTest').s.observations.values()].every(o=>o.status!=='pending'&&o.status!=='unknown'));
  const duplicated=assess(session,artifact.id,[...terminalHistory,...terminalHistory],'duplicate-ids',{...policy,requested:1});
  assert.deepEqual(duplicated.assessment,completed.assessment);
  assert.equal(session.describe().effects,'simulation-only');assert.equal(session.describe().persistence,'memory');
});
