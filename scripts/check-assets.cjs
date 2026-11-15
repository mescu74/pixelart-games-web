const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json')));
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets.js'),'utf8'),context);
function png(file){const b=fs.readFileSync(path.join(root,'assets',file));assert.equal(b.subarray(1,4).toString(),'PNG');return{w:b.readUInt32BE(16),h:b.readUInt32BE(20),color:b[25]};}
for(const[name,asset]of Object.entries(manifest)){const p=png(name+'.png');assert.equal(p.w,asset.width*asset.frames,`${name}: sheet frame widths`);assert.equal(p.h,asset.height,`${name}: sheet frame height`);assert.equal(p.color,6,`${name}: transparent RGBA sprite`);}
for(const[key,name,frames]of context.window.PixelAssets.sheets){assert.ok(manifest[name],`${key}: preload source exists`);assert.equal(manifest[name].frames,frames);assert.equal(manifest[name].width,32);assert.equal(manifest[name].height,32);}
assert.deepEqual([png('mate-icon.png').w,png('mate-icon.png').h],[32,32]);
const font=fs.readFileSync(path.join(root,'assets/arcade-font.xml'),'utf8');for(const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /')assert.ok(font.includes(`id="${ch.charCodeAt(0)}"`),`font contains ${ch}`);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(html.indexOf('assets.js')<html.indexOf('game.js'),'asset module loads before game');
console.log(`PASS: ${Object.keys(manifest).length} sprite sources, ${Object.values(manifest).reduce((n,a)=>n+a.frames,0)} frames, Phaser sheet dimensions, single-mate HUD icon, bitmap alphabet and script order.`);
