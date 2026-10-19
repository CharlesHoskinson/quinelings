// Bundled from upstream /home/charles/repos/quinelings (SDK + QDL + WovenBody + LifeformFamilies)
const module = undefined;

// --- orbit.js ---
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


// --- kernels.js ---
(function(root){
'use strict';
const O=typeof module!=='undefined'?require('./orbit.js'):root.Orbit,canon=O.canon,clone=O.clone;
const ARITY={literal:0,sum:1,mean:1,min:1,max:1,weightedMean:2,length:1,map:1,sort:1,dedupe:1,filter:1,compare:1,choose:3,get:1,clamp:1,budget:2,action:2,report:-1,bfs:2,allocate:2,schedule:1,consensus:1,retry:1,evidence:1};
const badKeys=new Set(['__proto__','constructor','prototype']);
function requireThat(ok,message){if(!ok)throw Error(message);}
function number(x){requireThat(typeof x==='number'&&Number.isFinite(x),'Expected finite number');return x;}
function nonnegative(x){number(x);requireThat(x>=0,'Expected nonnegative number');return x;}
function integer(x){nonnegative(x);requireThat(Number.isSafeInteger(x),'Expected nonnegative safe integer');return x;}
function array(x){requireThat(Array.isArray(x)&&x.length<=512,'Expected array with at most 512 items');return x;}
function numbers(x){array(x).forEach(number);return x;}
function record(x){requireThat(x&&typeof x==='object'&&!Array.isArray(x),'Expected record');return x;}
function key(x){requireThat(typeof x==='string'&&x.length>0&&!badKeys.has(x),'Invalid property key');return x;}
function get(x,path){let v=x;requireThat(typeof path==='string','Expected property path');for(const part of path.split('.')){key(part);requireThat(v!==null&&typeof v==='object'&&Object.hasOwn(v,part),'Missing own property '+part);v=v[part];}return v;}
function compare(a,b,op){if(op==='eq')return canon(a)===canon(b);if(op==='ne')return canon(a)!==canon(b);requireThat((typeof a==='number'&&typeof b==='number')||(typeof a==='string'&&typeof b==='string'),'Ordering needs two numbers or two strings');switch(op){case 'gt':return a>b;case 'gte':return a>=b;case 'lt':return a<b;case 'lte':return a<=b;default:throw Error('Unknown comparison');}}
function boundedJSON(value,depth=0,seen=new Set()){
 requireThat(depth<=24,'JSON depth exceeds 24');
 if(value===null||typeof value==='boolean')return;
 if(typeof value==='string'){requireThat(value.length<=16384,'String too long');return;}
 if(typeof value==='number'){number(value);return;}
 requireThat(value&&typeof value==='object','Expected finite JSON');requireThat(!seen.has(value),'Cyclic value');const next=new Set(seen).add(value);
 if(Array.isArray(value)){array(value);value.forEach(v=>boundedJSON(v,depth+1,next));}
 else{requireThat(Object.keys(value).length<=512,'Record too large');for(const k of Object.keys(value)){key(k);boundedJSON(value[k],depth+1,next);}}
}
function validate(graph){
 requireThat(graph&&graph.version===1&&Array.isArray(graph.nodes)&&graph.nodes.length>0&&graph.nodes.length<=64&&Array.isArray(graph.outputs),'Invalid task graph');boundedJSON(graph);requireThat(new TextEncoder().encode(canon(graph)).length<=65536,'Task graph exceeds 64 KiB');
 const ids=new Set();for(const n of graph.nodes){requireThat(n&&typeof n.id==='string'&&n.id.length>0&&!ids.has(n.id),'Invalid or duplicate node ID');ids.add(n.id);requireThat(Object.hasOwn(ARITY,n.op),'Unknown kernel '+n.op);requireThat(Array.isArray(n.inputs)&&n.inputs.length<=16&&(ARITY[n.op]<0||n.inputs.length===ARITY[n.op]),'Invalid kernel arity');record(n.params);}
 for(const n of graph.nodes)for(const id of n.inputs)requireThat(typeof id==='string'&&ids.has(id),'Unknown input node');for(const id of graph.outputs)requireThat(ids.has(id),'Unknown output node');requireThat(graph.outputs.length>0&&graph.outputs.length<=16,'Invalid output boundary');
 const ready=new Set(),pending=new Set(graph.nodes);let changed=true;while(changed){changed=false;for(const n of pending)if(n.inputs.every(id=>ready.has(id))){ready.add(n.id);pending.delete(n);changed=true;}}requireThat(!pending.size,'Task graph has an unbounded cycle');return true;
}
function calculate(op,a,p){
 switch(op){
 case 'literal':requireThat(Object.hasOwn(p,'value'),'Literal needs value');return clone(p.value);
 case 'sum':return numbers(a[0]).reduce((s,v)=>s+v,0);
 case 'mean':{const v=numbers(a[0]);requireThat(v.length>0,'Mean requires values');return v.reduce((s,x)=>s+x,0)/v.length;}
 case 'min':case 'max':{const v=numbers(a[0]);requireThat(v.length>0,'Extremum requires values');return Math[op](...v);}
 case 'weightedMean':{const v=numbers(a[0]),w=numbers(a[1]);requireThat(v.length>0&&v.length===w.length,'Weighted arrays must match');w.forEach(nonnegative);const total=number(w.reduce((s,x)=>s+x,0));requireThat(total>0,'Weights have zero mass');const weighted=number(v.reduce((s,x,i)=>s+x*w[i],0));return number(weighted/total);}
 case 'length':requireThat(typeof a[0]==='string'||Array.isArray(a[0]),'Length needs array or string');return a[0].length;
 case 'map':requireThat(['square','multiply'].includes(p.kind),'Unknown map operation');if(p.kind==='multiply')number(p.factor);return numbers(a[0]).map(x=>p.kind==='square'?x*x:x*p.factor);
 case 'sort':{if(Object.hasOwn(p,'descending'))requireThat(typeof p.descending==='boolean','Descending flag must be Boolean');const rows=array(a[0]).map((v,i)=>({v,i,k:p.key?get(v,p.key):v}));for(const r of rows)requireThat(typeof r.k==='number'||typeof r.k==='string','Sort key must be number or string');rows.sort((a,b)=>{requireThat(typeof a.k===typeof b.k,'Mixed sort key types');return ((a.k<b.k?-1:a.k>b.k?1:0)*(p.descending?-1:1))||a.i-b.i;});return rows.map(r=>clone(r.v));}
 case 'dedupe':{const seen=new Set();return array(a[0]).filter(v=>{const k=canon(p.key?get(v,p.key):v);if(seen.has(k))return false;seen.add(k);return true;}).map(clone);}
 case 'filter':requireThat(['eq','ne','gt','gte','lt','lte'].includes(p.operator),'Unknown comparison');return array(a[0]).filter(v=>compare(p.key?get(v,p.key):v,p.value,p.operator)).map(clone);
 case 'compare':return compare(a[0],p.value,p.operator);
 case 'choose':requireThat(typeof a[0]==='boolean','Choice guard must be Boolean');return clone(a[a[0]?1:2]);
 case 'get':record(a[0]);return clone(get(a[0],p.path));
 case 'clamp':number(a[0]);number(p.min);number(p.max);requireThat(p.min<=p.max,'Invalid clamp interval');return Math.max(p.min,Math.min(p.max,a[0]));
 case 'budget':{const available=nonnegative(a[0]),desired=nonnegative(a[1]),allocated=Math.min(available,desired);return {allocated,remaining:available-allocated};}
 case 'action':requireThat(typeof a[0]==='boolean'&&typeof p.allowed==='boolean'&&typeof p.action==='string','Invalid simulated action');return {status:a[0]&&p.allowed?'simulated':'skipped',action:p.action,payload:clone(a[1])};
 case 'report':{requireThat(Array.isArray(p.labels)&&p.labels.length===a.length&&new Set(p.labels).size===p.labels.length,'Report labels must match inputs');const out=Object.create(null);p.labels.forEach((label,i)=>out[key(label)]=clone(a[i]));return out;}
 case 'bfs':{const adj=record(a[0]),blockedValues=array(a[1]);requireThat(blockedValues.every(x=>typeof x==='string'),'Blocked node IDs must be strings');const blocked=new Set(blockedValues);requireThat(typeof p.start==='string'&&typeof p.goal==='string','Route endpoints must be strings');for(const neighbors of Object.values(adj))requireThat(array(neighbors).every(x=>typeof x==='string'),'Route neighbor must be string');const miss={found:false,path:[],distance:null};if(blocked.has(p.start)||blocked.has(p.goal))return miss;const queue=[[p.start]],seen=new Set([p.start]);while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===p.goal)return {found:true,path,distance:path.length-1};const neighbors=Object.hasOwn(adj,last)?adj[last]:[];for(const id of neighbors)if(!seen.has(id)&&!blocked.has(id)){requireThat(seen.size<512,'Route search budget exceeded');seen.add(id);queue.push([...path,id]);}}return miss;}
 case 'allocate':{let remaining=integer(a[0]);const ids=new Set();const grants=array(a[1]).map(row=>{record(row);requireThat(typeof row.id==='string'&&!ids.has(row.id),'Duplicate allocation ID');ids.add(row.id);const requested=integer(row.amount),granted=Math.min(requested,remaining);remaining-=granted;return {id:row.id,requested,granted};});return {grants,remaining};}
 case 'schedule':{const jobs=array(a[0]),ids=new Set();for(const j of jobs){record(j);requireThat(typeof j.id==='string'&&!ids.has(j.id),'Duplicate job ID');ids.add(j.id);array(j.depends);nonnegative(j.duration);}for(const j of jobs)requireThat(j.depends.every(id=>ids.has(id)),'Missing job dependency');const pending=[...jobs],done=new Map(),order=[],result=[];while(pending.length){const index=pending.findIndex(j=>j.depends.every(id=>done.has(id)));requireThat(index>=0,'Schedule has dependency cycle');const [j]=pending.splice(index,1),start=Math.max(0,...j.depends.map(id=>done.get(id))),end=start+j.duration;number(end);done.set(j.id,end);order.push(j.id);result.push({id:j.id,start,end});}return {order,jobs:result,makespan:Math.max(0,...done.values())};}
 case 'consensus':{integer(p.required);requireThat(p.required>0,'Consensus threshold must be positive');const seen=new Set(),counts=new Map();for(const vote of array(a[0])){record(vote);requireThat(typeof vote.source==='string'&&typeof vote.choice==='string','Invalid vote');if(seen.has(vote.source))continue;seen.add(vote.source);counts.set(vote.choice,(counts.get(vote.choice)||0)+1);}let choice=null,support=0;for(const [c,n] of counts)if(n>support){choice=c;support=n;}return {choice,support,accepted:support>=p.required,uniqueSources:seen.size};}
 case 'retry':{requireThat(Number.isInteger(p.maxAttempts)&&p.maxAttempts>=1&&p.maxAttempts<=8,'Retry bound must be 1–8');const values=array(a[0]);requireThat(values.every(x=>['retry','ok','unknown'].includes(x)),'Invalid retry outcome');const history=[];let status='exhausted';for(const value of values.slice(0,p.maxAttempts)){history.push(value);if(value==='ok'){status='completed';break;}if(value==='unknown'){status='uncertain';break;}}return {status,attempts:history.length,history};}
 case 'evidence':{const seen=new Set(),sources=new Set();let support=0,refute=0;for(const row of array(a[0])){record(row);requireThat(typeof row.source==='string'&&typeof row.claim==='string'&&typeof row.value==='boolean','Invalid evidence report');if(Object.hasOwn(p,'claim')&&row.claim!==p.claim)continue;const pair=canon([row.source,row.claim]);if(seen.has(pair))continue;seen.add(pair);sources.add(row.source);if(row.value)support++;else refute++;}return {state:support&&refute?'conflict':support?'supported':refute?'refuted':'unknown',support,refute,sources:sources.size};}
 default:throw Error('Unknown kernel');
 }
}
function run(graph,overrides={}){
 validate(graph);record(overrides);const g=clone(graph);for(const [id,value] of Object.entries(overrides)){const n=g.nodes.find(n=>n.id===id);requireThat(n&&n.op==='literal','Overrides may change literals only');boundedJSON(value);n.params.value=clone(value);}validate(g);
 const values=new Map(),pending=new Set(g.nodes),trace=[],effects=[];let steps=0;
 while(pending.size){const n=[...pending].find(n=>n.inputs.every(id=>values.has(id)));requireThat(n&&++steps<=64,'Task stuck or out of fuel');const inputs=n.inputs.map(id=>values.get(id)),value=calculate(n.op,inputs,n.params);boundedJSON(value);requireThat(new TextEncoder().encode(canon(value)).length<=65536,'Task value exceeds 64 KiB');values.set(n.id,value);pending.delete(n);trace.push({edge:n.id,rule:n.op,inputs:clone(inputs),value:clone(value)});if(n.op==='action'&&value.status==='simulated')effects.push(clone(value));}
 return {output:g.outputs.map(id=>clone(values.get(id))),trace,effects,graph:g};
}
const api={ARITY,validate,run,calculate};if(typeof module!=='undefined')module.exports=api;root.QuinelingKernels=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- anatomy.js ---
(function(root){
'use strict';
const TAU=2*Math.PI, COMPILER='qdl-assembly-experimental';
const TEMPLATES={gather:[[0,0,0],[-.06,-.03,-.06],[.09,.04,.08],[0,0,0],[0,0,0]],unfurl:[[0,0,0],[-.03,.02,-.07],[.06,-.02,.10],[0,0,0],[0,0,0]],glide:[[0,0,0],[-.025,-.06,-.03],[.04,.08,.05],[0,0,0],[0,0,0]],hover:[[0,0,0],[-.025,.02,-.02],[.025,-.02,.02],[0,0,0],[0,0,0]]};
const fail=m=>{throw Error('Anatomy: '+m);},check=(b,m)=>{if(!b)fail(m);};
function fields(o,keys){check(o&&typeof o==='object'&&!Array.isArray(o),'expected record');check(Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k)),'unknown or missing fields');}
function number(x,a,b){check(typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,'number outside ['+a+','+b+']');}
function id(x){check(typeof x==='string'&&Array.from(x).length>=1&&Array.from(x).length<=64,'invalid ID');}
function vector(x,n,a,b){check(Array.isArray(x)&&x.length===n,'invalid vector');x.forEach(v=>number(v,a,b));}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const copy=x=>JSON.parse(JSON.stringify(x));
function validateGesture(g){fields(g,['kind','strength','ticks']);check(Object.hasOwn(TEMPLATES,g.kind),'unknown gesture');number(g.strength,0,1);vector(g.ticks,4,100,700);check(g.ticks.every(Number.isInteger)&&g.ticks.reduce((a,b)=>a+b,0)===1000,'ticks must be integers summing to 1000');return true;}
function validate(a){
 fields(a,['model','compiler','seed','components','owners']);check(a.model==='assembly'&&a.compiler===COMPILER,'unknown assembly compiler');number(a.seed,0,4294967295);check(Number.isInteger(a.seed),'seed must be uint32');
 check(Array.isArray(a.components)&&a.components.length>=1&&a.components.length<=16,'need 1–16 components');const parts=new Map();
 for(const c of a.components){
  if(c.kind==='spine'){fields(c,['id','kind','length','radii','bend','parent']);number(c.length,.12,1.2);vector(c.radii,2,.015,.16);vector(c.bend,2,-.2,.2);}
  else if(c.kind==='chamber'){fields(c,['id','kind','axes','parent']);vector(c.axes,3,.04,.35);}
  else fail('unknown component kind');
  id(c.id);check(!parts.has(c.id),'duplicate component ID');let depth=0,angleBudget=0;
  if(c.parent===null)check(parts.size===0,'only the first component may be root');
  else {check(parts.size>0,'first component must be root');fields(c.parent,['component','socket','angle','hinge']);const p=parts.get(c.parent.component);check(p,'parent must be an earlier component');fields(c.parent.socket,['u','v']);number(c.parent.socket.u,0,1);number(c.parent.socket.v,0,1);number(c.parent.angle,-Math.PI,Math.PI);number(c.parent.hinge,-.12,.12);depth=p.depth+1;angleBudget=p.angleBudget+Math.abs(c.parent.hinge);check(depth<=4,'attachment depth exceeds four');check(++p.children<=4,'component has more than four children');check(angleBudget<=.35,'joint path exceeds .35 radians');}
  parts.set(c.id,{depth,angleBudget,children:0});
 }
 check(Array.isArray(a.owners)&&a.owners.length>=1&&a.owners.length<=128,'need 1–128 owner territories');const groups=new Map(a.components.map(c=>[c.id,[]]));
 for(const o of a.owners){fields(o,['node','component','u']);id(o.node);check(groups.has(o.component),'unknown ownership component');vector(o.u,2,0,1);check(o.u[0]<o.u[1],'territory must have positive width');check((o.u[0]+o.u[1])/2>o.u[0]&&(o.u[0]+o.u[1])/2<o.u[1],'territory has no representable interior');groups.get(o.component).push(o);}
 for(const regions of groups.values()){regions.sort((x,y)=>x.u[0]-y.u[0]);check(regions.length&&regions[0].u[0]===0&&regions.at(-1).u[1]===1,'ownership must cover each component');for(let i=1;i<regions.length;i++)check(regions[i-1].u[1]===regions[i].u[0],'ownership gap or overlap');}
 return true;
}
function nodeIDs(graph){const ns=Array.isArray(graph)?graph:graph?.nodes;check(Array.isArray(ns)&&ns.length>=1&&ns.length<=64,'need 1–64 graph nodes');const ids=ns.map(n=>typeof n==='string'?n:n?.id);ids.forEach(id);check(new Set(ids).size===ids.length,'duplicate graph node');return ids;}
function validateOwners(a,graph){validate(a);const ids=new Set(nodeIDs(graph)),seen=new Set();for(const o of a.owners){check(ids.has(o.node),'unknown owner node '+o.node);seen.add(o.node);}check([...ids].every(n=>seen.has(n)),'every graph node needs positive territory');return true;}
// The axial sweep has y=L*u and L>0: its side chart stays regular without
// numerical frame transport. Disk caps meet its circular boundaries exactly.
function local(c,u,v,chart='side'){
 const angle=TAU*(v===1?0:v),co=Math.cos(angle),si=Math.sin(angle);
 if(c.kind==='spine'){
  const s=u===0||u===1?0:Math.sin(Math.PI*u),cx=c.bend[0]*c.length*s,cz=c.bend[1]*c.length*s,r=c.radii[0]+(c.radii[1]-c.radii[0])*u;
  if(chart==='root'||chart==='tip'){const end=chart==='root'?0:1,rad=c.radii[end]*u;return {p:[rad*co,end*c.length,rad*si],n:[0,end?1:-1,0],u:end};}
  const dx=c.bend[0]*c.length*Math.PI*Math.cos(Math.PI*u),dz=c.bend[1]*c.length*Math.PI*Math.cos(Math.PI*u),dr=c.radii[1]-c.radii[0];
  return {p:[cx+r*co,c.length*u,cz+r*si],n:[c.length*co,-dx*co-dz*si-dr,c.length*si],u};
 }
 const q=2*Math.sqrt(Math.max(0,u*(1-u))),[ax,ay,az]=c.axes,y=2*u-1;
 return {p:[ax*q*co,ay*(1+y),az*q*si],n:[q*co/ax,y/ay,q*si/az],u};
}
function chartLocal(c,chart,a,b){
 const r2=a*a+b*b;check(r2<=1,'chart coordinate outside unit disk');
 if(c.kind==='spine'){check(chart==='root'||chart==='tip','spine disk chart must be root or tip');const end=chart==='tip'?1:0;return {p:[c.radii[end]*a,c.length*end,c.radii[end]*b],n:[0,end?1:-1,0],u:end};}
 check(chart==='north'||chart==='south','unknown chamber chart');const sign=chart==='north'?1:-1,d=1+r2,x=2*a/d,z=2*b/d,y=sign*(1-r2)/d,[ax,ay,az]=c.axes;
 return {p:[ax*x,ay*(1+y),az*z],n:[x/ax,y/ay,z/az],u:(1+y)/2};
}
const matvec=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
function matmul(a,b){const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r.push(a[i*3]*b[j]+a[i*3+1]*b[j+3]+a[i*3+2]*b[j+6]);return r;}
function normalMatrix(m){return [m[4]*m[8]-m[5]*m[7],m[5]*m[6]-m[3]*m[8],m[3]*m[7]-m[4]*m[6],m[2]*m[7]-m[1]*m[8],m[0]*m[8]-m[2]*m[6],m[1]*m[6]-m[0]*m[7],m[1]*m[5]-m[2]*m[4],m[2]*m[3]-m[0]*m[5],m[0]*m[4]-m[1]*m[3]];}
function rotation(a){const c=Math.cos(a),s=Math.sin(a);return [c,-s,0,s,c,0,0,0,1];}
function phaseValue(phase){number(phase,-1e9,1e9);return ((phase/TAU)%1+1)%1;}
function score(g,phase){validateGesture(g);const at=phaseValue(phase)*1000;let start=0,i=0;while(i<3&&at>=start+g.ticks[i])start+=g.ticks[i++];const z=Math.max(0,Math.min(1,(at-start)/g.ticks[i])),h=z*z*z*(10+z*(-15+6*z)),a=TEMPLATES[g.kind][i],b=TEMPLATES[g.kind][i+1];return a.map((x,k)=>(x+(b[k]-x)*h)*g.strength);}
const compiledSet=new WeakSet(),poseCache=new WeakMap(),planCache=new WeakMap(),bufferCache=new WeakMap();
function assertCompiled(c){check(compiledSet.has(c),'expected compiled anatomy');}
function compile(anatomy,nodes,gesture){
 validateOwners(anatomy,nodes);validateGesture(gesture);const a=copy(anatomy),g=copy(gesture),ids=nodeIDs(nodes),indices=new Map(ids.map((id,i)=>[id,i]));
 const parts=a.components.map(c=>({...c,charts:c.kind==='spine'?['side','root','tip']:['north','south'],regions:a.owners.filter(o=>o.component===c.id).sort((x,y)=>x.u[0]-y.u[0]).map(o=>({...o,index:indices.get(o.node)}))}));
 const out=freeze({anatomy:a,gesture:g,nodeIds:ids,parts});compiledSet.add(out);return out;
}
function pose(c,phase){assertCompiled(c);phaseValue(phase);const old=poseCache.get(c);if(old?.phase===phase)return old;const [sigma,lean,opening]=score(c.gesture,phase),R=rotation(lean),a=Math.exp(-sigma/2),b=Math.exp(sigma),base=matmul(R,[a,0,0,0,b,0,0,0,a]),maps=[],byID=new Map();
 for(const part of c.parts){let m=base,t=[0,0,0];if(part.parent){const p=byID.get(part.parent.component),s=local(p.part,part.parent.socket.u,part.parent.socket.v),v=matvec(p.m,s.p);t=v.map((x,i)=>x+p.t[i]);m=matmul(p.m,rotation(part.parent.angle+part.parent.hinge*opening/.12));}const frame={part,m,t,n:normalMatrix(m)};maps.push(frame);byID.set(part.id,frame);}
 const result=freeze({phase,score:[sigma,lean,opening],maps});poseCache.set(c,result);return result;
}
function owner(part,u){return (part.regions.find(o=>u<o.u[1])||part.regions.at(-1)).index;}
function world(f,p){const v=matvec(f.m,p.p),n=matvec(f.n,p.n),len=Math.hypot(...n);return {x:v[0]+f.t[0],y:v[1]+f.t[1],z:v[2]+f.t[2],nx:n[0]/len,ny:n[1]/len,nz:n[2]/len,owner:owner(f.part,p.u)};}
function getMap(c,component,phase){const f=pose(c,phase).maps.find(f=>f.part.id===component);check(f,'unknown component');return f;}
function sample(c,component,u,v,phase,chart='side'){number(u,0,1);number(v,0,1);const f=getMap(c,component,phase);check(chart==='side'||f.part.kind==='spine'&&['root','tip'].includes(chart),'invalid sample chart');return world(f,local(f.part,u,v,chart));}
function sampleChart(c,component,chart,a,b,phase){number(a,-1,1);number(b,-1,1);const f=getMap(c,component,phase);return world(f,chartLocal(f.part,chart,a,b));}
function anchor(c,node,phase){assertCompiled(c);const index=c.nodeIds.indexOf(typeof node==='string'?node:node.id);check(index>=0,'unknown anchor node');const f=pose(c,phase).maps.find(f=>f.part.regions.some(r=>r.index===index)),r=f.part.regions.find(r=>r.index===index);return world(f,local(f.part,(r.u[0]+r.u[1])/2,.375));}
function socket(c,component,phase){const f=getMap(c,component,phase);return {x:f.t[0],y:f.t[1],z:f.t[2]};}
// Area estimates affect only density, not validity, identity, or ownership.
function area(c){return c.kind==='spine'?TAU*(c.radii[0]+c.radii[1])*.5*c.length+Math.PI*(c.radii[0]**2+c.radii[1]**2):4*Math.PI*((c.axes[0]*c.axes[1]+c.axes[1]*c.axes[2]+c.axes[0]*c.axes[2])/3);}
// Retain at most two sample layouts per live body; phase/view requests may
// choose many valid budgets without retaining an unbounded collection.
function plan(c,budget){let plans=planCache.get(c);if(!plans){plans=new Map();planCache.set(c,plans);}if(plans.has(budget)){const cached=plans.get(budget);plans.delete(budget);plans.set(budget,cached);return cached;}const items=[];
 // Reserve an interior sample for every region and a sample for every cap or
 // hemisphere before distributing the remaining global budget by rest area.
 c.parts.forEach((p,i)=>{for(const r of p.regions)items.push({i,p:local(p,(r.u[0]+r.u[1])/2,.375),reserved:true});for(const chart of p.charts)if(chart!=='side')items.push({i,p:chartLocal(p,chart,.31,.23),reserved:true});});
 const total=c.parts.reduce((s,p)=>s+area(p),0),remaining=budget-items.length;check(remaining>=0,'sample budget cannot cover owners/charts');let cumulative=0,allocated=0;
 c.parts.forEach((p,i)=>{cumulative+=area(p)/total;const upto=i===c.parts.length-1?remaining:Math.floor(cumulative*remaining),count=upto-allocated;allocated=upto;
  for(let j=0;j<count;j++){const v=(j*.6180339887498949)%1,u=(j+.5)/Math.max(1,count);
   if(p.kind==='spine'&&j%12<2){const end=j%12===0?'root':'tip',rho=Math.sqrt(((j+.5)*.754877666)%1);items.push({i,p:chartLocal(p,end,rho*Math.cos(TAU*v),rho*Math.sin(TAU*v))});}
   else items.push({i,p:local(p,u,v)});
  }
 });
 for(const item of items)item.owner=owner(c.parts[item.i],item.p.u);const result=freeze(items);plans.set(budget,result);while(plans.size>2)plans.delete(plans.keys().next().value);return result;
}
// GPU rest layout shares the exact sampler/ownership reservations with frame().
// Area estimates are a bounded optical-density convention, not an atlas proof.
function restLayout(c,options={}){assertCompiled(c);const budget=options.budget??2000;number(budget,1000,4000);check(Number.isInteger(budget),'integer rest layout budget required');check(Object.keys(options).every(k=>k==='budget'),'unknown rest layout option');
 const items=plan(c,budget),positions=new Float32Array(budget*3),normals=new Float32Array(budget*3),owners=new Uint16Array(budget),components=new Uint16Array(budget),weights=new Float32Array(budget),reserved=new Uint8Array(budget),counts=c.parts.map(()=>[0,0]);
 for(const it of items)counts[it.i][it.reserved?0:1]++;
 const total=c.parts.reduce((sum,p)=>sum+area(p),0);
 for(let j=0;j<items.length;j++){const it=items[j],k=j*3;positions.set(it.p.p,k);normals.set(it.p.n,k);owners[j]=it.owner;components[j]=it.i;reserved[j]=it.reserved?1:0;const [anchors,samples]=counts[it.i],fraction=it.reserved?(samples?.05:1):.95;weights[j]=area(c.parts[it.i])/total*fraction/(it.reserved?anchors:samples);}
 return {positions,normals,owners,components,weights,reserved,sampleCount:budget};
}
function frame(c,phase,options={}){assertCompiled(c);const budget=options.budget??12000,crests=options.crests??3;number(budget,4000,24000);number(crests,2,4);check(Number.isInteger(budget)&&Number.isInteger(crests),'integer frame budgets required');const maps=pose(c,phase).maps,items=plan(c,budget);let buffers=options.reuse?bufferCache.get(c):null;if(!buffers||buffers.owners.length!==items.length){buffers={points:new Float32Array(items.length*4),normals:new Float32Array(items.length*3),owners:new Uint16Array(items.length)};if(options.reuse)bufferCache.set(c,buffers);}const {points,normals,owners}=buffers;
 for(let j=0;j<items.length;j++){const it=items[j],f=maps[it.i],m=f.m,n=f.n,p=it.p.p,v=it.p.n,k=4*j,q=3*j,nx=n[0]*v[0]+n[1]*v[1]+n[2]*v[2],ny=n[3]*v[0]+n[4]*v[1]+n[5]*v[2],nz=n[6]*v[0]+n[7]*v[1]+n[8]*v[2],length=Math.hypot(nx,ny,nz);points[k]=m[0]*p[0]+m[1]*p[1]+m[2]*p[2]+f.t[0];points[k+1]=m[3]*p[0]+m[4]*p[1]+m[5]*p[2]+f.t[1];points[k+2]=m[6]*p[0]+m[7]*p[1]+m[8]*p[2]+f.t[2];points[k+3]=.18;normals[q]=nx/length;normals[q+1]=ny/length;normals[q+2]=nz/length;owners[j]=it.owner;}
 const ridges=[];for(let j=0;j<crests;j++){const component=j<2||c.parts.length===1?0:1+Math.floor((j-2)*(c.parts.length-1)/Math.max(1,crests-2)),f=maps[component],line=[];for(let k=0;k<=300;k++)line.push(world(f,local(f.part,k/300,(j*.381966+.14)%1)));ridges.push({line,primary:true});}
 return {points,normals,owners,ridges};
}
// Every point lies within this rest-axis box. Expand it for the maximum root
// angle/scale and accumulated hinge displacement along the actual ancestor path.
// Fixed bounds avoid breathing auto-fit and hold for every accepted phase.
function portraitFrame(c){assertCompiled(c);const rest=pose(c,0).maps,template=TEMPLATES[c.gesture.kind],sigmaMax=Math.max(...template.map(p=>Math.abs(p[0])))*c.gesture.strength,leanMax=Math.max(...template.map(p=>Math.abs(p[1])))*c.gesture.strength,openMax=Math.max(...template.map(p=>Math.abs(p[2])))*c.gesture.strength/.12;let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<rest.length;i++){const f=rest[i],p=f.part,L=p.kind==='spine'?p.length:2*p.axes[1],r=p.kind==='spine'?Math.max(...p.radii):Math.max(p.axes[0],p.axes[2]),bow=p.kind==='spine'?Math.max(...p.bend.map(Math.abs))*L:0,localBounds=[[-r-bow,0,-r-bow],[r+bow,L,r+bow]];let reach=Math.hypot(L,r+bow),angle=0,node=p;
  while(node.parent){angle+=Math.abs(node.parent.hinge);node=c.parts.find(x=>x.id===node.parent.component);reach+=node.kind==='spine'?Math.hypot(node.length,Math.max(...node.radii)+.283*node.length):2*Math.max(...node.axes);}
  const pad=reach*(Math.expm1(sigmaMax)+leanMax*Math.exp(sigmaMax)+angle*openMax*Math.exp(sigmaMax));
  for(let mask=0;mask<8;mask++){const v=matvec(f.m,[localBounds[(mask&1)?1:0][0],localBounds[(mask&2)?1:0][1],localBounds[(mask&4)?1:0][2]]);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]+f.t[k]-pad);hi[k]=Math.max(hi[k],v[k]+f.t[k]+pad);}}
 }
 return {cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0],height:hi[1]-lo[1],depth:hi[2]-lo[2]};
}
function generate(graph,seed=0){const ids=nodeIDs(graph);number(seed,0,4294967295);check(Number.isInteger(seed),'seed must be uint32');const nodes=graph.nodes;check(Array.isArray(nodes)&&nodes.every(n=>Array.isArray(n.inputs)),'generation needs graph input lists');const known=new Set(ids),depth=new Map(),fanout=new Map(ids.map(x=>[x,0]));
 for(const n of nodes){check(n.inputs.every(x=>known.has(x)&&depth.has(x)),'graph must be an ordered DAG');depth.set(n.id,n.inputs.length?1+Math.max(...n.inputs.map(x=>depth.get(x))):0);n.inputs.forEach(x=>fanout.set(x,fanout.get(x)+1));}
 let state=seed>>>0;const rnd=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;},clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),count=ops=>nodes.filter(n=>ops.includes(n.op)).length;
 const maxDepth=Math.max(...depth.values()),forks=nodes.filter(n=>fanout.get(n.id)>1),merges=nodes.filter(n=>n.inputs.length>1),maxFork=Math.max(...fanout.values()),maxMerge=Math.max(...nodes.map(n=>n.inputs.length)),arithmetic=count(['map','sum','mean','min','max','weightedMean']),selection=count(['filter','compare','choose','dedupe','sort']),effect=count(['action','retry']),sequencing=count(['schedule','retry']),kind=merges.length>forks.length?'gather':forks.length?'unfurl':maxDepth>=2?'glide':'hover';
 // Continuous graph traits determine proportions. Seed supplies bounded
 // eccentricity, handedness and unequal appendages; no body-family lookup.
 const spread=clamp(.12+.026*maxMerge+.022*selection+.13*effect+.055*sequencing+.018*forks.length+(rnd()-.5)*.07,.105,.34),height=clamp(.22+.025*Math.min(maxDepth,5)+.021*arithmetic-.026*selection-.095*effect-.045*sequencing+(rnd()-.5)*.07,.15,.35),thickness=clamp(.075+.025*rnd()+.012*Math.min(maxMerge,4),.075,.16),hand=rnd()<.5?-1:1;
 const parts=[{id:'trunk',kind:'chamber',axes:[spread,height,thickness],parent:null}],buckets=[ids.slice()];
 function append(part,owners){parts.push(part);buckets.push(owners);return part.id;}
 function spine(id,owner,parent,u,v,angle,length,width,bend,hinge=.04){return append({id,kind:'spine',length:clamp(length,.12,.70),radii:[clamp(width,.022,.09),.015+.003*rnd()],bend:[clamp(bend,-.2,.2),(rnd()-.5)*.16],parent:{component:parent,socket:{u,v},angle:clamp(angle,-Math.PI,Math.PI),hinge}},[owner]);}
 // A real fanout or convergence produces ordered, asymmetrical attachments.
 // Decorative repeats retain an existing owner and never add a task edge.
 const motif=forks.length?forks.slice().sort((a,b)=>fanout.get(b.id)-fanout.get(a.id))[0]:merges.slice().sort((a,b)=>b.inputs.length-a.inputs.length)[0];
 if(motif){const selected=forks.length?nodes.filter(n=>n.inputs.includes(motif.id)):motif.inputs.map(id=>nodes.find(n=>n.id===id)),visible=selected.slice(0,3);
  for(let j=0;j<visible.length;j++){const direction=(j%2?1:-1)*hand,u=clamp(.38+.14*j+.06*rnd(),.30,.80),angle=-direction*(.75+.28*j+.35*rnd());spine('branch-'+j,visible[j].id,'trunk',u,direction>0?0:.5,angle,.24+.048*Math.min(4,maxFork+maxMerge)+.06*j+.04*rnd(),.03+.012*(1-j/3),direction*.18,-direction*.065);}
 }else if(maxDepth>=3){
  // Longer serial programs acquire an offset subordinate chamber and a
  // continuation: the attachment tree is more than a star around one sphere.
  const terminal=nodes.find(n=>depth.get(n.id)===maxDepth)||nodes.at(-1),side=hand;
  const neck=spine('neck',terminal.id,'trunk',.77,side>0?0:.5,-side*.9,.16,.034,side*.16);
  const lobe=append({id:'lobe',kind:'chamber',axes:[.065+.02*rnd(),.10+.022*rnd(),.055+.012*rnd()],parent:{component:neck,socket:{u:1,v:0},angle:side*.2,hinge:.035}},[terminal.id]);
  spine('lobe-tip',terminal.id,lobe,1,0,-side*.3,.17,.025,-side*.17,.025);
 }else if(selection){
  const n=nodes.find(n=>['filter','compare','choose','dedupe','sort'].includes(n.op))||nodes.at(-1);
  spine('sweep',n.id,'trunk',.62,hand>0?0:.5,-hand*1.75,.32+.04*rnd(),.035,hand*.2,hand*.065);
 }else{
  const n=nodes.at(-1);spine('continuation',n.id,'trunk',1,.25,hand*(.15+.38*rnd()),.18+.037*Math.min(maxDepth,5),.038,-hand*.18);
 }
 // One long countercurve creates negative space. Its position and length
 // depend on graph elongation and the bounded seed, not on animation time.
 const tailAngle=hand*(2.55+.40*rnd()),tail=spine('tail',nodes[0].id,'trunk',0,.25,tailAngle,.19+.035*Math.min(maxDepth,5)+.065*rnd(),.026+.009*rnd(),-hand*.19,-hand*.035);
 if(effect||maxFork>=3){spine('wake',nodes.at(-1).id,tail,.72,.5,-hand*.75,.19+.025*effect,.023,hand*.19,.035);}
 const owners=[];parts.forEach((p,i)=>buckets[i].forEach((node,j)=>owners.push({node,component:p.id,u:[j/buckets[i].length,(j+1)/buckets[i].length]})));
 const anatomy={model:'assembly',compiler:COMPILER,seed,components:parts,owners},gesture={kind,strength:.55+Math.round(rnd()*15)/100,ticks:kind==='gather'?[180,180,420,220]:kind==='unfurl'?[220,170,430,180]:[180,170,450,200]};validateOwners(anatomy,graph);validateGesture(gesture);return {anatomy,gesture};
}
// New-profile authoring leaves the experimental generator unchanged. Operation
// roles guide the initial assembly; bounded specializations distinguish social
// evidence crowns from broad scheduling bodies without inventing executable edges.
function generateV1(graph,seed=0){
 const analogues={input:'literal',arithmetic:'sum',compareValues:'compare',all:'compare',select:'filter',evidenceFresh:'evidence',reconcile:'retry'};
 const projected={...graph,nodes:graph.nodes.map(n=>({...n,op:analogues[n.op]||n.op}))};
 const generated=generate(projected,seed),a=generated.anatomy,rootPart=a.components[0];
 const scheduler=graph.nodes.find(n=>n.op==='schedule'),witness=graph.nodes.find(n=>['consensus','evidence','evidenceFresh'].includes(n.op));
 if(rootPart.kind==='chamber'&&scheduler){rootPart.axes[0]=Math.min(.35,rootPart.axes[0]*1.24);rootPart.axes[1]=Math.max(.04,rootPart.axes[1]*.83);}
 if(rootPart.kind==='chamber'&&witness){rootPart.axes[0]=Math.max(.04,rootPart.axes[0]*.84);rootPart.axes[1]=Math.max(.04,rootPart.axes[1]*.92);}
 if(witness&&a.components.length<16){
  const parts=new Map(a.components.map(c=>[c.id,c]));
  const eligible=c=>{let depth=0,hinge=.025,p=c;while(p.parent){depth++;hinge+=Math.abs(p.parent.hinge);p=parts.get(p.parent.component);}return depth<4&&hinge<=.35&&a.components.filter(p=>p.parent?.component===c.id).length<4;};
  const parent=a.components.find(eligible);
  if(parent){const component='v1-crown';a.components.push({id:component,kind:'spine',length:.18,radii:[.018,.022],bend:[.06,.07],parent:{component:parent.id,socket:{u:.42,v:.15},angle:seed%2?-.9:.9,hinge:.025}});a.owners.push({node:witness.id,component,u:[0,1]});}
 }
 validateOwners(a,graph);validateGesture(generated.gesture);return generated;
}
const api={COMPILER,validate,validateOwners,validateGesture,generate,generateV1,compile,score,pose,sample,sampleChart,anchor,socket,frame,restLayout,portraitFrame};if(typeof module!=='undefined')module.exports=api;root.Anatomy=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- qdl.js ---
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


