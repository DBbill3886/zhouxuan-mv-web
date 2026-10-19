/* 周旋 MV · Web — lib: math, easing, painter, stick figure
   所有绘制均为代码矢量绘制 (Canvas 2D)，舞台坐标 1920×1080，按设备像素比渲染。 */
'use strict';
const W=1920,H=1080,GROUND=800;
const INK=[23,36,68],CREAM=[240,228,205],RED=[201,76,56],INK2=[60,78,120],PAPER2=[228,214,186];
const TAU=Math.PI*2;
const {sin,cos,abs,sqrt,floor,atan2,atan,exp,hypot,PI}=Math;
let TIME=0;                      // 全局时间 (由 engine 每帧设置，用于微动)
function setTime(t){TIME=t}
const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const cl=(x,a=0,b=1)=>x<a?a:x>b?b:x;
const lerp=(a,b,t)=>a+(b-a)*t;
const sm=t=>{t=cl(t);return t*t*(3-2*t)};
const sm5=t=>{t=cl(t);return t*t*t*(t*(6*t-15)+10)};
const eo=t=>{t=cl(t);return 1-(1-t)**3};
const eo4=t=>{t=cl(t);return 1-(1-t)**4};
const ei=t=>{t=cl(t);return t**3};
const eio=t=>{t=cl(t);return t<.5?4*t*t*t:1-(-2*t+2)**3/2};
const eob=(t,s=1.5)=>{t=cl(t);const c3=s+1;return 1+c3*(t-1)**3+s*(t-1)**2};
const seg=(t,a,b)=>b!==a?cl((t-a)/(b-a)):(t>=a?1:0);
const pres=(t,a,b,c,d)=>{let v=sm(seg(t,a,b));if(c!==undefined)v*=1-sm(seg(t,c,d));return v};
const dist=(a,b)=>hypot(a[0]-b[0],a[1]-b[1]);
const col=(c,a=1)=>`rgba(${c[0]+.5|0},${c[1]+.5|0},${c[2]+.5|0},${a<0?0:a>1?1:a})`;
// 确定性伪随机
function mulberry(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const _rng={};
function rnd(seed,n){const k=seed+'_'+n;if(!_rng[k]){const r=mulberry(seed*7919+n);_rng[k]=Array.from({length:8},()=>Array.from({length:n},r))}return _rng[k]}
// ---------- polyline utils ----------
function dens(pts,step=5){const out=[pts[0]];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];const d=dist(a,b),n=Math.max(1,d/step|0);for(let k=1;k<=n;k++)out.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n])}return out}
function wob(pts,amp=1,seed=0,step=5){
  if(!amp)return pts;const d=dens(pts,step),out=[];let s=0;const bt=TIME*.9;
  for(let i=0;i<d.length;i++){const p=d[i];if(i)s+=dist(d[i-1],p);
    const q=i<d.length-1?d[i+1]:p,pr=i?d[i-1]:p;const dx=q[0]-pr[0],dy=q[1]-pr[1],L=hypot(dx,dy)||1;
    const o=amp*(sin(s*.021+seed+bt)+.6*sin(s*.057+seed*2.3+bt*1.37));
    out.push([p[0]-dy/L*o,p[1]+dx/L*o])}
  return out}
function plen(pts){let s=0;for(let i=0;i<pts.length-1;i++)s+=dist(pts[i],pts[i+1]);return s}
function trim(pts,f0,f1){
  if(f0<=0&&f1>=1)return pts;const L=plen(pts);if(L===0||f1<=f0)return[];
  const a=f0*L,b=f1*L,out=[];let s=0;
  for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1],d=dist(p,q);
    if(s+d>=a&&s<=b&&d>0){const t0=Math.max(0,(a-s)/d),t1=Math.min(1,(b-s)/d);
      const u=[p[0]+(q[0]-p[0])*t0,p[1]+(q[1]-p[1])*t0],v=[p[0]+(q[0]-p[0])*t1,p[1]+(q[1]-p[1])*t1];
      if(!out.length)out.push(u);out.push(v)}
    s+=d}
  return out}
