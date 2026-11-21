(()=>{
const c=document.querySelector('#game'),ctx=c.getContext('2d'),W=400,H=225,ui={overlay:document.querySelector('#overlay'),title:document.querySelector('#title'),message:document.querySelector('#message'),start:document.querySelector('#start'),mates:document.querySelector('#mates'),score:document.querySelector('#score'),mount:document.querySelector('#mount')};
ctx.imageSmoothingEnabled=false;
const keys=new Set(),platforms=[{x:0,y:187,w:500,h:38},{x:540,y:181,w:330,h:44},{x:900,y:186,w:410,h:39},{x:1350,y:178,w:360,h:47},{x:1750,y:187,w:400,h:38},{x:2190,y:180,w:430,h:45},{x:2670,y:188,w:450,h:37},{x:3170,y:178,w:390,h:47},{x:3610,y:187,w:490,h:38},{x:4200,y:181,w:500,h:44},{x:4740,y:188,w:500,h:37},{x:5270,y:181,w:470,h:44}];
for(const p of platforms) if(p.w>150) for(let i=70;i<p.w-25;i+=88) platforms.push({x:p.x+i,y:p.y-25-(i%3)*8,w:44,h:9,small:true});
const world=5700,finish=5530, collectibles=[];for(let x=190;x<world-180;x+=155)collectibles.push({x,y:120-(x%3)*7,got:false,bob:x%17});
let player, enemies, shots, camera=0,frame=0,score=0,mates=3,state='title',paused=false,mounted=false,last=0,flash=0;
function reset(){player={x:38,y:140,vx:0,vy:0,w:13,h:22,on:false,face:1,inv:0};enemies=[{x:650,dir:1},{x:1110,dir:-1},{x:1660,dir:1},{x:2250,dir:-1},{x:2910,dir:1},{x:3450,dir:-1},{x:3980,dir:1},{x:4590,dir:-1},{x:5100,dir:1}].map(e=>({...e,y:(platforms.find(p=>e.x>=p.x&&e.x<p.x+p.w)?.y||185)-17,alive:true}));shots=[];collectibles.forEach(o=>o.got=false);camera=0;score=0;mates=3;mounted=false;frame=0;flash=0;state='playing';ui.overlay.classList.add('hidden');hud()}
function hud(){ui.mates.textContent='MATES '+'♥'.repeat(mates)+'♡'.repeat(3-mates);ui.score.textContent='PUNTOS '+String(score).padStart(5,'0');ui.mount.textContent='PIPO: '+(mounted?'MONTADOS':'LISTO')}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function box(x,y,w,h,col,edge='#172634'){rect(x,y,w,h,edge);rect(x+1,y+1,w-2,h-2,col)}
function cloud(x,y,s){rect(x,y+4,30*s,7*s,'#edbd9c');rect(x+7*s,y,17*s,6*s,'#edbd9c');rect(x+4*s,y+10*s,23*s,2*s,'#d98e84')}
function bg(){let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#243d5b');g.addColorStop(.65,'#ed9879');g.addColorStop(1,'#f3c17d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);rect(305-camera*.08%440,32,24,24,'#ffe1a1');cloud(45-camera*.1%460,36,1);cloud(230-camera*.07%460,53,.75);cloud(340-camera*.11%490,25,.65);
 for(let layer=0;layer<3;layer++){let span=130+layer*48,off=-(camera*(.13+layer*.12))%span;for(let x=off-span;x<W+span;x+=span){let base=132+layer*17;rect(x,base,span,80,['#ad7380','#765d72','#4d6066'][layer]);rect(x+span*.3,base-28-layer*5,span*.35,32+layer*5,['#ad7380','#765d72','#4d6066'][layer]);rect(x+span*.6,base-16,span*.24,20,['#ad7380','#765d72','#4d6066'][layer]);}}
 // luminous faraway tower
 let bx=274-camera*.18%W;rect(bx,79,18,61,'#c59a78');rect(bx-4,73,26,9,'#e9ba87');rect(bx+6,63,6,11,'#f7d18b');rect(bx+8,55,2,8,'#fff1b5');
}
function ground(){for(const p of platforms){let x=Math.round(p.x-camera);if(x+p.w<0||x>W)continue;rect(x,p.y,p.w,p.h,'#294b48');rect(x,p.y,p.w,4,'#83a976');rect(x,p.y+4,p.w,p.h-4,'#375e57');for(let k=0;k<p.w;k+=17){rect(x+k,p.y+9+(k%3)*5,5,2,'#456c5f');rect(x+k+6,p.y+p.h-5,3,2,'#233f43')}if(p.small){rect(x,p.y+7,p.w,3,'#223d40')}}}
function lola(x,y,dir,ride=false){ctx.save();ctx.translate(Math.round(x),Math.round(y));if(dir<0){ctx.translate(13,0);ctx.scale(-1,1)}let step=Math.sin(frame*.22)>0?1:0;
 // backpack and scarf
 rect(1,8,4,8,'#b9754f');rect(3,5,9,10,'#43b9b9');rect(4,6,7,7,'#66d4c8');rect(2,8,4,3,'#f28a68');
 // head hair/face
 rect(3,0,8,3,'#292b42');rect(1,2,11,6,'#352f49');rect(3,3,8,6,'#edb887');rect(3,3,2,3,'#352f49');rect(9,5,2,2,'#28364b');rect(7,7,3,1,'#9d5851');
 // shirt and legs
 rect(3,9,9,7,'#4e9cc2');rect(2,11,3,4,'#f17b63');rect(4,15,3,5,'#27364c');rect(8,15,3,5,'#27364c');if(step){rect(3,19,5,2,'#e4c895');rect(8,19,5,2,'#394153')}else{rect(2,19,5,2,'#394153');rect(8,19,5,2,'#e4c895')}
 if(ride){rect(3,7,8,2,'#e9cf98')}ctx.restore()}
function pipo(x,y){let bounce=Math.round(Math.sin(frame*.15)*1);x=Math.round(x);y=Math.round(y+bounce);
 // tail and body
 rect(x-4,y+10,6,4,'#318f84');rect(x+2,y+8,13,9,'#36b4a8');rect(x+7,y+6,10,8,'#48cec0');rect(x+13,y+3,8,8,'#48cec0');rect(x+18,y+5,7,3,'#f2cb7d');rect(x+16,y+1,3,3,'#173542');rect(x+12,y+9,7,5,'#b1e1a2');
 // feather crest
 rect(x+9,y+2,4,6,'#8fc46e');rect(x+6,y,4,5,'#9bd37a');rect(x+3,y+2,4,4,'#f2a26c');
 // saddle
 rect(x+5,y+7,7,3,'#edbd70');rect(x+6,y+6,5,2,'#ffe0a0');rect(x+3,y+15,3,5,'#267a75');rect(x+13,y+15,3,5,'#267a75');rect(x+4,y+19,4,2,'#173c42');rect(x+12,y+19,4,2,'#173c42')}
function enemy(e){let x=Math.round(e.x-camera),y=e.y;if(x<-24||x>W+24)return;rect(x+4,y+3,11,10,'#6d6172');rect(x+2,y+6,15,7,'#93828a');rect(x+5,y+5,3,3,'#ff675d');rect(x+11,y+5,3,3,'#ff675d');rect(x+5,y+13,3,3,'#292d45');rect(x+12,y+13,3,3,'#292d45');rect(x+7,y,6,4,'#b79269')}
function draw(){bg();ground();for(const o of collectibles){if(o.got)continue;let x=o.x-camera;if(x<-10||x>W+10)continue;let y=o.y+Math.sin(frame*.1+o.bob)*3;rect(x+3,y,5,9,'#268c72');rect(x,y+3,11,7,'#f1d58a');rect(x+2,y+2,7,7,'#f9e6ae');rect(x+4,y+4,3,3,'#78b77a')}
 enemies.forEach(e=>e.alive&&enemy(e));for(const s of shots){let x=s.x-camera;rect(x,s.y,9,5,'#edcf73');rect(x+2,s.y-2,4,9,'#ffeeb4')}
 if(finish-camera>-18&&finish-camera<W+30){rect(finish-camera,103,5,83,'#4b4a56');rect(finish-camera-5,99,15,8,'#e5bf86');rect(finish-camera+5,73,2,33,'#ffecad');rect(finish-camera+7,75,10,2,'#fff7d5')}
 if(mounted){pipo(player.x-camera-4,player.y+8);lola(player.x-camera+4,player.y-1,player.face,true)}else lola(player.x-camera,player.y,player.face);
 if(flash>0){ctx.fillStyle=`rgba(255,235,180,${flash/20})`;ctx.fillRect(0,0,W,H);flash--}
 // vignette frame and hint
 rect(0,0,W,3,'#102532');rect(0,H-3,W,3,'#102532');if(player.x<260) {rect(7,205,123,12,'#172b37');ctx.fillStyle='#e8d7ab';ctx.font='7px monospace';ctx.fillText('LAS SIERRAS DEL VIENTO',12,214)}
 }
function physics(dt){frame++;const accel=mounted?.28:.22,max=mounted?2.45:1.65,fric=.78;
 if(keys.has('left')){player.vx-=accel;player.face=-1}if(keys.has('right')){player.vx+=accel;player.face=1}if(!keys.has('left')&&!keys.has('right'))player.vx*=fric;player.vx=Math.max(-max,Math.min(max,player.vx));
 if(keys.has('jump')&&player.on){player.vy=mounted?-5.1:-5.55;player.on=false;keys.delete('jump')}
 player.vy=Math.min(6,player.vy+.24);player.x=Math.max(0,Math.min(world-20,player.x+player.vx));let prev=player.y;player.y+=player.vy;player.on=false;
 const ph=mounted?25:22;for(const p of platforms){if(player.x+12>p.x&&player.x+1<p.x+p.w&&prev+ph<=p.y+4&&player.y+ph>=p.y&&player.vy>=0){player.y=p.y-ph;player.vy=0;player.on=true}}
 if(player.y>H+50)hurt();for(const e of enemies){if(!e.alive){continue}e.x+=e.dir*.38;if(Math.abs(e.x-player.x)<62)e.dir=Math.sign(player.x-e.x)||e.dir;if(Math.abs(e.x-player.x)<15&&player.y+20>e.y&&player.y<e.y+18){if(player.vy>0&&player.y+20<e.y+11){e.alive=false;score+=100;player.vy=-3;flash=8}else if(!player.inv)hurt()}}
 for(const s of shots){s.x+=s.dir*5;for(const e of enemies)if(e.alive&&Math.abs(s.x-e.x)<15){e.alive=false;s.dead=true;score+=150;flash=8}}shots=shots.filter(s=>!s.dead&&Math.abs(s.x-player.x)<260);
 for(const o of collectibles)if(!o.got&&Math.abs(player.x-o.x)<15&&Math.abs(player.y-o.y)<27){o.got=true;score+=25;flash=4}
 if(player.inv)player.inv--;camera=Math.max(0,Math.min(world-W,player.x-130));hud();if(player.x>=finish){win()}}
function hurt(){if(player.inv)return;mates--;player.inv=95;player.vy=-3;player.vx=-player.face*1.5;flash=14;hud();if(mates<=0)end(false)}
function win(){if(state!=='playing')return;state='won';if(window.PixelSurArcade?.submitScore)window.PixelSurArcade.submitScore(score+500);overlay('¡FARO ENCENDIDO!','Lola y Pipo guiaron la luz sobre las sierras.\nPuntaje final: '+(score+500),'VOLVER A JUGAR')}
function end(won){if(state!=='playing')return;state='over';overlay('SE APAGÓ EL MATE','Pipo encontró unas hojitas de yerba. ¡Probemos otra vez!','REINTENTAR')}
function overlay(title,msg,btn){ui.title.innerHTML=title;ui.message.textContent=msg;ui.start.textContent=btn;ui.overlay.classList.remove('hidden')}
function toggleMount(){mounted=!mounted;flash=5;hud()}
function gust(){if(state==='playing'&&shots.length<3)shots.push({x:player.x+player.face*12,y:player.y+8,dir:player.face})}
function keyDown(e){let k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup',' ','arrowdown'].includes(k))e.preventDefault();if(k==='arrowleft'||k==='a')keys.add('left');if(k==='arrowright'||k==='d')keys.add('right');if(k===' '||k==='arrowup'||k==='w')keys.add('jump');if(k==='x'&&!e.repeat&&state==='playing')toggleMount();if(k==='z'&&!e.repeat)gust();if(k==='p'&&!e.repeat&&state==='playing'){paused=!paused;overlay(paused?'PAUSA':'','Pulsa P para continuar','SEGUIR JUGANDO')}}
function keyUp(e){let k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.delete('left');if(k==='arrowright'||k==='d')keys.delete('right');if(k===' '||k==='arrowup'||k==='w')keys.delete('jump')}
window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',()=>keys.clear());ui.start.addEventListener('click',()=>{if(paused){paused=false;ui.overlay.classList.add('hidden')}else reset()});
for(const b of document.querySelectorAll('#touch button')){const key=b.dataset.key,down=e=>{e.preventDefault();if(key==='mount')toggleMount();else if(key==='gust')gust();else keys.add(key)},up=e=>{e.preventDefault();keys.delete(key)};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up)}
function loop(t){const dt=Math.min(.04,(t-last)/1000||0);last=t;if(state==='playing'&&!paused)physics(dt);draw();requestAnimationFrame(loop)}
overlay('LOLA Y PIPO<br>SALTO DEL SUR','Una aventura pixel art por las sierras del sur.\nSalta, explora y despierta el Faro del Viento.','COMENZAR AVENTURA');reset();state='title';ui.overlay.classList.remove('hidden');requestAnimationFrame(loop);
})();
