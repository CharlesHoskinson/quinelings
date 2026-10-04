'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'research/beauty-council');
function playwright(){for(const p of [process.env.PLAYWRIGHT_MODULE,'playwright','/home/hoskinson/src/reveal-decks/node_modules/playwright'].filter(Boolean)){try{return require(p);}catch{}}throw Error('Set PLAYWRIGHT_MODULE.');}
const {chromium}=playwright(),site=process.env.QUINELING_SITE||'http://127.0.0.1:8048/',reference=process.env.QUINELING_REFERENCE||'http://127.0.0.1:8047/tweet-reference/';
const original=process.env.QUINELING_REFERENCE_VIDEO||path.resolve(root,'../../midnight-language-lab/tweet-reference/reference.mp4');
(async()=>{fs.mkdirSync(dir,{recursive:true});execFileSync('ffmpeg',['-y','-hide_banner','-loglevel','error','-i',original,'-vf','fps=1/2','-frames:v','4',path.join(dir,'original-%02d.png')]);
 const executablePath=[process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,'/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome','/usr/bin/chromium'].filter(Boolean).find(p=>fs.existsSync(p));
 const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 try{const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'});await page.goto(site);await page.waitForFunction(()=>window.quinelingLab);
 const programs=await page.locator('[data-example]').evaluateAll(xs=>xs.map(x=>x.dataset.example));
 for(const id of programs){await page.locator(`[data-example="${id}"]`).click();for(const phase of [0,25,50,75]){await page.locator('#phase').fill(String(phase));await page.locator('#intro-creature').screenshot({path:path.join(dir,`${id}-${phase}.png`)});}}
 await page.goto(new URL('gallery.html',site).href);await page.waitForFunction(()=>window.quineling?.library?.length===10);const families=await page.evaluate(()=>quineling.library.map(x=>x.id));const phases=[0,Math.PI/2,Math.PI,Math.PI*1.5];
 for(const id of families){await page.evaluate(id=>{quineling.select(quineling.library.find(x=>x.id===id));quineling.clearFocus();},id);await page.waitForTimeout(100);for(const phase of phases){await page.evaluate(t=>quineling.renderOn(document.getElementById('creature'),t),phase);await page.locator('#creature').screenshot({path:path.join(dir,`gallery-${id}-${Math.round(phase*100)}.png`)});}}
 await page.goto(reference);await page.locator('#play').click();for(const phase of phases){await page.locator('#phase').evaluate((el,t)=>{el.value=String(t);el.dispatchEvent(new Event('input'));},phase);await page.locator('#form').screenshot({path:path.join(dir,`reference-reconstruction-${Math.round(phase*100)}.png`)});}
 fs.writeFileSync(path.join(dir,'capture.json'),JSON.stringify({reference,current:site,homepage:{sampleBudget:4000,roleColors:true,selection:false,phases:[0,25,50,75],programs},gallery:{families,phaseRadians:phases,focus:false},referenceReconstruction:{samples:20000,monochrome:true,phaseRadians:phases},note:'View-only phase captures; filmstrips cannot prove smooth temporal quality or biological life. Original MP4 sampled independently every two seconds.'},null,2)+'\n');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
