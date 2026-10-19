/* shots_chorus.js — the two choruses as two-colour Riso posters (density layers A = MIST, B = CORAL; white = ink).
   Chorus 1 (1:26–1:58) prints type in MIST with the two of them in CORAL.  Chorus 2 (3:23–3:55) is the same poster INVERTED:
   a solid CORAL field with the type knocked out to paper and the figures overprinted in MIST.
   Bridges inside the chorus: the figures orbit from R1 back to their places (R2→R3); the last spike = the strike-through bar (R3→R4);
   the speech bubble = the first coin (R4→R5); coins drop into the receipt (R5→R6); the receipt's tear line = the ECG trace (R6→R7);
   the flat trace = the floor they stand on, back to back (R7→R8). */
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
  const P = R1POS(), mx = (P.her[0] + P.him[0]) / 2, my = (P.her[1] + P.him[1]) / 2, rx = (P.him[0] - P.her[0]) / 2, ry = O(70, 240);
  const dz = sin(th);
  return { her: [mx - cos(th) * rx, my + (X.L ? sin(th) * ry * .6 : -sin(th) * ry), P.her[2] * (1 - .14 * dz), cos(th)], him: [mx + cos(th) * rx, my - (X.L ? sin(th) * ry * .6 : -sin(th) * ry), P.him[2] * (1 + .14 * dz), -cos(th)], front: dz > 0 ? 'him' : 'her' };
}
const R8POS = () => { const fy = O(820, 1350), s = O(220, 230); return { floor: fy, her: [CX() - O(340, 270), fy - s * 3.2, s], him: [CX() + O(340, 270), fy - s * 1.05 * 3.2, s * 1.05] }; };
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
    else { const c2 = 230; rRow(R, 'HEART', x0, V0.y0 + 150 + c2, rowW, c2, k1); rRow(R, 'BREAKER', x0, V0.y0 + 170 + 2 * c2 + 10, rowW, c2 * .7, k1); rRow(R, 'SUN', x0, V0.y1 - 230 - c2 * .7 - 20, rowW, c2 * .7, k2); rRow(R, 'DOWNER', x0, V0.y1 - 230, rowW, c2, k2); }
    twoFigs(R, 0);
    rCN(R, midLines(t), x0, L ? midY - 38 : midY + 40, O(50, 56), { k: seg(lt, 0, .5) }); rMeta(R, t, tcLabel(t, tag));
  }
  else if (kind === 'R2') {   // 周旋 — they circle each other; the title rows run as a marquee
    const th = TAU * easeIO(seg(lt, .2, d - .25)), sc = (t - (t - lt)) * O(170, 120);
    const marquee = (txt, base, h, dir) => { const c = R.T; c.save(); c.fillStyle = R.tc; c.font = `${h * 1.36}px ${ZX.fD}`; c.textBaseline = 'alphabetic'; const unit = c.measureText(txt + '  ·  ').width; let x = V0.x0 - ((dir * sc) % unit + unit) % unit - unit; while (x < V0.x1) { c.fillText(txt + '  ·  ', x, base); x += unit; } c.restore(); };
    const ch = O(250, 200); marquee('HEARTBREAKER', O(M + ch, V0.y0 + 150 + ch), ch, 1); marquee('SUNDOWNER', O(H - M, V0.y1 - 230), ch, -1);
    // the orbit line (dotted)
    const P = R1POS(), mx = (P.her[0] + P.him[0]) / 2, my = (P.her[1] + P.him[1]) / 2 + O(320, 480), rx = (P.him[0] - P.her[0]) / 2 + 40;
    const c = R.P; c.save(); c.fillStyle = R.pc; for (let i = 0; i < 64; i++) { const a = i / 64 * TAU + lt * .6; c.globalAlpha = .9; c.beginPath(); c.arc(mx + cos(a) * rx * 1.25, my + sin(a) * O(60, 120), 5, 0, TAU); c.fill(); } c.restore();
    twoFigs(R, th);
    const lines = ['多希望是你', '周旋着我妥协着'], k = seg(t, inv ? 204.9 : 88.14, (inv ? 204.9 : 88.14) + 1.2), k2 = inv ? seg(t, 208.86, 209.8) : 1;
    rCN(R, [lines[0]], x0, L ? midY - 38 : midY + 40, O(50, 56), { k }); if (k2 > 0) rCN(R, [lines[1]], x0, L ? midY + 38 : midY + 124, O(50, 56), { k: inv ? k2 : k }); rMeta(R, t, tcLabel(t, tag));
  }
  else if (kind === 'R3') {   // 言语刺骨 · 手冰冷 — spikes from her lips; he freezes into the other colour
    const P = R1POS(), c = R.T;
    c.save(); c.fillStyle = R.tc; c.font = `${O(560, 600)}px ${ZX.fCNB}`; c.textBaseline = 'alphabetic'; c.textAlign = 'center';
    if (L) { c.fillText('刺', 480, 760); c.fillText('骨', 1440, 760); } else { c.fillText('刺', 540, V0.y0 + 760); c.fillText('骨', 540, V0.y1 - 300); } c.restore();
    const freeze = easeIO(seg(lt, d * .62, d * .62 + 1.2));
    rFig(R, 'her', P.her[0], P.her[1], P.her[2], 1);
    // him: CORAL → MIST from the hands up (cold)
    const yF = P.him[1] + P.him[2] * 3.3 - freeze * P.him[2] * 3.9;
    for (const [ctx, part] of [[R.F, 0], [inv ? X.B : X.A, 1]]) { ctx.save(); ctx.beginPath(); if (part === 0) ctx.rect(V0.x0, V0.y0 - 50, V0.x1 - V0.x0, yF - V0.y0 + 50); else ctx.rect(V0.x0, yF, V0.x1 - V0.x0, V0.y1 - yF + 50); ctx.clip();
      figFlat(ctx, { who: 'him', x: P.him[0], y: P.him[1], s: P.him[2], dir: -1, fill: inv && part ? '#000' : figGrad(ctx, P.him[1] - P.him[2] * .5, P.him[1] + P.him[2] * 3.2), irisFill: inv && part ? '#fff' : undefined }); ctx.restore(); }
    // spikes: one per beat, flying from her lips to him
    const lip = [P.her[0] + P.her[2] * .36, P.her[1] + P.her[2] * .3], tgt = [P.him[0] - P.him[2] * .3, P.him[1] + P.him[2] * .25];
    const b0 = beatOf(t - lt + .3);
    for (let i = 0; i < 9; i++) { const ts = (Math.ceil(b0) + i) * BEAT + BOFF, age = t - ts; if (age < 0) continue;
      const u = easeOut(clamp(age / .5)), hy = (hash(i * 3) - .5) * P.her[2] * .5, x = lerp(lip[0], tgt[0], u), y = lerp(lip[1], tgt[1] + hy, u), len = O(110, 90) * (1 - .3 * u), w = O(16, 14);
      const p = R.P; p.save(); p.fillStyle = R.pc; p.beginPath(); p.moveTo(x + len * .5, y); p.lineTo(x - len * .5, y - w); p.lineTo(x - len * .5, y + w); p.closePath(); p.fill(); p.restore(); }
    // the last spike lengthens into a bar (bridge to R4)
    const bar = easeIO(seg(lt, d - .55, d)); if (bar > 0) { const p = R.P, y = O(560, 1000); p.save(); p.fillStyle = R.pc; p.fillRect(lerp(tgt[0] - 60, V0.x0 + M, bar), y - O(22, 20), lerp(120, rowW, bar), O(44, 40)); p.restore(); }
    rCN(R, midLines(t), x0, O(midY + 300, V0.y1 - 150), O(46, 52), { ctx: R.T, k: seg(t, t - lt + .1, t - lt + 1) });
  }
  else if (kind === 'R4') {   // 同情, struck through; a speech bubble from her lips holds it
    const c = R.T, P = R1POS(), y = O(560, 1000);
    c.save(); c.fillStyle = R.tc; c.font = `${O(600, 350)}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText('同情', CX(), y + O(20, 10)); c.restore();
    twoFigs(R, 0, { lo: .3 });
    const p = R.P; p.save(); p.fillStyle = R.pc; const bw = O(44, 40) * (1 + .15 * pulse(t, 8)); p.fillRect(V0.x0 + M, y - bw / 2, rowW, bw); p.restore();
    // bubble (outline + small type) — grows from her lips
    const k = backOut(seg(lt, .4, 1.1)), bx = P.her[0] + P.her[2] * .9, by = P.her[1] - P.her[2] * .7, br = O(130, 120) * k * (1 - easeIn(seg(lt, d - .5, d)) * .55);
    if (k > 0) { p.save(); p.fillStyle = R.pc; p.beginPath(); p.arc(bx, by, br, 0, TAU); p.arc(bx, by, max(0, br - 10), 0, TAU, true); p.fill();
      p.beginPath(); p.moveTo(bx - br * .5, by + br * .8); p.lineTo(P.her[0] + P.her[2] * .4, P.her[1] + P.her[2] * .25); p.lineTo(bx - br * .1, by + br * .95); p.fill();
      const sh = 1 - seg(lt, d - .5, d); p.font = `${br * .55}px ${ZX.fCNB}`; p.textAlign = 'center'; p.textBaseline = 'middle'; p.globalAlpha = sh; p.fillText('谢谢', bx, by); p.restore(); }
    rCN(R, midLines(t), x0, O(V0.y1 - 120, V0.y1 - 150), O(46, 52), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R5') {   // GOLD DIGGER / MINDSEEKER; coins rain on her
    if (L) { rRow(R, 'GOLD DIGGER', x0, M + CAP, rowW, CAP); rRow(R, 'MINDSEEKER', x0, H - M, rowW, CAP); }
    else { const c2 = 210; rRow(R, 'GOLD', x0, V0.y0 + 150 + c2, rowW, c2); rRow(R, 'DIGGER', x0, V0.y0 + 170 + c2 * 1.75, rowW, c2 * .7); rRow(R, 'MIND', x0, V0.y1 - 230 - c2 * .75, rowW, c2 * .7); rRow(R, 'SEEKER', x0, V0.y1 - 230, rowW, c2); }
    const P = R1POS(); rFig(R, 'her', O(860, 430), O(380, 640), O(420, 270), 1, { lo: .15 });
    const p = R.P, P4 = R1POS(), bx = P4.her[0] + P4.her[2] * .9, by = P4.her[1] - P4.her[2] * .7;
    for (let i = 0; i < 26; i++) { const st = i * .14, age = lt - st; if (age < 0) continue; const first = i === 0;
      const x = first ? lerp(bx, bx, 0) : V0.x0 + hash(i * 7.3) * (V0.x1 - V0.x0), y = (first ? by : V0.y0 - 80) + age * age * 520 + age * 120, r = O(34, 32) * (first ? lerp(2.2, 1, clamp(age * 2)) : (.8 + .4 * hash(i)));
      if (y > V0.y1 + 60) continue; p.save(); p.fillStyle = R.pc; p.beginPath(); p.ellipse(x, y, r * abs(cos(age * 5 + i)) + 3, r, 0, 0, TAU); p.fill();
      p.fillStyle = '#000'; p.font = `${r * 1.1}px ${ZX.fCNB}`; p.textAlign = 'center'; p.textBaseline = 'middle'; if (abs(cos(age * 5 + i)) > .5) p.fillText('¥', x, y + 2); p.restore(); }
    rCN(R, midLines(t), x0, O(midY - 38, midY + 60), O(50, 56), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R6') {   // 索取着 罗列着 — a receipt keeps printing
    const c = R.T; c.save(); c.fillStyle = R.tc; c.font = `${O(400, 360)}px ${ZX.fCNB}`; c.textBaseline = 'alphabetic';
    if (L) { c.fillText('索取', V0.x0 + M - 10, 420); c.textAlign = 'right'; c.fillText('罗列', V0.x1 - M + 10, H - M); } else { c.textAlign = 'center'; c.fillText('索取', 540, V0.y0 + 520); c.fillText('罗列', 540, V0.y1 - 220); } c.restore();
    rFig(R, 'him', O(1460, 760), O(330, 760), O(330, 300), -1, { lo: .25 });
    // receipt (tone strip with solid text), scrolling up
    const p = R.P, rw = O(380, 420), rx = O(760, 300), top = V0.y0 - 20, scroll = lt * O(120, 150), rh = O(700, 980) + scroll;
    p.save(); p.fillStyle = 'rgba(255,255,255,.28)'; p.beginPath(); p.moveTo(rx, top); p.lineTo(rx + rw, top); p.lineTo(rx + rw, top + rh);
    for (let i = 12; i >= 0; i--) p.lineTo(rx + rw * i / 12, top + rh + (i % 2 ? 16 : 0)); p.closePath(); p.fill();
    p.fillStyle = R.pc; p.font = `${O(28, 30)}px ${ZX.fCNB}`; p.textBaseline = 'middle';
    const items = ['索取 · 时间', '索取 · 耐心', '罗列 · 旧账', '罗列 · 缺点', '索取 · 回应', '罗列 · 理由', '索取 · 证明', '罗列 · 下一次'];
    items.forEach((it, i) => { const y = top + rh - O(560, 760) + i * O(64, 80) - 0; if (y < top + 20 || y > top + rh - 40) return; p.fillText(it, rx + 26, y); p.textAlign = 'right'; p.fillText('¥ —', rx + rw - 26, y); p.textAlign = 'left'; });
    p.restore();
    // tear line along the bottom = the next shot's trace
    rCN(R, midLines(t), x0, O(V0.y1 - 150, V0.y1 - 120), O(46, 52), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R7') {   // 兴奋 — an ECG that beats, then flattens; the type loses its ink
    const flat = easeIO(seg(lt, d * .45, d * .45 + 1.4)), c = R.T;
    c.save(); c.fillStyle = R.tc; c.globalAlpha = lerp(1, .32, flat); c.font = `${O(640, 520)}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText(L ? '兴奋' : '兴', CX(), O(560, V0.y0 + 560)); if (!L) c.fillText('奋', CX(), V0.y1 - 520); c.restore();
    const p = R.P, y = O(600, 980), w = O(9, 10); p.save(); p.strokeStyle = R.pc; p.lineWidth = w; p.lineJoin = 'round'; p.lineCap = 'round'; p.beginPath();
    const head = V0.x0 + ((lt * O(900, 700)) % (V0.x1 - V0.x0 + 400)) - 200;
    for (let x = V0.x0 - 20; x <= V0.x1 + 20; x += 6) { const b = (x - V0.x0) / O(380, 300); const ph = b - floor(b); let v = 0;
      if (ph > .4 && ph < .48) v = -1; else if (ph >= .48 && ph < .55) v = .55; else if (ph >= .55 && ph < .6) v = -.2;
      const yy = y + v * O(220, 200) * (1 - flat); x === V0.x0 - 20 ? p.moveTo(x, yy) : p.lineTo(x, yy); }
    p.stroke(); p.restore();
    rFig(R, 'her', O(260, 200), O(330, 1380), O(260, 240), 1, { lo: .3 });
    rCN(R, midLines(t), x0, O(V0.y1 - 120, V0.y1 - 150), O(46, 52), { k: seg(lt, 0, 1) });
  }
  else if (kind === 'R8') {   // 是谁的错 — back to back on the flat line; a big question mark
    const p = R.P, y = O(600, 980), fy = O(820, 1350), k = easeIO(seg(lt, 0, 1)), floorY = lerp(y, fy, k);
    p.save(); p.fillStyle = R.pc; p.fillRect(V0.x0 - 20, floorY - 5, V0.x1 - V0.x0 + 40, 10); p.restore();
    const c = R.T; c.save(); c.fillStyle = R.tc; c.font = `${O(900, 900)}px ${ZX.fD}`; c.textBaseline = 'alphabetic'; c.textAlign = 'center'; const qk = backOut(seg(lt, .8, 1.5));
    c.translate(CX(), O(800, 1250)); c.scale(qk, qk); c.fillText('?', 0, 0); c.restore();
    // back to back (her faces left, him faces right)
    const s = O(220, 230), up = (1 - k) * 200, B8 = R8POS();
    rFig(R, 'her', B8.her[0], B8.her[1] + up, B8.her[2], -1); rFig(R, 'him', B8.him[0], B8.him[1] + up, B8.him[2], 1);
    rCN(R, [cnPart(lyrAt(t)).split(' ')[0]], x0, O(V0.y1 - 110, V0.y1 - 150), O(42, 46), { k: seg(lt, 0, 1) });
    const q = cnPart(lyrAt(t)).split(' ')[1]; if (q && lt > d * .5) rCN(R, [q], V0.x1 - M, O(V0.y0 + 200, V0.y0 + 260), O(64, 70), { align: 'right', k: seg(lt, d * .5, d * .5 + .5) });
  }
}
function chorusShot(kind, inv) { return (t, lt, d) => { X.mix = 1; X.noInfo = true; X.lyr = { mode: 'none' }; chorusDensity(t, lt, d, kind, inv); }; }
const shotR1 = chorusShot('R1', false), shotR2 = chorusShot('R2', false), shotR3 = chorusShot('R3', false), shotR4 = chorusShot('R4', false),
  shotR5 = chorusShot('R5', false), shotR6 = chorusShot('R6', false), shotR7 = chorusShot('R7', false), shotR8 = chorusShot('R8', false);
const shotR1i = chorusShot('R1', true), shotR2i = chorusShot('R2', true), shotR3i = chorusShot('R3', true), shotR4i = chorusShot('R4', true),
  shotR5i = chorusShot('R5', true), shotR6i = chorusShot('R6', true), shotR7i = chorusShot('R7', true), shotR8i = chorusShot('R8', true);
