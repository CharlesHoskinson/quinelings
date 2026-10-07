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

type VisualCapsuleApi = {
  author(taskSource:string,seed?:number):VisualCapsule;
  build(taskSource:string,design:VisualDesign):VisualCapsule;
  admit(source:string):VisualCapsule;
  verify(capsule:VisualCapsule):{exactSource:true;source:string;constructorSteps:number};
  recover(capsule:VisualCapsule,encoding:'harmonics'|'colors'):VisualCapsule;
  execute(program:unknown[],options?:{constructionOnly?:boolean;bindings?:Record<string,unknown>}):ExecutionRecord;
};
const capsules = capsuleRuntime as VisualCapsuleApi & {isCapsule(program:unknown):boolean;runtime:{canon(value:unknown):string}};
/** True when a task payload in the program carries the visual capsule format
 * marker, using the same walk as visual-capsule.js admission. */
function claimsCapsule(program:unknown):boolean {
  const stack:unknown[]=[program];let visits=0;
  while(stack.length){
    const t=stack.pop();if(!Array.isArray(t)||t[0]==='quote'||++visits>100000)continue;
    const quoted=Array.isArray(t[1])&&t[1][0]==='quote'?t[1][1]:undefined;
    if(t[0]==='run'&&Array.isArray(t[1])&&t[1][0]==='quote'){stack.push(quoted);continue;}
    if(t[0]==='task'&&Array.isArray(t[1])&&t[1][0]==='quote'){
      if(quoted&&typeof quoted==='object'&&(quoted as {format?:unknown}).format==='quineling-visual-capsule')return true;
      continue;
    }
    for(const x of t.slice(1))stack.push(x);
  }
  return false;
}
/** Explicit experimental runtime. A program that claims to be a visual capsule
 * must pass admission before any execution, including construction-only runs;
 * it never falls back to the legacy interpreter (spec/visual-capsule.qnt
 * admittedOnly). Programs without the capsule marker keep the legacy path. */
export const VisualCapsule: VisualCapsuleApi = {
  ...capsules,
  execute(program:unknown[],options?:{constructionOnly?:boolean;bindings?:Record<string,unknown>}):ExecutionRecord {
    if(claimsCapsule(program)&&!capsules.isCapsule(program)){
      capsules.admit(capsules.runtime.canon(program));
      throw new Error('Visual capsule admission failed');
    }
    return capsules.execute(program,options);
  }
};
export const MathematicalLifeforms = bodyRuntime as {
  author(graph:TaskGraph,seed?:number):MathematicalBody;
  validate(body:MathematicalBody,graph?:TaskGraph):true;
  compile(body:MathematicalBody,graph:TaskGraph):CompiledBody;
  /** Sample a compiled woven body. `budget` is an integer from 128 through 100000. `crests` is a boolean; omitting it draws crests. MCP and A2A visualFrame accept budget 128..12000 and default to budget 2048 and crests false. Point groups are [x, y, z, alpha]. Session.frame is a separate assembly sampler. */
  frame(body:CompiledBody,phase:number,options?:{budget?:number;crests?:boolean}):Frame;
  anchor(body:CompiledBody,nodeId:string,phase:number):{x:number;y:number;z:number;alpha:number;owner:number};
  portraitFrame(body:CompiledBody):{cx:number;cy:number;cz:number;width:number;height:number;depth:number};
};
