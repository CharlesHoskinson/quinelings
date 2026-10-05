import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {ClientFactory} from '@a2a-js/sdk/client';
import {DefaultExecutionEventBus,RequestContext,ServerCallContext} from '@a2a-js/sdk/server';
import {SendMessageRequest,Task,TaskState} from '@a2a-js/sdk';
import {createQuinelingMcpServer} from '../src/mcp.js';
import {createA2AApp,QuinelingExecutor} from '../src/a2a.js';
import {Runtime} from '../src/index.js';
import {Session} from '../src/v1.js';
import {VisualCapsule} from '../src/experimental.js';
import {experimentalVisualFlag,dispatchVisualRequest} from '../src/experimental-adapters.js';
function sources(){
 const legacy=new Runtime().create('[2,3,4] | square | sum | report total');assert.equal(legacy.status,'supported');if(legacy.status!=='supported')throw Error();
 const stable=new Session().compile({format:'qdl-intent',version:1,name:'Measured total',thought:'Sum supplied readings.',inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'L'}}}],steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
 return {legacy:legacy.artifact.source,stable:stable.source};
}
async function exercise(call:(operation:string,args:Record<string,unknown>)=>Promise<any>){
 const task=sources(),capsule=await call('Author',{taskSource:task.stable,seed:7});
 assert.equal(capsule.taskSource,task.stable);
 assert.equal((await call('Admit',{source:capsule.source})).source,capsule.source);
 assert.equal((await call('Verify',{source:capsule.source})).source,capsule.source);
 for(const encoding of ['colors','harmonics'])assert.equal((await call('Recover',{source:capsule.source,encoding})).source,capsule.source);
 const frame=await call('Frame',{source:capsule.source,phase:.5,budget:128});assert(Array.isArray(frame.points));assert.equal(frame.points.length,512);assert.equal(frame.owners.length,128);assert.deepEqual(frame.ridges,[]);
 assert((await call('Bounds',{source:capsule.source})).height>0);
 assert(Number.isFinite((await call('Anchor',{source:capsule.source,nodeId:capsule.task.nodes[0].id,phase:.5})).x));
 assert.deepEqual((await call('Run',{source:capsule.source,constructionOnly:true})).tasks,[]);
 for(const [bindings,total] of [[{samples:[2,3,4]},9],[{samples:[8,9]},17]] as const){const result=await call('Run',{source:capsule.source,bindings});assert.equal(result.taskProfile,'qdl-v1');assert.deepEqual(result.occurrences[0].outputs,[total]);assert.equal(result.emitted[0],capsule.source);}
 const legacy=await call('Author',{taskSource:task.legacy,seed:42});const useful=await call('Run',{source:legacy.source});assert.deepEqual(useful.tasks[0].output,[{total:29}]);assert.equal(useful.emitted[0],legacy.source);
}
test('official MCP client exercises opt-in visual capsule with stable supplied inputs and useful legacy result',async()=>{
 const server=createQuinelingMcpServer(undefined,{experimentalVisual:true}),client=new Client({name:'visual-tests',version:'1'}),[a,b]=InMemoryTransport.createLinkedPair();
 await server.connect(a);await client.connect(b);
 try{assert.equal((await client.listTools()).tools.length,24);await exercise(async(operation,args)=>{const result=await client.callTool({name:'quineling_visual_'+operation.toLowerCase(),arguments:args});assert(!result.isError,JSON.stringify(result));return result.structuredContent?.result;});
 const invalid=await client.callTool({name:'quineling_visual_frame',arguments:{source:'[]',phase:0,budget:12001}});assert.equal(invalid.isError,true);
 const extra=await client.callTool({name:'quineling_visual_author',arguments:{taskSource:sources().stable,unknown:true}});assert.equal(extra.isError,true);
 }finally{await client.close();await server.close();}
});
test('official A2A client exercises opt-in visual operations through the existing bounded task executor',async()=>{
 const http=createServer();http.listen(0,'127.0.0.1');await once(http,'listening');const address=http.address();assert(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`,{app,card}=createA2AApp({baseUrl:base,experimentalVisual:true});http.on('request',app);
 try{assert(card.skills.some(skill=>skill.id==='experimental-visual'));const client=await new ClientFactory().createFromUrl(base);await exercise(async(operation,args)=>{const result=await client.sendMessage(SendMessageRequest.fromJSON({message:{messageId:randomUUID(),role:'ROLE_USER',parts:[{data:{operation:'visual'+operation,...args},mediaType:'application/json'}]}}));assert('status' in result);const task=Task.toJSON(result) as any;assert.equal(task.status.state,'TASK_STATE_COMPLETED',JSON.stringify(task));return task.artifacts.at(-1).parts[0].data.result;});
 }finally{http.closeAllConnections();await new Promise<void>(resolve=>http.close(()=>resolve()));}
});
test('passive visual operations never call task execution, and flags/input schema remain closed',()=>{
 const capsule=VisualCapsule.author(sources().stable,7),original=VisualCapsule.execute;let calls=0;
 VisualCapsule.execute=(...args)=>{calls++;return original(...args);};
 try{for(const request of [{operation:'visualAuthor',taskSource:capsule.taskSource},{operation:'visualAdmit',source:capsule.source},{operation:'visualRecover',source:capsule.source,encoding:'colors'},{operation:'visualVerify',source:capsule.source},{operation:'visualFrame',source:capsule.source,phase:0,budget:128},{operation:'visualBounds',source:capsule.source}])dispatchVisualRequest(request);assert.equal(calls,0);dispatchVisualRequest({operation:'visualRun',source:capsule.source,bindings:{samples:[2,3]}});assert.equal(calls,1);}finally{VisualCapsule.execute=original;}
 assert.equal(experimentalVisualFlag([]),false);assert.equal(experimentalVisualFlag(['--experimental-visual']),true);assert.throws(()=>experimentalVisualFlag(['--other']));assert.throws(()=>experimentalVisualFlag(['--experimental-visual','--experimental-visual']));assert.throws(()=>dispatchVisualRequest({operation:'visualFrame',source:capsule.source,phase:Infinity}));assert.throws(()=>dispatchVisualRequest({operation:'visualRun',source:capsule.source,authority:true}));
});

test('opt-in visual run respects existing pre-dispatch A2A cancellation',async()=>{
 const capsule=VisualCapsule.author(sources().stable,7),original=VisualCapsule.execute;let calls=0;
 VisualCapsule.execute=(...args)=>{calls++;return original(...args);};
 try{
  const executor=new QuinelingExecutor(new Runtime(),true),bus=new DefaultExecutionEventBus(),states:TaskState[]=[];
  bus.on('event',event=>{if(event.kind==='statusUpdate'&&event.data.status)states.push(event.data.status.state);});
  const request=SendMessageRequest.fromJSON({message:{messageId:randomUUID(),role:'ROLE_USER',parts:[{data:{operation:'visualRun',source:capsule.source,bindings:{samples:[2,3]}}}]}});
  const running=executor.execute(new RequestContext(request,'visual-cancel','context',new ServerCallContext()),bus);await executor.cancelTask('visual-cancel',bus);await running;
  assert.equal(calls,0);assert.deepEqual(states,[TaskState.TASK_STATE_CANCELED]);
 }finally{VisualCapsule.execute=original;}
});
