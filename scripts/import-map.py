"""Extract a 3.2 km radius of OSM street geometry from the source archive.
Usage: python3 scripts/import-map.py /path/to/callejero.zip
The source is an OSM snapshot (2018), not a live traffic map.
"""
import json,math,struct,sys,zipfile
from pathlib import Path
z=zipfile.ZipFile(sys.argv[1]);s=z.read('callejero.shp');selected={};p=100;idx=0
while p<len(s):
 _,size=struct.unpack_from('>2i',s,p);p+=8;end=p+size*2
 if struct.unpack_from('<i',s,p)[0]==3:
  xmin,ymin,xmax,ymax=struct.unpack_from('<4d',s,p+4)
  if xmax>-58.419 and xmin<-58.344 and ymax>-34.633 and ymin<-34.574:
   nparts,npts=struct.unpack_from('<2i',s,p+36);off=p+44+4*nparts
   pts=[struct.unpack_from('<2d',s,off+16*j) for j in range(npts)]
   if any(math.hypot((x+58.3815704)*91660,(y+34.6037389)*111320)<3220 for x,y in pts):selected[idx]=pts
 p=end;idx+=1
f=z.open('callejero.dbf');h=f.read(32);n,hl,rl=struct.unpack_from('<IHH',h,4);fh=f.read(hl-32);fields=[];off=1
for i in range(0,len(fh)-1,32):
 name=fh[i:i+11].split(b'\0')[0].decode();length=fh[i+16];fields.append((name,off,length));off+=length
rows=[];seen=set()
for i in range(n):
 b=f.read(rl)
 if i not in selected:continue
 d={name:b[o:o+l].decode('utf-8','replace').strip() for name,o,l in fields}
 if any(h in d['highway'] for h in ['footway','path','steps','service','motorway','cycleway','construction','proposed']):continue
 pts=[[round(3600+(x+58.3815704)*91660*1.05,1),round(3600-(y+34.6037389)*111320*1.05,1)] for x,y in selected[i]]
 key=str(sorted((pts[0],pts[-1])))
 if key in seen:continue
 seen.add(key);name=d['name'];name=name if name and name!='None' else 'Pasaje'
 if name.startswith('['):name=name.split("'")[1] if "'" in name else 'Pasaje'
 rows.append({'name':name,'kind':d['highway'],'points':pts})
out={'source':'OpenStreetMap contributors / alephcero/bsas_urban_area_streets, snapshot 2018-06','attribution':'© OpenStreetMap contributors, ODbL 1.0','center':[3600,3600],'size':7200,'radiusMeters':3100,'streets':rows}
Path(__file__).resolve().parents[1].joinpath('map-data.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')))
print(f'{len(rows)} street segments extracted; {sum(len(r["points"]) for r in rows)} vertices')