// --- chroma.js ---
(function(root){
'use strict';
// These are body-role colors, not the exact opcode/genome palette.
const ROLES=Object.freeze(Object.fromEntries(Object.entries({
 input:{label:'Input',color:'#35d6c3'},
 process:{label:'Process',color:'#639bfa'},
 decision:{label:'Judgment & evidence',color:'#edc653'},
 quote:{label:'Quote & reconstruction',color:'#b184ef'},
 action:{label:'Action',color:'#f2757d'},
 report:{label:'Report',color:'#8ccc76'}
}).map(([key,value])=>[key,Object.freeze(value)])));
const ROLE_MAP=Object.freeze({
 Observe:'input',Box:'quote',Permit:'decision',Apply:'process',Score:'process',Authorize:'decision',Execute:'action',Quote:'quote',Decode:'quote',Report:'report',
 literal:'input',sum:'process',mean:'process',min:'process',max:'process',weightedMean:'process',length:'process',map:'process',sort:'process',dedupe:'process',filter:'process',compare:'decision',choose:'decision',get:'process',clamp:'process',budget:'process',action:'action',report:'report',bfs:'process',allocate:'process',schedule:'process',consensus:'decision',retry:'process',evidence:'decision',input:'input',arithmetic:'process',compareValues:'decision',all:'decision',select:'process',evidenceFresh:'decision',reconcile:'process',window:'process'
});
const SCALE_STOPS=Object.freeze([
 Object.freeze({at:0,color:'#593b9c'}),Object.freeze({at:.25,color:'#765eb4'}),Object.freeze({at:.5,color:'#a17ac0'}),Object.freeze({at:.75,color:'#dca7b8'}),Object.freeze({at:1,color:'#f7e6ac'})
]);
const STATUS_COLORS=Object.freeze({'not-evaluated':'#839097',stale:'#839097',invalid:'#b0a7a0'});
const STATUS_LABELS=Object.freeze({valid:'Recorded value',underflow:'Below domain',overflow:'Above domain','not-evaluated':'Not evaluated',stale:'Previous source',invalid:'Invalid value'});
const cache=new WeakMap(),closedFamilies=new Set(['moth','torus','bloom']),forbidden=new Set(['__proto__','constructor','prototype']);
const clamp=x=>Math.max(0,Math.min(1,x));
function role(op){if(!Object.hasOwn(ROLE_MAP,op))throw Error('Unknown chroma operation '+op);return ROLE_MAP[op];}
function channels(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function hex(rgb){return '#'+rgb.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');}
// Linear RGB mixing preserves a bounded display gamut; no hue-angle arithmetic.
function linear(x){x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}
function display(x){return 255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055);}
function mix(a,b,t){const x=channels(a),y=channels(b);return hex(x.map((v,i)=>display((1-t)*linear(v)+t*linear(y[i]))));}
function desaturate(color,amount){const c=channels(color).map(linear),y=.2126*c[0]+.7152*c[1]+.0722*c[2];return hex(c.map(x=>display((1-amount)*x+amount*y)));}
function scalarColor(normalized){
 if(!Number.isFinite(normalized))throw Error('Scalar color needs a finite normalized value');
 const t=clamp(normalized),i=Math.min(SCALE_STOPS.length-2,Math.floor(t*(SCALE_STOPS.length-1))),a=SCALE_STOPS[i],b=SCALE_STOPS[i+1];
 return mix(a.color,b.color,(t-a.at)/(b.at-a.at));
}
function compile(shape){
 const nodes=shape.nodes;if(!Array.isArray(nodes)||!nodes.length)throw Error('Chroma needs operation nodes');
 const signature=JSON.stringify([shape.design?.family,shape.design?.chroma?.lens?.bindings?.map(x=>x.node)||[],nodes.map(n=>[n.id,n.op,n.level])]);
 const previous=cache.get(shape);if(previous?.signature===signature)return previous.field;
 const focused=new Set(shape.design?.chroma?.lens?.bindings?.map(x=>x.node)||[]),groups=new Map();
 nodes.forEach((n,index)=>{const level=n.level||0;if(!groups.has(level))groups.set(level,[]);groups.get(level).push({index,id:n.id,weight:focused.has(n.id)?2:1});});
 const ordered=[...groups].sort((a,b)=>a[0]-b[0]).map(([,peers])=>peers.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0));
 const totalWeight=ordered.flat().reduce((sum,n)=>sum+n.weight,0);let edge=0;
 const bands=ordered.map(peers=>{const weight=peers.reduce((sum,n)=>sum+n.weight,0),start=edge;edge+=weight/totalWeight;let lane=0;return {start,end:edge,peers:peers.map(p=>{lane+=p.weight/weight;return {...p,end:lane};})};});
 bands[bands.length-1].end=1;for(const b of bands)b.peers[b.peers.length-1].end=1;
 const closed=closedFamilies.has(shape.design?.family),offset=closed?bands[0].end/2:0;
 function owner(u,v,k,total){
  if(![u,v,k,total].every(Number.isFinite)||total<=0)throw Error('Invalid material coordinate');
  // The closed seam sits inside the first band, never on a categorical boundary.
  const wrapped=((u%1)+1)%1,x=closed?(wrapped+offset)%1:clamp(u),lane=clamp((k+clamp((v+1)/2))/total);
  const band=bands.find(b=>x<b.end)||bands[bands.length-1];
  return (band.peers.find(p=>lane<p.end)||band.peers[band.peers.length-1]).index;
 }
 const field=Object.freeze({owner,nodeIds:Object.freeze(nodes.map(n=>n.id)),roleColors:Object.freeze(nodes.map(n=>ROLES[role(n.op)].color)),bands:Object.freeze(bands.map(b=>Object.freeze({start:b.start,end:b.end,nodeIds:Object.freeze(b.peers.map(p=>nodes[p.index].id))})))});
 cache.set(shape,{signature,field});return field;
}
function owner(shape,u,v,k,total){return compile(shape).owner(u,v,k,total);}
function ownPath(value,path){
 if(!Array.isArray(path))return {ok:false};
 for(const part of path){
  if(!(typeof part==='string'||Number.isInteger(part)&&part>=0)||forbidden.has(String(part))||value===null||typeof value!=='object'||!Object.hasOwn(value,part))return {ok:false};
  value=value[part];
 }
 return typeof value==='number'&&Number.isFinite(value)?{ok:true,value}:{ok:false};
}
// Caller supplies one task cycle already matched to the current source. This
// function only reads that snapshot and never invokes an interpreter.
function resolveLens(design,taskRecord,status='current'){
 const lens=design?.chroma?.lens,byNode=Object.create(null),entries=[];
 if(!lens)return {status:'off',lens:null,byNode,entries};
 const trace=taskRecord?.trace,rows=new Map(),duplicates=new Set();
 if(Array.isArray(trace))for(const row of trace){if(!row||typeof row.edge!=='string')continue;if(rows.has(row.edge))duplicates.add(row.edge);rows.set(row.edge,row);}
 const domainOK=Array.isArray(lens.domain)&&lens.domain.length===2&&lens.domain.every(Number.isFinite)&&lens.domain[1]>lens.domain[0]&&Number.isFinite(lens.domain[1]-lens.domain[0]);
 for(const binding of lens.bindings||[]){
  const entry={node:binding.node,path:Array.isArray(binding.path)?binding.path.slice():[],status:'not-evaluated',color:STATUS_COLORS['not-evaluated']};
  if(status!=='current'){entry.status=status==='stale'?'stale':'not-evaluated';entry.color=STATUS_COLORS[entry.status];}
  else if(!domainOK||duplicates.has(binding.node)){entry.status='invalid';entry.color=STATUS_COLORS.invalid;}
  else if(rows.has(binding.node)){
   const row=rows.get(binding.node),result=Object.hasOwn(row,'value')?ownPath(row.value,binding.path):{ok:false};
   if(!result.ok){entry.status='invalid';entry.color=STATUS_COLORS.invalid;}
   else{const [lo,hi]=lens.domain;entry.value=result.value;entry.normalized=clamp((result.value-lo)/(hi-lo));entry.status=result.value<lo?'underflow':result.value>hi?'overflow':'valid';entry.color=scalarColor(entry.normalized);}
  }
  entries.push(entry);byNode[binding.node]=entry;
 }
 return {status:status==='current'?(Array.isArray(trace)?'current':'not-evaluated'):status,lens,byNode,entries};
}
const OPCODE_ACCENTS=Object.freeze({
 Observe:'#22d3ee',Box:'#c084fc',Permit:'#fbbf24',Apply:'#38bdf8',Score:'#818cf8',Authorize:'#f59e0b',Execute:'#fb7185',Quote:'#a855f7',Decode:'#e879f9',Report:'#4ade80',
 literal:'#2dd4bf',sum:'#60a5fa',mean:'#38bdf8',min:'#818cf8',max:'#a78bfa',weightedMean:'#34d399',length:'#93c5fd',map:'#f472b6',sort:'#fb923c',dedupe:'#c084fc',filter:'#22d3ee',compare:'#facc15',choose:'#fbbf24',get:'#67e8f9',clamp:'#a3e635',budget:'#fbbf24',action:'#f43f5e',report:'#4ade80',bfs:'#e879f9',allocate:'#34d399',schedule:'#fb923c',consensus:'#f59e0b',retry:'#f87171',evidence:'#eab308',input:'#14b8a6',arithmetic:'#60a5fa',compareValues:'#f59e0b',all:'#eab308',select:'#a78bfa',evidenceFresh:'#fde047',reconcile:'#fb7185',window:'#38bdf8'
});
function colorFor(shape,nodeIndex,lensState){
 const neutral=shape.design?.ink?.neutral||shape.design?.light?.neutral||'#d5e2e0',chroma=shape.design?.chroma;
 if(!chroma)return neutral;
 const node=shape.nodes[nodeIndex];if(!node)throw Error('Unknown material owner');
 const strength=Number.isFinite(chroma.strength)?clamp(chroma.strength):0;
 const entry=lensState?.byNode?.[node.id];let color=entry?.color||ROLES[role(node.op)].color;
 if(lensState?.lens&&!entry)color=desaturate(color,.48);
 else if(!entry&&strength>0&&strength<1){
  const accent=OPCODE_ACCENTS[node.op]||color,val=node.params?.value,litShift=typeof val==='number'&&Number.isFinite(val)?clamp(Math.log1p(Math.abs(val))/8):Array.isArray(val)?clamp(val.length/10):((nodeIndex*37+(node.level||0)*19)%100)/100;
  color=mix(color,accent,clamp(.38+.34*litShift));
 }
 return strength===1?color:strength===0?neutral:mix(neutral,color,strength);
}
const api={ROLES,ROLE_MAP,OPCODE_ACCENTS,SCALE_STOPS,STATUS_COLORS,STATUS_LABELS,role,channels,hex,compile,owner,scalarColor,resolveLens,colorFor};
if(typeof module!=='undefined')module.exports=api;root.Chroma=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- morphology.js ---
(function(root){
'use strict';
const TAU=Math.PI*2;
const Anatomy=typeof module!=='undefined'?require('./anatomy.js'):root.Anatomy;
const assemblyCache=new WeakMap();
function assembly(s){let c=assemblyCache.get(s);const key=JSON.stringify([s.design.anatomy,s.design.motion.gesture,s.nodes.map(n=>n.id)]);if(!c||c.key!==key){c={key,body:Anatomy.compile(s.design.anatomy,s.nodes,s.design.motion.gesture)};assemblyCache.set(s,c);}return c.body;}
const Chroma=typeof module!=='undefined'?require('./chroma.js'):root.Chroma;
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
 if(s.design?.anatomy){const p=Anatomy.anchor(assembly(s),n.id,t);return pose(p,p.z,s.design);}
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
 if(s.design?.anatomy){const f=Anatomy.portraitFrame(assembly(s));return {...f,width:f.width*1.5,height:f.height*1.5};}
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
const ownerCache=new WeakMap();
function surfaceFrame(s,t,thumb=false){
 if(s.design?.anatomy){const f=Anatomy.frame(assembly(s),t,{budget:thumb?Math.min(4200,s.design.surface.samples):s.design.surface.samples,crests:Math.min(4,s.design.surface.crests)});for(let i=0;i<f.points.length;i+=4){const p=pose({x:f.points[i],y:f.points[i+1]},f.points[i+2],s.design);f.points[i]=p.x;f.points[i+1]=p.y;f.points[i+2]=p.z;}for(const ridge of f.ridges)ridge.line=ridge.line.map(p=>({...p,...pose(p,p.z,s.design),alpha:.18}));return f;}
 const m=motionState(s,t),total=ribbonCount(s),budget=thumb?Math.min(4200,s.design.surface.samples):s.design.surface.samples,columns=4,rows=Math.max(12,Math.floor(budget/(total*columns))),points=new Float32Array(total*rows*columns*4);let cursor=0;
 const compiled=Chroma.compile(s);let cached=ownerCache.get(s);
 if(!cached||cached.field!==compiled){cached={field:compiled};ownerCache.set(s,cached);}
 const key=String(thumb),count=points.length/4,rebuild=!cached[key]||cached[key].total!==total||cached[key].rows!==rows;
 const owners=rebuild?new Uint16Array(count):cached[key].owners;
 for(let k=0;k<total;k++)for(let j=0;j<columns;j++)for(let i=0;i<rows;i++){
  const u=(i+.5+((k*.618+j*.381)%1-.5)*.75)/rows,v=Math.cos(Math.PI*(j+.5)/columns),p=surfacePoint(s,u,v,k,total,t,m);
  if(rebuild)owners[cursor/4]=compiled.owner(u,v,k,total);
  points[cursor++]=p.x;points[cursor++]=p.y;points[cursor++]=p.z;points[cursor++]=p.alpha;
 }
 const ridges=[];for(let j=0;j<s.design.surface.crests;j++){const k=Math.floor(j*total/s.design.surface.crests),a=TAU*k/total,line=[];
  for(let i=0;i<=300;i++){const u=i/300,spatial=closedFamily(s.design.family)?Math.sin(TAU*u):u,v=.92*Math.cos(m.phase-s.design.surface.phaseLag*spatial+a*.5);const p=surfacePoint(s,u,v,k,total,t,m);p.owner=compiled.owner(u,v,k,total);line.push(p);}
  ridges.push({line,primary:true});
 }
 if(rebuild)cached[key]={owners,total,rows};
 return {points,ridges,owners};
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


// --- core.js ---
(function(root){
'use strict';
const O=typeof module!=='undefined'?require('./orbit.js'):root.Orbit;
const K=typeof module!=='undefined'?require('./kernels.js'):root.QuinelingKernels;
const Design=typeof module!=='undefined'?require('./qdl.js'):root.QDL;
const Morph=typeof module!=='undefined'?require('./morphology.js'):root.Morphology;
const clone=O.clone,canon=O.canon,TAU=2*Math.PI;
// Append stable-profile instructions; legacy frequencies and exact colors stay put.
const V1_OPS=['input','arithmetic','compareValues','all','select','evidenceFresh','reconcile'];
const LEGACY_OPS=Object.freeze(["Observe","Box","Permit","Apply","Score","Authorize","Execute","Quote","Decode","Report","literal","sum","mean","min","max","weightedMean","length","map","sort","dedupe","filter","compare","choose","get","clamp","budget","action","report","bfs","allocate","schedule","consensus","retry","evidence"]);
const OPS=Object.freeze([...LEGACY_OPS,...V1_OPS]);
const COLORS=Object.freeze(["#72d9e2","#bb91ed","#e6c66a","#6ad4a0","#eb90ba","#efaa73","#b5e681","#899be8","#77bce9","#d6e6be","#81bac5","#82c6af","#82c8b3","#82c9b6","#83cab9","#83cbb1","#83ccb4","#84cdb7","#84cfbb","#85d0be","#85d1b5","#d2bf85","#d3c686","#86d4bf","#87d5c3","#87d6b9","#d7a088","#88d89f","#89d9c4","#89dac7","#8adbbd","#dcc28b","#8ba1dd","#deda8c","#94c4e8","#82d6bf","#ecd38b","#d6c681","#8eabd9","#d9be82","#a49fd9"]);
function v1(){return typeof module!=='undefined'?require('./qdl-v1.js'):root.QDLV1;}
function isV1Program(program){
 // Examine inert descriptors before any profile dispatch or constructor cloning.
 // Parsed JSON is the wire boundary; hostile same-process Proxies are not a sandbox.
 const stack=[{value:program,depth:0,seen:new Set(),path:'$'}];let visits=0;
 function refuse(path,message){const e=new Error(message);e.code='json';e.path=path;throw e;}
 while(stack.length){const {value:x,depth,seen,path}=stack.pop();if(++visits>200000||depth>64)refuse(path,'Source structure budget exceeded');
  if(x===null||typeof x==='boolean'||typeof x==='string')continue;if(typeof x==='number'){if(!Number.isFinite(x))refuse(path,'Nonfinite source number');continue;}
  if(!x||typeof x!=='object'||seen.has(x))refuse(path,'Expected acyclic JSON source');const array=Array.isArray(x),proto=Object.getPrototypeOf(x),keys=Object.keys(x);
  if(array?!(Array.isArray(proto)&&Object.getPrototypeOf(Object.getPrototypeOf(proto))===null):proto!==null&&Object.getPrototypeOf(proto)!==null)refuse(path,'Expected native JSON source');
  if(Reflect.ownKeys(x).length!==keys.length+(array?1:0)||array&&(keys.length!==x.length||!keys.every((k,i)=>k===String(i))))refuse(path,'Hidden, symbol or sparse source data');
  const next=new Set(seen).add(x);for(const k of keys){const d=Object.getOwnPropertyDescriptor(x,k);if(!d||!Object.hasOwn(d,'value')||['__proto__','constructor','prototype'].includes(k))refuse(path+'.'+k,'Source must contain safe data fields');stack.push({value:d.value,depth:depth+1,seen:next,path:path+'.'+k});}
 }
 const terms=[program];while(terms.length){const t=terms.pop();if(!Array.isArray(t)||t[0]==='quote')continue;if(t[0]==='task'&&t[1]?.[0]==='quote'&&t[1][1]?.format==='qdl-program')return true;if(t[0]==='run'&&t[1]?.[0]==='quote'){terms.push(t[1][1]);continue;}for(let i=1;i<t.length;i++)terms.push(t[i]);}return false;
}
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
 Design.validateBindings(design,graph);graph=clone(graph);graph.design=clone(design);
 return makePayloadProgram(graph,repeats);
}
function makePayloadProgram(payload,repeats=1){
 if(!Number.isInteger(repeats)||repeats<1||repeats>8)throw Error('Repeat count must be 1–8');
 const constructor=['emit',['makeApply',['makeRun',['makeQuote',['var','x']]],['makeQuote',['var','x']]]];
 const body=['lambda','x',['seq',['repeat',repeats,['task',['quote',clone(payload)]]],constructor]];
 const program=['apply',['run',['quote',body]],['quote',clone(body)]];
 if(new TextEncoder().encode(canon(program)).length>65536)throw Error('Complete quine source exceeds 64 KiB');
 return program;
}
function execute(program,options={}){
 const stable=isV1Program(program);isV1Program(options);
 if(options===null||typeof options!=='object'||Array.isArray(options)){const e=new Error('Expected execution options');e.code='json';e.path='$.options';throw e;}
 if(stable){if(Object.keys(options).some(k=>!['bindings','constructionOnly'].includes(k))||Object.hasOwn(options,'constructionOnly')&&typeof options.constructionOnly!=='boolean'||options.constructionOnly&&Object.hasOwn(options,'bindings')){const e=new Error('Invalid stable-profile execution options');e.code='json';e.path='$.options';throw e;}if(!options.constructionOnly)return v1().execute(program,Object.hasOwn(options,'bindings')?options.bindings:{});v1().admit(program);}
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
   case 'task':{const graph=ev(a[0],env);if(options.constructionOnly)return null;if(graph?.design)Design.validateBindings(graph.design,graph);const record=K.run(graph);tasks.push(record);trace.push(...record.trace.map(e=>({kind:'graph',...e})));return record.output;}
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
 const stable=isV1Program(program);if(stable)v1().admit(program);
 let graph=null,repeats=1,quoteDepth=0;
 function visit(t,depth=0){if(!Array.isArray(t))return;if(t[0]==='quote')quoteDepth=Math.max(quoteDepth,depth+1);if(t[0]==='repeat'&&Number.isInteger(t[1]))repeats=t[1];if(t[0]==='plan'&&t[1]?.[0]==='quote'&&!graph)graph=clone(t[1][1]);for(const x of t.slice(1))visit(x,depth+(t[0]==='quote'?1:0));}
 function visitTask(t,depth=0){if(!Array.isArray(t))return;if(t[0]==='quote')quoteDepth=Math.max(quoteDepth,depth+1);if(t[0]==='repeat'&&Number.isInteger(t[1]))repeats=t[1];if(t[0]==='task'&&t[1]?.[0]==='quote'&&!graph)graph=clone(t[1][1]);for(const x of t.slice(1))visitTask(x,depth+(t[0]==='quote'?1:0));}
 visit(program);if(!graph)visitTask(program);if(!graph)throw Error('No quoted thought graph');
 const payload=graph.format==='qdl-program'?graph:null;
 if(payload){v1().validatePayload(payload);graph={...clone(payload.task),design:clone(payload.design)};}
 const isTask=Array.isArray(graph.nodes);if(isTask&&!payload)K.validate(graph);else if(!isTask)O.validate(graph);
 const nodes=[],links=[];
 function project(g,scope,parent){const producers=new Map(),wireTypes=new Map(g.wires.map(w=>[w.id,w.type]));g.edges.forEach(e=>e.outputs.forEach(w=>producers.set(w,scope+e.id)));for(const e of g.edges){const id=scope+e.id;nodes.push({id,op:e.op,parent,inputs:e.inputs.length,outputs:e.outputs.length,params:e});for(let port=0;port<e.inputs.length;port++){const from=producers.get(e.inputs[port]);if(from)links.push({from,to:id,port,type:wireTypes.get(e.inputs[port])});}if(e.op==='Box')project(e.graph,id+'/',id);}}
 if(isTask){for(const n of graph.nodes){nodes.push({id:n.id,op:n.op,parent:null,inputs:n.inputs.length,outputs:1,params:n.params});n.inputs.forEach((id,port)=>links.push({from:id,to:n.id,port,type:'Data'}));}}else project(graph,'',null);
 const top=nodes.filter(n=>!n.parent),depths=new Map(),inLinks=new Map(),outdeg=new Map(),indeg=new Map();
 for(const e of links){let arr=inLinks.get(e.to);if(!arr){arr=[];inLinks.set(e.to,arr);}arr.push(e);outdeg.set(e.from,(outdeg.get(e.from)||0)+1);indeg.set(e.to,(indeg.get(e.to)||0)+1);}
 function depth(id,path=new Set()){if(depths.has(id))return depths.get(id);if(path.has(id))throw Error('Unbounded cycle');const next=new Set(path).add(id),inputs=inLinks.get(id)||[];const d=inputs.length?1+Math.max(...inputs.map(e=>depth(e.from,next))):0;depths.set(id,d);return d;}
 top.forEach(n=>depth(n.id));const max=Math.max(...depths.values(),1);
 nodes.forEach((n,i)=>{n.outdegree=outdeg.get(n.id)||0;n.indegree=indeg.get(n.id)||0;n.frequency=OPS.indexOf(n.op)+1;n.level=n.parent?depths.get(n.parent)||0:depths.get(n.id);n.u=(n.level+.5)/(max+1);n.side=((i%2)*2-1)*(n.op==='Permit'?.62:n.op==='Box'?.42:.24);});
 const design=isTask?(graph.design||Design.create()):Design.create();Design.validateBindings(design,graph);
 const branches=top.reduce((s,n)=>s+Math.max(0,n.outdegree-1),0);
 return {graph,nodes,links,repeats,quoteDepth,branches,strandCount:Math.min(22,12+Math.floor(branches/2)),maxDepth:max,design,...(payload?{profile:{format:payload.format,version:payload.version,registry:payload.registry,registryDigest:payload.registryDigest,thought:clone(payload.thought)}}:{})};
}
function nodePosition(n,t,shape){if(n.parent){const p=nodePosition(shape.nodes.find(x=>x.id===n.parent),t,shape);const phase=Morph.motionState(shape,t).phase;return {x:p.x+.015*Math.sin(phase+n.frequency),y:p.y+.016*Math.cos(phase+n.frequency)};}return Morph.anchor(n,t,shape);}
function edgePoint(link,s,t,shape){const a=nodePosition(shape.nodes.find(n=>n.id===link.from),t,shape),b=nodePosition(shape.nodes.find(n=>n.id===link.to),t,shape);const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;const f=1+link.port+shape.nodes.find(n=>n.id===link.from).frequency;const bend=Design.filamentBend(shape.design||Design.DEFAULT,f,s,Morph.motionState(shape,t).phase);return {x:a.x+dx*s-dy/len*bend,y:a.y+dy*s+dx/len*bend};}
const api={canon,makeProgram,makeTaskProgram,makePayloadProgram,runTask:K.run,validateTask:K.validate,execute,encode,decode,encodeColors,decodeColors,instructionColor,instructionFromColor,wave,samples,fromSamples,describe,nodePosition,edgePoint,OPS,COLORS,TAU};if(typeof module!=='undefined')module.exports=api;root.Quinelings=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- lifeform-families.js ---
(function(root){
'use strict';
const TAU=2*Math.PI, PHI_INV=(Math.sqrt(5)-1)/2, tags=['logarithmic-mantle','toroidal-weave','phyllotaxis-fan'];
const LIMITS=Object.freeze({growth:[.12,.35],spread:[.5,1.2],curl:[.4,1.6],asymmetry:[0,.4],offset:[0,TAU],frequency:[2,8],lobes:[3,9],twist:[1,3],whorls:[2,4]});
const INT_KEYS=new Set(['frequency','lobes','whorls']);
function clampGeometry(g){const out={};for(const [k,[lo,hi]]of Object.entries(LIMITS)){const v=Number.isFinite(g?.[k])?Math.max(lo,Math.min(hi,g[k])):lo;out[k]=INT_KEYS.has(k)?Math.round(v):v;}if(g?.material&&g.material.model==='projected-compression')out.material=g.material;return out;}
function rng(seed){let s=seed>>>0;s=Math.imul(s^(s>>>16),0x7feb352d);s=Math.imul(s^(s>>>15),0x846ca68b);s=(s^(s>>>16))>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function authorParams(mechanism,t,seed){const r=rng((seed^(t?.hash||0))>>>0),depth=Number.isFinite(t?.depth)?t.depth:1,fanout=Number.isFinite(t?.fanout)?t.fanout:1,conv=Number.isFinite(t?.convergence)?t.convergence:0,eff=Number.isFinite(t?.effects)?t.effects:0,lit=Number.isFinite(t?.litNorm)?t.litNorm:r(),op=Number.isFinite(t?.opNorm)?t.opNorm:r();return clampGeometry({growth:.14+.16*(.55*r()+.45*lit),spread:.58+.52*(.5*r()+.3*op+.2*Math.min(1,fanout/4)),curl:.52+.98*(.5*r()+.3*lit+.2*Math.min(1,depth/6)),asymmetry:.06+.30*(.55*r()+.45*op),offset:TAU*((r()+.37*lit+.23*op)%1),frequency:2+Math.min(6,Math.round(depth*.7+lit*2.2)),lobes:3+Math.min(6,conv+eff+Math.max(0,fanout-1)+Math.round(op*1.5)),twist:1+Math.min(2,Math.max(0,depth)*.32+.65*lit+.35*r()),whorls:2+Math.min(2,Math.floor((depth+Math.max(0,fanout-1)+Math.round(op*2))/3)),...(mechanism==='toroidal-weave'?{}:{material:{model:'projected-compression',rows:48,columns:15,focus:Number((1.65+1.15*(.5*lit+.5*r())).toFixed(3)),quiet:Number((.07+.07*(.5*op+.5*r())).toFixed(3)),gain:Number((.52+.26*(.5*lit+.5*r())).toFixed(3))}})});}
function validate(record){const g=record.geometry;if(!tags.includes(record.mechanism)||!g||Object.keys(g).sort().join()!==['growth','spread','curl','asymmetry','offset','frequency','lobes','twist','whorls',...(Object.hasOwn(g,'material')?['material']:[])].sort().join())throw Error('LifeformFamilies: invalid geometry');if(g.material){const m=g.material;if(record.mechanism==='toroidal-weave'||Object.keys(m).sort().join()!==['model','rows','columns','focus','quiet','gain'].sort().join()||m.model!=='projected-compression'||m.rows!==48||m.columns!==15||!Number.isFinite(m.focus)||m.focus<1||m.focus>4||!Number.isFinite(m.quiet)||m.quiet<.02||m.quiet>.2||!Number.isFinite(m.gain)||m.gain<.3||m.gain>.9)throw Error('LifeformFamilies: invalid compression material');}for(const [k,v]of Object.entries(g).filter(([k])=>k!=='material'))if(!Number.isFinite(v)||v<LIMITS[k][0]||v>LIMITS[k][1])throw Error('LifeformFamilies: bounded parameters required');if(!Number.isInteger(g.frequency)||!Number.isInteger(g.lobes)||!Number.isInteger(g.whorls))throw Error('LifeformFamilies: integer structure required');return true;}
function compile(record,graph){validate(record);const r=JSON.parse(JSON.stringify(record)),nodes=graph.nodes,territories=r.territories.map(p=>({...p,owner:nodes.findIndex(n=>n.id===p.node)})),territoriesByComponent=Array.from({length:r.strands},()=>[]),territoryByOwner=new Array(nodes.length),territoryByNode=new Map();for(const p of territories){territoriesByComponent[p.component].push(p);if(territoryByOwner[p.owner]===undefined)territoryByOwner[p.owner]=p;if(!territoryByNode.has(p.node))territoryByNode.set(p.node,p);}return {record:r,nodes,territories,territoriesByComponent,territoryByOwner,territoryByNode,familyAdapter:true,chartCount:r.mechanism==='phyllotaxis-fan'?r.strands*r.geometry.whorls:r.strands,_basisCache:null};}
// Compiled-only caches preserve the authored record and exact arithmetic order.
function owner(body,k,u){const comp=body.territoriesByComponent[k%body.record.strands];if(comp.length===1)return comp[0].owner;for(let i=0;i<comp.length;i++){const p=comp[i];if(u>=p.u[0]&&(u<p.u[1]||u===1&&p.u[1]===1))return p.owner;}return comp[comp.length-1].owner;}
function computeBasis(body,k,u,phase){const r=body.record,g=r.geometry,p=phase%TAU,n=body.chartCount||r.record?.strands||r.strands,f=k/n,env=Math.sin(Math.PI*u),offset=g.offset+TAU*f,holonomy=Math.PI*u+TAU*PHI_INV*u*(1-u)*Math.sin(p+offset),sHol=Math.sin(holonomy),cHol=Math.cos(holonomy);
 if(r.mechanism==='logarithmic-mantle'){
  const theta=TAU*(.12+g.curl*u)+offset*.45+.18*Math.sin(p-5*u+offset),radius=.1*Math.exp(g.growth*theta)*(1+.12*Math.sin(offset+g.lobes*u)),collar=Math.exp(-(((u-.32-.1*Math.sin(offset))/.1)**2))+Math.exp(-(((u-.7-.06*Math.cos(offset))/.12)**2));
  return {env,radius,collar,width:.19*env**.8*g.spread*(.55+1.3*collar),rollTail:.6*Math.sin(g.frequency*u-p+offset)+.22*sHol,cos:Math.cos(theta),sin:Math.sin(theta),dx:.1*Math.sin(2*u+p)*env,dy:.09*Math.cos(3*u-p+offset)*env,dz:.025*Math.sin(theta+p)+.018*env*cHol};
 }else if(r.mechanism==='toroidal-weave'){
  const theta=TAU*u,eta=.26+.20*(.5+.5*Math.sin(offset+.35*g.asymmetry*theta)),cEta=Math.cos(eta),sEta=Math.sin(eta),xi1=theta+.32*g.asymmetry*Math.sin(theta+p),xi2=offset+(g.twist+.5*g.curl)*theta+.35*Math.sin(p-2*theta)+.25*holonomy,x4=sEta*Math.sin(xi2),denom=1.35-.55*x4,hopfScale=(.3+.12*g.spread+.07*Math.sin(g.lobes*theta+offset+p))/denom;
  return {env,major:hopfScale*cEta,minor:(.04+.05*g.curl+.025*Math.sin(g.frequency*theta-p+offset))*(.8+.3*Math.sin(offset)**2)*(1+.18*sEta/denom),angleHead:xi2,angleTail:.28*sHol,cos:Math.cos(xi1),sin:Math.sin(xi1),dx:.045*Math.sin(p+theta)+.035*hopfScale*sEta*Math.cos(xi2),yScale:.5+.4*g.curl+.12*Math.cos(offset),dy:.1*Math.sin(2*theta-p+offset)+.035*hopfScale*sEta*Math.sin(xi2),dz:.042*hopfScale*sEta*Math.cos(xi2-xi1)+.016*env*cHol};
 }else{
  const angle=k*Math.PI*(3-Math.sqrt(5))+g.offset+.19*Math.sin(p+offset-3*u)+(1-f)*1.5*u;
  return {env,length:(.12+.58*((k+1)/n)**.8)*g.spread,width:(.025+.13*(1-f))*Math.sin(Math.PI*u)**.8,rollTail:.65*Math.sin(g.frequency*u-p+offset)+.24*sHol,bend:.13*Math.sin(Math.PI*u)*Math.sin(offset+p-2*u),cos:Math.cos(angle),sin:Math.sin(angle),dz:.045*env*Math.sin(offset-p)+.020*env*cHol};
 }}
function basis(body,k,u,phase){let cache=body._basisCache;if(!cache){const n=body.chartCount||body.record.strands;cache=body._basisCache={phase,charts:Array.from({length:n},()=>new Map())};}else if(!Object.is(cache.phase,phase)){cache.phase=phase;for(let i=0;i<cache.charts.length;i++)cache.charts[i]?.clear();}let chart=cache.charts[k];if(!chart)cache.charts[k]=chart=new Map();const hit=chart.get(u);if(hit!==undefined)return hit;const b=computeBasis(body,k,u,phase);chart.set(u,b);return b;}
// Each component is a genuine two-parameter ribbon chart. Reuse its longitudinal
// basis across transverse samples without changing any point formula.
function point(body,k,u,v,phase,skipOwner=false){const r=body.record,g=r.geometry,b=basis(body,k,u,phase),env=b.env,edge=Math.max(0,Math.sin(Math.PI*(v+1)/2));let x,y,z;
 if(r.mechanism==='logarithmic-mantle'){
  const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);
  x=rr*b.cos+b.dx;y=rr*b.sin*1.15+b.dy;z=b.width*Math.sin(roll)+b.dz;
 }else if(r.mechanism==='toroidal-weave'){
  const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);
  x=rr*b.cos+b.dx;y=rr*b.sin*b.yScale+b.dy;z=b.minor*Math.sin(angle)+b.dz;
 }else{
  const roll=Math.PI*g.curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));
  x=radius*b.cos+(side+b.bend)*b.sin;y=radius*b.sin-(side+b.bend)*b.cos;z=b.width*Math.cos(roll)+b.dz;
 }
 const alpha=(.012+.075*env)*env**.5*(.3+.7*edge)*(1-.55*Math.abs(v));return{x,y,z,alpha,owner:skipOwner?-1:owner(body,k,u)};
}
// Precomputed transverse/longitudinal tables and O(N) Quickselect median for compressionGrid and frame.
const _v24=new Float64Array(24),_edgeFactor24=new Float64Array(24);
for(let c=0;c<24;c++){const v=2*(c+.5)/24-1,_e=Math.max(0,Math.sin(Math.PI*(v+1)/2));_v24[c]=v;_edgeFactor24[c]=(.3+.7*_e)*(1-.55*Math.abs(v));}
const _v15=new Float64Array(15),_edgeFactor15=new Float64Array(15);
for(let h=0;h<15;h++){const v=-1+2*h/14,_e=Math.max(0,Math.sin(Math.PI*(v+1)/2));_v15[h]=v;_edgeFactor15[h]=(.3+.7*_e)*(1-.55*Math.abs(v));}
const _u161=new Float64Array(161),_taper161=new Float64Array(161),_rowBases161=new Array(161),_rowOwners161=new Int32Array(161);
for(let j=0;j<=160;j++){const u=j/160;_u161[j]=u;_taper161[j]=Math.sin(Math.PI*u)**.7;}
function quickSelectMedian(arr,n){let lo=0,hi=n-1;const k=n>>1;while(lo<hi){const pivot=arr[(lo+hi)>>1];let i=lo,j=hi;while(i<=j){while(arr[i]<pivot)i++;while(arr[j]>pivot)j--;if(i<=j){const t=arr[i];arr[i]=arr[j];arr[j]=t;i++;j--;}}if(k<=j)hi=j;else if(k>=i)lo=i;else break;}return arr[k]||1;}
// A bounded numerical material grid samples the actual projected chart area.
// Median-relative concentration suppresses regular broad fields; bilinear
// interpolation lights the existing parameter curves without adding contours.
const _compX=new Float64Array(720),_compY=new Float64Array(720),_compPos=new Float64Array(720);
function compressionGrid(body,phase){const m=body.record.geometry.material;if(!m)return null;if(body.materialGrid?.phase===phase)return body.materialGrid;const n=body.chartCount||body.record.strands,rows=m.rows,cols=m.columns,len=rows*cols,mech=body.record.mechanism,curl=body.record.geometry.curl,grids=body.materialGrid?.grids?.length===n?body.materialGrid.grids:Array.from({length:n},()=>({values:new Float32Array(len),median:1}));
 for(let k=0;k<n;k++){const gridEntry=grids[k],values=gridEntry.values;let posCount=0;
 for(let i=0;i<rows;i++){const u=(i+.5)/rows,b=computeBasis(body,k,u,phase),rowOff=i*cols;for(let j=0;j<cols;j++){const v=_v15[j],index=rowOff+j;if(mech==='logarithmic-mantle'){const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);_compX[index]=rr*b.cos+b.dx;_compY[index]=rr*b.sin*1.15+b.dy;}else if(mech==='toroidal-weave'){const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);_compX[index]=rr*b.cos+b.dx;_compY[index]=rr*b.sin*b.yScale+b.dy;}else{const roll=Math.PI*curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));_compX[index]=radius*b.cos+(side+b.bend)*b.sin;_compY[index]=radius*b.sin-(side+b.bend)*b.cos;}}}
 for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const ia=Math.max(0,i-1),ib=Math.min(rows-1,i+1),ja=Math.max(0,j-1),jb=Math.min(cols-1,j+1),a=ia*cols+j,b=ib*cols+j,c=i*cols+ja,d=i*cols+jb,J=Math.abs(((_compX[b]-_compX[a])*(_compY[d]-_compY[c])-(_compY[b]-_compY[a])*(_compX[d]-_compX[c]))/(((ib-ia)/rows)*(2*(jb-ja)/(cols-1))));values[i*cols+j]=J;if(J>1e-12)_compPos[posCount++]=J;}
 const median=posCount?quickSelectMedian(_compPos,posCount):1,invMed=1/median,focus=m.focus;for(let i=0;i<len;i++){const t=1-values[i]*invMed;values[i]=t>0?Math.pow(t,focus):0;}gridEntry.median=median;}
 return body.materialGrid={phase,grids};}
