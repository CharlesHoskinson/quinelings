import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Runtime,type ParseResult} from '../src/index.js';
test('a large authentic color genome remains recoverable within the complete-source limit',()=>{
 const r=new Runtime();const value=Array(320).fill('x'.repeat(80));const a=r.compile({format:'quineling-intent',name:'Large finite data',thought:'Return the supplied finite strings.',inputs:[{id:'data',value,type:{kind:'array',element:{kind:'string'}}}],steps:[],outputs:['data']});assert(Buffer.byteLength(a.source)>40000);assert(Buffer.byteLength(a.source)<=65536);
 const restored=new Runtime().recover({colors:a.colors});assert.equal(restored.source,a.source);
});
test('compilation can attach the first explicitly supplied companion after passive recovery',()=>{
 const thought='[2,3,4] | sum',original=new Runtime().create(thought);if(original.status!=='supported')throw Error('unsupported');
 const r=new Runtime(),recovered=r.recover({source:original.artifact.source});assert.equal(recovered.intent,undefined);
 const compiled=r.create(thought);if(compiled.status!=='supported')throw Error('unsupported');assert(compiled.artifact.intent);assert(compiled.artifact.contract);assert.equal(compiled.artifact.id,recovered.id);assert.equal(recovered.intent,undefined);
});
test('optional configuration undefined behaves as absence without allowing data accessors',()=>{
 const r=new Runtime({maxArtifacts:undefined,maxRecords:undefined});const c=r.create('[2] | sum',{seed:undefined,repeats:undefined});assert.equal(c.status,'supported');if(c.status==='supported')r.frame(c.artifact.id,0,{budget:undefined,crests:undefined});
 let reads=0;const unsafe=Object.defineProperty({},'seed',{enumerable:true,get(){reads++;return 1;}});assert.throws(()=>r.create('[2] | sum',unsafe));assert.equal(reads,0);
});
test('proposal source maps are preserved only for actual graph nodes; diagnostics remain typed',async()=>{
 const r=new Runtime(),p=r.parse('[2,3] | sum');if(p.status!=='supported')throw Error('unsupported');const mapping=p.sourceMap.map(x=>({...x,clause:'An explicitly provided clause'}));
 const result=await r.propose('mapped',{async propose(){return {...p,sourceMap:mapping};}});if(result.status!=='supported')throw Error('unsupported');assert.deepEqual(result.artifact.sourceMap,mapping);
 const malformed={status:'clarify',assumptions:[12],sourceMap:[],diagnostics:[]} as unknown as ParseResult;await assert.rejects(r.propose('bad',{async propose(){return malformed;}}),{code:'invalid-input'});
});

test('cancellation finishes even when a provider ignores its signal; late completion admits nothing',async()=>{
 const r=new Runtime({maxArtifacts:1});const c=new AbortController();let finish!:(value:ParseResult)=>void;
 const held=new Promise<ParseResult>(resolve=>{finish=resolve;});
 const work=r.propose('waiting',{propose(){return held;}},{},c.signal);c.abort();
 await assert.rejects(work,{code:'cancelled'});finish(r.parse('[9] | sum'));await new Promise(resolve=>setImmediate(resolve));
 assert.equal(r.create('[2] | sum').status,'supported');
});
