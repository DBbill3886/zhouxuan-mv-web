/* shots_outro.js — 3:55–4:50  rain grey. Lake: she is far on the other shore → his smoke reaches for her → smoke becomes the clouds →
   drops one by one → her reflection breaks in the ripples → his words fall into the lake → the high note he never reaches → credits → film strip, grey.
   Bridges: his inverted-print silhouette = the painted him; smoke = clouds; clouds = the first drop; ripples = the reflection; his lips = the words;
   the falling characters = the staff notes; the rain = the credits; the film strip returns (as in the intro), grey. */
'use strict';
const HOR = () => O(660, 1120);
const OUT = () => X.L ? { him: [1380, 600, 430], her: [520, HOR() - 44, 34] } : { him: [700, 1380, 400], her: [300, HOR() - 44, 34] };
function lake(t, dark = 0) {
  const V0 = X.VIS, h = HOR(), c = X.ctx;
  plate('rain'); if (dark > 0) plate('rainDark', { alpha: dark });
  wash([[V0.x0 - 30, h], [V0.x1 + 30, h], [V0.x1 + 30, V0.y1 + 30], [V0.x0 - 30, V0.y1 + 30]], mixCol('#858C91', '#5E646B', dark), { tex: .8, alpha: .85 });
  ink([[V0.x0 - 30, h], [CX(), h + 1], [V0.x1 + 30, h]], 1.8, { col: '#4A5058', key: 'hz', taper: [0, 0] });
  for (let i = 0; i < 5; i++) { const y = h + O(60, 90) + i * O(80, 120); ink([[V0.x0 + (hash(i) * .4) * (V0.x1 - V0.x0), y], [V0.x0 + (.3 + hash(i) * .4) * (V0.x1 - V0.x0), y + 1]], 1.4, { col: '#6E757B', key: 'lk' + i, alpha: .6 }); }
}
function herFar(t, a = 1, s) { const P = OUT().her, ss = s || P[2]; figure({ who: 'her', x: P[0], y: HOR() - 3.25 * ss + 2, s: ss, dir: 1, alpha: a, body: 'herBody', lw: .03 }); return P; }
function himOut(t, o = {}) { const P = OUT().him; return figure({ who: 'him', x: o.x ?? P[0], y: o.y ?? P[1], s: o.s ?? P[2], dir: -1, tilt: o.tilt ?? -.04, body: 'himBodyGray', blink: o.blink ?? blinkAt(t, [238.4, 246.0, 250.2, 257.9]), look: o.look ?? .2, brow: o.brow ?? .3 }); }
// ---------- lake ----------
function shotLake(t, lt, d) {
  lake(t); const B8 = R8POS(), P = OUT().him, k = easeIO(seg(lt, .3, 2.2));
  herFar(t, easeOut(seg(lt, 1.6, 3.2)));
  himOut(t, { x: lerp(B8.him[0], P[0], k), y: lerp(B8.him[1], P[1], k), s: lerp(B8.him[2], P[2], k), look: kf(t, [[239.85, .1], [240.5, .6]]) });
  // he looks towards her: a faint dotted line of sight (never reaches)
  const sk = easeIO(seg(t, 239.85, 242.3)); if (sk > 0) { const c = X.ctx, a = [P[0] - P[2] * .45, P[1] - P[2] * .05], b = OUT().her; for (let i = 0; i < 26 * sk; i++) { const u = i / 30; c.fillStyle = rgba(ZX.ink, .45); c.beginPath(); c.arc(lerp(a[0], b[0], u), lerp(a[1], b[1] - 60, u), 3, 0, TAU); c.fill(); } }
  X.mix = 1 - easeOut(seg(lt, 0, 1.3)); if (X.mix > 0) chorusDensity(235.77, 4.08, 4.08, 'R8', true);
  X.lyr = {};
}
// ---------- smoke: it reaches for her and holds her ----------
function smokePath(t, k) { const P = OUT(), lip = [P.him[0] - P.him[2] * .42, P.him[1] + P.him[2] * .28], H = [P.her[0], P.her[1] - P.her[2] * 2], Q = [];
  for (let i = 0; i <= 50; i++) { const u = i / 50; if (u > k) break; let x, y;
    if (u < .7) { const v = u / .7; x = lerp(lip[0], H[0] + 90, v) + sin(v * 7 + t) * 30; y = lerp(lip[1], H[1] - 40, v) - sin(v * PI) * O(220, 300); }
    else { const v = (u - .7) / .3, a = v * TAU * 1.15; x = H[0] + cos(a) * 70; y = H[1] + sin(a) * 30 + v * 20; }
    Q.push([x, y]); } return Q; }
