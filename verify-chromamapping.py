"""Integration checks for source-authored color and recorded scalar data."""
from pathlib import Path
import functools, http.server, json, os, threading
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parent
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        options = {'headless': True}
        if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):
            options['executable_path'] = os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
        browser = p.chromium.launch(**options)
        page = browser.new_page(viewport={'width': 1450, 'height': 1100}, reduced_motion='reduce')
        errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(f'http://127.0.0.1:{server.server_port}/gallery.html')
        page.wait_for_function('window.quineling?.shape && quineling.library.length === 10')
        assert page.locator('.creature-card').count() == 10
        assert page.evaluate('quineling.library.every(item => QDL.forProgram(item).chroma.palette === "roles-1")')
        page.locator('#library').screenshot(path=str(ROOT/'research/chroma-collection.png'))
        source = page.evaluate('Quinelings.canon(quineling.program)')
        page.locator('#creature').scroll_into_view_if_needed();page.wait_for_timeout(150)
        role_pixels = page.locator('#creature').evaluate('(c) => c.toDataURL()')
        page.locator('#chroma-view').select_option('neutral');page.wait_for_timeout(120)
        assert page.locator('#creature').evaluate('(c) => c.toDataURL()') != role_pixels
        assert page.evaluate('Quinelings.canon(quineling.program)') == source
        assert page.evaluate('quineling.result') is None
        page.locator('#chroma-view').select_option('scalar')
        assert page.evaluate('quineling.chromaState.byNode.faultScore.status') == 'not-evaluated'
        assert 'Not evaluated' in page.locator('#chroma-value').inner_text()
        assert page.evaluate('Chroma.resolveLens(quineling.shape.design, {trace:[{edge:"faultScore",value:0}]}).byNode.faultScore.status') == 'valid'
        assert '0.625' in page.locator('#chroma-threshold-label').inner_text()
        cases = [('healthy-lamp-guard-false', .125, 'skipped'), ('threshold-boundary', .625, 'simulated'), ('default-confirmed-fault', .875, 'simulated'), ('conflicting-inspections-guard-false', .875, 'skipped')]
        colors = {}
        for name, value, action in cases:
            index = page.evaluate('(name) => quineling.current.fixtures.findIndex(f => f.name === name)', name)
            page.locator('#fixture').select_option(str(index))
            assert page.evaluate('quineling.result') is None
            assert page.evaluate('quineling.chromaState.byNode.faultScore.status') == 'not-evaluated'
            page.locator('#run').click()
            entry = page.evaluate('quineling.chromaState.byNode.faultScore')
            assert entry['status'] == 'valid' and entry['value'] == value and entry['normalized'] == value, entry
            assert page.evaluate('quineling.result.tasks[0].trace.find(r => r.edge === "repairReceipt").value.status') == action
            colors[name] = entry['color']
            page.evaluate('quineling.clearFocus()');page.locator('#creature').scroll_into_view_if_needed();page.wait_for_timeout(120)
            if name in ['healthy-lamp-guard-false', 'default-confirmed-fault']:
                tag = 'low' if value < .5 else 'high'
                page.locator('#creature').screenshot(path=str(ROOT/f'research/chroma-fault-{tag}.png'))
        assert colors[cases[0][0]] != colors[cases[2][0]]
        assert colors[cases[2][0]] == colors[cases[3][0]], 'Evidence must not silently alter the fault-score scale'
        page.locator('#repeats').fill('3');page.locator('#repeats').dispatch_event('input')
        assert page.evaluate('quineling.chromaState.status') == 'not-evaluated'
        page.locator('#run').click()
        source = page.evaluate('Quinelings.canon(quineling.program)')
        result = page.evaluate('JSON.stringify(quineling.result)')
        page.locator('#chroma-cycle').select_option('2')
        assert page.evaluate('quineling.chromaCycle') == 2
        assert 'cycle 3 of 3' in page.locator('#chroma-cycle option:checked').inner_text()
        for mode in ['neutral', 'roles', 'scalar']:
            page.locator('#chroma-view').select_option(mode)
        page.locator('#step').click()
        assert page.evaluate('Quinelings.canon(quineling.program)') == source
        assert page.evaluate('JSON.stringify(quineling.result)') == result
        page.locator('#birth').click()
        assert page.evaluate('Quinelings.canon(quineling.program)') == source
        assert page.evaluate('quineling.chromaState.byNode.faultScore.value') == .875
        for selector in ['#recover', '#recover-color']:
            page.locator(selector).click()
            assert 'QUINE VERIFIED' in page.locator('#proof').inner_text()
        page.locator('#chroma-controls').screenshot(path=str(ROOT/'research/chroma-controls.png'))
        page.locator('#motion-controls').evaluate('(e) => e.open=true')
        page.locator('#rhythm-wave').fill('0.12');page.locator('#rhythm-wave').dispatch_event('change')
        assert page.evaluate('quineling.result') is None
        assert page.evaluate('quineling.chromaState.byNode.faultScore.status') == 'not-evaluated'
        assert page.evaluate('quineling.shape.design.chroma.lens.id') == 'fault-score'
        page.locator('.creature-card').nth(1).click()
        assert page.locator('#chroma-view').input_value() == 'roles'
        assert page.locator('#chroma-scalar-option').is_disabled()
        assert page.evaluate('quineling.chromaState') is None
        page.set_viewport_size({'width':390, 'height':844})
        page.locator('.creature-card').first.click();page.locator('#chroma-view').select_option('scalar')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.locator('#chroma-controls').screenshot(path=str(ROOT/'research/chroma-mobile.png'))
        assert not errors, errors
        report={'passed':True,'coloredSpecies':10,'fixedDomainAndThreshold':True,'missingDistinctFromZero':True,'sameValueSameColorAcrossEvidenceStates':True,'viewDoesNotExecuteOrEditSource':True,'explicitTaskOccurrence':True,'editsInvalidateTrace':True,'reproductionAndBothCodecs':True,'mobileNoOverflow':True,'pageErrors':errors}
        (ROOT/'chromamapping-verification.json').write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps(report));browser.close()
finally:
    server.shutdown();server.server_close()
