from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
source=root/'games/orbita-sur'; target=root/'portal/test-output/orbita-sur.zip'
target.parent.mkdir(parents=True,exist_ok=True)
files=[source/n for n in ['index.html','style.css','game.js','phaser.min.js','PHASER-LICENSE.txt']]+list((source/'assets').glob('*.png'))
with ZipFile(target,'w',ZIP_DEFLATED) as z:
 for p in sorted(files):
  if p.name!='cover.png':z.write(p,p.relative_to(source))
print(f'{target} ({target.stat().st_size:,} bytes, {len(files)-1} files)')
