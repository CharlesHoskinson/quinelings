(function(root){
'use strict';
const TAU=2*Math.PI,sampledFrames=new WeakMap();
function paletteFor(graph,design,lensState){const shape={design,nodes:graph.nodes};return graph.nodes.map((_,index)=>Chroma.colorFor(shape,index,lensState));}
function compile(graph,design){
 const engine=design.woven?WovenBody:Anatomy,body=design.woven?engine.compile(design.woven,graph):engine.compile(design.anatomy,graph.nodes,design.motion.gesture),bounds=engine.portraitFrame(body);
 return {engine,body,graph,design,bounds,nodeIds:graph.nodes.map(n=>n.id),palette:paletteFor(graph,design),sprites:new Map(),frames:0};
}
function project(p,d){const yaw=d.composition.yaw,pitch=d.composition.pitch,cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch),x=p.x*cy+p.z*sy,z=p.z*cy-p.x*sy,y=p.y*cp-z*sp;return {x:x+d.composition.lean*y,y,z:p.y*sp+z*cp};}
function sprite(comp,color){if(comp.sprites.has(color))return comp.sprites.get(color);const c=document.createElement('canvas');c.width=c.height=20;const x=c.getContext('2d'),g=x.createRadialGradient(10,10,0,10,10,10);g.addColorStop(0,color);g.addColorStop(.22,color+'a0');g.addColorStop(.6,color+'30');g.addColorStop(1,color+'00');x.fillStyle=g;x.fillRect(0,0,20,20);comp.sprites.set(color,c);return c;}
function draw(canvas,comp,phase,opts={}){
 const started=performance.now(),ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,d=comp.design,budget=opts.budget||6000;
 // Two views at the same pose share one sampled body, including its owners.
 const cached=d.woven?sampledFrames.get(comp):null;const frame=cached&&Object.is(cached.phase,phase)&&cached.budget===budget?cached.frame:comp.engine.frame(comp.body,phase,{budget,crests:4});if(d.woven)sampledFrames.set(comp,{phase,budget,frame});const points=frame.points,owners=frame.owners;
 const ya=Math.cos(d.composition.yaw),ys=Math.sin(d.composition.yaw),pc=Math.cos(d.composition.pitch),ps=Math.sin(d.composition.pitch),lean=d.composition.lean;
 const transform=(x,y,z)=>{const xx=x*ya+z*ys,zz=z*ya-x*ys,yy=y*pc-zz*ps;return {x:xx+lean*yy,y:yy,z:y*ps+zz*pc};};
 ctx.clearRect(0,0,w,h);const woven=!!d.woven;const gpu=woven&&root.LifeformWebGL?.available();ctx.globalCompositeOperation=woven&&!gpu?'screen':'source-over';const extent=comp.bounds,scale=Math.min(w*.88/extent.width,h*.88/extent.height),cx=w/2-extent.cx*scale,cy=h*.49-extent.cy*scale,colors=opts.palette||comp.palette,buckets=Array.from({length:12},()=>[]),crests=Array.from({length:12},()=>[]),hits=[];
 const xy=p=>({x:cx+p.x*scale,y:cy+p.y*scale,z:p.z}),depth=z=>Math.max(0,Math.min(11,Math.floor(((z-(extent.cz||0))/Math.max(.3,extent.depth||1)+.5)*12))),radius=Math.max(4.5,Math.min(w,h)/140)*Math.sqrt(12000/Math.max(4000,points.length/4));
 for(let i=0;i<points.length;i+=4){const j=i/4;if(gpu){if(j%3===0){const p=xy(transform(points[i],points[i+1],points[i+2]));hits.push({x:p.x,y:p.y,nodeId:comp.nodeIds[owners[j]]});}continue;}const p=transform(points[i],points[i+1],points[i+2]),screen=xy(p),owner=owners[j],normal=frame.normals,nx=normal?.[j*3]||0,ny=normal?.[j*3+1]||0,nz=normal?.[j*3+2]||0,lighting=.5+.5*Math.max(0,-.35*nx-.4*ny+.85*nz),active=opts.selectedNode===comp.nodeIds[owner],alpha=Math.min(.8,Math.max(.018,points[i+3]*.55))*(.5+.5*lighting)*(opts.selectedNode?(active?1.45:.36):1);
 if(!gpu)buckets[depth(p.z)].push({x:screen.x,y:screen.y,owner,alpha: woven?(1-Math.exp(-2*points[i+3]))*(opts.selectedNode?(active?1.3:.20):1):alpha});if(j%3===0)hits.push({x:screen.x,y:screen.y,nodeId:comp.nodeIds[owner]});}
 if(!gpu)for(const ridge of frame.ridges){let segment=null;for(let i=1;i<ridge.line.length;i++){const a=ridge.line[i-1],b=ridge.line[i];if(woven&&Math.max(a.alpha??0,b.alpha??0)<.008){segment=null;continue;}const pa=xy(transform(a.x,a.y,a.z)),pb=xy(transform(b.x,b.y,b.z)),layer=depth((pa.z+pb.z)/2);if(!segment||segment.layer!==layer||segment.owner!==b.owner||woven&&segment.points.length>=24){segment={points:[pa,pb],owner:b.owner,layer,alpha:woven?((a.alpha??.2)+(b.alpha??.2))*.5:((a.alpha??.2)+(b.alpha??.2))*.5};crests[layer].push(segment);}else {segment.points.push(pb);if(woven)segment.alpha=Math.min(segment.alpha,((a.alpha??.2)+(b.alpha??.2))*.5);}}}

 if(gpu)root.LifeformWebGL.draw(canvas,comp,frame,phase,opts,project,scale,cx,cy);
 else for(let layer=0;layer<12;layer++){
  for(const p of buckets[layer]){ctx.globalAlpha=p.alpha;if(woven){ctx.fillStyle=opts.neutral?'#dce8e4':colors[p.owner]||'#beded2';const dot=Math.max(.8,Math.min(w,h)/470);ctx.fillRect(p.x,p.y,dot,dot);}else ctx.drawImage(sprite(comp,colors[p.owner]||'#beded2'),p.x-radius,p.y-radius,radius*2,radius*2);}
  ctx.lineCap='round';for(const edge of crests[layer]){const active=!opts.selectedNode||opts.selectedNode===comp.nodeIds[edge.owner];ctx.beginPath();ctx.moveTo(edge.points[0].x,edge.points[0].y);for(let i=1;i<edge.points.length;i++)ctx.lineTo(edge.points[i].x,edge.points[i].y);ctx.strokeStyle=opts.neutral?'#dce8e4':colors[edge.owner]||'#beded2';ctx.lineWidth=woven?2:4.5;ctx.globalAlpha=(active?(woven?.025:.065):.008)*(woven?edge.alpha:1);ctx.stroke();ctx.lineWidth=woven?.75:1.3;ctx.globalAlpha=(active?(woven?(comp.body.cloud?.22:.52):.7):.05)*(woven?edge.alpha:1);ctx.stroke();ctx.strokeStyle='#e6f8ed';ctx.lineWidth=.35;ctx.globalAlpha=(active?(woven?(comp.body.cloud?.12:.28):.5):.035)*(woven?edge.alpha:1);ctx.stroke();}
 }
 ctx.globalCompositeOperation='source-over';const anchors=new Map(comp.nodeIds.map(id=>[id,xy(project(comp.engine.anchor(comp.body,id,phase),d))]));
 if(opts.showProgram||opts.selectedNode){ctx.lineWidth=.8;for(const node of comp.graph.nodes)for(let port=0;port<node.inputs.length;port++){const from=node.inputs[port],a=anchors.get(from),b=anchors.get(node.id);if(!a||!b||(!opts.showProgram&&node.id!==opts.selectedNode&&from!==opts.selectedNode))continue;ctx.strokeStyle='#afdbce';ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo((a.x+b.x)/2+15+port*4,(a.y+b.y)/2,a.x===b.x?b.x+.1:b.x,b.y);ctx.stroke();}}
 for(const [id,p]of anchors){if(!opts.showProgram&&id!==opts.selectedNode)continue;ctx.globalAlpha=1;ctx.fillStyle='#d1f6e0';ctx.beginPath();ctx.arc(p.x,p.y,id===opts.selectedNode?4:2,0,TAU);ctx.fill();if(id===opts.selectedNode){ctx.strokeStyle='#b9e6ce';ctx.globalAlpha=.6;ctx.beginPath();ctx.arc(p.x,p.y,9,0,TAU);ctx.stroke();}}
 ctx.globalAlpha=1;comp.frames++;return {anchors,hits,width:w,height:h,metrics:{samples:points.length/4,crestVertices:frame.ridges.reduce((n,r)=>n+r.line.length,0),renderMs:performance.now()-started,backend:gpu?'webgl-batched':'canvas2d'}};
}
function pick(projection,x,y){let best=null,distance=28*28;for(const hit of projection.hits){const dd=(x-hit.x)**2+(y-hit.y)**2;if(dd<distance){distance=dd;best=hit.nodeId;}}return best;}
root.LifeformRenderer={compile,draw,pick,project,paletteFor};
})(globalThis);
