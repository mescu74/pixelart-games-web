/* Original, code-drawn pixel art. No traced or extracted commercial sprites. */
(function(){'use strict';
const P={ink:'#202039',deep:'#372940',rose:'#bf6d7b',pink:'#e59b99',light:'#ffc1a5',gold:'#f8ce80',teal:'#8be2d5',white:'#fff0da'};
const backdrop=new Image(),pendingBackdrops=[];
backdrop.onload=()=>{for(const entry of pendingBackdrops)paintBackdrop(entry.canvas,entry.stage);pendingBackdrops.length=0;};
backdrop.src='assets/rosada-dusk-v2.png';
function paintBackdrop(canvas,stage){const c=canvas.getContext('2d');c.clearRect(0,0,960,720);c.imageSmoothingEnabled=false;c.drawImage(backdrop,0,0,960,720);if(stage===1||stage===2){c.fillStyle=stage===1?'rgba(183,76,54,.08)':'rgba(33,57,106,.2)';c.fillRect(0,0,960,720);}}
function rect(c,x,y,w,h,color){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function text(c,t,x,y,size=14,color=P.white,align='left'){c.font=`bold ${size}px monospace`;c.textAlign=align;c.textBaseline='top';c.fillStyle=P.ink;c.fillText(t,x+1,y+2);c.fillStyle=color;c.fillText(t,x,y);}
function arch(c,x,y,w,h){rect(c,x,y+10,w,h-10,'#6c455c');rect(c,x+4,y+4,w-8,h-4,'#ffbb9e');rect(c,x+8,y+10,w-16,h-10,'#563950');rect(c,x+12,y+14,w-24,h-14,'#30314a');rect(c,x+12,y+30,w-24,2,'#bc8585');rect(c,x+w/2-1,y+12,2,h-12,'#c18b89');rect(c,x+11,y+14,3,h-16,'#e4ad94');rect(c,x+16,y+20,5,9,'#cfa374');rect(c,x+15,y+h-8,w-30,4,'#e0b181');rect(c,x-3,y+h,w+6,5,'#f6b59b');}
function background(stage){const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
const sky=stage===2?['#161f3c','#33425c','#785e79']:stage===1?['#413650','#89596b','#df9a86']:['#25334d','#687a93','#e2a38e'];
for(let y=0;y<720;y+=4){const a=y/720;const col=a<.4?sky[0]:a<.72?sky[1]:sky[2];rect(c,0,y,960,4,col);}for(let i=0;i<80;i++){const x=(i*137+71)%960,y=(i*73+20)%220;rect(c,x,y,2,2,stage===2?'#f5d5b5':'#98a4b5');}
rect(c,786,86,36,36,stage===2?'#f6deac':'#ffcaa1');rect(c,780,94,48,20,stage===2?'#f6deac':'#ffcaa1');
// Far city silhouettes and treetops.
for(let i=0;i<18;i++){const x=i*61-25,y=340+(i*41)%110;rect(c,x,y,48,330,'#34364b');rect(c,x+8,y-10,32,10,'#414256');for(let yy=y+20;yy<620;yy+=23)for(let xx=x+9;xx<x+40;xx+=14)rect(c,xx,yy,4,7,'#9a7e79');}
rect(c,78,116,804,580,'#503850');rect(c,92,126,776,554,'#aa6276');rect(c,102,136,756,540,'#cd7f88');
// The two wings and recessed central balcony of the Casa Rosada.
rect(c,100,140,260,526,'#d78b91');rect(c,600,140,260,526,'#d78b91');rect(c,360,163,240,503,'#b56d80');
for(let y=170;y<665;y+=14){rect(c,106,y,248,1,'#c67b86');rect(c,606,y,248,1,'#c67b86');rect(c,365,y,230,1,'#a65f76');}
for(let floor=0;floor<5;floor++){const y=170+floor*100;for(const x of[126,208,290,626,708,790])arch(c,x,y,46,67);for(const x of[396,462,528])arch(c,x,y+7,38,61);
for(const x of[110,190,272,352,602,684,766,848]){rect(c,x,y-8,10,89,'#f0a298');rect(c,x+6,y,4,77,'#b96d7c');rect(c,x-3,y-8,16,7,'#ffc1a3');rect(c,x-2,y+73,14,7,'#f5ae98');}
rect(c,95,y+85,770,10,'#91556b');rect(c,90,y+80,780,6,'#ffc0a3');rect(c,103,y+95,754,4,'#d28a8b');}
// Roofline, ornamental balustrade, cornices and central crest.
rect(c,78,122,804,12,'#754b62');rect(c,78,117,804,6,'#fbc2a5');for(let x=90;x<880;x+=19){rect(c,x,102,7,16,'#f2b29d');rect(c,x-2,100,11,4,'#fbd0b0');}rect(c,78,94,804,7,'#efa99b');
rect(c,350,104,260,53,'#e49a96');rect(c,343,101,274,8,'#ffd0ae');rect(c,368,111,224,34,'#b87686');poly(c,[[420,102],[480,74],[540,102]],'#f4b39c');poly(c,[[437,100],[480,81],[523,100]],'#b47480');rect(c,466,93,28,35,'#edc88f');rect(c,472,97,16,25,'#8acbcb');rect(c,472,108,16,5,'#fff0ce');rect(c,478,98,4,7,'#f5d179');
// Main entrance and balcony doors.
arch(c,437,573,86,90);rect(c,426,657,108,7,'#e5ad9b');rect(c,415,664,130,7,'#b88487');rect(c,406,671,148,7,'#e4b29f');
rect(c,383,343,194,8,'#f8ba9f');rect(c,390,325,180,4,'#e5ad9b');for(let x=394;x<572;x+=12)rect(c,x,329,4,15,'#65485d');
// Ground tiles, fencing, lampposts and palms.
rect(c,0,682,960,38,'#33344c');for(let y=688;y<720;y+=12){rect(c,0,y,960,2,'#595064');for(let x=(y%24?0:16);x<960;x+=32)rect(c,x,y,2,12,'#595064');}
for(const x of[40,920]){rect(c,x,432,5,253,'#222b40');rect(c,x-7,432,19,6,'#8e8790');rect(c,x-8,411,21,21,'#e4c292');rect(c,x-4,413,13,17,'#ffe6ac');rect(c,x-9,407,23,5,'#263246');rect(c,x-4,401,13,6,'#263246');}
for(const x of[20,942]){rect(c,x,310,8,207,'#5d505a');for(let i=0;i<6;i++){let sign=i%2?1:-1,yy=300+i*8;poly(c,[[x+3,321],[x+sign*(36+i*5),yy],[x+sign*(50+i*4),yy+8],[x+sign*20,yy+17]],'#263e43');}}
// Tiny hand-placed stone patina, deterministic and cached.
for(let i=0;i<320;i++){let x=110+(i*113)%737,y=148+(i*71)%509;rect(c,x,y,i%3?3:6,1,i%2?'#e8a295':'#bd7584');}
if(backdrop.complete&&backdrop.naturalWidth)paintBackdrop(canvas,stage);else pendingBackdrops.push({canvas,stage});return canvas;}
function crest(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);poly(c,[[0,0],[13,0],[13,13],[6,19],[0,13]],'#eecf85');rect(c,2,2,9,11,'#78c5db');rect(c,2,6,9,4,'#fff1d5');rect(c,5,2,3,4,'#efc86f');rect(c,5,10,3,6,'#b68c60');c.restore();}
function drawHero(c,x,y,t=0,mode='idle',dir=1,scale=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir*scale,scale);const walking=mode==='run',climb=mode==='climb',salute=mode==='salute',step=walking?Math.round(Math.sin(t)*4):0,bob=walking?Math.abs(Math.sin(t))*1.3:Math.sin(t*.7)*.5;c.translate(0,-bob);
// Feet and pleated trousers.
rect(c,-13,-21,11,16,'#1e2943');rect(c,2,-21,11,16,'#344363');rect(c,-13+step,-9,11,7,'#26304c');rect(c,2-step,-9,11,7,'#344363');rect(c,-16+step,-4,15,4,'#121c32');rect(c,2-step,-4,16,4,'#121c32');rect(c,-14+step,-4,9,1,'#7d8292');
// Jacket silhouette, hand and shoulder animations.
poly(c,[[-16,-43],[-9,-48],[9,-48],[17,-41],[15,-20],[-15,-20]],'#18263f');poly(c,[[-12,-43],[-6,-45],[0,-33],[-2,-21],[-14,-21]],'#415676');poly(c,[[4,-45],[11,-43],[14,-21],[2,-21],[0,-34]],'#344766');poly(c,[[-6,-46],[0,-35],[6,-46]],'#fff0db');poly(c,[[-2,-44],[2,-44],[3,-35],[0,-31],[-3,-35]],'#9d4c63');rect(c,-1,-30,2,2,'#dab878');rect(c,-1,-25,2,2,'#dab878');rect(c,8,-33,5,2,'#e8c7ab');
// Emblem on the lapel, a miniature original justicialist-inspired shield.
crest(c,-11,-39,.4);
if(salute){poly(c,[[10,-42],[16,-46],[24,-64],[30,-62],[23,-42],[16,-33]],'#415676');rect(c,24,-68,6,8,'#e7af86');rect(c,24,-73,2,7,'#f4c09a');rect(c,29,-74,2,8,'#f4c09a');}
else if(climb){rect(c,-19,-45-(Math.sin(t)>0?8:0),7,19,'#415676');rect(c,13,-45-(Math.sin(t)<0?8:0),7,19,'#415676');rect(c,-19,-49-(Math.sin(t)>0?8:0),7,6,'#f4c09a');rect(c,13,-49-(Math.sin(t)<0?8:0),7,6,'#f4c09a');}
else{poly(c,[[-16,-42],[-21,-30-step],[-18,-24-step],[-11,-31]],'#344766');rect(c,-20,-27-step,6,7,'#e9af88');poly(c,[[13,-42],[19,-31+step],[17,-25+step],[11,-32]],'#415676');rect(c,14,-27+step,6,7,'#f4c09a');}
// Neck, large caricature head, pomaded hair, eye and profile nose.
rect(c,-4,-53,10,9,'#c58d74');poly(c,[[-12,-69],[-6,-75],[8,-75],[14,-69],[14,-60],[19,-58],[17,-54],[12,-54],[10,-48],[-3,-48],[-12,-55]],'#191f34');poly(c,[[-9,-67],[-4,-71],[8,-71],[12,-66],[12,-59],[17,-57],[12,-55],[8,-50],[-1,-50],[-8,-55]],'#edba91');rect(c,-9,-61,4,7,'#c78870');rect(c,-7,-61,3,4,'#f5ca9e');rect(c,7,-64,6,2,'#5d4144');rect(c,9,-61,2,3,'#172138');rect(c,9,-53,4,1,'#9b5a5b');rect(c,0,-69,8,2,'#f9d1a8');poly(c,[[-11,-68],[-12,-73],[-7,-79],[5,-80],[13,-76],[14,-70],[5,-70],[1,-73],[-7,-72],[-7,-65]],'#222434');rect(c,-5,-77,12,2,'#586174');rect(c,1,-74,10,1,'#3e475e');c.restore();}
function drawGorilla(c,x,y,t,throwing=false,scale=1){c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);const b=Math.sin(t*2)*2,a=throwing?Math.sin(t*12)*12:Math.sin(t*2)*3;c.translate(0,b);
// Knuckles, broad shoulders and asymmetric raised throwing arm.
poly(c,[[-32,-53],[-48,-45],[-53,-17],[-43,-7],[-33,-13],[-28,-35]],'#25253d');poly(c,[[-31,-51],[-43,-43],[-47,-20],[-38,-17],[-30,-35]],'#4b3e5c');poly(c,[[26,-54],[39,-50],[48,-31-a],[45,-18-a],[32,-18-a],[24,-36]],'#25253d');poly(c,[[28,-48],[35,-45],[41,-29-a],[36,-23-a],[28,-35]],'#61506e');rect(c,-52,-19,14,12,'#9b7d87');rect(c,-52,-10,14,4,'#6c566d');rect(c,34,-25-a,14,12,'#b08e91');
poly(c,[[-29,-60],[-11,-70],[18,-67],[32,-54],[30,-24],[20,-8],[-24,-8],[-35,-30]],'#29263f');poly(c,[[-25,-53],[-10,-60],[14,-58],[26,-49],[21,-18],[-20,-18],[-29,-34]],'#59455f');poly(c,[[-14,-46],[11,-46],[19,-28],[9,-13],[-13,-14],[-22,-29]],'#ac8790');rect(c,-18,-7,15,7,'#25253d');rect(c,9,-9,18,9,'#25253d');rect(c,-23,-5,22,5,'#3e334e');rect(c,9,-5,24,5,'#3e334e');
// Head, ears, swept brow and expressive muzzle. Own purple-gray palette.
rect(c,-24,-81,12,18,'#29263f');rect(c,18,-82,12,18,'#29263f');rect(c,-21,-77,7,10,'#9f7885');rect(c,20,-78,7,10,'#9f7885');poly(c,[[-17,-94],[9,-98],[24,-87],[25,-64],[15,-51],[-12,-52],[-25,-66],[-26,-83]],'#27253d');poly(c,[[-16,-88],[8,-91],[19,-83],[18,-66],[10,-57],[-10,-58],[-20,-68],[-20,-80]],'#68516b');rect(c,-15,-78,29,18,'#b28c94');poly(c,[[-17,-78],[-10,-85],[-2,-81],[1,-77],[6,-83],[17,-82],[20,-76]],'#3b304c');rect(c,-11,-76,8,4,'#f5dab2');rect(c,7,-76,8,4,'#f5dab2');rect(c,-5,-76,3,4,'#23263b');rect(c,7,-76,3,4,'#23263b');rect(c,-5,-68,15,6,'#392e45');rect(c,-3,-67,4,2,'#201e32');rect(c,5,-67,3,2,'#201e32');rect(c,-8,-58,22,4,'#30243c');rect(c,-5,-58,16,2,'#f3ceac');rect(c,-12,-89,12,2,'#8e7185');
// Red cravat and gold pin add a distinct character design.
poly(c,[[-5,-48],[3,-42],[10,-49],[9,-37],[2,-32],[-5,-39]],'#e16c76');poly(c,[[2,-33],[9,-28],[4,-14],[-2,-19]],'#9f4d68');rect(c,-19,-39,4,5,'#f5cc7c');c.restore();}
function mate(c,x,y,s=1,empty=false){c.save();c.translate(x,y);c.scale(s,s);rect(c,3,-13,2,12,empty?'#676775':'#d0e7e2');rect(c,5,-16,3,3,empty?'#676775':'#d0e7e2');poly(c,[[-8,-5],[-10,1],[-8,10],[-3,14],[5,14],[10,7],[10,0],[7,-5]],empty?'#434357':'#815844');rect(c,-7,-4,14,4,empty?'#646174':'#e6ba78');rect(c,-6,-3,12,2,empty?'#353647':'#718857');rect(c,-6,2,3,7,empty?'#555368':'#b67e51');rect(c,-4,11,10,2,empty?'#555368':'#d5a76c');c.restore();}
function hazard(c,h,t){c.save();c.translate(Math.round(h.x),Math.round(h.y));if(h.type==='urn'){c.rotate(Math.sin(h.rotation)*.22);rect(c,-17,-16,34,31,'#34334b');rect(c,-14,-14,28,26,'#dba976');rect(c,-14,-14,7,26,'#a87560');rect(c,-16,-18,32,5,'#f2c78e');rect(c,-6,-17,13,2,'#41394b');rect(c,-7,-7,17,12,'#fff0d1');rect(c,-4,-5,11,3,'#7fb7c3');rect(c,-4,0,8,2,'#b0a4a0');rect(c,4,-24,9,9,'#f6e5c4');rect(c,6,-23,5,2,'#79a8bb');}
else if(h.type==='file'){c.rotate(Math.sin(h.rotation)*.06);rect(c,-21,-11,42,24,'#352c45');rect(c,-18,-8,35,18,'#dfbe82');rect(c,-15,-13,17,6,'#f0d29c');rect(c,-18,0,35,10,'#b98a67');rect(c,-13,-5,25,2,'#8f7567');rect(c,-9,-1,16,2,'#8f7567');rect(c,0,-9,3,20,'#be636b');}
else{c.rotate(Math.sin(t*5+h.id)*.35);rect(c,-15,-15,29,30,'#4b4861');rect(c,-13,-17,26,30,'#fff0d3');rect(c,-10,-13,20,5,'#80b9cb');for(let yy=-4;yy<8;yy+=5)rect(c,-9,yy,16,2,'#9c9ca8');rect(c,9,9,4,4,'#d7b7a6');}c.restore();}
function flag(c,x,y,t,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);rect(c,0,-72,3,90,'#d6c9b3');rect(c,-2,-75,7,5,'#f2cf85');for(let i=0;i<48;i+=4){const wave=Math.sin(t*3+i*.08)*3;rect(c,3+i,-69+wave,4,9,'#7bc5df');rect(c,3+i,-60+wave,4,9,'#fff0d8');rect(c,3+i,-51+wave,4,9,'#7bc5df');}rect(c,26,-59+Math.sin(t*3+2)*3,4,5,'#ebbe61');c.restore();}
function ladder(c,x,y1,y2,active){rect(c,x-13,y1-3,26,y2-y1+7,'#20243a');rect(c,x-11,y1,4,y2-y1,'#6b939b');rect(c,x+8,y1,4,y2-y1,'#a5d6d0');for(let y=y1+6;y<y2;y+=12){rect(c,x-8,y,16,4,active?'#ffe1a3':'#a5d6d0');rect(c,x-8,y+4,16,2,'#496f7f');}}
// Cache animation frames at their native sprite resolution before nearest-neighbor scaling.
const frames=new Map();
function sprite(c,x,y,phase,mode,dir,scale,kind){const frame=Math.floor(((phase%(Math.PI*2))+Math.PI*2)%(Math.PI*2)*16/(Math.PI*2)),key=kind+mode+frame;let sheet=frames.get(key);if(!sheet){sheet=document.createElement('canvas');sheet.width=128;sheet.height=128;const sc=sheet.getContext('2d');if(kind==='hero')drawHero(sc,64,110,frame*Math.PI/8,mode,1,1);else drawGorilla(sc,64,110,frame*Math.PI/8,mode,1);frames.set(key,sheet);}c.save();c.translate(Math.round(x),Math.round(y));c.scale(dir*scale,scale);c.imageSmoothingEnabled=false;c.drawImage(sheet,-64,-110);c.restore();}
function hero(c,x,y,t=0,mode='idle',dir=1,scale=1){sprite(c,x,y,t,mode,dir,scale,'hero');}
function gorilla(c,x,y,t,throwing=false,scale=1){sprite(c,x,y,t,throwing,1,scale,'gorilla');}
window.RosadaArt={P,rect,poly,text,background,hero,gorilla,mate,hazard,flag,ladder,crest};})();
