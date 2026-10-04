// @ts-expect-error shared experimental collaboration module has no declarations
import O from '../../../qdl-v1-offspring.js';
// @ts-expect-error canonical candidate serialization
import Q from '../../../core.js';
import {Session,QdlError} from './v1.js';
import type {Artifact,Json,Payload,Task,Thought,Port,ValueType} from './v1-types.js';
export type Recipe={kind:'compose';donorOutput:string;recipientInput:string}|{kind:'mate';donorNode:string;replaceNode:string}|{kind:'merge'}|{kind:'body';base:0|1};
export interface ParentPin {sourceHash:string;registry:string;registryDigest:string;canonical:'qdl-json-1'}
export interface NodeMapping {parent:0|1|'generated';parentNodeId?:string;nodeId:string}
export interface PortMapping {parent:0|1;parentName:string;name:string;nodeId:string}
export interface Seam {donorNode:string;recipientNode:string;type:ValueType;integrationNode:string}
export interface Diagnostic {code:string;path:string;message:string}
export type Compatibility={status:'compatible';parents:[ParentPin,ParentPin];recipe:Recipe;task:Task;nodeMappings:NodeMapping[];portMappings:PortMapping[];guardNodes:string[];seam:Seam|null;ports:Port[];diagnostics:Diagnostic[]}|{status:'incompatible';diagnostics:Diagnostic[]};
export interface ConstructionOptions {recipe:Recipe;nonce:number;name:string;thought?:Thought}
export interface Selection {parents:[string,string];recipe:Recipe}
export interface PreviewInput extends Selection {nonce:number;name:string;thought?:Thought}
export interface Candidate {
 format:'qdl-v1-candidate-experimental';candidateId:string;derivationId:string;childSourceHash:string;
 child:{program:Json[];payload:Payload;source:string;sourceHash:string;ports:Port[];order:string[]};
 classification:'parallel-report'|'body-only'|'causal-integration';
 changes:{sourceChanged:boolean;taskSyntaxChanged:boolean;bodyChanged:boolean};diagnostics:Diagnostic[];
 lineage:{format:'qdl-v1-derivation-experimental';id:string;policy:string;candidateId:string;childSourceHash:string;
  construction:ConstructionOptions&{parents:[ParentPin,ParentPin]};classification:string;
  changes:Candidate['changes'];nodeMappings:NodeMapping[];portMappings:PortMapping[];seam:Seam|null;
  heredity:Json;evidence:'replayed-construction'};
}
export type Preview={status:'ready';candidate:Candidate}|{status:'rejected';diagnostics:Diagnostic[]};
export interface Admission {artifact:Artifact;candidateId:string;derivationId:string;evidence:'library-source-admitted'}
/** This add-on stores no collaboration ledger/world and supplies no authority. */
function inert(value:unknown,maxBytes=2*1024*1024):void {
 let visits=0;const stack:{value:unknown;depth:number;seen:Set<object>}[]=[{value,depth:0,seen:new Set()}];
 while(stack.length){const {value:v,depth,seen}=stack.pop()!;if(++visits>400000||depth>64)throw new QdlError('resource-limit','Collaboration JSON resource budget exceeded');if(v===null||typeof v==='string'||typeof v==='boolean')continue;if(typeof v==='number'){if(!Number.isFinite(v))throw new QdlError('invalid-input','Expected finite JSON');continue;}if(!v||typeof v!=='object'||seen.has(v))throw new QdlError('invalid-input','Expected acyclic JSON');const array=Array.isArray(v),proto=Object.getPrototypeOf(v);if(array?proto!==Array.prototype:proto!==Object.prototype&&proto!==null)throw new QdlError('invalid-input','Expected plain JSON');const keys=Object.keys(v);if(Reflect.ownKeys(v).length!==keys.length+(array?1:0)||array&&(keys.length!==v.length||!keys.every((k,i)=>k===String(i))))throw new QdlError('invalid-input','Hidden/symbol/sparse data is forbidden');const next=new Set(seen).add(v);for(const key of keys){const d=Object.getOwnPropertyDescriptor(v,key);if(!d||!('value'in d)||['__proto__','constructor','prototype'].includes(key))throw new QdlError('invalid-input','Accessors and unsafe keys are forbidden');stack.push({value:d.value,depth:depth+1,seen:next});}}
 if(Buffer.byteLength(JSON.stringify(value))>maxBytes)throw new QdlError('resource-limit','Collaboration JSON byte budget exceeded');
}
function closed(value:unknown,required:string[],optional:string[]=[]):asserts value is Record<string,unknown>{inert(value);if(!value||typeof value!=='object'||Array.isArray(value)||required.some(k=>!Object.hasOwn(value,k))||Object.keys(value).some(k=>!required.includes(k)&&!optional.includes(k)))throw new QdlError('invalid-input','Unknown or missing collaboration fields');}
function wrap<A>(fn:()=>A):A {try{return fn();}catch(e){if(e instanceof QdlError)throw e;const error=e as {code?:string;path?:string;message?:string};throw new QdlError(error.code??'offspring-refused',error.message??'Collaboration refused',error.path??'$');}}
function sources(session:Session,ids:unknown):[string,string]{if(!Array.isArray(ids)||ids.length!==2||ids.some(id=>typeof id!=='string'))throw new QdlError('invalid-input','Expected two ordered session artifact IDs');return ids.map(id=>session.inspect(id).source) as [string,string];}
export function analyze(session:Session,input:Selection):Compatibility {closed(input,['parents','recipe']);return structuredClone(wrap(()=>O.compatibility(sources(session,input.parents),input.recipe)));}
export function preview(session:Session,input:PreviewInput):Preview {
 closed(input,['parents','recipe','nonce','name'],['thought']);const parents=sources(session,input.parents);
 try{return {status:'ready',candidate:structuredClone(wrap(()=>O.build(parents,{recipe:input.recipe,nonce:input.nonce,name:input.name,...(Object.hasOwn(input,'thought')?{thought:input.thought}:{})}))) };}catch(e){if(!(e instanceof QdlError))throw e;return {status:'rejected',diagnostics:[e.toJSON()]};}
}
/** Exact rebuild/review check before passive library admission; never social birth. */
export function admit(session:Session,candidate:Candidate):Admission {
 closed(candidate,['format','candidateId','derivationId','childSourceHash','child','classification','changes','diagnostics','lineage']);if(candidate.format!=='qdl-v1-candidate-experimental')throw new QdlError('invalid-input','Expected complete experimental candidate');closed(candidate.lineage,['format','id','policy','candidateId','childSourceHash','construction','classification','changes','nodeMappings','portMappings','seam','heredity','evidence']);const construction=candidate.lineage.construction;closed(construction,['parents','recipe','nonce','name'],['thought']);if(!Array.isArray(construction.parents)||construction.parents.length!==2)throw new QdlError('invalid-input','Expected two exact construction parent pins');for(const pin of construction.parents)closed(pin,['sourceHash','registry','registryDigest','canonical']);
 const parents=sources(session,construction.parents.map(p=>p.sourceHash)),options={recipe:construction.recipe,nonce:construction.nonce,name:construction.name,...(Object.hasOwn(construction,'thought')?{thought:construction.thought}:{})},rebuilt=wrap(()=>O.build(parents,options)) as Candidate;
 if(Q.canon(rebuilt)!==Q.canon(candidate))throw new QdlError('stale-candidate','Candidate differs from exact rebuilt construction');
 return {artifact:session.recover({source:rebuilt.child.source}),candidateId:rebuilt.candidateId,derivationId:rebuilt.derivationId,evidence:'library-source-admitted'};
}
export const policy:string=O.POLICY;
