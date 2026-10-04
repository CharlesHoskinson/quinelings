import type { Json, Design, HarmonicGenome, ColorGenome, Frame, FrameOptions } from './types.js';
export type { Json, Design, HarmonicGenome, ColorGenome, Frame, FrameOptions };
export type ValueType =
  | {kind:'number';unit:string;integer?:boolean;min?:number;max?:number}
  | {kind:'string';enum?:string[];minLength?:number;maxLength?:number}
  | {kind:'boolean'|'null'}
  | {kind:'array';element:ValueType;minLength?:number;maxLength?:number;uniqueBy?:string}
  | {kind:'optional';element:ValueType}
  | {kind:'record';fields:Record<string,ValueType>};
export type Operation = 'input'|'literal'|'sum'|'mean'|'min'|'max'|'weightedMean'|'length'|'map'|'sort'|'dedupe'|'filter'|'compare'|'choose'|'get'|'clamp'|'budget'|'action'|'report'|'bfs'|'allocate'|'schedule'|'consensus'|'retry'|'evidence'|'arithmetic'|'compareValues'|'all'|'select'|'evidenceFresh'|'reconcile';
type LegacyStep=Exclude<import('./types.js').IntentStep,{op:'evidence'}>;
export type Step={id:string;type?:ValueType}&(LegacyStep
 |{op:'literal';inputs:[];params:{value:Json};type:ValueType}
 |{op:'input';inputs:[];params:{name:string};type:ValueType}
 |{op:'evidence';inputs:[string];params:{claim:string}}
 |{op:'arithmetic';inputs:[string,string];params:{kind:'add'|'sub'|'mul'|'div'|'floorDiv'|'min'|'max'}}
 |{op:'compareValues';inputs:[string,string];params:{operator:import('./types.js').Comparison}}
 |{op:'all';inputs:[string];params:Record<string,never>}
 |{op:'select';inputs:[string,string];params:{keys:string[];order:{path:string;descending:boolean}[];default:Json}}
 |{op:'evidenceFresh';inputs:[string,string,string];params:{allowedKinds:string[]}}
 |{op:'reconcile';inputs:[string,string];params:Record<string,never>});
export interface Thought {
  observations:{id:string;text:string;input:string;path:(string|number)[];basis:'confirmed'|'testimony'|'suspected'|'open'}[];
  evidence:{id:string;claim:string;source:string;observation:string;value:boolean}[];
  goals:{id:string;text:string;outputs:string[];completion:string}[];
  decisions:{id:string;text:string;guard:string;evidence:string[]}[];
  plans:{id:string;text:string;tasks:string[]}[];
  tasks:{id:string;text:string;nodes:string[];outputs:string[]}[];
}
export interface Intent {
  format:'qdl-intent';version:1;name:string;thought:string|Thought;
  inputs:({id:string;type:ValueType;name:string}|{id:string;type:ValueType;value:Json})[];
  steps:Step[];outputs:string[];design?:Design;repeats?:number;
}
export interface Task {format:'qdl-task';version:1;nodes:(Step&{type:ValueType})[];outputs:string[]}
export interface Payload {
  format:'qdl-program';version:1;name:string;registry:string;registryDigest:string;
  canonical:'qdl-json-1';thought:Thought;task:Task;design:Design;repeats:number;
}
export interface Port {name:string;nodeId:string;type:ValueType}
export interface Artifact {
  id:string;sourceHash:string;source:string;program:Json[];payload:Payload;
  ports:Port[];order:string[];harmonics:HarmonicGenome;colors:ColorGenome;
}
export interface Diagnostic {code:string;path:string;nodeId:string|null;occurrence:number;message:string}
export interface Run {
  format:'qdl-run';version:1;sourceHash:string;registry:string;registryDigest:string;
  inputHash:string;bindings:Record<string,Json>;status:'completed'|'failed';
  occurrences:{occurrence:number;status:'completed'|'failed';outputs:Json[];effects:Json[];
    trace:{nodeId:string;op:Operation;inputs:Json[];value:Json}[];diagnostic:Diagnostic|null}[];
  emitted:[string];constructorSteps:number;
}
export interface ExecutionRecord {
  id:string;artifactId:string;requestId:string;result:Run;
  evidence:'retained'|'asserted';parentRecordId?:string;
}
export interface Verification {source:string;sourceHash:string;constructorSteps:number}
export type RecoveryInput = {source:string;harmonics?:never;colors?:never}|{source?:never;harmonics:HarmonicGenome;colors?:never}|{source?:never;harmonics?:never;colors:ColorGenome};
export interface RunInput {artifactId:string;requestId:string;inputs:Record<string,Json>}
export interface ReproduceInput {artifactId:string;recordId:string;requestId:string}
export interface SessionOptions {maxArtifacts?:number;maxRecords?:number;maxRecordBytes?:number;maxRecordsBytes?:number}
export interface Descriptor {
  format:'qdl-session';version:1;registry:string;registryDigest:string;
  effects:'simulation-only';persistence:'memory';
  limits:{artifacts:number;artifactBytes:number;records:number;recordBytes:number;recordsBytes:number;receipts:number;snapshotBytes:number};
}
export type Request =
  | {operation:'describe'}
  | {operation:'compile';intent:Intent}
  | {operation:'inspect';artifactId:string}
  | {operation:'verify';artifactId:string}
  | {operation:'recover';recovery:RecoveryInput}
  | {operation:'frame';artifactId:string;phase:number;options?:FrameOptions}
  | ({operation:'run'}&RunInput)
  | ({operation:'reproduce'}&ReproduceInput);
export type ResponseFor<R extends Request> =
  R extends {operation:'describe'}?Descriptor:
  R extends {operation:'verify'}?Verification:
  R extends {operation:'frame'}?Frame:
  R extends {operation:'run'|'reproduce'}?ExecutionRecord:Artifact;
export type Response = Artifact|Verification|ExecutionRecord|Descriptor|Frame;
export type TaggedResponse = {[O in Request['operation']]:{operation:O;result:ResponseFor<Extract<Request,{operation:O}>>}}[Request['operation']];
export interface Snapshot {
  format:'qdl-session-snapshot';version:1;registry:string;registryDigest:string;
  artifacts:{id:string;source:string}[];records:ExecutionRecord[];
  receipts:{request:Extract<Request,{operation:'run'|'reproduce'}>;recordId:string}[];
}
export interface ErrorDetail {code:string;path:string;message:string}
