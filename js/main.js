/* 周旋 MV · Web — 渲染循环、音频同步时钟、响应式视口、界面 */
'use strict';
(function(){
const Q=new URLSearchParams(location.search);
const cvs=document.getElementById('stage'),ctx=cvs.getContext('2d',{alpha:false});
const R=new Painter(ctx);
const audio=document.getElementById('audio');
const DUR=290.7;
const qp=k=>Q.has(k)?parseFloat(Q.get(k)):null;
// ---------------- viewport ----------------
let V={},quality=1;
function layout(){
  const w=innerWidth,h=innerHeight,dpr=Math.min(window.devicePixelRatio||1,2)*quality;
  const portrait=h>w*1.05;let s,sx,sy;
  if(!portrait){s=Math.min(w/W,h/H);sx=(w-W*s)/2;sy=(h-H*s)/2}
  else{const Z=1.2;s=w/W*Z;sx=-(W*(Z-1)/2)*s;sy=Math.round(Math.max(64,h*.36-H*s/2))}  // 竖屏：轻微放大裁去两侧留白
  const capSize=Math.round(cl(w*.06,18,30)),stageH=H*s;
  const capTop=sy+stageH+Math.max(18,h*.03),capH=Math.max(capSize*3,Math.min(h-capTop-120,capSize*1.55*3.4));
  V={w,h,dpr,portrait,s,sx,sy,capSize,capTop,capH,pad:Math.max(22,w*.07)};
  const bw=Math.round(w*dpr),bh=Math.round(h*dpr);
  if(cvs.width!==bw||cvs.height!==bh){cvs.width=bw;cvs.height=bh}
  cvs.style.width=w+'px';cvs.style.height=h+'px';
  document.body.classList.toggle('portrait',portrait);
}
// ---------------- cached static layers ----------------
let grainPat=null,vig=null;
function makeGrain(){
  const N=Math.round(260*Math.min(window.devicePixelRatio||1,2)),c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),im=g.createImageData(N,N),r=mulberry(7);
  for(let i=0;i<N*N;i++){const v=r(),o=i*4,dark=v<.5;const a=Math.pow(Math.abs(v-.5)*2,2.2)*20;
    im.data[o]=im.data[o+1]=im.data[o+2]=dark?20:255;im.data[o+3]=a}
  g.putImageData(im,0,0);
  // 纸张纤维
  g.lineCap='round';
  for(let k=0;k<70;k++){const x=r()*N,y=r()*N,L=6+r()*18,a=r()*TAU;g.strokeStyle=`rgba(60,45,25,${.035+r()*.04})`;g.lineWidth=.7;
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+cos(a)*L*.5+3,y+sin(a)*L*.5,x+cos(a)*L,y+sin(a)*L);g.stroke()}
  const el=document.getElementById('grain'),d=Math.min(window.devicePixelRatio||1,2);
  el.style.backgroundImage=`url(${c.toDataURL('image/png')})`;el.style.backgroundSize=`${N/d}px ${N/d}px`}
function makeVignette(){
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
  const gr=g.createRadialGradient(128,128,60,128,128,182);gr.addColorStop(0,'rgba(30,22,12,0)');gr.addColorStop(1,'rgba(30,22,12,.20)');
  g.fillStyle=gr;g.fillRect(0,0,256,256);vig=c}
// ---------------- render ----------------
const NOGRAIN=Q.has('nograin');
const MOTES=rnd(901,34);
function render(t){
  setTime(t);
  const {dpr,s,sx,sy,w,h}=V,bg=bgcol(t),dark=lum(bg)<=120;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=col(bg);ctx.fillRect(0,0,w,h);
  // stage
  ctx.save();ctx.translate(sx,sy);ctx.scale(s,s);
  ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();
  ctx.save();
  const z=1.014+.005*sin(t*.21);
  ctx.translate(W/2,H/2);ctx.rotate(.0016*sin(t*.17));ctx.scale(z,z);ctx.translate(-W/2+3*sin(t*.13),-H/2+2*cos(t*.11));
  frame(R,t);
  // 漂浮的微尘 (全局细微动势)
  const mc=dark?CREAM:INK;
  for(let i=0;i<34;i++){const x=((MOTES[0][i]*W+t*(6+MOTES[2][i]*14))%W),y=((MOTES[1][i]*H-t*(3+MOTES[3][i]*8))%H+H)%H;
    const tw=.5+.5*sin(t*(.6+MOTES[4][i])+i);R.circ(x,y,1+MOTES[5][i]*1.8,mc,(.06+.1*tw)*(dark?1.3:1))}
  ctx.restore();
  if(!V.portrait)captions(R,t,V);
  ctx.restore();
  if(V.portrait){captions(R,t,V);header(t,dark)}
  // 颗粒与暗角在 CSS 合成层上 (#grain/#vig)，不占用每帧的画布填充
  return dark}
