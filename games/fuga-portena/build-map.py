import json,math,random
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).parent
source=json.loads((ROOT.parent.parent/'map-data.json').read_text())
# Preserve OSM geometry. Retain only complete segments within this bounded arena.
bounds=(3190,3240,3990,3915);scale=1.15
nodes=[];edges=[];lookup={}
def node(x,y):
 k=(round(x),round(y))
 if k not in lookup:lookup[k]=len(nodes);nodes.append({'x':round((x-bounds[0])*scale+35,2),'y':round((y-bounds[1])*scale+35,2),'links':[]})
 return lookup[k]
fix={'Tucum�n':'Tucumán','Teniente General Juan Domingo Per�n':'Perón','Avenida Presidente Roque S�enz Pe�a':'Diagonal Norte'}
for road in source['streets']:
 pts=road['points']
 if not all(bounds[0]<=x<=bounds[2] and bounds[1]<=y<=bounds[3] for x,y in pts):continue
 name=fix.get(road['name'],road['name']).replace('Avenida Presidente Roque Sáenz Peña','Diagonal Norte')
 for a,b in zip(pts,pts[1:]):
  length=math.dist(a,b);count=max(1,math.ceil(length*scale/23));prev=node(*a)
  for i in range(1,count+1):
   nxt=node(a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count)
   if nxt!=prev and nxt not in [v['to'] for v in nodes[prev]['links']]:
    nodes[prev]['links'].append({'to':nxt,'name':name});nodes[nxt]['links'].append({'to':prev,'name':name});edges.append([prev,nxt,name])
   prev=nxt
# Retain the largest connected component so every pickup is reachable.
seen=set();components=[]
for i in range(len(nodes)):
 if i in seen:continue
 q=[i];comp=set(q);seen.add(i)
 for n in q:
  for l in nodes[n]['links']:
   if l['to'] not in seen:seen.add(l['to']);comp.add(l['to']);q.append(l['to'])
 components.append(comp)
keep=max(components,key=len);ids={old:i for i,old in enumerate(sorted(keep))}
nodes=[{'x':nodes[old]['x'],'y':nodes[old]['y'],'links':[{'to':ids[l['to']],'name':l['name']} for l in nodes[old]['links']]} for old in sorted(keep)]
edges=[[ids[a],ids[b],n] for a,b,n in edges if a in keep and b in keep]
W,H=990,850;obelisk=[round((3600-bounds[0])*scale+35),round((3600-bounds[1])*scale+35)]
mapdata={'width':W,'height':H,'nodes':nodes,'edges':edges,'obelisk':obelisk,'source':source['source'],'attribution':source['attribution'],'bounds':bounds,'scale':scale,'note':'Geometría real OSM 2018; doble sentido arcade y edificios ilustrados, sin tráfico ni sentidos actuales.'}
(ROOT/'map.json').write_text(json.dumps(mapdata,ensure_ascii=False,separators=(',',':')))
# Pixel-drawn buildings occupy only space outside the actual road geometry.
S=2;im=Image.new('RGB',(W//S,H//S),'#111c24');d=ImageDraw.Draw(im);mask=Image.new('L',im.size);md=ImageDraw.Draw(mask)
for a,b,n in edges:md.line([(nodes[a]['x']/S,nodes[a]['y']/S),(nodes[b]['x']/S,nodes[b]['y']/S)],fill=255,width=18 if '9 de Julio' in n else 14)
x,y=obelisk;md.rectangle((x/S-20,y/S-22,x/S+20,y/S+22),fill=255)
rng=random.Random(441)
for yy in range(12,H//S-24,18):
 for xx in range(12,W//S-24,20):
  box=(xx,yy,xx+17,yy+15)
  if mask.crop(box).getbbox():continue
  roof=rng.choice(['#384950','#40515b','#454653','#3b4257','#4b4949']);d.rectangle((xx+2,yy+3,xx+19,yy+17),fill='#080f19');d.rectangle(box,fill='#202d39');d.rectangle((xx+1,yy+1,xx+16,yy+12),fill=roof);d.line((xx+1,yy+1,xx+16,yy+1),fill='#6c7371')
  for wx in range(xx+3,xx+15,4):d.rectangle((wx,yy+13,wx+1,yy+14),fill=rng.choice(['#b99b5f','#47737a','#283d4c']))
  d.rectangle((xx+4,yy+4,xx+8,yy+7),fill='#283641');d.point((xx+5,yy+4),fill='#778887')
for a,b,n in edges:
 pts=[(nodes[a]['x']/S,nodes[a]['y']/S),(nodes[b]['x']/S,nodes[b]['y']/S)]
 d.line(pts,fill='#5a6564',width=16 if '9 de Julio' in n else 13);d.line(pts,fill='#263641',width=13 if '9 de Julio' in n else 10)
 # Tiny road markings, aligned to actual segment direction.
 ax,ay=pts[0];bx,by=pts[1]
 if math.dist(pts[0],pts[1])>7:d.line((ax*.65+bx*.35,ay*.65+by*.35,ax*.35+bx*.65,ay*.35+by*.65),fill='#777452',width=1)
x,y=obelisk;x/=2;y/=2
d.ellipse((x-20,y-24,x+20,y+24),fill='#1b3f3b');d.ellipse((x-14,y-18,x+14,y+18),fill='#35625a');d.rectangle((x-5,y-9,x+6,y+8),fill='#678078')
im.resize((W,H),Image.Resampling.NEAREST).save(ROOT/'assets/city.png')
print(f'{len(nodes)} connected nodes, {len(edges)} real road edges; {len(components)} components reconciled')
