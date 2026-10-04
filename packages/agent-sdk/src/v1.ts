import {randomUUID,createHash} from 'node:crypto';
// @ts-expect-error shared interpreter module has no declarations
import V from '../../../qdl-v1.js';
// @ts-expect-error shared canonical type validator has no declarations
import T from '../../../qdl-v1-types.js';
// @ts-expect-error shared source codecs have no declarations
import Q from '../../../core.js';
// @ts-expect-error shared assembly sampler has no declarations
import A from '../../../anatomy.js';
// @ts-expect-error shared source-authored chroma has no declarations
import Chroma from '../../../chroma.js';
import {z} from 'zod';
import {IntentSchema,ArtifactSchema,ExecutionRecordSchema,RequestSchema,RunInputSchema,ReproduceInputSchema,RecoverySchema,SnapshotSchema,VerificationSchema,FrameInputSchema,FrameSchema} from './v1-schema.js';
import type {Artifact,Intent,ExecutionRecord,RecoveryInput,RunInput,ReproduceInput,SessionOptions,Descriptor,Request,Response,ResponseFor,TaggedResponse,Snapshot,ErrorDetail,Verification,Json,Frame,FrameOptions} from './v1-types.js';
export type * from './v1-types.js';
export {IntentSchema,ArtifactSchema,ExecutionRecordSchema,RequestSchema,RunSchema,ResultSchemas,ResponseSchema,SnapshotSchema,ErrorSchema,RunInputSchema,ReproduceInputSchema,RecoverySchema,VerificationSchema,DescriptorSchema,BindingsSchema,ValueTypeSchema,ThoughtSchema,CompileInputSchema,ArtifactInputSchema,DescribeInputSchema,TaggedResponseSchema,FrameSchema,FrameInputSchema,FrameOptionsSchema,HarmonicGenomeSchema,ColorGenomeSchema} from './v1-schema.js';
const ARTIFACT_BYTES=32*1024*1024,RECORD_BYTES=2*1024*1024,RECORDS_BYTES=64*1024*1024,SNAPSHOT_BYTES=128*1024*1024,RECEIPT_BYTES=32*1024*1024;
const clone=<A>(value:A):A=>structuredClone(value);
const bytes=(value:unknown)=>Buffer.byteLength(JSON.stringify(value));
const wellFormed=(text:string)=>!/[\uD800-\uDFFF]/u.test(text);
const hash=(text:string)=>createHash('sha256').update(text).digest('hex');
export class QdlError extends Error {
 constructor(public readonly code:string,message:string,public readonly path='$'){super(message.slice(0,2048));this.name='QdlError';}
 toJSON():ErrorDetail{return {code:this.code,message:this.message,path:this.path};}
}
function check(ok:unknown,code:string,message:string,path='$'):asserts ok {if(!ok)throw new QdlError(code,message,path);}
function wrap<A>(fn:()=>A):A {
 try{return fn();}catch(e){if(e instanceof QdlError)throw e;if(e instanceof z.ZodError){const issue=e.issues[0];throw new QdlError('invalid-input',issue?.message??'Invalid input',issue?.path.length?'$.'+issue.path.map(String).join('.'):'$');}const error=e as {code?:string;path?:string;message?:string};throw new QdlError(error.code??'invalid-input',error.message??'QDL operation failed',error.path??'$');}
}
/** Inspect data descriptors before schema parsers or serializers read values.
 * Parsed JSON is the wire boundary; hostile same-process proxies are not sandboxed. */
