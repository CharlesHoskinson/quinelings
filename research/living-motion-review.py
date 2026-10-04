"""Deterministic browser evidence; run with a Playwright-enabled Python."""
from pathlib import Path
import functools,http.server,json,os,threading,time
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
label=os.environ.get('REVIEW_LABEL','baseline')
with sync_playwright() as p:
 options={'headless':True}
 if os.environ.get('PLAYWRIGHT_CHROMIUM_EXECUTABLE'): options['executable_path']=os.environ['PLAYWRIGHT_CHROMIUM_EXECUTABLE']
 browser=p.chromium.launch(**options)
 page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce');errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('QUINELINGS_URL',f'http://127.0.0.1:{server.server_port}/'))
 page.wait_for_function('window.quineling?.library.length===10')
 page.locator('#collection').screenshot(path=str(ROOT/'research'/f'living-motion-{label}-collection.png'))
 results=[]
 for index in range(10):
  page.locator('.creature-card').nth(index).click()
  page.locator('#semantic-color').uncheck()
  result=page.evaluate('''() => { const M=Morphology,s=quineling.shape,f=M.portraitFrame(s),times=[],phases=[0,.7,2,4,11,37,101,1000],counts=[];let clipped=0,maxX=0,maxY=0,seam=0;
  for(const t of phases){const start=performance.now(),m=M.surfaceFrame(s,t,false);times.push(performance.now()-start);counts.push(m.points.length/4);
   for(let i=0;i<m.points.length;i+=4){const x=Math.abs(m.points[i]-f.cx)*s.design.composition.occupancy/f.width,y=Math.abs(m.points[i+1]-f.cy)*s.design.composition.occupancy/f.height;maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);if(x>.5||y>.5)clipped++;}
   for(let k=0;k<M.ribbonCount(s);k++){const a=M.surfacePoint(s,0,.8,k,M.ribbonCount(s),t),b=M.surfacePoint(s,1,.8,k,M.ribbonCount(s),t);seam=Math.max(seam,Math.hypot(a.x-b.x,a.y-b.y,(a.z||0)-(b.z||0)));}}
  const canvas=document.getElementById('creature');quineling.renderOn(canvas,2);
  return {id:quineling.current.id,family:s.design.family,frame:f,phases,surfaceMs:times,pointCounts:counts,clipped,maxX,maxY,endpointDistance:seam};}''')
  results.append(result)
  page.locator('#creature').screenshot(path=str(ROOT/'research'/f'living-motion-{label}-{result["family"]}.png'))
  page.locator('#semantic-color').check()
 report={'label':label,'url':page.url,'results':results,'pageErrors':errors}
 (ROOT/'research'/f'living-motion-{label}.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
