(function(root){
'use strict';
const TAU=2*Math.PI, COMPILER='qdl-assembly-experimental';
const TEMPLATES={gather:[[0,0,0],[-.06,-.03,-.06],[.09,.04,.08],[0,0,0],[0,0,0]],unfurl:[[0,0,0],[-.03,.02,-.07],[.06,-.02,.10],[0,0,0],[0,0,0]],glide:[[0,0,0],[-.025,-.06,-.03],[.04,.08,.05],[0,0,0],[0,0,0]],hover:[[0,0,0],[-.025,.02,-.02],[.025,-.02,.02],[0,0,0],[0,0,0]]};
const fail=m=>{throw Error('Anatomy: '+m);},check=(b,m)=>{if(!b)fail(m);};
function fields(o,keys){check(o&&typeof o==='object'&&!Array.isArray(o),'expected record');check(Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k)),'unknown or missing fields');}
function number(x,a,b){check(typeof x==='number'&&Number.isFinite(x)&&x>=a&&x<=b,'number outside ['+a+','+b+']');}
function id(x){check(typeof x==='string'&&Array.from(x).length>=1&&Array.from(x).length<=64,'invalid ID');}
function vector(x,n,a,b){check(Array.isArray(x)&&x.length===n,'invalid vector');x.forEach(v=>number(v,a,b));}
function freeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}
const copy=x=>JSON.parse(JSON.stringify(x));
function validateGesture(g){fields(g,['kind','strength','ticks']);check(Object.hasOwn(TEMPLATES,g.kind),'unknown gesture');number(g.strength,0,1);vector(g.ticks,4,100,700);check(g.ticks.every(Number.isInteger)&&g.ticks.reduce((a,b)=>a+b,0)===1000,'ticks must be integers summing to 1000');return true;}
function validate(a){
 fields(a,['model','compiler','seed','components','owners']);check(a.model==='assembly'&&a.compiler===COMPILER,'unknown assembly compiler');number(a.seed,0,4294967295);check(Number.isInteger(a.seed),'seed must be uint32');
 check(Array.isArray(a.components)&&a.components.length>=1&&a.components.length<=16,'need 1–16 components');const parts=new Map();
 for(const c of a.components){
  if(c.kind==='spine'){fields(c,['id','kind','length','radii','bend','parent']);number(c.length,.12,1.2);vector(c.radii,2,.015,.16);vector(c.bend,2,-.2,.2);}
  else if(c.kind==='chamber'){fields(c,['id','kind','axes','parent']);vector(c.axes,3,.04,.35);}
  else fail('unknown component kind');
  id(c.id);check(!parts.has(c.id),'duplicate component ID');let depth=0,angleBudget=0;
  if(c.parent===null)check(parts.size===0,'only the first component may be root');
  else {check(parts.size>0,'first component must be root');fields(c.parent,['component','socket','angle','hinge']);const p=parts.get(c.parent.component);check(p,'parent must be an earlier component');fields(c.parent.socket,['u','v']);number(c.parent.socket.u,0,1);number(c.parent.socket.v,0,1);number(c.parent.angle,-Math.PI,Math.PI);number(c.parent.hinge,-.12,.12);depth=p.depth+1;angleBudget=p.angleBudget+Math.abs(c.parent.hinge);check(depth<=4,'attachment depth exceeds four');check(++p.children<=4,'component has more than four children');check(angleBudget<=.35,'joint path exceeds .35 radians');}
  parts.set(c.id,{depth,angleBudget,children:0});
 }
 check(Array.isArray(a.owners)&&a.owners.length>=1&&a.owners.length<=128,'need 1–128 owner territories');const groups=new Map(a.components.map(c=>[c.id,[]]));
 for(const o of a.owners){fields(o,['node','component','u']);id(o.node);check(groups.has(o.component),'unknown ownership component');vector(o.u,2,0,1);check(o.u[0]<o.u[1],'territory must have positive width');check((o.u[0]+o.u[1])/2>o.u[0]&&(o.u[0]+o.u[1])/2<o.u[1],'territory has no representable interior');groups.get(o.component).push(o);}
 for(const regions of groups.values()){regions.sort((x,y)=>x.u[0]-y.u[0]);check(regions.length&&regions[0].u[0]===0&&regions.at(-1).u[1]===1,'ownership must cover each component');for(let i=1;i<regions.length;i++)check(regions[i-1].u[1]===regions[i].u[0],'ownership gap or overlap');}
 return true;
}
function nodeIDs(graph){const ns=Array.isArray(graph)?graph:graph?.nodes;check(Array.isArray(ns)&&ns.length>=1&&ns.length<=64,'need 1–64 graph nodes');const ids=ns.map(n=>typeof n==='string'?n:n?.id);ids.forEach(id);check(new Set(ids).size===ids.length,'duplicate graph node');return ids;}
function validateOwners(a,graph){validate(a);const ids=new Set(nodeIDs(graph)),seen=new Set();for(const o of a.owners){check(ids.has(o.node),'unknown owner node '+o.node);seen.add(o.node);}check([...ids].every(n=>seen.has(n)),'every graph node needs positive territory');return true;}
// The axial sweep has y=L*u and L>0: its side chart stays regular without
// numerical frame transport. Disk caps meet its circular boundaries exactly.
function local(c,u,v,chart='side'){
 const angle=TAU*(v===1?0:v),co=Math.cos(angle),si=Math.sin(angle);
 if(c.kind==='spine'){
  const s=u===0||u===1?0:Math.sin(Math.PI*u),cx=c.bend[0]*c.length*s,cz=c.bend[1]*c.length*s,r=c.radii[0]+(c.radii[1]-c.radii[0])*u;
  if(chart==='root'||chart==='tip'){const end=chart==='root'?0:1,rad=c.radii[end]*u;return {p:[rad*co,end*c.length,rad*si],n:[0,end?1:-1,0],u:end};}
  const dx=c.bend[0]*c.length*Math.PI*Math.cos(Math.PI*u),dz=c.bend[1]*c.length*Math.PI*Math.cos(Math.PI*u),dr=c.radii[1]-c.radii[0];
  return {p:[cx+r*co,c.length*u,cz+r*si],n:[c.length*co,-dx*co-dz*si-dr,c.length*si],u};
 }
 const q=2*Math.sqrt(Math.max(0,u*(1-u))),[ax,ay,az]=c.axes,y=2*u-1;
 return {p:[ax*q*co,ay*(1+y),az*q*si],n:[q*co/ax,y/ay,q*si/az],u};
}
function chartLocal(c,chart,a,b){
 const r2=a*a+b*b;check(r2<=1,'chart coordinate outside unit disk');
 if(c.kind==='spine'){check(chart==='root'||chart==='tip','spine disk chart must be root or tip');const end=chart==='tip'?1:0;return {p:[c.radii[end]*a,c.length*end,c.radii[end]*b],n:[0,end?1:-1,0],u:end};}
 check(chart==='north'||chart==='south','unknown chamber chart');const sign=chart==='north'?1:-1,d=1+r2,x=2*a/d,z=2*b/d,y=sign*(1-r2)/d,[ax,ay,az]=c.axes;
 return {p:[ax*x,ay*(1+y),az*z],n:[x/ax,y/ay,z/az],u:(1+y)/2};
}
const matvec=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
function matmul(a,b){const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r.push(a[i*3]*b[j]+a[i*3+1]*b[j+3]+a[i*3+2]*b[j+6]);return r;}
function normalMatrix(m){return [m[4]*m[8]-m[5]*m[7],m[5]*m[6]-m[3]*m[8],m[3]*m[7]-m[4]*m[6],m[2]*m[7]-m[1]*m[8],m[0]*m[8]-m[2]*m[6],m[1]*m[6]-m[0]*m[7],m[1]*m[5]-m[2]*m[4],m[2]*m[3]-m[0]*m[5],m[0]*m[4]-m[1]*m[3]];}
function rotation(a){const c=Math.cos(a),s=Math.sin(a);return [c,-s,0,s,c,0,0,0,1];}
function phaseValue(phase){number(phase,-1e9,1e9);return ((phase/TAU)%1+1)%1;}
function score(g,phase){validateGesture(g);const at=phaseValue(phase)*1000;let start=0,i=0;while(i<3&&at>=start+g.ticks[i])start+=g.ticks[i++];const z=Math.max(0,Math.min(1,(at-start)/g.ticks[i])),h=z*z*z*(10+z*(-15+6*z)),a=TEMPLATES[g.kind][i],b=TEMPLATES[g.kind][i+1];return a.map((x,k)=>(x+(b[k]-x)*h)*g.strength);}
const compiledSet=new WeakSet(),poseCache=new WeakMap(),planCache=new WeakMap(),bufferCache=new WeakMap();
function assertCompiled(c){check(compiledSet.has(c),'expected compiled anatomy');}
function compile(anatomy,nodes,gesture){
 validateOwners(anatomy,nodes);validateGesture(gesture);const a=copy(anatomy),g=copy(gesture),ids=nodeIDs(nodes),indices=new Map(ids.map((id,i)=>[id,i]));
 const parts=a.components.map(c=>({...c,charts:c.kind==='spine'?['side','root','tip']:['north','south'],regions:a.owners.filter(o=>o.component===c.id).sort((x,y)=>x.u[0]-y.u[0]).map(o=>({...o,index:indices.get(o.node)}))}));
 const out=freeze({anatomy:a,gesture:g,nodeIds:ids,parts});compiledSet.add(out);return out;
}
function pose(c,phase){assertCompiled(c);phaseValue(phase);const old=poseCache.get(c);if(old?.phase===phase)return old;const [sigma,lean,opening]=score(c.gesture,phase),R=rotation(lean),a=Math.exp(-sigma/2),b=Math.exp(sigma),base=matmul(R,[a,0,0,0,b,0,0,0,a]),maps=[],byID=new Map();
 for(const part of c.parts){let m=base,t=[0,0,0];if(part.parent){const p=byID.get(part.parent.component),s=local(p.part,part.parent.socket.u,part.parent.socket.v),v=matvec(p.m,s.p);t=v.map((x,i)=>x+p.t[i]);m=matmul(p.m,rotation(part.parent.angle+part.parent.hinge*opening/.12));}const frame={part,m,t,n:normalMatrix(m)};maps.push(frame);byID.set(part.id,frame);}
 const result=freeze({phase,score:[sigma,lean,opening],maps});poseCache.set(c,result);return result;
}
function owner(part,u){return (part.regions.find(o=>u<o.u[1])||part.regions.at(-1)).index;}
function world(f,p){const v=matvec(f.m,p.p),n=matvec(f.n,p.n),len=Math.hypot(...n);return {x:v[0]+f.t[0],y:v[1]+f.t[1],z:v[2]+f.t[2],nx:n[0]/len,ny:n[1]/len,nz:n[2]/len,owner:owner(f.part,p.u)};}
function getMap(c,component,phase){const f=pose(c,phase).maps.find(f=>f.part.id===component);check(f,'unknown component');return f;}
function sample(c,component,u,v,phase,chart='side'){number(u,0,1);number(v,0,1);const f=getMap(c,component,phase);check(chart==='side'||f.part.kind==='spine'&&['root','tip'].includes(chart),'invalid sample chart');return world(f,local(f.part,u,v,chart));}
function sampleChart(c,component,chart,a,b,phase){number(a,-1,1);number(b,-1,1);const f=getMap(c,component,phase);return world(f,chartLocal(f.part,chart,a,b));}
function anchor(c,node,phase){assertCompiled(c);const index=c.nodeIds.indexOf(typeof node==='string'?node:node.id);check(index>=0,'unknown anchor node');const f=pose(c,phase).maps.find(f=>f.part.regions.some(r=>r.index===index)),r=f.part.regions.find(r=>r.index===index);return world(f,local(f.part,(r.u[0]+r.u[1])/2,.375));}
function socket(c,component,phase){const f=getMap(c,component,phase);return {x:f.t[0],y:f.t[1],z:f.t[2]};}
// Area estimates affect only density, not validity, identity, or ownership.
function area(c){return c.kind==='spine'?TAU*(c.radii[0]+c.radii[1])*.5*c.length+Math.PI*(c.radii[0]**2+c.radii[1]**2):4*Math.PI*((c.axes[0]*c.axes[1]+c.axes[1]*c.axes[2]+c.axes[0]*c.axes[2])/3);}
// Retain at most two sample layouts per live body; phase/view requests may
// choose many valid budgets without retaining an unbounded collection.
function plan(c,budget){let plans=planCache.get(c);if(!plans){plans=new Map();planCache.set(c,plans);}if(plans.has(budget)){const cached=plans.get(budget);plans.delete(budget);plans.set(budget,cached);return cached;}const items=[];
 // Reserve an interior sample for every region and a sample for every cap or
 // hemisphere before distributing the remaining global budget by rest area.
 c.parts.forEach((p,i)=>{for(const r of p.regions)items.push({i,p:local(p,(r.u[0]+r.u[1])/2,.375)});for(const chart of p.charts)if(chart!=='side')items.push({i,p:chartLocal(p,chart,.31,.23)});});
 const total=c.parts.reduce((s,p)=>s+area(p),0),remaining=budget-items.length;check(remaining>=0,'sample budget cannot cover owners/charts');let cumulative=0,allocated=0;
 c.parts.forEach((p,i)=>{cumulative+=area(p)/total;const upto=i===c.parts.length-1?remaining:Math.floor(cumulative*remaining),count=upto-allocated;allocated=upto;
  for(let j=0;j<count;j++){const v=(j*.6180339887498949)%1,u=(j+.5)/Math.max(1,count);
   if(p.kind==='spine'&&j%12<2){const end=j%12===0?'root':'tip',rho=Math.sqrt(((j+.5)*.754877666)%1);items.push({i,p:chartLocal(p,end,rho*Math.cos(TAU*v),rho*Math.sin(TAU*v))});}
   else items.push({i,p:local(p,u,v)});
  }
 });
 for(const item of items)item.owner=owner(c.parts[item.i],item.p.u);const result=freeze(items);plans.set(budget,result);while(plans.size>2)plans.delete(plans.keys().next().value);return result;
}
function frame(c,phase,options={}){assertCompiled(c);const budget=options.budget??12000,crests=options.crests??3;number(budget,4000,24000);number(crests,2,4);check(Number.isInteger(budget)&&Number.isInteger(crests),'integer frame budgets required');const maps=pose(c,phase).maps,items=plan(c,budget);let buffers=options.reuse?bufferCache.get(c):null;if(!buffers||buffers.owners.length!==items.length){buffers={points:new Float32Array(items.length*4),normals:new Float32Array(items.length*3),owners:new Uint16Array(items.length)};if(options.reuse)bufferCache.set(c,buffers);}const {points,normals,owners}=buffers;
 for(let j=0;j<items.length;j++){const it=items[j],f=maps[it.i],m=f.m,n=f.n,p=it.p.p,v=it.p.n,k=4*j,q=3*j,nx=n[0]*v[0]+n[1]*v[1]+n[2]*v[2],ny=n[3]*v[0]+n[4]*v[1]+n[5]*v[2],nz=n[6]*v[0]+n[7]*v[1]+n[8]*v[2],length=Math.hypot(nx,ny,nz);points[k]=m[0]*p[0]+m[1]*p[1]+m[2]*p[2]+f.t[0];points[k+1]=m[3]*p[0]+m[4]*p[1]+m[5]*p[2]+f.t[1];points[k+2]=m[6]*p[0]+m[7]*p[1]+m[8]*p[2]+f.t[2];points[k+3]=.18;normals[q]=nx/length;normals[q+1]=ny/length;normals[q+2]=nz/length;owners[j]=it.owner;}
 const ridges=[];for(let j=0;j<crests;j++){const component=j<2||c.parts.length===1?0:1+Math.floor((j-2)*(c.parts.length-1)/Math.max(1,crests-2)),f=maps[component],line=[];for(let k=0;k<=300;k++)line.push(world(f,local(f.part,k/300,(j*.381966+.14)%1)));ridges.push({line,primary:true});}
 return {points,normals,owners,ridges};
}
// Every point lies within this rest-axis box. Expand it for the maximum root
// angle/scale and accumulated hinge displacement along the actual ancestor path.
// Fixed bounds avoid breathing auto-fit and hold for every accepted phase.
function portraitFrame(c){assertCompiled(c);const rest=pose(c,0).maps,template=TEMPLATES[c.gesture.kind],sigmaMax=Math.max(...template.map(p=>Math.abs(p[0])))*c.gesture.strength,leanMax=Math.max(...template.map(p=>Math.abs(p[1])))*c.gesture.strength,openMax=Math.max(...template.map(p=>Math.abs(p[2])))*c.gesture.strength/.12;let lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<rest.length;i++){const f=rest[i],p=f.part,L=p.kind==='spine'?p.length:2*p.axes[1],r=p.kind==='spine'?Math.max(...p.radii):Math.max(p.axes[0],p.axes[2]),bow=p.kind==='spine'?Math.max(...p.bend.map(Math.abs))*L:0,localBounds=[[-r-bow,0,-r-bow],[r+bow,L,r+bow]];let reach=Math.hypot(L,r+bow),angle=0,node=p;
  while(node.parent){angle+=Math.abs(node.parent.hinge);node=c.parts.find(x=>x.id===node.parent.component);reach+=node.kind==='spine'?Math.hypot(node.length,Math.max(...node.radii)+.283*node.length):2*Math.max(...node.axes);}
  const pad=reach*(Math.expm1(sigmaMax)+leanMax*Math.exp(sigmaMax)+angle*openMax*Math.exp(sigmaMax));
  for(let mask=0;mask<8;mask++){const v=matvec(f.m,[localBounds[(mask&1)?1:0][0],localBounds[(mask&2)?1:0][1],localBounds[(mask&4)?1:0][2]]);for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],v[k]+f.t[k]-pad);hi[k]=Math.max(hi[k],v[k]+f.t[k]+pad);}}
 }
 return {cx:(lo[0]+hi[0])/2,cy:(lo[1]+hi[1])/2,cz:(lo[2]+hi[2])/2,width:hi[0]-lo[0],height:hi[1]-lo[1],depth:hi[2]-lo[2]};
}
function generate(graph,seed=0){const ids=nodeIDs(graph);number(seed,0,4294967295);check(Number.isInteger(seed),'seed must be uint32');const nodes=graph.nodes;check(Array.isArray(nodes)&&nodes.every(n=>Array.isArray(n.inputs)),'generation needs graph input lists');const known=new Set(ids),depth=new Map(),fanout=new Map(ids.map(x=>[x,0]));
 for(const n of nodes){check(n.inputs.every(x=>known.has(x)&&depth.has(x)),'graph must be an ordered DAG');depth.set(n.id,n.inputs.length?1+Math.max(...n.inputs.map(x=>depth.get(x))):0);n.inputs.forEach(x=>fanout.set(x,fanout.get(x)+1));}
 let state=seed>>>0;const rnd=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;},clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),count=ops=>nodes.filter(n=>ops.includes(n.op)).length;
 const maxDepth=Math.max(...depth.values()),forks=nodes.filter(n=>fanout.get(n.id)>1),merges=nodes.filter(n=>n.inputs.length>1),maxFork=Math.max(...fanout.values()),maxMerge=Math.max(...nodes.map(n=>n.inputs.length)),arithmetic=count(['map','sum','mean','min','max','weightedMean']),selection=count(['filter','compare','choose','dedupe','sort']),effect=count(['action','retry']),sequencing=count(['schedule','retry']),kind=merges.length>forks.length?'gather':forks.length?'unfurl':maxDepth>=2?'glide':'hover';
 // Continuous graph traits determine proportions. Seed supplies bounded
 // eccentricity, handedness and unequal appendages; no body-family lookup.
 const spread=clamp(.12+.026*maxMerge+.022*selection+.13*effect+.055*sequencing+.018*forks.length+(rnd()-.5)*.07,.105,.34),height=clamp(.22+.025*Math.min(maxDepth,5)+.021*arithmetic-.026*selection-.095*effect-.045*sequencing+(rnd()-.5)*.07,.15,.35),thickness=clamp(.075+.025*rnd()+.012*Math.min(maxMerge,4),.075,.16),hand=rnd()<.5?-1:1;
 const parts=[{id:'trunk',kind:'chamber',axes:[spread,height,thickness],parent:null}],buckets=[ids.slice()];
 function append(part,owners){parts.push(part);buckets.push(owners);return part.id;}
 function spine(id,owner,parent,u,v,angle,length,width,bend,hinge=.04){return append({id,kind:'spine',length:clamp(length,.12,.70),radii:[clamp(width,.022,.09),.015+.003*rnd()],bend:[clamp(bend,-.2,.2),(rnd()-.5)*.16],parent:{component:parent,socket:{u,v},angle:clamp(angle,-Math.PI,Math.PI),hinge}},[owner]);}
 // A real fanout or convergence produces ordered, asymmetrical attachments.
 // Decorative repeats retain an existing owner and never add a task edge.
 const motif=forks.length?forks.slice().sort((a,b)=>fanout.get(b.id)-fanout.get(a.id))[0]:merges.slice().sort((a,b)=>b.inputs.length-a.inputs.length)[0];
 if(motif){const selected=forks.length?nodes.filter(n=>n.inputs.includes(motif.id)):motif.inputs.map(id=>nodes.find(n=>n.id===id)),visible=selected.slice(0,3);
  for(let j=0;j<visible.length;j++){const direction=(j%2?1:-1)*hand,u=clamp(.38+.14*j+.06*rnd(),.30,.80),angle=-direction*(.75+.28*j+.35*rnd());spine('branch-'+j,visible[j].id,'trunk',u,direction>0?0:.5,angle,.24+.048*Math.min(4,maxFork+maxMerge)+.06*j+.04*rnd(),.03+.012*(1-j/3),direction*.18,-direction*.065);}
 }else if(maxDepth>=3){
  // Longer serial programs acquire an offset subordinate chamber and a
  // continuation: the attachment tree is more than a star around one sphere.
  const terminal=nodes.find(n=>depth.get(n.id)===maxDepth)||nodes.at(-1),side=hand;
  const neck=spine('neck',terminal.id,'trunk',.77,side>0?0:.5,-side*.9,.16,.034,side*.16);
  const lobe=append({id:'lobe',kind:'chamber',axes:[.065+.02*rnd(),.10+.022*rnd(),.055+.012*rnd()],parent:{component:neck,socket:{u:1,v:0},angle:side*.2,hinge:.035}},[terminal.id]);
  spine('lobe-tip',terminal.id,lobe,1,0,-side*.3,.17,.025,-side*.17,.025);
 }else if(selection){
  const n=nodes.find(n=>['filter','compare','choose','dedupe','sort'].includes(n.op))||nodes.at(-1);
  spine('sweep',n.id,'trunk',.62,hand>0?0:.5,-hand*1.75,.32+.04*rnd(),.035,hand*.2,hand*.065);
 }else{
  const n=nodes.at(-1);spine('continuation',n.id,'trunk',1,.25,hand*(.15+.38*rnd()),.18+.037*Math.min(maxDepth,5),.038,-hand*.18);
 }
 // One long countercurve creates negative space. Its position and length
 // depend on graph elongation and the bounded seed, not on animation time.
 const tailAngle=hand*(2.55+.40*rnd()),tail=spine('tail',nodes[0].id,'trunk',0,.25,tailAngle,.19+.035*Math.min(maxDepth,5)+.065*rnd(),.026+.009*rnd(),-hand*.19,-hand*.035);
 if(effect||maxFork>=3){spine('wake',nodes.at(-1).id,tail,.72,.5,-hand*.75,.19+.025*effect,.023,hand*.19,.035);}
 const owners=[];parts.forEach((p,i)=>buckets[i].forEach((node,j)=>owners.push({node,component:p.id,u:[j/buckets[i].length,(j+1)/buckets[i].length]})));
 const anatomy={model:'assembly',compiler:COMPILER,seed,components:parts,owners},gesture={kind,strength:.55+Math.round(rnd()*15)/100,ticks:kind==='gather'?[180,180,420,220]:kind==='unfurl'?[220,170,430,180]:[180,170,450,200]};validateOwners(anatomy,graph);validateGesture(gesture);return {anatomy,gesture};
}
const api={COMPILER,validate,validateOwners,validateGesture,generate,compile,score,pose,sample,sampleChart,anchor,socket,frame,portraitFrame};if(typeof module!=='undefined')module.exports=api;root.Anatomy=api;
})(typeof globalThis!=='undefined'?globalThis:this);
