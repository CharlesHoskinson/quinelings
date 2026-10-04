"""Paired browser measurement; advisory timings, never a machine-dependent test gate."""
from pathlib import Path
import functools,http.server,json,os,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
with sync_playwright() as p:
 options={'headless':True}
 if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'):options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
 browser=p.chromium.launch(**options);report={}
 for label,url in [('live','https://charleshoskinson.github.io/quinelings/'),('local',f'http://127.0.0.1:{server.server_port}/')]:
  page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce');page.goto(url);page.wait_for_function('window.quineling?.library.length===10')
  report[label]=page.evaluate('''()=>{const results=[];for(const item of quineling.library){quineling.select(item);const s=quineling.shape,c=document.getElementById('creature');for(let i=0;i<3;i++)quineling.renderOn(c,i*.23);const surface=[],render=[];for(let i=0;i<12;i++){let start=performance.now();Morphology.surfaceFrame(s,.13+i*.47,false);surface.push(performance.now()-start);start=performance.now();quineling.renderOn(c,.13+i*.47);render.push(performance.now()-start);}const stats=a=>{a.sort((x,y)=>x-y);return {median:a[6],p90:a[10],min:a[0]};};results.push({family:s.design.family,surfaceMs:stats(surface),renderMs:stats(render)});}return results;}''')
  page.close()
 (ROOT/'research'/'living-motion-performance.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
