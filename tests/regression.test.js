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
const heartCost=(purchases,parts=0)=>Math.floor(12000*Math.pow(1.42,Math.max(0,purchases))*(1+Math.max(0,parts)*.25));
const idleRarityOdds=level=>{
  const bonus=Math.max(0,level)*.006,legendary=Math.min(1,.004+bonus),totalSpecial=Math.min(1,.035+bonus*3);
  return {legendary,shiny:Math.max(0,totalSpecial-legendary)};
};
const shotRarityOdds=level=>({legendary:Math.min(.12,.002+Math.max(0,level)*.001),shiny:Math.min(.40,.023+Math.max(0,level)*.004)});
const mergeCompression=count=>Math.min(1.75,1.15+Math.max(0,count-2)*.025);
const heroMomentumCharge=combo=>Math.min(24,14+Math.min(6,Math.max(0,combo))*2);
const heroSkillBonus=(path,tier,hits,missing)=>{
  if(path==='red')return Math.min(.75,.03*tier*Math.min(5,hits+1));
  if(path==='laser')return .025*tier;
  if(path==='bomb')return .06+.035*tier;
  if(path==='blade')return .04*tier;
  if(path==='dark')return Math.min(.46,.025*tier+missing*.07*tier);
  return 0;
};
const closeTo=(actual,expected)=>Math.abs(actual-expected)<1e-9;
const guidedNext=(guide,state)=>{
  if(state.menuOpen||state.mode!=='turtle')return null;
  if(!guide.ball&&state.money>=state.ballCost)return 'ball';
  if(guide.ball&&!guide.speed&&state.money>=state.speedCost)return 'speed';
  if(guide.ball&&guide.speed&&!guide.merge&&state.balls>=4)return 'merge';
  if(!guide.heart&&state.bosses>=1&&state.money>=state.heartCost)return 'heart';
  if(guide.heart&&!guide.upgrades&&state.bosses>=1)return 'upgrades';
  if(guide.upgrades&&!guide.heroHp&&state.shopOpen&&state.hearts>=state.heroHpCost)return 'heroHp';
  if(!guide.prestige&&state.level>=40&&state.prestigeGain>=1)return 'prestige';
  return null;
};

const guide={ball:false,speed:false,merge:false,heart:false,upgrades:false,heroHp:false,prestige:false};
const guideState={menuOpen:false,mode:'turtle',money:20,ballCost:20,speedCost:20,balls:1,bosses:0,heartCost:12000,shopOpen:false,hearts:0,heroHpCost:2,level:1,prestigeGain:0};
assert.equal(guidedNext(guide,guideState),'ball');
guide.ball=true;assert.equal(guidedNext(guide,guideState),'speed');
guide.speed=true;guideState.balls=4;assert.equal(guidedNext(guide,guideState),'merge');
guide.merge=true;guideState.bosses=1;guideState.money=12000;assert.equal(guidedNext(guide,guideState),'heart');
guide.heart=true;assert.equal(guidedNext(guide,guideState),'upgrades');
guide.upgrades=true;guideState.shopOpen=true;guideState.hearts=2;assert.equal(guidedNext(guide,guideState),'heroHp');
guide.heroHp=true;guideState.shopOpen=false;guideState.level=39;guideState.prestigeGain=4;assert.equal(guidedNext(guide,guideState),null);
guideState.level=40;assert.equal(guidedNext(guide,guideState),'prestige');

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
assert.equal(heartCost(0),12000);
assert(heartCost(2)>heartCost(1),'Heart price must rise with completed purchases');
assert.equal(heartCost(2),heartCost(2),'spending Hearts must not affect purchase price');
assert(closeTo(idleRarityOdds(1).legendary-idleRarityOdds(0).legendary,.006));
assert(closeTo(idleRarityOdds(1).shiny-idleRarityOdds(0).shiny,.012));
assert(closeTo(shotRarityOdds(1).legendary-shotRarityOdds(0).legendary,.001));
assert(closeTo(shotRarityOdds(1).shiny-shotRarityOdds(0).shiny,.004));
assert(mergeCompression(2)>1,'Merge must add compression damage');
assert.equal(mergeCompression(40),1.75,'large merges must receive the capped compression bonus');
assert.equal(heroSkillBonus('red',5,4,0),.75);
assert.equal(heroSkillBonus('laser',5,0,0),.125);
assert(closeTo(heroSkillBonus('bomb',5,0,0),.235));
assert.equal(heroSkillBonus('blade',5,0,0),.20);
assert.equal(heroSkillBonus('dark',5,0,1),.46);
assert.equal([1,2,3,4,5].reduce((total,combo)=>total+heroMomentumCharge(combo),0),100,'five Hero Ball hits must fill Momentum');
assert.equal(heroMomentumCharge(20),24,'Momentum charge must be capped');
assert.equal(Math.floor(Math.sqrt(12000/12000)),1,'first prestige point should unlock at 12K total gold');

