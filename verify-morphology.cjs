'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),Q=require('./core.js'),D=require('./qdl.js'),M=require('./morphology.js');
const ids=JSON.parse(fs.readFileSync('programs/manifest.json')),checks=[];
function check(name,fn){fn();checks.push(name);}
function finite(p){assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}
function close(a,b){assert(Math.hypot(a.x-b.x,a.y-b.y)<1e-10);}
check('Default source profile matches its checked-in QDL expression',()=>assert.deepEqual(D.DEFAULT,JSON.parse(fs.readFileSync('design/default.qdl.json'))));
check('One-second phase is independent of 20/30/60/120 Hz rendering',()=>{const results=[20,30,60,120].map(hz=>{let phase=0;for(let i=0;i<hz;i++)phase=M.advancePhase(phase,.018,1/hz);return phase;});for(const phase of results)assert(Math.abs(phase-.432)<1e-12);assert.equal(M.advancePhase(2,.018,1,false),2);assert.equal(M.advancePhase(2,.018,1),2+.018*24*.1);});
check('All ten families preserve finite anatomy, graph endpoints, source, and quine identity',()=>{
 for(const id of ids){const item=JSON.parse(fs.readFileSync(`programs/${id}.json`)),p=Q.makeTaskProgram(item.graph,1,D.create(item.skin.family)),s=Q.describe(p),source=Q.canon(p),before=Q.canon(s);
  for(const phase of [0,.3,1,10,100]){
   for(const n of s.nodes)finite(Q.nodePosition(n,phase,s));
   for(const e of s.links){close(Q.edgePoint(e,0,phase,s),Q.nodePosition(s.nodes.find(n=>n.id===e.from),phase,s));close(Q.edgePoint(e,1,phase,s),Q.nodePosition(s.nodes.find(n=>n.id===e.to),phase,s));for(let i=0;i<=60;i++)finite(Q.edgePoint(e,i/60,phase,s));}
   for(let k=0;k<s.strandCount;k++)for(let i=0;i<=50;i++){const u=i/50,a=2*Math.PI*k/s.strandCount;finite(M.project(M.strandPoint(s.design.family,u,k,s.strandCount,phase,s),s.design.family));finite(M.project(M.bodyPoint(s.design.family,u,a,phase,s),s.design.family));}
  }
  assert.equal(Q.canon(s),before);assert.equal(Q.canon(p),source);assert.equal(Q.execute(p).emitted[0],source);
 }
});
check('Closed moth, torus, and bloom ridges have no breathing seam',()=>{for(const family of ['moth','torus','bloom'])for(const phase of [0,.5,3,10]){const s={maxDepth:5,branches:6,quoteDepth:2};for(let k=0;k<15;k++)close(M.strandPoint(family,0,k,15,phase,s),M.strandPoint(family,1,k,15,phase,s));}});
check('Valid high-bend designs receive conservative framing without changing source',()=>{const d=D.create('filament');d.filament.bend=.08;d.filament.frequencyGain=.2;d.filament.ripple=.3;const item=JSON.parse(fs.readFileSync('programs/lanternkeeper.json')),p=Q.makeTaskProgram(item.graph,1,d),s=Q.describe(p),extent=M.framingExtent(s);assert(extent>1);for(const phase of [0,1,10])for(const e of s.links)for(let i=0;i<=100;i++){const a=Q.edgePoint(e,i/100,phase,s);assert(Math.max(Math.abs(a.x),Math.abs(a.y))<=extent);}assert.equal(Q.execute(p).emitted[0],Q.canon(p));});
check('Folded material has bounded deterministic samples and a fixed authored portrait frame',()=>{
 for(const id of ids){const item=JSON.parse(fs.readFileSync(`programs/${id}.json`)),p=Q.makeTaskProgram(item.graph,1,D.create(item.skin.family)),s=Q.describe(p),before=Q.canon(p),frame=M.portraitFrame(s);
  assert(frame.width>0&&frame.height>0);assert.strictEqual(frame,M.portraitFrame(s));
  for(const phase of [0,1.7,3,8,20]){const material=M.surfaceFrame(s,phase,false);assert(material.points.length/4<=s.design.surface.samples);assert.equal(material.ridges.length,s.design.surface.crests);
   for(let i=0;i<material.points.length;i+=4){assert(material.points.slice(i,i+4).every(Number.isFinite));assert(Math.abs(material.points[i]-frame.cx)*s.design.composition.occupancy/frame.width<=.5);assert(Math.abs(material.points[i+1]-frame.cy)*s.design.composition.occupancy/frame.height<=.5);assert(material.points[i+3]>=0&&material.points[i+3]<=s.design.light.crestAlpha+1e-6);}
   for(const ridge of material.ridges)for(const point of ridge.line)finite(point);
  }
  assert.deepEqual(M.surfaceFrame(s,3,true),M.surfaceFrame(s,3,true));assert.equal(Q.canon(p),before);
 }
});

