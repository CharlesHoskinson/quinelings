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
 case 'weightedMean':{const v=numbers(a[0]),w=numbers(a[1]);requireThat(v.length>0&&v.length===w.length,'Weighted arrays must match');w.forEach(nonnegative);const total=w.reduce((s,x)=>s+x,0);requireThat(total>0,'Weights have zero mass');return v.reduce((s,x,i)=>s+x*w[i],0)/total;}
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
