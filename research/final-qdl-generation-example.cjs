'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const Q=require('../core.js'),D=require('../qdl.js'),M=require('../morphology.js'),C=require('../chroma.js');
const thought='Exclude dormant rooftop planters, distribute 9 litres in request order, and report each grant and the conserved reserve.';
const graph={version:1,name:'Rooftop planter reserve steward',nodes:[
{id:'water',op:'literal',inputs:[],params:{value:9}},
{id:'beds',op:'literal',inputs:[],params:{value:[{id:'fern',amount:4,active:true},{id:'moss',amount:5,active:false},{id:'sage',amount:7,active:true}]}},
{id:'eligible',op:'filter',inputs:['beds'],params:{key:'active',operator:'eq',value:true}},
{id:'grants',op:'allocate',inputs:['water','eligible'],params:{}},
{id:'reserve',op:'get',inputs:['grants'],params:{path:'remaining'}},
{id:'count',op:'length',inputs:['eligible'],params:{}},
{id:'ledger',op:'report',inputs:['grants','reserve','count'],params:{labels:['allocation','reserve','eligibleBeds']}}
],outputs:['ledger']};
Q.validateTask(graph);
const digest=crypto.createHash('sha256').update(Q.canon(graph)).digest(),depth=4,fanout=2;
// Existing QDL supports parameter novelty only: this is deliberately NOT a new grammar implementation.
const design=D.create('filament');
design.surface.ribbons=12+graph.nodes.length;design.surface.folds=2+depth;design.surface.spread=.11+digest[0]/255*.045;design.surface.taper=.7+digest[1]/255*.4;design.surface.twist=1+digest[2]/255*.5;design.surface.asymmetry=.15+digest[3]/255*.1;
design.composition.lean=-.16+digest[4]/255*.2;design.composition.focus=.32+digest[5]/255*.2;
design.motion.rhythm.breath=.04+digest[6]/255*.035;design.motion.rhythm.wave=.03+digest[7]/255*.03;
design.chroma.lens={kind:'scalar',id:'water-reserve',label:'Water reserve',unit:'L',domain:[0,9],threshold:2,bindings:[{node:'reserve',path:[]}]};
D.validateBindings(design,graph);
let ast=Q.makeTaskProgram(graph,1,design),source=Q.canon(ast);
const expected=[{allocation:{grants:[{id:'fern',requested:4,granted:4},{id:'sage',requested:7,granted:5}],remaining:0},reserve:0,eligibleBeds:2}];
let original;
for(let i=0;i<3;i++){const out=Q.execute(ast);assert.equal(out.emitted[0],source);assert.deepEqual(out.tasks[0].output,expected);assert.equal(out.tasks[0].effects.length,0);original=out;ast=JSON.parse(out.emitted[0]);}
assert.equal(Q.canon(Q.decode(Q.encode(ast))),source);assert.equal(Q.canon(Q.decodeColors(Q.encodeColors(ast))),source);
assert.equal(Q.canon(Q.decode(Q.fromSamples(Q.samples(Q.encode(ast))))),source);
const shape=Q.describe(ast);let finiteSamples=0;
for(const phase of [0,Math.PI/2,Math.PI,Math.PI*1.5])for(let k=0;k<4;k++)for(let i=0;i<=20;i++){const p=M.surfacePoint(shape,i/20,0,k,4,phase);assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));finiteSamples++;}
const lens=C.resolveLens(design,original.tasks[0]);assert.equal(lens.byNode.reserve.value,0);
const none=Q.runTask(graph,{water:0});assert.equal(none.output[0].reserve,0);assert(none.output[0].allocation.grants.every(x=>x.granted===0));
const dormant=Q.runTask(graph,{beds:[{id:'moss',amount:5,active:false}]});assert.equal(dormant.output[0].reserve,9);assert.equal(dormant.output[0].eligibleBeds,0);
const summary={thought,translation:'Manually authored typed interpretation, not automatic English compiler',availableNow:'New executable task + deterministic bounded parameters in an existing family',notImplemented:'Compositional novel anatomy grammar',graphSha256:crypto.createHash('sha256').update(Q.canon(graph)).digest('hex'),nodes:graph.nodes.length,finiteSurfaceSamples:finiteSamples,verifiedFreshGenerations:3,harmonicRecovery:true,sampledHarmonicRecovery:true,colorRecovery:true,simulatedEffects:0,output:expected};
fs.writeFileSync(__dirname+'/final-qdl-generation-program.json',JSON.stringify({thought,graph,design,ast},null,2)+'\n');
fs.writeFileSync(__dirname+'/final-qdl-generation-results.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary,null,2));
