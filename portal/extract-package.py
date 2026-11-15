"""Validate and unpack a browser game without executing any uploaded content."""
import json,os,stat,sys,zipfile
from pathlib import Path,PurePosixPath
source,out=sys.argv[1:3]
LIMIT=200*1024*1024;MAX_FILES=3000
ALLOWED={'.html','.htm','.js','.mjs','.css','.json','.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.ogg','.mp3','.wav','.mp4','.webm','.woff','.woff2','.ttf','.otf','.wasm','.txt','.xml','.map','.bin','.data','.pck'}
try:
 with zipfile.ZipFile(source) as z:
  files=[i for i in z.infolist() if not i.is_dir() and not i.filename.startswith('__MACOSX/')]
  if not files or len(files)>MAX_FILES:raise ValueError('El ZIP está vacío o tiene demasiados archivos.')
  if sum(i.file_size for i in files)>LIMIT:raise ValueError('El juego descomprimido supera los 200 MB.')
  entries=[];seen=set()
  for i in files:
   p=PurePosixPath(i.filename)
   if p.is_absolute() or '..' in p.parts or '\\' in i.filename or '\x00' in i.filename:raise ValueError('El ZIP contiene una ruta no permitida.')
   if any(part.startswith('.') for part in p.parts):continue
   if stat.S_ISLNK(i.external_attr>>16):raise ValueError('No se permiten enlaces simbólicos.')
   if p.suffix.lower() not in ALLOWED:raise ValueError('Formato no permitido: '+p.suffix)
   if i.flag_bits&1:raise ValueError('No se permiten ZIP cifrados.')
   if i.file_size>0 and i.file_size/max(i.compress_size,1)>400:raise ValueError('El archivo tiene una compresión excesiva.')
   if str(p).lower() in seen:raise ValueError('El ZIP contiene rutas duplicadas.')
   seen.add(str(p).lower());entries.append((i,p))
  roots=[p for _,p in entries if p.name=='index.html']
  if PurePosixPath('index.html') in roots:prefix=PurePosixPath('.')
  elif len(roots)==1 and len(roots[0].parts)==2:prefix=roots[0].parent
  else:raise ValueError('Incluí index.html en la raíz del ZIP o en una sola carpeta.')
  total=0;dest=Path(out).resolve();dest.mkdir(parents=True,exist_ok=False)
  for i,p in entries:
   if prefix!=PurePosixPath('.'):
    try:p=p.relative_to(prefix)
    except ValueError:continue
   target=dest.joinpath(*p.parts)
   if not target.resolve().is_relative_to(dest):raise ValueError('Ruta fuera del paquete.')
   target.parent.mkdir(parents=True,exist_ok=True)
   with z.open(i) as src,target.open('wb') as dst:
    while True:
     chunk=src.read(65536)
     if not chunk:break
     total+=len(chunk)
     if total>LIMIT:raise ValueError('El juego supera el límite descomprimido.')
     dst.write(chunk)
  if not (dest/'index.html').is_file():raise ValueError('No se encontró index.html.')
  print(json.dumps({'files':len(entries),'bytes':total}))
except Exception as e:
 print(str(e),file=sys.stderr);sys.exit(1)