function compressionAt(body,grid,k,u,v){if(!grid)return 0;const m=body.record.geometry.material,x=Math.max(0,Math.min(m.rows-1,u*m.rows-.5)),y=Math.max(0,Math.min(m.columns-1,(v+1)*(m.columns-1)/2)),i=Math.floor(x),j=Math.floor(y),a=x-i,b=y-j,g=grid.grids[k].values,cols=m.columns,i0=Math.min(m.rows-1,i)*cols,i1=Math.min(m.rows-1,i+1)*cols,j0=Math.min(cols-1,j),j1=Math.min(cols-1,j+1);return (1-a)*((1-b)*g[i0+j0]+b*g[i0+j1])+a*((1-b)*g[i1+j0]+b*g[i1+j1]);}
function normalizeExecution(body,exec){if(!exec||typeof exec!=='object')return null;const n=body.nodes.length,cl=(v,lo,hi)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;let activeOwner=Number.isInteger(exec.activeOwner)&&exec.activeOwner>=0&&exec.activeOwner<n?exec.activeOwner:-1;if(activeOwner<0&&typeof exec.activeNodeId==='string')activeOwner=body.nodes.findIndex(nd=>nd.id===exec.activeNodeId);const weights=new Float32Array(n);if(Array.isArray(exec.nodeWeights)||ArrayBuffer.isView(exec.nodeWeights)){for(let i=0;i<n;i++)weights[i]=cl(exec.nodeWeights[i],0,1);}if(activeOwner>=0&&weights[activeOwner]<1)weights[activeOwner]=1;const stackRatio=cl(exec.stackRatio??(Number.isFinite(exec.recursionDepth)?exec.recursionDepth/8:0),0,1),fuelRatio=cl(exec.fuelRatio??1,0,1),progress=cl(exec.progress??0,0,1),stepFraction=cl(exec.stepFraction??0,0,1),outcome=exec.outcome==='Done'||exec.outcome==='Rejected'||exec.outcome==='Exhausted'?exec.outcome:'Running',fault=outcome==='Rejected'||outcome==='Exhausted'?1:0,done=outcome==='Done'?1:0;return {activeOwner,weights,stackRatio,fuelRatio,progress,stepFraction,outcome,fault,done};}
function frame(body,phase,{budget=6000,crests=true,reuse,execution}={}){if(!Number.isFinite(phase)||!Number.isFinite(budget)||budget<128||budget>100000)throw Error('LifeformFamilies: frame budget');budget=Math.floor(budget);const ex=normalizeExecution(body,execution),p=phase%TAU,effPhase=ex?phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*p)+.04*ex.done*Math.sin(p):phase,points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget),n=body.chartCount||body.record.strands,grid=compressionGrid(body,effPhase),rows=Math.ceil(budget/n/24),mech=body.record.mechanism,g=body.record.geometry,curl=g.curl,offset=g.offset;if(reuse){reuse.points=points;reuse.owners=owners;}
 for(let k=0;k<n;k++){let lastU=-1,b=null,own=0,envBase=0;for(let local=0;;local++){const j=local*n+k;if(j>=budget)break;const u=Math.min(.999,(Math.floor(local/24)+.5)/rows);if(u!==lastU){lastU=u;b=computeBasis(body,k,u,effPhase);own=owner(body,k,u);envBase=(.012+.075*b.env)*Math.sqrt(Math.max(0,b.env));}const c=local%24,v=_v24[c],p4=j*4;let x,y,z;if(mech==='logarithmic-mantle'){const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);x=rr*b.cos+b.dx;y=rr*b.sin*1.15+b.dy;z=b.width*Math.sin(roll)+b.dz;}else if(mech==='toroidal-weave'){const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);x=rr*b.cos+b.dx;y=rr*b.sin*b.yScale+b.dy;z=b.minor*Math.sin(angle)+b.dz;}else{const roll=Math.PI*curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));x=radius*b.cos+(side+b.bend)*b.sin;y=radius*b.sin-(side+b.bend)*b.cos;z=b.width*Math.cos(roll)+b.dz;}let alpha=envBase*_edgeFactor24[c];if(grid)alpha*=.3+2.4*compressionAt(body,grid,k,u,v);if(ex){const w=ex.weights[own]||0,sScale=1+.06*ex.stackRatio*(.5+.5*Math.sin(TAU*u+effPhase)),tremor=ex.outcome==='Rejected'?Math.sin(2*effPhase+own*PHI_INV*TAU-TAU*u)*.024:ex.outcome==='Exhausted'?Math.cos(effPhase+own*PHI_INV*TAU-TAU*u)*.016:0;x*=sScale+tremor*.35*b.env;y*=sScale-tremor*.25*b.env;z+=(.028*w+tremor)*b.env;alpha=Math.min(1,alpha*(1+.65*w+.18*ex.done));}points[p4]=x;points[p4+1]=y;points[p4+2]=z;points[p4+3]=alpha;owners[j]=own;}}
 // Ensure even the smallest source-declared operation patch has real tissue.
 for(let j=0;j<body.nodes.length;j++){const patch=body.territoryByOwner[j]||body.territories[j%body.territories.length],uMid=(patch.u[0]+patch.u[1])/2,q=point(body,patch.component,uMid,0,effPhase),p4=j*4;let x=q.x,y=q.y,z=q.z,alpha=q.alpha;if(ex){const w=ex.weights[j]||0,envM=Math.sin(Math.PI*uMid),tremor=ex.outcome==='Rejected'?Math.sin(2*effPhase+j*PHI_INV*TAU-TAU*uMid)*.024:ex.outcome==='Exhausted'?Math.cos(effPhase+j*PHI_INV*TAU-TAU*uMid)*.016:0;z+=(.028*w+tremor)*envM;alpha=Math.min(1,alpha*(1+.65*w+.18*ex.done));}points[p4]=x;points[p4+1]=y;points[p4+2]=z;points[p4+3]=alpha;owners[j]=j;}
 const ridges=[];if(crests){const material=g.material,quiet=material?.quiet||0,gain=material?.gain||0,usePool=Boolean(reuse),pool=usePool?(body._ridgePool||(body._ridgePool=[])):null;let rIdx=0;for(let k=0;k<n;k++){const fanScale=mech==='phyllotaxis-fan'?1.7-1.1*k/n:1;for(let j=0;j<=160;j++){const u=_u161[j];_rowBases161[j]=computeBasis(body,k,u,effPhase);_rowOwners161[j]=owner(body,k,u);}for(let h=0;h<15;h++){const v=_v15[h],hWeight=h%7===0?1:.65;let ridgeObj=pool?pool[rIdx]:null;if(!ridgeObj){ridgeObj={line:new Array(161),material:'parameter-filament'};if(pool)pool[rIdx]=ridgeObj;}const line=ridgeObj.line;for(let j=0;j<=160;j++){const u=_u161[j],b=_rowBases161[j],own=_rowOwners161[j],taper=_taper161[j],along=mech==='phyllotaxis-fan'?fanScale:mech==='logarithmic-mantle'?1.4-.5*u:1;let x,y,z;if(mech==='logarithmic-mantle'){const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);x=rr*b.cos+b.dx;y=rr*b.sin*1.15+b.dy;z=b.width*Math.sin(roll)+b.dz;}else if(mech==='toroidal-weave'){const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);x=rr*b.cos+b.dx;y=rr*b.sin*b.yScale+b.dy;z=b.minor*Math.sin(angle)+b.dz;}else{const roll=Math.PI*curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));x=radius*b.cos+(side+b.bend)*b.sin;y=radius*b.sin-(side+b.bend)*b.cos;z=b.width*Math.cos(roll)+b.dz;}const exBoost=ex?1+.55*(ex.weights[own]||0)+.15*ex.done:1;if(ex){const tremor=ex.outcome==='Rejected'?Math.sin(2*effPhase+own*PHI_INV*TAU-TAU*u)*.024:ex.outcome==='Exhausted'?Math.cos(effPhase+own*PHI_INV*TAU-TAU*u)*.016:0;z+=(.022*(ex.weights[own]||0)+tremor*.8)*taper;}let pt=usePool?line[j]:null;if(grid){const focus=compressionAt(body,grid,k,u,v),alpha=Math.min(1,(quiet+gain*focus)*taper*along*exBoost);if(pt){pt.x=x;pt.y=y;pt.z=z;pt.alpha=alpha;pt.owner=own;pt.compression=focus;}else line[j]={x,y,z,alpha,owner:own,compression:focus};}else{const alpha=Math.min(1,hWeight*taper*(.5+.5*Math.sin(3*u+offset+k)**2)*along*exBoost);if(pt){pt.x=x;pt.y=y;pt.z=z;pt.alpha=alpha;pt.owner=own;}else line[j]={x,y,z,alpha,owner:own};}}ridges.push(ridgeObj);rIdx++;}}}return{points,owners,ridges};}
