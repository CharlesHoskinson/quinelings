(function(root){
'use strict';
const K=typeof module!=='undefined'?require('./kernels.js'):root.QuinelingKernels;
const Q=typeof module!=='undefined'?require('./core.js'):root.Quinelings;
const canon=Q.canon,clone=x=>JSON.parse(JSON.stringify(x));
const UNKNOWN=Symbol('unevaluated simulation'),badKeys=new Set(['__proto__','prototype','constructor']);
const capabilities=Object.freeze(Object.keys(K.ARITY).filter(x=>x!=='literal'));
const schema='design/intent.schema.json',B={kind:'boolean'},S={kind:'string'},Z={kind:'null'};
const num=(unit='one')=>({kind:'number',unit}),arr=element=>({kind:'array',element}),rec=fields=>({kind:'record',fields}),opt=element=>({kind:'optional',element});
function fail(code,path,message){const e=new Error(message);e.code=code;e.path=path;throw e;}
function check(ok,code,path,message){if(!ok)fail(code,path,message);}
function own(x,k){return Object.hasOwn(x,k);}
function object(x){return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function closed(x,required,optional,path){check(object(x),'schema',path,'Expected an object');for(const k of required)check(own(x,k),'missing',path+'.'+k,'Missing '+k);for(const k of Object.keys(x))check(required.includes(k)||optional.includes(k),'unknown-field',path+'.'+k,'Unknown field '+k);}
function finiteJSON(x,path='$',depth=0,seen=new Set()){
 check(depth<=24,'budget',path,'JSON nesting exceeds 24');
 if(x===null||typeof x==='boolean')return;
 if(typeof x==='number'){check(Number.isFinite(x),'finite',path,'Expected a finite number');return;}
 if(typeof x==='string'){check(x.length<=16384,'budget',path,'String exceeds 16384 characters');return;}
 check(x&&typeof x==='object','json',path,'Expected finite JSON, without undefined/functions');
 check(!seen.has(x),'json',path,'Cyclic input');check(Array.isArray(x)||Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null,'json',path,'Expected a plain JSON object');
 const next=new Set(seen).add(x),keys=Object.keys(x);check(keys.length<=512,'budget',path,'Collection exceeds 512 entries');
 if(Array.isArray(x)){check(x.length<=512&&keys.length===x.length&&keys.every((k,i)=>k===String(i)),'json',path,'Expected a dense bounded JSON array');}
 check(Reflect.ownKeys(x).length===keys.length+(Array.isArray(x)?1:0),'json',path,'Hidden or symbol properties are not JSON');
 check(keys.every(k=>own(Object.getOwnPropertyDescriptor(x,k),'value')),'json',path,'Accessor properties are not JSON');
 for(const k of keys){check(!badKeys.has(k),'unsafe-key',path+'.'+k,'Unsafe property name');finiteJSON(x[k],path+'.'+k,depth+1,next);}
}
function unit(u,path){check(typeof u==='string'&&u.length<=64&&/^(one|[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)(\*[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)*$/.test(u),'unit',path,'Expected a symbolic unit such as one, L or L^2');const powers={};for(const term of u.split('*')){const [base,e]=term.split('^');if(base!=='one')powers[base]=(powers[base]||0)+(e===undefined?1:Number(e));}check(Object.values(powers).every(e=>Math.abs(e)<=99),'unit',path,'Unit exponent exceeds 99');const result=Object.keys(powers).sort().filter(k=>powers[k]).map(k=>k+(powers[k]===1?'':'^'+powers[k])).join('*')||'one';check(result.length<=64,'unit',path,'Unit expression too large');return result;}
function type(t,path){check(object(t)&&typeof t.kind==='string','type',path,'Expected a type');switch(t.kind){case 'number':closed(t,['kind','unit'],[],path);return num(unit(t.unit,path+'.unit'));case 'boolean':case 'string':case 'null':closed(t,['kind'],[],path);return {kind:t.kind};case 'array':case 'optional':closed(t,['kind','element'],[],path);return {kind:t.kind,element:type(t.element,path+'.element')};case 'record':{closed(t,['kind','fields'],[],path);check(object(t.fields),'type',path,'Expected record fields');const fields={};for(const [k,v] of Object.entries(t.fields)){check(k.length>0&&!k.includes('.')&&!badKeys.has(k),'type',path,'Invalid record field '+k);fields[k]=type(v,path+'.fields.'+k);}return rec(fields);}default:fail('type',path,'Unknown type '+t.kind);}}
function equal(a,b){return canon(a)===canon(b);}
function merge(a,b,path){if(equal(a,b))return a;if(a.kind==='null')return b.kind==='optional'?b:opt(b);if(b.kind==='null')return a.kind==='optional'?a:opt(a);if(a.kind==='optional'&&equal(a.element,b))return a;if(b.kind==='optional'&&equal(b.element,a))return b;fail('type',path,'Incompatible value types or units');}
function matches(v,t,path){if(t.kind==='optional'){if(v!==null)matches(v,t.element,path);return;}if(t.kind==='number'){check(typeof v==='number'&&Number.isFinite(v),'type',path,'Expected a finite number');return;}if(t.kind==='null'){check(v===null,'type',path,'Expected null');return;}if(t.kind==='boolean'||t.kind==='string'){check(typeof v===t.kind,'type',path,'Expected '+t.kind);return;}if(t.kind==='array'){check(Array.isArray(v),'type',path,'Expected an array');v.forEach((x,i)=>matches(x,t.element,path+'.'+i));return;}check(object(v),'type',path,'Expected a record');check(equal(Object.keys(v).sort(),Object.keys(t.fields).sort()),'type',path,'Record fields must exactly match the declared type');for(const [k,ft] of Object.entries(t.fields))matches(v[k],ft,path+'.'+k);}
function inferType(value,quantityUnit='one'){
 finiteJSON(value);const u=unit(quantityUnit,'unit');
 function infer(v){if(v===null)return Z;if(typeof v==='number')return num(u);if(typeof v==='boolean')return B;if(typeof v==='string')return S;if(Array.isArray(v)){return arr(v.length?v.map(infer).reduce((a,b)=>merge(a,b,'value')):num(u));}const fields={};for(const [k,x] of Object.entries(v)){check(!k.includes('.')&&k.length>0,'type','value','Record field names cannot contain dots');fields[k]=infer(x);}return rec(fields);}
 return clone(infer(value));
}
function at(t,path,where){check(typeof path==='string'&&path.length>0,'path',where,'Expected a nonempty field path');for(const k of path.split('.')){check(k&&!badKeys.has(k)&&t.kind==='record'&&own(t.fields,k),'path',where,'Unknown or optional record path '+path);t=t.fields[k];}return t;}
function kind(t,k,path){check(t&&t.kind===k,'type',path,'Expected '+k+' input');return t;}
function numeric(t,path){return kind(t,'number',path);}
function same(a,b,path){check(equal(a,b),'unit-type',path,'Input types and units must agree');}
const comparison=['eq','ne','gt','gte','lt','lte'];
function parameters(n,ts,path){
 const p=n.params,required={map:['kind'],filter:['operator','value'],compare:['operator','value'],get:['path'],clamp:['min','max'],action:['allowed','action'],report:['labels'],bfs:['start','goal'],consensus:['required'],retry:['maxAttempts']}[n.op]||[];
 const optional={map:['factor'],sort:['key','descending'],dedupe:['key'],filter:['key'],evidence:['claim']}[n.op]||[];closed(p,required,optional,path+'.params');
 if(['sort','dedupe','filter'].includes(n.op)&&own(p,'key'))check(typeof p.key==='string'&&p.key.length>0,'parameter',path,'Field key must be nonempty');
 if(n.op==='sort'&&own(p,'descending'))check(typeof p.descending==='boolean','parameter',path,'descending must be Boolean');
 if(['compare','filter'].includes(n.op))check(comparison.includes(p.operator),'parameter',path,'Unknown comparison');
 if(n.op==='map'){check(['square','multiply'].includes(p.kind),'parameter',path,'Unknown map kind');check(p.kind==='multiply'?typeof p.factor==='number'&&Number.isFinite(p.factor):!own(p,'factor'),'parameter',path,'multiply requires a finite factor; square has no factor');}
 if(n.op==='clamp')check(typeof p.min==='number'&&typeof p.max==='number'&&p.min<=p.max,'parameter',path,'Expected ordered numeric clamp bounds');
 if(n.op==='action')check(typeof p.allowed==='boolean'&&typeof p.action==='string'&&p.action.length>0&&p.action.length<=120,'parameter',path,'Simulation action needs an explicit allowed Boolean and action name');
 if(n.op==='report')check(Array.isArray(p.labels)&&p.labels.length===ts.length&&new Set(p.labels).size===p.labels.length&&p.labels.every(x=>typeof x==='string'&&x.length>0&&!x.includes('.')&&!badKeys.has(x)),'parameter',path,'Report labels must be unique safe names matching ports');
 if(n.op==='bfs')check(typeof p.start==='string'&&typeof p.goal==='string','parameter',path,'Route endpoints must be strings');
 if(n.op==='consensus')check(Number.isSafeInteger(p.required)&&p.required>0,'parameter',path,'Consensus threshold must be a positive safe integer');
 if(n.op==='retry')check(Number.isInteger(p.maxAttempts)&&p.maxAttempts>=1&&p.maxAttempts<=8,'parameter',path,'Retry bound must be 1–8');
 if(n.op==='evidence'&&own(p,'claim'))check(typeof p.claim==='string','parameter',path,'Evidence claim must be a string');
}
function inferStep(n,ts,path){
 parameters(n,ts,path);const p=n.params,a=ts[0],b=ts[1];
 function element(){return kind(a,'array',path).element;}
 function field(t,k){check(t.kind==='record'&&own(t.fields,k),'type',path,'Missing record field '+k);return t.fields[k];}
 function compareType(t){matches(p.value,t,path+'.params.value');if(!['eq','ne'].includes(p.operator))check(['number','string'].includes(t.kind),'type',path,'Ordered comparison requires numbers or strings');}
 switch(n.op){
 case 'sum':case 'mean':case 'min':case 'max':return numeric(element(),path);
 case 'weightedMean':{const e=numeric(element(),path),w=numeric(kind(b,'array',path).element,path);same(w,num(),path);return e;}
 case 'length':check(a.kind==='array'||a.kind==='string','type',path,'length needs an array or string');return num('count');
 case 'map':{const e=numeric(element(),path);return arr(num(p.kind==='square'?unit(e.unit+'*'+e.unit,path):e.unit));}
 case 'sort':{const e=element(),t=p.key?at(e,p.key,path):e;check(['number','string'].includes(t.kind),'type',path,'Sort requires scalar comparable keys');return a;}
 case 'dedupe':{const e=element();if(p.key)at(e,p.key,path);return a;}
 case 'filter':{const e=element();compareType(p.key?at(e,p.key,path):e);return a;}
 case 'compare':compareType(a);return B;
 case 'choose':kind(a,'boolean',path);return merge(b,ts[2],path);
 case 'get':return at(a,p.path,path);
 case 'clamp':return numeric(a,path);
 case 'budget':numeric(a,path);same(a,b,path);return rec({allocated:a,remaining:a});
 case 'action':kind(a,'boolean',path);return rec({status:S,action:S,payload:b});
 case 'report':return rec(Object.fromEntries(p.labels.map((label,i)=>[label,ts[i]])));
 case 'bfs':kind(a,'record',path);for(const t of Object.values(a.fields))same(t,arr(S),path);same(b,arr(S),path);return rec({found:B,path:arr(S),distance:opt(num('edge'))});
 case 'allocate':{numeric(a,path);const e=kind(b,'array',path).element;same(field(e,'id'),S,path);same(field(e,'amount'),a,path);return rec({grants:arr(rec({id:S,requested:a,granted:a})),remaining:a});}
 case 'schedule':{const e=element();same(field(e,'id'),S,path);same(field(e,'depends'),arr(S),path);const duration=numeric(field(e,'duration'),path);return rec({order:arr(S),jobs:arr(rec({id:S,start:duration,end:duration})),makespan:duration});}
 case 'consensus':{const e=element();same(field(e,'source'),S,path);same(field(e,'choice'),S,path);return rec({choice:opt(S),support:num('count'),accepted:B,uniqueSources:num('count')});}
 case 'retry':same(element(),S,path);return rec({status:S,attempts:num('count'),history:arr(S)});
 case 'evidence':{const e=element();same(field(e,'source'),S,path);same(field(e,'claim'),S,path);same(field(e,'value'),B,path);return rec({state:S,support:num('count'),refute:num('count'),sources:num('count')});}
 default:fail('unsupported',path,'Unsupported capability '+n.op);
 }
}
function compile(intent){
 finiteJSON(intent);check(new TextEncoder().encode(canon(intent)).length<=131072,'budget','$','Intent exceeds 128 KiB');
 closed(intent,['format','name','thought','inputs','steps','outputs'],['assumptions'],'$');check(intent.format==='quineling-intent','format','$.format','Unknown intent format');
 check(typeof intent.name==='string'&&intent.name.length>0&&intent.name.length<=120,'schema','$.name','Name must be 1–120 characters');check(typeof intent.thought==='string','schema','$.thought','Thought must be a string');
 const assumptions=intent.assumptions||[];check(Array.isArray(assumptions)&&assumptions.length<=32&&assumptions.every(x=>typeof x==='string'&&x.length<=512),'schema','$.assumptions','Invalid assumptions');
 check(Array.isArray(intent.inputs)&&Array.isArray(intent.steps)&&intent.inputs.length+intent.steps.length>=1&&intent.inputs.length+intent.steps.length<=64,'budget','$','Task must contain 1–64 inputs and steps');
 check(Array.isArray(intent.outputs)&&intent.outputs.length>0&&intent.outputs.length<=16&&new Set(intent.outputs).size===intent.outputs.length,'schema','$.outputs','Expected 1–16 unique output IDs');
 const ids=new Set(),types=new Map(),values=new Map(),nodes=[],sourceMap=[],steps=new Map();
 function id(s,path){check(typeof s==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(s)&&!badKeys.has(s)&&!ids.has(s),'id',path,'Invalid or duplicate node ID');ids.add(s);}
 intent.inputs.forEach((x,i)=>{const path='$.inputs.'+i;closed(x,['id','value','type'],[],path);id(x.id,path);const t=type(x.type,path+'.type');matches(x.value,t,path+'.value');types.set(x.id,t);values.set(x.id,clone(x.value));nodes.push({id:x.id,op:'literal',inputs:[],params:{value:clone(x.value)}});sourceMap.push({nodeId:x.id,clause:'Supplied input '+x.id});});
 intent.steps.forEach((n,i)=>{const path='$.steps.'+i;closed(n,['id','op','inputs','params'],[],path);id(n.id,path);check(capabilities.includes(n.op),'unsupported',path,'Unsupported capability '+n.op);check(Array.isArray(n.inputs)&&n.inputs.length<=16&&(K.ARITY[n.op]===-1||n.inputs.length===K.ARITY[n.op]),'ports',path,'Wrong ordered input count for '+n.op);steps.set(n.id,{n,path});});
 for(const {n,path} of steps.values())for(const from of n.inputs)check(typeof from==='string'&&ids.has(from),'reference',path,'Unknown input '+from);
 for(const output of intent.outputs)check(typeof output==='string'&&ids.has(output),'reference','$.outputs','Unknown output '+output);
 const reachable=new Set();function visit(id){if(reachable.has(id))return;reachable.add(id);const entry=steps.get(id);if(entry)entry.n.inputs.forEach(visit);}intent.outputs.forEach(visit);check(reachable.size===ids.size,'disconnected','$','Every supplied input and step must contribute to a declared output');
 function upstreamAction(id,seen=new Set()){if(seen.has(id))return false;seen.add(id);const entry=steps.get(id);return !!entry&&(entry.n.op==='action'||entry.n.inputs.some(x=>upstreamAction(x,seen)));}
 for(const {n,path} of steps.values())if(n.op==='choose')check(!upstreamAction(n.inputs[1])&&!upstreamAction(n.inputs[2]),'eager-effect',path,'choose is eager: use an explicit action guard, never an action inside a branch');
 const pending=new Map(steps);while(pending.size){const entry=[...pending.values()].find(({n})=>n.inputs.every(x=>types.has(x)));check(entry,'cycle','$.steps','Task graph contains a cycle');const {n,path}=entry,ts=n.inputs.map(x=>types.get(x)),args=n.inputs.map(x=>values.get(x)),t=inferStep(n,ts,path);let value=UNKNOWN;
 if(n.op!=='action'){
  if(args.includes(UNKNOWN)){check(['report','get','compare','length'].includes(n.op),'unproven-refinement',path,'Cannot prove numerical refinements from an unevaluated action receipt');}
  else {
   if(n.op==='weightedMean'){const vs=args[0],ws=args[1];const mass=ws.reduce((s,v)=>s+v,0),products=vs.map((v,i)=>v*ws[i]),total=products.reduce((s,v)=>s+v,0);check(Number.isFinite(mass)&&Number.isFinite(total)&&products.every(Number.isFinite),'refinement',path,'Weighted arithmetic overflow');}
   try{value=K.calculate(n.op,args,n.params);finiteJSON(value,path+'.result');check(new TextEncoder().encode(canon(value)).length<=65536,'budget',path,'Intermediate value exceeds 64 KiB');matches(value,t,path+'.result');}catch(e){if(e.code)throw e;fail('refinement',path,e.message);}
  }
 }
 types.set(n.id,t);values.set(n.id,value);nodes.push(clone(n));sourceMap.push({nodeId:n.id,clause:n.op+'('+n.inputs.join(', ')+')'});pending.delete(n.id);
 }
 const graph={version:1,name:intent.name,nodes,outputs:[...intent.outputs]};check(new TextEncoder().encode(canon(graph)).length<=65536,'source-budget','$','Task graph exceeds 64 KiB');K.validate(graph);
 let sourceBytes;try{const program=Q.makeTaskProgram(graph);sourceBytes=new TextEncoder().encode(canon(program)).length;Q.encode(program);}catch(e){fail('source-budget','$',e.message);}
 return {graph,contract:{format:'quineling-contract',registry:'quineling-kernels-experimental',types:clone(Object.fromEntries(types)),assumptions:clone(assumptions),effectMode:intent.steps.some(n=>n.op==='action')?'simulation':'pure',sourceBytes,provenance:'companion document; types and thought are not embedded in the quine'},sourceMap,diagnostics:[]};
}
function splitPipeline(text){const chunks=[];let depth=0,quoted=false,escape=false,start=0;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(escape)escape=false;else if(c==='\\')escape=true;else if(c==='"')quoted=false;}else if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}')depth--;else if(c==='|'&&depth===0){chunks.push(text.slice(start,i).trim());start=i+1;}check(depth>=0,'syntax','$','Unbalanced JSON');}check(!quoted&&depth===0,'syntax','$','Incomplete JSON');chunks.push(text.slice(start).trim());check(chunks.every(Boolean),'syntax','$','Empty pipeline stage');return chunks;}
function takeValue(text){text=text.trim();let end=0;if(text[0]==='['||text[0]==='{'){let depth=0,q=false,esc=false;for(let i=0;i<text.length;i++){const c=text[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c==='"')q=false;}else if(c==='"')q=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}'){if(--depth===0){end=i+1;break;}}}}else if(text[0]==='"'){let esc=false;for(let i=1;i<text.length;i++){if(esc)esc=false;else if(text[i]==='\\')esc=true;else if(text[i]==='"'){end=i+1;break;}}}else{const m=text.match(/^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)(?=\s|$)/);if(m)end=m[0].length;}check(end>0,'syntax','$','Expected explicit JSON data');let value;try{value=JSON.parse(text.slice(0,end));}catch{fail('syntax','$','Invalid JSON data');}finiteJSON(value);return {value,rest:text.slice(end).trim()};}
const numericPattern='-?(?:0|[1-9]\\d*)(?:\\.\\d+)?(?:[eE][+-]?\\d+)?';
function parse(text){
 const base={diagnostics:[],assumptions:[],sourceMap:[]};
 try{
  check(typeof text==='string'&&text.length<=16384,'budget','$','Thought must be at most 16384 characters');text=text.trim();if(!text)return {...base,status:'clarify',diagnostics:[{code:'missing',path:'$',message:'Supply explicit data and operations, or import a typed plan.'}]};
  let imported=text.startsWith('plan ')?text.slice(5).trim():text;
  if(imported.startsWith('{')){let candidate;try{candidate=JSON.parse(imported);}catch{}if(candidate&&candidate.format){const result=compile(candidate);return {...base,status:'supported',intent:clone(candidate),assumptions:result.contract.assumptions,sourceMap:result.sourceMap};}if(text.startsWith('plan '))fail('syntax','$','plan requires a complete typed IntentIR JSON object');}
  if(/\b(?:forever|continuously|live data|send email|delete files|internet|persistent|real-world)\b/i.test(text))return {...base,status:'unsupported',diagnostics:[{code:'unavailable-capability',path:'$',message:'This goal needs an external, persistent, or unbounded capability. The local compiler supports bounded supplied data and simulated actions.'}]};
  const chunks=splitPipeline(text),first=chunks.shift(),intent={format:'quineling-intent',name:'Generated thought',thought:text,inputs:[],steps:[],outputs:[],assumptions:[]};let current,seedKind='',counter=0,activeClause=first;const sourceClauses={};
  function input(id,value,t){intent.inputs.push({id,value,type:t||inferType(value)});sourceClauses[id]=activeClause;return id;}
  function step(op,inputs,params={}){const id='step'+(++counter);intent.steps.push({id,op,inputs,params});sourceClauses[id]=activeClause;current=id;return id;}
  function finishUnit(rest){if(!rest){intent.assumptions.push('Unspecified numeric units are dimensionless (one).');return 'one';}return unit(rest,'$.input.unit');}
  let m;
  if((m=first.match(/^weighted mean\s+(.+)$/i))){const v=takeValue(m[1]);check(v.rest.startsWith('weights '),'syntax','$','Use weighted mean VALUES weights WEIGHTS [UNIT]');const w=takeValue(v.rest.slice(8)),u=finishUnit(w.rest);const vi=input('values',v.value,arr(num(u))),wi=input('weights',w.value,arr(num()));step('weightedMean',[vi,wi]);}
  else if((m=first.match(new RegExp('^allocate ('+numericPattern+')(?: ([A-Za-z][A-Za-z0-9_^*\\-]*))? to (.+)$','i')))){const req=takeValue(m[3]);check(!req.rest,'syntax','$','Unexpected text after allocation requests');const u=finishUnit(m[2]||'');const requestsType=inferType(req.value,u);if(Array.isArray(req.value)&&req.value.length===0)requestsType.element=rec({id:S,amount:num(u)});step('allocate',[input('available',Number(m[1]),num(u)),input('requests',req.value,requestsType)]);}
  else if((m=first.match(/^route ([A-Za-z0-9_-]+) to ([A-Za-z0-9_-]+) in (.+)$/i))){const roads=takeValue(m[3]);check(roads.rest.startsWith('blocked '),'syntax','$','Route requires an explicit blocked JSON array (use [] for none)');const blocked=takeValue(roads.rest.slice(8));check(!blocked.rest,'syntax','$','Unexpected text after blocked nodes');check(object(roads.value),'type','$','Route graph must be an adjacency record');const fields=Object.fromEntries(Object.keys(roads.value).map(k=>[k,arr(S)]));step('bfs',[input('streets',roads.value,rec(fields)),input('blocked',blocked.value,arr(S))],{start:m[1],goal:m[2]});seedKind='route';}
  else if((m=first.match(/^schedule (.+)$/i))){const jobs=takeValue(m[1]),u=finishUnit(jobs.rest);step('schedule',[input('jobs',jobs.value,arr(rec({id:S,depends:arr(S),duration:num(u)})))]);}
  else if((m=first.match(/^consensus (.+)$/i))){const votes=takeValue(m[1]),r=votes.rest.match(/^required ([1-9]\d*)$/);check(r,'syntax','$','Consensus requires an explicit positive threshold: required N');step('consensus',[input('votes',votes.value,arr(rec({source:S,choice:S})))],{required:Number(r[1])});}
  else if((m=first.match(/^evidence (.+)$/i))){const reports=takeValue(m[1]);let params={};if(reports.rest){check(reports.rest.startsWith('claim '),'syntax','$','Expected claim JSON_STRING');const claim=takeValue(reports.rest.slice(6));check(typeof claim.value==='string'&&!claim.rest,'syntax','$','Claim must be a JSON string');params.claim=claim.value;}step('evidence',[input('evidence',reports.value,arr(rec({source:S,claim:S,value:B})))],params);}
  else if((m=first.match(/^retry (.+)$/i))){const outcomes=takeValue(m[1]),r=outcomes.rest.match(/^max ([1-8])$/);check(r,'syntax','$','Retry needs an explicit bound: max 1–8');step('retry',[input('outcomes',outcomes.value,arr(S))],{maxAttempts:Number(r[1])});}
  else if((m=first.match(/^budget (.+)$/i))){const available=takeValue(m[1]);check(available.rest.startsWith('for '),'syntax','$','Use budget AVAILABLE for DESIRED [UNIT]');const desired=takeValue(available.rest.slice(4)),u=finishUnit(desired.rest);step('budget',[input('available',available.value,num(u)),input('desired',desired.value,num(u))]);}
  else {
   let seed=first.replace(/^numbers\s+/i,''),prefixed=null;
   if((m=seed.match(/^(sum|mean|min|max)\s+(.+)$/i))){prefixed=m[1].toLowerCase();seed=m[2];}
   const parsed=takeValue(seed),u=finishUnit(parsed.rest);current=input('input',parsed.value,inferType(parsed.value,u));if(prefixed)step(prefixed,[current]);
  }
  for(const clause of chunks){
   activeClause=clause;
   if(/^(sum|mean|min|max|length)$/i.test(clause))step(clause.toLowerCase(),[current]);
   else if(/^square$/i.test(clause))step('map',[current],{kind:'square'});
   else if((m=clause.match(new RegExp('^multiply ('+numericPattern+')$','i'))))step('map',[current],{kind:'multiply',factor:Number(m[1])});
   else if((m=clause.match(new RegExp('^clamp ('+numericPattern+') ('+numericPattern+')$','i'))))step('clamp',[current],{min:Number(m[1]),max:Number(m[2])});
   else if((m=clause.match(/^filter (?:(\w+(?:\.\w+)*) )?(eq|ne|gt|gte|lt|lte) (.+)$/i))){const v=takeValue(m[3]);check(!v.rest,'syntax','$','Unexpected text after filter value');const p={operator:m[2].toLowerCase(),value:v.value};if(m[1])p.key=m[1];step('filter',[current],p);}
   else if((m=clause.match(/^compare (eq|ne|gt|gte|lt|lte) (.+)$/i))){const v=takeValue(m[2]);check(!v.rest,'syntax','$','Unexpected text after comparison value');step('compare',[current],{operator:m[1].toLowerCase(),value:v.value});}
   else if((m=clause.match(/^sort(?: ([A-Za-z][A-Za-z0-9_.-]*))?(?: (asc|desc))?$/i))){let key=m[1],direction=m[2];if(!direction&&['asc','desc'].includes((key||'').toLowerCase())){direction=key;key=undefined;}const p={descending:(direction||'asc').toLowerCase()==='desc'};if(key)p.key=key;step('sort',[current],p);}
   else if((m=clause.match(/^dedupe(?: ([A-Za-z][A-Za-z0-9_.-]*))?$/i)))step('dedupe',[current],m[1]?{key:m[1]}:{});
   else if((m=clause.match(/^get ([A-Za-z][A-Za-z0-9_.-]*)$/i)))step('get',[current],{path:m[1]});
   else if((m=clause.match(/^report ([A-Za-z][A-Za-z0-9_-]*)$/i)))step('report',[current],{labels:[m[1]]});
   else if((m=clause.match(/^simulate (.+)$/i))){check(seedKind==='route'&&intent.steps.find(n=>n.id===current)?.op==='bfs','syntax','$','simulate is supported directly after a route, guarded by found');const action=takeValue(m[1]);check(typeof action.value==='string'&&!action.rest,'syntax','$','Simulation action must be a JSON string');const route=current,guard=step('get',[route],{path:'found'}),payload=step('get',[route],{path:'path'});step('action',[guard,payload],{allowed:true,action:action.value});intent.assumptions.push('The action is a local simulation, guarded by route.found; it grants no external authority.');}
   else fail('syntax','$','Unrecognized complete pipeline stage: '+clause);
  }
  intent.outputs=[current];const result=compile(intent);return {...base,status:'supported',intent,assumptions:clone(intent.assumptions),sourceMap:result.sourceMap.map(entry=>({...entry,clause:sourceClauses[entry.nodeId]}))};
 }catch(e){return {...base,status:e.code==='unsupported'?'unsupported':['syntax','missing','unit'].includes(e.code)?'clarify':'inconsistent',diagnostics:[{code:e.code||'invalid',path:e.path||'$',message:e.message}]};}
}
const examples=Object.freeze([
 '[2,3,4] | square | sum | report total',
 '[8,2,8,4] | dedupe | sort desc | mean',
 '[1,5,9] L | filter gt 3 | sum',
 'weighted mean [24,36,60] weights [2,1,1] L',
 'allocate 9 L to [{"id":"fern","amount":4},{"id":"sage","amount":7}]',
 'route A to D in {"A":["B","C"],"B":["D"],"C":["D"],"D":[]} blocked ["B"] | simulate "walk-route"',
 'schedule [{"id":"a","depends":[],"duration":2},{"id":"b","depends":["a"],"duration":3}] s',
 'consensus [{"source":"a","choice":"yes"},{"source":"b","choice":"yes"}] required 2',
 'evidence [{"source":"a","claim":"safe","value":true}] claim "safe"',
 'retry ["retry","ok"] max 3'
]);
const api={parse,compile,inferType,capabilities,schema,examples};if(typeof module!=='undefined')module.exports=api;root.ThoughtCompiler=api;
})(typeof globalThis!=='undefined'?globalThis:this);
