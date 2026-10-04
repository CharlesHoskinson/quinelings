'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const T=require('./thought.js'),K=require('./kernels.js'),Q=require('./core.js');
const clone=x=>JSON.parse(JSON.stringify(x));let assertions=0;
function eq(a,b){assert.deepEqual(a,b);assertions++;}
function parsed(text){const p=T.parse(text);eq(p.status,'supported');return p.intent;}
function output(text,expected){const c=T.compile(parsed(text));eq(Q.runTask(c.graph).output,expected);return c;}
function rejects(intent,code){assert.throws(()=>T.compile(intent),e=>e.code===code);assertions++;}
const fixtures=[
 ['[2,3,4] | square | sum | report total',[{total:29}]],
 ['[8,2,8,4] | dedupe | sort desc | mean',[14/3]],
 ['[1,5,9] L | filter gt 3 | sum',[14]],
 ['4 L | clamp 0 3',[3]],
 ['weighted mean [24,36,60] weights [2,1,1] L',[36]],
 ['allocate 9 L to [{"id":"fern","amount":4},{"id":"sage","amount":7}]',[{grants:[{id:'fern',requested:4,granted:4},{id:'sage',requested:7,granted:5}],remaining:0}]],
 ['route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B"]',[{found:true,path:['A','C','D'],distance:2}]],
 ['schedule [{"id":"a","depends":[],"duration":2},{"id":"b","depends":["a"],"duration":3}] s',[{order:['a','b'],jobs:[{id:'a',start:0,end:2},{id:'b',start:2,end:5}],makespan:5}]],
 ['consensus [{"source":"a","choice":"yes"},{"source":"a","choice":"no"},{"source":"b","choice":"yes"}] required 2',[{choice:'yes',support:2,accepted:true,uniqueSources:2}]],
 ['evidence [{"source":"a","claim":"safe","value":true},{"source":"b","claim":"safe","value":false}] claim "safe"',[{state:'conflict',support:1,refute:1,sources:2}]],
 ['retry ["retry","unknown","ok"] max 3',[{status:'uncertain',attempts:2,history:['retry','unknown']}]],
 ['budget 4 for 7 L | get remaining',[0]],
 // Holdout compositions: no whole-task recipe exists for either sequence.
 ['[2,7,2,4,1] | filter gte 2 | dedupe | multiply 3 | sort desc | sum',[39]],
 ['[{"id":"a","urgent":true,"priority":2},{"id":"b","urgent":false,"priority":10},{"id":"a","urgent":true,"priority":9},{"id":"c","urgent":true,"priority":7}] | filter urgent eq true | dedupe id | sort priority desc | report queue',[{queue:[{id:'c',urgent:true,priority:7},{id:'a',urgent:true,priority:2}]}]],
 ['["a|b","a|b","c"] | dedupe | length',[2]],
 ['sum []',[0]]
];
const compiled=fixtures.map(([text,expected])=>output(text,expected));
for(const c of compiled.slice(0,5)){
 let ast=Q.makeTaskProgram(c.graph),source=Q.canon(ast);for(let generation=0;generation<3;generation++){const run=Q.execute(ast);eq(run.emitted,[source]);eq(run.tasks[0].output,Q.runTask(c.graph).output);ast=JSON.parse(run.emitted[0]);}
 eq(Q.canon(Q.decode(Q.encode(ast))),source);eq(Q.canon(Q.decodeColors(Q.encodeColors(ast))),source);eq(Q.canon(Q.decode(Q.fromSamples(Q.samples(Q.encode(ast))))),source);
}
const route='route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B","C"] | simulate "walk-route"';
const originalCalculate=K.calculate,originalRun=K.run,originalExecute=Q.execute;let actionCalls=0;
K.calculate=(op,...args)=>{if(op==='action'){actionCalls++;throw Error('Compiler evaluated an action');}return originalCalculate(op,...args);};
K.run=()=>{throw Error('Compiler called run');};Q.execute=()=>{throw Error('Compiler executed a program');};
const guarded=T.compile(parsed(route));eq(actionCalls,0);
K.calculate=originalCalculate;K.run=originalRun;Q.execute=originalExecute;
eq(Q.runTask(guarded.graph).effects,[]);eq(Q.runTask(guarded.graph).output,[{status:'skipped',action:'walk-route',payload:[]}]);
const active=T.compile(parsed(route.replace('["B","C"] |','["B"] |')));eq(Q.runTask(active.graph).effects.length,1);
const guardedReport=parsed(route+' | report receipt');eq(T.compile(guardedReport).contract.effectMode,'simulation');
eq(T.parse('[2,3] | square | sum').sourceMap,[{nodeId:'input',clause:'[2,3]'},{nodeId:'step1',clause:'square'},{nodeId:'step2',clause:'sum'}]);
const simple=parsed('[2,3] | sum');
function changed(fn){const x=clone(simple);fn(x);return x;}
rejects(changed(x=>x.unknown=true),'unknown-field');
rejects(changed(x=>x.steps[0].params.ignored='do not ignore'),'unknown-field');
rejects(changed(x=>x.steps[0].inputs=[]),'ports');
rejects(changed(x=>x.steps[0].inputs=['missing']),'reference');
rejects(changed(x=>x.inputs[0].value=[2,'three']),'type');
rejects(changed(x=>x.inputs[0].value=[NaN]),'finite');
rejects(changed(x=>x.inputs[0].value=[Infinity]),'finite');
rejects(changed(x=>x.inputs[0].value=[undefined]),'json');
rejects(changed(x=>x.inputs[0].value=Array(2)),'json');
rejects(changed(x=>x.steps[0].op='fetch'),'unsupported');
rejects(changed(x=>x.steps[0].inputs=['step1']),'disconnected');
rejects(changed(x=>x.inputs[0].type.element.unit='L and seconds'),'unit');
rejects(changed(x=>x.inputs[0].value[0]=()=>3),'json');
const cyc=changed(x=>{});cyc.inputs[0].value=cyc;rejects(cyc,'json');
const accessor=changed(x=>{});Object.defineProperty(accessor,'evil',{enumerable:true,get(){throw Error('Accessor executed');}});rejects(accessor,'json');
for(const text of ['[] | mean','weighted mean [1,2] weights [0,0]','weighted mean [1,2] weights [1]','weighted mean [1e-308,1e-308] weights [1e308,1e308]','allocate 2.5 L to [{"id":"a","amount":1}]','allocate 4 L to [{"id":"a","amount":1},{"id":"a","amount":2}]','allocate 9007199254740992 L to []','schedule [{"id":"a","depends":["b"],"duration":1},{"id":"b","depends":["a"],"duration":1}] s','[1e308] | square','[{"id":"x","amount":2},{"id":"y","amount":"bad"}] | filter amount gt 1'])eq(T.parse(text).status,'inconsistent');
for(const text of ['make my city happy','[1,2] | sum except the first','[1,2] | sum | dance','[1,2] |','sum','[1,2] litres please'])eq(T.parse(text).status,'clarify');
eq(T.parse('monitor continuously and send email').status,'unsupported');
eq(T.parse('plan '+JSON.stringify(simple)).intent,simple);eq(T.parse(JSON.stringify(simple)).intent,simple);
const wrongUnits=parsed('weighted mean [1,2] weights [1,1] L');wrongUnits.inputs[1].type.element.unit='s';rejects(wrongUnits,'unit-type');
const swap=parsed('allocate 9 L to [{"id":"x","amount":3}]');swap.steps[0].inputs.reverse();rejects(swap,'type');
const branch=clone(guardedReport);branch.inputs.push({id:'false',value:false,type:{kind:'boolean'}},{id:'harmless',value:{status:'skipped',action:'walk-route',payload:[]},type:{kind:'record',fields:{status:{kind:'string'},action:{kind:'string'},payload:{kind:'array',element:{kind:'string'}}}}});branch.steps.push({id:'pick',op:'choose',inputs:['false','step4','harmless'],params:{}});branch.outputs=['pick','step5'];rejects(branch,'eager-effect');
const badGuard=clone(guardedReport);badGuard.steps.find(n=>n.op==='action').inputs[0]='streets';rejects(badGuard,'disconnected');
const big={format:'quineling-intent',name:'Large source',thought:'Explicit strings',inputs:[0,1,2].map(i=>({id:'input'+i,value:'x'.repeat(12000),type:{kind:'string'}})),steps:[{id:'report',op:'report',inputs:['input0','input1','input2'],params:{labels:['a','b','c']}}],outputs:['report']};rejects(big,'source-budget');
const max=parsed('[1]');for(let i=0;i<63;i++){max.steps.push({id:'n'+i,op:'map',inputs:[i?'n'+(i-1):'input'],params:{kind:'multiply',factor:1}});}max.outputs=['n62'];eq(T.compile(max).graph.nodes.length,64);max.steps.push({id:'n63',op:'sum',inputs:['n62'],params:{}});max.outputs=['n63'];rejects(max,'budget');
eq(T.parse(JSON.stringify({...simple,inputs:[{...simple.inputs[0],value:Array(513).fill(1)}]})).status,'inconsistent');
const squared=T.compile(parsed('[2,3] L | square | sum'));eq(squared.contract.types.step2,{kind:'number',unit:'L^2'});
const unitsChanged=clone(simple);unitsChanged.inputs[0].type.element.unit='L';eq(Q.canon(T.compile(unitsChanged).graph),Q.canon(T.compile(simple).graph));assert.notEqual(Q.canon(T.compile(unitsChanged).contract),Q.canon(T.compile(simple).contract));assertions++;
const source=Q.canon(Q.makeTaskProgram(squared.graph)),shape=Q.describe(JSON.parse(source));for(const phase of [0,.5,2])Q.nodePosition(shape.nodes[0],phase,shape);eq(Q.canon(Q.makeTaskProgram(squared.graph)),source);
const context={QuinelingKernels:K,Quinelings:Q,TextEncoder};vm.createContext(context);vm.runInContext(fs.readFileSync('thought.js','utf8'),context);eq(context.ThoughtCompiler.parse('[2,3] | sum').status,'supported');
const declared=JSON.parse(fs.readFileSync('design/intent.schema.json','utf8'));eq(declared.properties.format.const,'quineling-intent');
console.log('Thought compiler: '+assertions+' assertions; independent outcomes, guarded effects, closed input, units, refinements, source budget, quine/codec recovery passed.');
