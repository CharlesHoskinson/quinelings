import type {Heredity,RanchRequest,RanchResponse,RanchResponseFor} from './ranch-types.js';
export type * from './ranch-types.js';
/** QDL is experimental; package revisions do not freeze the language. */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type IntentType =
  | { kind: 'number'; unit: string }
  | { kind: 'boolean' | 'string' | 'null' }
  | { kind: 'array'; element: IntentType }
  | { kind: 'optional'; element: IntentType }
  | { kind: 'record'; fields: Record<string, IntentType> };
export type Operation = 'sum'|'mean'|'min'|'max'|'weightedMean'|'length'|'map'|'sort'|'dedupe'|'filter'|'compare'|'choose'|'get'|'clamp'|'budget'|'action'|'report'|'bfs'|'allocate'|'schedule'|'consensus'|'retry'|'evidence';
export type Comparison = 'eq'|'ne'|'gt'|'gte'|'lt'|'lte';
export type IntentStep = {id:string} & (
  | {op:'sum'|'mean'|'min'|'max'|'length'|'schedule'; inputs:[string]; params:Record<string,never>}
  | {op:'weightedMean'|'budget'|'allocate'; inputs:[string,string]; params:Record<string,never>}
  | {op:'choose'; inputs:[string,string,string]; params:Record<string,never>}
  | {op:'map'; inputs:[string]; params:{kind:'square';factor?:never}|{kind:'multiply';factor:number}}
  | {op:'sort'; inputs:[string]; params:{key?:string;descending?:boolean}}
  | {op:'dedupe'; inputs:[string]; params:{key?:string}}
  | {op:'filter'; inputs:[string]; params:{operator:Comparison;value:Json;key?:string}}
  | {op:'compare'; inputs:[string]; params:{operator:Comparison;value:Json}}
  | {op:'get'; inputs:[string]; params:{path:string}}
  | {op:'clamp'; inputs:[string]; params:{min:number;max:number}}
  | {op:'action'; inputs:[string,string]; params:{allowed:boolean;action:string}}
  | {op:'report'; inputs:string[]; params:{labels:string[]}}
  | {op:'bfs'; inputs:[string,string]; params:{start:string;goal:string}}
  | {op:'consensus'; inputs:[string]; params:{required:number}}
  | {op:'retry'; inputs:[string]; params:{maxAttempts:OneToEight}}
  | {op:'evidence'; inputs:[string]; params:{claim?:string}}
);
export interface Intent {
  format: 'quineling-intent'; name: string; thought: string;
  inputs: { id: string; value: Json; type: IntentType }[];
  steps: IntentStep[];
  outputs: [string, ...string[]]; assumptions?: string[];
}
export interface Diagnostic { code: string; path: string; message: string }
export interface SourceMapping { nodeId: string; clause: string; start?: number; end?: number }
export type ParseStatus = 'supported'|'clarify'|'unsupported'|'inconsistent';
export type ParseResult = {diagnostics:Diagnostic[]; assumptions:string[]; sourceMap:SourceMapping[]} & (
  {status:'supported'; intent:Intent} | {status:Exclude<ParseStatus,'supported'>; intent?:never}
);
export interface Graph {
  version: 1; name?: string;
  nodes: { id: string; op: Operation|'literal'; inputs: string[]; params: Record<string, Json> }[];
  outputs: string[]; design?: Design;
}
export interface Attachment {component: string; socket: {u: number; v: number}; angle: number; hinge: number}
export type Component =
  | {id:string; kind:'spine'; length:number; radii:[number,number]; bend:[number,number]; parent:Attachment|null}
  | {id:string; kind:'chamber'; axes:[number,number,number]; parent:Attachment|null};
