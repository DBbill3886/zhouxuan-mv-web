'use strict';
function cover(R,bg,y=GROUND){R.rect(-3000,y+2,W+6000,H,bg)}
function ripples(R,t,cx,cy,rx,col,n=6,per=1.1,a=.8,flat=.14,seed=3){
  for(let k=0;k<n;k++){const ph=t/per+k/n,idx=floor(ph),f=ph-idx,r_=rnd(seed+idx*7+k,1);
    const x=cx+(r_[0][0]-.5)*rx*1.5,rr=f*70;
    if(abs(x-cx)<rx*.85)R.ovalRing(x,cy+(r_[1][0]-.5)*rx*.2*flat*3,rr,rr*flat,col,2.5,a*(1-f))}}
// ---------------- S4 mud ----------------
function s4_fig(t){const [x,ph,wa]=walker(null,t,45.0,47.6,150,985,eio),sink=eio(seg(t,46.9,49.3))*300;
  const gy=GROUND+58*seg(x,560,900)+sink,arm=lerp(30,172,sm(seg(t,47.6,48.6)))+(t>47.6?10*sin(t*7.5):0);
  return[x,ph,wa,gy,arm]}
function s4_f(R,t){const [x,ph,wa,gy,arm]=s4_fig(t);
  return fig(R,x,gy,360,INK,1,{walk:ph,wamp:wa,lean:3-4*sm(seg(t,47,49)),A:[arm,12],B:[-10+20*sin(t*5.5)*seg(t,47.5,49),12],seed:7})}
function s4_thread(t){const h=s4_f(NULL,t).hand[0],sw=sin(t*1.2)*14;
  let pts=bez(h,[h[0]+40,h[1]-160],[h[0]-90+sw,h[1]-330],[h[0]+10+sw,Math.max(h[1]-520,90)]);
  const p=pts[pts.length-1];pts=pts.concat(bez(p,[p[0]+60,p[1]-30],[p[0]+95,p[1]+10],[p[0]+55,p[1]+40],16).slice(1));
  return[pts,0,eo(seg(t,45.6,47.2))]}
const s4_bridge=t=>[[1000,GROUND+58,430,INK,.14],s4_thread(t)];
function s4_draw(R,t,c){
  ground(R,GROUND,INK,0,W,1,3);ripples(R,t,1000,GROUND+58,430,CREAM);
  R.cv.save();R.clipRect(-10,-10,W+20,GROUND+68);s4_f(R,t);R.cv.restore();
  rain(R,t,INK,70,[0,0,W,GROUND+30],31,{a:.9})}
const SC4=new Scene("mud",BG,s4_draw,s4_bridge);
// ---------------- S5 chess ----------------
const s5_th=t=>lerp(-2,-23,eio(seg(t,49.7,56.2)))+1.3*sin(t*2.1)*seg(t,49.7,50.5);
const PCS=Array.from({length:10},(_,i)=>[i%8,(i*3)%8]);
const s5_hand=t=>fig(NULL,260,GROUND,340,INK,1,{lean:6+8*sin(t*1.7),A:[100+14*sin(t*2.4),20],B:[-70+10*sin(t*2.4+1),30],crouch:.1}).hand[0];
function s5_thread(t){const h=s5_hand(t);return[bez(h,[h[0]+280,h[1]-260],[1280,130],[1470,300]),0,eo(seg(t,49.6,51.3))]}
const s5_bridge=t=>[[1560,300+6*sin(t*1.1),140,INK],s5_thread(t)];
function s5_draw(R,t,c){
  const cv=R.cv;ground(R,GROUND,INK,0,W,1,3);
  const th=s5_th(t),piv=[960,770];R.poly([[960,768],[890,GROUND],[1030,GROUND]],INK);
  cv.save();cv.translate(...piv);cv.rotate(th*PI/180);
  R.rect(-266,-540,532,532,INK);
  for(let i=0;i<8;i++)for(let j=0;j<8;j++)if((i+j)%2===0)R.rect(-266+i*66.5,-540+j*66.5,66.5,66.5,PAPER2);
  R.line([[-266,-8],[266,-8]],INK,6,1,0);
  PCS.forEach(([i,j],k)=>{const ts=51.3+k*.5,dt=Math.max(0,t-ts),sx=-.5*(260*abs(sin(th*PI/180)))*dt*dt*3;
    const x=-266+i*66.5+33+sx,y=-540+j*66.5+33;
    if(k===3)R.circ(x,y,27,RED);else{R.circ(x,y,27,CREAM);R.ring(x,y,27,INK,5)}});
  cv.restore();
  fig(R,260,GROUND,340,INK,1,{lean:6+8*sin(t*1.7),A:[100+14*sin(t*2.4),20],B:[-70+10*sin(t*2.4+1),30],crouch:.1,seed:8})}