function header(t,dark){
  const c=dark?CREAM:INK,y=Math.max(40,V.sy*.55);
  R.text('周旋',V.pad,y,22,c,'cjk','l',.9,6);
  let ch='';for(const [ct,n] of CHAPTERS)if(t>=ct)ch=n;
  R.text(ch,V.w-V.pad,y,14,c,'cjk','r',.6,3);
  R.circ(V.pad+R.tw('周旋',22,'cjk',6)+14,y-7,4,RED)}
// ---------------- clock ----------------
let dragT=null;
const clk={t:qp('t')??0,playing:false,aT:0,aP:0,lastA:-1,virtual:Q.has('auto')};
function now(){
  const p=performance.now();
  if(dragT!==null)return dragT;
  if(!clk.playing)return clk.t;
  if(clk.virtual){clk.t=Math.min(clk.aT+(p-clk.aP)/1000,DUR);return clk.t}
  let est=clk.aT+(p-clk.aP)/1000;const a=audio.currentTime;
  if(a!==clk.lastA){clk.lastA=a;const err=a-est;if(abs(err)>.25){clk.aT=a;clk.aP=p;est=a}else{clk.aT+=err*.12}}
  clk.t=Math.min(est,DUR);return clk.t}
// ---------------- UI ----------------
const $=id=>document.getElementById(id);
const startEl=$('start'),bar=$('bar'),prog=$('prog'),fill=$('fill'),knob=$('knob'),tcur=$('tcur'),tdur=$('tdur'),btn=$('play'),chap=$('chap');
const fmt=x=>{x=Math.max(0,x|0);return (x/60|0)+':'+String(x%60).padStart(2,'0')};
tdur.textContent=fmt(DUR);
for(const [ct,n] of CHAPTERS){if(!ct)continue;const d=document.createElement('i');d.className='tick';d.style.left=(ct/DUR*100)+'%';d.title=n;prog.appendChild(d)}
function play(){
  if(clk.virtual){clk.playing=true;clk.aT=clk.t;clk.aP=performance.now();document.body.classList.add('playing');return}
  const p=audio.play();clk.playing=true;clk.aT=audio.currentTime;clk.aP=performance.now();
  document.body.classList.add('playing');if(p&&p.catch)p.catch(()=>{clk.playing=false;document.body.classList.remove('playing')})}
