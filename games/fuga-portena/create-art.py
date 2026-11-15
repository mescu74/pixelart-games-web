from PIL import Image,ImageDraw
from pathlib import Path
import random
R=Path(__file__).parent/'assets'
for name in ['moto','patrol','money','coin','obelisk','mate']:
 size=(32,40) if name=='obelisk' else (24,32) if name in ['moto','patrol'] else (16,20)
 frames=[]
 for f in range(4):
  im=Image.new('RGBA',size);d=ImageDraw.Draw(im)
  if name=='moto':
   d.rectangle((9,1,14,6),fill='#101d2c');d.rectangle((9,25,14,30),fill='#101d2c');d.rectangle((8,7,15,24),fill='#ce9454');d.rectangle((9,9,14,19),fill='#aee3d2');d.rectangle((4,7,19,9),fill='#d7d8be');d.rectangle((5,11,7,22),fill='#26465a');d.rectangle((16,11,18,22),fill='#26465a');d.ellipse((7,10,16,20),fill='#ed735e');d.ellipse((8,6,15,13),fill='#172c40');d.rectangle((9,7,14,9),fill='#a0dbe3');d.rectangle((10,26,13,27),fill='#ff795e');d.point((10+f%2,3),fill='#a4b5ad')
  elif name=='patrol':
   d.rounded_rectangle((3,1,20,30),radius=3,fill='#101c2d');d.rectangle((4,3,19,28),fill='#d6dfd4');d.rectangle((4,6,19,11),fill='#254a60');d.rectangle((4,21,19,25),fill='#254a60');d.rectangle((5,13,18,19),fill='#34465a');d.rectangle((6,14,11,16),fill='#f96c78' if f%2==0 else '#773e64');d.rectangle((12,14,17,16),fill='#6cdfee' if f%2 else '#335b88');d.rectangle((5,2,8,3),fill='#ffe2a1');d.rectangle((15,2,18,3),fill='#ffe2a1');d.rectangle((5,27,7,28),fill='#e67f67');d.rectangle((16,27,18,28),fill='#e67f67')
  elif name=='money':
   d.polygon([(5,2),(12,2),(10,6),(14,11),(14,17),(10,19),(3,18),(1,14),(3,9),(6,6)],fill='#192a35');d.polygon([(6,3),(11,3),(9,6),(12,11),(12,16),(9,17),(4,16),(3,12),(6,8)],fill='#b3d78c');d.rectangle((5,6,10,7),fill='#55856b');d.line((8,9,8,15),fill='#385c55');d.line((6,10,10,10),fill='#385c55');d.line((6,14,10,14),fill='#385c55')
  elif name=='coin':
   d.rectangle((4,6,11,13),fill='#c59956');d.rectangle((5,7,10,12),fill='#ffdd85');d.rectangle((7,8,8,11),fill='#fff5c6')
  elif name=='obelisk':
   d.polygon([(11,38),(30,35),(22,30),(15,31)],fill='#142b38');d.polygon([(11,8),(16,1),(21,8),(23,34),(9,34)],fill='#a2bcb5');d.polygon([(16,1),(21,8),(23,34),(16,34)],fill='#6c8f90');d.line((12,9,11,32),fill='#edf4d7',width=2);d.rectangle((13,28,15,33),fill='#314c58');d.rectangle((13,16,14,18),fill='#7d9a97')
  else:
   d.rectangle((10,0,11,8),fill='#d7e9e1');d.line((10,1,14,1),fill='#d7e9e1');d.polygon([(2,8),(12,8),(14,12),(11,18),(4,18),(1,13)],fill='#d99655');d.rectangle((4,9,10,10),fill='#788957');d.rectangle((5,12,7,15),fill='#f3cd82')
  frames.append(im)
 im=Image.new('RGBA',(size[0]*4,size[1]))
 for i,f in enumerate(frames):im.paste(f,(i*size[0],0))
 im.save(R/(name+'-sheet.png'));frames[0].save(R/(name+'.png'))
# A playable-world cover with an original bitmap title, no copied characters.
im=Image.open(R/'city.png').convert('RGB').resize((495,425),Image.Resampling.NEAREST).crop((0,40,495,320));d=ImageDraw.Draw(im)
d.rectangle((0,0,495,280),fill='#101e2a')
for y in [170,235]:d.rectangle((0,y,495,y+28),fill='#334b56');d.line((0,y+14,495,y+14),fill='#af9f6b',width=1)
for x in [190,330]:d.rectangle((x,0,x+30,280),fill='#334b56')
for x,y,name,scale in [(185,100,'obelisk',3),(305,184,'moto',2),(90,168,'patrol',2),(390,225,'patrol',2),(260,220,'money',2)]:
 a=Image.open(R/(name+'.png'));a=a.resize((a.width*scale,a.height*scale),Image.Resampling.NEAREST);im.paste(a,(x,y),a)
FONT={'F':['11111','10000','10000','11110','10000','10000','10000'],'U':['10001','10001','10001','10001','10001','10001','01110'],'G':['01111','10000','10000','10111','10001','10001','01110'],'A':['01110','10001','10001','11111','10001','10001','10001'],'P':['11110','10001','10001','11110','10000','10000','10000'],'O':['01110','10001','10001','10001','10001','10001','01110'],'R':['11110','10001','10001','11110','10100','10010','10001'],'T':['11111','00100','00100','00100','00100','00100','00100'],'E':['11111','10000','10000','11110','10000','10000','11111'],'Ñ':['01010','11111','10001','11001','10101','10011','10001']}
def text(word,y,sz,col):
 x=23
 for ch in word:
  for yy,row in enumerate(FONT[ch]):
   for xx,b in enumerate(row):
    if b=='1':d.rectangle((x+xx*sz,y+yy*sz,x+(xx+1)*sz-1,y+(yy+1)*sz-1),fill=col)
  x+=6*sz
text('FUGA',22,7,'#e5ead8');text('PORTEÑA',83,4,'#badb90')
im.resize((1485,840),Image.Resampling.NEAREST).save(R/'cover.png')
print('Original city, moto, patrols, money, mates and cover ready')
