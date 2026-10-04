'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const Q=require('./core.js'),D=require('./qdl.js'),dir=path.join(__dirname,'fixtures/qdl-v1/legacy'),manifest=require('./fixtures/qdl-v1/legacy/manifest.json');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');assert.deepEqual(Q.OPS.slice(0,34),manifest.instructions);assert.deepEqual(Q.COLORS.slice(0,34),manifest.colors);
for(const row of manifest.cases){const g=JSON.parse(fs.readFileSync(path.join(dir,row.file))),original=JSON.parse(g.source);assert.equal('ql_'+hash(g.source),row.sourceHash);assert.deepEqual(Q.encode(original),g.harmonics);assert.deepEqual(Q.encodeColors(original),g.colors);assert.equal(hash(JSON.stringify(g.harmonics)),row.harmonicHash);assert.equal(hash(JSON.stringify(g.colors)),row.colorHash);
 if(row.id==='orbit-default')assert.equal(Q.canon(Q.makeProgram()),g.source);
 else if(row.id==='task-sum')assert.equal(Q.canon(Q.makeTaskProgram({version:1,nodes:[{id:'water',op:'literal',inputs:[],params:{value:[1,2,3]}},{id:'total',op:'sum',inputs:['water'],params:{}}],outputs:['total']})),g.source);
 else {const p=require('./programs/'+row.id+'.json');assert.equal(Q.canon(Q.makeTaskProgram(p.graph,1,D.forProgram(p))),g.source);}
 let program=original;for(let i=0;i<3;i++){const run=Q.execute(program);assert.deepEqual(run.emitted,g.emitted);assert.deepEqual(run.tasks?run.tasks.map(t=>t.output):[],g.outputs);assert.equal(run.steps,g.steps);program=JSON.parse(run.emitted[0]);}
 assert.equal(Q.canon(Q.decode(g.harmonics)),g.source);assert.equal(Q.canon(Q.decodeColors(g.colors)),g.source);
}
console.log(JSON.stringify({status:'passed',baseline:manifest.baseline,legacyGoldens:manifest.cases.length,completeSourcesAndGenomes:true,freshGenerations:manifest.cases.length*3,node:process.version}));

const inertMarker=['task',['quote',{format:'qdl-program',version:99}]],legacyMarker=Q.makeTaskProgram({version:1,nodes:[{id:'quoted',op:'literal',inputs:[],params:{value:inertMarker}}],outputs:['quoted']}),markerRun=Q.execute(legacyMarker);assert.deepEqual(markerRun.tasks[0].output,[inertMarker]);assert.equal(markerRun.emitted[0],Q.canon(legacyMarker));assert.equal(Q.describe(legacyMarker).graph.nodes[0].op,'literal');console.log('Quoted future-profile expression remains inert legacy data.');

assert.equal(require('./qdl-v1.js').isProgram(legacyMarker),false);
