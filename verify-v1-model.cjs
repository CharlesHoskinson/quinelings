'use strict';
// Independent JS TOKEN model compared against actual executed Quint traces.
// This imports NO interpreter/SDK code and proves NO production refinement,
// codec correctness, byte preflight, persistence or external exactly-once action.
// Request integers stand for full admitted canonical requests in one owner/session.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const ROOT = __dirname;
const clone = value => structuredClone(value);
const empty = () => ({world:0, revision:0, commits:0, receipts:{}, observations:{}, submissions:0});
const noDraft = () => ({key:0, request:0, expected:0, world:0, response:0, valid:false, checked:false});
const initial = () => ({s:empty(), before:empty(), pending:noDraft(), priorPending:noDraft(), last:'init', returned:0});
const terminal = o => o.status === 'confirmed' || o.status === 'failed';
const confirmedUnits = s => Object.values(s.observations).reduce((total,o) => total + (o.status === 'confirmed' ? o.units : 0), 0);
const mayRetry = s => !Object.values(s.observations).some(o => o.status === 'unknown' || o.status === 'pending');
const same = (a,b) => { try { assert.deepEqual(a,b); return true; } catch { return false; } };

function transition(state, command) {
  const prior = clone(state);
  const {s,pending} = state;
  const [kind,...args] = command;
  const move = (next,draft,label,response=0) => ({s:clone(next), before:clone(s), pending:clone(draft), priorPending:clone(pending), last:label, returned:response});
  const refuse = () => move(s,noDraft(),'refuse');
  let result;
  switch (kind) {
    case 'stage': {
      const [key,request,expected,world,response,valid] = args;
      if (![1,2,3].includes(key) || ![1,2].includes(request)) result = refuse();
      else if (Object.hasOwn(s.receipts,key)) {
        const r=s.receipts[key];
        result = r.request === request ? move(s,noDraft(),'replay',r.response) : move(s,noDraft(),'conflict');
      } else if (Object.keys(s.receipts).length >= 2) result = move(s,noDraft(),'full');
      else result = move(s,{key,request,expected,world,response,valid,checked:false},'stage');
      break;
    }
    case 'preflight': {
      const [schemaAndSizeOK] = args;
      result = pending.key !== 0 && pending.valid && schemaAndSizeOK &&
        pending.world >= 0 && pending.world <= 8 && pending.response >= 0 && pending.response <= 8
        ? move(s,{...pending,checked:true},'preflight') : refuse();
      break;
    }
    case 'commit': {
      const r=s.receipts[pending.key];
      if (pending.key === 0) result = refuse();
      else if (r) result = r.request === pending.request ? move(s,noDraft(),'replay',r.response) : move(s,noDraft(),'conflict');
      else if (Object.keys(s.receipts).length >= 2) result = move(s,noDraft(),'full');
      else if (!pending.checked || pending.expected !== s.revision) result = refuse();
      else {
        const receipt = {request:pending.request,response:pending.response,revision:s.revision+1};
        result = move({...s,world:pending.world,revision:s.revision+1,commits:s.commits+1,
          receipts:{...s.receipts,[pending.key]:receipt}},noDraft(),'commit',receipt.response);
      }
      break;
    }
    case 'observe': {
      const [attempt,sequence,status,units] = args;
      const o={sequence,status,units}, old=s.observations[attempt];
      const valid=[1,2].includes(attempt) && Number.isInteger(sequence) && sequence >= 0 && sequence <= 4 &&
        ['pending','unknown','confirmed','failed'].includes(status) &&
        (status === 'confirmed' ? units > 0 && units <= 2 : units === 0);
      const update=!old || (sequence >= old.sequence && (sequence !== old.sequence || same(old,o)) &&
        (!terminal(old) || (old.status === status && old.units === units)));
      result = valid && update ? move({...s,observations:{...s.observations,[attempt]:o}},pending,'observe') : refuse();
      break;
    }
    case 'view': result = move(s,pending,'view'); break;
    case 'cancel': result = move(s,noDraft(),'cancel'); break;
    case 'unsafePartialCommit': result = move({...s,world:pending.world},noDraft(),'commit',pending.response); break;
    case 'unsafeEvict': result = move({...s,receipts:{}},noDraft(),'view'); break;
    case 'unsafeTerminalRegression': result = move({...s,observations:{...s.observations,1:{sequence:2,status:'pending',units:0}}},pending,'observe'); break;
    case 'unsafeRestage': result = move(s,{key:1,request:1,expected:s.revision,world:1,response:1,valid:true,checked:true},'stage'); break;
    case 'unsafeFabricatedReplay': result = move(s,noDraft(),'replay',7); break;
    case 'unsafeUnknownResubmit': result = move({...s,submissions:s.submissions+1},pending,'observe'); break;
    default: throw Error('Unknown token-model command: '+kind);
  }
  assert.deepEqual(state,prior,'Token transition mutated its input');
  return result;
}

