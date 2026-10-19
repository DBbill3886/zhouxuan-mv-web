/* 周旋 MV · Web — engine: 场景切换(pan/iris/flood)、桥接物(圆+红线)、字幕、全局氛围 */
'use strict';
class Scene{constructor(name,bg,draw,bridge,pre=null){this.name=name;this.bg=bg;this.draw=draw;this.bridge=bridge;this.pre=pre;this.bgf=null}}
const SCENES=[],TRANS=[];
function add(scene,trans){SCENES.push(scene);if(trans)TRANS.push(trans)}   // trans=[T,kind,d,opt]
function circ_lerp(a,b,e,arc=0,ep=null){
  ep=ep===null?e:ep;
  return [lerp(a[0],b[0],ep),lerp(a[1],b[1],ep)-sin(PI*e)*arc,lerp(a[2],b[2],e),mix(a[3],b[3],e),lerp(a[4],b[4],e),lerp(a[5],b[5],e)]}
function norm_c(c){c=c.slice();if(c.length===4)c.push(1,1);else if(c.length===5)c.push(1);return c}
const lum=c=>c[0]*.3+c[1]*.55+c[2]*.15;
function draw_circle(R,c){
  const [x,y,rad,colr,sq,al]=c;if(rad<=.3||al<=.002)return;
  const g=R.cv,light=lum(colr)>120;
  g.save();g.translate(x,y);g.scale(1,sq);
  // 柔光晕 (极淡)，随呼吸起伏
  const br=1+.012*sin(TIME*1.1);
  g.beginPath();g.arc(0,0,rad*1.075*br,0,TAU);g.fillStyle=col(colr,.055*al);g.fill();
  // 套印错位的细边，像丝网印刷
  g.beginPath();g.arc(rad*.012+2.5,rad*.01+2,rad,0,TAU);g.strokeStyle=col(colr,.16*al);g.lineWidth=2.2;g.stroke();
  // 主体：极轻微的纸面渐变
  const gr=g.createRadialGradient(-rad*.35,-rad*.4,rad*.1,0,0,rad*1.05);
  gr.addColorStop(0,col(mix(colr,light?[255,251,238]:[96,118,172],.13),al));
  gr.addColorStop(1,col(mix(colr,light?[150,130,100]:[8,14,34],.10),al));
  g.beginPath();g.arc(0,0,rad,0,TAU);g.fillStyle=gr;g.fill();
  g.restore()}
function thread_lerp(ta,tb,e){
  if(!ta&&!tb)return null;const N=160;
  const prep=t=>{const [pts,f0,f1]=t;const q=pts.length>1?trim(pts,f0,f1):pts;return q.length>1?resample(q,N):null};
  const pa=ta?prep(ta):null,pb=tb?prep(tb):null;
  if(pa&&pb)return[pa.map((p,i)=>[lerp(p[0],pb[i][0],e),lerp(p[1],pb[i][1],e)]),0,1];
  if(pa)return[pa,0,1-e];
  if(pb)return[pb,0,e];
  return null}
function locate(t){
  for(let k=0;k<TRANS.length;k++){const [T,kind,d]=TRANS[k];if(T-d/2<=t&&t<T+d/2)return[k,true]}
  let i=0;for(let k=0;k<TRANS.length;k++){const [T,kind,d]=TRANS[k];if(t>=T+d/2)i=k+1}
  return[i,false]}
function sc_bridge(i,t){const [c,th]=SCENES[i].bridge(t);return[norm_c(c),th]}
const sbg=(sc,t)=>sc.bgf?sc.bgf(t):sc.bg;
function bgcol(t){
  const [k,tr]=locate(t);if(!tr)return sbg(SCENES[k],t);
  const [T,kind,d]=TRANS[k],u=(t-(T-d/2))/d;
  if(kind==='flood')return u<.5?sbg(SCENES[k],t):sbg(SCENES[k+1],t);
  if(kind==='pan')return mix(sbg(SCENES[k],t),sbg(SCENES[k+1],t),sm5(u));
  return mix(sbg(SCENES[k],t),sbg(SCENES[k+1],t),sm(seg(u,.2,.8)))}
