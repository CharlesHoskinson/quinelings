import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { DefaultExecutionEventBus, RequestContext, ServerCallContext } from '@a2a-js/sdk/server';
import { SendMessageRequest, ListTasksRequest, Task, TaskState } from '@a2a-js/sdk';
import { Runtime } from '../src/index.js';
import { createA2AApp, BoundedTaskStore, QuinelingExecutor, type A2AOptions } from '../src/a2a.js';

async function server(options:Pick<A2AOptions,'taskStore'>={}) {
  const http=createServer();http.listen(0,'127.0.0.1');await once(http,'listening');const address=http.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  const instance=createA2AApp({...options,baseUrl:base});http.on('request',instance.app);
  return {base,...instance,close:()=>new Promise<void>((resolve,reject)=>http.close(error=>error?reject(error):resolve()))};
}
async function rpc(base:string,method:string,params:unknown,version='1.0') {
  const response=await fetch(base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json','A2A-Version':version},body:JSON.stringify({jsonrpc:'2.0',id:randomUUID(),method,params}),signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);return response.json() as Promise<any>;
}
function message(data:unknown,text=false,taskId?:string) {return {message:{messageId:randomUUID(),role:'ROLE_USER',parts:[text?{text:data}:{data,mediaType:'application/json'}],...(taskId?{taskId}:{})}};}
function payload(task:any) {assert(task.artifacts?.length);return task.artifacts.at(-1).parts[0].data;}

test('A2A HTTP card, passive create, explicit run, source copy, frame and recovery',async()=>{
  const s=await server();try {
    const card=await (await fetch(s.base+'/.well-known/agent-card.json',{headers:{'A2A-Version':'1.0'}})).json() as any;
    assert(card.supportedInterfaces.some((i:any)=>i.protocolVersion==='1.0'&&i.url===s.base+'/a2a/jsonrpc'));assert.equal(card.skills.length,2);
    const made=await rpc(s.base,'SendMessage',message('[2,3,5] | square | sum',true));assert(!made.error,JSON.stringify(made));const task=made.result.task;assert.equal(task.status.state,'TASK_STATE_COMPLETED');const build=payload(task);assert.equal(build.operation,'create');assert.equal(build.result.status,'supported');assert(!('record' in build.result));const artifact=build.result.artifact;
    const retrieved=await rpc(s.base,'GetTask',{id:task.id});assert.equal(retrieved.result.id,task.id);assert.equal(payload(retrieved.result).result.artifact.source,artifact.source);
    const inspect=await rpc(s.base,'SendMessage',message({operation:'inspect',artifactId:artifact.id}));assert.equal(payload(inspect.result.task).result.source,artifact.source);
    const ran=await rpc(s.base,'SendMessage',message({operation:'run',artifactId:artifact.id}));const record=payload(ran.result.task).result;assert.equal(record.artifactId,artifact.id);assert.deepEqual(record.result.tasks[0].output,[38]);
    const copied=await rpc(s.base,'SendMessage',message({operation:'reproduce',artifactId:artifact.id,recordId:record.id}));const copy=payload(copied.result.task).result;assert.equal(copy.artifact.source,artifact.source);assert.equal(copy.record.parentRecordId,record.id);assert.notEqual(copy.record.id,record.id);
    const recovered=await rpc(s.base,'SendMessage',message({operation:'recover',recovery:{source:artifact.source}}));assert.equal(payload(recovered.result.task).result.source,artifact.source);assert(!('record' in payload(recovered.result.task).result));
    const framed=await rpc(s.base,'SendMessage',message({operation:'frame',artifactId:artifact.id,phase:2.1,options:{budget:4000,crests:2}}));const frame=payload(framed.result.task).result;assert.equal(frame.points.length,16000);assert.equal(frame.owners.length,4000);assert.equal(new Set(frame.owners).size,artifact.graph.nodes.length);
    const cancel=await rpc(s.base,'CancelTask',{id:task.id});assert.equal(cancel.error.code,-32002);
    const absent=await rpc(s.base,'GetTask',{id:'absent'});assert.equal(absent.error.code,-32001);
  } finally {await s.close();}
});

test('A2A official v0.3 message/send compatibility and native REST',async()=>{
  const s=await server();try {
    const card=await (await fetch(s.base+'/.well-known/agent-card.json')).json() as any;assert.equal(card.protocolVersion,'0.3');
    const legacy=await rpc(s.base,'message/send',{message:{kind:'message',messageId:randomUUID(),role:'user',parts:[{kind:'text',text:'[1,2,3] | sum'}]}},'0.3');assert(!legacy.error,JSON.stringify(legacy));assert.equal(legacy.result.status.state,'completed');assert.equal(payload(legacy.result).result.status,'supported');
    const rest=await fetch(s.base+'/a2a/rest/message:send',{method:'POST',headers:{'content-type':'application/json','A2A-Version':'1.0'},body:JSON.stringify(message('[1,2,3] | sum',true))});assert.equal(rest.status,200);const result=await rest.json() as any;assert.equal(result.task.status.state,'TASK_STATE_COMPLETED');
  }finally{await s.close();}
});

test('A2A malformed messages, source mismatch, bounded requests and clarification cancellation',async()=>{
  const s=await server();try {
    const invalid=await rpc(s.base,'SendMessage',message({operation:'execute-arbitrary-code'}));assert.equal(invalid.result.task.status.state,'TASK_STATE_FAILED');assert(!invalid.result.task.artifacts?.length);
    const wrong=await rpc(s.base,'SendMessage',message({operation:'run',artifactId:'absent'}));assert.equal(wrong.result.task.status.state,'TASK_STATE_FAILED');assert.deepEqual(wrong.result.task.status.message.metadata.quinelingError,{code:'unknown-artifact',message:'Artifact is not in this runtime',path:'$'});
    const fetchedFailure=await rpc(s.base,'GetTask',{id:wrong.result.task.id});assert.deepEqual(fetchedFailure.result.status.message.metadata.quinelingError,wrong.result.task.status.message.metadata.quinelingError);
    const badEnvelope=await rpc(s.base,'SendMessage',{});assert(badEnvelope.error);
    const malformed=await fetch(s.base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json'},body:'{'});assert.equal(malformed.status,400);
    const huge=await fetch(s.base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({padding:'x'.repeat(2*1024*1024)})});assert.equal(huge.status,413);
    const unclear=await rpc(s.base,'SendMessage',message('allocate',true));assert.equal(unclear.result.task.status.state,'TASK_STATE_INPUT_REQUIRED',JSON.stringify(unclear));
    const canceled=await rpc(s.base,'CancelTask',{id:unclear.result.task.id});assert.equal(canceled.result.status.state,'TASK_STATE_CANCELED');
    const cancelMissing=await rpc(s.base,'CancelTask',{id:'missing'});assert.equal(cancelMissing.error.code,-32001);
    const continuation=await rpc(s.base,'SendMessage',message('allocate',true));const completed=await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true,continuation.result.task.id));assert.equal(completed.result.task.status.state,'TASK_STATE_COMPLETED');assert.equal(completed.result.task.id,continuation.result.task.id);
  }finally{await s.close();}
});

