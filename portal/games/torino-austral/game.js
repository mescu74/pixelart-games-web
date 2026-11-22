(()=>{'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),W=960,H=540,skyline=232,finish=6800;
ctx.scale(1.5,1.5);ctx.imageSmoothingEnabled=false;
const landscape=new Image();landscape.src='landscape.png';
const steppe=new Image();steppe.src='steppe.png';
const torinoSprite=new Image();torinoSprite.src='torino.png';
let state='title',route=0,score=0,travel=0,speed=0,steer=0,mates=3,objects=[],particles=[],last=0,spawnAt=0,invulnerable=0,flash=0,toast='',toastTill=0,shake=0,distSinceMate=0;
const keys=new Set(),routes=[{name:'RUTA DE LOS SIETE LAGOS',sub:'CORDILLERA · BARILOCHE → EL CHALTÉN',tint:'rgba(27,90,117,.08)'},{name:'RUTA DEL VIENTO',sub:'ESTEPA · EL BOLSÓN → PERITO MORENO',tint:'rgba(181,87,59,.07)'}];
function reset(){state='drive';score=0;travel=0;speed=72;steer=0;mates=3;objects=[];particles=[];spawnAt=1.4;invulnerable=0;flash=0;shake=0;distSinceMate=0;toast='¡RUTA ABIERTA!';toastTill=performance.now()+1700}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))}
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill()}
function bg(){const image=route===1?steppe:landscape;if(image.complete&&image.naturalWidth)ctx.drawImage(image,0,0,W,H);else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e86f68');g.addColorStop(.48,'#f4b866');g.addColorStop(1,'#9b794c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}ctx.fillStyle=routes[route].tint;ctx.fillRect(0,0,W,H)}
function bend(t){return Math.sin(travel*.00038+t*1.45)*44*t+Math.sin(travel*.00014+t*2.8)*16*t}
function roadHalf(t){return 18+t*382}
function road(){
 // Stable vanishing point aligned with the mountain foothills. Build the road
 // in shallow scanlines so its shoulders widen evenly toward the camera.
 const bands=82;
 for(let i=0;i<bands;i++){
  const t=(i+.5)/bands,y=skyline+t*(H-skyline),h=roadHalf(t),cx=W/2+bend(t),row=(H-skyline)/bands+1;
  rect(cx-h-18-t*5,y,18+t*5,row,'#927c64');
  rect(cx-h-13-t*4,y,13+t*4,row,i%2?'#d9c18e':'#c7b182');
  rect(cx-h,y,h*2,row,'#41464a');
  rect(cx-h+2,y,Math.max(1,2+t*2),row,'#686a68');
  rect(cx+h-2-t*2,y,Math.max(1,2+t*2),row,'#686a68');
  rect(cx+h,y,13+t*4,row,i%2?'#d9c18e':'#c7b182');
  rect(cx+h+13+t*4,y,18+t*5,row,'#927c64');
 }
 // Two restrained center dashes establish lane direction and scale.
 for(let n=0;n<19;n++){
  const z=((n/19+((travel*.00072)%1))%1),t=z*z,y=skyline+t*(H-skyline),cx=W/2+bend(t),h=roadHalf(t),w=1+t*3;
  if(n%2===0)for(const lane of [-1,1])rect(cx+lane*h/3-w/2,y,w,1+t*15,'#eee2c2');
 }
 // Short edge marks follow the road curve rather than floating over the scenery.
 for(let i=0;i<20;i++){
  const z=((i/20+((travel*.00043)%1))%1),t=z*z,y=skyline+t*(H-skyline),cx=W/2+bend(t),h=roadHalf(t),w=1+t*3;
  rect(cx-h-w-1,y,w,1+t*7,i%2?'#eee2c2':'#d6ad67');
  rect(cx+h+1,y,w,1+t*7,i%2?'#eee2c2':'#d6ad67');
 }
}
function roadside(){
 for(let i=0;i<12;i++){
  const z=((i/12+travel*.00018)%1),t=z*z,x=W/2+bend(t),y=skyline+t*(H-skyline),h=roadHalf(t),s=3+t*39;
  for(const side of [-1,1]){
   const tx=x+side*(h+24+t*8);
   if(i%4===0){
    // Layered lenga and cypress silhouettes at the roadside.
    rect(tx-s*.09,y-s*.48,s*.18,s*.48,'#49382d');
    poly([[tx-s*.48,y-s*.30],[tx,y-s*1.02],[tx+s*.48,y-s*.30]],'#29423c');
    poly([[tx-s*.38,y-s*.52],[tx,y-s*1.22],[tx+s*.38,y-s*.52]],'#3d5b4b');
    rect(tx-s*.05,y-s*.88,s*.1,s*.08,'#78906b');
   }else{
    // Argentine highway delineator with a metal post and reflective cap.
    rect(tx-s*.07,y-s*.80,s*.14,s*.80,'#6b6457');
    rect(tx-s*.19,y-s*.60,s*.38,s*.20,'#ddd2ae');
    rect(tx-s*.15,y-s*.57,s*.14,s*.11,side<0?'#d45e4b':'#f0e2c0');
    rect(tx-s*.09,y-s*.08,s*.18,s*.08,'#413c35');
   }
  }
 }
}
function car(x,y,s,color='#167d82',kind='torino'){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(s,s);if(kind==='torino'){// pixel-built original Torino rear silhouette
 rect(-4,-2,8,3,'#07131b');rect(-15,-22,30,37,'#101921');rect(-13,-23,26,35,color);rect(-11,-25,22,5,'#55b4aa');rect(-10,-18,20,6,'#d9c58a');rect(-11,-12,22,5,color);rect(-13,-8,4,9,'#bd4d3e');rect(9,-8,4,9,'#bd4d3e');rect(-11,2,22,4,'#d8d4bd');rect(-14,8,5,9,'#131b22');rect(9,8,5,9,'#131b22');rect(-8,12,16,3,'#e9dec3');rect(-5,-20,10,3,'#24434a');rect(-4,-19,3,2,'#90c5bc');}
 else if(kind==='pickup'){
  rect(-17,-11,5,20,'#171c20');rect(12,-11,5,20,'#171c20');
  poly([[-13,-27],[-9,-30],[9,-30],[13,-25],[15,8],[11,13],[-11,13],[-15,8]],'#172027');
  poly([[-12,-25],[-8,-29],[8,-29],[12,-24],[12,-14],[-12,-14]],color);
  rect(-9,-26,18,8,'#283b45');rect(-5,-25,2,7,'#6f8b8b');rect(3,-25,2,7,'#6f8b8b');
  rect(-11,-13,22,3,'#d6c28e');rect(-10,-9,20,13,color);
  rect(-8,-7,16,8,'#705c46');rect(-7,-6,14,2,'#a48a62');rect(-7,-1,14,2,'#493e34');
  rect(-13,0,4,8,'#c7473d');rect(9,0,4,8,'#c7473d');rect(-10,8,20,3,'#e4deca');rect(-6,9,12,3,'#faf3d9');
 }
 else if(kind==='van'){
  rect(-17,-11,5,21,'#171c20');rect(12,-11,5,21,'#171c20');
  poly([[-15,-27],[-11,-31],[11,-31],[15,-27],[16,7],[12,13],[-12,13],[-16,7]],'#172027');
  poly([[-13,-26],[-10,-29],[10,-29],[13,-25],[13,-13],[-13,-13]],color);
  rect(-10,-25,20,9,'#283d49');rect(-8,-24,7,7,'#6d8b91');rect(1,-24,7,7,'#6d8b91');
  rect(-12,-12,24,17,color);rect(-13,-6,26,3,'#d8c796');
  rect(-14,0,4,8,'#c7473d');rect(10,0,4,8,'#c7473d');rect(-10,8,20,3,'#ddd8c5');rect(-6,9,12,3,'#f8f0d7');
  rect(-8,-9,16,2,'#ffffff55');
 }
 else {
  // Rear view of a small car ahead: wheels, shoulder line, rear glass,
  // tail lamps and bumper remain legible as it scales toward the player.
  rect(-15,-11,5,20,'#171c20');rect(10,-11,5,20,'#171c20');
  rect(-13,-23,26,36,'#172027');
  poly([[-13,-15],[-10,-24],[-6,-29],[6,-29],[10,-24],[13,-15],[14,7],[10,12],[-10,12],[-14,7]],color);
  rect(-8,-25,16,3,'#f4d89b');rect(-6,-22,12,2,'#fff0c8');
  poly([[-8,-20],[-5,-26],[5,-26],[8,-20],[7,-11],[-7,-11]],'#263b46');
  rect(-5,-24,2,10,'#6e8b8e');rect(3,-24,2,10,'#6e8b8e');rect(-7,-13,14,3,'#bad0c8');
  rect(-11,-9,22,3,'#21323a');rect(-12,-5,24,3,'#18242b');
  rect(-12,-2,4,9,'#c7473d');rect(8,-2,4,9,'#c7473d');
  rect(-11,0,2,4,'#ffb77b');rect(9,0,2,4,'#ffb77b');
  rect(-6,-1,12,6,'#c7b98f');rect(-4,0,8,3,'#e4dcc2');
  rect(-14,8,28,4,'#c5c4b8');rect(-12,11,24,2,'#eef0df');
  rect(-7,-28,14,2,'#ffffff44');
 }
 ctx.restore()}
function itemIcon(x,y,s){ctx.save();ctx.translate(x,y);ctx.scale(s,s);rect(-4,-7,8,12,'#b97a4e');rect(-5,-8,10,3,'#efcc82');rect(2,-10,3,4,'#e3e3bf');rect(1,-4,5,6,'#6b8b65');rect(-3,-5,2,2,'#f3e7bd');ctx.restore()}
function paintObjects(){for(const o of objects){const d=o.d-travel;if(d<0||d>1750)continue;const z=1-d/1750,t=z*z,y=skyline+t*(H-skyline),cx=W/2+bend(t),half=roadHalf(t),x=cx+o.lane*half*.68,s=.22+t*.92;if(o.type==='mate'){ctx.save();ctx.globalAlpha=.65+t*.35;ctx.shadowColor='#f6d37b';ctx.shadowBlur=8+t*14;itemIcon(x,y-14*t,s);ctx.restore();if(t>.35){rect(x-25*t,y-35*t,50*t,3,'#121a20');rect(x-25*t,y-35*t,50*t*(1-(d/1750)) ,3,'#f4d17c')}}else car(x,y-22*t,s,o.color,o.vehicle||'traffic')}}
function drawPlayer(){const x=W/2+steer*245,y=H-79;ctx.save();if(invulnerable>0&&Math.floor(invulnerable*12)%2===0)ctx.globalAlpha=.35;ctx.fillStyle='#15212b88';ctx.beginPath();ctx.ellipse(x,y+12,29,10,0,0,Math.PI*2);ctx.fill();if(torinoSprite.complete&&torinoSprite.naturalWidth)ctx.drawImage(torinoSprite,x-38,y-36,76,67);else car(x,y,1.45,'#147d83','torino');ctx.restore();if(speed>155){for(let i=0;i<4;i++){rect(x-42-i*10,y+8+((travel+i*21)%27),2,8,'#f5cd7c66');rect(x+40+i*10,y+8+((travel+i*21)%27),2,8,'#f5cd7c66')}}}
function spawn(){const d=travel+1500+Math.random()*400,roll=Math.random();if(roll<.23&&distSinceMate>1000){objects.push({type:'mate',lane:Math.floor(Math.random()*3)-1,d});distSinceMate=0}else{objects.push({type:'traffic',vehicle:['traffic','pickup','van'][Math.floor(Math.random()*3)],lane:Math.floor(Math.random()*3)-1,d,color:['#d45b45','#e3bf73','#668ec1','#87a676','#d2d0c1'][Math.floor(Math.random()*5)]});distSinceMate+=900}}
function particlesAt(x,y,color){for(let i=0;i<22;i++)particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*4,color,life:.5+Math.random()*.5})}
function crash(){if(invulnerable>0)return;mates--;speed=58;invulnerable=2.1;flash=.32;shake=15;particlesAt(W/2+steer*245,H-70,'#ffd37b');toast=mates?'¡GOLPAZO! MATE Y SEGUIMOS':'¡SE TERMINÓ EL MATE!';toastTill=performance.now()+1500;if(mates<=0)end(false)}
function end(win){state=win?'win':'over';speed=0;score+=win?3500:0;window.PixelSurArcade?.submitScore(Math.floor(score))}
function update(dt){if(state!=='drive')return;speed=Math.max(62,Math.min(205,speed+(keys.has('gas')?58:-12)*dt-(keys.has('brake')?115*dt:0)));const handling=.85+speed/160;steer=Math.max(-1.12,Math.min(1.12,steer+((keys.has('left')?-1:0)+(keys.has('right')?1:0))*dt*handling));if(Math.abs(steer)>1){speed=Math.max(60,speed-38*dt);score=Math.max(0,score-2)}const ds=speed*dt;travel+=ds;score+=ds*.42;spawnAt-=dt;if(spawnAt<=0){spawn();spawnAt=Math.max(.56,1.25-(travel/finish)*.48)+Math.random()*.35}invulnerable=Math.max(0,invulnerable-dt);flash=Math.max(0,flash-dt);shake=Math.max(0,shake-dt*30);
 for(const o of objects){const d=o.d-travel;if(d<130&&d>0){if(Math.abs(steer-o.lane*.68)<.24){if(o.type==='mate'){if(mates<3){mates++;toast='¡MATE DE RUTA! +1 VIDA';toastTill=performance.now()+1300;particlesAt(W/2+steer*245,H-86,'#b6df8a')}else{score+=250;toast='MATE GUARDADO · +250';toastTill=performance.now()+900}o.d=-999}else crash();o.d=-999}}}objects=objects.filter(o=>o.d>travel-80);if(travel>=finish)end(true)}