function inert(value:unknown,maxBytes:number):number {
 let visits=0;const stack:{value:unknown;depth:number;seen:Set<object>;path:string}[]=[{value,depth:0,seen:new Set(),path:'$'}];
 while(stack.length){const {value:v,depth,seen,path}=stack.pop()!;check(++visits<=4000000&&depth<=64,'resource-limit','JSON resource limit exceeded',path);
  if(v===null||typeof v==='boolean')continue;
  if(typeof v==='number'){check(Number.isFinite(v),'invalid-input','Expected finite number',path);continue;}
  if(typeof v==='string'){check(wellFormed(v),'invalid-input','Malformed Unicode',path);continue;}
  check(v&&typeof v==='object','invalid-input','Expected inert JSON data',path);check(!seen.has(v),'invalid-input','Cyclic JSON',path);
  const array=Array.isArray(v),proto=Object.getPrototypeOf(v);check(array?proto===Array.prototype:proto===Object.prototype||proto===null,'invalid-input','Expected native arrays or plain records',path);
  const keys=Object.keys(v);check(Reflect.ownKeys(v).length===keys.length+(array?1:0),'invalid-input','Hidden or symbol properties are forbidden',path);
  if(array)check(keys.length===v.length&&keys.every((k,i)=>k===String(i)),'invalid-input','Expected dense arrays',path);
  const next=new Set(seen).add(v);
  for(const key of keys){const p=path+'['+JSON.stringify(key)+']',d=Object.getOwnPropertyDescriptor(v,key);check(wellFormed(key)&&!['__proto__','prototype','constructor'].includes(key),'invalid-input','Unsafe property name',p);check(d&&'value'in d,'invalid-input','Accessors are forbidden',p);stack.push({value:d.value,depth:depth+1,seen:next,path:p});}
 }
 const size=bytes(value);check(size<=maxBytes,'resource-limit','JSON byte budget exceeded');return size;
}
function parse<A>(schema:z.ZodType<A>,value:unknown,maxBytes=4*1024*1024):A {inert(value,maxBytes);return wrap(()=>schema.parse(value));}
/** Snapshot traversal is bounded per row, then by aggregate bytes/counts. A
 * full legal session can exceed the ordinary request's four-million visits.
 * Export and import use this same boundary; neither evaluates historical tasks. */
function parseSnapshot(value:unknown):Snapshot {
 check(value&&typeof value==='object'&&!Array.isArray(value),'invalid-input','Expected snapshot record');
 const proto=Object.getPrototypeOf(value),keys=Object.keys(value),fields=['format','version','registry','registryDigest','artifacts','records','receipts'];
 check(proto===Object.prototype||proto===null,'invalid-input','Expected plain snapshot record');
 check(Reflect.ownKeys(value).length===keys.length&&keys.length===fields.length&&fields.every(k=>keys.includes(k)),'invalid-input','Unknown, hidden or missing snapshot fields');
 const selected:Record<string,unknown>={};for(const key of fields){const d=Object.getOwnPropertyDescriptor(value,key);check(d&&'value'in d,'invalid-input','Snapshot accessors are forbidden');selected[key]=d.value;}
 const header={...selected,artifacts:[],records:[],receipts:[]};parse(SnapshotSchema,header,65536);
 let total=bytes(header);
 const rows=[['artifacts',1024,131328,ARTIFACT_BYTES],['records',4096,RECORD_BYTES,RECORDS_BYTES],['receipts',4096,131328,RECEIPT_BYTES]] as const;
 for(const [field,maxCount,maxRowBytes,maxAggregate] of rows){
  const array=selected[field];check(Array.isArray(array)&&Object.getPrototypeOf(array)===Array.prototype,'invalid-input','Expected native snapshot row array');
  const rowKeys=Object.keys(array);check(array.length<=maxCount,'resource-limit','Snapshot row count exceeded');
  check(Reflect.ownKeys(array).length===rowKeys.length+1&&rowKeys.length===array.length&&rowKeys.every((k,i)=>k===String(i)),'invalid-input','Expected dense snapshot row array');
  let aggregate=0;for(let i=0;i<array.length;i++){
   const d=Object.getOwnPropertyDescriptor(array,String(i));check(d&&'value'in d,'invalid-input','Snapshot row accessors are forbidden');
   const size=inert(d.value,maxRowBytes);aggregate+=size;total+=size+(i?1:0);
   check(aggregate<=maxAggregate&&total<=SNAPSHOT_BYTES,'resource-limit','Snapshot aggregate byte budget exceeded');
  }
 }
 return wrap(()=>SnapshotSchema.parse(value));
}
const optionsSchema=z.strictObject({maxArtifacts:z.number().int().min(1).max(1024).optional(),maxRecords:z.number().int().min(1).max(4096).optional(),maxRecordBytes:z.number().int().min(1).max(RECORD_BYTES).optional(),maxRecordsBytes:z.number().int().min(1).max(RECORDS_BYTES).optional()});
type ExecutionRequest=Extract<Request,{operation:'run'|'reproduce'}>;
/** Bounded memory session for QDL v1. No external authority or durability.
 * Computed failures are retained records; malformed requests are typed refusals. */
