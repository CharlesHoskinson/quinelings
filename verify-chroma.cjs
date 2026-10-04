'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),C=require('./chroma.js'),Q=require('./core.js'),D=require('./qdl.js'),M=require('./morphology.js');
const checks=[],ids=JSON.parse(fs.readFileSync('programs/manifest.json'));
function check(name,fn){fn();checks.push(name);}
const lens={kind:'scalar',id:'fault-score',label:'Fault score',unit:'score',domain:[0,1],threshold:.625,bindings:[{node:'faultScore',path:[]}]};
function specimen(id,scalar=false){const item=JSON.parse(fs.readFileSync(`programs/${id}.json`)),d=D.create(item.skin.family);d.chroma={model:'material-territories',palette:'roles-1',strength:.85};if(scalar)d.chroma.lens=structuredClone(lens);const program=Q.makeTaskProgram(item.graph,1,d);return {item,program,shape:Q.describe(program)};}
const hex=/^#[0-9a-f]{6}$/;
function frozen(value){if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))frozen(child);}return value;}
check('Every current and legacy opcode has an explicit body role independent of opcode ink',()=>{assert.equal(Object.keys(C.ROLES).length,6);for(const op of Q.OPS){assert(Object.hasOwn(C.ROLE_MAP,op));assert(hex.test(C.ROLES[C.role(op)].color));assert.equal(Q.instructionFromColor(Q.instructionColor(op)),op);}assert.throws(()=>C.role('made-up'));});
check('All ten bodies have deterministic material owners, positive node territories and pure source',()=>{
 for(const id of ids){const {program,shape}=specimen(id),before=Q.canon(shape),source=Q.canon(program),field=C.compile(shape),seen=new Set(),total=M.ribbonCount(shape);
  assert.strictEqual(field,C.compile(shape));
  for(let k=0;k<total;k++)for(let i=0;i<160;i++)for(const v of [-.95,-.4,.4,.95]){const u=(i+.5)/160,index=field.owner(u,v,k,total);assert(Number.isInteger(index)&&index>=0&&index<shape.nodes.length);seen.add(index);assert.equal(index,field.owner(u,v,k,total));}
  assert.equal(seen.size,shape.nodes.length,id+' has invisible nodes');
  for(const phase of [0,.7,19,700]){const material=M.surfaceFrame(shape,phase,true);assert(material.points.every(Number.isFinite));assert.equal(field.owner(.32,.4,3,total),C.compile(shape).owner(.32,.4,3,total));}
  assert.equal(Q.canon(shape),before);assert.equal(Q.canon(program),source);
 }
});
check('Closed body seams share ownership on both sides and exact endpoints',()=>{
 for(const id of ids){const {shape}=specimen(id);if(!['moth','torus','bloom'].includes(shape.design.family))continue;const field=C.compile(shape),total=M.ribbonCount(shape);
  for(let k=0;k<total;k++)for(const v of [-1,-.3,0,.5,1]){assert.equal(field.owner(0,v,k,total),field.owner(1,v,k,total));assert.equal(field.owner(1e-9,v,k,total),field.owner(1-1e-9,v,k,total));}
 }
});
check('Territory identities survive source node ordering and scalar focus has useful area',()=>{
 const {shape}=specimen('lanternkeeper',true),reordered=structuredClone(shape);reordered.nodes.reverse();const a=C.compile(shape),b=C.compile(reordered),total=M.ribbonCount(shape);let focus=0,count=0;
 for(let k=0;k<total;k++)for(let i=0;i<180;i++)for(const v of [-.9,-.4,.4,.9]){const u=(i+.5)/180,id=shape.nodes[a.owner(u,v,k,total)].id;assert.equal(id,reordered.nodes[b.owner(u,v,k,total)].id);focus+=id==='faultScore';count++;}
 assert(focus/count>=.05,`faultScore share ${focus/count}`);
});
check('Actual low/high recorded faultScore results produce distinct fixed-domain colors',()=>{
 const {shape,item}=specimen('lanternkeeper',true),low=Q.runTask(item.graph,{faultSignals:[0,0,0]}),high=Q.runTask(item.graph,{faultSignals:[1,1,1]}),a=C.resolveLens(shape.design,low),b=C.resolveLens(shape.design,high),i=shape.nodes.findIndex(n=>n.id==='faultScore');
 assert.equal(a.byNode.faultScore.value,0);assert.equal(b.byNode.faultScore.value,1);assert.equal(a.byNode.faultScore.normalized,0);assert.equal(b.byNode.faultScore.normalized,1);assert.notEqual(C.colorFor(shape,i,a),C.colorFor(shape,i,b));
 assert.equal(C.resolveLens(shape.design,{trace:[...high.trace].reverse()}).byNode.faultScore.color,b.byNode.faultScore.color);
});
check('Missing trace, stale source, missing node, invalid value and overflow stay distinct',()=>{
 const {shape}=specimen('lanternkeeper',true),resolve=value=>C.resolveLens(shape.design,{trace:[{edge:'faultScore',value}]}).byNode.faultScore;
 assert.equal(C.resolveLens(shape.design,null).status,'not-evaluated');assert.equal(C.resolveLens(shape.design,null).byNode.faultScore.status,'not-evaluated');assert.equal(C.resolveLens(shape.design,{trace:[]}).byNode.faultScore.status,'not-evaluated');
 assert.equal(C.resolveLens(shape.design,{trace:[{edge:'faultScore',value:.4}]},'stale').byNode.faultScore.status,'stale');
 for(const value of [null,false,true,'0.5',NaN,Infinity,-Infinity,{},[]])assert.equal(resolve(value).status,'invalid');
 assert.equal(resolve(-2).status,'underflow');assert.equal(resolve(-2).value,-2);assert.equal(resolve(-2).normalized,0);assert.equal(resolve(3).status,'overflow');assert.equal(resolve(3).value,3);assert.equal(resolve(3).normalized,1);
 assert.equal(resolve(0).status,'valid');assert.equal(resolve(1).status,'valid');
 assert.equal(C.resolveLens(shape.design,{trace:[{edge:'faultScore',value:.3},{edge:'faultScore',value:.4}]}).byNode.faultScore.status,'invalid');
});
check('Bindings use exact ordered own paths and reject inherited or prototype access',()=>{
 const {shape}=specimen('lanternkeeper',true),design=structuredClone(shape.design),binding=design.chroma.lens.bindings[0];binding.path=['rows',1,'score'];
 const record={trace:[{edge:'faultScore',value:{rows:[{score:.1},{score:.8}]}}]};assert.equal(C.resolveLens(design,record).byNode.faultScore.value,.8);
 binding.path=['rows',0,'score'];assert.equal(C.resolveLens(design,record).byNode.faultScore.value,.1);
 binding.path=['score'];assert.equal(C.resolveLens(design,{trace:[{edge:'faultScore',value:Object.create({score:.4})}]}).byNode.faultScore.status,'invalid');
 for(const key of ['__proto__','constructor','prototype']){binding.path=[key];assert.equal(C.resolveLens(design,{trace:[{edge:'faultScore',value:{[key]:.5}}]}).byNode.faultScore.status,'invalid');}
});
check('Lens resolution and coloring accept frozen inputs without source or trace mutation',()=>{
 const {shape,item,program}=specimen('lanternkeeper',true),record=Q.runTask(item.graph),before=Q.canon([shape,record,program]);frozen(shape);frozen(record);frozen(program);
 const state=C.resolveLens(shape.design,record);for(let i=0;i<shape.nodes.length;i++)assert(hex.test(C.colorFor(shape,i,state)));assert.equal(Q.canon([shape,record,program]),before);
});
check('Palette and quantitative scale remain finite in gamut; omission and zero strength stay neutral',()=>{
 const {shape}=specimen('lanternkeeper',true);for(let i=-100;i<=1100;i++)assert(hex.test(C.scalarColor(i/1000)));assert.throws(()=>C.scalarColor(NaN));
 for(const strength of [0,.1,.5,.85,1]){shape.design.chroma.strength=strength;for(let i=0;i<shape.nodes.length;i++)assert(hex.test(C.colorFor(shape,i)));}
 shape.design.chroma.strength=0;assert.equal(C.colorFor(shape,0),shape.design.ink.neutral);shape.design.chroma.strength=1;assert.equal(C.colorFor(shape,0),C.ROLES[C.role(shape.nodes[0].op)].color);
 delete shape.design.chroma;assert.equal(C.colorFor(shape,0),shape.design.ink.neutral);assert.equal(C.resolveLens(shape.design,null).status,'off');
});
console.log(JSON.stringify({ok:true,checks},null,2));
