(function(root){
'use strict';
const TAU=Math.PI*2;
function bodyPoint(family,u,a,t,s){const b=s.branches||0,d=s.maxDepth||1,q=s.quoteDepth||1;const ripple=1+.08*Math.sin((b+2)*a+t)+.035*Math.cos((d+1)*TAU*u-t);let x,y;
 switch(family){
 case 'jelly':{const r=.59*Math.sqrt(u),z=Math.cos(r*2.4);x=r*Math.cos(a);y=-.2-.42*z+.08*Math.sin(a*5+t);if(u>.76){const v=(u-.76)/.24;x=.4*Math.cos(a)+.06*Math.sin(v*13+t+a);y=-.06+v*.88;}break;}
 case 'moth':{const r=Math.sqrt(u)*(.12+.55*Math.abs(Math.sin(a)));x=r*Math.sin(a)*(.92+.08*Math.sin(t*.55));y=.55*r*Math.cos(a)+.12*Math.sin(a*4+t)*u;break;}
 case 'coral':{const arm=Math.floor(u*(5+Math.min(b,5))),v=u*(5+Math.min(b,5))%1,angle=-Math.PI+.25+arm*Math.PI/(4+Math.min(b,5));x=.66*v*Math.cos(angle)+.055*Math.sin(v*20+arm+t);y=.45+.85*v*Math.sin(angle);break;}
 case 'ribbon':{const v=(u-.5)*1.7;x=.47*Math.sin(v*(3+d*.2)+t*.5)+.11*Math.cos(a);y=v+.12*Math.sin(a);break;}
 case 'nautilus':{const angle=u*TAU*(2+q*.15)+t*.12,r=.07+.55*u;x=r*Math.cos(angle)+.055*Math.cos(a);y=r*Math.sin(angle)+.055*Math.sin(a);break;}
 case 'seed':{const v=2*u-1,r=.36*Math.sqrt(1-v*v)*(1+.18*v);x=r*Math.cos(a);y=.73*v+.06*Math.sin(a);break;}
 case 'torus':{const r=.44+.15*Math.cos(TAU*u);x=r*Math.cos(a);y=.66*r*Math.sin(a)+.17*Math.sin(TAU*u);break;}
 case 'comet':{const v=u,r=.35*Math.exp(-3*v);x=-.45+v*1.1+r*Math.cos(a);y=-.28+v*.7+r*Math.sin(a)+.05*Math.sin(v*18+t);break;}
 case 'bloom':{const petals=5+Math.min(b,4),r=Math.sqrt(u)*(.34+.25*Math.cos(petals*a));x=r*Math.cos(a);y=r*Math.sin(a);break;}
 default:{const v=2*u-1,r=.2*Math.sqrt(1-v*v)*(1+.28*Math.sin((d+2)*u*TAU+t));x=.13*Math.sin(v*4+t*.4)+r*Math.cos(a);y=.82*v+.07*Math.sin(a);}
 }const sway=.025*Math.sin(t*.45+u*3)*(family==='coral'?u*u:1);return {x:x*ripple+sway,y:y*ripple};}
function project(p,family){if(family==='moth')return {x:p.x*.86,y:p.y*.85};if(family==='torus'||family==='bloom')return {x:p.x*1.05,y:p.y*.63};if(family==='comet')return {x:p.x*.7+p.y*.48,y:p.y*.7};return {x:p.x*.82,y:p.y*.83};}
// Continuous family ridges carry the silhouette; dust supplies quieter depth.
function strandPoint(family,u,k,total,t,s){
 const v=2*u-1,a=TAU*k/total,depth=s.maxDepth||1,branch=s.branches||0;
 const breath=.025*Math.sin(t+u*3+a),fold=.04*Math.sin((depth+2)*u*TAU-t+a);
 let x,y;
 switch(family){
 case 'jelly':
  if(k<total/2){const angle=Math.PI*u,r=.44+.012*k;x=r*Math.cos(angle);y=-.08-.48*Math.sin(angle)+breath;}
  else{x=.37*Math.cos(a)+.045*u*Math.sin(9*u-t+a);y=-.06+.85*u;}
  break;
 case 'moth':{const side=k%2?1:-1,f=Math.floor(k/2)/(total/2),angle=TAU*u,opening=.92+.08*Math.sin(t*.55);x=side*(.07+(.26+.08*f)*(1-Math.cos(angle))*(1+.18*Math.sin(angle)))*opening;y=-.02+.36*Math.sin(angle)*(1-.2*Math.cos(angle))+.025*Math.sin(2*angle+a)*Math.sin(angle);break;}
 case 'coral':{const angle=-Math.PI+.3+(k/(total-1))*(Math.PI-.6);const reach=.65+.1*Math.sin(k*2+branch);x=reach*u*Math.cos(angle)+.035*u*u*Math.sin(u*6+t+a);y=.48+reach*u*Math.sin(angle)-.16*u*u;break;}
 case 'ribbon':x=.35*Math.sin(v*(3+depth*.1)+t*.5)+.12*Math.cos(a+v*3)+fold;y=.82*v+.06*Math.sin(a+v*5);break;
 case 'nautilus':{const angle=u*TAU*(2+.12*s.quoteDepth)+t*.12,r=.04+.53*u+.022*Math.cos(a);x=r*Math.cos(angle)+breath;y=r*Math.sin(angle)+.02*Math.sin(a);break;}
 case 'seed':{const r=.34*Math.sqrt(Math.max(0,1-v*v));x=r*Math.cos(a+v*.4)+breath;y=.72*v+.025*Math.sin(a);if(k<3&&u>.75){x+=(u-.75)*.22*Math.sin(a);y-=.08*Math.sin((u-.75)*Math.PI*2);}break;}
 case 'torus':{const angle=TAU*u,r=.43+.08*Math.cos(a+angle*2+t*.2);x=r*Math.cos(angle);y=.68*r*Math.sin(angle)+.09*Math.sin(a+angle*2+t*.2);break;}
 case 'comet':{const taper=(1-u)**2;x=-.46+1.08*u+.1*taper*Math.cos(a);y=-.24+.6*u+.24*taper*Math.sin(a)+.045*Math.sin(8*u-t+a)*u;break;}
 case 'bloom':{const angle=TAU*u,petals=5+Math.min(branch,4),r=(.18+.018*k)*(1+.38*Math.cos(petals*angle+t*.15));x=r*Math.cos(angle)+.035*Math.cos(t);y=r*Math.sin(angle)+.025*Math.sin(t+TAU*u+a);break;}
 default:{const envelope=Math.sqrt(Math.max(0,1-v*v));x=.13*Math.sin(4*v+t*.4)+(.11+.07*Math.sin(a))*envelope*Math.cos(a+v*(2+depth*.12)+.22*Math.sin(t-v))+fold*.4;y=.82*v+.035*envelope*Math.sin(a+v*4);}
 }
 return {x,y};
}

// Depth locates an operation on a family spine; stable lanes separate peers.
function anchor(n,t,s){
 const u=n.u,v=2*u-1,family=s.design?.family||'filament';
 const peers=s.nodes.filter(x=>!x.parent&&x.level===n.level),index=Math.max(0,peers.findIndex(x=>x.id===n.id));
 const lane=peers.length>1?(index/(peers.length-1)-.5)*2:0;
 const breath=.012*Math.sin(t*.55+u*3),depth=s.maxDepth||1;let x,y;
 switch(family){
 case 'comet':x=-.46+1.08*u;y=-.24+.6*u+.075*lane*(1-u)+.025*u*Math.sin(u*8-t*.65);break;
 case 'ribbon':x=.35*Math.sin(v*(3+depth*.1)+t*.5)+.085*lane;y=.82*v;break;
 case 'nautilus':{const angle=u*TAU*(2+.12*s.quoteDepth)+t*.12,r=.04+.53*u+.025*lane;x=r*Math.cos(angle);y=r*Math.sin(angle);break;}
 case 'torus':{const angle=TAU*u,r=.43+.045*lane;x=r*Math.cos(angle);y=.68*r*Math.sin(angle)+.035*Math.sin(t*.4+angle);break;}
 case 'bloom':{const angle=TAU*u,r=.23+.095*lane+.025*Math.cos((5+Math.min(s.branches,4))*angle+t*.15);x=r*Math.cos(angle);y=r*Math.sin(angle);break;}
 case 'coral':{const angle=-Math.PI+.3+(lane+1)/2*(Math.PI-.6),reach=.2+.55*u;x=reach*Math.cos(angle)+.018*u*u*Math.sin(t*.6+angle);y=.48+reach*Math.sin(angle)-.16*u*u;break;}
 case 'moth':x=.06*lane;y=-.36+.72*u+.01*Math.sin(t*.55)*Math.sin(Math.PI*u);break;
 case 'jelly':x=(.13+.05*u)*lane+.018*u*Math.sin(t*.6+u*5);y=-.44+1.15*u;break;
 case 'seed':x=.13*lane*Math.sqrt(Math.max(0,1-v*v))+breath;y=.72*v;break;
 default:x=.13*Math.sin(4*v+t*.4)+.07*lane+breath;y=.82*v;
 }
 return pose(project({x,y},family),s.design.surface.depth*.45*Math.sin(u*TAU-t*.45),s.design);
}
// A contiguous two-parameter membrane. All marks come from this surface.
function pose(p,z,d){const c=d.composition,cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),cp=Math.cos(c.pitch),sp=Math.sin(c.pitch),x=p.x*cy+z*sy,depth=z*cy-p.x*sy,y=p.y*cp-depth*sp;return {x:x+c.lean*y,y,z:depth};}
function ribbonCount(s){return Math.min(36,s.design.surface.ribbons+Math.min(6,s.branches));}
function surfacePoint(s,u,v,k,total,t){
 const d=s.design,f=d.surface,family=d.family,a=TAU*k/total,epsilon=.003;
 const center=project(strandPoint(family,u,k,total,t,s),family),before=project(strandPoint(family,Math.max(0,u-epsilon),k,total,t,s),family),after=project(strandPoint(family,Math.min(1,u+epsilon),k,total,t,s),family);
 const tx=after.x-before.x,ty=after.y-before.y,len=Math.hypot(tx,ty)||1,nx=-ty/len,ny=tx/len;
 const psi=t-f.phaseLag*u+.13*Math.sin(a),folds=Math.min(9,f.folds+Math.floor(s.maxDepth/5));
 const focus=Math.exp(-Math.pow((u-d.composition.focus)/.3,2)),envelope=Math.max(.025,Math.sin(Math.PI*u))**f.taper;
 const width=f.spread*envelope*(.55+.75*focus)*(1+f.asymmetry*Math.sin(a+.6))*(1+.055*(Math.sin(psi)+.35*Math.sin(2*psi+.7)));
 const theta=.35*a+f.twist*TAU*(u-.5)+.62*Math.sin(psi)+.32*Math.sin(2*psi+.4*a+v*Math.PI);
 const ripple=.10*width*Math.sin(folds*TAU*u-psi+a)*Math.sin(Math.PI*u);
 const lateral=v*width*Math.cos(theta)+ripple;
 const z=f.depth*.45*Math.sin(u*TAU-t*.45)+v*width*Math.sin(theta)+f.depth*.14*Math.sin(folds*Math.PI*u-psi+a)*envelope;
 const raw={x:center.x+nx*lateral+f.asymmetry*.07*Math.sin(Math.PI*u)*focus,y:center.y+ny*lateral};
 const result=pose(raw,z,d),angleDerivative=.32*Math.PI*Math.cos(2*psi+.4*a+v*Math.PI);
 const dl=width*(Math.cos(theta)-v*Math.sin(theta)*angleDerivative),dz=width*(Math.sin(theta)+v*Math.cos(theta)*angleDerivative),derivative=pose({x:nx*dl,y:ny*dl},dz,d);
 const compression=Math.max(0,Math.min(1,1-Math.hypot(derivative.x,derivative.y)/Math.max(.01,width*1.4)));
 const depth=Math.max(0,Math.min(1,.5+result.z/(2*(f.depth+f.spread))));
 result.alpha=d.light.recessAlpha+(d.light.crestAlpha-d.light.recessAlpha)*(compression**.9)*(.28+.72*focus)*(1-d.light.depthContrast+d.light.depthContrast*depth);
 return result;
}
const fitCache=new WeakMap();
function portraitFrame(s){
 if(fitCache.has(s))return fitCache.get(s);const total=ribbonCount(s);let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 const include=p=>{minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);};
 for(const t of [0,1.7,3.4,5.1,6.8,8.5,10.2,12])for(let k=0;k<total;k++)for(let i=0;i<=48;i++)for(const v of [-1,0,1])include(surfacePoint(s,i/48,v,k,total,t));
 // Exact anatomy stays in the same composition when inspected.
 for(const t of [0,3,8])for(const n of s.nodes){const p=anchor(n,t,s),r=Math.min(.16,s.design.organ.baseRadius+s.design.organ.degreeGain*(n.indegree+n.outdegree)+s.design.organ.literalGain*6)*(1+s.design.organ.amplitudes[0]+s.design.organ.amplitudes[1]);include({x:p.x-r,y:p.y-r});include({x:p.x+r,y:p.y+r});}
 const result={cx:(minX+maxX)/2,cy:(minY+maxY)/2,width:(maxX-minX)*1.08,height:(maxY-minY)*1.08};fitCache.set(s,result);return result;
}
function surfaceFrame(s,t,thumb=false){
 const total=ribbonCount(s),budget=thumb?Math.min(4200,s.design.surface.samples):s.design.surface.samples,columns=4,rows=Math.max(12,Math.floor(budget/(total*columns))),points=new Float32Array(total*rows*columns*4);let cursor=0;
 for(let k=0;k<total;k++)for(let j=0;j<columns;j++)for(let i=0;i<rows;i++){
  const u=(i+.5+((k*.618+j*.381)%1-.5)*.75)/rows,v=Math.cos(Math.PI*(j+.5)/columns),p=surfacePoint(s,u,v,k,total,t);
  points[cursor++]=p.x;points[cursor++]=p.y;points[cursor++]=p.z;points[cursor++]=p.alpha;
 }
 const ridges=[];for(let j=0;j<s.design.surface.crests;j++){const k=Math.floor(j*total/s.design.surface.crests),a=TAU*k/total,line=[];
  for(let i=0;i<=300;i++){const u=i/300,v=.92*Math.cos(t*.23-s.design.surface.phaseLag*u+a*.5);line.push(surfacePoint(s,u,v,k,total,t));}
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
const api={bodyPoint,strandPoint,project,anchor,advancePhase,framingExtent,pose,surfacePoint,surfaceFrame,portraitFrame,ribbonCount};
if(typeof module!=='undefined')module.exports=api;root.Morphology=api;
})(typeof globalThis!=='undefined'?globalThis:this);
