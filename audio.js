(function(root){
  'use strict';

  let context=null,noiseBuffer=null;
  const lastPlayed=Object.create(null);
  const cooldowns={hit:45,heavyHit:80,crit:115,bossHit:65,buy:70,overcharge:220,launch:120,merge:260,bossStart:500,bossDeath:900,playerHit:240,defeat:700,level:180};

  function getContext(){
    if(context)return context;
    const AudioContext=root.AudioContext||root.webkitAudioContext;
    if(!AudioContext)return null;
    context=new AudioContext();
    return context;
  }

  function unlock(){
    try{
      const ctx=getContext();
      if(!ctx)return false;
      if(ctx.state==='suspended')ctx.resume();
      const source=ctx.createBufferSource();
      source.buffer=ctx.createBuffer(1,1,ctx.sampleRate);
      source.connect(ctx.destination);
      source.start();
      return true;
    }catch(e){return false}
  }

  function tone(ctx,when,frequency,endFrequency,duration,type,volume){
    const oscillator=ctx.createOscillator(),gain=ctx.createGain();
    oscillator.type=type||'sine';
    oscillator.frequency.setValueAtTime(Math.max(20,frequency),when);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency||frequency),when+duration);
    gain.gain.setValueAtTime(.0001,when);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),when+.008);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(when);
    oscillator.stop(when+duration+.02);
  }

  function noise(ctx,when,duration,volume,highpass){
    if(!noiseBuffer){
      noiseBuffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.35),ctx.sampleRate);
      const data=noiseBuffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
    }
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
    source.buffer=noiseBuffer;
    filter.type='highpass';
    filter.frequency.value=highpass||700;
    gain.gain.setValueAtTime(Math.max(.0002,volume),when);
    gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(when);
    source.stop(when+duration);
  }

  function play(name,strength){
    const nowMs=performance.now(),cooldown=cooldowns[name]||60;
    if(nowMs-(lastPlayed[name]||0)<cooldown)return false;
    lastPlayed[name]=nowMs;
    try{
      const ctx=getContext();
      if(!ctx)return false;
      if(ctx.state==='suspended')ctx.resume();
      const t=ctx.currentTime+.004,s=Math.max(.45,Math.min(1.5,strength||1));
      switch(name){
        case 'launch':
          tone(ctx,t,115,310,.16,'triangle',.035*s);
          noise(ctx,t,.09,.012*s,1100);
          break;
        case 'hit':
          tone(ctx,t,145,82,.07,'triangle',.018*s);
          break;
        case 'heavyHit':
          tone(ctx,t,105,48,.13,'square',.026*s);
          tone(ctx,t+.012,260,135,.08,'triangle',.018*s);
          noise(ctx,t,.07,.016*s,850);
          break;
        case 'bossHit':
          tone(ctx,t,190,105,.065,'triangle',.017*s);
          noise(ctx,t,.045,.009*s,1350);
          break;
        case 'crit':
          tone(ctx,t,220,440,.14,'square',.034*s);
          tone(ctx,t+.045,440,880,.18,'triangle',.029*s);
          tone(ctx,t+.09,660,990,.20,'sine',.021*s);
          noise(ctx,t,.10,.016*s,1500);
          break;
        case 'buy':
          tone(ctx,t,330,495,.09,'triangle',.022*s);
          break;
        case 'overcharge':
          [220,330,550].forEach((f,i)=>tone(ctx,t+i*.055,f,f*1.08,.24,'triangle',.025*s));
          break;
        case 'merge':
          tone(ctx,t,90,360,.42,'sawtooth',.032*s);
          tone(ctx,t+.20,180,720,.28,'triangle',.025*s);
          noise(ctx,t+.22,.15,.018*s,1000);
          break;
        case 'bossStart':
          tone(ctx,t,58,46,.55,'sawtooth',.032*s);
          tone(ctx,t+.08,116,92,.48,'square',.021*s);
          break;
        case 'bossDeath':
          [196,247,330,494].forEach((f,i)=>tone(ctx,t+i*.09,f,f*1.03,.62,'triangle',.031*s));
          noise(ctx,t,.18,.018*s,700);
          break;
        case 'playerHit':
          tone(ctx,t,105,42,.20,'sawtooth',.035*s);
          noise(ctx,t,.12,.022*s,500);
          break;
        case 'defeat':
          [196,147,98].forEach((f,i)=>tone(ctx,t+i*.12,f,f*.84,.34,'triangle',.027*s));
          break;
        case 'level':
          tone(ctx,t,392,523,.13,'triangle',.018*s);
          break;
      }
      return true;
    }catch(e){return false}
  }

  root.IdleTurtleAudio={unlock,play};
})(window);
