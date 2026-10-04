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
fs.writeFileSync('morphology-verification.json',JSON.stringify({passed:checks.length,programs:ids.length,checks},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,checks}));
