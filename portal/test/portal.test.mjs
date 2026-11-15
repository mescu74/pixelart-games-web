import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import net from 'node:net';
const ROOT=path.resolve(import.meta.dirname,'../..');
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const p=s.address().port;await new Promise(r=>s.close(r));return p;}
async function makeZip(dir,name,files){const file=path.join(dir,name+'.zip');execFileSync('python3',['-c','import zipfile,json,sys\nwith zipfile.ZipFile(sys.argv[1],"w") as z:\n for name,body in json.loads(sys.argv[2]).items():z.writestr(name,body)',file,JSON.stringify(files)]);return readFile(file);}
test('catalogue, admin auth, validation, upload, preview, publication and persistence',async()=>{
 const data=await mkdtemp(path.join(tmpdir(),'pixel-sur-test-')),port=await freePort(),base=`http://127.0.0.1:${port}`;let server,logs='';
 const start=async()=>{server=spawn(process.execPath,['portal/server.mjs'],{cwd:ROOT,env:{...process.env,PORT:String(port),PUBLIC_ORIGIN:base,PORTAL_DATA_DIR:data,ADMIN_PASSWORD:'test-credential-only'},stdio:['ignore','pipe','pipe']});server.stderr.on('data',c=>logs+=c);for(let i=0;i<50;i++){try{if((await fetch(base+'/api/health')).ok)return;}catch{}await new Promise(r=>setTimeout(r,50));}throw Error('Portal did not start '+logs);};
 const stop=async()=>{if(server.exitCode!=null)return;const finished=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await finished;};
 let cookie='',csrf='';const request=async(p,{method='GET',body,headers={}}={})=>fetch(base+p,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(method!=='GET'?{Origin:base,'X-CSRF-Token':csrf}:{}),...(body&&!(body instanceof Buffer)?{'Content-Type':'application/json'}:{}),...headers},body:body instanceof Buffer?body:body?JSON.stringify(body):undefined});
 try{
  await start();let r=await request('/api/games'),v=await r.json();assert.equal(v.games.length,1);assert.equal(v.games[0].title,'BA Invaders');
  assert.equal((await request('/api/admin/games')).status,401);
  assert.equal((await request('/api/admin/login',{method:'POST',body:{password:'wrong'}})).status,401);
  r=await request('/api/admin/login',{method:'POST',body:{password:'test-credential-only'}});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];assert.match(r.headers.get('set-cookie'),/HttpOnly/);assert.match(r.headers.get('set-cookie'),/SameSite=Strict/);csrf=(await r.json()).csrf;
  assert.equal((await request('/api/admin/games',{method:'POST',body:{},headers:{Origin:'https://untrusted.example'}})).status,403);
  assert.equal((await request('/api/admin/games',{method:'POST',body:{},headers:{'X-CSRF-Token':'bad'}})).status,403);
  const meta={slug:'test-game',title:'Test Game',description:'A local test game for upload validation.',controls:'Arrow keys',tags:['Arcade']};
  assert.equal((await request('/api/admin/games',{method:'POST',body:meta})).status,201);
  assert.equal((await request('/api/admin/games',{method:'POST',body:meta})).status,409);
  assert.equal((await request('/api/admin/games/test-game/publish',{method:'POST',body:{published:true}})).status,400);
  const malicious=await makeZip(data,'traversal',{'index.html':'<p>Test</p>','../escaped.txt':'bad'});
  assert.equal((await request('/api/admin/games/test-game/package',{method:'PUT',body:malicious})).status,400);
  const missing=await makeZip(data,'missing',{'game.js':'console.log(1)'});assert.equal((await request('/api/admin/games/test-game/package',{method:'PUT',body:missing})).status,400);
  const zip=await makeZip(data,'valid',{'index.html':'<!doctype html><html><head><title>Test</title></head><body><h1>Uploaded test game</h1><script src="game.js"></script></body></html>','game.js':'localStorage.setItem("test-progress","saved");'});
  r=await request('/api/admin/games/test-game/package',{method:'PUT',body:zip});assert.equal(r.status,200);assert.equal((await r.json()).game.published,false);
  assert.equal((await request('/api/games/test-game/launch')).status,404);
  r=await request('/api/admin/games/test-game/launch');assert.equal(r.status,200);v=await r.json();assert.match(v.html,/Uploaded test game/);const previewBase=v.base;
  r=await fetch(previewBase+'game.js');assert.equal(r.status,200);assert.equal(r.headers.get('access-control-allow-origin'),'*');
  assert.equal((await fetch(previewBase.replace(/\/[^/]+\/$/,'/public/')+'game.js')).status,404);
  assert.equal((await request('/api/admin/games/test-game/publish',{method:'POST',body:{published:true}})).status,200);
  assert.equal((await(await request('/api/games')).json()).games.length,2);
  v=await(await request('/api/games/test-game/launch')).json();assert.equal((await fetch(v.base+'game.js')).status,200);
  assert.equal((await fetch(v.base+'%2e%2e%2f%2e%2e%2fsession-secret.txt')).status,404);
  await stop();await start();assert.equal((await(await request('/api/games')).json()).games.length,2);
  assert.equal((await request('/api/admin/games/test-game/publish',{method:'POST',body:{published:false}})).status,200);
  assert.equal((await(await request('/api/games')).json()).games.length,1);
  assert.equal((await request('/api/admin/logout',{method:'POST'})).status,200);assert.equal((await request('/api/admin/me')).status,401);
  assert.doesNotMatch(logs,/test-credential-only/);
 }finally{await stop();await rm(data,{recursive:true,force:true});}
});
