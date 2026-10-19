/* shots_night.js — 0:56–1:26  lamps go out → split halves → unfinished circle → phone cord → dawn wire → smile masks melt → reflection in a puddle → eyes (→ Riso).
   Bridges: exit light = last bulb; lamp cord = split line; halves = half-discs; circle line = phone cord; cord = dawn wire;
   clouds = masks; drips = puddle → balloon; deflated coral = her sweater; her eye/faces = Riso R1 silhouettes. */
'use strict';
// ---------- lamps ----------
const LAMPS = () => X.L ? [[260, 120], [555, 160], [845, 200], [1130, 250], [1490, 310]] : [[150, 300], [400, 360], [660, 420], [920, 480], [560, 640]];
const LAMP_OFF = [57.0, 57.4, 57.8, 58.2];
function lampsScene(t, cone = 1) {
  const Ls = LAMPS(), last = Ls[4];
  Ls.forEach(([x, y], i) => { const on = i === 4 ? 1 : 1 - seg(t, LAMP_OFF[i], LAMP_OFF[i] + .08), dim = i === 4 ? 0 : seg(t, LAMP_OFF[i], LAMP_OFF[i] + .08) * (1 - seg(t, LAMP_OFF[i] + .1, LAMP_OFF[i] + 1.2)); lamp(x, y, on, dim, O(1, 1.1), X.VIS.y0 - 20); });
  const bx = last[0], by = last[1] + 60 * O(1, 1.1);
  if (cone > 0) lightCone(bx, by, 110, O(900, 820), O(1100, 1500), '#FFC27A', .8 * cone);
  return [bx, by];
}
function himUnderLamp(t, a = 1) {
  return figure({ who: 'him', x: O(1380, 640), y: O(690, 1290), s: O(300, 330), dir: -1, tilt: -.22 + .015 * sin(t * 1.1), blink: blinkAt(t, [57.9, 61.2]), look: .3, alpha: a, skinTint: '#F3D7A2' });
}
function shotLamps(t, lt, d) {
  plate('night');
  const last = LAMPS()[4], z = kf(lt, [[0, 7], [1.2, 1]], easeOut), bx = last[0], by = last[1] + 60;
  withCam(lerp(CX(), bx, clamp((z - 1) / 2)), lerp(CY(), by, clamp((z - 1) / 2)), z, () => { lampsScene(t); himUnderLamp(t); });
  const w = 1 - easeOut(seg(lt, 0, .6)); if (w > 0) fillAll('#F6E2B4', w);
  X.dark = true; X.lyr = {};
}
// ---------- the split: lamp cord drops to the floor = the line between two halves ----------
const SPLIT = () => X.L ? { x: 960, her: [600, 430, 330], him: [1330, 420, 345] } : { x: 540, her: [330, 720, 300], him: [760, 1150, 300] };
function splitScene(t, lt) {
  const c = X.ctx, S = SPLIT(), V0 = X.VIS, L = X.L, open = ease(seg(lt, .9, 1.9));
  // left: amber (her · 憧憬)   right: night (him · 回忆)
  c.save(); c.beginPath(); c.rect(V0.x0 - 40, V0.y0 - 40, S.x - V0.x0 + 40, V0.y1 - V0.y0 + 80); c.clip();
  plate('night'); plate('amber', { alpha: open });
  if (open > 0) { const hk = kf(t, [[60.4, 0], [60.9, 1], [61.6, 1], [62.0, .4]]);
    figure({ who: 'her', x: S.her[0], y: S.her[1] + (1 - open) * 120, s: S.her[2], dir: 1, tilt: .1 - .04 * hk, blink: blinkAt(t, [59.8, 62.2]), alpha: open, look: .4 });
    glow(S.her[0] + S.her[2] * .3, S.her[1] - S.her[2] * .2, S.her[2] * 1.4, '#FFD08A', .25 + .2 * hk); }
  c.restore();
  c.save(); c.beginPath(); c.rect(S.x, V0.y0 - 40, V0.x1 - S.x + 40, V0.y1 - V0.y0 + 80); c.clip();
  plate('night'); const mk = kf(t, [[61.3, 0], [61.8, 1]]);
  figure({ who: 'him', x: S.him[0], y: S.him[1], s: S.him[2], dir: -1, tilt: -.05 + .05 * mk, blink: blinkAt(t, [60.2]) * 1 + mk * .55, brow: .4, alpha: ease(seg(lt, .95, 1.7)) });
  // memory: faint lamp ghosts on his side
  for (let i = 0; i < 3; i++) glow(S.x + (i + 1) * O(200, 130), O(160, 380) + i * 40, 60, '#C47A3A', .25 * mk);
  c.restore();
  // the cord = the split
  const drop = easeIn(seg(lt, .5, 1.1)), y1 = lerp(LAMPS()[4][1], V0.y1 + 30, drop);
  ink([[S.x + 1, V0.y0 - 30], [S.x, (V0.y0 + y1) / 2], [S.x + 1, y1]], 2.4, { col: open > .5 ? ZX.ink : ZX.inkNight, key: 'splitcord', taper: [0, 0] });
}
function shotSplit(t, lt, d) {
  const S = SPLIT(), c = X.ctx, V0 = X.VIS;
  // first 1.1 s: the last lamp slides to the centre and lets go of its cord
  if (lt < 1.1) {
    if (lt >= .9) splitScene(t, lt); else plate('night'); const k = easeIO(seg(lt, 0, .9)), L0 = LAMPS()[4], lx = lerp(L0[0], S.x, k), ly = lerp(L0[1], L0[1] - 260, easeIn(seg(lt, .5, 1.1)));
    c.save(); c.globalAlpha *= 1 - easeIn(seg(lt, .75, 1.1)); lamp(lx, ly, 1 - seg(lt, .45, 1.0), 0, O(1, 1.1), V0.y0 - 20); c.restore(); lightCone(lx, ly + 60, 110, O(900, 820), O(1100, 1500), '#FFC27A', .8 * (1 - seg(lt, 0, .9)));
    himUnderLamp(t, 1 - seg(lt, 0, .9));
    const y1 = lerp(ly, V0.y1 + 30, easeIn(seg(lt, .5, 1.1))); ink([[lx + 1, V0.y0 - 30], [lx, (V0.y0 + y1) / 2], [lx, y1]], 2.4, { col: ZX.inkNight, key: 'splitcord' });
  } else {
    // last 1.4 s: the frame closes into a disc (the circle shot starts from it)
    const k = easeIO(seg(lt, d - 1.4, d));
    if (k <= 0) splitScene(t, lt);
    else { plate('night'); fillAll(ZX.inkNight, .45 * k); const R = lerp(hypot(V0.x1 - V0.x0, V0.y1 - V0.y0) * .6, CIRC_R(), k), cy = CIRC_Y();
      c.save(); c.beginPath(); c.arc(S.x, lerp(CY(), cy, k), R, 0, TAU); c.clip(); camAt(S.x, lerp(CY(), cy, k), lerp(1, CIRC_Z(), k), () => splitScene(t, lt)); c.restore(); }
  }
  X.dark = true; X.lyr = {};
}
// ---------- the circle that never closes ----------
const CIRC_R = () => O(300, 320), CIRC_Y = () => O(500, 860), CIRC_Z = () => O(.60, .62);
function shotCircle(t, lt, d) {
  const c = X.ctx, S = SPLIT(), R = CIRC_R(), cy = CIRC_Y();
  plate('night'); fillAll(ZX.inkNight, .45);
  const gap = easeIO(seg(t, 62.9, 64.2)) * O(46, 40), fade = seg(lt, d - .7, d);
  for (const side of [-1, 1]) {
    c.save(); c.translate(side * gap, 0); c.beginPath(); c.arc(S.x, cy, R, side < 0 ? PI / 2 : -PI / 2, side < 0 ? PI * 1.5 : PI / 2); c.closePath(); c.clip();
    c.globalAlpha = 1 - fade; camAt(S.x, cy, CIRC_Z(), () => splitScene(t, t - 58.53)); c.restore();
    c.globalAlpha = 1;
  }
  // the ink circle (93 %) — 没有圆满
  const P = [], N = 60; for (let i = 0; i <= N; i++) { const a = -PI / 2 + i / N * TAU * .93; P.push([S.x + cos(a) * (R + 26), cy + sin(a) * (R + 26)]); }
  const k = easeOut(seg(t, 64.41, 65.6)); if (k > 0) inkPart(P, k, 4, { col: ZX.cream, key: 'circ93' });
  if (k >= 1) { const e = P[P.length - 1]; c.fillStyle = ZX.coral; c.beginPath(); c.arc(e[0], e[1], 6 + 2 * pulse(t), 0, TAU); c.fill(); }
  X.dark = true; X.lyr = {};
}
// ---------- phone: the circle's line uncoils into a phone cord ----------
function cordPath(t, n = 420) {   // coiled cord hanging from the top to the swinging receiver
  const S = SPLIT(), V0 = X.VIS, top = V0.y0 - 30, len = O(520, 900), sw = sin(t * 2.2) * .16 * (1 - .5 * seg(t, 66.4, 68.4)), P = [];
  for (let i = 0; i <= n; i++) { const u = i / n, a = sw * u * u, x = S.x + sin(a) * len * u, y = top + cos(a) * len * u;
    const coil = (u > .1 && u < .94 ? 1 : 0) * O(26, 30); P.push([x + cos(u * 64 * PI) * coil, y + sin(u * 64 * PI) * coil * .32]); }
  return P;
}
function handset(x, y, ang, s) {   // classic handset, earpiece + mouthpiece bulging to one side
  const H = [[-26, -170], [70, -176], [84, -120], [30, -96], [24, 96], [84, 120], [70, 176], [-26, 170], [-40, 0]];
  shape(rotP(offP(H, x, y, s), x, y, ang), ZX.mist, { lc: ZX.cream, key: 'hs', lw: 3.4, tex: .8 });
  for (const sy of [-1, 1]) for (let k = 0; k < 3; k++) { const p = rotP([[x + (52 + k * 8 - 8) * s, y + sy * 140 * s]], x, y, ang)[0]; X.ctx.fillStyle = ZX.inkNight; X.ctx.beginPath(); X.ctx.arc(p[0], p[1], 4 * s, 0, TAU); X.ctx.fill(); }
}
function shotPhone(t, lt, d) {
  const c = X.ctx, S = SPLIT(), R = CIRC_R() + 26, cy = CIRC_Y(), V0 = X.VIS;
  plate('night'); fillAll(ZX.inkNight, .45 * (1 - seg(lt, 0, .8)));
  const m = easeIO(seg(lt, 0, 1.4)), C = cordPath(t), N = C.length - 1, P = [];
  for (let i = 0; i <= N; i++) { const a = -PI / 2 + i / N * TAU * .93, q = [S.x + cos(a) * R, cy + sin(a) * R]; P.push([lerp(q[0], C[i][0], m), lerp(q[1], C[i][1], m)]); }
  const pan = easeIn(seg(lt, d - .8, d)) * O(900, 1300);
  c.save(); c.translate(0, pan);
  ink(P, 3, { col: ZX.cream, key: 'cord', smooth: 0, taper: [0, 0], amp: .4 });
  const e = P[N], e2 = P[N - 10], ang = atan2(e[1] - e2[1], e[0] - e2[0]) - PI / 2, rs = O(1.15, 1.3);
  if (m > .3) { c.globalAlpha = seg(m, .3, .8); const hc = rotP([[e[0] - 60 * rs, e[1] + 150 * rs]], e[0], e[1], ang)[0]; ink([e, [lerp(e[0], hc[0], .5) - 10, lerp(e[1], hc[1], .5)], [hc[0] - 40 * rs, hc[1] + 150 * rs]], 3, { col: ZX.cream, key: 'cord2' });
    handset(hc[0], hc[1], ang, rs); c.globalAlpha = 1; }
  // the ring goes out and breaks into dashes: nobody picks up
  if (lt > 1.0) { const hc = [e[0] - 60 * rs, e[1] + 150 * rs]; for (let j = 0; j < 3; j++) { const ph = ((t - BOFF) / (BEAT * 2) + j / 3) % 1, rr = 230 * rs + ph * 300;
    for (let k = 0; k < 7; k++) { const q0 = -PI * .28 + k * PI * .08, arc = []; for (let q = 0; q <= 4; q++) { const a = q0 + q / 4 * PI * .05; arc.push([hc[0] + cos(a) * rr, hc[1] + sin(a) * rr]); }
      ink(arc, 3, { col: ZX.amberLt, key: 'ra' + j + k, alpha: (1 - ph) * .85 }); } } }
  c.restore();
  X.dark = true; X.lyr = {};
}
// ---------- dawn: the cord runs up into a telephone wire under dark dawn clouds ----------
const DAWN_CL = () => X.L ? [[300, 170, 1.4], [900, 120, 1.8], [1500, 210, 1.5], [1150, 330, 1.0]] : [[200, 330, 1.1], [760, 260, 1.3], [440, 560, 1.0], [880, 700, .8]];
function dawnClouds(t, k = 0, melt = 0) {   // k: 0 clouds → 1 masks
  const Cs = DAWN_CL(), out = [];
  Cs.forEach(([x, y, s], i) => {
    const bump = pulse(t + i * BEAT * .5, 5) * 6 * (1 - k), M = MASKS()[i];
    const px = lerp(x + sin(t * .3 + i) * 30, M[0], ease(k)), py = lerp(y, M[1], ease(k)) + bump, ss = lerp(s, M[2], ease(k));
    out.push([px, py, ss]);
    cloud(px, py, ss, mixCol('#4A4F5E', ZX.cream, k), .92, 'dc' + i);
    if (k > .4) { const a = seg(k, .4, 1) * (1 - melt), w = 160 * ss;   // smile mask: two eye arcs + a smile
      ink([[px - w * .42, py - 20 * ss], [px - w * .3, py - 34 * ss], [px - w * .18, py - 20 * ss]], 3 * ss, { key: 'me' + i, alpha: a });
      ink([[px + w * .18, py - 20 * ss], [px + w * .3, py - 34 * ss], [px + w * .42, py - 20 * ss]], 3 * ss, { key: 'mf' + i, alpha: a });
      ink([[px - w * .35, py + 14 * ss], [px, py + 40 * ss], [px + w * .35, py + 14 * ss]], 3.6 * ss, { col: ZX.coral, key: 'ms' + i, alpha: a }); }
  });
  return out;
}
function shotDawn(t, lt, d) {
  const c = X.ctx, S = SPLIT(), V0 = X.VIS;
  plate('night'); const pa = easeIO(seg(lt, .1, 1.1)); plate('dawn', { alpha: pa });
  const enter = 1 - easeOut(seg(lt, 0, .9)), wy = O(420, 760);
  c.save(); c.translate(0, enter * ((V0.y0 - 30 + O(900, 1300)) - wy));
  // continuation of the phone cord (now straight) up to the wire, then the wire across the sky
  ink([[S.x, wy], [S.x + 1, (wy + V0.y1 + 1300) / 2], [S.x, V0.y1 + 1300]], 2.2, { key: 'dcord', taper: [0, 0] });
  ink([[V0.x0 - 40, wy - 60], [S.x * .5, wy + 10], [S.x, wy], [S.x + (V0.x1 - S.x) * .5, wy + 14], [V0.x1 + 40, wy - 50]], 2.2, { key: 'wire', taper: [0, 0] });
  c.restore();
  c.save(); c.globalAlpha = pa; dawnClouds(t); c.restore();
  // him, small, looking up at the clouds; every cloud bump is a reminder
  const hx = O(1460, 760), hy = O(800, 1450), s = O(230, 250);
  const sh = pulse(t, 4); figure({ who: 'him', x: hx, y: hy + enter * 400, s, dir: -1, tilt: -.28, brow: .6 + sh * .3, blink: blinkAt(t, [70.4]), look: .5 });
  X.dark = true; X.lyr = {};
}
// ---------- masks: the clouds come down as smiling faces, then melt into mud ----------
const MASKS = () => X.L ? [[360, 330, 1.35], [820, 190, 1.25], [1560, 260, 1.4], [1300, 600, 1.1]] : [[260, 470, 1.15], [790, 340, 1.1], [250, 980, 1.05], [840, 1060, 1.05]];
const MELT_T = 73.62;
function maskDrips(t, pos, melt) {
  const out = [];
  pos.forEach(([x, y, s], i) => { for (let j = 0; j < 5; j++) { const dx = (j - 2) * 52 * s + hash(i * 5 + j) * 20, len = melt * (80 + 220 * hash(i * 7 + j)) * s, y0 = y + 30 * s;
    const P = [[x + dx - 10 * s, y0], [x + dx - 8 * s, y0 + len * .8], [x + dx, y0 + len], [x + dx + 8 * s, y0 + len * .8], [x + dx + 10 * s, y0]];
    if (len > 4) wash(P, '#5A4430', { tex: .8, edge: .3, edgeW: 6 }); out.push([x + dx, y0 + len]); } });
  return out;
}
function shotMasks(t, lt, d) {
  plate('dawn'); fillAll('#3A3D4A', .25 * seg(lt, 0, 1.5));
  const k = easeIO(seg(lt, 0, 1.4)), melt = easeIn(seg(t, MELT_T, MELT_T + 1.6));
  const hx = O(960, 540), hy = O(560, 1180), s = O(300, 300);
  figure({ who: 'him', x: lerp(O(1460, 760), hx, k), y: lerp(O(800, 1450), hy, k), s: lerp(O(230, 250), s, k), dir: -1, tilt: lerp(-.28, .08, k), brow: .8, blink: blinkAt(t, [72.6, 74.3]), look: -.3 });
  const pos = dawnClouds(t, k, melt);
  if (melt > 0) { maskDrips(t, pos, melt); for (const [x, y, ss] of pos) cloud(x, y, ss, '#5A4430', melt * .95, 'mm' + x); }
  X.dark = true; X.lyr = {};
}
// ---------- balloon: the mud drips gather; cheap happiness inflates in her colour and goes flat ----------
const BAL = () => X.L ? { x: 760, y0: 850, y: 420, r: 190 } : { x: 420, y0: 1470, y: 760, r: 220 };
const POP_T = 78.6;
function shotPuddle(t, lt, d) {
  const c = X.ctx, B = BAL(), V0 = X.VIS;
  plate('dawn'); fillAll('#3A3D4A', .25);
  // drips falling from the masks gather into the puddle
  const fall = seg(lt, 0, .9), pos = MASKS();
  if (fall < 1) { c.save(); c.globalAlpha = 1 - easeIn(fall); dawnClouds(t, 1, 1); for (const [x, y, ss] of pos) cloud(x, y, ss, '#5A4430', .95, 'mm' + x); c.restore(); }
  if (fall < 1) { c.save(); c.globalAlpha = 1 - easeOut(seg(lt, 0, .6)); const tips = maskDrips(t, pos, 1 - .6 * easeIn(seg(lt, 0, .6))); c.restore();
    const full = []; pos.forEach(([x, y, s], i) => { for (let j = 0; j < 5; j++) full.push([x + (j - 2) * 52 * s + hash(i * 5 + j) * 20, y + 30 * s + (80 + 220 * hash(i * 7 + j)) * s]); });
    full.forEach(([x, y], k) => { const j = k % 5, px = lerp(x, B.x + (j - 2) * 30, easeIn(fall)), py = lerp(y, B.y0, easeIn(fall)); wash(ellP(px, py, 9, lerp(22, 14, fall), 12), '#5A4430', { tex: .5, alpha: 1 - fall }); }); }
  // 快乐过廉价的快乐: no sun in the sky — only its reflection in a puddle of mud. A single drop breaks it.
  const pud = ease(seg(lt, .5, 1.2)) * (1 - easeIn(seg(t, 79.0, 79.5))), RX = O(380, 250), RY = O(74, 70);
  const bloom = easeOut(seg(lt, 1.0, 2.2)), shim = seg(t, 77.58, 78.0) * (1 - seg(t, POP_T, POP_T + .3)), sh = easeOut(seg(t, POP_T, POP_T + .7)), gat = easeIO(seg(t, POP_T + .45, 79.5));
  if (pud > 0) { const E = ellP(B.x, B.y0, RX * pud, RY * pud, 36); wash(E, '#4A3A2C', { tex: .9, edge: .35, edgeW: 10 }); ink(E.slice(18, 37), 1.6, { col: '#2E2219', key: 'pudr', alpha: .7 * pud }); }
  const SR = O(150, 120) * bloom, SY = SR * .42;
  if (bloom > 0) {
    c.save(); pathOf(c, ellP(B.x, B.y0, RX * max(pud, .001), RY * max(pud, .001), 36), true); if (gat < .01) c.clip();
    glow(B.x, B.y0, SR * 2.4, '#FFB45E', .35 * bloom * (1 - sh * .7));
    const N = 9; for (let i = 0; i < N; i++) {
      const y0 = B.y0 - SY + i * 2 * SY / N, dx = shim * sin(t * 7 + i * 1.7) * 10 + sh * (hash(i * 3.1) - .5) * RX * 1.7 * (1 - gat);
      const dy = sh * (hash(i * 1.7) - .5) * RY * .8 * (1 - gat), gx = lerp(dx, 0, gat), sc2 = lerp(1, B.r * .4 / max(SR, 1), gat);
      c.save(); c.beginPath(); c.rect(B.x - RX * 2, B.y0 + (y0 - B.y0) * sc2 + dy - .5, RX * 4, 2 * SY / N * sc2 + 1); c.clip();
      wash(ellP(B.x + gx, B.y0 + dy, SR * sc2 * (1 + .05 * shim * sin(t * 9 + i)), lerp(SY, B.r * .4 * .6, gat), 30), ZX.coral, { tex: .75, edge: .15, alpha: lerp(.92 - .25 * sh, 1, gat) }); c.restore(); }
    c.restore();
    ink(ellP(B.x, B.y0 + SY * 1.6, SR * .7, 3, 12).slice(0, 7), 1.4, { col: ZX.cream, key: 'glint', alpha: .5 * bloom * (1 - sh) });
  }
  // the drop
  const df = seg(t, POP_T - .55, POP_T); if (df > 0 && df < 1) { const y = lerp(V0.y0 - 30, B.y0, easeIn(df)); wash(ellP(B.x + 6, y, 7, 15, 12), '#2E2219', { tex: .3, edge: 0, alpha: .85 }); }
  for (let j = 0; j < 3; j++) { const u = seg(t, POP_T + j * .18, POP_T + j * .18 + 1.1); if (u > 0 && u < 1) ink(ellP(B.x + 6, B.y0, RX * .15 + u * RX * .95, (RY * .15 + u * RY * .95), 40).slice(0, 41), 1.8, { col: ZX.cream, key: 'pr' + j, alpha: (1 - u) * .7 * pud }); }
  // he watches it rise and fall (L: right; P: bottom)
  const mv = easeIO(seg(lt, 0, 1.1)); figure({ who: 'him', x: lerp(O(960, 540), O(1430, 760), mv), y: lerp(O(560, 1180), O(520, 1300), mv), s: lerp(300, O(290, 260), mv), dir: -1, tilt: lerp(.08, kf(lt, [[1, -.05], [2.2, -.22], [3.0, -.22], [3.8, .12]]), mv), brow: .5, blink: blinkAt(t, [76.4, 79.0]), look: .4 });
  X.dark = true; X.lyr = {};
}
// ---------- eyes: the last of the coral is her sweater; two faces, a gaze, a kind lie (→ Riso) ----------
const R1POS = () => X.L ? { her: [712, 392, 400], him: [1222, 377, 420] } : { her: [330, 1200, 300], him: [770, 1225, 310] };   // portrait: faces in the lower half, type stacked above
// portrait: the one lamp left on at 0:58 hangs above them and fills the upper half with its cone
function eyesLamp(a) { if (X.L || a <= 0) return; const V0 = X.VIS, y = V0.y0 + 330;
  glow(540, y + 90, 760, '#FFB45E', .25 * a); lightCone(540, y + 84, 150, 1000, 1000, '#FFC27A', .6 * a); lamp(540, y, a, 1 - a, 1.45, V0.y0 - 20); }
