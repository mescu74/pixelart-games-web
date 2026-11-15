/* Developer smoke checks. Run in a local browser's DevTools after the map loads.
   These checks exercise collision/scoring logic at accelerated time; they are
   not a substitute for human difficulty and accessibility playtesting. */
window.runArcadeSmoke=async function(stage){
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 started=true;modalOpen=false;state.stage=stage;state.mates=3;state.won=false;
 document.querySelector('#intro').classList.add('hidden');document.querySelector('#modal').classList.add('hidden');
 if(arcade){game.scene.stop('arcade');game.scene.resume('city');await sleep(50);arcade=null;}
 world.scene.launch('arcade',{kind:MISSIONS[stage].type});world.scene.pause();await sleep(100);
 const s=arcade;let frames=0;
 if(!s)return{stage,error:'scene did not launch'};
 if(s.kind==='maze'){
  for(;frames<16000&&!s.ended;frames++){
   s.time.now+=130;s.elapsed+=.13;
   // BFS to the nearest remaining pellet; move through the actual maze rules.
   const q=[{x:s.pac.x,y:s.pac.y,path:[]}],seen=new Set([s.pac.x+','+s.pac.y]);let step=null;
   while(q.length){const n=q.shift();if(s.pellets.has(n.x+','+n.y)){step=n.path[0];break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,y=n.y+dy,k=x+','+y;if(s.mazePass(x,y)&&!seen.has(k)){seen.add(k);q.push({x,y,path:n.path.length?n.path:[{x:dx,y:dy}]});}}}
   const input={left:step?.x===-1,right:step?.x===1,up:step?.y===-1,down:step?.y===1};
   // Ghost avoidance is tested separately; protect the route solver while it
   // verifies that every pellet can be collected through ordinary movement.
   s.powerUntil=s.time.now+500;s.mazeUpdate(.13,input);
  }
 }else for(;frames<18000&&!s.ended;frames++){
  s.time.now+=1000/60;s.elapsed+=1/60;
  if(s.kind==='breakout'){
   // Track the falling ball using the real paddle speed and bounce rules.
   const aim=s.ball.waiting?s.paddle.x:s.ball.x+Math.sin(s.elapsed*.7)*42;
   s.breakoutUpdate(1/60,{left:aim<s.paddle.x-3,right:aim>s.paddle.x+3,fire:true});
  }else{
   // Protect the aim solver in the final fight; damage/zero-life recovery is checked separately.
   if(s.kind==='boss')s.damageUntil=s.time.now+100;
   const alive=s.enemies.filter(e=>e.active);const target=s.boss||alive.sort((a,b)=>Math.abs(a.x-s.ship.x)-Math.abs(b.x-s.ship.x))[0];let aim=target?.x??480;
   const danger=s.hostile.filter(b=>b.y>300&&b.y<545);if(danger.length){let best=-Infinity;for(let x=35;x<925;x+=15){const travel=Math.abs(x-s.ship.x)/380;if(travel>.38)continue;let clearance=150;for(const b of danger){const t=(520-b.y)/b.vy;if(t<0||t>.9)continue;clearance=Math.min(clearance,Math.abs(x-(b.x+b.vx*t)));}const value=clearance-Math.abs(x-aim)*.09-Math.abs(x-s.ship.x)*.12;if(value>best){best=value;var safe=x;}}aim=safe??aim;}
   s.shooterUpdate(1/60,{left:aim<s.ship.x-4,right:aim>s.ship.x+4,fire:true});
  }
 }
 const result={stage,kind:s.kind,frames,score:s.score,bossHP:s.bossHP,mates:state.mates,ended:s.ended};
 await sleep(500);result.campaignStage=state.stage;result.won=state.stage===stage+1;return result;
};