function anchor(body,nodeId,phase,execution){const p=body.territoryByNode?body.territoryByNode.get(nodeId):body.territories.find(p=>p.node===nodeId);if(!p)throw Error('LifeformFamilies: unknown operation');const ex=normalizeExecution(body,execution),ph=phase%TAU,effPhase=ex?phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*ph)+.04*ex.done*Math.sin(ph):phase,uMid=(p.u[0]+p.u[1])/2,q=point(body,p.component,uMid,0,effPhase);if(ex){const w=ex.weights[p.owner]||0,envM=Math.sin(Math.PI*uMid),tremor=ex.outcome==='Rejected'?Math.sin(2*effPhase+p.owner*PHI_INV*TAU-TAU*uMid)*.024:ex.outcome==='Exhausted'?Math.cos(effPhase+p.owner*PHI_INV*TAU-TAU*uMid)*.016:0;q.z+=(.028*w+tremor)*envM;q.alpha=Math.min(1,q.alpha*(1+.65*w+.18*ex.done));}return q;}
function portraitFrame(body){if(body.bounds)return body.bounds;const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity],mech=body.record.mechanism,curl=body.record.geometry.curl,n=body.chartCount||body.record.strands,vs=[-1,-.5,0,.5,1];for(let h=0;h<32;h++){const phase=TAU*h/32;for(let k=0;k<n;k++)for(let j=0;j<=80;j++){const u=j/80,b=computeBasis(body,k,u,phase);for(let vi=0;vi<5;vi++){const v=vs[vi];let x,y,z;if(mech==='logarithmic-mantle'){const roll=Math.PI*(v+1)*(1+.7*b.collar)+b.rollTail,rr=b.radius+b.width*Math.cos(roll);x=rr*b.cos+b.dx;y=rr*b.sin*1.15+b.dy;z=b.width*Math.sin(roll)+b.dz;}else if(mech==='toroidal-weave'){const angle=b.angleHead+.7*v+b.angleTail,rr=b.major+b.minor*Math.cos(angle);x=rr*b.cos+b.dx;y=rr*b.sin*b.yScale+b.dy;z=b.minor*Math.sin(angle)+b.dz;}else{const roll=Math.PI*curl*v+b.rollTail,radius=.01+b.length*u+b.width*.5*Math.sin(roll),side=b.width*(.55*v+.6*Math.cos(roll));x=radius*b.cos+(side+b.bend)*b.sin;y=radius*b.sin-(side+b.bend)*b.cos;z=b.width*Math.cos(roll)+b.dz;}if(x<lo[0])lo[0]=x;if(x>hi[0])hi[0]=x;if(y<lo[1])lo[1]=y;if(y>hi[1])hi[1]=y;if(z<lo[2])lo[2]=z;if(z>hi[2])hi[2]=z;}}}const pad=.15;return body.bounds={cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0]+2*pad,height:hi[1]-lo[1]+2*pad,depth:hi[2]-lo[2]+2*pad};}
const api={LIMITS,clampGeometry,authorParams,validate,compile,frame,anchor,portraitFrame,normalizeExecution};if(typeof module!=='undefined')module.exports=api;root.LifeformFamilies=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- woven-body.js ---
(function(root){
'use strict';
const Families=typeof module!=='undefined'?require('./lifeform-families.js'):root.LifeformFamilies;
const ADAPTERS=['logarithmic-mantle','toroidal-weave','phyllotaxis-fan'];
const TAU=2*Math.PI, PHI_INV=(Math.sqrt(5)-1)/2, MODEL='woven-field-experimental';
const check=(b,m)=>{if(!b)throw Error('WovenBody: '+m);};
function keys(o,k){check(o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===k.length&&k.every(x=>Object.hasOwn(o,x)),'unknown or missing record fields');}
function bounded(x,a,b){check(typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,'out of bounds');}
function nodes(g){const ns=Array.isArray(g)?g:g?.nodes;check(Array.isArray(ns)&&ns.length>0&&ns.length<=64,'need 1–64 operations');const ids=ns.map(n=>n.id);check(ids.every(s=>typeof s==='string'&&s.length>0&&s.length<=64)&&new Set(ids).size===ids.length,'invalid operation identifiers');return ns;}
function topology(g){const ns=nodes(g),map=new Map(ns.map(n=>[n.id,n])),incoming=new Map(ns.map(n=>[n.id,0])),outgoing=new Map(ns.map(n=>[n.id,0]));for(const n of ns)for(const d of n.args||n.inputs||[]){const id=typeof d==='string'?d:d?.node;if(map.has(id)){incoming.set(n.id,incoming.get(n.id)+1);outgoing.set(id,outgoing.get(id)+1);}}
 // Some admitted task graphs expose edges instead of args. Avoid counting twice.
 if([...incoming.values()].every(x=>x===0))for(const e of g.edges||[]){const a=e.from||e.source,b=e.to||e.target;if(map.has(a)&&map.has(b)){incoming.set(b,incoming.get(b)+1);outgoing.set(a,outgoing.get(a)+1);}}
 const memo=new Map(),vis=new Set();function depth(id){if(memo.has(id))return memo.get(id);check(!vis.has(id),'cyclic graph');vis.add(id);const n=map.get(id),deps=(n.args||n.inputs||[]).map(d=>typeof d==='string'?d:d?.node).filter(d=>map.has(d));const d=1+Math.max(0,...deps.map(depth));vis.delete(id);memo.set(id,d);return d;}
 return {depth:Math.max(...ns.map(n=>depth(n.id))),fanout:Math.max(...outgoing.values()),convergence:Math.max(...incoming.values()),guards:ns.filter(n=>/^(guard|filter|if|condition)$/.test(n.op||'')||(n.op==='action'&&map.get(n.inputs?.[0])?.op!=='literal')).length,effects:ns.filter(n=>/^(action|effect)$/.test(n.op||'')).length};}
function rng(seed){let s=(seed^0x9e3779b9)>>>0;s=Math.imul(s^(s>>>16),0x85ebca6b)>>>0;s=Math.imul(s^(s>>>13),0xc2b2ae35)>>>0;s=(s^(s>>>16))>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function programProfile(ns){let h=2166136261,litSum=0,litCount=0;const ops=new Set();const addStr=s=>{for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;};const scanVal=v=>{if(typeof v==='number'&&Number.isFinite(v)){litSum+=Math.log1p(Math.min(1e6,Math.abs(v)));litCount++;addStr(String(v));}else if(Array.isArray(v)){litSum+=Math.log1p(v.length);litCount++;for(let i=0;i<Math.min(16,v.length);i++)scanVal(v[i]);}else if(v&&typeof v==='object'){for(const k of Object.keys(v).sort()){addStr(k);scanVal(v[k]);}}else if(v!==undefined)addStr(String(v));};for(const n of ns){ops.add(n.op||'');addStr((n.id||'')+':'+(n.op||'')+':'+((n.args||n.inputs||[]).map(d=>typeof d==='string'?d:d?.node||'').join(',')));if(n.params)scanVal(n.params);}const litNorm=litCount?Math.min(1,litSum/(litCount*4.2)):((h&0xffff)/65535),opNorm=Math.min(1,(ops.size*0.11+((h>>>16)&0xff)/1020));return {hash:h>>>0,litNorm,opNorm,hasTreeBranch:ns.some(n=>/^(choose|Apply|Box|retry)$/.test(n.op||'')),hasCoupled:ns.some(n=>/^(consensus|reconcile|evidence|evidenceFresh|compareValues|Score|Quote|Decode)$/.test(n.op||'')),hasPipelineFold:ns.some(n=>/^(dedupe|sort|length|select|clamp)$/.test(n.op||''))};}
function author(graph,seed){const ns=nodes(graph),p=programProfile(ns);if(seed===undefined)seed=p.hash;bounded(seed,0,4294967295);check(Number.isInteger(seed),'integer seed required');const t=topology(graph),mechanism=t.guards>0?'clifford-flow':(t.effects===0&&t.fanout>=2&&p.hasTreeBranch)?'recursive-affine':(t.effects===0&&p.hasCoupled)?'lorenz-flow':(t.effects===0&&t.fanout<=1&&t.depth>=4&&p.hasPipelineFold)?'pleated-braid':t.fanout>=2?'recursive-julia':t.effects>0?'toroidal-weave':t.convergence>=2?'logarithmic-mantle':'phyllotaxis-fan',strands=Math.max(8,Math.min(16,7+t.fanout+Math.floor(t.convergence/2)+(mechanism==='pleated-braid'?Math.min(3,Math.floor(t.depth/2)):0))),territories=[];
 // Each operation has a positive patch. Component paths and ordered u patches
 // are explicit in source: changing graph names cannot replace the construction.
 for(let k=0;k<strands;k++){const assigned=ns.filter((n,i)=>i%strands===k);if(!assigned.length)assigned.push(ns[k%ns.length]);assigned.forEach((n,i)=>territories.push({node:n.id,component:k,u:[i/assigned.length,(i+1)/assigned.length]}));}
 const folds=t.guards>0?Math.min(6,3+Math.round(p.litNorm)):Math.min(8,3+t.convergence+(mechanism==='pleated-braid'?1+Math.round(p.litNorm*2):0)),turns=Number((1.15+Math.min(8,t.depth)*.13+.32*p.litNorm+.16*p.opNorm).toFixed(4)),record={model:MODEL,mechanism,seed,topology:t,strands,folds,turns,territories};if(mechanism==='clifford-flow'){const random=rng(seed);record.dynamics={system:'clifford',method:'iterate',parameters:[Number((-1.4-.12*p.litNorm).toFixed(4)),Number((1.6+.12*p.opNorm).toFixed(4)),Number((1+.08*(p.litNorm-.5)).toFixed(4)),Number((.7+.08*(p.opNorm-.5)).toFixed(4))],initial:[.1+.2*random(),.1+.2*random()],burn:256+64*t.guards,iterations:32768+1024*t.depth,densityGrid:160,criticalImages:Math.min(14,3+2*t.depth+t.convergence)};record.embedding={model:'bounded-native-warp',scale:[.23+.20*random(),.30+.20*random()],warp:[.04+.10*random(),.04+.10*random()],overtone:[.025+.035*random(),.025+.035*random()],frequency:[1.95+.10*Math.min(8,t.depth)+.6*(random()-.5),1.9+.10*Math.min(5,t.convergence)+.6*(random()-.5)],shear:(random()-.5)*.36};}else if(mechanism==='recursive-julia'){const random=rng(seed),jBank=[[-.745,.113],[-.7269,.1889],[-.4,.6],[-.77,.135],[.285,.01],[-.123,.745]],baseC=jBank[(p.hash+seed)%jBank.length],iters=48+4*Math.min(8,t.depth);record.geometry={model:'quadratic-julia',parameter:[Number(Math.max(-.85,Math.min(.85,baseC[0]+(p.litNorm-.5)*.014)).toFixed(4)),Number(Math.max(-.85,Math.min(.85,baseC[1]+(p.opNorm-.5)*.014)).toFixed(4))],grid:192,iterations:iters,escape:2,bounds:[-1.55,1.55,-1.2,1.2],levels:[3,5,8,12,18,26,36,48].filter(x=>x<iters),embedding:{scale:[.32+.02*Math.min(6,t.fanout)+.08*random(),.40+.08*random()],warp:[.07+.04*random(),.06+.05*random()],frequency:[1.8+.12*Math.min(12,t.depth),1.9+.15*Math.min(8,t.fanout)],shear:.14*(random()-.5)}};}else if(mechanism==='recursive-affine'){const random=rng((seed^p.hash)>>>0),count=Math.min(3,Math.max(2,t.fanout));record.geometry={model:'contractive-branch-charts',chart:'rolled-scroll',rollTurns:Number((2.25+.3*Math.min(4,t.convergence)+.35*p.litNorm).toFixed(4)),depth:Math.min(5,Math.max(3,2+Math.min(3,t.depth))),root:[Number((-.05+.1*random()).toFixed(4)),Number((.58+.08*p.litNorm).toFixed(4))],length:Number((.56+.12*(.5*random()+.5*p.litNorm)).toFixed(4)),width:Number((.16+.07*(.6*random()+.4*p.opNorm)).toFixed(4)),angle:Number((-Math.PI/2+.16*(random()-.5)).toFixed(4)),motion:Number((.15+.08*p.litNorm).toFixed(4)),transforms:Array.from({length:count},(_,i)=>({scale:Number((.47+.13*random()).toFixed(4)),angle:Number(((i/(count-1)-.5)*(1.25+.3*p.litNorm)+.14*(random()-.5)).toFixed(4)),attach:Number((.64+.3*random()).toFixed(4))}))};}else if(mechanism==='lorenz-flow'){const random=rng((seed^p.hash)>>>0),steps=3072+256*Math.min(10,t.depth+t.convergence),window=Math.min(Math.floor((steps-6)/2),640+96*Math.min(6,t.depth)+Math.floor(200*p.litNorm));record.dynamics={system:'lorenz',method:'rk4',sigma:10,rho:28,beta:8/3,initial:[Number(((.24+.52*random())*(random()<.5?-1:1)).toFixed(6)),Number(((.20+.52*random())*(random()<.5?-1:1)).toFixed(6)),Number((.18+.60*random()).toFixed(6))],dt:Number((.0045+.002*p.litNorm).toFixed(4)),burn:512+64*Math.min(8,t.depth),steps,window};}else if(ADAPTERS.includes(mechanism))record.geometry=Families.authorParams(mechanism,{...t,strands,litNorm:p.litNorm,opNorm:p.opNorm,hash:p.hash},seed);return record;}
function validate(r,graph){keys(r,['model','mechanism','seed','topology','strands','folds','turns','territories',...(['lorenz-flow','clifford-flow'].includes(r.mechanism)?['dynamics']:[]),...(['recursive-affine','recursive-julia',...ADAPTERS].includes(r.mechanism)?['geometry']:[]),...(Object.hasOwn(r,'embedding')?['embedding']:[]),...(Object.hasOwn(r,'chimera')?['chimera']:[])]);check(r.model===MODEL&&['pleated-braid','lorenz-flow','clifford-flow','recursive-affine','recursive-julia',...ADAPTERS].includes(r.mechanism),'unknown construction');if(Object.hasOwn(r,'chimera'))validateChimera(r.chimera,r.strands,graph);if(r.mechanism==='lorenz-flow'){const d=r.dynamics;keys(d,['system','method','sigma','rho','beta','initial','dt','burn','steps','window']);check(d.system==='lorenz'&&d.method==='rk4'&&d.sigma===10&&d.rho===28&&d.beta===8/3,'classical Lorenz RK4 required');check(Array.isArray(d.initial)&&d.initial.length===3,'three initial coordinates required');d.initial.forEach(x=>bounded(x,-2,2));check(Math.hypot(d.initial[0],d.initial[1])>1e-5,'exclude stationary invariant axis');bounded(d.dt,.002,.01);for(const k of ['burn','steps','window'])check(Number.isInteger(d[k]),'integer integration counts');bounded(d.burn,256,4096);bounded(d.steps,2048,16384);bounded(d.window,256,4096);check(d.window<=Math.floor((d.steps-5)/2),'orbit window and periodic travel exceed samples');}if(r.mechanism==='clifford-flow'){const d=r.dynamics;keys(d,['system','method','parameters','initial','burn','iterations','densityGrid','criticalImages']);check(d.system==='clifford'&&d.method==='iterate','Clifford recurrence required');check(Array.isArray(d.parameters)&&d.parameters.length===4&&Array.isArray(d.initial)&&d.initial.length===2,'map vectors required');d.parameters.forEach(x=>bounded(x,-2.5,2.5));d.initial.forEach(x=>bounded(x,-3,3));for(const k of ['burn','iterations','densityGrid','criticalImages'])check(Number.isInteger(d[k]),'integer map budgets');bounded(d.burn,32,4096);bounded(d.iterations,4096,131072);bounded(d.densityGrid,64,256);bounded(d.criticalImages,1,16);}if(Object.hasOwn(r,'embedding')){check(r.mechanism==='clifford-flow','embedding only for native map');const e=r.embedding;keys(e,['model','scale','warp','overtone','frequency','shear']);check(e.model==='bounded-native-warp','unknown embedding');for(const [k,a,b]of [['scale',.2,.5],['warp',0,.16],['overtone',0,.08],['frequency',1,4]]){check(Array.isArray(e[k])&&e[k].length===2,'two embedding coefficients required');e[k].forEach(x=>bounded(x,a,b));}bounded(e.shear,-.2,.2);}if(r.mechanism==='recursive-julia'){const g=r.geometry;keys(g,['model','parameter','grid','iterations','escape','bounds','levels','embedding']);check(g.model==='quadratic-julia','unknown fractal recursion');check(Array.isArray(g.parameter)&&g.parameter.length===2,'complex quadratic parameter');g.parameter.forEach(x=>bounded(x,-1,1));bounded(g.grid,128,256);bounded(g.iterations,32,96);check(Number.isInteger(g.grid)&&Number.isInteger(g.iterations)&&g.escape===2,'bounded grid/iterations and escape radius2 required');check(Array.isArray(g.bounds)&&g.bounds.length===4,'finite domain bounds');g.bounds.forEach(x=>bounded(x,-2,2));check(g.bounds[0]<g.bounds[1]&&g.bounds[2]<g.bounds[3],'positive domain');check(Array.isArray(g.levels)&&g.levels.length>=3&&g.levels.length<=12,'finite contour levels');g.levels.forEach((x,i)=>{bounded(x,2,g.iterations-1);check(!i||x>g.levels[i-1],'ordered contour levels');});const e=g.embedding;keys(e,['scale','warp','frequency','shear']);for(const [key,min,max]of [['scale',.2,.6],['warp',0,.2],['frequency',1,4]]){check(Array.isArray(e[key])&&e[key].length===2,'two embedding coordinates');e[key].forEach(x=>bounded(x,min,max));}bounded(e.shear,-.2,.2);}if(r.mechanism==='recursive-affine'){const g=r.geometry;keys(g,['model','depth','root','length','angle','motion','transforms',...(Object.hasOwn(g,'width')?['width']:[]),...(Object.hasOwn(g,'chart')?['chart']:[]),...(Object.hasOwn(g,'rollTurns')?['rollTurns']:[])]);if(Object.hasOwn(g,'rollTurns')){check(g.chart==='rolled-scroll','roll turns require scroll chart');bounded(g.rollTurns,2,4.2);}if(Object.hasOwn(g,'chart'))check(g.chart==='rolled-scroll','unknown recursive chart');if(Object.hasOwn(g,'width'))bounded(g.width,.08,.3);check(g.model==='contractive-branch-charts','unknown recursion');bounded(g.depth,2,6);check(Number.isInteger(g.depth),'integer recursion depth');check(Array.isArray(g.root)&&g.root.length===2,'root coordinates');g.root.forEach(x=>bounded(x,-1,1));bounded(g.length,.3,.8);bounded(g.angle,-Math.PI,Math.PI);bounded(g.motion,0,.25);check(Array.isArray(g.transforms)&&g.transforms.length>=2&&g.transforms.length<=3,'two or three recursive rules');for(const t of g.transforms){keys(t,['scale','angle','attach']);bounded(t.scale,.35,.67);bounded(t.angle,-1.2,1.2);bounded(t.attach,.4,1);}}if(ADAPTERS.includes(r.mechanism)){check(Families,'family adapter missing');Families.validate(r,graph);}bounded(r.seed,0,4294967295);check(Number.isInteger(r.seed),'integer seed required');keys(r.topology,['depth','fanout','convergence','guards','effects']);for(const x of Object.values(r.topology)){bounded(x,0,64);check(Number.isInteger(x),'integer graph feature required');}bounded(r.strands,8,40);bounded(r.folds,2,9);bounded(r.turns,.5,4);check(Number.isInteger(r.strands)&&Number.isInteger(r.folds),'integer lanes and folds required');check(Array.isArray(r.territories)&&r.territories.length>0&&r.territories.length<=128,'need territories');const groups=Array.from({length:r.strands},()=>[]),seen=new Set();for(const p of r.territories){keys(p,['node','component','u']);check(typeof p.node==='string'&&p.node.length>0&&p.node.length<=64,'invalid owner');bounded(p.component,0,r.strands-1);check(Number.isInteger(p.component),'integer component');check(Array.isArray(p.u)&&p.u.length===2,'interval required');p.u.forEach(x=>bounded(x,0,1));check(p.u[0]<p.u[1],'positive patch required');groups[p.component].push(p);seen.add(p.node);}for(const group of groups){group.sort((a,b)=>a.u[0]-b.u[0]);check(group.length&&group[0].u[0]===0&&group.at(-1).u[1]===1,'component ownership must cover [0,1]');for(let i=1;i<group.length;i++)check(group[i-1].u[1]===group[i].u[0],'ownership gap or overlap');}if(graph){const ns=nodes(graph),ids=new Set(ns.map(n=>n.id));check([...seen].every(id=>ids.has(id))&&ns.every(n=>seen.has(n.id)),'ownership must exactly cover graph');}return true;}
function compile(record,graph){validate(record,graph);if(ADAPTERS.includes(record.mechanism))return Families.compile(record,graph);const r=JSON.parse(JSON.stringify(record)),ns=nodes(graph),random=rng(r.seed),lanes=Array.from({length:r.strands},(_,i)=>{const core=i<4,start=core?.025+.09*random():.02+.38*random(),end=core?.84+.15*random():Math.min(.99,start+.35+.23*random());return {core,start,end,angle:core?TAU*i/4:TAU*random(),offset:random()*TAU,reach:core?.025+.035*random():.13+.28*random(),lag:.5+random(),width:core?.009+.007*random():.13+.12*random()};});const territories=r.territories.map(p=>({...p,owner:ns.findIndex(n=>n.id===p.node)})),territoriesByComponent=Array.from({length:r.strands},()=>[]),territoryByOwner=new Array(ns.length),territoryByNode=new Map();for(const t of territories){territoriesByComponent[t.component].push(t);if(territoryByOwner[t.owner]===undefined)territoryByOwner[t.owner]=t;if(!territoryByNode.has(t.node))territoryByNode.set(t.node,t);}const body={record:r,nodes:ns.map(n=>({...n})),lanes,territories,territoriesByComponent,territoryByOwner,territoryByNode};if(r.mechanism==='recursive-julia')compileJulia(body);if(r.mechanism==='recursive-affine')compileRecursive(body);if(r.mechanism==='clifford-flow')compileClifford(body);if(r.mechanism==='lorenz-flow'){body.orbit=integrateLorenz(r.dynamics);body.bishop=compileLorenzBishop(body.orbit,r.dynamics);body.lanes.forEach((l,i)=>{l.core=i<2;l.start=0;l.end=1;l.width=.1;});}return body;}
function mapStep(d,x,y){const [a,b,c,e]=d.parameters;return [Math.sin(a*y)+c*Math.cos(a*x),Math.sin(b*x)+e*Math.cos(b*y)];}
function compileClifford(body){const d=body.record.dynamics,[a,b,c,e]=d.parameters,n=d.densityGrid,bx=1+Math.abs(c),by=1+Math.abs(e),cloud=new Array(d.iterations),cells=Array.from({length:n*n},()=>({count:0,x:0,y:0,index:0}));let [x,y]=d.initial,tx=1,ty=0,log=0;for(let i=0;i<d.burn+d.iterations;i++){const vx=-a*c*Math.sin(a*x)*tx+a*Math.cos(a*y)*ty,vy=b*Math.cos(b*x)*tx-b*e*Math.sin(b*y)*ty,length=Math.hypot(vx,vy)||1;tx=vx/length;ty=vy/length;if(i>=d.burn)log+=Math.log(length);const nx=Math.sin(a*y)+c*Math.cos(a*x),ny=Math.sin(b*x)+e*Math.cos(b*y);x=nx;y=ny;if(i>=d.burn){const index=i-d.burn,ix=Math.max(0,Math.min(n-1,Math.floor((x+bx)/(2*bx)*n))),iy=Math.max(0,Math.min(n-1,Math.floor((y+by)/(2*by)*n))),cell=cells[iy*n+ix];cloud[index]=[x,y];cell.count++;cell.x+=x;cell.y+=y;cell.index=index;}}
 const random=rng(body.record.seed);body.cloud=cloud;body.mapBounds={bx,by,n};body.lyapunovEstimate=log/d.iterations;body.maxDensity=Math.max(...cells.map(c=>c.count));body.densityCells=cells;
 const max=Math.log1p(body.maxDensity)||1;
 body.marks=cells.filter(c=>c.count).map(c=>({x:c.x/c.count,y:c.y/c.count,index:c.index,density:c.count,owner:mapOwner(body,c.index),alpha:(.02+.34*Math.pow(Math.log1p(c.count)/max,.9))*(.3+.7*c.count/(c.count+3)),rank:Math.log(Math.max(1e-10,random()))/(.2+Math.sqrt(c.count))})).sort((a,b)=>b.rank-a.rank);
 body.ownerPatchMarks=body.nodes.map((_,i)=>{const patch=body.territoryByOwner[i]||body.territories[i%body.territories.length],u=(patch.u[0]+patch.u[1])/2,index=Math.min(body.cloud.length-1,Math.floor(u*body.cloud.length/body.record.strands)*body.record.strands+patch.component),[px,py]=body.cloud[index],dens=density(body,px,py);return {x:px,y:py,index,density:dens,owner:i,alpha:(.02+.34*Math.pow(Math.log1p(dens)/max,.9))*(.3+.7*dens/(dens+3))};});
 body.critical=criticalCurves(body);}
function density(body,x,y){const {bx,by,n}=body.mapBounds,ix=Math.floor((x+bx)/(2*bx)*n),iy=Math.floor((y+by)/(2*by)*n);let sum=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(ix+dx>=0&&ix+dx<n&&iy+dy>=0&&iy+dy<n)sum+=body.densityCells[(iy+dy)*n+ix+dx].count;return sum/9;}
function criticalCurves(body){const d=body.record.dynamics,[a,b,c,e]=d.parameters,{bx,by}=body.mapBounds,curves=[],active=[];const determinant=(x,y)=>a*b*(c*e*Math.sin(a*x)*Math.sin(b*y)-Math.cos(a*y)*Math.cos(b*x));for(let j=0;j<=240;j++){const x=-bx+2*bx*j/240,roots=[];let lo=-by,fl=determinant(x,lo);for(let v=1;v<=80;v++){const hi=-by+2*by*v/80,fh=determinant(x,hi);if(fl*fh<0){let l=lo,h=hi,f=fl;for(let z=0;z<8;z++){const m=(l+h)/2,g=determinant(x,m);if(f*g<=0)h=m;else{l=m;f=g;}}roots.push((l+h)/2);}lo=hi;fl=fh;}const next=[],used=new Set();for(const y of roots){let best=-1,dist=.15;for(let k=0;k<active.length;k++)if(!used.has(k)&&Math.abs(active[k].y-y)<dist){dist=Math.abs(active[k].y-y);best=k;}const trace=best<0?{y,line:[]}:active[best];if(best>=0)used.add(best);trace.y=y;trace.line.push([x,y]);next.push(trace);}for(let k=0;k<active.length;k++)if(!used.has(k)&&active[k].line.length>3)curves.push(active[k].line);active.splice(0,active.length,...next);}for(const t of active)if(t.line.length>3)curves.push(t.line);const images=[];let vertices=0;const maximum=2*d.iterations;function forward(q,count){let p=q;for(let j=0;j<count;j++)p=mapStep(d,p[0],p[1]);return p;}function midpoint(p,q){const x=(p[0]+q[0])/2;let y=(p[1]+q[1])/2;for(let j=0;j<4;j++){const f=determinant(x,y),derivative=a*b*(c*e*Math.sin(a*x)*b*Math.cos(b*y)+a*Math.sin(a*y)*Math.cos(b*x));if(Math.abs(derivative)>1e-8)y-=Math.max(-.08,Math.min(.08,f/derivative));}return [x,y];}
 const max=Math.log1p(body.maxDensity)||1;
 for(let count=1;count<=d.criticalImages;count++)for(const curve of curves){const mapped=[];function segment(p,q,fp,fq,depth){if(vertices>=maximum)return;const m=midpoint(p,q),fm=forward(m,count),distance=Math.hypot(fp[0]-fq[0],fp[1]-fq[1]),error=Math.hypot(fm[0]-(fp[0]+fq[0])/2,fm[1]-(fp[1]+fq[1])/2);if(depth<6&&vertices<maximum&&(distance>.045||error>.006)){segment(p,m,fp,fm,depth+1);segment(m,q,fm,fq,depth+1);}else{mapped.push(fp);vertices++;}}for(let j=0;j<curve.length-1&&vertices<maximum;j++)segment(curve[j],curve[j+1],forward(curve[j],count),forward(curve[j+1],count),0);if(vertices<maximum)mapped.push(forward(curve.at(-1),count));if(!mapped.length)continue;const component=images.length,len=mapped.length,den=Math.max(1,len-1),iterScale=count<=3?.32:count<=7?.60:.90;images.push({line:mapped.map(([x,y],j)=>{const dens=density(body,x,y),strength=Math.min(1,Math.log1p(dens)/max),edge=Math.min(1,j/5,(len-1-j)/5);return {x,y,density:dens,alpha:edge*iterScale*strength**.65,owner:ownerAt(body,component%body.record.strands,j/den)};}),iteration:count});}return images;}
function embedding(body){return body.record.embedding||{scale:[.33,.43],warp:[.105,.095],overtone:[.045,.035],frequency:[2.4,2.1],shear:0};}
function mapWarp(body,x,y,phase){const p=phase%TAU,e=embedding(body),d=body.record.dynamics,[a,b,c,ed]=d.parameters,ox=x*e.scale[0]+e.shear*y,oy=y*e.scale[1],envelope=Math.max(0,1-(x/(body.mapBounds.bx+.01))**2),jac=a*b*(c*ed*Math.sin(a*x)*Math.sin(b*y)-Math.cos(a*y)*Math.cos(b*x)),vort=b*Math.cos(b*x)-a*Math.cos(a*y),zSheet=.052*Math.sin(x+y+p)+.024*Math.tanh(.35*jac)*Math.cos(1.3*x-y+p)+.016*Math.sin(.5*vort+p);return {x:ox+e.warp[0]*envelope*Math.sin(e.frequency[0]*y+p)+e.overtone[0]*Math.sin(p-1.7*x)*Math.sin(y),y:oy+e.warp[1]*envelope*Math.sin(e.frequency[1]*x-p)+e.overtone[1]*Math.sin(2*p+y)*Math.sin(1.7*x),z:zSheet,alpha:1};}
function mapOwner(body,index){const u=(index+.5)/body.cloud.length,k=index%body.record.strands;return ownerAt(body,k,u);}
function cliffordFrame(body,phase,{budget=22000,crests=true,reuse}={}){bounded(phase,-1e12,1e12);bounded(budget,128,100000);budget=Math.floor(budget);const points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget),p=phase%TAU,e=embedding(body),d=body.record.dynamics,[pa,pb,pc,pe]=d.parameters,s0=e.scale[0],s1=e.scale[1],sh=e.shear,w0=e.warp[0],w1=e.warp[1],ot0=e.overtone[0],ot1=e.overtone[1],f0=e.frequency[0],f1=e.frequency[1],invBx=1/(body.mapBounds.bx+.01),marks=body.marks,mLen=marks.length,patchMarks=body.ownerPatchMarks,nLen=body.nodes.length;if(reuse){reuse.points=points;reuse.owners=owners;}
 for(let i=0;i<budget;i++){const mark=i<nLen?patchMarks[i]:marks[i%mLen],x=mark.x,y=mark.y,xr=x*invBx,env=xr*xr<1?1-xr*xr:0,jac=pa*pb*(pc*pe*Math.sin(pa*x)*Math.sin(pb*y)-Math.cos(pa*y)*Math.cos(pb*x)),vort=pb*Math.cos(pb*x)-pa*Math.cos(pa*y),p4=i*4;points[p4]=x*s0+sh*y+w0*env*Math.sin(f0*y+p)+ot0*Math.sin(p-1.7*x)*Math.sin(y);points[p4+1]=y*s1+w1*env*Math.sin(f1*x-p)+ot1*Math.sin(2*p+y)*Math.sin(1.7*x);points[p4+2]=.052*Math.sin(x+y+p)+.024*Math.tanh(.35*jac)*Math.cos(1.3*x-y+p)+.016*Math.sin(.5*vort+p);points[p4+3]=mark.alpha;owners[i]=mark.owner;}
 const ridges=[];if(crests){const usePool=Boolean(reuse),pool=usePool?(body._cliffordPool||(body._cliffordPool=[])):null;for(let component=0;component<body.critical.length;component++){const image=body.critical[component],srcLine=image.line,len=srcLine.length;let ridgeObj=pool?pool[component]:null;if(!ridgeObj){ridgeObj={line:new Array(len),material:'critical-image'};if(pool)pool[component]=ridgeObj;}const line=ridgeObj.line;for(let j=0;j<len;j++){const q=srcLine[j],x=q.x,y=q.y,xr=x*invBx,env=xr*xr<1?1-xr*xr:0,jac=pa*pb*(pc*pe*Math.sin(pa*x)*Math.sin(pb*y)-Math.cos(pa*y)*Math.cos(pb*x)),vort=pb*Math.cos(pb*x)-pa*Math.cos(pa*y),wx=x*s0+sh*y+w0*env*Math.sin(f0*y+p)+ot0*Math.sin(p-1.7*x)*Math.sin(y),wy=y*s1+w1*env*Math.sin(f1*x-p)+ot1*Math.sin(2*p+y)*Math.sin(1.7*x),wz=.052*Math.sin(x+y+p)+.024*Math.tanh(.35*jac)*Math.cos(1.3*x-y+p)+.016*Math.sin(.5*vort+p),pt=usePool?line[j]:null;if(pt){pt.x=wx;pt.y=wy;pt.z=wz;pt.alpha=q.alpha;pt.owner=q.owner;}else line[j]={x:wx,y:wy,z:wz,alpha:q.alpha,owner:q.owner};}ridges.push(ridgeObj);}}return {points,owners,ridges};}
// Finite complex quadratic recursion z -> z*z+c with Douady-Hubbard potential,
// Milnor distance estimator, and 3D Quaternion slice fiber relief.
function juliaValue(g,x,y){let zx=x,zy=y,dzx=1,dzy=0,qw=0,count=0,escaped=false;const esc2=g.escape*g.escape,p0=g.parameter[0],p1=g.parameter[1],iters=g.iterations;for(;count<iters;count++){const ndzx=2*(zx*dzx-zy*dzy),ndzy=2*(zx*dzy+zy*dzx);dzx=ndzx;dzy=ndzy;const nqw=2*zx*qw+.12*p1;const next=zx*zx-zy*zy-qw*qw*0+p0;zy=2*zx*zy+p1;zx=next;qw=Math.max(-2,Math.min(2,nqw));if(zx*zx+zy*zy>esc2){escaped=true;count++;break;}}const r=Math.hypot(zx,zy),dr=Math.hypot(dzx,dzy)||1,logR=Math.max(1e-10,Math.log(Math.max(1+1e-9,r))),value=escaped?Math.max(0,Math.min(iters,count+1-Math.log2(logR))):iters,pot=escaped?logR/Math.pow(2,Math.min(24,count)):0,dist=escaped?Math.min(1.5,.5*r*logR/dr):0,invR=r>1e-9?1/r:1;return {value,escaped,count,pot,dist,cosArg:zx*invR,sinArg:zy*invR,q2:qw};}
function compileJulia(body){const g=body.record.geometry,n=g.grid,[xmin,xmax,ymin,ymax]=g.bounds,field=new Float32Array(n*n),holoGrid=new Float32Array(n*n*4),marks=[],random=rng(body.record.seed),dx=(xmax-xmin)/(n-1),dy=(ymax-ymin)/(n-1);for(let row=0;row<n;row++)for(let col=0;col<n;col++){const x=xmin+dx*col,y=ymin+dy*row,q=juliaValue(g,x,y),index=row*n+col,h4=index*4;field[index]=q.value;holoGrid[h4]=q.pot;holoGrid[h4+1]=q.dist;holoGrid[h4+2]=q.cosArg;holoGrid[h4+3]=q.sinArg;if(q.value>2.5){const alpha=q.escaped?.025+.20*Math.min(1,q.value/g.iterations)**.6:.018,weight=q.escaped?.25+Math.sqrt(q.value):.15;marks.push({x,y,index,value:q.value,pot:q.pot,dist:q.dist,cosArg:q.cosArg,sinArg:q.sinArg,alpha,owner:juliaOwner(body,index),rank:Math.log(Math.max(1e-10,random()))/weight});}}
 marks.sort((a,b)=>b.rank-a.rank);const ownerMarks=new Array(body.nodes.length);for(let i=0;i<marks.length;i++){const m=marks[i];if(ownerMarks[m.owner]===undefined)ownerMarks[m.owner]=m;}for(let i=0;i<body.nodes.length;i++)if(ownerMarks[i]===undefined){const p=body.territoryByOwner[i]||body.territories[i%body.territories.length],col=Math.min(n-1,Math.floor((p.component+.5)/body.record.strands*n)),row=Math.min(n-1,Math.floor(((p.u[0]+p.u[1])/2)*(n-1))),idx=row*n+col,h4=idx*4;ownerMarks[i]={x:xmin+dx*col,y:ymin+dy*row,index:idx,value:field[idx],pot:holoGrid[h4],dist:holoGrid[h4+1],cosArg:holoGrid[h4+2],sinArg:holoGrid[h4+3],alpha:.018,owner:i,rank:0};}
 body.julia={field,holoGrid,marks,ownerMarks,dx,dy,contours:[]};
 // Edge keys preserve continuous ownership and contour topology. Each segment
 // interpolates an actual scalar escape-level crossing on a finite grid edge.
 for(let levelIndex=0;levelIndex<g.levels.length;levelIndex++){const level=g.levels[levelIndex],vertices=new Map(),segments=[],adj=new Map(),vertex=(ax,ay,bx,by)=>{const ia=ay*n+ax,ib=by*n+bx,key=Math.min(ia,ib)+':'+Math.max(ia,ib);if(vertices.has(key))return key;const a=field[ia],b=field[ib],t=(level-a)/(b-a),x=xmin+dx*(ax+t*(bx-ax)),y=ymin+dy*(ay+t*(by-ay));vertices.set(key,{x,y,level,residual:(a+(b-a)*t)-level});return key;},join=(a,b)=>{const id=segments.length;segments.push([a,b]);for(const key of [a,b]){if(!adj.has(key))adj.set(key,[]);adj.get(key).push(id);}};
 for(let row=0;row<n-1;row++){const r0=row*n,r1=(row+1)*n;for(let col=0;col<n-1;col++){const f0=field[r0+col],f1=field[r0+col+1],f2=field[r1+col+1],f3=field[r1+col],s0=f0>=level,s1=f1>=level,s2=f2>=level,s3=f3>=level;if(s0===s1&&s1===s2&&s2===s3)continue;const crossings=[];if(s0!==s1)crossings.push(vertex(col,row,col+1,row));if(s1!==s2)crossings.push(vertex(col+1,row,col+1,row+1));if(s2!==s3)crossings.push(vertex(col+1,row+1,col,row+1));if(s3!==s0)crossings.push(vertex(col,row+1,col,row));if(crossings.length===2)join(crossings[0],crossings[1]);else if(crossings.length===4){const center=(f0+f1+f2+f3)/4;if(center>=level){join(crossings[0],crossings[1]);join(crossings[2],crossings[3]);}else{join(crossings[0],crossings[3]);join(crossings[1],crossings[2]);}}}}
 const used=new Set(),trace=(start,id)=>{const line=[vertices.get(start)];let key=start;while(id!==undefined&&!used.has(id)){used.add(id);const edge=segments[id];key=edge[0]===key?edge[1]:edge[0];line.push(vertices.get(key));id=adj.get(key).find(i=>!used.has(i));}if(line.length>2)body.julia.contours.push({levelIndex,line});};for(const [key,ids]of adj)if(ids.length===1&&!used.has(ids[0]))trace(key,ids[0]);for(let i=0;i<segments.length;i++)if(!used.has(i))trace(segments[i][0],i);
 }
 const lvlDen=Math.max(1,g.levels.length-1);
 for(const curve of body.julia.contours){const component=curve.levelIndex%body.record.strands,len=curve.line.length,lineDen=Math.max(1,len-1),baseAlpha=.14+.68*(curve.levelIndex/lvlDen)**.7;curve.meta=curve.line.map((q,j)=>{const fade=Math.min(1,j/4,(len-1-j)/4),col=Math.max(0,Math.min(n-1,Math.round((q.x-xmin)/dx))),row=Math.max(0,Math.min(n-1,Math.round((q.y-ymin)/dy))),h4=(row*n+col)*4;return {x:q.x,y:q.y,pot:holoGrid[h4],dist:holoGrid[h4+1],cosArg:holoGrid[h4+2],sinArg:holoGrid[h4+3],alpha:baseAlpha*Math.max(0,fade),owner:ownerAt(body,component,j/lineDen),native:{x:q.x,y:q.y,level:q.level,residual:q.residual}};});}
 check(body.julia.marks.length>=body.nodes.length,'Julia field needs positive owned tissue');}
function juliaHoloRelief(body,x,y,p,pot,dist,cosArg,sinArg){const relief=Math.exp(-3.5*(pot||0))*(1-.45*Math.min(1,dist||0)),argWave=(cosArg||0)*Math.cos(p)-(sinArg||0)*Math.sin(p);return .045*Math.sin(x-y+p)+.038*relief*argWave+.018*Math.cos(2*(x+y)-p)*(1-relief);}
function juliaWarp(body,x,y,phase){const g=body.record.geometry,e=g.embedding,p=phase%TAU,env=Math.max(0,1-(x/Math.max(Math.abs(g.bounds[0]),Math.abs(g.bounds[1])))**2),n=g.grid,[xmin,,ymin]=g.bounds,col=Math.max(0,Math.min(n-1,Math.round((x-xmin)/body.julia.dx))),row=Math.max(0,Math.min(n-1,Math.round((y-ymin)/body.julia.dy))),h4=(row*n+col)*4,hg=body.julia.holoGrid;return {x:e.scale[0]*x+e.shear*y+e.warp[0]*env*Math.sin(e.frequency[0]*y+p),y:e.scale[1]*y+e.warp[1]*env*Math.sin(e.frequency[1]*x-p),z:juliaHoloRelief(body,x,y,p,hg[h4],hg[h4+1],hg[h4+2],hg[h4+3]),alpha:1};}
function juliaOwner(body,index){const g=body.record.geometry,n=g.grid,col=index%n,row=Math.floor(index/n),component=Math.min(body.record.strands-1,Math.floor(col/n*body.record.strands)),u=row/(n-1);return ownerAt(body,component,u);}
function juliaFrame(body,phase,{budget=6500,crests=true,reuse}={}){bounded(phase,-1e12,1e12);bounded(budget,128,100000);budget=Math.floor(budget);const points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget),marks=body.julia.marks,mLen=marks.length,g=body.record.geometry,e=g.embedding,p=phase%TAU,s0=e.scale[0],s1=e.scale[1],sh=e.shear,w0=e.warp[0],w1=e.warp[1],f0=e.frequency[0],f1=e.frequency[1],invB=1/Math.max(Math.abs(g.bounds[0]),Math.abs(g.bounds[1]));if(reuse){reuse.points=points;reuse.owners=owners;}
 for(let i=0;i<budget;i++){const m=marks[i%mLen],x=m.x,y=m.y,xr=x*invB,env=xr*xr<1?1-xr*xr:0,p4=i*4;points[p4]=s0*x+sh*y+w0*env*Math.sin(f0*y+p);points[p4+1]=s1*y+w1*env*Math.sin(f1*x-p);points[p4+2]=juliaHoloRelief(body,x,y,p,m.pot,m.dist,m.cosArg,m.sinArg);points[p4+3]=m.alpha;owners[i]=m.owner;}
 for(let i=0;i<body.nodes.length;i++){const m=body.julia.ownerMarks?.[i]||marks.find(m=>juliaOwner(body,m.index)===i);check(m,'Julia ownership patch misses finite field');const x=m.x,y=m.y,xr=x*invB,env=xr*xr<1?1-xr*xr:0,p4=i*4;points[p4]=s0*x+sh*y+w0*env*Math.sin(f0*y+p);points[p4+1]=s1*y+w1*env*Math.sin(f1*x-p);points[p4+2]=juliaHoloRelief(body,x,y,p,m.pot,m.dist,m.cosArg,m.sinArg);points[p4+3]=m.alpha;owners[i]=i;}
 const ridges=[];if(crests){const contours=body.julia.contours,usePool=Boolean(reuse),pool=usePool?(body._juliaPool||(body._juliaPool=[])):null;for(let c=0;c<contours.length;c++){const curve=contours[c],meta=curve.meta,len=meta.length;let ridgeObj=pool?pool[c]:null;if(!ridgeObj){ridgeObj={line:new Array(len),material:'finite-julia-escape-contour'};if(pool)pool[c]=ridgeObj;}const line=ridgeObj.line;for(let j=0;j<len;j++){const q=meta[j],x=q.x,y=q.y,xr=x*invB,env=xr*xr<1?1-xr*xr:0,wx=s0*x+sh*y+w0*env*Math.sin(f0*y+p),wy=s1*y+w1*env*Math.sin(f1*x-p),wz=juliaHoloRelief(body,x,y,p,q.pot,q.dist,q.cosArg,q.sinArg),pt=usePool?line[j]:null;if(pt){pt.x=wx;pt.y=wy;pt.z=wz;pt.alpha=q.alpha;pt.owner=q.owner;pt.native=q.native;}else line[j]={x:wx,y:wy,z:wz,alpha:q.alpha,owner:q.owner,native:q.native};}ridges.push(ridgeObj);}}return {points,owners,ridges};}
function juliaBounds(body){const g=body.record.geometry,e=g.embedding,x=Math.max(Math.abs(g.bounds[0]),Math.abs(g.bounds[1])),y=Math.max(Math.abs(g.bounds[2]),Math.abs(g.bounds[3]));return {cx:0,cy:0,cz:0,width:2*(x*e.scale[0]+Math.abs(e.shear)*y+e.warp[0]+.01),height:2*(y*e.scale[1]+e.warp[1]+.01),depth:.24};}

// Genuine finite recursive affine construction: each child is a contracted
// rotation translated to an authored location of its parent's stem chart.
// Infinite address paths converge because every source rule scale < 1.
function compileRecursive(body){const g=body.record.geometry,branches=[{parent:-1,rule:-1,depth:0,scale:1,component:0}];for(let i=0;i<branches.length;i++){const b=branches[i];if(b.depth<g.depth||branches.length<body.record.strands)g.transforms.forEach((t,rule)=>branches.push({parent:i,rule,depth:b.depth+1,scale:b.scale*t.scale,component:branches.length%body.record.strands}));}body.branches=branches;body.recursive=true;}
function recursivePose(body,phase){if(body.recursivePose?.phase===phase)return body.recursivePose.poses;const g=body.record.geometry,poses=[];for(let i=0;i<body.branches.length;i++){const b=body.branches[i];let x,y,angle,length=g.length*b.scale;if(b.parent<0){[x,y]=g.root;angle=g.angle+.1*g.motion*Math.sin(phase);}else{const parent=poses[b.parent],rule=g.transforms[b.rule];const pb=body.branches[b.parent],u=rule.attach,env=Math.sin(Math.PI*u),D=parent.length*(u+(g.chart ? .20*env*Math.sin(TAU*u+.4*Math.sin(phase)):0)),S=g.chart ? .22*parent.length*env*Math.sin(TAU*u+.6*Math.sin(phase)+.2*pb.depth):0;x=parent.x+D*parent.cos-S*parent.sin;y=parent.y+D*parent.sin+S*parent.cos;angle=parent.angle+rule.angle+g.motion*Math.sin(phase-.65*b.depth+.8*b.rule);}poses.push({x,y,angle,length,cos:Math.cos(angle),sin:Math.sin(angle)});}body.recursivePose={phase,poses};return poses;}
function recursivePleatPoint(body,index,u,v,phase){const b=body.branches[index],p=recursivePose(body,phase)[index],env=Math.sin(Math.PI*u),bend=.13*p.length*env*Math.sin(phase-.4*b.depth+b.rule),width=p.length*(.018+(body.record.geometry.width||.065)*env)*(1-u*.55),fold=body.record.folds*Math.PI*v+2*Math.sin(6*u-phase+b.depth),side=width*(v+.25*Math.sin(fold)),s=p.sin,c=p.cos,distance=p.length*u+.38*width*Math.cos(fold),compression=Math.min(6,1/(.2+Math.abs(1+.25*body.record.folds*Math.PI*Math.cos(fold))));return {x:p.x+distance*c-(bend+side)*s,y:p.y+distance*s+(bend+side)*c,z:width*Math.cos(fold),alpha:(.065+.06*compression)*env**.6/(1+.06*b.depth)/(1+.4*b.depth)**2,owner:ownerAt(body,b.component,u)};}
function recursiveScrollRow(body,k,u,phase){let cache=body._scrollRowCache;if(!cache||cache.phase!==phase){cache=body._scrollRowCache={phase,byBranch:new Array(body.branches.length)};}let bMap=cache.byBranch[k];if(!bMap)bMap=cache.byBranch[k]=new Map();const hit=bMap.get(u);if(hit!==undefined)return hit;const b=body.branches[k],p=recursivePose(body,phase)[k],L=p.length,A=body.record.geometry.width||.065,env=Math.sin(Math.PI*u),cos=Math.cos(Math.PI*u),w=L*(.018+A*env)*(1-.55*u),wu=L*(A*Math.PI*cos*(1-.55*u)-.55*(.018+A*env)),psi=TAU*u+.4*Math.sin(phase),chi=TAU*u+.6*Math.sin(phase)+.2*b.depth,D=L*(u+.20*env*Math.sin(psi)),S=.22*L*env*Math.sin(chi),Du=L*(1+.20*(Math.PI*cos*Math.sin(psi)+env*TAU*Math.cos(psi))),Su=.22*L*(Math.PI*cos*Math.sin(chi)+env*TAU*Math.cos(chi)),Fu=3.2*Math.cos(4*u-phase),Fv=(body.record.geometry.rollTurns||1.3)*Math.PI,offset=Fv+.8*Math.sin(4*u-phase),row={p,b,L,env,w,wu,D,S,Du,Su,Fu,Fv,offset,zWave:.2*w*Math.sin(TAU*u-phase),own:ownerAt(body,b.component,u),radialBase:body.record.geometry.rollTurns ? .575 : .7,radialSlope:body.record.geometry.rollTurns ? .425 : .12};bMap.set(u,row);return row;}
function recursiveScrollJacobian(row,v){const F=row.Fv*v+row.offset,s=Math.sin(F),c=Math.cos(F),factor=row.radialBase+row.radialSlope*v,R=row.w*factor,Ru=row.wu*factor,Rv=row.radialSlope*row.w,Du=row.Du+.7*(Ru*c-R*s*row.Fu),Dv=.7*(Rv*c-R*s*row.Fv),Su=row.Su+Ru*s+R*c*row.Fu,Sv=Rv*s+R*c*row.Fv;return Du*Sv-Su*Dv;}
function recursivePoint(body,k,u,v,phase,skipJacobian=false){if(!body.record.geometry.chart)return recursivePleatPoint(body,k,u,v,phase);const row=recursiveScrollRow(body,k,u,phase),F=row.Fv*v+row.offset,cF=Math.cos(F),sF=Math.sin(F),factor=row.radialBase+row.radialSlope*v,R=row.w*factor,D=row.D+.7*R*cF,S=row.S+R*sF,c=row.p.cos,s=row.p.sin;if(skipJacobian)return {x:row.p.x+D*c-S*s,y:row.p.y+D*s+S*c,z:.6*R*cF+row.zWave,alpha:0,owner:row.own};const Ru=row.wu*factor,Rv=row.radialSlope*row.w,Du=row.Du+.7*(Ru*cF-R*sF*row.Fu),Dv=.7*(Rv*cF-R*sF*row.Fv),Su=row.Su+Ru*sF+R*cF*row.Fu,Sv=Rv*sF+R*cF*row.Fv,J=Du*Sv-Su*Dv,compression=Math.min(6,1/(.15+Math.abs(J)/(row.L*row.w)));return {x:row.p.x+D*c-S*s,y:row.p.y+D*s+S*c,z:.6*R*cF+row.zWave,alpha:(.065+.06*compression)*row.env**.6/(1+.06*row.b.depth)/(1+.4*row.b.depth)**2,owner:row.own};}

function recursiveFrame(body,phase,{budget=6500,crests=true,reuse}={}){bounded(phase,-1e12,1e12);bounded(budget,128,100000);budget=Math.floor(budget);const points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget),branches=body.branches,weights=branches.map(b=>b.scale),total=weights.reduce((a,b)=>a+b,0),counts=weights.map(w=>Math.floor(budget*w/total));if(reuse){reuse.points=points;reuse.owners=owners;}for(let j=counts.reduce((a,b)=>a+b,0);j<budget;j++)counts[j%counts.length]++;let cursor=0;for(let k=0;k<branches.length;k++)for(let j=0;j<counts[k];j++){const cols=Math.min(24,counts[k]),rows=Math.ceil(counts[k]/cols),u=(Math.floor(j/cols)+.5)/rows,v=2*((j%cols)+.5)/cols-1,q=recursivePoint(body,k,u,v,phase),p4=cursor*4;points[p4]=q.x;points[p4+1]=q.y;points[p4+2]=q.z;points[p4+3]=q.alpha;owners[cursor++]=q.owner;}
 for(let j=0;j<body.nodes.length;j++){const t=body.territoryByOwner[j]||body.territories[j%body.territories.length],k=Math.max(0,branches.findIndex(b=>b.component===t.component)),q=recursivePoint(body,k,(t.u[0]+t.u[1])/2,0,phase),p4=j*4;points[p4]=q.x;points[p4+1]=q.y;points[p4+2]=q.z;points[p4+3]=q.alpha;owners[j]=j;}
 const ridges=[];if(crests){const fast=Boolean(reuse);branches.forEach((b,k)=>{
 if(b.depth<=2)ridges.push(...recursiveCaustics(body,k,phase,fast));
 const vs=b.depth<=2?[-.9,-.6,-.3,0,.3,.6,.9]:[-.6,0,.6],steps=Math.max(24,Math.floor(96*Math.sqrt(b.scale))),baseAlpha=(b.depth<=2?.25:.15)/(1+.4*b.depth)**2;
 for(let vi=0;vi<vs.length;vi++){const v=vs[vi],line=new Array(steps+1);
 for(let j=0;j<=steps;j++){const u=j/steps,q=recursivePoint(body,k,u,v,phase,true);q.alpha=baseAlpha*Math.sin(Math.PI*u)**.6;line[j]=q;}
 ridges.push({line,material:'recursive-chart'});
 }});}return {points,owners,ridges};}
