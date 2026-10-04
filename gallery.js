/* The body is a bounded projection; only the independently encoded genome preserves source. */
'use strict';
(() => {
const Q=globalThis.Quinelings,D=globalThis.QDL,M=globalThis.Morphology,$=id=>document.getElementById(id),TAU=Math.PI*2;
const canvas=$('creature'),ctx=canvas.getContext('2d');
let library=[],current=null,program,shape,genome,result,generation=0,phase=0,selected=null,traceIndex=0,tracePulse=null,traceNode=null,viewSeconds=0;
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let moving=!motionPreference.matches,dirty=true,viewRevision=0,canvasVisible=true;
$('pause').textContent=moving?'Pause motion':'Resume motion';
const pretty=value=>JSON.stringify(value,null,2);
function color(op){return Q.instructionColor(op);}
function fail(error){$('receipt').textContent=error.message;$('status').textContent='REJECTED';console.error(error);}
function guard(fn){return (...args)=>{try{return fn(...args);}catch(e){fail(e);}};}
function literalGraph(){const fixture=current.fixtures[Number($('fixture').value)]||{overrides:{}};const graph=JSON.parse(JSON.stringify(current.graph));for(const node of graph.nodes)if(node.op==='literal'&&Object.hasOwn(fixture.overrides||{},node.id))node.params.value=fixture.overrides[node.id];return graph;}
function install(ast,reset=true){dirty=true;viewRevision++;program=ast;tracePulse=null;traceNode=null;shape=Q.describe(ast);genome=Q.encode(ast);result=null;selected=null;traceIndex=0;if(reset)generation=0;$('generation').textContent=`GENERATION ${generation}`;$('source').value=Q.canon(ast);$('metrics').textContent=`${shape.nodes.length} ORGANS / ${shape.links.length} FILAMENTS`;$('band').max=genome.bands.length-1;$('band').value=0;$('status').textContent='READY TO EXECUTE';$('task-output').textContent='Run the selected task to inspect its output.';$('trace').textContent='Each colored organ corresponds to a graph operation.';$('organ-info').textContent='Select a colored organ to inspect its operation.';$('proof').textContent=`${new TextEncoder().encode(Q.canon(ast)).length} canonical source bytes\n${genome.bands.length} harmonic bands\n32 integer coefficients per band`;legend();drawWave();window.dispatchEvent(new CustomEvent('quineling:changed'));}
function select(item){current=item;$('identity').textContent=item.name;$('description').textContent=item.description;$('specimen-id').textContent=`SPECIMEN ${String(library.indexOf(item)+1).padStart(2,'0')} / ${item.id.toUpperCase()}`;$('family-label').textContent=`${item.skin.family.toUpperCase()} / GRAPH PROJECTION`;$('fixture').replaceChildren();item.fixtures.forEach((fixture,i)=>{const option=document.createElement('option');option.value=i;option.textContent=fixture.name;$('fixture').append(option);});$('repeats').value=1;$('repeats-label').textContent='1';rebuild();for(const card of document.querySelectorAll('.creature-card')){const active=card.dataset.id===item.id;card.classList.toggle('selected',active);card.setAttribute('aria-pressed',String(active));}}
function rebuild(){if(!current)return;install(Q.makeTaskProgram(literalGraph(),Number($('repeats').value),D.create(current.skin.family)));$('repeats-label').textContent=$('repeats').value;$('receipt').textContent='Selected inputs are encoded in the source. All effects are local simulations.';}
function run(){result=Q.execute(Q.decode(genome));const source=Q.canon(program),same=result.emitted.length===1&&result.emitted[0]===source;if(!same)throw Error('Quine source identity failed');const tasks=result.tasks||[];const output=tasks[0]?.output;const fixture=current.fixtures[Number($('fixture').value)];const matches=Q.canon(output)===Q.canon(fixture.expected);$('task-output').textContent=pretty(output);$('receipt').textContent=`${tasks.length} task cycle${tasks.length===1?'':'s'} completed. Fixture ${matches?'matched':'MISMATCHED'}. Exact canonical source reproduced.`;$('status').textContent=matches?'TASK + QUINE VERIFIED':'FIXTURE MISMATCH';$('proof').textContent=`Emitted source = canonical program: EXACT\nFixture output: ${matches?'MATCH':'MISMATCH'}\nRuntime steps: ${result.steps}\nSource reconstructed by the constructor quine`;traceIndex=0;step();return result;}
function step(){if(!result)return;const rows=result.tasks?.flatMap(task=>task.trace)||result.trace||[];if(!rows.length)return;const row=rows[traceIndex%rows.length];selected=row.edge||row.id||row.node||null;$('trace').textContent=`Step ${traceIndex%rows.length+1} / ${rows.length}\n${pretty(row)}`;traceIndex++;traceNode=selected;tracePulse=viewSeconds;organInfo(shape.nodes.find(n=>n.id===selected));}
function reproduce(){const parent=run(),source=parent.emitted[0],child=JSON.parse(source),fresh=Q.execute(child);if(fresh.emitted.length!==1||fresh.emitted[0]!==source)throw Error('Fresh generation did not reproduce its source');if(Q.canon(fresh.tasks.map(t=>t.output))!==Q.canon(parent.tasks.map(t=>t.output)))throw Error('Fresh generation task outputs changed');generation++;install(child,false);result=fresh;$('task-output').textContent=pretty(fresh.tasks[0]?.output);$('status').textContent='FRESH GENERATION VERIFIED';$('receipt').textContent=`Generation ${generation} was constructed from emitted source and executed again. Source and task outputs match.`;$('proof').textContent='Parent output = child source: EXACT\nFresh child emitted source: EXACT\nFresh child task outputs: EXACT';}
function recover(mode){const restored=mode==='rgb'?Q.decodeColors(Q.encodeColors(program)):Q.decode(Q.fromSamples(Q.samples(genome)));if(Q.canon(restored)!==Q.canon(program))throw Error('Recovered source changed');const check=Q.execute(restored);if(check.emitted[0]!==Q.canon(restored))throw Error('Recovered program failed source reproduction');$('proof').textContent=mode==='rgb'?'Exact RGB byte strand → source: EXACT\nRedundant byte palette + checksum: VERIFIED\nRecovered source execution: QUINE VERIFIED':`${genome.bands.length*65} numerical samples\nCosine coefficients + checksum: VERIFIED\nRecovered source: EXACT\nRecovered source execution: QUINE VERIFIED`;$('receipt').textContent=`Complete source recovered from ${mode==='rgb'?'exact RGB data':'all harmonic samples'} and successfully executed.`;}
function legend(){const ops=[...new Set(shape.nodes.map(n=>n.op))];$('color-legend').replaceChildren();for(const op of ops){const span=document.createElement('span');span.className='legend-item';const dot=document.createElement('i');dot.className='legend-dot';dot.style.background=color(op);span.append(dot,document.createTextNode(op));$('color-legend').append(span);}}
// Portraits are sampled folded membranes; inspection reveals executable anatomy.
// Branches/depth/ports alter the body; opcode frequencies and literal magnitude alter organs.
function render(context,w,h,s,family,t,thumb=false,externalLabel=false){
 context.clearRect(0,0,w,h);const design=s.design||D.create(family),ink=design.ink;family=design.family;
 const frame=M.portraitFrame(s),scale=Math.min(w*design.composition.occupancy/frame.width,h*design.composition.occupancy/frame.height)/Math.max(1,M.framingExtent(s)*.85),cx=w/2-frame.cx*scale,cy=h/2-frame.cy*scale;
 const semantic=thumb||$('semantic-color').checked,labels=!thumb&&$('topology').checked;
 const nodes=s.nodes,nodeMap=new Map(nodes.map(n=>[n.id,n])),positions=new Map(nodes.map(n=>[n.id,Q.nodePosition(n,t,s)]));
 const relevant=new Set(selected?[selected,...s.links.filter(e=>e.from===selected||e.to===selected).flatMap(e=>[e.from,e.to])]:[]);
 function point(p,c,alpha,size=1){context.fillStyle=c;context.globalAlpha=alpha;context.fillRect(cx+p.x*scale-size/2,cy+p.y*scale-size/2,size,size);}
 function path(points,c,alpha,width=.8,halo=false,closed=false){
  if(!points.length)return;context.beginPath();for(let i=0;i<points.length;i++){const p=points[i];i?context.lineTo(cx+p.x*scale,cy+p.y*scale):context.moveTo(cx+p.x*scale,cy+p.y*scale);}if(closed)context.closePath();
  context.strokeStyle=c;context.lineJoin='round';context.lineCap='round';
  if(halo){context.globalAlpha=alpha*.1;context.lineWidth=width+4;context.stroke();context.globalAlpha=alpha*.16;context.lineWidth=width+1.8;context.stroke();}
  context.globalAlpha=alpha;context.lineWidth=width;context.stroke();
 }
 const material=M.surfaceFrame(s,t,thumb),buckets=Array.from({length:128},()=>[]),vertices=material.points;
 for(let i=0;i<vertices.length;i+=4){const layer=Math.max(0,Math.min(3,Math.floor((vertices[i+2]+.7)/1.4*4))),level=Math.max(0,Math.min(31,Math.floor(vertices[i+3]*32)));buckets[layer*32+level].push(vertices[i],vertices[i+1]);}
 context.fillStyle=ink.neutral;const dot=thumb?1.15:Math.max(1.4,Math.min(w,h)/400);
 for(let layer=0;layer<4;layer++)for(let level=0;level<32;level++){context.globalAlpha=(level+.5)/32;const points=buckets[layer*32+level];for(let i=0;i<points.length;i+=2)context.fillRect(cx+points[i]*scale,cy+points[i+1]*scale,dot,dot);}
 // Continuous crest contours belong to the same surface; compression determines their light.
 for(const ridge of material.ridges){for(let i=0;i<ridge.line.length-1;i+=5){const segment=ridge.line.slice(i,i+6),p=ridge.line[i],alpha=Math.min(.98,.14+p.alpha*3);path(segment,ink.neutral,alpha,thumb?.75:1.2,false);}}
 for(const link of s.links){
  const source=nodeMap.get(link.from),A=positions.get(link.from),B=positions.get(link.to),dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1,f=1+link.port+source.frequency;
  const edgeAt=u=>{const bend=D.filamentBend(design,f,u,t);return {x:A.x+dx*u-dy/len*bend,y:A.y+dy*u+dx/len*bend};};
  const active=!thumb&&(link.from===selected||link.to===selected),points=[],samples=thumb?35:Math.max(90,Math.ceil(f*6));
  for(let i=0;i<=samples;i++)points.push(edgeAt(i/samples));
  path(points,semantic?color(source.op):ink.neutral,active?ink.ridgeAlpha:(labels?ink.secondaryAlpha:ink.ghostAlpha*.15),active?1.05:.55,active);
  if(active){const p=edgeAt(.84),q=edgeAt(.82),angle=Math.atan2(p.y-q.y,p.x-q.x),size=4/scale;path([{x:p.x-size*Math.cos(angle-.45),y:p.y-size*Math.sin(angle-.45)},p,{x:p.x-size*Math.cos(angle+.45),y:p.y-size*Math.sin(angle+.45)}],ink.neutral,.7,.7);}
  // An execution marker follows only recorded incoming dependencies.
  if(!thumb&&link.to===traceNode&&tracePulse!==null&&viewSeconds-tracePulse<1.2){const u=Math.min(1,(viewSeconds-tracePulse)/1.2);point(edgeAt(u),semantic?color(source.op):ink.neutral,1,3);}
 }
 for(const n of nodes){
  const p=positions.get(n.id),active=!thumb&&n.id===selected,near=!thumb&&relevant.has(n.id),samples=thumb?Math.max(60,n.frequency*5):Math.max(110,n.frequency*9),points=[];
  for(let i=0;i<samples;i++){const a=TAU*i/samples,r=D.organRadius(design,n,a,t);points.push({x:p.x+r*Math.cos(a),y:p.y+r*Math.sin(a)});}
  path(points,semantic?color(n.op):ink.neutral,active?ink.ridgeAlpha:(labels?ink.secondaryAlpha:near?ink.secondaryAlpha*.65:ink.ghostAlpha*.17),active?1.25:.65,active,true);
  point(p,ink.neutral,active?.95:.015,active?3:1.5);
  if(active){context.globalAlpha=.5;context.strokeStyle=ink.neutral;context.lineWidth=.6;context.beginPath();context.arc(cx+p.x*scale,cy+p.y*scale,4.5,0,TAU);context.stroke();}
  if(!thumb&&(labels||active&&!externalLabel)){context.globalAlpha=.95;context.font='11px monospace';const x=cx+p.x*scale+11,y=cy+p.y*scale-9;context.lineWidth=3;context.strokeStyle='#090f15';context.strokeText(n.id,x,y);context.fillStyle='#dbe9e3';context.fillText(n.id,x,y);}
 }
 context.globalAlpha=1;
 if(!thumb&&(selected||labels)){context.strokeStyle='#304b40';context.lineWidth=.65;for(let ring=0;ring<s.repeats-1;ring++){context.beginPath();context.ellipse(cx,cy,scale*(.68+ring*.023),scale*(.83+ring*.014),0,0,TAU);context.stroke();}}
 return {positions,scale,cx,cy};
}
let projected;
function clearFocus(){selected=null;dirty=true;viewRevision++;$('organ-info').textContent='Portrait view. Select a program line or organ to inspect its operation.';window.dispatchEvent(new CustomEvent('quineling:blur'));}
$('clear-focus').onclick=clearFocus;window.addEventListener('keydown',e=>{if(e.key==='Escape')clearFocus();});
function organInfo(n){if(!n)return;dirty=true;viewRevision++;$('organ-info').textContent=`${n.id} / ${n.op} · ${n.indegree} input ports · ${n.outdegree} output links · depth ${n.level} · harmonic ${n.frequency}`;window.dispatchEvent(new CustomEvent('quineling:focus',{detail:{id:n.id}}));}
canvas.onclick=e=>{if(!projected)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;let nearest,distance=Infinity;for(const n of shape.nodes){const p=projected.positions.get(n.id),d=Math.hypot(x-projected.cx-p.x*projected.scale,y-projected.cy-p.y*projected.scale);if(d<distance){distance=d;nearest=n;}}if(distance<24*canvas.width/r.width){selected=nearest.id;organInfo(nearest);}};
function drawWave(){const index=Number($('band').value),coeff=genome.bands[index],wave=$('wave'),c=wave.getContext('2d');$('band-label').textContent=`${index+1} / ${genome.bands.length}`;c.clearRect(0,0,wave.width,wave.height);c.strokeStyle='#253a34';c.beginPath();c.moveTo(0,110);c.lineTo(960,110);c.stroke();const values=Array.from({length:960},(_,i)=>Q.wave(coeff,TAU*i/959)),max=Math.max(1,...values.map(Math.abs));c.strokeStyle='#b6edcc';c.lineWidth=1.5;c.beginPath();values.forEach((v,i)=>{const y=110-v/max*94;i?c.lineTo(i,y):c.moveTo(i,y);});c.stroke();const chroma=$('chroma'),cc=chroma.getContext('2d'),pixels=Q.encodeColors(program).pixels[index];pixels.forEach((rgb,i)=>{cc.fillStyle=rgb?`rgb(${rgb.join(',')})`:'#080d12';cc.fillRect(i*30,0,30,40);});}
function save(suffix,value){const url=URL.createObjectURL(new Blob([typeof value==='string'?value:pretty(value)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${current.id}-generation-${generation}-${suffix}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('run').onclick=guard(run);$('birth').onclick=guard(reproduce);$('step').onclick=guard(step);$('fixture').onchange=guard(rebuild);$('repeats').oninput=guard(rebuild);$('band').oninput=guard(drawWave);$('recover').onclick=guard(()=>recover('harmonic'));$('recover-color').onclick=guard(()=>recover('rgb'));$('download').onclick=guard(()=>save('harmonics',genome));$('download-color').onclick=guard(()=>save('rgb',Q.encodeColors(program)));$('download-source').onclick=guard(()=>save('source',Q.canon(program)));function motionChanged(){dirty=true;viewRevision++;$('pause').textContent=moving?'Pause motion':'Resume motion';window.dispatchEvent(new CustomEvent('quineling:motion'));}
function toggleMotion(){moving=!moving;motionChanged();}
$('pause').onclick=toggleMotion;
motionPreference.addEventListener('change',e=>{moving=!e.matches;motionChanged();});
for(const id of ['semantic-color','topology'])$(id).addEventListener('change',()=>{dirty=true;viewRevision++;});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{canvasVisible=entries[0].isIntersecting;dirty=true;},{rootMargin:'80px'}).observe(canvas);
async function fetchJSON(path){const response=await fetch(path);if(!response.ok)throw Error(`Could not load ${path} (${response.status})`);return response.json();}
async function start(){try{if(!Q?.makeTaskProgram||!D?.create)throw Error('The task runtime is not available yet.');const ids=await fetchJSON('programs/manifest.json');library=await Promise.all(ids.map(id=>fetchJSON(`programs/${id}.json`)));for(const [i,item] of library.entries()){const ast=Q.makeTaskProgram(item.graph,1,D.create(item.skin.family)),s=Q.describe(ast),card=document.createElement('button');card.className='creature-card';card.dataset.id=item.id;card.setAttribute('aria-label',`Select ${item.name}, ${item.skin.family} family`);card.setAttribute('aria-pressed','false');const thumb=document.createElement('canvas');thumb.width=360;thumb.height=220;thumb.setAttribute('aria-hidden','true');const index=document.createElement('span');index.className='card-index';index.textContent=String(i+1).padStart(2,'0');const info=document.createElement('div');info.className='card-info';const name=document.createElement('strong');name.textContent=item.name;const meta=document.createElement('span');meta.textContent=item.skin.family;const count=document.createElement('span');count.textContent=`${item.graph.nodes.length} nodes`;meta.append(count);info.append(name,meta);card.append(index,thumb,info);card.onclick=guard(()=>select(item));$('library').append(card);render(thumb.getContext('2d'),360,220,s,item.skin.family,0,true);}$('library-count').textContent=`${library.length} EXECUTABLE SPECIMENS`;select(library[0]);}catch(e){fail(e);$('library-count').textContent='LIBRARY UNAVAILABLE';}}
let previous=0,clockTime=null;
document.addEventListener('visibilitychange',()=>{clockTime=null;dirty=true;});
function animate(now){
 const dt=clockTime===null?0:(now-clockTime)/1000;clockTime=now;
 if(shape&&!document.hidden){phase=M.advancePhase(phase,shape.design.motion.phaseRate,dt,moving);if(moving)viewSeconds+=Math.max(0,Math.min(.1,dt));
  if((canvasVisible||!projected)&&(dirty||moving&&now-previous>=1000/30)){projected=render(ctx,canvas.width,canvas.height,shape,current.skin.family,phase);previous=now;dirty=false;}
 }
 requestAnimationFrame(animate);
}requestAnimationFrame(animate);
window.quineling={Q,clearFocus,toggleMotion,run,reproduce,recover,select,focusNode(id){const n=shape.nodes.find(n=>n.id===id);if(!n)throw Error('Unknown organ');selected=id;organInfo(n);},renderOn(target,t){return render(target.getContext('2d'),target.width,target.height,shape,current.skin.family,t,false,target.id==='translation-form');},get phase(){return phase;},get viewSeconds(){return viewSeconds;},get traceNode(){return traceNode;},get moving(){return moving;},get viewRevision(){return viewRevision;},get selected(){return selected;},get current(){return current;},get library(){return library;},get program(){return program;},get genome(){return genome;},get shape(){return shape;},get generation(){return generation;},get result(){return result;}};
start();
})();
