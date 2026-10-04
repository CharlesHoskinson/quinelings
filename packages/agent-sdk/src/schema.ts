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