// Exact signed projected Jacobian of the folded immersion. Rigid branch
// rotation has determinant one. Cache longitudinal coefficients once per row.
function recursiveJacobianRow(body,k,u,phase){if(body.record.geometry.chart){const row=recursiveScrollRow(body,k,u,phase);return v=>recursiveScrollJacobian(row,v);}const branch=body.branches[k],L=recursivePose(body,phase)[k].length,A=body.record.geometry.width||.065,env=Math.sin(Math.PI*u),cos=Math.cos(Math.PI*u),w=L*(.018+A*env)*(1-.55*u),wu=L*(A*Math.PI*cos*(1-.55*u)-.55*(.018+A*env)),f=6*u-phase+branch.depth,Fu=12*Math.cos(f),Fv=body.record.folds*Math.PI,offset=2*Math.sin(f),bu=.13*L*Math.PI*cos*Math.sin(phase-.4*branch.depth+branch.rule);
 return v=>{const F=Fv*v+offset,S=Math.sin(F),C=Math.cos(F),Du=L+.38*(wu*C-w*S*Fu),Dv=-.38*w*S*Fv,Su=bu+wu*(v+.25*S)+.25*w*C*Fu,Sv=w*(1+.25*C*Fv);return Du*Sv-Su*Dv;};}

function solveDepthRoots(body,k,phase,fast){const isScroll=Boolean(body.record.geometry.chart),depth=body.branches[k].depth;if(isScroll){let cache=body._depthRootCache;if(!cache||cache.phase!==phase)cache=body._depthRootCache={phase,byDepth:[]};if(cache.byDepth[depth])return cache.byDepth[depth];const rows=new Array(97),iters=fast?4:10;for(let step=0;step<=96;step++){const u=step/96,row=recursiveScrollRow(body,k,u,phase),roots=[];let left=-1,jl=recursiveScrollJacobian(row,left);for(let col=1;col<=48;col++){const right=-1+2*col/48,jr=recursiveScrollJacobian(row,right);if(jl*jr<0){let a=left,b=right,ja=jl,jb=jr;for(let iteration=0;iteration<iters;iteration++){const m=(a+b)/2,jm=recursiveScrollJacobian(row,m);if(ja*jm<=0){b=m;jb=jm;}else{a=m;ja=jm;}}roots.push(fast?(a*jb-b*ja)/(jb-ja||1):(a+b)/2);}left=right;jl=jr;}rows[step]=roots;}cache.byDepth[depth]=rows;return rows;}const rows=new Array(97),iters=fast?4:10;for(let step=0;step<=96;step++){const u=step/96,roots=[],jacobian=recursiveJacobianRow(body,k,u,phase);let left=-1,jl=jacobian(left);for(let col=1;col<=48;col++){const right=-1+2*col/48,jr=jacobian(right);if(jl*jr<0){let a=left,b=right,ja=jl;for(let iteration=0;iteration<iters;iteration++){const m=(a+b)/2,jm=jacobian(m);if(ja*jm<=0)b=m;else{a=m;ja=jm;}}roots.push((a+b)/2);}left=right;jl=jr;}rows[step]=roots;}return rows;}
function recursiveScrollSingularityGain(row,v){const F=row.Fv*v+row.offset,s=Math.sin(F),c=Math.cos(F),Fv=row.Fv,factor=row.radialBase+row.radialSlope*v,R=row.w*factor,Ru=row.wu*factor,Rv=row.radialSlope*row.w,Ruv=row.radialSlope*row.wu,Du=row.Du+.7*(Ru*c-R*s*row.Fu),Dv=.7*(Rv*c-R*s*Fv),Su=row.Su+Ru*s+R*c*row.Fu,Sv=Rv*s+R*c*Fv,Duv=.7*(Ruv*c-(Ru*Fv+Rv*row.Fu)*s-R*c*row.Fu*Fv),Dvv=.7*(-2*Rv*s*Fv-R*c*Fv*Fv),Suv=Ruv*s+(Ru*Fv+Rv*row.Fu)*c-R*s*row.Fu*Fv,Svv=2*Rv*c*Fv-R*s*Fv*Fv,Jv=Duv*Sv+Du*Svv-Suv*Dv-Su*Dvv,scale=Math.max(1e-6,row.L*row.w*Fv);return .78+.22/(1+1.5*Math.abs(Jv)/scale);}
function recursiveCaustics(body,k,phase,fast=false){const tracks=[],finished=[],depth=body.branches[k].depth,rootRows=solveDepthRoots(body,k,phase,fast),isScroll=Boolean(body.record.geometry.chart);
 const finish=t=>{if(t.line.length>=3){for(let j=0;j<t.line.length;j++){const fade=Math.min(1,j/3,(t.line.length-1-j)/3);t.line[j].alpha*=Math.max(0,fade);}finished.push({line:t.line,material:'recursive-projected-caustic'});}};
 for(let step=0;step<=96;step++){
 const u=step/96,roots=rootRows[step],row=isScroll?recursiveScrollRow(body,k,u,phase):null,jacobian=isScroll?null:recursiveJacobianRow(body,k,u,phase);
 const unmatched=new Set(tracks),next=[];
 for(let r=0;r<roots.length;r++){const v=roots[r];let nearest=null,distance=.18;for(const t of unmatched){const d=Math.abs(v-t.v);if(d<distance){nearest=t;distance=d;}}
 const q=recursivePoint(body,k,u,v,phase,true),cuspGain=isScroll?recursiveScrollSingularityGain(row,v):1;q.alpha=Math.min(1,(depth<2?1:.8)*(row?row.env:Math.sin(Math.PI*u))**.45*cuspGain);if(!fast)q.chart={branch:k,u,v,jacobian:isScroll?recursiveScrollJacobian(row,v):jacobian(v)};
 if(nearest){unmatched.delete(nearest);nearest.line.push(q);nearest.v=v;next.push(nearest);}else next.push({v,line:[q]});
 }for(const t of unmatched)finish(t);tracks.splice(0,tracks.length,...next);
 }for(const t of tracks)finish(t);return finished;}

