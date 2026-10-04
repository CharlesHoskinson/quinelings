(function(root){
'use strict';
const FAMILIES=['filament','jelly','moth','coral','ribbon','nautilus','seed','torus','comet','bloom'];
const DEFAULT={qdl:1,family:'filament',organ:{model:'rosette',baseRadius:.03,degreeGain:.004,literalGain:.001,amplitudes:[.2,.13]},filament:{model:'pinned-sine',bend:.04,frequencyGain:.07,ripple:.16},motion:{clock:'separate',phaseRate:.038,reducedMotion:'freeze'},ink:{ghostAlpha:.09,secondaryAlpha:.42,ridgeAlpha:.88,neutral:'#f0f1eb'},
 surface:{model:'folded-ribbon',ribbons:28,crests:4,spread:.16,folds:7,taper:.65,asymmetry:.25,depth:.28,twist:1.9,phaseLag:1.4,samples:24000},
 light:{model:'density-crest',recessAlpha:.045,crestAlpha:.58,depthContrast:.65},
 composition:{occupancy:.76,lean:-.12,yaw:.3,pitch:.12,focus:.38}};
const clone=x=>JSON.parse(JSON.stringify(x));
function check(ok,message){if(!ok)throw Error('QDL: '+message);}
function fields(obj,names){check(obj&&typeof obj==='object'&&!Array.isArray(obj),'expected record');check(Object.keys(obj).length===names.length&&names.every(k=>Object.hasOwn(obj,k)),'unknown or missing fields');}
function range(v,min,max){check(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max,'number outside ['+min+','+max+']');}
function validate(d){
 fields(d,['qdl','family','organ','filament','motion','ink','surface','light','composition']);check(d.qdl===1,'invalid format marker');check(FAMILIES.includes(d.family),'unknown family');
 fields(d.organ,['model','baseRadius','degreeGain','literalGain','amplitudes']);check(d.organ.model==='rosette','unknown organ model');range(d.organ.baseRadius,.01,.08);range(d.organ.degreeGain,0,.006);range(d.organ.literalGain,0,.003);check(Array.isArray(d.organ.amplitudes)&&d.organ.amplitudes.length===2,'need two radial harmonics');d.organ.amplitudes.forEach(a=>range(a,0,.45));check(d.organ.amplitudes[0]+d.organ.amplitudes[1]<1,'radial envelope may collapse');
 fields(d.filament,['model','bend','frequencyGain','ripple']);check(d.filament.model==='pinned-sine','unknown filament model');range(d.filament.bend,0,.08);range(d.filament.frequencyGain,0,.2);range(d.filament.ripple,0,.3);
 fields(d.motion,['clock','phaseRate','reducedMotion']);check(d.motion.clock==='separate'&&d.motion.reducedMotion==='freeze','motion may not control execution');range(d.motion.phaseRate,0,.05);
 fields(d.ink,['ghostAlpha','secondaryAlpha','ridgeAlpha','neutral']);for(const k of ['ghostAlpha','secondaryAlpha','ridgeAlpha'])range(d.ink[k],0,1);check(d.ink.ghostAlpha<d.ink.secondaryAlpha&&d.ink.secondaryAlpha<d.ink.ridgeAlpha,'ink hierarchy must be ghost < secondary < ridge');check(/^#[0-9a-f]{6}$/.test(d.ink.neutral),'invalid neutral RGB');
 {
  fields(d.surface,['model','ribbons','crests','spread','folds','taper','asymmetry','depth','twist','phaseLag','samples']);check(d.surface.model==='folded-ribbon','unknown surface model');
  check(Number.isInteger(d.surface.ribbons),'integer ribbons required');range(d.surface.ribbons,8,36);check(Number.isInteger(d.surface.crests),'integer crest count required');range(d.surface.crests,3,6);
  check(Number.isInteger(d.surface.folds),'integer folds required');range(d.surface.folds,2,9);
  range(d.surface.spread,.02,.24);range(d.surface.taper,.4,2.5);range(d.surface.asymmetry,0,.35);range(d.surface.depth,0,.35);range(d.surface.twist,0,3);range(d.surface.phaseLag,0,2);
  check(Number.isInteger(d.surface.samples),'integer sample budget required');range(d.surface.samples,4000,24000);
  fields(d.light,['model','recessAlpha','crestAlpha','depthContrast']);check(d.light.model==='density-crest','unknown light model');range(d.light.recessAlpha,.015,.12);range(d.light.crestAlpha,.16,.65);range(d.light.depthContrast,0,.8);check(d.light.recessAlpha<d.light.crestAlpha,'light hierarchy required');
  fields(d.composition,['occupancy','lean','yaw','pitch','focus']);range(d.composition.occupancy,.6,.84);for(const k of ['lean','yaw','pitch'])range(d.composition[k],-.5,.5);range(d.composition.focus,.15,.8);
 }
 return true;
}
function create(family='filament'){const d=clone(DEFAULT);d.family=family;
 {const presets={
 jelly:{spread:.12,folds:5,depth:.3,twist:1.6,taper:1.4,focus:.28,lean:.08,rate:.029},
 moth:{spread:.17,folds:5,depth:.25,twist:1.8,taper:.8,focus:.45,yaw:-.22,rate:.031},
 coral:{ribbons:20,spread:.12,folds:4,depth:.24,twist:1.3,taper:.7,focus:.55,lean:.02,rate:.034},
 ribbon:{spread:.19,folds:6,depth:.3,twist:2.1,taper:.55,focus:.45,lean:-.17},
 nautilus:{spread:.1,folds:6,depth:.24,twist:1.5,taper:.85,focus:.45,yaw:.36,rate:.028},
 torus:{ribbons:24,spread:.12,folds:5,depth:.28,twist:1.7,taper:.8,focus:.5,lean:.09,rate:.03},
 comet:{ribbons:24,spread:.14,folds:6,depth:.25,twist:1.6,taper:1.6,focus:.25,lean:-.16},
 bloom:{ribbons:24,spread:.12,folds:5,depth:.23,twist:1.4,taper:.9,focus:.55,lean:.08,rate:.026},
 seed:{ribbons:24,spread:.13,folds:6,depth:.25,twist:1.8,taper:.8,focus:.42,rate:.03}};
 for(const [k,v] of Object.entries(presets[family]||{})){if(Object.hasOwn(d.surface,k))d.surface[k]=v;else if(Object.hasOwn(d.composition,k))d.composition[k]=v;else if(k==='rate')d.motion.phaseRate=v;}
 }validate(d);return d;}
function organRadius(d,n,a,t){const value=n.params?.value,magnitude=typeof value==='number'?Math.min(6,Math.abs(value)):Array.isArray(value)?Math.min(6,value.length):1;const r=Math.min(.16,d.organ.baseRadius+d.organ.degreeGain*(n.indegree+n.outdegree)+d.organ.literalGain*magnitude);return r*(1+d.organ.amplitudes[0]*Math.cos(n.frequency*a)+d.organ.amplitudes[1]*Math.cos((n.outdegree+1)*a+t));}
function filamentBend(d,frequency,u,t){return d.filament.bend*(1+d.filament.frequencyGain*frequency)*Math.sin(Math.PI*u)*(1+d.filament.ripple*Math.sin(2*Math.PI*frequency*u+t));}
const api={FAMILIES,DEFAULT,validate,create,organRadius,filamentBend};if(typeof module!=='undefined')module.exports=api;root.QDL=api;
})(typeof globalThis!=='undefined'?globalThis:this);
