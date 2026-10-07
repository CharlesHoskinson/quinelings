import {z} from 'zod';
import type {Json,ValueType,Intent,Run,Artifact,ExecutionRecord,Request,Snapshot,Frame} from './v1-types.js';
const safe=z.string().min(1).max(16384).regex(/^(?!__proto__$|prototype$|constructor$)[\s\S]+$/);
const id=z.string().regex(/^(?!__proto__$|prototype$|constructor$)[A-Za-z][A-Za-z0-9_-]{0,63}$/);
const artifactId=z.string().regex(/^ql_[0-9a-f]{64}$/);
const digest=z.string().regex(/^[0-9a-f]{64}$/);
const requestId=z.string().min(1).max(128);
const source=z.string().max(65536);
const boundedText=(max:number)=>z.string().max(max*2).refine(s=>Array.from(s).length<=max,'Text scalar limit exceeded');
function depth(value:unknown,ctx:z.RefinementCtx):void {
 const stack:{value:unknown;depth:number}[]=[{value,depth:0}];
 while(stack.length){const item=stack.pop()!;if(item.depth>24){ctx.addIssue({code:'custom',message:'JSON nesting exceeds 24'});return;}if(item.value&&typeof item.value==='object')for(const v of Object.values(item.value))stack.push({value:v,depth:item.depth+1});}
}
export const JsonSchema:z.ZodType<Json>=z.lazy(()=>z.union([z.null(),z.boolean(),z.number().finite(),z.string().max(16384),z.array(JsonSchema).max(512),z.record(safe,JsonSchema).refine(x=>Object.keys(x).length<=512,'Record field limit')])).superRefine(depth);
export const ValueTypeSchema:z.ZodType<ValueType>=z.lazy(()=>z.discriminatedUnion('kind',[
 z.strictObject({kind:z.literal('number'),unit:z.string().min(1).max(64),integer:z.boolean().optional(),min:z.number().finite().optional(),max:z.number().finite().optional()}),
 z.strictObject({kind:z.literal('string'),enum:z.array(z.string().max(16384)).max(32).optional(),minLength:z.number().int().min(0).max(16384).optional(),maxLength:z.number().int().min(0).max(16384).optional()}),
 z.strictObject({kind:z.literal('boolean')}),z.strictObject({kind:z.literal('null')}),
 z.strictObject({kind:z.literal('array'),element:ValueTypeSchema,minLength:z.number().int().min(0).max(512).optional(),maxLength:z.number().int().min(0).max(512).optional(),uniqueBy:safe.optional()}),
 z.strictObject({kind:z.literal('optional'),element:ValueTypeSchema}),
 z.strictObject({kind:z.literal('record'),fields:z.record(safe,ValueTypeSchema).refine(x=>Object.keys(x).length<=512,'Record type field limit')})
]));
const operation=z.enum(['input','literal','sum','mean','min','max','weightedMean','length','map','sort','dedupe','filter','compare','choose','get','clamp','budget','action','report','bfs','allocate','schedule','consensus','retry','evidence','arithmetic','compareValues','all','select','evidenceFresh','reconcile']);
const comparison=z.enum(['eq','ne','gt','gte','lt','lte']);
const path=z.string().min(1).max(16384).refine(x=>x.split('.').every(k=>k.length>0&&!['__proto__','prototype','constructor'].includes(k)),'Unsafe property path');
const empty=z.strictObject({}),unary=z.tuple([id]),binary=z.tuple([id,id]),ternary=z.tuple([id,id,id]);
const step=(op:string,inputs:z.ZodType<string[]>,params:z.ZodType)=>z.strictObject({id,op:z.literal(op),inputs,params,type:ValueTypeSchema.optional()});
export const StepSchema=z.union([
 ...(['sum','mean','min','max','length','schedule','all'] as const).map(op=>step(op,unary,empty)),
 ...(['weightedMean','budget','allocate','reconcile'] as const).map(op=>step(op,binary,empty)),
 step('choose',ternary,empty),step('literal',z.tuple([]),z.strictObject({value:JsonSchema})),step('input',z.tuple([]),z.strictObject({name:id})),
 step('map',unary,z.discriminatedUnion('kind',[z.strictObject({kind:z.literal('square')}),z.strictObject({kind:z.literal('multiply'),factor:z.number().finite()})])),
 step('sort',unary,z.strictObject({key:path.optional(),descending:z.boolean().optional()})),step('dedupe',unary,z.strictObject({key:path.optional()})),
 step('filter',unary,z.strictObject({operator:comparison,value:JsonSchema,key:path.optional()})),step('compare',unary,z.strictObject({operator:comparison,value:JsonSchema})),
 step('get',unary,z.strictObject({path})),step('clamp',unary,z.strictObject({min:z.number().finite(),max:z.number().finite()})),
 step('action',binary,z.strictObject({allowed:z.boolean(),action:boundedText(120).refine(x=>x.length>0)})),
 step('report',z.array(id).max(16),z.strictObject({labels:z.array(safe).max(16)})),step('bfs',binary,z.strictObject({start:safe,goal:safe})),
 step('consensus',unary,z.strictObject({required:z.number().int().min(1).max(Number.MAX_SAFE_INTEGER)})),step('retry',unary,z.strictObject({maxAttempts:z.number().int().min(1).max(8)})),
 step('evidence',unary,z.strictObject({claim:safe})),step('arithmetic',binary,z.strictObject({kind:z.enum(['add','sub','mul','div','floorDiv','min','max'])})),
 step('compareValues',binary,z.strictObject({operator:comparison})),
 step('select',binary,z.strictObject({keys:z.array(safe).max(512),order:z.array(z.strictObject({path,descending:z.boolean()})).max(512),default:z.record(safe,JsonSchema)})),
 step('evidenceFresh',ternary,z.strictObject({allowedKinds:z.array(z.enum(['observation','testimony','inference'])).max(3)}))
]);
const refs=z.array(id).max(64),text=boundedText(512);
export const ThoughtSchema=z.strictObject({
 observations:z.array(z.strictObject({id,text,input:id,path:z.array(z.union([safe,z.number().int().min(0).max(511)])).max(8),basis:z.enum(['confirmed','testimony','suspected','open'])})).max(32),
 evidence:z.array(z.strictObject({id,claim:text,source:text,observation:id,value:z.boolean()})).max(32),
 goals:z.array(z.strictObject({id,text,outputs:refs,completion:id})).max(32),
 decisions:z.array(z.strictObject({id,text,guard:id,evidence:refs})).max(32),
 plans:z.array(z.strictObject({id,text,tasks:refs})).max(32),
 tasks:z.array(z.strictObject({id,text,nodes:refs,outputs:refs})).max(32)
});
const design=z.record(safe,JsonSchema);
export const IntentSchema=z.strictObject({format:z.literal('qdl-intent'),version:z.literal(1),name:boundedText(120).refine(x=>x.length>0),thought:z.union([text,ThoughtSchema]),inputs:z.array(z.union([z.strictObject({id,type:ValueTypeSchema,name:id}),z.strictObject({id,type:ValueTypeSchema,value:JsonSchema})])).max(64),steps:z.array(StepSchema).max(64),outputs:z.array(id).min(1).max(16),design:design.optional(),repeats:z.number().int().min(1).max(8).optional()}).superRefine(depth) as unknown as z.ZodType<Intent>;
export const PortSchema=z.strictObject({name:id,nodeId:id,type:ValueTypeSchema});
export const PayloadSchema=z.strictObject({format:z.literal('qdl-program'),version:z.literal(1),name:boundedText(120),registry:safe,registryDigest:digest,canonical:z.literal('qdl-json-1'),thought:ThoughtSchema,task:z.strictObject({format:z.literal('qdl-task'),version:z.literal(1),nodes:z.array(StepSchema.and(z.object({type:ValueTypeSchema}))).min(1).max(64),outputs:z.array(id).min(1).max(16)}),design,repeats:z.number().int().min(1).max(8)});
const harmonics=z.strictObject({format:z.literal('quineling-harmonics-1'),bands:z.array(z.array(z.number().int().min(0).max(256)).length(32)).min(1).max(2049)});
const colors=z.strictObject({format:z.literal('quineling-chroma-1'),pixels:z.array(z.array(z.tuple([z.number().int().min(0).max(255),z.number().int().min(0).max(255),z.number().int().min(0).max(255)]).nullable()).length(32)).min(1).max(2049)});
export const HarmonicGenomeSchema=harmonics;
export const ColorGenomeSchema=colors;
export const ArtifactSchema=z.strictObject({id:artifactId,sourceHash:artifactId,source,program:z.array(JsonSchema),payload:PayloadSchema,ports:z.array(PortSchema).max(64),order:refs,harmonics,colors}) as unknown as z.ZodType<Artifact>;
export const BindingsSchema=z.record(safe,JsonSchema).refine(x=>Object.keys(x).length<=64,'At most 64 input ports');
export const RunSchema=z.strictObject({
 format:z.literal('qdl-run'),version:z.literal(1),sourceHash:artifactId,registry:safe,registryDigest:digest,inputHash:z.string().regex(/^qi_[0-9a-f]{64}$/),bindings:BindingsSchema,status:z.enum(['completed','failed']),
 occurrences:z.array(z.strictObject({occurrence:z.number().int().min(0).max(7),status:z.enum(['completed','failed']),outputs:z.array(JsonSchema).max(16),effects:z.array(JsonSchema).max(64),trace:z.array(z.strictObject({nodeId:id,op:operation,inputs:z.array(JsonSchema).max(16),value:JsonSchema})).max(64),diagnostic:z.strictObject({code:z.string().max(64),path:z.string().max(256),nodeId:id.nullable(),occurrence:z.number().int().min(0).max(7),message:z.string().max(512)}).nullable()})).min(1).max(8),
 emitted:z.tuple([source]),constructorSteps:z.number().int().min(0).max(20000)
}) as unknown as z.ZodType<Run>;
export const ExecutionRecordSchema=z.strictObject({id:z.string().regex(/^run_[0-9a-f-]{36}$/),artifactId,requestId,result:RunSchema,evidence:z.enum(['retained','asserted']),parentRecordId:z.string().regex(/^run_[0-9a-f-]{36}$/).optional()}) as z.ZodType<ExecutionRecord>;
export const VerificationSchema=z.strictObject({source,sourceHash:artifactId,constructorSteps:z.number().int().min(0).max(20000)});
export const RecoverySchema=z.union([z.strictObject({source}),z.strictObject({harmonics}),z.strictObject({colors})]);
export const FrameOptionsSchema=z.strictObject({budget:z.number().int().min(4000).max(24000).optional(),crests:z.number().int().min(2).max(4).optional()});
export const FrameInputSchema=z.strictObject({artifactId,phase:z.number().finite().min(-1e9).max(1e9),options:FrameOptionsSchema.optional()});
const coordinate=z.number().finite(),owner=z.number().int().min(0).max(63);
export const FrameSchema=z.strictObject({
 points:z.array(coordinate).min(16000).max(96000),normals:z.array(coordinate).min(12000).max(72000),owners:z.array(owner).min(4000).max(24000),
 ridges:z.array(z.strictObject({line:z.array(z.strictObject({x:coordinate,y:coordinate,z:coordinate,nx:coordinate,ny:coordinate,nz:coordinate,owner})).length(301),primary:z.boolean()})).min(2).max(4),
 nodeIds:z.array(id).min(1).max(64),nodeColors:z.array(z.string().regex(/^#[0-9a-f]{6}$/i)).min(1).max(64),nodeRoles:z.array(z.enum(['input','process','decision','quote','action','report'])).min(1).max(64)
}).superRefine((f,ctx)=>{if(f.points.length!==4*f.owners.length||f.normals.length!==3*f.owners.length||f.nodeColors.length!==f.nodeIds.length||f.nodeRoles.length!==f.nodeIds.length||f.owners.some(i=>i>=f.nodeIds.length))ctx.addIssue({code:'custom',message:'Frame buffers and owner metadata disagree'});}) as z.ZodType<Frame>;
export const BakeOptionsSchema=z.strictObject({frames:z.number().int().min(1).max(240).optional(),budget:z.number().int().min(512).max(24000).optional(),crests:z.number().int().min(2).max(4).optional(),quantize:z.enum(['int16','float32']).optional()});
export const BakeInputSchema=z.strictObject({artifactId,options:BakeOptionsSchema.optional()});
export const TraceOwnersInputSchema=z.strictObject({recordId:z.string().regex(/^run_[0-9a-f-]{36}$/)});
export const RunInputSchema=z.strictObject({artifactId,requestId,inputs:BindingsSchema});
export const ReproduceInputSchema=z.strictObject({artifactId,recordId:z.string().regex(/^run_[0-9a-f-]{36}$/),requestId});
const runRequest=z.strictObject({operation:z.literal('run'),...RunInputSchema.shape}),reproduceRequest=z.strictObject({operation:z.literal('reproduce'),...ReproduceInputSchema.shape});
export const CompileInputSchema=z.strictObject({intent:IntentSchema});
export const ArtifactInputSchema=z.strictObject({artifactId});
export const DescribeInputSchema=z.strictObject({});
export const RequestSchema=z.discriminatedUnion('operation',[
 z.strictObject({operation:z.literal('describe')}),z.strictObject({operation:z.literal('compile'),intent:IntentSchema}),z.strictObject({operation:z.literal('inspect'),artifactId}),z.strictObject({operation:z.literal('verify'),artifactId}),z.strictObject({operation:z.literal('recover'),recovery:RecoverySchema}),z.strictObject({operation:z.literal('frame'),...FrameInputSchema.shape}),runRequest,reproduceRequest
]) as z.ZodType<Request>;
export const DescriptorSchema=z.strictObject({format:z.literal('qdl-session'),version:z.literal(1),registry:safe,registryDigest:digest,effects:z.literal('simulation-only'),persistence:z.literal('memory'),limits:z.strictObject({artifacts:z.number().int(),artifactBytes:z.number().int(),records:z.number().int(),recordBytes:z.number().int(),recordsBytes:z.number().int(),receipts:z.number().int(),snapshotBytes:z.number().int()})});
export const ResultSchemas={describe:DescriptorSchema,compile:ArtifactSchema,inspect:ArtifactSchema,verify:VerificationSchema,recover:ArtifactSchema,frame:FrameSchema,run:ExecutionRecordSchema,reproduce:ExecutionRecordSchema} as const;
export const TaggedResponseSchema=z.union([
 z.strictObject({operation:z.literal('describe'),result:DescriptorSchema}),
 z.strictObject({operation:z.literal('compile'),result:ArtifactSchema}),
 z.strictObject({operation:z.literal('inspect'),result:ArtifactSchema}),
 z.strictObject({operation:z.literal('verify'),result:VerificationSchema}),
 z.strictObject({operation:z.literal('recover'),result:ArtifactSchema}),
 z.strictObject({operation:z.literal('frame'),result:FrameSchema}),
 z.strictObject({operation:z.literal('run'),result:ExecutionRecordSchema}),
 z.strictObject({operation:z.literal('reproduce'),result:ExecutionRecordSchema})
]);
export const ResponseSchema=z.union([ArtifactSchema,ExecutionRecordSchema,VerificationSchema,DescriptorSchema,FrameSchema]);
export const SnapshotSchema=z.strictObject({format:z.literal('qdl-session-snapshot'),version:z.literal(1),registry:safe,registryDigest:digest,artifacts:z.array(z.strictObject({id:artifactId,source})).max(1024),records:z.array(ExecutionRecordSchema).max(4096),receipts:z.array(z.strictObject({request:z.union([runRequest,reproduceRequest]),recordId:z.string().regex(/^run_[0-9a-f-]{36}$/)})).max(4096)}) as z.ZodType<Snapshot>;
export const ErrorSchema=z.strictObject({code:z.string().max(128),path:z.string().max(2048),message:z.string().max(2048)});