function recursiveBounds(body){if(body.bounds)return body.bounds;const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let h=0;h<64;h++){const phase=TAU*h/64;for(let k=0;k<body.branches.length;k++)for(const u of [0,.25,.5,.75,1])for(const v of [-1,0,1]){const p=recursivePoint(body,k,u,v,phase);[p.x,p.y,p.z].forEach((x,d)=>{lo[d]=Math.min(lo[d],x);hi[d]=Math.max(hi[d],x);});}}const pad=.16;return body.bounds={cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0]+2*pad,height:hi[1]-lo[1]+2*pad,depth:hi[2]-lo[2]+2*pad};}
// Classical Lorenz dynamics (Lorenz, 1963). Fixed-step RK4 is fully
// source-authored. This finite numerical sample is not a proof of chaos.
function integrateLorenz(d){const sigma=d.sigma,rho=d.rho,beta=d.beta,dt=d.dt,half=dt/2,burn=d.burn,total=burn+d.steps,orbit=new Array(d.steps);let [x,y,z]=d.initial;for(let i=0;i<total;i++){const ax=sigma*(y-x),ay=x*(rho-z)-y,az=x*y-beta*z,x1=x+half*ax,y1=y+half*ay,z1=z+half*az,bx=sigma*(y1-x1),by=x1*(rho-z1)-y1,bz=x1*y1-beta*z1,x2=x+half*bx,y2=y+half*by,z2=z+half*bz,cx=sigma*(y2-x2),cy=x2*(rho-z2)-y2,cz=x2*y2-beta*z2,x3=x+dt*cx,y3=y+dt*cy,z3=z+dt*cz,ex=sigma*(y3-x3),ey=x3*(rho-z3)-y3,ez=x3*y3-beta*z3;x+=dt*(ax+2*bx+2*cx+ex)/6;y+=dt*(ay+2*by+2*cy+ey)/6;z+=dt*(az+2*bz+2*cz+ez)/6;check(Number.isFinite(x)&&Math.abs(x)<100&&Number.isFinite(y)&&Math.abs(y)<100&&Number.isFinite(z)&&Math.abs(z)<100,'integration escaped finite admitted enclosure');if(i>=burn)orbit[i-burn]=[x*.036,(25-z)*.03,y*.009];}return orbit;}
function compileLorenzBishop(orbit,d){const n=orbit.length,U=new Array(n),V=new Array(n),torsion=new Float64Array(n),thomas=new Array(n),bT=.208186,dtT=d.dt*2.4;let ux=.12,uy=-.18,uz=.24,psi=0;for(let i=0;i<n;i++){const p0=orbit[Math.max(0,i-1)],p1=orbit[Math.min(n-1,i+1)],tx=p1[0]-p0[0],ty=p1[1]-p0[1],tz=p1[2]-p0[2],tl=Math.hypot(tx,ty,tz)||1,T0=tx/tl,T1=ty/tl,T2=tz/tl;if(i===0){const sc=Math.hypot(T0,T1)||1;U[0]=[-T1/sc,T0/sc,0];V[0]=[-T2*U[0][1],T2*U[0][0],T0*U[0][1]-T1*U[0][0]];}else{const pm=orbit[Math.max(0,i-2)], pc=orbit[i],ptx=pc[0]-pm[0],pty=pc[1]-pm[1],ptz=pc[2]-pm[2],ptl=Math.hypot(ptx,pty,ptz)||1,P0=ptx/ptl,P1=pty/ptl,P2=ptz/ptl,ax=P1*T2-P2*T1,ay=P2*T0-P0*T2,az=P0*T1-P1*T0,sinA=Math.hypot(ax,ay,az),cosA=Math.max(-1,Math.min(1,P0*T0+P1*T1+P2*T2)),uPrev=U[i-1];let u0=uPrev[0],u1=uPrev[1],u2=uPrev[2];if(sinA>1e-7){const kx=ax/sinA,ky=ay/sinA,kz=az/sinA,dot=kx*u0+ky*u1+kz*u2,cx=ky*u2-kz*u1,cy=kz*u0-kx*u2,cz=kx*u1-ky*u0;u0=u0*cosA+cx*sinA+kx*dot*(1-cosA);u1=u1*cosA+cy*sinA+ky*dot*(1-cosA);u2=u2*cosA+cz*sinA+kz*dot*(1-cosA);}const tDot=u0*T0+u1*T1+u2*T2;u0-=tDot*T0;u1-=tDot*T1;u2-=tDot*T2;const ul=Math.hypot(u0,u1,u2)||1;u0/=ul;u1/=ul;u2/=ul;U[i]=[u0,u1,u2];V[i]=[T1*u2-T2*u1,T2*u0-T0*u2,T0*u1-T1*u0];psi+=sinA*1.35;}torsion[i]=psi;const q=orbit[i],dux=Math.sin(uy)-bT*ux+.14*(q[0]*2.2-ux),duy=Math.sin(uz)-bT*uy+.14*(q[1]*2.2-uy),duz=Math.sin(ux)-bT*uz+.14*(q[2]*3.5-uz);ux+=dtT*dux;uy+=dtT*duy;uz+=dtT*duz;thomas[i]=[Math.tanh(ux*.35),Math.tanh(uy*.35),Math.tanh(uz*.35)];}return {U,V,torsion,thomas};}
function orbitPoint(body,index){const n=body.orbit.length,i=Math.max(1,Math.min(n-3,Math.floor(index))),t=Math.max(0,Math.min(1,index-i)),t2=t*t,t3=t2*t,p=body.orbit,p0=p[i-1],p1=p[i],p2=p[i+1],p3=p[i+2];return [.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),.5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3),.5*((2*p1[2])+(-p0[2]+p2[2])*t+(2*p0[2]-5*p1[2]+4*p2[2]-p3[2])*t2+(-p0[2]+3*p1[2]-3*p2[2]+p3[2])*t3)];}
function orbitTangent(body,index){const n=body.orbit.length,i=Math.max(1,Math.min(n-3,Math.floor(index))),t=Math.max(0,Math.min(1,index-i)),t2=t*t,p=body.orbit,p0=p[i-1],p1=p[i],p2=p[i+1],p3=p[i+2];return [.5*((-p0[0]+p2[0])+2*(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t+3*(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t2),.5*((-p0[1]+p2[1])+2*(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t+3*(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t2),.5*((-p0[2]+p2[2])+2*(2*p0[2]-5*p1[2]+4*p2[2]-p3[2])*t+3*(-p0[2]+3*p1[2]-3*p2[2]+p3[2])*t2)];}
function lorenzSpine(body,u,phase){let cache=body._lorenzSpineCache;if(!cache||cache.phase!==phase)cache=body._lorenzSpineCache={phase,map:new Map()};const hit=cache.map.get(u);if(hit!==undefined)return hit;const d=body.record.dynamics,start=2+(d.steps-d.window-5)*.5+.45*d.window*Math.sin(phase),index=start+d.window*u,q=orbitPoint(body,index),t=orbitTangent(body,index),length=Math.hypot(t[0],t[1],t[2])||1,T0=t[0]/length,T1=t[1]/length,T2=t[2]/length,env=Math.sin(Math.PI*u)**.65;let N,B,torTwist=0,th0=0,th1=0,th2=0;if(body.bishop){const bi=Math.max(0,Math.min(body.orbit.length-2,Math.floor(index))),bt=Math.max(0,Math.min(1,index-bi)),U0=body.bishop.U[bi],U1=body.bishop.U[bi+1],ux=U0[0]+(U1[0]-U0[0])*bt,uy=U0[1]+(U1[1]-U0[1])*bt,uz=U0[2]+(U1[2]-U0[2])*bt,tDot=ux*T0+uy*T1+uz*T2;let nx=ux-tDot*T0,ny=uy-tDot*T1,nz=uz-tDot*T2;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;N=[nx,ny,nz];B=[T1*nz-T2*ny,T2*nx-T0*nz,T0*ny-T1*nx];const si=Math.max(0,Math.min(body.orbit.length-2,Math.floor(start))),st=Math.max(0,Math.min(1,start-si)),startTor=body.bishop.torsion[si]+(body.bishop.torsion[si+1]-body.bishop.torsion[si])*st;torTwist=.22*(body.bishop.torsion[bi]+(body.bishop.torsion[bi+1]-body.bishop.torsion[bi])*bt-startTor);const thA=body.bishop.thomas[bi],thB=body.bishop.thomas[bi+1];th0=thA[0]+(thB[0]-thA[0])*bt;th1=thA[1]+(thB[1]-thA[1])*bt;th2=thA[2]+(thB[2]-thA[2])*bt;}else{const screen=Math.hypot(T0,T1)||1;N=[-T1/screen,T0/screen,0];B=[-T2*N[1],T2*N[0],T0*N[1]-T1*N[0]];}const hol=Math.PI*u+TAU*PHI_INV*u*(1-u)*Math.sin(phase),baseWidth=(.016+.08*env)*(.68+.32/(1+length*20)),sp={cx:q[0]+.012*env*th0,cy:q[1]+.012*env*th1,cz:q[2]+.010*env*th2,N,B,env,baseWidth,twist:.28*Math.sin(phase)-TAU*1.3*u+torTwist+.18*Math.sin(hol)};cache.map.set(u,sp);return sp;}
function lorenzBasis(body,k,u,phase){const sp=lorenzSpine(body,u,phase),laneScale=.3+.7*k/Math.max(1,body.lanes.length-1);return {family:'lorenz',cx:sp.cx,cy:sp.cy,cz:sp.cz,width:sp.baseWidth*laneScale,N:sp.N,B:sp.B,env:sp.env,frequency:body.record.folds,twist:sp.twist,warp:phase-body.lanes[k].offset,a:null,b:null,duSpan:0};}
function ownerAt(body,k,u){const comp=body.territoriesByComponent?.[k];if(comp){if(comp.length===1)return comp[0].owner;for(let i=0;i<comp.length;i++){const p=comp[i];if(u>=p.u[0]&&(u<p.u[1]||u===1&&p.u[1]===1))return p.owner;}return comp[comp.length-1].owner;}return body.territories.find(p=>p.component===k&&u>=p.u[0]&&(u<p.u[1]||u===1&&p.u[1]===1)).owner;}
// Localized rolled sheet charts. Each broad membrane passes through a
// compact elliptical scroll near its own authored-seed pocket position, then
// unrolls into a pleated fading fringe. The chart genuinely loops in x/y.
function computeBasis(body,k,u,phase){if(body.record.mechanism==='lorenz-flow')return lorenzBasis(body,k,u,phase);const r=body.record,l=body.lanes[k],p=phase%TAU,t=l.start+(l.end-l.start)*u,env=Math.sin(Math.PI*u)**.85,wave=Math.sin(p-TAU*t*l.lag+l.offset),holonomy=Math.PI*u+TAU*PHI_INV*u*(1-u)*Math.sin(p+l.offset),sHol=Math.sin(holonomy),cHol=Math.cos(holonomy),theta=TAU*(l.core?r.turns:.55+.06*r.topology.fanout)*t+l.angle+.7*wave;
 const knot=TAU*(l.core?1.35:2.2)*t+.8*Math.sin(9*t-p+l.offset),spine=.12*Math.sin(6*t-1+.7*Math.sin(p-2*t))+.11*Math.sin(knot)*env,spread=l.reach*env*(.7+.3*Math.sin(4*t+l.offset)),cx=spine+spread*Math.sin(theta)+(l.core?.055*env*Math.sin(2*knot+l.angle):0),cy=1.45*(t-.5)+(l.core?.055:.28)*env*Math.cos(knot+l.angle)+(l.core?.06:.11)*env*Math.sin(p-5*t+l.angle),cz=.13*env*Math.cos(theta)+.04*wave+.018*env*cHol;
 const width=l.width*env*(.55+.45*Math.sin(4*t+l.offset)**2)*(.85+.15*Math.sin(17*t+l.offset+.5*Math.sin(p))**2),warp=2.2*Math.sin(8*t-p+l.offset)+.7*Math.sin(19*t+l.offset+.3*Math.sin(p))+.24*sHol,angle=.65*Math.sin(theta)+.7*Math.sin(5*t-p+l.offset),pocket=.32+.3*Math.sin(l.offset)**2+.025*Math.sin(p+l.offset),roll=l.core?0:Math.exp(-(((u-pocket)/.17)**2));return {cx,cy,cz,width,warp,angle,roll,radial:.76+.12*Math.sin(3*t+l.offset),turnShift:.55*Math.sin(7*t+p+l.offset)+.18*cHol,cc:Math.cos(angle),ss:Math.sin(angle),env,frequency:r.folds*Math.PI,offset:l.offset,a:null,b:null,duSpan:0};}
function basis(body,k,u,phase){let cache=body.chartCache;if(!cache){cache=body.chartCache={phase,lanes:body.lanes.map(()=>new Map())};}else if(cache.phase!==phase){cache.phase=phase;for(let i=0;i<cache.lanes.length;i++)cache.lanes[i].clear();}const laneMap=cache.lanes[k],hit=laneMap.get(u);if(hit!==undefined)return hit;const b=computeBasis(body,k,u,phase);laneMap.set(u,b);return b;}
function basisWithNeighbors(body,k,u,phase){const ba=basis(body,k,u,phase);if(ba.a===null){const e=.00015,ua=Math.max(0,u-e),ub=Math.min(1,u+e);ba.a=computeBasis(body,k,ua,phase);ba.b=computeBasis(body,k,ub,phase);ba.duSpan=ub-ua;}return ba;}
function chartAt(b,v){if(b.family==='lorenz'){const angle=Math.PI*v+b.twist,fold=b.frequency*angle+b.warp,radius=b.width*(1+.18*Math.cos(fold)),c=Math.cos(angle),s=Math.sin(angle);return {x:b.cx+radius*(b.N[0]*c+b.B[0]*s),y:b.cy+radius*(b.N[1]*c+b.B[1]*s),z:b.cz+radius*(b.N[2]*c+b.B[2]*s),fold,angle,radius};}const fold=b.frequency*v+.35*Math.sin(Math.PI*v+b.offset)+b.warp,turn=Math.PI*1.22*(v+1)+b.turnShift,radius=b.width*(b.radial+.11*v),flatX=b.width*(v+.32*Math.sin(fold)),flatY=b.width*.025*Math.sin(fold),localX=(1-b.roll)*flatX+b.roll*radius*Math.cos(turn),localY=(1-b.roll)*flatY+b.roll*radius*.7*Math.sin(turn);return {x:b.cx+localX*b.cc-localY*b.ss,y:b.cy+localX*b.ss+localY*b.cc,z:b.cz+b.width*.7*((1-b.roll)*Math.cos(fold)+b.roll*Math.sin(turn)),fold,turn,radius};}
function transverseDerivative(ba,q,v){if(ba.family==='lorenz'){const dr=-.18*ba.width*Math.sin(q.fold)*ba.frequency*Math.PI,c=Math.cos(q.angle),s=Math.sin(q.angle),rPi=q.radius*Math.PI;return [dr*(ba.N[0]*c+ba.B[0]*s)+rPi*(-ba.N[0]*s+ba.B[0]*c),dr*(ba.N[1]*c+ba.B[1]*s)+rPi*(-ba.N[1]*s+ba.B[1]*c),dr*(ba.N[2]*c+ba.B[2]*s)+rPi*(-ba.N[2]*s+ba.B[2]*c)];}const fd=ba.frequency+.35*Math.PI*Math.cos(Math.PI*v+ba.offset),td=Math.PI*1.22,dr=ba.width*.11,dx=(1-ba.roll)*ba.width*(1+.32*Math.cos(q.fold)*fd)+ba.roll*(dr*Math.cos(q.turn)-q.radius*Math.sin(q.turn)*td),dy=(1-ba.roll)*ba.width*.025*Math.cos(q.fold)*fd+ba.roll*.7*(dr*Math.sin(q.turn)+q.radius*Math.cos(q.turn)*td);return [dx*ba.cc-dy*ba.ss,dx*ba.ss+dy*ba.cc,ba.width*.7*((1-ba.roll)*(-Math.sin(q.fold)*fd)+ba.roll*Math.cos(q.turn)*td)];}
function differentialNzFromBasis(ba,v){if(ba.family==='lorenz'){const piv=Math.PI*v,ang=piv+ba.twist,fold=ba.frequency*ang+ba.warp,rad=ba.width*(1+.18*Math.cos(fold)),c=Math.cos(ang),s=Math.sin(ang),aa=ba.a,angA=piv+aa.twist,radA=aa.width*(1+.18*Math.cos(aa.frequency*angA+aa.warp)),cA=Math.cos(angA),sA=Math.sin(angA),ax=aa.cx+radA*(aa.N[0]*cA+aa.B[0]*sA),ay=aa.cy+radA*(aa.N[1]*cA+aa.B[1]*sA),bb=ba.b,angB=piv+bb.twist,radB=bb.width*(1+.18*Math.cos(bb.frequency*angB+bb.warp)),cB=Math.cos(angB),sB=Math.sin(angB),bx=bb.cx+radB*(bb.N[0]*cB+bb.B[0]*sB),by=bb.cy+radB*(bb.N[1]*cB+bb.B[1]*sB),du0=(bx-ax)/ba.duSpan,du1=(by-ay)/ba.duSpan,dr=-.18*ba.width*Math.sin(fold)*ba.frequency*Math.PI,rPi=rad*Math.PI,dv0=dr*(ba.N[0]*c+ba.B[0]*s)+rPi*(-ba.N[0]*s+ba.B[0]*c),dv1=dr*(ba.N[1]*c+ba.B[1]*s)+rPi*(-ba.N[1]*s+ba.B[1]*c);return du0*dv1-du1*dv0;}const piv=Math.PI*v,svOff=.35*Math.sin(piv+ba.offset),tBase=Math.PI*1.22*(v+1),fold=ba.frequency*v+svOff+ba.warp,turn=tBase+ba.turnShift,rad=ba.width*(ba.radial+.11*v),aa=ba.a,fA=aa.frequency*v+svOff+aa.warp,sFA=Math.sin(fA),tA=tBase+aa.turnShift,rA=aa.width*(aa.radial+.11*v),lxA=(1-aa.roll)*aa.width*(v+.32*sFA)+aa.roll*rA*Math.cos(tA),lyA=(1-aa.roll)*aa.width*.025*sFA+aa.roll*rA*.7*Math.sin(tA),ax=aa.cx+lxA*aa.cc-lyA*aa.ss,ay=aa.cy+lxA*aa.ss+lyA*aa.cc,bb=ba.b,fB=bb.frequency*v+svOff+bb.warp,sFB=Math.sin(fB),tB=tBase+bb.turnShift,rB=bb.width*(bb.radial+.11*v),lxB=(1-bb.roll)*bb.width*(v+.32*sFB)+bb.roll*rB*Math.cos(tB),lyB=(1-bb.roll)*bb.width*.025*sFB+bb.roll*rB*.7*Math.sin(tB),bx=bb.cx+lxB*bb.cc-lyB*bb.ss,by=bb.cy+lxB*bb.ss+lyB*bb.cc,du0=(bx-ax)/ba.duSpan,du1=(by-ay)/ba.duSpan,fd=ba.frequency+.35*Math.PI*Math.cos(piv+ba.offset),td=Math.PI*1.22,dr=ba.width*.11,cF=Math.cos(fold),cT=Math.cos(turn),sT=Math.sin(turn),dx=(1-ba.roll)*ba.width*(1+.32*cF*fd)+ba.roll*(dr*cT-rad*sT*td),dy=(1-ba.roll)*ba.width*.025*cF*fd+ba.roll*.7*(dr*sT+rad*cT*td),dv0=dx*ba.cc-dy*ba.ss,dv1=dx*ba.ss+dy*ba.cc;return du0*dv1-du1*dv0;}
function differential(body,k,u,v,phase){const ba=basisWithNeighbors(body,k,u,phase),q=chartAt(ba,v),a=chartAt(ba.a,v),b=chartAt(ba.b,v),du0=(b.x-a.x)/ba.duSpan,du1=(b.y-a.y)/ba.duSpan,du2=(b.z-a.z)/ba.duSpan,dv=transverseDerivative(ba,q,v),nx=du1*dv[2]-du2*dv[1],ny=du2*dv[0]-du0*dv[2],nz=du0*dv[1]-du1*dv[0],norm=Math.hypot(nx,ny,nz)||1,ref=Math.max(.00001,ba.width*(body.lanes[k].end-body.lanes[k].start)*1.45),compression=Math.min(8,1/(.12+Math.abs(nz)/ref));return {q,ba,nx,ny,nz,norm,compression};}
function point(body,k,u,v,phase,bounds=false){if(bounds){const b=computeBasis(body,k,u,phase);if(b.family==='lorenz'){const e=1.18*b.width;return {cx:b.cx,cy:b.cy,cz:b.cz,ex:e,ey:e,ez:e};}const ex=(1-b.roll)*1.32*b.width*Math.abs(b.cc)+b.roll*b.width*Math.sqrt(b.cc*b.cc+.7*.7*b.ss*b.ss),ey=(1-b.roll)*b.width*(1.32*Math.abs(b.ss)+.025)+b.roll*b.width*Math.sqrt(b.ss*b.ss+.7*.7*b.cc*b.cc);return {cx:b.cx,cy:b.cy,cz:b.cz,ex,ey,ez:b.width*.7};}const d=differential(body,k,u,v,phase);return {x:d.q.x,y:d.q.y,z:d.q.z,alpha:d.ba.env*(body.lanes[k].core?.16+.04*d.compression:.045+.047*d.compression)*(body.record.mechanism==='lorenz-flow'?(body.lanes[k].core?1:.38/(1+.18*(k-2))):1),compression:d.compression,nx:d.nx/d.norm,ny:d.ny/d.norm,nz:d.nz/d.norm,owner:ownerAt(body,k,u)};}
// Caustics are the actual signed projected-Jacobian zero sets of this chart.
// Root births/deaths split contours; nearest-root continuation avoids a fake
// fixed set of ellipse outlines when sheets curl and flatten locally.
function caustics(body,k,phase,fast=false){const result=[],active=[],isLorenz=body.record.mechanism==='lorenz-flow',rows=fast?(isLorenz?160:72):(isLorenz?480:144),cols=fast?(isLorenz?16:24):(isLorenz?20:40),iters=fast?2:5,l=body.lanes[k],spanL=(l.end-l.start)*1.45,ownList=body.territoriesByComponent?.[k];for(let j=1;j<rows;j++){const u=j/rows,ba=basisWithNeighbors(body,k,u,phase),roots=[];let va=-1,fa=differentialNzFromBasis(ba,va);for(let c=1;c<=cols;c++){const vb=-1+2*c/cols,fb=differentialNzFromBasis(ba,vb);if(fa*fb<0){let lo=va,hi=vb,flo=fa,fhi=fb;for(let z=0;z<iters;z++){const mid=(lo+hi)/2,fm=differentialNzFromBasis(ba,mid);if(flo*fm<=0){hi=mid;fhi=fm;}else{lo=mid;flo=fm;}}roots.push(fast?(lo*fhi-hi*flo)/(fhi-flo||1):(lo+hi)/2);}va=vb;fa=fb;}
 if(l.core){roots.sort((a,b)=>Math.abs(a)-Math.abs(b));roots.splice(2);roots.sort((a,b)=>a-b);}const used=new Set(),next=[],taper=Math.sin(Math.PI*u)**.8,own=ownList&&ownList.length===1?ownList[0].owner:ownerAt(body,k,u),ref=Math.max(.00001,ba.width*spanL),baseScale=l.core?(k<3?.88:.4):(isLorenz?.13/(1+.25*(k-2)):.72);for(const v of roots){let best=-1,distance=isLorenz?.09*(fast?2.5:1):.18*(fast?1.6:1);for(let a=0;a<active.length;a++){const dist=Math.abs(active[a].v-v);if(!used.has(a)&&dist<distance){distance=dist;best=a;}}const trace=best<0?{line:[],v}:active[best];if(best>=0)used.add(best);trace.v=v;if(fast){const q=chartAt(ba,v),nz=differentialNzFromBasis(ba,v),comp=Math.min(8,1/(.12+Math.abs(nz)/ref));trace.line.push({x:q.x,y:q.y,z:q.z,alpha:baseScale*Math.sqrt(comp/8)*taper,compression:comp,owner:own});}else{const q=point(body,k,u,v,phase);q.alpha=baseScale*Math.sqrt(q.compression/8)*taper;trace.line.push(q);}next.push(trace);}for(let a=0;a<active.length;a++)if(!used.has(a)&&active[a].line.length>2)result.push({line:active[a].line,material:l.core?'braid':'fold'});active.splice(0,active.length,...next);}for(const trace of active)if(trace.line.length>2)result.push({line:trace.line,material:l.core?'braid':'fold'});return result;}
function normalizeExecution(body,exec){if(!exec||typeof exec!=='object')return null;const n=body.nodes.length,cl=(v,lo,hi)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;let activeOwner=Number.isInteger(exec.activeOwner)&&exec.activeOwner>=0&&exec.activeOwner<n?exec.activeOwner:-1;if(activeOwner<0&&typeof exec.activeNodeId==='string')activeOwner=body.nodes.findIndex(nd=>nd.id===exec.activeNodeId);const weights=new Float32Array(n);if(Array.isArray(exec.nodeWeights)||ArrayBuffer.isView(exec.nodeWeights)){for(let i=0;i<n;i++)weights[i]=cl(exec.nodeWeights[i],0,1);}if(activeOwner>=0&&weights[activeOwner]<1)weights[activeOwner]=1;const stackRatio=cl(exec.stackRatio??(Number.isFinite(exec.recursionDepth)?exec.recursionDepth/8:0),0,1),fuelRatio=cl(exec.fuelRatio??1,0,1),progress=cl(exec.progress??0,0,1),stepFraction=cl(exec.stepFraction??0,0,1),registerLoad=cl(exec.registerLoad??0,0,1),outcome=exec.outcome==='Done'||exec.outcome==='Rejected'||exec.outcome==='Exhausted'?exec.outcome:'Running',fault=outcome==='Rejected'||outcome==='Exhausted'?1:0,done=outcome==='Done'?1:0;return {activeOwner,weights,stackRatio,fuelRatio,progress,stepFraction,registerLoad,outcome,fault,done};}
function stepResponse(body,phase,execution,reuse){check(body&&Array.isArray(body.nodes),'compiled body required');bounded(phase,-1e12,1e12);const n=body.nodes.length,p=phase%TAU,ex=normalizeExecution(body,execution)||{activeOwner:-1,weights:new Float32Array(n),stackRatio:0,fuelRatio:1,progress:0,stepFraction:0,registerLoad:0,outcome:'Running',fault:0,done:0},ownerGain=reuse?.ownerGain?.length===n?reuse.ownerGain:new Float32Array(n),ownerShift=reuse?.ownerShift?.length===n?reuse.ownerShift:new Float32Array(n),ownerFlare=reuse?.ownerFlare?.length===n?reuse.ownerFlare:new Float32Array(n);if(reuse){reuse.ownerGain=ownerGain;reuse.ownerShift=ownerShift;reuse.ownerFlare=ownerFlare;}const solitonU=((phase/TAU+ex.progress+ex.stepFraction/Math.max(1,n))%1+1)%1;for(let i=0;i<n;i++){const patch=body.territoryByOwner[i]||body.territories[i%body.territories.length],uMid=(patch.u[0]+patch.u[1])/2,chord=Math.sin(Math.PI*(uMid-solitonU))/(.11*Math.PI),sech=1/Math.cosh(chord),w=ex.weights[i]||0,tremor=ex.outcome==='Rejected'?Math.sin(2*p+i*PHI_INV*TAU)*.032:ex.outcome==='Exhausted'?Math.cos(p+i*PHI_INV*TAU)*.022:0;ownerGain[i]=Math.min(2.2,1+.65*w+.25*sech*sech+.18*ex.done);ownerShift[i]=.024*w+.012*sech*sech+.014*ex.stackRatio*Math.sin(TAU*uMid+p)+tremor*.45;ownerFlare[i]=Math.min(1,w+.35*sech*sech);}const effPhase=phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*p)+.04*ex.done*Math.sin(p),globalScale=1+.05*ex.stackRatio+.025*ex.registerLoad,shearTremor=ex.outcome==='Rejected'?.018+.010*Math.sin(2*p):ex.outcome==='Exhausted'?.012+.007*Math.cos(p):0,strangeLoopBoost=Math.min(1,.35+.45*ex.progress+.20*ex.done+.25*(ex.activeOwner>=0?1:0));return {effPhase,ownerGain,ownerShift,ownerFlare,globalScale,shearTremor,solitonU,strangeLoopBoost,outcome:ex.outcome,activeOwner:ex.activeOwner};}
function applyExecutionToResult(body,res,phase,execution){if(!execution)return res;const sr=stepResponse(body,phase,execution,body._stepReuse||(body._stepReuse={})),p=phase%TAU,pts=res.points,owns=res.owners,count=owns.length,b=portraitFrame(body),maxX=b.width/2-.002,maxY=b.height/2-.002,maxZ=b.depth/2-.002,cl=(v,c,m)=>Math.max(c-m,Math.min(c+m,v));for(let i=0;i<count;i++){const own=owns[i],p4=i*4,gain=sr.ownerGain[own]||1,shift=sr.ownerShift[own]||0,px=pts[p4],py=pts[p4+1],wave=2*p+own*PHI_INV*TAU,tremX=sr.shearTremor*Math.sin(wave+2.4*py),tremY=-sr.shearTremor*.7*Math.cos(wave+2.4*px);pts[p4]=cl(px*sr.globalScale+tremX,b.cx,maxX);pts[p4+1]=cl(py*sr.globalScale+tremY,b.cy,maxY);pts[p4+2]=cl(pts[p4+2]+shift,b.cz,maxZ);pts[p4+3]=Math.max(0,Math.min(1,pts[p4+3]*gain));}for(const r of res.ridges)for(let j=0;j<r.line.length;j++){const pt=r.line[j],own=pt.owner??0,wave=2*p+own*PHI_INV*TAU,tremX=sr.shearTremor*Math.sin(wave+2.4*pt.y),tremY=-sr.shearTremor*.7*Math.cos(wave+2.4*pt.x);pt.x=cl(pt.x*sr.globalScale+tremX,b.cx,maxX);pt.y=cl(pt.y*sr.globalScale+tremY,b.cy,maxY);pt.z=cl(pt.z+(sr.ownerShift[own]||0)*.8,b.cz,maxZ);pt.alpha=Math.max(0,Math.min(1,pt.alpha*(sr.ownerGain[own]||1)));}return res;}
function frame(body,phase,{budget=22000,crests=true,reuse,execution}={}){if(body.record?.chimera&&body.chimeraCompiled)return combine(body.chimeraCompiled.parentA,body.chimeraCompiled.parentB,body.record.chimera,phase,{budget,crests,reuse,execution});if(body.familyAdapter)return Families.frame(body,phase,{budget,crests,reuse,execution});const ex=normalizeExecution(body,execution),p=phase%TAU,effPhase=ex?phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*p)+.04*ex.done*Math.sin(p):phase;if(body.julia)return applyExecutionToResult(body,juliaFrame(body,effPhase,{budget,crests,reuse}),phase,execution);if(body.recursive)return applyExecutionToResult(body,recursiveFrame(body,effPhase,{budget,crests,reuse}),phase,execution);if(body.cloud)return applyExecutionToResult(body,cliffordFrame(body,effPhase,{budget,crests,reuse}),phase,execution);bounded(phase,-1e12,1e12);bounded(budget,128,100000);budget=Math.floor(budget);const r=body.record,points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget);if(reuse){reuse.points=points;reuse.owners=owners;}
 // Sampling follows surface area rather than equal component counts. Core
 // curves already have continuous crests: most marks resolve wide membranes.
 const weights=body.lanes.map(l=>l.core?.004:l.width*(l.end-l.start)),sum=weights.reduce((a,b)=>a+b,0),counts=weights.map(w=>Math.floor(budget*w/sum));for(let i=counts.reduce((a,b)=>a+b,0);i<budget;i++)counts[i%body.lanes.length]++;let index=0;
 const isLorenz=r.mechanism==='lorenz-flow';
 for(let k=0;k<r.strands;k++){const l=body.lanes[k],count=counts[k],cols=l.core?2:Math.min(36,Math.max(24,Math.floor(Math.sqrt(count)))),rows=Math.max(1,Math.ceil(count/cols)),spanL=(l.end-l.start)*1.45,lorScale=isLorenz?(l.core?1:.38/(1+.18*(k-2))):1;let lastRow=-1,ba=null,own=0,ref=1;for(let j=0;j<count;j++){const row=Math.floor(j/cols),col=j%cols,v=2*(col+.5)/cols-1;if(row!==lastRow){lastRow=row;const u=(row+.5)/rows;ba=basisWithNeighbors(body,k,u,effPhase);own=ownerAt(body,k,u);ref=Math.max(.00001,ba.width*spanL);}const q=chartAt(ba,v),nz=differentialNzFromBasis(ba,v),comp=Math.min(8,1/(.12+Math.abs(nz)/ref)),alpha=ba.env*(l.core?.16+.04*comp:.045+.047*comp)*lorScale,p4=index*4;points[p4]=q.x;points[p4+1]=q.y;points[p4+2]=q.z;points[p4+3]=alpha;owners[index++]=own;}}
 const ridges=[],fast=Boolean(reuse);if(crests)for(let k=0;k<r.strands;k++)ridges.push(...caustics(body,k,effPhase,fast));if(isLorenz)for(const r of ridges)for(let j=0;j<r.line.length;j++)r.line[j].alpha*=Math.min(1,j/3,(r.line.length-1-j)/3);return applyExecutionToResult(body,{points,owners,ridges},phase,execution);}
function anchor(body,nodeId,phase,execution){if(body.familyAdapter)return Families.anchor(body,nodeId,phase,execution);const p=body.territoryByNode?body.territoryByNode.get(nodeId):body.territories.find(t=>t.node===nodeId);check(p,'unknown operation');const ex=normalizeExecution(body,execution),ph=phase%TAU,effPhase=ex?phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*ph)+.04*ex.done*Math.sin(ph):phase;let q;if(body.julia){const mark=body.julia.ownerMarks?.[p.owner]||body.julia.marks.find(m=>juliaOwner(body,m.index)===p.owner);q={...juliaWarp(body,mark.x,mark.y,effPhase),owner:p.owner};}else if(body.recursive){const k=Math.max(0,body.branches.findIndex(b=>b.component===p.component));q=recursivePoint(body,k,(p.u[0]+p.u[1])/2,0,effPhase);}else if(body.cloud){const u=(p.u[0]+p.u[1])/2,index=Math.min(body.cloud.length-1,Math.floor(u*body.cloud.length/body.record.strands)*body.record.strands+p.component),c=body.cloud[index];q={...mapWarp(body,c[0],c[1],effPhase),owner:p.owner};}else q=point(body,p.component,(p.u[0]+p.u[1])/2,0,effPhase);if(ex){const w=ex.weights[p.owner]||0;q.z+=.024*w;q.alpha=Math.min(1,q.alpha*(1+.65*w+.18*ex.done));}return q;}
// Strange-Loop Ouroboros Quine Feedback Filament (quote -> run -> apply).
// Connects the terminal emission territory back to the initial constructor root
// along a Möbius half-twisted trefoil arc with traveling KdV soliton pulses.
function strangeLoop(body,phase,{samples=96,execution}={}){check(body&&Array.isArray(body.nodes)&&body.nodes.length>0,'compiled body required');bounded(phase,-1e12,1e12);bounded(samples,16,512);samples=Math.floor(samples);const n=body.nodes.length,b=portraitFrame(body),ex=normalizeExecution(body,execution),ph=phase%TAU,effPhase=ex?phase+.25*ex.progress*TAU+.06*(1-ex.fuelRatio)*Math.sin(2*ph)+.04*ex.done*Math.sin(ph):phase,ep=effPhase%TAU,rootNode=body.nodes[0].id,termNode=body.nodes[n-1].id,midNode=body.nodes[Math.floor((n-1)/2)].id,pRoot=anchor(body,rootNode,phase,execution),pMid=anchor(body,midNode,phase,execution),pTerm=anchor(body,termNode,phase,execution),rx=Math.min(.28*b.width,.24),ry=Math.min(.28*b.height,.24),rz=Math.min(.24*b.depth,.06),maxX=b.width/2-.01,maxY=b.height/2-.01,maxZ=b.depth/2-.01,cl=(v,c,m)=>Math.max(c-m,Math.min(c+m,v)),line=new Array(samples+1),pulses=[((effPhase/TAU)%1+1)%1,((effPhase/TAU+1/3)%1+1)%1,((effPhase/TAU+2/3)%1+1)%1],stages=['quote','run','apply'];
 for(let i=0;i<=samples;i++){const s=i/samples,u5=smoothstep5(s),theta=TAU*s,mobius=Math.PI*s+.5*Math.sin(ep),w1=Math.sin(Math.PI*s)**2,bx=pTerm.x*(1-u5)+pRoot.x*u5+w1*(pMid.x-(pTerm.x+pRoot.x)/2),by=pTerm.y*(1-u5)+pRoot.y*u5+w1*(pMid.y-(pTerm.y+pRoot.y)/2),bz=pTerm.z*(1-u5)+pRoot.z*u5+w1*(pMid.z-(pTerm.z+pRoot.z)/2),trefoilX=rx*(.38*Math.sin(theta)+.22*Math.sin(2*theta-ep))*w1,trefoilY=ry*(.38*Math.cos(theta)-.22*Math.cos(2*theta-ep))*w1,trefoilZ=rz*(.55*Math.sin(3*theta+ep)+.35*Math.cos(Math.PI*s+ep))*w1;let solComp=1;for(let m=0;m<3;m++){const chord=Math.sin(Math.PI*(s-pulses[m]))/(.07*Math.PI),sh=1/Math.cosh(chord);solComp*=1-sh*sh;}const sol=1-solComp,own=Math.min(n-1,Math.floor(s*n)),sScaled=s*(n-1),idx0=Math.min(n-1,Math.floor(sScaled)),idx1=Math.min(n-1,idx0+1),frac=smoothstep5(sScaled-idx0),exW=ex?(ex.weights[idx0]||0)*(1-frac)+(ex.weights[idx1]||0)*frac:0,x=cl(bx+trefoilX,b.cx,maxX),y=cl(by+trefoilY,b.cy,maxY),z=cl(bz+trefoilZ,b.cz,maxZ),alpha=Math.min(1,(.18+.52*sol+.22*exW)*(.35+.65*w1));line[i]={x,y,z,alpha,owner:own,stage:stages[Math.min(2,Math.floor(s*3))],holonomy:mobius,soliton:sol};}
 return {material:'strange-loop-ouroboros',rootNode,midNode,termNode,holonomyTwist:Math.PI,pulses,line};}
