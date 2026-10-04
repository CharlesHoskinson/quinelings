from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
p=Path('research/beauty-council')
ids=['route-preview','receipt-reconciliation','water-total','confirmed-checkpoints','craft-quote','evidence-ledger','work-schedule','trade-preview','needs-triage','gather-readiness']
canvas=Image.new('RGB',(960,1280),'#0d131b');d=ImageDraw.Draw(canvas)
for i,(name,file) in enumerate([('Original artwork',p/'original-02.png'),('Reference reconstruction',p/'reference-reconstruction-0.png')]+[(id,p/(id+'-0.png')) for id in ids]):
 x=(i%3)*320;y=(i//3)*320
 im=ImageOps.contain(Image.open(file).convert('RGB'),(306,282));canvas.paste(im,(x+(320-im.width)//2,y+22+(282-im.height)//2));d.text((x+8,y+4),name,fill='#edf2e9')
canvas.save(p/'comparison.jpg',quality=67)
film=Image.new('RGB',(960,840),'#0d131b');d=ImageDraw.Draw(film)
for row,(label,files) in enumerate([('Original video / sampled every two seconds',list(p.glob('original-*.png'))),('Water / phase 0,25,50,75%', [p/f'water-total-{n}.png' for n in [0,25,50,75]]),('Checkpoint / phase 0,25,50,75%', [p/f'confirmed-checkpoints-{n}.png' for n in [0,25,50,75]])]):
 d.text((8,row*280+5),label,fill='#edf2e9')
 for col,f in enumerate(sorted(files) if row==0 else files):
  im=ImageOps.contain(Image.open(f).convert('RGB'),(230,250));film.paste(im,(col*240+(240-im.width)//2,row*280+23+(250-im.height)//2))
film.save(p/'motion-comparison.jpg',quality=67)
print('comparison bytes', (p/'comparison.jpg').stat().st_size,'motion bytes',(p/'motion-comparison.jpg').stat().st_size)

from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
p=Path('research/beauty-council');ids=['lanternkeeper','wayfinder','dewcounter','pulsekeeper','threadsorter','seedbank','votecoral','tideledger','embermoth','tidemender']
files=sorted(p.glob('gallery-*-0.png'))
canvas=Image.new('RGB',(960,1280),'#0d131b');d=ImageDraw.Draw(canvas)
for i,file in enumerate(files):
 x=(i%3)*320;y=(i//3)*320;im=ImageOps.contain(Image.open(file).convert('RGB'),(306,282));canvas.paste(im,(x+(320-im.width)//2,y+22+(282-im.height)//2));d.text((x+8,y+4),file.stem.removeprefix('gallery-').removesuffix('-0'),fill='#edf2e9')
canvas.save(p/'gallery-comparison.jpg',quality=65)
files=[p/'original-02.png',p/'reference-reconstruction-0.png']+[p/f'{id}-0.png' for id in ['route-preview','receipt-reconciliation','water-total','confirmed-checkpoints','craft-quote','evidence-ledger','work-schedule','trade-preview','needs-triage','gather-readiness']]+files
atlas=Image.new('RGB',(896,1344),'#0d131b');d=ImageDraw.Draw(atlas)
for i,f in enumerate(files):
 x=(i%4)*224;y=(i//4)*224;im=ImageOps.contain(Image.open(f).convert('RGB'),(216,198));atlas.paste(im,(x+(224-im.width)//2,y+22+(198-im.height)//2));d.text((x+3,y+4),f.stem[:28],fill='#edf2e9')
atlas.save(p/'council-atlas.jpg',quality=50)
Image.open(p/'motion-comparison.jpg').save(p/'council-motion.jpg',quality=45)
print('native image bytes',(p/'council-atlas.jpg').stat().st_size+(p/'council-motion.jpg').stat().st_size)