test('A2A cancellation before dispatch and bounded terminal task eviction',async()=>{
  let calls=0;const runtime=new Runtime(),original=runtime.dispatch.bind(runtime);runtime.dispatch=request=>{calls++;return original(request);};const executor=new QuinelingExecutor(runtime),bus=new DefaultExecutionEventBus(),states:TaskState[]=[];bus.on('event',event=>{if(event.kind==='statusUpdate'&&event.data.status)states.push(event.data.status.state);});
  const request=SendMessageRequest.fromJSON(message('[1,2,3] | sum',true)),context=new RequestContext(request,'cancel-me','context',new ServerCallContext());const running=executor.execute(context,bus);await executor.cancelTask('cancel-me',bus);await running;assert.equal(calls,0);assert.deepEqual(states,[TaskState.TASK_STATE_CANCELED]);
  const store=new BoundedTaskStore(1),sc=new ServerCallContext();await store.save(Task.fromJSON({id:'a',contextId:'c',status:{state:'TASK_STATE_COMPLETED'}}),sc);await store.save(Task.fromJSON({id:'b',contextId:'c',status:{state:'TASK_STATE_COMPLETED'}}),sc);assert.equal(await store.load('a',sc),undefined);assert((await store.load('b',sc))?.id==='b');
});


test('A2A more than 128 clarification tasks cannot block a fresh valid request',async()=>{
  const s=await server();try {
    const ids:string[]=[];
    for(let i=0;i<140;i++){
      const response=await rpc(s.base,'SendMessage',message('allocate',true));
      assert(!response.error,JSON.stringify(response));assert.equal(response.result.task.status.state,'TASK_STATE_INPUT_REQUIRED');
      ids.push(response.result.task.id);assert.equal(s.executor.isActive(response.result.task.id),false,'paused task releases executor state');
    }
    const old=ids[0]!,retained=ids.at(-1)!,cancelId=ids.at(-2)!;
    assert.equal((await rpc(s.base,'GetTask',{id:old})).error.code,-32001);
    assert.equal((await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true,old))).error.code,-32001,'evicted task cannot silently resume');
    const fresh=await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true));assert.equal(fresh.result.task.status.state,'TASK_STATE_COMPLETED');
    const canceled=await rpc(s.base,'CancelTask',{id:cancelId});assert.equal(canceled.result.status.state,'TASK_STATE_CANCELED');
    const resumed=await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true,retained));assert.equal(resumed.result.task.id,retained);assert.equal(resumed.result.task.status.state,'TASK_STATE_COMPLETED');
    const listed=await rpc(s.base,'ListTasks',{});assert.equal(listed.result.totalSize,128);
  }finally{await s.close();}
});

