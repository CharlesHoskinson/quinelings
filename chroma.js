(function(root){
'use strict';
// These are body-role colors, not the exact opcode/genome palette.
const ROLES=Object.freeze(Object.fromEntries(Object.entries({
 input:{label:'Input',color:'#35d6c3'},
 process:{label:'Process',color:'#639bfa'},
 decision:{label:'Judgment & evidence',color:'#edc653'},
 quote:{label:'Quote & reconstruction',color:'#b184ef'},
 action:{label:'Action',color:'#f2757d'},
 report:{label:'Report',color:'#8ccc76'}
}).map(([key,value])=>[key,Object.freeze(value)])));
const ROLE_MAP=Object.freeze({
 Observe:'input',Box:'quote',Permit:'decision',Apply:'process',Score:'process',Authorize:'decision',Execute:'action',Quote:'quote',Decode:'quote',Report:'report',
 literal:'input',sum:'process',mean:'process',min:'process',max:'process',weightedMean:'process',length:'process',map:'process',sort:'process',dedupe:'process',filter:'process',compare:'decision',choose:'decision',get:'process',clamp:'process',budget:'process',action:'action',report:'report',bfs:'process',allocate:'process',schedule:'process',consensus:'decision',retry:'process',evidence:'decision',input:'input',arithmetic:'process',compareValues:'decision',all:'decision',select:'process',evidenceFresh:'decision',reconcile:'process'
});
const SCALE_STOPS=Object.freeze([
 Object.freeze({at:0,color:'#593b9c'}),Object.freeze({at:.25,color:'#765eb4'}),Object.freeze({at:.5,color:'#a17ac0'}),Object.freeze({at:.75,color:'#dca7b8'}),Object.freeze({at:1,color:'#f7e6ac'})
]);
const STATUS_COLORS=Object.freeze({'not-evaluated':'#839097',stale:'#839097',invalid:'#b0a7a0'});
const STATUS_LABELS=Object.freeze({valid:'Recorded value',underflow:'Below domain',overflow:'Above domain','not-evaluated':'Not evaluated',stale:'Previous source',invalid:'Invalid value'});
const cache=new WeakMap(),closedFamilies=new Set(['moth','torus','bloom']),forbidden=new Set(['__proto__','constructor','prototype']);
const clamp=x=>Math.max(0,Math.min(1,x));
function role(op){if(!Object.hasOwn(ROLE_MAP,op))throw Error('Unknown chroma operation '+op);return ROLE_MAP[op];}
function channels(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function hex(rgb){return '#'+rgb.map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');}
// Linear RGB mixing preserves a bounded display gamut; no hue-angle arithmetic.
function linear(x){x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}
function display(x){return 255*(x<=.0031308?12.92*x:1.055*x**(1/2.4)-.055);}
function mix(a,b,t){const x=channels(a),y=channels(b);return hex(x.map((v,i)=>display((1-t)*linear(v)+t*linear(y[i]))));}
function desaturate(color,amount){const c=channels(color).map(linear),y=.2126*c[0]+.7152*c[1]+.0722*c[2];return hex(c.map(x=>display((1-amount)*x+amount*y)));}
function scalarColor(normalized){
 if(!Number.isFinite(normalized))throw Error('Scalar color needs a finite normalized value');
 const t=clamp(normalized),i=Math.min(SCALE_STOPS.length-2,Math.floor(t*(SCALE_STOPS.length-1))),a=SCALE_STOPS[i],b=SCALE_STOPS[i+1];
 return mix(a.color,b.color,(t-a.at)/(b.at-a.at));
}
function compile(shape){
 const nodes=shape.nodes;if(!Array.isArray(nodes)||!nodes.length)throw Error('Chroma needs operation nodes');
 const signature=JSON.stringify([shape.design?.family,shape.design?.chroma?.lens?.bindings?.map(x=>x.node)||[],nodes.map(n=>[n.id,n.op,n.level])]);
 const previous=cache.get(shape);if(previous?.signature===signature)return previous.field;
 const focused=new Set(shape.design?.chroma?.lens?.bindings?.map(x=>x.node)||[]),groups=new Map();
 nodes.forEach((n,index)=>{const level=n.level||0;if(!groups.has(level))groups.set(level,[]);groups.get(level).push({index,id:n.id,weight:focused.has(n.id)?2:1});});
 const ordered=[...groups].sort((a,b)=>a[0]-b[0]).map(([,peers])=>peers.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0));
 const totalWeight=ordered.flat().reduce((sum,n)=>sum+n.weight,0);let edge=0;
 const bands=ordered.map(peers=>{const weight=peers.reduce((sum,n)=>sum+n.weight,0),start=edge;edge+=weight/totalWeight;let lane=0;return {start,end:edge,peers:peers.map(p=>{lane+=p.weight/weight;return {...p,end:lane};})};});
 bands[bands.length-1].end=1;for(const b of bands)b.peers[b.peers.length-1].end=1;
 const closed=closedFamilies.has(shape.design?.family),offset=closed?bands[0].end/2:0;
 function owner(u,v,k,total){
  if(![u,v,k,total].every(Number.isFinite)||total<=0)throw Error('Invalid material coordinate');
  // The closed seam sits inside the first band, never on a categorical boundary.
  const wrapped=((u%1)+1)%1,x=closed?(wrapped+offset)%1:clamp(u),lane=clamp((k+clamp((v+1)/2))/total);
  const band=bands.find(b=>x<b.end)||bands[bands.length-1];
  return (band.peers.find(p=>lane<p.end)||band.peers[band.peers.length-1]).index;
 }
 const field=Object.freeze({owner,nodeIds:Object.freeze(nodes.map(n=>n.id)),roleColors:Object.freeze(nodes.map(n=>ROLES[role(n.op)].color)),bands:Object.freeze(bands.map(b=>Object.freeze({start:b.start,end:b.end,nodeIds:Object.freeze(b.peers.map(p=>nodes[p.index].id))})))});
 cache.set(shape,{signature,field});return field;
}
function owner(shape,u,v,k,total){return compile(shape).owner(u,v,k,total);}
function ownPath(value,path){
 if(!Array.isArray(path))return {ok:false};
 for(const part of path){
  if(!(typeof part==='string'||Number.isInteger(part)&&part>=0)||forbidden.has(String(part))||value===null||typeof value!=='object'||!Object.hasOwn(value,part))return {ok:false};
  value=value[part];
 }
 return typeof value==='number'&&Number.isFinite(value)?{ok:true,value}:{ok:false};
}
// Caller supplies one task cycle already matched to the current source. This
// function only reads that snapshot and never invokes an interpreter.
function resolveLens(design,taskRecord,status='current'){
 const lens=design?.chroma?.lens,byNode=Object.create(null),entries=[];
 if(!lens)return {status:'off',lens:null,byNode,entries};
 const trace=taskRecord?.trace,rows=new Map(),duplicates=new Set();
 if(Array.isArray(trace))for(const row of trace){if(!row||typeof row.edge!=='string')continue;if(rows.has(row.edge))duplicates.add(row.edge);rows.set(row.edge,row);}
 const domainOK=Array.isArray(lens.domain)&&lens.domain.length===2&&lens.domain.every(Number.isFinite)&&lens.domain[1]>lens.domain[0]&&Number.isFinite(lens.domain[1]-lens.domain[0]);
 for(const binding of lens.bindings||[]){
  const entry={node:binding.node,path:Array.isArray(binding.path)?binding.path.slice():[],status:'not-evaluated',color:STATUS_COLORS['not-evaluated']};
  if(status!=='current'){entry.status=status==='stale'?'stale':'not-evaluated';entry.color=STATUS_COLORS[entry.status];}
  else if(!domainOK||duplicates.has(binding.node)){entry.status='invalid';entry.color=STATUS_COLORS.invalid;}
  else if(rows.has(binding.node)){
   const row=rows.get(binding.node),result=Object.hasOwn(row,'value')?ownPath(row.value,binding.path):{ok:false};
   if(!result.ok){entry.status='invalid';entry.color=STATUS_COLORS.invalid;}
   else{const [lo,hi]=lens.domain;entry.value=result.value;entry.normalized=clamp((result.value-lo)/(hi-lo));entry.status=result.value<lo?'underflow':result.value>hi?'overflow':'valid';entry.color=scalarColor(entry.normalized);}
  }
  entries.push(entry);byNode[binding.node]=entry;
 }
 return {status:status==='current'?(Array.isArray(trace)?'current':'not-evaluated'):status,lens,byNode,entries};
}
function colorFor(shape,nodeIndex,lensState){
 const neutral=shape.design?.ink?.neutral||shape.design?.light?.neutral||'#d5e2e0',chroma=shape.design?.chroma;
 if(!chroma)return neutral;
 const node=shape.nodes[nodeIndex];if(!node)throw Error('Unknown material owner');
 const strength=Number.isFinite(chroma.strength)?clamp(chroma.strength):0;
 const entry=lensState?.byNode?.[node.id];let color=entry?.color||ROLES[role(node.op)].color;
 if(lensState?.lens&&!entry)color=desaturate(color,.48);
 return strength===1?color:strength===0?neutral:mix(neutral,color,strength);
}
const api={ROLES,ROLE_MAP,SCALE_STOPS,STATUS_COLORS,STATUS_LABELS,role,compile,owner,scalarColor,resolveLens,colorFor};
if(typeof module!=='undefined')module.exports=api;root.Chroma=api;
})(typeof globalThis!=='undefined'?globalThis:this);
