"""Original hand-authored pixel assets for Buenos Aires Invadida.
No stock imagery, tracing, AI images or external art. Rebuild with Pillow:
    python3 -m pip install Pillow
    python3 scripts/generate-assets.py
Coordinates are native pixels; previews use nearest-neighbour enlargement.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets';OUT.mkdir(exist_ok=True)
P={'ink':'#172131','shade':'#28374d','steel':'#536b80','silver':'#9eb9c4','white':'#eff3df','cyan':'#89dfed','teal':'#429d9d','deep':'#23616b','gold':'#f3cd67','ochre':'#bd823c','orange':'#ec7843','red':'#c94b50','pink':'#e9a0b5','purple':'#9c78ce','violet':'#5c448f','lime':'#c1dc55','green':'#78ae45','forest':'#3c6e41','skin':'#e5ae7e','skinshade':'#b87353','hair':'#49302d','brown':'#855334','tan':'#bc8950'}
class Art:
 def __init__(self,w=32,h=32):self.im=Image.new('RGBA',(w,h));self.d=ImageDraw.Draw(self.im)
 def r(self,x,y,w,h,c):
  if w>0 and h>0:self.d.rectangle((x,y,x+w-1,y+h-1),fill=P.get(c,c))
 def p(self,pts,c):self.d.polygon(pts,fill=P.get(c,c))
 def line(self,pts,c,width=1):self.d.line(pts,fill=P.get(c,c),width=width)
 def copy(self,other,x,y):self.im.alpha_composite(other.im,(x,y))
assets={};previews=[]
def save(name,frames):
 sheet=Image.new('RGBA',(frames[0].im.width*len(frames),frames[0].im.height))
 for i,a in enumerate(frames):sheet.alpha_composite(a.im,(i*a.im.width,0))
 sheet.save(OUT/(name+'.png'),optimize=True)
 assets[name]={'width':frames[0].im.width,'height':frames[0].im.height,'frames':len(frames)}
 previews.append((name,frames))

def hero(frame):
 a=Art();r=a.r
 # Dark silhouette, hair, ears, warm skin, Argentina shirt and carried mate.
 r(10,2,11,2,'ink');r(8,4,15,7,'ink');r(9,4,12,4,'hair');r(11,3,8,2,'hair');r(10,4,4,1,'brown')
 r(9,9,13,6,'skinshade');r(10,8,11,6,'skin');r(8,10,2,3,'skin');r(21,10,2,3,'skinshade')
 r(12,10,2,2,'ink');r(18,10,2,2,'ink');r(15,12,2,1,'skinshade');r(14,14,4,1,'brown');r(13,15,6,2,'skinshade')
 r(8,17,16,10,'ink');r(9,17,14,9,'white');r(9,18,3,7,'cyan');r(14,18,3,7,'cyan');r(20,18,3,7,'cyan');r(14,17,4,2,'ink');r(15,17,2,1,'skin')
 r(19,19,2,2,'gold');r(10,25,12,2,'deep');r(10,27,12,2,'shade')
 arm=1 if frame%2 else 0;r(6,18+arm,3,7,'ink');r(7,18+arm,2,4,'cyan');r(7,22+arm,2,3,'skin');r(23,18-arm,3,6,'ink');r(23,18-arm,2,3,'white');r(23,21-arm,2,3,'skin')
 r(24,19-arm,4,5,'brown');r(24,19-arm,4,1,'lime');r(27,15-arm,1,5,'silver');r(28,14-arm,2,1,'white')
 stride=[0,1,0,-1][frame];r(10,28,5,3-stride,'ink');r(17,28,5,3+stride,'ink');r(10,29-stride,5,1,'silver');r(17,29+stride,5,1,'silver')
 return a
save('hero',[hero(i) for i in range(4)])

def alien(frame,green=False):
 a=Art();r=a.r;light,base,dark=('lime','green','forest') if green else ('pink','purple','violet')
 r(9,3,3,5,'ink');r(20,3,3,5,'ink');r(10,4,2,4,base);r(20,4,2,4,base);r(7,7,18,3,'ink');r(5,10,22,12,'ink');r(7,9,18,13,base);r(10,8,12,3,light);r(7,12,3,7,light);r(23,12,2,8,dark)
 r(10,12,5,5,'ink');r(18,12,5,5,'ink');r(11,12,3,3,'white');r(19,12,3,3,'white');r(12,14,2,2,'ink');r(19,14,2,2,'ink');r(13,19,6,2,dark);r(15,19,2,1,'white')
 y=20 if frame else 17;r(3,y,3,7,'ink');r(4,y,2,5,base);r(26,y,3,7,'ink');r(26,y,2,5,base)
 for x in [8,20]:r(x,23,4,5,'ink');r(x+1,23,2,4,base);r(x-(1 if frame else 0),28,6,2,dark)
 r(12,22,8,2,dark)
 return a
save('alien',[alien(i) for i in range(2)]);save('alien-green',[alien(i,True) for i in range(2)])

def ship(frame):
 a=Art();r=a.r
 a.p([(15,1),(18,5),(19,13),(29,22),(29,28),(22,27),(19,24),(12,24),(9,27),(2,28),(2,22),(12,13),(13,5)],'ink')
 a.p([(15,3),(17,6),(18,18),(25,22),(27,26),(20,24),(16,21),(11,24),(4,26),(5,22),(13,17),(14,6)],'silver')
 a.p([(15,4),(17,8),(17,21),(15,24),(13,21),(14,8)],'white');r(14,9,3,8,'deep');r(15,9,2,5,'cyan');r(15,9,1,3,'white')
 a.p([(5,22),(12,17),(11,22),(4,26)],'cyan');a.p([(20,18),(26,22),(27,26),(20,23)],'cyan');r(5,20,2,6,'white');r(24,20,2,6,'white');r(10,24,3,3,'red');r(19,24,3,3,'red');r(14,24,4,5,'orange');r(15,25,2,6 if frame else 4,'gold');r(15,25,2,2,'white')
 return a
save('ship',[ship(i) for i in range(2)])

def saucer(frame,invader=False):
 a=Art();r=a.r
 r(12,3,8,2,'ink');r(9,5,14,3,'ink');r(7,8,18,7,'ink');r(12,4,8,2,'teal');r(10,6,12,3,'cyan');r(8,9,16,5,'teal');r(11,7,3,3,'white');r(9,10,3,3,'cyan');r(22,9,2,4,'deep')
 r(4,13,24,3,'ink');r(2,16,28,3,'ink');r(1,19,30,3,'ink');r(4,14,24,2,'silver');r(3,16,26,3,'white');r(2,19,28,2,'steel');r(5,21,22,2,'ink')
 for i,x in enumerate([6,12,18,24]):r(x,17,3,2,'gold' if (i+frame)%3==0 else 'shade')
 r(10,23,12,2,'deep');r(12,25,8,2,'cyan');r(14,27,4,2,'teal')
 if invader:
  for x in [7,23]:r(x,22,2,6,'teal');r(x-1,27,4,2,'lime')
 return a
save('saucer',[saucer(i) for i in range(4)]);save('drone',[saucer(i,True) for i in range(4)]);saucer(0).im.save(OUT/'saucer-icon.png')

def mate(empty=False,steam=0):
 a=Art();r=a.r;r(22,2,2,10,'ink');r(23,2,2,2,'white');r(21,5,2,11,'silver');r(22,4,1,8,'white')
 r(8,13,17,3,'ink');r(6,16,21,8,'ink');r(8,24,17,4,'ink');r(11,28,11,2,'ink');r(9,12,15,2,'silver');r(8,14,17,3,'ochre');r(8,17,17,7,'brown');r(10,24,13,3,'tan');r(12,27,9,1,'ochre')
 r(10,14,13,3,'shade' if empty else 'forest');r(11,14,9,1,'steel' if empty else 'lime');r(11,19,2,5,'tan');r(16,19,5,4,'ochre');r(17,19,3,1,'gold')
 if not empty:r(12+steam,7,1,3,'silver');r(13+steam,5,1,2,'silver')
 return a
save('mate',[mate(False,i) for i in range(2)]);save('mate-empty',[mate(True)]);mate().im.save(OUT/'mate-icon.png')

def thermos():
 a=Art();r=a.r;r(12,2,9,3,'ink');r(13,2,7,1,'silver');r(11,5,11,3,'ink');r(12,5,9,2,'red');r(10,8,13,20,'ink');r(11,8,11,18,'teal');r(12,9,3,15,'cyan');r(15,8,6,2,'silver');r(20,10,2,15,'deep');r(11,26,11,3,'silver');r(12,29,9,1,'ink');r(22,11,4,13,'ink');r(23,12,2,10,'steel');r(15,17,5,5,'white');r(15,18,5,1,'cyan');r(15,20,5,1,'cyan');r(17,19,1,1,'gold');return a
save('thermos',[thermos()])

def yerba():
 a=Art();r=a.r;r(6,3,20,3,'ink');r(7,3,18,2,'gold');r(5,6,22,22,'ink');r(6,6,20,20,'forest');r(7,7,4,18,'green');r(23,7,2,18,'deep');r(9,10,14,11,'white');r(10,11,12,2,'ochre');r(11,15,10,1,'forest');r(12,17,8,1,'forest');r(13,22,6,2,'gold');r(6,27,21,3,'ink');r(7,27,18,2,'gold');return a
save('yerba',[yerba()])

def taxi(crash=False):
 a=Art();r=a.r;r(3,10,26,14,'ink');r(6,7,18,3,'ink');r(7,8,16,3,'gold');r(2,12,28,9,'shade');r(5,11,22,4,'gold');r(9,9,10,2,'ochre');r(7,12,7,4,'deep');r(17,12,7,4,'deep');r(8,12,5,1,'cyan');r(18,12,4,1,'cyan');r(14,12,2,4,'ink');r(3,17,26,5,'ink');r(4,17,24,1,'steel');r(1,16,3,2,'white');r(28,16,3,2,'red');r(5,22,5,3,'ink');r(22,22,5,3,'ink');r(6,23,3,1,'steel');r(23,23,3,1,'steel');r(15,8,3,1,'white');r(15,18,3,1,'gold')
 if crash:a.line([(5,10),(12,16),(9,21)],'silver');a.line([(20,11),(17,17),(23,20)],'orange');r(25,4,2,3,'orange');r(27,1,2,2,'ochre')
 return a
save('taxi',[taxi()]);save('wreck',[taxi(True)])

def bus():
 a=Art();r=a.r;r(1,7,30,19,'ink');r(3,6,26,2,'silver');r(2,8,28,15,'white');r(3,9,26,8,'deep');
 for x in range(4,29,5):r(x,10,3,5,'cyan');r(x,10,2,1,'white')
 r(2,18,28,4,'red');r(3,22,26,2,'ochre');r(5,23,5,4,'ink');r(23,23,5,4,'ink');r(6,24,3,2,'silver');r(24,24,3,2,'silver');r(3,7,7,2,'ink');r(4,7,5,1,'gold');r(2,17,2,2,'gold');return a
save('bus',[bus()])

def tree():
 a=Art();r=a.r;r(14,21,5,10,'ink');r(15,22,3,8,'brown');r(15,22,1,8,'tan');a.p([(12,2),(21,2),(21,5),(27,5),(27,10),(30,10),(30,20),(26,20),(26,25),(7,25),(7,22),(2,22),(2,12),(5,12),(5,6),(12,6)],'ink');a.p([(12,3),(20,3),(20,6),(26,6),(26,11),(29,11),(29,19),(25,19),(25,23),(8,23),(8,20),(4,20),(4,13),(7,13),(7,7),(12,7)],'forest');r(10,7,11,5,'green');r(7,12,7,6,'green');r(13,5,5,2,'lime');r(21,14,5,6,'deep');r(10,20,11,3,'deep');return a
save('tree',[tree()])

def terminal(frame):
 a=Art();r=a.r;r(6,2,20,26,'ink');r(8,3,16,2,'steel');r(8,6,16,14,'deep');r(9,7,14,12,'teal');r(10,8,12,10,'cyan');r(11,9,3,2,'white');r(11,13,8,1,'deep');r(12+frame,12,2,5,'white');r(8,21,16,5,'shade');r(10,22,6,1,'silver');r(20,22,2,2,'gold');r(6,28,20,2,'steel');r(8,30,16,1,'ink');return a
save('terminal',[terminal(i) for i in range(4)])

def explosion(frame):
 a=Art();r=a.r
 for i in range(12):
  angle=i*math.tau/12;radius=3+frame*2;x=round(16+math.cos(angle)*radius);y=round(16+math.sin(angle)*radius);size=max(1,4-frame//2);r(x-size//2,y-size//2,size,size,'orange' if i%2 else 'red')
 if frame<4:
  size=[5,10,12,6][frame];r(16-size//2,14-size//2,size,size,'orange');r(14-size//3,14-size//3,size//2+2,size//2+2,'gold');r(14,13,4,4,'white')
 return a
save('explosion',[explosion(i) for i in range(6)])

def bullet(plasma=False,frame=0):
 a=Art();r=a.r
 if plasma:r(12,9,8,14,'ink');r(13,10,6,12,'violet');r(14,11,4,10,'pink');r(15,12+frame,2,6,'white')
 else:r(13,4,6,22,'ink');r(14,5,4,17,'ochre');r(15,5,2,15,'gold');r(15,6,2,10,'white');r(15,23,2,3,'orange')
 return a
save('bullet',[bullet(False,i) for i in range(2)]);save('plasma',[bullet(True,i) for i in range(2)])

def brick():
 a=Art();r=a.r;r(1,9,30,14,'ink');r(2,10,28,12,'teal');r(3,10,26,2,'cyan');r(3,12,2,7,'cyan');r(5,12,24,7,'white');r(5,13,24,6,'silver');r(3,20,26,1,'deep');return a
save('brick',[brick()])

def obelisk():
 a=Art(80,144);r=a.r
 a.p([(9,122),(55,115),(76,132),(62,138),(14,138),(3,132)],'ink');r(14,125,48,10,'steel');r(18,122,40,10,'silver');r(23,119,30,9,'white')
 a.p([(27,120),(29,25),(39,4),(49,25),(52,120)],'ink');a.p([(29,119),(31,26),(39,8),(39,119)],'white');a.p([(39,8),(47,26),(50,119),(39,119)],'silver');r(32,36,2,77,'#d0d7c5');r(38,105,6,15,'ink');r(39,107,3,12,'shade');r(34,60,2,10,'silver');r(35,76,2,2,'ochre')
 for x in range(11,72,12):r(x,139,5,2,'teal')
 return a
save('obelisk',[obelisk()])

def building(kind):
 w,h=(128,96) if kind in ['congress','colon'] else (96,80);a=Art(w,h);r=a.r
 r(3,h-8,w-6,7,'ink');r(6,h-13,w-12,6,'silver');r(9,29,w-18,h-42,'ink');r(11,31,w-22,h-45,'tan');r(12,32,w-24,4,'gold')
 for x in range(15,w-15,12):
  r(x,42,5,h-59,'ink');r(x+1,43,3,h-62,'deep');r(x-2,h-32,3,19,'white');r(x-3,h-15,7,2,'silver')
 r(8,36,w-16,4,'silver');r(7,h-38,w-14,3,'ochre');r(11,h-17,w-22,3,'white')
 if kind=='congress':
  a.p([(w//2-27,30),(w//2,16),(w//2+27,30)],'ink');a.p([(w//2-23,29),(w//2,19),(w//2+23,29)],'white');r(53,6,22,12,'forest');r(57,2,14,5,'teal');r(51,15,26,4,'silver');r(63,0,2,3,'gold');r(57,19,14,7,'steel')
 elif kind=='colon':
  r(13,14,w-26,16,'ink');r(15,16,w-30,13,'violet');r(20,13,w-40,4,'steel');r(24,10,w-48,4,'silver');r(17,26,w-34,4,'white')
  for x in [19,38,57,76,95]:r(x,19,10,5,'deep');r(x+1,19,8,1,'cyan')
 else:
  r(13,9,w-26,23,'ink');r(15,11,w-30,20,'steel');r(20,13,w-40,14,'deep');r(21,14,w-42,2,'cyan');r(25,18,w-50,2,'gold');r(25,23,w-50,2,'gold');r(9,h-38,w-18,7,'red' if kind=='gran-rex' else 'teal');r(13,h-37,w-26,2,'gold')
 return a
for name in ['congress','colon','san-martin','gran-rex']:save(name,[building(name)])
# Deliberately small bespoke 5x7 alphabet. No font files or third-party glyphs.
FONT={
'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01110'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','10010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','11001','10101','10011','10011','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','10101','01010'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],
'0':['01110','10011','10101','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
' ':['00000']*7,':':['00000','00100','00100','00000','00100','00100','00000'],'.':['00000']*5+['00100','00100'],'/':['00001','00001','00010','00100','01000','10000','10000'],'-':['00000']*3+['11111']+['00000']*3,'+':['00000','00100','00100','11111','00100','00100','00000'],'!':['00100']*5+['00000','00100'],'?':['01110','10001','00001','00010','00100','00000','00100']}
chars=''.join(FONT);font=Art(len(chars)*6,8);xml=[]
for i,ch in enumerate(chars):
 for y,row in enumerate(FONT[ch]):
  for x,v in enumerate(row):
   if v=='1':font.r(i*6+x,y,1,1,'white')
 xml.append(f'<char id="{ord(ch)}" x="{i*6}" y="0" width="5" height="7" xoffset="0" yoffset="0" xadvance="6" page="0" chnl="15"/>')
font.im.save(OUT/'arcade-font.png');(OUT/'arcade-font.xml').write_text(f'<font><info face="Sur Arcade" size="8"/><common lineHeight="9" base="7" scaleW="{len(chars)*6}" scaleH="8" pages="1"/><pages><page id="0" file="arcade-font.png"/></pages><chars count="{len(chars)}">'+''.join(xml)+'</chars></font>')
(OUT/'manifest.json').write_text(json.dumps(assets,indent=2)+'\n')
# Contact sheet is also useful to review all animation frames outside Phaser.
board=Image.new('RGB',(960,1300),'#20282a');d=ImageDraw.Draw(board)
def label(x,y,string,color='#91d9da',scale=2):
 for n,ch in enumerate(string.upper()):
  for yy,row in enumerate(FONT.get(ch,FONT['?'])):
   for xx,v in enumerate(row):
    if v=='1':d.rectangle((x+n*6*scale+xx*scale,y+yy*scale,x+n*6*scale+xx*scale+scale-1,y+yy*scale+scale-1),fill=color)
label(30,24,'BUENOS AIRES INVADIDA',scale=3);label(30,58,'ORIGINAL PIXEL ASSETS / SUR ARCADE',scale=2)
y=100
small=previews[:19]
for row in range(0,len(small),3):
 for col,(name,frames) in enumerate(small[row:row+3]):
  x=30+col*310;label(x,y,name.replace('-',' '),scale=2)
  for f,a in enumerate(frames[:4]):
   scale=2;im=a.im.resize((a.im.width*scale,a.im.height*scale),Image.Resampling.NEAREST);board.paste(im,(x+f*68,y+23),im)
 y+=115
# Landmarks at the bottom at native integer scale.
label(30,y,'BUENOS AIRES / LANDMARKS',scale=2);y+=22
for name,x in [('obelisk',30),('congress',150),('colon',320),('san-martin',490),('gran-rex',640)]:
 im=Image.open(OUT/(name+'.png'));board.paste(im,(x,y),im)
board.crop((0,0,960,y+155)).save(OUT/'contact-sheet.png',optimize=True)
print(f'Generated {len(assets)} original assets, {sum(a["frames"] for a in assets.values())} sprite frames and a bitmap font.')
