'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/home/hoskinson/src/reveal-decks/node_modules/playwright');
const root=__dirname,server=http.createServer((request,response)=>{const pathname=new URL(request.url,'http://local').pathname;const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':decodeURIComponent(pathname)));if(!file.startsWith(root+path.sep)){response.writeHead(403);return response.end();}fs.readFile(file,(error,data)=>{if(error){response.writeHead(404);return response.end();}response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');response.end(data);});});
(async()=>{let browser;try{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1200,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'programs/generated/manifest.json'),'utf8'));assert.equal(manifest.length,5);
 await page.goto(base+'/nursery.html',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.quinelingNursery?.specimens.length===5);
 assert.equal(await page.locator('.arrival').count(),5);assert.ok(await page.evaluate(()=>quinelingNursery.specimens.every(s=>s.record===null)));
 const phase=await page.evaluate(()=>quinelingNursery.phase);await page.waitForFunction(p=>quinelingNursery.phase!==p,phase);await page.locator('#motion').click();
 const sources=new Set(),bodies=new Set();
 for(const item of manifest){
  const artifact=JSON.parse(fs.readFileSync(path.join(root,'programs/generated',item.id+'.json'),'utf8'));sources.add(artifact.source);bodies.add(JSON.stringify(artifact.design.anatomy));
  const card=page.locator(`[data-specimen="${item.id}"]`);await card.getByRole('button',{name:'Run task',exact:true}).click();
  assert.deepEqual(await page.evaluate(id=>quinelingNursery.specimens.find(s=>s.artifact.id===id).record.tasks[0].output,item.id),artifact.fixtures[0].expected);
  await card.getByRole('button',{name:'Make a copy',exact:true}).click();assert.match(await card.locator('.copy-status').textContent(),/Fresh copy ran with matching source and result/);
  await card.locator('details').evaluate(e=>e.open=true);await card.locator('.operations button').last().click();assert.ok((await card.locator('.inspection').textContent()).includes('Inputs:'));assert.match(await card.locator('.inspection').textContent(),/Recorded value:/);
  assert.equal(await card.locator('a[download]').getAttribute('href'),'programs/generated/'+item.id+'.json');
  const genome=await page.evaluate(id=>{const s=quinelingNursery.specimens.find(s=>s.artifact.id===id);return [Quinelings.canon(Quinelings.decode(Quinelings.encode(s.artifact.program))),Quinelings.canon(Quinelings.decodeColors(Quinelings.encodeColors(s.artifact.program)))];},item.id);assert.deepEqual(genome,[artifact.source,artifact.source]);
  await card.locator('details').evaluate(e=>e.open=false);
 }
 assert.equal(sources.size,5);assert.equal(bodies.size,5);await page.screenshot({path:'/tmp/quinelings-five.png',fullPage:true});
 for(const item of manifest){
  const artifact=JSON.parse(fs.readFileSync(path.join(root,'programs/generated',item.id+'.json'),'utf8'));
  await page.goto(base+'/create.html?specimen='+item.id,{waitUntil:'networkidle'});await page.waitForFunction(id=>window.creation?.artifact?.graph.name===id,item.name);
  assert.equal(await page.evaluate(()=>creation.artifact.source),artifact.source);assert.equal(await page.evaluate(()=>creation.records.length),0);
  await page.locator('#recover-wave').click();await page.locator('#recover-rgb').click();assert.equal(await page.evaluate(()=>creation.records.length),0);
  await page.locator('#run').click();assert.deepEqual(await page.evaluate(()=>creation.records[0].result.tasks[0].output),artifact.fixtures[0].expected);
  await page.locator('#copy').click();assert.equal(await page.evaluate(()=>creation.records.length),2);assert.equal(await page.evaluate(()=>creation.generation),1);
 }
 await page.goto(base+'/create.html?specimen=missing-specimen',{waitUntil:'networkidle'});assert.match(await page.locator('#diagnostic').textContent(),/Specimen not found/);assert.equal(await page.locator('#run').isDisabled(),true);
 const mobile=await browser.newPage({viewport:{width:320,height:860},reducedMotion:'reduce'});mobile.on('pageerror',error=>errors.push(error.message));await mobile.goto(base+'/nursery.html',{waitUntil:'networkidle'});await mobile.waitForFunction(()=>window.quinelingNursery);
 assert.equal(await mobile.evaluate(()=>quinelingNursery.moving),false);assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth),320);assert.ok(await mobile.evaluate(()=>quinelingNursery.specimens.every(s=>s.record===null)));
 await mobile.locator('[data-specimen="tideglass"]').getByRole('button',{name:'Run task',exact:true}).focus();await mobile.keyboard.press('Enter');assert.deepEqual(await mobile.evaluate(()=>quinelingNursery.specimens[0].record.tasks[0].output),JSON.parse(fs.readFileSync(path.join(root,'programs/generated/tideglass.json'),'utf8')).fixtures[0].expected);
 assert.deepEqual(errors,[]);console.log('Five distinct bodies: runs, fresh copies, both genomes, passive workspace imports, missing imports, mobile and keyboard controls passed.');
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}})().catch(error=>{console.error(error);process.exitCode=1});
