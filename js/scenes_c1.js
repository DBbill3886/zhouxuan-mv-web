'use strict';
// ---------- S14a rolling ----------
function gh(x,sc){return GROUND-12+26*sin((x+sc)*.0045)+14*sin((x+sc)*.011+1)}
const s14a_sc=t=>(t-118.0)*150;
function s14a_c(t){const sc=s14a_sc(t),r=235;return[1250,gh(1250,sc)-r+4,r,INK]}
function s14a_thread(t){const sc=s14a_sc(t),h=fig(NULL,600,gh(600,sc),340,INK,1,{walk:sc/62,lean:8,A:[88,10],B:[-12,12]}).hand[0];
  const c=s14a_c(t),droop=40+60*sm(seg(t,124,128));
  return[bez(h,[h[0]+160,h[1]+droop],[c[0]-c[2]-200,c[1]+c[2]*.5+droop],[c[0]-c[2]*.98,c[1]+10]),0,eo(seg(t,117,119.5))]}
function s14a_draw(R,t,c){const sc=s14a_sc(t);
  [[470,.22,.0021,.18],[560,.35,.0032,.38]].forEach(([yb,a,k,sp],lay)=>{const pts=[];
    for(let x=-20;x<1960;x+=16)pts.push([x,yb+38*sin((x+sc*sp)*k+lay)+18*sin((x+sc*sp)*k*2.6)]);
    R.line(pts,INK,4,a,0,0)});
  const gp=[];for(let x=-20;x<1960;x+=10)gp.push([x,gh(x,sc)]);R.line(gp,INK,3.5,1,0,0);
  const [cx,cy,cr]=c,ang=sc/cr;
  R.circ(cx+cr*.72*cos(ang),cy+cr*.72*sin(ang),18,CREAM);
  R.line([[cx,cy],[cx+cr*.5*cos(ang+2.1),cy+cr*.5*sin(ang+2.1)]],CREAM,5,.8,0);
  fig(R,600,gh(600,sc),340,INK,1,{walk:sc/62,lean:8,A:[88,10],B:[-12,12],seed:21});
  rain(R,t,INK,40,[0,0,W,GROUND],23,{a:.6*sm(seg(t,121,124))})}
const SC14A=new Scene("roll",BG,s14a_draw,t=>[s14a_c(t),s14a_thread(t)]);
// ---------- S14b spiral ----------
function spiral(t,n=420){const rot=(t-128)*.5+ei(seg(t,134.5,138))*3.5,sc=1-.55*ei(seg(t,134.5,138)),pts=[];
  for(let i=0;i<n;i++){const s=i/(n-1),th=s*7.2*PI,r=lerp(60,470,s)*sc*(1+.04*sin(t*1.3+s*9));pts.push([960+r*cos(th+rot),540+r*sin(th+rot)*.74])}return pts}
const s14b_c=t=>[960,540,lerp(66,118,sm(seg(t,135,138)))+3*sin(t*2),CREAM];
function s14b_bridge(t){const pts=spiral(t);return[s14b_c(t),[pts,0,eo(seg(t,128.4,134.2))]]}
function s14b_draw(R,t,c){stars(R,t,CREAM,90,.8,77,[0,0,W,H*.8]);
  const pts=spiral(t),f=eo(seg(t,128.4,134.2)),s=cl(eo(seg(t,129.2,137))*f*.98),i=Math.trunc(s*(pts.length-1)),p=pts[i],q=pts[Math.min(i+1,pts.length-1)];
  if(f>.02)fig(R,p[0],p[1],74,CREAM,q[0]>=p[0]?1:-1,{walk:plen(pts.slice(0,i+1))/16,wamp:1,lw:4,wb:0})}