function shotSmoke(t, lt, d) {
  lake(t); herFar(t); himOut(t, { look: .5 });
  const k = easeOut(seg(lt, .2, d - .4)), Q = smokePath(t, k);
  if (Q.length > 2) { for (let j = 0; j < 3; j++) ink(Q.map(([x, y], i) => [x + j * 6, y + j * 10 + sin(i * .4 + t * 2 + j) * 6]), 7 - j * 2, { col: j ? '#B9BDBF' : '#9A9FA3', key: 'sm' + j, alpha: .8 - j * .2 });
    for (let i = 0; i < Q.length; i += 5) { const [x, y] = Q[i]; X.ctx.save(); X.ctx.globalAlpha = .35; wash(ellP(x, y, 30 + i, 18 + i * .4, 16), '#C6C8C5', { tex: .7, edge: 0 }); X.ctx.restore(); } }
  X.lyr = {};
}
// ---------- clouds: the smoke goes up and darkens the sky ----------
function shotClouds(t, lt, d) {
  const dk = easeIO(seg(lt, .3, d)); lake(t, dk); herFar(t); himOut(t, { look: .9, tilt: -.12 });
  const rise = easeIO(seg(lt, 0, 1.4)), Q = smokePath(t, 1);
  if (rise < 1) for (let j = 0; j < 2; j++) ink(Q.map(([x, y]) => [x, y - rise * O(400, 600)]), 6 - j * 2, { col: '#9A9FA3', key: 'sm' + j, alpha: (1 - rise) * .8 });
  const Cs = X.L ? [[420, 160, 1.6], [900, 110, 1.9], [1450, 170, 1.6], [700, 300, 1.2], [1200, 320, 1.1]] : [[240, 300, 1.2], [760, 240, 1.3], [500, 480, 1.1], [860, 560, .9]];
  Cs.forEach(([x, y, s], i) => cloud(x + sin(t * .2 + i) * 20, y + (1 - rise) * 200, s * rise, mixCol('#8C9196', '#4A5058', dk), .9 * rise, 'oc' + i));
  X.lyr = {};
}
// ---------- drops: one, then one more ----------
const DROP_T = [251.46, 252.3, 253.0, 253.68, 254.17, 254.66, 255.14];
function dropsAt(t, list, col = '#4A5058') {
  const V0 = X.VIS, h = HOR(), c = X.ctx;
  list.forEach((ts, i) => { const x = V0.x0 + (.15 + .7 * hash(i * 3.7 + 1)) * (V0.x1 - V0.x0), y1 = h + O(40, 60) + hash(i * 2.1) * O(260, 520), age = t - ts;
    if (age < 0) return; const fy = lerp(V0.y0 - 40, y1, clamp(age / .45));
    if (age < .45) { wash(ellP(x, fy, 6, 15, 12), i % 3 === 1 ? ZX.coral : col, { tex: .3 }); }
    else { const ra = age - .45; for (let j = 0; j < 3; j++) { const r = (ra * 160 + j * 40), a = clamp(1 - ra / 2.2) * (1 - j * .25); if (r > 0) ripple(x, y1, r, a, 'dr' + i + j); } } });
}
function shotDrops(t, lt, d) {
  lake(t, 1); herFar(t); himOut(t, { look: .9, tilt: -.16, blink: blinkAt(t, [252.0, 254.3]) });
  dropsAt(t, DROP_T); if (lt > d - .8) rain(floor(60 * seg(lt, d - .8, d)), rgba('#4A5058', .7), 1, .14, 5);
  X.lyr = {};
}
// ---------- reflection: she breaks in the ripples ----------
function shotReflect(t, lt, d) {
  const c = X.ctx, V0 = X.VIS, h = HOR(), P = OUT().her;
  lake(t, 1); rain(80, rgba('#4A5058', .65), 1, .14, 5);
  const g = easeIO(seg(lt, 0, 1.2)), s = lerp(P[2], O(130, 130), g), x = lerp(P[0], O(700, 400), g), fy = h - 3.25 * s + 3;
  // her reflection: the same figure mirrored at the waterline, sliced and shifted by ripples; it breaks on 看不清
  const br = easeIn(seg(t, 257.0, 259.2)), band = s * .16;
  for (let i = 0; i < 22; i++) { const y0 = h + i * band; if (y0 > h + 3.4 * s) break; const sh = sin(i * 1.7 + t * 4) * (3 + br * 50) * (1 + i * .12);
    c.save(); c.beginPath(); c.rect(V0.x0 - 50, y0, V0.x1 - V0.x0 + 100, band - 1 - 4 * br); c.clip(); c.translate(sh, 2 * h); c.scale(1, -1);
    c.globalAlpha = .5 * (1 - br * .65) * (1 - i / 26); figure({ who: 'her', x, y: fy, s, dir: 1, body: 'herBody', key: 'rf' }); c.restore(); }
  figure({ who: 'her', x, y: fy, s, dir: 1, body: 'herBody', blink: blinkAt(t, [257.2]), look: -.2 });
  for (let i = 0; i < 4; i++) { const ph = (t * .5 + i * .25) % 1; ripple(x + (i - 1.5) * s * .6, h + s * (.5 + i * .6), s * (.5 + ph * 1.4) * (1 + br), (1 - ph) * .9, 'rr' + i); }
  dropsAt(t, [255.9, 256.6, 257.1, 257.6, 258.1, 258.5]);
  X.lyr = {};
}
// ---------- his words fall into the lake ----------
function shotWords(t, lt, d) {
  lake(t, 1); rain(90, rgba('#4A5058', .65), 1, .14, 5); herFar(t, 1 - seg(lt, 0, d) * .6);
  const f = himOut(t, { look: .1, tilt: .1, brow: .6, blink: .2 }), c = X.ctx, P = OUT().him, lip = f.pt([.78, .74]), words = ['我', '想', '你', '别', '走'];
  words.forEach((w, i) => { const ts = 259.9 + i * .5, age = t - ts; if (age < 0) return; const y = lip[1] + age * age * 260 + age * 40, x = lip[0] - 30 - i * 12 - age * 70, wet = seg(y, HOR() + 40, HOR() + 260);
    c.save(); c.globalAlpha = 1 - wet; c.fillStyle = ZX.ink; c.font = `${O(44, 48)}px ${ZX.fCN}`; c.textAlign = 'center'; c.fillText(w, x, y); c.restore();
    if (wet > 0) ripple(x, HOR() + 160 + i * 20, 30 + wet * 120, 1 - wet, 'wr' + i); });
  X.lyr = {};
}
// ---------- the high note ----------
const STAFF = () => X.L ? { x0: 300, x1: 1170, y: 470, gap: 26, nx: 1050, ny: 270 } : { x0: 150, x1: 930, y: 640, gap: 28, nx: 820, ny: 420 };
function shotHighNote(t, lt, d) {
  const c = X.ctx, S = STAFF(), V0 = X.VIS;
  lake(t, 1 - .5 * seg(lt, 0, 3)); rain(110, rgba('#4A5058', .6), 1, .14, 5);
  const k = easeOut(seg(lt, 0, 1.2));
  // the falling characters settle as the staff
  for (let i = 0; i < 5; i++) ink([[S.x0 - i * 8, S.y + i * S.gap], [(S.x0 + S.x1) / 2, S.y + i * S.gap + 1], [S.x0 + (S.x1 - S.x0) * k, S.y + i * S.gap]], 1.6, { col: ZX.ink, key: 'sf' + i, taper: [0, .2] });
  // ledger lines climbing towards the note he can't reach
  for (let i = 1; i <= 6; i++) { const a = seg(lt, .8 + i * .12, 1.0 + i * .12); if (a > 0) ink([[S.nx - 40, S.y - i * S.gap], [S.nx + 40, S.y - i * S.gap]], 1.6, { key: 'lg' + i, alpha: a }); }
  const na = backOut(seg(lt, 1.6, 2.2)); if (na > 0) { wash(ellP(S.nx, S.ny, 30 * na, 22 * na, 20, -.3), ZX.coral, { tex: .5 }); ink([[S.nx + 28, S.ny], [S.nx + 29, S.ny - 90], [S.nx + 28, S.ny - 160]], 3, { col: ZX.coral, key: 'stem', alpha: na }); }
  // the leap: a dotted arc from the staff upward, every two beats; it stops short of the note
  const ph = ((beatOf(t) / 2) % 1 + 1) % 1, reach = .82;
  if (lt > 2.2) for (let i = 0; i < 16; i++) { const u = i / 16 * reach; if (u > ph * 1.1) break; const x = lerp(S.x0 + 140, S.nx - 10, u), y = lerp(S.y + S.gap * 2, S.ny, sin(u * PI / 2)); c.fillStyle = rgba(ZX.coral, .9 - u * .3); c.beginPath(); c.arc(x, y, 5, 0, TAU); c.fill(); }
  // him: looking up, eyes open
  himOut(t, { look: .9, tilt: -.2, blink: blinkAt(t, [266.2, 270.4]) });
  // vertical lyric on the left
  const vk = seg(t, 263.3, 265); c.save(); c.fillStyle = ZX.ink; c.globalAlpha = .9 * (1 - seg(lt, d - .6, d)); c.font = `${O(36, 44)}px ${ZX.fCN}`;
  const txt = '你是我永远唱不上去的高音', n = Math.ceil([...txt].length * vk); vertical(c, [...txt].slice(0, n).join(''), V0.x0 + O(110, 90), O(250, 300), O(36, 44), 1.36);
  const p = [...txt].indexOf('高'); if (n > p) { c.fillStyle = ZX.coral; vertical(c, '高音', V0.x0 + O(110, 90), O(250, 300) + p * O(36, 44) * 1.36, O(36, 44), 1.36); }
  c.restore();
  X.lyr = { mode: 'none' };
}
// ---------- credits over the rain, then the film strip (grey) and the end card ----------
function shotCredits(t, lt, d) {
  const c = X.ctx, V0 = X.VIS;
  lake(t, .5); rain(110, rgba('#4A5058', .6), 1, .14, 5);
  const ha = 1 - seg(lt, 0, 2); if (ha > 0) { c.save(); c.globalAlpha = ha; himOut(t, { look: .9, tilt: -.2 }); c.restore(); }
  // credits, two at a time, centred on the lake
  const per = 1.0, i0 = floor(seg(lt, .8, 9.5) * CREDITS.length / 2) * 2;
  c.save(); c.textAlign = 'center'; c.fillStyle = ZX.ink; c.textBaseline = 'middle';
  for (let j = 0; j < 2; j++) { const s = CREDITS[i0 + j]; if (!s) continue; const st = .8 + (i0 / 2) * (8.7 / (CREDITS.length / 2)), a = win(lt, st, st + 8.7 / (CREDITS.length / 2), .25) * (1 - seg(lt, 9.4, 9.8));
    const [k, v] = s.split(' : '); c.globalAlpha = a * .75; c.font = `${O(26, 34)}px ${ZX.fCN}`; spaced(c, k, CX(), O(430, 820) + j * O(150, 200), 8, 'center'); c.globalAlpha = a; c.font = `${O(46, 58)}px ${ZX.fCN}`; spaced(c, v, CX(), O(492, 895) + j * O(150, 200), 6, 'center'); }
  c.restore();
  // the strip returns, grey: their two faces, as at the start
  const sk = seg(lt, 9.6, 13.5); if (sk > 0) {
    const F = FILM(), off = lerp(-3.2, 0, easeOut(sk)), z = lerp(.5, .62, easeIO(seg(lt, 9.6, d)));
    withCam(F.cx, F.cy, z, () => { c.save(); c.globalAlpha = easeOut(seg(lt, 9.6, 10.4));
      filmStrip({ ...F, n0: -5, n1: 3, off, content: (i, w, h) => { plateRect('rain', 0, 0, w, h); const P = facesPos(w, h); if (i % 2 === 0) { figure({ who: 'her', x: P.her[0], y: P.her[1], s: P.her[2], dir: 1, tilt: .12, body: 'herBodyGray', blink: blinkAt(t, [285.3]) }); figure({ who: 'him', x: P.him[0], y: P.him[1], s: P.him[2], dir: -1, body: 'himBodyGray', blink: blinkAt(t, [286.1]) }); } else figure({ who: 'him', x: w * .4, y: h * .42, s: min(w, h) * .45, dir: 1, body: 'himBodyGray' }); } });
      c.restore(); });
  }
  // end card
  const e = easeOut(seg(t, 286.4, 288)); if (e > 0) { c.save(); fillAll(ZX.paper, e * .88); c.globalAlpha = e; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const cy = CY() + O(40, 0);
    c.font = `${O(200, 230)}px ${ZX.fCNB}`; c.fillStyle = rgba(ZX.coral, .85); spaced(c, '周旋', CX() + 7, cy - 5, O(40, 30), 'center'); c.fillStyle = ZX.ink; spaced(c, '周旋', CX(), cy, O(40, 30), 'center');
    c.font = `600 ${O(18, 26)}px ${ZX.fUI}`; spaced(c, 'ZHOU XUAN', CX(), cy + O(70, 90), O(9, 11), 'center'); c.font = `${O(22, 32)}px ${ZX.fCN}`; spaced(c, '王以太 / 艾热 AIR', CX(), cy + O(112, 148), O(8, 10), 'center'); c.restore(); }
  X.lyr = { mode: 'none' }; X.noInfo = e > .5;
}
