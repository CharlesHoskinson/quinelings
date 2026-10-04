(function(root){
'use strict';
const TAU=Math.PI*2;
const DEFAULT_RHYTHM=Object.freeze({model:'coupled-harmonic',mode:'periodic',rate:1,breath:.06,wave:.055,waveNumber:1.6,lag:.9,asymmetry:.28,overtone:.17});
const motionCache=new WeakMap();
function bodyTransform(family,r,pulse,secondary){const scale=1+r.breath*pulse,angle=(family==='seed'?.18:family==='bloom'?.10:family==='moth'?.035:.055)*r.wave/.18*secondary;return {family,scale,stretch:1/Math.sqrt(scale),pivot:family==='coral'?.48:0,c:Math.cos(angle),sn:Math.sin(angle),lift:family==='coral'?0:r.wave*.22*secondary};}
const closedFamily=family=>family==='moth'||family==='torus'||family==='bloom';
// A monotone phase warp gives a quick stroke and a slower recovery. No integrator,
// random state, or wall clock: identical source and phase always give identical motion.
function motionState(s,t){
 const authored=s.design?.motion?.rhythm||DEFAULT_RHYTHM,cached=motionCache.get(s);
 if(cached&&cached.time===t&&cached.body.family===(s.design?.family||'filament')&&['yaw','pitch','lean'].every(key=>cached.composition?.[key]===s.design?.composition?.[key])&&Object.keys(DEFAULT_RHYTHM).every(key=>cached.rhythm[key]===authored[key]))return cached;
 const rhythm={...authored},raw=rhythm.rate*t,phase=raw+rhythm.asymmetry*Math.sin(raw);
 const extra=(rhythm.mode==='quasiperiodic'?Math.SQRT2:3)*raw;
 const state={time:t,rhythm,phase,pulse:Math.sin(phase),secondary:(Math.sin(2*phase-rhythm.lag)+rhythm.overtone*Math.sin(extra))/(1+rhythm.overtone)};
 state.body=bodyTransform(s.design?.family||'filament',rhythm,state.pulse,state.secondary);
 const c=s.design?.composition;state.composition=c?{...c}:null;state.projection=c?{cy:Math.cos(c.yaw),sy:Math.sin(c.yaw),cp:Math.cos(c.pitch),sp:Math.sin(c.pitch),lean:c.lean}:null;
 motionCache.set(s,state);return state;
}
function traveling(m,u,a=0,closed=false){const r=m.rhythm,winding=closed?Math.round(r.waveNumber):r.waveNumber;
 return (Math.sin(m.phase-TAU*winding*u-r.lag*(1-Math.cos(a)))+r.overtone*Math.sin(2*m.phase-TAU*winding*u-r.lag-a))/(1+r.overtone);
}
// Shared tissue expansion and recoil keep skeleton and membrane in one body frame.
function livingPose(p,family,u,t,s,state){
 const m=state||motionState(s,t),b=m.body.family===family?m.body:bodyTransform(family,m.rhythm,m.pulse,m.secondary);
 const x=p.x*b.scale,y=(p.y-b.pivot)*b.stretch;
 return {x:x*b.c-y*b.sn,y:b.pivot+x*b.sn+y*b.c+b.lift};
}
function project(p,family){if(family==='moth')return {x:p.x*.86,y:p.y*.85};if(family==='torus'||family==='bloom')return {x:p.x*1.05,y:p.y*.63};if(family==='comet')return {x:p.x*.7+p.y*.48,y:p.y*.7};return {x:p.x*.82,y:p.y*.83};}
// Continuous family ridges carry the silhouette; dust supplies quieter depth.
function strandPoint(family,u,k,total,t,s,state){
 const v=2*u-1,a=TAU*k/total,depth=s.maxDepth||1,branch=s.branches||0,m=state||motionState(s,t),r=m.rhythm;
 let x,y;
 switch(family){
 case 'jelly':{
  const contraction=2*r.breath*m.pulse;
  if(k===0){x=.43*(2*u-1)*(1-contraction);y=-.06;}
  else if(k<total/2){const angle=Math.PI*u,layer=k/Math.max(1,total/2-1),radius=.43*(.7+.3*layer);x=radius*Math.cos(angle)*(1-contraction);y=-.06-(.43+.1*contraction)*(.8+.2*layer)*Math.sin(angle);}
  else {const root=.43*Math.cos(a),lagged=traveling(m,u,a);x=root*(1-contraction)+r.wave*2*u*u*lagged;y=-.06+.85*u+.07*r.breath*Math.sin(m.phase-r.lag*u)*u;}
  break;}
 case 'moth':{
  const side=k%2?1:-1,f=Math.floor(k/2)/Math.max(1,total/2),angle=TAU*u;
  // Fore- and hind-wings share a stroke; the flexible trailing edge follows it.
  const stroke=.78+.22*Math.cos(2*m.phase),edge=Math.sin(angle),lagged=Math.sin(2*m.phase-r.lag*(1-Math.cos(angle)));
  x=side*(.07+(.26+.08*f)*(1-Math.cos(angle))*(1+.18*edge))*stroke;
  y=-.02+.36*edge*(1-.2*Math.cos(angle))+r.wave*.65*(1-Math.cos(angle))*lagged;break;}
 case 'coral':{
  const angle=-Math.PI+.3+(k/Math.max(1,total-1))*(Math.PI-.6),reach=.65+.1*Math.sin(k*2+branch);
  x=reach*u*Math.cos(angle)+r.wave*1.5*u*u*traveling(m,u,a);y=.48+reach*u*Math.sin(angle)-.16*u*u+.3*r.wave*u*u*m.secondary;break;}
 case 'ribbon':x=.35*Math.sin(v*(3+depth*.1)+m.phase)+.12*Math.cos(a+v*3)+r.wave*traveling(m,u,a);y=.82*v+.06*Math.sin(a+v*5)+.4*r.wave*Math.sin(Math.PI*u)*m.secondary;break;
 case 'nautilus':{
  // Logarithmic growth along the shell; time changes the mantle, not its topology.
  const angle=u*TAU*(2+.12*(s.quoteDepth||1))+.12*m.pulse,radius=.055*Math.exp(Math.log(.57/.055)*u)+.018*Math.cos(a);
  x=radius*Math.cos(angle)+r.wave*.35*u*u*traveling(m,u,a);y=radius*Math.sin(angle)+.018*Math.sin(a);break;}
 case 'seed':{
  const envelope=Math.sqrt(Math.max(0,1-v*v)),goldenAngle=Math.PI*(3-Math.sqrt(5)),azimuth=k*goldenAngle+v*.7;
  const radius=.34*envelope*(1+.10*v),flutter=r.wave*envelope*Math.sin(m.phase-r.lag*(u+.3));
  x=radius*Math.cos(azimuth)+flutter;y=.72*v+.025*envelope*Math.sin(azimuth)+.35*r.wave*envelope*m.secondary;break;}
 case 'torus':{
  // (1,3) toroidal winding and a counter-traveling poloidal overtone.
  const angle=TAU*u,poloidal=3*angle+a-m.phase,minor=.085*(1+.35*r.breath*Math.sin(2*m.phase)),radius=.43+minor*Math.cos(poloidal);
  x=radius*Math.cos(angle);y=.68*radius*Math.sin(angle)+minor*Math.sin(poloidal)+r.wave*.25*Math.sin(2*angle+m.phase);break;}
 case 'comet':{
  const taper=(1-u)**2;x=-.46+1.08*u+.1*taper*Math.cos(a);y=-.24+.6*u+.24*taper*Math.sin(a)+r.wave*1.6*u*u*traveling(m,u,a);break;}
 case 'bloom':{
  const angle=TAU*u,petals=5+Math.min(branch,4),opening=1+r.breath*.7*Math.sin(m.phase-r.lag*(k/total));
  const radius=(.18+.018*k)*(1+.38*Math.cos(petals*angle))*opening;
  x=radius*Math.cos(angle)+r.wave*.25*Math.sin(petals*angle)*m.secondary;y=radius*Math.sin(angle);break;}
 default:{const envelope=Math.sqrt(Math.max(0,1-v*v));x=.13*Math.sin(4*v+m.phase)+(.11+.07*Math.sin(a))*envelope*Math.cos(a+v*(2+depth*.12)+.22*m.secondary)+r.wave*.5*envelope*traveling(m,u,a);y=.82*v+.035*envelope*Math.sin(a+v*4);}
 }
 return livingPose({x,y},family,u,t,s,m);
}
// Legacy volume sampler follows the same authored locomotion as the ridges.
function bodyPoint(family,u,a,t,s){return strandPoint(family,u,(a/TAU)*24,24,t,s);}
// Depth locates an operation on a family spine; stable lanes separate peers.
function anchor(n,t,s){
 const u=n.u,v=2*u-1,family=s.design?.family||'filament',m=motionState(s,t),r=m.rhythm;
 const peers=s.nodes.filter(x=>!x.parent&&x.level===n.level),index=Math.max(0,peers.findIndex(x=>x.id===n.id));
 const lane=peers.length>1?(index/(peers.length-1)-.5)*2:0,depth=s.maxDepth||1;let x,y;
 switch(family){
 case 'comet':x=-.46+1.08*u;y=-.24+.6*u+.075*lane*(1-u)+r.wave*1.6*u*u*traveling(m,u);break;
 case 'ribbon':x=.35*Math.sin(v*(3+depth*.1)+m.phase)+.085*lane;y=.82*v+.4*r.wave*Math.sin(Math.PI*u)*m.secondary;break;
 case 'nautilus':{const angle=u*TAU*(2+.12*(s.quoteDepth||1))+.12*m.pulse,radius=.055*Math.exp(Math.log(.57/.055)*u)+.025*lane;x=radius*Math.cos(angle)+r.wave*.35*u*u*traveling(m,u);y=radius*Math.sin(angle);break;}
 case 'torus':{const angle=TAU*u,radius=.43+.045*lane;x=radius*Math.cos(angle);y=.68*radius*Math.sin(angle)+r.wave*.25*Math.sin(2*angle+m.phase);break;}
 case 'bloom':{const angle=TAU*u,radius=(.23+.095*lane+.025*Math.cos((5+Math.min(s.branches,4))*angle))*(1+r.breath*.7*Math.sin(m.phase-r.lag*u));x=radius*Math.cos(angle);y=radius*Math.sin(angle);break;}
 case 'coral':{const angle=-Math.PI+.3+(lane+1)/2*(Math.PI-.6),reach=.2+.55*u;x=reach*Math.cos(angle)+r.wave*1.5*u*u*traveling(m,u,angle);y=.48+reach*Math.sin(angle)-.16*u*u+.3*r.wave*u*u*m.secondary;break;}
 case 'moth':x=.06*lane;y=-.36+.72*u;break;
 case 'jelly':x=(.13+.05*u)*lane*(1-r.breath*m.pulse)+r.wave*.6*u*u*traveling(m,u);y=-.44+1.15*u;break;
 case 'seed':{const envelope=Math.sqrt(Math.max(0,1-v*v));x=.13*lane*envelope+r.wave*envelope*Math.sin(m.phase-r.lag*(u+.3));y=.72*v+.35*r.wave*envelope*m.secondary;break;}
 default:x=.13*Math.sin(4*v+m.phase)+.07*lane;y=.82*v;
 }
 return pose(project(livingPose({x,y},family,u,t,s,m),family),s.design.surface.depth*.45*Math.sin(u*TAU-m.phase),s.design,m.projection);
}
// A contiguous two-parameter membrane. All marks come from this surface.
function pose(p,z,d,projection){const c=projection||{cy:Math.cos(d.composition.yaw),sy:Math.sin(d.composition.yaw),cp:Math.cos(d.composition.pitch),sp:Math.sin(d.composition.pitch),lean:d.composition.lean},x=p.x*c.cy+z*c.sy,depth=z*c.cy-p.x*c.sy,y=p.y*c.cp-depth*c.sp;return {x:x+c.lean*y,y,z:depth};}
function ribbonCount(s){return Math.min(36,s.design.surface.ribbons+Math.min(6,s.branches));}
function surfacePoint(s,u,v,k,total,t,state){
 const d=s.design,f=d.surface,family=d.family,a=TAU*k/total,epsilon=.003,m=state||motionState(s,t),closed=closedFamily(family);
 const previous=closed?(u-epsilon+1)%1:Math.max(0,u-epsilon),next=closed?(u+epsilon)%1:Math.min(1,u+epsilon);
 const center=project(strandPoint(family,u,k,total,t,s,m),family),before=project(strandPoint(family,previous,k,total,t,s,m),family),after=project(strandPoint(family,next,k,total,t,s,m),family);
 const tx=after.x-before.x,ty=after.y-before.y,len=Math.hypot(tx,ty)||1,nx=-ty/len,ny=tx/len;
 const spatial=closed?Math.sin(TAU*u):u,psi=m.phase-f.phaseLag*spatial-m.rhythm.lag*spatial+.13*Math.sin(a),folds=Math.min(9,f.folds+Math.floor(s.maxDepth/5));
 // Circle-valued coordinates are essential: a closed ridge must also have a
 // closed membrane, matching thickness, tangent, lighting, and material phase.
 const distance=closed?Math.sin(Math.PI*(u-d.composition.focus)):((u-d.composition.focus)/.3);
 const focus=Math.exp(-distance*distance*(closed?2:1));
 const envelope=closed?(.75+.25*Math.cos(TAU*(u-d.composition.focus)))**f.taper:Math.max(.025,Math.sin(Math.PI*u))**f.taper;
 const width=f.spread*envelope*(.55+.75*focus)*(1+f.asymmetry*Math.sin(a+.6))*(1+.055*(Math.sin(psi)+.35*Math.sin(2*psi+.7)));
 const theta=.35*a+f.twist*(closed?Math.sin(TAU*u):TAU*(u-.5))+.48*Math.sin(psi)+.24*Math.sin(2*psi+.4*a+v*Math.PI)+m.rhythm.overtone*.18*m.secondary;
 const ripple=.10*width*Math.sin(folds*TAU*u-psi+a)*(closed?1:Math.sin(Math.PI*u));
 const ct=Math.cos(theta),st=Math.sin(theta),lateral=v*width*ct+ripple;
 // Jelly rim and appendage roots share the same depth field at their shared
 // x coordinate, so a tentacle begins on the lip rather than floating below it.
 const depthPhase=family==='jelly'?4*center.x:u*TAU,depthEnvelope=family==='jelly'?(k===0?0:Math.sin(Math.PI*u)):envelope;
 const z=f.depth*.45*Math.sin(depthPhase-m.phase)+v*width*st+f.depth*.14*Math.sin(folds*TAU*u-psi+a)*depthEnvelope;
 const raw={x:center.x+nx*lateral+f.asymmetry*.07*(closed?1:Math.sin(Math.PI*u))*focus,y:center.y+ny*lateral};
 const result=pose(raw,z,d,m.projection),angleDerivative=.24*Math.PI*Math.cos(2*psi+.4*a+v*Math.PI);
 const dl=width*(ct-v*st*angleDerivative),dz=width*(st+v*ct*angleDerivative),derivative=pose({x:nx*dl,y:ny*dl},dz,d,m.projection);
 const compression=Math.max(0,Math.min(1,1-Math.hypot(derivative.x,derivative.y)/Math.max(.01,width*1.4)));
 const depth=Math.max(0,Math.min(1,.5+result.z/(2*(f.depth+f.spread))));
 result.alpha=d.light.recessAlpha+(d.light.crestAlpha-d.light.recessAlpha)*(compression**.9)*(.28+.72*focus)*(1-d.light.depthContrast+d.light.depthContrast*depth);
 return result;
}
const fitCache=new WeakMap();
function portraitFrame(s){
 if(fitCache.has(s))return fitCache.get(s);const total=ribbonCount(s);let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 const include=p=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);};
 const rhythm=s.design.motion.rhythm||DEFAULT_RHYTHM,phases=Array.from({length:16},(_,i)=>TAU*i/(16*rhythm.rate));
 for(const t of phases){const m=motionState(s,t);for(let k=0;k<total;k++)for(let i=0;i<=48;i++)for(const v of [-1,0,1])include(surfacePoint(s,i/48,v,k,total,t,m));}
 // Exact anatomy stays in the same composition when inspected.
 for(const t of phases)for(const n of s.nodes){const p=anchor(n,t,s),r=Math.min(.16,s.design.organ.baseRadius+s.design.organ.degreeGain*(n.indegree+n.outdegree)+s.design.organ.literalGain*6)*(1+s.design.organ.amplitudes[0]+s.design.organ.amplitudes[1]);include({x:p.x-r,y:p.y-r});include({x:p.x+r,y:p.y+r});}
 // Sampling estimates the composition; an extra motion allowance reduces
 // clipping between sampled phases, including irrational secondary phases.
 // This fitted frame is empirically stress-tested, not a formal global bound.
 const padding=.035+.30*rhythm.wave+.10*rhythm.breath+.025*rhythm.overtone;
 const result={cx:(minX+maxX)/2,cy:(minY+maxY)/2,width:(maxX-minX+2*padding)*1.08,height:(maxY-minY+2*padding)*1.08};fitCache.set(s,result);return result;
}
function surfaceFrame(s,t,thumb=false){
 const m=motionState(s,t),total=ribbonCount(s),budget=thumb?Math.min(4200,s.design.surface.samples):s.design.surface.samples,columns=4,rows=Math.max(12,Math.floor(budget/(total*columns))),points=new Float32Array(total*rows*columns*4);let cursor=0;
 for(let k=0;k<total;k++)for(let j=0;j<columns;j++)for(let i=0;i<rows;i++){
  const u=(i+.5+((k*.618+j*.381)%1-.5)*.75)/rows,v=Math.cos(Math.PI*(j+.5)/columns),p=surfacePoint(s,u,v,k,total,t,m);
  points[cursor++]=p.x;points[cursor++]=p.y;points[cursor++]=p.z;points[cursor++]=p.alpha;
 }
 const ridges=[];for(let j=0;j<s.design.surface.crests;j++){const k=Math.floor(j*total/s.design.surface.crests),a=TAU*k/total,line=[];
  for(let i=0;i<=300;i++){const u=i/300,spatial=closedFamily(s.design.family)?Math.sin(TAU*u):u,v=.92*Math.cos(m.phase-s.design.surface.phaseLag*spatial+a*.5);line.push(surfacePoint(s,u,v,k,total,t,m));}
  ridges.push({line,primary:true});
 }
 return {points,ridges};
}
// phaseRate retains its nominal 24-frame-per-second QDL meaning.
function advancePhase(phase,rate,seconds,moving=true){return moving?phase+rate*24*Math.max(0,Math.min(.1,seconds)):phase;}
function framingExtent(s){
 const d=s.design,nodeMap=new Map(s.nodes.map(n=>[n.id,n]));let extent=1;
 for(const e of s.links){const f=1+e.port+nodeMap.get(e.from).frequency;extent=Math.max(extent,.75+d.filament.bend*(1+d.filament.frequencyGain*f)*(1+d.filament.ripple));}
 for(const n of s.nodes){const value=n.params?.value,magnitude=typeof value==='number'?Math.min(6,Math.abs(value)):Array.isArray(value)?Math.min(6,value.length):1,r=Math.min(.16,d.organ.baseRadius+d.organ.degreeGain*(n.indegree+n.outdegree)+d.organ.literalGain*magnitude);extent=Math.max(extent,.75+r*(1+d.organ.amplitudes[0]+d.organ.amplitudes[1]));}
 return extent;
}
const api={motionState,bodyPoint,strandPoint,project,anchor,advancePhase,framingExtent,pose,surfacePoint,surfaceFrame,portraitFrame,ribbonCount};
if(typeof module!=='undefined')module.exports=api;root.Morphology=api;
})(typeof globalThis!=='undefined'?globalThis:this);
