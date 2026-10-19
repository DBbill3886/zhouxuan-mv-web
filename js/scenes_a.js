'use strict';
const BG=CREAM,DUSK=[212,205,192],MOON=[228,218,196];
const hot=()=>[196,78,58];
const foot_cover=(R,bg=BG)=>R.rect(0,GROUND+2,W,H-GROUND,bg);
// ---------------- S0 intro ----------------
function s0_fig(t){const [xL,pL,wL]=walker(null,t,9.0,14.5,-140,330,eo),[xR,pR,wR]=walker(null,t,10.2,15.8,2060,1610,eo);return[xL,pL,wL,xR,pR,wR]}
const S0A=[125,35],S0B=[-8,12],S0A2=[70,25],S0B2=[-10,12];
function s0_hands(t){const [xL,pL,wL,xR,pR,wR]=s0_fig(t);
  return[fig(NULL,xL,GROUND,360,INK,1,{walk:pL,wamp:wL,lean:4,A:S0A,B:S0B}),fig(NULL,xR,GROUND,360,INK,-1,{walk:pR+1,wamp:wR,lean:4,A:S0A2,B:S0B2})]}
function s0_thread(t){const [a]=s0_hands(t),h=a.hand[0],sw=sin(t*1.1)*8;
  return bez(h,[h[0]+300,70],[1180,-40],[1400+sw,360]).concat(bez([1400+sw,360],[1425,450],[1350,490],[1333,445],20).slice(1))}
function s0_bridge(t){
  const y=lerp(GROUND+345,GROUND-330,eio(seg(t,1.4,6.4)))-4*sin(t*.7)*seg(t,6.4,7);
  return[[960,y,330,INK],[s0_thread(t),0,eo(seg(t,10.6,15.0))]]}
function s0_draw(R,t,c){
  const [cx,cy,cr]=c,g=R.cv;
  const gg=eo(seg(t,.4,3.6));R.line([[960-960*gg,GROUND],[960+960*gg,GROUND]],INK,3,1,0);
  R.rect(-3000,GROUND+2,W+6000,H,BG);
  const ra=seg(t,3.0,6.0);
  if(ra>0){
    g.save();R.clip_circle(cx,cy,cr+8,true);rain(R,t,INK,55,[0,0,W,GROUND],5,{a:ra});g.restore();
    g.save();R.clip_circle(cx,cy,cr);rain(R,t,CREAM,55,[0,0,W,GROUND],5,{a:ra*.35});g.restore()}
  R.rise("周旋",960,cy+82,214,CREAM,seg(t,5.2,8.2),'cjk','c',0,null,null,.5);
  R.text("ZHOU  XUAN",960,cy+150,24,CREAM,'cjk','c',sm(seg(t,8.0,9.5))*.9,6);
  const [xL,pL,wL,xR,pR,wR]=s0_fig(t);
  fig(R,xL,GROUND,360,INK,1,{walk:pL,wamp:wL,lean:4,A:S0A,B:S0B,seed:1});
  fig(R,xR,GROUND,360,INK,-1,{walk:pR+1,wamp:wR,lean:4,A:S0A2,B:S0B2,seed:2});
  const b=fig(NULL,xR,GROUND,360,INK,-1,{walk:pR+1,wamp:wR,lean:4,A:S0A2,B:S0B2}),hr=b.hand[0];
  R.line(bez(hr,[hr[0]-40,hr[1]+60],[hr[0]-60,hr[1]+110],[hr[0]-90,hr[1]+170]),RED,7,1,.4,3,0,sm(seg(t,12,15.5)));
  const cp=pres(t,8.6,10.2,19.6,20.8);
  if(cp>.01){g.save();g.globalAlpha=cp;R.rise("王以太 / 艾热 AIR",130,990,30,INK,seg(t,8.6,10.4),'cjk','l',7,null,null,.05);g.restore()}
  R.circ(1810,975,12*eob(seg(t,9.2,10.2),2),RED)}
