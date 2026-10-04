const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),Q=require('./core.js');
const ids=JSON.parse(fs.readFileSync(path.join(__dirname,'programs/manifest.json'))),results=[],families=new Set();assert.equal(ids.length,10);
for(const id of ids){
 const item=JSON.parse(fs.readFileSync(path.join(__dirname,`programs/${id}.json`)));assert.equal(item.id,id);assert(!families.has(item.skin.family),'Duplicate family');families.add(item.skin.family);assert(item.fixtures.length>=3);
 const fixtures=[];for(const f of item.fixtures){const run=Q.runTask(item.graph,f.overrides||{});assert.deepEqual(run.output,f.expected,`${id} / ${f.name}`);const ast=Q.makeTaskProgram(run.graph),out=Q.execute(ast);assert.deepEqual(out.tasks[0].output,f.expected);assert.equal(out.emitted[0],Q.canon(ast));fixtures.push(f.name);}
 let ast=Q.makeTaskProgram(item.graph,1,require('./qdl.js').forProgram(item));const original=Q.canon(ast),g=Q.encode(ast),rgb=Q.encodeColors(ast);
 assert.equal(Q.canon(Q.decode(g)),original);assert.equal(Q.canon(Q.decodeColors(rgb)),original);assert.equal(Q.canon(Q.decode(Q.fromSamples(Q.samples(g)))),original);
 for(let generation=0;generation<3;generation++){const run=Q.execute(ast);assert.equal(run.emitted[0],original);ast=JSON.parse(run.emitted[0]);assert.deepEqual(Q.encode(ast),g);assert.deepEqual(Q.encodeColors(ast),rgb);}
 const shape=Q.describe(ast);assert.equal(shape.design.family,item.skin.family);assert.equal(shape.nodes.length,item.graph.nodes.length);for(const n of shape.nodes){const p=Q.nodePosition(n,0,shape);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.equal(Q.instructionFromColor(Q.instructionColor(n.op)),n.op);}
 results.push({id,family:item.skin.family,nodes:shape.nodes.length,connections:shape.links.length,sourceBytes:Buffer.byteLength(original),harmonicBands:g.bands.length,fixtures,verifiedGenerations:3,harmonicRecovery:true,colorRecovery:true});
}
const report={programs:results.length,fixtures:results.reduce((s,r)=>s+r.fixtures.length,0),results};fs.writeFileSync(path.join(__dirname,'library-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
