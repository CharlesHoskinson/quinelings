'use strict';
const fs=require('node:fs'),Q=require('../core.js'),D=require('../qdl.js'),M=require('../morphology.js');
const ids=JSON.parse(fs.readFileSync('programs/manifest.json'));
const rows=[];
for(const id of ids){const item=JSON.parse(fs.readFileSync(`programs/${id}.json`)),s=Q.describe(Q.makeTaskProgram(item.graph,1,D.create(item.skin.family))),family=s.design.family;
if(!['seed','filament','moth','torus','bloom'].includes(family))continue;
const speeds=[1e-2,1e-4,1e-6].map(h=>{const a=M.strandPoint(family,0,0,24,.7,s),b=M.strandPoint(family,h,0,24,.7,s);return {h,endpointSecantSpeed:Math.hypot(b.x-a.x,b.y-a.y)/h};});
rows.push({id,family,speeds});}
// Circle perturbed by three harmonics. Derivative perturbation <= 25% base speed.
const amplitudes=[.014,.007,.004],modes=[2,3,5],radius=.43;
const baseSpeed=2*Math.PI*radius,derivativeBound=amplitudes.reduce((a,x,i)=>a+2*Math.PI*modes[i]*x,0),secondBound=(2*Math.PI)**2*(radius+amplitudes.reduce((a,x,i)=>a+modes[i]**2*x,0));
const tolerance=.001,segments=Math.ceil(Math.sqrt(secondBound/(8*tolerance))),point=u=>[radius*Math.cos(2*Math.PI*u)+amplitudes.reduce((a,x,i)=>a+x*Math.cos(2*Math.PI*modes[i]*u),0),radius*Math.sin(2*Math.PI*u)];let maximumChordResidual=0;
for(let j=0;j<segments;j++){const a=point(j/segments),b=point((j+1)/segments);for(let k=1;k<100;k++){const z=k/100,p=point((j+z)/segments);maximumChordResidual=Math.max(maximumChordResidual,Math.hypot(p[0]-((1-z)*a[0]+z*b[0]),p[1]-((1-z)*a[1]+z*b[1])));}}
const report={endpointProbe:rows,boundedPerturbation:{baseSpeed,derivativeBound,regularSpeedLowerBound:baseSpeed-derivativeBound,secondDerivativeBound:secondBound,tolerance,segments,certifiedChordBound:secondBound/(8*segments**2),maximumChordResidual}};
fs.writeFileSync('research/final-qdl-geometry-experiment.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