const SC14B=new Scene("spiral",INK,s14b_draw,s14b_bridge);
// ---------- S15 fireworks ----------
function s15_c(t){const m=eio(seg(t,138.2,139.3)),g=sm(seg(t,140.2,143));return[960,lerp(540,330,m),lerp(lerp(118,32,m),95,g),CREAM]}
function s15_thread(t){const c=s15_c(t),sw=sin(t*2)*10;return[catmull([[960,GROUND],[960+sw,GROUND-150],[950-sw,c[1]+260],[960,c[1]+c[2]]],10),0,eo(seg(t,138.0,139.3))]}
function burst(R,t,tb,cx,cy,Rm,n,cols,sd=0){const u=t-tb;if(u<0||u>3.2)return;
  const rr=rnd(sd+Math.trunc(tb*7),n);
  for(let i=0;i<n;i++){const a=i/n*2*PI+rr[0][i]*.08,sp=.78+.34*rr[1][i],head=lerp(30,Rm*sp,eo(seg(u,0,1.5))),tail=lerp(30,Rm*sp*.95,ei(seg(u,.55,2.4))),al=1-sm(seg(u,1.9,3.1)),g=.5*160*Math.max(0,u-.5)**2;
    if(head>tail+1){R.line([[cx+cos(a)*tail,cy+sin(a)*tail+g*(tail/Rm)],[cx+cos(a)*head,cy+sin(a)*head+g*(head/Rm)]],cols[i%cols.length],4.5,al,0);
      R.circ(cx+cos(a)*head,cy+sin(a)*head+g*(head/Rm),5*(1-sm(seg(u,1,2.2))),cols[i%cols.length],al)}}}
function s15_draw(R,t,c){stars(R,t,CREAM,60,.55,77,[0,0,W,500]);ground(R,GROUND,CREAM,0,W,1,3);
  burst(R,t,139.3,960,330,360,30,[CREAM,CREAM,RED,CREAM],1);
  burst(R,t,141.1,520,430,230,22,[RED,CREAM,CREAM],2);
  burst(R,t,142.2,1450,380,260,24,[CREAM,RED,CREAM,CREAM],3);
  fig(R,300,GROUND,260,CREAM,1,{lean:-6,A:[14,14],B:[-12,12],tilt:-18,seed:24})}
const SC15=new Scene("fire",INK,s15_draw,t=>[s15_c(t),s15_thread(t)]);
// ---------- S16 passers ----------
const LANES=[[560,130,70,.45,1,9],[680,190,105,.7,-1,7],[GROUND,270,160,1.0,1,5]];
function s16_hand(t){const dr=sm(seg(t,148.8,150.5));return fig(NULL,250,GROUND,330,INK,1,{lean:4,A:[82-60*dr,10],B:[-8,10]}).hand[0]}
function s16_thread(t){const h=s16_hand(t),dr=sm(seg(t,148.8,150.8)),c=[1390,300,170],e=[c[0]-c[2]*.9,c[1]+60],mid=[(h[0]+e[0])/2,(h[1]+e[1])/2+30+200*dr];
  return[catmull([h,[(h[0]+mid[0])/2,(h[1]+mid[1])/2+20+60*dr],mid,[(e[0]+mid[0])/2,(e[1]+mid[1])/2+10],e],10),0,1.0]}
function s16_draw(R,t,c){ground(R,GROUND,INK,0,W,1,3);const u=t-143.0;
  LANES.forEach(([yb,h,sp,al,d,n],li)=>{const col=mix(CREAM,INK,al);if(li<2)R.line([[0,yb],[W,yb]],INK,2.5,al*.6,0);
    for(let i=0;i<n;i++){const span=W+500,x=(((i*span/n+rnd(50+li,n)[0][i]*60+d*sp*u)%span)+span)%span-250;
      fig(R,x,yb,h,col,d,{walk:x/(h*.17),wamp:1,lw:Math.max(4,h*.027),wb:.5,seed:li*10+i})}});
  fig(R,250,GROUND,330,INK,1,{lean:4,A:[82-60*sm(seg(t,148.8,150.5)),10],B:[-8,10],seed:25})}
const SC16=new Scene("pass",BG,s16_draw,t=>[[1390,300+5*sin(t),170,INK],s16_thread(t)]);
// ---------- S17 hand + fish ----------
function s17_c(t){let x,y,r,sq;
  if(t<153.4){x=420;y=330+8*sin(t*1.5);r=95;sq=1}
  else{const m=eio(seg(t,153.4,154.8));x=lerp(420,960,m);y=lerp(330,190,m);r=lerp(95,85,m);sq=1;
    const d=ei(seg(t,154.8,156.0));if(d>0){y=lerp(190,GROUND+58,d);r=lerp(85,330,d);sq=lerp(1,.14,d);x=960}}
  const dry=sm(seg(t,156.5,158.3));r=sq<1?r*(1-.3*dry):r;
  const col=mix(hot(),INK,sm(seg(t,151.5,156)));return[x,y,r,col,sq]}