test('A2A clarification expiry returns not-found and active work is never evicted',async()=>{
  let now=0;const store=new BoundedTaskStore(2,64*1024*1024,{interruptedTtlMs:1000,now:()=>now}),s=await server({taskStore:store});try{
    const paused=await rpc(s.base,'SendMessage',message('allocate',true)),id=paused.result.task.id;
    now=1000;
    assert.equal((await rpc(s.base,'GetTask',{id})).error.code,-32001);
    assert.equal((await rpc(s.base,'CancelTask',{id})).error.code,-32001);
    assert.equal((await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true,id))).error.code,-32001);
    const fresh=await rpc(s.base,'SendMessage',message('[1,2,3] | sum',true));assert.equal(fresh.result.task.status.state,'TASK_STATE_COMPLETED');
  }finally{await s.close();}
  const sc=new ServerCallContext(),active=new BoundedTaskStore(1,64*1024*1024,{interruptedTtlMs:1000,now:()=>now});
  await active.save(Task.fromJSON({id:'resuming',contextId:'c',status:{state:'TASK_STATE_INPUT_REQUIRED'}}),sc);
  active.protectActiveTasks(id=>id==='resuming');now+=2000;
  assert((await active.load('resuming',sc)),'resumed task survives expiry before its submitted event is stored');
  await assert.rejects(active.save(Task.fromJSON({id:'other',contextId:'c',status:{state:'TASK_STATE_SUBMITTED'}}),sc),/active work/);
  await active.save(Task.fromJSON({id:'resuming',contextId:'c',status:{state:'TASK_STATE_WORKING'}}),sc);active.protectActiveTasks(()=>false);
  await assert.rejects(active.save(Task.fromJSON({id:'other',contextId:'c',status:{state:'TASK_STATE_SUBMITTED'}}),sc),/active work/);
  assert((await active.load('resuming',sc)),'working state cannot be evicted');
});


