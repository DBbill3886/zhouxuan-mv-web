/* shots_chorus.js — the two choruses as two-colour Riso posters (density layers A = MIST, B = CORAL; white = ink).
   Chorus 1 (1:26–1:58) prints type in MIST with the two of them in CORAL.  Chorus 2 (3:23–3:55) is the same poster INVERTED:
   a solid CORAL field with the type knocked out to paper and the figures overprinted in MIST.
   Bridges inside the chorus: the figures orbit from R1 back to their places (R2→R3); the last spike = the strike-through bar (R3→R4);
   the speech bubble = the halo rings round her head (R4→R5); rings → tally strokes (R5→R6); the orbit of dots stops and falls (R7)
   and the fallen dots = the floor they stand on, back to back (R7→R8). Every poster change is a print morph (old dots shrink, new grow). */
'use strict';
const RM = () => O(72, 64);
function cnPart(s) { return s.replace(/[A-Za-z][A-Za-z ]*/g, ' ').replace(/\s+/g, ' ').trim(); }
function lyrAt(t) { let s = ''; for (const [a, b] of LYR) if (a <= t + .05) s = b; return s; }
// layer roles: T = type, F = figures/props; inverted swaps them and turns the type into a knock-out of a solid CORAL field
function roles(inv) {
  return inv ? { T: X.B, tc: '#000', F: X.A, fc: '#fff', P: X.A, pc: '#fff' } : { T: X.A, tc: '#fff', F: X.B, fc: '#fff', P: X.B, pc: '#fff' };
}
function figGrad(c, y0, y1, hi = 1, lo = .35) { const g = c.createLinearGradient(0, y0, 0, y1); const v = x => { const n = Math.round(255 * x); return `rgb(${n},${n},${n})`; }; g.addColorStop(0, v(hi)); g.addColorStop(.55, v(lerp(hi, lo, .3))); g.addColorStop(1, v(lo)); return g; }
function rFig(R, who, x, y, s, dir, o = {}) { const c = R.F; figFlat(c, { who, x, y, s, dir, tilt: o.tilt || 0, fill: o.fill || figGrad(c, y - s * .5, y + s * 3.2, o.hi ?? 1, o.lo ?? .35), noBody: o.noBody, irisFill: o.iris }); }
// big rows of display type, exact width
function rRow(R, txt, x, base, w, h, a = 1) { const c = R.T; c.save(); c.globalAlpha = a; c.fillStyle = R.tc; fitWord(c, txt, x, base, w, h); c.restore(); }
function rCN(R, lines, x, y, size, o = {}) {   // Chinese lines in bold Song, print-in by character
  const c = o.ctx || R.T; c.save(); c.fillStyle = o.col || R.tc; c.font = `${size}px ${ZX.fCNB}`; c.textBaseline = 'middle';
  if (X.safeB) { const bot = y + (lines.length - 1) * size * 1.5 + size * .55, lim = X.VIS.y1 - X.safeB; if (bot > lim) y -= bot - lim; }   // never under the control bar
  let n = 0; const shown = o.k == null ? 1e9 : Math.ceil(o.k * lines.join('').length);
  lines.forEach((ln, i) => { const ch = [...ln]; let cx = o.align === 'right' ? x - spacedW(c, ln, size * .2) : o.align === 'center' ? x - spacedW(c, ln, size * .2) / 2 : x;
    for (const q of ch) { if (n++ < shown) c.fillText(q, cx, y + i * size * 1.5); cx += c.measureText(q).width + size * .2; } });
  c.restore();
}
function rMeta(R, t, label) {   // small credit block (right of the middle band)
  const c = R.T, M = RM(), x = X.VIS.x1 - M, y = O(540, 960); c.save(); c.fillStyle = R.tc; c.textBaseline = 'middle';
  if (!X.L) { c.restore(); return; }
  c.fillRect(x - 250, y - 62, 250, 2); c.font = `600 16px ${ZX.fUI}`; spaced(c, label, x, y - 34, 5, 'right');
  c.font = `600 17px ${ZX.fCN}`; spaced(c, '王以太 × 艾热 AIR', x, y, 4, 'right'); c.font = `600 16px ${ZX.fUI}`; spaced(c, 'ZHOU XUAN', x, y + 34, 5, 'right'); c.restore();
}
const tcLabel = (t0, tag) => { const m = floor(t0 / 60), s = t0 - m * 60; return `${tag} — ${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`; };
const BRK = { '是你对我在索取着罗列着': ['是你对我在', '索取着罗列着'], '但现实却是我无法让你兴奋': ['但现实却是', '我无法让你兴奋'], '但最后却是言语刺骨手冰冷': ['但最后却是', '言语刺骨手冰冷'],
  '我无法感谢你嘴里的同情': ['我无法感谢', '你嘴里的同情'], '周旋着我妥协着': ['周旋着', '我妥协着'] };