function bar(x,y,w,pct,c){rect(x,y,w,8,'#101820');rect(x+2,y+2,(w-4)*Math.max(0,Math.min(1,pct)),4,c);rect(x,y,w,1,'#f4e5c6')}
function hud(){// distance ribbon
 rect(18,15,278,69,'#101a20dd');rect(18,15,278,3,'#e6bb70');ctx.fillStyle='#f4d28c';ctx.font='bold 13px monospace';ctx.fillText('TORINO AUSTRAL',31,37);ctx.fillStyle='#a8d5c5';ctx.font='9px monospace';ctx.fillText(routes[route].sub,31,53);ctx.fillStyle='#f5e9cc';ctx.font='bold 14px monospace';ctx.fillText(`${Math.max(0,Math.floor(travel)).toLocaleString('es-AR')} / 6.800 KM`,31,73);
 rect(729,15,213,69,'#101a20dd');rect(729,15,213,3,'#e6bb70');ctx.fillStyle='#a8d5c5';ctx.font='9px monospace';ctx.fillText('VELOCIDAD',744,37);ctx.fillStyle='#fff1d1';ctx.font='bold 21px monospace';ctx.fillText(`${Math.round(speed)} km/h`,744,65);bar(850,54,78,speed/205,speed>175?'#e9785d':'#84c7a1');
 rect(380,16,197,43,'#101a20cc');ctx.fillStyle='#c2dba2';ctx.font='9px monospace';ctx.fillText('MATES',395,33);for(let i=0;i<3;i++){const x=453+i*32;itemIcon(x,44,.9);if(i>=mates)rect(x-7,35,15,16,'#14212bc9')}
 // road destination marker
 let p=Math.min(1,travel/finish);rect(391,70,176,3,'#101a20aa');rect(391,70,176*p,3,'#f1c779');rect(390+174*p,67,3,9,'#fff0c6');}
