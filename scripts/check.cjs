const assert=require('node:assert/strict');
const fs=require('node:fs');
const B=require('../core.js');
const city=new B.CityMap(JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../map-data.json'))));
const targets=B.MISSIONS.map(m=>city.nearest(B.geo(m.lat,m.lon),true));
const spawn=city.nearest(B.geo(-34.6095,-58.394),true),blocked=new Set();
for(const e of city.edges)if(e.length>65&&B.radial(e.a)<2100&&e.id%29===0)blocked.add(e.id);
let from=spawn;
for(let stage=0;stage<5;stage++){
 const target=targets[stage];assert.ok(B.radial(target)>B.RINGS[stage],`${stage}: target outside its locked region`);
 const path=city.path(from,target,stage);assert.ok(path.length>1,`${stage}: target is reachable`);
 for(let i=1;i<path.length;i++)for(const l of path[i-1].links)if(l.node===path[i])blocked.delete(l.edge.id);
 from=target;
}
from=spawn;let total=0;
for(let stage=0;stage<5;stage++){
 const path=city.path(from,targets[stage],stage,blocked);assert.ok(path.length>1,`${stage}: wrecks preserve a route`);
 for(let i=1;i<path.length;i++){const e=path[i-1].links.find(l=>l.node===path[i]).edge;assert.ok(e.minRadius>=B.RINGS[stage]-2);assert.ok(!blocked.has(e.id));total+=e.length;}
 if(stage<4)assert.equal(city.path(from,targets[stage+1],stage,blocked).length,0,'Next inner mission is locked');
 from=targets[stage];
}
let s=B.initial();s.mates=0;s.thermos=1;s.yerba=1;B.brew(s);assert.equal(s.mates,1);assert.equal(s.thermos,0);assert.equal(s.yerba,0);B.brew(s);assert.equal(s.mates,1);
s.mates=3;s.thermos=1;s.yerba=1;B.brew(s);assert.equal(s.thermos,1);assert.equal(s.yerba,1);
s.x=spawn.x;s.y=spawn.y;assert.ok(B.validSave(s));assert.ok(!B.validSave({...s,stage:6}));assert.ok(!B.validSave({...s,mates:-1}));assert.ok(!B.validSave({...s,x:Infinity}));
assert.ok(city.data.streets.some(s=>s.name.includes('Corrientes')));assert.ok(city.data.streets.some(s=>s.name.includes('9 de Julio')));
console.log(`PASS: 5 mission routes, gated progression, ${blocked.size} permanent wrecks, mate recovery, save validation, geographic landmarks. Campaign route: ${Math.round(total/1.05)} m.`);