function resample(pts,n){
  const L=plen(pts);if(L===0)return Array.from({length:n},()=>pts[0]);
  const out=[];let s=0,j=0;
  for(let i=0;i<n;i++){const t=L*i/(n-1);
    while(j<pts.length-2&&s+dist(pts[j],pts[j+1])<t){s+=dist(pts[j],pts[j+1]);j++}
    const d=dist(pts[j],pts[j+1])||1,u=cl((t-s)/d);
    out.push([pts[j][0]+(pts[j+1][0]-pts[j][0])*u,pts[j][1]+(pts[j+1][1]-pts[j][1])*u])}
  return out}
function bez(p0,p1,p2,p3,n=48){const r=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;
  r.push([u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]])}return r}
function catmull(pts,n=14){
  const out=[],q=[pts[0],...pts,pts[pts.length-1]];
  for(let i=1;i<q.length-2;i++){const p0=q[i-1],p1=q[i],p2=q[i+1],p3=q[i+2];
    for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;
      out.push([0,1].map(j=>.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)))}}
  out.push(pts[pts.length-1]);return out}
// ---------- fonts ----------
const FACES={
  cjk:'"ZXSerif","Noto Serif CJK SC","Source Han Serif SC","Songti SC","STSong","SimSun",serif',
  lat:'"ZXLat","Playfair Display","Palatino Linotype","Book Antiqua",Georgia,serif'
};
const FW={cjk:'700',lat:'italic 800'};
function fontStr(face,sz){return `${FW[face]||'700'} ${sz}px ${FACES[face]||FACES.cjk}`}
let _mctx=null;const _wc={};
function measure(face,str,sz){
  if(!_mctx)_mctx=document.createElement('canvas').getContext('2d');
  const k=face+'|'+str;let w=_wc[k];
  if(w===undefined){_mctx.font=fontStr(face,100);w=_wc[k]=_mctx.measureText(str).width}
  return w*sz/100}
