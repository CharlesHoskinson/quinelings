from pathlib import Path
import functools,http.server,json,os,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    options={'headless':True};executable=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE');cached=Path('/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
    if executable:options['executable_path']=executable
    elif cached.exists():options['executable_path']=str(cached)
    browser=p.chromium.launch(**options);page=browser.new_page(viewport={'width':1450,'height':1050})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(f'http://127.0.0.1:{server.server_port}/gallery.html');page.wait_for_function('window.quineling?.library.length===10 && window.translation?.activeNode')
    assert page.locator('#city-agent').evaluate('(e)=>e.complete&&e.naturalWidth>0')
    source=page.evaluate('Quinelings.canon(quineling.program)');assert page.evaluate('quineling.result') is None
    origin=page.locator('#thought-bubble').bounding_box()
    page.locator('#translation').screenshot(path=str(ROOT/'research/translation-thought.png'))
    page.locator('#translate-play').click();page.wait_for_function('translation.stage===1');page.wait_for_timeout(1100)
    arrived=page.locator('#thought-bubble').bounding_box();target=page.locator('.program-scene').bounding_box()
    assert arrived['x']>origin['x']+100
    assert target['x']<=arrived['x']<target['x']+target['width']
    assert page.evaluate('Quinelings.canon(quineling.program)')==source
    assert page.evaluate('quineling.result') is None
    page.evaluate('translation.stop();translation.setStage(2)')
    page.locator('.program-line[data-node="faultScore"]').click()
    assert page.evaluate('quineling.selected')=='faultScore'
    assert page.locator('.program-line[data-node="faultScore"]').get_attribute('aria-pressed')=='true'
    assert page.locator('.program-line[aria-pressed="true"]').count()==1
    assert 'weightedMean' in page.locator('#translation-node-name').inner_text()
    frequency=page.evaluate('quineling.shape.nodes.find(n=>n.id==="faultScore").frequency')
    assert f'cos({frequency}θ)' in page.locator('#translation-equation').inner_text()
    color=page.evaluate('Quinelings.instructionColor("weightedMean")')
    assert color in page.locator('#translation-tags').inner_text()
    page.evaluate('translation.setStage(3)');page.wait_for_timeout(900)
    mapping=page.evaluate('''() => {const s=quineling.shape,e=s.links.find(e=>e.from==='faultScore');return {f:1+e.port+s.nodes.find(n=>n.id===e.from).frequency,strands:s.strandCount};}''')
    assert f'f = {mapping["f"]}' in page.locator('#translation-edge').inner_text()
    assert f'{mapping["strands"]} body strands' in page.locator('#translation-rule').inner_text()
    assert page.locator('#translation-link-label').text_content()=='faultScore'
    page.evaluate('translation.setStage(2)');page.wait_for_timeout(1100)
    assert float(page.locator('#translation-link-dot').get_attribute('cx'))>0
    assert float(page.locator('#translation-link-dot').get_attribute('cy'))>0
    page.locator('#translation').screenshot(path=str(ROOT/'research/translation-program.png'))
    page.locator('#translation-cycles').evaluate('(e)=>{e.value=3;e.dispatchEvent(new Event("input"));}')
    assert page.evaluate('quineling.shape.repeats')==3
    page.locator('#translation-run').click();assert page.evaluate('quineling.result.tasks.length')==3
    assert '3 simulated action(s)' in page.locator('#translation-receipt').inner_text()
    for index in range(10):
        page.locator('.creature-card').nth(index).click()
        count=page.evaluate('quineling.shape.nodes.length')
        assert page.locator('.program-line').count()==count
        assert json.loads(page.locator('#translation-json').text_content())==page.evaluate('quineling.shape.graph')
        page.evaluate('translation.setStage(3)')
        page.locator('#translation-run').click()
        assert page.evaluate('quineling.result.emitted[0]===Quinelings.canon(quineling.program)')
    page.locator('.creature-card').first.click();page.evaluate('translation.setStage(3)')
    page.set_viewport_size({'width':390,'height':844});page.emulate_media(reduced_motion='reduce');page.reload()
    page.wait_for_function('window.quineling?.library.length===10 && window.translation?.activeNode')
    page.locator('.translation-steps button[data-stage="1"]').click()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert page.locator('#thought-bubble').evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
    page.locator('#translation').screenshot(path=str(ROOT/'research/translation-mobile.png'))
    assert not errors,errors
    report={'passed':True,'midnightAgentImageLoaded':True,'bubbleMovesIntoProgram':True,'viewPreservesSourceAndDoesNotExecute':True,'linkedProgramOrganFrequencyAndColor':True,'explicitFilamentFrequencyAndStrandCount':True,'cyclesExecute':3,'programsChecked':10,'canonicalGraphMatches':True,'mobileNoOverflow':True,'reducedMotion':True,'pageErrors':errors}
    (ROOT/'translation-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
