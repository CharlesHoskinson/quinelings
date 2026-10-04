"""Capture actual browser-rendered motion at four normalized driver phases."""
from pathlib import Path
import base64,functools,http.server,json,os,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
label=os.environ.get('REVIEW_LABEL','improved')
with sync_playwright() as p:
 options={'headless':True}
 if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
 browser=p.chromium.launch(**options)
 page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce')
 page.goto(os.environ.get('QUINELINGS_URL',f'http://127.0.0.1:{server.server_port}/'));page.wait_for_function('window.quineling?.library.length===10')
 page.locator('#semantic-color').uncheck()
 captures=[]
 for family in ['jelly','moth','torus']:
  frames=page.evaluate('''family=>{quineling.select(quineling.library.find(p=>p.skin.family===family));quineling.clearFocus();const c=document.getElementById('creature'),rate=quineling.shape.design.motion.rhythm?.rate||1;return [0,Math.PI/2,Math.PI,3*Math.PI/2].map(phase=>{quineling.renderOn(c,phase/rate);return c.toDataURL();});}''',family)
  captures.append({'family':family,'frames':frames})
 sheet=page.evaluate('''async rows=>{const c=document.createElement('canvas');c.width=1200;c.height=1040;const x=c.getContext('2d');x.fillStyle='#090f15';x.fillRect(0,0,c.width,c.height);x.font='18px sans-serif';x.fillStyle='#b6edcc';x.fillText('QUINELINGS · four phases of the motion driver',24,30);for(let row=0;row<rows.length;row++){x.fillStyle='#e5edf0';x.fillText(rows[row].family.toUpperCase(),24,65+row*325);for(let col=0;col<4;col++){const im=new Image();im.src=rows[row].frames[col];await im.decode();x.drawImage(im,col*300,75+row*325,300,280);x.fillStyle='#82919f';x.font='14px monospace';x.fillText(['0','π/2','π','3π/2'][col],col*300+24,375+row*325);}}return c.toDataURL();}''',captures)
 path=ROOT/'research'/f'living-motion-{label}-filmstrip.png';path.write_bytes(base64.b64decode(sheet.split(',')[1]));print(path)
 if page.locator('#motion-controls').count():
  page.locator('#motion-controls').evaluate('(e)=>e.open=true');page.locator('#motion-controls').screenshot(path=str(ROOT/'research'/f'living-motion-{label}-controls.png'))
 browser.close()
server.shutdown();server.server_close()
