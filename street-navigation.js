/* Street navigation uses real road segments, including partial first/last edges. */
(function(root){
'use strict';
const B=typeof module!=='undefined'?require('./core.js'):root.BA;
const {distance,project,radial,RINGS,CENTER}=B;
const length=points=>points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);
function compact(points){return points.filter((p,i)=>!i||distance(p,points[i-1])>.2).map(p=>({x:p.x,y:p.y}));}
function clearPart(a,b,edge,stage,blocked){
 if(radial(project({x:CENTER,y:CENTER},a,b))<RINGS[Math.min(stage,4)]-2)return false;
 if(blocked.has(edge.id)){const mid={x:(edge.a.x+edge.b.x)/2,y:(edge.a.y+edge.b.y)/2};if(distance(project(mid,a,b),mid)<edge.width/2+10)return false;}
 return true;
}
function route(city,from,to,stage,blocked=new Set()){
 const start=city.nearest(from)||city.nearest(from,true),end=city.nearest(to)||city.nearest(to,true);if(!start||!end)return[];
 let best=[],cost=Infinity;
 if(start.edge===end.edge&&clearPart(start,end,start.edge,stage,blocked)){best=compact([start,end]);cost=length(best);}
 for(const a of [start.edge.a,start.edge.b]){
  if(!clearPart(start,a,start.edge,stage,blocked))continue;
  for(const b of [end.edge.a,end.edge.b]){
   if(!clearPart(b,end,end.edge,stage,blocked))continue;
   const nodes=city.path(a,b,stage,blocked);if(!nodes.length)continue;
   const candidate=compact([start,...nodes,end]),value=length(candidate);if(value<cost){best=candidate;cost=value;}
  }
 }
 return best;
}
// Drop the already-walked part: the guidance never points to the old starting node.
function remaining(points,position){
 if(points.length<2)return compact(points);
 let best=null,along=0;
 for(let i=1;i<points.length;i++){
  const q=project(position,points[i-1],points[i]),d=distance(position,q);
  if(!best||d<best.d-.05)best={q,d,index:i};
  along+=distance(points[i-1],points[i]);if(along>500)break;
 }
 return compact([best.q,...points.slice(best.index)]);
}
function instruction(points,position){
 const rest=remaining(points,position),total=length(rest);
 if(!rest.length)return{symbol:'?',text:'Buscá un cruce abierto',distance:0,total:0,point:position,missing:true};
 if(rest.length<2)return{symbol:'◆',text:'Llegaste a tu destino',distance:0,total,point:rest[0]||position};
 const headingPoint=rest.find((p,i)=>i&&distance(p,rest[0])>5)||rest[1],heading=Math.atan2(headingPoint.y-position.y,headingPoint.x-position.x),compass=['→','↘','↓','↙','←','↖','↑','↗'],forward=compass[(Math.round(heading/(Math.PI/4))+8)%8];
 let walked=0;const first=rest.findIndex((p,i)=>i&&distance(rest[i-1],p)>4);let previous=null;
 for(let i=Math.max(1,first);i<rest.length;i++){
  const a=rest[i-1],b=rest[i],d=distance(a,b);if(d<4){walked+=d;continue;}
  const angle=Math.atan2(b.y-a.y,b.x-a.x);
  if(previous!=null){const turn=Math.atan2(Math.sin(angle-previous),Math.cos(angle-previous));if(Math.abs(turn)>.65){const right=turn>0,meters=Math.round(walked/1.05);return{symbol:meters>20?forward:right?'↱':'↰',text:meters>20?`Seguí ${meters} m por esta calle`:'Doblá'+(right?' a la derecha':' a la izquierda'),after:meters>20?'Después, doblá'+(right?' a la derecha':' a la izquierda'):'',turn:right?'right':'left',distance:walked,total,point:a};}}
  previous=angle;walked+=d;
 }
 const point=rest[1],angle=Math.atan2(point.y-position.y,point.x-position.x),arrows=['→','↘','↓','↙','←','↖','↑','↗'];
 return{symbol:arrows[(Math.round(angle/(Math.PI/4))+8)%8],text:total<40?'Acercate al punto marcado':'Seguí por esta calle',distance:total,total,point:rest.at(-1)};
}
function roadLabel(name){return String(name).replace(/R�os/g,'Ríos').replace(/Tucum�n/g,'Tucumán').replace(/Per�n/g,'Perón').replace(/C�rdoba/g,'Córdoba').replace(/S�enz/g,'Sáenz').replace(/Pe�a/g,'Peña').replace(/Mart�n/g,'Martín').replace(/Bartolom�/g,'Bartolomé').replace(/Rodr�guez/g,'Rodríguez').replace(/M�xico/g,'México').replace(/Avenida /g,'Av. ');}
const api={route,remaining,instruction,length,clearPart,roadLabel};if(typeof module!=='undefined')module.exports=api;else root.StreetNavigation=api;
})(typeof window!=='undefined'?window:globalThis);
