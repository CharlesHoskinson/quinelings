(function(root){
'use strict';
const O=typeof module!=='undefined'?require('./orbit.js'):root.Orbit;
const K=typeof module!=='undefined'?require('./kernels.js'):root.QuinelingKernels;
const Design=typeof module!=='undefined'?require('./qdl.js'):root.QDL;
const clone=O.clone,canon=O.canon,TAU=2*Math.PI;
const OPS=['Observe','Box','Permit','Apply','Score','Authorize','Execute','Quote','Decode','Report',...Object.keys(K.ARITY)];
function hslHex(h,s,l){const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');};return '#'+f(0)+f(8)+f(4);}
const ROLE_HUE={literal:190,compare:43,choose:46,consensus:39,evidence:51,action:16,retry:220,report:133};
const COLORS=['#72d9e2','#bb91ed','#e6c66a','#6ad4a0','#eb90ba','#efaa73','#b5e681','#899be8','#77bce9','#d6e6be',...Object.keys(K.ARITY).map((op,i)=>hslHex((ROLE_HUE[op]??158)+(i%5)*2,.37+.008*i,.64+.003*i))];
function instructionColor(op){const i=OPS.indexOf(op);if(i<0)throw Error('Unknown instruction');return COLORS[i];}
function instructionFromColor(hex){const i=COLORS.indexOf(String(hex).toLowerCase());if(i<0)throw Error('Unknown instruction color');return OPS[i];}
function makeProgram(confidence=.82,allowed=true,threshold=.7,repeats=1,reflection=true){
 if(!Number.isInteger(repeats)||repeats<1||repeats>8)throw Error('Repeat count must be 1–8');
 const graph=O.plan(confidence,allowed,threshold);
 if(!reflection){graph.edges=graph.edges.filter(e=>e.id!=='restore');graph.wires=graph.wires.filter(w=>w.id!=='restored');}
 O.validate(graph);
 const constructor=['emit',['makeApply',['makeRun',['makeQuote',['var','x']]],['makeQuote',['var','x']]]];
 const body=['lambda','x',['seq',['repeat',repeats,['plan',['quote',graph]]],constructor]];
 return ['apply',['run',['quote',body]],['quote',clone(body)]];
}
function makeTaskProgram(graph,repeats=1,design=Design.create()){
 K.validate(graph);if(!Number.isInteger(repeats)||repeats<1||repeats>8)throw Error('Repeat count must be 1–8');
 Design.validate(design);graph=clone(graph);graph.design=clone(design);
 const constructor=['emit',['makeApply',['makeRun',['makeQuote',['var','x']]],['makeQuote',['var','x']]]];
 const body=['lambda','x',['seq',['repeat',repeats,['task',['quote',clone(graph)]]],constructor]];
 return ['apply',['run',['quote',body]],['quote',clone(body)]];
}
function execute(program){
 let fuel=20000;const emitted=[],plans=[],tasks=[],trace=[];
 function ev(t,env){
  if(--fuel<0)throw Error('Execution fuel exhausted');
  if(!Array.isArray(t))throw Error('Expected expression');
  const [op,...a]=t;
  const arity={lambda:2,var:1,quote:1,run:1,apply:2,emit:1,makeQuote:1,makeRun:1,makeApply:2,seq:2,plan:1,task:1,repeat:2};
  if(!Object.hasOwn(arity,op)||a.length!==arity[op])throw Error('Invalid expression operation or arity');
  trace.push({kind:'term',op});
  switch(op){
   case 'lambda':if(typeof a[0]!=='string')throw Error('Invalid binder');return {closure:true,param:a[0],body:a[1],env};
   case 'var':if(!Object.hasOwn(env,a[0]))throw Error('Unbound variable');return env[a[0]];
   case 'quote':return clone(a[0]);
   case 'run':return ev(ev(a[0],env),Object.create(null));
   case 'apply':{const f=ev(a[0],env),x=ev(a[1],env);if(!f?.closure)throw Error('Expected closure');return ev(f.body,{...f.env,[f.param]:x});}
   case 'seq':ev(a[0],env);return ev(a[1],env);
   case 'repeat':{if(!Number.isInteger(a[0])||a[0]<1||a[0]>8)throw Error('Repeat budget exceeded');let v;for(let i=0;i<a[0];i++){trace.push({kind:'loop',op:'repeat',iteration:i+1,total:a[0]});v=ev(a[1],env);}return v;}
   case 'plan':{const graph=ev(a[0],env),m=new O.Machine(graph);m.run();plans.push({graph:clone(graph),report:m.output(),effects:m.effects,trace:m.trace});trace.push(...m.trace.map(e=>({kind:'graph',...e})));return m.output();}
   case 'task':{const graph=ev(a[0],env);if(graph?.design)Design.validate(graph.design);const record=K.run(graph);tasks.push(record);trace.push(...record.trace.map(e=>({kind:'graph',...e})));return record.output;}
   case 'emit':{const v=ev(a[0],env);if(!Array.isArray(v))throw Error('Emit expects a program');emitted.push(canon(v));return v;}
   case 'makeQuote':return ['quote',clone(ev(a[0],env))];
   case 'makeRun':return ['run',clone(ev(a[0],env))];
   case 'makeApply':return ['apply',clone(ev(a[0],env)),clone(ev(a[1],env))];
  }
 }
 const result=ev(program,Object.create(null));return {result,emitted,plans,tasks,trace,steps:20000-fuel+tasks.reduce((s,t)=>s+t.trace.length,0)};
}
function checksum(bytes){let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619)>>>0;return h;}
function encode(program){
 const data=new TextEncoder().encode(canon(program));if(data.length>65536)throw Error('Genome exceeds 64 KiB');
 const bytes=new Uint8Array(12+data.length);bytes.set([81,76,78,71]);const view=new DataView(bytes.buffer);view.setUint32(4,data.length);bytes.set(data,8);view.setUint32(8+data.length,checksum(data));
 const bands=[];for(let i=0;i<bytes.length;i+=32){const a=Array(32).fill(0);bytes.slice(i,i+32).forEach((b,j)=>a[j]=b+1);bands.push(a);}
 return {format:'quineling-harmonics-1',bands};
}
function validateGenome(g){if(!g||g.format!=='quineling-harmonics-1'||!Array.isArray(g.bands)||g.bands.length<1||g.bands.length>2049)throw Error('Invalid harmonic genome');for(const a of g.bands)if(!Array.isArray(a)||a.length!==32||a.some(x=>!Number.isInteger(x)||x<0||x>256))throw Error('Invalid harmonic coefficient');}
function decode(g){
 validateGenome(g);const values=g.bands.flat();if(values.slice(0,8).some(x=>x===0))throw Error('Missing header');
 const bytes=Uint8Array.from(values,x=>Math.max(0,x-1));if(bytes.slice(0,4).join(',')!=='81,76,78,71')throw Error('Invalid genome magic');
 const v=new DataView(bytes.buffer),n=v.getUint32(4);if(n>65536||n+12>bytes.length||g.bands.length!==Math.ceil((n+12)/32))throw Error('Invalid genome length');
 if(values.slice(0,n+12).some(x=>x===0)||values.slice(n+12).some(x=>x!==0))throw Error('Invalid padding');
 const data=bytes.slice(8,8+n);if(checksum(data)!==v.getUint32(8+n))throw Error('Genome checksum mismatch');
 const text=new TextDecoder('utf-8',{fatal:true}).decode(data),program=JSON.parse(text);if(canon(program)!==text)throw Error('Noncanonical source');return program;
}
// Each exact RGB triplet carries one byte. Two redundant channels reject color drift.
function encodeColors(program){const g=encode(program);return {format:'quineling-chroma-1',pixels:g.bands.map(a=>a.map(c=>{if(c===0)return null;const b=c-1;return [b,255-b,(73*b+19)%256];}))};}
function decodeColors(g){
 if(!g||g.format!=='quineling-chroma-1'||!Array.isArray(g.pixels)||g.pixels.length<1||g.pixels.length>2049)throw Error('Invalid color genome');
 const bands=g.pixels.map(row=>{if(!Array.isArray(row)||row.length!==32)throw Error('Need 32 colors per band');return row.map(rgb=>{if(rgb===null)return 0;if(!Array.isArray(rgb)||rgb.length!==3||rgb.some(x=>!Number.isInteger(x)||x<0||x>255)||rgb[1]!==255-rgb[0]||rgb[2]!==(73*rgb[0]+19)%256)throw Error('Color is outside the exact byte palette');return rgb[0]+1;});});
 return decode({format:'quineling-harmonics-1',bands});
}
function wave(coefficients,theta){return coefficients.reduce((sum,a,k)=>sum+a*Math.cos((k+1)*theta),0);}
function samples(g){validateGenome(g);return g.bands.map(a=>Array.from({length:65},(_,j)=>wave(a,TAU*j/65)));}
function fromSamples(records){
 if(!Array.isArray(records)||records.length<1||records.length>2049)throw Error('Invalid sampled genome');
 const bands=records.map(row=>{
  if(!Array.isArray(row)||row.length!==65||row.some(x=>!Number.isFinite(x)))throw Error('Need 65 finite equally spaced samples per band');
  const a=Array.from({length:32},(_,k)=>2/65*row.reduce((s,v,j)=>s+v*Math.cos((k+1)*TAU*j/65),0));
  if(a.some(x=>Math.abs(x-Math.round(x))>1e-6||x<-.000001||x>256.000001))throw Error('Samples do not encode integer coefficients');
  const ints=a.map(x=>Math.round(x)||0);if(row.some((v,j)=>Math.abs(v-wave(ints,TAU*j/65))>1e-5))throw Error('Samples contain an unsupported harmonic');return ints;
 });
 const g={format:'quineling-harmonics-1',bands};decode(g);return g;
}
function describe(program){
 let graph=null,repeats=1,quoteDepth=0;
 function visit(t,depth=0){if(!Array.isArray(t))return;if(t[0]==='quote')quoteDepth=Math.max(quoteDepth,depth+1);if(t[0]==='repeat'&&Number.isInteger(t[1]))repeats=t[1];if(t[0]==='plan'&&t[1]?.[0]==='quote'&&!graph)graph=clone(t[1][1]);for(const x of t.slice(1))visit(x,depth+(t[0]==='quote'?1:0));}
 function visitTask(t,depth=0){if(!Array.isArray(t))return;if(t[0]==='quote')quoteDepth=Math.max(quoteDepth,depth+1);if(t[0]==='repeat'&&Number.isInteger(t[1]))repeats=t[1];if(t[0]==='task'&&t[1]?.[0]==='quote'&&!graph)graph=clone(t[1][1]);for(const x of t.slice(1))visitTask(x,depth+(t[0]==='quote'?1:0));}
 visit(program);if(!graph)visitTask(program);if(!graph)throw Error('No quoted thought graph');const isTask=Array.isArray(graph.nodes);if(isTask)K.validate(graph);else O.validate(graph);
 const nodes=[],links=[];
 function project(g,scope,parent){const producers=new Map();g.edges.forEach(e=>e.outputs.forEach(w=>producers.set(w,scope+e.id)));for(const e of g.edges){const id=scope+e.id;nodes.push({id,op:e.op,parent,inputs:e.inputs.length,outputs:e.outputs.length,params:e});for(let port=0;port<e.inputs.length;port++){const from=producers.get(e.inputs[port]);if(from)links.push({from,to:id,port,type:g.wires.find(w=>w.id===e.inputs[port]).type});}if(e.op==='Box')project(e.graph,id+'/',id);}}
 if(isTask){for(const n of graph.nodes){nodes.push({id:n.id,op:n.op,parent:null,inputs:n.inputs.length,outputs:1,params:n.params});n.inputs.forEach((id,port)=>links.push({from:id,to:n.id,port,type:'Data'}));}}else project(graph,'',null);const top=nodes.filter(n=>!n.parent),depths=new Map();
 function depth(id,path=new Set()){if(depths.has(id))return depths.get(id);if(path.has(id))throw Error('Unbounded cycle');const next=new Set(path).add(id),inputs=links.filter(e=>e.to===id);const d=inputs.length?1+Math.max(...inputs.map(e=>depth(e.from,next))):0;depths.set(id,d);return d;}
 top.forEach(n=>depth(n.id));const max=Math.max(...depths.values(),1);
 nodes.forEach((n,i)=>{n.outdegree=links.filter(e=>e.from===n.id).length;n.indegree=links.filter(e=>e.to===n.id).length;n.frequency=OPS.indexOf(n.op)+1;n.level=n.parent?depths.get(n.parent)||0:depths.get(n.id);n.u=(n.level+.5)/(max+1);n.side=((i%2)*2-1)*(n.op==='Permit'?.62:n.op==='Box'?.42:.24);});
 const design=isTask?(graph.design||Design.create()):Design.create();Design.validate(design);
 return {graph,nodes,links,repeats,quoteDepth,branches:top.reduce((s,n)=>s+Math.max(0,n.outdegree-1),0),maxDepth:max,design};
}
function nodePosition(n,t,shape){if(n.parent){const p=nodePosition(shape.nodes.find(x=>x.id===n.parent),t,shape);return {x:p.x+.015*Math.sin(t+n.frequency),y:p.y+.016*Math.cos(t+n.frequency)};}const y=(n.u-.5)*1.65;return {x:.11*Math.sin(TAU*n.u+.3*Math.sin(t))+n.side*(.75+.09*Math.sin(t+n.frequency)),y:y+.028*Math.sin(t+n.frequency)};}
function edgePoint(link,s,t,shape){const a=nodePosition(shape.nodes.find(n=>n.id===link.from),t,shape),b=nodePosition(shape.nodes.find(n=>n.id===link.to),t,shape);const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;const f=1+link.port+shape.nodes.find(n=>n.id===link.from).frequency;const bend=Design.filamentBend(shape.design||Design.DEFAULT,f,s,t);return {x:a.x+dx*s-dy/len*bend,y:a.y+dy*s+dx/len*bend};}
const api={canon,makeProgram,makeTaskProgram,runTask:K.run,validateTask:K.validate,execute,encode,decode,encodeColors,decodeColors,instructionColor,instructionFromColor,wave,samples,fromSamples,describe,nodePosition,edgePoint,OPS,COLORS,TAU};if(typeof module!=='undefined')module.exports=api;root.Quinelings=api;
})(typeof globalThis!=='undefined'?globalThis:this);