// Chimeric / Symbiogenetic Combinations (compose, mate, merge, symbiote, body).
function smoothstep5(t){const x=Math.max(0,Math.min(1,t));return x*x*x*(10+x*(-15+6*x));}
function validateChimera(c,strands,graph){check(c&&typeof c==='object'&&!Array.isArray(c),'chimera descriptor required');keys(c,['mode','parentMechanisms','blend','coupling','seamRange','donorComponents']);check(['compose','mate','merge','symbiote','body'].includes(c.mode),'invalid chimera mode');check(Array.isArray(c.parentMechanisms)&&c.parentMechanisms.length===2&&c.parentMechanisms.every(m=>['pleated-braid','lorenz-flow','clifford-flow','recursive-affine','recursive-julia',...ADAPTERS].includes(m)),'two valid parent mechanisms required');bounded(c.blend,0,1);bounded(c.coupling,0,.45);check(Array.isArray(c.seamRange)&&c.seamRange.length===2&&c.seamRange[0]>=0&&c.seamRange[1]<=1&&c.seamRange[0]<c.seamRange[1],'valid seamRange [u0,u1] required');check(Array.isArray(c.donorComponents)&&c.donorComponents.every(k=>Number.isInteger(k)&&k>=0&&k<strands),'valid donorComponents required');return true;}
function invariantSignal(body,u,phase){const p=phase%TAU,uc=Math.max(0,Math.min(1,u));if(body.orbit){const sp=lorenzSpine(body,uc,phase);return [Math.tanh(sp.cx*1.8),Math.tanh(sp.cy*1.8),Math.tanh(sp.twist*.25)];}if(body.cloud){const marks=body.ownerPatchMarks||body.marks,len=marks.length,sc=uc*(len-1),i0=Math.min(len-1,Math.floor(sc)),i1=Math.min(len-1,i0+1),t=smoothstep5(sc-i0),m0=marks[i0],m1=marks[i1],w0=mapWarp(body,m0.x,m0.y,p),w1=mapWarp(body,m1.x,m1.y,p);return [Math.tanh(((1-t)*w0.x+t*w1.x)*1.4),Math.tanh(((1-t)*w0.y+t*w1.y)*1.4),Math.tanh(body.lyapunovEstimate)*(.85+.15*Math.sin(TAU*uc+p))];}if(body.julia){const marks=body.julia.ownerMarks?.filter(Boolean)||body.julia.marks,len=marks.length,sc=uc*(len-1),i0=Math.min(len-1,Math.floor(sc)),i1=Math.min(len-1,i0+1),t=smoothstep5(sc-i0),m0=marks[i0]||body.julia.marks[0],m1=marks[i1]||m0,ca=(1-t)*(m0.cosArg||0)+t*(m1.cosArg||0),sa=(1-t)*(m0.sinArg||0)+t*(m1.sinArg||0),val=(1-t)*(m0.value||1)+t*(m1.value||1),cp=Math.cos(p),sp=Math.sin(p);return [ca*cp-sa*sp,sa*cp+ca*sp,Math.tanh(val/24)*(.85+.15*Math.cos(TAU*uc-p))];}if(body.recursive){const poses=recursivePose(body,phase),len=poses.length,sc=uc*(len-1),i0=Math.min(len-1,Math.floor(sc)),i1=Math.min(len-1,i0+1),t=smoothstep5(sc-i0),p0=poses[i0],p1=poses[i1];return [(1-t)*p0.cos+t*p1.cos,(1-t)*p0.sin+t*p1.sin,Math.tanh(((1-t)*p0.length+t*p1.length)*2)*(.85+.15*Math.sin(TAU*uc+p))];}return [Math.cos(TAU*uc+p),Math.sin(TAU*uc-p),Math.sin(Math.PI*uc)*(.85+.15*Math.cos(p))];}
function authorCombination(parentA,parentB,recipe={},seed=42){const recA=parentA.record||parentA,recB=parentB.record||parentB,mode=['compose','mate','merge','symbiote','body'].includes(recipe.mode)?recipe.mode:'compose',graph=recipe.graph||(parentA.nodes&&parentB.nodes?{nodes:[...parentA.nodes.map(n=>({id:'p0_'+n.id,op:n.op,inputs:(n.inputs||[]).map(x=>'p0_'+x)})),...parentB.nodes.map(n=>({id:'p1_'+n.id,op:n.op,inputs:(n.inputs||[]).map(x=>'p1_'+x)}))]}:{nodes:parentA.nodes||[{id:'n0',op:'literal',inputs:[]}]}),base=author(graph,seed),blend=Number.isFinite(recipe.blend)?Math.max(0,Math.min(1,recipe.blend)):mode==='body'?.5:mode==='symbiote'?.38:.45,coupling=Number.isFinite(recipe.coupling)?Math.max(0,Math.min(.45,recipe.coupling)):mode==='symbiote'?.28:.16,seamCenter=Number.isFinite(recipe.seamCenter)?Math.max(.18,Math.min(.82,recipe.seamCenter)):.5,seamHalf=.14,donorComponents=[];for(let k=0;k<base.strands;k++)if(mode==='merge'?k%2===0:k<Math.ceil(base.strands*blend))donorComponents.push(k);base.chimera={mode,parentMechanisms:[recA.mechanism,recB.mechanism],blend:Number(blend.toFixed(4)),coupling:Number(coupling.toFixed(4)),seamRange:[Number((seamCenter-seamHalf).toFixed(4)),Number((seamCenter+seamHalf).toFixed(4))],donorComponents};return base;}
function combine(parentBodyA,parentBodyB,recipe={},phase=0,{budget=6500,crests=true,reuse,execution}={}){check(parentBodyA&&parentBodyB,'two compiled parent bodies required');bounded(phase,-1e12,1e12);bounded(budget,128,100000);budget=Math.floor(budget);const p=phase%TAU,mode=recipe.mode||'compose',blend=Number.isFinite(recipe.blend)?Math.max(0,Math.min(1,recipe.blend)):.45,coupling=Number.isFinite(recipe.coupling)?Math.max(0,Math.min(.45,recipe.coupling)):.18,[s0,s1]=Array.isArray(recipe.seamRange)&&recipe.seamRange.length===2?recipe.seamRange:[.36,.64],sigA=invariantSignal(parentBodyA,.5,phase),sigB=invariantSignal(parentBodyB,.5,phase),phaseA=phase+coupling*sigB[2]*Math.PI,phaseB=phase+coupling*sigA[2]*Math.PI,frameA=frame(parentBodyA,phaseA,{budget,crests,execution}),frameB=frame(parentBodyB,phaseB,{budget,crests,execution}),bA=portraitFrame(parentBodyA),bB=portraitFrame(parentBodyB),points=reuse?.points?.length===budget*4?reuse.points:new Float32Array(budget*4),owners=reuse?.owners?.length===budget?reuse.owners:new Uint16Array(budget),nA=parentBodyA.nodes.length,nB=parentBodyB.nodes.length;if(reuse){reuse.points=points;reuse.owners=owners;}
 for(let i=0;i<budget;i++){const u=i/budget,envU=Math.sin(Math.PI*u)**2,p4=i*4,ax=(frameA.points[p4]-bA.cx)/(bA.width/2||1),ay=(frameA.points[p4+1]-bA.cy)/(bA.height/2||1),az=(frameA.points[p4+2]-bA.cz)/(bA.depth/2||1),aa=frameA.points[p4+3],bx=(frameB.points[p4]-bB.cx)/(bB.width/2||1),by=(frameB.points[p4+1]-bB.cy)/(bB.height/2||1),bz=(frameB.points[p4+2]-bB.cz)/(bB.depth/2||1),ba=frameB.points[p4+3];let w;if(mode==='compose'||mode==='mate'){w=smoothstep5((u-s0)/Math.max(1e-4,s1-s0));if(mode==='mate')w=.5*(w+smoothstep5(.5+.5*Math.sin(2*TAU*u+p)));}else if(mode==='merge'){const baseW=(i%2===0)?.25+.5*blend:.75-.5*(1-blend);w=smoothstep5(Math.max(0,Math.min(1,baseW+.08*Math.sin(TAU*u-p))));}else if(mode==='symbiote'){const mod=coupling*envU*(sigA[0]*Math.cos(TAU*u+p)+sigA[1]*Math.sin(TAU*u-p));w=smoothstep5(Math.max(0,Math.min(1,blend+.22*Math.sin(TAU*u+p))));points[p4]=((1-w)*ax+w*(bx+mod))*(bA.width*.25+bB.width*.25);points[p4+1]=((1-w)*ay+w*(by-mod))*(bA.height*.25+bB.height*.25);points[p4+2]=((1-w)*az+w*bz+.12*coupling*envU*Math.sin(2*TAU*u+p))*(bA.depth*.25+bB.depth*.25);points[p4+3]=Math.max(0,Math.min(1,(1-w)*aa+w*ba));owners[i]=w<.5?frameA.owners[i]%nA:frameB.owners[i]%nB;continue;}else{w=blend;}const halfW=.25*(bA.width+bB.width),halfH=.25*(bA.height+bB.height),halfD=.25*(bA.depth+bB.depth),bridge=4*w*(1-w)*coupling*envU;points[p4]=((1-w)*ax+w*bx+bridge*sigA[0]*Math.sin(TAU*u+p))*halfW;points[p4+1]=((1-w)*ay+w*by+bridge*sigB[1]*Math.cos(TAU*u-p))*halfH;points[p4+2]=((1-w)*az+w*bz+bridge*Math.sin(2*TAU*u+p))*halfD;points[p4+3]=Math.max(0,Math.min(1,(1-w)*aa+w*ba));owners[i]=w<.5?frameA.owners[i]%nA:frameB.owners[i]%nB;}
 const ridges=[];if(crests){const takeA=Math.max(1,Math.round(frameA.ridges.length*(1-blend*.5))),takeB=Math.max(1,Math.round(frameB.ridges.length*(.5+blend*.5)));for(let i=0;i<Math.min(takeA,frameA.ridges.length);i++)ridges.push(frameA.ridges[i]);for(let i=0;i<Math.min(takeB,frameB.ridges.length);i++)ridges.push(frameB.ridges[i]);const pA=anchor(parentBodyA,parentBodyA.nodes[nA-1].id,phaseA,execution),pB=anchor(parentBodyB,parentBodyB.nodes[0].id,phaseB,execution),seamLine=new Array(49);for(let j=0;j<=48;j++){const s=j/48,w=smoothstep5(s),envC2=4*w*(1-w),arc=envC2*coupling*.18;seamLine[j]={x:(1-w)*pA.x+w*pB.x+arc*Math.cos(TAU*s+p),y:(1-w)*pA.y+w*pB.y+arc*Math.sin(TAU*s-p),z:(1-w)*pA.z+w*pB.z+arc*.5*Math.sin(2*TAU*s+p),alpha:.28+.48*envC2,owner:w<.5?(nA-1):0};}ridges.push({line:seamLine,material:'chimeric-seam-bridge'});}return {points,owners,ridges,mode,parentMechanisms:[parentBodyA.record.mechanism,parentBodyB.record.mechanism]};}