const PALM=[400,540];
function s17_thread(t){const c=s17_c(t),end=[c[0],c[1]+c[2]*c[4]*.95];return[bez([PALM[0],PALM[1]-20],[PALM[0]+20,PALM[1]-120],[end[0]-30+30*sin(t*2),end[1]+110],end),0,eo(seg(t,150.8,152.2))]}
function s17_draw(R,t,c){const cv=R.cv;ground(R,GROUND,INK,0,W,1,3);const cl_=sm(seg(t,152.2,155.2));
  R.line([[-80,720],[120,640],[300,590],[PALM[0],PALM[1]+10]],INK,12,1,.5,3);R.circ(PALM[0],PALM[1]-4,36,INK);
  for(let i=0;i<5;i++){const a=(-66+i*33)*PI/180*(1-.8*cl_),L=(120-(i===0?34:0))*(1-.55*cl_),base=[PALM[0]+sin(a)*30,PALM[1]-4-cos(a)*30];
    R.line([base,[PALM[0]+sin(a)*(30+L),PALM[1]-4-cos(a)*(30+L)*(1-.0)]],INK,11,1,.3,i)}
  const [cx,cy,cr]=c,sq=s17_c(t)[4];
  if(t>155.6){const fp=sm(seg(t,156.2,157.2));ripples(R,t,960,GROUND+58,cr,CREAM,6,1.1,.7,.14,9);
    for(let k=0;k<2;k++){const ph=t*.9+k*PI,fx=960+cr*.52*cos(ph),fy=GROUND+58+cr*.14*.52*sin(ph),ang=atan2(cr*.14*.52*cos(ph),-cr*.52*sin(ph));
      cv.save();cv.translate(fx,fy);cv.rotate(ang);cv.scale(fp*(k?.6:.8),fp*(k?.6:.8)*1.0);
      R.line(bez([-40,0],[-14,-16],[24,-16],[46,0],12),CREAM,5,1,0);R.line(bez([-40,0],[-14,16],[24,16],[46,0],12),CREAM,5,1,0);
      R.line([[-40,0],[-62,-16]],CREAM,5,1,0);R.line([[-40,0],[-62,16]],CREAM,5,1,0);R.circ(26,-3,3.5,CREAM);cv.restore()}}}
const SC17=new Scene("hand",BG,s17_draw,t=>[s17_c(t),s17_thread(t)]);
// ---------- S18 dream ----------
const s18_c=t=>[1280,360+8*sin(t*1.4),215+4*sin(t*2),INK];
const s18_thread=t=>[bez([640,GROUND-16],[800,GROUND-120],[1300,GROUND-60],[1275,610]),0,eo(seg(t,157.5,159.5))];
function s18_draw(R,t,c){const [cx,cy,cr]=c;ground(R,GROUND,INK,0,W,1,3);const br=sin(t*1.6)*2.5;
  R.circ(300,GROUND-34+br,30,INK);
  R.line([[335,GROUND-22+br],[480,GROUND-18+br],[650,GROUND-18+br]],INK,10,1,.5,2);
  R.line([[480,GROUND-18+br],[560,GROUND-52+br],[660,GROUND-16+br]],INK,9,1,.5,3);
  R.line([[380,GROUND-20+br],[430,GROUND-62+br],[470,GROUND-42+br]],INK,9,1,.5,4);
  const bp=eo(seg(t,158.0,159.3));for(const [x,y,r] of [[360,GROUND-130,13],[430,GROUND-230,22],[560,GROUND-350,34]])R.circ(x,y,r*bp,INK);
  // inside bubble: two figures holding hands
  const sw=sin(t*1.2)*3;
  fig(R,cx-48,cy+170,170,CREAM,1,{lean:2+sw,A:[80,10],B:[-10,10],lw:7,seed:5});
  fig(R,cx+48,cy+170,170,CREAM,-1,{lean:2-sw,A:[80,10],B:[-10,10],lw:7,seed:6});
  R.text("z",330,GROUND-90-((t*20)%80+80)%80,40,INK,'lat','l',1-(((t*20)%80+80)%80)/80)}
