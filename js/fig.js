/* fig.js — the two characters live: baked watercolour sprites (skin / body / hair) + live boiling ink lines.
   Same geometry as the baker (geo.js) and the Riso silhouettes (figFlat). Eyes are OPEN: upper lid, lower lid, iris. */
'use strict';
const TINT = {};
function sprite(name, tint) {
  const v = 0, base = IMG[`spr_${name}_0`]; if (!base) return null;   // paint holds still; the ink lines carry the boil (no 5 fps sprite swap)
  if (typeof tint === 'string') tint = { col: tint, a: .32 };
  if (!tint || !tint.a) return base;
  const key = `${name}${v}${tint.col}${tint.a}`; let cv = TINT[key];
  if (!cv) { cv = document.createElement('canvas'); cv.width = base.width; cv.height = base.height; const q = cv.getContext('2d'); q.drawImage(base, 0, 0);
    q.globalCompositeOperation = 'source-atop'; q.globalAlpha = tint.a; q.fillStyle = tint.col; q.fillRect(0, 0, cv.width, cv.height); TINT[key] = cv; }
  return cv;
}
function drawSprite(name, part, m, tint, alpha = 1) {
  const im = sprite(name, tint); if (!im) return; const [bx, by, bw, bh] = SPR_BOX[part], c = X.ctx;
  c.save(); c.transform(m[0], m[1], m[2], m[3], m[4], m[5]); c.globalAlpha *= alpha; c.drawImage(im, bx, by, bw, bh); c.restore();
}
// o: { who, x, y, s, dir, tilt, bodyTilt, body (sprite name), tint {col,a}, lc (line colour), blink, look, brow, alpha, noBody, lineOnly }
function figure(o) {
  const G = FIG[o.who], s = o.s, dir = o.dir ?? 1, mh = figMatrix(o.x, o.y, s, dir, o.tilt || 0), mb = figMatrix(o.x, o.y, s, dir, o.bodyTilt || 0);
  const lc = o.lc || ZX.ink, w = s * (o.lw ?? .017), A = o.alpha ?? 1, k = o.who + (o.key || '');
  const H = P => P.map(p => mApply(mh, p)), B = P => P.map(p => mApply(mb, p));
  const sk = o.who === 'her' ? 'herSkin' : 'himSkin', hr = o.who === 'her' ? 'herHair' : 'himHair', bd = o.body || (o.who === 'her' ? 'herBody' : 'himBody');
  // Figure language (pass 5, after Malika Favre's negative-space faces + Tatsuro Kiuchi's quiet flat figures):
  // no black outline round the face — the profile is the edge of the skin wash; a crisp darker-skin shadow shape under the jaw
  // and down the neck carries the form; hair is the big graphic shape with one cool sheen; clothes are flat, folds in a darker cloth tone.
  const c = X.ctx, BCOL = { herBody: ZX.coral, himBody: '#3A3D4A', himBodyGray: '#5E646B', herBodyGray: '#B9675A' }[bd] || '#3A3D4A';
  const SH = o.who === 'her' ? '#D9A988' : '#C99A7C', EDGE = '#9C6A50', cloth = mixCol(BCOL, ZX.ink, .55);
  const inSkin = fn => { c.save(); pathOf(c, H(throughClosed(skinPoly(G), 4)), true); c.clip(); fn(); c.restore(); };
  if (!o.noBody && o.full) legs(o, G, mb, BCOL, A);
  if (!o.lineOnly) drawSprite(sk, 'skin', mh, o.skinTint || o.tint, A);
  if (!o.lineOnly) inSkin(() => {
    c.globalAlpha *= A * .78; c.fillStyle = SH; pathOf(c, H(through(G.shade, 4)), true); c.fill();
    const [cx, cy, cr] = G.cheek, q = mApply(mh, [cx, cy]); c.globalAlpha = A * (o.who === 'her' ? .22 : .12);
    const gr = c.createRadialGradient(q[0], q[1], 0, q[0], q[1], cr * s); gr.addColorStop(0, ZX.coral); gr.addColorStop(1, 'rgba(240,120,100,0)'); c.fillStyle = gr; c.fillRect(q[0] - cr * s, q[1] - cr * s, cr * s * 2, cr * s * 2);
  });
  if (!o.noBody) {
    if (!o.lineOnly) drawSprite(bd, 'body', mb, o.tint, A);
    if (G.shirt && !o.lineOnly) { c.save(); c.globalAlpha *= A * .92; c.fillStyle = '#EDE3CF'; pathOf(c, B(through(G.shirt, 3)), true); c.fill(); c.restore(); }
    const BO = throughClosed(G.body, 4).filter(p => p[1] < 3.6), lcB = o.lineOnly ? lc : cloth;
    ink(B(BO), w * .55, { col: lcB, key: k + 'body', smooth: 0, taper: [.05, .05], alpha: A * .8 });
    ink(B(G.seam), w * .4, { col: lcB, key: k + 'seam', alpha: A * .7 });
    if (G.lapel) ink(B(G.lapel), w * .45, { col: o.lineOnly ? lc : mixCol(BCOL, '#EDE3CF', .3), key: k + 'lapel', alpha: A * .8 });
    ink(B(G.collar), w * .5, { col: lcB, key: k + 'collar', alpha: A * .8 });
  }
  if (!o.lineOnly) drawSprite(hr, 'hair', mh, o.hairTint, A);
  if (G.sheen && !o.lineOnly) { c.save(); pathOf(c, H(throughClosed(G.hair, 4)), true); c.clip(); c.globalAlpha *= A * .38; c.fillStyle = '#8FA3C4'; pathOf(c, H(through(G.sheen, 4)), true); c.fill(); c.restore(); }
  // the profile: a thin warm edge (forehead → chin only), never a black contour
  const FE = G.face.filter(p => p[1] < .95);
  ink(H(FE), w * (o.lineOnly ? 1 : .42), { col: o.lineOnly ? lc : EDGE, key: k + 'face', alpha: A * (o.lineOnly ? 1 : .55), smooth: 4, taper: [.3, .4] });
  if (o.lineOnly) ink(H(G.neckBack), w * .8, { col: lc, key: k + 'nb', alpha: A });
  if (G.ear) { if (!o.lineOnly) { c.save(); c.globalAlpha *= A * .7; c.fillStyle = SH; pathOf(c, H(through(G.ear, 4)), true); c.fill(); c.restore(); }
    ink(H(G.ear.slice(1, 4)), w * .35, { col: EDGE, key: k + 'ear', alpha: A * .6 }); }
  if (G.lipShape && !o.lineOnly) { c.save(); c.globalAlpha *= A * .9; c.fillStyle = '#D9574A'; pathOf(c, H(throughClosed(G.lipShape, 3)), true); c.fill(); c.restore(); }
  if (G.mouth) ink(H(G.mouth), w * .5, { col: EDGE, key: k + "mouth", alpha: A * .9, taper: [.3, .6] });
  // eyes (open). blink 0 = open, 1 = shut; look shifts the iris along the lid
  const bl = clamp(o.blink || 0), U = G.eyeU, Lo = G.eyeL, a = U[0], b = U[U.length - 1];
  const lid = U.map((p, i) => { const q = i / (U.length - 1), base = [lerp(a[0], b[0], q), lerp(a[1], b[1], q) + .012]; return [lerp(p[0], base[0], bl), lerp(p[1], base[1], bl)]; });
  const brow = G.brow.map(([x, y], i) => [x, y - (o.brow || 0) * (i === 0 ? .01 : i === 1 ? .025 : .02)]);
  ink(H(brow), w * .5, { col: lc, key: k + 'brow', alpha: A * .85 });
  if (bl < .7) {
    const [ix, iy, ir] = G.iris, lx = (o.look || 0) * .015, c = X.ctx, P = mApply(mh, [ix + lx, iy + bl * .01]);
    c.save(); c.fillStyle = lc; c.globalAlpha *= A * (1 - bl / .7); c.beginPath(); c.arc(P[0], P[1], ir * s * (1 - bl * .5), 0, TAU); c.fill(); c.restore();
    ink(H(Lo), w * .42, { col: lc, key: k + 'eyeL', alpha: A * (1 - bl) * .9 });
  }
  ink(H(lid), w * .78, { col: lc, key: k + 'eyeU', alpha: A, taper: [.2, .35] });
  if (G.lashes && bl < .5) G.lashes.forEach((P, i) => ink(H(P), w * .32, { col: lc, key: k + 'lash' + i, alpha: A * (1 - bl * 2), taper: [.1, .9], smooth: 0 }));
  return { mh, mb, pt: p => mApply(mh, p) };
}
// Riso silhouette into a density context (white = ink). Eye knocked out (paper) with the iris left in ink.
function figFlat(c, o) {
  const G = FIG[o.who], m = figMatrix(o.x, o.y, o.s, o.dir ?? 1, o.tilt || 0), mb = figMatrix(o.x, o.y, o.s, o.dir ?? 1, o.bodyTilt || 0);
  const T = (P, mm) => P.map(p => mApply(mm || m, p));
  c.fillStyle = o.fill;
  if (!o.noBody) { pathOf(c, T(throughClosed(G.body, 5), mb), true); c.fill(); }
  pathOf(c, T(throughClosed(skinPoly(G), 5)), true); c.fill();
  pathOf(c, T(throughClosed(G.hair, 5)), true); c.fill();
  if (o.eye !== false) {
    const eye = [...through(G.eyeU, 4), ...through(G.eyeL, 4).reverse()], s = o.s;
    c.save(); c.fillStyle = '#000'; pathOf(c, T(eye), true); c.fill();
    const [ix, iy, ir] = G.iris, P = mApply(m, [ix, iy]); c.fillStyle = o.irisFill || '#fff'; c.beginPath(); c.arc(P[0], P[1], ir * s * 1.05, 0, TAU); c.fill();
    c.strokeStyle = '#000'; c.lineWidth = max(2, s * .008); c.lineCap = 'round'; pathOf(c, T(through(G.brow, 4))); c.stroke(); c.restore();
  }
}

