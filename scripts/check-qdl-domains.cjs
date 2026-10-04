'use strict';
// Check the deliberately small authored-domain notation against the public schema.
// This is a maintenance check, not a verified Lean or JSON parser.
const fs=require('node:fs'),assert=require('node:assert/strict');
const lean=fs.readFileSync(__dirname+'/../spec/lean/QDL/Design.lean','utf8'),schema=JSON.parse(fs.readFileSync(__dirname+'/../design/qdl.schema.json'));
const types={Organ:['organ'],Filament:['filament'],Motion:['motion'],Ink:['ink'],Surface:['surface'],Light:['light'],Composition:['composition'],Rhythm:['motion','rhythm']};
const atom='(\\([^)]*\\)|-?\\d+(?:/\\d+)?)',matched=new Set();let domains=0;
function decimal(text){const pieces=text.replace(/[()\s]/g,'').split('/').map(Number);assert(pieces.every(Number.isFinite));return pieces.length===1?pieces[0]:pieces[0]/pieces[1];}
function check(path,field,lo,hi,type){let s=schema;for(const part of path)s=s.properties[part];const harmonic=/^amplitude[₀₁]$/u.test(field),p=harmonic?s.properties.amplitudes.items:s.properties[field];assert(p,`Unmapped Lean field ${path.join('.')}.${field}`);assert.equal(p.minimum,lo);assert.equal(p.maximum,hi);assert.equal(p.type,type);matched.add([...path,harmonic?'amplitudes':field].join('.'));domains++;}
for(const [name,path] of Object.entries(types)){const marker=`def ${name}.Valid`,start=lean.indexOf(marker);assert(start>=0);const body=lean.slice(start).split('\n\n')[0];
 for(const m of body.matchAll(new RegExp('Bounded\\s+'+atom+'\\s+'+atom+'\\s+\\w+\\.([^\\s∧()]+)','gu')))check(path,m[3],decimal(m[1]),decimal(m[2]),'number');
 for(const m of body.matchAll(/\((\d+) ≤ \w+\.(\w+) ∧ \w+\.\2 ≤ (\d+)\)/gu))check(path,m[2],Number(m[1]),Number(m[3]),'integer');
}
function visit(s,path=[]){for(const [key,p] of Object.entries(s.properties||{})){const next=[...path,key];if(['number','integer'].includes(p.type)&&key!=='qdl')assert(matched.has(next.join('.')),'Schema numeric domain missing from Lean: '+next.join('.'));if(p.type==='array'&&p.items?.type==='number')assert(matched.has(next.join('.')));visit(p,next);}}
visit(schema);assert(domains>=35,'Expected complete numeric QDL coverage');module.exports={domains};if(require.main===module)console.log(`Lean authored bounds agree with ${domains} schema numeric controls.`);
