(function(root){
'use strict';
const node=typeof module!=='undefined'&&module.exports;
const T=node?require('./qdl-v1-types.js'):root.QDLV1Types;
const C=node?require('./qdl-v1-contract.js'):root.QDLV1Contract;
const VK=node?require('./qdl-v1-kernels.js'):root.QDLV1Kernels;
const K=node?require('./kernels.js'):root.QuinelingKernels;
const Crypto=node?require('./ranch-crypto.js'):root.RanchCrypto;
const D=node?require('./qdl.js'):root.QDL;
const A=node?require('./anatomy.js'):root.Anatomy;
const Registry=node?require('./qdl-v1-registry.js'):root.QDLV1Registry;
const core=()=>node?require('./core.js'):root.Quinelings;
const copy=x=>JSON.parse(JSON.stringify(x)),bytes=x=>new TextEncoder().encode(JSON.stringify(x)).length;
const RUN_LIMIT=2*1024*1024,DIAGNOSTIC_RESERVE=8192;
function fail(code,path,message){const e=new Error(message);e.code=code;e.path=path;throw e;}
function check(ok,code,path,message){if(!ok)fail(code,path,message);}
function closed(x,required,optional=[],path='$'){
 check(x!==null&&typeof x==='object'&&!Array.isArray(x),'type',path,'Expected a record');
 for(const k of required)check(Object.hasOwn(x,k),'missing',path+'.'+k,'Missing field '+k);
 for(const k of Object.keys(x))check(required.includes(k)||optional.includes(k),'unknown-field',path+'.'+k,'Unknown field '+k);
}
function id(x,path){check(typeof x==='string'&&/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(x)&&!['constructor','prototype','__proto__'].includes(x),'reference',path,'Expected a safe 1–64 character identifier');}
function text(x,path,max=512){check(typeof x==='string'&&Array.from(x).length<=max,'limit',path,'Text exceeds '+max+' Unicode scalar values');}
function refs(x,allowed,path,nonempty=false){check(Array.isArray(x)&&x.length<=64&&(!nonempty||x.length>0)&&new Set(x).size===x.length,'reference',path,'Expected bounded unique references');for(const v of x)check(allowed.has(v),'reference',path,'Unknown reference '+v);}
function declaration(task,description){text(description,'$.thought');return {observations:[],evidence:[],goals:[],decisions:[],plans:[],tasks:[{id:'task',text:description,nodes:task.nodes.map(n=>n.id),outputs:[...task.outputs]}]};}
function validateThought(thought,task){
 closed(thought,['observations','evidence','goals','decisions','plans','tasks']);
 const ids=new Set(),nodes=new Map(task.nodes.map(n=>[n.id,n])),outputs=new Set(task.outputs),groups={};let total=0;
 const fields={observations:['id','text','input','path','basis'],evidence:['id','claim','source','observation','value'],goals:['id','text','outputs','completion'],decisions:['id','text','guard','evidence'],plans:['id','text','tasks'],tasks:['id','text','nodes','outputs']};
 for(const [group,list] of Object.entries(thought)){
  check(Array.isArray(list)&&list.length<=32,'limit','$.thought.'+group,'At most 32 declarations per class');total+=list.length;groups[group]=new Set();
  for(const [i,r] of list.entries()){const p='$.thought.'+group+'.'+i;closed(r,fields[group],[],p);id(r.id,p+'.id');check(!ids.has(r.id),'reference',p+'.id','Duplicate declaration ID');ids.add(r.id);groups[group].add(r.id);if(Object.hasOwn(r,'text'))text(r.text,p+'.text');}
 }
 check(total<=96,'limit','$.thought','At most 96 declarations');const covered=new Set();
 for(const [i,r] of thought.observations.entries()){
  const p='$.thought.observations.'+i,n=nodes.get(r.input);check(n&&['input','literal'].includes(n.op),'reference',p+'.input','Observation must reference an input or literal');
  check(['confirmed','testimony','suspected','open'].includes(r.basis),'type',p+'.basis','Unknown observation basis');check(Array.isArray(r.path)&&r.path.length<=8,'reference',p+'.path','At most eight own-property segments');
  let t=n.type;for(const part of r.path){if(t.kind==='record'){check(typeof part==='string'&&!['__proto__','constructor','prototype'].includes(part)&&Object.hasOwn(t.fields,part),'reference',p+'.path','Unknown own record field');t=t.fields[part];}else if(t.kind==='array'){check(Number.isInteger(part)&&part>=0&&part<512,'reference',p+'.path','Expected bounded array index');t=t.element;}else fail('reference',p+'.path','Path crosses a scalar or optional value');}
 }
 for(const [i,r] of thought.evidence.entries()){const p='$.thought.evidence.'+i;text(r.claim,p+'.claim');text(r.source,p+'.source');check(r.claim.length>0&&r.source.length>0&&groups.observations.has(r.observation),'reference',p,'Evidence requires a claim, source and observation reference');check(typeof r.value==='boolean','type',p+'.value','Evidence assertion must be Boolean');}
 for(const [i,r] of thought.goals.entries()){const p='$.thought.goals.'+i;refs(r.outputs,outputs,p+'.outputs',true);check(outputs.has(r.completion)&&nodes.get(r.completion)?.type.kind==='boolean','reference',p+'.completion','Completion must be an explicitly exported Boolean node');}
 for(const [i,r] of thought.decisions.entries()){const p='$.thought.decisions.'+i;check(nodes.get(r.guard)?.type.kind==='boolean','reference',p+'.guard','Decision guard must reference a Boolean node');refs(r.evidence,groups.evidence,p+'.evidence');}
 for(const [i,r] of thought.plans.entries())refs(r.tasks,groups.tasks,'$.thought.plans.'+i+'.tasks',true);
 for(const [i,r] of thought.tasks.entries()){const p='$.thought.tasks.'+i;refs(r.nodes,new Set(nodes.keys()),p+'.nodes',true);refs(r.outputs,outputs,p+'.outputs',true);for(const o of r.outputs)check(r.nodes.includes(o),'reference',p+'.outputs','Task output must belong to its declared nodes');r.nodes.forEach(n=>covered.add(n));}
 check(covered.size===nodes.size,'reference','$.thought.tasks','Every executable node must have a task declaration');return true;
}
function validatePayload(payload){
 T.finiteJSON(payload);check(payload&&payload.format==='qdl-program'&&payload.version===1,'identity','$','Unsupported language profile');
 closed(payload,['format','version','name','registry','registryDigest','canonical','thought','task','design','repeats']);
 check(payload.registry===Registry.manifest.id&&payload.registryDigest===Registry.digest,'unsupported-registry','$.registry','Registry pin does not match this interpreter');
 check(payload.canonical==='qdl-json-1','identity','$.canonical','Unsupported canonical profile');text(payload.name,'$.name',120);check(payload.name.length>0,'type','$.name','Name is empty');
 check(Number.isInteger(payload.repeats)&&payload.repeats>=1&&payload.repeats<=8,'limit','$.repeats','Repeat count must be 1–8');
 const checked=C.validate(payload.task);check(T.canonical(checked.task)===T.canonical(payload.task),'identity','$.task','Source types must be normalized');validateThought(payload.thought,checked.task);
 try{D.validateBindings(payload.design,checked.task);}catch(e){fail('type','$.design',e.message);}return checked;
}
function build(input){
 T.finiteJSON(input);closed(input,['name','thought','task'],['design','repeats']);const task=C.validate(input.task).task;
 const thought=typeof input.thought==='string'?declaration(task,input.thought):copy(input.thought);
 const design=input.design?copy(input.design):D.create();
 const payload={format:'qdl-program',version:1,name:input.name,registry:Registry.manifest.id,registryDigest:Registry.digest,canonical:'qdl-json-1',thought,task,design,repeats:input.repeats??1};
 validatePayload(payload);const program=core().makePayloadProgram(payload,payload.repeats);admit(program);return program;
}
function compile(intent){
 T.finiteJSON(intent);closed(intent,['format','version','name','thought','inputs','steps','outputs'],['design','repeats']);check(intent.format==='qdl-intent'&&intent.version===1,'identity','$','Expected a QDL v1 intent');
 check(Array.isArray(intent.inputs)&&Array.isArray(intent.steps)&&intent.inputs.length+intent.steps.length<=64,'limit','$','At most 64 input/operation nodes');
 const nodes=intent.inputs.map((p,i)=>{closed(p,['id','type'],['name','value'],'$.inputs.'+i);check(Object.hasOwn(p,'value')!==Object.hasOwn(p,'name'),'type','$.inputs.'+i,'Supply exactly one literal value or runtime name');return {id:p.id,op:Object.hasOwn(p,'name')?'input':'literal',inputs:[],params:Object.hasOwn(p,'name')?{name:p.name}:{value:copy(p.value)},type:T.normalize(p.type)};});
 const pending=intent.steps.map((p,i)=>{closed(p,['id','op','inputs','params'],['type'],'$.steps.'+i);return copy(p);}),types=new Map(nodes.map(n=>[n.id,n.type]));
 while(pending.length){const index=pending.findIndex(n=>Array.isArray(n.inputs)&&n.inputs.every(k=>types.has(k)));check(index>=0,'cycle','$.steps','Unresolved or cyclic step references');const n=pending.splice(index,1)[0],type=n.type?T.normalize(n.type):C.inferNode(n,n.inputs.map(k=>types.get(k)));types.set(n.id,type);nodes.push({...n,type});}
 const task={format:'qdl-task',version:1,nodes,outputs:copy(intent.outputs)};
 let design=intent.design;if(!design){const generated=A.generateV1(task,0);design=D.create();design.anatomy=generated.anatomy;design.motion.gesture=generated.gesture;}
 return build({name:intent.name,thought:intent.thought,task,design,repeats:intent.repeats??1});
}
function findPayload(program){const terms=[program];while(terms.length){const t=terms.pop();if(!Array.isArray(t)||t[0]==='quote')continue;if(t[0]==='task'&&t[1]?.[0]==='quote')return t[1][1];if(t[0]==='run'&&t[1]?.[0]==='quote'){terms.push(t[1][1]);continue;}for(let i=1;i<t.length;i++)terms.push(t[i]);}return null;}
function isProgram(program){T.finiteJSON(program);return findPayload(program)?.format==='qdl-program';}

function admit(source){
 let program=source;
 if(typeof source==='string'){check(new TextEncoder().encode(source).length<=65536,'limit','$','Source exceeds 64 KiB');try{program=JSON.parse(source);}catch{fail('identity','$','Malformed source JSON');}}
 T.finiteJSON(program);check(Array.isArray(program),'identity','$','Expected constructor AST');
 // Locate the task only to obtain its candidate data. Exact constructor comparison
 // below excludes alternate control flow, unquoted tasks and mismatched copies.
 const candidate=findPayload(program);
 const checked=validatePayload(candidate);const rebuilt=core().makePayloadProgram(candidate,candidate.repeats),canonical=core().canon(program);
 check(canonical===core().canon(rebuilt),'identity','$','Expected the complete canonical constructor quine');if(typeof source==='string')check(source===canonical,'identity','$','Source JSON must be canonical; duplicate fields and alternate encodings refuse');
 return {program:copy(program),payload:copy(candidate),source:canonical,sourceHash:'ql_'+Crypto.sha256(canonical),ports:checked.ports,order:checked.order};
}
function verifyQuine(source){const admitted=admit(source),result=core().execute(admitted.program,{constructionOnly:true});check(result.emitted.length===1&&result.emitted[0]===admitted.source,'identity','$','Constructor failed exact source emission');return {source:result.emitted[0],sourceHash:admitted.sourceHash,constructorSteps:result.steps};}
function checkedBindings(ports,bindings){T.finiteJSON(bindings);check(bindings!==null&&typeof bindings==='object'&&!Array.isArray(bindings),'type','$.bindings','Bindings must be a record');for(const p of ports)check(Object.hasOwn(bindings,p.name),'missing-input','$.bindings.'+p.name,'Missing required input');closed(bindings,ports.map(p=>p.name));for(const p of ports)T.assert(bindings[p.name],p.type,'$.bindings.'+p.name);return copy(bindings);}
function numeric(value,integer=false){check(typeof value==='number'&&Number.isFinite(value),'nonfinite','$','Arithmetic overflow');if(integer)check(Number.isSafeInteger(value),'refinement','$','Safe integer arithmetic overflow');return value===0?0:value;}
function calculate(n,args,inputTypes,bindings){
 if(Object.hasOwn(VK.ARITY,n.op)){const natural=t=>t.kind==='number'&&t.integer===true&&(t.min??-Infinity)>=0;const value=VK.calculate(n.op,args,n.params,{bindings,arithmeticRefinement:n.op==='arithmetic'&&n.params.kind!=='div'&&inputTypes.every(natural)?'Nat':'N'});if(n.op==='arithmetic'&&n.params.kind!=='div'&&inputTypes.every(t=>t.integer===true))numeric(value,true);return value;}
 const t=inputTypes[0],integers=t?.kind==='array'&&t.element?.integer===true;
 if(['sum','mean'].includes(n.op)){check(n.op==='sum'||args[0].length>0,'refinement','$','Mean requires values');const sum=args[0].reduce((s,v)=>numeric(s+v,integers),0);return n.op==='sum'?sum:numeric(sum/args[0].length);}
 if(n.op==='map')return args[0].map(x=>numeric(n.params.kind==='square'?x*x:x*n.params.factor,integers&&Number.isSafeInteger(n.params.factor??1)));
 if(n.op==='weightedMean'){const [v,w]=args;check(v.length>0&&v.length===w.length&&w.every(x=>x>=0),'refinement','$','Weighted arrays must match with nonnegative weights');const mass=w.reduce((s,x)=>numeric(s+x,inputTypes[1].element.integer===true),0);check(mass>0,'refinement','$','Weight mass is zero');let sum=0;for(let i=0;i<v.length;i++){const product=numeric(v[i]*w[i],integers&&inputTypes[1].element.integer===true);sum=numeric(sum+product,integers&&inputTypes[1].element.integer===true);}return numeric(sum/mass);}
 const value=K.calculate(n.op,args,n.params);
 if(n.op==='schedule'&&inputTypes[0].element.fields.duration.integer===true){for(const job of value.jobs){numeric(job.start,true);numeric(job.end,true);}numeric(value.makespan,true);}
 return value;
}
function execute(source,bindings={}){
 const admitted=admit(source),payload=admitted.payload,inputs=checkedBindings(admitted.ports,bindings),proof=verifyQuine(admitted.program);
 const run={format:'qdl-run',version:1,sourceHash:admitted.sourceHash,registry:payload.registry,registryDigest:payload.registryDigest,inputHash:'qi_'+Crypto.sha256(T.canonical(inputs)),bindings:inputs,status:'completed',occurrences:[],emitted:[proof.source],constructorSteps:proof.constructorSteps};
 const nodes=new Map(payload.task.nodes.map(n=>[n.id,n]));
 for(let occurrence=0;occurrence<payload.repeats;occurrence++){
  const record={occurrence,status:'completed',outputs:[],effects:[],trace:[],diagnostic:null};run.occurrences.push(record);const values=new Map(),staged=[];let current=null;
  try{
   check(bytes(run)<=RUN_LIMIT-DIAGNOSTIC_RESERVE,'limit','$','Run budget exhausted before occurrence');
   for(const nodeId of admitted.order){current=nodes.get(nodeId);const args=current.inputs.map(k=>values.get(k)),value=calculate(current,args,current.inputs.map(k=>nodes.get(k).type),inputs);T.assert(value,current.type,'$.nodes.'+nodeId+'.result');
    const event={nodeId,op:current.op,inputs:copy(args),value:copy(value)};record.trace.push(event);
    if(bytes(run)>RUN_LIMIT-DIAGNOSTIC_RESERVE){record.trace.pop();fail('limit','$.nodes.'+nodeId,'Run trace budget exhausted');}
    values.set(nodeId,value);if(current.op==='action'&&value.status==='simulated')staged.push(copy(value));
   }
   record.outputs=payload.task.outputs.map(k=>copy(values.get(k)));record.effects=staged;
   if(bytes(run)>RUN_LIMIT-DIAGNOSTIC_RESERVE){record.outputs=[];record.effects=[];fail('limit','$','Run output/receipt budget exhausted');}
  }catch(e){record.outputs=[];record.effects=[];record.status='failed';record.diagnostic={code:(e.code||'refinement').slice(0,64),path:(e.path||'$').slice(0,256),nodeId:current?.id??null,occurrence,message:String(e.message||'Task failed').slice(0,512)};run.status='failed';break;}
 }
 check(bytes(run)<=RUN_LIMIT,'limit','$','Complete run exceeds 2 MiB');return run;
}
const api={build,compile,admit,isProgram,execute,verifyQuine,validatePayload,validateThought,declaration,registry:Registry.manifest,registryDigest:Registry.digest,RUN_LIMIT};
if(node)module.exports=api;root.QDLV1=api;
})(typeof globalThis!=='undefined'?globalThis:this);