function invariants({s,before,pending,priorPending,last,returned}) {
  const entries=Object.entries(s.receipts), observations=Object.values(s.observations);
  const bounded=s.world >= 0 && s.world <= 8 && entries.length <= 2 &&
    entries.every(([key]) => [1,2,3].includes(Number(key))) && Object.keys(s.observations).every(a => [1,2].includes(Number(a))) &&
    observations.every(o => o.sequence >= 0 && o.sequence <= 4 && ['pending','unknown','confirmed','failed'].includes(o.status) &&
      (o.status === 'confirmed' ? o.units > 0 && o.units <= 2 : o.units === 0));
  const ledgerMonotone=Object.entries(before.receipts).every(([key,r]) => same(s.receipts[key],r));
  const countOnce=s.commits === entries.length && s.revision === s.commits;
  const receiptShape=entries.every(([,r]) => [1,2].includes(r.request) && r.revision > 0 && r.revision <= s.revision && r.response >= 0 && r.response <= 8);
  const atomic=last !== 'commit' || (s.world === priorPending.world && s.revision === before.revision+1 && s.commits === before.commits+1 &&
    same(Object.keys(s.receipts).sort(),Array.from(new Set([...Object.keys(before.receipts),String(priorPending.key)])).sort()) &&
    same(s.receipts[priorPending.key],{request:priorPending.request,response:priorPending.response,revision:s.revision}) &&
    returned === priorPending.response && priorPending.checked && priorPending.expected === before.revision);
  const passive=last === 'commit' || (s.world === before.world && s.revision === before.revision && s.commits === before.commits && same(s.receipts,before.receipts));
  const refusalUnchanged=!['refuse','conflict','full','replay','view','cancel','stage','preflight'].includes(last) || same(s,before);
  const terminalMonotone=Object.entries(before.observations).every(([key,o]) => s.observations[key] &&
    (!terminal(o) || (o.status === s.observations[key].status && o.units === s.observations[key].units)));
  return {bounded,ledgerMonotone,countOnce,receiptShape,atomic,passive,refusalUnchanged,terminalMonotone,
    quantityMonotone:confirmedUnits(s) >= confirmedUnits(before), noSubmission:s.submissions === 0,
    draftFresh:pending.key === 0 || (!Object.hasOwn(s.receipts,pending.key) && entries.length < 2),
    replayFromLedger:last !== 'replay' || entries.some(([,r]) => r.response === returned)};
}

const stage=(key,request,expected,world,response,valid=true) => ['stage',key,request,expected,world,response,valid];
const check=(ok=true) => ['preflight',ok];
const observe=(attempt,sequence,status,units=0) => ['observe',attempt,sequence,status,units];
const first=[stage(1,1,0,3,5),check(),['commit']];
const full=[...first,stage(2,1,1,4,6),check(),['commit']];
const scenarios={
  staged_is_passiveTest:{commands:[stage(1,1,0,3,5)],last:'stage',world:0},
  preflight_failureTest:{commands:[stage(1,1,0,3,5),check(false)],last:'refuse',world:0},
  oversized_responseTest:{commands:[stage(1,1,0,3,9),check()],last:'refuse',world:0},
  unvalidated_draftTest:{commands:[stage(1,1,0,3,5,false),check()],last:'refuse',world:0},
  unchecked_commitTest:{commands:[stage(1,1,0,3,5),['commit']],last:'refuse',world:0},
  stale_commitTest:{commands:[stage(1,1,1,3,5),check(),['commit']],last:'refuse',world:0},
  atomic_commitTest:{commands:first,last:'commit',world:3,commits:1,returned:5},
  lost_response_replayTest:{commands:[...first,['view'],stage(1,1,0,8,8,false)],last:'replay',world:3,commits:1,returned:5},
  changed_payload_conflictTest:{commands:[...first,stage(1,2,0,8,8)],last:'conflict',world:3,commits:1},
  ledger_full_refusalTest:{commands:[...full,stage(3,1,2,8,8)],last:'full',world:4,commits:2},
  full_ledger_retains_replayTest:{commands:[...full,stage(1,1,0,8,8,false)],last:'replay',commits:2,returned:5},
  cancelled_draftTest:{commands:[stage(1,1,0,3,5),check(),['cancel'],['commit']],last:'refuse',world:0},
  pending_blocks_retryTest:{commands:[observe(1,0,'pending')],last:'observe',retry:false},
  unknown_blocks_retryTest:{commands:[observe(1,0,'unknown'),['view']],last:'view',retry:false},
  unknown_resolvesTest:{commands:[observe(1,0,'unknown'),observe(1,1,'confirmed',2)],last:'observe',confirmed:2,retry:true},
  terminal_reobservation_onceTest:{commands:[observe(1,1,'confirmed',1),observe(1,2,'confirmed',1)],last:'observe',confirmed:1},
  separate_attempts_countTest:{commands:[observe(1,1,'confirmed',1),observe(2,1,'confirmed',1)],last:'observe',confirmed:2},
  terminal_regression_refusesTest:{commands:[observe(1,1,'confirmed',1),observe(1,2,'pending')],last:'refuse',confirmed:1},
  changed_terminal_units_refusesTest:{commands:[observe(1,1,'confirmed',1),observe(1,2,'confirmed',2)],last:'refuse',confirmed:1},
  equal_sequence_conflictTest:{commands:[observe(1,1,'pending'),observe(1,1,'unknown')],last:'refuse',retry:false},
  stale_observation_refusesTest:{commands:[observe(1,2,'unknown'),observe(1,1,'pending')],last:'refuse',retry:false},
  partial_confirmed_unknownTest:{commands:[observe(1,1,'confirmed',2),observe(2,1,'unknown')],last:'observe',confirmed:2,retry:false},
  detects_partial_commitTest:{commands:[stage(1,1,0,3,5),check(),['unsafePartialCommit']],broken:['atomic']},
  detects_receipt_evictionTest:{commands:[...first,['unsafeEvict']],broken:['ledgerMonotone','countOnce']},
  detects_terminal_regressionTest:{commands:[observe(1,1,'confirmed',1),['unsafeTerminalRegression']],broken:['terminalMonotone','quantityMonotone']},
  detects_stale_draftTest:{commands:[...first,['unsafeRestage']],broken:['draftFresh']},
  detects_fabricated_replayTest:{commands:[...first,['unsafeFabricatedReplay']],broken:['replayFromLedger']},
  detects_unknown_resubmissionTest:{commands:[observe(1,1,'unknown'),['unsafeUnknownResubmit']],broken:['noSubmission']}
};

