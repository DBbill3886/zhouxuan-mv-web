/* core.js — style system + drawing kernel for the live renderer (see STYLE_GUIDE.md).
   Everything is a pure function of t. Lines boil at 10 fps. Logical frame: L = 1920×1080, P = 1080×1920. */
'use strict';
const ZX = {
  paper: '#EEE6D4', ink: '#262833', amber: '#D2924A', coral: '#E0563F', mist: '#5C7FA8', night: '#26324A', rain: '#8C9196',
  amberLt: '#E8C08A', cream: '#F4EEE0', skin: '#F2E4C6', inkNight: '#10151F',
  fCN: '"ZXSong"', fCNB: '"ZXSongB"', fD: '"ZXDisp"', fUI: '"ZXUI"',
};
const BEAT = 60 / 123.05, BOFF = .085, BOIL = 10, TAU = Math.PI * 2;
const { sin, cos, abs, min, max, floor, sqrt, PI, hypot, atan2, pow, exp } = Math;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, k) => a + (b - a) * k;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - pow(1 - clamp(x), 3);
const easeIn = x => pow(clamp(x), 3);
const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2; };
const backOut = x => { x = clamp(x); const s = 1.7; return 1 + (s + 1) * pow(x - 1, 3) + s * pow(x - 1, 2); };
const seg = (t, a, b) => clamp((t - a) / (b - a));
const win = (t, a, b, f = .3) => seg(t, a, a + f) * (1 - seg(t, b - f, b));      // fade window
const hash = i => { const x = sin(i * 127.1 + 311.7) * 43758.5453; return x - floor(x); };
const hstr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
const beatOf = t => (t - BOFF) / BEAT;
const pulse = (t, k = 6) => exp(-((beatOf(t) % 1 + 1) % 1) * k);
const kf = (t, keys, e = ease) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) { const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a)); return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k); } return keys[keys.length - 1][1]; };
function mixCol(a, b, k) { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k))); return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1); }
const rgba = (h, a) => { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

// ---------- render state ----------
const X = { ctx: null, A: null, B: null, L: true, LW: 1920, LH: 1080, VIS: { x0: 0, y0: 0, x1: 1920, y1: 1080 }, t: 0, bn: 0, mode: 'paint', mix: 0, colA: ZX.mist, colB: ZX.coral, k: 1 };
const O = (l, p) => X.L ? l : p;                     // per-orientation value
const CX = () => X.LW / 2, CY = () => X.LH / 2;

// ---------- boil ----------
let BKEY = 0;
const boil = key => { BKEY = hstr(String(key)) * 1000; };
const jit = (i, a) => (hash(BKEY + i * 13.37 + X.bn * 7.13) - .5) * 2 * a;

// ---------- paths ----------
function pathOf(c, P, close = false) { c.beginPath(); for (let i = 0; i < P.length; i++) i ? c.lineTo(P[i][0], P[i][1]) : c.moveTo(P[i][0], P[i][1]); if (close) c.closePath(); }
const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const ellP = (cx, cy, rx, ry, n = 40, rot = 0) => { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + cos(a) * rx, cy + sin(a) * ry]); } return p; };
const lineP = (x0, y0, x1, y1, n = 6) => { const p = []; for (let i = 0; i <= n; i++) p.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); return p; };