export interface Anatomy {
  model:'assembly'; compiler:'qdl-assembly-experimental'; seed:number;
  components:Component[]; owners:{node:string; component:string; u:[number,number]}[];
}
export interface Gesture {kind:'gather'|'unfurl'|'glide'|'hover'; strength:number; ticks:[number,number,number,number]}
export interface Design {
  qdl:1; family:string; anatomy?:Anatomy; heredity?:Heredity;
  motion:{clock:'separate'; phaseRate:number; reducedMotion:'freeze'; rhythm?:Record<string,Json>; gesture?:Gesture};
  organ:Record<string,Json>; filament:Record<string,Json>; ink:Record<string,Json>;
  surface:Record<string,Json>; light:Record<string,Json>; composition:Record<string,number>;
  chroma?:Record<string,Json>;
}
export interface Contract {
  format:'quineling-contract'; registry:string; types:Record<string,IntentType>;
  assumptions:string[]; effectMode:'pure'|'simulation'; sourceBytes:number; provenance:string;
}
export interface HarmonicGenome {format:'quineling-harmonics-1'; bands:FixedLength<number,32>[]}
export interface ColorGenome {format:'quineling-chroma-1'; pixels:FixedLength<[number,number,number]|null,32>[]}
export interface Artifact {
  id:string; source:string; program:Json[]; graph:Graph; design:Design;
  intent?:Intent; contract?:Contract; sourceMap:SourceMapping[];
  harmonics:HarmonicGenome; colors:ColorGenome;
}
export interface TaskRecord {output:Json[]; effects:Json[]; trace:Json[]; graph:Graph}
export interface ExecutionResult {result:Json; emitted:string[]; tasks:TaskRecord[]; plans:Json[]; trace:Json[]; steps:number}
export interface ExecutionRecord {id:string; artifactId:string; source:string; result:ExecutionResult; parentRecordId?:string}
/** Integer accepted by the runtime where the schema bound is 1..8. */
export type OneToEight = 1|2|3|4|5|6|7|8;
/** Crest lines accepted by Session.frame and Runtime.frame. */
export type CrestCount = 2|3|4;
export type NodeRole = 'input'|'process'|'decision'|'quote'|'action'|'report';
/**
 * Hash-prefixed color. This is wider than the wire pattern `/^#[0-9a-f]{6}$/i`
 * and still rejects a bare name such as `red`.
 */
export type HexColor = `#${string}`;
/**
 * Array with a tracked length. A recursive tuple of 301 elements exceeds
 * TypeScript instantiation depth, so crest lines use this brand.
 */
export type FixedLength<T, N extends number> = T[] & {readonly length:N};
export interface CreationOptions {seed?:number; repeats?:OneToEight}
export type CreationResult = {diagnostics:Diagnostic[]; assumptions:string[]} & (
  {status:'supported'; artifact:Artifact} | {status:Exclude<ParseStatus,'supported'>; artifact?:never}
);
export interface FrameOptions {
  /** Integer sample count. The wire schema and spec/design.qnt validProfile samples both use 4000..24000. Omitting it samples 12000 points. A numeric brand is not used: plain numeric literals must stay assignable. */
  budget?:number;
  /** Integer crest count. Omitting it returns 3 lines. */
  crests?:CrestCount;
}
export interface Frame {
/** points: xyzw, four floats per sample. w is Math.fround(0.18) on every sample. normals: xyz, three per sample. owners index nodeIds, nodeRoles and nodeColors. */
  points:number[]; normals:number[]; owners:number[];
  ridges:{line:FixedLength<{x:number;y:number;z:number;nx:number;ny:number;nz:number;owner:number},301>; primary:boolean}[];
  nodeIds:string[]; nodeColors:HexColor[]; nodeRoles:NodeRole[];
}
export type RecoveryInput = {source:string; harmonics?:never; colors?:never} | {source?:never; harmonics:HarmonicGenome; colors?:never} | {source?:never; harmonics?:never; colors:ColorGenome};
export type Request =
  | {operation:'parse'; thought:string}
  | {operation:'create'; thought:string; options?:CreationOptions}
  | {operation:'compile'; intent:Intent; options?:CreationOptions}
  | {operation:'inspect'; artifactId:string}
  | {operation:'run'; artifactId:string}
  | {operation:'reproduce'; artifactId:string; recordId:string}
  | {operation:'recover'; recovery:RecoveryInput}
  | {operation:'frame'; artifactId:string; phase:number; options?:FrameOptions}
  | RanchRequest;
export type Response = RanchResponse|ParseResult|CreationResult|Artifact|ExecutionRecord|{artifact:Artifact;record:ExecutionRecord}|Frame;
export interface ProposalProvider {propose(thought:string, context:{signal?:AbortSignal}):Promise<ParseResult>}

export type ResponseFor<R extends Request> =
  R extends {operation:'parse'} ? ParseResult :
  R extends {operation:'create'} ? CreationResult :
  R extends {operation:'compile'|'inspect'|'recover'} ? Artifact :
  R extends {operation:'run'} ? ExecutionRecord :
  R extends {operation:'reproduce'} ? {artifact:Artifact;record:ExecutionRecord} :
  R extends {operation:'frame'} ? Frame : RanchResponseFor<R>;
export type TaggedResponse = {[O in Request['operation']]:{operation:O;result:ResponseFor<Extract<Request,{operation:O}>>}}[Request['operation']];
