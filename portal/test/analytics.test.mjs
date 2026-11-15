import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../public/analytics.js',import.meta.url),'utf8');
function fixture({path='/',stored=null,frame=false}={}){
 const scripts=[],events={},storage=new Map(stored?[['pixel-sur:analytics-consent:v1',JSON.stringify(stored)]]:[]),controls=[];
 const choice=v=>({dataset:{consent:v},focus(){},onclick:null});controls.push(choice('denied'),choice('granted'));
 const panel={hidden:true,setAttribute(){},querySelectorAll(){return controls;},querySelector(){return controls[0];}};
 const doc={cookie:'_ga=abc; _ga_R5P1YY93LP=def',title:'Pixel Sur Arcade',referrer:'https://example.org/path?secret=x',head:{append(s){scripts.push(s);}},body:{append(){}},querySelector(){return null;},createElement(tag){return tag==='section'?panel:{}}};
 const window={addEventListener(n,fn){events[n]=fn;}};window.top=frame?{}:window;
 const ctx=vm.createContext({window,document:doc,location:{hostname:'games.soloescus.com',origin:'https://games.soloescus.com',pathname:path,search:'?secret=x'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URL,Date});vm.runInContext(source,ctx);
 return {window,scripts,panel,events,controls,doc,storage,choose:v=>controls.find(c=>c.dataset.consent===v).onclick(),queue:()=>Array.from(window.dataLayer||[],a=>Array.from(a))};
}
test('GA4 is blocked until accepted; rejection, expiry, admin and iframe remain untracked',()=>{
 for(const args of [{},{stored:{value:'denied',at:Date.now()}},{stored:{value:'granted',at:0}}]){const f=fixture(args);assert.equal(f.scripts.length,0);}
 const f=fixture();f.choose('denied');assert.equal(f.scripts.length,0);assert.equal(f.window['ga-disable-G-R5P1YY93LP'],true);
 for(const args of [{path:'/admin/probar/ba-invaders'},{frame:true}])assert.equal(fixture(args).scripts.length,0);
});
test('acceptance loads once, sanitizes URLs, delays game event and supports revocation',()=>{
 const f=fixture({path:'/jugar/fuga-portena'});f.events['pixel-sur:game-open']({detail:{slug:'fuga-portena',title:'Fuga Porteña'}});assert.equal(f.queue().length,0);f.choose('granted');assert.equal(f.scripts.length,1);
 const q=f.queue(),page=q.find(a=>a[1]==='page_view'),open=q.find(a=>a[1]==='game_open');assert(page&&open);assert.equal(page[2].page_location,'https://games.soloescus.com/jugar/fuga-portena');assert.equal(page[2].page_referrer,'https://example.org');assert.equal(open[2].game_id,'fuga-portena');assert(!JSON.stringify(q).includes('secret'));
 f.events['pixel-sur:game-open']({detail:{slug:'fuga-portena',title:'Fuga Porteña'}});assert.equal(f.queue().filter(a=>a[1]==='game_open').length,1);f.choose('denied');assert.equal(f.window['ga-disable-G-R5P1YY93LP'],true);f.choose('granted');assert.equal(f.scripts.length,1);
});
test('global defaults precede tag initialization; player page is measured only after game metadata loads',()=>{
 const f=fixture({path:'/jugar/ba-invaders',stored:{value:'granted',at:Date.now()}}),q=f.queue();assert(q.findIndex(a=>a[0]==='set')<q.findIndex(a=>a[0]==='js'));assert.equal(q.find(a=>a[0]==='set')[1].send_page_view,false);assert(!q.some(a=>a[1]==='page_view'));
 f.doc.title='BA Invaders · Pixel Sur Arcade';f.events['pixel-sur:game-open']({detail:{slug:'ba-invaders',title:'BA Invaders'}});const page=f.queue().find(a=>a[1]==='page_view');assert.equal(page[2].page_title,'BA Invaders · Pixel Sur Arcade');assert.equal(f.queue().filter(a=>a[1]==='page_view').length,1);
});
