'use strict';
const assert=require('node:assert/strict'),F=require('../lifeform-families'),W=require('../woven-body');
const graph=require('../programs/generated/tideglass.json').graph;
for(const mechanism of ['logarithmic-mantle','toroidal-weave','phyllotaxis-fan']){
 const record={...W.author(graph,42),mechanism,geometry:F.authorParams(mechanism,W.topology(graph),42)};delete record.dynamics;delete record.recursion;delete record.embedding;
 const body=F.compile(record,graph),bounds=F.portraitFrame(body),seen=new Set();
 assert.deepEqual(F.frame(body,1,{budget:2048}),F.frame(F.compile(JSON.parse(JSON.stringify(record)),graph),1,{budget:2048}));
 let motion=0;const first=F.frame(body,0,{budget:2048}),later=F.frame(body,2,{budget:2048});for(let j=0;j<first.points.length;j+=4)motion+=Math.hypot(first.points[j]-later.points[j],first.points[j+1]-later.points[j+1]);assert(motion/2048>.02);
 for(let phase=0;phase<Math.PI*2;phase+=Math.PI/8){const frame=F.frame(body,phase,{budget:2048});for(let j=0;j<frame.points.length;j+=4){const [x,y,z,a]=frame.points.subarray(j,j+4);assert([x,y,z,a].every(Number.isFinite));assert(Math.abs(x-bounds.cx)<bounds.width/2&&Math.abs(y-bounds.cy)<bounds.height/2&&Math.abs(z-bounds.cz)<bounds.depth/2);assert(a>=0&&a<=1);seen.add(graph.nodes[frame.owners[j/4]].id);}for(const ridge of frame.ridges)for(const p of ridge.line){assert(Object.values(p).every(Number.isFinite));assert(Math.abs(p.x-bounds.cx)<bounds.width/2&&Math.abs(p.y-bounds.cy)<bounds.height/2&&Math.abs(p.z-bounds.cz)<bounds.depth/2);}}
 assert.deepEqual([...seen].sort(),graph.nodes.map(n=>n.id).sort());assert.throws(()=>F.validate({...record,geometry:{...record.geometry,curl:Infinity}}));assert.notDeepEqual(record.geometry,F.authorParams(mechanism,W.topology(graph),45));
}
console.log('Three mathematical chart families: source determinism, finite samples, owned tissue, phase enclosure, meaningful gesture and seed parameters verified.');