function overlay(){if(state==='title'||state==='over'||state==='win'||state==='paused'){rect(0,0,W,H,'#07121cc9');rect(178,80,604,382,'#13222ced');rect(182,84,596,374,'#21313b');rect(186,88,588,366,'#101b24');rect(186,88,588,3,'#e9bd73');ctx.textAlign='center';ctx.fillStyle='#f1cf89';ctx.font='bold 37px monospace';ctx.fillText(state==='title'?'TORINO AUSTRAL':state==='paused'?'PARADA EN LA RUTA':state==='win'?'¡LLEGASTE AL SUR!':'¡BANDERA A CUADROS!',480,142);ctx.fillStyle='#a9d4c5';ctx.font='12px monospace';ctx.fillText(state==='title'?'UNA CARRERA ARCADE POR LA PATAGONIA':state==='win'?'EL VIENTO, LA RUTA Y EL TORINO. QUÉ VIAJE.':'UN VIAJE MÁS, CON MATE Y SIN APURO',480,169);
 if(state==='title'){ctx.drawImage(landscape,236,190,488,152);rect(236,190,488,152,'#08162044');ctx.fillStyle='#f8e7bf';ctx.font='bold 11px monospace';ctx.fillText('ELEGÍ TU CAMINO',480,370);const cards=[['1','SIETE LAGOS','CURVAS DE CORDILLERA'],['2','RUTA DEL VIENTO','ESTEPA HASTA EL CHALTÉN']];cards.forEach((a,i)=>{const x=262+i*226;rect(x,383,211,39,i===route?'#d4ae70':'#263941');ctx.fillStyle=i===route?'#18242a':'#f4e6c5';ctx.font='bold 10px monospace';ctx.fillText(`${a[0]}  ${a[1]}`,x+105,399);ctx.font='8px monospace';ctx.fillText(a[2],x+105,413)});ctx.fillStyle='#bad8c5';ctx.font='10px monospace';ctx.fillText('A / D ELEGIR RUTA · ENTER ARRANCAR · FLECHAS MANEJAR · ↑ ACELERAR · ↓ FRENAR',480,444)}else{ctx.fillStyle='#f5e9ce';ctx.font='bold 17px monospace';ctx.fillText(state==='paused'?'P PARA VOLVER A LA RUTA':`PUNTAJE  ${Math.floor(score).toLocaleString('es-AR')}  ·  ${Math.floor(travel).toLocaleString('es-AR')} KM`,480,230);if(state!=='paused'){ctx.fillStyle='#e6bb70';ctx.fillRect(362,280,236,49);ctx.fillStyle='#1b2830';ctx.font='bold 14px monospace';ctx.fillText(state==='win'?'REPETIR EL VIAJE':'VOLVER A LA RUTA',480,310);ctx.fillStyle='#a9d4c5';ctx.font='10px monospace';ctx.fillText('ENTER / TOCÁ PARA JUGAR OTRA VEZ',480,357)}}ctx.textAlign='left'}}
