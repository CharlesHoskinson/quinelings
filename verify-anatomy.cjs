'use strict';
const assert=require('node:assert/strict'),A=require('./anatomy.js');
const clone=x=>JSON.parse(JSON.stringify(x));let checks=0;function ok(test,message){assert(test,message);checks++;}function rejects(f,message){assert.throws(f,/Anatomy:/,message);checks++;}
const graphs=[
 {nodes:[{id:'in',inputs:[]},{id:'scaled',inputs:['in']},{id:'sum',inputs:['scaled']},{id:'out',inputs:['sum']}]},
 {nodes:[{id:'in',inputs:[]},{id:'a',inputs:['in']},{id:'b',inputs:['in']},{id:'c',inputs:['in']},{id:'out',inputs:['a','b','c']}]},
 {nodes:[{id:'a',inputs:[]},{id:'b',inputs:[]},{id:'c',inputs:[]},{id:'d',inputs:['a','b']},{id:'out',inputs:['c','d']}]}
];
for(const graph of graphs)for(const seed of [0,4294967295]){
 const generated=A.generate(graph,seed),again=A.generate(graph,seed);assert.deepEqual(generated,again);checks++;const {anatomy,gesture}=generated;ok(A.validateOwners(anatomy,graph));
 const nodes=graph.nodes.slice().reverse(),compiled=A.compile(anatomy,nodes,gesture),before=JSON.stringify(generated);const frame=A.frame(compiled,1.2,{budget:4000,crests:4});ok(frame.points.length===16000&&frame.normals.length===12000&&frame.owners.length===4000);ok(new Set(frame.owners).size===nodes.length,'all nodes visibly sampled');ok(frame.ridges.reduce((s,r)=>s+r.line.length,0)<=1806);
 const first=Buffer.from(frame.points.buffer).toString('base64');A.frame(compiled,-17,{budget:4200});assert.equal(Buffer.from(A.frame(compiled,1.2,{budget:4000,crests:4}).points.buffer).toString('base64'),first);checks++;
 const bounds=A.portraitFrame(compiled);for(const phase of [-TAU(),0,.2,1,2,3,4,5,6,13.7]){
  for(const c of anatomy.components){for(const u of [0,.01,.25,.5,.99,1])for(const v of [0,.13,.5,1]){
   const p=A.sample(compiled,c.id,u,v,phase);ok(Object.values(p).every(Number.isFinite),'finite geometry');ok(Math.abs(Math.hypot(p.nx,p.ny,p.nz)-1)<1e-12,'unit normals');ok(Math.abs(p.x-bounds.cx)<=bounds.width/2+1e-12&&Math.abs(p.y-bounds.cy)<=bounds.height/2+1e-12&&Math.abs(p.z-bounds.cz)<=bounds.depth/2+1e-12,'all-phase conservative frame');
  }
  if(c.parent){const actual=A.socket(compiled,c.id,phase),expected=A.sample(compiled,c.parent.component,c.parent.socket.u,c.parent.socket.v,phase);ok(Math.hypot(actual.x-expected.x,actual.y-expected.y,actual.z-expected.z)<1e-14,'shared moving socket');}
  const a=A.sample(compiled,c.id,.38,0,phase),b=A.sample(compiled,c.id,.38,1,phase);assert.deepEqual(a,b);checks++;
  if(c.kind==='spine'){for(const u of [0,1])for(const v of [0,.19,.7]){const a=A.sample(compiled,c.id,u,v,phase),b=A.sample(compiled,c.id,1,v,phase,u===0?'root':'tip');ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<1e-14&&a.owner===b.owner,'caps join sides with consistent owners');}}
  else {for(const [x,z] of [[1,0],[0,1],[-1,0],[0,-1]]){const a=A.sampleChart(compiled,c.id,'north',x,z,phase),b=A.sampleChart(compiled,c.id,'south',x,z,phase);ok(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)<1e-14,'hemisphere equator seam');ok(a.owner===b.owner,'hemisphere ownership seam');}}
 }
 for(const node of nodes)ok(A.anchor(compiled,node.id,phase).owner===nodes.findIndex(n=>n.id===node.id),'anchor owner uses supplied node order');
 }
 assert.equal(JSON.stringify(generated),before);checks++;
 anatomy.components[0].length=.12;gesture.strength=0;assert.equal(Buffer.from(A.frame(compiled,1.2,{budget:4000,crests:4}).points.buffer).toString('base64'),first);checks++;
}
function TAU(){return 2*Math.PI;}
const generated=A.generate(graphs[2],42),mutate=f=>{const a=clone(generated.anatomy);f(a);rejects(()=>A.validateOwners(a,graphs[2]));};
mutate(a=>a.components[0].unknown=1);mutate(a=>a.components[0].length=NaN);mutate(a=>a.components[0].axes[0]=0);mutate(a=>a.components[1].id=a.components[0].id);mutate(a=>a.components[1].parent.component='later');mutate(a=>a.components[1].parent.socket.u=1.1);mutate(a=>a.owners[0].node='absent');mutate(a=>a.owners[0].u[0]=.01);mutate(a=>a.owners[0].u[1]=a.owners[0].u[0]);mutate(a=>a.owners[1].u[0]=0);
for(const g of [{...generated.gesture,ticks:[99,101,400,400]},{...generated.gesture,ticks:[100,100,100,100]},{...generated.gesture,strength:Infinity},{...generated.gesture,kind:'wobble'}])rejects(()=>A.validateGesture(g));
const c=A.compile(generated.anatomy,graphs[2].nodes,generated.gesture);for(const phase of [NaN,Infinity,1e10])rejects(()=>A.frame(c,phase));rejects(()=>A.frame(c,0,{budget:3999}));rejects(()=>A.frame(c,0,{budget:24001}));rejects(()=>A.frame(c,0,{crests:7}));
for(const kind of ['gather','unfurl','glide','hover']){const g={kind,strength:1,ticks:[100,200,300,400]},bound=[.15,.12,.12];for(let j=0;j<=1000;j++)ok(A.score(g,j*TAU()/1000).every((x,i)=>Math.abs(x)<=bound[i]+1e-14),'score interval bounds');assert.deepEqual(A.score(g,0),A.score(g,TAU()));checks++;let t=0;for(const tick of [0,...g.ticks]){t+=tick;const a=A.score(g,(t/1000-1e-7)*TAU()),b=A.score(g,(t/1000+1e-7)*TAU());ok(a.every((x,i)=>Math.abs(x-b[i])<1e-12),'stage value continuity');}}
// Maximum part count uses one global budget and reserves all 64 node owners.
const graph={nodes:Array.from({length:64},(_,i)=>({id:'n'+i,inputs:[]}))},parts=[];for(let i=0;i<16;i++)parts.push({id:'p'+i,kind:'spine',length:.2,radii:[.04,.02],bend:[.1,.05],parent:i?{component:'p'+Math.floor((i-1)/4),socket:{u:.3+.1*(i%4),v:(i%4)/4},angle:(i%4-1.5)*.5,hinge:.04}:null});const owners=parts.flatMap((p,i)=>Array.from({length:4},(_,j)=>({node:'n'+(i*4+j),component:p.id,u:[j/4,(j+1)/4]}))),a={model:'assembly',compiler:A.COMPILER,seed:1,components:parts,owners},max=A.compile(a,graph.nodes,{kind:'unfurl',strength:1,ticks:[100,100,700,100]});for(const budget of [4000,4200,24000]){const f=A.frame(max,2,{budget,crests:4});ok(f.owners.length===budget);ok(new Set(f.owners).size===64);ok([...f.points,...f.normals].every(Number.isFinite));}
let bad=clone(a);bad.components[5].parent.component='p0';rejects(()=>A.validate(bad),'fanout five rejects');bad=clone(a);for(let i=1;i<6;i++)bad.components[i].parent.component='p'+(i-1);rejects(()=>A.validate(bad),'depth five rejects');bad=clone(a);for(let i=1;i<4;i++){bad.components[i].parent.component='p'+(i-1);bad.components[i].parent.hinge=.12;}rejects(()=>A.validate(bad),'path angle rejects');
const g64=A.generate(graph,99);ok(A.validateOwners(g64.anatomy,graph));
// Exercise retained heap in an isolated process with explicit GC. Thirty
// different view budgets must not retain thirty complete material plans.
const cacheProbe=require('node:child_process').execFileSync(process.execPath,['--expose-gc','--max-old-space-size=160','-e',`
const A=require('./anatomy.js'),g=JSON.parse(process.argv[1]),a=A.generate(g,37),c=A.compile(a.anatomy,g.nodes,a.gesture);
for(let i=0;i<30;i++)A.frame(c,i*.1,{budget:4000,crests:2});
global.gc();const baseline=process.memoryUsage().heapUsed;
for(let i=0;i<30;i++)A.frame(c,i*.1,{budget:4000+i*137,crests:2});
global.gc();const retained=process.memoryUsage().heapUsed-baseline;
const rebuilt=A.frame(c,.7,{budget:4000,crests:2});
console.log(JSON.stringify({retained,points:rebuilt.points.length,owners:rebuilt.owners.length,finite:[...rebuilt.normals].every(Number.isFinite)}));
`,JSON.stringify(graphs[2])],{cwd:__dirname,encoding:'utf8'});
const cacheResult=JSON.parse(cacheProbe);ok(cacheResult.retained<12*1024*1024,'view budgets retain a bounded number of material plans');ok(cacheResult.points===16000&&cacheResult.owners===4000&&cacheResult.finite,'evicted material plan regenerates a complete finite frame');
console.log(JSON.stringify({anatomyChecks:checks,status:'passed',scope:'numeric geometry, ownership, phase seeking, closed charts, resource limits; not global beauty or formal JS refinement'}));
