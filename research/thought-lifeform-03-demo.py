"""Finite anatomy compiler/contact sheet. No renderer or task-runtime edits."""
from pathlib import Path
import hashlib,json,math
ROOT=Path(__file__).resolve().parent
def graph(name,nodes):
 return {'name':name,'nodes':[{'id':i,'op':op,'inputs':inputs} for i,op,inputs in nodes]}
GRAPHS=[
 graph('Reserve bearer',[('stock','literal',[]),('request','literal',[]),('available','sum',['stock','request']),('bounded','clamp',['available']),('ledger','report',['bounded'])]),
 graph('Fork crown',[('source','literal',[]),('east','sum',['source']),('west','mean',['source']),('north','max',['source']),('ledger','report',['east','west','north'])]),
 graph('Confluence glider',[('first','literal',[]),('second','literal',[]),('third','literal',[]),('agreement','mean',['first','second','third']),('ledger','report',['agreement'])])]
def compile_anatomy(g):
 # These are structural fixtures, not executable task definitions: parameters
 # and operator arity validation belong to the existing runtime front end.
 levels={};out={n['id']:0 for n in g['nodes']}
 for n in g['nodes']:
  if n['id'] in levels or any(p not in levels for p in n['inputs']):raise ValueError('DAG fixture is not topological')
  levels[n['id']]=1+max([levels[p] for p in n['inputs']] or [-1])
  for p in n['inputs']:out[p]+=1
 forks=sum(max(0,n-1) for n in out.values());merges=sum(max(0,len(n['inputs'])-1) for n in g['nodes'])
 topology='fork' if forks else 'merge' if merges>=2 else 'serial'
 seed=int(hashlib.sha256(json.dumps(g,sort_keys=True).encode()).hexdigest()[:8],16)
 lean=(seed%101/100-.5)*.14
 c=[]
 def add(i,kind,parent=None,**kw):
  component={'id':i,'kind':kind,'parent':parent,'owners':[],**kw};c.append(component);return i
 if topology=='serial':
  trunk=add('trunk','spine',control=[[0,-.68],[lean,-.3],[-lean,.26],[.03,.72]],width=.035)
  add('belly','chamber',{'component':trunk,'u':.45},axes=[.20,.28])
  add('crown','chamber',{'component':trunk,'u':.08},axes=[.07,.10])
  for i in range(2):
   add('tail'+str(i),'spine',{'component':trunk,'u':.75},offset=[(i-.5)*.11,0],control=[[0,0],[(i-.5)*.24,.12],[(i-.5)*.30,.26],[(i-.5)*.44,.37]],width=.012)
 elif topology=='fork':
  trunk=add('trunk','spine',control=[[0,.69],[0,.38],[lean,.03],[0,-.15]],width=.045)
  for i in range(min(3,forks+1)):
   x=(i-1)*.44;y=-.40-(.20 if i==1 else 0)
   branch=add('branch'+str(i),'spine',{'component':trunk,'u':.60},control=[[0,0],[x*.12,-.10],[x*.75,y*.8],[x,y]],width=.022)
   add('tip'+str(i),'chamber',{'component':branch,'u':1},axes=[.075,.12])
  add('apron','fin',{'component':trunk,'u':.39},span=.26,width=.14,side=-1)
 else:
  trunk=add('trunk','spine',control=[[0,.32],[lean,.1],[lean,-.2],[0,-.42]],width=.04)
  add('core','chamber',{'component':trunk,'u':.46},axes=[.14,.22])
  add('collar','loop',{'component':trunk,'u':.42},axes=[.29,.22],tube=.018)
  for side in [-1,1]:
   add('fin'+str(side),'fin',{'component':trunk,'u':.50},span=.54 if side==1 else .45,width=.22,side=side,hinge=.12)
 # Stable node ownership partitions are graph-derived, not decorative colors.
 owners={};ordered=sorted(g['nodes'],key=lambda n:(levels[n['id']],n['id']))
 for i,n in enumerate(ordered):
  idx=min(len(c)-1,i*len(c)//len(ordered));c[idx]['owners'].append(n['id']);owners[n['id']]={'component':c[idx]['id'],'u':(levels[n['id']]+.5)/(max(levels.values())+1)}
 # Decorative repeated components inherit a real neighboring owner; no new op.
 for component in c:
  if not component['owners']:component['owners']=[ordered[0]['id']]
 assert all(sum(x['parent'] is not None and x['parent']['component']==component['id'] for x in c)<=4 for component in c)
 assert len(c)<=16 and set(owners)=={n['id'] for n in g['nodes']}
 budget=24000;base=budget//len(c)
 for i,component in enumerate(c):component['vertices']=base+(1 if i<budget%len(c) else 0)
 return {'name':g['name'],'motif':topology,'statistics':{'depth':max(levels.values()),'forkExcess':forks,'mergeExcess':merges},'components':c,'operationAnchors':owners,'surfaceVertexBudget':sum(x['vertices'] for x in c),'exactSourceIdentity':'Not supplied: fixtures illustrate compiler topology only.'}
def bezier(p,u):
 b=[(1-u)**3,3*u*(1-u)**2,3*u*u*(1-u),u**3]
 return [sum(b[i]*p[i][axis] for i in range(4)) for axis in range(2)]
def render(a,xoffset):
 parts=[];components={c['id']:c for c in a['components']};origins={}
 def origin(c):
  if c['id'] in origins:return origins[c['id']]
  if c['parent']:
   parent=components[c['parent']['component']];q=bezier(parent['control'],c['parent']['u']);o=origin(parent);p=[o[0]+q[0],o[1]+q[1]]
  else:p=[0,0]
  offset=c.get('offset',[0,0]);p=[p[0]+offset[0],p[1]+offset[1]];origins[c['id']]=p;return p
 def xy(p):return f'{xoffset+225+p[0]*235:.2f},{290+p[1]*235:.2f}'
 for c in a['components']:
  o=origin(c);kind=c['kind'];color='#d9e5df';parts.append(f'<g stroke="{color}" fill="none">')
  if kind=='spine':
   p=[[o[0]+q[0],o[1]+q[1]] for q in c['control']]
   for j in range(7):
    dx=(j-3)*c['width']*.44;ps=[[q[0]+dx,q[1]] for q in p]
    parts.append(f'<path d="M{xy(ps[0])} C{xy(ps[1])} {xy(ps[2])} {xy(ps[3])}" opacity="{.7 if j==3 else .20}" stroke-width="{1.2 if j==3 else .7}"/>')
  elif kind in ['chamber','loop']:
   ax,ay=c['axes']
   for j in range(8):
    ratio=(.35+j*.08) if kind=='chamber' else (.92+j*.023)
    px,py=xy(o).split(',');parts.append(f'<ellipse cx="{px}" cy="{py}" rx="{ax*235*ratio}" ry="{ay*235*ratio}" opacity="{.55 if j==7 else .2}" stroke-width=".8"/>')
  elif kind=='fin':
   side=c['side'];end=[o[0]+side*c['span'],o[1]+.08]
   for j in range(10):
    fraction=j/9;control=[o[0]+side*c['span']*.35,o[1]-c['width']*math.sin(math.pi*fraction)]
    parts.append(f'<path d="M{xy(o)} Q{xy(control)} {xy(end)} Q{xy([control[0],o[1]+c["width"]*.9*math.sin(math.pi*fraction)])} {xy(o)}" opacity="{.65 if j==8 else .19}" stroke-width=".8"/>')
  px,py=xy(o).split(',');parts.append(f'<circle cx="{px}" cy="{py}" r="2" fill="#b6edcc" stroke="none"/><title>{c["id"]}: owners {", ".join(c["owners"])}</title></g>')
 parts.append(f'<text x="{xoffset+28}" y="62" fill="#b6edcc" font-size="19">{a["name"]}</text><text x="{xoffset+28}" y="91" fill="#83979b" font-size="12">{a["motif"]} · {len(a["components"])} components · {a["surfaceVertexBudget"]} vertices</text>')
 return ''.join(parts)
if __name__=='__main__':
 assemblies=[compile_anatomy(g) for g in GRAPHS]
 live=ROOT/'final-qdl-generation-program.json'
 if live.exists():
  validated=json.loads(live.read_text())['graph'];generated=compile_anatomy(validated)
  (ROOT/'thought-lifeform-03-runnable-task-anatomy.json').write_text(json.dumps({'graph':validated,'anatomy':generated,'executionValidation':'See workstream 1 results; this file only compiles structural anatomy.'},indent=2)+'\n')
 (ROOT/'thought-lifeform-03-examples.json').write_text(json.dumps({'structuralFixtures':GRAPHS,'assemblies':assemblies},indent=2)+'\n')
 svg='<svg xmlns="http://www.w3.org/2000/svg" width="1350" height="580" viewBox="0 0 1350 580"><rect width="1350" height="580" fill="#090f15"/><g font-family="sans-serif">'+''.join(render(a,i*450) for i,a in enumerate(assemblies))+'<text x="28" y="555" fill="#83979b" font-size="13">Compositional anatomy schematic · source graph motifs, explicit attachment roots · not a production lifeform renderer</text></g></svg>'
 (ROOT/'thought-lifeform-03-contact-sheet.svg').write_text(svg+'\n')
 print(json.dumps([{'name':a['name'],'motif':a['motif'],'components':len(a['components']),'vertices':a['surfaceVertexBudget'],'allNodesOwned':len(a['operationAnchors'])==len(g['nodes'])} for a,g in zip(assemblies,GRAPHS)]))
