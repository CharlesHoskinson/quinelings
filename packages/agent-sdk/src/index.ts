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
import type {Artifact,Intent,ParseResult,CreationOptions,CreationResult,ExecutionRecord,RecoveryInput,Frame,FrameOptions,Request,Response,ResponseFor,TaggedResponse,ProposalProvider,Graph,Json} from './types.js';
export type * from './types.js';
export type ErrorCode='invalid-input'|'invalid-intent'|'source-budget'|'invalid-source'|'unknown-artifact'|'unknown-record'|'stale-record'|'resource-limit'|'execution-failed'|'cancelled'|'metadata-conflict';
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
    check(Array.isArray(x)||Object.getPrototypeOf(x)===Object.prototype||Object.getPrototypeOf(x)===null,'invalid-input','Expected plain JSON records',path);
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
/** A bounded in-memory agent session. All current effects are local simulations. */
export class Runtime {
  #artifacts=new Map<string,Artifact>();
  #records=new Map<string,ExecutionRecord>();
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
  #admit(program:unknown,metadata:Partial<Artifact>={}):Artifact {
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
      if(metadata.intent&&!existing.intent){const enriched={...existing,intent:copy(metadata.intent),sourceMap:copy(metadata.sourceMap??[]),...(metadata.contract?{contract:{...copy(metadata.contract),sourceBytes:Buffer.byteLength(source)}}:{})};this.#artifacts.set(id,enriched);return copy(enriched);}
      return copy(existing);
    }
    check(this.#artifacts.size<this.#maxArtifacts,'resource-limit','Artifact store is full; use a new Runtime');
    const artifact:Artifact={id,source,program:JSON.parse(source) as Json[],graph:copy(graph),design:copy(shape.design),sourceMap:copy(metadata.sourceMap??[]),harmonics:Q.encode(program),colors:Q.encodeColors(program)};
    if(metadata.intent)artifact.intent=copy(metadata.intent);if(metadata.contract)artifact.contract={...copy(metadata.contract),sourceBytes:Buffer.byteLength(source)};
    this.#artifacts.set(id,artifact);return copy(artifact);
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
  frame(artifactId:string,phase:number,config:FrameOptions={}):Frame {
    const artifact=this.#lookup(artifactId);config=stripOptional(config,['budget','crests']);inert(config);fields(config,[],['budget','crests']);
    check(typeof phase==='number'&&Number.isFinite(phase)&&Math.abs(phase)<=1e9,'invalid-input','Phase must be finite with magnitude ≤1e9','$.phase');
    if(config.budget!==undefined)check(typeof config.budget==='number'&&Number.isInteger(config.budget)&&config.budget>=4000&&config.budget<=24000,'invalid-input','Frame budget must be an integer in [4000,24000]','$.options.budget');
    if(config.crests!==undefined)check(typeof config.crests==='number'&&Number.isInteger(config.crests)&&config.crests>=2&&config.crests<=4,'invalid-input','Frame crests must be an integer in [2,4]','$.options.crests');
    let body=this.#bodies.get(artifactId);if(!body){body=A.compile(artifact.design.anatomy,artifact.graph.nodes,artifact.design.motion.gesture);this.#bodies.set(artifactId,body);}
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
      default:throw new QuinelingError('invalid-input','Unknown operation');
    }
  }
  exchange(request:Request):TaggedResponse {return {operation:request.operation,result:this.dispatch(request)} as TaggedResponse;}
}
export const capabilities:readonly string[]=Object.freeze([...T.capabilities]);
export const examples:readonly string[]=Object.freeze(copy(T.examples));
