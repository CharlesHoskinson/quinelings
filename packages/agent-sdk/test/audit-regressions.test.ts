import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Runtime,type Intent} from '../src/index.js';
const strings=(count:number,width:number):Intent=>({format:'quineling-intent',name:'Data',thought:'Return these strings',inputs:[{id:'data',value:Array(count).fill('x'.repeat(width)),type:{kind:'array',element:{kind:'string'}}}],steps:[],outputs:['data']});
test('compiler and constructor source overflows preserve source-budget classification',()=>{
 const r=new Runtime();assert.throws(()=>r.compile(strings(420,80)),{code:'source-budget'});
 assert.throws(()=>r.compile(strings(8,16000)),{code:'source-budget'});
 assert.throws(()=>r.compile(strings(9,16000)),{code:'resource-limit',path:'$.intent'});
 assert.throws(()=>r.create('plan '+JSON.stringify(strings(3,12000))),{code:'invalid-input'}); // text admission has its own 16K-character limit
});
test('inert JSON and frame failures identify the offending field before executing anything',()=>{
 const r=new Runtime();const intent=strings(1,1);intent.inputs[0]!.value=NaN;
 assert.throws(()=>r.compile(intent),{code:'invalid-input',path:'$.inputs[0].value'});
 assert.throws(()=>r.dispatch({operation:'compile',intent:123} as never),{code:'invalid-input'});
 const a=r.create('[2] | sum');if(a.status!=='supported')throw Error('unsupported');
 assert.throws(()=>r.frame(a.artifact.id,NaN),{path:'$.phase'});
 assert.throws(()=>r.frame(a.artifact.id,0,{budget:3999}),{path:'$.options.budget'});
 assert.throws(()=>r.frame(a.artifact.id,0,{crests:5}),{path:'$.options.crests'});
});
test('stored AST and fresh reproduction are the canonical emitted source',()=>{
 const r=new Runtime();const p=r.parse('[-0,2] | sum');if(p.status!=='supported')throw Error('unsupported');p.intent.inputs[0]!.value=[-0,2];
 const a=r.compile(p.intent);assert.deepEqual(a.program,JSON.parse(a.source));
 const parent=r.run(a.id),child=r.reproduce(a.id,parent.id);assert.deepEqual(child.record.result.tasks,parent.result.tasks);assert.deepEqual(child.artifact.program,JSON.parse(parent.result.emitted[0]!));
});
