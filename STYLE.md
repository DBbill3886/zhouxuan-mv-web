# 周旋 MV · Web — STYLE GUIDE (single source of truth)

Style B: warm cream paper, deep ink-blue, ONE faded-red thread, giant circle / dusk-sun motif,
simple stick figures, bold designed Chinese typography. 100% code-drawn (Canvas 2D). No images, no instruments.

## Code module = js/lib.js (+ js/engine.js). Use ONLY these, never redefine them.
Palette (RGB arrays): INK [23,36,68], CREAM [240,228,205], RED [201,76,56] (thread/accents ONLY, sparingly),
INK2 [60,78,120], PAPER2 [228,214,186]; scenes_a.js adds BG=CREAM, DUSK [212,205,192], MOON, hot()=[196,78,58].
Stage: W=1920, H=1080, GROUND=800. All coordinates in stage space. Times are absolute song seconds (t).
Line weights: ground 3, figure limbs 9 (small figs 4–7), props 4–12, thread 7, hairlines 2–3.5.
Easing set ONLY: sm, sm5, eo, eo4, ei, eio, eob(t,s), seg(t,a,b), pres(t,a,b,c,d), lerp, mix, cl.
Typography: R.text / R.rise with face 'cjk' (bold serif) or 'lat' (italic display). No other fonts.
Grain/vignette/motes/camera drift are global (engine/main) — scenes must NOT add their own.
Motion rules: everything is a pure function of t (seeking must work; no state, no Math.random — use rnd(seed,n)).
Use subtle motion (slow sin drift, small amplitudes). No hard cuts (engine handles transitions).
Fast-rap section (138–203.7s): pure imagery, no text effects in scenes.

## API (Python skia → JS)
Python tuples → JS arrays. `fig(R,x,gy,h,col,face,{lean,walk,A:[a,b],B:[a,b],crouch,lw,wb,headdx,tilt,seed,wamp})`
returns {head,hand:[h0,h1],sh,hip,foot,knee,elbow}. Pass NULL as R for geometry only.
`walker(null,t,t0,t1,xa,xb,ease)` → [x,phase,wamp].
`rain(R,t,col,n,area=[x0,y0,x1,y1],seed,{speed,ang,L,w,a})`.  `ground(R,y,col,x0,x1,f,w,a)`.
Painter R: rect(x,y,w,h,c,a), circ(x,y,r,c,a), ring(x,y,r,c,w,a), oval(x,y,rx,ry,c,a), ovalRing(x,y,rx,ry,c,w,a),
arc(cx,cy,r,startDeg,sweepDeg,c,w,a) (skia addArc on a square oval == this), line(pts,c,w,a,amp,seed,f0,f1),
poly(pts,c,a), polyStroke(pts,c,w,a), text(t,x,y,sz,c,face,anchor,a,sp), rise(t,x,y,sz,c,p,face,anchor,sp,circ,c2,stag),
clip_circle(x,y,r,inv), clipRect(x,y,w,h), thread(pts,f0,f1,...). R.cv is the CanvasRenderingContext2D:
cv.rotate takes RADIANS (skia degrees → multiply PI/180). skia drawOval(LTRB) → R.oval / R.ovalRing with center+radii.
skia clipRect(LTRB) → R.clipRect(x,y,w,h) inside cv.save()/cv.restore(). Python `a if cond else None` side effects: port literally;
dead code (`if False`) drop. Python % on negatives is non-negative: use ((a%b)+b)%b where sign matters.
Python int() truncates toward zero. bez/catmull/resample/trim/plen/dens available. Concatenate point lists with .concat(); `[1:]` → .slice(1).
Scene: `new Scene(name,bg,draw(R,t,c),bridge(t)->[circle,thread|null],pre)`; circle=[x,y,r,col,(sq),(alpha)], thread=[pts,f0,f1].
Optional `scene.bgf=t=>color`.
