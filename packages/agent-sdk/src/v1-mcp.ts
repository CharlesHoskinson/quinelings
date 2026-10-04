import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
import {z} from 'zod';
import {Session,QdlError} from './v1.js';
import {CompileInputSchema,ArtifactInputSchema,DescribeInputSchema,RecoverySchema,FrameInputSchema,RunInputSchema,ReproduceInputSchema,ResultSchemas} from './v1-schema.js';
import type {Request,ErrorDetail} from './v1-types.js';
export * from './v1-schema.js';
const REQUEST_BYTES=4*1024*1024,RESPONSE_BYTES=8*1024*1024;
const RecoveryInputSchema=z.strictObject({recovery:RecoverySchema});
/** Separate stable-profile adapter. No tools grant external host authority. */
export function createV1McpServer(session:Session=new Session()):McpServer {
 const server=new McpServer({name:'quinelings-v1',version:'1.0.0'});
 function register<S extends z.ZodRawShape>(operation:Request['operation'],description:string,inputSchema:z.ZodObject<S>,readOnly:boolean):void {
  const outputSchema=z.strictObject({result:ResultSchemas[operation]});
  server.registerTool<typeof outputSchema,typeof inputSchema>(`quineling_v1_${operation}`,{description,inputSchema,outputSchema,annotations:{readOnlyHint:readOnly,destructiveHint:false,idempotentHint:true,openWorldHint:false}},async(raw,extra):Promise<CallToolResult>=>{
   try{
    if(extra.signal.aborted)throw new QdlError('cancelled','MCP request cancelled before dispatch');
    if(Buffer.byteLength(JSON.stringify(raw))>REQUEST_BYTES)throw new QdlError('resource-limit','MCP request exceeds 4 MiB');
    const args=inputSchema.parse(raw);
    if(extra.signal.aborted)throw new QdlError('cancelled','MCP request cancelled before dispatch');
    // Session validates and bounds its complete record before local commit. The
    // 8 MiB transport envelope also accommodates bounded artifacts and frames.
    const result=session.dispatch({operation,...args} as Request),structuredContent=outputSchema.parse({result}),text=JSON.stringify(structuredContent);
    if(Buffer.byteLength(text)>RESPONSE_BYTES)throw new QdlError('resource-limit','MCP result exceeds 8 MiB; a committed keyed run can be replayed with its original request');
    return {content:[{type:'text',text}],structuredContent};
   }catch(error){
    const detail:ErrorDetail=error instanceof Error&&error.name==='QdlError'&&'code'in error&&'path'in error?{code:String(error.code),path:String(error.path),message:error.message}:error instanceof z.ZodError?{code:'invalid-input',path:error.issues[0]?.path.length?'$.'+error.issues[0].path.map(String).join('.'):'$',message:error.issues[0]?.message??'Invalid input'}:{code:'execution-failed',path:'$',message:error instanceof Error?error.message:'QDL operation failed'};
    const structuredContent={error:{code:detail.code.slice(0,128),path:detail.path.slice(0,2048),message:detail.message.slice(0,2048)}};
    return {isError:true,content:[{type:'text',text:JSON.stringify(structuredContent)}],structuredContent};
   }
  });
 }
 register('describe','Read the pinned QDL v1 registry, local memory limits and simulation-only capability descriptor. Does not evaluate a task.',DescribeInputSchema,true);
 register('compile','Validate a complete typed QDL v1 intent and store its source-authored constructor. Does not evaluate runtime inputs or simulate actions.',CompileInputSchema,false);
 register('inspect','Read a detached stored v1 artifact, including exact source, declarations, typed ports and recoverable genomes. No task evaluation.',ArtifactInputSchema,true);
 register('verify','Verify exact constructor source emission without supplying inputs or evaluating its task. No execution record is created.',ArtifactInputSchema,true);
 register('recover','Recover a canonical v1 source from exactly one source string, harmonic genome or color genome. Passive admission: no task execution or external action.',RecoveryInputSchema,false);
 register('frame','Sample a detached source body at a finite phase within ±1e9. Assembly sources only; budget 4000..24000 and crests 2..4. Never evaluates tasks or advances time.',FrameInputSchema,true);
 register('run','Explicitly evaluate a v1 artifact with exact typed input bindings. Simulated actions only. Retains completed or computed-failed records. Retry the same requestId and complete payload after response loss; changed payload conflicts.',RunInputSchema,false);
 register('reproduce','Explicitly execute a fresh source copy with its retained parent bindings. Simulated actions only. Reuse the original requestId and complete payload to retry; never automatically invokes external actions.',ReproduceInputSchema,false);
 return server;
}
