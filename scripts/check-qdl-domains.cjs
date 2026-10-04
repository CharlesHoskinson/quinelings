'use strict';
// Check the deliberately small authored-domain notation against the public schema.
// This is a maintenance check, not a verified Lean or JSON parser.
const fs=require('node:fs'),assert=require('node:assert/strict');
const lean=fs.readFileSync(__dirname+'/../spec/lean/QDL/Design.lean','utf8'),schema=JSON.parse(fs.readFileSync(__dirname+'/../design/qdl.schema.json'));
const types={Organ:['organ'],Filament:['filament'],Motion:['motion'],Ink:['ink'],Surface:['surface'],Light:['light'],Composition:['composition'],Rhythm:['motion','rhythm'],Chroma:['chroma']};
const atom='(\\([^)]*\\)|-?\\d+(?:/\\d+)?)',matched=new Set();let domains=0;
function decimal(text){const pieces=text.replace(/[()\s]/g,'').split('/').map(Number);assert(pieces.every(Number.isFinite));return pieces.length===1?pieces[0]:pieces[0]/pieces[1];}
function check(path,field,lo,hi,type){let s=schema;for(const part of path)s=s.properties[part];const harmonic=/^amplitude[₀₁]$/u.test(field),p=harmonic?s.properties.amplitudes.items:s.properties[field];assert(p,`Unmapped Lean field ${path.join('.')}.${field}`);assert.equal(p.minimum,lo);assert.equal(p.maximum,hi);assert.equal(p.type,type);matched.add([...path,harmonic?'amplitudes':field].join('.'));domains++;}
for(const [name,path] of Object.entries(types)){const marker=`def ${name}.Valid`,start=lean.indexOf(marker);assert(start>=0);const body=lean.slice(start).split('\n\n')[0];
 for(const m of body.matchAll(new RegExp('Bounded\\s+'+atom+'\\s+'+atom+'\\s+\\w+\\.([^\\s∧()]+)','gu')))check(path,m[3],decimal(m[1]),decimal(m[2]),'number');
 for(const m of body.matchAll(/\((\d+) ≤ \w+\.(\w+) ∧ \w+\.\2 ≤ (\d+)\)/gu))check(path,m[2],Number(m[1]),Number(m[3]),'integer');
}
// Domain/threshold are relational, not globally bounded. Check their exact schema
// shape and authored Lean relation; rational values do not model JS overflow.
const lens=schema.properties.chroma.properties.lens.properties;
assert.deepEqual({type:lens.domain.type,minItems:lens.domain.minItems,maxItems:lens.domain.maxItems,items:lens.domain.items},
 {type:'array',minItems:2,maxItems:2,items:{type:'number'}});
assert.equal(lens.threshold.type,'number');assert.equal(lens.threshold.minimum,undefined);assert.equal(lens.threshold.maximum,undefined);
assert(lean.includes('l.lower < l.upper'));assert(lean.includes('l.lower ≤ v ∧ v ≤ l.upper'));
matched.add('chroma.lens.domain[]');matched.add('chroma.lens.threshold');domains+=3;
const bindings=lens.bindings,path=bindings.items.properties.path,segments=path.items.anyOf;
assert.deepEqual([bindings.minItems,bindings.maxItems,path.maxItems],[1,64,8]);
assert(lean.includes('(1 ≤ l.bindings.length ∧ l.bindings.length ≤ 64)'));
assert(lean.includes('b.path.length ≤ 8'));assert(lean.includes('(l.bindings.map LensBinding.node).Nodup'));
assert.deepEqual(segments[1],{type:'integer',minimum:0,maximum:511});
assert(lean.includes('| .index value => value ≤ 511'));
matched.add('chroma.lens.bindings[].path[].anyOf.1');domains++;
for(const [field,min,max] of [['id',1,64],['label',1,80],['unit',0,24]]){
 assert.equal(lens[field].minLength,min);assert.equal(lens[field].maxLength,max);
 assert(lean.includes(`l.${field}.length ≤ ${max}`));
 if(min)assert(lean.includes(`${min} ≤ l.${field}.length`));
}
assert.deepEqual([bindings.items.properties.node.minLength,bindings.items.properties.node.maxLength,segments[0].minLength,segments[0].maxLength],[1,64,1,64]);
assert(lean.includes('1 ≤ b.node.length ∧ b.node.length ≤ 64'));
assert(lean.includes('1 ≤ name.length ∧ name.length ≤ 64'));
assert.deepEqual(segments[0].not.enum,['__proto__','constructor','prototype']);
for(const name of segments[0].not.enum)assert(lean.includes(`name ≠ "${name}"`));
function visit(s,path=[]){
 if(['number','integer'].includes(s.type)&&path.join('.')!=='qdl')assert(matched.has(path.join('.')),'Schema numeric domain missing from Lean: '+path.join('.'));
 for(const [key,p] of Object.entries(s.properties||{}))visit(p,[...path,key]);
 if(s.items){
  // Existing organ amplitudes are represented by two checked Lean fields.
  if(!matched.has(path.join('.')))visit(s.items,[...path.slice(0,-1),path.at(-1)+'[]']);
 }
 for(const [i,p] of (s.anyOf||[]).entries())visit(p,[...path,'anyOf',String(i)]);
}
visit(schema);assert(domains>=40,'Expected complete numeric QDL coverage');module.exports={domains};if(require.main===module)console.log(`Lean authored bounds agree with ${domains} schema numeric controls (including relational lens domains).`);
