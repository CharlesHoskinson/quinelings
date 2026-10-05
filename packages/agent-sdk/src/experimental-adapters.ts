/** Opt-in transports for the explicitly experimental source capsule. */
import {z} from 'zod';
import {QuinelingError} from './index.js';
import {JsonSchema} from './schema.js';
import {VisualCapsule,MathematicalLifeforms} from './experimental.js';
const source=z.string().min(1).max(65536),phase=z.number().finite().min(-1e6).max(1e6);
const shapes={
 visualAuthor:{taskSource:source,seed:z.number().int().min(0).max(0xffffffff).optional()},
 visualAdmit:{source},visualRecover:{source,encoding:z.enum(['harmonics','colors'])},
 visualFrame:{source,phase,budget:z.number().int().min(128).max(12000).optional(),crests:z.boolean().optional()},
 visualAnchor:{source,phase,nodeId:z.string().min(1).max(160)},visualBounds:{source},visualVerify:{source},
 visualRun:{source,bindings:z.record(z.string().min(1).max(160),JsonSchema).refine(value=>Object.keys(value).length<=64).optional(),constructionOnly:z.boolean().optional()}
} satisfies Record<string,z.ZodRawShape>;
export type VisualOperation=keyof typeof shapes;
export type VisualRequest={ [K in VisualOperation]:{operation:K}&z.infer<z.ZodObject<(typeof shapes)[K]>> }[VisualOperation];
export function isVisualOperation(operation:string):operation is VisualOperation{return Object.hasOwn(shapes,operation);}
export function parseVisualRequest(raw:unknown):VisualRequest{
 if(!raw||typeof raw!=='object'||!('operation' in raw)||typeof raw.operation!=='string'||!isVisualOperation(raw.operation))throw new QuinelingError('invalid-input','Unknown experimental visual operation.','$.operation');
 try{return z.strictObject({operation:z.literal(raw.operation),...shapes[raw.operation]}).parse(raw) as VisualRequest;}
 catch(error){if(error instanceof z.ZodError)throw new QuinelingError('invalid-input',error.issues[0]?.message??'Invalid visual request.','$.'+(error.issues[0]?.path.map(String).join('.')??''));throw error;}
}
/** Author/admit/watch/recovery are passive; only visualRun evaluates the task. */
export function dispatchVisualRequest(raw:unknown):object{
 const request=parseVisualRequest(raw);
 const checked=(text:string)=>{if(Buffer.byteLength(text)>65536)throw new QuinelingError('source-budget','Source exceeds 65,536 UTF-8 bytes.','$.source');return text;};
 let capsule;
 try{capsule=request.operation==='visualAuthor'?VisualCapsule.author(checked(request.taskSource),request.seed):VisualCapsule.admit(checked(request.source));}
 catch(error){if(error instanceof QuinelingError)throw error;throw new QuinelingError('invalid-source',error instanceof Error?error.message:'Invalid visual capsule.','$.source');}
 switch(request.operation){
 case 'visualAuthor':case 'visualAdmit':return capsule;
 case 'visualRecover':return VisualCapsule.recover(capsule,request.encoding);
 case 'visualVerify':return VisualCapsule.verify(capsule);
 case 'visualRun':return VisualCapsule.execute(capsule.program,{...(request.bindings===undefined?{}:{bindings:request.bindings}),...(request.constructionOnly===undefined?{}:{constructionOnly:request.constructionOnly})});
 }
 const body=MathematicalLifeforms.compile(capsule.design.woven,capsule.task);
 if(request.operation==='visualBounds')return MathematicalLifeforms.portraitFrame(body);
 if(request.operation==='visualAnchor'){
 if(!capsule.task.nodes.some(node=>node.id===request.nodeId))throw new QuinelingError('invalid-input','Unknown graph node.','$.nodeId');
 return MathematicalLifeforms.anchor(body,request.nodeId,request.phase);
 }
 const frame=MathematicalLifeforms.frame(body,request.phase,{budget:request.budget??2048,crests:request.crests??false});
 return {points:Array.from(frame.points),owners:Array.from(frame.owners),ridges:frame.ridges};
}
export type VisualToolRegister=<S extends z.ZodRawShape>(name:string,description:string,shape:S,run:(args:z.infer<z.ZodObject<S>>)=>unknown,readOnly:boolean,idempotent:boolean)=>void;
export function registerVisualTools(register:VisualToolRegister):void{
 for(const operation of Object.keys(shapes) as VisualOperation[]){const suffix=operation.slice(6).toLowerCase();register('quineling_visual_'+suffix,operation==='visualRun'?'Explicitly execute the retained source task with supplied bindings, or emit its constructor only. Local bounded computation; no host authority.':'Experimental mathematical capsule '+suffix+'. Passive source-bound operation; does not execute its retained task.',shapes[operation],args=>dispatchVisualRequest({operation,...args}),operation!=='visualRun',operation!=='visualRun');}
}
export function experimentalVisualFlag(args:string[]):boolean{
 if(args.length>1||args.some(arg=>arg!=='--experimental-visual'))throw new Error('Allowed flag: --experimental-visual (once).');
 return args.length===1;
}
