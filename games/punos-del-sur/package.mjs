import {execFileSync} from 'node:child_process';
import {mkdir,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const gameDir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(gameDir,'../..');
const bundleDir=path.join(root,'portal/bundled');
const output=path.join(bundleDir,'punos-del-sur.zip');
await mkdir(bundleDir,{recursive:true});
await rm(output,{force:true});
execFileSync('zip',['-q','-r',output,'index.html','style.css','game.js','assets'],{cwd:gameDir});
console.log(`Paquete listo: ${output}`);