// Fixed source-compiled all-cycle enclosure, independent of the current phase.
// The transverse chart is enclosed analytically by |v+.32sin(fold)| <= 1.32.
// 128 phases and 256 longitudinal intervals enclose the center charts; .14
// padding per side covers phase Lipschitz plus localized roll margin, nearest phase error .025,
// longitudinal smooth terms plus the endpoint envelope's Holder remainder.
function portraitFrame(body){if(body?.familyAdapter)return Families.portraitFrame(body);if(body?.julia)return juliaBounds(body);if(body?.recursive)return recursiveBounds(body);if(body?.cloud){const e=embedding(body);return {cx:0,cy:0,cz:0,width:2*(body.mapBounds.bx*e.scale[0]+Math.abs(e.shear)*body.mapBounds.by+e.warp[0]+e.overtone[0]+.01),height:2*(body.mapBounds.by*e.scale[1]+e.warp[1]+e.overtone[1]+.01),depth:.2};}if(body?.orbit){if(body.bounds)return body.bounds;const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(const q of body.orbit)q.forEach((x,i)=>{lo[i]=Math.min(lo[i],x);hi[i]=Math.max(hi[i],x);});const pad=.15;return body.bounds={cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0]+2*pad,height:hi[1]-lo[1]+2*pad,depth:hi[2]-lo[2]+2*pad};}if(!body)return {cx:0,cy:0,cz:0,width:2,height:3,depth:.8};if(body.bounds)return body.bounds;const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let h=0;h<128;h++){const phase=TAU*h/128;for(let k=0;k<body.lanes.length;k++)for(let j=0;j<=256;j++){const q=point(body,k,j/256,0,phase,true);lo[0]=Math.min(lo[0],q.cx-q.ex);hi[0]=Math.max(hi[0],q.cx+q.ex);lo[1]=Math.min(lo[1],q.cy-q.ey);hi[1]=Math.max(hi[1],q.cy+q.ey);lo[2]=Math.min(lo[2],q.cz-q.ez);hi[2]=Math.max(hi[2],q.cz+q.ez);}}const pad=.14;body.bounds={cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0]+2*pad,height:hi[1]-lo[1]+2*pad,depth:hi[2]-lo[2]+2*pad};return body.bounds;}
const api={author,validate,compile,frame,anchor,portraitFrame,topology,strangeLoop,authorCombination,validateChimera,invariantSignal,combine,normalizeExecution,stepResponse};if(typeof module!=='undefined')module.exports=api;root.WovenBody=api;
})(typeof globalThis!=='undefined'?globalThis:this);


// --- visual-capsule.js ---
(function(root){
'use strict';
const node=typeof module!=='undefined'&&module.exports,Q=node?require('./core.js'):root.Quinelings,V=node?require('./qdl-v1.js'):root.QDLV1,D=node?require('./qdl.js'):root.QDL,W=node?require('./woven-body.js'):root.WovenBody;
const clone=x=>JSON.parse(JSON.stringify(x));
function validateDesign(design,graph){const base=clone(design);delete base.woven;D.validateBindings(base,graph);if(!design.woven||design.anatomy)throw Error('Visual capsule requires only its experimental body');W.validate(design.woven,graph);return true;}
function task(source){const program=JSON.parse(source);if(Q.canon(program)!==source)throw Error('Task source must be canonical');if(V.isProgram(program)){const a=V.admit(source);return {program,graph:a.payload.task,stable:true};}const shape=Q.describe(program);if(Q.canon(Q.makeTaskProgram(shape.graph,shape.repeats,shape.design))!==source)throw Error('Task is not an admitted constructor');return {program,graph:shape.graph,stable:false};}
function build(taskSource,design){const payload={format:'quineling-visual-capsule',profile:'woven-experimental',taskSource,design};return admit(Q.canon(Q.makePayloadProgram(payload,1)));}
function author(taskSource,seed=1){const t=task(taskSource),design=D.fromGraph?D.fromGraph(t.graph,seed):D.create();Object.assign(design.composition,{yaw:0,pitch:0,lean:0});design.woven=W.author(t.graph,seed);return build(taskSource,design);}
function admit(source){if(typeof source!=='string'||new TextEncoder().encode(source).length>65536)throw Error('Visual capsule must be canonical source up to 64 KiB');const program=JSON.parse(source);let payload;function visit(t){if(!Array.isArray(t)||t[0]==='quote')return;if(t[0]==='run'&&t[1]?.[0]==='quote'){visit(t[1][1]);return;}if(t[0]==='task'&&t[1]?.[0]==='quote')payload=t[1][1];else for(const x of t.slice(1))visit(x);}visit(program);if(!payload||payload.format!=='quineling-visual-capsule'||payload.profile!=='woven-experimental'||Object.keys(payload).sort().join(',')!=='design,format,profile,taskSource')throw Error('Unsupported visual capsule');const t=task(payload.taskSource);validateDesign(payload.design,t.graph);if(Q.canon(Q.makePayloadProgram(payload,1))!==source)throw Error('Visual capsule constructor does not match its source');return {source,program:clone(program),taskSource:payload.taskSource,task:t.graph,stable:t.stable,design:clone(payload.design)};}
function verify(capsule){const a=admit(capsule.source),copy=Q.execute(a.program,{constructionOnly:true});if(copy.emitted[0]!==a.source)throw Error('Visual constructor emission differs');return {exactSource:true,source:copy.emitted[0],constructorSteps:copy.steps};}
function recover(capsule,encoding){const decoded=encoding==='harmonics'?Q.decode(Q.encode(capsule.program)):encoding==='colors'?Q.decodeColors(Q.encodeColors(capsule.program)):null;if(!decoded)throw Error('Unknown genome encoding');const recovered=admit(Q.canon(decoded));if(recovered.source!==capsule.source)throw Error('Visual genome differs');return recovered;}
function isCapsule(program){try{admit(Q.canon(program));return true;}catch{return false;}}
function makeTaskProgram(graph,repeats=1,design){if(!design?.woven)return Q.makeTaskProgram(graph,repeats,design);const base=clone(design);delete base.woven;const clean=clone(graph);delete clean.design;return build(Q.canon(Q.makeTaskProgram(clean,repeats,base)),design).program;}
function describe(program){if(!isCapsule(program))return Q.describe(program);const a=admit(Q.canon(program)),s=Q.describe(JSON.parse(a.taskSource));return {...s,graph:{...s.graph,design:clone(a.design)},design:clone(a.design)};}
function execute(program,options){if(!isCapsule(program))return Q.execute(program,options);if(options!==undefined){if(!options||typeof options!=='object'||Array.isArray(options)||Object.getPrototypeOf(options)!==Object.prototype||Object.keys(options).some(k=>!['constructionOnly','bindings'].includes(k))||('constructionOnly'in options&&typeof options.constructionOnly!=='boolean')||(options.constructionOnly===true&&'bindings'in options))throw Error('Invalid visual execution options');if('bindings'in options&&(!options.bindings||typeof options.bindings!=='object'||Array.isArray(options.bindings)))throw Error('Invalid visual bindings');}const a=admit(Q.canon(program)),proof=verify(a);if(options?.constructionOnly)return {emitted:[proof.source],tasks:[],trace:[],steps:proof.constructorSteps};const result=Q.execute(JSON.parse(a.taskSource),options);return {...result,taskSourceEmitted:result.emitted,emitted:[proof.source],steps:(result.steps??result.constructorSteps??0)+proof.constructorSteps,taskProfile:a.stable?'qdl-v1':'legacy'};}
const api={author,build,admit,verify,recover,validateDesign,isCapsule,makeTaskProgram,describe,execute,runtime:{...Q,makeTaskProgram,describe,execute}};if(node)module.exports=api;root.VisualCapsule=api;
})(typeof globalThis!=='undefined'?globalThis:this);


export const { Quinelings, QuinelingKernels, QuinelingOrbit, QuinelingAnatomy, QDL, Chroma, Morphology, LifeformFamilies, WovenBody, VisualCapsule } = globalThis;
