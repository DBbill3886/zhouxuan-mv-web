'use strict';
// ---------- S29 gray ----------
const GRAY=mix(DUSK,INK,.26);
const s29_x=t=>lerp(330,560,eio(seg(t,238.2,241.6)));
function s29_poses(t){
  const x=s29_x(t),v=abs(lerp(330,560,eio(seg(t+.03,238.2,241.6)))-lerp(330,560,eio(seg(t-.03,238.2,241.6))))/.06;
  return {x,walk:x/38,wamp:cl(v/70),face:1,lean:3,A:[70,12],B:[-8,10]}}
function s29_thread(t){
  const a=s29_poses(t),ja=fig(NULL,a.x,GROUND,200,INK,1,{walk:a.walk,wamp:a.wamp,lean:3,A:[70,12],B:[-8,10]}).hand[0];
  const jb=fig(NULL,1590,GROUND,200,INK,-1,{lean:3,A:[70,12],B:[-8,10]}).hand[0],mid=[(ja[0]+jb[0])/2,GROUND-8-8*sin(t*.9)];
  return [catmull([ja,[(ja[0]+mid[0])/2,mid[1]-30],mid,[(jb[0]+mid[0])/2,mid[1]-30],jb],10),0,eo(seg(t,235.0,237.6))]}
function s29_draw(R,t,c){
  for(let i=0;i<7;i++){const y=120+i*70,x=((rnd(8,7)[0][i]*2400+t*(10+i*3))%2600+2600)%2600-300;
    R.line([[x,y],[x+300+i*30,y]],INK,5,.12,0,0)}
  ground(R,GROUND,INK,0,W,1,3);
  const a=s29_poses(t);
  fig(R,a.x,GROUND,200,INK,1,{walk:a.walk,wamp:a.wamp,lean:3,A:[70,12],B:[-8,10],seed:33,lw:7});
  fig(R,1590,GROUND,200,INK,-1,{lean:3,A:[70,12],B:[-8,10],seed:34,lw:7})}
const SC29=new Scene("gray",DUSK,s29_draw,t=>[[960,400,330,GRAY],s29_thread(t)]);
// ---------- S30 smoke ----------
const AX=520,BX=1500;
const s30_mouth=t=>fig(NULL,AX,GROUND,300,INK,1,{lean:2,A:[15,10],B:[-8,10],tilt:-22}).head;
function s30_path(t){
  const m=s30_mouth(t),pts=[[m[0]+30,m[1]+4]],n=18;
  for(let i=1;i<=n;i++){const s=i/n,x=lerp(m[0]+30,BX-60,s),y=lerp(m[1],GROUND-200,s)-170*sin(s*PI)*(1-s*.4)+34*sin(s*16-t*1.8)*(1-s);
    pts.push([x,y])}
  // wrap around B torso
  for(let k=1;k<15;k++){const th=-PI*.35+k*.62,yy=GROUND-250+k*17;
    pts.push([BX+58*cos(th)-4,yy+8*sin(th)])}
  return catmull(pts,8)}
const s30_thread=t=>[s30_path(t),0,eo(seg(t,243.4,249.2))];
function s30_draw(R,t,c){
  ground(R,GROUND,INK,0,W,1,3);const m=s30_mouth(t);
  for(let k=0;k<9;k++){const ph=(((t-243.6)/2.6+k/9)%1+1)%1;
    if(t>243.6)R.circ(m[0]+40+ph*260+sin(ph*6+k)*14,m[1]-ph*210-10,10+ph*34,INK,.16*(1-ph))}
  fig(R,AX,GROUND,300,INK,1,{lean:2,A:[15,10],B:[-8,10],tilt:-22,seed:35});
  fig(R,BX,GROUND,300,INK,-1,{lean:2,A:[14,10],B:[-8,10],seed:36})}
