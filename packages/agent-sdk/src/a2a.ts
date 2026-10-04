import { randomUUID, randomBytes, createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { setImmediate as yieldEventLoop } from 'node:timers/promises';
import express, { type ErrorRequestHandler } from 'express';
import { AgentCard, Artifact as A2AArtifact, Message, Task, TaskState, Role, type ListTasksRequest, type ListTasksResponse } from '@a2a-js/sdk';
import { AgentEvent, DefaultRequestHandler, type AgentExecutor, type ExecutionEventBus, type RequestContext, type ServerCallContext, type TaskStore } from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { RequestMalformedError, TaskNotCancelableError } from '@a2a-js/sdk/errors';
import { Runtime } from './index.js';
import type { Request, Response } from './types.js';

const TERMINAL = new Set([TaskState.TASK_STATE_COMPLETED, TaskState.TASK_STATE_FAILED, TaskState.TASK_STATE_CANCELED, TaskState.TASK_STATE_REJECTED]);
const OPERATIONS = new Set(['parse','compile','create','inspect','run','reproduce','recover','frame','offspringPreview','offspringFrame','offspringAdmit','lineage','annotate','worldCreate','worldInspect','worldCommand']);
const MAX_TASK_BYTES = 16 * 1024 * 1024;
const scopeOf=(context:ServerCallContext):string=>JSON.stringify([context.tenant??'',context.user?.userName??''])+':';

const INTERRUPTED = new Set([TaskState.TASK_STATE_INPUT_REQUIRED, TaskState.TASK_STATE_AUTH_REQUIRED]);
export interface TaskRetentionOptions { interruptedTtlMs?:number; now?:()=>number }

/** Bounded local history: least-recently-updated paused/terminal tasks may be
 * evicted. Paused tasks expire lazily after 15 minutes; active work is retained. */
export class BoundedTaskStore implements TaskStore {
  private readonly tasks = new Map<string, { task: Task; bytes: number; updatedAt:number; sequence:bigint; scope:string }>();
  private nextSequence=0n;
  private readonly cursorKey=randomBytes(32);
  private readonly now:()=>number;
  readonly interruptedTtlMs:number;
  private activeTask:(id:string,scope:string)=>boolean=()=>false;
  private bytes = 0;
  constructor(readonly maxTasks = 128, readonly maxBytes = 64 * 1024 * 1024, retention:TaskRetentionOptions={}) {
    if (!Number.isInteger(maxTasks) || maxTasks < 1 || maxTasks > 1024 || !Number.isInteger(maxBytes) || maxBytes < MAX_TASK_BYTES || maxBytes > 256 * 1024 * 1024) throw new Error('Invalid A2A task-store limits');
    this.interruptedTtlMs=retention.interruptedTtlMs??15*60*1000;this.now=retention.now??Date.now;
    if(!Number.isSafeInteger(this.interruptedTtlMs)||this.interruptedTtlMs<1||this.interruptedTtlMs>24*60*60*1000)throw new Error('Invalid interrupted task lifetime');
  }
  /** Protect resumed tasks even before their new submitted event reaches storage. */
  protectActiveTasks(check:(id:string,scope:string)=>boolean):void {this.activeTask=check;}
  private pruneExpired():void {const now=this.now();for(const [key,item] of this.tasks)if(item.task.status&&INTERRUPTED.has(item.task.status.state)&&now-item.updatedAt>=this.interruptedTtlMs&&!this.activeTask(item.task.id,item.scope)){this.tasks.delete(key);this.bytes-=item.bytes;}}
  private scope(context: ServerCallContext): string { return scopeOf(context); }
  async load(id: string, context: ServerCallContext): Promise<Task | undefined> { this.pruneExpired();const task=this.tasks.get(this.scope(context)+id)?.task; return task ? structuredClone(task) : undefined; }
  async save(task: Task, context: ServerCallContext): Promise<void> {
    // Prepare everything that can fail before removing retained state. Expired
    // paused rows are candidates too, but a rejected save does not evict them.
    const snapshot=structuredClone(task),scope=this.scope(context),key=scope+snapshot.id,bytes=Buffer.byteLength(JSON.stringify(snapshot)),now=this.now();
    if(bytes>MAX_TASK_BYTES)throw new RequestMalformedError('A2A task exceeds 16 MiB');
    const old=this.tasks.get(key),additional=bytes-(old?.bytes??0),victims:string[]=[];
    let projectedCount=this.tasks.size+(old?0:1),projectedBytes=this.bytes+additional;
    for(const [candidate,item] of this.tasks){
      if(projectedCount<=this.maxTasks&&projectedBytes<=this.maxBytes)break;
      if(candidate!==key&&item.task.status&&(TERMINAL.has(item.task.status.state)||INTERRUPTED.has(item.task.status.state))&&!this.activeTask(item.task.id,item.scope)){
        victims.push(candidate);projectedCount--;projectedBytes-=item.bytes;
      }
    }
    if(projectedCount>this.maxTasks||projectedBytes>this.maxBytes)throw new RequestMalformedError('A2A task capacity reached by active work; retry after completion');
    for(const victim of victims){this.bytes-=this.tasks.get(victim)!.bytes;this.tasks.delete(victim);}
    this.tasks.delete(key);this.tasks.set(key,{task:snapshot,bytes,updatedAt:now,sequence:old?.sequence??++this.nextSequence,scope});this.bytes+=additional;
    this.pruneExpired();
  }
  private cursor(after:bigint,timestamp:number|null,query:string):string {
    const payload=Buffer.from(JSON.stringify({version:2,after:after.toString(),timestamp,query})).toString('base64url');
    return payload+'.'+createHmac('sha256',this.cursorKey).update(payload).digest('base64url');
  }
  private cursorAfter(token:string,query:string):{sequence:bigint;timestamp:number}|undefined {
    if(!token)return undefined;
    try {
      if(token.length>512)throw Error();
      const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)throw Error();
      const expected=createHmac('sha256',this.cursorKey).update(payload).digest(),actual=Buffer.from(signature,'base64url');
      if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw Error();
      const value:unknown=JSON.parse(Buffer.from(payload,'base64url').toString());
      if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==4||!('version' in value)||value.version!==2||!('query' in value)||value.query!==query||!('after' in value)||typeof value.after!=='string'||!/^\d{1,30}$/.test(value.after))throw Error();
      if(!('timestamp' in value)||(value.timestamp!==null&&(typeof value.timestamp!=='number'||!Number.isFinite(value.timestamp))))throw Error();
      return {sequence:BigInt(value.after),timestamp:value.timestamp===null?-Infinity:value.timestamp};
    }catch{throw new RequestMalformedError('Invalid task cursor or changed listing scope/filters');}
  }
  async list(params: ListTasksRequest, context: ServerCallContext): Promise<ListTasksResponse> {
    this.pruneExpired();const pageSize=params.pageSize ?? 50;
    if (!Number.isInteger(pageSize)||pageSize<1||pageSize>100) throw new RequestMalformedError('Invalid task pagination');
    if (params.historyLength!==undefined&&(!Number.isInteger(params.historyLength)||params.historyLength<0)) throw new RequestMalformedError('Invalid history length');
    const threshold=params.statusTimestampAfter?Date.parse(params.statusTimestampAfter):undefined;
    if(threshold!==undefined&&!Number.isFinite(threshold))throw new RequestMalformedError('Invalid status timestamp');
    const prefix=this.scope(context),query=createHash('sha256').update(JSON.stringify([prefix,params.contextId||'',params.status||0,params.statusTimestampAfter||''])).digest('hex'),after=this.cursorAfter(params.pageToken,query);
    // Protocol order is newest status first. The immutable sequence breaks
    // equal-time ties, while the cursor retains both values after row eviction.
    const timestamp=(task:Task)=>{const parsed=Date.parse(task.status?.timestamp??'');return Number.isFinite(parsed)?parsed:-Infinity;};
    const all=[...this.tasks].filter(([key,{task}])=>key.startsWith(prefix)&&(!params.contextId||task.contextId===params.contextId)&&(!params.status||task.status?.state===params.status)&&(threshold===undefined||timestamp(task)>=threshold)).map(([,item])=>({...item,timestamp:timestamp(item.task)})).sort((a,b)=>a.timestamp!==b.timestamp?b.timestamp-a.timestamp:a.sequence<b.sequence?-1:a.sequence>b.sequence?1:0);
    const remaining=all.filter(item=>!after||item.timestamp<after.timestamp||item.timestamp===after.timestamp&&item.sequence>after.sequence),page=remaining.slice(0,pageSize);
    const tasks=page.map(({task:t})=>{const task=structuredClone(t);if(!params.includeArtifacts)task.artifacts=[];if(params.historyLength!==undefined)task.history=params.historyLength===0?[]:task.history.slice(-params.historyLength);return task;});
    return {tasks,nextPageToken:remaining.length>pageSize?this.cursor(page.at(-1)!.sequence,Number.isFinite(page.at(-1)!.timestamp)?page.at(-1)!.timestamp:null,query):'',pageSize,totalSize:all.length};
  }
}