test('A2A stable scoped cursor continues after earlier tasks are evicted',async()=>{
  const store=new BoundedTaskStore(10),context=new ServerCallContext();
  const put=async(id:string)=>store.save(Task.fromJSON({id,contextId:'c',status:{state:'TASK_STATE_COMPLETED'}}),context);
  for(let i=0;i<10;i++)await put('task-'+i);
  const first=await store.list(ListTasksRequest.fromJSON({pageSize:5}),context);
  assert.deepEqual(first.tasks.map(t=>t.id),['task-0','task-1','task-2','task-3','task-4']);assert(first.nextPageToken);
  for(let i=10;i<15;i++)await put('task-'+i);
  assert.equal(await store.load('task-4',context),undefined,'cursor row itself was evicted');
  const second=await store.list(ListTasksRequest.fromJSON({pageSize:5,pageToken:first.nextPageToken}),context);
  assert.deepEqual(second.tasks.map(t=>t.id),['task-5','task-6','task-7','task-8','task-9']);
  await put('task-6'); // An update changes LRU retention order, not cursor order.
  const third=await store.list(ListTasksRequest.fromJSON({pageSize:5,pageToken:second.nextPageToken}),context);
  assert.deepEqual(third.tasks.map(t=>t.id),['task-10','task-11','task-12','task-13','task-14']);assert.equal(third.nextPageToken,'');
  const request=ListTasksRequest.fromJSON({pageSize:5,pageToken:first.nextPageToken});
  await assert.rejects(store.list(request,new ServerCallContext({tenant:'other'})),/scope\/filters/);
  await assert.rejects(store.list({...request,contextId:'changed'},context),/scope\/filters/);
  await assert.rejects(store.list({...request,pageToken:'5'},context),/cursor/);
  await assert.rejects(store.list({...request,pageToken:first.nextPageToken+'.forged'},context),/cursor/);
  const foreign=new BoundedTaskStore(10);await assert.rejects(foreign.list(request,context),/cursor/);
});

test('A2A clarification follow-up preserves transcript, replaces result and survives malformed input',async()=>{
  const s=await server();try{
    const firstMessage=message('allocate',true),first=await rpc(s.base,'SendMessage',firstMessage),id=first.result.task.id;
    assert.equal(first.result.task.status.state,'TASK_STATE_INPUT_REQUIRED');
    const before=await rpc(s.base,'GetTask',{id});assert(before.result.history.some((m:any)=>m.messageId===firstMessage.message.messageId));
    const malformed={message:{messageId:randomUUID(),taskId:id,role:'ROLE_USER',parts:[{text:'one'},{text:'two'}]}};
    const attempted=await rpc(s.base,'SendMessage',malformed);assert.equal(attempted.result.task.status.state,'TASK_STATE_INPUT_REQUIRED');
    const followup=message('[1,2,3] | sum',true,id),completed=await rpc(s.base,'SendMessage',followup);assert.equal(completed.result.task.status.state,'TASK_STATE_COMPLETED');
    const after=await rpc(s.base,'GetTask',{id});
    for(const previous of before.result.history)assert(after.result.history.some((m:any)=>m.messageId===previous.messageId),'previous transcript message retained');
    for(const user of [firstMessage.message,malformed.message,followup.message])assert(after.result.history.some((m:any)=>m.messageId===user.messageId),'all user attempts retained');
    assert.equal(after.result.artifacts.length,1);assert.equal(after.result.artifacts[0].artifactId,'quineling-result');assert.equal(payload(after.result).result.status,'supported');
  }finally{await s.close();}
});

test('A2A raw text has the same whitespace and length semantics as direct/data create',async()=>{
  const s=await server();try{
    for(const thought of ['', '   ']){
      const expected=s.runtime.create(thought);assert.equal(expected.status,'clarify');
      for(const input of [message(thought,true),message({operation:'create',thought})]){
        const response=await rpc(s.base,'SendMessage',input);assert.equal(response.result.task.status.state,'TASK_STATE_INPUT_REQUIRED');assert.deepEqual(payload(response.result.task).result,expected);
      }
    }
    const thought=' [1] | sum'.padEnd(16385,' ');assert.throws(()=>s.runtime.create(thought),/16384/);
    for(const input of [message(thought,true),message({operation:'create',thought})]){
      const response=await rpc(s.base,'SendMessage',input);assert.equal(response.result.task.status.state,'TASK_STATE_FAILED');assert.equal(response.result.task.status.message.metadata.quinelingError.code,'invalid-input');
    }
  }finally{await s.close();}
});