// ---------- painter ----------
class Painter{
  constructor(cv){this.cv=cv}
  rect(x,y,w,h,c,a=1){const g=this.cv;g.fillStyle=col(c,a);g.fillRect(x,y,w,h)}
  circ(x,y,r,c,a=1){if(r>.2){const g=this.cv;g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=col(c,a);g.fill()}}
  ring(x,y,r,c,w,a=1){if(r>.2){const g=this.cv;g.beginPath();g.arc(x,y,r,0,TAU);g.strokeStyle=col(c,a);g.lineWidth=w;g.stroke()}}
  oval(x,y,rx,ry,c,a=1){if(rx>.2&&ry>.2){const g=this.cv;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fillStyle=col(c,a);g.fill()}}
  ovalRing(x,y,rx,ry,c,w,a=1){if(rx>.2&&ry>.2){const g=this.cv;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.strokeStyle=col(c,a);g.lineWidth=w;g.stroke()}}
  arc(x,y,r,a0,sweep,c,w,a=1){const g=this.cv;g.beginPath();g.arc(x,y,r,a0*PI/180,(a0+sweep)*PI/180);g.strokeStyle=col(c,a);g.lineWidth=w;g.lineCap='round';g.stroke()}
  line(pts,c,w,a=1,amp=.8,seed=0,f0=0,f1=1){
    if(f1<=f0||pts.length<2)return;
    let p=amp?wob(pts,amp,seed):pts;p=trim(p,f0,f1);
    if(p.length<2){if(p.length)this.circ(p[0][0],p[0][1],w/2,c,a);return}
    const g=this.cv;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);
    g.strokeStyle=col(c,a);g.lineWidth=w;g.lineCap='round';g.lineJoin='round';g.stroke()}
  poly(pts,c,a=1){const g=this.cv;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fillStyle=col(c,a);g.fill()}
  polyStroke(pts,c,w,a=1){const g=this.cv;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.strokeStyle=col(c,a);g.lineWidth=w;g.lineJoin='round';g.stroke()}
  _txt(s,x,y,sz,c,face,a){
    const g=this.cv;g.font=fontStr(face,sz);g.textBaseline='alphabetic';g.fillStyle=col(c,a);g.fillText(s,x,y);
    if(sz>=90&&face==='cjk'){g.lineWidth=sz*.014;g.lineJoin='round';g.strokeStyle=col(c,a);g.strokeText(s,x,y)}  // 大字加粗
  }
  text(t,x,y,sz,c,face='cjk',anchor='l',a=1,sp=0){
    if(a<=0)return 0;
    if(!sp){const w=measure(face,t,sz);if(anchor==='c')x-=w/2;else if(anchor==='r')x-=w;this._txt(t,x,y,sz,c,face,a);return w}
    const ws=[...t].map(ch=>measure(face,ch,sz)+sp),tot=ws.reduce((p,q)=>p+q,0)-sp;
    if(anchor==='c')x-=tot/2;else if(anchor==='r')x-=tot;
    [...t].forEach((ch,i)=>{this._txt(ch,x,y,sz,c,face,a);x+=ws[i]});return tot}
  tw(t,sz,face='cjk',sp=0){return sp?[...t].reduce((p,ch)=>p+measure(face,ch,sz)+sp,0)-sp:measure(face,t,sz)}
  clip_circle(x,y,r,inv=false){const g=this.cv;g.beginPath();
    if(inv){g.rect(-6000,-6000,12000,12000);g.arc(x,y,Math.max(r,.1),0,TAU);g.clip('evenodd')}
    else{g.arc(x,y,Math.max(r,.1),0,TAU);g.clip()}}
  clipRect(x,y,w,h){const g=this.cv;g.beginPath();g.rect(x,y,w,h);g.clip()}
  dual(t,x,y,sz,c1,c2,circ,face='cjk',anchor='l',a=1,sp=0){
    const [cx,cy,r]=circ,g=this.cv;
    g.save();this.clip_circle(cx,cy,r,true);this.text(t,x,y,sz,c1,face,anchor,a,sp);g.restore();
    g.save();this.clip_circle(cx,cy,r);this.text(t,x,y,sz,c2,face,anchor,a,sp);g.restore()}
  rise(t,x,y,sz,c,p,face='cjk',anchor='l',sp=0,circ=null,c2=null,stag=.07){
    if(p<=0)return;const chars=[...t],ws=chars.map(ch=>measure(face,ch,sz)+sp),tot=ws.reduce((a,b)=>a+b,0)-sp;
    if(anchor==='c')x-=tot/2;else if(anchor==='r')x-=tot;
    const n=chars.length,g=this.cv;
    chars.forEach((ch,i)=>{const w=ws[i];
      const q=eo4(seg(p,i*stag/(1+stag*n),i*stag/(1+stag*n)+1/(1+stag*n)));
      if(q>0){g.save();this.clipRect(x-sz*.2,y-sz*1.1,w+sz*.4,sz*1.5);
        const yy=y+(1-q)*sz*.95;
        if(circ)this.dual(ch,x,yy,sz,c,c2,circ,face,'l',q**.5);else this.text(ch,x,yy,sz,c,face,'l',q**.5);
        g.restore()}
      x+=w})}
  thread(pts,f0=0,f1=1,w=7,a=1,seed=1,c=RED){
    if(f1<=f0||pts.length<2)return;
    this.line(pts,c,w,a,.7,seed,f0,f1);
    this.line(pts,mix(c,CREAM,.45),w*.28,a*.35,.7,seed,f0,f1)   // 细高光，线更有质感
  }
}
const _nullP=new Proxy(function(){},{get:()=>_nullP,apply:()=>_nullP});
const NULL=_nullP;
// ---------- stick figure ----------
function fig(r,x,gy,h,col_=INK,face=1,o={}){
  let {lean=0,walk=null,A=[12,10],B=[-12,10],crouch=0,lw=9,wb=.7,headdx=0,tilt=0,seed=0,wamp=1}=o;
  const d=face;
  const pt=(o_,ang,L)=>{const a=ang*PI/180;return[o_[0]+d*sin(a)*L,o_[1]+cos(a)*L]};
  const sway=sin(TIME*1.3+d*.7)*1.3;  // 呼吸微动
  lean+=sway*.45;A=[A[0]+sway,A[1]];B=[B[0]-sway*.8,B[1]];
  const T=.235*h,S=.225*h;let th,kn,sw=0;
  if(walk===null){th=[0,0];kn=[0,0]}
  else{const s_=sin(walk);sw=s_;th=[27*s_*wamp,-27*s_*wamp];kn=[34*wamp*Math.max(0,cos(walk+.5)),34*wamp*Math.max(0,cos(walk+PI+.5))]}
  th=[th[0]+50*crouch,th[1]+50*crouch];kn=[kn[0]+100*crouch,kn[1]+100*crouch];
  const ext=[0,1].map(i=>T*cos(th[i]*PI/180)+S*cos((th[i]-kn[i])*PI/180));
  const hip=[x,gy-Math.max(ext[0],ext[1])];
  const legs=[0,1].map(i=>{const k=pt(hip,th[i],T),f=pt(k,th[i]-kn[i],S);return[hip,k,f]});
  const tl=.30*h,la=lean*PI/180,sh=[hip[0]+d*sin(la)*tl,hip[1]-cos(la)*tl];
  const hr=.075*h,ta=la+tilt*PI/180;
  const hc=[sh[0]+d*sin(ta)*(hr+.035*h)+headdx,sh[1]-cos(ta)*(hr+.035*h)];
  const arms=[A,B].map((ab,i)=>{const sw_=walk===null?0:wamp*(i===0?18*sw:-18*sw);
    const e=pt(sh,ab[0]+sw_,.17*h),hn=pt(e,ab[0]+sw_+ab[1],.16*h);return[sh,e,hn]});
  if(r!==NULL){
    r.line(legs[1],col_,lw,1,wb,seed);r.line(legs[0],col_,lw,1,wb,seed);
    r.line([hip,sh],col_,lw,1,wb,seed+1);
    for(const a of arms)r.line(a,col_,lw,1,wb,seed+2);
    r.line([sh,[hc[0]-d*sin(la)*hr*.9,hc[1]+cos(la)*hr*.9]],col_,lw,1,0);
    r.circ(hc[0],hc[1],hr,col_)}
  return {head:hc,hand:[arms[0][2],arms[1][2]],sh,hip,foot:[legs[0][2],legs[1][2]],knee:[legs[0][1],legs[1][1]],elbow:[arms[0][1],arms[1][1]]}
}
function rain(r,t,c,n=70,area=[0,0,W,GROUND],seed=5,o={}){
  if(r===NULL)return;
  const {speed=900,ang=.18,L=28,w=2.4,a=1}=o;if(a<=.003)return;
  const [x0,y0,x1,y1]=area,rr=rnd(seed,n),hh=y1-y0,g=r.cv;g.save();g.beginPath();g.rect(x0,y0,x1-x0,y1-y0);g.clip();
  g.beginPath();
  for(let i=0;i<n;i++){const sp=speed*(.85+.3*rr[2][i]);const y=((rr[1][i]*hh+t*sp)%(hh+L*2)+(hh+L*2))%(hh+L*2)-L;
    let x=x0+rr[0][i]*(x1-x0);x=x-ang*y;const l=L*(.6+.8*rr[3][i]);
    g.moveTo(x,y0+y);g.lineTo(x-l*ang,y0+y+l)}
  g.strokeStyle=col(c,a);g.lineWidth=w;g.lineCap='round';g.stroke();g.restore()}
function ground(r,y,c,x0=0,x1=W,f=1,w=3,a=1){r.line([[x0,y],[x0+(x1-x0)*f,y]],c,w,a,0)}
function walker(f,t,t0,t1,xa,xb,ease,stride=62){
  const e=ease||eio,x=lerp(xa,xb,e(seg(t,t0,t1)));
  const v=abs(lerp(xa,xb,e(seg(t+.03,t0,t1)))-lerp(xa,xb,e(seg(t-.03,t0,t1))))/.06;
  return [x,x/stride,cl(v/120)]}
