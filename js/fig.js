/* fig.js — pass 6: the two characters as BACKLIT SILHOUETTES (no faces, no features).
   One flat shape per figure (near-black, tinted per scene) + a thin rim light ONLY on the edges that face the shot's light,
   a soft inner glow and a little bloom. Gesture carries the meaning: arm poses, lean, head tilt, gait; hair, coat hem and
   her coral scarf move in the wind; everything is a smooth function of t (no per-frame randomness → no flicker).
   Geometry is authored in "sample px" (her head = 76 px, his = 79 px, feet at y = 0) and mapped into the old head-unit frame
   (facing +x, head top y = 0, chin y = 1, head centre (.45,.5) at (o.x, o.y), s px per head unit), so every shot keeps its framing
   and f.pt([u,v]) still lands on the same part of the head. */
'use strict';
// ---------------- smooth closed/open paths with sharp corners ([x,y,1]) ----------------
function crTan(P, closed) { const n = P.length, T = []; for (let i = 0; i < n; i++) { if (P[i][2]) { T.push([0, 0]); continue; }
  const a = closed ? P[(i - 1 + n) % n] : P[max(0, i - 1)], b = closed ? P[(i + 1) % n] : P[min(n - 1, i + 1)]; T.push([(b[0] - a[0]) / 2, (b[1] - a[1]) / 2]); } return T; }
function crPath(c, P, closed = true) { const T = crTan(P, closed), n = P.length, m = closed ? n : n - 1; c.moveTo(P[0][0], P[0][1]);
  for (let i = 0; i < m; i++) { const a = P[i], b = P[(i + 1) % n], ta = T[i], tb = T[(i + 1) % n]; c.bezierCurveTo(a[0] + ta[0] / 3, a[1] + ta[1] / 3, b[0] - tb[0] / 3, b[1] - tb[1] / 3, b[0], b[1]); }
  if (closed) c.closePath(); }
function crSample(P, per = 8) { const T = crTan(P, false), n = P.length, out = [];
  for (let i = 0; i < n - 1; i++) { const a = P[i], b = P[i + 1], ta = T[i], tb = T[i + 1], c1 = [a[0] + ta[0] / 3, a[1] + ta[1] / 3], c2 = [b[0] - tb[0] / 3, b[1] - tb[1] / 3];
    for (let j = 0; j < per; j++) { const u = j / per, v = 1 - u; out.push([v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0], v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]]); } }
  out.push(P[n - 1]); return out; }