function requestFromMessage(message: Message): Request {
  if (message.role!==Role.ROLE_USER || message.parts.length!==1) throw new RequestMalformedError('Send exactly one user text or JSON data part');
  const part=message.parts[0]!;
  if (part.content?.$case==='text') {
    return {operation:'create',thought:part.content.value};
  }
  if (part.content?.$case!=='data') throw new RequestMalformedError('Only text and JSON data parts are accepted');
  const value: unknown=part.content.value;
  if (!value||typeof value!=='object'||Array.isArray(value)||!('operation' in value)||typeof value.operation!=='string'||!OPERATIONS.has(value.operation)) throw new RequestMalformedError('JSON data needs a supported operation');
  return value as Request; // Runtime.dispatch performs the closed request validation.
}

/** No ambient execution authority: only explicit structured run/reproduce requests evaluate. */
export class QuinelingExecutor implements AgentExecutor {
  private readonly pending = new Map<string,{taskId:string;contextId:string;canceled:boolean;running:boolean;bus:ExecutionEventBus}>();
  constructor(readonly runtime: Runtime) {}
  isActive(taskId:string,scope=JSON.stringify(['',''])+':'):boolean {return this.pending.has(scope+taskId);}
  async execute(context: RequestContext, bus: ExecutionEventBus): Promise<void> {
    const {taskId,contextId}=context,key=scopeOf(context.context)+taskId,state={taskId,contextId,canceled:false,running:false,bus};
    if (this.pending.size>=128&&!this.pending.has(key)) throw new RequestMalformedError('Too many active tasks; retry after completion');
    this.pending.set(key,state);
    bus.publish(AgentEvent.task(Task.fromJSON({id:taskId,contextId,status:{state:'TASK_STATE_SUBMITTED'},history:[]})));
    // Cancellation can win before dispatch. The bounded synchronous interpreter
    // cannot be interrupted mid-evaluation; it never pretends to roll work back.
    await yieldEventLoop();
    if (state.canceled) {this.pending.delete(key);return;}
    const status=(value:TaskState, text:string,diagnostic?:{code:string;message:string;path:string})=>bus.publish(AgentEvent.statusUpdate({taskId,contextId,status:{state:value,message:Message.fromJSON({messageId:randomUUID(),taskId,contextId,role:'ROLE_AGENT',parts:[{text}],...(diagnostic?{metadata:{quinelingError:diagnostic}}:{})}),timestamp:new Date().toISOString()},metadata:undefined}));
    let requestAccepted=false;
    try {
      const request=requestFromMessage(context.userMessage);requestAccepted=true;state.running=true;
      status(TaskState.TASK_STATE_WORKING,request.operation==='run'||request.operation==='reproduce'?'Executing the explicit request.':'Building or inspecting without execution.');
      const result:Response=this.runtime.dispatch(request);
      const payload={operation:request.operation,result};
      if(Buffer.byteLength(JSON.stringify(payload))>MAX_TASK_BYTES-65536)throw new Error('Result exceeds the A2A artifact limit');
      bus.publish(AgentEvent.artifactUpdate({taskId,contextId,artifact:A2AArtifact.fromJSON({artifactId:'quineling-result',name:'quineling-'+request.operation,description:'Source-bound Quineling response; execution records exist only for run/reproduce.',parts:[{data:payload,mediaType:'application/json'}]}),append:false,lastChunk:true,metadata:undefined}));
      const resultStatus='status' in result?result.status:undefined;
      if(resultStatus==='clarify') {status(TaskState.TASK_STATE_INPUT_REQUIRED,'The thought needs clarification; no task was executed. Resume before expiry or eviction, otherwise start a fresh task.');this.pending.delete(key);}
      else {status(resultStatus==='unsupported'||resultStatus==='inconsistent'?TaskState.TASK_STATE_REJECTED:TaskState.TASK_STATE_COMPLETED,resultStatus==='unsupported'||resultStatus==='inconsistent'?'The supplied thought cannot be compiled.':'Request completed.');this.pending.delete(key);}
    } catch(error) {
      // Entry points may be separately bundled; preserve the runtime's public
      // error fields without relying on cross-bundle constructor identity.
      const diagnostic=error instanceof Error&&error.name==='QuinelingError'&&'code' in error&&typeof error.code==='string'&&'path' in error&&typeof error.path==='string'?{code:error.code,message:error.message,path:error.path}:undefined;
      const nextState=!requestAccepted&&context.task?.status&&INTERRUPTED.has(context.task.status.state)?TaskState.TASK_STATE_INPUT_REQUIRED:TaskState.TASK_STATE_FAILED;
      status(nextState,error instanceof Error?error.message:'Quineling request failed',diagnostic);this.pending.delete(key);
    }
  }
  async cancelTask(taskId: string,bus:ExecutionEventBus): Promise<void> {
    const entry=[...this.pending].find(([,candidate])=>candidate.taskId===taskId&&candidate.bus===bus),key=entry?.[0],state=entry?.[1];
    if(!key||!state||state.running)throw new TaskNotCancelableError('This bounded operation has already completed or begun synchronous evaluation');
    state.canceled=true;
    bus.publish(AgentEvent.statusUpdate({taskId,contextId:state.contextId,status:{state:TaskState.TASK_STATE_CANCELED,message:undefined,timestamp:new Date().toISOString()},metadata:undefined}));
    this.pending.delete(key);
  }
}

