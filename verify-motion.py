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
    page=browser.new_page(viewport={'width':1450,'height':1100});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.environ.get('QUINELINGS_URL',f'http://127.0.0.1:{server.server_port}/'));page.wait_for_function('quineling.library.length===10 && translation.activeNode')
    source=page.evaluate('Quinelings.canon(quineling.program)')
    page.evaluate('''() => {const render=quineling.renderOn;quineling.renderOn=(target,t)=>{window.observedPhase=t;return render(target,t);};translation.setStage(3);}''')
    page.locator('#translation-form').scroll_into_view_if_needed();page.wait_for_timeout(350)
    page.locator('#translation-pause').click();page.wait_for_timeout(100)
    frozen=page.evaluate('[quineling.phase,quineling.viewSeconds]');image=page.locator('#translation-form').evaluate('(e)=>e.toDataURL()')
    page.wait_for_timeout(450)
    assert page.evaluate('[quineling.phase,quineling.viewSeconds]')==frozen
    assert page.evaluate('observedPhase===quineling.phase')
    assert page.locator('#translation-form').evaluate('(e)=>e.toDataURL()')==image
    assert page.locator('#pause').inner_text()=='Resume motion'
    assert page.evaluate('quineling.result') is None
    assert page.evaluate('Quinelings.canon(quineling.program)')==source
    page.locator('#translation-pause').click();page.wait_for_timeout(150)
    assert page.evaluate('quineling.phase')>frozen[0]
    page.emulate_media(reduced_motion='reduce');page.wait_for_function('!quineling.moving')
    frozen=page.evaluate('quineling.phase');page.wait_for_timeout(180);assert page.evaluate('quineling.phase')==frozen
    assert page.locator('#translation-pause').inner_text()=='Resume motion'
    page.emulate_media(reduced_motion='no-preference');page.wait_for_function('quineling.moving')
    page.evaluate('quineling.toggleMotion();quineling.run()')
    recorded=page.evaluate('quineling.traceNode');page.evaluate('quineling.focusNode("faultScore")')
    assert page.evaluate('quineling.traceNode')==recorded
    page.locator('#creature').scroll_into_view_if_needed();page.wait_for_timeout(150)
    target=page.evaluate('''() => {const c=document.getElementById('creature'),r=c.getBoundingClientRect(),p=quineling.renderOn(c,quineling.phase);let best=null,distance=-1;for(const [id,v] of p.positions){const nearest=Math.min(...[...p.positions].filter(([other])=>other!==id).map(([,a])=>Math.hypot(a.x-v.x,a.y-v.y)));if(nearest>distance){best={id,x:r.left+(p.cx+v.x*p.scale)*r.width/c.width,y:r.top+(p.cy+v.y*p.scale)*r.height/c.height};distance=nearest;}}return best;}''')
    page.mouse.click(target['x'],target['y']);assert page.evaluate('quineling.selected')==target['id']
    page.keyboard.press('Escape');assert page.evaluate('quineling.selected') is None
    assert page.evaluate('translation.activeNode') is None
    assert page.locator('.program-line[aria-pressed="true"]').count()==0
    page.set_viewport_size({'width':390,'height':844});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    assert not errors,errors
    report={'passed':True,'sharedClock':True,'pauseFreezesPixelsAndClock':True,'dynamicReducedMotion':True,'viewPreservesSourceAndDoesNotExecute':True,'selectionPreservesRecordedTrace':True,'canvasHitTest':True,'clearFocusKeyboard':True,'mobileNoOverflow':True,'pageErrors':errors}
    (ROOT/'motion-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
