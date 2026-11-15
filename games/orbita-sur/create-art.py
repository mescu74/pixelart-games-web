"""Original Pixel Sur Arcade art. Integer pixels, no borrowed sprites."""
from PIL import Image, ImageDraw
from pathlib import Path
import random
ROOT=Path(__file__).parent
OUT=ROOT/'assets'; OUT.mkdir(exist_ok=True)
P={'ink':'#10172f','steel':'#566b94','light':'#d9f5fa','white':'#ffffff','cyan':'#67e8ec','blue':'#2595c7','gold':'#ffd478','orange':'#fb8856','red':'#ec5272','purple':'#ab77ef','dark':'#30234f','green':'#b3eb82'}
def ship(name,size,kind):
 im=Image.new('RGBA',(size,size)); d=ImageDraw.Draw(im); c=size//2
 def poly(points,color):d.polygon(points,fill=P.get(color,color))
 def rect(box,color):d.rectangle(box,fill=P.get(color,color))
 if kind=='player':
  poly([(c,1),(c+5,11),(c+6,17),(c+13,22),(c+14,29),(c+5,27),(c+3,30),(c-3,30),(c-5,27),(c-14,29),(c-13,22),(c-6,17),(c-5,11)],'ink')
  poly([(c,3),(c+3,11),(c+4,25),(c,28),(c-4,25),(c-3,11)],'light')
  poly([(c-5,18),(c-11,23),(c-12,27),(c-5,25)],'cyan');poly([(c+5,18),(c+11,23),(c+12,27),(c+5,25)],'cyan')
  rect((c-1,10,c+1,17),'blue');rect((c,10,c,14),'white');rect((c-2,21,c+2,24),'steel')
  rect((c-9,24,c-7,25),'gold');rect((c+7,24,c+9,25),'gold');rect((c-3,27,c-2,29),'orange');rect((c+2,27,c+3,29),'orange')
 elif kind=='scout':
  poly([(c-12,8),(c-7,3),(c-4,10),(c,7),(c+4,10),(c+7,3),(c+12,8),(c+10,20),(c+4,17),(c,25),(c-4,17),(c-10,20)],'ink')
  poly([(c-10,8),(c-7,6),(c-5,15),(c-9,17)],'purple');poly([(c+10,8),(c+7,6),(c+5,15),(c+9,17)],'purple')
  poly([(c,10),(c+4,14),(c,22),(c-4,14)],'red');rect((c-2,13,c+2,15),'gold');rect((c,16,c,19),'white')
 elif kind=='manta':
  poly([(c,5),(c+8,10),(c+15,6),(c+14,19),(c+6,24),(c,20),(c-6,24),(c-14,19),(c-15,6),(c-8,10)],'ink')
  poly([(c,8),(c+7,13),(c+12,10),(c+11,17),(c+5,20),(c,17),(c-5,20),(c-11,17),(c-12,10),(c-7,13)],'blue')
  rect((c-3,11,c+3,14),'cyan');rect((c-1,12,c+1,13),'white');rect((c-10,17,c-7,18),'purple');rect((c+7,17,c+10,18),'purple')
 elif kind=='tank':
  poly([(c-10,4),(c+10,4),(c+14,12),(c+11,26),(c+5,26),(c+4,22),(c-4,22),(c-5,26),(c-11,26),(c-14,12)],'ink')
  rect((c-8,6,c+8,18),'steel');rect((c-11,12,c-8,23),'orange');rect((c+8,12,c+11,23),'orange');rect((c-4,8,c+4,13),'red');rect((c-2,9,c+2,10),'gold');rect((c-5,17,c+5,19),'light')
 else:
  # Three wholly original large mechanical bosses: antennae, armor, luminous reactor.
  tone=['purple','blue','orange'][kind]; accent=['red','cyan','gold'][kind]
  poly([(c-28,12),(c-18,7),(c-11,18),(c-5,7),(c+5,7),(c+11,18),(c+18,7),(c+28,12),(c+31,36),(c+24,49),(c+14,43),(c+8,55),(c-8,55),(c-14,43),(c-24,49),(c-31,36)],'ink')
  poly([(c-26,14),(c-19,11),(c-14,22),(c-17,40),(c-24,44),(c-28,34)],tone);poly([(c+26,14),(c+19,11),(c+14,22),(c+17,40),(c+24,44),(c+28,34)],tone)
  poly([(c-9,20),(c,11),(c+9,20),(c+12,39),(c+6,50),(c-6,50),(c-12,39)],'steel')
  rect((c-6,23,c+6,36),'ink');rect((c-4,25,c+4,34),accent);rect((c-2,27,c+2,31),'white')
  for x in [-23,20]:rect((c+x,26,c+x+3,36),'light');rect((c+x+1,36,c+x+2,42),accent)
  for x in [-7,5]:rect((c+x,41,c+x+2,46),'gold')
 im.save(OUT/(name+'.png'));return im
sprites={name:ship(name,64 if name.startswith('boss') else 32,kind) for name,kind in [('player','player'),('scout','scout'),('manta','manta'),('tank','tank'),('boss0',0),('boss1',1),('boss2',2)]}
im=Image.new('RGBA',(16,20));d=ImageDraw.Draw(im);d.rectangle((10,0,11,8),fill=P['light']);d.rectangle((11,0,14,1),fill=P['light']);d.polygon([(2,7),(12,7),(14,11),(12,18),(4,19),(1,14)],fill=P['ink']);d.polygon([(3,9),(11,9),(12,12),(10,17),(4,17),(3,14)],fill=P['orange']);d.rectangle((3,8,11,9),fill=P['gold']);d.rectangle((5,10,7,15),fill=P['gold']);d.rectangle((4,7,10,7),fill='#52724c');im.save(OUT/'mate.png')
# Deliberately low-resolution cover, enlarged with nearest-neighbor.
im=Image.new('RGB',(480,270),'#070e24');d=ImageDraw.Draw(im);rng=random.Random(82)
for _ in range(150):
 x,y=rng.randrange(480),rng.randrange(270);d.rectangle((x,y,x+1,y+1),fill=rng.choice(['#445781','#7bb8c5','#e5e8dc']))
d.ellipse((230,120,570,460),fill='#143c61');d.arc((227,117,573,463),180,320,fill='#67e8ec',width=3)
for _ in range(75):
 x,y=rng.randrange(280,480),rng.randrange(160,270)
 if (x-400)**2+(y-290)**2<160**2:d.rectangle((x,y,x+rng.randrange(2,10),y+2),fill='#24627b')
for name,x,y,scale in [('boss0',330,12,2),('manta',240,55,1),('scout',285,100,1),('player',187,147,3)]:
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
