'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),Q=require('./core.js'),V=require('./qdl-v1.js');
const manifest=require('./fixtures/qdl-v1/candidate/manifest.json'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');assert.equal(V.registryDigest,manifest.registryDigest,'Candidate pin changed: review source compatibility, never silently rebaseline');let fixtures=0;
for(const id of manifest.cases){const g=require('./fixtures/qdl-v1/candidate/'+id+'.json'),p=V.compile(g.intent),a=V.admit(p);assert.equal(a.source,g.source);assert.equal(a.sourceHash,g.sourceHash);assert.equal(hash(JSON.stringify(Q.encode(p))),g.harmonicHash);assert.equal(hash(JSON.stringify(Q.encodeColors(p))),g.colorHash);
 for(const f of g.fixtures){fixtures++;if(f.expectedStatus==='refused'){assert.throws(()=>V.execute(p,f.inputs),e=>e.code===f.expectedDiagnostic);continue;}const run=V.execute(p,f.inputs);assert.equal(run.status,f.expectedStatus??'completed');if(f.expectedOutputs)assert.deepEqual(run.occurrences[0].outputs,f.expectedOutputs);if(f.expectedDiagnostic)assert.equal(run.occurrences[0].diagnostic.code,f.expectedDiagnostic);assert.equal(run.emitted[0],g.source);}
}
console.log(JSON.stringify({status:'passed',registryDigest:manifest.registryDigest,sources:manifest.cases.length,independentFixtures:fixtures,node:process.version}));
