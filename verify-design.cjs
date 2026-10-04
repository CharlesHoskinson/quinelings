const assert=require('node:assert/strict'),fs=require('node:fs'),D=require('./qdl.js'),Q=require('./core.js');
const checks=[];function test(name,fn){fn();checks.push(name);}
test('All ten families are bounded valid QDL expressions',()=>{assert.equal(new Set(D.FAMILIES).size,10);for(const family of D.FAMILIES)assert(D.validate(D.create(family)));});
test('Unknown syntax, families and models are rejected',()=>{for(const mutate of [d=>d.extra=1,d=>d.family='eval',d=>d.organ.model='execute',d=>d.filament.model='lookup',d=>d.motion.clock='execution',d=>d.motion.reducedMotion='ignore',d=>d.surface.model='shader',d=>d.light.model='random']){const d=D.create();mutate(d);assert.throws(()=>D.validate(d));}});
test('Unbounded geometry and invalid density hierarchy are rejected',()=>{for(const mutate of [d=>d.organ.amplitudes=[.8,.4],d=>d.motion.phaseRate=Infinity,d=>d.filament.bend=10,d=>d.composition.occupancy=1,d=>d.ink.ghostAlpha=d.ink.ridgeAlpha,d=>d.organ.baseRadius=0,d=>d.surface.samples=24001,d=>d.surface.ribbons=8.5,d=>d.surface.crests=20,d=>d.surface.twist=NaN,d=>d.light.recessAlpha=.2,d=>d.composition.yaw=2]){const d=D.create();mutate(d);assert.throws(()=>D.validate(d));}});
test('Validated radial envelope is positive across sampled opcodes and phase',()=>{const d=D.create();for(let frequency=1;frequency<=Q.OPS.length;frequency++)for(let j=0;j<100;j++){const n={frequency,indegree:4,outdegree:8,params:{value:6}},r=D.organRadius(d,n,j*.071,j*.213);assert(r>0&&Number.isFinite(r));}});
test('Pinned-sine offset vanishes at both endpoint samples',()=>{for(let frequency=1;frequency<=80;frequency++)for(const t of [0,.5,3,8]){assert(Math.abs(D.filamentBend(D.DEFAULT,frequency,0,t))<1e-12);assert(Math.abs(D.filamentBend(D.DEFAULT,frequency,1,t))<1e-12);}});
test('Species and mapping parameters survive quine and both genomes',()=>{for(const family of D.FAMILIES){const p=Q.makeTaskProgram({version:1,name:'design fixture',nodes:[{id:'n',op:'literal',inputs:[],params:{value:1}}],outputs:['n']},1,D.create(family));const run=Q.execute(p);assert.equal(run.emitted[0],Q.canon(p));const child=JSON.parse(run.emitted[0]);for(const restored of [child,Q.decode(Q.encode(p)),Q.decodeColors(Q.encodeColors(p))])assert.deepEqual(Q.describe(restored).design,D.create(family));}});
test('Design-only edits preserve task output while changing encoded source',()=>{const graph={version:1,name:'sum',nodes:[{id:'n',op:'literal',inputs:[],params:{value:[2,3]}},{id:'s',op:'sum',inputs:['n'],params:{}}],outputs:['s']},a=Q.makeTaskProgram(graph,1,D.create('seed')),b=Q.makeTaskProgram(graph,1,D.create('moth'));assert.notEqual(Q.canon(a),Q.canon(b));assert.deepEqual(Q.execute(a).tasks[0].output,Q.execute(b).tasks[0].output);});
test('Invalid source-embedded design is rejected before task execution',()=>{const p=Q.makeTaskProgram({version:1,name:'invalid design',nodes:[{id:'n',op:'literal',inputs:[],params:{value:1}}],outputs:['n']});function corrupt(x){if(Array.isArray(x))x.forEach(corrupt);else if(x&&typeof x==='object'&&x.design)x.design.motion.clock='execution';}corrupt(p);assert.throws(()=>Q.execute(p));});
test('Rhythm syntax is closed, complete, finite and bounded',()=>{
 const domains={rate:[.25,2],breath:[0,.18],wave:[0,.18],waveNumber:[0,4],lag:[0,2],asymmetry:[0,.8],overtone:[0,.35]};
 const schema=JSON.parse(fs.readFileSync(__dirname+'/design/qdl.schema.json','utf8')).properties.motion.properties.rhythm;
 assert.deepEqual(new Set(schema.required),new Set(Object.keys(D.DEFAULT.motion.rhythm)));
 assert.equal(schema.additionalProperties,false);
 for(const [key,[lo,hi]] of Object.entries(domains)){
  assert.equal(schema.properties[key].minimum,lo);assert.equal(schema.properties[key].maximum,hi);
  for(const value of [lo,hi]){const d=D.create();d.motion.rhythm[key]=value;assert(D.validate(d));}
  for(const value of [lo-.001,hi+.001,NaN,Infinity,-Infinity,null,true,'0']){
   const d=D.create();d.motion.rhythm[key]=value;assert.throws(()=>D.validate(d),undefined,key+': '+value);
  }
 }
 for(const key of schema.required){const d=D.create();delete d.motion.rhythm[key];assert.throws(()=>D.validate(d));}
 for(const mutate of [r=>r.code='execute()',r=>r.model='spring',r=>r.mode='random']){
  const d=D.create();mutate(d.motion.rhythm);assert.throws(()=>D.validate(d));
 }
 for(const value of [null,[],3,'harmonic',undefined]){const d=D.create();d.motion.rhythm=value;assert.throws(()=>D.validate(d));}
 for(const mode of ['periodic','quasiperiodic']){const d=D.create();d.motion.rhythm.mode=mode;assert(D.validate(d));}
});
test('Legacy rhythm omission validates without rewriting canonical source',()=>{
 const d=D.create('jelly');delete d.motion.rhythm;const before=JSON.stringify(d);assert(D.validate(d));assert.equal(JSON.stringify(d),before);
 const graph={version:1,name:'legacy rhythm',nodes:[{id:'n',op:'literal',inputs:[],params:{value:7}}],outputs:['n']};
 const p=Q.makeTaskProgram(graph,1,d),source=Q.canon(p),run=Q.execute(p);
 assert.equal(run.emitted[0],source);assert.deepEqual(Q.describe(JSON.parse(source)).design,d);
 assert(!Object.hasOwn(Q.describe(Q.decode(Q.encode(p))).design.motion,'rhythm'));
});
test('Every rhythm parameter is source identity while task results stay constant',()=>{
 const graph={version:1,name:'rhythm identity',nodes:[{id:'n',op:'literal',inputs:[],params:{value:7}}],outputs:['n']};
 const d=D.create('filament'),base=Q.makeTaskProgram(graph,1,d),source=Q.canon(base),output=Q.execute(base).tasks[0].output;
 const alternatives={mode:'quasiperiodic',rate:1.2,breath:.09,wave:.08,waveNumber:3.1,lag:1.3,asymmetry:.5,overtone:.3};
 for(const [key,value] of Object.entries(alternatives)){
  const edited=structuredClone(d);edited.motion.rhythm[key]=value;
  const p=Q.makeTaskProgram(graph,1,edited),run=Q.execute(p);
  assert.notEqual(Q.canon(p),source,key);assert.deepEqual(run.tasks[0].output,output,key);
  assert.equal(run.emitted[0],Q.canon(p),key);
  for(const restored of [JSON.parse(run.emitted[0]),Q.decode(Q.encode(p)),Q.decodeColors(Q.encodeColors(p))])assert.deepEqual(Q.describe(restored).design,edited,key);
 }
});
test('Published default and independent authored family rhythms remain consistent',()=>{
 assert.deepEqual(JSON.parse(fs.readFileSync(__dirname+'/design/default.qdl.json','utf8')),D.DEFAULT);
 assert.deepEqual(D.create('filament'),D.DEFAULT);
 const a=D.create('jelly'),b=D.create('jelly');a.motion.rhythm.breath=0;assert.equal(b.motion.rhythm.breath,.14);
 assert.equal(new Set(D.FAMILIES.map(f=>JSON.stringify(D.create(f).motion.rhythm))).size,10);
 assert.equal(D.create('coral').motion.rhythm.mode,'quasiperiodic');assert.equal(D.create('bloom').motion.rhythm.mode,'quasiperiodic');
});
fs.writeFileSync(__dirname+'/design-verification.json',JSON.stringify({passed:checks.length,checks,numericalGeometry:'sampled floating-point checks, not a theorem'},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,checks},null,2));
