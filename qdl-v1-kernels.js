(function(root){
'use strict';
const ARITY=Object.freeze({input:0,arithmetic:2,compareValues:2,all:1,select:2,evidenceFresh:3,reconcile:2});
const forbidden=new Set(['__proto__','prototype','constructor']),has=(o,k)=>Object.hasOwn(o,k);
function fail(code,message){const e=new Error(message);e.code=code;throw e;}
function requireThat(ok,code,message){if(!ok)fail(code,message);}
function record(x){return x!==null&&typeof x==='object'&&!Array.isArray(x)&&(Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null);}
function json(x,depth=0,seen=new Set()){
 requireThat(depth<=24,'resource-limit','JSON depth exceeds 24');
 if(x===null||typeof x==='boolean')return;
 if(typeof x==='number'){requireThat(Number.isFinite(x),'nonfinite-input','Expected finite number');return;}
 if(typeof x==='string'){requireThat(x.length<=16384,'resource-limit','String exceeds 16384 code units');requireThat(typeof x.isWellFormed!=='function'||x.isWellFormed(),'invalid-unicode','Malformed Unicode');return;}
 requireThat(Array.isArray(x)||record(x),'invalid-data','Expected plain JSON data');if(Array.isArray(x))requireThat(Object.getPrototypeOf(x)===Array.prototype,'invalid-data','Expected a plain array');requireThat(!seen.has(x),'invalid-data','Cyclic JSON data');
 const keys=Object.keys(x),next=new Set(seen).add(x);requireThat(keys.length<=512,'resource-limit','Collection exceeds 512 entries');
 requireThat(Reflect.ownKeys(x).length===keys.length+(Array.isArray(x)?1:0),'invalid-data','Hidden or symbol properties are forbidden');
 if(Array.isArray(x))requireThat(x.length<=512&&keys.length===x.length&&keys.every((k,i)=>k===String(i)),'invalid-data','Expected a dense bounded array');
 for(const k of keys){requireThat(!forbidden.has(k),'unsafe-key','Unsafe property name');const d=Object.getOwnPropertyDescriptor(x,k);requireThat(has(d,'value'),'invalid-data','Accessor properties are forbidden');json(d.value,depth+1,next);}
}
function closed(x,keys){requireThat(record(x),'invalid-data','Expected a plain record');requireThat(Object.keys(x).length===keys.length&&keys.every(k=>has(x,k)),'invalid-fields','Record fields must exactly match '+keys.join(','));}
function arr(x){requireThat(Array.isArray(x)&&x.length<=512,'invalid-data','Expected a bounded array');return x;}
function str(x){requireThat(typeof x==='string'&&x.length>0,'invalid-data','Expected a nonempty string');return x;}
function nat(x){requireThat(typeof x==='number'&&Number.isSafeInteger(x)&&x>=0,'integer-refinement','Expected a nonnegative safe integer');return x;}
function number(x){requireThat(typeof x==='number'&&Number.isFinite(x),'number-refinement','Expected a finite number');return x;}
function key(k){str(k);requireThat(!forbidden.has(k)&&!k.includes('.'),'unsafe-key','Invalid field name');return k;}
function path(x,p){str(p);let v=x;for(const k of p.split('.')){key(k);requireThat(record(v)&&has(v,k),'missing-field','Missing own field '+p);v=v[k];}return v;}
function canon(x){if(Array.isArray(x))return '['+x.map(canon).join(',')+']';if(record(x))return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canon(x[k])).join(',')+'}';return JSON.stringify(x);}
const clone=x=>JSON.parse(canon(x));
function comparison(a,b,operator){requireThat(['eq','ne','gt','gte','lt','lte'].includes(operator),'invalid-parameter','Invalid comparison operator');if(operator==='eq'||operator==='ne'){const eq=canon(a)===canon(b);return operator==='eq'?eq:!eq;}requireThat((typeof a==='number'&&typeof b==='number')||(typeof a==='string'&&typeof b==='string'),'comparison-type','Ordering requires two numbers or two strings');switch(operator){case 'gt':return a>b;case 'gte':return a>=b;case 'lt':return a<b;case 'lte':return a<=b;}}
function arithmetic(a,b,p,context){
 closed(p,['kind']);requireThat(['add','sub','mul','div','floorDiv','min','max'].includes(p.kind),'invalid-parameter','Unknown arithmetic kind');number(a);number(b);
 const refinement=has(context,'arithmeticRefinement')?context.arithmeticRefinement:'N';requireThat(['N','Nat'].includes(refinement),'invalid-context','arithmeticRefinement must be N or Nat');
 const integer=p.kind==='floorDiv'||refinement==='Nat';if(integer){nat(a);nat(b);}if(p.kind==='floorDiv')requireThat(b>0,'division-zero','floorDiv requires a positive denominator');if(p.kind==='div')requireThat(b!==0,'division-zero','Division by zero');
 if(p.kind==='div'&&refinement==='Nat')fail('invalid-context','Ordinary division returns N, not Nat');
 const result=p.kind==='add'?a+b:p.kind==='sub'?a-b:p.kind==='mul'?a*b:p.kind==='div'?a/b:p.kind==='floorDiv'?Math.floor(a/b):p.kind==='min'?Math.min(a,b):Math.max(a,b);
 requireThat(Number.isFinite(result),'nonfinite-result','Arithmetic overflow');if(integer)requireThat(Number.isSafeInteger(result)&&result>=0,'integer-overflow','Arithmetic exceeds nonnegative safe integer domain');return result===0?0:result;
}
function select(rows,query,p){
 closed(p,['keys','order','default']);arr(rows);requireThat(record(query)&&record(p.default),'invalid-data','Selection query and default must be records');
 const keys=arr(p.keys);keys.forEach(key);requireThat(new Set(keys).size===keys.length,'invalid-parameter','Duplicate query key');closed(query,keys);
 const order=arr(p.order),orderKeys=new Set();for(const o of order){closed(o,['path','descending']);str(o.path);o.path.split('.').forEach(key);requireThat(typeof o.descending==='boolean'&&!orderKeys.has(o.path),'invalid-parameter','Invalid or repeated sort key');orderKeys.add(o.path);}
 const orderTypes=new Map();let candidates=[];for(let i=0;i<rows.length;i++){const row=rows[i];requireThat(record(row),'invalid-data','Selection rows must be records');let matches=true;for(const k of keys){requireThat(has(row,k),'missing-field','Selection row lacks query field');if(!comparison(row[k],query[k],'eq'))matches=false;}for(const o of order){const v=path(row,o.path),t=typeof v;requireThat(t==='number'||t==='string','comparison-type','Sort key must be numeric or string');if(orderTypes.has(o.path))requireThat(orderTypes.get(o.path)===t,'comparison-type','Mixed sort key types');else orderTypes.set(o.path,t);}if(matches)candidates.push({row,index:i});}
 candidates.sort((a,b)=>{for(const o of order){const x=path(a.row,o.path),y=path(b.row,o.path),r=(x<y?-1:x>y?1:0)*(o.descending?-1:1);if(r)return r;}return a.index-b.index;});
 return candidates.length?{found:true,value:clone(candidates[0].row),index:candidates[0].index}:{found:false,value:clone(p.default),index:null};
}
function evidenceFresh(rows,claim,clock,p){
 closed(p,['allowedKinds']);str(claim);closed(clock,['now','maxAge','minRevision']);nat(clock.now);nat(clock.maxAge);nat(clock.minRevision);const kinds=['observation','testimony','inference'];arr(p.allowedKinds);requireThat(p.allowedKinds.every(k=>kinds.includes(k))&&new Set(p.allowedKinds).size===p.allowedKinds.length,'invalid-parameter','Invalid allowed evidence kinds');
 const ids=new Set(),used=[],skipped=[],sources=new Map();for(const r of arr(rows)){closed(r,['id','source','claim','value','kind','observedAt','revision']);str(r.id);str(r.source);str(r.claim);requireThat(!ids.has(r.id),'duplicate-id','Duplicate evidence ID');ids.add(r.id);requireThat(r.value===null||typeof r.value==='boolean','invalid-data','Evidence value must be boolean or null');requireThat(kinds.includes(r.kind),'invalid-data','Invalid evidence kind');nat(r.observedAt);nat(r.revision);
 const reason=r.claim!==claim?'claim':!p.allowedKinds.includes(r.kind)?'kind':r.value===null?'unknown':r.observedAt>clock.now?'future':clock.now-r.observedAt>clock.maxAge?'stale':r.revision<clock.minRevision?'revision':null;
 if(reason){skipped.push({record:clone(r),reason});continue;}used.push(clone(r));if(!sources.has(r.source))sources.set(r.source,new Set());sources.get(r.source).add(r.value);}
 let support=0,refute=0;const sourceConflicts=[];for(const [source,values] of sources){if(values.has(true))support++;if(values.has(false))refute++;if(values.size===2)sourceConflicts.push(source);}
 return {state:support&&refute?'conflict':support?'supported':refute?'refuted':'unknown',support,refute,sources:sources.size,sourceConflicts,used,skipped};
}
function reconcile(rows,policy,p){
 closed(p,[]);closed(policy,['operation','requested','maxAttempts']);str(policy.operation);nat(policy.requested);nat(policy.maxAttempts);requireThat(policy.maxAttempts>=1&&policy.maxAttempts<=8,'invalid-parameter','maxAttempts must be 1–8');const ids=new Map(),attempts=new Map();
 for(const r of arr(rows)){closed(r,['id','operation','attempt','sequence','status','units']);str(r.id);str(r.operation);str(r.attempt);nat(r.sequence);nat(r.units);requireThat(['confirmed','failed','pending','unknown'].includes(r.status),'invalid-data','Invalid receipt status');requireThat(r.status==='confirmed'?r.units>0:r.units===0,'receipt-units','Confirmed units must be positive and nonconfirmed units zero');if(r.operation!==policy.operation)continue;
 const encoded=canon(r);if(ids.has(r.id)){requireThat(ids.get(r.id)===encoded,'receipt-conflict','Receipt ID reused with different data');continue;}ids.set(r.id,encoded);if(!attempts.has(r.attempt))attempts.set(r.attempt,[]);attempts.get(r.attempt).push(r);}
 requireThat(attempts.size<=policy.maxAttempts,'attempt-budget','Observed attempts exceed maxAttempts');
 const counts={confirmed:0,failed:0,pending:0,unknown:0};let confirmedUnits=0;for(const history of attempts.values()){history.sort((a,b)=>a.sequence-b.sequence);let last=null,terminal=null;for(const r of history){if(last&&last.sequence===r.sequence)requireThat(last.status===r.status&&last.units===r.units,'receipt-conflict','Equal sequence has different receipt data');if(terminal)requireThat(terminal.status===r.status&&terminal.units===r.units,'receipt-conflict','Terminal receipt cannot change or regress');if(r.status==='confirmed'||r.status==='failed')terminal=r;last=r;}counts[last.status]++;if(last.status==='confirmed')confirmedUnits=arithmetic(confirmedUnits,last.units,{kind:'add'},{arithmeticRefinement:'Nat'});}
 const n=attempts.size,state=counts.unknown?'unknown':counts.pending?'pending':confirmedUnits>=policy.requested?'completed':n>=policy.maxAttempts?'exhausted':n===0?'ready':'retryable';
 return {state,confirmedUnits,confirmedAttempts:counts.confirmed,failedAttempts:counts.failed,pendingAttempts:counts.pending,unknownAttempts:counts.unknown,attempts:n,mayRetry:state==='ready'||state==='retryable'};
}
function calculate(op,inputs,params={},context={}){
 requireThat(has(ARITY,op),'unknown-kernel','Unknown v1 kernel');json(inputs);json(params);requireThat(Array.isArray(inputs)&&inputs.length===ARITY[op],'kernel-arity','Wrong ordered input count');requireThat(record(context),'invalid-context','Expected a context record');for(const k of Reflect.ownKeys(context)){requireThat(typeof k==='string'&&!forbidden.has(k),'unsafe-key','Unsafe context key');const d=Object.getOwnPropertyDescriptor(context,k);requireThat(d.enumerable&&has(d,'value'),'invalid-context','Context fields must be enumerable own data properties');}let result;
 switch(op){
 case 'input':closed(params,['name']);key(params.name);requireThat(has(context,'bindings')&&record(context.bindings),'missing-binding','Missing input bindings');json(context.bindings);requireThat(has(context.bindings,params.name),'missing-binding','Missing required input '+params.name);result=clone(context.bindings[params.name]);break;
 case 'arithmetic':result=arithmetic(inputs[0],inputs[1],params,context);break;
 case 'compareValues':closed(params,['operator']);result=comparison(inputs[0],inputs[1],params.operator);break;
 case 'all':closed(params,[]);arr(inputs[0]);requireThat(inputs[0].every(x=>typeof x==='boolean'),'invalid-data','all requires boolean values');result=inputs[0].every(Boolean);break;
 case 'select':result=select(inputs[0],inputs[1],params);break;
 case 'evidenceFresh':result=evidenceFresh(inputs[0],inputs[1],inputs[2],params);break;
 case 'reconcile':result=reconcile(inputs[0],inputs[1],params);break;
 }
 json(result);requireThat(new TextEncoder().encode(canon(result)).length<=65536,'resource-limit','Kernel result exceeds 64 KiB');return result;
}
function freeze(x){if(x&&typeof x==='object'){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;}
const contracts=freeze({
 input:Object.freeze({arity:0,params:['name'],output:'T',context:'bindings own-name lookup; graph validates T'}),
 arithmetic:Object.freeze({arity:2,params:['kind'],kinds:['add','sub','mul','div','floorDiv','min','max'],output:'N[u] or Nat[u]; graph computes units',context:'arithmeticRefinement: N (default) or Nat; floorDiv always Nat'}),
 compareValues:Object.freeze({arity:2,params:['operator'],output:'boolean'}),
 all:Object.freeze({arity:1,params:[],inputs:'Array<boolean>',output:'boolean; empty true'}),
 select:Object.freeze({arity:2,params:['keys','order','default'],inputs:'Array<Record<T>>, query Record<Q>',output:'{found:boolean,value:T,index:optional Nat[count]}'}),
 evidenceFresh:Object.freeze({arity:3,params:['allowedKinds'],inputs:'Array<E>, claim:string, {now:Nat[tick],maxAge:Nat[tick],minRevision:Nat[revision]}',output:'{state:string,support:Nat[count],refute:Nat[count],sources:Nat[count],sourceConflicts:Array<string>,used:Array<E>,skipped:Array<{record:E,reason:string}>}'}),
 reconcile:Object.freeze({arity:2,params:[],inputs:'Array<R>, {operation:string,requested:Nat[item],maxAttempts:Nat[count] 1..8}',output:'{state:string,confirmedUnits:Nat[item],confirmedAttempts:Nat[count],failedAttempts:Nat[count],pendingAttempts:Nat[count],unknownAttempts:Nat[count],attempts:Nat[count],mayRetry:boolean}'})
});
const api=Object.freeze({ARITY,calculate,contracts});if(typeof module!=='undefined'&&module.exports)module.exports=api;root.QDLV1Kernels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
