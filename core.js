/* Shared geometry and campaign rules; runs in the browser and Node checks. */
(function(root){
'use strict';
const CENTER=3600,SIZE=7200,RINGS=[1000,580,330,140,0];
const geo=(lat,lon)=>({x:CENTER+(lon+58.3815704)*91660*1.05,y:CENTER-(lat+34.6037389)*111320*1.05});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const radial=p=>Math.hypot(p.x-CENTER,p.y-CENTER);
function project(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return{x:a.x+dx*t,y:a.y+dy*t,t};}
const MISSIONS=[
 {name:'La señal de Congreso',place:'Plaza del Congreso',lat:-34.6094,lon:-58.3918,type:'invaders',label:'INVASORES DEL SUR',copy:'La resistencia detectó una flota sobre Congreso. Buscá la terminal celeste y defendé el barrio.',goal:'Destruí 18 invasores. Flechas / A D para moverte; Espacio para disparar.',reward:'Primera interferencia anulada. Los autos de la zona exterior ya no bloquean el paso.'},
 {name:'Corrientes no se apaga',place:'Teatro San Martín',lat:-34.60425,lon:-58.3883,type:'breakout',label:'ROMPEBLOQUES CÓSMICO',copy:'Un muro de energía corta Corrientes, a la altura del Teatro San Martín. Rompé su generador.',goal:'Rompé los 24 bloques. Mové la paleta con flechas / A D; Espacio lanza la pelota.',reward:'¡Volvió la luz a Corrientes! Cayó el segundo cerco alienígena.'},
 {name:'El fantasma del Colón',place:'Teatro Colón',lat:-34.6006,lon:-58.3833,type:'maze',label:'LABERINTO PORTEÑO',copy:'Los bichos se metieron en el Colón. Recuperá todas las chispas del laberinto y seguí avanzando.',goal:'Juntá todos los puntos con flechas / WASD. Las chispas grandes te dejan espantar fantasmas.',reward:'El Colón vuelve a ser nuestro. Se habilitó el camino a los teatros.'},
 {name:'Última función',place:'Teatro Gran Rex',lat:-34.6031,lon:-58.3787,type:'galaga',label:'ESCUADRÓN CORRIENTES',copy:'La escolta de la nave nodriza custodia el Gran Rex. Derribala para abrir la Plaza de la República.',goal:'Derribá 20 naves que atacan en picada. Flechas / A D y Espacio. Esquivá sus disparos.',reward:'¡La escolta cayó! El Obelisco quedó al alcance. Falta la nave nodriza.'},
 {name:'El Obelisco es nuestro',place:'Obelisco · Plaza de la República',lat:-34.6037389,lon:-58.3815704,type:'boss',label:'OPERACIÓN OBELISCO',copy:'Llegaste, che. Entrá al último desafío y liberá el símbolo de Buenos Aires.',goal:'Destruí el núcleo de la nave nodriza: 35 impactos. Flechas / A D y Espacio. Esquivá los abanicos de plasma.',reward:'BUENOS AIRES LIBERADA'}
];
class CityMap{
 constructor(data){this.data=data;this.nodes=[];this.edges=[];this.grid=new Map();this.byKey=new Map();
  const node=(x,y)=>{const k=Math.round(x*2)+','+Math.round(y*2);if(!this.byKey.has(k)){const n={x,y,id:this.nodes.length,links:[]};this.byKey.set(k,n);this.nodes.push(n);}return this.byKey.get(k);};
  for(const road of data.streets){for(let i=1;i<road.points.length;i++){const [ax,ay]=road.points[i-1],[bx,by]=road.points[i];if([ax,ay,bx,by].some(v=>v<35||v>SIZE-35))continue;const a=node(ax,ay),b=node(bx,by);if(distance(a,b)<1)continue;const wide=/9 de Julio/i.test(road.name)?25:/avenida/i.test(road.name)?31:22;const e={a,b,name:road.name,width:wide,id:this.edges.length,length:distance(a,b)};e.minRadius=radial(project({x:CENTER,y:CENTER},a,b));this.edges.push(e);a.links.push({node:b,edge:e});b.links.push({node:a,edge:e});for(let gx=Math.floor((Math.min(ax,bx)-45)/128);gx<=Math.floor((Math.max(ax,bx)+45)/128);gx++)for(let gy=Math.floor((Math.min(ay,by)-45)/128);gy<=Math.floor((Math.max(ay,by)+45)/128);gy++){let k=gx+','+gy;if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(e);}}}
 }
 nearby(p){return this.grid.get(Math.floor(p.x/128)+','+Math.floor(p.y/128))||[];}
 nearest(p,global=false){let best=null;for(const e of global?this.edges:this.nearby(p)){let q=project(p,e.a,e.b),d=distance(p,q);if(!best||d<best.d)best={...q,d,edge:e};}return best;}
 nearestNode(p){let best=this.nodes[0],d=Infinity;for(const n of this.nodes){const v=distance(n,p);if(v<d){best=n;d=v;}}return best;}
 path(from,to,stage,blocked=new Set()){
  const a=this.nearestNode(from),b=this.nearestNode(to),open=[a],dist=new Map([[a.id,0]]),prev=new Map(),done=new Set(),radius=RINGS[Math.min(stage,4)];
  while(open.length){open.sort((x,y)=>(dist.get(y.id)+distance(y,b))-(dist.get(x.id)+distance(x,b)));const n=open.pop();if(done.has(n.id))continue;if(n===b){const result=[b];let v=b;while(prev.has(v.id)){v=prev.get(v.id);result.push(v);}return result.reverse();}done.add(n.id);for(const l of n.links){if(l.edge.minRadius<radius-2||blocked.has(l.edge.id))continue;const nd=dist.get(n.id)+l.edge.length;if(nd<(dist.get(l.node.id)??Infinity)){dist.set(l.node.id,nd);prev.set(l.node.id,n);open.push(l.node);}}}return [];
 }
 ringCrossings(radius){let result=[];for(const e of this.edges){const dx=e.b.x-e.a.x,dy=e.b.y-e.a.y,ax=e.a.x-CENTER,ay=e.a.y-CENTER,A=dx*dx+dy*dy,B=2*(ax*dx+ay*dy),C=ax*ax+ay*ay-radius*radius,D=B*B-4*A*C;if(D<0)continue;for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)])if(t>=0&&t<=1)result.push({x:e.a.x+dx*t,y:e.a.y+dy*t,angle:Math.atan2(dy,dx),width:e.width,edge:e});}return result;}
}
function initial(){return{stage:0,mates:3,thermos:0,yerba:0,x:null,y:null,discovered:[],pickups:[],won:false};}
function validSave(v){return v&&Number.isInteger(v.stage)&&v.stage>=0&&v.stage<=5&&Number.isInteger(v.mates)&&v.mates>=0&&v.mates<=3&&['thermos','yerba'].every(k=>Number.isInteger(v[k])&&v[k]>=0&&v[k]<100)&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=SIZE&&v.y>=0&&v.y<=SIZE&&Array.isArray(v.discovered)&&Array.isArray(v.pickups)&&v.discovered.length<10000&&v.pickups.length<1000;}
function brew(s){if(s.mates>=3)return'Ya tenés los tres mates listos.';if(s.thermos<1||s.yerba<1)return'Necesitás un termo y una yerba. Buscá las provisiones verdes del barrio.';s.thermos--;s.yerba--;s.mates++;return'Un amargo más. +1 mate. ¡Vamos, todavía!';}
const api={CENTER,SIZE,RINGS,geo,distance,radial,project,MISSIONS,CityMap,initial,validSave,brew};if(typeof module!=='undefined')module.exports=api;else root.BA=api;
})(typeof window!=='undefined'?window:globalThis);
