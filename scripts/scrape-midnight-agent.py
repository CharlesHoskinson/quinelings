"""Retrieve public Midnight.city agent artwork with Scrapling and provenance."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json
from scrapling.fetchers import Fetcher
ROOT=Path(__file__).resolve().parents[1]
page=Fetcher.get('https://midnight.city/',timeout=30)
if page.status!=200: raise RuntimeError(f'Homepage HTTP {page.status}')
scripts=page.css('script::attr(src)').getall()
records=[]
for name in ['activity-character-diamond.png','activity-character-armor.png']:
    url='https://midnight.city/home/'+name
    response=Fetcher.get(url,timeout=30)
    data=bytes(response.body)
    if response.status!=200 or not data.startswith(b'\x89PNG\r\n\x1a\n'): raise RuntimeError(f'Invalid PNG: {url}')
    path=ROOT/'assets/midnight'/name;path.write_bytes(data)
    records.append({'url':url,'path':str(path.relative_to(ROOT)),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'fetcher':'Scrapling Fetcher 0.4.15'})
provenance={'source':'https://midnight.city/','retrievedAt':datetime.now(timezone.utc).isoformat(),'homepageStatus':page.status,'pageScripts':scripts,'assets':records,'use':'Public agent artwork used in a local illustrative thought-to-program demo; no live agent identity or hidden thought is claimed.'}
(ROOT/'assets/midnight/provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(json.dumps(provenance,indent=2))
