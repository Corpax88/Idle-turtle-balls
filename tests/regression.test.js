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
const heroSkillBonus=(path,tier,hits,missing)=>{
  if(path==='red')return Math.min(.75,.03*tier*Math.min(5,hits+1));
  if(path==='laser')return .025*tier;
  if(path==='bomb')return .06+.035*tier;
  if(path==='blade')return .04*tier;
  if(path==='dark')return Math.min(.46,.025*tier+missing*.07*tier);
  return 0;
};
const closeTo=(actual,expected)=>Math.abs(actual-expected)<1e-9;

for(const [name,growth] of Object.entries({ball:1.30,damage:1.36,speed:1.33,crit:1.48})){
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
assert.equal(heroSkillBonus('red',5,4,0),.75);
assert.equal(heroSkillBonus('laser',5,0,0),.125);
assert(closeTo(heroSkillBonus('bomb',5,0,0),.235));
assert.equal(heroSkillBonus('blade',5,0,0),.20);
assert.equal(heroSkillBonus('dark',5,0,1),.46);
assert.equal(Math.floor(Math.sqrt(12000/12000)),1,'first prestige point should unlock at 12K total gold');

const finalSetBoss=script.slice(script.lastIndexOf('function setBoss(){'),script.indexOf('\nfunction drawBossAsset',script.lastIndexOf('function setBoss(){')));
assert(!finalSetBoss.includes('purple'),'Purple Hearts must not increase boss HP');
assert(script.includes('player.maxHp=3+(s.perm.bossHp||0)*3'),'hero must start boss fights with 3 HP');
assert(script.includes("function setupTowerProgress()"),'tower progress UI must be installed');
assert(script.includes("classList.add('firstBuyCue')"),'first purchase cue must be available');
assert(style.includes('.towerProgress'),'tower progress must be styled');
assert(audio.includes("root.IdleTurtleAudio={unlock,play}"),'event sound module must expose its API');
assert(index.includes('audio.js?v=0.65.0'),'audio module must load before gameplay');
assert(index.includes('v0.65.0 Button Guides'),'release version must be visible');

for(const path of ['red','laser','bomb','blade','dark']){
  assert(script.includes(path+':{name:'),'hero skill path '+path+' must exist');
}
assert(script.includes("function heroSkillPierces(){return heroSkillPath()==='laser'&&heroSkillTier()>=3}"),'Rail Drive must pierce from Tier 3');
assert(script.includes("if(path!=='dark'||tier<1||turtle.death>0)return"),'Void Core must steer the hero ball');
assert(script.includes("if(path!=='bomb'||tier<3||turtle.death>0)return"),'Blast Core must gain proximity detonation');
assert(script.includes("if(path==='blade'&&tier>=2)"),'Razor Drive must gain ricochet speed');
assert(script.includes("if(path==='red'&&tier>=2)hero.life"),'Impact Core must extend flight time');
assert(index.includes('<h2>Hero Ball Skills</h2>'),'upgrade panel must expose hero ball skills');
assert(style.includes('.weaponTier[data-weapon="dark"].owned'),'skill paths must have distinct visual states');
assert.equal((script.match(/\{short:'[^']+',name:'[^']+',detail:'/g)||[]).length,25,'every hero skill tier must have a description');
assert(script.includes("detail.id='heroSkillDetail'"),'hero skill detail strip must be installed');
assert(script.includes("b.addEventListener('pointerdown',inspect)"),'skill explanations must work on touch');
assert(style.includes('.heroSkillDetail'),'skill explanations must be styled');
assert(script.includes('function setupPrestigePreview()'),'prestige preview must be installed');
assert(script.includes("panel.setAttribute('aria-modal','true')"),'prestige confirmation must be an accessible modal');
assert(script.includes("s.money=0;s.total=0;s.balls=1+s.perm.startBall"),'confirmed prestige must reset the run');
assert(style.includes('.prestigeTooltip'),'prestige hover information must be styled');
assert(style.includes('.prestigeConfirm'),'prestige confirmation must be styled');
assert(script.includes('function setupButtonHelp()'),'global button help must be installed');
assert(script.includes("button.id==='doPrestige'||button.classList.contains('weaponTier')"),'specialized Prestige and skill help must remain separate');
assert(script.includes("document.addEventListener('pointerover'"),'button help must support hover');
assert(script.includes("document.addEventListener('pointerdown'"),'button help must support touch');
assert(script.includes("document.addEventListener('focusin'"),'button help must support keyboard focus');
assert(style.includes('.buttonHelpTooltip'),'global button help must be styled');
const buttonHelpBlock=script.slice(script.indexOf('const BUTTON_HELP={'),script.indexOf('function setupButtonHelp()'));
for(const id of ['buyBall','buyPower','buySpeed','buyLuck','mergeBalls','openShop','buyPurple','openStats','openScores','openDev','openSettings','summonBoss','psIncome','psStartBall','psRare','psPrestige','psBossHp','psBossDmg','psBossBalls','psBossSpeed','psBossLuck','cancelMerge','confirmMerge','cancelPrestige','confirmPrestige','saveScore','clearScores','devSpawn','devResetSave','startPlay','startScores','startSound','startFullscreen','startSettings','gameSoundOption','gameSideOption','gameFxOption','gameFullscreenOption']){
  assert(buttonHelpBlock.includes(id+':['),'button help must describe '+id);
}

const ids=[...index.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'HTML element IDs must remain unique');
assert(index.indexOf('audio.js?v=0.65.0')<index.indexOf('script.js?v=0.65.0'),'audio must load before gameplay');

console.log('Regression checks passed: economy, crit, HP, first-run UI, audio, hero skills and button guides.');