const SC30=new Scene("smoke",DUSK,s30_draw,t=>[[960,360,300,GRAY],s30_thread(t)]);
// ---------- S31 rain lake ----------
const SHORE=520,DROPS=[253.0,253.68,254.62,255.57,256.3,257.0];
const s31_circle=t=>[960,SHORE+160,900,INK2,.178];
const s31_h=t=>fig(NULL,420,SHORE,330,INK,1,{lean:14,A:[40,20],B:[-8,10],tilt:18}).hand[0];
function s31_thread(t){const h=s31_h(t);return [bez(h,[h[0]+60,h[1]+90],[h[0]+260,SHORE-70],[980,SHORE+170]),0,eo(seg(t,251.0,253.4))]}
function s31_draw(R,t,c){
  const cv=R.cv;R.rect(0,SHORE,W,3,INK);
  const fk={lean:14,A:[40,20],B:[-8,10],tilt:18},inten=sm(seg(t,256.5,258.5))*.7+.15;
  cv.save();cv.beginPath();cv.ellipse(960,SHORE+160,900,156,0,0,TAU);cv.clip();
  // per-band mirrored draws
  // 细分水波带：更平滑的倒影扭曲，越深越淡
  for(let y0=SHORE+4;y0<SHORE+330;y0+=7){
    cv.save();R.clipRect(0,y0,W,7.6);const dx=sin(y0*.05+t*3.1)*(3+16*inten)+sin(y0*.13-t*1.7)*2;
    cv.globalAlpha=lerp(1,.35,(y0-SHORE)/330);
    cv.translate(dx,2*SHORE);cv.scale(1,-1);
    fig(R,420,SHORE,330,mix(INK2,CREAM,.6),1,{...fk,seed:37});cv.restore()}
  ripples(R,t,960,SHORE+160,900,CREAM,7,1.0,.7*(.3+inten),.18,4);
  DROPS.forEach((td,i)=>{const u=t-td;
    if(0<=u&&u<1.6){const x=1000+(i*173)%700-300,yy=SHORE+110+(i*37)%80,r=u*95;
      R.ovalRing(x,yy,r,r*.18,CREAM,3,(1-u/1.6)*.9)}});
  cv.restore();
  fig(R,420,SHORE,330,INK,1,{...fk,seed:38});
  // single drops then downpour
  DROPS.forEach((td,i)=>{const u=td-t;
    if(0<u&&u<.55){const f=1-u/.55,x=1000+(i*173)%700-300,y=lerp(-30,SHORE+130,f*f);
      R.line([[x,y-34],[x,y]],INK,4,1,0)}});
  rain(R,t,INK,110,[0,0,W,SHORE+150],71,{speed:1100,ang:.12,a:sm(seg(t,257.2,259.2))})}
const SC31=new Scene("lake",DUSK,s31_draw,t=>[s31_circle(t),s31_thread(t)]);
// ---------- S32 end ----------
function s32_c(t){
  const up=eio(seg(t,263.2,268.2));let y=lerp(760,300,up);
  const dn=eio(seg(t,282.0,286.0)),x=lerp(1450,960,dn),r=lerp(300,330,dn);y=lerp(y,470,dn);
  const sink=eio(seg(t,288.4,290.4));y=lerp(y,GROUND+345,sink);
  return [x,y,r,INK]}
const s32_arm=t=>lerp(150,24,sm(seg(t,274,279)))+3*sin(t*1.7);
const s32_walk=t=>walker(null,t,288.6,290.7,330,-160,eio);
function s32_hand(t){const [x,ph,wa]=s32_walk(t);return fig(NULL,x,GROUND,360,INK,1,{walk:ph,wamp:wa,lean:4,A:[s32_arm(t),12],B:[-8,12]}).hand[0]}
function s32_path(t){
  const h=s32_hand(t),tip=[1190,130],pts=[],N=140;
  for(let i=0;i<=N;i++){const s=i/N,x=lerp(h[0],tip[0],s),y=lerp(h[1],tip[1],s**1.25)+36*sin(s*28)*(1-s)**.6*s*2.2;
    pts.push([x,y])}
  const curl=bez(tip,[tip[0]+55,tip[1]+10],[tip[0]+85,tip[1]+85],[tip[0]+22,tip[1]+110],24).slice(1).concat(bez([tip[0]+22,tip[1]+110],[tip[0]-26,tip[1]+130],[tip[0]-52,tip[1]+80],[tip[0]-34,tip[1]+56],12).slice(1));
  const climb=pts.concat(curl),m=eio(seg(t,274.5,279.5)),sw=sin(t*1.1)*8;
  const slack=bez(h,[h[0]+300,70],[1180,-40],[1400+sw,360]).concat(bez([1400+sw,360],[1425,450],[1350,490],[1333,445],20).slice(1));
  if(m<=0)return climb;
  const A_=resample(climb,200),B_=resample(slack,200);
  return A_.map((p,i)=>[lerp(p[0],B_[i][0],m),lerp(p[1],B_[i][1],m)])}