function decode(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Object.hasOwn(value,'#bigint')) {
    const n=Number(value['#bigint']); assert.ok(Number.isSafeInteger(n)); return n;
  }
  if (Object.hasOwn(value,'#map')) return Object.fromEntries(value['#map'].map(([k,v]) => [decode(k),decode(v)]));
  if (Array.isArray(value)) return value.map(decode);
  return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,decode(v)]));
}

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'qdl-v1-token-model-'));
try {
  const model=fs.readFileSync(path.join(ROOT,'spec/v1-session.qnt'),'utf8');
  const tests=Array.from(model.matchAll(/\brun\s+(\w+Test)\s*=/g),m => m[1]).sort();
  assert.deepEqual(Object.keys(scenarios).sort(),tests,'Every deterministic model scenario needs an independent fixture');
  const quint=path.join(ROOT,'node_modules/.bin/quint');
  const run=spawnSync(quint,['test','spec/v1-session.qnt','--max-samples=1','--seed=20261004','--backend=typescript',
    '--out-itf='+path.join(tmp,'{test}_{seq}.itf.json'),'--verbosity=0'],{cwd:ROOT,encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024});
  assert.equal(run.error,undefined,String(run.error));
  assert.equal(run.status,0,run.stderr || run.stdout);
  let comparedStates=0;
  for (const [name,scenario] of Object.entries(scenarios)) {
    const files=fs.readdirSync(tmp).filter(f => f.startsWith(name+'_') && f.endsWith('.itf.json'));
    assert.equal(files.length,1,'Missing/ambiguous actual Quint trace: '+name);
    const states=JSON.parse(fs.readFileSync(path.join(tmp,files[0]),'utf8')).states.map((raw,index) => {
      assert.equal(raw['#meta'].index,index,'ITF metadata index');
      const {'#meta':metadata,...state}=decode(raw);
      return state;
    });
    assert.equal(states.length,scenario.commands.length+1,name+': transition count differs');
    let state=initial();
    assert.deepEqual(states[0],state,name+': initial state');
    comparedStates++;
    for (const [i,command] of scenario.commands.entries()) {
      state=transition(state,command);
      assert.deepEqual(states[i+1],state,name+': actual Quint state after '+JSON.stringify(command));
      const properties=invariants(state);
      if (!command[0].startsWith('unsafe')) assert.ok(Object.values(properties).every(Boolean),name+': '+JSON.stringify(properties));
      comparedStates++;
    }
    if (scenario.broken) {
      const properties=invariants(state);
      for (const property of scenario.broken) assert.equal(properties[property],false,name+': control did not break '+property);
    } else {
      assert.equal(state.last,scenario.last,name);
      for (const field of ['world','commits']) if (Object.hasOwn(scenario,field)) assert.equal(state.s[field],scenario[field],name);
      if (Object.hasOwn(scenario,'returned')) assert.equal(state.returned,scenario.returned,name);
      if (Object.hasOwn(scenario,'confirmed')) assert.equal(confirmedUnits(state.s),scenario.confirmed,name);
      if (Object.hasOwn(scenario,'retry')) assert.equal(mayRetry(state.s),scenario.retry,name);
    }
  }
  console.log(JSON.stringify({status:'passed',quintScenarios:tests.length,comparedStates,negativeControls:Object.values(scenarios).filter(x => x.broken).length,
    scope:'Independent JS token transitions versus executed Quint ITF traces; no production SDK/interpreter/durability/external refinement'},null,2));
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
