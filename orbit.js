/* Orbit / a deliberately small typed hypergraph interpreter. No eval, source reads, or network. */
(function(root){
'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
function canon(x){if(Array.isArray(x))return '['+x.map(canon).join(',')+']';if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canon(x[k])).join(',')+'}';return JSON.stringify(x);}
const signatures={Observe:[[],['Evidence']],Box:[[],['Box']],Permit:[[],['Capability']],Apply:[['Box','Evidence'],['Decision']],Score:[['Evidence'],['Decision']],Authorize:[['Decision','Capability'],['Action']],Execute:[['Action'],['Receipt']],Quote:[['Box'],['Code']],Decode:[['Code'],['Box']],Report:[['Receipt','Code'],['Report']]};
function validate(g,depth=0){
 if(depth>12)throw Error('Box nesting exceeds 12');
 if(!g||g.version!==1||!Array.isArray(g.wires)||!Array.isArray(g.edges)||!g.boundary)throw Error('Bad graph envelope');
 const wires=new Map(),edgeIds=new Set(),producers=new Set(),consumers=new Map();
 for(const w of g.wires){if(typeof w.id!=='string'||wires.has(w.id)||!['Evidence','Decision','Box','Capability','Action','Receipt','Code','Report'].includes(w.type))throw Error('Bad/duplicate wire');wires.set(w.id,w.type);}
 for(const w of g.boundary.inputs){if(!wires.has(w)||producers.has(w))throw Error('Bad input boundary');producers.add(w);}
 for(const e of g.edges){if(!e||typeof e.id!=='string'||edgeIds.has(e.id))throw Error('Bad/duplicate edge');edgeIds.add(e.id);const s=signatures[e.op];if(!s||!Array.isArray(e.inputs)||!Array.isArray(e.outputs)||s[0].length!==e.inputs.length||s[1].length!==e.outputs.length)throw Error('Unknown operation / arity');
 e.inputs.forEach((w,i)=>{if(wires.get(w)!==s[0][i])throw Error('Input type mismatch '+e.id);consumers.set(w,(consumers.get(w)||0)+1);});
 e.outputs.forEach((w,i)=>{if(wires.get(w)!==s[1][i]||producers.has(w))throw Error('Output type/producer mismatch '+e.id);producers.add(w);});
 if(e.op==='Box'){validate(e.graph,depth+1);if(e.graph.edges.some(x=>!['Score','Box','Apply','Quote','Decode'].includes(x.op)))throw Error('Effectful deliberation box');if(e.graph.boundary.inputs.length!==1||e.graph.boundary.outputs.length!==1||e.graph.wires.find(w=>w.id===e.graph.boundary.inputs[0]).type!=='Evidence'||e.graph.wires.find(w=>w.id===e.graph.boundary.outputs[0]).type!=='Decision')throw Error('Expected Evidence → Decision box');}
 if(e.op==='Observe'&&(!Number.isFinite(e.confidence)||e.confidence<0||e.confidence>1))throw Error('Confidence outside [0,1]');
 if(e.op==='Score'&&(!Number.isFinite(e.threshold)||e.threshold<0||e.threshold>1))throw Error('Threshold outside [0,1]');
 if(e.op==='Permit'&&typeof e.allowed!=='boolean')throw Error('Capability must be boolean');
 }
 for(const w of g.wires){if(!producers.has(w.id))throw Error('Unbound wire '+w.id);if(['Capability','Action'].includes(w.type)&&((consumers.get(w.id)||0)+g.boundary.outputs.filter(x=>x===w.id).length)>1)throw Error('Linear wire fanout '+w.id);}
 const outs=new Set();for(const w of g.boundary.outputs){if(!wires.has(w)||outs.has(w))throw Error('Bad output boundary');outs.add(w);}
 const ready=new Set(g.boundary.inputs),pending=new Set(g.edges);let changed=true;
 while(changed){changed=false;for(const e of pending)if(e.inputs.every(w=>ready.has(w))){e.outputs.forEach(w=>ready.add(w));pending.delete(e);changed=true;}}
 if(pending.size)throw Error('Cycles require explicit delay; unsupported');return true;
}
function valueType(v,t){switch(t){case 'Evidence':return v&&Number.isFinite(v.confidence)&&v.confidence>=0&&v.confidence<=1;case 'Decision':return v&&['repair','defer'].includes(v.choice);case 'Capability':return v&&typeof v.allowed==='boolean';case 'Action':return v&&typeof v.allowed==='boolean'&&['repair','defer'].includes(v.choice);case 'Receipt':return v&&['simulated','skipped'].includes(v.status);case 'Code':return typeof v==='string';case 'Report':return v&&typeof v.summary==='string';case 'Box':try{validate(v);return v.edges.every(x=>['Score','Box','Apply','Quote','Decode'].includes(x.op))&&v.boundary.inputs.length===1&&v.boundary.outputs.length===1&&v.wires.find(w=>w.id===v.boundary.inputs[0]).type==='Evidence'&&v.wires.find(w=>w.id===v.boundary.outputs[0]).type==='Decision';}catch{return false;}default:return false;}}
class Machine{
 constructor(g,args=[]){validate(g);this.graph=clone(g);this.values=new Map();this.fired=new Set();this.trace=[];this.effects=[];if(args.length!==g.boundary.inputs.length)throw Error('Boundary argument mismatch');g.boundary.inputs.forEach((w,i)=>{if(!valueType(args[i],g.wires.find(x=>x.id===w).type))throw Error('Boundary value type mismatch');this.values.set(w,clone(args[i]));});}
 ready(){return this.graph.edges.filter(e=>!this.fired.has(e.id)&&e.inputs.every(w=>this.values.has(w)));}
 step(id){const e=id?this.ready().find(e=>e.id===id):this.ready()[0];if(!e)return null;const a=e.inputs.map(w=>this.values.get(w));let v;
 switch(e.op){
 case 'Observe':v={confidence:e.confidence,subject:'broken city lamp 07',source:'simulated sensor'};break;
 case 'Box':v=clone(e.graph);break;
 case 'Permit':v={allowed:e.allowed,scope:'lamp-07',uses:1};break;
 case 'Score':v={choice:a[0].confidence>=e.threshold?'repair':'defer',confidence:a[0].confidence,threshold:e.threshold};break;
 case 'Apply':{const sub=new Machine(a[0],[a[1]]);sub.run();v=sub.output()[0];this.trace.push({rule:'open Box boundary',nested:sub.trace});break;}
 case 'Authorize':v={choice:a[0].choice,allowed:a[1].allowed&&a[0].choice==='repair',scope:a[1].scope};break;
 case 'Execute':v={status:a[0].allowed?'simulated':'skipped',scope:a[0].scope,choice:a[0].choice};if(a[0].allowed)this.effects.push({kind:'simulation-only',action:'repair lamp 07'});break;
 case 'Quote':v=canon(a[0]);break;
 case 'Decode':v=JSON.parse(a[0]);if(!valueType(v,'Box'))throw Error('Decoded code is not a valid Box');break;
 case 'Report':v={summary:a[0].status==='simulated'?'Lamp repair simulated.':'Lamp repair deferred.',receipt:a[0],boxRoundtrip:canon(JSON.parse(a[1]))===a[1]};break;
 default:throw Error('No rewrite');}
 if(!valueType(v,this.graph.wires.find(w=>w.id===e.outputs[0]).type))throw Error('Rewrite violated type');
 this.values.set(e.outputs[0],v);this.fired.add(e.id);this.trace.push({edge:e.id,rule:e.op,input:e.inputs,output:e.outputs});return e;
 }
 run(){let fuel=100;while(this.step())if(--fuel===0)throw Error('Fuel exceeded');if(this.fired.size!==this.graph.edges.length)throw Error('Stuck');return this.output();}
 output(){return this.graph.boundary.outputs.map(w=>this.values.get(w));}
}
function plan(confidence=.82,allowed=true,threshold=.7){const graph={version:1,name:'deliberation',boundary:{inputs:['seen'],outputs:['choice']},wires:[{id:'seen',type:'Evidence'},{id:'choice',type:'Decision'}],edges:[{id:'compare',op:'Score',inputs:['seen'],outputs:['choice'],threshold}]};return {version:1,name:'lamp-07 repair agent',boundary:{inputs:[],outputs:['report']},wires:[['evidence','Evidence'],['thought','Box'],['decision','Decision'],['permit','Capability'],['action','Action'],['receipt','Receipt'],['code','Code'],['restored','Box'],['report','Report']].map(([id,type])=>({id,type})),edges:[{id:'sense',op:'Observe',inputs:[],outputs:['evidence'],confidence},{id:'think',op:'Box',inputs:[],outputs:['thought'],graph},{id:'permission',op:'Permit',inputs:[],outputs:['permit'],allowed},{id:'deliberate',op:'Apply',inputs:['thought','evidence'],outputs:['decision']},{id:'authorize',op:'Authorize',inputs:['decision','permit'],outputs:['action']},{id:'act',op:'Execute',inputs:['action'],outputs:['receipt']},{id:'reflect',op:'Quote',inputs:['thought'],outputs:['code']},{id:'restore',op:'Decode',inputs:['code'],outputs:['restored']},{id:'audit',op:'Report',inputs:['receipt','code'],outputs:['report']}]};}
// Tiny staged expression language. quote constructs data; run converts closed data to a closure.
// q = apply(run(quote(D)), quote(D)); D reconstructs q through explicit constructors.
const D=['lambda','x',['emit',['makeApply',['makeRun',['makeQuote',['var','x']]],['makeQuote',['var','x']]]]];
const quine=['apply',['run',['quote',D]],['quote',D]];
function agentQuine(){const body=['lambda','x',['seq',['plan',['quote',plan()]],clone(D[2])]];return ['apply',['run',['quote',body]],['quote',body]];}
function executeTerm(program){let fuel=1000;const trace=[],emitted=[],plans=[];
 function ev(t,env){if(--fuel<0)throw Error('Term fuel exceeded');if(!Array.isArray(t))throw Error('Not a term');const [op,...a]=t;trace.push(op);
 const arities={lambda:2,var:1,quote:1,run:1,apply:2,emit:1,makeQuote:1,makeRun:1,makeApply:2,seq:2,plan:1};if(arities[op]!==a.length)throw Error('Bad term operation / arity');
 switch(op){case 'seq':ev(a[0],env);return ev(a[1],env);case 'plan':{const g=ev(a[0],env),m=new Machine(g);m.run();const record={report:m.output(),effects:m.effects,trace:m.trace};plans.push(record);return record.report;}case 'lambda':if(typeof a[0]!=='string')throw Error('Bad binder');return {closure:true,param:a[0],body:a[1],env};case 'var':if(!Object.hasOwn(env,a[0]))throw Error('Unbound variable');return env[a[0]];case 'quote':return clone(a[0]);case 'run':return ev(ev(a[0],env),Object.create(null));case 'apply':{const f=ev(a[0],env),x=ev(a[1],env);if(!f||!f.closure)throw Error('Expected closure');return ev(f.body,{...f.env,[f.param]:x});}case 'emit':{const v=ev(a[0],env);if(!Array.isArray(v))throw Error('Emit expects code');emitted.push(canon(v));return v;}case 'makeQuote':return ['quote',clone(ev(a[0],env))];case 'makeRun':return ['run',clone(ev(a[0],env))];case 'makeApply':return ['apply',clone(ev(a[0],env)),clone(ev(a[1],env))];}}
 const result=ev(program,Object.create(null));return {result,emitted,trace,plans};}
function quineCheck(){const a=executeTerm(quine),b=executeTerm(JSON.parse(a.emitted[0]));return {source:canon(quine),output:a.emitted[0],same:canon(quine)===a.emitted[0],secondGeneration:b.emitted[0]===a.emitted[0],trace:a.trace};}
// Strict uniport interaction-net slice: gamma/gamma annihilation, actual boundary rewiring.
function pairNet(){return {cells:[{id:'g1',symbol:'gamma'},{id:'g2',symbol:'gamma'}],wires:[['g1.p','g2.p'],['g1.0','a'],['g1.1','b'],['g2.0','c'],['g2.1','d']],boundary:['a','b','c','d']};}
function checkNet(n){const ports=new Set(n.boundary);for(const c of n.cells){if(c.symbol!=='gamma')throw Error('Only gamma supported');for(const p of ['p','0','1']){if(ports.has(c.id+'.'+p))throw Error('Duplicate port');ports.add(c.id+'.'+p);}}const used=new Set();for(const w of n.wires){if(w.length!==2)throw Error('Not a wire');for(const p of w){if(!ports.has(p)||used.has(p))throw Error('Invalid port incidence');used.add(p);}}if(used.size!==ports.size)throw Error('Dangling port');return true;}
function annihilate(n){checkNet(n);const link=n.wires.find(([a,b])=>a.endsWith('.p')&&b.endsWith('.p'));if(!link)return null;const [l,r]=link.map(p=>p.slice(0,-2));const partner=p=>{const w=n.wires.find(w=>w.includes(p));return w[0]===p?w[1]:w[0];};const removed=new Set([l,r].flatMap(c=>['p','0','1'].map(p=>c+'.'+p)));const wires=n.wires.filter(w=>!w.some(p=>removed.has(p)));for(let i=0;i<2;i++){const a=partner(l+'.'+i),b=partner(r+'.'+i);if(removed.has(a)||removed.has(b))throw Error('This demo only handles external auxiliary partners');wires.push([a,b]);}const out={cells:n.cells.filter(c=>c.id!==l&&c.id!==r),wires,boundary:clone(n.boundary)};checkNet(out);return out;}
const api={canon,clone,validate,Machine,plan,executeTerm,quine,agentQuine,quineCheck,pairNet,checkNet,annihilate};if(typeof module!=='undefined')module.exports=api;root.Orbit=api;
})(typeof globalThis!=='undefined'?globalThis:this);
