'use strict';
// Declaration/runtime correspondence only; not a verified JSON parser.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),D=require('../qdl.js');
const root=path.join(__dirname,'..'),schema=JSON.parse(fs.readFileSync(path.join(root,'design/heredity.schema.json'),'utf8')),lean=fs.readFileSync(path.join(root,'spec/lean/QDL/Ranch.lean'),'utf8');
const match=lean.match(/def GeneBound \(g : Int\) : Prop := (-?\d+) ≤ g ∧ g ≤ (-?\d+)/);assert(match,'Exact Lean integer gene domain declaration required');
const h={model:'bounded-traits-experimental',parents:['1'.repeat(64),'2'.repeat(64)],seedDigest:'a'.repeat(64),nonce:0,traits:Object.fromEntries(D.HEREDITY_TRAITS.map(k=>[k,0]))};let runtimeRejections=0;
assert.equal(schema.additionalProperties,false);assert.deepEqual(schema.properties.traits.required,D.HEREDITY_TRAITS);assert.equal(schema.properties.traits.additionalProperties,false);
for(const key of D.HEREDITY_TRAITS){const domain=schema.properties.traits.properties[key];assert.equal(domain.type,'integer');assert.equal(domain.minimum,Number(match[1]));assert.equal(domain.maximum,Number(match[2]));for(const value of [domain.minimum,domain.maximum])D.validateHeredity({...h,traits:{...h.traits,[key]:value}});for(const value of [domain.minimum-1,domain.maximum+1,.5]){assert.throws(()=>D.validateHeredity({...h,traits:{...h.traits,[key]:value}}));runtimeRejections++;}}
for(const [key,constant]of [['minimum','nonceMin'],['maximum','nonceMax']]){const m=lean.match(new RegExp('^def '+constant+' : Nat := (\\d+)$','m'));assert(m);assert.equal(schema.properties.nonce[key],Number(m[1]));D.validateHeredity({...h,nonce:Number(m[1])});}
for(const nonce of [-1,4294967296,.5]){assert.throws(()=>D.validateHeredity({...h,nonce}));runtimeRejections++;}
for(const bad of [{...h,extra:true},{...h,traits:{...h.traits,extra:1}},{...h,parents:[...h.parents,'3'.repeat(64)]},{...h,parents:['A'.repeat(64),h.parents[1]]},{...h,seedDigest:'x'.repeat(64)},{...h,model:'stable-v1'}]){assert.throws(()=>D.validateHeredity(bad));runtimeRejections++;}
const result={status:'passed',schemaNumericBounds:14,runtimeRejections,scope:'Exact gene/nonce declarations and selected closed runtime endpoints; not JSON-parser or compiler refinement'};console.log(JSON.stringify(result));module.exports={domains:14};
