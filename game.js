'use strict';
const {CENTER:C,SIZE,RINGS,geo,distance,radial,project,MISSIONS,CityMap}=BA;
const $=s=>document.querySelector(s),W=960,H=600,SAVE='ba-invadida-v2';
let city,world,arcade,state=BA.initial(),started=false,modalOpen=false,mapOpen=false,soundOn=false,audio,route=[],saveAvailable=true;
const NAV=StreetNavigation;
const held={up:false,down:false,left:false,right:false,fire:false,action:false};
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),4200);}
function beep(freq=440,length=.08,type='square'){if(!soundOn)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();let o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+length);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+length);}catch{}}
function save(){if(!world||!started)return;state.x=world.hero.x;state.y=world.hero.y;state.discovered=[...world.discovered];try{localStorage.setItem(SAVE,JSON.stringify(state));}catch{if(saveAvailable){saveAvailable=false;toast('El navegador no permite guardar. La partida sigue en esta pestaña.');}}}
function sync(){
 $('.fire-touch').textContent=arcade?'DISPARAR':'CORRER';
 const street=started&&!arcade;$('.screen').classList.toggle('street-view',street);$('#street-guide').classList.toggle('hidden',!street);$('#street-bottom').classList.toggle('hidden',!street);
 $('#mates').innerHTML=Array.from({length:3},(_,i)=>`<img class="mate-life ${i<state.mates?'':'empty'}" src="assets/${i<state.mates?'mate-icon':'mate-empty'}.png" alt="" width="32" height="32">`).join('');$('#mates').setAttribute('aria-label',`${state.mates} de 3 mates`);$('#inventory').innerHTML=`<span><img src="assets/thermos.png" alt="Termos" width="24" height="24"> ${state.thermos}</span><span><img src="assets/yerba.png" alt="Yerba" width="24" height="24"> ${state.yerba}</span>`;$('#progress').textContent=`${Math.min(4,state.stage)} / 4`;
 const m=MISSIONS[Math.min(4,state.stage)];$('#mission-number').textContent=String(Math.min(5,state.stage+1)).padStart(2,'0');$('#mission-title').textContent=state.won?'¡Buenos Aires liberada!':m.name;$('#mission-copy').textContent=state.won?'El Obelisco vuelve a ser nuestro. Podés seguir explorando la ciudad.':m.copy;$('#mode').textContent=arcade?'ARCADE / '+m.label:'EXPLORACIÓN / '+String(Math.min(5,state.stage+1)).padStart(2,'0');
 $('#chapters').querySelectorAll('li').forEach((li,i)=>{li.classList.toggle('done',i<state.stage);li.classList.toggle('active',i===state.stage);});
}
function showModal(tag,title,copy,label,action){world?.stopWalking();modalOpen=true;$('#modal-tag').textContent=tag;$('#modal-title').textContent=title;$('#modal-copy').textContent=copy;$('#modal-action').textContent=label;$('#modal').classList.remove('hidden');$('#modal-action').onclick=()=>{modalOpen=false;$('#modal').classList.add('hidden');action?.();};}
function brew(){toast(BA.brew(state));beep(380);sync();world?.findRoute();world?.paintNavigation();save();}
function toggleMap(){if(!started||arcade||modalOpen)return;mapOpen=!mapOpen;if(mapOpen)world.stopWalking();$('#map-panel').classList.toggle('hidden',!mapOpen);if(mapOpen)drawMap($('#bigmap'),true);}
const textStyle={fontFamily:'monospace',fontSize:'10px',color:'#c6cbd0',stroke:'#111a28',strokeThickness:3};
class BuenosAires extends Phaser.Scene{
 constructor(){super('city');}
 preload(){this.load.json('map','map-data.json');PixelAssets.preload(this);}
 create(){
  world=this;try{city=new CityMap(this.cache.json.get('map'));}catch(e){$('#load-error').textContent='No se pudo cargar el mapa. Recargá la página.';console.error(e);return;}
  PixelAssets.install(this);this.discovered=new Set();this.pickupSprites=[];this.blocked=new Set();this.decor=[];this.lastTick=0;this.lastRoute=0;this.lastSave=0;this.warnAt=0;this.nextHit=0;this.walkPoints=[];this.walkStuck=0;this.navGoal=null;
  try{const saved=JSON.parse(localStorage.getItem(SAVE));if(BA.validSave(saved)){state=saved;this.discovered=new Set(saved.discovered);}}catch{}
  this.targets=MISSIONS.map(m=>city.nearest(geo(m.lat,m.lon),true));
  this.spawn=city.nearest(geo(-34.6095,-58.394),true);
  // Permanent wrecks produce detours; protect a verified route through every mission.
  for(const e of city.edges){if(e.length>65&&radial(e.a)<2100&&e.id%29===0)this.blocked.add(e.id);}
  let previous=this.spawn;for(let i=0;i<5;i++){let p=city.path(previous,this.targets[i],i);for(let j=1;j<p.length;j++){for(const l of p[j-1].links)if(l.node===p[j])this.blocked.delete(l.edge.id);}previous=this.targets[i];}
  this.paintCity();
  this.wrecks=this.add.graphics().setDepth(3);this.gateGraphics=this.add.graphics().setDepth(3);this.paintBarriers();
  this.targetMarkers=this.targets.map((p,i)=>{const box=PixelAssets.animate(this.add.sprite(p.x,p.y,'terminal').setScale(1.25).setDepth(5),'terminal'),label=this.add.text(p.x,p.y-38,`${String(i+1).padStart(2,'0')} / ${MISSIONS[i].place.toUpperCase()}`,{...textStyle,fontSize:'9px',color:'#a8e8f5'}).setOrigin(.5).setDepth(6);return{box,label};});
  const start=state.x==null?this.spawn:{x:state.x,y:state.y};let safe=city.nearest(start,true);if(!safe||radial(safe)<RINGS[Math.min(state.stage,4)]-5)safe=this.spawn;
  this.hero=this.add.sprite(safe.x,safe.y,'porteño').setScale(1.5).setDepth(12);this.shadow=this.add.ellipse(safe.x,safe.y+22,25,10,0x070a12,.4).setDepth(11);
  this.cameras.main.setBounds(0,0,SIZE,SIZE);this.cameras.main.setZoom(1.9);this.cameras.main.startFollow(this.hero,true,.14,.14);this.cameras.main.roundPixels=true;
  this.routeGraphics=this.add.graphics().setDepth(4);this.fog=this.add.graphics().setDepth(25);this.hint=this.add.text(W/2,H-32,'',{...textStyle,fontSize:'13px',backgroundColor:'#101827dd',padding:{x:12,y:8},color:'#f3d788'}).setOrigin(.5).setScrollFactor(0).setDepth(50);
  this.compass=this.add.text(W/2,35,'',{...textStyle,fontSize:'12px',backgroundColor:'#101827dc',padding:{x:12,y:7}}).setOrigin(.5).setScrollFactor(0).setDepth(50);
  this.hint.setVisible(false);this.compass.setVisible(false);
  this.playerHalo=this.add.ellipse(safe.x,safe.y+20,38,15,0x88e2ed,.2).setStrokeStyle(1,0xb5f8f2,.85).setDepth(10);
  this.playerLabel=this.add.text(safe.x,safe.y-33,'VOS',{...textStyle,fontSize:'8px',color:'#d5ffff',backgroundColor:'#203a46',padding:{x:3,y:2}}).setOrigin(.5).setDepth(14);
  this.goalBeacon=this.add.graphics().setDepth(9);this.goalLabel=this.add.text(0,0,'',{...textStyle,fontSize:'10px',color:'#ffe2a0',backgroundColor:'#25283b',padding:{x:5,y:4}}).setOrigin(.5).setDepth(10);
  this.tapMarker=this.add.graphics().setDepth(8);
  this.input.on('pointerdown',pointer=>{if(started&&!arcade&&!modalOpen&&!mapOpen)this.walkTo({x:pointer.worldX,y:pointer.worldY});});
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,C,M,SPACE,ESC');this.input.keyboard.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);
  this.input.keyboard.on('keydown-E',()=>this.interact());this.input.keyboard.on('keydown-C',()=>{if(started&&!arcade&&!modalOpen)brew();});this.input.keyboard.on('keydown-M',toggleMap);
  this.input.keyboard.on('keydown-ESC',()=>{if(mapOpen)toggleMap();else this.stopWalking();});
  this.makeSupplies();this.refreshMission();this.reveal();drawMap($('#minimap'));sync();
  $('#start').disabled=false;$('#start').textContent=state.x!=null?'CONTINUAR LA RESISTENCIA →':'SALIR A LA CALLE →';
 }
 paintCity(){
  const g=this.add.graphics();g.fillStyle(0x373d46);g.fillRect(0,0,SIZE,SIZE);
  const rng=new Phaser.Math.RandomDataGenerator(['buenos-aires-invadida-1986']);
  for(let x=55;x<SIZE-70;x+=54)for(let y=55;y<SIZE-70;y+=60){const w=rng.between(30,42),h=rng.between(32,44),p={x:x+w/2,y:y+h/2};if(radial(p)>3370)continue;const corners=[{x,y},{x:x+w,y},{x,y:y+h},{x:x+w,y:y+h},p];if(corners.some(c=>{const n=city.nearest(c);return !n||n.d<n.edge.width/2+7;}))continue;
   g.fillStyle(0x101a28,.65);g.fillRect(x+7,y+9,w,h);g.fillStyle(rng.pick([0x786b64,0x737880,0x7b706c,0x626c78,0x8a776a]));g.fillRect(x,y,w,h);g.fillStyle(0xa99a84);g.fillRect(x,y,w,3);g.fillStyle(0x505965);g.fillRect(x+4,y+5,w-8,h-10);g.fillStyle(0x829094);g.fillRect(x+7,y+8,9,7);g.fillStyle(0xddbe79,.55);for(let a=x+4;a<x+w-4;a+=9)g.fillRect(a,y+h-4,3,3);
  }
  // Sidewalks and road centerlines follow the source coordinates, including diagonals.
  for(const e of city.edges){g.lineStyle(e.width+13,0xb0a58e);g.lineBetween(e.a.x,e.a.y,e.b.x,e.b.y);}
  for(const e of city.edges){g.lineStyle(e.width,0x4b5961);g.lineBetween(e.a.x,e.a.y,e.b.x,e.b.y);}
  for(const e of city.edges){if(e.length>40){const dx=(e.b.x-e.a.x)/e.length,dy=(e.b.y-e.a.y)/e.length;g.lineStyle(1,0xdfd2a4,.65);for(let d=15;d<e.length-10;d+=27)g.lineBetween(e.a.x+dx*d,e.a.y+dy*d,e.a.x+dx*(d+8),e.a.y+dy*(d+8));}}
  for(const n of city.nodes){if(n.links.length<3||radial(n)>1900)continue;const e=n.links[0].edge,a=Math.atan2(e.b.y-e.a.y,e.b.x-e.a.x),dx=Math.cos(a),dy=Math.sin(a),width=e.width/2-2;g.lineStyle(2,0xd1cbb8,.7);for(let k=15;k<28;k+=5){const x=n.x+dx*k,y=n.y+dy*k;g.lineBetween(x-dy*width,y+dx*width,x+dy*width,y-dx*width);}}
  const labels=new Set();for(const e of city.edges){if(e.length<90||radial(e.a)>2800||!/Corrientes|9 de Julio|Callao|Rivadavia/.test(e.name))continue;let x=(e.a.x+e.b.x)/2,y=(e.a.y+e.b.y)/2,key=e.name+Math.floor(x/1000)+','+Math.floor(y/1000);if(labels.has(key))continue;labels.add(key);let angle=Math.atan2(e.b.y-e.a.y,e.b.x-e.a.x);if(angle>Math.PI/2||angle< -Math.PI/2)angle+=Math.PI;this.add.text(x,y-3,NAV.roadLabel(e.name).toUpperCase(),{...textStyle,fontSize:'7px',color:'#dbd5bf',strokeThickness:2}).setOrigin(.5).setRotation(angle).setAlpha(.65).setDepth(2);}
  // Porteño landmarks are illustrated; their markers use geographic coordinates.
  this.landmark(-34.6095,-58.3928,'CONGRESO',0x708681,110,64);
  this.landmark(-34.6041,-58.3888,'TEATRO SAN MARTÍN',0x8d827b,70,48);
  this.landmark(-34.6009,-58.3832,'TEATRO COLÓN',0xa08e79,104,65);
  this.landmark(-34.6031,-58.3788,'GRAN REX',0x948181,65,42);
  this.add.image(C,C-53,'obelisk').setScale(1).setDepth(7);this.add.text(C,C+37,'OBELISCO',{...textStyle,color:'#efdeb0',fontSize:'11px'}).setOrigin(.5).setDepth(9);
  this.mothership=PixelAssets.animate(this.add.sprite(C,C-123,'saucer').setScale(4),'saucer').setDepth(15);this.tweens.add({targets:this.mothership,y:C-136,duration:1300,yoyo:true,repeat:-1});
  for(let i=0;i<230;i++){const e=city.edges[(i*47)%city.edges.length];if(radial(e.a)>2800)continue;const p=project({x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2},e.a,e.b),a=Math.atan2(e.b.y-e.a.y,e.b.x-e.a.x);if(i%3===0)this.add.image(p.x,p.y,i%9===0?'bus':'taxi').setScale(i%9===0?1.3:1).setRotation(a).setDepth(2);else this.add.image(p.x+Math.sin(a)*23,p.y-Math.cos(a)*23,'tree').setScale(1.1).setDepth(3);}
  // Local shop signs make the city readable even between landmarks.
  for(const [lat,lon,label,color] of [[-34.6045,-58.389,'PIZZA AL MOLDE',0xd8ac76],[-34.6055,-58.391,'KIOSCO 24 HS',0x9ad8b6],[-34.6037,-58.3848,'LIBRERÍA',0xe2ce8e],[-34.608,-58.393,'CAFÉ · SUBMARINO',0xd8b1a5],[-34.6027,-58.3802,'SUBTE B',0xea9285]]){const p=city.nearest(geo(lat,lon),true);if(this.targets.some(t=>distance(t,p)<140))continue;this.add.text(p.x,p.y-31,label,{...textStyle,fontSize:'8px',color:'#'+color.toString(16),backgroundColor:'#19242d',padding:{x:5,y:3}}).setOrigin(.5).setDepth(4);}
 }
 landmark(lat,lon,label,color,w,h){const p=geo(lat,lon),key=label==='CONGRESO'?'congress':label==='TEATRO COLÓN'?'colon':label==='GRAN REX'?'gran-rex':'san-martin';this.add.image(p.x,p.y,key).setDisplaySize(w,h).setDepth(1);this.add.text(p.x,p.y-h/2-12,label,{...textStyle,fontSize:'9px',color:'#ebd4a3'}).setOrigin(.5).setDepth(2);}
 paintBarriers(){
  this.wrecks.clear();this.gateGraphics.clear();if(!this.wreckSprites){this.wreckSprites=[];for(const id of this.blocked){const e=city.edges[id];this.wreckSprites.push(this.add.image((e.a.x+e.b.x)/2,(e.a.y+e.b.y)/2,'wreck').setDisplaySize(34,34).setRotation(Math.atan2(e.b.y-e.a.y,e.b.x-e.a.x)+Math.PI/2).setDepth(4));}}for(const id of this.blocked){const e=city.edges[id],p=project({x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2},e.a,e.b);this.wrecks.fillStyle(0x79484c);this.wrecks.fillRect(p.x-12,p.y-12,24,24);this.wrecks.lineStyle(3,0xd7ac65);this.wrecks.lineBetween(p.x-13,p.y-13,p.x+13,p.y+13);this.wrecks.fillStyle(0x343c50);this.wrecks.fillRect(p.x-7,p.y-6,14,8);}
  if(state.stage<4)for(const p of city.ringCrossings(RINGS[state.stage])){const nx=-Math.sin(p.angle),ny=Math.cos(p.angle),w=p.width/2+9;this.gateGraphics.lineStyle(7,0x684f90);this.gateGraphics.lineBetween(p.x-nx*w,p.y-ny*w,p.x+nx*w,p.y+ny*w);this.gateGraphics.lineStyle(2,0xc89ff5);this.gateGraphics.lineBetween(p.x-nx*w,p.y-ny*w,p.x+nx*w,p.y+ny*w);for(const side of [-1,1]){this.gateGraphics.fillStyle(0x82928e);this.gateGraphics.fillRect(p.x+nx*w*side-4,p.y+ny*w*side-6,8,12);}}
 }
 makeSupplies(){
  const used=new Set(state.pickups);const anchors=[this.spawn,...this.targets];let id=0;
  // Two permanent, renewable supply pairs near every terminal ensure recovery at zero lives.
  anchors.forEach((p,j)=>{for(let i=0;i<4;i++){const near=city.nearest({x:p.x+(i%2?48:-48),y:p.y+(i<2?40:-40)},true);const type=i%2?'yerba':'thermos',key=`s${j}-${i}`;const icon=this.add.image(near.x,near.y,type).setScale(1).setDepth(8);const halo=this.add.circle(near.x,near.y,13,0x99d6aa,.13).setDepth(7);const item={id:key,x:near.x,y:near.y,type,icon,halo,ready:used.has(key)?this.time.now+20000:0};this.pickupSprites.push(item);}});
  for(let i=0;i<60;i++){const e=city.edges[(i*173+25)%city.edges.length];if(radial(e.a)>3100)continue;let p=e.a,key=`r${id++}`,type=i%2?'yerba':'thermos';let icon=this.add.image(p.x,p.y,type).setScale(1).setDepth(8),halo=this.add.circle(p.x,p.y,12,0x99d6aa,.13).setDepth(7);this.pickupSprites.push({id:key,x:p.x,y:p.y,type,icon,halo,ready:used.has(key)?this.time.now+20000:0});}
 }
 refreshMission(){this.paintBarriers();for(let i=0;i<this.targetMarkers.length;i++){const m=this.targetMarkers[i],visible=i<=state.stage;m.box.setVisible(visible);m.label.setVisible(false);m.box.setTint(i<state.stage?0x93d2a2:0xffffff);}
  this.mothership.setVisible(!state.won);this.findRoute();sync();}
 navigationGoal(){
  if(state.mates===0){
   if(state.thermos&&state.yerba)return{kind:'brew',point:this.hero,place:'Cebá para recuperar una vida'};
   const missing=state.thermos<1?'thermos':'yerba';
   const supplies=this.pickupSprites.filter(s=>s.type===missing&&s.ready<=this.time.now&&radial(s)>=RINGS[Math.min(state.stage,4)]).sort((a,b)=>distance(a,this.hero)-distance(b,this.hero));
   let best=null;for(const item of supplies.slice(0,5)){const points=NAV.route(city,this.hero,item,Math.min(4,state.stage),this.blocked);if(points.length&&(!best||NAV.length(points)<best.length))best={kind:'supply',point:item,place:missing==='thermos'?'Buscá un termo':'Buscá yerba',points,length:NAV.length(points)};}
   if(best)return best;
   return{kind:'waiting',point:this.hero,place:'Esperá que se repongan las provisiones'};
  }
  return{kind:'mission',point:this.targets[Math.min(4,state.stage)],place:MISSIONS[Math.min(4,state.stage)].place};
 }
 findRoute(){
  if(state.won){route=[];return;}this.navGoal=this.navigationGoal();
  route=this.navGoal.points||((this.navGoal.kind==='brew'||this.navGoal.kind==='waiting')?[]:NAV.route(city,this.hero,this.navGoal.point,Math.min(4,state.stage),this.blocked));this.lastRoute=this.time.now;
 }
 stopWalking(){this.walkPoints=[];this.walkStuck=0;this.tapMarker?.clear();$('#walk-cancel').classList.add('hidden');}
 walkTo(point){
  const street=city.nearest(point);if(!street||street.d>street.edge.width/2+10){toast('Elegí una calle clara. Los edificios y las manzanas oscuras no se pueden atravesar.');return;}
  const points=NAV.route(city,this.hero,street,Math.min(4,state.stage),this.blocked);if(!points.length){toast('Ese camino sigue bloqueado. Ganá el desafío dorado para abrir el cerco.');return;}
  this.walkPoints=points.slice(1);this.walkStuck=0;this.tapMarker.clear().lineStyle(2,0xffffff,.9).strokeCircle(street.x,street.y,9);$('#walk-cancel').classList.toggle('hidden',!this.walkPoints.length);
 }
 reveal(){const gx=Math.floor(this.hero.x/150),gy=Math.floor(this.hero.y/150);for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)if(x*x+y*y<=5)this.discovered.add((gx+x)+','+(gy+y));}
 nearbyTarget(){return this.targets.findIndex((p,i)=>i<=state.stage&&distance(p,this.hero)<48);}
 interact(){if(!started||arcade||modalOpen||mapOpen)return;const index=this.nearbyTarget();if(index<0){toast('Acercate a una terminal celeste. El radar y los puntos en la calle te guían.');return;}if(index<state.stage){toast('Esta señal ya está liberada. Seguí hacia el próximo objetivo.');return;}if(state.won){toast('¡El Obelisco es nuestro! Seguí explorando la ciudad.');return;}if(!state.mates){toast('Sin mate no se pelea. Buscá termo y yerba, y presioná C para cebar.');return;}
  this.stopWalking();const m=MISSIONS[index];showModal('SEÑAL '+String(index+1).padStart(2,'0')+' / '+m.place.toUpperCase(),m.label,m.goal+' Cada impacto cuesta un mate. Si abandonás, perdés un mate.','ENTRAR AL DESAFÍO →',()=>{this.scene.launch('arcade',{kind:m.type});this.scene.pause();});
 }
 move(dx,dy,dt){const speed=held.fire||this.keys.SPACE.isDown?230:155,len=Math.hypot(dx,dy)||1;let next={x:this.hero.x+dx/len*speed*dt,y:this.hero.y+dy/len*speed*dt};const n=city.nearest(next);if(!n)return;const allowed=n.edge.width/2+4;if(n.d>allowed){if(n.d>allowed+12)return;const a=(allowed-1)/(n.d||1);next={x:n.x+(next.x-n.x)*a,y:n.y+(next.y-n.y)*a};}
  if(radial(next)<RINGS[Math.min(state.stage,4)]&&state.stage<4){if(this.time.now>this.warnAt){toast('Cerco alienígena. Ganá el desafío marcado para abrir el camino.');this.warnAt=this.time.now+3500;}return;}
  for(const e of city.nearby(next))if(this.blocked.has(e.id)){const p={x:(e.a.x+e.b.x)/2,y:(e.a.y+e.b.y)/2};if(distance(next,p)<e.width/2+9){if(this.time.now>this.warnAt){toast('Autos chocados. Buscá otra calle; el recorrido celeste marca el desvío.');this.warnAt=this.time.now+3500;}return;}}
  this.hero.setPosition(next.x,next.y);if(dx)this.hero.setFlipX(dx<0);if(this.hero.anims.currentAnim?.key!=='porteño-loop'||!this.hero.anims.isPlaying)this.hero.play('porteño-loop');this.shadow.setPosition(next.x,next.y+22);this.playerHalo.setPosition(next.x,next.y+20);this.playerLabel.setPosition(next.x,next.y-33);
 }
 paintNavigation(){
  if(!this.hero)return;const g=this.routeGraphics;g.clear();const goal=this.navGoal||this.navigationGoal();const walking=this.walkPoints.length>0;
  const active=walking?[{x:this.hero.x,y:this.hero.y},...this.walkPoints]:NAV.remaining(route,this.hero),nav=NAV.instruction(active,this.hero),color=goal.kind==='supply'?0xa2df9c:0x9aebee;
  let reach=0;for(let i=1;i<active.length;i++){const a=active[i-1],b=active[i],d=distance(a,b);g.lineStyle(9,0x183b43,.65);g.lineBetween(a.x,a.y,b.x,b.y);g.lineStyle(3,color,.95);g.lineBetween(a.x,a.y,b.x,b.y);const dx=(b.x-a.x)/(d||1),dy=(b.y-a.y)/(d||1);for(let k=15;k<d-3;k+=29){const x=a.x+dx*k,y=a.y+dy*k;g.fillStyle(color);g.fillTriangle(x+dx*4,y+dy*4,x-dx*3-dy*3,y-dy*3+dx*3,x-dx*3+dy*3,y-dy*3-dx*3);}reach+=d;if(reach>500)break;}
  const n=city.nearest(this.hero),street=NAV.roadLabel(n?.edge.name||'Buenos Aires');$('#guide-street').textContent=street+(nav.after?' · '+nav.after:'');$('#location').textContent=street.toUpperCase()+' · CABA';
  const arrived=goal.kind==='mission'&&distance(this.hero,goal.point)<48;
  $('#guide-arrow').textContent=state.won?'✓':arrived&&!walking?'◆':nav.symbol;
  $('#guide-destination').textContent=state.won?'BUENOS AIRES LIBERADA':walking?'CAMINANDO HACIA TU MARCA':goal.kind==='mission'?`DESAFÍO ${Math.min(5,state.stage+1)} · ${goal.place}`:'SIN MATES · '+goal.place.toUpperCase();
  $('#guide-instruction').textContent=state.won?'La ciudad es tuya. Seguí explorando.':walking?nav.text:goal.kind==='brew'?'Tenés termo y yerba. Cebá un mate.':goal.kind==='waiting'?'Las provisiones vuelven a aparecer.':arrived?'Llegaste. Entrá al desafío dorado.':nav.text;
  $('#objective-distance').textContent=state.won?'CIUDAD LIBERADA':goal.kind==='brew'?'TERMO + YERBA LISTOS':arrived?'ESTÁS ACÁ · ENTRÁ CON E':`${Math.round(NAV.length(NAV.remaining(route,this.hero))/1.05)} m por las calles · ${goal.place}`;
  const action=$('#street-interact'),canBrew=state.mates===0&&state.thermos>0&&state.yerba>0;action.classList.toggle('hidden',!(canBrew||arrived&&!walking&&!state.won));action.textContent=canBrew?'[ C ] CEBAR UN MATE':'[ E ] ENTRAR A '+MISSIONS[Math.min(4,state.stage)].label;
  $('#walk-tip').textContent=walking?'CAMINANDO A TU MARCA · WASD O × PARA FRENAR':arrived?'EL POSTE DORADO ABRE EL MINIJUEGO':'CLIC / TOQUE EN UNA CALLE PARA CAMINAR · O USÁ WASD';
  this.goalBeacon.clear();this.goalLabel.setVisible(!state.won&&goal.kind!=='brew'&&goal.kind!=='waiting');
  if(!state.won&&goal.kind!=='brew'&&goal.kind!=='waiting'){
   const p=goal.point,r=18+Math.sin(this.time.now*.006)*3,glow=goal.kind==='supply'?0xa2df9c:0xf3cf76;this.goalBeacon.lineStyle(2,glow,.9);this.goalBeacon.strokeCircle(p.x,p.y,r);this.goalBeacon.lineStyle(7,glow,.15);this.goalBeacon.lineBetween(p.x,p.y-14,p.x,p.y-53);this.goalBeacon.fillStyle(glow);this.goalBeacon.fillTriangle(p.x,p.y-24,p.x-6,p.y-34,p.x+6,p.y-34);
   this.goalLabel.setPosition(p.x,p.y-63).setText(goal.kind==='supply'?'PROVISIÓN':`DESAFÍO ${Math.min(5,state.stage+1)}`).setColor(goal.kind==='supply'?'#a9e59f':'#ffe2a0');
  }
 }
 paintFog(){const g=this.fog;g.clear();const view=this.cameras.main.worldView;for(let x=Math.floor(view.x/150)-1;x<=Math.ceil(view.right/150)+1;x++)for(let y=Math.floor(view.y/150)-1;y<=Math.ceil(view.bottom/150)+1;y++)if(!this.discovered.has(x+','+y)){g.fillStyle(0x101724,.94);g.fillRect(x*150,y*150,150,150);}}
 update(time,delta){
  if(!this.hero)return;if(!started||modalOpen||mapOpen){this.hero.anims.stop();this.hero.setFrame(0);return;}
  const k=this.keys,dx=(k.RIGHT.isDown||k.D.isDown||held.right?1:0)-(k.LEFT.isDown||k.A.isDown||held.left?1:0),dy=(k.DOWN.isDown||k.S.isDown||held.down?1:0)-(k.UP.isDown||k.W.isDown||held.up?1:0),dt=Math.min(delta,45)/1000;
  if(dx||dy){this.stopWalking();this.move(dx,dy,dt);}else if(this.walkPoints.length){
   while(this.walkPoints.length&&distance(this.hero,this.walkPoints[0])<4)this.walkPoints.shift();
   if(this.walkPoints.length){const p=this.walkPoints[0],before={x:this.hero.x,y:this.hero.y};this.move(p.x-this.hero.x,p.y-this.hero.y,dt);this.walkStuck=distance(before,this.hero)<.1?this.walkStuck+dt:0;if(this.walkStuck>1){this.stopWalking();toast('Hay un obstáculo. Elegí otra calle o seguí la ruta celeste.');}}
   else {this.stopWalking();this.findRoute();}
  }else {this.hero.anims.stop();this.hero.setFrame(0);}
  for(const s of this.pickupSprites){const ready=time>s.ready;s.icon.setVisible(ready);s.halo.setVisible(ready);if(ready&&distance(s,this.hero)<20){state[s.type]=Math.min(99,state[s.type]+1);s.ready=time+25000;if(!state.pickups.includes(s.id))state.pickups.push(s.id);beep(s.type==='yerba'?660:520);toast((s.type==='yerba'?'Yerba':'Termo')+' en la mochila. '+(state.mates<3?'C para cebar un mate.':'Reservalo para después.'));sync();this.findRoute();}}
  if(time-this.lastTick>120){this.lastTick=time;this.reveal();this.paintFog();if(time-this.lastRoute>850)this.findRoute();this.paintNavigation();drawMap($('#minimap'));}
  if(time-this.lastSave>2500){this.lastSave=time;save();}
 }

}
function drawMap(canvas,full=false){if(!world?.hero)return;const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,p=world.hero,span=full?7200:760,scale=Math.min(w,h)/span,cx=full?C:p.x,cy=full?C:p.y,xy=q=>({x:w/2+(q.x-cx)*scale,y:h/2+(q.y-cy)*scale});ctx.fillStyle='#101a29';ctx.fillRect(0,0,w,h);ctx.save();ctx.lineCap='round';for(const e of city.edges){const a=xy(e.a),b=xy(e.b);if(Math.max(a.x,b.x)<0||Math.min(a.x,b.x)>w||Math.max(a.y,b.y)<0||Math.min(a.y,b.y)>h)continue;const found=world.discovered.has(Math.floor(e.a.x/150)+','+Math.floor(e.a.y/150));ctx.strokeStyle=found?'#6c8195':'#253249';ctx.lineWidth=full?1:2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
 if(state.stage<4){const c=xy({x:C,y:C});ctx.strokeStyle='#a58ae0';ctx.lineWidth=full?2:1;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(c.x,c.y,RINGS[state.stage]*scale,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
 if(!full){ctx.strokeStyle='#a5e4ef';ctx.lineWidth=3;ctx.beginPath();NAV.remaining(route,p).forEach((n,i)=>{const q=xy(n);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.stroke();}
 for(let i=0;i<world.targets.length;i++){if(!full&&i!==Math.min(4,state.stage))continue;const q=xy(world.targets[i]);ctx.fillStyle=i<state.stage?'#9bd5a6':i===state.stage?'#f3d17d':'#805b9a';ctx.beginPath();ctx.moveTo(q.x,q.y-5);ctx.lineTo(q.x+4,q.y);ctx.lineTo(q.x,q.y+5);ctx.lineTo(q.x-4,q.y);ctx.closePath();ctx.fill();if(full&&i===Math.min(4,state.stage)){ctx.font='11px monospace';ctx.fillText(`${i+1}. ${MISSIONS[i].place}`,q.x+9,q.y-8);}}
 const ob=xy({x:C,y:C});ctx.fillStyle='#e9e0b9';ctx.fillRect(ob.x-1,ob.y-5,3,10);
 for(const s of world.pickupSprites){if(full||s.ready>world.time.now||!world.discovered.has(Math.floor(s.x/150)+','+Math.floor(s.y/150)))continue;const q=xy(s);ctx.fillStyle='#9cdbab';ctx.fillRect(q.x-2,q.y-2,4,4);}
 const pos=xy(p);ctx.fillStyle='#a6e7f4';ctx.beginPath();ctx.arc(pos.x,pos.y,full?4:5,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.stroke();ctx.font='bold 10px monospace';ctx.fillStyle='#e7ffff';ctx.fillText('VOS',pos.x+9,pos.y+4);ctx.restore();$('#explored').textContent=Math.min(100,Math.round(world.discovered.size/(Math.PI*(3100*1.05/150)**2)*100))+'% EXPLORADO';}
class Arcade extends Phaser.Scene{
 constructor(){super('arcade');}
 init(data){this.kind=data.kind;}
 create(){
  arcade=this;this.pixelPool=[];this.pixelUsed=0;this.boss=null;this.bossHP=0;this.ship=null;this.ball=null;this.ended=false;this.damageUntil=0;this.lastFire=0;this.lastEnemyShot=0;this.elapsed=0;this.limit=this.kind==='maze'?180:120;this.bullets=[];this.hostile=[];this.enemies=[];this.score=0;this.effects=[];
  this.cameras.main.setBackgroundColor('#11182b');this.g=this.add.graphics();this.fx=this.add.graphics().setDepth(10);this.rng=new Phaser.Math.RandomDataGenerator(['resistencia-'+state.stage]);
  for(let i=0;i<100;i++)this.add.rectangle(this.rng.between(10,W-10),this.rng.between(65,H-25),i%3?2:3,2,i%4?0x6e7791:0xa7c3d9,.65);
  this.add.rectangle(W/2,35,W,70,0x192239);PixelAssets.text(this,25,17,MISSIONS[Math.min(4,state.stage)].label,16,0xf2d086);this.status=PixelAssets.text(this,W-25,20,'',16,0x9de0ed).setOrigin(1,0);this.counter=PixelAssets.text(this,W/2,55,'',16,0xaab6ca).setOrigin(.5);
  this.keys=this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC');this.input.keyboard.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);this.input.keyboard.on('keydown-ESC',()=>{if(!this.ended)this.leave();});
  this.tip=this.add.text(W/2,H-16,'A D / ← → · ESPACIO DISPARA · ESC SALE (−1 MATE)',{...textStyle,fontSize:'10px',color:'#8796af'}).setOrigin(.5).setDepth(20);
  if(this.kind==='breakout')this.setupBreakout();else if(this.kind==='maze')this.setupMaze();else this.setupShooter();sync();
 }
 activeInput(){const k=this.keys;return{left:k.LEFT.isDown||k.A.isDown||held.left,right:k.RIGHT.isDown||k.D.isDown||held.right,up:k.UP.isDown||k.W.isDown||held.up,down:k.DOWN.isDown||k.S.isDown||held.down,fire:k.SPACE.isDown||held.fire};}
 hit(){if(this.ended||this.time.now<this.damageUntil)return false;state.mates=Math.max(0,state.mates-1);this.damageUntil=this.time.now+1500;this.cameras.main.shake(140,.008);this.cameras.main.flash(110,130,55,75);beep(110,.18,'sawtooth');sync();if(state.mates===0)this.finish(false,'Te quedaste sin mates. La ciudad sigue abierta: buscá termo y yerba, cebá con C y volvé a intentarlo.');return true;}
 finish(won,reason){if(this.ended)return;this.ended=true;const m=MISSIONS[Math.min(4,state.stage)];if(won){state.stage++;state.won=state.stage===5;state.mates=Math.min(3,state.mates+1);beep(880,.3,'triangle');}const title=won?(state.won?'¡EL OBELISCO ES NUESTRO!':'¡BARRIO RECUPERADO!'):'TRANQUI, HAY REVANCHA.';this.time.delayedCall(350,()=>{arcade=null;this.scene.stop();this.scene.resume('city');world.refreshMission();save();sync();showModal(won?'SEÑAL LIBERADA / +1 MATE':'LA RESISTENCIA SIGUE',title,won?(state.won?'La nave nodriza cayó. Buenos Aires vuelve a ser nuestra. Terminaste los cinco desafíos; el mapa queda abierto para seguir explorando.':m.reward+' Recuperaste un mate. Seguí los puntos celestes hacia la próxima terminal.'):reason,'VOLVER A LA CIUDAD →');});}
 leave(){state.mates=Math.max(0,state.mates-1);sync();this.finish(false,'Saliste del desafío y gastaste un mate. Tu progreso en la ciudad se conserva.');}
 setupShooter(){
  this.ship=PixelAssets.animate(this.add.sprite(W/2,530,'ship').setScale(1.5),'ship');this.targetCount=this.kind==='invaders'?18:20;this.stepAt=0;this.direction=1;this.offset=0;this.descend=0;
  if(this.kind==='boss'){this.boss=PixelAssets.animate(this.add.sprite(W/2,140,'saucer').setScale(5),'saucer');this.bossHP=35;this.add.text(W/2,86,'NAVE NODRIZA / NÚCLEO EXPUESTO',{...textStyle,fontSize:'10px',color:'#b6a2e0'}).setOrigin(.5);}
  else {const cols=this.kind==='invaders'?6:5,rows=this.kind==='invaders'?3:4;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const key=this.kind==='invaders'?(y%2?'alien-green':'alien'):'drone';const e=PixelAssets.animate(this.add.sprite(210+x*88,125+y*53,key).setScale(1.5),key);e.baseX=e.x;e.baseY=e.y;e.order=y*cols+x;e.diving=false;this.enemies.push(e);}}
 }
 shoot(){if(this.time.now-this.lastFire<190)return;this.lastFire=this.time.now;this.bullets.push({x:this.ship.x,y:this.ship.y-18,vx:0,vy:-540});beep(720,.035);}
 shooterUpdate(dt,input){
  this.ship.x=Phaser.Math.Clamp(this.ship.x+((input.right?1:0)-(input.left?1:0))*380*dt,38,W-38);this.ship.setAlpha(this.time.now<this.damageUntil?(Math.floor(this.time.now/90)%2?.3:1):1);if(input.fire)this.shoot();
  if(this.kind==='boss'){this.boss.x=W/2+Math.sin(this.elapsed*.9)*310;this.boss.y=140+Math.sin(this.elapsed*1.7)*15;this.counter.setText(`NUCLEO ${this.bossHP} / 35`);if(this.time.now-this.lastEnemyShot>1300){this.lastEnemyShot=this.time.now;for(let i=-2;i<=2;i++)this.hostile.push({x:this.boss.x,y:this.boss.y+20,vx:i*65,vy:175+Math.abs(i)*8});}}
  else {if(this.kind==='invaders'&&this.time.now-this.stepAt>370){this.stepAt=this.time.now;this.offset+=this.direction*12;const living=this.enemies.filter(e=>e.active);if(living.some(e=>e.baseX+this.offset>W-60||e.baseX+this.offset<60)){this.direction*=-1;this.descend+=17;}}
   for(const e of this.enemies){if(!e.active)continue;if(this.kind==='invaders'){e.x=e.baseX+this.offset;e.y=e.baseY+this.descend;if(e.y>475){this.hit();if(!this.ended)this.finish(false,'La flota llegó al barrio. Volvé a la terminal para una nueva defensa.');return;}}
    else {const cycle=(this.elapsed+e.order*.68)%9;e.diving=cycle>5.5;if(e.diving){const t=(cycle-5.5)/3.5;e.x=e.baseX+Math.sin(t*Math.PI*2+e.order)*120;e.y=e.baseY+t*470;}else{e.x=e.baseX+Math.sin(this.elapsed*1.6+e.order*.2)*40;e.y=e.baseY+Math.cos(this.elapsed*1.7+e.order)*9;}if(distance(e,this.ship)<27)this.hit();}}
   if(this.time.now-this.lastEnemyShot>(this.kind==='invaders'?1000:720)){this.lastEnemyShot=this.time.now;const living=this.enemies.filter(e=>e.active);if(living.length){const e=living[Math.floor(this.rng.frac()*living.length)];this.hostile.push({x:e.x,y:e.y+15,vx:this.kind==='invaders'?0:Phaser.Math.Clamp((this.ship.x-e.x)*.3,-90,90),vy:this.kind==='invaders'?185:225});}}
   this.counter.setText(`NAVES DERRIBADAS ${this.score} / ${this.targetCount}`);
  }
  for(const b of this.bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.dead)continue;if(this.boss&&Math.abs(b.x-this.boss.x)<70&&Math.abs(b.y-this.boss.y)<38){b.dead=true;this.bossHP--;this.spark(b.x,b.y);beep(280,.04);if(this.bossHP<=0)this.finish(true);}else for(const e of this.enemies)if(e.active&&Math.abs(b.x-e.x)<20&&Math.abs(b.y-e.y)<17){e.destroy();b.dead=true;this.score++;this.spark(b.x,b.y);beep(220,.05);if(this.score===this.targetCount)this.finish(true);break;}}
  for(const b of this.hostile){b.x+=b.vx*dt;b.y+=b.vy*dt;if(Math.abs(b.x-this.ship.x)<15&&Math.abs(b.y-this.ship.y)<17){if(this.hit())b.dead=true;}}
  this.bullets=this.bullets.filter(b=>!b.dead&&b.y>70);this.hostile=this.hostile.filter(b=>!b.dead&&b.y<H&&b.x>0&&b.x<W);this.g.clear();PixelAssets.begin(this);for(const b of this.bullets)PixelAssets.stamp(this,this.g,'bullet',Math.floor(this.elapsed*8)%2,b.x,b.y,20,24);for(const b of this.hostile)PixelAssets.stamp(this,this.g,'plasma',Math.floor(this.elapsed*8)%2,b.x,b.y,24,24);PixelAssets.end(this);
  if(this.boss){this.g.fillStyle(0x34324e);this.g.fillRect(230,92,500,5);this.g.fillStyle(0xbda0eb);this.g.fillRect(230,92,500*this.bossHP/35,5);}
 }
 spark(x,y){const burst=this.add.sprite(x,y,'explosion').setScale(2).setDepth(15).play('explosion-loop');burst.once('animationcomplete',()=>burst.destroy());}
 setupBreakout(){this.tip.setText('A D / ← → · ESPACIO LANZA · ESC SALE (−1 MATE)');this.paddle={x:W/2,y:526,w:125};this.ball={x:W/2,y:510,vx:135,vy:-290,waiting:true};this.bricks=[];const colors=[0xae8de4,0x7dc6d7,0xe6c575];for(let y=0;y<3;y++)for(let x=0;x<8;x++)this.bricks.push({x:91+x*99,y:145+y*36,w:89,h:24,alive:true,color:colors[y]});}
 breakoutUpdate(dt,input){const p=this.paddle,b=this.ball;p.x=Phaser.Math.Clamp(p.x+((input.right?1:0)-(input.left?1:0))*460*dt,72,W-72);if(b.waiting){b.x=p.x;b.y=p.y-15;if(input.fire){b.waiting=false;b.vx=145;b.vy=-290;beep(660);}}else{let oldY=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.x<20){b.x=20;b.vx=Math.abs(b.vx);}if(b.x>W-20){b.x=W-20;b.vx=-Math.abs(b.vx);}if(b.y<89){b.y=89;b.vy=Math.abs(b.vy);}if(b.vy>0&&b.y+7>=p.y-5&&oldY<=p.y+7&&Math.abs(b.x-p.x)<p.w/2+7){b.y=p.y-13;const v=Phaser.Math.Clamp((b.x-p.x)/(p.w/2),-.95,.95);b.vx=v*320;b.vy=-Math.sqrt(330**2-b.vx**2);beep(500,.04);}for(const brick of this.bricks)if(brick.alive&&b.x+7>brick.x-brick.w/2&&b.x-7<brick.x+brick.w/2&&b.y+7>brick.y-brick.h/2&&b.y-7<brick.y+brick.h/2){brick.alive=false;this.score++;if(oldY+7<=brick.y-brick.h/2||oldY-7>=brick.y+brick.h/2)b.vy*=-1;else b.vx*=-1;this.spark(b.x,b.y);beep(800-brick.y,.05);if(this.score===24)this.finish(true);break;}if(b.y>565){this.hit();b.waiting=true;}}
  this.g.clear();PixelAssets.begin(this);for(const brick of this.bricks)if(brick.alive)PixelAssets.stamp(this,this.g,'brick',0,brick.x,brick.y,96,55).setTint(brick.color);PixelAssets.end(this);this.g.fillStyle(0xa3dfeb);this.g.fillRect(p.x-p.w/2,p.y-5,p.w,10);this.g.fillStyle(0xf4d584);this.g.fillCircle(b.x,b.y,7);this.counter.setText(`BLOQUES ${this.score} / 24${b.waiting?' · ESPACIO PARA LANZAR':''}`);
 }
 setupMaze(){
  this.tip.setText('FLECHAS / WASD · JUNTÁ TODAS LAS CHISPAS · CHISPA GRANDE = PODER · ESC SALE');const cols=25,rows=15;this.cells=Array.from({length:rows},()=>Array(cols).fill(1));const visit=(x,y)=>{this.cells[y][x]=0;const dirs=Phaser.Utils.Array.Shuffle([[2,0],[-2,0],[0,2],[0,-2]]);for(const [dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<cols-1&&ny<rows-1&&this.cells[ny][nx]){this.cells[y+dy/2][x+dx/2]=0;visit(nx,ny);}}};visit(1,1);
  // Extra connections make a chase maze rather than a single winding corridor.
  for(let y=2;y<rows-2;y++)for(let x=2;x<cols-2;x++)if(this.cells[y][x]&&this.rng.frac()<.13&&((!this.cells[y][x-1]&&!this.cells[y][x+1])||(!this.cells[y-1][x]&&!this.cells[y+1][x])))this.cells[y][x]=0;
  this.pellets=new Set();for(let y=1;y<rows-1;y++)for(let x=1;x<cols-1;x++)if(!this.cells[y][x])this.pellets.add(x+','+y);this.pellets.delete('1,1');this.total=this.pellets.size;this.pac={x:1,y:1};this.pacDir={x:0,y:0};this.want={x:0,y:0};this.powerUntil=0;this.nextPac=0;this.nextGhost=0;this.ghosts=[{x:23,y:13},{x:23,y:1},{x:1,y:13}];this.powers=new Set(['23,13','23,1','1,13','13,7']);
 }
 mazePass(x,y){return this.cells[y]?.[x]===0;}
 ghostStep(ghost){const queue=[{x:ghost.x,y:ghost.y,path:[]}],visited=new Set([ghost.x+','+ghost.y]);while(queue.length){let n=queue.shift();if(n.x===this.pac.x&&n.y===this.pac.y)return n.path[0]||ghost;for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let x=n.x+dx,y=n.y+dy,k=x+','+y;if(this.mazePass(x,y)&&!visited.has(k)){visited.add(k);queue.push({x,y,path:n.path.length?n.path:[{x,y}]});}}}return ghost;}
 mazeUpdate(dt,input){
  if(input.left)this.want={x:-1,y:0};else if(input.right)this.want={x:1,y:0};else if(input.up)this.want={x:0,y:-1};else if(input.down)this.want={x:0,y:1};
  if(this.time.now>this.nextPac){this.nextPac=this.time.now+125;if(this.mazePass(this.pac.x+this.want.x,this.pac.y+this.want.y))this.pacDir={...this.want};if(this.mazePass(this.pac.x+this.pacDir.x,this.pac.y+this.pacDir.y)){this.pac.x+=this.pacDir.x;this.pac.y+=this.pacDir.y;}const key=this.pac.x+','+this.pac.y;if(this.pellets.delete(key)){this.score++;if(this.powers.has(key)){this.powerUntil=this.time.now+7000;beep(700,.15);}else if(this.score%4===0)beep(400,.025);if(!this.pellets.size)this.finish(true);}}
  if(this.time.now>this.nextGhost){this.nextGhost=this.time.now+360;for(const ghost of this.ghosts){if(this.time.now<this.powerUntil){const choices=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:ghost.x+dx,y:ghost.y+dy})).filter(n=>this.mazePass(n.x,n.y));if(choices.length)Object.assign(ghost,choices[Math.floor(this.rng.frac()*choices.length)]);}else Object.assign(ghost,this.ghostStep(ghost));}}
  for(const ghost of this.ghosts)if(ghost.x===this.pac.x&&ghost.y===this.pac.y){if(this.time.now<this.powerUntil){ghost.x=23;ghost.y=13;this.spark(130+this.pac.x*28,91+this.pac.y*28);}else if(this.hit()){this.pac={x:1,y:1};this.pacDir={x:0,y:0};this.want={x:0,y:0};this.ghosts=[{x:23,y:13},{x:23,y:1},{x:1,y:13}];}}
  this.g.clear();const ox=130,oy=91,cell=28;for(let y=0;y<this.cells.length;y++)for(let x=0;x<this.cells[y].length;x++)if(this.cells[y][x]){this.g.fillStyle(0x314a71);this.g.fillRect(ox+x*cell-12,oy+y*cell-12,24,24);this.g.lineStyle(1,0x5f79a0);this.g.strokeRect(ox+x*cell-12,oy+y*cell-12,24,24);}for(const key of this.pellets){const[x,y]=key.split(',').map(Number);this.g.fillStyle(this.powers.has(key)?0x99e6de:0xefd298);this.g.fillCircle(ox+x*cell,oy+y*cell,this.powers.has(key)?6:2);}PixelAssets.begin(this);if(this.time.now>this.damageUntil||Math.floor(this.time.now/100)%2){const hero=PixelAssets.stamp(this,this.g,'porteño',Math.floor(this.elapsed*8)%4,ox+this.pac.x*cell,oy+this.pac.y*cell,28,28);hero.setFlipX(this.pacDir.x<0);}this.ghosts.forEach((ghost,i)=>{const icon=PixelAssets.stamp(this,this.g,i%2?'alien-green':'alien',Math.floor(this.elapsed*6)%2,ox+ghost.x*cell,oy+ghost.y*cell,28,28);if(this.time.now<this.powerUntil)icon.setTint(0x76bfe9);});PixelAssets.end(this);this.counter.setText(`CHISPAS ${this.score} / ${this.total}${this.time.now<this.powerUntil?' · ¡PODER ACTIVO!':''}`);
 }
 update(time,delta){if(this.ended||modalOpen)return;const dt=Math.min(delta,35)/1000;this.elapsed+=dt;this.status.setText(`MATES ${state.mates} / 3   ${Math.max(0,Math.ceil(this.limit-this.elapsed))} S`);if(this.elapsed>this.limit){this.hit();if(!this.ended)this.finish(false,'Se terminó el tiempo. Gastaste un mate, pero podés volver a intentar el desafío.');return;}const input=this.activeInput();if(this.kind==='breakout')this.breakoutUpdate(dt,input);else if(this.kind==='maze')this.mazeUpdate(dt,input);else this.shooterUpdate(dt,input);this.fx.clear();for(const e of this.effects){e.life-=dt;this.fx.lineStyle(2,0xf1ce7c,e.life/.3);this.fx.strokeCircle(e.x,e.y,(.3-e.life)*70);}this.effects=this.effects.filter(e=>e.life>0);}
}
window.game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,pixelArt:true,roundPixels:true,backgroundColor:'#111b28',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[BuenosAires,Arcade],audio:{noAudio:true}});
$('#start').onclick=()=>{started=true;$('#intro').classList.add('hidden');sync();world.findRoute();world.paintNavigation();save();};
$('#street-interact').onclick=()=>{if(state.mates===0&&state.thermos&&state.yerba)brew();else world?.interact();};$('#walk-cancel').onclick=()=>world?.stopWalking();
$('#brew').onclick=()=>{if(started&&!arcade&&!modalOpen)brew();};$('#map-button').onclick=toggleMap;$('#map-close').onclick=toggleMap;$('#radar-expand').onclick=toggleMap;
$('#sound').onclick=()=>{soundOn=!soundOn;$('#sound').textContent='SONIDO: '+(soundOn?'ON':'OFF');$('#sound').setAttribute('aria-pressed',String(soundOn));beep();};
$('#fullscreen').onclick=()=>{const panel=$('.arcade');if(document.fullscreenElement)document.exitFullscreen?.();else panel.requestFullscreen?.().catch(()=>toast('Este navegador no permite pantalla completa.'));};
$('#reset').onclick=()=>{if(!world||arcade||modalOpen)return;showModal('NUEVA PARTIDA','¿ARRANCAMOS DE CERO?','Vas a reiniciar las señales, los mates y la exploración guardada en este navegador.','REINICIAR LA CAMPAÑA',()=>{started=false;try{localStorage.removeItem(SAVE);}catch{}location.reload();});const cancel=document.createElement('button');cancel.className='text-button';cancel.textContent='CANCELAR';cancel.style.cssText='display:block;margin:20px auto 0';$('#modal .intro-card').append(cancel);cancel.onclick=()=>{modalOpen=false;$('#modal').classList.add('hidden');cancel.remove();};$('#modal-action').addEventListener('click',()=>cancel.remove(),{once:true});};
for(const button of document.querySelectorAll('[data-key]')){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held[button.dataset.key]=true;if(button.dataset.key==='action')world?.interact();});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>held[button.dataset.key]=false);}
window.addEventListener('blur',()=>{Object.keys(held).forEach(k=>held[k]=false);});document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});window.addEventListener('beforeunload',save);
