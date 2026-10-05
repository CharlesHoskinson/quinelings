'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),T=require('../thought.js'),W=require('../woven-body.js'),C=require('../visual-capsule.js'),D=require('../qdl.js'),Q=C.runtime;
const supplied=process.argv.indexOf('--seed');
const seed=supplied<0?crypto.randomBytes(4).readUInt32LE():Number(process.argv[supplied+1]);
assert.ok(Number.isInteger(seed)&&seed>=0&&seed<=4294967295,'Seed must be uint32');
let state=seed;
function rand(){state=(state+0x6D2B79F5)>>>0;let n=state;n=Math.imul(n^(n>>>15),n|1);n^=n+Math.imul(n^(n>>>7),n|61);return ((n^(n>>>14))>>>0)/4294967296;}
const integer=(lo,hi)=>lo+Math.floor(rand()*(hi-lo+1)),json=JSON.stringify;
const values=Array.from({length:5},()=>integer(10,70)),weights=values.map(()=>integer(1,4));
const signal=Array.from({length:6},()=>integer(1,9));
const available=integer(8,15),requests=['fern','moss','sage'].map(id=>({id,amount:integer(4,9)}));
let remaining=available;
const grants=requests.map(({id,amount})=>{const granted=Math.min(remaining,amount);remaining-=granted;return {id,requested:amount,granted};});
const blocked=rand()<.5?'B':'C',through=blocked==='B'?'C':'B';
const a=integer(2,5),b=integer(2,5),c=integer(2,5),d=integer(1,4),end=Math.max(a+b,c)+d;
const roads={A:['B','C'],B:['D'],C:['D'],D:[]};
const jobs=[{id:'prepare',depends:[],duration:a},{id:'weave',depends:['prepare'],duration:b},{id:'gather',depends:[],duration:c},{id:'finish',depends:['weave','gather'],duration:d}];
const recipes=[
 {id:'tideglass',name:'Tideglass',description:'Balances five water readings, giving each its supplied weight.',thought:`weighted mean ${json(values)} weights ${json(weights)} L`,expected:[values.reduce((n,v,i)=>n+v*weights[i],0)/weights.reduce((n,v)=>n+v,0)],domain:[0,100],cases:[{label:'equal readings',overrides:{values:values.map(()=>1)},expected:[1]},{label:'zero weight',overrides:{weights:weights.map(()=>0)},fails:true}]},
 {id:'emberfold',name:'Emberfold',description:'Squares six signal values and adds them into an energy score.',thought:`${json(signal)} | square | sum | report energy`,expected:[{energy:signal.reduce((n,v)=>n+v*v,0)}],cases:[{label:'small signal',overrides:{value:[1,2]},expected:[{energy:5}]},{label:'empty signal',overrides:{value:[]},expected:[{energy:0}]}]},
 {id:'mosswell',name:'Mosswell',description:'Shares a limited water supply among three plants in request order.',thought:`allocate ${available} L to ${json(requests)}`,expected:[{grants,remaining}],cases:[{label:'no water',overrides:{available:0},expected:[{grants:requests.map(x=>({id:x.id,requested:x.amount,granted:0})),remaining:0}]},{label:'ample water',overrides:{available:100},expected:[{grants:requests.map(x=>({id:x.id,requested:x.amount,granted:x.amount})),remaining:100-requests.reduce((n,x)=>n+x.amount,0)}]}]},
 {id:'threadwing',name:'Threadwing',description:`Finds a route around closed street ${blocked} and proposes a walk.`,thought:`route A to D in ${json(roads)} blocked ${json([blocked])} | simulate "walk-route"`,expected:[{status:'simulated',action:'walk-route',payload:['A',through,'D']}],cases:[{label:'both routes closed',overrides:{blocked:['B','C']},expected:[{status:'skipped',action:'walk-route',payload:[]}]},{label:'all streets open',overrides:{blocked:[]},expected:[{status:'simulated',action:'walk-route',payload:['A','B','D']}]}]},
 {id:'hourbloom',name:'Hourbloom',description:'Schedules four jobs, letting independent work overlap before the final step.',thought:`schedule ${json(jobs)} s`,expected:[{order:['prepare','weave','gather','finish'],jobs:[{id:'prepare',start:0,end:a},{id:'weave',start:a,end:a+b},{id:'gather',start:0,end:c},{id:'finish',start:Math.max(a+b,c),end}],makespan:end}],cases:[{label:'no jobs',overrides:{jobs:[]},expected:[{order:[],jobs:[],makespan:0}]},{label:'cyclic jobs',overrides:{jobs:[{id:'a',depends:['b'],duration:1},{id:'b',depends:['a'],duration:1}]},fails:true}]}
];
const manifest=[];
for(const recipe of recipes){
 const parsed=T.parse(recipe.thought);assert.equal(parsed.status,'supported',JSON.stringify(parsed.diagnostics));parsed.intent.name=recipe.name;
 // Structural task differences, rather than portrait assignments, exercise the grammar.
 if(recipe.id==='mosswell'){
  const allocation=parsed.intent.outputs[0];
  parsed.intent.steps.push({id:'remainingStock',op:'get',inputs:[allocation],params:{path:'remaining'}},{id:'stockSummary',op:'report',inputs:[allocation,'available','remainingStock'],params:{labels:['allocation','available','remaining']}});
  parsed.intent.outputs=['stockSummary'];
  const wrap=(out,stock)=>[{allocation:out[0],available:stock,remaining:out[0].remaining}];
  recipe.expected=wrap(recipe.expected,available);for(const f of recipe.cases)if(!f.fails)f.expected=wrap(f.expected,f.overrides.available??available);
  recipe.description+=' It also reports the starting and remaining stock.';
 }
 if(recipe.id==='hourbloom'){
  const plan=parsed.intent.outputs[0];
  parsed.intent.inputs.push({id:'simulationAllowed',value:true,type:{kind:'boolean'}});
  parsed.intent.steps.push({id:'scheduleProposal',op:'action',inputs:['simulationAllowed',plan],params:{allowed:true,action:'schedule-proposal'}});
  parsed.intent.outputs=[plan,'scheduleProposal'];
  const wrap=out=>[out[0],{status:'simulated',action:'schedule-proposal',payload:out[0]}];recipe.expected=wrap(recipe.expected);for(const f of recipe.cases)if(!f.fails)f.expected=wrap(f.expected);
  recipe.description+=' The schedule proposal is a local simulation.';
 }
 const result=T.compile(parsed.intent),graph=structuredClone(result.graph);delete graph.design;
 // Local pipeline inputs have a generated name. Resolve the supplied array by its value.
 if(recipe.id==='emberfold')for(const fixture of recipe.cases){const input=graph.nodes.find(n=>n.op==='literal'&&json(n.params.value)===json(signal));fixture.overrides={[input.id]:fixture.overrides.value};}
 const bodySeed=integer(0,4294967295),design=D.create('filament');design.woven=W.author(graph,bodySeed);Object.assign(design.composition,{yaw:0,pitch:0,lean:0});design.chroma.strength=.35;
 if(recipe.domain)design.chroma.lens={kind:'scalar',id:'output',label:'Recorded water reading',unit:'L',domain:recipe.domain,bindings:[{node:graph.outputs[0],path:[]}]};
 const program=Q.makeTaskProgram(graph,1,design),source=Q.canon(program);
 const fixtures=[{label:'generated inputs',overrides:{},expected:recipe.expected},...recipe.cases];
 for(const fixture of fixtures){if(fixture.fails)assert.throws(()=>Q.runTask(graph,fixture.overrides),undefined,fixture.label);else assert.deepEqual(Q.runTask(graph,fixture.overrides).output,fixture.expected,recipe.id+': '+fixture.label);}
 let fresh=program;
 for(let generation=0;generation<3;generation++){const run=Q.execute(fresh);assert.deepEqual(run.tasks[0].output,recipe.expected);assert.equal(run.emitted[0],source);fresh=JSON.parse(run.emitted[0]);}
 assert.equal(Q.canon(Q.decode(Q.encode(program))),source);assert.equal(Q.canon(Q.decodeColors(Q.encodeColors(program))),source);
 const artifact={format:'quineling-artifact',id:recipe.id,name:recipe.name,description:recipe.description,thought:recipe.thought,program,source,graph,design,contract:result.contract,sourceMap:result.sourceMap,candidate:null,interpretation:{summary:recipe.description,assumptions:result.contract.assumptions||[]},generation:{batchSeed:seed,bodySeed},fixtures};
 const directory=path.join(root,'programs/generated');fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,recipe.id+'.json'),JSON.stringify(artifact,null,2)+'\n');
 manifest.push({id:recipe.id,name:recipe.name,description:recipe.description,thought:recipe.thought});
 console.log(`${recipe.name}: ${json(recipe.expected)}; three fixtures, three generations and both genomes verified.`);
}
fs.writeFileSync(path.join(root,'programs/generated/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Batch seed: '+seed);
