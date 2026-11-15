"""Original Pixel Sur Arcade art. Integer pixels, no borrowed sprites."""
from PIL import Image, ImageDraw
from pathlib import Path
import random
ROOT=Path(__file__).parent
OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
P={'ink':'#10172f','steel':'#566b94','light':'#d9f5fa','white':'#ffffff','cyan':'#67e8ec','blue':'#2595c7','gold':'#ffd478','orange':'#fb8856','red':'#ec5272','purple':'#ab77ef','dark':'#30234f','green':'#b3eb82'}
def ship(name,size,kind):
 frames=[]
 for frame in range(6):
  im=Image.new('RGBA',(size,size));d=ImageDraw.Draw(im);c=size//2
  def poly(points,color):d.polygon(points,fill=color)
  def rect(box,color):d.rectangle(box,fill=color)
  def line(points,color,width=1):d.line(points,fill=color,width=width)
  pulse=['#81b8bf','#99dae1','#dffff1','#ffffff','#dffff1','#99dae1'][frame]
  if kind=='player':
   poly([(24,1),(30,13),(31,23),(42,29),(46,40),(34,39),(29,35),(28,44),(19,44),(18,35),(13,39),(1,40),(5,29),(16,23),(17,13)],'#10172f')
   for sign in [-1,1]:
    poly([(c+sign*7,22),(c+sign*17,29),(c+sign*20,37),(c+sign*11,35),(c+sign*6,29)],'#2c668b')
    line([(c+sign*8,23),(c+sign*16,29),(c+sign*18,33)],'#8de6ee',2)
    rect((c+sign*12-1,31,c+sign*12+1,35),'#ffca78')
    rect((c+sign*8-1,36,c+sign*8+1,41),'#71869f')
    for y in range(28,35,3):rect((c+sign*6-1,y,c+sign*6+1,y),'#101b33')
   poly([(24,3),(27,14),(29,30),(25,39),(21,39),(19,30),(21,14)],'#95acbc')
   poly([(24,4),(25,16),(25,35),(23,37),(22,25)],'#e9f6e9')
   poly([(23,12),(26,16),(26,23),(21,23),(21,17)],'#132b4e')
   rect((23,16,24,21),pulse);rect((22,25,26,26),'#526783');rect((22,30,26,32),'#364e72')
   for y in [34,37]:line([(21,y),(26,y)],'#e0e6dc')
   for x in [18,28]:rect((x,40,x+2,44),'#152640');rect((x,42,x+2,44),pulse)
  elif isinstance(kind,str):
   tone={'scout':'#8a5fbb','manta':'#398b9d','tank':'#b46b48'}[kind]
   light={'scout':'#d7a5ed','manta':'#89e6de','tank':'#ffce87'}[kind]
   wing=frame%3-1
   if kind=='scout':
    poly([(24,9),(32,14),(40,3+wing),(46,16),(42,33),(32,29),(24,43),(16,29),(6,33),(2,16),(8,3+wing),(16,14)],'#11192f')
    for sign in [-1,1]:
     poly([(c+sign*8,16),(c+sign*15,7+wing),(c+sign*19,17),(c+sign*16,28),(c+sign*9,25)],tone)
     line([(c+sign*13,13+wing),(c+sign*16,18),(c+sign*14,24)],light,2)
    poly([(24,13),(30,20),(27,32),(24,39),(21,32),(18,20)],'#cb567d')
   elif kind=='manta':
    poly([(24,6),(32,17),(46,10+wing),(44,32),(33,39),(24,32),(15,39),(4,32),(2,10+wing),(16,17)],'#101b31')
    for sign in [-1,1]:
     poly([(c+sign*4,17),(c+sign*18,15+wing),(c+sign*16,29),(c+sign*9,34),(c+sign*5,27)],tone)
     line([(c+sign*8,20),(c+sign*15,18+wing),(c+sign*14,24)],light,2)
    poly([(24,9),(30,21),(27,31),(21,31),(18,21)],'#6bb9bc')
   else:
    poly([(10,5),(37,5),(45,18),(40,41),(29,41),(26,34),(21,34),(18,41),(7,41),(3,18)],'#111a31')
    rect((12,7,35,28),'#71859c')
    for x in [7,34]:
     rect((x,16,x+6,37),tone);rect((x+1,17,x+2,31),light)
     for y in range(20,33,4):rect((x+3,y,x+5,y+1),'#29334c')
    rect((15,10,32,25),'#334862');rect((18,28,29,31),'#d8e6df')
   rect((20,18,27,25),'#18263f');rect((22,19,25,23),pulse)
   line([(22,27),(25,27)],light)
   for x in [17,29]:rect((x,12,x+1,13),light)
  else:
   # Distinct silhouettes: armored carrier, six articulated limbs, radial fortress.
   tone=['#79679f','#347b99','#a77848'][kind];light=['#c5abe9','#84d7dd','#ffd49a'][kind]
   if kind==0:
    poly([(6,15),(21,5),(35,23),(40,9),(55,9),(61,23),(75,5),(90,15),(94,60),(80,79),(65,67),(58,88),(37,88),(30,67),(15,79),(2,60)],'#10182b')
    for sign in [-1,1]:
     poly([(c+sign*17,29),(c+sign*28,11),(c+sign*39,19),(c+sign*42,57),(c+sign*30,70),(c+sign*20,59)],tone)
     line([(c+sign*27,18),(c+sign*35,24),(c+sign*37,52)],light,2)
   elif kind==1:
    for sign in [-1,1]:
     for j in range(3):
      y=18+j*22;shift=[0,2,4,2,0,-2][frame]
      poly([(c+sign*9,y),(c+sign*26,y-9),(c+sign*44,y-4+shift),(c+sign*40,y+8+shift),(c+sign*26,y+2),(c+sign*12,y+16)],'#10182b')
      line([(c+sign*14,y+3),(c+sign*26,y-4),(c+sign*40,y+1+shift)],tone,5)
      line([(c+sign*20,y+1),(c+sign*27,y-2),(c+sign*35,y+2+shift)],light,1)
   else:
    import math
    for j in range(8):
     a=j*math.pi/4; x=int(c+math.cos(a)*31);y=int(c+math.sin(a)*31)
     d.regular_polygon((x,y,13),6,rotation=j*45,fill='#10182b');d.regular_polygon((x,y,10),6,rotation=j*45,fill=tone)
     rect((x-2,y-5,x+2,y+4),light)
   poly([(36,20),(48,12),(59,20),(67,43),(61,68),(54,82),(41,82),(34,68),(29,43)],'#24334e')
   line([(36,25),(34,43),(38,64),(43,73)],'#8291ac',2);line([(59,25),(62,43),(57,65),(53,74)],light,2)
   for sign in [-1,1]:
    for y in range(29,67,6):
     rect((c+sign*12-2,y,c+sign*12+1,y+2),'#10182b');rect((c+sign*12-1,y,c+sign*12,y),light)
    for y in [25,71]:rect((c+sign*7,y,c+sign*7+1,y+1),'#e8eddf')
   d.regular_polygon((48,45,14),8,fill='#101728');d.regular_polygon((48,45,11),8,fill=tone)
   d.regular_polygon((48,45,8),6,rotation=frame*30,fill=pulse)
   rect((46,42,49,47),'#ffffff')
   # Armor seams, recessed vents, rivets and luminous wing conduits.
   for sign in [-1,1]:
    for j in range(3):
     x=c+sign*(25+j*5);y=35+j*7
     rect((x-2,y,x+2,y+2),'#15243b');rect((x-1,y,x+1,y),light)
    rect((c+sign*23-2,58,c+sign*23+2,68),'#132339');rect((c+sign*23-1,61,c+sign*23+1,67),pulse)
  frames.append(im)
 frames[0].save(OUT/(name+'.png'))
 sheet=Image.new('RGBA',(size*6,size))
 for i,im in enumerate(frames):sheet.paste(im,(i*size,0))
 sheet.save(OUT/(name+'-sheet.png'))
 return frames[0]
