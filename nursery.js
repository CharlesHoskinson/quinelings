(function(){
'use strict';
const Q=VisualCapsule.runtime,R=LifeformRenderer,collection=document.getElementById('collection'),motion=document.getElementById('motion'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),specimens=[];
let moving=!reduced.matches,last=0,lastDraw=0,phase=0;
function element(tag,className,text){const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
function syncMotion(){motion.textContent=moving?'Pause motion':'Play motion';motion.setAttribute('aria-pressed',String(moving));}
function render(s){s.projection=R.draw(s.canvas,s.compiled,phase,{budget:4000,selectedNode:s.selected,showProgram:!!s.selected,palette:s.palette});}
function inspect(s,id){s.selected=id;const node=s.artifact.graph.nodes.find(n=>n.id===id);s.inspection.textContent=`${node.id} · ${node.op}\nInputs: ${node.inputs.join(', ')||'supplied constant'}\nParameters: ${JSON.stringify(node.params)}`;const regions=(s.artifact.design.woven?.territories??s.artifact.design.anatomy.owners).filter(o=>o.node===id);s.inspection.textContent+='\nOwned tissue: '+regions.map(r=>'component '+r.component+', u '+r.u.map(n=>n.toFixed(2)).join('–')).join('; ');const row=s.record?.tasks[0].trace.find(row=>row.edge===id);if(row)s.inspection.textContent+='\nRecorded value: '+JSON.stringify(row.value);for(const b of s.operations.children)b.setAttribute('aria-pressed',String(b.dataset.node===id));render(s);}
function run(s,copy=false){
 try{
  const program=copy?JSON.parse(s.record.emitted[0]):s.artifact.program,result=Q.execute(program);
  if(result.emitted[0]!==s.artifact.source)throw Error('The emitted source differs from the stored source.');
  if(copy&&Q.canon(result.tasks.map(t=>t.output))!==Q.canon(s.record.tasks.map(t=>t.output)))throw Error('The copy returned a different result.');
  s.record=result;s.result.textContent=JSON.stringify(result.tasks[0].output,null,2);s.result.classList.remove('failure');s.copy.disabled=false;
  s.status.textContent=copy?'Fresh copy ran with matching source and result.':'Task complete. Its constructor emitted the same source.';
  if(s.artifact.design.chroma.lens){const lens=Chroma.resolveLens(s.artifact.design,result.tasks[0],'current');s.palette=R.paletteFor(s.artifact.graph,s.artifact.design,lens);}
  if(s.selected)inspect(s,s.selected);else render(s);
 }catch(error){s.status.textContent=error.message;s.result.classList.add('failure');}
}
function card(artifact){
 if(Q.canon(artifact.program)!==artifact.source)throw Error('Source identity mismatch.');
 const shape=Q.describe(artifact.program),graph=structuredClone(shape.graph);delete graph.design;
 if(Q.canon(graph)!==Q.canon(artifact.graph)||Q.canon(shape.design)!==Q.canon(artifact.design))throw Error('Body or graph differs from the source.');
 if(Q.canon(Q.makeTaskProgram(shape.graph,shape.repeats,shape.design))!==artifact.source)throw Error('Invalid constructor source.');
 const article=element('article','arrival');article.dataset.specimen=artifact.id;
 const title=element('h2','',artifact.name);title.id=artifact.id+'-title';article.setAttribute('aria-labelledby',title.id);article.append(title,element('p','description',artifact.description));if(artifact.design.woven){const r=artifact.design.woven;article.append(element('p','small',({'clifford-flow':'Clifford attractor · finite native map and critical images','recursive-julia':'Julia fractal · finite quadratic recursion and escape contours','recursive-affine':'Recursive affine tissue · bounded self-similar branch charts','logarithmic-mantle':'Logarithmic ribbons · rolled collars and spiral growth','toroidal-weave':'Toroidal weave · winding folded material','phyllotaxis-fan':'Phyllotaxis fan · nested golden-angle whorls'})[r.mechanism]||r.mechanism));}
 const canvas=element('canvas');canvas.width=600;canvas.height=500;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',artifact.name+' animated mathematical body');article.append(canvas);
 const actions=element('div','run-actions'),execute=element('button','primary','Run task'),copy=element('button','','Make a copy');copy.disabled=true;
 const open=element('a','','Open workspace ↗');open.href='create.html?specimen='+encodeURIComponent(artifact.id);actions.append(execute,copy,open);article.append(actions);
 const result=element('pre','result','Run to see the result.'),status=element('p','copy-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');article.append(result,status);
 const details=element('details'),summary=element('summary','','Inspect the program'),thought=element('p','thought',artifact.thought),operations=element('div','operations'),inspection=element('p','inspection','Choose an operation.');details.append(summary,thought,operations,inspection);
 const download=element('a','','Download program ↓');download.href='programs/generated/'+artifact.id+'.json';download.download=artifact.id+'.json';details.append(download);article.append(details);collection.append(article);
 const s={artifact,canvas,article,compiled:R.compile(artifact.graph,artifact.design),result,status,copy,operations,inspection,selected:null,palette:null,record:null,visible:true};
 for(const node of artifact.graph.nodes){const b=element('button','',node.id+' · '+node.op);b.dataset.node=node.id;b.setAttribute('aria-pressed','false');b.onclick=()=>inspect(s,node.id);operations.append(b);}
 details.addEventListener('toggle',()=>{if(!details.open){s.selected=null;s.inspection.textContent='Choose an operation.';for(const b of operations.children)b.setAttribute('aria-pressed','false');render(s);}});
 execute.onclick=()=>run(s);copy.onclick=()=>run(s,true);
 canvas.onclick=event=>{if(!s.projection)return;const box=canvas.getBoundingClientRect(),id=R.pick(s.projection,(event.clientX-box.left)*canvas.width/box.width,(event.clientY-box.top)*canvas.height/box.height);if(id){details.open=true;inspect(s,id);}};
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{s.visible=entries[0].isIntersecting;if(s.visible)render(s);},{rootMargin:'150px'}).observe(canvas);
 specimens.push(s);render(s);
}
async function load(){
 const manifestResponse=await fetch('programs/generated/manifest.json');if(!manifestResponse.ok)throw Error('Could not load the collection.');const manifest=await manifestResponse.json();
 const artifacts=await Promise.all(manifest.map(async item=>{if(!/^[a-z0-9-]+$/.test(item.id))throw Error('Invalid specimen ID.');const response=await fetch('programs/generated/'+item.id+'.json');if(!response.ok)throw Error('Could not load '+item.name);return response.json();}));
 document.getElementById('loading').remove();artifacts.forEach(card);window.quinelingNursery={specimens,get phase(){return phase;},get moving(){return moving;}};
}
function animate(now){const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(moving&&!document.hidden){phase=(phase+dt*Math.PI*2/13)%(Math.PI*2);if(now-lastDraw>=1000/30){for(const s of specimens)if(s.visible)render(s);lastDraw=now;}}requestAnimationFrame(animate);}
motion.onclick=()=>{moving=!moving;syncMotion();};reduced.addEventListener('change',()=>{moving=false;syncMotion();});document.addEventListener('visibilitychange',()=>{last=0;});syncMotion();load().catch(error=>{collection.replaceChildren(element('p','failure',error.message));});requestAnimationFrame(animate);
})();