export interface A2AOptions { runtime?:Runtime; baseUrl?:string; legacyCompat?:boolean; taskStore?:TaskStore; requestLimitBytes?:number }
export interface A2AApplication {app:express.Express;runtime:Runtime;card:AgentCard;handler:DefaultRequestHandler;taskStore:TaskStore;executor:QuinelingExecutor}
export function createA2AApp(options:A2AOptions={}):A2AApplication {
  const runtime=options.runtime??new Runtime(),url=new URL(options.baseUrl??'http://127.0.0.1:8049');
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('A2A base URL must be an HTTP(S) origin');
  const baseUrl=url.href.replace(/\/$/,''),legacy=options.legacyCompat??true,requestLimit=options.requestLimitBytes??2*1024*1024;
  if(!Number.isInteger(requestLimit)||requestLimit<1024||requestLimit>16*1024*1024)throw new Error('Invalid A2A request byte limit');
  const supportedInterfaces=[{url:baseUrl+'/a2a/jsonrpc',protocolBinding:'JSONRPC',protocolVersion:'1.0'},{url:baseUrl+'/a2a/rest',protocolBinding:'HTTP+JSON',protocolVersion:'1.0'}];
  if(legacy)supportedInterfaces.push({url:baseUrl+'/a2a/jsonrpc',protocolBinding:'JSONRPC',protocolVersion:'0.3'});
  const card=AgentCard.fromJSON({name:'Quinelings',description:'Build source-authored mathematical lifeforms from bounded typed tasks. Build, inspect, recover and animate are passive; explicit run/reproduce evaluates a simulated or pure task.',version:'0.0.0-experimental',supportedInterfaces,capabilities:{streaming:true,pushNotifications:false},defaultInputModes:['text/plain','application/json'],defaultOutputModes:['application/json','text/plain'],skills:[{id:'build',name:'Build and inspect a Quineling',description:'Parse a local recipe or compile typed intent, inspect source, recover genomes, and sample a deterministic body without execution.',tags:['quineling','QDL','compile','inspect'],examples:['[2,3,5] | square | sum'],inputModes:['text/plain','application/json'],outputModes:['application/json']},{id:'ranch',name:'Build offspring and manage a Quineling ranch',description:'Prepare typed source-backed offspring, sample without admission, atomically admit explicit births, inspect lineage and control bounded reciprocal social time. World commands and birth never run tasks; retry original keys after transport loss.',tags:['quineling','ranch','offspring','lineage','world'],inputModes:['application/json'],outputModes:['application/json']},{id:'execute',name:'Execute an explicit Quineling request',description:'Only structured operation run or reproduce evaluates a source-bound task and creates a fresh execution record.',tags:['quineling','run','reproduce'],inputModes:['application/json'],outputModes:['application/json']} ]});
  const taskStore=options.taskStore??new BoundedTaskStore(),executor=new QuinelingExecutor(runtime);
  if(taskStore instanceof BoundedTaskStore)taskStore.protectActiveTasks((id,scope)=>executor.isActive(id,scope));
  // No computation continues during clarification. Release its SDK event bus;
  // later cancellation/resumption is reconstructed from retained task storage.
  const handler=new DefaultRequestHandler(card,taskStore,executor,undefined,undefined,undefined,undefined,undefined,{keepBusAliveStates:[]}),app=express();app.disable('x-powered-by');
  app.use(express.json({limit:requestLimit,strict:true}));
  app.use('/.well-known/agent-card.json',agentCardHandler({agentCardProvider:handler,legacyCompat:{enabled:legacy}}));
  app.use('/a2a/jsonrpc',jsonRpcHandler({requestHandler:handler,userBuilder:UserBuilder.noAuthentication,legacyCompat:{enabled:legacy}}));
  app.use('/a2a/rest',restHandler({requestHandler:handler,userBuilder:UserBuilder.noAuthentication}));
  const errors:ErrorRequestHandler=(error,_req,res,_next)=>{const status=error?.type==='entity.too.large'?413:400;res.status(status).json({error:{code:status,message:status===413?'A2A request exceeds the configured byte limit':'Malformed JSON request'}});};app.use(errors);
  return {app,runtime,card,handler,taskStore,executor};
}
