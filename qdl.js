(function(root){
'use strict';
const Anatomy=typeof module!=='undefined'?require('./anatomy.js'):root.Anatomy;
const FAMILIES=['filament','jelly','moth','coral','ribbon','nautilus','seed','torus','comet','bloom'];
const DEFAULT={qdl:1,family:'filament',organ:{model:'rosette',baseRadius:.03,degreeGain:.004,literalGain:.001,amplitudes:[.2,.13]},filament:{model:'pinned-sine',bend:.04,frequencyGain:.07,ripple:.16},motion:{clock:'separate',phaseRate:.038,reducedMotion:'freeze',rhythm:{model:'coupled-harmonic',mode:'periodic',rate:1,breath:.06,wave:.055,waveNumber:1.6,lag:.9,asymmetry:.28,overtone:.17}},ink:{ghostAlpha:.09,secondaryAlpha:.42,ridgeAlpha:.88,neutral:'#f0f1eb'},
 surface:{model:'folded-ribbon',ribbons:28,crests:4,spread:.16,folds:7,taper:.65,asymmetry:.25,depth:.28,twist:1.9,phaseLag:1.4,samples:24000},
 light:{model:'density-crest',recessAlpha:.045,crestAlpha:.58,depthContrast:.65},
 composition:{occupancy:.76,lean:-.12,yaw:.3,pitch:.12,focus:.38},
 chroma:{model:'material-territories',palette:'roles-1',strength:.85}};
const clone=x=>JSON.parse(JSON.stringify(x));
function check(ok,message){if(!ok)throw Error('QDL: '+message);}
function fields(obj,names,optional=[]){check(obj&&typeof obj==='object'&&!Array.isArray(obj),'expected record');check(Object.keys(obj).every(k=>names.includes(k)||optional.includes(k))&&names.every(k=>Object.hasOwn(obj,k)),'unknown or missing fields');}
function range(v,min,max){check(typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max,'number outside ['+min+','+max+']');}
function boundedString(v,min,max){check(typeof v==='string'&&Array.from(v).length>=min&&Array.from(v).length<=max,'string length outside ['+min+','+max+']');}
function validateChroma(c){
 fields(c,['model','palette','strength'],['lens']);check(c.model==='material-territories','unknown chroma model');check(c.palette==='roles-1','unknown chroma palette');range(c.strength,0,1);
 if(Object.hasOwn(c,'lens')){
  const l=c.lens;fields(l,['kind','id','label','unit','domain','bindings'],['threshold']);check(l.kind==='scalar','unknown chroma lens');boundedString(l.id,1,64);boundedString(l.label,1,80);boundedString(l.unit,0,24);
  check(Array.isArray(l.domain)&&l.domain.length===2&&l.domain.every(x=>typeof x==='number'&&Number.isFinite(x)),'need two finite domain endpoints');const [lo,hi]=l.domain;check(lo<hi&&Number.isFinite(hi-lo),'scalar domain must have finite positive width');
  if(Object.hasOwn(l,'threshold'))range(l.threshold,lo,hi);
  check(Array.isArray(l.bindings)&&l.bindings.length>=1&&l.bindings.length<=64,'need 1–64 scalar bindings');const ids=new Set();
  for(const b of l.bindings){fields(b,['node','path']);boundedString(b.node,1,64);check(!ids.has(b.node),'duplicate scalar node binding');ids.add(b.node);check(Array.isArray(b.path)&&b.path.length<=8,'scalar path exceeds eight segments');
   for(const part of b.path){if(typeof part==='string'){boundedString(part,1,64);check(!['__proto__','constructor','prototype'].includes(part),'unsafe scalar property key');}else{check(Number.isInteger(part),'scalar path needs property keys or integer indices');range(part,0,511);}}
  }
 }
}
const HEREDITY_TRAITS=['elongation','spread','curvature','gestureGain','tempo','pigmentGain'];
function validateHeredity(h){
 fields(h,['model','parents','seedDigest','nonce','traits']);check(h.model==='bounded-traits-experimental','unknown heredity model');
 const hash=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
 check(Array.isArray(h.parents)&&h.parents.length===2&&h.parents.every(hash),'heredity needs two complete-source SHA256 assertions');check(hash(h.seedDigest),'invalid heredity seed digest');
 range(h.nonce,0,4294967295);check(Number.isInteger(h.nonce),'heredity nonce must be uint32');fields(h.traits,HEREDITY_TRAITS);
 for(const k of HEREDITY_TRAITS){range(h.traits[k],-1000,1000);check(Number.isInteger(h.traits[k]),'heredity traits must be bounded integers');}
 return true;
}
function validate(d){
 fields(d,['qdl','family','organ','filament','motion','ink','surface','light','composition'],['chroma','anatomy','heredity']);check(d.qdl===1,'invalid format marker');check(FAMILIES.includes(d.family),'unknown family');
 if(Object.hasOwn(d,'heredity'))validateHeredity(d.heredity);
 if(Object.hasOwn(d,'chroma'))validateChroma(d.chroma);
 if(Object.hasOwn(d,'anatomy')){check(Anatomy,'assembly module missing');Anatomy.validate(d.anatomy);check(Object.hasOwn(d.motion||{},'gesture'),'assembly requires an authored gesture');}

 fields(d.organ,['model','baseRadius','degreeGain','literalGain','amplitudes']);check(d.organ.model==='rosette','unknown organ model');range(d.organ.baseRadius,.01,.08);range(d.organ.degreeGain,0,.006);range(d.organ.literalGain,0,.003);check(Array.isArray(d.organ.amplitudes)&&d.organ.amplitudes.length===2,'need two radial harmonics');d.organ.amplitudes.forEach(a=>range(a,0,.45));check(d.organ.amplitudes[0]+d.organ.amplitudes[1]<1,'radial envelope may collapse');
 fields(d.filament,['model','bend','frequencyGain','ripple']);check(d.filament.model==='pinned-sine','unknown filament model');range(d.filament.bend,0,.08);range(d.filament.frequencyGain,0,.2);range(d.filament.ripple,0,.3);
 fields(d.motion,['clock','phaseRate','reducedMotion'],['rhythm','gesture']);check(d.motion.clock==='separate'&&d.motion.reducedMotion==='freeze','motion may not control execution');range(d.motion.phaseRate,0,.05);
 if(Object.hasOwn(d.motion,'gesture')){check(Object.hasOwn(d,'anatomy'),'gesture requires assembly anatomy');Anatomy.validateGesture(d.motion.gesture);}
 if(Object.hasOwn(d.motion,'rhythm')){const r=d.motion.rhythm;fields(r,['model','mode','rate','breath','wave','waveNumber','lag','asymmetry','overtone']);check(r.model==='coupled-harmonic','unknown rhythm model');check(['periodic','quasiperiodic'].includes(r.mode),'unknown rhythm mode');range(r.rate,.25,2);range(r.breath,0,.18);range(r.wave,0,.18);range(r.waveNumber,0,4);range(r.lag,0,2);range(r.asymmetry,0,.8);range(r.overtone,0,.35);}
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
 }
 // The rhythm is authored source, not inferred from the current animation frame.
 const rhythms={
  filament:{breath:.06,wave:.055,waveNumber:1.6,lag:.9,asymmetry:.28,overtone:.17},
  jelly:{rate:.8,breath:.14,wave:.075,waveNumber:1.2,lag:1.1,asymmetry:.65,overtone:.2},
  moth:{rate:1.35,breath:.045,wave:.075,waveNumber:1,lag:.55,asymmetry:.4,overtone:.22},
  coral:{mode:'quasiperiodic',rate:.55,breath:.035,wave:.04,waveNumber:2.4,lag:1.25,asymmetry:.18,overtone:.25},
  ribbon:{rate:.85,breath:.055,wave:.095,waveNumber:2.6,lag:1.4,asymmetry:.32,overtone:.23},
  nautilus:{rate:.65,breath:.08,wave:.045,waveNumber:1.8,lag:1.1,asymmetry:.45,overtone:.18},
  seed:{rate:.6,breath:.075,wave:.035,waveNumber:1.4,lag:.8,asymmetry:.3,overtone:.12},
  torus:{rate:.9,breath:.085,wave:.055,waveNumber:3,lag:.6,asymmetry:.25,overtone:.2},
  comet:{rate:1.15,breath:.045,wave:.09,waveNumber:2.8,lag:1.5,asymmetry:.48,overtone:.2},
  bloom:{mode:'quasiperiodic',rate:.55,breath:.11,wave:.05,waveNumber:2,lag:.85,asymmetry:.35,overtone:.28}
 };
 Object.assign(d.motion.rhythm,rhythms[family]||{});
 validate(d);return d;}
function validateBindings(d,graph){
 validate(d);if(d.anatomy)Anatomy.validateOwners(d.anatomy,graph);if(!d.chroma?.lens)return true;
 check(graph&&Array.isArray(graph.nodes),'scalar bindings require a task graph');const ids=new Set(graph.nodes.map(n=>n.id));
 for(const b of d.chroma.lens.bindings)check(ids.has(b.node),'unknown scalar binding node '+b.node);
 return true;
}
function fromGraph(graph,seed){
 const ns=Array.isArray(graph)?graph:graph?.nodes||[];let h=2166136261,litSum=0,litCount=0,inMax=0,outMax=0,guards=0,effects=0;const ops=new Set(),outDeg=new Map(),inDeg=new Map(ns.map(n=>[n.id,0]));
 const addStr=s=>{for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;};
 const scan=v=>{if(typeof v==='number'&&Number.isFinite(v)){litSum+=Math.log1p(Math.min(1e6,Math.abs(v)));litCount++;addStr(String(v));}else if(Array.isArray(v)){litSum+=Math.log1p(v.length);litCount++;for(let i=0;i<Math.min(16,v.length);i++)scan(v[i]);}else if(v&&typeof v==='object'){for(const k of Object.keys(v).sort()){addStr(k);scan(v[k]);}}};
 for(const n of ns){ops.add(n.op||'');const deps=(n.args||n.inputs||[]).map(d=>typeof d==='string'?d:d?.node||'').filter(Boolean);inDeg.set(n.id,deps.length);for(const id of deps)outDeg.set(id,(outDeg.get(id)||0)+1);if(/^(guard|filter|if|condition)$/.test(n.op||''))guards++;if(/^(action|effect)$/.test(n.op||''))effects++;addStr((n.id||'')+':'+(n.op||'')+':'+deps.join(','));if(n.params)scan(n.params);}
 for(const v of inDeg.values())if(v>inMax)inMax=v;for(const v of outDeg.values())if(v>outMax)outMax=v;
 const mix=((seed===undefined?h:(seed^h))>>>0),r0=(mix&0xffff)/65535,r1=((mix>>>16)&0xffff)/65535,litNorm=litCount?Math.min(1,litSum/(litCount*4.2)):r0,opNorm=Math.min(1,ops.size*.12+r1*.25);
 const hasTree=ns.some(n=>/^(choose|Apply|Box|retry)$/.test(n.op||'')),hasCoupled=ns.some(n=>/^(consensus|reconcile|evidence|evidenceFresh|compareValues|Score|Quote|Decode)$/.test(n.op||'')),hasPipe=ns.some(n=>/^(dedupe|sort|length|select|clamp)$/.test(n.op||''));
 const family=guards>0?'jelly':(effects===0&&outMax>=2&&hasTree)?'coral':(effects===0&&hasCoupled)?'moth':(effects===0&&outMax<=1&&ns.length>=4&&hasPipe)?'ribbon':outMax>=2?'comet':effects>0?'torus':inMax>=2?'nautilus':'bloom';
 const d=create(family);
 Object.assign(d.composition,{yaw:0,pitch:0,lean:0,focus:Number(Math.max(.18,Math.min(.76,d.composition.focus+(.5-litNorm)*.12)).toFixed(3)),occupancy:Number(Math.max(.64,Math.min(.82,.72+.08*opNorm)).toFixed(3))});
 d.motion.phaseRate=Number(Math.max(.018,Math.min(.048,d.motion.phaseRate*(.82+.36*litNorm+.14*opNorm))).toFixed(4));
 Object.assign(d.motion.rhythm,{
  mode:(hasTree||hasCoupled||inMax>=2&&outMax>=2)?'quasiperiodic':d.motion.rhythm.mode,
  rate:Number(Math.max(.35,Math.min(1.85,d.motion.rhythm.rate*(.78+.48*litNorm+.22*opNorm))).toFixed(3)),
  breath:Number(Math.max(.025,Math.min(.17,d.motion.rhythm.breath*(.8+.45*r0))).toFixed(3)),
  wave:Number(Math.max(.025,Math.min(.16,d.motion.rhythm.wave*(.8+.45*litNorm))).toFixed(3)),
  waveNumber:Number(Math.max(.8,Math.min(3.8,d.motion.rhythm.waveNumber*(.85+.35*opNorm))).toFixed(3)),
  lag:Number(Math.max(.25,Math.min(1.85,d.motion.rhythm.lag*(.82+.36*r1))).toFixed(3)),
  asymmetry:Number(Math.max(.08,Math.min(.75,d.motion.rhythm.asymmetry*(.75+.5*opNorm))).toFixed(3)),
  overtone:Number(Math.max(.08,Math.min(.33,d.motion.rhythm.overtone*(.8+.45*litNorm))).toFixed(3))
 });
 Object.assign(d.surface,{
  ribbons:Math.max(12,Math.min(34,Math.round(d.surface.ribbons*(.85+.3*opNorm)))),
  crests:Math.max(3,Math.min(6,3+Math.min(3,Math.floor((inMax+outMax+Math.round(litNorm*2))/2)))),
  folds:Math.max(3,Math.min(9,Math.round(d.surface.folds+.8*(litNorm-.3)+(inMax>1?1:0)))),
  spread:Number(Math.max(.06,Math.min(.22,d.surface.spread*(.85+.32*litNorm))).toFixed(3)),
  twist:Number(Math.max(.8,Math.min(2.8,d.surface.twist*(.82+.38*opNorm))).toFixed(3))
 });
 const neutrals=['#f0f1eb','#ebf1f0','#f2eee9','#eceff4','#eef2ec','#f1edf2','#eaf1ee','#f2f0e8'];
 d.ink.neutral=neutrals[mix%neutrals.length];
 d.chroma.strength=Number((.48+.30*(.55*opNorm+.45*litNorm)).toFixed(3));
 validate(d);return d;
}
function forProgram(item){if(item?.graph&&!item?.skin)return fromGraph(item.graph,item.seed);const d=create(item.skin.family);if(Object.hasOwn(item.skin,'chroma')){validateChroma(item.skin.chroma);d.chroma=clone(item.skin.chroma);}validate(d);return d;}
function organRadius(d,n,a,t){const value=n.params?.value,magnitude=typeof value==='number'?Math.min(6,Math.abs(value)):Array.isArray(value)?Math.min(6,value.length):1;const r=Math.min(.16,d.organ.baseRadius+d.organ.degreeGain*(n.indegree+n.outdegree)+d.organ.literalGain*magnitude);return r*(1+d.organ.amplitudes[0]*Math.cos(n.frequency*a)+d.organ.amplitudes[1]*Math.cos((n.outdegree+1)*a+t));}
function filamentBend(d,frequency,u,t){return d.filament.bend*(1+d.filament.frequencyGain*frequency)*Math.sin(Math.PI*u)*(1+d.filament.ripple*Math.sin(2*Math.PI*frequency*u+t));}
const api={FAMILIES,DEFAULT,HEREDITY_TRAITS,validateHeredity,validate,validateBindings,create,fromGraph,forProgram,organRadius,filamentBend};if(typeof module!=='undefined')module.exports=api;root.QDL=api;
})(typeof globalThis!=='undefined'?globalThis:this);
