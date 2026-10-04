"""Isolated Canvas material experiment; production files are never changed."""
from pathlib import Path
import base64,functools,http.server,json,threading
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
source=(ROOT/'gallery.js').read_text()
old='context.fillRect(cx+points[i]*scale,cy+points[i+1]*scale,dot,dot);'
new='{context.beginPath();context.arc(cx+points[i]*scale+dot/2,cy+points[i+1]*scale+dot/2,dot*.56,0,TAU);context.fill();}'
assert old in source
candidate=source.replace(old,new)
oldcrest='if(pigmented){path(segment,colors[p.owner]||ink.neutral,alpha,thumb?1:1.65,false);'
newcrest='if(pigmented){path(segment,colors[p.owner]||ink.neutral,alpha*.075,thumb?2.5:4.5,false);path(segment,colors[p.owner]||ink.neutral,alpha,thumb?1:1.65,false);'
assert oldcrest in candidate
candidate=candidate.replace(oldcrest,newcrest)
captures=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/home/hoskinson/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome')
 for name,text in [('baseline',source),('round tissue + restrained crest light',candidate)]:
  page=browser.new_page(viewport={'width':1450,'height':1100},reduced_motion='reduce')
  page.route('**/gallery.js',lambda route,request,text=text:route.fulfill(status=200,content_type='application/javascript',body=text))
  page.goto(f'http://127.0.0.1:{server.server_port}/');page.wait_for_function('window.quineling?.library.length===10')
  for family in ['jelly','moth','torus']:
   data=page.evaluate('''family=>{quineling.select(quineling.library.find(p=>p.skin.family===family));quineling.clearFocus();const c=document.getElementById('creature');quineling.renderOn(c,0);return {image:c.toDataURL(),source:quineling.Q.canon(quineling.program)};}''',family)
   captures.append({'label':name,'family':family,**data})
  page.close()
 page=browser.new_page()
 sheet=page.evaluate('''async rows=>{const c=document.createElement('canvas');c.width=1500;c.height=930;const x=c.getContext('2d');x.fillStyle='#090f15';x.fillRect(0,0,c.width,c.height);x.font='20px sans-serif';x.fillStyle='#b6edcc';x.fillText('Material experiment · identical source and phase',24,32);for(let row=0;row<2;row++){x.font='16px sans-serif';x.fillStyle='#dbe9e3';x.fillText(rows[row*3].label,24,64+row*435);for(let col=0;col<3;col++){const entry=rows[row*3+col],im=new Image();im.src=entry.image;await im.decode();x.drawImage(im,col*500,75+row*435,500,400);x.font='14px monospace';x.fillStyle='#82919f';x.fillText(entry.family,col*500+24,487+row*435);}}return c.toDataURL();}''',captures)
 (ROOT/'research/final-qdl-graphics-material-contact-sheet.png').write_bytes(base64.b64decode(sheet.split(',')[1]))
 report={'experiment':'round tissue marks and low-alpha crest underlight','sourceUnchanged':all(captures[i]['source']==captures[i+3]['source'] for i in range(3)),'phase':0,'families':['jelly','moth','torus'],'productionEdited':False,'timing':'Not benchmarked; per-point arcs deliberately a visual experiment only.'}
 (ROOT/'research/final-qdl-graphics-experiment.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report));browser.close()
server.shutdown();server.server_close()