const SC18=new Scene("dream",BG,s18_draw,t=>[s18_c(t),s18_thread(t)]);
// ---------- S19 puppet ----------
function s19_state(t){const cut=sm(seg(t,166.5,167.0)),u=t-162;
  const k={face:1,lean:3*sin(u*2.6)*(1-cut)+28*cut,A:[lerp(125+45*sin(u*3.1),20,cut),lerp(20,10,cut)],B:[lerp(-125-45*sin(u*3.1+1.2),-14,cut),10],crouch:lerp(.12+.1*sin(u*5.2),.78,sm(seg(t,166.6,167.6)))};return k}
function s19_joints(t){const k=s19_state(t),y=GROUND-(1-.0)*0;return fig(NULL,960,GROUND,360,INK,k.face,k)}
function s19_bar(t){const cut=eio(seg(t,167.0,168.4)),sw=sin((t-162)*1.9)*.07*(1-cut);return[cut,sw]}
function s19_strings(t){const [cut,sw]=s19_bar(t),j=s19_joints(t),cx=960,y0=70-cut*260,bp=dx=>[cx+dx*cos(sw),y0+dx*sin(sw)];
  const pts=[[bp(0),j.head.slice(0,2)],[bp(-190),j.hand[0]],[bp(190),j.hand[1]],[bp(-60),j.knee[0]],[bp(60),j.knee[1]]];return pts}
function s19_thread(t){const h=s19_strings(t)[0],f=1-eo(seg(t,166.5,167.6)),head=[h[1][0],h[1][1]-34];return[[h[0],head],0,t>166.5?f:eo(seg(t,161.3,162.4))]}
function s19_draw(R,t,c){const [cut,sw]=s19_bar(t);ground(R,GROUND,INK,0,W,1,3);const k=s19_state(t),y0=70-cut*260;
  R.cv.save();R.cv.translate(960,y0);R.cv.rotate(sw);R.line([[-230,0],[230,0]],INK,12,1,.3,1);R.line([[0,0],[0,-60]],INK,10,1,0);R.cv.restore();
  const gh_=0;fig(R,960,GROUND,360,INK,k.face,{seed:26,...k});
  if(t>168.2){const gp=sm(seg(t,168.2,170.6)),gx=lerp(2100,1500,eo(seg(t,168.2,171)));fig(R,gx,GROUND,340,mix(CREAM,INK,.3),-1,{walk:gx/62,wamp:1.0*(1-sm(seg(t,170.3,171.3))),seed:27})}
  const ps=s19_strings(t),f=1-eo(seg(t,166.5,167.6));ps.slice(1).forEach(([a,b],i)=>{if(f>0.01)R.line([a,b],RED,4,1,.3,i,0,1.0*f)})}
const SC19=new Scene("puppet",BG,s19_draw,t=>[[1580,300,140,INK],s19_thread(t)]);
// ---------- S20 shadows + bubbles ----------
function s20_hands(t){const a=fig(NULL,700,GROUND,330,INK,1,{lean:3,A:[88,12],B:[-8,10]}).hand[0],b=fig(NULL,1180,GROUND,330,INK,-1,{lean:3,A:[92,12],B:[-8,10]}).hand[0];return[a,b]}
function s20_thread(t){const [a,b]=s20_hands(t),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2+50+14*sin(t*1.3)];return[catmull([a,[(a[0]+mid[0])/2,mid[1]-12],mid,[(b[0]+mid[0])/2,mid[1]-12],b],10),0,eo(seg(t,169.8,171.4))]}
function s20_draw(R,t,c){ground(R,GROUND,INK,0,W,1,3);const sp=eo(seg(t,170.2,172));
  for(const x of [700,1180]){const L=560*sp;R.poly([[x-14,GROUND+5],[x+L,GROUND+5],[x+L,GROUND+19],[x-14,GROUND+19]],INK,.85);R.oval(x+L+8,GROUND+14,44*sp,11*sp,INK,.85)}
  const bp=eo(seg(t,172.0,173.2));R.circ(1560,GROUND+12,24*eob(seg(t,172.6,173.5),2)*bp,RED);
  for(let k=0;k<3;k++){const ph=(((t-173)/1.6+k/3)%1+1)%1;if(t>173)R.ring(1560,GROUND+12,24+ph*70,RED,3,(1-ph)*.7)}
  fig(R,700,GROUND,330,INK,1,{lean:3,A:[88,12],B:[-8,10],seed:28});fig(R,1180,GROUND,330,INK,-1,{lean:3,A:[92,12],B:[-8,10],seed:29});
  const [a,b]=s20_hands(t);
  for(let k=0;k<7;k++){const ts=174.7+.55*k,u=t-ts;if(u<0)continue;const life=2.0,r=34+(k%3)*12;
    if(u<life){const x=a[0]+60+u*60+(k%2)*10+sin(u*2+k)*26,y=a[1]-u*105-20;
      R.ring(x,y,r,INK,4,.9);R.line(bez([x-r*.55,y-r*.3],[x-r*.35,y-r*.7],[x-r*.05,y-r*.82],[x+r*.2,y-r*.78],8),CREAM,3,.9,0)}
    else if(u<life+.45){const f=(u-life)/.45,x=a[0]+60+life*60+(k%2)*10+sin(life*2+k)*26,y=a[1]-life*105-20;
      for(let j=0;j<9;j++){const an=j/9*2*PI;R.line([[x+cos(an)*(r+8+f*28),y+sin(an)*(r+8+f*28)],[x+cos(an)*(r+20+f*40),y+sin(an)*(r+20+f*40)]],INK,3,1-f,0)}}}}
