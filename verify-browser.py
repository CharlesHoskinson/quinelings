from pathlib import Path
import functools, http.server, json, os, threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/'
with sync_playwright() as p:
    options={'headless':True}
    executable=os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE')
    cached=Path('/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
    if executable: options['executable_path']=executable
    elif cached.exists(): options['executable_path']=str(cached)
    browser=p.chromium.launch(**options)
    page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce')
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.wait_for_function('window.quineling?.library.length===10')
    assert page.locator('#pause').inner_text()=='Resume motion'
    assert page.locator('.creature-card').count()==10
    results=[]
    for index in range(10):
        page.locator('.creature-card').nth(index).click()
        data=page.evaluate('quineling.library.find(p=>p.name===document.getElementById("identity").textContent)')
        for fixture in range(len(data['fixtures'])):
            page.locator('#fixture').select_option(str(fixture));page.locator('#run').click()
            assert 'TASK + QUINE VERIFIED' in page.locator('#status').inner_text(), data['id']
            actual=page.evaluate('quineling.result.tasks[0].output')
            assert actual==data['fixtures'][fixture]['expected'],data['id']
        page.locator('#fixture').select_option('0')
        page.locator('#birth').click();assert page.evaluate('quineling.generation')==1
        assert 'Fresh child task outputs: EXACT' in page.locator('#proof').inner_text()
        assert page.evaluate('quineling.shape.design.family')==data['skin']['family']
        page.locator('#recover').click();assert 'Recovered source execution: QUINE VERIFIED' in page.locator('#proof').inner_text()
        page.locator('#recover-color').click();assert 'Recovered source execution: QUINE VERIFIED' in page.locator('#proof').inner_text()
        page.locator('#semantic-color').uncheck();page.wait_for_timeout(80)
        page.locator('#creature').screenshot(path=str(ROOT/'research'/f"{data['id']}-portrait.png"))
        page.locator('#semantic-color').check()
        results.append({'id':data['id'],'fixtures':len(data['fixtures']),'freshGeneration':True,'harmonicRecovery':True,'rgbRecovery':True,'familyPreserved':True})
    page.locator('.creature-card').first.click()
    page.locator('#run').click();page.locator('#step').click()
    with page.expect_download() as download: page.locator('#download').click()
    assert download.value.suggested_filename.endswith('-harmonics.json')
    page.locator('#pause').click();page.wait_for_timeout(160);page.locator('#pause').click()
    page.screenshot(path=str(ROOT/'research/library-preview.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    page.screenshot(path=str(ROOT/'research/mobile-preview.png'),full_page=True)
    assert not errors,errors
    report={'programs':10,'fixtures':sum(r['fixtures'] for r in results),'results':results,'reducedMotionStartsPaused':True,'mobileNoOverflow':True,'pageErrors':errors}
    (ROOT/'browser-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
