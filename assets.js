/* Original sprites authored in scripts/generate-assets.py. Native nearest-neighbour pixels. */
window.PixelAssets={
 sheets:[['porteño','hero',4],['alien','alien',2],['alien-green','alien-green',2],['ship','ship',2],['saucer','saucer',4],['drone','drone',4],['mate','mate',2],['mate-empty','mate-empty',1],['thermos','thermos',1],['yerba','yerba',1],['taxi','taxi',1],['wreck','wreck',1],['bus','bus',1],['tree','tree',1],['terminal','terminal',4],['explosion','explosion',6],['bullet','bullet',2],['plasma','plasma',2],['brick','brick',1]],
 preload(scene){
  for(const[key,file]of this.sheets)scene.load.spritesheet(key,`assets/${file}.png`,{frameWidth:32,frameHeight:32});
  for(const name of ['obelisk','congress','colon','san-martin','gran-rex'])scene.load.image(name,`assets/${name}.png`);
  scene.load.bitmapFont('sur-pixel','assets/arcade-font.png','assets/arcade-font.xml');
 },
 install(scene){
  for(const[key,,count]of this.sheets){if(count<2||scene.anims.exists(key+'-loop'))continue;scene.anims.create({key:key+'-loop',frames:scene.anims.generateFrameNumbers(key,{start:0,end:count-1}),frameRate:key==='porteño'?9:key==='explosion'?18:6,repeat:key==='explosion'?0:-1});}
 },
 animate(sprite,key){sprite.play(key+'-loop');return sprite;},
 stamp(scene,graphics,key,frame,x,y,w,h){
  // Reuse image objects for bullets, bricks and maze actors instead of allocating each frame.
  const pool=scene.pixelPool||(scene.pixelPool=[]),index=scene.pixelUsed||0;let icon=pool[index];
  if(!icon){icon=scene.add.image(0,0,key).setDepth(5);pool.push(icon);}
  icon.setTexture(key,frame).setPosition(Math.round(x),Math.round(y)).setDisplaySize(w,h).setVisible(true).setFlipX(false).clearTint();scene.pixelUsed=index+1;return icon;
 },
 begin(scene){scene.pixelUsed=0;},
 end(scene){for(let i=scene.pixelUsed;i<(scene.pixelPool?.length||0);i++)scene.pixelPool[i].setVisible(false);},
 text(scene,x,y,copy,size=16,color=0xeff3df){const clean=String(copy).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9 :./+!?-]/g,' ');return scene.add.bitmapText(x,y,'sur-pixel',clean,size).setTint(color);}
};
