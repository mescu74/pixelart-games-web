const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const B=require('../core.js'),N=require('../street-navigation.js');
const city=new B.CityMap(JSON.parse(fs.readFileSync(path.join(__dirname,'../map-data.json'))));
const targets=B.MISSIONS.map(m=>city.nearest(B.geo(m.lat,m.lon),true)),spawn=city.nearest(B.geo(-34.6095,-58.394),true),blocked=new Set();
for(const e of city.edges)if(e.length>65&&B.radial(e.a)<2100&&e.id%29===0)blocked.add(e.id);
let previous=spawn;for(let stage=0;stage<5;stage++){const original=city.path(previous,targets[stage],stage);for(let i=1;i<original.length;i++)for(const l of original[i-1].links)if(l.node===original[i])blocked.delete(l.edge.id);previous=targets[stage];}
previous=spawn;let total=0;
for(let stage=0;stage<5;stage++){
 const points=N.route(city,previous,targets[stage],stage,blocked);assert.ok(points.length>1,`mission ${stage}: route exists`);assert.ok(B.distance(points[0],previous)<2);assert.ok(B.distance(points.at(-1),targets[stage])<2);
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];assert.ok(B.radial(B.project({x:B.CENTER,y:B.CENTER},a,b))>=B.RINGS[stage]-2,'No forbidden ring crossing');}
 total+=N.length(points);previous=targets[stage];
}
// A character halfway along an edge must continue ahead, not backtrack to a node.
const straight=[{x:0,y:0},{x:100,y:0},{x:100,y:100}];
const rest=N.remaining(straight,{x:70,y:0});assert.equal(rest[0].x,70);assert.equal(N.length(rest),130);
assert.equal(N.instruction(straight,{x:70,y:0}).turn,'right');assert.equal(N.instruction(straight,{x:70,y:0}).symbol,'→');
assert.equal(N.instruction([{x:0,y:0},{x:100,y:0},{x:100,y:-100}],{x:20,y:0}).turn,'left');
// Same-edge routing should neither detour nor pass through a physical wreck.
const edge=city.edges.find(e=>e.length>80&&B.radial(e.a)>1100),a=B.project({x:edge.a.x*.75+edge.b.x*.25,y:edge.a.y*.75+edge.b.y*.25},edge.a,edge.b),b=B.project({x:edge.a.x*.25+edge.b.x*.75,y:edge.a.y*.25+edge.b.y*.75},edge.a,edge.b);
assert.equal(N.clearPart(a,b,edge,0,new Set([edge.id])),false);
assert.ok(N.clearPart(a,b,edge,0,new Set()));
assert.equal(N.roadLabel('Avenida Entre R�os'),'Av. Entre Ríos');
console.log(`PASS: five continuous mission routes (${Math.round(total/1.05)} m), forward progress, left/right instructions, same-edge wreck protection and street labels.`);