function midLines(t) { const s0 = cnPart(lyrAt(t)); if (BRK[s0.replace(/ /g, '')]) return BRK[s0.replace(/ /g, '')]; const s = cnPart(lyrAt(t)); const ch = [...s.replace(/ /g, '')]; if (ch.length <= 6) return [s.replace(/ /g, '')]; const sp = s.indexOf(' '); if (sp > 1) return [s.slice(0, sp), s.slice(sp + 1)]; const m = Math.ceil(ch.length / 2); return [ch.slice(0, m).join(''), ch.slice(m).join('')]; }
// R1 positions = paint shotEyes positions (the bridge into print)
function orbitPos(th) {
  const P = R1POS(), mx = (P.her[0] + P.him[0]) / 2, my = (P.her[1] + P.him[1]) / 2, rx = (P.him[0] - P.her[0]) / 2, ry = O(70, 90);
  const dz = sin(th);
  return { her: [mx - cos(th) * rx, my + (X.L ? sin(th) * ry * .6 : -sin(th) * ry), P.her[2] * (1 - .14 * dz), cos(th)], him: [mx + cos(th) * rx, my - (X.L ? sin(th) * ry * .6 : -sin(th) * ry), P.him[2] * (1 + .14 * dz), -cos(th)], front: dz > 0 ? 'him' : 'her' };
}
const R8POS = () => { const fy = O(820, 1350), s = O(220, 230); return { floor: fy, her: [CX() - O(340, 270), fy - s * 3.2, s], him: [CX() + O(340, 270), fy - s * 1.05 * 3.2, s * 1.05] }; };
// portrait title block: four rows stacked in the top half, faces below (no type under the bodies)
function pRows(R, x0, rowW, k1, k2, dx) { const y = X.VIS.y0 + 130, a = 190, b = 120, g = 22;
  rRow(R, 'HEART', x0 + dx, y + a, rowW, a, k1); rRow(R, 'BREAKER', x0 - dx, y + a + g + b, rowW, b, k1);
  rRow(R, 'SUN', x0 - dx, y + a + 2 * (g + b), rowW, b, k2); rRow(R, 'DOWNER', x0 + dx, y + 2 * (a + g) + 2 * b + g, rowW, a, k2); }