function draw(dt){ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);bg();road();roadside();paintObjects();drawPlayer();hud();ctx.fillStyle='#dfb56e';ctx.fillRect(0,H-5,W,5);ctx.fillStyle='#fff0c5';ctx.fillRect(0,H-5,W,2);for(const p of particles){rect(p.x,p.y,4,4,p.color);p.x+=p.vx;p.y+=p.vy;p.life-=dt}particles=particles.filter(p=>p.life>0);if(flash>0)rect(0,0,W,H,`rgba(255,225,175,${flash})`);if(toast&&performance.now()<toastTill&&state==='drive'){rect(328,420,304,34,'#101a20df');ctx.textAlign='center';ctx.fillStyle='#ffe19b';ctx.font='bold 12px monospace';ctx.fillText(toast,W/2,442);ctx.textAlign='left'}overlay();ctx.restore()}
function frame(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;update(dt);draw(dt);requestAnimationFrame(frame)}
function keydown(e){let k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' ','enter'].includes(k))e.preventDefault();if(state==='title'){if(k==='arrowleft'||k==='a')route=0;if(k==='arrowright'||k==='d')route=1;if(k==='1')route=0;if(k==='2')route=1;if(k==='enter'||k===' ')reset();return}if((state==='over'||state==='win')&&(k==='enter'||k===' ')){reset();return}if(k==='p'){state=state==='drive'?'paused':state==='paused'?'drive':state;return}if(k==='arrowleft'||k==='a')keys.add('left');if(k==='arrowright'||k==='d')keys.add('right');if(k==='arrowup'||k==='w')keys.add('gas');if(k==='arrowdown'||k==='s')keys.add('brake')}
function keyup(e){const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.delete('left');if(k==='arrowright'||k==='d')keys.delete('right');if(k==='arrowup'||k==='w')keys.delete('gas');if(k==='arrowdown'||k==='s')keys.delete('brake')}
window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',()=>keys.clear());canvas.addEventListener('pointerdown',()=>{if(state==='title'||state==='over'||state==='win')reset();else if(state==='paused')state='drive'});
for(const b of document.querySelectorAll('#touch button')){const key=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(key)});for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,e=>{e.preventDefault();keys.delete(key)})}
requestAnimationFrame(frame);
})();
