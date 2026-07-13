'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const script=read('script.js');
const index=read('index.html');
const style=read('style.css');
const audio=read('audio.js');

const upgradeCost=(growth,level)=>Math.floor(20*Math.pow(growth,Math.max(0,level)));
const turtleHp=level=>Math.floor(70*Math.pow(1.18,Math.max(0,level-1)));
const bossHp=index=>Math.floor(18000*[1,1.15,1.28,1.42,1.62,1.85,2.08,2.35,2.68,3.05][index]*Math.pow(1.22,index));
const critChance=luck=>Math.min(.33,.03+Math.min(100,luck)*.003);
const bossCritChance=luck=>Math.min(.20,.02+Math.min(100,luck)*.0018);
const critDamage=luck=>4+Math.max(0,luck-100)*.08;
const bossCritDamage=luck=>Math.min(5,2.5+Math.max(0,luck-100)*.025);
const closeTo=(actual,expected)=>Math.abs(actual-expected)<1e-9;

for(const [name,growth] of Object.entries({ball:1.34,damage:1.42,speed:1.38,crit:1.54})){
  assert.equal(upgradeCost(growth,0),20,name+' must start at 20 gold');
  const costs=Array.from({length:14},(_,level)=>upgradeCost(growth,level));
  assert(costs.every((cost,index)=>index===0||cost>costs[index-1]),name+' costs must rise every level');
}

const turtleCurve=Array.from({length:10},(_,index)=>turtleHp(index+1));
const bossCurve=Array.from({length:10},(_,index)=>bossHp(index));
assert(turtleCurve.every((hp,index)=>index===0||hp>turtleCurve[index-1]),'turtle HP must rise through the first boss segment');
assert(bossCurve.every((hp,index)=>index===0||hp>bossCurve[index-1]),'boss HP must rise through the tower');
assert.equal(turtleCurve[0],70);
assert.equal(turtleCurve[9],310);
assert.equal(bossCurve[0],18000);

assert.equal(critChance(0),.03);
assert(closeTo(critChance(100),.33));
assert(closeTo(critChance(500),.33));
assert.equal(bossCritChance(0),.02);
assert(closeTo(bossCritChance(100),.20));
assert.equal(critDamage(100),4);
assert.equal(critDamage(125),6);
assert.equal(bossCritDamage(100),2.5);
assert.equal(bossCritDamage(500),5);
assert.equal(Math.floor(Math.sqrt(12000/12000)),1,'first prestige point should unlock at 12K total gold');

const finalSetBoss=script.slice(script.lastIndexOf('function setBoss(){'),script.indexOf('\nfunction drawBossAsset',script.lastIndexOf('function setBoss(){')));
assert(!finalSetBoss.includes('purple'),'Purple Hearts must not increase boss HP');
assert(script.includes('player.maxHp=3+(s.perm.bossHp||0)*3'),'hero must start boss fights with 3 HP');
assert(script.includes("function setupTowerProgress()"),'tower progress UI must be installed');
assert(script.includes("classList.add('firstBuyCue')"),'first purchase cue must be available');
assert(style.includes('.towerProgress'),'tower progress must be styled');
assert(audio.includes("root.IdleTurtleAudio={unlock,play}"),'event sound module must expose its API');
assert(index.includes('audio.js?v=0.63.0'),'audio module must load before gameplay');
assert(index.includes('v0.63.0 First Run &amp; Balance'),'release version must be visible');

const ids=[...index.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'HTML element IDs must remain unique');
assert(index.indexOf('audio.js?v=0.63.0')<index.indexOf('script.js?v=0.63.0'),'audio must load before gameplay');

console.log('Regression checks passed: economy, crit, HP, first-run UI and audio.');