const SC5=new Scene("chess",BG,s5_draw,s5_bridge);
// ---------------- S6 lights / half-half ----------------
const WORD=Array.from({length:28},(_,k)=>[floor(k/4),k%4]);
// Python random.Random(4).shuffle(list(range(28))).
const _o=[6,14,11,27,16,18,17,10,22,19,21,5,13,8,25,1,26,24,0,20,2,4,15,12,23,3,9,7];
function s6_circle(t){const m=eio(seg(t,58.2,59.6)),x=lerp(1450,1160,m),y=lerp(300,440,m),r=lerp(190,305,m);
  const al=59.7<t&&t<62.85?0:1;return[x,y,r,CREAM,1,al]}
const s6_bridge=t=>[s6_circle(t),null];
function s6_draw(R,t,c){
  const cv=R.cv;ground(R,GROUND,CREAM,0,W,1,3);
  const bs=mix(INK,CREAM,.1),off=-eio(seg(t,58.6,60.2))*900;
  cv.save();cv.translate(off,0);const bp=eo(seg(t,55.9,56.8));
  R.rect(240,GROUND-(GROUND-170)*bp,480,(GROUND-170)*bp,bs);
  WORD.forEach(([r_,c_],k)=>{const on=1-sm(seg(t,56.8+_o.indexOf(k)*.065,56.8+_o.indexOf(k)*.065+.14)),col=mix(mix(INK,CREAM,.2),CREAM,on);
    if(bp>.99)R.rect(282+c_*108,215+r_*86,66,60,col)});
  cv.restore();
  if(off>-880)fig(R,900+off,GROUND,250,CREAM,-1,{lean:-3,A:[150,10],B:[-8,10],seed:9});
  const [cx,cy,cr,,,al]=s6_circle(t);
  if(59.7<t&&t<62.9){
    const sp=eio(seg(t,60.0,61.3))*(1-eio(seg(t,61.9,62.8)))*46,lc=mix(CREAM,RED,eio(seg(t,60.0,61.4))*(1-eio(seg(t,61.9,62.8))));
    if(al===0){
      cv.save();R.clipRect(-3000,-3000,cx-sp+3001.2,6000);R.circ(cx-sp,cy,cr,lc);cv.restore();
      cv.save();R.clipRect(cx+sp-1.2,-3000,3001.2-cx-sp,6000);R.circ(cx+sp,cy,cr,CREAM);cv.restore();
      const XO=1-eo(seg(t,62.2,62.85));
      R.rise("一半",cx-sp-cr*.5,cy+50,118,INK,Math.min(seg(t,59.0,60.2),XO),'cjk','c',0,null,null,.3);
      R.rise("一半",cx+sp+cr*.5,cy+50,118,INK,Math.min(seg(t,59.3,60.5),XO),'cjk','c',0,null,null,.3);
      R.rise("憧憬",cx-sp-cr*.5,cy+150,50,INK,Math.min(seg(t,60.6,61.6),XO),'cjk','c',10,null,null,.3);
      R.rise("回忆",cx+sp+cr*.5,cy+150,50,INK,Math.min(seg(t,61.6,62.6),XO),'cjk','c',10,null,null,.3)}}
  if(t<59.9)R.rise("一半一半",cx,cy+50,150,INK,seg(t,58.7,59.5),'cjk','c',0,null,null,.2)}
const SC6=new Scene("half",INK,s6_draw,s6_bridge);
// ---------------- S7 phone / dawn ----------------
function s7_hs(t){const dt=Math.max(0,t-65.6),ph=.13*exp(-.22*dt)*sin(3.6*dt)*seg(t,65.6,66.0)+.05*sin(t*.9),L=450;
  return[620+L*sin(ph),-30+L*cos(ph),ph]}
function s7_bridge(t){const [x,y,ph]=s7_hs(t);
  return[[1500,GROUND-6,235,INK],[bez([620,-30],[620,100],[x,y-170],[x,y]),0,eo(seg(t,64.9,66.2))]]}
function phone(R,x,y,ph,col){const cv=R.cv;cv.save();cv.translate(x,y);cv.rotate(-ph);
  const pts=bez([-92,10],[-62,-60],[62,-60],[92,10],24);
  R.line(pts,col,26,1,0);R.circ(-92,22,30,col);R.circ(92,22,30,col);cv.restore()}
function cloud(R,x,y,s,col){
  for(const [dx,dy,r] of [[0,0,60],[70,-25,75],[150,0,62],[60,28,55],[115,26,58],[-35,30,42],[190,28,40]])R.circ(x+dx*s,y+dy*s,r*s,col)}
function s7_draw(R,t,c){
  const cv=R.cv;ground(R,GROUND,INK,0,W,1,3);cover(R,BG);
  const [x,y,ph]=s7_hs(t),gp=eo(seg(t,64.9,67.4));
  cv.save();R.arc(620,430,235,-90+25,310*gp,INK,9);cv.restore();
  phone(R,x,y+10,ph,INK);
  for(let k=0;k<4;k++){const ph_=66.4<=t&&t<69.0?(((t-66.4)/.62-k*.25)%1+1)%1:-1;
    if(ph_>=0){const r_=60+ph_*110,a=1-ph_;
      for(const sgn of [-1,1])R.arc(x+sgn*95,y+25,r_,-35+(sgn>0?0:90),70,INK,4,a*.8)}}
  const cp=eio(seg(t,68.6,72.2));
  for(const [cx_,cy_,s_] of [[2100,140,1.7],[2450,300,1.4],[2750,170,1.9],[3000,330,1.5]])cloud(R,cx_-cp*1800,cy_,s_,INK2);
  rain(R,t,INK,60,[0,0,W,GROUND],41,{a:sm(seg(t,70.3,72))})}