function frame(R,t){
  const cv=R.cv,[k,tr]=locate(t);
  if(!tr){
    const sc=SCENES[k],[c,th]=sc_bridge(k,t);
    R.rect(0,0,W,H,sbg(sc,t));
    if(sc.pre)sc.pre(R,t,c.slice(0,4));
    draw_circle(R,c);sc.draw(R,t,c.slice(0,4));
    if(th)R.thread(...th);return}
  const [T,kind,d,opt0]=TRANS[k],u=cl((t-(T-d/2))/d),A=SCENES[k],B=SCENES[k+1],opt=opt0||{};
  const [cA,thA]=sc_bridge(k,t),[cB,thB]=sc_bridge(k+1,t);
  if(kind==='pan'){
    const [dx,dy]=opt.dir||[1,0],e=sm5(u);
    const oA=[-dx*W*e,-dy*H*e],oB=[dx*W*(1-e),dy*H*(1-e)];
    const c=circ_lerp(cA,cB,e,opt.arc??80);
    cv.save();cv.translate(oA[0],oA[1]);R.rect(0,0,W,H,sbg(A,t));cv.restore();
    cv.save();cv.translate(oB[0],oB[1]);R.rect(0,0,W,H,sbg(B,t));cv.restore();
    for(const [sc,o] of [[A,oA],[B,oB]])if(sc.pre){cv.save();cv.translate(o[0],o[1]);sc.pre(R,t,[c[0]-o[0],c[1]-o[1],c[2],c[3]]);cv.restore()}
    draw_circle(R,c);
    for(const [sc,o] of [[A,oA],[B,oB]]){cv.save();cv.translate(o[0],o[1]);sc.draw(R,t,[c[0]-o[0],c[1]-o[1],c[2],c[3]]);cv.restore()}
    const th=thread_lerp(thA,thB,e);if(th)R.thread(...th);
  }else if(kind==='iris'){
    const e=sm5(u),c=circ_lerp(cA,cB,e,opt.arc||0),rad=eio(u)*2400,ctr=[c[0],c[1]];
    R.rect(0,0,W,H,sbg(A,t));
    cv.save();R.clip_circle(ctr[0],ctr[1],rad);R.rect(0,0,W,H,sbg(B,t));cv.restore();
    if(A.pre){cv.save();R.clip_circle(ctr[0],ctr[1],rad,true);A.pre(R,t,c.slice(0,4));cv.restore()}
    if(B.pre){cv.save();R.clip_circle(ctr[0],ctr[1],rad);B.pre(R,t,c.slice(0,4));cv.restore()}
    draw_circle(R,c);
    cv.save();R.clip_circle(ctr[0],ctr[1],rad,true);A.draw(R,t,c.slice(0,4));cv.restore();
    cv.save();R.clip_circle(ctr[0],ctr[1],rad);B.draw(R,t,c.slice(0,4));cv.restore();
    if(u>0&&u<1)R.ring(ctr[0],ctr[1],rad,RED,6,.9*Math.sqrt(sin(PI*u)));
    const th=thread_lerp(thA,thB,e);if(th)R.thread(...th);
  }else if(kind==='flood'){
    const piv=[cA[0],cA[1]];
    if(u<.5){
      const e=eio(u/.5),cc=[cA[0],cA[1],lerp(cA[2],2800,e**1.6),cA[3],lerp(cA[4],1,e),1];
      const sc_=1+1.2*ei(u/.5);
      R.rect(0,0,W,H,sbg(A,t));
      if(A.pre)A.pre(R,t,cA.slice(0,4));
      draw_circle(R,cc);
      cv.save();cv.translate(piv[0],piv[1]);cv.scale(sc_,sc_);cv.translate(-piv[0],-piv[1]);
      A.draw(R,t,cA.slice(0,4));cv.restore();
    }else{
      const v=(u-.5)/.5,e=eob(v,1.2),sc_=1+.25*(1-eo(v));
      R.rect(0,0,W,H,sbg(B,t));
      const cc=[cB[0],cB[1],cB[2]*e,cB[3],cB[4],1];
      if(B.pre)B.pre(R,t,[cB[0],cB[1],cB[2]*e,cB[3]]);
      draw_circle(R,cc);
      cv.save();cv.translate(cB[0],cB[1]);cv.scale(sc_,sc_);cv.translate(-cB[0],-cB[1]);
      B.draw(R,t,[cB[0],cB[1],cB[2]*e,cB[3]]);cv.restore();
    }
    const th=thread_lerp(thA,thB,sm5(u));if(th)R.thread(...th);
  }
}
// ---------------- 歌词 / 字幕 ----------------
const BREAKS=[21.87,37.50,45.27,56.55,71.73,86.58,138.0,203.70,235.77,263.19];
function build_blocks(lines,breaks,per=3,cap=4.6){
  const ls=lines.filter(l=>l[0]>=21&&l[0]<266),blocks=[];let cur=[];
  for(const [t,s] of ls){if(cur.length&&(cur.length>=per||breaks.some(b=>abs(t-b)<.05))){blocks.push(cur);cur=[]}cur.push([t,s])}
  if(cur.length)blocks.push(cur);
  return blocks.map((b,bi)=>{const st=b[0][0],lastt=b[b.length-1][0],nxt=bi+1<blocks.length?blocks[bi+1][0][0]:1e9;
    return[st,Math.min(nxt-.35,lastt+cap),b]})}