const SC0=new Scene("intro",BG,s0_draw,s0_bridge);
// ---------------- S1 fever / film ----------------
const S1K=(t,l)=>({face:1,lean:l,A:[135,125],B:[-10,14]});
function s1_thread(t){const h=fig(NULL,430,GROUND,360,INK,1,{lean:3+2*sin(t*1.5),A:[135,125],B:[-10,14]}).hand[1];
  return bez(h,[h[0]-40,h[1]+200],[120,GROUND-40],[300,GROUND-3]).concat(bez([300,GROUND-3],[700,GROUND+6],[1300,GROUND-14],[1750,GROUND-4]).slice(1))}
function s1_circle(t){const f=sm(seg(t,22,29)),beat=sin(t*3.4)*.5+.5;
  return[1180,430+8*sin(t*.8),380+6*beat*f,mix(INK,hot(),sm(seg(t,22.5,27)))]}
function s1_bridge(t){return[s1_circle(t),[s1_thread(t),0,eo(seg(t,20.7,24.5))]]}
function film(R,t,y,rot,c=INK,paper=BG){
  const cv=R.cv;cv.save();cv.translate(960,y);cv.rotate(rot*PI/180);
  const h=104;R.rect(-1400,-h/2,2800,h,c);const off=(t*140)%190,n=floor(t*140/190);
  for(let i=-8;i<=8;i++){const x=i*190-off;
    R.rect(x-80,-h/2+20,160,h-40,paper);
    R.rect(x-70,-h/2+5,18,8,paper);R.rect(x-70,h/2-13,18,10,paper);R.rect(x+50,-h/2+5,18,8,paper);R.rect(x+50,h/2-13,18,8,paper);
    const kk=(((i+n)%4)+4)%4;
    if(kk===0)R.circ(x,0,24,c);
    else if(kk===1){R.line([[x,18],[x,-10]],c,6,1,0);R.circ(x,-24,9,c)}
    else if(kk===2)R.ring(x,0,22,RED,5);
    else R.line([[x-30,12],[x+30,12]],c,5,1,0)}
  cv.restore()}
function s1_draw(R,t,c){
  const [cx,cy,cr]=c;foot_cover(R);ground(R,GROUND,INK,0,W,1,3);
  const f=sm(seg(t,22.5,26));
  for(let i=0;i<7;i++){const x=cx-cr*.85+i*cr*.283,pts=[];
    for(let yy=0;yy<430;yy+=12)pts.push([x+16*sin(t*2.6+i*1.3+yy*.045)*(1-yy/430),cy-cr*.95-yy]);
    R.line(pts,INK,3.5,f*(.55+.3*sin(t*1.7+i)),0,0,0,1)}
  film(R,t,590+(1-eo(seg(t,23.2,25.5)))*500,-3);
  const b=sin(t*1.5)*2;
  fig(R,430,GROUND,360,INK,1,{lean:3+b,A:[135,125],B:[-10,14],seed:3});
  rain(R,t,INK,18,[0,0,W,GROUND],9,{a:.5*f})}