const SC7=new Scene("phone",BG,s7_draw,s7_bridge);
// ---------------- S8 faces melt ----------------
const s8_m=t=>eio(seg(t,74.3,76.9));
function s8_circle(t){const m=s8_m(t);return[960,lerp(400,GROUND+58,m),lerp(210,430,m),INK,lerp(1,.14,m)]}
const s8_bridge=t=>[s8_circle(t),[catmull([[620,-30],[630,300],[700,GROUND-30],[900,GROUND+20],[1100,GROUND+44]],14),0,1]];
function face_feat(R,cx,cy,r,col,fr,sq=1,line=6){
  const cv=R.cv;cv.save();cv.translate(cx,cy);cv.scale(1,sq);
  R.circ(-r*.36,-r*.2,r*.11,col);R.circ(r*.36,-r*.2,r*.11,col);
  const k=lerp(1,-1,fr);R.line(bez([-r*.5,r*.3],[-r*.25,r*.3+k*r*.38],[r*.25,r*.3+k*r*.38],[r*.5,r*.3],16),col,line,1,0);
  cv.restore()}
function s8_draw(R,t,c){
  const [cx,cy,cr]=c;ground(R,GROUND,INK,0,W,1,3);
  const fr=sm(seg(t,73.6,75.4)),m=s8_m(t);
  if(m<.8)face_feat(R,cx,cy,210*(m>0?cr/210:1),CREAM,fr,Math.max(.14,1-m*.86),9);
  [250,520,1400,1670].forEach((x,i)=>{const mm=eio(seg(t,74.5+i*.28,76.6+i*.28)),r=64;
    R.cv.save();R.cv.translate(x,GROUND);R.cv.scale(1+.9*mm,1-.86*mm);R.cv.translate(-x,-GROUND);
    const col=mix(CREAM,INK,sm(seg(mm,.3,.9)));
    R.circ(x,GROUND-r-4,r,col);R.ring(x,GROUND-r-4,r,INK,6);
    face_feat(R,x,GROUND-r-4,r,mix(INK,CREAM,sm(seg(mm,.4,.9))),fr);R.cv.restore()});
  rain(R,t,INK,60,[0,0,W,GROUND],41,{a:t<74?1-sm(seg(t,72.5,74)):sm(seg(t,77,79))});
  ripples(R,t,960,GROUND+58,430,CREAM,6,1.1,.8*sm(seg(t,76.5,77.5)))}
const SC8=new Scene("faces",BG,s8_draw,s8_bridge);
// ---------------- S9 eyes ----------------
function blink(t){let b=0;for(const tb of [81.6,84.2])b=Math.max(b,sin(PI*seg(t,tb,tb+.38))**2);return b}
function s9_circle(t){const lx=960+70*sin(seg(t,79.6,86.3)*2.6)+35*seg(t,79.6,86);return[lx,430,150,INK,1-.93*blink(t)]}
const UPPER=bez([440,430],[660,150],[1260,150],[1480,430],36),LOWER=bez([440,430],[680,710],[1240,710],[1480,430],36);
function eye_clip(R){return UPPER.concat(LOWER.slice().reverse())}
function s9_pre(R,t,c){const b=blink(t),cv=R.cv;cv.save();cv.translate(960,430);cv.scale(1,1-.93*b);cv.translate(-960,-430);
  R.poly(eye_clip(R),[250,243,228]);cv.restore()}
const s9_bridge=t=>[s9_circle(t),[catmull([[700,545],[690,640],[712,740],[790,GROUND-8],[1000,GROUND+4],[1500,GROUND-6],[1900,GROUND]],12),sm(seg(t,82.6,86.2))*0,eo(seg(t,82.6,86.2))]];
function s9_draw(R,t,c){
  const cv=R.cv,b=blink(t);cv.save();cv.translate(960,430);cv.scale(1,1-.93*b);cv.translate(-960,-430);
  R.line(UPPER,INK,10,1,.6,3);R.line(LOWER,INK,8,1,.6,4);
  const cx=c[0];R.circ(cx-48,370,20,CREAM);
  for(let i=0;i<9;i++){const u=(i+1)/10,p=UPPER[Math.trunc(u*35)],q=UPPER[Math.min(35,Math.trunc(u*35)+1)];
    let nx=-(q[1]-p[1]),ny=q[0]-p[0];const L=hypot(nx,ny);nx/=L;ny/=L;
    if(ny>0){nx=-nx;ny=-ny}
    R.line([p,[p[0]+nx*36*(.6+.4*sin(u*3.14)),p[1]+ny*36]],INK,5,1,0)}
  cv.restore();ground(R,GROUND,INK,0,W,1,3)}
const SC9=new Scene("eyes",BG,s9_draw,s9_bridge,s9_pre);