const BLOCKS=build_blocks(LRC.filter(l=>l[1]),BREAKS);
const RAP=[138,203.7];
function capColor(t){const bg=bgcol(t);return lum(bg)>120?INK:CREAM}
// 把一行歌词按宽度折行 (CJK 逐字，西文按词)
function wrapLine(str,sz,maxW){
  const toks=str.match(/[A-Za-z0-9'’]+|\s+|[^\sA-Za-z0-9'’]/g)||[str];const rows=[''];let w=0;
  for(const tk of toks){const tw=measure('cjk',tk,sz);
    if(w+tw>maxW&&rows[rows.length-1].trim()){rows.push('');w=0;if(!tk.trim())continue}
    rows[rows.length-1]+=tk;w+=tw}
  return rows.map(s=>s.trim()).filter(Boolean)}
/* 字幕：横屏在舞台坐标系下绘制 (左下)；竖屏在舞台下方的屏幕空间里居中大字 */
function captions(R,t,V){
  const c=capColor(t),rap=t>=RAP[0]&&t<RAP[1];
  for(const [st,en,ls] of BLOCKS){
    if(!(st-.1<=t&&t<=en+.8))continue;
    const out=sm(seg(t,en,en+.6));let active=-1;
    ls.forEach(([lt],i)=>{if(t>=lt)active=i});
    if(!V.portrait){
      const base=892,sp=60,sz=40;
      ls.forEach(([lt,s],i)=>{
        const p=seg(t,lt,lt+(rap?.55:1.0));if(p<=0)return;
        const y=base+i*sp+out*14,dim=(active>i)?.5:1;   // 已唱过的行略淡，当前行突出
        const g=R.cv;g.save();g.globalAlpha=dim*(1-out);
        if(rap||out>0)R.text(s,150,y+(1-eo(p))*10*(rap?1:0),sz,c,'cjk','l',rap?eo(p):1);
        else R.rise(s,150,y,sz,c,p,'cjk','l',0,null,null,.03);
        g.restore();
      });
      if(active>=0&&out<.9){const lt=ls[active][0],yy=base+active*sp-13,pa=eo(seg(t,lt,lt+.5))*(1-out);R.rect(100,yy-3,28*pa,6,RED)}
    }else{
      // 竖屏：只显示当前行 (上一行淡出)，大字号折行居中
      const sz=V.capSize,maxW=V.w-V.pad*2,lh=sz*1.55;
      const showI=Math.max(active,0);
      const [lt,s]=ls[showI];if(t<lt-.05&&active<0)continue;
      const p=seg(t,lt,lt+(rap?.5:.9)),rows=wrapLine(s,sz,maxW);
      const total=rows.length*lh,y0=V.capTop+(V.capH-total)/2+sz;
      const g=R.cv;g.save();
      rows.forEach((row,ri)=>{const yy=y0+ri*lh;
        if(rap||out>0)R.text(row,V.w/2,yy+(1-eo(p))*8,sz,c,'cjk','c',eo(p)*(1-out));
        else R.rise(row,V.w/2,yy,sz,c,seg(p,ri*.2,1),'cjk','c',0,null,null,.03)});
      // 红色小短线 + 行计数
      const pa=eo(seg(t,lt,lt+.5))*(1-out);
      R.rect(V.w/2-14*pa,y0+rows.length*lh-sz*.55,28*pa,3,RED);
      g.restore();
    }
  }
}
