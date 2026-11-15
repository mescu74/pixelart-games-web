from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1];source=root/'games/fuga-portena';target=root/'portal/test-output/fuga-portena.zip';target.parent.mkdir(exist_ok=True,parents=True)
files=[source/n for n in ['index.html','style.css','game.js','core.js','map.json','phaser.min.js','PHASER-LICENSE.txt','MAP-LICENSE.txt']]+list((source/'assets').glob('*.png'))
with ZipFile(target,'w',ZIP_DEFLATED) as z:
 for p in sorted(files):
  if p.name!='cover.png':z.write(p,p.relative_to(source))
print(f'{target} ({target.stat().st_size:,} bytes)')
