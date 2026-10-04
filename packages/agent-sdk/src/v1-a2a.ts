import {randomUUID} from 'node:crypto';
import {setImmediate as yieldEventLoop} from 'node:timers/promises';
import express,{type ErrorRequestHandler} from 'express';
import {AgentCard,Artifact as A2AArtifact,Message,Task,TaskState,Role} from '@a2a-js/sdk';
import {AgentEvent,DefaultRequestHandler,type AgentExecutor,type ExecutionEventBus,type RequestContext,type ServerCallContext,type TaskStore} from '@a2a-js/sdk/server';
import {agentCardHandler,jsonRpcHandler,restHandler,UserBuilder} from '@a2a-js/sdk/server/express';
import {RequestMalformedError,TaskNotCancelableError} from '@a2a-js/sdk/errors';
import {BoundedTaskStore} from './a2a.js';
import {Session,QdlError} from './v1.js';
import {RequestSchema,TaggedResponseSchema} from './v1-schema.js';
import type {Request,ErrorDetail} from './v1-types.js';
export {BoundedTaskStore};
const MAX_TASK_BYTES=16*1024*1024;
const scopeOf=(context:ServerCallContext)=>JSON.stringify([context.tenant??'',context.user?.userName??''])+':';
const interrupted=new Set([TaskState.TASK_STATE_INPUT_REQUIRED,TaskState.TASK_STATE_AUTH_REQUIRED]);
function structuredRequest(message:Message):Request|null {
 if(message.role!==Role.ROLE_USER||message.parts.length!==1)throw new RequestMalformedError('Send exactly one user JSON data part');
 const part=message.parts[0]!;
 if(part.content?.$case==='text')return null;
 if(part.content?.$case!=='data')throw new RequestMalformedError('Only one JSON data part is accepted for execution');
 const parsed=RequestSchema.safeParse(part.content.value);
 if(!parsed.success){const issue=parsed.error.issues[0];throw new QdlError('invalid-input',issue?.message??'Invalid structured request',issue?.path.length?'$.'+issue.path.map(String).join('.'):'$');}
 return parsed.data;
}
/** One single-owner local session. Task history scoping does not authenticate
 * callers or grant cross-owner Session isolation; deployments supply that host boundary. */
