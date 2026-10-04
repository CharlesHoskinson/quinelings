import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {Runtime,QuinelingError,type Intent} from '../src/index.js';
import {createQuinelingMcpServer} from '../src/mcp.js';
const Q=createRequire(import.meta.url)('../../../core.js');
const size=(v:unknown)=>Buffer.byteLength(JSON.stringify(v));
const resource=(message:string)=>(e:unknown)=>e instanceof QuinelingError&&e.code==='resource-limit'&&e.message.includes(message);
function amplified(r:Runtime,copies=60,value='x'.repeat(16000)){
 const steps:Intent['steps']=[];let previous='value';
 for(let i=0;i<copies;i++){const id='copy'+i;steps.push({id,op:'choose',inputs:['flag',previous,'value'],params:{}});previous=id;}
 return r.compile({format:'quineling-intent',name:'record-amplification',thought:'Explicit inert clone chain',inputs:[{id:'flag',value:true,type:{kind:'boolean'}},{id:'value',value,type:{kind:'string'}}],steps,outputs:[previous]},{repeats:2});
}
function small(r:Runtime){const x=r.create('[1,2] | sum');assert.equal(x.status,'supported');if(x.status!=='supported')throw Error('Expected supported');return x.artifact;}
test('57 KiB source amplifies beyond 11 MiB; refusal leaves record capacity available',()=>{
 const r=new Runtime({maxRecords:1}),a=amplified(r);
 assert(Buffer.byteLength(a.source)>55000&&Buffer.byteLength(a.source)<65536);
 assert(size(Q.execute(a.program))>11*1024*1024);
 const before=r.inspect(a.id);assert.throws(()=>r.run(a.id),resource('2 MiB'));assert.deepEqual(r.inspect(a.id),before);
 const b=small(r),record=r.run(b.id);assert.deepEqual(record.result.tasks[0]?.output,[3]);assert(size(record)<=2*1024*1024);
 assert.throws(()=>r.run(b.id),resource('store is full'));
});
test('official MCP oversized run refuses before publication and successful envelopes fit',async()=>{
 const r=new Runtime({maxRecords:2}),large=amplified(r),valid=amplified(r,8,'"\\'.repeat(4000));
 const server=createQuinelingMcpServer(r),client=new Client({name:'run-budget-test',version:'1'});
 const [ct,st]=InMemoryTransport.createLinkedPair();await server.connect(st);await client.connect(ct);
 try{
  const refused=await client.callTool({name:'quineling_run',arguments:{artifactId:large.id}});assert.equal(refused.isError,true);assert.match(JSON.stringify(refused.structuredContent),/Execution record exceeds 2 MiB/);
  const run=await client.callTool({name:'quineling_run',arguments:{artifactId:valid.id}});assert.notEqual(run.isError,true,JSON.stringify(run.content));assert(size(run)<8*1024*1024,'complete text + structured envelope fits');
  const record=(run.structuredContent as any).result;
  const child=await client.callTool({name:'quineling_reproduce',arguments:{artifactId:valid.id,recordId:record.id}});assert.notEqual(child.isError,true,JSON.stringify(child.content));assert(size(child)<8*1024*1024,'artifact + duplicated record envelopes fit');assert.equal((child.structuredContent as any).result.record.parentRecordId,record.id);
 }finally{await client.close();await server.close();}
});
test('aggregate bytes refuse before publication, including reproduction',()=>{
 const r=new Runtime({maxRecords:128}),a=amplified(r,8),b=small(r);let bytes=0,first:string|undefined,count=0;
 while(true){try{const record=r.run(a.id);bytes+=size(record);first??=record.id;count++;}catch(e){assert(resource('64 MiB')(e));break;}}
 assert(count>1&&count<128);assert(bytes<=64*1024*1024);assert(first);
 const before=r.inspect(a.id);assert.throws(()=>r.reproduce(a.id,first!),resource('64 MiB'));assert.deepEqual(r.inspect(a.id),before);
 assert.deepEqual(r.run(b.id).result.tasks[0]?.output,[3],'failed large publication leaves byte capacity usable');
});
