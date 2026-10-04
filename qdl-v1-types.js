(function(root){
'use strict';
// JSON from untrusted clients must be parsed before entering this module. JavaScript
// cannot inspect hostile same-process Proxies without invoking reflection traps;
// descriptor checks prevent getters, but are not a sandbox for Proxy handlers.
const bad=new Set(['__proto__','prototype','constructor']);
function fail(code,path,message){const e=new Error(message);e.code=code;e.path=path;throw e;}
function check(ok,code,path,message){if(!ok)fail(code,path,message);}
function unicode(s,path){for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const d=s.charCodeAt(++i);check(d>=0xdc00&&d<=0xdfff,'unicode',path,'Unpaired high surrogate');}else check(!(c>=0xdc00&&c<=0xdfff),'unicode',path,'Unpaired low surrogate');}}
function child(path,key){return path+'['+JSON.stringify(String(key))+']';}
function rawCanonical(v){if(Array.isArray(v))return '['+v.map(rawCanonical).join(',')+']';if(v!==null&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+rawCanonical(Object.getOwnPropertyDescriptor(v,k).value)).join(',')+'}';return JSON.stringify(v);}
function finiteJSON(value,path='$'){
 function walk(v,p,depth,seen){
  check(depth<=24,'limit',p,'JSON nesting exceeds 24');
  if(v===null||typeof v==='boolean')return;
  if(typeof v==='number'){check(Number.isFinite(v),'nonfinite',p,'Expected a finite number');return;}
  if(typeof v==='string'){check(v.length<=16384,'limit',p,'String exceeds 16384 UTF-16 code units');unicode(v,p);return;}
  check(v!==null&&typeof v==='object','json',p,'Expected JSON data');
  check(!seen.has(v),'json',p,'Cyclic JSON data');
  const isArray=Array.isArray(v),proto=Object.getPrototypeOf(v);
  check(isArray?proto===Array.prototype:(proto===Object.prototype||proto===null),'json',p,'Expected a native array or plain record');
  const keys=Reflect.ownKeys(v);
  check(keys.every(k=>typeof k==='string'),'json',p,'Symbol keys are not JSON');
  let dataKeys=keys;
  if(isArray){const length=Object.getOwnPropertyDescriptor(v,'length');check(length&&Object.hasOwn(length,'value')&&Number.isSafeInteger(length.value)&&length.value>=0&&length.value<=512,'limit',p,'Array exceeds 512 entries');dataKeys=keys.filter(k=>k!=='length');check(dataKeys.length===length.value&&dataKeys.every((k,i)=>k===String(i)),'json',p,'Expected a dense array without extra fields');}
  else check(keys.length<=512,'limit',p,'Record exceeds 512 fields');
  const next=new Set(seen).add(v);
  for(const k of dataKeys){const q=child(p,k);unicode(k,q);check(k.length<=16384,'limit',q,'Property name too long');check(!bad.has(k),'unsafe-key',q,'Forbidden property name');const d=Object.getOwnPropertyDescriptor(v,k);check(d&&Object.hasOwn(d,'value')&&d.enumerable,'json',q,'Only enumerable own data properties are JSON');walk(d.value,q,depth+1,next);}
 }
 try{walk(value,path,0,new Set());check(new TextEncoder().encode(rawCanonical(value)).length<=65536,'limit',path,'Value exceeds 65536 UTF-8 bytes');return true;}catch(e){if(e&&typeof e.code==='string'&&typeof e.path==='string')throw e;fail('json',path,'Reflection or serialization failed');}
}
function canonical(value){finiteJSON(value);return rawCanonical(value);}
function unit(text){
 check(typeof text==='string'&&text.length<=64&&/^(one|[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)(\*[A-Za-z][A-Za-z0-9_-]*(\^-?[1-9][0-9]?)?)*$/.test(text),'unit','$','Invalid symbolic unit');
 const powers=Object.create(null);
 for(const term of text.split('*')){const [base,e]=term.split('^');if(base!=='one')powers[base]=(powers[base]||0)+(e===undefined?1:Number(e));}
 check(Object.values(powers).every(e=>Math.abs(e)<=99),'unit','$','Unit exponent exceeds 99');
 const result=Object.keys(powers).sort().filter(k=>powers[k]).map(k=>k+(powers[k]===1?'':'^'+powers[k])).join('*')||'one';check(result.length<=64,'unit','$','Normalized unit too long');return result;
}
function normalize(t,path='$'){
 finiteJSON(t,path);
 function closed(v,required,optional,p){check(v!==null&&typeof v==='object'&&!Array.isArray(v),'type',p,'Expected a type record');for(const k of required)check(Object.hasOwn(v,k),'missing',child(p,k),'Missing type field');for(const k of Object.keys(v))check(required.includes(k)||optional.includes(k),'unknown-field',child(p,k),'Unknown type field');}
 function nat(v,p,max){check(Number.isSafeInteger(v)&&v>=0&&v<=max,'refinement',p,'Expected bounded nonnegative safe integer');return v;}
 function norm(v,p){
  check(v!==null&&typeof v==='object'&&!Array.isArray(v)&&typeof v.kind==='string','type',p,'Expected a type');let out;
  switch(v.kind){
  case 'number':closed(v,['kind','unit'],['integer','min','max'],p);let u;try{u=unit(v.unit);}catch(e){fail(e.code,child(p,'unit'),e.message);}out={kind:'number',unit:u};if(Object.hasOwn(v,'integer')){check(typeof v.integer==='boolean','type',child(p,'integer'),'Expected Boolean integer refinement');out.integer=v.integer;}for(const k of ['min','max'])if(Object.hasOwn(v,k)){check(typeof v[k]==='number'&&Number.isFinite(v[k]),'refinement',child(p,k),'Expected finite numeric bound');out[k]=Object.is(v[k],-0)?0:v[k];}check(!(Object.hasOwn(v,'min')&&Object.hasOwn(v,'max'))||v.min<=v.max,'refinement',p,'Numeric bounds are reversed');break;
  case 'string':closed(v,['kind'],['enum','minLength','maxLength'],p);out={kind:'string'};if(Object.hasOwn(v,'enum')){check(Array.isArray(v.enum)&&v.enum.length<=32&&v.enum.every(x=>typeof x==='string')&&new Set(v.enum).size===v.enum.length,'refinement',child(p,'enum'),'Expected at most 32 unique string enum values');out.enum=[...v.enum].sort();}for(const k of ['minLength','maxLength'])if(Object.hasOwn(v,k))out[k]=nat(v[k],child(p,k),16384);check((out.minLength??0)<=(out.maxLength??16384),'refinement',p,'String bounds are reversed');if(out.enum)check(out.enum.every(s=>s.length>=(out.minLength??0)&&s.length<=(out.maxLength??16384)),'refinement',p,'Enum value violates length bounds');break;
  case 'boolean':case 'null':closed(v,['kind'],[],p);out={kind:v.kind};break;
  case 'array':closed(v,['kind','element'],['minLength','maxLength','uniqueBy'],p);out={kind:'array',element:norm(v.element,child(p,'element'))};for(const k of ['minLength','maxLength'])if(Object.hasOwn(v,k))out[k]=nat(v[k],child(p,k),512);check((out.minLength??0)<=(out.maxLength??512),'refinement',p,'Array bounds are reversed');if(Object.hasOwn(v,'uniqueBy')){check(typeof v.uniqueBy==='string'&&v.uniqueBy.length>0&&!bad.has(v.uniqueBy),'refinement',child(p,'uniqueBy'),'Expected a safe own field name');check(out.element.kind==='record'&&Object.hasOwn(out.element.fields,v.uniqueBy),'refinement',child(p,'uniqueBy'),'uniqueBy must name a record element field');out.uniqueBy=v.uniqueBy;}break;
  case 'optional':closed(v,['kind','element'],[],p);out={kind:'optional',element:norm(v.element,child(p,'element'))};break;
  case 'record':closed(v,['kind','fields'],[],p);check(v.fields!==null&&typeof v.fields==='object'&&!Array.isArray(v.fields),'type',child(p,'fields'),'Expected record fields');out={kind:'record',fields:Object.create(null)};for(const k of Object.keys(v.fields).sort()){check(k.length>0&&!bad.has(k),'type',child(p,'fields'),'Expected nonempty safe field name');out.fields[k]=norm(v.fields[k],child(child(p,'fields'),k));}break;
  default:fail('type',child(p,'kind'),'Unknown type kind');
  }
  return out;
 }
 return norm(t,path);
}
function assert(value,type,path='$'){
 const t=normalize(type,path+'.type');finiteJSON(value,path);
 function match(v,t,p){
  if(t.kind==='optional'){if(v!==null)match(v,t.element,p);return;}
  if(t.kind==='null'){check(v===null,'type',p,'Expected null');return;}
  if(t.kind==='number'){check(typeof v==='number'&&Number.isFinite(v),'type',p,'Expected finite number');if(t.integer)check(Number.isSafeInteger(v),'refinement',p,'Expected safe integer');if(Object.hasOwn(t,'min'))check(v>=t.min,'refinement',p,'Number is below minimum');if(Object.hasOwn(t,'max'))check(v<=t.max,'refinement',p,'Number is above maximum');return;}
  if(t.kind==='boolean'||t.kind==='string'){check(typeof v===t.kind,'type',p,'Expected '+t.kind);if(t.kind==='string'){check(v.length>=(t.minLength??0)&&v.length<=(t.maxLength??16384),'refinement',p,'String length violates bounds');if(t.enum)check(t.enum.includes(v),'refinement',p,'String is not an enum value');}return;}
  if(t.kind==='array'){check(Array.isArray(v),'type',p,'Expected array');check(v.length>=(t.minLength??0)&&v.length<=(t.maxLength??512),'refinement',p,'Array length violates bounds');const seen=new Set();v.forEach((x,i)=>{match(x,t.element,child(p,i));if(t.uniqueBy){const key=rawCanonical(Object.getOwnPropertyDescriptor(x,t.uniqueBy).value);check(!seen.has(key),'refinement',child(p,i),'Duplicate uniqueBy value');seen.add(key);}});return;}
  check(v!==null&&typeof v==='object'&&!Array.isArray(v),'type',p,'Expected record');const keys=Object.keys(v),fields=Object.keys(t.fields);check(keys.length===fields.length&&fields.every(k=>Object.hasOwn(v,k)),'type',p,'Record fields must exactly match');for(const k of fields)match(Object.getOwnPropertyDescriptor(v,k).value,t.fields[k],child(p,k));
 }
 match(value,t,path);return true;
}
function same(a,b){return rawCanonical(normalize(a))===rawCanonical(normalize(b));}
function infer(value,quantityUnit='one'){
 finiteJSON(value);const u=unit(quantityUnit);
 function merge(a,b,p){if(rawCanonical(a)===rawCanonical(b))return a;if(a.kind==='null')return b.kind==='optional'?b:{kind:'optional',element:b};if(b.kind==='null')return a.kind==='optional'?a:{kind:'optional',element:a};if(a.kind==='optional'&&rawCanonical(a.element)===rawCanonical(b))return a;if(b.kind==='optional'&&rawCanonical(b.element)===rawCanonical(a))return b;fail('type',p,'Cannot infer one homogeneous element type');}
 function get(v,p){if(v===null)return {kind:'null'};if(typeof v==='number')return {kind:'number',unit:u};if(typeof v==='string'||typeof v==='boolean')return {kind:typeof v};if(Array.isArray(v)){check(v.length>0,'type',p,'Empty arrays require an explicit element type');return {kind:'array',element:v.map((x,i)=>get(x,child(p,i))).reduce((a,b)=>merge(a,b,p))};}const fields=Object.create(null);for(const k of Object.keys(v)){check(k.length>0,'type',child(p,k),'Empty record field name');fields[k]=get(Object.getOwnPropertyDescriptor(v,k).value,child(p,k));}return {kind:'record',fields};}
 return normalize(get(value,'$'));
}
const api={normalize,assert,infer,unit,same,canonical,finiteJSON};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.QDLV1Types=api;
})(typeof globalThis!=='undefined'?globalThis:this);
