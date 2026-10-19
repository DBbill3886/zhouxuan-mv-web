/* props.js — live props: watercolour wash (pigment × baked granulation tile) + boiling ink. One style, one line weight family. */
'use strict';
const LW = { main: 4.2, thin: 2.4, hair: 1.5 };
// rounded rectangle path points
function rrP(x, y, w, h, r, n = 4) { const p = [], C = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * PI / 2; p.push([cx + cos(a) * r, cy + sin(a) * r]); } };
  C(x + w - r, y + r, -PI / 2); C(x + w - r, y + h - r, 0); C(x + r, y + h - r, PI / 2); C(x + r, y + r, PI); return p; }
const rotP = (P, cx, cy, a) => P.map(([x, y]) => [cx + (x - cx) * cos(a) - (y - cy) * sin(a), cy + (x - cx) * sin(a) + (y - cy) * cos(a)]);
const offP = (P, dx, dy, s = 1) => P.map(([x, y]) => [dx + x * s, dy + y * s]);
function shape(P, col, o = {}) { if (col) wash(P, col, o); if (o.line !== false) ink(P, o.lw ?? LW.thin, { col: o.lc || ZX.ink, closed: true, key: o.key, alpha: o.lineAlpha }); }
// film strip: horizontal (L) or vertical (P); frames drawn by content callbacks into clipped rects
function filmStrip(o) {
  // o: { cx, cy, fw, fh, pitch, n0, n1, off, content(i, w, h), vertical }
  const c = X.ctx, V = o.vertical, gap = o.pitch - (V ? o.fh : o.fw), edge = V ? 70 : 74;
  const stripCol = mixCol(ZX.paper, ZX.amberLt, .55);
  for (let i = o.n0; i <= o.n1; i++) {
    const fx = V ? o.cx - o.fw / 2 : o.cx - o.fw / 2 + (i - o.off) * o.pitch, fy = V ? o.cy - o.fh / 2 + (i - o.off) * o.pitch : o.cy - o.fh / 2;
    if (fx > X.VIS.x1 + 200 || fx + o.fw < X.VIS.x0 - 200 || fy > X.VIS.y1 + 200 || fy + o.fh < X.VIS.y0 - 200) continue;
    // strip body around this frame
    c.fillStyle = stripCol;
    if (V) c.fillRect(fx - edge, fy - gap / 2, o.fw + 2 * edge, o.fh + gap); else c.fillRect(fx - gap / 2, fy - edge, o.fw + gap, o.fh + 2 * edge);
    c.save(); c.beginPath(); c.rect(fx, fy, o.fw, o.fh); c.clip(); c.translate(fx, fy); o.content(i, o.fw, o.fh); c.restore();
    ink(rectP(fx, fy, o.fw, o.fh), 2.6, { closed: true, key: 'fr' + i, smooth: 0 });
    // sprocket holes
    const nh = Math.round((V ? o.fh + gap : o.fw + gap) / 49.5);
    for (let j = 0; j < nh; j++) for (const side of [0, 1]) {
      const hx = V ? (side ? fx + o.fw + 22 : fx - edge + 22) : fx - gap / 2 + j * 49.5 + 12, hy = V ? fy - gap / 2 + j * 49.5 + 12 : (side ? fy + o.fh + 22 : fy - edge + 22);
      const hp = rrP(hx, hy, V ? 30 : 26, V ? 26 : 30, 5, 2); c.fillStyle = ZX.paper; pathOf(c, hp, true); c.fill();
      ink(hp, 1.1, { col: '#8C6A45', closed: true, key: 'h' + i + j + side, smooth: 0, amp: .4 });
    }
    c.fillStyle = '#9A6A35'; c.font = `600 12px ${ZX.fUI}`; c.textBaseline = 'alphabetic';
    if (V) { c.save(); c.translate(fx - edge + 12, fy + 30); c.rotate(PI / 2); spaced(c, `ZX 5219  ▸ ${21 + i}A`, 0, 0, 3); c.restore(); }
    else spaced(c, `ZX 5219  ▸ ${21 + i}A`, fx - gap / 2 + 8, fy - 8, 3);
  }
}
function thermometer(x, y, h, level, s = 1) {
  const w = 34 * s, P = rrP(x - w / 2, y - h, w, h, w / 2, 5), bulb = ellP(x, y + w * .55, w * .95, w * .95, 28);
  wash(P, ZX.cream, { tex: .5 }); wash(bulb, ZX.coral, { tex: .7 });
  const lv = clamp(level), mh = (h - w) * lv; wash(rrP(x - w * .2, y - mh, w * .4, mh + w * .2, w * .2, 3), ZX.coral, { tex: .6, edge: 0 });
  ink(P, LW.thin * s, { closed: true, key: 'th' }); ink(bulb, LW.thin * s, { closed: true, key: 'tb' });
  for (let i = 1; i < 8; i++) ink(lineP(x + w / 2, y - h * i / 8, x + w / 2 + 12 * s, y - h * i / 8, 2), 1.6, { key: 'tt' + i });
}
function priceTag(x, y, rot, txt, s = 1) {
  const P = rotP(offP([[0, 0], [150, 0], [150, 92], [0, 92], [-36, 46]], x, y, s), x, y, rot);
  shape(P, ZX.cream, { key: 'tag', tex: .5 });
  const hp = rotP([[x - 12 * s, y + 46 * s]], x, y, rot)[0]; X.ctx.fillStyle = ZX.paper; X.ctx.beginPath(); X.ctx.arc(hp[0], hp[1], 8 * s, 0, TAU); X.ctx.fill();
  const c = X.ctx; c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = ZX.coral; c.font = `${44 * s}px ${ZX.fCNB}`; c.textBaseline = 'middle'; c.fillText(txt, 22 * s, 48 * s); c.restore();
  return hp;
}
function lamp(x, y, on, dim, s = 1, cordTop = -40) {
  ink([[x + 2, cordTop], [x + 1, (cordTop + y) / 2], [x, y - 8]], 1.6, { col: ZX.inkNight, key: 'cord' + x });
  const dome = []; for (let k = 0; k <= 12; k++) { const a = PI + k / 12 * PI; dome.push([x + cos(a) * 64 * s, y + 52 * s + sin(a) * 60 * s]); }
  wash(dome, on > .5 ? '#3B302C' : '#18202F', { tex: .5 }); ink(dome, 2, { col: ZX.inkNight, closed: true, key: 'dm' + x });
  const bulb = ellP(x, y + 54 * s, 58 * s, 9 * s, 18); wash(bulb, mixCol(mixCol('#232C3D', '#6E5A44', dim), '#F6E2B4', on), { tex: 0, edge: 0 });
  if (on > 0) { glow(x, y + 60 * s, 380 * s, '#FFB45E', .8 * on); glow(x, y + 56 * s, 110 * s, '#FFE2A8', on); }
  if (dim > 0) glow(x, y + 58 * s, 80 * s, '#C47A3A', .45 * dim);
}
function cloud(x, y, s, col, a = 1, key = 'cl') {   // glazed lobes (watercolour layering), flat-ish underside
  const L = [[-.62, .04, .42, .30], [-.24, -.20, .52, .42], [.22, -.16, .48, .38], [.6, .04, .40, .28], [0, .1, .95, .22]];
  L.forEach(([dx, dy, rx, ry], i) => { const P = []; for (let k = 0; k < 22; k++) { const q = k / 22 * TAU, w = 1 + .07 * sin(q * 3 + i + x * .01) + .04 * sin(q * 7 + i); P.push([x + dx * 160 * s + cos(q) * rx * 160 * s * w, y + dy * 160 * s + sin(q) * ry * 160 * s * w * (sin(q) > 0 ? .55 : 1)]); }
    wash(P, col, { alpha: a * .5, tex: .9, edge: .35, edgeW: 10 }); });
}
function rain(n, col, a, ang = .16, seed = 1, len = [26, 72], speed = 1400) {
  const c = X.ctx, V0 = X.VIS, Wd = V0.x1 - V0.x0 + 300, Hd = V0.y1 - V0.y0 + 200;
  c.save(); c.strokeStyle = col; c.globalAlpha *= a; c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const l = lerp(len[0], len[1], hash(i * 3.3 + seed)), sp = speed * (.8 + .4 * hash(i + seed));
    const x = V0.x0 - 150 + ((hash(i * 7.1 + seed) * Wd + X.t * sp * ang) % Wd), y = V0.y0 - 100 + ((hash(i * 1.7 + seed) * Hd + X.t * sp) % Hd);
    c.lineWidth = 1.2 + hash(i) * 1.1; c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * ang, y - l); c.stroke();
  }
  c.restore();
}
function ripple(x, y, r, a, key) { for (let j = 0; j < 2; j++) { const rr = r * (1 + j * .5), arc = []; for (let k = 0; k <= 16; k++) { const q = PI * (.06 + .88 * k / 16) + (j ? PI : 0); arc.push([x + cos(q) * rr, y + sin(q) * rr * .17]); } ink(arc, 1.5, { col: '#4A5058', key: key + j, alpha: a }); } }
function firework(x, y, age, col, s = 1, key = 'fw') {
  if (age < 0 || age > 2.4) return; const n = 22, R = 260 * s * easeOut(age / 1.1), fade = 1 - seg(age, 1.0, 2.4);
  for (let i = 0; i < n; i++) { const a = i / n * TAU + hash(i + x) * .2, r0 = R * .35, r1 = R * (.9 + .1 * hash(i)), dr = 30 * s * age * age;
    ink([[x + cos(a) * r0, y + sin(a) * r0 + dr * .3], [x + cos(a) * (r0 + r1) / 2, y + sin(a) * (r0 + r1) / 2 + dr * .6], [x + cos(a) * r1, y + sin(a) * r1 + dr]], 3 * s, { col, key: key + i, alpha: fade, taper: [.6, .1] }); }
  glow(x, y, R * 1.2, col, .55 * fade); glow(x, y, R * .4, '#FFE2A8', .5 * fade * (1 - seg(age, 0, .4)));
}
function chair(x, y, s, col = '#1A2131', lc = ZX.inkNight) {
  const seat = [[x - 90 * s, y], [x + 90 * s, y], [x + 80 * s, y + 26 * s], [x - 100 * s, y + 26 * s]];
  const back = [[x - 92 * s, y], [x - 80 * s, y - 230 * s], [x - 44 * s, y - 232 * s], [x - 58 * s, y]];
  shape(back, col, { lc, key: 'cb' }); shape(seat, col, { lc, key: 'cs' });
  for (const [a, b] of [[-92, -98], [72, 66]]) ink([[x + a * s, y + 26 * s], [x + (a + b) / 2 * s, y + 140 * s], [x + b * s, y + 250 * s]], 3, { col: lc, key: 'cl' + a });
}
function fish(x, y, a, s, col, key) { const P = rotP([[x + 60 * s, y], [x + 20 * s, y - 24 * s], [x - 34 * s, y - 14 * s], [x - 60 * s, y - 30 * s], [x - 52 * s, y], [x - 60 * s, y + 30 * s], [x - 34 * s, y + 14 * s], [x + 20 * s, y + 24 * s]], x, y, a);
  shape(P, col, { key, lw: 2.2 }); const e = rotP([[x + 34 * s, y - 6 * s]], x, y, a)[0]; X.ctx.fillStyle = ZX.ink; X.ctx.beginPath(); X.ctx.arc(e[0], e[1], 3.4 * s, 0, TAU); X.ctx.fill(); }
function hand(x, y, s, rot, col, lc) {   // open palm, mitten silhouette (no fingers), thumb out
  const P = rotP(offP([[-70, 120], [-80, 20], [-70, -80], [-40, -112], [10, -114], [52, -96], [70, -40], [72, 30], [112, -6], [140, -12], [130, 30], [80, 100], [50, 130]], x, y, s), x, y, rot);
  shape(P, col, { lc, key: 'hand', lw: 3 });
}
function paperBoat(x, y, s, rot, col = ZX.cream) {
  const hull = rotP(offP([[-130, 0], [130, 0], [90, 46], [-90, 46]], x, y, s), x, y, rot), sail = rotP(offP([[-60, 0], [0, -110], [60, 0]], x, y, s), x, y, rot);
  shape(sail, col, { key: 'bs' }); shape(hull, col, { key: 'bh' }); ink(rotP(offP([[-30, 18], [50, 18]], x, y, s), x, y, rot), 2, { col: ZX.coral, key: 'bl' });
}
