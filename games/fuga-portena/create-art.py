from PIL import Image,ImageDraw
from pathlib import Path
import random
R=Path(__file__).parent/'assets'
for name in ['moto','patrol','money','coin','obelisk','mate']:
 size=(32,40) if name=='obelisk' else (48,64) if name in ['moto','patrol'] else (16,20)
 frames=[]
 for f in range(8 if name in ['moto','patrol'] else 4):
  im=Image.new('RGBA',size);d=ImageDraw.Draw(im)
  if name=='moto':
   # Eight frames: tire tread, fork suspension, jacket folds, visor glints.
   bounce=[0,0,1,1,0,0,-1,-1][f];ink='#122333'
   d.rounded_rectangle((19,2,28,14),radius=3,fill=ink);d.rounded_rectangle((18,47,29,62),radius=3,fill=ink)
   for y in [5+f%3,10+f%3,50+f%3,55+f%3]:d.line((21,y,26,y),fill='#71868b')
   d.rectangle((21,13,26,51),fill='#8fa6ab');d.polygon([(18,17),(29,17),(32,38),(28,51),(19,51),(15,38)],fill='#1e3b4c')
   d.polygon([(20,16),(27,16),(29,29),(25,35),(19,29)],fill='#b4e2d6');d.line((21,17,20,28),fill='#f2eed6',width=2)
   d.rectangle((19,39,28,46),fill='#142939');d.line((20,40,27,40),fill='#6f8d92')
   for x in [14,30]:
    d.rectangle((x,34,x+3,48),fill='#2e4c5f');d.line((x,36,x+2,44),fill='#7a9599');d.rectangle((x,47,x+3,49),fill='#101f2b')
   d.rectangle((9,15+bounce,37,17+bounce),fill='#abc3bf');d.rectangle((8,15+bounce,12,19+bounce),fill=ink);d.rectangle((34,15+bounce,38,19+bounce),fill=ink)
   d.polygon([(17,22+bounce),(29,22+bounce),(33,32+bounce),(28,39+bounce),(18,39+bounce),(13,32+bounce)],fill='#d96e59')
   d.line((18,24+bounce,16,32+bounce),fill='#ffb68a',width=2);d.line((28,25+bounce,30,33+bounce),fill='#944d51',width=2);d.rectangle((21,28+bounce,25,35+bounce),fill='#b95c51')
   d.ellipse((17,11+bounce,30,26+bounce),fill=ink);d.polygon([(19,13+bounce),(26,12+bounce),(29,16+bounce),(18,19+bounce)],fill='#7bbdc9')
   d.line((19+f%3,14+bounce,23+f%3,14+bounce),fill='#e6f2dd');d.rectangle((19,23+bounce,28,25+bounce),fill='#394b64')
   d.rectangle((20,49,27,51),fill='#ee775a');d.rectangle((21,50,26,51),fill='#ffb17a');d.rectangle((20,55,27,57),fill='#d5dcc5');d.point((22,56),fill=ink)
   d.rectangle((20,10,27,12),fill='#ffe8b1');d.rectangle((30,43,32,54),fill='#c1cbc2');d.rectangle((31,52,32,55),fill='#384e5d')
  elif name=='patrol':
   # Armor, mirrors, radiator, windshield reflections and alternating strobes.
   d.rounded_rectangle((7,1,40,62),radius=6,fill='#101e2c')
   for x in [5,39]:
    d.rectangle((x,12,x+3,22),fill='#0a1722');d.rectangle((x,43,x+3,53),fill='#0a1722')
   d.rounded_rectangle((9,3,38,59),radius=4,fill='#b5c9c8');d.rectangle((11,6,36,55),fill='#dae1ce')
   d.polygon([(13,17),(34,17),(37,28),(10,28)],fill='#183748');d.line((14,19,32,19),fill='#709ca7',width=2);d.line((15,21,23,25),fill='#a1cac7')
   d.polygon([(12,43),(35,43),(33,51),(14,51)],fill='#244756');d.line((15,45,31,45),fill='#6a929c')
   d.rectangle((13,29,34,41),fill='#304d63');d.line((14,30,33,30),fill='#6b8f9f');d.rectangle((19,36,28,39),fill='#b8cfbf')
   d.rectangle((10,31,36,34),fill='#0c2135');d.rectangle((12,31,22,33),fill='#ff8991' if f%4<2 else '#6d3b57');d.rectangle((25,31,34,33),fill='#84edff' if f%4>=2 else '#365774')
   for x in [11,33]:
    d.rectangle((x,7,x+3,10),fill='#ffedb5');d.rectangle((x,54,x+3,56),fill='#eb7169');d.line((x,35,x,42),fill='#718f99')
   d.line((16,9,16,14),fill='#91a8a8');d.line((31,9,31,14),fill='#91a8a8');d.rectangle((19,4,28,5),fill='#2c475b')
   for x in range(18,30,3):d.line((x,57,x,59),fill='#48616b')
   d.rectangle((6,24,9,27),fill='#8faeb5');d.rectangle((38,24,41,27),fill='#8faeb5');d.line((22,41,26,41),fill='#f3eed8')
  elif name=='money':
   d.polygon([(5,2),(12,2),(10,6),(14,11),(14,17),(10,19),(3,18),(1,14),(3,9),(6,6)],fill='#192a35');d.polygon([(6,3),(11,3),(9,6),(12,11),(12,16),(9,17),(4,16),(3,12),(6,8)],fill='#b3d78c');d.rectangle((5,6,10,7),fill='#55856b');d.line((8,9,8,15),fill='#385c55');d.line((6,10,10,10),fill='#385c55');d.line((6,14,10,14),fill='#385c55')
  elif name=='coin':
   d.rectangle((4,6,11,13),fill='#c59956');d.rectangle((5,7,10,12),fill='#ffdd85');d.rectangle((7,8,8,11),fill='#fff5c6')
  elif name=='obelisk':
   d.polygon([(11,38),(30,35),(22,30),(15,31)],fill='#142b38');d.polygon([(11,8),(16,1),(21,8),(23,34),(9,34)],fill='#a2bcb5');d.polygon([(16,1),(21,8),(23,34),(16,34)],fill='#6c8f90');d.line((12,9,11,32),fill='#edf4d7',width=2);d.rectangle((13,28,15,33),fill='#314c58');d.rectangle((13,16,14,18),fill='#7d9a97')
  else:
   d.rectangle((10,0,11,8),fill='#d7e9e1');d.line((10,1,14,1),fill='#d7e9e1');d.polygon([(2,8),(12,8),(14,12),(11,18),(4,18),(1,13)],fill='#d99655');d.rectangle((4,9,10,10),fill='#788957');d.rectangle((5,12,7,15),fill='#f3cd82')
  frames.append(im)
 im=Image.new('RGBA',(size[0]*len(frames),size[1]))
 for i,f in enumerate(frames):im.paste(f,(i*size[0],0))
 im.save(R/(name+'-sheet.png'));frames[0].save(R/(name+'.png'))
# A playable-world cover with an original bitmap title, no copied characters.
im=Image.open(R/'city.png').convert('RGB').resize((495,425),Image.Resampling.NEAREST).crop((0,40,495,320));d=ImageDraw.Draw(im)
d.rectangle((0,0,495,280),fill='#101e2a')
for y in [170,235]:d.rectangle((0,y,495,y+28),fill='#334b56');d.line((0,y+14,495,y+14),fill='#af9f6b',width=1)
for x in [190,330]:d.rectangle((x,0,x+30,280),fill='#334b56')
for x,y,name,scale in [(185,100,'obelisk',3),(305,184,'moto',2),(90,168,'patrol',2),(390,225,'patrol',2),(260,220,'money',2)]:
 a=Image.open(R/(name+'.png'));a=a.resize((24,32),Image.Resampling.NEAREST) if name in ['moto','patrol'] else a;a=a.resize((a.width*scale,a.height*scale),Image.Resampling.NEAREST);im.paste(a,(x,y),a)
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
