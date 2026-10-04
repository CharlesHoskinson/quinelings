from pathlib import Path
import functools,http.server,json,os,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
    options={'headless':True}
    if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'): options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
    browser=p.chromium.launch(**options)
    page=browser.new_page(viewport={'width':1450,'height':1100});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(os.environ.get('QUINELINGS_URL',f'http://127.0.0.1:{server.server_port}/'));page.wait_for_function('quineling.library.length===10 && translation.activeNode')
    # UI edits author recoverable source without executing a task.
    original=page.evaluate('Quinelings.canon(quineling.program)')
    page.locator('#motion-controls').evaluate('(e)=>e.open=true')
    page.locator('#rhythm-mode').select_option('quasiperiodic')
    for field,value in [('breath',.12),('wave',.11),('lag',1.7)]:
        control=page.locator('#rhythm-'+field)
        control.fill(str(value));control.dispatch_event('change')
        assert page.evaluate('quineling.result') is None
        assert page.evaluate('quineling.shape.design.motion.rhythm')[field]==value
    custom=page.evaluate('quineling.shape.design.motion.rhythm')
    assert custom['mode']=='quasiperiodic'
    assert page.evaluate('Quinelings.canon(quineling.program)')!=original
    page.locator('#fixture').select_option('1')
    page.locator('#repeats').fill('3');page.locator('#repeats').dispatch_event('input')
    assert page.evaluate('quineling.shape.design.motion.rhythm')==custom
    assert page.evaluate('quineling.shape.repeats')==3
    assert page.evaluate('quineling.result') is None
    encoded=page.evaluate('Quinelings.canon(quineling.program)')
    page.locator('#birth').click()
    assert page.evaluate('quineling.generation')==1
    assert page.evaluate('quineling.shape.design.motion.rhythm')==custom
    assert page.evaluate('Quinelings.canon(quineling.program)')==encoded
    page.locator('#recover').click()
    assert 'Recovered source execution: QUINE VERIFIED' in page.locator('#proof').inner_text()
    page.locator('#recover-color').click()
    assert 'Recovered source execution: QUINE VERIFIED' in page.locator('#proof').inner_text()
    page.locator('#rhythm-reset').click()
    assert page.evaluate('JSON.stringify(quineling.shape.design.motion.rhythm)===JSON.stringify(QDL.create(quineling.current.skin.family).motion.rhythm)')
    assert page.locator('#fixture').input_value()=='1'
    assert page.locator('#repeats').input_value()=='3'
    assert page.evaluate('quineling.result') is None
    page.locator('.creature-card').first.click()
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
    report={'passed':True,'sharedClock':True,'pauseFreezesPixelsAndClock':True,'dynamicReducedMotion':True,'viewPreservesSourceAndDoesNotExecute':True,'selectionPreservesRecordedTrace':True,'canvasHitTest':True,'clearFocusKeyboard':True,'mobileNoOverflow':True,'authoredRhythmControls':True,'rhythmEditsDoNotExecute':True,'fixtureAndCyclesPreserveRhythm':True,'reproductionAndCodecsPreserveRhythm':True,'speciesResetPreservesInputs':True,'pageErrors':errors}
    (ROOT/'motion-verification.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
