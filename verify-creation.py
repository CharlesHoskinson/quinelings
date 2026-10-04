"""Production creation flow: independent outputs, explicit executions and browser evidence."""
from pathlib import Path
import functools,http.server,json,os,platform,threading,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=[]
def check(value,label):
    assert value,label
    checks.append(label)
with sync_playwright() as p:
    options={'headless':True};cached=Path('/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
    if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
    elif cached.exists():options['executable_path']=str(cached)
    browser=p.chromium.launch(**options)
    page=browser.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("""window.__executions=0;Object.defineProperty(window,'Quinelings',{configurable:true,get(){return window.__q;},set(value){const original=value.execute;value.execute=(...args)=>{window.__executions++;return original(...args);};window.__q=value;}});""")
    page.goto(f'http://127.0.0.1:{server.server_port}/create.html');page.wait_for_function('window.creation?.artifact&&window.creation?.projection')
    check(page.evaluate('__executions')==0,'Initial generated example builds without execution')
    check(page.locator('#copy').is_disabled(),'Copy disabled before a current-source run')
    palette_checks=page.evaluate("""() => {
      const {graph,design}=creation.artifact,copy=()=>JSON.parse(JSON.stringify(design));
      const zero=copy();zero.ink.neutral='#123456';zero.chroma.strength=0;
      const full=copy();full.chroma.strength=1;
      const omitted=copy();omitted.ink.neutral='#345678';delete omitted.chroma;
      const missing=copy();missing.chroma.strength=1;missing.chroma.lens={kind:'scalar',id:'missing',label:'Missing',unit:'L',domain:[0,10],bindings:[{node:graph.nodes[0].id,path:[]}]};
      const lens=Chroma.resolveLens(missing,null,'not-evaluated'),colors=LifeformRenderer.paletteFor(graph,missing,lens);
      return {
        zero:LifeformRenderer.compile(graph,zero).palette.every(c=>c==='#123456'),
        full:LifeformRenderer.compile(graph,full).palette.every((c,i)=>c===Chroma.ROLES[Chroma.role(graph.nodes[i].op)].color),
        omitted:LifeformRenderer.compile(graph,omitted).palette.every(c=>c==='#345678'),
        missing:colors[0]===Chroma.STATUS_COLORS['not-evaluated'],
        unmapped:colors[1]!==Chroma.ROLES[Chroma.role(graph.nodes[1].op)].color
      };
    }""")
    for name,value in palette_checks.items():check(value,'Authored palette contract: '+name)
    check(page.evaluate('__executions')==0,'Composing role and missing-value palettes never executes a task')

    source=page.evaluate('creation.artifact.source')
    page.locator('.creation-grid').screenshot(path=str(ROOT/'research/creation-desktop.png'))
    page.locator('#watch').click();page.wait_for_timeout(200);page.locator('#watch').click()
    page.locator('#phase').evaluate('(e)=>{e.value=420;e.dispatchEvent(new Event("input"));}')
    page.locator('[data-mode="program"]').click();page.locator('#nodes button').first.click();page.locator('[data-mode="body"]').click()
    check(page.evaluate('__executions')==0 and page.evaluate('creation.artifact.source')==source,'Watch, seek, program inspection preserve source and execute nothing')
    page.locator('#run').click()
    result=page.evaluate('creation.records.at(-1).result.tasks[0].output')
    check(result==[{'grants':[{'id':'fern','requested':4,'granted':4},{'id':'sage','requested':7,'granted':5}],'remaining':0}],'Independent FIFO water allocation outcome')
    check(page.evaluate('__executions')==1,'Run executes exactly once')
    for generation in range(1,4):
        page.locator('#copy').click()
        check(page.evaluate('creation.generation')==generation,'Verified generation '+str(generation))
        check(page.evaluate('__executions')==generation+1,'Copy executes only its fresh child '+str(generation))
        check(page.evaluate('creation.artifact.source')==source,'Copy preserves complete source '+str(generation))
    count=page.evaluate('__executions')
    page.evaluate("creation.recover('wave');creation.recover('rgb')")
    check(page.evaluate('__executions')==count,'Wave and RGB recovery perform no task execution')
    check(page.evaluate("Quinelings.canon(creation.recover('wave'))===creation.artifact.source&&Quinelings.canon(creation.recover('rgb'))===creation.artifact.source"),'Both numerical codecs independently recover source')
    source_before=page.evaluate('creation.artifact.source');graph_before=page.evaluate('Quinelings.canon(creation.artifact.graph)')
    page.locator('[data-variant="1"]').click()
    check(page.evaluate('creation.artifact.source')!=source_before and page.evaluate('Quinelings.canon(creation.artifact.graph)')==graph_before,'Authored candidate changes source while preserving exact graph')
    check(page.locator('#copy').is_disabled() and page.evaluate('__executions')==count,'Candidate clears active receipt and never executes')
    page.locator('#record-select').select_option('1')
    check('Previous source' in page.locator('#lens-values').inner_text(),'Old source records are explicitly stale')
    stable=page.evaluate('creation.artifact.source')
    for thought in ['Share the water fairly','Run forever and send email','[2,3] | sum | launch missiles']:
        page.locator('#thought').fill(thought);page.locator('#build').click();page.wait_for_timeout(50)
        check(page.evaluate('creation.artifact.source')==stable and 'No new program' in page.locator('#diagnostic').inner_text(),'Unresolved thought preserves existing source: '+thought)
    page.evaluate("try{creation.importValue({format:'quineling-chroma-1',pixels:[[255,0,0]]})}catch(e){window.__badImport=e.message}")
    check(page.evaluate('!!window.__badImport&&creation.artifact.source')==stable,'Malformed genome leaves current specimen intact')
    check(page.evaluate('__executions')==count,'Unresolved builds and malformed import have no effects')
    page.evaluate('window.__exported=JSON.parse(JSON.stringify(creation.artifact));creation.importValue(__exported)')
    check(page.evaluate('__executions')==count and not page.evaluate('creation.moving'),'Artifact import validates without running or animation')
    check(page.locator('#copy').is_disabled(),'Imported source requires an explicit current admission run')
    # Source edits and exact clause -> operation -> material mappings.
    page.locator('#thought').fill('[2,3,5] | square | sum');page.locator('#build').click()
    check(page.evaluate('creation.artifact.sourceMap.some(r=>r.clause==="square"&&creation.artifact.graph.nodes.find(n=>n.id===r.nodeId).op==="map")'),'Exact thought clause maps to the actual lowered operation')
    check(page.evaluate('creation.artifact.graph.nodes.every(n=>creation.artifact.design.anatomy.owners.some(o=>o.node===n.id&&o.u[1]>o.u[0]))'),'Every operation owns positive declared material')
    page.locator('#run').click();check(page.evaluate('creation.records.at(-1).result.tasks[0].output')==[38],'Independent squared sum outcome')
    page.locator('#thought').fill('4 L | clamp 0 3');page.locator('#build').click();page.locator('#run').click()
    check(page.evaluate('creation.records.at(-1).result.tasks[0].output')==[3],'Independent bounded scalar outcome')
    page.locator('[data-mode="result"]').click();check('valid' in page.locator('#lens-values').inner_text(),'Recorded scalar value preserves explicit valid state')
    page.locator('#thought').fill('0 L | clamp 0 3');page.locator('#build').click();page.locator('#run').click()
    check('0 L' in page.locator('#lens-values').inner_text(),'Recorded zero is a valid value, not missing')
    scalar_palette=page.evaluate("""() => {const original=LifeformRenderer.draw;let actual;LifeformRenderer.draw=(canvas,body,phase,opts)=>{actual=opts.palette;return original(canvas,body,phase,opts);};try{creation.setMode('result');creation.render();}finally{LifeformRenderer.draw=original;}const a=creation.artifact,r=creation.records.at(-1),lens=Chroma.resolveLens(a.design,r.result.tasks[0],'current'),shape={design:a.design,nodes:a.graph.nodes};return JSON.stringify(actual)===JSON.stringify(a.graph.nodes.map((_,i)=>Chroma.colorFor(shape,i,lens)));}""")
    check(scalar_palette,'Recorded scalar palette applies source strength exactly once through the shared color contract')

    # Network proposals use the same compiler; a delayed request cannot replace an edited draft.
    page.route('**/api/propose',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps({'status':'supported','intent':{'format':'quineling-intent','name':'Proposed sum','thought':'sum supplied data','inputs':[{'id':'values','value':[10,20],'type':{'kind':'array','element':{'kind':'number','unit':'one'}}}],'steps':[{'id':'total','op':'sum','inputs':['values'],'params':{}}],'outputs':['total']},'diagnostics':[]})))
    page.locator('#thought').fill('Add the supplied values');page.locator('summary').filter(has_text='Optional proposal').click();page.locator('#service-enabled').check();page.locator('#build').click();page.wait_for_function('creation.artifact.graph.name==="Proposed sum"')
    check(page.evaluate('creation.artifact.graph.nodes.find(n=>n.id==="total").op')=='sum','Proposal response passes the same typed local compiler')
    previous=page.evaluate('creation.artifact.source')
    page.evaluate('''() => {window.__realFetch=window.fetch;window.fetch=()=>new Promise(resolve=>{window.__releaseProposal=()=>resolve(new Response(JSON.stringify(ThoughtCompiler.parse('[99] | sum')),{status:200}));});}''')
    page.locator('#thought').fill('A delayed interpretation');page.evaluate('()=>{creation.build()}');page.wait_for_function('!!window.__releaseProposal')
    page.locator('#thought').fill('Draft edited while the proposal was pending');page.evaluate('()=>{__releaseProposal();window.fetch=__realFetch}');page.wait_for_timeout(100)
    check(page.evaluate('creation.artifact.source')==previous,'A delayed proposal cannot overwrite a newer edited draft')
    page.locator('#service-enabled').uncheck()
    # Actual source-derived body contact sheet, including multiple topology/seed outputs.
    urls=[];sources=[]
    for i in range(6):
        page.locator('#examples button').nth(i).click();page.locator('#build').click();page.evaluate('creation.setMode("body");creation.render()')
        sources.append(page.evaluate('creation.artifact.source'))
        urls.append(page.evaluate('document.getElementById("lifeform").toDataURL()'))
        page.locator('.specimen').screenshot(path=str(ROOT/f'research/creation-body-{i+1}.png'))
    check(len(set(sources))==6,'Six distinct generated executable artifacts')
    contact=browser.new_page(viewport={'width':1440,'height':1000});contact.set_content('<body style="margin:0;background:#091018;color:#d7ede2;font:16px sans-serif"><h1 style="margin:30px;font-size:24px">Six thoughts. Six generated bodies.</h1><div id="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;padding:15px 30px"></div></body>')
    contact.evaluate('(urls)=>{urls.forEach((url,i)=>{const cell=document.createElement("div"),img=new Image();img.src=url;img.style="width:100%;height:380px;object-fit:contain";cell.append(img);const label=document.createElement("p");label.textContent=["Allocate water","Route with a guarded simulation","Square and sum","Dedupe, sort, mean","Schedule dependencies","Filter and collect"][i];label.style="font-size:13px;margin:0 15px";cell.append(label);document.getElementById("grid").append(cell);});}',urls)
    contact.screenshot(path=str(ROOT/'research/creation-contact-sheet.png'),full_page=True);contact.close()
    # Measured synchronous geometry+raster submission, excluding rAF scheduling/paint presentation.
    measurements=page.evaluate('''() => {const body=LifeformRenderer.compile(creation.artifact.graph,creation.artifact.design),canvas=document.getElementById('lifeform'),times=[];for(let i=0;i<320;i++){const r=LifeformRenderer.draw(canvas,body,i*.031);if(i>=20)times.push(r.metrics.renderMs);}times.sort((a,b)=>a-b);return {samples:300,medianMs:times[150],p95Ms:times[284],maximumMs:times.at(-1),canvas:[canvas.width,canvas.height],devicePixelRatio,hardwareConcurrency:navigator.hardwareConcurrency,userAgent:navigator.userAgent};}''')
    # Mobile still and keyboard-based operation access.
    page.set_viewport_size({'width':390,'height':844});page.emulate_media(reduced_motion='reduce');page.reload();page.wait_for_function('window.creation?.artifact&&window.creation.projection')
    check(page.evaluate('document.documentElement.scrollWidth<=innerWidth'),'390px layout has no horizontal overflow')
    check(not page.evaluate('creation.moving'),'Reduced motion starts with a complete still')
    page.locator('#nodes button').first.focus();page.keyboard.press('Enter')
    check(page.locator('#nodes button').first.get_attribute('aria-pressed')=='true','Operation and material inspection is keyboard accessible')
    page.locator('#run').click();check(page.evaluate('creation.records.length')==1,'Reduced-motion mobile user can execute the task')
    page.locator('.specimen-column').screenshot(path=str(ROOT/'research/creation-mobile.png'))
    check(not errors,'No browser page errors: '+str(errors))
    report={'passed':True,'checks':checks,'browserErrors':errors,'performance':measurements,'performanceScope':'Local headless Chromium, 20 warmup + 300 synchronous geometry and Canvas submission frames; excludes rAF scheduling and final compositor presentation. Not a physical mobile measurement.','host':platform.platform()}
    (ROOT/'creation-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2));browser.close()
server.shutdown();server.server_close()