const P_MID = () => X.VIS.y0 + 130 + 2 * 190 + 2 * 120 + 4 * 22 + 70;   // first free line under the title block
const sgnDir = d => abs(d) < .06 ? (d < 0 ? -.06 : .06) : d;
function twoFigs(R, th, o = {}) {
  const Q = orbitPos(th), order = Q.front === 'him' ? ['her', 'him'] : ['him', 'her'];
  for (const w of order) { const q = Q[w]; rFig(R, w, q[0], q[1] + (o.dy || 0), q[2], sgnDir(q[3]), o); }
  return Q;
}
// ---------------- the poster per section ----------------
function chorusDensity(t, lt, d, kind, inv) {
  const R = roles(inv), M = RM(), V0 = X.VIS, L = X.L, W = X.LW, H = X.LH, A = X.A, B = X.B;
  X.colA = ZX.mist; X.colB = ZX.coral; X.mis = inv ? [-5, 4] : [6, -4]; X.infoInk = inv ? 'A' : 'A';
  if (inv) { B.fillStyle = '#fff'; B.fillRect(V0.x0 - 20, V0.y0 - 20, V0.x1 - V0.x0 + 40, V0.y1 - V0.y0 + 40); }
  const tag = inv ? 'CHORUS II' : 'CHORUS';
  const CAP = O(318, 250), rowW = (V0.x1 - V0.x0) - 2 * M, x0 = V0.x0 + M;
  const midY = O(540, 960), beatK = pulse(t, 7);
  if (kind === 'R1') {
    const k1 = easeOut(seg(lt, 0, .25)), k2 = easeOut(seg(lt, BEAT, BEAT + .25));
    if (L) { rRow(R, 'HEARTBREAKER', x0, M + CAP, rowW, CAP, k1); rRow(R, 'SUNDOWNER', x0, H - M, rowW, CAP, k2); }
    else pRows(R, x0, rowW, k1, k2, 0);
    twoFigs(R, 0);
    rCN(R, midLines(t), x0, L ? midY - 38 : P_MID(), O(50, 46), { k: seg(lt, 0, .5) }); rMeta(R, t, tcLabel(t, tag));
  }
  else if (kind === 'R2') {   // 周旋 — they circle each other; the title rows run as a marquee
    const th = TAU * easeIO(seg(lt, .2, d - .25)), sc = (t - (t - lt)) * O(170, 120);
    const marquee = (txt, base, h, dir) => { const c = R.T; c.save(); c.fillStyle = R.tc; c.font = `${h * 1.36}px ${ZX.fD}`; c.textBaseline = 'alphabetic'; const unit = c.measureText(txt + '  ·  ').width; let x = V0.x0 - ((dir * sc) % unit + unit) % unit - unit; while (x < V0.x1) { c.fillText(txt + '  ·  ', x, base); x += unit; } c.restore(); };
    if (L) { const ch = 250; marquee('HEARTBREAKER', M + ch, ch, 1); marquee('SUNDOWNER', H - M, ch, -1); }
    else {   // portrait: the R1 stacked rows stay inside the margins and breathe instead of scrolling off the sides
      pRows(R, x0, rowW, 1, 1, sin(lt * 1.3) * 12); }
    // the orbit line (dotted)
    const P = R1POS(), mx = (P.her[0] + P.him[0]) / 2, my = (P.her[1] + P.him[1]) / 2 + O(320, 330), rx = (P.him[0] - P.her[0]) / 2 + 40;
    const c = R.P; c.save(); c.fillStyle = R.pc; for (let i = 0; i < 64; i++) { const a = i / 64 * TAU + lt * .6; c.globalAlpha = .9; c.beginPath(); c.arc(mx + cos(a) * rx * 1.25, my + sin(a) * O(60, 120), 5, 0, TAU); c.fill(); } c.restore();
    twoFigs(R, th);
    const lines = ['多希望是你', '周旋着我妥协着'], k = seg(t, inv ? 204.9 : 88.14, (inv ? 204.9 : 88.14) + 1.2), k2 = inv ? seg(t, 208.86, 209.8) : 1;
    rCN(R, [lines[0]], x0, L ? midY - 38 : P_MID(), O(50, 46), { k }); if (k2 > 0) rCN(R, [lines[1]], x0, L ? midY + 38 : P_MID() + 70, O(50, 46), { k: inv ? k2 : k }); rMeta(R, t, tcLabel(t, tag));
  }
  else if (kind === 'R3') {   // 言语刺骨 · 手冰冷 — her words drift as cold breath and frost him; he freezes into the other colour
    const P = R1POS(), c = R.T;
    c.save(); c.fillStyle = R.tc; c.font = `${O(560, 600)}px ${ZX.fCNB}`; c.textBaseline = 'alphabetic'; c.textAlign = 'center';
    if (L) { c.fillText('刺', 480, 760); c.fillText('骨', 1440, 760); } else { c.font = `400px ${ZX.fCNB}`; c.fillText('刺', 540 - 210, V0.y0 + 560); c.fillText('骨', 540 + 210, V0.y0 + 560); } c.restore();
    const freeze = easeIO(seg(lt, d * .62, d * .62 + 1.2));
    rFig(R, 'her', P.her[0], P.her[1], P.her[2], 1);
    // him: CORAL → MIST from the hands up (cold)
    const yF = P.him[1] + P.him[2] * 3.3 - freeze * P.him[2] * 3.9;
    for (const [ctx, part] of [[R.F, 0], [inv ? X.B : X.A, 1]]) { ctx.save(); ctx.beginPath(); if (part === 0) ctx.rect(V0.x0, V0.y0 - 50, V0.x1 - V0.x0, yF - V0.y0 + 50); else ctx.rect(V0.x0, yF, V0.x1 - V0.x0, V0.y1 - yF + 50); ctx.clip();
      figFlat(ctx, { who: 'him', x: P.him[0], y: P.him[1], s: P.him[2], dir: -1, fill: inv && part ? '#000' : figGrad(ctx, P.him[1] - P.him[2] * .5, P.him[1] + P.him[2] * 3.2), irisFill: inv && part ? '#fff' : undefined }); ctx.restore(); }
    // her words as cold breath: fine drifting wisps (type colour) leave her lips and settle on him as frost crystals — nothing stabs
    const lip = [P.her[0] + P.her[2] * .36, P.her[1] + P.her[2] * .3], tgt = [P.him[0] - P.him[2] * .3, P.him[1] + P.him[2] * .25];
    const q = R.T; q.save(); q.fillStyle = R.tc; q.strokeStyle = R.tc; q.lineCap = 'round';
    for (let j = 0; j < 7; j++) for (let i = 0; i < 22; i++) { const u = ((i / 22 + lt * .14 + j * .11) % 1), born = seg(lt, j * .25, j * .25 + .6); if (born <= 0) continue;
      const x = lerp(lip[0], tgt[0], u), y = lerp(lip[1], tgt[1], u) + sin(u * PI) * O(-95, -80) * (j - 3) * .55 + sin(u * 7 + lt * 1.2 + j * 1.7) * O(26, 22) * u;
      q.globalAlpha = born * sin(PI * u) * .95; q.beginPath(); q.arc(x, y, O(5, 4.5) * (1 - u * .55), 0, TAU); q.fill(); }
    const nF = floor(seg(lt, .6, d - .3) * 44);
    for (let i = 0; i < nF; i++) { const fx = P.him[0] + (hash(i * 3.7) - .55) * P.him[2] * 1.1, fy = P.him[1] - P.him[2] * .1 + hash(i * 5.9) * P.him[2] * 1.9, r = O(12, 10) + hash(i * 1.3) * O(20, 16), rot = hash(i * 2.1) * PI;
      const g = backOut(seg(lt, .6 + i * (d - .9) / 44, 1.1 + i * (d - .9) / 44)); q.globalAlpha = .95; q.lineWidth = O(3, 2.6);
      for (let k = 0; k < 3; k++) { const a = rot + k * PI / 3, ca = cos(a) * r * g, sa = sin(a) * r * g; q.beginPath(); q.moveTo(fx - ca, fy - sa); q.lineTo(fx + ca, fy + sa); q.stroke(); } }
    q.restore();
    // the last spike lengthens into a bar (bridge to R4)
    // (R3→R4: the print morph carries the frost into the struck-through 同情)
    rCN(R, midLines(t), x0, O(midY + 300, V0.y0 + 700), O(46, 44), { ctx: R.T, k: seg(t, t - lt + .1, t - lt + 1) });
  }
  else if (kind === 'R4') {   // 同情, struck through; a speech bubble from her lips holds it
    const c = R.T, P = R1POS(), y = O(560, 760);
    c.save(); c.fillStyle = R.tc; c.font = `${O(600, 350)}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText('同情', CX(), y + O(20, 10)); c.restore();
    twoFigs(R, 0, { lo: .3 });
    const p = R.P; p.save(); p.fillStyle = R.pc; const bw = O(44, 40) * (1 + .15 * pulse(t, 8)); p.fillRect(V0.x0 + M, y - bw / 2, rowW, bw); p.restore();
    // bubble (outline + small type) — grows from her lips
    const k = backOut(seg(lt, .4, 1.1)), bx = P.her[0] + P.her[2] * .9, by = P.her[1] - P.her[2] * O(.7, .5), br = O(130, 110) * k * (1 - easeIn(seg(lt, d - .5, d)) * .55);
    if (k > 0) { p.save(); p.fillStyle = R.pc; p.beginPath(); p.arc(bx, by, br, 0, TAU); p.arc(bx, by, max(0, br - 10), 0, TAU, true); p.fill();
      p.beginPath(); p.moveTo(bx - br * .5, by + br * .8); p.lineTo(P.her[0] + P.her[2] * .4, P.her[1] + P.her[2] * .25); p.lineTo(bx - br * .1, by + br * .95); p.fill();
      const sh = 1 - seg(lt, d - .5, d); p.font = `${br * .55}px ${ZX.fCNB}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.globalAlpha = sh; p.fillText('谢谢', bx, by); p.restore(); }
    rCN(R, midLines(t), x0, O(V0.y1 - 120, V0.y0 + 330), O(46, 44), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R5') {   // GOLD DIGGER / MINDSEEKER — no coins: rings of attention pulse out from her head (the seeker's radar / a gilt halo)
    if (L) { rRow(R, 'GOLD DIGGER', x0, M + CAP, rowW, CAP); rRow(R, 'MINDSEEKER', x0, H - M, rowW, CAP); }
    else { const c2 = 210; rRow(R, 'GOLD', x0, V0.y0 + 150 + c2, rowW, c2); rRow(R, 'DIGGER', x0, V0.y0 + 170 + c2 * 1.75, rowW, c2 * .7); rRow(R, 'MIND', x0, V0.y1 - 230 - c2 - 26, rowW, c2 * .7); rRow(R, 'SEEKER', x0, V0.y1 - 230, rowW, c2); }
    const F5 = L ? [860, 380, 420] : [600, V0.y0 + 715, 178], hx = F5[0] + F5[2] * .1, hy = F5[1] + F5[2] * .15;
    // rings in the type colour (second drum), one born per beat, opening and thinning as they travel
    const c = R.T; c.save(); c.strokeStyle = R.tc; const b0 = (t - BOFF) / BEAT;
    for (let j = 0; j < 7; j++) { const age = (b0 - floor(b0)) + j, u = age / 7; if (lt < (j - (b0 - floor(b0))) * 0) continue;
      const r = F5[2] * (.9 + u * O(2.6, 3.0)), born = seg(lt, 0, .6); c.globalAlpha = (1 - u) * born; c.lineWidth = O(14, 10) * (1 - u * .7);
      c.beginPath(); c.ellipse(hx, hy, r, r * .92, 0, 0, TAU); c.stroke(); }
    c.restore();
    if (L) rFig(R, 'her', F5[0], F5[1], F5[2], 1, { lo: .15 }); else rFig(R, 'her', F5[0], F5[1], F5[2], 1, { lo: .2 });
    rCN(R, midLines(t), x0, O(midY - 38, V0.y1 - 150), O(50, 46), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R6') {   // 索取着 罗列着 — no receipt: tally marks (正-style groups of five) keep counting, stroke by stroke
    const c = R.T; c.save(); c.fillStyle = R.tc; c.font = `${O(400, 360)}px ${ZX.fCNB}`; c.textBaseline = 'alphabetic';
    if (L) { c.fillText('索取', V0.x0 + M - 10, 420); c.textAlign = 'right'; c.fillText('罗列', V0.x1 - M + 10, H - M); } else { c.textAlign = 'center'; c.fillText('索取', 540, V0.y0 + 520); c.fillText('罗列', 540, V0.y1 - 220); } c.restore();
    rFig(R, 'him', O(1460, 790), O(330, 760), O(330, 190), -1, { lo: .25 });
    const p = R.P, gw = O(118, 96), sh = O(92, 78), sx = O(22, 18), cols = O(7, 5), rows = O(2, 4), gx0 = x0 + O(10, 0), gy0 = O(500, V0.y0 + 640), rg = O(130, 112);
    const n = floor(seg(lt, .15, d - .4) * cols * rows * 5 + 1e-6);
    p.save(); p.fillStyle = R.pc; p.strokeStyle = R.pc; p.lineCap = 'round';
    for (let m = 0; m < n; m++) { const g = floor(m / 5), q = m % 5, gx = gx0 + (g % cols) * gw, gy = gy0 + floor(g / cols) * rg, jit = (hash(m * 1.7) - .5) * 6;
      if (floor(g / cols) >= rows) break;
      p.lineWidth = O(9, 8); p.beginPath();
      if (q < 4) { p.moveTo(gx + q * sx + jit, gy); p.lineTo(gx + q * sx - jit, gy + sh); } else { p.moveTo(gx - sx * .5, gy + sh * .82); p.lineTo(gx + 3.6 * sx, gy + sh * .18); }
      p.stroke(); }
    p.restore();
    rCN(R, midLines(t), x0, O(V0.y1 - 150, V0.y1 - 120), O(46, 52), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R7') {   // 兴奋 — the dotted orbit from 周旋 stops turning; its dots drop one by one to the floor; the type loses its ink
    const flat = easeIO(seg(lt, d * .3, d * .3 + 1.6)), c = R.T;
    c.save(); c.fillStyle = R.tc; c.globalAlpha *= lerp(1, .32, flat); c.font = `${O(640, 520)}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(L ? '兴奋' : '兴', CX(), O(560, V0.y0 + 560)); if (!L) c.fillText('奋', CX(), V0.y1 - 520); c.restore();
    const p = R.P, N = 48, ocx = CX(), ocy = O(600, 980), rx = O(560, 380), ry = O(110, 150), fy = R8POS().floor, spin = lt * .6 * (1 - flat);
    p.save(); p.fillStyle = R.pc;
    for (let i = 0; i < N; i++) { const a = i / N * TAU + spin, x0d = ocx + cos(a) * rx, y0d = ocy + sin(a) * ry, ord = hash(i * 2.3), ts = d * .3 + ord * d * .55, age = lt - ts;
      let x = x0d, y = y0d; if (age > 0) { const tf = sqrt(max(1, fy - y0d) / 2600); if (age < tf) y = y0d + 2600 * age * age; else { y = fy - 5; x = x0d + sin(i) * 4 * exp(-(age - tf) * 6); } }
      p.beginPath(); p.arc(x, y, O(7, 7), 0, TAU); p.fill(); }
    p.restore();
    if (L) rFig(R, 'her', 260, 330, 260, 1, { lo: .3 });
    rCN(R, midLines(t), x0, O(V0.y1 - 120, V0.y1 - 150), O(46, 52), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R8') {   // 是谁的错 — back to back on the floor of fallen dots; the question set as a vertical line of type between their backs
    const p = R.P, B8 = R8POS(), fy = B8.floor, k = easeIO(seg(lt, 0, 1));
    p.save(); p.fillStyle = R.pc; p.fillRect(V0.x0 - 20, fy - 5, V0.x1 - V0.x0 + 40, 10); p.restore();
    const up = (1 - k) * 200;
    rFig(R, 'her', B8.her[0], B8.her[1] + up, B8.her[2], -1); rFig(R, 'him', B8.him[0], B8.him[1] + up, B8.him[2], 1);
    rCN(R, [cnPart(lyrAt(t)).split(' ')[0]], x0, O(V0.y1 - 110, V0.y1 - 150), O(42, 46), { k: seg(lt, 0, 1) });
    const q = cnPart(lyrAt(t)).split(' ')[1] || '是谁的错', vk = seg(lt, d * .45, d * .45 + 1.0), vs = O(150, 124), c = R.T;
    if (vk > 0) { c.save(); c.fillStyle = R.tc; c.font = `${vs}px ${ZX.fCNB}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const ch = [...q], shown = Math.ceil(vk * ch.length);
      if (L) ch.forEach((x, i) => { if (i < shown) c.fillText(x, CX(), fy - 30 - (ch.length - 1 - i) * vs * 1.08); });
      else { c.font = `${vs * 1.25}px ${ZX.fCNB}`; c.textAlign = 'left'; const g = vs * .2; let w = 0; for (const q2 of ch) w += c.measureText(q2).width + g; let x = CX() - (w - g) / 2;
        ch.forEach((q2, i) => { if (i < shown) c.fillText(q2, x, V0.y0 + 360); x += c.measureText(q2).width + g; }); }
      c.restore(); }
  }
}
// print morph between posters: the old plate's dots shrink while the new plate's grow (figures stay put)
let TMP = null;
function chorusMorph(t, lt, inv, draw) {
  const MT = .9; if (lt >= MT || !SHOTS.length) return;
  const t0 = t - lt; let j = SHOTS.findIndex(s => abs(s[0] - t0) < 1e-6); if (j < 1) return; const prev = SHOTS[j - 1][1]; if (!prev.chorus) return;
  const A = X.A, B = X.B, W = A.canvas.width, H = A.canvas.height;
  if (!TMP || TMP[0].canvas.width !== W || TMP[0].canvas.height !== H) TMP = [0, 1].map(() => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv.getContext('2d'); });
  const tr = A.getTransform(); for (const q of TMP) { q.setTransform(1, 0, 0, 1, 0, 0); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; q.fillStyle = '#000'; q.fillRect(0, 0, W, H); q.setTransform(tr); }
  X.A = TMP[0]; X.B = TMP[1];
  try { chorusDensity(t, t - SHOTS[j - 1][0], t0 - SHOTS[j - 1][0], prev.chorus, inv); } finally { X.A = A; X.B = B; }
  const k = easeIO(lt / MT);
  for (const [dst, src] of [[A, TMP[0]], [B, TMP[1]]]) { dst.save(); dst.setTransform(1, 0, 0, 1, 0, 0); dst.globalAlpha = 1 - k; dst.fillStyle = '#000'; dst.fillRect(0, 0, W, H);
    dst.globalCompositeOperation = 'lighter'; dst.drawImage(src.canvas, 0, 0); dst.restore(); }
}
function chorusShot(kind, inv) { const f = (t, lt, d) => { X.mix = 1; X.noInfo = true; X.lyr = { mode: 'none' }; chorusDensity(t, lt, d, kind, inv); chorusMorph(t, lt, inv); }; f.chorus = kind; return f; }
const shotR1 = chorusShot('R1', false), shotR2 = chorusShot('R2', false), shotR3 = chorusShot('R3', false), shotR4 = chorusShot('R4', false),
  shotR5 = chorusShot('R5', false), shotR6 = chorusShot('R6', false), shotR7 = chorusShot('R7', false), shotR8 = chorusShot('R8', false);
const shotR1i = chorusShot('R1', true), shotR2i = chorusShot('R2', true), shotR3i = chorusShot('R3', true), shotR4i = chorusShot('R4', true),
  shotR5i = chorusShot('R5', true), shotR6i = chorusShot('R6', true), shotR7i = chorusShot('R7', true), shotR8i = chorusShot('R8', true);