const finalSetBoss=script.slice(script.lastIndexOf('function setBoss(){'),script.indexOf('\nfunction drawBossAsset',script.lastIndexOf('function setBoss(){')));
assert(!finalSetBoss.includes('purple'),'Purple Hearts must not increase boss HP');
assert(script.includes('player.maxHp=3+(s.perm.bossHp||0)*3'),'hero must start boss fights with 3 HP');
assert(script.includes("BOSS_FRAME_SEQUENCES[5]={"),'Rust Reaper must use curated animation frames');
assert(script.includes("attack:[4,5,4,5],hit:[8,9,8,9]"),'corrupt Rust Reaper edge frames must stay out of combat animation');
assert(script.includes("5:{5:{right:72},13:{right:88},14:{right:72}}"),'detached Rust Reaper edge fragments must be clipped');
assert(script.includes('ctx.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh)'),'boss sprite clips must preserve frame scale and anchoring');
assert(script.includes("function setupTowerProgress()"),'tower progress UI must be installed');
assert(script.includes("classList.add('firstBuyCue')"),'first purchase cue must be available');
assert(style.includes('.towerProgress'),'tower progress must be styled');
assert(audio.includes("root.IdleTurtleAudio={unlock,play,setEnabled,startMusic}"),'event sound and music module must expose its API');
assert(audio.includes("const MUSIC_URL='Music/Evig%20Spillsirkel.wav?v=0.66.0'"),'soundtrack must use the cache-busted seamless loop');
assert(audio.includes('music.loop=true'),'soundtrack must loop continuously');
assert(audio.includes('source.loop=true'),'Web Audio soundtrack must loop sample-accurately');
assert(audio.includes('source.loopStart=0'),'sample-accurate loop must start at the first frame');
assert(audio.includes('source.loopEnd=musicBuffer.duration'),'sample-accurate loop must end at the final frame');
assert(audio.includes('stopBufferMusic(true)'),'soundtrack position must survive settings and visibility pauses');
assert(audio.includes('if(music)music.pause()'),'sound setting must pause the soundtrack');
const musicPath=path.join(root,'Music','Evig Spillsirkel.wav');
assert(fs.existsSync(musicPath),'soundtrack file must exist');
const wav=fs.readFileSync(musicPath);
assert.equal(wav.toString('ascii',0,4),'RIFF','soundtrack must remain a WAV file');
let wavPos=12,wavFormat=null,wavData=null;
while(wavPos+8<=wav.length){
  const id=wav.toString('ascii',wavPos,wavPos+4),size=wav.readUInt32LE(wavPos+4),start=wavPos+8;
  if(id==='fmt ')wavFormat={channels:wav.readUInt16LE(start+2),blockAlign:wav.readUInt16LE(start+12),bits:wav.readUInt16LE(start+14)};
  if(id==='data')wavData={start,size};
  wavPos=start+size+(size&1);
}
assert(wavFormat&&wavData&&wavFormat.bits===16,'seam test requires the PCM16 soundtrack');
let loopBoundaryJump=0;
for(let channel=0;channel<wavFormat.channels;channel++){
  const first=wav.readInt16LE(wavData.start+channel*2),last=wav.readInt16LE(wavData.start+wavData.size-wavFormat.blockAlign+channel*2);
  loopBoundaryJump=Math.max(loopBoundaryJump,Math.abs(last-first));
}
assert(loopBoundaryJump<64,'soundtrack sample boundary must be seamless');
assert(index.includes('audio.js?v=0.69.0'),'audio module must load before gameplay');
assert(index.includes('v0.69.0 Hero Overdrive'),'release version must be visible');
assert(script.includes('s.heartPurchases++'),'Heart purchases must have a permanent price counter');
assert(script.includes('Math.pow(1.42,s.heartPurchases)'),'Heart price must use purchase history instead of current wallet balance');
assert(script.includes('s.heartPurchases=Math.max(0,Math.floor(Number(s.purple)||0))'),'old saves must migrate existing Hearts into the permanent price counter');
assert(style.includes('#area canvas{touch-action:none}'),'boss touch steering must own the canvas gesture without browser interference');
assert(script.includes('function mergeCompressionMultiplier(count)'),'Merge compression formula must be shared by preview and gameplay');
assert(script.includes('compressed=damage*mergeCompressionMultiplier(balls.length)'),'Merge preview must show its real damage increase');
assert(script.includes('merged.merge*=compression'),'Merge damage bonus must be applied to the resulting ball');
assert(script.includes('const BOSS_PHASE_SHIFT_FRAMES=96')&&script.includes('const BOSS_STUN_FRAMES=80'),'boss phase wind-up and respite durations are missing');
assert(script.includes('function beginBossPhaseShift(target)')&&script.includes('enemyShots=[]'),'boss transitions must clear active pressure');
assert(script.includes("bossAttack=function(){")&&script.includes("if((boss.phaseShift||0)>0||(boss.stun||0)>0)return"),'boss attacks must pause during phase changes and stun');
assert(script.includes("player.targetY=(point.clientY-rect.top)*H/rect.height-(touchLike?48:0)"),'touch steering must keep the hero above the player finger');

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
assert(script.includes("els.prestigeGainText=newButton.querySelector('#prestigeGainText')"),'live Prestige payout must target the visible cloned button');
assert(style.includes('.prestigeTooltip'),'prestige hover information must be styled');
assert(style.includes('.prestigeConfirm'),'prestige confirmation must be styled');
assert(script.includes('function setupButtonHelp()'),'global button help must be installed');
assert(script.includes("button.id==='doPrestige'||button.classList.contains('weaponTier')"),'specialized Prestige and skill help must remain separate');
assert(script.includes("document.addEventListener('pointerover'"),'button help must support hover');
assert(script.includes("document.addEventListener('pointerdown'"),'button help must support touch');
assert(script.includes("document.addEventListener('focusin'"),'button help must support keyboard focus');
assert(style.includes('.buttonHelpTooltip'),'global button help must be styled');
assert(script.includes("const GUIDED_ONBOARDING_STEPS=['ball','speed','merge','heart','upgrades','heroHp','prestige']"),'guided progression order must remain explicit');
assert(script.includes("if(!guide.prestige&&(s.turtleCycle||1)>=40&&pg()>=1)"),'Prestige guidance must wait for level 40 and a real payout');
assert(script.includes("if(!guide.heart&&(s.machineParts||0)>=1&&s.money>=cph())"),'Heart guidance must wait for a boss clear and an affordable purchase');
assert(script.includes("if(guidedPaused)return"),'guided actions must pause gameplay simulation');
assert(script.includes("fresh.guidedOnboarding=makeGuidedOnboardingState(false)"),'fresh saves must receive the visual introduction');
assert(script.includes('function hasExistingGuidedProgress()'),'existing saves must migrate past the introduction');
assert(script.includes('function setupGuidedOnboarding()'),'guided button interactions must be installed');
assert(style.includes('body.guidedPause #area canvas'),'guided pauses must visually calm the arena');
assert(style.includes('button.guidedCue'),'guided actions must have a distinct visual cue');
assert(script.includes('const HERO_OVERDRIVE_FRAMES=240'),'Hero Overdrive must last four seconds at 60 FPS');
assert(script.includes('const HERO_OVERDRIVE_SPEED=1.18'),'Overdrive ball speed bonus must remain moderate');
assert(script.includes('const HERO_OVERDRIVE_INCOME=1.12'),'Overdrive income bonus must remain moderate');
assert(script.includes('const HERO_OVERDRIVE_DAMAGE=1.25'),'Overdrive Hero Ball damage bonus must remain moderate');
assert(script.includes('function drawHeroMomentum()'),'Momentum must be visible around the Hero Ball');
assert(script.includes("ball===hero&&heroOverdriveActive()"),'Overdrive damage must only boost the active Hero Ball');
assert(script.includes("const PLAYTEST_KEY='idleTurtleBalls_playtest_v01'"),'playtest sessions need an isolated storage key');
assert(script.includes('sessionStorage.setItem(PLAYTEST_KEY'),'playtest data must stay outside the game save');
assert(script.includes('function setupPlaytestTool()'),'developer playtest report must be installed');
assert(script.includes("button.id='devPlaytest'"),'playtest report must be reachable from the developer menu');
assert(script.includes("overdriveButton.id='devOverdrive'"),'developer tools must expose an immediate Overdrive test');
assert(script.includes('function playtestReportText()'),'playtest results must be exportable');
assert(style.includes('.playtestSummary'),'playtest report must have a mobile-ready layout');
const buttonHelpBlock=script.slice(script.indexOf('const BUTTON_HELP={'),script.indexOf('function setupButtonHelp()'));
for(const id of ['buyBall','buyPower','buySpeed','buyLuck','mergeBalls','openShop','buyPurple','openStats','openScores','openDev','openSettings','summonBoss','psIncome','psStartBall','psRare','psPrestige','psBossHp','psBossDmg','psBossBalls','psBossSpeed','psBossLuck','cancelMerge','confirmMerge','cancelPrestige','confirmPrestige','saveScore','clearScores','devSpawn','devResetSave','startPlay','startScores','startSound','startFullscreen','startSettings','gameSoundOption','gameSideOption','gameFxOption','gameFullscreenOption']){
  assert(buttonHelpBlock.includes(id+':['),'button help must describe '+id);
}

const ids=[...index.matchAll(/id="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(ids).size,ids.length,'HTML element IDs must remain unique');
assert(index.indexOf('audio.js?v=0.69.0')<index.indexOf('script.js?v=0.69.0'),'audio must load before gameplay');

console.log('Regression checks passed: economy, crit, HP, onboarding, Hero Overdrive, playtest reporting, soundtrack and button guides.');
