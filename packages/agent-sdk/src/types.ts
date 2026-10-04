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
  | {op:'retry'; inputs:[string]; params:{maxAttempts:number}}
  | {op:'evidence'; inputs:[string]; params:{claim?:string}}
);
export interface Intent {
  format: 'quineling-intent'; name: string; thought: string;
  inputs: { id: string; value: Json; type: IntentType }[];
  steps: IntentStep[];
  outputs: string[]; assumptions?: string[];
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
export interface HarmonicGenome {format:'quineling-harmonics-1'; bands:number[][]}
export interface ColorGenome {format:'quineling-chroma-1'; pixels:([number,number,number]|null)[][]}
export interface Artifact {
  id:string; source:string; program:Json[]; graph:Graph; design:Design;
  intent?:Intent; contract?:Contract; sourceMap:SourceMapping[];
  harmonics:HarmonicGenome; colors:ColorGenome;
}
export interface TaskRecord {output:Json[]; effects:Json[]; trace:Json[]; graph:Graph}
export interface ExecutionResult {result:Json; emitted:string[]; tasks:TaskRecord[]; plans:Json[]; trace:Json[]; steps:number}
export interface ExecutionRecord {id:string; artifactId:string; source:string; result:ExecutionResult; parentRecordId?:string}
export interface CreationOptions {seed?:number; repeats?:number}
export type CreationResult = {diagnostics:Diagnostic[]; assumptions:string[]} & (
  {status:'supported'; artifact:Artifact} | {status:Exclude<ParseStatus,'supported'>; artifact?:never}
);
export interface FrameOptions {budget?:number; crests?:number}
export interface Frame {
/** points: xyzw (w=0.18), four floats per sample. normals: xyz, three per sample. */
  points:number[]; normals:number[]; owners:number[];
  ridges:{line:{x:number;y:number;z:number;nx:number;ny:number;nz:number;owner:number}[]; primary:boolean}[];
  nodeIds:string[]; nodeColors:string[]; nodeRoles:string[];
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
