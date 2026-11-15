import {mkdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('.',import.meta.url)),out=fileURLToPath(new URL('../../portal/bundled/',import.meta.url));
await mkdir(out,{recursive:true});
const zip=out+'gorilas-en-la-rosada.zip';
const result=spawnSync('python3',['-c',`import zipfile,sys,pathlib
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:
 for name in ['index.html','style.css','core.js','art.js','game.js']:
  z.write(root/name,name)
`,dir,zip],{encoding:'utf8'});
if(result.status)throw new Error(result.stderr);console.log(zip);