const SC1=new Scene("fever",BG,s1_draw,s1_bridge);
// ---------------- S2 ledger ----------------
const PAPER=PAPER2;
const s2_circle=t=>[1590,250,112+4*sin(t*1.3),INK];
const s2_thread=t=>[[[500,390],[640,440],[800,500],[980,560],[1180,610],[1340,650]],0,eo(seg(t,33.6,34.35))];
const s2_bridge=t=>[s2_circle(t),s2_thread(t)];
function s2_draw(R,t,c){
  foot_cover(R);ground(R,GROUND,INK,0,W,1,3);
  R.line([[250,712],[1550,712]],INK,10,1,.5,1);
  R.line([[330,716],[330,GROUND]],INK,8,1,.4,2);R.line([[1470,716],[1470,GROUND]],INK,8,1,.4,3);
  const pg=eo(seg(t,29.0,30.6)),cv=R.cv;
  cv.save();cv.translate(0,(1-pg)*40);
  const L=[[330,330],[900,296],[900,700],[330,690]],Rg=[[900,296],[1470,330],[1470,690],[900,700]];
  for(const pol of [L,Rg]){R.poly(pol,PAPER);R.line(pol.concat([pol[0]]),INK,4,1,.3,5)}
  for(let i=1;i<8;i++){const yf=i/8;
    R.line([[370,lerp(330,690,yf)-3],[870,lerp(300,696,yf)]],INK,2,.28,0);
    R.line([[930,lerp(300,696,yf)],[1430,lerp(332,688,yf)]],INK,2,.28,0)}
  R.line([[900,296],[900,700]],INK,5,1,.3,6);
  const ms=[];for(let g=0;g<3;g++)for(let k=0;k<4;k++)ms.push([970+g*150+k*26,392+g*8,90]);
  ms.forEach(([x,y,h],i)=>{const tt=30.6+i*.24;R.line([[x,y],[x-4,y+h]],RED,6,1,.5,i,0,eo(seg(t,tt,tt+.2)))});
  for(let i=0;i<3;i++){const tt=30.6+(i*4+3)*.24+.2;
    R.line([[955+i*150,392+i*8+82],[1070+i*150,392+i*8+8]],RED,6,1,.5,20+i,0,eo(seg(t,tt,tt+.25)))}
  for(let i=0;i<5;i++)R.line([[380,380+i*58],[380+160+(i*37)%200,376+i*58]],INK,4,.75,.6,30+i,0,eo(seg(t,29.8+i*.3,30.6+i*.3)));
  cv.restore();
  const wr=sin(t*5)*6*seg(t,30.5,33.5);
  fig(R,170,GROUND,330,INK,1,{lean:8,A:[100+wr,20],B:[8,10],seed:4})}
const SC2=new Scene("ledger",BG,s2_draw,s2_bridge);
// ---------------- S3 chives ----------------
const s3_hand=t=>fig(NULL,190,GROUND,360,INK,1,{lean:5,A:[95,12],B:[-8,10]}).hand[0];
function s3_thread(t){const h=s3_hand(t),wy=GROUND-110;
  return[catmull([h,[h[0]+300,h[1]+30],[700,wy-6],[1200,wy+4],[1800,wy]],12),ei(seg(t,42.2,43.4)),1]}
const s3_bridge=t=>[[1150,GROUND-70+6*sin(t),380,INK],s3_thread(t)];
const _bl=rnd(11,150),BL=Array.from({length:150},(_,i)=>[_bl[0][i],_bl[1][i],_bl[2][i],_bl[3][i]]);
function s3_draw(R,t,c){
  foot_cover(R);ground(R,GROUND,INK,0,W,1,3);
  const xh=s3_hand(t)[0];
  BL.forEach(([a,b,cc,d],i)=>{
    const x=300+a*1560,hh=110+b*200,lean=(cc-.5)*70,g0=38.3+d*3.2,gr=eo(seg(t,g0,g0+1.7));
    if(gr<=0)return;
    const frac=cl((x-xh)/(1800-xh)),tc=42.2+1.2*Math.cbrt(frac),sw=sin(t*1.3+x*.012)*5*(hh/200),pts=[];
    for(let k=0;k<9;k++){const u=k/8;pts.push([x+lean*u*u*gr+sw*u*u,GROUND-hh*gr*u])}
    if(t<tc)R.line(pts,INK,6.5,1,0);
    else{const cutk=4,low=pts.slice(0,cutk+1),up=pts.slice(cutk);
      R.line(low,INK,6.5,1,0);
      const dt=t-tc,fall=Math.min(.5*1400*dt*dt,GROUND-pts[cutk][1]-2);
      let rot=dt*(i%2?1.6:-1.2);rot=Math.min(abs(rot),1.45)*(i%2?1:-1);
      const piv=up[0],q=up.map(p=>{const dx=p[0]-piv[0],dy=p[1]-piv[1];
        return[piv[0]+dx*cos(rot)-dy*sin(rot)+dt*40*(i%2?1:-1)*Math.min(1,dt*2),piv[1]+fall+dx*sin(rot)+dy*cos(rot)]});
      R.line(q,INK,6.5,1,0)}
  });
  fig(R,190,GROUND,360,INK,1,{lean:5,A:[95,12],B:[-8,10],seed:6});
  rain(R,t,INK,20,[0,0,W,GROUND],21,{a:.4*seg(t,43,45)})}
const SC3=new Scene("chives",BG,s3_draw,s3_bridge);