// full-figure shots: long flat legs below the body sprite (8-head proportion), feet small; coat/skirt hem as a flat shape
function legs(o, G, mb, col, A) {
  const c = X.ctx, B = P => P.map(p => mApply(mb, p)), her = o.who === 'her', dark = mixCol(col, ZX.ink, .55);
  const L = her ? [[[-.12,3.55],[.22,3.55],[.20,5.4],[.16,7.0],[.24,7.18],[.04,7.18],[.02,5.4]], [[.26,3.55],[.62,3.55],[.52,5.4],[.50,7.0],[.60,7.18],[.38,7.18],[.36,5.4]]]
                : [[[-.42,3.55],[.20,3.55],[.12,5.4],[.10,7.05],[.26,7.22],[-.08,7.22],[-.14,5.4]], [[.24,3.55],[.86,3.55],[.66,5.4],[.62,7.05],[.80,7.22],[.44,7.22],[.40,5.4]]];
  const legC = her ? '#2E3140' : '#2B2D36';
  c.save(); c.globalAlpha *= A * (o.legA ?? 1);
  L.forEach(P => { c.fillStyle = legC; pathOf(c, B(P), true); c.fill(); });
  if (her) { c.fillStyle = col; pathOf(c, B(through([[-.42,3.4],[.86,3.4],[.98,4.5],[-.50,4.5]], 2)), true); c.fill(); }   // short skirt hem continues the sweater
  c.restore();
}
