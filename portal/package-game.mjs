import {cp,mkdir,rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url))),out=path.join(root,'portal/bundled/ba-invaders');
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const name of ['index.html','style.css','game.js','core.js','assets.js','street-navigation.js','map-data.json','assets','vendor'])await cp(path.join(root,name),path.join(out,name),{recursive:true});
console.log('Bundled BA Invaders with original assets and clear-street navigation.');
