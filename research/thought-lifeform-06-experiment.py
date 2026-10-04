"""Independent random-access motion math; no production runtime edits."""
from pathlib import Path
import importlib.util,json,math
ROOT=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('assembly_demo',ROOT/'thought-lifeform-03-demo.py')
assembly=importlib.util.module_from_spec(spec);spec.loader.exec_module(assembly)
TEMPLATES={
 'gather':[(0,0,0),(-.06,-.03,-.06),(.09,.04,.08),(0,0,0),(0,0,0)],
 'unfurl':[(0,0,0),(-.03,.02,-.07),(.06,-.02,.10),(0,0,0),(0,0,0)],
 'glide':[(0,0,0),(-.025,-.06,-.03),(.04,.08,.05),(0,0,0),(0,0,0)],
 'hover':[(0,0,0),(-.025,.02,-.02),(.025,-.02,.02),(0,0,0),(0,0,0)]}
def score(c,kind,strength,ticks):
 assert kind in TEMPLATES and 0<=strength<=1 and all(isinstance(v,int) and v>=100 for v in ticks) and sum(ticks)==1000
 x=(c%1)*1000;start=0
 for i,duration in enumerate(ticks):
  if x<start+duration:
   z=(x-start)/duration;h=6*z**5-15*z**4+10*z**3;a,b=TEMPLATES[kind][i:i+2]
   return [strength*((1-h)*p+h*q) for p,q in zip(a,b)]
  start+=duration
 raise AssertionError('unreachable')
def matmul(a,b):return [[sum(a[i][k]*b[k][j] for k in range(3)) for j in range(3)] for i in range(3)]
def apply(a,p):return [sum(a[i][j]*p[j] for j in range(3)) for i in range(3)]
def rotation(a):return [[math.cos(a),-math.sin(a),0],[math.sin(a),math.cos(a),0],[0,0,1]]
def determinant(a):
 return a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0])
stats={'maxSocketError':0,'maxUnitDeterminantError':0,'maxFollowerGain':0,'maxOdeResidual':0,'maxScoreMagnitude':[0,0,0],'samePhaseSeek':True,'assemblies':[]}
for g in assembly.GRAPHS:
 a=assembly.compile_anatomy(g);kind={'serial':'gather','fork':'unfurl','merge':'glide'}[a['motif']];ticks=[180,180,420,220];poses=[]
 for j in range(129):
  cycle=j/128;sigma,lean,opening=score(cycle,kind,.65,ticks)
  diag=[[math.exp(-sigma/2),0,0],[0,math.exp(sigma),0],[0,0,math.exp(-sigma/2)]]
  rootmatrix=matmul(rotation(lean),diag);world={};components={c['id']:c for c in a['components']}
  for index,c in enumerate(a['components']):
   if c['parent']:
    p=c['parent'];parent=components[p['component']];pm,pt=world[parent['id']];socket=assembly.bezier(parent['control'],p['u'])+[0]
    transformed=apply(pm,socket);anchor=[transformed[i]+pt[i] for i in range(3)]
    # Small bounded hinges, inherited parent deformation. No weighted skinning.
    angle=opening*(.55 if c['kind']=='fin' else .3)*(-1 if index%2 else 1)
    matrix=matmul(pm,rotation(angle));offset=c.get('offset',[0,0])+[0]
    # Schematic offsets are treated as part of the authored parent socket.
    delta=apply(pm,offset);anchor=[anchor[i]+delta[i] for i in range(3)]
    world[c['id']]=(matrix,anchor);root=apply(matrix,[0,0,0]);actual=[root[i]+anchor[i] for i in range(3)]
    stats['maxSocketError']=max(stats['maxSocketError'],math.dist(actual,anchor))
   else:world[c['id']]=(rootmatrix,[0,0,0])
   stats['maxUnitDeterminantError']=max(stats['maxUnitDeterminantError'],abs(determinant(world[c['id']][0])-1))
  poses.append({'phase':cycle,'score':[sigma,lean,opening],'roots':{k:v[1] for k,v in world.items()}})
  for i,x in enumerate([sigma,lean,opening]):stats['maxScoreMagnitude'][i]=max(stats['maxScoreMagnitude'][i],abs(x))
 assert poses[0]['roots']==poses[-1]['roots']
 stats['assemblies'].append({'name':g['name'],'gesture':kind,'components':len(a['components']),'poses':poses})
def gain(z,r):return 1/math.sqrt((1-r*r)**2+4*z*z*r*r)
for zi in range(76):
 z=.75+zi*.01
 for ri in range(1001):stats['maxFollowerGain']=max(stats['maxFollowerGain'],gain(z,ri*.01))
zeta=.9;omega0=1/.6;modes=[(.05,1,.2),(.02,2,.4),(.01,3,.8)]
def driver(t):return sum(a*math.sin(m*t+b) for a,m,b in modes)
def response(t):
 return sum(a*gain(zeta,m/omega0)*math.sin(m*t+b-math.atan2(2*zeta*m/omega0,1-(m/omega0)**2)) for a,m,b in modes)
h=1e-4
for i in range(1000):
 t=i*math.tau/1000;y=response(t);velocity=(response(t+h)-response(t-h))/(2*h);acceleration=(response(t+h)-2*y+response(t-h))/(h*h)
 residual=acceleration+2*zeta*omega0*velocity+omega0**2*y-omega0**2*driver(t)
 stats['maxOdeResidual']=max(stats['maxOdeResidual'],abs(residual))
assert stats['maxFollowerGain']<=1+1e-12
assert stats['maxSocketError']<1e-12 and stats['maxUnitDeterminantError']<1e-12
assert stats['maxOdeResidual']<1e-6
for kind in TEMPLATES:
 assert score(.317,kind,.65,[180,180,420,220])==score(.317,kind,.65,[180,180,420,220])
 assert score(0,kind,.65,[180,180,420,220])==score(1,kind,.65,[180,180,420,220])
stats['scope']='Independent affine motion equations; not production refinement, tissue C1 or global nonintersection proof.'
(ROOT/'thought-lifeform-06-experiment.json').write_text(json.dumps(stats,indent=2)+'\n')
print(json.dumps({k:v for k,v in stats.items() if k!='assemblies'}))