// ---------- ink: tapered, boiling brush line ----------
// pts: control points; w: width in logical px; o: { col, key, taper:[a,b], closed, amp, smooth }
function ink(pts, w = 4, o = {}) {
  if (!pts || pts.length < 2) return;
  const c = o.ctx || X.ctx, key = o.key ?? (pts[0][0] * 7 + pts[0][1] * 13 + pts.length);
  boil(key);
  const amp = min(o.amp ?? (.5 + w * .07), 1.7);   // boil is a tremor, never a jump (thick strokes no longer jitter by 5–6 px)
  let P = pts.map((p, i) => [p[0] + jit(i * 2, amp), p[1] + jit(i * 2 + 1, amp)]);
  if (o.closed) { if (o.smooth !== 0) P = throughClosed(P, o.smooth ?? 5); } else if (o.smooth !== 0) P = through(P, o.smooth ?? 5);
  if (o.closed) P.push(P[0], P[1]);
  const n = P.length, ta = o.taper ?? [.35, .3], L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = P[max(0, i - 1)], b = P[min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = hypot(dx, dy) || 1, u = i / (n - 1);
    let k = o.closed ? 1 : min(1, ta[0] > 0 ? .25 + .75 * u / ta[0] : 1, ta[1] > 0 ? .2 + .8 * (1 - u) / ta[1] : 1);
    k *= .93 + .1 * hash(BKEY + i * .71 + X.bn);                      // pressure wobble (subtle: no width flicker)
    const hw = w * k / 2; L.push([P[i][0] - dy / d * hw, P[i][1] + dx / d * hw]); R.push([P[i][0] + dy / d * hw, P[i][1] - dx / d * hw]);
  }
  const ga = c.globalAlpha; c.fillStyle = o.col || ZX.ink; c.globalAlpha = ga * (o.alpha ?? 1);
  c.beginPath(); c.moveTo(L[0][0], L[0][1]); for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]); for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]); c.closePath(); c.fill();
  c.globalAlpha = ga;
}
// partial line (draw-on): k = 0..1 of the length
function inkPart(pts, k, w, o = {}) { if (k <= 0) return; const C = through(pts, 6), m = max(2, Math.round(C.length * clamp(k))); ink(C.slice(0, m), w, { ...o, smooth: 0, taper: o.taper ?? [.15, k < 1 ? 0 : .3] }); }

// ---------- live watercolour wash (for animated props): flat pigment × baked granulation tile + darker edge ----------
let TILE = null, TILEPAT = null;
function wash(P, col, o = {}) {
  const c = o.ctx || X.ctx; c.save(); pathOf(c, P, true); c.clip(); const ga = c.globalAlpha;
  c.globalAlpha = ga * (o.alpha ?? 1); c.fillStyle = col; c.fill();
  if (TILE && o.tex !== 0) {
    if (!TILEPAT) TILEPAT = c.createPattern(TILE, 'repeat');
    c.globalCompositeOperation = 'multiply'; c.globalAlpha = ga * (o.alpha ?? 1) * (o.tex ?? .9); c.fillStyle = TILEPAT;
    const s = o.ts ?? 1.2, ox = o.tx ?? hash(P.length + P[0][0]) * 500; c.save(); c.translate(ox, ox * .7); c.scale(s, s);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y); }
    c.fillRect((x0 - ox) / s - 2, (y0 - ox * .7) / s - 2, (x1 - x0) / s + 4, (y1 - y0) / s + 4); c.restore();
    c.globalCompositeOperation = 'source-over';
  }
  if (o.edge !== 0) { c.globalAlpha = ga * (o.alpha ?? 1) * (o.edge ?? .22); c.strokeStyle = o.edgeCol || mixCol(col, ZX.ink, .45); c.lineWidth = o.edgeW ?? 9; pathOf(c, P, true); c.stroke(); }
  c.restore();
}
// ---------- light (additive) ----------
const GLOW = {};
function glow(x, y, r, col = '#FFC766', a = 1) {
  if (a <= 0 || r < 1) return; const c = X.ctx;
  let g = GLOW[col]; if (!g) { g = document.createElement('canvas'); g.width = g.height = 128; const q = g.getContext('2d'), gr = q.createRadialGradient(64, 64, 0, 64, 64, 64);
    [[0, 1], [.2, .75], [.45, .3], [.75, .07], [1, 0]].forEach(([s, al]) => gr.addColorStop(s, rgba(col, al))); q.fillStyle = gr; q.fillRect(0, 0, 128, 128); GLOW[col] = g; }
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha *= clamp(a); c.drawImage(g, x - r, y - r, 2 * r, 2 * r); c.restore();
}
function lightCone(x, y, w0, w1, h, col, a) {
  const c = X.ctx; c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, rgba(col, .55 * a)); g.addColorStop(.5, rgba(col, .2 * a)); g.addColorStop(1, rgba(col, .04 * a));
  c.fillStyle = g; c.beginPath(); c.moveTo(x - w0 / 2, y); c.lineTo(x + w0 / 2, y); c.lineTo(x + w1 / 2, y + h); c.lineTo(x - w1 / 2, y + h); c.closePath(); c.fill(); c.restore();
}
function fillAll(col, a = 1, c = X.ctx) { c.save(); c.globalAlpha *= a; c.fillStyle = col; c.fillRect(X.VIS.x0 - 20, X.VIS.y0 - 20, X.VIS.x1 - X.VIS.x0 + 40, X.VIS.y1 - X.VIS.y0 + 40); c.restore(); }

