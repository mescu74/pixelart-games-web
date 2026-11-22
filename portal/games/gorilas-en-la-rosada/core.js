(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.RosadaCore=api;})(typeof window!=='undefined'?window:this,()=>{
'use strict';
const FLOORS=[660,560,460,360,260,160];
const ROUTES=[[790,180,770,200,760],[690,260,800,170,700],[800,160,700,250,780]];
const NAMES=['LA PLAZA','LOS BALCONES','LA AZOTEA'];
const LABELS=['URNAS','PRENSA','CONTROLES','DECRETOS','OPOSICION'];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function create(stage=0,score=0,lives=3){return{stage,score,lives,time:0,state:'playing',player:{x:140,y:660,vy:0,dir:1,ground:0,climb:null,inv:2,walk:0},checkpoint:0,maxFloor:0,charge:100,hazards:[],pickups:FLOORS.slice(1).map((y,i)=>({x:i%2?470:530,y:y-26,taken:false})),spawn:3.5,serial:0,combo:0,comboTime:0,events:[]};}
function event(s,type,data={}){s.events.push({type,...data});}
function hit(s){if(s.player.inv>0||s.state!=='playing')return;s.lives--;s.combo=0;s.hazards=[];event(s,'hit');if(s.lives<=0){s.state='lost';return;}s.player={x:s.checkpoint?ROUTES[s.stage][s.checkpoint-1]:140,y:FLOORS[s.checkpoint],vy:0,dir:1,ground:s.checkpoint,climb:null,inv:3,walk:0};}
function spawn(s){const type=s.serial%5===4?'paper':s.serial%3===2?'file':'urn';s.hazards.push({id:s.serial++,type,label:LABELS[(s.serial-1)%LABELS.length],x:280,y:145,floor:5,dir:1,drop:false,vy:0,rotation:0,jumped:false});event(s,'throw',{type});}
function step(s,input,dt){s.events=[];if(s.state!=='playing')return s;dt=clamp(dt,0,.025);s.time+=dt;const p=s.player;p.inv=Math.max(0,p.inv-dt);s.comboTime-=dt;if(s.comboTime<=0)s.combo=0;
const dx=(input.right?1:0)-(input.left?1:0),dy=(input.down?1:0)-(input.up?1:0);if(dx)p.dir=dx;
if(input.salute&&s.charge>=100){s.charge=0;const removed=s.hazards.filter(h=>Math.hypot(h.x-p.x,h.y-(p.y-25))<155);s.score+=removed.length*150;s.hazards=s.hazards.filter(h=>!removed.includes(h));p.inv=Math.max(p.inv,.8);event(s,'salute',{x:p.x,y:p.y-25});}
if(p.climb===null&&dy&&p.ground!==null){let lower=dy<0?p.ground:p.ground-1;if(lower>=0&&lower<5&&Math.abs(p.x-ROUTES[s.stage][lower])<27){p.climb=lower;p.ground=null;p.x=ROUTES[s.stage][lower];}}
if(p.climb!==null){p.y+=dy*155*dt;p.walk+=Math.abs(dy)*dt*10;const lo=p.climb;if(p.y<=FLOORS[lo+1]){p.y=FLOORS[lo+1];p.ground=lo+1;p.climb=null;event(s,'floor',{floor:p.ground});}else if(p.y>=FLOORS[lo]){p.y=FLOORS[lo];p.ground=lo;p.climb=null;}}
else{p.x=clamp(p.x+dx*222*dt,94,866);p.walk+=Math.abs(dx)*dt*12;if(input.jump&&p.ground!==null){p.vy=-425;p.ground=null;event(s,'jump');}if(p.ground===null){const old=p.y;p.vy+=1180*dt;p.y+=p.vy*dt;if(p.vy>0){for(let i=5;i>=0;i--)if(old<=FLOORS[i]+.01&&p.y>=FLOORS[i]){p.y=FLOORS[i];p.vy=0;p.ground=i;event(s,'land',{x:p.x,y:p.y});break;}}}}
if(p.ground!==null&&p.ground>s.maxFloor){s.maxFloor=p.ground;s.score+=100;event(s,'rise');if(p.ground%2===0){s.checkpoint=p.ground;event(s,'checkpoint',{floor:p.ground});}}
for(const k of s.pickups)if(!k.taken&&Math.abs(k.x-p.x)<26&&Math.abs(k.y-(p.y-25))<36){k.taken=true;s.charge=Math.min(100,s.charge+35);s.score+=250;event(s,'pickup',{x:k.x,y:k.y});}
s.spawn-=dt;if(s.spawn<=0){spawn(s);s.spawn=4.0-s.stage*.55;}
for(const h of s.hazards){const speed=(h.type==='file'?132:h.type==='paper'?88:114)+s.stage*19;h.rotation+=h.dir*dt*5;
if(!h.drop){h.x+=h.dir*speed*dt;h.y=FLOORS[h.floor]-15-(h.type==='paper'?19+Math.sin(s.time*5+h.id)*12:Math.abs(Math.sin(h.rotation))*3);if(h.x>870||h.x<90){h.x=clamp(h.x,90,870);h.drop=true;h.vy=0;h.jumped=false;}}
else{h.vy+=700*dt;h.y+=h.vy*dt;if(h.floor>0&&h.y>=FLOORS[h.floor-1]-15){h.floor--;h.y=FLOORS[h.floor]-15;h.dir*=-1;h.drop=false;}}
const nx=Math.abs(p.x-h.x),ny=Math.abs(p.y-28-h.y);if(nx<25&&ny<(h.type==='paper'?24:27))hit(s);
if(!h.jumped&&nx<24&&p.climb===null&&p.y<h.y-24&&p.y>h.y-105){h.jumped=true;s.combo=Math.min(5,s.combo+1);s.comboTime=3.5;const points=100*s.combo;s.score+=points;s.charge=Math.min(100,s.charge+12);event(s,'dodge',{x:h.x,y:h.y,points,label:h.label});}}
s.hazards=s.hazards.filter(h=>h.y<740);
if(s.state==='playing'&&p.ground===5&&p.x>580&&p.x<660){s.state='won';s.score+=1000+Math.max(0,Math.floor(180-s.time))*10;event(s,'win');}return s;}
return{FLOORS,ROUTES,NAMES,LABELS,create,step,hit,spawn,clamp};
});
