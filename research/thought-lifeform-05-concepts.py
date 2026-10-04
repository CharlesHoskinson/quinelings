import math
from pathlib import Path
W,H=960,650
out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">','<rect width="100%" height="100%" fill="#080f14"/>','<style>.g{fill:none;stroke-width:.65;stroke-linecap:round}.title{fill:#d8e5e8;font:16px sans-serif}.note{fill:#8fa6b0;font:11px sans-serif}</style>','<text x="25" y="30" class="title">NEW QUINELINGS · proposed anatomical studies</text>','<text x="25" y="48" class="note">Design concepts, not runtime frames. Color suggests roles; it does not show measured outputs.</text>']
names=[('Crownweft','independent sources → consensus'),('Spindlewake','dependencies → parallel schedule'),('Needleglider','street graph → bounded route'),('Rootvault','requests → bounded grants'),('Concord-shell','provenance → evidence ledger'),('Archivane','named values → report')]
colors=['#edc653','#639bfa','#639bfa','#35d6c3','#edc653','#8ccc76']
def path(points,color,opacity=.4,width=.65):
 return '<path d="'+' '.join(('M' if i==0 else 'L')+f'{x:.2f},{y:.2f}' for i,(x,y) in enumerate(points))+f'" class="g" stroke="{color}" opacity="{opacity}" style="stroke-width:{width}"/>'
for idx,(name,desc) in enumerate(names):
 ox=160+320*(idx%3);oy=180+285*(idx//3);c=colors[idx]
 out.append(f'<g transform="translate({ox},{oy})">')
 for k in range(24):
  a=2*math.pi*k/24;pts=[]
  for i in range(101):
   u=i/100;e=math.sin(math.pi*u)
   if idx==0:
    y=-80+145*u;x=(11+59*e*(1-u)) * math.cos(a+.8*u)+7*math.sin(2*math.pi*u)*e
   elif idx==1:
    y=-80+150*u;x=(10+28*e)*math.cos(a+4.2*u)+12*math.sin(3*math.pi*u)*e
   elif idx==2:
    x=-95+185*u;y=-35+55*u+(8+24*e*(1-u))*math.cos(a+2*u)+9*math.sin(math.pi*u)
   elif idx==3:
    angle=-2.7+2.3*(k//4)/5;reach=110*u
    x=reach*math.cos(angle)+8*math.sin(a)*e;y=65+reach*math.sin(angle)+9*math.cos(a)*e
   elif idx==4:
    side=-1 if k<12 else 1;f=(k%12)/11
    x=side*(65*e*(.68+.32*f));y=65-125*u+9*e*math.sin(a+u*3)
   else:
    y=-72+145*u;x=(15+24*e)*math.cos(a+.5*u)+9*math.sin(4*math.pi*u)*e
   pts.append((x,y))
  out.append(path(pts,c,.22 if k%6 else .72, .65 if k%6 else 1.05))
 # Coherent bright root/spine; all hypothetical tissue joins this mass.
 if idx in (0,1,5):out.append(path([(4*math.sin(math.pi*i/100),-75+145*i/100) for i in range(101)],'#dfe9e5',.62,.8))
 if idx==3:out.append(path([(0,65),(0,40),(-4,17)],'#dfe9e5',.65,1.2))
 if idx==4:out.append(path([(0,65),(0,35),(0,12)],'#dfe9e5',.65,1.1))
 out.append('</g>')
 out.append(f'<text x="{ox-130}" y="{oy+105}" class="title">{name}</text><text x="{ox-130}" y="{oy+124}" class="note">{desc}</text>')
out.append('</svg>')
Path('research/thought-lifeform-05-concepts.svg').write_text('\n'.join(out)+'\n')
