import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createQuinelingMcpServer } from '../src/mcp.js';
import { Runtime } from '../src/index.js';
import { IntentSchema, IntentTypeSchema, IntentStepSchema, JsonSchema } from '../src/schema.js';

function result(response: Awaited<ReturnType<Client['callTool']>>): any {
  assert.notEqual(response.isError,true,JSON.stringify(response.content));
  return (response.structuredContent as {result:unknown}).result;
}

function domainError(response: Awaited<ReturnType<Client['callTool']>>, code: string, path: string): void {
  assert.equal(response.isError,true);
  const structured=response.structuredContent as {error:{code:string;path:string;message:string}};
  assert.equal(structured.error.code,code);
  assert.equal(structured.error.path,path);
  assert.ok(structured.error.message.length>0);
  assert.deepEqual(response.content,[{type:'text',text:JSON.stringify(structured)}]);
}

test('official MCP client executes complete artifact lifecycle over paired transports', async () => {
  const server=createQuinelingMcpServer();
  const client=new Client({name:'quineling-mcp-test',version:'0.0.0'});
  const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const tools=await client.listTools();
    assert.equal(tools.tools.length,8);
    // Inspect the actual JSON Schema emitted by the official SDK, including recursive refs.
    const schema=tools.tools.find(t=>t.name==='quineling_compile')!.inputSchema as any;
    const intentSchema=schema.properties.intent;
    assert.deepEqual([...intentSchema.required].sort(),['format','name','thought','inputs','steps','outputs'].sort());
    assert.equal(intentSchema.properties.format.const,'quineling-intent');
    assert.equal(intentSchema.additionalProperties,false);
    function resolve(value:any):any {
      if(!value.$ref)return value;
      assert.ok(value.$ref.startsWith('#/'));
      return value.$ref.slice(2).split('/').reduce((node:any,part:string)=>node[part.replace(/~1/g,'/').replace(/~0/g,'~')],schema);
    }
    const typeRef=intentSchema.properties.inputs.items.properties.type;
    const typeSchema=resolve(typeRef),variants=typeSchema.oneOf||typeSchema.anyOf;
    const numberType=variants.find((v:any)=>v.properties.kind.const==='number');
    assert.deepEqual(numberType.required,['kind','unit']);
    assert.equal(numberType.properties.unit.type,'string');
    const arrayType=variants.find((v:any)=>v.properties.kind.const==='array');
    assert.equal(arrayType.properties.element.$ref,typeRef.$ref);
    const recordType=variants.find((v:any)=>v.properties.kind.const==='record');
    assert.equal(recordType.properties.fields.additionalProperties.$ref,typeRef.$ref);
    const steps=intentSchema.properties.steps.items.oneOf;
    assert.equal(steps.length,23);
    const allocation=steps.find((v:any)=>v.properties.op.const==='allocate');
    assert.equal(allocation.properties.inputs.minItems,2);
    assert.equal(allocation.properties.inputs.maxItems,2);
    assert.equal(allocation.properties.params.additionalProperties,false);
    const action=steps.find((v:any)=>v.properties.op.const==='action');
    assert.deepEqual(action.properties.params.required,['allowed','action']);
    const map=steps.find((v:any)=>v.properties.op.const==='map');
    assert.equal(map.properties.params.oneOf.length,2);
    // Every generated reference must resolve; schema generation must not leave cycles as opaque objects.
    function checkRefs(value:any):void {if(!value||typeof value!=='object')return;if(value.$ref)assert.ok(resolve(value));for(const item of Object.values(value))checkRefs(item);}
    checkRefs(schema);
    const recovery=tools.tools.find(t=>t.name==='quineling_recover')!.inputSchema as any;
    assert.equal(recovery.additionalProperties,false);
    assert.deepEqual(recovery.oneOf,[{required:['source']},{required:['harmonics']},{required:['colors']}]);
    const matchesAlternative=(args:Record<string,unknown>)=>recovery.oneOf.filter((branch:{required:string[]})=>branch.required.every(k=>Object.hasOwn(args,k))).length===1;
    assert.equal(matchesAlternative({}),false);
    assert.equal(matchesAlternative({source:'[]',harmonics:{}}),false);
    for(const key of ['source','harmonics','colors'])assert.equal(matchesAlternative({[key]:{}}),true);
    assert.equal(tools.tools.find(t=>t.name==='quineling_run')?.annotations?.readOnlyHint,false);
    assert.equal(tools.tools.find(t=>t.name==='quineling_frame')?.annotations?.readOnlyHint,true);
    assert.equal(tools.tools.find(t=>t.name==='quineling_recover')?.annotations?.readOnlyHint,false);
    const proposal=result(await client.callTool({name:'quineling_parse',arguments:{thought:'[2,3,4] | square | sum | report total'}}));
    assert.equal(proposal.status,'supported');
    const artifact=result(await client.callTool({name:'quineling_compile',arguments:{intent:proposal.intent}}));
    assert.ok(artifact.id);
    const inspected=result(await client.callTool({name:'quineling_inspect',arguments:{artifactId:artifact.id}}));
    assert.equal(inspected.source,artifact.source);
    const frame=result(await client.callTool({name:'quineling_frame',arguments:{artifactId:artifact.id,phase:0.5,options:{budget:4000,crests:2}}}));
    assert.ok(frame);
    const run=result(await client.callTool({name:'quineling_run',arguments:{artifactId:artifact.id}}));
    assert.deepEqual(run.result.tasks[0].output,[{total:29}]);
    assert.equal(run.source,artifact.source);
    const child=result(await client.callTool({name:'quineling_reproduce',arguments:{artifactId:artifact.id,recordId:run.id}}));
    assert.equal(child.artifact.source,artifact.source);
    assert.notEqual(child.record.id,run.id);
    assert.equal(child.record.parentRecordId,run.id);
    for(const encoding of ['harmonics','colors','source'] as const){
      const recovered=result(await client.callTool({name:'quineling_recover',arguments:{[encoding]:artifact[encoding]}}));
      assert.equal(recovered.source,artifact.source);
    }
    const ambiguous=result(await client.callTool({name:'quineling_create',arguments:{thought:'make my city happy'}}));
    assert.equal(ambiguous.status,'clarify');
    const missing=await client.callTool({name:'quineling_inspect',arguments:{artifactId:'missing'}});
    domainError(missing,'unknown-artifact','$');
    const extra=await client.callTool({name:'quineling_parse',arguments:{thought:'[2] | sum',ignored:'do not drop'}});
    assert.equal(extra.isError,true);
    const unsafe=await client.callTool({name:'quineling_compile',arguments:{intent:{...proposal.intent,authority:'root'}}});
    assert.equal(unsafe.isError,true); // Structural schema errors are owned by the MCP SDK.
    const malformedIntent=structuredClone(proposal.intent);
    malformedIntent.steps[0].params.ignored=true;
    const nested=await client.callTool({name:'quineling_compile',arguments:{intent:malformedIntent}});
    assert.equal(nested.isError,true);
    const wrongValue=structuredClone(proposal.intent);
    wrongValue.inputs[0].value[1]='not a number';
    domainError(await client.callTool({name:'quineling_compile',arguments:{intent:wrongValue}}),'invalid-intent','$.inputs.0.value.1');
    const multiple=await client.callTool({name:'quineling_recover',arguments:{source:artifact.source,harmonics:artifact.harmonics}});
    assert.equal(multiple.isError,true); // Exactly-one now rejects in the advertised SDK schema.
    const excessive=await client.callTool({name:'quineling_frame',arguments:{artifactId:artifact.id,phase:0,options:{budget:24001}}});
    assert.equal(excessive.isError,true);
  } finally {await client.close();await server.close();}
});

