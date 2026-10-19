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
  if (!o.lineOnly) drawSprite(sk, 'skin', mh, o.skinTint || o.tint, A);
  if (!o.noBody) {
    if (!o.lineOnly) drawSprite(bd, 'body', mb, o.tint, A);
    const BO = throughClosed(G.body, 4).filter(p => p[1] < 3.6);
    ink(B(BO), w * .8, { col: lc, key: k + 'body', smooth: 0, taper: [.05, .05], alpha: A });
    ink(B(G.seam), w * .5, { col: lc, key: k + 'seam', alpha: A });
    if (G.lapel) ink(B(G.lapel), w * .55, { col: lc, key: k + 'lapel', alpha: A });
    ink(B(G.collar), w * .65, { col: lc, key: k + 'collar', alpha: A });
  }
  if (!o.lineOnly) drawSprite(hr, 'hair', mh, o.hairTint, A);
  // hair: a few lighter strands give it flow and sheen (live ink, low contrast)
  if (G.strands && !o.lineOnly) G.strands.forEach((P, i) => ink(H(P), w * (.5 - i * .08), { col: mixCol(ZX.ink, '#8E9BB3', .55), key: k + 'str' + i, alpha: A * .55, taper: [.6, .7] }));
  if (G.lips && !o.lineOnly) { const q = mApply(mh, [G.lips[0], G.lips[1]]), r = G.lips[2] * s, c = X.ctx; c.save(); pathOf(c, H(throughClosed(skinPoly(G), 4)), true); c.clip(); c.globalAlpha *= A * .45; c.fillStyle = ZX.coral; c.beginPath(); c.ellipse(q[0] - dir * r * .3, q[1], r * 1.1, r * .9, 0, 0, TAU); c.fill(); c.restore(); }
  ink(H(G.face), w, { col: lc, key: k + 'face', alpha: A, smooth: 4 });
  ink(H(G.neckBack), w * .8, { col: lc, key: k + 'nb', alpha: A });
  if (G.ear) ink(H(G.ear), w * .55, { col: lc, key: k + 'ear', alpha: A });
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
