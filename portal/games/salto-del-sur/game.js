(()=>{
const c=document.querySelector('#game'),ctx=c.getContext('2d'),W=400,H=225,ui={overlay:document.querySelector('#overlay'),title:document.querySelector('#title'),message:document.querySelector('#message'),start:document.querySelector('#start'),mates:document.querySelector('#mates'),score:document.querySelector('#score'),mount:document.querySelector('#mount')};
ctx.imageSmoothingEnabled=false;
const atlas=new Image(),panorama=new Image();atlas.src='characters.png';panorama.src='pampas-background.png';
const keys=new Set(),platforms=[{x:0,y:187,w:500,h:38},{x:540,y:181,w:330,h:44},{x:900,y:186,w:410,h:39},{x:1350,y:178,w:360,h:47},{x:1750,y:187,w:400,h:38},{x:2190,y:180,w:430,h:45},{x:2670,y:188,w:450,h:37},{x:3170,y:178,w:390,h:47},{x:3610,y:187,w:490,h:38},{x:4200,y:181,w:500,h:44},{x:4740,y:188,w:500,h:37},{x:5270,y:181,w:470,h:44}];
for(const p of platforms) if(p.w>150) for(let i=70;i<p.w-25;i+=88) platforms.push({x:p.x+i,y:p.y-25-(i%3)*8,w:44,h:9,small:true});
const world=5700,finish=5530, collectibles=[];for(let x=190;x<world-180;x+=155)collectibles.push({x,y:120-(x%3)*7,got:false,bob:x%17});
let player, enemies, shots, camera=0,frame=0,score=0,mates=3,state='title',paused=false,mounted=false,last=0,flash=0;
function reset(){player={x:38,y:140,vx:0,vy:0,w:13,h:22,on:false,face:1,inv:0};enemies=[{x:650,dir:1},{x:1110,dir:-1},{x:1660,dir:1},{x:2250,dir:-1},{x:2910,dir:1},{x:3450,dir:-1},{x:3980,dir:1},{x:4590,dir:-1},{x:5100,dir:1}].map(e=>({...e,y:(platforms.find(p=>e.x>=p.x&&e.x<p.x+p.w)?.y||185)-17,alive:true}));shots=[];collectibles.forEach(o=>o.got=false);camera=0;score=0;mates=3;mounted=false;frame=0;flash=0;state='playing';ui.overlay.classList.add('hidden');hud()}
function hud(){ui.mates.textContent='MATES '+'♥'.repeat(mates)+'♡'.repeat(3-mates);ui.score.textContent='PUNTOS '+String(score).padStart(5,'0');ui.mount.textContent='PIPO: '+(mounted?'MONTADOS':'LISTO')}
function rect(x,y,w,h,col){ctx.fillStyle=col;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function box(x,y,w,h,col,edge='#172634'){rect(x,y,w,h,edge);rect(x+1,y+1,w-2,h-2,col)}
function cloud(x,y,s){rect(x,y+4,30*s,7*s,'#edbd9c');rect(x+7*s,y,17*s,6*s,'#edbd9c');rect(x+4*s,y+10*s,23*s,2*s,'#d98e84')}
function bg(){let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#203758');g.addColorStop(.65,'#ed9879');g.addColorStop(1,'#f3c17d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(panorama.complete&&panorama.naturalWidth){const tile=760,h=253,off=-((camera*.17)%tile);for(let x=off-tile;x<W+tile;x+=tile)ctx.drawImage(panorama,x,0,tile,h);}
 else {rect(305-camera*.08%440,32,24,24,'#ffe1a1');cloud(45-camera*.1%460,36,1);cloud(230-camera*.07%460,53,.75);cloud(340-camera*.11%490,25,.65);for(let layer=0;layer<3;layer++){let span=130+layer*48,off=-(camera*(.13+layer*.12))%span;for(let x=off-span;x<W+span;x+=span){let base=132+layer*17;rect(x,base,span,80,['#ad7380','#765d72','#4d6066'][layer]);rect(x+span*.3,base-28-layer*5,span*.35,32+layer*5,['#ad7380','#765d72','#4d6066'][layer]);rect(x+span*.6,base-16,span*.24,20,['#ad7380','#765d72','#4d6066'][layer]);}}}
 // A distant stone beacon marks the goal while the hills drift behind it.
 let bx=(276-camera*.18%W+W)%W;rect(bx,85,17,58,'#947a70');rect(bx-4,79,25,9,'#d6a17c');rect(bx+5,70,7,10,'#f5d18b');rect(bx+7,59,3,12,'#fff0b7');rect(bx+2,99,4,8,'#273a45');rect(bx+10,99,4,8,'#273a45');
 // Wind sprites and tiny fireflies add motion to the valley.
 for(let i=0;i<12;i++){const x=(i*43-camera*.28+W*3)%(W+8),y=112+(i*29%58);const flick=(frame+i*7)%26<13;rect(x,y,2,2,flick?'#fff0ae':'#f1b982');if(flick)rect(x-2,y,6,1,'#f5dfa0');}
}
function ground(){for(const p of platforms){let x=Math.round(p.x-camera);if(x+p.w<0||x>W)continue;rect(x,p.y,p.w,p.h,'#263f3d');rect(x,p.y,p.w,4,'#a4c47a');rect(x,p.y+4,p.w,p.h-4,'#365e56');rect(x,p.y+8,p.w,p.h-8,'#2e514d');for(let k=0;k<p.w;k+=17){rect(x+k,p.y+10+(k%3)*5,7,2,'#557b61');rect(x+k+6,p.y+p.h-5,4,2,'#233f43');if(!p.small&&k%34===0){const sway=Math.round(Math.sin(frame*.09+k)*2);rect(x+k+3,p.y-3+sway,2,4,'#c3d28b');rect(x+k+1,p.y-5+sway,3,2,'#7cb276');rect(x+k+5,p.y-6+sway,3,2,'#e9c17b');rect(x+k+2,p.y-8+sway,2,3,'#f1d990')}}if(p.small){rect(x,p.y+7,p.w,2,'#233d42');rect(x+4,p.y-2,6,2,'#d2b28c')}}}
function sprite(sheet,col,row,x,y,w,h,dir=1){if(!sheet.complete||!sheet.naturalWidth)return false;const cw=sheet.width/4,ch=sheet.height/2;ctx.save();if(dir<0){ctx.translate(Math.round(x+w),Math.round(y));ctx.scale(-1,1);ctx.drawImage(sheet,col*cw,row*ch,cw,ch,0,0,w,h)}else ctx.drawImage(sheet,col*cw,row*ch,cw,ch,Math.round(x),Math.round(y),w,h);ctx.restore();return true}
function lola(x,y,dir,ride=false){const col=player?.on?(Math.abs(player.vx)>.2?(Math.floor(frame/7)%2?1:2):0):3;if(atlas.complete&&atlas.naturalWidth){sprite(atlas,col,0,x-12,y-18,38,43,dir);if(ride){rect(x-3,y+15,13,2,'#a86c48');}return}ctx.save();ctx.translate(Math.round(x),Math.round(y));if(dir<0){ctx.translate(13,0);ctx.scale(-1,1)}let step=Math.sin(frame*.22)>0?1:0;
 // backpack and scarf
 rect(1,8,4,8,'#b9754f');rect(3,5,9,10,'#43b9b9');rect(4,6,7,7,'#66d4c8');rect(2,8,4,3,'#f28a68');
 // head hair/face
 rect(3,0,8,3,'#292b42');rect(1,2,11,6,'#352f49');rect(3,3,8,6,'#edb887');rect(3,3,2,3,'#352f49');rect(9,5,2,2,'#28364b');rect(7,7,3,1,'#9d5851');
 // shirt and legs
 rect(3,9,9,7,'#4e9cc2');rect(2,11,3,4,'#f17b63');rect(4,15,3,5,'#27364c');rect(8,15,3,5,'#27364c');if(step){rect(3,19,5,2,'#e4c895');rect(8,19,5,2,'#394153')}else{rect(2,19,5,2,'#394153');rect(8,19,5,2,'#e4c895')}
 if(ride){rect(3,7,8,2,'#e9cf98')}ctx.restore()}
function pipo(x,y){let bounce=Math.round(Math.sin(frame*.15)*1);x=Math.round(x);y=Math.round(y+bounce);const col=player?.on?(Math.abs(player.vx)>.2?(Math.floor(frame/7)%2?1:2):0):3;if(atlas.complete&&atlas.naturalWidth){sprite(atlas,col,1,x-17,y-4,49,37,player?.face||1);return}
 // tail and body
 rect(x-4,y+10,6,4,'#318f84');rect(x+2,y+8,13,9,'#36b4a8');rect(x+7,y+6,10,8,'#48cec0');rect(x+13,y+3,8,8,'#48cec0');rect(x+18,y+5,7,3,'#f2cb7d');rect(x+16,y+1,3,3,'#173542');rect(x+12,y+9,7,5,'#b1e1a2');
 // feather crest
 rect(x+9,y+2,4,6,'#8fc46e');rect(x+6,y,4,5,'#9bd37a');rect(x+3,y+2,4,4,'#f2a26c');
 // saddle
 rect(x+5,y+7,7,3,'#edbd70');rect(x+6,y+6,5,2,'#ffe0a0');rect(x+3,y+15,3,5,'#267a75');rect(x+13,y+15,3,5,'#267a75');rect(x+4,y+19,4,2,'#173c42');rect(x+12,y+19,4,2,'#173c42')}
function enemy(e){let x=Math.round(e.x-camera),y=e.y;if(x<-28||x>W+28)return;const bob=Math.round(Math.sin(frame*.11+e.x)*2),blink=(frame+e.x)%83<5; y+=bob;
 // Tiny wind-worn stone guardian, with a glowing amber core.
 rect(x+7,y-3,8,4,'#d6a66f');rect(x+4,y+1,14,4,'#887a78');rect(x+2,y+5,18,8,'#a99b89');rect(x+5,y+6,12,6,'#c2b59a');rect(x+2,y+11,18,5,'#766e76');rect(x+5,y+8,3,3,blink?'#fff1ad':'#f3ad63');rect(x+13,y+8,3,3,blink?'#fff1ad':'#f3ad63');rect(x+7,y+14,3,4,'#353d4a');rect(x+14,y+14,3,4,'#353d4a');rect(x+8,y+4,4,2,'#e2c390');rect(x+1,y+7,3,2,'#d4a46b');rect(x+18,y+7,3,2,'#d4a46b');rect(x+4,y+16,4,2,'#293a43');rect(x+14,y+16,4,2,'#293a43');
 if(Math.abs(player.x-e.x)<62){rect(x-4,y+8,3,1,'#d8f5dc');rect(x-6,y+6,2,1,'#d8f5dc')}
}
function draw(){bg();ground();for(const o of collectibles){if(o.got)continue;let x=o.x-camera;if(x<-10||x>W+10)continue;let y=o.y+Math.sin(frame*.1+o.bob)*3;rect(x+3,y+1,3,9,'#287c63');rect(x,y+4,5,4,'#58a66d');rect(x+5,y+2,7,9,'#f0c96f');rect(x+7,y+4,6,7,'#fff0aa');rect(x+8,y+6,3,3,'#7db984');if((frame+o.bob)%38<4)rect(x+12,y-2,2,2,'#fff1bd')}
 enemies.forEach(e=>e.alive&&enemy(e));for(const s of shots){let x=s.x-camera,sp=Math.sin(frame*.5);rect(x-7,s.y+2,7,2,'#a8e2d3');rect(x-3,s.y-1,5,2,'#e7db9f');rect(x+1,s.y,8,6,'#f3d481');rect(x+4,s.y-2,5,3,'#fff2be');rect(x+4,s.y+2,3,2,'#d69760');if(sp>0)rect(x+7,s.y-3,3,2,'#fff1bb')}
 if(finish-camera>-24&&finish-camera<W+30){let fx=finish-camera;rect(fx-5,121,33,7,'#785e54');rect(fx,92,22,8,'#d1ad84');rect(fx+3,97,16,69,'#9e806d');rect(fx+7,104,8,45,'#42545a');rect(fx+9,106,4,41,'#f5df9c');rect(fx+8,89,12,4,'#e8c38c');rect(fx+10,76,8,13,'#a98667');rect(fx+12,72,4,8,'#f3d17c');rect(fx+13,57,2,17,'#fff1c2');rect(fx+4,154,13,3,'#d7ad76');rect(fx+2,160,17,3,'#6d5b58');if(frame%30<15){rect(fx+20,74,9,2,'#fff0b5');rect(fx+26,72,2,6,'#fff0b5')}}
 if(mounted){pipo(player.x-camera-7,player.y+8);lola(player.x-camera+8,player.y-10,player.face,true)}else{pipo(player.x-camera-34,player.y+1);lola(player.x-camera,player.y,player.face)}
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
