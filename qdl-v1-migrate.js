(function(root){
'use strict';
const node=typeof module!=='undefined'&&module.exports,V=node?require('./qdl-v1.js'):root.QDLV1,T=node?require('./qdl-v1-types.js'):root.QDLV1Types,Q=node?require('./core.js'):root.Quinelings,Crypto=node?require('./ranch-crypto.js'):root.RanchCrypto;
const clone=x=>JSON.parse(JSON.stringify(x));
function check(ok,code,path,message){if(!ok){const e=new Error(message);e.code=code;e.path=path;throw e;}}
function closed(x,required,optional=[],path='$'){check(x&&typeof x==='object'&&!Array.isArray(x),'type',path,'Expected record');for(const k of required)check(Object.hasOwn(x,k),'missing',path+'.'+k,'Missing field');for(const k of Object.keys(x))check(required.includes(k)||optional.includes(k),'unknown-field',path+'.'+k,'Unknown field');}
/** Explicit, passive conversion. Authored types and thought are mandatory: source recovery cannot invent them. */
function migrateLegacy(input){
 check(input!==null&&typeof input==='object'&&!Array.isArray(input),'type','$','Expected migration request');
 const descriptors=Object.getOwnPropertyDescriptors(input);check(Object.getPrototypeOf(input)===Object.prototype||Object.getPrototypeOf(input)===null,'type','$','Expected plain migration request');check(Reflect.ownKeys(descriptors).every(k=>typeof k==='string'&&Object.hasOwn(descriptors[k],'value')&&descriptors[k].enumerable),'type','$','Migration request must contain data fields');
 const rest=Object.fromEntries(Object.entries(descriptors).filter(([k])=>k!=='source').map(([k,d])=>[k,d.value]));T.finiteJSON(rest);
 closed(input,['source','registryDigest','name','thought','types','ports','evidenceClaims']);
 closed(input.thought,['observations','evidence','goals','decisions','plans','tasks'],[],'$.thought');
 check(input.registryDigest===V.registryDigest,'unsupported-registry','$.registryDigest','Migration target differs from this interpreter');check(typeof input.source==='string','type','$.source','Expected legacy source JSON');check(new TextEncoder().encode(input.source).length<=65536,'limit','$.source','Legacy source exceeds 64 KiB');
 let old;try{old=JSON.parse(input.source);}catch(e){check(false,'identity','$.source','Malformed source JSON');}T.finiteJSON(old);
 check(!V.isProgram(old),'profile-mismatch','$.source','Migration requires the legacy task profile');
 const desc=Q.describe(old),graph=desc.graph;
 check(graph?.version===1&&graph.nodes?.length>0,'profile-mismatch','$.source','Only legacy task constructors can migrate');
 const oldSource=Q.canon(old);check(oldSource===Q.canon(Q.makeTaskProgram(graph,desc.repeats,desc.design)),'identity','$.source','Legacy source must match its ordinary task constructor');
 const ids=graph.nodes.map(n=>n.id);closed(input.types,ids,[],'$.types');closed(input.ports,[],ids,'$.ports');closed(input.evidenceClaims,[],graph.nodes.filter(n=>n.op==='evidence').map(n=>n.id),'$.evidenceClaims');
 const changes=['Strict typed invocation, finite checked arithmetic, occurrence-atomic simulated effects and bounded structured failures replace experimental legacy evaluation.'],mapping=[];
 const nodes=graph.nodes.map(n=>{
  const out={id:n.id,op:n.op,inputs:clone(n.inputs),params:clone(n.params),type:T.normalize(input.types[n.id],'$.types.'+n.id)};
  if(Object.hasOwn(input.ports,n.id)){
   check(n.op==='literal','migration','$.ports.'+n.id,'Only an explicitly selected literal becomes a runtime input');T.assert(n.params.value,out.type,'$.types.'+n.id);
   out.op='input';out.params={name:input.ports[n.id]};mapping.push({nodeId:n.id,kind:'runtime-port',name:input.ports[n.id]});changes.push('Literal '+n.id+' becomes required runtime port '+input.ports[n.id]+'.');
  }else mapping.push({nodeId:n.id,kind:n.op==='literal'?'constant':'retained-operation'});
  if(n.op==='evidence'){
   check(Object.hasOwn(input.evidenceClaims,n.id),'missing','$.evidenceClaims.'+n.id,'Legacy evidence needs an explicit claim');out.params={claim:input.evidenceClaims[n.id]};changes.push('Evidence '+n.id+' uses the explicitly authored claim and legacy first-report-per-source policy.');
  }
  return out;
 });
 const program=V.build({name:input.name,thought:input.thought,task:{format:'qdl-task',version:1,nodes,outputs:clone(graph.outputs)},design:desc.design,repeats:desc.repeats}),admitted=V.admit(program);
 return {format:'qdl-migration-preview',version:1,legacySource:oldSource,legacySourceHash:'ql_'+Crypto.sha256(oldSource),targetRegistryDigest:V.registryDigest,mapping,semanticChanges:changes,artifact:admitted,evidence:'authored-conversion',executed:false};
}
const api=Object.freeze({migrateLegacy});if(node)module.exports=api;root.QDLV1Migration=api;
})(typeof globalThis!=='undefined'?globalThis:this);
