/* main.js — loop, audio-locked clock, cover layout (separate L/P logical frames), lyrics + info bar, UI. */
'use strict';
(function () {
const Q = new URLSearchParams(location.search), qp = k => Q.has(k) ? parseFloat(Q.get(k)) : null;
const out = document.getElementById('stage'), audio = document.getElementById('audio');
const mk = () => document.createElement('canvas');
const S = mk(), A = mk(), B = mk();
const sc = S.getContext('2d'), ac = A.getContext('2d'), bc = B.getContext('2d');
X.ctx = sc; X.A = ac; X.B = bc;
let hasGL = POST.init(out), fb2d = null;
if (!hasGL) { fb2d = out.getContext('2d'); }
// ---------------- layout ----------------
let V = {}, quality = Q.has('q') ? +Q.get('q') : 1;
function layout() {
  const w = innerWidth, h = innerHeight, portrait = h > w;
  const LW = portrait ? 1080 : 1920, LH = portrait ? 1920 : 1080, k = Math.max(w / LW, h / LH);
  const dpr = Math.min(window.devicePixelRatio || 1, 2) * quality, ox = (w - LW * k) / 2, oy = (h - LH * k) / 2;
  const bw = Math.round(w * dpr), bh = Math.round(h * dpr);
  V = { w, h, portrait, LW, LH, k, dpr, ox, oy, bw, bh };
  for (const c of [S, A, B, out]) if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
  out.style.width = w + 'px'; out.style.height = h + 'px';
  X.L = !portrait; X.LW = LW; X.LH = LH; X.k = k;
  X.VIS = { x0: -ox / k, y0: -oy / k, x1: (w - ox) / k, y1: (h - oy) / k };
  if (hasGL) POST.resize(bw, bh, k * dpr);
  document.body.classList.toggle('portrait', portrait);
}
// ---------------- lyrics & info ----------------
const HL = { '胶片': ZX.amber, '一盏一盏': ZX.amberLt, '发烧': ZX.coral, '韭菜': ZX.mist, '泥潭': '#8A6A48', '一半一半': ZX.amberLt, '电话': ZX.amberLt, '泥泞': '#8A6A48',
  '眼睛': ZX.coral, '烟花': ZX.coral, '相濡以沫': ZX.amberLt, '泡影': ZX.amberLt, '暴风雨': ZX.amberLt, '一眼万年': ZX.amberLt, '雨总会落下': ZX.coral, '一滴一滴': ZX.coral, '高音': ZX.coral, '倒影': ZX.coral };
function lineAt(t) { let i = -1; for (let j = 0; j < LYR.length; j++) if (LYR[j][0] <= t) i = j; return i; }
function splitLine(s, maxChars) {
  if ([...s].length <= maxChars) return [s];
  const sp = s.indexOf(' '); const ch = [...s];
  if (sp > 0 && sp < ch.length - 2) return [s.slice(0, sp), s.slice(sp + 1)];
  const m = Math.ceil(ch.length / 2); return [ch.slice(0, m).join(''), ch.slice(m).join('')];
}
function drawLyric(t) {
  const L = X.lyr || {}; if (L.mode === 'none') return;
  const i = lineAt(t); if (i < 0) return;
  const [t0, s] = LYR[i], t1 = i + 1 < LYR.length ? LYR[i + 1][0] : t0 + 4.5, end = Math.min(t1, t0 + (L.hold ?? 7.5));
  if (t > end + .02) return;
  const rap = L.mode === 'rap', a = clamp((t - t0) / .22) * (1 - seg(t, end - .25, end)) * (L.alpha ?? 1);
  if (a <= 0) return;
  const c = X.ctx, V0 = X.VIS, size = L.size || O(rap ? 36 : 42, rap ? 50 : 56), track = size * (rap ? .16 : .24);
  c.font = `${size}px ${ZX.fCN}`; c.textBaseline = 'alphabetic';
  const maxW = (V0.x1 - V0.x0) - O(180, 150), maxChars = Math.max(6, Math.floor(maxW / (size + track)));
  const lines = splitLine(s, maxChars), lh = size * 1.6;
  const x = L.x ?? (V0.x0 + O(96, 78)), yb = L.y ?? (V0.y1 - O(96, 250));
  const reveal = clamp((t - t0) / (rap ? .28 : .45));                      // characters print in
  const n = [...s].length; let shown = Math.ceil(reveal * n), idx = 0;
  lines.forEach((ln, li) => {
    const y = yb - (lines.length - 1 - li) * lh; let cx = L.align === 'center' ? (x - spacedW(c, ln, track) / 2) : x;
    for (const ch of [...ln]) {
      let col = L.col || (X.dark ? ZX.cream : ZX.ink);
      for (const k in HL) { const p = s.indexOf(k); if (p >= 0 && idx >= p && idx < p + k.length && !L.noHL) col = HL[k]; }
      c.globalAlpha = a * (idx < shown ? 1 : 0) * (rap ? .9 : .95); c.fillStyle = col; c.fillText(ch, cx, y); cx += c.measureText(ch).width + track; idx++;
    }
    if (ln.length && li < lines.length - 1 && s[idx] === ' ') idx++;
  });
  c.globalAlpha = 1;
}
const fmtTC = t => { const m = Math.floor(t / 60), s = t - m * 60; return String(m).padStart(2, '0') + ':' + s.toFixed(2).padStart(5, '0'); };
function chapterAt(t) { let ch = ''; for (const [ct, n] of CHAPTERS) if (t >= ct) ch = n; return ch; }
function infoBar(t, c, col, alpha) {
  if (X.noInfo) return;
  const V0 = X.VIS, M = O(70, 64), x0 = V0.x0 + M, x1 = V0.x1 - M, y = V0.y0 + O(70, 96), fs = O(15, 24);
  c.save(); c.fillStyle = col; c.globalAlpha = alpha; c.textBaseline = 'alphabetic';
  c.font = `600 ${fs}px ${ZX.fUI}`; spaced(c, 'ZHOU XUAN', x0, y, fs * .28);
  c.font = `${fs}px ${ZX.fCN}`; spaced(c, '周旋 · 王以太 / 艾热 AIR', x0, y + fs * 1.75, fs * .2);
  c.font = `${fs}px ${ZX.fCN}`; spaced(c, chapterAt(t), x1, y, fs * .25, 'right');
  c.font = `600 ${fs}px ${ZX.fUI}`; spaced(c, fmtTC(t), x1, y + fs * 1.75, fs * .2, 'right');
  c.restore();
}
// ---------------- render ----------------
function render(t) {
  X.t = t; X.bn = Math.floor(t * BOIL);
  const base = [V.k * V.dpr, 0, 0, V.k * V.dpr, V.ox * V.dpr, V.oy * V.dpr];
  for (const c of [sc, ac, bc]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  sc.fillStyle = ZX.paper; sc.fillRect(0, 0, V.bw, V.bh);
  ac.fillStyle = '#000'; ac.fillRect(0, 0, V.bw, V.bh); bc.fillStyle = '#000'; bc.fillRect(0, 0, V.bw, V.bh);
  for (const c of [sc, ac, bc]) c.setTransform(...base);
  X.mode = 'paint'; X.mix = 0; X.dark = false; X.lyr = {}; X.colA = ZX.mist; X.colB = ZX.coral; X.paper = ZX.paper; X.noInfo = false; X.mis = [6, -4]; X.infoInk = 'A';
  runShot(t);
  for (const c of [sc, ac, bc]) { c.setTransform(...base); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }
  if (X.mix < .999) { drawLyric(t); infoBar(t, sc, X.dark ? ZX.cream : ZX.ink, X.dark ? .6 : .72); }
  if (X.mix > .001) infoBar(t, X.infoInk === 'B' ? bc : ac, '#fff', 1);
  if (hasGL) POST.draw({ scene: S, A, B, mix: X.mix, cell: 8 * V.k * V.dpr, k: V.k * V.dpr, warp: 1.1 * V.k * V.dpr, boilN: X.bn, paper: X.paper, colA: X.colA, colB: X.colB, mis: X.mis });
  else { fb2d.setTransform(1, 0, 0, 1, 0, 0); fb2d.drawImage(S, 0, 0); }
}
// ---------------- clock ----------------
let dragT = null;
const clk = { t: qp('t') ?? 0, playing: false, aT: 0, aP: 0, lastA: -1, virtual: Q.has('auto') };
function now() {
  const p = performance.now();
  if (dragT !== null) return dragT;
  if (!clk.playing) return clk.t;
  if (clk.virtual) { clk.t = Math.min(clk.aT + (p - clk.aP) / 1000, DUR); return clk.t; }
  let est = clk.aT + (p - clk.aP) / 1000; const a = audio.currentTime;
  if (a !== clk.lastA) { clk.lastA = a; const err = a - est; if (Math.abs(err) > .25) { clk.aT = a; clk.aP = p; est = a; } else clk.aT += err * .12; }
  clk.t = Math.min(est, DUR); return clk.t;
}
// ---------------- UI ----------------
const $ = id => document.getElementById(id);
const startEl = $('start'), bar = $('bar'), prog = $('prog'), fill = $('fill'), knob = $('knob'), tcur = $('tcur'), tdur = $('tdur'), btn = $('play'), chap = $('chap');
const fmt = x => { x = Math.max(0, x | 0); return (x / 60 | 0) + ':' + String(x % 60).padStart(2, '0'); };
tdur.textContent = fmt(DUR);
for (const [ct, n] of CHAPTERS) { if (!ct) continue; const d = document.createElement('i'); d.className = 'tick'; d.style.left = (ct / DUR * 100) + '%'; d.title = n; prog.appendChild(d); }
function play() {
  if (clk.virtual) { clk.playing = true; clk.aT = clk.t; clk.aP = performance.now(); document.body.classList.add('playing'); return; }
  if (Math.abs(audio.currentTime - clk.t) > .3) audio.currentTime = clk.t;
  const p = audio.play(); clk.playing = true; clk.aT = audio.currentTime; clk.aP = performance.now();
  document.body.classList.add('playing'); if (p && p.catch) p.catch(() => { clk.playing = false; document.body.classList.remove('playing'); });
}
function pause() { clk.t = now(); if (!clk.virtual) audio.pause(); clk.playing = false; document.body.classList.remove('playing'); poke(); }
function toggle() { clk.playing ? pause() : play(); }
function seek(x) { x = clamp(x, 0, DUR - .05); if (!clk.virtual) { audio.currentTime = x; clk.lastA = -1; } clk.t = x; clk.aT = x; clk.aP = performance.now(); poke(); }
startEl.addEventListener('click', () => { if (!document.body.classList.contains('ready')) return; startEl.classList.add('gone'); document.body.classList.add('started'); play(); });
startEl.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') startEl.click(); });
btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
$('fs').addEventListener('click', e => { e.stopPropagation(); const d = document, el = d.documentElement;
  if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); });
$('replay').addEventListener('click', e => { e.stopPropagation(); document.body.classList.remove('ended'); seek(0); play(); });
audio.addEventListener('ended', () => { clk.playing = false; clk.t = DUR; document.body.classList.remove('playing'); document.body.classList.add('ended'); });
audio.addEventListener('pause', () => { if (clk.playing && !audio.ended) { clk.playing = false; clk.t = audio.currentTime; document.body.classList.remove('playing'); } });
audio.addEventListener('playing', () => { clk.aT = audio.currentTime; clk.aP = performance.now(); });
function posT(e) { const r = prog.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width) * DUR; }
prog.addEventListener('pointerdown', e => { e.stopPropagation(); prog.setPointerCapture(e.pointerId); dragT = posT(e); bar.classList.add('drag'); });
prog.addEventListener('pointermove', e => { if (dragT !== null) dragT = posT(e); });
const endDrag = () => { if (dragT === null) return; const x = dragT; dragT = null; bar.classList.remove('drag'); seek(x); };
prog.addEventListener('pointerup', endDrag); prog.addEventListener('pointercancel', endDrag);
let idle = 0; function poke() { idle = performance.now(); document.body.classList.remove('idle'); }
addEventListener('pointermove', poke); addEventListener('pointerdown', poke);
out.addEventListener('click', () => { if (document.body.classList.contains('started')) { toggle(); } });
addEventListener('keydown', e => { if (!document.body.classList.contains('started')) return;
  if (e.code === 'Space') { e.preventDefault(); toggle(); } else if (e.code === 'ArrowRight') seek(now() + 5); else if (e.code === 'ArrowLeft') seek(now() - 5); else if (e.key === 'f') $('fs').click(); });
addEventListener('resize', layout);
// ---------------- loop + adaptive resolution ----------------
let ema = 8, iema = 16.7, lastF = 0, lastQ = 0, frames = 0;
function tick() {
  const t = now(), p0 = performance.now();
  if (lastF && p0 - lastF < 250 && !document.hidden) iema = iema * .93 + (p0 - lastF) * .07; lastF = p0;
  render(t);
  const dt = performance.now() - p0; ema = ema * .95 + dt * .05;
  if ((frames++ & 3) === 0) { const f = t / DUR * 100; fill.style.width = f + '%'; knob.style.left = f + '%'; tcur.textContent = fmt(t); const ch = chapterAt(t); if (chap.textContent !== ch) chap.textContent = ch; }
  if (clk.playing && performance.now() - idle > 2800) document.body.classList.add('idle');
  const pn = performance.now();
  if (!Q.has('q') && pn - lastQ > 1500) {
    if ((ema > 12 || iema > 22) && quality > .5) { quality = Math.max(.5, quality * .85); iema = 16.7; layout(); lastQ = pn; }
    else if (ema < 6 && iema < 17.6 && quality < 1 && pn - lastQ > 6000) { quality = Math.min(1, quality / .85); layout(); lastQ = pn; }
  }
  if (!Q.has('still')) requestAnimationFrame(tick);
}
window.__render = t => render(t);
window.__bench = (t0, t1, n) => { const o = []; for (let i = 0; i < n; i++) { const p = performance.now(); render(t0 + (t1 - t0) * i / n); o.push(performance.now() - p); } return o; };
// ---------------- boot: fonts + assets ----------------
layout();
const PL = ['paper', 'amber', 'amberPlain', 'mud', 'night', 'dawn', 'sea', 'rain', 'rainDark'], SP = ['herSkin', 'herHair', 'herBody', 'himSkin', 'himHair', 'himBody', 'himBodyGray', 'herBodyGray'];
const jobs = [loadImg('tile', 'assets/tex/tile.webp').then(i => { TILE = i; })];
for (const p of PL) for (const o of ['L', 'P']) for (const v of [0, 1]) jobs.push(loadImg(`plate_${p}_${o}_${v}`, `assets/plates/${p}_${o}_${v}.webp`));
for (const s of SP) for (const v of [0, 1]) jobs.push(loadImg(`spr_${s}_${v}`, `assets/sprites/${s}_${v}.webp`));
const fonts = Promise.all([document.fonts.load(`40px ${ZX.fCN}`, '周旋'), document.fonts.load(`40px ${ZX.fCNB}`, '周旋'), document.fonts.load(`40px ${ZX.fD}`, 'HEART'), document.fonts.load(`600 20px ${ZX.fUI}`, 'ZHOU')]).catch(() => {});
let nDone = 0; jobs.forEach(j => j.then(() => { nDone++; const el = $('load'); if (el) el.textContent = `载入中 ${Math.round(nDone / jobs.length * 100)}%`; }));
Promise.all([Promise.race([fonts, new Promise(r => setTimeout(r, 4000))]), Promise.all(jobs)]).then(() => {
  document.body.classList.add('ready'); window.__ready = true;
  if (Q.has('t') || Q.has('auto')) { startEl.classList.add('gone'); document.body.classList.add('started'); if (Q.has('auto')) play(); }
  requestAnimationFrame(tick);
});
})();
