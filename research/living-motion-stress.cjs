'use strict';
// Reproducible legal-parameter exploration complements the ten authored presets.
const Q=require('../core.js'),D=require('../qdl.js'),M=require('../morphology.js'),fs=require('node:fs'),assert=require('node:assert/strict');
const ids=require('../programs/manifest.json');let seed=20261003;const rand=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/2**32),r=(a,b)=>a+(b-a)*rand();
let maximumOccupancy=0,points=0;
for(let trial=0;trial<30;trial++){
 const id=ids[trial%ids.length],item=require(`../programs/${id}.json`),d=D.create(item.skin.family);
 Object.assign(d.motion.rhythm,{rate:r(.25,2),breath:r(0,.18),wave:r(0,.18),waveNumber:r(0,4),lag:r(0,2),asymmetry:r(0,.8),overtone:r(0,.35),mode:'quasiperiodic'});
 Object.assign(d.surface,{spread:r(.02,.24),taper:r(.4,2.5),asymmetry:r(0,.35),depth:r(0,.35),twist:r(0,3),phaseLag:r(0,2),folds:2+Math.floor(rand()*8)});
 Object.assign(d.composition,{occupancy:.84,lean:r(-.5,.5),yaw:r(-.5,.5),pitch:r(-.5,.5),focus:r(.15,.8)});D.validate(d);
 const s=Q.describe(Q.makeTaskProgram(item.graph,1,d)),frame=M.portraitFrame(s),total=M.ribbonCount(s);
 for(let sample=0;sample<2000;sample++){
  const p=M.surfacePoint(s,rand(),r(-1,1),Math.floor(rand()*total),total,r(0,10000)),occupancy=Math.max(Math.abs(p.x-frame.cx)*d.composition.occupancy/frame.width,Math.abs(p.y-frame.cy)*d.composition.occupancy/frame.height);points++;
  assert(Number.isFinite(occupancy)&&occupancy<=.5,`${id} trial ${trial} clips at ${occupancy}`);maximumOccupancy=Math.max(maximumOccupancy,occupancy);
 }
}
const report={seed:20261003,designs:30,points,maximumOccupancy,limit:.5,passed:true};fs.writeFileSync(__dirname+'/living-motion-stress.json',JSON.stringify(report,null,2)+'\n');console.log(report);
