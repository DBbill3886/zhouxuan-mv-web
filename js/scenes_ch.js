'use strict';
function stars(R,t,col,n=60,a=.8,seed=77,area=[0,0,W,700]){
  const rr=rnd(seed,n);
  for(let i=0;i<n;i++){
    const x=area[0]+rr[0][i]*(area[2]-area[0]),y=area[1]+rr[1][i]*(area[3]-area[1]);
    const tw=.5+.5*sin(t*(.8+rr[2][i]*1.6)+rr[3][i]*20);
    R.circ(x,y,1.5+rr[3][i]*2*tw,col,a*(.35+.65*tw))}}
function rotp(P,th,l){const c=cos(th),s=sin(th);return[P[0]+l[0]*c-l[1]*s,P[1]+l[0]*s+l[1]*c]}
function planet_fig(R,cx,cy,r,deg,h,col,face,ph,A,B,seed,sc=1.0,wamp=1.0,lean=0){
  const th=deg*PI/180,Pm=[cx+r*sin(th),cy-r*cos(th)];
  R.cv.save();R.cv.translate(...Pm);R.cv.rotate(th);R.cv.scale(sc,sc);
  fig(R,0,0,h,col,face,{walk:ph,wamp,A,B,seed,lean});R.cv.restore();
  const j=fig(NULL,0,0,h,col,face,{walk:ph,wamp,A,B,lean});
  return j.hand.map(p=>rotp(Pm,th,[p[0]*sc,p[1]*sc]))}
