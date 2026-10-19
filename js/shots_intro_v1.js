/* shots_intro_v1.js — 0:00–0:56  intro title → film strip (verse 1 lines are film frames) → page (ledger / chives / answer) → mud → chessboard.
   Bridges: film strip (intro→F1→F2→F3→ledger), the page (ledger→chives→answer), ink blot→mud, mud→dark squares, exit light→lamp bulb. */
'use strict';
// ---------- camera ----------
function withCam(cx, cy, z, fn, rot = 0) {
  const c = X.ctx, V0 = X.VIS; c.save(); c.translate(X.LW / 2, X.LH / 2); c.rotate(rot); c.scale(z, z); c.translate(-cx, -cy);
  X.VIS = { x0: cx + (V0.x0 - X.LW / 2) / z, x1: cx + (V0.x1 - X.LW / 2) / z, y0: cy + (V0.y0 - X.LH / 2) / z, y1: cy + (V0.y1 - X.LH / 2) / z };
  if (rot) { const r = max(X.VIS.x1 - X.VIS.x0, X.VIS.y1 - X.VIS.y0); X.VIS = { x0: cx - r, x1: cx + r, y0: cy - r, y1: cy + r }; }
  try { fn(); } finally { c.restore(); X.VIS = V0; }
}
// camera that puts scene point (CX,CY) at screen point (sx,sy) with zoom z
function camAt(sx, sy, z, fn) { withCam(CX() - (sx - CX()) / z, CY() - (sy - CY()) / z, z, fn); }
// plate drawn into an arbitrary rect (film frames)
function plateRect(name, x, y, w, h, orient) {
  const v = floor(X.t * 5) % 2, o = orient || (w >= h ? 'L' : 'P'), im = IMG[`plate_${name}_${o}_${v}`] || IMG[`plate_${name}_${o}_0`]; if (!im) return;
  const s = max(w / im.width, h / im.height); X.ctx.drawImage(im, x + (w - im.width * s) / 2, y + (h - im.height * s) / 2, im.width * s, im.height * s);
}
// ---------- film geometry (separate L / P compositions) ----------
const FILM = () => X.L ? { cx: 960, cy: 528, fw: 1320, fh: 704, pitch: 1440, vertical: false } : { cx: 540, cy: 900, fw: 860, fh: 1160, pitch: 1290, vertical: true };
const T_F = [21.87, 25.89, 29.67, 33.63];
// ---------- frame contents (local coords 0..w, 0..h) ----------
function cLeader(w, h) { plateRect('amberPlain', 0, 0, w, h); const c = X.ctx; c.fillStyle = rgba(ZX.ink, .55); c.font = `${min(w, h) * .3}px ${ZX.fD}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('', w / 2, h / 2); c.textAlign = 'left';
  ink(ellP(w / 2, h / 2, min(w, h) * .28, min(w, h) * .28, 40), 3, { closed: true, key: 'ldr' + w, col: rgba(ZX.ink, .6) }); ink([[w / 2, h * .2], [w / 2, h * .5], [w / 2, h * .8]], 3, { key: 'ldv' }); ink([[w * .2, h / 2], [w * .5, h / 2], [w * .8, h / 2]], 3, { key: 'ldh' }); }
function facesPos(w, h) { return X.L ? { her: [w * .326, h * .39, h * .41], him: [w * .70, h * .347, h * .433] } : { her: [w * .29, h * .40, w * .34], him: [w * .74, h * .355, w * .355] }; }
function cFaces(w, h, t) {
  plateRect('amber', 0, 0, w, h);
  const P = facesPos(w, h), lt = t - T_F[0], br = sin(t * 1.3) * .006;
  const look = kf(t, [[22.5, 0], [24.0, .6], [25.4, 0]]);
  figure({ who: 'her', x: P.her[0], y: P.her[1], s: P.her[2], dir: 1, tilt: .12 + br, blink: blinkAt(t, [23.4]), look });
  figure({ who: 'him', x: P.him[0], y: P.him[1] + sin(t * 1.1) * 2, s: P.him[2], dir: -1, tilt: .02 - br, blink: blinkAt(t, [24.6]) });
}
function blinkAt(t, ts) { let b = 0; for (const x of ts) { const d = abs(t - x); if (d < .14) b = max(b, 1 - d / .14); } return b; }
function cFever(w, h, t) {
  plateRect('amberPlain', 0, 0, w, h);
  const lt = t - T_F[1], L = X.L, s = L ? h * .47 : w * .5, hx = L ? w * .36 : w * .46, hy = L ? h * .42 : h * .36;
  const f = figure({ who: 'him', x: hx, y: hy, s, dir: 1, tilt: -.06 + .02 * sin(t * 2), brow: .6, blink: blinkAt(t, [27.1]) });
  const heat = kf(lt, [[0, .25], [1.6, .95], [2.6, .95], [3.6, .45]]);
  const ch = f.pt([.62, .66]); glow(ch[0], ch[1], s * .22, '#FF6A4A', .18 + heat * .25);
  thermometer(L ? w * .78 : w * .84, L ? h * .84 : h * .9, L ? h * .64 : h * .5, heat, L ? 1.25 : 1.1);
  // heat shimmer above the head
  for (let i = 0; i < 3; i++) { const x0 = hx - s * .2 + i * s * .25, y0 = hy - s * .62, P = []; for (let k = 0; k < 7; k++) P.push([x0 + sin(k * 1.4 + t * 6 + i) * 10, y0 - k * s * .05]); ink(P, 2.4, { col: ZX.coral, key: 'hs' + i, alpha: heat * .9 }); }
}
function cTag(w, h, t) {
  plateRect('amberPlain', 0, 0, w, h); const c = X.ctx; c.fillStyle = rgba('#7A4A20', .18); c.fillRect(0, 0, w, h);
  const lt = t - T_F[2], L = X.L, s = L ? h * .46 : w * .5, hx = L ? w * .42 : w * .45, hy = L ? h * .45 : h * .38, bow = kf(lt, [[0, .05], [1.5, .32]]);
  const f = figure({ who: 'him', x: hx, y: hy, s, dir: 1, tilt: bow, bodyTilt: bow * .15, blink: .55, brow: -.3 });
  const anc = mApply(f.mb, [.42, 1.30]), sw = sin(t * 2.4) * .25 * exp(-lt * .35), len = s * .62, tx = anc[0] + sin(sw) * len, ty = anc[1] + cos(sw) * len;
  ink([anc, [lerp(anc[0], tx, .5) + 6, lerp(anc[1], ty, .5)], [tx, ty]], 1.6, { key: 'tagstr' });
  priceTag(tx + 10, ty - 6, sw + PI / 2 - .3, '¥0.00', L ? 1.15 : 1.25);
}
// ---------- the page: ledger → chives → answer sheet → ink blot ----------
const T_PG = { ledger: 33.63, chive: 37.50, snip: 39.36, turn: 41.0, answer: 41.43, blot: 44.45, mud: 45.27 };
function cPage(w0, h, t) {
  const c = X.ctx, L = X.L, ox = L ? 0 : w0 * .19, w = L ? w0 : w0 * .62;   // portrait: page content lives in the visible middle
  plateRect('paper', 0, 0, w0, h); c.save(); c.translate(ox, 0);
  const ruled = (alpha) => { for (let i = 1; i < 14; i++) { const y = h * (.1 + i * .062); ink([[w * .06, y], [w * .5, y + 1], [w * .94, y]], 1.4, { col: ZX.mist, key: 'rl' + i, alpha: alpha * .75 }); } ink([[w * .16, h * .04], [w * .16, h * .5], [w * .16, h * .97]], 1.8, { col: ZX.coral, key: 'mg', alpha }); };
  const turnK = ease(seg(t, T_PG.turn, T_PG.answer + .2));
  if (turnK < 1) {
    c.save(); if (turnK > 0) { c.beginPath(); c.rect(0, 0, w * (1 - turnK), h); c.clip(); }
    ruled(1);
    // ledger entries (handwritten-ish)
    c.fillStyle = rgba(ZX.ink, .78); c.font = `${L ? h * .032 : w * .052}px ${ZX.fCN}`; c.textBaseline = 'alphabetic';
    const rows = ['03·12   电影票 ×2', '04·02   发烧 · 药', '05·20   ……', '06·01   生日 · 你迟到', '07·07   一句对不起'], amt = ['¥ 98', '¥ 36', '¥ 520', '—', '欠'];
    rows.forEach((r, i) => { const y = h * (.1 + (i + 1) * .062) - 8, a = seg(t, T_PG.ledger + .15 * i, T_PG.ledger + .15 * i + .4); c.globalAlpha = a * .85; c.fillText(r, w * .19, y); spaced(c, amt[i], w * .9, y, 2, 'right'); });
    c.globalAlpha = 1;
    // the decisive stroke 一笔
    const k = easeIO(seg(t, T_PG.ledger + 2.0, T_PG.ledger + 2.9)), y = h * (.1 + 7 * .062) - 14;
    if (k > 0) inkPart([[w * .22, y + 8], [w * .45, y - 6], [w * .7, y], [w * .86, y - 10]], k, h * .045, { col: ZX.coral, key: 'yibi', taper: [.08, .5] });
    // chives grow from the ruled lines
    const g = ease(seg(t, T_PG.chive, T_PG.chive + 1.4)), snip = seg(t, T_PG.snip, T_PG.snip + .15), regrow = ease(seg(t, T_PG.snip + .9, T_PG.snip + 1.8));
    if (g > 0) for (let r = 0; r < 3; r++) for (let i = 0; i < 18; i++) {
      const by = h * (.1 + (9 + r * 2) * .062), x = w * (.2 + i * .042 + r * .012), hh = h * .16 * g * (.8 + .4 * hash(i + r * 9));
      const cut = snip > 0 && regrow < 1 ? hh * (1 - .7 * snip) : hh, top = by - (snip > 0 ? lerp(cut, hh, regrow) : hh), sway = sin(t * 2 + i * .7) * 6;
      ink([[x, by], [x + sway * .4, (by + top) / 2], [x + sway, top]], 3.4, { col: mixCol(ZX.mist, ZX.ink, .25), key: 'cv' + r + i, taper: [0, .6] });
      if (snip > 0 && regrow < .3) { const fy = top - 10 + seg(t, T_PG.snip, T_PG.snip + 1.2) * h * .3, fx = x + hash(i * 3) * 30; ink([[fx, fy], [fx + 10, fy - 26]], 3, { col: ZX.mist, key: 'cf' + r + i, alpha: 1 - seg(t, T_PG.snip + .6, T_PG.snip + 1.2) }); }
    }
    // scissors (her colour) close on the snip
    const sa = seg(t, T_PG.snip - .8, T_PG.snip - .2) * (1 - seg(t, T_PG.snip + .9, T_PG.snip + 1.4));
    if (sa > 0) { const op = .45 - .45 * snip + .2 * seg(t, T_PG.snip + .3, T_PG.snip + .6), sx = lerp(w * 1.1, w * .55, ease(seg(t, T_PG.snip - .8, T_PG.snip - .2))), sy = h * .58;
      for (const sg of [-1, 1]) { const a = sg * op; const blade = rotP([[sx, sy], [sx - 260, sy - 14], [sx - 280, sy], [sx - 260, sy + 10]], sx, sy, a); shape(blade, ZX.cream, { key: 'bl' + sg, lw: 2.6 });
        const ring = ellP(sx + 70 * cos(a) - 0, sy + 70 * sin(a) + sg * 26, 38, 26, 22); shape(ring, ZX.coral, { key: 'ri' + sg, lw: 2.6 }); } }
    c.restore();
    if (turnK > 0) { const ex = w * (1 - turnK); c.save(); c.fillStyle = rgba(ZX.ink, .12); c.fillRect(ex, 0, 18, h); c.restore(); }
  }
  if (turnK > 0) {   // answer sheet slides in under the turning page
    c.save(); c.beginPath(); c.rect(w * (1 - turnK), 0, w * turnK + 2, h); c.clip();
    c.save(); c.translate(-ox, 0); plateRect('paper', 0, 0, w0, h); c.restore(); ruled(.6);
    c.fillStyle = rgba(ZX.ink, .8); c.font = `${L ? h * .04 : w * .07}px ${ZX.fCNB}`; c.fillText('答', w * .07, h * .14);
    c.font = `${L ? h * .03 : w * .055}px ${ZX.fCN}`; c.fillText('问：你爱我吗？', w * .2, h * .2);
    // his answer, scribbled; circled in coral; an eraser that cannot erase it
    const ax = w * .26, ay = h * .38;
    for (let i = 0; i < 3; i++) ink([[ax, ay + i * h * .06], [ax + w * .14, ay - 8 + i * h * .06], [ax + w * .3, ay + 4 + i * h * .06], [ax + w * .46, ay - 6 + i * h * .06]], 4.6, { key: 'ans' + i });
    const cir = ellP(ax + w * .23, ay + h * .06, w * .29, h * .13, 30, -.08); inkPart(cir.concat([cir[0], cir[1]]), seg(t, T_PG.answer + .6, T_PG.answer + 1.4), 4.4, { col: ZX.coral, key: 'circ' });
    const er = seg(t, T_PG.answer + 1.6, T_PG.blot), ex = ax + w * .1 + sin(er * 22) * w * .14, ey = ay + h * .06 + sin(er * 9) * h * .04;
    if (er > 0 && er < 1) { c.fillStyle = rgba(ZX.ink, .08 * er); c.fillRect(ax - 10, ay - 30, w * .48, h * .2);
      const E = rotP(rrP(ex - 70, ey - 36, 140, 72, 14), ex, ey, -.3); shape(E, ZX.cream, { key: 'er', lw: 2.6 }); shape(rotP(rrP(ex + 20, ey - 38, 52, 76, 6), ex, ey, -.3), ZX.coral, { key: 'ers', lw: 2.6 }); }
    // the blot: ink from the answer floods into mud
    const bk = easeIn(seg(t, T_PG.blot, T_PG.mud));
    if (bk > 0) { const bx = ax + w * .23, by = ay + h * .06, R = bk * max(w, h) * 1.6, P = []; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; P.push([bx + cos(a) * R * (1 + .18 * sin(a * 5 + 1) + .1 * sin(a * 9)), by + sin(a) * R * (1 + .18 * sin(a * 4))]); }
      wash(P, '#4E3B2A', { tex: .8, edge: .4, edgeW: 22 }); }
    c.restore();
  }
  c.restore();
}
function filmContent(i, w, h, t) { if (i === 0) cFaces(w, h, t); else if (i === 1) cFever(w, h, t); else if (i === 2) cTag(w, h, t); else if (i === 3) cPage(w, h, t); else cLeader(w, h); }
function filmOff(t) { const ks = [[0, -4], [9, -4], [15.5, 0], [T_F[1] - .5, 0]]; for (let i = 1; i < 4; i++) ks.push([T_F[i] - .5, i - 1], [T_F[i] + .15, i]); return kf(t, ks, easeIO); }
function shotFilm(t, lt) {
  const F = FILM(), off = filmOff(t);
  // camera: intro wide → frame framing → push into the page until it fills the screen
  const fill = max((X.VIS.x1 - X.VIS.x0) / F.fw, (X.VIS.y1 - X.VIS.y0) / F.fh) * 1.015;
  const z = kf(t, [[0, O(.52, .5)], [14.5, O(.52, .5)], [21.2, 1], [T_PG.ledger + .25, 1], [T_PG.ledger + 1.6, fill]], easeIO);
  const titleA = 1 - seg(t, 13, 15.5);
  const ty = kf(t, [[0, 0], [14.5, 0], [21, O(-260, -500)]], easeIO);
  withCam(F.cx, F.cy + (z < .99 ? ty * (1 - z) * 1.7 : 0), z, () => {
    // guide lines that the strip will run along (intro)
    const edgeY = F.vertical ? null : [F.cy - F.fh / 2 - 74, F.cy + F.fh / 2 + 74];
    const gk = easeIO(seg(t, 2.2, 6.5)) * (1 - seg(t, 13, 15));
    if (gk > 0) { if (!F.vertical) for (const y of edgeY) inkPart([[F.cx - 2400, y], [F.cx, y + 2], [F.cx + 2400, y]], gk, 3, { key: 'gl' + y });
      else for (const x of [F.cx - F.fw / 2 - 70, F.cx + F.fw / 2 + 70]) inkPart([[x, F.cy - 2600], [x + 2, F.cy], [x, F.cy + 2600]], gk, 3, { key: 'gl' + x }); }
    if (t > 8.5) filmStrip({ ...F, n0: -6, n1: 3, off, content: (i, w, h) => filmContent(i, w, h, t) });
  });
  // title card (screen space)
  if (titleA > 0) {
    const c = X.ctx, a = ease(seg(t, 1.2, 3.2)) * titleA, cx = CX(), cy = O(300, 520) + (z - O(.52, .5)) * -200;
    c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.font = `${O(230, 250)}px ${ZX.fCNB}`; c.fillStyle = rgba(ZX.coral, .85); spaced(c, '周旋', cx + 7, cy - 5, O(40, 30), 'center'); c.fillStyle = ZX.ink; spaced(c, '周旋', cx, cy, O(40, 30), 'center');
    c.globalAlpha = a * ease(seg(t, 3, 5)); c.font = `600 ${O(18, 26)}px ${ZX.fUI}`; spaced(c, 'ZHOU XUAN', cx, cy + O(70, 90), O(9, 11), 'center');
    c.font = `${O(22, 32)}px ${ZX.fCN}`; spaced(c, '王以太 / 艾热 AIR', cx, cy + O(112, 148), O(8, 10), 'center');
    c.restore();
  }
  X.lyr = { mode: t < 21 ? 'none' : 'verse' };
  if (t > T_PG.ledger + 1.6) X.lyr.col = ZX.ink;
  X.noInfo = t < 14;
}
// ---------- mud ----------
function shotMud(t, lt, d) {
  const L = X.L, c = X.ctx;
  plate('mud');
  const sink = ease(seg(lt, .3, d)), hx = O(1000, 560), hy = O(440, 860) + sink * O(170, 240), s = O(330, 380);
  const surf = O(700, 1260) - sin(t * 1.2) * 4;
  figure({ who: 'him', x: hx, y: hy, s, dir: 1, tilt: -.12 - sink * .12, brow: .9, look: -.4, blink: blinkAt(t, [47.2]) });
  // mud surface over the body
  const P = [[X.VIS.x0 - 50, surf]]; for (let i = 0; i <= 24; i++) { const x = lerp(X.VIS.x0 - 50, X.VIS.x1 + 50, i / 24); P.push([x, surf + sin(i * .9 + t * 1.5) * 6 + (abs(x - hx) < s * .8 ? -10 : 0)]); }
  P.push([X.VIS.x1 + 50, X.VIS.y1 + 50], [X.VIS.x0 - 50, X.VIS.y1 + 50]); wash(P, '#5A4430', { tex: .9, edge: .35, edgeW: 16 });
  ink(P.slice(0, 26), 2.4, { col: '#2E2219', key: 'surf' });
  for (let j = 0; j < 3; j++) { const r = (((t * .5 + j / 3) % 1)) * s * 1.6 + s * .5, a = 1 - ((t * .5 + j / 3) % 1); const E = ellP(hx, surf + 4, r, r * .12, 36); ink(E.slice(0, 19), 1.8, { col: '#2E2219', key: 'mr' + j, alpha: a }); }
  // the flood we came from recedes; at the end the mud rises and flattens
  const recede = 1 - easeOut(seg(lt, 0, .9)), rise = easeIn(seg(lt, d - .55, d));
  if (recede > 0) fillAll('#4E3B2A', recede);
  if (rise > 0) { const y = lerp(X.VIS.y1, X.VIS.y0 - 40, rise); wash([[X.VIS.x0 - 50, y], [X.VIS.x1 + 50, y + 10], [X.VIS.x1 + 50, X.VIS.y1 + 50], [X.VIS.x0 - 50, X.VIS.y1 + 50]], '#4E3B2A', { tex: .7, edge: .3 }); }
  X.lyr = { col: ZX.cream };
}
// ---------- chessboard ----------
function shotChess(t, lt, d) {
  const L = X.L, c = X.ctx;
  plate('amberPlain');
  const cx = O(960, 540), cy = O(600, 1000), S = O(700, 860), cell = S / 8;
  const tilt = -.16 + .07 * sin(t * .9) + (t > 53.1 ? .05 * ease(seg(t, 53.1, 54)) : 0);
  const emerge = easeOut(seg(lt, 0, .8)), path = seg(t, 54.57, 55.4), off = seg(t, 55.6, 56.4);
  const sq = (i, j) => { const x = cx + (i - 4) * cell, y = cy + (j - 4) * cell; return rotP([[x, y], [x + cell, y], [x + cell, y + cell], [x, y + cell]], cx, cy, tilt); };
  const ctr = (i, j) => rotP([[cx + (i - 3.5) * cell, cy + (j - 3.5) * cell]], cx, cy, tilt)[0];
  const route = [[2, 6], [2, 5], [3, 5], [4, 5], [4, 4], [5, 4], [5, 3], [6, 3], [7, 3], [8, 3]];
  const onRoute = (i, j) => route.some(([a, b]) => a === i && b === j);
  const board = rotP(rectP(cx - S / 2, cy - S / 2, S, S), cx, cy, tilt);
  wash(board, ZX.cream, { tex: .6, alpha: 1 - path * .9 });
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    if ((i + j) % 2 === 0) continue; const fall = path * (onRoute(i, j) ? 0 : 1) * hash(i * 8 + j) ;
    const a = (1 - clamp(path * 1.4 * (onRoute(i, j) ? 0 : .6 + .4 * hash(i * 8 + j)))) * emerge;
    if (a > .02) wash(sq(i, j), '#5A4532', { alpha: a, tex: .8, edge: .2, edgeW: 5 });
  }
  if (path < 1) ink(board, 3, { closed: true, key: 'bd', smooth: 0, alpha: 1 - path });
  // route + exit light
  if (path > 0) { for (let k = 0; k < route.length - 1; k++) { const p = ctr(...route[k]), q = ctr(...route[k + 1]); if (seg(path, k / route.length, (k + 1) / route.length) > 0) for (let m = 0; m < 4; m++) { const u = m / 4, pt = [lerp(p[0], q[0], u), lerp(p[1], q[1], u)]; c.fillStyle = ZX.coral; c.beginPath(); c.arc(pt[0], pt[1], 5, 0, TAU); c.fill(); } }
    const ex = ctr(8, 3); glow(ex[0], ex[1], 160 + off * 900, '#FFD08A', path); wash(rotP(rectP(ex[0] - cell / 2, ex[1] - cell / 2, cell, cell), ex[0], ex[1], tilt), '#F6E2B4', { alpha: path, tex: 0, edge: 0 }); }
  // pieces = the two of them on pedestals (upright)
  const herSq = t < 53.1 ? [3, 3] : [4, 4], herPrev = [3, 3], himSq = t < 53.6 ? [2, 6] : [3, 5];
  const hp = (sqA, sqB, k) => { const a = ctr(...sqA), b = ctr(...sqB); return [lerp(a[0], b[0], ease(k)), lerp(a[1], b[1], ease(k)) - sin(PI * clamp(k)) * 40]; };
  const herP = hp(herPrev, [4, 4], seg(t, 53.1, 53.6)), himP = hp([2, 6], [3, 5], seg(t, 53.6, 54.1));
  const piece = (who, p, s, col) => { const base = ellP(p[0], p[1], s * .55, s * .16, 24), ped = [[p[0] - s * .42, p[1]], [p[0] + s * .42, p[1]], [p[0] + s * .3, p[1] - s * .5], [p[0] - s * .3, p[1] - s * .5]];
    shape(ped, col, { key: who + 'ped', lw: 2.4 }); shape(base, col, { key: who + 'base', lw: 2.4 });
    figure({ who, x: p[0] + (who === 'her' ? s * .03 : -s * .03), y: p[1] - s * .5 - .78 * s * .62, s: s * .62, dir: who === 'her' ? -1 : 1, noBody: true, tilt: who === 'him' ? -.1 : .05, key: 'pc' }); };
  const qa = 1 - seg(t, 55.2, 55.8);
  if (qa > 0) { c.save(); c.globalAlpha = qa; piece('him', himP, O(120, 140), '#3A3D4A'); piece('her', herP, O(170, 200), ZX.coral); c.restore(); }
  // emerge from the mud
  const mudA = 1 - easeOut(seg(lt, 0, .7)); if (mudA > 0) fillAll('#4E3B2A', mudA);
  // go into the exit light
  if (off > 0) { const ex = ctr(8, 3); glow(ex[0], ex[1], 300 + off * 1400, '#FFE2A8', off); fillAll('#F6E2B4', easeIn(off)); }
  X.lyr = {};
}