const SC20=new Scene("shadow",BG,s20_draw,t=>[[170,GROUND-180,215,INK],s20_thread(t)]);
// ---------- S21 sea storm ----------
function wave(x,t,i){return 560+i*52+(34-i*4)*sin(x*(.006+.0012*i)-t*(1.6+.3*i)+i*2)+10*sin(x*.021+t*2.4+i)}
function s21_boat(t){const x=1030,y=wave(x,t,1)-8,sl=(wave(x+6,t,1)-wave(x-6,t,1))/12;return[x,y,atan(sl)*180/PI]}
const BOLT=[[1520,-30],[1470,120],[1530,200],[1400,330],[1450,380],[1330,520]];
const s21_thread=t=>[BOLT,sm(seg(t,181.3,181.8)),eo(seg(t,180.6,180.85))];
function s21_draw(R,t,c){const cv=R.cv;stars(R,t,CREAM,25,.4,77,[0,0,W,260]);
  for(let i=0;i<5;i++){const pts=[];for(let x=-20;x<1960;x+=20)pts.push([x,wave(x,t,i)]);
    const poly=pts.concat([[1940,1100],[-20,1100]]);R.poly(poly,mix(INK,CREAM,.05+i*.04));R.line(pts,CREAM,3.5,.9-.14*i,0,0);
    if(i===1){const [x,y,a]=s21_boat(t);cv.save();cv.translate(x,y);cv.rotate(a*PI/180);
      R.line(bez([-90,-6],[-70,26],[70,26],[100,-8],14).concat([[-90,-6]]),CREAM,7,1,0);
      R.poly([[0,-10],[0,-150],[78,-24]],CREAM);R.line([[0,-10],[0,-160]],CREAM,5,1,0);cv.restore()}}
  const fl=exp(-6*Math.max(0,t-180.6))*(180.6<t&&t<181.8?1:0);if(fl>.02)R.rect(0,0,W,H,CREAM,.18*fl);
  rain(R,t,CREAM,95,[0,0,W,H],61,{speed:1300,ang:.28,L:40,a:.55*sm(seg(t,178.6,179.8))})}
const SC21=new Scene("storm",INK,s21_draw,t=>[[420,250,150,CREAM],s21_thread(t)]);
// ---------- S22 moon ripples ----------
const s22_c=t=>[960,380,290+5*sin(t*.9),CREAM];
const s22_hill=x=>GROUND-30-110*exp(-(((x-520)/420)**2))+0*x;
function s22_thread(t){const fx=520,fy=s22_hill(fx),h=fig(NULL,fx,fy,150,CREAM,1,{lean:2,A:[110,20],B:[-8,10],tilt:-25}).hand[0];return[bez(h,[h[0]+160,h[1]-80],[760,330],[960-230,380+80]),0,eo(seg(t,182.0,184.4))]}
function s22_draw(R,t,c){stars(R,t,CREAM,110,.8,88,[0,0,W,700]);const [cx,cy,cr]=c;
  for(let k=0;k<4;k++){const ph=(((t-182.4)/1.5+k/4)%1+1)%1;if(t>182.4)R.ring(cx,cy,cr+ph*620,CREAM,3,(1-ph)**1.5*.55)}
  const pts=[];for(let x=-40;x<1960;x+=20)pts.push([x,s22_hill(x)]);
  R.poly(pts.concat([[1960,1100],[-40,1100]]),mix(INK,CREAM,.1));R.line(pts,CREAM,3,.9,0,0);
  const fx=520,fy=s22_hill(fx);fig(R,fx,fy,150,CREAM,1,{lean:2,A:[110,20],B:[-8,10],tilt:-25,lw:7,seed:30})}