test('official stdio transport launches CLI with clean protocol output', async () => {
  const client=new Client({name:'quineling-stdio-test',version:'0.0.0'});
  const cli=fileURLToPath(new URL('../src/mcp-cli.ts',import.meta.url));
  const transport=new StdioClientTransport({command:process.execPath,args:['--import','tsx',cli],stderr:'pipe'});
  let stderr='';transport.stderr?.on('data',chunk=>{stderr+=chunk.toString();});
  try {
    await client.connect(transport);
    const parsed=result(await client.callTool({name:'quineling_parse',arguments:{thought:'[7,2] | sum'}}));
    assert.equal(parsed.status,'supported');
    assert.equal((await client.listTools()).tools.length,8);
    domainError(await client.callTool({name:'quineling_inspect',arguments:{artifactId:'missing'}}),'unknown-artifact','$');
  } finally {await client.close();}
  assert.doesNotMatch(stderr,/Unhandled|Error:/);
});


test('exported recursive intent schemas validate structure without executing a task',()=>{
  const quantity={kind:'number',unit:'L'} as const;
  const nested={kind:'record',fields:{samples:{kind:'array',element:{kind:'optional',element:quantity}}}};
  assert.deepEqual(IntentTypeSchema.parse(nested),nested);
  assert.equal(JsonSchema.safeParse({samples:[1,null,false,'value']}).success,true);
  assert.equal(JsonSchema.safeParse({value:Infinity}).success,false);
  assert.equal(JsonSchema.safeParse({value:NaN}).success,false);
  assert.equal(IntentTypeSchema.safeParse({kind:'number'}).success,false);
  assert.equal(IntentTypeSchema.safeParse({...quantity,scale:1000}).success,false);
  assert.equal(IntentStepSchema.safeParse({id:'x',op:'map',inputs:['source'],params:{kind:'square',factor:2}}).success,false);
  assert.equal(IntentStepSchema.safeParse({id:'x',op:'map',inputs:['source'],params:{kind:'multiply'}}).success,false);
  assert.equal(IntentStepSchema.safeParse({id:'x',op:'allocate',inputs:['one'],params:{}}).success,false);
  const action={format:'quineling-intent',name:'Structural simulation',thought:'Explicit local simulated action',inputs:[
    {id:'guard',value:true,type:{kind:'boolean'}},
    {id:'payload',value:'test',type:{kind:'string'}}
  ],steps:[{id:'act',op:'action',inputs:['guard','payload'],params:{allowed:true,action:'local-test'}}],outputs:['act']};
  assert.deepEqual(IntentSchema.parse(action),action);
  // Structural parsing accepts this arity-correct unresolved reference. Only Runtime.compile resolves graphs;
  // hence schema parsing cannot have executed the action or evaluated its inputs.
  const unresolved=structuredClone(action);unresolved.steps[0]!.inputs[0]='unresolved';
  assert.deepEqual(IntentSchema.parse(unresolved),unresolved);
});