sprites={name:ship(name,96 if name.startswith('boss') else 48,kind) for name,kind in [('player','player'),('scout','scout'),('manta','manta'),('tank','tank'),('boss0',0),('boss1',1),('boss2',2)]}
im=Image.new('RGBA',(16,20));d=ImageDraw.Draw(im);d.rectangle((10,0,11,8),fill=P['light']);d.rectangle((11,0,14,1),fill=P['light']);d.polygon([(2,7),(12,7),(14,11),(12,18),(4,19),(1,14)],fill=P['ink']);d.polygon([(3,9),(11,9),(12,12),(10,17),(4,17),(3,14)],fill=P['orange']);d.rectangle((3,8,11,9),fill=P['gold']);d.rectangle((5,10,7,15),fill=P['gold']);d.rectangle((4,7,10,7),fill='#52724c');im.save(OUT/'mate.png')
# Deliberately low-resolution cover, enlarged with nearest-neighbor.
im=Image.new('RGB',(480,270),'#070e24');d=ImageDraw.Draw(im);rng=random.Random(82)
for _ in range(150):
 x,y=rng.randrange(480),rng.randrange(270);d.rectangle((x,y,x+1,y+1),fill=rng.choice(['#445781','#7bb8c5','#e5e8dc']))
d.ellipse((230,120,570,460),fill='#143c61');d.arc((227,117,573,463),180,320,fill='#67e8ec',width=3)
for _ in range(75):
 x,y=rng.randrange(280,480),rng.randrange(160,270)
 if (x-400)**2+(y-290)**2<160**2:d.rectangle((x,y,x+rng.randrange(2,10),y+2),fill='#24627b')
for name,x,y,scale in [('boss0',337,7,1),('manta',240,48,1),('scout',290,104,1),('player',187,147,2)]:
 s=sprites[name];im.paste(s.resize((s.width*scale,s.height*scale),Image.Resampling.NEAREST),(x,y),s.resize((s.width*scale,s.height*scale),Image.Resampling.NEAREST))
# Original bitmap lettering using the project's own 5x7 font source.
# Keep cover text independent of installed fonts using a tiny authored alphabet.
FONT={'O':['01110','11011','11011','11011','11011','11011','01110'],'R':['11110','11011','11011','11110','11100','11010','11011'],'B':['11110','11011','11011','11110','11011','11011','11110'],'I':['111','010','010','010','010','010','111'],'T':['11111','00100','00100','00100','00100','00100','00100'],'A':['01110','11011','11011','11111','11011','11011','11011'],'S':['01111','11000','11000','01110','00011','00011','11110'],'U':['11011','11011','11011','11011','11011','11011','01110']}
def label(text,x,y,scale,color):
 for ch in text:
  if ch==' ':x+=4*scale;continue
  rows=FONT[ch]
  for yy,row in enumerate(rows):
   for xx,b in enumerate(row):
    if b=='1':d.rectangle((x+xx*scale,y+yy*scale,x+(xx+1)*scale-1,y+(yy+1)*scale-1),fill=color)
  x+=(len(rows[0])+1)*scale
label('ORBITA',25,42,5,'#e0f4f5');label('SUR',25,91,5,'#b3eb82')
d.rectangle((25,139,148,141),fill='#67e8ec');d.rectangle((25,153,111,155),fill='#445781')
im.resize((1440,810),Image.Resampling.NEAREST).save(OUT/'cover.png')
print('Created 9 original pixel-art assets and cover')
