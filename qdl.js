(function(root){
'use strict';
const FAMILIES=['filament','jelly','moth','coral','ribbon','nautilus','seed','torus','comet','bloom'];
const DEFAULT={qdl:1,family:'filament',organ:{model:'rosette',baseRadius:.03,degreeGain:.004,literalGain:.001,amplitudes:[.2,.13]},filament:{model:'pinned-sine',bend:.06,frequencyGain:.2,ripple:.16},motion:{clock:'separate',phaseRate:.018,reducedMotion:'freeze'},ink:{ghostAlpha:.09,secondaryAlpha:.42,ridgeAlpha:.72,neutral:'#d1e6dd'},framing:{scale:.43,padding:.12}};
const clone=x=>JSON.parse(JSON.stringify(x));
function check(ok,message){if(!ok)throw Error('QDL: '+message);}
function fields(obj,names){check(obj&&typeof obj==='object'&&!Array.isArray(obj),'expected record');check(Object.keys(obj).length===names.length&&names.every(k=>Object.hasOwn(obj,k)),'unknown or missing fields');}
function range(v,min,max){check(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max,'number outside ['+min+','+max+']');}
function validate(d){
 fields(d,['qdl','family','organ','filament','motion','ink','framing']);check(d.qdl===1,'unsupported version');check(FAMILIES.includes(d.family),'unknown family');
 fields(d.organ,['model','baseRadius','degreeGain','literalGain','amplitudes']);check(d.organ.model==='rosette','unknown organ model');range(d.organ.baseRadius,.01,.08);range(d.organ.degreeGain,0,.006);range(d.organ.literalGain,0,.003);check(Array.isArray(d.organ.amplitudes)&&d.organ.amplitudes.length===2,'need two radial harmonics');d.organ.amplitudes.forEach(a=>range(a,0,.45));check(d.organ.amplitudes[0]+d.organ.amplitudes[1]<1,'radial envelope may collapse');
 fields(d.filament,['model','bend','frequencyGain','ripple']);check(d.filament.model==='pinned-sine','unknown filament model');range(d.filament.bend,0,.08);range(d.filament.frequencyGain,0,.2);range(d.filament.ripple,0,.3);
 fields(d.motion,['clock','phaseRate','reducedMotion']);check(d.motion.clock==='separate'&&d.motion.reducedMotion==='freeze','motion may not control execution');range(d.motion.phaseRate,0,.05);
 fields(d.ink,['ghostAlpha','secondaryAlpha','ridgeAlpha','neutral']);for(const k of ['ghostAlpha','secondaryAlpha','ridgeAlpha'])range(d.ink[k],0,1);check(d.ink.ghostAlpha<d.ink.secondaryAlpha&&d.ink.secondaryAlpha<d.ink.ridgeAlpha,'ink hierarchy must be ghost < secondary < ridge');check(/^#[0-9a-f]{6}$/.test(d.ink.neutral),'invalid neutral RGB');
 fields(d.framing,['scale','padding']);range(d.framing.scale,.25,.47);range(d.framing.padding,.08,.25);return true;
}
function create(family='filament'){const d=clone(DEFAULT);d.family=family;validate(d);return d;}
function organRadius(d,n,a,t){const value=n.params?.value,magnitude=typeof value==='number'?Math.min(6,Math.abs(value)):Array.isArray(value)?Math.min(6,value.length):1;const r=Math.min(.16,d.organ.baseRadius+d.organ.degreeGain*(n.indegree+n.outdegree)+d.organ.literalGain*magnitude);return r*(1+d.organ.amplitudes[0]*Math.cos(n.frequency*a)+d.organ.amplitudes[1]*Math.cos((n.outdegree+1)*a+t));}
function filamentBend(d,frequency,u,t){return d.filament.bend*(1+d.filament.frequencyGain*frequency)*Math.sin(Math.PI*u)*(1+d.filament.ripple*Math.sin(2*Math.PI*frequency*u+t));}
const api={FAMILIES,DEFAULT,validate,create,organRadius,filamentBend};if(typeof module!=='undefined')module.exports=api;root.QDL=api;
})(typeof globalThis!=='undefined'?globalThis:this);