export class Session {
 #artifacts=new Map<string,Artifact>();#records=new Map<string,ExecutionRecord>();
 #receipts=new Map<string,{payload:string;request:ExecutionRequest;recordId:string}>();
 #bodies=new Map<string,unknown>();
 #artifactBytes=0;#recordBytes=0;#receiptBytes=0;
 readonly #limits:Required<SessionOptions>;
 constructor(options:SessionOptions={}){const selected=parse(optionsSchema,options,1024);this.#limits={maxArtifacts:selected.maxArtifacts??128,maxRecords:selected.maxRecords??256,maxRecordBytes:selected.maxRecordBytes??RECORD_BYTES,maxRecordsBytes:selected.maxRecordsBytes??RECORDS_BYTES};}
 describe():Descriptor {return {format:'qdl-session',version:1,registry:V.registry.id,registryDigest:V.registryDigest,effects:'simulation-only',persistence:'memory',limits:{artifacts:this.#limits.maxArtifacts,artifactBytes:ARTIFACT_BYTES,records:this.#limits.maxRecords,recordBytes:this.#limits.maxRecordBytes,recordsBytes:this.#limits.maxRecordsBytes,receipts:this.#limits.maxRecords,snapshotBytes:SNAPSHOT_BYTES}};}
 compile(intent:Intent):Artifact {const selected=parse(IntentSchema,intent,131072);return this.#admit(wrap(()=>V.compile(selected)));}
 #prepare(source:unknown):Artifact {const admitted=wrap(()=>V.admit(source));return wrap(()=>ArtifactSchema.parse({...admitted,id:admitted.sourceHash,harmonics:Q.encode(admitted.program),colors:Q.encodeColors(admitted.program)}));}
 #admit(source:unknown):Artifact {
  const artifact=this.#prepare(source),prior=this.#artifacts.get(artifact.id);if(prior)return clone(prior);
  check(this.#artifacts.size<this.#limits.maxArtifacts,'resource-limit','Artifact store is full');const total=this.#artifactBytes+bytes(artifact);check(total<=ARTIFACT_BYTES,'resource-limit','Artifact store exceeds 32 MiB');
  const returned=clone(artifact),next=new Map(this.#artifacts);next.set(artifact.id,artifact);this.#artifacts=next;this.#artifactBytes=total;return returned;
 }
 #lookup(id:string):Artifact {check(typeof id==='string','invalid-input','Expected artifact ID');const artifact=this.#artifacts.get(id);check(artifact,'unknown-artifact','Artifact is not in this session');return artifact;}
 inspect(artifactId:string):Artifact {return clone(this.#lookup(artifactId));}
 verify(artifactId:string):Verification {const artifact=this.#lookup(artifactId);return clone(wrap(()=>VerificationSchema.parse(V.verifyQuine(artifact.program))));}
 recover(recovery:RecoveryInput):Artifact {const selected=parse(RecoverySchema,recovery);const source='source'in selected?selected.source:'harmonics'in selected?wrap(()=>Q.decode(selected.harmonics)):wrap(()=>Q.decodeColors(selected.colors));return this.#admit(source);}
 frame(artifactId:string,phase:number,options:FrameOptions={}):Frame {
  const selected=parse(FrameInputSchema,{artifactId,phase,options},1024),artifact=this.#lookup(selected.artifactId),design=artifact.payload.design;
  check(design.anatomy?.model==='assembly'&&design.motion.gesture,'unsupported-frame','Source has no supported assembly anatomy and gesture');
  const cached=this.#bodies.get(artifact.id),nodes=artifact.payload.task.nodes;
  const body=cached??wrap(()=>A.compile(design.anatomy,nodes,design.motion.gesture)),sample=wrap(()=>A.frame(body,selected.phase,selected.options??{}));
  const frame=wrap(()=>FrameSchema.parse({points:Array.from(sample.points),normals:Array.from(sample.normals),owners:Array.from(sample.owners),ridges:clone(sample.ridges),nodeIds:nodes.map(n=>n.id),nodeColors:nodes.map((_,i)=>Chroma.colorFor({design,nodes},i)),nodeRoles:nodes.map(n=>Chroma.role(n.op))}));
  if(!cached){if(this.#bodies.size>=32)this.#bodies.delete(this.#bodies.keys().next().value!);this.#bodies.set(artifact.id,body);}return frame;
 }
 run(input:RunInput):ExecutionRecord {const selected=parse(RunInputSchema,input,131072);return this.#execute({operation:'run',...selected});}
 reproduce(input:ReproduceInput):ExecutionRecord {const selected=parse(ReproduceInputSchema,input,1024);return this.#execute({operation:'reproduce',...selected});}
 #execute(request:ExecutionRequest):ExecutionRecord {
  const payload=Q.canon(request) as string,saved=this.#receipts.get(request.requestId);
  if(saved){check(saved.payload===payload,'request-conflict','Request key already binds another complete payload','$.requestId');return clone(this.#records.get(saved.recordId)!);}
  // Reserve a non-evicting ledger slot before even bounded evaluation.
  check(this.#receipts.size<this.#limits.maxRecords&&this.#records.size<this.#limits.maxRecords,'resource-limit','Run/receipt store is full');
  const receiptSize=bytes(request)+256;check(this.#receiptBytes+receiptSize<=RECEIPT_BYTES,'resource-limit','Request receipt store exceeds 32 MiB');
  const artifact=this.#lookup(request.artifactId);let parent:ExecutionRecord|undefined;
  if(request.operation==='reproduce'){parent=this.#records.get(request.recordId);check(parent,'unknown-record','Execution record is not in this session');check(parent.artifactId===artifact.id&&parent.result.sourceHash===artifact.sourceHash,'stale-record','Record belongs to another source');}
  const inputs=request.operation==='run'?request.inputs:parent!.result.bindings,result=wrap(()=>V.execute(artifact.program,inputs));
  if(parent)check(Q.canon(result)===Q.canon(parent.result),'stale-record','Fresh execution differs from retained parent result');
  const proposed:ExecutionRecord={id:'run_'+randomUUID(),artifactId:artifact.id,requestId:request.requestId,result,evidence:'retained',...(parent?{parentRecordId:parent.id}:{})};
  const record=wrap(()=>ExecutionRecordSchema.parse(proposed)),recordSize=bytes(record);check(recordSize<=this.#limits.maxRecordBytes,'resource-limit','Execution record exceeds byte budget');check(this.#recordBytes+recordSize<=this.#limits.maxRecordsBytes,'resource-limit','Execution store exceeds aggregate byte budget');
  const returned=clone(record),receipt={payload,request:clone(request),recordId:record.id},nextRecords=new Map(this.#records),nextReceipts=new Map(this.#receipts);
  nextRecords.set(record.id,record);nextReceipts.set(request.requestId,receipt);
  // Validation, serialization and detached-return allocation precede mutation.
  // No await, callbacks or external actions occur in this commit.
  this.#records=nextRecords;this.#receipts=nextReceipts;this.#recordBytes+=recordSize;this.#receiptBytes+=receiptSize;return returned;
 }
 dispatch<R extends Request>(request:R):ResponseFor<R>;
 dispatch(request:Request):Response {
  const selected=parse(RequestSchema,request);
  switch(selected.operation){case 'describe':return this.describe();case 'compile':return this.compile(selected.intent);case 'inspect':return this.inspect(selected.artifactId);case 'verify':return this.verify(selected.artifactId);case 'recover':return this.recover(selected.recovery);case 'frame':return this.frame(selected.artifactId,selected.phase,selected.options);case 'run':return this.run({artifactId:selected.artifactId,requestId:selected.requestId,inputs:selected.inputs});case 'reproduce':return this.reproduce({artifactId:selected.artifactId,recordId:selected.recordId,requestId:selected.requestId});}
 }
 exchange(request:Request):TaggedResponse {const selected=parse(RequestSchema,request);return {operation:selected.operation,result:this.dispatch(selected)} as TaggedResponse;}
 exportSnapshot():Snapshot {
  const snapshot:Snapshot={format:'qdl-session-snapshot',version:1,registry:V.registry.id,registryDigest:V.registryDigest,artifacts:[...this.#artifacts.values()].map(a=>({id:a.id,source:a.source})),records:[...this.#records.values()].map(clone),receipts:[...this.#receipts.values()].map(r=>({request:clone(r.request),recordId:r.recordId}))};
  return parseSnapshot(snapshot);
 }
 /** Passive restoration into a fresh memory session. Caller JSON cannot attest
  * historical execution: all imported records are marked asserted. */
 static fromSnapshot(snapshot:Snapshot,options:SessionOptions={}):Session {
  const selected=parseSnapshot(snapshot),session=new Session(options);check(selected.registry===V.registry.id&&selected.registryDigest===V.registryDigest,'unsupported-registry','Snapshot registry pin differs from this interpreter');
  for(const row of selected.artifacts){check(!session.#artifacts.has(row.id),'invalid-input','Duplicate snapshot artifact');const artifact=session.#admit(row.source);check(artifact.id===row.id,'invalid-input','Snapshot source identity mismatch');}
  check(selected.records.length<=session.#limits.maxRecords,'resource-limit','Snapshot exceeds record count budget');
  for(const imported of selected.records){check(!session.#records.has(imported.id),'invalid-input','Duplicate snapshot execution record');const artifact=session.#lookup(imported.artifactId),run=imported.result;
   check(run.sourceHash===artifact.id&&run.registry===artifact.payload.registry&&run.registryDigest===artifact.payload.registryDigest&&run.emitted[0]===artifact.source,'invalid-input','Snapshot run/source profile mismatch');
   wrap(()=>T.finiteJSON(run.bindings));const names=artifact.ports.map(p=>p.name);check(Object.keys(run.bindings).length===names.length&&names.every(k=>Object.hasOwn(run.bindings,k)),'invalid-input','Snapshot bindings do not match source ports');for(const port of artifact.ports)wrap(()=>T.assert(run.bindings[port.name],port.type));
   check(run.inputHash==='qi_'+hash(wrap(()=>T.canonical(run.bindings))),'invalid-input','Snapshot binding digest mismatch');
   const record=clone(imported);record.evidence='asserted';const size=bytes(record);check(size<=session.#limits.maxRecordBytes&&session.#recordBytes+size<=session.#limits.maxRecordsBytes,'resource-limit','Snapshot record byte budget exceeded');session.#records.set(record.id,record);session.#recordBytes+=size;
  }
  const preceding=new Set<string>();for(const record of session.#records.values()){if(record.parentRecordId){const parent=session.#records.get(record.parentRecordId);check(parent&&preceding.has(parent.id)&&parent.artifactId===record.artifactId,'invalid-input','Snapshot parent record must precede child and match source');}preceding.add(record.id);}
  check(selected.receipts.length===selected.records.length,'invalid-input','Snapshot receipts must cover every run');const covered=new Set<string>();
  for(const row of selected.receipts){const request=row.request,record=session.#records.get(row.recordId);check(record&&!covered.has(row.recordId)&&!session.#receipts.has(request.requestId),'invalid-input','Duplicate or missing snapshot request receipt');check(record.requestId===request.requestId&&record.artifactId===request.artifactId,'invalid-input','Snapshot request/record identity mismatch');
   if(request.operation==='run')check(Q.canon(request.inputs)===Q.canon(record.result.bindings)&&!record.parentRecordId,'invalid-input','Snapshot run inputs mismatch');else check(request.recordId===record.parentRecordId,'invalid-input','Snapshot reproduction parent mismatch');
   const size=bytes(request)+256;check(session.#receiptBytes+size<=RECEIPT_BYTES,'resource-limit','Snapshot receipt byte budget exceeded');session.#receipts.set(request.requestId,{payload:Q.canon(request),request:clone(request),recordId:record.id});session.#receiptBytes+=size;covered.add(row.recordId);
  }
  return session;
 }
}
/** Standalone verification evaluates only the constructor, never task ports. */
export function verifyQuine(source:string|Json[]):Verification {inert(source,131072);return clone(wrap(()=>VerificationSchema.parse(V.verifyQuine(source))));}
export const sourceOnly=Object.freeze({verifyQuine,encode(source:string|Json[]):{harmonics:Artifact['harmonics'];colors:Artifact['colors']}{inert(source,131072);const admitted=wrap(()=>V.admit(source));return {harmonics:wrap(()=>Q.encode(admitted.program)),colors:wrap(()=>Q.encodeColors(admitted.program))};}});
export {QdlError as V1Error};