test('JSON schema limits reject oversized records and excessive value/envelope nesting',()=>{
  assert.equal(JsonSchema.safeParse(Object.fromEntries(Array.from({length:512},(_,i)=>['k'+i,0]))).success,true);
  assert.equal(JsonSchema.safeParse(Object.fromEntries(Array.from({length:513},(_,i)=>['k'+i,0]))).success,false);
  let nested:unknown=0;for(let depth=0;depth<24;depth++)nested=[nested];
  assert.equal(JsonSchema.safeParse(nested).success,true);
  assert.equal(JsonSchema.safeParse([nested]).success,false);
  const input={format:'quineling-intent',name:'Deep input',thought:'Explicit data',inputs:[{id:'input',value:nested,type:{kind:'number',unit:'one'}}],steps:[],outputs:['input']};
  assert.equal(IntentSchema.safeParse(input).success,false);
});

type DirectHandler=(input:unknown,extra:{signal:AbortSignal})=>Promise<Awaited<ReturnType<Client['callTool']>>>;
function directHandler(server:ReturnType<typeof createQuinelingMcpServer>,name:string):DirectHandler{
  // Deliberately bypass SDK validation to exercise the adapter's own defensive boundary.
  return (server as unknown as {_registeredTools:Record<string,{handler:DirectHandler}>})._registeredTools[name]!.handler;
}

test('pre-cancelled MCP requests skip mutations and direct validation errors retain paths',async()=>{
  const runtime=new Runtime({maxRecords:1});
  const created=runtime.create('[1,2] | sum');assert.equal(created.status,'supported');
  if(created.status!=='supported')throw Error('Fixture did not compile');
  const server=createQuinelingMcpServer(runtime),controller=new AbortController();controller.abort();
  const run=directHandler(server,'quineling_run');
  domainError(await run({artifactId:created.artifact.id},{signal:controller.signal}),'cancelled','$');
  // If cancellation wrote a record, the only available slot would now be occupied.
  assert.deepEqual(runtime.run(created.artifact.id).result.tasks[0]!.output,[3]);
  const parse=directHandler(server,'quineling_parse'),live=new AbortController();
  domainError(await parse({thought:'[1]',extra:true},{signal:live.signal}),'invalid-input','$');
  domainError(await parse({thought:false},{signal:live.signal}),'invalid-input','$.thought');
  const recover=directHandler(server,'quineling_recover');
  domainError(await recover({},{signal:live.signal}),'invalid-input','$');
  await server.close();
});

test('same-turn MCP call plus cancellation does not dispatch or send a success envelope',async()=>{
  const runtime=new Runtime({maxRecords:1}),created=runtime.create('[5,7] | sum');
  if(created.status!=='supported')throw Error('Fixture did not compile');
  const server=createQuinelingMcpServer(runtime),client=new Client({name:'cancel-test',version:'0'});
  const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();
  const outgoing:unknown[]=[],originalSend=serverTransport.send.bind(serverTransport);
  serverTransport.send=async(message,options)=>{if('id'in message&&message.id===999999)outgoing.push(message);await originalSend(message,options);};
  await server.connect(serverTransport);await client.connect(clientTransport);
  try{
    // Both messages are delivered synchronously before SDK validation's next microtask.
    const call=clientTransport.send({jsonrpc:'2.0',id:999999,method:'tools/call',params:{name:'quineling_run',arguments:{artifactId:created.artifact.id}}});
    const cancel=clientTransport.send({jsonrpc:'2.0',method:'notifications/cancelled',params:{requestId:999999,reason:'test cancellation'}});
    await Promise.all([call,cancel]);await new Promise<void>(resolve=>setImmediate(resolve));
    assert.deepEqual(outgoing,[]);
    assert.deepEqual(runtime.run(created.artifact.id).result.tasks[0]!.output,[12]);
  }finally{await client.close();await server.close();}
});