function s32_thread(t){let f=eo(seg(t,264.4,271.9));if(t>288.8)f=1-eo(seg(t,288.8,289.8));return [s32_path(t),0,f]}
function s32_draw(R,t,c){
  const [cx,cy,cr]=c,cv=R.cv,gl=1-eo(seg(t,289.3,290.7));
  R.line([[960-960*gl,GROUND],[960+960*gl,GROUND]],INK,3,1,0);
  cv.save();R.clipRect(-3000,GROUND+2,W+6000,H-GROUND-2);R.rect(-3000,GROUND+2,W+6000,H,BG);cv.restore();
  // 高音 vertical
  let tp=seg(t,263.8,266.0);const tq=eo(seg(t,282.6,284.2));
  if(tq<1){const p=tq===0?tp:1-tq;
    cv.save();R.clip_circle(cx,cy,cr);
    R.rise("高",cx,cy-30,260,CREAM,p,'cjk','c',0,null,null,.1);
    R.rise("音",cx,cy+215,260,CREAM,seg(p,.15,1.0),'cjk','c',0,null,null,.1);cv.restore()}
  const zp=seg(t,285.0,287.2);
  if(zp>0&&t<289.5){
    cv.save();R.clip_circle(cx,cy,cr);R.clipRect(0,0,W,GROUND);
    R.rise("周旋",cx,cy+78,200,CREAM,zp,'cjk','c',0,null,null,.5);cv.restore();
    R.text("ZHOU  XUAN",cx,cy+140,24,CREAM,'cjk','c',sm(seg(t,286.6,287.6)),6)}
  const [x,ph,wa]=s32_walk(t);
  fig(R,x,GROUND,360,INK,1,{walk:ph,wamp:wa,lean:4,A:[s32_arm(t),12],B:[-8,12],seed:39});
  let [xr,pr,wr]=walker(null,t,283.2,286.4,2080,1610,eo);
  if(t>288.6)[xr,pr,wr]=walker(null,t,288.6,291.0,1610,2150,eio);
  if(xr<2060){
    fig(R,xr,GROUND,360,INK,-1,{walk:pr+1,wamp:wr,lean:4,A:[70,25],B:[-10,12],seed:40});
    const b=fig(NULL,xr,GROUND,360,INK,-1,{walk:pr+1,wamp:wr,lean:4,A:[70,25],B:[-10,12]}),hr=b.hand[0];
    tp=sm(seg(t,285.5,287.5))*(1-sm(seg(t,288.6,289.4)));
    R.line(bez(hr,[hr[0]-40,hr[1]+60],[hr[0]-60,hr[1]+110],[hr[0]-90,hr[1]+170]),RED,7,1,.4,3,0,tp)}
  if(t>280){const cp=sm(seg(t,284.5,286.0))*(1-sm(seg(t,288.6,289.4)));
    if(cp>.01)R.text("王以太 / 艾热 AIR",130,990,30,INK,'cjk','l',cp,7);
    R.circ(1810,975,12*cp,RED)}
  rain(R,t,INK,45,[0,0,W,GROUND],81,{a:.55*sm(seg(t,272,276))*(1-sm(seg(t,288,290)))})}
const SC32=new Scene("end",BG,s32_draw,t=>[s32_c(t),s32_thread(t)]);
