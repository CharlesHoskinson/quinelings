// Pure helpers for Session.bake. Formal model: spec/v1-bake.qnt (selection,
// reservedCount, sourceBudget). Nothing here evaluates tasks or reads session state.
/** Smallest budget the shared sampler (anatomy.frame) accepts. */
export const FRAME_FLOOR=4000;
/** Smallest accepted bake budget. The worst admissible anatomy reserves
 * 128 owner regions + 2 cap charts x 16 components = 160 samples. */
export const BAKE_FLOOR=512;
export const BAKE_CEILING=24000;
export const BAKE_MAX_FRAMES=240;
/** Aggregate cap on frames x budget (about 12 MiB of float32 positions). */
export const BAKE_MAX_SAMPLES=1<<20;
export const INT16_SCALE=32767;
interface CompiledPart {regions:readonly unknown[];charts:readonly string[]}
/** Samples anatomy.plan() reserves before area distribution: one interior
 * sample per owner region and one per non-side chart, in plan order. */
export function reservedCount(parts:readonly CompiledPart[]):number {
 return parts.reduce((sum,p)=>sum+p.regions.length+p.charts.filter(c=>c!=='side').length,0);
}
export const sourceBudget=(budget:number)=>budget>=FRAME_FLOOR?budget:FRAME_FLOOR;
/** Indices into a sampler frame of sourceBudget(budget) samples. Keeps the whole
 * reserved prefix, then takes budget-reserved strided picks from the tail.
 * Strictly increasing; requires reserved <= budget (checked by the caller). */
export function selection(reserved:number,budget:number,floor=FRAME_FLOOR):Uint32Array {
 const out=new Uint32Array(budget);
 if(budget>=floor){for(let i=0;i<budget;i++)out[i]=i;return out;}
 const k=budget-reserved,d=floor-reserved;
 for(let i=0;i<reserved;i++)out[i]=i;
 for(let j=0;j<k;j++)out[reserved+j]=reserved+Math.floor(j*d/k);
 return out;
}
export interface Box {cx:number;cy:number;cz:number;width:number;height:number;depth:number}
/** Writes (p-center)/scale into a fresh buffer; refuses points outside the
 * phase-invariant portrait box instead of silently clamping them. */
export function normalizer(box:Box,quantize:'int16'|'float32'){
 const center=[box.cx,box.cy,box.cz] as const,scale=Math.max(box.width,box.height,box.depth)/2;
 if(!(Number.isFinite(scale)&&scale>0)||!center.every(Number.isFinite))throw Object.assign(new Error('Body bounds are degenerate'),{code:'unsupported-frame'});
 const alloc=(n:number)=>quantize==='int16'?new Int16Array(n):new Float32Array(n);
 const write=(target:Int16Array|Float32Array,offset:number,x:number,y:number,z:number)=>{
  const xyz=[x,y,z];
  for(let a=0;a<3;a++){const v=(xyz[a]!-center[a]!)/scale;
   if(!(Math.abs(v)<=1+1e-9))throw Object.assign(new Error('Sample lies outside the portrait bounds'),{code:'unsupported-frame'});
   const c=Math.max(-1,Math.min(1,v));target[offset+a]=quantize==='int16'?Math.round(c*INT16_SCALE):c;}
 };
 return {center:[...center] as [number,number,number],scale,alloc,write};
}
