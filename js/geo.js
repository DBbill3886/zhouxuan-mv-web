/* geo.js — shared character geometry (used by the offline p5.brush baker AND the live renderer).
   Head units, facing right, head top y=0, chin y=1. One geometry → watercolour sprite, live ink lines, Riso silhouette. */
'use strict';
const FIG = {
  her: {
    face: [[.745,.37],[.735,.44],[.748,.52],[.80,.625],[.775,.665],[.768,.695],[.786,.738],[.768,.768],[.78,.798],[.745,.855],[.738,.915],[.66,.975],[.55,1.0],[.535,1.10],[.555,1.30]],
    hair: [[.60,.06],[.70,.13],[.755,.24],[.765,.37],[.66,.375],[.58,.38],[.52,.44],[.47,.58],[.49,.76],[.50,.93],[.30,.95],[.08,.93],[-.02,.80],[-.04,.55],[.0,.30],[.10,.10],[.28,-.02],[.45,-.03]],
    neckBack: [[.26,.93],[.25,1.08],[.21,1.28]],
    eyeU: [[.598,.497],[.626,.480],[.656,.477],[.690,.494]],
    eyeL: [[.614,.516],[.646,.521],[.678,.509]],
    iris: [.662,.492,.021],
    brow: [[.605,.448],[.648,.436],[.692,.444]],
    body: [[.20,1.20],[.25,1.13],[.555,1.16],[.60,1.30],[.70,1.42],[.84,1.62],[.90,2.1],[.92,3.7],[-.50,3.7],[-.46,2.3],[-.40,1.68],[-.22,1.40],[-.02,1.28]],
    seam: [[.36,1.62],[.30,2.3],[.24,3.0],[.22,3.7]],
    collar: [[.25,1.13],[.40,1.19],[.555,1.16]],
  },
  him: {
    face: [[.66,.20],[.73,.29],[.76,.40],[.738,.47],[.762,.535],[.84,.65],[.79,.69],[.782,.715],[.796,.752],[.778,.782],[.788,.812],[.76,.87],[.77,.95],[.67,1.0],[.53,1.0],[.52,1.12],[.55,1.32]],
    hair: [[.66,.22],[.70,.12],[.62,.02],[.46,-.05],[.26,-.04],[.10,.06],[.02,.24],[.02,.46],[.10,.62],[.20,.64],[.24,.52],[.36,.44],[.48,.40],[.56,.30]],
    ear: [[.42,.49],[.375,.495],[.355,.56],[.38,.625],[.425,.63]],
    neckBack: [[.20,.66],[.22,.95],[.20,1.25]],
    eyeU: [[.606,.492],[.634,.476],[.664,.474],[.699,.490]],
    eyeL: [[.620,.511],[.652,.516],[.686,.504]],
    iris: [.669,.489,.020],
    brow: [[.602,.428],[.655,.414],[.712,.424]],
    body: [[.10,1.22],[.30,1.06],[.47,1.10],[.62,1.24],[.70,1.44],[.92,1.66],[1.02,2.2],[1.06,3.7],[-.62,3.7],[-.58,2.3],[-.50,1.66],[-.30,1.40],[-.08,1.30]],
    collar: [[.30,1.06],[.40,1.30],[.52,1.42],[.62,1.24]],
    lapel: [[.52,1.42],[.66,1.64],[.74,1.95]],
    seam: [[.34,1.70],[.28,2.4],[.22,3.1],[.20,3.7]],
  },
};
// polygons used for sprites
function skinPoly(G) { return [...G.face, ...G.neckBack.slice().reverse(), [.08, .5], [.3, .02], [.6, .08]]; }
// sprite boxes in head units [x0, y0, w, h] and bake scale (px per head unit)
const SPR_BOX = { skin: [-.15, -.1, 1.05, 1.5], hair: [-.15, -.15, 1.0, 1.2], body: [-.75, 1.0, 1.9, 2.75] };
const SPR_SCALE = { skin: 560, hair: 560, body: 380 };
// Catmull-Rom through points, n samples per span
function through(P, n = 6) {
  if (P.length < 3) return P.slice();
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const u = k / n, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(d => .5 * (2 * p1[d] + (p2[d] - p0[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * u3)));
    }
  }
  out.push(P[P.length - 1]);
  return out;
}
// closed version (wraps around)
function throughClosed(P, n = 6) { const m = P.length, Q = [P[m - 1], ...P, P[0], P[1]]; const C = through(Q, n); return C.slice(n, C.length - n - 1); }
// affine figure transform as matrix [a,b,c,d,e,f] (unit → screen): head centre (.45,.5) at (x0,y0), s px/unit, dir ±1, tilt about neck pivot (.40,1.15)
function figMatrix(x0, y0, s, dir = 1, tilt = 0) {
  const th = tilt * dir, c = Math.cos(th), sn = Math.sin(th);
  const px = (.40 - .45) * dir * s, py = (1.15 - .5) * s;
  // p' = R*(S*(u - (.45,.5)) - P) + P + (x0,y0), S = diag(dir*s, s)
  const a = c * dir * s, b = sn * dir * s, cc = -sn * s, d = c * s;
  const tx = x0 + px + (-c * px + sn * py) - (a * .45 + cc * .5);
  const ty = y0 + py + (-sn * px - c * py) - (b * .45 + d * .5);
  return [a, b, cc, d, tx, ty];
}
const mApply = (m, [x, y]) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
if (typeof module !== 'undefined') module.exports = { FIG, through, throughClosed, figMatrix, mApply, skinPoly, SPR_BOX, SPR_SCALE };
