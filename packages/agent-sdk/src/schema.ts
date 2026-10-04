import { z } from 'zod';
import type { Intent, IntentStep, IntentType, Json } from './types.js';

const key = z.string().min(1).max(16384).regex(/^(?!__proto__$|constructor$|prototype$)[\s\S]+$/);
const field = z.string().min(1).max(16384).regex(/^(?!__proto__$|constructor$|prototype$)[^.]+$/);
const id = z.string().regex(/^(?!__proto__$|constructor$|prototype$)[A-Za-z][A-Za-z0-9_-]{0,63}$/);
const unit = z.string().min(1).max(64).regex(/^(one|[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)(\*[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)*$/);
const comparison = z.enum(['eq','ne','gt','gte','lt','lte']);
const propertyPath = z.string().min(1).max(16384).regex(/^(?!.*(?:^|\.)(?:__proto__|constructor|prototype)(?:\.|$))[^.]+(?:\.[^.]+)*$/);
const empty = z.strictObject({});

// This is a structural walk of already parsed data, never a kernel evaluation.
function depthBound(value: unknown, context: z.RefinementCtx): void {
  const stack: {value:unknown;path:(string|number)[]}[]=[{value,path:[]}];
  while(stack.length){
    const entry=stack.pop()!;
    if(entry.path.length>24){context.addIssue({code:'custom',path:entry.path,message:'JSON nesting exceeds 24'});return;}
    if(entry.value&&typeof entry.value==='object')for(const [key,item] of Object.entries(entry.value))stack.push({value:item,path:[...entry.path,Array.isArray(entry.value)?Number(key):key]});
  }
}
function recordBound(value:Record<string,unknown>):boolean{return Object.keys(value).length<=512;}


/** Inert finite JSON only. The runtime additionally enforces depth, node and byte budgets before compiling. */
export const JsonSchema: z.ZodType<Json> = z.lazy(() => z.union([
  z.null(), z.boolean(), z.number().finite(), z.string().max(16384),
  z.array(JsonSchema).max(512), z.record(key,JsonSchema).refine(recordBound,'Record exceeds 512 entries').meta({maxProperties:512})
])).superRefine(depthBound).describe('Finite JSON: at most 512 array/record entries; Zod and runtime refinements reject nesting beyond 24 levels.');

/** Units and nested record/array types are visible in MCP tool discovery. */
export const IntentTypeSchema: z.ZodType<IntentType> = z.lazy(() => z.discriminatedUnion('kind',[
  z.strictObject({kind:z.literal('number'),unit}),
  z.strictObject({kind:z.literal('boolean')}),
  z.strictObject({kind:z.literal('string')}),
  z.strictObject({kind:z.literal('null')}),
  z.strictObject({kind:z.literal('array'),element:IntentTypeSchema}),
  z.strictObject({kind:z.literal('optional'),element:IntentTypeSchema}),
  z.strictObject({kind:z.literal('record'),fields:z.record(field,IntentTypeSchema).refine(recordBound,'Record type exceeds 512 fields').meta({maxProperties:512})})
]));

const unary = z.tuple([id]);
const binary = z.tuple([id,id]);
const ternary = z.tuple([id,id,id]);

/** Each operation has exact ordered ports and a closed parameter object. */
export const IntentStepSchema: z.ZodType<IntentStep> = z.discriminatedUnion('op',[
  z.strictObject({id,op:z.literal('sum'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('mean'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('min'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('max'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('length'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('schedule'),inputs:unary,params:empty}),
  z.strictObject({id,op:z.literal('weightedMean'),inputs:binary,params:empty}),
  z.strictObject({id,op:z.literal('budget'),inputs:binary,params:empty}),
  z.strictObject({id,op:z.literal('allocate'),inputs:binary,params:empty}),
  z.strictObject({id,op:z.literal('choose'),inputs:ternary,params:empty}),
  z.strictObject({id,op:z.literal('map'),inputs:unary,params:z.discriminatedUnion('kind',[
    z.strictObject({kind:z.literal('square')}),
    z.strictObject({kind:z.literal('multiply'),factor:z.number().finite()})
  ])}),
  z.strictObject({id,op:z.literal('sort'),inputs:unary,params:z.strictObject({key:propertyPath.optional(),descending:z.boolean().optional()})}),
  z.strictObject({id,op:z.literal('dedupe'),inputs:unary,params:z.strictObject({key:propertyPath.optional()})}),
  z.strictObject({id,op:z.literal('filter'),inputs:unary,params:z.strictObject({operator:comparison,value:JsonSchema,key:propertyPath.optional()})}),
  z.strictObject({id,op:z.literal('compare'),inputs:unary,params:z.strictObject({operator:comparison,value:JsonSchema})}),
  z.strictObject({id,op:z.literal('get'),inputs:unary,params:z.strictObject({path:propertyPath})}),
  z.strictObject({id,op:z.literal('clamp'),inputs:unary,params:z.strictObject({min:z.number().finite(),max:z.number().finite()})}),
  z.strictObject({id,op:z.literal('action'),inputs:binary,params:z.strictObject({allowed:z.boolean(),action:z.string().min(1).max(120)})}),
  z.strictObject({id,op:z.literal('report'),inputs:z.array(id).max(16),params:z.strictObject({labels:z.array(field).max(16)})}),
  z.strictObject({id,op:z.literal('bfs'),inputs:binary,params:z.strictObject({start:z.string().max(16384),goal:z.string().max(16384)})}),
  z.strictObject({id,op:z.literal('consensus'),inputs:unary,params:z.strictObject({required:z.number().int().min(1).max(Number.MAX_SAFE_INTEGER)})}),
  z.strictObject({id,op:z.literal('retry'),inputs:unary,params:z.strictObject({maxAttempts:z.number().int().min(1).max(8)})}),
  z.strictObject({id,op:z.literal('evidence'),inputs:unary,params:z.strictObject({claim:z.string().max(16384).optional()})})
]);

/** Structural schema only: parsing it never executes a kernel or grants effect authority. */
export const IntentSchema = z.strictObject({
  format:z.literal('quineling-intent'),
  name:z.string().min(1).max(120),
  thought:z.string().max(16384),
  inputs:z.array(z.strictObject({id,value:JsonSchema,type:IntentTypeSchema})).max(64),
  steps:z.array(IntentStepSchema).max(64),
  outputs:z.array(id).min(1).max(16),
  assumptions:z.array(z.string().max(512)).max(32).optional()
}).superRefine(depthBound) satisfies z.ZodType<Intent>;

/** Experimental source-authored genetics: closed integer authoring fields. */
export const TraitsSchema=z.strictObject({elongation:z.number().int().min(-1000).max(1000),spread:z.number().int().min(-1000).max(1000),curvature:z.number().int().min(-1000).max(1000),gestureGain:z.number().int().min(-1000).max(1000),tempo:z.number().int().min(-1000).max(1000),pigmentGain:z.number().int().min(-1000).max(1000)});
const ranchId=z.string().min(1).max(128),digest=z.string().regex(/^[0-9a-f]{64}$/),counter=z.number().int().min(0).max(1000000);
export const ParentPinSchema=z.strictObject({artifactId:ranchId,intentHash:digest.nullable()});
export const OffspringRecipeSchema=z.discriminatedUnion('kind',[
 z.strictObject({kind:z.literal('compose'),donorOutput:id,recipientInput:id}),
 z.strictObject({kind:z.literal('mate'),donorNode:id,replaceNode:id}),
 z.strictObject({kind:z.literal('merge')}),z.strictObject({kind:z.literal('body'),base:z.union([z.literal(0),z.literal(1)])})]);
export const OffspringOriginSchema=z.discriminatedUnion('kind',[
 z.strictObject({kind:z.literal('manual')}),z.strictObject({kind:z.literal('pairing'),worldId:ranchId,proposalId:ranchId,parentResidents:z.tuple([ranchId,ranchId]),epochs:z.tuple([counter,counter])})]);
export const OffspringInputSchema=z.strictObject({parents:z.tuple([ParentPinSchema,ParentPinSchema]),recipe:OffspringRecipeSchema,nonce:z.number().int().min(0).max(4294967295),style:z.strictObject({mutation:z.enum(['none','gentle']),traits:TraitsSchema.optional()}),origin:OffspringOriginSchema}).superRefine((x,c)=>{if(x.style.traits&&x.style.mutation!=='none')c.addIssue({code:'custom',path:['style','mutation'],message:'Complete traits override requires mutation:none'});});
export const FrameOptionsSchema=z.strictObject({budget:z.number().int().min(4000).max(24000).optional(),crests:z.number().int().min(2).max(4).optional()});
export const OffspringFrameSchema=z.strictObject({input:OffspringInputSchema,candidateId:z.string().regex(/^qc_[0-9a-f]{64}$/),childSourceHash:digest,phase:z.number().finite().min(-1e9).max(1e9),options:FrameOptionsSchema.optional()});
export const OffspringTargetSchema=z.discriminatedUnion('kind',[z.strictObject({kind:z.literal('library')}),z.strictObject({kind:z.literal('world'),worldId:ranchId,expectedRevision:counter})]);
export const AdmissionSchema=z.strictObject({input:OffspringInputSchema,candidateId:z.string().regex(/^qc_[0-9a-f]{64}$/),childSourceHash:digest,target:OffspringTargetSchema,requestId:ranchId});
export const LineageSchema=z.strictObject({artifactId:ranchId.optional(),cursor:z.number().int().min(0).max(128).optional(),limit:z.number().int().min(1).max(32).optional()});
export const AnnotationSchema=z.strictObject({artifactId:ranchId,intent:IntentSchema});
export const WorldConfigSchema=z.strictObject({worldKey:z.string().min(1).max(64),seed:z.number().int().min(0).max(4294967295),affinity:z.enum(['structural','neutral']).optional()});
export const WorldActionSchema=z.discriminatedUnion('kind',[
 z.strictObject({kind:z.literal('import'),artifactId:ranchId}),z.strictObject({kind:z.literal('retire'),residentId:ranchId}),
 z.strictObject({kind:z.literal('participate'),residentId:ranchId,enabled:z.boolean()}),z.strictObject({kind:z.literal('invite'),residentId:ranchId,partnerId:ranchId}),
 z.strictObject({kind:z.literal('cancelProposal'),proposalId:ranchId}),z.strictObject({kind:z.literal('advance'),ticks:z.union([z.literal(1),z.literal(2),z.literal(3),z.literal(4)])})]);
export const WorldCommandSchema=z.strictObject({worldId:ranchId,expectedRevision:counter,sequence:z.number().int().min(1).max(1000000),command:WorldActionSchema});