function pause(){clk.t=now();if(!clk.virtual)audio.pause();clk.playing=false;document.body.classList.remove('playing');poke()}
function toggle(){clk.playing?pause():play()}
function seek(x){x=cl(x,0,DUR-.05);if(clk.virtual){clk.t=x;clk.aT=x;clk.aP=performance.now()}else{audio.currentTime=x;clk.t=x;clk.aT=x;clk.aP=performance.now();clk.lastA=-1}poke()}
startEl.addEventListener('click',()=>{startEl.classList.add('gone');document.body.classList.add('started');play()});
btn.addEventListener('click',e=>{e.stopPropagation();toggle()});
$('fs').addEventListener('click',e=>{e.stopPropagation();const d=document;if(d.fullscreenElement)d.exitFullscreen();else(d.documentElement.requestFullscreen||(()=>{})).call(d.documentElement)});
$('replay').addEventListener('click',e=>{e.stopPropagation();document.body.classList.remove('ended');seek(0);play()});
audio.addEventListener('ended',()=>{clk.playing=false;document.body.classList.remove('playing');document.body.classList.add('ended')});
audio.addEventListener('pause',()=>{if(clk.playing&&!audio.ended){clk.playing=false;clk.t=audio.currentTime;document.body.classList.remove('playing')}});
audio.addEventListener('waiting',()=>document.body.classList.add('buffering'));
audio.addEventListener('playing',()=>{document.body.classList.remove('buffering');clk.aT=audio.currentTime;clk.aP=performance.now()});
function posT(e){const r=prog.getBoundingClientRect();return cl((e.clientX-r.left)/r.width)*DUR}
prog.addEventListener('pointerdown',e=>{e.stopPropagation();prog.setPointerCapture(e.pointerId);dragT=posT(e);bar.classList.add('drag')});
prog.addEventListener('pointermove',e=>{if(dragT!==null)dragT=posT(e)});
const endDrag=e=>{if(dragT===null)return;const x=dragT;dragT=null;bar.classList.remove('drag');seek(x)};
prog.addEventListener('pointerup',endDrag);prog.addEventListener('pointercancel',endDrag);
let idle=0;function poke(){idle=performance.now();document.body.classList.remove('idle')}
addEventListener('pointermove',poke);addEventListener('pointerdown',poke);
cvs.addEventListener('click',()=>{if(document.body.classList.contains('started'))toggle()});
addEventListener('keydown',e=>{if(!document.body.classList.contains('started'))return;
  if(e.code==='Space'){e.preventDefault();toggle()}else if(e.code==='ArrowRight')seek(now()+5);else if(e.code==='ArrowLeft')seek(now()-5);else if(e.key==='f')$('fs').click()});
addEventListener('resize',layout);
// ---------------- loop ----------------
let ema=8,iema=16.7,lastF=0,lastQ=0,lastDark=null,frames=0;const STATS=[];
function tick(){
  const t=now(),p0=performance.now();
  if(lastF&&p0-lastF<250&&!document.hidden)iema=iema*.93+(p0-lastF)*.07;lastF=p0;
  const dark=render(t);
  const dt=performance.now()-p0;ema=ema*.95+dt*.05;STATS.push(dt);if(STATS.length>600)STATS.shift();
  if(dark!==lastDark){document.body.classList.toggle('dark',dark);lastDark=dark}
  if((frames++&3)===0){const f=t/DUR*100;fill.style.width=f+'%';knob.style.left=f+'%';tcur.textContent=fmt(t);
    let ch='';for(const [ct,n] of CHAPTERS)if(t>=ct)ch=n;if(chap.textContent!==ch)chap.textContent=ch}
  if(clk.playing&&performance.now()-idle>2600&&!V.portrait)document.body.classList.add('idle');
  // 自适应清晰度：持续超预算则降低渲染分辨率，空闲则恢复
  const pn=performance.now();
  if(!Q.has('fixq')&&pn-lastQ>1500){if((ema>13||iema>24)&&quality>.5){quality=Math.max(.5,quality*.85);iema=16.7;layout();lastQ=pn}
    else if(ema<6&&iema<17.6&&quality<1&&pn-lastQ>6000){quality=Math.min(1,quality/.85);layout();lastQ=pn}}
  if(!Q.has('still'))requestAnimationFrame(tick)}
// bench hook for headless measurement
window.__bench=(t0,t1,n)=>{const out=[];for(let i=0;i<n;i++){const t=t0+(t1-t0)*i/n,p=performance.now();render(t);out.push(performance.now()-p)}return out};
window.__stats=()=>STATS.slice();window.__V=()=>V;
window.__render=t=>{render(t)};
// ---------------- boot ----------------
layout();makeGrain();
const fontsReady=Promise.all([document.fonts.load('700 40px ZXSerif','周旋'),document.fonts.load('italic 800 40px ZXLat','heartbreaker')]).catch(()=>{});
Promise.race([fontsReady,new Promise(r=>setTimeout(r,2500))]).then(()=>{
  for(const k in _wc)delete _wc[k];
  document.body.classList.add('ready');
  if(Q.has('t')||Q.has('auto')){startEl.classList.add('gone');document.body.classList.add('started');if(Q.has('auto'))play()}
  requestAnimationFrame(tick)});
})();