const SC22=new Scene("moon",INK,s22_draw,t=>[s22_c(t),s22_thread(t)]);
// ---------- S23 time-lapse + ink rise ----------
function s23_c(t){const u=t-187.38,a=2*PI*u/4.6,x=960+760*sin(a),y=GROUND-130-420*(.5+.5*cos(a*2));return[x,y,150,INK]}
const s23_f=t=>lerp(1.0,.5,sm(seg(t,190.6,193.5)));
function s23_th(t){const h=fig(NULL,300,GROUND,330*s23_f(t),INK,1,{lean:3,A:[60,10],B:[-8,10]}).hand[0],c=s23_c(t);return[bez(h,[h[0]+100,h[1]-200],[c[0]-200,c[1]+100],[c[0],c[1]+c[2]*.9]),0,eo(seg(t,187.0,188.6))]}
const s23_top=t=>H+40-(H+120)*eio(seg(t,190.6,194.0));
const s23_bgf=t=>s23_top(t)<300?INK:BG;
function s23_draw(R,t,c){ground(R,GROUND,INK,0,W,1,3);fig(R,300,GROUND,330*s23_f(t),INK,1,{lean:3,A:[60,10],B:[-8,10],seed:31});
  const top=s23_top(t);if(top<H){const pts=[];for(let x=-20;x<1960;x+=16)pts.push([x,top+14*sin(x*.012+t*2.6)*seg(top,-50,400)+8*sin(x*.031-t*3.3)]);R.poly(pts.concat([[1940,1200],[-20,1200]]),INK)}}
const SC23=new Scene("flood",BG,s23_draw,t=>[s23_c(t),s23_th(t)]);
SC23.bgf=s23_bgf;
// ---------- S24 fuse ----------
const FUSE=null;
function s24_pts(t){const h=fig(NULL,520,GROUND,320,CREAM,1,{lean:2,A:[30,20],B:[-8,10],tilt:0}).hand[0];return catmull([h,[h[0]+60,h[1]+160],[700,GROUND-10],[1000,GROUND-3],[1300,GROUND-20],[1500,GROUND-180],[1500,360+160]],12)}
const s24_burn=t=>sm5(seg(t,198.4,203.2));
const s24_thread=t=>[s24_pts(t),0,t>198.4?1-s24_burn(t):eo(seg(t,194.0,196))];
function s24_draw(R,t,c){stars(R,t,CREAM,70,.7,91,[0,0,W,600]);ground(R,GROUND,CREAM,0,W,1,3);const up=sm(seg(t,196.8,198.2));
  fig(R,520,GROUND,320,CREAM,1,{lean:2,A:[30,20],B:[-8,10],tilt:-22*up,seed:32});
  if(198.4<t&&t<203.6){const pts=s24_pts(t),b=1-s24_burn(t),seg_=trim(pts,0,b);
    if(seg_.length){const p=seg_[seg_.length-1];for(let k=0;k<8;k++){const ph=((t*2.7+k*.37)%1+1)%1,an=-PI/2+(rnd(5,8)[0][k]-.5)*2.4;
      R.line([[p[0],p[1]],[p[0]+cos(an)*ph*60,p[1]+sin(an)*ph*70-ph*20]],CREAM,3,1-ph,0)}
      R.circ(p[0],p[1],10+3*sin(t*30),CREAM);R.circ(p[0],p[1],6,RED)}}}
const SC24=new Scene("fuse",INK,s24_draw,t=>[[1500,360,205,CREAM],s24_thread(t)]);
