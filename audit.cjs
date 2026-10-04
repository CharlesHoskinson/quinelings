'use strict';
// Independent contract checks. Expected values below are not computed by kernels.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Q = require('./core.js');
let passed = 0, failed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log(`PASS ${name}`); }
  catch (e) { failed++; console.error(`FAIL ${name}: ${e.message}`); }
}
const copy = x => JSON.parse(JSON.stringify(x));
const literal = (id, value) => ({id, op:'literal', inputs:[], params:{value}});
const node = (id, op, inputs, params={}) => ({id, op, inputs, params});
const graph = (nodes, outputs) => ({version:1, name:'independent audit', nodes, outputs});
function task(op, values, params={}) {
  return graph([...values.map((v,i)=>literal(`v${i}`,v)), node('result',op,values.map((_,i)=>`v${i}`),params)], ['result']);
}
function output(op, values, params={}) { return Q.runTask(task(op,values,params)).output[0]; }
const equal = (a,b) => assert.deepEqual(a,b);
// Missing integration APIs must never count as successful validation rejection.
const rejects = fn => assert.throws(fn, e => !/is not a function/.test(e.message));

check('task public APIs present', () => {
  for (const key of ['makeTaskProgram','runTask','execute','describe']) assert.equal(typeof Q[key], 'function', key);
});
const base = graph([literal('numbers',[2,3,5]),node('total','sum',['numbers'])],['total']);
check('constructor identity, fresh generations and repeat count', () => {
  const ast = Q.makeTaskProgram(base,3), source = Q.canon(ast);
  for(let i=0, current=ast;i<4;i++) {
    const r=Q.execute(current);
    equal(r.emitted,[source]); assert.equal(r.tasks.length,3);
    r.tasks.forEach(t=>equal(t.output,[10])); current=JSON.parse(r.emitted[0]);
  }
});
check('closed constructor runs without filesystem, eval, process or network oracle', () => {
  // Only bootstrap loads interpreter files. The execution context has no require,
  // process, fetch, document, source argument, or dynamic code generation.
  const sandbox=vm.createContext({TextEncoder,TextDecoder}, {codeGeneration:{strings:false,wasm:false}});
  for(const file of ['orbit.js','kernels.js','qdl.js','core.js']) {
    const p=path.join(__dirname,file);
    if(fs.existsSync(p)) vm.runInContext(fs.readFileSync(p,'utf8'),sandbox,{timeout:1000});
  }
  sandbox.ast=copy(Q.makeTaskProgram(base,2));
  const result=vm.runInContext('Quinelings.execute(ast)',sandbox,{timeout:1000});
  equal(Array.from(result.emitted),[Q.canon(sandbox.ast)]);
});
check('task mutation cannot change emitted constructor source', () => {
  const ast=Q.makeTaskProgram(base), before=Q.canon(ast);
  const result=Q.execute(ast); result.tasks[0].output[0]=999;
  equal(Q.execute(ast).emitted,[before]); equal(Q.canon(ast),before);
});
check('quotation treats executable-looking text as inert data',()=>{
  const text='fetch("https://example.invalid"); process.exit(99)';
  const ast=Q.makeTaskProgram(graph([literal('text',text)],['text']));
  equal(Q.execute(ast).tasks[0].output,[text]);equal(Q.execute(ast).emitted,[Q.canon(ast)]);
});
check('term interpreter rejects unknown operations, unbound variables and malformed arity',()=>{
  for(const ast of [['eval','throw 1'],['var','absent'],['emit'],['repeat',9,['quote',0]]])rejects(()=>Q.execute(ast));
});
for(const repeats of [0,9,1.5,NaN]) check(`reject repeat budget ${repeats}`,()=>rejects(()=>Q.makeTaskProgram(base,repeats)));
check('runTask literal overrides preserve canonical source',()=>{
  const before=Q.canon(base), r=Q.runTask(base,{numbers:[10,-3]});
  equal(r.output,[7]); equal(Q.canon(base),before);
  rejects(()=>Q.runTask(base,{total:20})); rejects(()=>Q.runTask(base,{missing:20}));
});
check('DAG input order and requested output order',()=>{
  const g=graph([node('take','choose',['b','x','y']),literal('y','second'),literal('b',true),literal('x','first')],['y','take','x']);
  equal(Q.runTask(g).output,['second','first','first']);
});
check('disconnected effect node fires once',()=>{
  const g=graph([literal('guard',true),literal('payload',{amount:1}),node('a','action',['guard','payload'],{allowed:true,action:'local-only'})],['payload']);
  const r=Q.runTask(g); assert.equal(r.effects.length,1); assert.equal(r.effects[0].status,'simulated');
});
check('choose selects data; each action needs its own execution guard',()=>{
  const g=graph([literal('guard',true),literal('payload','fixture'),
    node('a','action',['guard','payload'],{allowed:true,action:'a'}),
    node('b','action',['guard','payload'],{allowed:true,action:'b'}),
    node('chosen','choose',['guard','a','b'])],['chosen']);
  const r=Q.runTask(g);assert.equal(r.output[0].action,'a');
  equal(r.effects.map(e=>e.action),['a','b']);
});
for(const [name,g] of [
  ['duplicate node IDs',graph([literal('x',1),literal('x',2)],['x'])],
  ['dangling dependency',graph([node('x','sum',['absent'])],['x'])],
  ['cycle',graph([node('x','length',['y']),node('y','length',['x'])],['x'])],
  ['unknown output',graph([literal('x',1)],['absent'])],
  ['unknown opcode',graph([node('x','eval',[],{value:'process.exit()'})],['x'])],
  ['65-node bound',graph(Array.from({length:65},(_,i)=>literal(`x${i}`,i)),['x0'])],
  ['513-entry literal bound',graph([literal('x',Array(513).fill(0))],['x'])],
  ['nonfinite literal',graph([literal('x',Infinity)],['x'])],
  ['wrong sum input type',task('sum',['123'])],
  ['wrong choose guard type',task('choose',[1,'a','b'])],
  ['wrong arity',graph([literal('a',[1]),node('x','sum',['a','a'])],['x'])]
]) check(`reject ${name}`,()=>rejects(()=>Q.runTask(g)));
check('sum empty and finite overflow rejection',()=>{equal(output('sum',[[]]),0);rejects(()=>output('sum',[[Number.MAX_VALUE,Number.MAX_VALUE]]));});
check('weighted mean rejects zero/negative/mismatched weights',()=>{
  equal(output('weightedMean',[[10,20],[1,3]]),17.5);
  for(const weights of [[0,0],[-1,2],[1]]) rejects(()=>output('weightedMean',[[10,20],weights]));
});
check('stable record sort and canonical dedupe',()=>{
  equal(output('sort',[[{id:'a',k:2},{id:'b',k:1},{id:'c',k:2}]],{key:'k'}),[{id:'b',k:1},{id:'a',k:2},{id:'c',k:2}]);
  equal(output('dedupe',[[{a:1,b:2},{b:2,a:1},{a:2}]]),[{a:1,b:2},{a:2}]);
});
check('sort descending parameter must be Boolean',()=>rejects(()=>output('sort',[[2,1]],{descending:'false'})));
check('invalid map kind rejected even on empty input',()=>rejects(()=>output('map',[[]],{kind:'execute'})));
check('invalid filter operator rejected even on empty input',()=>rejects(()=>output('filter',[[]],{operator:'execute',value:1})));
check('get requires record',()=>rejects(()=>output('get',[[7]],{path:'0'})));
check('blocked BFS IDs require strings',()=>rejects(()=>output('bfs',[{s:['g'],g:[]},[42]],{start:'s',goal:'g'})));
check('task JSON depth and string limits enforced',()=>{
  let nested=0;for(let i=0;i<26;i++)nested=[nested];
  rejects(()=>Q.runTask(graph([literal('deep',nested)],['deep'])));
  rejects(()=>Q.runTask(graph([literal('long','x'.repeat(16385))],['long'])));
});
check('own-property get rejects prototype traversal',()=>{
  equal(output('get',[{safe:{value:3}}],{path:'safe.value'}),3);
  for(const p of ['__proto__','constructor','toString','safe.constructor']) rejects(()=>output('get',[{safe:{}}],{path:p}));
});
check('budget conservation, no overcommit and nonnegative constraints',()=>{
  equal(output('budget',[3,9]),{allocated:3,remaining:0});
  equal(output('budget',[10,3]),{allocated:3,remaining:7});
  rejects(()=>output('budget',[-1,2])); rejects(()=>output('budget',[1,-2]));
  equal(output('allocate',[4,[{id:'a',amount:3},{id:'b',amount:3}]]),{grants:[{id:'a',requested:3,granted:3},{id:'b',requested:3,granted:1}],remaining:0});
  rejects(()=>output('allocate',[1.5,[]]));
});
check('guard AND permission, simulated receipts only',()=>{
  for(const guard of [false,true]) for(const allowed of [false,true]) {
    const r=Q.runTask(task('action',[guard,{message:'fixture'}],{allowed,action:'repair'}));
    equal(r.output,[{status:guard&&allowed?'simulated':'skipped',action:'repair',payload:{message:'fixture'}}]);
    assert.ok(r.effects.length<=1); if(guard&&allowed) assert.equal(r.effects.length,1);
  }
});
check('BFS stable shortest path, cycles and blocked endpoints',()=>{
  const adj={s:['a','b'],a:['s','g'],b:['g'],g:[]};
  equal(output('bfs',[adj,[]],{start:'s',goal:'g'}),{found:true,path:['s','a','g'],distance:2});
  equal(output('bfs',[adj,['s']],{start:'s',goal:'g'}),{found:false,path:[],distance:null});
  equal(output('bfs',[adj,[]],{start:'s',goal:'s'}),{found:true,path:['s'],distance:0});
});
check('schedule parallel earliest starts and cycle rejection',()=>{
  equal(output('schedule',[[{id:'a',depends:[],duration:3},{id:'b',depends:[],duration:2},{id:'c',depends:['a','b'],duration:1}]]),{order:['a','b','c'],jobs:[{id:'a',start:0,end:3},{id:'b',start:0,end:2},{id:'c',start:3,end:4}],makespan:4});
  rejects(()=>output('schedule',[[{id:'a',depends:['a'],duration:1}]]));
  rejects(()=>output('schedule',[[{id:'a',depends:['missing'],duration:1}]]));
});
check('consensus duplicate source cannot inflate quorum; stable tie',()=>{
  equal(output('consensus',[[{source:'a',choice:'yes'},{source:'a',choice:'yes'},{source:'b',choice:'no'}]],{required:2}),{choice:'yes',support:1,accepted:false,uniqueSources:2});
  equal(output('consensus',[[]],{required:1}),{choice:null,support:0,accepted:false,uniqueSources:0});
});
check('uncertain retry stops; finite retry budget; empty outcomes',()=>{
  equal(output('retry',[['retry','unknown','ok']],{maxAttempts:8}),{status:'uncertain',attempts:2,history:['retry','unknown']});
  equal(output('retry',[['retry','retry','ok']],{maxAttempts:2}),{status:'exhausted',attempts:2,history:['retry','retry']});
  equal(output('retry',[[]],{maxAttempts:1}),{status:'exhausted',attempts:0,history:[]});
  rejects(()=>output('retry',[['ok']],{maxAttempts:9}));
});
check('evidence deduplicates provenance and exposes conflict',()=>{
  equal(output('evidence',[[{source:'s',claim:'x',value:true},{source:'s',claim:'x',value:false},{source:'t',claim:'x',value:false}]],{claim:'x'}),{state:'conflict',support:1,refute:1,sources:2});
  equal(output('evidence',[[]]),{state:'unknown',support:0,refute:0,sources:0});
});
check('harmonic and RGB exact Unicode byte recovery',()=>{
  const ast=Q.makeProgram(.82,true,.7,1), text=['quote',{unicode:'🐚 café \u0000',ast}];
  equal(Q.decode(Q.encode(text)),text);
  equal(Q.decode(Q.fromSamples(Q.samples(Q.encode(text)))),text);
  equal(Q.decodeColors(Q.encodeColors(text)),text);
});
check('harmonic corruption, padding and unsupported sampled modes rejected',()=>{
  const g=Q.encode(['quote','test']), bad=copy(g);
  bad.bands[0][10]=(bad.bands[0][10]%256)+1; rejects(()=>Q.decode(bad));
  const pad=copy(g);pad.bands.at(-1)[31]=1;rejects(()=>Q.decode(pad));
  const sampled=Q.samples(g);sampled[0]=sampled[0].map(x=>x+1);rejects(()=>Q.fromSamples(sampled));
  const sparse=Q.samples(g); sparse[0][0]+=0.1;rejects(()=>Q.fromSamples(sparse));
});
check('RGB drift and opcode palette injectivity',()=>{
  const c=Q.encodeColors(['quote','test']); c.pixels[0][0][1]^=1; rejects(()=>Q.decodeColors(c));
  const colors=new Set();for(const op of Q.OPS){const color=Q.instructionColor(op);assert.ok(!colors.has(color));colors.add(color);equal(Q.instructionFromColor(color),op);}
  rejects(()=>Q.instructionFromColor('#000000'));
});
check('projection preserves ports and distinguishes task constants',()=>{
  const a=Q.describe(Q.makeTaskProgram(base)), b=Q.describe(Q.makeTaskProgram(graph([literal('numbers',[1]),node('total','sum',['numbers'])],['total'])));
  assert.equal(a.nodes.length,2);assert.ok(a.links.some(l=>l.from==='numbers'&&l.to==='total'&&l.port===0));
  assert.notEqual(Q.canon(a.nodes.map(n=>n.params)),Q.canon(b.nodes.map(n=>n.params)));
  for(const n of a.nodes) for(const phase of [0,1,100]) {const p=Q.nodePosition(n,phase,a);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}
});
console.log(`Audit: ${passed} passed, ${failed} failed`);
process.exitCode=failed?1:0;
