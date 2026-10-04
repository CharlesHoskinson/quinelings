import {createHash, randomUUID} from 'node:crypto';
// Shared browser/interpreter modules are bundled into the distributable. No
// filesystem oracle or host-code evaluator is used to execute program source.
// @ts-expect-error shared JavaScript runtime has no declaration file
import Q from '../../../core.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import T from '../../../thought.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import A from '../../../anatomy.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import D from '../../../qdl.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import K from '../../../kernels.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import Chroma from '../../../chroma.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import O from '../../../offspring.js';
// @ts-expect-error shared JavaScript runtime has no declaration file
import W from '../../../ranch-world.js';
import type {OffspringInput,OffspringCandidate,OffspringPreview,OffspringFrameInput,OffspringFrameResult,AdmissionInput,AdmissionResult,Derivation,LineageInput,LineageResult,AnnotationInput,WorldConfig,World,WorldCommandInput,WorldCommandResult} from './ranch-types.js';
import type {Artifact,Intent,ParseResult,CreationOptions,CreationResult,ExecutionRecord,RecoveryInput,Frame,FrameOptions,Request,Response,ResponseFor,TaggedResponse,ProposalProvider,Graph,Json} from './types.js';
export type * from './types.js';
export type ErrorCode='invalid-input'|'invalid-intent'|'source-budget'|'invalid-source'|'unknown-artifact'|'unknown-record'|'stale-record'|'resource-limit'|'execution-failed'|'cancelled'|'metadata-conflict'|'invalid-offspring'|'stale-state'|'unknown-world';
export class QuinelingError extends Error {
  constructor(public readonly code:ErrorCode, message:string, public readonly path='$') {super(message);this.name='QuinelingError';}
  toJSON(){return {code:this.code,message:this.message,path:this.path};}
}
const copy=<V>(value:V):V=>structuredClone(value);
function check(ok:unknown,code:ErrorCode,message:string,path='$'):asserts ok {if(!ok)throw new QuinelingError(code,message,path);}
/** Validate inert, finite JSON before cloning or evaluating property values. */
function inert(value:unknown,limit=2*1024*1024):void {
  let visits=0;
  function visit(x:unknown,depth:number,seen:Set<object>,path:string):void {
    check(++visits<=400000&&depth<=64,'invalid-input','JSON resource limit exceeded',path);
    if(x===null||typeof x==='boolean'||typeof x==='string')return;
    if(typeof x==='number'){check(Number.isFinite(x),'invalid-input','Expected finite JSON numbers',path);return;}
    check(x&&typeof x==='object','invalid-input','Expected JSON data',path);
    check(!seen.has(x),'invalid-input','Cyclic JSON data',path);
    check(Array.isArray(x)?Object.getPrototypeOf(x)===Array.prototype:Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null,'invalid-input','Expected native JSON arrays or plain records',path);
    const keys=Object.keys(x),descriptors=Object.getOwnPropertyDescriptors(x);
    check(Reflect.ownKeys(x).length===keys.length+(Array.isArray(x)?1:0),'invalid-input','Hidden or symbol properties are not JSON',path);
    if(Array.isArray(x))check(keys.length===x.length&&keys.every((k,i)=>k===String(i)),'invalid-input','Expected dense JSON arrays',path);
    const next=new Set(seen).add(x);
    for(const key of keys){const childPath=Array.isArray(x)?`${path}[${key}]`:/^[A-Za-z_$][\w$]*$/.test(key)?`${path}.${key}`:`${path}[${JSON.stringify(key)}]`;check(!['__proto__','constructor','prototype'].includes(key),'invalid-input','Unsafe property name',childPath);const d=descriptors[key];check(d&&'value'in d,'invalid-input','Accessors are not JSON',childPath);visit(d.value,depth+1,next,childPath);}
  }
  visit(value,0,new Set(),'$');
  check(Buffer.byteLength(JSON.stringify(value))<=limit,'invalid-input','JSON byte budget exceeded');
}
function fields(value:unknown,required:string[],optional:string[]=[]):asserts value is Record<string,unknown> {
  check(value!==null&&typeof value==='object'&&!Array.isArray(value),'invalid-input','Expected record');
  check(required.every(k=>Object.hasOwn(value,k))&&Object.keys(value).every(k=>required.includes(k)||optional.includes(k)),'invalid-input','Unknown or missing fields');
}
function stripOptional(value:unknown,names:string[]):Record<string,unknown> {
  check(value!==null&&typeof value==='object'&&!Array.isArray(value),'invalid-input','Expected options record');
  check(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'invalid-input','Expected plain options');
  const keys=Object.keys(value);check(Reflect.ownKeys(value).length===keys.length,'invalid-input','Hidden or symbol options are not JSON');
  const entries=keys.map(key=>{const d=Object.getOwnPropertyDescriptor(value,key);check(d&&'value'in d,'invalid-input','Accessors are not JSON');return [key,d.value] as const;});
  return Object.fromEntries(entries.filter(([key,v])=>!(v===undefined&&names.includes(key))));
}
function options(value:CreationOptions={}):CreationOptions {
  value=stripOptional(value,['seed','repeats']);inert(value);fields(value,[],['seed','repeats']);
  if(value.seed!==undefined)check(typeof value.seed==='number'&&Number.isInteger(value.seed)&&value.seed>=0&&value.seed<=4294967295,'invalid-input','Seed must be uint32');
  if(value.repeats!==undefined)check(typeof value.repeats==='number'&&Number.isInteger(value.repeats)&&value.repeats>=1&&value.repeats<=8,'invalid-input','Repeats must be 1–8');
  return value;
}
function wrap<V>(code:ErrorCode,fn:()=>V):V {try{return fn();}catch(e){if(e instanceof QuinelingError)throw e;const err=e as Error&{path?:string;code?:string};const preserved=err?.code==='source-budget'?'source-budget':code;throw new QuinelingError(preserved,err?.message||String(e),err?.path||'$');}}
function sourceId(source:string):string {return 'ql_'+createHash('sha256').update(source).digest('hex');}
function ranchWrap<V>(fn:()=>V):V {try{return fn();}catch(e){if(e instanceof QuinelingError)throw e;const err=e as Error&{code?:string;path?:string};const code:ErrorCode=err.code==='capacity'||err.code==='candidate-budget'||err.code==='lineage-budget'?'resource-limit':err.code==='source-budget'?'source-budget':err.code==='stale'||err.code==='parent-pin'?'stale-state':err.code==='invalid-input'?'invalid-input':'invalid-offspring';throw new QuinelingError(code,err.message||String(e),err.path||'$');}}
/** A bounded in-memory agent session. All current effects are local simulations. */
export class Runtime {
  #artifacts=new Map<string,Artifact>();
  #records=new Map<string,ExecutionRecord>();
  #artifactBytes=0;
  #world:World|null=null;
  #derivations=new Map<string,Derivation>();
  #admissions=new Map<string,{payload:string;result:AdmissionResult}>();
  #derivationBytes=0;
  #bodies=new Map<string,unknown>();
  readonly #maxArtifacts:number;
  readonly #maxRecords:number;
  constructor(config:{maxArtifacts?:number;maxRecords?:number}={}){
    config=stripOptional(config,['maxArtifacts','maxRecords']);inert(config);fields(config,[],['maxArtifacts','maxRecords']);
    this.#maxArtifacts=config.maxArtifacts??128;this.#maxRecords=config.maxRecords??256;
    check(Number.isInteger(this.#maxArtifacts)&&this.#maxArtifacts>=1&&this.#maxArtifacts<=1024,'invalid-input','maxArtifacts must be 1–1024');
    check(Number.isInteger(this.#maxRecords)&&this.#maxRecords>=1&&this.#maxRecords<=4096,'invalid-input','maxRecords must be 1–4096');
  }
  parse(thought:string):ParseResult {
    check(typeof thought==='string'&&thought.length<=16384,'invalid-input','Thought must be a string of at most 16384 characters');
    return copy(T.parse(thought));
  }
  compile(intent:Intent,config:CreationOptions={}):Artifact {return this.#build(intent,config);}
  #build(intent:Intent,config:CreationOptions={},sourceMap?:Artifact['sourceMap']):Artifact {
    intent=stripOptional(intent,['assumptions']) as unknown as Intent;inert(intent);check(Buffer.byteLength(Q.canon(intent))<=131072,'resource-limit','Intent exceeds 128 KiB','$.intent');const opts=options(config);
    return wrap('invalid-intent',()=>{
      const compiled=T.compile(intent),seed=opts.seed??createHash('sha256').update(Q.canon(compiled.graph)).digest().readUInt32BE(0);
      if(sourceMap){check(sourceMap.length<=128,'invalid-input','Source map exceeds 128 clauses');const ids=new Set(compiled.graph.nodes.map((n:{id:string})=>n.id));for(const m of sourceMap){fields(m,['nodeId','clause'],['start','end']);check(typeof m.nodeId==='string'&&ids.has(m.nodeId)&&typeof m.clause==='string'&&m.clause.length<=16384,'invalid-input','Source map must name actual operations');if(m.start!==undefined||m.end!==undefined)check(typeof m.start==='number'&&typeof m.end==='number'&&Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end>=m.start&&m.end<=intent.thought.length,'invalid-input','Source map span is outside thought');}}
      const generated=A.generate(compiled.graph,seed),design=D.create();design.anatomy=generated.anatomy;design.motion.gesture=generated.gesture;
      const program=Q.makeTaskProgram(compiled.graph,opts.repeats??1,design);
      return this.#admit(program,{intent:copy(intent),contract:compiled.contract,sourceMap:sourceMap??compiled.sourceMap});
    });
  }
  create(thought:string,config:CreationOptions={}):CreationResult {
    options(config);const parsed=this.parse(thought);
    if(parsed.status!=='supported')return {status:parsed.status,diagnostics:parsed.diagnostics,assumptions:parsed.assumptions};
    check(parsed.intent,'invalid-intent','Supported proposal has no intent');
    const artifact=this.#build(parsed.intent,config,parsed.sourceMap);
    return {status:'supported',artifact,diagnostics:parsed.diagnostics,assumptions:parsed.assumptions};
  }
  /** Provider proposes data only; acceptance always rechecks the typed compiler. */
  async propose(thought:string,provider:ProposalProvider,config:CreationOptions={},signal?:AbortSignal):Promise<CreationResult> {
    this.parse(thought);options(config);
    check(!signal?.aborted,'cancelled','Proposal cancelled');
    const pending=provider.propose(thought,{signal});
    const proposal=signal?await new Promise<ParseResult>((resolve,reject)=>{
      const abort=()=>{signal.removeEventListener('abort',abort);reject(new QuinelingError('cancelled','Proposal cancelled'));};
      signal.addEventListener('abort',abort,{once:true});
      pending.then(value=>{signal.removeEventListener('abort',abort);resolve(value);},error=>{signal.removeEventListener('abort',abort);reject(error);});
      if(signal.aborted)abort();
    }):await pending;
    check(!signal?.aborted,'cancelled','Proposal cancelled');inert(proposal,262144);
    fields(proposal,['status','diagnostics','assumptions','sourceMap'],['intent']);
    check(['supported','clarify','unsupported','inconsistent'].includes(proposal.status),'invalid-input','Unknown proposal status');
    check(Array.isArray(proposal.diagnostics)&&Array.isArray(proposal.assumptions)&&Array.isArray(proposal.sourceMap),'invalid-input','Malformed proposal metadata');
    check(proposal.diagnostics.length<=64&&proposal.assumptions.length<=32&&proposal.assumptions.every(x=>typeof x==='string'&&x.length<=512),'invalid-input','Malformed proposal assumptions');
    for(const d of proposal.diagnostics){fields(d,['code','path','message']);check(['code','path','message'].every(k=>typeof d[k]==='string'&&(d[k] as string).length<=2048),'invalid-input','Malformed proposal diagnostic');}
    if(proposal.status!=='supported')return {status:proposal.status,diagnostics:copy(proposal.diagnostics),assumptions:copy(proposal.assumptions)};
    check(proposal.intent,'invalid-intent','Supported proposal has no intent');
    return {status:'supported',artifact:this.#build(proposal.intent,config,proposal.sourceMap.length?proposal.sourceMap:undefined),diagnostics:copy(proposal.diagnostics),assumptions:copy(proposal.assumptions)};
  }
  inspect(artifactId:string):Artifact {return copy(this.#lookup(artifactId));}
  #lookup(id:string):Artifact {check(typeof id==='string','invalid-input','Expected artifact ID');const artifact=this.#artifacts.get(id);check(artifact,'unknown-artifact','Artifact is not in this runtime');return artifact;}
  #prepareArtifact(program:unknown,metadata:Partial<Artifact>={}):{artifact:Artifact;write:boolean;totalBytes:number} {
    inert(program,65536);check(Array.isArray(program),'invalid-source','Expected source AST');
    const source=Q.canon(program);check(Buffer.byteLength(source)<=65536,'source-budget','Complete source exceeds 65536 bytes');
    const shape=wrap('invalid-source',()=>Q.describe(program)),graph=shape.graph as Graph;
    check(Array.isArray(graph.nodes),'invalid-source','Agent SDK accepts task constructor programs');
    // Require the canonical constructor, not an AST with hidden eager actions.
    const reconstructed=wrap('invalid-source',()=>Q.makeTaskProgram(graph,shape.repeats,shape.design));
    check(Q.canon(reconstructed)===source,'invalid-source','Source must be a complete task constructor quine');
    K.validate(graph);D.validateBindings(shape.design,graph);
    check(shape.design.anatomy&&shape.design.motion.gesture,'invalid-source','Source needs assembly anatomy and gesture');
    const id=sourceId(source),existing=this.#artifacts.get(id);
    if(existing){
      if(metadata.intent&&existing.intent)check(Q.canon(metadata.intent)===Q.canon(existing.intent),'metadata-conflict','Same source has different companion intent; use a separate Runtime to preserve both interpretations');
      if(metadata.intent&&!existing.intent){const enriched={...existing,intent:copy(metadata.intent),sourceMap:copy(metadata.sourceMap??[]),...(metadata.contract?{contract:{...copy(metadata.contract),sourceBytes:Buffer.byteLength(source)}}:{})};const totalBytes=this.#artifactBytes-Buffer.byteLength(JSON.stringify(existing))+Buffer.byteLength(JSON.stringify(enriched));check(totalBytes<=33554432,'resource-limit','Artifact store exceeds32MiB');return {artifact:enriched,write:true,totalBytes};}
      return {artifact:existing,write:false,totalBytes:this.#artifactBytes};
    }
    check(this.#artifacts.size<this.#maxArtifacts,'resource-limit','Artifact store is full; use a new Runtime');
    const artifact:Artifact={id,source,program:JSON.parse(source) as Json[],graph:copy(graph),design:copy(shape.design),sourceMap:copy(metadata.sourceMap??[]),harmonics:Q.encode(program),colors:Q.encodeColors(program)};
    if(metadata.intent)artifact.intent=copy(metadata.intent);if(metadata.contract)artifact.contract={...copy(metadata.contract),sourceBytes:Buffer.byteLength(source)};
    const totalBytes=this.#artifactBytes+Buffer.byteLength(JSON.stringify(artifact));check(totalBytes<=33554432,'resource-limit','Artifact store exceeds32MiB');return {artifact,write:true,totalBytes};
  }
  #admit(program:unknown,metadata:Partial<Artifact>={}):Artifact {
    const prepared=this.#prepareArtifact(program,metadata),result=copy(prepared.artifact),nextWorld=this.#annotationWorld(prepared.artifact,this.#world);
    if(prepared.write){const next=new Map(this.#artifacts);next.set(prepared.artifact.id,prepared.artifact);this.#artifacts=next;this.#artifactBytes=prepared.totalBytes;}if(nextWorld)this.#world=nextWorld;
    return result;
  }
  run(artifactId:string):ExecutionRecord {return this.#execute(this.#lookup(artifactId));}
  #execute(artifact:Artifact,parent?:ExecutionRecord):ExecutionRecord {
    check(this.#records.size<this.#maxRecords,'resource-limit','Execution record store is full; use a new Runtime');
    const result=wrap('execution-failed',()=>Q.execute(copy(artifact.program)));
    check(result.emitted.length===1&&result.emitted[0]===artifact.source,'execution-failed','Constructor did not reproduce exact source');
    if(parent)check(Q.canon(result.tasks.map((t:{output:unknown})=>t.output))===Q.canon(parent.result.tasks.map(t=>t.output)),'execution-failed','Fresh child result differs from parent');
    const record:ExecutionRecord={id:'run_'+randomUUID(),artifactId:artifact.id,source:artifact.source,result:copy(result)};
    if(parent)record.parentRecordId=parent.id;this.#records.set(record.id,record);return copy(record);
  }
  reproduce(artifactId:string,recordId:string):{artifact:Artifact;record:ExecutionRecord} {
    const parent=this.#lookup(artifactId);check(typeof recordId==='string','invalid-input','Expected record ID');
    const record=this.#records.get(recordId);check(record,'unknown-record','Record is not in this runtime');
    check(record.artifactId===parent.id&&record.source===parent.source,'stale-record','Record belongs to a different source');
    check(record.result.emitted[0]===parent.source,'stale-record','Record does not emit this source');
    const program=JSON.parse(record.result.emitted[0]) as unknown;
    const artifact=this.#admit(program,parent);return {artifact,record:this.#execute({...artifact,program:JSON.parse(artifact.source) as Json[]},record)};
  }
  recover(input:RecoveryInput):Artifact {
    inert(input);fields(input,[],['source','harmonics','colors']);check(Object.keys(input).length===1,'invalid-input','Supply exactly one source or genome');
    return wrap('invalid-source',()=>{
      const program=input.source!==undefined?(check(typeof input.source==='string'&&Buffer.byteLength(input.source)<=65536,'source-budget','Source text exceeds byte budget'),JSON.parse(input.source)):input.harmonics!==undefined?Q.decode(input.harmonics):Q.decodeColors(input.colors);
      return this.#admit(program);
    });
  }
  #annotationWorld(artifact:Artifact,world:World|null):World|null {
    const previous=this.#artifacts.get(artifact.id);if(!world||!previous||previous.intent||!artifact.intent)return world;
    return ranchWrap(()=>W.annotate(world,artifact.id,O.intentHash(artifact.intent))).world as World;
  }
  #requireWorld(id:string):World {check(typeof id==='string','invalid-input','Expected world ID');check(this.#world&&this.#world.id===id,'unknown-world','World is not in this Runtime');return this.#world;}
  #socialArtifact(a:Artifact){return {id:a.id,sourceHash:a.id.slice(3),intentHash:O.intentHash(a.intent??null),roles:a.graph.nodes.map(n=>Chroma.role(n.op)),gestureKind:a.design.motion.gesture!.kind};}
  #candidate(input:OffspringInput):OffspringCandidate {return ranchWrap(()=>O.build(input.parents.map(p=>copy(this.#lookup(p.artifactId))),input)) as OffspringCandidate;}
  offspringPreview(input:OffspringInput):OffspringPreview {
    inert(input);ranchWrap(()=>O.validateInput(input));
    try{return {status:'ready',candidate:this.#candidate(input)};}catch(e){if(!(e instanceof QuinelingError))throw e;if(e.code==='unknown-artifact')throw e;return {status:'rejected',diagnostics:[{code:e.code,path:e.path,message:e.message}]};}
  }
  offspringFrame(request:OffspringFrameInput):OffspringFrameResult {
    request=stripOptional(request,['options']) as unknown as OffspringFrameInput;inert(request);fields(request,['input','candidateId','childSourceHash','phase'],['options']);ranchWrap(()=>O.validateInput(request.input));
    const c=this.#candidate(request.input);check(c.candidateId===request.candidateId&&c.childSourceHash===request.childSourceHash,'stale-state','Preview identity does not match rebuilt source');
    return {candidateId:c.candidateId,childSourceHash:c.childSourceHash,frame:this.#sampleFrame(c.child,request.phase,request.options??{},false)};
  }
  offspringAdmit(request:AdmissionInput):AdmissionResult {
    inert(request);fields(request,['input','candidateId','childSourceHash','target','requestId']);ranchWrap(()=>O.validateInput(request.input));
    check(typeof request.requestId==='string'&&request.requestId.length>=1&&request.requestId.length<=128,'invalid-input','requestId must be1..128 characters','$.requestId');
    check(typeof request.candidateId==='string'&&/^qc_[0-9a-f]{64}$/.test(request.candidateId),'invalid-input','Invalid candidate ID','$.candidateId');check(typeof request.childSourceHash==='string'&&/^[0-9a-f]{64}$/.test(request.childSourceHash),'invalid-input','Invalid child source hash','$.childSourceHash');
    fields(request.target,['kind'],['worldId','expectedRevision']);if(request.target.kind==='library')fields(request.target,['kind']);else {fields(request.target,['kind','worldId','expectedRevision']);check(request.target.kind==='world','invalid-input','Unknown admission target');}
    check((request.target.kind==='library'&&request.input.origin.kind==='manual')||(request.target.kind==='world'&&request.input.origin.kind==='pairing'),'invalid-input','Admission origin and target must agree');
    const payload=Q.canon(request),saved=this.#admissions.get(request.requestId);if(saved){check(saved.payload===payload,'metadata-conflict','Admission request key already binds a different payload');return copy(saved.result);}
    check(this.#admissions.size<128,'resource-limit','Admission receipt ledger is full; use a new Runtime');
    let priorWorld:World|undefined;
    if(request.target.kind==='world'){
      priorWorld=this.#requireWorld(request.target.worldId);const origin=request.input.origin;check(origin.kind==='pairing','invalid-input','World requires pairing origin');
      check(origin.worldId===priorWorld.id,'stale-state','Origin world mismatch');const proposal=priorWorld.proposals.find(p=>p.id===origin.proposalId);check(proposal,'stale-state','Proposal is missing or consumed');
      check(request.input.parents.every((p,i)=>p.artifactId===proposal.artifactIds[i]&&p.intentHash===proposal.intentHashes[i]),'stale-state','Construction parents do not match the social proposal');
    }
    const c=this.#candidate(request.input);check(c.candidateId===request.candidateId&&c.childSourceHash===request.childSourceHash,'stale-state','Admission identity does not match rebuilt source');
    const prepared=this.#prepareArtifact(c.child.program,c.child),existing=this.#derivations.get(c.derivationId);
    if(existing)check(Q.canon(existing)===Q.canon(c.lineage),'metadata-conflict','Derivation identity conflicts with stored evidence');
    check(existing||this.#derivations.size<128,'resource-limit','Derivation ledger is full; use a new Runtime');
    const derivationBytes=this.#derivationBytes+(existing?0:Buffer.byteLength(JSON.stringify(c.lineage)));check(derivationBytes<=4194304,'resource-limit','Derivation ledger exceeds4MiB');
    let nextWorld=this.#annotationWorld(prepared.artifact,this.#world)??undefined,placement:{worldId?:string;residentId?:string;revision?:number;tick?:number}={};
    if(priorWorld){if(nextWorld!==priorWorld)nextWorld={...nextWorld!,revision:priorWorld.revision};const staged=ranchWrap(()=>W.admit(nextWorld,{origin:request.input.origin,target:request.target,childArtifactId:prepared.artifact.id},{artifact:this.#socialArtifact(prepared.artifact)}));nextWorld=staged.world;placement={worldId:staged.result.worldId,residentId:staged.result.residentId,revision:staged.result.revision,tick:staged.result.tick};}
    const ack:AdmissionResult={requestId:request.requestId,candidateId:c.candidateId,derivationId:c.derivationId,artifactId:prepared.artifact.id,childSourceHash:c.childSourceHash,...placement};check(Buffer.byteLength(JSON.stringify(ack))<=4096,'resource-limit','Admission acknowledgement exceeds4KiB');
    const returned=copy(ack),nextArtifacts=new Map(this.#artifacts),nextDerivations=new Map(this.#derivations),nextAdmissions=new Map(this.#admissions);
    if(prepared.write)nextArtifacts.set(prepared.artifact.id,prepared.artifact);if(!existing)nextDerivations.set(c.derivationId,copy(c.lineage));nextAdmissions.set(request.requestId,{payload,result:copy(ack)});
    // Every possible validation/serialization/allocation above precedes this
    // synchronous store swap. No await or user callbacks inside the transaction.
    this.#artifacts=nextArtifacts;this.#artifactBytes=prepared.totalBytes;this.#derivations=nextDerivations;this.#derivationBytes=derivationBytes;this.#admissions=nextAdmissions;if(nextWorld)this.#world=nextWorld;
    return returned;
  }
  lineage(request:LineageInput={}):LineageResult {
    request=stripOptional(request,['artifactId','cursor','limit']) as LineageInput;inert(request);fields(request,[],['artifactId','cursor','limit']);if(request.artifactId!==undefined){check(typeof request.artifactId==='string','invalid-input','Expected artifact ID');this.#lookup(request.artifactId);}
    if(request.cursor!==undefined)check(typeof request.cursor==='number','invalid-input','Cursor must be a number');if(request.limit!==undefined)check(typeof request.limit==='number','invalid-input','Limit must be a number');const cursor=request.cursor??0,limit=request.limit??16;check(typeof cursor==='number'&&typeof limit==='number','invalid-input','Lineage cursor and limit must be integers');check(Number.isInteger(cursor)&&cursor>=0&&cursor<=this.#derivations.size,'invalid-input','Lineage cursor is outside this session');check(Number.isInteger(limit)&&limit>=1&&limit<=32,'invalid-input','Lineage page limit must be1..32');
    const rows=[...this.#derivations.values()],page:Derivation[]=[];let index=cursor;while(index<rows.length&&page.length<limit){const d=rows[index++]!;if(!request.artifactId||d.childArtifactId===request.artifactId)page.push(copy(d));}
    return {derivations:page,...(index<rows.length?{nextCursor:index}:{})};
  }
  annotate(request:AnnotationInput):Artifact {
    inert(request);fields(request,['artifactId','intent']);const prior=this.#lookup(request.artifactId),compiled=wrap('invalid-intent',()=>T.compile(request.intent)),graph=copy(prior.graph);delete graph.design;
    check(Q.canon(compiled.graph)===Q.canon(graph),'metadata-conflict','Companion does not match exact source task graph');const prepared=this.#prepareArtifact(prior.program,{intent:copy(request.intent),contract:compiled.contract,sourceMap:compiled.sourceMap});
    const nextWorld=this.#world?ranchWrap(()=>W.annotate(this.#world,prior.id,O.intentHash(request.intent))).world:null,returned=copy(prepared.artifact),next=new Map(this.#artifacts);if(prepared.write)next.set(prior.id,prepared.artifact);
    this.#artifacts=next;this.#artifactBytes=prepared.totalBytes;if(nextWorld)this.#world=nextWorld;return returned;
  }
  worldCreate(request:WorldConfig):World {
    request=stripOptional(request,['affinity']) as unknown as WorldConfig;inert(request);fields(request,['worldKey','seed'],['affinity']);if(request.affinity!==undefined)check(request.affinity==='structural'||request.affinity==='neutral','invalid-input','Unknown affinity mode');const next=ranchWrap(()=>W.create(request)) as World;
    if(this.#world){check(this.#world.id===next.id,'metadata-conflict','Runtime already contains a different world');return copy(this.#world);}const returned=copy(next);this.#world=next;return returned;
  }
  worldInspect(worldId:string):World {return copy(this.#requireWorld(worldId));}
  worldCommand(request:WorldCommandInput):WorldCommandResult {
    inert(request);fields(request,['worldId','expectedRevision','sequence','command']);fields(request.command,['kind'],['artifactId','residentId','enabled','partnerId','proposalId','ticks']);const prior=this.#requireWorld(request.worldId);let context={};
    if(request.command.kind==='import')context={artifact:this.#socialArtifact(this.#lookup(request.command.artifactId))};const staged=ranchWrap(()=>W.command(prior,request,context)),returned=copy(staged.result) as WorldCommandResult;this.#world=staged.world;return returned;
  }
  frame(artifactId:string,phase:number,config:FrameOptions={}):Frame {return this.#sampleFrame(this.#lookup(artifactId),phase,config,true);}
  #sampleFrame(artifact:Artifact,phase:number,config:FrameOptions={},cache=false):Frame {
    config=stripOptional(config,['budget','crests']);inert(config);fields(config,[],['budget','crests']);
    check(typeof phase==='number'&&Number.isFinite(phase)&&Math.abs(phase)<=1e9,'invalid-input','Phase must be finite with magnitude ≤1e9','$.phase');
    if(config.budget!==undefined)check(typeof config.budget==='number'&&Number.isInteger(config.budget)&&config.budget>=4000&&config.budget<=24000,'invalid-input','Frame budget must be an integer in [4000,24000]','$.options.budget');
    if(config.crests!==undefined)check(typeof config.crests==='number'&&Number.isInteger(config.crests)&&config.crests>=2&&config.crests<=4,'invalid-input','Frame crests must be an integer in [2,4]','$.options.crests');
    let body=cache?this.#bodies.get(artifact.id):undefined;if(!body){body=A.compile(artifact.design.anatomy,artifact.graph.nodes,artifact.design.motion.gesture);if(cache)this.#bodies.set(artifact.id,body);}
    const f=wrap('invalid-input',()=>A.frame(body,phase,config));
    return {points:Array.from(f.points),normals:Array.from(f.normals),owners:Array.from(f.owners),ridges:copy(f.ridges),nodeIds:artifact.graph.nodes.map(n=>n.id),nodeColors:artifact.graph.nodes.map((_,i)=>Chroma.colorFor({design:artifact.design,nodes:artifact.graph.nodes},i)),nodeRoles:artifact.graph.nodes.map(n=>Chroma.role(n.op))};
  }
  dispatch<R extends Request>(request:R):ResponseFor<R>;
  dispatch(request:Request):Response {
    inert(request);check(request&&typeof request==='object','invalid-input','Expected request');
    switch(request.operation){
      case 'parse':fields(request,['operation','thought']);return this.parse(request.thought);
      case 'create':fields(request,['operation','thought'],['options']);return this.create(request.thought,request.options);
      case 'compile':fields(request,['operation','intent'],['options']);return this.compile(request.intent,request.options);
      case 'inspect':fields(request,['operation','artifactId']);return this.inspect(request.artifactId);
      case 'run':fields(request,['operation','artifactId']);return this.run(request.artifactId);
      case 'reproduce':fields(request,['operation','artifactId','recordId']);return this.reproduce(request.artifactId,request.recordId);
      case 'recover':fields(request,['operation','recovery']);return this.recover(request.recovery);
      case 'frame':fields(request,['operation','artifactId','phase'],['options']);return this.frame(request.artifactId,request.phase,request.options);
      case 'offspringPreview':fields(request,['operation','input']);return this.offspringPreview(request.input);
      case 'offspringFrame':fields(request,['operation','input','candidateId','childSourceHash','phase'],['options']);return this.offspringFrame({input:request.input,candidateId:request.candidateId,childSourceHash:request.childSourceHash,phase:request.phase,options:request.options});
      case 'offspringAdmit':fields(request,['operation','input','candidateId','childSourceHash','target','requestId']);return this.offspringAdmit({input:request.input,candidateId:request.candidateId,childSourceHash:request.childSourceHash,target:request.target,requestId:request.requestId});
      case 'lineage':fields(request,['operation'],['artifactId','cursor','limit']);return this.lineage({artifactId:request.artifactId,cursor:request.cursor,limit:request.limit});
      case 'annotate':fields(request,['operation','artifactId','intent']);return this.annotate({artifactId:request.artifactId,intent:request.intent});
      case 'worldCreate':fields(request,['operation','worldKey','seed'],['affinity']);return this.worldCreate({worldKey:request.worldKey,seed:request.seed,affinity:request.affinity});
      case 'worldInspect':fields(request,['operation','worldId']);return this.worldInspect(request.worldId);
      case 'worldCommand':fields(request,['operation','worldId','expectedRevision','sequence','command']);return this.worldCommand({worldId:request.worldId,expectedRevision:request.expectedRevision,sequence:request.sequence,command:request.command});
      default:throw new QuinelingError('invalid-input','Unknown operation');
    }
  }
  exchange(request:Request):TaggedResponse {return {operation:request.operation,result:this.dispatch(request)} as TaggedResponse;}
}
export const capabilities:readonly string[]=Object.freeze([...T.capabilities]);
export const examples:readonly string[]=Object.freeze(copy(T.examples));
