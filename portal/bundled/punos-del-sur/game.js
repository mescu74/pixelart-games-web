(() => {
  'use strict';
  const W = 1280, H = 720, GROUND = 590, FLOOR = 630;
  const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d', { alpha:false });
  const live = document.querySelector('#live');
  ctx.imageSmoothingEnabled = false;
  const art = {};
  const asset = (key, url) => new Promise((resolve, reject) => {
    const img = new Image(); img.onload = () => { art[key] = img; resolve(img); };
    img.onerror = () => reject(new Error(`No se pudo cargar ${url}`)); img.src = url;
  });
  const fighters = [
    {name:'Mora “Redoblante” Ferreyra',tag:'LA MURGUERA',style:'Rápida · cadena de golpes',super:'Redoblante relámpago',color:'#ed6fa4',accent:'#ffd264',speed:405,power:0.92,special:0},
    {name:'Tano “El Muelle” Ríos',tag:'EL BOXEADOR',style:'Fuerte · alcance y potencia',super:'Tres golpes del Dock',color:'#55a7eb',accent:'#f4cb58',speed:345,power:1.2,special:1},
    {name:'Luz “Rayo” Quiroga',tag:'LA GAUCHA',style:'Versátil · patada giratoria',super:'Zapateo sísmico',color:'#e39351',accent:'#efd689',speed:375,power:1.03,special:2},
    {name:'Rolo “Carrito” Medina',tag:'EL INVENTOR',style:'Técnica · amague y envión',super:'Carrito turbo',color:'#a9db55',accent:'#e8f4b9',speed:390,power:0.98,special:3}
  ];
  const files = [
    ['assets/fighters/1-idle.png','assets/fighters/1-attack.png'],
    ['assets/fighters/2-idle.png','assets/fighters/2-attack.png'],
    ['assets/fighters/3-idle.png','assets/fighters/3-attack.png'],
    ['assets/fighters/4-idle.png','assets/fighters/4-attack.png']
  ];
  let screen='loading', selected=0, player=null, cpu=null, round=0, mates=3, score=0, best=0;
  let now=0,last=0,roundTime=68,shake=0,callout='',calloutUntil=0,paused=false,muted=false;
  let particles=[],floating=[], keys=new Set(), audio=null, musicTimer=null, musicStep=0;
  try { best=Number(localStorage.getItem('punos-del-sur:best:v1'))||0; } catch {}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand=(a,b)=>a+Math.random()*(b-a);
  const loadAll=async()=>{
    await Promise.all([asset('cover','assets/cover.webp'),asset('stage','assets/arena/barrio-mugica.webp'),
      ...files.flatMap((pair,i)=>[asset(`idle${i}`,pair[0]),asset(`attack${i}`,pair[1])])]);
    screen='title'; frame(0);
  };
  function setCallout(text,ms=1450){callout=text;calloutUntil=now+ms;live.textContent=text;}
  function readBest(){try{return Number(localStorage.getItem('punos-del-sur:best:v1'))||0}catch{return 0}}
  function writeBest(){best=Math.max(best,score);try{localStorage.setItem('punos-del-sur:best:v1',String(best))}catch{}}

  function bootAudio(){
    if(muted||audio)return;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    audio=new AC();audio.resume();
    const master=audio.createGain();master.gain.value=.15;master.connect(audio.destination);audio.master=master;
    const notes=[196,246.94,293.66,369.99,293.66,246.94,220,329.63,392,329.63,293.66,246.94,164.81,246.94,293.66,329.63];
    const tick=()=>{
      if(!audio||muted||screen==='title'||screen==='select'||paused){musicTimer=setTimeout(tick,180);return;}
      const t=audio.currentTime, f=notes[musicStep++%notes.length];
      const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.11,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+.13);o.connect(g).connect(master);o.start(t);o.stop(t+.14);
      if(musicStep%4===0){const b=audio.createOscillator(),bg=audio.createGain();b.type='triangle';b.frequency.setValueAtTime(90,t);b.frequency.exponentialRampToValueAtTime(34,t+.13);bg.gain.setValueAtTime(.11,t);bg.gain.exponentialRampToValueAtTime(.001,t+.15);b.connect(bg).connect(master);b.start(t);b.stop(t+.16);}
      musicTimer=setTimeout(tick,155);
    };tick();
  }
  function tone(freq=180,dur=.07,type='square',gain=.18,slide=0){
    if(!audio||muted)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,freq+slide),t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g).connect(audio.master);o.start(t);o.stop(t+dur+.01);
  }
  function sfx(kind){if(kind==='quick')tone(300,.075,'square',.13,130);if(kind==='heavy')tone(145,.13,'sawtooth',.17,-75);if(kind==='special'){tone(430,.22,'triangle',.22,-260);setTimeout(()=>tone(120,.18,'sawtooth',.18,190),70)}if(kind==='hit')tone(95,.12,'square',.19,-50);if(kind==='block')tone(620,.08,'triangle',.12,-220);if(kind==='ko'){tone(190,.55,'triangle',.2,-150)}if(kind==='select')tone(540,.07,'square',.11,80)}

  function newFighter(index,x,isCpu=false){return{index,x,y:GROUND,v:0,jump:0,health:100,max:100,face:isCpu?-1:1,attack:null,attackCd:0,stun:0,guard:0,flash:0,aiAt:0,walking:false,combo:0,comboUntil:0,isCpu};}
  function setOpponent(){
    const index=(selected+1+round)%fighters.length;
    player=newFighter(selected,335,false);cpu=newFighter(index,945,true);roundTime=68;
    setCallout(`${round===0?'¡PRIMER COMBATE!':`¡COMBATE ${round+1}!`}  ·  ${fighters[index].tag}`,1850);
  }
  function beginTournament(){bootAudio();screen='fight';round=0;mates=3;score=0;particles=[];floating=[];setOpponent();canvas.focus();}
  function beginSelect(){bootAudio();screen='select';selected=0;sfx('select');canvas.focus();}
  function hitTest(attacker,target,kind){
    const dist=Math.abs(target.x-attacker.x), heightDiff=Math.abs(target.jump-attacker.jump);
    const range=kind==='special'?330:kind==='heavy'?232:178;
    return dist<range && heightDiff<160 && target.health>0;
  }
  function move(f,dir,dt){if(!dir)return;f.walking=true;f.x=clamp(f.x+dir*(fighters[f.index].speed*dt),135,W-135);}
  function attack(f,kind){
    if(!f||f.health<=0||f.attack||now<f.attackCd||f.stun>now||paused)return;
    if(kind==='special'&&!f.isCpu&&meter<100){setCallout('CARGÁ LA BARRA CON GOLPES',700);sfx('block');return;}
    if(kind==='special'&&!f.isCpu)meter=0;
    const duration=kind==='quick'?.30:kind==='heavy'?.49:.72;
    f.attack={kind,start:now,duration,hitAt:kind==='quick'?.115:kind==='heavy'?.20:.27,didHit:false};
    f.attackCd=now+(kind==='quick'?365:kind==='heavy'?660:1100);
    f.lunge=kind==='quick'?66:kind==='heavy'?112:kind==='special'?190:0;
    sfx(kind==='quick'?'quick':kind==='heavy'?'heavy':'special');
    if(kind==='special')setCallout(fighters[f.index].super.toUpperCase(),850);
  }
  let meter=0;
  function spawnHit(x,y,color,power=1){
    const n=Math.round(13*power);for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(90,420)*power;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.18,.44),age:0,size:rand(4,12)*power,color:i%4===0?'#fff2b2':color});}
    for(let i=0;i<4;i++)particles.push({x,y,vx:rand(-120,120),vy:rand(-220,-30),life:.38,age:0,size:rand(5,10),color:'#fff'});
    shake=Math.max(shake,kindShake(power));
  }
  function kindShake(power){return power>1.2?14:power>1?9:5;}
  function floatText(x,y,text,color){floating.push({x,y,text,color,life:.75,age:0});}
  function landHit(attacker,target,kind){
    if(target.guard>now){sfx('block');target.stun=now+120;spawnHit((attacker.x+target.x)/2,GROUND-115,'#75e7ef',.5);floatText(target.x,GROUND-270,'¡CUBIERTO!','#9df2e5');return;}
    const factor=fighters[attacker.index].power,base=kind==='quick'?8:kind==='heavy'?14:kind==='special'?27:10,damage=base*factor;
    target.health=clamp(target.health-damage,0,100);target.stun=now+(kind==='special'?550:kind==='heavy'?390:265);target.flash=now+180;
    const dir=Math.sign(target.x-attacker.x)||1;target.x=clamp(target.x+dir*(kind==='special'?88:kind==='heavy'?52:25),135,W-135);target.jump=kind==='special'?53:kind==='heavy'?30:12;
    spawnHit(target.x,GROUND-target.jump-150,fighters[attacker.index].accent,kind==='special'?1.65:kind==='heavy'?1.15:.8);floatText(target.x,GROUND-target.jump-245,`-${Math.round(damage)}`,kind==='special'?'#ffe16d':'#fff');sfx('hit');
    if(!attacker.isCpu){score+=Math.round(damage*12);meter=clamp(meter+(kind==='special'?0:kind==='heavy'?25:16),0,100);attacker.combo++;attacker.comboUntil=now+1250;if(attacker.combo>1)floatText(attacker.x,GROUND-330,`${attacker.combo} ¡AL HILO!`,fighters[attacker.index].accent);}
    if(target.health<=0)resolveKO(attacker,target);
  }
  function resolveKO(winner,loser){
    winner.attack=null;loser.attack=null;screen='ko';sfx('ko');spawnHit(loser.x,GROUND-130,'#ffdf7c',1.6);setCallout(winner.isCpu?'¡TE QUEDASTE SIN AIRE!':'¡PUNTO PARA EL BARRIO!',1800);
    if(winner.isCpu){mates--;score=Math.max(0,score-100);}
    else {score+=1600;round++;if(round>=3){writeBest();setTimeout(()=>{screen='victory';sfx('special');setCallout('¡CAMPEONA DEL SUR!',3000)},1700);return;}mates=Math.min(3,mates+1);}
    setTimeout(()=>{if(screen!=='ko')return;if(mates<=0){writeBest();screen='gameover';setCallout('');return;}screen='fight';setOpponent();player.health=winner.isCpu?82:100;meter=winner.isCpu?Math.max(20,meter-20):Math.min(100,meter+15);},1750);
  }
  function playerInput(dt){
    if(screen!=='fight'||!player||paused)return;
    let dir=0;if(keys.has('a')||keys.has('arrowleft'))dir--;if(keys.has('d')||keys.has('arrowright'))dir++;
    if(dir){move(player,dir,dt);player.face=dir;}
    player.walking=!!dir;
    if((keys.has('w')||keys.has('arrowup'))&&player.jump<=1&&player.v===0){player.v=900;sfx('quick');}
    player.guard=keys.has('s')||keys.has('arrowdown')?now+100:0;
    if(keys.has('j')){attack(player,'quick');keys.delete('j');}
    if(keys.has('k')){attack(player,'heavy');keys.delete('k');}
    if(keys.has('l')){attack(player,'special');keys.delete('l');}
  }
  function cpuThink(dt){
    if(screen!=='fight'||!cpu||paused||cpu.health<=0||cpu.stun>now)return;
    const dx=player.x-cpu.x,d=Math.abs(dx);cpu.face=Math.sign(dx)||-1;
    if(d>212)move(cpu,Math.sign(dx),dt*.8);else if(d<106)move(cpu,-Math.sign(dx),dt*.25);
    if(now>=cpu.aiAt){
      cpu.aiAt=now+rand(460,960);
      if(d<248&&player.attack&&Math.random()<.38)cpu.guard=now+450;
      else if(d<290)attack(cpu,Math.random()<.24?'heavy':'quick');
      else if(d<430&&Math.random()<.17)attack(cpu,'special');
    }
  }
  function keepApart(){
    if(!player||!cpu||player.health<=0||cpu.health<=0)return;
    const dx=cpu.x-player.x,min=184,dist=Math.abs(dx);if(dist>=min)return;
    const dir=dx===0?1:Math.sign(dx),push=(min-dist)/2;
    player.x=clamp(player.x-dir*push,135,W-135);cpu.x=clamp(cpu.x+dir*push,135,W-135);
  }
  function updateFighter(f,other,dt){
    if(!f)return;f.walking=false;
    if(f.v){f.jump+=f.v*dt;f.v-=1900*dt;if(f.jump<=0){f.jump=0;f.v=0;for(let i=0;i<6;i++)particles.push({x:f.x+rand(-24,24),y:GROUND-4,vx:rand(-60,60),vy:rand(-120,-15),life:.25,age:0,size:rand(3,7),color:'#dcb673'});}}
    if(f.attack){const elapsed=(now-f.attack.start)/1000,progress=clamp(elapsed/f.attack.duration,0,1);if(f.lunge&&progress<.48)f.x=clamp(f.x+f.face*f.lunge*dt*2,135,W-135);if(!f.attack.didHit&&elapsed>=f.attack.hitAt){f.attack.didHit=true;if(hitTest(f,other,f.attack.kind))landHit(f,other,f.attack.kind);else if(f.attack.kind==='special'){for(let i=0;i<9;i++)particles.push({x:f.x+f.face*rand(90,260),y:GROUND-rand(90,245),vx:f.face*rand(120,360),vy:rand(-100,100),life:.32,age:0,size:rand(4,10),color:fighters[f.index].accent});}}
      if(elapsed>=f.attack.duration)f.attack=null;
    }
    f.x=clamp(f.x,135,W-135);
  }
  function update(dt){
    if(screen==='fight'&&!paused){roundTime-=dt;if(roundTime<=0){roundTime=68;if(player.health>=cpu.health){cpu.health=0;resolveKO(player,cpu)}else{player.health=0;resolveKO(cpu,player)}}player.face=Math.sign(cpu.x-player.x)||player.face;cpu.face=Math.sign(player.x-cpu.x)||cpu.face;playerInput(dt);cpuThink(dt);updateFighter(player,cpu,dt);updateFighter(cpu,player,dt);keepApart();if(player.comboUntil<now)player.combo=0;}
    particles=particles.filter(p=>p.age<p.life);for(const p of particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=520*dt;}
    floating=floating.filter(p=>p.age<p.life);for(const p of floating){p.age+=dt;p.y-=28*dt;}
    shake=Math.max(0,shake-dt*34);
  }
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
  function text(str,x,y,size=22,color='#fff5dc',align='left',weight='800',shadow=true){ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`${weight} ${size}px ui-monospace,Menlo,monospace`;ctx.fillStyle=color;if(shadow){ctx.shadowColor='#05080c';ctx.shadowBlur=7;}ctx.fillText(str,x,y);ctx.shadowBlur=0;}
  function panel(x,y,w,h,fill='rgba(9,16,24,.82)',stroke='rgba(248,208,120,.8)'){ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();}
  function drawMate(x,y,size=30,lit=true){
    ctx.save();ctx.translate(x,y);const c=lit?'#5e9f58':'#28343a';rect(8,8,size*.48,size*.70,c);rect(6,12,size*.20,size*.52,lit?'#87bd64':'#39474b');rect(size*.45,2,size*.12,size*.32,lit?'#d7be73':'#596260');rect(size*.53,0,size*.10,size*.28,lit?'#f4e3ad':'#596260');rect(7,5,size*.52,size*.12,lit?'#325542':'#3c4b4b');rect(size*.20,0,size*.22,size*.18,lit?'#8acb59':'#3a4b4a');rect(size*.34,-2,size*.19,size*.22,lit?'#5ba756':'#3b4c49');ctx.restore();
  }
  function drawBackdrop(){
    if(art.stage){const drift=Math.sin(now*.00011)*9;ctx.drawImage(art.stage,-drift,0,W+drift*2,H);}
    const shade=ctx.createLinearGradient(0,0,0,H);shade.addColorStop(0,'rgba(7,11,20,.42)');shade.addColorStop(.38,'rgba(8,13,19,.08)');shade.addColorStop(.76,'rgba(11,13,18,.12)');shade.addColorStop(1,'rgba(4,7,10,.56)');rect(0,0,W,H,shade);
    // Festival bunting and passing lights add a little life above the ring.
    for(let i=0;i<10;i++){const x=(i*151+now*.025)%W,y=58+Math.sin(now*.001+i)*4;ctx.fillStyle=['#f2c552','#58c8bd','#eb79a4'][i%3];ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+25,y+5);ctx.lineTo(x+12,y+23);ctx.closePath();ctx.fill();}
    rect(0,FLOOR,W,H-FLOOR,'rgba(8,11,14,.48)');ctx.strokeStyle='rgba(255,221,139,.22)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,FLOOR);ctx.lineTo(W,FLOOR);ctx.stroke();
    for(let i=0;i<18;i++){const x=(i*79+Math.sin(now*.0013+i*2)*11)%W,y=580+Math.sin(now*.001+i)*4;ctx.fillStyle=`rgba(255,220,128,${.16+.10*Math.sin(now*.003+i)})`;ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fill();}
  }
  function drawPortrait(f,idx,x,footY,height,forceAttack=false){
    const img=(forceAttack||f?.attack)?art[`attack${idx}`]:art[`idle${idx}`];if(!img)return;
    const ratio=img.width/img.height,drawH=height,drawW=drawH*ratio,bob=f?.walking?Math.sin(now*.026)*5:Math.sin(now*.006+idx)*2;
    const jump=f?f.jump:0;ctx.save();if(f&&f.face<0){ctx.translate(x,0);ctx.scale(-1,1);ctx.translate(-x,0);}
    if(f?.flash>now)ctx.globalAlpha=.72+.24*Math.sin(now*.08);
    ctx.drawImage(img,x-drawW/2,footY-drawH-bob-jump,drawW,drawH);
    if(f?.flash>now){ctx.globalCompositeOperation='screen';ctx.globalAlpha=.28;rect(x-drawW/2,footY-drawH-bob-jump,drawW,drawH,'#fff');}
    ctx.restore();
    if(f?.guard>now){ctx.strokeStyle='rgba(112,232,238,.9)';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(x,footY-drawH*.47,drawW*.43,drawH*.47,0,0,Math.PI*2);ctx.stroke();}
  }
  function drawHealth(x,y,w,value,color,reverse=false){
    panel(x,y,w,24,'rgba(5,10,16,.9)','rgba(255,255,255,.66)');const v=w*clamp(value/100,0,1);ctx.save();ctx.beginPath();ctx.roundRect(x+4,y+4,w-8,16,5);ctx.clip();rect(reverse?x+w-4-v:x+4,y+4,v,16,color);rect(reverse?x+w-4-v:x+4,y+4,v,5,'rgba(255,255,255,.28)');ctx.restore();
  }
  function drawHUD(){
    rect(0,0,W,118,'rgba(7,14,22,.92)');rect(0,116,W,4,'rgba(255,216,117,.76)');
    text('P1',44,28,15,'#72dfd1');text(fighters[player.index].name,44,58,22,'#fff7e6');drawHealth(44,78,475,player.health,'#48d4bb');
    for(let i=0;i<3;i++)drawMate(48+i*34,126,28,i<mates);text('MATES',162,139,14,'#ddd3b7');
    text(`MARCADOR  ${score.toString().padStart(6,'0')}`,45,170,14,'#d4cab0');
    text(`${String(Math.max(0,Math.ceil(roundTime))).padStart(2,'0')}`,W/2,52,38,'#ffdf7e','center');
    text(`RONDA ${round+1} / 3`,W/2,88,14,'#e8d7ad','center');
    const enemy=fighters[cpu.index];text('CPU',W-44,28,15,'#f38c83','right');text(enemy.name,W-44,58,22,'#fff7e6','right');drawHealth(W-519,78,475,cpu.health,'#f27969',true);
    for(let i=0;i<1;i++)drawMate(W-78-i*34,126,28,true);text('MATE',W-158,139,14,'#ddd3b7','right');
    panel(489,145,302,21,'rgba(3,11,17,.82)','rgba(255,255,255,.3)');rect(493,149,294*meter/100,13,'#e7b751');text('RITMO',640,157,12,'#fff6d5','center');
  }
  function drawGame(){
    drawBackdrop();
    if(player&&cpu){
      const first=player.x<cpu.x?player:cpu,second=first===player?cpu:player;
      const make=(f)=>{const img=art[`idle${f.index}`],height=322;return {f,img,height,width:height*(img?.width||400)/(img?.height||590)};};
      for(const f of [first,second]){const a=make(f);ctx.fillStyle='rgba(0,0,0,.32)';ctx.beginPath();ctx.ellipse(f.x,GROUND-2,a.width*.34,10,0,0,Math.PI*2);ctx.fill();drawPortrait(f,f.index,f.x,GROUND,322);}
    }
    for(const p of particles){const k=1-p.age/p.life;rect(p.x,p.y,p.size*k,p.size*k,p.color);}
    for(const f of floating){ctx.globalAlpha=1-f.age/f.life;text(f.text,f.x,f.y,22,f.color,'center');ctx.globalAlpha=1;}
    drawHUD();
    if(callout&&now<calloutUntil){panel(390,215,500,52,'rgba(8,17,26,.86)','rgba(255,220,129,.78)');text(callout,W/2,242,19,'#fff0c3','center');}
    if(player.attack?.kind==='special'&&player.attack.didHit){ctx.save();ctx.globalAlpha=.22+.18*Math.sin(now*.025);rect(0,0,W,H,'#fff2bd');ctx.restore();}
    if(paused){rect(0,0,W,H,'rgba(4,9,15,.72)');panel(400,265,480,175,'rgba(14,26,34,.98)','rgba(255,214,112,.9)');text('PAUSA',W/2,320,48,'#ffe083','center');text('P o ESC para volver al combate',W/2,380,18,'#f4eee0','center');}
  }
  function drawTitle(){
    if(art.cover)ctx.drawImage(art.cover,0,0,W,H);else rect(0,0,W,H,'#10151b');
    rect(0,0,W,H,'rgba(5,9,18,.17)');const grad=ctx.createLinearGradient(0,390,0,H);grad.addColorStop(0,'rgba(7,11,19,0)');grad.addColorStop(.45,'rgba(6,10,17,.73)');grad.addColorStop(1,'rgba(5,9,16,.97)');rect(0,365,W,355,grad);
    panel(305,532,670,153,'rgba(6,15,22,.89)','rgba(255,219,130,.72)');text('TORNEO DE BARRIO  ·  4 PELEADORES  ·  3 RIVALES',W/2,560,17,'#93e1d4','center');text('APRETÁ ENTER PARA JUGAR',W/2,596,24,'#fff4d6','center');text('A / D MOVER  ·  W SALTAR  ·  S CUBRIR',W/2,631,13,'#ddd2b6','center');text('J / PUÑO     K / PATADA     L / ESPECIAL',W/2,656,13,'#ddd2b6','center');
    if(best>0)text(`RÉCORD  ${best.toString().padStart(6,'0')}`,W/2,678,13,'#ffdc83','center');text(muted?'♫ SONIDO: OFF  ·  M PARA CAMBIAR':'♫ SONIDO ARCADE  ·  M PARA SILENCIAR',W-28,26,13,'#f6e9c9','right');
  }
  function drawSelect(){
    if(art.stage)ctx.drawImage(art.stage,0,0,W,H);rect(0,0,W,H,'rgba(5,11,18,.71)');rect(0,0,W,105,'rgba(5,12,18,.9)');text('ELEGÍ A TU CAMPEÓN',W/2,45,32,'#ffe08b','center');text('A / D o tocá una carta  ·  ENTER para confirmar',W/2,80,15,'#c5e6dc','center');
    const cardW=274,startX=57,gap=32;
    fighters.forEach((f,i)=>{
      const x=startX+i*(cardW+gap),y=148,active=i===selected;panel(x,y,cardW,451,active?'rgba(22,39,44,.95)':'rgba(7,16,24,.86)',active?f.accent:'rgba(255,255,255,.25)');
      if(active){rect(x+2,y+3,cardW-4,5,f.accent);ctx.shadowColor=f.accent;ctx.shadowBlur=22;ctx.strokeStyle=f.accent;ctx.lineWidth=2;ctx.strokeRect(x+7,y+7,cardW-14,cardW*0+437);ctx.shadowBlur=0;}
      drawPortrait(null,i,x+cardW/2,y+298,252,false);text(String(i+1).padStart(2,'0'),x+22,y+27,13,f.accent);text(f.tag,x+cardW/2,y+320,18,'#fff4d8','center');text(f.name.split('“')[0].trim(),x+cardW/2,y+352,14,'#d4e9de','center','600');text(f.style,x+cardW/2,y+384,12,'#aebfc0','center','500');
      const p=5+i;for(let s=0;s<5;s++){rect(x+54+s*37,y+411,29,5,s<p?'#f0c75d':'#415156');}
      if(active){text('JUGADOR 1',x+cardW/2,y+436,12,f.accent,'center');}
    });
    panel(424,634,432,56,'rgba(7,16,24,.9)','rgba(255,219,130,.67)');text('ENTER  ·  CONFIRMAR PELEADOR',W/2,662,16,'#fff2d0','center');
  }
  function drawEnd(victory){
    if(art.cover)ctx.drawImage(art.cover,0,0,W,H);rect(0,0,W,H,'rgba(5,9,17,.62)');
    panel(270,215,740,300,'rgba(8,16,24,.94)',victory?'rgba(255,219,120,.9)':'rgba(225,123,106,.85)');
    text(victory?'¡CAMPEONA DEL SUR!':'SE APAGÓ LA RONDA',W/2,274,42,victory?'#ffe08a':'#ff9d8c','center');
    text(victory?'El barrio entero festeja tu victoria.':'Guardá el mate y volvé a la pelea.',W/2,335,19,'#f5ecda','center','600');
    text(`PUNTAJE  ${score.toString().padStart(6,'0')}`,W/2,389,24,'#93e1d4','center');text(`RÉCORD  ${best.toString().padStart(6,'0')}`,W/2,427,16,'#d4cdb6','center');
    panel(405,458,470,39,'rgba(255,255,255,.08)','rgba(255,255,255,.28)');text('ENTER PARA VOLVER AL TORNEO',W/2,477,14,'#fff0c6','center');
  }
  function frame(ts){
    requestAnimationFrame(frame);const dt=Math.min(.034,(ts-last)/1000||0);last=ts;now=ts;
    update(dt);ctx.save();if(shake>0)ctx.translate(rand(-shake,shake),rand(-shake,shake));
    if(screen==='loading'){rect(0,0,W,H,'#10151b');text('PREPARANDO EL TORNEO…',W/2,H/2,24,'#ffe08b','center');}
    else if(screen==='title')drawTitle();else if(screen==='select')drawSelect();else if(screen==='fight'||screen==='ko')drawGame();else if(screen==='victory')drawEnd(true);else if(screen==='gameover')drawEnd(false);
    ctx.restore();
  }
  function chooseAt(x,y){const cardW=274,startX=57,gap=32;if(y>=148&&y<=599){for(let i=0;i<4;i++){const left=startX+i*(cardW+gap);if(x>=left&&x<=left+cardW){selected=i;sfx('select');return true;}}}if(y>=622||x>400&&x<880&&y>600){beginTournament();return true;}return false;}
  canvas.addEventListener('pointerdown',e=>{
    e.preventDefault();const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
    if(screen==='title'){beginSelect();return;}if(screen==='select'){chooseAt(x,y);return;}if(screen==='victory'||screen==='gameover'){screen='title';sfx('select');return;}
  });
  const normalize=e=>e.key.toLowerCase();
  window.addEventListener('keydown',e=>{
    const k=normalize(e);if(['arrowleft','arrowright','arrowup','arrowdown',' ','enter'].includes(k))e.preventDefault();
    if(k==='m'){muted=!muted;if(audio){if(muted)audio.master.gain.setTargetAtTime(0,audio.currentTime,.02);else audio.master.gain.setTargetAtTime(.15,audio.currentTime,.02);}setCallout(muted?'SONIDO APAGADO':'SONIDO ACTIVADO',700);return;}
    if(k==='escape'||k==='p'){if(screen==='fight'){paused=!paused;keys.clear();sfx('select');}else if(screen==='title')beginSelect();return;}
    if(k==='enter'||k===' '){if(screen==='title')beginSelect();else if(screen==='select')beginTournament();else if(screen==='victory'||screen==='gameover')screen='title';return;}
    if(screen==='select'){if(k==='a'||k==='arrowleft'){selected=(selected+3)%4;sfx('select');}if(k==='d'||k==='arrowright'){selected=(selected+1)%4;sfx('select');}return;}
    if(screen==='fight'&&!paused&&['a','d','w','s','j','k','l','arrowleft','arrowright','arrowup','arrowdown'].includes(k))keys.add(k);
  });
  window.addEventListener('keyup',e=>keys.delete(normalize(e)));
  window.addEventListener('blur',()=>{keys.clear();if(screen==='fight')paused=true;});document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&screen==='fight')paused=true;});
  document.querySelectorAll('.touch-controls button').forEach(b=>{
    const k=b.dataset.key;const down=e=>{e.preventDefault();b.classList.add('active');if(screen==='title')beginSelect();if(screen==='select'){if(k==='a')selected=(selected+3)%4;if(k==='d')selected=(selected+1)%4;if(k==='j'||k==='k'||k==='l'||k==='w')beginTournament();sfx('select');return;}keys.add(k);};
    const up=e=>{e.preventDefault();b.classList.remove('active');keys.delete(k);};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointerleave',up);b.addEventListener('pointercancel',up);
  });
  loadAll().catch(err=>{screen='title';live.textContent='Error cargando los gráficos del juego';console.error(err);});requestAnimationFrame(frame);
})();
