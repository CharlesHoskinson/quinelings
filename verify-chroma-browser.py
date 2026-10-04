from pathlib import Path
import functools,http.server,json,os,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE','/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome'))
    page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce');errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.environ.get('QUINELINGS_URL',f'http://127.0.0.1:{server.server_port}/'))
    page.wait_for_function('window.quineling?.library.length===10')
    page.locator('.creature-card').first.click()
    source=page.evaluate('Quinelings.canon(quineling.program)')
    page.locator('#chroma-view').select_option('scalar')
    assert page.evaluate('quineling.result') is None
    assert page.evaluate('quineling.chromaState.entries[0].status')=='not-evaluated'
    assert 'Not evaluated' in page.locator('#chroma-value').inner_text()
    page.locator('#run').click()
    high=page.evaluate('quineling.chromaState.entries[0]')
    assert high['status']=='valid' and high['value']>=.625
    recorded=page.evaluate('JSON.stringify(quineling.result)')
    for mode in ['neutral','roles','scalar']:
        page.locator('#chroma-view').select_option(mode)
        assert page.evaluate('JSON.stringify(quineling.result)')==recorded
        assert page.evaluate('Quinelings.canon(quineling.program)')==source
    page.locator('#fixture').select_option('1')
    assert page.evaluate('quineling.result') is None
    assert page.evaluate('quineling.chromaState.entries[0].status')=='not-evaluated'
    page.locator('#run').click()
    low=page.evaluate('quineling.chromaState.entries[0]')
    assert low['status']=='valid' and low['value']<.625 and low['color']!=high['color']
    page.locator('#birth').click()
    assert page.evaluate('quineling.generation')==1
    assert page.evaluate('quineling.chromaState.entries[0].value')==low['value']
    assert page.evaluate('quineling.shape.design.chroma.lens.bindings[0].node')=='faultScore'
    page.locator('.creature-card').nth(1).click()
    assert page.locator('#chroma-scalar-option').is_disabled()
    for width,height in [(390,844),(1450,1100)]:
        page.set_viewport_size({'width':width,'height':height})
        page.locator('.creature-card').first.click()
        page.locator('#chroma-view').select_option('scalar')
        assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1')
    assert not errors,errors
    result={'ok':True,'checks':['Lens view cannot execute or fabricate an unevaluated value','Recorded low/high fixtures have distinct fixed-domain colors','View changes preserve source and execution result','Source/fixture changes invalidate prior recording','Fresh quine retains lens and recorded value','Unbound species disable scalar view','Mobile and desktop controls fit; no browser errors']}
    (ROOT/'chroma-browser-verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
    browser.close()
server.shutdown()
