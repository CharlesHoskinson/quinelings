'use strict';
const fs=require('node:fs'),path=require('node:path'),{performance}=require('node:perf_hooks');
const Q=require('../core.js'),D=require('../qdl.js'),M=require('../morphology.js');
const rows=[];
for(const id of ['lanternkeeper','echoweaver','threadsorter'])for(const budget of [4200,24000]){
 const item=JSON.parse(fs.readFileSync(path.join(__dirname,'../programs/'+id+'.json')));const d=D.forProgram(item);d.surface.samples=budget;const s=Q.describe(Q.makeTaskProgram(item.graph,1,d));
 for(let i=0;i<5;i++)M.surfaceFrame(s,i*.1,false);
 const ms=[];let actual;for(let i=0;i<20;i++){const t=performance.now();actual=M.surfaceFrame(s,.5+i*.03,false);ms.push(performance.now()-t);}ms.sort((a,b)=>a-b);
 rows.push({id,budget,actualPoints:actual.points.length/4,crestVertices:actual.ridges.reduce((n,r)=>n+r.line.length,0),nodeGeometryOnlyMs:{p50:ms[10],p95:ms[18]},environment:'Node CPU surfaceFrame only; not Canvas/GPU/browser/end-to-end'});
}
const opacity=[4,16,64].map(n=>({samplesAtSamePixel:n,fixedPerSampleAlpha:.045,oldCombinedAlpha:1-Math.pow(1-.045,n),normalizedPerSampleAlpha:1-Math.exp(-.8/n),normalizedCombinedAlpha:1-Math.exp(-.8)}));
const report={measurements:rows,opticalDepthExperiment:opacity,theoreticalBuffersAt24000:{positionFloat3Bytes:288000,normalFloat3Bytes:288000,materialUVFloat2Bytes:192000,weightFloatBytes:96000,ownerUint16Bytes:48000,partUint8Bytes:24000,totalBytes:936000},targetsMeasured:false};
fs.writeFileSync(__dirname+'/thought-lifeform-07-cost.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