// ---------- assets ----------
const IMG = {};
// images are fully decoded before start (no first-use decode stalls); a failed load retries once and never leaves a hole
function loadImg(name, src, retry = 1) { return new Promise(res => { const i = new Image(); i.decoding = 'async';
  i.onload = () => { const done = () => { IMG[name] = i; res(i); }; (i.decode ? i.decode() : Promise.resolve()).then(done, done); };
  i.onerror = () => retry > 0 ? loadImg(name, src + (src.includes('?') ? '&' : '?') + 'r=1', 0).then(res) : res(null); i.src = src; }); }
// watercolour boil without flicker: the two baked variants are never hard-swapped; v1 breathes in and out over v0 (smooth, ≤45 %)
const boilW = () => .45 * (.5 - .5 * cos(X.t * TAU / 1.7));
function drawBoiled(c, name, f) { const a = IMG[name + '_0'], b = IMG[name + '_1']; if (!a) return false; f(a, 1); const w = boilW(); if (b && w > .01) f(b, w); return true; }
// plates: 2 boil variants, cross-switched at 5 fps, per orientation
function plate(name, o = {}) {
  const key = `plate_${name}_${X.L ? 'L' : 'P'}`, im = IMG[key + '_0'], im1 = o.still ? null : IMG[key + '_1'];
  const c = X.ctx; if (!im) { fillAll(ZX.paper); return; }
  c.save(); c.globalAlpha *= o.alpha ?? 1;
  let z = o.zoom ?? 1, ox = o.x ?? 0, oy = o.y ?? 0; const W = X.LW, H = X.LH, V0 = X.VIS;
  // under a zoomed-out camera the frame is smaller than the view: cover the view instead
  if (V0.x0 < -W * .02 || V0.y0 < -H * .02 || V0.x1 > W * 1.02 || V0.y1 > H * 1.02) { const zz = max((V0.x1 - V0.x0) / W, (V0.y1 - V0.y0) / H) * 1.02; if (zz * 1 > z) z = zz; ox += (V0.x0 + V0.x1) / 2 - W / 2; oy += (V0.y0 + V0.y1) / 2 - H / 2; }
  // bleed so the cover crop never shows an edge
  const b = .04, R = [ox + W / 2 - W * (1 + b) * z / 2, oy + H / 2 - H * (1 + b) * z / 2, W * (1 + b) * z, H * (1 + b) * z];
  c.drawImage(im, ...R); const w = boilW(); if (im1 && w > .01) { c.globalAlpha *= w; c.drawImage(im1, ...R); } c.restore();
}

// ---------- type ----------
function spaced(c, txt, x, y, track, align = 'left') {
  const ch = [...txt], ws = ch.map(s => c.measureText(s).width), tw = ws.reduce((a, b) => a + b, 0) + track * (ch.length - 1);
  let cx = align === 'center' ? x - tw / 2 : align === 'right' ? x - tw : x; const a0 = c.textAlign; c.textAlign = 'left';
  ch.forEach((s, i) => { c.fillText(s, cx, y); cx += ws[i] + track; }); c.textAlign = a0; return tw;
}
const spacedW = (c, txt, track) => [...txt].reduce((a, s) => a + c.measureText(s).width, 0) + track * ([...txt].length - 1);
function vertical(c, txt, x, y, size, lead = 1.25) { c.textAlign = 'center'; c.textBaseline = 'top'; [...txt].forEach((ch, i) => c.fillText(ch, x, y + i * size * lead)); c.textAlign = 'left'; }
// word set to exact cap height h and exact width w (display face)
function fitWord(c, txt, x, base, w, h, font = ZX.fD) {
  c.font = `100px ${font}`; const k = h / (c.measureText('H').actualBoundingBoxAscent || 72);
  c.font = `${100 * k}px ${font}`; c.textBaseline = 'alphabetic'; const m = c.measureText(txt), mw = m.actualBoundingBoxRight + m.actualBoundingBoxLeft;
  c.save(); c.translate(x, base); c.scale(w / mw, 1); c.textAlign = 'left'; c.fillText(txt, m.actualBoundingBoxLeft, 0); c.restore();
}
