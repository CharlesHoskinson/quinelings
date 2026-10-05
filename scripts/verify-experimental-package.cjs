'use strict';
// Check a supplied candidate archive outside the repository. Never repack or
// overwrite the frozen SDK: the integrating release process selects the archive.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const cp=require('node:child_process'),assert=require('node:assert/strict');
assert(process.argv[2],'Pass the experimental SDK candidate archive explicitly.');
const archive=path.resolve(process.argv[2]);
assert(fs.existsSync(archive),'Candidate archive does not exist.');
const packageName=process.argv[3]||'@quinelings/agent-sdk-experimental';
assert(['@quinelings/agent-sdk-experimental','@quinelings/agent-sdk'].includes(packageName),'Unexpected candidate package name.');
const root=path.resolve(__dirname,'..');
const sandbox=fs.mkdtempSync(path.join(os.tmpdir(),'quinelings-experimental-consumer-'));
try {
  fs.writeFileSync(path.join(sandbox,'package.json'),JSON.stringify({private:true,type:'module'}));
  cp.execFileSync('npm',['install','--ignore-scripts','--no-audit','--no-fund',archive],{cwd:sandbox,stdio:'pipe'});
  const manifest=JSON.parse(fs.readFileSync(path.join(sandbox,'node_modules',packageName,'package.json'),'utf8'));
  assert.equal(manifest.name,packageName);
  const artifacts=['tideglass','emberfold','mosswell','threadwing','hourbloom'].map(id=>JSON.parse(fs.readFileSync(path.join(root,'programs/generated',id+'.json'),'utf8')));
  fs.writeFileSync(path.join(sandbox,'specimens.json'),JSON.stringify(artifacts));
  fs.writeFileSync(path.join(sandbox,'check.mjs'),`
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Runtime} from '${packageName}';
import {Session} from '${packageName}/v1';
import {VisualCapsule,MathematicalLifeforms} from '${packageName}/experimental';
import {createQuinelingMcpServer} from '${packageName}/mcp';
import {createA2AApp} from '${packageName}/a2a';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {ClientFactory} from '@a2a-js/sdk/client';
import {SendMessageRequest,Task} from '@a2a-js/sdk';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
const made=new Runtime().create('[2,3,4] | square | sum | report total');
assert.equal(made.status,'supported');
const capsule=VisualCapsule.author(made.artifact.source,42);
const legacy=VisualCapsule.execute(capsule.program);
assert.deepEqual(legacy.tasks[0].output,[{total:29}]);
assert.equal(legacy.emitted[0],capsule.source);
const stable=new Session().compile({format:'qdl-intent',version:1,name:'External total',thought:'Sum supplied readings.',inputs:[{id:'samples',name:'samples',type:{kind:'array',element:{kind:'number',unit:'L'}}}],steps:[{id:'total',op:'sum',inputs:['samples'],params:{}}],outputs:['total']});
const visual=VisualCapsule.author(stable.source,7);
for(const [samples,expected] of [[[2,3,4],9],[[8,9],17]]){
 const result=VisualCapsule.execute(visual.program,{bindings:{samples}});
 assert.deepEqual(result.occurrences[0].outputs,[expected]);
 assert.equal(result.emitted[0],visual.source);
 assert(Number.isFinite(result.steps));
}
assert.equal(visual.taskSource,stable.source);
assert.equal(VisualCapsule.verify(visual).source,visual.source);
for(const encoding of ['colors','harmonics'])assert.equal(VisualCapsule.recover(visual,encoding).source,visual.source);
const mechanisms=new Set();
for(const artifact of JSON.parse(readFileSync(new URL('./specimens.json',import.meta.url),'utf8'))){
 const admitted=VisualCapsule.admit(artifact.source);
 mechanisms.add(admitted.design.woven.mechanism);
 const body=MathematicalLifeforms.compile(admitted.design.woven,admitted.task);
 const frame=MathematicalLifeforms.frame(body,.6,{budget:2048});
 assert.equal(frame.points.length,8192);assert(frame.points.every(Number.isFinite));
 assert(frame.owners.every(owner=>owner<admitted.task.nodes.length));
 assert.equal(VisualCapsule.recover(admitted,'colors').source,artifact.source);
 let program=admitted.program;
 for(let generation=0;generation<3;generation++){
  const result=VisualCapsule.execute(program);
  assert.deepEqual(result.tasks[0].output,artifact.fixtures[0].expected);
  assert.equal(result.emitted[0],artifact.source);
  assert(Number.isFinite(result.steps));
  program=JSON.parse(result.emitted[0]);
 }
}
assert.equal(mechanisms.size,5);
for(const invalid of [null,[],{constructionOnly:'false'},{constructionOnly:1},{unknown:true},{constructionOnly:true,bindings:{samples:[1]}}])
 assert.throws(()=>VisualCapsule.execute(capsule.program,invalid));
const mcp=createQuinelingMcpServer(undefined,{experimentalVisual:true});
const client=new Client({name:'external-capsule-check',version:'1'});
const [serverTransport,clientTransport]=InMemoryTransport.createLinkedPair();
await mcp.connect(serverTransport);await client.connect(clientTransport);
try{
 const response=await client.callTool({name:'quineling_visual_run',arguments:{source:visual.source,bindings:{samples:[2,3,4]}}});
 assert(!response.isError,JSON.stringify(response));
 assert.deepEqual(response.structuredContent.result.occurrences[0].outputs,[9]);
}finally{await client.close();await mcp.close();}
const http=createServer();http.listen(0,'127.0.0.1');await once(http,'listening');
const base='http://127.0.0.1:'+http.address().port;
const {app,card}=createA2AApp({baseUrl:base,experimentalVisual:true});http.on('request',app);
try{
 assert(card.skills.some(skill=>skill.id==='experimental-visual'));
 const a2a=await new ClientFactory().createFromUrl(base);
 const response=await a2a.sendMessage(SendMessageRequest.fromJSON({message:{messageId:randomUUID(),role:'ROLE_USER',parts:[{data:{operation:'visualRun',source:visual.source,bindings:{samples:[8,9]}},mediaType:'application/json'}]}}));
 assert('status' in response);
 const result=Task.toJSON(response);
 assert.equal(result.status.state,'TASK_STATE_COMPLETED',JSON.stringify(result));
 assert.deepEqual(result.artifacts.at(-1).parts[0].data.result.occurrences[0].outputs,[17]);
}finally{http.closeAllConnections();await new Promise(resolve=>http.close(resolve));}
console.log('External candidate SDK: executable legacy and bound QDL1 capsules, both codecs, all five frame mechanisms.');
`);
  cp.execFileSync(process.execPath,['check.mjs'],{cwd:sandbox,stdio:'inherit'});
  fs.writeFileSync(path.join(sandbox,'consumer.ts'),`
import {VisualCapsule,MathematicalLifeforms} from '${packageName}/experimental';
export function inspect(source:string){
 const capsule=VisualCapsule.admit(source);
 const result=VisualCapsule.execute(capsule.program,{bindings:{samples:[2,3,4]}});
 const body=MathematicalLifeforms.compile(capsule.design.woven,capsule.task);
 const frame=MathematicalLifeforms.frame(body,.6,{budget:2048});
 const points:Float32Array=frame.points;
 const owners:Uint16Array=frame.owners;
 return {source:VisualCapsule.recover(capsule,'colors').source,steps:result.steps,points,owners};
}
`);
  cp.execFileSync(process.execPath,[path.join(root,'packages/agent-sdk/node_modules/typescript/bin/tsc'),'--noEmit','--target','ES2022','--module','NodeNext','--moduleResolution','NodeNext','--strict','--skipLibCheck','consumer.ts'],{cwd:sandbox,stdio:'inherit'});
  console.log('External consumer TypeScript import and declarations resolve.');
} finally {fs.rmSync(sandbox,{recursive:true,force:true});}
