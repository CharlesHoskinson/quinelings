import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {ClientFactory} from '@a2a-js/sdk/client';
import {SendMessageRequest,TaskState,Task} from '@a2a-js/sdk';
import {DefaultExecutionEventBus,RequestContext,ServerCallContext} from '@a2a-js/sdk/server';
import {Session} from '../src/v1.js';
import {ResultSchemas} from '../src/v1-schema.js';
import type {Intent,Request} from '../src/v1-types.js';
import {createV1McpServer} from '../src/v1-mcp.js';
import {createV1A2AApp,V1Executor} from '../src/v1-a2a.js';
const fixture=():Intent=>({format:'qdl-intent',version:1,name:'Measured total',thought:'Sum supplied inventory observations.',inputs:[{id:'counts',name:'counts',type:{kind:'array',element:{kind:'number',unit:'item',integer:true,min:0}}}],steps:[{id:'total',op:'sum',inputs:['counts'],params:{}}],outputs:['total']});
const divide=():Intent=>({format:'qdl-intent',version:1,name:'Ratio',thought:'Compute bounded observed ratio.',inputs:[{id:'n',name:'n',type:{kind:'number',unit:'one'}},{id:'d',name:'d',type:{kind:'number',unit:'one'}}],steps:[{id:'ratio',op:'arithmetic',inputs:['n','d'],params:{kind:'div'}}],outputs:['ratio']});
function mcpResult(response:any):any{assert.notEqual(response.isError,true,JSON.stringify(response.content));assert.equal(response.content[0].text,JSON.stringify(response.structuredContent));return response.structuredContent.result;}
function mcpError(response:any,code:string){assert.equal(response.isError,true);assert.equal(response.structuredContent?.error.code,code);}
async function withMcp(session:Session,fn:(client:Client,server:ReturnType<typeof createV1McpServer>,transports:ReturnType<typeof InMemoryTransport.createLinkedPair>)=>Promise<void>){const server=createV1McpServer(session),client=new Client({name:'v1-adapter-tests',version:'1'}),transports=InMemoryTransport.createLinkedPair();await server.connect(transports[1]);await client.connect(transports[0]);try{await fn(client,server,transports);}finally{await client.close();await server.close();}}
async function http(session=new Session(),options:{requestLimitBytes?:number}={}){const server=createServer();server.listen(0,'127.0.0.1');await once(server,'listening');const address=server.address();assert(address&&typeof address==='object');const base='http://127.0.0.1:'+address.port,instance=createV1A2AApp(session,{...options,baseUrl:base});server.on('request',instance.app);return {base,...instance,close:()=>new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()))};}
function message(data:unknown,text=false,taskId?:string){return {message:{messageId:randomUUID(),role:'ROLE_USER',parts:[text?{text:data}:{data,mediaType:'application/json'}],...(taskId?{taskId}:{})}};}
async function rpc(base:string,method:string,params:unknown,version='1.0'){const response=await fetch(base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json','A2A-Version':version},body:JSON.stringify({jsonrpc:'2.0',id:randomUUID(),method,params}),signal:AbortSignal.timeout(10000)});assert.equal(response.status,200);return response.json() as Promise<any>;}
function taskPayload(task:any){assert(task.artifacts?.length,JSON.stringify(task));return task.artifacts.at(-1).parts[0].data;}
function taskError(task:any,code:string){assert.equal(task.status.state,'TASK_STATE_FAILED');assert.equal(task.status.message.metadata.qdlError.code,code);}

test('official MCP discovers eight strict v1 tools with real recursive input and output schemas',async()=>{
 await withMcp(new Session(),async client=>{const tools=(await client.listTools()).tools;assert.equal(tools.length,8);assert.deepEqual(tools.map(t=>t.name).sort(),['compile','describe','frame','inspect','recover','reproduce','run','verify'].map(op=>'quineling_v1_'+op).sort());
 for(const tool of tools){assert.equal(tool.inputSchema.additionalProperties,false);assert(tool.outputSchema);assert.equal(tool.outputSchema!.additionalProperties,false);assert.deepEqual(tool.outputSchema!.required,['result']);assert.equal(tool.annotations?.openWorldHint,false);assert.equal(tool.annotations?.idempotentHint,true);}
 for(const op of ['describe','inspect','verify','frame'])assert.equal(tools.find(t=>t.name==='quineling_v1_'+op)?.annotations?.readOnlyHint,true);for(const op of ['compile','recover','run','reproduce'])assert.equal(tools.find(t=>t.name==='quineling_v1_'+op)?.annotations?.readOnlyHint,false);
 const frame=tools.find(t=>t.name==='quineling_v1_frame')!.inputSchema as any;assert.equal(frame.properties.phase.minimum,-1e9);assert.equal(frame.properties.phase.maximum,1e9);
 const run=tools.find(t=>t.name==='quineling_v1_run')!.inputSchema as any;assert.deepEqual(run.required.sort(),['artifactId','inputs','requestId']);
 const compile=tools.find(t=>t.name==='quineling_v1_compile')!.inputSchema as any;assert.equal(compile.properties.intent.additionalProperties,false);assert(compile.properties.intent.properties.thought);
 });
});

test('official MCP validates complete source lifecycle, fresh input outcomes and keyed retry',async()=>{
 const session=new Session();await withMcp(session,async client=>{const call=async(op:Request['operation'],args:unknown)=>{const result=mcpResult(await client.callTool({name:'quineling_v1_'+op,arguments:args as any}));assert(ResultSchemas[op].safeParse(result).success);return result;};
 const descriptor=await call('describe',{});assert.equal(descriptor.effects,'simulation-only');const artifact=await call('compile',{intent:fixture()});assert.deepEqual(session.exportSnapshot().records,[]);assert.equal((await call('inspect',{artifactId:artifact.id})).source,artifact.source);assert.equal((await call('verify',{artifactId:artifact.id})).sourceHash,artifact.id);
 assert.equal((await call('frame',{artifactId:artifact.id,phase:1e9,options:{budget:4000,crests:2}})).owners.length,4000);for(const recovery of [{source:artifact.source},{harmonics:artifact.harmonics},{colors:artifact.colors}])assert.equal((await call('recover',{recovery})).id,artifact.id);assert.deepEqual(session.exportSnapshot().records,[]);
 const request={artifactId:artifact.id,requestId:'inventory-1',inputs:{counts:[3,7,11]}},first=await call('run',request);assert.deepEqual(first.result.occurrences[0].outputs,[21]);assert.equal(first.result.emitted[0],artifact.source);assert.deepEqual(await call('run',request),first);
 const second=await call('run',{...request,requestId:'inventory-2',inputs:{counts:[4,8]}});assert.deepEqual(second.result.occurrences[0].outputs,[12]);assert.notEqual(second.result.inputHash,first.result.inputHash);assert.equal(second.artifactId,first.artifactId);
 const reproduction={artifactId:artifact.id,recordId:first.id,requestId:'reproduction-1'},child=await call('reproduce',reproduction);assert.equal(child.parentRecordId,first.id);assert.notEqual(child.id,first.id);assert.deepEqual(await call('reproduce',reproduction),child);
 mcpError(await client.callTool({name:'quineling_v1_run',arguments:{...request,inputs:{counts:[1]}}}),'request-conflict');assert.equal(session.exportSnapshot().records.length,3);
 });
});

test('MCP computed failures are successful typed results; malformed protocol/schema and domain errors stay distinct',async()=>{
 const session=new Session();await withMcp(session,async client=>{const artifact=mcpResult(await client.callTool({name:'quineling_v1_compile',arguments:{intent:divide()}})),failed=mcpResult(await client.callTool({name:'quineling_v1_run',arguments:{artifactId:artifact.id,requestId:'divide-zero',inputs:{n:8,d:0}}}));assert.equal(failed.result.status,'failed');assert.deepEqual(failed.result.occurrences[0].effects,[]);assert(failed.result.occurrences[0].diagnostic);
 mcpError(await client.callTool({name:'quineling_v1_inspect',arguments:{artifactId:'ql_'+'0'.repeat(64)}}),'unknown-artifact');const bad=await client.callTool({name:'quineling_v1_frame',arguments:{artifactId:artifact.id,phase:1e9+1}});assert.equal(bad.isError,true);assert.match((bad.content as any)[0].text,/Input validation/);assert.equal(bad.structuredContent,undefined);
 const unknown=await client.callTool({name:'quineling_v1_run',arguments:{artifactId:artifact.id,requestId:'extra',inputs:{n:1,d:1},extra:true}});assert.equal(unknown.isError,true);assert.equal(session.exportSnapshot().records.length,1);
 });
});

test('official MCP cancellation before dispatch leaves no run or receipt',async()=>{
 const session=new Session({maxRecords:1}),artifact=session.compile(fixture());await withMcp(session,async(client,server,transports)=>{const [ct,st]=transports,request={artifactId:artifact.id,requestId:'cancelled',inputs:{counts:[1,2]}};const outgoing:unknown[]=[];const send=st.send.bind(st);st.send=async msg=>{outgoing.push(msg);return send(msg);};
 await Promise.all([ct.send({jsonrpc:'2.0',id:777,method:'tools/call',params:{name:'quineling_v1_run',arguments:request}}),ct.send({jsonrpc:'2.0',method:'notifications/cancelled',params:{requestId:777}})]);await new Promise<void>(r=>setImmediate(r));assert.deepEqual(outgoing,[]);assert.deepEqual(session.exportSnapshot().records,[]);
 const handler=(server as any)._registeredTools.quineling_v1_run.handler,abort=new AbortController();abort.abort();mcpError(await handler(request,{signal:abort.signal}),'cancelled');assert.deepEqual(session.exportSnapshot().receipts,[]);assert.equal(mcpResult(await client.callTool({name:'quineling_v1_run',arguments:request})).result.status,'completed');
 });
});

test('official MCP stdio v1 CLI emits only protocol output',async()=>{
 const client=new Client({name:'v1-stdio',version:'1'}),cli=fileURLToPath(new URL('../src/v1-mcp-cli.ts',import.meta.url)),transport=new StdioClientTransport({command:process.execPath,args:['--import','tsx',cli],cwd:fileURLToPath(new URL('..',import.meta.url)),stderr:'pipe'});let stderr='';transport.stderr?.on('data',data=>stderr+=data.toString());try{await client.connect(transport);assert.equal((await client.listTools()).tools.length,8);assert.equal(mcpResult(await client.callTool({name:'quineling_v1_describe',arguments:{}})).persistence,'memory');}finally{await client.close();}assert.doesNotMatch(stderr,/Unhandled|Error:/);
});

test('real A2A HTTP discovery, official client and two sessions preserve source pins and explicit runs',async()=>{
 const first=await http(),second=await http();try{const card=await(await fetch(first.base+'/.well-known/agent-card.json',{headers:{'A2A-Version':'1.0'}})).json() as any;assert.deepEqual(card.skills.map((x:any)=>x.id).sort(),['v1-build','v1-inspect','v1-run']);assert(card.description.includes('Single-owner'));assert(card.supportedInterfaces.some((i:any)=>i.protocolBinding==='HTTP+JSON'&&i.protocolVersion==='1.0'));
 const official=await new ClientFactory().createFromUrl(first.base);const made=await official.sendMessage(SendMessageRequest.fromJSON(message({operation:'compile',intent:fixture()})));assert('status'in made);const task=Task.toJSON(made) as any,artifact=taskPayload(task).result;assert.equal(task.status.state,'TASK_STATE_COMPLETED');assert.deepEqual(first.session.exportSnapshot().records,[]);
 const inspect=await rpc(first.base,'SendMessage',message({operation:'inspect',artifactId:artifact.id}));assert.equal(taskPayload(inspect.result.task).result.source,artifact.source);assert.equal(taskPayload((await rpc(first.base,'SendMessage',message({operation:'verify',artifactId:artifact.id}))).result.task).result.sourceHash,artifact.id);
 const foreign=await rpc(second.base,'SendMessage',message({operation:'inspect',artifactId:artifact.id}));taskError(foreign.result.task,'unknown-artifact');const recovered=await rpc(second.base,'SendMessage',message({operation:'recover',recovery:{colors:artifact.colors}}));assert.equal(taskPayload(recovered.result.task).result.id,artifact.id);assert.deepEqual(second.session.exportSnapshot().records,[]);
 const request={operation:'run',artifactId:artifact.id,requestId:'one-observation',inputs:{counts:[5,9]}};const run=taskPayload((await rpc(first.base,'SendMessage',message(request))).result.task).result;assert.deepEqual(run.result.occurrences[0].outputs,[14]);assert.equal(run.result.sourceHash,artifact.id);assert.deepEqual(taskPayload((await rpc(first.base,'SendMessage',message(request))).result.task).result,run);
 const conflict=await rpc(first.base,'SendMessage',message({...request,inputs:{counts:[1]}}));taskError(conflict.result.task,'request-conflict');const other=taskPayload((await rpc(second.base,'SendMessage',message({...request,inputs:{counts:[2,4]}}))).result.task).result;assert.deepEqual(other.result.occurrences[0].outputs,[6]);assert.notEqual(other.result.inputHash,run.result.inputHash);
 const copied=taskPayload((await rpc(first.base,'SendMessage',message({operation:'reproduce',artifactId:artifact.id,recordId:run.id,requestId:'copy'}))).result.task).result;assert.equal(copied.parentRecordId,run.id);assert.deepEqual(copied.result.bindings,run.result.bindings);
 const snapshot=first.session.exportSnapshot(),restored=Session.fromSnapshot(snapshot);assert.equal(restored.run({artifactId:artifact.id,requestId:'one-observation',inputs:{counts:[5,9]}}).evidence,'asserted');assert.equal(restored.inspect(artifact.id).source,artifact.source);
 }finally{await first.close();await second.close();}
});

test('A2A computed-failed Run is retained result; English clarification never computes and can resume',async()=>{
 const s=await http();try{const text=await rpc(s.base,'SendMessage',message('please gather inventory',true)),task=text.result.task;assert.equal(task.status.state,'TASK_STATE_INPUT_REQUIRED');assert.deepEqual(s.session.exportSnapshot().records,[]);assert.deepEqual(s.session.exportSnapshot().artifacts,[]);
 const malformed=await rpc(s.base,'SendMessage',message({operation:'run',artifactId:'invalid',requestId:'x',inputs:{}},false,task.id));assert.equal(malformed.result.task.status.state,'TASK_STATE_INPUT_REQUIRED');assert.equal(malformed.result.task.status.message.metadata.qdlError.code,'invalid-input');
 const resumed=await rpc(s.base,'SendMessage',message({operation:'compile',intent:divide()},false,task.id)),artifact=taskPayload(resumed.result.task).result;assert.equal(resumed.result.task.id,task.id);assert.equal(resumed.result.task.status.state,'TASK_STATE_COMPLETED');
 const failed=await rpc(s.base,'SendMessage',message({operation:'run',artifactId:artifact.id,requestId:'failed-ratio',inputs:{n:9,d:0}}));assert.equal(failed.result.task.status.state,'TASK_STATE_COMPLETED');const run=taskPayload(failed.result.task).result;assert.equal(run.result.status,'failed');assert(run.result.occurrences[0].diagnostic);assert.equal(s.session.exportSnapshot().records.length,1);
 const cancel=await rpc(s.base,'CancelTask',{id:failed.result.task.id});assert.equal(cancel.error.code,-32002);const missing=await rpc(s.base,'CancelTask',{id:'missing'});assert.equal(missing.error.code,-32001);
 }finally{await s.close();}
});

test('A2A native REST and opt-in 0.3 envelopes accept the same explicit closed requests',async()=>{
 const s=await http();try{const legacy=await rpc(s.base,'message/send',{message:{kind:'message',messageId:randomUUID(),role:'user',parts:[{kind:'data',data:{operation:'describe'}}]}},'0.3');assert.equal(legacy.result.status.state,'completed');assert.equal(taskPayload(legacy.result).result.effects,'simulation-only');
 const response=await fetch(s.base+'/a2a/rest/message:send',{method:'POST',headers:{'content-type':'application/json','A2A-Version':'1.0'},body:JSON.stringify(message({operation:'describe'}))});assert.equal(response.status,200);assert.equal(taskPayload((await response.json() as any).task).result.format,'qdl-session');
 const bad=await rpc(s.base,'SendMessage',message({operation:'describe',extra:true}));taskError(bad.result.task,'invalid-input');assert.deepEqual(s.session.exportSnapshot().records,[]);
 }finally{await s.close();}
});

test('A2A pre-dispatch cancellation leaves keyed work unapplied and scoped identical task IDs independent',async()=>{
 const session=new Session(),artifact=session.compile(fixture()),executor=new V1Executor(session),busA=new DefaultExecutionEventBus(),busB=new DefaultExecutionEventBus(),states:TaskState[]=[];busA.on('event',event=>{if(event.kind==='statusUpdate'&&event.data.status)states.push(event.data.status.state);});
 const req=(key:string)=>SendMessageRequest.fromJSON(message({operation:'run',artifactId:artifact.id,requestId:key,inputs:{counts:[2,3]}}));const a=executor.execute(new RequestContext(req('cancelled'),'same','context',new ServerCallContext({tenant:'a'})),busA),b=executor.execute(new RequestContext(req('completed'),'same','context',new ServerCallContext({tenant:'b'})),busB);await executor.cancelTask('same',busA);await Promise.all([a,b]);assert.deepEqual(states,[TaskState.TASK_STATE_CANCELED]);assert.equal(session.exportSnapshot().records.length,1);assert.equal(session.exportSnapshot().records[0]!.requestId,'completed');assert.equal(session.run({artifactId:artifact.id,requestId:'cancelled',inputs:{counts:[2,3]}}).result.status,'completed');
});

test('A2A malformed HTTP and configured oversized requests refuse before Session mutation',async()=>{
 const s=await http(new Session(),{requestLimitBytes:1024});try{const malformed=await fetch(s.base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json'},body:'{'});assert.equal(malformed.status,400);const oversized=await fetch(s.base+'/a2a/jsonrpc',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({data:'x'.repeat(2000)})});assert.equal(oversized.status,413);assert.deepEqual(s.session.exportSnapshot().records,[]);assert.deepEqual(s.session.exportSnapshot().artifacts,[]);}finally{await s.close();}
});

test('official A2A streaming client observes submitted, working, artifact and completed events',async()=>{
 const s=await http();try{const client=await new ClientFactory().createFromUrl(s.base),states:TaskState[]=[],kinds:string[]=[];for await(const event of client.sendMessageStream(SendMessageRequest.fromJSON(message({operation:'describe'})))){const item=event.payload;assert(item);kinds.push(item.$case);if(item.$case==='task'&&item.value.status)states.push(item.value.status.state);if(item.$case==='statusUpdate'&&item.value.status)states.push(item.value.status.state);if(item.$case==='artifactUpdate'){const part=item.value.artifact?.parts[0];assert.equal(part?.content?.$case,'data');}}
 assert.deepEqual(states,[TaskState.TASK_STATE_SUBMITTED,TaskState.TASK_STATE_WORKING,TaskState.TASK_STATE_COMPLETED]);assert(kinds.includes('artifactUpdate'));assert.deepEqual(s.session.exportSnapshot().records,[]);
 }finally{await s.close();}
});

test('MCP advertised output schema refuses an invalid successful response',async()=>{
 const session=new Session();session.dispatch=(()=>({format:'wrong-descriptor'})) as any;await withMcp(session,async client=>{const response=await client.callTool({name:'quineling_v1_describe',arguments:{}});assert.equal(response.isError,true);assert.equal(response.structuredContent?.error.code,'invalid-input');assert.deepEqual(session.exportSnapshot().records,[]);});
});
