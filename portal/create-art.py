from PIL import Image,ImageDraw
from pathlib import Path
import runpy,random
root=Path(__file__).resolve().parents[1]; art=runpy.run_path(str(root/'scripts/generate-assets.py'));font=art['FONT'];out=root/'portal/public/assets';out.mkdir(exist_ok=True)
ship=Image.open(root/'assets/ship.png').crop((0,0,32,32));ship.save(out/'logo.png');ship.resize((64,64),Image.Resampling.NEAREST).save(out/'favicon.png')
im=Image.new('RGB',(384,240),'#15212a');d=ImageDraw.Draw(im);rng=random.Random(86)
for y in range(0,180,6):d.rectangle((0,y,384,y+5),fill=(21+y//30,30+y//26,44+y//18))
for i in range(65):x,y=rng.randrange(384),rng.randrange(145);d.rectangle((x,y,x+1,y+1),fill=rng.choice(['#5d8790','#9bafa8','#ddcc86']))
for x in range(-5,384,23):
 h=rng.randrange(30,75);d.rectangle((x,186-h,x+20,190),fill='#34464d');d.rectangle((x,186-h,x+20,188-h),fill='#67706b')
 for xx in range(x+3,x+18,5):
  for yy in range(190-h,180,8):
   if rng.random()>.4:d.rectangle((xx,yy,xx+1,yy+2),fill='#8a8b62')
d.polygon([(170,178),(215,178),(306,240),(67,240)],fill='#66716a');d.polygon([(186,178),(198,178),(216,240),(167,240)],fill='#314c50')
for y in range(190,240,12):d.rectangle((190,y,193,y+5),fill='#e2c976')
for name,x,y in [('obelisk',155,64),('hero',114,202),('alien',271,169),('alien-green',75,171)]:
 asset=Image.open(root/'assets'/f'{name}.png');asset=asset.crop((0,0,art['assets'][name]['width'],art['assets'][name]['height']));im.paste(asset,(x,y),asset)
ufo=Image.open(root/'assets/saucer-icon.png').resize((64,64),Image.Resampling.NEAREST);im.paste(ufo,(260,63),ufo)
small=Image.open(root/'assets/ship.png').crop((0,0,32,32));im.paste(small,(44,106),small)
def text(string,x,y,scale,color):
 for n,ch in enumerate(string):
  for yy,row in enumerate(font.get(ch,font['?'])):
   for xx,c in enumerate(row):
    if c=='1':d.rectangle((x+(n*6+xx)*scale,y+yy*scale,x+(n*6+xx)*scale+scale-1,y+yy*scale+scale-1),fill=color)
text('BA INVADERS',24,21,3,'#eff1da');text('BUENOS AIRES NO SE ENTREGA.',25,51,1,'#c6d998')
im.resize((1536,960),Image.Resampling.NEAREST).save(out/'ba-invaders-cover.png',optimize=True)
(out/'placeholder.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="#192b33"/><path d="M280 200h240v100H280zM320 160h160v40H320zM320 300h40v40h-40zM440 300h40v40h-40z" fill="#b5d684"/><path d="M330 225h40v35h-40zM430 225h40v35h-40z" fill="#192b33"/></svg>')
