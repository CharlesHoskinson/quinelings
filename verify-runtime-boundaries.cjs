'use strict';
const assert=require('node:assert/strict'),K=require('./kernels'),Q=require('./core'),D=require('./qdl'),A=require('./anatomy');
assert.throws(()=>K.calculate('weightedMean',[[1e-308,1e-308],[1e308,1e308]],{}),/finite/i);
const graph={version:1,nodes:[{id:'data',op:'literal',inputs:[],params:{value:Array(450).fill('x'.repeat(80))}}],outputs:['data']};
K.validate(graph);
assert.throws(()=>Q.makeTaskProgram(graph),/Complete quine source exceeds/);
const small={version:1,nodes:[{id:'data',op:'literal',inputs:[],params:{value:[2,3,4]}},{id:'sum',op:'sum',inputs:['data'],params:{}}],outputs:['sum']};
const d=D.create(),generated=A.generate(small,14);d.anatomy=generated.anatomy;d.motion.gesture=generated.gesture;
assert.equal(D.validateBindings(d,small),true);
const source=Q.makeTaskProgram(small,1,d),canonical=Q.canon(source);
for(let i=0,current=source;i<3;i++){const run=Q.execute(current);assert.deepEqual(run.tasks[0].output,[9]);assert.equal(run.emitted[0],canonical);current=JSON.parse(run.emitted[0]);}
assert.equal(Q.canon(Q.decode(Q.encode(source))),canonical);
assert.equal(Q.canon(Q.decodeColors(Q.encodeColors(source))),canonical);
const bad=structuredClone(d);bad.anatomy.owners[0].node='unknown';assert.throws(()=>Q.makeTaskProgram(small,1,bad),/unknown owner/);
const missing=structuredClone(d);delete missing.motion.gesture;assert.throws(()=>D.validate(missing),/authored gesture/);
const orphan=D.create();orphan.motion.gesture=generated.gesture;assert.throws(()=>D.validate(orphan),/requires assembly/);
console.log('Runtime boundaries: weighted overflow, complete-source admission, assembly binding and three source-preserving generations passed.');