// limb: a smooth chain with a width profile ws = [[u, w], ...] → closed outline (rounded ends)
function limbPoly(chain, ws, per = 8) {
  const S = crSample(chain, per), n = S.length, acc = [0]; for (let i = 1; i < n; i++) acc.push(acc[i - 1] + hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  if (ws.L) { const WL = prof(ws.L), WR = prof(ws.R); return limbPoly2(S, acc, WL, WR); }
  const tot = acc[n - 1] || 1, W = u => { for (let i = 1; i < ws.length; i++) if (u <= ws[i][0]) { const [a, wa] = ws[i - 1], [b, wb] = ws[i], k = (u - a) / (b - a || 1), e = k * k * (3 - 2 * k); return wa + (wb - wa) * e; } return ws[ws.length - 1][1]; };
  const L = [], R = []; let tx0 = 0, ty0 = 0, tx1 = 0, ty1 = 0;
  for (let i = 0; i < n; i++) { const a = S[max(0, i - 1)], b = S[min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = hypot(dx, dy) || 1; dx /= d; dy /= d;
    if (i === 0) { tx0 = dx; ty0 = dy; } if (i === n - 1) { tx1 = dx; ty1 = dy; }
    const hw = W(acc[i] / tot) / 2; L.push([S[i][0] - dy * hw, S[i][1] + dx * hw]); R.push([S[i][0] + dy * hw, S[i][1] - dx * hw]); }
  const e = S[n - 1], b0 = S[0], hw1 = W(1) / 2, hw0 = W(0) / 2;
  // end cap from L[n-1] round to R[n-1]; start cap from R[0] round to L[0]
  const endCap = []; for (let k = 1; k < 6; k++) { const a = k / 6 * PI; endCap.push([e[0] - ty1 * hw1 * cos(a) + tx1 * hw1 * sin(a), e[1] + tx1 * hw1 * cos(a) + ty1 * hw1 * sin(a)]); }
  const stCap = []; for (let k = 1; k < 6; k++) { const a = k / 6 * PI; stCap.push([b0[0] + ty0 * hw0 * cos(a) - tx0 * hw0 * sin(a), b0[1] - tx0 * hw0 * cos(a) - ty0 * hw0 * sin(a)]); }
  return [...L, ...endCap, ...R.reverse(), ...stCap];
}
const prof = ws => u => { for (let i = 1; i < ws.length; i++) if (u <= ws[i][0]) { const [a, wa] = ws[i - 1], [b, wb] = ws[i], k = (u - a) / (b - a || 1), e = k * k * (3 - 2 * k); return wa + (wb - wa) * e; } return ws[ws.length - 1][1]; };
function limbPoly2(S, acc, WL, WR) { const n = S.length, tot = acc[n - 1] || 1, L = [], R = []; let tx0 = 0, ty0 = 0, tx1 = 0, ty1 = 0;
  for (let i = 0; i < n; i++) { const a = S[max(0, i - 1)], b = S[min(n - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const d = hypot(dx, dy) || 1; dx /= d; dy /= d; if (!i) { tx0 = dx; ty0 = dy; } if (i === n - 1) { tx1 = dx; ty1 = dy; }
    const u = acc[i] / tot; L.push([S[i][0] - dy * WL(u), S[i][1] + dx * WL(u)]); R.push([S[i][0] + dy * WR(u), S[i][1] - dx * WR(u)]); }
  const e = S[n - 1], b0 = S[0], hw1 = (WL(1) + WR(1)) / 2, hw0 = (WL(0) + WR(0)) / 2, cap = [], st = [];
  for (let k = 1; k < 6; k++) { const q = k / 6 * PI; cap.push([e[0] - ty1 * hw1 * cos(q) + tx1 * hw1 * sin(q), e[1] + tx1 * hw1 * cos(q) + ty1 * hw1 * sin(q)]); st.push([b0[0] + ty0 * hw0 * cos(q) - tx0 * hw0 * sin(q), b0[1] - tx0 * hw0 * cos(q) - ty0 * hw0 * sin(q)]); }
  return [...L, ...cap, ...R.reverse(), ...st]; }
function polyPath(c, P) { c.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) c.lineTo(P[i][0], P[i][1]); c.closePath(); }
const vadd = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const dirv = th => [sin(th), cos(th)];          // angle from straight down; + towards the facing side
// ---------------- character data (sample px; feet (0,0); facing +x) ----------------
const HEAD_F = [[-.30, .40], [-.27, .14], [-.08, -.01], [.18, .02], [.32, .15], [.37, .33], [.352, .42], [.395, .52], [.425, .565, 1], [.372, .603], [.382, .662], [.36, .70], [.371, .742], [.336, .80], [.345, .875], [.30, .955], [.21, .98], [.12, .95], [.11, 1.2], [-.14, 1.2], [-.2, .8]];
const HEAD_M = [[-.33, .42], [-.29, .14], [-.08, -.02], [.18, .02], [.33, .15], [.385, .33], [.35, .43], [.415, .53], [.455, .60, 1], [.375, .64], [.39, .70], [.368, .745], [.38, .785], [.345, .84], [.37, .93], [.33, 1.0, 1], [.18, 1.0], [.13, 1.02], [.13, 1.3], [-.25, 1.3], [-.27, .82]];
// her hair: side-swept fringe to the brow, full fall down the back, the ends part into soft locks (normalised head coords)
const HAIR_F = [[.25, .08], [.36, .22], [.37, .31, 1], [.30, .25], [.22, .23], [.13, .32], [.08, .5], [.05, .72], [.0, .95], [-.05, 1.2], [-.1, 1.5], [-.18, 1.85], [-.25, 2.18], [-.29, 2.40, 1], [-.35, 2.24], [-.42, 2.47, 1], [-.48, 2.22], [-.57, 2.42, 1], [-.61, 2.1], [-.63, 1.75], [-.6, 1.38], [-.54, 1.0], [-.48, .64], [-.44, .32], [-.34, .1], [-.15, -.06], [.07, -.07], [.19, -.02]];
// his hair: short, a soft forward fringe, three low tufts at the crown, tapered nape
const HAIR_M = [[.41, .27, 1], [.33, .2], [.22, .18], [.12, .22], [.04, .33], [-.03, .5], [-.09, .64], [-.2, .76], [-.27, .83, 1], [-.33, .68], [-.39, .48], [-.40, .28], [-.37, .12], [-.32, .02], [-.24, -.05], [-.13, -.095], [-.01, -.12], [.08, -.145], [.15, -.115], [.24, -.07], [.32, -.01], [.39, .06], [.44, .13, 1], [.415, .18]];
const SIL = {
  her: { hd: 76, top: -560, hx: 6, lean: .07, pivot: -340, sh: [[-4, -454], [3, -458]], Lu: 82, Lf: 72, Lh: 36,
    armW: [[0, 31], [.47, 22], [.53, 21], [.88, 17], [.9, 18], [.95, 16], [1, 13.5]], handW: 12.5,
    hip: [[11, -268], [-7, -268]], Lt: 128, Ls: 124, legW: { L: [[0, 14], [.45, 12], [.52, 11], [.66, 12], [.9, 7], [1, 6.5]], R: [[0, 16], [.45, 13], [.52, 12.5], [.68, 15.5], [.9, 7.5], [1, 6.5]] },
    foot: [[-7, -10], [6, -10], [8, 4], [18, 12], [29, 18], [33, 22, 1], [4, 22], [-4, 17], [-6, 23, 1], [-10, 23, 1], [-10, 8]] },
  him: { hd: 79, top: -616, hx: -6, lean: .03, pivot: -310, sh: [[44, -490], [-52, -490]], Lu: 88, Lf: 80, Lh: 40,
    armW: [[0, 31], [.47, 27], [.53, 26.5], [.9, 21], [.93, 22], [1, 19]], handW: 16.5,
    hip: [[14, -322], [-10, -322]], Lt: 154, Ls: 146, legW: { L: [[0, 25], [.3, 23], [.47, 20.5], [.55, 20], [.8, 17.5], [.9, 17], [.95, 18], [1, 15.5]], R: [[0, 31], [.3, 25], [.44, 21.5], [.5, 23], [.56, 21], [.8, 17], [.92, 16], [1, 14]] },
    foot: [[-14, -12], [13, -12], [16, 4], [34, 11], [46, 15], [50, 21], [47, 25, 1], [-16, 25, 1], [-19, 16], [-17, 4]] },
};
// ---------------- poses ----------------
// arm pose = [upper-arm angle, forearm angle, hand angle, finger curl, show hand]; angles from straight down, + towards the facing side.
// 'side' arms are mirrored for the arm on the -x side of his 3/4 body (pocket/down/etc.).
const ARM = {
  down:   [-.03, .22, .26, .45, 1], hang: [.02, .05, .04, .15, 1], back: [-.22, -.32, -.3, .3, 1],
  pocket: [.33, -.66, 0, 0, 0],    // hand hidden in a coat pocket, elbow out
  reach:  [.62, 1.36, 1.46, .2, 1], reachLow: [.42, .95, 1.05, .25, 1], reachHi: [1.9, 2.3, 2.35, .15, 1],
  up:     [2.55, 2.75, 2.8, .1, 1],    // arm lifted towards something above
  chest:  [.22, 2.75, 3.0, .55, 1],    // hand to her own chest
  mouth:  [.5, 3.35, 3.0, .6, 1, 1.35],    // fingers near the lips (hesitating words / smoke)
  ear:    [.05, 3.35, 3.0, .6, 1],     // phone to the ear
  hug:    [-.08, 1.9, 2.0, .6, 0, .5],    // forearm across the body (cold, holding herself)
  brow:   [.55, 2.6, 2.2, .55, 1],     // hand up to the forehead (headache / shame)
  out:    [1.35, 1.55, 1.6, .1, 1],    // arm straight out (puppet)
  slack:  [.0, .02, .02, .1, 1],
};
const show0 = p => p && p[4] && p[0] < .5;   // only hanging arms swing with the gait
const lerpArr = (a, b, k) => [0, 1, 2, 3, 4, 5].map(i => lerp(a[i] ?? (i === 5 ? 1 : 0), b[i] ?? (i === 5 ? 1 : 0), k));
// a pose spec may be a name, an array, or {from, to, k} for eased transitions
function armPose(p) { if (!p) return null; if (typeof p === 'string') return ARM[p]; if (Array.isArray(p)) return p; if (p.via) { const k = clamp(p.k); return k < .35 ? lerpArr(armPose(p.from), armPose(p.via), ease(k / .35)) : lerpArr(armPose(p.via), armPose(p.to), ease((k - .35) / .65)); }
  return lerpArr(armPose(p.from), armPose(p.to), ease(p.k)); }
// ---------------- palette per scene (from the last plate drawn) ----------------
const SILPAL = {
  night: { her: '#151526', him: '#0E1222', rim: '#FFDCA8', glow: '#E8A06A', a: 1 },
  sea: { her: '#121827', him: '#0D1220', rim: '#DDE6F2', glow: '#9EB0D8', a: .8 },
  dawn: { her: '#1A1A29', him: '#151826', rim: '#F6CFA2', glow: '#D89A7A', a: .85 },
  amber: { her: '#2A1817', him: '#221819', rim: '#FFE4B4', glow: '#F2A058', a: 1 },
  amberPlain: { her: '#2A1817', him: '#221819', rim: '#FFE4B4', glow: '#F2A058', a: 1 },
  paper: { her: '#2B2530', him: '#25222C', rim: '#FFF0D2', glow: '#E8B888', a: .7 },
  mud: { her: '#2A1E17', him: '#211812', rim: '#E9BE8C', glow: '#B07A4A', a: .6 },
  rain: { her: '#2E3036', him: '#282B31', rim: '#F1EEE6', glow: '#C9CDD0', a: .75 },
  rainDark: { her: '#26282E', him: '#202329', rim: '#E6E4DC', glow: '#B9BEC2', a: .8 },
};
const SCARF = '#7A2F28';      // her coral, deepened by the backlight (the one colour that belongs to her)
// ---------------- build one figure's shapes in logical (screen) coords ----------------
function silBuild(o) {
  const who = o.who, D = SIL[who], s = o.s, dir = o.dir ?? 1, hd = D.hd, t = X.t, ph = who === 'her' ? 0 : 1.7;
  const kpx = s / hd;                                             // logical px per sample px
  const breath = sin(t * 1.55 + ph) * 1.4, sway = sin(t * .55 + ph) * .006 * (o.still ? 0 : 1);
  const lean = (o.lean ?? D.lean) + (o.bodyTilt || 0) * 1.6 + sway, pv = D.pivot;
  const bend = ([x, y, c]) => { const k = clamp((pv - y) / 170), a = lean * k * k * (3 - 2 * k), dy = y - pv; let X0 = x * cos(a) - dy * sin(a), Y0 = pv + x * sin(a) + dy * cos(a);
    if (y < pv) Y0 -= breath * clamp((pv - y) / 140); return [X0, Y0, c]; };
  // sample px → head units → screen
  const toS = ([x, y, c]) => { const U = (x - D.hx) / hd + .38, V = (y - D.top) / hd; return [o.x + (U - .45) * s * dir, o.y + (V - .5) * s, c]; };
  const B = P => P.map(p => toS(bend(p)));
  // head: rotate about the neck pivot (units .40, 1.15) by tilt + lean, then ride on the bent neck
  const neck0 = [D.hx + (.40 - .38) * hd, D.top + 1.15 * hd], neck1 = bend(neck0), tilt = (o.tilt || 0) + lean * .6;
  const Hn = ([nx, ny, c]) => { const ux = nx + .38, dx = ux - .40, dy = ny - 1.15, ct = cos(tilt), st = sin(tilt);
    const rx = .40 + dx * ct - dy * st, ry = 1.15 + dx * st + dy * ct;           // units, rotated
    const px = D.hx + (rx - .38) * hd + (neck1[0] - neck0[0]), py = D.top + ry * hd + (neck1[1] - neck0[1]); return toS([px, py, c]); };
  const H = P => P.map(Hn), unitPt = ([u, v]) => Hn([u - .38, v]);
  const wind = (o.wind ?? 1) * (o.still ? .3 : 1), gust = .55 + .45 * sin(t * .83 + ph) * sin(t * .31 + 1.1);
  const parts = [], extra = [];
  const poly = P => parts.push({ P, poly: true }), smooth = P => parts.push({ P });
  // --- hair (moves): points lower down the back stream backwards (-x) in the wind and sway
  const hairWave = ([x, y, c], i) => { const k = clamp((y - .45) / 2.0); return [x - wind * gust * k * k * .16 + sin(t * 1.7 + y * 1.6 + ph) * .022 * k * wind, y - wind * gust * k * k * .05, c]; };
  // --- legs (full figures)
  const legs = [], feetY = 0;
  if (o.full) {
    const walk = o.walk, stance = o.legs || (who === 'her' ? 'step' : 'rest');
    D.hip.forEach((hp, i) => { let th, sh, fa = 0;
      if (false) {}
      else if (stance === 'stand') { th = i ? -.05 : .03; sh = i ? -.06 : .02; }
      else if (stance === 'rest') { th = i ? -.02 : .13; sh = i ? -.03 : .0; fa = i ? 0 : -.06; }          // weight on the back leg, front knee eased forward
      else if (stance === 'away') { th = i ? -.16 : .1; sh = i ? -.42 : .04; fa = i ? -.55 : 0; }
      else { th = i ? -.09 : .02; sh = i ? -.24 : .01; fa = i ? -.42 : 0; }       // step: weight on the front foot, back heel up
      if (walk != null) { const p = walk + i * PI, wa = o.walkA ?? 1, wt = .34 * sin(p), ws = wt - .75 * max(0, sin(p - .35)) ** 1.5, wf = -.5 * max(0, -sin(p + .6));
        th = lerp(th, wt, wa); sh = lerp(sh, ws, wa); fa = lerp(fa, wf, wa); }
      const knee = vadd(hp, dirv(th), D.Lt), ank = vadd(knee, dirv(sh), D.Ls), lift = ank[1] - (-22 * (who === 'her' ? 1 : 1.1));
      legs.push({ hp, knee, ank, fa, i }); });
    // keep the lowest ankle on the ground: shift legs (and only legs) so the planted foot touches y = -22
    const low = max(...legs.map(l => l.ank[1])), dyL = (who === 'her' ? -22 : -24) - low;
    for (const l of legs.sort((a, b) => b.i - a.i)) {
      const kn = [l.knee[0], l.knee[1] + dyL * .5], an = [l.ank[0], l.ank[1] + dyL];
      poly(B(limbPoly([l.hp, [lerp(l.hp[0], kn[0], .5), lerp(l.hp[1], kn[1], .5)], kn, [lerp(kn[0], an[0], .45), lerp(kn[1], an[1], .45)], an], D.legW)));
      const ca = cos(l.fa), sa = sin(l.fa); smooth(B(D.foot.map(([x, y, c]) => [an[0] + x * ca - y * sa, an[1] + x * sa + y * ca, c])));
    }
  }
  // --- body
  if (!o.noBody) {
    if (who === 'her') {
      const fl = (y, amp) => wind * gust * amp * clamp((y + 300) / 200) ** 2;
      const hemF = sin(t * 2.1 + ph) * 3 * wind, hemB = sin(t * 1.9 + 1 + ph) * 5 * wind;
      smooth(B([[19, -480, 1], [13, -474], [22, -458], [36, -426], [28, -401], [20, -368], [22, -356], [25, -330], [29, -280], [34 + fl(-200, -4), -200], [38 + fl(-140, -6), -140], [42 + fl(-114, -8) + hemF, -114, 1], [20, -108 + hemF * .3], [-2, -106], [-26, -110],
        [-46 - fl(-116, 10), -116 + hemB * .4], [-60 - fl(-124, 18) + hemB, -124 - hemB * .6], [-72 - fl(-126, 26) + hemB * 1.3, -126 - hemB, 1], [-60 - fl(-146, 14), -146], [-50 - fl(-190, 6), -190], [-40, -250], [-33, -300], [-25, -338], [-20, -366], [-26, -398], [-30, -428], [-26, -454], [-16, -470], [-19, -490, 1], [-6, -478]]));
      // coral scarf: a soft wrap at the neck and one tail lifting behind her in the wind
      const sw = sin(t * 1.9 + .4) * 6 * wind, gw = gust * wind;
      const wrap = B([[-17, -481], [6, -480], [19, -474], [18, -463], [-2, -462], [-20, -466]]);
      const tail = B(limbPoly([[-15, -471], [-24 - 4 * gw, -452 + sw * .2], [-30 - 12 * gw, -430 + sw * .5 - 4 * gw], [-36 - 22 * gw, -408 + sw - 10 * gw]], [[0, 12], [.5, 10], [1, 6]], 6));
      extra.push({ P: wrap, col: SCARF }); smooth(wrap);   // (the tail read as a stray stick in silhouette, so it stays tucked: not drawn)
    } else {
      const fl = sin(t * 1.4 + ph) * 1.5 * wind;
      // 3/4 jacket: chest forward (+x), shoulder-blade curve behind, slight waist, hem with a small back vent
      smooth(B([[16, -533], [26, -526], [44, -512], [58, -494], [62, -470], [60, -440], [54, -404], [50, -376], [52, -340], [55 + fl, -318], [53 + fl, -305, 1], [-4, -306], [-36 + fl, -308], [-44 + fl, -300, 1], [-50 + fl, -318], [-50, -350], [-48, -382], [-52, -420], [-60, -456], [-66, -486], [-58, -506], [-38, -523], [-18, -535]]));
      smooth(B([[-22, -524], [-19, -548], [15, -550], [20, -524]]));           // stand collar
    }
  } else smooth(B(who === 'her' ? [[-16, -490], [16, -490], [22, -462], [-22, -462]] : [[-22, -540], [18, -540], [24, -506], [-26, -506]]));   // neck stub
  // --- arms (F = facing side, B = far side)
  const hands = {};
  if (!o.noBody) for (const [k, side] of [['B', 1], ['F', 0]]) {
    let p = armPose(k === 'F' ? (o.arm ?? o.armF ?? (who === 'her' ? 'down' : 'pocket')) : (o.armB ?? (who === 'her' ? 'hang' : 'pocket')));
    if (!p) continue;
    const sgn = who === 'him' && side ? -1 : 1;                   // his far (-x) arm mirrors side-poses outward
    const spec = k === 'F' ? (o.arm ?? o.armF) : o.armB, SIDE = n => n == null || ['pocket', 'down', 'hang', 'back', 'slack'].includes(n);
    const mir = who === 'him' && side && (typeof spec === 'object' && spec && !Array.isArray(spec) ? SIDE(spec.from) && SIDE(spec.to) : SIDE(spec));
    const [au, af, ah, curl, show] = mir ? [p[0] * sgn, p[1] * sgn, p[2] * sgn, p[3], p[4]] : p;
    const sh = D.sh[side], sw2 = sin(t * 1.3 + ph + side) * .03 * (o.still ? 0 : 1) + (o.walk != null && show0(p) ? .32 * sin(o.walk + side * PI + PI) * (mir ? sgn : 1) : 0), el = vadd(sh, dirv(au + sw2), D.Lu), fl = p[5] ?? 1, wr = vadd(el, dirv(af + sw2 * 1.4), D.Lf * fl);
    const chain = [sh, vadd(sh, dirv(au + sw2), D.Lu * .5), el, vadd(el, dirv(af + sw2 * 1.4), D.Lf * fl * .5), wr];
    poly(B(limbPoly(chain, D.armW)));
    if (show) { const hl = D.Lh, kn = vadd(wr, dirv(ah), hl * .42), cu = curl * (mir ? -sgn : 1), f1 = vadd(kn, dirv(ah - cu * .6), hl * .32), f2 = vadd(f1, dirv(ah - cu * 1.3), hl * .26);
      poly(B(limbPoly([wr, kn, f1, f2], [[0, D.handW * .92], [.4, D.handW], [.75, D.handW * .78], [1, D.handW * .32]], 6)));
      const th0 = vadd(wr, dirv(ah), hl * .18), th1 = vadd(th0, dirv(ah + (mir ? sgn : 1) * .75), hl * .3);
      poly(B(limbPoly([th0, th1], [[0, D.handW * .5], [1, D.handW * .26]], 4)));
      hands[k] = toS(bend(f2)); }
    else hands[k] = toS(bend(wr));
  }
  // --- head + hair (+ wind strands)
  const head = H(who === 'her' ? HEAD_F : HEAD_M), hairP = H((who === 'her' ? HAIR_F : HAIR_M).map(hairWave));
  smooth(head); smooth(hairP); parts[parts.length - 1].over = true;
  if (who === 'her') { const st = [[-.5, 1.0], [-.68, 1.16], [-.86, 1.24], [-1.02, 1.22]].map((p, i) => hairWave([p[0] - i * .03 * wind * gust, p[1] + sin(t * 2.3 + i) * .02 * i, 0], i));
    parts.push({ P: limbPoly(H(st), [[0, 2.8 * kpx], [.7, 1.6 * kpx], [1, .5 * kpx]], 6), poly: true, thin: true }); }
  // bbox
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const q of parts) for (const [x, y] of q.P) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  const fade = o.full || o.noBody ? null : [toS(bend([0, D.top + 2.8 * D.hd])), toS(bend([0, D.top + 4.0 * D.hd]))];      // bust shots dissolve below the hips
  const neckFade = o.noBody ? [unitPt([.4, 1.05]), unitPt([.4, 1.35])] : null;
  return { parts, extra, hands, box: [x0, y0, x1, y1], fade: fade || neckFade, head: unitPt([.45, .5]), pt: unitPt, dir, s };
}
// ---------------- offscreen buffers (grow-only, reused every frame) ----------------
const SILC = {};
// buffers that get composited onto the (GPU) scene are pooled by size bucket: drawing a CPU canvas uploads the whole bitmap,
// so a tiny figure must not use a buffer grown by the last close-up
const SILP = new Map();
function silCvB(name, w, h) { const bw = Math.ceil(w / 96) * 96, bh = Math.ceil(h / 96) * 96, k = name + bw + 'x' + bh; let c = SILP.get(k);
  if (!c) { c = document.createElement('canvas'); c.width = bw; c.height = bh; c._x = c.getContext('2d', { willReadFrequently: true }); if (SILP.size > 24) SILP.delete(SILP.keys().next().value); }
  else SILP.delete(k);
  SILP.set(k, c); const q = c._x; q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none'; q.clearRect(0, 0, w + 2, h + 2); return c; }
function silCv(name, w, h) { let c = SILC[name]; if (!c) { c = SILC[name] = document.createElement('canvas'); c.width = c.height = 16; c._x = c.getContext('2d', { willReadFrequently: X.silCPU ?? true }); }
  if (c.width < w || c.height < h) { c.width = max(c.width, Math.ceil(w / 64) * 64); c.height = max(c.height, Math.ceil(h / 64) * 64); }
  const q = c._x; q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.filter = 'none'; q.clearRect(0, 0, w + 2, h + 2); return c; }
function silFillParts(q, parts, col = '#fff') { q.fillStyle = col; for (const p of parts) { q.beginPath(); if (p.poly) polyPath(q, p.P); else crPath(q, p.P, true); q.fill(); } }
// render the union mask of a built figure into the device-space rect of ctx c; returns the rect, or null if off-screen
function silMask(c, F, pad, rs = 1) {
  const T = c.getTransform(), cw = c.canvas.width, ch = c.canvas.height, [x0, y0, x1, y1] = F.box, xs = [], ys = [];
  for (const [x, y] of [[x0 - pad, y0 - pad], [x1 + pad, y0 - pad], [x0 - pad, y1 + pad], [x1 + pad, y1 + pad]]) { xs.push(T.a * x + T.c * y + T.e); ys.push(T.b * x + T.d * y + T.f); }
  // rs < 1: work at reduced resolution (big close-ups) and scale up on composite. The buffer grid is anchored to absolute device
  // coordinates (origin snapped to whole buffer pixels), so a moving figure never re-samples at a new phase (no edge shimmer).
  const bxs = max(0, floor(min(...xs) * rs)), bys = max(0, floor(min(...ys) * rs)), bx1 = min(cw * rs, Math.ceil(max(...xs) * rs)), by1 = min(ch * rs, Math.ceil(max(...ys) * rs));
  const w = bx1 - bxs, h = by1 - bys; if (w < 2 || h < 2) return null;
  const Ts = { a: T.a * rs, b: T.b * rs, c: T.c * rs, d: T.d * rs, e: T.e * rs, f: T.f * rs };
  const M = silCvB('M', w, h), q = M._x; q.setTransform(Ts.a, Ts.b, Ts.c, Ts.d, Ts.e - bxs, Ts.f - bys); silFillParts(q, F.parts);
  return { M, bx: bxs, by: bys, w, h, T: Ts, scale: hypot(T.a, T.b) * rs, DX: bxs / rs, DY: bys / rs, W: w / rs, H: h / rs };
}
// bust shots: dissolve a finished layer below the hips (applied after the rim is found, so the fade edge is never lit)
function silFade(q, F, R, pad) { if (!F.fade) return; const { T, bx, by } = R, [a, b] = F.fade, [x0, y0, x1, y1] = F.box, g = q.createLinearGradient(a[0], a[1], b[0], b[1]);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  q.save(); q.globalCompositeOperation = 'destination-in'; q.globalAlpha = 1; q.fillStyle = g; q.setTransform(T.a, T.b, T.c, T.d, T.e - bx, T.f - by); q.fillRect(x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad); q.restore(); }
// cheap separable-free blur: down-sample with high-quality smoothing, then scale back up
function silBlur(src, w, h, k, name) { const sw = max(2, Math.round(w / k)), shh = max(2, Math.round(h / k)), S = silCv(name + 's', sw, shh), q = S._x; q.imageSmoothingEnabled = true; q.imageSmoothingQuality = 'high';
  q.drawImage(src, 0, 0, w, h, 0, 0, sw, shh); const D = silCv(name, w, h), r = D._x; r.imageSmoothingEnabled = true; r.imageSmoothingQuality = 'high'; r.drawImage(S, 0, 0, sw, shh, 0, 0, w, h); return D; }
// light direction (logical) for a figure: o.light = [x,y] point or {dir:[dx,dy]}; default: from in front of the face and above
function silLightDir(o, F) {
  const L = o.light ?? X.light; let d;
  if (L && L.dir) d = L.dir; else if (Array.isArray(L)) d = [L[0] - F.head[0], L[1] - F.head[1]]; else d = [F.dir * .8, -.6];
  const n = hypot(d[0], d[1]) || 1; return [d[0] / n, d[1] / n];
}
// ---------------- public API ----------------
// o: { who, x, y, s, dir, tilt, bodyTilt, lean, arm|armF, armB, full, legs, walk, noBody, alpha, light, rimA, wind, still, fill, rimCol }
function figure(o) {
  const c = X.ctx, F = silBuild(o), pal = SILPAL[X.plateName] || SILPAL.night, A = (o.alpha ?? 1);
  const ret = { pt: F.pt, hands: F.hands, head: F.head, mh: null };
  if (A <= .003) return ret;
  const s = o.s, rimW = clamp(s * .015, 1.1, 6), pad = s * .14 + 10, T0 = c.getTransform(), ds = s * hypot(T0.a, T0.b), R0 = silMask(c, F, pad, clamp(135 / ds, .5, 1)); if (!R0) return ret;
  const { M, bx, by, w, h, T, scale, DX, DY, W, H } = R0, ld = silLightDir(o, F);
  const dl = [(T.a * ld[0] + T.c * ld[1]), (T.b * ld[0] + T.d * ld[1])], dn = hypot(dl[0], dl[1]) || 1, ux = dl[0] / dn, uy = dl[1] / dn;
  const fillCol = o.fill || pal[o.who], rimCol = o.rimCol || X.rimCol || pal.rim, glowCol = X.glowCol || pal.glow, ra = (o.rimA ?? X.rimA ?? pal.a);
  // 1) rim first, from the clean mask: mask minus itself shifted away from the light = the light-facing edge only
  const d1 = rimW * scale, Rc = silCv('R', w, h), r = Rc._x; r.drawImage(M, 0, 0, w, h, 0, 0, w, h); r.globalCompositeOperation = 'destination-out'; r.drawImage(M, 0, 0, w, h, -ux * d1, -uy * d1, w, h);
  // 2) the mask itself becomes the flat fill (M was filled white; recolour in place), then her scarf, then the bust fade
  const Fc = M, f = M._x; f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'source-in'; f.fillStyle = fillCol; f.fillRect(0, 0, w, h);
  if (F.extra.length) { f.globalCompositeOperation = 'source-atop'; f.setTransform(T.a, T.b, T.c, T.d, T.e - bx, T.f - by); f.fillStyle = SCARF;
    for (const e of F.extra) { f.beginPath(); if (e.poly) polyPath(f, e.P); else crPath(f, e.P, true); f.fill(); }
    f.fillStyle = fillCol; for (const p of F.parts) if (p.over) { f.beginPath(); crPath(f, p.P, true); f.fill(); }      // hair falls over the scarf
    f.setTransform(1, 0, 0, 1, 0, 0); }
  // 3) inner glow, at low resolution (the upscale is the blur): a wide light-facing band, laid onto the fill with source-atop so it stays inside
  const LP = o.light ?? X.light, rr = o.lightR ?? s * 5.5;
  const falloff = (q, k, ox = 0, oy = 0) => { if (!Array.isArray(LP)) return; q.save(); q.globalCompositeOperation = 'destination-in'; q.setTransform(T.a / k, T.b / k, T.c / k, T.d / k, (T.e - bx + ox) / k, (T.f - by + oy) / k);
    const gr = q.createRadialGradient(LP[0], LP[1], 0, LP[0], LP[1], rr); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,.18)');
    q.fillStyle = gr; q.fillRect(F.box[0] - pad, F.box[1] - pad, F.box[2] - F.box[0] + 2 * pad, F.box[3] - F.box[1] + 2 * pad); q.restore(); };
  r.globalCompositeOperation = 'source-in'; r.fillStyle = rimCol; r.fillRect(0, 0, w, h); falloff(r, 1); silFade(r, F, R0, pad);
  // low-res grids are anchored to absolute buffer coordinates (offset fx, fy) so the glow does not shimmer as the figure moves
  const kb = max(3, s * .045 * scale), fx = ((bx % kb) + kb) % kb, fy = ((by % kb) + kb) % kb, sw = Math.ceil((w + fx) / kb) + 1, sh2 = Math.ceil((h + fy) / kb) + 1, d2 = s * .07 * scale / kb;
  const Ms = silCv('Ms', sw, sh2), ms = Ms._x; ms.imageSmoothingEnabled = true; ms.imageSmoothingQuality = 'medium'; ms.drawImage(M, 0, 0, w, h, fx / kb, fy / kb, w / kb, h / kb);
  silFade(f, F, R0, pad);
  const Gs = silCv('Gs', sw, sh2), gs = Gs._x; gs.drawImage(Ms, 0, 0, sw, sh2, 0, 0, sw, sh2); gs.globalCompositeOperation = 'destination-out'; gs.drawImage(Ms, 0, 0, sw, sh2, -ux * d2, -uy * d2, sw, sh2);
  gs.globalCompositeOperation = 'source-in'; gs.fillStyle = glowCol; gs.fillRect(0, 0, sw, sh2); falloff(gs, kb, fx, fy);
  const lite = ds < 34 || o.lite;   // small figures: the glow and bloom are sub-pixel, skip them
  if (ra > 0 && !lite) { f.save(); f.globalCompositeOperation = 'source-atop'; f.globalAlpha = min(1, ra * .55); f.imageSmoothingEnabled = true; f.imageSmoothingQuality = 'medium'; f.drawImage(Gs, 0, 0, sw, sh2, -fx, -fy, sw * kb, sh2 * kb); f.restore(); }
  // bloom: the rim, down-sampled and spread back up
  const kl = max(3, s * .03 * scale), lx = ((bx % kl) + kl) % kl, ly = ((by % kl) + kl) % kl, bw = Math.ceil((w + lx) / kl) + 1, bh = Math.ceil((h + ly) / kl) + 1, Bs = silCvB('Bs', bw, bh), bs = Bs._x; bs.imageSmoothingEnabled = true; bs.imageSmoothingQuality = 'medium';
  if (ra > 0 && !lite) bs.drawImage(Rc, 0, 0, w, h, lx / kl, ly / kl, w / kl, h / kl);
  // the rim lies inside the silhouette, so lay it onto the fill buffer (one upload instead of two)
  if (ra > 0) { f.save(); f.globalCompositeOperation = 'source-atop'; f.globalAlpha = min(1, ra); f.drawImage(Rc, 0, 0, w, h, 0, 0, w, h); f.restore(); }
  // 4) composite onto the scene (device space; the caller's clip and alpha still apply)
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const ga = c.globalAlpha * A;
  c.globalAlpha = ga; c.imageSmoothingEnabled = true; c.drawImage(Fc, 0, 0, w, h, DX, DY, W, H);
  if (ra > 0) {
    if (!lite) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = ga * ra * .5; c.imageSmoothingEnabled = true; c.drawImage(Bs, 0, 0, bw, bh, DX - lx * W / w, DY - ly * H / h, bw * kl * W / w, bh * kl * H / h); } }
  c.restore();
  return ret;
}
// render a figure once into a full-frame offscreen layer under an extra logical transform (e.g. a mirror), for cheap repeated use (reflections)
function figLayer(o, pre) { const c = X.ctx, cv = c.canvas, L = silCv('LAY', cv.width, cv.height), q = L._x; q.setTransform(c.getTransform()); if (pre) pre(q);
  const keep = X.ctx; X.ctx = q; try { figure(o); } finally { X.ctx = keep; } return L; }
// flat print silhouette into any context (Riso density layers: white = ink; or a shadow on a wall)
function figFlat(c, o) {
  const F = silBuild({ ...o, still: o.still ?? false });
  if (!F.fade && c.globalAlpha >= .999) { c.save(); silFillParts(c, F.parts, o.fill || '#fff'); c.restore(); return { pt: F.pt, hands: F.hands }; }   // opaque: overlaps of one flat colour are invisible, so fill directly
  const R0 = silMask(c, F, 6); if (!R0) return { pt: F.pt, hands: F.hands };
  const { M, bx, by, w, h, T, DX, DY } = R0, Fc = silCv('F', w, h), f = Fc._x; f.drawImage(M, 0, 0, w, h, 0, 0, w, h);
  f.globalCompositeOperation = 'source-in'; f.setTransform(T.a, T.b, T.c, T.d, T.e - bx, T.f - by); f.fillStyle = o.fill || '#fff'; f.fillRect(F.box[0] - 10, F.box[1] - 10, F.box[2] - F.box[0] + 20, F.box[3] - F.box[1] + 20); f.setTransform(1, 0, 0, 1, 0, 0); silFade(f, F, R0, 6);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(Fc, 0, 0, w, h, DX, DY, w, h); c.restore();
  return { pt: F.pt, hands: F.hands };
}
// feet → anchor: y of the head-centre anchor for a full figure standing on groundY
const footOff = who => -SIL[who].top / SIL[who].hd - .5;
const anchorOn = (who, groundY, s) => groundY - footOff(who) * s;