test('A2A failed saves preserve paused tasks, prior records and capacity accounting',async()=>{
  const store=new BoundedTaskStore(10,16*1024*1024),context=new ServerCallContext();
  const sized=(id:string,state:string,mib:number)=>Task.fromJSON({id,contextId:'c',status:{state},metadata:{padding:'x'.repeat(mib*1024*1024)}});
  await store.save(sized('active','TASK_STATE_WORKING',9),context);
  await store.save(sized('paused','TASK_STATE_INPUT_REQUIRED',6),context);
  await assert.rejects(store.save(sized('too-large','TASK_STATE_WORKING',9),context),/active work/);
  assert((await store.load('paused',context))?.id==='paused','rejected save cannot consume eviction victims');
  const kept=Task.fromJSON({id:'kept',contextId:'c',status:{state:'TASK_STATE_COMPLETED'}});await store.save(kept,context);
  await assert.rejects(store.save(Object.assign(structuredClone(kept),{uncloneable:()=>0}),context));
  assert.deepEqual(await store.load('kept',context),kept);
  await store.save(Task.fromJSON({id:'next',contextId:'c',status:{state:'TASK_STATE_COMPLETED'}}),context);
  assert.deepEqual((await store.list(ListTasksRequest.fromJSON({}),context)).tasks.map(t=>t.id),['active','paused','kept','next']);
});

test('A2A timestamp filters compare instants inclusively and newest status comes first',async()=>{
  const store=new BoundedTaskStore(),context=new ServerCallContext();
  for(const [id,timestamp] of [['earlier','2026-10-04T09:00:00Z'],['equal','2026-10-04T10:00:00.000Z'],['later','2026-10-04T11:00:00Z'],['missing',undefined]])await store.save(Task.fromJSON({id,contextId:'c',status:{state:'TASK_STATE_COMPLETED',timestamp}}),context);
  const equal=await store.list(ListTasksRequest.fromJSON({statusTimestampAfter:'2026-10-04T10:00:00Z'}),context);assert.deepEqual(equal.tasks.map(t=>t.id),['later','equal']);
  const offset=await store.list(ListTasksRequest.fromJSON({statusTimestampAfter:'2026-10-04T12:00:00+03:00'}),context);assert.deepEqual(offset.tasks.map(t=>t.id),['later','equal','earlier']);
  const first=await store.list(ListTasksRequest.fromJSON({pageSize:2}),context);assert.deepEqual(first.tasks.map(t=>t.id),['later','equal']);
  const second=await store.list(ListTasksRequest.fromJSON({pageSize:2,pageToken:first.nextPageToken}),context);assert.deepEqual(second.tasks.map(t=>t.id),['earlier','missing']);
  await assert.rejects(store.list(ListTasksRequest.fromJSON({statusTimestampAfter:'not-a-date'}),context),/timestamp/);
});

test('A2A active protection and cancellation are scoped for identical tenant task IDs',async()=>{
  let now=0;const store=new BoundedTaskStore(4,64*1024*1024,{interruptedTtlMs:1000,now:()=>now}),a=new ServerCallContext({tenant:'a'}),b=new ServerCallContext({tenant:'b'});
  for(const context of [a,b])await store.save(Task.fromJSON({id:'same',contextId:'c',status:{state:'TASK_STATE_INPUT_REQUIRED'}}),context);
  store.protectActiveTasks((id,scope)=>id==='same'&&scope===JSON.stringify(['a',''])+':');now=1000;
  assert((await store.load('same',a))?.id==='same');assert.equal(await store.load('same',b),undefined);assert.equal((await store.list(ListTasksRequest.fromJSON({}),b)).tasks.length,0);
  let calls=0;const runtime=new Runtime(),dispatch=runtime.dispatch.bind(runtime);runtime.dispatch=request=>{calls++;return dispatch(request);};const executor=new QuinelingExecutor(runtime),busA=new DefaultExecutionEventBus(),busB=new DefaultExecutionEventBus();
  const request=SendMessageRequest.fromJSON(message('[1] | sum',true));
  const first=executor.execute(new RequestContext(request,'same','c',a),busA),second=executor.execute(new RequestContext(request,'same','c',b),busB);
  await executor.cancelTask('same',busA);await Promise.all([first,second]);assert.equal(calls,1,'canceling tenant A does not cancel tenant B');
});