function make_chorus(T0,night,Tend){
  const fg=night?CREAM:INK,bg=night?INK:CREAM;
  const u_=t=>t-T0;
  // ---- A: title + orbit
  const TA=T0+7.89;
  function a_circ(t){
    const u=u_(t),y=night?lerp(700,430,eio(seg(u,0,3.8))):lerp(430,615,eio(seg(u,0,3.8)));
    const m=eio(seg(u,3.7,5.3));
    return[960,lerp(y,540,m),lerp(400,300,m),fg]}
  function orb(u,c){
    const [cx,cy,r]=c,sc=eob(seg(u,4.3,5.2),1.3);
    const thA=-70+17*(u-4.3),thB=thA+95;
    const hA=planet_fig(NULL,cx,cy,r,thA,250,fg,1,r*(thA*PI/180)/62,[85,12],[-10,12],1,sc);
    const hB=planet_fig(NULL,cx,cy,r,thB,250,fg,1,r*(thB*PI/180)/62+1,[15,12],[-82,12],2,sc);
    return[thA,thB,sc,hA,hB]}
  const HOR=[];for(let x=-60;x<2000;x+=40)HOR.push([x,GROUND+8*sin(x*.006)]);
  function a_thread(t){
    const u=u_(t),c=a_circ(t),[thA,thB,sc,hA,hB]=orb(u,c),[cx,cy,r]=c;
    const mids=[];
    for(let k=1;k<5;k++){
      const ph=lerp(thA+10,thB-10,k/5)*PI/180,rr=r+75+22*sin(k*1.7+t*1.3);
      mids.push([cx+rr*sin(ph),cy-rr*cos(ph)])}
    const arc=catmull([hA[0]].concat(mids,[hB[1]]),10);
    const m=eio(seg(u,3.9,5.3)),H_=resample(HOR,160),A_=resample(arc,160);
    const pts=H_.map((p,i)=>[lerp(p[0],A_[i][0],m),lerp(p[1],A_[i][1],m)]);
    return[pts,0,u>.2?1.0:eo(seg(u,-1.5,.2))]}
  function a_draw(R,t,c){
    const u=u_(t),[cx,cy,r]=c;
    cover(R,bg,GROUND+450*eio(seg(u,3.7,5.0)));
    if(night)stars(R,t,CREAM,50,.7);
    const q=eo(seg(u,3.9,4.8));
    if(q<1){
      const p=q===0?seg(u,.5,1.6):1-q;
      R.rise("heartbreaker",960,395,200,fg,p,'lat','c',0,[cx,cy,r],bg,.1);
      const p2=q===0?seg(u,1.3,2.4):1-q;
      R.rise("sundowner",960,632,200,fg,p2,'lat','c',0,[cx,cy,r],bg,.1)}
    if(u>4.2){
      const [thA,thB,sc,hA,hB]=orb(u,c);
      const wa=th=>cl(sc,0,1);
      planet_fig(R,cx,cy,r,thA,250,fg,1,r*(thA*PI/180)/62,[85,12],[-10,12],1,sc);
      planet_fig(R,cx,cy,r,thB,250,fg,1,r*(thB*PI/180)/62+1,[15,12],[-82,12],2,sc)}}
  const suffix=night?'True':'False';
  const SA=new Scene("chA"+suffix,bg,a_draw,t=>[a_circ(t),a_thread(t)]);
  // ---- B: shards + frost
  const TB=T0+7.89,LX=430,RX=1490,H_=330;
  function b_hands(t){
    const u=t-TB,l=fig(NULL,LX,GROUND,H_,INK,1,{lean:4,A:[98+3*sin(t*1.3),14],B:[-6,10]}).hand[0];
    const r=fig(NULL,RX,GROUND,H_,INK,-1,{lean:3,A:[95+4*sin(t*1.1+1),14],B:[-6,10]}).hand[0];
    return[l,r]}
  function b_thread(t){
    const [l,r]=b_hands(t),u=t-TB,sag=60+20*sin(t*1.3)+30*sm(seg(u,3,7));
    const mid=[(l[0]+r[0])/2,(l[1]+r[1])/2+sag];
    return[catmull([l,[(l[0]*3+r[0])/4,mid[1]-20],mid,[(l[0]+r[0]*3)/4,mid[1]-20],r],12),0,1.0]}
  const b_circ=t=>[960,330+6*sin(t*1.1),165,fg];
  function b_draw(R,t,c){
    const u=t-TB;ground(R,GROUND,fg,0,W,1,3);
    if(night)stars(R,t,CREAM,30,.5,77,[0,0,W,300]);
    const [l,r]=b_hands(t);
    fig(R,LX,GROUND,H_,fg,1,{lean:4,A:[98+3*sin(t*1.3),14],B:[-6,10],seed:11});
    fig(R,RX,GROUND,H_,fg,-1,{lean:3,A:[95+4*sin(t*1.1+1),14],B:[-6,10],seed:12});
    for(let i=0;i<6;i++){
      const ts=.8+.28*i,xt=640+(i*61)%190,yi=GROUND-70-i*72;
      const f=eo(seg(u,ts,ts+.6));if(f<=0)continue;
      const x=lerp(1400,xt,f),dt=Math.max(0,u-(2.6+.12*i)),y=Math.min(yi+.5*1500*dt*dt,GROUND-6);
      const fr=cl((y-yi)/Math.max(1,GROUND-6-yi)),rot=-lerp(0,32,fr);
      R.cv.save();R.cv.translate(x,y);R.cv.rotate(rot*PI/180);
      R.poly([[0,0],[240,-9],[240,9]],fg);R.cv.restore()}
    for(let k=0;k<8;k++){
      const pk=eo(seg(u,2.0+.3*k,2.8+.3*k));if(pk<=0)continue;
      const a=k*2.4,d=34+k*13,x=l[0]+14+cos(a)*d*.9,y=l[1]+sin(a)*d*.9-10,s_=(10+k*2.5)*pk;
      for(let j=0;j<3;j++){
        const an=j*PI/3+k;R.line([[x-cos(an)*s_,y-sin(an)*s_],[x+cos(an)*s_,y+sin(an)*s_]],fg,3.5,1,0)}}}
  const SB=new Scene("chB"+suffix,bg,b_draw,t=>[b_circ(t),b_thread(t)]);
  // ---- C: digger
  const TC=T0+15.66;
  function c_f(t){
    const u=t-TC,cr=.3+.22*sin(u*6.6);
    return{face:1,lean:14+6*sin(u*6.6),A:[78,32],B:[58,42],crouch:cr}}
  function c_hands(t){const k=c_f(t),j=fig(NULL,720,GROUND,340,INK,k.face,k);return j.hand}
  const c_circ=t=>[1500,330+5*sin(t),190,fg];
  function c_thread(t){
    const u=t-TC,h=c_hands(t)[1];
    return[bez([1500,520],[1470,640],[1060,GROUND-340],[h[0]+40,GROUND-20]),0,eo(seg(u,-.8,1.4))]}
  function coin(R,x,y,s=1,col_=fg,rot=0){
    R.ring(x,y,26*s,col_,6);R.cv.strokeStyle=col(col_,1);R.cv.lineWidth=4;
    R.cv.lineCap='round';R.cv.lineJoin='round';R.cv.strokeRect(x-10*s,y-10*s,20*s,20*s)}
  function c_draw(R,t,c){
    const u=t-TC;ground(R,GROUND,fg,0,W,1,3);
    if(night)stars(R,t,CREAM,30,.5,77,[0,0,W,300]);
    const k=c_f(t),h=c_hands(t);
    // coin hole + eye
    R.rect(1500-62,330-62,124,124,bg);
    const ep=sm(seg(u,1.0,2.0)),bl=1-.9*sin(PI*seg(u,4.2,4.5))**2*(u>4.2?1:0);
    if(ep>0){
      R.cv.save();R.cv.translate(1500,330);R.cv.scale(1,ep*bl);
      R.line(bez([-52,0],[-26,-34],[26,-34],[52,0],14),fg,6,1,0);R.line(bez([-52,0],[-26,34],[26,34],[52,0],14),fg,6,1,0);
      R.circ(14*sin(u*1.4),0,15,fg);R.cv.restore()}
    // mound
    const mp=sm(seg(u,.2,7));
    R.cv.save();R.clipRect(0,0,W,GROUND+1);R.oval(930,GROUND,70+80*mp,10+46*mp,fg);R.cv.restore();
    // shovel
    const [top,low]=h[0][1]<h[1][1]?[h[0],h[1]]:[h[1],h[0]];
    let dx=low[0]-top[0],dy=low[1]-top[1],L=hypot(dx,dy)||1;dx/=L;dy/=L;
    const tip=dy>.3?[low[0]+dx*(GROUND-low[1])/Math.max(.3,dy)*1.0,GROUND-4]:[low[0]+dx*200,low[1]+dy*200];
    dx=tip[0]-top[0];dy=tip[1]-top[1];L=hypot(dx,dy);dx/=L;dy/=L;
    R.line([[top[0]-dx*60,top[1]-dy*60],tip],fg,8,1,0);
    const nx=-dy,ny=dx;R.poly([tip,[tip[0]-dx*50+nx*26,tip[1]-dy*50+ny*26],[tip[0]-dx*50-nx*26,tip[1]-dy*50-ny*26]],fg);
    fig(R,720,GROUND,340,fg,k.face,{...k,seed:13});
    // coins
    for(let i=0;i<8;i++){
      const ts=.7+.52*i,dt=u-ts;if(dt<0)continue;
      const fl=.9,lx=1080+(i%8)*78,ly=GROUND-30;
      if(dt<fl){
        const f=dt/fl,x=lerp(940,lx,f),y=lerp(GROUND-30,ly,f)-sin(PI*f)*(250-i*10);
        coin(R,x,y,1)}
      else coin(R,lx,ly,1)}
    for(let i=0;i<5;i++){
      const ts=4.3+.35*i;
      if(u>ts){const f=eob(seg(u,ts,ts+.5),1.6);coin(R,1080+i*78,GROUND-84,f)}}}
  const SC=new Scene("chC"+suffix,bg,c_draw,t=>[c_circ(t),c_thread(t)]);
  // ---- D: chase
  const TD=T0+23.49;
  function d_state(t){
    const u=t-TD,ax=620+150*sm(seg(u,5.3,6.6)),bx=1230+-10*sm(seg(u,5.3,6.6));
    const run=1-sm(seg(u,6.4,7.2)),stop=1-sm(seg(u,5.1,5.9));
    return[ax,bx,run,stop]}
  const ph=t=>0;
  function d_poses(t){
    const u=t-TD,[ax,bx,run,stop]=d_state(t);
    const phA=Math.min(u,6.6)*9.5+(u-6.6)*0,phB=Math.min(u,5.6)*5.5;
    const A=fig(NULL,ax,GROUND,330,INK,1,{walk:phA,wamp:1.5*run+0.0,lean:12*run+2,A:[95,14],B:[-8,12]});
    const B=fig(NULL,bx,GROUND,330,INK,1,{walk:phB,wamp:stop,lean:3,A:[15,12],B:[-72+50*(1-stop),20]});
    return[[ax,bx,run,stop,phA,phB],A,B]}
  function d_thread(t){
    const u=t-TD,[[ax,bx,run,stop,phA,phB],A,B]=d_poses(t),h1=A.hand[0],h2=B.hand[1];
    const sag=8+16*sin(t*3)*run*0+170*sm(seg(u,5.9,7.2));
    const mid=[(h1[0]+h2[0])/2,(h1[1]+h2[1])/2+sag];
    return[catmull([h1,mid,h2],12),0,1.0]}
  const d_circ=t=>[960,250,205,fg];
  function d_draw(R,t,c){
    const u=t-TD,[[ax,bx,run,stop,phA,phB],A,B]=d_poses(t);
    ground(R,GROUND,fg,0,W,1,3);
    if(night)stars(R,t,CREAM,30,.5,77,[0,0,W,200]);
    const sp=200*(1-.7*sm(seg(u,5.2,6.5)))*1.0,off=((t*sp)%130+130)%130;
    for(let i=-1;i<17;i++)R.line([[i*130-off,GROUND+16],[i*130-off+36,GROUND+16]],fg,3,.6,0);
    fig(R,ax,GROUND,330,fg,1,{walk:phA,wamp:1.5*run,lean:12*run+2,A:[95,14],B:[-8,12],seed:14});
    fig(R,bx,GROUND,330,fg,1,{walk:phB,wamp:stop,lean:3,A:[15,12],B:[-72+50*(1-stop),20],seed:15})}
  const SD=new Scene("chD"+suffix,bg,d_draw,t=>[d_circ(t),d_thread(t)]);
  return[SA,SB,SC,SD]}