function shotEyes(t, lt, d) {
  const c = X.ctx, P = R1POS(), B = BAL();
  plate('night'); glow(O(960, 540), O(420, 880), O(700, 800), '#FFB45E', .22); eyesLamp(easeOut(seg(lt, .5, 1.4)));
  const push = 1 + .06 * ease(seg(lt, 0, d)), cx = O(967, 550), cy = O(420, 880);
  withCam(cx, cy, push, () => {
    figure({ who: 'her', x: P.her[0], y: P.her[1], s: P.her[2], dir: 1, tilt: .02, blink: blinkAt(t, [80.6, 84.2]), look: .2 });
    figure({ who: 'him', x: P.him[0], y: P.him[1], s: P.him[2], dir: -1, tilt: -.02, blink: blinkAt(t, [82.9]), look: .5, brow: .2 });
    // the kind lie: a coral thread leaves her lips and winds around him (周旋)
    const k = easeIO(seg(t, 81.3, 84.8)); if (k > 0) {
      const lip = [P.her[0] + P.her[2] * .34, P.her[1] + P.her[2] * .3], hc = [P.him[0] + P.him[2] * .05 * -1, P.him[1] + P.him[2] * .2], Q = [lip];
      for (let i = 1; i <= 48; i++) { const u = i / 48, a = PI + u * TAU * 1.6, r = P.him[2] * (.9 - .25 * u); Q.push([lerp(lip[0], hc[0] + cos(a) * r, ease(min(1, u * 3))), lerp(lip[1], hc[1] + sin(a) * r * .5, ease(min(1, u * 3)))]); }
      inkPart(Q, k, 3.2, { col: ZX.coral, key: 'lie' });
    }
  });
  // enter: the fallen coral blob opens into her sweater
  const rk = easeIO(seg(lt, 0, .9)); if (rk < 1) {
    const bx = B.x, by = B.y0, R = lerp(B.r * .4, 2600, rk);
    c.save(); c.beginPath(); c.rect(X.VIS.x0 - 50, X.VIS.y0 - 50, X.VIS.x1 - X.VIS.x0 + 100, X.VIS.y1 - X.VIS.y0 + 100); c.arc(bx, by, R, 0, TAU, true); c.clip();
    plate('dawn'); fillAll('#3A3D4A', .25); c.restore();
    if (rk < .3) wash(ellP(bx, by, R, R * .6, 30), ZX.coral, { alpha: 1 - rk / .3, tex: .8 });
  }
  // into print: the painting turns to Riso dots and becomes the chorus poster
  X.mix = easeIn(seg(t, 85.75, 86.58));
  if (X.mix > 0) chorusDensity(86.58, 0, 1.56, 'R1', false);
  X.dark = true; X.lyr = {};
}