export class V1Executor implements AgentExecutor {
 private readonly pending=new Map<string,{taskId:string;contextId:string;canceled:boolean;running:boolean;bus:ExecutionEventBus}>();
 constructor(readonly session:Session){}
 isActive(taskId:string,scope=JSON.stringify(['',''])+':'):boolean{return this.pending.has(scope+taskId);}
 async execute(context:RequestContext,bus:ExecutionEventBus):Promise<void>{
  const {taskId,contextId}=context,key=scopeOf(context.context)+taskId,state={taskId,contextId,canceled:false,running:false,bus};
  if(this.pending.size>=128&&!this.pending.has(key))throw new RequestMalformedError('Too many active tasks');
  this.pending.set(key,state);bus.publish(AgentEvent.task(Task.fromJSON({id:taskId,contextId,status:{state:'TASK_STATE_SUBMITTED'},history:[]})));
  // Cancellation wins before this explicit synchronous dispatch boundary.
  await yieldEventLoop();if(state.canceled){this.pending.delete(key);return;}
  const status=(value:TaskState,text:string,diagnostic?:ErrorDetail)=>bus.publish(AgentEvent.statusUpdate({taskId,contextId,status:{state:value,message:Message.fromJSON({messageId:randomUUID(),taskId,contextId,role:'ROLE_AGENT',parts:[{text}],...(diagnostic?{metadata:{qdlError:diagnostic}}:{})}),timestamp:new Date().toISOString()},metadata:undefined}));
  let requestAccepted=false;
  try{
   const request=structuredRequest(context.userMessage);
   if(request===null){status(TaskState.TASK_STATE_INPUT_REQUIRED,'Supply one explicit JSON QDL v1 request. English is not parsed automatically; no task was evaluated. Resume with a complete typed compile request or another supported operation.');return;}
   requestAccepted=true;state.running=true;
   status(TaskState.TASK_STATE_WORKING,request.operation==='run'||request.operation==='reproduce'?'Evaluating the explicit keyed request.':'Building or inspecting without task evaluation.');
   const payload=TaggedResponseSchema.parse(this.session.exchange(request));
   if(Buffer.byteLength(JSON.stringify(payload))>MAX_TASK_BYTES-65536)throw new QdlError('resource-limit','Result exceeds A2A task budget; retry a committed keyed request with its complete original payload');
   bus.publish(AgentEvent.artifactUpdate({taskId,contextId,artifact:A2AArtifact.fromJSON({artifactId:'qdl-v1-result',name:'qdl-v1-'+request.operation,description:'Pinned QDL v1 response. Evaluation records exist only for explicit run/reproduce; imported history is asserted.',parts:[{data:payload,mediaType:'application/json'}]}),append:false,lastChunk:true,metadata:undefined}));
   const failed=(request.operation==='run'||request.operation==='reproduce')&&'result'in payload.result&&payload.result.result.status==='failed';
   // A computed-failed Run is a successfully delivered semantic result with its
   // bounded diagnostic, rather than a malformed protocol request or lost run.
   status(TaskState.TASK_STATE_COMPLETED,failed?'Request completed with a retained computed-failed run.':'Request completed.');
  }catch(error){
   const diagnostic=error instanceof Error&&error.name==='QdlError'&&'code'in error&&'path'in error?{code:String(error.code).slice(0,128),path:String(error.path).slice(0,2048),message:error.message.slice(0,2048)}:undefined;
   const next=!requestAccepted&&context.task?.status&&interrupted.has(context.task.status.state)?TaskState.TASK_STATE_INPUT_REQUIRED:TaskState.TASK_STATE_FAILED;
   status(next,error instanceof Error?error.message.slice(0,2048):'QDL request failed',diagnostic);
  }finally{this.pending.delete(key);}
 }
 async cancelTask(taskId:string,bus:ExecutionEventBus):Promise<void>{
  const entry=[...this.pending].find(([,candidate])=>candidate.taskId===taskId&&candidate.bus===bus),key=entry?.[0],state=entry?.[1];
  if(!key||!state||state.running)throw new TaskNotCancelableError('Synchronous evaluation or commit has begun, or the request is complete');
  state.canceled=true;bus.publish(AgentEvent.statusUpdate({taskId,contextId:state.contextId,status:{state:TaskState.TASK_STATE_CANCELED,message:undefined,timestamp:new Date().toISOString()},metadata:undefined}));this.pending.delete(key);
 }
}
export interface V1A2AOptions {baseUrl?:string;legacyCompat?:boolean;taskStore?:TaskStore;requestLimitBytes?:number}
export interface V1A2AApplication {app:express.Express;session:Session;card:AgentCard;handler:DefaultRequestHandler;taskStore:TaskStore;executor:V1Executor}
export function createV1A2AApp(session:Session=new Session(),options:V1A2AOptions={}):V1A2AApplication {
 const url=new URL(options.baseUrl??'http://127.0.0.1:8050');
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('A2A base URL must be an HTTP(S) origin');
 const baseUrl=url.href.replace(/\/$/,''),legacy=options.legacyCompat??true,requestLimit=options.requestLimitBytes??4*1024*1024;
 if(!Number.isInteger(requestLimit)||requestLimit<1024||requestLimit>16*1024*1024)throw new Error('Invalid A2A request byte limit');
 const interfaces=[{url:baseUrl+'/a2a/jsonrpc',protocolBinding:'JSONRPC',protocolVersion:'1.0'},{url:baseUrl+'/a2a/rest',protocolBinding:'HTTP+JSON',protocolVersion:'1.0'}];
 if(legacy)interfaces.push({url:baseUrl+'/a2a/jsonrpc',protocolBinding:'JSONRPC',protocolVersion:'0.3'});
 const card=AgentCard.fromJSON({name:'Quinelings v1',description:'Single-owner local QDL v1 session: typed source declarations, passive bodies and explicitly keyed simulated runs. No automatic English parser, persistence or external dispatch. Shared hosting authentication and session ownership are host responsibilities.',version:'1.0.0-candidate',supportedInterfaces:interfaces,capabilities:{streaming:true,pushNotifications:false},defaultInputModes:['application/json','text/plain'],defaultOutputModes:['application/json','text/plain'],skills:[
  {id:'v1-build',name:'Compile and recover a Living Thought',description:'Explicit JSON compile/recover requests admit source without evaluating its task. Text asks for structured clarification.',tags:['QDL','v1','compile','recover'],inputModes:['application/json'],outputModes:['application/json']},
  {id:'v1-inspect',name:'Inspect and visualize pinned source',description:'Describe, inspect, source-only verify and deterministic frame requests are passive. Frame requires assembly anatomy.',tags:['QDL','v1','inspect','verify','frame'],inputModes:['application/json'],outputModes:['application/json']},
  {id:'v1-run',name:'Explicitly evaluate typed observations',description:'Only JSON run/reproduce evaluates. Retry exact original requestId and payload after response loss. Computed failures are retained results; actions are simulations.',tags:['QDL','v1','run','reproduce'],inputModes:['application/json'],outputModes:['application/json']}
 ]});
 const taskStore=options.taskStore??new BoundedTaskStore(),executor=new V1Executor(session);if(taskStore instanceof BoundedTaskStore)taskStore.protectActiveTasks((id,scope)=>executor.isActive(id,scope));
 const handler=new DefaultRequestHandler(card,taskStore,executor,undefined,undefined,undefined,undefined,undefined,{keepBusAliveStates:[]}),app=express();app.disable('x-powered-by');
 app.use(express.json({limit:requestLimit,strict:true}));
 app.use('/.well-known/agent-card.json',agentCardHandler({agentCardProvider:handler,legacyCompat:{enabled:legacy}}));
 app.use('/a2a/jsonrpc',jsonRpcHandler({requestHandler:handler,userBuilder:UserBuilder.noAuthentication,legacyCompat:{enabled:legacy}}));
 app.use('/a2a/rest',restHandler({requestHandler:handler,userBuilder:UserBuilder.noAuthentication}));
 const errors:ErrorRequestHandler=(error,_req,res,_next)=>{const status=error?.type==='entity.too.large'?413:400;res.status(status).json({error:{code:status,message:status===413?'A2A request exceeds configured byte limit':'Malformed JSON request'}});};app.use(errors);
 return {app,session,card,handler,taskStore,executor};
}