const distance3=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0));
function specimen(id,edit=()=>{}){const item=JSON.parse(fs.readFileSync(`programs/${id}.json`)),d=D.create(item.skin.family);edit(d);return Q.describe(Q.makeTaskProgram(item.graph,1,d));}
check('Closed membranes join in position, shading and tangent, including extreme authored twists',()=>{
 for(const id of ids){const s=specimen(id,d=>{d.surface.twist=3;d.surface.phaseLag=2;d.motion.rhythm.waveNumber=3.7;d.motion.rhythm.wave=.18;});
  if(!['moth','torus','bloom'].includes(s.design.family))continue;
  const total=M.ribbonCount(s),h=1e-6;
  for(const t of [0,.7,9,37])for(const k of [0,Math.floor(total/2),total-1])for(const v of [-1,0,1]){
   const a=M.surfacePoint(s,0,v,k,total,t),b=M.surfacePoint(s,1,v,k,total,t);
   assert(distance3(a,b)<1e-7,`${s.design.family}: membrane seam ${distance3(a,b)}`);
   assert(Math.abs(a.alpha-b.alpha)<1e-7,`${s.design.family}: shading seam`);
   const right=M.surfacePoint(s,h,v,k,total,t),left=M.surfacePoint(s,1-h,v,k,total,t);
   const dr={x:(right.x-a.x)/h,y:(right.y-a.y)/h,z:(right.z-a.z)/h},dl={x:(b.x-left.x)/h,y:(b.y-left.y)/h,z:(b.z-left.z)/h};
   assert(distance3(dr,dl)<.03,`${s.design.family}: tangent seam ${distance3(dr,dl)}`);
  }
 }
});
check('Rhythm drivers are bounded, periodic when authored, and genuinely quasiperiodic',()=>{
 for(const id of ids){const s=specimen(id),r=s.design.motion.rhythm;r.mode='periodic';
  for(const t of [0,.13,2,37,1000]){
   const a=M.motionState(s,t),b=M.motionState(s,t+2*Math.PI/r.rate);
   assert(Number.isFinite(a.phase));assert(Math.abs(a.pulse)<=1+1e-12);assert(Math.abs(a.secondary)<=1+1e-12);
   assert(Math.abs(a.pulse-b.pulse)<1e-10);assert(Math.abs(a.secondary-b.secondary)<1e-10);
   assert.deepEqual(a,M.motionState(s,t));
  }
  r.mode='quasiperiodic';r.overtone=.35;
  const differences=[0,.7,2].map(t=>Math.abs(M.motionState(s,t).secondary-M.motionState(s,t+2*Math.PI/r.rate).secondary));
  assert(Math.max(...differences)>.01,'quasiperiodic overtone must change successive cycles');
 }
});
check('Periodic designs close their complete membrane and executable anatomy after one cycle',()=>{
 for(const id of ids){const s=specimen(id,d=>{d.motion.rhythm.mode='periodic';}),period=2*Math.PI/s.design.motion.rhythm.rate,total=M.ribbonCount(s);
  for(const t of [.31,3.7]){
   for(const k of [0,Math.floor(total/2),total-1])for(const u of [.03,.37,.82])for(const v of [-1,.3,1]){
    const a=M.surfacePoint(s,u,v,k,total,t),b=M.surfacePoint(s,u,v,k,total,t+period);assert(distance3(a,b)<1e-8,`${s.design.family}: membrane cycle does not close`);assert(Math.abs(a.alpha-b.alpha)<1e-8);
   }
   for(const n of s.nodes)close(Q.nodePosition(n,t,s),Q.nodePosition(n,t+period,s));
   for(const e of s.links)for(const u of [0,.37,.81,1])close(Q.edgePoint(e,u,t,s),Q.edgePoint(e,u,t+period,s));
  }
 }
});
check('Authored motion stays continuous and framed at late times and parameter limits',()=>{
 for(const id of ids)for(const profile of ['default','extreme','legacy']){
  const s=specimen(id,d=>{if(profile==='legacy')delete d.motion.rhythm;if(profile==='extreme'){Object.assign(d.motion.rhythm,{rate:2,breath:.18,wave:.18,waveNumber:4,lag:2,asymmetry:.8,overtone:.35,mode:'quasiperiodic'});d.composition.occupancy=.84;}}),source=Q.canon(s),total=M.ribbonCount(s),frame=M.portraitFrame(s);
  const fits=p=>{finite(p);assert(Math.abs(p.x-frame.cx)*s.design.composition.occupancy/frame.width<=.5,`${s.design.family}/${profile}: horizontal clipping`);assert(Math.abs(p.y-frame.cy)*s.design.composition.occupancy/frame.height<=.5,`${s.design.family}/${profile}: vertical clipping`);};
  for(const t of [0,.37,Math.PI,37,101,1000]){
   for(const k of [0,Math.floor(total/2),total-1])for(const u of [0,.01,.21,.5,.79,.99,1])for(const v of [-1,0,1]){
    const p=M.surfacePoint(s,u,v,k,total,t),next=M.surfacePoint(s,u,v,k,total,t+1e-4);fits(p);assert(Number.isFinite(p.z)&&Number.isFinite(p.alpha));assert(p.alpha>=0&&p.alpha<=s.design.light.crestAlpha+1e-8);
    assert(distance3(p,next)<.01,`${s.design.family}/${profile}: temporal discontinuity`);assert.deepEqual(p,M.surfacePoint(s,u,v,k,total,t));
   }
   for(const n of s.nodes)fits(Q.nodePosition(n,t,s));
   for(const e of s.links){close(Q.edgePoint(e,0,t,s),Q.nodePosition(s.nodes.find(n=>n.id===e.from),t,s));close(Q.edgePoint(e,1,t,s),Q.nodePosition(s.nodes.find(n=>n.id===e.to),t,s));}
  }
  assert.equal(Q.canon(s),source,'rendering must not rewrite legacy or authored design');
 }
});
check('Every family moves, keeps a distinct body, and honors the smallest surface budget',()=>{
 const signatures=[];
 for(const id of ids){const s=specimen(id,d=>{d.surface.samples=4000;d.surface.ribbons=36;}),total=M.ribbonCount(s),signature=[];let displacement=0;
  for(const k of [0,7,15])for(const u of [.15,.4,.7,.9]){const a=M.surfacePoint(s,u,.5,k,total,.2),b=M.surfacePoint(s,u,.5,k,total,1.4);signature.push(a.x,a.y);displacement+=distance3(a,b);}
  assert(displacement>.01,`${s.design.family}: static body`);signatures.push(signature);
  for(const thumb of [false,true]){const material=M.surfaceFrame(s,2,thumb);assert(material.points.length/4<=4000,'sample budget exceeded');assert.equal(material.ridges.length,s.design.surface.crests);}
 }
 for(let i=0;i<signatures.length;i++)for(let j=0;j<i;j++)assert(Math.hypot(...signatures[i].map((v,k)=>v-signatures[j][k]))>.1,'families collapsed to the same sampled body');
});

fs.writeFileSync('morphology-verification.json',JSON.stringify({passed:checks.length,programs:ids.length,checks},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,checks}));
