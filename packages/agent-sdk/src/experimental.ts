/** Explicit experimental extension. Frozen QDL 1 sources keep their interpreter. */
// @ts-expect-error The audited experimental runtime is shared with the website.
import capsuleRuntime from '../../../visual-capsule.js';
// @ts-expect-error The audited deterministic sampler is shared with the website.
import bodyRuntime from '../../../woven-body.js';

export interface Operation { id: string; op: string; inputs: string[]; params: Record<string, unknown> }
export interface TaskGraph { nodes: Operation[]; outputs: string[]; name?: string }
export interface Territory { node: string; component: number; u: [number, number] }
export interface MathematicalBody {
  model: 'woven-field-experimental';
  mechanism: 'clifford-flow' | 'recursive-julia' | 'recursive-affine' | 'logarithmic-mantle' | 'toroidal-weave' | 'phyllotaxis-fan' | 'lorenz-flow' | 'pleated-braid';
  seed: number; strands: number; folds: number; turns: number;
  topology: { depth: number; fanout: number; convergence: number; guards: number; effects: number };
  territories: Territory[];
  dynamics?: Record<string, unknown>; geometry?: Record<string, unknown>;
  embedding?: Record<string, unknown>;
}
export interface VisualDesign { woven: MathematicalBody; [key: string]: unknown }
export interface VisualCapsule {
  source: string; program: unknown[]; taskSource: string; task: TaskGraph;
  stable: boolean; design: VisualDesign;
}
export interface Frame { points: Float32Array; owners: Uint16Array; ridges: { line: {x:number;y:number;z:number;alpha:number;owner:number}[]; material:string }[] }
export interface CompiledBody { record: MathematicalBody; nodes: Operation[]; territories: (Territory & {owner:number})[] }
export interface LegacyExecutionRecord { taskProfile:'legacy'; emitted: string[]; tasks: {output:unknown[];trace:unknown[]}[]; steps:number; taskSourceEmitted?:string[] }

export interface StableExecutionRecord {taskProfile:'qdl-v1';format:'qdl-run';version:1;bindings:Record<string,unknown>;occurrences:{occurrence:number;status:string;outputs:unknown[];effects:unknown[];trace:unknown[];diagnostic:unknown}[];emitted:string[];steps:number;constructorSteps:number;taskSourceEmitted:string[]}
export interface ConstructionRecord {emitted:string[];tasks:[];trace:[];steps:number}
export type ExecutionRecord = LegacyExecutionRecord | StableExecutionRecord | ConstructionRecord;

export const VisualCapsule = capsuleRuntime as {
  author(taskSource:string,seed?:number):VisualCapsule;
  build(taskSource:string,design:VisualDesign):VisualCapsule;
  admit(source:string):VisualCapsule;
  verify(capsule:VisualCapsule):{exactSource:true;source:string;constructorSteps:number};
  recover(capsule:VisualCapsule,encoding:'harmonics'|'colors'):VisualCapsule;
  execute(program:unknown[],options?:{constructionOnly?:boolean;bindings?:Record<string,unknown>}):ExecutionRecord;
};
export const MathematicalLifeforms = bodyRuntime as {
  author(graph:TaskGraph,seed?:number):MathematicalBody;
  validate(body:MathematicalBody,graph?:TaskGraph):true;
  compile(body:MathematicalBody,graph:TaskGraph):CompiledBody;
  frame(body:CompiledBody,phase:number,options?:{budget?:number;crests?:boolean}):Frame;
  anchor(body:CompiledBody,nodeId:string,phase:number):{x:number;y:number;z:number;alpha:number;owner:number};
  portraitFrame(body:CompiledBody):{cx:number;cy:number;cz:number;width:number;height:number;depth:number};
};
