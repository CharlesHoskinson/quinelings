'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),K=require('../kernels.js'),V=require('../qdl-v1-kernels.js');
const files=['qdl-v1.js','qdl-v1-types.js','qdl-v1-contract.js','qdl-v1-kernels.js','kernels.js','core.js','orbit.js','qdl.js','anatomy.js','chroma.js','morphology.js','ranch-crypto.js'];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const manifest={id:'qdl-kernels-1',language:'qdl-program',version:1,canonical:'qdl-json-1',
 bounds:{sourceBytes:65536,valueBytes:65536,valueDepth:24,collectionEntries:512,stringCodeUnits:16384,nodes:64,nodePorts:16,outputs:16,repeats:8,runBytes:2097152,diagnosticReserveBytes:8192},
 semantics:{numeric:'finite IEEE754 binary64; left-to-right checked reductions; safe integer refinement',units:'normalized symbolic products; no implicit conversion',order:'first ready in authored node order',effects:'local simulation; occurrence-atomic publication; stop after first failed occurrence',input:'exact named typed snapshot; explicit null; immutable source',thought:'public authored declarations; checked references; no factual certification',source:'ordinary quoted constructor AST; source-only verification does not run tasks',unicode:'UTF16 key order and lengths; reject lone surrogates; no normalization',legacy:'separate experimental source profile; no implicit migration'},
 operations:Object.fromEntries(Object.entries({...K.ARITY,...V.ARITY}).map(([op,arity])=>[op,{arity,...(V.contracts[op]||{})}])),
 implementationHashes:Object.fromEntries(files.map(file=>[file,hash(fs.readFileSync(path.join(root,file)))]))};
function canon(x){return Array.isArray(x)?'['+x.map(canon).join(',')+']':x!==null&&typeof x==='object'?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canon(x[k])).join(',')+'}':JSON.stringify(x);}
const digest=hash(canon(manifest));
const generated='(function(root){\n\'use strict\';\nconst manifest='+JSON.stringify(manifest,null,2)+';\nfunction freeze(x){if(x&&typeof x===\'object\'){Object.values(x).forEach(freeze);Object.freeze(x);}return x;}\nconst api=Object.freeze({manifest:freeze(manifest),digest:'+JSON.stringify(digest)+'});\nif(typeof module!==\'undefined\'&&module.exports)module.exports=api;root.QDLV1Registry=api;\n})(typeof globalThis!==\'undefined\'?globalThis:this);\n';
const target=path.join(root,'qdl-v1-registry.js'),sidecar=path.join(root,'design/qdl-v1-registry.json'),sidecarText=JSON.stringify({manifest,digest},null,2)+'\n';
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==generated||!fs.existsSync(sidecar)||fs.readFileSync(sidecar,'utf8')!==sidecarText)throw Error('QDL v1 registry implementation pin is stale; regenerate before accepting candidate sources.');console.log('Verified registry '+digest);}else{fs.writeFileSync(target,generated);fs.writeFileSync(sidecar,sidecarText);console.log('Generated candidate registry '+digest);}
